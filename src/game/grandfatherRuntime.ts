import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';
import { SYNERGISTIC_UPGRADES, getSynergisticUpgrade } from '../data/synergisticUpgrades';

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
      return (pw ? pw.level : 0) < (item.maxStacks ?? 8);
    }
    return purchasedIds.filter((id) => id === item.id).length < (item.maxStacks ?? Number.POSITIVE_INFINITY);
  };
  const availableItems = GRANDFATHER_ITEMS.filter(isAvailable);
  const availableWeapons = availableItems.filter((item) => item.isWeapon);
  const rareInstants = availableItems.filter((item) => item.isRareInstant);
  const ananasDef = availableItems.find((item) => item.isAnanas);
  const selected: GrandfatherOffer[] = [];
  const now = performance.now();
  const projectileIds = new Set(['kysela_okurka', 'povidlove_buchty', 'devatero_kviti', 'snehova_koule', 'kynuty_kolac', 'horky_brambor', 'vceli_roj', 'svecena_kropenka']);
  const weaponUpgradeOffers: GrandfatherOffer[] = [];
  for (const weapon of playerWeapons) {
    if (!projectileIds.has(weapon.id) || (weapon.level || 0) <= 0) continue;
    const alreadySpecialized = (weapon.synergisticUpgrades || []).some((id: string) => getSynergisticUpgrade(id)?.weaponId === weapon.id);
    if (alreadySpecialized) continue;
    const alternatives = Object.values(SYNERGISTIC_UPGRADES).filter((entry) => entry.weaponId === weapon.id);
    if (alternatives.length > 0) {
      const upgrade = alternatives[Math.floor(Math.random() * alternatives.length)];
      weaponUpgradeOffers.push({ itemId: `weapon_upgrade:${weapon.id}:${upgrade.id}`, offeredAt: now });
    }
  }
  const rareRollChance = Math.min(0.40, 0.22 + Math.max(0, luck) * 0.025);
  if (Math.random() < rareRollChance) {
    if (ananasDef && Math.random() < 0.38) selected.push({ itemId: ananasDef.id, offeredAt: now });
    else if (rareInstants.length > 0) selected.push({ itemId: rareInstants[Math.floor(Math.random() * rareInstants.length)].id, offeredAt: now });
  }
  if (weaponUpgradeOffers.length > 0 && selected.length < count && Math.random() < 0.45) {
    selected.push(weaponUpgradeOffers[Math.floor(Math.random() * weaponUpgradeOffers.length)]);
  }
  const targetWeaponCount = Math.min(availableWeapons.length, count - selected.length >= 3 ? 2 : 1);
  if (targetWeaponCount > 0) {
    const pool = [...availableWeapons];
    while (selected.filter((offer) => availableWeapons.some((weapon) => weapon.id === offer.itemId)).length < targetWeaponCount && pool.length > 0) {
      const weights = pool.map((item) => playerWeapons.some((weapon: any) => weapon.id === item.weaponId) ? 3 : 1);
      const totalWeight = weights.reduce((sum, value) => sum + value, 0);
      let roll = Math.random() * totalWeight;
      let chosenIdx = 0;
      for (let i = 0; i < weights.length; i++) { roll -= weights[i]; if (roll <= 0) { chosenIdx = i; break; } }
      const chosen = pool.splice(chosenIdx, 1)[0];
      if (!selected.some((offer) => offer.itemId === chosen.id)) selected.push({ itemId: chosen.id, offeredAt: now });
    }
  }
  const regularPool = availableItems.filter((item) => !item.isRareInstant && !item.isAnanas && !selected.some((offer) => offer.itemId === item.id));
  const shuffled = [...regularPool].sort(() => Math.random() - 0.5);
  const affordable = shuffled.filter((item) => item.baseCost <= gingerbread);
  const candidates = [...affordable, ...shuffled.filter((item) => !affordable.includes(item))];
  for (const item of candidates) {
    if (selected.length >= count) break;
    if (selected.some((offer) => offer.itemId === item.id)) continue;
    const luckBoost = Math.max(0, luck) * 0.04 * (item.luckWeight ?? 1);
    if (Math.random() > Math.min(1, 0.45 + luckBoost) && selected.length < count - 1) continue;
    selected.push({ itemId: item.id, offeredAt: now });
  }
  for (const offer of [...weaponUpgradeOffers].sort(() => Math.random() - 0.5)) {
    if (selected.length >= count) break;
    if (!selected.some((entry) => entry.itemId === offer.itemId)) selected.push(offer);
  }
  for (const item of candidates) {
    if (selected.length >= count) break;
    if (!selected.some((offer) => offer.itemId === item.id)) selected.push({ itemId: item.id, offeredAt: now });
  }
  if (selected.length === 0 && availableItems[0]) selected.push({ itemId: availableItems[0].id, offeredAt: now });
  return selected.sort(() => Math.random() - 0.5);
}
export interface WeaponUpgradeOfferDef {
  id: string;
  weaponId: string;
  upgradeId: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
}

const PROJECTILE_WEAPON_IDS = new Set([
  'kysela_okurka', 'povidlove_buchty', 'devatero_kviti', 'snehova_koule',
  'kynuty_kolac', 'horky_brambor', 'vceli_roj', 'hromnicka', 'svecena_kropenka',
]);

export function getWeaponUpgradeOffer(itemId: string): WeaponUpgradeOfferDef | undefined {
  const match = /^weapon_upgrade:([^:]+):([^:]+)$/.exec(itemId);
  if (!match) return undefined;
  const [, weaponId, upgradeId] = match;
  if (!PROJECTILE_WEAPON_IDS.has(weaponId)) return undefined;
  const upgrade = getSynergisticUpgrade(upgradeId);
  if (!upgrade || upgrade.weaponId !== weaponId) return undefined;
  return { id: itemId, weaponId, upgradeId, name: upgrade.name, description: upgrade.description, icon: '✨', baseCost: 35 };
}
