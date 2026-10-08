# Specifikace: Fázované útočné animace, procedurální kinematika bubáků a vizuální ladění

## Problem Statement

V současném soubojovém systému Bubákova se hráč při střetu se strašidly potýká s absencí vizuální čitelnosti nepřátelských útoků. Ačkoliv mají bubáci v datech nadefinované kadence (rychlý 0,6 s, normální 1,2 s, pomalý 1,8 s) a odpovídající drtivé poškození, na herním plátně po celou dobu nápřahu pouze monotónně pochodují na místě bez jakékoliv změny tělesného postoje, napětí či směrového výpadu. Jedinou indikací je abstraktní kruhová čára pod nohama a drobný vykřičník nad hlavou, což znemožňuje intuitivní reakci, včasný úhyb a vnímání hrozby v ladovském folklórním stylu. Dále u bossů (Zlomyslný sněhulák a Bezhlavý rytíř) nejsou jejich specifické bojové fáze (kutálení lavinové koule a planoucí oči useknuté hlavy) propojeny s herním vykreslováním, a na titulní obrazovce jsou animace Strašáka a Čerta nežádoucím způsobem svázány do jednoho stavu.

## Solution

Implementovat ucelený systém fázovaných útočných animací a procedurální kinematiky pro všech 45+ bubáků, řízený jejich kadencí útoku a integrovaný přímo do enginu a vykreslovacího jádra. Vizuální podoba je realizována jako univerzální kinematická transformační vrstva, která aplikuje předúderový třes těla, stlačení a natažení (squash & stretch), směrový náklon k lovci a ladovské inkoustové vizuální efekty (prachové obláčky pod nohama, výstražné čtyřcípé hvězdičky nápřahu, 120° až 160° inkoustové sečné oblouky a rázové vlny v zemi). Zranění lovci dopadne přesně po uplynutí doby nápřahu (0,6 s / 1,2 s / 1,8 s) v souladu s údaji v Bestiáři, následované krátkým vizuálním zotavením. Do vykreslování v aréně budou dopojeny chybějící animace bossů a na titulní obrazovce budou nezávisle odděleny snímky Strašáka a Čerta.

## User Stories

1. Jako lovec chci u pomalých bubáků (Obr, Dřevorubec, Kostlivec s kosou) vidět zřetelné těžké rozkročení a zapření nohou s oblaky zvířeného prachu, abych okamžitě rozpoznal, že se připravuje drtivý úder.
2. Jako lovec chci u pomalých bubáků vidět monumentální nápřah těla a zdvih zbraně vysoko nad hlavu, abych vnímal obrovskou kinetickou sílu chystaného útoku.
3. Jako lovec chci u pomalých bubáků vnímat vysokofrekvenční třes těla a výstražný rudý odlesk na vrcholu nápřahu, abych měl přesné souls-like varování před okamžikem dopadu.
4. Jako lovec chci v čase 1,8 s vidět masivní výpad pomalého bubáka kupředu o 36 px doprovázený 160° širokým inkoustovým obloukem a rázovou vlnou v zemi, abych pocítil váhu a destruktivitu dopadu.
5. Jako lovec chci po dopadu pomalého úderu vidět krátké zotavení a vyprošťování zaseknuté zbraně z hlíny (0,25 s), abych mohl využít zranitelnosti bubáka k bezpečnému protiútoku.
6. Jako lovec chci u normálních bubáků (Čertík, Hastrman, Divoženka, Zbojník) vidět výstražný zdvih a couvnutí v prvních 0,45 s nápřahu, abych věděl, že bubák zkracuje vzdálenost k úderu.
7. Jako lovec chci u normálních bubáků vidět prohnutí těla s třesem a čtyřcípou zlatou hvězdičkou odlesku na hrotu zbraně před úderem, abych mohl načasovat krok stranou.
8. Jako lovec chci v čase 1,2 s vidět pružný výpad normálního bubáka o 24 px s jantarovo-inkoustovým sečným obloukem a prachovými stopami, aby byl útok vizuálně uspokojivý a folklórně stylizovaný.
9. Jako lovec chci u normálních bubáků zažít plynulé odtlumení zpět do rovnováhy (0,20 s), aby přechod mezi sekem a chůzí nebyl trhaný.
10. Jako lovec chci u rychlých bubáků (Rarášek, Plivník, Šotek, Rybniční žabka) vidět bleskové přikrčení a stažení těla jako pružina (0,0–0,4 s), abych vnímal jejich neklidnou a hbitou povahu.
11. Jako lovec chci v čase 0,6 s vidět prudké vystřelení rychlého bubáka vpřed se třemi ostrými sečnými drápy/jiskrami, aby útok působil dravě a bleskově.
12. Jako lovec chci po rychlém výpadu vidět okamžité odpružení zpět do neutrálu (0,15 s), aby rychlí bubáci udržovali svižné tempo potyčky.
13. Jako lovec chci, aby každý bubák při nápřahu směroval své tělo a výpad přesně k mé aktuální pozici, abych viděl, že útok míří skutečně na mě.
14. Jako lovec chci mít možnost včasným úskokem uniknout z dosahu úderu během nápřahu, aby se úder vyprázdnil do země a já neutrpěl zranění.
15. Jako lovec chci, aby silný zásah mé zbraně s odhozem (např. Osikový prut) nebo omráčením (Válečnice) přerušil běžící nápřah bubáka a vrátil ho do neutrálu, abych byl odměněn za agresivní obranu.
16. Jako hráč chci u Obra při nápřahu vidět obouruční zdvih kmene borovice vysoko nad hlavu, aby jeho silueta odpovídala Ladově pohádkové ilustraci.
17. Jako hráč chci u Dřevorubce a Zbojníka vidět napřaženou dvouruční sekeru za krkem a pádný sek dolů, aby jejich útok působil řemeslně těžce a nebezpečně.
18. Jako hráč chci u Kostlivce s kosou vidět nápřah zubaté kosy nad lebku a široké kosení, aby byl útok smrtky jasně identifikovatelný.
19. Jako hráč chci u Čerta a Čertíka vidět napřažené kované vidle s jiskřícími hroty a prudký bod vpřed, aby pekelná nátura strašidla vynikla v akci.
20. Jako hráč chci v boji se Zlomyslným sněhulákem vidět, jak se při výpadu (charge) promění v divoce rotující lavinovou kouli s odlétávajícími ledovými krystaly, aby jeho soubojová mechanika odpovídala jeho popisu.
21. Jako hráč chci v boji s Bezhlavým rytířem vidět, jak se při poklesu Kuráže pod 50 % rozžhnou oči i chochol useknuté hlavy rudým pekelným plamenem, abych jasně poznal nástup zuřivé fáze.
22. Jako návštěvník titulní obrazovky chci kliknout na Strašáka a vyvolat jeho bafnutí ("BAF!"), aniž by se zároveň zmateně trhla póza Čertíka na pravé straně.
23. Jako návštěvník titulní obrazovky chci kliknout na Čertíka a vyvolat jeho dupnutí a bodnutí vidlemi, aniž by se zároveň pohnul Strašák.
24. Jako hráč na mobilním zařízení či slabším počítači chci, aby procedurální kinematika a efekty nezpůsobovaly propady snímkové frekvence a běžely plynule na 60 FPS bez alokací paměti v každém snímku.

## Implementation Decisions

1. **Stavové rozšíření v doménovém modelu entit:**
   Do rozhraní `Enemy` a odpovídající instance se zavedou položky `attackAngle` (radiány směru k lovci zafixované při startu nápřahu) a `recoveryTimer` (odpočet doznění úderu po dopadu). Během `recoveryTimer > 0` bubák nemůže zahájit nový nápřah.
2. **Přesné časování zásahu dle deklarované kadence:**
   Poškození lovci je uděleno přesně v okamžiku, kdy `windupTimer >= attackDelay` (0,6 s pro rychlé, 1,2 s pro normální, 1,8 s pro pomalé), čímž je zachována 100% věrnost hodnotám v Bestiáři.
3. **Univerzální kinematický wrapper namísto přepisování 45 rendererů:**
   Kinematika se realizuje v obalovací vrstvě `drawEnemyRenderer`. Před zavoláním kreslicí funkce těla bubáka se spočítá transformační matice:
   - `lungeX`, `lungeY` podle fáze a úhlu útoku.
   - `leanAngle` náklonu těla k cíli.
   - `squash` a `stretch` faktory.
   - Vysokofrekvenční sinusový třes v apex fázích.
4. **Vrstvení Ladovských vizuálních efektů (VFX):**
   - *Podkladová vrstva (pod postavou)*: obláčky zvířeného prachu a eliptické rázové vlny v zemi (`setupPath`, barvy `#2A170A`, `#FBBF24`).
   - *Základní tělo*: stávající prověřené kreslicí funkce bubáků v `ladaRenderer.ts`.
   - *Překryvná vrstva (přes postavu)*: specifické siluety zbraní pro klíčové archetypy (Obr, Dřevorubec, Zbojník, Kostlivec, Čert), čtyřcípé výstražné hvězdičky odlesku a dynamické inkoustové sečné oblouky (120°–160°).
5. **Dopojení specifických kreslicích větví bossů v aréně:**
   V herním vykreslovacím dispatchi v `App.tsx` se přidá větev pro `this.id === 'snehulak'` s předáním `isCharging` a pro `this.id === 'bezhlavy_rytir'` s předáním `isEnraged`.
6. **Rozdělení stavu snímků na titulní obrazovce:**
   V `BubakovCoverTitle.tsx` se oddělí stav na `bubakFrame` a `certFrame` s nezávislými časovači a obslužnými funkcemi kliknutí. Osiřelý soubor `AnimatedBubak.tsx` se integruje nebo vyčistí.

## Testing Decisions

- **Testování vnějších projevů (Behavioral Black-box Testing):**
  - Netestovat interní souřadnice jednotlivých křivek na plátně, ale výhradně zachování hloubky kontextu (`save/restore` delta = 0), správné přepočty fází podle času a kadence, a spolehlivost soubojového enginu.
- **Testované moduly:**
  - `src/render/ladaRenderer.ts` (testovací skript ověřující bezchybné vykreslení všech 49 bubáků ve všech útočných fázích, náklonech a směrech výpadu).
  - `src/game/engine.ts` (simulace útočného cyklu: zahájení nápřahu, přerušení při odhozu, dopad po 0,6 / 1,2 / 1,8 s, spuštění recovery okna).
  - Typová kontrola celého projektu (`tsc --noEmit`).
- **Předchozí praxe v repozitáři:**
  - Navazuje na existující headless benchmarky (`scripts/benchmark-weapons.ts`) a testovací skripty ověřování stability canvasu.

## Out of Scope

- Předělávání kreseb samotných těl 45 bubáků od nuly (stávající Ladovské ilustrace zůstávají plně zachovány, systém nad nimi staví kinetickou vrstvu).
- Změna základních číselných hodnot poškození či intervalů bubáků (tyto hodnoty byly úspěšně vybalancovány v commitu `b85d447`).
- Změny v systému nákupu v Dědečkově nůši či rozvoje vesnice.

## Further Notes

- Všechny termíny striktně respektují doménový slovník [GLOSSARY.md](file:///c:/Users/kocnaro/.gemini/antigravity/scratch/bubakov/GLOSSARY.md) (*Lovec*, *Bubák*, *Kuráž*, *Kadence útoku*, *Nápřah*, *Dopad*, *Zotavení*).
- Architektonické rozhodnutí je evidováno v [docs/adr/0005-fazovane-utocne-animace-a-kinematika-bubaku.md](file:///c:/Users/kocnaro/.gemini/antigravity/scratch/bubakov/docs/adr/0005-fazovane-utocne-animace-a-kinematika-bubaku.md).
