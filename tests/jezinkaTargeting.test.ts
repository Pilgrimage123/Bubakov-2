import { describe, expect, it } from 'vitest';
import {
  isDirectTargetable,
  isJezinkaSemiVisible,
  JEZINKA_DIRECT_TARGET_RANGE,
  JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER,
} from '../src/game/targeting';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { Lada } from '../src/render/ladaRenderer';

describe('Frost Jezinka targeting, scale, and semi-visible damage reduction', () => {
  it('allows direct targeting within 100 px but not beyond that range', () => {
    const hunter = { x: 0, y: 0 };
    expect(JEZINKA_DIRECT_TARGET_RANGE).toBe(100);
    expect(isDirectTargetable({ id: 'jezinka_mraziva', x: 100, y: 0 }, hunter)).toBe(true);
    expect(isDirectTargetable({ id: 'jezinka_mraziva', x: 100.01, y: 0 }, hunter)).toBe(false);
    expect(isDirectTargetable({ id: 'rarach', x: 1000, y: 0 }, hunter)).toBe(true);
  });

  it('is 70% larger in both collision radius and rendered sprite scale', () => {
    expect(ENEMIES.jezinka_mraziva.radius).toBe(34); // 20 * 1.7 = 34

    const scaleCalls: Array<[number, number]> = [];
    const mockCtx: any = {
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      scale(sx: number, sy: number) {
        scaleCalls.push([sx, sy]);
      },
      beginPath() {},
      closePath() {},
      moveTo() {},
      lineTo() {},
      quadraticCurveTo() {},
      bezierCurveTo() {},
      arc() {},
      ellipse() {},
      fill() {},
      stroke() {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      globalAlpha: 1,
    };

    Lada.drawFrostJezinka(mockCtx as CanvasRenderingContext2D, 100, 100, 1.0, 1, false);
    expect(scaleCalls.length).toBeGreaterThan(0);
    expect(scaleCalls[0][0]).toBeCloseTo(0.6 * 1.7, 5);
    expect(scaleCalls[0][1]).toBeCloseTo(0.6 * 1.7, 5);
  });

  it('keeps the Jezinka damageable even when direct targeting is blocked', () => {
    const engine = new GameEngine();
    const state = engine.initRun({ levelId: 0, hunterType: 'wanderer', spawnInitialWave: false });
    state.player!.x = 0;
    state.player!.y = 0;
    const jezinka = engine.spawnMonster('jezinka_mraziva', 150, 0);
    expect(isDirectTargetable(jezinka, state.player)).toBe(false);
    const hpBefore = jezinka.hp;
    jezinka.takeDamage(10, 'physical');
    expect(jezinka.hp).toBeLessThan(hpBefore);
  });

  it('takes only half damage from uncritical hits when semi-visible, but full damage from critical hits', () => {
    expect(JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER).toBe(0.5);

    const engine = new GameEngine();
    const state = engine.initRun({ levelId: 0, hunterType: 'wanderer', spawnInitialWave: false });
    state.player!.x = 0;
    state.player!.y = 0;
    state.player!.luck = 0;
    state.player!.guaranteedCritTimer = 0;

    const semiVisibleJezinka = engine.spawnMonster('jezinka_mraziva', 150, 0);
    const revealedJezinka = engine.spawnMonster('jezinka_mraziva', 50, 0);
    revealedJezinka.semiVisible = false;

    expect(isJezinkaSemiVisible(semiVisibleJezinka)).toBe(true);
    expect(isJezinkaSemiVisible(revealedJezinka)).toBe(false);

    const hpStart = semiVisibleJezinka.hp;
    semiVisibleJezinka.takeDamage(100, 'physical');
    revealedJezinka.takeDamage(100, 'physical');

    const semiVisibleUncritTaken = hpStart - semiVisibleJezinka.hp;
    const revealedUncritTaken = hpStart - revealedJezinka.hp;
    expect(semiVisibleUncritTaken).toBeCloseTo(revealedUncritTaken * 0.5, 5);

    // Guaranteed critical hit bypasses the 50% uncritical damage reduction even while semi-visible
    const critJezinka = engine.spawnMonster('jezinka_mraziva', 150, 0);
    state.player!.guaranteedCritTimer = 5.0;
    critJezinka.takeDamage(100, 'physical');
    const critTaken = hpStart - critJezinka.hp;
    expect(critTaken).toBe(Math.round(revealedUncritTaken * 2.2));
  });
});

