import type {
  CharacterType,
  GameLevelId,
  GameLevelDef,
  MetaProgression,
  WeaponId,
  EnemyStats,
  EnemyAttackCadence,
  DropType,
  GameDrop,
  EnemyPrefixType,
} from '../types';
import { CADENCE_ATTACK_DELAYS, CADENCE_RECOVERY_DURATIONS, ENEMY_PREFIX_DEFS } from '../types';
import { type EngineState, type PendingMilestoneChoice, createInitialEngineState } from './engineState';
import { SpatialHash } from './spatialHash';
import { distanceSq, isInView } from './perf';
import { getCachedHomingTarget } from './homing';
import { isDirectTargetable } from './targeting';
import { tryEmitParticle, getParticleLimit } from './particles';
import { ENEMIES } from '../data/enemies';
import { GAME_LEVELS } from '../data/levels';
import { WEAPONS, createWeaponMasteryState, getWeaponDamage } from '../data/weapons';
import {
  ensureWeaponMilestones,
  getEffectiveWeaponCooldown,
  getMilestoneChoices,
  getRankedWeaponStats,
  getWeaponRankDef,
  COOLDOWN_REDUCTION_CAP,
  getWeaponActiveCooldownBonus,
  rollRandomWeaponUpgrade,
} from '../data/weaponMilestones';
import {
  getEnemyHolyResistance,
  getHolyDamageMultiplier,
  getHolyPushMultiplier,
  isUnholyEnemy,
} from '../data/holy';
import {
  getWallDamageReduction,
  getForestDebuffReduction,
  getMillSpeedMultiplier,
  getScarecrowPickupMultiplier,
  getWallHpMultiplier,
  getBoziMukaLuckMultiplier,
  getUndeadTolarChance,
  getChurchWaveDamage,
} from '../data/village';
import {
  performDropFusion,
  applyMagnetWave,
  pullWhipLoot,
  registerKillAndCheckCombo,
  createDropInstance,
  applyRareItemEffect,
  applyAnanasUpgrade,
  canSpawnRareBattleDrop,
  rollRareBattleDrop,
  getRareDropAnnouncement,
  resolveDynamicDrop,
  isHealingDrop,
  MAX_DROPS_LIMIT,
  hasPendingDrops,
  spawnDropWithLimit,
  releasePendingDrops,
  createPendingDropBank,
  type DropSpawnOptions,
} from './drops';
import { drawGingerbreadHeartCanvas } from '../render/pernicekCanvas';
import { drawGlyphText } from '../render/glyphAtlas';
import { CosmeticRingPool } from './cosmeticRingPool';
import type { GrandfatherItemDef } from '../data/grandfatherItems';
import { RunDirector } from './director';
import { getCurrentDayPhase } from '../constants';
import {
  getPetrolejkaRadius,
  isPositionIlluminated,
  evaluateShadowDefense,
  getShadowDefenseMultipliers,
  updateLightSources,
  evaluateBludickaAura,
  createOsikovySlashLight,
  createHolyCathedralLight,
  createGarlicHearthSpark,
  createCertEmberLight,
  seedLightingAndOccludersFromDecor,
  type DynamicLightSource,
  type ShadowZone,
  type LightOccluder,
} from './storybookLighting';
import {
  type CombatTextCategory,
  inferCombatTextCategory,
  isCombatTextCategoryEnabled,
} from './combatTextSettings';

export const MAX_PARTICLES = 300;
export const MAX_DAMAGE_TEXTS = 90;

export function compactInPlace<T>(items: T[], keep: (item: T) => boolean, onRecycle?: (item: T) => void): void {
  let write = 0;
  for (let read = 0; read < items.length; read++) {
    const item = items[read];
    if (keep(item)) {
      items[write] = item;
      write++;
    } else if (onRecycle) {
      onRecycle(item);
    }
  }
  items.length = write;
}

export class DamageText {
  x: number = 0;
  y: number = 0;
  text: string = '';
  color: string = '#FFFFFF';
  life: number = 1.0;
  size: number = 18;
  vy: number = -45;
  category: CombatTextCategory = 'enemyDamage';
  icon?: string;

  constructor(
    x: number = 0,
    y: number = 0,
    text: string = '',
    color = '#FFFFFF',
    big = false,
    category?: CombatTextCategory,
    icon?: string
  ) {
    this.reset(x, y, text, color, big, category, icon);
  }

  reset(
    x: number,
    y: number,
    text: string,
    color = '#FFFFFF',
    big = false,
    category?: CombatTextCategory,
    icon?: string
  ): void {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;

    // Pokud text obsahuje americkou sušenku 🍪 nebo je předána ikona gingerbread:
    if (icon) {
      this.icon = icon;
      this.text = String(text || '').replace(/🍪/g, '').replace(/\s{2,}/g, ' ').trim();
    } else if (typeof text === 'string' && text.includes('🍪')) {
      this.icon = 'gingerbread';
      this.text = text.replace(/🍪/g, '').replace(/\s{2,}/g, ' ').trim();
    } else {
      this.icon = undefined;
      this.text = text;
    }

    this.category = category || (this.icon === 'gingerbread' ? 'lootResources' : inferCombatTextCategory(text));
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  addAmount(amount: number): void {
    if (this.text && this.text.charCodeAt(0) >= 48 && this.text.charCodeAt(0) <= 57) {
      const num = parseInt(this.text, 10);
      if (!isNaN(num)) {
        const suffix = this.text.replace(/^[0-9]+/, '');
        this.text = `${num + amount}${suffix}`;
        this.life = Math.min(1.0, this.life + 0.25);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.icon && this.text && typeof drawGlyphText === 'function') {
      const drawn = drawGlyphText(ctx, this.text, this.x, this.y, {
        size: this.size,
        color: this.color,
        alpha: Math.max(0, this.life),
      });
      if (drawn) return;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.font = `900 ${this.size}px Eczar, serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2D1609';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (this.icon === 'gingerbread' || this.icon === 'pernicek') {
      const text = this.text;
      const textW = text ? ctx.measureText(text).width : 0;
      const iconSize = Math.round(this.size * 0.95);
      const gap = text ? 6 : 0;
      const totalW = textW + gap + iconSize;
      const startX = this.x - totalW / 2;

      if (text) {
        ctx.textAlign = 'left';
        ctx.strokeText(text, startX, this.y);
        ctx.fillText(text, startX, this.y);
      }

      const iconX = startX + textW + gap + iconSize / 2;
      const iconY = this.y - this.size * 0.32;
      drawGingerbreadHeartCanvas(ctx, iconX, iconY, iconSize);
    } else {
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillText(this.text, this.x, this.y);
    }

    ctx.restore();
  }
}

export class SmokePuff {
  x: number;
  y: number;
  radius: number;
  time: number;
  duration: number;
  dead: boolean;
  lobes: Array<{ ox: number; oy: number; r: number; vx: number; vy: number }>;
  wisps: Array<{ ox: number; oy: number; scale: number; rot: number; rotSpd: number; vy: number }>;
  poofDots: Array<{ x: number; y: number; vx: number; vy: number; r: number }>;

  constructor(x: number, y: number, radius = 22) {
    this.x = x;
    this.y = y;
    this.radius = Math.max(16, radius);
    this.time = 0;
    this.duration = 0.58;
    this.dead = false;

    this.lobes = [
      { ox: 0, oy: 0, r: this.radius * 0.95, vx: 0, vy: -18 },
      { ox: -this.radius * 0.55, oy: -this.radius * 0.2, r: this.radius * 0.72, vx: -22, vy: -12 },
      { ox: this.radius * 0.55, oy: -this.radius * 0.2, r: this.radius * 0.72, vx: 22, vy: -12 },
      { ox: 0, oy: -this.radius * 0.65, r: this.radius * 0.62, vx: 0, vy: -28 },
      { ox: -this.radius * 0.35, oy: -this.radius * 0.75, r: this.radius * 0.5, vx: -14, vy: -24 },
      { ox: this.radius * 0.35, oy: -this.radius * 0.75, r: this.radius * 0.5, vx: 14, vy: -24 },
    ];

    this.wisps = [
      { ox: -this.radius * 0.8, oy: this.radius * 0.1, scale: 0.9, rot: 0.3, rotSpd: -2.5, vy: -16 },
      { ox: this.radius * 0.8, oy: this.radius * 0.1, scale: 0.9, rot: -0.3, rotSpd: 2.5, vy: -16 },
      { ox: -this.radius * 0.3, oy: -this.radius * 1.1, scale: 0.75, rot: 0.5, rotSpd: 3.2, vy: -32 },
      { ox: this.radius * 0.3, oy: -this.radius * 1.1, scale: 0.75, rot: -0.5, rotSpd: -3.2, vy: -32 },
    ];

    this.poofDots = [];
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spd = 45 + Math.random() * 65;
      this.poofDots.push({
        x: this.x + Math.cos(ang) * (this.radius * 0.3),
        y: this.y + Math.sin(ang) * (this.radius * 0.3),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 15,
        r: 2.2 + Math.random() * 2.5,
      });
    }
  }

  update(dt: number): void {
    this.time += dt;
    if (this.time >= this.duration) {
      this.dead = true;
      return;
    }
    const expand = 1 + dt * 1.2;
    for (let i = 0; i < this.lobes.length; i++) {
      const l = this.lobes[i];
      l.ox += l.vx * dt;
      l.oy += l.vy * dt;
      l.r *= expand;
    }
    for (let i = 0; i < this.wisps.length; i++) {
      const w = this.wisps[i];
      w.oy += w.vy * dt;
      w.rot += w.rotSpd * dt;
      w.scale = Math.max(0, w.scale - dt * 0.9);
    }
    for (let i = 0; i < this.poofDots.length; i++) {
      const d = this.poofDots[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.r = Math.max(0, d.r - dt * 2.2);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const progress = Math.min(1, this.time / this.duration);
    const alpha = Math.max(0, 1 - Math.pow(progress, 1.8));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2D1609';
    ctx.lineWidth = 2.5;
    for (const l of this.lobes) {
      ctx.beginPath();
      ctx.arc(this.x + l.ox, this.y + l.oy, l.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

export type WeaponAction =
  | { type: 'projectile'; proj?: any; [key: string]: any }
  | { type: 'slash'; slash?: any; [key: string]: any }
  | { type: 'areaImpact'; impact?: any; [key: string]: any }
  | {
      type: 'pulse' | 'hromnickaPulse';
      pulse?: any;
      reach?: number;
      dmg?: number;
      level?: number;
      knockbackMult?: number;
      stunDuration?: number;
      [key: string]: any;
    }
  | {
      type: 'cloud';
      radius?: number;
      dmg?: number;
      duration?: number;
      stats?: any;
      [key: string]: any;
    };

export interface RunInitOptions {
  levelId?: GameLevelId;
  hunterType?: CharacterType;
  meta?: MetaProgression;
  customWeapons?: any[];
  spawnInitialWave?: boolean;
  seed?: number;
  directorAdaptability?: number;
  dynamicDifficulty?: number;
}

export interface GameEngineCallbacks {
  onSound?: (soundName: string, ...args: any[]) => void;
  onDamageText?: (text: DamageText) => void;
  onPlayerTakeDamage?: (amount: number, type: string) => void;
  onPlayerDeath?: () => void;
  onDropPickup?: (drop: any) => void;
  onEnemyDefeated?: (enemy: any) => void;
  onRescueChasnik?: (x: number, y: number) => void;
  onOpenChest?: () => void;
  onWarningBanner?: (msg: string) => void;
}

export class GameEngine {
  public state: EngineState;
  public spatialHash: SpatialHash<any>;
  public livingEnemies: any[];
  public director: RunDirector | null = null;
  public callbacks?: GameEngineCallbacks;
  public enemyFactory?: (
    id: string,
    x: number,
    y: number,
    multiplier?: number,
    isBoss?: boolean,
    isMiniboss?: boolean,
    customBossTitle?: string,
    prefix?: EnemyPrefixType
  ) => any;
  private projectilePool: any[] = [];
  private slashPool: any[] = [];
  private dropPool: GameDrop[] = [];
  private damageTextPool = new CosmeticRingPool<DamageText>(MAX_DAMAGE_TEXTS, () => new DamageText(0, 0, ''));

  constructor(
    initialStateOrOptions?: EngineState | RunInitOptions,
    spatialCellSize = 180,
    callbacks?: GameEngineCallbacks
  ) {
    this.spatialHash = new SpatialHash(spatialCellSize);
    this.livingEnemies = [];
    this.callbacks = callbacks;

    if (initialStateOrOptions && 'camera' in initialStateOrOptions && 'keys' in initialStateOrOptions) {
      this.state = initialStateOrOptions as EngineState;
      if (this.state.enemies && this.state.enemies.length > 0) {
        this.livingEnemies = this.state.enemies.filter((e) => !e.isDefeated && !e.dead);
        this.spatialHash.rebuild(this.livingEnemies);
      }
    } else {
      this.state = createInitialEngineState();
      if (initialStateOrOptions) {
        this.initRun(initialStateOrOptions as RunInitOptions);
      }
    }
  }

  public addDamageText(
    x: number,
    y: number,
    text: string,
    color = '#FFFFFF',
    big = false,
    category?: CombatTextCategory
  ): DamageText | null {
    const cat = category || inferCombatTextCategory(text);
    if (!isCombatTextCategoryEnabled(cat)) return null;
    const dt = this.damageTextPool.acquire();
    dt.reset(x, y, text, color, big, cat);
    if (!this.state.texts.includes(dt)) {
      this.state.texts.push(dt);
    }
    this.callbacks?.onDamageText?.(dt);
    return dt;
  }

  public initRun(
    optionsOrLevelId?: GameLevelId | RunInitOptions,
    hunterType?: CharacterType,
    meta?: MetaProgression,
    customWeapons?: any[]
  ): EngineState {
    let levelId: GameLevelId = 1;
    let chosenHunter: CharacterType = 'wanderer';
    let metaProg: MetaProgression | undefined = meta;
    let weapons: any[] | undefined = customWeapons;
    let spawnInitialWave = true;

    if (typeof optionsOrLevelId === 'object' && optionsOrLevelId !== null) {
      levelId = (optionsOrLevelId.levelId ?? 1) as GameLevelId;
      chosenHunter = optionsOrLevelId.hunterType ?? 'wanderer';
      metaProg = optionsOrLevelId.meta ?? meta;
      weapons = optionsOrLevelId.customWeapons ?? customWeapons;
      if (optionsOrLevelId.spawnInitialWave !== undefined) {
        spawnInitialWave = optionsOrLevelId.spawnInitialWave;
      }
    } else if (typeof optionsOrLevelId === 'number') {
      levelId = optionsOrLevelId as GameLevelId;
      chosenHunter = hunterType ?? 'wanderer';
    }

    const nextState = createInitialEngineState();
    nextState.activeLevelId = levelId;
    const levelDef: GameLevelDef = GAME_LEVELS[levelId] || GAME_LEVELS[1];
    nextState.nextBossMechanicAt = levelDef.bossMechanic?.cadenceSeconds ?? Number.POSITIVE_INFINITY;
    nextState.spawnTimer = (levelId === 1 || levelId === 0) ? 3.5 : 2.0;

    const seed = typeof optionsOrLevelId === 'object' && optionsOrLevelId !== null ? optionsOrLevelId.seed : undefined;
    const dynamicDifficulty =
      typeof optionsOrLevelId === 'object' && optionsOrLevelId !== null && optionsOrLevelId.dynamicDifficulty !== undefined
        ? optionsOrLevelId.dynamicDifficulty
        : typeof optionsOrLevelId === 'object' && optionsOrLevelId !== null && optionsOrLevelId.directorAdaptability !== undefined
        ? optionsOrLevelId.directorAdaptability
        : 3.0;

    const profile = metaProg?.performanceProfile || (metaProg?.performanceMode ? 'performance' : 'balanced');
    const maxLivingEnemies = profile === 'performance' ? 35 : profile === 'balanced' ? 55 : 70;

    this.director = new RunDirector(levelId, seed, { dynamicDifficulty, maxLivingEnemies });
    nextState.director = this.director;
    nextState.activeRozmar = this.director.rozmar;
    nextState.directorAdaptability = dynamicDifficulty;
    nextState.dynamicDifficulty = dynamicDifficulty;

    this.state = nextState;
    this.state.meta = metaProg;
    this.spatialHash.clear();
    this.livingEnemies = [];
    this.damageTextPool.clear();

    this.state.player = this.createPlayer(chosenHunter, metaProg, weapons);

    if (this.state.decor && this.state.decor.length > 0) {
      seedLightingAndOccludersFromDecor(
        this.state.decor,
        this.state.lightSources,
        this.state.shadowZones,
        this.state.occluders
      );
    }

    if (spawnInitialWave) {
      this.spawnOpeningWave(levelId);
    }

    return this.state;
  }

  public createPlayer(
    type: CharacterType = 'wanderer',
    meta?: MetaProgression,
    customWeapons?: any[]
  ): any {
    const baseMaxHp =
      type === 'wanderer'
        ? 200
        : type === 'shepherd'
        ? 110
        : type === 'korenarka'
        ? 125
        : type === 'sexton'
        ? 135
        : type === 'granny'
        ? 130
        : 140;

    const baseSpeed =
      type === 'wanderer'
        ? 165
        : type === 'shepherd'
        ? 220
        : type === 'korenarka'
        ? 180
        : type === 'sexton'
        ? 170
        : type === 'granny'
        ? 165
        : 175;

    const basePickup =
      type === 'wanderer'
        ? 75
        : type === 'shepherd'
        ? 160
        : type === 'korenarka'
        ? 105
        : type === 'sexton'
        ? 110
        : type === 'granny'
        ? 125
        : 115;

    const initialWeapons =
      customWeapons && customWeapons.filter((w) => w.level > 0).length > 0
        ? customWeapons
            .filter((w) => w.level > 0)
            .map((w) => {
              const mapped = {
                ...w,
                cd: 0,
                mastery: w.mastery || createWeaponMasteryState(),
                milestones: (w as any).milestones || [],
                synergisticUpgrades: (w as any).synergisticUpgrades || [],
              };
              ensureWeaponMilestones(mapped);
              return mapped;
            })
        : type === 'wanderer'
        ? [{ id: 'osikovy_prut', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : type === 'shepherd'
        ? [{ id: 'povidlove_buchty', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : type === 'korenarka'
        ? [{ id: 'devatero_kviti', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : type === 'sexton'
        ? [{ id: 'svecena_kropenka', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : type === 'granny'
        ? [{ id: 'kynuty_kolac', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : [{ id: 'kovana_halapartna', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }];

    initialWeapons.forEach((w: any) => {
      ensureWeaponMilestones(w);
      w._cachedStats = getRankedWeaponStats(w.id, w.level, w);
    });

    const wallBonusHp = Math.round(baseMaxHp * getWallHpMultiplier(meta?.wallLevel || 0));
    const millBonusSpeed = Math.round(baseSpeed * getMillSpeedMultiplier(meta?.millLevel || 0));
    const rawBasePickup = type === 'korenarka' ? 26 : basePickup;
    const scarecrowBonusPickup = Math.round(rawBasePickup * getScarecrowPickupMultiplier(meta?.scarecrowLevel || 0));
    const wallDmgRed = getWallDamageReduction(meta?.wallLevel || 0);

    const baseLuck =
      type === 'granny'
        ? 120
        : type === 'shepherd'
        ? 105
        : type === 'wanderer'
        ? 100
        : type === 'sexton'
        ? 100
        : type === 'watchman'
        ? 90
        : type === 'korenarka'
        ? 85
        : 100;
    const boziMukaBonusLuck = Math.round(baseLuck * getBoziMukaLuckMultiplier(meta?.boziMukaLevel || 0));

    const self = this;

    const player = {
      x: 0,
      y: 0,
      radius: 20,
      type,
      maxHp: baseMaxHp + wallBonusHp,
      hp: baseMaxHp + wallBonusHp,
      speed: baseSpeed + millBonusSpeed,
      pickupRadius: rawBasePickup + scarecrowBonusPickup,
      luck: baseLuck + boziMukaBonusLuck,
      weapons: initialWeapons,
      _firingWeapon: null as any,
      damageMultiplier: 1,
      churchLevel: meta?.churchLevel || 0,
      holyDamageMultiplier: 1 + Math.max(0, meta?.churchLevel || 0) * 0.08,
      tulakDamageBonus: type === 'wanderer' ? 35 : 0,
      cooldownMultiplier: 1,
      cooldownBonus: 0,
      kavaCount: 0,
      jelitoCount: 0,
      kurazCount: 0,
      speedCount: 0,
      magnetCount: 0,
      damageReduction: wallDmgRed,
      regenLevel: meta?.regenLevel || 0,
      regenTimer: 0,
      invulnerabilityTimer: 0,
      repulseCooldown: 0,
      intangibleTimer: 0,
      guaranteedCritTimer: 0,
      facingAngle: 0,
      dodgeCooldown: 0,
      tavernShieldLevel: meta?.tavernShieldLevel || 0,
      tempShield: 0,
      herbTimer: 0,
      soulBuffTimer: 0,
      waterSoakedTimer: 0,
      slowTimer: 0,
      hasSoakedCane: false,
      hromnickaPulseTimer: 0,
      hromnickaPulseRadius: 0,
      ultCd: 0,
      ultMaxCd: type === 'wanderer' ? 21 : type === 'granny' ? 45 : type === 'sexton' ? 35 : 30,
      lastDx: 1,
      lastDy: 0,
      animTime: 0,
      valecniceAngle: 0,
      valecniceHitTimer: 0,
      garlicAuraTimer: 0,
      _valecniceSlowRadius: 0,
      _valecniceSlowRate: 0,
      _valecnicePulse: false,
      _garlicPulse: false,
      _caneSwingAlt: false,

      distTo(e: any) {
        return Math.hypot(e.x - this.x, e.y - this.y);
      },

      distSqTo(e: any) {
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        return dx * dx + dy * dy;
      },

      getLivingEnemies() {
        return self.livingEnemies;
      },

      getNearbyEnemies(radius = 850) {
        return self.spatialHash.queryCircle(this.x, this.y, radius);
      },

      spawnProjectile(proj: any) {
        return self.applyWeaponAction({ type: 'projectile', proj });
      },

      spawnMeleeSlash(slash: any) {
        return self.applyWeaponAction({ type: 'slash', slash });
      },

      spawnAreaImpact(impact: any) {
        return self.applyWeaponAction({ type: 'areaImpact', impact });
      },

      spawnHromnickaPulse(reach: number, dmg: number, level: number, knockbackMult = 1, stunDuration = 0) {
        return self.applyWeaponAction({
          type: 'pulse',
          reach,
          dmg,
          level,
          knockbackMult,
          stunDuration,
        });
      },

      spawnFajfkaCloud(radius: number, dmg: number, duration: number, stats?: any) {
        return self.applyWeaponAction({
          type: 'cloud',
          radius,
          dmg,
          duration,
          stats,
        });
      },

      counterMeleeAttacker(attacker: any) {
        if (!attacker || attacker.isDefeated || attacker.dead) return;
        if ((this.repulseCooldown || 0) > 0) return;
        this.repulseCooldown = 1.2;
        const dx = attacker.x - this.x;
        const dy = attacker.y - this.y;
        const rawDist = Math.hypot(dx, dy);
        let nx = rawDist > 0.001 ? dx / rawDist : (this.lastDx || 1);
        let ny = rawDist > 0.001 ? dy / rawDist : (this.lastDy || 0);
        const dirLength = Math.hypot(nx, ny) || 1;
        nx /= dirLength;
        ny /= dirLength;
        // Poškození, odhození a stun škálují s maximální Kuráží lovce.
        const courageScale = Math.max(0.25, (this.maxHp || 200) / 200);
        const counterDmg = Math.max(1, Math.round((this.maxHp || 0) * 0.30));
        const pushForce = 1080 * courageScale;
        const stunDuration = 0.875 * courageScale;
        const kbx = nx * pushForce;
        const kby = ny * pushForce;

        attacker.takeDamage(counterDmg, 'physical', kbx, kby, {
          isHunterCounter: true,
          stunDuration,
          source: 'hunter_contact_repulse',
        });

        self.callbacks?.onSound?.('heavyHit');
        self.state.texts.push(new DamageText(attacker.x, attacker.y - 48, 'ODSTRČENÍ! 💨', '#F59E0B', true, 'combatStates'));
      },

      takeDamage(amount: number, type = 'physical', attacker?: any, isMelee?: boolean) {
        if (this.hp <= 0) return;
        if (this.invulnerabilityTimer > 0 || (this.intangibleTimer && this.intangibleTimer > 0)) return;
        if ((meta?.windLevel || 0) > 0 && this.dodgeCooldown <= 0) {
          this.dodgeCooldown = Math.max(10, 60 - (meta?.windLevel || 0) * 10);
          self.state.texts.push(new DamageText(this.x, this.y - 35, 'DODGE!', '#F59E0B', true, 'combatStates'));
          return;
        }
        let totalDamageReduction = this.damageReduction;
        if (self.state.holyCircle && (this.holyCircleStacks || 0) > 0) {
          const pDist = Math.hypot(this.x - self.state.holyCircle.x, this.y - self.state.holyCircle.y);
          if (pDist <= self.state.holyCircle.radius) {
            totalDamageReduction = Math.min(0.85, totalDamageReduction + Math.min(0.60, this.holyCircleStacks * 0.20));
          }
        }
        const hurtDmg = Math.max(1, amount * (1 - totalDamageReduction));
        const hpBeforeDamage = this.hp;
        let remainingDmg = hurtDmg;
        let absorbed = 0;
        if (this.tempShield > 0) {
          absorbed = Math.min(this.tempShield, remainingDmg);
          this.tempShield -= absorbed;
          remainingDmg -= absorbed;
        }
        if (remainingDmg > 0) this.hp = Math.max(0, this.hp - remainingDmg);
        // Grant brief invulnerability only if this hit actually removes courage.
        if (this.hp < hpBeforeDamage) {
          this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer || 0, 0.3);
        }
        self.callbacks?.onSound?.('hit');
        self.callbacks?.onPlayerTakeDamage?.(hurtDmg, type);

        if (absorbed > 0 && remainingDmg <= 0) {
          self.state.texts.push(new DamageText(this.x, this.y - 35, 'ŠTÍT POHLTIL! 🛡️', '#38BDF8', true));
        } else {
          self.state.texts.push(new DamageText(this.x, this.y - 35, `-${Math.ceil(remainingDmg)}`, '#EF4444'));
        }

        if (this.hp <= 0) {
          this.hp = 0;
          self.callbacks?.onPlayerDeath?.();
          self.state.fleeTimer = 3.0;
          self.state.enemies.forEach((m) => {
            m.panicked = true;
            m.vx = -m.vx * 3;
            m.vy = -m.vy * 3;
          });
        }
      },

      triggerWeaponMastery(_weaponId: string, _enemy: any, _event: 'hit' | 'pulse' = 'hit') {
        // Legacy no-op
      },
    };

    return player;
  }

  private spawnOpeningWave(levelId: GameLevelId): void {
    const player = this.state.player;
    if (!player) return;

    if (levelId === 0) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        this.spawnMonster('vrana', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.7);
      }
    } else if (levelId === 1) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        this.spawnMonster('rarach', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75);
      }
    } else if (levelId === 2) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.5;
        this.spawnMonster('skeleton', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 0.9);
      }
      this.spawnMonster('cerny_pes', player.x + 480, player.y - 100, 0.9);
    } else if (levelId === 3) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2;
        this.spawnMonster('zmrzlik', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 1.0);
      }
      this.spawnMonster('vanicka', player.x - 440, player.y - 180, 1.0);
    } else if (levelId === 4) {
      this.spawnMonster('zbojnik', player.x + 460, player.y, 1.0);
      this.spawnMonster('jiskrivec', player.x - 460, player.y, 1.0);
    } else if (levelId === 5) {
      this.spawnMonster('zbrojnos', player.x + 460, player.y + 100, 1.0);
      this.spawnMonster('bila_pani', player.x - 460, player.y - 100, 1.0);
    } else if (levelId === 6) {
      this.spawnMonster('snehulak', player.x + 460, player.y, 1.0);
      this.spawnMonster('nocni_mura', player.x - 460, player.y, 1.0);
    }
  }

  public spawnMonster(
    id: string,
    x: number,
    y: number,
    multiplier = 1,
    isBoss = false,
    isMiniboss = false,
    customBossTitle?: string,
    prefix?: EnemyPrefixType
  ): any {
    const enemy = this.enemyFactory
      ? this.enemyFactory(id, x, y, multiplier, isBoss, isMiniboss, customBossTitle, prefix)
      : this.createHeadlessEnemy(id, x, y, multiplier, isBoss, isMiniboss, customBossTitle, prefix);

    this.state.enemies.push(enemy);
    if (!enemy.isDefeated && !enemy.dead) {
      this.livingEnemies.push(enemy);
      this.spatialHash.insert(enemy);
      this.director?.recordEnemySpawn(enemy, this.state.gameTime);
    }
    return enemy;
  }

  public spawnDrop(type: DropType, x: number, y: number, opts: DropSpawnOptions = {}): GameDrop | null {
    let resolvedType = type;
    let isHot = opts.isHot;
    let expiration = opts.expiration;
    let isMercyDrop = opts.isMercyDrop;

    if (this.director && isHealingDrop(type)) {
      const playerHp = this.state.player?.hp ?? 100;
      const playerMaxHp = this.state.player?.maxHp ?? 100;
      const resolution = resolveDynamicDrop(type, playerHp, playerMaxHp, {
        value: opts.value,
        size: opts.size,
        vulnerabilityScore: this.director.vulnerabilityScore,
        pacingPhase: this.director.dropPacingPhase,
        mercyCooldownActive: this.director.mercyPityCooldown > 0,
      });
      resolvedType = resolution.type;
      if (resolution.isHot) isHot = true;
      if (resolution.expiration) expiration = resolution.expiration;
      if (resolution.isMercyDrop) isMercyDrop = true;
    }

    // The engine's state array is the single source of truth. Never fall back
    // to constructing an unmanaged item when the 40-slot arena is full.
    const pooled = this.dropPool.pop();
    const drop = createDropInstance(
      resolvedType,
      x,
      y,
      {
        ...opts,
        isHot,
        expiration,
        isHeavyAnchor: opts.isHeavyAnchor,
        isMercyDrop,
      },
      pooled,
    );
    const pendingBank = this.state.pendingDropBank
      ?? (this.state.pendingDropBank = createPendingDropBank());

    if (!spawnDropWithLimit(this.state.drops, drop, pendingBank)) {
      if (this.dropPool.length < 100) this.dropPool.push(drop);
      return null;
    }

    return drop;
  }

  public createHeadlessEnemy(
    id: string,
    x: number,
    y: number,
    multiplier = 1,
    isBoss = false,
    isMiniboss = false,
    customBossTitle?: string,
    prefix?: EnemyPrefixType
  ): any {
    let resolvedId = id;
    let stats: EnemyStats = ENEMIES[resolvedId];
    if (!stats) {
      console.warn(`[Bubakov] Unknown enemy id: "${id}" in createHeadlessEnemy, resolving safe fallback`);
      const fallbackMap: Record<string, string> = {
        kostlivec_obr: 'umrlec',
        kostlivec: 'skeleton',
        kostlivec_koste: 'skeleton_scythe',
        smrtka_minion: 'krvavy_kostlivec',
        rampouch: 'severak',
        sanice: 'vanicka',
        medved_bubak: 'hromotluk',
        lapka: 'zbojnik',
        uhlif: 'sazovy_rarach',
        cernokneznik_minion: 'plivnik',
        permonik: 'zbojnik',
        kamenny_bubak: 'obrneny_zbojnik',
        prizrak: 'bila_pani',
        panos: 'zbrojnos',
        strazce: 'obrneny_zbojnik',
        chrlivka: 'nocni_mura',
        netopyr_obr: 'bubak',
        draci_plivnik: 'plivnik',
        lavy_rarach: 'sazovy_rarach',
        pekelny_pes: 'ohnivy_pes',
      };
      resolvedId = fallbackMap[id] || (this.state.activeLevelId === 2 ? 'skeleton' : 'rarach');
      stats = ENEMIES[resolvedId] || ENEMIES.rarach;
    }

    const isLevel0 = (this.state.activeLevelId ?? 0) === 0;
    let finalHp = Math.round(stats.hp * (multiplier || 1));
    if (isMiniboss) {
      finalHp = isLevel0 ? Math.max(finalHp, 220) : Math.max(finalHp, 1400);
    }
    const renderScale = isMiniboss ? 1.75 : isBoss ? 1.35 : 1.0;
    const radius = isMiniboss ? Math.round(stats.radius * 1.65) : isBoss ? stats.radius * 1.3 : stats.radius;
    let poiseResist = isMiniboss ? Math.max(0.82, (stats.poiseResist || 0) + 0.45) : stats.poiseResist || 0;
    const foodResist = isMiniboss ? Math.max(0.78, (stats.foodResist || 0) + 0.45) : stats.foodResist || 0;
    const hunger = isMiniboss
      ? Math.max(0.78, (stats.hunger !== undefined ? stats.hunger : stats.foodResist || 0) + 0.45)
      : stats.hunger !== undefined
      ? stats.hunger
      : stats.foodResist || 0;
    const willpower = isMiniboss ? Math.max(0.85, (stats.willpower || 0) + 0.45) : stats.willpower || 0;
    const cadence: EnemyAttackCadence = stats.attackCadence || 'normal';
    let attackInterval = stats.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
    const baseDamage = isMiniboss ? Math.round(stats.damage * (isLevel0 ? 1.05 : 1.35)) : stats.damage;
    let enemySpeed = stats.speed;
    let enemyDamage = baseDamage;
    let dodgeChance = 0;
    let prefixDamageReduction = 0;
    let isThunderous = false;
    let hasFireTrail = false;

    if (prefix) {
      const pDef = ENEMY_PREFIX_DEFS[prefix];
      if (pDef) {
        if (pDef.hpMultiplier) finalHp = Math.max(1, Math.round(finalHp * pDef.hpMultiplier));
        if (pDef.speedBonus) enemySpeed += pDef.speedBonus;
        if (pDef.speedMultiplier) enemySpeed = Math.round(enemySpeed * pDef.speedMultiplier);
        if (pDef.attackIntervalMultiplier) attackInterval = attackInterval * pDef.attackIntervalMultiplier;
        if (pDef.dodgeChance) dodgeChance = pDef.dodgeChance;
        if (pDef.damageReduction) prefixDamageReduction = pDef.damageReduction;
        if (prefix === 'hromovy') isThunderous = true;
        if (prefix === 'pekelny') hasFireTrail = true;
        if (prefix === 'kamenny') poiseResist = Math.min(0.98, poiseResist + 0.6);
      }
    }

    const coinValue = isMiniboss ? Math.max(25, (stats.coinValue || 1) * 6) : stats.coinValue || 1;
    const xp = isMiniboss ? Math.max(20, (stats.xp || 1) * 5) : stats.xp;

    const isLevel1 = (this.state.activeLevelId ?? 1) === 1;
    let finalSpeed = isMiniboss ? Math.max(enemySpeed * 0.95, 68) : enemySpeed;
    if (resolvedId === 'polednice' && isLevel1) {
      finalSpeed = Math.round(finalSpeed * 0.85);
    }

    const mass = typeof stats.mass === 'number' ? stats.mass : radius / 15;
    let attackDelay =
      typeof stats.attackDelay === 'number'
        ? stats.attackDelay
        : typeof stats.attackInterval === 'number'
        ? stats.attackInterval
        : CADENCE_ATTACK_DELAYS[cadence] ?? 1.2;
    if (prefix && ENEMY_PREFIX_DEFS[prefix]?.attackIntervalMultiplier) {
      attackDelay = attackDelay * ENEMY_PREFIX_DEFS[prefix].attackIntervalMultiplier!;
    }
    const attackRange = typeof stats.attackRange === 'number' ? stats.attackRange : radius + 25;

    const self = this;
    const addEnemyHazard = (hazard: any): boolean => {
      const hazards = self.director?.hazards;
      if (!Array.isArray(hazards) || hazards.length >= 8) return false;
      hazards.push(hazard);
      return true;
    };

    const enemy = {
      id: resolvedId,
      x,
      y,
      isBoss,
      isMiniboss,
      customBossTitle: customBossTitle || '',
      prefix,
      dodgeChance,
      prefixDamageReduction,
      isThunderous,
      hasFireTrail,
      renderScale,
      maxHp: finalHp,
      hp: finalHp,
      speed: finalSpeed,
      damage: enemyDamage,
      mass,
      attackDelay,
      attackRange,
      windupTimer: 0,
      isAttacking: false,
      attackAngle: 0,
      recoveryTimer: 0,
      attackCadence: cadence,
      attackInterval,
      radius,
      foodResist,
      hunger,
      poiseResist,
      willpower,
      coinValue,
      xp,
      category: stats.category,
      method: stats.method,
      palette: stats.palette,
      vx: 0,
      vy: 0,
      kbx: 0,
      kby: 0,
      soaked: false,
      soakedTimer: 0,
      chilled: false,
      chillTimer: 0,
      statusEffects: {} as Record<string, any>,
      knockbackImmune: false,
      knockbackResistance: 0,
      garlicSlowTimer: 0,
      vycerpanyTimer: 0,
      snackTimer: 0,
      stunTimer: 0,
      strikeTimer: 0,
      strikeMaxTimer: 0,
      isUnholy: typeof stats.isUnholy === 'boolean' ? stats.isUnholy : (stats.category === 'unholy' || isUnholyEnemy({ id: resolvedId, category: stats.category } as any)),
      stalkSpeedBonus: 0,
      magmaTrailTimer: 0,
      fissureTimer: 0,
      fissureCooldown: 0,
      lastTrackedPlayerX: undefined,
      lastTrackedPlayerY: undefined,
      lastPlayerHeadingAngle: undefined,
      valecniceSlowed: false,
      defeatedByFood: false,
      foodDefeatTimer: 0,
      snackSoundTimer: 0,
      dead: false,
      isDefeated: false,
      panicked: false,
      panicTimer: 0,
      calmTimer: 0,
      hitFlashTimer: 0,
      inContact: false,
      contactTimer: 0,
      contactLeaveTimer: 0,
      animTime: 0,

      interruptAttack() {
        this.isAttacking = false;
        this.windupTimer = 0;
      },

      update(dt: number, player: any) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.contactTimer > 0) this.contactTimer -= dt;
        if (this.garlicSlowTimer > 0) this.garlicSlowTimer -= dt;
        if (this.vycerpanyTimer > 0) this.vycerpanyTimer = Math.max(0, this.vycerpanyTimer - dt);
        for (const [statusType, effect] of Object.entries(this.statusEffects) as [string, any][]) {
          effect.remaining -= dt;
          if (effect.remaining <= 0) delete this.statusEffects[statusType];
        }

        if (this.isDefeated) {
          if (this.defeatedByFood) {
            this.foodDefeatTimer += dt;
            if (this.foodDefeatTimer >= 0.85) {
              this.dead = true;
              return;
            }
          } else {
            this.dead = true;
            return;
          }
        }

        if (this.prefix === 'pekelny' && player) {
          const playerDistance = Math.hypot(player.x - this.x, player.y - this.y);
          this.fissureCooldown = Math.max(0, (this.fissureCooldown || 0) - dt);

          // Gain 15% base speed per second while the hunter remains far away.
          if (playerDistance > 220) {
            this.stalkSpeedBonus = Math.min(1.2, (this.stalkSpeedBonus || 0) + 0.15 * dt);
          } else if (playerDistance < 120) {
            this.stalkSpeedBonus = 0;
          }

          // Track actual player displacement and only accumulate a straight run
          // while consecutive movement vectors remain within a 15-degree cone.
          const hasPreviousPlayerPosition =
            typeof this.lastTrackedPlayerX === 'number' &&
            typeof this.lastTrackedPlayerY === 'number';
          if (hasPreviousPlayerPosition) {
            const moveX = player.x - this.lastTrackedPlayerX;
            const moveY = player.y - this.lastTrackedPlayerY;
            if (Math.hypot(moveX, moveY) > 2) {
              const heading = Math.atan2(moveY, moveX);
              if (typeof this.lastPlayerHeadingAngle === 'number') {
                const rawAngleDelta = Math.abs(heading - this.lastPlayerHeadingAngle);
                const angleDelta = Math.min(rawAngleDelta, Math.PI * 2 - rawAngleDelta);
                this.fissureTimer =
                  angleDelta <= Math.PI / 12 ? (this.fissureTimer || 0) + dt : 0;
              } else {
                this.fissureTimer = 0;
              }
              this.lastPlayerHeadingAngle = heading;
            } else {
              this.fissureTimer = Math.max(0, (this.fissureTimer || 0) - dt * 1.5);
            }
          }
          this.lastTrackedPlayerX = player.x;
          this.lastTrackedPlayerY = player.y;

          if ((this.fissureTimer || 0) >= 2.5 && (this.fissureCooldown || 0) <= 0) {
            const heading =
              typeof this.lastPlayerHeadingAngle === 'number'
                ? this.lastPlayerHeadingAngle
                : Math.atan2(player.vy || 0, player.vx || 0);
            const leadDistance = 200 + Math.random() * 50;
            const spawned = addEnemyHazard({
              id: `hazard_pekelny_fissure_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
              x: player.x + Math.cos(heading) * leadDistance,
              y: player.y + Math.sin(heading) * leadDistance,
              radius: 42,
              duration: 1.55,
              maxDuration: 1.55,
              type: 'fire',
              slowFactor: 1,
              kind: 'predictive-fissure',
              warningTimer: 1.2,
              damage: 24,
              oneShot: true,
              exploded: false,
              sourceEnemyId: this.id,
            });
            if (spawned) {
              this.fissureTimer = 0;
              this.fissureCooldown = 5.0;
            }
          }
        }

        if (this.prefix === 'kamenny') {
          this.stunTimer = 0;
          this.snackTimer = 0;
        }

        if (this.stunTimer > 0) {
          this.stunTimer -= dt;
          this.interruptAttack();
          this.vx = 0;
          this.vy = 0;
          return;
        }

        if (this.snackTimer > 0) {
          this.snackTimer -= dt;
          this.interruptAttack();
          this.vx = 0;
          this.vy = 0;
          return;
        }

        if (this.panicTimer > 0) {
          this.panicTimer -= dt;
          this.panicked = true;
          if (this.panicTimer <= 0) this.panicked = false;
        }

        if (this.isAttacking || (this.recoveryTimer || 0) > 0) {
          this.vx = 0;
          this.vy = 0;
        } else if (player) {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.hypot(dx, dy) || 1;
          const dir = Math.atan2(dy, dx);
          const shadowMods = getShadowDefenseMultipliers(this);
          let spd = this.speed * shadowMods.speedMult;
          if (this.prefix === 'pekelny') spd *= 1 + (this.stalkSpeedBonus || 0);
          if (this.bludickaAttracted) spd *= 1.15;
          if (this.chilled) spd *= 0.65;
          if (this.garlicSlowTimer > 0) spd *= 0.75;
          if (this.panicked) spd *= 1.35;
          if ((this.vycerpanyTimer || 0) > 0) spd *= 0.50;
          if (self.state.plumPuddles && self.state.plumPuddles.length > 0) {
            for (let pi = 0; pi < self.state.plumPuddles.length; pi++) {
              const pud = self.state.plumPuddles[pi];
              const maxR = pud.radius + this.radius;
              const pdx = this.x - pud.x;
              const pdy = this.y - pud.y;
              if (Math.abs(pdx) <= maxR && Math.abs(pdy) <= maxR && pdx * pdx + pdy * pdy <= maxR * maxR) {
                spd *= (1 - (pud.slowRatio || 0.35));
                break;
              }
            }
          }

          const moveDir = this.panicked ? dir + Math.PI : dir;
          this.vx = Math.cos(moveDir) * spd;
          this.vy = Math.sin(moveDir) * spd;
        }

        const previousX = this.x;
        const previousY = this.y;
        this.x += (this.vx + this.kbx) * dt;
        this.y += (this.vy + this.kby) * dt;

        if (
          this.hasFireTrail &&
          Math.hypot(this.x - previousX, this.y - previousY) > 1
        ) {
          this.magmaTrailTimer = (this.magmaTrailTimer || 0) + dt;
          if (this.magmaTrailTimer >= 0.55) {
            const spawned = addEnemyHazard({
              id: `hazard_pekelny_magma_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
              x: this.x,
              y: this.y,
              radius: 36,
              duration: 9.0,
              maxDuration: 9.0,
              type: 'fire',
              slowFactor: 1,
              kind: 'magma-trail',
              damage: 6,
              damageInterval: 0.6,
              damageTimer: 0,
              sourceEnemyId: this.id,
            });
            this.magmaTrailTimer = spawned ? 0 : Math.min(this.magmaTrailTimer, 0.55);
          }
        }

        const kbDecay = Math.max(0, 1 - 8 * dt);
        this.kbx *= kbDecay;
        this.kby *= kbDecay;
      },

      takeDamage(amount: number, type = 'physical', kbx = 0, kby = 0, options?: any) {
        if (this.isDefeated || this.dead) return;

        // Vichřicový: 50% šance vyhnout se jakémukoliv zranění (bič ignoruje úhyb)
        if (this.prefix === 'vichricovy' && !options?.cannotDodge && !options?.ignoreDodge) {
          const dodge = typeof this.dodgeChance === 'number' ? this.dodgeChance : 0.50;
          if (Math.random() < dodge) {
            self.state.texts.push(new DamageText(this.x, this.y - 25, 'MINUL! 💨', '#38BDF8', true));
            return;
          }
        }

        // A close encounter breaks Pekelný's accumulated pursuit speed.
        if (this.prefix === 'pekelny' && self.state.player) {
          const distanceToPlayer = Math.hypot(
            self.state.player.x - this.x,
            self.state.player.y - this.y
          );
          if (distanceToPlayer < 120) this.stalkSpeedBonus = 0;
        }

        // Kamenný: 91% redukce poškození
        if (this.prefixDamageReduction) {
          amount *= (1 - this.prefixDamageReduction);
        }

        const shadowMods = getShadowDefenseMultipliers(this);
        amount *= shadowMods.damageTakenMult;
        if (type === 'holy') {
          this.silhouetteInvertTimer = 0.12;
        }

        const ignoreResist = options?.ignoreResist || 0;
        let effectiveResist = 0;
        if (type === 'food') {
          const baseFood = this.hunger ?? this.foodResist ?? 0;
          const red = self.state.player?.foodResistReduction || 0;
          effectiveResist = Math.max(0, baseFood * (1 - red));
        } else if (type === 'holy') {
          effectiveResist = getEnemyHolyResistance(this);
        } else {
          effectiveResist = this.poiseResist || 0;
        }
        effectiveResist = Math.max(0, effectiveResist * (1 - ignoreResist));

        let finalDamage = Math.max(1, amount * (1 - effectiveResist));
        if (self.state.player?.snackBonusDmg && ((this.snackTimer || 0) > 0 || this.statusEffects.pickle_sickness) && type !== 'food') {
          finalDamage *= (1 + self.state.player.snackBonusDmg);
        }
        if (type === 'holy') {
          const holyMult = (self.state.player?.holyDamageMultiplier) || (1 + Math.max(0, self.state.meta?.churchLevel || 0) * 0.08);
          finalDamage *= holyMult;
        }
        finalDamage += (self.state.meta?.forgeLevel || 0) * 2;
        if (self.state.player && self.state.player.guaranteedCritTimer > 0) {
          finalDamage = Math.round(finalDamage * 2.2);
          self.state.texts.push(new DamageText(this.x, this.y - 48, 'KRITICKÝ ZÁSAH! ✨', '#FDE047', true));
        } else if (self.state.player) {
          const critChance = Math.max(0, self.state.player.luck ?? 0) * 0.001;
          if (Math.random() < critChance) {
            finalDamage = Math.round(finalDamage * 1.65);
            self.state.texts.push(new DamageText(this.x, this.y - 48, 'ŠŤASTNÝ ZÁSAH! 🎯', '#FBBF24', true));
          }
        }
        this.hp = Math.max(0, this.hp - finalDamage);
        this.hitFlashTimer = 0.12;

        if (options?.stunDuration && options.stunDuration > 0 && this.prefix !== 'kamenny') {
          const stunResist = this.willpower || 0;
          this.stunTimer = Math.max(this.stunTimer || 0, options.stunDuration * (1 - stunResist));
          this.interruptAttack();
        }

        // Hromový: Blesky vrací hráči polovinu zranění ve vzdálenosti 200px (zastropováno na max 25 % maxHp hráče, cooldown 0.25 s)
        if (this.prefix === 'hromovy' && self.state.player && self.state.player.hp > 0 && finalDamage > 0) {
          const pDist = Math.hypot(self.state.player.x - this.x, self.state.player.y - this.y);
          const now = self.state.gameTime;
          if (pDist <= 200 && (!this._lastThornsTime || now - this._lastThornsTime >= 0.25)) {
            this._lastThornsTime = now;
            const maxReflect = Math.max(1, Math.round((self.state.player.maxHp || 100) * 0.25));
            const rawReflect = Math.max(1, Math.round(finalDamage * 0.5));
            const reflect = Math.min(rawReflect, maxReflect);
            if (typeof self.state.player.takeDamage === 'function') {
              self.state.player.takeDamage(reflect, 'lightning', this, false);
            } else {
              self.state.player.hp = Math.max(0, self.state.player.hp - reflect);
            }
            self.state.texts.push(new DamageText(this.x, this.y - 45, `BLESKOVÝ ODRAZ! -${reflect} ⚡`, '#FDE047', true));
          }
        }

        if (kbx !== 0 || kby !== 0) {
          if (this.prefix === 'kamenny') {
            this.kbx += kbx * 0.15;
            this.kby += kby * 0.15;
          } else {
            const poiseRed = self.state.player?.plumPoiseReduction || 0;
            const poise = Math.max(0, (this.poiseResist || 0) - poiseRed);
            const kbFactor = Math.max(0.1, 1 - poise);
            this.kbx += kbx * kbFactor;
            this.kby += kby * kbFactor;
            this.interruptAttack();
          }
        }

        if (finalDamage >= (this.maxHp || 40) * 3) {
          this.overkill = true;
        }

        if (this.hp <= 0) {
          this.hp = 0;
          this.isDefeated = true;
          self.state.kills += 1;
          if ((self.state.player?.stickyPlumJamStacks || 0) > 0) {
            self.spawnPlumPuddle(this.x, this.y, self.state.player.plumSlowRatio || 0.35);
          }
          const comboTriggered = registerKillAndCheckCombo(self.state, self.state.gameTime);
          if (comboTriggered && self.state.player) {
            applyMagnetWave(self.state.drops, self.state.player.x, self.state.player.y, 550, false);
            self.callbacks?.onSound?.('horseshoe');
          }
          self.callbacks?.onEnemyDefeated?.(this);
          self.director?.recordEnemyDeath(this, self.state.gameTime);
          if (type === 'food') {
            this.defeatedByFood = true;
          } else {
            this.dead = true;
          }
        }
      },

      chill(duration: number) {
        this.chilled = true;
        this.chillTimer = Math.max(this.chillTimer || 0, duration);
      },

      soak() {
        this.soaked = true;
        this.soakedTimer = 3.0;
      },

      applyStatusEffect(name: string, effect: any) {
        this.statusEffects[name] = effect;
      },

      getStatusEffect(name: string) {
        return this.statusEffects[name];
      },

      getDamageDealtMultiplier() {
        return this.statusEffects.pickle_sickness?.damageDealtMultiplier ?? 1.0;
      },
    };

    return enemy;
  }

  public upgradeWeapon(
    weaponId: string,
    synergisticUpgradeId?: string,
    normalUpgradeId?: string
  ): { weapon: any; pendingMilestone: PendingMilestoneChoice | null } {
    const player = this.state.player;
    if (!player) {
      throw new Error('Cannot upgrade weapon: player is not initialized');
    }
    if (!player.weapons) player.weapons = [];
    let weapon = player.weapons.find((w: any) => w.id === weaponId);
    if (!weapon) {
      weapon = {
        id: weaponId,
        level: 1,
        cd: 0,
        mastery: createWeaponMasteryState(),
        milestones: [],
        normalUpgrades: [],
        synergisticUpgrades: [],
      };
      if (synergisticUpgradeId) {
        weapon.synergisticUpgrades.push(synergisticUpgradeId);
      }
      weapon._cachedStats = getRankedWeaponStats(weapon.id, weapon.level, weapon);
      player.weapons.push(weapon);
      return { weapon, pendingMilestone: null };
    }

    if (!Array.isArray(weapon.synergisticUpgrades)) {
      weapon.synergisticUpgrades = [];
    }

    if (synergisticUpgradeId && !weapon.synergisticUpgrades.includes(synergisticUpgradeId)) {
      weapon.synergisticUpgrades.push(synergisticUpgradeId);
    }

    if (weapon.level >= 8) {
      weapon._cachedStats = getRankedWeaponStats(weapon.id, weapon.level, weapon);
      return { weapon, pendingMilestone: null };
    }

    weapon.level += 1;
    if (!Array.isArray(weapon.milestones)) {
      weapon.milestones = [];
    }
    if (!Array.isArray(weapon.normalUpgrades)) {
      weapon.normalUpgrades = [];
    }

    let pending: PendingMilestoneChoice | null = null;
    const rank = weapon.level;
    if (rank === 3 || rank === 5 || rank === 8) {
      const choices = getMilestoneChoices(weaponId, rank);
      if (choices) {
        const alreadyChosen = choices.some((c) => weapon.milestones.includes(c.id));
        if (!alreadyChosen) {
          pending = {
            weaponId,
            rank,
            choices,
          };
          if (!this.state.pendingMilestones) {
            this.state.pendingMilestones = [];
          }
          this.state.pendingMilestones.push(pending);
          this.state.pendingMilestone = this.state.pendingMilestones[0] || null;
        }
      }
    } else {
      const rankDef = getWeaponRankDef(weaponId, rank);
      const chosenUpgradeId =
        normalUpgradeId ||
        rankDef?.normalUpgradeId ||
        rollRandomWeaponUpgrade(weaponId, weapon)?.id;
      if (chosenUpgradeId) {
        weapon.normalUpgrades.push(chosenUpgradeId);
      }
    }

    weapon._cachedStats = getRankedWeaponStats(weapon.id, weapon.level, weapon);
    return { weapon, pendingMilestone: pending };
  }

  public applySynergisticUpgrade(weaponId: string, upgradeId: string): void {
    const player = this.state.player;
    if (!player) {
      throw new Error('Cannot apply synergistic upgrade: player is not initialized');
    }
    const weapon = player.weapons?.find((w: any) => w.id === weaponId);
    if (!weapon) {
      throw new Error(`Cannot apply synergistic upgrade: weapon ${weaponId} not found`);
    }
    if (!Array.isArray(weapon.synergisticUpgrades)) {
      weapon.synergisticUpgrades = [];
    }
    if (!weapon.synergisticUpgrades.includes(upgradeId)) {
      weapon.synergisticUpgrades.push(upgradeId);
      weapon._cachedStats = getRankedWeaponStats(weapon.id, weapon.level, weapon);
    }
  }

  public chooseWeaponMilestone(weaponId: string, choiceId: string): any {
    const player = this.state.player;
    if (!player) {
      throw new Error('Cannot choose weapon milestone: player is not initialized');
    }
    const weapon = player.weapons?.find((w: any) => w.id === weaponId);
    if (!weapon) {
      throw new Error(`Cannot choose weapon milestone: weapon ${weaponId} not found`);
    }

    if (!Array.isArray(weapon.milestones)) {
      weapon.milestones = [];
    }

    if (!weapon.milestones.includes(choiceId)) {
      weapon.milestones.push(choiceId);
    }

    if (this.state.pendingMilestones) {
      const idx = this.state.pendingMilestones.findIndex(
        (p) => p.weaponId === weaponId && p.choices.some((c) => c.id === choiceId)
      );
      if (idx >= 0) {
        this.state.pendingMilestones.splice(idx, 1);
      }
      this.state.pendingMilestone = this.state.pendingMilestones[0] || null;
    } else {
      this.state.pendingMilestone = null;
    }

    const choice =
      getMilestoneChoices(weaponId, 3)?.find((c) => c.id === choiceId) ||
      getMilestoneChoices(weaponId, 5)?.find((c) => c.id === choiceId) ||
      getMilestoneChoices(weaponId, 8)?.find((c) => c.id === choiceId);
    if (choice) {
      this.callbacks?.onSound?.('milestoneChosen', choice.audioSfx);
    }

    const updatedStats = getRankedWeaponStats(weaponId, weapon.level, weapon);
    weapon._cachedStats = updatedStats;
    return updatedStats;
  }

  public applyGrandfatherItem(item: GrandfatherItemDef, offer?: any): void {
    const p = this.state.player;
    if (!p) return;
    const effect = item.effect;
    if (effect.type === 'speed') {
      p.speed += effect.amount;
      p.speedCount = (p.speedCount || 0) + 1;
    }
    if (effect.type === 'pickup_radius') {
      p.pickupRadius += effect.amount;
      p.magnetCount = (p.magnetCount || 0) + 1;
    }
    if (effect.type === 'damage_multiplier') {
      p.damageMultiplier = (p.damageMultiplier || 1) * (1 + effect.amount);
      if (item.id === 'krvave_jelito') p.jelitoCount = (p.jelitoCount || 0) + 1;
    }
    if (effect.type === 'fajfka' || item.id === 'bylinkova_fajfka') {
      p.fajfkaLevel = Math.min(3, (p.fajfkaLevel || 0) + 1);
      p.regenLevel = (p.regenLevel || 0) + 1.2;
    }
    if (effect.type === 'bear_mask' || item.id === 'maska_medveda') {
      p.bearMaskLevel = Math.min(4, (p.bearMaskLevel || 0) + 1);
      p.bearMaskHealBonus = Math.max(0, (p.bearMaskLevel - 1) * 0.20);
    }
    if (effect.type === 'max_hp') {
      p.maxHp += effect.amount;
      p.hp = Math.min(p.maxHp, p.hp + effect.amount);
      if (item.id === 'medvedi_mast') p.kurazCount = (p.kurazCount || 0) + 1;
    }
    if (effect.type === 'luck') p.luck = (p.luck || 0) + effect.amount;
    if (effect.type === 'regen') {
      p.regenLevel = (p.regenLevel || 0) + Math.round(effect.amount * 10) / 10;
    }
    if (effect.type === 'cooldown') {
      p.cooldownBonus = (p.cooldownBonus || 0) + effect.amount;
      p.kavaCount = (p.kavaCount || 0) + 1;
    }
    if (effect.type === 'heal') {
      p.hp = Math.min(p.maxHp, p.hp + effect.amount);
    }
    if (effect.type === 'coins') {
      this.state.coins += Math.max(0, Math.floor(effect.amount));
    }
    if (effect.type === 'weapon') {
      this.upgradeWeapon(effect.weaponId, undefined, offer?.candidateUpgradeId);
    }
    if (effect.type === 'holy_circle') {
      p.holyCircleStacks = Math.min(3, (p.holyCircleStacks || 0) + 1);
      p.holyCircleReduction = (p.holyCircleReduction || 0) + effect.damageReduction;
    }
    if (effect.type === 'kren_spice') {
      p.krenSpiceStacks = Math.min(4, (p.krenSpiceStacks || 0) + 1);
      p.foodResistReduction = (p.foodResistReduction || 0) + effect.foodResistReduction;
      p.snackBonusDmg = (p.snackBonusDmg || 0) + effect.snackBonusDmg;
    }
    if (effect.type === 'gingerbread_heart') {
      p.poutoveSrdceStacks = Math.min(4, (p.poutoveSrdceStacks || 0) + 1);
      p.gingerbreadHeartCdMult = (p.gingerbreadHeartCdMult || 1) * effect.cdReductionMult;
    }
    if (effect.type === 'ulezely_syrecek' || item.id === 'ulezely_syrecek') {
      p.syrecekStacks = Math.min(3, (p.syrecekStacks || 0) + 1);
    }
    if (effect.type === 'pivni_tacek' || item.id === 'pivni_tacek') {
      p.pivniTacekStacks = Math.min(4, (p.pivniTacekStacks || 0) + 1);
    }
    if (effect.type === 'sticky_plum_jam' || item.id === 'bezedny_krajac_povidel') {
      const slowRatio = 'slowRatio' in effect ? effect.slowRatio : 0.35;
      const poiseRed = 'poiseReduction' in effect ? effect.poiseReduction : 0.20;
      p.stickyPlumJamStacks = Math.min(4, (p.stickyPlumJamStacks || 0) + 1);
      p.plumSlowRatio = Math.min(0.80, (p.plumSlowRatio || 0) + slowRatio);
      p.plumPoiseReduction = Math.min(0.80, (p.plumPoiseReduction || 0) + poiseRed);
    }
    if (effect.type === 'goat_bell' || item.id === 'zvonek_zatoulane_kozy') {
      const radius = 'radius' in effect ? effect.radius : 180;
      const intervalSec = 'intervalSec' in effect ? effect.intervalSec : 4.0;
      p.goatBellStacks = Math.min(4, (p.goatBellStacks || 0) + 1);
      p.goatBellRadius = radius + 30 * ((p.goatBellStacks || 1) - 1);
      p.goatBellInterval = Math.max(2.0, intervalSec - 0.4 * ((p.goatBellStacks || 1) - 1));
      p.goatBellTimer = p.goatBellInterval;
    }
    if (effect.type === 'itchy_socks' || item.id === 'babicciny_kousave_fusekle') {
      const speedBonus = 'speedBonus' in effect ? effect.speedBonus : 15;
      const movingCd = 'movingCooldownBonus' in effect ? effect.movingCooldownBonus : 0.12;
      p.itchySocksStacks = Math.min(4, (p.itchySocksStacks || 0) + 1);
      p.speed = (p.speed || 150) + speedBonus;
      p.movingCooldownBonus = Math.min(0.48, (p.movingCooldownBonus || 0) + movingCd);
      p.iceImmunity = true;
    }
    if (item.id === 'zejdlik_piva' || item.id === 'panak_koralky' || item.id === 'tepla_cikorka') {
      if ((p.pivniTacekStacks || 0) > 0) {
        this.triggerPivniTacekEffect(p);
      }
    }
  }

  public spawnPlumPuddle(x: number, y: number, slowRatio = 0.35): void {
    if (!this.state.plumPuddles) this.state.plumPuddles = [];
    if (this.state.plumPuddles.length >= 24) {
      this.state.plumPuddles.shift();
    }
    this.state.plumPuddles.push({
      x,
      y,
      radius: 44,
      life: 6.5,
      maxLife: 6.5,
      slowRatio,
    });
    this.state.texts.push(new DamageText(x, y - 25, 'POVIDLÍ! 🍯', '#A855F7', false));
  }

  public triggerGoatBell(player: any): void {
    const rad = player.goatBellRadius || 180;
    this.callbacks?.onSound?.('bell');
    this.state.texts.push(new DamageText(player.x, player.y - 45, 'CINK! 🔔', '#FDE047', true));

    // Interrupt nearby enemy windups
    const nearby = this.spatialHash.queryCircle(player.x, player.y, rad);
    for (let i = 0; i < nearby.length; i++) {
      const foe = nearby[i];
      if (foe.isDefeated || foe.dead) continue;
      if (typeof foe.interruptAttack === 'function') foe.interruptAttack();
      foe.isAttacking = false;
      foe.windupTimer = 0;
      foe.strikeTimer = 0;
      if (foe.aiState === 'windup') foe.aiState = 'idle';
      this.state.texts.push(new DamageText(foe.x, foe.y - 25, 'VYRUŠENÍ! 🔔', '#F8FAFC', false));
    }

    // Pull drops in radius towards player
    if (this.state.drops) {
      for (let i = 0; i < this.state.drops.length; i++) {
        const d = this.state.drops[i];
        if (d.dead || d.rescued) continue;
        const dist = Math.hypot(d.x - player.x, d.y - player.y);
        if (dist <= rad + 100) {
          const ang = Math.atan2(player.y - d.y, player.x - d.x);
          const pullSpeed = 380;
          d.vx = Math.cos(ang) * pullSpeed;
          d.vy = Math.sin(ang) * pullSpeed;
        }
      }
    }
  }

  public triggerPivniTacekEffect(player: any): void {
    player.pivniTacekTimer = 6;
    if (player.weapons) {
      for (let i = 0; i < player.weapons.length; i++) {
        const w = player.weapons[i];
        if (w.cd > 0) w.cd /= 1.35;
      }
    }
    this.state.texts.push(new DamageText(player.x, player.y - 85, '„TENHLE ÚČET ZAPLATÍ BUBÁCI! 🍺“', '#F59E0B', true));
    this.state.texts.push(new DamageText(player.x, player.y - 55, 'ROZOHNĚNÍ: +35 % RYCHLEJŠÍ NABÍJENÍ! ⚡', '#38BDF8', true));

    // Drop coins from up to 8 closest alive enemies
    const nearby = this.spatialHash.queryCircle(player.x, player.y, 400);
    const sortedEnemies: any[] = [];
    for (let i = 0; i < nearby.length; i++) {
      const e = nearby[i];
      if (!e.isDefeated && !e.dead) {
        sortedEnemies.push(e);
        if (sortedEnemies.length >= 8) break;
      }
    }
    if (sortedEnemies.length === 0 && (this.livingEnemies || this.state.enemies)) {
      const pool = this.livingEnemies || this.state.enemies;
      for (let i = 0; i < pool.length; i++) {
        const e = pool[i];
        if (!e.isDefeated && !e.dead) {
          sortedEnemies.push(e);
          if (sortedEnemies.length >= 8) break;
        }
      }
    }

    for (let i = 0; i < sortedEnemies.length; i++) {
      const foe = sortedEnemies[i];
      this.spawnDrop('coin', foe.x, foe.y, { value: 1, speed: 75, skipConsolidation: true });
      this.state.texts.push(new DamageText(foe.x, foe.y - 25, '+1 🪙', '#FBBF24', false));
      if (this.state.particles) {
        for (let k = 0; k < 3; k++) {
          const ang = Math.random() * Math.PI * 2;
          tryEmitParticle(this.state.particles, () => ({
            x: foe.x,
            y: foe.y,
            vx: Math.cos(ang) * 45,
            vy: Math.sin(ang) * 45 - 20,
            life: 0.35,
            color: '#F59E0B',
            size: 3,
          }), this.state.meta?.performanceProfile);
        }
      }
    }
  }

  private pushTransientLight(light: DynamicLightSource): void {
    let count = 0;
    for (let i = 0; i < this.state.lightSources.length; i++) {
      if (typeof this.state.lightSources[i].duration === 'number') count++;
    }
    if (count < 16) {
      this.state.lightSources.push(light);
    }
  }

  public applyWeaponAction(action: WeaponAction): any {
    if (action.type === 'projectile') {
      const p = action.proj || action;
      const weaponId = p.weaponId || this.state.player?._firingWeapon?.id;
      const angle = p.angle ?? 0;
      const speed = p.speed ?? 0;
      const pooled = this.projectilePool.pop();
      let projectile: any;
      if (pooled) {
        if (pooled.hitList) {
          pooled.hitList.length = 0;
        } else {
          pooled.hitList = [];
        }
        projectile = Object.assign(pooled, p, {
          weaponId,
          x: p.x ?? this.state.player?.x ?? 0,
          y: p.y ?? this.state.player?.y ?? 0,
          angle,
          speed,
          vx: p.vx !== undefined ? p.vx : Math.cos(angle) * speed,
          vy: p.vy !== undefined ? p.vy : Math.sin(angle) * speed,
          dead: false,
          life: p.life ?? 2.0,
          radius: p.radius ?? 12,
          dmg: p.dmg ?? 10,
          type: p.type || 'physical',
        });
      } else {
        projectile = {
          ...p,
          weaponId,
          x: p.x ?? this.state.player?.x ?? 0,
          y: p.y ?? this.state.player?.y ?? 0,
          angle,
          speed,
          vx: p.vx !== undefined ? p.vx : Math.cos(angle) * speed,
          vy: p.vy !== undefined ? p.vy : Math.sin(angle) * speed,
          hitList: p.hitList ? [...p.hitList] : [],
          dead: false,
          life: p.life ?? 2.0,
          radius: p.radius ?? 12,
          dmg: p.dmg ?? 10,
          type: p.type || 'physical',
        };
      }
      this.state.projectiles.push(projectile);
      return projectile;
    }

    if (action.type === 'slash') {
      const s = action.slash || action;
      const weaponId = s.weaponId || this.state.player?._firingWeapon?.id;
      const pooled = this.slashPool.pop();
      let slash: any;
      if (pooled) {
        if (pooled.hitList) {
          pooled.hitList.length = 0;
        } else {
          pooled.hitList = [];
        }
        slash = Object.assign(pooled, s, {
          weaponId,
          x: s.x ?? this.state.player?.x ?? 0,
          y: s.y ?? this.state.player?.y ?? 0,
          maxLife: s.maxLife || s.life || 0.2,
          life: s.life || 0.2,
          time: 0,
          reach: s.reach ?? 80,
          arc: s.arc ?? Math.PI,
          angle: s.angle ?? 0,
          dmg: s.dmg ?? 20,
          type: s.type || 'physical',
          dead: false,
        });
      } else {
        slash = {
          ...s,
          weaponId,
          x: s.x ?? this.state.player?.x ?? 0,
          y: s.y ?? this.state.player?.y ?? 0,
          maxLife: s.maxLife || s.life || 0.2,
          life: s.life || 0.2,
          time: 0,
          reach: s.reach ?? 80,
          arc: s.arc ?? Math.PI,
          angle: s.angle ?? 0,
          dmg: s.dmg ?? 20,
          type: s.type || 'physical',
          hitList: s.hitList ? [...s.hitList] : [],
          dead: false,
        };
      }
      this.state.slashes.push(slash);
      if (slash.pullLoot && this.state.player) {
        pullWhipLoot(this.state.drops, this.state.player.x, this.state.player.y, slash.angle, slash.reach);
      }
      this.pushTransientLight(createOsikovySlashLight(slash.x, slash.y));
      return slash;
    }

    if (action.type === 'areaImpact') {
      const impact = action.impact || action;
      const radius = impact.radius ?? 60;
      const dmg = impact.dmg ?? 20;
      const impactType = impact.type || 'blunt';
      if (impactType === 'holy') {
        this.pushTransientLight(createHolyCathedralLight(impact.x, impact.y));
      }
      const nearby = this.spatialHash.queryCircle(impact.x, impact.y, radius + 60);

      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dx = e.x - impact.x;
        const dy = e.y - impact.y;
        const reach = radius + (e.radius || 15);
        if (dx * dx + dy * dy <= reach * reach) {
          const kbMult = impact.knockbackMult ?? 1;
          e.takeDamage(
            dmg,
            impactType,
            dx * 4 * kbMult,
            dy * 4 * kbMult,
            impact.stunDuration ? { stunDuration: impact.stunDuration } : undefined
          );
        }
      }
      this.state.texts.push(new DamageText(impact.x, impact.y - 20, 'BUM!', '#F59E0B', true));
      return impact;
    }

    if (action.type === 'pulse' || action.type === 'hromnickaPulse') {
      const player = this.state.player;
      if (!player) return null;
      const reach = action.reach ?? 100;
      const dmg = action.dmg ?? 30;
      const level = action.level ?? 1;
      const knockbackMult = action.knockbackMult ?? 1;
      const stunDuration = action.stunDuration ?? 0;

      player.hromnickaPulseTimer = 0.35;
      player.hromnickaPulseRadius = reach;

      const nearby = this.spatialHash.queryCircle(player.x, player.y, reach + 50);
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const distSq = dx * dx + dy * dy;
        const maxReach = reach + (e.radius || 15);
        if (distSq <= maxReach * maxReach) {
          const dist = Math.sqrt(distSq) || 1;
          const holyPush = getHolyPushMultiplier(e);
          const kbForce = (120 + level * 10) * holyPush * knockbackMult;
          const finalDmg = dmg * (isUnholyEnemy(e) ? 1.5 : 1.0);
          e.takeDamage(
            finalDmg,
            'holy',
            (dx / dist) * kbForce,
            (dy / dist) * kbForce,
            stunDuration ? { stunDuration } : undefined
          );
          if (isUnholyEnemy(e)) {
            this.state.texts.push(new DamageText(e.x, e.y - 35, 'SVATÉ SPÁLENÍ! 🔥', '#F59E0B', true));
          }
        }
      }
      tryEmitParticle(this.state.particles, () => ({
        x: player.x,
        y: player.y,
        vx: 0,
        vy: 0,
        life: 0.35,
        color: '#FEF08A',
        size: reach * 0.3,
      }), this.state.meta?.performanceProfile);
      return action;
    }

    if (action.type === 'cloud') {
      const player = this.state.player;
      if (!player) return null;
      const radius = action.radius ?? 110;
      const dmg = action.dmg ?? 9;
      const healRatio = 0.08 * (action.stats?.damageMult ? Math.min(2.0, action.stats.damageMult) : 1);
      const requestedHeal = player.maxHp * healRatio * (1 + ((player as any).bearMaskHealBonus || 0));
      player.hp = Math.min(player.maxHp, player.hp + requestedHeal);

      const nearby = this.spatialHash.queryCircle(player.x, player.y, radius + 50);
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist <= radius + (e.radius || 15)) {
          e.fajfkaSlowTimer = Math.max(e.fajfkaSlowTimer || 0, 0.30);
          e.takeDamage(dmg, 'nature', 0, 0, { allowFractionalDamage: true });
        }
      }
      return action;
    }

    return null;
  }

  public getVisibleEntities(
    viewLeft?: number,
    viewTop?: number,
    viewRight?: number,
    viewBottom?: number
  ): any[] {
    const drawables = this.state.renderBuffer;
    drawables.length = 0;
    const player = this.state.player;

    if (player) {
      if (
        viewLeft === undefined ||
        isInView(player.x, player.y, player.radius, viewLeft, viewTop!, viewRight!, viewBottom!)
      ) {
        drawables.push(player);
      }
    }

    for (let i = 0; i < this.state.enemies.length; i++) {
      const enemy = this.state.enemies[i];
      if (
        viewLeft === undefined ||
        isInView(enemy.x, enemy.y, enemy.radius, viewLeft, viewTop!, viewRight!, viewBottom!)
      ) {
        drawables.push(enemy);
      }
    }

    if (this.state.smokePuffs) {
      for (let i = 0; i < this.state.smokePuffs.length; i++) {
        const puff = this.state.smokePuffs[i];
        if (
          viewLeft === undefined ||
          isInView(puff.x, puff.y, (puff.radius || 20) * 2, viewLeft, viewTop!, viewRight!, viewBottom!)
        ) {
          drawables.push(puff);
        }
      }
    }

    drawables.sort((a, b) => a.y - b.y);
    return drawables;
  }

  public queryRadius(x: number, y: number, radius: number): any[] {
    return this.spatialHash.queryRadius(x, y, radius);
  }

  public queryCircle(x: number, y: number, radius: number): any[] {
    return this.spatialHash.queryCircle(x, y, radius);
  }

  public queryCircleInto(x: number, y: number, radius: number, out: any[]): any[] {
    return this.spatialHash.queryCircleInto(x, y, radius, out);
  }

  public withQuery(x: number, y: number, radius: number, fn: (results: readonly any[]) => void): void {
    this.spatialHash.withQuery(x, y, radius, fn);
  }

  public queryNearest(x: number, y: number, maxRadius: number, filter?: (e: any) => boolean): any | null {
    return this.spatialHash.queryNearest(x, y, maxRadius, filter);
  }

  public update(dt: number): void {
    this.state.uiTime += dt;
    if (this.state.pendingMilestone) {
      return;
    }
    this.state.gameTime += dt;
    const player = this.state.player;

    if (this.state.flourStormTimer > 0) this.state.flourStormTimer -= dt;
    if (this.state.lightningFlash > 0) this.state.lightningFlash -= dt;
    if (this.state.lightningStrike) {
      this.state.lightningStrike.time -= dt;
      if (this.state.lightningStrike.time <= 0) this.state.lightningStrike = null;
    }

    const dayPhase = getCurrentDayPhase(this.state.gameTime);
    if (player && player.hp > 0) {
      const petrolejkaRadius = getPetrolejkaRadius(player.hp, player.maxHp, dayPhase.id, this.state.gameTime);
      let pLight = this.state.petrolejkaLight;
      if (petrolejkaRadius > 0) {
        if (!pLight) {
          pLight = {
            id: 'player_petrolejka',
            x: player.x,
            y: player.y,
            radius: petrolejkaRadius,
            color: '#F59E0B',
            type: 'petrolejka',
          };
          this.state.petrolejkaLight = pLight;
          this.state.lightSources.push(pLight);
        } else {
          pLight.x = player.x;
          pLight.y = player.y;
          pLight.radius = petrolejkaRadius;
        }
      } else if (pLight) {
        pLight.radius = 0;
      }

      // Hromnička blessed candle light
      const hasHromnicka = player.weapons && player.weapons.some((w: any) => w.id === 'hromnicka');
      let hLight = this.state.hromnickaLight;
      if (hasHromnicka) {
        const hromWp = player.weapons.find((w: any) => w.id === 'hromnicka');
        const hReach = 110 + (hromWp?.level || 1) * 12;
        if (!hLight) {
          hLight = {
            id: 'player_hromnicka',
            x: player.x,
            y: player.y,
            radius: hReach,
            color: '#FEF9C3',
            type: 'holy',
            intensity: 0.9,
          };
          this.state.hromnickaLight = hLight;
          this.state.lightSources.push(hLight);
        } else {
          hLight.x = player.x;
          hLight.y = player.y;
          hLight.radius = hReach;
        }
      } else if (hLight) {
        hLight.radius = 0;
      }
    }

    if (this.state.grandfather && this.state.grandfather.active) {
      let gHearth = this.state.grandfatherLight;
      if (!gHearth) {
        gHearth = {
          id: 'grandfather_hearth',
          x: this.state.grandfather.x,
          y: this.state.grandfather.y,
          radius: 240,
          color: '#EA580C',
          type: 'hearth',
        };
        this.state.grandfatherLight = gHearth;
        this.state.lightSources.push(gHearth);
      } else {
        gHearth.x = this.state.grandfather.x;
        gHearth.y = this.state.grandfather.y;
      }
    } else if (this.state.grandfatherLight) {
      const gHearthIdx = this.state.lightSources.indexOf(this.state.grandfatherLight);
      if (gHearthIdx !== -1) {
        this.state.lightSources.splice(gHearthIdx, 1);
      }
      this.state.grandfatherLight = null;
    }

    this.state.lightSources = updateLightSources(this.state.lightSources, dt);

    if (player && player.hp > 0) {
      let mx = 0;
      let my = 0;
      const keys = this.state.keys;
      if (keys.KeyW || keys.ArrowUp) my -= 1;
      if (keys.KeyS || keys.ArrowDown) my += 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;

      const BASE_PLAYER_SPEED = player.speed || 220;
      const MIN_SPEED_RATIO = 0.2;
      const DRAG_COEFFICIENT = 0.35;
      const PUSH_FORCE = 6.0;
      const MAX_PUSH_SPEED = 300;

      let moveVx = 0;
      let moveVy = 0;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        if (player.hazardSlowTimer > 0) {
          player.hazardSlowTimer -= dt;
        }
        const buffMultiplier =
          (player.soulBuffTimer > 0 ? 1.25 : 1) *
          (player.gingerbreadSpeedTimer > 0 ? (1 + (player.gingerbreadSpeedBonus || 0.15)) : 1) *
          (player.waterSoakedTimer > 0 ? 0.75 : 1) *
          (player.slowTimer > 0 ? 0.65 : 1) *
          (player.hazardSlowTimer > 0 ? (player.hazardSlowFactor || 0.7) : 1);
        const effectiveSpeed = BASE_PLAYER_SPEED * buffMultiplier;
        moveVx = (mx / len) * effectiveSpeed;
        moveVy = (my / len) * effectiveSpeed;
        player.lastDx = mx;
        player.lastDy = my;
        player.animTime += dt;
      } else {
        player.animTime = 0;
      }

      let pushX = 0;
      let pushY = 0;
      let totalResistance = 0;

      const crowdNearby = this.spatialHash.queryRadius(player.x, player.y, player.radius + 35);
      for (let i = 0; i < crowdNearby.length; i++) {
        const e = crowdNearby[i];
        if (e.isDefeated || e.dead || (e.snackTimer || 0) > 0) continue;

        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);
        const collisionReach = player.radius + e.radius;

        if (dist < collisionReach) {
          // Odstrčení reaguje na dotyk, aniž by čekalo na zásah nepřítele.
          player.counterMeleeAttacker?.(e);
          const overlap = collisionReach - dist;
          if (dist > 0.0001) {
            const invDist = 1 / dist;
            pushX += dx * invDist * overlap * PUSH_FORCE;
            pushY += dy * invDist * overlap * PUSH_FORCE;
          } else {
            pushX += overlap * PUSH_FORCE;
          }

          let enemyMass = typeof e.mass === 'number' ? e.mass : e.radius / 15;
          if (e.isAttacking) enemyMass *= 2;
          totalResistance += enemyMass;
        }
      }

      const crowdSpeedMultiplier = Math.max(MIN_SPEED_RATIO, 1 / (1 + totalResistance * DRAG_COEFFICIENT));
      moveVx *= crowdSpeedMultiplier;
      moveVy *= crowdSpeedMultiplier;

      const pushSpeed = Math.hypot(pushX, pushY);
      if (pushSpeed > MAX_PUSH_SPEED) {
        const pushScale = MAX_PUSH_SPEED / pushSpeed;
        pushX *= pushScale;
        pushY *= pushScale;
      }

      player.x += (moveVx + pushX) * dt;
      player.y += (moveVy + pushY) * dt;

      if (player.soulBuffTimer > 0) player.soulBuffTimer -= dt;
      if (player.gingerbreadSpeedTimer > 0) player.gingerbreadSpeedTimer -= dt;
      if (player.waterSoakedTimer > 0) player.waterSoakedTimer -= dt;
      if (player.slowTimer > 0) {
        if (player.iceImmunity) {
          player.slowTimer = 0;
        } else {
          player.slowTimer -= dt;
        }
      }
      if (player.ultCd > 0) player.ultCd -= dt * (1 + (this.state.meta?.bellLevel || 0) * 0.08);
      if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);
      if (player.repulseCooldown > 0) player.repulseCooldown = Math.max(0, player.repulseCooldown - dt);
      if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;

      // Goat Bell (Zvonek ze zatoulané kozy)
      const isMoving = Math.hypot(moveVx, moveVy) > 15 || mx !== 0 || my !== 0;
      if (player.goatBellStacks > 0 && isMoving) {
        player.goatBellTimer = (player.goatBellTimer || player.goatBellInterval || 4.0) - dt;
        if (player.goatBellTimer <= 0) {
          player.goatBellTimer = player.goatBellInterval || 4.0;
          this.triggerGoatBell(player);
        }
      }

      // Holy Chalk Circle (Posvěcená tříkrálová křída)
      if (player.holyCircleStacks > 0) {
        if (mx === 0 && my === 0) {
          player.stillTimer = (player.stillTimer || 0) + dt;
          if (player.stillTimer >= 0.6) {
            if (!this.state.holyCircle) {
              this.state.holyCircle = {
                x: player.x,
                y: player.y,
                radius: 120,
                life: 1.5,
                active: true,
              };
              this.callbacks?.onSound?.('bell');
              this.state.texts.push(new DamageText(player.x, player.y - 40, 'K + M + B 🖍️', '#FDE047', true));
            } else {
              this.state.holyCircle.x = player.x;
              this.state.holyCircle.y = player.y;
              this.state.holyCircle.life = 1.5;
              this.state.holyCircle.active = true;
            }
          }
        } else {
          player.stillTimer = 0;
          if (this.state.holyCircle) {
            this.state.holyCircle.life -= dt;
            if (this.state.holyCircle.life <= 0) {
              this.state.holyCircle = null;
            }
          }
        }
      }

      // Holy Chalk Circle unholy barrier & repellent damage (10 Hz spatial check, full-rate contact push)
      if (this.state.holyCircle && this.state.holyCircle.active) {
        const hc = this.state.holyCircle as any;
        hc._scanTimer = (hc._scanTimer || 0) + dt;
        if (hc._scanTimer >= 0.1 || !hc._cachedUnholy) {
          hc._scanTimer = 0;
          hc._unholyBuffer = hc._unholyBuffer || [];
          this.spatialHash.queryCircleInto(hc.x, hc.y, hc.radius + 60, hc._unholyBuffer);
          hc._cachedUnholy = hc._unholyBuffer;
        }
        const nearbyUnholy = hc._cachedUnholy;
        for (let ui = 0; ui < nearbyUnholy.length; ui++) {
          const foe = nearbyUnholy[ui];
          if (foe.isDefeated || foe.dead || !isUnholyEnemy(foe)) continue;
          const dx = foe.x - hc.x;
          const dy = foe.y - hc.y;
          const dist = Math.hypot(dx, dy);
          const reach = hc.radius + (foe.radius || 15);
          if (dist < reach) {
            const nx = dist > 0.001 ? dx / dist : 1;
            const ny = dist > 0.001 ? dy / dist : 0;
            const holyPush = getHolyPushMultiplier(foe);
            const pushForce = 380 * holyPush;
            foe.kbx += nx * pushForce * dt * 10;
            foe.kby += ny * pushForce * dt * 10;
            const overlap = reach - dist;
            foe.x += nx * overlap * Math.min(1, dt * 15);
            foe.y += ny * overlap * Math.min(1, dt * 15);

            foe._holyCircleTick = (foe._holyCircleTick || 0) - dt;
            if (foe._holyCircleTick <= 0) {
              foe._holyCircleTick = 0.4;
              const holyDmgMult = getHolyDamageMultiplier(foe);
              const dmg = 24 * holyDmgMult * (player.damageMultiplier || 1);
              foe.takeDamage(dmg, 'holy', nx * 180 * holyPush, ny * 180 * holyPush);
              this.state.texts.push(new DamageText(foe.x, foe.y - 30, 'POSVÁTNÝ ODRAZ! ✝️', '#FDE047', false));
            }
          }
        }
      }

      if (player.regenLevel > 0 && player.hp < player.maxHp) {
        player.regenTimer += dt;
        if (player.regenTimer >= 5) {
          player.hp = Math.min(player.maxHp, player.hp + player.regenLevel * 4);
          player.regenTimer = 0;
        }
      }

      if (player.pivniTacekTimer > 0) {
        player.pivniTacekTimer = Math.max(0, player.pivniTacekTimer - dt);
      }

      // Auto-fire weapons
      if (player.weapons) {
        for (let i = 0; i < player.weapons.length; i++) {
          const w = player.weapons[i];
          w.cd -= dt;
          if (w.cd <= 0) {
            const wDef = WEAPONS[w.id];
            if (wDef) {
              if (!w.mastery) w.mastery = createWeaponMasteryState();
              player._firingWeapon = w;
              const fired = wDef.fire(player, w.level);
              player._firingWeapon = null;
              const rankDef = getWeaponRankDef(w.id, w.level);
              const weaponCooldownBonus = getWeaponActiveCooldownBonus(w, rankDef);
              const movingBonus = isMoving ? (player.movingCooldownBonus || 0) : 0;
              const playerCooldownBonus =
                typeof player.cooldownBonus === 'number'
                  ? Math.max(0, player.cooldownBonus + movingBonus)
                  : Math.max(0, ((player.cooldownMultiplier || 1) - 1) / 0.9 + movingBonus);
              const baseCd = wDef.baseCd;
              const formulaCd = getEffectiveWeaponCooldown(baseCd, playerCooldownBonus, weaponCooldownBonus);
              const stats = (w as any)._cachedStats || ((w as any)._cachedStats = getRankedWeaponStats(w.id, w.level, w));
              let localCd = formulaCd * stats.cooldownMult;
              if ((player.pivniTacekTimer || 0) > 0) {
                localCd = localCd / 1.35;
              }

              w.cd = fired ? localCd : 0.1;
            }
          }
        }
      }
    }

    // Step plum jam puddles
    if (this.state.plumPuddles && this.state.plumPuddles.length > 0) {
      for (let i = 0; i < this.state.plumPuddles.length; i++) {
        const pud = this.state.plumPuddles[i];
        pud.life -= dt;
        if (pud.life <= 0) pud.dead = true;
      }
      compactInPlace(this.state.plumPuddles, (p: any) => !p.dead);
    }

    // Step projectiles
    for (let i = 0; i < this.state.projectiles.length; i++) {
      const p = this.state.projectiles[i];

      if (p.homing && !p.isEnemy) {
        if (p._target && !isDirectTargetable(p._target, this.state.player)) {
          p._target = null;
          p._targetScanTimer = 0;
        }
        const nearest = getCachedHomingTarget(p, dt, () => {
          const enemies = this.spatialHash.queryCircle(p.x, p.y, 400);
          let candidate: any = null;
          let nearestDistSq = Infinity;
          for (let ei = 0; ei < enemies.length; ei++) {
            const enemy = enemies[ei];
            // Poloviditelná Mrazivá jezinka nemůže být vybrána jako cíl naváděných střel.
            if (enemy.isDefeated || enemy.dead || p.hitList?.includes(enemy) || !isDirectTargetable(enemy, this.state.player)) continue;
            const dsq = (enemy.x - p.x) ** 2 + (enemy.y - p.y) ** 2;
            if (dsq < nearestDistSq) {
              nearestDistSq = dsq;
              candidate = enemy;
            }
          }
          return candidate;
        });
        if (nearest) {
          const targetAng = Math.atan2(nearest.y - p.y, nearest.x - p.x);
          const currentAng = Math.atan2(p.vy, p.vx);
          let diff = targetAng - currentAng;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          const turnRate = 9.0 * dt;
          const newAng = currentAng + Math.max(-turnRate, Math.min(turnRate, diff));
          const spd = p.speed || Math.hypot(p.vx, p.vy) || 390;
          p.vx = Math.cos(newAng) * spd;
          p.vy = Math.sin(newAng) * spd;
          p.angle = newAng;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0) {
        p.dead = true;
        continue;
      }

      if (p.isEnemy) {
        if (player && player.hp > 0 && Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
          player.takeDamage(p.dmg, p.type || 'blunt');
          if (p.soakPlayer) {
            player.waterSoakedTimer = 3.5 * Math.max(0.15, 1 - getForestDebuffReduction(this.state.meta?.forestLevel || 0));
          }
          if (p.slowPlayer) {
            player.slowTimer = 2.2 * Math.max(0.15, 1 - getForestDebuffReduction(this.state.meta?.forestLevel || 0));
          }
          p.dead = true;
        }
        continue;
      }

      const nearby = this.spatialHash.queryCircle(p.x, p.y, p.radius + 72);
      for (let j = 0; j < nearby.length; j++) {
        const e = nearby[j];
        if (e.isDefeated || e.dead) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const reach = p.radius + e.radius;
        if (!p.hitList.includes(e) && distanceSq(p.x, p.y, e.x, e.y) < reach * reach) {
          p.hitList.push(e);
          const baseHunger = typeof e.hunger === 'number' ? e.hunger : e.foodResist || 0;
          const red = this.state.player?.foodResistReduction || 0;
          const hungerResist = Math.max(0, baseHunger * (1 - red));
          const resist = p.type === 'food' ? hungerResist : 0;
          if (resist >= 0.95) {
            this.state.texts.push(new DamageText(e.x, e.y - 20, 'IMUNNÍ', '#0F172A'));
          } else {
            let dmg = p.dmg * (1 - resist);
            if (p.type === 'food') {
              const baseSnack = p.snackDuration ?? 4.0;
              const effectiveSnack = baseSnack * Math.max(0, 1 - hungerResist);
              e.snackTimer = Math.min(6.0, (e.snackTimer || 0) + effectiveSnack);
              this.callbacks?.onSound?.('snack');
            }
            if (p.type === 'holy') {
              dmg *= getHolyDamageMultiplier(e);
            }
            const holyPush = p.type === 'holy' ? Math.max(0.1, 1 - getEnemyHolyResistance(e)) : 1;
            const kbMult = p.knockbackMult ?? 1;
            e.takeDamage(
              dmg,
              p.type,
              p.type === 'food' ? 0 : p.vx * 0.3 * holyPush * kbMult,
              p.type === 'food' ? 0 : p.vy * 0.3 * holyPush * kbMult,
              p.stunDuration ? { stunDuration: p.stunDuration } : undefined
            );
            if (p.type === 'ice') e.chill(p.chillDuration ?? 3.5);
            if (p.interruptsWindup) {
              if (typeof e.interruptAttack === 'function') e.interruptAttack();
              e.isAttacking = false;
              e.windupTimer = 0;
              e.strikeTimer = 0;
              if (e.aiState === 'windup') e.aiState = 'idle';
              this.state.texts.push(new DamageText(e.x, e.y - 25, 'ŠTÍP! 🪿', '#F8FAFC', false));
            }
            if (p.panicDuration && !e.isBoss) {
              e.panicked = true;
              e.panicTimer = Math.max(e.panicTimer || 0, p.panicDuration);
              const pAng = Math.atan2(e.y - p.y, e.x - p.x);
              e.kbx += Math.cos(pAng) * 140;
              e.kby += Math.sin(pAng) * 140;
            }
            if (p.coinStealChance && Math.random() < p.coinStealChance) {
              this.spawnDrop('coin', e.x, e.y, { value: 1, speed: 60 });
              this.state.texts.push(new DamageText(e.x, e.y - 35, '+1 🪙', '#FBBF24', false));
            }
            if (p.bounces && p.bounces > 0) {
              p.bounces--;
              let next: any = null;
              for (const candidate of (this.livingEnemies || this.state.enemies || [])) {
                if (candidate !== e && !candidate.isDefeated && !candidate.dead) {
                  next = candidate;
                  break;
                }
              }
              if (next) {
                const bAng = Math.atan2(next.y - p.y, next.x - p.x);
                p.vx = Math.cos(bAng) * (p.speed || 390);
                p.vy = Math.sin(bAng) * (p.speed || 390);
                p.angle = bAng;
                p.hitList = [];
                continue;
              }
            }
            if (p.penetrate || (typeof p.pierce === 'number' && p.pierce > 0)) {
              if (p.pierce) p.pierce--;
              continue;
            }
            p.dead = true;
            break;
          }
        }
      }
    }
    compactInPlace(this.state.projectiles, (p) => !p.dead, (p) => {
      if (this.projectilePool.length < 200) this.projectilePool.push(p);
    });

    // Step slashes
    for (let i = 0; i < this.state.slashes.length; i++) {
      const s = this.state.slashes[i];
      if (player) {
        s.x = player.x;
        s.y = player.y;
      }
      s.time = (s.time || 0) + dt;
      s.life -= dt;
      if (s.life <= 0) s.dead = true;

      const nearby = this.spatialHash.queryCircle(s.x, s.y, s.reach + 72);
      for (let j = 0; j < nearby.length; j++) {
        const e = nearby[j];
        if (e.isDefeated || e.dead) continue;
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        const reach = s.reach + e.radius;
        if (Math.abs(dx) <= reach && Math.abs(dy) <= reach && dx * dx + dy * dy <= reach * reach && !s.hitList.includes(e)) {
          const isFullCircle = s.arc >= Math.PI * 2;
          let inArc = isFullCircle;
          if (!isFullCircle) {
            const ang = Math.atan2(dy, dx);
            let diff = Math.abs(ang - s.angle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;
            inArc = diff <= s.arc / 2;
          }

          if (inArc) {
            s.hitList.push(e);
            const isWhip = s.weaponId === 'formansky_bic' || s.style === 'whip';
            let kbForce = (isWhip ? 340 : 260) * (s.knockbackMult ?? 1);
            let dmg = s.dmg;
            let dmgType = s.type;
            const dmgOpts: any = {};
            if (s.stunDuration) dmgOpts.stunDuration = s.stunDuration;
            if (s.ignoreResist) dmgOpts.ignoreResist = s.ignoreResist;

            if (isWhip) {
              dmgOpts.cannotDodge = true;
              dmgOpts.ignoreDodge = true;
              const milestones = s.milestones || [];
              const distFromPlayer = Math.hypot(e.x - s.x, e.y - s.y);
              const isTipHit = distFromPlayer >= s.reach * 0.65;

              // Immediately interrupt attack
              if (typeof e.interruptAttack === 'function') {
                e.interruptAttack();
              }
              e.isAttacking = false;
              e.windupTimer = 0;
              e.strikeTimer = 0;
              if (e.aiState === 'windup') e.aiState = 'idle';

              if (isTipHit) {
                // Třesk na konci biče
                if (milestones.includes('whip_lead_knot_3')) {
                  dmgOpts.ignoreResist = 1.0;
                  dmg *= 1.25;
                }
                if (milestones.includes('whip_tar_tip_5')) {
                  dmgType = 'fire';
                  if (e.prefix === 'mrazivy' || e.category === 'frost') {
                    dmg *= 1.5;
                  }
                }
                if (milestones.includes('whip_thunder_crack_8')) {
                  const fearResist = e.willpower || 0;
                  e.panicTimer = Math.max(e.panicTimer || 0, 2.0 * (1 - fearResist * 0.5));
                  e.panicked = true;
                  this.spatialHash.withQuery(e.x, e.y, 100, (tipNear) => {
                    for (let ti = 0; ti < tipNear.length; ti++) {
                      const te = tipNear[ti];
                      if (!te.isDefeated && !te.dead) {
                        te.panicTimer = Math.max(te.panicTimer || 0, 2.0 * (1 - (te.willpower || 0) * 0.5));
                        te.panicked = true;
                      }
                    }
                  });
                }
                this.state.texts.push(new DamageText(e.x, e.y - 28, 'PRÁSK! 🪢', '#FDE047', true));
              }

              if (s.soaked || milestones.includes('whip_wet_strap_5')) {
                kbForce *= 1.45;
                if (typeof e.soak === 'function') e.soak();
                if (typeof e.chill === 'function') e.chill(2.0);
              }
            }

            e.takeDamage(
              dmg,
              dmgType,
              Math.cos(s.angle) * kbForce,
              Math.sin(s.angle) * kbForce,
              dmgOpts
            );
          }
        }
      }
    }
    compactInPlace(this.state.slashes, (s) => !s.dead, (s) => {
      if (this.slashPool.length < 50) this.slashPool.push(s);
    });

    // Step enemies
    if (this.state.timeStopTimer > 0) {
      this.state.timeStopTimer = Math.max(0, this.state.timeStopTimer - dt);
    }
    if (this.state.ponocnyFrostTimer > 0) {
      this.state.ponocnyFrostTimer = Math.max(0, this.state.ponocnyFrostTimer - dt);
    }
    if (this.state.masopustShockwaveTimer > 0) {
      this.state.masopustShockwaveTimer = Math.max(0, this.state.masopustShockwaveTimer - dt);
    }
    if (this.state.cameraTremorTimer > 0) {
      this.state.cameraTremorTimer = Math.max(0, this.state.cameraTremorTimer - dt);
    }
    if (player.intangibleTimer > 0) {
      player.intangibleTimer = Math.max(0, player.intangibleTimer - dt);
    }
    if (player.guaranteedCritTimer > 0) {
      player.guaranteedCritTimer = Math.max(0, player.guaranteedCritTimer - dt);
    }
    if (this.state.screenFlashTimer > 0) {
      this.state.screenFlashTimer = Math.max(0, this.state.screenFlashTimer - dt);
    }

    if (this.state.timeStopTimer <= 0) {
      for (let i = 0; i < this.state.enemies.length; i++) {
        const e = this.state.enemies[i];
        if (e.brawlTimer && e.brawlTimer > 0) {
          e.brawlTimer = Math.max(0, e.brawlTimer - dt);
          let nearestFoe: any = null;
          let nearestDist = 999999;
          for (let k = 0; k < this.state.enemies.length; k++) {
            const other = this.state.enemies[k];
            if (other === e || other.dead || other.isDefeated) continue;
            const d = Math.hypot(other.x - e.x, other.y - e.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearestFoe = other;
            }
          }
          if (nearestFoe) {
            const bAng = Math.atan2(nearestFoe.y - e.y, nearestFoe.x - e.x);
            e.x += Math.cos(bAng) * (e.speed || 100) * 1.15 * dt;
            e.y += Math.sin(bAng) * (e.speed || 100) * 1.15 * dt;
            if (nearestDist < e.radius + nearestFoe.radius + 18) {
              e.brawlAttackCooldown = (e.brawlAttackCooldown || 0) - dt;
              if (e.brawlAttackCooldown <= 0) {
                e.brawlAttackCooldown = 0.55;
                const bDmg = Math.max(8, Math.round((e.damage || 15) * (0.8 + Math.random() * 0.5)));
                nearestFoe.takeDamage(bDmg, 'physical', Math.cos(bAng) * 200, Math.sin(bAng) * 200);
                if (nearestFoe.hp <= 0) {
                  nearestFoe.killedByFriendlyFire = true;
                }
              }
            }
            continue;
          }
        }
        if (e.category === 'shadows' && !e.dead && !e.isDefeated) {
          const isLit = isPositionIlluminated(
            e.x,
            e.y,
            this.state.lightSources,
            dayPhase.id,
            this.state.shadowZones,
            this.state.occluders
          );
          evaluateShadowDefense(e, isLit, dt, {
            onBreak: (shadowEnemy) => {
              for (let k = 0; k < 6; k++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 40 + Math.random() * 50;
                tryEmitParticle(this.state.particles, () => ({
                  x: shadowEnemy.x,
                  y: shadowEnemy.y - shadowEnemy.radius * 0.4,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  life: 0.35,
                  color: '#1E1B18',
                  size: 3.5,
                }), this.state.meta?.performanceProfile);
              }
            },
          });
        }

        if (typeof e.update === 'function') {
          e.update(dt, player);
        }

        if (e.id === 'bludicka') {
          if (!e.dead && !e.isDefeated) {
            if (!e.bludickaLight) {
              e.bludickaLight = {
                id: e.bludickaLightId || (e.bludickaLightId = `bludicka_${e.id}_${i}`),
                x: e.x,
                y: e.y,
                radius: 175,
                color: '#67E8F9',
                type: 'bludicka',
              };
              this.state.lightSources.push(e.bludickaLight);
            } else {
              e.bludickaLight.x = e.x;
              e.bludickaLight.y = e.y;
            }
          } else if (e.bludickaLight) {
            const idx = this.state.lightSources.indexOf(e.bludickaLight);
            if (idx !== -1) {
              this.state.lightSources.splice(idx, 1);
            }
            e.bludickaLight = null;
          }
        }

      if (e.isDefeated || e.dead || (e.snackTimer || 0) > 0 || (e.stunTimer || 0) > 0 || !player || player.hp <= 0) {
        if (typeof e.interruptAttack === 'function') {
          e.interruptAttack();
        } else {
          e.isAttacking = false;
          e.windupTimer = 0;
        }
        e.inContact = false;
        continue;
      }

      if (e.recoveryTimer && e.recoveryTimer > 0) {
        e.recoveryTimer = Math.max(0, e.recoveryTimer - dt);
      }

      const distToPlayer = Math.hypot(e.x - player.x, e.y - player.y);
      const attackRange = typeof e.attackRange === 'number' ? e.attackRange : e.radius + 25;
      const cadence: EnemyAttackCadence = e.attackCadence || 'normal';
      const attackDelay =
        typeof e.attackDelay === 'number'
          ? e.attackDelay
          : typeof e.attackInterval === 'number'
          ? e.attackInterval
          : CADENCE_ATTACK_DELAYS[cadence] ?? 1.2;
      const recoveryDuration = CADENCE_RECOVERY_DURATIONS[cadence] ?? 0.2;

      if (!e.isAttacking) {
        if ((!e.recoveryTimer || e.recoveryTimer <= 0) && distToPlayer <= attackRange) {
          e.isAttacking = true;
          e.windupTimer = 0;
          e.attackAngle = Math.atan2(player.y - e.y, player.x - e.x);
          e.inContact = true;
        } else {
          e.inContact = distToPlayer <= attackRange;
        }
      }

      // Uleželý syreček v kapse:
      // Jakmile se nepřítel v těsné blízkosti lovce začne napřahovat k útoku (windupTimer),
      // závan ze syrečku mu podlomí kolena a přepne ho na 4 sekundy do stavu Vyčerpaný (vycerpany – poloviční rychlost pohybu i útoku).
      const closeReach = Math.max(attackRange, 85 + (((player.syrecekStacks || 1) - 1) * 15));
      if (
        (player.syrecekStacks || 0) > 0 &&
        e.isAttacking &&
        distToPlayer <= closeReach &&
        (!e.vycerpanyTimer || e.vycerpanyTimer <= 0)
      ) {
        e.vycerpanyTimer = 4.0;
        if (typeof e.interruptAttack === 'function') {
          e.interruptAttack();
        } else {
          e.isAttacking = false;
          e.windupTimer = 0;
        }
        this.state.texts.push(new DamageText(e.x, e.y - 30, 'VYČERPÁN! 🧀', '#A3E635', true));
        if (this.state.particles) {
          for (let pIdx = 0; pIdx < 4; pIdx++) {
            const ang = Math.random() * Math.PI * 2;
            tryEmitParticle(this.state.particles, () => ({
              x: e.x + (Math.random() - 0.5) * 12,
              y: e.y + (Math.random() - 0.5) * 12,
              vx: Math.cos(ang) * 35,
              vy: Math.sin(ang) * 35 - 15,
              life: 0.45,
              color: pIdx % 2 === 0 ? '#BEF264' : '#EAB308',
              size: 3.5,
            }), this.state.meta?.performanceProfile);
          }
        }
      }

      if (e.isAttacking) {
        const attackCadenceMult = ((e.vycerpanyTimer || 0) > 0 || e.prefix === 'vycerpany') ? 0.5 : 1.0;
        e.windupTimer = (e.windupTimer || 0) + dt * attackCadenceMult;
        if (e.windupTimer >= attackDelay) {
          const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
          let angleDiff = Math.abs(angleToPlayer - (e.attackAngle ?? angleToPlayer));
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
          const inFrontCone = angleDiff <= Math.PI * 0.55;

          if (distToPlayer <= attackRange && inFrontCone) {
            const mult = typeof e.getDamageDealtMultiplier === 'function' ? e.getDamageDealtMultiplier() : 1;
            player.takeDamage(e.damage * mult, 'physical', e, true);
          }
          e.windupTimer = 0;
          e.isAttacking = false;
          e.recoveryTimer = recoveryDuration;
          e.inContact = distToPlayer <= attackRange;
        }
      }
    }
    compactInPlace(this.state.enemies, (e) => !e.dead);
    }

    // Rebuild spatial hash with active living enemies
    this.livingEnemies.length = 0;
    for (let i = 0; i < this.state.enemies.length; i++) {
      const e = this.state.enemies[i];
      if (!e.isDefeated && !e.dead) {
        this.livingEnemies.push(e);
      }
    }
    this.spatialHash.rebuild(this.livingEnemies);
    evaluateBludickaAura(this.livingEnemies, this.state.lightSources, player);

    // Step decor
    if (this.state.decor) {
      for (let i = 0; i < this.state.decor.length; i++) {
        const d = this.state.decor[i];
        if (d.animTime !== undefined) d.animTime += dt;

        if (d.vx || d.vy) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          // Apply drag to káča
          if (d.type === 'kaca') {
            const drag = Math.max(0, 1 - 2.5 * dt);
            d.vx *= drag;
            d.vy *= drag;
            if (Math.abs(d.vx) < 5) d.vx = 0;
            if (Math.abs(d.vy) < 5) d.vy = 0;
          }
          // Wrap around approx bounds for ice floes
          if (d.type === 'ice_floe') {
            if (d.x > 1800) d.x = -1800;
            if (d.x < -1800) d.x = 1800;
            if (d.y > 1800) d.y = -1800;
            if (d.y < -1800) d.y = 1800;
          }
        }

        if (d.isObstacle) {
          // Push player
          if (player && player.hp > 0) {
            const dx = player.x - d.x;
            const dy = player.y - d.y;
            const dist = Math.hypot(dx, dy);
            const reach = player.radius + d.radius;
            if (dist < reach) {
              const overlap = reach - dist;
              if (dist > 0.001) {
                player.x += (dx / dist) * overlap;
                player.y += (dy / dist) * overlap;
              }
              if (d.type === 'granny_stove' && Math.random() < 0.05) {
                player.hp = Math.min(player.maxHp || 100, player.hp + 2);
              }
              if (d.type === 'ice_floe') {
                player.x += d.vx * dt;
              }
              if (d.type === 'kaca' && dist < reach - 2) {
                // Player kicks the top!
                d.vx = (dx / dist) * -300;
                d.vy = (dy / dist) * -300;
              }
            }
          }
          // Push enemies
          for (let j = 0; j < this.livingEnemies.length; j++) {
            const e = this.livingEnemies[j];
            const edx = e.x - d.x;
            const edy = e.y - d.y;
            const edist = Math.hypot(edx, edy);
            const ereach = (e.radius || 15) + d.radius;
            if (edist < ereach) {
              const eoverlap = ereach - edist;
              if (edist > 0.001) {
                e.x += (edx / edist) * eoverlap;
                e.y += (edy / edist) * eoverlap;
              }
              if (d.type === 'kaca' && Math.hypot(d.vx, d.vy) > 50) {
                if (typeof e.takeDamage === 'function') {
                  e.takeDamage(20, false, 'physical', player);
                } else {
                  e.hp -= 20;
                  if (e.hp <= 0) e.isDefeated = true;
                }
                d.vx = (edx / edist) * -200;
                d.vy = (edy / edist) * -200;
              } else if (d.type === 'kaca') {
                // Enemy kicks the top
                d.vx = (edx / edist) * -150;
                d.vy = (edy / edist) * -150;
              }
              if (d.type === 'ice_floe') {
                e.x += d.vx * dt; // Carried by ice
              }
            }
          }
        }
      }
    }

    // Step drops
    if (this.state.drops) {
      for (let i = 0; i < this.state.drops.length; i++) {
        const d = this.state.drops[i];
        d.time = (d.time || 0) + dt;
        if (d.isHot && d.goldenRushTimer && d.goldenRushTimer > 0) {
          d.goldenRushTimer -= dt;
          if (d.goldenRushTimer <= 0) {
            d.isHot = false;
          }
        }
        if (d.vx || d.vy) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          const drag = Math.max(0, 1 - 7.5 * dt);
          d.vx *= drag;
          d.vy *= drag;
        }

        if (player && player.hp > 0) {
          const dist = Math.hypot(d.x - player.x, d.y - player.y);
          if (dist < player.pickupRadius) {
            const spd = Math.max(520, (player.pickupRadius - dist) * 7.5 + 380) * dt;
            const ang = Math.atan2(player.y - d.y, player.x - d.x);
            d.x += Math.cos(ang) * spd;
            d.y += Math.sin(ang) * spd;
            const curDist = Math.hypot(d.x - player.x, d.y - player.y);

            if (curDist < player.radius + (d.radius || 12) + 14 || dist < player.radius + (d.radius || 12) + 14) {
              d.dead = true;
              this.callbacks?.onDropPickup?.(d);
              if (d.type === 'coin') {
                const undeadLvl = this.state.meta?.undeadLevel || 0;
                const rawVal = d.value || 1;
                const bonusVal = rawVal * (1 + undeadLvl * 0.10);
                const whole = Math.floor(bonusVal);
                this.state.coinFraction = (this.state.coinFraction || 0) + (bonusVal - whole);
                let extra = 0;
                if (this.state.coinFraction >= 1.0) {
                  extra = Math.floor(this.state.coinFraction);
                  this.state.coinFraction -= extra;
                }
                const val = Math.max(1, whole + extra);
                this.state.coins += val;
                this.callbacks?.onSound?.('coin');
              } else if (d.type === 'gingerbread') {
                const isHotActive = d.isHot && d.goldenRushTimer && d.goldenRushTimer > 0;
                const ovenLvl = this.state.meta?.ovenLevel || 0;
                const rawVal = (d.value || 1) * (isHotActive ? 2 : 1);
                const bonusVal = rawVal * (1 + ovenLvl * 0.10);
                const whole = Math.floor(bonusVal);
                this.state.gingerbreadFraction = (this.state.gingerbreadFraction || 0) + (bonusVal - whole);
                let extra = 0;
                if (this.state.gingerbreadFraction >= 1.0) {
                  extra = Math.floor(this.state.gingerbreadFraction);
                  this.state.gingerbreadFraction -= extra;
                }
                const val = Math.max(1, whole + extra);
                this.state.gingerbread += val;
                this.callbacks?.onSound?.('gingerbreadPickup');

                // Pouťové perníkové srdce
                if (player && (player.poutoveSrdceStacks || 0) > 0) {
                  const size = d.size || 'small';
                  const cdMult = player.gingerbreadHeartCdMult || 1.0;
                  const oldUltCd = player.ultCd || 0;
                  let cdReduction = 0.2 * cdMult;
                  if (size === 'large') cdReduction = 0.6 * cdMult;
                  else if (size === 'giant') cdReduction = 2.0 * cdMult;

                  player.ultCd = Math.max(0, oldUltCd - cdReduction);

                  // Jemný záblesk zrcátka při dobití schopnosti
                  const fullyRecharged = oldUltCd > 0 && player.ultCd <= 0;
                  const sparkCount = fullyRecharged ? 14 : (size === 'giant' ? 8 : (size === 'large' ? 5 : 3));
                  const mirrorColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#94A3B8', '#BAE6FD'];
                  for (let sp = 0; sp < sparkCount; sp++) {
                    const ang = Math.random() * Math.PI * 2;
                    const speed = (fullyRecharged ? 85 : 50) + Math.random() * 40;
                    this.state.particles.push({
                      x: player.x + (Math.random() - 0.5) * 16,
                      y: player.y + (Math.random() - 0.5) * 16,
                      vx: Math.cos(ang) * speed,
                      vy: Math.sin(ang) * speed - 15,
                      life: fullyRecharged ? 0.45 : 0.32,
                      color: mirrorColors[sp % mirrorColors.length],
                      size: fullyRecharged ? 3.8 : 2.5,
                    });
                  }

                  if (fullyRecharged) {
                    this.state.texts.push(new DamageText(player.x, player.y - 68, '🪞 ZRCÁTKO: NABITO!', '#F8FAFC', true));
                  }

                  if (size === 'large') {
                    player.gingerbreadSpeedTimer = 2.0;
                    player.gingerbreadSpeedBonus = 0.15;
                  } else if (size === 'giant') {
                    const heal = 8 * player.poutoveSrdceStacks;
                    player.hp = Math.min(player.maxHp, player.hp + heal);
                    this.state.texts.push(new DamageText(player.x, player.y - 45, `+${heal} Kuráž! 💝`, '#F43F5E', true));
                    const nearbyEnemies = this.spatialHash.queryCircle(player.x, player.y, 110);
                    for (let ci = 0; ci < nearbyEnemies.length; ci++) {
                      const foe = nearbyEnemies[ci];
                      if (!foe.isDefeated && !foe.dead) {
                        foe.takeDamage(15 * (player.damageMultiplier || 1), 'physical', (foe.x - player.x) * 2, (foe.y - player.y) * 2);
                      }
                    }
                  }
                }
              } else if (d.type === 'horseshoe') {
                this.callbacks?.onSound?.('horseshoe');
                applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
              } else if (d.type === 'rooster') {
                this.callbacks?.onSound?.('rooster');
                this.state.screenFlashTimer = 0.45;
                this.state.screenFlashColor = '#FFFFFF';
                for (let k = 0; k < this.state.enemies.length; k++) {
                  const foe = this.state.enemies[k];
                  if (!foe.isDefeated && !foe.dead) {
                    if (foe.isBoss || foe.isMiniboss) {
                      foe.takeDamage(650, 'holy');
                    } else {
                      foe.takeDamage(foe.hp || 50, 'holy');
                    }
                  }
                }
              } else if (d.type === 'cuckoo_clock') {
                this.callbacks?.onSound?.('cuckooClock');
                this.state.timeStopTimer = 4.0;
              } else if (d.type === 'potion') {
                this.callbacks?.onSound?.('potion');
                const waterLevel = this.state.meta?.waterLevel || 0;
                let potionHeal = 30 * (1 + waterLevel * 0.20);
                if (d.isMercyDrop) {
                  const mercyCap = player.maxHp * 0.45;
                  if (player.hp + potionHeal > mercyCap) {
                    potionHeal = Math.max(0, mercyCap - player.hp);
                  }
                }
                player.hp = Math.min(player.maxHp, player.hp + potionHeal);
                player.invulnerabilityTimer = Math.min(5, waterLevel > 0 ? 1 + waterLevel * 0.5 : 0);
              } else if (d.type === 'bread' || d.type === 'pear') {
                this.callbacks?.onSound?.('potion');
                let foodHeal = 15;
                if (d.isMercyDrop) {
                  const mercyCap = player.maxHp * 0.45;
                  if (player.hp + foodHeal > mercyCap) {
                    foodHeal = Math.max(0, mercyCap - player.hp);
                  }
                }
                player.hp = Math.min(player.maxHp, player.hp + foodHeal);
              } else if (d.type === 'soul') {
                this.callbacks?.onSound?.('soul');
                player.soulBuffTimer = 6.0;
                this.state.souls += 1;
                this.state.coins += 25;
                const churchLvl = this.state.meta?.churchLevel || 0;
                if (churchLvl > 0) {
                  const waveDmg = getChurchWaveDamage(churchLvl);
                  const waveRadius = 350;
                  for (const e of this.livingEnemies) {
                    if (e.isDefeated || e.dead) continue;
                    const dx = e.x - player.x;
                    const dy = e.y - player.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    if (dist <= waveRadius) {
                      e.takeDamage(waveDmg, 'holy', (dx / dist) * 280, (dy / dist) * 280);
                    }
                  }
                  this.callbacks?.onSound?.('bell');
                  this.state.texts.push(new DamageText(player.x, player.y - 80, `SVATÁ VLNA! ⛪ -${waveDmg}`, '#FEF08A', true));
                }
              } else if (d.type === 'chest') {
                this.callbacks?.onOpenChest?.();
              } else if (d.type === 'chasnik') {
                this.callbacks?.onRescueChasnik?.(d.x, d.y);
              } else if (
                d.type === 'ponocny_horn' ||
                d.type === 'masopust_rattle' ||
                d.type === 'babicka_apron' ||
                d.type === 'slivovice_splash' ||
                d.type === 'svanda_bagpipes' ||
                d.type === 'kominik_button'
              ) {
                applyRareItemEffect(this.state, player, d.type, {
                  onSound: (s) => this.callbacks?.onSound?.(s),
                  onDamageText: (opts) => {
                    const dt = new DamageText(opts.x, opts.y, opts.text, opts.color || '#F59E0B', true);
                    this.state.texts.push(dt);
                    this.callbacks?.onDamageText?.(dt);
                  },
                });
              } else if (d.type === 'arcivzacny_ananas') {
                applyAnanasUpgrade(player, {
                  onSound: (s) => this.callbacks?.onSound?.(s),
                  onDamageText: (opts) => {
                    const dt = new DamageText(opts.x, opts.y, opts.text, opts.color || '#FDE047', true);
                    this.state.texts.push(dt);
                    this.callbacks?.onDamageText?.(dt);
                  },
                });
              } else if (d.type === 'big_pouch') {
                this.callbacks?.onSound?.('coin');
                const pouchVal = d.value || 35;
                this.state.coins += pouchVal;
                this.state.texts.push(new DamageText(player.x, player.y - 75, `VELKÝ MĚŠEC! +${pouchVal} kr. 🪙`, '#F59E0B', true));
              } else if (d.type === 'gingerbread_stash') {
                this.callbacks?.onSound?.('gingerbreadPickup');
                const stashVal = d.value || 25;
                this.state.gingerbread += stashVal;
                const mercyCap = player.maxHp * 0.45;
                const healAmt = Math.max(0, Math.min(30, mercyCap - player.hp));
                if (healAmt > 0) {
                  player.hp += healAmt;
                  this.state.texts.push(new DamageText(player.x, player.y - 50, `+${healAmt} Kuráž! 🧺`, '#F43F5E', true));
                }
                this.state.texts.push(new DamageText(player.x, player.y - 75, `KOŠÍK PERNÍKU! +${stashVal} 🧺`, '#D97706', true));
              }
            }
          }
        }
      }
      const pendingBank = this.state.pendingDropBank
        ?? (this.state.pendingDropBank = createPendingDropBank());
      this.state.dropFusionTimer = (this.state.dropFusionTimer || 0) + dt;
      if (
        this.state.dropFusionTimer >= 1.5 ||
        this.state.drops.length > MAX_DROPS_LIMIT
      ) {
        this.state.dropFusionTimer = 0;
        const fusionTarget = hasPendingDrops(pendingBank)
          ? MAX_DROPS_LIMIT - 1
          : MAX_DROPS_LIMIT;
        performDropFusion(this.state.drops, undefined, fusionTarget);
      }
      compactInPlace(this.state.drops, (d) => !d.dead, (d) => {
        if (this.dropPool.length < 100) this.dropPool.push(d);
      });
      releasePendingDrops(this.state.drops, pendingBank);
    }

    // Step texts
    if (this.state.texts) {
      for (let i = 0; i < this.state.texts.length; i++) {
        this.state.texts[i].update?.(dt);
      }
      compactInPlace(this.state.texts, (t) => (t.life ?? 1) > 0);
      if (this.state.texts.length > MAX_DAMAGE_TEXTS) {
        const excess = this.state.texts.length - MAX_DAMAGE_TEXTS;
        for (let i = 0; i < MAX_DAMAGE_TEXTS; i++) {
          this.state.texts[i] = this.state.texts[i + excess];
        }
        this.state.texts.length = MAX_DAMAGE_TEXTS;
      }
    }

    // Step smoke puffs
    if (this.state.smokePuffs) {
      for (let i = 0; i < this.state.smokePuffs.length; i++) {
        this.state.smokePuffs[i].update?.(dt);
      }
      compactInPlace(this.state.smokePuffs, (p) => !p.dead);
    }

    // Step particles
    if (this.state.particles) {
      for (let i = 0; i < this.state.particles.length; i++) {
        const p = this.state.particles[i];
        p.x += (p.vx || 0) * dt;
        p.y += (p.vy || 0) * dt;
        p.life -= dt;
      }
      compactInPlace(this.state.particles, (p) => p.life > 0);
      const particleLimit = getParticleLimit(this.state.meta?.performanceProfile);
      if (this.state.particles.length > particleLimit) {
        const excess = this.state.particles.length - particleLimit;
        for (let i = 0; i < particleLimit; i++) {
          this.state.particles[i] = this.state.particles[i + excess];
        }
        this.state.particles.length = particleLimit;
      }
    }

    // Step RunDirector (Threat budget, tactical spawns, pacing valves, hazards, Bubacka dira)
    if (this.director) {
      this.director.update(dt, this);
      this.state.activeHazards = this.director.hazards;
      this.state.bubackaDira = this.director.bubackaDira;
      this.state.directorTelegraphText = this.director.telegraphMessage;
      this.state.directorTelegraphTimer = this.director.telegraphTimer;
    }
  }
}
