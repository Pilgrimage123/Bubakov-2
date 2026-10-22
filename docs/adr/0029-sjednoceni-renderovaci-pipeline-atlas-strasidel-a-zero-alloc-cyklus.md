# ADR 0029: Sjednocení renderovací pipeline, bitmapový atlas běžných strašidel a bezalokační cyklus

## Kontext

Během výkonnostního auditu a benchmarkingu arény byly odhaleny klíčové limitace v reálné zátěži prohlížeče:

1. **Dvoukolejná renderovací smyčka**: Přestože ADR 0017 a ADR 0020 vytyčily jednotné renderovací rozhraní `renderArena`, v `src/App.tsx` zůstala přežívající paralelní renderovací smyčka. `App.tsx` volalo pouze dílčí průchod `renderArenaEntities`, zatímco terén, louže, trhliny, dropy, projektily, částice a kvašová světla kreslilo vlastním monolitickým kódem. Modulární renderery v `src/render/` tak byly volány pouze v syntetickém benchmarku, což způsobovalo zásadní divergenci mezi testy a reálným hraním.
2. **GPU rasterizace a tessellace křivek**: Vlny s 200–300 běžnými strašidly generovaly přes 6 000 volání `ctx.stroke()` a `ctx.fill()` v každém snímku. V8 JavaScript smyčka sice proběhla pod 2 ms, ale GPU Canvas command buffer zahlcoval rasterizační pipeline generováním stovek tisíc trojúhelníků z Bezierových křivek.
3. **Re-entrantní hazard v `SpatialHash`**: Sdílený výstupní buffer `this.results` vedl k tichému přepsání výsledků, pokud vnitřní tělo dotazu (např. řetězový blesk biče v `engine.ts:2584`) zavolalo další prostorový dotaz.
4. **Alokace v cyklu částic a plovoucích textů**: Částice a bojové plovoucí texty alokovaly dynamické objekty na haldě s následným zkracováním polí přes `compactInPlace` a `.splice()`, což vyvolávalo zbytečné Scavenge cykly Garbage Collectoru.
5. **DPR a fillrate na 4K displejích**: Pevný škálovací faktor bez ohledu na `window.devicePixelRatio` nutil obrazovky s vysokou hustotou pixelů rasterizovat přes 8,2 milionu pixelů na snímek.

## Rozhodnutí

### 1. Úplná konsolidace do jednotného švu `renderArena`
- Odstraněny všechny inline renderovací smyčky z `src/App.tsx`.
- Zaveden modul `src/render/renderWorldHazards.ts` pro Zrádný terén (blátivé louže, námrazu, trhliny), louže tajících sněhuláků, Bubáckou díru, Posvěcenou tříkrálovou křídu a setkání s Dědečkem a Chásníkem.
- `renderArena` se stává jediným a výhradním vstupním bodem vykreslování herního světa pro reálnou hru i výkonnostní benchmarky.

### 2. Zabezpečení `SpatialHash` proti re-entranci (`scratchStack`)
- Zaveden předalokovaný zásobník `scratchStack` o pevné hloubce 8 instancí.
- Rozhraní doplněno o scoped helper `withQuery(x, y, radius, fn)`.
- Metody `queryCircle` a `queryRadius` automaticky obsluhují re-entrantní volání využitím volné úrovně zásobníku; při překročení limitu hloubky 8 v produkci systém bezpečně alokuje záchranné pole namísto pádu hry.

### 3. Bitmapový atlas běžných strašidel (`EnemyAtlasCache`)
- Při inicializaci úrovně probíhá eager předpečení 6 animovaných fází běžných strašidel z dané soupisky (3 krokové fáze pro klidný pohyb, 3 pro rozvášněný/panikařící stav) do offscreen canvas atlasu.
- Vykreslování stovek běžných běsů (Hejkal, Strašidlo, Divoženka, Čertík, Vrána) probíhá jediným rychlým `ctx.drawImage` výřezem z atlasu namísto desítek procedurálních cest.
- Unikátní bossové (Pekelný Čert, Smrtka, Mlynář) a klíčová NPC zůstávají vykreslováni plně procedurálně pro zachování maximálního detailu.

### 4. Optimalizace nočního osvětlení a eliminace `createRadialGradient`
- Rozlišení bufferu kvašového světla je sníženo na `0.33x` (při grafickém profilu `performance` na `0.25x`) s bilineárním vyhlazením.
- Předpečena 3 normalizovaná čtvercová radiální razítka světla ($128 \times 128$ px) pro teplé světlo petrolejky, oheň a studenou bludičku, nanášená přes `ctx.drawImage`.
- Zcela odstraněna volání `ctx.createRadialGradient` z herního cyklu a vymýcena zbývající volání `ctx.shadowBlur` (nahrazena aditivními podkladovými razítky).

### 5. Kruhový zásobník `CosmeticRingPool`
- Částice a bojové plovoucí texty přecházejí na strukturu `CosmeticRingPool` s pevnou kapacitou (256 částic, 128 textů).
- Při zaplnění kapacity systém přepisuje nejstarší vizuální instanci bez jakékoli alokace paměti na haldě.
- Vystaven tenký indexační adaptér pro stoprocentní zpětnou kompatibilitu existujících unit testů.

### 6. Zastropování fyzického rozlišení a korekce kurzoru
- Fyzické rozlišení plátna je zastropováno na ekvivalent Full HD ($1920 \times 1080$ fyzických pixelů) dle vzorce:
  $$\text{width} = \min(\text{window.innerWidth} \times \text{DPR}, 1920)$$
- Události kurzoru a dotyků v `App.tsx` jsou přepočítávány poměrem `canvas.width / rect.width` a `canvas.height / rect.height`, což garantuje absolutní přesnost zaměřování a interakcí.

## Důsledky

- **Výkon na GPU**: Pokles volání `stroke()` a `fill()` o více než 75 %, propustnost fillrate při nočním osvětlení snížena o dalších 55 %.
- **GC stabilita**: Nulové alokace na haldě v simulačním cyklu bojů, eliminace mikro-záseků (p95 pod 16.6 ms i při 350+ entitách).
- **Architektonická jednota**: Konec duální pipeline – benchmark i herní klient sdílejí totožný optimalizovaný kód.
