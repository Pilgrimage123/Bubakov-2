import { describe, it, expect } from 'vitest';
import {
  WEAPONS_WITH_MILESTONES,
  WEAPON_RANK_DEFS,
  validateWeaponMilestones,
  getWeaponRankDef,
  getMilestoneChoices,
  getRankedWeaponStats,
  getMeleeNormalUpgrade,
  getAuraNormalUpgrade,
  getWeaponNormalUpgrade,
  MELEE_NORMAL_UPGRADES,
  AURA_NORMAL_UPGRADES,
  MELEE_WEAPONS,
  AURA_WEAPONS,
  COOLDOWN_REDUCTION_CAP,
  getEffectiveWeaponCooldown,
  getWeaponCooldownReduction,
  getWeaponCooldownReductionHeadroom,
  isWeaponAtCooldownCap,
  isWeaponNearCooldownCap,
  PROJECTILE_NORMAL_UPGRADES,
  PROJECTILE_WEAPONS,
  getProjectileNormalUpgrade,
  getWeaponCategory,
  getEligibleNormalUpgrades,
  rollRandomWeaponUpgrade,
} from '../src/data/weaponMilestones';
import type { WeaponId } from '../src/types';

const CANONICAL_18_WEAPONS: WeaponId[] = [
  'osikovy_prut',
  'valecnice',
  'cesnekova_topinka',
  'kysela_okurka',
  'povidlove_buchty',
  'kovarske_vidle',
  'kovana_halapartna',
  'dreveny_cep',
  'devatero_kviti',
  'snehova_koule',
  'kynuty_kolac',
  'horky_brambor',
  'vceli_roj',
  'hromnicka',
  'svecena_kropenka',
  'bylinkova_fajfka',
  'formansky_bic',
  'splaseny_houser',
];

describe('Weapon Milestones System', () => {
  it('contains all 18 canonical weapons in WEAPONS_WITH_MILESTONES', () => {
    expect(WEAPONS_WITH_MILESTONES).toHaveLength(18);
    expect(new Set(WEAPONS_WITH_MILESTONES)).toEqual(new Set(CANONICAL_18_WEAPONS));
  });

  it('passes validateWeaponMilestones() without throwing', () => {
    expect(() => validateWeaponMilestones()).not.toThrow();
    expect(validateWeaponMilestones()).toBe(true);
  });

  it('has 8 ranks for every canonical weapon with correct milestone flags', () => {
    for (const weaponId of CANONICAL_18_WEAPONS) {
      const defs = WEAPON_RANK_DEFS[weaponId];
      expect(defs, `Defs for ${weaponId} must exist`).toBeDefined();
      expect(defs).toHaveLength(8);

      defs?.forEach((rankDef, index) => {
        const rank = index + 1;
        expect(rankDef.rank).toBe(rank);
        const isMilestoneRank = rank === 3 || rank === 5 || rank === 8;
        expect(rankDef.isMilestone).toBe(isMilestoneRank);

        if (isMilestoneRank) {
          expect(rankDef.choices, `${weaponId} rank ${rank} must have choices`).toBeDefined();
          expect(rankDef.choices).toHaveLength(2);
        } else {
          expect(rankDef.choices).toBeUndefined();
        }
      });
    }
  });

  it('has unique IDs and valid fields for all milestone choices across all weapons', () => {
    const seenChoiceIds = new Set<string>();

    for (const weaponId of CANONICAL_18_WEAPONS) {
      for (const rank of [3, 5, 8] as const) {
        const choices = getMilestoneChoices(weaponId, rank);
        expect(choices, `Choices for ${weaponId} rank ${rank}`).toBeDefined();
        if (!choices) continue;

        expect(choices).toHaveLength(2);
        const [c1, c2] = choices;
        expect(c1.id).not.toBe(c2.id);

        for (const choice of choices) {
          expect(choice.id).toBeTruthy();
          expect(seenChoiceIds.has(choice.id), `Duplicate choice id: ${choice.id}`).toBe(false);
          seenChoiceIds.add(choice.id);

          expect(choice.name).toBeTruthy();
          expect(typeof choice.name).toBe('string');
          expect(choice.name.trim().length).toBeGreaterThan(0);

          expect(choice.description).toBeTruthy();
          expect(typeof choice.description).toBe('string');
          expect(choice.description.trim().length).toBeGreaterThan(0);

          expect(choice.visualEffectTag).toBeTruthy();
          expect(choice.audioSfx).toBeTruthy();

          expect(choice.statModifiers).toBeDefined();
          const mods = choice.statModifiers;
          if (mods.baseDamageMult !== undefined) {
            expect(mods.baseDamageMult).toBeGreaterThan(0);
          }
          if (mods.cooldownMult !== undefined) {
            expect(mods.cooldownMult).toBeGreaterThan(0);
          }
          if (mods.areaRadiusMult !== undefined) {
            expect(mods.areaRadiusMult).toBeGreaterThan(0);
          }
          if (mods.knockbackMult !== undefined) {
            expect(mods.knockbackMult).toBeGreaterThan(0);
          }
          if (mods.statusDurationSec !== undefined) {
            expect(mods.statusDurationSec).toBeGreaterThan(0);
          }
          if (mods.projectileCountDelta !== undefined) {
            expect(mods.projectileCountDelta).toBeGreaterThanOrEqual(1);
          }
          if (mods.pierceDelta !== undefined) {
            expect(mods.pierceDelta).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }

    // 18 weapons * 3 milestone ranks * 2 choices = 108 distinct choices
    expect(seenChoiceIds.size).toBe(108);
  });

  it('computes ranked stats correctly with milestones chosen', () => {
    for (const weaponId of CANONICAL_18_WEAPONS) {
      const rankDef1 = getWeaponRankDef(weaponId, 1);
      expect(rankDef1).toBeDefined();
      expect(rankDef1?.rank).toBe(1);

      const stats1 = getRankedWeaponStats(weaponId, 1);
      expect(stats1.damageMult).toBe(1);

      const choicesRank3 = getMilestoneChoices(weaponId, 3);
      expect(choicesRank3).toBeDefined();
      if (!choicesRank3) continue;

      const statsRank3 = getRankedWeaponStats(weaponId, 3, {
        milestones: [choicesRank3[0].id],
      });
      expect(statsRank3.damageMult).toBeGreaterThan(0);
    }
  });

  describe('Melee Normal Upgrades System', () => {
    it('contains all 6 specified melee normal upgrades with valid stats and ui_text', () => {
      const expectedUpgrades = [
        {
          id: 'melee_cleave',
          name: 'Široký rozmach',
          ui_text: '+120 % velikost švihu, -20 % zranění',
          stats: { area_bonus: 1.20, damage_bonus: -0.20, cooldown_reduction: 0.00 },
        },
        {
          id: 'melee_reach',
          name: 'Prodloužený dosah',
          ui_text: '+60 % velikost švihu',
          stats: { area_bonus: 0.60, damage_bonus: 0.00, cooldown_reduction: 0.00 },
        },
        {
          id: 'melee_flurry',
          name: 'Svižná ruka',
          ui_text: '-30 % cooldown',
          stats: { area_bonus: 0.00, damage_bonus: 0.00, cooldown_reduction: 0.30 },
        },
        {
          id: 'melee_heavy',
          name: 'Drtivý dopad',
          ui_text: '+100 % zranění',
          stats: { area_bonus: 0.00, damage_bonus: 1.00, cooldown_reduction: 0.00 },
        },
        {
          id: 'melee_titan',
          name: 'Titánský švih',
          ui_text: '+60 % zranění, +40 % velikost švihu',
          stats: { area_bonus: 0.40, damage_bonus: 0.60, cooldown_reduction: 0.00 },
        },
        {
          id: 'melee_frenzy',
          name: 'Zběsilé sekání',
          ui_text: '-45 % cooldown, -25 % velikost švihu',
          stats: { area_bonus: -0.25, damage_bonus: 0.00, cooldown_reduction: 0.45 },
        },
      ];

      for (const expected of expectedUpgrades) {
        const upgrade = getMeleeNormalUpgrade(expected.id);
        expect(upgrade, `Upgrade ${expected.id} should be defined`).toBeDefined();
        expect(upgrade?.name).toBe(expected.name);
        expect(upgrade?.ui_text).toBe(expected.ui_text);
        expect(upgrade?.stats.area_bonus).toBeCloseTo(expected.stats.area_bonus, 2);
        expect(upgrade?.stats.damage_bonus).toBeCloseTo(expected.stats.damage_bonus, 2);
        expect(upgrade?.stats.cooldown_reduction).toBeCloseTo(expected.stats.cooldown_reduction, 2);
      }
    });

    it('replaces simple generic upgrades on melee weapons (prut, vidle, halapartna, cep, valecnice, formansky_bic)', () => {
      for (const weaponId of ['osikovy_prut', 'kovarske_vidle', 'kovana_halapartna', 'dreveny_cep', 'valecnice', 'formansky_bic'] as const) {
        for (const rank of [2, 4, 6, 7] as const) {
          const rankDef = getWeaponRankDef(weaponId, rank);
          expect(rankDef).toBeDefined();
          expect(rankDef?.isMilestone).toBe(false);
          expect(rankDef?.normalUpgradeId).toBeDefined();
          expect(rankDef?.normalUpgradeName).toBeDefined();
          // Description is formatted as `${name}: ${ui_text}` rather than generic '+12 % damage...'
          expect(rankDef?.passiveBonusDescription).toContain(rankDef?.normalUpgradeName);
          expect(rankDef?.passiveBonusDescription).not.toContain('+12 % damage');
        }
      }
    });

    it('accumulates stats accurately across ranks for osikovy_prut', () => {
      // Rank 1: base
      const r1 = getWeaponRankDef('osikovy_prut', 1);
      expect(r1?.flatDamageBonus).toBe(0);
      expect(r1?.areaBonus).toBe(0);
      expect(r1?.cooldownReductionBonus).toBe(0);

      // Rank 2: melee_flurry (-30% cd)
      const r2 = getWeaponRankDef('osikovy_prut', 2);
      expect(r2?.normalUpgradeId).toBe('melee_flurry');
      expect(r2?.cooldownReductionBonus).toBeCloseTo(0.30, 2);
      expect(r2?.areaBonus).toBe(0);
      expect(r2?.flatDamageBonus).toBe(0);

      // Rank 4: melee_reach (+60% area)
      const r4 = getWeaponRankDef('osikovy_prut', 4);
      expect(r4?.normalUpgradeId).toBe('melee_reach');
      expect(r4?.areaBonus).toBeCloseTo(0.60, 2);
      expect(r4?.cooldownReductionBonus).toBeCloseTo(0.30, 2);

      // Rank 6: melee_frenzy (-45% cd, -25% area) -> area = 0.60 - 0.25 = 0.35, cd = 0.30 + 0.45 = 0.75
      const r6 = getWeaponRankDef('osikovy_prut', 6);
      expect(r6?.normalUpgradeId).toBe('melee_frenzy');
      expect(r6?.areaBonus).toBeCloseTo(0.35, 2);
      expect(r6?.cooldownReductionBonus).toBeCloseTo(0.75, 2);

      // Rank 7: melee_titan (+60% dmg, +40% area) -> area = 0.35 + 0.40 = 0.75, dmg = 0.60, cd = 0.75
      const r7 = getWeaponRankDef('osikovy_prut', 7);
      expect(r7?.normalUpgradeId).toBe('melee_titan');
      expect(r7?.flatDamageBonus).toBeCloseTo(0.60, 2);
      expect(r7?.areaBonus).toBeCloseTo(0.75, 2);
      expect(r7?.cooldownReductionBonus).toBeCloseTo(0.75, 2);
    });

    it('accumulates stats accurately for kovářské vidle (reach -> heavy -> flurry -> titan)', () => {
      // Rank 2: melee_reach (+60% area)
      const r2 = getWeaponRankDef('kovarske_vidle', 2);
      expect(r2?.normalUpgradeId).toBe('melee_reach');
      expect(r2?.areaBonus).toBeCloseTo(0.60, 2);

      // Rank 4: melee_heavy (+100% damage)
      const r4 = getWeaponRankDef('kovarske_vidle', 4);
      expect(r4?.normalUpgradeId).toBe('melee_heavy');
      expect(r4?.flatDamageBonus).toBeCloseTo(1.00, 2);
      expect(r4?.areaBonus).toBeCloseTo(0.60, 2);

      // Rank 6: melee_flurry (-30% cooldown)
      const r6 = getWeaponRankDef('kovarske_vidle', 6);
      expect(r6?.normalUpgradeId).toBe('melee_flurry');
      expect(r6?.cooldownReductionBonus).toBeCloseTo(0.30, 2);

      // Rank 7: melee_titan (+60% damage, +40% area)
      const r7 = getWeaponRankDef('kovarske_vidle', 7);
      expect(r7?.normalUpgradeId).toBe('melee_titan');
      expect(r7?.flatDamageBonus).toBeCloseTo(1.60, 2);
      expect(r7?.areaBonus).toBeCloseTo(1.00, 2);
    });
  });

  describe('Aura Normal Upgrades System', () => {
    it('contains all 6 specified aura normal upgrades with valid stats and ui_text', () => {
      const upgradeIds = [
        'aura_overgrowth',
        'aura_reach',
        'aura_pulse',
        'aura_intensity',
        'aura_unstable',
        'aura_singularity',
      ];
      expect(Object.keys(AURA_NORMAL_UPGRADES)).toEqual(upgradeIds);

      // aura_overgrowth: +85% area, -25% damage
      const overgrowth = getAuraNormalUpgrade('aura_overgrowth');
      expect(overgrowth).toBeDefined();
      expect(overgrowth?.name).toBe('Rozpínavé pole');
      expect(overgrowth?.ui_text).toContain('+85 %');
      expect(overgrowth?.stats.area_bonus).toBe(0.85);
      expect(overgrowth?.stats.damage_bonus).toBe(-0.25);
      expect(overgrowth?.stats.cooldown_reduction).toBe(0);

      // aura_reach: +45% area
      const reach = getAuraNormalUpgrade('aura_reach');
      expect(reach).toBeDefined();
      expect(reach?.stats.area_bonus).toBe(0.45);
      expect(reach?.stats.damage_bonus).toBe(0);
      expect(reach?.stats.cooldown_reduction).toBe(0);

      // aura_pulse: -30% cooldown
      const pulse = getAuraNormalUpgrade('aura_pulse');
      expect(pulse).toBeDefined();
      expect(pulse?.stats.area_bonus).toBe(0);
      expect(pulse?.stats.damage_bonus).toBe(0);
      expect(pulse?.stats.cooldown_reduction).toBe(0.30);

      // aura_intensity: +100% damage
      const intensity = getAuraNormalUpgrade('aura_intensity');
      expect(intensity).toBeDefined();
      expect(intensity?.stats.area_bonus).toBe(0);
      expect(intensity?.stats.damage_bonus).toBe(1.00);
      expect(intensity?.stats.cooldown_reduction).toBe(0);

      // aura_unstable: +60% damage, +30% area
      const unstable = getAuraNormalUpgrade('aura_unstable');
      expect(unstable).toBeDefined();
      expect(unstable?.stats.area_bonus).toBe(0.30);
      expect(unstable?.stats.damage_bonus).toBe(0.60);
      expect(unstable?.stats.cooldown_reduction).toBe(0);

      // aura_singularity: +120% damage, -30% cooldown, -35% area
      const sing = getAuraNormalUpgrade('aura_singularity');
      expect(sing).toBeDefined();
      expect(sing?.stats.area_bonus).toBe(-0.35);
      expect(sing?.stats.damage_bonus).toBe(1.20);
      expect(sing?.stats.cooldown_reduction).toBe(0.30);
    });

    it('replaces simple generic upgrades on aura weapons (hromnicka, cesnekova_topinka, bylinkova_fajfka)', () => {
      expect(AURA_WEAPONS).toEqual(['hromnicka', 'cesnekova_topinka', 'bylinkova_fajfka']);

      for (const weaponId of AURA_WEAPONS) {
        expect(getWeaponCategory(weaponId)).toBe('aura');
        for (const rank of [2, 4, 6, 7] as const) {
          const rankDef = getWeaponRankDef(weaponId, rank);
          expect(rankDef?.normalUpgradeId).toBeDefined();
          expect(getAuraNormalUpgrade(rankDef?.normalUpgradeId!)).toBeDefined();
        }
      }
    });

    it('accumulates stats accurately across ranks for hromnička default progression (reach -> intensity -> pulse -> unstable)', () => {
      // Rank 2: aura_reach (+45% area)
      const r2 = getWeaponRankDef('hromnicka', 2);
      expect(r2?.normalUpgradeId).toBe('aura_reach');
      expect(r2?.areaBonus).toBeCloseTo(0.45, 2);

      // Rank 4: aura_intensity (+100% damage) -> area = 0.45, dmg = 1.00
      const r4 = getWeaponRankDef('hromnicka', 4);
      expect(r4?.normalUpgradeId).toBe('aura_intensity');
      expect(r4?.flatDamageBonus).toBeCloseTo(1.00, 2);
      expect(r4?.areaBonus).toBeCloseTo(0.45, 2);

      // Rank 6: aura_pulse (-30% cooldown) -> area = 0.45, dmg = 1.00, cd = 0.30
      const r6 = getWeaponRankDef('hromnicka', 6);
      expect(r6?.normalUpgradeId).toBe('aura_pulse');
      expect(r6?.cooldownReductionBonus).toBeCloseTo(0.30, 2);

      // Rank 7: aura_unstable (+60% dmg, +30% area) -> area = 0.75, dmg = 1.60, cd = 0.30
      const r7 = getWeaponRankDef('hromnicka', 7);
      expect(r7?.normalUpgradeId).toBe('aura_unstable');
      expect(r7?.flatDamageBonus).toBeCloseTo(1.60, 2);
      expect(r7?.areaBonus).toBeCloseTo(0.75, 2);
      expect(r7?.cooldownReductionBonus).toBeCloseTo(0.30, 2);
    });
  });

  describe('Bylinková fajfka Weapon and Milestone Integrity', () => {
    it('is registered as a canonical weapon with 8 ranks and correct milestone ranks', () => {
      expect(CANONICAL_18_WEAPONS).toContain('bylinkova_fajfka');
      for (let r = 1; r <= 8; r++) {
        const def = getWeaponRankDef('bylinkova_fajfka', r);
        expect(def).toBeDefined();
        expect(def?.rank).toBe(r);
        if (r === 3 || r === 5 || r === 8) {
          expect(def?.isMilestone).toBe(true);
          expect(def?.choices).toHaveLength(2);
        } else {
          expect(def?.isMilestone).toBe(false);
        }
      }
    });

    it('does NOT have knockback in any of its milestone choices', () => {
      const choices3 = getMilestoneChoices('bylinkova_fajfka', 3)!;
      const choices5 = getMilestoneChoices('bylinkova_fajfka', 5)!;
      const choices8 = getMilestoneChoices('bylinkova_fajfka', 8)!;

      for (const choice of [...choices3, ...choices5, ...choices8]) {
        expect(choice.statModifiers.knockbackMult).toBeUndefined();
      }

      // Verify specific milestone choices exist with appropriate bonuses
      expect(choices3.map((c) => c.id)).toEqual(['pipe_cloud_3', 'pipe_burst_3']);
      expect(choices5.map((c) => c.id)).toEqual(['pipe_cloud_5', 'pipe_burst_5']);
      expect(choices8.map((c) => c.id)).toEqual(['pipe_cloud_8', 'pipe_burst_8']);

      // Rank 3 choices offer area/duration or damage/cooldown
      expect(choices3[0].statModifiers.areaRadiusMult).toBe(1.25);
      expect(choices3[0].statModifiers.statusDurationSec).toBe(1.5);
      expect(choices3[1].statModifiers.baseDamageMult).toBe(1.25);
      expect(choices3[1].statModifiers.cooldownMult).toBe(0.94);

      // Rank 8 choices offer large area/duration/cooldown or heavy damage/cooldown (no knockback)
      expect(choices8[0].statModifiers.areaRadiusMult).toBe(1.40);
      expect(choices8[0].statModifiers.statusDurationSec).toBe(3.5);
      expect(choices8[0].statModifiers.cooldownMult).toBe(0.92);
      expect(choices8[1].statModifiers.baseDamageMult).toBe(1.40);
      expect(choices8[1].statModifiers.cooldownMult).toBe(0.85);
    });
  });

  describe('Cadence Cap and Dynamic Normal Upgrades Stacking', () => {
    it('enforces COOLDOWN_REDUCTION_CAP of 0.75 (75%)', () => {
      expect(COOLDOWN_REDUCTION_CAP).toBe(0.75);
    });

    it('calculates cooldown reduction and headroom correctly', () => {
      const weaponEmpty = { id: 'osikovy_prut', level: 1, normalUpgrades: [] };
      expect(getWeaponCooldownReduction(weaponEmpty)).toBe(0);
      expect(getWeaponCooldownReductionHeadroom(weaponEmpty)).toBe(0.75);
      expect(isWeaponAtCooldownCap(weaponEmpty)).toBe(false);
      expect(isWeaponNearCooldownCap(weaponEmpty)).toBe(false);

      const weaponWithFlurry = {
        id: 'osikovy_prut',
        level: 2,
        normalUpgrades: ['melee_flurry'],
      };
      expect(getWeaponCooldownReduction(weaponWithFlurry)).toBeCloseTo(0.30, 2);
      expect(getWeaponCooldownReductionHeadroom(weaponWithFlurry)).toBeCloseTo(0.45, 2);

      const weaponNearCap = {
        id: 'osikovy_prut',
        level: 4,
        normalUpgrades: ['melee_flurry', 'melee_frenzy'], // 0.30 + 0.45 = 0.75
      };
      expect(getWeaponCooldownReduction(weaponNearCap)).toBeCloseTo(0.75, 2);
      expect(getWeaponCooldownReductionHeadroom(weaponNearCap)).toBeCloseTo(0.00, 2);
      expect(isWeaponAtCooldownCap(weaponNearCap)).toBe(true);
      expect(isWeaponNearCooldownCap(weaponNearCap)).toBe(true);
    });

    it('filters out cooldown reduction upgrades when headroom is less than 10%', () => {
      // Simulate weapon at 0.70 cooldown reduction (headroom = 0.05 < 0.10)
      const weaponNearCap = {
        id: 'osikovy_prut',
        level: 4,
        normalUpgrades: ['melee_frenzy'], // 0.45 cooldown reduction
      };
      // For melee: with 0.45 cd reduction, headroom is 0.30 >= 0.10, so all 6 upgrades are available
      const fullMeleePool = getEligibleNormalUpgrades('osikovy_prut', weaponNearCap);
      expect(fullMeleePool).toHaveLength(6);

      // Now create weapon with 0.70 cd reduction
      const cappedMelee = {
        id: 'osikovy_prut',
        level: 5,
        normalUpgrades: ['melee_flurry', 'melee_flurry', 'melee_flurry'], // 3 * 0.30 = 0.90 -> headroom = 0
      };
      const filteredMelee = getEligibleNormalUpgrades('osikovy_prut', cappedMelee);
      expect(filteredMelee.length).toBeLessThan(6);
      expect(filteredMelee.some((u) => u.id === 'melee_flurry')).toBe(false);
      expect(filteredMelee.some((u) => u.id === 'melee_frenzy')).toBe(false);
      // Non-cooldown upgrades remain
      expect(filteredMelee.some((u) => u.id === 'melee_cleave')).toBe(true);
      expect(filteredMelee.some((u) => u.id === 'melee_reach')).toBe(true);
      expect(filteredMelee.some((u) => u.id === 'melee_heavy')).toBe(true);
      expect(filteredMelee.some((u) => u.id === 'melee_titan')).toBe(true);

      // Same test for aura pool
      const cappedAura = {
        id: 'hromnicka',
        level: 4,
        normalUpgrades: ['aura_pulse', 'aura_singularity'], // 0.30 + 0.30 = 0.60 cd reduction, headroom = 0.15 >= 0.10
      };
      expect(getEligibleNormalUpgrades('hromnicka', cappedAura)).toHaveLength(6);

      const maxedAura = {
        id: 'hromnicka',
        level: 6,
        normalUpgrades: ['aura_pulse', 'aura_singularity', 'aura_pulse'], // 0.30 + 0.30 + 0.30 = 0.90 cd reduction, headroom = 0
      };
      const filteredAura = getEligibleNormalUpgrades('hromnicka', maxedAura);
      expect(filteredAura.some((u) => u.id === 'aura_pulse')).toBe(false);
      expect(filteredAura.some((u) => u.id === 'aura_singularity')).toBe(false);
      expect(filteredAura.some((u) => u.id === 'aura_overgrowth')).toBe(true);
      expect(filteredAura.some((u) => u.id === 'aura_intensity')).toBe(true);
    });

    it('supports repeating/duplicate upgrades with replacement and properly aggregates stats', () => {
      // Weapon with 2x melee_heavy (+100% damage each)
      const weapon2xHeavy = {
        id: 'kovarske_vidle',
        level: 3,
        normalUpgrades: ['melee_heavy', 'melee_heavy'],
      };
      const stats2x = getRankedWeaponStats('kovarske_vidle', 3, weapon2xHeavy);
      // damageMult = 1 + (1.00 + 1.00) = 3.00
      expect(stats2x.damageMult).toBeCloseTo(3.00, 2);

      // Weapon with 3x aura_pulse: raw cd reduction = 0.90, capped at 0.75
      const weapon3xPulse = {
        id: 'cesnekova_topinka',
        level: 4,
        normalUpgrades: ['aura_pulse', 'aura_pulse', 'aura_pulse'],
      };
      const statsPulse = getRankedWeaponStats('cesnekova_topinka', 4, weapon3xPulse);
      expect(statsPulse.cooldownReduction).toBeCloseTo(0.75, 2);
      // Effective cooldown calculation clamps at 1 - 0.75 = 0.25 (i.e. 2.0s -> 0.50s)
      expect(getEffectiveWeaponCooldown(2.0, 0, statsPulse.cooldownReduction)).toBeCloseTo(0.50, 2);
    });

    it('rollRandomWeaponUpgrade returns an upgrade from eligible pool', () => {
      const upgrade = rollRandomWeaponUpgrade('osikovy_prut');
      expect(upgrade).toBeDefined();
      expect(upgrade?.category).toBe('melee');

      const auraUpgrade = rollRandomWeaponUpgrade('bylinkova_fajfka');
      expect(auraUpgrade).toBeDefined();
      expect(auraUpgrade?.category).toBe('aura');

      const projUpgrade = rollRandomWeaponUpgrade('kysela_okurka');
      expect(projUpgrade).toBeDefined();
      expect(projUpgrade?.category).toBe('projectile');
    });

    it('has 6 harmonized projectile normal upgrades with expected user values and stats', () => {
      const projKeys = Object.keys(PROJECTILE_NORMAL_UPGRADES);
      expect(projKeys).toHaveLength(6);
      expect(projKeys).toEqual(
        expect.arrayContaining(['proj_barrage', 'cd_hyper', 'dmg_heavy', 'proj_pierce', 'proj_reach', 'proj_volley'])
      );

      // 1. Kobercový nálet (user requested): +130 % projektilů, -30 % zranění
      const barrage = PROJECTILE_NORMAL_UPGRADES['proj_barrage'];
      expect(barrage.name).toBe('Kobercový nálet');
      expect(barrage.stats.projectile_bonus).toBeCloseTo(1.30, 2);
      expect(barrage.stats.damage_bonus).toBeCloseTo(-0.30, 2);

      // 2. Rychlopalný mechanismus (user requested): -30 % cooldown
      const cdHyper = PROJECTILE_NORMAL_UPGRADES['cd_hyper'];
      expect(cdHyper.name).toBe('Rychlopalný mechanismus');
      expect(cdHyper.stats.cooldown_reduction).toBeCloseTo(0.30, 2);

      // 3. Těžká munice (user requested): +100 % zranění
      const dmgHeavy = PROJECTILE_NORMAL_UPGRADES['dmg_heavy'];
      expect(dmgHeavy.name).toBe('Těžká munice');
      expect(dmgHeavy.stats.damage_bonus).toBeCloseTo(1.00, 2);

      // 4. Průrazné kování: +2 průraz, -15 % zranění
      const pierce = PROJECTILE_NORMAL_UPGRADES['proj_pierce'];
      expect(pierce.stats.pierce_bonus).toBe(2);
      expect(pierce.stats.damage_bonus).toBeCloseTo(-0.15, 2);

      // 5. Dalekonosný rozptyl: +50 % dosah a plošný rozstřik
      const reach = PROJECTILE_NORMAL_UPGRADES['proj_reach'];
      expect(reach.stats.area_bonus).toBeCloseTo(0.50, 2);

      // 6. Hustá salva: +60 % zranění, +40 % projektilů
      const volley = PROJECTILE_NORMAL_UPGRADES['proj_volley'];
      expect(volley.stats.damage_bonus).toBeCloseTo(0.60, 2);
      expect(volley.stats.projectile_bonus).toBeCloseTo(0.40, 2);
    });

    it('classifies all projectile weapons under projectile category and returns 6 eligible upgrades', () => {
      expect(PROJECTILE_WEAPONS).toHaveLength(9);
      for (const wId of PROJECTILE_WEAPONS) {
        expect(getWeaponCategory(wId)).toBe('projectile');
        const eligible = getEligibleNormalUpgrades(wId);
        expect(eligible).toHaveLength(6);
      }
    });

    it('applies projectile dynamic normal upgrades correctly in getRankedWeaponStats', () => {
      // Weapon with barrage (+130% projectiles, -30% dmg) and heavy ammo (+100% dmg)
      const cucumberWithUpgrades = {
        id: 'kysela_okurka',
        level: 3,
        normalUpgrades: ['proj_barrage', 'dmg_heavy'],
      };
      const stats = getRankedWeaponStats('kysela_okurka', 3, cucumberWithUpgrades);
      // dynamicDamage = -0.30 + 1.00 = +0.70 -> damageMult = 1.70
      expect(stats.damageMult).toBeCloseTo(1.70, 2);
      // dynamicProjectileMult = (1 + 1.30) = 2.30
      expect(stats.projectileCountMult).toBeCloseTo(2.30, 2);

      // Weapon with pierce upgrade (+2 pierce, -15% dmg)
      const bunsWithPierce = {
        id: 'povidlove_buchty',
        level: 2,
        normalUpgrades: ['proj_pierce'],
      };
      const bunsStats = getRankedWeaponStats('povidlove_buchty', 2, bunsWithPierce);
      expect(bunsStats.pierce).toBe(2);
      expect(bunsStats.damageMult).toBeCloseTo(0.85, 2);
    });

    it('filters cd_hyper when projectile weapon is near cooldown cap', () => {
      const weaponNearCap = {
        id: 'kysela_okurka',
        level: 4,
        normalUpgrades: ['cd_hyper', 'cd_hyper'], // 0.30 + 0.30 = 0.60, headroom = 0.75 - 0.60 = 0.15 (still >= 0.10)
      };
      expect(getEligibleNormalUpgrades('kysela_okurka', weaponNearCap)).toHaveLength(6);

      const weaponAtCap = {
        id: 'kysela_okurka',
        level: 5,
        normalUpgrades: ['cd_hyper', 'cd_hyper', 'cd_hyper'], // 0.90 -> headroom = 0 (< 0.10)
      };
      const eligible = getEligibleNormalUpgrades('kysela_okurka', weaponAtCap);
      expect(eligible).toHaveLength(5);
      expect(eligible.some((u) => u.id === 'cd_hyper')).toBe(false);
    });

    it('verifies melee burst milestones grant ignoreResist instead of phantom pierce', () => {
      const caneRank5 = getMilestoneChoices('osikovy_prut', 5);
      const caneBurst5 = caneRank5?.find((c) => c.id === 'cane_burst_5');
      expect(caneBurst5?.statModifiers.ignoreResist).toBeCloseTo(0.25, 2);
      expect(caneBurst5?.statModifiers.pierceDelta).toBeUndefined();

      const caneRank8 = getMilestoneChoices('osikovy_prut', 8);
      const caneBurst8 = caneRank8?.find((c) => c.id === 'cane_burst_8');
      expect(caneBurst8?.statModifiers.ignoreResist).toBeCloseTo(0.40, 2);
      expect(caneBurst8?.statModifiers.pierceDelta).toBeUndefined();

      const vidleRank5 = getMilestoneChoices('kovarske_vidle', 5);
      const vidleBurst5 = vidleRank5?.find((c) => c.id === 'pitchfork_burst_5');
      expect(vidleBurst5?.statModifiers.ignoreResist).toBeCloseTo(0.25, 2);

      const halberdRank8 = getMilestoneChoices('kovana_halapartna', 8);
      const halberdBurst8 = halberdRank8?.find((c) => c.id === 'halberd_burst_8');
      expect(halberdBurst8?.statModifiers.ignoreResist).toBeCloseTo(0.40, 2);

      // Verify that selecting milestone reflects in stats.ignoreResist
      const weaponWithResist = {
        id: 'osikovy_prut',
        level: 5,
        milestones: ['cane_burst_3', 'cane_burst_5'],
      };
      const stats = getRankedWeaponStats('osikovy_prut', 5, weaponWithResist);
      expect(stats.ignoreResist).toBeCloseTo(0.25, 2);
    });
  });
});

