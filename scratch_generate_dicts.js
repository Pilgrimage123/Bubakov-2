import fs from 'node:fs';

function parseLocaleFile(path) {
  const code = fs.readFileSync(path, 'utf8');
  // Strip export const cs: Record<string, string> =
  const jsonish = code.replace(/export const \w+: Record<string, string> = /, 'return ');
  return new Function(jsonish)();
}

const existingCs = parseLocaleFile('src/i18n/locales/cs.ts');
const existingEn = parseLocaleFile('src/i18n/locales/en.ts');

// We will build complete dictionaries
const newCs = { ...existingCs };
const newEn = { ...existingEn };

// 1. Levels (1..6)
const levelDataCs = {
  1: {
    name: '1. Náves a rybník Brčálník',
    short_title: 'Náves a rybník',
    subtitle: 'Zlatavý podzim, skotačivá havěť a rybniční rejdy',
    badge: '1. Úroveň',
    description: 'Slunce ozařuje hrusické doškové střechy. Na mezích šmejdí rarášci a z rybníka Brčálníku vylézají nenechaví vodníci.',
    lore: 'Klidné venkovské odpoledne narušily divoké rejdy. Zažeňte polní a rybniční potvory a vykažte z hospodské náse samotného Pekelného Čerta!',
    unlock_requirement: 'Výchozí úroveň – otevřena pro každého poutníka',
    mini_name: '☀️ Polednice se srpem',
    mini_warn: '☀️ POZOR: PŘICHÁZÍ MOCNÁ POLEDNICE SE SRPEM! ☀️',
    mid_name: '💧 Hastrman z Brčálníku',
    mid_warn: '💧 POZOR: Z HLUBIN VYSTUPUJE VELKÝ HASTRMAN! 💧',
    final_name: '👹 Pekelný Čert s vidlemi',
    final_warn: '⚠️ PŘICHÁZÍ ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Vesničané hlásí rarášky a žáby kolem rybníka.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Zlatavý podzim s padajícím listím a divokými potvorami.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Z hlubin rybníka vystupuje Hastrman a v dálce dupe Pekelný Čert.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Cesta na náves a rybník Brčálník je plně probádána!' },
    }
  },
  2: {
    name: '2. Starý hřbitov a Hrusický hvozd',
    short_title: 'Hřbitov a hvozd',
    subtitle: 'Sychravá mlha, náhrobky, noční stíny a Půlnoční Hejkal',
    badge: '2. Úroveň',
    description: 'Mlha stoupá mezi mechem obrostlými kříži. Ze starých hrobů vstávají kostlivci a v temném hvozdu děsivě volá Hejkal.',
    lore: 'O půlnoci ožívá starý hřbitov pod kostelem. Zažeňte hřbitovní běsy a utkejte se s obávaným vládcem hvozdu!',
    unlock_requirement: 'Přemožte Pekelného Čerta na 1. úrovni',
    mini_name: '🔔 Večerní Klekánice',
    mini_warn: '🔔 POZOR: ZVONÍ KLEKÁNÍ A PŘICHÁZÍ DĚSIVÁ KLEKÁNICE! 🔔',
    mid_name: '⛓️ Pekelný dráb s karabáčem',
    mid_warn: '⛓️ POZOR: PŘICHÁZÍ OBŘÍ PEKELNÝ DRÁB S ŘETĚZY! ⛓️',
    final_name: '🌲 Půlnoční Hejkal z hvozdů',
    final_warn: '🌲 PŘICHÁZÍ ŠÉF ÚROVNĚ: PŮLNOČNÍ HEJKAL! 🌲',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Hrobník spatřil první neklidné umrlce na hřbitově.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Sychravá mlha stoupá mezi náhrobky a lesem zní děsivé vytí.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Večerní Klekánice a Pekelný dráb střeží cestu k Hejkalovi.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Starý hřbitov a Hrusický hvozd jsou trvale otevřeny!' },
    }
  },
  3: {
    name: '3. Ladovská zima na Melechově',
    short_title: 'Ladovská zima',
    subtitle: 'Třeskutý mráz, sněžná vánice a Skalní obr ze Sázavy',
    badge: '3. Úroveň',
    description: 'Bohatá sněhová pokrývka zakrývá kopce i střechy chalup. Ze závějí skáčou rampouchoví diblíci a vichřice nese Meluzínu.',
    lore: 'Krutá zima zavítala na venkov. Probojujte se chumelenicí a postavte se samotnému Skalnímu obrovi ze Sázavy!',
    unlock_requirement: 'Přemožte Půlnočního Hejkala na 2. úrovni',
    mini_name: '💨 Větrná Meluzína z komína',
    mini_warn: '💨 POZOR: VÁNICE PŘINÁŠÍ MOCNOU MELUZÍNU! 💨',
    mid_name: '🔥 Ohnivý rarach z pece',
    mid_warn: '🔥 POZOR: Z PECE VYLETĚL ŽHOUCÍ OHNIVÝ RARACH! 🔥',
    final_name: '🗿 Skalní obr ze Sázavy',
    final_warn: '🗿 PŘICHÁZÍ LEGENDÁRNÍ BOSS: SKALNÍ OBR ZE SÁZAVY! 🗿',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Závěje skrývají rampouchové zmrzlíky a vánici.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Ladovský sníh padá na krajinu a mráz maluje na okna.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Meluzína kvílí a z hory sestupuje obrovský Skalní obr.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Ladovská zima na Melechově je přístupna pro všechny hrdiny!' },
    }
  },
  4: {
    name: '4. Staré hamry a Čertův mlýn',
    short_title: 'Hamry a Čertův mlýn',
    subtitle: 'Žhavé výhně, moučný prach a zrádná povodeň',
    badge: '4. Úroveň',
    description: 'Hřmot mlýnských kol a žár kovářských výhní. Kolem náhonu číhají loupežníci a sám prokletý mlynář spřádá temné pikle.',
    lore: 'Voda se divoce valí náhonem a z pece šlehají jiskry. Zkroťte povodeň i moučnou tmu a zažeňte čertovského mlynáře!',
    unlock_requirement: 'Přemožte Skalního obra na 3. úrovni',
    mini_name: '🗡️ Zbojník z hamrů',
    mini_warn: '🗡️ ZE SOUTĚSKY VYRÁŽÍ OBÁVANÝ HEJTMAN ZBOJNÍK!',
    mid_name: '🔥 Ohnivý pes z výhně',
    mid_warn: '🔥 VÝHEŇ VYPUSTILA MOCNÉHO OHNIVÉHO PSA!',
    final_name: '🌊 Prokletý Mlynář',
    final_warn: '🌊 ŠÉF ÚROVNĚ: MLYNÁŘ OTEVÍRÁ STAVIDLA!',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Z dálky se ozývá klepání mlýna a řinčení železa.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Žhavé jiskry létají z hamrů a zbojníci střeží soutěsku.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Ohnivý pes vyskakuje z výhně a mlynář hrozí stavidly.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Staré hamry a Čertův mlýn jsou plně odemčeny!' },
    }
  },
  5: {
    name: '5. Pustá Hláska a Zlenické podhradí',
    short_title: 'Hláska a podhradí',
    subtitle: 'Bílé paní, zbrojnoši a bezhlavý jezdec',
    badge: '5. Úroveň',
    description: 'Kamenné rozvaliny hradu nad řekou Sázavou. Mezi hradbami plují přízračné Bílé paní a v noci vyjíždí bezhlavý rytíř na vraníku.',
    lore: 'Starobylý hrad Zlenice střeží neklidní strážci minulosti. Prolomte prokletí věže a obstůjte proti děsivému rytíři bez hlavy!',
    unlock_requirement: 'Přemožte Prokletého Mlynáře na 4. úrovni',
    mini_name: '👻 Bílá paní z věže',
    mini_warn: '👻 VĚŽ OPOUŠTÍ MOCNÝ PŘÍZRAK BÍLÉ PANÍ!',
    mid_name: '🛡️ Zbrojnoš z podhradí',
    mid_warn: '🛡️ BRÁNU DRŽÍ TĚŽKÝ OBRNĚNÝ ZBROJNOŠ!',
    final_name: '🗡️ Bezhlavý rytíř',
    final_warn: '🗡️ ŠÉF ÚROVNĚ: BEZHLAVÝ RYTÍŘ VYJÍŽDÍ!',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Nad řekou se rýsují stíny rozpadlých hradeb.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Přízraky dávných pánů a zbrojnoši hlídají zříceninu.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Bílá paní varuje před dusotem černého vraníka.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Pustá Hláska a Zlenické podhradí jsou otevřeny pro výpravy!' },
    }
  },
  6: {
    name: '6. Dračí sluj pod Melechovskou skálou',
    short_title: 'Dračí sluj',
    subtitle: 'Rampouchy, noční můry a líný tříhlavý drak',
    badge: '6. Úroveň',
    description: 'Hluboká podzemní jeskyně plná zářivých krystalů a obřích rampouchů. Na hromadě pokladů podřimuje tříhlavý drak.',
    lore: 'Finální zkouška pro nejstatečnější vesnické hrdiny. Vstupte do temné sluje, vyhněte se padajícím rampouchům a probuďte draka!',
    unlock_requirement: 'Přemožte Bezhlavého rytíře na 5. úrovni',
    mini_name: '☃️ Zlomyslný sněhulák',
    mini_warn: '☃️ ZE SLUJE SE KUTÁLÍ ZLOMYSLNÝ SNĚHULÁK!',
    mid_name: '🌑 Noční můra',
    mid_warn: '🌑 TEMNOTOU SE ŽENE DĚSIVÁ NOČNÍ MŮRA!',
    final_name: '🐉 Tříhlavý líný Drak',
    final_warn: '🐉 ŠÉF ÚROVNĚ: PROBUDIL SE TŘÍHLAVÝ DRAK!',
    milestones: {
      1: { title: '25 % – První stopa, mlha a obrysy krajiny', desc: 'Z podzemí stoupá horký dým a chladný mráz.' },
      2: { title: '50 % – Zřetelná stezka, počasí a první běsi', desc: 'Obří rampouchy hrozí pádem a stíny ožívají nočními můrami.' },
      3: { title: '75 % – Téměř plné barvy a odhalení hlavního bosse', desc: 'Z hlubin se ozývá trojí mohutné chrápání spícího draka.' },
      4: { title: '100 % – Otevřená brána a neomezený přístup', desc: 'Dračí sluj pod Melechovskou skálou je přístupna pro finální bitvu!' },
    }
  }
};

const levelDataEn = {
  1: {
    name: '1. Village Green & Duckweed Pond',
    short_title: 'Village & Pond',
    subtitle: 'Golden autumn, frisky sprites and lakeside mischief',
    badge: 'Level 1',
    description: 'Sunlight bathes the thatched roofs of Hrusice. Goblins prowl along field ridges and pesky water goblins creep from Duckweed Pond.',
    lore: 'A peaceful village afternoon shattered by wild spooks. Banish field critters and drive off the Horned Fiend himself!',
    unlock_requirement: 'Starting expedition – open for every wanderer',
    mini_name: '☀️ Scythe Noonwraith',
    mini_warn: '☀️ BEWARE: MIGHTY SCYTHE NOONWRAITH APPROACHES! ☀️',
    mid_name: '💧 Duckweed Water Goblin',
    mid_warn: '💧 BEWARE: HUGE WATER GOBLIN RISES FROM THE DEEP! 💧',
    final_name: '👹 Infernal Devil with Pitchfork',
    final_warn: '⚠️ LEVEL BOSS APPROACHES: INFERNAL DEVIL! ⚠️',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'Villagers report spooks and frogs around the pond.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Golden autumn with falling foliage and brisk critters.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'The Water Goblin rises and the Infernal Devil stamps his hooves.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'The Village Green and Duckweed Pond are fully explored!' },
    }
  },
  2: {
    name: '2. Old Cemetery & Hrusice Forest',
    short_title: 'Graveyard & Forest',
    subtitle: 'Chilly fog, tombstones, night shades and the Midnight Howler',
    badge: 'Level 2',
    description: 'Mist gathers among mossy crosses. Skeletons rise from ancient graves and the dread Howler echoes through dark woods.',
    lore: 'At midnight the old graveyard stirs. Banish restless shades and face the great sovereign of the deep woods!',
    unlock_requirement: 'Vanquish the Infernal Devil on Level 1',
    mini_name: '🔔 Duskwraith of Evening Bell',
    mini_warn: '🔔 BEWARE: EVENING BELL CHIMES AND DUSKWRAITH NEARS! 🔔',
    mid_name: '⛓️ Infernal Bailiff with Whip',
    mid_warn: '⛓️ BEWARE: GIANT INFERNAL BAILIFF WITH CHAINS! ⛓️',
    final_name: '🌲 Midnight Howler of the Woods',
    final_warn: '🌲 LEVEL BOSS APPROACHES: MIDNIGHT HOWLER! 🌲',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'The gravedigger spotted restless skeletons in the cemetery.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Chilly fog rises between headstones and eerie howls ring out.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'The Duskwraith and Infernal Bailiff guard the way to the Howler.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'The Old Cemetery and Hrusice Forest are permanently unlocked!' },
    }
  },
  3: {
    name: '3. Bohemian Winter on Mt. Melechov',
    short_title: 'Bohemian Winter',
    subtitle: 'Biting frost, blizzard flurries and the Sázava Rock Giant',
    badge: 'Level 3',
    description: 'Crisp deep snow mantles rolling hills and cottage roofs. Frost sprites burst from snowdrifts as the howling chimney wind roars.',
    lore: 'A bitter winter has gripped the countryside. Battle through the blizzard and confront the mythic Rock Giant!',
    unlock_requirement: 'Vanquish the Midnight Howler on Level 2',
    mini_name: '💨 Howling Chimney Banshee',
    mini_warn: '💨 BEWARE: BLIZZARD BRINGS FORTH THE HOWLING BANSHEE! 💨',
    mid_name: '🔥 Fiery Hearth Sprite',
    mid_warn: '🔥 BEWARE: BLAZING HEARTH SPRITE LEAPED FROM THE OVEN! 🔥',
    final_name: '🗿 Sázava Rock Giant',
    final_warn: '🗿 LEGENDARY BOSS APPROACHES: SÁZAVA ROCK GIANT! 🗿',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'Deep drifts conceal frost sprites and chilling flurries.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Czech winter snow carpets the hills as frost paints the windowpanes.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'The Banshee shrieks as the mountain Giant lumbers down.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'Bohemian Winter on Mt. Melechov is open for all heroes!' },
    }
  },
  4: {
    name: '4. Old Ironworks & Devil\'s Mill',
    short_title: 'Ironworks & Mill',
    subtitle: 'Blazing hearths, flour dust and treacherous flash floods',
    badge: 'Level 4',
    description: 'Rumbling mill wheels and the roar of blacksmith furnaces. Bandits lurk along the gorge as the cursed miller plots evil schemes.',
    lore: 'Torrents surge through the millrace as fiery sparks dance. Quell the flood and drive out the infernal miller!',
    unlock_requirement: 'Vanquish the Rock Giant on Level 3',
    mini_name: '🗡️ Gorge Highwayman',
    mini_warn: '🗡️ FEARED HIGHWAYMAN CAPTAIN CHARGES FROM THE GORGE!',
    mid_name: '🔥 Furnace Fire Hound',
    mid_warn: '🔥 THE FORGE UNLEASHED A MIGHTY FIRE HOUND!',
    final_name: '🌊 Cursed Fiendish Miller',
    final_warn: '🌊 LEVEL BOSS: THE MILLER THROWS OPEN THE FLOODGATES!',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'Rhythmic mill clatter and hammer strikes echo in the distance.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Glowing sparks spray from the ironworks as outlaws guard the gorge.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'A burning hound leaps from the hearth as the miller threatens a flood.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'The Old Ironworks and Devil\'s Mill are fully unlocked!' },
    }
  },
  5: {
    name: '5. Desolate Watchtower & Castle Bailey',
    short_title: 'Watchtower & Bailey',
    subtitle: 'White Ladies, armored squires and the Headless Horseman',
    badge: 'Level 5',
    description: 'Weathered stone ramparts overlooking the winding Sázava. Spectral White Ladies drift through castle halls as the headless knight rides.',
    lore: 'Ancient Zlenice Castle is guarded by restless spectral sentinels. Break the belfry curse and endure the charge of the Headless Knight!',
    unlock_requirement: 'Vanquish the Cursed Miller on Level 4',
    mini_name: '👻 White Lady of the Tower',
    mini_warn: '👻 MIGHTY PHANTOM OF THE WHITE LADY LEAVES THE TOWER!',
    mid_name: '🛡️ Bailey Squire',
    mid_warn: '🛡️ HEAVY ARMORED SQUIRE BARS THE CASTLE GATE!',
    final_name: '🗡️ Headless Knight',
    final_warn: '🗡️ LEVEL BOSS: THE HEADLESS KNIGHT RIDES FORTH!',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'Crumbled battlements stand silhouetted above the river.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Phantoms of forgotten lords and armored sentries patrol the ruins.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'The White Lady whispers a warning of hooves upon stone.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'The Desolate Watchtower and Bailey are open for expeditions!' },
    }
  },
  6: {
    name: '6. Dragon Cavern under Melechov Rock',
    short_title: 'Dragon Cavern',
    subtitle: 'Icicles, dark nightmares and the slumbering three-headed dragon',
    badge: 'Level 6',
    description: 'A subterranean cavern sparkling with crystalline frost and monumental stalactites. Upon a hoard of relics dozes the three-headed dragon.',
    lore: 'The ultimate trial for rustic heroes. Delve into the cavern, dodge falling icicles and awaken the ancient dragon!',
    unlock_requirement: 'Vanquish the Headless Knight on Level 5',
    mini_name: '☃️ Mischievous Snowman',
    mini_warn: '☃️ MISCHIEVOUS SNOWMAN ROLLS FORTH FROM THE CAVERN!',
    mid_name: '🌑 Nightmare Mare',
    mid_warn: '🌑 DREAD NIGHTMARE SURGES THROUGH THE GLOOM!',
    final_name: '🐉 Slumbering Three-Headed Dragon',
    final_warn: '🐉 LEVEL BOSS: THREE-HEADED DRAGON HAS AWOKEN!',
    milestones: {
      1: { title: '25% – First clue, mist & landscape contours', desc: 'Warm smoke and chilling drafts seep from deep underground.' },
      2: { title: '50% – Clear path, weather & first fiends', desc: 'Gigantic stalactites threaten to plunge as nightmares stalk the gloom.' },
      3: { title: '75% – Vivid colors & main boss reveal', desc: 'A triple deep snore reverberates from the heart of the cavern.' },
      4: { title: '100% – Open gate & unrestricted access', desc: 'The Dragon Cavern is open for the ultimate showdown!' },
    }
  }
};

for (const [id, d] of Object.entries(levelDataCs)) {
  newCs[`level.${id}.name`] = d.name;
  newCs[`level.${id}.short_title`] = d.short_title;
  newCs[`level.${id}.subtitle`] = d.subtitle;
  newCs[`level.${id}.badge`] = d.badge;
  newCs[`level.${id}.description`] = d.description;
  newCs[`level.${id}.lore`] = d.lore;
  newCs[`level.${id}.unlock_requirement`] = d.unlock_requirement;
  newCs[`level.${id}.miniboss.name`] = d.mini_name;
  newCs[`level.${id}.miniboss.warning`] = d.mini_warn;
  newCs[`level.${id}.midboss.name`] = d.mid_name;
  newCs[`level.${id}.midboss.warning`] = d.mid_warn;
  newCs[`level.${id}.finalboss.name`] = d.final_name;
  newCs[`level.${id}.finalboss.warning`] = d.final_warn;
  for (const [t, m] of Object.entries(d.milestones)) {
    newCs[`level.${id}.milestone.${t}.title`] = m.title;
    newCs[`level.${id}.milestone.${t}.desc`] = m.desc;
  }
}

for (const [id, d] of Object.entries(levelDataEn)) {
  newEn[`level.${id}.name`] = d.name;
  newEn[`level.${id}.short_title`] = d.short_title;
  newEn[`level.${id}.subtitle`] = d.subtitle;
  newEn[`level.${id}.badge`] = d.badge;
  newEn[`level.${id}.description`] = d.description;
  newEn[`level.${id}.lore`] = d.lore;
  newEn[`level.${id}.unlock_requirement`] = d.unlock_requirement;
  newEn[`level.${id}.miniboss.name`] = d.mini_name;
  newEn[`level.${id}.miniboss.warning`] = d.mini_warn;
  newEn[`level.${id}.midboss.name`] = d.mid_name;
  newEn[`level.${id}.midboss.warning`] = d.mid_warn;
  newEn[`level.${id}.finalboss.name`] = d.final_name;
  newEn[`level.${id}.finalboss.warning`] = d.final_warn;
  for (const [t, m] of Object.entries(d.milestones)) {
    newEn[`level.${id}.milestone.${t}.title`] = m.title;
    newEn[`level.${id}.milestone.${t}.desc`] = m.desc;
  }
}

// 2. Hunters
const hunterDataCs = {
  wanderer: {
    name: 'Poutník',
    title: 'Vesnický poutník z Hrusic',
    challenge_title: 'Výchozí venkovský hrdina',
    challenge_short_desc: 'Připraven k cestě od samého počátku.',
    challenge_long_desc: 'Poutník s osikovým prutem a tuláckým instinktem (+35 % poškození) je odemčen ihned.',
    bio: 'Vysoká kuráž (200) a dobrá nálada (+35 % poškození zbraní). Osikový prut. Schopnost: Pověstná sukovice (-30 % cooldown).',
    weapon_hint: 'Osikový prut (+35 % poškození)',
    ability_hint: 'Pověstná sukovice (otočka holí zažene a silně odhodí okolní bubáky – cooldown 21 s)',
  },
  shepherd: {
    name: 'Pasáček',
    title: 'Hbitý chlapec z pastvin',
    challenge_title: '🌾 Ochránce obecních pastvin',
    challenge_short_desc: 'Zažeň celkem 120 polních a lučních škůdců z pastvin.',
    challenge_long_desc: 'Pastviny pod Hůrkou jsou zamořeny nezbednými rarášky, sýpkovými myšáky a šotky. Zažeň 120 těchto potvůrek!',
    bio: 'Neobyčejně hbitý (+25 % rychlost běhu). Začíná s Válečnicí. Schopnost: Pastýřská píšťalka (přivolá dupající stádo beranů).',
    weapon_hint: 'Válečnice (+25 % rychlost běhu)',
    ability_hint: 'Pastýřská píšťalka (přivolá dupající stádo beranů přes celou obrazovku – cooldown 25 s)',
  },
  korenarka: {
    name: 'Bába kořenářka',
    title: 'Moudrá ranhojička z lesní chaloupky',
    challenge_title: '🌿 Ochránkyně svatého pramene',
    challenge_short_desc: 'Zažeň 140 bahenních a vodních potvor z okolí potoka.',
    challenge_long_desc: 'U potoka a studánky řádí žáby, topivci a divoženky. Očisti okolí pramene pro sběr léčivých bylin!',
    bio: 'Vyšší odolnost a regenerace (+1,2 reg/s, +40 % dosah sběru). Začíná s Devaterem kvítí. Schopnost: Očistné kadidlo.',
    weapon_hint: 'Devatero kvítí (+1,2 reg/s, +40 % dosah sběru)',
    ability_hint: 'Očistné kadidlo (vypustí voňavý dým, který zhojí kuráž a zapálí nepřátele – cooldown 24 s)',
  },
  watchman: {
    name: 'Ponocný',
    title: 'Legendární strážce noci s Voříškem',
    challenge_title: '🏮 Noční hlídka nad vsí',
    challenge_short_desc: 'Zažeň 160 nočních bubáků a hromotluků.',
    challenge_long_desc: 'Ponocný a jeho věrný pes Voříšek střeží klidný spánek vsi před nočními běsy a lupiči.',
    bio: 'Pevný strážce (+40 maximální Kuráž, +20 % odolnost proti odhození). Začíná s Kovanou halapartnou. Schopnost: Ponocného roh.',
    weapon_hint: 'Kovaná halapartna (+40 Kuráž, aura lucerny)',
    ability_hint: 'Ponocného roh (pronikavý tón troubení omráčí všechny bubáky na 3,5 s – cooldown 26 s)',
  },
  sexton: {
    name: 'Pobožný kostelník',
    title: 'Zvoník a správce farního kostela',
    challenge_title: '🔔 Posvěcení hřbitovní půdy',
    challenge_short_desc: 'Zažeň 180 kostlivců a neklidných umrlců.',
    challenge_long_desc: 'Hřbitov je plný chrastících koster a bludných duší. Posvěť půdu a navrať klid zemřelým!',
    bio: 'Svatá moc (+50 % účinek svatých zbraní, +15 % šance na posvátné zranění). Začíná s Hromničkou. Schopnost: Svaté zvonění.',
    weapon_hint: 'Hromnička (+50 % posvátné poškození)',
    ability_hint: 'Svaté zvonění (svatý zvon zapálí všechny nemrtvé a démony v okolí – cooldown 22 s)',
  },
  granny: {
    name: 'Babička a Barunka',
    title: 'Vlídná babička z Ratibořic a její vnučka',
    challenge_title: '🧺 Dobré srdce a vlídné slovo',
    challenge_short_desc: 'Zachraň celkem 10 uvězněných dušiček z hrníčků vodníků.',
    challenge_long_desc: 'Babička ví, že i ten největší strašák zkrotne před vlídným slovem a krajícem chleba se solí.',
    bio: 'Klidná mysl (+2 Štěstí, krejcary se kutálejí samy, bubáci mlsají déle). Začíná s Povidlovými buchtami. Schopnost: Chléb se solí.',
    weapon_hint: 'Povidlové buchty (+2 Štěstí, mlsání bubáků)',
    ability_hint: 'Chléb se solí (čas se zastaví a Babička nabídne strašidlům pohoštění – cooldown 35 s)',
  }
};

const hunterDataEn = {
  wanderer: {
    name: 'Wanderer',
    title: 'Village Wanderer of Hrusice',
    challenge_title: 'Default Countryside Hero',
    challenge_short_desc: 'Ready for the road from the very beginning.',
    challenge_long_desc: 'Wanderer with an aspen rod and nomadic instinct (+35% damage) is unlocked immediately.',
    bio: 'High courage (200) and good cheer (+35% weapon damage). Aspen rod. Ability: Famous Cudgel (-30% cooldown).',
    weapon_hint: 'Aspen Rod (+35% damage)',
    ability_hint: 'Famous Cudgel (spinning strike knocks back surrounding spooks – cooldown 21s)',
  },
  shepherd: {
    name: 'Shepherd Boy',
    title: 'Nimble lad of the green pastures',
    challenge_title: '🌾 Guardian of the Common Pastures',
    challenge_short_desc: 'Banish 120 meadow and field pests from pastures.',
    challenge_long_desc: 'Pastures beneath Hůrka hill are plagued by impish sprites and hungry mice. Banish 120 pests!',
    bio: 'Remarkably agile (+25% run speed). Starts with Rolling-Pin Matron. Ability: Shepherd\'s Flute (calls trampling ram flock).',
    weapon_hint: 'Rolling-Pin Matron (+25% movement speed)',
    ability_hint: 'Shepherd\'s Flute (summons a galloping flock of sheep across the screen – cooldown 25s)',
  },
  korenarka: {
    name: 'Herbalist Granny',
    title: 'Wise healer from the woodland cottage',
    challenge_title: '🌿 Protectress of the Sacred Spring',
    challenge_short_desc: 'Banish 140 mud and water creatures from the brook.',
    challenge_long_desc: 'Toads, drowned shades and wood maidens prowl the brook. Cleanse the waters for herb gathering!',
    bio: 'Stout endurance and regeneration (+1.2 reg/s, +40% pickup radius). Starts with Nine Herb Wreath. Ability: Cleansing Incense.',
    weapon_hint: 'Nine Herb Wreath (+1.2 reg/s, +40% pickup radius)',
    ability_hint: 'Cleansing Incense (releases sweet smoke that heals courage and scorches foes – cooldown 24s)',
  },
  watchman: {
    name: 'Night Watchman',
    title: 'Legendary night guard with hound Voříšek',
    challenge_title: '🏮 Night Watch over the Hamlet',
    challenge_short_desc: 'Banish 160 boggarts and lumbers.',
    challenge_long_desc: 'The watchman and his loyal mongrel Voříšek guard the slumbering village from nocturnal thieves.',
    bio: 'Steadfast guard (+40 max Courage, +20% knockback resistance). Starts with Forged Halberd. Ability: Watchman\'s Horn.',
    weapon_hint: 'Forged Halberd (+40 Courage, lantern aura)',
    ability_hint: 'Watchman\'s Horn (piercing horn blast stuns all spooks for 3.5s – cooldown 26s)',
  },
  sexton: {
    name: 'Pious Sexton',
    title: 'Bell ringer & custodian of the parish church',
    challenge_title: '🔔 Consecration of Hallowed Ground',
    challenge_short_desc: 'Banish 180 skeletons and restless corpses.',
    challenge_long_desc: 'The graveyard rattles with animated bones and stray shades. Consecrate the soil and restore peace!',
    bio: 'Holy fervor (+50% holy weapon potency, +15% holy strike chance). Starts with Candlemas Candle. Ability: Holy Chimes.',
    weapon_hint: 'Candlemas Candle (+50% holy damage)',
    ability_hint: 'Holy Chimes (sanctified bell bursts ignite all undead and demons – cooldown 22s)',
  },
  granny: {
    name: 'Grandmother & Barunka',
    title: 'Gentle grandmother from Ratibořice and granddaughter',
    challenge_title: '🧺 Kind Heart & Gentle Word',
    challenge_short_desc: 'Rescue 10 captive souls from water goblins\' porcelain jars.',
    challenge_long_desc: 'Granny knows that even the wildest boggart softens before a kind word and fresh bread with salt.',
    bio: 'Peaceful mind (+2 Luck, coins roll automatically, spooks snack longer). Starts with Plum Jam Buns. Ability: Bread & Salt.',
    weapon_hint: 'Plum Jam Buns (+2 Luck, spooks snack longer)',
    ability_hint: 'Bread & Salt (time freezes as Granny offers warm treats to soothe spooks – cooldown 35s)',
  }
};

for (const [id, d] of Object.entries(hunterDataCs)) {
  newCs[`hunter.${id}.name`] = d.name;
  newCs[`hunter.${id}.title`] = d.title;
  newCs[`hunter.${id}.challenge_title`] = d.challenge_title;
  newCs[`hunter.${id}.challenge_short_desc`] = d.challenge_short_desc;
  newCs[`hunter.${id}.challenge_long_desc`] = d.challenge_long_desc;
  newCs[`hunter.${id}.bio`] = d.bio;
  newCs[`hunter.${id}.spoiled_weapon_hint`] = d.weapon_hint;
  newCs[`hunter.${id}.spoiled_ability_hint`] = d.ability_hint;
}

for (const [id, d] of Object.entries(hunterDataEn)) {
  newEn[`hunter.${id}.name`] = d.name;
  newEn[`hunter.${id}.title`] = d.title;
  newEn[`hunter.${id}.challenge_title`] = d.challenge_title;
  newEn[`hunter.${id}.challenge_short_desc`] = d.challenge_short_desc;
  newEn[`hunter.${id}.challenge_long_desc`] = d.challenge_long_desc;
  newEn[`hunter.${id}.bio`] = d.bio;
  newEn[`hunter.${id}.spoiled_weapon_hint`] = d.weapon_hint;
  newEn[`hunter.${id}.spoiled_ability_hint`] = d.ability_hint;
}

// 3. Grandfather Items (17 non-weapon perks)
const grandfatherDataCs = {
  sedmimile_krpce: { name: 'Sedmimílové krpce', desc: '+20 rychlost pohybu' },
  certovske_pirko: { name: 'Čertovské pírko', desc: '+10 % poškození všech útoků' },
  pytlacka_lucerna: { name: 'Pytlácká lucerna', desc: '+30 dosahu sběru' },
  zaplacovany_kabat: { name: 'Záplatovaný kabát', desc: '+25 maximální Kuráž' },
  krajac_na_podmasli: { name: 'Kráječ na podmáslí', desc: '+0,6 regenerace / s' },
  podkova_pro_stesti: { name: 'Podkova pro štěstí', desc: '+1 ŠTĚSTÍ' },
  bylinkova_fajfka: { name: 'Bylinková fajfka', desc: '+1,2 regenerace / s' },
  rehtacka: { name: 'Řehtačka', desc: '+15 % poškození' },
  krvave_jelito: { name: 'Krvavé jelito', desc: '+15 % trvalé zranění všech úderů a zbraní' },
  opravdova_kava: { name: 'Opravdová káva', desc: '-10 % doba přípravy útoků (svižnější zbraně)' },
  medvedi_mast: { name: 'Medvědí mast', desc: '+30 maximální Kuráž i okamžité zhojení' },
  vesela_mysl: { name: 'Veselá mysl a písnička', desc: '+3 Kuráž doplňováno každých 5 s (+0,6 reg/s)' },
  toulave_boty: { name: 'Toulavé boty sedmimílové', desc: '+20 rychlost pohybu při obcházení strašidel' },
  magneticky_mesec: { name: 'Magnetický měšec', desc: '+30 dosah sběru krejcarů a perníčků' },
  zabijackova_jitrnice: { name: 'Zabijačková jitrnice', desc: '+40 okamžité doplnění Kuráže' },
  povidlova_buchta_snack: { name: 'Povidlová buchta na cestu', desc: '+50 okamžité doplnění Kuráže sladkou svačinou' },
  kynuty_kolac_perk: { name: 'Kynutý koláč z pece', desc: '+25 maximální Kuráž i okamžité posílení' },
};

const grandfatherDataEn = {
  sedmimile_krpce: { name: 'Seven-League Brogues', desc: '+20 movement speed' },
  certovske_pirko: { name: 'Devil\'s Feather', desc: '+10% damage to all attacks' },
  pytlacka_lucerna: { name: 'Poacher\'s Lantern', desc: '+30 pickup range' },
  zaplacovany_kabat: { name: 'Patched Coat', desc: '+25 maximum Courage' },
  krajac_na_podmasli: { name: 'Buttermilk Slicer', desc: '+0.6 regeneration / s' },
  podkova_pro_stesti: { name: 'Lucky Horseshoe', desc: '+1 LUCK' },
  bylinkova_fajfka: { name: 'Herbal Clay Pipe', desc: '+1.2 regeneration / s' },
  rehtacka: { name: 'Easter Clapper', desc: '+15% damage' },
  krvave_jelito: { name: 'Blood Sausage', desc: '+15% permanent damage to all attacks' },
  opravdova_kava: { name: 'Real Roasted Coffee', desc: '-10% attack cooldown (faster attacks)' },
  medvedi_mast: { name: 'Bear Salve', desc: '+30 maximum Courage & instant heal' },
  vesela_mysl: { name: 'Merry Heart & Song', desc: '+3 Courage restored every 5s (+0.6 reg/s)' },
  toulave_boty: { name: 'Seven-League Wander-Boots', desc: '+20 speed while sidestepping spooks' },
  magneticky_mesec: { name: 'Magnetic Coin Pouch', desc: '+30 pickup radius for coins & cookies' },
  zabijackova_jitrnice: { name: 'Feast White Pudding', desc: '+40 instant Courage restoration' },
  povidlova_buchta_snack: { name: 'Plum Jam Bun for Road', desc: '+50 instant Courage sweet snack' },
  kynuty_kolac_perk: { name: 'Oven Yeast Cake', desc: '+25 maximum Courage & instant boost' },
};

for (const [id, d] of Object.entries(grandfatherDataCs)) {
  newCs[`grandfather_item.${id}.name`] = d.name;
  newCs[`grandfather_item.${id}.desc`] = d.desc;
}
for (const [id, d] of Object.entries(grandfatherDataEn)) {
  newEn[`grandfather_item.${id}.name`] = d.name;
  newEn[`grandfather_item.${id}.desc`] = d.desc;
}

// 4. Weapon Milestones (all 90 choices from weaponMilestones.ts)
const milestonesRaw = fs.readFileSync('src/data/weaponMilestones.ts', 'utf8');
const choiceMatches = [...milestonesRaw.matchAll(/makeChoice\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g)];

// Map of english milestone translations based on choiceId
const enMilestoneTranslations = {
  // osikovy_prut
  cane_crowd_3: { name: 'Wide Sweep', desc: 'A broad arc sweeps through entire packs of sprites.' },
  cane_burst_3: { name: 'Resolute Smack', desc: 'Each smack hits harder and the rod strikes swifter.' },
  cane_crowd_5: { name: 'Pinwheel Rod', desc: 'Cleaving sweeps keep spooks at a safe distance.' },
  cane_burst_5: { name: 'Solid Handle', desc: 'Stronger strikes add piercing force and quick tempo.' },
  cane_crowd_8: { name: 'Broomstick Sweep', desc: 'Exceptionally wide sweep cleanses a full circle around the hunter.' },
  cane_burst_8: { name: 'Warden Cane', desc: 'Stout impacts knock foes back and crack heavy defenses.' },

  // valecnice
  roller_crowd_3: { name: 'Heavy Dough Roll', desc: 'Wider orbit flattens more boggarts with crushing momentum.' },
  roller_burst_3: { name: 'Quick Roll', desc: 'The rolling pin spins briskly, battering nearby fiends faster.' },
  roller_crowd_5: { name: 'Flour Whirlwind', desc: 'Scatters flour dust in a wide arc, slowing crowding monsters.' },
  roller_burst_5: { name: 'Beechwood Core', desc: 'Dense wood deals devastating impact blows that penetrate defenses.' },
  roller_crowd_8: { name: 'Matron\'s Wrath', desc: 'Massive circular barrage swats away all approaching nightmares.' },
  roller_burst_8: { name: 'Grandma\'s Pestle', desc: 'Crushing stuns and tremendous knockback on every turn.' },

  // cesnekova_topinka
  garlic_crowd_3: { name: 'Pungent Cloud', desc: 'Expanded garlic stench keeps pesky foes further at bay.' },
  garlic_burst_3: { name: 'Charred Crust', desc: 'Intense scorched aroma burns foes for higher recurring damage.' },
  garlic_crowd_5: { name: 'Sulfur Smoke', desc: 'Noxious garlic vapor slows enemy movement considerably.' },
  garlic_burst_5: { name: 'Double Garlic', desc: 'Heavily rubbed garlic cloves inflict searing pain on fiends.' },
  garlic_crowd_8: { name: 'Village Hearth Stench', desc: 'Overwhelming aura pushes all night creatures back continuously.' },
  garlic_burst_8: { name: 'Crispy Crackle', desc: 'Crackling hot toast releases holy garlic bursts that scorch undead.' },

  // kysela_okurka
  pickle_crowd_3: { name: 'Pickle Splash', desc: 'Tart brine sprays wider, soaking neighboring enemies.' },
  pickle_burst_3: { name: 'Extra Sour', desc: 'Deep acidity weakens monsters so they take heavier blows.' },
  pickle_crowd_5: { name: 'Brine Barrel', desc: 'Hurls clusters of gherkins that burst across the field.' },
  pickle_burst_5: { name: 'Pickled Bite', desc: 'Tart vinegar chips away at tough defenses relentlessly.' },
  pickle_crowd_8: { name: 'Znojmo Delicacy', desc: 'Celebrated Bohemian pickles send fiends into a dizzying food coma.' },
  pickle_burst_8: { name: 'Fermented Spurt', desc: 'Piercing sour bursts detonate on impact with green vinegar mist.' },

  // povidlove_buchty
  bun_crowd_3: { name: 'Sugar Duster', desc: 'Sweet powdered sugar attracts wider groups of hungry spooks.' },
  bun_burst_3: { name: 'Warm Jam Core', desc: 'Rich plum filling keeps bubáks snacking on the spot for longer.' },
  bun_crowd_5: { name: 'Full Baking Tray', desc: 'Serves an extra warm yeast bun in each comforting volley.' },
  bun_burst_5: { name: 'Caramel Crust', desc: 'Golden crust pacifies greedy monsters without dealing harm.' },
  bun_crowd_8: { name: 'Sunday Feast', desc: 'Whole table of buns satisfies monstrous appetites completely.' },
  bun_burst_8: { name: 'Plum Ambrosia', desc: 'Irresistible aroma leaves all fiends happily dazed and docile.' },

  // kovarske_vidle
  fork_crowd_3: { name: 'Triple Prong', desc: 'Wide three-pronged jab catches multiple monsters in a row.' },
  fork_burst_3: { name: 'Smithy Thrust', desc: 'Forged iron thrust pierces straight through frontline foes.' },
  fork_crowd_5: { name: 'Wide Rake', desc: 'Sweeps across a broad frontal wedge, tossing aside small fiends.' },
  fork_burst_5: { name: 'Quenched Tips', desc: 'Hardened prongs inflict deep punctures that ignore armor.' },
  fork_crowd_8: { name: 'Master Smith Pike', desc: 'Devastating reach skewers columns of charging nightmares.' },
  fork_burst_8: { name: 'Anvil Puncture', desc: 'Shattering impact knocks back even massive giants with ease.' },

  // kovana_halapartna
  halberd_crowd_3: { name: 'Sweeping Cleave', desc: 'Broad halberd swing shears through dense ranks of skeletons.' },
  halberd_burst_3: { name: 'Heavy Hook', desc: 'Lethal ax blade strikes with crushing downward force.' },
  halberd_crowd_5: { name: 'Whirling Blade', desc: 'Rapid spinning arc guards the hunter\'s perimeter cleanly.' },
  halberd_burst_5: { name: 'Castle Guard Edge', desc: 'Sharp steel edge carves deeply through tough monster hides.' },
  halberd_crowd_8: { name: 'Bailiff\'s Executioner', desc: 'Gigantic cleaving sweep fells hordes of dark horrors in one stroke.' },
  halberd_burst_8: { name: 'Iron Spike', desc: 'Reinforced spike shatters heavy armor with staggering blows.' },

  // dreveny_cep
  flail_crowd_3: { name: 'Rye Thresher', desc: 'Crushing shockwave radiates outward across the soil.' },
  flail_burst_3: { name: 'Iron Band', desc: 'Heavy iron straps deliver brutal bone-cracking impacts.' },
  flail_crowd_5: { name: 'Barn Floor Shock', desc: 'Tremendous ground slams toss boggarts into the air.' },
  flail_burst_5: { name: 'Heavy Joint', desc: 'Solid swiveling hinge builds devastating momentum.' },
  flail_crowd_8: { name: 'Harvest Earthquake', desc: 'Earth-shaking impact wave ripples across the entire arena.' },
  flail_burst_8: { name: 'Rebel Cudgel', desc: 'Crushes elite monsters with undeniable peasant rebellion might.' },

  // devatero_kviti
  flower_crowd_3: { name: 'Meadow Blossom', desc: 'Fragrant herbal aura expands across a wider sanctuary radius.' },
  flower_burst_3: { name: 'St. John\'s Wort', desc: 'Midsummer herbs radiate sacred light that purifies unclean spirits.' },
  flower_crowd_5: { name: 'Wild Thyme Breeze', desc: 'Soothing floral scent slows enemy advance significantly.' },
  flower_burst_5: { name: 'Fern Bloom', desc: 'Mystic fern seeds spark holy damage on wicked fiends.' },
  flower_crowd_8: { name: 'Solstice Garland', desc: 'Grand protective circle repels all darkness and restores calm.' },
  flower_burst_8: { name: 'Herbal Sanctuary', desc: 'Blessed petals continually scorch evil while bolstering the hunter.' },

  // snehova_koule
  snow_crowd_3: { name: 'Packed Snowdrift', desc: 'Dense snowball shatters into chilling frosty fragments on impact.' },
  snow_burst_3: { name: 'Icy Core', desc: 'Frozen center inflicts sharp cold and slows enemy stride.' },
  snow_crowd_5: { name: 'Snowball Barrage', desc: 'Flings an extra snowball in rapid succession.' },
  snow_burst_5: { name: 'Glacial Chill', desc: 'Freezing temperature locks monsters in numbing frost longer.' },
  snow_crowd_8: { name: 'Avalanche Roll', desc: 'Giant rolling boulder of snow sweeps whole waves before it.' },
  snow_burst_8: { name: 'Permafrost Glaze', desc: 'Deep Bohemian frost petrifies monsters in solid ice.' },

  // kynuty_kolac
  cake_crowd_3: { name: 'Curd & Poppy Ring', desc: 'Rich festive scent lures nearby groups into joyful snacking.' },
  cake_burst_3: { name: 'Sweet Almond Glaze', desc: 'Honeyed glaze keeps gluttonous spooks busy eating for longer.' },
  cake_crowd_5: { name: 'Bouncing Wedge', desc: 'Festive cake slices bounce between more monsters in sequence.' },
  cake_burst_5: { name: 'Golden Bake', desc: 'Perfect oven bake calms fierce tempers with warm baked curd.' },
  cake_crowd_8: { name: 'Village Feast Platter', desc: 'Massive celebratory wheel satisfies the greediest monsters.' },
  cake_burst_8: { name: 'Royal Recipe', desc: 'Enchanting pastry leaves all who taste it in pacified bliss.' },

  // horky_brambor
  potato_crowd_3: { name: 'Scattered Embers', desc: 'Burning potato breaks into multiple smoking embers on the ground.' },
  potato_burst_3: { name: 'Glowing Ash', desc: 'Piping hot ash inflicts searing burn damage over time.' },
  potato_crowd_5: { name: 'Bonfire Cluster', desc: 'Hurls an additional glowing potato into the dark.' },
  potato_burst_5: { name: 'Charcoal Core', desc: 'Intense coal heat burns through resistant monster hides.' },
  potato_crowd_8: { name: 'Autumn Bonfire', desc: 'Leaves blazing hearth fires that burn continuously across the field.' },
  potato_burst_8: { name: 'Molten Tuber', desc: 'Explodes into fiery sparks that engulf charging fiends.' },

  // vceli_roj
  bee_crowd_3: { name: 'Wild Hive', desc: 'Swarm splits to harass multiple monsters simultaneously.' },
  bee_burst_3: { name: 'Sharp Stinger', desc: 'Relentless bee stings penetrate defenses with stinging venom.' },
  bee_crowd_5: { name: 'Linden Blossom', desc: 'Sweet honey aroma draws a larger buzzing cloud of bees.' },
  bee_burst_5: { name: 'Forest Hornets', desc: 'Fierce woodland bees attack at increased tempo.' },
  bee_crowd_8: { name: 'Beekeeper\'s Army', desc: 'Enormous golden swarm blankets the battlefield in buzzing fury.' },
  bee_burst_8: { name: 'Queen\'s Command', desc: 'Coordinated stings inflict heavy recurring damage and panic.' },

  // hromnicka
  candle_crowd_3: { name: 'Sanctified Glow', desc: 'Blessed candlelight shines outward in a wider sacred radius.' },
  candle_burst_3: { name: 'Purifying Flame', desc: 'Hallowed candle flame burns undead and demons with intense holy fire.' },
  candle_crowd_5: { name: 'Church Bell Candle', desc: 'Consecrated beeswax emits radiant pulses at swifter intervals.' },
  candle_burst_5: { name: 'Golden Wick', desc: 'Sacred luminance dispels fear and scorches infernal devils.' },
  candle_crowd_8: { name: 'Cathedral Pillar', desc: 'Mighty pillar of holy light repels darkness across the screen.' },
  candle_burst_8: { name: 'Holy Consecration', desc: 'Holy flames obliterate restless shades with devastating certainty.' },

  // svecena_kropenka
  water_crowd_3: { name: 'Wide Aspergillum', desc: 'Sprays holy droplets in an expansive fan pattern.' },
  water_burst_3: { name: 'Blessed Droplet', desc: 'Consecrated water deals double holy damage to restless undead.' },
  water_crowd_5: { name: 'Chapel Spring', desc: 'Consecrated drops rain down with increased frequency.' },
  water_burst_5: { name: 'Silver Vessel', desc: 'Silver aspergillum purifies vile curses and pierces fiendish armor.' },
  water_crowd_8: { name: 'Font of St. George', desc: 'Holy deluge bathes the arena, banishing midnight abominations.' },
  water_burst_8: { name: 'Sacred Deluge', desc: 'Blessed droplets cascade in torrential sheets of radiant fire.' },
};

for (const m of choiceMatches) {
  const id = m[1];
  const nameCs = m[2];
  const descCs = m[3];
  newCs[`milestone.${id}.name`] = nameCs;
  newCs[`milestone.${id}.desc`] = descCs;

  const enTrans = enMilestoneTranslations[id] || { name: nameCs, desc: descCs };
  newEn[`milestone.${id}.name`] = enTrans.name;
  newEn[`milestone.${id}.desc`] = enTrans.desc;
}

// 5. Trophies (25)
const trophiesRaw = fs.readFileSync('src/data/trophies.ts', 'utf8');
const trophyMatches = [...trophiesRaw.matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*desc:\s*"([^"]+)"/g)];

const enTrophyTranslations = {
  souls_5: { title: '🏺 Rescuer of Souls', desc: 'Rescue at least 5 trapped souls from water goblins\' porcelain jars.' },
  souls_20: { title: '✨ Guardian of Deep Waters', desc: 'Rescue at least 20 souls from goblins and drowned shades.' },
  cert_slain: { title: '👹 Tamer of Devils', desc: 'Defeat the dreaded Infernal Devil boss at least once.' },
  hejkal_slain: { title: '🌲 Lord of Midnight Woods', desc: 'Stand against the giant Midnight Howler and conquer him.' },
  chasnik_rescued: { title: '🌾 Loyal Hamlet Neighbor', desc: 'Rescue village lad Kuba surrounded in the arena at least once.' },
  chasnik_5: { title: '🤝 Bailiff\'s True Friend', desc: 'Rescue at least 5 village lads from monster hordes.' },
  survive_dawn: { title: '🐓 Cockcrow Champion', desc: 'Survive the full night until dawn breaks and roosters crow!' },
  polednice_slain: { title: '☀️ Shadow of the Sickle', desc: 'Defeat at least 3 Noonwraiths during scorching midday.' },
  kills_100: { title: '⚔️ Terror of Night Fiends', desc: 'Vanquish at least 100 countryside spooks in battle.' },
  kills_300: { title: '🛡️ Champion of Hrusice', desc: 'Banish 300 monsters and restore safety to Bohemian valleys.' },
  winter_walker: { title: '❄️ Winter Pathfarer', desc: 'Complete an expedition into Bohemian Winter on Mt. Melechov.' },
  village_patron: { title: '🏘️ Village Benefactor', desc: 'Upgrade any 3 village buildings to level 3 or higher.' },
  blacksmith_master: { title: '🔨 Forge Master', desc: 'Upgrade both the Forge and Bakery to level 4 or higher.' },
  fellowship_hunters: { title: '🏹 Fellowship of Hunters', desc: 'Unlock at least 4 different hunters for nocturnal expeditions.' },
  obr_slain: { title: '🗿 Mountain Toppler', desc: 'Face and fell the mythic Sázava Rock Giant in battle.' },
  lightning_strike: { title: '⚡ Storm Witness', desc: 'Survive a nighttime lightning strike in the open meadow.' },
  level1_completed: { title: '🍂 Peace by Duckweed Pond', desc: 'Complete Level 1: Village Green and Duckweed Pond.' },
  level2_completed: { title: '🌲 Calm over Graveyard', desc: 'Complete Level 2: Old Cemetery and Hrusice Forest.' },
  level3_completed: { title: '❄️ Conqueror of Frost', desc: 'Complete Level 3: Bohemian Winter on Mt. Melechov.' },
  mlynar_slain: { title: '🌊 Miller Vanquished', desc: 'Defeat the Cursed Fiendish Miller at the old mill.' },
  bezhlavy_rytir_slain: { title: '🗡️ Headless Knight Banished', desc: 'Vanquish the spectral Headless Knight in castle ruins.' },
  drak_slain: { title: '🐉 Dragon Slayer', desc: 'Defeat the ancient three-headed dragon in his cavern.' },
  level4_completed: { title: '⚙️ Master of Ironworks', desc: 'Complete Level 4: Old Ironworks and Devil\'s Mill.' },
  level5_completed: { title: '🏰 Warden of Zlenice', desc: 'Complete Level 5: Desolate Watchtower and Bailey.' },
  level6_completed: { title: '👑 Savior of the Realm', desc: 'Complete Level 6: Dragon Cavern under Melechov Rock.' },
};

for (const t of trophyMatches) {
  const id = t[1];
  const titleCs = t[2];
  const descCs = t[3];
  newCs[`trophy.${id}.title`] = titleCs;
  newCs[`trophy.${id}.desc`] = descCs;

  const enTrans = enTrophyTranslations[id] || { title: titleCs, desc: descCs };
  newEn[`trophy.${id}.title`] = enTrans.title;
  newEn[`trophy.${id}.desc`] = enTrans.desc;
}

// 6. Canvas & dynamic in-game strings (Ticket 5)
const canvasStringsCs = {
  'canvas.portrait.tier0': '🔒 ZAMČENO (0 %)',
  'canvas.portrait.tier1': '🔍 25 % ODHALENO',
  'canvas.portrait.tier2': '🔎 50 % ODHALENO',
  'canvas.portrait.tier3': '⚡ 75 % ODHALENO',
  'callout.yum': 'Ňam, ňam',
  'callout.dawn': 'KUROPĚNÍ! KOHOUT ZAKOKRHAL!',
  'callout.dawn_victory': '🐓 SVÍTÁNÍ! PŘEŽILI JSTE NOC – VÍTĚZSTVÍ!',
  'callout.time_stopped': 'ČAS SE ZASTAVIL',
  'callout.shepherd_flute': 'PASTÝŘSKÁ PÍŠŤALKA A DUSOT STÁDA',
  'callout.korenarka_smoke': 'OČISTNÉ KADIDLO Z DEVATERA BYLIN',
  'cutscene.granny.bubble1': 'Pojďte, chudinky, dám vám chleba se solí…',
  'cutscene.granny.bubble2': '…a k tomu vlídné slovo!',
  'cutscene.shepherd.bubble1': 'Húúú-tůůů! Běžte, beránci, zažeňte ty mátohy!',
  'cutscene.shepherd.bubble2': 'BÉÉÉ! DUSOT STÁDA!',
  'cutscene.korenarka.bubble1': 'Devatero bylin z hvozdu vyžene všechno zlé!',
  'cutscene.korenarka.bubble2': 'KLOK-KLOK! ✨ OČISTNÝ DÝM!',
  'banner.devil_rage': '🔥 ČERTOVSKÉ REJDY! ČERT ZUŘÍ A DUPE KOPYTY!',
  'banner.hejkal_beasts': '🌲 PROBUZENÍ HVOZDU! HEJKAL PŘIVOLÁVÁ LESNÍ ŠELMY!',
  'banner.cracking_granite': '🗿 PUKAJÍCÍ ŽULA! SKÁLY SE HROUTÍ A ŽULA PUKÁ!',
  'banner.mill_whirl': '🔥 PEKELNÉ MLETÍ! ČERTŮV MLÝN SE ROZTÁČÍ!',
  'banner.flood_gate': '🌊 STAVIDLA OTEVŘENA – POVODŇOVÁ VLNA!',
  'banner.flour_cloud': '💨 MOUČNÝ OBLAK – BÍLÁ TMA!',
  'banner.curse_belfry': '🗡️ PROKLETÍ HLÁSKY! BEZHLAVÝ RYTÍŘ CVÁLÁ PO BOJIŠTI!',
  'banner.severed_head': '💀 ODRAŽENÁ HLAVA SE VRACÍ!',
  'banner.dragon_awake': '🐉 VŠECHNY TŘI HLAVY PROBUZENY! OHEŇ, MRÁZ A VICHR KŘÍDEL!',
  'banner.falling_icicles': '🧊 POZOR NA PADAJÍCÍ RAMPOUCHY ZE STROPU SLUJE!',
  'level_unlock.tier1_title': '25 % – První stopa, mlha a obrysy krajiny',
  'level_unlock.tier2_title': '50 % – Zřetelná stezka, počasí a první běsi',
  'level_unlock.tier3_title': '75 % – Téměř plné barvy a odhalení hlavního bosse',
  'level_unlock.tier4_title': '100 % – Otevřená brána a neomezený přístup',
  'level_unlock.unlocked_all': 'Cesta do {name} je plně probádána a přístupna pro všechny vaše hrdiny a výpravy!',
  'hunter_unlock.tier1_title': '25 % – První stopa z lidových pověstí',
  'hunter_unlock.tier2_title': '50 % – Zřetelná kresba a odhalení zbraně',
  'hunter_unlock.tier3_title': '75 % – Téměř plné barvy a speciální schopnost',
  'hunter_unlock.tier4_title': '100 % – Plné odemčení a vstup do party',
  'hunter_unlock.unlocked_all': 'Lovec {name} se trvale přidá k tvé družině a bude kdykoliv k dispozici pro novou výpravu!',
  'grandfather_shop.title': 'DĚDEČEK A JEHO NŮŠE',
  'grandfather_shop.motto': '„Perníčky mám rád víc než zlato! Ber, dokud nůše voní!“',
  'grandfather_shop.pouch': '🍪 Nůše lovce: {count}',
  'grandfather_shop.wait_discount': 'Čekací sleva: −{discount}%',
  'grandfather_shop.luck': 'ŠTĚSTÍ: {luck}',
  'grandfather_shop.buy': 'KOUPIT',
  'grandfather_shop.upgrade': 'VYLEPŠIT',
  'grandfather_shop.obtain': 'ZÍSKAT',
  'grandfather_shop.maxed': 'VYČERPÁNO',
  'grandfather_shop.new_weapon': '⚔️ Nová zbraň',
  'grandfather_shop.level_badge': 'Úroveň: {current} / {max}',
  'grandfather_shop.reroll': '🧓 Poprosit dědečka o jiné zboží ({cost} 🍪)',
  'trophy.completed': '✅ Splněno',
  'trophy.claim': 'Vyzvednout (+{reward})',
  'trophy.uncompleted': '⏳ Nesplněno',
  'trophy.progress': 'Postup: {cur} / {max}',
};

const canvasStringsEn = {
  'canvas.portrait.tier0': '🔒 LOCKED (0%)',
  'canvas.portrait.tier1': '🔍 25% REVEALED',
  'canvas.portrait.tier2': '🔎 50% REVEALED',
  'canvas.portrait.tier3': '⚡ 75% REVEALED',
  'callout.yum': 'Yum, yum',
  'callout.dawn': 'COCK-A-DOODLE-DOO! DAWN IS HERE!',
  'callout.dawn_victory': '🐓 DAWN HAS BROKEN! YOU SURVIVED THE NIGHT – VICTORY!',
  'callout.time_stopped': 'TIME HAS STOPPED',
  'callout.shepherd_flute': 'SHEPHERD\'S FLUTE & TRAMPLING HERD',
  'callout.korenarka_smoke': 'PURIFYING INCENSE OF NINE HERBS',
  'cutscene.granny.bubble1': 'Come here, poor souls, I\'ll give you bread and salt…',
  'cutscene.granny.bubble2': '…and a kind word to go with it!',
  'cutscene.shepherd.bubble1': 'Toot-toot! Go, little rams, drive off those ghasts!',
  'cutscene.shepherd.bubble2': 'BAAA! HERD STAMPEDE!',
  'cutscene.korenarka.bubble1': 'Nine herbs from the wild wood will banish all evil!',
  'cutscene.korenarka.bubble2': 'BUBBLE-BUBBLE! ✨ CLEANSING SMOKE!',
  'banner.devil_rage': '🔥 DEVIL\'S REVELRY! THE DEVIL RAGES AND STAMPS HIS HOOVES!',
  'banner.hejkal_beasts': '🌲 AWAKENING OF THE FOREST! HOWLER CALLS WILD BEASTS!',
  'banner.cracking_granite': '🗿 CRACKING GRANITE! ROCKS CRUMBLE AND GRANITE SHATTERS!',
  'banner.mill_whirl': '🔥 INFERNAL MILLING! DEVIL\'S MILL SPINS!',
  'banner.flood_gate': '🌊 FLOODGATES OPENED – TIDAL WAVE!',
  'banner.flour_cloud': '💨 FLOUR CLOUD – WHITE DARKNESS!',
  'banner.curse_belfry': '🗡️ WATCHTOWER CURSE! HEADLESS KNIGHT CHARGES ACROSS THE FIELD!',
  'banner.severed_head': '💀 SEVERED HEAD RETURNS!',
  'banner.dragon_awake': '🐉 ALL THREE HEADS AWAKENED! FIRE, FROST AND GALE OF WINGS!',
  'banner.falling_icicles': '🧊 WATCH OUT FOR FALLING ICICLES FROM CAVE CEILING!',
  'level_unlock.tier1_title': '25% – First clue, mist and landscape contours',
  'level_unlock.tier2_title': '50% – Clear path, weather and first fiends',
  'level_unlock.tier3_title': '75% – Vivid colors and main boss reveal',
  'level_unlock.tier4_title': '100% – Open gate and unrestricted access',
  'level_unlock.unlocked_all': 'The path to {name} is fully explored and unlocked for all your heroes and expeditions!',
  'hunter_unlock.tier1_title': '25% – First clue from folklore',
  'hunter_unlock.tier2_title': '50% – Clear sketch and weapon reveal',
  'hunter_unlock.tier3_title': '75% – Near full color and special ability',
  'hunter_unlock.tier4_title': '100% – Fully unlocked and joined party',
  'hunter_unlock.unlocked_all': 'Hunter {name} has permanently joined your fellowship and is ready for any expedition!',
  'grandfather_shop.title': 'GRANDFATHER & HIS BASKET',
  'grandfather_shop.motto': '“I love gingerbread more than gold! Take it while the basket is warm!”',
  'grandfather_shop.pouch': '🍪 Hunter\'s pouch: {count}',
  'grandfather_shop.wait_discount': 'Patience discount: −{discount}%',
  'grandfather_shop.luck': 'LUCK: {luck}',
  'grandfather_shop.buy': 'BUY',
  'grandfather_shop.upgrade': 'UPGRADE',
  'grandfather_shop.obtain': 'CLAIM',
  'grandfather_shop.maxed': 'MAXED',
  'grandfather_shop.new_weapon': '⚔️ New Weapon',
  'grandfather_shop.level_badge': 'Level: {current} / {max}',
  'grandfather_shop.reroll': '🧓 Ask grandfather to rummage for fresh goods ({cost} 🍪)',
  'trophy.completed': '✅ Completed',
  'trophy.claim': 'Claim (+{reward})',
  'trophy.uncompleted': '⏳ Incomplete',
  'trophy.progress': 'Progress: {cur} / {max}',
};

Object.assign(newCs, canvasStringsCs);
Object.assign(newEn, canvasStringsEn);

// Key parity check
const csKeys = Object.keys(newCs).sort();
const enKeys = Object.keys(newEn).sort();

console.log('CS keys count:', csKeys.length);
console.log('EN keys count:', enKeys.length);

const missingInEn = csKeys.filter(k => !(k in newEn));
const missingInCs = enKeys.filter(k => !(k in newCs));

if (missingInEn.length > 0) {
  console.error('Missing in EN:', missingInEn);
  process.exit(1);
}
if (missingInCs.length > 0) {
  console.error('Missing in CS:', missingInCs);
  process.exit(1);
}

// Write out to src/i18n/locales/cs.ts and en.ts
const writeLocaleFile = (filename, dict, exportName) => {
  const lines = Object.entries(dict).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  const content = `export const ${exportName}: Record<string, string> = {\n${lines.join('\n')}\n};\n`;
  fs.writeFileSync(filename, content, 'utf8');
};

writeLocaleFile('src/i18n/locales/cs.ts', newCs, 'cs');
writeLocaleFile('src/i18n/locales/en.ts', newEn, 'en');
console.log('Successfully written updated cs.ts and en.ts with complete 100% parity!');
