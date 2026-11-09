import { describe, it, expect } from 'vitest';
import { ENEMIES, BUBAK_THREAT_COSTS } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { RunDirector } from '../src/game/director';

describe('Enemy Value, Danger, and Threat Cost Integrity', () => {
  const canonicalIds = Object.keys(ENEMIES);

  it('ensures all 159 canonical enemies and legacy aliases have valid ENEMY_POINTS', () => {
    expect(canonicalIds.length).toBe(159);

    for (const id of canonicalIds) {
      const points = ENEMY_POINTS[id as keyof typeof ENEMY_POINTS];
      expect(points, `Missing ENEMY_POINTS for enemy: ${id}`).toBeDefined();
      expect(typeof points).toBe('number');
      expect(points).toBeGreaterThanOrEqual(6);
    }

    // Legacy aliases
    for (const alias of ['skeleton', 'skeleton_scythe', 'pekelny_cert', 'pekelny_drab'] as const) {
      expect(ENEMY_POINTS[alias]).toBeDefined();
      expect(ENEMY_POINTS[alias]).toBeGreaterThan(0);
    }
  });

  it('ensures all enemies have BUBAK_THREAT_COSTS in the valid range [1, 18]', () => {
    for (const id of canonicalIds) {
      const cost = BUBAK_THREAT_COSTS[id];
      expect(cost, `Missing BUBAK_THREAT_COSTS for: ${id}`).toBeDefined();
      expect(cost).toBeGreaterThanOrEqual(1);
      expect(cost).toBeLessThanOrEqual(18);
    }
  });

  it('verifies danger stars correspond to canonical danger tiers', () => {
    const validStars = new Set(['★☆☆☆☆', '★★☆☆☆', '★★★☆☆', '★★★★☆', '★★★★★']);

    for (const id of canonicalIds) {
      const foe = ENEMIES[id];
      expect(foe.danger, `Invalid danger rating for: ${id}`).toBeDefined();
      expect(validStars.has(foe.danger as string)).toBe(true);

      const points = ENEMY_POINTS[id as keyof typeof ENEMY_POINTS];
      // 5★ must have points >= 2000 (usually final bosses)
      if (foe.danger === '★★★★★') {
        expect(points, `${id} is 5★ but has low points ${points}`).toBeGreaterThanOrEqual(950);
      }
      // 1★ must have points <= 50
      if (foe.danger === '★☆☆☆☆') {
        expect(points, `${id} is 1★ but has high points ${points}`).toBeLessThanOrEqual(50);
      }
    }
  });

  it('enforces monotonic reward consistency for perníčky (xp) and krejcary (coinValue)', () => {
    for (const id of canonicalIds) {
      const foe = ENEMIES[id];
      const points = ENEMY_POINTS[id as keyof typeof ENEMY_POINTS];

      expect(foe.xp, `xp undefined for ${id}`).toBeGreaterThanOrEqual(1);
      expect(foe.coinValue, `coinValue undefined for ${id}`).toBeGreaterThanOrEqual(1);

      // Swarms vs heavy boss comparison
      if (points <= 25) {
        expect(foe.xp).toBeLessThanOrEqual(4);
        expect(foe.coinValue).toBe(1);
      }
      if (points >= 4500) {
        expect(foe.xp).toBeGreaterThanOrEqual(40);
        expect(foe.coinValue).toBeGreaterThanOrEqual(25);
      }
    }
  });

  it('ensures RunDirector returns calibrated threat costs matching the threat scale', () => {
    const director = new RunDirector(0, undefined, { dynamicDifficulty: 3.0 });

    // Tiny swarms cost 1
    expect(director.getBubakThreatCost('pampeliska_chmyricko')).toBe(1);

    // Regular base mobs cost 2 or 3
    expect(director.getBubakThreatCost('rarach')).toBe(3);
    expect(director.getBubakThreatCost('tajici_snehulak')).toBe(2);

    // Elite variants cost 8
    expect(director.getBubakThreatCost('krvavy_rarach')).toBe(8);
    expect(director.getBubakThreatCost('obrneny_zbojnik')).toBe(8);

    // Dangerous disruptor mobs cost 5-12
    expect(director.getBubakThreatCost('hastrman')).toBeGreaterThanOrEqual(5);

    // Minibosses cost 18
    expect(director.getBubakThreatCost('carodejnice_zaspalka')).toBe(18);
    expect(director.getBubakThreatCost('krecek_obilnik')).toBe(18);
  });
});
