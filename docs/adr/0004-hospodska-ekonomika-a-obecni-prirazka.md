# Hospodská ekonomika, Obecní přirážka a harmonizace vylepšení

## Kontext
Trvalá vylepšení vesnice v hospodě U Černého kocoura byla původně oceňována nezávisle jednoduchým vzorcem `35 * (lvl + 1)` pro každou budovu zvlášť. To vedlo k triviálnímu hromadění levných vylepšení bez nutnosti zvažovat strategické priority. Některé efekty se navíc překrývaly nebo byly příliš úzce zaměřené, v rozhraní docházelo k duplicitě u pivovarských ležáků a chyběly klíčové ekonomické a záchranné mechaniky (násobení zisku perníčků, krejcarů a posílení při nízké Kuráži). Původní paušální bonusy navíc stíraly unikátní handicapy a přednosti jednotlivých lovců (např. intimní sběr bylin Kořenářky vs. velký dosah Pasáčka).

## Rozhodnutí
Rozhodli jsme se zavést systém sdíleného zdražování (**Obecní přirážka**) a harmonizovat všech 13 budov do folklórní Ladovské tématiky:
1. **Vzorec ceny se sdíleným zdražováním**: Každá zakoupená úroveň libovolné budovy ve vsi zvyšuje cenu všech budov o +20 %: `cena = round(baseCost * (1 + celkemZakoupeno * 0.20))`.
2. **Odstupňované základní ceny**: Budovy jsou rozděleny do tří hladin (30 / 50 / 75 krejcarů) podle dopadu na hru.
3. **Neomezené úrovně a zachování charakteru lovce**: Úrovně budov lze nakupovat neomezeně. Pro zachování folklórních archetypů se klíčové osobní statistiky odvíjejí procentuálně ze základu zvoleného lovce:
   - `mill` (Vodní mlýn): +3 % k základní rychlosti chůze lovce za úroveň (měkký asymptotický strop na +50 % zrychlení).
   - `wall` (Kamenné hradby): +10 % k základní max Kuráži lovce za úroveň (bez stropu) a redukce utrženého zranění s plynulou asymptotou směřující k limitu 40 % (`0.40 * (1 - 1 / (1 + 0.08 * lvl))`).
   - `scarecrow` (Pšeničné lano a polní mez): +15 % k základnímu dosahu sběru za úroveň (měkký strop na +150 %).
   - `boziMuka` (Boží muka): +5 % k základnímu Štěstí lovce za úroveň (bez stropu).
4. **Nové a upravené klíčové efekty**:
   - `oven` (Pekárna): +10 % k hodnotě sbíraných perníčků za úroveň; využívá zlomkový střádač, aby ani dropy s hodnotou 1 neztrácely bonus zaokrouhlováním dolů.
   - `undead` (Hřbitovní brána): +10 % k hodnotě sbíraných krejcarů (se zlomkovým střádačem) a +1 % šance na tolar za úroveň (strop 25 %).
   - `tavernShield` (Šenkýřova kuráž): plynulé posílení zbraní úměrné chybějící Kuráži (až +25 % za úroveň při 0 % Kuráže); pokles pod 35 % doprovází dramatický pokřik a vizuální aura.
   - `church` (Kaple svaté vlny): +8 % poškození posvěcenými zbraněmi za úroveň a posvěcená rázová vlna (75 posvátného poškození za úroveň, rádius 350 px, odhoz 280) vyšlehující při rozbití hrnečku a osvobození zbloudilé dušičky.
   - `regen` (Bylinková zahrádka): sjednoceno na +4 Kuráže doplňováno každých 5 sekund za úroveň.
   - `forest` (Hustý borový les): zkrácení trvání promočení a zpomalení s plynulou asymptotou směřující k 85 %.
   - `forge` (Kovářská výheň): +2 přímé poškození ke každému zásahu jakékoliv zbraně (propsáno i do GameEngine).
   - `water` (Návesní studánka): +20 % k účinku lektvarů a dočasná nezranitelnost se stropem 5,0 sekund.
5. **Vrácení krejcarů (100% bezplatné vyrovnání účtu)**: Hráč může kdykoliv vyrovnat obecní účet. Deterministická funkce nasimuluje historické nákupy a vrátí celou vloženou částku, což podporuje volné experimentování.
6. **Folklórní symbióza**: Všech 13 budov důsledně využívá motiv zkrocených strašidel (rarášci, hastrmani, divoženky, diblíci, klekánice, ohniví mužíci, kostliví zedníci, bludičky) pomáhajících vesničanům.

## Důsledky
Pořadí nákupů se stává zásadním herním rozhodnutím. Procentuální bonusy chrání osobitost hrdinů (Babička zůstává rozvážnější a nejšťastnější, Ponocný nejhouževnatější, Kořenářka si uchovává bylinkářský sběr nablízko), zatímco plynulé asymptoty umožňují nekonečný rozvoj vsi bez rizika rozbití herní fyziky.

