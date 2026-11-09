# 05: Křídový Nápřah útoků a diskrétní kolébavý krok v 60 FPS Canvas cyklu

**What to build:** Folklórní telegraf útoků (Nápřah) a diskrétní 4-fázová papírová animace chůze (Squash & Stretch) podle ADR 0046. Místo pulzujících sci-fi kruhů se zóny úderu kreslí bílou křídou se šrafováním a postupně nátékající akvarelovou rumělkou, provázené přikrčením strašidla na 0,75× a tušovým vykřičníkem. Chůze strašidel je ukotvena do diskrétního 4-fázového kolébavého kroku (±5°, komprese výšky 0,9–1,1×), těžcí běsi pulzují s nízkým kmitočtem (2–3 Hz), což šetří snímkový rozpočet a eliminuje stroboskopický třes.

**Blocked by:** 01: Dvouúrovňová kaligrafická linka a ochrana siluet hordy před černou kaší, 02: Polarita 10% akcentní palety a morfologie střel (Oblé vs. Špičaté)

**Status:** closed

- [x] Upravit `src/render/renderTelegraphs.ts` na vykreslování křídového obrysu s tužkovým šrafováním a postupnou výplní tenkou akvarelovou rumělkou.
- [x] V `src/render/ladaRenderer.ts` implementovat fázi Nápřahu: stlačení (Squash) těla útočníka na 0,75×, zobrazení tušového vykřičníku a expanzi (Stretch) na 1,25× při úderu.
- [x] Zkonsolidovat cyklus chůze strašidel na 4 diskrétní fázové stavy (krok vlevo, střed, krok vpravo, střed) s náklonem ±5° vázaným na vektor pohybu.
- [x] Pro těžká strašidla (sudy, kance, hejkaly) zavést vertikální pulzaci s nízkým kmitočtem bez bočního kolébání.
- [x] Ověřit plynulost animací při 300 strašidlech současně v 60 FPS smyčce bez propadů.
