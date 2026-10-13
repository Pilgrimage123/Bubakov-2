# Odstranění skrytých bonusů nepřátel (Zero-Hidden-Cheat Policy)

## Kontext
V dřívějších iteracích simulace docházelo k tomu, že Režisér výpravy při vysoké dominanci hráče skrytě navyšoval rychlost a odolnost proti omráčení/odhození nepřátel (`pressureMultiplier > 1.2` vedl k buffům až +40 % rychlosti a skrytému zvyšování `poiseResist`). Dále továrna nepřátel (`createHeadlessEnemy` a `createEnemyInstance`) aplikovala skryté multiplikátory životů, umělé navyšování parametrů minibossů a level-specifická snížení rychlosti. Tyto skryté úpravy vedly k nepředvídatelnému chování nepřátel a odporovaly principu férového souboje.

## Rozhodnutí
Zavádíme striktní zásadu, že nepřátelé nezískávají žádné skryté bonusy:
1. **Základní statistiky z bestiáře**: Každé strašidlo se líhne výhradně se svými základními statistikami definovanými v `src/data/enemies.ts` (`hp`, `damage`, `speed`, `poiseResist`, `foodResist`, `willpower`). Odstraňují se jakékoliv skryté multiplikátory HP a umělá navyšování odolností či poškození pro minibosse.
2. **Jediné povolené modifikace**:
   - Explicitní vlastnosti a folklórní schopnosti nepřátel (např. Stínová záštita pro kategorii stínů ve tmě s mechanikou světla Petrolejky, aura Bludičky, fázované schopnosti bossů).
   - Zřetelné přívlastky monster z `ENEMY_PREFIX_DEFS` (Vichřicový, Hromový, Kamenný, Pekelný) s vizuální aurou a indikátory.
3. **Režisér výpravy a taktické formace**:
   - Režisér moduluje obtížnost výhradně četností střetnutí, rozpočtem hrozeb a nasazováním taktických formací či elitních variant z fondu úrovně.
   - Odstraňují se všechny skryté dynamické buffy navázané na `pressureMultiplier`. Taktické role ve formacích (např. obkličující křídla s pevným 1.1–1.15× bonusem rychlosti) zůstávají zachovány.

## Důsledky
Herní střetnutí jsou plně čitelná a předvídatelná. Znalost vlastností nepřátel z Bestiáře je stoprocentně spolehlivá a chování monster není zkreslováno neviditelnými statovými postihy hráče za úspěšný postup.
