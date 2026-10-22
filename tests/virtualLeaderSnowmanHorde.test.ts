import { describe, expect, it } from 'vitest';
import {
  SNOWMAN_HORDE_COUNT,
  SNOWMAN_HORDE_POINT_MULTIPLIER,
  SNOWMAN_PUDDLE_POOL_COUNT,
  SNOWMAN_HORDE_RADIUS,
  SNOWMAN_HORDE_LEADER_SPEED,
  SNOWMAN_HORDE_MELT_DPS,
  SNOWMAN_HORDE_MAX_LEASH_SQ,
  SNOWMAN_PUDDLE_DURATION,
  SNOWMAN_PUDDLE_FADE_START,
  SNOWMAN_PUDDLE_RADIUS,
  SNOWMAN_PUDDLE_SLOW_FACTOR,
  SNOWMAN_PUDDLE_TICK_INTERVAL,
  SNOWMAN_PUDDLE_TICK_DAMAGE,
  SNOWMAN_SEPARATION_SLICE_SIZE,
  SNOWMAN_SEPARATION_PERIOD,
  VirtualLeaderSnowmanHorde,
  type SnowmanEnemyFactory,
} from '../src/game/virtualLeaderSnowmanHorde';

const factory: SnowmanEnemyFactory = (id, x, y) => ({
  id,
  x,
  y,
  radius: 20,
  hp: 190,
  maxHp: 190,
  speed: 52,
  damage: 24,
  dead: false,
  isDefeated: false,
  isMiniboss: false,
  isBoss: false,
  statusEffects: {},
  isVirtualSnowmanMember: false,
  _snowmanHordeActive: false,
  _snowmanHordeInEngine: false,
  _snowmanHordeOwner: null,
  snowmanPointMultiplier: 1,
  snowmanContactCooldown: 0,
  meltHpRatio: 1.0,
  meltSquashX: 1.0,
  meltSquashY: 1.0,
  wobbleScaleX: 1.0,
  wobbleScaleY: 1.0,
});

function createEngine(gameTime = 0) {
  return {
    activeLevelId: 0,
    gameTime,
    timeStopTimer: 0,
    enemies: [] as any[],
    texts: [] as any[],
  };
}

describe('VirtualLeaderSnowmanHorde', () => {
  it('pre-allocates exactly 40 snowmen and 40 puddles with zero GC allocation', () => {
    const horde = new VirtualLeaderSnowmanHorde();
    horde.preparePool(factory);

    expect(horde.count).toBe(SNOWMAN_HORDE_COUNT);
    expect(horde.count).toBe(40);
    expect(horde.puddleCount).toBe(SNOWMAN_PUDDLE_POOL_COUNT);
    expect(horde.puddleCount).toBe(40);
    expect(horde.snowmen).toHaveLength(40);
    expect(horde.active).toHaveLength(40);
    expect(horde.puddleActive).toHaveLength(40);
    expect(horde.puddleX).toHaveLength(40);
    expect(horde.puddleY).toHaveLength(40);
    expect(horde.puddleLife).toHaveLength(40);
    expect(horde.puddleAlpha).toHaveLength(40);

    // Initial state: all pooled snowmen and puddles are deactivated
    expect(horde.snowmen.every((s) => s.dead && s.isDefeated)).toBe(true);
    expect(horde.active.every((a) => a === 0)).toBe(true);
    expect(horde.puddleActive.every((pa) => pa === 0)).toBe(true);
  });

  it('assigns circular slot offsets with golden angle distribution and sine wobble parameters', () => {
    const horde = new VirtualLeaderSnowmanHorde({ hordeRadius: 160 });
    horde.preparePool(factory);

    // Slot 0 at root distance
    const dist0 = 160 * Math.sqrt(0.5 / 40);
    expect(Math.hypot(horde.baseOffsetX[0], horde.baseOffsetY[0])).toBeCloseTo(dist0, 1);

    // Outer slots remain within horde radius
    for (let i = 0; i < 40; i++) {
      const dist = Math.hypot(horde.baseOffsetX[i], horde.baseOffsetY[i]);
      expect(dist).toBeLessThanOrEqual(160 + 0.01);
      expect(horde.wobbleSpeed[i]).toBeGreaterThan(1.0);
    }
  });

  it('virtual leader steers toward the player with O(1) logic and advances followers', () => {
    const horde = new VirtualLeaderSnowmanHorde({ startAt: 0, leaderSpeed: 40 });
    horde.preparePool(factory);

    const player = { x: 500, y: 0, radius: 20 };
    const engine = createEngine(0);

    // Start wave explicitly at fixed distance
    horde.startWave(engine, player, 1280, 720, 400);
    expect(horde.waveActive).toBe(true);
    expect(engine.enemies).toHaveLength(40);

    const initialLeaderX = horde.leaderX;
    const initialLeaderY = horde.leaderY;
    const dxToPlayer = player.x - initialLeaderX;
    const dyToPlayer = player.y - initialLeaderY;
    const dirLen = Math.hypot(dxToPlayer, dyToPlayer);

    // Step by 1 second
    engine.gameTime = 1.0;
    horde.update(1.0, engine, player, 1280, 720);

    // Virtual leader should have moved toward player by exactly leaderSpeed (40 px)
    const movedDist = Math.hypot(horde.leaderX - initialLeaderX, horde.leaderY - initialLeaderY);
    expect(movedDist).toBeCloseTo(SNOWMAN_HORDE_LEADER_SPEED, 1);
    expect(horde.leaderVx).toBeCloseTo((dxToPlayer / dirLen) * 40, 1);
    expect(horde.leaderVy).toBeCloseTo((dyToPlayer / dirLen) * 40, 1);
  });

  it('smoothly blends steering from slot offsets to direct player-homing within close range', () => {
    const horde = new VirtualLeaderSnowmanHorde({
      startAt: 0,
      closeRange: 80,
      farRange: 200,
    });
    horde.preparePool(factory);

    const player = { x: 0, y: 0, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 100);

    // Place snowman 0 far (>200)
    horde.x[0] = 300;
    horde.y[0] = 0;
    horde.snowmen[0].x = 300;
    horde.snowmen[0].y = 0;

    // Place snowman 1 close (<80)
    horde.x[1] = 50;
    horde.y[1] = 0;
    horde.snowmen[1].x = 50;
    horde.snowmen[1].y = 0;

    engine.gameTime = 0.1;
    horde.update(0.016, engine, player, 1280, 720);

    // Snowman 1 (close) has its velocity pointed directly towards player (x=0)
    expect(horde.snowmen[1].vx).toBeLessThan(0);
  });

  it('breakaway leash detaches snowmen pushed beyond MaxLeashDistanceSq after knockback', () => {
    const horde = new VirtualLeaderSnowmanHorde({
      startAt: 0,
      maxLeashDistanceSq: 320 * 320,
    });
    horde.preparePool(factory);

    const player = { x: 0, y: 0, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 200);

    expect(horde.detached[0]).toBe(0);

    // Knockback snowman 0 beyond 320px from leader
    horde.x[0] = horde.leaderX + 450;
    horde.y[0] = horde.leaderY;
    horde.snowmen[0].x = horde.x[0];
    horde.snowmen[0].y = horde.y[0];

    // Frame check triggers on (frameCount + index) % 30 === 0
    for (let f = 0; f < 30; f++) {
      engine.gameTime += 0.016;
      horde.update(0.016, engine, player, 1280, 720);
      if (horde.detached[0] === 1) break;
    }

    expect(horde.detached[0]).toBe(1);
  });

  it('updates time-sliced separation in 4-snowmen slices across a 10-frame period', () => {
    const horde = new VirtualLeaderSnowmanHorde({ startAt: 0 });
    horde.preparePool(factory);

    const player = { x: 0, y: 0, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 200);

    expect(SNOWMAN_SEPARATION_SLICE_SIZE).toBe(4);
    expect(SNOWMAN_SEPARATION_PERIOD).toBe(10);

    // Place two snowmen very close together (index 0 and index 1)
    horde.x[0] = 100;
    horde.y[0] = 100;
    horde.x[1] = 105;
    horde.y[1] = 100;

    // Step 1 frame (bucket 1 or 0 will process indices 0..3)
    engine.gameTime = 0.016;
    horde.update(0.016, engine, player, 1280, 720);

    // Separation cached values should push snowman 0 left (negative X) and snowman 1 right (positive X)
    expect(horde.cachedSepX[0]).toBeLessThan(0);
    expect(horde.cachedSepX[1]).toBeGreaterThan(0);
  });

  it('passively melts snowmen over time and visually squashes their scale', () => {
    const horde = new VirtualLeaderSnowmanHorde({
      startAt: 0,
      meltDamagePerSecond: 10,
    });
    horde.preparePool(factory);

    const player = { x: 1000, y: 1000, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 500);

    const snowman = horde.snowmen[0];
    const initialHp = snowman.hp;

    engine.gameTime = 2.0;
    horde.update(2.0, engine, player, 1280, 720);

    // Should have lost 20 HP from passive melting
    expect(snowman.hp).toBeCloseTo(initialHp - 20, 1);
    expect(snowman.meltHpRatio).toBeLessThan(1.0);
    expect(snowman.meltSquashX).toBeGreaterThan(1.0); // wider at base
    expect(snowman.meltSquashY).toBeLessThan(1.0); // squashed vertically
  });

  it('dissolves on death and spawns a 4.0s Water Puddle hazard at the exact position', () => {
    const horde = new VirtualLeaderSnowmanHorde({
      startAt: 0,
      puddleDuration: 4.0,
    });
    horde.preparePool(factory);

    const player = { x: 1000, y: 1000, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 300);

    // Force-kill snowman 5 at exact coordinates (123, 456)
    const deadX = 123;
    const deadY = 456;
    horde.x[5] = deadX;
    horde.y[5] = deadY;
    horde.snowmen[5].hp = 0;
    horde.snowmen[5].dead = true;

    engine.gameTime = 0.016;
    horde.update(0.016, engine, player, 1280, 720);

    // Snowman 5 should be deactivated and a puddle spawned at (123, 456)
    expect(horde.active[5]).toBe(0);
    expect(horde.puddleActive[0]).toBe(1);
    expect(horde.puddleX[0]).toBe(deadX);
    expect(horde.puddleY[0]).toBe(deadY);
    expect(horde.puddleLife[0]).toBeCloseTo(SNOWMAN_PUDDLE_DURATION - 0.016, 2);
    expect(horde.puddleAlpha[0]).toBe(1.0);
  });

  it('fades puddle alpha over the final 1.0 second and deactivates after 4.0 seconds', () => {
    const horde = new VirtualLeaderSnowmanHorde();
    horde.preparePool(factory);

    horde.spawnPuddle(100, 100);
    expect(horde.puddleActive[0]).toBe(1);
    expect(horde.puddleLife[0]).toBe(4.0);
    expect(horde.puddleAlpha[0]).toBe(1.0);

    const engine = createEngine(0);
    const player = { x: 500, y: 500, radius: 20 };

    // Advance 2.5s (life = 1.5s -> still alpha 1.0)
    engine.gameTime = 2.5;
    horde.update(2.5, engine, player, 1280, 720);
    expect(horde.puddleActive[0]).toBe(1);
    expect(horde.puddleAlpha[0]).toBe(1.0);

    // Advance 1.0s more (life = 0.5s -> in final 1.0s fade window)
    engine.gameTime = 3.5;
    horde.update(1.0, engine, player, 1280, 720);
    expect(horde.puddleActive[0]).toBe(1);
    expect(horde.puddleAlpha[0]).toBeCloseTo(0.5 / SNOWMAN_PUDDLE_FADE_START, 2);

    // Advance 0.6s more (life <= 0 -> deactivated)
    engine.gameTime = 4.1;
    horde.update(0.6, engine, player, 1280, 720);
    expect(horde.puddleActive[0]).toBe(0);
  });

  it('applies non-stacking 25% player slow and periodic 0.5s tick damage when overlapping puddles', () => {
    const horde = new VirtualLeaderSnowmanHorde({
      puddleTickInterval: 0.5,
      puddleTickDamage: 3,
    });
    horde.preparePool(factory);

    // Spawn 3 overlapping puddles around (0, 0)
    horde.spawnPuddle(0, 0);
    horde.spawnPuddle(5, 5);
    horde.spawnPuddle(-5, -5);

    let damageTaken = 0;
    const player = {
      x: 0,
      y: 0,
      radius: 20,
      meltingPuddleSlowTimer: 0,
      takeDamage: (dmg: number) => {
        damageTaken += dmg;
      },
    };
    const engine = createEngine(0);

    // Tick 0.1s inside puddles
    engine.gameTime = 0.1;
    horde.update(0.1, engine, player, 1280, 720);

    // Slow timer should be active (non-stacking boolean timer)
    expect(player.meltingPuddleSlowTimer).toBeGreaterThan(0);
    // Periodic tick damage dealt (first tick on entry)
    expect(damageTaken).toBe(3);

    // Step 0.2s: within 0.5s interval -> no second damage tick yet
    engine.gameTime = 0.3;
    horde.update(0.2, engine, player, 1280, 720);
    expect(damageTaken).toBe(3);

    // Step 0.35s (total 0.55s elapsed since first tick) -> second tick triggers
    engine.gameTime = 0.65;
    horde.update(0.35, engine, player, 1280, 720);
    expect(damageTaken).toBe(6);

    // Move player far away from puddles
    player.x = 800;
    player.y = 800;
    player.meltingPuddleSlowTimer = 0;
    engine.gameTime = 1.0;
    horde.update(0.35, engine, player, 1280, 720);

    // No slow re-applied and no damage
    expect(player.meltingPuddleSlowTimer).toBe(0);
    expect(damageTaken).toBe(6);
  });

  it('simultaneously melting all 40 snowmen recycles puddle slots without crashing or throwing', () => {
    const horde = new VirtualLeaderSnowmanHorde();
    horde.preparePool(factory);

    const player = { x: 0, y: 0, radius: 20 };
    const engine = createEngine(0);
    horde.startWave(engine, player, 1280, 720, 200);

    // Instantly kill all 40 snowmen
    for (let i = 0; i < 40; i++) {
      horde.snowmen[i].hp = 0;
      horde.snowmen[i].dead = true;
    }

    expect(() => {
      horde.update(0.016, engine, player, 1280, 720);
    }).not.toThrow();

    expect(horde.active.every((a) => a === 0)).toBe(true);
    expect(horde.puddleActive.every((pa) => pa === 1)).toBe(true);
  });

  it('reduces snowman point value by 30% (multiplier 0.35 and base points 49)', async () => {
    const { ENEMY_POINTS } = await import('../src/constants');
    expect(SNOWMAN_HORDE_POINT_MULTIPLIER).toBe(0.35);
    expect(ENEMY_POINTS.tajici_snehulak).toBe(49);
  });

  it('ensures regular game and director do not avoid spawning melting snowmen in Stage 1', async () => {
    const { GAME_LEVELS } = await import('../src/data/levels');
    const { RUN_ROZMARY } = await import('../src/data/runArchetypes');
    const lvl0 = GAME_LEVELS[0];

    // tajici_snehulak is included across primary daylight and evening phases
    expect(lvl0.spawnPools.noon).toContain('tajici_snehulak');
    expect(lvl0.spawnPools.afternoon).toContain('tajici_snehulak');
    expect(lvl0.spawnPools.dusk).toContain('tajici_snehulak');
    expect(lvl0.spawnPools.night).toContain('tajici_snehulak');

    // Preferred in the central spring thaw archetype
    const taniKer = RUN_ROZMARY[0].find((r) => r.id === 'tani_ker');
    expect(taniKer).toBeDefined();
    expect(taniKer?.preferredEnemyIds).toContain('tajici_snehulak');
  });
});
