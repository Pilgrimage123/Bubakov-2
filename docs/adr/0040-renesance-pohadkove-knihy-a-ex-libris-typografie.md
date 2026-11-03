# Renesance pohádkové knihy, ex-libris vazba a literární typografie

## Kontext
Při technických opravách layoutu a vrstvení karet došlo k nežádoucímu vedlejšímu efektu – sterilizaci grafického stylu. Odstraněním hrubých tmavých fleků se pozadí oken posunulo k modernímu bílo-šedému rastru, karty v rozích ztratily přirozené ukotvení a úvodní obrazovka se otevírala v mřížce obdélníkových karet namísto ilustrované knihy. Tím se z rozhraní vytrácela podstata Bubákova jako poctivé české pohádkové knihy (ve stylu SNDK / Albatros 50. let a ilustrací Josefa Lady).

## Rozhodnutí

### 1. Pohádková kniha Bubákova jako výchozí tvář hry
- Hlavní nabídka (`stage select`) startuje ve výchozím stavu v režimu otevřené knihy (`menuViewMode: 'book'`), kde se před hráčem rozkládá plnohodnotná dvojstrana s dřevorytovými ilustracemi, záložkami a šelestem stránek.
- Volba hráče (případné přepnutí na kompaktní mřížku karet) se ukládá do `localStorage` (`bubakov_menu_view_mode`), aby se záměrná volba hráče respektovala.

### 2. Knižní papír chamois a diferenciace vazby
- Panely a modály opouštějí studený tečkovaný rastr a přecházejí na hřejivý tón ofsetového papíru chamois (`#F4ECD8` až `#EFE4CE`) s jemnou vláknitou patinou bez umělých digitálních skvrn.
- Dvojstrana knihy nese měkký stín hřbetu uprostřed listu, zatímco dialogová okna nesou poctivou tmavě zelenou knihařskou vazbu nalevo (`border-left: 14px solid #25382C`) a přirozené prohřátí okrajů.

### 3. Ex-libris vnitřní linka v LadaCardCorners
- Rohové ornamenty (květy, poupata a lístky) jsou sjednoceny s 5px vnitřní linkou (`inset: 5px`), která obepíná kartu po obvodu. Tím vzniká autentická knižní viněta, jež pevně ukotvuje rohy, aniž by jediný pixel inkoustu přesahoval vnější rozměr karty.
- Barevný odstín linky se adaptivně přizpůsobuje stavu karty (karmínová pro vybranou, duběnkový inkoust pro běžnou, zlatavá pro výzvy, zemitá hnědá pro zamčené).

### 4. Literární typografie a knižní záložky
- Úvodní odstavce příruček a oken získávají stylizovanou dvouřádkovou karmínovou iniciálu (`.lada-drop-cap`) v písmu `Cinzel Decorative` / `Eczar`.
- Modální okna získávají v záhlaví textilní záložku se stehem odkazující na řemeslnou knižní vazbu.

## Důsledky
- Hráč vstupuje přímo do pohádkového světa bez nutnosti hledat knižní režim pod záložkami.
- Rozhraní drží přísnou knižní estetiku a vysokou čitelnost bez vizuálního smogu a bez technických kolizí linek a stínů v mřížce.
- Terminologie je kanonicky ukotvena v `GLOSSARY.md` (Pohádková kniha Bubákova vs. Kronika výpravy vs. Kronika Bubákova).
