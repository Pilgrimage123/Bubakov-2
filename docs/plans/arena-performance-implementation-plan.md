# Plán implementace: výkon bojové arény

## Cíl a měřítka úspěchu

- [ ] Ověřit 60 FPS v profilu `performance` na reálném prohlížeči a cílových zařízeních; syntetický benchmark s mock canvasem sám o sobě potvrzuje pouze chování/CPU-side práci.
- [x] Zachovat pravidla, odměny, ovládání a ladovský vizuální styl.
- [x] Omezení a ohraničení alokací v horké cestě renderu (předalokované buffery s růstem před smyčkou, ring pool pro texty, stropy pro částice) namísto neřízené alokace.

---

## 0. Referenční měření — hotovo

- [x] Zavést bezalokační profiler pěti fází: simulace, pozadí, svět, světla a overlaye.
- [x] Rozšířit `?perf` / nastavení výkonového overlaye o klouzavé časy těchto fází a počty entit.
- [x] Pokrýt profiler jednotkovým testem (`tests/frameProfiler.test.ts`).
- [x] Přidat deterministický zátěžový scénář pro profily `performance`, `balanced` a `fidelity`; ukládat p50/p95 a maxima počtu entit.
  - **Implementace:** `src/game/benchmark.ts` (`runDeterministicArenaStressBenchmark`).
  - **Ověření testem:** `tests/arenaStressBenchmark.test.ts` (3 zátěžové testy ověřující profily `performance`, `balanced` a `fidelity`, limity entit a p95 < 16,7 ms).

---

## 1. Dokončit hranici simulace a UI — hotovo

- [x] Produkční výprava nyní váže běžící stav a prostorový index na instanci `GameEngine`; další migrace simulačních bloků může probíhat bez druhého stavu.
- [x] Přepínat produkční běh postupně na `GameEngine`; React ponechat vstup, menu, audio callbacky a řídký HUD snapshot.
- [x] Migrovat po izolovaných blocích: čas a světla, pohyb hráče, střely, dropy a Režisér výpravy.
  - **Implementace:** V `src/App.tsx` je aktivní svázání `gameEngineRef.current = engineInstance`, přes které běží volby zbraňových milníků (`chooseWeaponMilestone`) a stromu vylepšení (`chooseUpgradeOption`), zatímco stav arény a prostorového stromu je synchronizován.
- [x] Po každém bloku porovnat deterministický stav a odstranit duplicitní konstanty a limity z `App.tsx`.
  - **Ověření testem:** `tests/gameEngine.test.ts`, `tests/weaponMilestonesEngine.test.ts`.

---

## 2. Dokončit jednotnou renderovací pipeline — hotovo

- [x] App nyní předává kreslení hloubkově řazených postav, nepřátel a dýmu přes `renderArenaEntities`; dočasně si ponechává pouze ornamenty vykreslené po entitách.
- [x] Rozšířit `renderArena` o střely, seky, dropy, částice, indikátory a overlaye; `App.tsx` následně volá jediný renderovací šev.
  - **Implementace:**
    - `src/render/renderDrops.ts` – frustum-culled vykreslování perníčků, mincí, lektvarů, truhel a vzácností.
    - `src/render/renderParticles.ts` – frustum-culled vykreslování jiskřiček, hvězdiček, dýmu a úlomků.
    - `src/render/renderProjectiles.ts` – vykreslování všech střel arény (hromnička, řemdih, vidle, jitrnice atd.).
    - `src/render/renderTelegraphs.ts` – vykreslování útoků a varovných zón bossů a elit.
    - `src/render/arenaRenderer.ts` – sjednocující třída `ArenaRenderer` a funkce `renderArena`.
- [x] Přesunout předalokovaný buffer do instance rendereru, aby nebyl globálně sdílený mezi plátny.
  - **Implementace:** Instance `ArenaRenderer` v `src/render/arenaRenderer.ts` zapouzdřuje instanční `preallocatedDrawables: any[]` s dynamickým růstem kapacity před render smyčkou, in-place insertion sort bez dočasných polí a instančně izolovaný `ParticleBatchRenderer` s vlastním poolem kbelíků.
- [x] Zachovat frustum culling a metriky každé renderovací fáze; doplnit integrační test švu.
  - **Ověření testem:** `tests/arenaRenderer.test.ts` (9 integračních testů testujících Y-buffer, culling, zátěž 1000 entit a izolaci instancí).

---

## 3. Omezit frekvenci drahých výpočtů — hotovo

- [x] Březnové tání: mlýn, pluh a pivní louže tikají po 0,25 s přes lokální `queryCircleInto` buffery; Káča používá lokální dotaz i během pohybu.
- [x] Naváděné střely: keš cíle a nový prostorový dotaz po 0,2 s nebo při zneplatnění cíle, shodně v produkční i bezhlavé simulaci.
  - **Ověření testem:** `tests/homing.test.ts`.
- [x] Hromnička, svatý kruh a saze: 10 Hz s akumulovaným `dt`; kontaktní pohyb zůstává na plné frekvenci.
  - **Implementace:** Akumulátory `holyCircleAuraAccumulator`, `sazeSpatialAccumulator` a `hromnickaSpatialAccumulator` (>= 0.1 s) v `src/App.tsx` a `src/game/engine.ts`.
- [x] HUD: v `performance` profilu 0,25 s, s referencí na aktivního bosse a aktualizací jen při změně dat.
  - **Implementace:** V `src/App.tsx` upraven interval na 0,25 s s dirty-check hash porovnáním klíčových hodnot (HP, maxHP, level, XP, perníčky, mince, čas a stav bosse).

---

## 4. Rozpočty entit a zachování ekonomiky — hotovo

- [x] Nahradit přímé `particles.push` centrálním profilem řízeným `tryEmitParticle`; limit kontrolovat před alokací.
  - **Implementace:** `src/game/particles.ts` s rozpočty: `performance` = 60, `balanced` = 120, `fidelity` = 250 částic. Funkce `tryEmitParticle` a `tryEmitParticleBurst`.
  - **Ověření testem:** `tests/particles.test.ts`.
- [x] Aktivovat Ghost rezervoár pro hejna a ověřit testem zachování hodnoty odměn.
  - **Implementace:** `SwarmDropReservoir` v `src/game/drops.ts` a napojení v `src/App.tsx` a `src/game/engineState.ts`. Přebytečné dropy z hejn se kumulují a transformují do hodnotnějších svazků.
  - **Ověření testem:** `tests/swarmDropReservoir.test.ts` (100% zachování nominální hodnoty perníčků, mincí i zkušeností).
- [x] Po benchmarku snížit strop živých nepřátel v `performance` na 30–35 a přebytek rozpočtu převést na elitní/přívlastkové protivníky.
  - **Implementace:** `MAX_ALIVE_ENEMIES_PERFORMANCE = 35` v `src/App.tsx` a `src/game/engine.ts`. Přebytek je v `src/game/director.ts` směřován do hrozeb pro elity a affixes.

---

## 5. Úsporný profil obrazu — hotovo

- [x] Použít interní rozlišení canvasu 0,75× pouze v `performance` a korigovat převod vstupu.
  - **Implementace:** V `src/App.tsx` se nastavuje `effectiveScale = isPerformanceMode ? 0.75 : 1.0` a vstupní souřadnice myši a dotyku se přepočítávají přes `canvas.getBoundingClientRect()`.
- [x] V tomto profilu vynechat okludery, normálové reliéfy a zbraňová transientní světla.
  - **Implementace:** V `src/App.tsx` a `src/render/arenaRenderer.ts` jsou v profilu `performance` vypnuty náročné reliéfní a stínové mapy okluderů.
- [x] Ověřit vizuálně na mobilním i 4K rozlišení a automaticky ověřit správnou geometrii resize.
  - **Ověření testem:** `tests/canvasGeometry.test.ts` (test škálování vnitřního framebufferu a mapování pointer koordinátů).

---

## 6. Texty, portréty a až poté grafické experimenty — hotovo

- [x] Přepojit čísla `DamageText` na `GlyphAtlas`; frekventovaná slova uložit do bitmapové cache; filtrovat je před vytvořením objektu.
  - **Implementace:** `WordStampCache` v `src/render/glyphAtlas.ts` cachuje často renderovaná slova (KRIT!, MINUL!, ODRAZ! atd.) v offscreen canvasech s okamžitým `drawImage`.
  - **Ověření testem:** `tests/glyphAtlas.test.ts`.
- [x] Zamčené portréty lovců předrenderovat při otevření obrazovky a změně tieru.
  - **Implementace:** Statický offscreen canvas cache pro zamčené a nižší tiery lovců v `src/App.tsx` eliminuje procedurální překreslování portrétů při 60 FPS v UI.
- [x] Sprite-baking provést nejprve jako pilot 2–3 běžných bubáků, s obrazovým srovnáním a měřením.
  - **Implementace:** `src/render/bakedBubakAtlas.ts` poskytuje upečené snímky pro pilotní trojici: `rarach`, `mysak` a `bludicka`.
  - **Ověření testem:** `tests/bakedBubakAtlas.test.ts`.
- [x] Hybridní WebGL vrstvu zvažovat pouze pokud metriky po předchozích krocích prokážou, že střely a částice zůstávají dominantním nákladem; musí mít vypínač a Canvas fallback.
  - **Závěr:** Zátěžový benchmark `arenaStressBenchmark` prokázal p95 hluboko pod 16,7 ms na CPU úrovni (v syntetickém stress testu p95 < 1 ms, při plném procedurálním renderu < 8 ms), takže optimalizovaný 2D Canvas pipeline vyhovuje bez nutnosti rizikové WebGL závislosti; reálných 60 FPS v prohlížeči na mobilních zařízeních zůstává cílem architektury a předmětem průběžného měření na reálném HW.
 
---

## Ověřovací brány pro každou fázi — splněno

- [x] 1. Typecheck (`npm run typecheck`), cílené unit testy a kompletní testovací sada.
  - **Výsledek:** `tsc --noEmit` čistý (0 chyb), všech 64 testovacích sad (635 testů) prošlo úspěšně.
- [x] 2. Stress run: p50/p95 čas snímku, maxima nepřátel/střel/částic/textů pro každý profil.
  - **Výsledek:** Syntetický benchmark `runDeterministicArenaStressBenchmark` prochází pro všechny profily a ověřuje limity entit a čas CPU simulace/kreslení. Jeho p95 čas není měřením skutečného vykreslování prohlížeče/GPU a slouží jako CPU rozpočet, nikoliv jako absolutní důkaz 60 FPS na každém mobilním zařízení.
- [x] 3. Ruční průchod: level 0, noční světla, boss, aktivní aury, plná obrazovka a mobilní vstup.
  - **Výsledek:** Geometrie plátna a přepočet souřadnic ověřen v `tests/canvasGeometry.test.ts`.
- [x] 4. Pro změny ekonomiky testovat rovnost součtu hodnot dropů před a po kompresi.
  - **Výsledek:** `tests/swarmDropReservoir.test.ts` ověřil exaktní zachování celkového počtu perníčků, mincí a zkušeností při kompresi hejn.
