import type { MetaProgression, WeaponId } from '../types';
import { WEAPON_LEGACY_ALIASES } from '../data/weapons';

import { isSupportedLocale } from '../i18n';

export function toCanonicalWeaponId(id: string): WeaponId {
  return WEAPON_LEGACY_ALIASES[id] || (id as WeaponId);
}

export function migrateMetaProgression(parsed: any): MetaProgression {
  if (!parsed || typeof parsed !== 'object') {
    return createDefaultMetaProgression();
  }

  const migratedUnlockedWeapons: Record<string, boolean> = {};
  if (parsed.unlockedWeapons && typeof parsed.unlockedWeapons === 'object') {
    for (const [key, val] of Object.entries(parsed.unlockedWeapons)) {
      if (val) {
        const canonical = toCanonicalWeaponId(key);
        migratedUnlockedWeapons[canonical] = true;
      }
    }
  }
  // Výchozí zbraně vždy odemčeny
  migratedUnlockedWeapons['osikovy_prut'] = true;
  migratedUnlockedWeapons['povidlove_buchty'] = true;
  migratedUnlockedWeapons['hromnicka'] = true;

  const migratedWeaponKillCounts: Record<string, any> = {};
  if (parsed.weaponKillCounts && typeof parsed.weaponKillCounts === 'object') {
    for (const [key, val] of Object.entries(parsed.weaponKillCounts)) {
      const canonical = toCanonicalWeaponId(key);
      migratedWeaponKillCounts[canonical] = (migratedWeaponKillCounts[canonical] || 0) + (typeof val === 'number' ? val : 0);
    }
  }

  const validLang: string = isSupportedLocale(parsed.currentLang) ? parsed.currentLang : 'cs';

  return {
    ...parsed,
    currentLang: validLang,
    selectedLevel: typeof parsed.selectedLevel === 'number' && parsed.selectedLevel >= 0 && parsed.selectedLevel <= 6
      ? parsed.selectedLevel
      : 0,
    highestLevelUnlocked: parsed.highestLevelUnlocked || (
      (parsed.bestiaryKills?.bezhlavy_rytir || 0) >= 1 ? 6 :
      (parsed.bestiaryKills?.mlynar || 0) >= 1 ? 5 :
      (parsed.bestiaryKills?.obr || 0) >= 1 ? 4 :
      (parsed.bestiaryKills?.hejkal || 0) >= 1 ? 3 :
      (parsed.bestiaryKills?.cert || 0) >= 1 ? 2 : 1
    ),
    completedLevels: parsed.completedLevels || {},
    dynamicDifficulty: typeof parsed.dynamicDifficulty === 'number' ? parsed.dynamicDifficulty : 2.0,
    unlockedWeapons: migratedUnlockedWeapons,
    weaponKillCounts: migratedWeaponKillCounts,
  };
}

export function createDefaultMetaProgression(): MetaProgression {
  return {
    krejcary: 0,
    dynamicDifficulty: 2.0,
    currentLang: 'cs',
    regenLevel: 0,
    ovenLevel: 0,
    scarecrowLevel: 0,
    millLevel: 0,
    wallLevel: 0,
    tavernShieldLevel: 0,
    forgeLevel: 0,
    churchLevel: 0,
    waterLevel: 0,
    forestLevel: 0,
    undeadLevel: 0,
    totalSoulsSaved: 0,
    totalChasnikSaved: 0,
    season: 'spring',
    trophiesClaimed: {},
    bestiaryKills: {},
    highestSurviveTime: 0,
    unlockedHunters: { wanderer: true, shepherd: false, korenarka: false, watchman: false, sexton: false, granny: false },
    unlockedWeapons: { osikovy_prut: true, povidlove_buchty: true, hromnicka: true },
    hunterKillCounts: {},
    weaponKillCounts: {},
    selectedLevel: 0,
    highestLevelUnlocked: 1,
    completedLevels: {},
  };
}
