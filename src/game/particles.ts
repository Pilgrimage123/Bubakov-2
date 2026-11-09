/**
 * Profile-controlled particle emissions and entity budget management.
 *
 * Implements centralized tryEmitParticle with profile-aware pre-allocation checks
 * to prevent heap allocations in hot combat paths.
 *
 * Plan: docs/plans/arena-performance-implementation-plan.md (Section 4)
 */

import { getRandomLadaComicPopup, getLadaArtSettings } from './ladaArtSettings';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife?: number;
  size?: number;
  color?: string;
  alpha?: number;
  text?: string;
  textColor?: string;
  isComicPopup?: boolean;
  bg?: string;
  [key: string]: any;
}

export const PARTICLE_BUDGETS = {
  performance: 60,
  balanced: 120,
  fidelity: 250,
} as const;

export function getParticleLimit(profile?: string): number {
  if (profile === 'performance') return PARTICLE_BUDGETS.performance;
  if (profile === 'fidelity') return PARTICLE_BUDGETS.fidelity;
  return PARTICLE_BUDGETS.balanced;
}

/**
 * Centrally controlled particle emission with profile-aware pre-allocation checks.
 * If the current particle count exceeds the budget, the factory is not even called,
 * preventing object allocation entirely in hot combat paths.
 */
export function tryEmitParticle(
  particles: Particle[],
  factoryOrParticle: Particle | (() => Particle),
  profile?: string,
  force = false
): boolean {
  const limit = getParticleLimit(profile);
  if (!force && particles.length >= limit) {
    return false;
  }
  const p = typeof factoryOrParticle === 'function' ? factoryOrParticle() : factoryOrParticle;
  particles.push(p);
  return true;
}

/**
 * Emits multiple particles while respecting the remaining budget.
 * Bails out early as soon as the profile budget is met.
 */
export function tryEmitParticleBurst(
  particles: Particle[],
  count: number,
  factory: (index: number) => Particle,
  profile?: string,
  force = false
): number {
  const limit = getParticleLimit(profile);
  let emitted = 0;
  for (let i = 0; i < count; i++) {
    if (!force && particles.length >= limit) {
      break;
    }
    particles.push(factory(i));
    emitted++;
  }
  return emitted;
}

/**
 * Emits a Lada whimsical comic sound popup ("BÁC!", "PRÁSK!", "KŘUP!")
 * in a calligraphic cloud puff at impact coordinates.
 */
export function tryEmitLadaComicPopup(
  particles: Particle[],
  x: number,
  y: number,
  customText?: string,
  profile?: string
): boolean {
  if (!getLadaArtSettings().comicSoundPopupsEnabled) {
    return false;
  }
  const popup = getRandomLadaComicPopup();
  const text = customText || popup.text;
  return tryEmitParticle(
    particles,
    {
      x: x + (Math.random() * 16 - 8),
      y: y - 10 + (Math.random() * 10 - 5),
      vx: (Math.random() - 0.5) * 0.8,
      vy: -1.2 - Math.random() * 0.8,
      life: 1.0,
      maxLife: 1.0,
      size: 24,
      text,
      textColor: popup.color,
      bg: popup.bg,
      isComicPopup: true,
    },
    profile,
    true // Force emission for heavy impact feel
  );
}

