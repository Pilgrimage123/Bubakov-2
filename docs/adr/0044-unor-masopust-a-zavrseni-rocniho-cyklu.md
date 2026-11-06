# ADR 0044: Únor v Hrusicích (Stages 23 a 24), Masopustní veselí, Bakchus a završení 24fázového ročního cyklu

## Stav
Přijato

## Kontext
Po implementaci 11 měsíců (Levely 0 až 21, tj. 22 výprav) zbýval finální měsíc tradičního českého lidového kalendáře: Únor. V ladovské tradici i české vesnické kultuře představuje únor vrchol masopustního veselí, obchůzku maškar (laufr, bába s nůší, kominík, krasojezdec na koníku, medvěd, slaměník), smažení koblih a následný dramatický přelom o masopustním úterý o půlnoci – pochovávání basy a nástup předvelikonočního půstu zosobněný rozpustilým i hrozivým králem pitek a maškar, Bakchem.

Implementací Února se uzavírá kompletní kampaňový kalendářní cyklus Bubákova na 24 kanonických fází (12 měsíců × 2 denní doby, interní ID 0 až 23).

## Rozhodnutí

1. **Stage 23 (Level ID 22, Den): 23. Únor v Hrusicích – Masopustní průvod**
   - **Aréna & Téma:** `unorova_naves`, téma `carnival_feast`, paleta jasného zimního dne se sněhem, stuhami a masopustními fábory.
   - **Interaktivní mechanika [E]:** *Smažení masopustních koblih* v Hostinci U Cikánů (`koblihy`). Hráč získá okamžitou obnovu +45 Kuráže a 10s rychlostní bonus +25 % (`player.speedMultiplier * 1.25`).
   - **Složení bossů (Rule of Trinity):**
     - MiniBoss (1:30): `masopustni_medved` (vedený medvědářem s řetězem, masivní kontaktní poškození a vysoké HP).
     - MeziBoss (3:15): `slamennik_obr` (vířící slaměná maškara rozhazující obilná zrnka).
     - VeleBoss (4:45): `rychtar_masek` (rychlý ceremoniář s masopustním právem, glejtem a ferulí).

2. **Stage 24 (Level ID 23, Noc): 24. Únor v Hrusicích – Půlnoční masopustní rej a pochování basy**
   - **Aréna & Téma:** `unorova_naves`, téma `carnival_night`, temná noční náves ozářená smolnými loučemi a lampiony.
   - **Interaktivní mechanika [E]:** *Pochování basy a rozsvícení smolných loučí* u Staré márnice / fary (`basa`). Poskytne hráči +100 dočasného štítu a vyzáří posvátnou rázovou vlnu (140 holy damage a 3s omráčení nepřátel v okruhu 260 px).
   - **Složení bossů:**
     - MiniBoss (1:30): `nocni_kobold` (lomcující stínový rarášek kradoucí koblihy).
     - MeziBoss (3:15): `umrlec_basista` (kostlivec s rozbitým smyčcem a basou hrající disharmonické tóny).
     - VeleBoss (4:45): `bakchus_s_pivnim_soudkem` – **Finální VeleBoss celého ročního cyklu**. 30 000 HP, poloměr 55 px, hmotnost 5.6, poiseResist 0.98, willpower 0.99, skóre 16 800 bodů.

3. **Autentický Ladovský vizuál (Canvas 2D):**
   - Všech 15 nových entit a maškar má vyhrazené procedurální metody v `src/render/ladaRenderer.ts` s tušovými konturami `#23170F`, lidovými zemitými barvami a přísně párovaným `ctx.save()` / `ctx.restore()`.
   - Všechny entity jsou registrovány v `BakedBubakAtlas` i v GPU animačním katalogu (`src/components/gpu-animation/enemyCatalog.ts`).
   - Žádné rastrové textury ani externí prototypové obrázky nebyly vloženy do složky `public/`.

4. **Duální parita (ADR 0037):**
   - Veškeré interakce klávesy [E], překážky budov a plotů (`resolveUnorObstacles`), skluz na zamrzlém rybníce a potoce (`getUnorWaterEffect`), zóny POI a mantinely arény (`clampToMarchArenaBounds`) jsou 1:1 zrcadleny v `src/game/engine.ts` a `src/App.tsx`.

5. **Strop opakování 7/2/1 a Pravidlo trojjedinosti vln:**
   - Žádný nepřítel nepřekračuje kampaňový strop (7 řadových, 2 mezi/mini, 1 veleboss).
   - Každá vlna v obou fázích striktně dodržuje trojjedinost: rojové/rychlé maškary (`masopustni_laufr`, `plivnik_uhlik`), těžkooděnci (`baba_s_nusi`, `smutecni_maskara`) a rušiči/letci (`masopustni_kominik`, `koblihovy_rarach`).

## Důsledky
- Kampaň Bubákova je kompletní a čítá 24 plnohodnotných fází (Level ID 0 až 23, Stages 1 až 24).
- 100% testů v celém projektu prochází (94 testovacích souborů, 895 testů).
- Produkční build (`npm run build`) probíhá čistě bez chyb a varování.
- Výpravy jsou plně lokalizovány do češtiny i angličtiny a integrovány do Pohádkové knihy (`LadaStorybookSpread.tsx`).
