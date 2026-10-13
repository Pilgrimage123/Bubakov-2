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

  it.each([
    { distance: 200, shouldReflect: true },
    { distance: 201, shouldReflect: false },
  ])('Hromový reflection obeys the 200px boundary (distance=$distance)', ({ distance, shouldReflect }) => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'hromovy');
    // Keep the enemy alive so the observed HP delta is the full applied damage.
    enemy.hp = 200;
    enemy.maxHp = 200;
    const player = {
      x: 100 + distance,
      y: 100,
      hp: 100,
      maxHp: 100,
      takeDamage: vi.fn(),
    } as any;
    engine.state.player = player;

    const hpBefore = enemy.hp;
    enemy.takeDamage(50, 'physical', 0, 0);
    const damageTaken = hpBefore - enemy.hp;

    expect(enemy.prefix).toBe('hromovy');
    expect(enemy.isThunderous).toBe(true);
    if (shouldReflect) {
      expect(player.takeDamage).toHaveBeenCalledWith(
        Math.max(1, Math.round(damageTaken * 0.5)),
        'lightning',
        enemy,
        false
      );
    } else {
      expect(player.takeDamage).not.toHaveBeenCalled();
    }
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

  it('Pekelný stalk acceleration grows by 15% per second, caps at 120%, and resets at close range', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'pekelny');
    const player = { x: 500, y: 100, vx: 0, vy: 0 };

    enemy.update(1.0, player);
    expect(enemy.prefix).toBe('pekelny');
    expect(enemy.hasFireTrail).toBe(true);
    expect(enemy.stalkSpeedBonus).toBeCloseTo(0.15);

    for (let i = 0; i < 12; i++) {
      player.x += 500; // Keep the hunter far away while checking the cap.
      enemy.update(1.0, player);
    }
    expect(enemy.stalkSpeedBonus).toBe(1.2);

    player.x = enemy.x + 100;
    player.y = enemy.y;
    enemy.update(0.1, player);
    expect(enemy.stalkSpeedBonus).toBe(0);
  });

  it('Pekelný leaves damaging magma hazards while moving', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'pekelny');
    const player = engine.state.player;

    enemy.update(0.6, { x: 500, y: 100, vx: 0, vy: 0 });
    const magma = engine.director!.hazards.find((hazard: any) => hazard.kind === 'magma-trail');
    expect(magma).toBeDefined();
    expect(magma.duration).toBe(9);
    expect(magma.damage).toBe(6);

    player.x = magma.x;
    player.y = magma.y;
    player.takeDamage = vi.fn();
    engine.director!.update(0.1, engine);
    expect(player.takeDamage).toHaveBeenCalledWith(6, 'fire', null, false);
  });

  it('Pekelný creates a telegraphed fissure 200–250px ahead after 2.5 seconds of straight running', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'pekelny');
    const player = engine.state.player;
    player.x = 500;
    player.y = 100;
    player.vx = 60;
    player.vy = 0;

    let fissure: any;
    for (let i = 0; i < 36; i++) {
      player.x += 5;
      enemy.update(0.1, player);
      fissure = engine.director!.hazards.find((hazard: any) => hazard.kind === 'predictive-fissure');
      if (fissure) break;
    }
    expect(fissure).toBeDefined();
    expect(fissure.warningTimer).toBe(1.2);
    expect(fissure.damage).toBe(24);
    expect(fissure.oneShot).toBe(true);
    const distanceAhead = fissure.x - player.x;
    expect(distanceAhead).toBeGreaterThanOrEqual(200);
    expect(distanceAhead).toBeLessThanOrEqual(250);
  });

  it('predictive fissure damages at the end of its warning and only once', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const player = engine.state.player;
    player.x = 220;
    player.y = 180;
    player.takeDamage = vi.fn();
    const fissure: any = {
      id: 'test-fissure',
      x: 220,
      y: 180,
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
    };
    engine.director!.hazards.push(fissure);

    (engine.director as any).updateHazards(1.21, player);
    expect(player.takeDamage).toHaveBeenCalledTimes(1);
    expect(player.takeDamage).toHaveBeenCalledWith(24, 'fire', null, false);
    expect(fissure.exploded).toBe(true);

    (engine.director as any).updateHazards(0.05, player);
    expect(player.takeDamage).toHaveBeenCalledTimes(1);
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

    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny', 'vycerpany'];
    prefixes.forEach((p) => {
      expect(() => {
        drawPrefixAura(mockCtx, 100, 100, 25, p, 1.5);
      }).not.toThrow();
    });
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('Vyčerpaný prefix applies -50% HP, -50% speed, -50% attack cadence, and retains 100% full drop values', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const baseStats = ENEMIES.rarach;
    const baseEnemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0);
    const exhaustedEnemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'vycerpany');

    expect(exhaustedEnemy.prefix).toBe('vycerpany');
    // -50% HP
    expect(exhaustedEnemy.maxHp).toBe(Math.round(baseStats.hp * 0.50));
    expect(exhaustedEnemy.hp).toBe(Math.round(baseStats.hp * 0.50));
    // -50% movement speed
    expect(exhaustedEnemy.speed).toBe(Math.round(baseStats.speed * 0.50));
    // -50% attack speed (interval multiplied by 1.5)
    expect(exhaustedEnemy.attackInterval).toBeCloseTo(baseEnemy.attackInterval * 1.5);
    expect(exhaustedEnemy.attackDelay).toBeCloseTo(baseEnemy.attackDelay * 1.5);

    // Full drop values preserved
    expect(exhaustedEnemy.coinValue).toBe(baseEnemy.coinValue);
    expect(exhaustedEnemy.xp).toBe(baseEnemy.xp);
  });

  it('Director deploys punitive Dvojče minibosse at extreme difficulty (>= 4.5) when player dominates', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 5.0, spawnInitialWave: false });
    const director = engine.director!;
    director.threatBudget = 40;
    director.valvePhase = 'buildup';

    // Player dominating: rapid kills leading to high dominance
    for (let i = 0; i < 8; i++) {
      const mob = { id: `quick_mob_${i}` };
      director.recordEnemySpawn(mob, i * 0.2);
      director.recordEnemyDeath(mob, i * 0.2 + 0.1);
    }
    const dominance = director.computeDominanceIndex(engine.state.player);
    expect(dominance).toBeGreaterThanOrEqual(0.70);

    // Run tactical update
    director.update(0.5, engine);

    // Punitive twin miniboss spawned
    expect(director.activePunitiveMiniboss).toBeTruthy();
    expect(director.activePunitiveMiniboss.isPunitiveTwin).toBe(true);
    expect(director.activePunitiveMiniboss.customBossTitle).toContain('Dvojče:');
    expect(engine.state.directorTelegraphText).toContain('Dvojče minibosse');
  });

  it('Lowest difficulty (2.0) never deploys punitive twin miniboss even with full player dominance', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const director = engine.director!;
    director.threatBudget = 40;
    director.valvePhase = 'buildup';

    // Player dominating: rapid kills leading to high dominance
    for (let i = 0; i < 8; i++) {
      const mob = { id: `quick_mob_${i}` };
      director.recordEnemySpawn(mob, i * 0.2);
      director.recordEnemyDeath(mob, i * 0.2 + 0.1);
    }

    // Run tactical update
    director.update(0.5, engine);

    expect(director.activePunitiveMiniboss).toBeNull();
    const hasTwin = engine.livingEnemies.some((e: any) => e.isPunitiveTwin);
    expect(hasTwin).toBe(false);
    expect(director.pressureMultiplier).toBeLessThanOrEqual(1.0);
  });

  it('Progressive assistance deploys Vyčerpaný enemies when player is in distress', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 3.0, spawnInitialWave: false });
    const director = engine.director!;
    director.threatBudget = 30;
    director.valvePhase = 'buildup';

    // Player in distress: low HP
    engine.state.player.hp = Math.round(engine.state.player.maxHp * 0.25);
    director.update(0.1, engine);
    expect(director.assistanceActive).toBe(true);

    // Set lastSpawnCheck so spawn check interval triggers tactical spawns
    director.lastSpawnCheck = 5.0;

    // Mock Math.random to return 0.05 so distressIndex triggers Vyčerpaný spawn
    const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05);
    director.update(0.5, engine);
    randSpy.mockRestore();

    const vycerpanyMobs = engine.livingEnemies.filter((e: any) => e.prefix === 'vycerpany');
    expect(vycerpanyMobs.length).toBeGreaterThan(0);
  });

  it('Zero-Hidden-Cheat Policy: enemies strictly receive base stats and only prefix or explicit abilities bonuses', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const baseStats = ENEMIES.rarach;

    // 1. Regular enemy: strictly base stats
    const normalEnemy = engine.createHeadlessEnemy('rarach', 100, 100);
    expect(normalEnemy.hp).toBe(baseStats.hp);
    expect(normalEnemy.speed).toBe(baseStats.speed);
    expect(normalEnemy.damage).toBe(baseStats.damage);
    expect(normalEnemy.poiseResist).toBe(baseStats.poiseResist || 0);

    // 2. Prefixed enemy under high director pressure: only prefix bonus, zero hidden pressure buffs
    const director = engine.director!;
    director.pressureMultiplier = 3.5; // Extreme pressure
    const player = { x: 500, y: 500, vx: 0, vy: 0 };
    const vichriceMob = director.spawnPrefixedEnemy(engine, player, 50.0, 'vichricovy');

    // Expected speed is strictly mobBaseStats.speed + ENEMY_PREFIX_DEFS.vichricovy.speedBonus (no pressureMultiplier buff)
    const mobBaseStats = ENEMIES[vichriceMob.id];
    const expectedSpeed = mobBaseStats.speed + ENEMY_PREFIX_DEFS.vichricovy.speedBonus!;
    expect(vichriceMob.speed).toBe(expectedSpeed);
    expect(vichriceMob.poiseResist).toBe(mobBaseStats.poiseResist || 0);
    expect(vichriceMob.hp).toBe(mobBaseStats.hp);
  });

  it('Hromový thorns reflect is capped at 25% of player max HP and respects cooldown', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer', createDefaultMetaProgression());
    const enemy = engine.createHeadlessEnemy('rarach', 100, 100, 1.0, false, false, undefined, 'hromovy');
    enemy.hp = 500;
    enemy.maxHp = 500;
    const player = {
      x: 150,
      y: 100,
      hp: 200,
      maxHp: 200,
      takeDamage: vi.fn(),
    } as any;
    engine.state.player = player;
    engine.state.gameTime = 10.0;

    // Deal 180 damage (raw 50% reflect would be 90, but cap is 25% of 200 = 50)
    enemy.takeDamage(180, 'physical', 0, 0);
    expect(player.takeDamage).toHaveBeenCalledWith(50, 'lightning', enemy, false);

    // Hit again immediately at the exact same game time (should be blocked by 0.25s cooldown)
    player.takeDamage.mockClear();
    enemy.takeDamage(50, 'physical', 0, 0);
    expect(player.takeDamage).not.toHaveBeenCalled();

    // After 0.3s cooldown expires, reflect triggers again
    engine.state.gameTime = 10.35;
    enemy.takeDamage(50, 'physical', 0, 0);
    expect(player.takeDamage).toHaveBeenCalledWith(25, 'lightning', enemy, false);
  });

  it('Formation leaders receive combat prefixes on dynamicDifficulty >= 3.5', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;
    director.threatBudget = 40;

    const initialCount = engine.livingEnemies.length;
    (director as any).spawnKlestoveSevreni(engine, engine.state.player, 60.0);

    const newlySpawned = engine.livingEnemies.slice(initialCount);
    expect(newlySpawned.length).toBeGreaterThan(0);
    // At least one leader enemy in the formation must possess a combat prefix
    const prefixedLeader = newlySpawned.find((e: any) => e.prefix && e.prefix !== 'vycerpany');
    expect(prefixedLeader).toBeDefined();
    expect(['vichricovy', 'hromovy', 'kamenny', 'pekelny']).toContain(prefixedLeader.prefix);
  });

  it('getThematicPrefix selects valid combat prefixes with probability affinity', () => {
    const winterDirector = new RunDirector(1, undefined, { dynamicDifficulty: 4.0 });
    const p = winterDirector.getThematicPrefix();
    expect(['vichricovy', 'hromovy', 'kamenny', 'pekelny']).toContain(p);

    const rolls: Record<string, number> = { vichricovy: 0, hromovy: 0, kamenny: 0, pekelny: 0 };
    for (let i = 0; i < 100; i++) {
      rolls[winterDirector.getThematicPrefix()]++;
    }
    // All 4 prefixes should be reachable due to minimum 15% floor
    expect(rolls.vichricovy).toBeGreaterThan(0);
    expect(rolls.kamenny).toBeGreaterThan(0);
    expect(rolls.pekelny).toBeGreaterThan(0);
    expect(rolls.hromovy).toBeGreaterThan(0);
  });
});
