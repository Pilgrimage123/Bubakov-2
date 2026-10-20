/** The target query is expensive; steering itself still runs every simulation step. */
export const HOMING_TARGET_RESCAN_SECONDS = 0.2;

export interface HomingProjectile {
  _target?: any;
  _targetScanTimer?: number;
}

function isInvalidTarget(target: any): boolean {
  return !target || target.isDefeated === true || target.dead === true;
}

/**
 * Keeps a valid target between spatial queries and refreshes it at most at 5 Hz.
 * The selector is deliberately supplied by the caller because production and
 * headless engines have different target-selection rules.
 */
export function getCachedHomingTarget<T>(
  projectile: HomingProjectile,
  dt: number,
  selectTarget: () => T | null,
): T | null {
  const target = projectile._target;
  const remaining = (projectile._targetScanTimer ?? 0) - dt;
  if (isInvalidTarget(target) || remaining <= 0) {
    const nextTarget = selectTarget();
    projectile._target = nextTarget;
    projectile._targetScanTimer = HOMING_TARGET_RESCAN_SECONDS;
    return nextTarget;
  }

  projectile._targetScanTimer = remaining;
  return target as T;
}
