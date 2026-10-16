# Spec: Vykreslovací pipeline arény a výkonnostní optimalizace

## Problem Statement

Hráči na méně výkonných noteboocích a mobilních zařízeních narážejí během intenzivních fází výprav na poklesy snímkové frekvence a mikro-zadrhávání (stuttering). Tyto problémy nastávají zejména v momentech, kdy Režisér výpravy zaplní bojiště maximální kapacitou nepřátel, po scéně se pohybuje množství projektilů a zbraní, probíhá kompozice nočního osvětlení a nad entitami vyskakují desítky bojových textů.

Prvním intuitivním nápadem by mohl být kompletní přepis herní scény do herního frameworku Phaser pro získání hardwarové WebGL akcelerace. Výtvarná identita Bubákova je však tvořena desítkami tisíc řádků čistě procedurálního vektorového kreslení v kvašovém a tušovém stylu Josefa Lady. Phaser ve WebGL režimu neumí efektivně akcelerovat dynamické procedurální vektory bez náročné triangulace křivek na procesoru v každém snímku, což by výkon paradoxně zhoršilo. Zároveň by vyžadoval nahrazení odzkoušeného a otestovaného bezhlavého simulačního enginu.

Skutečným úzkým hrdlem není samotný 2D Canvas, ale neefektivní organizace vykreslovací smyčky:
- Opakované procedurální překreslování stovek statických prvků terénu (roubenky, Boží muka, stromy, ploty) v každém snímku namísto jejich cachování.
- Běh renderovací smyčky uvnitř prezentační React vrstvy s alokacemi dočasných polí pro řazení hloubky, což vyvolává zátěž pro Garbage Collector.
- Nákladná kompozice víceprůchodové Kvašové záře a stínů v plném rozlišení obrazovky.
- Opakovaná rasterizace křivek písma na procesoru při vykreslování bojových plovoucích textů.

## Solution

Zachovat 100% autentický ladovský procedurální výtvarný styl na 2D plátně a dosáhnout stabilních 60 FPS optimalizací renderovací pipeline:
1. **Oddělení renderovacího modulu od UI**: Vyčlenit vykreslovací pipeline z React vrstvy do dedikovaného, bezhlavého renderovacího modulu s jediným hlubokým rozhraním.
2. **Dlaždicové cachování statického světa (Chunk Bitmap Cache)**: Statické prvky arény (roubenky, Boží muka, stromy, sněhový terén) se vygenerují jednou při startu výpravy do offscreen bitmapových dlaždic. V herním snímku se provádí pouze rychlý přenos výřezů viditelných dlaždic.
3. **Bezalokační herní snímek (Zero-Allocation Render Loop)**: Znovupoužít trvalé paměťové buffery pro hloubkové řazení entit a odstranit veškeré alokace polí a objektů během běhu snímku pro eliminaci záseků Garbage Collectoru.
4. **Světelná vrstva v polovičním rozlišení (0.5× Downscaled Light Buffer)**: Kompozici Kvašové záře, stínových polygonů a Petrolejky počítat v polovičním rozlišení, což ušetří 75 % fillrate procesoru i grafické karty a zároveň zvýrazní měkký malovaný charakter světla.
5. **Bitmapový atlas glyfů pro bojové texty**: Číslice poškození a stavové ikony předrenderovat do texturového atlasu glyfů a na plátno je sázet jako rychlé bitmapové výřezy namísto nákladné vektorové rasterizace textu.
6. **Záložní hybridní WebGL vrstva**: Vyhradit si možnost umístit nad plátno lehkou hardwarově akcelerovanou vrstvu výhradně pro masové projektily a částice, pokud by profilace v budoucnu prokázala nutnost.

## User Stories

1. Jako hráč na mobilním zařízení chci plynulých 60 FPS i při zaplněném bojišti, abych nebyl frustrován záseky při uhýbání před útoky.
2. Jako hráč obdivující ilustrace Josefa Lady chci, aby postavy, strašidla i krajina zůstaly malované autentickou tuší a kvašem, aby hra neztratila svou pohádkovou atmosféru.
3. Jako hráč čelící Klešťovému sevření chci okamžitou odezvu ovládání bez mikrolagů způsobených Garbage Collectorem, abych mohl včas reagovat na telegrafované nápřahy.
4. Jako hráč bojující v noční fázi výpravy chci vidět měkké kvašové světlo Petrolejky a ostré vržené stíny roubenek bez propadu snímkové frekvence.
5. Jako hráč používající rychlé zbraně s vysokou frekvencí zásahů chci vidět desítky vyskakujících čísel poškození, aniž by došlo ke zpomalení hry.
6. Jako hráč pohybující se rozlehlou zimní krajinou chci, aby se sněhové pláně a dekorace načítaly plynule bez doskakování na okrajích obrazovky.
7. Jako hráč přepínající mezi úsporným režimem a plnou grafikou chci, aby optimalizovaná pipeline respektovala mé nastavení výkonnostního profilu.
8. Jako hráč bojující s velkým monstrem v blízkosti Boží muky chci plynulý souboj s přesným vykreslováním hloubky bez problikávání vrstev.
9. Jako hráč v krizové situaci s nízkou Kuráží chci zřetelně vnímat vizuální atmosféru Zoufalé kuráže a pulzování lampy bez zadrhávání obrazu.
10. Jako vývojář chci mít celou renderovací logiku soustředěnou v samostatném modulu mimo React komponenty, aby se v kódu dalo snadno orientovat a profilovat jednotlivé fáze snímku.
11. Jako vývojář chci, aby simulační herní engine a jeho stávající testy zůstaly nedotčeny, aby nedošlo k regresi herních mechanik a fyziky.
12. Jako vývojář chci mít možnost změřit přesný čas strávený vykreslováním terénu, postav, osvětlení a textů, abych mohl odhalit případná nová úzká hrdla.
13. Jako vývojář chci mít jistotu, že přidání nové roubenky nebo stromu do generátoru arény nezvýší zátěž renderovací smyčky na snímek.
14. Jako tester chci spouštět automatické benchmarky a testy renderovacího modulu v bezhlavém prostředí bez nutnosti otevírat reálný prohlížeč.
15. Jako tester chci ověřit, že objekty mimo zorné pole kamery jsou spolehlivě oříznuty a nespotřebovávají žádný výpočetní čas.
16. Jako hráč sledující příběhovou scénku se zastaveným časem chci plynulé zobrazení rozhovorů a animací bez trhání pozadí.
17. Jako hráč sbírající velké množství perníčků a kořisti chci plynulou animaci jejich přitahování k lovci.

## Implementation Decisions

### 1. Odmítnutí migrace na framework Phaser
- Framework Phaser je odmítnut pro celou herní scénu z důvodu fundamentální nekompatibility mezi WebGL sprite-batchingem a procedurální vektorovou grafikou.
- Zachovává se bezhlavý herní engine pro veškerou simulaci, pohyb, prostorový index i kolize.

### 2. Architektura dedikovaného renderovacího modulu
- Vytvoří se bezestavový renderovací modul, který přebírá odpovědnost za transformaci herního stavu do grafických výstupů.
- Modul vystaví jediné primární rozhraní pro vykreslení kompletního snímku arény.
- Rozhraní přijímá cíl vykreslení (kontext 2D plátna), stav herního enginu, geometrii zorného pole kamery a volitelná nastavení výkonnostního profilu.
- Rozhraní vrací metriky snímku (počet vykreslených entit, počet aktivních dlaždic, časové značky fází).

### 3. Dlaždicová mezipaměť statické arény (Chunk Bitmap Cache)
- Svět dané úrovně se rozdělí na pravidelnou prostorovou mřížku dlaždic.
- Každá dlaždice obsahující statické dekorace (roubenky, stromy, Boží muka, sněhové závěje, ploty) se vykreslí do offscreen bitmapového bufferu pouze jednou při inicializaci výpravy.
- V renderovací smyčce se pomocí prostorového testu identifikují pouze dlaždice protínající zorné pole a vykreslí se jediným přenosem obrazových dat na dlaždici.
- Dynamické prvky terénu (např. dočasné louže či Bubácká díra) se vykreslují samostatně nad statickým podkladem.

### 4. Bezalokační správa hloubky a entit (Zero-Allocation Pipeline)
- Ruší se alokace dočasných polí pro třídění vykreslovaných entit v každém snímku.
- Zavadí se předalokovaný statický buffer o fixní kapacitě odpovídající maximálnímu počtu entit na bojišti.
- Třídění podle osy Y probíhá v tomto stabilním bufferu bez generování práce pro Garbage Collector.

### 5. Dvoustupňové osvětlení v redukovaném rozlišení (Downscaled Lighting Pipeline)
- Offscreen buffer pro kompozici Kvašové záře a stínů se alokuje v polovičním rozlišení vůči velikosti herního okna (faktor 0.5×).
- Výpočty stínových těles a dosahu Petrolejky pracují s touto zmenšenou geometrií.
- Výsledná světelná vrstva se na herní plátno promítá s bilineárním vyhlazením v režimu násobení pixelů, což snižuje nároky na paměťovou propustnost o 75 % a propůjčuje světlu přirozenou měkkost knižní ilustrace.

### 6. Bitmapový atlas pro čísla poškození (Glyph Cache)
- Při spuštění aplikace se číslice 0–9, desetinná čárka, znaménka a klíčové symboly stavů vykreslí do malé statické mezipaměti znaků s ladovskou tušovou konturou.
- Zobrazování plovoucích čísel poškození a léčení probíhá přenosem odpovídajících výřezů číslic namísto volání vektorových metod textu plátna.

## Testing Decisions

### Co tvoří dobrý test
- Testy ověřují výhradně vnější chování a invarianty na veřejném švu renderovacího modulu, nikoli interní pomocné implementační detaily.
- Testy nesmí záviset na reálném DOMu prohlížeče ani běžící grafické kartě; používají deterministický mock kontextu 2D plátna.

### Testované moduly a invarianty
1. **Veřejný šev renderovacího modulu**:
   - Ověření, že při volání renderu na platném stavu enginu nedochází k pádům ani výjimkám napříč různými fázemi dne a úrovněmi.
   - Ověření culling invariantu: entity a dekorace mimo definovaný výřez kamery nevolají žádné kreslicí operace.
   - Ověření návratových metrik snímku.
2. **Chunk mezipaměť dekorací**:
   - Ověření, že statické dekorace se do offscreen pláten generují pouze jednou při startu a v dalších snímcích se pouze přenášejí existující dlaždice.
   - Ověření správného mapování souřadnic kamery na indexy viditelných dlaždic.
3. **Bezalokační invariant (Zero-Allocation)**:
   - Ověření, že opakovaná volání renderovací funkce v testovací smyčce nealokují nová pole a nemění kapacitu vnitřních vyrovnávacích pamětí.
4. **Světelná pipeline v polovičním rozlišení**:
   - Ověření správného poměru zmenšení světelného bufferu a bezpečného škálování při změně rozměrů okna.

### Předchozí praxe v repozitáři (Prior Art)
- `tests/gameEngine.test.ts` – deterministické testování simulačního jádra bez závislosti na UI.
- `tests/storybookLighting.test.ts` – testování světelných výpočtů a dosahu Petrolejky.
- `tests/combatTextSettings.test.ts` – testování kategorizace a filtrace bojových textů.
- `tests/enemyRenderKinematics.test.ts` – testování fází a kinematiky entit nezávisle na plátně.

## Out of Scope

- Převod procedurální grafiky postav, strašidel a bossů na rastrové sprity nebo 3D modely.
- Změny v herní simulaci, časování nápřahů, parametrech zbraní nebo vyvažování Režiséra výpravy.
- Modifikace React komponent uživatelského rozhraní (vesnice, Dědečkova nůše, výběr lovce, modální dialogy).
- Využití vlastních GPU shaderů nebo nízkoúrovňového WebGL potrubí pro postavy (stále platí, že Ladův styl zůstává na 2D plátně).

## Further Notes

- Tato specifikace navazuje na architektonická rozhodnutí ADR 0002 (oddělení enginu od React UI), ADR 0003 (ladovské kvašové svícení) a ADR 0016 (kategorizace bojových textů).
- Po schválení a zahájení implementace bude vytvořen formální záznam v `docs/adr/0017-odmitnuti-phaseru-a-architektura-vykonnostni-pipeline.md`.
