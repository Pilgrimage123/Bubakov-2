/**
 * Deterministic Stress Benchmark for Arena Simulation & Rendering Pipeline
 *
 * Implements deterministic stress scenarios for performance, balanced, and fidelity
 * profiles to verify p50/p95 frame budgets (< 16.7 ms for 60 FPS in performance mode)
 * and entity caps without memory leaks or Garbage Collector spikes.
 *
 * Plan: docs/plans/arena-performance-implementation-plan.md (Section 0)
 */

import { GameEngine } from './engine';
import { createInitialEngineState, type EngineState } from './engineState';
import { createDefaultMetaProgression } from './migration';
import { renderArena, type CameraViewport, createReusableRenderMetrics } from '../render/arenaRenderer';
import { FrameProfiler } from './frameProfiler';

export type PerformanceProfile = 'performance' | 'balanced' | 'fidelity';

export interface StressBenchmarkOptions {
  profile?: PerformanceProfile;
  frameCount?: number;
  fixedDt?: number;
  initialEnemies?: number;
  initialProjectiles?: number;
  initialDrops?: number;
  initialParticles?: number;
  initialTexts?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  mockCtx?: CanvasRenderingContext2D;
}

export interface StressBenchmarkResult {
  profile: PerformanceProfile;
  frameCount: number;
  p50Ms: number;
  p95Ms: number;
  meanMs: number;
  maxMs: number;
  maxEntities: {
    enemies: number;
    projectiles: number;
    particles: number;
    texts: number;
    drops: number;
  };
  phaseAverages: {
    simulation: number;
    backdrop: number;
    world: number;
    lighting: number;
    overlays: number;
  };
}

/**
 * Calculates a given percentile (e.g. 0.5 for p50, 0.95 for p95) from raw number samples.
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * percentile)));
  return sorted[index];
}

/**
 * Creates a minimal headless canvas rendering context if none is provided.
 */
function createFallbackBenchmarkContext(width: number, height: number): CanvasRenderingContext2D {
  return {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    setTransform: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    rect: () => {},
    bezierCurveTo: () => {},
    quadraticCurveTo: () => {},
    setLineDash: () => {},
    getLineDash: () => [],
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: (text: string) => ({ width: text.length * 8 }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    canvas: { width, height },
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

/**
 * Executes a deterministic stress scenario across N frames for a given performance profile.
 */
export function runDeterministicArenaStressBenchmark(
  options: StressBenchmarkOptions = {}
): StressBenchmarkResult {
  const profile = options.profile || 'performance';
  const frameCount = options.frameCount ?? 120;
  const fixedDt = options.fixedDt ?? 1 / 60;
  const width = options.canvasWidth ?? 1280;
  const height = options.canvasHeight ?? 720;
  const ctx = options.mockCtx ?? createFallbackBenchmarkContext(width, height);

  const meta = createDefaultMetaProgression();
  meta.performanceProfile = profile;

  // Strop entit dle profilu
  const maxEnemies = profile === 'performance' ? 35 : profile === 'balanced' ? 55 : 70;
  const initialEnemies = options.initialEnemies ?? Math.max(10, maxEnemies - 5);

  const engineState: EngineState = createInitialEngineState();
  engineState.meta = meta;

  const engine = new GameEngine(engineState);
  engine.initRun({
    levelId: 1,
    hunterType: 'wanderer',
    meta,
    spawnInitialWave: false,
  });

  // Populate deterministic enemies around player
  const player = engine.state.player;
  player.x = 0;
  player.y = 0;

  for (let i = 0; i < initialEnemies; i++) {
    const angle = (i / initialEnemies) * Math.PI * 2;
    const dist = 120 + (i % 5) * 80;
    const ex = player.x + Math.cos(angle) * dist;
    const ey = player.y + Math.sin(angle) * dist;
    engine.spawnMonster(i % 3 === 0 ? 'hejkal' : i % 2 === 0 ? 'hastrman' : 'rarach', ex, ey, 1.0);
  }

  // Populate deterministic projectiles, drops, particles
  const projCount = options.initialProjectiles ?? (profile === 'performance' ? 20 : 40);
  for (let i = 0; i < projCount; i++) {
    const angle = (i / projCount) * Math.PI * 2;
    engine.state.projectiles.push({
      x: Math.cos(angle) * 100,
      y: Math.sin(angle) * 100,
      vx: Math.cos(angle) * 200,
      vy: Math.sin(angle) * 200,
      radius: 8,
      damage: 25,
      life: 2.0,
      maxLife: 2.0,
      penetration: 1,
      hitList: [],
      id: `stress_p_${i}`,
    });
  }

  const dropCount = options.initialDrops ?? (profile === 'performance' ? 30 : 60);
  for (let i = 0; i < dropCount; i++) {
    const angle = (i / dropCount) * Math.PI * 2;
    engine.state.drops.push({
      x: Math.cos(angle) * (150 + (i % 4) * 40),
      y: Math.sin(angle) * (150 + (i % 4) * 40),
      type: i % 2 === 0 ? 'coin' : 'gingerbread',
      value: 1,
      collected: false,
    });
  }

  const particleCount = options.initialParticles ?? (profile === 'performance' ? 25 : 50);
  for (let i = 0; i < particleCount; i++) {
    engine.state.particles.push({
      x: (i % 10) * 20 - 100,
      y: Math.floor(i / 10) * 20 - 100,
      vx: 10,
      vy: -15,
      life: 0.8,
      maxLife: 0.8,
      size: 4,
      color: '#F59E0B',
    });
  }

  const textCount = options.initialTexts ?? (profile === 'performance' ? 10 : 25);
  for (let i = 0; i < textCount; i++) {
    engine.addDamageText(
      (i % 5) * 40 - 80,
      Math.floor(i / 5) * 30 - 60,
      `${10 + i * 5}`,
      '#FFFFFF'
    );
  }

  const camera: CameraViewport = {
    x: 0,
    y: 0,
    width,
    height,
    viewLeft: -width / 2,
    viewTop: -height / 2,
    viewRight: width / 2,
    viewBottom: height / 2,
  };

  const profiler = new FrameProfiler();
  const renderMetrics = createReusableRenderMetrics();
  const frameTimesMs: number[] = [];

  let maxEnemiesSeen = 0;
  let maxProjSeen = 0;
  let maxPartSeen = 0;
  let maxTextsSeen = 0;
  let maxDropsSeen = 0;

  const phaseTotals = {
    simulation: 0,
    backdrop: 0,
    world: 0,
    lighting: 0,
    overlays: 0,
  };

  // Warmup frames to stabilize V8 JIT compiler
  for (let w = 0; w < 5; w++) {
    engine.update(fixedDt);
    renderArena(
      ctx,
      engine.state,
      camera,
      {
        performanceProfile: profile,
        combatVfxEnabled: profile !== 'performance',
        lightingEnabled: profile !== 'performance',
      },
      renderMetrics
    );
  }

  for (let frame = 0; frame < frameCount; frame++) {
    const tStart = performance.now();
    profiler.start(tStart);

    // 1. Simulation Phase
    engine.update(fixedDt);
    const tSimEnd = performance.now();
    profiler.mark('backdrop', tSimEnd);

    // 2. Render Phase (Arena seam)
    renderArena(
      ctx,
      engine.state,
      camera,
      {
        performanceProfile: profile,
        combatVfxEnabled: profile !== 'performance',
        lightingEnabled: profile !== 'performance',
      },
      renderMetrics
    );

    const tRenderEnd = performance.now();
    profiler.mark('overlays', tRenderEnd);
    const frameSample = profiler.end(tRenderEnd);

    const frameDuration = tRenderEnd - tStart;
    frameTimesMs.push(frameDuration);

    phaseTotals.simulation += frameSample.simulation;
    phaseTotals.backdrop += frameSample.backdrop;
    phaseTotals.world += frameSample.world;
    phaseTotals.lighting += frameSample.lighting;
    phaseTotals.overlays += frameSample.overlays;

    maxEnemiesSeen = Math.max(maxEnemiesSeen, engine.state.enemies.length);
    maxProjSeen = Math.max(maxProjSeen, engine.state.projectiles.length);
    maxPartSeen = Math.max(maxPartSeen, engine.state.particles.length);
    maxTextsSeen = Math.max(maxTextsSeen, engine.state.texts.length);
    maxDropsSeen = Math.max(maxDropsSeen, engine.state.drops.length);
  }

  const p50Ms = calculatePercentile(frameTimesMs, 0.5);
  const p95Ms = calculatePercentile(frameTimesMs, 0.95);
  const meanMs = frameTimesMs.reduce((a, b) => a + b, 0) / Math.max(1, frameTimesMs.length);
  const maxMs = Math.max(...frameTimesMs, 0);

  return {
    profile,
    frameCount,
    p50Ms,
    p95Ms,
    meanMs,
    maxMs,
    maxEntities: {
      enemies: maxEnemiesSeen,
      projectiles: maxProjSeen,
      particles: maxPartSeen,
      texts: maxTextsSeen,
      drops: maxDropsSeen,
    },
    phaseAverages: {
      simulation: phaseTotals.simulation / frameCount,
      backdrop: phaseTotals.backdrop / frameCount,
      world: phaseTotals.world / frameCount,
      lighting: phaseTotals.lighting / frameCount,
      overlays: phaseTotals.overlays / frameCount,
    },
  };
}
