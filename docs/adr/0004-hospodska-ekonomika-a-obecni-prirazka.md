# Hospodská ekonomika, Obecní přirážka a harmonizace vylepšení

## Kontext
Trvalá vylepšení vesnice v hospodě U Černého kocoura byla původně oceňována nezávisle jednoduchým vzorcem `35 * (lvl + 1)` pro každou budovu zvlášť. To vedlo k triviálnímu hromadění levných vylepšení bez nutnosti zvažovat strategické priority. Některé efekty se navíc překrývaly nebo byly příliš úzce zaměřené (např. pouhé krácení počítadla truhel či vliv jen na bažiny), v rozhraní docházelo k duplicitě u pivovarských ležáků a chyběly klíčové ekonomické a záchranné mechaniky (násobení zisku perníčků, krejcarů a posílení při nízké Kuráži).

## Rozhodnutí
Rozhodli jsme se zavést systém sdíleného zdražování (**Obecní přirážka**) a harmonizovat všech 12 budov do folklórní Ladovské tématiky:
1. **Vzorec ceny se sdíleným zdražováním**: Každá zakoupená úroveň libovolné budovy ve vsi zvyšuje cenu všech budov o +15 %: `cena = round(baseCost * (1 + celkemZakoupeno * 0.15))`.
2. **Odstupňované základní ceny**: Budovy jsou rozděleny do tří hladin (30 / 50 / 75 krejcarů) podle dopadu na hru.
3. **Neomezené úrovně se stabilními mezemi**: Úrovně budov jsou neomezené pro pozdní fázi hry; obranné a časové efekty (redukce zranění, nezranitelnost, zkrácení debuffů) mají asymptotické stropy, aby nerozbily simulaci.
4. **Nové klíčové efekty**:
   - `oven` (Pekárna): +10 % k hodnotě sbíraných perníčků za úroveň.
   - `undead` (Hřbitovní brána): +10 % k hodnotě sbíraných krejcarů a bonusová šance na tolar.
   - `tavernShield` (Šenkýřova kuráž): +15 % k poškození při poklesu Kuráže pod 35 % za úroveň.
5. **Vrácení krejcarů (100% bezplatný respec)**: Hráč může kdykoliv vyrovnat obecní účet. Deterministická funkce nasimuluje historické nákupy a vrátí celou vloženou částku, což podporuje volné experimentování.
6. **Folklórní symbióza**: Všech 12 budov důsledně využívá motiv zkrocených strašidel (rarášci, hastrmani, divoženky, diblíci, klekánice, ohniví mužíci) pomáhajících vesničanům.

## Důsledky
Pořadí nákupů se stává zásadním herním rozhodnutím. Hráči nemohou slepě vykoupit levná vylepšení bez zdražení bojových pilířů. Možnost bezplatného vrácení krejcarů eliminuje frustraci ze špatné investice.
