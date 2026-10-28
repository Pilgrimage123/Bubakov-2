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

  it('ParticleBatchRenderer isolates bucket pools across instances and handles >32 colors with batching', async () => {
    const { ParticleBatchRenderer } = await import('../src/render/renderParticles');
    const { createMockCanvasContext } = await import('./helpers/mockCanvas');
    const ctx = createMockCanvasContext();
    const camera = { x: 0, y: 0, width: 800, height: 600, viewLeft: -400, viewTop: -300, viewRight: 400, viewBottom: 300 };

    const rendererA = new ParticleBatchRenderer(16);
    const rendererB = new ParticleBatchRenderer(16);

    // Create 40 distinct colors
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: 0,
        y: 0,
        life: 0.8,
        size: 3,
        color: `#${i.toString(16).padStart(6, '0')}`,
      });
    }

    const renderedCount = rendererA.render(ctx, particles, camera);
    expect(renderedCount).toBe(40);
    // rendererA grew its pool to at least 40 buckets
    expect(rendererA.poolCapacity).toBeGreaterThanOrEqual(40);
    // rendererB was completely untouched (instance isolation)
    expect(rendererB.poolCapacity).toBe(16);
  });
});
