import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';
import { Lada } from '../src/render/ladaRenderer';
import { resolveKvetenObstacles } from '../src/data/kvetenArena';
import { GameEngine } from '../src/game/engine';

describe('Level 5: Chroust obecný (May Bug Swarm Enemy)', () => {
  it('registers chroust in ENEMIES with flying swarm properties and authentic stats', () => {
    const chroust = ENEMIES.chroust;
    expect(chroust).toBeDefined();
    expect(chroust.id).toBe('chroust');
    expect(chroust.name).toBe('Chroust obecný');
    expect(chroust.category).toBe('swarms');
    expect(chroust.isFlying).toBe(true);
    expect(chroust.method).toBe('drawChroust');
    expect(chroust.hp).toBeGreaterThan(20);
    expect(chroust.speed).toBeGreaterThan(120);
    expect(chroust.xp).toBeGreaterThanOrEqual(1);
  });

  it('is integrated into Stage 5 (Májová slavnost) spawn pools', () => {
    const lvl4 = GAME_LEVELS[4];
    expect(lvl4.spawnPools.noon).toContain('chroust');
    expect(lvl4.spawnPools.afternoon).toContain('chroust');
    const chroustKey = lvl4.keyEnemies.find((e) => e.id === 'chroust');
    expect(chroustKey).toBeDefined();
    expect(chroustKey?.role).toContain('sinusovým');
  });

  it('ignores ground terrain obstacles during movement because of isFlying property', () => {
    // Ground entity gets stopped by cottage (-350, -362)
    const groundMob = { x: -350, y: -362, radius: 18 };
    resolveKvetenObstacles(groundMob, false);
    expect(Math.hypot(groundMob.x - (-350), groundMob.y - (-362))).toBeGreaterThan(40);

    // Flying chroust traverses freely over the same building footprint
    const flyingChroust = { x: -350, y: -362, radius: 18 };
    resolveKvetenObstacles(flyingChroust, true);
    expect(flyingChroust.x).toBe(-350);
    expect(flyingChroust.y).toBe(-362);
  });

  it('updates flight kinematics with sine-wave trajectory and altitude', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const enemy = engine.spawnMonster('chroust', 300, 300, 1.0);
    expect(enemy.isFlying).toBe(true);

    // Update engine loop
    engine.update(0.05);
    expect(enemy.sinePhase).toBeDefined();
    expect(enemy.flightAltitude).toBeGreaterThan(0);
    expect(enemy.vx !== 0 || enemy.vy !== 0).toBe(true);
  });

  it('renders authentic Ladovský beetle graphics without canvas exceptions', () => {
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
    };

    // Calm flight
    expect(() => (Lada as any).drawChroust(mockCtx, 100, 100, 2.5, 80, false)).not.toThrow();

    // Panicked retreat
    expect(() => (Lada as any).drawChroust(mockCtx, 100, 100, 2.5, -80, true)).not.toThrow();
  });
});
