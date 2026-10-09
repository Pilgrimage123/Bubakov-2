import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import {
  computeLightSources,
  getAmbientDarkness,
  computeLightingEnvironment,
  isLightInView,
  BASE_LANTERN_RADIUS,
  WATCHMAN_RADIUS_MULTIPLIER,
  PHASE_AMBIENT_DARKNESS,
} from '../src/game/lighting';
import type { LightSource } from '../src/types';

describe('Dynamic Folk Lighting Model (Ticket 01)', () => {
  describe('Ambient Darkness Calculation across Day Phases', () => {
    it('returns exact ambient darkness for all daylight and night phases by gameTime', () => {
      // Noon (0-60s) -> 0.0 darkness (bright daytime)
      expect(getAmbientDarkness(0)).toBe(0.0);
      expect(getAmbientDarkness(30)).toBe(0.0);
      expect(getAmbientDarkness(59)).toBe(0.0);

      // Afternoon (60-120s) -> 0.1 darkness (lengthening shadows)
      expect(getAmbientDarkness(60)).toBe(0.1);
      expect(getAmbientDarkness(90)).toBe(0.1);
      expect(getAmbientDarkness(119)).toBe(0.1);

      // Dusk / Klekání (120-180s) -> 0.35 darkness (sunset twilight)
      expect(getAmbientDarkness(120)).toBe(0.35);
      expect(getAmbientDarkness(150)).toBe(0.35);
      expect(getAmbientDarkness(179)).toBe(0.35);

      // Night / Hluboká noc (180-240s) -> 0.65 darkness (thick folk night)
      expect(getAmbientDarkness(180)).toBe(0.65);
      expect(getAmbientDarkness(210)).toBe(0.65);
      expect(getAmbientDarkness(239)).toBe(0.65);

      // Midnight / Půlnoční hodina (240-360s) -> 0.85 darkness (witching hour maximum darkness)
      expect(getAmbientDarkness(240)).toBe(0.85);
      expect(getAmbientDarkness(300)).toBe(0.85);
      expect(getAmbientDarkness(359)).toBe(0.85);

      // Dawn / Kuropění & Svítání (360s+) -> 0.0 darkness (rooster crows, morning clear)
      expect(getAmbientDarkness(360)).toBe(0.0);
      expect(getAmbientDarkness(500)).toBe(0.0);
    });

    it('supports looking up darkness by phase ID string or DayPhase object', () => {
      expect(getAmbientDarkness('noon')).toBe(0.0);
      expect(getAmbientDarkness('afternoon')).toBe(0.1);
      expect(getAmbientDarkness('dusk')).toBe(0.35);
      expect(getAmbientDarkness('night')).toBe(0.65);
      expect(getAmbientDarkness('midnight')).toBe(0.85);
      expect(getAmbientDarkness('dawn')).toBe(0.0);

      expect(getAmbientDarkness({ id: 'midnight', name: 'Půlnoční hodina' } as any)).toBe(0.85);
      expect(getAmbientDarkness('unknown_phase')).toBe(0.0);
    });
  });

  describe('Player Lantern Light Source', () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine();
    });

    it('creates a standard player lantern for wanderer at player position', () => {
      engine.initRun({
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
      engine.state.player.x = 120;
      engine.state.player.y = 240;
      engine.state.gameTime = 0; // zero flicker offset

      const lights = computeLightSources(engine);
      expect(lights.length).toBe(1);

      const lantern = lights[0];
      expect(lantern.id).toBe('player_lantern');
      expect(lantern.kind).toBe('player_lantern');
      expect(lantern.x).toBe(120);
      expect(lantern.y).toBe(240);
      expect(lantern.radius).toBe(BASE_LANTERN_RADIUS);
      expect(lantern.radius).toBe(170);
      expect(lantern.intensity).toBeGreaterThan(0);
      expect(lantern.intensity).toBeLessThanOrEqual(1.0);
      expect(lantern.color).toMatch(/^#[0-9A-Fa-f]{6}$|^rgba?\(/);
    });

    it('gives Ponocný (watchman) a +25% lantern radius bonus and full intensity 1.0', () => {
      engine.initRun({
        hunterType: 'watchman',
        spawnInitialWave: false,
      });
      engine.state.player.x = 300;
      engine.state.player.y = 500;
      engine.state.gameTime = 0;

      const lights = computeLightSources(engine);
      expect(lights.length).toBe(1);

      const lantern = lights[0];
      expect(lantern.id).toBe('player_lantern');
      expect(lantern.kind).toBe('player_lantern');
      expect(lantern.intensity).toBe(1.0);

      // +25% bonus: 170 * 1.25 = 212.5 (~215px)
      const expectedRadius = BASE_LANTERN_RADIUS * WATCHMAN_RADIUS_MULTIPLIER;
      expect(expectedRadius).toBe(212.5);
      expect(lantern.radius).toBe(expectedRadius);
    });

    it('applies subtle deterministic sinusoidal flicker over gameTime', () => {
      engine.initRun({
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });

      // At t=0: flicker = Math.sin(0) * 6 = 0
      engine.state.gameTime = 0;
      const light0 = computeLightSources(engine)[0];
      expect(light0.radius).toBe(170);

      // Peak positive flicker: sin(5 * t) = 1 => 5 * t = PI / 2 => t = PI / 10
      engine.state.gameTime = Math.PI / 10;
      const lightPeak = computeLightSources(engine)[0];
      expect(lightPeak.radius).toBeCloseTo(176, 2);

      // Peak negative flicker: sin(5 * t) = -1 => 5 * t = 3 * PI / 2 => t = 3 * PI / 10
      engine.state.gameTime = (3 * Math.PI) / 10;
      const lightTrough = computeLightSources(engine)[0];
      expect(lightTrough.radius).toBeCloseTo(164, 2);
    });

    it('returns empty array if player is not yet instantiated', () => {
      // Default engine before initRun has player: null
      expect(engine.state.player).toBeNull();
      const lights = computeLightSources(engine);
      expect(lights).toEqual([]);
    });
  });

  describe('View Bounds Query and Spatial Culling', () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine();
      engine.initRun({
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
      engine.state.gameTime = 0;
    });

    it('isLightInView correctly checks circle-to-AABB intersection', () => {
      const light: LightSource = {
        id: 'test_light',
        x: 500,
        y: 500,
        radius: 100,
        color: '#FFFFFF',
        intensity: 1.0,
        kind: 'player_lantern',
      };

      // Fully inside view [400, 400, 600, 600]
      expect(isLightInView(light, 400, 400, 600, 600)).toBe(true);

      // Unbounded query
      expect(isLightInView(light)).toBe(true);

      // Completely to the left (x + r = 600 < 700)
      expect(isLightInView(light, 700, 0, 1000, 1000)).toBe(false);

      // Completely to the right (x - r = 400 > 300)
      expect(isLightInView(light, 0, 0, 300, 1000)).toBe(false);

      // Completely above (y + r = 600 < 700)
      expect(isLightInView(light, 0, 700, 1000, 1000)).toBe(false);

      // Completely below (y - r = 400 > 300)
      expect(isLightInView(light, 0, 0, 1000, 300)).toBe(false);

      // Edge overlap: center outside, but edge reaches into view
      // View left is 550, light is at 500 with r=100 (reaches to 600)
      expect(isLightInView(light, 550, 400, 800, 600)).toBe(true);
    });

    it('filters visible light sources through GameEngine.getVisibleLightSources', () => {
      engine.state.player.x = 200;
      engine.state.player.y = 200;

      // Player lantern has radius 170. Bounding box: [30, 30, 370, 370]
      // 1. View covers player
      const visible = engine.getVisibleLightSources(0, 0, 800, 600);
      expect(visible.length).toBe(1);
      expect(visible[0].id).toBe('player_lantern');

      // 2. View is far away to the right: [1000, 0, 1800, 600]
      const culledRight = engine.getVisibleLightSources(1000, 0, 1800, 600);
      expect(culledRight.length).toBe(0);

      // 3. View is far away below: [0, 1000, 800, 1600]
      const culledBottom = engine.getVisibleLightSources(0, 1000, 800, 1600);
      expect(culledBottom.length).toBe(0);

      // 4. View edge touches player lantern: viewLeft = 350 <= 370
      const overlapping = engine.getVisibleLightSources(350, 0, 800, 600);
      expect(overlapping.length).toBe(1);
    });

    it('provides getLightingEnvironment with ambientDarkness and visible sources', () => {
      engine.state.player.x = 100;
      engine.state.player.y = 100;
      engine.state.gameTime = 200; // Night: 0.65 darkness

      const env = engine.getLightingEnvironment(0, 0, 1000, 1000);
      expect(env.ambientDarkness).toBe(0.65);
      expect(env.sources.length).toBe(1);
      expect(env.sources[0].id).toBe('player_lantern');
    });
  });
});
