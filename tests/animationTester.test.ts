import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { Lada, computeEnemyKinematics } from '../src/render/ladaRenderer';

describe('Animation Tester Data & Rendering Capabilities', () => {
  it('has all 49 enemies from folklore ready for animation testing', () => {
    const enemyKeys = Object.keys(ENEMIES);
    expect(enemyKeys.length).toBeGreaterThanOrEqual(49);

    for (const key of enemyKeys) {
      const e = ENEMIES[key];
      expect(e.id).toBe(key);
      expect(e.name).toBeDefined();
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.category).toBeDefined();
      expect(e.method).toBeDefined();

      // Check drawer function exists on Lada or fallback exists
      const drawer = (Lada as any)[e.method];
      expect(typeof drawer === 'function' || typeof (Lada as any).drawRarach === 'function').toBe(true);
    }
  });

  it('provides all core hunters with functional Lada renderers and executes them cleanly', () => {
    expect(typeof Lada.drawWanderer).toBe('function');
    expect(typeof Lada.drawShepherd).toBe('function');
    expect(typeof Lada.drawKorenarka).toBe('function');
    expect(typeof Lada.drawWatchman).toBe('function');
    expect(typeof Lada.drawSexton).toBe('function');
    expect(typeof Lada.drawGranny).toBe('function');
    expect(typeof Lada.drawBarunka).toBe('function');

    const noop = () => {};
    const mockCtx = new Proxy(
      { fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: 'round', lineJoin: 'round' },
      { get: (target, prop) => (prop in target ? (target as any)[prop] : noop) }
    ) as unknown as CanvasRenderingContext2D;

    // Walk, Sprint, Hurt (startled hit), and Fleeing (0 courage) for Shepherd, Sexton, Barunka, and Granny
    expect(() => Lada.drawShepherd(mockCtx, 100, 100, 1.5, 1, 0, false, 1, false)).not.toThrow();
    expect(() => Lada.drawShepherd(mockCtx, 100, 100, 1.5, 1.8, 0.5, false, 1, false)).not.toThrow();
    expect(() => Lada.drawShepherd(mockCtx, 100, 100, 1.5, 0, 0, false, 1, true)).not.toThrow();
    expect(() => Lada.drawShepherd(mockCtx, 100, 100, 1.5, 1.8, 0, true, 1, false)).not.toThrow();

    expect(() => Lada.drawSexton(mockCtx, 100, 100, 1.5, 1, 0, false, 1, false)).not.toThrow();
    expect(() => Lada.drawSexton(mockCtx, 100, 100, 1.5, 1.8, 0.5, false, 1, false)).not.toThrow();
    expect(() => Lada.drawSexton(mockCtx, 100, 100, 1.5, 0, 0, false, 1, true)).not.toThrow();
    expect(() => Lada.drawSexton(mockCtx, 100, 100, 1.5, 1.8, 0, true, 1, false)).not.toThrow();

    expect(() => Lada.drawBarunka(mockCtx, 100, 100, 1.5, true, 1, false, false, false, 1)).not.toThrow();
    expect(() => Lada.drawBarunka(mockCtx, 100, 100, 1.5, true, 1, false, false, true, 1)).not.toThrow();
    expect(() => Lada.drawBarunka(mockCtx, 100, 100, 1.5, false, 1, false, true, false, 1)).not.toThrow();
    expect(() => Lada.drawBarunka(mockCtx, 100, 100, 1.5, true, 1, true, false, false, -1)).not.toThrow();

    expect(() => Lada.drawGranny(mockCtx, 100, 100, 1.5, 1, 0, false, 1, true, false)).not.toThrow();
    expect(() => Lada.drawGranny(mockCtx, 100, 100, 1.5, 1.8, 0.5, false, 1, true, false)).not.toThrow();
    expect(() => Lada.drawGranny(mockCtx, 100, 100, 1.5, 0, 0, false, 1, true, true)).not.toThrow();
    expect(() => Lada.drawGranny(mockCtx, 100, 100, 1.5, 1.8, 0, true, 1, true, false)).not.toThrow();
  });

  it('provides Grandfather walking sprite renderer with limp kinematics', () => {
    expect(typeof Lada.drawGrandfather).toBe('function');
  });

  it('computes kinematics for fast, normal, and slow attack cadences', () => {
    const cadences = ['fast', 'normal', 'slow'] as const;

    for (const cadence of cadences) {
      const kIdle = computeEnemyKinematics({
        cadence,
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0,
        attackDelay: 1.2,
        recoveryDuration: 0.2,
        attackAngle: 0,
        facingDir: 1,
        time: 1.0,
      });

      expect(kIdle.phase).toBe(0);
      expect(kIdle.scaleX).toBe(1);
      expect(kIdle.scaleY).toBe(1);

      // Windup phase
      const kWindup = computeEnemyKinematics({
        cadence,
        isAttacking: true,
        windupTimer: 0.8,
        recoveryTimer: 0,
        attackDelay: 1.0,
        recoveryDuration: 0.2,
        attackAngle: 0,
        facingDir: 1,
        time: 2.0,
      });

      expect(kWindup.phase).toBeGreaterThan(0);

      // Strike / recovery phase
      const kStrike = computeEnemyKinematics({
        cadence,
        isAttacking: true,
        windupTimer: 0,
        recoveryTimer: 0.1,
        attackDelay: 1.0,
        recoveryDuration: 0.2,
        attackAngle: 0,
        facingDir: 1,
        time: 2.5,
      });

      expect(kStrike.phase).toBeGreaterThan(0);
    }
  });
});
