import { describe, expect, it } from 'vitest';
import {
  CROW_WAVE_COUNT,
  CROW_WAVE_GOLDEN_ANGLE,
  CROW_WAVE_POINT_MULTIPLIER,
  VirtualLeaderCrowWave,
  type CrowWaveEnemyFactory,
} from '../src/game/virtualLeaderCrowWave';

const factory: CrowWaveEnemyFactory = (id, x, y) => ({
  id,
  x,
  y,
  radius: 13,
  hp: 28,
  maxHp: 28,
  speed: 188,
  dead: false,
  isDefeated: false,
  isMiniboss: false,
  isBoss: false,
  statusEffects: {},
  isVirtualCrowMember: false,
  _crowWaveActive: false,
  _crowWaveInEngine: false,
  _crowWaveOwner: null,
  crowWavePointMultiplier: 1,
});

function createEngine(gameTime = 0) {
  return {
    activeLevelId: 0,
    gameTime,
    timeStopTimer: 0,
    enemies: [] as any[],
  };
}

const player = { x: 0, y: 0, radius: 20 };

describe('VirtualLeaderCrowWave', () => {
  it('preallocates 150 pooled crows and distributes offsets with Vogel golden angle', () => {
    const wave = new VirtualLeaderCrowWave({ flockRadius: 120 });
    wave.preparePool(factory);

    expect(wave.count).toBe(CROW_WAVE_COUNT);
    expect(wave.crows).toHaveLength(CROW_WAVE_COUNT);
    expect(wave.active).toHaveLength(CROW_WAVE_COUNT);
    expect(wave.baseOffsetX[0]).toBe(0);
    expect(wave.baseOffsetY[0]).toBe(0);

    const distance = 120 * Math.sqrt(1 / CROW_WAVE_COUNT);
    expect(wave.baseOffsetX[1]).toBeCloseTo(Math.cos(CROW_WAVE_GOLDEN_ANGLE) * distance, 3);
    expect(wave.baseOffsetY[1]).toBeCloseTo(Math.sin(CROW_WAVE_GOLDEN_ANGLE) * distance, 3);
    expect(CROW_WAVE_POINT_MULTIPLIER).toBe(0.6);
    expect(wave.crows.every((crow) => crow.dead && crow.isDefeated)).toBe(true);
  });

  it('starts the Stage 1 wave on schedule and reuses tagged regular crows, not a miniboss', () => {
    const wave = new VirtualLeaderCrowWave({ count: 12, startAt: 42 });
    const engine = createEngine(41.99);
    wave.preparePool(factory);

    expect(wave.update(0.016, engine, player, 1280, 720)).toBe(false);
    engine.gameTime = 42;
    expect(wave.update(0.016, engine, player, 1280, 720)).toBe(true);
    expect(wave.currentBehavior).toBe('sweep-through');
    expect(engine.enemies).toHaveLength(12);
    expect(wave.crows.every((crow) =>
      crow.isVirtualCrowMember &&
      crow._crowWaveActive &&
      !crow.isMiniboss &&
      !crow.isBoss &&
      crow.crowWavePointMultiplier === 0.6
    )).toBe(true);

    const spawnedLength = engine.enemies.length;
    wave.update(0.016, engine, player, 1280, 720);
    expect(engine.enemies).toHaveLength(spawnedLength);
    expect(wave.isWithinBounds(wave.leaderX, wave.leaderY, 13)).toBe(true);
    expect(wave.isWithinBounds(wave.leaderX + 1200, wave.leaderY, 13)).toBe(false);
  });

  it('locks the sweep direction through the player and despawns without enemy-to-enemy movement', () => {
    const wave = new VirtualLeaderCrowWave({
      count: 8,
      startAt: 0,
      interval: 100,
      behavior: 'sweep-through',
      sweepSpeed: 200,
    });
    const engine = createEngine(0);
    wave.preparePool(factory);
    expect(wave.update(0.016, engine, player, 800, 600)).toBe(true);

    const initialDistance = Math.hypot(wave.leaderX, wave.leaderY);
    const firstCrow = wave.crows[0];
    const firstCrowStartX = firstCrow.x;
    engine.gameTime = 0.5;
    wave.update(0.5, engine, player, 800, 600);

    expect(Math.hypot(wave.leaderX, wave.leaderY)).toBeCloseTo(initialDistance - 100, 3);
    expect(firstCrow.x).not.toBe(firstCrowStartX);
    expect(firstCrow.crowHeading).toBeCloseTo(Math.atan2(firstCrow.vy, firstCrow.vx), 5);
    expect(firstCrow.crowFlapScale).toBeGreaterThanOrEqual(0.56);
    expect(firstCrow.crowFlapScale).toBeLessThanOrEqual(1);
    expect(wave.crows).toHaveLength(8);
  });

  it('supports contracting-orbit motion and marks dead members inactive without shifting the pool', () => {
    const wave = new VirtualLeaderCrowWave({
      count: 8,
      startAt: 0,
      interval: 100,
      behavior: 'contracting-orbit',
      orbitContractionSpeed: 10,
      orbitAngularSpeed: 0.1,
    });
    const engine = createEngine(0);
    wave.preparePool(factory);
    expect(wave.update(0.016, engine, player, 800, 600)).toBe(true);
    expect(wave.currentBehavior).toBe('contracting-orbit');

    const initialRadius = Math.hypot(wave.leaderX - player.x, wave.leaderY - player.y);
    engine.gameTime = 0.5;
    wave.update(0.5, engine, player, 800, 600);
    expect(Math.hypot(wave.leaderX - player.x, wave.leaderY - player.y)).toBeLessThan(initialRadius);

    const originalLength = wave.crows.length;
    const target = wave.crows[3];
    target.isDefeated = true;
    engine.gameTime = 0.516;
    wave.update(0.016, engine, player, 800, 600);

    expect(wave.active[3]).toBe(0);
    expect(target._crowWaveActive).toBe(false);
    expect(wave.crows[3]).toBe(target);
    expect(wave.crows).toHaveLength(originalLength);
  });

  it('alternates from a sweep-through wave to a contracting orbit on the next scheduled wave', () => {
    const wave = new VirtualLeaderCrowWave({ count: 4, startAt: 0, interval: 100 });
    const engine = createEngine(0);
    wave.preparePool(factory);

    expect(wave.update(0.016, engine, player, 800, 600)).toBe(true);
    expect(wave.currentBehavior).toBe('sweep-through');

    engine.gameTime = 10;
    wave.update(10, engine, player, 800, 600);
    expect(wave.waveActive).toBe(false);

    engine.gameTime = 101;
    expect(wave.update(0.016, engine, player, 800, 600)).toBe(true);
    expect(wave.currentBehavior).toBe('contracting-orbit');
    expect(engine.enemies).toHaveLength(4);
  });

  it('refuses to start when director effective living count would exceed maxLivingEnemies', () => {
    const wave = new VirtualLeaderCrowWave({ count: 12, startAt: 42 });
    const engine: any = createEngine(42);
    wave.preparePool(factory);

    engine.director = {
      maxLivingEnemies: 35,
      getEffectiveLivingCount: () => 33, // 33 + 3 = 36 > 35
    };

    expect(wave.update(0.016, engine, player, 1280, 720)).toBe(false);
    expect(wave.waveActive).toBe(false);

    // If capacity frees up (effective count <= 32)
    engine.director.getEffectiveLivingCount = () => 32; // 32 + 3 = 35 <= 35
    expect(wave.update(0.016, engine, player, 1280, 720)).toBe(true);
    expect(wave.waveActive).toBe(true);
  });
});
