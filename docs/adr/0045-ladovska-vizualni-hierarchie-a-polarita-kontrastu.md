# Ladovská vizuální hierarchie a polarita kontrastu v hordě

## Kontext a rozhodnutí

Hra *Bubákov* kombinuje výtvarnou poetiku Josefa Lady s žánrem Bullet Heaven, kde se na scéně vyskytují stovky strašidel, střel a kořisti. Aplikace uniformní tlusté černé kontury na všechny herní objekty a nekontrolované využití pestrých barev vedlo k vizuálnímu zahlcení („černá kaše“) a neschopnosti periferně odlišit letící hrozbu od odměny.

V návaznosti na designový rozhovor byla stanovena autoritativní pravidla vizuální hierarchie:
1. **Dvouúrovňová linka**: Tloušťka linky určuje herní význam. Lovec a jeho projektily mají linku 3,5 px se světlým lemem. Vnější siluety strašidel a shluků mají konturu 2,5–3 px, zatímco vnitřní anatomické detaily pouze 1 px vlasovou perokresbu.
2. **Polarita 10% akcentní palety**: Syté akcentní barvy jsou striktně odděleny podle herního účelu:
   - *Hrozba (Uhnout!)*: Pekelně rumělková červená (`#E62A19`) a sírová pro nepřátelské projektily a zóny Nápřahu.
   - *Odměna (Sebrat!)*: Zlato-medová žlutá (`#FFD23F`) výhradně pro Perníčky, koláče a padlé groše.
   - *Lovec (Vlastní arzenál)*: Kobaltová modř (`#1E56A0`) a lipová zeleň pro projektily lovce.
3. **Akvarelové stopy terénu**: Rozlité pivo, bláto i povidlové louže po zničených běsích jsou vykreslovány výhradně jako poloprůhledné rozpité lazury (max. 35 % krytí) bez jakékoliv černé linky, aby neporušovaly klidný 60% podklad.
4. **Filtrovaná komiksová citoslovce**: Textové dýmové obláčky („BÁC!“, „PRÁSK!“) jsou omezeny na kritické zásahy a doražení bossů (max. 2–3 souběžně) pro zachování 60 FPS a přehlednosti.

## Důsledky

- Výrazné zvýšení čitelnosti bojiště v chumlu 300 entit bez ztráty pohádkového rázu.
- Ochrana snímkového rozpočtu renderingu na 2D plátně (eliminace překreslování stovek textových štítků).
- Aktualizace pojmů v `GLOSSARY.md`.
