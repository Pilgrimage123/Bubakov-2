import type { DropType } from '../types';

export interface VulnerabilityWeights {
  w1_courage: number;
  w2_recentDmg: number;
  w3_resource: number;
  w4_density: number;
}

export const DEFAULT_VULNERABILITY_WEIGHTS: VulnerabilityWeights = {
  w1_courage: 0.40,
  w2_recentDmg: 0.25,
  w3_resource: 0.15,
  w4_density: 0.20,
};

export type DropPacingPhase = 'stress' | 'flow' | 'mercy';

export interface CandidateItemProfile {
  type: DropType;
  baseWeight: number;
  stressAffinity: number;
  mercyAffinity: number;
  scarcityMultiplier: number;
  isHealing?: boolean;
}

export const CANDIDATE_ITEM_PROFILES: CandidateItemProfile[] = [
  { type: 'coin', baseWeight: 35, stressAffinity: 0.6, mercyAffinity: 0.1, scarcityMultiplier: 1.0 },
  { type: 'gingerbread', baseWeight: 45, stressAffinity: 0.9, mercyAffinity: 0.3, scarcityMultiplier: 1.0 },
  { type: 'potion', baseWeight: 10, stressAffinity: 0.0, mercyAffinity: 4.0, scarcityMultiplier: 1.0, isHealing: true },
  { type: 'bread', baseWeight: 10, stressAffinity: 0.0, mercyAffinity: 3.0, scarcityMultiplier: 1.0, isHealing: true },
  { type: 'pear', baseWeight: 10, stressAffinity: 0.0, mercyAffinity: 3.0, scarcityMultiplier: 1.0, isHealing: true },
  { type: 'soul', baseWeight: 6, stressAffinity: 0.2, mercyAffinity: 0.8, scarcityMultiplier: 1.2 },
];

/**
 * Evaluates the normalized Player Vulnerability Score (V) between 0.0 (dominating) and 1.0 (critical danger).
 */
export function computeVulnerabilityScore(
  player: any,
  recentDamageInWindow: number,
  localEnemyDensity: number,
  maxDensity = 30,
  weights: VulnerabilityWeights = DEFAULT_VULNERABILITY_WEIGHTS
): number {
  if (!player) return 0.5;

  const maxHp = player.maxHp || 100;
  const currentHp = Math.max(0, player.hp ?? maxHp);
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const hpDeficit = 1.0 - hpRatio;

  const dmgRatio = Math.max(0, Math.min(1, recentDamageInWindow / maxHp));

  // ResourcePct: average weapon recharge readiness
  let resourcePct = 1.0;
  if (Array.isArray(player.weapons) && player.weapons.length > 0) {
    let sumReady = 0;
    for (let i = 0; i < player.weapons.length; i++) {
      const w = player.weapons[i];
      const cd = w?.cooldownTimer ?? 0;
      const baseCd = w?.baseCooldown ?? 1;
      sumReady += Math.max(0, Math.min(1, 1.0 - cd / (baseCd || 1)));
    }
    resourcePct = sumReady / player.weapons.length;
  }
  const resourceDeficit = 1.0 - resourcePct;

  const densityRatio = Math.max(0, Math.min(1, localEnemyDensity / maxDensity));

  const rawV =
    weights.w1_courage * hpDeficit +
    weights.w2_recentDmg * dmgRatio +
    weights.w3_resource * resourceDeficit +
    weights.w4_density * densityRatio;

  return Math.max(0, Math.min(1, rawV));
}

/**
 * Returns current pacing phase based on V score.
 */
export function getDropPacingPhase(v: number): DropPacingPhase {
  if (v < 0.35) return 'stress';
  if (v <= 0.70) return 'flow';
  return 'mercy';
}

/**
 * Weights candidate item drops based on Vulnerability Score (V) and pacing phase.
 */
export function selectWeightedDropType(
  v: number,
  phase: DropPacingPhase,
  mercyCooldownActive: boolean
): { type: DropType; isHot?: boolean; expiration?: number; isMercyDrop?: boolean } {
  let totalWeight = 0;
  const weights: number[] = [];

  for (let i = 0; i < CANDIDATE_ITEM_PROFILES.length; i++) {
    const p = CANDIDATE_ITEM_PROFILES[i];
    let w = p.baseWeight * (1 + p.stressAffinity * Math.pow(1 - v, 2) + p.mercyAffinity * Math.pow(v, 3)) * p.scarcityMultiplier;

    // Stress phase: suppress passive health drops by 80%
    if (phase === 'stress' && p.isHealing) {
      w *= 0.20;
    }

    // Mercy cooldown active: prevent heal spam
    if (mercyCooldownActive && p.isHealing) {
      w *= 0.15;
    }

    weights.push(w);
    totalWeight += w;
  }

  let roll = Math.random() * totalWeight;
  let selected = CANDIDATE_ITEM_PROFILES[0];
  for (let i = 0; i < CANDIDATE_ITEM_PROFILES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      selected = CANDIDATE_ITEM_PROFILES[i];
      break;
    }
  }

  // Stress Phase volatile buff: if gingerbread in stress, 50% chance to be volatile (4-6s decay, 2x value)
  if (phase === 'stress' && selected.type === 'gingerbread') {
    const isVolatile = Math.random() < 0.50;
    if (isVolatile) {
      const decaySec = 4.0 + Math.random() * 2.0;
      return {
        type: 'gingerbread',
        isHot: true,
        expiration: decaySec,
      };
    }
  }

  // Mercy Phase rescue drop
  if (phase === 'mercy' && selected.isHealing) {
    return {
      type: selected.type,
      isMercyDrop: true,
    };
  }

  return { type: selected.type };
}

/**
 * 5-second ring buffer tracking player displacement to detect camping (<200px in 5s).
 */
export class CampingDetector {
  public static readonly INTERVAL = 1.0;
  public static readonly CAPACITY = 5;
  public static readonly DISPLACEMENT_THRESHOLD = 200; // 200px (~6m)

  private readonly samples: { x: number; y: number }[] = [];
  private timer = 0;

  public reset(x = 0, y = 0): void {
    this.samples.length = 0;
    this.samples.push({ x, y });
    this.timer = 0;
  }

  public update(dt: number, x: number, y: number): boolean {
    this.timer += dt;
    if (this.timer >= CampingDetector.INTERVAL) {
      this.timer -= CampingDetector.INTERVAL;
      this.samples.push({ x, y });
      if (this.samples.length > CampingDetector.CAPACITY) {
        this.samples.shift();
      }
    }
    return this.isCamping();
  }

  public isCamping(): boolean {
    if (this.samples.length < CampingDetector.CAPACITY) return false;
    const oldest = this.samples[0];
    const latest = this.samples[this.samples.length - 1];
    const dx = latest.x - oldest.x;
    const dy = latest.y - oldest.y;
    return Math.hypot(dx, dy) < CampingDetector.DISPLACEMENT_THRESHOLD;
  }

  public getNetDisplacement(): number {
    if (this.samples.length < 2) return 999;
    const oldest = this.samples[0];
    const latest = this.samples[this.samples.length - 1];
    return Math.hypot(latest.x - oldest.x, latest.y - oldest.y);
  }
}

/**
 * Off-Screen Annulus Placement:
 * Samples 8 candidate cells in a ring 1.5x to 2.5x screen-widths away from player.
 * Scores cells:
 * - Krejcary Pouch & Chest: DistanceFromPlayer + EnemyDensity (lure through danger)
 * - Gingerbread Košík: DistanceFromPlayer - EnemyDensity (guide to open escape corridor)
 */
export function sampleAnnulusPosition(
  playerX: number,
  playerY: number,
  screenW: number,
  enemies: readonly any[],
  objectiveType: 'big_pouch' | 'gingerbread_stash' | 'chest',
  arenaBounds = { minX: -2200, maxX: 2200, minY: -2200, maxY: 2200 },
  existingDrops: readonly any[] = []
): { x: number; y: number; score: number } {
  const minRadius = screenW * 1.5;
  const maxRadius = screenW * 2.5;
  const ringRadius = (minRadius + maxRadius) * 0.5;

  let bestX = playerX + ringRadius;
  let bestY = playerY;
  let bestScore = -Infinity;

  for (let k = 0; k < 8; k++) {
    const angle = (k * Math.PI * 2) / 8;
    const candX = Math.max(arenaBounds.minX, Math.min(arenaBounds.maxX, playerX + Math.cos(angle) * ringRadius));
    const candY = Math.max(arenaBounds.minY, Math.min(arenaBounds.maxY, playerY + Math.sin(angle) * ringRadius));

    const dist = Math.hypot(candX - playerX, candY - playerY);

    let density = 0;
    if (enemies) {
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || e.isDefeated) continue;
        const edx = e.x - candX;
        const edy = e.y - candY;
        if (edx * edx + edy * edy <= 350 * 350) {
          density++;
        }
      }
    }

    let score = dist;
    if (objectiveType === 'gingerbread_stash') {
      score = dist - density * 500;
    } else {
      score = dist + density * 500;
    }

    // Proximity penalty against stacking treasures/anchors in the same spot
    if (existingDrops) {
      for (let j = 0; j < existingDrops.length; j++) {
        const d = existingDrops[j];
        if (!d || d.dead) continue;
        const ddx = d.x - candX;
        const ddy = d.y - candY;
        if (ddx * ddx + ddy * ddy <= 300 * 300) {
          score -= 50000;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestX = candX;
      bestY = candY;
    }
  }

  return { x: bestX, y: bestY, score: bestScore };
}
