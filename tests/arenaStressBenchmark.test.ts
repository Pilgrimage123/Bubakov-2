import { describe, it, expect } from 'vitest';
import { runDeterministicArenaStressBenchmark, calculatePercentile } from '../src/game/benchmark';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Deterministic Arena Stress Benchmark (Plan Section 0)', () => {
  it('calculates percentiles correctly from sample distributions', () => {
    const samples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(calculatePercentile(samples, 0.5)).toBe(6);
    expect(calculatePercentile(samples, 0.95)).toBe(10);
    expect(calculatePercentile([], 0.5)).toBe(0);
  });

  it('runs deterministic stress benchmark in performance profile and satisfies p95 budget < 16.7ms', () => {
    const mockCtx = createMockCanvasContext(1280, 720);
    const result = runDeterministicArenaStressBenchmark({
      profile: 'performance',
      frameCount: 60,
      initialEnemies: 30,
      mockCtx,
    });

    expect(result.profile).toBe('performance');
    expect(result.frameCount).toBe(60);
    expect(result.p50Ms).toBeGreaterThanOrEqual(0);
    expect(result.p95Ms).toBeLessThan(16.7); // 60 FPS target: frame time < 16.7 ms
    expect(result.maxEntities.enemies).toBeLessThanOrEqual(35);
    expect(result.phaseAverages.simulation).toBeGreaterThanOrEqual(0);
    expect(result.phaseAverages.world).toBeGreaterThanOrEqual(0);
  });

  it('compares metrics across performance, balanced, and fidelity profiles', () => {
    const mockCtx = createMockCanvasContext(1280, 720);

    const perf = runDeterministicArenaStressBenchmark({
      profile: 'performance',
      frameCount: 30,
      mockCtx,
    });
    const balanced = runDeterministicArenaStressBenchmark({
      profile: 'balanced',
      frameCount: 30,
      mockCtx,
    });
    const fidelity = runDeterministicArenaStressBenchmark({
      profile: 'fidelity',
      frameCount: 30,
      mockCtx,
    });

    expect(perf.maxEntities.enemies).toBeLessThanOrEqual(balanced.maxEntities.enemies);
    expect(balanced.maxEntities.enemies).toBeLessThanOrEqual(fidelity.maxEntities.enemies);
    expect(perf.p95Ms).toBeLessThan(16.7);
  });
});
