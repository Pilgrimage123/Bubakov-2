# 04: Únor – Noc: Masopustní rej a pochovávání basy (Stage 24 / Level 23)

**What to build:** Vrcholná 24. fáze a grandiózní finále celoročního cyklu Hrusic (Stage 24: Noční masopustní rej a pochovávání basy). Vesnice se ponoří do sychravého mrazivého soumraku, kde se rozjíždí noční smuteční rej se zapálenými smolnými loučemi. Hráč může u staré márnice provést obřad pochovávání basy, který na čas zažene a ochromí všechny noční běsy. Výzvu završuje finální triáda nočních masopustních bossů: MiniBoss Noční kobold, MeziBoss Umrlec basista a VeleBoss Bakchus s pivním soudkem.

**Blocked by:** 03: Únor – Den: Masopustní průvod a koblihy (Stage 23 / Level 22)

**Status:** closed

- [x] Rozšířit `GameLevelId` v `src/types.ts` o hodnotu `23` a nastavit noční fázi v `src/constants.ts` a `isNightLevel`.
- [x] Definovat noční maškary, umrlce a bossy v `src/data/enemies.ts` a sestavit noční spawn pooly pro Level 23 v `src/data/levels.ts`.
- [x] Implementovat Ladovské procedurální vykreslování v `src/render/ladaRenderer.ts`, baked atlas a GPU katalog pro noční maškary.
- [x] Přidat noční POI v `src/data/unorArena.ts` (pochovávání basy) a vykreslování loučí v `src/render/renderWorldHazards.ts`.
- [x] Zapojit noční vraní vlny v `src/game/virtualLeaderCrowWave.ts` pro Level 23.
- [x] Implementovat dual parity logiku v `src/game/engine.ts` a `src/App.tsx`.
- [x] Doplnit překlady CS/EN, odemykací logiku z Levelu 22 na 23 a finální trofej `level23_completed`.
- [x] Pokrýt noční masopustní mechaniky jednotkovými testy.
