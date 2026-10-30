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
Dočasná anomálie a trhlina v zemi vyvolaná Režisérem výpravy, ze které vyvěrá neklid; lovec ji musí zapečetit setrváním v jejím kruhu dříve, než z ní vystoupí zuřivý netvor.
_Avoid_: rift, portál, portal, spawner, trhlina

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

**Ukazatel ohrožení lovce**:
Normalizovaný index (0,0 až 1,0) vyhodnocovaný Režisérem výpravy z Kuráže, nedávného zranění, připravenosti arzenálu a hustoty běsů pro dynamické řízení tempa a kořisti.
_Avoid_: vulnerability score, threat index, stress score, V-skóre

**Hejno mrazivých vran**:
Vrcholný skupinový boss 1. úrovně (Denní tání) tvořený kompaktní letovou formací 9 dravých vran se sdíleným ukazatelem Kuráže, vysokou rychlostí náletů (260 px/s) a dynamickým úbytkem těl při postupném zraňování; po porážce celého hejna zanechává malovanou truhlu a pečetí vítězství denní výpravy.
_Avoid_: vrana miniboss, obří vrána, crow swarm boss

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

**Výprava**:
Samostatná hratelná úroveň kampaně s uceleným časovým harmonogramem, vlastním fázováním dne, specifickou havětí a hierarchií bossů (v nabídce tvoří 8 po sobě jdoucích úrovní).
_Avoid_: run, stage, level, zápas, kolo, match

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

**Procedurální kresba kramáře**:
Interaktivní procedurální tušová a kvašová kresba Čertova dědečka s nůší a myškou Rézinkou na 2D plátně v kramářském krámku i dialogových oknech, nahrazující původní těžké Smart SVG komponenty.
_Avoid_: SVG dědeček, DOM postava dědečka, kramářský sprite


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

**Parita herního klienta**:
Architektonické pravidlo zakazující stav, kdy nová strašidla, chování bossů či interakce pamětihodností existují pouze v testovacím simulačním enginu (`engine.ts`), aniž by byla plnohodnotně a paritně zrcadlena v interaktivním herním rozhraní (`App.tsx`).
_Avoid_: duální engine nesoulad, engine-only mob, headless drift


