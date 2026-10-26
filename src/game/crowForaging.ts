import { spawnDropWithLimit, type PendingDropBank, type SwarmDropReservoir } from './drops';
import type { SoADropManager } from './soaDropManager';

export const CROW_FORAGE_SCAN_RADIUS = 320;
export const CROW_FORAGE_PICKUP_DELAY = 1.5;
export const CROW_FORAGE_PULL_RADIUS = 65;
export const CROW_FORAGE_COOLDOWN = 4.5;
export const CROW_ESCAPE_SPEED_MULTIPLIER = 1.65;
export const CROW_ESCAPE_DISTANCE = 540;

export const CROW_FORAGE_LOOT_TYPES = new Set([
  'coin',
  'gingerbread',
  'bread',
  'pear',
  'potion',
  'big_pouch',
  'gingerbread_stash',
]);

export interface StolenLootItem {
  type: string;
  value: number;
  size?: string;
  isHot?: boolean;
  goldenRushTimer?: number;
  radius?: number;
  isMercyDrop?: boolean;
}

export interface StolenDropDeductionSummary {
  totalItems: number;
  coins: number;
  gingerbread: number;
  heals: number;
  bankCoinsDeducted: number;
  bankGingerbreadDeducted: number;
  bankHealsDeducted: number;
}

export interface CrowForagingContext {
  player?: { x: number; y: number } | null;
  camera?: { x: number; y: number } | null;
  viewWidth?: number;
  viewHeight?: number;
  pendingDropBank?: PendingDropBank | null;
  swarmReservoir?: SwarmDropReservoir | null;
  soaDropManager?: SoADropManager | null;
  dynamicDropLedger?: {
    stolenCoins?: number;
    stolenGingerbread?: number;
    stolenHeals?: number;
    stolenItemsCount?: number;
  } | null;
  onEscape?: (crow: any, summary: StolenDropDeductionSummary) => void;
  onBundlePacked?: (crow: any, items: StolenLootItem[]) => void;
}

export interface CrowForagingResult {
  active: boolean;
  vx: number;
  vy: number;
  grounded: boolean;
  carryingBundle?: boolean;
  escaped?: boolean;
  deducted?: StolenDropDeductionSummary;
}

/**
 * Returns true only for standalone (non-flock, non-miniboss, non-boss) crows
 * that can land on the ground to forage item piles.
 */
export function isStandaloneForagingCrow(crow: any): boolean {
  if (!crow || crow.id !== 'vrana') return false;
  if (
    crow.isVirtualCrowMember ||
    crow.isMinibossFlockMember ||
    crow.isMiniboss ||
    crow.isBoss ||
    crow.isSwarmMember
  ) {
    return false;
  }
  return true;
}

function isEligibleLootDrop(drop: any): boolean {
  return Boolean(drop && !drop.dead && !drop.rescued && CROW_FORAGE_LOOT_TYPES.has(drop.type));
}

function getDropClusterWeight(drop: any): number {
  if (!drop) return 0;
  if (drop.type === 'big_pouch' || drop.type === 'gingerbread_stash') {
    return Math.max(10, Number(drop.value) || 25);
  }
  if (drop.size === 'giant') {
    return Math.max(6, Number(drop.value) || 20);
  }
  if (drop.size === 'large' || drop.type === 'potion') {
    return Math.max(3, Number(drop.value) || 6);
  }
  return Math.max(1, Number(drop.value) || 1);
}

/**
 * Finds the nearest larger pile/cluster of items within CROW_FORAGE_SCAN_RADIUS.
 * A "larger pile" is any cluster with >= 2 items within 65px, or a consolidated /
 * multi-value pile (weight >= 3, large/giant gingerbread, big_pouch, gingerbread_stash).
 * Falls back to the nearest single loot item only when no larger pile exists in range.
 */
export function findNearestLootPileTarget(crow: any, drops: any[]): any | null {
  if (!crow || !Array.isArray(drops) || drops.length === 0) return null;

  const scanSq = CROW_FORAGE_SCAN_RADIUS * CROW_FORAGE_SCAN_RADIUS;
  const pullSq = CROW_FORAGE_PULL_RADIUS * CROW_FORAGE_PULL_RADIUS;

  let bestLargerPileDrop: any = null;
  let bestLargerPileDistSq = Infinity;
  let bestLargerPileWeight = 0;

  let nearestSingleDrop: any = null;
  let nearestSingleDistSq = scanSq;

  for (let i = 0; i < drops.length; i++) {
    const candidate = drops[i];
    if (!isEligibleLootDrop(candidate)) continue;

    const dxCrow = candidate.x - crow.x;
    const dyCrow = candidate.y - crow.y;
    const distSqCrow = dxCrow * dxCrow + dyCrow * dyCrow;
    if (distSqCrow > scanSq) continue;

    if (distSqCrow < nearestSingleDistSq) {
      nearestSingleDistSq = distSqCrow;
      nearestSingleDrop = candidate;
    }

    let clusterCount = 0;
    let clusterWeight = 0;
    for (let j = 0; j < drops.length; j++) {
      const other = drops[j];
      if (!isEligibleLootDrop(other)) continue;
      const dx = other.x - candidate.x;
      const dy = other.y - candidate.y;
      if (dx * dx + dy * dy <= pullSq) {
        clusterCount++;
        clusterWeight += getDropClusterWeight(other);
      }
    }

    const isLargerPile =
      clusterCount >= 2 ||
      clusterWeight >= 3 ||
      Boolean(candidate.isConsolidated) ||
      candidate.type === 'big_pouch' ||
      candidate.type === 'gingerbread_stash' ||
      candidate.size === 'large' ||
      candidate.size === 'giant';

    if (isLargerPile) {
      // Pick the nearest larger pile; break close distance ties (~18px) in favor of heavier piles
      const isMuchCloser = distSqCrow + 324 < bestLargerPileDistSq;
      const isSimilarDistButBigger =
        Math.abs(distSqCrow - bestLargerPileDistSq) <= 324 && clusterWeight > bestLargerPileWeight;
      if (!bestLargerPileDrop || isMuchCloser || isSimilarDistButBigger) {
        bestLargerPileDrop = candidate;
        bestLargerPileDistSq = distSqCrow;
        bestLargerPileWeight = clusterWeight;
      }
    }
  }

  return bestLargerPileDrop ?? nearestSingleDrop;
}

/**
 * Permanently deducts the stolen bundle items from the dynamic drop system
 * (PendingDropBank, SwarmDropReservoir, SoADropManager DropBank, and ledger)
 * when a thief crow escapes off-screen with its bundle.
 */
export function deductStolenBundleFromDynamicDropSystem(
  bundle: StolenLootItem[] | undefined | null,
  context?: CrowForagingContext,
): StolenDropDeductionSummary {
  const summary: StolenDropDeductionSummary = {
    totalItems: 0,
    coins: 0,
    gingerbread: 0,
    heals: 0,
    bankCoinsDeducted: 0,
    bankGingerbreadDeducted: 0,
    bankHealsDeducted: 0,
  };

  if (!Array.isArray(bundle) || bundle.length === 0) {
    return summary;
  }

  for (let i = 0; i < bundle.length; i++) {
    const item = bundle[i];
    if (!item) continue;
    summary.totalItems++;
    const val = Math.max(1, Number(item.value) || 1);
    if (item.type === 'coin' || item.type === 'big_pouch') {
      summary.coins += val;
    } else if (item.type === 'gingerbread' || item.type === 'gingerbread_stash') {
      const mult = item.isHot && (item.goldenRushTimer === undefined || item.goldenRushTimer > 0) ? 2 : 1;
      summary.gingerbread += val * mult;
    } else if (item.type === 'bread' || item.type === 'pear' || item.type === 'potion') {
      summary.heals += 1;
    }
  }

  // 1. Smartly deduct from PendingDropBank (both bucketed byKey and direct numeric fields if present)
  const pendingBank: any = context?.pendingDropBank;
  if (pendingBank) {
    if (pendingBank.byKey && typeof pendingBank.byKey === 'object') {
      const deductBucketValue = (keys: string[], amount: number): number => {
        let remaining = amount;
        let deductedTotal = 0;
        for (const key of keys) {
          const bucket = pendingBank.byKey[key];
          if (!bucket || remaining <= 0) continue;
          if (bucket.hasValue && bucket.totalValue > 0) {
            const d = Math.min(bucket.totalValue, remaining);
            bucket.totalValue -= d;
            remaining -= d;
            deductedTotal += d;
            if (bucket.totalValue <= 0) {
              delete pendingBank.byKey[key];
            }
          } else if (bucket.count > 0) {
            const d = Math.min(bucket.count, remaining);
            bucket.count -= d;
            remaining -= d;
            deductedTotal += d;
            if (bucket.count <= 0) {
              delete pendingBank.byKey[key];
            }
          }
        }
        return deductedTotal;
      };
      if (summary.coins > 0) {
        summary.bankCoinsDeducted += deductBucketValue(['coin', 'heavy_coin', 'big_pouch'], summary.coins);
      }
      if (summary.gingerbread > 0) {
        summary.bankGingerbreadDeducted += deductBucketValue(
          ['gingerbread', 'hot_gingerbread', 'heavy_gingerbread', 'gingerbread_stash'],
          summary.gingerbread,
        );
      }
      if (summary.heals > 0) {
        summary.bankHealsDeducted += deductBucketValue(
          ['bread', 'pear', 'potion', 'mercy_bread', 'mercy_pear', 'mercy_potion'],
          summary.heals,
        );
      }
    }
    if (summary.coins > 0 && typeof pendingBank.coins === 'number' && pendingBank.coins > 0) {
      const deduct = Math.min(pendingBank.coins, summary.coins);
      pendingBank.coins -= deduct;
      summary.bankCoinsDeducted += deduct;
    }
    if (summary.gingerbread > 0 && typeof pendingBank.gingerbread === 'number' && pendingBank.gingerbread > 0) {
      const deduct = Math.min(pendingBank.gingerbread, summary.gingerbread);
      pendingBank.gingerbread -= deduct;
      summary.bankGingerbreadDeducted += deduct;
    }
    if (summary.heals > 0 && Array.isArray(pendingBank.heals) && pendingBank.heals.length > 0) {
      const deduct = Math.min(pendingBank.heals.length, summary.heals);
      pendingBank.heals.splice(0, deduct);
      summary.bankHealsDeducted += deduct;
    }
  }

  // 2. Smartly deduct from SwarmDropReservoir if any swarm drops are buffered
  const reservoir = context?.swarmReservoir;
  if (reservoir) {
    if (summary.coins > 0 && reservoir.coins > 0) {
      const deduct = Math.min(reservoir.coins, summary.coins);
      reservoir.coins -= deduct;
      summary.bankCoinsDeducted += deduct;
    }
    if (summary.gingerbread > 0 && reservoir.gingerbread > 0) {
      const deduct = Math.min(reservoir.gingerbread, summary.gingerbread);
      reservoir.gingerbread -= deduct;
      summary.bankGingerbreadDeducted += deduct;
    }
  }

  // 3. Smartly deduct from SoADropManager's DropBank if present
  const soaBank = context?.soaDropManager?.dropBank;
  if (soaBank) {
    if (summary.coins > 0 && soaBank.coins > 0) {
      const deduct = Math.min(soaBank.coins, summary.coins);
      soaBank.coins -= deduct;
      summary.bankCoinsDeducted += deduct;
    }
    if (summary.gingerbread > 0 && soaBank.gingerbread > 0) {
      const deduct = Math.min(soaBank.gingerbread, summary.gingerbread);
      soaBank.gingerbread -= deduct;
      summary.bankGingerbreadDeducted += deduct;
    }
    if (summary.heals > 0 && soaBank.mercyHeals > 0) {
      const deduct = Math.min(soaBank.mercyHeals, summary.heals);
      soaBank.mercyHeals -= deduct;
      summary.bankHealsDeducted += deduct;
    }
  }

  // 4. Record permanent loss in dynamic drop ledger
  const ledger = context?.dynamicDropLedger;
  if (ledger) {
    ledger.stolenCoins = (ledger.stolenCoins || 0) + summary.coins;
    ledger.stolenGingerbread = (ledger.stolenGingerbread || 0) + summary.gingerbread;
    ledger.stolenHeals = (ledger.stolenHeals || 0) + summary.heals;
    ledger.stolenItemsCount = (ledger.stolenItemsCount || 0) + summary.totalItems;
  }

  return summary;
}

/**
 * If the hunter defeats a thief crow before it escapes off-screen, drops the
 * stolen items from its cloth bundle back onto the ground.
 */
export function restoreStolenBundleDrops(
  crow: any,
  drops: any[],
  pendingDropBank?: PendingDropBank | null,
): number {
  if (!crow || !Array.isArray(crow.carryingLootBundle) || crow.carryingLootBundle.length === 0) {
    return 0;
  }
  const bundle: StolenLootItem[] = crow.carryingLootBundle;
  let restored = 0;
  for (let i = 0; i < bundle.length; i++) {
    const item = bundle[i];
    if (!item) continue;
    const ang = (i / Math.max(1, bundle.length)) * Math.PI * 2;
    const dist = 6 + (i % 3) * 5;
    const dropObj: any = {
      type: item.type,
      value: item.value,
      size: item.size,
      isHot: item.isHot,
      goldenRushTimer: item.goldenRushTimer,
      radius: item.radius || 10,
      isMercyDrop: item.isMercyDrop,
      x: crow.x + Math.cos(ang) * dist,
      y: crow.y + Math.sin(ang) * dist,
      vx: Math.cos(ang) * 45,
      vy: Math.sin(ang) * 45,
      time: 0,
      dead: false,
    };
    if (pendingDropBank) {
      spawnDropWithLimit(drops as any, dropObj, pendingDropBank);
    } else {
      drops.push(dropObj);
    }
    restored++;
  }
  crow.carryingLootBundle = [];
  crow.isCarryingLootBundle = false;
  return restored;
}

function hasCrowEscapedOffscreen(crow: any, context?: CrowForagingContext): boolean {
  if ((crow.crowEscapeTimer || 0) >= 2.8) {
    return true;
  }
  if (
    context?.camera &&
    typeof context.viewWidth === 'number' &&
    typeof context.viewHeight === 'number' &&
    context.viewWidth > 0 &&
    context.viewHeight > 0
  ) {
    const margin = 65;
    if (
      crow.x < context.camera.x - margin ||
      crow.x > context.camera.x + context.viewWidth + margin ||
      crow.y < context.camera.y - margin ||
      crow.y > context.camera.y + context.viewHeight + margin
    ) {
      return true;
    }
  }
  if (context?.player) {
    const distToPlayer = Math.hypot(crow.x - context.player.x, crow.y - context.player.y);
    if (distToPlayer >= CROW_ESCAPE_DISTANCE) {
      return true;
    }
  }
  return false;
}

/**
 * Lets a non-flock crow locate the nearest larger pile of loot, land on the ground
 * (using drawStageCrowGround), wait 1.5s while pulling items within 65px, pack them
 * into a cloth bundle (uzlíček), and fly rapidly off-screen. If it escapes off-screen,
 * the player permanently loses those items (smartly deducted from the dynamic drop system).
 */
export function stepCrowForaging(
  crow: any,
  drops: any[],
  dt: number,
  speed: number,
  context?: CrowForagingContext,
): CrowForagingResult {
  if (!isStandaloneForagingCrow(crow)) {
    if (crow) {
      crow.isGroundedForLoot = false;
      crow.isFlying = true;
    }
    return { active: false, vx: 0, vy: 0, grounded: false };
  }

  // 1. If already carrying a stolen bundle (uzlíček), fly rapidly off-screen!
  if (crow.isCarryingLootBundle && Array.isArray(crow.carryingLootBundle) && crow.carryingLootBundle.length > 0) {
    crow.isGroundedForLoot = false;
    crow.isFlying = true;
    crow.crowEscapeTimer = (crow.crowEscapeTimer || 0) + dt;

    let dirX = Number(crow.escapeDirX);
    let dirY = Number(crow.escapeDirY);
    if (!Number.isFinite(dirX) || !Number.isFinite(dirY) || Math.hypot(dirX, dirY) < 0.01) {
      if (context?.player) {
        const dx = crow.x - context.player.x;
        const dy = crow.y - context.player.y;
        const len = Math.hypot(dx, dy) || 1;
        dirX = dx / len;
        dirY = dy / len;
      } else {
        dirX = 1;
        dirY = -0.35;
        const len = Math.hypot(dirX, dirY);
        dirX /= len;
        dirY /= len;
      }
      crow.escapeDirX = dirX;
      crow.escapeDirY = dirY;
    }

    const escapeSpeed = speed * CROW_ESCAPE_SPEED_MULTIPLIER;
    const vx = dirX * escapeSpeed;
    const vy = dirY * escapeSpeed;

    if (hasCrowEscapedOffscreen(crow, context)) {
      const deducted = deductStolenBundleFromDynamicDropSystem(crow.carryingLootBundle, context);
      crow.carryingLootBundle = [];
      crow.isCarryingLootBundle = false;
      crow.escapedWithLoot = true;
      crow.stolenLootSummary = deducted;
      crow.dead = true;
      crow.isDefeated = true;
      context?.onEscape?.(crow, deducted);
      return {
        active: true,
        vx,
        vy,
        grounded: false,
        carryingBundle: false,
        escaped: true,
        deducted,
      };
    }

    return {
      active: true,
      vx,
      vy,
      grounded: false,
      carryingBundle: true,
      escaped: false,
    };
  }

  crow.crowForageCooldown = Math.max(0, (crow.crowForageCooldown || 0) - dt);
  let target = crow.crowForageTarget;

  if (target && !isEligibleLootDrop(target)) {
    // If the primary target drop disappeared while the crow is already grounded,
    // check if another eligible drop is still within the 65px pull radius.
    let replacement: any = null;
    if (crow.isGroundedForLoot) {
      const pullSq = CROW_FORAGE_PULL_RADIUS * CROW_FORAGE_PULL_RADIUS;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        if (!isEligibleLootDrop(d)) continue;
        const dx = d.x - crow.x;
        const dy = d.y - crow.y;
        if (dx * dx + dy * dy <= pullSq) {
          replacement = d;
          break;
        }
      }
    }
    if (replacement) {
      target = replacement;
      crow.crowForageTarget = replacement;
    } else {
      target = null;
      crow.crowForageTarget = null;
      crow.crowForageTimer = 0;
      crow.isGroundedForLoot = false;
      crow.isFlying = true;
    }
  }

  if (!target && crow.crowForageCooldown <= 0) {
    const nearestPile = findNearestLootPileTarget(crow, drops);
    if (nearestPile) {
      target = nearestPile;
      crow.crowForageTarget = nearestPile;
      crow.crowForageTimer = 0;
    }
  }

  if (!target) {
    crow.isGroundedForLoot = false;
    crow.isFlying = true;
    return { active: false, vx: 0, vy: 0, grounded: false };
  }

  const dx = target.x - crow.x;
  const dy = target.y - crow.y;
  const distance = Math.hypot(dx, dy);
  const landingDistance = Math.max(18, (target.radius || 8) + (crow.radius || 13) + 4);

  if (!crow.isGroundedForLoot && distance > landingDistance) {
    crow.isGroundedForLoot = false;
    crow.isFlying = true;
    crow.crowForageTimer = 0;
    return {
      active: true,
      vx: (dx / (distance || 1)) * speed * 1.35,
      vy: (dy / (distance || 1)) * speed * 1.35,
      grounded: false,
    };
  }

  // Landed on the pile! Switch to grounded state (uses drawStageCrowGround sprite)
  crow.isGroundedForLoot = true;
  crow.isFlying = false;
  crow.crowForageTimer = (crow.crowForageTimer || 0) + dt;

  // Gently tug items within 65px toward the crow while it packs its bundle
  const pullSq = CROW_FORAGE_PULL_RADIUS * CROW_FORAGE_PULL_RADIUS;
  const pullStrength = Math.min(1, crow.crowForageTimer / CROW_FORAGE_PICKUP_DELAY);
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!isEligibleLootDrop(d)) continue;
    const pdx = crow.x - d.x;
    const pdy = crow.y - d.y;
    const pDistSq = pdx * pdx + pdy * pdy;
    if (pDistSq > 1 && pDistSq <= pullSq) {
      const pDist = Math.sqrt(pDistSq);
      const step = Math.min(pDist, (45 + 115 * pullStrength) * dt);
      d.x += (pdx / pDist) * step;
      d.y += (pdy / pDist) * step;
    }
  }

  // After 1.5s on the ground, pull in all items within 65px and take off with the bundle!
  if (crow.crowForageTimer >= CROW_FORAGE_PICKUP_DELAY) {
    const stolenItems: StolenLootItem[] = [];
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      if (!isEligibleLootDrop(d)) continue;
      const pdx = d.x - crow.x;
      const pdy = d.y - crow.y;
      if (d === target || pdx * pdx + pdy * pdy <= pullSq) {
        d.x = crow.x;
        d.y = crow.y;
        d.dead = true;
        d.stolenByCrow = true;
        stolenItems.push({
          type: d.type,
          value: Math.max(1, Number(d.value) || 1),
          size: d.size,
          isHot: d.isHot,
          goldenRushTimer: d.goldenRushTimer,
          radius: d.radius,
          isMercyDrop: d.isMercyDrop,
        });
      }
    }

    crow.crowForageTarget = null;
    crow.crowForageTimer = 0;
    crow.crowForageCooldown = CROW_FORAGE_COOLDOWN;
    crow.isGroundedForLoot = false;
    crow.isFlying = true;

    if (stolenItems.length > 0) {
      crow.carryingLootBundle = stolenItems;
      crow.isCarryingLootBundle = true;
      crow.crowEscapeTimer = 0;

      if (context?.player) {
        const awayX = crow.x - context.player.x;
        const awayY = crow.y - context.player.y;
        const len = Math.hypot(awayX, awayY) || 1;
        crow.escapeDirX = awayX / len;
        crow.escapeDirY = awayY / len;
      } else {
        const len = Math.hypot(crow.x || 1, crow.y || -0.35) || 1;
        crow.escapeDirX = (crow.x || 1) / len;
        crow.escapeDirY = (crow.y || -0.35) / len;
      }

      context?.onBundlePacked?.(crow, stolenItems);

      const escapeSpeed = speed * CROW_ESCAPE_SPEED_MULTIPLIER;
      return {
        active: true,
        vx: crow.escapeDirX * escapeSpeed,
        vy: crow.escapeDirY * escapeSpeed,
        grounded: false,
        carryingBundle: true,
        escaped: false,
      };
    }
  }

  return {
    active: true,
    vx: 0,
    vy: 0,
    grounded: crow.isGroundedForLoot,
    carryingBundle: false,
    escaped: false,
  };
}

