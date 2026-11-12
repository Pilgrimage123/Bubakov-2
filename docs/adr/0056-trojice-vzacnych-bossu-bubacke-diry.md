# Trojice vzácných bossů Bubácké díry, sezónní hierarchie a legendární artefakty

## Kontext

V návaznosti na ADR 0050 (Bubácká díra a Barbucha), ADR 0051 (Čertova babička) a ADR 0052 (Zakletá princezna) se v herním designu osvědčil koncept arénových duelů s vzácnými vele-bossy při selhání zapečetění časové anomálie. 

Doposud byla nabídka omezena pouze na:
1. Pevného denního/nočního Barbuchu (95 % ve dne / 75 % v noci).
2. Čertovu babičku (5 % kdykoliv).
3. Zakletou princeznu (20 % výhradně v nočních fázích).

Denní fáze během roku (jaro, léto, podzim, zima) postrádaly specifické sezónní hrozby z hlubin země, jež by čerpaly z bohatého fondu české lidové slovesnosti (Karel Jaromír Erben, jihočeské a krušnohorské pověsti) a rozšiřovaly arzenál hráče o unikátní legendární artefakty s novými herními mechanikami.

## Rozhodnutí

### 1. Hierarchie výběru Režisérem výpravy (Zastropování na 25 % vzácných bossů)

Při selhání 15sekundového rituálu zapečetění Bubácké díry vyhodnotí Režisér výpravy prostředí a denní dobu. Celková pravděpodobnost výskytu *jakéhokoliv vzácného bosse* je striktně zastropována na **25 %**, aby si **Strachem nacpaný Barbucha** zachoval svou roli standardního trestu v **75 %** případů:

1. **Noční fáze (noc, hluboká půlnoc)**:
   - **20 %** Zakletá princezna (`zakleta_princezna`),
   - **5 %** Čertova babička (`certova_babicka`),
   - **75 %** Strachem nacpaný Barbucha (`barbucha`).
2. **Denní fáze (svítání, dopoledne, poledne, odpoledne, soumrak)**:
   - **Vlhké / vodní měsíce** (březen, duben, říjen):
     - **20 %** Jakub Krčín (`jakub_krcin`),
     - **5 %** Čertova babička (`certova_babicka`),
     - **75 %** Strachem nacpaný Barbucha (`barbucha`).
   - **Kamenité / zimní měsíce** (listopad, prosinec, leden, únor):
     - **20 %** Permonický král (`permonicky_kral`),
     - **5 %** Čertova babička (`certova_babicka`),
     - **75 %** Strachem nacpaný Barbucha (`barbucha`).
   - **Polní / letní měsíce** (květen, červen, červenec, srpen, září):
     - **20 %** Otesánek (`otesanek`),
     - **5 %** Čertova babička (`certova_babicka`),
     - **75 %** Strachem nacpaný Barbucha (`barbucha`).

---

### 2. Otesánek – Nenasytný vykopaný pařez ze země

- **Původ a tělo**: Autentický oživlý kořenový pařez z Erbenovy pohádky. Hrubě otesané dřevo s letokruhy, vyvalené sukovité oči, zubatý štěpinový chřtán s panty.
- **Aréna (Poloměr 450 px)**: *Trnitý kruh z živých kořenů*. Výhonky zraňují při kontaktu za 5 Kuráže a brání opuštění arény.
- **Bojová mechanika (Gravitační polykání)**:
  - Otesánek má čelní kónus sání (úhel 90°, dosah 320 px), který k sobě gravitačně přitahuje lovce i ležící perníčky.
  - Všechny přímé střely lovce letící zepředu Otesánek bez poškození spolkne.
  - S každým spolknutým projektilem a perníčkem roste z počátečního měřítka 1,2× až na gigantických 2,4× a mírně zrychluje.
  - **Zranitelnost**: Je plně zranitelný výhradně útoky vedenými ze zálohy – do zad nebo do boků.
- **Vítězná podmínka (Duální)**:
  - **Přežití 60 sekund** NEBO **Prasknutí břicha z přejedení** (sražení Kuráže na 0 útoky zezadu / překročení kapacity pohlcené hmoty):
  - Otesánkovi se s hlasitým *KŘÁP!* roztrhne břicho a po aréně vytryskne heroická fontána perníčků, jídla a perníkového pokladu.
- **Úvodní pokřik**:
  > *„JÁ JSEM OTESÁNEK! JEDL JSEM, SNĚDL JSEM... KAŠI ZE ŠKOPKU, DVA BOCHNÍKY CHLEBA, A TEBE TAKY SNÍM!“*  
  *(Reakce na lovkyni Babička a Barunka: „Kde mám sekyrku a nůžky na toho nezbedu?!“)*
- **Odměna**: Artefakt **Otesánkův bezedný škopek** (`otesankuv_skopek`).

---

### 3. Permonický král – Starý důlní pán ze ztracené štoly

- **Původ a tělo**: Trpasličí vládce podzemních štol a rudných žil. Zavalitý stařec s bílým vousem až na zem, špičatou plstěnou čapkou, koženou zástěrou a hornickým mlátkem, jedoucí v okovaném dřevěném důlním vozíku.
- **Aréna (Poloměr 450 px)**: *Hradba z důlní výdřevy a opuky*. Hrubé trámy se železným kováním, odrážející vozík i projektily.
- **Bojová mechanika (Drkotající beranidlo a stropní zával)**:
  - Permonický král brázdí arénu ve vysokorychlostních přímočarých nájezdech ve vozíku (190 px/s). Při nárazu do stěny ohrady vykřeše spršku jisker a odrazí se pod novým úhlem.
  - V pravidelných intervalech udeří mlátkem o dno vozíku a vyvolá *Stropní zával*: 4–6 padajících opukových balvanů telegrafovaných křídovými kruhy (nápřah 1,0 s).
  - Vrhá roztočené třaskavé karbidové kahany, které po dopadu na zem explodují do ohnivých louží.
- **Vítězná podmínka (Duální)**:
  - **Přežití 60 sekund (Konec šichty a klekání)**: Z hlubin zazní zvonění důlního zvonu oznamující konec směny. Král zabrzdí, vozík se s rachotem převrátí a permoníci s kletbami zalezou zpět do země.
  - **Sražení Kuráže na 0**: Rozbití vozíku na třísky přímým poškozením.
- **Úvodní pokřik**:
  > *„Kdo to tady dupe nad mou štolou?! Havíři, vyvalte vozíky, zavřete šachtu a seberte tomu povalečovi kahany!“*
- **Odměna**: Artefakt do 5. zbraňového slotu **Rubínový důlní kahan** (`rubinovy_kahan`).

---

### 4. Jakub Krčín – Prokletý stavitel s ohnivým pluhem

- **Původ a tělo**: Jihočeský rybníkář a stavitel Jakub Krčín z Jelčan, jehož duši po smrti čerti zapřáhli do pekelného pluhu. Barokní šlechtic v černém sametu s bílým okružím a pštrosím perem, svírající řetězové opratě dvou černých pekelných hřebců s ohnivými nozdrami.
- **Aréna (Poloměr 450 px)**: *Kruhová ohnivá brázda*. Obvod vymezený hořící zemí.
- **Bojová mechanika (Brázdění terénu a hašení stavidly)**:
  - Spřežení v pravidelných trajektoriích protíná arénu a za radlicí pluhu zanechává trvalé plamenné brázdy, které rozdělují kruh na zmenšující se výseče (průchod brázdou uděluje 4 poškození za sekundu).
  - **Stavidla na obvodu**: Na okraji arény se nacházejí 3 dřevěná vodní stavidla. Proběhnutí lovce přes stavidlo uvolní příval vody, který uhasí ohnivé brázdy v dané výseči a na 3 sekundy zpomalí spřežení v blátě o 50 %.
- **Vítězná podmínka (Duální)**:
  - **Přežití 60 sekund (Přetržení čertovských opratí)**: Za ohlušujícího hromu prasknou pekelné řetězy, čerti strhnou pluh do bezedné bažiny a Krčínův přízrak se s úlevou rozplyne.
  - **Sražení Kuráže na 0**: Zlomení kouzla hrubou silou lovce.
- **Úvodní pokřik**:
  > *„Čerti práskají bičem, hráze pukají! Ještě jednu brázdu napříč vsí, než zakokrhá první kohout!“*  
  *(Reakce na Hastrmana: „Zalez pod splav, hastrmane, dneska vedu vodu já!“)*
- **Odměna**: Artefakt **Krčínovo vyměřovací kolo** (`krcinovo_kolo`).

---

### 5. Legendární artefakty a ekonomika nůše Čertova dědečka

Každý artefakt je okamžitě aktivní do konce aktuální výpravy a trvale se odemkne v nabídce nůše Čertova dědečka:

1. **Otesánkův bezedný škopek** (`otesankuv_skopek`):
   - Pasivní sběračský artefakt.
   - Každé 3 sekundy vyšle pulz stahující k lovci veškeré perníčky a spadlé jídlo z celého bojiště.
   - Projektily nepřátel dopadající na lovce zepředu jsou z 50 % absorbovány a proměněny na perníkovou drť (obnoví +2 Kuráže).
2. **Rubínový důlní kahan** (`rubinovy_kahan`):
   - Aktivní 5. slot zbraně.
   - Vyzařuje stálý kužel intenzivního červeného světla (úhel 70°, dosah 280 px) ve směru lovcova pohledu.
   - Oslňuje a zpomaluje zasažené běsy o 45 %, stínovým potvorám uděluje 30 poškození/s a trvale odhaluje skryté truhly a pokladnice na minimapě.
3. **Krčínovo vyměřovací kolo** (`krcinovo_kolo`):
   - Taktický podpůrný artefakt.
   - Pokud se lovec zastaví na místě alespoň na 1 sekundu, automaticky kolem sebe vztyčí kamennou hráz pohlcující 3 libovolné nepřátelské zásahy.
   - Trvale zvyšuje plošný rádius výbuchu a zásahu (AoE) všech primárních zbraní o 35 %.

---

### 6. Vizuální procedurální kodex (Canvas 2D)

V souladu s `AGENTS.md` a ADR 0033 jsou všichni 3 bossové a jejich artefakty realizováni výhradně procedurálními rutinami v Canvas 2D:
- Výrazná ladovská černá tušová kontura o tloušťce 2,5 px.
- Matné kvašové výplňové tóny (dřevitá hněď u Otesánka, šedá plst a rez u Permoníka, temný samet a ohnivá oranž u Krčína).
- Bílo-žluté křídové nápřahy (minimálně 0,8 s předem).
- Absolutní zákaz externích rastrových spritů a neověřených experimentálních formátů.

## Důsledky

- Sezónní obohacení Bubácké díry: každé roční období v Bubákově má svého charakteristického denního megabosse.
- Barbucha zůstává v 75 % pevnou a očekávanou hrozbou selhání rituálu.
- Hráč získává tři zcela unikátní arénové výzvy: poziční manévrování kolem polykače (Otesánek), kličkování mezi odrážejícím se beranidlem a padajícími kameny (Permoník) a prostorový management s hašením terénu (Krčín).
- Rozšíření arzenálu o 3 vysoce žádané legendární artefakty s novými pasivními a aktivními mechanikami.
