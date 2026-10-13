/**
 * Centralized presentation-only effect settings.
 * The game engine may continue updating mechanics while their visual/audio
 * feedback is hidden; this module controls presentation, never gameplay rules.
 */
export type EffectCategory =
  | 'effectsEnabled'
  | 'dynamicLightingEnabled'
  | 'combatVfxEnabled'
  | 'warningIndicatorsEnabled'
  | 'enemyDescriptorsEnabled'
  | 'attackDescriptorsEnabled'
  | 'statusIndicatorsEnabled'
  | 'unlockNotificationsEnabled'
  | 'soundEffectsEnabled'
  | 'musicEnabled';

export type GameEffectSettings = Record<EffectCategory, boolean>;

export const DEFAULT_GAME_EFFECT_SETTINGS: GameEffectSettings = {
  effectsEnabled: true,
  dynamicLightingEnabled: true,
  combatVfxEnabled: true,
  warningIndicatorsEnabled: true,
  enemyDescriptorsEnabled: true,
  attackDescriptorsEnabled: true,
  statusIndicatorsEnabled: true,
  unlockNotificationsEnabled: true,
  soundEffectsEnabled: true,
  musicEnabled: true,
};

let currentSettings: GameEffectSettings = { ...DEFAULT_GAME_EFFECT_SETTINGS };

export function setGameEffectSettings(settings: Partial<GameEffectSettings>): void {
  currentSettings = { ...DEFAULT_GAME_EFFECT_SETTINGS, ...currentSettings, ...settings };
}

export function getGameEffectSettings(): GameEffectSettings {
  return currentSettings;
}

export function isGameEffectEnabled(category: EffectCategory): boolean {
  return currentSettings.effectsEnabled && currentSettings[category];
}

/**
 * Text overlays are classified by purpose so users can hide narration without
 * losing ordinary damage numbers or any actual combat feedback from the engine.
 */
export function shouldDrawFloatingText(text: string): boolean {
  const settings = currentSettings;
  if (!settings.effectsEnabled) return false;

  const normalized = String(text || '').trim();
  if (!normalized) return false;

  const unlockPattern = /(odem[cč]en|odem[kč]|unlock|zachr[aá]n[eě]n|v[iý]t[eě]zstv[ií]|poko[rř]en|z[bá]v[eě]r|nov[yý] lovec|nov[aá] zbra[nň]|odhalen[aá]?|nov[aý]|postup|mil[nñ]ik)/i;
  if (unlockPattern.test(normalized)) return settings.unlockNotificationsEnabled;

  // Pure hit-point values remain visible unless the master switch is disabled.
  if (/^[-+]?d+(?:[.,]d+)?(?:s*(?:❤️|💥|🥐|🍪|⚡))?$/.test(normalized)) return true;

  const statusPattern = /(imunn[ií]|odra[zž]eno|nam, nam|ňam, ňam|mokr[aá] lou[zž]e|zpomal|otr[aá]v|p[rř]ejeden[ií]|zmr[aá]z|mraziv|chlad|namo[cč]|omr[aá]z|stun|omr[aá][zž]en|status|sv[aá]t[eé] sp[aá]len[ií]|sv[aá]t[aá] zk[aá]za|po[zž]ehn[aá]n|kritick[yý] z[aá]sah|kritick[yý] [uú]der|dodge|minul|odolal|[0-3]/3)/i;
  if (statusPattern.test(normalized) && !settings.statusIndicatorsEnabled) return false;

  const attackPattern = /(v[yý]pad|dusot|p[ií][sš][tť]alka|kadidlo|po[zž]ehn[aá]n[ií]|[uú]tok|[uú]der|sek |seknut[ií]|v[aá]nice|dupa[ká]|r[eě]jdy|mraziv[yý] v[ií]tr|v[eě]tev!|dubilka|[sš]lehnut[ií]|bleskov[yý] odraz|poplach|svat[aá] zk[aá]za|[cč]as se zastavil|[oó]c[ií]st[eě]no|p[rř][aá]sk!|d[eě]s!)/i;
  if (attackPattern.test(normalized) && !settings.attackDescriptorsEnabled) return false;

  return true;
}
