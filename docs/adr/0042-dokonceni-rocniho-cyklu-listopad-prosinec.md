# 0042. Dokončení ročního cyklu: Listopad a Prosinec (Výpravy 17–20) a audit kodexu

Datum: 2026-11-06  
Stav: Přijato  
Vazba: `docs/STAGE_CREATION_GUIDE.md`, ADR 0036, ADR 0037, ADR 0038, ADR 0041

## Kontext

Kampaň Bubákova po zavedení Října pokrývala 16 výprav (GameLevelId 0–15). Pro uzavření kompletního 12měsíčního folklórního roku Josefa Lady chyběly poslední dva měsíce:
1. **Listopad (Výpravy 17 a 18 / GameLevelId 16 a 17)**: Svatomartinské posvícení (den) a Listopadové mrazy a mlhy (noc).
2. **Prosinec (Výpravy 19 a 20 / GameLevelId 18 a 19)**: Adventní trh a svatý Mikuláš (den) a Štědrovečerní noc a mrazivý chlad (noc).

Při implementaci podle `docs/STAGE_CREATION_GUIDE.md` v2.2 byl proveden hloubkový audit všech 9 vrstev systému, který odhalil 6 skrytých architektonických požadavků nepodchycených v původním znění kodexu:
1. `src/render/renderWorldHazards.ts`: Povinné sekce pro kreslení nápovědního banneru (`engine.*ActivePoiPrompt`) a vizuálního kruhu dosahu interaktivního POI.
2. `src/render/chunkCache.ts`: Registrace prefixu dynamických dekorací měsíce v `isDynamicItem`, bez níž dochází k artefaktům v chunkové paměti.
3. `src/render/bakedBubakAtlas.ts`: Registrace atlasových framů a rozměrů pro GPU instancovaný atlas nových monster.
4. `src/data/runArchetypes.ts`: Striktně typovaný záznam `RUN_ROZMARY[levelId]` vyžadující přesně 2 kanonické runové rozmary s validním `formationBias`.
5. `src/components/LadaStorybookSpread.tsx`: Registrace kolíku výpravy v `MAP_SIGNPOSTS` pro zobrazení na pohádkové knižní mapě.
6. `src/render/arenaRenderer.ts`: Duální culling – 3200px frustum limit pro `<mesic>_border` musí být aplikován jak v chunked cache průchodu, tak v nouzovém unchunked průchodu.

## Rozhodnutí

1. **Implementace Listopadu (Výpravy 17 & 18)**:
   - **Aréna**: `listopadove_posviceni` (`src/data/listopadArena.ts`) s 9 POI, proudícím potokem a překážkami s polygonovými kolizemi.
   - **Mechaniky [E]**:
     - Den: `[E] Upéct husu v pekáči (Hospoda Na Rychtě)` – pekáč plný husích stehen dodá lovci okamžité léčení (+30 Kuráže) a rázovou vlnu.
     - Noc: `[E] Přiložit do milíře (Uhlířský milíř)` – rozdmýchání žáru vytvoří ohnivou auru pálící okolní běsy.
   - **Monstra & Bossové**: `svatomartinska_husa`, `divoky_kanec`, `lesni_pytlak`, `kralovska_husa`, `martinsky_jezdec`, `listopadovy_mrazivec`, `mlzny_prizrak`, `cerny_myslivec`, `kanec_knour`, `jezdec_meluziny`.
   - **Pravidlo trojjedinosti vln**:
     - Den (16): Drobná havěť (`krecek_obilnik`), těžký běžec (`divoky_kanec`), taktický letec (`svatomartinska_husa`).
     - Noc (17): Havěť (`zaba`), těžký běžec (`cerny_myslivec`), taktický letec (`lesni_pytlak`).

2. **Implementace Prosince (Výpravy 19 & 20)**:
   - **Aréna**: `prosincovy_advent` (`src/data/prosinecArena.ts`) s 9 POI, zamrzlým potokem se skluzem a sněhovými závějemi.
   - **Mechaniky [E]**:
     - Den: `[E] Zapálit adventní svíci (Adventní věnec na návsi)` – zažehnutí adventní svíce udělí lovci Štěstí a zrychlení.
     - Noc: `[E] Zazvonit na zvon (Zvonice sv. Mikuláše)` – posvátný úder zvonu omráčí všechny běsy v aréně na 3 sekundy.
   - **Monstra & Bossové**: `ledovy_rampousik`, `snehova_jezinka`, `cert_s_pytlem`, `maskarni_kozel`, `mikulassky_cert`, `mraziva_sova`, `kral_mrazik`.
   - **Pravidlo trojjedinosti vln**:
     - Den (18): Havěť (`ledovy_rampousik`), těžký běžec (`cert_s_pytlem`), taktický letec (`sazovy_rarach`).
     - Noc (19): Havěť (`ledovy_rampousik`), těžký běžec (`snehova_jezinka`), taktický letec (`mraziva_sova`).

3. **Plná parita systémů (ADR 0037)**:
   - Všechny POI stavy, cooldowny, překážky i omezovače dropů byly implementovány 1:1 v `src/game/engine.ts` i `src/App.tsx`.
   - V `src/render/renderWorldHazards.ts` doplněny vizuální aury dosahu i textové nápovědní proužky.

4. **Aktualizace STAGE_CREATION_GUIDE.md na verzi 2.3**:
   - Tabulka 2.1 rozšířena na 20 úrovní.
   - Do mapy 9 vrstev a checklistu přidáno všech 6 auditních zjištění.
   - Přidány nové varovné pasti (Past č. 9 – chybějící rozmary, Past č. 10 – duchový HUD banner, Past č. 11 – zamrzlá chunková mezipaměť).

## Důsledky

- Kalendářní cyklus Hrusic je kompletní: celkem 20 výprav v 10 krajích pokrývá celý rok od jarního tání po Štědrý večer.
- Všech 92 testovacích sad (872 testů) prochází se 100% úspěšností.
- Produkční sestavení Vite (`npm run build`) probíhá bez varování.
- Vývojářská příručka `STAGE_CREATION_GUIDE.md` je plně synchronní se skutečným stavem kódu.
