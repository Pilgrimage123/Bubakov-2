import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';

export interface GrandfatherOffer {
  itemId: string;
  offeredAt: number;
}

export interface GrandfatherRuntimeState {
  active: boolean;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  facingDir?: number;
  animTime?: number;
  isMoving?: boolean;
  spawnedAt: number;
  waitStartedAt: number;
  offers: GrandfatherOffer[];
  purchasesThisEncounter: number;
  totalPurchases: number;
  rerollsThisEncounter: number;
  cooldown: number;
}

export function createGrandfatherRuntime(): GrandfatherRuntimeState {
  return {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facingDir: 1,
    animTime: 0,
    isMoving: false,
    spawnedAt: 0,
    waitStartedAt: 0,
    offers: [],
    purchasesThisEncounter: 0,
    totalPurchases: 0,
    rerollsThisEncounter: 0,
    cooldown: 0,
  };
}

export function getGrandfatherRerollCost(rerollsThisEncounter: number): number {
  const r = Math.min(20, Math.max(0, rerollsThisEncounter || 0));
  // Starts at 4 perníčky and quickly gets progressively more expensive (4 -> 8 -> 16 -> 32 -> 64 -> 128...)
  return Math.round(4 * Math.pow(2, r));
}

export function getWaitDiscount(waitSeconds: number, maxDiscount = 0.30): number {
  return Math.min(maxDiscount, Math.max(0, waitSeconds) * 0.0025);
}

export const GRANDFATHER_INFLATION_RATE = 0.50;

/** Healing consumables and direct-currency treasures keep their base price. */
export function isGrandfatherPriceExempt(item: GrandfatherItemDef): boolean {
  return item.effect.type === 'heal' || item.effect.type === 'coins' || !!item.isRareInstant;
}

export function getGrandfatherPrice(
  item: GrandfatherItemDef,
  purchasedCount: number,
  luck: number,
  waitSeconds: number,
): number {
  const inflation = isGrandfatherPriceExempt(item) ? 1 : 1 + Math.max(0, purchasedCount) * GRANDFATHER_INFLATION_RATE;
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
  const rareInstants = availableItems.filter((item) => item.isRareInstant);
  const ananasDef = availableItems.find((item) => item.isAnanas);

  const selected: GrandfatherOffer[] = [];
  const now = performance.now();

  // 1. Vzácná nabídka z nůše: zřídka se objeví Arcivzácný ananas nebo jeden z 6 vzácných pomocných předmětů
  const rareRollChance = Math.min(0.40, 0.22 + Math.max(0, luck) * 0.025);
  if (Math.random() < rareRollChance) {
    const rollSpecial = Math.random();
    if (ananasDef && rollSpecial < 0.38) {
      selected.push({ itemId: ananasDef.id, offeredAt: now });
    } else if (rareInstants.length > 0) {
      const chosenRare = rareInstants[Math.floor(Math.random() * rareInstants.length)];
      selected.push({ itemId: chosenRare.id, offeredAt: now });
    }
  }

  // 2. Garantované zbraně (1–2 zbraně v nabídce pro pestrý výběr a rychlý rozvoj arzenálu)
  const targetWeaponCount = Math.min(availableWeapons.length, count - selected.length >= 3 ? 2 : 1);
  if (targetWeaponCount > 0) {
    const pool = [...availableWeapons];
    while (selected.filter((s) => availableWeapons.some((w) => w.id === s.itemId)).length < targetWeaponCount && pool.length > 0) {
      const weights = pool.map((w) => {
        const isOwned = playerWeapons.some((pw: any) => pw.id === w.weaponId);
        let weight = 1.0;
        if (isOwned) weight += 2.0;
        return weight;
      });
      const totalWeight = weights.reduce((acc, v) => acc + v, 0);
      let rand = Math.random() * totalWeight;
      let chosenIdx = 0;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          chosenIdx = i;
          break;
        }
      }
      const chosen = pool.splice(chosenIdx, 1)[0];
      if (!selected.some((s) => s.itemId === chosen.id)) {
        selected.push({ itemId: chosen.id, offeredAt: now });
      }
    }
  }

  // 3. Zbývající pozice z běžného fondu (bez dalších vzácných instancí a duplicit)
  const regularPool = availableItems.filter(
    (item) => !item.isRareInstant && !item.isAnanas && !selected.some((s) => s.itemId === item.id)
  );
  const weighted = [...regularPool].sort(() => Math.random() - 0.5);
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
