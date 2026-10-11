# Dynamická obtížnost a posílení Režiséra výpravy

## Kontext
Při vysoce efektivních buildech zbraní a zkušeném kroužení po aréně docházelo k situacím, kdy hra ztratila tah a pro hráče byla příliš snadná. Současně pevný strop 75 entit (ADR 0002) chránící 60 FPS bránil prostému navyšování počtu nepřátel, a původní asistenční mechanika Režiséra výpravy byla pouze formální bez reálného herního dopadu.

## Rozhodnutí
Zavádíme volič **Dynamická obtížnost** s rozsahem 2.00× až 5.00× (výchozí stav 3.00× – Zlověstná noc / Bubácká polízanice) s whimsy Ladovskými názvy (2.00× Poklid za pecí, 2.50× Šramot za humny, 3.00× Zlověstná noc, 3.50× Čertovské posvícení, 4.00× Divoká tancovačka, 4.50× Hrusická šlamastyka, 5.00× Pekelné boží dopuštění) dostupný v předstartovní nabídce i nastavení hry.

Režisér výpravy získává sadu aktivních protiopatření a škálování až na 5.0×:
1. **Drtivý přepad & Všichni bubáci a buňky pro vyčerpání rozpočtu**: Po zachování 3.5sekundové fáze Oddychu (`lull`) Režisér zformuje masivní protiúder se dvěma obrněnými strážmistry a rojem záškodníků. Kdykoliv Režisér výpravy potřebuje vyčerpat svůj rozpočet hrozeb, má k dispozici všechny prostorové buňky (všech 8 směrů/sektorů bojiště) i všechny bubáky (včetně speciálních elitních variant: Červený diblík, Červený kostlivec, Kalný hastrman, Černý vlk z polesí, Obrněný zbojník, Močálová ropucha a všech denních fází úrovně) s přirozeným odečtem rozpočtu dle síly nestvůry.
2. **Klešťové sevření a Zrádný terén**: Při vytrvalém jednosměrném běhu či kroužení (> 3.5 s) klade Režisér 250 px před hráče zpomalující zóny (bláto / led) a vysílá strašidla z protilehlých úhlů.
3. **Ostřílení běsi**: Při naplnění stropu 75 entit je přebytečný rozpočet hrozeb investován do posílení existujících strašidel (odolnost proti omráčení a zvýšená rychlost) namísto nečinnosti.
4. **Škálovaná asistence & Rozpočet až do 5.00×**: Při poklesu Kuráže pod 50 % asistence na vysoké obtížnosti přibrzdí přísun hrozeb jen minimálně (až 15 % při 5.0× oproti 50 % na základní úrovni) a zachovává bojový tah.
5. **Whimsical Ladovská estetika bez krvelačnosti**: Všechny názvy nestvůr a obtížností jsou v souladu s Ladovou poetikou českých pohádek a humorem (např. Červený diblík, Rozpustilý sněhulák, Hospodář Čertova mlýna).

## Důsledky
Hráč je i s nejsilnější výbavou neustále vystaven taktickým výzvám a nucen aktivně měnit směr pohybu, aniž by došlo k propadům snímkové frekvence nebo neférovým okamžitým zraněním. Každá úroveň obtížnosti přináší zřetelnou gradaci a zachovává vlídný pohádkový tón.
