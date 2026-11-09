import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { RunDirector } from '../src/game/director';
import { ENEMIES } from '../src/data/enemies';
import { WEAPONS } from '../src/data/weapons';
import { Lada, drawEnemyRenderer } from '../src/render/ladaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';
import { GAME_LEVELS } from '../src/data/levels';

describe('Čertova babička & Babiččin bezedný pekáč (ADR 0051)', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 51, spawnInitialWave: false });
    director = engine.director!;
  });

  it('defines Čertova babička in ENEMIES catalog with canonical boss attributes', () => {
    const babicka = ENEMIES.certova_babicka;
    expect(babicka).toBeDefined();
    expect(babicka.name).toBe('Čertova babička');
    expect(babicka.category).toBe('bosses');
    expect(babicka.method).toBe('drawCertovaBabicka');
    expect(babicka.isBoss).toBe(true);
    expect(babicka.isMiniboss).toBe(true);
  });

  it('drawCertovaBabicka is registered on Lada and renders on canvas across all 4 fury stages without throwing', () => {
    expect(typeof (Lada as any).drawCertovaBabicka).toBe('function');
    const ctx = createMockCanvasContext();

    for (let stage = 1; stage <= 4; stage++) {
      expect(() => {
        drawEnemyRenderer(
          'drawCertovaBabicka',
          ctx,
          250,
          250,
          stage * 15,
          -1,
          false,
          {
            id: 'certova_babicka',
            renderScale: 1.35 + (stage - 1) * 0.35,
            furyStage: stage,
            hp: 6000,
            maxHp: 8500,
            pekaceShieldActive: stage >= 3,
            orbitAngle: 1.2,
            grandpaBush: { active: stage >= 3, x: 150, y: 150, giftType: 'plums' },
            windupTimer: 0.4,
            isAttacking: true,
          }
        );
      }).not.toThrow();
    }
  });

  it('failing Bubácká díra can spawn Čertova babička with 3.5x stage boss Kuráž scaling', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    expect(dira).toBeDefined();
    dira.forceCertovaBabicka = true; // Force 5% rare outcome for test verification

    // Fail ritual
    director.update(15.2, engine);
    expect(dira.isFailed).toBe(true);

    const babicka = engine.state.enemies.find((e) => e.id === 'certova_babicka');
    expect(babicka).toBeDefined();

    // Verify 3.5x stats scaling based on stage final boss
    const curLvl = GAME_LEVELS[engine.state.activeLevelId || 1];
    const finalBossId = curLvl.finalBoss?.id || (curLvl.bosses && curLvl.bosses[curLvl.bosses.length - 1]?.id);
    const baseBoss = ENEMIES[finalBossId];
    const expectedHp = Math.round((baseBoss?.hp || 2500) * 3.5);

    expect(babicka.maxHp).toBe(expectedHp);
    expect(babicka.hp).toBe(expectedHp);
    expect(babicka.renderScale).toBeCloseTo(1.35, 1);
  });

  it('sets up flour & coal arena, clamps within bounds, pauses waves and punishes crossing', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    dira.forceCertovaBabicka = true;
    director.update(15.2, engine);

    // Arena is created and clamped
    const arena = engine.state.certovaBabickaArena;
    expect(arena).toBeDefined();
    expect(arena.active).toBe(true);
    expect(arena.radius).toBe(450);
    expect(director.isCertovaBabickaDuelActive).toBe(true);

    // Player attempts to walk outside arena
    const player = engine.state.player;
    player.weapons = [];
    player.invulnerabilityTimer = 0;
    player.dodgeCooldown = 999;
    player.dodgeChance = 0;
    player.x = arena.x + arena.radius + 60;
    player.y = arena.y;
    const initialHp = player.hp;

    engine.update(0.016);
    // Player clamped back inside and received 5 fire damage
    const distFromCenter = Math.hypot(player.x - arena.x, player.y - arena.y);
    expect(distFromCenter).toBeLessThanOrEqual(arena.radius);
    expect(player.hp).toBe(initialHp - 5);
  });

  it('progresses through 4 fury stages and scales up from 1.35x to 2.45x', () => {
    const babicka = engine.spawnMonster('certova_babicka', 0, 0, 1.35, true, true);
    babicka.survivalTimer = 0;
    babicka.furyStage = 1;

    // Stage 1 (0-15s)
    babicka.update(0.1, engine.state.player);
    expect(babicka.furyStage).toBe(1);
    expect(babicka.renderScale).toBeCloseTo(1.35, 1);

    // Stage 2 (15-30s)
    babicka.survivalTimer = 16.0;
    babicka.update(0.1, engine.state.player);
    expect(babicka.furyStage).toBe(2);
    expect(babicka.renderScale).toBeCloseTo(1.70, 1);

    // Stage 3 (30-45s) -> boot explodes, pekace shield activated
    babicka.survivalTimer = 31.0;
    babicka.update(0.1, engine.state.player);
    expect(babicka.furyStage).toBe(3);
    expect(babicka.renderScale).toBeCloseTo(2.05, 1);
    expect(babicka.pekaceShieldActive).toBe(true);

    // Stage 4 (45-60s) -> full apocalypse scale 2.45x
    babicka.survivalTimer = 46.0;
    babicka.update(0.1, engine.state.player);
    expect(babicka.furyStage).toBe(4);
    expect(babicka.renderScale).toBeCloseTo(2.45, 1);
  });

  it('deflects player projectiles hitting rotating cast-iron pans shield in Phase 2', () => {
    const babicka = engine.spawnMonster('certova_babicka', 200, 200, 2.05, true, true);
    babicka.furyStage = 3;
    babicka.pekaceShieldActive = true;
    babicka.orbitAngle = 0;

    // Pan 0 is at x: 200 + 85 * (2.05/1.35), y: 200
    const panDist = 85 * (2.05 / 1.35);
    const panX = 200 + panDist;
    const panY = 200;

    const babickaInitialHp = babicka.hp;

    // Spawn player projectile directly towards the pan
    const proj = {
      x: panX,
      y: panY,
      vx: 10,
      vy: 0,
      radius: 10,
      dmg: 150,
      type: 'physical',
      isEnemy: false,
      hitList: [],
      dead: false,
      life: 2.0,
    };
    engine.state.projectiles.push(proj);

    engine.update(0.016);

    expect(proj.dead).toBe(true); // Projectile was deflected
    expect(babicka.hp).toBe(babickaInitialHp); // Babicka took no damage!
  });

  it('slows down movement while winding up rolling pin charge', () => {
    const babicka = engine.spawnMonster('certova_babicka', 0, 0, 1.35, true, true);
    const player = engine.state.player;
    player.x = 200;
    player.y = 0;

    // Normal movement speed
    babicka.windupTimer = 0;
    babicka.update(0.016, player);
    const normalVx = babicka.vx;
    expect(normalVx).toBeGreaterThan(50);

    // Windup movement speed is planted/reduced
    babicka.windupTimer = 0.5;
    babicka.update(0.016, player);
    expect(babicka.vx).toBeLessThan(normalVx * 0.3);
  });

  it('interacts with Grandpa bush on perimeter for healing plums or smoke shield', () => {
    const babicka = engine.spawnMonster('certova_babicka', 0, 0, 2.05, true, true);
    babicka.survivalTimer = 35.0;
    babicka.furyStage = 3;
    engine.state.certovaBabickaArena = { x: 0, y: 0, radius: 450, active: true };
    babicka.grandpaBush = {
      angle: 0,
      cooldown: 0,
      active: true,
      giftType: 'plums',
    };

    const player = engine.state.player;
    player.hp = Math.round(player.maxHp * 0.5);
    const prevHp = player.hp;

    // Place player at the bush location (x: 410, y: 0)
    player.x = 410;
    player.y = 0;

    babicka.update(0.016, player);

    // Player healed by plums (+30 Kuráž)
    expect(player.hp).toBe(prevHp + 30);
    // Bush enters cooldown
    expect(babicka.grandpaBush.cooldown).toBeCloseTo(12.0, 1);
    expect(babicka.grandpaBush.giftType).toBe('pipe');
  });

  it('completes duel after 60s endurance test, grants Malovaná almara and Babiččin bezedný pekáč', () => {
    const babicka = engine.spawnMonster('certova_babicka', 100, 100, 2.45, true, true);
    babicka.survivalTimer = 59.9;
    engine.state.certovaBabickaArena = { x: 100, y: 100, radius: 450, active: true };
    director.isCertovaBabickaDuelActive = true;

    babicka.update(0.15, engine.state.player);

    expect(babicka.dead).toBe(true);
    expect(engine.state.certovaBabickaArena).toBeNull();
    expect(director.isCertovaBabickaDuelActive).toBe(false);
    expect(engine.state.certovaBabickaGraceTimer).toBe(3.0);

    // Check Malovaná almara drop
    const almara = engine.state.drops.find((d) => d.type === 'chest' && (d as any).rewardWeapon === 'bezedny_pekac');
    expect(almara).toBeDefined();

    // Player acquired Babiččin bezedný pekáč weapon
    const weapon = engine.state.player.weapons.find((w: any) => w.id === 'bezedny_pekac');
    expect(weapon).toBeDefined();
  });

  it('Babiččin bezedný pekáč fires 8 hot buns that pierce enemies and heal 5 Kuráž upon contact', () => {
    const pekachDef = WEAPONS.bezedny_pekac;
    expect(pekachDef).toBeDefined();
    expect(pekachDef.type).toBe('food');
    expect(pekachDef.baseDmg).toBe(65);
    expect(pekachDef.baseCd).toBe(5.0);

    const player = engine.state.player;
    player.weapons = [];
    player.x = 300;
    player.y = 300;
    player.hp = player.maxHp - 30;
    const initialHp = player.hp;

    const projsBefore = engine.state.projectiles.length;
    pekachDef.fire(player, 1);

    const projsAfter = engine.state.projectiles.length;
    expect(projsAfter - projsBefore).toBe(8); // 8-way circular burst

    // 1 bun is touched by player (the others are placed far away to test single consumption)
    for (let i = 0; i < projsAfter - projsBefore; i++) {
      const p = engine.state.projectiles[projsBefore + i];
      expect(p.visual).toBe('horka_buchta');
      expect(p.isBunHeal).toBe(true);
      if (i === 0) {
        p.x = player.x;
        p.y = player.y;
      } else {
        p.x = player.x + 800;
        p.y = player.y + 800;
      }
    }

    engine.update(0.016);
    expect(player.hp).toBe(initialHp + 5);
  });
});
