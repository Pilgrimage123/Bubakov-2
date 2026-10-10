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
  type DynamicLightSource,
  type ShadowZone,
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
});
