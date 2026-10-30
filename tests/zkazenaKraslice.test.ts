import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { Lada } from '../src/render/ladaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Ticket 04: Taktický nepřítel: Zkažená kraslice', () => {
  it('registers zkazena_kraslice in ENEMIES with authentic attributes and lore', () => {
    const kraslice = ENEMIES.zkazena_kraslice;
    expect(kraslice).toBeDefined();
    expect(kraslice.id).toBe('zkazena_kraslice');
    expect(kraslice.name).toBe('Zkažená kraslice');
    expect(kraslice.method).toBe('drawZkazenaKraslice');
    expect(kraslice.category).toBe('swarms');
    expect(kraslice.hp).toBeGreaterThan(0);
    expect(kraslice.speed).toBeGreaterThan(0);
    expect(kraslice.lore).toContain('vajíčko');
  });

  it('draws authentic folk batik egg with cracks and ticking fuse without throwing', () => {
    const mockCtx = createMockCanvasContext() as unknown as CanvasRenderingContext2D;
    expect(() => {
      Lada.drawZkazenaKraslice(mockCtx, 100, 100, 0.5, 1, false);
    }).not.toThrow();

    // Primed fuse state
    expect(() => {
      Lada.drawZkazenaKraslice(mockCtx, 100, 100, 0.5, 1, false, undefined, {
        fusePrimed: true,
        fuseTimer: 0.8,
      });
    }).not.toThrow();
  });

  it('hops erratically toward the player with alternating height and speed bursts', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 200;
    player.y = 0;

    const kraslice = engine.spawnMonster('zkazena_kraslice', 0, 0);

    // Initial update
    kraslice.update(0.1, player);
    expect(kraslice.hopPhase).toBeGreaterThan(0);
    expect(kraslice.vx).toBeGreaterThan(0); // moves toward player along positive X

    // Step across half hop cycle
    kraslice.update(0.35, player);
    expect(kraslice.hopHeight).toBeDefined();
    expect(kraslice.fusePrimed).toBeFalsy();
  });

  it('enters 1.2 s ticking fuse upon taking lethal damage instead of dying instantly', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 500;
    player.y = 500;

    const kraslice = engine.spawnMonster('zkazena_kraslice', 0, 0);
    expect(kraslice.hp).toBeGreaterThan(0);

    // Inflict lethal damage
    kraslice.takeDamage(500, 'physical');

    expect(kraslice.hp).toBe(0);
    expect(kraslice.fusePrimed).toBe(true);
    expect(kraslice.fuseTimer).toBeCloseTo(1.2, 2);
    expect(kraslice.dead).toBeFalsy();
    expect(kraslice.isDefeated).toBeFalsy();

    // Additional hits while ticking fuse are ignored
    kraslice.takeDamage(200, 'magic');
    expect(kraslice.fuseTimer).toBeCloseTo(1.2, 2);
  });

  it('triggers fuse on proximity, stops moving, and detonates after 1.2 s', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 30;
    player.y = 0;

    const kraslice = engine.spawnMonster('zkazena_kraslice', 0, 0);

    // Update with player nearby (< 48 px distance)
    kraslice.update(0.05, player);
    expect(kraslice.fusePrimed).toBe(true);
    expect(kraslice.vx).toBe(0);
    expect(kraslice.vy).toBe(0);

    // Step forward 0.5 s: still ticking
    kraslice.update(0.5, player);
    expect(kraslice.fuseTimer).toBeLessThan(1.0);
    expect(kraslice.dead).toBeFalsy();

    // Step remaining 0.8 s: detonation
    kraslice.update(0.8, player);
    expect(kraslice.dead).toBe(true);
    expect(kraslice.isDefeated).toBe(true);
  });

  it('deals AoE damage to player and friendly-fire splash damage to surrounding enemies on detonation', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 40;
    player.y = 0;
    player.hp = 100;
    player.maxHp = 100;
    player.hpRegen = 0;

    const kraslice = engine.spawnMonster('zkazena_kraslice', 0, 0);
    const nearbyMob = engine.spawnMonster('rarach', 50, 0); // 50 px away
    nearbyMob.hp = 100;

    // Trigger detonation directly
    kraslice.detonateKraslice(player);

    expect(kraslice.dead).toBe(true);
    expect(player.hp).toBeLessThan(100); // player damaged
    expect(nearbyMob.hp).toBeLessThan(100); // enemy took friendly-fire splash damage
    expect(nearbyMob.kbx).toBeGreaterThan(0); // pushed away from blast center
  });

  it('spawns a foul yolk puddle that slows and inflicts dot damage over time', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 0;
    player.y = 0;
    player.hp = 100;
    player.maxHp = 100;
    player.hpRegen = 0;

    engine.spawnYolkPuddle(0, 0, 48, 4.0);
    expect(engine.yolkPuddles?.length).toBe(1);

    const puddle = engine.yolkPuddles![0];
    expect(puddle.radius).toBe(48);
    expect(puddle.life).toBe(4.0);

    // Update engine loop: player is inside puddle, so speed is slowed and dot is applied
    engine.update(0.6);
    expect(player.speedMultiplier).toBeLessThan(1.0);
    expect(player.hp).toBeLessThan(100); // took poison tick
  });

  it('enables tactical chain reactions when multiple kraslice explode next to each other', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 500;
    player.y = 500;

    const egg1 = engine.spawnMonster('zkazena_kraslice', 0, 0);
    const egg2 = engine.spawnMonster('zkazena_kraslice', 0, 0);
    egg2.x = egg1.x + 35;
    egg2.y = egg1.y;

    expect(egg2.fusePrimed).toBeFalsy();

    // Detonate egg1 -> deals ~60 splash damage to egg2 (hp=55), which kills egg2 and primes its fuse!
    egg1.detonateKraslice(player);

    expect(egg1.dead).toBe(true);
    expect(egg2.fusePrimed).toBe(true); // chain primed!
    expect(egg2.fuseTimer).toBeCloseTo(1.2, 2);
  });
});
