# 06: Kreslené stavové efekty bez RGB tintu a knižní viněta Zoufalé kuráže

**What to build:** Fyzické kreslené ztvárnění stavových efektů na kvašových postavách a indikace kritické Kuráže podle ADR 0047. Zmrazení, zapálení a zpomalení se nezobrazují digitálním RGB přebarvováním spritu, ale kreslenými folklórními rekvizitami (průsvitné rampouchy, odletující uhlíky se sazemi na okrajích, stříkající kapky bláta či pěny). Pokles Kuráže lovce pod 35 % aktivuje sepia vinětu staré knižní vazby s tužkovým šrafováním v rozích, komické kapky potu a poplašený dým z fajfky.

**Blocked by:** 01: Dvouúrovňová kaligrafická linka a ochrana siluet hordy před černou kaší

**Status:** closed

- [x] V `src/render/ladaRenderer.ts` nahradit barevné tónování entit kreslenými doplňky pro zmrazení (rampouchy z klobouku/oděvu), zapálení (uhlíky, stoupající kouř a sazové šrafování) a zpomalení (kapky bláta/pěny).
- [x] V `src/render/arenaRenderer.ts` nahradit generickou červenou vinětu nízkého zdraví pohádkovou knižní vinětou: teplé zažloutnutí okrajů v tónu starého papíru a jemné knižní šrafování v rozích obrazovky.
- [x] Implementovat vizuální reakci lovce při Zoufalé kuráži (<35 % Kuráže): animované kapky potu, nervózní zrychlený krok a hustý dým z fajfky.
- [x] Ověřit, že stavové efekty nezatěžují vykreslovací cyklus a zachovávají plnou krásu kvašové ilustrace.
- [x] Zkontrolovat integritu testů bojových stavů a poškození.
