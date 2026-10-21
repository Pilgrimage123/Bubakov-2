export const CROW_FORAGE_SCAN_RADIUS = 260;
export const CROW_FORAGE_PICKUP_DELAY = 0.8;
const CROW_FORAGE_COOLDOWN = 4.5;
const CROW_FORAGE_LOOT_TYPES = new Set(['coin', 'gingerbread', 'bread', 'pear']);

export interface CrowForagingResult {
  active: boolean;
  vx: number;
  vy: number;
  grounded: boolean;
}

/**
 * Lets a stage-one crow swoop down to peck at nearby small loot.
 * The crow only steals coins and small food drops; combat damage remains
 * entirely independent of this cosmetic/loot behavior.
 */
export function stepCrowForaging(
  crow: any,
  drops: any[],
  dt: number,
  speed: number,
): CrowForagingResult {
  crow.crowForageCooldown = Math.max(0, (crow.crowForageCooldown || 0) - dt);
  let target = crow.crowForageTarget;

  if (target && (target.dead || target.rescued || !CROW_FORAGE_LOOT_TYPES.has(target.type))) {
    target = null;
    crow.crowForageTarget = null;
    crow.crowForageTimer = 0;
    crow.isGroundedForLoot = false;
  }

  if (!target && crow.crowForageCooldown <= 0) {
    let nearest: any = null;
    let nearestDistSq = CROW_FORAGE_SCAN_RADIUS * CROW_FORAGE_SCAN_RADIUS;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      if (!drop || drop.dead || drop.rescued || !CROW_FORAGE_LOOT_TYPES.has(drop.type)) continue;
      const dx = drop.x - crow.x;
      const dy = drop.y - crow.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq) {
        nearest = drop;
        nearestDistSq = distSq;
      }
    }
    if (nearest) {
      target = nearest;
      crow.crowForageTarget = nearest;
      crow.crowForageTimer = 0;
    }
  }

  if (!target) {
    crow.isGroundedForLoot = false;
    return { active: false, vx: 0, vy: 0, grounded: false };
  }

  const dx = target.x - crow.x;
  const dy = target.y - crow.y;
  const distance = Math.hypot(dx, dy);
  const landingDistance = Math.max(18, (target.radius || 8) + (crow.radius || 13) + 4);

  if (distance > landingDistance) {
    crow.isGroundedForLoot = false;
    crow.crowForageTimer = 0;
    return {
      active: true,
      vx: (dx / (distance || 1)) * speed * 1.35,
      vy: (dy / (distance || 1)) * speed * 1.35,
      grounded: false,
    };
  }

  crow.isGroundedForLoot = true;
  crow.crowForageTimer = (crow.crowForageTimer || 0) + dt;
  if (crow.crowForageTimer >= CROW_FORAGE_PICKUP_DELAY) {
    // Steal the drop so it cannot be collected by the hunter after the crow pecks it.
    target.dead = true;
    crow.crowForageTarget = null;
    crow.crowForageTimer = 0;
    crow.crowForageCooldown = CROW_FORAGE_COOLDOWN;
    crow.isGroundedForLoot = false;
  }

  return { active: true, vx: 0, vy: 0, grounded: crow.isGroundedForLoot };
}
