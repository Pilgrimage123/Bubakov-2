/**
 * Low-overhead 40-member enemy horde "Tající sněhuláci" (Melting Snowmen)
 * controlled by a single Virtual Leader with slot offsets, time-sliced separation,
 * passive melting, zero-allocation pre-allocated object and puddle pools,
 * and lightweight squared-distance hazard checks.
 */

import {
  MARCH_ARENA_BOUNDS,
  resolveMarchThawObstacles,
  sanitizeArenaSpawnPoint,
} from '../data/marchThawArena';

export const SNOWMAN_HORDE_COUNT = 40;
export const SNOWMAN_PUDDLE_POOL_COUNT = 40;

export const SNOWMAN_HORDE_RADIUS = 160;
export const SNOWMAN_HORDE_WOBBLE_RADIUS = 10;
export const SNOWMAN_HORDE_POINT_MULTIPLIER = 0.35;
export const SNOWMAN_HORDE_HIT_RADIUS = 20;
export const SNOWMAN_HORDE_LEADER_SPEED = 40;
export const SNOWMAN_HORDE_MELT_DPS = 12.0;
export const SNOWMAN_HORDE_MAX_LEASH_SQ = 320 * 320; // 102400
export const SNOWMAN_PUDDLE_DURATION = 4.0;
export const SNOWMAN_PUDDLE_FADE_START = 1.0;
export const SNOWMAN_PUDDLE_RADIUS = 26;
export const SNOWMAN_PUDDLE_SLOW_FACTOR = 0.75; // 25% movement speed reduction
export const SNOWMAN_PUDDLE_TICK_INTERVAL = 0.5;
export const SNOWMAN_PUDDLE_TICK_DAMAGE = 3;
export const SNOWMAN_CLOSE_RANGE = 85;
export const SNOWMAN_FAR_RANGE = 210;
export const SNOWMAN_SEPARATION_RADIUS = 38;
export const SNOWMAN_SEPARATION_WEIGHT = 30;
export const SNOWMAN_SEPARATION_SLICE_SIZE = 4; // 4 snowmen per frame
export const SNOWMAN_SEPARATION_PERIOD = 10; // 10-frame cycle for 40 snowmen

const GOLDEN_ANGLE = 2.399963229728653;

export interface SnowmanEnemyFactory {
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

export interface SnowmanHordeEngine {
  activeLevelId?: number;
  gameTime: number;
  timeStopTimer?: number;
  enemies: any[];
  texts?: any[];
  director?: any;
  state?: any;
}

export interface SnowmanHordePlayer {
  x: number;
  y: number;
  radius: number;
  takeDamage?: (dmg: number, type?: string, source?: any, silent?: boolean) => void;
  meltingPuddleSlowTimer?: number;
  [key: string]: any;
}

export interface VirtualLeaderSnowmanHordeOptions {
  count?: number;
  startAt?: number;
  interval?: number;
  hordeRadius?: number;
  wobbleRadius?: number;
  leaderSpeed?: number;
  meltDamagePerSecond?: number;
  maxLeashDistanceSq?: number;
  puddleDuration?: number;
  puddleRadius?: number;
  puddleTickInterval?: number;
  puddleTickDamage?: number;
  puddleSlowFactor?: number;
  closeRange?: number;
  farRange?: number;
}

export class VirtualLeaderSnowmanHorde {
  readonly count: number;
  readonly puddleCount: number;
  readonly snowmen: any[] = [];
  readonly active: Uint8Array;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly previousX: Float32Array;
  readonly previousY: Float32Array;
  readonly baseOffsetX: Float32Array;
  readonly baseOffsetY: Float32Array;
  readonly phaseOffset: Float32Array;
  readonly wobbleSpeed: Float32Array;
  readonly detached: Uint8Array;
  readonly cachedSepX: Float32Array;
  readonly cachedSepY: Float32Array;

  // Pre-allocated water puddle hazard pool
  readonly puddleActive: Uint8Array;
  readonly puddleX: Float32Array;
  readonly puddleY: Float32Array;
  readonly puddleLife: Float32Array;
  readonly puddleAlpha: Float32Array;

  readonly hordeRadius: number;
  readonly wobbleRadius: number;
  readonly leaderSpeed: number;
  readonly meltDamagePerSecond: number;
  readonly maxLeashDistanceSq: number;
  readonly puddleDuration: number;
  readonly puddleRadius: number;
  readonly puddleTickInterval: number;
  readonly puddleTickDamage: number;
  readonly puddleSlowFactor: number;
  readonly closeRange: number;
  readonly farRange: number;

  private readonly templates: any[] = [];
  private readonly startAt: number;
  private readonly interval: number;

  private poolPrepared = false;
  private activeCount = 0;
  private waveAge = 0;
  private frameCount = 0;
  private lastGameTime = -1;
  private playerPuddleDamageTimer = 0;

  public waveActive = false;
  public leaderX = 0;
  public leaderY = 0;
  public leaderVx = 0;
  public leaderVy = 0;
  public nextWaveAt: number;
  public waveNumber = 0;

  constructor(options: VirtualLeaderSnowmanHordeOptions = {}) {
    this.count = Math.max(1, Math.floor(options.count ?? SNOWMAN_HORDE_COUNT));
    this.puddleCount = Math.max(1, Math.floor(options.count ?? SNOWMAN_PUDDLE_POOL_COUNT));
    this.hordeRadius = options.hordeRadius ?? SNOWMAN_HORDE_RADIUS;
    this.wobbleRadius = options.wobbleRadius ?? SNOWMAN_HORDE_WOBBLE_RADIUS;
    this.leaderSpeed = options.leaderSpeed ?? SNOWMAN_HORDE_LEADER_SPEED;
    this.meltDamagePerSecond = options.meltDamagePerSecond ?? SNOWMAN_HORDE_MELT_DPS;
    this.maxLeashDistanceSq = options.maxLeashDistanceSq ?? SNOWMAN_HORDE_MAX_LEASH_SQ;
    this.puddleDuration = options.puddleDuration ?? SNOWMAN_PUDDLE_DURATION;
    this.puddleRadius = options.puddleRadius ?? SNOWMAN_PUDDLE_RADIUS;
    this.puddleTickInterval = options.puddleTickInterval ?? SNOWMAN_PUDDLE_TICK_INTERVAL;
    this.puddleTickDamage = options.puddleTickDamage ?? SNOWMAN_PUDDLE_TICK_DAMAGE;
    this.puddleSlowFactor = options.puddleSlowFactor ?? SNOWMAN_PUDDLE_SLOW_FACTOR;
    this.closeRange = options.closeRange ?? SNOWMAN_CLOSE_RANGE;
    this.farRange = options.farRange ?? SNOWMAN_FAR_RANGE;
    this.startAt = options.startAt ?? 48;
    this.interval = options.interval ?? 75;
    this.nextWaveAt = this.startAt;

    this.active = new Uint8Array(this.count);
    this.x = new Float32Array(this.count);
    this.y = new Float32Array(this.count);
    this.previousX = new Float32Array(this.count);
    this.previousY = new Float32Array(this.count);
    this.baseOffsetX = new Float32Array(this.count);
    this.baseOffsetY = new Float32Array(this.count);
    this.phaseOffset = new Float32Array(this.count);
    this.wobbleSpeed = new Float32Array(this.count);
    this.detached = new Uint8Array(this.count);
    this.cachedSepX = new Float32Array(this.count);
    this.cachedSepY = new Float32Array(this.count);

    this.puddleActive = new Uint8Array(this.puddleCount);
    this.puddleX = new Float32Array(this.puddleCount);
    this.puddleY = new Float32Array(this.puddleCount);
    this.puddleLife = new Float32Array(this.puddleCount);
    this.puddleAlpha = new Float32Array(this.puddleCount);
  }

  /**
   * Pre-allocate enemy entities and local slot offsets once.
   */
  preparePool(factory: SnowmanEnemyFactory): void {
    if (this.poolPrepared) return;

    for (let i = 0; i < this.count; i++) {
      const enemy = factory('tajici_snehulak', 0, 0, 1, false, false);
      const angle = i * GOLDEN_ANGLE;
      const distance = this.hordeRadius * Math.sqrt((i + 0.5) / this.count);

      this.snowmen.push(enemy);
      this.templates.push({ ...enemy });
      this.baseOffsetX[i] = Math.cos(angle) * distance;
      this.baseOffsetY[i] = Math.sin(angle) * distance;
      this.phaseOffset[i] = Math.random() * Math.PI * 2;
      this.wobbleSpeed[i] = 1.6 + (i % 6) * 0.28;
      this.active[i] = 0;
      this.detached[i] = 0;
      this.cachedSepX[i] = 0;
      this.cachedSepY[i] = 0;

      enemy.dead = true;
      enemy.isDefeated = true;
      enemy.isVirtualSnowmanMember = true;
      enemy.isSwarmMember = true;
      enemy._snowmanHordeOwner = this;
      enemy._snowmanHordeInEngine = false;
      enemy._snowmanHordeActive = false;
    }

    // Reset puddles pool
    for (let p = 0; p < this.puddleCount; p++) {
      this.puddleActive[p] = 0;
      this.puddleX[p] = 0;
      this.puddleY[p] = 0;
      this.puddleLife[p] = 0;
      this.puddleAlpha[p] = 0;
    }

    this.poolPrepared = true;
  }

  /**
   * Run reset: clears active state and puddles without reallocating arrays.
   */
  resetRun(): void {
    for (let i = 0; i < this.snowmen.length; i++) {
      const enemy = this.snowmen[i];
      enemy._snowmanHordeActive = false;
      enemy.isVirtualSnowmanMember = true;
      enemy.dead = true;
      enemy.isDefeated = true;
      this.active[i] = 0;
      this.detached[i] = 0;
      this.cachedSepX[i] = 0;
      this.cachedSepY[i] = 0;
    }
    for (let p = 0; p < this.puddleCount; p++) {
      this.puddleActive[p] = 0;
      this.puddleLife[p] = 0;
      this.puddleAlpha[p] = 0;
    }
    this.snowmen.length = 0;
    this.templates.length = 0;
    this.poolPrepared = false;
    this.waveActive = false;
    this.waveNumber = 0;
    this.activeCount = 0;
    this.waveAge = 0;
    this.frameCount = 0;
    this.lastGameTime = -1;
    this.playerPuddleDamageTimer = 0;
    this.nextWaveAt = this.startAt;
  }

  /**
   * Spawns a puddle hazard at specified coordinates using pre-allocated pool slots.
   */
  spawnPuddle(worldX: number, worldY: number): void {
    let slot = -1;
    for (let p = 0; p < this.puddleCount; p++) {
      if (this.puddleActive[p] === 0) {
        slot = p;
        break;
      }
    }
    if (slot === -1) {
      // If pool is fully saturated, recycle slot with smallest remaining life
      let lowestLife = Number.POSITIVE_INFINITY;
      slot = 0;
      for (let p = 0; p < this.puddleCount; p++) {
        if (this.puddleLife[p] < lowestLife) {
          lowestLife = this.puddleLife[p];
          slot = p;
        }
      }
    }

    this.puddleActive[slot] = 1;
    this.puddleX[slot] = worldX;
    this.puddleY[slot] = worldY;
    this.puddleLife[slot] = this.puddleDuration;
    this.puddleAlpha[slot] = 1.0;
  }

  /**
   * Starts a new wave of 40 melting snowmen around an invisible virtual leader.
   */
  startWave(
    engine: SnowmanHordeEngine,
    player: SnowmanHordePlayer,
    viewWidth = 1280,
    viewHeight = 720,
    spawnDistance?: number,
  ): void {
    this.waveActive = true;
    this.waveAge = 0;
    this.frameCount = 0;
    this.activeCount = this.count;

    const spawnRadius = spawnDistance ?? (Math.hypot(viewWidth, viewHeight) * 0.5 + this.hordeRadius + 60);
    let startAngle = Math.random() * Math.PI * 2;
    const margin = this.hordeRadius + 30;
    for (let step = 0; step < 12; step++) {
      const testAngle = startAngle + (step * Math.PI * 2) / 12;
      const tx = player.x + Math.cos(testAngle) * spawnRadius;
      const ty = player.y + Math.sin(testAngle) * spawnRadius;
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
    this.leaderX = Math.max(
      MARCH_ARENA_BOUNDS.minX + margin,
      Math.min(MARCH_ARENA_BOUNDS.maxX - margin, player.x + Math.cos(startAngle) * spawnRadius),
    );
    this.leaderY = Math.max(
      MARCH_ARENA_BOUNDS.minY + margin,
      Math.min(MARCH_ARENA_BOUNDS.maxY - margin, player.y + Math.sin(startAngle) * spawnRadius),
    );

    const dxToPlayer = player.x - this.leaderX;
    const dyToPlayer = player.y - this.leaderY;
    const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer) || 1;
    this.leaderVx = (dxToPlayer / distToPlayer) * this.leaderSpeed;
    this.leaderVy = (dyToPlayer / distToPlayer) * this.leaderSpeed;

    for (let i = 0; i < this.count; i++) {
      const enemy = this.snowmen[i];
      const template = this.templates[i];

      for (const key in enemy) {
        if (!Object.prototype.hasOwnProperty.call(template, key)) delete enemy[key];
      }
      Object.assign(enemy, template);
      enemy.statusEffects = {};
      const sanitizedPos = sanitizeArenaSpawnPoint(
        this.leaderX + this.baseOffsetX[i],
        this.leaderY + this.baseOffsetY[i],
        enemy.radius || 20,
        engine.activeLevelId ?? 0,
        undefined,
        36,
      );
      enemy.x = sanitizedPos.x;
      enemy.y = sanitizedPos.y;

      enemy.hp = enemy.maxHp;
      enemy.dead = false;
      enemy.isDefeated = false;
      enemy.isBoss = false;
      enemy.isMiniboss = false;
      enemy.panicked = false;
      enemy.isVirtualSnowmanMember = true;
      enemy.isSwarmMember = true;
      enemy._snowmanHordeOwner = this;
      enemy._snowmanHordeInEngine = false;
      enemy._snowmanHordeActive = true;
      enemy.snowmanHordeIndex = i;
      enemy.snowmanPointMultiplier = SNOWMAN_HORDE_POINT_MULTIPLIER;
      enemy.snowmanContactCooldown = this.phaseOffset[i] % 0.8;
      enemy.vx = this.leaderVx;
      enemy.vy = this.leaderVy;
      enemy.animTime = 0;
      enemy.meltHpRatio = 1.0;
      enemy.meltSquashX = 1.0;
      enemy.meltSquashY = 1.0;
      enemy.wobbleScaleX = 1.0;
      enemy.wobbleScaleY = 1.0;

      this.x[i] = enemy.x;
      this.y[i] = enemy.y;
      this.previousX[i] = enemy.x;
      this.previousY[i] = enemy.y;
      this.active[i] = 1;
      this.detached[i] = 0;
      this.cachedSepX[i] = 0;
      this.cachedSepY[i] = 0;
    }

    // Register into engine enemies array once without duplicate references
    for (let i = 0; i < engine.enemies.length; i++) {
      const existing = engine.enemies[i];
      if (existing._snowmanHordeOwner === this) existing._snowmanHordeInEngine = true;
    }
    for (let i = 0; i < this.count; i++) {
      const enemy = this.snowmen[i];
      if (!enemy._snowmanHordeInEngine) {
        engine.enemies.push(enemy);
        enemy._snowmanHordeInEngine = true;
      }
    }

    this.waveNumber++;
  }

  /**
   * Main per-frame tick. Advances movement, separation, melting, and puddles with zero GC overhead.
   * Returns true on the exact frame a new wave is spawned.
   */
  update(
    dt: number,
    engine: SnowmanHordeEngine,
    player: SnowmanHordePlayer,
    viewWidth: number,
    viewHeight: number,
  ): boolean {
    if (
      !this.poolPrepared ||
      (engine.activeLevelId !== 0 && engine.activeLevelId !== 1) ||
      !player ||
      dt <= 0 ||
      (engine.timeStopTimer || 0) > 0
    ) {
      return false;
    }

    const gameTime = engine.gameTime || 0;
    if (this.lastGameTime >= 0 && gameTime + 0.1 < this.lastGameTime) {
      this.finishWave();
      this.waveNumber = 0;
      this.nextWaveAt = this.startAt;
    }
    this.lastGameTime = gameTime;

    if (this.waveActive) {
      this.waveAge += dt;
      this.frameCount++;

      // 1. Invisible Virtual Leader moves slowly toward player position (O(1) steering)
      const ldx = player.x - this.leaderX;
      const ldy = player.y - this.leaderY;
      const lDist = Math.hypot(ldx, ldy) || 1;
      this.leaderVx = (ldx / lDist) * this.leaderSpeed;
      this.leaderVy = (ldy / lDist) * this.leaderSpeed;
      this.leaderX += this.leaderVx * dt;
      this.leaderY += this.leaderVy * dt;

      // 2. Time-Sliced Neighbor Separation: 4 snowmen per frame across 10-frame period
      const sliceBucket = (this.frameCount - 1) % SNOWMAN_SEPARATION_PERIOD;
      const sliceStart = sliceBucket * SNOWMAN_SEPARATION_SLICE_SIZE;
      const sliceEnd = sliceStart + SNOWMAN_SEPARATION_SLICE_SIZE;
      const sepRadiusSq = SNOWMAN_SEPARATION_RADIUS * SNOWMAN_SEPARATION_RADIUS;

      for (let i = sliceStart; i < sliceEnd && i < this.count; i++) {
        if (this.active[i] === 0) continue;
        let accumSepX = 0;
        let accumSepY = 0;
        const myX = this.x[i];
        const myY = this.y[i];

        for (let j = 0; j < this.count; j++) {
          if (j === i || this.active[j] === 0) continue;
          const diffX = myX - this.x[j];
          const diffY = myY - this.y[j];
          const distSq = diffX * diffX + diffY * diffY;
          if (distSq < sepRadiusSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const factor = (SNOWMAN_SEPARATION_RADIUS - dist) / SNOWMAN_SEPARATION_RADIUS;
            accumSepX += (diffX / dist) * factor * SNOWMAN_SEPARATION_WEIGHT;
            accumSepY += (diffY / dist) * factor * SNOWMAN_SEPARATION_WEIGHT;
          }
        }
        this.cachedSepX[i] = accumSepX;
        this.cachedSepY[i] = accumSepY;
      }

      // 3. Followers update: Steering Blend, Breakaway Leash, Passive Melting, & Visual Squash
      for (let i = 0; i < this.count; i++) {
        if (this.active[i] === 0) continue;
        const enemy = this.snowmen[i];

        // Check if defeated externally by weapons/effects
        if (enemy.isDefeated || enemy.dead || enemy.hp <= 0) {
          this.active[i] = 0;
          enemy.dead = true;
          enemy.isDefeated = true;
          enemy._snowmanHordeActive = false;
          this.spawnPuddle(this.x[i], this.y[i]);
          this.activeCount--;
          continue;
        }

        // Passive Melting (HP Decay per second)
        enemy.hp -= this.meltDamagePerSecond * dt;
        if (enemy.hp <= 0) {
          this.active[i] = 0;
          enemy.dead = true;
          enemy.isDefeated = true;
          enemy._snowmanHordeActive = false;
          this.spawnPuddle(this.x[i], this.y[i]);
          this.activeCount--;
          continue;
        }

        // Visual shrink / squash as HP ratio approaches 0 (subtle so snowman never looks overly flattened)
        const hpRatio = Math.max(0.12, Math.min(1.0, enemy.hp / enemy.maxHp));
        enemy.meltHpRatio = hpRatio;
        enemy.meltSquashX = 1 + (1 - hpRatio) * 0.08;
        enemy.meltSquashY = 0.88 + 0.12 * hpRatio;

        // Sine-wave wobble for shambling melting snowman
        const phase = this.phaseOffset[i];
        const wSpeed = this.wobbleSpeed[i];
        const wobbleX = Math.sin(this.waveAge * wSpeed + phase) * this.wobbleRadius;
        const wobbleY = Math.cos(this.waveAge * wSpeed * 1.3 + phase) * (this.wobbleRadius * 0.7);
        enemy.wobbleScaleX = 1 + Math.sin(this.waveAge * wSpeed + phase) * 0.03;
        enemy.wobbleScaleY = 1 - Math.sin(this.waveAge * wSpeed + phase) * 0.03;

        // Breakaway leash check once every 30 frames
        if ((this.frameCount + i) % 30 === 0 && this.detached[i] === 0) {
          const toLeaderX = this.x[i] - this.leaderX;
          const toLeaderY = this.y[i] - this.leaderY;
          if (toLeaderX * toLeaderX + toLeaderY * toLeaderY > this.maxLeashDistanceSq) {
            this.detached[i] = 1;
          }
        }

        const slotX = this.leaderX + this.baseOffsetX[i] + wobbleX;
        const slotY = this.leaderY + this.baseOffsetY[i] + wobbleY;

        const toPlayerX = player.x - this.x[i];
        const toPlayerY = player.y - this.y[i];
        const distToPlayer = Math.hypot(toPlayerX, toPlayerY) || 1;

        let targetX: number;
        let targetY: number;

        if (this.detached[i] === 1) {
          // Detached snowmen home directly on player so they never walk backward
          targetX = player.x;
          targetY = player.y;
        } else {
          // Steering blend: slot offset when far, smoothly blending to direct homing when close
          if (distToPlayer >= this.farRange) {
            targetX = slotX;
            targetY = slotY;
          } else if (distToPlayer <= this.closeRange) {
            targetX = player.x;
            targetY = player.y;
          } else {
            const blend = 1 - (distToPlayer - this.closeRange) / (this.farRange - this.closeRange);
            targetX = slotX + (player.x - slotX) * blend;
            targetY = slotY + (player.y - slotY) * blend;
          }
        }

        // Apply movement vector toward target with cached separation
        const moveTargetDx = targetX - this.x[i];
        const moveTargetDy = targetY - this.y[i];
        const moveTargetDist = Math.hypot(moveTargetDx, moveTargetDy) || 1;

        let speedMultiplier = 1;
        if ((enemy.garlicSlowTimer || 0) > 0) speedMultiplier *= 0.55;
        if ((enemy.fajfkaSlowTimer || 0) > 0) speedMultiplier *= (enemy.fajfkaMoveSlowFactor || 0.65);
        if (enemy.chilled) speedMultiplier *= 0.6;
        const moveSpeed = (enemy.speed || 52) * speedMultiplier;

        const stepVx = (moveTargetDx / moveTargetDist) * moveSpeed + this.cachedSepX[i];
        const stepVy = (moveTargetDy / moveTargetDist) * moveSpeed + this.cachedSepY[i];

        const oldX = this.x[i];
        const oldY = this.y[i];
        const nextX = oldX + stepVx * dt;
        const nextY = oldY + stepVy * dt;

        enemy.x = nextX;
        enemy.y = nextY;
        resolveMarchThawObstacles(enemy, false);
        this.previousX[i] = oldX;
        this.previousY[i] = oldY;
        this.x[i] = enemy.x;
        this.y[i] = enemy.y;
        enemy.vx = stepVx;
        enemy.vy = stepVy;
        enemy.animTime = this.waveAge + this.phaseOffset[i];


        // Contact attack damage check
        const isKrajanekRiding = player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0;
        const contactRadius = enemy.radius + player.radius;
        if (distToPlayer < contactRadius) {
          enemy.snowmanContactCooldown = Math.max(0, (enemy.snowmanContactCooldown || 0) - dt);
          if (enemy.snowmanContactCooldown <= 0) {
            enemy.snowmanContactCooldown = 1.0;
            if (!isKrajanekRiding && typeof player.takeDamage === 'function') {
              player.takeDamage(enemy.damage || 24, 'frost', enemy, true);
            }
          }
        } else {
          enemy.snowmanContactCooldown = Math.max(0, (enemy.snowmanContactCooldown || 0) - dt);
        }
      }

      if (this.activeCount <= 0) {
        this.waveActive = false;
      }
    }

    // 4. Update Water Puddles: 4.0s duration, final 1.0s fade, lightweight overlap check
    let playerOverlapsPuddle = false;
    const puddleCheckRadius = this.puddleRadius + player.radius;
    const puddleCheckRadiusSq = puddleCheckRadius * puddleCheckRadius;

    for (let p = 0; p < this.puddleCount; p++) {
      if (this.puddleActive[p] === 0) continue;

      this.puddleLife[p] -= dt;
      if (this.puddleLife[p] <= 0) {
        this.puddleActive[p] = 0;
        continue;
      }

      if (this.puddleLife[p] <= SNOWMAN_PUDDLE_FADE_START) {
        this.puddleAlpha[p] = Math.max(0, this.puddleLife[p] / SNOWMAN_PUDDLE_FADE_START);
      } else {
        this.puddleAlpha[p] = 1.0;
      }

      // Fast squared-distance collision check against player
      const pDiffX = player.x - this.puddleX[p];
      const pDiffY = player.y - this.puddleY[p];
      if (pDiffX * pDiffX + pDiffY * pDiffY <= puddleCheckRadiusSq) {
        playerOverlapsPuddle = true;
      }
    }

    // 5. Player Debuff & DoT when standing in puddles
    const isKrajanekRiding = player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0;
    if (playerOverlapsPuddle) {
      if (isKrajanekRiding) {
        player.meltingPuddleSlowTimer = 0;
      } else {
        // 25% movement speed reduction (does NOT stack multiplicatively across puddles)
        player.meltingPuddleSlowTimer = 0.15;

        // Periodic low tick damage at 0.5s interval
        this.playerPuddleDamageTimer -= dt;
        if (this.playerPuddleDamageTimer <= 0) {
          this.playerPuddleDamageTimer = this.puddleTickInterval;
          if (typeof player.takeDamage === 'function') {
            player.takeDamage(this.puddleTickDamage, 'cold', null, true);
          }
          if (Array.isArray(engine.texts)) {
            engine.texts.push({
              x: player.x,
              y: player.y - 35,
              vy: -45,
              text: 'STUDENÁ LOUŽE! -3 💧',
              color: '#38BDF8',
              size: 14,
              life: 0.65,
              maxLife: 0.65,
              isDamage: true,
              dead: false,
              category: 'hunterDamage',
              update(stepDt: number) {
                this.y += (this.vy ?? -45) * stepDt;
                this.life -= stepDt;
              },
            });
          }
        }
      }
    } else {
      this.playerPuddleDamageTimer = Math.max(0, this.playerPuddleDamageTimer - dt);
    }

    // 6. Horde wave scheduling
    if (!this.waveActive && gameTime >= this.nextWaveAt) {
      const director = engine.director ?? engine.state?.director;
      if (director && typeof director.getEffectiveLivingCount === 'function') {
        const effectiveLiving = director.getEffectiveLivingCount(engine);
        if (effectiveLiving >= director.maxLivingEnemies) {
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
   * Bounding circle broadphase check for ranged attacks and projectiles.
   */
  isWithinBounds(targetX: number, targetY: number, hitRadius: number): boolean {
    if (!this.waveActive) return false;
    const reach = this.hordeRadius + this.wobbleRadius + Math.max(0, hitRadius);
    const dx = targetX - this.leaderX;
    const dy = targetY - this.leaderY;
    if (dx * dx + dy * dy <= reach * reach) return true;

    // Check detached followers that broke away from the squad circle
    for (let i = 0; i < this.count; i++) {
      if (this.active[i] === 1 && this.detached[i] === 1) {
        const sx = this.x[i];
        const sy = this.y[i];
        const fdx = targetX - sx;
        const fdy = targetY - sy;
        const fReach = SNOWMAN_HORDE_HIT_RADIUS + Math.max(0, hitRadius);
        if (fdx * fdx + fdy * fdy <= fReach * fReach) return true;
      }
    }

    return false;
  }

  /**
   * Zero-allocation canvas rendering for active water puddles.
   */
  renderPuddles(
    ctx: CanvasRenderingContext2D,
    viewLeft: number,
    viewTop: number,
    viewRight: number,
    viewBottom: number,
    uiTime = 0,
  ): void {
    const r = this.puddleRadius;
    for (let p = 0; p < this.puddleCount; p++) {
      if (this.puddleActive[p] === 0) continue;
      const px = this.puddleX[p];
      const py = this.puddleY[p];

      if (px + r < viewLeft || px - r > viewRight || py + r < viewTop || py - r > viewBottom) {
        continue;
      }

      const alpha = this.puddleAlpha[p];
      if (alpha <= 0.005) continue;

      ctx.save();
      ctx.translate(px, py);
      ctx.globalAlpha = 0.52 * alpha;

      // Puddle body
      ctx.fillStyle = 'rgba(56, 189, 248, 0.26)';
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Concentric ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const ripple = ((Math.sin(uiTime * 3.5 + p * 1.3) + 1) * 0.5) * (r * 0.68);
      ctx.ellipse(0, 0, ripple + 3, (ripple + 3) * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Melting icy center
      const slushAlpha = alpha * Math.max(0, (this.puddleLife[p] - 1.0) / 3.0);
      if (slushAlpha > 0.05) {
        ctx.fillStyle = `rgba(240, 249, 255, ${slushAlpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.38, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private finishWave(): void {
    for (let i = 0; i < this.count; i++) {
      if (this.active[i] === 0) continue;
      const enemy = this.snowmen[i];
      this.active[i] = 0;
      enemy._snowmanHordeActive = false;
      if (!enemy.isDefeated && !enemy.dead) {
        enemy.dead = true;
        enemy.isDefeated = true;
      }
    }
    this.activeCount = 0;
    this.waveActive = false;
  }
}
