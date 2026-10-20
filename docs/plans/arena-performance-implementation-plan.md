# Plán implementace: výkon bojové arény

## Cíl a měřítka úspěchu

- V profilu `performance` udržet 60 FPS při zátěžovém scénáři; p95 snímku pod 16,7 ms.
- Zachovat pravidla, odměny, ovládání a ladovský vizuální styl.
- Nulové alokace v horké cestě renderu a žádné neomezené vytváření částic či textů.

## 0. Referenční měření — hotovo

- [x] Zavést bezalokační profiler pěti fází: simulace, pozadí, svět, světla a overlaye.
- [x] Rozšířit `?perf` / nastavení výkonového overlaye o klouzavé časy těchto fází a počty entit.
- [x] Pokrýt profiler jednotkovým testem.
- [ ] Přidat deterministický zátěžový scénář pro profily `performance`, `balanced` a `fidelity`; ukládat p50/p95 a maxima počtu entit.

## 1. Dokončit hranici simulace a UI

- [~] Produkční výprava nyní váže běžící stav a prostorový index na instanci `GameEngine`; další migrace simulačních bloků může probíhat bez druhého stavu.
- Přepínat produkční běh postupně na `GameEngine`; React ponechat vstup, menu, audio callbacky a řídký HUD snapshot.
- Migrovat po izolovaných blocích: čas a světla, pohyb hráče, střely, dropy a Režisér výpravy.
- Po každém bloku porovnat deterministický stav a odstranit duplicitní konstanty a limity z `App.tsx`.

## 2. Dokončit jednotnou renderovací pipeline

- [~] App nyní předává kreslení hloubkově řazených postav, nepřátel a dýmu přes `renderArenaEntities`; dočasně si ponechává pouze ornamenty vykreslené po entitách.
- Rozšířit `renderArena` o střely, seky, dropy, částice, indikátory a overlaye; `App.tsx` následně volá jediný renderovací šev.
- Přesunout předalokovaný Y-buffer do instance rendereru, aby nebyl globálně sdílený mezi plátny.
- Zachovat frustum culling a metriky každé renderovací fáze; doplnit integrační test švu.

## 3. Omezit frekvenci drahých výpočtů

- [x] Březnové tání: mlýn, pluh a pivní louže tikají po 0,25 s přes lokální `queryCircleInto` buffery; Káča používá lokální dotaz i během pohybu.
- [x] Naváděné střely: keš cíle a nový prostorový dotaz po 0,2 s nebo při zneplatnění cíle, shodně v produkční i bezhlavé simulaci.
- Hromnička, svatý kruh a saze: 10 Hz s akumulovaným `dt`; kontaktní pohyb zůstává na plné frekvenci.
- HUD: v `performance` profilu 0,25 s, s referencí na aktivního bosse a aktualizací jen při změně dat.

## 4. Rozpočty entit a zachování ekonomiky

- Nahradit přímé `particles.push` centrálním profilem řízeným `tryEmitParticle`; limit kontrolovat před alokací.
- Aktivovat Ghost rezervoár pro hejna a ověřit testem zachování hodnoty odměn.
- Po benchmarku snížit strop živých nepřátel v `performance` na 30–35 a přebytek rozpočtu převést na elitní/přívlastkové protivníky.

## 5. Úsporný profil obrazu

- Použít interní rozlišení canvasu 0,75× pouze v `performance` a korigovat převod vstupu.
- V tomto profilu vynechat okludery, normálové reliéfy a zbraňová transientní světla.
- Ověřit vizuálně na mobilním i 4K rozlišení a automaticky ověřit správnou geometrii resize.

## 6. Texty, portréty a až poté grafické experimenty

- Přepojit čísla `DamageText` na `GlyphAtlas`; frekventovaná slova uložit do bitmapové cache; filtrovat je před vytvořením objektu.
- Zamčené portréty lovců předrenderovat při otevření obrazovky a změně tieru.
- Sprite-baking provést nejprve jako pilot 2–3 běžných bubáků, s obrazovým srovnáním a měřením.
- Hybridní WebGL vrstvu zvažovat pouze pokud metriky po předchozích krocích prokážou, že střely a částice zůstávají dominantním nákladem; musí mít vypínač a Canvas fallback.

## Ověřovací brány pro každou fázi

1. Typecheck, cílené unit testy a kompletní testovací sada.
2. Stress run: p50/p95 čas snímku, maxima nepřátel/střel/částic/textů pro každý profil.
3. Ruční průchod: level 0, noční světla, boss, aktivní aury, plná obrazovka a mobilní vstup.
4. Pro změny ekonomiky testovat rovnost součtu hodnot dropů před a po kompresi.
