import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { RunDirector } from '../src/game/director';
import { ENEMIES, BUBAK_THREAT_COSTS } from '../src/data/enemies';
import { WEAPONS, SPECIAL_WEAPONS } from '../src/data/weapons';
import { Lada, drawEnemyRenderer } from '../src/render/ladaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMY_POINTS, getCurrentDayPhase } from '../src/constants';

describe('Zakletá princezna & Královské věno (ADR 0052)', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 52, spawnInitialWave: false });
    director = engine.director!;
  });

  it('defines Zakletá princezna in ENEMIES catalog with canonical boss attributes', () => {
    const princezna = ENEMIES.zakleta_princezna;
    expect(princezna).toBeDefined();
    expect(princezna.name).toBe('Zakletá princezna');
    expect(princezna.category).toBe('bosses');
    expect(princezna.method).toBe('drawZakletaPrincezna');
    expect(princezna.isBoss).toBe(true);
    expect(princezna.isMiniboss).toBe(true);
    expect(princezna.danger).toBe('★★★★★');
    expect(BUBAK_THREAT_COSTS.zakleta_princezna).toBe(18);
    expect(ENEMY_POINTS.zakleta_princezna).toBe(2000);
  });

  it('drawZakletaPrincezna is registered on Lada and renders on canvas across all 3 night stages without throwing', () => {
    expect(typeof (Lada as any).drawZakletaPrincezna).toBe('function');
    const ctx = createMockCanvasContext();

    for (let night = 1; night <= 3; night++) {
      expect(() => {
        drawEnemyRenderer(
          'drawZakletaPrincezna',
          ctx,
          250,
          250,
          night * 20,
          1,
          false,
          {
            id: 'zakleta_princezna',
            nightStage: night,
            waltzAngle: 1.5,
            survivalTimer: night * 20,
          }
        );
      }).not.toThrow();
    }
  });

  it('failing Bubácká díra spawns Zakletá princezna ONLY during night phases with 2.0x stage boss Kuráž scaling', () => {
    // 1. Day Phase test (Noon): Princess cannot spawn!
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1; // within anomaly window
    // Level 0 or early day:
    const dayLevelDirector = new RunDirector(0, 52); // Level 0 has only Day phases
    dayLevelDirector.update(0.1, engine);
    const dayDira = dayLevelDirector.bubackaDira!;
    expect(dayDira).toBeDefined();

    dayLevelDirector.update(15.2, engine);
    expect(dayDira.isFailed).toBe(true);
    // Princess must NOT spawn during day
    const dayPrincess = engine.state.enemies.find((e) => e.id === 'zakleta_princezna');
    expect(dayPrincess).toBeUndefined();

    // 2. Night Phase test (Midnight): Princess spawns with forceZakletaPrincezna
    const nightEngine = new GameEngine();
    nightEngine.initRun({ levelId: 1, seed: 52, spawnInitialWave: false });
    const nightDirector = nightEngine.director!;
    nightDirector.rozmar.anomalyWindow = [200, 240];
    nightEngine.state.gameTime = 220; // Night phase in Stage 1
    const phase = getCurrentDayPhase(220, 1);
    expect(phase.id === 'night' || phase.id === 'midnight').toBe(true);

    nightDirector.update(0.1, nightEngine);
    const nightDira = nightDirector.bubackaDira!;
    expect(nightDira).toBeDefined();
    nightDira.forceZakletaPrincezna = true;

    nightDirector.update(15.2, nightEngine);
    expect(nightDira.isFailed).toBe(true);

    const princezna = nightEngine.state.enemies.find((e) => e.id === 'zakleta_princezna');
    expect(princezna).toBeDefined();

    // Verify 2.0x boss scaling
    const curLvl = GAME_LEVELS[1];
    const finalBossId = curLvl.finalBoss?.id || (curLvl.bosses && curLvl.bosses[curLvl.bosses.length - 1]?.id);
    const baseBoss = ENEMIES[finalBossId!];
    const expectedHp = Math.round((baseBoss?.hp || 2500) * 2.0);

    expect(princezna.maxHp).toBe(expectedHp);
    expect(princezna.hp).toBe(expectedHp);
    expect(princezna.speed).toBe(125);
  });

  it('sets up cemetery fence arena, clamps within bounds, pauses waves and punishes crossing', () => {
    const princezna = engine.spawnMonster('zakleta_princezna', 0, 0, 1.45, true, true);
    engine.state.zakletaPrinceznaArena = {
      x: 0,
      y: 0,
      radius: 450,
      active: true,
      nightStage: 1,
      timer: 0,
    };
    director.isZakletaPrinceznaDuelActive = true;

    // Player attempts to walk outside arena
    const player = engine.state.player;
    player.weapons = [];
    player.invulnerabilityTimer = 0;
    player.dodgeCooldown = 999;
    player.dodgeChance = 0;
    player.x = 510; // Outside 450px radius
    player.y = 0;
    const initialHp = player.hp;

    engine.update(0.016);
    // Player clamped back inside and received 5 cold damage
    const distFromCenter = Math.hypot(player.x, player.y);
    expect(distFromCenter).toBeLessThanOrEqual(450);
    expect(player.hp).toBe(initialHp - 5);
  });

  it('regenerates 1% max Kuráž every second', () => {
    const princezna = engine.spawnMonster('zakleta_princezna', 0, 0, 1.45, true, true);
    princezna.maxHp = 5000;
    princezna.hp = 4000; // missing 1000 Kuráž

    princezna.update(1.0, engine.state.player);
    // Regenerated 1% of 5000 = +50 Kuráž
    expect(princezna.hp).toBeCloseTo(4050, 0);
  });

  it('pearl projectiles bounce off the cemetery fence arena perimeter', () => {
    engine.state.zakletaPrinceznaArena = {
      x: 1500,
      y: 1500,
      radius: 450,
      active: true,
      nightStage: 1,
      timer: 0,
    };

    const pearl = {
      x: 1500 + 442,
      y: 1500,
      vx: 260,
      vy: 0,
      angle: 0,
      radius: 10,
      life: 4.0,
      maxLife: 4.0,
      type: 'magic',
      visual: 'perla',
      isEnemy: true,
      isBouncingPearl: true,
      bounces: 0,
      dead: false,
    };
    engine.state.projectiles.push(pearl as any);

    engine.update(0.016);
    // Reflected inward: vx becomes negative, bounces incremented
    expect(pearl.vx).toBeLessThan(0);
    expect(pearl.bounces).toBe(1);
    expect(pearl.dead).toBe(false);
  });

  it('homing royal handkerchief hit applies 3s Social Faux Pas inverted control debuff', () => {
    const player = engine.state.player;
    player.x = 100;
    player.y = 100;
    player.fauxPasTimer = 0;

    const handkerchief = {
      x: player.x,
      y: player.y,
      vx: 0,
      vy: 0,
      radius: 14,
      type: 'magic',
      visual: 'kapesnicek',
      isEnemy: true,
      isHomingHandkerchief: true,
      dead: false,
    };
    engine.state.projectiles.push(handkerchief as any);

    engine.update(0.016);
    expect(handkerchief.dead).toBe(true);
    expect(player.fauxPasTimer).toBeCloseTo(3.0, 1);

    // Verify inverted movement controls
    engine.state.keys['KeyW'] = true; // Press W (normal: my = -1, moveVy < 0)
    engine.update(0.016);
    // Inverted: moveVy must be positive (> 0)
    expect(player.vy).toBeGreaterThan(0);
  });

  it('completes duel through 3 nights (20s, 40s, 60s) and awards Royal Dowry chest with 200 kr., full heal and Pearl Necklace', () => {
    const princezna = engine.spawnMonster('zakleta_princezna', 0, 0, 1.45, true, true);
    engine.state.zakletaPrinceznaArena = {
      x: 0,
      y: 0,
      radius: 450,
      active: true,
      nightStage: 1,
      timer: 0,
    };
    director.isZakletaPrinceznaDuelActive = true;

    const player = engine.state.player;
    player.hp = 50; // low Kuráž before victory
    const initialCoins = engine.state.coins || 0;

    // Stage 1 (0-20s)
    princezna.survivalTimer = 10;
    princezna.update(0.1, player);
    expect(princezna.nightStage).toBe(1);

    // Stage 2 (20-40s) - First Cockcrow
    princezna.survivalTimer = 25;
    princezna.update(0.1, player);
    expect(princezna.nightStage).toBe(2);

    // Stage 3 (40-60s) - Second Cockcrow
    princezna.survivalTimer = 45;
    princezna.update(0.1, player);
    expect(princezna.nightStage).toBe(3);

    // Victory at 60s - Third Cockcrow & Full Uncursing
    princezna.survivalTimer = 60.1;
    princezna.update(0.1, player);
    expect(princezna.isDefeated).toBe(true);
    expect(princezna.dead).toBe(true);
    expect(director.isZakletaPrinceznaDuelActive).toBe(false);
    expect(engine.state.zakletaPrinceznaArena).toBeNull();

    // Reward verification
    expect(player.hp).toBe(player.maxHp); // Full Kuráž healed
    expect(engine.state.coins).toBe(initialCoins + 200); // 200 kr. from royal dowry

    const dowryChest = engine.state.drops.find((d: any) => d.rewardWeapon === 'perlovy_nahrdelnik');
    expect(dowryChest).toBeDefined();
    expect((dowryChest as any).text).toBe('KRÁLOVSKÉ VĚNO 👑');
  });

  it('Perlový náhrdelník zakleté panny is registered in SPECIAL_WEAPONS and fires 12 bouncing pearls', () => {
    const nahrdelnikDef = (WEAPONS as any).perlovy_nahrdelnik;
    expect(nahrdelnikDef).toBeDefined();
    expect(nahrdelnikDef.id).toBe('perlovy_nahrdelnik');
    expect(SPECIAL_WEAPONS.perlovy_nahrdelnik).toBeDefined();

    const player = engine.state.player;
    player.weapons = [];
    player.x = 200;
    player.y = 200;

    const projsBefore = engine.state.projectiles.length;
    nahrdelnikDef.fire(player, 1);
    const projsAfter = engine.state.projectiles.length;
    expect(projsAfter - projsBefore).toBe(12);

    for (let i = projsBefore; i < projsAfter; i++) {
      const p = engine.state.projectiles[i];
      expect(p.visual).toBe('perla');
      expect(p.isBouncingPearl).toBe(true);
      expect(p.type).toBe('magic');
    }
  });

  it('moves gracefully toward player with ethereal waltz glide at ~125 px/s', () => {
    const princezna = engine.spawnMonster('zakleta_princezna', 0, 0, 1.45, true, true);
    const player = engine.state.player;
    player.x = 200;
    player.y = 0;

    princezna.update(0.1, player);
    const speed = Math.hypot(princezna.vx, princezna.vy);
    expect(speed).toBeGreaterThan(100);
    expect(princezna.vx).toBeGreaterThan(0); // Moves towards positive X (player is at x=200)
    expect(princezna.facing).toBe(1);
  });

  it('homing royal handkerchief continuously curves toward player position', () => {
    const player = engine.state.player;
    player.x = 200;
    player.y = 200;

    // Handkerchief initialized pointing right (vx > 0, vy = 0)
    const handkerchief = {
      x: 100,
      y: 100,
      vx: 150,
      vy: 0,
      angle: 0,
      speed: 150,
      radius: 14,
      type: 'magic',
      visual: 'kapesnicek',
      isEnemy: true,
      isHomingHandkerchief: true,
      dead: false,
      life: 4.5,
    };
    engine.state.projectiles.push(handkerchief as any);

    // After updating, angle should have steered downwards (vy > 0) towards player at (200, 200)
    engine.update(0.1);
    expect(handkerchief.vy).toBeGreaterThan(0);
  });
});
