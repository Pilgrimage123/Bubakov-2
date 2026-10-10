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
} from '../types';
import { CADENCE_ATTACK_DELAYS, CADENCE_RECOVERY_DURATIONS } from '../types';
import { type EngineState, type PendingMilestoneChoice, createInitialEngineState } from './engineState';
import { SpatialHash } from './spatialHash';
import { distanceSq, isInView } from './perf';
import { ENEMIES } from '../data/enemies';
import { GAME_LEVELS } from '../data/levels';
import { WEAPONS, createWeaponMasteryState, getWeaponDamage } from '../data/weapons';
import {
  ensureWeaponMilestones,
  getEffectiveWeaponCooldown,
  getMilestoneChoices,
  getRankedWeaponStats,
  getWeaponRankDef,
} from '../data/weaponMilestones';
import {
  getEnemyHolyResistance,
  getHolyDamageMultiplier,
  getHolyPushMultiplier,
  isUnholyEnemy,
} from '../data/holy';
import { performDropFusion, applyMagnetWave, registerKillAndCheckCombo, createDropInstance, type DropSpawnOptions } from './drops';
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
  type DynamicLightSource,
  type ShadowZone,
} from './storybookLighting';

export const MAX_PARTICLES = 300;
export const MAX_DAMAGE_TEXTS = 90;

export function compactInPlace<T>(items: T[], keep: (item: T) => boolean): void {
  let write = 0;
  for (let read = 0; read < items.length; read++) {
    if (keep(items[read])) {
      items[write] = items[read];
      write++;
    }
  }
  items.length = write;
}

export class DamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  size: number;
  vy: number;

  constructor(x: number, y: number, text: string, color = '#FFFFFF', big = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.text = text;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.font = `900 ${this.size}px Eczar, serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2D1609';
    ctx.lineJoin = 'round';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
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
    };

export interface RunInitOptions {
  levelId?: GameLevelId;
  hunterType?: CharacterType;
  meta?: MetaProgression;
  customWeapons?: any[];
  spawnInitialWave?: boolean;
  seed?: number;
  directorAdaptability?: number;
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
    customBossTitle?: string
  ) => any;

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
    const adaptability =
      typeof optionsOrLevelId === 'object' && optionsOrLevelId !== null && optionsOrLevelId.directorAdaptability !== undefined
        ? optionsOrLevelId.directorAdaptability
        : 1.0;

    this.director = new RunDirector(levelId, seed, { adaptability });
    nextState.director = this.director;
    nextState.activeRozmar = this.director.rozmar;
    nextState.directorAdaptability = adaptability;

    this.state = nextState;
    this.spatialHash.clear();
    this.livingEnemies = [];

    this.state.player = this.createPlayer(chosenHunter, metaProg, weapons);

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

    initialWeapons.forEach(ensureWeaponMilestones);

    const wallBonusHp = (meta?.wallLevel || 0) * 25;
    const millBonusSpeed = (meta?.millLevel || 0) * 15;
    const scarecrowBonusPickup = (meta?.scarecrowLevel || 0) * 25;
    const ovenDmgMult = 1 + (meta?.ovenLevel || 0) * 0.1;
    const wallDmgRed = Math.min(0.5, (meta?.wallLevel || 0) * 0.05);

    const self = this;

    const player = {
      x: 0,
      y: 0,
      radius: 20,
      type,
      maxHp: baseMaxHp + wallBonusHp,
      hp: baseMaxHp + wallBonusHp,
      speed: baseSpeed + millBonusSpeed,
      pickupRadius: basePickup + scarecrowBonusPickup,
      luck: 0,
      weapons: initialWeapons,
      _firingWeapon: null as any,
      damageMultiplier: ovenDmgMult,
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
      dodgeCooldown: 0,
      tempShield: (meta?.tavernShieldLevel || 0) > 0 ? 40 + (meta?.tavernShieldLevel || 0) * 20 : 0,
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
      _valecnicePulse: false,
      _garlicPulse: false,

      distTo(e: any) {
        return Math.hypot(e.x - this.x, e.y - this.y);
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

      counterMeleeAttacker(attacker: any) {
        if (!attacker || attacker.isDefeated || attacker.dead) return;
        const dx = attacker.x - this.x;
        const dy = attacker.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        let nx = dx / dist;
        let ny = dy / dist;
        if (dist < 0.001) {
          nx = this.lastDx || 1;
          ny = this.lastDy || 0;
        }
        const counterDmg = Math.max(1, Math.round(this.maxHp * 0.15));
        const pushForce = 540;
        const kbx = nx * pushForce;
        const kby = ny * pushForce;

        attacker.takeDamage(counterDmg, 'physical', kbx, kby, {
          isHunterCounter: true,
          source: 'hunter_melee_counter',
        });

        self.callbacks?.onSound?.('heavyHit');
        self.state.texts.push(new DamageText(attacker.x, attacker.y - 48, 'ODSTRČENÍ! 💨', '#F59E0B', true));
      },

      takeDamage(amount: number, type = 'physical', attacker?: any, isMelee?: boolean) {
        if (this.hp <= 0) return;
        if (this.invulnerabilityTimer > 0) return;
        if ((meta?.windLevel || 0) > 0 && this.dodgeCooldown <= 0) {
          this.dodgeCooldown = Math.max(10, 60 - (meta?.windLevel || 0) * 10);
          self.state.texts.push(new DamageText(this.x, this.y - 35, 'DODGE!', '#F59E0B', true));
          return;
        }
        const hurtDmg = Math.max(1, amount * (1 - this.damageReduction));
        let remainingDmg = hurtDmg;
        let absorbed = 0;
        if (this.tempShield > 0) {
          absorbed = Math.min(this.tempShield, remainingDmg);
          this.tempShield -= absorbed;
          remainingDmg -= absorbed;
        }
        if (remainingDmg > 0) this.hp = Math.max(0, this.hp - remainingDmg);
        self.callbacks?.onSound?.('hit');
        self.callbacks?.onPlayerTakeDamage?.(hurtDmg, type);

        if (absorbed > 0 && remainingDmg <= 0) {
          self.state.texts.push(new DamageText(this.x, this.y - 35, 'ŠTÍT POHLTIL! 🛡️', '#38BDF8', true));
        } else {
          self.state.texts.push(new DamageText(this.x, this.y - 35, `-${Math.ceil(remainingDmg)}`, '#EF4444'));
        }

        if (isMelee && attacker && !attacker.isDefeated && !attacker.dead) {
          this.counterMeleeAttacker(attacker);
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
        this.spawnMonster('zaba', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.7);
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
    customBossTitle?: string
  ): any {
    const enemy = this.enemyFactory
      ? this.enemyFactory(id, x, y, multiplier, isBoss, isMiniboss, customBossTitle)
      : this.createHeadlessEnemy(id, x, y, multiplier, isBoss, isMiniboss, customBossTitle);

    this.state.enemies.push(enemy);
    if (!enemy.isDefeated && !enemy.dead) {
      this.livingEnemies.push(enemy);
      this.spatialHash.insert(enemy);
      this.director?.recordEnemySpawn(enemy, this.state.gameTime);
    }
    return enemy;
  }

  public spawnDrop(type: DropType, x: number, y: number, opts: DropSpawnOptions = {}): GameDrop {
    const drop = createDropInstance(type, x, y, opts);
    this.state.drops.push(drop);
    return drop;
  }

  public createHeadlessEnemy(
    id: string,
    x: number,
    y: number,
    multiplier = 1,
    isBoss = false,
    isMiniboss = false,
    customBossTitle?: string
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
    const poiseResist = isMiniboss ? Math.max(0.82, (stats.poiseResist || 0) + 0.45) : stats.poiseResist || 0;
    const foodResist = isMiniboss ? Math.max(0.78, (stats.foodResist || 0) + 0.45) : stats.foodResist || 0;
    const hunger = isMiniboss
      ? Math.max(0.78, (stats.hunger !== undefined ? stats.hunger : stats.foodResist || 0) + 0.45)
      : stats.hunger !== undefined
      ? stats.hunger
      : stats.foodResist || 0;
    const willpower = isMiniboss ? Math.max(0.85, (stats.willpower || 0) + 0.45) : stats.willpower || 0;
    const cadence: EnemyAttackCadence = stats.attackCadence || 'normal';
    const attackInterval = stats.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
    const baseDamage = isMiniboss ? Math.round(stats.damage * (isLevel0 ? 1.05 : 1.35)) : stats.damage;
    const damage = baseDamage;
    const coinValue = isMiniboss ? Math.max(25, (stats.coinValue || 1) * 6) : stats.coinValue || 1;
    const xp = isMiniboss ? Math.max(20, (stats.xp || 1) * 5) : stats.xp;

    const isLevel1 = (this.state.activeLevelId || 1) === 1;
    let enemySpeed = isMiniboss ? Math.max(stats.speed * 0.95, 68) : stats.speed;
    if (resolvedId === 'polednice' && isLevel1) {
      enemySpeed = Math.round(enemySpeed * 0.85);
    }

    const mass = typeof stats.mass === 'number' ? stats.mass : radius / 15;
    const attackDelay =
      typeof stats.attackDelay === 'number'
        ? stats.attackDelay
        : typeof stats.attackInterval === 'number'
        ? stats.attackInterval
        : CADENCE_ATTACK_DELAYS[cadence] ?? 1.2;
    const attackRange = typeof stats.attackRange === 'number' ? stats.attackRange : radius + 25;

    const self = this;

    const enemy = {
      id: resolvedId,
      x,
      y,
      isBoss,
      isMiniboss,
      customBossTitle: customBossTitle || '',
      renderScale,
      maxHp: finalHp,
      hp: finalHp,
      speed: enemySpeed,
      damage,
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
      snackTimer: 0,
      stunTimer: 0,
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
          if (this.bludickaAttracted) spd *= 1.15;
          if (this.chilled) spd *= 0.65;
          if (this.garlicSlowTimer > 0) spd *= 0.75;
          if (this.panicked) spd *= 1.35;

          const moveDir = this.panicked ? dir + Math.PI : dir;
          this.vx = Math.cos(moveDir) * spd;
          this.vy = Math.sin(moveDir) * spd;
        }

        this.x += (this.vx + this.kbx) * dt;
        this.y += (this.vy + this.kby) * dt;

        const kbDecay = Math.max(0, 1 - 8 * dt);
        this.kbx *= kbDecay;
        this.kby *= kbDecay;
      },

      takeDamage(amount: number, type = 'physical', kbx = 0, kby = 0, options?: any) {
        if (this.isDefeated || this.dead) return;

        const shadowMods = getShadowDefenseMultipliers(this);
        amount *= shadowMods.damageTakenMult;
        if (type === 'holy') {
          this.silhouetteInvertTimer = 0.12;
        }

        const ignoreResist = options?.ignoreResist || 0;
        let effectiveResist = 0;
        if (type === 'food') {
          effectiveResist = this.hunger ?? this.foodResist ?? 0;
        } else if (type === 'holy') {
          effectiveResist = getEnemyHolyResistance(this);
        } else {
          effectiveResist = this.poiseResist || 0;
        }
        effectiveResist = Math.max(0, effectiveResist * (1 - ignoreResist));

        const finalDamage = Math.max(1, amount * (1 - effectiveResist));
        this.hp = Math.max(0, this.hp - finalDamage);
        this.hitFlashTimer = 0.12;

        if (options?.stunDuration && options.stunDuration > 0) {
          const stunResist = this.willpower || 0;
          this.stunTimer = Math.max(this.stunTimer || 0, options.stunDuration * (1 - stunResist));
          this.interruptAttack();
        }

        if (kbx !== 0 || kby !== 0) {
          const poise = this.poiseResist || 0;
          const kbFactor = Math.max(0.1, 1 - poise);
          this.kbx += kbx * kbFactor;
          this.kby += kby * kbFactor;
          this.interruptAttack();
        }

        if (finalDamage >= (this.maxHp || 40) * 3) {
          this.overkill = true;
        }

        if (this.hp <= 0) {
          this.hp = 0;
          this.isDefeated = true;
          self.state.kills += 1;
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
    synergisticUpgradeId?: string
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
        synergisticUpgrades: [],
      };
      if (synergisticUpgradeId) {
        weapon.synergisticUpgrades.push(synergisticUpgradeId);
      }
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
      return { weapon, pendingMilestone: null };
    }

    weapon.level += 1;
    if (!Array.isArray(weapon.milestones)) {
      weapon.milestones = [];
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
    }

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
    return updatedStats;
  }

  public applyWeaponAction(action: WeaponAction): any {
    if (action.type === 'projectile') {
      const p = action.proj || action;
      const weaponId = p.weaponId || this.state.player?._firingWeapon?.id;
      const angle = p.angle ?? 0;
      const speed = p.speed ?? 0;
      const projectile = {
        ...p,
        weaponId,
        x: p.x ?? this.state.player?.x ?? 0,
        y: p.y ?? this.state.player?.y ?? 0,
        angle,
        speed,
        vx: p.vx !== undefined ? p.vx : Math.cos(angle) * speed,
        vy: p.vy !== undefined ? p.vy : Math.sin(angle) * speed,
        hitList: p.hitList || [],
        dead: false,
        life: p.life ?? 2.0,
        radius: p.radius ?? 12,
        dmg: p.dmg ?? 10,
        type: p.type || 'physical',
      };
      this.state.projectiles.push(projectile);
      return projectile;
    }

    if (action.type === 'slash') {
      const s = action.slash || action;
      const weaponId = s.weaponId || this.state.player?._firingWeapon?.id;
      const slash = {
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
        hitList: s.hitList || [],
        dead: false,
      };
      this.state.slashes.push(slash);
      this.state.lightSources.push(createOsikovySlashLight(slash.x, slash.y));
      return slash;
    }

    if (action.type === 'areaImpact') {
      const impact = action.impact || action;
      const radius = impact.radius ?? 60;
      const dmg = impact.dmg ?? 20;
      const impactType = impact.type || 'blunt';
      if (impactType === 'holy') {
        this.state.lightSources.push(createHolyCathedralLight(impact.x, impact.y));
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
      this.state.particles.push({
        x: player.x,
        y: player.y,
        vx: 0,
        vy: 0,
        life: 0.35,
        color: '#FEF08A',
        size: reach * 0.3,
      });
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
      let pLight = this.state.lightSources.find((ls) => ls.id === 'player_petrolejka');
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
          this.state.lightSources.push(pLight);
        } else {
          pLight.x = player.x;
          pLight.y = player.y;
          pLight.radius = petrolejkaRadius;
        }
      } else if (pLight) {
        pLight.radius = 0;
      }
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
      if (player.waterSoakedTimer > 0) player.waterSoakedTimer -= dt;
      if (player.slowTimer > 0) player.slowTimer -= dt;
      if (player.ultCd > 0) player.ultCd -= dt;
      if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer -= dt;
      if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;

      if (player.regenLevel > 0 && player.hp < player.maxHp) {
        player.regenTimer += dt;
        if (player.regenTimer >= 5) {
          player.hp = Math.min(player.maxHp, player.hp + player.regenLevel * 3);
          player.regenTimer = 0;
        }
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
              const weaponCooldownBonus =
                rankDef?.cooldownReductionBonus ?? Math.max(0, (w.level - 1) * 0.08);
              const playerCooldownBonus =
                typeof player.cooldownBonus === 'number'
                  ? Math.max(0, player.cooldownBonus)
                  : Math.max(0, ((player.cooldownMultiplier || 1) - 1) / 0.9);
              const baseCd = wDef.baseCd;
              const formulaCd = getEffectiveWeaponCooldown(baseCd, playerCooldownBonus, weaponCooldownBonus);
              const stats = getRankedWeaponStats(w.id, w.level, w);
              const localCd = Math.max(baseCd * 0.5, formulaCd * stats.cooldownMult);
              w.cd = fired ? localCd : 0.1;
            }
          }
        }
      }
    }

    // Step projectiles
    for (let i = 0; i < this.state.projectiles.length; i++) {
      const p = this.state.projectiles[i];
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
          const hungerResist = typeof e.hunger === 'number' ? e.hunger : e.foodResist || 0;
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
    compactInPlace(this.state.projectiles, (p) => !p.dead);

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
        const dx = s.x - e.x;
        const dy = s.y - e.y;
        const reach = s.reach + e.radius;
        if (!s.hitList.includes(e) && distanceSq(s.x, s.y, e.x, e.y) <= reach * reach) {
          const ang = Math.atan2(e.y - s.y, e.x - s.x);
          let diff = Math.abs(ang - s.angle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;

          if (diff <= s.arc / 2) {
            s.hitList.push(e);
            const kbForce = 260 * (s.knockbackMult ?? 1);
            e.takeDamage(
              s.dmg,
              s.type,
              Math.cos(s.angle) * kbForce,
              Math.sin(s.angle) * kbForce,
              s.stunDuration ? { stunDuration: s.stunDuration } : undefined
            );
          }
        }
      }
    }
    compactInPlace(this.state.slashes, (s) => !s.dead);

    // Step enemies
    if (this.state.timeStopTimer > 0) {
      this.state.timeStopTimer = Math.max(0, this.state.timeStopTimer - dt);
    }
    if (this.state.screenFlashTimer > 0) {
      this.state.screenFlashTimer = Math.max(0, this.state.screenFlashTimer - dt);
    }

    if (this.state.timeStopTimer <= 0) {
      for (let i = 0; i < this.state.enemies.length; i++) {
        const e = this.state.enemies[i];
        if (e.category === 'shadows' && !e.dead && !e.isDefeated) {
          const isLit = isPositionIlluminated(
            e.x,
            e.y,
            this.state.lightSources,
            dayPhase.id,
            this.state.shadowZones
          );
          evaluateShadowDefense(e, isLit, dt, {
            onBreak: (shadowEnemy) => {
              if (this.state.particles.length < MAX_PARTICLES - 8) {
                for (let k = 0; k < 6; k++) {
                  const ang = Math.random() * Math.PI * 2;
                  const spd = 40 + Math.random() * 50;
                  this.state.particles.push({
                    x: shadowEnemy.x,
                    y: shadowEnemy.y - shadowEnemy.radius * 0.4,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    life: 0.35,
                    color: '#1E1B18',
                    size: 3.5,
                  });
                }
              }
            },
          });
        }

        if (typeof e.update === 'function') {
          e.update(dt, player);
        }

        if (e.id === 'bludicka' && !e.dead && !e.isDefeated) {
          const bId = `bludicka_${e.id}_${i}`;
          let bLight = this.state.lightSources.find((ls) => ls.id === bId);
          if (!bLight) {
            this.state.lightSources.push({
              id: bId,
              x: e.x,
              y: e.y,
              radius: 175,
              color: '#67E8F9',
              type: 'bludicka',
            });
          } else {
            bLight.x = e.x;
            bLight.y = e.y;
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

      if (e.isAttacking) {
        e.windupTimer = (e.windupTimer || 0) + dt;
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
                const val = d.value || 1;
                this.state.coins += val;
                this.callbacks?.onSound?.('coin');
              } else if (d.type === 'gingerbread') {
                const isHotActive = d.isHot && d.goldenRushTimer && d.goldenRushTimer > 0;
                const val = (d.value || 1) * (isHotActive ? 2 : 1);
                this.state.gingerbread += val;
                this.callbacks?.onSound?.('gingerbreadPickup');
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
                player.hp = Math.min(player.maxHp, player.hp + 30);
              } else if (d.type === 'bread' || d.type === 'pear') {
                this.callbacks?.onSound?.('potion');
                player.hp = Math.min(player.maxHp, player.hp + 15);
              } else if (d.type === 'soul') {
                this.callbacks?.onSound?.('soul');
                player.soulBuffTimer = 6.0;
                this.state.souls += 1;
                this.state.coins += 25;
              } else if (d.type === 'chest') {
                this.callbacks?.onOpenChest?.();
              } else if (d.type === 'chasnik') {
                this.callbacks?.onRescueChasnik?.(d.x, d.y);
              }
            }
          }
        }
      }
      compactInPlace(this.state.drops, (d) => !d.dead);
      performDropFusion(this.state.drops, undefined, 250);
    }

    // Step texts
    if (this.state.texts) {
      for (let i = 0; i < this.state.texts.length; i++) {
        this.state.texts[i].update?.(dt);
      }
      compactInPlace(this.state.texts, (t) => (t.life ?? 1) > 0);
      if (this.state.texts.length > MAX_DAMAGE_TEXTS) {
        this.state.texts.splice(0, this.state.texts.length - MAX_DAMAGE_TEXTS);
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
      if (this.state.particles.length > MAX_PARTICLES) {
        this.state.particles.splice(0, this.state.particles.length - MAX_PARTICLES);
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
