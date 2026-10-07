import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';

export interface GrandfatherOffer {
  itemId: string;
  offeredAt: number;
}

export interface GrandfatherRuntimeState {
  active: boolean;
  x: number;
  y: number;
  spawnedAt: number;
  waitStartedAt: number;
  offers: GrandfatherOffer[];
  purchasesThisEncounter: number;
  cooldown: number;
}

export function createGrandfatherRuntime(): GrandfatherRuntimeState {
  return {
    active: false,
    x: 0,
    y: 0,
    spawnedAt: 0,
    waitStartedAt: 0,
    offers: [],
    purchasesThisEncounter: 0,
    cooldown: 0,
  };
}

export function getWaitDiscount(waitSeconds: number, maxDiscount = 0.30): number {
  return Math.min(maxDiscount, Math.max(0, waitSeconds) * 0.0025);
}

export function getGrandfatherPrice(
  item: GrandfatherItemDef,
  purchasedCount: number,
  luck: number,
  waitSeconds: number,
): number {
  const inflation = 1 + Math.max(0, purchasedCount) * 0.12;
  const luckDiscount = Math.min(0.10, Math.max(0, luck) * 0.01);
  const waitDiscount = getWaitDiscount(waitSeconds);
  const price = item.baseCost * inflation * (1 - luckDiscount) * (1 - waitDiscount);
  return Math.max(1, Math.round(price));
}

export function chooseGrandfatherOffers(
  gingerbread: number,
  luck: number,
  purchasedIds: string[],
  count = 4,
): GrandfatherOffer[] {
  const available = GRANDFATHER_ITEMS.filter((item) => {
    const owned = purchasedIds.filter((id) => id === item.id).length;
    return owned < (item.maxStacks ?? Number.POSITIVE_INFINITY);
  });

  const weighted = [...available].sort(() => Math.random() - 0.5);
  const affordable = weighted.filter((item) => item.baseCost <= gingerbread);
  const pool = [...affordable, ...weighted.filter((item) => !affordable.includes(item))];

  const selected: GrandfatherOffer[] = [];
  const now = performance.now();
  for (const item of pool) {
    if (selected.some((offer) => offer.itemId === item.id)) continue;
    const luckBoost = Math.max(0, luck) * 0.04 * (item.luckWeight ?? 1);
    if (Math.random() > Math.min(1, 0.45 + luckBoost) && selected.length < count - 1) continue;
    selected.push({ itemId: item.id, offeredAt: now });
    if (selected.length >= count) break;
  }

  if (selected.length === 0 && pool[0]) {
    selected.push({ itemId: pool[0].id, offeredAt: now });
  }
  return selected;
}
