# Dynamická obtížnost a posílení Režiséra výpravy

## Kontext
Při vysoce efektivních buildech zbraní a zkušeném kroužení po aréně docházelo k situacím, kdy hra ztratila tah a pro hráče byla příliš snadná. Současně pevný strop 75 entit (ADR 0002) chránící 60 FPS bránil prostému navyšování počtu nepřátel, a původní asistenční mechanika Režiséra výpravy byla pouze formální bez reálného herního dopadu.

## Rozhodnutí
Zavádíme volič **Dynamická obtížnost** s rozsahem 1.00× až 2.00× (výchozí stav 2.00× – Pekelná štvanice) dostupný v předstartovní nabídce i nastavení hry. 

Režisér výpravy získává sadu aktivních protiopatření proti stereotypnímu hraní:
1. **Drtivý přepad**: Po zachování 3.5sekundové fáze Oddychu (`lull`) Režisér zformuje masivní protiúder se dvěma obrněnými veliteli a rojem záškodníků, kteří disponují úvodním zrychlením (+20 %) a odolností proti odhození (poise).
2. **Klešťové sevření a Zrádný terén**: Při vytrvalém jednosměrném běhu či kroužení (> 3.5 s) klade Režisér 250 px před hráče zpomalující zóny (bláto / led) a vysílá strašidla z protilehlých úhlů.
3. **Ostřílení běsi**: Při naplnění stropu 75 entit je přebytečný rozpočet hrozeb investován do posílení existujících strašidel (odolnost proti omráčení a zvýšená rychlost) namísto nečinnosti.
4. **Škálovaná asistence**: Při poklesu Kuráže pod 50 % asistence na maximální obtížnosti přibrzdí přísun hrozeb pouze o 25 % (oproti 50 % na základní úrovni) a zachovává bojový tlak.

## Důsledky
Hráč je i s nejsilnější výbavou neustále vystaven taktickým výzvám a nucen aktivně měnit směr pohybu, aniž by došlo k propadům snímkové frekvence nebo neférovým okamžitým zraněním.
