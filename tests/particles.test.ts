import { describe, it, expect } from 'vitest';
import {
  tryEmitParticle,
  tryEmitParticleBurst,
  getParticleLimit,
  PARTICLE_BUDGETS,
  type Particle,
} from '../src/game/particles';

describe('Particle Budget Management (Plan Section 4)', () => {
  it('returns profile-specific limits', () => {
    expect(getParticleLimit('performance')).toBe(PARTICLE_BUDGETS.performance);
    expect(getParticleLimit('balanced')).toBe(PARTICLE_BUDGETS.balanced);
    expect(getParticleLimit('fidelity')).toBe(PARTICLE_BUDGETS.fidelity);
  });

  it('rejects emission when exceeding profile budget without allocating', () => {
    const particles: Particle[] = [];
    const budget = PARTICLE_BUDGETS.performance;

    for (let i = 0; i < budget; i++) {
      const ok = tryEmitParticle(
        particles,
        () => ({ x: i, y: 0, vx: 0, vy: 0, life: 1 }),
        'performance'
      );
      expect(ok).toBe(true);
    }

    expect(particles.length).toBe(budget);

    let factoryCalled = false;
    const ok = tryEmitParticle(
      particles,
      () => {
        factoryCalled = true;
        return { x: 0, y: 0, vx: 0, vy: 0, life: 1 };
      },
      'performance'
    );

    expect(ok).toBe(false);
    expect(factoryCalled).toBe(false); // Zero allocation when over budget!
    expect(particles.length).toBe(budget);
  });

  it('burst emission bails out when reaching budget', () => {
    const particles: Particle[] = [];
    const limit = PARTICLE_BUDGETS.performance;

    const emitted = tryEmitParticleBurst(
      particles,
      100,
      (idx) => ({ x: idx, y: 0, vx: 0, vy: 0, life: 1 }),
      'performance'
    );

    expect(emitted).toBe(limit);
    expect(particles.length).toBe(limit);
  });
});
