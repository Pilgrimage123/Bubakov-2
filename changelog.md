# Changelog

## 2026-10-06 — Optimalizace herní smyčky a Boss HUD
- Boss/miniboss HP HUD už není aktualizován z `takeDamage()` při každém zásahu; synchronizace je oddělena od gameplay entity logiky.
- Herní loop má stabilní lifecycle bez opakovaného vytváření animation loopu při změně React state.
- Neznámé ID nepřítele nyní vyhodí explicitní chybu místo tichého fallbacku na `rarach`.
- Final-boss victory je vázána pouze na skutečného finálního bosse aktuálního levelu.
- `src/game/perf.ts` je plně typovaný a bez nepotřebného React importu.

## 2026-10-06 — Weapon mastery
- Přidán samostatný systém mastery pro jednotlivé zbraně bez nahrazení jejich úrovní.
- Mastery nabízí specializace podle typu zbraně; bonus počtu projektilů se propisuje přímo do skutečného počtu vystřelených projektilů a zachovává zlomkový zbytek mezi výstřely.
- Mastery poškození a weapon-specific cooldown se aplikují přímo v boji; dvě mastery volby aktivují synergii.

## 2026-10-06 — Balancování pokladů a poškození nepřátel
- **Poklady:** frekvence běžných pokladových truhel snížena na třetinu; práh zvýšen z 9 800 na 29 400.
- **Nepřátelé:** poškození zvýšeno o 60 %.
- Garantované poklady minibossů a bossů zůstávají beze změny.

## 2026-10-06 — Balance arénových vylepšení
- Level-up nyní garantuje jednu bojovou volbu, jednu pasivní volbu a jednu wildcard volbu; limit 4 zbraní nebyl zaveden.
- Opravdová káva: -10 % cooldown za stack, minimum 40 %; Krvavé jelito: +15 % poškození.
- Medvědí mast: +30 Max Kuráže; Veselá mysl: +3 Kuráž každých 5 sekund; Magnetický měšec: +30 dosahu sběru.
- Zbraně: Osikový prut 18 base damage, Kynutý koláč a Povidlové buchty 3 s food CC, upravené tempo poškození Horkého bramboru, Včelího roje, Sněhové koule a Kropenky.

# Changelog

## 2026-10-05 — Přejmenování vylepšení: Medvědí mast (dříve Opravdová kuráž)
- **Přejmenování vylepšení na Medvědí mast**:
  - Vylepšení pro navýšení maximální kuráže (+25 Max Kuráž) přejmenováno z „Opravdová kuráž“ na tradiční **Medvědí mast**.
  - Vytvořena nová ladovská ikona tradiční kamenné dózy/kelímku s hojivou medvědí mastí, plátěným kloboučkem převázaným motouzem a emblémem medvědí tlapky (`MedvediMastIcon.tsx` a `medvedi_mast.svg`).
  - Aktualizována nabídka při postupu na novou úroveň, plovoucí texty zisku (`Medvědí mast! (+25 Max Kuráž)`), truhly i přehled aktivních posílení v pauze hry.

## 2026-10-05 — Nová vylepšení během boje v aréně: Opravdová káva a Krvavé jelito
- **Opravdová káva (- cooldown)**:
  - Nové pasivní vylepšení nabízené při postupu na novou úroveň během boje v aréně (i z malovaných truhel).
  - Každá dávka čerstvě pražené kávy zkracuje cooldown všech zbraní (-15 % cooldown / rychlejší kadence útoků) a zároveň urychluje dobití speciální schopnosti lovce.
  - Vytvořena nová originální ladovská grafika kouřícího keramického hrnku s kávou a kávovými zrnky (`OpravdovaKavaIcon.tsx` a `/public/images/opravdova_kava.svg`).
- **Krvavé jelito (+ damage)**:
  - Nové pasivní vylepšení nabízené při postupu na novou úroveň během boje v aréně (i z malovaných truhel).
  - Každé poctivé venkovské zabijačkové jelito s kroupami trvale zvyšuje sílu úderů a poškození všech zbraní a útoků (+20 % k zranění).
  - Vytvořena nová detailní ladovská grafika českého zabijačkového jelita se špejlemi, kroupami a kořením (`KrvaveJelitoIcon.tsx` a `/public/images/krvave_jelito.svg`).
- **Přehled aktivních vylepšení v pauze hry**:
  - Do pauzovacího menu přidán nový přehledný blok „✨ Získaná vylepšení a posílení lovce“, kde hráč vidí počty získaných káv, jelit, kuráže, bot i písniček a jejich přesný kumulovaný bonus.
  - V kartách zbraní se zobrazuje efektivní zkrácená kadence i navýšené poškození v reálném čase.

## 2026-10-05 — Efektivní charge Pekelného čerta, Zlomyslný sněhulák, unikátní bossové a samostatné dračí hlavy
- **Pekelný čert — skutečně efektivní a nebezpečný charge**:
  - Důkladná revize mechaniky charge: opraven malý dosah a pomalá rychlost, přidán zřetelný telegrafický windup (dusot kopyt v hlíně, rudé varování, jiskry ze země), zrychlení výpadu na 490–560 px/s se stopou pekelné síry a plamenů.
  - Zásah nabíhajícím čertem způsobí masivní drtivý náraz s odhozením hráče o 110 px a těžkým poškozením; po minutí čert sklouzne do brzdné fáze (brake), což dává hráči taktické okno k protiútoku.
  - V `drawCert` implementována dynamická animace výpadu (`isCharging`) s předklonem, sklopenými rohy, vodorovně napřaženými vidlemi a planoucí aurou.
- **Zlomyslný sněhulák a unikátní vizuál všech bossů**:
  - Prokletý sněhulák přejmenován na **Zlomyslný sněhulák** („Ledový bijec ze sluje“) a získal svůj vlastní plně animovaný ladovský sprite `drawSnehulak` (tři kutálející se koule, hrnec na hlavě s tajícími rampouchy, mrkvový nos, uhlíkový úšklebek, větev s proutěným koštětem a vířící sněhové vločky).
  - Prověřeni a opraveni všichni bossové a minibossové, kteří dosud sdíleli zástupné sprity běžných nepřátel:
    - **Bílá paní** (`drawBilaPani`): éterická hradní paní v plovoucím rouchu s vysokým henninem a závojem, přízračnou lucernou a vznášejícím se lemem.
    - **Rytířský zbrojnoš** (`drawZbrojnos`): hradní těžkooděnec v helmici (šlapu), kroužkové kukle, kyrysu s erbovním tabardem, těžkým štítem a halapartnou.
    - **Bezhlavý rytíř** (`drawBezhlavyRytir`): jezdec na temném obrněném oři třímající v ruce uťatou hlavu s planoucím pohledem a rezavý obouruční meč.
    - **Noční můra** (`drawNocniMura`): přízrak s jeleními parohy, korunou z lebečních kostí, fialovýma zářícíma očima a cárovitými nočními křídly.
    - **Pekelný dráb** (`drawDrab`): dráb v uniformním kabátě s mosaznými knoflíky, trojrohém klobouku s kokardou, okovy a karabáčem.
- **Tříhlavý drak — útoky z jednotlivých hlav a samostatná animace**:
  - Všechny tři dračí hlavy mají samostatné kinematické křivky, odlišnou frekvenci pohupování, mimiku a reakce:
    - **Levá hlava (Spící / Mrazivá)**: v 1. fázi líně spí, odfukuje spánkové bubliny a vypouští písmenka „Zzz“; ve 2. fázi se probouzí s ledovýma očima a při mrazivém dechu rozevře čelisti s rampouchovými tesáky.
    - **Prostřední hlava (Královská / Hlídací)**: pyšná vztyčená hlava s trojitou korunou rohů a vousiskem, ostražitě mrká a při přivolání rampouchů se vzepne k nebi, zařve a vyšle světelný sloup mrazivé energie přímo do klenby sluje.
    - **Pravá hlava (Ohnivá)**: agresivní dravé vlnění, ohnivé oči se štěrbinovou zornicí, při dračím dechu se tlama široce rozevře, vyšlehne plamenný jazyk a fontána jisker.
  - Všechny útoky vycházejí z přesných souřadnic tlamy příslušné hlavy podle aktuálního směru otočení draka (dračí plamen z ohnivé tlamy vpravo, mrazivý dech a síra z levé tlamy, přivolání rampouchů a větrný řev ze vztyčené koruny).

## 2026-10-05 — Možnost nastavení zbraní na úroveň nula v testovacím módu
- Každou jednotlivou zbraň v testovacím módu (sandboxu) lze snížit až na úroveň 0, případně jedním kliknutím vynulovat tlačítkem `[0]`.
- Zbraň s úrovní 0 je zřetelně označena jako neaktivní („Úr. 0 – lovec s touto zbraní nezačíná“) a lovec s ní do hry nevstupuje.
- K zahájení testovací výpravy je vyžadována alespoň 1 aktivní zbraň (úroveň >= 1); při nulovém výběru je startovací tlačítko deaktivováno s upozorněním pro hráče.


## 2026-10-04 — Nová podoba Kynutého koláče podle předlohy
- Zbraň a předmět Kynutý koláč získaly novou grafickou podobu přesně podle předlohy tradičního chodského slavnostního koláče.
- Vytvořena nová detailní SVG grafika `/public/images/kynuty_kolac.svg` a komponent `KynutyKolacIcon.tsx` obsahující zlatavě vypečený kynutý okraj, jemný tvarohový základ, 8 radiálních povidlových paprsků se zvlněnými girlandami, věnec mandlí v květu s rozinkou uprostřed a linku z rozinek.
- Přidán nový ladovský in-game renderer `drawKynutyKolac` v `ladaRenderer.ts` pro létající projektil v aréně.
- Zapojena nová ikona `kynuty_kolac` do zbrojnice, odemykání zbraní, výherního válce a `GameIcon`.

## 2026-10-04 — Přeměna léčivé buchty na hrušku
- Léčivý předmět padající z nepřátel a bossů (dříve buchta/pecen chleba) byl proměněn na šťavnatou českou hrušku s listem a stopkou v ladovském stylu.
- Implementována nová metoda vykreslování `drawHruska` a `drawPear` v `ladaRenderer.ts` s typickou ladovskou tušovou konturou, teplým barevným přechodem, tečkami a zeleným lístkem.
- Vytvořena nová SVG grafika `/public/images/hruska.svg` a React komponent `HruskaIcon.tsx`, začleněný do `GameIcon.tsx`.
- Aktualizovány textové bubliny při sebrání předmětu (`+15 HP 🍐`, „Šťavnatá hruška!“, „Sladká hruška 🍐“), přehled předmětů v `ControlsModal.tsx` i herní plán.

## 2026-10-02 — Performance optimization
- Enemy spatial hash for projectile/melee broad-phase collision queries.
- Per-frame living-enemy snapshot to reduce repeated array filtering.
- Squared-distance collision checks in hot paths.
- Reused living-enemy snapshot for projectile retargeting.
- Viewport culling for enemies and projectiles.
- Added in-place dead-entity cleanup helper.

## 2026-10-02 — Extended performance optimization
- Replaced the string-key enemy broad phase with a reusable numeric spatial hash and retained query buffers.
- Added allocation-free in-place cleanup for projectiles, slashes, enemies, drops and floating texts.
- Added a frame-time clamp to prevent expensive simulation bursts after stalled frames.
- Centralized squared-distance and viewport checks in reusable performance helpers.
- Kept the existing living-enemy snapshot and viewport culling from the previous pass.

## 2026-10-03 — Combat HUD: Kuráž
- Přidán horní ukazatel Kuráže zobrazující aktuální a maximální HP lovce.
- XP ukazatel dostal vlastní identifikátor pro spolehlivé cílení CSS.
- Herní animační smyčka nyní reaguje i na změnu obrazovky výběru lovce (menuScreen).
- Na menších displejích jsou horní HP/XP lišty kompaktnější.


## 2026-10-03 — Combat HUD: 22% viewport
- Sloučen a zpřesněn horní HUD tak, aby byl pevně omezen na maximálně 22 % dynamické výšky viewportu včetně safe-area offsetu.
- Na mobilech odstraněn konflikt se starým `top: 55px`; HUD nyní začíná u horní safe-area a používá stejný 22% limit.
- Sjednocena mobilní pravidla Kuráže, XP a statistik bez duplicitních `@media` bloků.
- Zmenšeny mobilní HP/XP lišty, statistický řádek a boss bar; HUD je oříznutý, aby vizuálně nepřetékal mimo vyhrazený prostor.
- Boss bar wrapper dostal vlastní výškový limit a desktopová výška boss HP lišty byla snížena z 26 na 22 px.

## 2026-10-03 — Dotykové ovládání: Odstranění duplicitní lišty schopnosti
- Na dotykových displejích a při aktivním dotykovém ovládání byla z bojové arény odstraněna spodní lišta „Speciální schopnost“.
- Pro aktivaci i přehled o stavu a odpočtu schopnosti plně dostačuje vyhrazené kruhové akční tlačítko vpravo dole, čímž se uvolnil prostor arény.

## 2026-10-03 — Přeměna Svatovítského balzámu na Jitrnici
- Svatovítský balzám byl nahrazen tradiční českou zabijačkovou jitrnicí se špejlemi na obou koncích podle folklorní předlohy.
- Vytvořen nový detailní ladovský renderer `drawJitrnice` s přírodním střívkem, viditelným kořením s majoránkou, leskem vařeného střívka a zašpejlovanými konci.
- Přidán nový vektorový komponent `JitrniceIcon` a SVG grafika `public/images/jitrnice.svg`.
- Aktualizovány truhly s odměnami, výherní válec i texty dropů v aréně i herním plánu.

## 2026-10-04 — Dotykové ovládání: Zajištění viditelnosti na všech typech displejů
- Kontejner dotykového ovládání `.touch-controls-container` i celá obrazovka `body` byly ukotveny přímo k dynamickému viewportu (`position: fixed; inset: 0; 100dvh`), čímž se eliminovalo přepadávání tlačítek pod spodní lištu prohlížeče na mobilním Safari a Chrome.
- V `index.html` byl přidán parametr `viewport-fit=cover` pro spolehlivou podporu proměnných bezpečných zón `env(safe-area-inset-*)`.
- Spodní pozice joysticku i tlačítka schopnosti nyní explicitně započítává spodní systémové gesto/lištu (`env(safe-area-inset-bottom)`) a má garantovanou minimální bezpečnou vzdálenost od okraje.
- Přidána plná podpora orientace na šířku (landscape na mobilech s výškou < 500 px) i pro velmi úzké telefony (<= 380 px), kde jsou prvky proporcionálně zmenšeny a posunuty od výřezů/kamer (`safe-area-inset-left / right`).
- Dynamické přesouvání základny joysticku v `TouchControls.tsx` nyní respektuje `visualViewport` a nikdy nedovolí posunout tlačítko do spodní systémové zóny.

## 2026-10-04 — Úprava frekvence padání pokladů
- Bodový práh pro upuštění malované truhly s pokladem (`DROP_THRESHOLDS.chest`) byl zvýšen ze 700 na 9 800 bodů (14× méně často).

## 2026-10-04 — Variabilní a dynamický systém dropů
- **Tématické afinity podle kategorií monster**: Vodní havěť nabízí vysokou šanci na dušičky v hrníčku a léčivé jitrnice; lesní a polní potvory na čerstvé buchty a pecen chleba; kostlivci a démoni na staré stříbrné groše, zlaté tolary a truhly pokladů.
- **Přímé náhodné dropy (Šťastná náhoda)**: Každý poražený nepřítel má přímou šanci upustit jídlo, jitrnici, dušičku nebo extra minci i bez čekání na naplnění počítadla.
- **Usmíření jídlem**: Bubáci usmíření pečenou buchtou nyní zanechávají vděčný dar – vyšší šanci na uctivou buchtu, osvobozenou dušičku a stříbrný groš.
- **Velkolepá kořist z bossů**: Poražení vládci bubáků vybuchnou ve fontánu pokladů (rozptýlené tolary, groše, zaručená jitrnice, pecen i dušička).
- **Organický fyzikální rozptyl dropů**: Předměty se po porážce rozletí do stran v přirozeném kruhu se simulací tření a hladkého dobrzdění.
- **Různorodé nominály mincí**: Krejcary se rozpadají do rozmanitých hodnot (měděné krejcary 1–3 kr., stříbrné groše 5–10 kr., zlaté tolary 15–25 kr.) s ladovskou grafikou a plovoucími texty.

## 2026-10-04 — Výrazní, větší a odolnější minibossové
- **Výrazně větší rozměry (+75 %)**: Minibossové (např. Polednice, Hastrman, Klekánice, Dráb, Meluzína, Ohnivý rarach, Hejtman zbojník, Ohnivý pes, Bílá paní, Zbrojnoš, Sněhulák, Noční můra) se vykreslují v monumentálním měřítku 1.75× a mají odpovídající kolizní poloměr (+65 %).
- **Výrazný vizuální styl**:
  - Pod nohama každého minibosse rotuje animovaná zlatavá folklorní aura se zuby a pulzujícím světelným halo.
  - Nad hlavou se zobrazuje ladovská kartuše s korunkou (`👑 MINIBOSS: JMÉNO`).
  - Každý miniboss má přímý vyhrazený overhead ukazatel HP s čísly a zlatým orámováním.
  - Minibossové se propisují do horní lišty bossů (`bossHpPct`) a při příchodu vyvolávají varovný banner se zvukem hromu.
- **Vysoká odolnost (HP, Poise a imunita vůči snadnému odhození)**:
  - Multiplikátory HP minibossů byly zvýšeny na 3.5× až 9.6× (garantované minimum 1 400 HP).
  - Poise resist zvýšen na 82–95 %, redukce odhození na 25 % (neuhýbají snadno úderům).
  - Vyšší odolnost vůči jídlu (foodResist a willpower).
- **Bohaté odměny při zklidnění**:
  - Poražení minibosse zaručuje pokladovou truhlu, spršku stříbrných a zlatých tolarů (+25 kr.), jitrnici, pecen a mocnou dušičku.
- **Tlačítko v pauze**:
  - V menu pozastavení hry [P] přidáno tlačítko `👑 Přivolat Minibosse!` pro okamžité vyzkoušení souboje v jakékoliv úrovni.



