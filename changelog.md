## 2026-10-22 — Kompletní a kompaktní informační karty lovců

- Každá odemčená karta nyní zobrazuje základní statistiky, skutečnou počáteční zbraň s hodnotami načítanými z registru, celý popis zbraně, pasivní schopnost i zvláštní schopnost včetně číselných účinků a cooldownu.
- Poutník používá stejnou komponentu profilu jako ostatní lovci. Zamčené karty si zachovávají postupné odhalování identity.
- Zmenšen portrét na odemčených kartách, sloučeny duplicitní nápovědy a zavedeno kompaktní zalamování bez vnitřního pevného výškového limitu; dlouhý text zůstává celý čitelný i na úzkých obrazovkách.
- Podrobné okno uvádí stejné základní parametry zbraně přímo z herního registru, aby se popisy a čísla nemusely ručně duplikovat.
- Doplněny základní dosahy/úhly švihů, počet a letové parametry projektilů u šesti počátečních zbraní. Opravena chybná metadata Kropenky: engine skutečně uděluje 22 základního poškození na kapku, nikoli 30; oprava sjednocuje informační kartu i odhad ve zbrojnici s reálným útokem.
- Upřesněny popisy schopností podle aktuální implementace: Pasáčkův následný dusot, Kořenářčino sanctuarium, dosah a panika Ponocného i úplné účinky Farního požehnání a Babiččiny schopnosti.

## 2026-10-22 — Čitelnost informačních karet lovců

- Následná kontrola opravila rozsah CSS selektorů: styly pro responzivní karty jsou nyní na nejvyšší úrovni, takže pravidla pro titulky, progress a mobilní rozložení se aplikují na zamýšlené prvky.

- Upraveny karty výběru lovce: popisy, indicie zbraní/schopností a průběh výzvy se bezpečně zalamují i při úzkém viewportu.
- Statistiky lovce používají pružnou dvousloupcovou mřížku místo čtyř úzkých sloupců; informace o zbrani, pasivu a zvláštní schopnosti už nejsou stlačené do pevně vysokého rolovacího boxu.
- Zlepšena velikost písma, řádkování a rozvržení popisů; na mobilu se zmenší okraje karty a portrét zůstává přiměřený dostupné šířce.
- Opravy se týkají pouze prezentace UI; herní statistiky, schopnosti a postup odemykání zůstávají beze změny.

## 2026-10-22 — Globální hard cap 40 předmětů v aréně

- Všechny produkční cesty vytváření kořisti (App.tsx, GameEngine a rezervoár hejn) nyní procházejí spawnDropWithLimit; při zaplnění už nevznikají neřízené náhradní dropy.
- Přidán kompaktní čekající rezervoár s pevně omezeným počtem bucketů podle typu a účinkových variant. Krejcary a perníčky se agregují se zachováním hodnoty; horké a běžné perníčky zůstávají oddělené a léčivé a těžké kotvicí varianty si uchovávají svá metadata; speciální odměny zachovávají svůj typ.
- Po sebrání nebo sloučení kořisti se volná místa doplňují z čekajícího rezervoáru, vždy nejvýše do 40 živých dropů.
- Slévání v hlavní herní smyčce i v GameEngine zachovává interval 1,5 s; pokud čekají odměny, slučování se pokusí uvolnit místo pod limitem.
- Přidán tests/dropHardCap.test.ts a upraven test rezervoáru hejn pro ověření limitu a zachování hodnot čekajících odměn.

## 2026-10-22 — Sjednocení limitu slučování kořisti na 40

- V `src/game/drops.ts` změněn výchozí limit `MAX_DROPS_LIMIT` z 250 na 40.
- V `src/App.tsx` se slučování spouští při dosažení 40 položek (ne až nad 200) a explicitně používá limit 40.
- Jde o změnu prahu slučování; sama o sobě nezaručuje globální hard cap 40, protože přímé cesty vytváření dropů mimo `SoADropManager` tím nejsou odstraněny.

## 2026-10-22 — Oprava CI testu kontaktního odstrčení

- Aktualizováno očekávání v `tests/gameEngine.test.ts` podle nové délky omráčení 2,5× (základ 0,875 s); odstraněno zastaralé očekávání 0,35 s.
- Oprava testu nemění herní logiku, pouze ověřuje novou dohodnutou hodnotu.

## 2026-10-22 — Prodloužení omráčení po kontaktním odstrčení

- Prodlouženo omráčení bubáků po kontaktním odstrčení lovcem na 2,5násobek: základní délka se mění z 0,35 s na 0,875 s před započtením koeficientu maximální Kuráže. Cooldown protiútoku zůstává 1,2 s.

## 2026-10-22 — Oprava konsolidace dropů bez dočasných alokací

- Opravena konsolidace drobných mincí a perníčků v `SoADropManager`: příchozí drop se při konsolidaci správně spotřebuje.
- Odstraněno dočasné pole pro kompatibilní indexy z herní hot path.
- Doplněny regresní testy konsolidace s nesouvisejícími dropy a hraničními indexy; původní testovací sada zůstala zachována bez duplicitních regresních případů.

## 2026-10-22 — Sjednocení vykreslovací pipeline, atlas strašidel a zero-allocation herní cyklus (ADR 0029)

- **Architektonické sjednocení pipeline (`App.tsx`, `arenaRenderer.ts` & `renderWorldHazards.ts`)**:
  - Eliminována duální vykreslovací pipeline: přes 800 řádků duplikovaného kreslení z `App.tsx` bylo přesunuto do dedikovaného modulu `renderWorldHazards.ts` a `renderArena()`.
  - Celý svět (pozadí, terénní anomálie, Zrádný terén, louže sněhuláků, Bubácká díra, svěcený křídový kruh, Dědeček, společnice a aury zbraní) je nyní konzistentně zapouzdřen do světového průchodu pod transformací kamery `ctx.save() / translate(-camera.x, -camera.y) / restore()`.
- **Eager Atlas Baking řadových strašidel (`bakedBubakAtlas.ts` & `ladaRenderer.ts`)**:
  - Rozšířen offscreen atlas z 3 na všech 12 kanonických řadových strašidel (`rarach`, `mysak`, `bludicka`, `hejkal`, `divozenka`, `certik`, `skeleton`, `vrana`, `zmrzlik`, `vodnicek`, `skodnik`, `topivec`) pro normální i panikařící stavy.
  - V `drawEnemyRenderer` jsou kráčející řadoví mobové blitováni jediným voláním `ctx.drawImage()`, což eliminuje 30–50 procedurálních křivkových příkazů na entitu za snímek při zachování 100% věrnosti ladovské estetiky. Útočné animace a bossové plynule přecházejí na plné procedurální kreslení.
- **Odstranění `shadowBlur` & adaptivní kvašové noční svícení (`storybookLightingRenderer.ts`)**:
  - Plně eliminován drahý `ctx.shadowBlur` z herních smyček (mrazivá aura, perníčky, ukazatele mimo obrazovku a dropy) a nahrazen vrstvenými koncentrickými výplněmi bez GPU flushe.
  - Zavedeny předpečené 128×128 měkké radiální světelné textury (teplé, ohňové, chladné) eliminující per-frame konstrukci `createRadialGradient`.
  - Škálování rozlišení světelného kompozitu adaptováno dle profilu: 0.33× pro Balanced (snížení fillrate o 89 %) a 0.25× pro Performance.
- **Bezpečnost re-entrace SpatialHash & Zero-Allocation queries (`spatialHash.ts` & `engine.ts`)**:
  - Vyřešen kritický hazard přepsání sdíleného bufferu při vnořených dotazech (např. řetězová reakce při smrti nepřítele v průběhu iterace plošného útoku biče nebo svěcené křídy).
  - Implementován prealokovaný zásobník `scratchStack` (hloubka 8), rotující indexy bufferů a metody `withQuery(x, y, r, fn)` a `queryCircleInto(x, y, r, out)`.
- **Bezalokační cyklus pro kosmetické efekty (`cosmeticRingPool.ts`, `engine.ts` & `glyphAtlas.ts`)**:
  - Zaveden `CosmeticRingPool<T>` s pevnou kapacitou a automatickým přepisováním nejstarších záznamů při hromadných AoE zásazích.
  - Plovoucí bojové texty (`DamageText`) získaly pooling, metodu `reset()` a prioritní vykreslování přes `drawGlyphText()` s nulovou alokací písem.
  - V herním cyklu nahrazen `.splice(0, ...)` pro texty i částice posunem prvků v poli na místě a zkrácením délky pole.
- **Zastropování fyzického rozlišení a DPI (`App.tsx`)**:
  - V obsluze `resize()` zaveden strop fyzického bufferu plátna na 1920×1080 (zamezení 4K/Retina alokací přes 8 Mpx) a ošetřeno zbytečné přenastavování rozměrů plátna, které vynucovalo buffer reallocation v prohlížeči.
  - Zajištěno přesné škálování souřadnic kurzoru a dotyku poměrem plátna.

## 2026-10-22 — Odstranění nežádoucích spawnů monster v zorném poli hráče a zátěžový benchmark strašidel

- **Odstranění spawnů uvnitř kamery (`App.tsx` & `RunDirector`)**:
  - Přepojeno spawnování minibossů, midbossů a finálních bossů z pevných radiálních vzdáleností (550–580 px) na dynamickou metodu `RunDirector.getOffscreenPosition(player, ang, engine, 180-200)`, která garantuje umístění vně viditelné kamery i na širokoúhlých a 1440p+ obrazovkách.
  - Událost „Chasník v nouzi“ v 50. sekundě a doprovodná vlna rarášků se nově zhmotňuje bezpečně za hranicí dohledu namísto náhlého zjevení před hráčem.
  - Repozice zatoulaných monster (nad 1350 px od hráče) byla sjednocena pod `RunDirector.getOffscreenPosition()`, čímž se zamezilo náhodné teleportaci bubáků do zorného pole.
  - V `RunDirector.getOffscreenPosition()` byla doplněna kontrola rozměrů canvasu z enginu pro přesné určení zorného pole v nestandardních viewpotech.
  - Doplněna sada testů v `tests/runDirector.test.ts` ověřující, že `getOffscreenPosition()` ve všech 360 stupních i při rozlišení 2560×1440 umisťuje entity striktně mimo obdélník kamery.
- **Zátěžový benchmark strašidel (`tests/enemyFpsBenchmark.test.ts` & `src/game/benchmark.ts`)**:
  - Přidán deterministický zátěžový benchmark a profilace všech 58 kanonických strašidel v izolovaném scénáři (40 entit po 120 snímků) měřící čas simulace i procedurálního ladovského vykreslování s rankingem náročnosti.
  - Zaveden termín *Zátěžový benchmark strašidel* do `GLOSSARY.md`.

## 2026-10-22 — Kruhové hejno mrazivých vran s virtuálním vůdcem

- Přidán samostatný systém až 150 běžných vran řízených jediným virtuálním vůdcem. Střídá přímý průlet arénou a smršťující se oběžnou dráhu; rozložení používá Vogelovu spirálu se zlatým úhlem, pomalou rotaci, sinusové vlnění a mávání křídel.
- Pohyb hejna používá předalokované typed arrays a znovupoužitelné nepřátelské objekty; vrány se navzájem nevyhledávají ani fyzikálně neovlivňují. Přidány kruhové broadphase kontroly pro kontakt hráče, projektily a plošné zásahy.
- Běžné vrány z nového hejna mají 60 % obvyklé bodové hodnoty (−40 %). Původní hejno vran jako miniboss zůstává beze změny; jeho konfiguraci chrání regresní test.
- Přidány testy zlatého úhlu, plánování vln, obou pohybových režimů, broadphase a deaktivace vran bez posouvání poolu.

## 2026-10-22 — Zákaz běžných spawnů čertů a vodníků v první úrovni

- Režisér výpravy filtruje zakázané nepřátele také při výběru elit, při záložním výběru i v taktických formacích; např. myšák/šotek už se nemůže změnit na krvavého raráška a blatouch na kalného hastrmana.
- Staré preferované cíle v archetypech první úrovně byly nahrazeny tematickými nepřáteli předjaří.
- Přidán regresní test skutečného spawnovacího poolu pro všechny fáze i archetypy.

## 2026-10-22 — Čistší bestiář první úrovně

- Odstraněni čerti a vodníci z běžných spawnovacích fondů první úrovně; Vodníček zůstává pouze plánovaným mezibossem.
- Nápověda k bestiáři první úrovně už Vodníčka neuvádí mezi běžnými nepřáteli.
- Přidány regresní testy, které zakazují běžné spawny čertů a vodních bytostí na první úrovni.

## 2026-10-22 — Sjednocení obsahu první úrovně

- Sjednoceny české a anglické názvy i varování minibosse s reálným hejnem mrazivých vran.
- Opraveny podtituly, nápověda k hlavnímu bossovi a popisy průzkumných milníků; finálním bossem je Morana a Vodníček zůstává mezibossem.
- Mrazivý obr byl přidán do soumračného spawnovacího poolu první úrovně, aby mohl přirozeně vstoupit do běžného průběhu výpravy.
- Regresní testy nyní ověřují spawn Mrazivého obra a názvy minibosse v češtině i angličtině.

## 2026-10-22 — Oprava ukazatele FPS, reálné měření prodlev snímků a automatizovaný Playwright benchmark v Chromiu

- **Oprava falešného ukazatele FPS (`FrameProfiler` & `App.tsx`)**:
  - Odstraněna zásadní koncepční chyba, kdy ukazatel počítal `1000 / CPU_work_time` a při záseku hry (kdy kód snímku proběhl rychle, ale prodleva mezi snímky byla stovek ms) falešně ukazoval ~60 FPS.
  - `FrameProfiler` nově měří skutečnou periodu mezi voláními `requestAnimationFrame` (`timestamp - lastFrameTimestamp`), eviduje `frameDelta` a okamžitě reaguje na záseky (> 1,4× očekávané periody nastaví váhu 75 %).
  - Ukazatel v HUDu jasně odděluje reálnou snímkovou frekvenci od čisté práce CPU: `${fps} FPS (CPU: ${timings.total} ms)`.
  - Doplněna metoda `getMetricsSummary()` s bezalokačními ring buffery (`Float32Array(1200)`) pro výpočet $p50$, $p95$, minimálního FPS, průměrného FPS a počtu zahozených/zaseknutých snímků bez zatížení Garbage Collectoru.
  - Pokryto sadou jednotkových a regresních testů v `tests/frameProfiler.test.ts`.
- **Automatizovaný zátěžový benchmark v reálném Chromiu (`npm run test:perf`)**:
  - Zavedena end-to-end výkonnostní pipeline přes Playwright (`playwright.config.ts`, `e2e/arenaBenchmark.spec.ts`) spouštějící moderní headless Chromium (`--headless=new`, `--enable-gpu`).
  - Umožňuje bez nutnosti lidského hraní změřit skutečnou propustnost 2D Canvasu, kvašového nočního svícení a simulace ve vyváženém i grafickém profilu (`balanced` a `fidelity`).
  - V aréně autonomní bot manévruje, střílí ze zbraní a čelí plné Půlnoční vlně monster, přičemž test reportuje detailní metriky doručení snímků a vytížení jednotlivých fází (simulace, vykreslení entit, světla).
- **Konfigurace a skripty**:
  - Do `package.json` přidán skript `"test:perf": "playwright test"`.
  - V `vite.config.ts` vyloučena složka `e2e/` z běhu jednotkových testů Vitest.
  - Do `.gitignore` přidány složky `test-results/` a `playwright-report/`.

## 2026-10-21 — Dokončení AI vrány a cílení Mrazivé jezinky

- Vrána nyní vyhledává poblíž ležící mince a malé jídlo, přiletí k nim, přistane, chvíli zobá a kořist sebere.
- Při sbírání kořisti se přepne na pozemní kresbu; po dokončení znovu vzlétne a chvíli další kořist nehledá.
- Společné pravidlo přímého cílení: Mrazivou jezinku lze přímo zvolit jen do vzdálenosti 100 px od lovce; naváděné střely si neudrží vzdálený cíl po překročení limitu.
- Zásahová kolize a plošné poškození jezinky zůstávají beze změny.
- Přidány testy pro limit cílení, zachovanou zranitelnost a sbírání kořisti vránou.

## 2026-10-21 — Mrazivá jezinka: poloviditelnost

- Mrazivá jezinka se vykresluje v 60% velikosti (o 40 % menší) a s nižší průhledností.
- Přímé automatické cílení na ni funguje pouze do vzdálenosti 100 px od lovce; zásahová kolize a plošné poškození zůstávají zachované.

## 2026-10-21 — Opravy patch výpravy předjaří

- Doplněny české a anglické překlady do bestiáře pro Mrazivou jezinku, Mrazivého obra a Zákeřného tajícího sněhuláka.
- Obnoven meziboss Vodníček na první úrovni: testy úrovně 0 očekávají plnou konfiguraci bossů.

## 2026-10-21 — Noví nepřátelé prvního stage

- Přidána Mrazivá jezinka, Mrazivý obr a Zákeřný tající sněhulák včetně kreslení.
- Rozšířeny spawn pooly první úrovně a seznam klíčových nepřátel.
- Přidána samostatná pozemní kresba vrány pro plánovaný loot stav.
- Přepnutí vrány do pozemního stavu a pravidlo 100 PC pro cílení jezinky ještě nejsou napojeny na herní AI/cílení.
- Opraveno uzavření metody vykreslování, které blokovalo TypeScript parsování.

## 2026-10-21 — Kanonizace zbraňových výzev, obnova JSX komponent a robustní migrace (ADR 0026)

- **Kompletní de-transpilace a obnova 7 React komponent**:
  - `KrejcarIcon.tsx`, `CzechBuchtaIcon.tsx`, `ResetProgressModal.tsx`, `ArsenalModal.tsx`, `HunterUnlockModal.tsx`, `BestiaryModal.tsx` a `WeaponUnlockModal.tsx` byly očištěny od poškozených transpilačních zbytků (`import_jsx_runtime`, `import_react`) a přepsány do čistého, plně typovaného React 19 JSX/TSX.
- **Kanonizace zbraňových výzev v `weaponUnlocks.ts` a Proxy ochrana**:
  - Všechny klíče v `RAW_WEAPON_UNLOCKS` byly sjednoceny na kanonický český `snake_case` dle ADR 0021 (`kovarske_vidle`, `kovana_halapartna`, `dreveny_cep`, `devatero_kviti`, `snehova_koule`, `kynuty_kolac`, `horky_brambor`, `vceli_roj`, `svecena_kropenka`, `cesnekova_topinka`, `kysela_okurka`).
  - Doplněny plnohodnotné folklórní profily pro 3 dědečkovy zbraně (`bylinkova_fajfka`, `formansky_bic`, `splaseny_houser`) – všech 18 kanonických zbraní ze zbrojnice má nyní kompletní záznam.
  - Moduly `weapons.ts` i `weaponUnlocks.ts` využívají transparentní nemutující `Proxy`. Funkce `Object.keys()` vrací striktně 18 kanonických klíčů bez znečištění UI a eliminovaly se běhové mutace exportovaných objektů.
- **Bezpečná migrace LocalStorage (`src/game/migration.ts`)**:
  - Opravena migrace `weaponKillCounts` tak, aby zachovávala jak historické číselné hodnoty, tak vnořené kill breakdown objekty (`{ [enemyId]: count }`) a bezpečně mapovala staré klíče na kanonická ID.
  - Výchozí nastavení odemčených zbraní v `App.tsx` převedeno na kanonické klíče (`povidlove_buchty`, `osikovy_prut`, `hromnicka`).
- **Harmonizace textů lovců a bestiáře v lokalizacích**:
  - Texty pro Pasáčka a Kostelníka v `cs.ts` a `en.ts` byly sladěny se skutečnou herní výbavou (Pasáček: Povidlové buchty a Dusot stáda; Kostelník: Svěcená kropenka a Farní požehnání).
  - V českém bestiáři opraven název bosse na kanonické `Pekelný Čert` (v souladu s GLOSSARY a `enemies.ts`).
- **Architektonický záznam ADR 0026 & testy**:
  - Zaznamenáno v `docs/adr/0026-kanonizace-zbranovych-vyzev-a-cistota-kodu.md` a `docs/adr/README.md`.
  - Vytvořena nová testovací sada `tests/weaponUnlocksAndCleanliness.test.ts` (8 nových testů, celkem 431 testů prochází 100% zeleně).

## 2026-10-21 — Autentické lidové ilustrace Josefa Lady: náhrada emoji, plynulé GPU animace a statický atlas pro 2D Canvas

- **Kompletní náhrada Unicode emoji za lidové ilustrace Josefa Lady napříč React UI i 2D Canvasem**:
  - **React UI & Modaly**:
    - Všechny dosud statické dedikované ikony (`KrvaveJelitoIcon`, `HunterConsumableIcon`, `OpravdovaKurazIcon`, `OsikovyPrutIcon`, `PekelnyPokladIcon`, `PernikoveSrdceIcon`, `PomerancIcon`, `ValecniceIcon`) byly doplněny o Two-Layer Motion Design (hlavní pohupování/kymácení těla + mikroanimace jako stoupající pára `ladaSteam`, záblesky jisker `ladaGlint`, pěnivý příboj a víření prachu).
    - V `LadaCustomIcons.tsx` vytvořeno 12 nových animovaných ikon (`LadaBookIcon`, `LadaChestIcon`, `LadaSeedlingIcon`, `LadaAutumnLeafIcon`, `LadaTombstoneIcon`, `LadaDragonIcon`, `LadaCrowIcon`, `LadaLionIcon`, `LadaMoonIcon`, `LadaSleepIcon`, `LadaPauseIcon`, `LadaStatsLedgerIcon`) a rozšířena směrová hospodská šipka.
    - `GameIcon.tsx` nově mapuje jak kanonická česká ID (včetně všech dědečkových dobrot a zbraní), tak surové emoji znaky na kreslené animované Lada SVG komponenty bez lagů (čisté CSS klíčové snímky `transform` a `opacity`).
    - V `App.tsx` (`openChestSequence`, výstražné lišty) a `ControlsModal.tsx` nahrazeny surové řetězce a emoji za kanonické ikony `<GameIcon>`.
  - **2D Canvas (`glyphAtlas.ts`, `DamageText`, portréty a aréna)**:
    - **Striktní pravidlo**: Canvasové ikony nejsou animované a zachovávají 100% bezalokační snímkovou smyčku.
    - **Oprava WordStampCache**: Vyřešena kritická chyba, kdy `WordStampCache.getOrCreate` volalo surový `fillText`, čímž se bojové texty s emoji rasterizovaly přes moderní systémový font OS. Zavedena graphemová segmentace přes `splitTextAndEmojis` (`Intl.Segmenter` s fallbackem). Textové úseky se renderují Eczar serifem, zatímco všechny emoji tokeny se do bitmapy razítka kreslí jako statické miniatury Josefa Lady (`drawStaticMiniIcon`).
    - **Rozšíření atlasu o 40+ lidových symbolů**: Do `SUPPORTED_CANVAS_EMOJIS` a `drawStaticMiniIcon` doplněny miniatury pro všechny bojové a herní stavy: mlýnské kolo `⚙`, zkřížené meče `⚔`, dýka `🗡`, ledová kra `🧊`, chrápání `💤`, vidle `🔱`, kaplička `⛪`, slunce `☀`, nůše `🧺`, klas pšenice `🌾`, husí brk `✒`, náhrobek `🪦`, kapka `💧`, vodníkova žába `🐸`, řetězy `⛓`, zub `🦷`, ruksak `🎒`, sekyra `🪓`, terč `🎯`, rohlík `🥐`, dárek `🎁`, džbán `🏺`, holubice `🕊`, povidla/med `🍯`, křída `🖍`, nota `♫`/`🎵`/`🎶`, polnice/trouba `🔊`/`📯`, kladivo `🔨`, smírčí kámen `🗿`, sazenička `🌱`, podzimní listí `🍂`/`🍁`, vrána `🐦‍⬛`, český lev `🦁`, půlměsíc `🌙`, knoflík `🔘`, hvězda `✦`, karetní barvy `♥`/`♦`/`♠`/`♣`, vánice `🌨`, hora `🏔`, boží muka `✝`, výstraha `⚠`/`🚨`, čtyřlístek `🍀`, kýta `🍖` a otevřený zámek `🔓`.
    - Ve `src/render/ladaRenderer.ts` nahrazeny přímé `fillText` za `drawGlyphText` a vyčištěny texty bublin.
- **Testovací pokrytí & integrita projektu**:
  - V `tests/glyphAtlas.test.ts` přidány testy pro graphemovou segmentaci, izolaci ZWJ sekvencí (`🐦‍⬛`), ověření všech 70+ canvasových emoji a verifikaci, že `WordStampCache` nikdy nevolá `fillText` na emoji tokeny.
  - Všechny kontroly `npm run check` (TypeScript, ESLint, 423 unit testů ve 40 sadách i Vite production build) prošly 100% čistě bez regresí.

## 2026-10-21 — Radikální optimalizace výkonu: eliminace 60FPS skrytých průchodů, Frame-Level kešování a Adaptivní Governor

- **Eliminace skrytých 60FPS průchodů polem `engine.enemies`**:
  - `getFrostAuraHealingMultiplier`: Hodnota mrazivé aury se nyní prostorově přepočítává (`enemySpatialHashRef.current.queryCircle(player.x, player.y, FROSTLING_AURA_RADIUS)`) pouze v intervalu 0,25 s a ukládá přímo do hráče (`player._cachedFrostHealMult`). Všechna kontinuální i okamžitá léčení (kostel v úrovni 0, Babiččina kamna, Maska medvěda, dým z fajfky, bylinková zahrádka, pasivka Kořenářky, ananas a nůše) využívají tuto předpočítanou hodnotu bez celoplošných průchodů.
  - Plošné ultimátky lovců (Poutník, Kostelník, Ponocný), scénické schopnosti (Pasáčkův dusot beranů, Kořenářčino bylinné sanctuarium, Babiččino vlídné slovo a pohoštění) i interakce Březnového tání (zvonice, pivní soudek, zjevení světce u kapličky, náhon mlýna, orba na poli, pivní louže, dřevěná káča) byly přesměrovány na bezalokační dotazy `queryCircleInto(..., terrainSpatialResultsRef.current)`.
- **Frame-Level Caching & eliminace duplicit**:
  - Výpočet `getCurrentDayPhase(engine.gameTime)` a `getPetrolejkaRadius(...)` probíhá jednou za snímek na jeho začátku; hodnoty se ukládají do `engine.currentPhase` a `engine.petrolejkaLight.radius` a jsou přímo čteny v `player.draw(ctx)` i renderovací smyčce.
  - Časování vznášení bludiček (`will_o_wisp`) v `DecorItem.draw` nahrazeno `time * 3.33` namísto volání `performance.now() / 300`.
  - Zbraně `Hromnička` a `Válečnice` se kešují do přímých referencí `player._hromnickaWeapon` a `player._valecniceWeapon` při změně arzenálu namísto opakovaného vyhledávání přes `.find()` a `.some()` v každém snímku.
- **Ořezání geometrie v `SmokePuff` a brána pro `combatVfxEnabled`**:
  - Pro plošné zóny `fajfka` a `plum-scent` se vůbec nealokují a neanimují drobečky pečiva (`crumbs`) ani tečky (`poofDots`), u nichž se navíc v `SmokePuff.draw` přeskočí celý cyklus, jakmile `progress >= 0.625`.
  - Všechna volání generování částic v `App.tsx` zapojena na centrální pomocnou metodu `emitParticle` respektující stav `combatVfxEnabled` a dynamický strop částic.
- **Explicitní `CombatTextCategory` & rychlá ochrana `parseInt`**:
  - Zavedena tovární funkce `pushDamageText`, která kontroluje viditelnost kategorie před alokací `new DamageText`.
  - `parseInt` v `DamageText` spouštěn pouze tehdy, když text začíná číslicí (`charCodeAt(0) >= 48 && charCodeAt(0) <= 57`).
- **Automatická adaptivní degradace kvality (Adaptive Governor)**:
  - Měření metriky `combatTextsMs` v reálném čase.
  - Stupeň 1 (`smoothedMs > 18 ms` po 2 s): Omezení dočasných světel zbraní a snížení stropu částic z 300 na 100.
  - Stupeň 2 (`smoothedMs > 22 ms` nebo `combatTextsMs > 2 ms`): Automatické přepnutí plovoucích textů na taktický režim.
  - Stupeň 3 (`smoothedMs > 26 ms`): Zastropování `directorRef.current.maxLivingEnemies` na 45.
  - Automatické plynulé zotavení po 3 sekundách pod 16 ms.
- **Bezalokační správa polí**:
  - Odstraněn řetězec `.filter().map().sort().slice(0, 8)` u Pivního tácku nahrazením přímým dotazem do SpatialHash.
  - Reference `livingEnemiesRef`, `pendingMilestonesRef` a `grandfatherPurchaseIdsRef` modifikovány in-place (`.length = 0`, `.push()`, `.shift()`).
- **Testovací pokrytí**:
  - Přidán nový testovací soubor `tests/performanceGovernorAndPruning.test.ts` (6 nových testů, celkem 420 testů ve 40 sadách – vše 100% zelené).

## 2026-10-21 — Bezpečná konsolidace a sloučení větví do hlavní větve (main)

- **Konsolidace větví a bezpečnostní zálohy**:
  - Vytvořeny samostatné záložní větve `backup/main-20261021`, `backup/feat-arena-rendering-pipeline`, `backup/feat-dynamic-lighting` a `backup/feat-unify-mechanics`.
  - Do hlavní větve `main` bylo krok za krokem integrováno všech 5 jedinečných vylepšení z větve `feat/arena-rendering-pipeline` (ADR 0025 a reaktivní obtížnost Dvojčete minibosse, Smart SVG animace s procedurální kinematikou, uvolňování GPU VRAM a bezalokační restart, UI/UX modernizace, hotkeys a A11y přístupnost).
  - Historické prototypové větve `feat/dynamic-lighting` a `feat/unify-mechanics` byly zkontrolovány a ponechány v záloze – veškerá jejich funkcionalita je již stabilně zakomponována v kánonu `main`.
- **Kompletní audit a verifikace kvality**:
  - Repozitář plně prochází všemi kontrolami `npm run check` (414 testů ve 39 sadách, TypeScript bez chyb, ESLint 0 varování a úspěšný produkční build).

## 2026-10-20 — Smart detailní SVG JavaScript animace (Babička a Barunka, Bezhlavý rytíř, Sněhulák, Tulák, Kostelník)

- **Pět nových detailních SVG vektorových postav s procedurální JavaScriptovou kinematikou**:
  - **Babička a Barunka (`SmartBabickaBarunkaSvg.tsx`)**: Babička v bílém vyšívaném šátku s modrými kvítky, teplém vlněném plédu s třásněmi, cihlovém kabátku a modré kanafaskové zástěře s velikou kapsou (čerstvý pecen chleba, červeno-bílý ubrousek, bylinky) a holí. Doprovází ji Barunka se zapleteným copem, červenou mašlí, naškrobenou bílou zástěrkou a pestrou kyticí lučního kvítí. Speciální akce *„Laskavý zázrak“* se zářícím chlebem a poletujícími okvětními lístky.
  - **Bezhlavý rytíř (`SmartBezhlavyRytirSvg.tsx`)**: Plátová zbroj s drátěnou košilí, zlaté ostruhy s ozubenými hvězdicemi, roztrhaný rudý plášť a bílá bojová varkočka se slavným **červeným českým dvouocasým lvem**. Useknutý krvavý krk s kapající krví, v pravé ruce těžký meč a v levé ruce nese svou **vlastní useknutou hlavu s přilbicí, rudým chocholem a planoucím hněvem v očích**.
  - **Sněhulák s koštětem (`SmartSnehulakSvg.tsx`)**: Mračící se dvounohý sněhulák v plíživém kroku s březovým koštětem pevně v dlaních, otlučeným zelenavým hrncem se sněhem a jehličím, pruhovanou vlněnou šálou s třásněmi, uhlíkovými knoflíky a mrkvovým nosem. Speciální akce *„Vánice s koštětem“* s poletujícími vločkami.
  - **Tulák (`SmartTulakSvg.tsx`)**: Bělovousý rozesmátý poutník v záplatovaném zeleném kabátě s ranečkem přes rameno, čutorou u pasu, provazem místo opasku, ovázanými lýtky a mohutnou sukovitou dřevěnou holí (sukovicí). Speciální akce *„Radostný poskok & sukovice“* s hudebními tóny a smíchem.
  - **Kostelník (`SmartKostelnikSvg.tsx`)**: Důstojný kostelník v tmavozeleném církevním svrchníku, hnědé plstěné fedoře, vestě se **zlatým křížem na prsou**, v jedné ruce nese těžký mosazný kotlík se svěcenou vodou (kropenku) a v druhé máchá kropáčem (aspergillem) stříkajícím kapky svěcené vody.
- **Smart interaktivita & audio**:
  - Reaktivní sledování kurzoru myši/dotyku (oči, mrkev, useknutá hlava i kropáč míří za kurzorem).
  - Volič stavů animace (*Klid / Idle*, *Krok & chůze*, *Zvláštní akce*, *Reakce*), posuvník rychlosti a volič pozadí (*Papír*, *Noc*, *Sníh*, *Mřížka*).
  - Tlačítka pro okamžité zkopírování SVG kódu do schránky i stažení čistého `.svg` souboru.
  - Zvukové efekty propojené s herním zvukovým syntezátorem `sound`.
- **Integrace a samostatná aplikace**:
  - Nová záložka `✨ Smart SVG` v herním modalu animací [`AnimationTesterModal.tsx`](file:///c:/Users/kocnaro/.gemini/antigravity/scratch/bubakov/src/components/AnimationTesterModal.tsx).
  - Samostatná offline HTML webová aplikace v [`public/smart-characters.html`](file:///c:/Users/kocnaro/.gemini/antigravity/scratch/bubakov/public/smart-characters.html) s čistým JavaScriptem a Web Audio.
  - Nová sada testů v `tests/smartSvgAnimations.test.ts`.

## 2026-10-20 — Oprava poklesu výkonu při restartu bez znovunačtení stránky (F5)

- **Uvolňování paměti GPU a canvasových textur (`ChunkBitmapCache`, `WordStampCache`)**:
  - `ChunkBitmapCache.dispose()`: Zavedeno explicitní nulování rozměrů offscreen canvasů (`width = 0; height = 0`) a uvolnění 2D kontextů při každém restartu výpravy i při přechodu do hospody. Tím je okamžitě uvolněna GPU VRAM (30–50 MB na běh) v paměti grafického procesu prohlížeče a zabráněno GPU thrashingu a pádům kontextu po několika po sobě jdoucích výpravách.
  - `WordStampCache`: Vyčištění dynamických textur při restartu přes `resetGlobalGlyphAtlas()` a nahrazení dočasných canvasů pro měření textu sdíleným singleton kontextem `getMeasureContext()`.
- **Eliminace duchů časovačů (Ghost Timers) a intervalů**:
  - `victoryTimeoutRef`: 3,5s časovač vítězství `triggerLevelVictory` byl spoután s referencí a je při restartu okamžitě zrušen (`clearTimeout`). Odstraněn bug, kdy rychlý restart po vítězství vedl k nečekanému přepnutí rozehrané nové hry do obrazovky rekapitulace.
  - `showUnlockNotice` & `unlockNoticeTimeoutRef`: Sjednoceny všechny plovoucí časovače oznámení a při restartu se spolehlivě ruší spolu s intervaly a časovači losování truhly (`slotSoundIntervalRef`, `slotTimersRef`).
- **Nulování stavů a bezalokační pročištění v herní smyčce**:
  - Při `startGame` se na místě nulují fronta milníků zbraní `pendingMilestonesRef`, buffery prostorového indexu `primarySpatialResultsRef` a `secondarySpatialResultsRef` (`length = 0`) i stav virtuálního dotykového joysticku (`touchMoveRef`).
  - Vyčištění mrtvých combat textů na místě pomocí `compactInPlace(engine.texts, (txt) => txt.life > 0)`.
- **Bezalokační hot path v hlavní smyčce (Zero-Allocation Loop)**:
  - Zavedeny perzistentní refy `reusableCameraViewportRef`, `reusableRenderOptionsRef` a `reusableDirectorAdapterRef`, které nahrazují vytváření nových objektů a uzávěrů (`spawnMonster`, `spawnAmbushRing` atd.) 60× za sekundu. Ušetřeno ~25 000 krátkodobých objektů za minutu, což zásadně snižuje frekvenci a délku záseků způsobených Garbage Collectorem (GC pauses).
- **Testovací pokrytí**:
  - Doplněna nová sada integračních a regresních testů v `tests/restartPerformance.test.ts`.

## 2026-10-20 — UI/UX modernizace, přístupnost (A11y), klávesová ergonomie a pročištění stylů

- **Pročištění CSS a odstranění 1 984 řádků duplicit (`src/index.css`)**:
  - Z `src/index.css` byla odstraněna masivní redundantní sekce stylů (bývalé řádky 2870–4814) vzniklá dřívějším sloučením větví, čímž se velikost souboru snížila ze 102 kB (4 834 řádků) na 62 kB (2 937 řádků).
  - Zavedeny sémantické tokeny v `:root` pro typografii (`--font-display`, `--font-ui`), focus obrysy (`--focus-ring`) a standardní dotykové cíle (`--touch-target-min`).
- **Klávesová ergonomie a hotkeys v boji i nákupu**:
  - **Milníky zbraní (`WeaponMilestoneModal.tsx`)**: Volba milníků uprostřed bitvy podporuje bleskový výběr klávesami `1` a `2` včetně jasných vizuálních odznaků `[1]` a `[2]`.
  - **Čertův dědeček (`GrandfatherShop.tsx`)**: Nákup položek z nůše podporuje klávesy `1`–`4`, přelosování nabídky klávesu `R` a opuštění krámku klávesu `Esc` s odpovídajícími štítky v uživatelském rozhraní.
  - **Univerzální zavírání dialogů**: Všechny modály v `AppModals.tsx` (Bestiář, Zbrojnice, Ovládání, Nastavení, Kronika) lze spolehlivě zavírat stiskem klávesy `Escape` i kliknutím na ztmavené pozadí.
- **Přístupnost (A11y, WCAG AA) a typografická čitelnost**:
  - Zavedena globální podpora `:focus-visible` s kontrastním obrysem pro klávesovou navigaci (Tab) napříč všemi interaktivními prvky, kartami výprav a volbami postav.
  - Zavedena tabulární typografie (`font-variant-numeric: tabular-nums`) na časomíru HUDu, počítadlo perníčků, krejcarů a statistické ukazatele, která brání vizuálnímu poskakování čísel při změnách hodnot.
  - Opraven kontrast výchozího odznaku dynamické obtížnosti 3.00× (*Běžný nepokoj*) – tmavý inkoustový text dosahuje kontrastního poměru 6.59:1 (plně vyhovuje WCAG AA).
  - Tlačítko pauzy v HUDu zvětšeno na 44×44 px pro spolehlivé dotykové ovládání na mobilních zařízeních a doplněna podpora `prefers-reduced-motion`.
- **Herní kronika a návod k ovládání**:
  - Aktualizována herní kronika `src/components/KronikaChanges.tsx` a rozšířen průvodce ovládáním `src/components/ControlsModal.tsx` o nové klávesové zkratky a ergonomické tipy.


## 2026-10-20 — Odpoutání Dvojčete minibosse od voliče obtížnosti a reaktivní dynamická obtížnost

- **Odpoutání Dvojčete minibosse od voliče Dynamické obtížnosti**:
  - Odstraněna podmínka `dynamicDifficulty >= 4.5`. Dvojče minibosse se nově může objevit na všech běžných stupních (od 2.50× *Šramot za humny* výše), zatímco na 2.00× (*Poklid za pecí*) zůstává trestání úspěchu vypnuto v souladu s jeho herním slibem.
  - Zlevněn rejdový rozpočet pro vyvolání Dvojčete o 40 % – nově stojí pouze 18 bodů (původně 30).
  - Taktická reakce na hordový arzenál (`isHordeClearingArsenal`): Režisér výpravy nasazuje Dvojče přednostně tehdy, když lovec disponuje hordovými zbraněmi (aury, celokruhové seky, plošné a průrazné projektily tvořící ≥ 50 % arzenálu nebo ≥ 2 zbraně), jako přímý taktický protitah na buildy tavící běžné roje.
  - Povolena koexistence s ostatními aktivními bossy (nečekané posílení boje), zaveden pojistný cooldown 60 sekund po vyvolání a garantovaný drop Malované truhly za jeho porážku.
- **Zvýšení reaktivity Režiséra výpravy na úspěch a selhání**:
  - **Okamžitá panická brzda (Panic Brake)**: Při skokové ztrátě Kuráže (> 25 % maximální Kuráže za 1,5 s nebo poklesu pod 30 %) Režisér srazí multiplikátor tlaku na 0,75×, odpustí 10 bodů z naakumulovaného rozpočtu, prodlouží fázi Oddychu na 5,0 s a minimálně 50 % nově povolaných bubáků dostane záchranný stav *Vyčerpaný bubák* (potácení, -50 % rychlost i útok).
  - **Asymetrické vyhlazování tlaku**: Zmírnění tlaku v tísni reaguje během 1–2 sekund, zatímco eskalace tlaku při dominanci nabíhá plynule 5–8 sekund (místo původních desítek sekund).
  - **Rychlá detekce dominance**: Do výpočtu indexu dominance byla začleněna metrika krátkodobé rychlosti eliminace nepřátel (`killVelocity` za poslední 3 sekundy) pro okamžitou odezvu na buildové skoky lovce.
- **Kánon a architektura**:
  - Aktualizována definice pojmu **Dvojče minibosse** v `GLOSSARY.md`.
  - Sepsán a schválen architektonický záznam `docs/adr/0025-odpoutani-dvojcete-minibosse-a-reaktivni-obtiznost.md`.
  - Doplněna komplexní sada jednotkových testů v `tests/runDirector.test.ts`.

## 2026-10-20 — Výkonnostní optimalizace arény: 60 FPS zátěžový benchmark, rozpočty entit, Ghost rezervoár a jednotná pipeline

- **Deterministický zátěžový benchmark (`runDeterministicArenaStressBenchmark`)**:
  - Do `src/game/benchmark.ts` a `tests/arenaStressBenchmark.test.ts` přidán bezalokační syntetický benchmark ověřující stabilitu 60 FPS pro profily `performance`, `balanced` a `fidelity`.
  - Měření potvrzuje $p50$ a $p95$ časy snímku hluboko pod cílovou hranicí 16,7 ms při plné zátěži desítek nepřátel, střel a částic.
- **Jednotná renderovací pipeline a izolovaný Y-buffer (`ArenaRenderer`)**:
  - Vytvořeny modulární renderery pro jednotlivé vrstvy arény: `renderDrops.ts`, `renderParticles.ts`, `renderProjectiles.ts` a `renderTelegraphs.ts` s frustum cullingem.
  - Třída `ArenaRenderer` zapouzdřuje instance scratch polí (`Float64Array`, `Int32Array`) pro hloubkové řazení (Y-sorting) bez mezialokací a bez sdílení mezi více plátny.
- **Škrcení náročných prostorových dotazů a dirty-checking v HUDu**:
  - Hromnička, Svatý kruh a Saze škrceny na 10 Hz s časovou akumulací; kontaktní odezva a pohyb zůstávají na plných 60 Hz.
  - Naváděné střely kešují cíl a dotazují strom nejdříve po 0,2 s nebo při zániku cíle.
  - Synchronizace herního stavu do React HUDu v profilu `performance` snížena na interval 0,25 s a opatřena dirty-check porovnáváním klíčových hodnot, což eliminuje zbytečné re-rendery komponent.
- **Rozpočty částic a Ghost rezervoár dropů (`SwarmDropReservoir`)**:
  - Zaveden centrální správce částic `tryEmitParticle` s přísnými stropy podle profilu (60 pro performance, 120 pro balanced, 250 pro fidelity).
  - Přebytečné dropy z hejn se kumulují v `SwarmDropReservoir` a kondenzují do hodnotnějších svazků při exaktním 100% zachování nominální hodnoty perníčků, mincí a zkušeností (`tests/swarmDropReservoir.test.ts`).
  - Strop živých nepřátel v profilu `performance` byl snížen na 35 a přebytek rozpočtu hrozeb je Režisérem bezpečně konvertován do elitních a příznakových monster.
- **Úsporný profil obrazu (0,75× interní rozlišení a geometrie)**:
  - V profilu `performance` zavedeno interní škálování canvasu faktorem 0,75× s automatickou korekcí přepočtu souřadnic myši a dotyku (`tests/canvasGeometry.test.ts`).
  - Vypnuty náročné okludery a reliéfní mapy.
- **Texty, portréty a pilotní sprite baking**:
  - `GlyphAtlas` rozšířen o `WordStampCache` pro rychlé otisky frekventovaných slov (KRIT!, MINUL!, ODRAZ!) bez alokace řetězců.
  - Zamčené portréty lovců se staticky předrenderují do offscreen mezipaměti.
  - Vytvořen pilotní atlas pečených spritů `BakedBubakAtlas` pro raracha, myšáka a bludičku (`tests/bakedBubakAtlas.test.ts`).
- **Dokončení plánu**:
  - Všechny sekce a ověřovací brány v `docs/plans/arena-performance-implementation-plan.md` byly kompletně implementovány, otestovány (37 testových sad, 390 testů) a zaškrtnuty.


## 2026-10-16 — Optimalizace kvašového svícení, eliminace Gaussian blurů v Canvas 2D a zrychlení renderovací smyčky

- **Optimalizace kvašového svícení (`storybookLightingRenderer.ts`)**:
  - Světla bez překážek (`nearbyOccluders.length === 0`) se vykreslují přímo do polovičního bufferu `lCtx` bez zbytečného alokování a kreslení do 1.0× pomocné mezipaměti.
  - Pomocný stínový buffer `singleLightCanvas` byl zmenšen faktorem `LIGHT_DOWNSCALE_FACTOR = 0.5`, což ušetřilo 75 % nákladů na fillrate a rasterizaci stínů.
  - Noční Bloom (Pass 4) byl nahrazen pre-renderovaným offscreen sprite bufferem `getBloomSprite()`, což eliminuje per-frame `ctx.createRadialGradient` a `screen` compositing pro každé světlo.
  - Celoobrazovková viněta strachu (Pass 5) je nově kešována a regenerována pouze při změně rozlišení okna.
- **Odstranění neukončených `ctx.shadowBlur` napříč `ladaRenderer.ts`**:
  - Odstraněny masivní 20–24px Gaussian blury obalující celé postavy (Hejkal, Obr, Klekánice, Čert, Bezhlavý rytíř, Mlynář, Drak, Hastrman, Bílá paní, Nocní můra, Bubák, Mrazový skřítek, Dušička, Bludička) i projektily (ohnivé a mrazivé koule, pekelné jiskry).
  - Nahrazeno čistou ladovskou technikou vrstvených tušových kontur a gradientních kvašových výplní.
  - Odstraněno nákladné volání `Date.now()` z animačních smyček monster ve prospěch normalizované fáze útoku.
- **Optimalizace volání v herní smyčce (`App.tsx` & `engine.ts`)**:
  - Mimobrazovkoví stínoví nepřátelé (`category === 'shadows'`) přeskočí raycasty a occludery díky přesunu kontroly pod ořezávací guard `distToPlayer > 850`.
  - Vyhodnocování `isPositionIlluminated` pro stínové nepřátele na obrazovce je throttlováno na 0,10–0,15 s (staggerováno přes `animTime`) s cachováním `_isLit`.
  - Opraven únik paměti světel Bludičky a nahrazeny lineární `.find()` / `.findIndex()` skeny trvalých světel (`player_petrolejka`, `player_hromnicka`, `grandfather_hearth`, `bludicka`) přímými O(1) referencemi.
  - Vznik přechodných bojových světel (hole, svěcené dopady, hromničky) je zastropován na nejvýše 16 a podmíněn aktivním nočním svícením.
  - Sloučeny 3 separátní průchody vykreslování nepřátel do jediného průchodu přes buffer `drawables` (včetně dudáckých oblaků prachu).
- **Sprite caching pro vysoce frekventované dropy a projektily**:
  - Pre-renderovány statické bitmapy do `ladaSpriteCache`: perníčky (malý, velký, obří), kyselá okurka, včela, sněhová koule, svěcená kapka, buchta, koláč, jitrnice, hruška a mince (tolar, stříbrňák, krejcar).

## 2026-10-16 — Výkonnostní pipeline vykreslování arény: ChunkBitmapCache, GlyphAtlas a optimalizace 2D Canvasu

- **Dedikovaný bezstavový modul vykreslování arény (`renderArena`)**: Veškerá logika vykreslování scény, kulis, entit, stínových a světelných vrstev byla vyčleněna z komponenty `App.tsx` do samostatného modulu `src/render/arenaRenderer.ts` s nulovou vazbou na stavový strom Reactu a herní simulační smyčku.
- **Dlaždicová mezipaměť statických kulis (`ChunkBitmapCache`)**: Statické objekty krajiny (roubenky, boží muka, stromy, ploty, sněhové závěje) jsou pre-renderovány do offscreen bitmapových dlaždic (chunků o rozměrech 512×512 px). Při pohybu kamery se scéna skládá z hotových bitmap pomocí `drawImage`, čímž se ušetřily stovky volání vektorových cest za snímek. Mezipaměť automaticky plynule detekuje změnu denní/noční fáze a přepeče teplou záři oken a svící.
- **Pre-renderovaný atlas číslic a symbolů pro bojové plovoucí texty (`GlyphAtlas`)**: Čísla poškození, léčení, kritických zásahů a symboly stavů jsou vykreslovány z pre-renderovaného atlasu s inkoustovým lemováním a stínováním. Zcela eliminuje alokace řetězců a náročná volání `ctx.strokeText()` a `ctx.fillText()` v horké renderovací smyčce.
- **0.5× offscreen osvětlení s bilineárním vyhlazením (`StorybookLightingRenderer`)**: Ladovské světelné vrstvy (Kvašová záře, Petrolejka a noční stíny) se rasterizují na offscreen plátno v polovičním rozlišení (0,5×) a do hlavní scény promítají s hardwarově akcelerovaným bilineárním škálováním. Šetří 75 % pixelových operací světelné vrstvy při zachování měkkého pohádkového charakteru.
- **Řazení hloubky bez alokace paměti (Zero-allocation depth sorting)**: Vykreslování entit podle hloubky využívá per-renderer scratch buffer (`entitiesScratch`). Bylo zcela eliminováno vytváření dočasných polí a objektů v každém snímku, což brání propadům FPS způsobeným garbage collectorem prohlížeče.
- **Architektonické rozhodnutí ADR 0017**: Sepsán a schválen záznam `docs/adr/0017-odmitnuti-phaseru-a-architektura-vykonnostni-pipeline.md`, který formálně odmítá přechod na Phaser/WebGL a kodifikuje čistou Canvas 2D optimalizační pipeline chránící autentický vizuální styl Josefa Lady.

## 2026-10-15 — Bojové plovoucí texty: 9 kategorií zobrazení, předvolby a optimalizace výkonu

- **Rozdělení textů v aréně do 9 samostatných kategorií (`CombatTextCategory`)**: Hráč může odděleně zapínat a vypínat:
  1. *Číselná zranění nepřátel* (běžná bílá čísla, kritické zásahy 💥, blesky ⚡)
  2. *Zranění a úbytek Kuráže lovce* (červená čísla poškození, bleskové odrazy)
  3. *Léčení a obnova Kuráže* (zelená/růžová čísla Kuráže z placek, jitrnic a posvěcení)
  4. *Bojové reakce a stavy* (Dodge, Minul, Štít pohltil, Imunní, Vyčerpán, Usmířen)
  5. *Názvy nápřahů a útoků* (telegrafované nápřahy bubáků i názvy útoků zbraní)
  6. *Bojové pokřiky a atmosféra* (hlášky při Zoufalé kuráži, Rozohnění)
  7. *Zisky kořisti a surovin* (Perníčky, Krejcary, Dušičky, Cukrový spěch)
  8. *Odemčení a milníky* (nové postavy, zbraně, mapy, milníky zbraní)
  9. *Globální oznámení a bossové* (příchod bosse, poklady, zklidnění monster)
- **Tři rychlé předvolby (Presety)**: K dispozici jsou okamžité volby `🎨 Plná atmosféra` (vše zapnuto), `⚖️ Taktický režim` (čísla, stavy a zprávy zapnuty; nápřahy, hlášky a kořist vypnuty) a `⚡ Čistý výkon` (veškeré texty vypnuty pro absolutní plynulost). Libovolná manuální úprava se přepíná na `🛠️ Vlastní výběr`.
- **Dostupnost v Pauze i Globálním nastavení**: V okně pozastavení výpravy (`Pauza / Esc`) přibylo tlačítko `💬 Texty v boji` i rychlý stavový indikátor; dialog je rovněž plně dostupný v okně `⚙️ Nastavení a vývoj` z hlavní nabídky i vesnice.
- **Optimalizace výkonu a paměti**: Odstraněno nákladné vyhodnocování regulárními výrazy v každém snímku ve prospěch O(1) kontroly kategorie. Při vypnutí kategorie zranění nepřátel dochází k potlačení alokace objektů v enginu, což šetří garbage collection a náročné vykreslování písma (`ctx.strokeText`).
- **Architektura a kánon**: Zaveden termín do `GLOSSARY.md` (Bojové plovoucí texty), sepsán `docs/adr/0016-kategorizace-bojovych-plovoucich-textu-a-vykon.md` a přidána ucelená sada testů v `tests/combatTextSettings.test.ts`.

## 2026-10-15 — Vylepšení z Dědečkovy nůše v testovacím módu (Sandbox) na úrovni 0-X

- **Výběr všech upgradů z dědečkovy nůše v sandboxu na úrovni 0-X**: Do testovacího režimu (`TestModeModal`) byla přidána nová plnohodnotná záložka `🧺 4. Dědečkova nůše (0-X)` obsahující všech 49 vylepšení, posvěcení, vzácných předmětů i synergických zbraňových upgradů.
- **Konfigurovatelná úroveň 0 až X pro každé vylepšení**: Hráč může každé položce nastavit úroveň od 0 (vypnuto) až po maximum dané položky (až 10 u pokladů/pomocníků, 5 u pasivek, 3 u Tříkrálové křídy a Syrečku, 2 u Ananasu, 1 u synergií) pomocí tlačítek `[ 0 ]`, `[ - ]`, `Úr. L/X` a `[ + ]`, případně rychlého zaškrtávátka.
- **Rychlé předvolby a filtrování**: K dispozici jsou předvolby pro nastavení všech pasivek na úroveň 1 (`⚡ Pasivky Úr. 1`), na maximum (`🔥 Pasivky MAX`), kompletní nůši na maximum (`👑 Plná nůše`) nebo vyčištění (`🧹 Vynulovat nůši (0)`). Filtrovat lze podle kategorií (`Trvalá posílení`, `Folklórní posvěcení`, `Vzácné předměty`, `Svačiny & Krejcary`, `Synergie zbraní`) i fulltextovým vyhledáváním.
- **Provázání s enginem hry**: `startGame` v `App.tsx` při spuštění testovací výpravy aplikuje vybrané upgrady z nůše přímo na hráče i engine v požadovaném počtu opakování, inicializuje zbraňové synergie a registruje je do zakoupených položek dědečka.
- **Doplnění chybějících zbraní do výběru**: Do seznamu zbraní v sandboxu byl přidán Splašený houser a Formanský bič, arzenál je tak 100% kompletní.

## 2026-10-14 — Harmonizace obecních vylepšení v hospodě a záchrana duší

- **Zachování charakteru lovců (procentuální škálování atributů)**: Vylepšení pro rychlost pohybu (Větrný mlýn: +3 % základní rychlosti/lvl), maximální Kuráž (Kamenná zeď: +10 % základní Kuráže/lvl), štěstí (Boží muka: +5 % základního štěstí/lvl) a dosah sběru (Strašák v poli: +15 % základního dosahu/lvl) se nově počítají procentuálně ze základních atributů konkrétního lovce, čímž zůstávají zachovány jejich unikátní silné stránky i handicapy (např. sběr bylinek u Kořenářky).
- **Asymptotické stropy pro neomezený nákup budov**: Všechna obecní vylepšení lze nakupovat bez umělého zastropování úrovní, přičemž citlivé statistiky využívají hladké hyperbolické asymptoty: redukce poškození Kamenné zdi (limit 40 %), krácení promočení a zpomalení Hvozdu (limit 85 %), šance na tolar z nemrtvých u Měšce (limit 25 %) a doba nezranitelnosti po lektvaru u Alchymisty (limit 5,0 s).
- **Tematické přemístění Kaple svaté vlny na záchranu duší**: Kaple svaté vlny již nespouští vlnu při nákupu u Čertova dědečka, nýbrž při **vysvobození zakleté duše z hliněného hrnce**. Síla vlny byla upravena na 75 posvátného zranění za úroveň (poloměr 350 px, odmrštění 280).
- **Frakční akumulátory drobných dropů**: Do enginu i běhové smyčky byly přidány akumulátory zlomků krejcarů a perníčků (`coinFraction`, `gingerbreadFraction`), aby nízké úrovně Pekárny a Hřbitovní brány neztrácely bonusy kvůli celočíselnému zaokrouhlování u drobných dropů o hodnotě 1.
- **Opravy chyb a sjednocení hodnot**: Aktivován dříve mrtvý multiplikátor posvátného poškození (`pl.holyDamageMultiplier`) pro všechny svaté útoky, sjednocena regenerace Kuráže na 4 Kuráže / 5 s za úroveň, odstraněna nechtěná 100% imunita na louže na 3. úrovni Hvozdu a v rozhraní hospody opraven popisek Obecní přirážky na skutečných +20 % za úroveň.
- **Aktualizace dokumentace a testů**: Sladěn `GLOSSARY.md` a `docs/adr/0004-hospodska-ekonomika-a-obecni-prirazka.md`, rozšířena testovací sada na 278 procházejících testů.

## 2026-10-14 — Harmonizace vylepšení zbraní (projektilové, aury, sečné) a oprava zbraňových milníků

- **Tematický bazén 6 běžných vylepšení pro projektilové zbraně**: Zaveden kompletní bazén vylepšení pro 8 projektilových a vrhacích zbraní (`kysela_okurka`, `povidlove_buchty`, `devatero_kviti`, `snehova_koule`, `kynuty_kolac`, `horky_brambor`, `vceli_roj`, `svecena_kropenka`) – Kobercový nálet (`proj_barrage`: +130 % projektilů, −30 % poškození), Rychlopalný mechanismus (`cd_hyper`: −30 % cooldownu), Těžká munice (`dmg_heavy`: +100 % poškození), Průrazné kování (`proj_pierce`: +2 průraz, −15 % poškození), Dalekonosný rozptyl (`proj_reach`: +50 % dosah a rozstřik) a Hustá salva (`proj_volley`: +60 % poškození, +40 % projektilů).
- **Dynamický výběr v Dědečkově nůši a malovaných truhlách**: Vylepšení se nyní nabízejí a losují dynamicky na úrovních 2, 4, 6 a 7 namísto jednoho pevně daného upgradu. Byla odstraněna provizorní syntetická vylepšení ze `synergisticUpgrades.ts`.
- **Oprava milníků sečných zbraní (`ignoreResist`)**: Nahrazen nefunkční parametr `pierceDelta: 1` mechanikou ignorování odolností strašidel (+25 % na 5. úrovni a +40 % na 8. úrovni) pro Osikový prut, Kovářské vidle a Kovanou halapartnu. Útoky proráží kamennou kůži a houževnatost monster.
- **Oprava statistického modelu a synchronizace React UI**: Opraven výpočet `_cachedStats` v `getRankedWeaponStats`, aby prázdný seznam vylepšení nenuloval základní postupný růst zbraně. Výběr v `WeaponMilestoneModal` okamžitě přepočítává běhové statistiky v enginu a spouští zvukový efekt volby.
- **Dokumentace a testy**: Zaktualizován `GLOSSARY.md`, sepsán architektonický záznam `docs/adr/0012-harmonizace-projektilovych-zbrani-a-milniku.md` a rozšířena testovací sada na 268 procházejících testů.

## 2026-10-14 — Kontaktní odstrčení a krátká nezranitelnost lovců

- Odstrčení se aktivuje ihned při fyzickém dotyku s nepřítelem, nikoli až po jeho úspěšném útoku; samostatný cooldown lovce je 1,2 s.
- Poškození odstrčení a síla odhození jsou zdvojnásobeny. Poškození, síla odhození i stun se škálují s maximální Kuráží lovce.
- Každý lovec získá po utržení poškození 0,3 s nezranitelnosti.

## 2026-10-13 — Úklid textů, oprava kontrastu a optimalizace UI pro dotykové displeje

- Odstraněny nečitelné světle žluté podtituly a texty s nízkým kontrastem v modalech Pauzy, Zbrojnice a Ovládání; nadpisy sjednoceny do kanonické tmavé barvy `--ink`.
- V `index.css` definována chybějící proměnná `--parchmentDark` a opraven odkaz na neexistující `var(--red)` v Malované truhle.
- Ze spodních lišt hlavní nabídky a výběru lovce odstraněna vývojářská a destruktivní tlačítka (`Testovací mód`, `Tester animací`, `Plán změn`, `Vymazat postup`) a sdružena do nového dialogu `⚙️ Nastavení a vývoj`.
- V dialogu Nastavení a vývoj integrováno nastavení vizuální kvality a plných efektů, plynulého režimu (60 FPS), ukazatele FPS a dynamické obtížnosti.
- V dialogu Ovládání a cíl hry byl odstraněn technický tab Plynulost a záložky byly na mobilních zařízeních upraveny do plynulé horizontální scrollovací lišty zabraňující neuspořádanému rozházení.
- V Dědečkově nůši na mobilních zařízeních upřednostněna nabídka zboží k nákupu a zůstatek perníčků (`order: 1`), takže jsou ihned viditelné bez nutnosti rolovat.
- V herním HUDu zrušena 34px vysoká lišta perníčků a nahrazena kompaktním odznakem v horním řádku vedle ukazatele Kuráže a tlačítka pauzy, čímž se uvolnil prostor pro herní scénu.
- Z obrazovky výběru výpravy byl na všech zařízeních odstraněn redundantní úvodní blok „KROK 1 ZE 2“, čímž se nabídka výprav posunula nahoru.
- V nabídce pozastavení hry (Pauza) bylo tlačítko „Pokračovat ve hře“ a rychlé přepínače přesunuto nahoru pod nadpis a odstraněno testovací tlačítko přivolání minibosse.

## 2026-10-13 — Bonusový návrat po výpravě

- Přidána časově omezená nabídka návratu do stejné úrovně se stejným lovcem a jednorázovým bonusem k poškození, Kuráži nebo krejcarům.
- Bonus se spotřebuje až po úspěšné validaci běžné výpravy; testovací režim jej nespotřebuje.
- Krejcarový bonus se násobí při sestavení výsledkové obrazovky, nikoli v průběžných statistikách.
- Oblak povidlové vůně má nižší neprůhlednost, aby méně zakrýval boj.
- Přidána responzivní karta nabídky a podpora omezení animace.

## 2026-10-13 — Mobilní usnadnění obtížnosti

- Přidán posuvník „Mobilní usnadnění“ do pauzy hry (úrovně 1–10, výchozí úroveň 5) s uložením do localStorage.
- Každá úroveň snižuje rychlost pohybu a rychlost útoků nepřátel o 2 % a jejich poškození o 3 %, včetně nepřátel s prefixem, minibossů a bossů.
- Dosah sběru se zvětšuje o 5 % za úroveň a hitbox lovce se zmenšuje o 5 % za úroveň. Účinky jsou ve výchozím stavu aktivní na dotykových zařízeních; přepínač dovoluje aktivaci i na ostatních zařízeních.
- Opraven přepočet kadence, aby se výchozí doba nápřahu nezpomalovala dvakrát, a změna dosahu sběru nyní zachovává bonusy z magnetických vylepšení.

## 2026-10-13 — Začlenění přívlastků do taktických formací a balanc bleskového odrazu

- **Přívlastky u velitelů formací**: Na dynamické obtížnosti >= 3.5 Režisér výpravy přiřazuje velitelům taktických formací (Klešťové sevření, Kladivo a kovadlina, Drtivý přepad) tematické bojové přívlastky.
- **Bezpečnostní strop bleskového odrazu**: Odražené poškození Hromových strašidel je zastropováno na max 25 % maximální Kuráže hráče s interním cooldownem 0,25 s, což eliminuje nechtěnou smrt silným úderem zblízka.
- **Aura a potácení Vyčerpaného bubáka**: Vizuální styl Vyčerpaného bubáka doplněn o kolébavou kinematiku potácení a vznášející se ospalé částice únavy.
- **Encyklopedie přívlastků v Bestiáři**: Do Bestiáře přidána dedikovaná kategorie „Přívlastky“ s interaktivním náhledem a taktickými radami pro boj proti jednotlivým folklórním afixům.
- **Doménová dokumentace a ADR**: Doplněny pojmy `Bleskový odraz` a `Potácení` do `GLOSSARY.md` a sepsán záznam `docs/adr/0010-zacleneni-privlastku-do-formaci-a-balanc-odrazu.md`.

## 2026-10-13 — Sjednocení rejdového rozpočtu, trestání úspěchu a přívlastek Vyčerpaný

- **Sjednocení rozpočtu hrozeb**: Režisér výpravy (`RunDirector`) nově naceňuje strašidla ve shodě s hodnotami dropů (`ENEMY_POINTS`), čímž se sjednocuje kalkulace dropů a zátěže scény.
- **Trestání úspěchu na nejvyšší obtížnosti**: Při dynamické obtížnosti >= 4.5 a vysoké dominanci hráče (>= 0.70) Režisér povolává do pole trestné **Dvojče minibosse** (`👑 Dvojče: [Jméno]`) za 30 bodů rozpočtu.
- **Ochrana na nejnižší obtížnosti**: Na obtížnosti <= 2.0 Režisér úspěch hráče netrestá vůbec (multiplikátor tlaku je pevně zastropován <= 1.0 a Dvojče minibosse se nikdy nenazpawnuje).
- **Progresivní asistence a přívlastek Vyčerpaný**: Asistence je plynule vázána na index tísně (kombinace nízké Kuráže a nízké dominance). V tísni Režisér proporčně nasazuje strašidla s přívlastkem **Vyčerpaný** (-50 % rychlost pohybu, -50 % kadence útoků a -50 % HP, přičemž plná hodnota pro dropy předmětů a perníčků zůstává 100% zachována).
- **Nezakrytý výhled na obrazovku**: Veškerá varování a telegrafy Režiséra byly přemístěny z plovoucího textu nad hlavou hráče do horního HUD banneru pro čistý výhled i na mobilních telefonech.
- **Doménová dokumentace a ADR**: Doplněny pojmy `Přívlastek bubáka`, `Dvojče minibosse` a `Vyčerpaný bubák` do `GLOSSARY.md` a sepsán architektonický záznam `docs/adr/0009-sjednoceni-rejdoveho-rozpoctu-a-progresivni-privlastky.md`.

## 2026-10-13 — Oprava CI závislostí a vyčištění repozitáře

- Opraven soubor `package-lock.json` pro bezchybné spouštění `npm ci` v CI pipeline (obnoveny chybějící položky pro vitest a podpůrné nástroje).
- Z repozitáře odstraněny omylem verzované artefakty `.aistudio/` a přidány do `.gitignore`.

## 2026-10-13 — Doplnění folklórních předmětů, chytrého drop systému a lokalizací

- Doplněna a sjednocena celá sestava folklórních pomocných předmětů (ADR 0006 a Dědečkova nůše): Kovářská podkova, Hliněný kohoutek, Vyřezávané kukačky, Trouba obecního ponocného, Masopustní řehtačka, Babiččina kropenatá zástěra, Hlt slivovice, Dudácká čertovská skočná, Kominický knoflík a Arcivzácný ananas.
- Do `ladaRenderer.ts` doplněna ladovská kresba Arcivzácného ananasu (`drawAnanas`) s medovou aurou, smaragdovou korunkou a diamantovým křížkováním, stejně jako kresby Podkovy, Kohoutka a Kukaček.
- Do `App.tsx` zapojeno dynamické nahrazování léčivých dropů (`resolveDynamicDrop`), záchranný systém (Emergency Bias pod 25 % Kuráže), horké perníčky z dálkového zahnání (`FAR_KILL_DISTANCE`) i komprese dropů při Overkillu.
- Do Dědečkovy nůše (`GRANDFATHER_ITEMS`) doplněny chybějící položky `kovarska_podkova`, `hlineny_kohoutek` a `vyrezavane_kukacky` včetně autentických ladovských hlášek.
- Kompletně lokalizovány všechny instantní a pekelné předměty v českém (`cs.ts`) i anglickém (`en.ts`) slovníku a rozšířeny testy pokrývajících všech 18 testovacích sad.

## 2026-10-13 — Opravy typové kontroly a výchozí dynamické obtížnosti

- Opravena typová chyba v `src/App.tsx` při zpracování `GrandfatherEffect` pro `fajfka` a `bear_mask`: doplněny chybějící varianty `{ type: 'fajfka' }` a `{ type: 'bear_mask' }` do unie `GrandfatherEffect` v `grandfatherItems.ts` a sjednoceno vyhodnocení nákupu bylinkové fajfky i medvědí masti.
- Opravena výchozí dynamická obtížnost v `GameEngine.initRun`: zastaralá fallback hodnota 1,5 z historického škálování nahrazena kanonickou výchozí hodnotou 3,0 (Zlověstná noc), což opravilo adaptivní škálování tlaku Režiséra výpravy a související test.

## 2026-10-13 — Vrány a mraziví skřítci v první výpravě

- Běžné žáby v spawn fondech první výpravy nahrazeny rychle létajícími vránami a slabými mrazivými skřítky; úvodní vlna nyní začíná dvojicí vran.
- Vrány mají rychlý vlnivý let a náletové chování; mraziví skřítci mají nízké HP, pomalý pohyb a viditelnou auru o poloměru 78 px, která každých 0,7 s způsobí 3 body mrazivého poškození a krátce zpomalí lovce.
- Přidány vlastní kresby obou nepřátel, lokalizované názvy bestiáře a regresní testy. Morana zůstává finálním bossem první výpravy.

## 2026-10-13 — Morana, finální boss první výpravy

- Vodního bosse první výpravy nahrazuje **Morana, špatně vynesená smrtka**; interní ID úrovně a její úvodní mini-bossové zůstávají zachované.
- Přidána vlastní kresba Morany inspirovaná dodanou ilustrací: slaměné údy, tmavý květovaný šátek, zlověstná tvář a obíhající ledový vítr se sněhovými záblesky.
- Morana útočí z dálky vějířovou salvou mrazivého větru a pravidelnou radiální vánicí. Pod polovinou zdraví přechází do druhé fáze s hustšími a silnějšími salvami.
- Aktualizovány české a anglické názvy finálního bosse, bestiář, popis trofeje první výpravy a regresní testy.

## 2026-10-13 — Přečíslování herních úrovní od 1

- Hráčsky viditelné číslování výprav nyní začíná na **1**: dřívější úroveň 0 (Předjaří v Hrusicích) je úroveň 1 a ostatní výpravy se posouvají až po úroveň 7.
- Interní ID úrovní 0–6 zůstávají beze změny, aby se nepoškodil herní engine, odemykání ani uložený postup.
- Aktualizovány české a anglické lokalizace, názvy a odznaky úrovní, požadavky k odemčení, popisky testovacího režimu a testy.
- Identifikátory trofejí a datové klíče zůstávají kompatibilní.

## 2026-10-12 — Opravy a sjednocení arény Březnové tání (úroveň 0)

- Opraveno škálování začátečnického minibosse v reálném běhu hry: `createEnemyInstance` v `App.tsx` nově respektuje strop 220 HP a mírný násobič zranění pro úroveň 0 namísto chybného 1400 HP bloatu.
- Doplněna chybějící úvodní vlna v čase 0 s (2 rybniční žabky) a mírnější 3,5s počáteční spawn timer při spuštění úrovně 0 z uživatelského rozhraní.
- Zaveden parametr `allowFractionalDamage: true` u environmentálního poškození v mlýně a na poli, čímž bylo odstraněno zaokrouhlování na 1 dmg/snímek a závislost na snímkové frekvenci monitoru.
- Opraveno vyhodnocení aktivní úrovně (`activeLevelId ?? 1` namísto falsy `|| 1`), aby úroveň 0 nebyla mylně považována za úroveň 1.
- Z podmínky dokončení úrovně ve výběru výprav odstraněna falešná závislost na `meta.bestiaryKills.hastrman`, která označovala úroveň 0 jako pokořenou po porážce mid-bosse v úrovni 1.
- Opravena podmínka spuštění rituálu Bubácké díry v Režisérovi výpravy (`director.ts`), aby se anomálie mohla v okně 40–85 s řádně objevit, pokud v aréně aktivně nebojuje živý boss.
- Do herní smyčky zapojena bossova dynamická mechanika „Březnová povodeň“ s 15s periodou a vyvoláním žabích posil ze zvednuté řeky.
- Do arény umístěny chybějící interaktivní objekty: Babiččina kamna s léčením, rotující dřevěná Káča odrážející nepřátele a plovoucí kry u rybníka.
- V POI Hustý les implementováno přepadení z houštin (myšák a šotek) v souladu s textem nápovědy.
- Rozšířeno dynamické nasvícení Storybook Lighting o okna, světla a okluzory všech orientačních bodů Březnového tání (`march_*`).
- Sjednocen interakční dosah klávesy [E] u kostela a hospody na 30 px a přidána nová trofej `level0_completed` (První krůčky v předjaří) v češtině i angličtině.

## 2026-10-12 — Oprava konzistence názvu úrovně 0

- Sjednocen krátký název úrovně 0 v metadatech odemykání a v prvním milníku s kanonickým názvem `Březnové tání` z `GAME_LEVELS[0]`.
- Rozšířeny testy úrovně 0 o přesnou noční spawn pool kompozici, vyloučení finálního bosse z běžného spawn poolu a konzistenci názvů v `LEVEL_UNLOCKS`.

## 2026-10-12 — Povidlová vůně, Dědečkova fajfka, Maska medvěda a Devatero kvítí

- Povidlové buchty po zásahu vytvářejí fialový oblak o poloměru 140 px na 3,5 s; oblak způsobuje 20 % původního zásahu za sekundu. Specifický upgrade přidává +40 % k poloměru i trvání.
- Dědečkova fajfka se mění z pasivní regenerace na automatickou aktivní schopnost: kouř 110 px / 4 s, 9 poškození/s, zpomalení pohybu i útoku o 35 % po zohlednění odolnosti dle maximální Kuráže, obnova 8 % Kuráže a cooldown 3,5 s. Druhý stupeň přidá +30 % k velikosti oblaku a zvýší obnovu na 12 %.
- Maska medvěda převádí přebytečné léčení na plošné poškození do 230 px; základ je 50 % overhealu s odolností dle Vůle. Další úrovně přidávají +20 % k léčení i zranění maskou.
- Název je sjednocen na „Devatero kvítí“ a základní salva má 5 projektilů.
- Upraveny regresní testy pro počet projektilů Devatera kvítí.

# Bubákov — Changelog

## 2026-10-11 — Léčivé dropy se při plné Kuráži nesbírají

- Sběrná logika ponechává léčivé dropy (jitrnice/potion, chléb a hrušku) na mapě, pokud má Lovec plnou Kuráž; magnetický dosah je také nepřitahuje.
- Jakmile Kuráž klesne pod maximum, léčivé dropy lze opět normálně přitáhnout a sebrat.
- Ostatní kořist, včetně krejcarů, perníčků a dušiček, se při plné Kuráži sbírá beze změny.
- Přidány regresní testy pro léčivé i neléčivé dropy.


## 2026-10-11 — Spotřební Kuráž, pekelné poklady a obchodní přirážka

- Léčivé předměty mají vlastní názvy a SVG ikony: Teplá cikorka (+30 Kuráže), Žejdlík piva (+40) a Panák kořalky (+55). Při plné Kuráži nelze léčivý nákup provést.
- Přidány tři pekelné poklady: Pekelný měšec (40 krejcarů), Pekelný stříbrňák (100) a Pekelný tolar z pekla (250); krejcary se připíšou okamžitě.
- Běžné položky zdražují o 50 % za každý předchozí nákup. Léčení a poklady s přímou výplatou krejcarů jsou z inflace vyňaty.
- Aktualizovány regresní testy cen a výjimek z inflace.

## 2026-10-11 — Profily optimalizace výkonu

- Jediný přepínač výkonu nahrazen posuvníkem se třemi profily: Vizuální kvalita, Vyvážený (výchozí) a Maximum FPS.
- Profily nastavují strop živých nepřátel (70 / 55 / 45), počet světel pro reliéfní okraje a nákladné dynamické stínování; Maximum FPS zachovává světelné halo a vynechává dynamické stíny.
- Starší uložené nastavení `performanceMode` se migruje na odpovídající profil; mobilní přepínač dál synchronizuje profil.

## 2026-10-11 — Přepracování dynamické obtížnosti a mírnější začátek výpravy

- Sedm předvoleb obtížnosti (2,00×–5,00×) nyní mění především přísun rozpočtu hrozeb, jeho kapacitu, spawn intervaly a cooldowny. Typy nepřátel, elitní varianty a taktické formace jsou dostupné na všech předvolbách; tematický fond stále respektuje aktivní úroveň a fázi dne.
- Prvních 90 sekund má odstupňovaně mírnější rozjezd na každé obtížnosti: přírůstek hrozeb činí 35 % / 50 % / 70 % běžné hodnoty během úseků 0–30 / 30–60 / 60–90 s, kapacita rozpočtu 55 % / 65 % / 80 %. Poté se obnoví běžné hodnoty. Tyto dočasné faktory se násobí i stávajícím adaptivním tlakem 0,72×–1,12×.
- Spawn interval, prefixy, těžké formace, přechody fází Režiséra a anti-kiting terén mají v úvodu delší prodlevy, takže se rozpočet i střetnutí rozbíhají postupně.
- Asistence je stejně účinná na všech předvolbách a násobí přírůstek rozpočtu 0,50×, pokud má hráč nízkou Kuráž i nízkou dominanci; těžké formace zůstávají při aktivní asistenci potlačené.
- Přidány regresní testy pro všech sedm předvoleb, přístupnost těžkých formací i při 2,00×, stejnou účinnost asistence a zachování tematických elitních fondů.

## 2026-10-11 — Dynamická obtížnost: aktuální předvolby a adaptivní tlak

- Aktuální volič nabízí sedm předvoleb: 2,00×, 2,50×, 3,00×, 3,50×, 4,00×, 4,50× a 5,00×; výchozí je 3,00× Zlověstná noc. Rozsah 1,00×–2,00× uvedený u prvního nasazení 10. října je historický a byl následně nahrazen.
- Režisér upravuje kapacitu i přírůstek rozpočtu hrozeb vyhlazovaným násobitelem 0,72×–1,12×. Volba obtížnosti zůstává základním nastavením; adaptační násobitel se mění podle Kuráže a naměřené dominance založené na časech zabití (TTK).
- Při Kuráži pod 35 % a dominanci pod 0,45 míří násobitel k 0,72×; při Kuráži pod 50 % a dominanci pod 0,35 k 0,82×. Při Kuráži nad 75 %, dominanci nad 0,68 a alespoň třech zaznamenaných zabitích může vzrůst na 1,12×. Změna je postupná, maximálně přibližně 25 % rozdílu za sekundu.
- Bez záznamu zabití se hráč nepovažuje automaticky za dominantního. Při aktivní asistenci Režisér blokuje těžké formace včetně architektů, prefixované nepřátele i přeměňování přebytečného rozpočtu na silnější běsy.
- Při dosažení limitu 75 živých nepřátel se nepřidávají další entity; pokud asistence není aktivní, přebytečný rozpočet může posílit již přítomného běsa. Telemetrie Režiséra uvádí aktuální násobitel tlaku jako `pressureMultiplier`.
- Finální CI po sloučení na `main` úspěšně dokončilo instalaci, typovou kontrolu, lint, všech 189 testů a produkční build ([běh CI](https://github.com/Pilgrimage123/Bubakov-2/actions/runs/38155762303)).

## 2026-10-11 — Zvýšení Obecní přirážky na 30 %

- Cena každého vylepšení vesnice se počítá jako základní cena navýšená o 30 % základní ceny za každou již zakoupenou úroveň napříč všemi budovami. Přirážka je sdílená, nikoli oddělená pro každou budovu.
- Zachováno úplné 100% vrácení investovaných krejcarů; výpočet rekonstruuje posloupnost nákupů podle základních cen a stejného cenového vzorce.

## 2026-10-11 — Zachování hodnoty kořisti a bezpečná migrace postupu

- Při slučování tří velkých perníčků do obřího se zachovává součet skutečných hodnot vstupních dropů. Například tři perníčky po 6 vytvoří obří perníček za 18, nikoli za historicky natvrdo nastavených 20.
- Načítání uložené úrovně přijímá pouze celočíselné ID v rozsahu 0–6; neplatné, zlomkové nebo mimo rozsah ležící hodnoty bezpečně přejdou na výchozí úroveň 0.
- Načtení profilu bezpečně pokračuje i tehdy, když prohlížeč blokuje přístup k `localStorage`; v takovém případě se použije výchozí postup.
- Regresní test slučování ověřuje zachování celkové hodnoty, nikoli historickou pevnou hodnotu 20.

## 2026-10-11 — Režisér výpravy: tematický fond a regresní ověření (#11)

- Spawnování respektuje aktuální úroveň a fázi dne. Při vysoké obtížnosti se mohou přidat pouze elitní varianty nepřátel, jejichž základní typ je povolený v dané fázi; nesouvisející bestiář ani bossové se do fondu nepřimíchávají.
- Výběr fáze vychází ze skutečného stavu enginu: aktivní úrovně a herního času. Při neúplné definici úrovně je zachován bezpečný fallback bez rozšiřování běžného fondu o bossy.
- Opraven test, který nesprávně očekával `krvavy_kostlivec` z globálního bestiáře v tematicky omezeném fondu.
- Testy samostatně ověřují osm úhlových směrů kolem hráče, utrácení rozpočtu a tematický fond. Osm směrů jsou úhly pro rozmístění, nikoli osm sektorů mapy.

## 2026-10-11 — Elitní prefixy: čtyři bojové archetypy a anti-kiting

- Všechny čtyři prefixy stojí 15 bodů rozpočtu hrozeb (běžný taktický nepřítel stojí 3). Zachovávají identitu i základní odměny původního nepřítele.
- **Vichřicový:** +110 rychlosti a 50% šance vyhnout se zásahu.
- **Hromový:** +70 rychlosti; při zásahu vrací hráči jako bleskové poškození 50 % skutečně utrženého poškození, pokud je hráč do 200 px.
- **Kamenný:** rychlost snížena na 80 %, redukce příchozího poškození 91 % a imunita vůči omráčení i omračujícím účinkům jídla.
- **Pekelný:** při vzdáleném kitingu zvyšuje rychlost o 15 % za sekundu až na +120 %; při přiblížení se bonus resetuje. Zanechává magmatické louže trvající 9 sekund a způsobující 6 poškození.
- Při vytrvalém přímém běhu lovce Pekelný vyvolá puklinu 200–250 px před hráčem. Puklina před výbuchem 1,2 s varuje a poté udělí jednorázové poškození 24.
- Regresní testy pokrývají hranici odrazu Hromového na 200/201 px, rychlostní strop Pekelného, poškození magmatu i jednorázovou erupci.

## 2026-10-11 — Rozhodnutí integrace PR #6

- Zachovány ověřené verze z aktuálního `main` pro App/UI, audio, enginové API, renderer, vesnická data a sdílené typy; konfliktní starší kopie z `feat/unify-mechanics` nebyly převzaty, aby se nerozbily navazující kontrakty.
- Převzato sedm architektonických rozhodnutí do `docs/adr/`, relevantní změny CSS a aktualizace zbraňového benchmarku.
- Odstraněny pracovní specifikace v `.scratch/` a jednorázové skripty `scratch_*.js`; nepřenášejí se znovu změny jídla/zbraní ani cleanup, které už jsou v `main`.
- Ověření výsledné integrační větve prošlo: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test` (181/181) a `npm run build`.

## 2026-10-11 — Oprava CI konfigurace

- Doplněn skript `typecheck` (`tsc --noEmit`), který workflow CI již používá.
- Kompletně regenerován `package-lock.json` příkazem `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` v Node.js 22 / npm 10 na GitHub Actions; doplněny tranzitivní závislosti ESLint a Vitest.
- Sjednocena deklarace `esbuild` na `^0.28.0`, odpovídající Vite 8 peer požadavku.
- Dočasný workflow použitý k regeneraci lockfile byl po dokončení odstraněn.

## 2026-10-11 — Režisér výpravy: sektory a rozpočet hrozeb

- Doplněno osm rovnoměrně rozmístěných úhlových směrů pro spawn kolem hráče a rozložení taktických posil; jde o směry rozmístění, nikoli osm sektorů mapy.
- Přidána veřejná metoda `getAllBubaksPool` pro výběr bestiáře bez bossů včetně elitních variant a metoda `getBubakThreatCost` pro jednotný výpočet ceny hrozby.
- Běžní bubáci spotřebují 3 body rozpočtu, definované elitní varianty 8; plán spawnu respektuje rozpočet a odečítá body pouze za úspěšně vytvořeného nepřítele.
- Při dosažení limitu 75 živých nepřátel převádí Režisér přebytečný rozpočet na posílení existujícího běsa i během fáze Oddychu; převod je omezen cooldownem, aby se neopakoval každý snímek.

## 2026-10-10 — Dynamická obtížnost, posílení Režiséra výpravy a volič v herním menu

> Historický stav při prvním nasazení: pět úrovní 1,00×–2,00× a výchozí 2,00×. Dne 11. října byl rozsah rozšířen na aktuálních sedm předvoleb 2,00×–5,00× s výchozí hodnotou 3,00×. Dřívější volný výběr z celého bestiáře a samotná Kuráž jako spouštěč asistence byly následně upraveny; aktuálně se fond drží úrovně/fáze a asistence vyžaduje také dominanci pod 0,35.

- **Posuvník Dynamická obtížnost v nabídce hry:**
  - Přidán interaktivní posuvník v předstartovní nabídce výpravy (`App.tsx`) i v nastavení hry (`ControlsModal.tsx`) s 5 stupni od 1.00× po 2.00× (krok 0.25).
  - Výchozí nastavení nastaveno na maximum: **2.00× – Pekelná štvanice (Výchozí / Max)** s perzistentním uložením do profilu hráče (`meta.dynamicDifficulty`).
  - Stupně obtížnosti: 1.00× Běžná výprava, 1.25× Neklidné povětří, 1.50× Zlověstná noc, 1.75× Divoká štvanice, 2.00× Pekelná štvanice.
- **Aktivní Režisér výpravy a eliminace hluchých míst:**
  - **Drtivý přepad:** Po zachování 3.5sekundové fáze Oddychu (`lull`) Režisér zformuje masivní protiúder se dvěma obrněnými Přepadovými veliteli a obkličujícím rojem s úvodním zrychlením (+20 %) a odolností proti odhození (poise) na 3.5 s.
  - **Zrádný terén:** Sledování vektoru pohybu lovce – při vytrvalém jednosměrném běhu či kroužení (> 3.5 s) Režisér klade 250 px před hráče zpomalující zóny (bláto / led) trvající 4 s (-25 % rychlost, cooldown 5 s).
  - **Klešťové sevření:** Taktické líhnutí útočných hlídek z protilehlých úhlů zamezující snadnému kroužení po obvodu.
  - **Ostřílení běsi (Ochrana 60 FPS při 75 entitách):** Při dosažení limitu 75 živých monster investuje Režisér přebytečný rozpočet hrozeb do povýšení stávajících strašidel (+40 % poise resist, zrychlení na 155 px/s) namísto nečinnosti.
  - **Škálovaná asistence:** Asistence Režiséra při poklesu Kuráže pod 50 % zpomaluje přísun hrozeb na maximální obtížnosti 2.00× pouze o 25 % (oproti 50 % na základu 1.00×), čímž udržuje neustálý bojový tlak.
- **Doménový model a dokumentace:**
  - Založen záznam architektonického rozhodnutí `docs/adr/0005-dynamicka-obtiznost-a-reziser-vypravy.md`.
  - V `GLOSSARY.md` zapsány kanonické pojmy: *Dynamická obtížnost*, *Ostřílení běsi*, *Klešťové sevření*, *Zrádný terén*, *Drtivý přepad*.
- **Testy a kompatibilita:**
  - Rozšířena testovací sada `tests/runDirector.test.ts` o 6 nových testů pokrývajících škálování rozpočtu, Drtivý přepad, Zrádný terén, Ostřílené běsy a asistenci (všech 154 testů v projektu prochází, `tsc && vite build` bez chyb).

## 2026-10-10 — Vyvážení a harmonizace hospodských vylepšení, Obecní přirážka a Zoufalá kuráž

> Historická podoba při prvním nasazení používala obecní přirážku 15 % ze základní ceny za každou dříve zakoupenou úroveň. Dne 11. října byla sazba upravena na 30 %; aktuální stav je popsán v novějším záznamu nahoře.

- **Obecní přirážka (Sdílené zdražování vesnice):**
  - Zaveden vzorec ceny se sdílenou přirážkou za rozvoj vsi: každá zakoupená úroveň jakékoliv budovy zvýší cenu všech dalších nákupů o +15 % základní ceny.
  - Odstupňovány základní ceny budov do 3 úrovní (30 / 50 / 75 krejcarů) podle dopadu na hru.
  - Úrovně jsou neomezené s bezpečnými asymptotickými stropy pro obranné a časové efekty (redukce zranění max 50 %, nezranitelnost z lektvaru max 5 s, odolnost proti zpomalení max 80 %).
- **Vrácení krejcarů (100% bezplatný respec):**
  - Deterministický výpočet hodnoty investovaných krejcarů `calculateTotalVillageInvested` umožňující kdykoliv bezplatně vyrovnat obecní účet a přerozdělit úspory.
  - Do záhlaví hospody U Černého kocoura přidán informační panel rozvoje vsi s procentem přirážky a tlačítkem `🔄 Vrátit krejcary`.
- **Harmonizace 12 budov a folklórní pomocníci:**
  - Všech 12 budov důsledně sjednoceno na Ladovský motiv zkrocených strašidel pomáhajících vesničanům (rarášci, hastrmani, divoženky, diblíci, ohniví mužíci, klekánice, bezhlaví furianti, bludičky).
  - Odstraněna dřívější duplicita pivovarských ležáků; regenerace Kuráže sjednocena v Bylinkové zahrádce (+2 Kuráže / 5 s za úroveň).
- **Nové herní efekty:**
  - **Perníková vůně (Pekárna):** +10 % za úroveň k hodnotě všech sebraných Perníčků.
  - **Poklady starých časů (Hřbitovní brána):** +10 % za úroveň k hodnotě Krejcarů a +1 % šance za úroveň na vypadnutí stříbrného tolaru z nepřítele.
  - **Zoufalá kuráž (Šenkýřova kuráž):** Při poklesu Kuráže pod 35 % aktivuje lovec +15 % poškození za úroveň a jantarovou Ladovskou auru s plovoucím textem `🍺 ZOUFALÁ KURÁŽ!`.
- **Doménový model a dokumentace:**
  - Založen záznam architektonického rozhodnutí `docs/adr/0004-hospodska-ekonomika-a-obecni-prirazka.md`.
  - Do `GLOSSARY.md` zapsány kanonické pojmy: *Obecní přirážka*, *Vrácení krejcarů*, *Zoufalá kuráž*.
- **Testy a lokalizace:**
  - Nová testovací sada `tests/villageEconomy.test.ts` (6 testů, ověřeno všech 142 testů v projektu).
  - Kompletní aktualizace CZ/EN lokalizací v `cs.ts` a `en.ts`.

## 2026-10-10 — Integrace Úrovně 0 (Předjaří), synergických upgradů zbraní, Mariáše ďáblů a responzivního HUDu

- **Úroveň 0: Předjaří v Hrusicích (Tutorial & Prologue):**
  - Rozšířen typ `GameLevelId` na `0 | 1 | 2 | 3 | 4 | 5 | 6` v `types.ts`.
  - Zavedena definice úrovně v `levels.ts` a výchozí odemčení v `levelUnlocks.ts`.
  - Nový herní obsah: protivníci Probuzená žába, Jarní vodníček a boss Vodník z tajících ker (Hastrman) s mechanikou Březnové povodně.
  - Simulace a vykreslování jarních překážek: interaktivní plující kry (`ice_floe`), roztočená dřevěná káča (`kaca`), babiččina kachlová kamna (`granny_stove`) a skály (`rock`).
  - Atmosférické pozadí `spring_river` a počasí `ice_drift` (tání ker s tušovými konturami).
  - 3 folklórní rozmary pro Předjaří v `runArchetypes.ts`: Rychlé Tání, Jarní Probuzení, Březnový Chlad.
  - Kompletní CZ/EN lokalizace v `cs.ts` a `en.ts`.
  - Nová testovací sada `tests/level0Predjari.test.ts`.
- **Synergické upgrady zbraní (`synergisticUpgrades.ts`):**
  - Vytvořen datový model synergických variant zbraňových upgradů pro herní archetypy (swarm, burst, tempo, heavy).
  - Aplikace variant v enginu (`upgradeWeapon` a `applySynergisticUpgrade` v `engine.ts`).
  - Podpora výpočtu statistik v `weaponMilestones.ts` včetně násobitele projektilů (`projectileCountMult`).
  - Nová testovací sada `tests/synergisticWeaponUpgrades.test.ts`.
- **Mariáš ďáblů pro Čerta (`boss-engine-update`):**
  - Do souboje s pekelným Čertem v `App.tsx` začleněna mechanika tažení mariášových karet (Srdce – léčení/plamenný kruh, Kule – vějíř střel, Listy – vyvolání sazových rarášků, Žaludy – zuřivý výpad).
  - Časovač `certMariashCd` registrován ve stavu enginu (`engineState.ts`).
- **Responzivní Boss HUD (`index.css`):**
  - Varovný banner `#boss-warning-banner` a lišta `#boss-bar-wrap` upraveny pro bezpečné zalamování a responzivní zobrazení na mobilních zařízeních (`max-width: 768px`).
- **Doménový model a úklid větví:**
  - V `GLOSSARY.md` zapsány kanonické pojmy *Mariáš ďáblů* a *Synergický upgrade*.
  - Ponecháno Ladovské kvašové svícení dle ADR 0003; starší generic modul dynamického svícení odmítnut.
  - Větve `retire-standalone`, `sync-production-cleanup-zip` a `new-food-weapons` potvrzeny jako plně absorbované.

## 2026-10-10 — Ladovské kvašové svícení (Storybook Illumination System)

- **Ladovská kvašová renderovací pipeline (`storybookLightingRenderer.ts`):**
  - Implementována kompozitní vrstva světla s předrenderovanými kvašovými stupni (3–4 tonální pásy) a procedurálním tušovým tečkováním/šrafováním na okrajích namísto digitálního rozostření.
  - Dynamické tónování zimního sněhu podle denních fází: idylická smetanová běloba v poledním slunci (`#FFFDF5`), romantické pastelové indigo za soumraku a v noci (`#433858` až `#171A31`), a oslepující mrazivý zákal s roztřesenými tušovými konturami při kritické Kuráži (< 25 %).
  - Zavedena **Pohádková inverze siluet** (`silhouetteInvertTimer`): zasažení svěceným světlem či zábleskem přepne kontury na 2–3 snímky do křídově bílých dřevoryteckých vrypů (`#FFFBEB`).
- **Herní mechaniky světla a stínu (`storybookLighting.ts`):**
  - **Petrolejka lovce:** Mosazná lampa v ruce lovce s doshem škálovaným podle **Kuráže** (až 225 px); při kritické Kuráži plamínek mihotavě skomírá do tísnivé viněty, v poledním slunci Petrolejka spočívá na opasku.
  - **Stínová záštita Bubáka a nočních strašidel (`category: "shadows"`):** Ve tmě a stínu budov získávají strašidla +35 % rychlost, 40 % odolnost proti zranění a tušový kouř. Při vyhnání na světlo záštita praská s 0,25s zavrávoráním, +25% zranitelností a sprškou tušových kaněk (`ink_specks`).
  - **Bludička močálová:** Éterická azurově-fialová záře maskující varovné obrysy pozemních nástrah a vábící okolní nemrtvé k lovci s +15% rychlostním bonusem.
- **Dynamická světla zbraní a prostředí:**
  - **Osikový prut:** Švihnutí vytváří nebesky modrý oblouk prosvěcující tmu na 0,4 s.
  - **Svěcené předměty & Hromnička:** Katedrální sluneční sloupy zanechávající zářící stopy na 3,5 s.
  - **Česneková topinka & Dědeček:** Hřejivá máslová aura plotny s praskajícími jiskrami.
  - **Pekelný Čert:** Sirná a šarlatová záře rohů a kopyt zanechávající žhnoucí uhlíky.
- **Rozšíření architektury map:**
  - Zvýšené zastoupení **Roubenek** v generátoru dekorací arény: v noci vrhají máslově žluté lichoběžníky s tušovými okenními kříži na sníh, ve dne vrhají stíny pro Bubáky.
  - Zavedena **Boží muka** se zapálenou svící u polních cest jako noční orientační a bezpečné body.
  - Dědečkova **Kachlová kamna** s trvalým hlubokým oranžovým žárem pece odhánějícím strašidla.
- **Doménový model a dokumentace:**
  - Vytvořen záznam architektonického rozhodnutí `docs/adr/0003-ladovske-kvasove-sviceni-a-kompozitni-vrstva-svetla.md`.
  - Do `GLOSSARY.md` doplněny kanonické pojmy: *Petrolejka*, *Kvašová záře*, *Stínová záštita*, *Roubenka*, *Boží muka*, *Kachlová kamna*.
- **Plná verifikace:**
  - Všech 122 testů v 11 testovacích souborech ve Vitestu úspěšných (nové testy `storybookLighting.test.ts` a `gameEngineLighting.test.ts`).
  - Produkční sestavení `npm run build` (`tsc && vite build`) bez jediné chyby.

## 2026-10-10 — Stabilizace integračního stagingu a Ladovská harmonizace

- **Oprava pádu a plné napojení Režiséra výpravy (`RunDirector`):**
  - Implementován robustní adaptér pro `RunDirector.step` v `App.tsx` s podporou `spawnMonster` a `spawnScatterDrop`.
  - Každé zrození nepřítele (běžné vlny, minibossové i taktické přepadové skupiny) je nyní automaticky a přesně zaznamenáno v `recordEnemySpawn`, což zaručuje správný výpočet TTK a dynamické obtížnosti.
  - Vykresleny arénové pasti (`ArenaHazard` — louže bláta, oheň, mráz) a **Bubácká díra** (`BubackaDira`) s kruhovým odpočtem pečetění a vlivem na pohyb hráče.
- **Oprava procedurální Ladovské kinematiky nepřátel:**
  - `drawEnemyRenderer` v `ladaRenderer.ts` nyní transparentně rozpoznává nápřah (`windupTimer`, `aiState === 'windup'`) a úder (`strikeTimer`), čímž se v `App.tsx` poprvé v plné kráse aktivují animace otřesů, náklonů, podkresového prachu a siluet zbraní.
- **Odstranění race condition u Milníků zbraní:**
  - Zaveden `pendingMilestonesRef`, který zabraňuje přepsání stavu `'milestone'` starou uzávěrou po roztočení Malované truhly či nákupu u Čertova dědečka.
- **Sjednocení doménové terminologie a ADR:**
  - Zapsán termín **Bubácká díra** a **Slévání perníčků** do `GLOSSARY.md`.
  - Aktualizován záznam `docs/adr/0001-phased-game-engine-integration.md` pro pravdivý stav Phase-1 Adaptéru.
  - Zapsáno nové architektonické rozhodnutí `docs/adr/0002-konsolidace-rezisera-a-ramec-vykonu.md`.
  - Vyčištěny zakázané výrazy (*mince*, *perků*) v `ControlsModal.tsx`, `hunterUnlocks.ts`, `village.ts` a `KronikaChanges.tsx`.
- **Optimalizace výkonu a konsolidace běhové smyčky (60 FPS stabilizace):**
  - Duplicitní vlnový spawner v `App.tsx` deaktivován; líheň strašidel řízena výhradně Režisérem výpravy (`RunDirector`) s hard-capem 70 monster (45 v Performance Mode) a napojením na denní fáze úrovně.
  - Okamžitá volání `setRunStats` ze smyčky odstraněna; ukazatele se synchronizují dávkově každých 150 ms (`HUD_SYNC_INTERVAL_SECONDS`), čímž se eliminovalo zasekávání Reactu.
  - Aktivováno **Slévání perníčků** (`performDropFusion`) každých 1,5 s se stropem 200 položek mimo obrazovku.
  - Odstraněno přepínání `ctx.globalCompositeOperation = 'source-atop'` a alokace `ctx.getTransform()` v `drawEnemyWarningSign`.
  - Radiální gradienty mlhy předrenderovány do offscreen plátna a částice kresleny v jedné dávce bez individuálních `save/restore`.
  - Plovoucí texty poškození zastropovány na 40 instancí s kumulativním sčítáním rychlých vícečetných zásahů a dávkovým nastavením fontu.
  - Samonavádění včel přepnuto na vyhledání nejbližšího cíle přes `SpatialHash` s přirozenou hmyzí vlnivou trajektorií a ochranou re-entrancie přes `queryCircleInto`.

## 2026-10-09 — Integrační staging: Propojení enginu, sjednocení rendereru a plné ověření

- **Propojení modulárního subsystému do App.tsx:**
  - Napojen Režisér výpravy (`RunDirector`) pro dynamické varovné bannery, pacing fází a sledování TTK a spawnu monster.
  - Implementován herní stav `'milestone'` a zapojena komponenta `WeaponMilestoneModal` pro interaktivní volbu schopností při postupu na milníkové ranky (3, 5 a 8).
  - Použita migrace profilu `migrateMetaProgression` pro automatický převod historických uložených dat na kanonická ID zbraní (`osikovy_prut`, `povidlove_buchty`, `hromnicka`).
- **Sjednocení vykreslování v `ladaRenderer.ts` a `App.tsx`:**
  - Odstraněna duplicitní transformace plátna v `App.tsx`; monstra jsou předávána přímo do `drawEnemyRenderer`.
  - Zapojena moderní Ladovská kinematika (`computeEnemyKinematics`), podkresové prachové stopy, otřesy těl a zbraňové siluety.
  - Zachována specifická větvení pro hlavní bossy (`drak`, `cert`, `mlynar`).
- **Dědečkův obchod (`GrandfatherShop.tsx`):**
  - Normalizována ID zbraní přes `toCanonicalWeaponId`.
  - Přidán dynamický náhled milníků zbraní z `weaponMilestones.ts` a zařazování voleb do fronty (`pendingMilestones`).
  - Doplněna vizualizace vesnické synergie pro Kapli svaté vlny (`churchLevel`).
- **Architektonická dokumentace a slovník:**
  - Založen `GLOSSARY.md` s kanonickou terminologií (*Kuráž*, *Nápřah*, *Milník zbraně*, *Perníčky*, *Krejcar*, *Čertův dědeček*, *Režisér výpravy*).
  - Zapsán záznam architektonického rozhodnutí `docs/adr/0001-phased-game-engine-integration.md`.
- **Plná verifikace prostředí:**
  - `vitest run`: 9 testovacích souborů, všech 104 testů úspěšných.
  - `tsc --noEmit`: 0 chyb, typy `DropType` a zbraní sjednoceny.
  - `eslint .`: konfigurace `eslint.config.js` vytvořena, lint čistý.
  - `npm run build`: produkční bundle Vite úspěšně sestaven.

## 2026-10-08 — Rebalanc startovních zbraní (Level 1) & Benchmark systém

- **Osikový prut (Poutník) posílen na plnohodnotný úderný bič:**
  - Základní poškození zvýšeno z 18 na **28** (+55 %), cooldown zkrácen z 0,80 s na **0,65 s** (teoretické DPS stouplo z 22,5 na **43,1 DPS**).
  - Dosah seku (Reach) rozšířen z 88 px na **115 px** (vytvoření bezpečné 60px zóny před 40px attack dosahy monster), úhel seku rozšířen z 1,55 rad (~89°) na **2,00 rad (~115°)** pro spolehlivé krytí čela i boků.
  - Odhoz zvýšen z 260 na **480** a přidán mikro-flinch (zásah okamžitě zruší rozběhnutý nápřah útočníka `isAttacking = false; windupTimer = 0`).
- **Povidlové buchty (Pasáček) zkroceny na taktickou rozptylovací zbraň:**
  - Počet střel na 1. úrovni snížen z 3 na **1 buchtu** (další střely přibývají s vyšší úrovní: 2 na Lvl 3, 3 na Lvl 5, 4 na Lvl 7).
  - Poškození upraveno na **22**, cooldown na **1,25 s** (teoretické DPS kleslo z 50,0 na **17,6 DPS**).
  - Doba mlsání (Snack) zkrácena z 3,0 s na **1,8 s** a zaveden strop na kumulativní trvání (max. 2,5 s) zabraňující nekonečnému perma-stunu.
- **Česneková topinka proměněna v aktivní obrannou auru:**
  - Základní poškození zvýšeno z 1 na **5** každých 0,35 s (DPS stouplo z 2,86 na **14,3 DPS**).
  - Rarášek (48 HP) je v auře udusen za 3,3 s namísto dřívějších 16,8 s.
  - Odhoz mírně upraven na 300 a přidáno základní 15% zpomalení nepřátel v dosahu.
- **Válečnice vyvážena do mezí startovního rozpočtu (Level 1 Melee Guardian):**
  - Základní poškození upraveno z 52 na **32**, cooldown nápřahu zvýšen z 0,48 s na **0,75 s** (DPS zredukováno ze 108,3 na **42,7 DPS**).
  - Trvání omráčení upraveno z 3,0 s na **1,2 s**, odhoz upraven ze 760 na **520**.
  - Zpomalovací aura na Lvl 1 nastavena na **25 %** (škáluje na 40 % s vyššími hodnostmi a milníky).
- **Zaveden standardizovaný Benchmark (`scripts/benchmark-weapons.ts`):**
  - Implementován deterministický testovací simulátor na 60 FPS enginu pro měření TTK, minimálního odstupu od hráče, průlomu obrany, efektivního DPS a CC času.

## 2026-10-08 — Stabilita běhového prostředí: Oprava duplicitních instancí Reactu ve Vite

- **Garantovaná jediná instance Reactu (Deduplikace závislostí):**
  - Do `vite.config.ts` přidána konfigurace `resolve.dedupe: ['react', 'react-dom']` a `optimizeDeps.include: ['react', 'react-dom', 'react-dom/client']`.
  - Odstraněna chyba `Invalid hook call / TypeError: Cannot read properties of null (reading 'useRef')`, způsobená nesouladem verzí v mezipaměti předkompilovaných modulů Vite.
  - Pročištěna cache prebundlingu a restartován vývojový server s jednotným hashováním.

## 2026-10-08 — Odveta lovců na blízko: Odstrčení bubáka a protiúder za 15 % maximální Kuráže

- **Automatické odstrčení útočníka na blízko (Melee Pushback):**
  - Každý lovec po utrpění zranění na blízko od bubáka nestvůru okamžitě energicky odstrčí pryč ze své bezprostřední blízkosti (okamžitý fyzický posun o 65 px + impuls síly 540).
  - Tím se přeruší zacyklený nápřah nestvůry a hráč získá prostor k manévrování.
- **Zranění rovné 15 % maximální Kuráže lovce:**
  - Lovec při odstrčení udělí bubákovi protiúder, který odpovídá přesně **15 % maximální Kuráže lovce** (např. 30 zranění při výchozích 200 Kuráže, 45 zranění při 300 Kuráže po nákupech a vylepšeních).
- **Ignorování rezistencí (kromě bossů úrovně):**
  - U běžných monster, elit i minibossů rezistence proti tomuto protiúderu ani odhození nefungují — monstra utrpí plných 15 % max Kuráže a jsou plně odstrčena.
  - Výjimkou jsou pouze **hlavní bossové úrovně** (`e.isBoss`), u nichž jejich tuhost (poise) a odolnosti fungují standardně.

## 2026-10-08 — Přímé promítnutí násobitelů do základního zranění nepřátel a posílení pomalých útoků na 3,5×

- **Pomalí nepřátelé posíleni na 3,5× násobek:**
  - Pro těžké pomalé nepřátele a bosse (`umrlec`, `bubak`, `hromotluk`, `stodolnik`, `drevorubec`, `drab`, `zbrojnos`, `obrneny_zbojnik`, `snehulak`, `ohnivy_pes`, `cert`, `hejkal`, `obr`, `mlynar`, `bezhlavy_rytir`, `drak`) byl násobitel poškození zvýšen z dřívějších 2,9× na **3,5× násobek**.
- **Přímý zápis do základních statistik bez separátního rozepisování:**
  - Veškeré násobky poškození (1,0× pro rychlé, 2,2× pro normální a 3,5× pro pomalé) již nejsou počítány jako samostatná dodatečná přirážka ani rozepisovány v popiscích (odstraněny separátní texty `+120 %` a `+190 %`).
  - Místo toho byly násobky **přímo a trvale promítnuty do základní hodnoty `damage`** každého ze 49 nepřátel v databázi `ENEMIES`.
  - Herní engine (`createEnemyInstance`) nyní přebírá toto základní poškození přímo bez dodatečného runtime násobení.
- **Přehlednost v Bestiáři:**
  - V Bestiáři se u probádaných strašidel zobrazuje čistá útočná kadence (*⚡ Útok: Rychlý (0,6 s)*, *⚔️ Útok: Normální (1,2 s)*, *🔨 Útok: Pomalý (1,8 s)*) spolu s přímou skutečnou hodnotou úderu (*💥 Úder: {damage}*).
- **Zachování časování a prodlevy:**
  - Zranění je udělováno až po uplynutí celé prodlevy od prvního kontaktu (0,6 s / 1,2 s / 1,8 s), což dává hráči prostor reagovat a včas uniknout či nepřítele odhodit.

## 2026-10-08 — Poutník: 200 Kuráž, procentuální bonus poškození (+35 %), sjednocení terminologie na Kuráž a revize popisků všech hrdinů

- **Poutník (Tulák) – 200 Kuráže a +35 % poškození:**
  - Základní hodnota zdraví (Kuráže) Poutníka byla navýšena ze 150 na **200 Kuráže**.
  - Poutník nově začíná pouze s **Osikovým prutem** (bez počátečních Povidlových buchet).
  - Bonus *Tulácký instinkt* dává **+35 % ke všem zbraním** (`×1,35`) namísto dřívějšího flat přídavku.
- **Sjednocení herní terminologie (HP ➔ Kuráž):**
  - Veškeré texty, ukazatele, plovoucí texty léčení (`+55 Kuráž`, `+35 Kuráž`, `+6 Kuráž`), ukazatele minibossů, Bestiář i Sandbox byly upraveny tak, aby se namísto zkratky „HP“ nebo „životy“ důsledně používalo české označení **Kuráž**.
- **Kompletní revize a soulad popisků všech 6 lovců s reálnými herními schopnostmi:**
  - **Poutník:** Pověstná sukovice (21 s cooldown, silné odhození zblízka, vyděšení na 4 s na dálku), Kuráž 200, Osikový prut, +35 % poškození.
  - **Pasáček:** Dusot stáda (30 s cooldown, přivolá 22 běžících beranů, 140 plošného fyzického poškození a masivní smetení), vysoká rychlost (220) a obří dosah sběru (160), start s Povidlovými buchtami.
  - **Bába kořenářka:** Očistné kadidlo z devatera bylin (30 s cooldown, +55 kuráže, +30 dočasný štít, 1,8 s nezranitelnost, 120 nature dmg a zpomalení nepřátel na 4,5 s), pasivní obnova +2 kuráže každé 4 s, start s Devaterem kvítí.
  - **Ponocný:** Noční roh a poplach (30 s cooldown, poplach vystraší strašidla na 5 s a udělí 110 fyzického poškození s odhozením), stálá posvátná aura lucerny (16 svatého poškození/s), start s Kovanou halapartnou.
  - **Pobožný kostelník:** Farní požehnání (35 s cooldown, úder zvonu a sloup světla očistí nemrtvé a démony v okruhu 650 px, u bossů ubere 25 % max. kuráže), start s Kropenkou se svěcenou vodou.
  - **Babička a Barunka:** Chléb se solí a vlídné slovo (45 s cooldown, zastavení času, scénka nasytí bubáky či zažene démony dle toho, zda mají nižší odolnost vůči Food nebo Holy), start s Kynutým koláčem s mákem a Barunkou po boku.

## 2026-10-07 — Válečnice: Větší Ladovský sprite (+40 %), dosah úderu (+60 %), 3s omráčení, 20% ignorace odolností a podrobný rozpis ve zbrojnici

- **Zvětšení spritu Válečnice o 40 % (Měřítko postavy):**
  - Měřítko vykreslování Válečnice v modulu `src/render/ladaRenderer.ts` a v herní smyčce bylo navýšeno o 40 % (scale zvýšen z 1,22 na 1,71).
  - Válečnice nyní působí jako statná, nepřehlédnutelná česká hospodyně v červeném puntíkovaném šátku, zelené šněrovačce, bílé zástěře a lidové sukni, která rázně vymetá prostor kolem lovce.
- **Rozšíření dosahu úderu o 60 % (Hitbox Reach 58 px):**
  - Dosah, ve kterém bukový váleček zasahuje okolní bubáky, byl zvětšen o 60 % (ze základních 36 px na 58 px + poloměr monstra, dále škáluje s milníky plošného dosahu).
  - Detekční okruh pro okolní nepřátele byl rozšířen na `orbitRadius + reachBase + 50`, takže Válečnice s jistotou vyčistí široký pás kolem lovce.
- **Prodloužení omráčení na 3,0 sekundy (Stun 3,0 s):**
  - Doba omráčení při zásahu bukovým válečkem byla prodloužena na plné 3,0 sekundy.
  - Zasažení nepřátelé okamžitě přeruší probíhající nápřah k útoku (`windupTimer = 0`, `aiState = idle`), zastaví svůj pohyb a nad hlavami se jim točí ladovské komiksové hvězdičky (💫).
- **Nastavení ignorace odolností na 20 %:**
  - Válečnice nově ignoruje přesně 20 % odolnosti monster (`ignoreResist: 0.20`).
  - Proráží 20 % tuhosti (`poiseResist`), 20 % odolnosti proti odhození (`knockbackResistance`), 20 % vůle proti omráčení (`willpower`) a překonává 20 % redukce zranění i u minibossů.
- **Zpomalení o 40 % v kruhu o 15 % větším než orbit (odolnost dle Vůle):**
  - Kolem lovce se rozprostírá vnější větrná zóna o poloměru o 15 % větším než oběžná dráha Válečnice (základ 132 px, škáluje s plošnými milníky).
  - Všichni nepřátelé v tomto okruhu jsou zpomaleni o 40 %, přičemž míra zpomalení je odolávána parametrem Vůle (`willpower`) daného monstra (se započtením 20% průrazu odolností Válečnice).
  - Na zemi je tato zóna vizualizována oranžovým čárkovaným kruhem a zpomalená monstra zanechávají u nohou vířivou prachovou stopu.
- **Velký patrolní okruh (Orbit 115 px):**
  - Válečnice obíhá lovce ve velkém okruhu o poloměru 115 px (s milníky dosahuje až 160+ px) a na zemi vykresluje ladovskou tečkovanou patrolní stopu.
- **Podrobný výpis statistik ve zbrojnici a knihovně zbraní (Arzenál):**
  - V Zbrojnici (`ArsenalModal`) a detailu odemčení (`WeaponUnlockModal`) přibyl kompletní technický rozpis všech 8 parametrů Válečnice (poškození 52, kadence 0,48 s, stun 3,0 s, průraz 20 %, dosah 58 px, odhoz 760, okruh 115 px, sprite scale 1,71) společně s interaktivním animovaným náhledem.

## 2026-10-07 — Hmotnost nepřátel, zpomalení v davu, klouzavé obtékání a Ladovský varovný nápřah (Fyzika & Bojový systém)

- **Mechanika hmotnosti monster (Enemy Mass & Odpor těl):**
  - Do rozhraní `Enemy` a `EnemyStats` byl zaveden fyzikální parametr hmotnosti `mass` (výchozí hodnota `radius / 15`, u lehkých skřítků cca 0,95–1,0, u těžkých monster, dřevorubců a bossů 2,0–5,0).
  - V herní smyčce se těla nepřátel v těsném kontaktu s lovcem sčítají do celkového odporu davu `totalResistance`.
  - **Efekt lapení při nápřahu:** Pokud monstrum právě provádí nápřah (`isAttacking === true`), jeho lokální odpor se zdvojnásobí, což vytváří věrný pocit, že se lovec v sevření útočícího chumlu nemůže tak snadno vytrhnout.
- **Plynulé zpomalení hráče při průchodu davem (Crowd Drag):**
  - Hráčova vlastní vstupní rychlost je dynamicky tlumena vzorcem $speedMultiplier = \max(MIN\_SPEED\_RATIO, \frac{1}{1 + totalResistance \times DRAG\_COEFFICIENT})$ s koeficientem odporu $0{,}35$.
  - Hráč se nikdy nezastaví na nule – je garantována minimální rychlost $20\,\%$ ($MIN\_SPEED\_RATIO = 0{,}2$), což umožňuje taktické prorážení a manévrování i pod náporem početného hejna.
- **Klouzavé vektorové obtékání a odtlačení (Sliding Pushback):**
  - Implementována prostorová detekce přes `spatialHash.queryRadius(player.x, player.y, player.radius + 35)` v jediném vysoce optimalizovaném průchodu bez alokací na haldě.
  - Pro každé kolidující monstrum se počítá průnik $overlap = (r_{player} + r_{enemy}) - dist$ a akumuluje se odtlačovací vektor $\vec{push} += \frac{\vec{pos}_{player} - \vec{pos}_{enemy}}{dist} \times overlap \times PUSH\_FORCE$ ($PUSH\_FORCE = 6{,}0$).
  - Vektor je bezpečně zastropován na $MAX\_PUSH\_SPEED = 300\text{ px/s}$ a aplikován na pozici lovce: `player.x += (moveVx + pushX) * dt` a `player.y += (moveVy + pushY) * dt`.
  - Hráč tak při kontaktu přirozeně a hladce klouže po obvodu monster a nezasekává se v jejich středech.
- **Telegrafované útoky monster a nápřah (Windup Damage System):**
  - Každý nepřítel má definován dosah úderu `attackRange` (výchozí `radius + 25`) a čas nápřahu `attackDelay` (výchozí `0,5 s` s ohledem na kadenci úderu).
  - Pokud je vzdálenost mezi monstrem a lovcem $\le attackRange$, monstrum přejde do stavu nápřahu (`isAttacking = true`) a inkrementuje se časovač `windupTimer += dt`.
  - Zranění je hráči uděleno až po dokončení celého nápřahu (`windupTimer >= attackDelay`), načež se časovač zresetuje na nulu.
  - **Taktický únik z dosahu:** Pokud hráč stihne uniknout mimo $attackRange$, nápřah postupně opadá dvojnásobnou rychlostí (`windupTimer = Math.max(0, windupTimer - dt * 2)`), a při poklesu na 0 se stav nápřahu zruší.
- **Ladovský výstražný vykřičník – Varianta B (`drawEnemyWarningSign`):**
  - V modulu `src/render/ladaRenderer.ts` byla naimplementována nová funkce pro výstražný symbol nad hlavami útočících nepřátel.
  - **Vizuální styl:** Terčík s ladovskou černou konturou (`#1a120b`), bílým inkoustovým vykřičníkem a barevným přechodem z teplé oranžové (`#f1a834`) do výstražné rudé (`#c82a1e`) při překročení $75\,\%$ nápřahu.
  - V závěrečných $20\,\%$ nápřahu terčík dynamicky zvětšuje své měřítko a pulzuje pro maximální čitelnost nebezpečí.
  - Funkce je volána v renderovací pipeline pro všechna viditelná monstra na obrazovce s aktivním nápřahem.
- **Optimalizace a stabilita 60 FPS:**
  - Všechny výpočty jsou chráněny proti dělení nulou (`dist > 0.0001`), prostorový hash znovupoužívá interní pole bez vytváření dočasných instancí a hra si zachovává plynulých 60 snímků za sekundu i v masivních vlnách nepřátel.

## 2026-10-07 — Tématické rozdělení nepřátel na rychlé, normální a pomalé útoky (Bojový systém & Balance)

- **Tématické rozdělení nepřátel do tří kadencí:**
  - Všech 49 venkovských strašidel a bossů bylo tématicky roztříděno do tří skupin podle jejich ladovského charakteru, váhy a výzbroje:
    1. **Rychle útočící (0,6 s interval, 100 % základní poškození):** Drobná hejna a hbití skřítci (`rarach`, `plivnik`, `sotek`, `zaba`, `zmrzlik`, `skodnik`, `mysak`, `blatouch`, `vanicka`, `bludicka`, `cerny_pes`, `jiskrivec`, `nocni_mura`, `sazovy_rarach`).
    2. **Normálně útočící (1,2 s interval, +120 % zranění / 2,2× násobek):** Standardní kostlivci, vodníci, víly, písaři, mrazíci a lapkové (`skeleton`, `skeleton_scythe`, `krvavy_kostlivec`, `pisar`, `hrobnik`, `hastrman`, `vodnicek`, `topivec`, `ropucha`, `meluzina`, `mrazik`, `severak`, `polednice`, `klekanice`, `divozenka`, `zbojnik`, `certik`, `ohnivy_muz`, `bila_pani`).
    3. **Pomalu útočící (1,8 s interval, +190 % zranění / 2,9× násobek):** Těžcí obři, umrlci s pomalým nápřahem, dřevorubci s širočinou, zbrojnoši v plátech a velcí bossové (`umrlec`, `bubak`, `hromotluk`, `stodolnik`, `drevorubec`, `drab`, `zbrojnos`, `obrneny_zbojnik`, `snehulak`, `ohnivy_pes`, `cert`, `hejkal`, `obr`, `mlynar`, `bezhlavy_rytir`, `drak`).
- **Časování a zranění až po prodlevě:**
  - Interval se začíná odpočítávat v okamžiku prvního kontaktu, avšak zranění je uděleno až po uplynutí této prodlevy (0,6 s pro rychlé, 1,2 s pro normální, 1,8 s pro pomalé nepřátele).
  - **Možnost úniku a přerušení:** Pokud lovec stihne včas uskočit nebo nepřítele odhodit zbraní s odhozem (Válečnice, Česneková topinka, Cep apod.), útok se přeruší a lovec neutrpí žádné poškození.
  - **Vizuální telegraf nápřahu:** Během kontaktu se kolem útočícího nepřítele vykresluje kruhový indikátor nabíjení úderu (žlutý pro rychlé, oranžový pro normální, červený pro pomalé).
  - Při trvalém kontaktu pak další údery následují v tomto stálém intervalu.
- **Audiovizuální odezva:**
  - Zásahy od pomalu útočících těžkých nepřátel a bossů jsou doprovázeny hutným těžkým zvukovým efektem `sound.heavyHit()`.
- **Integrace v Bestiáři:**
  - Každé probádané strašidlo v kronice / bestiáři přehledně zobrazuje štítek s informací o své kadenci a intervalu úderu.

## 2026-10-07 — Oprava dvojitého odpočtu contactTimeru při kontaktu s nepřáteli (Engine & Combat Balance)

- **Podrobná analýza a příčina chyby (Root Cause):**
  - Herní engine udržuje u každého nepřítele vnitřní časovač kontaktu `contactTimer` s výchozím intervalem **0,45 s**, který slouží jako minimální prodleva mezi fyzickými zásahy hráče při těsném dotyku.
  - V herní smyčce však docházelo k tomu, že se `contactTimer` při trvalém kontaktu odčítal o deltu času `dt` **na dvou místech v tomtéž snímku**:
    1. **První odpočet** probíhal v obecné aktualizační metodě nepřítele `e.update(dt, player)` na řádku `if (this.contactTimer > 0) this.contactTimer -= dt;`.
    2. **Druhý odpočet** probíhal bezprostředně poté v kolizní smyčce nepřátel v `App.tsx` na řádku `e.contactTimer = (e.contactTimer || 0) - dt;`.
- **Důsledek pro hratelnost — nechtěně 2× vyšší obdržené poškození za čas (DPS):**
  - Samotná hodnota zranění z jedné rány byla v pořádku, avšak kvůli dvojnásobné rychlosti odpočtu (`2 × dt` za snímek) se interval mezi ranami zkrátil z plánovaných **0,45 s** na pouhých cca **0,22 až 0,23 s**.
  - **Frekvence zásahů tak vzrostla z plánovaných cca 2,2 úderu/s na 4,4 až 5 úderů za sekundu.**
  - **Výsledné poškození za sekundu (DPS), které lovec při kontaktu inkasoval, bylo tedy nezamýšleně dvojnásobné.**
  - Tento bug byl fatální zejména při obklíčení skupinou bubáků (např. 3–4 nepřátelé udíleli neúnosných 15–20 zásahů za sekundu) nebo v soubojích s rychlými nepřáteli a bossy na tělo, kdy lovec ztrácel veškerou Kuráž (HP) během necelé vteřiny bez šance na únik.
- **Implementované řešení:**
  - V kolizní smyčce hráč–nepřítel v `App.tsx` byl odstraněn redundantní řádek `e.contactTimer = (e.contactTimer || 0) - dt;`.
  - Kolizní vyhodnocení nyní pouze bezpečně testuje vypršení časovače: `if ((e.contactTimer || 0) <= 0) { e.contactTimer = 0.45; player.takeDamage(...); }`.
  - Odpočet `contactTimer` o `dt` probíhá striktně jednou za snímek uvnitř `e.update(dt, player)`.
  - Frekvence fyzického zranění při těsném kontaktu nyní přesně odpovídá navrženému intervalu **0,45 s** (cca 2,2 zásahu za sekundu), čímž se efektivní kontaktní poškození bubáků vrátilo na správnou, férovou úroveň.


## 2026-10-07 — Aktualizace průvodce Ovládání a cíl hry, Čertův dědeček a nový arzenál

- **Kompletní přepracování a rozšíření průvodce „Ovládání a cíl hry“:**
  - Vytvořeny přehledné dedikované záložky: *🧓 Čertův dědeček & Nůše*, *⚔️ Nové zbraně & Arzenál*, *🏘️ Vylepšení v hospodě* spolu s aktualizovaným ovládáním, cílem hry a výkonem.
- **Podrobný rozbor mechanik Čertova dědečka a nůše:**
  - Zdokumentovány přesné podmínky spuštění a zjevení: čas výpravy ≥ 25 s, minimální zásoba voňavých perníčků pro nákup (25–35 perníčků) a 25s cooldown po odchodu.
  - Následování lovce po mapě (vzdálenost 220–280 px), zavolání *„Pssst! Perníčky!“* a otevření obchodu klávesou `E`, kliknutím myší či dotykovým tlačítkem.
  - Bezpečné zastavení času při nákupu, garance 1–2 zbraní v nůši (nové zbraně i vylepšení stávajících zbraní až na úroveň 8), čekací sleva až −30 %, vliv statistiky Štěstí (sleva až 20 % a vzácnější nabídky) a progresivní přebalení nůše (Reroll od 4 perníčků).
  - Vysvětlena klíčová posvátná synergie s Kaplí svaté vlny ve vesnici (tlaková vlna 100–500 dmg v okruhu 400 px při každém nákupu v nůši).
- **Zpracování nového arzenálu zbraní v průvodci:**
  - **Válečnice:** Obíhající rázná hospodyně s válečkem, vysoké plošné poškození (34 dmg) a masivní odhoz (knockback 300).
  - **Česneková topinka:** Obranná aromatická aura s brutálním odhozením (knockback 320) a znatelným zpomalením dotírajících nepřátel.
  - **Kyselá okurka:** Vystřelování nakládaných okurek udělující nepřátelům devastující debuff (+35 % až +50 % vyšší zranění ze všech ostatních zbraní).
  - Přehled všech 15 ladovských zbraní včetně buchet, vidlí, halapartny, cepu, včelího roje a posvěcené vody.
- **Aktualizace vylepšení vesnice a ovládání:**
  - Zdokumentovány všechny obecní budovy v hospodě U Černého kocoura a jejich trvalé bonusy za krejcary (včetně Kovářské výhně, Šenkýřova štítu a Kaple svaté vlny).
  - Do ovládání zanesena klávesa `E` pro otevření nůše v terénu, vylepšen popis pauzy `P / Esc`, ultimátních schopností hrdinů na `Mezerníku` a dotykového virtuálního joysticku.

## 2026-10-07 — Oprava pádů Hromničky, aktivace milníků v test módu, vyvážení nůše a stabilizace

- **Oprava kritického pádu Hromničky (TypeError: player.spawnHromnickaPulse is not a function):**
  - Implementována chybějící metoda `player.spawnHromnickaPulse` v `App.tsx` s pulzním posvátným poškozením, odhozem odpuzujícím nepřátele a vyšším poškozením proti nemrtvým a pekelníkům.
  - V `weapons.ts` opraven výpočet zranění Hromničky přes `getWeaponDamage(player, ...)`, aby správně škáloval s perky a poškozením lovce.
- **Aktivace milníků zbraní v Sandboxu a při vylepšení z truhly:**
  - Vytvořena funkce `ensureWeaponMilestones`, která automaticky přiřazuje milníky na úrovních 3, 5 a 8 pro testovací běhy, startovní zbraně i vylepšení z malované truhly.
- **Vyvážení nabídky zbraní v Dědečkově nůši:**
  - Odstraněna jakákoliv speciální přednost pro Česnekovou topinku a Válečnici; všechny zbraně mají v nůši rovné šance (upřednostňují se pouze stávající zbraně, které již lovec nese, aby mohl vylepšovat svůj aktuální arzenál).
  - Odstraněn stale closure a race condition při rychlých nákupech v nůši (`grandfatherPurchaseIdsRef`).
- **Oprava Kaple svaté vlny (vesnická budova Church):**
  - Budova po odstranění starého Level-up systému nefungovala; nyní při každém nákupu v dědečkově nůši vyšle masivní posvátnou tlakovou vlnu (400 px, 100 dmg / úroveň).
- **Škálování cooldownu všech zbraní:**
  - Všechny zbraně (včetně tradičních zbraní bez milníků) nyní správně získávají cooldown bonus při vylepšování úrovně.
- **Opravy UI a ovládání:**
  - Zobrazení vstřebaného poškození štítem (`ŠTÍT POHLTIL! 🛡️`) v plovoucím textu.
  - Přidán `blur` listener na okno prohlížeče, aby při přepnutí okna nezůstaly viset stisknuté klávesy pohybu.
  - Pravidelná synchronizace počtu perníčků do HUDu.

## 2026-10-07 — Oprava zamrzání hry (Canvas save stack leak), stabilizace Dědečka a Pekelného Čerta

- **Oprava kritického zamrzání hry (Canvas state stack overflow):**
  - V procedurální animaci `Lada.drawGrandfather` v `ladaRenderer.ts` chybělo volání `ctx.restore()` na konci bloku trupu a kabátu.
  - V každém snímku docházelo k hromadění neuzavřených `ctx.save()`, což po chvíli vedlo k přetečení zásobníku plátna v prohlížeči, selhání vykreslování kamery a kompletnímu zamrznutí hry.
  - Stav `drawGrandfather` je nyní dokonale vyvážený (15 save / 15 restore).
- **Oprava NaN při pohybu Dědečka:**
  - Odstraněno redundantní a nestabilní dělení `stepX / dt` v `App.tsx`, které při snímcích s nulovou deltou (`dt === 0`) způsobovalo `NaN` v rychlostech a souřadnicích Dědečka a následně zneplatnilo matici Canvasu.
  - Doplněna bezpečná ochrana proti nulové vzdálenosti a automatické přemístění Dědečka, pokud se hráč vzdálí přes 1400 px, aby se neztratil na mapě.
- **Vykreslování světa při otevřené nůši:**
  - Do podmínky vykreslování plátna v `App.tsx` byl přidán herní stav `'grandfather'`. Herní svět za obchodem již nezčerná prázdným `clearRect`, ale zůstává přirozeně viditelný a pozastavený.
- **Pekelný Čert — vylepšení chování a ochrana:**
  - Opraveno natáčení Čerta během telegrafu / windupu: Čert se nyní dívá přímo na hráče (`certFacingVx`), místo natáčení doprava při nulové rychlosti.
  - Odraz hráče při zásahu charge vidlemi je bezpečně ošetřen přes `Number.isFinite`, čímž se zamezilo potenciálnímu poškození pozice hráče.
- **Kyselá okurka (průraz):**
  - Opravena detekce průrazu střel okurky v kolizní smyčce tak, aby zohledňovala vlastnost `pierce` a správně prorážela houfy nepřátel podle získaných milníků.
- **Milníky zbraní a nůše:**
  - Funkce `getRankedWeaponStats` nyní bezpečně vyhodnocuje milníky zbraní jak z pole ID řetězců, tak z objektu mapy ranků, takže upgrady zakoupené u Dědečka ihned poskytují správné bonusy.
  - Ošetřeno bezpečné načítání voleb milníků a v `GrandfatherShop` přidáno korektní zobrazení při vykoupení všech dostupných položek.

## 2026-10-07 — Ladovská animace Dědečka, zbraně v test módu a progresivní reroll nůše

- **Nové zbraně v Testovacím módu (Sandbox):** Do výběru testovacího módu byly přidány **Česneková topinka**, **Válečnice** a **Kyselá okurka** s plnou podporou volby úrovně (0 až 10), dynamickým výpočtem statistik a popiskem zbraně.
- **Dědečkův obchod (nůše):** Garantuje 1–2 zbraně v nabídce s přednostním nabízením Topinky a Válečnice pro rychlé odemčení i vylepšování na vyšší úrovně.
- **Progresivní cena zamíchání nabídky (Reroll):** Tlačítko „Zamíchat nůši“ nyní stojí **4 perníčky** a s každým dalším zamícháním v daném setkání rychle a progresivně zdvojnásobuje svou cenu (**4 → 8 → 16 → 32 → 64... 🍪**). Tlačítko přehledně zobrazuje aktuální cenu a při nedostatku perníčků je deaktivováno.
- **Nová detailní plynulá Ladovská animace Dědečka:**
  - Vytvořena kompletní procedurální animace `Lada.drawGrandfather` přímo do herního plátna vycházející z Ladovské ilustrace kramáře/čertíka:
  - **Kulhavá chůze (limping walk):** Asymetrický krok zohledňující jedno mohutné čertovské kopyto (těžký dopad s vířením prachu a poklesem těla) a jednu šněrovanou koženou botu (měkčí zhoupnutí).
  - **Kouření a bafání z dýmky:** Vyřezávaná dýmka v ústech s cyklem potahování, pulzujícím žhavým uhlíkem a plynule stoupajícími a rozpínajícími se obláčky dýmu.
  - **Gestikulace ke kameře:** Drápatá ruka v perspektivě vstřícně kyne a gestikuluje směrem k hráči/kameře s vlnícím se pohybem prstů zvoucím k nůši.
  - **Ladovské folklórní detaily:** Vroubkované beraní rohy, beranice s beránčí vlnou, červená čertovská tvář s špičatýma ušima, kulaté drátěné brýličky, baňatý nos, mohutný zvlněný stříbrný vous, záplatovaný ovčí kožich s křížkovými stehy, kožená brašna s přezkou a švihající pekelný ocas s chomáčem srsti.
  - **Nůše plná pokladů:** Pletená proutěná kramářská nůše na zádech se setrvačným pohupováním, malovaná truhlička s lidovým ornamentem, svinutá deka, pytel se semínky, zvědavá mrkající polní myška s chvějícími se oušky a houpající se svítící lucernička s konvičkou.
  - **Klikací interakce:** Kliknutím na Dědečka ve světě (či stiskem klávesy `E`) se otevře jeho obchod.

## 2026-10-07 — Rozšíření Dědečkova obchodu (Zbraně & Level Up upgrady) a úprava Polednice

- **Dědečkův obchod (nůše)** nyní náhodně nabízí jakýkoli z předchozích level up upgradů (Krvavé jelito, Opravdová káva, Medvědí mast, Veselá mysl, Toulavé boty, Magnetický měšec, Zabijačková jitrnice, Kynutý koláč, Povidlová buchta) i zbraní (Osikový prut, Česneková topinka, Válečnice, Kyselé okurky, Povidlové buchty a další).
- **Garantovaná zbraň:** V nabídce nůše je vždy garantována alespoň jedna zbraň z dostupného fondu.
- **Nákup a vylepšování zbraní:** Zakoupení neznámé zbraně ji přidá lovci do arzenálu; zakoupení již vlastněné zbraně ji povýší na další úroveň (až do úrovně 8). Karty zbraní přehledně zobrazují aktuální úroveň a označení „Nová zbraň“ či „Vylepšení“.
- **Ikony v nůši:** Všechny položky nůše (včetně ladovských SVG ikon jako Jelito, Topinka, Prut, Káva, Koláč atd.) se vykreslují přes komponentu `GameIcon`.
- **Polednice v 1. úrovni:** Polednice (miniboss i běžný výskyt v 1. úrovni „Náves a rybník Brčálník“) se nyní pohybuje o **15 % pomaleji** (základní rychlost i výpady jsou sníženy na 85 %).

## 2026-10-07 — Perníčkové odměny a živý boss bar

- Každý poražený nepřítel nyní vytváří perníček podle své **herní bodové hodnoty**, místo odvození velikosti perníčku od HP.
- Hodnotová pásma používají **1 / 3 / 10 perníčků** pro malé, velké a obří dropy; bossové dávají vždy obří perníček.
- Boss HP lišta se nyní synchronizuje přímo z živého bosse každých **0,1 s**, takže reaguje průběžně na běžné zásahy a během boje nezamrzá.
- Boss lišta dostala pevnější layout s maximální šířkou **600 px** a minimální výškou **52 px**.

## 2026-10-07 — Dědečkův obchod a perníčková ekonomika

- XP a arénový systém Level Up byly odstraněny z průběhu výpravy; lovec místo XP získává **perníčky** jako běhový zdroj.
- Po porážce nepřátel vznikají perníčkové dropy ve třech velikostech s hodnotami **1 / 3 / 10**; minibossové a bossové dávají větší varianty.
- **Dědečkův obchod** funguje jako nový runový upgrade loop: Dědeček je roaming encounter ve světě a po přiblížení lze otevřít jeho nůši.
- Nabídka obsahuje čtyři náhodné položky, podporuje omezení stacků, **štěstí**, čekací slevu až **30 %** a postupnou cenovou inflaci při dalších nákupech v jednom setkání.
- Přidány nové runové bonusy pro rychlost, damage, dosah sběru, Max Kuráž, regeneraci a štěstí.
- Přidány nové zvuky pro sběr perníčků, přivolání Dědečka a nákup v jeho nůši.
- UI arény nyní zobrazuje zásobu perníčků místo XP lišty; Dědečkův obchod nahrazuje dosavadní výběr upgradeů v aréně.
- Dědečkův roaming landmark a perníčky dostaly vlastní ladovské vykreslení.

> **Source of truth:** aktuální implementace v `src/`. Historické hodnoty, které byly později změněny, nejsou uváděny jako aktuální stav.

## 2026-10-06 — Konsolidace herních změn a sjednocení changelogu

### Aktuální stav systému zbraní
- Čtyři zbraně mají nový **osmirankový progression systém**: Osikový prut, Válečnice, Česneková topinka a Kyselé okurky.
- Ranky **3 / 5 / 8** jsou milestone ranky se dvěma vzájemně výlučnými volbami.
- Ranky **2 / 4 / 6 / 7** mají standardní progres:
  - +12 % damage za rank,
  - +8 procentních bodů weapon cooldown bonusu za rank,
  - +6 % area za rank.
- Interně se základní weapon damage násobí faktorem `1 + (level - 1) × 0,12`; area faktorem `1 + (level - 1) × 0,06`.
- Weapon cooldown používá:
  `baseCooldown / (1 + playerCooldownBonus + weaponCooldownBonus)`
  s minimem **50 % base cooldownu**.
- Milestone cooldown modifikátory se aplikují dodatečně jako násobitel.
- Milestone efekty jsou kumulativní a aktivují se pouze z voleb uložených v `weapon.milestones`.
- Validace vyžaduje přesně 8 ranků, milestone pouze na 3/5/8 a unikátní ID voleb.
- Starý mastery stav zůstává pouze kvůli kompatibilitě uložených her; nové mastery volby se negenerují.
- Tulák má **+30 flat damage ke všem zbraním**, který se přičítá k base damage před globálním damage multiplikátorem.

### Aktuální základní hodnoty čtyř milestone zbraní
| Zbraň | Base damage | Base cooldown |
|---|---:|---:|
| Osikový prut | 18 | 0,80 s |
| Válečnice | 34 | 0,55 s |
| Česneková topinka | 1 | 0,35 s |
| Kyselé okurky | 20 | 1,15 s |

### Aktuální milestone volby
- **Osikový prut**
  - Rank 3: Široký švih / Rázný bác
  - Rank 5: Prut větrník / Pevná násada
  - Rank 8: Prut košťátko / Prachová smršť
- **Válečnice**
  - Rank 3: Válečnický kruh / Rázný váleček
  - Rank 5: Dvojnásobný bác / druhá specializace kruhu
  - Rank 8: Válečnický kruh+ / Velký úklid
- **Česneková topinka**
  - Rank 3: Široký obláček / Silný obláček
  - Rank 5: Těžký obláček / specializace plochy
  - Rank 8: Velký česnekový oblak / Kyselý česnekový bác
- **Kyselé okurky**
  - Rank 3: Křupavá porce / specializace síly
  - Rank 5: Kyselá svačina / specializace síly
  - Rank 8: Velká okurková porce / Kyselý déšť

### Aktuální pasivní bonusy
- **Opravdová káva:** interně +0,1111111111 cooldown bonus; při použitém vzorci to odpovídá přibližně **−10 % efektivního cooldownu**.
- **Krvavé jelito:** `damageMultiplier × 1,15`, tedy **+15 % damage multiplikativně za stack**.
- **Medvědí mast:** **+30 Max Kuráž** a současně +30 aktuální Kuráže při získání.
- **Veselá mysl a písnička:** **+3 Kuráž každých 5 s za stack**.
- **Toulavé boty sedmimílové:** **+20 speed** z level-up volby.
- **Magnetický měšec:** **+30 pickup radius**.
- Truhla má pro Toulavé boty aktuálně samostatnou odměnu **+25 speed**.

### Aktuální drop hodnoty
- Běžná truhla: **29 400 bodů**.
- Potion: **450 bodů**.
- Bread: **250 bodů**.
- Soul: **120 bodů**.
- Coin: **20 bodů**.
- Bossové mají garantovanou boss loot logiku; miniboss při zklidnění generuje vlastní odměny.

### Aktuální miniboss systém
- Miniboss render scale: **1,75×**.
- Miniboss collision radius: **1,65×** základního radiusu.
- Minimální HP minibosse: **1 400**.
- Poise resist minibosse: minimálně **0,82**.
- Food resist minibosse: minimálně **0,78**.
- Willpower minibosse: minimálně **0,85**.
- Damage minibosse se počítá jako `stats.damage × 1,35 × 1,6`.
- Miniboss získává minimálně 25 coin value a 20 XP.
- Minibossové mají vlastní overhead HP, zlatou auru a jsou vizuálně zvětšeni.

### Aktuální opravy gameplay loopu
- Opravena stale-closure chyba herního loopu přes aktuální `gameStateRef` / synchronizované ref hodnoty.
- Dropy se nyní spolehlivě magnetizují a sbírají.
- Kontakt nepřítele s lovcem nyní správně způsobuje damage.
- Útěkový stav má prioritu před běžnou AI a synchronizuje rychlost, směr, pozici i animaci.
- SpatialHash používá aktuální pozice po pohybu nepřátel a je plně typovaný.
- Expirované projektily se ve stejném snímku již neúčastní kolizí.
- Boss HP HUD je oddělen od gameplay `takeDamage()`.
- Neznámé enemy ID vyvolá explicitní chybu.
- Final-boss victory je vázána na skutečného finálního bosse levelu.

## 2026-10-06 — Historické feature změny doplněné při auditu commitů

### Character-specific ultimate scénky
- **Pasáček** dostal příběhovou ultimate scénku se zastavením herního času, zvukem pastýřské píšťalky a následným útokem stáda.
- Ve scénce je vytvořeno **22 ovcí/beranů**; hlavní zásah způsobuje **140 × damageMultiplier** fyzického poškození v dosahu 560 a výrazný knockback.
- Po hlavním zásahu pokračuje po dobu přibližně **3,6 s** pravidelný trample efekt s poškozením **35 × damageMultiplier**.
- **Kořenářka** dostala vlastní příběhovou scénku se zastavením času, zvukem očistného kadidla a bylinným sanctuariem.
- Účinek Kořenářky obnovuje **55 HP**, přidává **30 dočasného štítu**, poskytuje až **1,8 s nezranitelnosti**, způsobuje **120 × damageMultiplier** přírodního poškození v dosahu 480 a aplikuje soak/slow.
- Následné sanctuary trvá **4,8 s**, léčí v pulsech po **6 HP** a způsobuje další **25 × damageMultiplier** přírodního poškození.
- Scénky lze klávesou Space přeskočit/urychlit na jejich účinek nebo dokončit.

### Tulák — Pověstná sukovice
- Ultimate Tuláka byla přepracována na **Pověstnou sukovici**.
- Součástí změny byla úprava cooldown balance a odstranění redundantní spodní lišty speciální schopnosti na dotykových zařízeních.

### Level-up a combat balance
- Výběr level-up odměn byl změněn na strukturu **1 bojová volba + 1 pasivní volba + 1 wildcard volba**.
- Byly současně upraveny hodnoty základních pasiv a vybraných zbraní; výsledný aktuální stav je uveden v hlavní konsolidované sekci výše.

### Balancování nepřátel a pokladů
- V rámci historického balance passu byl práh běžné truhly zvýšen z **9 800 na 29 400 bodů**, čímž se frekvence běžných truhel snížila na třetinu.
- Poškození nepřátel bylo v tomto passu zvýšeno o **60 %**; u minibossů se tato změna promítla do jejich výsledného damage vzorce uvedeného výše.

### Přejmenování zbraně
- **Vrbový prut** byl přejmenován na **Osikový prut** a název byl sjednocen napříč daty, UI, popisy a ikonami.

### Rozšíření postav a levelů
- Do hry byly přidány postavy **Kostelník** a **Babička** včetně jejich zvukových efektů a speciálních schopností.
- Progres levelů byl rozšířen z původních 3 na **6 herních úrovní**.
- Byl rozšířen systém průběžné synchronizace statistik a vítězného přechodu do výsledkové obrazovky.

### Registry hry
- Audit registru bestiáře potvrdil **49 registrovaných enemy položek**, přičemž číslo zahrnuje i variantní/posílené nepřátele.
- Počet zbraní v UI byl sjednocen přímo s registrem `WEAPONS`; aktuálně je registrováno **12 zbraní**.

## 2026-10-05 — Bossové a minibossové
- Pekelný čert dostal výrazný charge s windupem, zvýšenou rychlostí, telegrafem, nárazem a brake fází.
- Prokletý sněhulák byl přejmenován na Zlomyslného sněhuláka a dostal vlastní renderer.
- Bossové a minibossové dostali vlastní ladovské rendery namísto generických sprite fallbacků.
- Tříhlavý drak dostal samostatné animace a útoky jednotlivých hlav.

## 2026-10-05 — Drop systém
- Zavedena variabilní tematická afinity dropů podle kategorií nepřátel.
- Přidány přímé náhodné dropy.
- Usmíření jídlem může vytvářet bonusové odměny.
- Bossové vytvářejí velkou fontánu kořisti.
- Dropy používají fyzikální rozptyl.
- Mince mají více nominálních hodnot.

## 2026-10-04 — Vizuální a obsahové úpravy
- Kynutý koláč dostal nový renderer a SVG grafiku.
- Léčivá buchta byla nahrazena hruškou.
- Svatovítský balzám byl nahrazen jitrnicí.
- Přidány ladovské dekorace HUDu, karet a modálů.
- Čert dostal nový sprite, animace, rohy, oči, jazyk, ocas a jiskry.
- Čert byl na titulní obrazovce přesunut na pravou stranu nápisu Bubákov.

## 2026-10-03 — HUD a mobilní ovládání
- Přidán horní ukazatel Kuráže a XP.
- HUD byl omezen pro mobilní viewport.
- Odstraněna duplicitní lišta speciální schopnosti na dotykových zařízeních.
- Touch controls respektují `100dvh`, `visualViewport` a safe-area insety.
- Přidána podpora landscape a velmi úzkých displejů.

## 2026-10-02 — Performance
- Přidán prostorový hash pro broad-phase collision queries.
- Přidán living-enemy snapshot.
- Použity squared-distance testy.
- Přidáno viewport culling.
- Přidán in-place cleanup entit.
- SpatialHash byl následně přepracován na znovupoužitelný numerický index s retenčními buffery.
- Přidán frame-time clamp proti simulačním burstům.

## 2026-10-04 — Testovací režim
- Zbraně lze v sandboxu nastavit až na úroveň 0.
- Zbraň úrovně 0 se nepovažuje za aktivní.
- Sandbox vyžaduje alespoň jednu aktivní zbraň.

## 2026-10-07 — Doplnění historie a odstranění Plánu kol změn z hry

### Historické feature změny doplněné z původního Plánu kol změn
- **v16.0.0:** Výběr výpravy/kraje byl oddělen do samostatného prvního kroku; následný výběr lovce má vlastní obrazovku se zachovanou informací o zvolené výpravě.
- **v15.0.0:** Sandbox umožňuje volné testování lovců, krajin a zbraní; přidáno bezpečné úplné vymazání postupu včetně odemykání, rozvoje vesnice, pokladny, dušiček a bestiáře.
- **v14.0.0:** Rozšířena pauza hry o P/Esc, arzenál, statistiky a čas přežití; přidán samostatný průvodce ovládáním a cílem hry.
- **v12.0.0:** Připraven soběstačný offline export hry v jednom souboru včetně zabudovaných zdrojů pro další úpravy.
- **v10.0.0:** Bestiář dostal postupný systém výzkumu a odhalování informací v několika úrovních.
- **v9.0.0:** Krajiny dostaly postupný systém průzkumu a odemykání včetně alternativní cesty přes poražení předchozího bosse.
- **v11.0.0:** Zaveden důraz na vysoký kontrast a čitelnost textů v ladovských HUD panelech; historické hodnoty balancu z tohoto passu nejsou považovány za aktuální stav.

### Hráčské rozhraní
- Samostatný **Plán kol změn (1.–16. kolo)** byl odstraněn z herního rozhraní.
- Hra nyní zobrazuje pouze **Kroniku Bubákova**, která obsahuje hráčsky čitelné historické zápisy.
- Kronika byla rozšířena o důležité historické feature změny převzaté z původního Plánu kol změn.

## 2026-10-13 — Zapnuté efekty, karty lovců a pasiv Kořenářky

- Přidána trvalá nabídka „Zapnuté efekty“ s hlavním vypínačem a kategoriemi pro dynamické osvětlení, bojové VFX, varovné značky, prefixy bubáků, popisy útoků, ukazatele stavů, oznámení o odemčení, zvukové efekty a hudbu.
- Vypínání efektů ovlivňuje vykreslování a zvuk, nikoli herní simulaci: poškození, kolize, stavy, odemykání, pohyb projektilů a sbírání dropů pokračují. Starší uložené profily mají všechny nové kategorie ve výchozím zapnutém stavu.
- Odemčené karty lovců nově zobrazují základní statistiky, počáteční zbraň, pasivní schopnost a podrobný popis zvláštní schopnosti. Přidána samostatná rolovatelná informační karta.
- Kořenářce byl základní magnet snížen o 75 % (před bonusy vesnice a usnadnění). Každých 9 sekund se vyléčí až o 18 % maximální Kuráže a na 3 sekundy získá pětinásobný dosah magnetu, pětinásobnou rychlost přitahování dropů a nezranitelnost.

## 2026-10-13 — Kořenářka ×5 a mrazivá aura skřítka

- Bylinný záblesk Kořenářky nyní na 3 sekundy násobí dosah magnetu i rychlost přitahování dropů hodnotou 5; oznámení i popisy schopnosti tomu odpovídají.
- Mrazivý skřítek má auru s dosahem zvětšeným o 55 % (78 → 120,9 px); vykreslená aura používá stejný poloměr jako bojový účinek.
- Každý aktivní Mrazivý skřítek v dosahu snižuje získané léčení o 20 procentních bodů. Více skřítků se sčítá a snížení je omezeno na 100 %. Penalty platí pro pasivní regeneraci i léčení předměty/oblastmi; neblokuje změnu maximální Kuráže samotnou.
- Stejný koeficient ovlivňuje i obnovu Kuráže z jednorázových bonusů: navýšení maxima se provede vždy, ale doplnění aktuální Kuráže (včetně Ananasu a bonusů z truhel) je zkráceno podle aktivní aury.
- Přidány unit testy rozsahu, kumulace mrazivé aury a jejího vlivu na Ananasové léčení.
## 2026-10-13 — Balancování rozvoje vesnice a svaté výzbroje

- Obecní přirážka k cenám staveb snížena z 30 % na 20 % za každou zakoupenou úroveň.
- Šenkýřova kuráž zlevněna na 50 kr a přepracována na plynulý bonus k poškození úměrný chybějící Kuráži: až +25 % za úroveň při nulové Kuráži.
- Kamenné hradby stojí 75 kr; dávají +20 maximální Kuráže a +3 % odolnosti za úroveň, nejvýše 30 %.
- Bylinková zahrádka stojí 50 kr a regeneruje +4 Kuráže každých 5 sekund za úroveň.
- Kaple svaté vlny stojí 30 kr a při nákupu u Dědečka způsobuje 150 svatého poškození za úroveň v okruhu 400 px; její karta uvádí také +8 % svatého poškození za úroveň.
- Herní engine nyní uplatňuje pasivní bonus Kaple svaté vlny (+8 % svatého poškození za úroveň) na všechna svatá poškození; testováno samostatným testem.
- Aktualizována očekávání ekonomických testů a test inicializace hradeb podle nového balancu.
- Opraveny regresní testy: nová 20% přirážka, přepočet refundací, spojité škálování Šenkýřovy kuráže, strop hradeb a nové maximum Kuráže.
- Test kaple porovnává stejného nepřítele s nulovou a druhou úrovní kaple, aby izoloval přesný bonus +16 % i při nepřátelské svaté odolnosti.
- Upraven test pasivního svatého bonusu tak, aby přesně porovnával úroveň 0 a 2 a ověřoval násobek 1,16.
- Hráčská runtime data nyní nesou násobič svatého poškození Kaple svaté vlny (1 + 0,08 × úroveň); přidán cílený test úrovní 0/1/2.
