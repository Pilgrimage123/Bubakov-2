import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Village progression effects', () => {
  it('exposes the Chapel Holy damage multiplier per level on player runtime', () => {
    const createPlayer = (churchLevel: number) => {
      const meta = createDefaultMetaProgression();
      meta.churchLevel = churchLevel;
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
      return engine.state.player as any;
    };

    expect(createPlayer(0).holyDamageMultiplier).toBe(1);
    expect(createPlayer(1).holyDamageMultiplier).toBeCloseTo(1.08, 8);
    expect(createPlayer(2).holyDamageMultiplier).toBeCloseTo(1.16, 8);
  });

  it('boosts holy damage in takeDamage using Chapel holyDamageMultiplier', () => {
    const meta = createDefaultMetaProgression();
    meta.churchLevel = 2; // +16% holy damage
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
    const enemy = engine.spawnMonster('certik', 100, 100);
    enemy.isIlluminated = true;
    const startHp = enemy.hp;

    // Deal 100 holy damage
    enemy.takeDamage(100, 'holy');
    const dmgDealt = startHp - enemy.hp;
    // 100 * 1.16 = 116 (certik has 0 holy resist)
    expect(dmgDealt).toBeCloseTo(116, 0);
  });

  it('triggers consecrated wave when a soul is rescued', () => {
    const meta = createDefaultMetaProgression();
    meta.churchLevel = 2; // 2 * 75 = 150 posvátné poškození
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
    const enemy = engine.spawnMonster('certik', 50, 50);
    const startHp = enemy.hp;

    // Spawn a soul drop near the player
    engine.spawnDrop('soul', 0, 0);
    // Run an update frame so the player picks up the soul
    engine.update(0.1);

    expect(engine.state.souls).toBe(1);
    expect(enemy.hp).toBeLessThan(startHp);
  });

  it('preserves character archetypes on runtime player initialization', () => {
    const meta = createDefaultMetaProgression();
    meta.wallLevel = 3;
    meta.millLevel = 3;
    meta.scarecrowLevel = 3;
    meta.boziMukaLevel = 3;

    const createHunter = (type: any) => {
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: type, meta, spawnInitialWave: false });
      return engine.state.player;
    };

    const wanderer = createHunter('wanderer');
    const granny = createHunter('granny');
    const watchman = createHunter('watchman');
    const korenarka = createHunter('korenarka');
    const shepherd = createHunter('shepherd');

    // Wanderer has base 200, Watchman base 140, Granny base 130
    expect(wanderer.maxHp).toBeGreaterThan(watchman.maxHp);
    expect(watchman.maxHp).toBeGreaterThan(granny.maxHp);

    // Shepherd (base 220) is faster than Wanderer (base 165)
    expect(shepherd.speed).toBeGreaterThan(wanderer.speed);

    // Granny has highest luck
    expect(granny.luck).toBeGreaterThan(wanderer.luck);

    // Kořenářka preserves tighter pickup radius than Wanderer
    expect(korenarka.pickupRadius).toBeLessThan(wanderer.pickupRadius);
  });

  it('correctly uses fractional drop accumulator for low-value drops', () => {
    const meta = createDefaultMetaProgression();
    meta.undeadLevel = 1; // +10% krejcary: each drop of 1 gives 1.1 -> accumulator stores 0.1
    meta.ovenLevel = 1; // +10% perníčky: each drop of 1 gives 1.1 -> accumulator stores 0.1
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });

    // Pick up 10 coins of value 1
    for (let i = 0; i < 10; i++) {
      engine.spawnDrop('coin', 0, 0, { value: 1 });
      engine.update(0.05);
    }
    // Exactly 11 coins should have been granted! (Without accumulator, Math.round(1.1) would give only 10)
    expect(engine.state.coins).toBe(11);

    // Pick up 10 gingerbread of value 1
    for (let i = 0; i < 10; i++) {
      engine.spawnDrop('gingerbread', 0, 0, { value: 1 });
      engine.update(0.05);
    }
    // Exactly 11 gingerbread should have been granted!
    expect(engine.state.gingerbread).toBe(11);
  });
});
