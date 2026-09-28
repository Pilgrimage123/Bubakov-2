export type GameLevelId = 1 | 2 | 3;

export interface GameLevelDef {
  id: GameLevelId;
  name: string;
  shortTitle: string;
  subtitle: string;
  theme: 'autumn_village' | 'autumn_graveyard' | 'winter_frost';
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
      time: 35,
      kills: 22,
      multiplier: 1.15,
    },
    midBoss: {
      id: 'hastrman',
      name: '💧 Hastrman z Brčálníku',
      warning: '💧 POZOR: Z HLUBIN VYSTUPUJE HASTRMAN! 💧',
      time: 85,
      kills: 50,
      multiplier: 1.35,
    },
    finalBoss: {
      id: 'cert',
      name: '👹 Pekelný Čert s vidlemi',
      warning: '⚠️ PŘICHÁZÍ ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️',
      time: 150,
      kills: 75,
      multiplier: 1.6,
    },

    spawnPools: {
      noon: ['rarach', 'sotek', 'zaba', 'mysak', 'skodnik'],
      afternoon: ['blatouch', 'vodnicek', 'divozenka', 'zaba', 'rarach'],
      dusk: ['topivec', 'vodnicek', 'bludicka', 'divozenka', 'certik'],
      night: ['topivec', 'hastrman', 'bludicka', 'sotek', 'certik'],
      midnight: ['certik', 'topivec', 'hastrman', 'rarach', 'blatouch'],
    },

    keyEnemies: [
      { id: 'rarach', name: 'Rarášek', icon: '👺', role: 'Polní havěť' },
      { id: 'zaba', name: 'Rybniční žabka', icon: '🐸', role: 'Vodní předvoj' },
      { id: 'vodnicek', name: 'Mladý vodníček', icon: '💧', role: 'Vodní cháska' },
      { id: 'polednice', name: 'Polednice', icon: '☀️', role: 'Polední přízrak' },
      { id: 'cert', name: 'Pekelný Čert', icon: '👹', role: 'Hlavní boss' },
    ],
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
    lore: 'V hlubokém hvozdu za márnicí se ztratil nejeden chasník. Připravte své svěcené rákosky a postavte se nočním kostlivcům i obávanému Hejkalovi!',
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
      time: 40,
      kills: 25,
      multiplier: 1.25,
    },
    midBoss: {
      id: 'drab',
      name: '⛓️ Pekelný dráb s karabáčem',
      warning: '⛓️ POZOR: PŘICHÁZÍ PEKELNÝ DRÁB S ŘETĚZY! ⛓️',
      time: 90,
      kills: 55,
      multiplier: 1.45,
    },
    finalBoss: {
      id: 'hejkal',
      name: '🌲 Půlnoční Hejkal z hvozdů',
      warning: '🌲 PŘICHÁZÍ ŠÉF ÚROVNĚ: PŮLNOČNÍ HEJKAL! 🌲',
      time: 155,
      kills: 85,
      multiplier: 1.75,
    },

    spawnPools: {
      noon: ['skeleton', 'umrlec', 'pisar', 'cerny_pes', 'sotek'],
      afternoon: ['hrobnik', 'stodolnik', 'bubak', 'drevorubec', 'pisar'],
      dusk: ['klekanice', 'skeleton_scythe', 'hrobnik', 'cerny_pes', 'umrlec'],
      night: ['bubak', 'skeleton_scythe', 'stodolnik', 'drevorubec', 'drab'],
      midnight: ['hromotluk', 'skeleton_scythe', 'drab', 'bubak', 'cerny_pes'],
    },

    keyEnemies: [
      { id: 'skeleton', name: 'Kostlivec', icon: '💀', role: 'Hřbitovní cháska' },
      { id: 'cerny_pes', name: 'Černý pes', icon: '🐕', role: 'Noční stín' },
      { id: 'bubak', name: 'Bubák ze stodoly', icon: '👻', role: 'Noční děs' },
      { id: 'klekanice', name: 'Klekánice', icon: '🔔', role: 'Večerní přízrak' },
      { id: 'hejkal', name: 'Půlnoční Hejkal', icon: '🌲', role: 'Hlavní boss' },
    ],
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
      time: 40,
      kills: 28,
      multiplier: 1.35,
    },
    midBoss: {
      id: 'ohnivy_muz',
      name: '🔥 Ohnivý rarach z pece',
      warning: '🔥 POZOR: Z PECE VYLETĚL ŽHOUCÍ OHNIVÝ RARACH! 🔥',
      time: 90,
      kills: 60,
      multiplier: 1.5,
    },
    finalBoss: {
      id: 'obr',
      name: '🗿 Skalní obr ze Sázavy',
      warning: '🗿 PŘICHÁZÍ LEGENDÁRNÍ BOSS: SKALNÍ OBR ZE SÁZAVY! 🗿',
      time: 160,
      kills: 95,
      multiplier: 1.9,
    },

    spawnPools: {
      noon: ['zmrzlik', 'severak', 'vanicka', 'certik', 'plivnik'],
      afternoon: ['meluzina', 'mrazik', 'ohnivy_muz', 'severak', 'zmrzlik'],
      dusk: ['meluzina', 'mrazik', 'ohnivy_muz', 'drab', 'vanicka'],
      night: ['drab', 'ohnivy_muz', 'hromotluk', 'meluzina', 'severak'],
      midnight: ['drab', 'hromotluk', 'meluzina', 'severak', 'ohnivy_muz'],
    },

    keyEnemies: [
      { id: 'zmrzlik', name: 'Zmrzlík z okapu', icon: '🧊', role: 'Rampouchový diblík' },
      { id: 'meluzina', name: 'Meluzína', icon: '💨', role: 'Větrná zimní paní' },
      { id: 'ohnivy_muz', name: 'Ohnivý rarach', icon: '🔥', role: 'Pekelný žár' },
      { id: 'hromotluk', name: 'Hromotluk', icon: '🧌', role: 'Hřmotný silák' },
      { id: 'obr', name: 'Skalní obr', icon: '🗿', role: 'Legendární boss' },
    ],
  },
};

export function isLevelUnlocked(levelId: GameLevelId, highestUnlocked: number, bestiaryKills?: Record<string, number>): boolean {
  if (levelId === 1) return true;
  if (highestUnlocked >= levelId) return true;
  
  // Backward compatibility check with existing bestiary kills
  if (levelId === 2 && (bestiaryKills?.cert || 0) >= 1) return true;
  if (levelId === 3 && (bestiaryKills?.hejkal || 0) >= 1) return true;

  return false;
}
