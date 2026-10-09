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
  HROMNICKA_BASE_RADIUS,
  HROMNICKA_RADIUS_PER_LEVEL,
  HROMNICKA_COLOR,
  HROMNICKA_INTENSITY,
  BLUDICKA_RADIUS,
  BLUDICKA_COLOR,
  BLUDICKA_INTENSITY,
  PROJECTILE_LIGHT_RADIUS,
  PROJECTILE_LIGHT_COLOR,
  PROJECTILE_LIGHT_INTENSITY,
  RARE_LOOT_LIGHT_RADIUS,
  RARE_LOOT_LIGHT_COLOR,
  RARE_LOOT_LIGHT_INTENSITY,
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

  describe('Folklore Entity Emitters and Loot Glow (Ticket 03)', () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine();
      engine.initRun({
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
      engine.state.gameTime = 0;
    });

    it('having hromnicka weapon adds the holy_candle light source with expected radius', () => {
      engine.state.player.weapons = [{ id: 'hromnicka', level: 1 }];

      const lights = computeLightSources(engine);
      expect(lights.length).toBe(2);

      const lantern = lights.find((l) => l.kind === 'player_lantern');
      const holyCandle = lights.find((l) => l.kind === 'holy_candle');

      expect(lantern).toBeDefined();
      expect(holyCandle).toBeDefined();

      // Formula: radius = 135 + (w.level || 1) * 18 -> 135 + 18 = 153
      expect(holyCandle!.radius).toBe(153);
      expect(holyCandle!.color).toBe('#FEF08A');
      expect(holyCandle!.intensity).toBe(0.9);
      expect(holyCandle!.kind).toBe('holy_candle');
      expect(holyCandle!.x).toBe(engine.state.player.x);
      expect(holyCandle!.y).toBe(engine.state.player.y);

      // Weapon level 2 scaling: 135 + 2 * 18 = 171
      engine.state.player.weapons = [{ id: 'hromnicka', level: 2 }];
      const lightsLvl2 = computeLightSources(engine);
      const candleLvl2 = lightsLvl2.find((l) => l.kind === 'holy_candle');
      expect(candleLvl2!.radius).toBe(171);

      // Pulsing with time * 4: at time = PI / 8 (4*t = PI/2 => sin=1)
      engine.state.gameTime = Math.PI / 8;
      const pulsedLights = computeLightSources(engine);
      const pulsedCandle = pulsedLights.find((l) => l.kind === 'holy_candle');
      expect(pulsedCandle!.radius).toBeCloseTo(177, 2); // 171 + 6
    });

    it('living bludicka enemies add will_o_wisp light sources', () => {
      engine.state.enemies.push({
        id: 'bludicka_1',
        type: 'bludicka',
        x: 420,
        y: 690,
        dead: false,
        isDefeated: false,
      });

      const lights = computeLightSources(engine);
      const wisp = lights.find((l) => l.kind === 'will_o_wisp');

      expect(wisp).toBeDefined();
      expect(wisp!.x).toBe(420);
      expect(wisp!.y).toBe(690);
      expect(wisp!.radius).toBe(75);
      expect(wisp!.color).toBe('#67E8F9');
      expect(wisp!.intensity).toBe(0.85);

      // Wobble / flicker over time: at time = PI / 12 (6*t = PI/2 => sin=1)
      engine.state.gameTime = Math.PI / 12;
      const pulsedLights = computeLightSources(engine);
      const pulsedWisp = pulsedLights.find((l) => l.kind === 'will_o_wisp');
      expect(pulsedWisp!.radius).toBeCloseTo(79, 2); // 75 + 4
    });

    it('flying fire projectiles add projectile light sources', () => {
      engine.state.projectiles.push(
        { id: 'p_spark', x: 100, y: 150, visual: 'hell_spark', dead: false },
        { id: 'p_fireball', x: 200, y: 250, visual: 'dragon_fireball', dead: false },
        { id: 'p_boulder', x: 300, y: 350, visual: 'boulder', dead: false },
        { id: 'p_potato', x: 400, y: 450, weaponId: 'horky_brambor', dead: false },
        { id: 'p_snow', x: 500, y: 550, visual: 'snowball', dead: false } // non-fiery
      );

      const lights = computeLightSources(engine);
      const projectileLights = lights.filter((l) => l.kind === 'projectile');

      expect(projectileLights.length).toBe(4);
      for (const pLight of projectileLights) {
        expect(pLight.radius).toBe(45);
        expect(pLight.color).toBe('#F97316');
        expect(pLight.intensity).toBe(0.75);
      }

      // Check coordinates matched respective projectiles
      expect(projectileLights.some((l) => l.x === 100 && l.y === 150)).toBe(true);
      expect(projectileLights.some((l) => l.x === 200 && l.y === 250)).toBe(true);
      expect(projectileLights.some((l) => l.x === 300 && l.y === 350)).toBe(true);
      expect(projectileLights.some((l) => l.x === 400 && l.y === 450)).toBe(true);
      expect(projectileLights.some((l) => l.x === 500 && l.y === 550)).toBe(false);
    });

    it('rare drops (chest/horseshoe/giant gingerbread) emit loot glow sources', () => {
      engine.state.drops.push(
        { type: 'chest', x: 120, y: 140, dead: false },
        { type: 'horseshoe', x: 220, y: 240, dead: false },
        { type: 'rooster', x: 320, y: 340, dead: false },
        { type: 'gingerbread', size: 'giant', x: 420, y: 440, dead: false },
        { type: 'coin', x: 520, y: 540, dead: false }, // common
        { type: 'gingerbread', size: 'small', x: 620, y: 640, dead: false } // common
      );

      const lights = computeLightSources(engine);
      const lootLights = lights.filter((l) => l.kind === 'loot');

      expect(lootLights.length).toBe(4);
      for (const lLight of lootLights) {
        expect(lLight.radius).toBe(32);
        expect(lLight.color).toBe('#FDE68A');
        expect(lLight.intensity).toBe(0.6);
      }

      expect(lootLights.some((l) => l.x === 120 && l.y === 140)).toBe(true);
      expect(lootLights.some((l) => l.x === 220 && l.y === 240)).toBe(true);
      expect(lootLights.some((l) => l.x === 320 && l.y === 340)).toBe(true);
      expect(lootLights.some((l) => l.x === 420 && l.y === 440)).toBe(true);
      expect(lootLights.some((l) => l.x === 520 && l.y === 540)).toBe(false);
      expect(lootLights.some((l) => l.x === 620 && l.y === 640)).toBe(false);
    });

    it('dead/defeated enemies or collected drops do not emit lights', () => {
      engine.state.enemies.push(
        { id: 'dead_wisp', type: 'bludicka', x: 100, y: 100, dead: true },
        { id: 'defeated_wisp', type: 'bludicka', x: 150, y: 150, isDefeated: true },
        { id: 'zerohp_wisp', type: 'bludicka', x: 200, y: 200, hp: 0 }
      );
      engine.state.projectiles.push({
        id: 'dead_proj',
        x: 250,
        y: 250,
        visual: 'dragon_fireball',
        dead: true,
      });
      engine.state.drops.push(
        { type: 'chest', x: 300, y: 300, dead: true },
        { type: 'horseshoe', x: 350, y: 350, collected: true }
      );

      const lights = computeLightSources(engine);
      expect(lights.some((l) => l.kind === 'will_o_wisp')).toBe(false);
      expect(lights.some((l) => l.kind === 'projectile')).toBe(false);
      expect(lights.some((l) => l.kind === 'loot')).toBe(false);
    });

    it('culls off-screen folklore entities and loot glow with isLightInView', () => {
      // Put player at 0, 0
      engine.state.player.x = 0;
      engine.state.player.y = 0;

      // Inside view [0, 0, 500, 500]
      engine.state.enemies.push({
        id: 'in_view_wisp',
        type: 'bludicka',
        x: 200,
        y: 200,
      });
      // Far outside view
      engine.state.enemies.push({
        id: 'out_view_wisp',
        type: 'bludicka',
        x: 3000,
        y: 3000,
      });

      // Far outside projectile
      engine.state.projectiles.push({
        id: 'out_proj',
        x: 4000,
        y: 4000,
        visual: 'hell_spark',
      });

      // Far outside drop
      engine.state.drops.push({
        id: 'out_drop',
        type: 'chest',
        x: 5000,
        y: 5000,
      });

      const visible = engine.getVisibleLightSources(0, 0, 500, 500);
      expect(visible.some((l) => l.id === 'wisp_in_view_wisp')).toBe(true);
      expect(visible.some((l) => l.id === 'wisp_out_view_wisp')).toBe(false);
      expect(visible.some((l) => l.kind === 'projectile')).toBe(false);
      expect(visible.some((l) => l.kind === 'loot')).toBe(false);
    });

    it('supports isLightInView called directly with (x, y, radius, viewLeft, viewTop, viewRight, viewBottom)', () => {
      // Light at x=100, y=100, radius=50 inside [0, 0, 500, 500]
      expect(isLightInView(100, 100, 50, 0, 0, 500, 500)).toBe(true);

      // Light completely off to right (x - radius = 600 - 50 = 550 > 500)
      expect(isLightInView(600, 100, 50, 0, 0, 500, 500)).toBe(false);

      // Light edge reaches into view (x - radius = 530 - 50 = 480 <= 500)
      expect(isLightInView(530, 100, 50, 0, 0, 500, 500)).toBe(true);
    });
  });
});

