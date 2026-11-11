# Parita 6 ukázkových bossů s hospodským kánonem U Černého kocoura

## Kontext

V ústřední scéně hospody U Černého kocoura (`src/components/LadaCoverScene.tsx`) byla dosažena vrcholná úroveň ladovského detailu a mikropohybů pro tři erbovní postavy:
- **Hastrman**: živé šibalské mrkání (`nearEyeWink`, `farEyeSquint`, `pupilDartX/Y`), vrásky na víčkách, baňatý lesklý nos, klobouk s kytičkou a blatouchy, šosy smaragdového fraku s červeným lemováním, kapající šos a boty se šněrováním a odlesky, kaluž s vlnícími se kruhy a tříramenná dubová stolička (*štokrle*).
- **Rusalka**: leknínová koruna, jemně mhouřící oči, orobinec s kvašovým květem, třpytivé vodní kapky, vlnící se šaty s pěnovým lemem a vodní prstence.
- **Koledující / Hospodský Bubák**: hustý sazový kožich s kvašovým vystínováním, záplatované kalhoty na kšandách, mosazná petrolejka se skleněným leskem a pěna od piva na vousech.

Při první implementaci `src/render/bosses/showcaseBosses.ts` v ADR 0054 byly tyto figury zjednodušeny do statičtějších a schematičtějších tvarů (bodové oči bez sakadických pohybů a víčkových záhybů, plošší těla a rekvizity bez mikroskopických detailů dřeva či kvašového stínování). U zbývajících 3 bossů (**Skalní Obr**, **Mariášový Čert**, **Strachem nacpaný Barbucha**) chyběla srovnatelná hloubka anatomie a folklórní výbavy.

## Rozhodnutí

1. **Plná procedurální parita a živá okulární mimika**:
   - Všech 6 ukázkových bossů v `showcaseBosses.ts` je kompletně přepracováno s použitím plnohodnotné logiky kresby z hospodské scény.
   - Přenáší se detailní aparát okulární mimiky tam, kde se to přirozeně hodí (Hastrman, Rusalka, Bubák, Čert, Obr): vícevrstvá bělma, barevné duhovky, zorničky se sakadickým těkáním a bílými odlesky, dynamické víčkové záhyby a huňaté obočí. Mimika plynule reaguje na bojové stavy (`isWindup` – vykulení očí a nápřah; `isStrike` – zatnutý škleb a mhouření; `isPanicked` – šilhající zorničky; klidový stav – šibalské pomrkávání).
   - U Barbuchy se nepoužívá komické lidské mrkání, nýbrž pronikavý uhelný pohled se žhnoucími zorničkami v temných kouřových očnicích.

2. **Mobilní bojové figury a rekvizity**:
   - Všech 6 bossů má plně artikulovaná těla, nohy a boty umožňující přirozený pohyb (`vx`), skákání a otáčení v aréně bez rizika převrácení (`scale(dir, 1)` s `dir = vx >= 0 ? 1 : -1`).
   - Pod nohama se vykreslují dynamické terénní interakce (rozpíjející se vodní kruhy u Hastrmana a Rusalky, uhelné víření u Barbuchy a Čerta, těžké otisky okovaných škorní u Obra).
   - Ikonický nábytek (*štokrle*, borovicová lavice) je vyhrazen pro telegrafické nápřahy, dupnutí a klidové pózy v bestiáři.

3. **Kánon pro Obra, Čerta a Barbuchu**:
   - **Skalní Obr (Kovářský štamgast)**: Masivní furiantský trup, kožená kovářská zástěra s kovanými nýty a mosaznou sponou, lidová vesta s křížkovou výšivkou, srostlé huňaté obočí do V, vyceněné nažloutlé stoličky, pěnící kamenný korbel a husté obláčky kvašové páry z nozder při nápřahu.
   - **Mariášový Čert (Pekelný karbaník)**: Huňatá kozí stehna, okované kopyto, červený slavnostní kabátek s černými sametovými výložkami, špičaté rohy deroucí se z černých kudrn, fajfka s rudým žhavým uhlíkem a vějíř autentických mariášových karet (Srdcové eso, Zelený spodek).
   - **Strachem nacpaný Barbucha (Sazový démon z pece)**: Mohutná silueta tvořená vrstvenými kvašovými laloky kouře a sazí (`#1C1610`, `#2B241D`, `#3F362C`, `#18130E`) bez jakýchkoliv kominických propriet, divoká uhelná kštice a **černá žihadla** – dlouhé, rovné, jehlově špičaté uhelné drápy vystřelující při útoku z vířícího trupu.

4. **Přísné technické garance 60FPS**:
   - Všech 6 rutin zachovává nulovou alokaci objektů na snímek (`createLinearGradient` = 0, `createRadialGradient` = 0, `shadowBlur` = 0).
   - Všechny kreslicí metody mají vyvážený zásobník stavů (`save`/`restore` balance = 0).
   - Plná kompatibilita se stávající signaturou `(ctx, x, y, time, vx, panicked, attackInfo, enemy)`.

## Důsledky

- Ukázkoví bossové v aréně i bestiáři dosahují identické řemeslné úrovně jako ústřední scéna `LadaCoverScene.tsx`.
- Barbucha přesně naplňuje původní knižní kánon Josefa Lady bez nevhodných kominických rekvizit a s autentickými černými žihadly.
- Zachován stoprocentní průchod testovací sady i plynulost 60 FPS.
