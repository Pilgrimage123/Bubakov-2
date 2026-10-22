/**
 * Allocation-free frame timing for the live performance overlay.
 *
 * This intentionally measures named pipeline seams instead of individual draw
 * calls, so production profiling does not perturb the frame being observed.
 */
export type FramePhase = 'simulation' | 'backdrop' | 'world' | 'lighting' | 'overlays';

export interface FrameTimingSnapshot {
  simulation: number;
  backdrop: number;
  world: number;
  lighting: number;
  overlays: number;
  total: number;
}

export interface FrameMetricsSummary {
  sampleCount: number;
  meanFps: number;
  minFps: number;
  p50DeltaMs: number;
  p95DeltaMs: number;
  maxDeltaMs: number;
  droppedFrames: number; // delta > 33.3ms (< 30 FPS)
  stutterFrames: number; // delta > 50.0ms (< 20 FPS)
  cpuWorkAvgMs: number;
  cpuWorkP95Ms: number;
}

const SMOOTHING = 0.12;
const HISTORY_SIZE = 1200; // Stores up to 20 seconds at 60 FPS without allocations

function createSnapshot(): FrameTimingSnapshot {
  return {
    simulation: 0,
    backdrop: 0,
    world: 0,
    lighting: 0,
    overlays: 0,
    total: 0,
  };
}

/** Reuses its two snapshots for the entire lifetime of the game loop. */
export class FrameProfiler {
  readonly current = createSnapshot();
  readonly smoothed = createSnapshot();
  private activePhase: FramePhase = 'simulation';
  private frameStart = 0;
  private phaseStart = 0;
  private hasSample = false;

  private lastFrameTimestamp = 0;
  private hasFrameDeltaSample = false;

  private deltaHistory = new Float32Array(HISTORY_SIZE);
  private workHistory = new Float32Array(HISTORY_SIZE);
  private historyCount = 0;
  private historyIndex = 0;

  /** Wall-clock delta between the start of the previous frame and this frame (in ms). */
  public frameDelta = 16.67;
  /** Smoothed wall-clock delta between frames (in ms). */
  public smoothedDelta = 16.67;
  /** Real delivered frames per second based on the wall-clock interval between frames. */
  public fps = 60;

  /**
   * Resets profiler state (e.g. after tab blur, unpausing or level reload).
   */
  reset(): void {
    this.lastFrameTimestamp = 0;
    this.hasFrameDeltaSample = false;
    this.frameDelta = 16.67;
    this.smoothedDelta = 16.67;
    this.fps = 60;
    this.hasSample = false;
    this.historyCount = 0;
    this.historyIndex = 0;
  }

  start(timestamp: number): void {
    if (this.lastFrameTimestamp > 0) {
      const rawDelta = Math.max(0.1, timestamp - this.lastFrameTimestamp);
      this.frameDelta = rawDelta;
      // Clamp extreme background-tab pauses (e.g. >1000ms) to 1000ms so recovery is prompt
      const clampedDelta = Math.min(1000, rawDelta);

      this.deltaHistory[this.historyIndex] = clampedDelta;
      this.historyIndex = (this.historyIndex + 1) % HISTORY_SIZE;
      if (this.historyCount < HISTORY_SIZE) this.historyCount++;

      if (!this.hasFrameDeltaSample) {
        this.smoothedDelta = clampedDelta;
        this.hasFrameDeltaSample = true;
      } else {
        // Fast reaction on sudden lag spikes / freezes (>1.4x expected delta), smooth tracking during stable cadence
        const weight = clampedDelta > this.smoothedDelta * 1.4 ? 0.75 : SMOOTHING;
        this.smoothedDelta += (clampedDelta - this.smoothedDelta) * weight;
      }
      this.fps = Math.max(1, Math.round(1000 / Math.max(1, this.smoothedDelta)));
    }
    this.lastFrameTimestamp = timestamp;

    this.current.simulation = 0;
    this.current.backdrop = 0;
    this.current.world = 0;
    this.current.lighting = 0;
    this.current.overlays = 0;
    this.current.total = 0;
    this.activePhase = 'simulation';
    this.frameStart = timestamp;
    this.phaseStart = timestamp;
  }

  mark(nextPhase: FramePhase, timestamp: number): void {
    this.current[this.activePhase] += Math.max(0, timestamp - this.phaseStart);
    this.activePhase = nextPhase;
    this.phaseStart = timestamp;
  }

  end(timestamp: number): FrameTimingSnapshot {
    this.current[this.activePhase] += Math.max(0, timestamp - this.phaseStart);
    this.current.total = Math.max(0, timestamp - this.frameStart);

    const workIdx = (this.historyIndex - 1 + HISTORY_SIZE) % HISTORY_SIZE;
    this.workHistory[workIdx] = this.current.total;

    if (!this.hasSample) {
      this.smoothed.simulation = this.current.simulation;
      this.smoothed.backdrop = this.current.backdrop;
      this.smoothed.world = this.current.world;
      this.smoothed.lighting = this.current.lighting;
      this.smoothed.overlays = this.current.overlays;
      this.smoothed.total = this.current.total;
      this.hasSample = true;
    } else {
      this.smoothed.simulation += (this.current.simulation - this.smoothed.simulation) * SMOOTHING;
      this.smoothed.backdrop += (this.current.backdrop - this.smoothed.backdrop) * SMOOTHING;
      this.smoothed.world += (this.current.world - this.smoothed.world) * SMOOTHING;
      this.smoothed.lighting += (this.current.lighting - this.smoothed.lighting) * SMOOTHING;
      this.smoothed.overlays += (this.current.overlays - this.smoothed.overlays) * SMOOTHING;
      this.smoothed.total += (this.current.total - this.smoothed.total) * SMOOTHING;
    }

    return this.smoothed;
  }

  /**
   * Computes percentile-based performance metrics over recent frames without allocating during gameplay.
   */
  getMetricsSummary(): FrameMetricsSummary {
    if (this.historyCount === 0) {
      return {
        sampleCount: 0,
        meanFps: this.fps,
        minFps: this.fps,
        p50DeltaMs: this.smoothedDelta,
        p95DeltaMs: this.smoothedDelta,
        maxDeltaMs: this.smoothedDelta,
        droppedFrames: 0,
        stutterFrames: 0,
        cpuWorkAvgMs: this.smoothed.total,
        cpuWorkP95Ms: this.smoothed.total,
      };
    }

    const deltas: number[] = [];
    const works: number[] = [];
    let sumDelta = 0;
    let sumWork = 0;
    let maxDelta = 0;
    let dropped = 0;
    let stutter = 0;

    for (let i = 0; i < this.historyCount; i++) {
      const d = this.deltaHistory[i];
      const w = this.workHistory[i];
      deltas.push(d);
      works.push(w);
      sumDelta += d;
      sumWork += w;
      if (d > maxDelta) maxDelta = d;
      if (d > 33.34) dropped++;
      if (d > 50.0) stutter++;
    }

    deltas.sort((a, b) => a - b);
    works.sort((a, b) => a - b);

    const p50Idx = Math.floor(deltas.length * 0.5);
    const p95Idx = Math.min(deltas.length - 1, Math.floor(deltas.length * 0.95));
    const meanDelta = sumDelta / deltas.length;
    const meanWork = sumWork / works.length;

    return {
      sampleCount: deltas.length,
      meanFps: Math.round(1000 / Math.max(0.1, meanDelta)),
      minFps: Math.max(1, Math.round(1000 / Math.max(0.1, maxDelta))),
      p50DeltaMs: Number(deltas[p50Idx].toFixed(1)),
      p95DeltaMs: Number(deltas[p95Idx].toFixed(1)),
      maxDeltaMs: Number(maxDelta.toFixed(1)),
      droppedFrames: dropped,
      stutterFrames: stutter,
      cpuWorkAvgMs: Number(meanWork.toFixed(2)),
      cpuWorkP95Ms: Number(works[p95Idx].toFixed(2)),
    };
  }
}
