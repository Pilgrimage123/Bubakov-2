import { describe, it, expect } from 'vitest';
import {
  computeEnemyKinematics,
  getDiscreteWaddle,
  getDiscreteTankPulse,
  drawEnemyWarningSign,
} from '../src/render/ladaRenderer';
import { drawChalkTelegraphZone } from '../src/render/renderTelegraphs';

describe('Křídový Nápřah a diskrétní kolébavý krok (ADR 0046, Ticket 05)', () => {
  describe('Nápřah Kinematics (0.75x Squash na vrcholu nápřahu, 1.25x Stretch při úderu)', () => {
    it('squashes to 0.75x height at the peak of windup across cadences', () => {
      // Normal cadence at apex
      const kNormal = computeEnemyKinematics({
        isAttacking: true,
        windupTimer: 1.1,
        attackDelay: 1.2,
        cadence: 'normal',
      });
      expect(kNormal.scaleY).toBeCloseTo(0.75, 2);
      expect(kNormal.scaleX).toBeGreaterThan(1.10);

      // Slow cadence at apex
      const kSlow = computeEnemyKinematics({
        isAttacking: true,
        windupTimer: 1.9,
        attackDelay: 2.0,
        cadence: 'slow',
      });
      expect(kSlow.scaleY).toBeCloseTo(0.75, 2);
      expect(kSlow.scaleX).toBeGreaterThan(1.10);

      // Fast cadence at apex
      const kFast = computeEnemyKinematics({
        isAttacking: true,
        windupTimer: 0.6,
        attackDelay: 0.65,
        cadence: 'fast',
      });
      expect(kFast.scaleY).toBeCloseTo(0.75, 2);
      expect(kFast.scaleX).toBeGreaterThan(1.10);
    });

    it('stretches to 1.25x height upon strike release across cadences', () => {
      // Normal cadence strike
      const kNormal = computeEnemyKinematics({
        isAttacking: false,
        recoveryTimer: 0.18,
        recoveryDuration: 0.2,
        cadence: 'normal',
      });
      expect(kNormal.scaleY).toBeCloseTo(1.25, 2);
      expect(kNormal.scaleX).toBeLessThan(0.90);

      // Slow cadence strike
      const kSlow = computeEnemyKinematics({
        isAttacking: false,
        recoveryTimer: 0.30,
        recoveryDuration: 0.35,
        cadence: 'slow',
      });
      expect(kSlow.scaleY).toBeCloseTo(1.25, 2);
      expect(kSlow.scaleX).toBeLessThan(0.90);

      // Fast cadence strike
      const kFast = computeEnemyKinematics({
        isAttacking: false,
        recoveryTimer: 0.12,
        recoveryDuration: 0.15,
        cadence: 'fast',
      });
      expect(kFast.scaleY).toBeCloseTo(1.25, 2);
      expect(kFast.scaleX).toBeLessThan(0.90);
    });
  });

  describe('Diskrétní kolébavý krok (4 fázové stavy, ±5°)', () => {
    it('cycles deterministically through 4 discrete phase states', () => {
      const p0 = getDiscreteWaddle(0.00, 1);
      const p1 = getDiscreteWaddle(0.13, 1);
      const p2 = getDiscreteWaddle(0.26, 1);
      const p3 = getDiscreteWaddle(0.38, 1);

      expect(p0.phase).toBe(0);
      expect(p1.phase).toBe(1);
      expect(p2.phase).toBe(2);
      expect(p3.phase).toBe(3);

      // Phase 0: step left (leanAngle = -5° = -0.087 rad)
      expect(p0.leanAngle).toBeCloseTo(-0.087, 3);
      // Phase 1: mid stride (leanAngle = 0)
      expect(p1.leanAngle).toBe(0);
      // Phase 2: step right (leanAngle = +5° = +0.087 rad)
      expect(p2.leanAngle).toBeCloseTo(0.087, 3);
      // Phase 3: mid stride (leanAngle = 0)
      expect(p3.leanAngle).toBe(0);

      // Height compression remains within 0.9x - 1.1x
      expect(p0.scaleY).toBeGreaterThanOrEqual(0.90);
      expect(p0.scaleY).toBeLessThanOrEqual(1.10);
      expect(p1.scaleY).toBeGreaterThanOrEqual(0.90);
      expect(p1.scaleY).toBeLessThanOrEqual(1.10);
    });

    it('inverts tilt when walking left (vx < 0)', () => {
      const p0Right = getDiscreteWaddle(0.00, 1);
      const p0Left = getDiscreteWaddle(0.00, -1);

      expect(p0Left.leanAngle).toBeCloseTo(-p0Right.leanAngle, 3);
    });
  });

  describe('Těžká strašidla (Tanky: vertikální pulzace 2.5 Hz bez bočního kolébání)', () => {
    it('maintains leanAngle = 0 throughout the cycle without side-to-side wobble', () => {
      for (let t = 0; t < 1.0; t += 0.05) {
        const tank = getDiscreteTankPulse(t);
        expect(tank.leanAngle).toBe(0);
        expect(tank.scaleY).toBeGreaterThanOrEqual(0.90);
        expect(tank.scaleY).toBeLessThanOrEqual(1.10);
      }
    });

    it('cycles through 4 vertical pulse states', () => {
      const p0 = getDiscreteTankPulse(0.00); // Heavy stomp
      const p2 = getDiscreteTankPulse(0.20); // Lift

      expect(p0.phase).toBe(0);
      expect(p0.scaleY).toBeCloseTo(0.92, 2);
      expect(p0.scaleX).toBeCloseTo(1.08, 2);

      expect(p2.phase).toBe(2);
      expect(p2.scaleY).toBeCloseTo(1.05, 2);
      expect(p2.scaleX).toBeCloseTo(0.95, 2);
    });
  });

  describe('Křídový nápřah a tušový vykřičník', () => {
    it('drawChalkTelegraphZone fills ground zone with watercolor rumělka and chalk outline', () => {
      const mockEnemy = {
        x: 200,
        y: 300,
        radius: 24,
        attackAngle: 0,
      };

      const strokeStyles: string[] = [];
      const fillStyles: string[] = [];
      let ellipseDrawn = false;
      let clipCalled = false;
      let hatchLinesDrawn = 0;

      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        ellipse: () => { ellipseDrawn = true; },
        fill: () => {},
        stroke: () => {},
        clip: () => { clipCalled = true; },
        moveTo: () => { hatchLinesDrawn++; },
        lineTo: () => {},
        set strokeStyle(v: string) { strokeStyles.push(v); },
        get strokeStyle() { return strokeStyles[strokeStyles.length - 1] || ''; },
        set fillStyle(v: string) { fillStyles.push(v); },
        get fillStyle() { return fillStyles[fillStyles.length - 1] || ''; },
        set lineWidth(_v: number) {},
      };

      drawChalkTelegraphZone(mockCtx, mockEnemy, 0.85);

      expect(ellipseDrawn).toBe(true);
      expect(clipCalled).toBe(true);
      expect(hatchLinesDrawn).toBeGreaterThan(5); // Pencil hatching
      // Watercolor cinnabar fill
      expect(fillStyles.some(f => f.includes('230, 42, 25'))).toBe(true);
      // Chalk outline
      expect(strokeStyles.some(s => s === '#FEF08A' || s.includes('255, 251, 235'))).toBe(true);
    });

    it('drawEnemyWarningSign renders ink exclamation mark with badge', () => {
      const mockEnemy: any = {
        x: 100,
        y: 100,
        radius: 20,
        windupTimer: 0.8,
        attackDelay: 1.0,
      };

      let textDrawn = '';
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        fillText: (t: string) => { textDrawn = t; },
        set fillStyle(_v: string) {},
        set strokeStyle(_v: string) {},
        set lineWidth(_v: number) {},
        set font(_v: string) {},
        set textAlign(_v: string) {},
        set textBaseline(_v: string) {},
      };

      drawEnemyWarningSign(mockCtx, mockEnemy);
      expect(textDrawn).toBe('!');
    });
  });
});
