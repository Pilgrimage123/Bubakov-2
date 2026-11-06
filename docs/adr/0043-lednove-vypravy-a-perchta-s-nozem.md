# ADR 0043: Lednové výpravy (Stages 21 a 22) a folklórní boss Šeredná Perchta s nožem

## Stav
Přijato

## Kontext
Po zavedení Listopadu a Prosince (ADR 0042, úrovně 16–19) chybělo propojení ročního cyklu do mrazivého lednového období. V české lidové a ladovské tradici představuje leden období hluboké zimy, obchůzek Tří králů a přísného půstu spojeného s obávanou folklórní postavou Perchty (ve zvykosloví označované jako Perchta s nožem či šeredná bába rozpárající břicha těm, kdo nedodrželi půst).

Bylo nutné vytvořit:
1. **Stage 21 (Level ID 20, Den):** *21. Leden v Hrusicích – Tříkrálová koleda a sníh* (`lednova_zavej`). Denní stavění sněhuláka na návsi u kašny, koledníci s hvězdou a hluboké závěje. MiniBoss `obri_snehulak`, MeziBoss `trikralovy_jezdec`, VeleBoss `vladce_chumelenice`.
2. **Stage 22 (Level ID 21, Noc):** *22. Leden v Hrusicích – Tříkrálová noc a perchta* (`lednova_zavej`). Noční svěcení fary křídou K+M+B na dveřích. MiniBoss `ledova_klekanice`, MeziBoss `kostlivec_s_kosou`, VeleBoss `perchta_s_nozem`.

## Rozhodnutí

1. **Boss Perchta s nožem (`perchta_s_nozem`):**
   - VeleBoss s 26 000 HP, poloměrem 52 px a hmotností 5.4.
   - Odolnost proti sražení (`poiseResist: 0.98`) a vůle (`willpower: 0.99`), kategorie `bosses`, klasifikována jako `isUnholy`.
   - Vizuál čistě v Ladovském stylu (procedurální Canvas 2D, tmavá plachetka, vetchý kožich, dlouhý lesklý ocelový nůž a nůžky) s vyváženým `ctx.save()` / `ctx.restore()`.

2. **Aréna Lednová závěj (`src/data/ledenArena.ts`) a ledové plochy:**
   - Hrusický rybník i potok jsou v lednu kompletně zamrzlé na pevný led.
   - Pohyb po ledu poskytuje skluzný rychlostní bonus (1.15× pro rybník, 1.10× pro potok) bez zpomalování vodou. Most poskytuje stabilní trakci (1.0×).

3. **Duální parita (ADR 0037):**
   - Mechanika interakce [E] pro stavění sněhuláka (Day: +30 kuráž, rázová vlna s 70 poškozením a sněhový štít) i svěcení křídou K+M+B (Night: +75 štít, plošné omráčení a 120 posvátného poškození) je 1:1 zrcadlena mezi `engine.ts` a `App.tsx`.
   - Všechny 4 body parity v `App.tsx` (hráč, nepřátelé, drop clamping, Dědeček) jsou přesně implementovány pro `activeLevelId === 20 || activeLevelId === 21`.

4. **Kanonické limity a pravidla Trinity:**
   - Všech 13 nových lednových entit a bossů splňuje kampaňový strop opakování 7 / 2 / 1.
   - Všechny denní i noční vlny v `src/data/levels.ts` splňují Pravidlo trojjedinosti vln (hejno + těžkooděnec + letec/narušitel).

## Důsledky
- Kampaň nyní čítá 22 plně hratelných a otestovaných fází (Level 0 až Level 21).
- 100% úspěšnost testů v `tests/level20Leden.test.ts`, `tests/allStagesAudit.test.ts` i `tests/allStagesMapsAndSeasons.test.ts`.
- Zbývá závěrečný krok ročního cyklu: Únor (Stages 23 a 24 – Masopust a pochovávání basy).
