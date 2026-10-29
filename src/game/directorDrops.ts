import type { DropType } from '../types';
import { MARCH_ARENA_BOUNDS, sanitizeArenaSpawnPoint } from '../data/marchThawArena';

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
  { type: 'soul', baseWeight: 3, stressAffinity: 0.15, mercyAffinity: 0.5, scarcityMultiplier: 1.0 },
];

const DEFAULT_WEAPON_BASE_COOLDOWNS: Record<string, number> = {
  povidlove_buchty: 1.4,
  osikovy_prut: 1.05,
  hromnicka: 2.2,
  bylinkova_fajfka: 1.8,
  kovarske_vidle: 1.35,
  svecena_kropenka: 1.6,
  dreveny_cep: 1.5,
  formansky_bic: 1.3,
  kynuty_kolac: 1.9,
  devatero_kviti: 1.55,
  kovana_halapartna: 1.45,
  cesnekova_topinka: 1.7,
  snehova_koule: 1.15,
  valecnice: 1.6,
};

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

  // ResourcePct: average weapon recharge readiness (reads real w.cd as well as w.cooldownTimer) + ultimate readiness
  let weaponReadyPct = 1.0;
  if (Array.isArray(player.weapons) && player.weapons.length > 0) {
    let sumReady = 0;
    for (let i = 0; i < player.weapons.length; i++) {
      const w = player.weapons[i];
      const cd = Math.max(0, w?.cd ?? w?.cooldownTimer ?? 0);
      const rawId = typeof w?.id === 'string' ? w.id : '';
      const baseCd = Math.max(
        0.1,
        w?.baseCooldown ?? w?.localCd ?? w?.lastMaxCd ?? DEFAULT_WEAPON_BASE_COOLDOWNS[rawId] ?? 1.2
      );
      sumReady += Math.max(0, Math.min(1, 1.0 - cd / baseCd));
    }
    weaponReadyPct = sumReady / player.weapons.length;
  }

  let resourcePct = weaponReadyPct;
  if (typeof player.ultCd === 'number' && typeof player.ultMaxCd === 'number' && player.ultMaxCd > 0) {
    const ultReadyPct = Math.max(0, Math.min(1, 1.0 - player.ultCd / player.ultMaxCd));
    resourcePct = weaponReadyPct * 0.8 + ultReadyPct * 0.2;
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

export interface WeightedDropContext {
  category?: string;
  defeatedByFood?: boolean;
  bearMaskLevel?: number;
}

/**
 * Weights candidate item drops based on Vulnerability Score (V), pacing phase, active soul saturation,
 * and thematic enemy category affinity.
 */
export function selectWeightedDropType(
  v: number,
  phase: DropPacingPhase,
  mercyCooldownActive: boolean,
  activeSoulsCount = 0,
  soulBuffActive = false,
  context?: WeightedDropContext
): { type: DropType; isHot?: boolean; expiration?: number; isMercyDrop?: boolean } {
  let totalWeight = 0;
  const weights: number[] = [];
  const category = context?.category;
  const defeatedByFood = Boolean(context?.defeatedByFood);
  const hasBearMask = (context?.bearMaskLevel || 0) > 0;

  for (let i = 0; i < CANDIDATE_ITEM_PROFILES.length; i++) {
    const p = CANDIDATE_ITEM_PROFILES[i];
    let w = p.baseWeight * (1 + p.stressAffinity * Math.pow(1 - v, 2) + p.mercyAffinity * Math.pow(v, 3)) * p.scarcityMultiplier;

    // Thematic category & food-pacification affinities
    if (p.type === 'coin' && (category === 'undead' || category === 'demons')) {
      w *= 1.45;
    } else if ((p.type === 'bread' || p.type === 'pear') && (category === 'fields' || category === 'frost' || defeatedByFood)) {
      w *= defeatedByFood ? 1.8 : 1.4;
    } else if (p.type === 'potion' && category === 'water') {
      w *= 1.45;
    } else if (p.type === 'soul' && (category === 'water' || category === 'shadows' || category === 'undead' || defeatedByFood)) {
      w *= 1.35;
    }

    // Stress phase: suppress passive health drops by 80% (only 40% if hunter has Bear Mask for offensive overheal)
    if (phase === 'stress' && p.isHealing) {
      w *= hasBearMask ? 0.60 : 0.20;
    }

    // Mercy cooldown active: prevent heal spam
    if (mercyCooldownActive && p.isHealing) {
      w *= 0.15;
    }

    // Throttle soul jar selection if soul jars are already waiting in the arena or buff is active
    if (p.type === 'soul') {
      if (activeSoulsCount >= 2 || (activeSoulsCount >= 1 && soulBuffActive)) {
        w = 0;
      } else if (activeSoulsCount >= 1 || soulBuffActive) {
        w *= 0.25;
      }
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

  if (selected.type === 'soul') {
    return {
      type: 'soul',
      expiration: 16.0,
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
export const DEFAULT_TREASURE_ARENA_BOUNDS = {
  minX: MARCH_ARENA_BOUNDS.minX + 65,
  maxX: MARCH_ARENA_BOUNDS.maxX - 65,
  minY: MARCH_ARENA_BOUNDS.minY + 65,
  maxY: MARCH_ARENA_BOUNDS.maxY - 65,
};

export function sampleAnnulusPosition(
  playerX: number,
  playerY: number,
  screenW: number,
  enemies: readonly any[],
  objectiveType: 'big_pouch' | 'gingerbread_stash' | 'chest',
  arenaBounds = DEFAULT_TREASURE_ARENA_BOUNDS,
  existingDrops: readonly any[] = [],
  activeLevelId = 0,
  decor?: any[],
): { x: number; y: number; score: number } {
  const minRadius = screenW * 1.5;
  const maxRadius = screenW * 2.5;
  const ringRadius = (minRadius + maxRadius) * 0.5;

  const safeBounds = {
    minX: Math.max(DEFAULT_TREASURE_ARENA_BOUNDS.minX, arenaBounds.minX),
    maxX: Math.min(DEFAULT_TREASURE_ARENA_BOUNDS.maxX, arenaBounds.maxX),
    minY: Math.max(DEFAULT_TREASURE_ARENA_BOUNDS.minY, arenaBounds.minY),
    maxY: Math.min(DEFAULT_TREASURE_ARENA_BOUNDS.maxY, arenaBounds.maxY),
  };

  let bestX = playerX + ringRadius;
  let bestY = playerY;
  let bestScore = -Infinity;

  for (let k = 0; k < 8; k++) {
    const angle = (k * Math.PI * 2) / 8;
    const unclampedX = playerX + Math.cos(angle) * ringRadius;
    const unclampedY = playerY + Math.sin(angle) * ringRadius;
    const rawX = Math.max(safeBounds.minX, Math.min(safeBounds.maxX, unclampedX));
    const rawY = Math.max(safeBounds.minY, Math.min(safeBounds.maxY, unclampedY));
    const sanitized = sanitizeArenaSpawnPoint(rawX, rawY, 26, activeLevelId, decor, 55);
    const candX = Math.max(safeBounds.minX, Math.min(safeBounds.maxX, sanitized.x));
    const candY = Math.max(safeBounds.minY, Math.min(safeBounds.maxY, sanitized.y));

    const dist = Math.hypot(candX - playerX, candY - playerY);

    let density = 0;
    if (enemies) {
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead || e.isDefeated) continue;
        const edx = e.x - candX;
        const edy = e.y - candY;
        const udx = e.x - unclampedX;
        const udy = e.y - unclampedY;
        if (edx * edx + edy * edy <= 350 * 350 || udx * udx + udy * udy <= 350 * 350) {
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

  const finalSanitized = sanitizeArenaSpawnPoint(bestX, bestY, 26, activeLevelId, decor, 55);
  return {
    x: Math.max(safeBounds.minX, Math.min(safeBounds.maxX, finalSanitized.x)),
    y: Math.max(safeBounds.minY, Math.min(safeBounds.maxY, finalSanitized.y)),
    score: bestScore,
  };
}

