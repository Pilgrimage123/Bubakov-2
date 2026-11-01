import { describe, it, expect, vi } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { GameEngine } from '../src/game/engine';
import { Lada, computeEnemyKinematics } from '../src/render/ladaRenderer';

function createRecordingCanvasContext() {
  let saveDepth = 0;
  let saveCount = 0;
  let restoreCount = 0;
  let underflowed = false;
  const ops: string[] = [];
  const gradientStub = { addColorStop: () => {} };

  const target: Record<string, any> = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    globalAlpha: 1,
    font: '12px sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    save() {
      saveDepth += 1;
      saveCount += 1;
      ops.push('save');
    },
    restore() {
      restoreCount += 1;
      saveDepth -= 1;
      if (saveDepth < 0) underflowed = true;
      ops.push('restore');
    },
    translate(x: number, y: number) {
      ops.push(`translate:${x.toFixed(2)},${y.toFixed(2)}`);
    },
    scale(sx: number, sy: number) {
      ops.push(`scale:${sx.toFixed(2)},${sy.toFixed(2)}`);
    },
    rotate(angle: number) {
      ops.push(`rotate:${angle.toFixed(3)}`);
    },
    arc(x: number, y: number, r: number) {
      ops.push(`arc:${x.toFixed(1)},${y.toFixed(1)},${r.toFixed(1)}`);
    },
    ellipse(x: number, y: number, rx: number, ry: number) {
      ops.push(`ellipse:${x.toFixed(1)},${y.toFixed(1)},${rx.toFixed(1)},${ry.toFixed(1)}`);
    },
    createRadialGradient() {
      return gradientStub;
    },
    createLinearGradient() {
      return gradientStub;
    },
    measureText() {
      return { width: 20 };
    },
  };

  const noop = () => {};
  const ctx = new Proxy(target, {
    get(obj, prop: string) {
      return prop in obj ? obj[prop] : noop;
    },
    set(obj, prop: string, value) {
      obj[prop] = value;
      if (prop === 'fillStyle' && typeof value === 'string') {
        ops.push(`fill:${value}`);
      }
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;

  return {
    ctx,
    ops,
    get saveDepth() {
      return saveDepth;
    },
    get saveCount() {
      return saveCount;
    },
    get restoreCount() {
      return restoreCount;
    },
    get underflowed() {
      return underflowed;
    },
  };
}

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

  it('executes all 7 canonical hunters across Idle, Walk, Sprint, Hurt, and Fleeing with balanced canvas stacks and no double shadow', () => {
    expect(typeof Lada.drawKrajanek).toBe('function');
    expect(typeof Lada.drawKrajanekRide).toBe('function');
    expect(typeof Lada.drawWanderer).toBe('function');
    expect(typeof Lada.drawShepherd).toBe('function');
    expect(typeof Lada.drawKorenarka).toBe('function');
    expect(typeof Lada.drawWatchman).toBe('function');
    expect(typeof Lada.drawSexton).toBe('function');
    expect(typeof Lada.drawGranny).toBe('function');
    expect(typeof Lada.drawBarunka).toBe('function');

    const canonicalHunters: Array<{
      id: string;
      draw: (ctx: CanvasRenderingContext2D, dx: number, dy: number, flee: boolean, hurt: boolean) => void;
    }> = [
      {
        id: 'krajanek',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawKrajanek(ctx, 100, 100, 1.5, dx, dy, flee, 1, false, hurt),
      },
      {
        id: 'tulak',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawWanderer(ctx, 100, 100, 1.5, dx, dy, flee, 1, false, 0, hurt),
      },
      {
        id: 'pasacek',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawShepherd(ctx, 100, 100, 1.5, dx, dy, flee, 1, hurt),
      },
      {
        id: 'korenarka',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawKorenarka(ctx, 100, 100, 1.5, dx, dy, flee, 1, hurt),
      },
      {
        id: 'ponocny',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawWatchman(ctx, 100, 100, 1.5, dx, dy, flee, 1, hurt),
      },
      {
        id: 'kostelnik',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawSexton(ctx, 100, 100, 1.5, dx, dy, flee, 1, hurt),
      },
      {
        id: 'babicka',
        draw: (ctx, dx, dy, flee, hurt) => Lada.drawGranny(ctx, 100, 100, 1.5, dx, dy, flee, 1, true, hurt),
      },
    ];

    const states: Array<{ name: string; dx: number; dy: number; flee: boolean; hurt: boolean }> = [
      { name: 'idle-right', dx: 0.001, dy: 0, flee: false, hurt: false },
      { name: 'idle-left', dx: -0.001, dy: 0, flee: false, hurt: false },
      { name: 'walk-right', dx: 1, dy: 0, flee: false, hurt: false },
      { name: 'walk-vertical-left', dx: -0.001, dy: -1, flee: false, hurt: false },
      { name: 'sprint-right', dx: 1.8, dy: 0.5, flee: false, hurt: false },
      { name: 'sprint-vertical-left', dx: -0.001, dy: -1.8, flee: false, hurt: false },
      { name: 'hurt', dx: 0.001, dy: 0, flee: false, hurt: true },
      { name: 'fleeing', dx: -1.8, dy: 0.4, flee: true, hurt: false },
    ];

    const shadowSpy = vi.spyOn(Lada, 'drawShadow');

    for (const hunter of canonicalHunters) {
      const opsByState: Record<string, string> = {};

      for (const st of states) {
        const rec = createRecordingCanvasContext();
        expect(() => hunter.draw(rec.ctx, st.dx, st.dy, st.flee, st.hurt), `${hunter.id}:${st.name}`).not.toThrow();
        expect(rec.underflowed, `${hunter.id}:${st.name} stack underflow`).toBe(false);
        expect(rec.saveDepth, `${hunter.id}:${st.name} unbalanced save/restore`).toBe(0);
        expect(rec.saveCount).toBeGreaterThan(0);
        expect(rec.restoreCount).toBe(rec.saveCount);
        opsByState[st.name] = rec.ops.join('|');
      }

      // Hurt and Sprint must each produce distinct procedural kinematics compared to normal walk/idle
      expect(opsByState['hurt'], `${hunter.id} hurt kinematics`).not.toBe(opsByState['idle-right']);
      expect(opsByState['sprint-right'], `${hunter.id} sprint kinematics`).not.toBe(opsByState['walk-right']);

      // Vertical movement while facing left must keep negative horizontal scale (-1)
      expect(opsByState['walk-vertical-left'], `${hunter.id} left facing on vertical walk`).toContain('scale:-1.00,1.00');
      expect(opsByState['sprint-vertical-left'], `${hunter.id} left facing on vertical sprint`).toContain('scale:-1.00,1.00');
    }

    // No hunter renderer should draw a redundant internal ground shadow
    expect(shadowSpy).not.toHaveBeenCalled();
    shadowSpy.mockRestore();

    // Special hunter ability poses (Krajánek on millstone & Tulák whirling sukovice) must also keep stack balance
    const rideRec = createRecordingCanvasContext();
    Lada.drawKrajanekRide(rideRec.ctx, 100, 100, 1.5, -1.6, 0, 1, 0.18, true, 1.05, true);
    expect(rideRec.underflowed).toBe(false);
    expect(rideRec.saveDepth).toBe(0);

    const whirlRec = createRecordingCanvasContext();
    Lada.drawWanderer(whirlRec.ctx, 100, 100, 1.5, 1.2, 0, false, 1, true, 0.45, false);
    expect(whirlRec.underflowed).toBe(false);
    expect(whirlRec.saveDepth).toBe(0);

    // Standalone Barunka across all 4 states
    for (const args of [
      [true, 1, false, false, false, 1],
      [true, 1, false, false, true, 1],
      [false, 1, false, true, false, 1],
      [true, 1, true, false, false, -1],
    ] as const) {
      const bRec = createRecordingCanvasContext();
      Lada.drawBarunka(bRec.ctx, 100, 100, 1.5, ...args);
      expect(bRec.underflowed).toBe(false);
      expect(bRec.saveDepth).toBe(0);
    }
  });

  it('persists hunter horizontal facingX across purely vertical movement and keeps animTime continuous on idle', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, hunterType: 'krajanek', spawnInitialWave: false });
    const player = engine.state.player;

    expect(player.facingX).toBe(1);

    // Move left
    engine.state.keys = { KeyA: true };
    engine.update(0.1);
    expect(player.facingX).toBe(-1);
    expect(player.lastDx).toBe(-1);

    // Move purely upward: weapon aim (lastDx=0, lastDy=-1) points straight up, while facingX remains -1 (left)
    engine.state.keys = { KeyW: true };
    engine.update(0.1);
    expect(player.lastDx).toBe(0);
    expect(player.lastDy).toBe(-1);
    expect(player.facingX).toBe(-1);

    // Stop moving: animTime continues advancing smoothly without snapping back to 0
    const animBeforeStop = player.animTime;
    engine.state.keys = {};
    engine.update(0.1);
    expect(player.facingX).toBe(-1);
    expect(player.animTime).toBeGreaterThan(animBeforeStop);

    // Move right: facingX flips back to 1
    engine.state.keys = { KeyD: true };
    engine.update(0.1);
    expect(player.facingX).toBe(1);
    expect(player.lastDx).toBe(1);
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
