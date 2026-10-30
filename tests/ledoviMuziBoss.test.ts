import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { GAME_LEVELS } from '../src/data/levels';
import { GameEngine } from '../src/game/engine';

describe('Level 5 Final Boss: Ledoví muži (Pankrác, Servác a Bonifác)', () => {
  it('is scheduled as the 300-second climax boss for Stage 5 (Květen v Hrusicích)', () => {
    const lvl4 = GAME_LEVELS[4];
    expect(lvl4).toBeDefined();
    expect(lvl4.finalBoss).toBeDefined();
    expect(lvl4.finalBoss.id).toBe('ledovi_muzi');
    expect(lvl4.finalBoss.time).toBe(300);
    expect(lvl4.finalBoss.name.toLowerCase()).toContain('ledoví muži');
    expect(lvl4.finalBoss.warning.toLowerCase()).toContain('ledoví muži');
  });

  it('registers ledovi_muzi in ENEMIES and ENEMY_POINTS with trio boss stats', () => {
    const boss = ENEMIES.ledovi_muzi;
    expect(boss).toBeDefined();
    expect(boss.id).toBe('ledovi_muzi');
    expect(boss.category).toBe('bosses');
    expect(boss.method).toBe('drawLedoviMuzi');
    expect(boss.hp).toBeGreaterThanOrEqual(1400);
    expect(ENEMY_POINTS.ledovi_muzi).toBeGreaterThan(4000);
  });

  it('spawns a synchronized triad consisting of Pankrác, Servác, and Bonifác', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const leader = engine.spawnMonster('ledovi_muzi', 200, 200, 1.0, true);
    expect(leader).toBeDefined();

    const trio = engine.state.enemies.filter((e: any) => e.id === 'ledovi_muzi' && e.isTrioMember);
    expect(trio.length).toBe(3);

    const roles = trio.map((m: any) => m.trioRole).sort();
    expect(roles).toEqual(['bonifac', 'pankrac', 'servac']);

    for (const member of trio) {
      expect(member.isBoss).toBe(true);
      expect(member.customBossTitle).toBeDefined();
    }
  });

  it('executes triad orbit and drops frost-trail ground decals', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    engine.spawnMonster('ledovi_muzi', 200, 200, 1.0, true);

    // Update several frames
    for (let i = 0; i < 8; i++) {
      engine.update(0.1);
    }

    const trio = engine.state.enemies.filter((e: any) => e.id === 'ledovi_muzi');
    for (const m of trio) {
      expect(Math.hypot(m.vx, m.vy)).toBeGreaterThan(0);
    }

    const frostTrails = engine.director?.hazards.filter((h: any) => h.kind === 'frost-trail');
    expect(frostTrails.length).toBeGreaterThan(0);
  });

  it('Pankrác fires icicle projectiles and Servác summons hailstone AoE circles', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    engine.spawnMonster('ledovi_muzi', 200, 200, 1.0, true);

    const pankrac = engine.state.enemies.find((e: any) => e.trioRole === 'pankrac');
    const servac = engine.state.enemies.find((e: any) => e.trioRole === 'servac');
    expect(pankrac).toBeDefined();
    expect(servac).toBeDefined();

    // Trigger attacks by forcing cooldown expiration
    pankrac.icicleCooldown = 0;
    servac.hailCooldown = 0;

    engine.update(0.1);

    // Verify Pankrác icicles
    const icicles = engine.state.projectiles.filter((p: any) => p.visual === 'icicle');
    expect(icicles.length).toBe(5);

    // Verify Servác hail circles
    const hailCircles = engine.director?.hazards.filter((h: any) => h.kind === 'hail-circle');
    expect(hailCircles.length).toBeGreaterThan(0);
  });

  it('Bonifác encases drops in ice, dealing contact damage, and thawing via player attack', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');
    engine.state.player!.x = -500;
    engine.state.player!.y = -500;

    // Spawn a drop near player
    const drop = engine.spawnDrop('coin', 50, 50, { value: 5 });
    expect(drop).toBeDefined();
    expect(drop?.isFrozen).toBeFalsy();

    engine.spawnMonster('ledovi_muzi', 100, 100, 1.0, true);
    const bonifac = engine.state.enemies.find((e: any) => e.trioRole === 'bonifac');
    expect(bonifac).toBeDefined();

    // Trigger Bonifác freeze pulse
    bonifac.freezePulseCooldown = 0;
    engine.update(0.1);

    expect(drop?.isFrozen).toBe(true);

    // Stepping on frozen drop deals damage to player instead of collecting
    const initialPlayerHp = engine.state.player!.hp;
    engine.state.player!.x = 50;
    engine.state.player!.y = 50;

    engine.update(0.1);

    expect(drop?.isFrozen).toBe(true);
    expect(drop?.dead).toBeFalsy();
    expect(engine.state.player!.hp).toBeLessThan(initialPlayerHp);

    // Player weapon slash thaws the frozen drop
    engine.state.slashes.push({
      x: 50,
      y: 50,
      reach: 60,
      arc: Math.PI * 2,
      angle: 0,
      life: 0.2,
      time: 0,
      hitList: [],
    });

    engine.update(0.05);

    expect(drop?.isFrozen).toBe(false);
  });

  it('requires defeat of all three brothers to trigger level victory and reward chest', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 4,
      hunterType: 'wanderer',
      meta: { highestLevelUnlocked: 4, completedLevels: {} } as any,
    });

    engine.spawnMonster('ledovi_muzi', 200, 200, 1.0, true);
    const trio = engine.state.enemies.filter((e: any) => e.id === 'ledovi_muzi');
    expect(trio.length).toBe(3);

    // Defeat first brother
    trio[0].takeDamage(20000, 'physical');
    expect(trio[0].isDefeated).toBe(true);
    expect(engine.state.levelVictoryTriggered).toBeFalsy();

    // Defeat second brother
    trio[1].takeDamage(20000, 'physical');
    expect(trio[1].isDefeated).toBe(true);
    expect(engine.state.levelVictoryTriggered).toBeFalsy();

    // Defeat third and final brother
    trio[2].takeDamage(20000, 'physical');
    expect(trio[2].isDefeated).toBe(true);
    expect(engine.state.levelVictoryTriggered).toBe(true);

    // Verify chest dropped
    const chests = engine.state.drops.filter((d: any) => d.type === 'chest');
    expect(chests.length).toBeGreaterThan(0);

    // Verify Level 5 unlocked
    expect(engine.state.meta?.highestLevelUnlocked).toBeGreaterThanOrEqual(5);
    expect(engine.state.meta?.completedLevels?.[4]).toBe(true);
  });
});
