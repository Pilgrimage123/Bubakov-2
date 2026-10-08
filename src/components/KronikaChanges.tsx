import React from 'react';

type KronikaEntry = {
  date: string;
  title: string;
  summary: string;
  items: string[];
};

const KRONIKA: KronikaEntry[] = [
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
      '🍪 Mechaniky nůše: Vysvětlena čekací sleva až −30 %, vliv statistiky Štěstí na ceny i vzácnost, progresivní cena zamíchání nabídky a synergie s Kaplí svaté vlny.',
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
      '🪙 Mince mají více nominálních hodnot a dropy používají fyzikální rozptyl.',
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

          <ul className="plan-items" style={{ color: '#000000' }}>
            {entry.items.map((item) => (
              <li key={item} style={{ color: '#000000' }}>
                {item}
              </li>
            ))}
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
