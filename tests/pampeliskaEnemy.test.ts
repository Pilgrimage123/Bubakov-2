import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { GameEngine } from '../src/game/engine';

describe('Pampeliškové chmýří (Dandelion Sprites) Mechanics', () => {
  it('registers pampeliska_chmyri and pampeliska_chmyricko in enemy catalog and points table', () => {
    const parent = ENEMIES.pampeliska_chmyri;
    const mini = ENEMIES.pampeliska_chmyricko;

    expect(parent).toBeDefined();
    expect(mini).toBeDefined();
    expect(parent.category).toBe('swarms');
    expect(mini.category).toBe('swarms');
    expect(parent.isFlying).toBe(true);
    expect(mini.isFlying).toBe(true);
    expect(parent.method).toBe('drawDandelionSprite');
    expect(mini.method).toBe('drawDandelionSprite');

    expect(ENEMY_POINTS.pampeliska_chmyri).toBeGreaterThan(0);
    expect(ENEMY_POINTS.pampeliska_chmyricko).toBeGreaterThan(0);
    expect(mini.speed).toBeGreaterThan(parent.speed);
    expect(mini.radius).toBeLessThan(parent.radius);
  });

  it('updates dandelion kinematics with wind drift and floating altitude', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const puff = engine.spawnMonster('pampeliska_chmyri', 250, 250, 1.0);
    expect(puff).toBeDefined();

    // Step physics
    engine.update(0.05);

    expect(puff.driftPhase).toBeDefined();
    expect(puff.driftPhase).toBeGreaterThan(0);
    expect(puff.flightAltitude).toBeGreaterThan(0);
    expect(Math.hypot(puff.vx, puff.vy)).toBeGreaterThan(0);
  });

  it('splits into 3 pampeliska_chmyricko mini-seedlets when hit with standard melee/non-piercing attack', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const initialEnemyCount = engine.state.enemies.length;
    const puff = engine.spawnMonster('pampeliska_chmyri', 100, 100, 1.0);
    expect(engine.state.enemies.length).toBe(initialEnemyCount + 1);

    // Lethal non-piercing physical strike (not overkill: hp is 28, maxHp is 28, overkill threshold is 28 * 3 = 84)
    puff.takeDamage(30, 'physical', 10, 0, { isMelee: true });

    expect(puff.isDefeated).toBe(true);
    expect(puff.hasSplit).toBe(true);

    // Find spawned mini-seedlets
    const minis = engine.state.enemies.filter((e: any) => e.id === 'pampeliska_chmyricko');
    expect(minis.length).toBe(3);

    for (const mini of minis) {
      expect(mini.isFlying).toBe(true);
      expect(Math.hypot(mini.x - 100, mini.y - 100)).toBeLessThan(35);
      expect(Math.hypot(mini.kbx, mini.kby)).toBeGreaterThan(0);
    }
  });

  it('disperses cleanly without splitting when killed by piercing damage', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const puff = engine.spawnMonster('pampeliska_chmyri', 100, 100, 1.0);
    puff.takeDamage(30, 'physical', 10, 0, { isPiercing: true });

    expect(puff.isDefeated).toBe(true);
    const minis = engine.state.enemies.filter((e: any) => e.id === 'pampeliska_chmyricko');
    expect(minis.length).toBe(0);
  });

  it('disperses cleanly without splitting when killed by fire or area damage or overkill', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    // Fire damage
    const puffFire = engine.spawnMonster('pampeliska_chmyri', 100, 100, 1.0);
    puffFire.takeDamage(30, 'fire');
    expect(puffFire.isDefeated).toBe(true);
    expect(engine.state.enemies.filter((e: any) => e.id === 'pampeliska_chmyricko').length).toBe(0);

    // Area damage
    const puffArea = engine.spawnMonster('pampeliska_chmyri', 100, 100, 1.0);
    puffArea.takeDamage(30, 'area');
    expect(puffArea.isDefeated).toBe(true);
    expect(engine.state.enemies.filter((e: any) => e.id === 'pampeliska_chmyricko').length).toBe(0);

    // Overkill damage (90 >= 28 * 3)
    const puffOverkill = engine.spawnMonster('pampeliska_chmyri', 100, 100, 1.0);
    puffOverkill.takeDamage(120, 'physical');
    expect(puffOverkill.overkill).toBe(true);
    expect(puffOverkill.isDefeated).toBe(true);
    expect(engine.state.enemies.filter((e: any) => e.id === 'pampeliska_chmyricko').length).toBe(0);
  });
});
