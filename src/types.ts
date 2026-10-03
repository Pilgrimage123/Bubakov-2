export type Season = 'autumn' | 'winter' | string;
export type GameLevelId = 1 | 2 | 3 | 4 | 5 | 6 | number;
export type CharacterType = 'wanderer' | 'shepherd' | 'korenarka' | 'watchman' | 'sexton' | 'granny';

export interface DayPhase {
  id: string;
  name: string;
  timeRange: [number, number];
  skyColor: string;
  ambientTint: string;
  description?: string;
  icon?: string;
  bossSpawns?: string[];
}

export interface MetaProgression {
  krejcary: number;
  regenLevel?: number;
  ovenLevel?: number;
  scarecrowLevel?: number;
  millLevel?: number;
  wallLevel?: number;
  tavernShieldLevel?: number;
  forgeLevel?: number;
  churchLevel?: number;
  bellLevel?: number;
  forestLevel?: number;
  waterLevel?: number;
  undeadLevel?: number;
  unlockedHunters?: Record<string, boolean>;
  unlockedWeapons?: Record<string, boolean>;
  hunterKillCounts?: Record<string, any>;
  weaponKillCounts?: Record<string, any>;
  bestiaryKills?: Record<string, any>;
  highestSurviveTime?: number;
  selectedLevel?: number;
  highestLevelUnlocked?: number;
  completedLevels?: Record<string, boolean>;
  lightningWitnessed?: boolean;
  [key: string]: any;
}

export interface UpgradeChoice {
  type: 'new_weapon' | 'upgrade_weapon' | 'passive' | 'modifier';
  id?: string;
  stat?: string;
  name: string;
  desc: string;
  icon: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  type: string;
  icon: string;
  baseDmg: number;
  baseCd: number;
  speed?: number;
  desc: string;
  fire: (player: any, level: number) => boolean;
}

export interface EnemyStats {
  id: string;
  name: string;
  title: string;
  category: string;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  foodResist?: number;
  hunger?: number;
  poiseResist?: number;
  willpower?: number;
  xp: number;
  coinValue: number;
  method: string;
  palette?: string;
  weakness: string;
  strength: string;
  lore: string;
  danger: string;
}

export interface GameLevelDef {
  id: GameLevelId;
  name: string;
  shortTitle?: string;
  subtitle: string;
  season: Season;
  theme: string;
  icon?: string;
  badge?: string;
  description: string;
  lore?: string;
  unlockRequirementText?: string;
  skyColor?: string;
  nightSkyColor?: string;
  groundColor?: string;
  ambientTint?: string;
  weatherEffect?: string;
  decorTypes?: string[];
  spawnPools?: Record<string, string[]>;
  miniBoss?: any;
  midBoss?: any;
  finalBoss: any;
  bossMechanic?: any;
  keyEnemies?: any[];
  [key: string]: any;
}

export interface Trophy {
  id: string;
  title: string;
  desc: string;
  reward?: number;
  isMet?: (meta: any) => boolean;
  getProgress?: (meta: any) => { cur: number; max: number };
  icon?: string;
  unlocked?: (meta: any) => boolean;
}

export interface VillageBuilding {
  id: string;
  name: string;
  desc: string;
  cost: number[];
  maxLevel: number;
  icon: string;
}

export interface HunterProgress {
  id: any;
  isUnlocked: boolean;
  canUnlock: boolean;
  isQueued: boolean;
  curCount: any;
  maxCount: any;
  percent: number;
  tier: number;
  spoiledName?: any;
  spoiledTitle?: any;
  spoiledLore?: any;
  spoiledWeaponHint?: any;
  spoiledAbilityHint?: any;
  clueTag?: string;
  enemiesBreakdown?: any[];
  requiredHunterName?: string;
  [key: string]: any;
}

export interface WeaponProgress {
  id: any;
  isUnlocked: boolean;
  canUnlock: boolean;
  isQueued: boolean;
  curCount: any;
  maxCount: any;
  percent: number;
  tier: number;
  spoiledName?: any;
  spoiledTitle?: any;
  spoiledDesc?: any;
  spoiledStatsHint?: any;
  clueTag?: string;
  realIcon?: string;
  realType?: string;
  enemiesBreakdown?: any[];
  requiredWeaponName?: string;
  [key: string]: any;
}

export interface LevelProgress {
  id: any;
  isUnlocked: boolean;
  canUnlock: boolean;
  isQueued: boolean;
  curCount: any;
  maxCount: any;
  percent: number;
  tier: number;
  spoiledName?: any;
  spoiledShortTitle?: any;
  spoiledSubtitle?: any;
  spoiledDesc?: any;
  spoiledLore?: any;
  spoiledBossHint?: any;
  spoiledWeatherHint?: any;
  spoiledEnemiesHint?: any;
  spoiledIcon?: any;
  spoiledBadge?: any;
  clueTag?: string;
  enemiesBreakdown?: any[];
  bossDefeated?: boolean;
  requiredLevelName?: string;
  [key: string]: any;
}

export interface EnemyProgress {
  id: string;
  name: string;
  title: string;
  kills: number;
  maxKills: number;
  tier: number;
  isFullyRevealed: boolean;
}
