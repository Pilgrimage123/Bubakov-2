import { describe, it, expect } from 'vitest';
import {
  SUN_KEYFRAME_COUNT,
  SUN_OFFSCREEN_SIZE,
  DUBEN_SUN_VISUAL_PHASES,
  createDefaultSunOverlayConfig,
  createReusableSunFrameState,
  computeSunForegroundState,
  getSunOffscreenCanvases,
  renderSunForegroundOverlay,
} from '../src/render/sunForegroundRenderer';
import { GameEngine } from '../src/game/engine';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Ticket 03: Aprílové sluníčko a proměnlivé počasí', () => {
  it('defines 7 distinct April daytime visual keyframes with authentic Czech folklore labels', () => {
    expect(DUBEN_SUN_VISUAL_PHASES.length).toBe(SUN_KEYFRAME_COUNT);
    expect(DUBEN_SUN_VISUAL_PHASES[0].label).toBe('Ranní rozbřesk');
    expect(DUBEN_SUN_VISUAL_PHASES[1].label).toBe('Jarní ráno');
    expect(DUBEN_SUN_VISUAL_PHASES[2].label).toBe('Aprílové poškadlení');
    expect(DUBEN_SUN_VISUAL_PHASES[3].label).toBe('Hřejivé poledne');
    expect(DUBEN_SUN_VISUAL_PHASES[4].label).toBe('Přeháňka a duha');
    expect(DUBEN_SUN_VISUAL_PHASES[5].label).toBe('Májový podvečer');
    expect(DUBEN_SUN_VISUAL_PHASES[6].label).toBe('Filipojakubský západ');
  });

  it('pre-renders and caches all 7 April offscreen keyframe pairs at 512x512 with zero re-allocation', () => {
    const buffers1 = getSunOffscreenCanvases('duben');
    const buffers2 = getSunOffscreenCanvases('duben');

    expect(buffers1).toBe(buffers2);
    expect(buffers1.keyframes.length).toBe(7);

    for (let i = 0; i < buffers1.keyframes.length; i++) {
      const pair = buffers1.keyframes[i];
      expect(pair.raysCanvas.width).toBe(SUN_OFFSCREEN_SIZE);
      expect(pair.raysCanvas.height).toBe(SUN_OFFSCREEN_SIZE);
      expect(pair.faceCanvas.width).toBe(SUN_OFFSCREEN_SIZE);
      expect(pair.faceCanvas.height).toBe(SUN_OFFSCREEN_SIZE);
    }
  });

  it('computes April phase metadata and diegetic progression across the 5-minute run', () => {
    const config = createDefaultSunOverlayConfig();
    config.variant = 'duben';
    config.parallaxStrength = 0;

    const stateMischief = computeSunForegroundState(
      1280,
      720,
      0,
      0,
      100,
      100,
      config,
      createReusableSunFrameState()
    );
    expect(stateMischief.activePhaseId).toBe('late_morning');
    expect(stateMischief.activePhaseLabel).toBe('Aprílové poškadlení');

    const stateSunshower = computeSunForegroundState(
      1280,
      720,
      0,
      0,
      200,
      200,
      config,
      createReusableSunFrameState()
    );
    expect(stateSunshower.activePhaseId).toBe('afternoon');
    expect(stateSunshower.activePhaseLabel).toBe('Přeháňka a duha');

    const stateSunset = computeSunForegroundState(
      1280,
      720,
      0,
      0,
      300,
      300,
      config,
      createReusableSunFrameState()
    );
    expect(stateSunset.activePhaseId).toBe('sunset');
    expect(stateSunset.activePhaseLabel).toBe('Filipojakubský západ');
  });

  it('renders April sun overlay with winking mischief and rainbow halo without throwing', () => {
    const mockCtx = createMockCanvasContext() as unknown as CanvasRenderingContext2D;
    const config = createDefaultSunOverlayConfig();
    config.variant = 'duben';
    const state = createReusableSunFrameState();

    // Render Aprílové poškadlení (100s)
    expect(() => {
      renderSunForegroundOverlay(
        mockCtx,
        1280,
        720,
        0,
        0,
        100,
        100,
        config,
        state,
        'all',
        'duben'
      );
    }).not.toThrow();

    // Render Přeháňka a duha (200s)
    expect(() => {
      renderSunForegroundOverlay(
        mockCtx,
        1280,
        720,
        0,
        0,
        200,
        200,
        config,
        state,
        'all',
        'duben'
      );
    }).not.toThrow();
  });

  it('spawns gentle drifting petals and dandelion seed particles during Dubnový den (Level 2)', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
    expect(engine.activeLevelId).toBe(2);

    const initialParticleCount = engine.state.particles?.length || 0;

    // Simulate several frames with dt = 0.05 s
    for (let i = 0; i < 10; i++) {
      engine.update(0.05);
    }

    const currentParticles = engine.state.particles || [];
    expect(currentParticles.length).toBeGreaterThan(initialParticleCount);

    const weatherParticles = currentParticles.filter((p) => p.isWeather);
    expect(weatherParticles.length).toBeGreaterThan(0);

    const sample = weatherParticles[0];
    expect(sample.life).toBeGreaterThan(0);
    expect(sample.vx).toBeGreaterThan(0); // drifting east with breeze
    expect(['#FCE7F3', '#FEF08A']).toContain(sample.color);
  });
});
