/**
 * Bojové plovoucí texty (Combat Floating Texts)
 * Správa kategorií, předvoleb a filtrace pro vysokou plynulost a taktickou přehlednost v aréně.
 * Dle ADR 0016.
 */

export type CanonicalCombatTextCategory =
  | 'enemyDamage'
  | 'hunterDamage'
  | 'healing'
  | 'combatStates'
  | 'attackWindups'
  | 'combatShouts'
  | 'lootResources'
  | 'unlocksMilestones'
  | 'bossAnnouncements'
  | 'bossWarningBanners'
  | 'directorWarningBanners'
  | 'visualTelegraphCues';

export type CombatTextCategory =
  | CanonicalCombatTextCategory
  | 'playerDamage'
  | 'criticalHits'
  | 'statusEffects';

export interface CombatTextCategoryMeta {
  key: CanonicalCombatTextCategory;
  label: string;
  description: string;
  icon: string;
}

export const COMBAT_TEXT_CATEGORIES: CombatTextCategoryMeta[] = [
  {
    key: 'enemyDamage',
    label: 'Číselná zranění nepřátel',
    description: 'Běžné, kritické (💥) a bleskové (⚡) hodnoty poškození udělené strašidlům.',
    icon: '⚔️',
  },
  {
    key: 'hunterDamage',
    label: 'Zranění a úbytek Kuráže lovce',
    description: 'Červená čísla poškození při zásahu lovce strašidlem a varovná zranění z odrazu.',
    icon: '🩸',
  },
  {
    key: 'healing',
    label: 'Léčení a obnova Kuráže',
    description: 'Zelené a růžové hodnoty doplněné Kuráže ze škvarkových placek, jitrnic a posvěcení.',
    icon: '💖',
  },
  {
    key: 'combatStates',
    label: 'Bojové reakce a stavy',
    description: 'Taktické stavy na bojišti (DODGE, MINUL, ŠTÍT POHLTIL, IMUNNÍ, VYČERPÁN, Usmířen).',
    icon: '🛡️',
  },
  {
    key: 'attackWindups',
    label: 'Názvy nápřahů a útoků',
    description: 'Telegrafované nápřahy bubáků (Výpad čepelí, Dusot kopyt) a názvy zásahů zbraní lovce.',
    icon: '🌪️',
  },
  {
    key: 'combatShouts',
    label: 'Bojové pokřiky a atmosféra',
    description: 'Příběhové hlášky lovce, bojový pokřik při poklesu Kuráže a hlášky Zoufalé kuráže.',
    icon: '🗣️',
  },
  {
    key: 'lootResources',
    label: 'Zisky kořisti a surovin',
    description: 'Plovoucí počty sebraných perníčků (+1 🍪), krejcarů (+25 kr.), dušiček a cukrový spěch.',
    icon: '🪙',
  },
  {
    key: 'unlocksMilestones',
    label: 'Odemčení a milníky',
    description: 'Zprávy o odemčení nových lovců, zbraní, krajin a dosažení Milníků zbraně v aréně.',
    icon: '📜',
  },
  {
    key: 'bossAnnouncements',
    label: 'Plovoucí texty a chvaty bossů',
    description: 'Plovoucí texty nad bossy v aréně (např. Pekelné mletí, Smrtící mráz, Probuzení tří hlav, Poklad).',
    icon: '👑',
  },
  {
    key: 'bossWarningBanners',
    label: 'Bannery a příchody bossů',
    description: 'Velká varovná hlášení nahoře na obrazovce před příchodem minibossů, midbossů i finálních bossů.',
    icon: '🚨',
  },
  {
    key: 'directorWarningBanners',
    label: 'Varování výpravy (Režisér)',
    description: 'Výstražná oznámení režiséra výpravy o blížících se přepadech, elitních bubácích a bubácké díře.',
    icon: '⚠️',
  },
  {
    key: 'visualTelegraphCues',
    label: 'Grafické výstrahy a nápřahy',
    description: 'Vizuální varovné značky nad hlavami nepřátel při nápřahu a telegrafické kruhy trhlin na zemi.',
    icon: '🎯',
  },
];

export type CombatTextSettings = Record<CanonicalCombatTextCategory, boolean>;

export const DEFAULT_COMBAT_TEXT_SETTINGS: CombatTextSettings = {
  enemyDamage: true,
  hunterDamage: true,
  healing: true,
  combatStates: true,
  attackWindups: true,
  combatShouts: true,
  lootResources: true,
  unlocksMilestones: true,
  bossAnnouncements: true,
  bossWarningBanners: true,
  directorWarningBanners: true,
  visualTelegraphCues: true,
};

export const TACTICAL_COMBAT_TEXT_SETTINGS: CombatTextSettings = {
  enemyDamage: true,
  hunterDamage: true,
  healing: true,
  combatStates: true,
  attackWindups: false,
  combatShouts: false,
  lootResources: false,
  unlocksMilestones: true,
  bossAnnouncements: true,
  bossWarningBanners: true,
  directorWarningBanners: true,
  visualTelegraphCues: true,
};

export const PERFORMANCE_COMBAT_TEXT_SETTINGS: CombatTextSettings = {
  enemyDamage: false,
  hunterDamage: false,
  healing: false,
  combatStates: false,
  attackWindups: false,
  combatShouts: false,
  lootResources: false,
  unlocksMilestones: false,
  bossAnnouncements: false,
  bossWarningBanners: false,
  directorWarningBanners: false,
  visualTelegraphCues: false,
};

export type CombatTextPreset = 'full' | 'tactical' | 'performance' | 'custom';

let activeCombatTextSettings: CombatTextSettings = { ...DEFAULT_COMBAT_TEXT_SETTINGS };

export function setCombatTextSettings(settings: Partial<CombatTextSettings>): void {
  activeCombatTextSettings = {
    ...DEFAULT_COMBAT_TEXT_SETTINGS,
    ...activeCombatTextSettings,
    ...settings,
  };
}

export function getCombatTextSettings(): CombatTextSettings {
  return activeCombatTextSettings;
}

export function getCombatTextPreset(settings: CombatTextSettings = activeCombatTextSettings): CombatTextPreset {
  const matches = (preset: CombatTextSettings) =>
    COMBAT_TEXT_CATEGORIES.every((cat) => !!settings[cat.key] === !!preset[cat.key]);

  if (matches(DEFAULT_COMBAT_TEXT_SETTINGS)) return 'full';
  if (matches(TACTICAL_COMBAT_TEXT_SETTINGS)) return 'tactical';
  if (matches(PERFORMANCE_COMBAT_TEXT_SETTINGS)) return 'performance';
  return 'custom';
}

export function getSettingsForPreset(preset: 'full' | 'tactical' | 'performance'): CombatTextSettings {
  switch (preset) {
    case 'full':
      return { ...DEFAULT_COMBAT_TEXT_SETTINGS };
    case 'tactical':
      return { ...TACTICAL_COMBAT_TEXT_SETTINGS };
    case 'performance':
      return { ...PERFORMANCE_COMBAT_TEXT_SETTINGS };
  }
}

export function resolveCombatTextCategory(category: CombatTextCategory): CanonicalCombatTextCategory {
  if (category === 'playerDamage') return 'hunterDamage';
  if (category === 'criticalHits') return 'enemyDamage';
  if (category === 'statusEffects') return 'combatStates';
  return category;
}

export function isCombatTextCategoryEnabled(
  category: CombatTextCategory,
  customSettings?: CombatTextSettings
): boolean {
  const settings = customSettings || activeCombatTextSettings;
  const canonical = resolveCombatTextCategory(category);
  return !!settings[canonical];
}

/**
 * Bezpečně odvodí kategorii textu, pokud nebyla předána explicitně.
 */
export function inferCombatTextCategory(text: string): CombatTextCategory {
  const norm = String(text || '').trim();
  if (!norm) return 'enemyDamage';

  if (/^(?:\+?\d+(?:\s*(?:kr|groš|tolar|🍪|dušička|krejcar))|cukrový|dušička osvobozena|cink)/i.test(norm)) {
    return 'lootResources';
  }
  if (/^-\d+/i.test(norm) || /bleskov[ýy] odraz.*-\d+/i.test(norm) || /drtiv[ýy] n[áa]raz vidlemi.*-\d+/i.test(norm)) {
    return 'hunterDamage';
  }
  if (/^\+\d+.*kur[áa][žz]/i.test(norm) || /^\+\d+\s*(?:❤️|💖)/i.test(norm)) {
    return 'healing';
  }
  if (/^[-+]?\d+(?:[.,]\d+)?(?:\s*(?:💥|⚡))?$/.test(norm)) {
    return norm.startsWith('-') ? 'hunterDamage' : 'enemyDamage';
  }
  if (/(odem[čc]|unlock|miln[íi]k|nov[ýy] lovec|nov[áa] zbra[ňn])/i.test(norm)) {
    return 'unlocksMilestones';
  }
  if (/(poklad.*boss|vl[áa]dce bub[áa]k[ůu]|zklidn[ěe]n|👑|pekeln[ée] mlet[íi]|stavid|povode[ňn]|smrt[íi]c[íi] mraz|proklet[íi] hl[áa]sky|probuzen[íi].*hlav|mou[čc]n[ýy] mrak|mraziv[ýy] [řr]ev)/i.test(norm)) {
    return 'bossAnnouncements';
  }
  if (/(dodge|minul|št[íi]t|imunn|vy[čc]erp|usm[íi][řr]en|odraz|vyru[šs]en)/i.test(norm)) {
    return 'combatStates';
  }
  if (/(v[ýy]pad|dusot|plamen|seknut[íi]|sek |[úu]der|[šs]plouch|pr[áa]sk|bum|trhlina|[šs]lehnut[íi]|povidl[íi]|[šs]t[ěe]p|h[ýy]-j[ée]|balvan|k[áa]men|krafnut[íi]|pytel)/i.test(norm)) {
    return 'attackWindups';
  }
  if (/(ú[čc]et zaplat[íi]|rozohn[ěe]n[íi]|kdy[žz] ne j[áa])/i.test(norm)) {
    return 'combatShouts';
  }
  return 'enemyDamage';
}

/**
 * Rozpozná, zda varovný text na obrazovce patří k bossovi (příchod, schopnost nebo zuřivost).
 */
export function isBossWarningBanner(text: string): boolean {
  const norm = String(text || '').trim();
  if (!norm) return false;
  // Pokud jde o elitního bubáka, přepad režiséra nebo bubáckou díru, jedná se o varování výpravy
  if (/(?:elitn[íi] bub[áa]k|kradm[ée] kroky|dvoj[čc]e minibosse|bub[áa]ck[áa] d[íi]ra|[čc]as vypr[šs]el.*d[íi]ry|ritu[áa]l dokon[čc]en)/i.test(norm)) {
    return false;
  }
  return /(?:šéf úrovně|level boss|miniboss|midboss|morana|mlynář|mlynar|čert|cert|hejkal|obryně|obr|rytíř|rytir|drak|bílá paní|bila pani|klekánice|polednice|vodník|vodnik|meluzína|ohnivec|zbrojnoš|noční můra|sněhulák|pekelné mletí|stavid|povode[ňn]|moučný oblak|prokletí hlásky|odražená hlava|tři hlavy probuzeny|rampouchy ze stropu|pukající žula|probuzení hvozdu|čertovské rejdy|smrtící mraz|pokořen|vítězství|victory|beware.*boss|awakened frog)/i.test(norm);
}

/**
 * Zjistí, zda se má zobrazit varovný banner nahoře na obrazovce (#boss-warning-banner).
 * Důsledně odděluje a filtruje bannery bossů i varování režiséra výpravy.
 */
export function shouldShowWarningBanner(
  bannerText: string,
  customSettings?: CombatTextSettings
): boolean {
  const norm = String(bannerText || '').trim();
  if (!norm) return false;
  const settings = customSettings || activeCombatTextSettings;

  if (isBossWarningBanner(norm)) {
    return !!settings.bossWarningBanners;
  }
  // Jinak jde o varování výpravy (telegraf režiséra, přepadení, elitní bubák, bubácká díra)
  return !!settings.directorWarningBanners;
}

/**
 * Rychlá O(1) kontrola viditelnosti textu.
 * Pokud kategorie není zadána (např. starší volání), provede bezpečnou klasifikaci.
 */
export function shouldDrawCombatText(
  category?: CombatTextCategory,
  text?: string,
  customSettings?: CombatTextSettings
): boolean {
  const settings = customSettings || activeCombatTextSettings;
  const resolvedCategory = category || (text ? inferCombatTextCategory(text) : 'enemyDamage');
  return !!settings[resolvedCategory];
}

