import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';
import { SYNERGISTIC_UPGRADES, getSynergisticUpgrade } from '../data/synergisticUpgrades';
import { rollRandomWeaponUpgrade, getWeaponRankDef } from '../data/weaponMilestones';
import { toCanonicalWeaponId } from './migration';

export interface GrandfatherOffer {
  itemId: string;
  offeredAt: number;
  candidateUpgradeId?: string;
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

/** Healing consumables and direct-currency treasures keep their base price and never increase future prices. */
export function isGrandfatherPriceExempt(item: GrandfatherItemDef): boolean {
  return item.effect.type === 'heal' || item.effect.type === 'coins' || !!item.isRareInstant;
}

/**
 * Counts only purchases that increase the price of later permanent upgrades.
 * Coin payouts and other price-exempt one-shot purchases are ignored. Dynamic
 * weapon-specialization purchases have no static item definition, so they count.
 */
export function getGrandfatherInflatingPurchaseCount(purchasedIds: string[]): number {
  let count = 0;
  for (const id of purchasedIds) {
    const item = GRANDFATHER_ITEMS.find((candidate) => candidate.id === id);
    if (/^weapon_upgrade:/.test(id) || (item && !isGrandfatherPriceExempt(item))) count++;
  }
  return count;
}

export function getGrandfatherPrice(
  item: GrandfatherItemDef,
  purchasedCount: number,
  luck: number,
  waitSeconds: number,
): number {
  const inflation = isGrandfatherPriceExempt(item) ? 1 : 1 + Math.max(0, purchasedCount) * GRANDFATHER_INFLATION_RATE;
  const luckDiscount = Math.min(0.20, Math.max(0, (luck - 80) * 0.003));
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
  playerState: { playerHp?: number; playerMaxHp?: number } = {},
): GrandfatherOffer[] {
  const isFullCourage = playerState.playerHp !== undefined
    && playerState.playerMaxHp !== undefined
    && playerState.playerHp >= playerState.playerMaxHp;
  const isAvailable = (item: GrandfatherItemDef) => {
    if (isFullCourage && item.effect.type === 'heal') return false;
    if (item.isWeapon && item.weaponId) {
      const targetCanonicalId = toCanonicalWeaponId(item.weaponId);
      const pw = playerWeapons.find((w: any) => toCanonicalWeaponId(w.id) === targetCanonicalId);
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

  const makeOffer = (item: GrandfatherItemDef): GrandfatherOffer => {
    let candidateUpgradeId: string | undefined;
    if (item.isWeapon && item.weaponId) {
      const targetCanonicalId = toCanonicalWeaponId(item.weaponId);
      const pw = playerWeapons.find((w: any) => toCanonicalWeaponId(w.id) === targetCanonicalId);
      const nextLvl = (pw ? pw.level : 0) + 1;
      const isMilestone = nextLvl === 3 || nextLvl === 5 || nextLvl === 8;
      if (!isMilestone && nextLvl > 1) {
        candidateUpgradeId = rollRandomWeaponUpgrade(targetCanonicalId, pw)?.id || getWeaponRankDef(targetCanonicalId, nextLvl)?.normalUpgradeId;
      }
    }
    return { itemId: item.id, offeredAt: now, candidateUpgradeId };
  };

  // 1. Vzácná nabídka z nůše: zřídka se objeví Arcivzácný ananas nebo jeden z 6 vzácných pomocných předmětů
  const rareRollChance = Math.min(0.50, 0.20 * (Math.max(0, luck) / 100));
  if (Math.random() < rareRollChance) {
    const rollSpecial = Math.random();
    if (ananasDef && rollSpecial < 0.38) {
      selected.push(makeOffer(ananasDef));
    } else if (rareInstants.length > 0) {
      const chosenRare = rareInstants[Math.floor(Math.random() * rareInstants.length)];
      selected.push(makeOffer(chosenRare));
    }
  }

  const targetWeaponCount = Math.min(availableWeapons.length, count - selected.length >= 3 ? 2 : 1);
  if (targetWeaponCount > 0) {
    const pool = [...availableWeapons];
    while (selected.filter((offer) => availableWeapons.some((weapon) => weapon.id === offer.itemId)).length < targetWeaponCount && pool.length > 0) {
      const weights = pool.map((item) => {
        const targetCanonicalId = item.weaponId ? toCanonicalWeaponId(item.weaponId) : '';
        return playerWeapons.some((weapon: any) => toCanonicalWeaponId(weapon.id) === targetCanonicalId) ? 3 : 1;
      });
      const totalWeight = weights.reduce((sum, value) => sum + value, 0);
      let roll = Math.random() * totalWeight;
      let chosenIdx = 0;
      for (let i = 0; i < weights.length; i++) { roll -= weights[i]; if (roll <= 0) { chosenIdx = i; break; } }
      const chosen = pool.splice(chosenIdx, 1)[0];
      if (!selected.some((s) => s.itemId === chosen.id)) {
        selected.push(makeOffer(chosen));
      }
    }
  }

  const regularPool = availableItems.filter((item) => !item.isRareInstant && !item.isAnanas && !selected.some((offer) => offer.itemId === item.id));
  const shuffled = [...regularPool].sort(() => Math.random() - 0.5);
  const affordable = shuffled.filter((item) => item.baseCost <= gingerbread);
  const candidates = [...affordable, ...shuffled.filter((item) => !affordable.includes(item))];
  for (const item of candidates) {
    if (selected.length >= count) break;
    if (selected.some((offer) => offer.itemId === item.id)) continue;
    const luckBoost = Math.max(0, (luck - 80) / 20) * 0.04 * (item.luckWeight ?? 1);
    if (Math.random() > Math.min(1, 0.45 + luckBoost) && selected.length < count - 1) continue;
    selected.push(makeOffer(item));
  }
  for (const item of candidates) {
    if (selected.length >= count) break;
    if (!selected.some((offer) => offer.itemId === item.id)) {
      selected.push(makeOffer(item));
    }
  }

  if (selected.length === 0 && availableItems[0]) {
    selected.push(makeOffer(availableItems[0]));
  }
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
  'splaseny_houser',
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
