# Bubákov — Changelog

## 2026-10-10 — Dynamická obtížnost, posílení Režiséra výpravy a volič v herním menu

- **Posuvník Dynamická obtížnost v nabídce hry:**
  - Přidán interaktivní posuvník v předstartovní nabídce výpravy (`App.tsx`) i v nastavení hry (`ControlsModal.tsx`) s 5 stupni od 1.00× po 2.00× (krok 0.25).
  - Výchozí nastavení nastaveno na maximum: **2.00× – Pekelná štvanice (Výchozí / Max)** s perzistentním uložením do profilu hráče (`meta.dynamicDifficulty`).
  - Stupně obtížnosti: 1.00× Běžná výprava, 1.25× Neklidné povětří, 1.50× Zlověstná noc, 1.75× Divoká štvanice, 2.00× Pekelná štvanice.
- **Aktivní Režisér výpravy a eliminace hluchých míst:**
  - **Drtivý přepad:** Po zachování 3.5sekundové fáze Oddychu (`lull`) Režisér zformuje masivní protiúder se dvěma obrněnými Přepadovými veliteli a obkličujícím rojem s úvodním zrychlením (+20 %) a odolností proti odhození (poise) na 3.5 s.
  - **Zrádný terén:** Sledování vektoru pohybu lovce – při vytrvalém jednosměrném běhu či kroužení (> 3.5 s) Režisér klade 250 px před hráče zpomalující zóny (bláto / led) trvající 4 s (-25 % rychlost, cooldown 5 s).
  - **Klešťové sevření:** Taktické líhnutí útočných hlídek z protilehlých úhlů zamezující snadnému kroužení po obvodu.
  - **Ostřílení běsi (Ochrana 60 FPS při 75 entitách):** Při dosažení limitu 75 živých monster investuje Režisér přebytečný rozpočet hrozeb do povýšení stávajících strašidel (+40 % poise resist, zrychlení na 155 px/s) namísto nečinnosti.
  - **Škálovaná asistence:** Asistence Režiséra při poklesu Kuráže pod 50 % zpomaluje přísun hrozeb na maximální obtížnosti 2.00× pouze o 25 % (oproti 50 % na základu 1.00×), čímž udržuje neustálý bojový tlak.
- **Doménový model a dokumentace:**
  - Založen záznam architektonického rozhodnutí `docs/adr/0005-dynamicka-obtiznost-a-reziser-vypravy.md`.
  - V `GLOSSARY.md` zapsány kanonické pojmy: *Dynamická obtížnost*, *Ostřílení běsi*, *Klešťové sevření*, *Zrádný terén*, *Drtivý přepad*.
- **Testy a kompatibilita:**
  - Rozšířena testovací sada `tests/runDirector.test.ts` o 6 nových testů pokrývajících škálování rozpočtu, Drtivý přepad, Zrádný terén, Ostřílené běsy a asistenci (všech 154 testů v projektu prochází, `tsc && vite build` bez chyb).

## 2026-10-10 — Vyvážení a harmonizace hospodských vylepšení, Obecní přirážka a Zoufalá kuráž

- **Obecní přirážka (Sdílené zdražování vesnice):**
  - Zaveden vzorec ceny se sdílenou přirážkou za rozvoj vsi: každá zakoupená úroveň jakékoliv budovy zvýší cenu všech dalších nákupů o +15 % základní ceny.
  - Odstupňovány základní ceny budov do 3 úrovní (30 / 50 / 75 krejcarů) podle dopadu na hru.
  - Úrovně jsou neomezené s bezpečnými asymptotickými stropy pro obranné a časové efekty (redukce zranění max 50 %, nezranitelnost z lektvaru max 5 s, odolnost proti zpomalení max 80 %).
- **Vrácení krejcarů (100% bezplatný respec):**
  - Deterministický výpočet hodnoty investovaných krejcarů `calculateTotalVillageInvested` umožňující kdykoliv bezplatně vyrovnat obecní účet a přerozdělit úspory.
  - Do záhlaví hospody U Černého kocoura přidán informační panel rozvoje vsi s procentem přirážky a tlačítkem `🔄 Vrátit krejcary`.
- **Harmonizace 12 budov a folklórní pomocníci:**
  - Všech 12 budov důsledně sjednoceno na Ladovský motiv zkrocených strašidel pomáhajících vesničanům (rarášci, hastrmani, divoženky, diblíci, ohniví mužíci, klekánice, bezhlaví furianti, bludičky).
  - Odstraněna dřívější duplicita pivovarských ležáků; regenerace Kuráže sjednocena v Bylinkové zahrádce (+2 Kuráže / 5 s za úroveň).
- **Nové herní efekty:**
  - **Perníková vůně (Pekárna):** +10 % za úroveň k hodnotě všech sebraných Perníčků.
  - **Poklady starých časů (Hřbitovní brána):** +10 % za úroveň k hodnotě Krejcarů a +1 % šance za úroveň na vypadnutí stříbrného tolaru z nepřítele.
  - **Zoufalá kuráž (Šenkýřova kuráž):** Při poklesu Kuráže pod 35 % aktivuje lovec +15 % poškození za úroveň a jantarovou Ladovskou auru s plovoucím textem `🍺 ZOUFALÁ KURÁŽ!`.
- **Doménový model a dokumentace:**
  - Založen záznam architektonického rozhodnutí `docs/adr/0004-hospodska-ekonomika-a-obecni-prirazka.md`.
  - Do `GLOSSARY.md` zapsány kanonické pojmy: *Obecní přirážka*, *Vrácení krejcarů*, *Zoufalá kuráž*.
- **Testy a lokalizace:**
  - Nová testovací sada `tests/villageEconomy.test.ts` (6 testů, ověřeno všech 142 testů v projektu).
  - Kompletní aktualizace CZ/EN lokalizací v `cs.ts` a `en.ts`.

## 2026-10-10 — Integrace Úrovně 0 (Předjaří), synergických upgradů zbraní, Mariáše ďáblů a responzivního HUDu

- **Úroveň 0: Předjaří v Hrusicích (Tutorial & Prologue):**
  - Rozšířen typ `GameLevelId` na `0 | 1 | 2 | 3 | 4 | 5 | 6` v `types.ts`.
  - Zavedena definice úrovně v `levels.ts` a výchozí odemčení v `levelUnlocks.ts`.
  - Nový herní obsah: protivníci Probuzená žába, Jarní vodníček a boss Vodník z tajících ker (Hastrman) s mechanikou Březnové povodně.
  - Simulace a vykreslování jarních překážek: interaktivní plující kry (`ice_floe`), roztočená dřevěná káča (`kaca`), babiččina kachlová kamna (`granny_stove`) a skály (`rock`).
  - Atmosférické pozadí `spring_river` a počasí `ice_drift` (tání ker s tušovými konturami).
  - 3 folklórní rozmary pro Předjaří v `runArchetypes.ts`: Rychlé Tání, Jarní Probuzení, Březnový Chlad.
  - Kompletní CZ/EN lokalizace v `cs.ts` a `en.ts`.
  - Nová testovací sada `tests/level0Predjari.test.ts`.
- **Synergické upgrady zbraní (`synergisticUpgrades.ts`):**
  - Vytvořen datový model synergických variant zbraňových upgradů pro herní archetypy (swarm, burst, tempo, heavy).
  - Aplikace variant v enginu (`upgradeWeapon` a `applySynergisticUpgrade` v `engine.ts`).
  - Podpora výpočtu statistik v `weaponMilestones.ts` včetně násobitele projektilů (`projectileCountMult`).
  - Nová testovací sada `tests/synergisticWeaponUpgrades.test.ts`.
- **Mariáš ďáblů pro Čerta (`boss-engine-update`):**
  - Do souboje s pekelným Čertem v `App.tsx` začleněna mechanika tažení mariášových karet (Srdce – léčení/plamenný kruh, Kule – vějíř střel, Listy – vyvolání sazových rarášků, Žaludy – zuřivý výpad).
  - Časovač `certMariashCd` registrován ve stavu enginu (`engineState.ts`).
- **Responzivní Boss HUD (`index.css`):**
  - Varovný banner `#boss-warning-banner` a lišta `#boss-bar-wrap` upraveny pro bezpečné zalamování a responzivní zobrazení na mobilních zařízeních (`max-width: 768px`).
- **Doménový model a úklid větví:**
  - V `GLOSSARY.md` zapsány kanonické pojmy *Mariáš ďáblů* a *Synergický upgrade*.
  - Ponecháno Ladovské kvašové svícení dle ADR 0003; starší generic modul dynamického svícení odmítnut.
  - Větve `retire-standalone`, `sync-production-cleanup-zip` a `new-food-weapons` potvrzeny jako plně absorbované.

## 2026-10-10 — Ladovské kvašové svícení (Storybook Illumination System)

- **Ladovská kvašová renderovací pipeline (`storybookLightingRenderer.ts`):**
  - Implementována kompozitní vrstva světla s předrenderovanými kvašovými stupni (3–4 tonální pásy) a procedurálním tušovým tečkováním/šrafováním na okrajích namísto digitálního rozostření.
  - Dynamické tónování zimního sněhu podle denních fází: idylická smetanová běloba v poledním slunci (`#FFFDF5`), romantické pastelové indigo za soumraku a v noci (`#433858` až `#171A31`), a oslepující mrazivý zákal s roztřesenými tušovými konturami při kritické Kuráži (< 25 %).
  - Zavedena **Pohádková inverze siluet** (`silhouetteInvertTimer`): zasažení svěceným světlem či zábleskem přepne kontury na 2–3 snímky do křídově bílých dřevoryteckých vrypů (`#FFFBEB`).
- **Herní mechaniky světla a stínu (`storybookLighting.ts`):**
  - **Petrolejka lovce:** Mosazná lampa v ruce lovce s doshem škálovaným podle **Kuráže** (až 225 px); při kritické Kuráži plamínek mihotavě skomírá do tísnivé viněty, v poledním slunci Petrolejka spočívá na opasku.
  - **Stínová záštita Bubáka a nočních strašidel (`category: "shadows"`):** Ve tmě a stínu budov získávají strašidla +35 % rychlost, 40 % odolnost proti zranění a tušový kouř. Při vyhnání na světlo záštita praská s 0,25s zavrávoráním, +25% zranitelností a sprškou tušových kaněk (`ink_specks`).
  - **Bludička močálová:** Éterická azurově-fialová záře maskující varovné obrysy pozemních nástrah a vábící okolní nemrtvé k lovci s +15% rychlostním bonusem.
- **Dynamická světla zbraní a prostředí:**
  - **Osikový prut:** Švihnutí vytváří nebesky modrý oblouk prosvěcující tmu na 0,4 s.
  - **Svěcené předměty & Hromnička:** Katedrální sluneční sloupy zanechávající zářící stopy na 3,5 s.
  - **Česneková topinka & Dědeček:** Hřejivá máslová aura plotny s praskajícími jiskrami.
  - **Pekelný Čert:** Sirná a šarlatová záře rohů a kopyt zanechávající žhnoucí uhlíky.
- **Rozšíření architektury map:**
  - Zvýšené zastoupení **Roubenek** v generátoru dekorací arény: v noci vrhají máslově žluté lichoběžníky s tušovými okenními kříži na sníh, ve dne vrhají stíny pro Bubáky.
  - Zavedena **Boží muka** se zapálenou svící u polních cest jako noční orientační a bezpečné body.
  - Dědečkova **Kachlová kamna** s trvalým hlubokým oranžovým žárem pece odhánějícím strašidla.
- **Doménový model a dokumentace:**
  - Vytvořen záznam architektonického rozhodnutí `docs/adr/0003-ladovske-kvasove-sviceni-a-kompozitni-vrstva-svetla.md`.
  - Do `GLOSSARY.md` doplněny kanonické pojmy: *Petrolejka*, *Kvašová záře*, *Stínová záštita*, *Roubenka*, *Boží muka*, *Kachlová kamna*.
- **Plná verifikace:**
  - Všech 122 testů v 11 testovacích souborech ve Vitestu úspěšných (nové testy `storybookLighting.test.ts` a `gameEngineLighting.test.ts`).
  - Produkční sestavení `npm run build` (`tsc && vite build`) bez jediné chyby.

## 2026-10-10 — Stabilizace integračního stagingu a Ladovská harmonizace

- **Oprava pádu a plné napojení Režiséra výpravy (`RunDirector`):**
  - Implementován robustní adaptér pro `RunDirector.step` v `App.tsx` s podporou `spawnMonster` a `spawnScatterDrop`.
  - Každé zrození nepřítele (běžné vlny, minibossové i taktické přepadové skupiny) je nyní automaticky a přesně zaznamenáno v `recordEnemySpawn`, což zaručuje správný výpočet TTK a dynamické obtížnosti.
  - Vykresleny arénové pasti (`ArenaHazard` — louže bláta, oheň, mráz) a **Bubácká díra** (`BubackaDira`) s kruhovým odpočtem pečetění a vlivem na pohyb hráče.
- **Oprava procedurální Ladovské kinematiky nepřátel:**
  - `drawEnemyRenderer` v `ladaRenderer.ts` nyní transparentně rozpoznává nápřah (`windupTimer`, `aiState === 'windup'`) a úder (`strikeTimer`), čímž se v `App.tsx` poprvé v plné kráse aktivují animace otřesů, náklonů, podkresového prachu a siluet zbraní.
- **Odstranění race condition u Milníků zbraní:**
  - Zaveden `pendingMilestonesRef`, který zabraňuje přepsání stavu `'milestone'` starou uzávěrou po roztočení Malované truhly či nákupu u Čertova dědečka.
- **Sjednocení doménové terminologie a ADR:**
  - Zapsán termín **Bubácká díra** a **Slévání perníčků** do `GLOSSARY.md`.
  - Aktualizován záznam `docs/adr/0001-phased-game-engine-integration.md` pro pravdivý stav Phase-1 Adaptéru.
  - Zapsáno nové architektonické rozhodnutí `docs/adr/0002-konsolidace-rezisera-a-ramec-vykonu.md`.
  - Vyčištěny zakázané výrazy (*mince*, *perků*) v `ControlsModal.tsx`, `hunterUnlocks.ts`, `village.ts` a `KronikaChanges.tsx`.
- **Optimalizace výkonu a konsolidace běhové smyčky (60 FPS stabilizace):**
  - Duplicitní vlnový spawner v `App.tsx` deaktivován; líheň strašidel řízena výhradně Režisérem výpravy (`RunDirector`) s hard-capem 70 monster (45 v Performance Mode) a napojením na denní fáze úrovně.
  - Okamžitá volání `setRunStats` ze smyčky odstraněna; ukazatele se synchronizují dávkově každých 150 ms (`HUD_SYNC_INTERVAL_SECONDS`), čímž se eliminovalo zasekávání Reactu.
  - Aktivováno **Slévání perníčků** (`performDropFusion`) každých 1,5 s se stropem 200 položek mimo obrazovku.
  - Odstraněno přepínání `ctx.globalCompositeOperation = 'source-atop'` a alokace `ctx.getTransform()` v `drawEnemyWarningSign`.
  - Radiální gradienty mlhy předrenderovány do offscreen plátna a částice kresleny v jedné dávce bez individuálních `save/restore`.
  - Plovoucí texty poškození zastropovány na 40 instancí s kumulativním sčítáním rychlých vícečetných zásahů a dávkovým nastavením fontu.
  - Samonavádění včel přepnuto na vyhledání nejbližšího cíle přes `SpatialHash` s přirozenou hmyzí vlnivou trajektorií a ochranou re-entrancie přes `queryCircleInto`.

## 2026-10-09 — Integrační staging: Propojení enginu, sjednocení rendereru a plné ověření

- **Propojení modulárního subsystému do App.tsx:**
  - Napojen Režisér výpravy (`RunDirector`) pro dynamické varovné bannery, pacing fází a sledování TTK a spawnu monster.
  - Implementován herní stav `'milestone'` a zapojena komponenta `WeaponMilestoneModal` pro interaktivní volbu schopností při postupu na milníkové ranky (3, 5 a 8).
  - Použita migrace profilu `migrateMetaProgression` pro automatický převod historických uložených dat na kanonická ID zbraní (`osikovy_prut`, `povidlove_buchty`, `hromnicka`).
- **Sjednocení vykreslování v `ladaRenderer.ts` a `App.tsx`:**
  - Odstraněna duplicitní transformace plátna v `App.tsx`; monstra jsou předávána přímo do `drawEnemyRenderer`.
  - Zapojena moderní Ladovská kinematika (`computeEnemyKinematics`), podkresové prachové stopy, otřesy těl a zbraňové siluety.
  - Zachována specifická větvení pro hlavní bossy (`drak`, `cert`, `mlynar`).
- **Dědečkův obchod (`GrandfatherShop.tsx`):**
  - Normalizována ID zbraní přes `toCanonicalWeaponId`.
  - Přidán dynamický náhled milníků zbraní z `weaponMilestones.ts` a zařazování voleb do fronty (`pendingMilestones`).
  - Doplněna vizualizace vesnické synergie pro Kapli svaté vlny (`churchLevel`).
- **Architektonická dokumentace a slovník:**
  - Založen `GLOSSARY.md` s kanonickou terminologií (*Kuráž*, *Nápřah*, *Milník zbraně*, *Perníčky*, *Krejcar*, *Čertův dědeček*, *Režisér výpravy*).
  - Zapsán záznam architektonického rozhodnutí `docs/adr/0001-phased-game-engine-integration.md`.
- **Plná verifikace prostředí:**
  - `vitest run`: 9 testovacích souborů, všech 104 testů úspěšných.
  - `tsc --noEmit`: 0 chyb, typy `DropType` a zbraní sjednoceny.
  - `eslint .`: konfigurace `eslint.config.js` vytvořena, lint čistý.
  - `npm run build`: produkční bundle Vite úspěšně sestaven.

## 2026-10-08 — Rebalanc startovních zbraní (Level 1) & Benchmark systém

- **Osikový prut (Poutník) posílen na plnohodnotný úderný bič:**
  - Základní poškození zvýšeno z 18 na **28** (+55 %), cooldown zkrácen z 0,80 s na **0,65 s** (teoretické DPS stouplo z 22,5 na **43,1 DPS**).
  - Dosah seku (Reach) rozšířen z 88 px na **115 px** (vytvoření bezpečné 60px zóny před 40px attack dosahy monster), úhel seku rozšířen z 1,55 rad (~89°) na **2,00 rad (~115°)** pro spolehlivé krytí čela i boků.
  - Odhoz zvýšen z 260 na **480** a přidán mikro-flinch (zásah okamžitě zruší rozběhnutý nápřah útočníka `isAttacking = false; windupTimer = 0`).
- **Povidlové buchty (Pasáček) zkroceny na taktickou rozptylovací zbraň:**
  - Počet střel na 1. úrovni snížen z 3 na **1 buchtu** (další střely přibývají s vyšší úrovní: 2 na Lvl 3, 3 na Lvl 5, 4 na Lvl 7).
  - Poškození upraveno na **22**, cooldown na **1,25 s** (teoretické DPS kleslo z 50,0 na **17,6 DPS**).
  - Doba mlsání (Snack) zkrácena z 3,0 s na **1,8 s** a zaveden strop na kumulativní trvání (max. 2,5 s) zabraňující nekonečnému perma-stunu.
- **Česneková topinka proměněna v aktivní obrannou auru:**
  - Základní poškození zvýšeno z 1 na **5** každých 0,35 s (DPS stouplo z 2,86 na **14,3 DPS**).
  - Rarášek (48 HP) je v auře udusen za 3,3 s namísto dřívějších 16,8 s.
  - Odhoz mírně upraven na 300 a přidáno základní 15% zpomalení nepřátel v dosahu.
- **Válečnice vyvážena do mezí startovního rozpočtu (Level 1 Melee Guardian):**
  - Základní poškození upraveno z 52 na **32**, cooldown nápřahu zvýšen z 0,48 s na **0,75 s** (DPS zredukováno ze 108,3 na **42,7 DPS**).
  - Trvání omráčení upraveno z 3,0 s na **1,2 s**, odhoz upraven ze 760 na **520**.
  - Zpomalovací aura na Lvl 1 nastavena na **25 %** (škáluje na 40 % s vyššími hodnostmi a milníky).
- **Zaveden standardizovaný Benchmark (`scripts/benchmark-weapons.ts`):**
  - Implementován deterministický testovací simulátor na 60 FPS enginu pro měření TTK, minimálního odstupu od hráče, průlomu obrany, efektivního DPS a CC času.

## 2026-10-08 — Stabilita běhového prostředí: Oprava duplicitních instancí Reactu ve Vite

- **Garantovaná jediná instance Reactu (Deduplikace závislostí):**
  - Do `vite.config.ts` přidána konfigurace `resolve.dedupe: ['react', 'react-dom']` a `optimizeDeps.include: ['react', 'react-dom', 'react-dom/client']`.
  - Odstraněna chyba `Invalid hook call / TypeError: Cannot read properties of null (reading 'useRef')`, způsobená nesouladem verzí v mezipaměti předkompilovaných modulů Vite.
  - Pročištěna cache prebundlingu a restartován vývojový server s jednotným hashováním.

## 2026-10-08 — Odveta lovců na blízko: Odstrčení bubáka a protiúder za 15 % maximální Kuráže

- **Automatické odstrčení útočníka na blízko (Melee Pushback):**
  - Každý lovec po utrpění zranění na blízko od bubáka nestvůru okamžitě energicky odstrčí pryč ze své bezprostřední blízkosti (okamžitý fyzický posun o 65 px + impuls síly 540).
  - Tím se přeruší zacyklený nápřah nestvůry a hráč získá prostor k manévrování.
- **Zranění rovné 15 % maximální Kuráže lovce:**
  - Lovec při odstrčení udělí bubákovi protiúder, který odpovídá přesně **15 % maximální Kuráže lovce** (např. 30 zranění při výchozích 200 Kuráže, 45 zranění při 300 Kuráže po nákupech a vylepšeních).
- **Ignorování rezistencí (kromě bossů úrovně):**
  - U běžných monster, elit i minibossů rezistence proti tomuto protiúderu ani odhození nefungují — monstra utrpí plných 15 % max Kuráže a jsou plně odstrčena.
  - Výjimkou jsou pouze **hlavní bossové úrovně** (`e.isBoss`), u nichž jejich tuhost (poise) a odolnosti fungují standardně.

## 2026-10-08 — Přímé promítnutí násobitelů do základního zranění nepřátel a posílení pomalých útoků na 3,5×

- **Pomalí nepřátelé posíleni na 3,5× násobek:**
  - Pro těžké pomalé nepřátele a bosse (`umrlec`, `bubak`, `hromotluk`, `stodolnik`, `drevorubec`, `drab`, `zbrojnos`, `obrneny_zbojnik`, `snehulak`, `ohnivy_pes`, `cert`, `hejkal`, `obr`, `mlynar`, `bezhlavy_rytir`, `drak`) byl násobitel poškození zvýšen z dřívějších 2,9× na **3,5× násobek**.
- **Přímý zápis do základních statistik bez separátního rozepisování:**
  - Veškeré násobky poškození (1,0× pro rychlé, 2,2× pro normální a 3,5× pro pomalé) již nejsou počítány jako samostatná dodatečná přirážka ani rozepisovány v popiscích (odstraněny separátní texty `+120 %` a `+190 %`).
  - Místo toho byly násobky **přímo a trvale promítnuty do základní hodnoty `damage`** každého ze 49 nepřátel v databázi `ENEMIES`.
  - Herní engine (`createEnemyInstance`) nyní přebírá toto základní poškození přímo bez dodatečného runtime násobení.
- **Přehlednost v Bestiáři:**
  - V Bestiáři se u probádaných strašidel zobrazuje čistá útočná kadence (*⚡ Útok: Rychlý (0,6 s)*, *⚔️ Útok: Normální (1,2 s)*, *🔨 Útok: Pomalý (1,8 s)*) spolu s přímou skutečnou hodnotou úderu (*💥 Úder: {damage}*).
- **Zachování časování a prodlevy:**
  - Zranění je udělováno až po uplynutí celé prodlevy od prvního kontaktu (0,6 s / 1,2 s / 1,8 s), což dává hráči prostor reagovat a včas uniknout či nepřítele odhodit.

## 2026-10-08 — Poutník: 200 Kuráž, procentuální bonus poškození (+35 %), sjednocení terminologie na Kuráž a revize popisků všech hrdinů

- **Poutník (Tulák) – 200 Kuráže a +35 % poškození:**
  - Základní hodnota zdraví (Kuráže) Poutníka byla navýšena ze 150 na **200 Kuráže**.
  - Poutník nově začíná pouze s **Osikovým prutem** (bez počátečních Povidlových buchet).
  - Bonus *Tulácký instinkt* dává **+35 % ke všem zbraním** (`×1,35`) namísto dřívějšího flat přídavku.
- **Sjednocení herní terminologie (HP ➔ Kuráž):**
  - Veškeré texty, ukazatele, plovoucí texty léčení (`+55 Kuráž`, `+35 Kuráž`, `+6 Kuráž`), ukazatele minibossů, Bestiář i Sandbox byly upraveny tak, aby se namísto zkratky „HP“ nebo „životy“ důsledně používalo české označení **Kuráž**.
- **Kompletní revize a soulad popisků všech 6 lovců s reálnými herními schopnostmi:**
  - **Poutník:** Pověstná sukovice (21 s cooldown, silné odhození zblízka, vyděšení na 4 s na dálku), Kuráž 200, Osikový prut, +35 % poškození.
  - **Pasáček:** Dusot stáda (30 s cooldown, přivolá 22 běžících beranů, 140 plošného fyzického poškození a masivní smetení), vysoká rychlost (220) a obří dosah sběru (160), start s Povidlovými buchtami.
  - **Bába kořenářka:** Očistné kadidlo z devatera bylin (30 s cooldown, +55 kuráže, +30 dočasný štít, 1,8 s nezranitelnost, 120 nature dmg a zpomalení nepřátel na 4,5 s), pasivní obnova +2 kuráže každé 4 s, start s Devaterem kvítí.
  - **Ponocný:** Noční roh a poplach (30 s cooldown, poplach vystraší strašidla na 5 s a udělí 110 fyzického poškození s odhozením), stálá posvátná aura lucerny (16 svatého poškození/s), start s Kovanou halapartnou.
  - **Pobožný kostelník:** Farní požehnání (35 s cooldown, úder zvonu a sloup světla očistí nemrtvé a démony v okruhu 650 px, u bossů ubere 25 % max. kuráže), start s Kropenkou se svěcenou vodou.
  - **Babička a Barunka:** Chléb se solí a vlídné slovo (45 s cooldown, zastavení času, scénka nasytí bubáky či zažene démony dle toho, zda mají nižší odolnost vůči Food nebo Holy), start s Kynutým koláčem s mákem a Barunkou po boku.

## 2026-10-07 — Válečnice: Větší Ladovský sprite (+40 %), dosah úderu (+60 %), 3s omráčení, 20% ignorace odolností a podrobný rozpis ve zbrojnici

- **Zvětšení spritu Válečnice o 40 % (Měřítko postavy):**
  - Měřítko vykreslování Válečnice v modulu `src/render/ladaRenderer.ts` a v herní smyčce bylo navýšeno o 40 % (scale zvýšen z 1,22 na 1,71).
  - Válečnice nyní působí jako statná, nepřehlédnutelná česká hospodyně v červeném puntíkovaném šátku, zelené šněrovačce, bílé zástěře a lidové sukni, která rázně vymetá prostor kolem lovce.
- **Rozšíření dosahu úderu o 60 % (Hitbox Reach 58 px):**
  - Dosah, ve kterém bukový váleček zasahuje okolní bubáky, byl zvětšen o 60 % (ze základních 36 px na 58 px + poloměr monstra, dále škáluje s milníky plošného dosahu).
  - Detekční okruh pro okolní nepřátele byl rozšířen na `orbitRadius + reachBase + 50`, takže Válečnice s jistotou vyčistí široký pás kolem lovce.
- **Prodloužení omráčení na 3,0 sekundy (Stun 3,0 s):**
  - Doba omráčení při zásahu bukovým válečkem byla prodloužena na plné 3,0 sekundy.
  - Zasažení nepřátelé okamžitě přeruší probíhající nápřah k útoku (`windupTimer = 0`, `aiState = idle`), zastaví svůj pohyb a nad hlavami se jim točí ladovské komiksové hvězdičky (💫).
- **Nastavení ignorace odolností na 20 %:**
  - Válečnice nově ignoruje přesně 20 % odolnosti monster (`ignoreResist: 0.20`).
  - Proráží 20 % tuhosti (`poiseResist`), 20 % odolnosti proti odhození (`knockbackResistance`), 20 % vůle proti omráčení (`willpower`) a překonává 20 % redukce zranění i u minibossů.
- **Zpomalení o 40 % v kruhu o 15 % větším než orbit (odolnost dle Vůle):**
  - Kolem lovce se rozprostírá vnější větrná zóna o poloměru o 15 % větším než oběžná dráha Válečnice (základ 132 px, škáluje s plošnými milníky).
  - Všichni nepřátelé v tomto okruhu jsou zpomaleni o 40 %, přičemž míra zpomalení je odolávána parametrem Vůle (`willpower`) daného monstra (se započtením 20% průrazu odolností Válečnice).
  - Na zemi je tato zóna vizualizována oranžovým čárkovaným kruhem a zpomalená monstra zanechávají u nohou vířivou prachovou stopu.
- **Velký patrolní okruh (Orbit 115 px):**
  - Válečnice obíhá lovce ve velkém okruhu o poloměru 115 px (s milníky dosahuje až 160+ px) a na zemi vykresluje ladovskou tečkovanou patrolní stopu.
- **Podrobný výpis statistik ve zbrojnici a knihovně zbraní (Arzenál):**
  - V Zbrojnici (`ArsenalModal`) a detailu odemčení (`WeaponUnlockModal`) přibyl kompletní technický rozpis všech 8 parametrů Válečnice (poškození 52, kadence 0,48 s, stun 3,0 s, průraz 20 %, dosah 58 px, odhoz 760, okruh 115 px, sprite scale 1,71) společně s interaktivním animovaným náhledem.

## 2026-10-07 — Hmotnost nepřátel, zpomalení v davu, klouzavé obtékání a Ladovský varovný nápřah (Fyzika & Bojový systém)

- **Mechanika hmotnosti monster (Enemy Mass & Odpor těl):**
  - Do rozhraní `Enemy` a `EnemyStats` byl zaveden fyzikální parametr hmotnosti `mass` (výchozí hodnota `radius / 15`, u lehkých skřítků cca 0,95–1,0, u těžkých monster, dřevorubců a bossů 2,0–5,0).
  - V herní smyčce se těla nepřátel v těsném kontaktu s lovcem sčítají do celkového odporu davu `totalResistance`.
  - **Efekt lapení při nápřahu:** Pokud monstrum právě provádí nápřah (`isAttacking === true`), jeho lokální odpor se zdvojnásobí, což vytváří věrný pocit, že se lovec v sevření útočícího chumlu nemůže tak snadno vytrhnout.
- **Plynulé zpomalení hráče při průchodu davem (Crowd Drag):**
  - Hráčova vlastní vstupní rychlost je dynamicky tlumena vzorcem $speedMultiplier = \max(MIN\_SPEED\_RATIO, \frac{1}{1 + totalResistance \times DRAG\_COEFFICIENT})$ s koeficientem odporu $0{,}35$.
  - Hráč se nikdy nezastaví na nule – je garantována minimální rychlost $20\,\%$ ($MIN\_SPEED\_RATIO = 0{,}2$), což umožňuje taktické prorážení a manévrování i pod náporem početného hejna.
- **Klouzavé vektorové obtékání a odtlačení (Sliding Pushback):**
  - Implementována prostorová detekce přes `spatialHash.queryRadius(player.x, player.y, player.radius + 35)` v jediném vysoce optimalizovaném průchodu bez alokací na haldě.
  - Pro každé kolidující monstrum se počítá průnik $overlap = (r_{player} + r_{enemy}) - dist$ a akumuluje se odtlačovací vektor $\vec{push} += \frac{\vec{pos}_{player} - \vec{pos}_{enemy}}{dist} \times overlap \times PUSH\_FORCE$ ($PUSH\_FORCE = 6{,}0$).
  - Vektor je bezpečně zastropován na $MAX\_PUSH\_SPEED = 300\text{ px/s}$ a aplikován na pozici lovce: `player.x += (moveVx + pushX) * dt` a `player.y += (moveVy + pushY) * dt`.
  - Hráč tak při kontaktu přirozeně a hladce klouže po obvodu monster a nezasekává se v jejich středech.
- **Telegrafované útoky monster a nápřah (Windup Damage System):**
  - Každý nepřítel má definován dosah úderu `attackRange` (výchozí `radius + 25`) a čas nápřahu `attackDelay` (výchozí `0,5 s` s ohledem na kadenci úderu).
  - Pokud je vzdálenost mezi monstrem a lovcem $\le attackRange$, monstrum přejde do stavu nápřahu (`isAttacking = true`) a inkrementuje se časovač `windupTimer += dt`.
  - Zranění je hráči uděleno až po dokončení celého nápřahu (`windupTimer >= attackDelay`), načež se časovač zresetuje na nulu.
  - **Taktický únik z dosahu:** Pokud hráč stihne uniknout mimo $attackRange$, nápřah postupně opadá dvojnásobnou rychlostí (`windupTimer = Math.max(0, windupTimer - dt * 2)`), a při poklesu na 0 se stav nápřahu zruší.
- **Ladovský výstražný vykřičník – Varianta B (`drawEnemyWarningSign`):**
  - V modulu `src/render/ladaRenderer.ts` byla naimplementována nová funkce pro výstražný symbol nad hlavami útočících nepřátel.
  - **Vizuální styl:** Terčík s ladovskou černou konturou (`#1a120b`), bílým inkoustovým vykřičníkem a barevným přechodem z teplé oranžové (`#f1a834`) do výstražné rudé (`#c82a1e`) při překročení $75\,\%$ nápřahu.
  - V závěrečných $20\,\%$ nápřahu terčík dynamicky zvětšuje své měřítko a pulzuje pro maximální čitelnost nebezpečí.
  - Funkce je volána v renderovací pipeline pro všechna viditelná monstra na obrazovce s aktivním nápřahem.
- **Optimalizace a stabilita 60 FPS:**
  - Všechny výpočty jsou chráněny proti dělení nulou (`dist > 0.0001`), prostorový hash znovupoužívá interní pole bez vytváření dočasných instancí a hra si zachovává plynulých 60 snímků za sekundu i v masivních vlnách nepřátel.

## 2026-10-07 — Tématické rozdělení nepřátel na rychlé, normální a pomalé útoky (Bojový systém & Balance)

- **Tématické rozdělení nepřátel do tří kadencí:**
  - Všech 49 venkovských strašidel a bossů bylo tématicky roztříděno do tří skupin podle jejich ladovského charakteru, váhy a výzbroje:
    1. **Rychle útočící (0,6 s interval, 100 % základní poškození):** Drobná hejna a hbití skřítci (`rarach`, `plivnik`, `sotek`, `zaba`, `zmrzlik`, `skodnik`, `mysak`, `blatouch`, `vanicka`, `bludicka`, `cerny_pes`, `jiskrivec`, `nocni_mura`, `sazovy_rarach`).
    2. **Normálně útočící (1,2 s interval, +120 % zranění / 2,2× násobek):** Standardní kostlivci, vodníci, víly, písaři, mrazíci a lapkové (`skeleton`, `skeleton_scythe`, `krvavy_kostlivec`, `pisar`, `hrobnik`, `hastrman`, `vodnicek`, `topivec`, `ropucha`, `meluzina`, `mrazik`, `severak`, `polednice`, `klekanice`, `divozenka`, `zbojnik`, `certik`, `ohnivy_muz`, `bila_pani`).
    3. **Pomalu útočící (1,8 s interval, +190 % zranění / 2,9× násobek):** Těžcí obři, umrlci s pomalým nápřahem, dřevorubci s širočinou, zbrojnoši v plátech a velcí bossové (`umrlec`, `bubak`, `hromotluk`, `stodolnik`, `drevorubec`, `drab`, `zbrojnos`, `obrneny_zbojnik`, `snehulak`, `ohnivy_pes`, `cert`, `hejkal`, `obr`, `mlynar`, `bezhlavy_rytir`, `drak`).
- **Časování a zranění až po prodlevě:**
  - Interval se začíná odpočítávat v okamžiku prvního kontaktu, avšak zranění je uděleno až po uplynutí této prodlevy (0,6 s pro rychlé, 1,2 s pro normální, 1,8 s pro pomalé nepřátele).
  - **Možnost úniku a přerušení:** Pokud lovec stihne včas uskočit nebo nepřítele odhodit zbraní s odhozem (Válečnice, Česneková topinka, Cep apod.), útok se přeruší a lovec neutrpí žádné poškození.
  - **Vizuální telegraf nápřahu:** Během kontaktu se kolem útočícího nepřítele vykresluje kruhový indikátor nabíjení úderu (žlutý pro rychlé, oranžový pro normální, červený pro pomalé).
  - Při trvalém kontaktu pak další údery následují v tomto stálém intervalu.
- **Audiovizuální odezva:**
  - Zásahy od pomalu útočících těžkých nepřátel a bossů jsou doprovázeny hutným těžkým zvukovým efektem `sound.heavyHit()`.
- **Integrace v Bestiáři:**
  - Každé probádané strašidlo v kronice / bestiáři přehledně zobrazuje štítek s informací o své kadenci a intervalu úderu.

## 2026-10-07 — Oprava dvojitého odpočtu contactTimeru při kontaktu s nepřáteli (Engine & Combat Balance)

- **Podrobná analýza a příčina chyby (Root Cause):**
  - Herní engine udržuje u každého nepřítele vnitřní časovač kontaktu `contactTimer` s výchozím intervalem **0,45 s**, který slouží jako minimální prodleva mezi fyzickými zásahy hráče při těsném dotyku.
  - V herní smyčce však docházelo k tomu, že se `contactTimer` při trvalém kontaktu odčítal o deltu času `dt` **na dvou místech v tomtéž snímku**:
    1. **První odpočet** probíhal v obecné aktualizační metodě nepřítele `e.update(dt, player)` na řádku `if (this.contactTimer > 0) this.contactTimer -= dt;`.
    2. **Druhý odpočet** probíhal bezprostředně poté v kolizní smyčce nepřátel v `App.tsx` na řádku `e.contactTimer = (e.contactTimer || 0) - dt;`.
- **Důsledek pro hratelnost — nechtěně 2× vyšší obdržené poškození za čas (DPS):**
  - Samotná hodnota zranění z jedné rány byla v pořádku, avšak kvůli dvojnásobné rychlosti odpočtu (`2 × dt` za snímek) se interval mezi ranami zkrátil z plánovaných **0,45 s** na pouhých cca **0,22 až 0,23 s**.
  - **Frekvence zásahů tak vzrostla z plánovaných cca 2,2 úderu/s na 4,4 až 5 úderů za sekundu.**
  - **Výsledné poškození za sekundu (DPS), které lovec při kontaktu inkasoval, bylo tedy nezamýšleně dvojnásobné.**
  - Tento bug byl fatální zejména při obklíčení skupinou bubáků (např. 3–4 nepřátelé udíleli neúnosných 15–20 zásahů za sekundu) nebo v soubojích s rychlými nepřáteli a bossy na tělo, kdy lovec ztrácel veškerou Kuráž (HP) během necelé vteřiny bez šance na únik.
- **Implementované řešení:**
  - V kolizní smyčce hráč–nepřítel v `App.tsx` byl odstraněn redundantní řádek `e.contactTimer = (e.contactTimer || 0) - dt;`.
  - Kolizní vyhodnocení nyní pouze bezpečně testuje vypršení časovače: `if ((e.contactTimer || 0) <= 0) { e.contactTimer = 0.45; player.takeDamage(...); }`.
  - Odpočet `contactTimer` o `dt` probíhá striktně jednou za snímek uvnitř `e.update(dt, player)`.
  - Frekvence fyzického zranění při těsném kontaktu nyní přesně odpovídá navrženému intervalu **0,45 s** (cca 2,2 zásahu za sekundu), čímž se efektivní kontaktní poškození bubáků vrátilo na správnou, férovou úroveň.


## 2026-10-07 — Aktualizace průvodce Ovládání a cíl hry, Čertův dědeček a nový arzenál

- **Kompletní přepracování a rozšíření průvodce „Ovládání a cíl hry“:**
  - Vytvořeny přehledné dedikované záložky: *🧓 Čertův dědeček & Nůše*, *⚔️ Nové zbraně & Arzenál*, *🏘️ Vylepšení v hospodě* spolu s aktualizovaným ovládáním, cílem hry a výkonem.
- **Podrobný rozbor mechanik Čertova dědečka a nůše:**
  - Zdokumentovány přesné podmínky spuštění a zjevení: čas výpravy ≥ 25 s, minimální zásoba voňavých perníčků pro nákup (25–35 perníčků) a 25s cooldown po odchodu.
  - Následování lovce po mapě (vzdálenost 220–280 px), zavolání *„Pssst! Perníčky!“* a otevření obchodu klávesou `E`, kliknutím myší či dotykovým tlačítkem.
  - Bezpečné zastavení času při nákupu, garance 1–2 zbraní v nůši (nové zbraně i vylepšení stávajících zbraní až na úroveň 8), čekací sleva až −30 %, vliv statistiky Štěstí (sleva až 20 % a vzácnější nabídky) a progresivní přebalení nůše (Reroll od 4 perníčků).
  - Vysvětlena klíčová posvátná synergie s Kaplí svaté vlny ve vesnici (tlaková vlna 100–500 dmg v okruhu 400 px při každém nákupu v nůši).
- **Zpracování nového arzenálu zbraní v průvodci:**
  - **Válečnice:** Obíhající rázná hospodyně s válečkem, vysoké plošné poškození (34 dmg) a masivní odhoz (knockback 300).
  - **Česneková topinka:** Obranná aromatická aura s brutálním odhozením (knockback 320) a znatelným zpomalením dotírajících nepřátel.
  - **Kyselá okurka:** Vystřelování nakládaných okurek udělující nepřátelům devastující debuff (+35 % až +50 % vyšší zranění ze všech ostatních zbraní).
  - Přehled všech 15 ladovských zbraní včetně buchet, vidlí, halapartny, cepu, včelího roje a posvěcené vody.
- **Aktualizace vylepšení vesnice a ovládání:**
  - Zdokumentovány všechny obecní budovy v hospodě U Černého kocoura a jejich trvalé bonusy za krejcary (včetně Kovářské výhně, Šenkýřova štítu a Kaple svaté vlny).
  - Do ovládání zanesena klávesa `E` pro otevření nůše v terénu, vylepšen popis pauzy `P / Esc`, ultimátních schopností hrdinů na `Mezerníku` a dotykového virtuálního joysticku.

## 2026-10-07 — Oprava pádů Hromničky, aktivace milníků v test módu, vyvážení nůše a stabilizace

- **Oprava kritického pádu Hromničky (TypeError: player.spawnHromnickaPulse is not a function):**
  - Implementována chybějící metoda `player.spawnHromnickaPulse` v `App.tsx` s pulzním posvátným poškozením, odhozem odpuzujícím nepřátele a vyšším poškozením proti nemrtvým a pekelníkům.
  - V `weapons.ts` opraven výpočet zranění Hromničky přes `getWeaponDamage(player, ...)`, aby správně škáloval s perky a poškozením lovce.
- **Aktivace milníků zbraní v Sandboxu a při vylepšení z truhly:**
  - Vytvořena funkce `ensureWeaponMilestones`, která automaticky přiřazuje milníky na úrovních 3, 5 a 8 pro testovací běhy, startovní zbraně i vylepšení z malované truhly.
- **Vyvážení nabídky zbraní v Dědečkově nůši:**
  - Odstraněna jakákoliv speciální přednost pro Česnekovou topinku a Válečnici; všechny zbraně mají v nůši rovné šance (upřednostňují se pouze stávající zbraně, které již lovec nese, aby mohl vylepšovat svůj aktuální arzenál).
  - Odstraněn stale closure a race condition při rychlých nákupech v nůši (`grandfatherPurchaseIdsRef`).
- **Oprava Kaple svaté vlny (vesnická budova Church):**
  - Budova po odstranění starého Level-up systému nefungovala; nyní při každém nákupu v dědečkově nůši vyšle masivní posvátnou tlakovou vlnu (400 px, 100 dmg / úroveň).
- **Škálování cooldownu všech zbraní:**
  - Všechny zbraně (včetně tradičních zbraní bez milníků) nyní správně získávají cooldown bonus při vylepšování úrovně.
- **Opravy UI a ovládání:**
  - Zobrazení vstřebaného poškození štítem (`ŠTÍT POHLTIL! 🛡️`) v plovoucím textu.
  - Přidán `blur` listener na okno prohlížeče, aby při přepnutí okna nezůstaly viset stisknuté klávesy pohybu.
  - Pravidelná synchronizace počtu perníčků do HUDu.

## 2026-10-07 — Oprava zamrzání hry (Canvas save stack leak), stabilizace Dědečka a Pekelného Čerta

- **Oprava kritického zamrzání hry (Canvas state stack overflow):**
  - V procedurální animaci `Lada.drawGrandfather` v `ladaRenderer.ts` chybělo volání `ctx.restore()` na konci bloku trupu a kabátu.
  - V každém snímku docházelo k hromadění neuzavřených `ctx.save()`, což po chvíli vedlo k přetečení zásobníku plátna v prohlížeči, selhání vykreslování kamery a kompletnímu zamrznutí hry.
  - Stav `drawGrandfather` je nyní dokonale vyvážený (15 save / 15 restore).
- **Oprava NaN při pohybu Dědečka:**
  - Odstraněno redundantní a nestabilní dělení `stepX / dt` v `App.tsx`, které při snímcích s nulovou deltou (`dt === 0`) způsobovalo `NaN` v rychlostech a souřadnicích Dědečka a následně zneplatnilo matici Canvasu.
  - Doplněna bezpečná ochrana proti nulové vzdálenosti a automatické přemístění Dědečka, pokud se hráč vzdálí přes 1400 px, aby se neztratil na mapě.
- **Vykreslování světa při otevřené nůši:**
  - Do podmínky vykreslování plátna v `App.tsx` byl přidán herní stav `'grandfather'`. Herní svět za obchodem již nezčerná prázdným `clearRect`, ale zůstává přirozeně viditelný a pozastavený.
- **Pekelný Čert — vylepšení chování a ochrana:**
  - Opraveno natáčení Čerta během telegrafu / windupu: Čert se nyní dívá přímo na hráče (`certFacingVx`), místo natáčení doprava při nulové rychlosti.
  - Odraz hráče při zásahu charge vidlemi je bezpečně ošetřen přes `Number.isFinite`, čímž se zamezilo potenciálnímu poškození pozice hráče.
- **Kyselá okurka (průraz):**
  - Opravena detekce průrazu střel okurky v kolizní smyčce tak, aby zohledňovala vlastnost `pierce` a správně prorážela houfy nepřátel podle získaných milníků.
- **Milníky zbraní a nůše:**
  - Funkce `getRankedWeaponStats` nyní bezpečně vyhodnocuje milníky zbraní jak z pole ID řetězců, tak z objektu mapy ranků, takže upgrady zakoupené u Dědečka ihned poskytují správné bonusy.
  - Ošetřeno bezpečné načítání voleb milníků a v `GrandfatherShop` přidáno korektní zobrazení při vykoupení všech dostupných položek.

## 2026-10-07 — Ladovská animace Dědečka, zbraně v test módu a progresivní reroll nůše

- **Nové zbraně v Testovacím módu (Sandbox):** Do výběru testovacího módu byly přidány **Česneková topinka**, **Válečnice** a **Kyselá okurka** s plnou podporou volby úrovně (0 až 10), dynamickým výpočtem statistik a popiskem zbraně.
- **Dědečkův obchod (nůše):** Garantuje 1–2 zbraně v nabídce s přednostním nabízením Topinky a Válečnice pro rychlé odemčení i vylepšování na vyšší úrovně.
- **Progresivní cena zamíchání nabídky (Reroll):** Tlačítko „Zamíchat nůši“ nyní stojí **4 perníčky** a s každým dalším zamícháním v daném setkání rychle a progresivně zdvojnásobuje svou cenu (**4 → 8 → 16 → 32 → 64... 🍪**). Tlačítko přehledně zobrazuje aktuální cenu a při nedostatku perníčků je deaktivováno.
- **Nová detailní plynulá Ladovská animace Dědečka:**
  - Vytvořena kompletní procedurální animace `Lada.drawGrandfather` přímo do herního plátna vycházející z Ladovské ilustrace kramáře/čertíka:
  - **Kulhavá chůze (limping walk):** Asymetrický krok zohledňující jedno mohutné čertovské kopyto (těžký dopad s vířením prachu a poklesem těla) a jednu šněrovanou koženou botu (měkčí zhoupnutí).
  - **Kouření a bafání z dýmky:** Vyřezávaná dýmka v ústech s cyklem potahování, pulzujícím žhavým uhlíkem a plynule stoupajícími a rozpínajícími se obláčky dýmu.
  - **Gestikulace ke kameře:** Drápatá ruka v perspektivě vstřícně kyne a gestikuluje směrem k hráči/kameře s vlnícím se pohybem prstů zvoucím k nůši.
  - **Ladovské folklórní detaily:** Vroubkované beraní rohy, beranice s beránčí vlnou, červená čertovská tvář s špičatýma ušima, kulaté drátěné brýličky, baňatý nos, mohutný zvlněný stříbrný vous, záplatovaný ovčí kožich s křížkovými stehy, kožená brašna s přezkou a švihající pekelný ocas s chomáčem srsti.
  - **Nůše plná pokladů:** Pletená proutěná kramářská nůše na zádech se setrvačným pohupováním, malovaná truhlička s lidovým ornamentem, svinutá deka, pytel se semínky, zvědavá mrkající polní myška s chvějícími se oušky a houpající se svítící lucernička s konvičkou.
  - **Klikací interakce:** Kliknutím na Dědečka ve světě (či stiskem klávesy `E`) se otevře jeho obchod.

## 2026-10-07 — Rozšíření Dědečkova obchodu (Zbraně & Level Up upgrady) a úprava Polednice

- **Dědečkův obchod (nůše)** nyní náhodně nabízí jakýkoli z předchozích level up upgradů (Krvavé jelito, Opravdová káva, Medvědí mast, Veselá mysl, Toulavé boty, Magnetický měšec, Zabijačková jitrnice, Kynutý koláč, Povidlová buchta) i zbraní (Osikový prut, Česneková topinka, Válečnice, Kyselé okurky, Povidlové buchty a další).
- **Garantovaná zbraň:** V nabídce nůše je vždy garantována alespoň jedna zbraň z dostupného fondu.
- **Nákup a vylepšování zbraní:** Zakoupení neznámé zbraně ji přidá lovci do arzenálu; zakoupení již vlastněné zbraně ji povýší na další úroveň (až do úrovně 8). Karty zbraní přehledně zobrazují aktuální úroveň a označení „Nová zbraň“ či „Vylepšení“.
- **Ikony v nůši:** Všechny položky nůše (včetně ladovských SVG ikon jako Jelito, Topinka, Prut, Káva, Koláč atd.) se vykreslují přes komponentu `GameIcon`.
- **Polednice v 1. úrovni:** Polednice (miniboss i běžný výskyt v 1. úrovni „Náves a rybník Brčálník“) se nyní pohybuje o **15 % pomaleji** (základní rychlost i výpady jsou sníženy na 85 %).

## 2026-10-07 — Perníčkové odměny a živý boss bar

- Každý poražený nepřítel nyní vytváří perníček podle své **herní bodové hodnoty**, místo odvození velikosti perníčku od HP.
- Hodnotová pásma používají **1 / 3 / 10 perníčků** pro malé, velké a obří dropy; bossové dávají vždy obří perníček.
- Boss HP lišta se nyní synchronizuje přímo z živého bosse každých **0,1 s**, takže reaguje průběžně na běžné zásahy a během boje nezamrzá.
- Boss lišta dostala pevnější layout s maximální šířkou **600 px** a minimální výškou **52 px**.

## 2026-10-07 — Dědečkův obchod a perníčková ekonomika

- XP a arénový systém Level Up byly odstraněny z průběhu výpravy; lovec místo XP získává **perníčky** jako běhový zdroj.
- Po porážce nepřátel vznikají perníčkové dropy ve třech velikostech s hodnotami **1 / 3 / 10**; minibossové a bossové dávají větší varianty.
- **Dědečkův obchod** funguje jako nový runový upgrade loop: Dědeček je roaming encounter ve světě a po přiblížení lze otevřít jeho nůši.
- Nabídka obsahuje čtyři náhodné položky, podporuje omezení stacků, **štěstí**, čekací slevu až **30 %** a postupnou cenovou inflaci při dalších nákupech v jednom setkání.
- Přidány nové runové bonusy pro rychlost, damage, dosah sběru, Max Kuráž, regeneraci a štěstí.
- Přidány nové zvuky pro sběr perníčků, přivolání Dědečka a nákup v jeho nůši.
- UI arény nyní zobrazuje zásobu perníčků místo XP lišty; Dědečkův obchod nahrazuje dosavadní výběr upgradeů v aréně.
- Dědečkův roaming landmark a perníčky dostaly vlastní ladovské vykreslení.

> **Source of truth:** aktuální implementace v `src/`. Historické hodnoty, které byly později změněny, nejsou uváděny jako aktuální stav.

## 2026-10-06 — Konsolidace herních změn a sjednocení changelogu

### Aktuální stav systému zbraní
- Čtyři zbraně mají nový **osmirankový progression systém**: Osikový prut, Válečnice, Česneková topinka a Kyselé okurky.
- Ranky **3 / 5 / 8** jsou milestone ranky se dvěma vzájemně výlučnými volbami.
- Ranky **2 / 4 / 6 / 7** mají standardní progres:
  - +12 % damage za rank,
  - +8 procentních bodů weapon cooldown bonusu za rank,
  - +6 % area za rank.
- Interně se základní weapon damage násobí faktorem `1 + (level - 1) × 0,12`; area faktorem `1 + (level - 1) × 0,06`.
- Weapon cooldown používá:
  `baseCooldown / (1 + playerCooldownBonus + weaponCooldownBonus)`
  s minimem **50 % base cooldownu**.
- Milestone cooldown modifikátory se aplikují dodatečně jako násobitel.
- Milestone efekty jsou kumulativní a aktivují se pouze z voleb uložených v `weapon.milestones`.
- Validace vyžaduje přesně 8 ranků, milestone pouze na 3/5/8 a unikátní ID voleb.
- Starý mastery stav zůstává pouze kvůli kompatibilitě uložených her; nové mastery volby se negenerují.
- Tulák má **+30 flat damage ke všem zbraním**, který se přičítá k base damage před globálním damage multiplikátorem.

### Aktuální základní hodnoty čtyř milestone zbraní
| Zbraň | Base damage | Base cooldown |
|---|---:|---:|
| Osikový prut | 18 | 0,80 s |
| Válečnice | 34 | 0,55 s |
| Česneková topinka | 1 | 0,35 s |
| Kyselé okurky | 20 | 1,15 s |

### Aktuální milestone volby
- **Osikový prut**
  - Rank 3: Široký švih / Rázný bác
  - Rank 5: Prut větrník / Pevná násada
  - Rank 8: Prut košťátko / Prachová smršť
- **Válečnice**
  - Rank 3: Válečnický kruh / Rázný váleček
  - Rank 5: Dvojnásobný bác / druhá specializace kruhu
  - Rank 8: Válečnický kruh+ / Velký úklid
- **Česneková topinka**
  - Rank 3: Široký obláček / Silný obláček
  - Rank 5: Těžký obláček / specializace plochy
  - Rank 8: Velký česnekový oblak / Kyselý česnekový bác
- **Kyselé okurky**
  - Rank 3: Křupavá porce / specializace síly
  - Rank 5: Kyselá svačina / specializace síly
  - Rank 8: Velká okurková porce / Kyselý déšť

### Aktuální pasivní bonusy
- **Opravdová káva:** interně +0,1111111111 cooldown bonus; při použitém vzorci to odpovídá přibližně **−10 % efektivního cooldownu**.
- **Krvavé jelito:** `damageMultiplier × 1,15`, tedy **+15 % damage multiplikativně za stack**.
- **Medvědí mast:** **+30 Max Kuráž** a současně +30 aktuální Kuráže při získání.
- **Veselá mysl a písnička:** **+3 Kuráž každých 5 s za stack**.
- **Toulavé boty sedmimílové:** **+20 speed** z level-up volby.
- **Magnetický měšec:** **+30 pickup radius**.
- Truhla má pro Toulavé boty aktuálně samostatnou odměnu **+25 speed**.

### Aktuální drop hodnoty
- Běžná truhla: **29 400 bodů**.
- Potion: **450 bodů**.
- Bread: **250 bodů**.
- Soul: **120 bodů**.
- Coin: **20 bodů**.
- Bossové mají garantovanou boss loot logiku; miniboss při zklidnění generuje vlastní odměny.

### Aktuální miniboss systém
- Miniboss render scale: **1,75×**.
- Miniboss collision radius: **1,65×** základního radiusu.
- Minimální HP minibosse: **1 400**.
- Poise resist minibosse: minimálně **0,82**.
- Food resist minibosse: minimálně **0,78**.
- Willpower minibosse: minimálně **0,85**.
- Damage minibosse se počítá jako `stats.damage × 1,35 × 1,6`.
- Miniboss získává minimálně 25 coin value a 20 XP.
- Minibossové mají vlastní overhead HP, zlatou auru a jsou vizuálně zvětšeni.

### Aktuální opravy gameplay loopu
- Opravena stale-closure chyba herního loopu přes aktuální `gameStateRef` / synchronizované ref hodnoty.
- Dropy se nyní spolehlivě magnetizují a sbírají.
- Kontakt nepřítele s lovcem nyní správně způsobuje damage.
- Útěkový stav má prioritu před běžnou AI a synchronizuje rychlost, směr, pozici i animaci.
- SpatialHash používá aktuální pozice po pohybu nepřátel a je plně typovaný.
- Expirované projektily se ve stejném snímku již neúčastní kolizí.
- Boss HP HUD je oddělen od gameplay `takeDamage()`.
- Neznámé enemy ID vyvolá explicitní chybu.
- Final-boss victory je vázána na skutečného finálního bosse levelu.

## 2026-10-06 — Historické feature změny doplněné při auditu commitů

### Character-specific ultimate scénky
- **Pasáček** dostal příběhovou ultimate scénku se zastavením herního času, zvukem pastýřské píšťalky a následným útokem stáda.
- Ve scénce je vytvořeno **22 ovcí/beranů**; hlavní zásah způsobuje **140 × damageMultiplier** fyzického poškození v dosahu 560 a výrazný knockback.
- Po hlavním zásahu pokračuje po dobu přibližně **3,6 s** pravidelný trample efekt s poškozením **35 × damageMultiplier**.
- **Kořenářka** dostala vlastní příběhovou scénku se zastavením času, zvukem očistného kadidla a bylinným sanctuariem.
- Účinek Kořenářky obnovuje **55 HP**, přidává **30 dočasného štítu**, poskytuje až **1,8 s nezranitelnosti**, způsobuje **120 × damageMultiplier** přírodního poškození v dosahu 480 a aplikuje soak/slow.
- Následné sanctuary trvá **4,8 s**, léčí v pulsech po **6 HP** a způsobuje další **25 × damageMultiplier** přírodního poškození.
- Scénky lze klávesou Space přeskočit/urychlit na jejich účinek nebo dokončit.

### Tulák — Pověstná sukovice
- Ultimate Tuláka byla přepracována na **Pověstnou sukovici**.
- Součástí změny byla úprava cooldown balance a odstranění redundantní spodní lišty speciální schopnosti na dotykových zařízeních.

### Level-up a combat balance
- Výběr level-up odměn byl změněn na strukturu **1 bojová volba + 1 pasivní volba + 1 wildcard volba**.
- Byly současně upraveny hodnoty základních pasiv a vybraných zbraní; výsledný aktuální stav je uveden v hlavní konsolidované sekci výše.

### Balancování nepřátel a pokladů
- V rámci historického balance passu byl práh běžné truhly zvýšen z **9 800 na 29 400 bodů**, čímž se frekvence běžných truhel snížila na třetinu.
- Poškození nepřátel bylo v tomto passu zvýšeno o **60 %**; u minibossů se tato změna promítla do jejich výsledného damage vzorce uvedeného výše.

### Přejmenování zbraně
- **Vrbový prut** byl přejmenován na **Osikový prut** a název byl sjednocen napříč daty, UI, popisy a ikonami.

### Rozšíření postav a levelů
- Do hry byly přidány postavy **Kostelník** a **Babička** včetně jejich zvukových efektů a speciálních schopností.
- Progres levelů byl rozšířen z původních 3 na **6 herních úrovní**.
- Byl rozšířen systém průběžné synchronizace statistik a vítězného přechodu do výsledkové obrazovky.

### Registry hry
- Audit registru bestiáře potvrdil **49 registrovaných enemy položek**, přičemž číslo zahrnuje i variantní/posílené nepřátele.
- Počet zbraní v UI byl sjednocen přímo s registrem `WEAPONS`; aktuálně je registrováno **12 zbraní**.

## 2026-10-05 — Bossové a minibossové
- Pekelný čert dostal výrazný charge s windupem, zvýšenou rychlostí, telegrafem, nárazem a brake fází.
- Prokletý sněhulák byl přejmenován na Zlomyslného sněhuláka a dostal vlastní renderer.
- Bossové a minibossové dostali vlastní ladovské rendery namísto generických sprite fallbacků.
- Tříhlavý drak dostal samostatné animace a útoky jednotlivých hlav.

## 2026-10-05 — Drop systém
- Zavedena variabilní tematická afinity dropů podle kategorií nepřátel.
- Přidány přímé náhodné dropy.
- Usmíření jídlem může vytvářet bonusové odměny.
- Bossové vytvářejí velkou fontánu kořisti.
- Dropy používají fyzikální rozptyl.
- Mince mají více nominálních hodnot.

## 2026-10-04 — Vizuální a obsahové úpravy
- Kynutý koláč dostal nový renderer a SVG grafiku.
- Léčivá buchta byla nahrazena hruškou.
- Svatovítský balzám byl nahrazen jitrnicí.
- Přidány ladovské dekorace HUDu, karet a modálů.
- Čert dostal nový sprite, animace, rohy, oči, jazyk, ocas a jiskry.
- Čert byl na titulní obrazovce přesunut na pravou stranu nápisu Bubákov.

## 2026-10-03 — HUD a mobilní ovládání
- Přidán horní ukazatel Kuráže a XP.
- HUD byl omezen pro mobilní viewport.
- Odstraněna duplicitní lišta speciální schopnosti na dotykových zařízeních.
- Touch controls respektují `100dvh`, `visualViewport` a safe-area insety.
- Přidána podpora landscape a velmi úzkých displejů.

## 2026-10-02 — Performance
- Přidán prostorový hash pro broad-phase collision queries.
- Přidán living-enemy snapshot.
- Použity squared-distance testy.
- Přidáno viewport culling.
- Přidán in-place cleanup entit.
- SpatialHash byl následně přepracován na znovupoužitelný numerický index s retenčními buffery.
- Přidán frame-time clamp proti simulačním burstům.

## 2026-10-04 — Testovací režim
- Zbraně lze v sandboxu nastavit až na úroveň 0.
- Zbraň úrovně 0 se nepovažuje za aktivní.
- Sandbox vyžaduje alespoň jednu aktivní zbraň.

## 2026-10-07 — Doplnění historie a odstranění Plánu kol změn z hry

### Historické feature změny doplněné z původního Plánu kol změn
- **v16.0.0:** Výběr výpravy/kraje byl oddělen do samostatného prvního kroku; následný výběr lovce má vlastní obrazovku se zachovanou informací o zvolené výpravě.
- **v15.0.0:** Sandbox umožňuje volné testování lovců, krajin a zbraní; přidáno bezpečné úplné vymazání postupu včetně odemykání, rozvoje vesnice, pokladny, dušiček a bestiáře.
- **v14.0.0:** Rozšířena pauza hry o P/Esc, arzenál, statistiky a čas přežití; přidán samostatný průvodce ovládáním a cílem hry.
- **v12.0.0:** Připraven soběstačný offline export hry v jednom souboru včetně zabudovaných zdrojů pro další úpravy.
- **v10.0.0:** Bestiář dostal postupný systém výzkumu a odhalování informací v několika úrovních.
- **v9.0.0:** Krajiny dostaly postupný systém průzkumu a odemykání včetně alternativní cesty přes poražení předchozího bosse.
- **v11.0.0:** Zaveden důraz na vysoký kontrast a čitelnost textů v ladovských HUD panelech; historické hodnoty balancu z tohoto passu nejsou považovány za aktuální stav.

### Hráčské rozhraní
- Samostatný **Plán kol změn (1.–16. kolo)** byl odstraněn z herního rozhraní.
- Hra nyní zobrazuje pouze **Kroniku Bubákova**, která obsahuje hráčsky čitelné historické zápisy.
- Kronika byla rozšířena o důležité historické feature změny převzaté z původního Plánu kol změn.
