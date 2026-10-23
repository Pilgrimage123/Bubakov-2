import { describe, it, expect, vi } from 'vitest';
import {
  getGrandfatherPrice,
  isGrandfatherPriceExempt,
  getGrandfatherRerollCost,
  getWaitDiscount,
  createGrandfatherRuntime,
  getGrandfatherInflatingPurchaseCount,
  chooseGrandfatherOffers,
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
    // With 100 luck (6% discount) and 40 seconds wait (10% discount):
    // 35 * 2 * 0.94 * 0.90 = 59.22 -> 59
    expect(getGrandfatherPrice(item, 2, 100, 40)).toBe(59);
  });

  it('does not let currency payouts or exempt one-shot purchases inflate later upgrades', () => {
    const regularUpgrade = getGrandfatherItem('sedmimile_krpce')!;
    const coinPayout = getGrandfatherItem('pekeln_poklad_zlaty')!;
    const rareInstant = getGrandfatherItem('masopust_rattle')!;
    const purchases = ['pekeln_poklad_zlaty', 'masopust_rattle'];

    expect(getGrandfatherInflatingPurchaseCount(purchases)).toBe(0);
    expect(getGrandfatherPrice(regularUpgrade, getGrandfatherInflatingPurchaseCount(purchases), 0, 0)).toBe(regularUpgrade.baseCost);
    expect(getGrandfatherInflatingPurchaseCount(['sedmimile_krpce', 'pekeln_poklad_zlaty'])).toBe(1);
    expect(getGrandfatherInflatingPurchaseCount(['weapon_upgrade:kysela_okurka:upgrade_x'])).toBe(1);
    expect(isGrandfatherPriceExempt(coinPayout)).toBe(true);
    expect(isGrandfatherPriceExempt(rareInstant)).toBe(true);
  });

  it('never offers Courage-refill items when Courage is full', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.25);
    try {
      const offers = chooseGrandfatherOffers(1000, 100, [], [], 4, { playerHp: 100, playerMaxHp: 100 });
      expect(offers.length).toBeGreaterThan(0);
      expect(offers.every((offer) => {
        const item = GRANDFATHER_ITEMS.find((candidate) => candidate.id === offer.itemId);
        return item?.effect.type !== 'heal';
      })).toBe(true);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('does not inflate healing consumables or direct-currency treasures', () => {
    const cikorka = getGrandfatherItem('tepla_cikorka')!;
    const poklad = getGrandfatherItem('pekeln_poklad_zlaty')!;
    expect(isGrandfatherPriceExempt(cikorka)).toBe(true);
    expect(isGrandfatherPriceExempt(poklad)).toBe(true);
    expect(getGrandfatherPrice(cikorka, 0, 0, 0)).toBe(getGrandfatherPrice(cikorka, 10, 0, 0));
    expect(getGrandfatherPrice(poklad, 0, 0, 0)).toBe(getGrandfatherPrice(poklad, 10, 0, 0));
  });

  it('normalizes legacy and canonical weapon IDs (e.g. cane vs osikovy_prut) when filtering maxed weapons and rolling upgrades', () => {
    // Player has legacy weapon IDs at max level 8 while GRANDFATHER_ITEMS uses canonical IDs,
    // OR player has canonical weapon IDs while legacy aliases are passed.
    const maxedLegacyWeapons = [
      { id: 'cane', level: 8 },
      { id: 'buns', level: 8 },
      { id: 'pitchfork', level: 8 },
      { id: 'halberd', level: 8 },
      { id: 'herbs', level: 8 },
    ];
    for (let i = 0; i < 30; i++) {
      const offers = chooseGrandfatherOffers(200, 100, [], maxedLegacyWeapons, 4);
      const offeredIds = offers.map((o) => o.itemId);
      expect(offeredIds).not.toContain('wp_cane');
      expect(offeredIds).not.toContain('wp_buns');
      expect(offeredIds).not.toContain('wp_pitchfork');
      expect(offeredIds).not.toContain('wp_halberd');
      expect(offeredIds).not.toContain('wp_herbs');
    }

    // When a weapon is stored under a legacy alias ('cane') at level 1 (nextLvl = 2, non-milestone),
    // makeOffer must recognize it as level 1 and populate candidateUpgradeId
    const level1Weapons = [{ id: 'cane', level: 1, normalUpgrades: [] }];
    let sawCaneWithCandidate = false;
    for (let i = 0; i < 60; i++) {
      const offers = chooseGrandfatherOffers(200, 100, [], level1Weapons, 4);
      const caneOffer = offers.find((o) => o.itemId === 'wp_cane');
      if (caneOffer) {
        expect(caneOffer.candidateUpgradeId).toBeDefined();
        sawCaneWithCandidate = true;
      }
    }
    expect(sawCaneWithCandidate).toBe(true);
  });

  it('prevents infinite or corrupt modal state transitions when collecting boss treasure and chests', () => {
    // Verify that App.tsx synchronously guards openChestSequence, closeChestSequence,
    // includes 'milestone' in the canvas render state check, and uses grandfatherPurchaseIdsRef.current in loop()
    const fs = require('fs');
    const path = require('path');
    const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf-8');

    // 1. loop() must pass grandfatherPurchaseIdsRef.current (not stale closure grandfatherPurchaseIds) to chooseGrandfatherOffers
    expect(appSource).not.toMatch(/chooseGrandfatherOffers\(\s*engine\.gingerbread,\s*luck,\s*grandfatherPurchaseIds,/);
    expect(appSource).toMatch(/chooseGrandfatherOffers\(\s*engine\.gingerbread,\s*luck,\s*grandfatherPurchaseIdsRef\.current,/);

    // 2. Render loop condition must include currentGameState === 'milestone' so canvas doesn't clear to black
    expect(appSource).toContain("currentGameState === 'milestone'");

    // 3. openChestSequence must guard against being called when gameStateRef.current !== 'playing' and set gameStateRef.current = 'chest' synchronously
    expect(appSource).toMatch(/const openChestSequence = \(\) => \{\s*if \(gameStateRef\.current !== 'playing'\) return;\s*gameStateRef\.current = 'chest';/);

    // 4. closeChestSequence must guard against duplicate invocations when gameStateRef.current !== 'chest'
    expect(appSource).toMatch(/if \(gameStateRef\.current !== 'chest'\) return;/);

    // 5. loop() must be protected by try / finally so requestAnimationFrame(loop) is never lost on a single-frame error
    expect(appSource).toMatch(/finally\s*\{\s*animId = requestAnimationFrame\(loop\);/);
  });
});
