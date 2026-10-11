import { describe, it, expect } from 'vitest';
import {
  getGrandfatherPrice,
  getGrandfatherRerollCost,
  getWaitDiscount,
  createGrandfatherRuntime,
  GRANDFATHER_INFLATION_RATE,
} from '../src/game/grandfatherRuntime';
import { GRANDFATHER_ITEMS, getGrandfatherItem } from '../src/data/grandfatherItems';

describe('Dědečkův obchod ekonomika (Grandfather Shop Economy)', () => {
  it('has inflation rate set to 0.10 (growing 2x faster than original 0.05)', () => {
    expect(GRANDFATHER_INFLATION_RATE).toBe(0.10);
  });

  it('increases prices 2x faster per purchased item (+10% per item)', () => {
    const item = getGrandfatherItem('sedmimile_krpce')!; // baseCost 35
    expect(item).toBeDefined();
    expect(item.baseCost).toBe(35);

    // 0 purchases, 0 luck, 0 wait seconds
    expect(getGrandfatherPrice(item, 0, 0, 0)).toBe(35);

    // 1 purchase (+10% inflation): 35 * 1.10 = 38.5 -> 39
    expect(getGrandfatherPrice(item, 1, 0, 0)).toBe(39);

    // 2 purchases (+20% inflation): 35 * 1.20 = 42
    expect(getGrandfatherPrice(item, 2, 0, 0)).toBe(42);

    // 3 purchases (+30% inflation): 35 * 1.30 = 45.5 -> 46
    expect(getGrandfatherPrice(item, 3, 0, 0)).toBe(46);

    // Item with baseCost 50 (e.g. opravdova_kava)
    const kava = getGrandfatherItem('opravdova_kava')!;
    expect(kava.baseCost).toBe(50);
    expect(getGrandfatherPrice(kava, 0, 0, 0)).toBe(50);
    expect(getGrandfatherPrice(kava, 1, 0, 0)).toBe(55); // 50 * 1.10 = 55
    expect(getGrandfatherPrice(kava, 2, 0, 0)).toBe(60); // 50 * 1.20 = 60
    expect(getGrandfatherPrice(kava, 5, 0, 0)).toBe(75); // 50 * 1.50 = 75
  });

  it('preserves prices across multiple visits/encounters via totalPurchases', () => {
    const gf = createGrandfatherRuntime();
    expect(gf.purchasesThisEncounter).toBe(0);
    expect(gf.totalPurchases).toBe(0);

    const cane = getGrandfatherItem('wp_cane')!; // baseCost 55

    // Encounter 1: Player visits Grandfather and buys 2 items
    gf.purchasesThisEncounter += 1;
    gf.totalPurchases += 1;
    gf.purchasesThisEncounter += 1;
    gf.totalPurchases += 1;

    // Price during encounter 1 after 2 purchases
    const priceAfterEncounter1 = getGrandfatherPrice(cane, gf.totalPurchases, 0, 0);
    // 55 * (1 + 2 * 0.10) = 55 * 1.20 = 66
    expect(priceAfterEncounter1).toBe(66);

    // Encounter 1 ends, Grandfather departs and later respawns for Encounter 2 (next visit)
    // Encounter-specific count resets to 0
    gf.purchasesThisEncounter = 0;
    // CRITICAL REQUIREMENT: totalPurchases MUST NOT reset upon new visit!
    expect(gf.totalPurchases).toBe(2);

    // In Encounter 2, price is still calculated using persistent totalPurchases, NOT reset to base 55
    const priceAtStartOfEncounter2 = getGrandfatherPrice(cane, gf.totalPurchases, 0, 0);
    expect(priceAtStartOfEncounter2).toBe(66);
    expect(priceAtStartOfEncounter2).toBeGreaterThan(cane.baseCost);

    // Player buys another item in Encounter 2
    gf.purchasesThisEncounter += 1;
    gf.totalPurchases += 1;
    // 55 * (1 + 3 * 0.10) = 55 * 1.30 = 71.5 -> 72
    expect(getGrandfatherPrice(cane, gf.totalPurchases, 0, 0)).toBe(72);
  });

  it('correctly incorporates luck and waiting discounts with the new inflation', () => {
    const item = getGrandfatherItem('sedmimile_krpce')!; // baseCost 35
    // 2 purchases = 42 base before discounts
    // With 4 luck (6% discount) and 40 seconds wait (10% discount):
    // 35 * 1.20 * (1 - 0.06) * (1 - 0.10) = 42 * 0.94 * 0.90 = 35.532 -> 36
    expect(getGrandfatherPrice(item, 2, 4, 40)).toBe(36);
  });
});
