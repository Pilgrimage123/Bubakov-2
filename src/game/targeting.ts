export const JEZINKA_DIRECT_TARGET_RANGE = 100;

/**
 * Direct/auto-targeting cannot lock onto the semi-transparent Frost Jezinka
 * beyond 100 px from the hunter. This does not affect hit collision or AoE
 * damage: those systems should still call takeDamage normally.
 */
export function isDirectTargetable(enemy: any, hunter: any): boolean {
  if (!enemy || enemy.isDefeated === true || enemy.dead === true) return false;
  if (enemy.id !== 'jezinka_mraziva') return true;
  if (!hunter || !Number.isFinite(hunter.x) || !Number.isFinite(hunter.y)) return false;

  const dx = enemy.x - hunter.x;
  const dy = enemy.y - hunter.y;
  return dx * dx + dy * dy <= JEZINKA_DIRECT_TARGET_RANGE * JEZINKA_DIRECT_TARGET_RANGE;
}
