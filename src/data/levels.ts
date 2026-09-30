export type GameLevelId = 1 | 2 | 3 | 4 | 5 | 6;

export interface GameLevelDef {
  id: GameLevelId;
  name: string;
  shortTitle: string;
  subtitle: string;
  theme: 'autumn_village' | 'autumn_graveyard' | 'winter_frost' | 'mill_forge' | 'ruined_castle' | 'dragon_cave';
  season: 'autumn' | 'winter';
  icon: string;
  badge: string;
  description: string;
  lore: string;
  unlockRequirementText: string;

  // Environment
  skyColor: string;
  nightSkyColor: string;
  groundColor: string;
  ambientTint: string;
  weatherEffect: 'leaves' | 'fog' | 'snow';
  decorTypes: string[];

  // Boss encounters
  miniBoss: {
    id: string;
    name: string;
    warning: string;
    time: number;
    kills: number;
    multiplier: number;
  };
  midBoss: {
    id: string;
    name: string;
    warning: string;
    time: number;
    kills: number;
    multiplier: number;
  };
  finalBoss: {
    id: string;
    name: string;
    warning: string;
    time: number;
    kills: number;
    multiplier: number;
  };

  // Wave spawn pools (mixed and matched from existing ENEMIES)
  spawnPools: {
    noon: string[];
    afternoon: string[];
    dusk: string[];
    night: string[];
    midnight: string[];
  };

  // Highlights for level selector card
  keyEnemies: Array<{
    id: string;
    name: string;
    icon: string;
    role: string;
  }>;
  bossMechanic?: {
    label: string;
    description: string;
    cadenceSeconds: number;
  };
}

export const GAME_LEVELS: Record<GameLevelId, GameLevelDef> = {
  1: {
    id: 1,
    name: '1. Náves a rybník Brčálník',
    shortTitle: 'Náves a rybník',
    subtitle: 'Zlatavý podzim, skotačivá havěť a rybniční rejdy',
    theme: 'autumn_village',
    season: 'autumn',
    icon: '🍂',
    badge: '1. Úroveň',
    description: 'Slunce ozařuje hrusické doškové střechy. Na mezích šmejdí rarášci a z rybníka Brčálníku vylézají nenechaví vodníci.',
    lore: 'Klidné venkovské odpoledne narušily divoké rejdy. Zažeňte polní a rybniční potvory a vykažte z hospodské náse samotného Pekelného Čerta!',
    unlockRequirementText: 'Výchozí úroveň – otevřena pro každého poutníka',

    skyColor: '#F7EDD5',
    nightSkyColor: '#282F3D',
    groundColor: '#F4ECE1',
    ambientTint: 'rgba(217, 160, 54, 0.08)',
    weatherEffect: 'leaves',
    decorTypes: ['cottage', 'tree', 'will_o_wisp', 'cross'],

    miniBoss: {
      id: 'polednice',
      name: '☀️ Polednice se srpem',
      warning: '☀️ POZOR: PŘICHÁZÍ POLEDNICE SE SRPEM! ☀️',
      time: 45,
      kills: 40,
      multiplier: 0.85,
    },
    midBoss: {
      id: 'hastrman',
      name: '💧 Hastrman z Brčálníku',
      warning: '💧 POZOR: Z HLUBIN VYSTUPUJE HASTRMAN! 💧',
      time: 95,
      kills: 95,
      multiplier: 1.05,
    },
    finalBoss: {
      id: 'cert',
      name: '👹 Pekelný Čert s vidlemi',
      warning: '⚠️ PŘICHÁZÍ ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️',
      time: 160,
      kills: 180,
      multiplier: 1.25,
    },

    spawnPools: {
      noon: ['rarach', 'zaba', 'mysak', 'sotek'],
      afternoon: ['blatouch', 'zaba', 'divozenka', 'rarach', 'sotek'],
      dusk: ['topivec', 'blatouch', 'divozenka', 'certik', 'bludicka'],
      night: ['topivec', 'hastrman', 'certik', 'ropucha', 'bludicka'],
      midnight: ['certik', 'topivec', 'ropucha', 'sazovy_rarach', 'bludicka'],
    },

    keyEnemies: [
      { id: 'rarach', name: 'Rarášek', icon: '👺', role: 'Polní havěť' },
      { id: 'zaba', name: 'Rybniční žabka', icon: '🐸', role: 'Vodní předvoj' },
      { id: 'blatouch', name: 'Blatouchový skřítek', icon: '🌼', role: 'Rybniční diblík' },
      { id: 'polednice', name: 'Polednice', icon: '☀️', role: 'Polední přízrak' },
      { id: 'cert', name: 'Pekelný Čert', icon: '👹', role: 'Hlavní boss' },
    ],
    bossMechanic: {
      label: 'Pekelný dupák a žhavé uhlíky',
      description: 'Čert zadupe kopytem, vyšle kruh žhavých jisker a přivolá nezbedné rarášky.',
      cadenceSeconds: 12,
    },
  },

  2: {
    id: 2,
    name: '2. Starý hřbitov a Hrusický hvozd',
    shortTitle: 'Hřbitov a hvozd',
    subtitle: 'Sychravá mlha, náhrobky, noční stíny a Půlnoční Hejkal',
    theme: 'autumn_graveyard',
    season: 'autumn',
    icon: '🪦',
    badge: '2. Úroveň',
    description: 'Za vesnickou zdí šumí staré duby a hřbitovní kříže pohlcuje chladná podzimní mlha. Ze země vystupují umrlci a z lesa hejká prastarý běs.',
    lore: 'V hlubokém hvozdu za márnicí se ztratil nejeden chasník. Připravte své vrbové pruty a postavte se nočním kostlivcům i obávanému Hejkalovi!',
    unlockRequirementText: 'Odemkne se po poražení Pekelného Čerta v 1. úrovni',

    skyColor: '#6B584E',
    nightSkyColor: '#1A1822',
    groundColor: '#36382E',
    ambientTint: 'rgba(38, 28, 48, 0.45)',
    weatherEffect: 'fog',
    decorTypes: ['tombstone', 'cross', 'tree', 'will_o_wisp', 'cottage'],

    miniBoss: {
      id: 'klekanice',
      name: '🔔 Večerní Klekánice',
      warning: '🔔 POZOR: ZVONÍ KLEKÁNÍ A PŘICHÁZÍ KLEKÁNICE! 🔔',
      time: 45,
      kills: 55,
      multiplier: 1.10,
    },
    midBoss: {
      id: 'drab',
      name: '⛓️ Pekelný dráb s karabáčem',
      warning: '⛓️ POZOR: PŘICHÁZÍ PEKELNÝ DRÁB S ŘETĚZY! ⛓️',
      time: 95,
      kills: 125,
      multiplier: 1.30,
    },
    finalBoss: {
      id: 'hejkal',
      name: '🌲 Půlnoční Hejkal z hvozdů',
      warning: '🌲 PŘICHÁZÍ ŠÉF ÚROVNĚ: PŮLNOČNÍ HEJKAL! 🌲',
      time: 165,
      kills: 230,
      multiplier: 1.55,
    },

    spawnPools: {
      noon: ['skeleton', 'cerny_pes', 'hrobnik', 'umrlec'],
      afternoon: ['hrobnik', 'pisar', 'skeleton_scythe', 'cerny_pes', 'drevorubec'],
      dusk: ['krvavy_kostlivec', 'skeleton_scythe', 'hrobnik', 'cerny_pes', 'umrlec'],
      night: ['bubak', 'krvavy_kostlivec', 'stodolnik', 'drevorubec', 'drab'],
      midnight: ['hromotluk', 'drab', 'bubak', 'krvavy_kostlivec', 'cerny_pes'],
    },

    keyEnemies: [
      { id: 'skeleton', name: 'Kostlivec', icon: '💀', role: 'Hřbitovní cháska' },
      { id: 'cerny_pes', name: 'Černý pes', icon: '🐕', role: 'Noční stín' },
      { id: 'bubak', name: 'Bubák ze stodoly', icon: '👻', role: 'Noční děs' },
      { id: 'klekanice', name: 'Klekánice', icon: '🔔', role: 'Večerní přízrak' },
      { id: 'hejkal', name: 'Půlnoční Hejkal', icon: '🌲', role: 'Hlavní boss' },
    ],
    bossMechanic: {
      label: 'Hromové zahejkání a padající větve',
      description: 'Mocný řev otřese hvozdem, vrhne salvu větví a přivolá lesní potvory.',
      cadenceSeconds: 12,
    },
  },

  3: {
    id: 3,
    name: '3. Ladovská zima na Melechově',
    shortTitle: 'Ladovská zima',
    subtitle: 'Třeskutý mráz, sněžná vánice a Skalní obr ze Sázavy',
    theme: 'winter_frost',
    season: 'winter',
    icon: '❄️',
    badge: '3. Úroveň',
    description: 'Bílé závěje přikryly chalupy, z okapů visí rampouchy a vánice skučí v komínech. Pod vrcholem Melechova se probouzí kamenný obr!',
    lore: 'Pravá Ladovská zima v plné síle! Mráz svírá pole a pekelný žár ohnivého muže taje rampouchy. Čelte větru i lavinám skalního titána!',
    unlockRequirementText: 'Odemkne se po poražení Půlnočního Hejkala ve 2. úrovni',

    skyColor: '#D8E8F5',
    nightSkyColor: '#152238',
    groundColor: '#EAF2F8',
    ambientTint: 'rgba(58, 118, 168, 0.15)',
    weatherEffect: 'snow',
    decorTypes: ['snowman', 'cottage', 'tree', 'cross'],

    miniBoss: {
      id: 'meluzina',
      name: '💨 Větrná Meluzína z komína',
      warning: '💨 POZOR: VÁNICE PŘINÁŠÍ DIVOKOU MELUZÍNU! 💨',
      time: 45,
      kills: 70,
      multiplier: 1.25,
    },
    midBoss: {
      id: 'ohnivy_muz',
      name: '🔥 Ohnivý rarach z pece',
      warning: '🔥 POZOR: Z PECE VYLETĚL ŽHOUCÍ OHNIVÝ RARACH! 🔥',
      time: 100,
      kills: 150,
      multiplier: 1.50,
    },
    finalBoss: {
      id: 'obr',
      name: '🗿 Skalní obr ze Sázavy',
      warning: '🗿 PŘICHÁZÍ LEGENDÁRNÍ BOSS: SKALNÍ OBR ZE SÁZAVY! 🗿',
      time: 170,
      kills: 270,
      multiplier: 1.80,
    },

    spawnPools: {
      noon: ['zmrzlik', 'vanicka', 'plivnik', 'sazovy_rarach'],
      afternoon: ['mrazik', 'meluzina', 'severak', 'zmrzlik', 'vanicka'],
      dusk: ['meluzina', 'mrazik', 'ohnivy_muz', 'severak', 'drab'],
      night: ['severak', 'ohnivy_muz', 'drab', 'meluzina', 'hromotluk'],
      midnight: ['hromotluk', 'drab', 'ohnivy_muz', 'severak', 'sazovy_rarach'],
    },

    keyEnemies: [
      { id: 'zmrzlik', name: 'Zmrzlík z okapu', icon: '🧊', role: 'Rampouchový diblík' },
      { id: 'meluzina', name: 'Meluzína', icon: '💨', role: 'Větrná zimní paní' },
      { id: 'ohnivy_muz', name: 'Ohnivý rarach', icon: '🔥', role: 'Pekelný žár' },
      { id: 'hromotluk', name: 'Hromotluk', icon: '🧌', role: 'Hřmotný silák' },
      { id: 'obr', name: 'Skalní obr', icon: '🗿', role: 'Legendární boss' },
    ],
    bossMechanic: {
      label: 'Sázavské zemětřesení a balvany',
      description: 'Obr vrhá valící se balvany a drtivým úderem do země vyvolává otřesy.',
      cadenceSeconds: 11,
    },
  },
  4: {
    id: 4, name: '4. Staré hamry a Čertův mlýn', shortTitle: 'Hamry a Čertův mlýn',
    subtitle: 'Žhavé výhně, moučný prach a zrádná povodeň', theme: 'mill_forge', season: 'autumn', icon: '⚙️', badge: '4. Úroveň',
    description: 'Pod zčernalými hamry se otáčí prokletý mlýn. Jiskry létají z kovadlin a mlynářova voda bere vše, co jí stojí v cestě.',
    lore: 'Zastavte zbojníky, jiskřivce a mlynářovy služebníky dřív, než se Čertův mlýn roztočí naplno.',
    unlockRequirementText: 'Odemkne se po poražení Skalního obra ve 3. úrovni', skyColor: '#8B5E3C', nightSkyColor: '#21150F', groundColor: '#514237', ambientTint: 'rgba(255, 125, 30, 0.16)', weatherEffect: 'fog', decorTypes: ['cottage', 'tree', 'will_o_wisp'],
    miniBoss: { id: 'zbojnik', name: '🗡️ Zbojník z hamrů', warning: '🗡️ ZE SOUTĚSKY VYRÁŽÍ ZBOJNÍK!', time: 45, kills: 80, multiplier: 1.40 },
    midBoss: { id: 'ohnivy_pes', name: '🔥 Ohnivý pes z výhně', warning: '🔥 VÝHEŇ VYPUSTILA OHNIVÉHO PSA!', time: 100, kills: 170, multiplier: 1.65 },
    finalBoss: { id: 'mlynar', name: '🌊 Prokletý Mlynář', warning: '🌊 ŠÉF ÚROVNĚ: MLYNÁŘ OTEVÍRÁ STAVIDLA!', time: 175, kills: 300, multiplier: 2.05 },
    spawnPools: { noon: ['zbojnik', 'jiskrivec', 'sazovy_rarach', 'sotek'], afternoon: ['zbojnik', 'jiskrivec', 'ohnivy_pes', 'ropucha'], dusk: ['ohnivy_pes', 'obrneny_zbojnik', 'zbojnik', 'drab'], night: ['ohnivy_pes', 'obrneny_zbojnik', 'drab', 'jiskrivec'], midnight: ['obrneny_zbojnik', 'ohnivy_pes', 'drab', 'sazovy_rarach'] },
    keyEnemies: [{ id: 'zbojnik', name: 'Zbojník', icon: '🗡️', role: 'Hamerský lapka' }, { id: 'jiskrivec', name: 'Jiskřivec', icon: '✨', role: 'Žhavý skřítek' }, { id: 'ohnivy_pes', name: 'Ohnivý pes', icon: '🔥', role: 'Strážce výhně' }, { id: 'mlynar', name: 'Mlynář', icon: '🌊', role: 'Hlavní boss' }],
    bossMechanic: { label: 'Povodňová vlna a moučný mrak', description: 'Pravidelné vlny tlačí lovce; moučný mrak na chvíli zhoršuje výhled.', cadenceSeconds: 14 },
  },
  5: {
    id: 5, name: '5. Pustá Hláska a Zlenické podhradí', shortTitle: 'Hláska a podhradí', subtitle: 'Bílé paní, zbrojnoši a bezhlavý jezdec', theme: 'ruined_castle', season: 'autumn', icon: '🏰', badge: '5. Úroveň',
    description: 'Rozbitými zdmi podhradí táhne ledový vítr. Přízraky hlídají cestu k věži, kde čeká rytíř bez hlavy.', lore: 'Přelstěte hradní stráž a vyhněte se odražené hlavě, která se vrací k pánovi jako střela.', unlockRequirementText: 'Odemkne se po poražení Prokletého Mlynáře ve 4. úrovni', skyColor: '#77808C', nightSkyColor: '#121520', groundColor: '#55545B', ambientTint: 'rgba(191, 219, 254, 0.15)', weatherEffect: 'fog', decorTypes: ['tombstone', 'cross', 'tree'],
    miniBoss: { id: 'bila_pani', name: '👻 Bílá paní z věže', warning: '👻 VĚŽ OPOUŠTÍ BÍLÁ PANÍ!', time: 45, kills: 90, multiplier: 1.55 }, midBoss: { id: 'zbrojnos', name: '🛡️ Zbrojnoš z podhradí', warning: '🛡️ BRÁNU DRŽÍ TĚŽKÝ ZBROJNOŠ!', time: 105, kills: 190, multiplier: 1.80 }, finalBoss: { id: 'bezhlavy_rytir', name: '🗡️ Bezhlavý rytíř', warning: '🗡️ ŠÉF ÚROVNĚ: BEZHLAVÝ RYTÍŘ VYJÍŽDÍ!', time: 180, kills: 330, multiplier: 2.25 },
    spawnPools: { noon: ['bila_pani', 'zbrojnos', 'skeleton', 'krvavy_kostlivec'], afternoon: ['bila_pani', 'zbrojnos', 'cerny_pes', 'krvavy_kostlivec'], dusk: ['zbrojnos', 'krvavy_kostlivec', 'obrneny_zbojnik', 'skeleton_scythe'], night: ['bila_pani', 'zbrojnos', 'bubak', 'obrneny_zbojnik'], midnight: ['zbrojnos', 'bubak', 'drab', 'obrneny_zbojnik', 'cerny_pes'] }, keyEnemies: [{ id: 'bila_pani', name: 'Bílá paní', icon: '👻', role: 'Hradní přízrak' }, { id: 'zbrojnos', name: 'Zbrojnoš', icon: '🛡️', role: 'Těžká stráž' }, { id: 'bezhlavy_rytir', name: 'Bezhlavý rytíř', icon: '🗡️', role: 'Hlavní boss' }], bossMechanic: { label: 'Odražená hlava', description: 'Rytířův odražený útok se vrací po bojišti a nutí měnit směr.', cadenceSeconds: 12 },
  },
  6: {
    id: 6, name: '6. Dračí sluj pod Melechovskou skálou', shortTitle: 'Dračí sluj', subtitle: 'Rampouchy, noční můry a líný tříhlavý drak', theme: 'dragon_cave', season: 'winter', icon: '🐉', badge: '6. Úroveň', description: 'V nejhlubší sluji pod skálou se střídá ledový dech s ohněm. Každý krok může spustit rampouch.', lore: 'Poslední výprava vede k tříhlavému drakovi: jedna hlava spí, druhá chrlí oheň a třetí hlídá kořist.', unlockRequirementText: 'Odemkne se po poražení Bezhlavého rytíře v 5. úrovni', skyColor: '#334155', nightSkyColor: '#080B15', groundColor: '#25313D', ambientTint: 'rgba(96, 165, 250, 0.18)', weatherEffect: 'snow', decorTypes: ['tree', 'cross', 'snowman'],
    miniBoss: { id: 'snehulak', name: '☃️ Prokletý Sněhulák', warning: '☃️ LEDOVÝ SNĚHULÁK SE KUTÁLÍ ZE SLUJE!', time: 45, kills: 100, multiplier: 1.70 }, midBoss: { id: 'nocni_mura', name: '🌑 Noční můra', warning: '🌑 TEMNOTOU SE ŽENE NOČNÍ MŮRA!', time: 105, kills: 210, multiplier: 1.95 }, finalBoss: { id: 'drak', name: '🐉 Tříhlavý líný Drak', warning: '🐉 ŠÉF ÚROVNĚ: PROBUDIL SE TŘÍHLAVÝ DRAK!', time: 185, kills: 360, multiplier: 2.50 },
    spawnPools: { noon: ['snehulak', 'nocni_mura', 'severak', 'sazovy_rarach'], afternoon: ['snehulak', 'nocni_mura', 'ohnivy_pes', 'mrazik'], dusk: ['nocni_mura', 'snehulak', 'ohnivy_pes', 'krvavy_kostlivec'], night: ['nocni_mura', 'snehulak', 'severak', 'obrneny_zbojnik'], midnight: ['snehulak', 'nocni_mura', 'ohnivy_pes', 'hromotluk', 'drab'] }, keyEnemies: [{ id: 'snehulak', name: 'Sněhulák', icon: '☃️', role: 'Ledový bijec' }, { id: 'nocni_mura', name: 'Noční můra', icon: '🌑', role: 'Stínový lovec' }, { id: 'drak', name: 'Drak', icon: '🐉', role: 'Hlavní boss' }], bossMechanic: { label: 'Rampouchy a tři dračí hlavy', description: 'Rampouchy padají ze stropu; drak střídá spící, ohnivou a hlídající hlavu.', cadenceSeconds: 10 },
  },
};

export function isLevelUnlocked(levelId: GameLevelId, highestUnlocked: number, bestiaryKills?: Record<string, number>): boolean {
  if (levelId === 1) return true;
  if (highestUnlocked >= levelId) return true;
  
  // Backward compatibility check with existing bestiary kills
  if (levelId === 2 && (bestiaryKills?.cert || 0) >= 1) return true;
  if (levelId === 3 && (bestiaryKills?.hejkal || 0) >= 1) return true;
  if (levelId === 4 && (bestiaryKills?.obr || 0) >= 1) return true;
  if (levelId === 5 && (bestiaryKills?.mlynar || 0) >= 1) return true;
  if (levelId === 6 && (bestiaryKills?.bezhlavy_rytir || 0) >= 1) return true;

  return false;
}
