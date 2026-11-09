import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { RunDirector } from '../src/game/director';
import { ENEMIES } from '../src/data/enemies';
import { Lada, drawEnemyRenderer } from '../src/render/ladaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Bubácká díra & Strachem nacpaný Barbucha (ADR 0050)', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 50, spawnInitialWave: false });
    director = engine.director!;
  });

  it('defines Barbucha in ENEMIES catalog with canonical smoke properties', () => {
    const barbucha = ENEMIES.barbucha;
    expect(barbucha).toBeDefined();
    expect(barbucha.name).toBe('Strachem nacpaný Barbucha');
    expect(barbucha.category).toBe('shadows');
    expect(barbucha.method).toBe('drawBarbucha');
    expect(barbucha.isFlying).toBe(true);
    expect(barbucha.hp).toBeGreaterThanOrEqual(1000);
  });

  it('drawBarbucha is registered on Lada and renders on canvas without exceptions', () => {
    expect(typeof (Lada as any).drawBarbucha).toBe('function');

    const ctx = createMockCanvasContext();

    expect(() => {
      drawEnemyRenderer(
        'drawBarbucha',
        ctx,
        200,
        200,
        1.5,
        1,
        false,
        {
          id: 'barbucha',
          renderScale: 1.4,
          hp: 800,
          maxHp: 1250,
          windupTimer: 0.5,
          isAttacking: true,
        }
      );
    }).not.toThrow();
  });

  it('spawns Bubacka dira in anomalyWindow with vortex pull and emergence progress', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;

    director.update(0.1, engine);
    expect(director.bubackaDira).toBeDefined();
    const dira = director.bubackaDira!;
    expect(dira.isCompleted).toBe(false);
    expect(dira.isFailed).toBe(false);

    // Player nearby experiences inward vortex pull
    const player = engine.state.player;
    player.x = dira.x + dira.radius * 1.1;
    player.y = dira.y;
    const prevDist = Math.hypot(player.x - dira.x, player.y - dira.y);

    director.update(0.2, engine);
    const newDist = Math.hypot(player.x - dira.x, player.y - dira.y);
    expect(newDist).toBeLessThan(prevDist);

    // Emergence progress increases as timeRemaining drops
    expect(dira.emergence).toBeGreaterThan(0);
  });

  it('dims petrolejka radius when player is inside Bubacka dira', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    engine.state.bubackaDira = dira;
    const player = engine.state.player;

    // Player outside
    player.x = dira.x + 500;
    player.y = dira.y + 500;
    director.update(0.1, engine);
    expect(dira.playerInside).toBe(false);

    engine.update(0.016);
    const normalRadius = engine.state.petrolejkaLight?.radius || 0;

    // Player steps inside
    player.x = dira.x;
    player.y = dira.y;
    director.update(0.1, engine);
    expect(dira.playerInside).toBe(true);

    engine.update(0.016);
    const dimmedRadius = engine.state.petrolejkaLight?.radius || 0;

    expect(dimmedRadius).toBeLessThan(normalRadius);
    expect(dimmedRadius).toBeCloseTo(normalRadius * 0.65, 0);
  });

  it('completing the ritual seals the hole and gives treasure chest', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    const player = engine.state.player;
    player.x = dira.x;
    player.y = dira.y;

    director.update(4.1, engine);
    expect(dira.isCompleted).toBe(true);
    expect(dira.isFailed).toBe(false);

    const chestDrop = engine.state.drops.find((d) => d.type === 'chest');
    expect(chestDrop).toBeDefined();
  });

  it('failing the ritual spawns Barbucha scaled inversely to player Kuráž', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    const player = engine.state.player;
    // Set player to low Kuráž (fearful state)
    player.hp = Math.round(player.maxHp * 0.2); // 20% health left
    player.x = dira.x + 800;
    player.y = dira.y + 800;

    director.update(15.2, engine);
    expect(dira.isFailed).toBe(true);

    const barbucha = engine.state.enemies.find((e) => e.id === 'barbucha');
    expect(barbucha).toBeDefined();
    // With 20% Kuráž, Barbucha should spawn big (>=1.5x scale)
    expect(barbucha.renderScale).toBeGreaterThanOrEqual(1.5);
    expect(barbucha.isMiniboss).toBe(true);
  });

  it('Barbucha deflates as he takes damage down to 0.6 scale', () => {
    const barbucha = engine.spawnMonster('barbucha', 0, 0, 1.6, false, true);
    barbucha.barbuchaBaseScale = 1.6;

    // Full health -> renderScale is base scale
    barbucha.update(0.016, engine.state.player);
    expect(barbucha.renderScale).toBeCloseTo(1.6, 1);

    // Half health
    barbucha.hp = Math.round(barbucha.maxHp * 0.5);
    barbucha.update(0.016, engine.state.player);
    expect(barbucha.renderScale).toBeLessThan(1.6);
    expect(barbucha.renderScale).toBeGreaterThan(0.6);

    // Low health -> deflated to ~0.65
    barbucha.hp = Math.round(barbucha.maxHp * 0.05);
    barbucha.update(0.016, engine.state.player);
    expect(barbucha.renderScale).toBeCloseTo(0.65, 1);
  });

  it('Barbucha attacks with radial nova when >50% Kuráž and directional cone when <=50%', () => {
    const barbucha = engine.spawnMonster('barbucha', 150, 150, 1.5, false, true);
    barbucha.barbuchaBaseScale = 1.5;

    // 1. Over 50% health -> triggers nápřah and shoots radial burst (8 projectiles)
    barbucha.barbuchaShootCooldown = 0.01;
    barbucha.update(0.02, engine.state.player);
    expect(barbucha.isWindup).toBe(true);
    expect(barbucha.windupTimer).toBeGreaterThan(0);

    const projsBefore = engine.state.projectiles.length;
    // Fast-forward windup
    barbucha.update(0.8, engine.state.player);
    const radialCount = engine.state.projectiles.length - projsBefore;
    expect(radialCount).toBe(8);

    const clawProj = engine.state.projectiles[engine.state.projectiles.length - 1];
    expect(clawProj.visual).toBe('barbucha_claw');

    // 2. Under 50% health -> triggers directional cone (5 projectiles)
    barbucha.hp = Math.round(barbucha.maxHp * 0.4);
    barbucha.barbuchaShootCooldown = 0.01;
    barbucha.update(0.02, engine.state.player);
    expect(barbucha.isWindup).toBe(true);

    const projsBefore2 = engine.state.projectiles.length;
    barbucha.update(0.8, engine.state.player);
    const coneCount = engine.state.projectiles.length - projsBefore2;
    expect(coneCount).toBe(5);
  });

  it('defeating Barbucha drops Škvarková placka and gingerbreads with PUF dissipation', () => {
    const barbucha = engine.spawnMonster('barbucha', 100, 100, 1.4, false, true);
    barbucha.takeDamage(99999);
    barbucha.update(0.016, engine.state.player);

    expect(barbucha.dead).toBe(true);
    const plackaDrop = engine.state.drops.find((d) => d.type === 'bread');
    expect(plackaDrop).toBeDefined();

    const chestDrop = engine.state.drops.find((d) => d.type === 'chest');
    expect(chestDrop).toBeUndefined(); // Barbucha does NOT drop a chest per ADR 0050
  });
});
