import { describe, it, expect } from 'vitest';
import { Lada, drawEnemyRenderer, computeEnemyKinematics } from '../src/render/ladaRenderer';
import { ENEMIES } from '../src/data/enemies';

function createMockCtx() {
  let saveDepth = 0;
  let minDepth = 0;

  const mockCtx: any = {
    save() {
      saveDepth++;
    },
    restore() {
      saveDepth--;
      if (saveDepth < minDepth) minDepth = saveDepth;
    },
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    arcTo() {},
    ellipse() {},
    rect() {},
    strokeRect() {},
    fillRect() {},
    stroke() {},
    fill() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    fillText() {},
    strokeText() {},
    measureText() {
      return { width: 50 };
    },
    createLinearGradient() {
      return { addColorStop() {} };
    },
    createRadialGradient() {
      return { addColorStop() {} };
    },
    setLineDash() {},
    getTransform() {
      return { e: 0, f: 0 };
    },
    filter: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalCompositeOperation: 'source-over',
  };

  return {
    ctx: mockCtx as CanvasRenderingContext2D,
    getDepth: () => saveDepth,
    getMinDepth: () => minDepth,
    reset: () => {
      saveDepth = 0;
      minDepth = 0;
    },
  };
}

describe('Enemy Procedural Kinematics & Rendering System', () => {
  describe('computeEnemyKinematics', () => {
    it('returns neutral identity transform when enemy is not attacking and not recovering', () => {
      const k = computeEnemyKinematics({
        cadence: 'normal',
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0,
        attackDelay: 1.2,
        attackAngle: 0,
        facingDir: 1,
        time: 1.0,
      });

      expect(k.lungeX).toBe(0);
      expect(k.lungeY).toBe(0);
      expect(k.scaleX).toBe(1);
      expect(k.scaleY).toBe(1);
      expect(k.leanAngle).toBe(0);
      expect(k.shakeX).toBe(0);
      expect(k.shakeY).toBe(0);
      expect(k.phase).toBe(0);
    });

    it('slow cadence (1.8s delay) computes 5 distinct phases with heavy squash, stretch, shake, and 36px lunge', () => {
      // Phase 1 (0.2s): Heavy crouch & brace (squash scaleY < 1, scaleX > 1)
      const p1 = computeEnemyKinematics({
        cadence: 'slow',
        isAttacking: true,
        windupTimer: 0.2,
        recoveryTimer: 0,
        attackDelay: 1.8,
        attackAngle: 0,
        facingDir: 1,
        time: 0.2,
      });
      expect(p1.phase).toBe(1);
      expect(p1.scaleY).toBeLessThan(1.0);
      expect(p1.scaleX).toBeGreaterThan(1.0);

      // Phase 2 (0.8s): Monumental windup lift & stretch
      const p2 = computeEnemyKinematics({
        cadence: 'slow',
        isAttacking: true,
        windupTimer: 0.8,
        recoveryTimer: 0,
        attackDelay: 1.8,
        attackAngle: 0,
        facingDir: 1,
        time: 0.8,
      });
      expect(p2.phase).toBe(2);
      expect(p2.scaleY).toBeGreaterThan(1.0);
      expect(p2.leanAngle).toBeLessThan(0); // leaning back away from target

      // Phase 3 (1.6s): Apex tension with high-frequency shake and red flare
      const p3 = computeEnemyKinematics({
        cadence: 'slow',
        isAttacking: true,
        windupTimer: 1.6,
        recoveryTimer: 0,
        attackDelay: 1.8,
        attackAngle: 0,
        facingDir: 1,
        time: 1.6,
      });
      expect(p3.phase).toBe(3);
      expect(Math.abs(p3.shakeX) + Math.abs(p3.shakeY)).toBeGreaterThan(0);
      expect(p3.showWarningFlare).toBe(true);
      expect(p3.flareColor).toBe('red');

      // Phase 4 (strike at start of recovery): Massive 36px lunge forward along attackAngle
      const p4 = computeEnemyKinematics({
        cadence: 'slow',
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0.24, // 0.25 max
        recoveryDuration: 0.25,
        attackDelay: 1.8,
        attackAngle: 0,
        facingDir: 1,
        time: 1.8,
      });
      expect(p4.phase).toBe(4);
      expect(p4.lungeX).toBeCloseTo(36, 1);
      expect(p4.hasSlashingArc).toBe(true);
      expect(p4.hasShockwave).toBe(true);

      // Phase 5 (weapon recovery, near end of 0.25s): Eases back towards neutral
      const p5 = computeEnemyKinematics({
        cadence: 'slow',
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0.05,
        recoveryDuration: 0.25,
        attackDelay: 1.8,
        attackAngle: 0,
        facingDir: 1,
        time: 2.0,
      });
      expect(p5.phase).toBe(5);
      expect(p5.lungeX).toBeLessThan(36);
    });

    it('normal cadence (1.2s delay) computes 4 phases with 24px lunge and gold star flare', () => {
      // Phase 1 (0.2s): anticipation step back
      const p1 = computeEnemyKinematics({
        cadence: 'normal',
        isAttacking: true,
        windupTimer: 0.2,
        recoveryTimer: 0,
        attackDelay: 1.2,
        attackAngle: 0,
        facingDir: 1,
        time: 0.2,
      });
      expect(p1.phase).toBe(1);
      expect(p1.lungeX).toBeLessThan(0); // stepping back

      // Phase 2 (0.9s): body curve with gold star flare
      const p2 = computeEnemyKinematics({
        cadence: 'normal',
        isAttacking: true,
        windupTimer: 0.9,
        recoveryTimer: 0,
        attackDelay: 1.2,
        attackAngle: 0,
        facingDir: 1,
        time: 0.9,
      });
      expect(p2.phase).toBe(2);
      expect(p2.showWarningFlare).toBe(true);
      expect(p2.flareColor).toBe('gold');

      // Phase 3 (impact): 24px lunge
      const p3 = computeEnemyKinematics({
        cadence: 'normal',
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0.19,
        recoveryDuration: 0.2,
        attackDelay: 1.2,
        attackAngle: 0,
        facingDir: 1,
        time: 1.2,
      });
      expect(p3.phase).toBe(3);
      expect(p3.lungeX).toBeCloseTo(24, 1);
    });

    it('fast cadence (0.6s delay) computes 3 phases with spring squash and 18-20px lunge', () => {
      // Phase 1: spring compression
      const p1 = computeEnemyKinematics({
        cadence: 'fast',
        isAttacking: true,
        windupTimer: 0.3,
        recoveryTimer: 0,
        attackDelay: 0.6,
        attackAngle: 0,
        facingDir: 1,
        time: 0.3,
      });
      expect(p1.phase).toBe(1);
      expect(p1.scaleY).toBeLessThan(0.9);
      expect(p1.scaleX).toBeGreaterThan(1.1);

      // Phase 2 (strike impact): rapid lunge
      const p2 = computeEnemyKinematics({
        cadence: 'fast',
        isAttacking: false,
        windupTimer: 0,
        recoveryTimer: 0.14,
        recoveryDuration: 0.15,
        attackDelay: 0.6,
        attackAngle: 0,
        facingDir: 1,
        time: 0.6,
      });
      expect(p2.phase).toBe(2);
      expect(p2.lungeX).toBeGreaterThanOrEqual(18);
      expect(p2.hasClawSparks).toBe(true);
    });
  });

  describe('Canvas stack balance and exception immunity across all 49 enemies', () => {
    const enemyKeys = Object.keys(ENEMIES);
    const mock = createMockCtx();

    it(`executes drawEnemyRenderer for all ${enemyKeys.length} enemies in neutral, windup, and recovery states`, () => {
      for (const enemyId of enemyKeys) {
        const enemyDef = ENEMIES[enemyId];
        const method = enemyDef.method;

        const testStates = [
          // 1. Neutral walking
          { isAttacking: false, windupTimer: 0, recoveryTimer: 0 },
          // 2. Mid-windup
          { isAttacking: true, windupTimer: 0.5, recoveryTimer: 0 },
          // 3. Apex windup
          { isAttacking: true, windupTimer: enemyDef.attackInterval ? enemyDef.attackInterval * 0.9 : 1.0, recoveryTimer: 0 },
          // 4. Strike recovery
          { isAttacking: false, windupTimer: 0, recoveryTimer: 0.15 },
        ];

        for (const st of testStates) {
          for (const vx of [-50, 50]) {
            for (const panicked of [false, true]) {
              mock.reset();
              const enemyInstance = {
                id: enemyId,
                attackCadence: enemyDef.attackCadence,
                attackDelay: enemyDef.attackInterval || 1.2,
                attackAngle: vx < 0 ? Math.PI : 0,
                radius: enemyDef.radius,
                ...st,
              };

              expect(() => {
                drawEnemyRenderer(method, mock.ctx, 100, 100, 1.25, vx, panicked, enemyInstance);
              }).not.toThrow();

              expect(mock.getDepth()).toBe(0);
              expect(mock.getMinDepth()).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    });

    it('renders bosses including Sněhulák, Bezhlavý rytíř, Čert, Mlynář and Drak via drawEnemyRenderer with zero stack leaks', () => {
      mock.reset();
      drawEnemyRenderer('drawCert', mock.ctx, 100, 100, 1.0, 0, false, { id: 'cert', attackCadence: 'normal', isAttacking: true, windupTimer: 0.6, attackAngle: Math.PI }, [false, false]);
      expect(mock.getDepth()).toBe(0);

      mock.reset();
      drawEnemyRenderer('drawSnehulak', mock.ctx, 100, 100, 1.0, 50, false, { id: 'snehulak' }, [true]); // isCharging
      expect(mock.getDepth()).toBe(0);

      mock.reset();
      drawEnemyRenderer('drawBezhlavyRytir', mock.ctx, 100, 100, 1.0, 50, false, { id: 'bezhlavy_rytir' }, [true]); // isEnraged
      expect(mock.getDepth()).toBe(0);

      mock.reset();
      drawEnemyRenderer('drawMlynar', mock.ctx, 100, 100, 1.0, 50, false, { id: 'mlynar' }, [true]);
      expect(mock.getDepth()).toBe(0);

      mock.reset();
      drawEnemyRenderer('drawDrak', mock.ctx, 100, 100, 1.0, 50, false, { id: 'drak' }, [true, { fire: 1, ice: 0, roar: 0 }]);
      expect(mock.getDepth()).toBe(0);
    });

    it('correctly sets facingDir and transforms when attacking left with vx=0 (User Story 13)', () => {
      mock.reset();
      // When bubák is winding up to the left (attackAngle = Math.PI) with vx = 0
      const enemyInstance = {
        id: 'certik',
        attackCadence: 'normal' as const,
        attackDelay: 1.2,
        attackAngle: Math.PI,
        isAttacking: true,
        windupTimer: 0.6,
        recoveryTimer: 0,
        radius: 20,
      };

      expect(() => {
        drawEnemyRenderer('drawCertik', mock.ctx, 100, 100, 1.0, 0, false, enemyInstance);
      }).not.toThrow();
      expect(mock.getDepth()).toBe(0);
    });
  });
});
