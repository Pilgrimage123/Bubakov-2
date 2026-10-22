# Virtual Leader, Efektivní kapacita bojiště a šetření slotů pro formace

Zavádíme architekturu efektivní kapacity bojiště pro Režiséra výpravy (`RunDirector`), která harmonizuje líhnutí hejn s virtuálním vůdcem (`VirtualLeaderCrowWave`), eliminuje překračování stanoveného stropu živých nepřátel a nahrazuje numerické zahlcování scény kvalitativním škálováním obtížnosti.

## Kontext a důvody
1. **Zátěž na výkon namísto síly jednotek**: V bullet heaven hrách vede naivní zlevňování slabých potvor k propadu FPS, protože 50 samostatných entit vyžaduje 50 individuálních kolizních, pohybových a renderovacích operací. Pouze jednotky s virtuálním vůdcem (Virtual Leader), kde se celá formace pohybuje $O(N)$ deterministickou matematikou a broadphase kruhem, generují zanedbatelnou výpočetní režii.
2. **Přetížení Režiséra hejnem vran**: Zavedení 150 vran v 1. úrovni přes `VirtualLeaderCrowWave` způsobovalo zahlcení Režiséra výpravy, který vnímal 150 samostatných těl, okamžitě zablokoval své taktické spawny a zablokoval přechod do fáze Oddychu (`lull`).
3. **Překračování stropu při formacích a přepadech**: Taktické formace (Kladivo a kovadlina, Klešťové sevření, Eskortní roje) a Drtivý přepad dosud líhly pevný počet jednotek bez ověření zbývajícího prostoru pod stropem `maxLivingEnemies`.

## Rozhodnutí
1. **Efektivní kapacita bojiště (`effectiveLivingCount`)**:
   - Každé samostatné strašidlo na scéně se počítá striktně jako 1 jednotka kapacity.
   - Celé aktivní Hejno vran s virtuálním vůdcem (`isVirtualCrowMember: true`) se souhrnně započítává jako **přesně 3 jednotky kapacity**, což odpovídá skutečné renderingové zátěži bez zatížení herní AI.
   - Pacingové ventily Režiséra (přechod z `peak` do `lull` při $\le 4$ nepřátelích) se řídí tímto efektivním počtem, takže odlétající hejno vran nebrání zaslouženému oddychu po likvidaci pozemních běsů.
2. **Šetření slotů pro Hejno vran (18s pravidlo)**:
   - V 1. úrovni (Předjaří) Režisér sleduje prodlevu od posledního hejna. Pokud hejno neletělo $\ge 18\text{ s}$, Režisér zastropuje běžné taktické spawny na `maxLivingEnemies - 3`, čímž trvale chrání 3 volné sloty pro hladký start hejna bez překročení limitu.
3. **Šetření slotů pro formace & Kvalitativní vyrovnání obtížnosti**:
   - Režisér neředí bojiště náhodnými jednotlivými potvorami, pokud střádá rozpočet na těžkou formaci vyžadující ucelenou kapacitu.
   - Všechny formace a Drtivý přepad jsou striktně ořezávány zbývající volnou kapacitou (`maxLivingEnemies - effectiveLivingCount`).
   - Při dosažení stropu kapacity Režisér nepřekračuje limit novými entitami, ale investuje přebytečný rejdový rozpočet do Ostřílených běsů a přívlastkových monster (vichřicový, kamenný, hromový, pekelný).

## Důsledky
- Stanovený strop živých nepřátel (35 v úsporném profilu, 55 ve vyváženém, 75 v plném) není nikdy překročen.
- Hejno 150 vran plynule přilétá a odlétá bez zasekávání Režiséra i bez trhání snímkové frekvence.
- Vyšší dynamická obtížnost přináší taktické výzvy v podobě elitních mechanik namísto lagující záplavy nekvalitních těl.
