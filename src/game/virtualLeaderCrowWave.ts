/**
 * Low-allocation circular crow flock controlled by a single virtual leader.
 *
 * The flock owns fixed-size typed arrays for motion state and a pre-created
 * enemy-object pool for the game's existing hit/damage/reward pipeline.
 * Members never seek, collide with, or inspect other members: motion is O(N)
 * deterministic math around the leader, with no per-frame object/array creation.
 */
import { MARCH_ARENA_BOUNDS } from '../data/marchThawArena';

export type CrowWaveBehavior = 'sweep-through' | 'contracting-orbit';
export type CrowWaveBehaviorMode = CrowWaveBehavior | 'alternating';


export const CROW_WAVE_COUNT = 150;
export const CROW_WAVE_POINT_MULTIPLIER = 0.6;
export const CROW_WAVE_FLOCK_RADIUS = 230;
export const CROW_WAVE_WOBBLE_RADIUS = 18;
export const CROW_WAVE_GOLDEN_ANGLE = 2.399963229728653;
export const CROW_WAVE_HIT_RADIUS = 22;

export interface CrowWaveEnemyFactory {
  (
    id: string,
    x: number,
    y: number,
    multiplier?: number,
    isBoss?: boolean,
    isMiniboss?: boolean,
    customBossTitle?: string,
  ): any;
}

interface CrowWaveEngine {
  activeLevelId?: number;
  gameTime: number;
  timeStopTimer?: number;
  enemies: any[];
  director?: any;
  state?: any;
}

interface CrowWavePlayer {
  x: number;
  y: number;
  radius: number;
}

export interface VirtualLeaderCrowWaveOptions {
  count?: number;
  startAt?: number;
  interval?: number;
  flockRadius?: number;
  wobbleRadius?: number;
  behavior?: CrowWaveBehaviorMode;
  sweepSpeed?: number;
  orbitAngularSpeed?: number;
  orbitContractionSpeed?: number;
}

export class VirtualLeaderCrowWave {
  readonly count: number;
  readonly crows: any[] = [];
  readonly active: Uint8Array;
  readonly baseOffsetX: Float32Array;
  readonly baseOffsetY: Float32Array;
  readonly phaseOffset: Float32Array;
  readonly swirlSpeed: Float32Array;
  readonly flapSpeed: Float32Array;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly previousX: Float32Array;
  readonly previousY: Float32Array;

  readonly flockRadius: number;
  readonly wobbleRadius: number;

  private readonly templates: any[] = [];
  private readonly startAt: number;
  private readonly interval: number;
  private readonly behaviorMode: CrowWaveBehaviorMode;
  private readonly sweepSpeed: number;
  private readonly orbitAngularSpeed: number;
  private readonly orbitContractionSpeed: number;

  private poolPrepared = false;
  private waveNumber = 0;
  private activeCount = 0;
  private waveAge = 0;
  private travelled = 0;
  private spawnRadius = 0;
  private sweepDirX = 0;
  private sweepDirY = 0;
  private orbitAngle = 0;
  private orbitRadius = 0;
  private rotationAngle = 0;
  private lastGameTime = -1;

  public waveActive = false;
  public leaderX = 0;
  public leaderY = 0;
  public currentBehavior: CrowWaveBehavior = 'sweep-through';
  public nextWaveAt: number;

  constructor(options: VirtualLeaderCrowWaveOptions = {}) {
    this.count = Math.max(1, Math.floor(options.count ?? CROW_WAVE_COUNT));
    this.flockRadius = options.flockRadius ?? CROW_WAVE_FLOCK_RADIUS;
    this.wobbleRadius = options.wobbleRadius ?? CROW_WAVE_WOBBLE_RADIUS;
    this.startAt = options.startAt ?? 42;
    this.interval = options.interval ?? 100;
    this.behaviorMode = options.behavior ?? 'alternating';
    this.sweepSpeed = options.sweepSpeed ?? 420;
    this.orbitAngularSpeed = options.orbitAngularSpeed ?? 0.62;
    this.orbitContractionSpeed = options.orbitContractionSpeed ?? 84;
    this.nextWaveAt = this.startAt;

    this.active = new Uint8Array(this.count);
    this.baseOffsetX = new Float32Array(this.count);
    this.baseOffsetY = new Float32Array(this.count);
    this.phaseOffset = new Float32Array(this.count);
    this.swirlSpeed = new Float32Array(this.count);
    this.flapSpeed = new Float32Array(this.count);
    this.x = new Float32Array(this.count);
    this.y = new Float32Array(this.count);
    this.previousX = new Float32Array(this.count);
    this.previousY = new Float32Array(this.count);
  }

  /**
   * Allocate the actual enemy objects once per run. Later waves reuse these
   * same objects; no crow entities are constructed from the frame update.
   */
  preparePool(factory: CrowWaveEnemyFactory): void {
    if (this.poolPrepared) return;

    for (let i = 0; i < this.count; i++) {
      const enemy = factory('vrana', 0, 0, 1, false, false);
      const angle = i * CROW_WAVE_GOLDEN_ANGLE;
      const distance = this.flockRadius * Math.sqrt(i / this.count);

      this.crows.push(enemy);
      // Enemy objects are plain object records; restore from this baseline when
      // reused, and replace the mutable status map separately on wave start.
      this.templates.push({ ...enemy });
      this.baseOffsetX[i] = Math.cos(angle) * distance;
      this.baseOffsetY[i] = Math.sin(angle) * distance;
      this.phaseOffset[i] = Math.random() * Math.PI * 2;
      this.swirlSpeed[i] = 0.55 + Math.random() * 0.85;
      this.flapSpeed[i] = 7.5 + Math.random() * 5.0;
      this.active[i] = 0;

      enemy.dead = true;
      enemy.isDefeated = true;
      enemy.isVirtualCrowMember = true;
      enemy._crowWaveOwner = this;
      enemy._crowWaveInEngine = false;
      enemy._crowWaveActive = false;
    }

    this.poolPrepared = true;
  }

  /**
   * Explicit run reset: keeps the fixed typed arrays but releases old enemy
   * objects/templates, which are re-created only once for the next run.
   */
  resetRun(): void {
    for (let i = 0; i < this.crows.length; i++) {
      const enemy = this.crows[i];
      enemy._crowWaveActive = false;
      enemy.isVirtualCrowMember = true;
      enemy.dead = true;
      enemy.isDefeated = true;
      this.active[i] = 0;
    }
    this.crows.length = 0;
    this.templates.length = 0;
    this.poolPrepared = false;
    this.waveActive = false;
    this.waveNumber = 0;
    this.activeCount = 0;
    this.waveAge = 0;
    this.travelled = 0;
    this.lastGameTime = -1;
    this.nextWaveAt = this.startAt;
  }

  /**
   * Advance the wave. Returns true only on a newly spawned wave, so the caller
   * can announce it without any per-frame callbacks, events, or allocations.
   */
  update(
    dt: number,
    engine: CrowWaveEngine,
    player: CrowWavePlayer,
    viewWidth: number,
    viewHeight: number,
  ): boolean {
    if (
      !this.poolPrepared ||
      engine.activeLevelId !== 0 ||
      !player ||
      dt <= 0 ||
      (engine.timeStopTimer || 0) > 0
    ) {
      return false;
    }

    const gameTime = engine.gameTime || 0;
    // Defensive restart handling for callers that reset the level clock directly.
    if (this.lastGameTime >= 0 && gameTime + 0.1 < this.lastGameTime) {
      this.finishWave(engine);
      this.waveNumber = 0;
      this.nextWaveAt = this.startAt;
    }
    this.lastGameTime = gameTime;

    if (this.waveActive) {
      this.waveAge += dt;
      this.rotationAngle = this.waveAge * 0.22;

      if (this.currentBehavior === 'sweep-through') {
        this.leaderX += this.sweepDirX * this.sweepSpeed * dt;
        this.leaderY += this.sweepDirY * this.sweepSpeed * dt;
        this.travelled += this.sweepSpeed * dt;
      } else {
        this.orbitAngle += this.orbitAngularSpeed * dt;
        this.orbitRadius = Math.max(65, this.orbitRadius - this.orbitContractionSpeed * dt);
        this.leaderX = player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.leaderY = player.y + Math.sin(this.orbitAngle) * this.orbitRadius;
      }

      const cosRotation = Math.cos(this.rotationAngle);
      const sinRotation = Math.sin(this.rotationAngle);
      const time = this.waveAge;

      // No neighbour lookups: each bird reads only its own offset/phase and
      // the virtual leader. Dead birds are disabled in-place, never spliced.
      for (let i = 0; i < this.count; i++) {
        if (this.active[i] === 0) continue;
        const enemy = this.crows[i];
        if (enemy.isDefeated || enemy.dead) {
          this.active[i] = 0;
          enemy._crowWaveActive = false;
          this.activeCount--;
          continue;
        }

        const oldX = this.x[i];
        const oldY = this.y[i];

        // Tick transient combat state in-place. This replaces the regular enemy
        // updater's Object.entries() allocation while retaining normal hit/slow timers.
        enemy.crowContactCooldown = Math.max(0, (enemy.crowContactCooldown || 0) - dt);
        if ((enemy.hitFlashTimer || 0) > 0) enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
        if ((enemy.contactTimer || 0) > 0) enemy.contactTimer = Math.max(0, enemy.contactTimer - dt);
        if ((enemy.stunTimer || 0) > 0) enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
        if ((enemy.snackTimer || 0) > 0) enemy.snackTimer = Math.max(0, enemy.snackTimer - dt);
        if ((enemy.garlicSlowTimer || 0) > 0) enemy.garlicSlowTimer = Math.max(0, enemy.garlicSlowTimer - dt);
        if ((enemy.vycerpanyTimer || 0) > 0) enemy.vycerpanyTimer = Math.max(0, enemy.vycerpanyTimer - dt);
        if ((enemy.fajfkaSlowTimer || 0) > 0) {
          enemy.fajfkaSlowTimer = Math.max(0, enemy.fajfkaSlowTimer - dt);
          if (enemy.fajfkaSlowTimer <= 0) {
            enemy.fajfkaMoveSlowFactor = 1;
            enemy.fajfkaAttackSlowFactor = 1;
          }
        }
        if ((enemy.soakedTimer || 0) > 0) {
          enemy.soakedTimer = Math.max(0, enemy.soakedTimer - dt);
          if (enemy.soakedTimer <= 0) enemy.soaked = false;
        }
        if ((enemy.chillTimer || 0) > 0) {
          enemy.chillTimer = Math.max(0, enemy.chillTimer - dt);
          if (enemy.chillTimer <= 0) enemy.chilled = false;
        }
        if ((enemy.silhouetteInvertTimer || 0) > 0) enemy.silhouetteInvertTimer = Math.max(0, enemy.silhouetteInvertTimer - dt);
        const effects = enemy.statusEffects;
        if (effects) {
          for (const effectId in effects) {
            if (!Object.prototype.hasOwnProperty.call(effects, effectId)) continue;
            const effect = effects[effectId];
            if (effect && typeof effect.remaining === 'number') {
              effect.remaining -= dt;
              if (effect.remaining <= 0) delete effects[effectId];
            }
          }
        }

        const offsetX = this.baseOffsetX[i];
        const offsetY = this.baseOffsetY[i];
        const rotatedX = offsetX * cosRotation - offsetY * sinRotation;
        const rotatedY = offsetX * sinRotation + offsetY * cosRotation;
        const phase = this.phaseOffset[i];
        const speed = this.swirlSpeed[i];

        // Cheap Lissajous wobble layered on top of the rotating Vogel spiral.
        const wobbleX = Math.cos(time * speed + phase) * this.wobbleRadius;
        const wobbleY = Math.sin(time * speed * 1.3 + phase) * this.wobbleRadius;
        const rawX = this.leaderX + rotatedX + wobbleX;
        const rawY = this.leaderY + rotatedY + wobbleY;
        const nextX = Math.max(MARCH_ARENA_BOUNDS.minX + 20, Math.min(MARCH_ARENA_BOUNDS.maxX - 20, rawX));
        const nextY = Math.max(MARCH_ARENA_BOUNDS.minY + 20, Math.min(MARCH_ARENA_BOUNDS.maxY - 20, rawY));

        this.previousX[i] = oldX;
        this.previousY[i] = oldY;
        this.x[i] = nextX;
        this.y[i] = nextY;
        enemy.x = nextX;
        enemy.y = nextY;
        enemy.vx = (nextX - oldX) / dt;
        enemy.vy = (nextY - oldY) / dt;
        enemy.crowHeading = Math.atan2(enemy.vy, enemy.vx);
        enemy.crowFlapScale = 0.78 + Math.sin(time * this.flapSpeed[i] + phase) * 0.22;
        enemy.animTime = time;

      }

      if (this.activeCount <= 0) {
        this.waveActive = false;
      } else if (
        (this.currentBehavior === 'sweep-through' &&
          this.travelled >= this.spawnRadius * 2 + this.flockRadius) ||
        (this.currentBehavior === 'contracting-orbit' && this.orbitRadius <= 65)
      ) {
        this.finishWave(engine);
      }
    }

    if (!this.waveActive && gameTime >= this.nextWaveAt) {
      const director = engine.director ?? engine.state?.director;
      if (director && typeof director.getEffectiveLivingCount === 'function') {
        const effectiveLiving = director.getEffectiveLivingCount(engine);
        if (effectiveLiving + 3 > director.maxLivingEnemies) {
          return false;
        }
      }
      this.startWave(engine, player, viewWidth, viewHeight);
      this.nextWaveAt = gameTime + this.interval;
      return true;
    }

    return false;
  }

  /**
   * Bounding-circle broadphase shared by player contact and projectile/AOE
   * tests. The flock disk and each bird's wobble remain inside this radius,
   * so distant attacks can reject the entire wave with one squared-distance
   * comparison instead of scanning its 150 individual crows.
   */
  isWithinBounds(x: number, y: number, hitRadius: number): boolean {
    if (!this.waveActive) return false;
    const reach = this.flockRadius + this.wobbleRadius + Math.max(0, hitRadius);
    const dx = x - this.leaderX;
    const dy = y - this.leaderY;
    return dx * dx + dy * dy <= reach * reach;
  }

  private startWave(
    engine: CrowWaveEngine,
    player: CrowWavePlayer,
    viewWidth: number,
    viewHeight: number,
  ): void {
    this.waveActive = true;
    this.waveAge = 0;
    this.travelled = 0;
    this.rotationAngle = 0;
    this.activeCount = this.count;
    this.currentBehavior = this.resolveBehavior();

    // The radius encloses the viewport's half-diagonal plus the whole flock,
    // so the leader and every attached crow begin outside the visible camera
    // while staying inside MARCH_ARENA_BOUNDS.
    this.spawnRadius = Math.hypot(viewWidth, viewHeight) * 0.5 + this.flockRadius + 100;
    let startAngle = Math.random() * Math.PI * 2;
    const margin = this.flockRadius + 25;
    for (let step = 0; step < 12; step++) {
      const testAngle = startAngle + (step * Math.PI * 2) / 12;
      const tx = player.x + Math.cos(testAngle) * this.spawnRadius;
      const ty = player.y + Math.sin(testAngle) * this.spawnRadius;
      if (
        tx >= MARCH_ARENA_BOUNDS.minX + margin &&
        tx <= MARCH_ARENA_BOUNDS.maxX - margin &&
        ty >= MARCH_ARENA_BOUNDS.minY + margin &&
        ty <= MARCH_ARENA_BOUNDS.maxY - margin
      ) {
        startAngle = testAngle;
        break;
      }
    }
    this.orbitAngle = startAngle;
    this.orbitRadius = this.spawnRadius;
    this.leaderX = Math.max(
      MARCH_ARENA_BOUNDS.minX + margin,
      Math.min(MARCH_ARENA_BOUNDS.maxX - margin, player.x + Math.cos(startAngle) * this.spawnRadius),
    );
    this.leaderY = Math.max(
      MARCH_ARENA_BOUNDS.minY + margin,
      Math.min(MARCH_ARENA_BOUNDS.maxY - margin, player.y + Math.sin(startAngle) * this.spawnRadius),
    );

    const dxToPlayer = player.x - this.leaderX;
    const dyToPlayer = player.y - this.leaderY;
    const startDistance = Math.hypot(dxToPlayer, dyToPlayer) || 1;
    this.sweepDirX = dxToPlayer / startDistance;
    this.sweepDirY = dyToPlayer / startDistance;

    for (let i = 0; i < this.count; i++) {
      const enemy = this.crows[i];
      const template = this.templates[i];

      // Delete ad-hoc state added by a previous life, then restore its baseline.
      for (const key in enemy) {
        if (!Object.prototype.hasOwnProperty.call(template, key)) delete enemy[key];
      }
      Object.assign(enemy, template);
      enemy.statusEffects = {};
      enemy.x = Math.max(
        MARCH_ARENA_BOUNDS.minX + 20,
        Math.min(MARCH_ARENA_BOUNDS.maxX - 20, this.leaderX + this.baseOffsetX[i]),
      );
      enemy.y = Math.max(
        MARCH_ARENA_BOUNDS.minY + 20,
        Math.min(MARCH_ARENA_BOUNDS.maxY - 20, this.leaderY + this.baseOffsetY[i]),
      );

      enemy.hp = enemy.maxHp;
      enemy.dead = false;
      enemy.isDefeated = false;
      enemy.isBoss = false;
      enemy.isMiniboss = false;
      enemy.panicked = false;
      enemy.isVirtualCrowMember = true;
      enemy._crowWaveOwner = this;
      enemy._crowWaveInEngine = false;
      enemy._crowWaveActive = true;
      enemy.crowWaveIndex = i;
      enemy.crowWavePointMultiplier = CROW_WAVE_POINT_MULTIPLIER;
      enemy.crowContactCooldown = this.phaseOffset[i] % 0.65;
      enemy.isSwarmMember = true;
      enemy.isSwarmLeader = i === 0;
      enemy.vx = this.sweepDirX * this.sweepSpeed;
      enemy.vy = this.sweepDirY * this.sweepSpeed;
      enemy.crowHeading = Math.atan2(enemy.vy, enemy.vx);
      enemy.crowFlapScale = 1;
      enemy.isAttacking = false;
      enemy.windupTimer = 0;
      enemy.strikeTimer = 0;
      enemy.fleeTimer = 0;
      enemy.foodDefeatTimer = 0;
      enemy.animTime = 0;

      this.x[i] = enemy.x;
      this.y[i] = enemy.y;
      this.previousX[i] = enemy.x;
      this.previousY[i] = enemy.y;
      this.active[i] = 1;

    }

    // Membership is discovered with one O(E) pass, then we insert missing
    // pooled objects in O(N). Avoid Array.includes() per crow (O(N × E)).
    for (let i = 0; i < engine.enemies.length; i++) {
      const existing = engine.enemies[i];
      if (existing._crowWaveOwner === this) existing._crowWaveInEngine = true;
    }
    for (let i = 0; i < this.count; i++) {
      const enemy = this.crows[i];
      if (!enemy._crowWaveInEngine) {
        engine.enemies.push(enemy);
        enemy._crowWaveInEngine = true;
      }
    }

    this.waveNumber++;
  }

  private resolveBehavior(): CrowWaveBehavior {
    if (this.behaviorMode !== 'alternating') return this.behaviorMode;
    return (this.waveNumber % 2) === 0 ? 'sweep-through' : 'contracting-orbit';
  }

  private finishWave(engine: CrowWaveEngine): void {
    for (let i = 0; i < this.count; i++) {
      if (this.active[i] === 0) continue;
      const enemy = this.crows[i];
      this.active[i] = 0;
      enemy._crowWaveActive = false;
      // The wave leaving the arena isn't a kill and grants no score/rewards.
      if (!enemy.isDefeated && !enemy.dead) {
        enemy.dead = true;
        enemy.isDefeated = true;
      }
    }
    this.activeCount = 0;
    this.waveActive = false;
  }
}
