import { describe, expect, it } from 'vitest';
import { FrameProfiler } from '../src/game/frameProfiler';

describe('FrameProfiler', () => {
  it('attributes a completed frame to named phases', () => {
    const profiler = new FrameProfiler();
    profiler.start(100);
    profiler.mark('backdrop', 105);
    profiler.mark('world', 107);
    profiler.mark('lighting', 118);
    profiler.mark('overlays', 121);
    const sample = profiler.end(125);

    expect(sample).toEqual({
      simulation: 5,
      backdrop: 2,
      world: 11,
      lighting: 3,
      overlays: 4,
      total: 25,
    });
  });

  it('smooths later samples without allocating a new snapshot', () => {
    const profiler = new FrameProfiler();
    const reusableSnapshot = profiler.smoothed;
    profiler.start(0);
    profiler.end(10);
    profiler.start(10);
    const result = profiler.end(30);

    expect(result).toBe(reusableSnapshot);
    expect(result.total).toBeGreaterThan(10);
    expect(result.total).toBeLessThan(20);
  });
});
