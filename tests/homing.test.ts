import { describe, expect, it, vi } from 'vitest';
import { getCachedHomingTarget, HOMING_TARGET_RESCAN_SECONDS } from '../src/game/homing';

describe('cached homing targets', () => {
  it('selects immediately, then avoids spatial selection until the 0.2 s cadence expires', () => {
    const projectile: any = {};
    const target = { x: 10, y: 0 };
    const select = vi.fn(() => target);

    expect(getCachedHomingTarget(projectile, 1 / 60, select)).toBe(target);
    for (let frame = 0; frame < 10; frame++) {
      expect(getCachedHomingTarget(projectile, 1 / 60, select)).toBe(target);
    }

    expect(select).toHaveBeenCalledTimes(1);
    expect(projectile._targetScanTimer).toBeLessThan(HOMING_TARGET_RESCAN_SECONDS);
    getCachedHomingTarget(projectile, 0.05, select);
    expect(select).toHaveBeenCalledTimes(2);
  });

  it('immediately replaces a defeated target', () => {
    const defeated = { dead: true };
    const replacement = { x: 20, y: 0 };
    const projectile: any = { _target: defeated, _targetScanTimer: 0.19 };
    const select = vi.fn(() => replacement);

    expect(getCachedHomingTarget(projectile, 1 / 60, select)).toBe(replacement);
    expect(select).toHaveBeenCalledTimes(1);
  });
});
