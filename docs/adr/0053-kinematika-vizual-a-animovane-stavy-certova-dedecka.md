# Kinematika, vizuální kodex a animované stavy Čertova dědečka s nůší

## Kontext

Čertův dědeček představuje klíčovou folklórní figuru hry Bubákov: potulného pekelníka a kramáře, který putuje po mapě s obří proutěnou nůší a za posbírané perníčky nabízí lovcům zbraně a posilující předměty. V návaznosti na ADR 0051 (Čertova babička a Babiččin bezedný pekáč) byl jeho příběh dále prohlouben: babička se na něj zlobí, protože proděravěl nůši a poztrácel perníčky pečené na jarmark po celém kraji.

Původní procedurální kresba v Canvas 2D (`Lada.drawGrandfather`) však vykazovala několik kinematických a vizuálních limitů:
1. Postava stála příliš vzpřímeně bez pocitu obrovské váhy nůše plné haraburdí a kramářského zboží na shrbených zádech.
2. V nůši chyběly samotné jarmareční perníčky a díry ve výpletu, což oslabovalo návaznost na herní ekonomiku a ADR 0051.
3. Chůze byla řešena pouze jednoduchou sinusovkou bez sekundární setrvačnosti nůše a zavěšených předmětů (bandaska, zvonec, myška Rézinka).
4. V nákupním dialogu (`GrandfatherShop.tsx`) chyběl živý Canvas portrét dědečka – byl reprezentován pouze plochou ikonou, což ochuzovalo zážitek ze setkání.

## Rozhodnutí

### 1. Folklórní anatomie a ladovská silueta shrbeného kramáře
- **Tělesná stavba**: Trup je skloněn dopředu v typickém postoji venkovského nosiče těžkých břemen se zakulacenými zády a hlavou mírně vysunutou před tělo.
- **Oděv & doplňky**: Hnědý záplatovaný kožich s beránkem (žlutookrové rouno dle ladovského kánonu, nikoliv vánoční bílá), masivní kožené popruhy nůše přes ramena a kožená mošna na boku.
- **Pekelné atributy**:
  - Dva mohutné vroubkované beraní rohy vinoucí se kolem beranice.
  - Špičaté oranžovo-červené čertovské uši vykukující po stranách.
  - Dlouhý, plynule zvlněný S-křivkový čertovský ocas s plamenným štětcem na konci (bez zlomení).
  - Asymetrické obutí: levá noha v těžké šněrovací kožené škorni, pravá noha silná, porostlá srstí a zakončená velkým rozeklaným kopytem.

### 2. Kramářská nůše s proděravělým výpletem a perníčky
- Na nůši jsou zřetelné proděravělé švy a prasklé proutí, z nichž vykukují tradiční zdobené **jarmareční perníčky** s bílou cukrovou polevou.
- Zavěšené předměty mají definovanou fyzikální setrvačnost:
  - **Plechová bandaska na mléko**: Houpe se na provaze s fázovým zpožděním za krokem.
  - **Měděná lucerna / zvonec**: Reaguje na otřesy při došlapu kopyta.
  - **Myška Rézinka**: Vykukuje z horního okraje nůše, tlapkami se drží proutí a její růžový ocásek se vlní za nůší.
  - **Truhlička s mosazným madlem, otýpka obilí a sušené byliny**: Pevně ukotvené ve vrchní části nůše.

### 3. Třívrstvá kinematika pohybu (Čertovské kulhání)
Pohyb Čertova dědečka je organizován do tří provázaných fyzikálních vrstev:
1. **Dopad kopyta (Hoof Stomp)**: Pravá noha s kopytem dopadá tvrdě na zem, tělo znatelně klesne o 6 px a pod kopytem se zvíří obláček prachu.
2. **Odvalení škorně (Boot Roll)**: Levá noha ve škorni provádí plynulý zhoupnutý krok, který tělo opět mírně nadzvedne.
3. **Pružná sekundární setrvačnost nůše (Basket Inertia)**: Nůše o hmotnosti desítek kilogramů reaguje s fázovým posunem za pohybem trupu (tlumený harmonický kmit), což vytváří věrohodný vjem těžkého nákladu.

### 4. Třístavová stavová animace
Procedurální rutina podporuje tři plnohodnotné animované stavy:
1. **`walking` (Toulání po mapě)**:
   - Plná dynamika kulhání, víření prachu, kmitání ocasu a kývání nůše.
   - Pravá paže v kožichu vyrovnává balanc kramáře.
2. **`waiting` (Vyčkávání na lovce)**:
   - Dědeček stojí na místě, mírně poklepává kopytem o zem v očekávání svačiny.
   - Pravidelně bafá z vyřezávané dýmky – žhavý uhlík pulzuje oranžovo-červeným jasem a stoupají z něj vrstvené ladovské obláčky kouře s černou tušovou konturou.
   - Šibalsky pokyvuje hlavou a mává drápem směrem k procházejícímu lovci (`„Pssst! Lovče!“`).
3. **`interacting` (Obchodování)**:
   - Při interakci / otevření obchodu se dědečkova tvář rozzáří lišáckým úsměvem s vyceněnými křivými zuby.
   - V pravé paži pozvedá zlatavý perníček s polevou s lákavým kramářským gestem.
   - Kolem postavy se rozlije hřejivá zlatavá krbová záře.

### 5. Integrace živého Canvas portrétu do `GrandfatherShop`
- Do záhlaví modálu `GrandfatherShop.tsx` je integrována živá Canvas komponenta `LadaGrandfatherCanvasPreview` ve stavu `interacting`.
- Hráč tak během procházení nabídek zboží nesleduje statickou ikonu, nýbrž živě bafajícího a gestikulujícího kramáře, který oživuje nákupní atmosféru.

## Důsledky
- Vizuální sjednocení s ADR 0051 (Čertova babička) a logické podtržení herní ekonomiky sběru perníčků.
- Znatelné zvýšení plynulosti a estetické kvality animace chůze a postávání kramáře.
- Zachování 100% procedurálního vykreslování na Canvas 2D bez rastrových textur dle `AGENTS.md`.
