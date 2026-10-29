import { describe, it, expect } from 'vitest';
import {
  SUN_KEYFRAME_COUNT,
  SUN_OFFSCREEN_SIZE,
  SUN_RUN_DURATION_SECONDS,
  SUN_VISUAL_PHASES,
  createDefaultSunOverlayConfig,
  createReusableSunFrameState,
  computeSunForegroundState,
  getSunOffscreenCanvases,
  renderSunForegroundOverlay,
} from '../src/render/sunForegroundRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Stage 1 Procedural Fairytale Sun Foreground Renderer', () => {
  it('pre-renders and caches all 7 daily phase keyframe pairs and multi-plane 3D parallax canvases once', () => {
    const first = getSunOffscreenCanvases();
    const second = getSunOffscreenCanvases();

    expect(first).toBe(second);
    expect(first.keyframes.length).toBe(SUN_KEYFRAME_COUNT);
    expect(SUN_VISUAL_PHASES.length).toBe(7);

    for (let i = 0; i < SUN_KEYFRAME_COUNT; i++) {
      expect(first.keyframes[i].raysCanvas.width).toBe(SUN_OFFSCREEN_SIZE);
      expect(first.keyframes[i].raysCanvas.height).toBe(SUN_OFFSCREEN_SIZE);
      expect(first.keyframes[i].faceCanvas.width).toBe(SUN_OFFSCREEN_SIZE);
      expect(first.keyframes[i].faceCanvas.height).toBe(SUN_OFFSCREEN_SIZE);
    }

    expect(first.farCloudCanvas.width).toBeGreaterThan(0);
    expect(first.sunbeamsCanvas.width).toBe(512);
    expect(first.nearCloudCanvasA.width).toBeGreaterThan(0);
    expect(first.nearCloudCanvasB.width).toBeGreaterThan(0);
    expect(first.birdsCanvas.width).toBeGreaterThan(0);
  });

  it('computes the 5-minute (300s) diegetic arc and transitions smoothly through all 7 daily phases', () => {
    const config = createDefaultSunOverlayConfig();
    config.parallaxStrength = 0; // isolate arc trajectory
    config.deadzoneRadius = 120;

    const stateStart = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      0,
      0,
      config,
      createReusableSunFrameState()
    );
    const stateMorning = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      50,
      50,
      config,
      createReusableSunFrameState()
    );
    const stateLateMorning = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      100,
      100,
      config,
      createReusableSunFrameState()
    );
    const stateNoon = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      150,
      150,
      config,
      createReusableSunFrameState()
    );
    const stateAfternoon = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      200,
      200,
      config,
      createReusableSunFrameState()
    );
    const stateEarlyEvening = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      250,
      250,
      config,
      createReusableSunFrameState()
    );
    const stateSunset = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      SUN_RUN_DURATION_SECONDS,
      300,
      config,
      createReusableSunFrameState()
    );

    expect(stateStart.activePhaseId).toBe('sunrise');
    expect(stateMorning.activePhaseId).toBe('morning');
    expect(stateLateMorning.activePhaseId).toBe('late_morning');
    expect(stateNoon.activePhaseId).toBe('noon');
    expect(stateAfternoon.activePhaseId).toBe('afternoon');
    expect(stateEarlyEvening.activePhaseId).toBe('early_evening');
    expect(stateSunset.activePhaseId).toBe('sunset');

    expect(stateStart.anchorX).toBeLessThan(stateNoon.anchorX);
    expect(stateNoon.anchorX).toBeCloseTo(720, 1);
    expect(stateSunset.anchorX).toBeGreaterThan(stateNoon.anchorX);

    // Zenith at 2:30 (150s / 12:00 Noon) is higher (smaller Y) than 0:00 and 5:00
    expect(stateNoon.anchorY).toBeLessThan(stateStart.anchorY);
    expect(stateNoon.anchorY).toBeLessThan(stateSunset.anchorY);

    // Atmospheric tint shifts warmer/stronger toward 5:00 sunset
    expect(stateSunset.ambientAlpha).toBeGreaterThan(stateStart.ambientAlpha);
    expect(stateSunset.ambientG).toBeLessThan(stateNoon.ambientG);
  });

  it('applies multi-plane 3D parallax (differential face relief, far/near clouds, perspective depth scale) and clamps extreme distances', () => {
    const config = createDefaultSunOverlayConfig();
    config.deadzoneRadius = 100;

    const neutral = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      150,
      10,
      config,
      createReusableSunFrameState()
    );
    const movedRight = computeSunForegroundState(
      1440,
      900,
      800, // camera moved far right (+X)
      -200,
      150,
      10,
      config,
      createReusableSunFrameState()
    );
    const extremeRun = computeSunForegroundState(
      1440,
      900,
      500000, // player ran very far in one direction
      500000,
      150,
      10,
      config,
      createReusableSunFrameState()
    );

    // Moving camera right shifts foreground sun left
    expect(movedRight.x).toBeLessThan(neutral.x);

    // Differential 3D face parallax shifts the face relative to the rays crown when moving off-center
    expect(Math.abs(movedRight.faceOffsetX)).toBeGreaterThan(0.5);
    expect(movedRight.nearClouds[0].x).not.toBeCloseTo(neutral.nearClouds[0].x, 1);

    // Sun never flies off screen even after extreme camera travel
    expect(extremeRun.x).toBeGreaterThanOrEqual(72);
    expect(extremeRun.x).toBeLessThanOrEqual(1440 - 72);
    expect(extremeRun.y).toBeGreaterThanOrEqual(72);
    expect(extremeRun.y).toBeLessThanOrEqual(900 - 72);
  });

  it('enforces the repulsive deadzone around the player at screen center and fades proximity alpha', () => {
    const config = createDefaultSunOverlayConfig();
    config.deadzoneRadius = 280;
    config.parallaxStrength = 2.0;

    // Push camera upward so parallax tries to push the zenith sun down into the center player deadzone
    const nearCenterState = computeSunForegroundState(
      1440,
      900,
      -720,
      -2500,
      150,
      20,
      config,
      createReusableSunFrameState()
    );

    expect(nearCenterState.distanceToCenter).toBeGreaterThanOrEqual(279.5);
    expect(nearCenterState.alpha).toBeGreaterThanOrEqual(0.25);
    expect(nearCenterState.alpha).toBeLessThan(0.55);

    // When sun is far in the corner, alpha approaches 0.95
    config.deadzoneRadius = 180;
    const cornerState = computeSunForegroundState(
      1440,
      900,
      -720,
      -450,
      0,
      20,
      config,
      createReusableSunFrameState()
    );
    expect(cornerState.alpha).toBeGreaterThan(0.85);
    expect(cornerState.alpha).toBeLessThanOrEqual(0.95);
  });

  it('renders all 3D parallax planes and occlusion passes strictly via cached drawImage calls without per-frame Bezier or gradient allocations', () => {
    const ctx = createMockCanvasContext(1440, 900);

    // Warm up offscreen cache first
    getSunOffscreenCanvases();

    const config = createDefaultSunOverlayConfig();
    const state = createReusableSunFrameState();

    // 1) Exact keyframe at 150s (Noon):
    // 2 far clouds + 1 volumetric sunbeams + 2 sun layers + 2 near occluding clouds + 1 bird flock + 3 lens flares = 11 drawImage calls
    renderSunForegroundOverlay(ctx, 1440, 900, -720, -450, 150, 45, config, state, 'all');
    expect((ctx.bezierCurveTo as any).mock.calls.length).toBe(0);
    expect((ctx.createRadialGradient as any).mock.calls.length).toBe(0);
    expect((ctx.drawImage as any).mock.calls.length).toBe(11);

    // 2) Mid-phase crossfade at 125s (between 10:00 Late Morning and 12:00 Noon):
    // 2 far clouds + 1 sunbeams + 4 crossfaded sun layers + 2 near occluding clouds + 1 bird flock + 3 lens flares = 13 drawImage calls
    (ctx.drawImage as any).mockClear();
    renderSunForegroundOverlay(ctx, 1440, 900, -720, -450, 125, 45, config, state, 'all');
    expect((ctx.bezierCurveTo as any).mock.calls.length).toBe(0);
    expect((ctx.createRadialGradient as any).mock.calls.length).toBe(0);
    expect((ctx.drawImage as any).mock.calls.length).toBe(13);

    // 3) Split 'sky_disc' (8 drawImage) + 'lens_only' (3 drawImage) passes for world occlusion
    (ctx.drawImage as any).mockClear();
    renderSunForegroundOverlay(ctx, 1440, 900, -720, -450, 150, 45, config, state, 'sky_disc');
    expect((ctx.drawImage as any).mock.calls.length).toBe(8);
    renderSunForegroundOverlay(ctx, 1440, 900, -720, -450, 150, 45, config, state, 'lens_only');
    expect((ctx.drawImage as any).mock.calls.length).toBe(11);
  });
});
