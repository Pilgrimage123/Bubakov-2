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

  it('calculates real delivered FPS from frame intervals (60 FPS at ~16.7ms delta)', () => {
    const profiler = new FrameProfiler();

    // Initial frame
    profiler.start(0);
    profiler.end(5);

    // Frame 2 after 16.67ms (60 FPS)
    profiler.start(16.67);
    profiler.end(21.67);
    expect(profiler.fps).toBe(60);
    expect(profiler.frameDelta).toBeCloseTo(16.67, 1);

    // Frame 3 after another 16.67ms
    profiler.start(33.34);
    profiler.end(38.34);
    expect(profiler.fps).toBe(60);
  });

  it('drops FPS immediately upon lag spike or freeze even if CPU frame work is tiny (regression test)', () => {
    const profiler = new FrameProfiler();

    // Steady 60 FPS frames with 2ms CPU execution
    profiler.start(0);
    profiler.end(2);
    profiler.start(16.67);
    profiler.end(18.67);
    profiler.start(33.34);
    profiler.end(35.34);
    expect(profiler.fps).toBe(60);

    // Game almost freezes! Next frame arrives 250ms later, but CPU work inside loop is still only 2ms!
    // In the old buggy implementation, this would report 1000/2 = 500 FPS (or stuck at 60 FPS).
    profiler.start(283.34);
    const sample = profiler.end(285.34);

    expect(sample.total).toBe(2); // CPU work duration is tiny
    expect(profiler.frameDelta).toBeCloseTo(250, 1); // Real interval was 250ms
    expect(profiler.fps).toBeLessThanOrEqual(6); // Real FPS correctly plummeted to <= 6 FPS!
  });

  it('recovers FPS when regular 60 FPS cadence resumes after a freeze', () => {
    const profiler = new FrameProfiler();

    profiler.start(0);
    profiler.end(2);
    profiler.start(16.67);
    profiler.end(18.67);

    // Freeze of 300ms
    profiler.start(316.67);
    profiler.end(318.67);
    expect(profiler.fps).toBeLessThanOrEqual(5);

    // 60 FPS cadence resumes for 45 frames (~0.75 seconds)
    let t = 316.67;
    for (let i = 0; i < 45; i++) {
      t += 16.67;
      profiler.start(t);
      profiler.end(t + 2);
    }

    // Should recover back to ~60 FPS
    expect(profiler.fps).toBeGreaterThanOrEqual(55);
  });

  it('clamps extreme pauses gracefully and supports reset()', () => {
    const profiler = new FrameProfiler();

    profiler.start(0);
    profiler.end(2);
    profiler.start(16.67);
    profiler.end(18.67);

    // 5-second background tab stall
    profiler.start(5016.67);
    profiler.end(5018.67);
    expect(profiler.frameDelta).toBeCloseTo(5000, 1);
    expect(profiler.fps).toBe(1);

    profiler.reset();
    expect(profiler.fps).toBe(60);
    expect(profiler.frameDelta).toBe(16.67);
  });

  it('aggregates accurate percentile metrics and detects dropped frames in getMetricsSummary()', () => {
    const profiler = new FrameProfiler();

    // 20 frames at 16.67ms (60 FPS) with 4ms CPU work
    let t = 0;
    profiler.start(t);
    profiler.end(t + 4);

    for (let i = 0; i < 21; i++) {
      t += 16.67;
      profiler.start(t);
      profiler.end(t + 4);
    }

    // 1 frame that dropped/stuttered at 45ms
    t += 45;
    profiler.start(t);
    profiler.end(t + 10);

    const summary = profiler.getMetricsSummary();
    expect(summary.sampleCount).toBe(21);
    expect(summary.meanFps).toBeGreaterThanOrEqual(50);
    expect(summary.p50DeltaMs).toBeCloseTo(16.7, 1);
    expect(summary.maxDeltaMs).toBeCloseTo(45, 1);
    expect(summary.droppedFrames).toBe(1); // One frame exceeded 33.3ms
    expect(summary.stutterFrames).toBe(0); // None exceeded 50ms
    expect(summary.cpuWorkAvgMs).toBeGreaterThan(3.5);
  });
});
