# ADR 0020: Optimalizace simulační smyčky, bezalokační správa entit a eliminace záseků renderovací pipeline

## Kontext

Během intenzivních fází výprav naráželi hráči na mikro-zadrhávání (micro-stuttering) a propady snímkové frekvence v aréně. Detailní profilace a analýza simulační smyčky v `src/App.tsx` odhalily, že příčinou není samotná 2D Canvas grafika, ale kumulace architektonických nedostatků v simulační smyčce a renderovací pipeline:

1. **Chybné pořadí aktualizace prostorového indexu (`SpatialHash`):** Přebudování indexu (`enemySpatialHash.rebuild`) probíhalo až na konci snímku po vyhodnocení útoků a kolizí. Zbraně a projektily tak testovaly kolize proti včerejším souřadnicím monster a již poraženým nepřátelům.
2. **Přepisování sdíleného bufferu při vnořených dotazech do `SpatialHash`:** Dotazy na okolí při zásazích a řetězových reakcích sdílely tentýž výstupní buffer, což vedlo k přepisování pole uprostřed vnější iterace nebo k masivním alokacím nových polí (přes 5 000 polí/s).
3. **Kvadratická složitost $O(N^2)$ a lineární vyhledávání:** Efekt Rozbroje bubáků (`brawlTimer`) porovnával každého nepřítele s každým přes `Math.hypot`, v každém snímku se provádělo lineární vyhledávání 7 bossů v `engine.enemies` a opakovaně se procházel seznam zbraní hráče.
4. **Vysoký GC tlak v Hot Path:** Třída `DamageText` (155 nespravovaných volání `texts.push`), `SmokePuff` (25 alokovaných objektů a 4 pole na každý oblak) a volání `Array.prototype.splice(0, n)` na polích částic a textů generovaly desítky megabytů krátkodobých objektů na haldě, což vyvolávalo 10–40ms záseky Garbage Collectoru.
5. **Synchronní zásek (Freeze) při přechodu do soumraku:** Třída `ChunkBitmapCache` při změně denní fáze z odpoledne do soumraku (`isNight = true`) smazala všechny vygenerované bitmapy dlaždic a synchronně v jediném snímku překreslila celou mapu (včetně roubenek, Božích muk a stromů).
6. **Vektorový fallback u slovních bojových textů s emoji:** Atlas glyfů (`GlyphAtlas`) podporoval pouze číslice a znaménka. Časté texty s emoji (`'ŠVIH!'`, `'1/3 🥒'`, `'Ňam, ňam'`, `'SVATÁ ZKÁZA!'`) tak neustále zaměstnávaly CPU vektorovou rasterizací přes `ctx.strokeText` a `fillText`.
7. **React re-rendery uprostřed boje:** Volání `syncGameEffectSettings(meta)` v těle komponenty a manipulace se stavem `warningBanner` přes `setRunStats` a `setTimeout` vyvolávaly re-render React stromu v nejnáročnějších momentech soubojů.

## Rozhodnutí

### 1. Fázování implementace do tří samostatných milníků
Pro minimalizaci rizika rozbití herní grafiky a logiky je implementace rozdělena do 3 kroků:
* **Milník 1 (Quick Wins & Simulační smyčka):** Oprava pořadí `SpatialHash.rebuild`, dvoustupňový prostorový dotazovací buffer, centralizovaná bezalokační metoda `addCombatText`, odstranění React re-renderů z `warningBanner` a `distanceSq` pro dropy a projektily.
* **Milník 2 (Zero-Allocation & Render optimalizace):** Object Pool pro `SmokePuff` a projektily, kruhový buffer pro částice a texty, optimalizace `SmokePuff.draw()` (seskupení cest a redukce `save/restore` na 2 volání) a dynamická mezipaměť štítků (`WordStampCache`) v `GlyphAtlas`.
* **Milník 3 (Architektonické dokončení renderovací pipeline):** Doplnění chybějících vrstev (dropy, střely, seknutí, částice, posvěcená křída, telegrafy bossů) do `src/render/` a následné plné zapojení `arenaRenderer.ts` do `src/App.tsx`.

### 2. Správné pořadí simulační smyčky a dvoustupňový prostorový index
- Pohyb nepřátel (`e.update`) a následný `enemySpatialHash.rebuild(livingEnemies)` se přesouvají na začátek vyhodnocovacího kroku bezprostředně za pohyb hráče.
- Zbraně, aury, projektily a seknutí tak vždy testují kolize proti aktuálním pozicím a výhradně živým nepřátelům.
- Zavádí se striktní hierarchie prostorových výsledků:
  - `primarySpatialResultsRef`: výhradně pro vnější smyčky entit (trajektorie střel, zásahové zóny seknutí).
  - `secondarySpatialResultsRef`: pro vnořené sekundární efekty (plošná zranění, řetězení blesků, `brawlTimer`, `pivni_tacek`).
- Vyhledávání cílů při Rozbroji bubáků (`brawlTimer`) se nahrazuje dotazem do `SpatialHash` v okruhu 250 jednotek s porovnáváním čtverce vzdálenosti.

### 3. Bezalokační správa Bojových plovoucích textů (`addCombatText`)
- Zavedena centralizovaná metoda `addCombatText(engine, x, y, text, color, big, category, targetEnemy?)`.
- **Slévání čísel zranění:** Pokud je předán `targetEnemy` a jde o číselnou hodnotu, vyhledá se existující text `targetEnemy._activeCombatText`. Pokud je stále aktivní (`life > 0.15`), přičte se zranění přes `existingText.addAmount(dmg)` a text se posune nad cíl bez alokace nového objektu.
- **Včasné potlačení vypnutých kategorií:** Pokud hráč v nastavení vypnul danou kategorii bojových textů (`isCombatTextCategoryEnabled(cat) === false`), metoda okamžitě končí bez práce pro Garbage Collector.
- **Kruhový recyklační buffer:** Pole `engine.texts` se fixuje na maximálně 40 instancí, při zaplnění dochází k přepsání nejstaršího prvku v čase $O(1)$ namísto posunu pole přes `splice(0, n)`.

### 4. Oddělení nočního svícení od `ChunkBitmapCache`
- Statická mezipaměť dlaždic (`ChunkBitmapCache`) se stává 100% neměnnou po celou dobu trvání výpravy.
- Noční žlutý svit oken roubenek a záře svící Božích muk se vyjímají ze statických dlaždic a kreslí se jako lehká dynamická vrstva v rámci světelného průchodu (`renderStorybookLightingComposite`).
- Tím se zcela eliminuje synchronní volání `ChunkBitmapCache.build()` při přechodu z odpoledne do soumraku.

### 5. Dynamická mezipaměť štítků pro slovní texty a emoji (`WordStampCache`)
- Třída `GlyphAtlas` je rozšířena o dynamickou mezipaměť hotových štítků pro libovolné texty a emoji (např. `'ŠVIH!'`, `'1/3 🥒'`, `'Ňam, ňam'`, `'PŘEJEDENÍ! 🥒'`, `'SVATÁ ZKÁZA!'`).
- Text je při prvním zobrazení jednorázově vyrenderován do malého offscreen plátna s Ladovskou tušovou konturou.
- Následné vykreslování probíhá bleskovým `ctx.drawImage` bez zatížení CPU vektorovou rasterizací. Kapacita mezipaměti je omezena na 128 štítků a je platná pro dobu jedné Výpravy.

### 6. Přesun stavu varovných bannerů do enginu a eliminace React re-renderů
- Do `EngineState` se doplňují pole `engine.warningBannerText` a `engine.warningBannerTimer`.
- Odstraněna veškerá volání `setRunStats` a `setTimeout` ze simulační smyčky při příchodu bossů.
- Zprávy se do React HUDu přenášejí výhradně v rámci pravidelného 150ms tiku `HUD_SYNC_INTERVAL_SECONDS`.
- Volání `syncGameEffectSettings(meta)` je zapouzdřeno do `useEffect([meta])`.

## Důsledky

- **Plynulost hry:** Dosaženo stabilních 60 FPS i při masivních vlnách nepřátel a intenzivním boji; úplné vymizení 10–40ms záseků Garbage Collectoru.
- **Konzistence fyziky a detekce kolizí:** Odstraněna kolizní latence jednoho snímku; střely a seky okamžitě zasahují nepřátele na jejich skutečných pozicích.
- **Nulový propad při soumraku:** Příchod noci a líhnutí bosse probíhá naprosto hladce bez synchronního znovugenerování mapy.
- **Zachování vizuálního stylu:** Ladovský výtvarný styl, tušové kontury a kvašová atmosféra zůstávají stoprocentně zachovány.
