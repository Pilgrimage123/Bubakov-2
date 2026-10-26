import type { DropType, GameDrop } from '../types';
import { GINGERBREAD_VALUES } from '../data/gingerbread';

export const MAX_ACTIVE_DROPS = 40;
export const SPATIAL_CELL_SIZE = 180; // 180px cell (~4m in arena units)
export const HEAVY_ANCHOR_MAGNET_MOBILITY = 0.05; // 5% magnet pull speed
export const STANDARD_MAGNET_MOBILITY = 1.0;
export const POUCH_SWEEP_RADIUS = 60; // 60px (~1.5m)
export const CONSOLIDATION_BONUS = 1.15; // +15% value bonus
export const FOOD_DROP_EXPIRATION = 25.0; // Fresh food stays for 25s before decaying

export function isHealingDrop(type: DropType): boolean {
  return type === 'potion' || type === 'bread' || type === 'pear';
}

export const DROP_TYPE_INDICES: Record<DropType, number> = {
  coin: 1,
  gingerbread: 2,
  potion: 3,
  bread: 4,
  pear: 5,
  soul: 6,
  chest: 7,
  chasnik: 8,
  horseshoe: 9,
  rooster: 10,
  cuckoo_clock: 11,
  ponocny_horn: 12,
  masopust_rattle: 13,
  babicka_apron: 14,
  slivovice_splash: 15,
  svanda_bagpipes: 16,
  kominik_button: 17,
  arcivzacny_ananas: 18,
  big_pouch: 19,
  gingerbread_stash: 20,
};

export const INDEX_TO_DROP_TYPE: DropType[] = [
  'coin', // 0 unused fallback
  'coin',
  'gingerbread',
  'potion',
  'bread',
  'pear',
  'soul',
  'chest',
  'chasnik',
  'horseshoe',
  'rooster',
  'cuckoo_clock',
  'ponocny_horn',
  'masopust_rattle',
  'babicka_apron',
  'slivovice_splash',
  'svanda_bagpipes',
  'kominik_button',
  'arcivzacny_ananas',
  'big_pouch',
  'gingerbread_stash',
];

export const FLAG_IS_HOT = 1;
export const FLAG_IS_HEAVY_ANCHOR = 2;
export const FLAG_STRESS_REFUND = 4;
export const FLAG_MERCY_DROP = 8;

export class DropBank {
  public gingerbread: number = 0;
  public coins: number = 0;
  public mercyHeals: number = 0;
  public stressRefunds: number = 0;
  public pendingKills: number = 0;

  public accumulate(type: DropType, value = 1): void {
    if (type === 'gingerbread') {
      this.gingerbread += value;
    } else if (type === 'coin') {
      this.coins += value;
    } else if (type === 'potion' || type === 'bread' || type === 'pear') {
      this.mercyHeals += value;
    } else {
      this.gingerbread += value;
    }
    this.pendingKills++;
  }

  public refundStressDrop(value: number): void {
    const refund = value * 0.5;
    this.stressRefunds += refund;
    this.gingerbread += refund;
  }

  public get totalValue(): number {
    return this.gingerbread + this.coins + this.mercyHeals;
  }

  public clear(): void {
    this.gingerbread = 0;
    this.coins = 0;
    this.mercyHeals = 0;
    this.stressRefunds = 0;
    this.pendingKills = 0;
  }
}

export interface SpawnDropParams {
  type: DropType;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  value?: number;
  radius?: number;
  size?: 'small' | 'large' | 'giant' | string;
  isHot?: boolean;
  goldenRushTimer?: number;
  expiration?: number;
  isHeavyAnchor?: boolean;
  stressPhaseRefund?: boolean;
  isMercyDrop?: boolean;
  skipConsolidation?: boolean;
  text?: string;
  textColor?: string;
}

export class SoADropManager {
  public count = 0;

  // Contiguous memory layout (Struct-of-Arrays)
  public readonly posX = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly posY = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly vx = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly vy = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly values = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly radii = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly expirations = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly times = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly goldenRushTimers = new Float32Array(MAX_ACTIVE_DROPS);
  public readonly magnetMobility = new Float32Array(MAX_ACTIVE_DROPS);

  public readonly itemTypes = new Uint8Array(MAX_ACTIVE_DROPS);
  public readonly flags = new Uint8Array(MAX_ACTIVE_DROPS);

  // Pre-allocated flyweight objects for backward-compatibility with rendering & callbacks
  public readonly flyweights: GameDrop[] = [];

  // Drop Bank (Pokladnice kořisti)
  public readonly dropBank = new DropBank();

  constructor() {
    for (let i = 0; i < MAX_ACTIVE_DROPS; i++) {
      this.flyweights.push({
        type: 'coin',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 10,
        value: 1,
        dead: true,
        magnetMobility: 1.0,
      });
    }
  }

  public clear(): void {
    this.count = 0;
    for (let i = 0; i < MAX_ACTIVE_DROPS; i++) {
      this.flyweights[i].dead = true;
    }
  }

  public syncFlyweight(i: number): void {
    const f = this.flyweights[i];
    if (i >= this.count) {
      f.dead = true;
      return;
    }
    const typeIdx = this.itemTypes[i];
    f.type = INDEX_TO_DROP_TYPE[typeIdx] || 'coin';
    f.x = this.posX[i];
    f.y = this.posY[i];
    f.vx = this.vx[i];
    f.vy = this.vy[i];
    f.radius = this.radii[i];
    f.value = this.values[i];
    f.time = this.times[i];
    f.magnetMobility = this.magnetMobility[i];
    f.expiration = this.expirations[i];
    f.dead = false;

    const fl = this.flags[i];
    f.isHot = (fl & FLAG_IS_HOT) !== 0;
    f.isHeavyAnchor = (fl & FLAG_IS_HEAVY_ANCHOR) !== 0;
    f.stressPhaseRefund = (fl & FLAG_STRESS_REFUND) !== 0;
    f.goldenRushTimer = this.goldenRushTimers[i];

    if (f.type === 'gingerbread') {
      f.size = f.value && f.value >= GINGERBREAD_VALUES.giant ? 'giant' : f.value && f.value >= GINGERBREAD_VALUES.large ? 'large' : 'small';
    }
  }

  public removeAt(index: number): void {
    if (index < 0 || index >= this.count) return;
    const last = this.count - 1;
    if (index !== last) {
      this.posX[index] = this.posX[last];
      this.posY[index] = this.posY[last];
      this.vx[index] = this.vx[last];
      this.vy[index] = this.vy[last];
      this.values[index] = this.values[last];
      this.radii[index] = this.radii[last];
      this.expirations[index] = this.expirations[last];
      this.times[index] = this.times[last];
      this.goldenRushTimers[index] = this.goldenRushTimers[last];
      this.magnetMobility[index] = this.magnetMobility[last];
      this.itemTypes[index] = this.itemTypes[last];
      this.flags[index] = this.flags[last];
    }
    this.count--;
    this.syncFlyweight(index);
    if (index !== last) {
      this.syncFlyweight(last);
    }
    this.flyweights[this.count].dead = true;
  }

  /**
   * Consolidates three compatible minor drops in the same spatial cell.
   * Returns true when the incoming drop is consumed by consolidation.
   */
  public tryConsolidateInCell(type: DropType, x: number, y: number, value: number): boolean {
    const isMinorCoin = type === 'coin' && value < 5;
    const isMinorGb = type === 'gingerbread' && value < GINGERBREAD_VALUES.large;
    if (!isMinorCoin && !isMinorGb) return false;

    const cellX = Math.floor(x / SPATIAL_CELL_SIZE);
    const cellY = Math.floor(y / SPATIAL_CELL_SIZE);
    const targetTypeIdx = DROP_TYPE_INDICES[type];

    let first = -1;
    let second = -1;
    let third = -1;
    for (let i = 0; i < this.count; i++) {
      if (this.itemTypes[i] !== targetTypeIdx) continue;
      if (Math.floor(this.posX[i] / SPATIAL_CELL_SIZE) !== cellX) continue;
      if (Math.floor(this.posY[i] / SPATIAL_CELL_SIZE) !== cellY) continue;

      const compatible = isMinorCoin
        ? this.values[i] < 5
        : this.values[i] < GINGERBREAD_VALUES.large && (this.flags[i] & FLAG_IS_HOT) === 0;
      if (!compatible) continue;
      if (first < 0) first = i;
      else if (second < 0) second = i;
      else {
        third = i;
        break;
      }
    }
    if (third < 0) return false;

    const combined = Math.round(
      (this.values[first] + this.values[second] + this.values[third]) * CONSOLIDATION_BONUS
    );

    // Store the combined value in the retained record, then remove the selected
    // companion entries in descending index order. The retained entry survives
    // even when it is at the final active slot.
    this.values[first] = combined;
    this.radii[first] = type === 'gingerbread'
      ? (combined >= GINGERBREAD_VALUES.giant ? 19 : 14)
      : 12;

    const highest = Math.max(second, third);
    const lowest = Math.min(second, third);
    this.removeAt(highest);
    this.removeAt(lowest);
    for (let i = 0; i < this.count; i++) this.syncFlyweight(i);
    return true;
  }

  /**
   * Spawns a drop in the SoA manager. If capacity is full, accumulates into DropBank.
   */
  public spawn(params: SpawnDropParams): GameDrop | null {
    // 1. In-place spatial consolidation check for minor drops
    const val = params.value ?? (params.type === 'coin' ? 1 : params.type === 'gingerbread' ? 2 : 10);
    if (!params.skipConsolidation && this.tryConsolidateInCell(params.type, params.x, params.y, val)) {
      return null;
    }

    // 2. Capacity check: if at MAX_ACTIVE_DROPS, bank value
    if (this.count >= MAX_ACTIVE_DROPS) {
      this.dropBank.accumulate(params.type, val);
      return null;
    }

    const i = this.count;
    this.posX[i] = params.x;
    this.posY[i] = params.y;
    this.vx[i] = params.vx ?? 0;
    this.vy[i] = params.vy ?? 0;
    this.values[i] = val;
    this.times[i] = Math.random() * 6.28;
    this.expirations[i] = params.expiration !== undefined
      ? params.expiration
      : (isHealingDrop(params.type) ? FOOD_DROP_EXPIRATION : -1);
    this.goldenRushTimers[i] = params.goldenRushTimer ?? 0;

    let mobility = params.isHeavyAnchor || params.type === 'big_pouch' || params.type === 'gingerbread_stash' || params.type === 'chest'
      ? HEAVY_ANCHOR_MAGNET_MOBILITY
      : STANDARD_MAGNET_MOBILITY;
    this.magnetMobility[i] = mobility;

    let rad = params.radius;
    if (!rad) {
      if (params.type === 'big_pouch') rad = 28;
      else if (params.type === 'gingerbread_stash') rad = 28;
      else if (params.type === 'chest') rad = 25;
      else if (params.type === 'horseshoe' || params.type === 'rooster' || params.type === 'cuckoo_clock') rad = 18;
      else if (params.type === 'soul') rad = 14;
      else if (params.type === 'potion') rad = 12;
      else if (params.type === 'gingerbread') {
        rad = params.size === 'giant' || val >= GINGERBREAD_VALUES.giant ? 19 : params.size === 'large' || val >= GINGERBREAD_VALUES.large ? 14 : 10;
      } else {
        rad = val >= 15 ? 12 : val >= 5 ? 10 : 8;
      }
    }
    this.radii[i] = rad;

    const typeIdx = DROP_TYPE_INDICES[params.type] || 1;
    this.itemTypes[i] = typeIdx;

    let fl = 0;
    if (params.isHot) fl |= FLAG_IS_HOT;
    if (mobility < 0.5) fl |= FLAG_IS_HEAVY_ANCHOR;
    if (params.stressPhaseRefund) fl |= FLAG_STRESS_REFUND;
    if (params.isMercyDrop) fl |= FLAG_MERCY_DROP;
    this.flags[i] = fl;

    this.count++;
    this.syncFlyweight(i);
    return this.flyweights[i];
  }

  /**
   * Cash out accumulated Drop Bank into consolidated items or Heavy Anchors.
   */
  public cashOutDropBank(anchorX: number, anchorY: number, asHeavyAnchor = false): boolean {
    if (this.dropBank.totalValue <= 0) return false;

    if (asHeavyAnchor && this.dropBank.coins >= 25 && this.count < MAX_ACTIVE_DROPS) {
      const pouchVal = this.dropBank.coins;
      this.dropBank.coins = 0;
      this.spawn({
        type: 'big_pouch',
        x: anchorX,
        y: anchorY,
        value: pouchVal,
        isHeavyAnchor: true,
      });
      return true;
    }

    if (asHeavyAnchor && this.dropBank.mercyHeals >= 15 && this.count < MAX_ACTIVE_DROPS) {
      const stashVal = this.dropBank.mercyHeals;
      this.dropBank.mercyHeals = 0;
      this.spawn({
        type: 'gingerbread_stash',
        x: anchorX,
        y: anchorY,
        value: stashVal,
        isHeavyAnchor: true,
        isMercyDrop: true,
      });
      return true;
    }

    // Standard cash out of banked gingerbread
    let spawnedAny = false;
    while (this.dropBank.gingerbread >= GINGERBREAD_VALUES.large && this.count < MAX_ACTIVE_DROPS) {
      const isGiant = this.dropBank.gingerbread >= GINGERBREAD_VALUES.giant;
      const gbVal = isGiant ? GINGERBREAD_VALUES.giant : GINGERBREAD_VALUES.large;
      this.dropBank.gingerbread -= gbVal;
      this.spawn({
        type: 'gingerbread',
        x: anchorX + (Math.random() - 0.5) * 40,
        y: anchorY + (Math.random() - 0.5) * 40,
        value: gbVal,
        size: isGiant ? 'giant' : 'large',
      });
      spawnedAny = true;
    }

    // Cash out coins
    if (this.dropBank.coins >= 10 && this.count < MAX_ACTIVE_DROPS) {
      const coinVal = this.dropBank.coins;
      this.dropBank.coins = 0;
      this.spawn({
        type: 'coin',
        x: anchorX + (Math.random() - 0.5) * 30,
        y: anchorY + (Math.random() - 0.5) * 30,
        value: coinVal,
      });
      spawnedAny = true;
    }

    return spawnedAny;
  }

  /**
   * Main simulation step for drops:
   * - Velocity & drag update
   * - Expiration check (stress drops refund 50% on timeout)
   * - Branchless magnet pull with 5% clamping for heavy anchors
   * - Distance-squared pickup loop
   * - Gravitational sweeping for Big Krejcary Pouch
   */
  public step(
    dt: number,
    player: any,
    callbacks?: {
      onPickup?: (drop: GameDrop, index: number) => void;
      onSound?: (name: string) => void;
    }
  ): void {
    const playerAlive = Boolean(player && player.hp > 0);
    const px = player?.x ?? 0;
    const py = player?.y ?? 0;
    const pickupRad = player?.pickupRadius ?? 95;
    const pickupRadSq = pickupRad * pickupRad;
    const playerBodyRad = (player?.radius ?? 16) + 14;

    const drag = Math.max(0, 1 - 7.5 * dt);

    for (let i = this.count - 1; i >= 0; i--) {
      this.times[i] += dt;

      // 1. Expirations (Stress drops refund 50%)
      if (this.expirations[i] > 0) {
        this.expirations[i] -= dt;
        if (this.expirations[i] <= 0) {
          if ((this.flags[i] & FLAG_STRESS_REFUND) !== 0) {
            this.dropBank.refundStressDrop(this.values[i]);
          }
          this.removeAt(i);
          continue;
        }
      }

      // Golden rush timer for hot gingerbread
      if (this.goldenRushTimers[i] > 0) {
        this.goldenRushTimers[i] -= dt;
        if (this.goldenRushTimers[i] <= 0) {
          this.flags[i] &= ~FLAG_IS_HOT;
        }
      }

      // 2. Physics & drag
      const vx = this.vx[i];
      const vy = this.vy[i];
      if (vx !== 0 || vy !== 0) {
        this.posX[i] += vx * dt;
        this.posY[i] += vy * dt;
        this.vx[i] *= drag;
        this.vy[i] *= drag;
      }

      // 3. Gravitational Sweeping for Big Krejcary Pouch (pohlcuje drobné krejcary v okruhu 60px)
      if (this.itemTypes[i] === DROP_TYPE_INDICES.big_pouch) {
        const pouchX = this.posX[i];
        const pouchY = this.posY[i];
        const sweepSq = POUCH_SWEEP_RADIUS * POUCH_SWEEP_RADIUS;

        for (let j = this.count - 1; j >= 0; j--) {
          if (j === i) continue;
          if (this.itemTypes[j] === DROP_TYPE_INDICES.coin && this.values[j] <= 10) {
            const cdx = this.posX[j] - pouchX;
            const cdy = this.posY[j] - pouchY;
            if (cdx * cdx + cdy * cdy <= sweepSq) {
              this.values[i] += this.values[j];
              this.removeAt(j);
              if (j < i) i--;
            }
          }
        }
      }

      // 4. Player magnet pulling & pickup (Distance-Squared queries)
      if (playerAlive) {
        const typeIdx = this.itemTypes[i];
        const itemType = INDEX_TO_DROP_TYPE[typeIdx] || 'coin';
        const canCollect = !isHealingDrop(itemType) || (player.hp < player.maxHp) || ((player.bearMaskLevel || 0) > 0);

        if (canCollect) {
          const dx = px - this.posX[i];
          const dy = py - this.posY[i];
          const distSq = dx * dx + dy * dy;

          // Magnet range
          if (distSq < pickupRadSq) {
            const dist = Math.sqrt(distSq) || 1;
            const baseSpeed = Math.max(520, (pickupRad - dist) * 7.5 + 380);
            // Branchless 5% speed clamp
            const effectiveSpeed = baseSpeed * this.magnetMobility[i] * dt;
            this.posX[i] += (dx / dist) * effectiveSpeed;
            this.posY[i] += (dy / dist) * effectiveSpeed;

            // Recalculate distance after pull
            const newDx = px - this.posX[i];
            const newDy = py - this.posY[i];
            const newDistSq = newDx * newDx + newDy * newDy;
            const collectDist = playerBodyRad + this.radii[i];

            if (newDistSq < collectDist * collectDist) {
              this.syncFlyweight(i);
              const drop = this.flyweights[i];
              callbacks?.onPickup?.(drop, i);
              this.removeAt(i);
              continue;
            }
          }
        }
      }

      this.syncFlyweight(i);
    }
  }

  /**
   * Applies a magnet wave across the active drops with 5% mobility clamp for heavy anchors.
   */
  public applyMagnetImpulse(targetX: number, targetY: number, radius = 550, fullScreen = false): number {
    let pulled = 0;
    const radiusSq = radius * radius;
    const baseSpeed = fullScreen ? 850 : 620;

    for (let i = 0; i < this.count; i++) {
      if (this.itemTypes[i] === DROP_TYPE_INDICES.chasnik) continue;
      const dx = targetX - this.posX[i];
      const dy = targetY - this.posY[i];
      const distSq = dx * dx + dy * dy;

      if (fullScreen || distSq <= radiusSq) {
        const dist = Math.sqrt(distSq) || 1;
        const impulseSpeed = baseSpeed * this.magnetMobility[i];
        this.vx[i] = (dx / dist) * impulseSpeed;
        this.vy[i] = (dy / dist) * impulseSpeed;
        pulled++;
      }
    }
    return pulled;
  }
}
