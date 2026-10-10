# Bubákov

Česká folklórní rogue-lite hra zasazená do světa Josefa Lady. Hráč se v roli vesnického hrdiny brání vlnám strašidel, sbírá perníčky a rozvíjí rodnou vesnici.

## Boj a vlastnosti

**Kuráž**:
Základní míra životní síly a odolnosti lovce; při jejím vyčerpání výprava končí porážkou.
_Avoid_: HP, životy, zdraví, hitpoints

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
Strašidla posílená Režisérem výpravy o zvýšenou odolnost proti odhození a vyšší rychlost v momentech, kdy je bojiště již zaplněno na maximální kapacitu entit.
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
Pokročilá varianta zbraňového vylepšení navázaná na zvolený folklórní rozmar a herní archetyp výpravy.
_Avoid_: perk, weapon synergy, build upgrade

**Zoufalá kuráž**:
Posílení útočné síly lovce probouzející se při poklesu Kuráže pod 35 %, inspirované odhodláním v hospodské rvačce.
_Avoid_: berserk, rage mode, low hp buff, záchvat zuřivosti


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
Automatické spojování neposbíraných drobných perníčků ležících mimo zorné pole do větších bochánků, zabraňující zahlcení bojiště bez ztráty jejich hodnoty.
_Avoid_: drop fusion, XP merge, komprese dropů, fúze dropů

**Krejcar**:
Trvalá měna získávaná z truhel a odměn po skončení výpravy, sloužící k trvalé výstavbě vesnických budov v hospodě U Černého kocoura.
_Avoid_: mince, zlato, peníze, gold

**Čertův dědeček**:
Toulavý kramář a pekelník s nůší procházející herním světem, který za perníčky nabízí runová vylepšení a zbraně.
_Avoid_: level-up nabídka, obchodník, shopkeeper

**Výprava**:
Jednotlivý herní běh hráče zvolenou krajinou za účelem přežití, záchrany dušiček a poražení místního bosse.
_Avoid_: run, zápas, kolo, match

**Vesnice**:
Místní zázemí a hospoda U Černého kocoura, kde hráč za nastřádané krejcary investuje do trvalých obecních vylepšení (Kovářská výheň, Kaple svaté vlny, Šenkýřův štít).
_Avoid_: hub, lobby, město

**Obecní přirážka**:
Pravidlo sdíleného zdražování obecních vylepšení, kdy každý zakoupený stupeň libovolné budovy ve vsi zvyšuje cenu všech ostatních budov.
_Avoid_: daň, globální inflace, cost multiplier, village tax

**Vrácení krejcarů**:
Bezplatné a úplné vyrovnání všech investic do obecních budov v hospodě, umožňující volné přerozdělení nastřádaných krejcarů.
_Avoid_: respec, reset vylepšení, refund, přerozdělení bodů

