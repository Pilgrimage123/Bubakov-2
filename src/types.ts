import type { EnemyRendererMethod } from './render/ladaRenderer';

export type Season = 'autumn' | 'winter';
export type GameLevelId = 1 | 2 | 3 | 4 | 5 | 6;

export type CharacterType = 'wanderer' | 'shepherd' | 'korenarka' | 'watchman' | 'sexton' | 'granny';

export type WeaponDamageType = 'food' | 'physical' | 'nature' | 'ice' | 'holy' | 'fire' | 'magic';

export type EnemyCategory = 
  | 'swarms'
  | 'undead'
  | 'shadows'
  | 'water'
  | 'frost'
  | 'fields'
  | 'demons'
  | 'bosses';

export interface EnemyStats {
  id: string;
  name: string;
  title: string;
  category: EnemyCategory;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  foodResist: number;
  hunger?: number;
  poiseResist: number;
  willpower: number;
  xp: number;
  coinValue: number;
  method: EnemyRendererMethod;
  palette?: 'soot' | 'crimson' | 'bog' | 'steel';
  weakness: string;
  strength: string;
  lore: string;
  danger: string;
  spawnMinTime?: number;
  spawnMaxTime?: number;
  dayPhaseAllowed?: DayPhaseId[];
}

export type DayPhaseId = 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight' | 'dawn';

export interface DayPhase {
  id: DayPhaseId;
  name: string;
  timeRange: [number, number];
  skyColor: string;
  ambientTint: string;
  description: string;
  icon: string;
  bossSpawns?: string[];
}

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponDamageType;
  icon: string;
  baseDmg: number;
  baseCd: number;
  speed?: number;
  desc: string;
  fire: (player: any, level: number) => boolean;
}

export interface UpgradeChoice {
  type: 'new_weapon' | 'upgrade_weapon' | 'passive' | 'modifier';
  id?: string;
  stat?: string;
  name: string;
  desc: string;
  icon: string;
}

export interface MetaProgression {
  krejcary: number;
  regenLevel: number;
  ovenLevel: number;
  scarecrowLevel: number;
  millLevel: number;
  wallLevel: number;
  bakeryLevel?: number;
  bellLevel?: number;
  tavernShieldLevel?: number;
  forgeLevel?: number;
  churchLevel?: number;
  verminLevel?: number;
  waterLevel?: number;
  undeadLevel?: number;
  windLevel?: number;
  forestLevel?: number;
  totalSoulsSaved: number;
  totalChasnikSaved: number;
  season: Season;
  trophiesClaimed: Record<string, boolean>;
  bestiaryKills: Record<string, number>;
  villageStoryRead?: Record<string, boolean>;
  highestSurviveTime?: number;
  unlockedHunters?: Record<CharacterType, boolean>;
  unlockedWeapons?: Record<string, boolean>;
  hunterKillCounts?: Partial<Record<CharacterType, Record<string, number>>>;
  weaponKillCounts?: Record<string, Record<string, number>>;
  lightningWitnessed?: boolean;
  selectedLevel?: GameLevelId;
  highestLevelUnlocked?: number;
  completedLevels?: Record<number, boolean>;
  levelKillCounts?: Record<number, Record<string, number>>;
}

export interface Trophy {
  id: string;
  title: string;
  desc: string;
  reward: number;
  isMet: (meta: MetaProgression, gameStats?: any) => boolean;
  getProgress: (meta: MetaProgression, gameStats?: any) => { cur: number; max: number };
}

export interface VillageBuilding {
  id: string;
  name: string;
  levelKey: keyof MetaProgression;
  role: string;
  helpers: string;
  story: string;
  bonusDesc: (level: number) => string;
  cost: (level: number) => number;
  canvasDrawer: string;
}
