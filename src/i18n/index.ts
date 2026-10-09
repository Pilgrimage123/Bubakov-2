import { cs } from './locales/cs';
import { en } from './locales/en';

export interface LocaleDefinition {
  code: string;
  label: string;
  flag: string;
  dict: Record<string, string>;
}

export type SupportedLang = string;

export const csDict = cs;
export const enDict = en;

export const SUPPORTED_LOCALES: LocaleDefinition[] = [
  { code: 'cs', label: 'Čeština', flag: '🇨🇿', dict: cs },
  { code: 'en', label: 'English', flag: '🇬🇧', dict: en },
];

export const dictionaries: Record<string, Record<string, string>> = {
  cs,
  en,
};

export function getSupportedLocales(): LocaleDefinition[] {
  return SUPPORTED_LOCALES;
}

export function isSupportedLocale(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return SUPPORTED_LOCALES.some((locale) => locale.code === code);
}

export function getLocale(code: string): LocaleDefinition {
  return SUPPORTED_LOCALES.find((l) => l.code === code) || SUPPORTED_LOCALES[0];
}

export function registerLocale(locale: LocaleDefinition): void {
  const existingIdx = SUPPORTED_LOCALES.findIndex((l) => l.code === locale.code);
  if (existingIdx >= 0) {
    SUPPORTED_LOCALES[existingIdx] = locale;
  } else {
    SUPPORTED_LOCALES.push(locale);
  }
  dictionaries[locale.code] = locale.dict;
}

export function unregisterLocale(code: string): void {
  const idx = SUPPORTED_LOCALES.findIndex((l) => l.code === code);
  if (idx >= 0) {
    SUPPORTED_LOCALES.splice(idx, 1);
  }
  delete dictionaries[code];
}

/**
 * Layered fallback localization lookup:
 * Target Lang -> English ('en') -> Czech ('cs') -> Key
 */
export function t(key: string, lang: SupportedLang = 'cs', params?: Record<string, string | number>): string {
  const targetLoc = SUPPORTED_LOCALES.find((l) => l.code === lang) || (dictionaries[lang] ? { dict: dictionaries[lang] } : null);
  let text = targetLoc?.dict?.[key];

  // Fallback 1: English ('en')
  if (!text && lang !== 'en') {
    const enLoc = SUPPORTED_LOCALES.find((l) => l.code === 'en') || { dict: dictionaries.en };
    text = enLoc?.dict?.[key];
  }

  // Fallback 2: Czech ('cs') (canonical base language)
  if (!text && lang !== 'cs') {
    const csLoc = SUPPORTED_LOCALES.find((l) => l.code === 'cs') || { dict: dictionaries.cs };
    text = csLoc?.dict?.[key];
  }

  // Fallback 3: Return raw key
  if (!text) {
    return key;
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

export function getWeaponTranslation(id: string, lang: SupportedLang = 'cs'): { name: string; desc: string } {
  return {
    name: t(`weapon.${id}.name`, lang),
    desc: t(`weapon.${id}.desc`, lang),
  };
}

export function getBuildingTranslation(id: string, lang: SupportedLang = 'cs'): { name: string; story: string; role: string; helpers: string } {
  return {
    name: t(`building.${id}.name`, lang),
    story: t(`building.${id}.story`, lang),
    role: t(`building.${id}.role`, lang),
    helpers: t(`building.${id}.helpers`, lang),
  };
}

export function getBestiaryTranslation(id: string, lang: SupportedLang = 'cs'): { name: string; title: string } {
  return {
    name: t(`bestiary.${id}.name`, lang),
    title: t(`bestiary.${id}.title`, lang),
  };
}

export function getMilestoneTranslation(
  choiceId: string,
  fallbackName: string = '',
  fallbackDesc: string = '',
  lang: SupportedLang = 'cs'
): { name: string; desc: string } {
  const nameKey = `milestone.${choiceId}.name`;
  const descKey = `milestone.${choiceId}.desc`;
  const translatedName = t(nameKey, lang);
  const translatedDesc = t(descKey, lang);
  return {
    name: translatedName !== nameKey ? translatedName : fallbackName,
    desc: translatedDesc !== descKey ? translatedDesc : fallbackDesc,
  };
}

export function getLevelTranslation(id: number | string, lang: SupportedLang = 'cs'): {
  name: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  description: string;
  lore: string;
  unlockRequirementText: string;
  miniBoss: { name: string; warning: string };
  midBoss: { name: string; warning: string };
  finalBoss: { name: string; warning: string };
} {
  return {
    name: t(`level.${id}.name`, lang),
    shortTitle: t(`level.${id}.short_title`, lang),
    subtitle: t(`level.${id}.subtitle`, lang),
    badge: t(`level.${id}.badge`, lang),
    description: t(`level.${id}.description`, lang),
    lore: t(`level.${id}.lore`, lang),
    unlockRequirementText: t(`level.${id}.unlock_requirement`, lang),
    miniBoss: {
      name: t(`level.${id}.miniboss.name`, lang),
      warning: t(`level.${id}.miniboss.warning`, lang),
    },
    midBoss: {
      name: t(`level.${id}.midboss.name`, lang),
      warning: t(`level.${id}.midboss.warning`, lang),
    },
    finalBoss: {
      name: t(`level.${id}.finalboss.name`, lang),
      warning: t(`level.${id}.finalboss.warning`, lang),
    },
  };
}

export function getHunterTranslation(id: string, lang: SupportedLang = 'cs'): {
  name: string;
  title: string;
  challengeTitle: string;
  challengeShortDesc: string;
  challengeLongDesc: string;
  weaponHint: string;
  abilityHint: string;
  lore: string;
} {
  return {
    name: t(`hunter.${id}.name`, lang),
    title: t(`hunter.${id}.title`, lang),
    challengeTitle: t(`hunter.${id}.challenge_title`, lang),
    challengeShortDesc: t(`hunter.${id}.challenge_short_desc`, lang),
    challengeLongDesc: t(`hunter.${id}.challenge_long_desc`, lang),
    weaponHint: t(`hunter.${id}.spoiled_weapon_hint`, lang),
    abilityHint: t(`hunter.${id}.spoiled_ability_hint`, lang),
    lore: t(`hunter.${id}.bio`, lang),
  };
}

export function getGrandfatherItemTranslation(id: string, lang: SupportedLang = 'cs'): { name: string; desc: string } {
  return {
    name: t(`grandfather_item.${id}.name`, lang),
    desc: t(`grandfather_item.${id}.desc`, lang),
  };
}

export function getTrophyTranslation(id: string, lang: SupportedLang = 'cs'): { title: string; desc: string } {
  return {
    title: t(`trophy.${id}.title`, lang),
    desc: t(`trophy.${id}.desc`, lang),
  };
}
