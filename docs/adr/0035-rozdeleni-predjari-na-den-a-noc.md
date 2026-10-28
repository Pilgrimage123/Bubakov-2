# Rozdělení Předjaří na denní a noční výpravu a přečíslování krajů

## Kontext a rozhodnutí

Původní úvodní kraj (*Předjaří v Hrusicích*, interní ID 0) spojoval do jediného 120sekundového běhu rychlý přechod od poledního tání přes mrazivé vrány a vodníčka až po půlnoční příchod Morany. Tento formát stlačoval kontrast mezi jarním probouzením přírody a mrazivou zimní hrozbou do příliš krátkého časového okna.

Po rozhovoru podle designového stromu bylo rozhodnuto rozdělit úvodní kraj do dvou samostatně volitelných výprav v Nabídce výprav a harmonizovat celou kampaň do osmi po sobě jdoucích úrovní:

1. **Čistá osmidílná řada (ID 0 až 7, zobrazeno jako 1 až 8)**:
   - *1. Předjaří v Hrusicích – Denní tání* (ID 0)
   - *2. Předjaří v Hrusicích – Noční mrazy* (ID 1)
   - *3. Náves a rybník Brčálník* (ID 2)
   - *4. Starý hřbitov a Hrusický hvozd* (ID 3)
   - *5. Ladovská zima na Melechově* (ID 4)
   - *6. Staré hamry a Čertův mlýn* (ID 5)
   - *7. Pustá Hláska a Zlenické podhradí* (ID 6)
   - *8. Dračí sluj pod Melechovskou skálou* (ID 7)
   Zpětná kompatibilita starých ID byla záměrně vynechána ve prospěch čisté lineární architektury.

2. **Hierarchie bossů & rozložení tempa (5 minut / 300 s na úroveň)**:
   - **1. úroveň (Denní tání, 300 s / 5 min)**:
     - 0–85 s: Ranní a polední tání, prozkoumávání mezí a první upgrady.
     - Miniboss (85 s, ~45 zklidněných bubáků): *Blatouchový skřítek* (vystupuje z rozvodněné meze).
     - Anomálie Bubácká díra (120–165 s): Rituální výzva v polovině dne.
     - Midboss (185 s, ~120 zklidněných bubáků): *Jarní Vodníček* (vystupující z tajícího rybníka).
     - Finální boss (300 s, ~220 zklidněných bubáků): *Hejno mrazivých vran* (plnohodnotný vrchol denního běhu).
   - **2. úroveň (Noční mrazy, 300 s / 5 min)**:
     - 0–85 s: Soumrak, padající teplota a praskání ledu.
     - Miniboss (85 s, ~50 zklidněných bubáků): *Horda tajících sněhuláků*.
     - Anomálie Bubácká díra (120–165 s): Noční rituální zkouška odvahy.
     - Midboss (185 s, ~130 zklidněných bubáků): *Mrazivý obr*.
     - Finální boss (300 s, ~240 zklidněných bubáků): *Morana — špatně vynesená smrtka*.
     - Svítání a ranní kuropění nastává v čase 300 s+.

3. **Natažení a fázování dne pro plnohodnotnou délku 5 minut (300 s)**:
   - Obě úrovně trvají 5 minut (300 sekund), dohromady 10 minut za obě výpravy Předjaří.
   - Denní tání probíhá výhradně ve světlých fázích (*Poledne* 0–150 s a *Odpoledne* 150–300 s), takže sluneční svit a jarní atmosféra zůstávají po celou dobu výpravy.
   - Noční mrazy probíhají výhradně v potemnělých fázích (*Soumrak / Klekání* 0–100 s, *Hluboká noc* 100–200 s, *Půlnoční hodina* 200–300 s a *Kuropění* 300 s+), kde se uplatňuje petrolejka, svit chalup a noční mrazivé přízraky.

4. **Sdílená aréna s rozdílným ladovským svícením**:
   - Obě úrovně sdílejí terén *Březnové tání*, avšak noční úroveň nasazuje tmavou oblohu, noční ambient a mrazivé noční dekory.

5. **Postup odemykání**:
   - Denní tání je odemčeno od začátku pro nováčky.
   - Pokoření Hejna vran odemkne Noční mrazy.
   - Pokoření Morany odemkne 3. úroveň (*Náves a rybník Brčálník*).

## Důsledky
- Jasnější tématické rozdělení mezi tání na polích a mrazivou vánici Morany.
- Srozumitelná a čistá posloupnost osmi výprav bez matoucího podčíslování (1a/1b).
- Aktualizován [GLOSSARY.md](../../GLOSSARY.md) (definice pojmů *Denní výprava*, *Noční výprava*, *Kraj* a povýšení *Hejna mrazivých vran* na finálního bosse).
