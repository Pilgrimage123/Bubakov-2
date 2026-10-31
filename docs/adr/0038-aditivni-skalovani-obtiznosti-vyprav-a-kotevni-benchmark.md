# Aditivní škálování obtížnosti výprav a kotevní benchmark

## Kontext
V dřívějším stavu hry neexistoval ucelený model pro škálování obtížnosti mezi jednotlivými Výpravami (herními úrovněmi kampaně). Úrovně byly rozštěpeny na dva nesourodé modely:
1. Pětiminutové světlé denní/jarní výpravy (1., 2., 3., 5. a 7. úroveň) s mírným poškozením a fázováním bossů v 85 s, 185 s a 300 s.
2. Tříminutové noční/jeskynní výpravy (4., 6. a 8. úroveň) s extrémními skoky v poškození a nepřiměřeným spěchem, který hráči nedovoloval rozvinout Milníky zbraní ani investice z hospody.

Výsledkem byla pilovitá horská dráha (sawtooth curve), kdy např. 5. úroveň byla řádově snazší než 4. úroveň a finální boss 8. úrovně (Drak) měl 49 500 Kuráže a 683 poškození, zatímco finální boss 1. úrovně měl pouhých 495 Kuráže. Navíc se v rozporu se zásadou Zero-Hidden-Cheat ([ADR 0008](file:///d:/bubakov/docs/adr/0008-odstraneni-skrytych-bonusu-nepratel.md)) objevovaly pokusy o skryté úpravy parametrů jednotlivých monster.

## Rozhodnutí

Zavádíme jednotný, čitelný a aditivní model pro celou kampaň 8 Výprav:

1. **Sjednocení časové osy na 300 sekund**:
   - Všech 8 Výprav trvá 300 sekund (5 minut) do příchodu svítání / finálního bosse.
   - Jednotné milníky střetnutí: Miniboss v **85 s**, Midboss ve **185 s** a Finální boss ve **300 s**.
   - Hráč má na každé Výpravě dostatek prostoru rozvinout své zbraně na Milníky (úrovně 3, 5 a 8) a uplatnit Obecní vylepšení z hospody U Černého kocoura.

2. **Kotevní benchmark výprav (Hejno mrazivých vran = 1 800 Kuráže)**:
   - Jako výchozí etalon ($1{,}00\times$) slouží Hejno mrazivých vran v 1. Výpravě s celkovou výdrží 1 800 Kuráže (formace 9 vran po 200 Kuráže).
   - Každý boss v kampani je unikátní folklórní entitou, jejíž výdrž a nápřahy jsou odvozeny z této kotevní hodnoty.

3. **Aditivní růst náročnosti (Křivka obtížnosti výprav)**:
   - Růst obtížnosti je striktně aditivní (+20 % základ + 5 % za každou další úroveň, s úvodním krokem +15 % mezi 1. a 2. Výpravou):
     - **1. Výprava (Denní tání)**: $1{,}00\times$ (100 %) — Základ
     - **2. Výprava (Noční mrazy)**: $1{,}35\times$ (135 %) — Skok $+35\,\%$
     - **3. Výprava (Dubnový den)**: $1{,}60\times$ (160 %) — Skok $+25\,\%$
     - **4. Výprava (Dubnová noc)**: $1{,}90\times$ (190 %) — Skok $+30\,\%$
     - **5. Výprava (Májová slavnost)**: $2{,}25\times$ (225 %) — Skok $+35\,\%$
     - **6. Výprava (Staré hamry)**: $2{,}65\times$ (265 %) — Skok $+40\,\%$
     - **7. Výprava (Letní senoseč)**: $3{,}10\times$ (310 %) — Skok $+45\,\%$
     - **8. Výprava (Dračí sluj)**: $3{,}60\times$ (360 %) — Skok $+50\,\%$

4. **Škálování výhradně přes Režiséra výpravy a přirozené bazény**:
   - V souladu s [ADR 0008](file:///d:/bubakov/docs/adr/0008-odstraneni-skrytych-bonusu-nepratel.md) se **nemění základní statistiky jednotlivých monster** v Bestiáři (Myšák má vždy své poctivé statistiky).
   - Aditivní násobitel škáluje **rejdový rozpočet Režiséra výpravy** (`budgetCap` a tempo přibývání `threatBudget`).
   - Ve vyšších úrovních Režisér díky vyššímu rozpočtu nasazuje nebezpečnější formace, investuje do Přívlastků (kamenný, hromový, pekelný) a čerpá z přirozeně nebezpečnějších bazénů strašidel (drábové, obři, hromotluci, noční můry).

5. **Kuráž a vyvážení bossů v kampani**:
   - Miniboss (~30 % benchmarku): 550 HP (1.) ➔ 1 980 HP (8.)
   - Midboss (~55 % benchmarku): 1 000 HP (1.) ➔ 3 600 HP (8.)
   - Finální boss (100 % benchmarku): 1 800 HP (1. Hejno) ➔ 6 480 HP (8. Drak)

## Důsledky
- Kampaň má dokonale plynulou, předvídatelnou křivku bez propadů a nesmyslných statových zdí.
- Znalost monster z Bestiáře je stoprocentně spolehlivá a bez skrytých cheatů.
- Finální souboje s bossy trvají 45–75 sekund taktického souboje a odpovídají rozvoji hráčova arzenálu v hospodě.
