# Chytrý drop systém a folklórní pomocné předměty

Architektura dropů v Bullet Heaven žánru musí vyvážit výkon při tisících nepřátel, dynamickou adaptaci na stav lovce a silné herní flow. V Bubákově jsme tyto principy implementovali s důrazem na českou folklórní identitu a doménový model:

1. **Mapování progrese a Overkill:** Jelikož hra nepoužívá XP krystaly, veškerá progrese běží přes Voňavé perníčky (pro Dědečkovu nůši) a Krejcary (vesnická měna). Overkill poškození (> 200 % max Kuráže bubáka) komprimuje dropy do vyšších řádů (Velké za 6 a Obří za 20), což odstraňuje nevýhodu pomalých úderných zbraní vůči plošnému spamu.
2. **Context-Aware a Záchranný systém (Emergency Bias):** Při plné Kuráži (100 %) se léčivé dropy (hrušky a jitrnice) přelévají do Krejcarů a Hrnců s dušičkou. Při poklesu Kuráže pod 25 % systém dramaticky zvyšuje šanci na záchranné předměty z elitních bubáků a vystřeluje je do střední vzdálenosti (250–350 px), čímž nutí lovce prorazit si cestu chuchvalcem bubáků.
3. **Folklórní mocné předměty:** Namísto generických magnetů a bomb zavádíme tématické ladovské předměty s Pity Timerem (45 s cooldown):
   - **Kovářská podkova:** Magnet přitahující veškeré perníčky, krejcary a dušičky na mapě (garantovaný drop při nahromadění > 120 perníčků po 20 s).
   - **Hliněný kohoutek:** Board Clear – ranní zakokrhání zažene všechny běžné bubáky a bossům udělí masivní svaté poškození.
   - **Vyřezávané kukačky:** Time Stop – znehybní všechny bubáky a střely na 4 sekundy.
4. **Agregace scény a Ghost rezervoár:** Pevný limit 250 dropů na scéně spouští fúzní slévání nejstarších mimoobrazovkových perníčků a mincí do větších celků bez ztráty hodnoty. Slabá hejna (swarms) nezasypávají zem jednotlivými předměty, ale jejich hodnota se kumuluje do rezervoáru uvolněného až po zahnání vůdce roje.
5. **Rizikové zóny:** Dropy z bubáků poražených ve velké vzdálenosti (> 420 px) se stávají Horkými perníčky s 3s časovačem na 2× výnos, což podněcuje aktivní kiting a pohyb po louce.
