import React from 'react';
import { GameIcon } from './GameIcon';

type KronikaEntry = {
  date: string;
  title: string;
  summary: string;
  items: string[];
};

const KRONIKA: KronikaEntry[] = [
  {
    date: '20. října 2026',
    title: 'Výkonnostní optimalizace arény: 60 FPS zátěžový benchmark, rozpočty entit a Ghost rezervoár',
    summary: 'Kompletní implementace všech fází optimalizačního plánu pro udržení stabilních 60 FPS (p95 pod 16,7 ms). Zaveden deterministický zátěžový benchmark, modulární renderovací pipeline s izolovaným Y-bufferem, škrcení prostorových dotazů, centrální rozpočty částic a Ghost rezervoár zamezující zahlcení bojiště dropy bez ztráty jediné suroviny.',
    items: [
      '⚡ Deterministický zátěžový benchmark: Přidán benchmark ověřující p50/p95 časy snímku pro profily performance, balanced a fidelity. Výsledky garantují p95 hluboko pod 16,7 ms i při desítkách aktivních entit.',
      '🎨 Modulární renderovací pipeline: Vykreslování kořisti, částic, střel a varovných zón bossů vyčleněno do samostatných frustum-culled modulů. Předalokovaný Y-buffer je izolován v instanci ArenaRendereru s nulovými mezialokacemi.',
      '⏱️ Škrcení drahých prostorových dotazů: Hromnička, Svatý kruh a Saze počítají prostorové dotazy na 10 Hz s časovou akumulací. Kontaktní odezva a pohyb zůstávají na plných 60 Hz.',
      '✨ Rozpočty částic a bezalokační emitování: Zaveden centrální správce částic s tvrdými stropy podle grafického profilu (60/120/250) bránící zahlcení paměti v husté vřavě.',
      '👻 Ghost rezervoár pro hejna bubáků: Přebytečné dropy z hejn se kumulují a kondenzují do hodnotnějších svazků. Testy garantují 100% zachování nominální hodnoty perníčků, mincí i zkušeností.',
      '🖼️ Úsporný profil obrazu (0,75×): V profilu performance se plátno rasterizuje v interním rozlišení 0,75× s automatickou korekcí kurzoru a vypnutím náročných reliéfů a okluderů.',
      '💬 WordStamp mezipaměť a statické portréty: GlyphAtlas cachuje celá často používaná slova (KRIT!, MINUL!, ODRAZ!), zamčené portréty lovců v nabídce se předrenderují offscreen a byl spuštěn pilotní sprite baker pro raracha, myšáka a bludičku.',
      '🧪 Pro testery: v Nastavení zvolte profil Plynulý (60 FPS) a ověřte bezchybný chod arény s desítkami nepřátel a stabilní hodnoty získaných surovin.',
    ],
  },
  {
    date: '16. října 2026',
    title: 'Optimalizace kvašového svícení, eliminace Gaussian blurů a zrychlení herní smyčky',
    summary: 'Důkladná revize výkonu bojové arény při vysokých počtech monster a v nočních fázích. Odstraněny náročné Gaussian blury z kreseb monster a projektilů, světelný buffer rasterizuje stíny ve 4× nižším rozlišení, dropy a projektily se čerpají z mezipaměti sprite bitmap a stínoví nepřátelé mimo obrazovku již nezatěžují procesor raycasty.',
    items: [
      '🕯️ Rychlé kvašové svícení bez zbytečných mezipamětí: Světla bez překážek se kreslí přímo do polovičního bufferu. Pomocný stínový buffer zmenšen na 0.5× rozlišení pro 75% úsporu pixelových operací.',
      '✨ Pre-renderovaný Bloom a viněta strachu: Noční záře světel i celoobrazovková viněta strachu při nízké Kuráži využívají cachované bitmapy namísto per-frame generování radiálních gradientů.',
      '🚫 Úplná eliminace ctx.shadowBlur z postav i střel: Z kreseb Hejkala, Obra, Klekánice, Čerta, Draka, Rytíře a projektilů byly odstraněny neukončené Gaussian blury, které způsobovaly propady FPS na 15–20 snímků.',
      '👁️ Ochrana procesoru před mimobrazovkovými stíny: Stínoví nepřátelé i Bludičky mimo dohled lovce (distToPlayer > 850 px) zcela přeskakují raycasty a stínové výpočty. Na obrazovce jsou raycasty throttlovány na 0,10–0,15 s.',
      '⚡ O(1) správa světel a sloučení vykreslovacích průchodů: Opraven únik paměti Bludiček, trvalá světla se nehledají lineárními skeny a trojnásobné procházení nepřátel při vykreslování bylo sloučeno do jediného rychlého průchodu.',
      '🍪 Sprite caching pro dropy a projektily: Perníčky všech 3 velikostí, kyselá okurka, včela, sněhová koule i svěcená kapka se vykreslují z předpřipravených off-screen sprite pláten.',
      '🧪 Pro testery: ověřte stabilních 60 FPS v noční fázi s desítkami monster na obrazovce, při salvách střel a rvačce s dudáckým oblakem.',
    ],
  },
  {
    date: '16. října 2026',
    title: 'Výkonnostní pipeline arény: ChunkBitmapCache, GlyphAtlas a plynulý Canvas 2D',
    summary: 'Kompletní optimalizace vykreslovací pipeline bojové arény při 100% zachování autentické ladovské kresby. Statické kulisy se kreslí z bitmapových dlaždic, texty poškození z runového atlasu a osvětlení šetří 75 % pixelových výpočtů.',
    items: [
      '🖼️ ChunkBitmapCache pro statické kulisy: Roubenky, boží muka a stromy jsou pre-renderovány do bitmapových bloků 512×512 px. Při posunu kamery se vykreslují bleskově jediným příkazem drawImage s automatickým přepečením nočních světel oken.',
      '🔢 Bleskový GlyphAtlas bez sekání: Čísla zranění a bojové symboly se čerpají z předpřipraveného atlasu glyphů s tušovou konturou, čímž odpadá jakékoliv zpomalování prohlížeče úklidem paměti (GC).',
      '🕯️ 0.5× Kvašová záře s bilineárním vyhlazením: Noční tma a světlo petrolejky se počítají v polovičním rozlišení a promítají přes bilineární filtr – ušetřeno 75 % výpočtů bez ztráty měkké pohádkové atmosféry.',
      '⚡ Řazení hloubky bez alokací: Vykreslování stovek potvor podle hloubky (Y-sort) využívá znovupoužitelné paměťové buffery. Žádné vytváření zbytečných polí v každém snímku.',
      '🏛️ Kánon a ADR 0017: Zdokumentováno architektonické rozhodnutí zachovávající ryzí Canvas 2D technologii a odmítající generické WebGL herní enginy.',
      '🧪 Pro testery: v aréně sledujte plynulost při 100+ strašidlech a ověřte bezchybné zobrazení chalup, nočních stínů a bojových textů.',
    ],
  },
  {
    date: '15. října 2026',
    title: 'Bojové plovoucí texty: 9 kategorií zobrazení, předvolby a optimalizace výkonu',
    summary: 'Kompletní kontrola nad texty v bojové aréně. Hráč si může zaškrtnutím vybrat z 9 samostatných kategorií textu pro nerušený výhled na bojiště a maximální snímkovou frekvenci (FPS).',
    items: [
      '💬 9 samostatně přepínatelných kategorií: Číselná zranění nepřátel, Zranění Kuráže lovce, Léčení a obnova Kuráže, Bojové reakce a stavy, Názvy nápřahů a útoků, Bojové pokřiky a atmosféra, Zisky kořisti a surovin, Odemčení a milníky a Globální oznámení a bossové.',
      '⚡ Tři rychlé předvolby: Plná atmosféra (vše ZAP), Taktický režim (pouze bojová čísla a stavy) a Čistý výkon (veškeré texty VYP pro maximální FPS i na slabých telefonech).',
      '⏸️ Okamžitá úprava přímo v boji: Tlačítko „💬 Texty v boji“ a rychlý ukazatel předvolby v okně Pauzy (Esc) umožňují okamžité přizpůsobení uprostřed výpravy.',
      '🚀 Rychlá O(1) filtrace a šetření paměti: Odstraněny pomalé regulární výrazy, vypnuté kategorie zamezují zbytečným alokacím objektů a zátěži Canvasu.',
      '🧪 Pro testery: v Pauze otevřete Texty v boji, přepněte na Taktický režim nebo Čistý výkon a ověřte, že v aréně okamžitě zmizí příslušné texty bez vlivu na herní pravidla.',
    ],
  },
  {
    date: '13. října 2026',
    title: 'Začlenění přívlastků do taktických formací a balanc bleskového odrazu',
    summary: 'Při vyšší dynamické obtížnosti (3,50× a více) velí taktickým formacím strašidla s bojovými přívlastky. Bleskový odraz Hromových běsů má bezpečnostní strop proti nechtěnému sebezničení a Vyčerpaný bubák dostal autentické potácení a unavenou auru.',
    items: [
      '🎖️ Velitelé formací s přívlastky: Na dynamické obtížnosti 3,50× a výše přiřazuje Režisér velitelům taktických formací (Klešťové sevření, Kladivo a kovadlina, Drtivý přepad) tematické bojové přívlastky podle nátury kraje a rozmaru.',
      '⚡ Bezpečnostní strop bleskového odrazu: Odražené poškození Hromového přívlastku je zastropováno na nejvýše 25 % maximální Kuráže lovce s vnitřním cooldownem 0,25 s. Silný zásah zblízka tak lovce okamžitě nezahubí.',
      '🥱 Potácení a ospalá aura Vyčerpaného: Vyčerpaní běsové se po bojišti viditelně klátí a potácejí, doprovázeni unavenou ladovskou aurou a poletujícími spánkovými symboly.',
      '📖 Záložka Přívlastků v Bestiáři: Do Bestiáře přibyla samostatná encyklopedická sekce se živým náhledem všech elitních i záchranných přívlastků, popisem jejich nátury a loveckou taktikou.',
      '🧪 Pro testery: ověřte, že velitel formace na obtížnosti 3,5+ nese přívlastek, a vyzkoušejte silný úder do Hromového bubáka těsně u sebe – odraz nesmí překročit čtvrtinu vaší celkové Kuráže.',
    ],
  },
  {
    date: '13. října 2026',
    title: 'Sjednocení rejdového rozpočtu, Dvojče minibosse a záchranný přívlastek Vyčerpaný',
    summary: 'Režisér výpravy nově oceňuje strašidla jednotnou hodnotou odpovídající jejich dropům. Na nejvyšší obtížnosti trestá přemíru úspěchu přivoláním Dvojčete minibosse, zatímco v tísni nabízí pomocnou ruku v podobě Vyčerpaných monster.',
    items: [
      '⚖️ Sjednocení bodového rozpočtu: Každý bubák stojí Režiséra přesně tolik bodů rozpočtu hrozeb, jaká je jeho hodnota pro výpočet odměn a perníčků (ENEMY_POINTS).',
      '👑 Dvojče minibosse na extrémní obtížnosti: Pokud na obtížnosti 4,50× a vyšší lovec drtivě dominuje aréně (dominance 0,70+), Režisér za 30 bodů rozpočtu povolá trestné Dvojče minibosse se zlatou korunkou.',
      '🕊️ Poklid za pecí bez trestání: Na mírné obtížnosti do 2,00× Režisér hráče za úspěch vůbec netrestá – násobitel tlaku zůstává pevně zastropován na 1,00× a Dvojče minibosse se nikdy nezjeví.',
      '🛟 Progresivní asistence a Vyčerpaný přívlastek: V tísni (nízká Kuráž a dominance) Režisér plynule nasazuje Vyčerpané bubáky (-50 % rychlost, -50 % útok, -50 % životy), jejichž kořist a perníčky zůstávají plně zachovány.',
      '📱 Přehledný výhled na bojiště: Výstrahy a oznámení Režiséra se nově zobrazují výhradně v horní liště HUDu, aby nikdy nezakrývaly dění kolem lovce ani na menších obrazovkách telefonů.',
      '🧪 Pro testery: při vysoké dominanci na obtížnosti 4,5+ sledujte příchod Dvojčete; naopak při poklesu Kuráže pod 25 % ověřte výskyt zesláblých Vyčerpaných monster.',
    ],
  },
  {
    date: '13. října 2026',
    title: 'Dědečkova nůše, folklórní předměty a chytré odměny z padlých běsů',
    summary: 'Rozšíření výbavy o autentické lidové relikvie, ladovské ilustrace a chytré vyhodnocování dropů perníčků i záchranných pokrmů.',
    items: [
      '🎒 Nové folklórní předměty: Kovářská podkova, Hliněný kohoutek, Vyřezávané kukačky, Trouba ponocného, Řehtačka, Kropenatá zástěra, Hlt slivovice, Kominický knoflík i Arcivzácný ananas.',
      '🍍 Ladovská kresba ananasu a relikvií: Originální kvašová podoba Arcivzácného ananasu se smaragdovou korunkou a diamantovým křížkováním, stejně jako kovářské podkovy a kukaček.',
      '🩹 Chytré záchranné kapky: Pokud Kuráž klesne pod 25 %, padlé kořisti automaticky upřednostňují léčivé buchty a jitrnice namísto útočných cetek.',
      '🔥 Horké perníčky z dálky a Overkill: Zahánění monster na dálku a drtivé údery spojují malé perníčky do výživnějších větších odměn bez zahlcení obrazovky.',
      '🌐 Kompletní dvojjazyčný překlad: Všechny předměty a hlášky Dědečka jsou plně lokalizovány v češtině i angličtině.',
    ],
  },
  {
    date: '11. října 2026',
    title: 'Režisér výpravy: obtížnost reaguje na hráče a drží se tématu krajiny',
    summary: 'Zvolená obtížnost určuje základní náročnost, zatímco Režisér průběžně vyhodnocuje Kuráž a skutečně zaznamenaná zabití. Současně vybírá nepřátele podle aktivní úrovně a denní fáze.',
    items: [
      '🎚️ Sedm předvoleb obtížnosti: 2,00× Poklid za pecí až 5,00× Pekelné boží dopuštění. Výchozí volba je 3,00× Zlověstná noc.',
      '🫶 Přiměřený tlak: Adaptivní násobitel rozpočtu se postupně pohybuje mezi 0,72× a 1,12×. Nízká Kuráž spolu se slabší dominancí tlak tlumí; vysoká Kuráž, silná dominance a alespoň tři zaznamenaná zabití mohou tlak mírně zvýšit. Zvolená předvolba se tím nemění.',
      '🛑 Když se lovci nedaří, aktivní asistence omezuje těžké formace, prefixované nepřátele i posilování existujících běsů. Bez záznamu zabití se čerstvá výprava automaticky nepovažuje za snadno vyhrávanou.',
      '🧭 Tematické posily: fond odpovídá krajině a denní fázi; povolené elitní varianty vycházejí jen z nepřátel dané fáze a bossové se nepřimíchávají do běžného taktického fondu.',
      '↗️ Osm směrů znamená osm úhlů rozmístění kolem lovce, nikoli osm sektorů mapy. Při limitu 75 živých nepřátel se další entity nepřidávají; přebytečný rozpočet může posílit existujícího běsa.',
      '🧪 Pro testery: ověřte pokles tlaku při nízké Kuráži a dominanci, mírné zvýšení po několika rychlých zabitích při vysoké Kuráži a to, že asistence potlačí i formaci architektů. Aktuální hodnota je dostupná v telemetrii Režiséra jako pressureMultiplier.'
    ],
  },
  {
    date: '11. října 2026',
    title: 'Čtyři elitní prefixy a trestání opakovaného kroužení',
    summary: 'Elitní prefixy dávají stejnému nepříteli odlišnou bojovou roli. Pekelný prefix navíc reaguje na dlouhé kitingové úniky a čitelně varuje před nebezpečnou puklinou.',
    items: [
      '💨 Vichřicový: +110 rychlosti a 50% šance vyhnout se zásahu.',
      '⚡ Hromový: +70 rychlosti a blesková odveta ve výši 50 % utrženého poškození, pokud je lovec do 200 px.',
      '🪨 Kamenný: pohybuje se na 80 % běžné rychlosti, snižuje příchozí poškození o 91 % a odolává omráčení i omračujícím účinkům jídla.',
      '🔥 Pekelný: při vzdáleném kitingu získává 15 % rychlosti za sekundu až do +120 % a při přiblížení se bonus vynuluje. Za sebou zanechává magmatické louže na 9 sekund, které způsobují 6 poškození.',
      '⚠️ Při přímém běhu lovce po 2,5 sekundách vytvoří Pekelný puklinu 200–250 px před jeho směrem. Puklina varuje 1,2 sekundy a následně jednorázově udělí 24 poškození.',
      '🧪 Všechny prefixy stojí 15 bodů rozpočtu hrozeb; běžný taktický nepřítel 3. Tester může ověřit hranici odrazu Hromového na 200/201 px a strop rychlosti Pekelného +120 %.'
    ],
  },
  {
    date: '11. října 2026',
    title: 'Spravedlivá hodnota kořisti a bezpečné načtení postupu',
    summary: 'Slučování dropů kvůli výkonu nesmí ubírat ani přidávat hodnotu odměn. Načítání uloženého profilu nově bezpečně odmítá neplatné identifikátory úrovní.',
    items: [
      '🤎 Tři velké perníčky se při slučování spojí do obřího s hodnotou součtu skutečných dropů. Například 6 + 6 + 6 = 18; hodnota se nenahrazuje pevnou částkou 20.',
      '🗺️ Uložená úroveň musí být celé číslo od 0 do 6. Neplatná, zlomková nebo mimo rozsah ležící hodnota bezpečně přejde na výchozí úroveň 0.',
      '🛟 Když prohlížeč zablokuje přístup k localStorage, hra pokračuje s výchozím profilem místo pádu při načítání.',
      '🧪 Test: překročte limit dropů velkým množstvím předmětů mimo obrazovku a zkontrolujte, že jejich sloučená hodnota zůstane zachována.'
    ],
  },
  {
    date: '11. října 2026',
    title: 'Obecní přirážka: rozvoj vsi zdražuje další nákupy',
    summary: 'Vylepšení vesnice používají společnou přirážku, která se počítá ze všech dříve pořízených úrovní budov. Rozpočet lze stále celý přerozdělit.',
    items: [
      '🏡 Každá dříve zakoupená úroveň jakékoli budovy přidává k základní ceně dalšího vylepšení 30 % základní ceny. Čím rozvinutější vesnice, tím dražší další nákup napříč všemi budovami.',
      '🔄 U Dědečka zůstává bezplatné 100% vrácení investovaných krejcarů, takže je možné přerozdělit rozvoj vsi podle aktuálního sestavení.',
      '🧪 Pro testery: nákup první úrovně by neměl ovlivnit jen další úroveň téže budovy; sdílená přirážka se vztahuje také na nákup jiné budovy.'
    ],
  },
  {
    date: '10. října 2026',
    title: 'Ladovské kvašové svícení: světlo chrání před stínovou záštitou',
    summary: 'Osvětlení používá malované tonální vrstvy a tušové kontury místo nákladného rozmazávání velkého množství světelných přechodů. Světlo má také přímý bojový význam.',
    items: [
      '🏮 Petrolejka lovce mění dosah podle Kuráže, nejvýše přibližně 225 px. V kritickém stavu působí světlo slaběji a okolní obraz ztemní.',
      '🌑 Strašidla ve stínu získávají rychlost a odolnost; vstup do světla jejich stínovou záštitu ruší a krátce je rozhodí.',
      '🎨 Vykreslení používá 3–4 zřetelné kvašové tónové pásy a tušové tečkování či šrafování po hranách, aby si hra zachovala pohádkový rukopis i při velkém počtu entit.',
      '🧪 Při výkonovém testu porovnejte plynulost při větším počtu nepřátel a ověřte, že světlo mění stínovou obranu, nejen vzhled scény.'
    ],
  },
  {
    date: '9. října 2026',
    title: 'Začátečnická úroveň: 0. Předjaří v Hrusicích (Tutorial & Prologue)',
    summary: 'Do hry přibyla nová výchozí úroveň Předjaří v Hrusicích. Březnové tající kry, probuzené žabky a vodníci vytvářejí vlídné prostředí pro první krůčky nového hráče, doplněné o interaktivní dřevěnou káču, léčivá babiččina kamna a jarní tání.',
    items: [
      '🌱 Výchozí začátečnická úroveň: Úroveň 0. Předjaří v Hrusicích nabízí klidnější tempo (délka 2–3 minuty) a bezpečné seznámení s pohybem, uhýbáním a zbraněmi.',
      '🐸 Výuková křivka bossů: Miniboss Probuzená Žába (30 s, ~220 HP), Jarní Vodníček (75 s, ~400 HP) a finální Vodník z tajících ker (120 s, ~500 HP) s mechanikou Březnová povodeň.',
      '🧊 Interaktivní tající kry: Plující ledové kry na řece pozvolna unášejí lovce i potvory ve směru proudu.',
      '🌀 Dřevěná káča: Roztočená lidová káča, kterou lze kopnutím vrhnout proti davu monster a zraňovat je.',
      '👵 Babiččina kamna: Teplá kachlová kamna s babičkou v šátku, kde si lovec v duchu rčení „Březen, za kamna vlezem“ zahřátím doplňuje Kuráž.',
      '🌿 Jarní ladovská atmosféra: Svěží rašící vrby s kočičkami, tání na řece a jemné poletování třpytivých ledových krystalků ve vánku.',
      '🎭 Plné zapojení do Režiséra výpravy: 3 folklórní Rozmary (Rychlé Tání, Jarní Probuzení, Březnový Chlad), integrace do Testovacího módu i kompletní lokalizace (CZ/EN).',
    ],
  },
  {
    date: '8. října 2026',
    title: 'Stabilita běhového prostředí: Sjednocení instancí Reactu a spolehlivý chod',
    summary: 'Oprava inicializace Reactu v sestavovacím prostředí Vite. Konfigurace zajišťuje striktně jedinou instanci Reactu v celé aplikaci a eliminuje chyby spojené s mezipamětí.',
    items: [
      '⚙️ Striktní deduplikace React balíčků: Do konfigurace Vite přidáno vynucené sjednocení react a react-dom, které garantuje společný interní kontext pro všechny komponenty a hooky.',
      '🧹 Vyčištění předkompilovaných modulů: Odstraněny zastaralé moduly z mezipaměti, které způsobovaly kolizi různých verzí v prohlížeči.',
      '🚀 Stabilní a plynulý start aplikace: Veškeré herní komponenty a animace nyní startují okamžitě bez výpadků.',
    ],
  },
  {
    date: '8. října 2026',
    title: 'Odveta lovců na blízko: Odstrčení bubáka a 15 % maximální Kuráže lovce',
    summary: 'Každý lovec po zranění na blízko nestvůru energicky odhodí pryč a udělí jí protiúder odpovídající přesně 15 % své maximální Kuráže. Proti tomuto odstrčení i zranění u běžných monster a minibossů nefungují žádné rezistence – odolávají pouze hlavní bossové jednotlivých úrovní.',
    items: [
      '🛡️ Automatické odstrčení při zranění na blízko: Kdykoliv je libovolný lovec zraněn úderem či kontaktem strašidla zblízka, okamžitě bubáka prudce odrazí a odstrčí zpět do bezpečné vzdálenosti.',
      '💥 Protiúder za 15 % maximální Kuráže: Lovec útočníkovi uštědří zranění odpovídající 15 % své maximální Kuráže (např. 30 zranění při 200 Kuráži, 45 zranění při 300 Kuráži).',
      '⚡ Rezistence nefungují (kromě bossů levelu): Běžní bubáci, elity i minibossové jsou plně odhozeni a obdrží plnou hodnotu zranění bez ohledu na tuhost (poise) či odolnosti. Rezistence fungují výhradně pro finální bossy úrovní.',
      '⏱️ Taktický prostor: Odstrčení okamžitě přeruší další kontaktní nápřah nestvůry a zabrání zacyklení zranění při obklíčení v chumlu.',
    ],
  },
  {
    date: '8. října 2026',
    title: 'Přímé započtení násobitelů do základního zranění a 3,5× úder pomalých nepřátel',
    summary: 'U pomalu útočících nepřátel a bossů byl násobitel zranění zvýšen na 3,5×. Všechny násobky poškození se již nepíší zvlášť, ale jsou přímo promítnuty do základního zranění každého strašidla v datech i v Bestiáři.',
    items: [
      '🔨 Pomalí nepřátelé posíleni na 3,5× základní poškození: Těžcí kolosy, umrlci s pomalým nápřahem, dřevorubci se širočinou, zbrojnoši a velcí bossové (Bubák, Hromotluk, Hejkal, Skalní obr, Mlynář, Bezhlavý rytíř, Drak) nově udílejí drtivý 3,5× násobek původního zranění.',
      '⚔️ Přímý zápis do základních statistik nepřátel: Násobky poškození (2,2× u normálních a 3,5× u pomalých) se již nerozepisují zvlášť jako umělé procentuální přirážky, ale přímo tvoří reálné základní poškození (damage) v Bestiáři a databázi nepřátel.',
      '📖 Čistý zápis v Bestiáři: V Bestiáři a kronice se u strašidel uvádí čistá útočná kadence (Rychlý 0,6 s, Normální 1,2 s, Pomalý 1,8 s) a přehledná skutečná hodnota úderu.',
      '⏱️ Zachování férové prodlevy: Zranění dopadá až po uplynutí příslušné prodlevy od prvního kontaktu (0,6 s / 1,2 s / 1,8 s) a hráč má prostor včas uskočit či monstrum odhodit.',
    ],
  },
  {
    date: '8. října 2026',
    title: 'Poutník: 200 Kuráže, +35 % poškození, sjednocení pojmu Kuráž a revize všech hrdinů',
    summary: 'Poutník (Tulák) vstupuje do boje s navýšenou Kuráží (200), procentuálním bonusem poškození +35 % a čistým startem s Osikovým prutem. Herní terminologie byla plošně sjednocena na pojem Kuráž namísto HP a popisy všech šesti lovců byly detailně zrevidovány podle jejich reálných schopností.',
    items: [
      '🦁 Poutník začíná s 200 Kuráže: Výchozí hodnota Kuráže byla navýšena ze 150 na 200, což lovci poskytuje solidní základ pro delší výpravy do nočních blat.',
      '🗡️ Startovní výzbroj bez Buchet: Poutník začíná pouze se svou ikonickou zbraní Osikový prut. Povidlové buchty zůstávají v nůši Dědečka a ve výbavě Pasáčka.',
      '💥 Tulácký instinkt dává +35 % poškození: Původní flat bonus (+30) byl změněn na plnohodnotný procentuální násobitel +35 % (×1,35) pro všechny zbraně i schopnost Pověstná sukovice.',
      '🛡️ Herní pojem Kuráž namísto HP: V celé hře, na HUDu, v plovoucích textech uzdravení (+55 Kuráž, +35 Kuráž, +6 Kuráž), na lištách minibossů i v Bestiáři byl plošně zaveden pojem Kuráž.',
      '📜 Detailní revize popisků všech 6 lovců: Popisy schopností v kartách postav, odemykání, Sandboxu i v nápovědě ovládání byly kompletně sjednoceny s reálnými herními parametry a cooldowny.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Válečnice: Větší sprite (+40 %), dosah úderu (+60 %), 3s omráčení a 20% ignorace odolností',
    summary: 'Kompletní posílení a detailní rozpis Válečnice v knihovně zbraní: o 40 % větší sprite hospodyně, dosah úderu válečku rozšířen o 60 % na 58 px, doba omráčení prodloužena na 3 sekundy a ignorace odolností nastavena na 20 %.',
    items: [
      '👵 Větší Ladovský sprite (+40 %): Vizuální měřítko rázné hospodyně bylo zvětšeno o 40 % (scale z 1,22 na 1,71). Na bojišti působí jako nepřehlédnutelná statná hrdinka.',
      '📏 O 60 % větší dosah úderu (58 px): Akční rádius, ve kterém bukový váleček zasahuje nepřátele, byl navýšen o 60 % ze 36 px na 58 px (+ poloměr monstra).',
      '💫 Omráčení trvá 3,0 s: Každý zásah válečkem znehybní bubáky na 3 celé sekundy, okamžitě přeruší jejich nápřah k útoku a roztočí jim nad hlavami komiksové hvězdičky.',
      '🛡️ Ignorace odolností nastavena na 20 %: Válečnice nově ignoruje přesně 20 % tuhosti (poise), odolnosti proti odhození i vůle monster a částečně proráží redukci u minibossů.',
      '🌪️ Zpomalení o 40 % v kruhu o 15 % větším než orbit: V okruhu 132 px kolem lovce jsou všichni nepřátelé zpomaleni o 40 % (odolává se statistikou Vůle se započtením 20% ignorace Válečnice).',
      '⭕ Velký patrolní okruh (115 px): Válečnice obíhá lovce ve velkém kruhu o poloměru 115 px a drží nepřátele v uctivé vzdálenosti.',
      '📖 Podrobný výpis statistik v knihovně zbraní: Ve Zbrojnici i detailu zbraně je k dispozici kompletní rozpis všech parametrů a interaktivní animovaný náhled.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Hmotnost nepřátel, zpomalení v davu, klouzavé obtékání a varovný nápřah',
    summary: 'Kompletní fyzikální simulace hmotnosti monster: lovec je přirozeně brzděn davem, těla nepřátel ho klouzavě obtékají a nápřahy útoků jsou doprovázeny ladovským výstražným vykřičníkem.',
    items: [
      '⚖️ Fyzikální hmotnost monster: Každé strašidlo má nyní autentickou váhu (lehcí skřítci cca 1 kg, těžká monstra a velcí bossové 2–5 kg). Odpor těl v kolizi s lovcem se sčítá do celkového brzdného odporu davu.',
      '🛑 Zpomalení při průchodu davem (Crowd Drag): Procházení hordou nepřátel lovce dynamicky zpomaluje podle celkové váhy těl. Minimální rychlost je však garantována na 20 %, takže lovec nezamrzne a může se z chumlu prorvat.',
      '🕸️ Efekt sevření při nápřahu: Pokud monstrum v těsné blízkosti právě provádí nápřah k úderu, jeho lokální odpor se zdvojnásobí, což simuluje snahu nestvůry sevřít a lapit lovce na místě.',
      '🔄 Klouzavé vektorové obtékání (Sliding Pushback): Kolizní systém v jediném průchodu bez záseků plynule vytlačuje lovce ven z těl nepřátel rychlostí až 300 px/s, takže lovec přirozeně klouže po obvodu monster a neuvízne uvnitř nich.',
      '⏱️ Telegrafované zpožděné útoky (Windup Damage): Monstrum zahajuje nápřah, jakmile se lovec přiblíží do jeho dosahu. Poškození dopadne až po dokončení celého nápřahu. Včasným ústupem z dosahu nápřah rychle vyprchá a úder je zmařen.',
      '❗ Ladovský výstražný vykřičník (Varianta B): Nad hlavami útočících monster se během nápřahu rozsvěcí ladovský varovný terčík s černou konturou, bílým vykřičníkem a barevným přechodem z teplé oranžové do výstražné rudé, který v závěru pulzuje.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Vyvážení speciálních útoků řadových bubáků (+30 % nápřah a cooldown)',
    summary: 'Všem bubákům kromě bossů a minibossů byla prodloužena doba nápřahu i cooldown speciálních schopností o 30 %, což dává lovci férový čas k reakci a úskoku.',
    items: [
      '⏳ +30 % k době nápřahu (windup): Řadoví i elitní bubáci (Kostlivci, Písař, Hrobník, Umrlec, Černý pes, Vodníček, Meluzína, Polednice, Bezhlavý rytíř, Sněhulák, Dráb, Zbojník, Bílá paní, Noční můra, Klekánice, Zbrojnoš, Dřevorubec, Ohnivý muž atd.) se před provedením speciálního výpadu, vrhu či seknutí napřahují o 30 % déle s viditelným varovným telegrafem.',
      '⏱️ +30 % k době zotavení (cooldown): Interval mezi opakovaným použitím speciálních dovedností a projektilů byl prodloužen o 30 %, takže nepřátelé v davu nespamují nebezpečné výpady příliš často za sebou.',
      '👑 Zachování síly bossů a minibossů: Hlavní šéfové jednotlivých úrovní (Pekelný čert, Hejkal, Skalní obr, Mlynář, Bezhlavý rytíř, Tříhlavý drak) a minibossové si ponechávají své původní nekompromisní časování i zuřivost.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Tématická kadence útoků bubáků a zranění po prodlevě (Bojový systém)',
    summary: 'Nepřátelé jsou nově tématicky rozděleni na rychle, normálně a pomalu útočící. Zranění je uděleno až po uplynutí prodlevy od prvního kontaktu s vizuálním telegrafem nápřahu.',
    items: [
      '⚡ Rychle útočící bubáci (0,6 s): Drobná hejna a hbití skřítci (Rarášek, Plivník, Šotek, Žabka, Zmrzlík, Veverčák, Myšák, Blatouch, Vánička, Bludička, Černý pes, Jiskřivec, Noční můra, Sazový rarášek) útočí v prodlevě 0,6 s se základním zraněním (1,0×).',
      '⚔️ Normálně útočící bubáci (1,2 s, +120 %): Kostlivci, vodníci, víly, písaři a lapkové (Kostlivec, Kostlivec s kosou, Červený kostlivec, Písař, Hrobník, Hastrman, Vodníček, Topivec, Ropucha, Meluzína, Mrazík, Severák, Polednice, Klekánice, Divoženka, Zbojník, Čertík, Ohnivý muž, Bílá paní) útočí v prodlevě 1,2 s a udělují +120 % zranění (2,2× násobek).',
      '🔨 Pomalu útočící kolosy a bossové (1,8 s, +190 %): Těžcí umrlci, Bubák, Hromotluk, Stodolník, Dřevorubec se širočinou, Dráb, Zbrojnoš, Obrněný hejtman lapků, Sněhulák, Ohnivý pes a všichni velcí bossové (Pekelný Čert, Hejkal, Skalní obr, Mlynář, Bezhlavý rytíř, Drak) mají mohutnou prodlevu 1,8 s a drtivé zranění +190 % (2,9× násobek).',
      '⏱️ Zranění uděleno až po prodlevě: Interval se počítá od okamžiku prvního kontaktu, ale poškození dopadne až po uplynutí celé prodlevy. Lovec má reálný čas reagovat a útokům se včas vyhnout.',
      '🛡️ Taktický úskok a odhození: Pokud hráč před vypršením prodlevy ustoupí nebo nepřítele odhodí zbraní s odhozem (Válečnice, Česneková topinka, Cep apod.), útok je přerušen a lovec neutrpí žádné poškození.',
      '⭕ Vizuální telegraf nápřahu: Během kontaktu se kolem útočícího nepřítele vykresluje kruhový indikátor nabíjení úderu (žlutý pro rychlé, oranžový pro normální, červený pro pomalé).',
      '🔊 Zvukový dopad těžkých ran: Údery pomalých kolosů a bossů doprovází hutný zvukový efekt těžkého zásahu sound.heavyHit().',
      '📖 Bestiář a Kronika: V kronice i bestiáři je u všech 49 strašidel přehledně zanesena jejich útočná kadence, interval nápřahu a bonus k poškození.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Oprava dvojitého odpočtu kontaktu nepřátel (Combat Balance)',
    summary: 'Odstraněna chyba zdvojeného odpočtu contactTimeru v enginu. Zranění za sekundu (DPS) při kontaktu s bubáky bylo nechtěně 2× vyšší a nyní je opraveno.',
    items: [
      '⏱️ Oprava dvojitého odpočtu: V enginu se contactTimer odečítal dvakrát v tomtéž snímku (v e.update i v kolizní smyčce), což zkracovalo interval mezi ranami z 0,45 s na pouhých 0,22 s.',
      '💥 Nechtěně dvojnásobné DPS: Bubáci udíleli 4–5 ran/s místo plánovaných cca 2,2 ran/s, takže poškození v čase (DPS) bylo přesně 2× vyšší, což vedlo k bleskové smrti při obklíčení davem i proti bossům.',
      '🛡️ Normalizace zranění: Interval je nyní pevně stanoven na 0,45 s (cca 2,2 úderu/s), kontaktové poškození je férové a lovec má prostor na manévrování.',
      '⚔️ Čistá kolizní smyčka: Redundantní odečet z kolizní detekce v App.tsx byl odstraněn a časování je plně řízeno z aktualizačního cyklu nepřítele.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Aktualizace průvodce ovládáním a Čertův dědeček',
    summary: 'Kompletní aktualizace herního průvodce o Čertova dědečka, nůši, nový arzenál zbraní a obecní vylepšení.',
    items: [
      '🧓 Čertův dědeček a nůše: Podrobně popsány podmínky zjevení (od 25 s hry při dostatku perníčků), následování lovce po mapě, otevření nůše klávesou E i 25s cooldown.',
      '🤎 Mechaniky nůše: Vysvětlena čekací sleva až −30 %, vliv statistiky Štěstí na ceny i vzácnost, progresivní cena zamíchání nabídky a synergie s Kaplí svaté vlny.',
      '⚔️ Nové zbraně v průvodci: Do přehledu arzenálu zařazeny Válečnice (obíhající hospodyně s odhozem), Česneková topinka (obranné aroma s odhozením) a Kyselá okurka (debuff +35 % až +50 % dmg).',
      '🏘️ Rozvoj vesnice: Zdokumentovány všechny obecní budovy v hospodě U Černého kocoura včetně Kovářské výhně, Šenkýřova štítu a Kaple svaté vlny.',
      '🕹️ Ovládání a cíl hry: Doplněna klávesa E pro otevření nůše, podrobný rozpis ultimátních schopností na mezerníku, pauza P/Esc i dotykové ovládání na mobilu.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Oprava pádů Hromničky a stabilizace arzenálu',
    summary: 'Odstranění pádů Hromničky, vyvážení Dědečkovy nůše a aktivace milníků v test módu.',
    items: [
      '🕯️ Opraven kritický pád při střelbě Hromničkou (doplněna pulzní posvátná vlna s odhozem).',
      '🌟 V Sandboxu/Test módu a z truhly se nyní automaticky aktivují rank 3, 5 a 8 milníky.',
      '🧺 V Dědečkově nůši byl vyvážen výběr zbraní tak, aby upřednostňoval nesené zbraně a nezablokoval fond.',
      '⛪ Kaple svaté vlny ve vesnici nyní funguje i v novém perníčkovém systému (svatá tlaková vlna při nákupu).',
      '🛡️ Plovoucí text nyní zřetelně zobrazuje vstřebání úderu šenkýřovým štítem.',
      '⌨️ Při přepnutí okna (Alt-Tab / klik mimo) se již nezasekne chůze.',
    ],
  },
  {
    date: '7. října 2026',
    title: 'Nová struktura výběru výpravy a lovce',
    summary: 'Výprava a lovec se vybírají ve dvou samostatných krocích.',
    items: [
      '🗺️ Nejprve hráč vybírá jednu ze 6 výprav/krajů na samostatné přehledové obrazovce s atmosférou, monstry, ročním obdobím, bossem a výzvami.',
      '🏹 Poté následuje samostatný výběr lovce; zvolená výprava zůstává viditelná a lze se k ní vrátit.',
      '🎨 Výběr lovců používá živé ladovské medailony a výbavu odpovídající zvolené výpravě.',
    ],}
  ,
  {
    date: '7. října 2026',
    title: 'Konsolidace Kroniky změn',
    summary: 'Kronika ve hře byla sjednocena s aktuálním vývojářským changelogem.',
    items: [
      '📜 Hráčská Kronika změn nyní vychází z aktuální historie skutečných herních změn.',
      '⚔️ Nejnovější systém zbraní, milestone upgrady a aktuální balance jsou vedeny jako herní novinky.',
      '🐛 Historické opravy, změny bossů, dropů, postav a výkonu jsou uvedeny v samostatných datovaných zápisech.',
    ],}
  ,
  {
    date: '6. října 2026',
    title: 'Zbraně, mastery a combat systém',
    summary: 'Velký zásah do progrese zbraní a combat balance.',
    items: [
      '⚔️ Čtyři hlavní zbraně mají osmirankový progression systém s milestone volbami na ranku 3, 5 a 8.',
      '💥 Standardní ranky přidávají damage, cooldown a area; milestone volby dávají speciální efekty.',
      '🧭 Tulák získává +35 % poškození ke všem zbraním a začíná s 200 Kuráže.',
      '🧹 Starý mastery stav zůstává pouze kvůli kompatibilitě uložených her; nové mastery volby se negenerují.',
      '☕ Opravdová káva, Krvavé jelito, Medvědí mast, Veselá mysl a písnička, Toulavé boty a Magnetický měšec mají sjednocené aktuální hodnoty.',
      '🎁 Aktualizovány hodnoty truhel, potionů, chleba, duší a mincí.',
      '👹 Minibossové dostali vlastní škálování, resistence, ukazatel Kuráže, zlatou auru a posílený damage model.',
      '🐛 Opraveny důležité části gameplay loopu: stale closure, magnetizace dropů, kontakt s nepřítelem, útěková AI, SpatialHash, projektily a boss victory logika.',
      '🎬 Pasáček a Kořenářka dostali vlastní příběhové ultimate scénky.',
      '🪵 Tulákova ultimate byla přepracována na Pověstnou sukovici.',
      '🏆 Level-up byl sjednocen na bojovou volbu + pasivní volbu + wildcard.',
      '💰 Běžná truhla má aktuálně 29 400 bodů.',
      '🧟 Registry byly auditovány: 49 enemy položek a 12 registrovaných zbraní.',
    ],}
  ,
  {
    date: '6. října 2026',
    title: 'Nové úrovně, bestiář a odemykání krajin',
    summary: 'Bubákov se rozrostl na šest krajin a dostal postupný systém průzkumu.',
    items: [
      '🗺️ Přibyly úrovně 4–6: Staré hamry a Čertův mlýn, Pustá Hláska a Zlenické podhradí a Dračí sluj pod Melechovskou skálou.',
      '👹 Bestiář byl rozšířen o nová monstra a tři výrazné titánské bossy s vlastními mechanikami.',
      '🔐 Krajiny se odemykají postupným průzkumem, případně poražením bosse předchozí úrovně.',
      '🧑‍🌾 Do družiny přibyli Kostelník a Babička, každý s vlastními zvuky a speciálními schopnostmi.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Pauza, ovládání a průvodce lovce',
    summary: 'Hra dostala bezpečnou pauzu a samostatný průvodce ovládáním.',
    items: [
      '⏸️ Hru lze během výpravy pozastavit klávesou P nebo Esc; pauza zobrazuje arzenál, statistiky a čas přežití.',
      '🎮 V hlavní nabídce a hospodě je dostupné tlačítko Ovládání hry.',
      '📜 Průvodce vysvětluje pohyb, automatické útoky, dotykový joystick, průběh pěti fází noci a rozvoj vesnice.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Sandbox a bezpečné vymazání postupu',
    summary: 'Testování hry se oddělilo od běžného postupu a přibyl úplný reset.',
    items: [
      '🧪 Sandbox umožňuje testovat libovolného lovce, krajinu, startovní zbraně a jejich úrovně.',
      '🗑️ Vymazání postupu má potvrzení a resetuje odemykání hrdinů, krajin a zbraní i rozvoj vesnice, pokladnu, dušičky a bestiář.',
    ],}
  ,
  {
    date: '5. října 2026',
    title: 'Bossové, minibossové a dropy',
    summary: 'Rozšíření výrazných nepřátel a fyzikálnějšího systému kořisti.',
    items: [
      '👹 Pekelný čert dostal výrazný charge s windupem, telegrafem, nárazem a brake fází.',
      '☃️ Prokletý sněhulák byl přejmenován na Zlomyslného sněhuláka a dostal vlastní renderer.',
      '🎨 Bossové a minibossové dostali vlastní ladovské rendery.',
      '🐉 Tříhlavý drak dostal samostatné animace a útoky jednotlivých hlav.',
      '🎁 Dropy získaly tematické afinity, přímé náhodné dropy, bonusy za usmíření jídlem a bossí fontány kořisti.',
      '🪙 Krejcary mají více nominálních hodnot a dropy používají fyzikální rozptyl.',
    ],}
  ,
  {
    date: '4. října 2026',
    title: 'Samostatná offline hra',
    summary: 'Hra byla připravena jako soběstačný offline export.',
    items: [
      '📄 Samostatný export obsahuje kompletní hru a zdrojové soubory v jednom souboru.',
      '🤖 Zdrojový strom lze z exportu znovu získat pro další úpravy a práci s AI nástroji.',
    ],}
  ,
  {
    date: '4. října 2026',
    title: 'Vizuál, obsah a testovací režim',
    summary: 'Velká sada vizuálních úprav a změn pro testování hry.',
    items: [
      '🥧 Kynutý koláč dostal nový renderer a SVG grafiku.',
      '🍐 Léčivá buchta byla nahrazena hruškou a Svatovítský balzám jitrnicí.',
      '🎨 HUD, karty a modály dostaly ladovské dekorace.',
      '😈 Čert dostal nový sprite, animace, rohy, oči, jazyk, ocas a jiskry.',
      '📱 Čert byl na titulní obrazovce přesunut na pravou stranu nápisu Bubákov.',
      '🧪 Zbraně lze v sandboxu nastavit až na úroveň 0; úroveň 0 není aktivní a sandbox vyžaduje alespoň jednu aktivní zbraň.',
    ],}
  ,
  {
    date: '3. října 2026',
    title: 'Postupný průzkum a Bestiář',
    summary: 'Objevování krajin a bestiáře dostalo vícefázový systém odhalování.',
    items: [
      '🔎 Krajiny se postupně odhalují v pěti stavech od neznámé mapy až po úplný přehled.',
      '📖 Bestiář odhaluje původ, slabiny, odměny, přednosti a nakonec kompletní folklorní zápis.',
    ],}
  ,
  {
    date: '3. října 2026',
    title: 'HUD a mobilní ovládání',
    summary: 'Úpravy čitelnosti a ovládání na mobilních zařízeních.',
    items: [
      '💪 Přidán horní ukazatel Kuráže a XP.',
      '📱 HUD byl přizpůsoben mobilnímu viewportu.',
      '🎮 Touch controls respektují 100dvh, visualViewport a safe-area insety.',
      '📐 Přidána podpora landscape režimu a velmi úzkých displejů.',
      '⏸️ Duplicitní lišta speciální schopnosti byla na dotykových zařízeních odstraněna.',
    ],}
  ,
  {
    date: '2. října 2026',
    title: 'Výkon a stabilita enginu',
    summary: 'Optimalizace herního loopu pro plynulejší simulaci většího počtu entit.',
    items: [
      '⚡ Přidán prostorový hash pro broad-phase collision queries.',
      '🧟 Přidán living-enemy snapshot a squared-distance testy.',
      '👁️ Přidán viewport culling.',
      '🧹 Přidán in-place cleanup entit.',
      '🗂️ SpatialHash byl přepracován na znovupoužitelný numerický index s retenčními buffery.',
      '⏱️ Přidán frame-time clamp proti simulačním burstům.',
    ],
  },
];

export function KronikaChanges() {
  return (
    <div
      className="changelog-list"
      style={{
        maxHeight: '450px',
        overflowY: 'auto',
        color: '#000000',
        padding: '12px',
      }}
    >
      <div
        style={{
          background: '#FFF8E7',
          border: '3px solid var(--ink)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '14px',
          boxShadow: '3px 3px 0 var(--ink)',
        }}
      >
        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#C53026' }}>
          📜 Kronika změn Bubákova
        </div>
        <div style={{ marginTop: '4px', fontWeight: 700, lineHeight: 1.4 }}>
          Zápisky o tom, co se v Bubákově skutečně změnilo. Nejnovější zápis je vždy nahoře.
        </div>
      </div>

      {KRONIKA.map((entry) => (
        <article
          key={entry.date + entry.title}
          className="plan-card"
          style={{
            background: '#FAF6ED',
            border: '3px solid var(--ink)',
            color: '#000000',
          }}
        >
          <div className="plan-header">
            <div>
              <div
                style={{
                  color: '#8A4B08',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {entry.date}
              </div>
              <h3 style={{ color: '#000000', marginTop: '2px' }}>{entry.title}</h3>
            </div>
            <span
              className="plan-badge-done"
              style={{ background: '#3D7843', color: '#FFFFFF' }}
            >
              Zapsáno
            </span>
          </div>

          <p
            style={{
              margin: '4px 0 10px',
              fontWeight: 800,
              color: '#3D2210',
              lineHeight: 1.35,
            }}
          >
            {entry.summary}
          </p>

          <ul className="plan-items" style={{ color: '#000000', listStyleType: 'none', paddingLeft: 0 }}>
            {entry.items.map((item) => {
              const match = item.match(/^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{FE0F}]+)\s*(.*)$/u);
              if (match) {
                const [, emoji, text] = match;
                return (
                  <li key={item} style={{ color: '#000000', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: '2px' }}>
                      <GameIcon icon={emoji} size={16} />
                    </span>
                    <span>{text}</span>
                  </li>
                );
              }
              return (
                <li key={item} style={{ color: '#000000', marginBottom: '4px' }}>
                  {item}
                </li>
              );
            })}
          </ul>
        </article>
      ))}

      <div
        style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 800,
          opacity: 0.75,
          padding: '8px 4px 2px',
        }}
      >
        Historie je vedena podle aktuálního vývojářského changelogu.
      </div>
    </div>
  );
}
