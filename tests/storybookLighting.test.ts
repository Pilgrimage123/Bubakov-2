import { describe, it, expect, vi } from 'vitest';
import {
  getPetrolejkaRadius,
  isPositionIlluminated,
  evaluateShadowDefense,
  getShadowDefenseMultipliers,
  updateLightSources,
  evaluateBludickaAura,
  createOsikovySlashLight,
  createHolyCathedralLight,
  createGarlicHearthSpark,
  createCertEmberLight,
  computeOccluderSegments,
  computeShadowVolume,
  isRayBlockedByOccluders,
  computeLambertianDiffuse,
  computeNormalFromAngles,
  computeSurfaceReliefHighlight,
  seedLightingAndOccludersFromDecor,
  type DynamicLightSource,
  type ShadowZone,
  type LightOccluder,
} from '../src/game/storybookLighting';

describe('Storybook Illumination System (Headless Mechanics)', () => {
  describe('getPetrolejkaRadius', () => {
    it('returns 0 in daytime phases (noon, afternoon)', () => {
      expect(getPetrolejkaRadius(200, 200, 'noon', 0)).toBe(0);
      expect(getPetrolejkaRadius(200, 200, 'afternoon', 0)).toBe(0);
    });

    it('returns 0 when Kuráž is zero or exhausted', () => {
      expect(getPetrolejkaRadius(0, 200, 'night', 0)).toBe(0);
      expect(getPetrolejkaRadius(-10, 200, 'midnight', 0)).toBe(0);
    });

    it('returns broad warm radius at full Kuráž in night phases', () => {
      const radius = getPetrolejkaRadius(200, 200, 'night', 0);
      expect(radius).toBeGreaterThanOrEqual(210);
      expect(radius).toBeLessThanOrEqual(235);
    });

    it('contracts into a small flickering wick (< 90px) at critical Kuráž (< 25%)', () => {
      const radius = getPetrolejkaRadius(30, 200, 'midnight', 1.5); // 15% Kuráž
      expect(radius).toBeGreaterThanOrEqual(45);
      expect(radius).toBeLessThanOrEqual(85);
    });

    it('smoothly scales radius at moderate Kuráž (50%)', () => {
      const radius = getPetrolejkaRadius(100, 200, 'dusk', 0);
      expect(radius).toBeGreaterThanOrEqual(140);
      expect(radius).toBeLessThanOrEqual(175);
    });
  });

  describe('isPositionIlluminated', () => {
    const lantern: DynamicLightSource = {
      id: 'lantern_1',
      x: 100,
      y: 100,
      radius: 120,
      color: '#F59E0B',
      intensity: 1,
    };

    const treeShadow: ShadowZone = {
      id: 'shadow_tree_1',
      x: 300,
      y: 300,
      radius: 60,
    };

    it('identifies light inside lantern radius at night', () => {
      expect(isPositionIlluminated(110, 105, [lantern], 'night')).toBe(true);
      expect(isPositionIlluminated(400, 400, [lantern], 'night')).toBe(false);
    });

    it('identifies daylight in noon everywhere except inside shadow zones', () => {
      // Open field in noon is lit
      expect(isPositionIlluminated(0, 0, [], 'noon', [treeShadow])).toBe(true);

      // Under the tree in noon is in shadow (not directly illuminated)
      expect(isPositionIlluminated(300, 300, [], 'noon', [treeShadow])).toBe(false);

      // If a lantern or holy burst is under the tree, it overrides the shadow
      const underTreeLight: DynamicLightSource = {
        id: 'light_2',
        x: 300,
        y: 300,
        radius: 40,
        color: '#FFFFFF',
      };
      expect(isPositionIlluminated(300, 300, [underTreeLight], 'noon', [treeShadow])).toBe(true);
    });
  });

  describe('Stínová záštita (Shadow Defense)', () => {
    it('grants +35% speed and 40% damage resistance to shadow enemies in the dark', () => {
      const bubak = {
        id: 'bubak',
        category: 'shadows',
        hasShadowDefense: false,
        shadowVulnerabilityTimer: 0,
      };

      evaluateShadowDefense(bubak, false, 0.016);
      expect(bubak.hasShadowDefense).toBe(true);

      const multipliers = getShadowDefenseMultipliers(bubak);
      expect(multipliers.speedMult).toBe(1.35);
      expect(multipliers.damageTakenMult).toBe(0.60);
    });

    it('dissolves Stínová záštita when stepping into light, triggering stagger and vulnerability', () => {
      const onBreak = vi.fn();
      const bubak = {
        id: 'bubak',
        category: 'shadows',
        hasShadowDefense: true,
        stunTimer: 0,
        shadowVulnerabilityTimer: 0,
        interruptAttack: vi.fn(),
      };

      evaluateShadowDefense(bubak, true, 0.016, { onBreak });

      expect(bubak.hasShadowDefense).toBe(false);
      expect(bubak.stunTimer).toBe(0.25);
      expect(bubak.shadowVulnerabilityTimer).toBeGreaterThan(0);
      expect(bubak.interruptAttack).toHaveBeenCalled();
      expect(onBreak).toHaveBeenCalledWith(bubak);

      const multipliers = getShadowDefenseMultipliers(bubak);
      expect(multipliers.damageTakenMult).toBe(1.25); // +25% vulnerability
    });

    it('does not affect non-shadow categories', () => {
      const mysak = {
        id: 'mysak',
        category: 'swarms',
        hasShadowDefense: false,
      };

      evaluateShadowDefense(mysak, false, 0.016);
      expect(mysak.hasShadowDefense).toBe(false);

      const multipliers = getShadowDefenseMultipliers(mysak);
      expect(multipliers.speedMult).toBe(1);
      expect(multipliers.damageTakenMult).toBe(1);
    });
  });

  describe('updateLightSources', () => {
    it('counts down duration and removes expired sources', () => {
      const sources: DynamicLightSource[] = [
        { id: 'perm', x: 0, y: 0, radius: 100, color: '#FFF' },
        { id: 'temp1', x: 10, y: 10, radius: 50, color: '#FFF', duration: 1.0, maxDuration: 1.0 },
        { id: 'temp2', x: 20, y: 20, radius: 50, color: '#FFF', duration: 0.2, maxDuration: 0.5 },
      ];

      const updated = updateLightSources(sources, 0.5);
      expect(updated.find((s) => s.id === 'perm')).toBeDefined();
      expect(updated.find((s) => s.id === 'temp1')).toBeDefined();
      expect(updated.find((s) => s.id === 'temp2')).toBeUndefined(); // expired!
    });
  });

  describe('Bludička močálová aura', () => {
    it('attracts undead/swarms within its light aura toward the player', () => {
      const bludickaLight: DynamicLightSource = {
        id: 'bludicka_1',
        x: 100,
        y: 100,
        radius: 180,
        color: '#67E8F9',
        type: 'bludicka',
      };

      const kostlivec = { id: 'kostlivec', category: 'undead', x: 120, y: 120, bludickaAttracted: false };
      const cert = { id: 'cert', category: 'demons', x: 120, y: 120, bludickaAttracted: false };
      const distantZombie = { id: 'umrlec', category: 'undead', x: 600, y: 600, bludickaAttracted: false };

      evaluateBludickaAura([kostlivec, cert, distantZombie], [bludickaLight], { x: 0, y: 0 });

      expect(kostlivec.bludickaAttracted).toBe(true);
      expect(cert.bludickaAttracted).toBe(false);
      expect(distantZombie.bludickaAttracted).toBe(false);
    });
  });

  describe('Weapon and environmental light triggers', () => {
    it('creates appropriate light sources for weapons and entities', () => {
      const osika = createOsikovySlashLight(50, 50);
      expect(osika.type).toBe('osika');
      expect(osika.color).toBe('#7DD3FC');
      expect(osika.duration).toBe(0.4);

      const holy = createHolyCathedralLight(100, 100);
      expect(holy.type).toBe('holy');
      expect(holy.duration).toBe(3.5);

      const garlic = createGarlicHearthSpark(0, 0);
      expect(garlic.type).toBe('garlic');

      const cert = createCertEmberLight(200, 200);
      expect(cert.type).toBe('cert');
    });
  });

  describe('Dynamic 2D Vector Shadow Geometry (Occluder Raycasting)', () => {
    const cottageWall: LightOccluder = {
      id: 'cottage_wall',
      x: 200,
      y: 100,
      width: 40,
      height: 120,
    };

    const treeTrunk: LightOccluder = {
      id: 'tree_trunk',
      x: 200,
      y: 100,
      radius: 20,
    };

    it('extracts bounding segments from rectangular and circular occluders', () => {
      const boxSegs = computeOccluderSegments(cottageWall);
      expect(boxSegs.length).toBe(4);

      const circleSegs = computeOccluderSegments(treeTrunk);
      expect(circleSegs.length).toBe(8);
    });

    it('generates extruded shadow volumes extending away from the light source', () => {
      const volumes = computeShadowVolume(50, 100, 250, cottageWall);
      expect(volumes.length).toBeGreaterThan(0);
      for (const vol of volumes) {
        expect(vol.e1.x).toBeGreaterThan(vol.p1.x); // Extruded away from light at x=50
        expect(vol.e2.x).toBeGreaterThan(vol.p2.x);
      }
    });

    it('detects blocked line-of-sight rays through occluders', () => {
      // Light at (100, 100), Target at (300, 100), Wall at x=200, y in [40, 160]
      const blocked = isRayBlockedByOccluders(100, 100, 300, 100, [cottageWall]);
      expect(blocked).toBe(true);

      // Light at (100, 100), Target clearing above the wall at (300, -80)
      const clear = isRayBlockedByOccluders(100, 100, 300, -80, [cottageWall]);
      expect(clear).toBe(false);
    });

    it('denies illumination in isPositionIlluminated when occluded behind a wall', () => {
      const lantern: DynamicLightSource = {
        id: 'lantern',
        x: 100,
        y: 100,
        radius: 250,
        color: '#F59E0B',
      };

      // Unobstructed target is illuminated
      expect(isPositionIlluminated(150, 100, [lantern], 'night', [], [cottageWall])).toBe(true);

      // Target behind the cottage wall is in shadow
      expect(isPositionIlluminated(280, 100, [lantern], 'night', [], [cottageWall])).toBe(false);
    });
  });

  describe('2D Surface Relief and Normal Map Diffuse Shading', () => {
    it('calculates Lambertian diffuse shading: I = max(0, N · L) with distance attenuation', () => {
      const lightPos = { x: 100, y: 100, z: 35 };
      const surfacePos = { x: 100, y: 100 }; // directly underneath light
      const upwardNormal = { x: 0, y: 0, z: 1 }; // pointing out toward camera/light

      const diffuseIntensity = computeLambertianDiffuse(lightPos, surfacePos, upwardNormal, 1.0, 200);
      expect(diffuseIntensity).toBeGreaterThan(0.65);
      expect(diffuseIntensity).toBeLessThanOrEqual(1.0);

      // Normal facing away from light (dot product <= 0)
      const oppositeNormal = { x: 0, y: 0, z: -1 };
      const zeroIntensity = computeLambertianDiffuse(lightPos, surfacePos, oppositeNormal, 1.0, 200);
      expect(zeroIntensity).toBe(0);
    });

    it('maps surface tilt angles to unit normal vectors with depth Z', () => {
      const flat = computeNormalFromAngles(0, 0);
      expect(flat.x).toBe(0);
      expect(flat.y).toBe(0);
      expect(flat.z).toBe(1);

      const beveled = computeNormalFromAngles(0.6, 0);
      expect(beveled.x).toBe(0.6);
      expect(beveled.y).toBe(0);
      expect(beveled.z).toBeCloseTo(0.8);
      expect(Math.hypot(beveled.x, beveled.y, beveled.z)).toBeCloseTo(1.0);
    });

    it('computes directional surface relief highlight angle and intensity from nearby light', () => {
      const lantern: DynamicLightSource = {
        id: 'lantern',
        x: 150,
        y: 100,
        radius: 120,
        color: '#F59E0B',
      };

      const highlight = computeSurfaceReliefHighlight(100, 100, 20, [lantern]);
      expect(highlight).not.toBeNull();
      expect(highlight!.dominantDirAngle).toBeCloseTo(0, 1); // Lantern is directly to the right (+X, angle ~ 0)
      expect(highlight!.intensity).toBeGreaterThan(0.3);
      expect(highlight!.color).toBe('#F59E0B');
    });
  });

  describe('Decor lighting and occluder seeding', () => {
    it('seeds lights, shadow zones, and occluders from cottages and shrines', () => {
      const decorList = [
        { type: 'cottage', x: 200, y: 300, scale: 1 },
        { type: 'bozi_muka', x: 400, y: 500, scale: 1 },
        { type: 'tree', x: 100, y: 150, scale: 1 },
      ];

      const lights: DynamicLightSource[] = [];
      const shadows: ShadowZone[] = [];
      const occluders: LightOccluder[] = [];

      seedLightingAndOccludersFromDecor(decorList, lights, shadows, occluders);

      expect(lights.some((l) => l.type === 'window')).toBe(true);
      expect(lights.some((l) => l.type === 'bozi_muka')).toBe(true);
      expect(shadows.some((s) => s.id.includes('cottage_shadow'))).toBe(true);
      expect(occluders.some((o) => o.id.includes('cottage_occ'))).toBe(true);
      expect(occluders.some((o) => o.id.includes('tree_occ'))).toBe(true);
    });
  });
});
