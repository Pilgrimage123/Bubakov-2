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
  const inflation = 1 + Math.max(0, purchasedCount) * 0.05;
  const luckDiscount = Math.min(0.20, Math.max(0, luck) * 0.015);
  const waitDiscount = getWaitDiscount(waitSeconds);
  const price = item.baseCost * inflation * (1 - luckDiscount) * (1 - waitDiscount);
  return Math.max(1, Math.round(price));
}

export function chooseGrandfatherOffers(
  gingerbread: number,
  luck: number,
  purchasedIds: string[],
  playerWeapons: any[] = [],
  count = 4,
): GrandfatherOffer[] {
  const isAvailable = (item: GrandfatherItemDef) => {
    if (item.isWeapon && item.weaponId) {
      const pw = playerWeapons.find((w: any) => w.id === item.weaponId);
      const lvl = pw ? pw.level : 0;
      return lvl < (item.maxStacks ?? 8);
    }
    const owned = purchasedIds.filter((id) => id === item.id).length;
    return owned < (item.maxStacks ?? Number.POSITIVE_INFINITY);
  };

  const availableItems = GRANDFATHER_ITEMS.filter(isAvailable);
  const availableWeapons = availableItems.filter((item) => item.isWeapon);

  const selected: GrandfatherOffer[] = [];
  const now = performance.now();

  // 1. Vždy garantovaná alespoň jedna zbraň, pokud je nějaká dostupná
  if (availableWeapons.length > 0) {
    const shuffledWeapons = [...availableWeapons].sort(() => Math.random() - 0.5);
    const affordableWeapons = shuffledWeapons.filter((item) => item.baseCost <= gingerbread);
    const weaponPool = [...affordableWeapons, ...shuffledWeapons.filter((item) => !affordableWeapons.includes(item))];
    const guaranteedWeapon = weaponPool[0];
    if (guaranteedWeapon) {
      selected.push({ itemId: guaranteedWeapon.id, offeredAt: now });
    }
  }

  // 2. Zbývající pozice z náhodného mixu všech zbývajících dostupných položek (zbraně i upgrady)
  const remainingPool = availableItems.filter((item) => !selected.some((s) => s.itemId === item.id));
  const weighted = [...remainingPool].sort(() => Math.random() - 0.5);
  const affordable = weighted.filter((item) => item.baseCost <= gingerbread);
  const candidatePool = [...affordable, ...weighted.filter((item) => !affordable.includes(item))];

  for (const item of candidatePool) {
    if (selected.length >= count) break;
    if (selected.some((offer) => offer.itemId === item.id)) continue;
    const luckBoost = Math.max(0, luck) * 0.04 * (item.luckWeight ?? 1);
    if (Math.random() > Math.min(1, 0.45 + luckBoost) && selected.length < count - 1) continue;
    selected.push({ itemId: item.id, offeredAt: now });
  }

  // Backfill if RNG skipped items but pool still has available choices
  for (const item of candidatePool) {
    if (selected.length >= count) break;
    if (!selected.some((offer) => offer.itemId === item.id)) {
      selected.push({ itemId: item.id, offeredAt: now });
    }
  }

  if (selected.length === 0 && availableItems[0]) {
    selected.push({ itemId: availableItems[0].id, offeredAt: now });
  }

  // Zamícháme výslednou nabídku, aby garantovaná zbraň nebyla strnule vždy na prvním místě
  return selected.sort(() => Math.random() - 0.5);
}
