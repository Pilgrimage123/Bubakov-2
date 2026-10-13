# Sjednocení rejdového rozpočtu, trestání úspěchu a progresivní asistence

## Kontext
Režisér výpravy v dřívější verzi využíval přívlastky bubáků omezeně (vždy vybíral pouze první preferovaný typ z rozmaru), asistence při krizi byla vázána na binární hranici 50 % Kuráže a nejvyšší dynamická obtížnost (5.00× Pekelné boží dopuštění) netrestala drtivou dominanci hráče dostatečně nesmlouvavým způsobem. Zároveň plovoucí varovné texty nad hlavou lovce mohly na menších obrazovkách zakrývat bezprostřední bojové dění.

## Rozhodnutí
1. **Ocenění hrozeb dle hodnoty dropu**:
   - Cena strašidel v rejdovém rozpočtu Režiséra odpovídá jejich reálné nebezpečnosti a folklórní hodnotě dropů (`ENEMY_POINTS`), čímž se sjednocuje kalkulace dropů a zátěže scény.
2. **Brutální trestání úspěchu na nejvyšší obtížnosti**:
   - Při dynamické obtížnosti >= 4.5 a drtivé dominanci hráče (dominance >= 0.70) Režisér povolává do pole trestné **Dvojče minibosse** (přidaný miniboss dané úrovně se zvýšenou houževnatostí za 30 bodů rozpočtu).
   - Na nejnižší dynamické obtížnosti (<= 2.00× Poklid za pecí) Režisér úspěch hráče netrestá vůbec a multiplikátor tlaku nepřekračuje základní hodnotu.
3. **Progresivní asistence a přívlastek Vyčerpaný**:
   - Asistence není spínána binárním skokem, nýbrž plynulým indexem tísně kombinujícím nízkou Kuráž a nízkou dominanci hráče.
   - V tísni Režisér proporčně nasazuje strašidla s přívlastkem **Vyčerpaný** (`-50 %` rychlost pohybu, `-50 %` kadence útoků a `-50 %` Kuráž/HP strašidla), přičemž plná hodnota perníčků a předmětových dropů zůstává stoprocentně zachována.
4. **Nezakrytý výhled na bojiště**:
   - Veškeré telegrafy a varování Režiséra jsou směrovány do horního pruhu záhlaví (HUD banner) namísto plovoucích nápisů přímo nad postavou, což zaručuje čistý výhled i na displejích mobilních telefonů.
5. **Otevřený registr přívlastků**:
   - Architektura přívlastků (`EnemyPrefixDef`) je připravena pro snadné rozšiřování o další folklórní a tematické přívlastky bez zásahu do jádra enginu.

## Důsledky
Extrémní obtížnost nabízí brutální a neúprosnou výzvu pro zkušené hráče s okamžitou reakcí na dominanci. Hráč v nesnázích naopak dostává férovou šanci na vyváznutí díky vyčerpaným nepřátelům bez snížení odměn za jejich zdolání.
