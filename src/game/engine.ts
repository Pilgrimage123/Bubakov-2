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
import { isDirectTargetable, isJezinkaSemiVisible, JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER } from './targeting';
import { stepCrowForaging, restoreStolenBundleDrops } from './crowForaging';
import { tryEmitParticle, getParticleLimit, tryEmitLadaComicPopup } from './particles';
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
  UNHOLY_ENEMY_IDS,
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
import { toCanonicalHunterId, toCanonicalEnemyId } from './migration';
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
  canCollectDrop,
  FOOD_DROP_EXPIRATION,
  SOUL_DROP_EXPIRATION,
  MAX_DROPS_LIMIT,
  hasPendingDrops,
  spawnDropWithLimit,
  releasePendingDrops,
  createPendingDropBank,
  sweepCoinsIntoBigPouches,
  refundExpiredHotGingerbread,
  type DropSpawnOptions,
} from './drops';
import {
  getKrajanekBlockingHp,
  getKrajanekMomentumMultiplier,
  getKrajanekStoneRadius,
  computeKrajanekSteering,
  stepKrajanekRide,
  stepKrajanekCoastingStones,
  isPlayerAbilityActive,
  KRAJANEK_ABILITY_COOLDOWN,
  KRAJANEK_RIDE_DURATION,
  KRAJANEK_RIDE_SPEED_MULTIPLIER,
} from './krajanekAbility';
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
import {
  MARCH_ARENA_BOUNDS,
  MARCH_MARIAN_APPARITION_COOLDOWN,
  MARCH_THAW_POIS,
  getMarchPois,
  clampToMarchArenaBounds,
  collideCircleWithObstacles,
   getMarchIceFloeState,
  getMarchWaterAndFloeEffect,
  hasTerrainLineOfSight,
  isAquaticEnemy,
  isInsideMarchPoi,
  resolveMarchThawObstacles,
  sanitizeArenaSpawnPoint,
} from '../data/marchThawArena';
import {
  DUBEN_POIS,
  getDubenPois,
  DUBEN_BELL_COOLDOWN,
  clampToDubenArenaBounds,
  isInsideDubenPoi,
  resolveDubenObstacles,
  getDubenWaterEffect,
} from '../data/dubnovyDenArena';
import {
  KVETEN_POIS,
  getKvetenPois,
  resolveKvetenObstacles,
  getKvetenWaterEffect,
  isInsideKvetenPoi,
} from '../data/kvetenArena';
import {
  CERVEN_POIS,
  getCervenPois,
  resolveCervenObstacles,
  getCervenWaterEffect,
  isInsideCervenPoi,
  createInitialSvatojanskeByliny,
  createInitialSvatojanskyPoklad,
} from '../data/cervenArena';
import {
  CERVENEC_POIS,
  getCervenecPois,
  resolveCervenecObstacles,
  getCervenecWaterEffect,
  isInsideCervenecPoi,
  createInitialPoutniStrelniceState,
} from '../data/cervenecArena';
import {
  SRPEN_POIS,
  getSrpenPois,
  resolveSrpenObstacles,
  getSrpenWaterEffect,
  isInsideSrpenPoi,
  createInitialChlebovaPecState,
  createInitialVavrineckaVatra,
} from '../data/srpenArena';
import {
  ZARI_POIS,
  getZariPois,
  resolveZariObstacles,
  getZariWaterEffect,
  isInsideZariPoi,
  createInitialKotelNaPovidlaState,
  createInitialSvatovaclavskyOhenState,
} from '../data/zariArena';
import {
  RIJEN_POIS,
  getRijenPois,
  resolveRijenObstacles,
  getRijenWaterEffect,
  isInsideRijenPoi,
  createInitialOhnicekBramborState,
  createInitialDusickovaSviceState,
} from '../data/rijenArena';
import {
  LISTOPAD_POIS,
  getListopadPois,
  resolveListopadObstacles,
  getListopadWaterEffect,
  isInsideListopadPoi,
  createInitialSvatomartinskaHusaPekacState,
  createInitialUhliarskyMilirState,
} from '../data/listopadArena';
import {
  PROSINEC_POIS,
  getProsinecPois,
  resolveProsinecObstacles,
  getProsinecWaterEffect,
  isInsideProsinecPoi,
  createInitialAdventniVenecState,
  createInitialStedrovecerniZvonState,
} from '../data/prosinecArena';
import {
  LEDEN_POIS,
  getLedenPois,
  resolveLedenObstacles,
  getLedenWaterEffect,
  isInsideLedenPoi,
  createInitialSnehulakNavesState,
  createInitialTrikralovaFaraState,
} from '../data/ledenArena';
import {
  UNOR_POIS,
  getUnorPois,
  resolveUnorObstacles,
  getUnorWaterEffect,
  isInsideUnorPoi,
  createInitialMasopustniKoblihyState,
  createInitialPochovavaniBasyState,
} from '../data/unorArena';

export const MAX_PARTICLES = 300;
export const MAX_DAMAGE_TEXTS = 90;

const keepLiveParticle = (particle: any): boolean => particle.life > 0;
const keepLiveText = (text: any): boolean => (text.life ?? 1) > 0;
const keepLiveSmokePuff = (puff: any): boolean => !puff.dead;
const keepLivePlumPuddle = (puddle: any): boolean => !puddle.dead;
const keepLiveProjectile = (projectile: any): boolean => !projectile.dead;
const keepLiveSlash = (slash: any): boolean => !slash.dead;
const keepLiveEnemy = (enemy: any): boolean => !enemy.dead;
const keepLiveDrop = (drop: any): boolean => !drop.dead;

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
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2D1609';
    ctx.lineWidth = 2.0;
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
  onVictory?: (levelId: GameLevelId, reason: 'boss' | 'dawn') => void;
}

export class GameEngine {
  public state: EngineState;
  public spatialHash: SpatialHash<any>;
  public livingEnemies: any[];
  public director: RunDirector | null = null;
  public callbacks?: GameEngineCallbacks;

  public get activeLevelId(): GameLevelId | undefined {
    return this.state.activeLevelId;
  }

  public get marchThaw() {
    return this.state.marchThaw;
  }
  public set marchThaw(val: any) {
    this.state.marchThaw = val;
  }

  public get dubenDen() {
    return this.state.dubenDen;
  }
  public set dubenDen(val: any) {
    this.state.dubenDen = val;
  }

  public get kveten() {
    return this.state.kveten;
  }
  public set kveten(val: any) {
    this.state.kveten = val;
  }

  public get cerven() {
    return this.state.cerven;
  }
  public set cerven(val: any) {
    this.state.cerven = val;
  }

  public get cervenec() {
    return this.state.cervenec;
  }
  public set cervenec(val: any) {
    this.state.cervenec = val;
  }

  public get srpen() {
    return this.state.srpen;
  }
  public set srpen(val: any) {
    this.state.srpen = val;
  }

  public get zari() {
    return this.state.zari;
  }
  public set zari(val: any) {
    this.state.zari = val;
  }

  public get rijen() {
    return this.state.rijen;
  }
  public set rijen(val: any) {
    this.state.rijen = val;
  }

  public get rijenActivePoiPrompt() {
    return this.state.rijenActivePoiPrompt;
  }
  public set rijenActivePoiPrompt(val: any) {
    this.state.rijenActivePoiPrompt = val;
  }

  public get listopad() {
    return this.state.listopad;
  }
  public set listopad(val: any) {
    this.state.listopad = val;
  }
  public get listopadActivePoiPrompt() {
    return this.state.listopadActivePoiPrompt;
  }
  public set listopadActivePoiPrompt(val: any) {
    this.state.listopadActivePoiPrompt = val;
  }

  public get prosinec() {
    return this.state.prosinec;
  }
  public set prosinec(val: any) {
    this.state.prosinec = val;
  }
  public get prosinecActivePoiPrompt() {
    return this.state.prosinecActivePoiPrompt;
  }
  public set prosinecActivePoiPrompt(val: any) {
    this.state.prosinecActivePoiPrompt = val;
  }

  public get leden() {
    return this.state.leden;
  }
  public set leden(val: any) {
    this.state.leden = val;
  }
  public get ledenActivePoiPrompt() {
    return this.state.ledenActivePoiPrompt;
  }
  public set ledenActivePoiPrompt(val: any) {
    this.state.ledenActivePoiPrompt = val;
  }

  public get unor() {
    return this.state.unor;
  }
  public set unor(val: any) {
    this.state.unor = val;
  }
  public get unorActivePoiPrompt() {
    return this.state.unorActivePoiPrompt;
  }
  public set unorActivePoiPrompt(val: any) {
    this.state.unorActivePoiPrompt = val;
  }

  public get yolkPuddles() {
    return this.state.yolkPuddles;
  }
  public get plumPuddles() {
    return this.state.plumPuddles;
  }
  public get marchThawActivePoiPrompt() {
    return this.state.marchThawActivePoiPrompt;
  }
  public set marchThawActivePoiPrompt(val: any) {
    this.state.marchThawActivePoiPrompt = val;
  }
  public get dubenActivePoiPrompt() {
    return this.state.dubenActivePoiPrompt;
  }
  public set dubenActivePoiPrompt(val: any) {
    this.state.dubenActivePoiPrompt = val;
  }
  public get kvetenActivePoiPrompt() {
    return this.state.kvetenActivePoiPrompt;
  }
  public set kvetenActivePoiPrompt(val: any) {
    this.state.kvetenActivePoiPrompt = val;
  }
  public get cervenActivePoiPrompt() {
    return this.state.cervenActivePoiPrompt;
  }
  public set cervenActivePoiPrompt(val: any) {
    this.state.cervenActivePoiPrompt = val;
  }
  public get cervenecActivePoiPrompt() {
    return this.state.cervenecActivePoiPrompt;
  }
  public set cervenecActivePoiPrompt(val: any) {
    this.state.cervenecActivePoiPrompt = val;
  }
  public get srpenActivePoiPrompt() {
    return this.state.srpenActivePoiPrompt;
  }
  public set srpenActivePoiPrompt(val: any) {
    this.state.srpenActivePoiPrompt = val;
  }
  public get zariActivePoiPrompt() {
    return this.state.zariActivePoiPrompt;
  }
  public set zariActivePoiPrompt(val: any) {
    this.state.zariActivePoiPrompt = val;
  }
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
    category?: CombatTextCategory,
    icon?: string
  ): DamageText | null {
    const cat = category || (icon === 'gingerbread' ? 'lootResources' : inferCombatTextCategory(text));
    if (!isCombatTextCategoryEnabled(cat)) return null;
    const dt = this.damageTextPool.acquire();
    dt.reset(x, y, text, color, big, cat, icon);
    if (!this.state.texts.includes(dt)) {
      this.state.texts.push(dt);
    }
    this.callbacks?.onDamageText?.(dt);
    return dt;
  }

  public emitDamageText(
    x: number,
    y: number,
    text: string,
    color = '#FFFFFF',
    big = false,
    category?: CombatTextCategory,
    icon?: string
  ): DamageText | null {
    return this.addDamageText(x, y, text, color, big, category, icon);
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
    const levelDef: GameLevelDef = GAME_LEVELS[levelId] || GAME_LEVELS[0];
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
    const cType = toCanonicalHunterId(type);
    const baseMaxHp =
      cType === 'krajanek'
        ? 135
        : cType === 'tulak'
        ? 230
        : cType === 'pasacek'
        ? 55
        : cType === 'korenarka'
        ? 125
        : cType === 'kostelnik'
        ? 135
        : cType === 'babicka'
        ? 130
        : 140;

    const baseSpeed =
      cType === 'krajanek'
        ? 180
        : cType === 'tulak'
        ? 165
        : cType === 'pasacek'
        ? 220
        : cType === 'korenarka'
        ? 180
        : cType === 'kostelnik'
        ? 170
        : cType === 'babicka'
        ? 165
        : 175;

    const basePickup =
      cType === 'krajanek'
        ? 115
        : cType === 'tulak'
        ? 75
        : cType === 'pasacek'
        ? 160
        : cType === 'korenarka'
        ? 105
        : cType === 'kostelnik'
        ? 110
        : cType === 'babicka'
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
        : cType === 'krajanek'
        ? [{ id: 'osikovy_prut', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : cType === 'tulak'
        ? [{ id: 'bylinkova_fajfka', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : cType === 'pasacek'
        ? [{ id: 'povidlove_buchty', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : cType === 'korenarka'
        ? [{ id: 'devatero_kviti', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : cType === 'kostelnik'
        ? [{ id: 'svecena_kropenka', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : cType === 'babicka'
        ? [{ id: 'kynuty_kolac', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }]
        : [{ id: 'kovana_halapartna', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [], synergisticUpgrades: [] }];

    initialWeapons.forEach((w: any) => {
      ensureWeaponMilestones(w);
      w._cachedStats = getRankedWeaponStats(w.id, w.level, w);
    });

    const wallBonusHp = Math.round(baseMaxHp * getWallHpMultiplier(meta?.wallLevel || 0));
    const millBonusSpeed = Math.round(baseSpeed * getMillSpeedMultiplier(meta?.millLevel || 0));
    const rawBasePickup = cType === 'korenarka' ? 26 : basePickup;
    const scarecrowBonusPickup = Math.round(rawBasePickup * getScarecrowPickupMultiplier(meta?.scarecrowLevel || 0));
    const wallDmgRed = getWallDamageReduction(meta?.wallLevel || 0);

    const baseLuck =
      cType === 'babicka'
        ? 120
        : cType === 'pasacek'
        ? 105
        : cType === 'tulak'
        ? 70
        : cType === 'kostelnik'
        ? 100
        : cType === 'ponocny'
        ? 90
        : cType === 'korenarka'
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
      tulakDamageBonus: cType === 'tulak' ? 35 : 0,
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
      dodgeChance: cType === 'pasacek' ? 0.35 : 0,
      tavernShieldLevel: meta?.tavernShieldLevel || 0,
      tempShield: 0,
      herbTimer: 0,
      soulBuffTimer: 0,
      waterSoakedTimer: 0,
      slowTimer: 0,
      hasSoakedCane: false,
      hromnickaPulseTimer: 0,
      hromnickaPulseRadius: 0,
      krajanekRideTimer: 0,
      krajanekRideTickTimer: 0,
      krajanekUpgradeCount: 0,
      krajanekFlats: [] as Array<{ x: number; y: number; angle: number; scale: number; life: number }>,
      ultCd: 0,
      ultMaxCd: cType === 'krajanek' ? KRAJANEK_ABILITY_COOLDOWN : cType === 'tulak' ? 21 : cType === 'babicka' ? 45 : cType === 'kostelnik' ? 35 : 30,
      lastDx: 1,
      lastDy: 0,
      facingX: 1 as 1 | -1,
      animTime: 0,
      valecniceAngle: 0,
      valecniceOrbitDir: 1,
      _valecniceBounceCd: 0,
      valecniceHitTimer: 0,
      garlicAuraTimer: 0,
      _valecniceSlowRadius: 0,
      _valecniceSlowRate: 0,
      _valecnicePulse: false,
      _garlicPulse: false,
      _caneSwingAlt: false,
      stillTimer: 0,
      flailStanceTimer: 0,
      activeLevelId: this.state.activeLevelId ?? 0,
      decor: this.state.decor,

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
        self.emitDamageText(attacker.x, attacker.y - 48, 'ODSTRČENÍ! 💨', '#F59E0B', true, 'combatStates');
      },

      takeDamage(amount: number, type = 'physical', attacker?: any, isMelee?: boolean) {
        if (this.hp <= 0) return;
        if (
          this.invulnerabilityTimer > 0 ||
          (this.intangibleTimer && this.intangibleTimer > 0) ||
          (this.type === 'krajanek' && (this.krajanekRideTimer || 0) > 0)
        ) return;
        const effectiveDodgeChance = Math.min(0.60, typeof this.dodgeChance === 'number' ? this.dodgeChance : ((this.type === 'pasacek' || this.type === 'shepherd') ? 0.35 : 0));
        if (effectiveDodgeChance > 0 && Math.random() < effectiveDodgeChance) {
          self.emitDamageText(this.x, this.y - 35, 'ÚHYB! 💨', '#F59E0B', true, 'combatStates');
          self.callbacks?.onSound?.('swish');

          // Vrbová píšťalka z pastviny
          if ((this.vrbovaPistalkaStacks || 0) > 0) {
            const pistalkaStacks = this.vrbovaPistalkaStacks || 1;
            this.ultCd = Math.max(0, (this.ultCd || 0) - (2.0 + (pistalkaStacks - 1) * 0.75));
            this.pistalkaSpeedTimer = 3.0 + (pistalkaStacks - 1) * 0.5;
            const shockRadius = 160 + (pistalkaStacks - 1) * 25;
            const shockDmg = Math.round(45 + (pistalkaStacks - 1) * 20 + (this.speed || 180) * 0.4);
            const shockFoes = self.spatialHash.queryRadius(this.x, this.y, shockRadius);
            for (let i = 0; i < shockFoes.length; i++) {
              const foe = shockFoes[i];
              if (foe.isDefeated || foe.dead) continue;
              const fdx = foe.x - this.x;
              const fdy = foe.y - this.y;
              const fdist = Math.hypot(fdx, fdy) || 1;
              const kx = (fdx / fdist) * 260;
              const ky = (fdy / fdist) * 260;
              foe.takeDamage(shockDmg, 'physical', kx, ky);
            }
            self.emitDamageText(this.x, this.y - 55, 'HVIZD! 🪈', '#38BDF8', true);
          }

          // Vodnický klobouk s pentlí
          if ((this.lojemMazaneKrpceStacks || 0) > 0) {
            const kloboukStacks = this.lojemMazaneKrpceStacks || 1;
            this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer || 0, 0.55 + (kloboukStacks - 1) * 0.15);
            this.hp = Math.min(this.maxHp, this.hp + 4 * kloboukStacks);
            const puddleX = attacker ? attacker.x : this.x;
            const puddleY = attacker ? attacker.y : this.y;
            const slowRatio = Math.min(0.60, 0.40 + (kloboukStacks - 1) * 0.10);
            self.spawnPlumPuddle(puddleX, puddleY, slowRatio);
            self.emitDamageText(this.x, this.y - 50, 'SMEKNUTO! 🎩', '#10B981', true);
          }

          return;
        }
        if ((meta?.windLevel || 0) > 0 && this.dodgeCooldown <= 0) {
          this.dodgeCooldown = Math.max(10, 60 - (meta?.windLevel || 0) * 10);
          self.emitDamageText(this.x, this.y - 35, 'DODGE!', '#F59E0B', true, 'combatStates');
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
          const hitInvulnerability = isMelee && (this.type === 'pasacek' || this.type === 'shepherd') ? 0.6 : 0.3;
          this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer || 0, hitInvulnerability);
          this.hurtTimer = Math.max(this.hurtTimer || 0, 0.42);
        }
        self.callbacks?.onSound?.('hit');
        self.callbacks?.onPlayerTakeDamage?.(hurtDmg, type);

        if (absorbed > 0 && remainingDmg <= 0) {
          self.emitDamageText(this.x, this.y - 35, 'ŠTÍT POHLTIL! 🛡️', '#38BDF8', true);
        } else {
          self.emitDamageText(this.x, this.y - 35, `-${Math.ceil(remainingDmg)}`, '#EF4444');
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
        this.spawnMonster('mrazovy_skritek', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75);
      }
    } else if (levelId === 2) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        this.spawnMonster('rarach', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75);
      }
    } else if (levelId === 3) {
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.5;
        this.spawnMonster('skeleton', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 0.9);
      }
      this.spawnMonster('cerny_pes', player.x + 480, player.y - 100, 0.9);
    } else if (levelId === 4) {
      this.spawnMonster('chroust', player.x + 460, player.y - 100, 1.0);
      this.spawnMonster('chroust', player.x - 460, player.y + 100, 1.0);
      this.spawnMonster('pampeliska_chmyri', player.x, player.y - 440, 1.0);
    } else if (levelId === 5) {
      this.spawnMonster('zbojnik', player.x + 460, player.y, 1.0);
      this.spawnMonster('jiskrivec', player.x - 460, player.y, 1.0);
    } else if (levelId === 6) {
      this.spawnMonster('rak_ricni', player.x + 460, player.y + 100, 1.0);
      this.spawnMonster('roj_polnich_mysaku', player.x - 460, player.y - 100, 1.0);
    } else if (levelId === 7) {
      this.spawnMonster('bludicka', player.x + 460, player.y + 80, 1.0);
      this.spawnMonster('rak_ricni', player.x - 460, player.y - 80, 1.0);
    } else if (levelId === 8) {
      this.spawnMonster('polni_krecek', player.x + 460, player.y + 80, 1.0);
      this.spawnMonster('zitna_baba', player.x - 460, player.y - 80, 1.0);
    } else if (levelId === 9) {
      this.spawnMonster('kulovy_blesk', player.x + 460, player.y + 80, 1.0);
      this.spawnMonster('plivnik', player.x - 460, player.y - 80, 1.0);
    } else if (levelId === 10) {
      this.spawnMonster('srpnove_cmelak', player.x + 440, player.y + 60, 1.0);
      this.spawnMonster('polni_mysice', player.x - 440, player.y - 60, 1.0);
    } else if (levelId === 11) {
      this.spawnMonster('nocni_mura', player.x + 450, player.y, 1.0);
      this.spawnMonster('cerny_vlkodlak', player.x - 460, player.y + 60, 1.0);
    } else if (levelId === 12) {
      this.spawnMonster('svestkovy_srsen', player.x + 440, player.y + 60, 1.0);
      this.spawnMonster('polni_mysice', player.x - 440, player.y - 60, 1.0);
    } else if (levelId === 13) {
      this.spawnMonster('bludicka', player.x + 450, player.y, 1.0);
      this.spawnMonster('topivec', player.x - 460, player.y + 60, 1.0);
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
    const levelId = this.state.activeLevelId ?? 0;
    const safeBase = sanitizeArenaSpawnPoint(x, y, isBoss || isMiniboss ? 32 : 22, levelId, this.state.decor, 48);
    x = safeBase.x;
    y = safeBase.y;

    if (id === 'vrana' && (isMiniboss || isBoss)) {
      this.state.flockTreasureDropped = false;
      const crowCount = 9;
      let leaderCrow: any = null;
      for (let i = 0; i < crowCount; i++) {
        const angle = (i / crowCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const dist = i === 0 ? 0 : 35 + (i % 3) * 15;
        const crowPos = sanitizeArenaSpawnPoint(
          x + Math.cos(angle) * dist,
          y + Math.sin(angle) * dist,
          18,
          levelId,
          this.state.decor,
          36
        );
        const cx = crowPos.x;
        const cy = crowPos.y;
        const crowTitle = i === 0 ? (customBossTitle || '🐦‍⬛ Hejno mrazivých vran') : undefined;
        const isLeaderBoss = isBoss && i === 0;
        const enemy = this.enemyFactory
          ? this.enemyFactory(id, cx, cy, multiplier, isLeaderBoss, isMiniboss || isBoss, crowTitle, prefix)
          : this.createHeadlessEnemy(id, cx, cy, multiplier, isLeaderBoss, isMiniboss || isBoss, crowTitle, prefix);

        enemy.isMinibossFlockMember = true;
        enemy.flockIndex = i;
        enemy.flockTotal = crowCount;

        this.state.enemies.push(enemy);
        if (!enemy.isDefeated && !enemy.dead) {
          this.livingEnemies.push(enemy);
          this.spatialHash.insert(enemy);
          this.director?.recordEnemySpawn(enemy, this.state.gameTime);
        }
        if (i === 0) leaderCrow = enemy;
      }
      return leaderCrow;
    }

    if (id === 'ledovi_muzi' && isBoss) {
      const trioCount = 3;
      let leaderBoss: any = null;
      const roles = ['pankrac', 'servac', 'bonifac'] as const;
      const names = [
        'Pankrác (Ledový muž)',
        'Servác (Ledový muž)',
        'Bonifác (Ledový muž)',
      ];
      for (let i = 0; i < trioCount; i++) {
        const angle = (i / trioCount) * Math.PI * 2;
        const dist = 140;
        const trioPos = sanitizeArenaSpawnPoint(
          x + Math.cos(angle) * dist,
          y + Math.sin(angle) * dist,
          26,
          levelId,
          this.state.decor,
          40
        );
        const trioTitle = names[i];
        const enemy = this.enemyFactory
          ? this.enemyFactory(id, trioPos.x, trioPos.y, multiplier, true, false, trioTitle, prefix)
          : this.createHeadlessEnemy(id, trioPos.x, trioPos.y, multiplier, true, false, trioTitle, prefix);

        enemy.isTrioMember = true;
        enemy.trioRole = roles[i];
        enemy.trioIndex = i;
        enemy.trioTotal = trioCount;
        enemy.customBossTitle = trioTitle;

        this.state.enemies.push(enemy);
        if (!enemy.isDefeated && !enemy.dead) {
          this.livingEnemies.push(enemy);
          this.spatialHash.insert(enemy);
          this.director?.recordEnemySpawn(enemy, this.state.gameTime);
        }
        if (i === 0) leaderBoss = enemy;
      }
      return leaderBoss;
    }

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
    let value = opts.value;
    let size = opts.size;
    let radius = opts.radius;
    let speed = opts.speed;

    if (
      this.director &&
      (isHealingDrop(type) ||
        type === 'soul' ||
        (type === 'gingerbread' && this.director.dropPacingPhase === 'stress'))
    ) {
      const playerHp = this.state.player?.hp ?? 100;
      const playerMaxHp = this.state.player?.maxHp ?? 100;
      const resolution = resolveDynamicDrop(type, playerHp, playerMaxHp, {
        value: opts.value,
        size: opts.size,
        radius: opts.radius,
        speed: opts.speed,
        vulnerabilityScore: this.director.vulnerabilityScore,
        pacingPhase: this.director.dropPacingPhase,
        mercyCooldownActive: this.director.mercyPityCooldown > 0,
        expiration: opts.expiration,
        activeDrops: this.state.drops,
        soulBuffActive: (this.state.player?.soulBuffTimer || 0) > 0,
        bearMaskLevel: this.state.player?.bearMaskLevel || 0,
      });
      resolvedType = resolution.type;
      if (resolution.value !== undefined) value = resolution.value;
      if (resolution.size !== undefined) size = resolution.size as any;
      if (resolution.radius !== undefined) radius = resolution.radius;
      if (resolution.speed !== undefined) speed = resolution.speed;
      if (resolution.isHot !== undefined) isHot = resolution.isHot;
      if (resolution.expiration !== undefined) expiration = resolution.expiration;
      if (resolution.isMercyDrop !== undefined) isMercyDrop = resolution.isMercyDrop;
      if (isMercyDrop && isHealingDrop(resolvedType)) {
        this.director.mercyPityCooldown = 15.0;
      }
    }

    if (isHealingDrop(resolvedType) && expiration === undefined) {
      expiration = FOOD_DROP_EXPIRATION;
    } else if (resolvedType === 'soul' && expiration === undefined) {
      expiration = SOUL_DROP_EXPIRATION;
    }

    const safeDropPos = sanitizeArenaSpawnPoint(
      x,
      y,
      radius || 14,
      this.state.activeLevelId ?? 0,
      this.state.decor,
      36
    );
    x = safeDropPos.x;
    y = safeDropPos.y;

    // The engine's state array is the single source of truth. Never fall back
    // to constructing an unmanaged item when the 40-slot arena is full.
    const pooled = this.dropPool.pop();
    const drop = createDropInstance(
      resolvedType,
      x,
      y,
      {
        ...opts,
        value,
        size,
        radius,
        speed,
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
    // The registry key is "snehulak"; the horde uses this canonical runtime ID.
    if (!stats && resolvedId === 'tajici_snehulak') {
      stats = ENEMIES.snehulak;
    }
    if (!stats) {
      console.warn(`[Bubakov] Unknown enemy id: "${id}" in createHeadlessEnemy, resolving safe fallback`);
      const fallbackMap: Record<string, string> = {
        kostlivec_obr: 'umrlec',
        skeleton: 'kostlivec',
        skeleton_scythe: 'kostlivec_kosa',
        kostlivec_koste: 'kostlivec_kosa',
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
        pekelny_cert: 'cert',
        pekelny_drab: 'drab',
        cerny_vlk: 'cerny_vlkodlak',
      };
      resolvedId =
        fallbackMap[id] ||
        (((this.state.activeLevelId ?? 0) === 0 || this.state.activeLevelId === 1)
          ? 'mrazovy_skritek'
          : this.state.activeLevelId === 2
          ? 'zkazena_kraslice'
          : this.state.activeLevelId === 3
          ? 'skeleton'
          : 'rarach');
      stats = ENEMIES[resolvedId] || ENEMIES.rarach;
    }

    const isLevel0 = (this.state.activeLevelId ?? 0) === 0;
    if (isLevel0 && prefix === 'pekelny') {
      prefix = undefined;
    }

    let finalHp = Math.round(stats.hp * (multiplier || 1));
    const isCrowBossOrMiniboss = resolvedId === 'vrana' && (isMiniboss || isBoss);
    if (isMiniboss || isBoss) {
      if (resolvedId === 'vrana') {
        finalHp = isBoss ? 200 : 38; // 200 Kuráže na vránu jako finální boss = ~1800 celkem (kotevní benchmark), 38 pro miniboss (~342 celkem)
      } else if (isMiniboss) {
        finalHp = Math.max(finalHp, 220);
      }
    }
    const renderScale = isCrowBossOrMiniboss ? 1.2 : resolvedId === 'vrana' ? 0.34 : isMiniboss ? 1.75 : isBoss ? 1.35 : 1.0;
    const radius = isCrowBossOrMiniboss ? Math.round(stats.radius * 1.15) : isMiniboss ? Math.round(stats.radius * 1.65) : isBoss ? stats.radius * 1.3 : stats.radius;
    let poiseResist = (isMiniboss || isBoss) ? Math.min(0.88, Math.max(0.82, (stats.poiseResist || 0) + 0.45)) : stats.poiseResist || 0;
    const foodResist = (isMiniboss || isBoss) ? Math.min(0.85, Math.max(0.78, (stats.foodResist || 0) + 0.45)) : stats.foodResist || 0;
    const hunger = (isMiniboss || isBoss)
      ? Math.min(0.85, Math.max(0.78, (stats.hunger !== undefined ? stats.hunger : stats.foodResist || 0) + 0.45))
      : stats.hunger !== undefined
      ? stats.hunger
      : stats.foodResist || 0;
    const willpower = (isMiniboss || isBoss) ? Math.min(0.95, Math.max(0.85, (stats.willpower || 0) + 0.45)) : stats.willpower || 0;
    const cadence: EnemyAttackCadence = stats.attackCadence || 'normal';
    let attackInterval = stats.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
    const baseDamage = isCrowBossOrMiniboss
      ? (isBoss ? 10 : 8)
      : isMiniboss
      ? Math.round(stats.damage * (isLevel0 ? 1.05 : 1.35))
      : stats.damage;
    let enemySpeed = isCrowBossOrMiniboss
      ? 260
      : stats.speed;
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
      if (!Array.isArray(hazards)) return false;
      if (hazards.length >= 14) {
        const trailIdx = hazards.findIndex((h: any) => h.kind === 'frost-trail' || h.kind === 'magma-trail' || h.kind === 'ink-smoke');
        if (trailIdx !== -1) {
          hazards.splice(trailIdx, 1);
        } else {
          return false;
        }
      }
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
      isFlying: Boolean(stats.isFlying || resolvedId === 'vrana'),
      isGroundedForLoot: false,
      isCarryingLootBundle: false,
      carryingLootBundle: [] as any[],
      crowForageTarget: null as any,
      crowForageTimer: 0,
      crowForageCooldown: 0,
      crowEscapeTimer: 0,
      escapeDirX: 0,
      escapeDirY: 0,
      escapedWithLoot: false,
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
      semiVisible: resolvedId === 'jezinka_mraziva',
      meltHpRatio: 1.0,
      meltSquashX: 1.0,
      meltSquashY: 1.0,
      wobbleScaleX: 1.0,
      wobbleScaleY: 1.0,
      witchState: resolvedId === 'carodejnice_koste' ? 'dive' : undefined,
      witchStateTimer: resolvedId === 'carodejnice_koste' ? 3.0 : 0,
      witchHexCooldown: resolvedId === 'carodejnice_koste' ? 0.8 : 0,
      flightAltitude: resolvedId === 'carodejnice_koste' ? 22 : 0,
      rehtackarPulseTimer: resolvedId === 'rehtackar' ? 1.5 : undefined,
      clatterTimer: 0,
      rehtackarBuffTimer: 0,

      interruptAttack() {
        this.isAttacking = false;
        this.windupTimer = 0;
      },

      update(dt: number, player: any) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.contactTimer > 0) this.contactTimer -= dt;
        if (this.garlicSlowTimer > 0) this.garlicSlowTimer -= dt;
        if (this.vycerpanyTimer > 0) this.vycerpanyTimer = Math.max(0, this.vycerpanyTimer - dt);
        if (this.rehtackarBuffTimer && this.rehtackarBuffTimer > 0) {
          this.rehtackarBuffTimer = Math.max(0, this.rehtackarBuffTimer - dt);
        }
        if (this.clatterTimer && this.clatterTimer > 0) {
          this.clatterTimer = Math.max(0, this.clatterTimer - dt);
        }
        for (const statusType in this.statusEffects) {
          const effect = this.statusEffects[statusType];
          if (!effect) continue;
          effect.remaining -= dt;
          if (effect.remaining <= 0) delete this.statusEffects[statusType];
        }

        if (!this.isDefeated && !this.dead) {
          this.animTime = (this.animTime || 0) + dt;
        }

        if (this.id === 'tajici_snehulak' && !this.isVirtualSnowmanMember && !this.isDefeated && !this.dead) {
          const ratio = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp || 280)));
          this.meltHpRatio = ratio;
          this.meltSquashX = 1.0 + (1.0 - ratio) * 0.08;
          this.meltSquashY = 0.88 + ratio * 0.12;
          const s = Math.sin(this.animTime * 3.2);
          this.wobbleScaleX = 1.0 + 0.03 * s;
          this.wobbleScaleY = 1.0 - 0.03 * s;
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

        if (
          (this.isAttacking || (this.recoveryTimer || 0) > 0) &&
          !this.isBoss &&
          !this.isMiniboss &&
          !this.isMinibossFlockMember &&
          this.id !== 'carodejnice_zaspalka' &&
          this.id !== 'carodejnice_koste' &&
          this.id !== 'ledovi_muzi' &&
          this.id !== 'cert_sekac' &&
          this.id !== 'kralovsky_vele_rak' &&
          this.id !== 'kralovska_polednice' &&
          this.id !== 'krecek_obilnik' &&
          this.id !== 'zitna_matka' &&
          this.id !== 'hromotluk_marketa' &&
          this.id !== 'bezhlavy_rytir' &&
          this.id !== 'drak' &&
          this.id !== 'kralovsky_cmelak' &&
          this.id !== 'zlatohlavek_zrout' &&
          this.id !== 'dozinkovy_chasnik' &&
          this.id !== 'netopyr_usatec' &&
          this.id !== 'vyr_velky' &&
          this.id !== 'kralovsky_srsen' &&
          this.id !== 'povidlovy_cert' &&
          this.id !== 'posvicensky_hospodar' &&
          this.id !== 'kvilici_meluzina' &&
          this.id !== 'kralovsky_havran' &&
          this.id !== 'hastrman_podzimni' &&
          this.id !== 'drak_vetrnik' &&
          this.id !== 'dusickova_bludicka' &&
          this.id !== 'cert_rybnikar' &&
          this.id !== 'vele_stika'
        ) {
          this.vx = 0;
          this.vy = 0;
        } else if (player) {
          if (
            (this.isBoss || this.isMiniboss || this.isMinibossFlockMember) &&
            !this.enraged &&
            this.hp <= (this.maxHp || 1000) * 0.5 &&
            this.id !== 'vrchni_carodejnice'
          ) {
            this.enraged = true;
            this.speed = (this.speed || 75) * 1.18;
            self.state.cameraTremorTimer = Math.max(self.state.cameraTremorTimer || 0, 0.45);
            self.callbacks?.onSound?.('roar');
            self.emitDamageText(this.x, this.y - 68, '🔥 BUBÁCKÝ HNĚV! DRUHÁ FÁZE!', '#EF4444', true, 'bossAnnouncements');
          }
          const bossCdDt = this.enraged ? dt * 1.25 : dt;

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
          if ((this.rehtackarBuffTimer || 0) > 0) spd *= 1.30;
          if (
            !((this.isFlying || this.id === 'vrana') && !this.isGroundedForLoot) &&
            self.state.plumPuddles &&
            self.state.plumPuddles.length > 0
          ) {
            for (let pi = 0; pi < self.state.plumPuddles.length; pi++) {
              const pud = self.state.plumPuddles[pi];
              if (pud.dead || (pud.life ?? 0) <= 0) continue;
              const maxR = pud.radius + this.radius;
              const pdx = this.x - pud.x;
              const pdy = this.y - pud.y;
              if (Math.abs(pdx) <= maxR && Math.abs(pdy) <= maxR && pdx * pdx + pdy * pdy <= maxR * maxR) {
                spd *= (1 - (pud.slowRatio || 0.35));
                break;
              }
            }
          }

          if (
            !((this.isFlying || this.id === 'vrana') && !this.isGroundedForLoot) &&
            self.state.yolkPuddles &&
            self.state.yolkPuddles.length > 0
          ) {
            for (let yi = 0; yi < self.state.yolkPuddles.length; yi++) {
              const yp = self.state.yolkPuddles[yi];
              if (yp.dead || (yp.life ?? 0) <= 0) continue;
              const maxR = yp.radius + this.radius;
              const ydx = this.x - yp.x;
              const ydy = this.y - yp.y;
              if (Math.abs(ydx) <= maxR && Math.abs(ydy) <= maxR && ydx * ydx + ydy * ydy <= maxR * maxR) {
                spd *= 0.60;
                break;
              }
            }
          }

          if (this.id === 'vrana' && !this.isMinibossFlockMember && !this.isBoss && !this.isVirtualCrowMember && !this.panicked) {
            if (!self.state.dynamicDropLedger) {
              self.state.dynamicDropLedger = { stolenCoins: 0, stolenGingerbread: 0, stolenHeals: 0, stolenItemsCount: 0 };
            }
            const foraging = stepCrowForaging(this, self.state.drops || [], dt, spd, {
              player,
              pendingDropBank: self.state.pendingDropBank,
              swarmReservoir: self.state.swarmReservoir,
              dynamicDropLedger: self.state.dynamicDropLedger,
            });
            if (foraging.escaped) {
              return;
            }
            if (foraging.active) {
              this.vx = foraging.vx;
              this.vy = foraging.vy;
            } else {
              const moveDir = this.panicked ? dir + Math.PI : dir;
              this.vx = Math.cos(moveDir) * spd;
              this.vy = Math.sin(moveDir) * spd;
            }
          } else if (this.id === 'vrana' && (this.isMinibossFlockMember || this.isBoss)) {
            // Stage 1 Final Boss / Miniboss Flock: Hejno mrazivých vran — 3 distinctive maneuvers
            // Attack 1: Střemhlavý nálet (Synchronized V-flock dive pass)
            this.crowDiveCooldown = (typeof this.crowDiveCooldown === 'number' ? this.crowDiveCooldown : 2.8) - bossCdDt;
            this.crowDiveTimer = Math.max(0, (this.crowDiveTimer || 0) - dt);
            if (this.crowDiveCooldown <= 0) {
              this.crowDiveCooldown = 3.8;
              this.crowDiveTimer = 0.85;
              this.crowDiveAngle = dir;
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 36, 'STŘEMHLAVÝ NÁLET! 🐦‍⬛💨', '#38BDF8', true);
            }
            // Attack 2: Mrazivá pera (3-way fan of razor-sharp icy crow feathers)
            this.featherVolleyCooldown = (typeof this.featherVolleyCooldown === 'number' ? this.featherVolleyCooldown : 2.2) - bossCdDt;
            if (this.featherVolleyCooldown <= 0 && dist < 380) {
              this.featherVolleyCooldown = 3.2;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.24;
                const fSpd = 225;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * fSpd,
                  vy: Math.sin(ang) * fSpd,
                  angle: ang,
                  speed: fSpd,
                  dmg: 16,
                  radius: 9,
                  type: 'ice',
                  visual: 'crow_feather',
                  color: '#38BDF8',
                  life: 2.3,
                  maxLife: 2.3,
                  isEnemy: true,
                  pushback: 20,
                  statusText: 'MRAZIVÉ PÍRKO! 🪶❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 42, 'MRAZIVÁ PERA! 🪶❄️', '#BAE6FD', false);
            }
            // Attack 3: Vraní vichřice (Telegraphed icy feather cyclone hazard)
            this.vortexCooldown = (typeof this.vortexCooldown === 'number' ? this.vortexCooldown : 3.6) - bossCdDt;
            if (this.vortexCooldown <= 0) {
              this.vortexCooldown = 4.6;
              addEnemyHazard({
                id: `hazard_crow_vortex_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 48,
                duration: 2.6,
                maxDuration: 2.6,
                type: 'frost',
                slowFactor: 0.62,
                kind: 'crow-vortex',
                warningTimer: 0.85,
                damage: 20,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(player.x, player.y - 38, 'VRANÍ VICHŘICE! 🌪️🐦‍⬛', '#7DD3FC', true);
            }
            const diveMult = this.crowDiveTimer > 0 ? 2.1 : 1.0;
            const moveDir = this.panicked
              ? dir + Math.PI
              : this.crowDiveTimer > 0 && typeof this.crowDiveAngle === 'number'
              ? this.crowDiveAngle
              : dir;
            this.vx = Math.cos(moveDir) * spd * diveMult;
            this.vy = Math.sin(moveDir) * spd * diveMult;
          } else if (this.id === 'zkazena_kraslice') {
            if (this.fusePrimed) {
              this.vx = 0;
              this.vy = 0;
            } else {
              this.hopPhase = (this.hopPhase || 0) + dt * 4.5;
              const hopFactor = Math.max(0, Math.sin(this.hopPhase));
              this.hopHeight = hopFactor * 14;
              const hopSpdMult = hopFactor > 0.2 ? 1.75 : 0.2;
              const wobble = Math.sin((this.animTime || 0) * 6) * 0.45;
              const finalDir = (this.panicked ? dir + Math.PI : dir) + wobble;
              this.vx = Math.cos(finalDir) * spd * hopSpdMult;
              this.vy = Math.sin(finalDir) * spd * hopSpdMult;

              const pDist = Math.hypot(player.x - this.x, player.y - this.y);
              if (pDist <= (this.radius + (player.radius || 18) + 14)) {
                this.fusePrimed = true;
                this.fuseTimer = 1.2;
                this.vx = 0;
                this.vy = 0;
                self.callbacks?.onSound?.('fuse');
              }
            }
          } else if (this.id === 'chroust') {
            // Erratic sine-wave buzzing flight pattern ignoring ground terrain
            this.sinePhase = (this.sinePhase || (Math.random() * Math.PI * 2)) + dt * 6.5;
            const sineOffset = Math.sin(this.sinePhase) * 0.95;
            const flightDir = (this.panicked ? dir + Math.PI : dir) + sineOffset;
            this.vx = Math.cos(flightDir) * spd * 1.08;
            this.vy = Math.sin(flightDir) * spd * 1.08;
            this.flightAltitude = 16 + Math.cos(this.sinePhase * 0.8) * 6;
          } else if (this.id === 'pampeliska_chmyri' || this.id === 'pampeliska_chmyricko') {
            // Sentient dandelion puffs drifting with ambient wind and floating harmonics
            const isMini = this.id === 'pampeliska_chmyricko';
            this.driftPhase = (this.driftPhase || (Math.random() * Math.PI * 2)) + dt * (isMini ? 4.2 : 2.5);
            const gameTime = self.state.gameTime || 0;
            const windAngle = 0.35 + Math.sin(gameTime * 0.18) * 0.3;
            const windStrength = isMini ? 42 : 32;
            const windVx = Math.cos(windAngle) * windStrength;
            const windVy = Math.sin(windAngle) * windStrength;

            const targetDir = this.panicked ? dir + Math.PI : dir;
            const pursuitMult = isMini ? 1.25 : 0.75;
            const pursuitVx = Math.cos(targetDir) * spd * pursuitMult;
            const pursuitVy = Math.sin(targetDir) * spd * pursuitMult;

            const sway = Math.sin(this.driftPhase) * (isMini ? 18 : 12);
            const perpAngle = windAngle + Math.PI / 2;

            this.vx = pursuitVx + windVx + Math.cos(perpAngle) * sway;
            this.vy = pursuitVy + windVy + Math.sin(perpAngle) * sway;
            this.flightAltitude = (isMini ? 12 : 18) + Math.sin(this.driftPhase) * (isMini ? 4 : 6);
          } else if (this.id === 'carodejnice_koste') {
            this.flightAltitude = 22 + Math.sin((this.animTime || 0) * 4) * 8;
            this.witchStateTimer = (typeof this.witchStateTimer === 'number' ? this.witchStateTimer : 3.0) - dt;
            if (!this.witchState) this.witchState = 'dive';

            if (this.witchState === 'dive') {
              const moveDir = this.panicked ? dir + Math.PI : dir;
              this.vx = Math.cos(moveDir) * spd * 1.45;
              this.vy = Math.sin(moveDir) * spd * 1.45;
              if (this.witchStateTimer <= 0 || dist < 65) {
                this.witchState = 'hover';
                this.witchStateTimer = 3.2;
                this.witchHexCooldown = 0.8;
              }
            } else {
              const targetDist = 210;
              const orbitAngle = Math.atan2(this.y - player.y, this.x - player.x) + 0.05;
              const destX = player.x + Math.cos(orbitAngle) * targetDist;
              const destY = player.y + Math.sin(orbitAngle) * targetDist;
              this.vx = (destX - this.x) * 1.6;
              this.vy = (destY - this.y) * 1.6;

              this.witchHexCooldown = (typeof this.witchHexCooldown === 'number' ? this.witchHexCooldown : 1.8) - dt;
              if (this.witchHexCooldown <= 0) {
                this.witchHexCooldown = 4.0;
                const pHeading = Math.atan2(player.vy || 0, player.vx || 0);
                const lead = Math.min(65, Math.hypot(player.vx || 0, player.vy || 0) * 0.7);
                const hexX = player.x + Math.cos(pHeading) * lead;
                const hexY = player.y + Math.sin(pHeading) * lead;
                addEnemyHazard({
                  id: `hazard_urknuti_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                  x: hexX,
                  y: hexY,
                  radius: 46,
                  duration: 1.8,
                  maxDuration: 1.8,
                  type: 'curse',
                  slowFactor: 0.65,
                  kind: 'hex-circle',
                  warningTimer: 1.1,
                  damage: 28,
                  oneShot: true,
                  exploded: false,
                  sourceEnemyId: this.id,
                });
                self.callbacks?.onSound?.('curse');
              }

              if (this.witchStateTimer <= 0) {
                this.witchState = 'dive';
                this.witchStateTimer = 2.6;
              }
            }
          } else if (this.id === 'carodejnice_zaspalka') {
            this.flightAltitude = 24 + Math.sin((this.animTime || 0) * 5) * 8;
            this.zaspalkaTimer = (typeof this.zaspalkaTimer === 'number' ? this.zaspalkaTimer : 2.4) - dt;
            if (!this.zaspalkaState) this.zaspalkaState = 'swoop';

            if (this.zaspalkaState === 'swoop') {
              // High-speed diagonal swoop pass across the player
              if (this.swoopAngle === undefined) {
                this.swoopAngle = Math.atan2(player.y - this.y, player.x - this.x);
              }
              const swoopSpd = spd * 1.85;
              this.vx = Math.cos(this.swoopAngle) * swoopSpd;
              this.vy = Math.sin(this.swoopAngle) * swoopSpd;

              // Sputter black ink smoke hazard behind flight path
              this.smokeCooldown = (typeof this.smokeCooldown === 'number' ? this.smokeCooldown : 0.25) - dt;
              if (this.smokeCooldown <= 0) {
                this.smokeCooldown = 0.28;
                const rearAngle = this.swoopAngle + Math.PI;
                const smokeX = this.x + Math.cos(rearAngle) * 32;
                const smokeY = this.y + Math.sin(rearAngle) * 32;
                addEnemyHazard({
                  id: `hazard_ink_smoke_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                  x: smokeX,
                  y: smokeY,
                  radius: 34,
                  duration: 3.2,
                  maxDuration: 3.2,
                  type: 'soot',
                  slowFactor: 0.70,
                  kind: 'ink-smoke',
                  damage: 14,
                  sourceEnemyId: this.id,
                });
                tryEmitParticle(self.state.particles, () => ({
                  x: smokeX,
                  y: smokeY,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.6,
                  color: '#18181B',
                  size: 6,
                }), self.state.meta?.performanceProfile);
              }

              if (this.zaspalkaTimer <= 0) {
                this.zaspalkaState = 'reposition';
                this.zaspalkaTimer = 1.6;
                this.swoopAngle = undefined;
              }
            } else {
              // Reposition: banking hard around the perimeter to align next diagonal pass
              const orbitDist = 320;
              const currentAngle = Math.atan2(this.y - player.y, this.x - player.x);
              const nextAngle = currentAngle + 2.0 * dt;
              const targetX = player.x + Math.cos(nextAngle) * orbitDist;
              const targetY = player.y + Math.sin(nextAngle) * orbitDist;

              this.vx = (targetX - this.x) * 2.2;
              this.vy = (targetY - this.y) * 2.2;

              if (this.zaspalkaTimer <= 0) {
                this.zaspalkaState = 'swoop';
                this.zaspalkaTimer = 2.4;
                const leadX = player.x + (player.vx || 0) * 0.35;
                const leadY = player.y + (player.vy || 0) * 0.35;
                this.swoopAngle = Math.atan2(leadY - this.y, leadX - this.x);
                self.callbacks?.onSound?.('curse');
              }
            }
          } else if (this.id === 'ledovi_muzi') {
            const role = this.trioRole || (this.trioIndex === 1 ? 'servac' : this.trioIndex === 2 ? 'bonifac' : 'pankrac');
            this.triadDashTimer = Math.max(0, (this.triadDashTimer || 0) - dt);
            // Synchronized triad orbit around the player (or convergence dash during Attack 3)
            const baseOrbit = (self.state.gameTime || 0) * 0.85;
            const roleOffset = role === 'servac' ? (Math.PI * 2) / 3 : role === 'bonifac' ? (Math.PI * 4) / 3 : 0;
            if (this.triadDashTimer > 0) {
              const dashDir = typeof this.triadDashAngle === 'number' ? this.triadDashAngle : dir;
              this.vx = Math.cos(dashDir) * spd * 1.95;
              this.vy = Math.sin(dashDir) * spd * 1.95;
            } else {
              const orbitAngle = baseOrbit + roleOffset;
              const targetDist = 210;
              const targetX = player.x + Math.cos(orbitAngle) * targetDist;
              const targetY = player.y + Math.sin(orbitAngle) * targetDist;
              this.vx = (targetX - this.x) * 1.8;
              this.vy = (targetY - this.y) * 1.8;
            }

            // Frost trails left as they step
            this.frostTrailCooldown = (typeof this.frostTrailCooldown === 'number' ? this.frostTrailCooldown : 0.4) - dt;
            if (this.frostTrailCooldown <= 0) {
              this.frostTrailCooldown = 0.45;
              addEnemyHazard({
                id: `hazard_frost_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 26,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'frost',
                slowFactor: 0.70,
                kind: 'frost-trail',
                sourceEnemyId: this.id,
              });
            }

            // All 3 Ice Saint maneuvers tick (staggered by role so the trio weaves them together, and a solo/last-standing saint executes all 3):
            // Attack 1: Rampouchová salva (5-way icicle fan)
            const initIcicleCd = role === 'pankrac' ? 2.2 : role === 'servac' ? 3.4 : 4.2;
            this.icicleCooldown = (typeof this.icicleCooldown === 'number' ? this.icicleCooldown : initIcicleCd) - bossCdDt;
            if (this.icicleCooldown <= 0) {
              this.icicleCooldown = 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              const icicleCount = 5;
              const spread = 0.22;
              for (let k = 0; k < icicleCount; k++) {
                const angle = targetAngle + (k - (icicleCount - 1) / 2) * spread;
                const speed = 230;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 18,
                  radius: 11,
                  type: 'ice',
                  visual: 'icicle',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 32,
                  statusText: 'RAMPOUCH! ❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(this.x, this.y - 35, 'RAMPOUCHY! ❄️', '#BAE6FD', false);
            }

            // Attack 2: Krupobití (Telegraphed hailstorm circles)
            const initHailCd = role === 'servac' ? 2.4 : role === 'bonifac' ? 3.6 : 4.4;
            this.hailCooldown = (typeof this.hailCooldown === 'number' ? this.hailCooldown : initHailCd) - bossCdDt;
            if (this.hailCooldown <= 0) {
              this.hailCooldown = 4.2;
              for (let k = 0; k < 2; k++) {
                const offsetDist = 40 + Math.random() * 60;
                const offsetAng = Math.random() * Math.PI * 2;
                const hx = player.x + Math.cos(offsetAng) * offsetDist;
                const hy = player.y + Math.sin(offsetAng) * offsetDist;
                addEnemyHazard({
                  id: `hazard_hail_${Math.round(self.state.gameTime * 1000)}_${k}_${Math.random().toString(36).slice(2, 7)}`,
                  x: hx,
                  y: hy,
                  radius: 38,
                  duration: 1.8,
                  maxDuration: 1.8,
                  type: 'frost',
                  slowFactor: 0.65,
                  kind: 'hail-circle',
                  warningTimer: 1.1,
                  damage: 26,
                  oneShot: true,
                  exploded: false,
                  sourceEnemyId: this.id,
                });
              }
              self.callbacks?.onSound?.('fuse');
              self.emitDamageText(this.x, this.y - 35, 'KRUPOBITÍ! 🌨️', '#93C5FD', false);
            }

            // Attack 3: Mrazivý dech & Trojjediný výpad (Freezes drops + Triad Convergence Dash + Triad Blizzard Ring)
            const initFreezeCd = role === 'bonifac' ? 2.8 : role === 'pankrac' ? 3.8 : 4.6;
            this.freezePulseCooldown = (typeof this.freezePulseCooldown === 'number' ? this.freezePulseCooldown : initFreezeCd) - bossCdDt;
            if (this.freezePulseCooldown <= 0) {
              this.freezePulseCooldown = 4.8;
              this.triadDashTimer = 0.75;
              this.triadDashAngle = dir;
              if (self.state.drops) {
                for (let di = 0; di < self.state.drops.length; di++) {
                  const d = self.state.drops[di];
                  if (d && !d.dead && !d.isFrozen) {
                    const dDist = Math.hypot(d.x - this.x, d.y - this.y);
                    if (dDist <= 260) {
                      d.isFrozen = true;
                      d.freezeTimer = 6.0;
                    }
                  }
                }
              }
              addEnemyHazard({
                id: `hazard_triad_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 56,
                duration: 2.5,
                maxDuration: 2.5,
                type: 'frost',
                slowFactor: 0.60,
                kind: 'triad-blizzard',
                warningTimer: 0.75,
                damage: 24,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(this.x, this.y - 35, 'MRAZIVÝ DECH! 🧊', '#67E8F9', false);
            }
          } else if (this.id === 'kralovsky_vele_rak') {
            // Miniboss: Steady pursuit with water rush charge & muddy projectile spray
            this.chargeCooldown = (typeof this.chargeCooldown === 'number' ? this.chargeCooldown : 3.8) - bossCdDt;
            if (this.chargeCooldown <= 0) {
              this.chargeCooldown = 4.2;
              this.speedBurstTimer = 1.2;
              self.callbacks?.onSound?.('water_splash');
              self.emitDamageText(this.x, this.y - 35, 'VÝPAD KLEPET! 🦞', '#0284C7', true);
            }
            if ((this.speedBurstTimer || 0) > 0) {
              this.speedBurstTimer -= dt;
              spd *= 1.85;
            }

            // Water mud jet
            this.waterJetCooldown = (typeof this.waterJetCooldown === 'number' ? this.waterJetCooldown : 3.2) - bossCdDt;
            if (this.waterJetCooldown <= 0 && dist < 360) {
              this.waterJetCooldown = 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.22;
                const speed = 210;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 22,
                  radius: 10,
                  type: 'water',
                  visual: 'water_drop',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'BAHENNÍ STŘÍKNUTÍ! 💧',
                  dead: false,
                });
              }
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'cert_sekac') {
            // Stage 7 Midboss: Flaming scythe wide cleave, fire patches & hellfire pitchfork volley
            this.scytheCleaveCooldown = (typeof this.scytheCleaveCooldown === 'number' ? this.scytheCleaveCooldown : 3.2) - bossCdDt;
            if (this.scytheCleaveCooldown <= 0 && dist < 130) {
              this.scytheCleaveCooldown = 3.8;
              self.callbacks?.onSound?.('scythe');
              self.emitDamageText(this.x, this.y - 45, 'PEKELNÝ SEK! 😈', '#DC2626', true);
              if (dist <= 95) {
                if (typeof player.takeDamage === 'function') {
                  player.takeDamage(42, 'fire', this, true);
                } else {
                  player.hp = Math.max(0, player.hp - 42);
                }
              }
            }

            // Attack 2: Fire hazard drops
            this.fireTrailCooldown = (typeof this.fireTrailCooldown === 'number' ? this.fireTrailCooldown : 2.4) - bossCdDt;
            if (this.fireTrailCooldown <= 0) {
              this.fireTrailCooldown = 2.8;
              addEnemyHazard({
                id: `hazard_fire_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 28,
                duration: 3.5,
                maxDuration: 3.5,
                type: 'fire',
                slowFactor: 0.85,
                kind: 'fire-patch',
                damage: 18,
                sourceEnemyId: this.id,
              });
            }

            // Attack 3: Pekelná výheň (3-way hellfire spark volley + lunge)
            this.pitchforkVolleyCooldown = (typeof this.pitchforkVolleyCooldown === 'number' ? this.pitchforkVolleyCooldown : 3.4) - bossCdDt;
            this.hellDashTimer = Math.max(0, (this.hellDashTimer || 0) - dt);
            if (this.pitchforkVolleyCooldown <= 0) {
              this.pitchforkVolleyCooldown = 4.2;
              this.hellDashTimer = 0.65;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 215,
                  vy: Math.sin(ang) * 215,
                  angle: ang,
                  speed: 215,
                  dmg: 22,
                  radius: 10,
                  type: 'fire',
                  visual: 'fire_wreath',
                  color: '#EF4444',
                  life: 2.3,
                  maxLife: 2.3,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'PEKELNÁ JISKRA! 🔥',
                  dead: false,
                });
              }
              self.emitDamageText(this.x, this.y - 52, 'PEKELNÁ VÝHEŇ! 🔥😈', '#F97316', true);
            }
            const dashMult = this.hellDashTimer > 0 ? 1.85 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd * dashMult;
            this.vy = Math.sin(moveDir) * spd * dashMult;
          } else if (this.id === 'kralovska_polednice') {
            // Stage 7 Final Boss: Královská Polednice — 3 distinctive attacks
            const targetDist = 200;
            const orbitSpeed = (self.state.gameTime || 0) * 0.9;
            const targetX = player.x + Math.cos(orbitSpeed) * targetDist;
            const targetY = player.y + Math.sin(orbitSpeed) * targetDist;
            this.vx = (targetX - this.x) * 1.6;
            this.vy = (targetY - this.y) * 1.6;

            // Attack 1: Sluneční úžeh (Heat glare ring hazard)
            this.heatPulseCooldown = (typeof this.heatPulseCooldown === 'number' ? this.heatPulseCooldown : 3.2) - bossCdDt;
            if (this.heatPulseCooldown <= 0) {
              this.heatPulseCooldown = 4.0;
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 45, 'SLUNEČNÍ ÚŽEH! ☀️', '#F59E0B', true);
              addEnemyHazard({
                id: `hazard_heat_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 65,
                duration: 2.5,
                maxDuration: 2.5,
                type: 'fire',
                slowFactor: 0.75,
                kind: 'heat-ring',
                damage: 24,
                sourceEnemyId: this.id,
              });
            }

            // Attack 2: Žňové srpy (4 spinning golden harvesting sickles thrown in a wide arc)
            this.sickleCooldown = (typeof this.sickleCooldown === 'number' ? this.sickleCooldown : 2.4) - bossCdDt;
            if (this.sickleCooldown <= 0) {
              this.sickleCooldown = 3.4;
              const sickleCount = this.enraged ? 5 : 4;
              const spread = 0.26;
              for (let k = 0; k < sickleCount; k++) {
                const ang = dir + (k - (sickleCount - 1) / 2) * spread;
                const sSpd = 230;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * sSpd,
                  vy: Math.sin(ang) * sSpd,
                  angle: ang,
                  speed: sSpd,
                  dmg: 24,
                  radius: 12,
                  type: 'fire',
                  visual: 'solar_sickle',
                  color: '#FACC15',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 28,
                  statusText: 'ZLATÝ SRP! 🌾☀️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 54, 'ŽŇOVÉ SRPY! 🌾☀️', '#FDE047', true);
            }

            // Attack 3: Polední hromobit (Telegraphed summer storm lightning strikes)
            const hpRatio = (this.hp || 1) / (this.maxHp || 5500);
            this.lightningCooldown = (typeof this.lightningCooldown === 'number' ? this.lightningCooldown : 2.8) - bossCdDt;
            if (this.lightningCooldown <= 0) {
              this.lightningCooldown = hpRatio < 0.60 ? 2.6 : 3.6;
              const boltCount = hpRatio < 0.60 ? 2 : 1;
              self.callbacks?.onSound?.('bell');
              self.emitDamageText(player.x, player.y - 40, 'POLEDNÍ BLESK! ⚡☀️', '#FEF08A', true);
              for (let b = 0; b < boltCount; b++) {
                const bx = b === 0 ? player.x : player.x + (Math.random() - 0.5) * 110;
                const by = b === 0 ? player.y : player.y + (Math.random() - 0.5) * 110;
                addEnemyHazard({
                  id: `hazard_lightning_${Math.round(self.state.gameTime * 1000)}_${b}_${Math.random().toString(36).slice(2, 7)}`,
                  x: bx,
                  y: by,
                  radius: 40,
                  duration: 1.4,
                  maxDuration: 1.4,
                  type: 'fire',
                  slowFactor: 0.60,
                  kind: 'lightning-strike',
                  warningTimer: 0.8,
                  damage: 35,
                  oneShot: true,
                  exploded: false,
                  sourceEnemyId: this.id,
                });
              }
            }
          } else if (this.id === 'rusalka') {
            // Stage 8 Mini-Boss: Rusalka z hluboké tůně — siren water song, whirlpool pull & mist lunge
            this.waterSongCooldown = (typeof this.waterSongCooldown === 'number' ? this.waterSongCooldown : 3.0) - bossCdDt;
            if (this.waterSongCooldown <= 0) {
              this.waterSongCooldown = 3.6;
              self.callbacks?.onSound?.('splash');
              self.emitDamageText(this.x, this.y - 40, 'VÁBIVÁ PÍSEŇ! 🌊🎶', '#38BDF8', true);
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.26;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 235,
                  vy: Math.sin(ang) * 235,
                  angle: ang,
                  speed: 235,
                  dmg: 22,
                  radius: 13,
                  type: 'water',
                  visual: 'water_wave',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  soakPlayer: true,
                  slowPlayer: true,
                  statusText: 'VODNÍ PÍSEŇ! 🌊',
                  dead: false,
                });
              }
              addEnemyHazard({
                id: `hazard_rusalka_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 52,
                duration: 2.6,
                maxDuration: 2.6,
                type: 'mud',
                slowFactor: 0.62,
                kind: 'whirlpool',
                damage: 16,
                sourceEnemyId: this.id,
              });
            }
            // Attack 3: Mlžný ponor (Mist lunge + water jar trap)
            this.drownLungeCooldown = (typeof this.drownLungeCooldown === 'number' ? this.drownLungeCooldown : 3.8) - bossCdDt;
            this.rusalkaDashTimer = Math.max(0, (this.rusalkaDashTimer || 0) - dt);
            if (this.drownLungeCooldown <= 0) {
              this.drownLungeCooldown = 4.4;
              this.rusalkaDashTimer = 0.75;
              addEnemyHazard({
                id: `hazard_rusalka_jar_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 42,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'water-jar-trap',
                warningTimer: 0.85,
                damage: 20,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 48, 'MLŽNÝ PONOR! 🌫️💧', '#67E8F9', false);
            }
            const rushMult = this.rusalkaDashTimer > 0 ? 1.9 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd * rushMult;
            this.vy = Math.sin(moveDir) * spd * rushMult;
          } else if (this.id === 'ohnivy_sudlicka') {
            // Stage 8 Mid-Boss: Ohnivý sudlička z mezí — blazing polearm dash, ember fan & pitch fire circle
            this.sudliceDashCooldown = (typeof this.sudliceDashCooldown === 'number' ? this.sudliceDashCooldown : 3.2) - bossCdDt;
            this.sudliceDashTimer = Math.max(0, (this.sudliceDashTimer || 0) - dt);
            if (this.sudliceDashCooldown <= 0) {
              this.sudliceDashCooldown = 3.8;
              this.sudliceDashTimer = 0.65;
              this.sudliceDashAngle = dir;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 42, 'OHNIVÁ SUDLICE! 🔥🔱', '#F97316', true);
              addEnemyHazard({
                id: `hazard_sudlicka_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 44,
                duration: 3.0,
                maxDuration: 3.0,
                type: 'fire',
                slowFactor: 0.80,
                kind: 'fire-patch',
                damage: 20,
                sourceEnemyId: this.id,
              });
            }
            // Attack 3: Jiskřivý vějíř (3-way blazing wreath volley)
            this.emberFanCooldown = (typeof this.emberFanCooldown === 'number' ? this.emberFanCooldown : 2.6) - bossCdDt;
            if (this.emberFanCooldown <= 0) {
              this.emberFanCooldown = 3.6;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 20,
                  radius: 11,
                  type: 'fire',
                  visual: 'fire_wreath',
                  color: '#FB923C',
                  life: 2.3,
                  maxLife: 2.3,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'SMOLNÝ VĚNEC! 🔥',
                  dead: false,
                });
              }
            }
            const dashMult = this.sudliceDashTimer > 0 ? 2.15 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : (this.sudliceDashTimer > 0 && typeof this.sudliceDashAngle === 'number' ? this.sudliceDashAngle : dir);
            this.vx = Math.cos(moveDir) * spd * dashMult;
            this.vy = Math.sin(moveDir) * spd * dashMult;
          } else if (this.id === 'svatojansky_vladce') {
            // Stage 8 Final Boss: Svatojánský Vládce Hvozdu s Pokladem — 3 distinctive attacks
            const targetDist = 185;
            const orbitSpeed = (self.state.gameTime || 0) * 0.78;
            const targetX = player.x + Math.cos(orbitSpeed) * targetDist;
            const targetY = player.y + Math.sin(orbitSpeed) * targetDist;
            this.vx = (targetX - this.x) * 1.65;
            this.vy = (targetY - this.y) * 1.65;

            // Attack 1: Záře zlatého kapradí (Golden fern bloom ring hazard)
            this.treasurePulseCooldown = (typeof this.treasurePulseCooldown === 'number' ? this.treasurePulseCooldown : 3.2) - bossCdDt;
            if (this.treasurePulseCooldown <= 0) {
              this.treasurePulseCooldown = 3.8;
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 48, 'ZÁŘE ZLATÉHO KAPRADÍ! 🌿✨', '#FACC15', true);
              addEnemyHazard({
                id: `hazard_fern_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 68,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'fire',
                slowFactor: 0.72,
                kind: 'heat-ring',
                damage: 26,
                sourceEnemyId: this.id,
              });
            }

            // Attack 2: Květ kapradí a lesní šlahouny (5-way glowing Midsummer Fern Blossom fan + root snare trap)
            this.fernBarrageCooldown = (typeof this.fernBarrageCooldown === 'number' ? this.fernBarrageCooldown : 2.4) - bossCdDt;
            if (this.fernBarrageCooldown <= 0) {
              this.fernBarrageCooldown = 3.5;
              const blossomCount = 5;
              const spread = 0.24;
              for (let k = 0; k < blossomCount; k++) {
                const ang = dir + (k - (blossomCount - 1) / 2) * spread;
                const bSpd = 225;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * bSpd,
                  vy: Math.sin(ang) * bSpd,
                  angle: ang,
                  speed: bSpd,
                  dmg: 24,
                  radius: 11,
                  type: 'magic',
                  visual: 'fern_blossom',
                  color: '#FACC15',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 26,
                  statusText: 'KVĚT KAPRADÍ! 🌿✨',
                  dead: false,
                });
              }
              addEnemyHazard({
                id: `hazard_vladce_root_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 44,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'mud',
                slowFactor: 0.55,
                kind: 'root-snare',
                warningTimer: 0.85,
                damage: 22,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 58, 'KVĚT KAPRADÍ! 🌿✨', '#A3E635', true);
            }

            // Attack 3: Svatojánský blesk (Emerald-gold midsummer thunderbolts)
            const hpRatio = (this.hp || 1) / (this.maxHp || 6200);
            this.midsummerBoltCooldown = (typeof this.midsummerBoltCooldown === 'number' ? this.midsummerBoltCooldown : 2.8) - bossCdDt;
            if (this.midsummerBoltCooldown <= 0) {
              this.midsummerBoltCooldown = hpRatio < 0.65 ? 2.5 : 3.4;
              const boltCount = hpRatio < 0.65 ? 2 : 1;
              self.callbacks?.onSound?.('bell');
              self.emitDamageText(player.x, player.y - 40, 'SVATOJÁNSKÝ BLESK! ⚡🌿', '#A3E635', true);
              for (let b = 0; b < boltCount; b++) {
                const bx = b === 0 ? player.x : player.x + (Math.random() - 0.5) * 110;
                const by = b === 0 ? player.y : player.y + (Math.random() - 0.5) * 110;
                addEnemyHazard({
                  id: `hazard_svatojansky_${Math.round(self.state.gameTime * 1000)}_${b}_${Math.random().toString(36).slice(2, 7)}`,
                  x: bx,
                  y: by,
                  radius: 42,
                  duration: 1.5,
                  maxDuration: 1.5,
                  type: 'fire',
                  slowFactor: 0.62,
                  kind: 'lightning-strike',
                  warningTimer: 0.8,
                  damage: 34,
                  oneShot: true,
                  exploded: false,
                  sourceEnemyId: this.id,
                });
              }
            }
          } else if (this.id === 'polni_krecek') {
            // Stage 9 Regular: Polní křeček — scavenges loose coin/bread drops into cheek pouches (up to 3)
            if (!Array.isArray(this.cheekPouchDrops)) this.cheekPouchDrops = [];
            let targetDrop: any = null;
            if (this.cheekPouchDrops.length < 3 && self.state.drops && self.state.drops.length > 0) {
              let bestDist = 180;
              for (let di = 0; di < self.state.drops.length; di++) {
                const d = self.state.drops[di];
                if (!d || d.dead || (d.type !== 'coin' && d.type !== 'bread' && d.type !== 'gingerbread')) continue;
                const dDist = Math.hypot(d.x - this.x, d.y - this.y);
                if (dDist < bestDist) {
                  bestDist = dDist;
                  targetDrop = d;
                }
              }
            }
            if (targetDrop) {
              const dAng = Math.atan2(targetDrop.y - this.y, targetDrop.x - this.x);
              this.vx = Math.cos(dAng) * spd * 1.25;
              this.vy = Math.sin(dAng) * spd * 1.25;
              if (Math.hypot(targetDrop.x - this.x, targetDrop.y - this.y) <= this.radius + (targetDrop.radius || 12) + 8) {
                targetDrop.dead = true;
                this.cheekPouchDrops.push({ type: targetDrop.type, value: targetDrop.value || 1 });
                this.cheekPouchCount = this.cheekPouchDrops.length;
                this.poiseResist = Math.min(0.75, (this.poiseResist || 0.15) + 0.12);
                self.emitDamageText(this.x, this.y - 28, 'HAM! 🐹🌾', '#F59E0B', false);
              }
            } else {
              const moveDir = this.panicked ? dir + Math.PI : dir;
              this.vx = Math.cos(moveDir) * spd;
              this.vy = Math.sin(moveDir) * spd;
            }
          } else if (this.id === 'zitna_baba') {
            // Stage 9 Regular: Žitná bába (Srpanda) — throws spinning golden harvesting sickle
            this.sickleThrowCooldown = (typeof this.sickleThrowCooldown === 'number' ? this.sickleThrowCooldown : 2.6) - dt;
            if (this.sickleThrowCooldown <= 0 && dist < 340) {
              this.sickleThrowCooldown = 3.2;
              const sSpd = 215;
              self.state.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(dir) * sSpd,
                vy: Math.sin(dir) * sSpd,
                angle: dir,
                speed: sSpd,
                dmg: 18,
                radius: 11,
                type: 'physical',
                visual: 'solar_sickle',
                color: '#FACC15',
                life: 2.2,
                maxLife: 2.2,
                isEnemy: true,
                pushback: 22,
                statusText: 'SRP ŽITNÉ BÁBY! 🌾',
                dead: false,
              });
              self.callbacks?.onSound?.('slash');
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'kulovy_blesk') {
            // Stage 10 Regular: Kulový blesk — fast floating plasma sphere with erratic zig-zag oscillation & spark pulse
            this.zigPhase = (this.zigPhase || Math.random() * Math.PI * 2) + dt * 8.5;
            const zigOffset = Math.sin(this.zigPhase) * 0.65;
            const moveDir = (this.panicked ? dir + Math.PI : dir) + zigOffset;
            this.vx = Math.cos(moveDir) * spd * 1.15;
            this.vy = Math.sin(moveDir) * spd * 1.15;
            this.sparkPulseCooldown = (typeof this.sparkPulseCooldown === 'number' ? this.sparkPulseCooldown : 2.8) - dt;
            if (this.sparkPulseCooldown <= 0 && dist < 170) {
              this.sparkPulseCooldown = 3.4;
              self.emitDamageText(this.x, this.y - 30, 'VÝBOJ! ⚡', '#38BDF8', false);
              if (dist <= 95 && typeof player.takeDamage === 'function') {
                player.takeDamage(16, 'lightning', this, false);
              }
            }
          } else if (this.id === 'krecek_obilnik') {
            // Stage 9 Mini-Boss: Král polních křečků Obilník — burrow charge, grain barrage & hamster summon
            this.burrowDashCooldown = (typeof this.burrowDashCooldown === 'number' ? this.burrowDashCooldown : 3.2) - bossCdDt;
            this.burrowDashTimer = Math.max(0, (this.burrowDashTimer || 0) - dt);
            if (this.burrowDashCooldown <= 0) {
              this.burrowDashCooldown = 4.0;
              this.burrowDashTimer = 0.8;
              this.burrowDashAngle = dir;
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 42, 'KŘEČČÍ VÝPAD! 🐹🌾', '#D97706', true);
            }
            this.grainVolleyCooldown = (typeof this.grainVolleyCooldown === 'number' ? this.grainVolleyCooldown : 2.6) - bossCdDt;
            if (this.grainVolleyCooldown <= 0) {
              this.grainVolleyCooldown = 3.5;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.24;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 22,
                  radius: 10,
                  type: 'physical',
                  visual: 'pollen',
                  color: '#F59E0B',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'ZLATÉ ZRNO! 🌾',
                  dead: false,
                });
              }
              if ((self.livingEnemies?.length || 0) < 35) {
                const sAng = dir + (Math.random() - 0.5) * 1.2;
                self.spawnMonster('polni_krecek', this.x + Math.cos(sAng) * 75, this.y + Math.sin(sAng) * 75, 0.9);
              }
            }
            const dashMult = this.burrowDashTimer > 0 ? 1.95 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : (this.burrowDashTimer > 0 && typeof this.burrowDashAngle === 'number' ? this.burrowDashAngle : dir);
            this.vx = Math.cos(moveDir) * spd * dashMult;
            this.vy = Math.sin(moveDir) * spd * dashMult;
          } else if (this.id === 'zitna_matka') {
            // Stage 9 Mid-Boss: Žitná matka se zlatým srpem — 5-way sickle fan, chaff whirlwind & midday heat ring
            this.sickleFanCooldown = (typeof this.sickleFanCooldown === 'number' ? this.sickleFanCooldown : 2.6) - bossCdDt;
            if (this.sickleFanCooldown <= 0) {
              this.sickleFanCooldown = 3.6;
              for (let k = -2; k <= 2; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 230,
                  vy: Math.sin(ang) * 230,
                  angle: ang,
                  speed: 230,
                  dmg: 24,
                  radius: 12,
                  type: 'fire',
                  visual: 'solar_sickle',
                  color: '#FACC15',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 26,
                  statusText: 'ZLATÝ SRP MARKÉTY! 🌾☀️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 48, 'SRPOVÁ ŽEŇ! 🌾☀️', '#FACC15', true);
            }
            this.chaffWhirlCooldown = (typeof this.chaffWhirlCooldown === 'number' ? this.chaffWhirlCooldown : 3.4) - bossCdDt;
            if (this.chaffWhirlCooldown <= 0) {
              this.chaffWhirlCooldown = 4.2;
              addEnemyHazard({
                id: `hazard_zitna_matka_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 54,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'fire',
                slowFactor: 0.65,
                kind: 'heat-ring',
                warningTimer: 0.85,
                damage: 24,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 56, 'ÚPAL V ŽITĚ! ☀️🌾', '#F59E0B', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'hromotluk_marketa') {
            // Stage 9 Final Boss: Pouťový Hromotluk od sv. Markéty — 3 distinctive attacks
            // Attack 1: Střelecké terče (5-way salvo of painted fairground targets)
            this.targetSalvoCooldown = (typeof this.targetSalvoCooldown === 'number' ? this.targetSalvoCooldown : 2.5) - bossCdDt;
            if (this.targetSalvoCooldown <= 0) {
              this.targetSalvoCooldown = 3.4;
              const count = this.enraged ? 5 : 3;
              const spread = 0.25;
              for (let k = 0; k < count; k++) {
                const ang = dir + (k - (count - 1) / 2) * spread;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 235,
                  vy: Math.sin(ang) * 235,
                  angle: ang,
                  speed: 235,
                  dmg: 26,
                  radius: 13,
                  type: 'wood',
                  visual: 'log',
                  color: '#EF4444',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 32,
                  statusText: 'STŘELECKÝ TERČ! 🎯',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 54, 'SALVA ZE STŘELNICE! 🎯🎪', '#EF4444', true);
            }
            // Attack 2: Úder pouťovou palicí (Ground quake shockwave hazard)
            this.malletQuakeCooldown = (typeof this.malletQuakeCooldown === 'number' ? this.malletQuakeCooldown : 3.2) - bossCdDt;
            if (this.malletQuakeCooldown <= 0) {
              this.malletQuakeCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_marketa_quake_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 64,
                duration: 2.4,
                maxDuration: 2.4,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'ground-shockwave',
                warningTimer: 0.75,
                damage: 30,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.state.cameraTremorTimer = Math.max(self.state.cameraTremorTimer || 0, 0.35);
              self.callbacks?.onSound?.('bell');
              self.emitDamageText(this.x, this.y - 62, 'ZAZVOŇTE NA ZVONEC! 🔔🔨', '#FACC15', true);
            }
            // Attack 3: Pouťový trk s perníkovým srdcem (Bull-rush charge + summons zitna_baba)
            this.fairChargeCooldown = (typeof this.fairChargeCooldown === 'number' ? this.fairChargeCooldown : 3.8) - bossCdDt;
            this.fairChargeTimer = Math.max(0, (this.fairChargeTimer || 0) - dt);
            if (this.fairChargeCooldown <= 0) {
              this.fairChargeCooldown = 4.6;
              this.fairChargeTimer = 0.85;
              this.fairChargeAngle = dir;
              if ((self.livingEnemies?.length || 0) < 35) {
                const sAng = dir + Math.PI * 0.5;
                self.spawnMonster('zitna_baba', this.x + Math.cos(sAng) * 85, this.y + Math.sin(sAng) * 85, 1.0);
              }
              self.emitDamageText(this.x, this.y - 70, 'POUŤOVÝ NÁPOR! ❤️🎪', '#F43F5E', true);
            }
            const chargeMult = this.fairChargeTimer > 0 ? 2.05 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : (this.fairChargeTimer > 0 && typeof this.fairChargeAngle === 'number' ? this.fairChargeAngle : dir);
            this.vx = Math.cos(moveDir) * spd * chargeMult;
            this.vy = Math.sin(moveDir) * spd * chargeMult;
          } else if (this.id === 'bila_pani' && (this.isMiniboss || this.isBoss)) {
            // Stage 10 Mini-Boss: Bílá paní a rytířský zbrojnoš — spectral wail, phantom bolts & zbrojnoš summon
            this.wailCooldown = (typeof this.wailCooldown === 'number' ? this.wailCooldown : 3.0) - bossCdDt;
            if (this.wailCooldown <= 0) {
              this.wailCooldown = 3.8;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 225,
                  vy: Math.sin(ang) * 225,
                  angle: ang,
                  speed: 225,
                  dmg: 22,
                  radius: 11,
                  type: 'ice',
                  visual: 'wind_blade',
                  color: '#E0F2FE',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'PŘÍZRAČNÝ VZDECH! 👻',
                  dead: false,
                });
              }
              if (!this._summonedZbrojnos && (self.livingEnemies?.length || 0) < 40) {
                this._summonedZbrojnos = true;
                self.spawnMonster('zbrojnos', this.x + 70, this.y + 40, 1.25);
              }
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 44, 'KVÍLENÍ BÍLÉ PANÍ! 👻❄️', '#E0F2FE', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'bezhlavy_rytir') {
            // Stage 10 Mid-Boss: Bezhlavý rytíř ze Zlenic — stallion charge, severed head throw & watchtower curse hazard
            this.knightChargeCooldown = (typeof this.knightChargeCooldown === 'number' ? this.knightChargeCooldown : 3.0) - bossCdDt;
            this.knightChargeTimer = Math.max(0, (this.knightChargeTimer || 0) - dt);
            if (this.knightChargeCooldown <= 0) {
              this.knightChargeCooldown = 3.8;
              this.knightChargeTimer = 0.85;
              this.knightChargeAngle = dir;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 52, 'PŘÍZRAČNÝ TRYSK! 🗡️🐎', '#38BDF8', true);
            }
            this.headTossCooldown = (typeof this.headTossCooldown === 'number' ? this.headTossCooldown : 2.6) - bossCdDt;
            if (this.headTossCooldown <= 0) {
              this.headTossCooldown = 3.5;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.24;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 26,
                  radius: 12,
                  type: 'magic',
                  visual: 'witch_fireball',
                  color: '#38BDF8',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 30,
                  statusText: 'KLETBA HLÁSKY! 💀🗡️',
                  dead: false,
                });
              }
              addEnemyHazard({
                id: `hazard_rytir_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 48,
                duration: 2.5,
                maxDuration: 2.5,
                type: 'curse',
                slowFactor: 0.60,
                kind: 'hex-circle',
                warningTimer: 0.8,
                damage: 26,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
            }
            const knightMult = this.knightChargeTimer > 0 ? 2.15 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : (this.knightChargeTimer > 0 && typeof this.knightChargeAngle === 'number' ? this.knightChargeAngle : dir);
            this.vx = Math.cos(moveDir) * spd * knightMult;
            this.vy = Math.sin(moveDir) * spd * knightMult;
          } else if (this.id === 'drak') {
            // Stage 10 Final Boss: Tříhlavý líný Drak pod Melechovem — 3 distinctive elemental heads!
            // Head 1 (Fire): 5-way Dragon Fire Breath fan
            this.dragonFireCooldown = (typeof this.dragonFireCooldown === 'number' ? this.dragonFireCooldown : 2.4) - bossCdDt;
            if (this.dragonFireCooldown <= 0) {
              this.dragonFireCooldown = 3.4;
              for (let k = -2; k <= 2; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 28,
                  radius: 13,
                  type: 'fire',
                  visual: 'fire_wreath',
                  color: '#EF4444',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 30,
                  statusText: 'DRAČÍ PLAMEN! 🐉🔥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 60, 'PRVNÍ HLAVA: DRAČÍ OHEŇ! 🐉🔥', '#EF4444', true);
            }
            // Head 2 (Frost & Storm): Telegraphed St. Elias thunder-frost hazard zones
            this.dragonFrostCooldown = (typeof this.dragonFrostCooldown === 'number' ? this.dragonFrostCooldown : 3.2) - bossCdDt;
            if (this.dragonFrostCooldown <= 0) {
              this.dragonFrostCooldown = 4.0;
              for (let b = 0; b < 2; b++) {
                const bx = b === 0 ? player.x : player.x + (Math.random() - 0.5) * 120;
                const by = b === 0 ? player.y : player.y + (Math.random() - 0.5) * 120;
                addEnemyHazard({
                  id: `hazard_drak_storm_${Math.round(self.state.gameTime * 1000)}_${b}_${Math.random().toString(36).slice(2, 7)}`,
                  x: bx,
                  y: by,
                  radius: 52,
                  duration: 2.2,
                  maxDuration: 2.2,
                  type: 'frost',
                  slowFactor: 0.58,
                  kind: 'hail-circle',
                  warningTimer: 0.85,
                  damage: 32,
                  oneShot: true,
                  exploded: false,
                  sourceEnemyId: this.id,
                });
              }
              self.emitDamageText(this.x, this.y - 68, 'DRUHÁ HLAVA: LEDOVÁ SLUJ! 🐉❄️', '#38BDF8', true);
            }
            // Head 3 (Wing Gale & Charge): Wing-gust projectiles + lunging stomp
            this.dragonGaleCooldown = (typeof this.dragonGaleCooldown === 'number' ? this.dragonGaleCooldown : 3.8) - bossCdDt;
            this.dragonLungeTimer = Math.max(0, (this.dragonLungeTimer || 0) - dt);
            if (this.dragonGaleCooldown <= 0) {
              this.dragonGaleCooldown = 4.6;
              this.dragonLungeTimer = 0.8;
              this.dragonLungeAngle = dir;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.30;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 255,
                  vy: Math.sin(ang) * 255,
                  angle: ang,
                  speed: 255,
                  dmg: 26,
                  radius: 14,
                  type: 'physical',
                  visual: 'wind_blade',
                  color: '#A3E635',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 45,
                  statusText: 'VICHR KŘÍDEL! 🐉💨',
                  dead: false,
                });
              }
              self.emitDamageText(this.x, this.y - 76, 'TŘETÍ HLAVA: VICHR KŘÍDEL! 🐉🌪️', '#A3E635', true);
            }
            const drakMult = this.dragonLungeTimer > 0 ? 1.85 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : (this.dragonLungeTimer > 0 && typeof this.dragonLungeAngle === 'number' ? this.dragonLungeAngle : dir);
            this.vx = Math.cos(moveDir) * spd * drakMult;
            this.vy = Math.sin(moveDir) * spd * drakMult;
          } else if (this.id === 'kralovsky_cmelak') {
            // Stage 11 Mini-Boss: Královský čmelák — buzzing dive attack and stinging pollen cloud
            this.cmelakDiveCooldown = (typeof this.cmelakDiveCooldown === 'number' ? this.cmelakDiveCooldown : 2.8) - bossCdDt;
            this.cmelakDiveTimer = Math.max(0, (this.cmelakDiveTimer || 0) - dt);
            if (this.cmelakDiveCooldown <= 0) {
              this.cmelakDiveCooldown = 3.6;
              this.cmelakDiveTimer = 0.85;
              this.cmelakDiveAngle = dir;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 48, 'ŽIHADLOVÝ NÁLET! 🐝💨', '#FBBF24', true);
            }
            this.cmelakPollenCooldown = (typeof this.cmelakPollenCooldown === 'number' ? this.cmelakPollenCooldown : 3.5) - bossCdDt;
            if (this.cmelakPollenCooldown <= 0) {
              this.cmelakPollenCooldown = 4.2;
              addEnemyHazard({
                id: `hazard_cmelak_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 54,
                duration: 3.0,
                maxDuration: 3.0,
                type: 'curse',
                slowFactor: 0.65,
                kind: 'mud-patch',
                warningTimer: 0.2,
                damage: 22,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 44, 'PYLOVÝ ROJ! 🐝🌾', '#FACC15', true);
            }
            const cmelakMult = this.cmelakDiveTimer > 0 ? 2.1 : 1.0;
            const cmelakDir = this.panicked ? dir + Math.PI : (this.cmelakDiveTimer > 0 && typeof this.cmelakDiveAngle === 'number' ? this.cmelakDiveAngle : dir + Math.sin((self.state.gameTime || 0) * 4) * 0.25);
            this.vx = Math.cos(cmelakDir) * spd * cmelakMult;
            this.vy = Math.sin(cmelakDir) * spd * cmelakMult;
          } else if (this.id === 'zlatohlavek_zrout') {
            // Stage 11 Mid-Boss: Zlatohlávek žrout — gluttonous rolling charge & rotten fruit splat
            this.zroutChargeCooldown = (typeof this.zroutChargeCooldown === 'number' ? this.zroutChargeCooldown : 3.2) - bossCdDt;
            this.zroutChargeTimer = Math.max(0, (this.zroutChargeTimer || 0) - dt);
            if (this.zroutChargeCooldown <= 0) {
              this.zroutChargeCooldown = 4.0;
              this.zroutChargeTimer = 0.9;
              this.zroutChargeAngle = dir;
              self.callbacks?.onSound?.('explosion');
              self.emitDamageText(this.x, this.y - 52, 'NENAŽRANÝ ROZBĚH! 🪲💥', '#22C55E', true);
            }
            this.zroutSplatCooldown = (typeof this.zroutSplatCooldown === 'number' ? this.zroutSplatCooldown : 2.6) - bossCdDt;
            if (this.zroutSplatCooldown <= 0) {
              this.zroutSplatCooldown = 3.4;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.26;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 230,
                  vy: Math.sin(ang) * 230,
                  angle: ang,
                  speed: 230,
                  dmg: 25,
                  radius: 12,
                  type: 'physical',
                  visual: 'witch_fireball',
                  color: '#84CC16',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'OVOCNÁ BŘEČKA! 🍏💥',
                  dead: false,
                });
              }
              self.emitDamageText(this.x, this.y - 48, 'HNILOBNÝ PLIVANEC! 🪲🍏', '#84CC16', true);
            }
            const zroutMult = this.zroutChargeTimer > 0 ? 1.9 : 1.0;
            const zroutDir = this.panicked ? dir + Math.PI : (this.zroutChargeTimer > 0 && typeof this.zroutChargeAngle === 'number' ? this.zroutChargeAngle : dir);
            this.vx = Math.cos(zroutDir) * spd * zroutMult;
            this.vy = Math.sin(zroutDir) * spd * zroutMult;
          } else if (this.id === 'dozinkovy_chasnik') {
            // Stage 11 Final Boss: Dožínkový chasník — spinning harvest wreaths, threshing flail shockwave, whirlwind dance
            this.chasnikWreathCooldown = (typeof this.chasnikWreathCooldown === 'number' ? this.chasnikWreathCooldown : 2.5) - bossCdDt;
            if (this.chasnikWreathCooldown <= 0) {
              this.chasnikWreathCooldown = 3.6;
              for (let k = 0; k < 4; k++) {
                const ang = dir + (k * Math.PI) / 2;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 30,
                  radius: 15,
                  type: 'physical',
                  visual: 'fire_wreath',
                  color: '#F59E0B',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 40,
                  statusText: 'DOŽÍNKOVÝ VĚNEC! 🌾👑',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 65, 'ROZTOČENÝ DOŽÍNKOVÝ VĚNEC! 🌾👑', '#F59E0B', true, 'bossAnnouncements');
            }
            this.chasnikFlailCooldown = (typeof this.chasnikFlailCooldown === 'number' ? this.chasnikFlailCooldown : 3.8) - bossCdDt;
            if (this.chasnikFlailCooldown <= 0) {
              this.chasnikFlailCooldown = 4.5;
              addEnemyHazard({
                id: `hazard_chasnik_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 68,
                duration: 2.4,
                maxDuration: 2.4,
                type: 'physical',
                slowFactor: 0.60,
                kind: 'hail-circle',
                warningTimer: 0.9,
                damage: 34,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('explosion');
              self.emitDamageText(this.x, this.y - 70, 'ÚDĚR MLÁTÍCÍHO CEPU! 🌾💥', '#DC2626', true);
            }
            this.chasnikSprintTimer = Math.max(0, (this.chasnikSprintTimer || 0) - dt);
            this.chasnikSprintCooldown = (typeof this.chasnikSprintCooldown === 'number' ? this.chasnikSprintCooldown : 4.2) - bossCdDt;
            if (this.chasnikSprintCooldown <= 0) {
              this.chasnikSprintCooldown = 5.2;
              this.chasnikSprintTimer = 1.0;
              this.chasnikSprintAngle = dir;
              self.emitDamageText(this.x, this.y - 50, 'DOŽÍNKOVÝ DUPÁK! 🌾💨', '#FBBF24', true);
            }
            const chasnikMult = this.chasnikSprintTimer > 0 ? 1.85 : 1.0;
            const chasnikDir = this.panicked ? dir + Math.PI : (this.chasnikSprintTimer > 0 && typeof this.chasnikSprintAngle === 'number' ? this.chasnikSprintAngle : dir);
            this.vx = Math.cos(chasnikDir) * spd * chasnikMult;
            this.vy = Math.sin(chasnikDir) * spd * chasnikMult;
          } else if (this.id === 'netopyr_usatec') {
            // Stage 12 Mini-Boss: Netopýr ušatec — ultrasonic screech cone and swift swoop
            this.screechCooldown = (typeof this.screechCooldown === 'number' ? this.screechCooldown : 2.6) - bossCdDt;
            this.batSwoopTimer = Math.max(0, (this.batSwoopTimer || 0) - dt);
            if (this.screechCooldown <= 0) {
              this.screechCooldown = 3.5;
              this.batSwoopTimer = 0.8;
              this.batSwoopAngle = dir;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.28;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 260,
                  vy: Math.sin(ang) * 260,
                  angle: ang,
                  speed: 260,
                  dmg: 24,
                  radius: 12,
                  type: 'magic',
                  visual: 'wind_blade',
                  color: '#C084FC',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'ULTRAZVUKOVÝ PÍSKOT! 🦇🔊',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 45, 'ULTRAZVUKOVÝ PÍSKOT! 🦇🔊', '#C084FC', true);
            }
            const batMult = this.batSwoopTimer > 0 ? 2.0 : 1.0;
            const batDir = this.panicked ? dir + Math.PI : (this.batSwoopTimer > 0 && typeof this.batSwoopAngle === 'number' ? this.batSwoopAngle : dir + Math.sin((self.state.gameTime || 0) * 5) * 0.3);
            this.vx = Math.cos(batDir) * spd * batMult;
            this.vy = Math.sin(batDir) * spd * batMult;
          } else if (this.id === 'nocni_mura' && (this.isMiniboss || this.isBoss)) {
            // Stage 12 Mid-Boss: Noční můra — sleep powder hazard and shadowy nightmare flutter
            this.muraDustCooldown = (typeof this.muraDustCooldown === 'number' ? this.muraDustCooldown : 3.0) - bossCdDt;
            if (this.muraDustCooldown <= 0) {
              this.muraDustCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_mura_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 60,
                duration: 3.2,
                maxDuration: 3.2,
                type: 'curse',
                slowFactor: 0.55,
                kind: 'mud-patch',
                warningTimer: 0.2,
                damage: 26,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 48, 'MŮŘÍ PRÁŠEK SPÁNKU! 🦋🌙', '#A855F7', true);
            }
            this.muraBoltCooldown = (typeof this.muraBoltCooldown === 'number' ? this.muraBoltCooldown : 2.4) - bossCdDt;
            if (this.muraBoltCooldown <= 0) {
              this.muraBoltCooldown = 3.2;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.24;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 235,
                  vy: Math.sin(ang) * 235,
                  angle: ang,
                  speed: 235,
                  dmg: 25,
                  radius: 13,
                  type: 'magic',
                  visual: 'witch_fireball',
                  color: '#9333EA',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 30,
                  statusText: 'TEMNÝ PŘÍZRAK! 🦋🔮',
                  dead: false,
                });
              }
            }
            const muraDir = this.panicked ? dir + Math.PI : dir + Math.cos((self.state.gameTime || 0) * 3) * 0.35;
            this.vx = Math.cos(muraDir) * spd;
            this.vy = Math.sin(muraDir) * spd;
          } else if (this.id === 'vyr_velky') {
            // Stage 12 Final Boss: Výr velký — owl feather vortices, razor talon dive, piercing hoot
            this.vyrVortexCooldown = (typeof this.vyrVortexCooldown === 'number' ? this.vyrVortexCooldown : 2.4) - bossCdDt;
            if (this.vyrVortexCooldown <= 0) {
              this.vyrVortexCooldown = 3.6;
              for (let k = -1; k <= 1; k += 2) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 250,
                  vy: Math.sin(ang) * 250,
                  angle: ang,
                  speed: 250,
                  dmg: 30,
                  radius: 15,
                  type: 'physical',
                  visual: 'wind_blade',
                  color: '#F59E0B',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 45,
                  statusText: 'PERNÝ VÍR KŘÍDEL! 🦉🌪️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 65, 'PERNÝ VÍR KŘÍDEL! 🦉🌪️', '#F59E0B', true, 'bossAnnouncements');
            }
            this.vyrHootCooldown = (typeof this.vyrHootCooldown === 'number' ? this.vyrHootCooldown : 3.6) - bossCdDt;
            if (this.vyrHootCooldown <= 0) {
              this.vyrHootCooldown = 4.4;
              addEnemyHazard({
                id: `hazard_vyr_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 70,
                duration: 2.4,
                maxDuration: 2.4,
                type: 'curse',
                slowFactor: 0.55,
                kind: 'hail-circle',
                warningTimer: 0.85,
                damage: 32,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 70, 'PRUDKÉ HOUKÁNÍ VÝRA! 🦉🔊', '#D97706', true);
            }
            this.vyrSwoopTimer = Math.max(0, (this.vyrSwoopTimer || 0) - dt);
            this.vyrSwoopCooldown = (typeof this.vyrSwoopCooldown === 'number' ? this.vyrSwoopCooldown : 4.0) - bossCdDt;
            if (this.vyrSwoopCooldown <= 0) {
              this.vyrSwoopCooldown = 5.0;
              this.vyrSwoopTimer = 0.95;
              this.vyrSwoopAngle = dir;
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 55, 'DRAVÝ DRÁPOVÝ NÁLET! 🦉⚡', '#EF4444', true);
            }
            const vyrMult = this.vyrSwoopTimer > 0 ? 2.1 : 1.0;
            const vyrDir = this.panicked ? dir + Math.PI : (this.vyrSwoopTimer > 0 && typeof this.vyrSwoopAngle === 'number' ? this.vyrSwoopAngle : dir);
            this.vx = Math.cos(vyrDir) * spd * vyrMult;
            this.vy = Math.sin(vyrDir) * spd * vyrMult;
          } else if (this.id === 'kralovsky_srsen') {
            // Stage 13 Mini-Boss: Královský sršeň ze sadu — rapid stinger dive & sticky plum-nectar puddle
            this.srsenDiveCooldown = (typeof this.srsenDiveCooldown === 'number' ? this.srsenDiveCooldown : 2.5) - bossCdDt;
            this.srsenDiveTimer = Math.max(0, (this.srsenDiveTimer || 0) - dt);
            if (this.srsenDiveCooldown <= 0) {
              this.srsenDiveCooldown = 3.4;
              this.srsenDiveTimer = 0.85;
              this.srsenDiveAngle = dir;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 48, 'SRŠNÍ NÁLET ZE SADU! 🐝🍑', '#F59E0B', true);
            }
            this.srsenPlumCooldown = (typeof this.srsenPlumCooldown === 'number' ? this.srsenPlumCooldown : 3.2) - bossCdDt;
            if (this.srsenPlumCooldown <= 0) {
              this.srsenPlumCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_srsen_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 56,
                duration: 3.2,
                maxDuration: 3.2,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'mud-patch',
                warningTimer: 0.2,
                damage: 25,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 44, 'LEPKAVÁ ŠVESTKOVÁ ŠŤÁVA! 🍑💧', '#9333EA', true);
            }
            const srsenMult = this.srsenDiveTimer > 0 ? 2.15 : 1.0;
            const srsenDir = this.panicked ? dir + Math.PI : (this.srsenDiveTimer > 0 && typeof this.srsenDiveAngle === 'number' ? this.srsenDiveAngle : dir + Math.sin((self.state.gameTime || 0) * 5) * 0.28);
            this.vx = Math.cos(srsenDir) * spd * srsenMult;
            this.vy = Math.sin(srsenDir) * spd * srsenMult;
          } else if (this.id === 'povidlovy_cert') {
            // Stage 13 Mid-Boss: Povidlový čert s měchačkou — boiling plum-butter splash & stirrer slam
            this.povidlaSplashCooldown = (typeof this.povidlaSplashCooldown === 'number' ? this.povidlaSplashCooldown : 2.6) - bossCdDt;
            if (this.povidlaSplashCooldown <= 0) {
              this.povidlaSplashCooldown = 3.5;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.26;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 28,
                  radius: 13,
                  type: 'fire',
                  visual: 'witch_fireball',
                  color: '#6B21A8',
                  life: 2.3,
                  maxLife: 2.3,
                  isEnemy: true,
                  pushback: 38,
                  statusText: 'VŘOUCÍ POVIDLA! 🍑🔥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('explosion');
              self.emitDamageText(this.x, this.y - 50, 'CÁKANEC HORKÝCH POVIDEL! 🍑🔥', '#A855F7', true);
            }
            this.mechackaSlamCooldown = (typeof this.mechackaSlamCooldown === 'number' ? this.mechackaSlamCooldown : 3.6) - bossCdDt;
            this.mechackaRushTimer = Math.max(0, (this.mechackaRushTimer || 0) - dt);
            if (this.mechackaSlamCooldown <= 0) {
              this.mechackaSlamCooldown = 4.4;
              this.mechackaRushTimer = 0.9;
              this.mechackaRushAngle = dir;
              addEnemyHazard({
                id: `hazard_povidla_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 64,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'mud',
                slowFactor: 0.55,
                kind: 'ground-shockwave',
                warningTimer: 0.75,
                damage: 30,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 56, 'PRÁSKNUTÍ MĚCHAČKOU! 🥄💥', '#D97706', true);
            }
            const certMult = this.mechackaRushTimer > 0 ? 1.9 : 1.0;
            const certDir = this.panicked ? dir + Math.PI : (this.mechackaRushTimer > 0 && typeof this.mechackaRushAngle === 'number' ? this.mechackaRushAngle : dir);
            this.vx = Math.cos(certDir) * spd * certMult;
            this.vy = Math.sin(certDir) * spd * certMult;
          } else if (this.id === 'posvicensky_hospodar') {
            // Stage 13 Final Boss: Posvícenský Hospodář — spinning feast koláče, jug smash wave, posvícenský dupák
            this.kolacVolleyCooldown = (typeof this.kolacVolleyCooldown === 'number' ? this.kolacVolleyCooldown : 2.4) - bossCdDt;
            if (this.kolacVolleyCooldown <= 0) {
              this.kolacVolleyCooldown = 3.5;
              for (let k = 0; k < 4; k++) {
                const ang = dir + (k * Math.PI) / 2;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 245,
                  vy: Math.sin(ang) * 245,
                  angle: ang,
                  speed: 245,
                  dmg: 32,
                  radius: 15,
                  type: 'physical',
                  visual: 'fire_wreath',
                  color: '#D97706',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 42,
                  statusText: 'POSVÍCENSKÝ KOLÁČ! 🥧👑',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 65, 'HOD POSVÍCENSKÝMI KOLÁČI! 🥧👑', '#F59E0B', true, 'bossAnnouncements');
            }
            this.hospodarSlamCooldown = (typeof this.hospodarSlamCooldown === 'number' ? this.hospodarSlamCooldown : 3.8) - bossCdDt;
            if (this.hospodarSlamCooldown <= 0) {
              this.hospodarSlamCooldown = 4.5;
              addEnemyHazard({
                id: `hazard_hospodar_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 70,
                duration: 2.5,
                maxDuration: 2.5,
                type: 'mud',
                slowFactor: 0.55,
                kind: 'ground-shockwave',
                warningTimer: 0.85,
                damage: 35,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('explosion');
              self.emitDamageText(this.x, this.y - 70, 'POSVÍCENSKÉ DUPNUTÍ DŽBÁNEM! 🍺💥', '#DC2626', true);
            }
            this.hospodarSprintTimer = Math.max(0, (this.hospodarSprintTimer || 0) - dt);
            this.hospodarSprintCooldown = (typeof this.hospodarSprintCooldown === 'number' ? this.hospodarSprintCooldown : 4.2) - bossCdDt;
            if (this.hospodarSprintCooldown <= 0) {
              this.hospodarSprintCooldown = 5.2;
              this.hospodarSprintTimer = 1.0;
              this.hospodarSprintAngle = dir;
              self.emitDamageText(this.x, this.y - 50, 'POSVÍCENSKÁ TANCOVAČKA! 🎻💨', '#FBBF24', true);
            }
            const hospMult = this.hospodarSprintTimer > 0 ? 1.88 : 1.0;
            const hospDir = this.panicked ? dir + Math.PI : (this.hospodarSprintTimer > 0 && typeof this.hospodarSprintAngle === 'number' ? this.hospodarSprintAngle : dir);
            this.vx = Math.cos(hospDir) * spd * hospMult;
            this.vy = Math.sin(hospDir) * spd * hospMult;
          } else if (this.id === 'kvilici_meluzina') {
            // Stage 14 Final Boss: Kvílící Meluzína — wailing wind blades, misty vortex hazard, spectral gale rush
            this.meluzinaBladeCooldown = (typeof this.meluzinaBladeCooldown === 'number' ? this.meluzinaBladeCooldown : 2.3) - bossCdDt;
            if (this.meluzinaBladeCooldown <= 0) {
              this.meluzinaBladeCooldown = 3.4;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 260,
                  vy: Math.sin(ang) * 260,
                  angle: ang,
                  speed: 260,
                  dmg: 33,
                  radius: 15,
                  type: 'magic',
                  visual: 'wind_blade',
                  color: '#38BDF8',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 48,
                  statusText: 'KVÍLIVÝ VICHR MELUZÍNY! 🌪️❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 65, 'KVÍLENÍ V KOMÍNĚ! VĚTRNÁ SMRŠŤ! 🌪️👻', '#38BDF8', true, 'bossAnnouncements');
            }
            this.meluzinaVortexCooldown = (typeof this.meluzinaVortexCooldown === 'number' ? this.meluzinaVortexCooldown : 3.6) - bossCdDt;
            if (this.meluzinaVortexCooldown <= 0) {
              this.meluzinaVortexCooldown = 4.4;
              addEnemyHazard({
                id: `hazard_meluzina_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 72,
                duration: 2.6,
                maxDuration: 2.6,
                type: 'curse',
                slowFactor: 0.52,
                kind: 'crow-vortex',
                warningTimer: 0.85,
                damage: 34,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('howl');
              self.emitDamageText(this.x, this.y - 70, 'MLŽNÝ VÍR SVATOVÁCLAVSKÉ NOCI! 🌫️🌪️', '#7DD3FC', true);
            }
            this.meluzinaGustTimer = Math.max(0, (this.meluzinaGustTimer || 0) - dt);
            this.meluzinaGustCooldown = (typeof this.meluzinaGustCooldown === 'number' ? this.meluzinaGustCooldown : 4.0) - bossCdDt;
            if (this.meluzinaGustCooldown <= 0) {
              this.meluzinaGustCooldown = 5.0;
              this.meluzinaGustTimer = 0.95;
              this.meluzinaGustAngle = dir;
              self.emitDamageText(this.x, this.y - 55, 'PORYV KVÍLÍCÍ MELUZÍNY! 💨👻', '#BAE6FD', true);
            }
            const melMult = this.meluzinaGustTimer > 0 ? 2.1 : 1.0;
            const melDir = this.panicked ? dir + Math.PI : (this.meluzinaGustTimer > 0 && typeof this.meluzinaGustAngle === 'number' ? this.meluzinaGustAngle : dir);
            this.vx = Math.cos(melDir) * spd * melMult;
            this.vy = Math.sin(melDir) * spd * melMult;
          } else if (this.id === 'kralovsky_havran') {
            // Stage 15 Miniboss: Královský havran — dark feather volley, dive swoop poryv
            this.havranFeatherCooldown = (typeof this.havranFeatherCooldown === 'number' ? this.havranFeatherCooldown : 2.5) - bossCdDt;
            if (this.havranFeatherCooldown <= 0) {
              this.havranFeatherCooldown = 3.6;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 270,
                  vy: Math.sin(ang) * 270,
                  angle: ang,
                  speed: 270,
                  dmg: 28,
                  radius: 12,
                  type: 'magic',
                  visual: 'crow_feather',
                  color: '#334155',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'ČERNÉ BRKO KRÁLOVSKÉHO HAVRANA! 🦅🖤',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 65, 'ČERNÁ HAVRANÍ PERA! 🦅🖤', '#94A3B8', true);
            }
            this.havranDiveTimer = Math.max(0, (this.havranDiveTimer || 0) - dt);
            this.havranDiveCooldown = (typeof this.havranDiveCooldown === 'number' ? this.havranDiveCooldown : 3.8) - bossCdDt;
            if (this.havranDiveCooldown <= 0) {
              this.havranDiveCooldown = 4.8;
              this.havranDiveTimer = 0.85;
              this.havranDiveAngle = dir;
              self.callbacks?.onSound?.('howl');
              self.emitDamageText(this.x, this.y - 55, 'STŘEMHLAVÝ PORYV HAVRANA! 🦅💨', '#CBD5E1', true);
            }
            const havMult = this.havranDiveTimer > 0 ? 2.2 : 1.0;
            const havDir = this.panicked ? dir + Math.PI : (this.havranDiveTimer > 0 && typeof this.havranDiveAngle === 'number' ? this.havranDiveAngle : dir);
            this.vx = Math.cos(havDir) * spd * havMult;
            this.vy = Math.sin(havDir) * spd * havMult;
          } else if (this.id === 'hastrman_podzimni') {
            // Stage 15 Midboss: Hastrman podzimní — mud ball barrage, autumn whirlpool trap
            this.hastrmanMudCooldown = (typeof this.hastrmanMudCooldown === 'number' ? this.hastrmanMudCooldown : 2.8) - bossCdDt;
            if (this.hastrmanMudCooldown <= 0 && dist < 360) {
              this.hastrmanMudCooldown = 3.8;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.28;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 30,
                  radius: 14,
                  type: 'poison',
                  visual: 'mud_ball',
                  color: '#15803D',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 40,
                  statusText: 'KALNÉ BLÁTO Z POTOKA! 🐸💧',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('splash');
              self.emitDamageText(this.x, this.y - 65, 'LEKNÍNOVÉ KALNÉ KLUBKO! 🐸💧', '#10B981', true);
            }
            this.hastrmanWhirlCooldown = (typeof this.hastrmanWhirlCooldown === 'number' ? this.hastrmanWhirlCooldown : 4.0) - bossCdDt;
            if (this.hastrmanWhirlCooldown <= 0) {
              this.hastrmanWhirlCooldown = 5.2;
              addEnemyHazard({
                id: `hazard_hastrman_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 68,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'mud',
                slowFactor: 0.50,
                kind: 'mud-patch',
                warningTimer: 0.8,
                damage: 32,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 70, 'BLÁTIVÝ PODZIMNÍ VÍR! 🐸🌀', '#059669', true);
            }
            this.vx = Math.cos(dir) * spd;
            this.vy = Math.sin(dir) * spd;
          } else if (this.id === 'drak_vetrnik') {
            // Stage 15 Final Boss: Drak Větrník — 5-way paper ribbon streamers, drakiáda whirlwind, storm swoop
            this.drakStreamerCooldown = (typeof this.drakStreamerCooldown === 'number' ? this.drakStreamerCooldown : 2.2) - bossCdDt;
            if (this.drakStreamerCooldown <= 0) {
              this.drakStreamerCooldown = 3.2;
              for (let k = -2; k <= 2; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 280,
                  vy: Math.sin(ang) * 280,
                  angle: ang,
                  speed: 280,
                  dmg: 34,
                  radius: 14,
                  type: 'magic',
                  visual: 'wind_blade',
                  color: '#F97316',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 45,
                  statusText: 'PAPÍROVÁ PENTLE VĚTRNÍKA! 🪁🍂',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 75, 'PENTLOVÁ SALVA VĚTRNÍKA! 🪁💨', '#F97316', true, 'bossAnnouncements');
            }
            this.drakWhirlCooldown = (typeof this.drakWhirlCooldown === 'number' ? this.drakWhirlCooldown : 3.8) - bossCdDt;
            if (this.drakWhirlCooldown <= 0) {
              this.drakWhirlCooldown = 4.6;
              addEnemyHazard({
                id: `hazard_drak_vetrnik_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 80,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'curse',
                slowFactor: 0.50,
                kind: 'crow-vortex',
                warningTimer: 0.85,
                damage: 38,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('howl');
              self.emitDamageText(this.x, this.y - 70, 'DRAKIÁDOVÝ ORKÁN ZE STRNIŠTĚ! 🌪️🪁', '#FB923C', true);
            }
            this.drakSwoopTimer = Math.max(0, (this.drakSwoopTimer || 0) - dt);
            this.drakSwoopCooldown = (typeof this.drakSwoopCooldown === 'number' ? this.drakSwoopCooldown : 4.2) - bossCdDt;
            if (this.drakSwoopCooldown <= 0) {
              this.drakSwoopCooldown = 5.2;
              this.drakSwoopTimer = 1.0;
              this.drakSwoopAngle = dir;
              self.emitDamageText(this.x, this.y - 60, 'PORYV ŘÍJNOVÉHO VICHRU! 💨🪁', '#FDBA74', true);
            }
            const drakMult = this.drakSwoopTimer > 0 ? 2.15 : 1.0;
            const drakDir = this.panicked ? dir + Math.PI : (this.drakSwoopTimer > 0 && typeof this.drakSwoopAngle === 'number' ? this.drakSwoopAngle : dir);
            this.vx = Math.cos(drakDir) * spd * drakMult;
            this.vy = Math.sin(drakDir) * spd * drakMult;
          } else if (this.id === 'dusickova_bludicka') {
            // Stage 16 Miniboss: Dušičková bludička — will-o'-wisp soul orbs, spectral flicker dash
            this.bludickaOrbCooldown = (typeof this.bludickaOrbCooldown === 'number' ? this.bludickaOrbCooldown : 2.4) - bossCdDt;
            if (this.bludickaOrbCooldown <= 0) {
              this.bludickaOrbCooldown = 3.4;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 230,
                  vy: Math.sin(ang) * 230,
                  angle: ang,
                  speed: 230,
                  dmg: 26,
                  radius: 12,
                  type: 'magic',
                  visual: 'will_o_wisp',
                  color: '#38BDF8',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 32,
                  statusText: 'DUŠIČKOVÝ PLAMÍNEK! 🕯️✨',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 60, 'SVĚTÉLKA Z RYBNÍKA! 🕯️✨', '#7DD3FC', true);
            }
            this.bludickaFlickerTimer = Math.max(0, (this.bludickaFlickerTimer || 0) - dt);
            this.bludickaFlickerCooldown = (typeof this.bludickaFlickerCooldown === 'number' ? this.bludickaFlickerCooldown : 3.6) - bossCdDt;
            if (this.bludickaFlickerCooldown <= 0) {
              this.bludickaFlickerCooldown = 4.5;
              this.bludickaFlickerTimer = 0.75;
              this.bludickaFlickerAngle = dir;
              self.emitDamageText(this.x, this.y - 50, 'BLUDIČKOVÝ PŘEZÁŘIVÝ TŘPYT! 🕯️💨', '#BAE6FD', true);
            }
            const bMult = this.bludickaFlickerTimer > 0 ? 2.0 : 1.0;
            const bDir = this.panicked ? dir + Math.PI : (this.bludickaFlickerTimer > 0 && typeof this.bludickaFlickerAngle === 'number' ? this.bludickaFlickerAngle : dir);
            this.vx = Math.cos(bDir) * spd * bMult;
            this.vy = Math.sin(bDir) * spd * bMult;
          } else if (this.id === 'cert_rybnikar') {
            // Stage 16 Midboss: Čert rybníkář — fire coals, tangled fishnet hazard trap
            this.certCoalCooldown = (typeof this.certCoalCooldown === 'number' ? this.certCoalCooldown : 2.6) - bossCdDt;
            if (this.certCoalCooldown <= 0 && dist < 360) {
              this.certCoalCooldown = 3.6;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.26;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 32,
                  radius: 13,
                  type: 'fire',
                  visual: 'coal',
                  color: '#EF4444',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 40,
                  statusText: 'ŽHAVÝ UHLÍK Z PEKLA! 🐟🔥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('explosion');
              self.emitDamageText(this.x, this.y - 65, 'PEKELNÝ ŽHAVÝ UHLÍK! 🐟🔥', '#EF4444', true);
            }
            this.certNetCooldown = (typeof this.certNetCooldown === 'number' ? this.certNetCooldown : 3.8) - bossCdDt;
            if (this.certNetCooldown <= 0) {
              this.certNetCooldown = 4.8;
              addEnemyHazard({
                id: `hazard_cert_rybnikar_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 70,
                duration: 2.6,
                maxDuration: 2.6,
                type: 'mud',
                slowFactor: 0.45,
                kind: 'mud-patch',
                warningTimer: 0.85,
                damage: 32,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 70, 'ZATÁHNUTÍ SÍTĚ PODBĚRÁKEM! 🕸️🐟', '#F87171', true);
            }
            this.vx = Math.cos(dir) * spd;
            this.vy = Math.sin(dir) * spd;
          } else if (this.id === 'vele_stika') {
            // Stage 16 Final Boss: Veleštika — water splash wave, lightning surge charge, whirlpool trap
            this.stikaWaveCooldown = (typeof this.stikaWaveCooldown === 'number' ? this.stikaWaveCooldown : 2.2) - bossCdDt;
            if (this.stikaWaveCooldown <= 0) {
              this.stikaWaveCooldown = 3.2;
              for (let k = -2; k <= 2; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 270,
                  vy: Math.sin(ang) * 270,
                  angle: ang,
                  speed: 270,
                  dmg: 36,
                  radius: 14,
                  type: 'magic',
                  visual: 'water_blast',
                  color: '#0284C7',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 48,
                  statusText: 'VÝLOVOVÁ VLNA VELEŠTIKY! 🐟🌊',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('splash');
              self.emitDamageText(this.x, this.y - 75, 'VODNÍ TŘÍŠŤ VELEŠTIKY! 🐟🌊', '#38BDF8', true, 'bossAnnouncements');
            }
            this.stikaWhirlCooldown = (typeof this.stikaWhirlCooldown === 'number' ? this.stikaWhirlCooldown : 3.6) - bossCdDt;
            if (this.stikaWhirlCooldown <= 0) {
              this.stikaWhirlCooldown = 4.6;
              addEnemyHazard({
                id: `hazard_vele_stika_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 82,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'mud',
                slowFactor: 0.48,
                kind: 'mud-patch',
                warningTimer: 0.85,
                damage: 40,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('howl');
              self.emitDamageText(this.x, this.y - 70, 'HLUBINNÝ RYBNÍKOVÝ VÍR! 🐟🌀', '#0284C7', true);
            }
            this.stikaSurgeTimer = Math.max(0, (this.stikaSurgeTimer || 0) - dt);
            this.stikaSurgeCooldown = (typeof this.stikaSurgeCooldown === 'number' ? this.stikaSurgeCooldown : 4.0) - bossCdDt;
            if (this.stikaSurgeCooldown <= 0) {
              this.stikaSurgeCooldown = 5.0;
              this.stikaSurgeTimer = 0.95;
              this.stikaSurgeAngle = dir;
              self.callbacks?.onSound?.('splash');
              self.emitDamageText(this.x, this.y - 60, 'BLESKOVÝ VÝPAD VELEŠTIKY! 🐟💨', '#7DD3FC', true);
            }
            const stikaMult = this.stikaSurgeTimer > 0 ? 2.3 : 1.0;
            const stikaDir = this.panicked ? dir + Math.PI : (this.stikaSurgeTimer > 0 && typeof this.stikaSurgeAngle === 'number' ? this.stikaSurgeAngle : dir);
            this.vx = Math.cos(stikaDir) * spd * stikaMult;
            this.vy = Math.sin(stikaDir) * spd * stikaMult;
          } else if (this.id === 'listopadovy_mrazivec') {
            // Stage 17 Final Boss: Listopadový mrazivec — hoarfrost fan, freeze ground hazard & winter gale
            const isPhase2 = this.hp <= (this.maxHp || 18000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 55) * 1.28);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 70, '❄️ LISTOPADOVÝ MRÁZ ZESILUJE!', '#38BDF8', true);
            }
            // Attack 1: Hoarfrost Fan (5-way ice crystals) with 0.8s telegraphed nápřah
            this.mrazivecBreathCooldown = (typeof this.mrazivecBreathCooldown === 'number' ? this.mrazivecBreathCooldown : 2.5) - bossCdDt;
            this.windupTimer = Math.max(0, (this.windupTimer || 0) - dt);
            this.isWindup = this.windupTimer > 0;
            this.isAttacking = this.windupTimer > 0;

            if (this.mrazivecBreathCooldown <= 0) {
              this.mrazivecBreathCooldown = isPhase2 ? 2.4 : 3.5;
              this.windupTimer = 0.8;
              this.isWindup = true;
              this.isAttacking = true;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              const count = isPhase2 ? 5 : 3;
              const spread = 0.24;
              for (let k = 0; k < count; k++) {
                const angle = targetAngle + (k - (count - 1) / 2) * spread;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * 230,
                  vy: Math.sin(angle) * 230,
                  angle,
                  speed: 230,
                  dmg: isPhase2 ? 30 : 24,
                  radius: 12,
                  type: 'ice',
                  visual: 'icicle',
                  color: '#BAE6FD',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'MRAZIVÁ JINOVATKA! ❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 50, 'MRAZIVÝ VÝDECH! ❄️', '#BAE6FD', true);
            }

            // Attack 2: Přízemní mrazík (Hoarfrost ground hazard)
            this.mrazivecHoarfrostCooldown = (typeof this.mrazivecHoarfrostCooldown === 'number' ? this.mrazivecHoarfrostCooldown : 3.4) - bossCdDt;
            if (this.mrazivecHoarfrostCooldown <= 0) {
              this.mrazivecHoarfrostCooldown = isPhase2 ? 3.6 : 4.8;
              addEnemyHazard({
                id: `hazard_mrazivec_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 65,
                duration: 3.2,
                maxDuration: 3.2,
                type: 'frost',
                slowFactor: 0.55,
                kind: 'blizzard-zone',
                warningTimer: 0.85,
                damage: 26,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(player.x, player.y - 40, 'PŘÍZEMNÍ MRAZÍK! ❄️🌾', '#7DD3FC', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'kralovska_husa' || this.id === 'svatomartinska_husa') {
            // Stage 17 Mini-Boss: Svatomartinská / Královská husa — Honk sonic shockwave & high-speed dive pass
            this.husaHonkCooldown = (typeof this.husaHonkCooldown === 'number' ? this.husaHonkCooldown : 2.6) - bossCdDt;
            if (this.husaHonkCooldown <= 0 && dist < 260) {
              this.husaHonkCooldown = 3.8;
              addEnemyHazard({
                id: `hazard_husa_honk_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 68,
                duration: 2.0,
                maxDuration: 2.0,
                type: 'mud',
                slowFactor: 0.65,
                kind: 'ground-shockwave',
                warningTimer: 0.6,
                damage: 24,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('bell');
              self.emitDamageText(this.x, this.y - 45, 'HUSÍ ZAKEJHÁNÍ! 🪿🔊', '#FEF08A', true);
            }
            this.husaDiveCooldown = (typeof this.husaDiveCooldown === 'number' ? this.husaDiveCooldown : 3.5) - bossCdDt;
            this.husaDiveTimer = Math.max(0, (this.husaDiveTimer || 0) - dt);
            if (this.husaDiveCooldown <= 0) {
              this.husaDiveCooldown = 4.5;
              this.husaDiveTimer = 0.85;
              this.husaDiveAngle = dir;
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 45, 'SVATOMARTINSKÝ NÁLET! 🪿💨', '#F8FAFC', true);
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.28;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 20,
                  radius: 11,
                  type: 'magic',
                  visual: 'pollen',
                  color: '#F8FAFC',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'HUSÍ PEŘÍ! 🪿',
                  dead: false,
                });
              }
            }
            const husaMult = this.husaDiveTimer > 0 ? 2.2 : 1.0;
            const husaDir = this.panicked ? dir + Math.PI : (this.husaDiveTimer > 0 && typeof this.husaDiveAngle === 'number' ? this.husaDiveAngle : dir);
            this.vx = Math.cos(husaDir) * spd * husaMult;
            this.vy = Math.sin(husaDir) * spd * husaMult;
          } else if (this.id === 'cerny_myslivec') {
            // Stage 18 Mini-Boss: Černý myslivec — Hunting spear throw & Boar snare trap
            this.spearCooldown = (typeof this.spearCooldown === 'number' ? this.spearCooldown : 2.8) - bossCdDt;
            if (this.spearCooldown <= 0 && dist < 420) {
              this.spearCooldown = 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              self.state.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(targetAngle) * 310,
                vy: Math.sin(targetAngle) * 310,
                angle: targetAngle,
                speed: 310,
                dmg: 32,
                radius: 13,
                type: 'physical',
                visual: 'log',
                color: '#475569',
                life: 2.4,
                maxLife: 2.4,
                isEnemy: true,
                pushback: 40,
                statusText: 'LOVECKÝ OŠTĚP! 🗡️🌲',
                dead: false,
              });
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 50, 'LOVECKÝ NÁPŘAH! 🌲🎯', '#94A3B8', true);
            }
            this.boarTrapCooldown = (typeof this.boarTrapCooldown === 'number' ? this.boarTrapCooldown : 3.8) - bossCdDt;
            if (this.boarTrapCooldown <= 0) {
              this.boarTrapCooldown = 4.8;
              addEnemyHazard({
                id: `hazard_myslivec_trap_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 50,
                duration: 5.0,
                maxDuration: 5.0,
                type: 'mud',
                slowFactor: 0.50,
                kind: 'root-snare',
                warningTimer: 0.75,
                damage: 26,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(player.x, player.y - 40, 'ŠTVANICKÁ PAST! 🪤💥', '#F59E0B', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'jezdec_meluziny') {
            // Stage 18 / 20 Boss: Jezdec Meluzíny — Meluzina gale cone & whirling log gale
            const isPhase2 = this.hp <= (this.maxHp || 20000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 68) * 1.25);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 70, '🌪️ MELUZÍNA BURÁCÍ!', '#67E8F9', true);
            }
            this.meluzinaGaleCooldown = (typeof this.meluzinaGaleCooldown === 'number' ? this.meluzinaGaleCooldown : 2.5) - bossCdDt;
            if (this.meluzinaGaleCooldown <= 0) {
              this.meluzinaGaleCooldown = isPhase2 ? 2.4 : 3.4;
              const count = isPhase2 ? 5 : 4;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = 0; k < count; k++) {
                const ang = targetAngle + (k - (count - 1) / 2) * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 250,
                  vy: Math.sin(ang) * 250,
                  angle: ang,
                  speed: 250,
                  dmg: 28,
                  radius: 12,
                  type: 'ice',
                  visual: 'wind_blade',
                  color: '#67E8F9',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 45,
                  statusText: 'MELUZÍNSKÁ ČEPEL! 🌪️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 50, 'MELUZÍNSKÝ PORYV! 🌪️❄️', '#BAE6FD', true);
            }
            this.meluzinaLogCooldown = (typeof this.meluzinaLogCooldown === 'number' ? this.meluzinaLogCooldown : 3.8) - bossCdDt;
            if (this.meluzinaLogCooldown <= 0) {
              this.meluzinaLogCooldown = 4.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k += 2) {
                const ang = targetAngle + k * 0.35;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 190,
                  vy: Math.sin(ang) * 190,
                  angle: ang,
                  speed: 190,
                  dmg: 32,
                  radius: 14,
                  type: 'physical',
                  visual: 'log',
                  color: '#78350F',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'POLOMOVÝ KMEN! 🌲💥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('heavyHit');
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'cert_s_pytlem') {
            // Stage 19 Mini-Boss: Čert s pytlem — Soot cloud toss & Chain whip
            this.sootBagCooldown = (typeof this.sootBagCooldown === 'number' ? this.sootBagCooldown : 2.8) - bossCdDt;
            if (this.sootBagCooldown <= 0) {
              this.sootBagCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_cert_soot_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 60,
                duration: 4.2,
                maxDuration: 4.2,
                type: 'soot',
                slowFactor: 0.60,
                kind: 'soot-cloud',
                warningTimer: 0.7,
                damage: 24,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(player.x, player.y - 40, 'SAZOVÝ PYTEL! 🎒💨', '#71717A', true);
            }
            this.chainWhipCooldown = (typeof this.chainWhipCooldown === 'number' ? this.chainWhipCooldown : 3.2) - bossCdDt;
            if (this.chainWhipCooldown <= 0 && dist < 320) {
              this.chainWhipCooldown = 4.2;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const ang = targetAngle + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 240,
                  vy: Math.sin(ang) * 240,
                  angle: ang,
                  speed: 240,
                  dmg: 28,
                  radius: 12,
                  type: 'physical',
                  visual: 'wind_blade',
                  color: '#B91C1C',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'PEKELNÝ ŘETĚZ! ⛓️🔥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 48, 'ŠVIH ŘETĚZEM! ⛓️', '#DC2626', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'kral_mrazik') {
            // Stage 19 & 20 Final Boss: Král Mrázík — Mrazivá koruna (radial burst) & Královský ledopád (hail)
            const isPhase2 = this.hp <= (this.maxHp || 24000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 60) * 1.30);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 75, '👑 KRÁL MRÁZÍK VLÁDNE PEVNOU RUKOU!', '#0284C7', true);
            }
            // Attack 1: Mrazivá koruna (8-way radial icicle burst)
            this.mrazikCrownCooldown = (typeof this.mrazikCrownCooldown === 'number' ? this.mrazikCrownCooldown : 2.6) - bossCdDt;
            if (this.mrazikCrownCooldown <= 0) {
              this.mrazikCrownCooldown = isPhase2 ? 2.5 : 3.6;
              const spikes = isPhase2 ? 10 : 8;
              for (let k = 0; k < spikes; k++) {
                const ang = (k / spikes) * Math.PI * 2 + (self.state.gameTime || 0) * 0.4;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 28,
                  radius: 13,
                  type: 'ice',
                  visual: 'icicle',
                  color: '#38BDF8',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'MRAZIVÁ KORUNA! 👑❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(this.x, this.y - 55, 'KORUNA MRÁZU! 👑❄️', '#38BDF8', true);
            }
            // Attack 2: Královský ledopád (hailstorm warning circles)
            this.mrazikHailCooldown = (typeof this.mrazikHailCooldown === 'number' ? this.mrazikHailCooldown : 3.8) - bossCdDt;
            if (this.mrazikHailCooldown <= 0) {
              this.mrazikHailCooldown = isPhase2 ? 3.6 : 4.8;
              addEnemyHazard({
                id: `hazard_mrazik_hail_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 75,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'frost',
                slowFactor: 0.50,
                kind: 'hail-circle',
                warningTimer: 0.9,
                damage: 34,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(player.x, player.y - 45, 'KRÁLOVSKÝ LEDOPÁD! 🌨️👑', '#BAE6FD', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'obri_snehulak') {
            // Stage 21 Mini-Boss: Obří sněhulák — Snowball charge & Freezing puddle
            this.snowballDashCooldown = (typeof this.snowballDashCooldown === 'number' ? this.snowballDashCooldown : 2.8) - bossCdDt;
            this.snowballDashTimer = Math.max(0, (this.snowballDashTimer || 0) - dt);
            if (this.snowballDashCooldown <= 0) {
              this.snowballDashCooldown = 4.2;
              this.snowballDashTimer = 0.9;
              this.snowballDashAngle = dir;
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 50, 'VALÍCÍ SE KOULE! ⛄💨', '#CBD5E1', true);
            }
            this.freezingPuddleCooldown = (typeof this.freezingPuddleCooldown === 'number' ? this.freezingPuddleCooldown : 3.6) - bossCdDt;
            if (this.freezingPuddleCooldown <= 0) {
              this.freezingPuddleCooldown = 4.6;
              addEnemyHazard({
                id: `hazard_snehulak_puddle_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 60,
                duration: 3.5,
                maxDuration: 3.5,
                type: 'frost',
                slowFactor: 0.55,
                kind: 'blizzard-zone',
                warningTimer: 0.4,
                damage: 24,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 40, 'MRAZIVÁ BŘEČKA! ⛄❄️', '#E2E8F0', true);
            }
            const snehulakMult = this.snowballDashTimer > 0 ? 2.3 : 1.0;
            const snehulakDir = this.panicked ? dir + Math.PI : (this.snowballDashTimer > 0 && typeof this.snowballDashAngle === 'number' ? this.snowballDashAngle : dir);
            this.vx = Math.cos(snehulakDir) * spd * snehulakMult;
            this.vy = Math.sin(snehulakDir) * spd * snehulakMult;
          } else if (this.id === 'vladce_chumelenice') {
            // Stage 21 Final Boss: Vládce chumelenice — Whiteout blizzard vortex & Avalanche snow boulders
            const isPhase2 = this.hp <= (this.maxHp || 26000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 60) * 1.30);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 75, '❄️ CHUMELENICE HOUSTNE! BÍLÁ TMA!', '#0EA5E9', true);
            }
            this.whiteoutCooldown = (typeof this.whiteoutCooldown === 'number' ? this.whiteoutCooldown : 3.0) - bossCdDt;
            if (this.whiteoutCooldown <= 0) {
              this.whiteoutCooldown = isPhase2 ? 3.4 : 4.6;
              addEnemyHazard({
                id: `hazard_vladce_whiteout_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 80,
                duration: 3.5,
                maxDuration: 3.5,
                type: 'frost',
                slowFactor: 0.50,
                kind: 'triad-blizzard',
                warningTimer: 0.9,
                damage: 32,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(player.x, player.y - 45, 'BÍLÁ TMA! 🌨️❄️', '#BAE6FD', true);
            }
            this.avalancheCooldown = (typeof this.avalancheCooldown === 'number' ? this.avalancheCooldown : 3.6) - bossCdDt;
            if (this.avalancheCooldown <= 0) {
              this.avalancheCooldown = 4.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const ang = targetAngle + k * 0.28;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 30,
                  radius: 14,
                  type: 'ice',
                  visual: 'water_blast',
                  color: '#E0F2FE',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 50,
                  statusText: 'LAVINA! 🏔️❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('heavyHit');
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'kostlivec_s_kosou') {
            // Stage 22 Mid-Boss: Mrazivý kostlivec s kosou — Scythe cleave & Bone projectile volley
            this.scytheCleaveCooldown = (typeof this.scytheCleaveCooldown === 'number' ? this.scytheCleaveCooldown : 2.5) - bossCdDt;
            if (this.scytheCleaveCooldown <= 0 && dist < 240) {
              this.scytheCleaveCooldown = 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const ang = targetAngle + k * 0.32;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 230,
                  vy: Math.sin(ang) * 230,
                  angle: ang,
                  speed: 230,
                  dmg: 34,
                  radius: 14,
                  type: 'physical',
                  visual: 'wind_blade',
                  color: '#94A3B8',
                  life: 2.0,
                  maxLife: 2.0,
                  isEnemy: true,
                  pushback: 45,
                  statusText: 'ZÁSEK KOSOU! 💀⚔️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 48, 'MRAZIVÝ ZÁSEK! 💀', '#E2E8F0', true);
            }
            this.boneVolleyCooldown = (typeof this.boneVolleyCooldown === 'number' ? this.boneVolleyCooldown : 3.4) - bossCdDt;
            if (this.boneVolleyCooldown <= 0) {
              this.boneVolleyCooldown = 4.4;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k += 2) {
                const ang = targetAngle + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 260,
                  vy: Math.sin(ang) * 260,
                  angle: ang,
                  speed: 260,
                  dmg: 26,
                  radius: 11,
                  type: 'ice',
                  visual: 'icicle',
                  color: '#CBD5E1',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'KOSTĚNÁ STŘELA! 🦴',
                  dead: false,
                });
              }
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'perchta_s_nozem') {
            // Stage 22 Final Boss: Šeredná Perchta s nožem — Knife lunge, Hex circle & Steel needles
            const isPhase2 = this.hp <= (this.maxHp || 26000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 62) * 1.30);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 75, '🗡️ PERCHTA OTEVÍRÁ NŮŽ! PŮST PORUŠEN!', '#EF4444', true);
            }
            // Attack 1: Rozpárání břicha (Telegraphed knife lunge with 0.8s nápřah)
            this.perchtaLungeCooldown = (typeof this.perchtaLungeCooldown === 'number' ? this.perchtaLungeCooldown : 2.8) - bossCdDt;
            this.perchtaLungeTimer = Math.max(0, (this.perchtaLungeTimer || 0) - dt);
            this.windupTimer = Math.max(0, (this.windupTimer || 0) - dt);
            this.isWindup = this.windupTimer > 0;
            this.isAttacking = this.windupTimer > 0 || this.perchtaLungeTimer > 0;

            if (this.perchtaLungeCooldown <= 0) {
              this.perchtaLungeCooldown = isPhase2 ? 3.0 : 4.2;
              this.windupTimer = 0.8;
              this.isWindup = true;
              this.isAttacking = true;
              this.perchtaLungeTimer = 0.7;
              this.perchtaLungeAngle = dir;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 50, 'ROZPÁRÁNÍ BŘICHA! 🗡️🩸', '#DC2626', true);
            }

            // Attack 2: Kletba půstu a nůžky osudu (Hex hazard circle; breaking it deals backlash to Perchta)
            this.perchtaHexCooldown = (typeof this.perchtaHexCooldown === 'number' ? this.perchtaHexCooldown : 3.6) - bossCdDt;
            if (this.perchtaHexCooldown <= 0) {
              this.perchtaHexCooldown = isPhase2 ? 3.8 : 5.0;
              addEnemyHazard({
                id: `hazard_perchta_hex_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 70,
                duration: 5.0,
                maxDuration: 5.0,
                type: 'curse',
                slowFactor: 0.50,
                kind: 'hex-circle',
                warningTimer: 0.9,
                damage: 32,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(player.x, player.y - 45, 'KLETBA PŮSTU! ✂️💀', '#A855F7', true);
            }

            // Attack 3: Mrazivé šicí jehly (5-way needle fan)
            this.perchtaNeedlesCooldown = (typeof this.perchtaNeedlesCooldown === 'number' ? this.perchtaNeedlesCooldown : 4.2) - bossCdDt;
            if (this.perchtaNeedlesCooldown <= 0) {
              this.perchtaNeedlesCooldown = isPhase2 ? 3.2 : 4.5;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -2; k <= 2; k++) {
                const ang = targetAngle + k * 0.18;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 270,
                  vy: Math.sin(ang) * 270,
                  angle: ang,
                  speed: 270,
                  dmg: 26,
                  radius: 11,
                  type: 'ice',
                  visual: 'icicle',
                  color: '#E2E8F0',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'ŠICÍ JEHLA! 🪡❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
            }

            const perchtaMult = this.perchtaLungeTimer > 0 ? 2.5 : 1.0;
            const perchtaDir = this.panicked ? dir + Math.PI : (this.perchtaLungeTimer > 0 && typeof this.perchtaLungeAngle === 'number' ? this.perchtaLungeAngle : dir);
            this.vx = Math.cos(perchtaDir) * spd * perchtaMult;
            this.vy = Math.sin(perchtaDir) * spd * perchtaMult;
          } else if (this.id === 'masopustni_medved') {
            // Stage 23 Mini-Boss: Masopustní medvěd — Roar shockwave & Heavy lunge
            this.bearRoarCooldown = (typeof this.bearRoarCooldown === 'number' ? this.bearRoarCooldown : 2.8) - bossCdDt;
            if (this.bearRoarCooldown <= 0 && dist < 260) {
              this.bearRoarCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_bear_roar_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 70,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'ground-shockwave',
                warningTimer: 0.6,
                damage: 28,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 50, 'MEDVĚDÍ ZAMRUČENÍ! 🐻🔊', '#B45309', true);
            }
            this.bearChargeCooldown = (typeof this.bearChargeCooldown === 'number' ? this.bearChargeCooldown : 3.8) - bossCdDt;
            this.bearChargeTimer = Math.max(0, (this.bearChargeTimer || 0) - dt);
            if (this.bearChargeCooldown <= 0) {
              this.bearChargeCooldown = 4.8;
              this.bearChargeTimer = 0.85;
              this.bearChargeAngle = dir;
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 48, 'MEDVĚDÍ VÝPAD! 🐻💨', '#78350F', true);
            }
            const bearMult = this.bearChargeTimer > 0 ? 2.1 : 1.0;
            const bearDir = this.panicked ? dir + Math.PI : (this.bearChargeTimer > 0 && typeof this.bearChargeAngle === 'number' ? this.bearChargeAngle : dir);
            this.vx = Math.cos(bearDir) * spd * bearMult;
            this.vy = Math.sin(bearDir) * spd * bearMult;
          } else if (this.id === 'rychtar_masek') {
            // Stage 23 Final Boss: Rychtář maškar — Masopustní ferule strike & Confetti barrage
            const isPhase2 = this.hp <= (this.maxHp || 28000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 65) * 1.28);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 75, '🎭 RYCHTÁŘ ZAHALIL NÁVES DO REJE!', '#F59E0B', true);
            }
            // Attack 1: Masopustní právo a úder ferulí (Ground shockwave with 0.8s nápřah)
            this.feruleStrikeCooldown = (typeof this.feruleStrikeCooldown === 'number' ? this.feruleStrikeCooldown : 2.8) - bossCdDt;
            if (this.feruleStrikeCooldown <= 0) {
              this.feruleStrikeCooldown = isPhase2 ? 3.0 : 4.2;
              addEnemyHazard({
                id: `hazard_rychtar_ferule_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 75,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'mud',
                slowFactor: 0.55,
                kind: 'ground-shockwave',
                warningTimer: 0.8,
                damage: 32,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 50, 'ÚDER MASOPUSTNÍ FERULÍ! 🎭📜', '#F59E0B', true);
            }
            // Attack 2: Konfety a masopustní glejt (5-way colorful confetti barrage + runner minion)
            this.confettiBurstCooldown = (typeof this.confettiBurstCooldown === 'number' ? this.confettiBurstCooldown : 3.6) - bossCdDt;
            if (this.confettiBurstCooldown <= 0) {
              this.confettiBurstCooldown = isPhase2 ? 3.4 : 4.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -2; k <= 2; k++) {
                const ang = targetAngle + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 230,
                  vy: Math.sin(ang) * 230,
                  angle: ang,
                  speed: 230,
                  dmg: 24,
                  radius: 12,
                  type: 'magic',
                  visual: 'straw_doll',
                  color: k % 2 === 0 ? '#DC2626' : '#F59E0B',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'MASOPUSTNÍ KONFETY! 🎉🎭',
                  dead: false,
                });
              }
              if ((self.livingEnemies?.length || 0) < 35) {
                const sAng = Math.random() * Math.PI * 2;
                self.spawnMonster('masopustni_laufr', this.x + Math.cos(sAng) * 80, this.y + Math.sin(sAng) * 80, 0.85);
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 50, 'MASOPUSTNÍ REJ! 🎭🎉', '#DC2626', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'umrlec_basista') {
            // Stage 24 Mid-Boss: Umrlec basista — Discordant bass screech & Broken bow slash
            this.bassScreechCooldown = (typeof this.bassScreechCooldown === 'number' ? this.bassScreechCooldown : 2.8) - bossCdDt;
            if (this.bassScreechCooldown <= 0 && dist < 280) {
              this.bassScreechCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_basista_screech_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 70,
                duration: 2.4,
                maxDuration: 2.4,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'ground-shockwave',
                warningTimer: 0.7,
                damage: 30,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 50, 'SKŘÍPĚNÍ BASY! 🎻💀', '#64748B', true);
            }
            this.bowSlashCooldown = (typeof this.bowSlashCooldown === 'number' ? this.bowSlashCooldown : 3.4) - bossCdDt;
            if (this.bowSlashCooldown <= 0) {
              this.bowSlashCooldown = 4.4;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const ang = targetAngle + k * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 250,
                  vy: Math.sin(ang) * 250,
                  angle: ang,
                  speed: 250,
                  dmg: 28,
                  radius: 13,
                  type: 'physical',
                  visual: 'wind_blade',
                  color: '#475569',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'SEKNUTÍ SMYČCEM! 🎻',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('slash');
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'bakchus_s_pivnim_soudkem') {
            // Stage 24 Final Boss: Bakchus s pivním soudkem — Climax Boss of the Year
            const isPhase2 = this.hp <= (this.maxHp || 30000) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 60) * 1.35);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 75, '🍺 BAKCHUS ROZRÁŽÍ PIVNÍ SUD!', '#D97706', true);
            }
            // Attack 1: Valící se pivní sud (2 rolling keg projectiles)
            this.kegRollCooldown = (typeof this.kegRollCooldown === 'number' ? this.kegRollCooldown : 2.6) - bossCdDt;
            if (this.kegRollCooldown <= 0) {
              this.kegRollCooldown = isPhase2 ? 2.4 : 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k += 2) {
                const ang = targetAngle + k * 0.28;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 220,
                  vy: Math.sin(ang) * 220,
                  angle: ang,
                  speed: 220,
                  dmg: 36,
                  radius: 15,
                  type: 'physical',
                  visual: 'log',
                  color: '#92400E',
                  life: 2.8,
                  maxLife: 2.8,
                  isEnemy: true,
                  pushback: 55,
                  statusText: 'PIVNÍ SUD! 🍺💥',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 50, 'VALÍCÍ SE PIVNÍ SUD! 🍺💨', '#D97706', true);
            }
            // Attack 2: Pivní pěnová tříšť (frothy slow puddle hazard with 0.85s warning)
            this.foamSplashCooldown = (typeof this.foamSplashCooldown === 'number' ? this.foamSplashCooldown : 3.4) - bossCdDt;
            if (this.foamSplashCooldown <= 0) {
              this.foamSplashCooldown = isPhase2 ? 3.4 : 4.6;
              addEnemyHazard({
                id: `hazard_bakchus_foam_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 75,
                duration: 3.5,
                maxDuration: 3.5,
                type: 'mud',
                slowFactor: 0.45,
                kind: 'mud-patch',
                warningTimer: 0.85,
                damage: 28,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('splash');
              self.emitDamageText(player.x, player.y - 45, 'PĚNOVÁ TŘÍŠŤ! 🍺🫧', '#FEF08A', true);
            }
            // Attack 3: Bakchův půlnoční rej (8-way radial hops/foam burst)
            this.bacchicBurstCooldown = (typeof this.bacchicBurstCooldown === 'number' ? this.bacchicBurstCooldown : 4.0) - bossCdDt;
            if (this.bacchicBurstCooldown <= 0) {
              this.bacchicBurstCooldown = isPhase2 ? 3.8 : 5.0;
              const count = isPhase2 ? 10 : 8;
              for (let k = 0; k < count; k++) {
                const ang = (k / count) * Math.PI * 2 + (self.state.gameTime || 0) * 0.5;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 200,
                  vy: Math.sin(ang) * 200,
                  angle: ang,
                  speed: 200,
                  dmg: 25,
                  radius: 12,
                  type: 'magic',
                  visual: 'bubble',
                  color: '#FBBF24',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'CHMELOVÝ POHÁR! 🍺✨',
                  dead: false,
                });
              }
              if ((self.livingEnemies?.length || 0) < 35) {
                const sAng = Math.random() * Math.PI * 2;
                self.spawnMonster('koblihovy_rarach', this.x + Math.cos(sAng) * 85, this.y + Math.sin(sAng) * 85, 0.85);
              }
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 55, 'BAKCHŮV PŮLNOČNÍ REJ! 🍺👑', '#EAB308', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'blatouch' && (this.isMiniboss || this.isBoss)) {
            // Attack 1: Pollen Spray - 3-way yellow pollen projectiles
            this.pollenCooldown = (typeof this.pollenCooldown === 'number' ? this.pollenCooldown : 3.2) - bossCdDt;
            if (this.pollenCooldown <= 0 && dist < 320) {
              this.pollenCooldown = 3.8;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.25;
                const speed = 180;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 12,
                  radius: 8,
                  type: 'poison',
                  visual: 'pollen',
                  color: '#FACC15',
                  life: 2.0,
                  maxLife: 2.0,
                  isEnemy: true,
                  pushback: 15,
                  statusText: 'JARNÍ PYL! 🌼',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 30, 'JARNÍ PYL! 🌼', '#FDE047', false);
            }
            // Attack 2: Mud-vine Tangling Patch
            this.vineCooldown = (typeof this.vineCooldown === 'number' ? this.vineCooldown : 4.2) - bossCdDt;
            if (this.vineCooldown <= 0) {
              this.vineCooldown = 4.8;
              addEnemyHazard({
                id: `hazard_blatouch_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 32,
                duration: 3.0,
                maxDuration: 3.0,
                type: 'mud',
                slowFactor: 0.65,
                kind: 'mud-patch',
                damage: 8,
                sourceEnemyId: this.id,
              });
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'vodnicek') {
            // Attack 1: Geyser Hazard under player
            this.geyserCooldown = (typeof this.geyserCooldown === 'number' ? this.geyserCooldown : 3.0) - bossCdDt;
            if (this.geyserCooldown <= 0) {
              this.geyserCooldown = 3.8;
              addEnemyHazard({
                id: `hazard_vodnicek_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 36,
                duration: 1.8,
                maxDuration: 1.8,
                type: 'water',
                slowFactor: 0.70,
                kind: 'water-geyser',
                warningTimer: 0.9,
                damage: 18,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('water_splash');
              self.emitDamageText(this.x, this.y - 32, 'JARNÍ GEJZÍR! 💧', '#38BDF8', false);
            }
            // Attack 2: Bubble Stream Projectiles
            this.bubbleCooldown = (typeof this.bubbleCooldown === 'number' ? this.bubbleCooldown : 2.4) - bossCdDt;
            if (this.bubbleCooldown <= 0 && dist < 300) {
              this.bubbleCooldown = 3.2;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.22;
                const speed = 200;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 14,
                  radius: 9,
                  type: 'water',
                  visual: 'bubble',
                  color: '#60A5FA',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 18,
                  statusText: 'BUBLINY! 🫧',
                  dead: false,
                });
              }
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'mrazivy_obr') {
            // Stage 2 Mid-Boss: Mrazivý obr — Frost stomp, Icicle volley & Glacier charge
            // Attack 1: Frost Ground Stomp (expanding shockwave hazard)
            this.stompCooldown = (typeof this.stompCooldown === 'number' ? this.stompCooldown : 3.2) - bossCdDt;
            if (this.stompCooldown <= 0 && dist < 240) {
              this.stompCooldown = 4.0;
              addEnemyHazard({
                id: `hazard_obr_stomp_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 75,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'frost',
                slowFactor: 0.65,
                kind: 'frost-stomp',
                warningTimer: 0.6,
                damage: 32,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 50, 'MRAZIVÝ DUP! ❄️💥', '#38BDF8', true);
            }
            // Attack 2: Icicle Volley
            this.icicleCooldown = (typeof this.icicleCooldown === 'number' ? this.icicleCooldown : 2.6) - bossCdDt;
            if (this.icicleCooldown <= 0 && dist < 380) {
              this.icicleCooldown = 3.6;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.24;
                const speed = 210;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 24,
                  radius: 12,
                  type: 'ice',
                  visual: 'icicle',
                  color: '#E0F2FE',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'RAMPOUCH! ❄️',
                  dead: false,
                });
              }
            }
            // Attack 3: Ledovcový nápor (Glacier rush + blizzard patch)
            this.avalancheDashCooldown = (typeof this.avalancheDashCooldown === 'number' ? this.avalancheDashCooldown : 4.2) - bossCdDt;
            this.obrChargeTimer = Math.max(0, (this.obrChargeTimer || 0) - dt);
            if (this.avalancheDashCooldown <= 0) {
              this.avalancheDashCooldown = 4.8;
              this.obrChargeTimer = 0.8;
              self.emitDamageText(this.x, this.y - 56, 'LEDOVCOVÝ NÁPOR! 🏔️❄️', '#BAE6FD', true);
            }
            const obrMult = this.obrChargeTimer > 0 ? 1.85 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd * obrMult;
            this.vy = Math.sin(moveDir) * spd * obrMult;
          } else if (this.id === 'morana') {
            // Stage 2 Final Boss: Smrtka Morana — 3 authentic folklore attacks + telegraphs + effigy backlash
            const isPhase2 = this.hp <= (this.maxHp || 2500) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = Math.round((this.speed || 60) * 1.3);
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 70, '❄️ MORANA SE ROZHNĚVALA! PŘICHÁZÍ VÁNICE!', '#BAE6FD', true);
            }

            // Attack 1: Mrazivý vichr (0.8s telegraphed nápřah zimní žerdi -> 3 or 5 frost wind blades with pushback)
            this.windBladeCooldown = (typeof this.windBladeCooldown === 'number' ? this.windBladeCooldown : 2.4) - bossCdDt;
            this.windupTimer = Math.max(0, (this.windupTimer || 0) - dt);
            this.isWindup = this.windupTimer > 0;
            this.isAttacking = this.windupTimer > 0;

            if (this.windBladeCooldown <= 0) {
              this.windBladeCooldown = isPhase2 ? 2.2 : 3.4;
              this.windupTimer = 0.8;
              this.isWindup = true;
              this.isAttacking = true;
              const count = isPhase2 ? 5 : 3;
              const spread = isPhase2 ? 0.28 : 0.22;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = 0; k < count; k++) {
                const angle = targetAngle + (k - (count - 1) / 2) * spread;
                const speed = isPhase2 ? 240 : 200;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: isPhase2 ? 26 : 20,
                  radius: 12,
                  type: 'ice',
                  visual: 'wind_blade',
                  color: '#7DD3FC',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 32,
                  statusText: 'MRAZIVÝ VICHR! ❄️',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 45, 'MRAZIVÝ VICHR! ❄️', '#BAE6FD', true);
            }

            // Attack 2: Sněžná vánice (Blizzard AoE Zone hazard with 0.9s telegraph warning circle)
            this.blizzardCooldown = (typeof this.blizzardCooldown === 'number' ? this.blizzardCooldown : 3.2) - bossCdDt;
            if (this.blizzardCooldown <= 0) {
              this.blizzardCooldown = isPhase2 ? 3.2 : 4.4;
              addEnemyHazard({
                id: `hazard_morana_blizzard_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: isPhase2 ? 70 : 55,
                duration: 3.0,
                maxDuration: 3.0,
                type: 'frost',
                slowFactor: 0.60,
                kind: 'blizzard-zone',
                warningTimer: 0.9,
                damage: isPhase2 ? 28 : 22,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('freeze');
              self.emitDamageText(player.x, player.y - 40, 'SNĚŽNÁ VÁNICE! 🌨️', '#93C5FD', true);
            }

            // Attack 3: Vynášení smrti / Slaměné modly zimy (6-way doll burst + 3 straw effigies with tether & backlash)
            this.effigyCooldown = (typeof this.effigyCooldown === 'number' ? this.effigyCooldown : 3.8) - bossCdDt;
            if (this.effigyCooldown <= 0) {
              this.effigyCooldown = isPhase2 ? 3.8 : 4.8;
              const dollCount = 6;
              for (let k = 0; k < dollCount; k++) {
                const ang = (k / dollCount) * Math.PI * 2 + (self.state.gameTime || 0) * 0.5;
                const dSpd = 185;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * dSpd,
                  vy: Math.sin(ang) * dSpd,
                  angle: ang,
                  speed: dSpd,
                  dmg: 22,
                  radius: 12,
                  type: 'magic',
                  visual: 'straw_doll',
                  color: '#FDE047',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'SLAMĚNÁ MORANA! 🌾💀',
                  dead: false,
                });
              }

              // Spawn 3 straw effigy totems around Morana (breaking them inflicts backlash damage on Morana)
              for (let k = 0; k < 3; k++) {
                const totemAng = (k / 3) * Math.PI * 2 + Math.PI / 6;
                const tx = this.x + Math.cos(totemAng) * 90;
                const ty = this.y + Math.sin(totemAng) * 90;
                addEnemyHazard({
                  id: `hazard_morana_effigy_${Math.round(self.state.gameTime * 1000)}_${k}_${Math.random().toString(36).slice(2, 6)}`,
                  x: tx,
                  y: ty,
                  radius: 36,
                  duration: 5.5,
                  maxDuration: 5.5,
                  type: 'frost',
                  slowFactor: 0.75,
                  kind: 'straw-effigy',
                  warningTimer: 0.5,
                  damage: 18,
                  sourceEnemyId: this.id,
                });
              }

              if ((self.livingEnemies?.length || 0) < 35) {
                const sAng = Math.random() * Math.PI * 2;
                const herald = self.spawnMonster('mrazovy_skritek', this.x + Math.cos(sAng) * 85, this.y + Math.sin(sAng) * 85, 0.85);
                if (herald) {
                  herald._tetheredBoss = this;
                  this._synergyMinionCount = (this._synergyMinionCount || 0) + 1;
                }
              }
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 56, 'VYNÁŠENÍ SMRTI! 🌾💀', '#FDE047', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'klekanice') {
            // Attack 1: Bell Toll Sonic Shockwave
            this.bellTollCooldown = (typeof this.bellTollCooldown === 'number' ? this.bellTollCooldown : 3.0) - bossCdDt;
            if (this.bellTollCooldown <= 0) {
              this.bellTollCooldown = 3.8;
              self.callbacks?.onSound?.('bell');
              self.emitDamageText(this.x, this.y - 40, 'ZVANÍ KLEKÁNÍ! 🔔', '#A855F7', true);
              if (dist <= 160 && typeof player.takeDamage === 'function') {
                player.takeDamage(24, 'holy', this);
              }
            }
            // Attack 2: Night Shadow Dash
            this.dashCooldown = (typeof this.dashCooldown === 'number' ? this.dashCooldown : 2.5) - bossCdDt;
            if (this.dashCooldown <= 0 && dist < 280) {
              this.dashCooldown = 3.5;
              this.speedBurstTimer = 0.8;
              self.emitDamageText(this.x, this.y - 35, 'KLEKÁNSKÝ STÍN! 👻', '#818CF8', false);
            }
            if ((this.speedBurstTimer || 0) > 0) {
              this.speedBurstTimer -= dt;
              spd *= 2.1;
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'drab') {
            // Stage 6 Mid-Boss: Panský dráb — Whip cleave, Chain shackles & Musket/Pistol lead volley
            // Attack 1: Whip Cleave
            this.whipCleaveCooldown = (typeof this.whipCleaveCooldown === 'number' ? this.whipCleaveCooldown : 3.0) - bossCdDt;
            if (this.whipCleaveCooldown <= 0 && dist < 130) {
              this.whipCleaveCooldown = 3.6;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 42, 'KARABÁČ! ⛓️💥', '#EF4444', true);
              if (dist <= 100 && typeof player.takeDamage === 'function') {
                player.takeDamage(34, 'physical', this, true);
              }
            }
            // Attack 2: Chain Shackles Hazard
            this.shackleCooldown = (typeof this.shackleCooldown === 'number' ? this.shackleCooldown : 3.4) - bossCdDt;
            if (this.shackleCooldown <= 0) {
              this.shackleCooldown = 4.4;
              addEnemyHazard({
                id: `hazard_drab_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 40,
                duration: 2.5,
                maxDuration: 2.5,
                type: 'curse',
                slowFactor: 0.50,
                kind: 'chain-shackle',
                warningTimer: 0.8,
                damage: 18,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('chain');
            }
            // Attack 3: Robotní výstřel (3-way lead shot fan)
            this.pistolVolleyCooldown = (typeof this.pistolVolleyCooldown === 'number' ? this.pistolVolleyCooldown : 2.6) - bossCdDt;
            if (this.pistolVolleyCooldown <= 0 && dist < 380) {
              this.pistolVolleyCooldown = 3.6;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 235,
                  vy: Math.sin(ang) * 235,
                  angle: ang,
                  speed: 235,
                  dmg: 20,
                  radius: 9,
                  type: 'physical',
                  visual: 'witch_venom',
                  color: '#94A3B8',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 26,
                  statusText: 'DRÁBOVA KULE! 💥',
                  dead: false,
                });
              }
              self.emitDamageText(this.x, this.y - 50, 'ROBOTNÍ PALBA! 💥', '#F87171', false);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'hastrman') {
            // Stage 5 Mid-Boss: Hastrman — Water spray, Soul jar traps & Undertow tidal lunge
            // Attack 1: Mud & Water Lily Spray
            this.sprayCooldown = (typeof this.sprayCooldown === 'number' ? this.sprayCooldown : 2.6) - bossCdDt;
            if (this.sprayCooldown <= 0 && dist < 340) {
              this.sprayCooldown = 3.2;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.22;
                const speed = 210;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 18,
                  radius: 10,
                  type: 'water',
                  visual: 'water_drop',
                  color: '#0284C7',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 20,
                  statusText: 'RYBNIČNÍ SPRCHA! 💧',
                  dead: false,
                });
              }
              self.callbacks?.onSound?.('water_splash');
            }
            // Attack 2: Water Jar Traps
            this.jarCooldown = (typeof this.jarCooldown === 'number' ? this.jarCooldown : 3.6) - bossCdDt;
            if (this.jarCooldown <= 0) {
              this.jarCooldown = 4.4;
              addEnemyHazard({
                id: `hazard_hastrman_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 44,
                duration: 3.0,
                maxDuration: 3.0,
                type: 'mud',
                slowFactor: 0.60,
                kind: 'water-jar-trap',
                warningTimer: 0.9,
                damage: 22,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('bubble');
              self.emitDamageText(this.x, this.y - 38, 'DUŠIČKOVÝ HRNEČEK! 💧🏺', '#0EA5E9', true);
            }
            // Attack 3: Spodní proud (Tidal lunge + whirlpool)
            this.undertowDashCooldown = (typeof this.undertowDashCooldown === 'number' ? this.undertowDashCooldown : 4.2) - bossCdDt;
            this.undertowTimer = Math.max(0, (this.undertowTimer || 0) - dt);
            if (this.undertowDashCooldown <= 0) {
              this.undertowDashCooldown = 4.8;
              this.undertowTimer = 0.8;
              self.emitDamageText(this.x, this.y - 46, 'SPODNÍ PROUD! 🌊🐸', '#38BDF8', true);
            }
            const hastrmanMult = this.undertowTimer > 0 ? 1.85 : 1.0;
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd * hastrmanMult;
            this.vy = Math.sin(moveDir) * spd * hastrmanMult;
          } else if (this.id === 'zbojnik' && (this.isMiniboss || this.isBoss)) {
            // Attack 1: Bandit Saber Charge
            this.saberDashCooldown = (typeof this.saberDashCooldown === 'number' ? this.saberDashCooldown : 2.8) - bossCdDt;
            if (this.saberDashCooldown <= 0 && dist < 220) {
              this.saberDashCooldown = 3.6;
              this.speedBurstTimer = 0.9;
              self.callbacks?.onSound?.('slash');
              self.emitDamageText(this.x, this.y - 36, 'ZBOJNICKÝ SEK! 🗡️', '#F59E0B', true);
            }
            if ((this.speedBurstTimer || 0) > 0) {
              this.speedBurstTimer -= dt;
              spd *= 1.9;
            }
            // Attack 2: Bandit Whistle & Minion Summon
            this.whistleCooldown = (typeof this.whistleCooldown === 'number' ? this.whistleCooldown : 4.8) - bossCdDt;
            if (this.whistleCooldown <= 0) {
              this.whistleCooldown = 6.2;
              self.callbacks?.onSound?.('whistle');
              self.emitDamageText(this.x, this.y - 42, 'PÍSKNUTÍ NA DRUŽINU! 🪈', '#D97706', true);
              for (let i = 0; i < 2; i++) {
                const spawnAng = Math.random() * Math.PI * 2;
                self.spawnMonster('cerny_pes', this.x + Math.cos(spawnAng) * 90, this.y + Math.sin(spawnAng) * 90, 0.8);
              }
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'mlynar') {
            // Stage 5 Mid-Boss: Mlynář — Millstone water surge, Flour dust cloud & Millstone timber volley
            // Attack 1: Millstone Water Surge
            this.surgeCooldown = (typeof this.surgeCooldown === 'number' ? this.surgeCooldown : 3.0) - bossCdDt;
            if (this.surgeCooldown <= 0) {
              this.surgeCooldown = 3.8;
              addEnemyHazard({
                id: `hazard_mlynar_surge_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 50,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'water',
                slowFactor: 0.65,
                kind: 'mill-surge',
                warningTimer: 0.8,
                damage: 26,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('water_splash');
              self.emitDamageText(this.x, this.y - 40, 'PŘÍVAL ZE STAVIDEL! 🌊', '#0284C7', true);
            }
            // Attack 2: Flour Dust Cloud
            this.flourCloudCooldown = (typeof this.flourCloudCooldown === 'number' ? this.flourCloudCooldown : 4.0) - bossCdDt;
            if (this.flourCloudCooldown <= 0) {
              this.flourCloudCooldown = 4.8;
              addEnemyHazard({
                id: `hazard_mlynar_flour_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 60,
                duration: 3.2,
                maxDuration: 3.2,
                type: 'soot',
                slowFactor: 0.75,
                kind: 'flour-cloud',
                damage: 12,
                sourceEnemyId: this.id,
              });
              self.emitDamageText(this.x, this.y - 35, 'MOUČNÝ MRAK! 🌾', '#FDE047', false);
            }
            // Attack 3: Mlecí lopatky (3-way water wheel timber toss)
            this.millstoneTossCooldown = (typeof this.millstoneTossCooldown === 'number' ? this.millstoneTossCooldown : 2.6) - bossCdDt;
            if (this.millstoneTossCooldown <= 0 && dist < 360) {
              this.millstoneTossCooldown = 3.6;
              for (let k = -1; k <= 1; k++) {
                const ang = dir + k * 0.24;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 205,
                  vy: Math.sin(ang) * 205,
                  angle: ang,
                  speed: 205,
                  dmg: 20,
                  radius: 11,
                  type: 'wood',
                  visual: 'log',
                  color: '#A16207',
                  life: 2.3,
                  maxLife: 2.3,
                  isEnemy: true,
                  pushback: 28,
                  statusText: 'LOPATKA KOLA! 🪵',
                  dead: false,
                });
              }
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'hejkal') {
            // Stage 6 Final Boss: Lesní Hejkal — 3 distinctive attacks
            // Attack 1: Hromové zahejkání (Thunder Howl sonic shockwave + visible ground ring)
            this.howlCooldown = (typeof this.howlCooldown === 'number' ? this.howlCooldown : 3.0) - bossCdDt;
            if (this.howlCooldown <= 0) {
              this.howlCooldown = 3.8;
              self.callbacks?.onSound?.('roar');
              self.emitDamageText(this.x, this.y - 55, 'HROMOVÉ ZAHEJKÁNÍ! 🌲🗣️', '#16A34A', true);
              addEnemyHazard({
                id: `hazard_hejkal_roar_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 82,
                duration: 1.8,
                maxDuration: 1.8,
                type: 'mud',
                slowFactor: 0.65,
                kind: 'hejkal-roar',
                warningTimer: 0.45,
                damage: 26,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              if (dist <= 180 && typeof player.takeDamage === 'function') {
                player.takeDamage(28, 'physical', this);
                player.slowTimer = Math.max(player.slowTimer || 0, 1.2);
              }
            }
            // Attack 2: Lesní polena (Timber Log Toss 3-way volley)
            this.logTossCooldown = (typeof this.logTossCooldown === 'number' ? this.logTossCooldown : 2.4) - bossCdDt;
            if (this.logTossCooldown <= 0 && dist < 400) {
              this.logTossCooldown = 3.2;
              const targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
              for (let k = -1; k <= 1; k++) {
                const angle = targetAngle + k * 0.24;
                const speed = 215;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  angle,
                  speed,
                  dmg: 24,
                  radius: 12,
                  type: 'wood',
                  visual: 'log',
                  color: '#78350F',
                  life: 2.4,
                  maxLife: 2.4,
                  isEnemy: true,
                  pushback: 32,
                  statusText: 'POLENO! 🪵',
                  dead: false,
                });
              }
            }
            // Attack 3: Kořenová past a divoký skok (Erupts 2 thorny root-snare traps + woodland leap)
            this.rootSnareCooldown = (typeof this.rootSnareCooldown === 'number' ? this.rootSnareCooldown : 3.6) - bossCdDt;
            this.hejkalLeapTimer = Math.max(0, (this.hejkalLeapTimer || 0) - dt);
            if (this.rootSnareCooldown <= 0) {
              this.rootSnareCooldown = 4.4;
              this.hejkalLeapTimer = 0.8;
              this.hejkalLeapAngle = dir;
              for (let r = 0; r < 2; r++) {
                const rOff = r === 0 ? 0 : 65;
                const rAng = dir + (r === 0 ? 0 : Math.PI * 0.5);
                addEnemyHazard({
                  id: `hazard_hejkal_root_${Math.round(self.state.gameTime * 1000)}_${r}_${Math.random().toString(36).slice(2, 7)}`,
                  x: player.x + Math.cos(rAng) * rOff,
                  y: player.y + Math.sin(rAng) * rOff,
                  radius: 44,
                  duration: 3.0,
                  maxDuration: 3.0,
                  type: 'mud',
                  slowFactor: 0.52,
                  kind: 'root-snare',
                  warningTimer: 0.85,
                  damage: 22,
                  sourceEnemyId: this.id,
                });
              }
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 62, 'KOŘENOVÁ PAST! 🌿🪵', '#4ADE80', true);
            }
            const leapMult = this.hejkalLeapTimer > 0 ? 1.95 : 1.0;
            const moveDir = this.panicked
              ? dir + Math.PI
              : this.hejkalLeapTimer > 0 && typeof this.hejkalLeapAngle === 'number'
              ? this.hejkalLeapAngle
              : dir;
            this.vx = Math.cos(moveDir) * spd * leapMult;
            this.vy = Math.sin(moveDir) * spd * leapMult;
          } else if (this.id === 'rehtackar') {
            this.rehtackarPulseTimer = (typeof this.rehtackarPulseTimer === 'number' ? this.rehtackarPulseTimer : 1.5) - dt;
            if (this.rehtackarPulseTimer <= 0) {
              this.rehtackarPulseTimer = 1.5;
              this.clatterTimer = 0.55;
              self.callbacks?.onSound?.('rehtackar');

              const auraRadius = 160;
              const auraRadiusSq = auraRadius * auraRadius;
              for (let i = 0; i < self.livingEnemies.length; i++) {
                const ally = self.livingEnemies[i];
                if (!ally || ally === this || ally.dead || ally.isDefeated) continue;
                const adx = ally.x - this.x;
                const ady = ally.y - this.y;
                if (adx * adx + ady * ady <= auraRadiusSq) {
                  ally.rehtackarBuffTimer = 2.0;
                }
              }
            }

            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'beranek') {
            // Attack 1: Beraní trk ramming push
            this.woolBurstTimer = (typeof this.woolBurstTimer === 'number' ? this.woolBurstTimer : 4.0) - dt;
            if (this.woolBurstTimer <= 0 && dist < 240) {
              this.woolBurstTimer = 4.8;
              const pushAng = Math.atan2(player.y - this.y, player.x - this.x);
              player.x += Math.cos(pushAng) * 140;
              player.y += Math.sin(pushAng) * 140;
              self.emitDamageText(this.x, this.y - 60, 'BERANÍ TRK! 🐏💨', '#FDE047', true);
            }
            // Attack 2: Ground Slam shockwave
            this.slamCooldown = (typeof this.slamCooldown === 'number' ? this.slamCooldown : 3.2) - dt;
            if (this.slamCooldown <= 0) {
              this.slamCooldown = 4.5;
              addEnemyHazard({
                id: `hazard_beranek_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 60,
                duration: 2.0,
                maxDuration: 2.0,
                type: 'mud',
                slowFactor: 0.70,
                kind: 'ground-shockwave',
                warningTimer: 0.7,
                damage: 22,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('heavyHit');
              self.emitDamageText(this.x, this.y - 50, 'BERANÍ DUP! 🐏💥', '#FACC15', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'carodejnice_stara') {
            // Attack 1: 3-way poison projectiles
            this.emberTimer = (typeof this.emberTimer === 'number' ? this.emberTimer : 3.8) - dt;
            if (this.emberTimer <= 0) {
              this.emberTimer = 4.4;
              for (let i = 0; i < 3; i++) {
                const ang = dir + (i - 1) * 0.25;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 190,
                  vy: Math.sin(ang) * 190,
                  angle: ang,
                  speed: 190,
                  dmg: 18,
                  damage: 18,
                  type: 'poison',
                  visual: 'witch_venom',
                  radius: 8,
                  color: '#CA8A04',
                  life: 2.2,
                  maxLife: 2.2,
                  isEnemy: true,
                  pushback: 16,
                  statusText: 'ZKAŽENÉ VEJCE! 🥚',
                  dead: false,
                });
              }
            }
            // Attack 2: Broom Vane Gust Hazard
            this.gustCooldown = (typeof this.gustCooldown === 'number' ? this.gustCooldown : 3.5) - dt;
            if (this.gustCooldown <= 0) {
              this.gustCooldown = 4.2;
              addEnemyHazard({
                id: `hazard_carodejnice_stara_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 45,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'curse',
                slowFactor: 0.65,
                kind: 'witch-gust',
                warningTimer: 1.0,
                damage: 20,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 42, 'STRNIŠŤOVÝ VÍR! 🧹🌀', '#CA8A04', true);
            }
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          } else if (this.id === 'vrchni_carodejnice') {
            // Stage 3 & 4 Final Boss: Vrchní čarodějnice na tryskovém koštěti — 3 distinctive attacks
            const isPhase2 = this.hp <= (this.maxHp || 3200) * 0.5;
            if (isPhase2 && !this.enraged) {
              this.enraged = true;
              this.speed = 140;
              self.state.cameraTremorTimer = Math.max(self.state.cameraTremorTimer || 0, 0.45);
              self.emitDamageText(this.x, this.y - 110, '🔥 FILIPOJAKUBSKÁ VICHŘICE!', '#DC2626', true, 'bossAnnouncements');
              for (let i = 0; i < 2; i++) {
                const ang = (i / 2) * Math.PI * 2 + 0.4;
                self.spawnMonster('carodejnice_koste', this.x + Math.cos(ang) * 120, this.y + Math.sin(ang) * 120, 1.0);
              }
            }
            // Attack 1: Sabatové uřknutí (Spread of witch_fireball projectiles)
            this.fireVortexTimer = (typeof this.fireVortexTimer === 'number' ? this.fireVortexTimer : 2.6) - bossCdDt;
            if (this.fireVortexTimer <= 0) {
              this.fireVortexTimer = isPhase2 ? 2.6 : 3.6;
              const count = isPhase2 ? 5 : 3;
              const spread = isPhase2 ? 0.32 : 0.24;
              for (let i = 0; i < count; i++) {
                const angle = dir + (i - (count - 1) / 2) * spread;
                const projSpd = isPhase2 ? 240 : 200;
                const projDmg = isPhase2 ? 30 : 22;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(angle) * projSpd,
                  vy: Math.sin(angle) * projSpd,
                  angle,
                  speed: projSpd,
                  dmg: projDmg,
                  damage: projDmg,
                  type: 'magic',
                  visual: 'witch_fireball',
                  radius: 10,
                  color: '#A855F7',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 24,
                  statusText: 'UŘKNUTÍ! 🔮',
                  dead: false,
                });
              }
            }
            // Attack 2: Hořící smolné věnce (3 spinning fire_wreath projectiles + telegraphed pitch-wreath hazard)
            this.pitchWreathCooldown = (typeof this.pitchWreathCooldown === 'number' ? this.pitchWreathCooldown : 3.2) - bossCdDt;
            if (this.pitchWreathCooldown <= 0) {
              this.pitchWreathCooldown = isPhase2 ? 3.2 : 4.2;
              for (let k = -1; k <= 1; k++) {
                const wAng = dir + k * 0.32;
                const wSpd = 215;
                self.state.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(wAng) * wSpd,
                  vy: Math.sin(wAng) * wSpd,
                  angle: wAng,
                  speed: wSpd,
                  dmg: 24,
                  radius: 13,
                  type: 'fire',
                  visual: 'fire_wreath',
                  color: '#F97316',
                  life: 2.6,
                  maxLife: 2.6,
                  isEnemy: true,
                  pushback: 28,
                  statusText: 'OHŇOVÝ VĚNEC! 🔥',
                  dead: false,
                });
              }
              addEnemyHazard({
                id: `hazard_pitch_wreath_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: player.x,
                y: player.y,
                radius: 52,
                duration: 2.8,
                maxDuration: 2.8,
                type: 'fire',
                slowFactor: 0.65,
                kind: 'pitch-wreath',
                warningTimer: 0.85,
                damage: 26,
                sourceEnemyId: this.id,
              });
              self.callbacks?.onSound?.('curse');
              self.emitDamageText(this.x, this.y - 54, 'SMOLNÝ VĚNEC! 🔥🧹', '#F97316', true);
            }
            // Attack 3: Tryskový sabatový nálet (High-speed broomstick dash + hex circle + familiar summon)
            this.sabatDashCooldown = (typeof this.sabatDashCooldown === 'number' ? this.sabatDashCooldown : 3.8) - bossCdDt;
            this.sabatDashTimer = Math.max(0, (this.sabatDashTimer || 0) - dt);
            if (this.sabatDashCooldown <= 0) {
              this.sabatDashCooldown = isPhase2 ? 3.6 : 4.8;
              this.sabatDashTimer = 0.85;
              this.sabatDashAngle = dir;
              addEnemyHazard({
                id: `hazard_sabat_hex_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                x: this.x,
                y: this.y,
                radius: 48,
                duration: 2.2,
                maxDuration: 2.2,
                type: 'curse',
                slowFactor: 0.62,
                kind: 'hex-circle',
                warningTimer: 0.8,
                damage: 24,
                oneShot: true,
                exploded: false,
                sourceEnemyId: this.id,
              });
              if ((self.livingEnemies?.length || 0) < 35) {
                const summonId = self.state.activeLevelId === 3 ? 'cerny_pes' : 'zkazena_kraslice';
                const sAng = dir + Math.PI * 0.5;
                self.spawnMonster(summonId, this.x + Math.cos(sAng) * 85, this.y + Math.sin(sAng) * 85, 0.85);
              }
              self.callbacks?.onSound?.('swish');
              self.emitDamageText(this.x, this.y - 68, 'TRYSKOVÝ NÁLET! 🧹⚡', '#C084FC', true);
            }
            const sabatMult = this.sabatDashTimer > 0 ? 2.0 : 1.0;
            const moveDir = this.panicked
              ? dir + Math.PI
              : this.sabatDashTimer > 0 && typeof this.sabatDashAngle === 'number'
              ? this.sabatDashAngle
              : dir;
            this.vx = Math.cos(moveDir) * spd * sabatMult;
            this.vy = Math.sin(moveDir) * spd * sabatMult;
          } else if (this.id === 'ohniva_kobyla') {
            if (!this.aiState) this.aiState = 'idle';
            if (typeof this.aiTimer !== 'number') this.aiTimer = 0;
            if (typeof this.specialCd !== 'number') this.specialCd = 1.6;
            this.aiTimer -= dt;
            this.specialCd -= dt;

            if (this.panicked) {
              this.aiState = 'idle';
              this.vx = Math.cos(dir + Math.PI) * spd;
              this.vy = Math.sin(dir + Math.PI) * spd;
            } else if (this.aiState === 'windup') {
              this.vx = 0;
              this.vy = 0;
              if (this.aiTimer <= 0) {
                this.aiState = 'charge';
                this.aiTimer = 1.05;
                this.chargeSpeed = 410;
                this.sulfurTrailTimer = 0;
                self.emitDamageText(this.x, this.y - 36, 'SIRNÝ TRYSK! 🔥🐎', '#FACC15', true);
              }
            } else if (this.aiState === 'charge') {
              const cSpd = this.chargeSpeed || 410;
              const cDir = typeof this.chargeDirX === 'number' ? this.chargeDirX : dir;
              this.vx = Math.cos(cDir) * cSpd;
              this.vy = Math.sin(cDir) * cSpd;
              this.sulfurTrailTimer = (this.sulfurTrailTimer || 0) - dt;
              if (this.sulfurTrailTimer <= 0) {
                this.sulfurTrailTimer = 0.11;
                addEnemyHazard({
                  id: `hazard_sulfur_${Math.round(self.state.gameTime * 1000)}_${Math.random().toString(36).slice(2, 7)}`,
                  x: this.x,
                  y: this.y,
                  radius: 30,
                  duration: 4.0,
                  maxDuration: 4.0,
                  type: 'fire',
                  slowFactor: 0.85,
                  kind: 'sulfur-flame',
                  damage: 14,
                  enemyDamage: 28,
                  damagesEnemies: true,
                  damageInterval: 0.45,
                  damageTimer: 0.1,
                  enemyDamageTimer: 0.05,
                  sourceEnemyId: this.id,
                });
              }
              if (this.aiTimer <= 0) {
                this.aiState = 'cooldown';
                this.aiTimer = 0.7;
                this.specialCd = 3.6;
              }
            } else if (this.aiState === 'cooldown') {
              this.vx = Math.cos(dir) * (spd * 0.5);
              this.vy = Math.sin(dir) * (spd * 0.5);
              if (this.aiTimer <= 0) {
                this.aiState = 'idle';
              }
            } else {
              if (this.specialCd <= 0 && dist < 480) {
                this.aiState = 'windup';
                this.aiTimer = 0.45;
                this.chargeDirX = dir;
                this.vx = 0;
                this.vy = 0;
                self.emitDamageText(this.x, this.y - 34, 'ŘEHTÁNÍ! 🐎🔥', '#FB923C', true);
              } else {
                this.vx = Math.cos(dir) * spd;
                this.vy = Math.sin(dir) * spd;
              }
            }
          } else {
            const moveDir = this.panicked ? dir + Math.PI : dir;
            this.vx = Math.cos(moveDir) * spd;
            this.vy = Math.sin(moveDir) * spd;
          }
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

        if (this.id === 'carodejnice_koste' && !this.dead && !this.isDefeated) {
          if (Math.random() < 0.45) {
            const bankAng = Math.atan2(this.vy || 0, this.vx || 0);
            tryEmitParticle(self.state.particles, () => ({
              x: this.x - Math.cos(bankAng) * 20 + (Math.random() - 0.5) * 6,
              y: this.y - Math.sin(bankAng) * 20 - 12 + (Math.random() - 0.5) * 6,
              vx: -Math.cos(bankAng) * 35 + (Math.random() - 0.5) * 20,
              vy: -Math.sin(bankAng) * 35 - 15 - Math.random() * 20,
              life: 0.45 + Math.random() * 0.25,
              maxLife: 0.7,
              size: 2.2,
              color: Math.random() < 0.6 ? '#F97316' : '#FBBF24',
            }), self.state.meta?.performanceProfile);
          }
        }

        if (this.id === 'zkazena_kraslice' && this.fusePrimed && !this.dead) {
          this.fuseTimer -= dt;
          if (Math.random() < 0.25) {
            tryEmitParticle(self.state.particles, () => ({
              x: this.x + (Math.random() - 0.5) * 16,
              y: this.y + (Math.random() - 0.5) * 16,
              vx: (Math.random() - 0.5) * 20,
              vy: -35 - Math.random() * 20,
              life: 0.5,
              maxLife: 0.5,
              size: 2.5,
              color: '#84CC16',
            }), self.state.meta?.performanceProfile);
          }
          if (this.fuseTimer <= 0) {
            this.detonateKraslice(player);
          }
        }
      },

      detonateKraslice(player: any) {
        if (this.dead) return;
        this.dead = true;
        this.isDefeated = true;
        self.state.kills += 1;
        self.callbacks?.onEnemyDefeated?.(this);
        self.director?.recordEnemyDeath(this, self.state.gameTime);
        self.callbacks?.onSound?.('explosion');

        const blastRadius = 110;
        for (let s = 0; s < 12; s++) {
          const ang = (s / 12) * Math.PI * 2 + Math.random() * 0.2;
          const bSpd = 80 + Math.random() * 90;
          tryEmitParticle(self.state.particles, () => ({
            x: this.x,
            y: this.y,
            vx: Math.cos(ang) * bSpd,
            vy: Math.sin(ang) * bSpd,
            life: 0.6 + Math.random() * 0.4,
            maxLife: 1.0,
            size: 3.5,
            color: Math.random() < 0.5 ? '#FEF08A' : '#CA8A04',
          }), self.state.meta?.performanceProfile);
        }

        if (player && player.hp > 0) {
          const pDist = Math.hypot(player.x - this.x, player.y - this.y);
          if (pDist <= blastRadius) {
            const dmg = Math.round(45 * (1 - pDist / blastRadius));
            if (dmg > 0) {
              if (typeof player.takeDamage === 'function') {
                player.takeDamage(dmg, 'poison', this);
              } else {
                player.hp = Math.max(0, player.hp - dmg);
              }
            }
          }
        }

        for (let j = 0; j < self.livingEnemies.length; j++) {
          const foe = self.livingEnemies[j];
          if (!foe || foe === this || foe.dead) continue;
          const foeDist = Math.hypot(foe.x - this.x, foe.y - this.y);
          if (foeDist <= blastRadius) {
            const splashDmg = Math.round(95 * (1 - foeDist / blastRadius));
            if (splashDmg > 0) {
              if (typeof foe.takeDamage === 'function') {
                foe.takeDamage(splashDmg, 'physical', foe.x - this.x, foe.y - this.y);
              } else {
                foe.hp -= splashDmg;
                if (foe.hp <= 0) foe.isDefeated = true;
              }
              const kbAng = Math.atan2(foe.y - this.y, foe.x - this.x);
              foe.kbx = (foe.kbx || 0) + Math.cos(kbAng) * 160;
              foe.kby = (foe.kby || 0) + Math.sin(kbAng) * 160;
            }
          }
        }

        self.spawnYolkPuddle(this.x, this.y, 48, 5.0);
      },

      takeDamage(amount: number, type = 'physical', kbx = 0, kby = 0, options?: any) {
        kbx = typeof kbx === 'number' && Number.isFinite(kbx) ? kbx : 0;
        kby = typeof kby === 'number' && Number.isFinite(kby) ? kby : 0;
        if (this.isDefeated || this.dead || (this.id === 'zkazena_kraslice' && this.fusePrimed)) return;

        // Vichřicový: 50% šance vyhnout se jakémukoliv zranění (bič ignoruje úhyb)
        if (this.prefix === 'vichricovy' && !options?.cannotDodge && !options?.ignoreDodge) {
          const dodge = typeof this.dodgeChance === 'number' ? this.dodgeChance : 0.50;
          if (Math.random() < dodge) {
            self.emitDamageText(this.x, this.y - 25, 'MINUL! 💨', '#38BDF8', true);
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

        // Coordinated Minion-to-Boss Synergy Shield: up to 3 tethered minions grant 10% damage reduction each
        if ((this._synergyMinionCount || 0) > 0 && !options?.isSynergyBacklash) {
          const synergyRed = Math.min(0.30, (this._synergyMinionCount || 0) * 0.10);
          amount *= (1 - synergyRed);
        }

        // Říční rak a Královský Vele-rak: Čelní krunýř odráží 75-80 % poškození
        if ((this.id === 'rak_ricni' || this.id === 'kralovsky_vele_rak') && kbx !== 0) {
          const facing = (this.vx || 0) < 0 ? -1 : 1;
          const isFrontal = (facing > 0 && kbx > 0) || (facing < 0 && kbx < 0);
          if (isFrontal) {
            amount *= (this.id === 'kralovsky_vele_rak' ? 0.20 : 0.25);
            self.emitDamageText(this.x, this.y - 25, 'KRUNÝŘ! 🛡️', '#0EA5E9', true);
          }
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
        effectiveResist = Math.min(0.90, Math.max(0, effectiveResist * (1 - ignoreResist)));

        let finalDamage = Math.max(1, amount * (1 - effectiveResist));
        if (self.state.player?.snackBonusDmg && ((this.snackTimer || 0) > 0 || this.statusEffects.pickle_sickness) && type !== 'food') {
          finalDamage *= (1 + self.state.player.snackBonusDmg);
        }
        if (type === 'holy') {
          const holyMult = (self.state.player?.holyDamageMultiplier) || (1 + Math.max(0, self.state.meta?.churchLevel || 0) * 0.08);
          finalDamage *= holyMult;
        }
        finalDamage += (self.state.meta?.forgeLevel || 0) * 2;
        const critChanceBonus = options?.critChanceBonus || 0;
        const customCritDamageMult = options?.critDamageMult || 0;
        const critKnockbackMult = options?.critKnockbackMult || 1;
        let isCriticalHit = Boolean(options?.isCrit || options?.isCritical);
        if (self.state.player && self.state.player.guaranteedCritTimer > 0) {
          isCriticalHit = true;
          const supinaBonus = (self.state.player.kominickaSupinaStacks || 0) * 0.25;
          const critMult = Math.max(2.2, customCritDamageMult) + supinaBonus;
          finalDamage = Math.round(finalDamage * critMult);
          self.emitDamageText(this.x, this.y - 48, 'KRITICKÝ ZÁSAH! ✨', '#FDE047', true);
        } else if (self.state.player) {
          let critChance = Math.max(0, self.state.player.luck ?? 0) * 0.001 + critChanceBonus;
          if ((self.state.player.zPeklaStestiTimer || 0) > 0) {
            critChance += 0.10;
          }
          if ((self.state.player.cinovyTercStacks || 0) > 0 && this.hp >= (this.maxHp || 0)) {
            critChance *= 2.0 + (self.state.player.cinovyTercStacks - 1) * 0.5;
          }
          if (isCriticalHit || Math.random() < critChance) {
            isCriticalHit = true;
            const supinaBonus = (self.state.player.kominickaSupinaStacks || 0) * 0.25;
            const baseCritMult = customCritDamageMult > 0 ? customCritDamageMult : 1.65;
            const critMult = baseCritMult + supinaBonus;
            finalDamage = Math.round(finalDamage * critMult);
            const critText = options?.source === 'dreveny_cep' ? 'KRITICKÝ MLAT! 💥' : 'ŠŤASTNÝ ZÁSAH! 🎯';
            self.emitDamageText(this.x, this.y - 48, critText, '#FBBF24', true);
          }
        } else if (isCriticalHit) {
          const baseCritMult = customCritDamageMult > 0 ? customCritDamageMult : 1.65;
          finalDamage = Math.round(finalDamage * baseCritMult);
        }

        if (isCriticalHit && self.state.particles) {
          tryEmitLadaComicPopup(self.state.particles, this.x, this.y, undefined, 'combat');
        }

        if (isCriticalHit && self.state.player) {
          const now = self.state.gameTime;
          const p = self.state.player;

          // 1. Kominická šupina z kapra
          if ((p.kominickaSupinaStacks || 0) > 0) {
            if (now - (p._lastSupinaTime || 0) >= 0.8) {
              p._lastSupinaTime = now;
              const rollChance = Math.min(1.0, Math.max(0, p.luck || 100) * 0.0008 * p.kominickaSupinaStacks);
              if (Math.random() < rollChance) {
                self.triggerSupinaLuckyHarvest(this.x, this.y);
              }
            }
          }

          // 2. Jetelový čtyřlístek z mezí
          if ((p.jetelovyCtyrlistekStacks || 0) > 0) {
            if (now - (p._lastCtyrlistekTime || 0) >= 0.5) {
              p._lastCtyrlistekTime = now;
              p.zPeklaStestiTimer = 2.5;
              p.ultCd = Math.max(0, (p.ultCd || 0) - 0.25 * p.jetelovyCtyrlistekStacks);
              self.emitDamageText(p.x, p.y - 40, 'Z PEKLA ŠTĚSTÍ! 🍀', '#10B981', true);
            }
          }

          // 3. Cínový střelecký terč ze střelnice
          if ((p.cinovyTercStacks || 0) > 0) {
            if (now - (p._lastTercTime || 0) >= 0.2) {
              p._lastTercTime = now;
              const tercStacks = p.cinovyTercStacks || 1;
              const tercRadius = 95 + (tercStacks - 1) * 20;
              const splashRatio = 0.35 + (tercStacks - 1) * 0.15;
              const splashDmg = Math.max(1, Math.round(finalDamage * splashRatio));
              const splashNearby = self.spatialHash.queryRadius(this.x, this.y, tercRadius);
              for (let i = 0; i < splashNearby.length; i++) {
                const foe = splashNearby[i];
                if (foe === this || foe.isDefeated || foe.dead) continue;
                foe.takeDamage(splashDmg, 'area', 0, 0);
                if (typeof foe.interruptAttack === 'function') foe.interruptAttack();
              }
              self.emitDamageText(this.x, this.y - 30, 'POUŤOVÝ TŘESK! 🎯', '#F59E0B', false);
            }
          }
        }

        if (!isCriticalHit && isJezinkaSemiVisible(this)) {
          finalDamage *= JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER;
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
            self.emitDamageText(this.x, this.y - 45, `BLESKOVÝ ODRAZ! -${reflect} ⚡`, '#FDE047', true);
          }
        }

        if (kbx !== 0 || kby !== 0) {
          const effectiveCritKbMult = isCriticalHit ? Math.max(1, critKnockbackMult) : 1;
          const finalKbx = kbx * effectiveCritKbMult;
          const finalKby = kby * effectiveCritKbMult;
          if (this.prefix === 'kamenny') {
            const stoneFactor = isCriticalHit && effectiveCritKbMult > 1 ? 0.30 : 0.15;
            this.kbx += finalKbx * stoneFactor;
            this.kby += finalKby * stoneFactor;
          } else {
            const critPoisePierce = isCriticalHit && effectiveCritKbMult > 1 ? 0.35 : 0;
            const poiseRed = (self.state.player?.plumPoiseReduction || 0) + critPoisePierce;
            const poise = Math.max(0, (this.poiseResist || 0) - poiseRed);
            const kbFactor = Math.max(0.15, 1 - poise);
            this.kbx += finalKbx * kbFactor;
            this.kby += finalKby * kbFactor;
            if (isCriticalHit && effectiveCritKbMult > 1.5 && options?.source === 'dreveny_cep') {
              const stunResist = this.willpower || 0;
              this.stunTimer = Math.max(this.stunTimer || 0, 0.45 * (1 - stunResist));
            }
            this.interruptAttack();
          }
        }

        if (finalDamage >= (this.maxHp || 40) * 3) {
          this.overkill = true;
        }

        if (this.hp <= 0) {
          if (this.id === 'zkazena_kraslice') {
            if (this.fusePrimed) return;
            this.hp = 0;
            this.fusePrimed = true;
            this.fuseTimer = 1.2;
            this.isDefeated = false;
            this.dead = false;
            self.callbacks?.onSound?.('fuse');
            return;
          }
          this.hp = 0;
          this.isDefeated = true;
          if ((this.isBoss || this.isMiniboss || this.category === 'bosses') && self.state.particles) {
            tryEmitLadaComicPopup(self.state.particles, this.x, this.y, 'PRÁSK!', 'combat');
          }
          // Tether Backlash: Defeating a minion tethered to a Boss/Miniboss shocks the Boss!
          if (this._tetheredBoss && !this._tetheredBoss.dead && !this._tetheredBoss.isDefeated) {
            const boss = this._tetheredBoss;
            this._tetheredBoss = null;
            boss._synergyMinionCount = Math.max(0, (boss._synergyMinionCount || 1) - 1);
            if (typeof boss.takeDamage === 'function') {
              boss.takeDamage(35, 'holy', 0, 0, { isSynergyBacklash: true, stunDuration: 0.6 });
            } else {
              boss.hp = Math.max(0, (boss.hp || 100) - 35);
            }
            self.emitDamageText(boss.x, boss.y - 52, '⚡ POUTO PŘETRŽENO! -35', '#38BDF8', true);
          }
          if (this.id === 'pampeliska_chmyri' && !this.hasSplit) {
            this.hasSplit = true;
            const isCleanDispersal = Boolean(
              this.overkill ||
              options?.isPiercing ||
              options?.pierce ||
              type === 'fire' ||
              type === 'area' ||
              type === 'explosive' ||
              type === 'holy'
            );
            if (isCleanDispersal) {
              self.emitDamageText(this.x, this.y - 25, 'ROZPRÁŠENO! 💨', '#E0F2FE', false);
            } else {
              self.emitDamageText(this.x, this.y - 25, 'ROZLÉTNUTÍ! 🌼', '#FEF08A', false);
              const baseAngle = Math.atan2(this.vy || 0, this.vx || 1);
              for (let i = 0; i < 3; i++) {
                const spreadAngle = baseAngle + (i - 1) * (Math.PI * 0.45);
                const spawnDist = 12;
                const child = self.spawnMonster(
                  'pampeliska_chmyricko',
                  this.x + Math.cos(spreadAngle) * spawnDist,
                  this.y + Math.sin(spreadAngle) * spawnDist,
                  1.0
                );
                if (child) {
                  child.kbx = Math.cos(spreadAngle) * 160;
                  child.kby = Math.sin(spreadAngle) * 160;
                }
              }
            }
          }
          if (this.id === 'carodejnice_zaspalka') {
            if (self.director && Array.isArray(self.director.hazards)) {
              self.director.hazards = self.director.hazards.filter(
                (h: any) => h.sourceEnemyId !== 'carodejnice_zaspalka' && h.kind !== 'ink-smoke'
              );
              if (self.state.activeHazards) {
                self.state.activeHazards = self.director.hazards;
              }
            }
            self.spawnDrop('chest', this.x, this.y, { text: '🎁 POKLAD ČARODĚJNICE ZASPALKY!' });
            self.emitDamageText(this.x, this.y - 40, 'ZASPALKA ZAŽEHÁNA! 🧹', '#F59E0B', true);
          }
          if (this.isCarryingLootBundle && Array.isArray(this.carryingLootBundle) && this.carryingLootBundle.length > 0) {
            restoreStolenBundleDrops(this, self.state.drops, self.state.pendingDropBank);
          }
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

          if (Array.isArray(this.cheekPouchDrops) && this.cheekPouchDrops.length > 0) {
            for (let ci = 0; ci < this.cheekPouchDrops.length; ci++) {
              const item = this.cheekPouchDrops[ci];
              const ang = (ci / this.cheekPouchDrops.length) * Math.PI * 2;
              self.spawnDrop(item.type || 'coin', this.x + Math.cos(ang) * 18, this.y + Math.sin(ang) * 18, {
                value: (item.value || 1) + 2,
                speed: 85,
              });
            }
            this.cheekPouchDrops.length = 0;
            self.emitDamageText(this.x, this.y - 34, 'VYKLOPil LÍCE! 🐹🌾', '#FBBF24', true);
          }

          if (this.id === 'kralovsky_vele_rak' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🦞 POKLAD KRÁLOVSKÉHO VELE-RAKA!' });
            self.emitDamageText(this.x, this.y - 40, 'VELE-RAK POKOŘEN! 🦞', '#0EA5E9', true);
          }
          if (this.id === 'cert_sekac' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '😈 POKLAD PEKELNÉHO ČERTA SEKÁČE!' });
            self.emitDamageText(this.x, this.y - 40, 'ČERT SEKÁČ ZAŽEHÁN! 😈', '#DC2626', true);
          }
          if (this.id === 'krecek_obilnik' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🐹 POKLAD KRÁLE KŘEČKŮ OBILNÍKA!' });
            self.emitDamageText(this.x, this.y - 40, 'KRÁL KŘEČKŮ OBILNÍK PŘEMOŽEN! 🐹🌾', '#F59E0B', true);
          }
          if (this.id === 'zitna_matka' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🌾 POKLAD ŽITNÉ MATKY!' });
            self.emitDamageText(this.x, this.y - 40, 'ŽITNÁ MATKA ZAŽEHNÁNA! 🌾☀️', '#FACC15', true);
          }
          if (this.id === 'bila_pani' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '👻 POKLAD BÍLÉ PANÍ!' });
            self.emitDamageText(this.x, this.y - 40, 'BÍLÁ PANÍ VYSVOBOZENA! 👻✨', '#E0F2FE', true);
          }
          if (this.id === 'bezhlavy_rytir' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🗡️ POKLAD BEZHLAVÉHO RYTÍŘE!' });
            self.emitDamageText(this.x, this.y - 40, 'BEZHLAVÝ RYTÍŘ POKOŘEN! 🗡️⚡', '#38BDF8', true);
          }
          if (this.id === 'kralovsky_cmelak' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🐝 POKLAD KRÁLOVSKÉHO ČMELÁKA!' });
            self.emitDamageText(this.x, this.y - 40, 'KRÁLOVSKÝ ČMELÁK ZAŽEHNÁN! 🐝🌾', '#FBBF24', true);
          }
          if (this.id === 'zlatohlavek_zrout' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🪲 POKLAD NENAŽRANÉHO ZLATOHLÁVKA!' });
            self.emitDamageText(this.x, this.y - 40, 'ZLATOHLÁVEK ŽROUT POKOŘEN! 🪲🍏', '#22C55E', true);
          }
          if (this.id === 'netopyr_usatec' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🦇 POKLAD UŠATÉHO NETOPÝRA!' });
            self.emitDamageText(this.x, this.y - 40, 'NETOPÝR UŠATEC ZAŽEHNÁN! 🦇🌙', '#C084FC', true);
          }
          if (this.id === 'kralovsky_srsen' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🐝 POKLAD KRÁLOVSKÉHO SRŠNĚ!' });
            self.emitDamageText(this.x, this.y - 40, 'KRÁLOVSKÝ SRŠEŇ ZE SADU ZAŽEHNÁN! 🐝🍑', '#F59E0B', true);
          }
          if (this.id === 'povidlovy_cert' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🥄 POKLAD POVIDLOVÉHO ČERTA!' });
            self.emitDamageText(this.x, this.y - 40, 'POVIDLOVÝ ČERT S MĚCHAČKOU POKOŘEN! 🥄🍑', '#A855F7', true);
          }
          if (this.id === 'kralovsky_havran' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🦅 POKLAD KRÁLOVSKÉHO HAVRANA!' });
            self.emitDamageText(this.x, this.y - 40, 'KRÁLOVSKÝ HAVRAN ZAŽEHNÁN! 🦅🍂', '#94A3B8', true);
          }
          if (this.id === 'hastrman_podzimni' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🐸 POKLAD PODZIMNÍHO HASTRMANA!' });
            self.emitDamageText(this.x, this.y - 40, 'PODZIMNÍ HASTRMAN POKOŘEN! 🐸💧', '#10B981', true);
          }
          if (this.id === 'dusickova_bludicka' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🕯️ POKLAD DUŠIČKOVÉ BLUDIČKY!' });
            self.emitDamageText(this.x, this.y - 40, 'DUŠIČKOVÁ BLUDIČKA UKONEJŠENA! 🕯️✨', '#38BDF8', true);
          }
          if (this.id === 'cert_rybnikar' && (this.isMiniboss || this.isBoss)) {
            self.spawnDrop('chest', this.x, this.y, { text: '🐟 POKLAD PEKELNÉHO ČERTA RYBNÍKÁŘE!' });
            self.emitDamageText(this.x, this.y - 40, 'ČERT RYBNÍKÁŘ S PODBĚRÁKEM ZAHNÁN! 🐟🔥', '#EF4444', true);
          }

          const curLvlId = self.state.activeLevelId !== undefined ? self.state.activeLevelId : 0;
          const curLvl = GAME_LEVELS[curLvlId];
          if (this.isBoss && curLvl && this.id === curLvl.finalBoss.id) {
            let canTriggerVictory = true;
            if (this.isTrioMember || this.id === 'ledovi_muzi') {
              const livingTrio = self.livingEnemies.filter(
                (e: any) => (e.isTrioMember || e.id === 'ledovi_muzi') && !e.isDefeated && !e.dead && e !== this
              );
              canTriggerVictory = livingTrio.length === 0;
            }
            if (canTriggerVictory) {
              self.state.levelVictoryTriggered = true;
              if (self.director && Array.isArray(self.director.hazards)) {
                self.director.hazards = self.director.hazards.filter(
                  (h: any) => h.sourceEnemyId !== this.id && h.sourceEnemyId !== 'ledovi_muzi' && h.type !== 'frost' && h.kind !== 'hail-circle'
                );
                if (self.state.activeHazards) {
                  self.state.activeHazards = self.director.hazards;
                }
              }
              if (self.state.drops) {
                for (let di = 0; di < self.state.drops.length; di++) {
                  const d = self.state.drops[di];
                  if (d) {
                    d.isFrozen = false;
                    d.freezeTimer = 0;
                  }
                }
              }
              if (this.id === 'morana') {
                self.spawnDrop('chest', this.x, this.y, { text: '❄️ POKLAD ZIMNÍ VLÁDKYNĚ MORANY!' });
                self.emitDamageText(this.x, this.y - 50, 'MORANA PŘEMOŽENA! ZIMA KONČÍ! ❄️✨', '#38BDF8', true);
              } else if (this.id === 'vrchni_carodejnice') {
                self.spawnDrop('chest', this.x, this.y, { text: '🧙‍♀️ POKLAD VRCHNÍ ČARODĚJNICE!' });
                self.emitDamageText(this.x, this.y - 50, 'VRCHNÍ ČARODĚJNICE PŘEMOŽENA! 🧹🔥', '#A855F7', true);
              } else if (this.id === 'ledovi_muzi') {
                self.spawnDrop('chest', this.x, this.y, { text: '👑 POKLAD LEDOVÝCH MUŽŮ!' });
                self.emitDamageText(this.x, this.y - 50, 'LEDOVÍ MUŽI PŘEMOŽENI! 🌸', '#F59E0B', true);
              } else if (this.id === 'hejkal') {
                self.spawnDrop('chest', this.x, this.y, { text: '🌲 POKLAD PŮLNOČNÍHO HEJKALA!' });
                self.emitDamageText(this.x, this.y - 50, 'PŮLNOČNÍ HEJKAL PŘEMOŽEN! 🌲🪵', '#16A34A', true);
              } else if (this.id === 'kralovska_polednice') {
                self.spawnDrop('chest', this.x, this.y, { text: '👑 POKLAD KRÁLOVSKÉ POLEDNICE!' });
                self.emitDamageText(this.x, this.y - 50, 'KRÁLOVSKÁ POLEDNICE PŘEMOŽENA! 🌾', '#F59E0B', true);
              } else if (this.id === 'svatojansky_vladce') {
                self.spawnDrop('chest', this.x, this.y, { text: '🌿 POKLAD SVATOJÁNSKÉHO VLÁDCE HVOZDU!' });
                self.emitDamageText(this.x, this.y - 50, 'SVATOJÁNSKÝ VLÁDCE PŘEMOŽEN! 🌿✨', '#10B981', true);
              } else if (this.id === 'hromotluk_marketa') {
                self.spawnDrop('chest', this.x, this.y, { text: '🎪 POKLAD POUŤOVÉHO HROMOTLUKA!' });
                self.emitDamageText(this.x, this.y - 50, 'POUŤOVÝ HROMOTLUK PŘEMOŽEN! 🎪🌾', '#F59E0B', true);
              } else if (this.id === 'drak') {
                self.spawnDrop('chest', this.x, this.y, { text: '🐉 POKLAD TŘÍHLAVÉHO DRAKA!' });
                self.emitDamageText(this.x, this.y - 50, 'TŘÍHLAVÝ DRAK POKOŘEN! 🐉⚡', '#FACC15', true);
              } else if (this.id === 'dozinkovy_chasnik') {
                self.spawnDrop('chest', this.x, this.y, { text: '🌾 POKLAD DOŽÍNKOVÉHO CHASNÍKA!' });
                self.emitDamageText(this.x, this.y - 50, 'DOŽÍNKOVÝ CHASNÍK PŘEMOŽEN! 🌾👑', '#F59E0B', true);
              } else if (this.id === 'vyr_velky') {
                self.spawnDrop('chest', this.x, this.y, { text: '🦉 POKLAD VÝRA VELKÉHO!' });
                self.emitDamageText(this.x, this.y - 50, 'VÝR VELKÝ POKOŘEN! 🦉✨', '#FBBF24', true);
              } else if (this.id === 'posvicensky_hospodar') {
                self.spawnDrop('chest', this.x, this.y, { text: '🥧 POKLAD POSVÍCENSKÉHO HOSPODÁŘE!' });
                self.emitDamageText(this.x, this.y - 50, 'POSVÍCENSKÝ HOSPODÁŘ PŘEMOŽEN! 🥧🍺', '#F59E0B', true);
              } else if (this.id === 'kvilici_meluzina') {
                self.spawnDrop('chest', this.x, this.y, { text: '🌪️ POKLAD KVÍLÍCÍ MELUZÍNY!' });
                self.emitDamageText(this.x, this.y - 50, 'KVÍLÍCÍ MELUZÍNA UKONEJŠENA! 🌪️🕯️', '#38BDF8', true);
              } else if (this.id === 'drak_vetrnik') {
                self.spawnDrop('chest', this.x, this.y, { text: '🪁 POKLAD HRUSICKÉHO DRAKA VĚTRNÍKA!' });
                self.emitDamageText(this.x, this.y - 50, 'DRAK VĚTRNÍK ZDOLÁN! DRAKIÁDA VRCHOLÍ! 🪁🍂', '#F97316', true);
              } else if (this.id === 'vele_stika') {
                self.spawnDrop('chest', this.x, this.y, { text: '🐟 POKLAD HRUSICKÉ VELEŠTIKY!' });
                self.emitDamageText(this.x, this.y - 50, 'HRUSICKÁ VELEŠTIKA VYLOVENA! VÝLOV DOKONČEN! 🐟💧', '#0EA5E9', true);
              } else if (this.id === 'listopadovy_mrazivec') {
                self.spawnDrop('chest', this.x, this.y, { text: '❄️ POKLAD LISTOPADOVÉHO MRAZIVCE!' });
                self.emitDamageText(this.x, this.y - 50, 'LISTOPADOVÝ MRAZIVEC ZAŽENÁN! ❄️🍂', '#38BDF8', true);
              } else if (this.id === 'jezdec_meluziny') {
                self.spawnDrop('chest', this.x, this.y, { text: '🌪️ POKLAD JEZDCE MELUZÍNY!' });
                self.emitDamageText(this.x, this.y - 50, 'JEZDEC MELUZÍNY ROZPRÁŠEN! 🌪️🌲', '#94A3B8', true);
              } else if (this.id === 'kral_mrazik') {
                self.spawnDrop('chest', this.x, this.y, { text: '👑 POKLAD KRÁLE MRÁZÍKA!' });
                self.emitDamageText(this.x, this.y - 50, 'KRÁL MRÁZÍK PŘEMOŽEN! ADVENT VRCHOLÍ! 👑❄️', '#38BDF8', true);
              } else if (this.id === 'vladce_chumelenice') {
                self.spawnDrop('chest', this.x, this.y, { text: '⛄ POKLAD VLÁDCE CHUMELENICE!' });
                self.emitDamageText(this.x, this.y - 50, 'VLÁDCE CHUMELENICE ZDOLÁN! ❄️⛄', '#E2E8F0', true);
              } else if (this.id === 'perchta_s_nozem') {
                self.spawnDrop('chest', this.x, this.y, { text: '🗡️ POKLAD ŠEREDNÉ PERCHTY!' });
                self.emitDamageText(this.x, this.y - 50, 'ŠEREDNÁ PERCHTA ZAŽENÁNA! PŮST DODRŽEN! 🗡️❄️', '#EF4444', true);
              } else if (this.id === 'rychtar_masek') {
                self.spawnDrop('chest', this.x, this.y, { text: '👑 POKLAD RYCHTÁŘE MAŠKAR!' });
                self.emitDamageText(this.x, this.y - 50, 'RYCHTÁŘ MAŠKAR UCTĚN! MASOPUST VRCHOLÍ! 👑🎭', '#F59E0B', true);
              } else if (this.id === 'bakchus_s_pivnim_soudkem') {
                self.spawnDrop('chest', this.x, this.y, { text: '🍺 POKLAD BAKCHA S PIVNÍM SOUDKEM!' });
                self.emitDamageText(this.x, this.y - 50, 'BAKCHUS PŘEMOŽEN! CELOROČNÍ CYKLUS DOKONČEN! 🍺👑🎉', '#EAB308', true);
              } else {
                self.spawnDrop('chest', this.x, this.y, { text: '👑 POKLAD VLÁDCE OBLASTI!' });
                self.emitDamageText(this.x, this.y - 50, 'VLÁDCE PŘEMOŽEN! 👑', '#F59E0B', true);
              }

              if (self.state.meta) {
                const nextLvlId = (curLvlId + 1) as GameLevelId;
                const canUnlockNext = nextLvlId <= 23;
                const nextHighest = canUnlockNext
                  ? Math.max(self.state.meta.highestLevelUnlocked || 1, nextLvlId)
                  : (self.state.meta.highestLevelUnlocked || 1);
                self.state.meta.highestLevelUnlocked = nextHighest;
                self.state.meta.completedLevels = {
                  ...(self.state.meta.completedLevels || {}),
                  [curLvlId]: true,
                };
                if (!self.state.meta.bestiaryKills) self.state.meta.bestiaryKills = {};
                self.state.meta.bestiaryKills[this.id] = (self.state.meta.bestiaryKills[this.id] || 0) + 1;
              }
              self.callbacks?.onVictory?.(curLvlId, 'boss');
            }
          }
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
      this.upgradeWeapon('bylinkova_fajfka');
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
      p.gingerbreadHeartCdMult = (1 + ((p.poutoveSrdceStacks || 1) - 1) * 0.35) * (effect.cdReductionMult || 1);
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
    if (effect.type === 'kominicka_supina' || item.id === 'kominicka_supina') {
      const luckBonus = 'luckBonus' in effect ? effect.luckBonus : 8;
      p.luck = (p.luck || 100) + luckBonus;
      p.kominickaSupinaStacks = Math.min(3, (p.kominickaSupinaStacks || 0) + 1);
    }
    if (effect.type === 'jetelovy_ctyrlistek' || item.id === 'jetelovy_ctyrlistek') {
      p.jetelovyCtyrlistekStacks = Math.min(3, (p.jetelovyCtyrlistekStacks || 0) + 1);
    }
    if (effect.type === 'cinovy_strelecky_terc' || item.id === 'cinovy_strelecky_terc') {
      p.cinovyTercStacks = Math.min(4, (p.cinovyTercStacks || 0) + 1);
    }
    if (effect.type === 'vrbova_pistalka' || item.id === 'vrbova_pistalka') {
      const dodgeBonus = 'dodgeBonus' in effect ? effect.dodgeBonus : 0.06;
      p.vrbovaPistalkaStacks = Math.min(3, (p.vrbovaPistalkaStacks || 0) + 1);
      p.dodgeChance = Math.min(0.60, (p.dodgeChance || 0) + dodgeBonus);
    }
    if (effect.type === 'lojem_mazane_krpce' || item.id === 'lojem_mazane_krpce') {
      const dodgeBonus = 'dodgeBonus' in effect ? effect.dodgeBonus : 0.05;
      p.lojemMazaneKrpceStacks = Math.min(3, (p.lojemMazaneKrpceStacks || 0) + 1);
      p.dodgeChance = Math.min(0.60, (p.dodgeChance || 0) + dodgeBonus);
    }
    if (item.id === 'zejdlik_piva' || item.id === 'panak_koralky' || item.id === 'tepla_cikorka') {
      if ((p.pivniTacekStacks || 0) > 0) {
        this.triggerPivniTacekEffect(p);
      }
    }
  }

  public triggerSupinaLuckyHarvest(x: number, y: number): void {
    let closestDrop: GameDrop | null = null;
    let closestDistSq = 350 * 350;

    if (this.state.drops) {
      for (let i = 0; i < this.state.drops.length; i++) {
        const d = this.state.drops[i];
        if (d.type === 'gingerbread' && !d.dead) {
          const distSq = (d.x - x) * (d.x - x) + (d.y - y) * (d.y - y);
          if (distSq < closestDistSq) {
            closestDistSq = distSq;
            closestDrop = d;
          }
        }
      }
    }

    if (closestDrop) {
      if (!closestDrop.size || closestDrop.size === 'small') {
        closestDrop.size = 'large';
        closestDrop.value = (closestDrop.value || 1) * 3;
      } else if (closestDrop.size === 'large') {
        closestDrop.size = 'giant';
        closestDrop.value = (closestDrop.value || 3) * 3;
      } else {
        closestDrop.size = 'stash';
        closestDrop.value = (closestDrop.value || 9) * 2;
      }
      this.callbacks?.onSound?.('bell');
      this.emitDamageText(closestDrop.x, closestDrop.y - 25, 'POVÝŠENO! 🐟', '#FBBF24', true);
    } else {
      this.spawnDrop('coin', x, y, { value: 2, speed: 65 });
      this.callbacks?.onSound?.('coin');
      this.emitDamageText(x, y - 35, 'ŠUPINA DALA KREJCAR! 🐟', '#FDE047', true);
    }
  }

  public spawnPlumPuddle(x: number, y: number, slowRatio = 0.35): void {
    if (!this.state.plumPuddles) {
      this.state.plumPuddles = [];
    }
    if (this.state.plumPuddles.length < 32) {
      this.state.plumPuddles.push({
        x,
        y,
        radius: 44,
        life: 6.5,
        maxLife: 6.5,
        slowRatio,
        dead: false,
      });
    } else {
      const idx = (this.state.plumPuddlesHead || 0) % 32;
      this.state.plumPuddlesHead = (idx + 1) % 32;
      const slot = this.state.plumPuddles[idx];
      slot.x = x;
      slot.y = y;
      slot.radius = 44;
      slot.life = 6.5;
      slot.maxLife = 6.5;
      slot.slowRatio = slowRatio;
      slot.dead = false;
    }
    this.emitDamageText(x, y - 25, 'POVIDLÍ! 🍯', '#A855F7', false);
  }

  public spawnYolkPuddle(x: number, y: number, radius = 48, duration = 5.0): void {
    if (!this.state.yolkPuddles) {
      this.state.yolkPuddles = [];
    }
    if (this.state.yolkPuddles.length < 32) {
      this.state.yolkPuddles.push({
        x,
        y,
        radius,
        life: duration,
        maxLife: duration,
        damageTimer: 0.5,
        dead: false,
      });
    } else {
      const idx = (this.state.yolkPuddlesHead || 0) % 32;
      this.state.yolkPuddlesHead = (idx + 1) % 32;
      const slot = this.state.yolkPuddles[idx];
      slot.x = x;
      slot.y = y;
      slot.radius = radius;
      slot.life = duration;
      slot.maxLife = duration;
      slot.damageTimer = 0.5;
      slot.dead = false;
    }
    this.emitDamageText(x, y - 25, 'SÍRA! 🥚', '#FACC15', false);
  }

  public triggerGoatBell(player: any): void {
    const rad = player.goatBellRadius || 180;
    this.callbacks?.onSound?.('bell');
    this.emitDamageText(player.x, player.y - 45, 'CINK! 🔔', '#FDE047', true);

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
      this.emitDamageText(foe.x, foe.y - 25, 'VYRUŠENÍ! 🔔', '#F8FAFC', false);
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
    const stacks = Math.max(1, player.pivniTacekStacks || 1);
    const cdBoost = 1.35 + (stacks - 1) * 0.15;
    player.pivniTacekTimer = 6 + (stacks - 1) * 1.5;
    if (player.weapons) {
      for (let i = 0; i < player.weapons.length; i++) {
        const w = player.weapons[i];
        if (w.cd > 0) w.cd /= cdBoost;
      }
    }
    const pctLabel = Math.round((cdBoost - 1) * 100);
    this.emitDamageText(player.x, player.y - 85, '„TENHLE ÚČET ZAPLATÍ BUBÁCI! 🍺“', '#F59E0B', true);
    this.emitDamageText(player.x, player.y - 55, `ROZOHNĚNÍ: +${pctLabel} % RYCHLEJŠÍ NABÍJENÍ! ⚡`, '#38BDF8', true);

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

    const brawlDuration = 3.5 + (stacks - 1) * 1.0;
    for (let i = 0; i < sortedEnemies.length; i++) {
      const foe = sortedEnemies[i];
      foe.brawlTimer = Math.max(foe.brawlTimer || 0, brawlDuration);
      this.spawnDrop('coin', foe.x, foe.y, { value: 1, speed: 75, skipConsolidation: true });
      this.emitDamageText(foe.x, foe.y - 25, '+1 🪙', '#FBBF24', false);
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

  public interactWithEnemyHazards(x: number, y: number, radius: number, dmgType = 'physical'): number {
    const hazards = this.director?.hazards;
    if (!Array.isArray(hazards) || hazards.length === 0) return 0;

    const isFireOrHoly = dmgType === 'fire' || dmgType === 'holy' || dmgType === 'explosive';
    const isWaterOrIce = dmgType === 'water' || dmgType === 'ice';
    const isHeavyBreak = isFireOrHoly || dmgType === 'blunt' || dmgType === 'area';

    let cleared = 0;
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      if (!h) continue;
      const dist = Math.hypot(h.x - x, h.y - y);
      if (dist > radius + (h.radius || 32)) continue;

      const isTrapHazard =
        h.kind === 'water-jar-trap' ||
        h.kind === 'root-snare' ||
        h.kind === 'chain-shackle' ||
        h.kind === 'hex-circle' ||
        h.kind === 'straw-effigy' ||
        h.kind === 'soot-cloud';
      const canCleanseFrostOrCurse =
        isFireOrHoly && (h.type === 'frost' || h.type === 'ice' || h.type === 'curse' || isTrapHazard);
      const canExtinguishFire =
        isWaterOrIce && (h.type === 'fire' || h.type === 'soot');
      const canSmashTrap = isHeavyBreak && isTrapHazard;

      if (canCleanseFrostOrCurse || canExtinguishFire || canSmashTrap) {
        hazards.splice(i, 1);
        cleared++;
        const feedbackText = canExtinguishFire
          ? 'UHAŠENO! 💧'
          : isTrapHazard
          ? 'PAST ROZBITA! 💥'
          : 'OČIŠTĚNO! ✨';
        const feedbackColor = canExtinguishFire ? '#38BDF8' : '#FDE047';
        this.emitDamageText(h.x, h.y - 24, feedbackText, feedbackColor, true);

        // Destroying a boss's trap hazard inflicts backlash damage and mini-stagger on the caster
        if (isTrapHazard && h.sourceEnemyId && this.state.enemies) {
          for (let ei = 0; ei < this.state.enemies.length; ei++) {
            const boss = this.state.enemies[ei];
            if (boss && !boss.dead && !boss.isDefeated && boss.id === h.sourceEnemyId) {
              if (typeof boss.takeDamage === 'function') {
                boss.takeDamage(30, 'holy', 0, 0, { isSynergyBacklash: true, stunDuration: 0.45 });
              } else {
                boss.hp = Math.max(0, (boss.hp || 100) - 30);
              }
              this.emitDamageText(boss.x, boss.y - 48, 'ZPĚTNÝ RÁZ PASTI! -30 💥', '#F59E0B', true);
              break;
            }
          }
        }
      }
    }
    return cleared;
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
          visualOnly: !!s.visualOnly,
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
          visualOnly: !!s.visualOnly,
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
      const originX = impact.originX ?? this.state.player?.x ?? impact.x;
      const originY = impact.originY ?? this.state.player?.y ?? impact.y;
      const baseKb = impact.baseKnockback ?? 360;
      const kbMult = impact.knockbackMult ?? 1;
      const hasDamageOptions =
        Boolean(impact.stunDuration) ||
        Boolean(impact.critChanceBonus) ||
        Boolean(impact.critDamageMult) ||
        Boolean(impact.critKnockbackMult) ||
        Boolean(impact.ignoreResist) ||
        Boolean(impact.weaponId);
      const damageOptions = hasDamageOptions
        ? {
            ...(impact.stunDuration ? { stunDuration: impact.stunDuration } : {}),
            ...(impact.critChanceBonus ? { critChanceBonus: impact.critChanceBonus } : {}),
            ...(impact.critDamageMult ? { critDamageMult: impact.critDamageMult } : {}),
            ...(impact.critKnockbackMult ? { critKnockbackMult: impact.critKnockbackMult } : {}),
            ...(impact.ignoreResist ? { ignoreResist: impact.ignoreResist } : {}),
            ...(impact.weaponId ? { source: impact.weaponId } : {}),
          }
        : undefined;

      const levelId = this.state.activeLevelId ?? 0;
      const decor = this.state.decor;
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dx = e.x - impact.x;
        const dy = e.y - impact.y;
        const reach = radius + (e.radius || 15);
        if (dx * dx + dy * dy <= reach * reach) {
          if (!hasTerrainLineOfSight(impact.x, impact.y, e.x, e.y, levelId, decor)) continue;
          let kdx = e.x - originX;
          let kdy = e.y - originY;
          let kdist = Math.hypot(kdx, kdy);
          if (kdist < 0.001) {
            kdx = impact.x - originX;
            kdy = impact.y - originY;
            kdist = Math.hypot(kdx, kdy);
          }
          const nx = kdist > 0.001 ? kdx / kdist : 1;
          const ny = kdist > 0.001 ? kdy / kdist : 0;
          e.takeDamage(
            dmg,
            impactType,
            nx * baseKb * kbMult,
            ny * baseKb * kbMult,
            damageOptions
          );
        }
      }
      this.interactWithEnemyHazards(impact.x, impact.y, radius, impactType);
      this.emitDamageText(impact.x, impact.y - 20, 'BUM!', '#F59E0B', true);
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
      this.interactWithEnemyHazards(player.x, player.y, reach, 'holy');

      const levelId = this.state.activeLevelId ?? 0;
      const decor = this.state.decor;
      const nearby = this.spatialHash.queryCircle(player.x, player.y, reach + 50);
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const distSq = dx * dx + dy * dy;
        const maxReach = reach + (e.radius || 15);
        if (distSq <= maxReach * maxReach) {
          if (!hasTerrainLineOfSight(player.x, player.y, e.x, e.y, levelId, decor)) continue;
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
            this.emitDamageText(e.x, e.y - 35, 'SVATÉ SPÁLENÍ! 🔥', '#F59E0B', true);
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
      const totalDmgMult = dmg > 0 ? (dmg / 9) : ((player.damageMultiplier || 1) * (action.stats?.damageMult ?? 1));
      const healRatio = 0.08 * totalDmgMult;
      const requestedHeal = player.maxHp * healRatio * (1 + ((player as any).bearMaskHealBonus || 0));
      player.hp = Math.min(player.maxHp, player.hp + requestedHeal);

      const levelId = this.state.activeLevelId ?? 0;
      const decor = this.state.decor;
      const nearby = this.spatialHash.queryCircle(player.x, player.y, radius + 50);
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (e.isDefeated || e.dead) continue;
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist <= radius + (e.radius || 15)) {
          if (!hasTerrainLineOfSight(player.x, player.y, e.x, e.y, levelId, decor)) continue;
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

    const dayPhase = getCurrentDayPhase(this.state.gameTime, this.state.activeLevelId);
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
      player.activeLevelId = this.state.activeLevelId ?? 0;
      player.decor = this.state.decor;
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

      if (player.hazardSlowTimer > 0) {
        player.hazardSlowTimer -= dt;
      }
      const buffMultiplier =
        (player.soulBuffTimer > 0 ? 1.25 : 1) *
        (player.gingerbreadSpeedTimer > 0 ? (1 + (player.gingerbreadSpeedBonus || 0.15)) : 1) *
        (player.pistalkaSpeedTimer > 0 ? 1.25 : 1) *
        (player.waterSoakedTimer > 0 ? 0.75 : 1) *
        (player.slowTimer > 0 ? 0.65 : 1) *
        ((player.type === 'krajanek' && player.krajanekRideTimer > 0) ? 1 : ((player.meltingPuddleSlowTimer || 0) > 0 ? 0.75 : 1)) *
        (player.hazardSlowTimer > 0 ? (player.hazardSlowFactor || 0.7) : 1);

      const isKrajanekRiding = player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0;

      if (isKrajanekRiding) {
        const steer = computeKrajanekSteering(player, mx, my, dt, {
          onSound: (s: string) => this.callbacks?.onSound?.(s),
        });
        const effectiveSpeed = BASE_PLAYER_SPEED * buffMultiplier * getKrajanekMomentumMultiplier(player);
        player.krajanekCurrentSpeed = effectiveSpeed;
        moveVx = steer.vxRatio * effectiveSpeed;
        moveVy = steer.vyRatio * effectiveSpeed;
        player.lastDx = steer.vxRatio;
        player.lastDy = steer.vyRatio;
        if (Math.abs(steer.vxRatio) > 0.01) {
          player.facingX = steer.vxRatio > 0 ? 1 : -1;
        }
        player.animTime += dt;
      } else if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        const effectiveSpeed = BASE_PLAYER_SPEED * buffMultiplier;
        moveVx = (mx / len) * effectiveSpeed;
        moveVy = (my / len) * effectiveSpeed;
        player.lastDx = mx;
        player.lastDy = my;
        if (Math.abs(mx) > 0.01) {
          player.facingX = mx > 0 ? 1 : -1;
        }
        player.animTime += dt;
      } else {
        player.animTime += dt;
      }

      let pushX = 0;
      let pushY = 0;
      let totalResistance = 0;

      const crowdRadius = isKrajanekRiding ? (getKrajanekStoneRadius(player) + 20) : (player.radius + 35);
      const crowdNearby = this.spatialHash.queryRadius(player.x, player.y, crowdRadius);
      for (let i = 0; i < crowdNearby.length; i++) {
        const e = crowdNearby[i];
        if (e.isDefeated || e.dead || (e.snackTimer || 0) > 0) continue;

        if (isKrajanekRiding) {
          // Valivý lis: Mobs do not push or drag down the runaway millstone!
          continue;
        }

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

      const crowdSpeedMultiplier = isKrajanekRiding
        ? 1
        : Math.max(MIN_SPEED_RATIO, 1 / (1 + totalResistance * DRAG_COEFFICIENT));
      moveVx *= crowdSpeedMultiplier;
      moveVy *= crowdSpeedMultiplier;

      const pushSpeed = Math.hypot(pushX, pushY);
      if (pushSpeed > MAX_PUSH_SPEED) {
        const pushScale = MAX_PUSH_SPEED / pushSpeed;
        pushX *= pushScale;
        pushY *= pushScale;
      }

      player.vx = moveVx;
      player.vy = moveVy;
      player.x += (moveVx + pushX) * dt;
      player.y += (moveVy + pushY) * dt;

      if (player.type === 'krajanek') {
        const candidates = player.krajanekRideTimer > 0
          ? this.spatialHash.queryCircle(player.x, player.y, 280)
          : this.state.enemies;
        const callbacks = {
          onSound: (s: string) => this.callbacks?.onSound?.(s),
          onDamageText: (opts: any) => {
            this.emitDamageText(opts.x, opts.y, opts.text, opts.color || '#FDE047', true);
          },
          onCameraShake: (time: number, intensity: number) => {
            this.state.cameraTremorTimer = Math.max(this.state.cameraTremorTimer || 0, time);
            this.state.cameraTremorIntensity = intensity;
          },
          onHitstop: (time: number) => {
            this.state.hitstopTimer = Math.max(this.state.hitstopTimer || 0, time);
          },
          onSpawnCoastingStone: (stone: any) => {
            if (!this.state.krajanekCoastingStones) this.state.krajanekCoastingStones = [];
            this.state.krajanekCoastingStones.push(stone);
          },
          engine: this.state,
        };
        stepKrajanekRide(player, dt, candidates, undefined, callbacks);
      }

      if (this.state.krajanekCoastingStones && this.state.krajanekCoastingStones.length > 0) {
        const coastCallbacks = {
          onSound: (s: string) => this.callbacks?.onSound?.(s),
          onDamageText: (opts: any) => {
            this.emitDamageText(opts.x, opts.y, opts.text, opts.color || '#FDE047', true);
          },
          onCameraShake: (time: number, intensity: number) => {
            this.state.cameraTremorTimer = Math.max(this.state.cameraTremorTimer || 0, time);
            this.state.cameraTremorIntensity = intensity;
          },
        };
        stepKrajanekCoastingStones(this.state.krajanekCoastingStones, dt, this.state.enemies, coastCallbacks);
      }

      if (player.soulBuffTimer > 0) player.soulBuffTimer -= dt;
      if (player.gingerbreadSpeedTimer > 0) player.gingerbreadSpeedTimer -= dt;
      if (player.pistalkaSpeedTimer > 0) player.pistalkaSpeedTimer -= dt;
      if (player.zPeklaStestiTimer > 0) player.zPeklaStestiTimer -= dt;
      if (player.waterSoakedTimer > 0) player.waterSoakedTimer -= dt;
      if (player.slowTimer > 0) {
        if (player.iceImmunity) {
          player.slowTimer = 0;
        } else {
          player.slowTimer -= dt;
        }
      }
      if (player.ultCd > 0 && !isPlayerAbilityActive(player, this.state)) {
        player.ultCd -= dt * (1 + (this.state.meta?.bellLevel || 0) * 0.08);
      }
      if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);
      if (player.repulseCooldown > 0) player.repulseCooldown = Math.max(0, player.repulseCooldown - dt);
      if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;

      // Goat Bell (Zvonek ze zatoulané kozy)
      const isMoving = Math.hypot(moveVx, moveVy) > 15 || mx !== 0 || my !== 0;
      if (!isMoving) {
        player.flailStanceTimer = Math.min(2.4, (player.flailStanceTimer || 0) + dt);
      } else {
        // A threshing stance must be rebuilt after moving; otherwise the Cep keeps
        // most of its stationary payoff while kiting.
        player.flailStanceTimer = 0;
      }
      if (player.goatBellStacks > 0 && isMoving) {
        player.goatBellTimer = (player.goatBellTimer || player.goatBellInterval || 4.0) - dt;
        if (player.goatBellTimer <= 0) {
          player.goatBellTimer = player.goatBellInterval || 4.0;
          this.triggerGoatBell(player);
        }
      }

      // Holy Chalk Circle (Posvěcená tříkrálová křída)
      if (player.holyCircleStacks > 0) {
        const hcRadius = 120 + Math.max(0, (player.holyCircleStacks || 1) - 1) * 20;
        if (mx === 0 && my === 0) {
          player.stillTimer = (player.stillTimer || 0) + dt;
          if (player.stillTimer >= 0.6) {
            if (!this.state.holyCircle) {
              this.state.holyCircle = {
                x: player.x,
                y: player.y,
                radius: hcRadius,
                life: 1.5,
                active: true,
              };
              this.callbacks?.onSound?.('bell');
              this.emitDamageText(player.x, player.y - 40, 'K + M + B 🖍️', '#FDE047', true);
            } else {
              this.state.holyCircle.x = player.x;
              this.state.holyCircle.y = player.y;
              this.state.holyCircle.radius = hcRadius;
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
            if (!hasTerrainLineOfSight(hc.x, hc.y, foe.x, foe.y, this.state.activeLevelId ?? 0, this.state.decor)) continue;
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
              const baseHolyDmg = 24 + Math.max(0, (player.holyCircleStacks || 1) - 1) * 12;
              const dmg = baseHolyDmg * holyDmgMult * (player.damageMultiplier || 1);
              foe.takeDamage(dmg, 'holy', nx * 180 * holyPush, ny * 180 * holyPush);
              this.emitDamageText(foe.x, foe.y - 30, 'POSVÁTNÝ ODRAZ! ✝️', '#FDE047', false);
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

      // Update Válečnice orbit and obstacle bounce reversal
      const valecniceWp = player.weapons?.find((w: any) => w.id === 'valecnice');
      if (valecniceWp) {
        const stats = (valecniceWp as any)._cachedStats || ((valecniceWp as any)._cachedStats = getRankedWeaponStats('valecnice', valecniceWp.level, valecniceWp));
        const orbitRadius = 115 * stats.areaRadiusMult;
        player._valecniceSlowRadius = orbitRadius * 1.15;
        const orbitSpeed = valecniceWp.level >= 3 ? 2.5 : 2.2;
        if (typeof player.valecniceOrbitDir !== 'number' || player.valecniceOrbitDir === 0) {
          player.valecniceOrbitDir = 1;
        }
        if ((player._valecniceBounceCd || 0) > 0) {
          player._valecniceBounceCd = Math.max(0, player._valecniceBounceCd - dt);
        }
        player.valecniceAngle = ((player.valecniceAngle || 0) + dt * orbitSpeed * player.valecniceOrbitDir + Math.PI * 4) % (Math.PI * 2);

        if ((player._valecniceBounceCd || 0) <= 0) {
          const count = Math.max(1, 1 + stats.projectileCount);
          const levelId = this.state.activeLevelId ?? 0;
          for (let vi = 0; vi < count; vi++) {
            const ang = player.valecniceAngle + (vi * Math.PI * 2) / count;
            const ox = player.x + Math.cos(ang) * orbitRadius;
            const oy = player.y + Math.sin(ang) * orbitRadius;
            const hit = collideCircleWithObstacles(ox, oy, 20, levelId, this.state.decor);
            if (hit.hit) {
              player.valecniceOrbitDir *= -1;
              player._valecniceBounceCd = 0.22;
              player.valecniceAngle = ((player.valecniceAngle || 0) + dt * orbitSpeed * player.valecniceOrbitDir * 2 + Math.PI * 4) % (Math.PI * 2);
              this.callbacks?.onSound?.('hit');
              break;
            }
          }
        }
      } else {
        player._valecniceSlowRadius = 0;
      }

      // Auto-fire weapons
      if (player.weapons) {
        for (let i = 0; i < player.weapons.length; i++) {
          const w = player.weapons[i];
          if (player.type === 'krajanek' && player.krajanekRideTimer > 0) continue;
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
              const ctyrlistekBonus = (player.jetelovyCtyrlistekStacks || 0) > 0 && (player.luck || 100) > 100
                ? (player.luck - 100) * 0.0015 * player.jetelovyCtyrlistekStacks
                : 0;
              const playerCooldownBonus =
                typeof player.cooldownBonus === 'number'
                  ? Math.max(0, player.cooldownBonus + movingBonus + ctyrlistekBonus)
                  : Math.max(0, ((player.cooldownMultiplier || 1) - 1) / 0.9 + movingBonus + ctyrlistekBonus);
              const baseCd = wDef.baseCd;
              const formulaCd = getEffectiveWeaponCooldown(baseCd, playerCooldownBonus, weaponCooldownBonus);
              const stats = (w as any)._cachedStats || ((w as any)._cachedStats = getRankedWeaponStats(w.id, w.level, w));
              let localCd = formulaCd * stats.cooldownMult;
              if (w.id === 'dreveny_cep') {
                const stanceSec = Math.max(player.flailStanceTimer || 0, player.stillTimer || 0);
                const stanceRatio = Math.max(0, Math.min(1, stanceSec / 1.5));
                if (stanceRatio > 0) {
                  localCd = localCd / (1 + 0.12 * stanceRatio);
                }
              }
              if ((player.pivniTacekTimer || 0) > 0) {
                const cdBoost = 1.35 + Math.max(0, (player.pivniTacekStacks || 1) - 1) * 0.15;
                localCd = localCd / cdBoost;
              }

              (w as any).lastMaxCd = localCd;
              w.cd = fired ? localCd : 0.1;
            }
          }
        }
      }
    }

    // Step plum jam puddles (Zero-Allocation Ring Buffer)
    if (this.state.plumPuddles && this.state.plumPuddles.length > 0) {
      for (let i = 0; i < this.state.plumPuddles.length; i++) {
        const pud = this.state.plumPuddles[i];
        if (pud.dead || pud.life <= 0) continue;
        pud.life -= dt;
        if (pud.life <= 0) pud.dead = true;
      }
    }

    // Step yolk puddles (Zero-Allocation Ring Buffer with FCT Throttling)
    if (this.state.yolkPuddles && this.state.yolkPuddles.length > 0) {
      for (let i = 0; i < this.state.yolkPuddles.length; i++) {
        const pud = this.state.yolkPuddles[i];
        if (pud.dead || pud.life <= 0) continue;
        pud.life -= dt;
        pud.damageTimer = (pud.damageTimer || 0.5) - dt;
        if (pud.life <= 0) {
          pud.dead = true;
          continue;
        }

        // Slow and damage player over time
        if (player && player.hp > 0) {
          const pDist = Math.hypot(player.x - pud.x, player.y - pud.y);
          if (pDist <= pud.radius + (player.radius || 18)) {
            player.speedMultiplier = (player.speedMultiplier || 1) * 0.72;
            if (pud.damageTimer <= 0) {
              if (typeof player.takeDamage === 'function') {
                player.takeDamage(6, 'poison');
              } else {
                player.hp = Math.max(0, player.hp - 6);
              }
            }
          }
        }

        // Slow and damage enemies inside puddle with FCT Throttling (0.25 s)
        for (let j = 0; j < this.livingEnemies.length; j++) {
          const foe = this.livingEnemies[j];
          if (!foe || foe.dead || (foe.isFlying && !foe.isGroundedForLoot)) continue;
          const fDist = Math.hypot(foe.x - pud.x, foe.y - pud.y);
          if (fDist <= pud.radius + (foe.radius || 16)) {
            foe.slowTimer = Math.max(foe.slowTimer || 0, 0.4);
            if (pud.damageTimer <= 0) {
              const now = this.state.gameTime || 0;
              if (typeof foe.takeDamage === 'function') {
                foe.takeDamage(10, 'magic');
              } else {
                foe.hp -= 10;
                if (foe.hp <= 0) foe.isDefeated = true;
              }
              if (!foe.lastHazardTextTime || now - foe.lastHazardTextTime >= 0.25) {
                foe.lastHazardTextTime = now;
                this.emitDamageText(foe.x, foe.y - 18, 'SÍRA! −10', '#FACC15', false);
              }
            }
          }
        }

        if (pud.damageTimer <= 0) {
          pud.damageTimer = 0.5;
        }
      }
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

      // Solid obstacle collision (cottages, church, walls, dense forest; water never blocks projectiles).
      // High-flying projectiles (Včelí roj) fly over obstacles.
      const isHighFlyingProj = p.visual === 'bee' || p.weaponId === 'vceli_roj' || p.weaponId === 'vceli-roj' || p.isPuddle || p.isFissureTelegraph;
      if (!isHighFlyingProj) {
        const obsHit = collideCircleWithObstacles(
          p.x,
          p.y,
          Math.max(6, (p.radius || 10) * 0.75),
          this.state.activeLevelId ?? 0,
          this.state.decor
        );
        if (obsHit.hit) {
          p.x = obsHit.x;
          p.y = obsHit.y;
          const isBouncingProj =
            (typeof p.bounces === 'number' && p.bounces > 0) ||
            p.visual === 'kolac' ||
            p.visual === 'gander' ||
            p.weaponId === 'kynuty_kolac' ||
            p.weaponId === 'poutovy_kolac' ||
            p.weaponId === 'splaseny_houser' ||
            p.weaponId === 'houser';
          if (isBouncingProj) {
            const dot = p.vx * obsHit.nx + p.vy * obsHit.ny;
            if (dot < 0) {
              p.vx -= 2 * dot * obsHit.nx;
              p.vy -= 2 * dot * obsHit.ny;
            } else {
              p.vx = -p.vx;
              p.vy = -p.vy;
            }
            p.angle = Math.atan2(p.vy, p.vx);
            if (typeof p.bounces === 'number' && p.bounces > 0) {
              p.bounces--;
            }
            this.callbacks?.onSound?.('hit');
          } else {
            p.dead = true;
            continue;
          }
        }
      }

      if (p.isEnemy) {
        if (player && player.hp > 0 && Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
          player.takeDamage(p.dmg ?? p.damage ?? 15, p.type || 'blunt');
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

      if (p.type === 'fire' || p.type === 'holy' || p.type === 'water' || p.type === 'ice') {
        this.interactWithEnemyHazards(p.x, p.y, (p.radius || 12) + 14, p.type);
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
            this.emitDamageText(e.x, e.y - 20, 'IMUNNÍ', '#0F172A');
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
            const isPiercing = Boolean(p.penetrate || (typeof p.pierce === 'number' && p.pierce > 0));
            e.takeDamage(
              dmg,
              p.type,
              p.type === 'food' ? 0 : p.vx * 0.3 * holyPush * kbMult,
              p.type === 'food' ? 0 : p.vy * 0.3 * holyPush * kbMult,
              {
                ...(p.stunDuration ? { stunDuration: p.stunDuration } : {}),
                isPiercing,
              }
            );
            if (p.type === 'ice') e.chill(p.chillDuration ?? 3.5);
            if (p.interruptsWindup) {
              if (typeof e.interruptAttack === 'function') e.interruptAttack();
              e.isAttacking = false;
              e.windupTimer = 0;
              e.strikeTimer = 0;
              if (e.aiState === 'windup') e.aiState = 'idle';
              this.emitDamageText(e.x, e.y - 25, 'ŠTÍP! 🪿', '#F8FAFC', false);
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
              this.emitDamageText(e.x, e.y - 35, '+1 🪙', '#FBBF24', false);
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
    compactInPlace(this.state.projectiles, keepLiveProjectile, (p) => {
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
      if (s.visualOnly) continue;

      if (this.state.drops) {
        for (let di = 0; di < this.state.drops.length; di++) {
          const d = this.state.drops[di];
          if (d && !d.dead && d.isFrozen && Math.hypot(d.x - s.x, d.y - s.y) <= s.reach + 20) {
            d.isFrozen = false;
            d.freezeTimer = 0;
            this.emitDamageText(d.x, d.y - 20, 'ROZMRAZENO! 💧', '#38BDF8', false);
          }
        }
      }

      if (!s._cleansedHazards) {
        s._cleansedHazards = true;
        const slashElem = s.soaked ? 'water' : (s.type || 'physical');
        this.interactWithEnemyHazards(s.x, s.y, s.reach, slashElem);
      }

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
            if (!hasTerrainLineOfSight(s.x, s.y, e.x, e.y, this.state.activeLevelId ?? 0, this.state.decor)) continue;
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
                this.emitDamageText(e.x, e.y - 28, 'PRÁSK! 🪢', '#FDE047', true);
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
    compactInPlace(this.state.slashes, keepLiveSlash, (s) => {
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
          let nearestDistSq = Infinity;
          const nearbyFoes = this.spatialHash.queryCircle(e.x, e.y, 420);
          for (let k = 0; k < nearbyFoes.length; k++) {
            const other = nearbyFoes[k];
            if (other === e || other.dead || other.isDefeated) continue;
            const bdx = other.x - e.x;
            const bdy = other.y - e.y;
            const dSq = bdx * bdx + bdy * bdy;
            if (dSq < nearestDistSq) {
              nearestDistSq = dSq;
              nearestFoe = other;
            }
          }
          if (!nearestFoe) {
            for (let k = 0; k < this.state.enemies.length; k++) {
              const other = this.state.enemies[k];
              if (other === e || other.dead || other.isDefeated) continue;
              const bdx = other.x - e.x;
              const bdy = other.y - e.y;
              const dSq = bdx * bdx + bdy * bdy;
              if (dSq < nearestDistSq) {
                nearestDistSq = dSq;
                nearestFoe = other;
              }
            }
          }
          if (nearestFoe) {
            const nearestDist = Math.sqrt(nearestDistSq);
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
          try {
            e.update(dt, player);
          } catch (err: any) {
            console.error('ERROR IN E.UPDATE FOR:', e.id, e.trioRole, err?.message, err?.stack);
          }
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
      const syrecekStacks = player.syrecekStacks || 1;
      const closeReach = Math.max(attackRange, 85 + ((syrecekStacks - 1) * 25));
      if (
        (player.syrecekStacks || 0) > 0 &&
        e.isAttacking &&
        distToPlayer <= closeReach &&
        (!e.vycerpanyTimer || e.vycerpanyTimer <= 0)
      ) {
        e.vycerpanyTimer = 4.0 + (syrecekStacks - 1) * 1.5;
        if (typeof e.interruptAttack === 'function') {
          e.interruptAttack();
        } else {
          e.isAttacking = false;
          e.windupTimer = 0;
        }
        this.emitDamageText(e.x, e.y - 30, 'VYČERPÁN! 🧀', '#A3E635', true);
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
    compactInPlace(this.state.enemies, keepLiveEnemy);
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

    // Evaluate Coordinated Minion-to-Boss Synergy Tethers (up to 3 minions within 280px of a Boss/Miniboss)
    for (let i = 0; i < this.livingEnemies.length; i++) {
      const e = this.livingEnemies[i];
      e._tetheredBoss = null;
      e._synergyMinionCount = 0;
    }
    for (let i = 0; i < this.livingEnemies.length; i++) {
      const boss = this.livingEnemies[i];
      if (!boss.isBoss && !boss.isMiniboss) continue;
      let count = 0;
      for (let j = 0; j < this.livingEnemies.length; j++) {
        const m = this.livingEnemies[j];
        if (m === boss || m.isBoss || m.isMiniboss || m._tetheredBoss) continue;
        const dist = Math.hypot(m.x - boss.x, m.y - boss.y);
        if (dist <= 280) {
          m._tetheredBoss = boss;
          count++;
          if (count >= 3) break;
        }
      }
      boss._synergyMinionCount = count;
    }

    // Step decor
    if (this.state.decor) {
      for (let i = 0; i < this.state.decor.length; i++) {
        const d = this.state.decor[i];
        if (d.animTime !== undefined) d.animTime += dt;

        if (d.type === 'ice_floe' && (this.state.activeLevelId === 0 || this.state.activeLevelId === 1)) {
          const floeState = getMarchIceFloeState(d.floeIndex ?? i, this.state.gameTime || 0);
          d.x = floeState.x;
          d.y = floeState.y;
          d.vx = floeState.vx;
          d.vy = floeState.vy;
        } else if (d.vx || d.vy) {
          d.x += (d.vx || 0) * dt;
          d.y += (d.vy || 0) * dt;
          // Apply drag to káča
          if (d.type === 'kaca') {
            const drag = Math.max(0, 1 - 2.5 * dt);
            d.vx *= drag;
            d.vy *= drag;
            if (Math.abs(d.vx) < 5) d.vx = 0;
            if (Math.abs(d.vy) < 5) d.vy = 0;
          }
          // Constrain any standalone ice_floe to pond bounds instead of drifting across dry land
          if (d.type === 'ice_floe') {
            const floeState = getMarchIceFloeState(d.floeIndex ?? i, this.state.gameTime || 0);
            d.x = floeState.x;
            d.y = floeState.y;
            d.vx = floeState.vx;
            d.vy = floeState.vy;
          }
        }

        if (d.type === 'ice_floe') {
          // Floating ice floes carry units standing on them rather than blocking like solid walls
          if (player && player.hp > 0) {
            const dist = Math.hypot(player.x - d.x, player.y - d.y);
            if (dist < (player.radius || 18) + (d.radius || 32)) {
              player.x += (d.vx || 0) * dt;
              player.y += (d.vy || 0) * dt;
            }
          }
          const floeReach = (d.radius || 32) + 25;
          const nearbyOnFloe = this.spatialHash.queryRadius(d.x, d.y, floeReach);
          for (let j = 0; j < nearbyOnFloe.length; j++) {
            const e = nearbyOnFloe[j];
            const edist = Math.hypot(e.x - d.x, e.y - d.y);
            if (edist < (e.radius || 15) + (d.radius || 32)) {
              e.x += (d.vx || 0) * dt;
              e.y += (d.vy || 0) * dt;
            }
          }
          continue;
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
              if (d.type === 'kaca' && dist < reach - 2) {
                // Player kicks the top!
                d.vx = (dx / dist) * -300;
                d.vy = (dy / dist) * -300;
              }
            }
          }
          // Push enemies (spatial hash lookup avoids O(decor * enemies) quadratic bottleneck)
          const obstRadius = d.radius + 35;
          const nearbyEnemies = this.spatialHash.queryRadius(d.x, d.y, obstRadius);
          for (let j = 0; j < nearbyEnemies.length; j++) {
            const e = nearbyEnemies[j];
            const edx = e.x - d.x;
            const edy = e.y - d.y;
            const ereach = (e.radius || 15) + d.radius;
            if (edx >= ereach || edx <= -ereach || edy >= ereach || edy <= -ereach) continue;
            const edistSq = edx * edx + edy * edy;
            if (edistSq < ereach * ereach) {
              const edist = Math.sqrt(edistSq);
              const eoverlap = ereach - edist;
              if (edist > 0.001) {
                e.x += (edx / edist) * eoverlap;
                e.y += (edy / edist) * eoverlap;
              }
              if (d.type === 'kaca' && Math.hypot(d.vx, d.vy) > 50) {
                if (typeof e.takeDamage === 'function') {
                  e.takeDamage(20, 'physical', 0, 0);
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
            }
          }
        }
      }
    }

    // Stage 1 & 2 ("BŘEZEN"): Enforce impassable cottages/terrain, hard arena border, river/pond ice floes & Kaplička Marian Apparition
    if (this.state.activeLevelId === 0 || this.state.activeLevelId === 1) {
      const thaw = this.state.marchThaw;
      if (thaw) {
        thaw.shrineCooldown = Math.max(0, (thaw.shrineCooldown || 0) - dt);
      }
      if (player && player.hp > 0) {
        const floeEffect = getMarchWaterAndFloeEffect(player.x, player.y, this.state.gameTime || 0);
        if (floeEffect.onFloe || floeEffect.inOpenWater) {
          player.x += floeEffect.carryVx * dt;
          player.y += floeEffect.carryVy * dt;
        }
        resolveMarchThawObstacles(player, false);

        if (thaw) {
          const isMarchNight = this.state.activeLevelId === 1;
          const marchPois = getMarchPois(isMarchNight);
          const inShrine = isInsideMarchPoi(player.x, player.y, marchPois.shrine);
          const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
          this.state.marchThawActivePoiPrompt = inShrine
            ? ((thaw.shrineCooldown || 0) <= 0
                ? '[E] Pomodlit se (Mariánská kaplička)'
                : `Kaplička odpočívá (${Math.ceil(thaw.shrineCooldown || 0)}s)`)
            : null;
          const bubakNearShrine =
            inShrine &&
            this.livingEnemies.some(
              (foe) =>
                !foe.dead &&
                !foe.isDefeated &&
                Math.hypot(foe.x - marchPois.shrine.x, foe.y - marchPois.shrine.y) < 250
            );
          const eTrigger = inShrine && eKeyPressed && (thaw.shrineCooldown || 0) <= 0;
          if (inShrine && (bubakNearShrine || eTrigger)) {
            thaw.shrineCharge = (thaw.shrineCharge || 0) + dt * 1.35;
            if ((eTrigger || thaw.shrineCharge >= 1.6) && thaw.shrineCooldown <= 0) {
              thaw.shrineCharge = 0;
              thaw.shrineCooldown = MARCH_MARIAN_APPARITION_COOLDOWN;
              thaw.apparitionTimer = 4.2;
              thaw.apparitionPulseTimer = 0;
              player.hp = Math.min(player.maxHp, player.hp + 18);
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                const dx = foe.x - marchPois.shrine.x;
                const dy = foe.y - marchPois.shrine.y;
                const dist = Math.hypot(dx, dy) || 1;
                if (dist < 560 + (foe.radius || 0)) {
                  foe.takeDamage(145 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 540, (dy / dist) * 540);
                  foe.panicked = true;
                  foe.panicTimer = Math.max(foe.panicTimer || 0, 5.0);
                }
              }
              this.emitDamageText(
                marchPois.shrine.x,
                marchPois.shrine.y - 110,
                '✦ ZJEVENÍ PANNY MARIE S JEŽÍŠKEM!',
                '#FEF08A',
                true,
                'bossAnnouncements'
              );
              this.callbacks?.onSound?.('bell');
            }
          } else {
            thaw.shrineCharge = Math.max(0, (thaw.shrineCharge || 0) - dt * 1.5);
          }

          if ((thaw.apparitionTimer || 0) > 0) {
            thaw.apparitionTimer = Math.max(0, thaw.apparitionTimer - dt);
            thaw.apparitionPulseTimer = (thaw.apparitionPulseTimer || 0) + dt;
            if (thaw.apparitionPulseTimer >= 0.45) {
              thaw.apparitionPulseTimer = 0;
              const growFrac = Math.min(1, Math.max(0.25, (4.2 - thaw.apparitionTimer) / 3.2));
              const activeReach = 220 + 340 * growFrac;
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                if (foe.dead || foe.isDefeated) continue;
                const dx = foe.x - marchPois.shrine.x;
                const dy = foe.y - marchPois.shrine.y;
                const dist = Math.hypot(dx, dy) || 1;
                if (dist < activeReach + (foe.radius || 0)) {
                  foe.takeDamage(28 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 320, (dy / dist) * 320);
                  foe.panicked = true;
                  foe.panicTimer = Math.max(foe.panicTimer || 0, 3.2);
                }
              }
            }
          }
        }
      }
      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'vrana') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getMarchWaterAndFloeEffect(e.x, e.y, this.state.gameTime || 0);
          if (eWater.onFloe) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
          } else if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveMarchThawObstacles(e, isFlying);
      }
    }

    // Stage 3 & 4 ("DUBEN" & "DUBNOVÁ NOC"): Enforce Dubnový den bounds, village obstacles, bell peal, Maypole/Bonfire ward, thawed pond mud, and pollen/ember clouds
    if (this.state.activeLevelId === 2 || this.state.activeLevelId === 3) {
      const isDubenNight = this.state.activeLevelId === 3;
      const dubenPois = getDubenPois(isDubenNight);
      const duben = this.state.dubenDen;
      if (duben) {
        duben.bellCooldown = Math.max(0, (duben.bellCooldown || 0) - dt);
        duben.bellWaveTimer = Math.max(0, (duben.bellWaveTimer || 0) - dt);
        duben.pollenCloudTimer = Math.max(0, (duben.pollenCloudTimer || 0) - dt);
      }
      if (player && player.hp > 0) {
        resolveDubenObstacles(player, false);
        clampToDubenArenaBounds(player, 28);

        // Maypole / Filipojakubská vatra protective aura in village green
        const inVillage = isInsideDubenPoi(player.x, player.y, dubenPois.village);
        if (duben) {
          duben.maypoleWardActive = inVillage;
        }
        if (isDubenNight && inVillage) {
          player.hp = Math.min(player.maxHp, player.hp + 2.5 * dt);
        }

        // Bell peal at Kostel sv. Jiří [E] or when swarmed
        if (duben) {
          const inChurch = isInsideDubenPoi(player.x, player.y, dubenPois.church);
          this.state.dubenActivePoiPrompt = inChurch
            ? ((duben.bellCooldown || 0) <= 0
                ? (isDubenNight ? '[E] Rozeznít zvon (Kostel sv. Jiří)' : '[E] Rozeznít velikonoční zvon (Kostel sv. Jiří)')
                : `Zvon odpočívá (${Math.ceil(duben.bellCooldown || 0)}s)`)
            : null;
          const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
          const bubakNearChurch =
            inChurch &&
            this.livingEnemies.some(
              (foe) =>
                !foe.dead &&
                !foe.isDefeated &&
                Math.hypot(foe.x - dubenPois.church.x, foe.y - dubenPois.church.y) < 280
            );
          if (inChurch && (eKeyPressed || bubakNearChurch) && duben.bellCooldown <= 0) {
            duben.bellCooldown = DUBEN_BELL_COOLDOWN;
            duben.bellWaveTimer = 3.5;
            player.hp = Math.min(player.maxHp, player.hp + 20);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              const dx = foe.x - dubenPois.church.x;
              const dy = foe.y - dubenPois.church.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < 540 + (foe.radius || 0)) {
                foe.takeDamage(140 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 520, (dy / dist) * 520);
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 4.5);
              }
            }
            this.emitDamageText(
              dubenPois.church.x,
              dubenPois.church.y - 100,
              isDubenNight ? '🔔 FILIPOJAKUBSKÝ ZVON ZAHÁNÍ SABAT!' : '✦ VELIKONOČNÍ ZVON ZVONÍ Z ŘÍMA!',
              '#FEF08A',
              true,
              'bossAnnouncements'
            );
            this.callbacks?.onSound?.('bell');
          }

          // Dandelion pollen / night mist burst when moving in fields
          const inFields = isInsideDubenPoi(player.x, player.y, dubenPois.fields);
          if (inFields && (player.vx || player.vy) && duben.pollenCloudTimer <= 0) {
            duben.pollenCloudTimer = 2.5;
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (Math.hypot(foe.x - player.x, foe.y - player.y) < 220) {
                foe.slowTimer = Math.max(foe.slowTimer || 0, 1.8);
              }
            }
          }

          // Ambient April weather: drifting petals by day, glowing bonfire embers by night
          duben.weatherPetalTimer = (duben.weatherPetalTimer || 0) - dt;
          if (duben.weatherPetalTimer <= 0) {
            duben.weatherPetalTimer = 0.22;
            tryEmitParticle(this.state.particles, () => {
              const isPrimary = Math.random() < 0.6;
              return {
                x: player.x + (Math.random() - 0.5) * 1200,
                y: player.y - 350 + (Math.random() - 0.5) * 300,
                vx: 32 + Math.random() * 28,
                vy: isDubenNight ? -14 - Math.random() * 18 : 16 + Math.random() * 22,
                life: 3.5 + Math.random() * 1.5,
                maxLife: 5.0,
                size: isPrimary ? 2.8 : 3.6,
                color: isDubenNight ? (isPrimary ? '#F97316' : '#FDE047') : (isPrimary ? '#FCE7F3' : '#FEF08A'),
                isWeather: true,
              };
            }, this.state.meta?.performanceProfile);
          }
        }

        // Pond warm water & shallows
        const waterEff = getDubenWaterEffect(player.x, player.y, false);
        if (waterEff.inWater && waterEff.inDeepWater) {
          player.speedMultiplier = (player.speedMultiplier || 1) * 0.88;
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean(e.isFlying && !e.isGroundedForLoot);
        if (!isFlying) {
          const isAquatic = isAquaticEnemy(e) || e.id === 'zaba' || e.id === 'ropucha' || e.id === 'vodnicek';
          const eWater = getDubenWaterEffect(e.x, e.y, isAquatic);
          if (eWater.inWater) {
            if (isAquatic) {
              e.speedMultiplier = (e.speedMultiplier || 1) * 1.15;
            } else if (eWater.inDeepWater) {
              e.slowTimer = Math.max(e.slowTimer || 0, 0.4);
            }
          }
        } else {
          // Orchard petal/wisp flurry slows flying enemies passing overhead
          if (isInsideDubenPoi(e.x, e.y, dubenPois.orchard)) {
            e.speedMultiplier = (e.speedMultiplier || 1) * 0.82;
          }
        }
        resolveDubenObstacles(e, isFlying);
        clampToDubenArenaBounds(e, 28);
      }
    }

    // Stage 5 & 6 ("KVĚTEN" & "MÁJOVÁ NOC"): Enforce Květen v Hrusicích bounds, village obstacles, Maypole ward, Sv. Jan Nepomucký shrine, and open thawed waters
    if (this.state.activeLevelId === 4 || this.state.activeLevelId === 5) {
      const isKvetenNight = this.state.activeLevelId === 5;
      const kvetenPois = getKvetenPois(isKvetenNight);
      if (player && player.hp > 0) {
        const waterEffect = getKvetenWaterEffect(player.x, player.y, this.state.gameTime || 0);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        resolveKvetenObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        // Maypole protective ward in village green (+25% defense)
        const inVillage = isInsideKvetenPoi(player.x, player.y, kvetenPois.village);
        if (inVillage) {
          player.defenseMultiplier = Math.max(player.defenseMultiplier || 1, 1.25);
        }

        // Sv. Jan Nepomucký shrine aura
        const inShrine = isInsideKvetenPoi(player.x, player.y, kvetenPois.shrine);
        if (inShrine) {
          for (let j = 0; j < this.livingEnemies.length; j++) {
            const foe = this.livingEnemies[j];
            if (foe.dead || foe.isDefeated) continue;
            const dx = foe.x - kvetenPois.shrine.x;
            const dy = foe.y - kvetenPois.shrine.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < 260 + (foe.radius || 0)) {
              foe.panicked = true;
              foe.panicTimer = Math.max(foe.panicTimer || 0, 1.5);
            }
          }
        }

        // Květen POI [E] interaction & cooldown tick
        const kv = (this.state.kveten || (this.state.kveten = {
          bellCooldown: 0,
          kegCooldown: 0,
          shrineCooldown: 0,
          beerPuddle: null,
          maypoleWardActive: false,
          weatherPetalTimer: 0,
          terrainHazardTimer: 0,
        }));
        kv.bellCooldown = Math.max(0, (kv.bellCooldown || 0) - dt);
        kv.kegCooldown = Math.max(0, (kv.kegCooldown || 0) - dt);
        kv.shrineCooldown = Math.max(0, (kv.shrineCooldown || 0) - dt);

        if (kv.beerPuddle) {
          kv.beerPuddle.time -= dt;
          if (kv.beerPuddle.time <= 0) {
            kv.beerPuddle = null;
          } else {
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - kv.beerPuddle.x, foe.y - kv.beerPuddle.y) < 120) {
                foe.stunTimer = Math.max(foe.stunTimer || 0, 0.35);
              }
            }
          }
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
        const inTavern = isInsideKvetenPoi(player.x, player.y, kvetenPois.tavern);
        const inChurch = isInsideKvetenPoi(player.x, player.y, kvetenPois.church);

        if (inTavern) {
          this.state.kvetenActivePoiPrompt = (kv.kegCooldown || 0) <= 0
            ? '[E] Narazit májový soudek (Hospoda)'
            : `Hospodský naráží nový soudek (${Math.ceil(kv.kegCooldown)}s)`;
          if (eKeyPressed && (kv.kegCooldown || 0) <= 0) {
            kv.kegCooldown = 18;
            player.hp = Math.min(player.maxHp, player.hp + 24);
            const dir = Math.hypot(player.lastDx || 0, player.lastDy || 0) || 1;
            const px = player.x + ((player.lastDx || 1) / dir) * 90;
            const py = player.y + ((player.lastDy || 0) / dir) * 90;
            kv.beerPuddle = { x: px, y: py, time: 8 };
            this.callbacks?.onSound?.('beer');
            this.emitDamageText(player.x, player.y - 45, 'MÁJOVÝ SOUDEK NARAZEN! 🍺 (+24 Kuráže, louže piva)', '#FDE047', true);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - px, foe.y - py) < 170) {
                foe.takeDamage(125 * (player.damageMultiplier || 1), 'physical', (foe.x - px) * 3, (foe.y - py) * 3);
                foe.stunTimer = Math.max(foe.stunTimer || 0, 2.8);
              }
            }
          }
        } else if (inChurch) {
          this.state.kvetenActivePoiPrompt = (kv.bellCooldown || 0) <= 0
            ? (isKvetenNight ? '[E] Rozeznít půlnoční zvon (Kostel sv. Mikuláše)' : '[E] Rozeznít májový zvon (Kostel sv. Mikuláše)')
            : `Májový zvon chladne (${Math.ceil(kv.bellCooldown)}s)`;
          if (eKeyPressed && (kv.bellCooldown || 0) <= 0) {
            kv.bellCooldown = 80;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, isKvetenNight ? '🔔 PŮLNOČNÍ ZVON ZAHÁNÍ HEJKALY!' : '🔔 MÁJOVÁ ZVONICE! SVATÝ HLAS!', '#FEF08A', true);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              const dx = foe.x - kvetenPois.church.x;
              const dy = foe.y - kvetenPois.church.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < 920 + (foe.radius || 0)) {
                foe.takeDamage(180 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 480, (dy / dist) * 480);
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 4.0);
              }
            }
          }
        } else if (inShrine) {
          this.state.kvetenActivePoiPrompt = '[E] Pomodlit se (Boží muka)';
          if (eKeyPressed && (kv.shrineCooldown || 0) <= 0) {
            kv.shrineCooldown = 20;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POŽEHNÁNÍ SV. JANA NEPOMUCKÉHO! ✨', '#FEF08A', true);
            player.tempShield = Math.max(player.tempShield || 0, 60);
          }
        } else {
          this.state.kvetenActivePoiPrompt = null;
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean(e.isFlying && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getKvetenWaterEffect(e.x, e.y, this.state.gameTime || 0);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveKvetenObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 7 & 8 ("ČERVEN" & "ČERVNOVÁ NOC"): Enforce Červen v Hrusicích bounds, haystacks & village obstacles, St. Anthony shrine blessing, summer stream, and Stage 8 Svatojánské byliny & Poklad v zemi
    if (this.state.activeLevelId === 6 || this.state.activeLevelId === 7) {
      const isCervenNight = this.state.activeLevelId === 7;
      const cervenPois = getCervenPois(isCervenNight);
      if (player && player.hp > 0) {
        const waterEffect = getCervenWaterEffect(player.x, player.y, this.state.gameTime || 0);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        resolveCervenObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        const inShrine = isInsideCervenPoi(player.x, player.y, cervenPois.shrine);
        const inChurch = isInsideCervenPoi(player.x, player.y, cervenPois.church);
        const inTavern = isInsideCervenPoi(player.x, player.y, cervenPois.tavern);
        const inForest = isInsideCervenPoi(player.x, player.y, cervenPois.forest);
        const inVillage = isInsideCervenPoi(player.x, player.y, cervenPois.village);
        const inFields = isInsideCervenPoi(player.x, player.y, cervenPois.fields);

        // Village green pace bonus
        if (inVillage) {
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
        }

        // Tactical haystacks & fields cover
        if (inFields) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.15);
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);

        // Stage 8 ("ČERVNOVÁ NOC"): Sběr svatojánských bylin odemykající poklad v zemi
        if (isCervenNight) {
          const cv = this.state.cerven || (this.state.cerven = {
            bellCooldown: 0,
            shrineCooldown: 0,
            tavernCooldown: 0,
            forestCooldown: 0,
            weatherHayTimer: 0,
            herbs: createInitialSvatojanskeByliny(),
            herbsCollected: 0,
            herbsTarget: 9,
            poklad: createInitialSvatojanskyPoklad(),
            svatojanskaZareTimer: 0,
          });
          if (!cv.herbs || cv.herbs.length === 0) {
            cv.herbs = createInitialSvatojanskeByliny();
            cv.herbsCollected = 0;
            cv.herbsTarget = 9;
          }
          if (!cv.poklad) {
            cv.poklad = createInitialSvatojanskyPoklad();
          }
          if ((cv.svatojanskaZareTimer || 0) > 0) {
            cv.svatojanskaZareTimer = Math.max(0, (cv.svatojanskaZareTimer || 0) - dt);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.25);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.35);
          }

          const herbPickupReach = Math.max(52, (player.pickupRadius || 90) * 0.65);
          for (let hi = 0; hi < cv.herbs.length; hi++) {
            const herb = cv.herbs[hi];
            if (!herb || herb.collected) continue;
            const distH = Math.hypot(player.x - herb.x, player.y - herb.y);
            if (distH <= herbPickupReach) {
              herb.collected = true;
              cv.herbsCollected = (cv.herbsCollected || 0) + 1;
              const targetCount = cv.herbsTarget || 9;
              player.hp = Math.min(player.maxHp, player.hp + 14);
              player.gingerbreadSpeedTimer = Math.max(player.gingerbreadSpeedTimer || 0, 3.0);
              this.callbacks?.onSound?.('heal');
              this.emitDamageText(
                herb.x,
                herb.y - 36,
                `🌿 ${herb.name.toUpperCase()}! (${cv.herbsCollected}/${targetCount})`,
                herb.flowerColor || '#A3E635',
                true
              );

              if (cv.herbsCollected >= targetCount && !cv.poklad.unlocked) {
                cv.poklad.unlocked = true;
                this.callbacks?.onSound?.('bell');
                this.emitDamageText(
                  player.x,
                  player.y - 62,
                  '🌿 ZLATÉ KAPRADÍ ROZKVETLO! POKLAD V ZEMI OTEVŘEN!',
                  '#FACC15',
                  true
                );
              }
            }
          }

          if (cv.poklad.unlocked && !cv.poklad.opened) {
            const distPoklad = Math.hypot(player.x - cv.poklad.x, player.y - cv.poklad.y);
            if (distPoklad <= 72 || (distPoklad <= 115 && eKeyPressed)) {
              cv.poklad.opened = true;
              cv.svatojanskaZareTimer = 15.0;
              this.state.gingerbread = (this.state.gingerbread || 0) + 25;
              this.state.coins = (this.state.coins || 0) + 60;
              player.hp = Math.min(player.maxHp, player.hp + 50);
              player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 5.0);
              player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.35);
              if (this.state.drops) {
                spawnDropWithLimit(
                  this.state.drops,
                  {
                    type: 'chest',
                    x: cv.poklad.x,
                    y: cv.poklad.y - 115,
                    vx: 0,
                    vy: 0,
                    radius: 25,
                    time: 0,
                  },
                  this.state.pendingDropBank
                );
              }
              this.callbacks?.onSound?.('bell');
              this.emitDamageText(
                cv.poklad.x,
                cv.poklad.y - 58,
                '👑 SVATOJÁNSKÝ POKLAD VYZVEDNUT! (+25 🍪, +60 🪙, SVATOJÁNSKÁ ZÁŘE!)',
                '#FACC15',
                true
              );
            }
          }
        }

        // [E] Poutní strom Sv. Antonína Paduánského: Vacuum-pulls all loose drops & grants temporary holy shield
        if (inShrine) {
          this.state.cervenActivePoiPrompt = cervenPois.shrine.interactPrompt;
          if (eKeyPressed && (!player._cervenShrineCooldown || player._cervenShrineCooldown <= 0)) {
            player._cervenShrineCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POŽEHNÁNÍ SV. ANTONÍNA! ✨', '#F59E0B', true);
            if (this.state.drops) {
              applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
            }
            player.tempShield = Math.max(player.tempShield || 0, 80);
            player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.5);
          }
        } else if (inChurch) {
          this.state.cervenActivePoiPrompt = cervenPois.church.interactPrompt;
          if (eKeyPressed && (!player._cervenChurchCooldown || player._cervenChurchCooldown <= 0)) {
            player._cervenChurchCooldown = 12.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'MRAKOZVON ZAZVONIL! 🔔', '#38BDF8', true);
            player.tempShield = Math.max(player.tempShield || 0, 50);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              const dist = Math.hypot(foe.x - player.x, foe.y - player.y);
              if (dist <= 400) {
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.0);
              }
            }
          }
        } else if (inTavern) {
          this.state.cervenActivePoiPrompt = cervenPois.tavern.interactPrompt;
          if (eKeyPressed && (!player._cervenTavernCooldown || player._cervenTavernCooldown <= 0)) {
            player._cervenTavernCooldown = 10.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'CHLADIVÉ PODMÁSLÍ! 🥛', '#10B981', true);
            player.hp = Math.min(player.maxHp, player.hp + 35);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          }
        } else if (inForest) {
          this.state.cervenActivePoiPrompt = cervenPois.forest.interactPrompt;
          if (eKeyPressed && (!player._cervenForestCooldown || player._cervenForestCooldown <= 0)) {
            player._cervenForestCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, isCervenNight ? 'SVATOJÁNSKÉ BYLINY! 🌿' : 'BORŮVKY A JAHŮDKY! 🫐', '#818CF8', true);
            player.hp = Math.min(player.maxHp, player.hp + 20);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.20);
          }
        } else {
          this.state.cervenActivePoiPrompt = null;
        }

        if (player._cervenShrineCooldown > 0) player._cervenShrineCooldown -= dt;
        if (player._cervenChurchCooldown > 0) player._cervenChurchCooldown -= dt;
        if (player._cervenTavernCooldown > 0) player._cervenTavernCooldown -= dt;
        if (player._cervenForestCooldown > 0) player._cervenForestCooldown -= dt;
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean(e.isFlying && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getCervenWaterEffect(e.x, e.y, this.state.gameTime || 0);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveCervenObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 9 & 10 ("ČERVENEC" & "ČERVENCOVÁ NOC"): Enforce Červenec v Hrusicích bounds, grain sheaves panáky obstacles, Poutní střelnice (Day) & Bouře sv. Eliáše (Night)
    if (this.state.activeLevelId === 8 || this.state.activeLevelId === 9) {
      const isCervenecNight = this.state.activeLevelId === 9;
      const cervenecPois = getCervenecPois(isCervenecNight);
      const cv7 = this.state.cervenec || (this.state.cervenec = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        forestCooldown: 0,
        strelnice: createInitialPoutniStrelniceState(),
        stormBoltTimer: 6.0,
        stormWarning: null,
        weatherChaffTimer: 0,
      });
      if (!cv7.strelnice) {
        cv7.strelnice = createInitialPoutniStrelniceState();
      }
      if (cv7.strelnice.cooldown > 0) cv7.strelnice.cooldown = Math.max(0, cv7.strelnice.cooldown - dt);
      if (cv7.strelnice.rosesBurstTimer > 0) cv7.strelnice.rosesBurstTimer = Math.max(0, cv7.strelnice.rosesBurstTimer - dt);
      if (cv7.strelnice.buffTimer > 0) {
        cv7.strelnice.buffTimer = Math.max(0, cv7.strelnice.buffTimer - dt);
        if (player) {
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.25);
          if (!player._poutovaMuskaLuckApplied) {
            player._poutovaMuskaLuckApplied = true;
            player.luck = (player.luck || 100) + 20;
          }
          if (player.weapons) {
            for (let wi = 0; wi < player.weapons.length; wi++) {
              const w = player.weapons[wi];
              if (w && w.cd > 0) w.cd = Math.max(0, w.cd - dt * 0.25);
            }
          }
        }
      } else if (player && player._poutovaMuskaLuckApplied) {
        player._poutovaMuskaLuckApplied = false;
        player.luck = Math.max(0, (player.luck || 100) - 20);
      }

      if (player && player.hp > 0) {
        const waterEffect = getCervenecWaterEffect(player.x, player.y, this.state.gameTime || 0);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        resolveCervenecObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        const inShrine = isInsideCervenecPoi(player.x, player.y, cervenecPois.shrine);
        const inChurch = isInsideCervenecPoi(player.x, player.y, cervenecPois.church);
        const inTavern = isInsideCervenecPoi(player.x, player.y, cervenecPois.tavern);
        const inForest = isInsideCervenecPoi(player.x, player.y, cervenecPois.forest);
        const inVillage = isInsideCervenecPoi(player.x, player.y, cervenecPois.village);
        const inFields = isInsideCervenecPoi(player.x, player.y, cervenecPois.fields);

        if (inVillage) {
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
        }
        if (inFields) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.15);
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);

        // Stage 9 Daytime Mechanic: [E] Poutní střelnice na návsi
        if (!isCervenecNight && inVillage) {
          this.state.cervenecActivePoiPrompt = cervenecPois.village.hint || null;
          if (eKeyPressed && cv7.strelnice.cooldown <= 0) {
            cv7.strelnice.cooldown = 14.0;
            cv7.strelnice.buffTimer = 18.0;
            cv7.strelnice.rosesBurstTimer = 2.5;
            cv7.strelnice.shotsFired = (cv7.strelnice.shotsFired || 0) + 1;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(
              cervenecPois.village.x,
              cervenecPois.village.y - 68,
              '🎯 TŘESK DO TERČE! POUŤOVÁ MUŠKA (+25 % NABÍJENÍ, +20 ŠTĚSTÍ)! 🌹',
              '#F43F5E',
              true,
              'bossAnnouncements'
            );
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - cervenecPois.village.x;
              const dy = foe.y - cervenecPois.village.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 340) {
                foe.takeDamage(95 * (player.damageMultiplier || 1), 'physical', (dx / dist) * 420, (dy / dist) * 420);
              }
            }
          }
        } else if (inShrine) {
          this.state.cervenecActivePoiPrompt = cervenecPois.shrine.hint || null;
          if (eKeyPressed && (!player._cervenecShrineCooldown || player._cervenecShrineCooldown <= 0)) {
            player._cervenecShrineCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, isCervenecNight ? 'HROMOVÁ ZÁŠTITA SV. ELIÁŠE! ⚡' : 'POŽEHNÁNÍ SV. MARKÉTY! 🌾✨', '#FACC15', true);
            if (this.state.drops) {
              applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
            }
            player.tempShield = Math.max(player.tempShield || 0, 85);
            player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.5);
          }
        } else if (inChurch) {
          this.state.cervenecActivePoiPrompt = cervenecPois.church.hint || null;
          if (eKeyPressed && (!player._cervenecChurchCooldown || player._cervenecChurchCooldown <= 0)) {
            player._cervenecChurchCooldown = 12.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'MRAKOZVON SV. MARKÉTY ZVONÍ! 🔔', '#38BDF8', true);
            player.tempShield = Math.max(player.tempShield || 0, 55);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) <= 420) {
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.2);
              }
            }
          }
        } else if (inTavern) {
          this.state.cervenecActivePoiPrompt = cervenecPois.tavern.hint || null;
          if (eKeyPressed && (!player._cervenecTavernCooldown || player._cervenecTavernCooldown <= 0)) {
            player._cervenecTavernCooldown = 10.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'ŽŇOVÝ DŽBÁNEK A KOLÁČE! 🍺🥮', '#F59E0B', true);
            player.hp = Math.min(player.maxHp, player.hp + 38);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          }
        } else if (inForest) {
          this.state.cervenecActivePoiPrompt = cervenecPois.forest.hint || null;
          if (eKeyPressed && (!player._cervenecForestCooldown || player._cervenecForestCooldown <= 0)) {
            player._cervenecForestCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'SLADKÉ LESNÍ MALINY! 🍓', '#F43F5E', true);
            player.hp = Math.min(player.maxHp, player.hp + 24);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.20);
          }
        } else {
          this.state.cervenecActivePoiPrompt = null;
        }

        if (player._cervenecShrineCooldown > 0) player._cervenecShrineCooldown -= dt;
        if (player._cervenecChurchCooldown > 0) player._cervenecChurchCooldown -= dt;
        if (player._cervenecTavernCooldown > 0) player._cervenecTavernCooldown -= dt;
        if (player._cervenecForestCooldown > 0) player._cervenecForestCooldown -= dt;

        // Stage 10 Night Mechanic: Bouře svatého Eliáše (Periodic lightning strikes & lightningWitnessed trophy)
        if (isCervenecNight) {
          if (cv7.stormWarning) {
            cv7.stormWarning.timer -= dt;
            if (cv7.stormWarning.timer <= 0) {
              const sx = cv7.stormWarning.x;
              const sy = cv7.stormWarning.y;
              const sRad = cv7.stormWarning.radius || 95;
              cv7.stormWarning = null;
              this.state.lightningFlash = Math.max(this.state.lightningFlash || 0, 0.85);
              this.state.lightningStrike = { x: sx, y: sy, time: 0.45 };
              this.callbacks?.onSound?.('explosion');
              this.emitDamageText(sx, sy - 48, '⚡ BLESK SVATÉHO ELIÁŠE! ⚡', '#38BDF8', true, 'bossAnnouncements');

              const pDist = Math.hypot(player.x - sx, player.y - sy);
              if (pDist <= 450) {
                const stMeta = (this.state as any).meta || ((this.state as any).meta = { completedLevels: {}, bestiaryKills: {} });
                stMeta.lightningWitnessed = true;
              }
              if (pDist <= sRad) {
                if (typeof player.takeDamage === 'function') {
                  player.takeDamage(18, 'lightning', null, false);
                } else {
                  player.hp = Math.max(0, player.hp - 18);
                }
              }
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                if (!foe || foe.dead || foe.isDefeated || foe.id === 'kulovy_blesk') continue;
                const fDist = Math.hypot(foe.x - sx, foe.y - sy);
                if (fDist <= sRad + (foe.radius || 16)) {
                  foe.takeDamage(180, 'holy', (foe.x - sx) * 3, (foe.y - sy) * 3, { stunDuration: 0.9 });
                }
              }
            }
          } else {
            cv7.stormBoltTimer = (typeof cv7.stormBoltTimer === 'number' ? cv7.stormBoltTimer : 8.0) - dt;
            if (cv7.stormBoltTimer <= 0) {
              cv7.stormBoltTimer = 11.0;
              const offsetAng = (this.state.gameTime || 0) * 1.7;
              const tx = player.x + Math.cos(offsetAng) * 90;
              const ty = player.y + Math.sin(offsetAng) * 90;
              cv7.stormWarning = {
                x: tx,
                y: ty,
                radius: 95,
                timer: 1.2,
                maxTimer: 1.2,
              };
              this.emitDamageText(tx, ty - 32, '⚡ HROM SV. ELIÁŠE SE BLÍŽÍ! ⚡', '#BAE6FD', false);
            }
          }
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'kulovy_blesk') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getCervenecWaterEffect(e.x, e.y, this.state.gameTime || 0);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveCervenecObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 11 & 12 ("SRPEN" & "VAVŘINECKÁ NOC"): Dožínková pec na chleba (Day) & Vavřinecké vatry a padající hvězdy Perseidy (Night)
    if (this.state.activeLevelId === 10 || this.state.activeLevelId === 11) {
      const isSrpenNight = this.state.activeLevelId === 11;
      const srpenPois = getSrpenPois(isSrpenNight);
      const sr8 = this.state.srpen || (this.state.srpen = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        forestCooldown: 0,
        chlebovaPec: createInitialChlebovaPecState(),
        vatra: createInitialVavrineckaVatra(),
        perseidsShowerTimer: 7.0,
        activePerseids: [],
      });
      if (!sr8.chlebovaPec) {
        sr8.chlebovaPec = createInitialChlebovaPecState();
      }
      if (!sr8.vatra) {
        sr8.vatra = createInitialVavrineckaVatra();
      }

      // Bread oven update
      if (sr8.chlebovaPec.cooldown > 0) sr8.chlebovaPec.cooldown = Math.max(0, sr8.chlebovaPec.cooldown - dt);
      if (sr8.chlebovaPec.flourBurstTimer > 0) sr8.chlebovaPec.flourBurstTimer = Math.max(0, sr8.chlebovaPec.flourBurstTimer - dt);
      if (sr8.chlebovaPec.buffTimer > 0) {
        sr8.chlebovaPec.buffTimer = Math.max(0, sr8.chlebovaPec.buffTimer - dt);
        if (player) {
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
          player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.20);
        }
      }

      // St. Lawrence Bonfire update
      if (sr8.vatra.cooldown > 0) sr8.vatra.cooldown = Math.max(0, sr8.vatra.cooldown - dt);
      if (sr8.vatra.litTimer > 0) {
        sr8.vatra.litTimer = Math.max(0, sr8.vatra.litTimer - dt);
        if (player) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.20);
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.35);
        }
      }

      if (player && player.hp > 0) {
        const waterEffect = getSrpenWaterEffect(player.x, player.y, this.state.gameTime || 0);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        resolveSrpenObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        const inShrine = isInsideSrpenPoi(player.x, player.y, srpenPois.shrine);
        const inChurch = isInsideSrpenPoi(player.x, player.y, srpenPois.church);
        const inTavern = isInsideSrpenPoi(player.x, player.y, srpenPois.tavern);
        const inForest = isInsideSrpenPoi(player.x, player.y, srpenPois.forest);
        const inVillage = isInsideSrpenPoi(player.x, player.y, srpenPois.village);
        const inFields = isInsideSrpenPoi(player.x, player.y, srpenPois.fields);
        const inSchool = isInsideSrpenPoi(player.x, player.y, srpenPois.school);

        if (inFields) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.15);
        }
        if (inSchool) {
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.18);
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);

        // Stage 11 Daytime Mechanic: [E] Horká chlebová pec na návsi
        if (!isSrpenNight && inVillage) {
          this.state.srpenActivePoiPrompt = srpenPois.village.hint || null;
          if (eKeyPressed && sr8.chlebovaPec.cooldown <= 0) {
            sr8.chlebovaPec.cooldown = 18.0;
            sr8.chlebovaPec.buffTimer = 18.0;
            sr8.chlebovaPec.flourBurstTimer = 2.5;
            sr8.chlebovaPec.breadsBaked = (sr8.chlebovaPec.breadsBaked || 0) + 1;
            player.hp = Math.min(player.maxHp, player.hp + 35);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(
              srpenPois.village.x,
              srpenPois.village.y - 65,
              '🥖 HORKÝ BOCHNÍK Z PECE! (+25 % LÉČENÍ, +20 % ÚTOK, +15 % RYCHLOST)! 🌾✨',
              '#F59E0B',
              true,
              'bossAnnouncements'
            );
            // Knockback enemies with hot flour and spark burst
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - (sr8.chlebovaPec.x || 45);
              const dy = foe.y - (sr8.chlebovaPec.y || -95);
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 240) {
                foe.takeDamage(85 * (player.damageMultiplier || 1), 'physical', (dx / dist) * 440, (dy / dist) * 440);
                foe.slowTimer = Math.max(foe.slowTimer || 0, 2.0);
              }
            }
          }
        } else if (isSrpenNight && (inChurch || Math.hypot(player.x - sr8.vatra.x, player.y - sr8.vatra.y) <= sr8.vatra.radius)) {
          // Stage 12 Nighttime Mechanic: [E] Vavřinecká vatra na návrší
          this.state.srpenActivePoiPrompt = srpenPois.church.hint || null;
          if (eKeyPressed && sr8.vatra.cooldown <= 0) {
            sr8.vatra.cooldown = 18.0;
            sr8.vatra.litTimer = 18.0;
            this.callbacks?.onSound?.('explosion');
            this.emitDamageText(
              sr8.vatra.x,
              sr8.vatra.y - 60,
              '🔥 VAVŘINECKÁ VATRA PLÁPOLÁ! (+20 % ZBROJ, 1.5× ULTIMÁTKA)! 🌟',
              '#F97316',
              true,
              'bossAnnouncements'
            );
            player.tempShield = Math.max(player.tempShield || 0, 90);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - sr8.vatra.x;
              const dy = foe.y - sr8.vatra.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 440) {
                foe.takeDamage(110 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 420, (dy / dist) * 420);
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.5);
              }
            }
          }
        } else if (inShrine) {
          this.state.srpenActivePoiPrompt = srpenPois.shrine.hint || null;
          if (eKeyPressed && (!player._srpenShrineCooldown || player._srpenShrineCooldown <= 0)) {
            player._srpenShrineCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, isSrpenNight ? 'SVATÝ PLAMEN SV. VAVŘINCE! 🌟🕯️' : 'DOŽÍNKOVÉ POŽEHNÁNÍ! 🌾✨', '#FEF08A', true);
            if (this.state.drops) {
              applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
            }
            player.tempShield = Math.max(player.tempShield || 0, 75);
            player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.5);
          }
        } else if (inChurch && !isSrpenNight) {
          this.state.srpenActivePoiPrompt = srpenPois.church.hint || null;
          if (eKeyPressed && (!player._srpenChurchCooldown || player._srpenChurchCooldown <= 0)) {
            player._srpenChurchCooldown = 12.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POŽEHNÁNÍ ÚRODY U SV. BARTOLOMĚJE! 🔔🌾', '#38BDF8', true);
            player.tempShield = Math.max(player.tempShield || 0, 60);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) <= 420) {
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.0);
              }
            }
          }
        } else if (inTavern) {
          this.state.srpenActivePoiPrompt = srpenPois.tavern.hint || null;
          if (eKeyPressed && (!player._srpenTavernCooldown || player._srpenTavernCooldown <= 0)) {
            player._srpenTavernCooldown = 10.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'DOŽÍNKOVÉ PIVO A KOLÁČE! 🍺🥧', '#F59E0B', true);
            player.hp = Math.min(player.maxHp, player.hp + 42);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          }
        } else if (inForest) {
          this.state.srpenActivePoiPrompt = srpenPois.forest.hint || null;
          if (eKeyPressed && (!player._srpenForestCooldown || player._srpenForestCooldown <= 0)) {
            player._srpenForestCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'LESNÍ PRAMEN POD SKALAMI! 💧🌲', '#10B981', true);
            player.hp = Math.min(player.maxHp, player.hp + 25);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.22);
          }
        } else if (inSchool && !isSrpenNight) {
          this.state.srpenActivePoiPrompt = srpenPois.school.hint || null;
          if (eKeyPressed && (!player._srpenSchoolCooldown || player._srpenSchoolCooldown <= 0)) {
            player._srpenSchoolCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'ŠŤAVNATÁ DOZRÁLA JABLKA! 🍏✨', '#84CC16', true);
            player.hp = Math.min(player.maxHp, player.hp + 28);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.18);
          }
        } else {
          this.state.srpenActivePoiPrompt = null;
        }

        if (player._srpenShrineCooldown > 0) player._srpenShrineCooldown -= dt;
        if (player._srpenChurchCooldown > 0) player._srpenChurchCooldown -= dt;
        if (player._srpenTavernCooldown > 0) player._srpenTavernCooldown -= dt;
        if (player._srpenForestCooldown > 0) player._srpenForestCooldown -= dt;
        if (player._srpenSchoolCooldown > 0) player._srpenSchoolCooldown -= dt;

        // Stage 12 Night Mechanic: Vavřinecká noc padajících hvězd (Perseidy)
        if (isSrpenNight) {
          if (sr8.vatra.starWarning) {
            sr8.vatra.starWarning.timer -= dt;
            if (sr8.vatra.starWarning.timer <= 0) {
              const sx = sr8.vatra.starWarning.x;
              const sy = sr8.vatra.starWarning.y;
              const sRad = sr8.vatra.starWarning.radius || 110;
              sr8.vatra.starWarning = null;
              this.state.lightningFlash = Math.max(this.state.lightningFlash || 0, 0.70);
              this.callbacks?.onSound?.('bell');
              this.emitDamageText(sx, sy - 50, '⭐ PADÁ PERSEIDA! NEBESKÝ TŘYSK! ⭐', '#FEF08A', true, 'bossAnnouncements');

              const pDist = Math.hypot(player.x - sx, player.y - sy);
              if (pDist <= 450) {
                sr8.vatra.starsWitnessed = (sr8.vatra.starsWitnessed || 0) + 1;
                const stMeta = (this.state as any).meta || ((this.state as any).meta = { completedLevels: {}, bestiaryKills: {} });
                stMeta.perseidWitnessed = true;
              }
              // Beneficial player splash or holy power absorption
              if (pDist <= sRad) {
                player.hp = Math.min(player.maxHp, player.hp + 25);
                player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.5);
                this.emitDamageText(player.x, player.y - 45, 'HVĚZDNÉ POŽEHNÁNÍ! ✨', '#38BDF8', true);
              }
              // High damage & stun to all enemies in impact radius
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                if (!foe || foe.dead || foe.isDefeated) continue;
                const fDist = Math.hypot(foe.x - sx, foe.y - sy);
                if (fDist <= sRad + (foe.radius || 16)) {
                  foe.takeDamage(210 * (player.damageMultiplier || 1), 'holy', (foe.x - sx) * 3, (foe.y - sy) * 3, { stunDuration: 1.2 });
                }
              }
              // Spawn a glowing star drop or coins at impact
              this.spawnDrop('coin', sx, sy, { value: 5, isHot: true });
            }
          } else {
            sr8.vatra.shootingStarTimer = (typeof sr8.vatra.shootingStarTimer === 'number' ? sr8.vatra.shootingStarTimer : 6.0) - dt;
            if (sr8.vatra.shootingStarTimer <= 0) {
              sr8.vatra.shootingStarTimer = 8.5;
              const offsetAng = (this.state.gameTime || 0) * 1.5;
              const tx = player.x + Math.cos(offsetAng) * 110;
              const ty = player.y + Math.sin(offsetAng) * 110;
              sr8.vatra.starWarning = {
                x: tx,
                y: ty,
                radius: 110,
                timer: 1.1,
                maxTimer: 1.1,
              };
              this.emitDamageText(tx, ty - 32, '⭐ STOPOVÁ HVĚZDA PADÁ Z NEBE! ⭐', '#FEF08A', false);
            }
          }
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'srpnove_cmelak' || e.id === 'kralovsky_cmelak' || e.id === 'netopyr_usatec' || e.id === 'nocni_mura' || e.id === 'vyr_velky') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getSrpenWaterEffect(e.x, e.y, this.state.gameTime || 0);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveSrpenObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 13 & 14 ("ZÁŘÍ" & "SVATOVÁCLAVSKÁ NOC"): Kotel na povidla (Day) & Svatováclavský svatý oheň a mlhy (Night)
    if (this.state.activeLevelId === 12 || this.state.activeLevelId === 13) {
      const isZariNight = this.state.activeLevelId === 13;
      const zariPois = getZariPois(isZariNight);
      const zr9 = this.state.zari || (this.state.zari = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        forestCooldown: 0,
        kotel: createInitialKotelNaPovidlaState(),
        ohen: createInitialSvatovaclavskyOhenState(),
      });
      if (!zr9.kotel) {
        zr9.kotel = createInitialKotelNaPovidlaState();
      }
      if (!zr9.ohen) {
        zr9.ohen = createInitialSvatovaclavskyOhenState();
      }

      // Kotel na povidla update (Stage 13 Day)
      if (zr9.kotel.cooldown > 0) zr9.kotel.cooldown = Math.max(0, zr9.kotel.cooldown - dt);
      if (zr9.kotel.splashBurstTimer > 0) zr9.kotel.splashBurstTimer = Math.max(0, zr9.kotel.splashBurstTimer - dt);
      if (zr9.kotel.stirActiveTimer > 0) {
        zr9.kotel.stirActiveTimer = Math.max(0, zr9.kotel.stirActiveTimer - dt);
        if (player) {
          if (player.weapons) {
            for (let wIdx = 0; wIdx < player.weapons.length; wIdx++) {
              const w: any = player.weapons[wIdx];
              if (w && w.cd > 0) {
                w.cd = Math.max(0, w.cd - dt * 0.20);
              }
            }
          }
          player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.20);
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
        }
      }

      // Svatováclavský svatý oheň update (Stage 14 Night)
      if (zr9.ohen.cooldown > 0) zr9.ohen.cooldown = Math.max(0, zr9.ohen.cooldown - dt);
      if (zr9.ohen.blessingActiveTimer > 0) {
        zr9.ohen.blessingActiveTimer = Math.max(0, zr9.ohen.blessingActiveTimer - dt);
        if (player) {
          player.arenaArmorBonus = Math.max(player.arenaArmorBonus || 0, 0.25);
          player.damageReduction = Math.max(player.damageReduction || 0, 0.25);
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.35);
          if (player.ultCd > 0) {
            player.ultCd = Math.max(0, player.ultCd - dt * 0.5);
          }
        }
      }

      if (zr9.shrineCooldown > 0) zr9.shrineCooldown = Math.max(0, zr9.shrineCooldown - dt);
      if (zr9.bellCooldown > 0) zr9.bellCooldown = Math.max(0, zr9.bellCooldown - dt);
      if (zr9.tavernCooldown > 0) zr9.tavernCooldown = Math.max(0, zr9.tavernCooldown - dt);
      if (zr9.forestCooldown > 0) zr9.forestCooldown = Math.max(0, zr9.forestCooldown - dt);

      if (player && player.hp > 0) {
        const waterEffect = getZariWaterEffect(player.x, player.y, this.state.gameTime || 0, isZariNight);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        resolveZariObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        const inShrine = isInsideZariPoi(player.x, player.y, zariPois.shrine);
        const inChurch = isInsideZariPoi(player.x, player.y, zariPois.church);
        const inTavern = isInsideZariPoi(player.x, player.y, zariPois.tavern);
        const inForest = isInsideZariPoi(player.x, player.y, zariPois.forest);
        const inVillage = isInsideZariPoi(player.x, player.y, zariPois.village);
        const inFields = isInsideZariPoi(player.x, player.y, zariPois.fields);
        const inSchool = isInsideZariPoi(player.x, player.y, zariPois.school);

        if (inFields) {
          player.arenaArmorBonus = Math.max(player.arenaArmorBonus || 0, 0.18);
          player.damageReduction = Math.max(player.damageReduction || 0, 0.18);
        }
        if (inSchool) {
          if (isZariNight) {
            player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.20);
          } else {
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.18);
          }
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);

        // Stage 13 Daytime Mechanic: [E] Kotel na povidla na návsi
        if (!isZariNight && inVillage) {
          this.state.zariActivePoiPrompt = zr9.kotel.cooldown <= 0
            ? '[E] Zamíchat povidla (Kotel)'
            : `Povidla v kotli probublávají (${Math.ceil(zr9.kotel.cooldown)}s)`;
          if (eKeyPressed && zr9.kotel.cooldown <= 0) {
            zr9.kotel.cooldown = 20.0;
            zr9.kotel.stirActiveTimer = 18.0;
            zr9.kotel.splashBurstTimer = 2.5;
            zr9.kotel.batchesCooked = (zr9.kotel.batchesCooked || 0) + 1;
            player.hp = Math.min(player.maxHp, player.hp + 35);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(
              zariPois.village.x,
              zariPois.village.y - 65,
              '🍑 SLADKÁ POSVÍCENSKÁ KURÁŽ Z KOTLE! (+35 KURÁŽ, +25 % ÚTOK, +20 % DOBÍJENÍ)! 🥄✨',
              '#C084FC',
              true,
              'bossAnnouncements'
            );
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - (zr9.kotel.x || 45);
              const dy = foe.y - (zr9.kotel.y || -95);
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 380) {
                foe.takeDamage(95 * (player.damageMultiplier || 1), 'fire', (dx / dist) * 440, (dy / dist) * 440);
                foe.slowTimer = Math.max(foe.slowTimer || 0, 2.5);
              }
            }
          }
        } else if (isZariNight && (inChurch || Math.hypot(player.x - zr9.ohen.x, player.y - zr9.ohen.y) <= zr9.ohen.radius)) {
          // Stage 14 Nighttime Mechanic: [E] Svatováclavský svatý oheň u kostela
          this.state.zariActivePoiPrompt = zr9.ohen.cooldown <= 0
            ? '[E] Zažehnout svatý oheň (Kostel)'
            : `Svatováclavský oheň plápolá (${Math.ceil(zr9.ohen.cooldown)}s)`;
          if (eKeyPressed && zr9.ohen.cooldown <= 0) {
            zr9.ohen.cooldown = 20.0;
            zr9.ohen.blessingActiveTimer = 18.0;
            zr9.ohen.firesKindled = (zr9.ohen.firesKindled || 0) + 1;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(
              zr9.ohen.x,
              zr9.ohen.y - 60,
              '🔥 SVATOVÁCLAVSKÁ ZÁŠTITA PLÁPOLÁ! (+95 ŠTÍT, +25 % ZBROJ, +35 % DOBÍJENÍ)! 🕯️✨',
              '#FBBF24',
              true,
              'bossAnnouncements'
            );
            player.tempShield = Math.max(player.tempShield || 0, 95);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - zr9.ohen.x;
              const dy = foe.y - zr9.ohen.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 440) {
                foe.takeDamage(120 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 420, (dy / dist) * 420);
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.5);
              }
            }
          }
        } else if (inShrine) {
          this.state.zariActivePoiPrompt = (zr9.shrineCooldown || 0) <= 0
            ? (isZariNight ? '[E] Přijmout svatováclavské požehnání (Boží muka)' : '[E] Přijmout posvícenské požehnání (Boží muka)')
            : `Boží muka odpočívá (${Math.ceil(zr9.shrineCooldown || 0)}s)`;
          if (eKeyPressed && (!zr9.shrineCooldown || zr9.shrineCooldown <= 0)) {
            zr9.shrineCooldown = 30.0;
            player._zariShrineCooldown = 30.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, isZariNight ? 'SVATOVÁCLAVSKÉ POŽEHNÁNÍ! 🕯️✨' : 'POSVÍCENSKÉ POŽEHNÁNÍ! 🍑✨', '#FEF08A', true);
            if (this.state.drops) {
              applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
            }
            player.tempShield = Math.max(player.tempShield || 0, 80);
            player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.5);
          }
        } else if (inChurch && !isZariNight) {
          this.state.zariActivePoiPrompt = (zr9.bellCooldown || 0) <= 0
            ? '[E] Rozeznít zvon (Kostel)'
            : `Zvon odpočívá (${Math.ceil(zr9.bellCooldown || 0)}s)`;
          if (eKeyPressed && (!zr9.bellCooldown || zr9.bellCooldown <= 0)) {
            zr9.bellCooldown = 35.0;
            player._zariChurchCooldown = 35.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POSVÍCENSKÝ ZVON SV. BARTOLOMĚJE! 🔔🍑', '#38BDF8', true);
            player.tempShield = Math.max(player.tempShield || 0, 65);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) <= 420) {
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.0);
              }
            }
          }
        } else if (inTavern) {
          this.state.zariActivePoiPrompt = (zr9.tavernCooldown || 0) <= 0
            ? '[E] Ochutnat posvícenské koláče (Hospoda)'
            : `Šenkýř chystá koláče (${Math.ceil(zr9.tavernCooldown || 0)}s)`;
          if (eKeyPressed && (!zr9.tavernCooldown || zr9.tavernCooldown <= 0)) {
            zr9.tavernCooldown = 35.0;
            player._zariTavernCooldown = 35.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'POSVÍCENSKÉ KOLÁČE A DŽBÁNEK! 🥧🍺', '#F59E0B', true);
            player.hp = Math.min(player.maxHp, player.hp + 45);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          }
        } else if (inForest) {
          this.state.zariActivePoiPrompt = (zr9.forestCooldown || 0) <= 0
            ? '[E] Napít se z pramene (Hvozd)'
            : `Pramen doplňuje vodu (${Math.ceil(zr9.forestCooldown || 0)}s)`;
          if (eKeyPressed && (!zr9.forestCooldown || zr9.forestCooldown <= 0)) {
            zr9.forestCooldown = 30.0;
            player._zariForestCooldown = 30.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'PRAMEN POD BUKOVÝM LESEM! 💧🍂', '#10B981', true);
            player.hp = Math.min(player.maxHp, player.hp + 28);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.22);
          }
        } else {
          this.state.zariActivePoiPrompt = null;
        }

        if (player._zariShrineCooldown > 0) player._zariShrineCooldown -= dt;
        if (player._zariChurchCooldown > 0) player._zariChurchCooldown -= dt;
        if (player._zariTavernCooldown > 0) player._zariTavernCooldown -= dt;
        if (player._zariForestCooldown > 0) player._zariForestCooldown -= dt;

        // Stage 14 Night Mechanic: Svatováclavský mlžný poryv
        if (isZariNight) {
          if (zr9.ohen.mistWarning) {
            zr9.ohen.mistWarning.timer -= dt;
            if (zr9.ohen.mistWarning.timer <= 0) {
              const mx = zr9.ohen.mistWarning.x;
              const my = zr9.ohen.mistWarning.y;
              const mRad = zr9.ohen.mistWarning.radius || 115;
              zr9.ohen.mistWarning = null;
              this.callbacks?.onSound?.('howl');
              this.emitDamageText(mx, my - 50, '🌫️ SVATOVÁCLAVSKÝ VICHR ROZehnal MLHU! 🌪️✨', '#7DD3FC', true, 'bossAnnouncements');
              const pDist = Math.hypot(player.x - mx, player.y - my);
              if (pDist <= mRad) {
                player.hp = Math.min(player.maxHp, player.hp + 25);
                player.tempShield = Math.max(player.tempShield || 0, 50);
                this.emitDamageText(player.x, player.y - 45, 'SVATOVÁCLAVSKÝ DECH! ✨', '#38BDF8', true);
              }
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                if (!foe || foe.dead || foe.isDefeated) continue;
                const fDist = Math.hypot(foe.x - mx, foe.y - my);
                if (fDist <= mRad + (foe.radius || 16)) {
                  foe.takeDamage(190 * (player.damageMultiplier || 1), 'holy', (foe.x - mx) * 3, (foe.y - my) * 3, { stunDuration: 1.2 });
                }
              }
              this.spawnDrop('coin', mx, my, { value: 5, isHot: true });
            }
          } else {
            zr9.ohen.mistGustTimer = (typeof zr9.ohen.mistGustTimer === 'number' ? zr9.ohen.mistGustTimer : 7.5) - dt;
            if (zr9.ohen.mistGustTimer <= 0) {
              zr9.ohen.mistGustTimer = 9.0;
              const offsetAng = (this.state.gameTime || 0) * 1.4;
              const tx = player.x + Math.cos(offsetAng) * 110;
              const ty = player.y + Math.sin(offsetAng) * 110;
              zr9.ohen.mistWarning = {
                x: tx,
                y: ty,
                radius: 115,
                timer: 1.1,
                maxTimer: 1.1,
              };
              this.emitDamageText(tx, ty - 32, '🌫️ SToupá SVATOVÁCLAVSKÁ MLHA! 🌫️', '#BAE6FD', false);
            }
          }
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'svestkovy_srsen' || e.id === 'kralovsky_srsen' || e.id === 'srpnove_cmelak' || e.id === 'zlatohlavek' || e.id === 'bludicka' || e.id === 'nocni_mura' || e.id === 'bila_pani' || e.id === 'kvilici_meluzina') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getZariWaterEffect(e.x, e.y, this.state.gameTime || 0, isZariNight);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
        }
        resolveZariObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 15 & 16 ("ŘÍJEN"): Ohníček na návsi (Day) & Dušičková svíce a výlov (Night)
    if (this.state.activeLevelId === 14 || this.state.activeLevelId === 15) {
      const isRijenNight = this.state.activeLevelId === 15;
      const rijenPois = getRijenPois(isRijenNight);
      const rj10 = this.state.rijen || (this.state.rijen = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        forestCooldown: 0,
        ohnicek: createInitialOhnicekBramborState(),
        svice: createInitialDusickovaSviceState(),
      });
      if (!rj10.ohnicek) {
        rj10.ohnicek = createInitialOhnicekBramborState();
      }
      if (!rj10.svice) {
        rj10.svice = createInitialDusickovaSviceState();
      }

      // Ohníček z bramborové natě update (Stage 15 Day)
      if (rj10.ohnicek.cooldown > 0) rj10.ohnicek.cooldown = Math.max(0, rj10.ohnicek.cooldown - dt);
      if (rj10.ohnicek.smokeBurstTimer > 0) rj10.ohnicek.smokeBurstTimer = Math.max(0, rj10.ohnicek.smokeBurstTimer - dt);
      if (rj10.ohnicek.sparksTimer > 0) {
        rj10.ohnicek.sparksTimer = Math.max(0, rj10.ohnicek.sparksTimer - dt);
        if (player) {
          player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.20);
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
        }
      }

      // Dušičková svíce u Božích muk update (Stage 16 Night)
      if (rj10.svice.cooldown > 0) rj10.svice.cooldown = Math.max(0, rj10.svice.cooldown - dt);
      if (rj10.svice.candleActiveTimer > 0) {
        rj10.svice.candleActiveTimer = Math.max(0, rj10.svice.candleActiveTimer - dt);
        if (player) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.30);
          player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.35);
        }
      }

      if (player && player.hp > 0) {
        const waterEffect = getRijenWaterEffect(player.x, player.y, this.state.gameTime || 0, isRijenNight);
        if (waterEffect.inOpenWater) {
          player.x += waterEffect.carryVx * dt;
          player.y += waterEffect.carryVy * dt;
        }
        if (waterEffect.inMudPond) {
          player.speedMultiplier = Math.min(player.speedMultiplier || 1, 0.75);
        }
        resolveRijenObstacles(player, false);
        clampToMarchArenaBounds(player, 28);

        const inShrine = isInsideRijenPoi(player.x, player.y, rijenPois.shrine);
        const inChurch = isInsideRijenPoi(player.x, player.y, rijenPois.church);
        const inTavern = isInsideRijenPoi(player.x, player.y, rijenPois.tavern);
        const inForest = isInsideRijenPoi(player.x, player.y, rijenPois.forest);
        const inVillage = isInsideRijenPoi(player.x, player.y, rijenPois.village);
        const inFields = isInsideRijenPoi(player.x, player.y, rijenPois.fields);
        const inSchool = isInsideRijenPoi(player.x, player.y, rijenPois.school);

        if (inFields) {
          player.damageReduction = Math.max(player.damageReduction || 0, 0.18);
        }
        if (inSchool) {
          player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
        }

        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);

        // Stage 15 Daytime Mechanic: [E] Ohníček z bramborové natě na návsi
        if (!isRijenNight && inVillage) {
          this.state.rijenActivePoiPrompt = rijenPois.village.hint || null;
          if (eKeyPressed && rj10.ohnicek.cooldown <= 0) {
            rj10.ohnicek.cooldown = 20.0;
            rj10.ohnicek.sparksTimer = 18.0;
            rj10.ohnicek.smokeBurstTimer = 2.5;
            rj10.ohnicek.potatoesRoasted = (rj10.ohnicek.potatoesRoasted || 0) + 1;
            player.hp = Math.min(player.maxHp, player.hp + 40);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(
              rj10.ohnicek.x,
              rj10.ohnicek.y - 65,
              '🥔 HORKÁ PEČENÁ BRAMBORA Z POPELA! (+40 KURÁŽ, +25 % ÚTOK, +20 % DOBÍJENÍ)! 🥔✨',
              '#F59E0B',
              true,
              'bossAnnouncements'
            );
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - rj10.ohnicek.x;
              const dy = foe.y - rj10.ohnicek.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 380) {
                foe.takeDamage(100 * (player.damageMultiplier || 1), 'fire', (dx / dist) * 440, (dy / dist) * 440);
                foe.slowTimer = Math.max(foe.slowTimer || 0, 2.5);
              }
            }
          }
        } else if (isRijenNight && (inShrine || Math.hypot(player.x - rj10.svice.x, player.y - rj10.svice.y) <= rj10.svice.radius)) {
          // Stage 16 Nighttime Mechanic: [E] Zažehnout dušičkovou svíci u Božích muk
          this.state.rijenActivePoiPrompt = rijenPois.shrine.hint || null;
          if (eKeyPressed && rj10.svice.cooldown <= 0) {
            rj10.svice.cooldown = 20.0;
            rj10.svice.candleActiveTimer = 18.0;
            rj10.svice.candlesLit = (rj10.svice.candlesLit || 0) + 1;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(
              rj10.svice.x,
              rj10.svice.y - 60,
              '🕯️ DUŠIČKOVÁ POSVÁTNÁ OCHRANA! (+100 ŠTÍT, +30 % ZBROJ, +35 % DOBÍJENÍ)! 🕯️✨',
              '#38BDF8',
              true,
              'bossAnnouncements'
            );
            player.tempShield = Math.max(player.tempShield || 0, 100);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (!foe || foe.dead || foe.isDefeated) continue;
              const dx = foe.x - rj10.svice.x;
              const dy = foe.y - rj10.svice.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist <= 440) {
                foe.takeDamage(130 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 440, (dy / dist) * 440);
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.5);
              }
            }
          }
        } else if (inChurch) {
          this.state.rijenActivePoiPrompt = rijenPois.church.hint || null;
          if (eKeyPressed && (!player._rijenChurchCooldown || player._rijenChurchCooldown <= 0)) {
            player._rijenChurchCooldown = 12.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'ŘÍJNOVÝ ZVON SV. MIKULÁŠE! 🔔🍂', '#38BDF8', true);
            player.tempShield = Math.max(player.tempShield || 0, 70);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) <= 420) {
                foe.panicked = true;
                foe.panicTimer = Math.max(foe.panicTimer || 0, 3.0);
              }
            }
          }
        } else if (inTavern) {
          this.state.rijenActivePoiPrompt = rijenPois.tavern.hint || null;
          if (eKeyPressed && (!player._rijenTavernCooldown || player._rijenTavernCooldown <= 0)) {
            player._rijenTavernCooldown = 10.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, isRijenNight ? 'DUŠIČKOVÁ POLÉVKA A ČAJ! 🍵🕯️' : 'BRAMBOROVÁ POLÉVKA S HOUBAMI! 🍲🥔', '#F59E0B', true);
            player.hp = Math.min(player.maxHp, player.hp + 45);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
          }
        } else if (inForest) {
          this.state.rijenActivePoiPrompt = rijenPois.forest.hint || null;
          if (eKeyPressed && (!player._rijenForestCooldown || player._rijenForestCooldown <= 0)) {
            player._rijenForestCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'PODZIMNÍ STUDÁNKA V BUKOVÉM LESE! 💧🍁', '#10B981', true);
            player.hp = Math.min(player.maxHp, player.hp + 30);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.20);
          }
        } else if (inShrine && !isRijenNight) {
          this.state.rijenActivePoiPrompt = rijenPois.shrine.hint || null;
          if (eKeyPressed && (!player._rijenShrineCooldown || player._rijenShrineCooldown <= 0)) {
            player._rijenShrineCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POŽEHNÁNÍ OD BOŽÍCH MUK! 🌾✨', '#FEF08A', true);
            if (this.state.drops) {
              applyMagnetWave(this.state.drops, player.x, player.y, 99999, true);
            }
            player.tempShield = Math.max(player.tempShield || 0, 75);
            player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 2.0);
          }
        } else if (inSchool && !isRijenNight) {
          this.state.rijenActivePoiPrompt = rijenPois.school.hint || null;
          if (eKeyPressed && (!player._rijenSchoolCooldown || player._rijenSchoolCooldown <= 0)) {
            player._rijenSchoolCooldown = 8.0;
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'ŠKOLNÍ PAPÍROVÝ DRAK! 🪁✨', '#FB923C', true);
            player.hp = Math.min(player.maxHp, player.hp + 25);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.22);
          }
        } else {
          this.state.rijenActivePoiPrompt = null;
        }

        if (player._rijenShrineCooldown > 0) player._rijenShrineCooldown -= dt;
        if (player._rijenChurchCooldown > 0) player._rijenChurchCooldown -= dt;
        if (player._rijenTavernCooldown > 0) player._rijenTavernCooldown -= dt;
        if (player._rijenForestCooldown > 0) player._rijenForestCooldown -= dt;
        if (player._rijenSchoolCooldown > 0) player._rijenSchoolCooldown -= dt;

        // Stage 16 Night Mechanic: Dušičkový větrný poryv
        if (isRijenNight) {
          if (rj10.svice.windWarning) {
            rj10.svice.windWarning.timer -= dt;
            if (rj10.svice.windWarning.timer <= 0) {
              const wx = rj10.svice.windWarning.x;
              const wy = rj10.svice.windWarning.y;
              const wRad = rj10.svice.windWarning.radius || 120;
              rj10.svice.windWarning = null;
              this.callbacks?.onSound?.('howl');
              this.emitDamageText(wx, wy - 50, '🕯️ SVĚTLO ROZEHNALO NOČNÍ STÍNY! 💨✨', '#38BDF8', true, 'bossAnnouncements');
              const pDist = Math.hypot(player.x - wx, player.y - wy);
              if (pDist <= wRad) {
                player.hp = Math.min(player.maxHp, player.hp + 25);
                player.tempShield = Math.max(player.tempShield || 0, 50);
                this.emitDamageText(player.x, player.y - 45, 'DUŠIČKOVÝ POKOJ! ✨', '#38BDF8', true);
              }
              for (let j = 0; j < this.livingEnemies.length; j++) {
                const foe = this.livingEnemies[j];
                if (!foe || foe.dead || foe.isDefeated) continue;
                const fDist = Math.hypot(foe.x - wx, foe.y - wy);
                if (fDist <= wRad + (foe.radius || 16)) {
                  foe.takeDamage(200 * (player.damageMultiplier || 1), 'holy', (foe.x - wx) * 3, (foe.y - wy) * 3, { stunDuration: 1.2 });
                }
              }
              this.spawnDrop('coin', wx, wy, { value: 5, isHot: true });
            }
          } else {
            rj10.svice.windGustTimer = (typeof rj10.svice.windGustTimer === 'number' ? rj10.svice.windGustTimer : 7.0) - dt;
            if (rj10.svice.windGustTimer <= 0) {
              rj10.svice.windGustTimer = 9.0;
              const offsetAng = (this.state.gameTime || 0) * 1.5;
              const tx = player.x + Math.cos(offsetAng) * 115;
              const ty = player.y + Math.sin(offsetAng) * 115;
              rj10.svice.windWarning = {
                x: tx,
                y: ty,
                radius: 120,
                timer: 1.1,
                maxTimer: 1.1,
              };
              this.emitDamageText(tx, ty - 32, '🕯️ PORYV DUŠIČKOVÉHO VĚTRU! 🕯️', '#BAE6FD', false);
            }
          }
        }
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'kralovsky_havran' || e.id === 'drak_vetrnik' || e.id === 'dusickova_bludicka' || e.id === 'svestkovy_srsen' || e.id === 'kralovsky_srsen' || e.id === 'srpnove_cmelak' || e.id === 'zlatohlavek' || e.id === 'bludicka' || e.id === 'nocni_mura' || e.id === 'bila_pani' || e.id === 'kvilici_meluzina') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getRijenWaterEffect(e.x, e.y, this.state.gameTime || 0, isRijenNight);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.x += eWater.carryVx * dt;
            e.y += eWater.carryVy * dt;
            e.slowTimer = Math.max(e.slowTimer || 0, 0.35);
          }
          if (eWater.inMudPond && !isAquaticEnemy(e)) {
            e.slowTimer = Math.max(e.slowTimer || 0, 0.4);
          }
        }
        resolveRijenObstacles(e, isFlying);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 17 & 18 ("LISTOPAD"): Svatomartinská husa (Day) & Uhlířský milíř (Night)
    if (this.state.activeLevelId === 16 || this.state.activeLevelId === 17) {
      const isListopadNight = this.state.activeLevelId === 17;
      const listopadPois = getListopadPois(isListopadNight);
      const lp = this.state.listopad || (this.state.listopad = {
        tavernCooldown: 0,
        shrineCooldown: 0,
        schoolCooldown: 0,
        forestCooldown: 0,
        husaPekac: createInitialSvatomartinskaHusaPekacState(),
        milir: createInitialUhliarskyMilirState(),
      });
      if (!lp.husaPekac) lp.husaPekac = createInitialSvatomartinskaHusaPekacState();
      if (!lp.milir) lp.milir = createInitialUhliarskyMilirState();

      if (lp.husaPekac.cooldown > 0) lp.husaPekac.cooldown = Math.max(0, lp.husaPekac.cooldown - dt);
      if (lp.milir.cooldown > 0) lp.milir.cooldown = Math.max(0, lp.milir.cooldown - dt);

      if (player && player.hp > 0) {
        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
        const waterEffect = getListopadWaterEffect(player.x, player.y, this.state.activeLevelId);
        if (waterEffect.inOpenWater) {
          player.speedModifier = (player.speedModifier || 1) * waterEffect.speedMult;
        }

        resolveListopadObstacles(player, 22);
        clampToMarchArenaBounds(player, 28);

        const inTavern = isInsideListopadPoi(player.x, player.y, listopadPois.tavern);
        const inForest = isInsideListopadPoi(player.x, player.y, listopadPois.forest);
        const inChurch = isInsideListopadPoi(player.x, player.y, listopadPois.church);
        const inShrine = isInsideListopadPoi(player.x, player.y, listopadPois.shrine);
        const inVillage = isInsideListopadPoi(player.x, player.y, listopadPois.village);

        if (!isListopadNight && inTavern) {
          this.state.listopadActivePoiPrompt = lp.husaPekac.cooldown <= 0
            ? '[E] Ochutnat svatomartinskou husu (Hospoda U Sejků)'
            : `Husa se peče v troubě (${Math.ceil(lp.husaPekac.cooldown)}s)`;
          if (eKeyPressed && lp.husaPekac.cooldown <= 0) {
            lp.husaPekac.cooldown = 20.0;
            lp.husaPekac.feastsEaten++;
            player.hp = Math.min(player.maxHp, player.hp + 45);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
            player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.20);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.15);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'SVATOMARTINSKÁ PEČENÁ HUSA! 🪿 (+45 Kuráž, +25% útok)', '#F59E0B', true);

            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) < 380) {
                foe.takeDamage(160 * (player.damageMultiplier || 1), 'fire', (foe.x - player.x) * 2.5, (foe.y - player.y) * 2.5);
                foe.panicked = true;
              }
            }
          }
        } else if (isListopadNight && inForest) {
          this.state.listopadActivePoiPrompt = lp.milir.cooldown <= 0
            ? '[E] Přiložit do milíře (Uhlířský milíř)'
            : `Uhlí v milíři žhne (${Math.ceil(lp.milir.cooldown)}s)`;
          if (eKeyPressed && lp.milir.cooldown <= 0) {
            lp.milir.cooldown = 20.0;
            lp.milir.woodFed++;
            player.shield = Math.min(250, (player.shield || 0) + 90);
            player.speedMultiplier = Math.max(player.speedMultiplier || 1, 1.30);
            this.callbacks?.onSound?.('fire');
            this.emitDamageText(player.x, player.y - 45, 'UHLÍŘSKÝ MILÍŘ ŽHNE! 🌫️ (+90 Štít, dým)', '#E2E8F0', true);

            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - lp.milir.x, foe.y - lp.milir.y) < 440) {
                foe.takeDamage(220 * (player.damageMultiplier || 1), 'fire', (foe.x - lp.milir.x) * 3, (foe.y - lp.milir.y) * 3);
                foe.stunTimer = Math.max(foe.stunTimer || 0, 2.0);
              }
            }
          }
        } else if (inChurch) {
          this.state.listopadActivePoiPrompt = (lp.tavernCooldown <= 0)
            ? '[E] Rozeznít zvon sv. Mikuláše (Kostel)'
            : `Zvon sv. Mikuláše chladne (${Math.ceil(lp.tavernCooldown)}s)`;
          if (eKeyPressed && lp.tavernCooldown <= 0) {
            lp.tavernCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'ZVON SV. MIKULÁŠE! 🔔 (+75 Štít)', '#FEF08A', true);
            player.shield = Math.min(250, (player.shield || 0) + 75);
          }
        } else if (inShrine) {
          this.state.listopadActivePoiPrompt = (lp.shrineCooldown <= 0)
            ? '[E] Pomodlit se u Božích muk (Boží muka)'
            : `Boží muka (${Math.ceil(lp.shrineCooldown)}s)`;
          if (eKeyPressed && lp.shrineCooldown <= 0) {
            lp.shrineCooldown = 15.0;
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POŽEHNÁNÍ POUTNÍKŮ! ✝️', '#FEF08A', true);
            player.hp = Math.min(player.maxHp, player.hp + 35);
          }
        } else if (inVillage) {
          this.state.listopadActivePoiPrompt = listopadPois.village.hint || null;
        } else {
          this.state.listopadActivePoiPrompt = null;
        }

        if (lp.tavernCooldown > 0) lp.tavernCooldown = Math.max(0, lp.tavernCooldown - dt);
        if (lp.shrineCooldown > 0) lp.shrineCooldown = Math.max(0, lp.shrineCooldown - dt);
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'kralovska_husa' || e.id === 'mlzny_prizrak' || e.id === 'vrana') && !e.isGroundedForLoot);
        if (!isFlying) {
          const eWater = getListopadWaterEffect(e.x, e.y, this.state.activeLevelId);
          if (eWater.inOpenWater && !isAquaticEnemy(e)) {
            e.slowTimer = Math.max(e.slowTimer || 0, 0.4);
          }
        }
        resolveListopadObstacles(e, 22);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 19 & 20 ("PROSINEC"): Adventní věnec (Day) & Štědrovečerní zvon (Night)
    if (this.state.activeLevelId === 18 || this.state.activeLevelId === 19) {
      const isProsinecNight = this.state.activeLevelId === 19;
      const prosinecPois = getProsinecPois(isProsinecNight);
      const pr = this.state.prosinec || (this.state.prosinec = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        schoolCooldown: 0,
        advent: createInitialAdventniVenecState(),
        zvon: createInitialStedrovecerniZvonState(),
      });
      if (!pr.advent) pr.advent = createInitialAdventniVenecState();
      if (!pr.zvon) pr.zvon = createInitialStedrovecerniZvonState();

      if (pr.advent.cooldown > 0) pr.advent.cooldown = Math.max(0, pr.advent.cooldown - dt);
      if (pr.zvon.cooldown > 0) pr.zvon.cooldown = Math.max(0, pr.zvon.cooldown - dt);

      if (player && player.hp > 0) {
        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
        const waterEffect = getProsinecWaterEffect(player.x, player.y, this.state.activeLevelId);
        if (waterEffect.onIce) {
          player.speedModifier = (player.speedModifier || 1) * waterEffect.speedMult;
        }

        resolveProsinecObstacles(player, 22);
        clampToMarchArenaBounds(player, 28);

        const inVillage = isInsideProsinecPoi(player.x, player.y, prosinecPois.village);
        const inChurch = isInsideProsinecPoi(player.x, player.y, prosinecPois.church);
        const inTavern = isInsideProsinecPoi(player.x, player.y, prosinecPois.tavern);
        const inShrine = isInsideProsinecPoi(player.x, player.y, prosinecPois.shrine);

        if (!isProsinecNight && inVillage) {
          this.state.prosinecActivePoiPrompt = pr.advent.cooldown <= 0
            ? '[E] Zapálit adventní svíci (Návesní lípa)'
            : `Adventní věnec plane (${Math.ceil(pr.advent.cooldown)}s)`;
          if (eKeyPressed && pr.advent.cooldown <= 0) {
            pr.advent.cooldown = 20.0;
            pr.advent.candlesLit++;
            player.hp = Math.min(player.maxHp, player.hp + 50);
            player.damageMultiplier = Math.max(player.damageMultiplier || 1, 1.25);
            player.defenseMultiplier = Math.max(player.defenseMultiplier || 1, 1.30);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'ADVENTNÍ SVÍCE PLANE! 🕯️ (+50 HP, +25% útok)', '#FDE047', true);

            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - player.x, foe.y - player.y) < 420) {
                foe.takeDamage(200 * (player.damageMultiplier || 1), 'holy', (foe.x - player.x) * 3, (foe.y - player.y) * 3);
                foe.panicked = true;
              }
            }
          }
        } else if (isProsinecNight && inChurch) {
          this.state.prosinecActivePoiPrompt = pr.zvon.cooldown <= 0
            ? '[E] Rozeznít štědrovečerní zvon (Kostel sv. Mikuláše)'
            : `Štědrovečerní zvon chladne (${Math.ceil(pr.zvon.cooldown)}s)`;
          if (eKeyPressed && pr.zvon.cooldown <= 0) {
            pr.zvon.cooldown = 20.0;
            pr.zvon.bellsTolled++;
            player.shield = Math.min(300, (player.shield || 0) + 120);
            player.cooldownMultiplier = Math.max(player.cooldownMultiplier || 1, 1.35);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'ŠTĚDROVEČERNÍ ZVON SV. MIKULÁŠE! 🔔 (+120 Štít, omráčení)', '#BAE6FD', true);

            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (foe.dead || foe.isDefeated) continue;
              if (Math.hypot(foe.x - prosinecPois.church.x, foe.y - prosinecPois.church.y) < 600) {
                foe.takeDamage(280 * (player.damageMultiplier || 1), 'holy', (foe.x - prosinecPois.church.x) * 4, (foe.y - prosinecPois.church.y) * 4);
                foe.stunTimer = Math.max(foe.stunTimer || 0, 3.5);
              }
            }
          }
        } else if (inTavern) {
          this.state.prosinecActivePoiPrompt = (pr.tavernCooldown <= 0)
            ? '[E] Ohřát se u kachlových kamen (Hospoda U Sejků)'
            : `Kachlová kamna (${Math.ceil(pr.tavernCooldown)}s)`;
          if (eKeyPressed && pr.tavernCooldown <= 0) {
            pr.tavernCooldown = 15.0;
            player.hp = Math.min(player.maxHp, player.hp + 50);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'HORKÝ PUNČ A KACHLOVÁ KAMNA! ☕ (+50 Kuráž)', '#F59E0B', true);
          }
        } else if (inShrine) {
          this.state.prosinecActivePoiPrompt = (pr.shrineCooldown <= 0)
            ? '[E] Zapálit štědrovečerní lucernu (Boží muka)'
            : `Lucerna (${Math.ceil(pr.shrineCooldown)}s)`;
          if (eKeyPressed && pr.shrineCooldown <= 0) {
            pr.shrineCooldown = 15.0;
            player.shield = Math.min(250, (player.shield || 0) + 95);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'ŠTĚDROVEČERNÍ LUCERNA! ⭐ (+95 Štít)', '#FEF08A', true);
          }
        } else {
          this.state.prosinecActivePoiPrompt = null;
        }

        if (pr.tavernCooldown > 0) pr.tavernCooldown = Math.max(0, pr.tavernCooldown - dt);
        if (pr.shrineCooldown > 0) pr.shrineCooldown = Math.max(0, pr.shrineCooldown - dt);
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        const isFlying = Boolean((e.isFlying || e.id === 'mraziva_sova' || e.id === 'jezdec_meluziny' || e.id === 'vrana') && !e.isGroundedForLoot);
        resolveProsinecObstacles(e, 22);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 21 & 22 ("LEDEN"): Postavit sněhuláka (Day) & Posvěcení dveří křídou K+M+B (Night)
    if (this.state.activeLevelId === 20 || this.state.activeLevelId === 21) {
      const isLedenNight = this.state.activeLevelId === 21;
      const ledenPois = getLedenPois(isLedenNight);
      const ld = this.state.leden || (this.state.leden = {
        bellCooldown: 0,
        shrineCooldown: 0,
        tavernCooldown: 0,
        schoolCooldown: 0,
        snehulak: createInitialSnehulakNavesState(),
        fara: createInitialTrikralovaFaraState(),
      });

      if (ld.snehulak.cooldown > 0) ld.snehulak.cooldown = Math.max(0, ld.snehulak.cooldown - dt);
      if (ld.snehulak.snowShieldTimer > 0) ld.snehulak.snowShieldTimer = Math.max(0, ld.snehulak.snowShieldTimer - dt);
      if (ld.fara.cooldown > 0) ld.fara.cooldown = Math.max(0, ld.fara.cooldown - dt);
      if (ld.fara.holyAuraTimer > 0) ld.fara.holyAuraTimer = Math.max(0, ld.fara.holyAuraTimer - dt);

      if (player && player.hp > 0) {
        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
        const waterEffect = getLedenWaterEffect(player.x, player.y, this.state.activeLevelId);
        if (waterEffect.onIce) {
          player.speedMultiplier = (player.speedMultiplier || 1) * 1.15;
        }

        resolveLedenObstacles(player, 22);
        clampToMarchArenaBounds(player, 28);

        const inVillage = isInsideLedenPoi(player.x, player.y, ledenPois.village);
        const inChurch = isInsideLedenPoi(player.x, player.y, ledenPois.church);
        const inTavern = isInsideLedenPoi(player.x, player.y, ledenPois.tavern);
        const inShrine = isInsideLedenPoi(player.x, player.y, ledenPois.shrine);

        if (!isLedenNight && inVillage) {
          this.state.ledenActivePoiPrompt = ld.snehulak.cooldown <= 0
            ? '[E] Postavit sněhuláka (Náves u kašny)'
            : `Sněhulák (${Math.ceil(ld.snehulak.cooldown)}s)`;
          if (eKeyPressed && ld.snehulak.cooldown <= 0) {
            ld.snehulak.cooldown = 15.0;
            ld.snehulak.snowmenBuilt++;
            ld.snehulak.snowShieldTimer = 12.0;
            player.hp = Math.min(player.maxHp, player.hp + 30);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POSTAVEN SNĚHULÁK! ⛄ (+30 Kuráž, rázová vlna)', '#BAE6FD', true);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              const dist = Math.hypot(foe.x - player.x, foe.y - player.y);
              if (dist < 220) {
                foe.takeDamage(70 * (player.damageMultiplier || 1), 'ice', (foe.x - player.x) * 3, (foe.y - player.y) * 3);
              }
            }
          }
        } else if (isLedenNight && inChurch) {
          this.state.ledenActivePoiPrompt = ld.fara.cooldown <= 0
            ? '[E] Napsat K+M+B svěcenou křídou (Dveře fary)'
            : `Svěcená křída (${Math.ceil(ld.fara.cooldown)}s)`;
          if (eKeyPressed && ld.fara.cooldown <= 0) {
            ld.fara.cooldown = 15.0;
            ld.fara.blessingsCount++;
            ld.fara.holyAuraTimer = 15.0;
            player.shield = Math.min(250, (player.shield || 0) + 75);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'K + M + B POSVÍCENO! ✍️ (Omráčení běsů & štít)', '#FEF08A', true);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (Math.hypot(foe.x - ledenPois.church.x, foe.y - ledenPois.church.y) < 250) {
                foe.takeDamage(120 * (player.damageMultiplier || 1), 'holy', (foe.x - ledenPois.church.x) * 4, (foe.y - ledenPois.church.y) * 4);
                if (typeof foe.freeze === 'function') foe.freeze(3.0);
              }
            }
          }
        } else if (inTavern) {
          this.state.ledenActivePoiPrompt = (ld.tavernCooldown <= 0)
            ? '[E] Dát si horký čaj s medem (Hostinec U Cikánů)'
            : `Hostinec (${Math.ceil(ld.tavernCooldown)}s)`;
          if (eKeyPressed && ld.tavernCooldown <= 0) {
            ld.tavernCooldown = 15.0;
            player.hp = Math.min(player.maxHp, player.hp + 45);
            this.callbacks?.onSound?.('heal');
            this.emitDamageText(player.x, player.y - 45, 'HORKÝ ČAJ S MEDEM! ☕ (+45 Kuráž)', '#4ADE80', true);
          }
        } else if (inShrine) {
          this.state.ledenActivePoiPrompt = (ld.shrineCooldown <= 0)
            ? '[E] Zapálit svíci v závěji (Boží muka)'
            : `Boží muka (${Math.ceil(ld.shrineCooldown)}s)`;
          if (eKeyPressed && ld.shrineCooldown <= 0) {
            ld.shrineCooldown = 15.0;
            player.shield = Math.min(250, (player.shield || 0) + 80);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'SVĚTLO V ZÁVĚJI! 🕯️ (+80 Štít)', '#FEF08A', true);
          }
        } else {
          this.state.ledenActivePoiPrompt = null;
        }

        if (ld.tavernCooldown > 0) ld.tavernCooldown = Math.max(0, ld.tavernCooldown - dt);
        if (ld.shrineCooldown > 0) ld.shrineCooldown = Math.max(0, ld.shrineCooldown - dt);
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        resolveLedenObstacles(e, 22);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Stage 23 & 24 ("ÚNOR"): Smažit koblihy (Day) & Pochovávání basy (Night)
    if (this.state.activeLevelId === 22 || this.state.activeLevelId === 23) {
      const isUnorNight = this.state.activeLevelId === 23;
      const unorPois = getUnorPois(isUnorNight);
      const un = this.state.unor || (this.state.unor = {
        tavernCooldown: 0,
        mortuaryCooldown: 0,
        shrineCooldown: 0,
        koblihy: createInitialMasopustniKoblihyState(),
        basa: createInitialPochovavaniBasyState(),
      });

      if (un.koblihy.cooldown > 0) un.koblihy.cooldown = Math.max(0, un.koblihy.cooldown - dt);
      if (un.koblihy.speedBoostTimer > 0) un.koblihy.speedBoostTimer = Math.max(0, un.koblihy.speedBoostTimer - dt);
      if (un.basa.cooldown > 0) un.basa.cooldown = Math.max(0, un.basa.cooldown - dt);
      if (un.basa.shockwaveTimer > 0) un.basa.shockwaveTimer = Math.max(0, un.basa.shockwaveTimer - dt);

      if (player && player.hp > 0) {
        const eKeyPressed = Boolean(this.state.keys?.['e'] || this.state.keys?.['E'] || this.state.keys?.['KeyE']);
        const waterEffect = getUnorWaterEffect(player.x, player.y, this.state.activeLevelId);
        if (waterEffect.onIce) {
          player.speedMultiplier = (player.speedMultiplier || 1) * 1.15;
        }
        if (un.koblihy.speedBoostTimer > 0) {
          player.speedMultiplier = (player.speedMultiplier || 1) * 1.25;
        }

        resolveUnorObstacles(player, 22);
        clampToMarchArenaBounds(player, 28);

        const inVillage = isInsideUnorPoi(player.x, player.y, unorPois.village);
        const inChurch = isInsideUnorPoi(player.x, player.y, unorPois.church);
        const inTavern = isInsideUnorPoi(player.x, player.y, unorPois.tavern);
        const inShrine = isInsideUnorPoi(player.x, player.y, unorPois.shrine);

        if (!isUnorNight && inTavern) {
          this.state.unorActivePoiPrompt = un.koblihy.cooldown <= 0
            ? '[E] Smažit masopustní koblihy (Hostinec U Cikánů)'
            : `Koblihy (${Math.ceil(un.koblihy.cooldown)}s)`;
          if (eKeyPressed && un.koblihy.cooldown <= 0) {
            un.koblihy.cooldown = 15.0;
            un.koblihy.koblihyCooked = (un.koblihy.koblihyCooked || 0) + 1;
            un.koblihy.speedBoostTimer = 10.0;
            player.hp = Math.min(player.maxHp, player.hp + 45 * (player._cachedFrostHealMult ?? 1));
            this.callbacks?.onSound?.('drink');
            this.emitDamageText(player.x, player.y - 45, 'HORKÉ KOBLIHY USMAŽENY! 🍩 (+45 Kuráž & +25% Rychlost)', '#F59E0B', true);
          }
        } else if (isUnorNight && inChurch) {
          this.state.unorActivePoiPrompt = un.basa.cooldown <= 0
            ? '[E] Pochovat basu a rozsvítit louče (Stará márnice)'
            : `Pochování basy (${Math.ceil(un.basa.cooldown)}s)`;
          if (eKeyPressed && un.basa.cooldown <= 0) {
            un.basa.cooldown = 15.0;
            un.basa.basasBuried = (un.basa.basasBuried || 0) + 1;
            un.basa.shockwaveTimer = 4.0;
            player.shield = Math.min(250, (player.shield || 0) + 100);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'BASA POCHOVÁNA! 🎻 (Posvátný ráz a omráčení)', '#FEF08A', true);
            for (let j = 0; j < this.livingEnemies.length; j++) {
              const foe = this.livingEnemies[j];
              if (Math.hypot(foe.x - unorPois.church.x, foe.y - unorPois.church.y) < 260) {
                foe.takeDamage(140 * (player.damageMultiplier || 1), 'holy', (foe.x - unorPois.church.x) * 4.5, (foe.y - unorPois.church.y) * 4.5);
                if (typeof foe.freeze === 'function') foe.freeze(3.0);
              }
            }
          }
        } else if (inVillage) {
          this.state.unorActivePoiPrompt = 'Masopustní náves (+20 % šance na kritický zásah)';
        } else if (inShrine) {
          this.state.unorActivePoiPrompt = (un.shrineCooldown <= 0)
            ? '[E] Pomodlit se u ověnčených Božích muk'
            : `Boží muka (${Math.ceil(un.shrineCooldown)}s)`;
          if (eKeyPressed && un.shrineCooldown <= 0) {
            un.shrineCooldown = 15.0;
            player.shield = Math.min(250, (player.shield || 0) + 80);
            this.callbacks?.onSound?.('bell');
            this.emitDamageText(player.x, player.y - 45, 'POSVÍCENÉ CHVOJÍ! 🌿 (+80 Štít)', '#FEF08A', true);
          }
        } else {
          this.state.unorActivePoiPrompt = null;
        }

        if (un.tavernCooldown > 0) un.tavernCooldown = Math.max(0, un.tavernCooldown - dt);
        if (un.shrineCooldown > 0) un.shrineCooldown = Math.max(0, un.shrineCooldown - dt);
      }

      for (let j = 0; j < this.livingEnemies.length; j++) {
        const e = this.livingEnemies[j];
        resolveUnorObstacles(e, 22);
        clampToMarchArenaBounds(e, 28);
      }
    }

    // Step drops
    if (this.state.drops) {
      sweepCoinsIntoBigPouches(this.state.drops, dt);
      for (let i = 0; i < this.state.drops.length; i++) {
        const d = this.state.drops[i];
        if (d.dead) continue;
        d.time = (d.time || 0) + dt;
        if (d.isHot && d.goldenRushTimer && d.goldenRushTimer > 0) {
          d.goldenRushTimer -= dt;
          if (d.goldenRushTimer <= 0) {
            d.isHot = false;
          }
        }
        if (typeof d.expiration === 'number') {
          d.expiration -= dt;
          if (d.expiration <= 0) {
            if (d.type === 'gingerbread' && d.isHot) {
              if (!this.state.pendingDropBank) {
                this.state.pendingDropBank = createPendingDropBank();
              }
              refundExpiredHotGingerbread(d, this.state.pendingDropBank);
            }
            d.dead = true;
            continue;
          }
        }
        if (d.vx || d.vy) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          const drag = Math.max(0, 1 - 7.5 * dt);
          d.vx *= drag;
          d.vy *= drag;
          if (Math.abs(d.vx) < 1.5) d.vx = 0;
          if (Math.abs(d.vy) < 1.5) d.vy = 0;
        }
        if (this.state.activeLevelId === 0 || this.state.activeLevelId === 1 || this.state.activeLevelId === 4 || this.state.activeLevelId === 5 || this.state.activeLevelId === 6 || this.state.activeLevelId === 7 || this.state.activeLevelId === 8 || this.state.activeLevelId === 9 || this.state.activeLevelId === 10 || this.state.activeLevelId === 11 || this.state.activeLevelId === 12 || this.state.activeLevelId === 13 || this.state.activeLevelId === 14 || this.state.activeLevelId === 15 || this.state.activeLevelId === 16 || this.state.activeLevelId === 17 || this.state.activeLevelId === 18 || this.state.activeLevelId === 19 || this.state.activeLevelId === 20 || this.state.activeLevelId === 21 || this.state.activeLevelId === 22 || this.state.activeLevelId === 23) {
          clampToMarchArenaBounds(d, 28);
        } else if (this.state.activeLevelId === 2 || this.state.activeLevelId === 3) {
          clampToDubenArenaBounds(d, 28);
        }

        if (d.isFrozen) {
          if (typeof d.freezeTimer === 'number' && d.freezeTimer > 0) {
            d.freezeTimer -= dt;
            if (d.freezeTimer <= 0) {
              d.isFrozen = false;
            }
          }
          if (player && player.hp > 0) {
            const distToPlayer = Math.hypot(d.x - player.x, d.y - player.y);
            if (distToPlayer <= player.radius + (d.radius || 12) + 6) {
              if (!d.lastContactDmgTime || this.state.gameTime - d.lastContactDmgTime >= 0.8) {
                d.lastContactDmgTime = this.state.gameTime;
                if (typeof player.takeDamage === 'function') {
                  player.takeDamage(8, 'ice', null, false);
                } else {
                  player.hp = Math.max(0, (player.hp || 0) - 8);
                }
                this.emitDamageText(d.x, d.y - 25, 'MRAZIVÝ STŘEP! ❄️', '#BAE6FD', true);
              }
            }
          }
          continue;
        }

        if (player && player.hp > 0) {
          const dx = d.x - player.x;
          const dy = d.y - player.y;
          const pr = player.pickupRadius;
          const distSq = dx * dx + dy * dy;
          if (canCollectDrop(d.type, player.hp, player.maxHp, player) && distSq < pr * pr) {
            const dist = Math.sqrt(distSq);
            const spd = Math.max(520, (player.pickupRadius - dist) * 7.5 + 380) * dt;
            const ang = Math.atan2(player.y - d.y, player.x - d.x);
            d.x += Math.cos(ang) * spd;
            d.y += Math.sin(ang) * spd;
            if (this.state.activeLevelId === 0 || this.state.activeLevelId === 1 || this.state.activeLevelId === 4 || this.state.activeLevelId === 5 || this.state.activeLevelId === 6 || this.state.activeLevelId === 7 || this.state.activeLevelId === 8 || this.state.activeLevelId === 9 || this.state.activeLevelId === 10 || this.state.activeLevelId === 11 || this.state.activeLevelId === 12 || this.state.activeLevelId === 13 || this.state.activeLevelId === 14 || this.state.activeLevelId === 15 || this.state.activeLevelId === 16 || this.state.activeLevelId === 17 || this.state.activeLevelId === 18 || this.state.activeLevelId === 19 || this.state.activeLevelId === 20 || this.state.activeLevelId === 21 || this.state.activeLevelId === 22 || this.state.activeLevelId === 23) {
              clampToMarchArenaBounds(d, 28);
            } else if (this.state.activeLevelId === 2 || this.state.activeLevelId === 3) {
              clampToDubenArenaBounds(d, 28);
            }
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
                    const color = mirrorColors[sp % mirrorColors.length];
                    tryEmitParticle(
                      this.state.particles,
                      () => ({
                        x: player.x + (Math.random() - 0.5) * 16,
                        y: player.y + (Math.random() - 0.5) * 16,
                        vx: Math.cos(ang) * speed,
                        vy: Math.sin(ang) * speed - 15,
                        life: fullyRecharged ? 0.45 : 0.32,
                        color,
                        size: fullyRecharged ? 3.8 : 2.5,
                      }),
                      this.state.meta?.performanceProfile
                    );
                  }

                  if (fullyRecharged) {
                    this.emitDamageText(player.x, player.y - 68, '🪞 ZRCÁTKO: NABITO!', '#F8FAFC', true);
                  }

                  if (size === 'large') {
                    player.gingerbreadSpeedTimer = 2.0;
                    player.gingerbreadSpeedBonus = 0.15;
                  } else if (size === 'giant') {
                    const heal = 8 * player.poutoveSrdceStacks;
                    player.hp = Math.min(player.maxHp, player.hp + heal);
                    this.emitDamageText(player.x, player.y - 45, `+${heal} Kuráž! 💝`, '#F43F5E', true);
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
                player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, Math.min(5, waterLevel > 0 ? 1 + waterLevel * 0.5 : 0));
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
                  this.emitDamageText(player.x, player.y - 80, `SVATÁ VLNA! ⛪ -${waveDmg}`, '#FEF08A', true);
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
                    this.emitDamageText(opts.x, opts.y, opts.text, opts.color || '#F59E0B', true);
                  },
                });
              } else if (d.type === 'arcivzacny_ananas') {
                applyAnanasUpgrade(player, {
                  onSound: (s) => this.callbacks?.onSound?.(s),
                  onDamageText: (opts) => {
                    this.emitDamageText(opts.x, opts.y, opts.text, opts.color || '#FDE047', true);
                  },
                });
              } else if (d.type === 'big_pouch') {
                this.callbacks?.onSound?.('coin');
                const pouchVal = d.value || 35;
                this.state.coins += pouchVal;
                this.emitDamageText(player.x, player.y - 75, `VELKÝ MĚŠEC! +${pouchVal} kr. 🪙`, '#F59E0B', true);
              } else if (d.type === 'gingerbread_stash') {
                this.callbacks?.onSound?.('gingerbreadPickup');
                const stashVal = d.value || 25;
                this.state.gingerbread += stashVal;
                const mercyCap = player.maxHp * 0.45;
                const healAmt = Math.max(0, Math.min(30, mercyCap - player.hp));
                if (healAmt > 0) {
                  player.hp += healAmt;
                  this.emitDamageText(player.x, player.y - 50, `+${healAmt} Kuráž! 🧺`, '#F43F5E', true);
                }
                this.emitDamageText(player.x, player.y - 75, `KOŠÍK PERNÍKU! +${stashVal} 🧺`, '#D97706', true);
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
      compactInPlace(this.state.drops, keepLiveDrop, (d) => {
        if (this.dropPool.length < 100) this.dropPool.push(d);
      });
      releasePendingDrops(this.state.drops, pendingBank);
    }

    // Step texts
    if (this.state.texts) {
      for (let i = 0; i < this.state.texts.length; i++) {
        const txt = this.state.texts[i];
        if (typeof txt.update === 'function') {
          txt.update(dt);
        } else {
          txt.y += (txt.vy ?? -45) * dt;
          txt.life = (txt.life ?? 0) - dt;
        }
      }
      compactInPlace(this.state.texts, keepLiveText);
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
      compactInPlace(this.state.smokePuffs, keepLiveSmokePuff);
    }

    // Step particles
    if (this.state.particles) {
      const uiT = this.state.uiTime || 0;
      for (let i = 0; i < this.state.particles.length; i++) {
        const p = this.state.particles[i];
        if (p.isWeather) {
          const flutter = Math.sin(uiT * 2.6 + (p.life || 0) * 3.1 + i * 0.7);
          p.x += ((p.vx || 0) + flutter * 24) * dt;
          p.y += ((p.vy || 0) + Math.cos(uiT * 1.9 + i) * 8) * dt;
        } else {
          p.x += (p.vx || 0) * dt;
          p.y += (p.vy || 0) * dt;
        }
        p.life -= dt;
      }
      compactInPlace(this.state.particles, keepLiveParticle);
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
