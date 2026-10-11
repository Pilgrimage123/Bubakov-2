import { describe, it, expect } from 'vitest';
import {
  getGrandfatherPrice,
  isGrandfatherPriceExempt,
  getGrandfatherRerollCost,
  getWaitDiscount,
  createGrandfatherRuntime,
  GRANDFATHER_INFLATION_RATE,
} from '../src/game/grandfatherRuntime';
import { GRANDFATHER_ITEMS, getGrandfatherItem } from '../src/data/grandfatherItems';

describe('Dědečkův obchod ekonomika (Grandfather Shop Economy)', () => {
  it('sets regular purchase inflation to 50% per completed purchase', () => {
    expect(GRANDFATHER_INFLATION_RATE).toBe(0.50);
  });

  it('increases regular item prices by 50% per purchase', () => {
    const item = getGrandfatherItem('sedmimile_krpce')!; // baseCost 35
    expect(item).toBeDefined();
    expect(item.baseCost).toBe(35);

    // 0 purchases, 0 luck, 0 wait seconds
    expect(getGrandfatherPrice(item, 0, 0, 0)).toBe(35);

    // 1 purchase: 35 * 1.50 = 52.5 -> 53
    expect(getGrandfatherPrice(item, 1, 0, 0)).toBe(53);

    // 2 purchases: 35 * 2 = 70
    expect(getGrandfatherPrice(item, 2, 0, 0)).toBe(70);

    // 3 purchases: 35 * 2.5 = 87.5 -> 88
    expect(getGrandfatherPrice(item, 3, 0, 0)).toBe(88);

    // Item with baseCost 50 (e.g. opravdova_kava)
    const kava = getGrandfatherItem('opravdova_kava')!;
    expect(kava.baseCost).toBe(50);
    expect(getGrandfatherPrice(kava, 0, 0, 0)).toBe(50);
    expect(getGrandfatherPrice(kava, 1, 0, 0)).toBe(75); // 50 * 1.50 = 75
    expect(getGrandfatherPrice(kava, 2, 0, 0)).toBe(100); // 50 * 2.00 = 100
    expect(getGrandfatherPrice(kava, 5, 0, 0)).toBe(175); // 50 * 3.50 = 175
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
    // 55 * (1 + 2 * 0.50) = 55 * 2 = 110
    expect(priceAfterEncounter1).toBe(110);

    // Encounter 1 ends, Grandfather departs and later respawns for Encounter 2 (next visit)
    // Encounter-specific count resets to 0
    gf.purchasesThisEncounter = 0;
    // CRITICAL REQUIREMENT: totalPurchases MUST NOT reset upon new visit!
    expect(gf.totalPurchases).toBe(2);

    // In Encounter 2, price is still calculated using persistent totalPurchases, NOT reset to base 55
    const priceAtStartOfEncounter2 = getGrandfatherPrice(cane, gf.totalPurchases, 0, 0);
    expect(priceAtStartOfEncounter2).toBe(110);
    expect(priceAtStartOfEncounter2).toBeGreaterThan(cane.baseCost);

    // Player buys another item in Encounter 2
    gf.purchasesThisEncounter += 1;
    gf.totalPurchases += 1;
    // 55 * (1 + 3 * 0.50) = 55 * 2.5 = 137.5 -> 138
    expect(getGrandfatherPrice(cane, gf.totalPurchases, 0, 0)).toBe(138);
  });

  it('correctly incorporates luck and waiting discounts with the new inflation', () => {
    const item = getGrandfatherItem('sedmimile_krpce')!; // baseCost 35
    // 2 purchases = 70 base before discounts
    // With 4 luck (6% discount) and 40 seconds wait (10% discount):
    // 35 * 2 * 0.94 * 0.90 = 59.22 -> 59
    expect(getGrandfatherPrice(item, 2, 4, 40)).toBe(59);
  });

  it('does not inflate healing consumables or direct-currency treasures', () => {
    const cikorka = getGrandfatherItem('tepla_cikorka')!;
    const poklad = getGrandfatherItem('pekeln_poklad_zlaty')!;
    expect(isGrandfatherPriceExempt(cikorka)).toBe(true);
    expect(isGrandfatherPriceExempt(poklad)).toBe(true);
    expect(getGrandfatherPrice(cikorka, 0, 0, 0)).toBe(getGrandfatherPrice(cikorka, 10, 0, 0));
    expect(getGrandfatherPrice(poklad, 0, 0, 0)).toBe(getGrandfatherPrice(poklad, 10, 0, 0));
  });
});
