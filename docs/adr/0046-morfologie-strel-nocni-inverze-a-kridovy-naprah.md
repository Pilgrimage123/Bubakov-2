# Morfologie střel, noční konturová inverze a křídový nápřah

## Kontext a rozhodnutí

Po ukotvení základní dvouúrovňové linky a barevné polarity (ADR 0045) bylo nutné vyřešit čitelnost v specifických herních situacích: nočních výpravách, hustých salvách střel, procedurální animaci stovek entit a vizuálním varování před útoky (Nápřah).

Byla schválena tato systémová pravidla:
1. **Noční konturová inverze**: Mimo dosah Petrolejky či světel z oken roubenek se sytě černá kontura entit automaticky invertuje do křídově bílé linky (1,5 px). Vychází z Ladových kreseb křídou na tmavomodrém papíře a udržuje zřetelné siluety i v hluboké noční tmě bez digitálního glow efektu.
2. **Kánon tvarů střel (Oblé vs. Špičaté)**: Periferní rozpoznávání střel je postaveno na geometrickém kontrastu:
   - *Střely lovce*: Výhradně oblé organické tvary (buchty, knedlíky, koláče, kapky piva, šišky).
   - *Střely strašidel*: Výhradně ostré a agresivní tvary (čertovské vidle, střepy, trny, kousavé zuby, plamínky).
3. **Diskrétní kolébavý krok**: Pro potlačení vizuálního stroboskopu a úsporu výkonu v 2D Canvas smyčce je Squash & Stretch zafixován do 4 diskrétních fází náklonu (±5°) a stlačení (0,9×–1,1×) vázaných na vektor rychlosti. Velká strašidla (tanky) používají vertikální pulzaci s nízkým kmitočtem (2–3 Hz).
4. **Křídový nápřah**: Namísto moderních sci-fi polygonů a červených laserových zón se Nápřah vykresluje jako křídový obrys s tužkovým šrafováním, postupně se plnící akvarelovou rumělkou, doprovázený přikrčením strašidla a ladovským tušovým vykřičníkem.

## Důsledky

- Zaručená periferní čitelnost bez ohledu na denní dobu a hustotu projektilů.
- Nulový propad snímků na HTML5 plátně díky deterministickému fázování animací.
- Aktualizace pojmů v `GLOSSARY.md`.
