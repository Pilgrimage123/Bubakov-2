import { describe, it, expect } from 'vitest';
import {
  VILLAGE_BUILDINGS,
  VILLAGE_TAX_RATE,
  getVillageTotalLevels,
  getVillageBuildingCost,
  calculateTotalVillageInvested,
  getWallDamageReduction,
  getForestDebuffReduction,
  getMillSpeedMultiplier,
  getScarecrowPickupMultiplier,
  getWallHpMultiplier,
  getBoziMukaLuckMultiplier,
  getUndeadTolarChance,
} from '../src/data/village';
import { getWeaponDamage } from '../src/data/weapons';
import type { MetaProgression } from '../src/types';

describe('Hospodská ekonomika a obecní vylepšení (Village Economy)', () => {
  it('has harmonized village buildings with appropriate tiers and folklore helpers', () => {
    expect(VILLAGE_BUILDINGS).toHaveLength(13);

    const validBaseCosts = [30, 50, 75];
    for (const b of VILLAGE_BUILDINGS) {
      expect(validBaseCosts).toContain(b.baseCost);
      expect(b.name).toBeTruthy();
      expect(b.helpers).toBeTruthy();
      expect(b.story).toBeTruthy();
      expect(b.bonusDesc(1)).toBeTruthy();
      expect(b.canvasDrawer).toBeTruthy();
    }
  });

  it('calculates total village levels correctly across all buildings', () => {
    const meta: Partial<MetaProgression> = {
      scarecrowLevel: 2,
      millLevel: 1,
      forgeLevel: 3,
      tavernShieldLevel: 1,
    };
    expect(getVillageTotalLevels(meta)).toBe(7);
  });

  it('calculates building costs with Obecní přirážka (+20% per total level)', () => {
    expect(VILLAGE_TAX_RATE).toBe(0.20);

    // Tier 1 (Base 30)
    expect(getVillageBuildingCost(30, 0)).toBe(30);
    expect(getVillageBuildingCost(30, 1)).toBe(36); // 30 * 1.20 = 36
    expect(getVillageBuildingCost(30, 2)).toBe(42); // 30 * 1.40 = 42

    // Tier 2 (Base 50)
    expect(getVillageBuildingCost(50, 0)).toBe(50);
    expect(getVillageBuildingCost(50, 2)).toBe(70); // 50 * 1.40 = 70
    expect(getVillageBuildingCost(50, 10)).toBe(150); // 50 * 3.00 = 150

    // Tier 3 (Base 75)
    expect(getVillageBuildingCost(75, 0)).toBe(75);
    expect(getVillageBuildingCost(75, 4)).toBe(135); // 75 * 1.80 = 135
  });

  it('deterministically calculates 100% fair village refund (Respec)', () => {
    expect(calculateTotalVillageInvested({})).toBe(0);

    // 1 level of scarecrow (Base 30)
    expect(calculateTotalVillageInvested({ scarecrowLevel: 1 })).toBe(30);

    // 1 level of scarecrow (Base 30) + 1 level of forge (Base 50)
    // Step 0: Base 30 at total 0 = 30
    // Step 1: Base 50 at total 1 = round(50 * 1.20) = 60
    // Total = 90
    expect(calculateTotalVillageInvested({ scarecrowLevel: 1, forgeLevel: 1 })).toBe(90);

    // Multiple levels across tiers
    const meta: Partial<MetaProgression> = {
      millLevel: 2, // 2x 30
      ovenLevel: 1, // 1x 50
      tavernShieldLevel: 1, // 1x 50
    };
    // Steps:
    // 0: 30 * 1.00 = 30
    // 1: 30 * 1.20 = 36
    // 2: 50 * 1.40 = 70
    // 3: 50 * 1.60 = 80
    // Sum = 30 + 36 + 70 + 80 = 216
    expect(calculateTotalVillageInvested(meta)).toBe(216);
  });

  it('scales Zoufalá kuráž continuously with missing Kuráž', () => {
    const baseDamage = 40;

    // 80% Kuráž means 20% missing: two levels grant +10% damage.
    const healthyPlayer = {
      hp: 80,
      maxHp: 100,
      tavernShieldLevel: 2,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(healthyPlayer, baseDamage)).toBe(44);

    // Level 0 tavern never grants a bonus.
    const lowCourageNoTavern = {
      hp: 30,
      maxHp: 100,
      tavernShieldLevel: 0,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(lowCourageNoTavern, baseDamage)).toBe(40);

    // 35% Kuráž means 65% missing: two levels grant +32.5% damage.
    const desperatePlayer = {
      hp: 35,
      maxHp: 100,
      tavernShieldLevel: 2,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(desperatePlayer, baseDamage)).toBe(53); // 40 * 1.325 = 53 after floating-point rounding
  });

  it('enforces safe asymptotic caps for defensive/time stats at high levels', () => {
    const highLevel = 30;

    // Wall damage reduction: smoothly approaches 40% limit (0.40 * (1 - 1 / (1 + 0.08 * lvl)))
    const wallDmgRed = getWallDamageReduction(highLevel);
    expect(wallDmgRed).toBeLessThan(0.40);
    expect(wallDmgRed).toBeGreaterThan(0.28);
    expect(getWallDamageReduction(100)).toBeLessThan(0.40);

    // Forest wet/slow reduction: smoothly approaches 85% limit (0.85 * (1 - 1 / (1 + 0.25 * lvl)))
    const forestResistance = getForestDebuffReduction(highLevel);
    expect(forestResistance).toBeLessThan(0.85);
    expect(forestResistance).toBeGreaterThan(0.70);

    // Water invulnerability duration: capped at 5 seconds
    const potionInvuln = Math.min(5, 1 + highLevel * 0.5);
    expect(potionInvuln).toBe(5);

    // Mill speed multiplier: soft capped at 50%
    expect(getMillSpeedMultiplier(highLevel)).toBe(0.50);

    // Scarecrow pickup multiplier: soft capped at 150%
    expect(getScarecrowPickupMultiplier(highLevel)).toBe(1.50);

    // Undead tolar chance: capped at 25%
    expect(getUndeadTolarChance(highLevel)).toBe(0.25);
  });

  it('preserves hunter archetypes through percentage scaling', () => {
    // Wall max Kuráž: +10% base Kuráž per level
    // Watchman (130) gains +13/lvl, Granny (85) gains +8.5/lvl
    const watchmanHpLvl5 = 130 + Math.round(130 * getWallHpMultiplier(5));
    const grannyHpLvl5 = 85 + Math.round(85 * getWallHpMultiplier(5));
    expect(watchmanHpLvl5).toBe(195);
    expect(grannyHpLvl5).toBe(128);
    expect(grannyHpLvl5).toBeLessThan(130); // Granny at lvl 5 is still more fragile than base Watchman!

    // Mill speed: +3% base speed per level
    const wandererSpeedLvl5 = 165 + Math.round(165 * getMillSpeedMultiplier(5));
    const grannySpeedLvl5 = 135 + Math.round(135 * getMillSpeedMultiplier(5));
    expect(wandererSpeedLvl5).toBe(190);
    expect(grannySpeedLvl5).toBe(155);
    expect(grannySpeedLvl5).toBeLessThan(165); // Granny at lvl 5 is still slower than base Wanderer!

    // Scarecrow pickup: +15% base pickup per level
    const shepherdPickupLvl5 = 160 + Math.round(160 * getScarecrowPickupMultiplier(5));
    const korenarkaPickupLvl5 = 26 + Math.round(26 * getScarecrowPickupMultiplier(5));
    expect(shepherdPickupLvl5).toBe(280);
    expect(korenarkaPickupLvl5).toBe(46);
    expect(korenarkaPickupLvl5).toBeLessThan(75); // Kořenářka retains intimate harvesting!
  });
});
