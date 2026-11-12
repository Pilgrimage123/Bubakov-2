# Bubákov

Česká folklórní rogue-lite hra zasazená do světa Josefa Lady. Hráč se v roli vesnického hrdiny brání vlnám strašidel, sbírá perníčky a rozvíjí rodnou vesnici.

## Boj a vlastnosti

**Kuráž**:
Základní míra životní síly a odolnosti lovce; při jejím vyčerpání výprava končí porážkou.
_Avoid_: HP, životy, zdraví, hitpoints

**Štěstí**:
Míra přízně osudu lovce (se základní hodnotou kolem 100), jež ovlivňuje šanci na kritické zásahy, hodnotnější kořist na bojišti a výhodnější nabídky u Čertova dědečka.
_Avoid_: luck, štěstěna, náhoda, RNG

**Nápřah**:
Telegrafovaná přípravná fáze útoku strašidla, během které lovec vidí vizuální varování a může uskočit nebo útok přerušit.
_Avoid_: windup, attack charge, casting

**Milník zbraně**:
Bodem zlomu ve vývoji zbraně na úrovních 3, 5 a 8, kde hráč volí jednu ze dvou unikátních vzájemně výlučných schopností.
_Avoid_: weapon mastery, upgrade tier, perk

**Režisér výpravy**:
Řídicí subsystém koordinující tempo příchodu vln nepřátel, časování příchodu bossů a dynamickou obtížnost během výpravy.
_Avoid_: wave spawner, AI director, spawn scheduler

**Dynamická obtížnost**:
Herní nastavení a ukazatel vlivu Režiséra výpravy na chování a hustotu strašidel, volitelné v nabídce hry od základní míry po nejvyšší.
_Avoid_: difficulty level, obtížnost hry, challenge rating

**Ostřílení běsi**:
Zkušenější strašidla označená Režisérem výpravy při zaplnění bojiště na maximální kapacitu entit, čímž Režisér plynule odčerpává přebytečný rejdový rozpočet bez umělého skrytého navyšování základních statistik.
_Avoid_: elite buff, buffnutá monstra, enraged enemies

**Klešťové sevření**:
Koordinovaný taktický výpad strašidel iniciovaný Režisérem výpravy ze dvou či více protilehlých směrů, zamezující jednotvárnému kroužení hráče po bojišti.
_Avoid_: pincer attack, obklíčení, flanking spawn

**Zrádný terén**:
Dočasná povrchová překážka (blátivá louže či námraza) vyvolaná Režisérem výpravy v dráze lovce, který příliš dlouho krouží stejným směrem.
_Avoid_: hazard, snare zone, ground effect, past

**Drtivý přepad**:
Masivní protiúder Režiséra výpravy následující po fázi Oddychu, vedený dvojicí zrychlených velitelů s odolností proti odhození a obkličujícím rojem.
_Avoid_: ambush wave, wave rush, counter-attack

**Bubácká díra**:
Garantovaná časová anomálie vyvolaná Režisérem výpravy právě jednou za Výpravu v okně klidu, z níž vyvěrá stínový dým a kterou lovec musí zapečetit 4sekundovým setrváním v jejím víru dříve, než se z ní vyvalí Strachem nacpaný Barbucha.
_Avoid_: rift, portál, portal, spawner, trhlina, pekelná díra

**Strachem nacpaný Barbucha**:
Těžké dýmotvorné strašidlo z kouře s divokou černou kšticí a ostrými vystřelovacími drápy (žihadly), jež vystupuje z nezapečetěné Bubácké díry; jeho velikost roste s chybějící Kuráží lovce a úspěšné zásahy jej postupně vyfukují zpět do neškodné podoby.
_Avoid_: sněhulák, sněžný bubák, kouřové monstrum, stínový boss

**Čertova babička**:
Vzácný, postupně se zvětšující pekelný vele-boss s variabilními statistikami (3,5násobek Kuráže a hodnoty hlavního bosse dané úrovně), který se s 5% šancí vydrápe ze selhané Bubácké díry namísto Barbuchy; uvězní lovce v moučné ohradě a v průběhu 60sekundové zkoušky vytrvalosti roste z měřítka 1,35× až na gigantických 2,45×, přičemž jí postupně protrhnou šátek růžky, vyrazí ocas a z explodující boty vystřelí čertovské kopýtko.
_Avoid_: babička, čertice, pekelná bába, boss babička

**Ohrada z mouky a uhlí**:
Dočasná neprostupná kruhová bariéra vytyčená Čertovou babičkou po jejím probuzení z Bubácké díry, jež izoluje lovce v přehledném duelu, zraňuje při pokusu o únik a pozastavuje příchod běžných vln Režiséra výpravy.
_Avoid_: boss ring, aréna, moučný kruh, bariéra

**Babiččin bezedný pekáč**:
Legendární zbraňový artefakt získávaný z Malované almary po vyčerpání Kuráže Čertovy babičky, který v pravidelných vlnách rozmetá horké pocukrované buchty drtící okolní nepřátele a obnovující Kuráž lovce při přeběhnutí.
_Avoid_: evoluce zbraně, super zbraň, pekáč buchet

**Zakletá princezna**:
Noční aristokratický megaboss z pohádek Boženy Němcové s variabilními statistikami (2násobek Kuráže a bodů hlavního bosse měsíce, rychlý pohyb a stálá regenerace 1 % Kuráže za sekundu), která se zjevuje výhradně v nočních fázích se vzácnou 20% šancí ze selhané Bubácké díry namísto Barbuchy; duel nabízí duální vítěznou podmínku (sražení Kuráže na 0 nebo přežití tří 20sekundových nocí do kuropění), přičemž s každým zakokrháním kohouta z princezny opadává černá kletba a mění se z uhelné kostry v živou dívku.
_Avoid_: princezna, mrtvá nevěsta, zombie princezna, boss princezna

**Hřbitovní plot se svícemi**:
Kruhová aréna o poloměru 450 px vytyčená kovaným rezavým plotem s rozžatými hřbitovními svícemi, která izoluje lovce v duelu se Zakletou princeznou, trestá pokus o únik záhrobním mrazem a slouží jako odrazová stěna pro stovky letících perel z roztržených korálů.
_Avoid_: plot aréna, cemetery fence, hřbitovní kruh

**Společenské faux pas**:
Dočasný 3sekundový stav způsobený dotykem letícího Královského kapesníčku Zakleté princezny, při němž lovec zrudne studem a jeho směrové ovládání se plně obrátí (inverze os pohybu).
_Avoid_: confuse, zmatení, inverted controls, debuff trapas

**Perlový náhrdelník zakleté panny**:
Obranný zbraňový artefakt získávaný z Královského věna po odkletí Zakleté princezny, jenž při každém obdrženém zásahu lovce nebo prasknutí štítu vymrští do všech stran salvu 12 perel odrážejících se od překážek a nepřátel.
_Avoid_: perly, perl necklace, obranný náhrdelník

**Otesánek**:
Vzácný nenasytný megaboss z Erbenových pohádek v podobě živého vykopaného pařezu, který se s 20% šancí zjevuje ze selhané Bubácké díry v letních a polních měsících; svým čelním gravitačním chřtánem pohlcuje střely i perníčky a roste až na 2,4× měřítko, přičemž je zranitelný výhradně ze zálohy a jeho porážka přichází po 60 sekundách nebo protržením břicha z přejedení.
_Avoid_: pařez, dřevěný boss, nenasytný pařez, dřevorubec

**Trnitý kruh z živých kořenů**:
Kruhová bariéra o poloměru 450 px vytyčená oživlými kořeny Otesánka, jež uzavírá bojiště do duelu 1v1, zraňuje lovce při kontaktu s trny a pozastavuje přísun vln Režiséra výpravy.
_Avoid_: kořenová aréna, trnitá ohrada, wood ring

**Otesánkův bezedný škopek**:
Sběračský a obranný zbraňový artefakt získávaný z útrob puklého Otesánka, jenž v pravidelných 3sekundových pulzech stahuje perníčky a jídlo z celého bojiště a z 50 % přeměňuje čelní zásahy střelami na léčivou perníkovou drť.
_Avoid_: škopek, bezedný hrnec, magnet na perníčky

**Permonický král**:
Vzácný podzemní trpasličí megaboss z krušnohorských a příbramských štol jedoucí v okovaném důlním vozíku, který se s 20% šancí dere ze selhané Bubácké díry v kamenitých a zimních měsících; brázdí arénu jako odrážející se beranidlo, vyvolává stropní závaly opukových balvanů a vrhá třaskavé kahany, dokud v 60. sekundě nezazní večerní klekání ukončující směnu.
_Avoid_: trpaslík, permoník, král permoníků, horník

**Hradba z důlní výdřevy a opuky**:
Izolovaná aréna o poloměru 450 px ohraničená těžkými důlními trámy a skalními bloky, sloužící Permonickému králi k fyzikálním odrazům vozíku a chránící okolní bojiště před padajícím kamením.
_Avoid_: důlní aréna, výdřeva, šachta ring

**Rubínový důlní kahan**:
Aktivní zbraňový artefakt do 5. slotu získávaný po směně s Permonickým králem, který vyzařuje kužel intenzivního červeného světla oslepujícího a zpomalujícího nepřátele o 45 %, pálícího stínové běsy a odhalujícího skryté truhly na bojišti.
_Avoid_: kahan, důlní lucerna, baterka

**Jakub Krčín**:
Vzácný barokní megaboss ze slavné jihočeské pověsti, zapřažený čerty za trest do ohnivého pluhu, který se s 20% šancí vyvalí ze selhané Bubácké díry ve vodních a deštivých měsících; se svým pekelným spřežením vyrývá do arény trvalé plamenné brázdy a duel končí po 60 sekundách přetržením čertovských opratí nebo jeho skolením.
_Avoid_: rybníkář, Krčín, stavitel, ohnivý oráč

**Kruhová ohnivá brázda**:
Dočasná arénová ohrada o poloměru 450 px vyrytá Krčínovým pekelným pluhem, doplněná o 3 dřevěná vodní stavidla na obvodu, jejichž nakopnutím lovec uvolní vodu k uhašení hořících brázd a zabahnění spřežení.
_Avoid_: ohnivý kruh, brázdová aréna, pluh aréna

**Krčínovo vyměřovací kolo**:
Taktický obranný artefakt získávaný po vyčerpání Krčínova spřežení, jenž při 1sekundovém zastavení lovce automaticky vztyčí kamennou hráz pohlcující 3 zásahy a trvale navyšuje plošný dopad (AoE) všech primárních zbraní o 35 %.
_Avoid_: vyměřovací kolo, měřičské kolo, hrázový amulet

**Mariáš ďáblů**:
Bojová mechanika Pekelného Čerta, kdy ze svého balíčku pravidelně tasí mariášovou kartu (Srdce, Kule, Listy, Žaludy) s tematickým útokem či vyvoláním pekelné havěti.
_Avoid_: card attack, boss deck, spell cards

**Synergický upgrade**:
Původní přechodný subsystém zbraňových vylepšení, nahrazený plnohodnotným 8-úrovňovým modelem s Milníky a třemi Kategoriemi vylepšení.
_Avoid_: perk, weapon synergy, build upgrade

**Zoufalá kuráž**:
Plynulé posílení útočné síly lovce úměrné chybějící Kuráži (až +25 % za úroveň budovy při nulové Kuráži), inspirované odhodláním v hospodské rvačce; při poklesu Kuráže pod 35 % aktivuje dramatický vizuální pokřik.
_Avoid_: berserk, rage mode, low hp buff, záchvat zuřivosti

**Posvěcená rázová vlna**:
Ochranná posvátná vlna vyšlehující z Kaple svaté vlny kolem lovce v okamžiku, kdy rozbije hliněný hrneček a osvobodí zbloudilou dušičku, která odhodí a zraní okolní běsy.
_Avoid_: holy nova, holy burst, výbuch světla, shockwave

**Přívlastek bubáka**:
Viditelný přívlastek a magická aura modifikující chování nebo vlastnosti strašidla bez skrytých cheatů.
_Avoid_: affix, mob prefix, monster modifier, prefix

**Dvojče minibosse**:
Trestná kopie oblastního minibosse povolaná Režisérem výpravy při drtivé dominanci a úspěchu lovce bez ohledu na základní nastavení obtížnosti.
_Avoid_: twin miniboss, boss clone, dvojník

**Herní hodnota strašidla**:
Kanonické bodové ohodnocení strašidla na bojišti vypočítané z kompozitního indexu hrozby (kombinace efektivního poškození za sekundu, efektivní Kuráže, přirážek za otravnost/střelbu/krádeže a slev za snadnou zranitelnost). Určuje celkové skóre běhu, velikost získávaných perníků a frekvenci uvolňování předmětových truhel a posil.
_Avoid_: mob XP, expy, monster score, bodový rank, body bubáka

**Rejdová cena strašidla**:
Počet bodů (v rozmezí 1 až 12 pro běžná strašidla, 18 pro trestné Dvojče), které Režisér výpravy musí investovat ze svého Rejdového rozpočtu za vyslání daného strašidla do arény, odvozený z jeho skutečné nebezpečnosti a míry otravnosti pro lovce.
_Avoid_: spawn cost, monster cost, váha monstra, threat cost

**Vyčerpaný bubák**:
Oslabená varianta strašidla s poloviční Kuráží i rychlostí nasazovaná v krizi pro záchranu lovce při zachování plné hodnoty odměn.
_Avoid_: debuffed enemy, unavený bubák, oslabený nepřítel

**Bleskový odraz**:
Obranný mechanismus Hromových strašidel vracející část utrženého zranění zpět lovci na blízko, chráněný bezpečnostním stropem.
_Avoid_: thorns, reflect damage, trny

**Potácení**:
Kolébavý a vrávoravý pohyb Vyčerpaných strašidel indikující jejich únavu a zpomalenou bojovou připravenost.
_Avoid_: stagger, stumble, pajdání

**Kategorie vylepšení zbraní**:
Tematické bazény 6 běžných vylepšení pro každou ze tří tříd zbraní (sečné zbraně `melee`, aury `aura` a projektilové zbraně `projectile`), které na úrovních 2, 4, 6 a 7 nahrazují generické bonusy.
_Avoid_: perk tree, weapon skill tree, upgrade category

**Nabíjení**:
Ukazatel rychlosti přípravy zbraní a schopností lovce, který lineárně zvyšuje frekvenci útoků násobitelem (1 + nabíjení) a zkracuje prodlevu mezi údery bez hyperbolického přehřívání.
_Avoid_: cooldown, CDR, snížení cooldownu, prodleva, cooldown reduction, attack speed

**Strop kadence**:
Původní hranice zkrácení prodlevy mezi útoky, nahrazená plynulým lineárním systémem Nabíjení bez nutnosti umělého odřezávání.
_Avoid_: cooldown cap, attack speed cap, soft cap, hard cap

**Oblak bylinného dýmu**:
Plošný účinek Bylinkové fajfky, který v zóně zpomaluje dotírající strašidla a léčí lovce bez nutnosti fyzického odhazování nepřátel.
_Avoid_: smoke aura, poison cloud, AOE dým

**Maska medvěda**:
Masopustní maska a posvěcení z dědečkovy nůše, díky kterému veškeré přeléčení (overheal) Kuráže vyšlehne jako tlaková vlna zraňující okolní strašidla.
_Avoid_: bear mask, overheal damage, masopustní maska

**Snímkový rozpočet zbraně**:
Přípustný limit výpočetního a vykreslovacího času na jeden snímek (typicky do 1,5 ms v profilu vyváženého výkonu), který smí vyčerpat obsluha střel, efektů a zásahů jediné zbraně při plném vylepšení.
_Avoid_: weapon lag, FPS overhead, náročnost zbraně, weapon cost

**Bojové plovoucí texty**:
Vizuální textové ukazatele zranění, stavů, nápřahů a oznámení vznášející se nad entitami v bojové aréně, samostatně přepínatelné pro vyšší přehlednost a plynulost.
_Avoid_: floating combat text, combat text, pop-up čísla, damage numbers

**Efektivní kapacita bojiště**:
Autoritativní kapacitní metrika Režiséra výpravy, v níž každé samostatné strašidlo představuje 1 jednotku skutečné výpočetní zátěže, zatímco Hejno vran řízené virtuálním vůdcem (Virtual Leader) se počítá souhrnně jako 3 jednotky kapacity, čímž zamezuje zahlcení výpočetního snímku i falešnému zablokování herního tempa.
_Avoid_: počet monster, mob count, entity cap, váha nepřátel

**Šetření slotů**:
Taktické pozastavení náhodných jednotlivých spawnů Režisérem výpravy za účelem rezervace ucelené kapacity (3 sloty pro Hejno vran po 18 sekundách bez hejna v 1. úrovni či 5–6 slotů pro koordinované těžké formace).
_Avoid_: spawn delay, slot hoarding, držení slotů

**Kvalitativní vyrovnání obtížnosti**:
Pravidlo Režiséra výpravy, podle kterého se při vyčerpání efektivní kapacity bojiště tlak na hráče nezvyšuje prostým navyšováním počtu těl, nýbrž investicí rejdového rozpočtu do elitních variant, přívlastků a Ostřílených běsů.
_Avoid_: mob spam, entity bloating, zahušťování nepřátel

**Trojjedinost nepřátelských vln**:
Pravidlo vyvážené skladby spawn bazénů Režiséra výpravy, v němž každá fáze dne i noci povinně kombinuje drobnou havěť (citlivou na aury), přímé těžké běsy (odolné proti odhození a zranitelné sečnými zbraněmi) a taktické narušitele či letce (vynucující mířené projektily a úskoky).
_Avoid_: wave balance, mob variety, pestrost vln, enemy triad

**Ukazatel ohrožení lovce**:
Normalizovaný index (0,0 až 1,0) vyhodnocovaný Režisérem výpravy z Kuráže, nedávného zranění, připravenosti arzenálu a hustoty běsů pro dynamické řízení tempa a kořisti.
_Avoid_: vulnerability score, threat index, stress score, V-skóre

**Hejno mrazivých vran**:
Vrcholný skupinový boss 1. úrovně (Denní tání) tvořený kompaktní letovou formací 9 dravých vran se sdíleným ukazatelem Kuráže, vysokou rychlostí náletů (260 px/s) a dynamickým úbytkem těl při postupném zraňování; po porážce celého hejna zanechává malovanou truhlu a pečetí vítězství denní výpravy.
_Avoid_: vrana miniboss, obří vrána, crow swarm boss

**Kotevní boss výpravy**:
Pevný referenční etalon pro odvození parametrů a Kuráže všech ostatních bossů v kampani, ztělesněný Hejnem mrazivých vran v 1. úrovni s výchozí celkovou výdrží 1 800 Kuráže (formace 9 vran po 200 Kuráže).
_Avoid_: dummy boss, boss benchmark, HP scaler

**Křivka obtížnosti výprav**:
Pravidlo aditivního růstu náročnosti mezi Výpravami kampaně (+20 % základ + 5 % za každou úroveň s úvodním krokem +15 % mezi 1. a 2. Výpravou), promítané do rejdového rozpočtu Režiséra výpravy a odstupňování bossů od 100 % do 360 % v 8. úrovni.
_Avoid_: exponenciální obtížnost, level stat-scaling, geometrické násobení, hidden cheat

**Smart SVG sprity**:
Původní přechodné DOM vektorové komponenty postav, kompletně nahrazené procedurálními ladovskými rutinami na HTML5 plátně (Canvas 2D) v bojové aréně i ve všech rozhraních.
_Avoid_: SVG avatary, vektorové ikony postav, DOM postavy v aréně


## Světlo a atmosféra

**Petrolejka**:
Mosazná petrolejová lampa lovce osvětlující temná zákoutí a noční výpravy, jejíž záře pulzuje a roste v závislosti na lovcově Kuráži.
_Avoid_: lucerna, baterka, lantern, pochodeň, lampa

**Kvašová záře**:
Ladovské stupňovité osvětlení scény tvořené 3–4 měkkými tónovými pásy s tušovým tečkováním na okrajích namísto digitálního přechodu.
_Avoid_: bloom, dynamické světlo, gradient blur, halo

**Stínová záštita**:
Zvýšená odolnost a rychlost nočních strašidel (např. Bubáka) ukrytých v přítmí či vrženém stínu, která se rozpadá při vyhnání na přímé světlo Petrolejky či slunce.
_Avoid_: shadow buff, stealth armor, stínový štít

**Roubenka**:
Tradiční dřevěná chalupa s šindelovou střechou; v noci její okenní tabulky vrhají na sníh hřejivé máslové lichoběžníky a tvoří bezpečné světelné ostrůvky, zatímco ve dne její stěny vrhají tušový stín vyhledávaný Bubáky.
_Avoid_: dům, domek, budova, chata

**Boží muka**:
Drobná kamenná či dřevěná sakrální stavba u polní cesty se zapálenou svící či věčným světlem, jež v noci zahání noční havěť.
_Avoid_: shrine, oltář, sloup, kaplička

**Kachlová kamna**:
Tradiční vesnická kamna s pecí v zázemí Čertova dědečka vyzařující hluboký oranžový žár, chránící před mrazem i dotěrnými strašidly.
_Avoid_: kamna, krb, plotna, topení

## Ekonomika a postup

**Perníčky**:
Základní běhová měna získávaná z poražených strašidel v průběhu výpravy pro nákup u Čertova dědečka.
_Avoid_: XP, expy, zkušenosti, drop body

**Slévání perníčků**:
Automatické slučování neposbíraných drobných perníčků na louce do větších bochánků s hodnotovým bonusem, zabraňující zahlcení bojiště.
_Avoid_: drop fusion, XP merge, komprese dropů, fúze dropů

**Pokladnice kořisti**:
Paměťový rezervoár střádající hodnotu kořisti při zaplnění kapacity 40 volných předmětů na bojišti, vyplácený do konsolidovaných celků či těžkých kotev.
_Avoid_: drop bank, rezervoár kořisti, loot bank

**Těžké kotvy**:
Rozměrné, gravitačně pomalé předměty na bojišti vyvolané Režisérem výpravy za horizontem obrazovky za účelem prolomení kempování a podnícení pohybu lovce.
_Avoid_: heavy anchor drops, objective drops, map beacons

**Košík perníku**:
Záchranná těžká kotva vyvolaná v krizové fázi ohrožení za horizontem bojiště, navádějící obklíčeného lovce do bezpečnějšího koridoru.
_Avoid_: gingerbread stash, perníková nůše, heal chest

**Velký měšec krejcarů**:
Těžká kotva bohatství vyvolaná výplatou z Pokladnice kořisti nebo při pasivitě lovce, jež se pomalu sune k lovci a po cestě pohlcuje drobné krejcary.
_Avoid_: big coin pouch, pytel zlaťáků, money bag

**Krejcar**:

Trvalá měna získávaná z truhel a odměn po skončení výpravy, sloužící k trvalé výstavbě vesnických budov v hospodě U Černého kocoura.
_Avoid_: mince, zlato, peníze, gold

**Čertův dědeček**:
Toulavý kramář a pekelník s nůší procházející herním světem, který za perníčky nabízí runová vylepšení a zbraně.
_Avoid_: level-up nabídka, obchodník, shopkeeper

**Kramářská nůše**:
Monumentální proutěná nůše nošená na zádech Čertova dědečka na kožených popruzích, obsahující starožitné kramářské zboží, truhličku, byliny, zavěšenou bandasku, myšku Rézinku a proděravělý výplet, jímž trousí perníčky.
_Avoid_: batoh, nákupní košík, backpack, inventář

**Čertovské kulhání**:
Asymetrická kinematika chůze Čertova dědečka skládající se z těžkého dopadu kopyta, odvalení šněrovací škorně a pružné sekundární setrvačnosti nůše.
_Avoid_: pajdání, kolébání, waddle, kulhání bez nůše

**Výprava**:
Samostatná hratelná úroveň kampaně s uceleným časovým harmonogramem, vlastním fázováním dne, specifickou havětí a hierarchií bossů (v nabídce tvoří 24 po sobě jdoucích úrovní uzavírajících kompletní 12měsíční kalendářní cyklus od Března po Únor).
_Avoid_: run, stage, level, zápas, kolo, match

**Ohnisko výpravy**:
Jediné hlavní interaktivní centrum vesnice ovládané klávesou [E] s pevnou dobou nabíjení, specifické pro danou Výpravu.
_Avoid_: interaktivní bod, aktivní POI, mechanika mapy

**Pravidlo trojjedinosti vln**:
Taktické pravidlo povinné kombinace tří archetypů (drobná havěť či roj, přímý běžec či těžký běs a taktický letec či narušitel) v každém bazénu vln všech fází dne.
_Avoid_: wave trinity, vyvážení vln, skladba nepřátel

**Kolizní stín letce**:
Zemský oválný poloprůhledný stín posunutý o +20–30 px svisle pod středem těla letícího strašidla, určující bod kolize se střelami v lidové perspektivě.
_Avoid_: flying shadow, stín pod monstrem

**Koledující bubák**:
Velikonoční oblastní Mezi-boss nastupující v 185. sekundě ve 3. úrovni (Dubnový den), šlehající pletenou vrbovou pomlázkou s barevnými pentlemi a metající malovaná velikonoční vajíčka.
_Avoid_: velikonoční koledník, koledník, easter boy

**Pan Zajíc**:
Velikonoční Vele-boss 3. úrovně (Dubnový den) z březového háje, skákající přes bojiště s nůší kraslic, metající bouchací vajíčka a kličkující v osení.
_Avoid_: velikonoční králík, easter bunny, zajíc boss

**Masopustní laufr**:
Tradiční masopustní maska rychlého běžce s řehtačkou, kloboukem s pentlemi a rolničkami, vystupující jako svižný Miniboss v 24. úrovni při nočním pochovávání basy (nahrazuje cizorodého kobolda).
_Avoid_: noční kobold, kobold, běhoun

**Svatováclavský strážce**:
Podzimní oblastní Miniboss ve 14. úrovni (Září noc) střežící chrámové relikvie se zářícím svatováclavským mečem a štítem.
_Avoid_: bílá paní v září, templář, rytíř stínů

**Chmelový skřítek**:
Podzimní oblastní Mezi-boss ve 14. úrovni (Září noc) z chmelnic u rybníka Brčálníku, útočící omamným chmelovým pylem a záchytnými šlahouny révy.
_Avoid_: mlynář v září, pivní skřítek, chmelák

**Taktická trojice útoků bosse**:
Kanonické pravidlo odstupňování bojových dovedností bossů podle jejich hierarchického zařazení ve Zlatém trojzubci příchodu (Miniboss v 85. s = 2 telegrafované schopnosti; Mezi-boss v 185. s = 2 až 3 schopnosti s přivoláváním poskoků či zónovými pastmi; Vele-boss ve 300. s = minimálně 3 velkolepé fázované útoky s fází zuřivosti pod 50 % Kuráže).
_Avoid_: boss moveset, attack roster, skill list, kombo útoky

**Kruhový zásobník terénu**:
Předalokované pole s pevnou kapacitou slotů pro Zrádný terén zaručující nulovou alokaci v herním cyklu.
_Avoid_: ring buffer, pool pastí, terénní cache

**Škrcení bojových textů**:
Časové omezení frekvence generování plovoucích bojových čísel na max. 1 text za 0.25 s a jejich agregace při hromadném zásahu.
_Avoid_: floating text throttling, FCT throttle, omezení textů

**Pohádková kniha Bubákova**:
Kanonické označení pro ústřední interaktivní ilustrovanou dvojstranu (`LadaStorybookSpread`) ve stylu českých pohádkových knih (SNDK/Albatros), sloužící k volbě výpravy, prohlížení světa a četbě příběhu s autentickým šelestem stránek, plátěnými záložkami a dřevorytovým písmem.
_Avoid_: grid menu, stage selector, hlavní menu, úroveň box

**Kronika výpravy**:
Průběžný záznam cílů, splněných výzev a postupu hráče v terénu během aktuální noční výpravy či v obrazovce pozastavené hry.
_Avoid_: zápisník cest, zápisník z cest, zápisník v poli, cestovní deník

**Kronika Bubákova (Kronika vývoje)**:
Historický archiv reálných verzí a skutečných vývojových změn hry Bubákov přístupný v okně záznamů.
_Avoid_: changelog, git log, patch notes

**Kraj**:
Zeměpisná a folklórní oblast venkovského světa (např. Předjaří v Hrusicích, Duben v Hrusicích), která může hostit jednu i více tematických výprav.
_Avoid_: stage, level, mapa, herní zóna

**Aréna**:
Fyzické bojiště a prostorové uspořádání krajiny s pevnými hranicemi, architektonickými překážkami, vodními toky a zákrytem střech (např. Březnové tání, Dubnová náves).
_Avoid_: stage arena, mapa, herní plocha, map grid

**Denní výprava**:
Výprava odehrávající se za jasného denního svitu s otevřeným rozhledem a přehlednějším chováním polní havěti.
_Avoid_: day run, day stage, denní stage, denní level

**Noční výprava**:
Výprava zahalená tmou, chladem a stíny, kde se objevují nebezpečnější noční běsi, přízraky a přísnější bojové podmínky.
_Avoid_: night run, night stage, noční stage, noční level

**Vesnice**:
Místní zázemí a hospoda U Černého kocoura, kde hráč za nastřádané krejcary investuje do trvalých obecních vylepšení (Kovářská výheň, Kaple svaté vlny, Šenkýřova kuráž a dalších 10 budov).
_Avoid_: hub, lobby, město

**Obecní vylepšení**:
Trvalé zvelebování 13 obecních budov v hospodě U Černého kocoura za krejcary, posilující lovce s ohledem na zachování jeho osobního charakteru pomocí procentuálních bonusů.
_Avoid_: upgrade, upgrady, vylepšení v hospodě, perky

**Obecní přirážka**:
Pravidlo sdíleného zdražování obecních vylepšení (+20 % za každou zakoupenou úroveň libovolné budovy), motivující hráče k promyšlenému rozdělování investic při neomezeném rozvoji vsi.
_Avoid_: daň, globální inflace, cost multiplier, village tax

**Vrácení krejcarů**:
Bezplatné a úplné vyrovnání všech investic do obecních budov v hospodě, umožňující volné přerozdělení nastřádaných krejcarů.
_Avoid_: respec, reset vylepšení, refund, přerozdělení bodů

**Škvarková placka**:
Křupavá pečená venkovská pochoutka získávaná z malovaných truhel pro okamžité doplnění 50 Kuráže, pojmově oddělená od vrhací zbraně Povidlové buchty.
_Avoid_: buchta z truhly, svačina, heal drop

**Pomeranč z Orientu**:
Vzácná exotická posilující dobrota z dědečkovy nůše a malovaných truhel trvale zvyšující maximální Kuráž lovce o 25, pojmově oddělená od vrhací zbraně Kynutý koláč.
_Avoid_: koláč z truhly, kynutý koláč perk, oranž

## Vývoj a architektura

**Dvoukolejný vývoj**:
Model souběžného vývoje mezi webovým Google AI Studiem (rychlé prototypování UI a parametrů) a lokálním agentem (hloubková architektura a enginové moduly), jištěný samoopravným CI a rušením zastaralých běhů.
_Avoid_: duální commitování, nesourodý vývoj, neřízený push

**Modální šev**:
Architektonická hranice v `AppModals.tsx` sdružující veškerá dialogová a nastavovací okna odděleně od herního plátna a simulační smyčky v `App.tsx`, eliminující merge konflikty při souběžné editaci.
_Avoid_: dialogový kontejner, modal wrapper, UI bundle

**Zátěžový benchmark strašidel**:
Deterministická měřicí zkouška simulace a procedurálního vykreslování jednotlivých druhů strašidel v izolovaném zátěžovém scénáři (40 instancí po 120 snímků), ověřující nepřekročení bezpečnostního časového rozpočtu snímku (p95 pod 16,7 ms).
_Avoid_: mob benchmark, enemy perf test, test zátěže monster

**Procedurální kresba lovce**:
Čistá vektorová kresba hrdiny štětcem na herní 2D plátno v ladovském tušovém a kvašovém stylu, určená pro plynulý běh bojové arény bez paměťových alokací.
_Avoid_: sprite, lovecký sprite, spritový list, rastrový sprite

**Pohybové stavy lovce**:
Čtveřice čitelných tělesných postojů každého vesnického hrdiny na bojišti — klid s chůzí, zrychlený sprint s vířením prachu, úlek při zásahu a panický úprk po vyčerpání Kuráže — při nichž si postava drží poslední vodorovné natočení i během čistě svislého pohybu.
_Avoid_: animační stavy spritu, hit animace, walk cycle

**Procedurální kresba kramáře**:
Interaktivní procedurální tušová a kvašová kresba Čertova dědečka s nůší a myškou Rézinkou na 2D plátně v kramářském krámku i dialogových oknech, nahrazující původní těžké Smart SVG komponenty.
_Avoid_: SVG dědeček, DOM postava dědečka, kramářský sprite

**Kruhový zásobník terénu**:
Předalokované statické pole pevných rozměrů (typicky 32–64 slotů) pro správu Zrádného terénu a dynamických environmentálních zón, které nově vznikající kaluže zapisuje přímým přepisem na indexu hlavy bez volání alokačních metod `.push()`, `.splice()` nebo `.filter()`.
_Avoid_: hazard array, ring buffer, kalužové pole, dynamický seznam pastí


## Aréna a měřítko

**Kotva měřítka**:
Výška dospělé postavy lovce (75–80 bodů, kolizní rádius 20), jež slouží jako základní etalon pro odvození proporcí veškerých bytostí, staveb, střel i kořisti na bojišti.
_Avoid_: scale factor, unit scale, pixel grid, měřítkový násobitel

**Hierarchie velikostí entit**:
Kanonické čtyřstupňové členění bytostí na bojišti (drobná havěť, lidé a řadoví běsi, těžká strašidla a drábi, obludní bossové a legendy) garantující vyvážený poměr mezi čitelností nápřahů a ladovskými proporcemi.
_Avoid_: entity tiers, size classes, mob scaling

**Harmonizovaný projektil**:
Vrhací pochutina či střela, jejíž vykreslovaný rozměr (24–32 bodů) odpovídá jejímu reálnému koliznímu dosahu a přirozenému poměru k rukám lovce.
_Avoid_: projectile hitbox, bullet size, sprite scale

**Základový půdorys stavby**:
Přízemní kolizní stopa vesnických stavení a stromů omezená na jejich základnu a spodní stěny, jež umožňuje postavám přirozeně procházet v zákrytu za převislou šindelovou střechou či korunou stromu.
_Avoid_: building hitbox, obstacle box, neviditelná zeď

**Signaturní vesnická mechanika**:
Jediné hlavní interaktivní ohnisko výpravy ovládané klávesou [E] s pevnou dobou nabíjení (15–20 s), svázané s dominantou daného kalendářního měsíce (např. Kotel na povidla, Svatováclavský oheň, Chlebová pec), zatímco ostatní body zájmu poskytují pouze pasivní zónové aury.
_Avoid_: stage gimmick, level mechanic, E-ability, aktivní budova

**Kolizní stín letce**:
Oválný poloprůhledný stín vrhaný létajícími monstry na zemský povrch s pevným svislým odsazením (+20–30 bodů pod středem těla), který lovci udává přesnou polohu kolizní stopy a bod dopadu projektilů.
_Avoid_: flying shadow, výškový stín, letový offset


**Distribuce a rozdělení bundlu**:
Modulární strategie sestavení herního klienta ve Vite, která vyčleňuje knihovny a ladovské kreslicí rutiny do samostatných chunků a vývojářská okna načítá asynchronně přes `React.lazy()`, čímž zamezuje stahování nepotřebného kódu a drží primární herní bundle pod limitem prohlížeče.
_Avoid_: monolitický bundle, single-file bundle, obří bundle


## Rozhraní a navigace

**Nabídka výprav**:
Hlavní obrazovka hry sloužící k volbě cílového kraje noční výpravy, úpravě dynamické obtížnosti a přechodu do hospody, zbrojnice, bestiáře či nastavení.
_Avoid_: stage select, level select, hlavní menu, mission picker

**Výběr lovce**:
Předsíň výpravy navazující na zvolený kraj, kde hráč vybírá vesnického hrdinu pro nadcházející noc, sleduje postup odemykání zamčených lovců a má přímý přístup zpět do hospody a zbrojnice.
_Avoid_: character select, hero select, volba postavy

**Odpočinek u milníku**:
Stav pozastavení probíhající výpravy umožňující prohlédnout nesený arzenál a získaná posílení, rychle upravit zvuk, plynulost či ovládání a v bezpečí sečíst kořist při předčasném návratu.
_Avoid_: pause menu, pauza, herní pauza, pause screen

**Vyhodnocení výpravy**:
Závěrečná bilance výpravy shrnující zklidněná strašidla, osvobozené dušičky a krejcary, s možností pokračovat do dalšího kraje, vstoupit do hospody nebo se vrátit přímo do nabídky výprav.
_Avoid_: tally screen, game over screen, victory screen, výsledková listina

**Ladovské ikony**:
Vektorové animované grafické prvky rozhraní kreslené v autentickém stylu Josefa Lady s výraznou tušovou konturou, teplými zemitými kvašovými tóny a jemnou mikroskopickou animací, nahrazující moderní a operační emoji.
_Avoid_: emoji, moderní ikony, stock ikony, systémové ikony

**Kovaný zámek**:
Tradiční kovaný visací zámek symbolizující uzamčenou výpravu či dosud neprobádaný obsah, zobrazovaný jako autoritativní odznak v záhlaví karty výpravy bez vizuálního zdvojování v doprovodném textu či na dílčích milnících.
_Avoid_: padlock emoji, duplicitní zámek, zámek u každého procenta

**Tající sněhuláci**:
Horda 40 tajících sněhuláků v 1. úrovni (Předjaří) řízená jedním neviditelným Virtuálním vůdcem (Virtual Leader) se slotovými posuny a časově krájenou separací (4 sněhuláci za snímek). Sněhuláci postupně tají (ztráta Kuráže za sekundu), vizuálně se zplošťují a po zániku se rozpustí do 4sekundové ledové vodní louže zpomalující lovce o 25 % s periodickým zraněním.
_Avoid_: zákeřný sněhulák, zlomyslný sněhulák, generic mob wave


**Karta lovce**:
Kompaktní dlaždice ve výběru lovce, která hráči stačí k rychlé volbě: portrét, jméno, role, základní vlastnosti a stav odemčení. Podrobnosti nenese, ty patří do Spisu lovce.
_Avoid_: profil lovce, info karta, dossier karta

**Spis lovce**:
Podrobné okno s plnými vlastnostmi, výbavou, pasivní a zvláštní schopností jednoho lovce, otevírané z Karty lovce.
_Avoid_: profil, detail lovce, statistiky lovce

**Dubnová noc**:
Čtvrtá výprava kampaně odehrávající se za potemnělé Filipojakubské noci z 30. dubna na 1. května, provázená plápolajícími ohni, větrnými víry a rejem čarodějnic.
_Avoid_: night stage 4, podzimní noc, čarodějnický level

**Bahenní hastrman z Brčálníku**:
Májový oblastní Midboss nastupující v 185. sekundě z vyhřátého rybníka Brčálníku v 5. úrovni, vrhající leknínové bahno a chránící své hrnečky s dušičkami.
_Avoid_: vodník miniboss, rybniční boss, hastrman elite

**Hastrman Brčál**:
Kanonický ladovský vodník z Hrusic v zeleném fraku bafající z fajfky na vrbové větvi, který dohlíží na rybník a noční dění v kraji. Vystupuje jako patron a příběhová postava či boss, nikoli jako hratelný lovec.
_Avoid_: Česílko, vodník Česílko, Hastrman Česílko, rybniční skřítek

**Parita herního klienta**:
Architektonické pravidlo zakazující stav, kdy nová strašidla, chování bossů či interakce pamětihodností existují pouze v testovacím simulačním enginu (`engine.ts`), aniž by byla plnohodnotně a paritně zrcadlena v interaktivním herním rozhraní (`App.tsx`).
_Avoid_: duální engine nesoulad, engine-only mob, headless drift


## Výtvarný styl a vizuální hierarchie

**Dvouúrovňová linka**:
Hierarchické odstupňování síly tušové kontury (3,5 px lovec a střely se světlým lemem, 2,5–3 px vnější silueta strašidel a 1 px vnitřní vlasové detaily) zamezující vzniku nečitelného tmavého šumu při překryvu stovek entit.
_Avoid_: jednotná kontura, tlustá linka pro vše, jednolité obrysy

**Polarita akcentní palety**:
Striktní rozdělení 10% syté barevné vrstvy na výstražnou rumělkovou červeň pro nebezpečí a nápřahy, zlatožlutou pro odměny a Perníčky a kobaltovou modř pro zásahy lovce.
_Avoid_: nerozlišené akcenty, náhodné barvy střel, žluté projektily nepřátel

**Akvarelové stopy terénu**:
Dočasné louže a komické skvrny na zemi (rozlité pivo, bláto, povidla) vykreslované výhradně jako poloprůhledné rozpité lazury (max. 35 % krytí) bez černé linky, zachovávající klidnou 60% plochu podlahy.
_Avoid_: ohraničené louže, komiksové kaluže s linkou, neprůhledné skvrny

**Komiksová citoslovce**:
Textové dýmové obláčky („BÁC!“, „PRÁSK!“) vyhrazené výhradně pro kritické zásahy, exploze milníků a pád bossů s přísným limitem současného zobrazení chránícím rozpočet snímku.
_Avoid_: plovoucí komiksový spam, citoslovce u každého zásahu, textový smog

**Noční konturová inverze**:
Výměna sytě černé tušové linky za křídově bílou konturu (1,5 px) pro entity nacházející se mimo kužel světla Petrolejky v nočních výpravách, inspirovaná Ladovými kresbami na tmavomodrém kartonu.
_Avoid_: černá linka ve tmě, noční neviditelnost, digitální bloom obrys

**Kánon tvarů střel**:
Striktní morfologické pravidlo odlišující projektily lovce (výhradně oblé organické tvary jako buchty, knedlíky či kapky) od střel strašidel (výhradně agresivní ostré tvary jako vidle, trny a střepy).
_Avoid_: špičaté střely hráče, oblé projektily nepřátel, nerozlišené siluety střel

**Diskrétní kolébavý krok**:
Čtyřfázový cyklus procedurální papírové animace (Squash and Stretch) s fixním náklonem ±5° a kompresí výšky 0,9×–1,1× vázanou na rychlost běhu, zamezující stroboskopickému kmitání při stovkách entit.
_Avoid_: spojitý plynulý squash, náhodné škálování spritů, plynulá 3D chůze

**Křídový nápřah**:
Folklórní telegraf zóny útoku tvořený kresbou bílou či okrovou křídou s tužkovým šrafováním a postupnou akvarelovou rumělkou, provázený hlubokým přikrčením strašidla a tušovým vykřičníkem.
_Avoid_: laserové kužely, moderní telegraph kruhy, sci-fi výstražné zóny

**Kramářská pečeť bosse**:
Drobný malovaný folklórní erb vznášející se nad hlavou velitelů a bossů, doplněný o zesílenou 4px tušovou konturu a kvašové tečkování pro okamžitou orientaci v chumlu hordy.
_Avoid_: boss šipka, kruh pod bossem, arkádový terč

**Kreslené stavové efekty**:
Vizuální indikátory bojových stavů (kreslené rampouchy u mrazu, stoupající uhlíky se sazemi u ohně, stříkající kapky u zpomalení) zachovávající integritu kvašové kresby bez digitálního celotělového tónování.
_Avoid_: celotělové modrání, digitální tint, RGB shader stavů

**Stupně slitých perníčků**:
Tříúrovňová vizuální hierarchie kořisti v 10% zlaté paletě (drobná perníková hvězdička, mandlový bochánek s polevou a velký zlacený kůň) zajišťující přehlednost po masivním sloučení dropů na bojišti.
_Avoid_: generické XP koule, svítící krystaly, beztvaré hromádky

**Knižní viněta kuráže**:
Dramatické varování před vyčerpáním Kuráže stylizované do zažloutlého knižního okraje s tužkovým šrafováním na rozích, doplněné o komické kapky potu a poplašený dým z fajfky lovce.
_Avoid_: krvavá viněta, červené blikání obrazovky, moderní low-health efekt

**Hospodský figurální kánon**:
Autorský výtvarný standard veškerých bossů a velitelů odvozený z ústřední scény v hospodě U Černého kocoura (Hastrman, Hospodský Bubák a Rusalka). Vyznačuje se vícevrstvou kresbou živých obličejů (bělmo, barevná duhovka, zornička s odleskem, mrkající víčka, huňaté obočí, lesklý baňatý nos s pihami, tváře s bílým leskem a zubatá ústa s jazykem či strništěm), bohatým lidovým oděvem s barevným lemováním, křížkovými záplatami, kšandami a botanickými ozdobami, artikulovanými prsty na rukou i nohou a živou sekundární akcí (odkapávající kapky, kroužky dýmu, vlající pentle) při zachování čistých plochých kvašových polygonů a tušové linky. V bojové aréně strašidla a bossové přirozeně **nesedí na židli či štokrleti a nepijí pivo**, pokud to není výslovně vyžádáno jejich specifickou herní mechanikou – stojí a pohybují se v bojovém postoji a rukama ovládají své zbraně či drápy.
_Avoid_: geometrické placeholder sprity, ploché kruhové hlavy bez mimiky, sezení na židli v aréně, popíjení piva v boji

**Povaha hospodských bossů**:
Trojjediná škála pohádkové mimiky bossů v Hospodském figurálním kánonu, dělící protivníky podle jejich folklórní nátury na **rozšafné a bodré** (šibalské pomrkávání, úsměv od ucha k uchu, bafání z fajfky), **komicky vzteklé** (rudé nadmuté tváře, srostlé huňaté obočí do V, vyceněné tesáky, odfrkávání páry či prskání) a **zlomyslné a potměšilé** (přimhouřené šilhavé oči, křivý škleb s vyplazeným jazykem, potutelné chichotání a zákeřné číhání).
_Avoid_: jednotvárný výraz, vážný hororový patos, bezvýrazné obličeje

**Štokrle**:
Třínohá medově dubová lidová stolička s viditelnými léty dřeva a hranatými čepy; slouží výhradně jako hospodské sezení Hastrmana v úvodní scéně hospody (`LadaCoverScene.tsx`), zatímco v bojové aréně na ní Hastrman ani jiní nepřátelé nesedí.
_Avoid_: židle v bojové aréně, sedící boss v aréně, barová židle

**Mariášový karbaník**:
Pekelné strašidlo v záplatované vestě s mariášovými kartami za pasem, řetězem se zámkem, jednou lidskou nohou v pruhované punčoše a druhou chlupatou kozlí nohou s kopytem, které v bojové aréně útočí přirozeným obouručním výpadem kovaným pekelným trojzubcem (vidlemi).
_Avoid_: kouzelník, gambler, karetní démon, čaroděj

**Kovářská zástěra**:
Těžký ochranný oděv z hrubé vydělané kůže či ovčího kožichu se širokým opaskem, charakteristický pro Skalního Obra a další furiantské hromotluky třímající v rukou dubový kyj.
_Avoid_: brnění, zbroj, šipka nad obrem

**Černá žihadla**:
Dlouhé, ostré, jehlově špičaté černé drápy tvořící přímé prodloužení prstů na dýmových rukou Strachem nacpaného Barbuchy, které při útoku vystřelují z jeho dlaní vpřed jako letící černé ostny; nemají žádnou spojitost s kominickými pomůckami.
_Avoid_: kominická štětka, kouřové šlahouny, stínová chapadla, oddělené levitující trojúhelníky







