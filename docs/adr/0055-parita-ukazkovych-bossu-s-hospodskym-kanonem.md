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

2. **Mobilní bojové figury v aréně (žádné sezení na židlích ani popíjení piva)**:
   - Strašidla a bossové v bojové aréně přirozeně **nesedí na židli/štokrleti a nepijí pivo**, pokud to není výslovně vyžádáno konkrétní herní mechanikou. Všech 6 bossů stojí a kráčí na vlastních plně artikulovaných nohách (`vx`), skáče a otáčí se v aréně bez rizika převrácení (`scale(dir, 1)` s `dir = vx >= 0 ? 1 : -1`).
   - Hastrman kráčí v modrých kalhotách s červenými manžetami, pruhovaných punčochách a lesklých botách (bez *štokrlete*), v jedné ruce drží fajfku se zlatým víčkem a rybičkou a druhou blanitou rukou švihá vrbovým proutkem. Rusalka stojí a tančí bosýma nohama ve vodní kaluži (bez pivního korbele) a rukama splétá vodní vír s rákosím. Koledující Bubák kráčí na bosých čtyřprstých tlapách (bez korbele a pivní pěny), v jedné ruce nese mosaznou lucernu a druhou drápovitou tlapou straší.
   - Pod nohama se vykreslují dynamické terénní interakce (rozpíjející se vodní kruhy u Hastrmana a Rusalky, kouřové víření u Barbuchy a Čerta, těžké otisky okovaných škorní u Obra).

3. **Kánon pro Obra, Čerta a Barbuchu**:
   - **Skalní Obr**: Masivní furiantský trup v ovčím kožichu se skalními rameny porostlými mechem, okované škorně, srostlé huňaté obočí, plnovous a obě svalnaté paže s prsty přirozeně svírající sukovitý dubový kyj pobitý železnými obručemi (bez jakýchkoliv rušivých černých šipek či artefaktů).
   - **Mariášový Čert (Pekelný karbaník)**: Asymetrické nohy (jedna lidská v červenobíle pruhované punčoše a záplatované botě, druhá chlupatá kozlí s kopytem), záplatovaná vesta s mariášovými kartami za pasem, řetěz se zámkem, zatočené rohy, vyplazený jazyk a **přirozený obouruční útok pekelným trojzubcem (vidlemi)**, kde obě paže a prsty pevně svírají násadu při chůzi, nápřahu i výpadu.
   - **Strachem nacpaný Barbucha**: Nadýchaný modrobílý dýmový a peřinový duch s vlnícím se spodním lemem, divokými černými vlasy, vykulenýma očima, červenými tvářemi, mrkvovým nosem a zubatou tlamou (dle ADR 0050). Z jeho dýmových paží vyrůstají **ruce zakončené dlouhými černými drápy (žihadly)**, které jsou přímou součástí jeho prstů a při útoku (`isStrike`) z dlaní vystřelují dopředu jako letící černé ostny.

4. **Zásady anatomického úchopu zbraní a eliminace duplicitních překryvů (`drawOverlayVfx`)**:
   - **Zákaz levitujících zbraní v `drawOverlayVfx`**: Veškeré zbraně a rekvizity bossů musí být součástí samotné kreslicí rutiny bosse (`showcaseBosses.ts`), nikoliv globálního překryvu `drawOverlayVfx` v `src/render/ladaRenderer.ts`. Staré překryvy v `drawOverlayVfx` pro `obr` / `drawObr` (nakloněný kmen s tmavým trojúhelníkem na špičce, působící jako černá šipka) a `cert` / `drawCert` (levitující vidle mimo ruce) byly odstraněny.
   - **Dvoukloubové paže a čtyřprsté dlaně na ratišti**: Každá držená zbraň (dubový kyj obra s oblými obručemi, pekelný trojzubec čerta, vrbový proutek hastrmana, pomlázka a lucerna bubáka) je vedena z ramene přes loket do zápěstí a obemknuta dlaní s palcem a 4 prsty. U obouručních zbraní (Obr, Čert) svírají zbraň obě paže současně a při `isWindup` / `isStrike` se koordinovaně natahují vzad a vyrážejí vpřed.
   - **Prstové drápy jako vystřelující projektily**: U Barbuchy dlouhé černé drápy (*černá žihadla*) plynule navazují na 4 prsty každé kouřové dlaně; při `isStrike` se z konečků prstů odtrhávají a vystřelují vpřed jako létající černé bodce se vzdušnými stopami.
   - **Přesné rozlišení `idle` a `walk` podle `vx`**: Funkce `resolveShowcaseMotion` rozlišuje klidový stav (`Math.abs(vx) <= 0.01`, pouze dýchání bez krokového kmitání) a chůzi (`Math.abs(vx) > 0.01`, plný krokový cyklus), přičemž `AnimationTesterModal.tsx` předává do `enemyProxy.vx` nenulovou rychlost výhradně ve stavu `walk`.

5. **Přísné technické garance 60FPS**:
   - Všech 6 rutin zachovává nulovou alokaci objektů na snímek (`createLinearGradient` = 0, `createRadialGradient` = 0, `shadowBlur` = 0).
   - Všechny kreslicí metody mají vyvážený zásobník stavů (`save`/`restore` balance = 0).
   - Plná kompatibilita se stávající signaturou `(ctx, x, y, time, vx, panicked, attackInfo, enemy)`.

## Důsledky

- Ukázkoví bossové v aréně i bestiáři dosahují identické řemeslné úrovně jako ústřední scéna `LadaCoverScene.tsx`, avšak v plně mobilním bojovém postoji bez židlí a pivních korbelů.
- Odstraněny vizuální artefakty z duplicitních překryvů v `drawOverlayVfx` (černá šipka u Obra, levitující vidle u Čerta).
- Barbucha přesně naplňuje původní knižní kánon Josefa Lady s autentickými černými žihadly vyrůstajícími přímo z prstů dlaní.
- Zachován stoprocentní průchod testovací sady i plynulost 60 FPS.

