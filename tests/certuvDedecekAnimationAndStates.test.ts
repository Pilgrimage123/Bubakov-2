import { describe, it, expect, vi } from 'vitest';
import { Lada } from '../src/render/ladaRenderer';

describe('Čertův dědeček (Lada.drawGrandfather) – ADR 0053 Kinematics & States', () => {
  function createMockContext() {
    let saveCount = 0;
    let restoreCount = 0;
    const paths: any[] = [];

    const ctx = {
      save: vi.fn(() => {
        saveCount++;
      }),
      restore: vi.fn(() => {
        restoreCount++;
      }),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      // Inspection helper
      getSaveBalance: () => saveCount - restoreCount,
      getSaveCount: () => saveCount,
      getRestoreCount: () => restoreCount,
    };

    return ctx as unknown as CanvasRenderingContext2D & {
      getSaveBalance: () => number;
      getSaveCount: () => number;
      getRestoreCount: () => number;
    };
  }

  it('draws Čertův dědeček in walking state with perfect save/restore balance', () => {
    const ctx = createMockContext();
    expect(() => {
      Lada.drawGrandfather(ctx, 100, 100, 1.25, 1, true, 1, false, 1.15, 'walking');
    }).not.toThrow();

    expect(ctx.getSaveCount()).toBeGreaterThan(5);
    expect(ctx.getSaveBalance()).toBe(0);
  });

  it('draws Čertův dědeček in waiting state with perfect save/restore balance', () => {
    const ctx = createMockContext();
    expect(() => {
      Lada.drawGrandfather(ctx, 100, 100, 2.5, 0, false, 1, false, 1.15, 'waiting');
    }).not.toThrow();

    expect(ctx.getSaveCount()).toBeGreaterThan(5);
    expect(ctx.getSaveBalance()).toBe(0);
  });

  it('draws Čertův dědeček in interacting state (offering gingerbread) with perfect save/restore balance', () => {
    const ctx = createMockContext();
    expect(() => {
      Lada.drawGrandfather(ctx, 100, 100, 0.75, 0, false, 1, true, 1.15, 'interacting');
    }).not.toThrow();

    expect(ctx.getSaveCount()).toBeGreaterThan(5);
    expect(ctx.getSaveBalance()).toBe(0);
  });

  it('preserves backwards compatibility when state argument is omitted', () => {
    // 1. Moving infer
    const ctxMove = createMockContext();
    Lada.drawGrandfather(ctxMove, 50, 50, 1.0, 10, true, -1, false, 1.0);
    expect(ctxMove.getSaveBalance()).toBe(0);

    // 2. Interacting infer
    const ctxInteract = createMockContext();
    Lada.drawGrandfather(ctxInteract, 50, 50, 1.0, 0, false, 1, true, 1.0);
    expect(ctxInteract.getSaveBalance()).toBe(0);

    // 3. Idle infer
    const ctxIdle = createMockContext();
    Lada.drawGrandfather(ctxIdle, 50, 50, 1.0, 0, false, 1, false, 1.0);
    expect(ctxIdle.getSaveBalance()).toBe(0);
  });

  it('renders correctly regardless of facing direction (left vs right)', () => {
    const ctxLeft = createMockContext();
    Lada.drawGrandfather(ctxLeft, 50, 50, 1.0, -1, true, -1, false, 1.2, 'walking');
    expect(ctxLeft.getSaveBalance()).toBe(0);

    const ctxRight = createMockContext();
    Lada.drawGrandfather(ctxRight, 50, 50, 1.0, 1, true, 1, false, 1.2, 'walking');
    expect(ctxRight.getSaveBalance()).toBe(0);
  });

  it('renders continuously without throwing across multiple animation timestamps', () => {
    const ctx = createMockContext();
    const timestamps = [0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.14, 5.0, 10.0];

    for (const t of timestamps) {
      for (const st of ['walking', 'waiting', 'interacting'] as const) {
        expect(() => {
          Lada.drawGrandfather(ctx, 100, 100, t, 0, false, 1, false, 1.15, st);
        }).not.toThrow();
      }
    }
    expect(ctx.getSaveBalance()).toBe(0);
  });

  it('guarantees the backpack nůše leans forward over the hunched back and never tilts backwards', () => {
    const ctx = createMockContext();
    const rotateCalls: number[] = [];
    (ctx.rotate as any).mockImplementation((rad: number) => {
      rotateCalls.push(rad);
    });

    // Test across walking cycle
    for (let t = 0; t < 2.0; t += 0.2) {
      rotateCalls.length = 0;
      Lada.drawGrandfather(ctx, 100, 100, t, 1, true, 1, false, 1.15, 'walking');
      // The first rotate call inside drawGrandfather is the basket rotation (at step 4)
      const basketAngle = rotateCalls[0];
      // Basket must always maintain a forward lean (> 0 rad, resting on back, never negative)
      expect(basketAngle).toBeGreaterThan(0.04);
      expect(basketAngle).toBeLessThan(0.35);
    }
  });
});
