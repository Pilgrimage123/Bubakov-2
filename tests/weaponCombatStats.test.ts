import { describe, it, expect } from 'vitest';
import { getRankedWeaponStats, getMilestoneChoices } from '../src/data/weaponMilestones';
import { WEAPONS } from '../src/data/weapons';

describe('Weapon Combat Stats & Milestone Integration', () => {
  describe('getRankedWeaponStats modifier computations', () => {
    it('returns baseline stats at level 1 with no milestones', () => {
      const stats = getRankedWeaponStats('osikovy_prut', 1);
      expect(stats.damageMult).toBe(1);
      expect(stats.cooldownMult).toBe(1);
      expect(stats.areaRadiusMult).toBe(1);
      expect(stats.pierce).toBe(0);
      expect(stats.projectileCount).toBe(0);
      expect(stats.knockbackMult).toBe(1);
      expect(stats.statusDurationSec).toBe(0);
    });

    it('scales baseline stats with level progression', () => {
      // rank 2 has +12% damage, +6% area
      const stats2 = getRankedWeaponStats('osikovy_prut', 2);
      expect(stats2.damageMult).toBeCloseTo(1.12, 5);
      expect(stats2.areaRadiusMult).toBeCloseTo(1.06, 5);
      expect(stats2.cooldownMult).toBe(1);
    });

    it('alters output stats predictably for damage scaling and cooldown reduction', () => {
      // osikovy_prut choice 'cane_burst_3': { baseDamageMult: 1.18, cooldownMult: 0.97 }
      const stats = getRankedWeaponStats('osikovy_prut', 3, {
        milestones: ['cane_burst_3'],
      });
      // rank 3 base damageMult = 1 + 2*0.12 = 1.24. With choice: 1.24 * 1.18 = 1.4632
      expect(stats.damageMult).toBeCloseTo(1.24 * 1.18, 4);
      expect(stats.cooldownMult).toBeCloseTo(0.97, 4);
    });

    it('alters output stats predictably for projectileCountDelta and statusDurationSec', () => {
      // povidlove_buchty choice 'buns_crowd_3': { projectileCountDelta: 1, statusDurationSec: 2.2 }
      const stats = getRankedWeaponStats('povidlove_buchty', 3, {
        milestones: ['buns_crowd_3'],
      });
      expect(stats.projectileCount).toBe(1);
      expect(stats.statusDurationSec).toBe(2.2);
    });

    it('alters output stats predictably for pierceDelta', () => {
      // povidlove_buchty choice 'buns_burst_5': { baseDamageMult: 1.22, pierceDelta: 1, cooldownMult: 0.95 }
      const stats = getRankedWeaponStats('povidlove_buchty', 5, {
        milestones: ['buns_burst_3', 'buns_burst_5'],
      });
      expect(stats.pierce).toBe(1);
      expect(stats.cooldownMult).toBeCloseTo(0.95 * 0.95, 4);
    });

    it('alters output stats predictably for areaRadiusMult and knockbackMult', () => {
      // kovarske_vidle choice 'pitchfork_crowd_3': { areaRadiusMult: 1.16, knockbackMult: 1.25 }
      const stats = getRankedWeaponStats('kovarske_vidle', 3, {
        milestones: ['pitchfork_crowd_3'],
      });
      // rank 3 base areaRadiusMult = 1 + 2 * 0.06 = 1.12. With choice: 1.12 * 1.16 = 1.2992
      expect(stats.areaRadiusMult).toBeCloseTo(1.12 * 1.16, 4);
      expect(stats.knockbackMult).toBeCloseTo(1.25, 4);
    });

    it('supports milestone map objects as well as arrays', () => {
      const statsFromArray = getRankedWeaponStats('kysela_okurka', 3, {
        milestones: ['pickle_crowd_3'],
      });
      const statsFromMap = getRankedWeaponStats('kysela_okurka', 3, {
        milestones: { 3: 'pickle_crowd_3' },
      });
      expect(statsFromArray).toEqual(statsFromMap);
      expect(statsFromMap.projectileCount).toBe(1);
    });

    it('correctly maps legacy weapon aliases to canonical stats', () => {
      const canonicalStats = getRankedWeaponStats('povidlove_buchty', 3, {
        milestones: ['buns_crowd_3'],
      });
      const aliasStats = getRankedWeaponStats('buns', 3, {
        milestones: ['buns_crowd_3'],
      });
      expect(aliasStats).toEqual(canonicalStats);
    });

    it('accumulates multiple milestone ranks (3, 5, 8)', () => {
      // vceli_roj:
      // 3: bees_crowd_3 (+2 proj, area 1.10)
      // 5: bees_crowd_5 (+2 proj, knockback 1.20, cd 0.96)
      // 8: bees_crowd_8 (+4 proj, area 1.20, cd 0.90)
      const stats = getRankedWeaponStats('vceli_roj', 8, {
        milestones: ['bees_crowd_3', 'bees_crowd_5', 'bees_crowd_8'],
      });
      expect(stats.projectileCount).toBe(2 + 2 + 4);
      expect(stats.knockbackMult).toBeCloseTo(1.20, 4);
      expect(stats.cooldownMult).toBeCloseTo(0.96 * 0.90, 4);
    });
  });

  describe('Weapon firing execution incorporates ranked stats', () => {
    function createMockPlayer(weaponId: string, level: number, milestones: string[] = []) {
      const projectiles: any[] = [];
      const slashes: any[] = [];
      const areaImpacts: any[] = [];
      const pulses: any[] = [];

      const firingWeapon = {
        id: weaponId,
        level,
        milestones,
      };

      const player = {
        x: 100,
        y: 100,
        lastDx: 1,
        lastDy: 0,
        animTime: 0,
        valecniceAngle: 0,
        hasSoakedCane: false,
        cooldownBonus: 0,
        cooldownMultiplier: 1,
        damageMultiplier: 1,
        tulakDamageBonus: 0,
        _firingWeapon: firingWeapon,
        getNearbyEnemies: (_r: number) => [{ x: 120, y: 100, radius: 10, hunger: 0, foodResist: 0, isDefeated: false }],
        getLivingEnemies: () => [{ x: 120, y: 100, radius: 10, hunger: 0, foodResist: 0, isDefeated: false }],
        distTo: (e: any) => Math.hypot(e.x - 100, e.y - 100),
        spawnProjectile: (p: any) => projectiles.push(p),
        spawnMeleeSlash: (s: any) => slashes.push(s),
        spawnAreaImpact: (a: any) => areaImpacts.push(a),
        spawnHromnickaPulse: (reach: number, dmg: number, lvl: number, knockbackMult = 1, stunDuration = 0) =>
          pulses.push({ reach, dmg, lvl, knockbackMult, stunDuration }),
        projectiles,
        slashes,
        areaImpacts,
        pulses,
      };

      return { player, firingWeapon, projectiles, slashes, areaImpacts, pulses };
    }

    it('povidlove_buchty respects projectileCountDelta, damageMult, statusDurationSec, and pierceDelta', () => {
      const { player, projectiles } = createMockPlayer('povidlove_buchty', 5, ['buns_crowd_3', 'buns_burst_5']);
      const wDef = WEAPONS.povidlove_buchty;
      wDef.fire(player, 5);

      // Level 5 base count = 1 + floor(4/2) = 3. Plus buns_crowd_3 (+1) = 4 projectiles
      expect(projectiles).toHaveLength(4);
      // buns_crowd_3 statusDurationSec = 2.2
      expect(projectiles[0].snackDuration).toBe(2.2);
      // buns_burst_5 pierceDelta = 1
      expect(projectiles[0].pierce).toBe(1);
      // damageMult should be > 1
      expect(projectiles[0].dmg).toBeGreaterThan(22);
    });

    it('dreveny_cep respects areaRadiusMult, damageMult, knockbackMult, and statusDurationSec', () => {
      const { player, areaImpacts } = createMockPlayer('dreveny_cep', 5, ['flail_crowd_3', 'flail_crowd_5']);
      const wDef = WEAPONS.dreveny_cep;
      wDef.fire(player, 5);

      expect(areaImpacts).toHaveLength(1);
      const impact = areaImpacts[0];
      // flail_crowd_3 areaRadiusMult: 1.20, flail_crowd_5: 1.25
      // Base radius at lvl 5 was 65 + 50 = 115. Multiplied by areaRadiusMult
      expect(impact.radius).toBeGreaterThan(115);
      expect(impact.knockbackMult).toBeGreaterThan(1);
      // flail_crowd_5 statusDurationSec = 1.0
      expect(impact.stunDuration).toBe(1.0);
    });

    it('devatero_kviti respects projectileCountDelta, areaRadiusMult, and pierce', () => {
      const { player, projectiles } = createMockPlayer('devatero_kviti', 5, ['herbs_crowd_3', 'herbs_crowd_5']);
      const wDef = WEAPONS.devatero_kviti;
      wDef.fire(player, 5);

      // Base count at lvl 5 = 3 + floor(4/2) = 5. Herbs crowd 3 (+1) + Herbs crowd 5 (+2) = 8
      expect(projectiles).toHaveLength(8);
      // areaRadiusMult increases radius
      expect(projectiles[0].radius).toBeGreaterThan(14);
    });

    it('svecena_kropenka respects projectileCountDelta, pierce, and knockbackMult', () => {
      const { player, projectiles } = createMockPlayer('svecena_kropenka', 3, ['holy_crowd_3']);
      const wDef = WEAPONS.svecena_kropenka;
      wDef.fire(player, 3);

      // Base count at lvl 3 = 5 + floor(2/2) = 6. holy_crowd_3 adds +2 => 8
      expect(projectiles).toHaveLength(8);
      expect(projectiles[0].dmg).toBeGreaterThan(22);
    });

    it('kovarske_vidle respects areaRadiusMult and knockbackMult on melee slash', () => {
      const { player, slashes } = createMockPlayer('kovarske_vidle', 3, ['pitchfork_crowd_3']);
      const wDef = WEAPONS.kovarske_vidle;
      wDef.fire(player, 3);

      expect(slashes).toHaveLength(1);
      const slash = slashes[0];
      expect(slash.reach).toBeGreaterThan(130 + 3 * 16);
      expect(slash.knockbackMult).toBe(1.25);
    });

    it('hromnicka pulse respects areaRadiusMult, knockbackMult, and statusDurationSec', () => {
      const { player, pulses } = createMockPlayer('hromnicka', 5, ['candle_crowd_3', 'candle_crowd_5']);
      const wDef = WEAPONS.hromnicka;
      wDef.fire(player, 5);

      expect(pulses).toHaveLength(1);
      const pulse = pulses[0];
      expect(pulse.reach).toBeGreaterThan(135 + 5 * 15);
      expect(pulse.knockbackMult).toBeGreaterThan(1.25);
      expect(pulse.stunDuration).toBe(2.0);
    });
  });
});
