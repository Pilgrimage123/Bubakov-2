import { describe, it, expect, vi } from 'vitest';
import { ENEMY_PREFIX_DEFS, EnemyPrefixType } from '../src/types';
import { GameEngine } from '../src/game/engine';
import { RunDirector } from '../src/game/director';
import { ENEMIES } from '../src/data/enemies';
import { drawPrefixAura } from '../src/render/ladaRenderer';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Special Enemy Prefixes (Vichřicový, Hromový, Kamenný, Pekelný)', () => {
  it('defines all 4 special prefixes with distinct properties and 15 threat budget cost', () => {
    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    prefixes.forEach((p) => {
      const def = ENEMY_PREFIX_DEFS[p];
      expect(def).toBeDefined();
      expect(def.id).toBe(p);
      expect(def.threatBudgetCost).toBe(15); // Exactly 5x regular tactical mob (3)
      expect(def.badge).toBeTruthy();
      expect(def.color).toBeTruthy();
      expect(def.glowColor).toBeTruthy();
    });

    expect(ENEMY_PREFIX_DEFS.vichricovy.speedBonus).toBe(110);
    expect(ENEMY_PREFIX_DEFS.vichricovy.dodgeChance).toBe(0.50);

    expect(ENEMY_PREFIX_DEFS.hromovy.speedBonus).toBe(70);
    expect(ENEMY_PREFIX_DEFS.hromovy.thornsReflectRatio).toBe(0.50);
    expect(ENEMY_PREFIX_DEFS.hromovy.thornsRange).toBe(200);

    expect(ENEMY_PREFIX_DEFS.kamenny.damageReduction).toBe(0.91);
    expect(ENEMY_PREFIX_DEFS.kamenny.speedMultiplier).toBe(0.80);
    expect(ENEMY_PREFIX_DEFS.kamenny.immuneToStun).toBe(true);
    expect(ENEMY_PREFIX_DEFS.kamenny.immuneToSnackStun).toBe(true);

    expect(ENEMY_PREFIX_DEFS.pekelny.magmaTrail).toBe(true);
    expect(ENEMY_PREFIX_DEFS.pekelny.predatoryStalk).toBe(true);
    expect(ENEMY_PREFIX_DEFS.pekelny.predictiveEruption).toBe(true);
  });

  it('Vichřicový prefix grants +110 speed and 50% dodge chance in GameEngine', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const baseStats = ENEMIES.rarach;
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'vichricovy');

    expect(enemy.prefix).toBe('vichricovy');
    expect(enemy.speed).toBe(baseStats.speed + 110);
    expect(enemy.dodgeChance).toBe(0.50);

    // Test dodge: mock Math.random to return 0.2 (< 0.50) -> dodges damage
    const startHp = enemy.hp;
    const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    enemy.takeDamage(10, 'physical', 0, 0);
    expect(enemy.hp).toBe(startHp);

    // Test hit: mock Math.random to return 0.8 (>= 0.50) -> takes damage
    randSpy.mockReturnValue(0.8);
    enemy.takeDamage(10, 'physical', 0, 0);
    expect(enemy.hp).toBeLessThan(startHp);
    randSpy.mockRestore();
  });

  it('Hromový prefix reflects 50% damage back to player within 200px', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'hromovy');

    expect(enemy.prefix).toBe('hromovy');
    expect(enemy.isThunderous).toBe(true);

    // Player standing at (120, 100) -> distance 20px (<= 200px)
    engine.state.player = {
      x: 120,
      y: 100,
      hp: 100,
      maxHp: 100,
      takeDamage: vi.fn(),
    } as any;

    enemy.takeDamage(50, 'physical', 0, 0);
    expect(engine.state.player.takeDamage).toHaveBeenCalledWith(
      expect.any(Number),
      'lightning',
      enemy,
      false
    );
  });

  it('Kamenný prefix applies 91% damage reduction, -20% speed, stun and snack immunity', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const baseStats = ENEMIES.rarach;
    const baseEnemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0);
    const stoneEnemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'kamenny');

    expect(stoneEnemy.prefix).toBe('kamenny');
    expect(stoneEnemy.prefixDamageReduction).toBe(0.91);
    expect(stoneEnemy.speed).toBe(Math.round(baseStats.speed * 0.80));

    // Stun immunity test: stun duration should not stun stone enemy
    stoneEnemy.takeDamage(10, 'physical', 0, 0, { stunDuration: 3.0 });
    expect(stoneEnemy.stunTimer).toBe(0);

    // Snack immunity test: snack timer reset in update
    stoneEnemy.snackTimer = 2.0;
    stoneEnemy.update(0.1, { x: 500, y: 500 });
    expect(stoneEnemy.snackTimer).toBe(0);

    // 91% damage reduction: takes vastly less damage than base enemy
    const stoneStartHp = stoneEnemy.hp;
    stoneEnemy.takeDamage(100, 'physical', 50, 0);
    const stoneDmgTaken = stoneStartHp - stoneEnemy.hp;

    const baseStartHp = baseEnemy.hp;
    baseEnemy.takeDamage(100, 'physical', 50, 0);
    const baseDmgTaken = baseStartHp - baseEnemy.hp;

    expect(stoneDmgTaken).toBeLessThan(baseDmgTaken * 0.2); // Takes only ~9% damage
    expect(stoneEnemy.kbx).toBeLessThan(baseEnemy.kbx);
  });

  it('Pekelný prefix sets fire trail and anti-kiting capabilities', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'pekelny');

    expect(enemy.prefix).toBe('pekelny');
    expect(enemy.hasFireTrail).toBe(true);
  });

  it('All 4 prefixed enemies retain non-enlarged base enemy drops and stats', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const regular = engine.createHeadlessEnemy('rarach', 100, 100);

    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    prefixes.forEach((p) => {
      const prefixed = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, p);
      expect(prefixed.id).toBe('rarach');
      expect(prefixed.coinValue).toBe(regular.coinValue);
      expect(prefixed.xp).toBe(regular.xp);
    });
  });

  it('Director deploys prefixed enemy with 15 threat budget when player dominates or kills fast', () => {
    const director = new RunDirector(1, 42);
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const player = { x: 500, y: 500, vx: 0, vy: 0 };

    director.threatBudget = 30;
    const initialBudget = director.threatBudget;

    const prefixedMob = director.spawnPrefixedEnemy(engine, player, 15.0, 'vichricovy');
    expect(prefixedMob).toBeDefined();
    expect(prefixedMob.prefix).toBe('vichricovy');
    // Exactly 15 threat budget consumed (5x regular 3)
    expect(director.threatBudget).toBe(initialBudget - 15);
  });

  it('drawPrefixAura executes without error for all 4 prefixes', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt',
    } as unknown as CanvasRenderingContext2D;

    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    prefixes.forEach((p) => {
      expect(() => {
        drawPrefixAura(mockCtx, 100, 100, 25, p, 1.5);
      }).not.toThrow();
    });
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
