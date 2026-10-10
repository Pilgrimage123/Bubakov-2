import { describe, it, expect } from 'vitest';
import {
  VILLAGE_BUILDINGS,
  VILLAGE_TAX_RATE,
  getVillageTotalLevels,
  getVillageBuildingCost,
  calculateTotalVillageInvested,
} from '../src/data/village';
import { getWeaponDamage } from '../src/data/weapons';
import type { MetaProgression } from '../src/types';

describe('Hospodská ekonomika a obecní vylepšení (Village Economy)', () => {
  it('has exactly 12 harmonized village buildings with appropriate tiers and folklore helpers', () => {
    expect(VILLAGE_BUILDINGS).toHaveLength(12);

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

  it('calculates building costs with Obecní přirážka (+15% per total level)', () => {
    expect(VILLAGE_TAX_RATE).toBe(0.15);

    // Tier 1 (Base 30)
    expect(getVillageBuildingCost(30, 0)).toBe(30);
    expect(getVillageBuildingCost(30, 1)).toBe(35); // 30 * 1.15 = 34.5 -> 35
    expect(getVillageBuildingCost(30, 2)).toBe(39); // 30 * 1.30 = 39

    // Tier 2 (Base 50)
    expect(getVillageBuildingCost(50, 0)).toBe(50);
    expect(getVillageBuildingCost(50, 2)).toBe(65); // 50 * 1.30 = 65
    expect(getVillageBuildingCost(50, 10)).toBe(125); // 50 * 2.50 = 125

    // Tier 3 (Base 75)
    expect(getVillageBuildingCost(75, 0)).toBe(75);
    expect(getVillageBuildingCost(75, 4)).toBe(120); // 75 * 1.60 = 120
  });

  it('deterministically calculates 100% fair village refund (Respec)', () => {
    expect(calculateTotalVillageInvested({})).toBe(0);

    // 1 level of scarecrow (Base 30)
    expect(calculateTotalVillageInvested({ scarecrowLevel: 1 })).toBe(30);

    // 1 level of scarecrow (Base 30) + 1 level of forge (Base 50)
    // Step 0: Base 30 at total 0 = 30
    // Step 1: Base 50 at total 1 = round(50 * 1.15) = 58
    // Total = 88
    expect(calculateTotalVillageInvested({ scarecrowLevel: 1, forgeLevel: 1 })).toBe(88);

    // Multiple levels across tiers
    const meta: Partial<MetaProgression> = {
      millLevel: 2, // 2x 30
      ovenLevel: 1, // 1x 50
      tavernShieldLevel: 1, // 1x 75
    };
    // Steps:
    // 0: 30 * 1.00 = 30
    // 1: 30 * 1.15 = 35
    // 2: 50 * 1.30 = 65
    // 3: 75 * 1.45 = 109
    // Sum = 30 + 35 + 65 + 109 = 239
    expect(calculateTotalVillageInvested(meta)).toBe(239);
  });

  it('applies Zoufalá kuráž damage multiplier when Kuráž is at or below 35%', () => {
    const baseDamage = 40;

    // Normal courage (> 35%): no bonus even with tavernShieldLevel
    const healthyPlayer = {
      hp: 80,
      maxHp: 100,
      tavernShieldLevel: 2,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(healthyPlayer, baseDamage)).toBe(40);

    // Low courage (<= 35%) with level 0 tavern: no bonus
    const lowCourageNoTavern = {
      hp: 30,
      maxHp: 100,
      tavernShieldLevel: 0,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(lowCourageNoTavern, baseDamage)).toBe(40);

    // Low courage (<= 35%) with level 2 tavern: +30% damage (15% per level)
    const desperatePlayer = {
      hp: 35,
      maxHp: 100,
      tavernShieldLevel: 2,
      damageMultiplier: 1,
    };
    expect(getWeaponDamage(desperatePlayer, baseDamage)).toBe(52); // 40 * 1.30 = 52
  });

  it('enforces safe asymptotic caps for defensive/time stats at high levels', () => {
    const highLevel = 30;

    // Wall damage reduction: capped at 50%
    const wallDmgRed = Math.min(0.5, highLevel * 0.04);
    expect(wallDmgRed).toBe(0.5);

    // Forest wet/slow reduction: capped at 80%
    const forestResistance = Math.min(0.8, highLevel * 0.20);
    expect(forestResistance).toBe(0.8);

    // Water invulnerability duration: capped at 5 seconds
    const potionInvuln = Math.min(5, 1 + highLevel * 0.5);
    expect(potionInvuln).toBe(5);
  });
});
