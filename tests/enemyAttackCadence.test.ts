import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';

describe('Enemy Attack Cadence, Windup & Recovery System (Kadence útoku, Nápřah a Zotavení bubáků)', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({
      levelId: 1,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
    // Set player at (0, 0) with generous HP
    engine.state.player.x = 0;
    engine.state.player.y = 0;
    engine.state.player.hp = 1000;
    engine.state.player.maxHp = 1000;
    // Clear any weapons so automatic attacks don't kill test enemies
    engine.state.player.weapons = [];
  });

  it('pomalý bubák (Obr, kadence 1.8s) provede nápřah, dopad v čase 1.8s a vstoupí do zotavení 0.25s', () => {
    // Spawn Obr (slow cadence, 1.8s attackDelay) in attack range (e.g., 25px away)
    const enemy = engine.spawnMonster('obr', 25, 0);
    expect(enemy.attackCadence).toBe('slow');
    expect(enemy.attackDelay).toBe(1.8);

    // Initial state: not attacking
    expect(enemy.isAttacking).toBeFalsy();
    expect(enemy.windupTimer).toBe(0);

    // Step 0.1s: should start windup (nápřah) and fix attackAngle towards player (0,0) from (25,0) => Math.abs(angle) ~ Math.PI
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);
    expect(Math.abs(enemy.attackAngle!)).toBeCloseTo(Math.PI, 2);
    expect(enemy.windupTimer).toBeCloseTo(0.1, 2);
    expect(engine.state.player.hp).toBe(1000); // No damage yet during nápřah

    // Advance to 1.7s (still in nápřah)
    for (let i = 0; i < 16; i++) {
      engine.update(0.1);
    }
    expect(enemy.isAttacking).toBe(true);
    expect(engine.state.player.hp).toBe(1000); // Still winding up!

    // Advance past 1.8s (dopad!)
    engine.update(0.1);
    // Player should now have taken damage!
    expect(engine.state.player.hp).toBeLessThan(1000);
    // Windup finished, recovery (zotavení) started
    expect(enemy.windupTimer).toBe(0);
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.recoveryTimer).toBeCloseTo(0.25, 2);

    // During recovery (next 0.15s), should NOT restart windup
    const hpAfterFirstHit = engine.state.player.hp;
    engine.update(0.15);
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.recoveryTimer).toBeGreaterThan(0);
    expect(engine.state.player.hp).toBe(hpAfterFirstHit);

    // Once recovery expires and enemy reaches attack range again, new windup starts
    for (let i = 0; i < 6; i++) {
      engine.update(0.1);
    }
    expect(enemy.isAttacking).toBe(true);
  });

  it('normální bubák (Čertík, kadence 1.2s) udeří při dopadu v 1.2s a vstoupí do zotavení 0.20s', () => {
    const enemy = engine.spawnMonster('certik', 20, 0);
    expect(enemy.attackCadence).toBe('normal');
    expect(enemy.attackDelay).toBe(1.2);

    // Step to start nápřah
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);
    expect(Math.abs(enemy.attackAngle!)).toBeCloseTo(Math.PI, 2);

    // Advance to 1.1s
    for (let i = 0; i < 10; i++) {
      engine.update(0.1);
    }
    expect(engine.state.player.hp).toBe(1000);

    // Dopad v 1.2s
    engine.update(0.1);
    expect(engine.state.player.hp).toBeLessThan(1000);
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.recoveryTimer).toBeCloseTo(0.2, 2);
  });

  it('rychlý bubák (Rarášek, kadence 0.6s) bleskově udeří v 0.6s a vstoupí do zotavení 0.15s', () => {
    const enemy = engine.spawnMonster('rarach', 18, 0);
    expect(enemy.attackCadence).toBe('fast');
    expect(enemy.attackDelay).toBe(0.6);

    // Step to start nápřah
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);

    // Advance to 0.5s
    for (let i = 0; i < 4; i++) {
      engine.update(0.1);
    }
    expect(engine.state.player.hp).toBe(1000);

    // Dopad v 0.6s
    engine.update(0.1);
    expect(engine.state.player.hp).toBeLessThan(1000);
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.recoveryTimer).toBeCloseTo(0.15, 2);
  });

  it('včasný úskok lovce mimo dosah úderu způsobí vyprázdnění úderu do země bez poškození (User Story 14)', () => {
    // Spawn slow enemy
    const enemy = engine.spawnMonster('obr', 30, 0);
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);

    // Hunter steps away far out of range (dodge!)
    engine.state.player.x = 500;
    engine.state.player.y = 500;

    // Advance until attack completes (1.8s)
    for (let i = 0; i < 18; i++) {
      engine.update(0.1);
    }

    // Úder udeřil do země, lovec mimo dosah => 0 zranění
    expect(engine.state.player.hp).toBe(1000);
    // Bubák přesto vstoupí do zotavení
    expect(enemy.recoveryTimer).toBeGreaterThan(0);
  });

  it('směrový úskok za záda bubáka během nápřahu mine lovce i při těsné vzdálenosti (User Story 14)', () => {
    // Spawn enemy at (30, 0), player is at (0, 0)
    const enemy = engine.spawnMonster('obr', 30, 0);
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);
    // Locked attack angle is towards (0, 0), i.e. Math.PI (leftwards)
    expect(Math.abs(enemy.attackAngle!)).toBeCloseTo(Math.PI, 2);

    // Hunter dashes behind the enemy to (60, 0) - distance to enemy is 30px (within radius), but angle is opposite (0 rad)!
    engine.state.player.x = 60;
    engine.state.player.y = 0;

    // Advance until attack hits in time 1.8s
    for (let i = 0; i < 18; i++) {
      engine.update(0.1);
    }

    // Enemy struck forward to the left, hunter was safely behind => 0 damage!
    expect(engine.state.player.hp).toBe(1000);
    expect(enemy.recoveryTimer).toBeGreaterThan(0);
  });

  it('odhození zbraní přeruší běžící nápřah bubáka a vrátí ho do neutrálu (User Story 15)', () => {
    const enemy = engine.spawnMonster('obr', 25, 0);
    engine.update(0.1);
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);
    expect(enemy.windupTimer).toBeGreaterThan(0);

    // Hit with strong knockback (e.g. Osikový prut)
    enemy.takeDamage(10, 'physical', -100, 0);

    // Nápřah byl přerušen a vynulován
    expect(enemy.isAttacking).toBe(false);
    expect(enemy.windupTimer).toBe(0);
  });

  it('omráčení zbraní přeruší běžící nápřah bubáka (User Story 15)', () => {
    const enemy = engine.spawnMonster('drevorubec', 25, 0);
    engine.update(0.1);
    engine.update(0.1);
    expect(enemy.isAttacking).toBe(true);

    // Hit with stun (e.g. Válečnice)
    enemy.takeDamage(10, 'physical', 0, 0, { stunDuration: 1.5 });

    expect(enemy.isAttacking).toBe(false);
    expect(enemy.windupTimer).toBe(0);
    expect(enemy.stunTimer).toBeGreaterThan(0);
  });
});
