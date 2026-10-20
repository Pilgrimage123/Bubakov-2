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

const SMOOTHING = 0.12;

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

  start(timestamp: number): void {
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
}
