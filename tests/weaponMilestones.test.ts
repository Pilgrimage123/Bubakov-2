import { describe, it, expect } from 'vitest';
import {
  WEAPONS_WITH_MILESTONES,
  WEAPON_RANK_DEFS,
  validateWeaponMilestones,
  getWeaponRankDef,
  getMilestoneChoices,
  getRankedWeaponStats,
} from '../src/data/weaponMilestones';
import type { WeaponId } from '../src/types';

const CANONICAL_15_WEAPONS: WeaponId[] = [
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
];

describe('Weapon Milestones System', () => {
  it('contains all 15 canonical weapons in WEAPONS_WITH_MILESTONES', () => {
    expect(WEAPONS_WITH_MILESTONES).toHaveLength(15);
    expect(new Set(WEAPONS_WITH_MILESTONES)).toEqual(new Set(CANONICAL_15_WEAPONS));
  });

  it('passes validateWeaponMilestones() without throwing', () => {
    expect(() => validateWeaponMilestones()).not.toThrow();
    expect(validateWeaponMilestones()).toBe(true);
  });

  it('has 8 ranks for every canonical weapon with correct milestone flags', () => {
    for (const weaponId of CANONICAL_15_WEAPONS) {
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

    for (const weaponId of CANONICAL_15_WEAPONS) {
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

    // 15 weapons * 3 milestone ranks * 2 choices = 90 distinct choices
    expect(seenChoiceIds.size).toBe(90);
  });

  it('computes ranked stats correctly with milestones chosen', () => {
    for (const weaponId of CANONICAL_15_WEAPONS) {
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
      expect(statsRank3.damageMult).toBeGreaterThan(1);
    }
  });
});
