/**
 * Mrazivý skřítek's frost aura affects nearby healing as well as cold damage.
 * Each active skřítek within aura range reduces received healing by 20 percentage
 * points; the penalty stacks additively and is capped at 100%.
 */
export const FROSTLING_AURA_BASE_RADIUS = 78;
export const FROSTLING_AURA_RANGE_MULTIPLIER = 1.55;
export const FROSTLING_AURA_RADIUS = FROSTLING_AURA_BASE_RADIUS * FROSTLING_AURA_RANGE_MULTIPLIER;

export interface FrostAuraEnemy {
  id: string;
  x: number;
  y: number;
  dead?: boolean;
  isDefeated?: boolean;
}

export interface FrostAuraTarget {
  x: number;
  y: number;
}

export function getFrostAuraHealingMultiplier(
  target: FrostAuraTarget,
  enemies: readonly FrostAuraEnemy[]
): number {
  let nearbyFrostlings = 0;
  const radiusSq = FROSTLING_AURA_RADIUS * FROSTLING_AURA_RADIUS;

  for (const enemy of enemies) {
    if (enemy.id !== 'mrazovy_skritek' || enemy.dead || enemy.isDefeated) continue;
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    if (dx * dx + dy * dy <= radiusSq) nearbyFrostlings += 1;
  }

  return Math.max(0, 1 - nearbyFrostlings * 0.2);
}
