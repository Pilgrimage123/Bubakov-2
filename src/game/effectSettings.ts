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

import {
  CombatTextCategory,
  shouldDrawCombatText,
  isCombatTextCategoryEnabled,
} from './combatTextSettings';

export * from './combatTextSettings';

/**
 * Classify floating text by purpose using the ADR 0016 9-category system.
 */
export function shouldDrawFloatingText(text: string, category?: CombatTextCategory): boolean {
  const settings = currentSettings;
  if (!settings.effectsEnabled) return false;

  return shouldDrawCombatText(category, text);
}

