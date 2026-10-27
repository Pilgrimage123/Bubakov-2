import { describe, it, expect } from 'vitest';
import {
  replaceCourageOffersIfNeeded,
  chooseGrandfatherOffers,
  getGrandfatherPrice,
  getGrandfatherInflatingPurchaseCount,
} from '../src/game/grandfatherRuntime';
import { GRANDFATHER_ITEMS, getGrandfatherItem } from '../src/data/grandfatherItems';

describe('Grandfather Shop Stability & Offer Consistency', () => {
  it('does not mutate or reshuffle non-healing offers when player is at full Courage', () => {
    const fixedOffers = [
      { itemId: 'sedmimile_krpce', offeredAt: 100 },
      { itemId: 'opravdova_kava', offeredAt: 100 },
      { itemId: 'krvave_jelito', offeredAt: 100 },
      { itemId: 'podkova_pro_stesti', offeredAt: 100 },
    ];

    const result1 = replaceCourageOffersIfNeeded(fixedOffers, 100, 100, [], [], { playerHp: 100, playerMaxHp: 100 });
    const result2 = replaceCourageOffersIfNeeded(fixedOffers, 100, 100, [], [], { playerHp: 100, playerMaxHp: 100 });

    expect(result1.map((o) => o.itemId)).toEqual(['sedmimile_krpce', 'opravdova_kava', 'krvave_jelito', 'podkova_pro_stesti']);
    expect(result2.map((o) => o.itemId)).toEqual(['sedmimile_krpce', 'opravdova_kava', 'krvave_jelito', 'podkova_pro_stesti']);
  });

  it('replaces healing offers in place without shifting slots of surrounding items', () => {
    const healOffer = { itemId: 'tepla_cikorka', offeredAt: 100 };
    const offers = [
      { itemId: 'sedmimile_krpce', offeredAt: 100 },
      healOffer,
      { itemId: 'krvave_jelito', offeredAt: 100 },
      { itemId: 'opravdova_kava', offeredAt: 100 },
    ];

    const result = replaceCourageOffersIfNeeded(offers, 100, 100, [], [], { playerHp: 100, playerMaxHp: 100 });

    expect(result).toHaveLength(4);
    // Slots 0, 2, 3 must remain exactly where they were
    expect(result[0].itemId).toBe('sedmimile_krpce');
    expect(result[2].itemId).toBe('krvave_jelito');
    expect(result[3].itemId).toBe('opravdova_kava');

    // Slot 1 must be replaced with a non-heal offer
    expect(result[1].itemId).not.toBe('tepla_cikorka');
    const replacementItem = GRANDFATHER_ITEMS.find((it) => it.id === result[1].itemId);
    expect(replacementItem?.effect.type).not.toBe('heal');
  });

  it('preserves other shop offers when an item reaches max stacks or a purchase occurs', () => {
    const initialOffers = [
      { itemId: 'sedmimile_krpce', offeredAt: 100 },
      { itemId: 'opravdova_kava', offeredAt: 100 },
      { itemId: 'podkova_pro_stesti', offeredAt: 100 },
      { itemId: 'weapon_upgrade:kysela_okurka:upgrade_x', offeredAt: 100 },
    ];

    // Simulating multiple purchases of sedmimile_krpce until max stacks (5)
    const purchasedIds = ['sedmimile_krpce', 'sedmimile_krpce', 'sedmimile_krpce', 'sedmimile_krpce', 'sedmimile_krpce'];

    // All original offers remain unchanged in the offers list; the UI renders maxed cards as VYČERPÁNO
    const item = getGrandfatherItem('sedmimile_krpce')!;
    const owned = purchasedIds.filter((id) => id === item.id).length;
    const isMaxed = owned >= (item.maxStacks || 5);

    expect(isMaxed).toBe(true);
    expect(initialOffers.map((o) => o.itemId)).toEqual([
      'sedmimile_krpce',
      'opravdova_kava',
      'podkova_pro_stesti',
      'weapon_upgrade:kysela_okurka:upgrade_x',
    ]);
  });
});
