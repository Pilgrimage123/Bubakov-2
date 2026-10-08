export type Season = 'autumn' | 'winter' | string;
export type GameLevelId = 1 | 2 | 3 | 4 | 5 | 6;
export type CharacterType = 'wanderer' | 'shepherd' | 'korenarka' | 'watchman' | 'sexton' | 'granny';

export type WeaponId =
  | 'osikovy_prut'
  | 'valecnice'
  | 'cesnekova_topinka'
  | 'kysele_okurky';

export interface MilestoneChoice {
  id: string;
  name: string;
  folkNameCzech: string;
  description: string;
  visualEffectTag: string;
  audioSfx: string;
  statModifiers: {
    baseDamageMult?: number;
    cooldownMult?: number;
    areaRadiusMult?: number;
    pierceDelta?: number;
    projectileCountDelta?: number;
    knockbackMult?: number;
    statusDurationSec?: number;
    specialMechanicFlag?: string;
  };
}

export interface WeaponRankDef {
  rank: number;
  isMilestone: boolean;
  passiveBonusDescription: string;
  flatDamageBonus: number;
  cooldownReductionBonus: number;
  areaBonus: number;
  pierceBonus?: number;
  choices?: [MilestoneChoice, MilestoneChoice];
}

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
  type: 'new_weapon' | 'upgrade_weapon' | 'weapon_milestone'
    | 'weapon_mastery' | 'passive' | 'modifier';
  id?: string;
  stat?: string;
  masteryId?: string;
  milestoneRank?: number;
  milestoneChoiceId?: string;
  name: string;
  desc: string;
  icon: string;
}

export type StatusEffectType = 'pickle_sickness';

export interface StatusEffect {
  type: StatusEffectType;
  stacks: number;
  maxStacks: number;
  remaining: number;
  damageDealtMultiplier?: number;
  damageTakenMultiplier?: number;
  movementSpeedMultiplier?: number;
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

export type EnemyAttackCadence = 'fast' | 'normal' | 'slow';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  radius: number;
  damage: number;
  hp?: number;
  maxHp?: number;
  speed?: number;
  vx?: number;
  vy?: number;
  mass?: number;          // Hmotnost potvory (výchozí hodnota např. radius / 15)
  attackDelay?: number;   // Délka nápřahu v sekundách (např. 0.45s)
  attackRange?: number;   // Dosah úderu (musí být větší než radius + player.radius)
  windupTimer?: number;   // Aktuální časovač nápřahu (0 = nenapřahuje se)
  isAttacking?: boolean;  // Zda právě probíhá nápřah
  isBoss?: boolean;
  isMiniboss?: boolean;
  isDefeated?: boolean;
  dead?: boolean;
  attackCadence?: EnemyAttackCadence;
  attackInterval?: number;
  snackTimer?: number;
  stunTimer?: number;
  [key: string]: any;
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
  attackCadence: EnemyAttackCadence;
  attackInterval: number;
  cadenceDamageBonusPercent?: number;
  mass?: number;
  attackDelay?: number;
  attackRange?: number;
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
