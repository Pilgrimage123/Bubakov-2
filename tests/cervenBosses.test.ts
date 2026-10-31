import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { GAME_LEVELS } from '../src/data/levels';
import { GameEngine } from '../src/game/engine';

describe('Level 7 Bosses: Královský Vele-rak, Pekelný čert sekáč, Královská Polednice', () => {
  it('schedules all three bosses in the 300-second timeline of Stage 7', () => {
    const lvl6 = GAME_LEVELS[6];
    expect(lvl6).toBeDefined();

    // Miniboss at 85 s
    expect(lvl6.miniBoss.id).toBe('kralovsky_vele_rak');
    expect(lvl6.miniBoss.time).toBe(85);
    expect(lvl6.miniBoss.name).toContain('Královský Vele-rak');

    // Midboss at 185 s
    expect(lvl6.midBoss.id).toBe('cert_sekac');
    expect(lvl6.midBoss.time).toBe(185);
    expect(lvl6.midBoss.name).toContain('Pekelný čert sekáč');

    // Final Boss at 300 s
    expect(lvl6.finalBoss.id).toBe('kralovska_polednice');
    expect(lvl6.finalBoss.time).toBe(300);
    expect(lvl6.finalBoss.name).toContain('Královská Polednice');
  });

  it('registers all three bosses in ENEMIES and ENEMY_POINTS with scaled stats', () => {
    expect(ENEMIES.kralovsky_vele_rak.hp).toBeGreaterThanOrEqual(1800);
    expect(ENEMIES.cert_sekac.hp).toBeGreaterThanOrEqual(3000);
    expect(ENEMIES.kralovska_polednice.hp).toBeGreaterThanOrEqual(5000);

    expect(ENEMY_POINTS.kralovsky_vele_rak).toBeGreaterThanOrEqual(1000);
    expect(ENEMY_POINTS.cert_sekac).toBeGreaterThanOrEqual(600);
    expect(ENEMY_POINTS.kralovska_polednice).toBeGreaterThanOrEqual(7000);
  });

  it('Královský Vele-rak executes water jet projectiles, speed charges, and drops a miniboss chest', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer');

    const boss = engine.spawnMonster('kralovsky_vele_rak', 200, 200, 1.0, true, true);
    expect(boss).toBeDefined();
    expect(boss.isMiniboss).toBe(true);

    // Force attack cooldowns
    boss.waterJetCooldown = 0;
    boss.chargeCooldown = 0;
    engine.update(0.1);

    const waterProjectiles = engine.state.projectiles.filter((p: any) => p.type === 'water');
    expect(waterProjectiles.length).toBeGreaterThanOrEqual(3);

    // Defeat miniboss and verify chest drop
    boss.hp = 0;
    boss.takeDamage(100, 'physical');
    const chests = engine.state.drops.filter((d: any) => d.type === 'chest');
    expect(chests.length).toBeGreaterThan(0);
  });

  it('Pekelný čert sekáč executes scythe cleave, fire hazard patches, and drops a midboss chest', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer');

    const boss = engine.spawnMonster('cert_sekac', 160, 160, 1.0, true, true);
    expect(boss).toBeDefined();
    expect(boss.isMiniboss).toBe(true);

    // Fire trail hazard
    boss.fireTrailCooldown = 0;
    engine.update(0.1);

    const fireHazards = engine.director?.hazards.filter((h: any) => h.type === 'fire');
    expect(fireHazards.length).toBeGreaterThan(0);

    // Close-range scythe cleave (within 95 scythe reach, outside 76 miniboss collision reach)
    engine.state.player!.weapons = [];
    engine.state.slashes = [];
    boss.x = engine.state.player!.x + 85;
    boss.y = engine.state.player!.y;
    boss.stunTimer = 0;
    boss.scytheCleaveCooldown = 0;
    const initialPlayerHp = engine.state.player!.hp;
    engine.update(0.1);
    expect(engine.state.player!.hp).toBeLessThan(initialPlayerHp);

    // Defeat midboss and verify chest drop
    boss.hp = 0;
    boss.takeDamage(100, 'holy');
    const chests = engine.state.drops.filter((d: any) => d.type === 'chest');
    expect(chests.length).toBeGreaterThan(0);
  });

  it('Královská Polednice executes heat rings, phase 2 lightning strikes, and triggers level victory', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer');

    const boss = engine.spawnMonster('kralovska_polednice', 150, 150, 1.0, true, false);
    expect(boss).toBeDefined();
    expect(boss.isBoss).toBe(true);

    // Heat pulse hazard
    boss.heatPulseCooldown = 0;
    engine.update(0.1);

    const heatHazards = engine.director?.hazards.filter((h: any) => h.kind === 'heat-ring');
    expect(heatHazards.length).toBeGreaterThan(0);

    // Phase 2 (< 60% HP): Lightning strike hazard
    boss.hp = boss.maxHp * 0.4;
    boss.lightningCooldown = 0;
    engine.update(0.1);

    const lightningHazards = engine.director?.hazards.filter((h: any) => h.kind === 'lightning-strike');
    expect(lightningHazards.length).toBeGreaterThan(0);

    // Defeating final boss triggers victory and cleans up hazards
    boss.hp = 0;
    boss.takeDamage(500, 'holy');
    expect(engine.state.levelVictoryTriggered).toBe(true);

    const chests = engine.state.drops.filter((d: any) => d.type === 'chest');
    expect(chests.length).toBeGreaterThan(0);
  });
});
