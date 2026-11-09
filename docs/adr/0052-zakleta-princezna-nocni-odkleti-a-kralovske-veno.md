# Zakletá princezna, Hřbitovní plot se svícemi a Královské věno

## Kontext

Po zavedení Čertovy babičky (ADR 0051) se v komunitě osvědčil koncept vzácných tématických vele-bossů vyvěrajících ze selhání Bubácké díry. Česká pohádková tradice (reprezentovaná Boženou Němcovou a Karlem Jaromírem Erbenem) však skrývá překvapivě temnou, noční a gotickou odvrácenou stranu – archetyp *Zakleté princezny* (*O zakleté princezně*), kde hrdina musí přežít tři noci v uzavřeném prostoru, zatímco na něj útočí prokletá děva a teprve s ranním kuropěním z ní postupně opadává černota.

Ve hře Bubákov je tato postava pojata nikoliv jako laciný krvák, nýbrž jako jízlivá, rozmazlená aristokratická nemrtvá dáma, která leží v rakvi už tři sta let a neskutečně ji rozčiluje, že žádný „švarný rytíř v blyštivé zbroji“ nedokázal vydržet do rána, a místo něj jí do krypty vleze vesnický umouněný drnohryz.

## Rozhodnutí

### 1. Podmínka zjevení a noční exkluzivita (20 % v noci)
Při selhání rituálu Bubácké díry po 15 sekundách Režisér výpravy vyhodnotí aktuální denní/noční fázi:
- **Denní fáze (svítání, dopoledne, poledne, odpoledne, soumrak)**: Princezna spí v hrobce a nemůže se zjevit (šance 0 %). Výsledek selhání se dělí v poměru **5 % Čertova babička** a **95 % Strachem nacpaný Barbucha**.
- **Noční fáze (noc, hluboká půlnoc / 24:00 hodina duchů)**: Selhání díry nabídne 20% vzácné zjevení:
  - **20 % Zakletá princezna** (`zakleta_princezna`),
  - **5 % Čertova babička** (`certova_babicka`),
  - **75 % Strachem nacpaný Barbucha** (`barbucha`).
- Tato šance je prostá a fixní bez ovlivnění statistikou Štěstí lovce.

### 2. Statistické škálování (2,0× hlavní boss, vysoká rychlost a regenerace)
Zakletá princezna nepředstavuje těžkopádný obří tank jako Čertova babička, nýbrž vznášející se, hbitý nemrtvý přízrak:
- **Kuráž a herní hodnota**: Dynamicky přesně **2,0násobek hlavního bosse daného měsíce** (`curLvl.finalBoss`).
- **Rychlost pohybu**: Vysoká základní rychlost 125 px/s se vznášením nad zemí.
- **Záhrobní regenerace 1 % / s**: Princezna si každou sekundu souboje obnoví 1 % ze své maximální Kuráže (`this.maxHp * 0.01 * dt`). To nutí lovce k soustavnému ofenzivnímu tlaku, pokud ji chce skolit silou dříve, než uplyne čas.

### 3. Aréna: Hřbitovní plot se svícemi
Při zjevení Princezny vyjede ze země barokní mramorový sarkofág s odraženým víkem a arénu uzavře:
- **Poloměr**: 450 px.
- **Bariéra**: Kovaný rezavý hřbitovní plot ozdobený rozžatými hřbitovními svícemi.
- **Kladívkový odraz**: Pokus o únik odmrští lovce zpět do středu arény a udělí 5 mrazivých zranění.
- **Kulečníkový odraz perel**: Stovky vystřelených perel z roztržených korálů se od plotu fyzikálně odrážejí (bouncing projectiles) a zahušťují prostor arény.
- **Izolace duelu**: Běžné vlny Režiséra výpravy jsou po dobu duelu pozastaveny.

### 4. Bojový arzenál a útoky

1. **Valčík kostlivých nápadníků (Rotující paprsky)**:
   Princezna lusknutím prstů povolá kostry princů a rytířů, kteří se chytí za kosti a tančí po aréně v rotujících stěnách (2–3 paprsky v závislosti na fázi), mezi nimiž musí lovec kličkovat v rytmu valčíku.
2. **Potrhané korále (Bullet Hell fáze)**:
   V záchvatu hněvu Princezna strhne perlový náhrdelník a vymrští salvu 24–36 třpytivých bílých perel, které létají vysokou rychlostí a odrážejí se od rezavého plotu.
3. **Královský kapesníček (Naváděný projektil & Debuff Společenské faux pas)**:
   Princezna upustí krajkový kapesníček, který líně, leč neúnavně sleduje lovce. Při kontaktu nezpůsobuje fatální poškození, nýbrž udělí na **3 sekundy debuff Společenské faux pas**: lovec zrudne studem a jeho směrové ovládání se plně invertuje (osa X i Y).
4. **Kletba modré krve (Záhrobní gejzíry)**:
   Na zemi se vykreslí modré aristokratické erby (Nápřah 1,5 s), z nichž následně vytrysknou mrazivé ledové gejzíry.

### 5. Tři noci a duální vítězná podmínka (Kuropění vs. sražení Kuráže)
Duel trvá maximálně 60 sekund a je rozdělen na 3 noční fáze po 20 sekundách, přičemž každé zakokrhání kohouta strhává kletbu:
- **1. noc (0–20 s / 100–66 % Kuráže)**: Tělo černé jako uhel, pavučinami pokrytá krinolína, korunka nakřivo na lebce, klapející čelist.
- **2. noc (20–40 s / 66–33 % Kuráže – První kohout)**:
  - Zazní první zakokrhání kohouta: *„Polovic už ze mě spadlo!“*
  - Vršek těla od pasu nahoru se promění v živou růžolící krásku se zlatými vlasy, spodek zůstává kostrou v cárech.
  - Vrhá kusy mramorové rakve jako meteority dopadající z nebe (zůstávají ležet jako dočasné překážky).
- **3. noc (40–60 s / 33–0 % Kuráže – Druhý kohout)**:
  - Zazní druhé zakokrhání kohouta. Princezna běsní v hysterii, šlehá zlatými vlasy jako bičem a zrychluje rotaci valčíku koster.
- **Kuropění / Plné odkletí (60 s nebo 0 Kuráže – Třetí kohout)**:
  - Slunce vysvitne, zazní třetí zakokrhání kohouta a z princezny spadne veškerá černota.
  - Zcela živá a pohledná princezna si opráší sukni, jízlivě zhodnotí hrdinův „zápach česnekem a chudobou“, nasedne do přivolaného zlatého kočáru a odjede pryč.

### 6. Odměna: Královské věno a Perlový náhrdelník zakleté panny
Na místě po odjezdu kočáru zůstane truhla `Královské věno`:
- **Zlaťáky**: 200 krejcarů.
- **Plná Kuráž**: Okamžité obnovení Kuráže na 100 %.
- **Artefakt Perlový náhrdelník zakleté panny (`perlovy_nahrdelnik`)**:
  - Obranný artefakt.
  - Kdykoliv lovec utrží zranění nebo praskne jeho dočasný štít, z náhrdelníku vystřelí kruhová salva 12 perel, které se odrážejí od zdí/překážek a udělují 45 magického poškození nepřátelům s 0,4s omráčením.

## Důsledky
- Dokonalé folklórní obohacení noční části hry o gotický motiv Boženy Němcové.
- Nový typ zkoušky pro hráče: kličkování v rytmickém valčíku, zvládání invertovaného ovládání a překonávání 1% záhrobní regenerace.
- Vizuální styl striktně v Lada procedurálním 2D Canvasu bez externích rastrů.
