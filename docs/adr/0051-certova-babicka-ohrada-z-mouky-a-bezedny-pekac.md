# Čertova babička, Ohrada z mouky a uhlí a Babiččin bezedný pekáč

## Kontext

V návaznosti na ADR 0050 (Bubácká díra a Barbucha) byl systém trestání za nezapečetění časové anomálie 100% deterministický a vedl výhradně k vyvolání Strachem nacpaného Barbuchy. Ačkoliv byla mechanika pečetění funkční, selhání díry postrádalo prvek vzácného folklórního překvapení a hlubšího provázání s herní ekonomikou Čertova dědečka a sběru perníčků.

Zároveň ve hře chyběl koncept dynamické arénové izolace (uzavřeného duelu), v němž je lovec dočasně odříznut od zbytku bojiště v přehledném souboji 1v1 proti velkému kulinářsko-pekelnému vele-bossu.

## Rozhodnutí

### 1. Podmínka zjevení a fixní šance
Při selhání 15sekundového odpočtu Bubácké díry:
- Standardně (v 95 % případů) vystoupí **Strachem nacpaný Barbucha** dle ADR 0050.
- Se vzácnou **fixní šancí 5 %** (nezávislou na hodnotě Štěstí lovce) pukne země pod oblakem síry a skořice a z díry se vyškrábe **Čertova babička** (`certova_babicka`).
- **Dynamické 3,5× škálování statistik**: Jako jeden z mála nepřátel nemá Čertova babička pevné tabulkové statistiky. Její Kuráž, poškození i Herní hodnota se při spawnu dynamicky vypočtou přesně jako **3,5násobek vrcholného Vele-bosse dané úrovně** (`curLvl.bosses.finalBoss`). V pozdních úrovních dosahuje monumentální síly a funguje jako prakticky neporazitelná přírodní katastrofa.
- Její úvodní bitevní pokřik odkazuje na čas svačiny a ukradené jarmareční perníčky:
  > *„Kde je ten starý darebák?! Dva týdny se patlám s perníkovou polevou na jarmark a ten mamlas dědkovská proděraví nůši! A ty! Co to máš kolem pusy za drobky?! 15:00 – Čas na svačinu! Naval ty perníčky zpátky, holomku!“*
- Pokud hráč vstoupil do výpravy v roli lovkyně *Babička a Barunka*, spustí se unikátní dialogová výměna:
  > *„Dvě babičky na jedné návsi? To teda ne, ty ratibořická podvodnice!“*

### 2. Ohrada z mouky a uhlí (Izolace arény)
Ihned po vynoření Čertova babička kolem sebe vytvoří kruhovou bariéru:
- **Poloměr**: 450 px.
- **Bezpečné ukotvení (Clamping)**: Střed arény se při iniciaci automaticky posune dovnitř hratelné plochy tak, aby celý kruh ležel bezpečně uvnitř mapy a nezasahoval mimo terén.
- **Odrazivý hořící okraj**: Lovec nemůže kruh volně opustit. Při dotyku s okrajem je odražen zpět dovnitř a utrží zásah za 5 Kuráže.
- **Pozastavení Režiséra výpravy**: Vznik ohrady spálí/odtlačí všechny běžné potvory v jejím dosahu a Režisér výpravy po dobu duelu zcela pozastaví přísun běžných vln (prevence zahlcení a propadu FPS).

### 3. Fáze 1 – Kulinářský pekelný arzenál a postupná transformace (0–30 s)
Babička začíná jako zdánlivě běžná, i když nesmírně rozzuřená vesnická stařenka ve dvou starých botách, s kvítkovaným šátkem uvázaným pevně kolem hlavy a válečkem v ruce (měřítko 1,35×).

Bojový arzenál (Zlatý trojzubec dle ADR 0049):
1. **Válečkový parní válec** (Nápřah 0,8 s): Babička popadne žhavý váleček na těsto s malovanými kvítky a provede prudký výpad napříč arénou; zanechává za sebou na 3 sekundy pás rozválčené hořící země udělující poškození v čase.
2. **Vykrajovátkový vějíř** (Bullet Hell salva): Vrh rotujících plechových vykrajovátek ve tvaru prasátek, srdíček a čertů ve 360stupňových spirálách.
3. **Lidová cukrová poleva**: Rozstříknutí bílé polevy do tvaru lidových ornamentů, vytvářející louže zpomalující pohyb lovce o 60 % po dobu 4 sekund.
4. **Oživlé zmetky z plechu**: Vyvolání 3–4 připálených perníkových kamikaze panáčků útočících náběhem na lovce.

**Eskalace Stupně 2 (15–30 s – Růst na 1,70×)**:
- Čertovské růžky se s trhnutím a obláčkem síry proderou skrz červený květovaný šátek.
- Zpod sukně prudce vyrazí červený čertovský ocas se šípovým koncem.
- Babiččin obličej povážlivě rudne a její výpady zrychlují.

### 4. Fáze 2 – Explodující bota a peklo s pekáči (30–60 s)
Při poklesu Kuráže pod 50 % nebo po uplynutí 30 sekund:
- **Exploze boty (Stupeň 3 – 30–45 s, růst na 2,05×)**:
  - Za hlasitého *KŘÁP!* pravá bota exploduje na cáry kůže a vyrazí z ní silná, chlupatá kozí noha s tmavým rozčísnutým kopýtkem, jež při došlapu víří prach.
  - Vytáhne velkou pekařskou lopatu na sázení chleba a obklopí se **čtveřicí rotujících litinových pekáčů** (vzdálenost 85 px). Pekáče jsou nezničitelné a pohlcují přímé střely lovce (`CINK!`), což vyžaduje vyčkávání na průzory či využití plošných aur.
  - Z uší babičky stoupají hustá oblaka skořicového kouře.
  - **Čertův dědeček v křoví**: Na obvodu moučné ohrady se v třesoucím se křoví občas vykloní Čertův dědeček.
    - **Aktivace přiběhnutím (Proximity 80 px)**: Dědeček hodí do arény záchranný dar – střídavě *Sušené švestky* (+30 Kuráže) nebo *Fajfku* (3sekundový dýmový štít pohlcující projektily).
    - **Babiččina odveta**: Babička po dědkovi okamžitě mrskne žhavý uhlík s výkřikem *„Ty starý zrádce!“*; dědek s kňučením zaleze a křoví vstoupí do 12sekundového cooldownu.

- **Stupeň 4 – Plná démonická apokalypsa (45–60 s, růst na 2,45×)**:
  - Babička naroste do monumentálního měřítka 2,45×, pokrývajícího velkou část arény.
  - Dřevěný malovaný váleček má velikost obří klády, oči má divoce vyvalené, z tlamy jí vlaje dlouhý rudý jazyk a kapou sliny.
  - Každý tvrdý došlap čertovského kopyta způsobuje znatelný otřes obrazovky (screen-shake).
  - Vykrajovátka létají v nepřetržitých spirálách a ohnivé pásy po válečku přetrvávají déle.

### 5. Vítězná podmínka: Pekařská zkouška vytrvalosti (60 s) vs. Hrubá síla
- **Přežití 60 sekund**: Protože má babička 3,5× větší Kuráž než hlavní boss a neustále sílí, primárním cílem hráče je vydržet a přežít 60 sekund v ohradě.
- **Vyčerpání**: Přesně po 60 sekundách babičce dojde dech. Vzteklý oheň uhasne, babička se zmenší zpět do shrbené podoby, unaveně usedne na pařez (s ovázaným kopýtkem), utře si čelo cípem zástěry a lamentuje nad křížem a spálenou vánočkou.
- **Předčasné skolení na 0 Kuráže**: Pokud disponuje hráč tak extrémním poškozením, že babičku srazí na 0 Kuráže dříve než za 60 s, souboj okamžitě končí triumfem a z babičky navíc vytryskne heroická fontána perníčků.
- Ohrada z mouky se rozplyne a následuje **3sekundový ochranný oddech** („ODDECH PO PEKLE“), během něhož má lovec garantován klid pro posbírání odměn před obnovením vln Režiséra výpravy.

### 6. Odměna: Malovaná almara a Babiččin bezedný pekáč
Babička zanechá **Malovanou almaru**:
- Lovec získá **Babiččin bezedný pekáč**: okamžitě aktivní 5. slot zbraně do konce výpravy, který každých 5 s vystřelí kruh 8 horkých buchet (prorážejí nepřátele za 65 poškození; přeběhnutí přes buchtu obnoví 5 Kuráže, max. 3 buchty na salvu).
- Pekáč se zároveň trvale odemkne do inventáře nůše Čertova dědečka pro budoucí výpravy.

### 7. Procedurální ztvárnění
Vizuál Čertovy babičky (květovaný šátek s růžky, šípový ocas, asymetrická noha s botou a kopytem, váleček s červenými kvítky, ovčí rouno, zástěra s kytičkou a modrou záplatou) je realizován striktně procedurálně na Canvas 2D (Ladovská tušová linka 2,5 px, kvašové výplně, částice mouky a kouře) bez použití externích rastrových textur v souladu s vizuálním kodexem `AGENTS.md`.
