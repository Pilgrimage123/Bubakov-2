import React from 'react';
import type { MetaProgression } from '../types';
import { ControlsModal } from './ControlsModal';
import { SettingsDevModal } from './SettingsDevModal';
import { CombatTextSettingsModal } from './CombatTextSettingsModal';
import { TestModeModal } from './TestModeModal';
import { AnimationTesterModal } from './AnimationTesterModal';
import { ResetProgressModal } from './ResetProgressModal';
import { BestiaryModal } from './BestiaryModal';
import { PlanModal } from './PlanModal';
import { HunterUnlockModal } from './HunterUnlockModal';
import { HunterInfoModal } from './HunterInfoModal';
import { LevelUnlockModal } from './LevelUnlockModal';
import { ArsenalModal } from './ArsenalModal';
import { WeaponUnlockModal } from './WeaponUnlockModal';
import {
  DEFAULT_COMBAT_TEXT_SETTINGS,
  setCombatTextSettings,
} from '../game/combatTextSettings';
import { isGameEffectEnabled } from '../game/effectSettings';

export interface AppModalsProps {
  meta: MetaProgression;
  saveMeta: (next: MetaProgression) => void;

  // Controls modal
  isControlsOpen: boolean;
  onCloseControls: () => void;

  // Settings & dev modal
  isSettingsDevOpen: boolean;
  onCloseSettingsDev: () => void;
  onOpenCombatTextSettings: () => void;
  onOpenTestMode: () => void;
  onOpenAnimationTester: () => void;
  onOpenPlan: () => void;
  onOpenResetProgress: () => void;

  // Combat text settings modal
  isCombatTextModalOpen: boolean;
  onCloseCombatTextModal: () => void;

  // Test mode (sandbox) modal
  isTestModeOpen: boolean;
  onCloseTestMode: () => void;
  onStartTestRun: (hero: any, levelId: any, weapons: any[], grandfatherUpgrades?: Record<string, number>) => void;
  selectedLevelId: number;
  onOpenGrandfatherShopTest: () => void;

  // Animation tester modal
  isAnimationTesterOpen: boolean;
  onCloseAnimationTester: () => void;

  // Reset progress modal
  isResetModalOpen: boolean;
  onCloseResetModal: () => void;
  onConfirmResetProgress: () => void;

  // Bestiary modal
  isBestiaryOpen: boolean;
  onCloseBestiary: () => void;

  // Plan modal
  isPlanOpen: boolean;
  onClosePlan: () => void;

  // Hunter modals
  selectedHunterDetail: any;
  onCloseHunterDetail: () => void;
  onStartIfHunterUnlocked: (id: any) => void;
  selectedHunterInfo: any;
  onCloseHunterInfo: () => void;

  // Level unlock modal
  selectedLevelDetail: any;
  onCloseLevelDetail: () => void;
  onSelectLevelIfUnlocked: (id: any) => void;

  // Arsenal & weapon detail modals
  isArsenalOpen: boolean;
  onCloseArsenal: () => void;
  selectedWeaponDetail: any;
  onCloseWeaponDetail: () => void;
  onInspectWeapon: (prog: any) => void;

  // Unlock toast notice
  unlockNotice: { title: string; desc: string } | null;
  onDismissUnlockNotice: () => void;
}

/**
 * AppModals: Modální šev (ADR 0018)
 * Zastřešuje dialogová a konfigurační okna aplikace.
 * Odděluje deklaraci UI dialogů od jádra herní smyčky a plátna v App.tsx,
 * čímž eliminuje merge konflikty při souběžném vývoji z Google AI Studia.
 */
export const AppModals: React.FC<AppModalsProps> = ({
  meta,
  saveMeta,
  isControlsOpen,
  onCloseControls,
  isSettingsDevOpen,
  onCloseSettingsDev,
  onOpenCombatTextSettings,
  onOpenTestMode,
  onOpenAnimationTester,
  onOpenPlan,
  onOpenResetProgress,
  isCombatTextModalOpen,
  onCloseCombatTextModal,
  isTestModeOpen,
  onCloseTestMode,
  onStartTestRun,
  selectedLevelId,
  onOpenGrandfatherShopTest,
  isAnimationTesterOpen,
  onCloseAnimationTester,
  isResetModalOpen,
  onCloseResetModal,
  onConfirmResetProgress,
  isBestiaryOpen,
  onCloseBestiary,
  isPlanOpen,
  onClosePlan,
  selectedHunterDetail,
  onCloseHunterDetail,
  onStartIfHunterUnlocked,
  selectedHunterInfo,
  onCloseHunterInfo,
  selectedLevelDetail,
  onCloseLevelDetail,
  onSelectLevelIfUnlocked,
  isArsenalOpen,
  onCloseArsenal,
  selectedWeaponDetail,
  onCloseWeaponDetail,
  onInspectWeapon,
  unlockNotice,
  onDismissUnlockNotice,
}) => {
  return (
    <>
      {/* CONTROLS & OBJECTIVE MODAL */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={onCloseControls}
      />

      {/* SETTINGS & DEV MODAL */}
      <SettingsDevModal
        isOpen={isSettingsDevOpen}
        onClose={onCloseSettingsDev}
        performanceMode={!!meta.performanceMode}
        performanceProfile={meta.performanceProfile || (meta.performanceMode ? 'performance' : 'balanced')}
        onChangePerformanceProfile={(profile) => {
          saveMeta({ ...meta, performanceProfile: profile, performanceMode: profile === 'performance' });
        }}
        onTogglePerformanceMode={(enabled) => {
          saveMeta({ ...meta, performanceMode: enabled, performanceProfile: enabled ? 'performance' : 'balanced' });
        }}
        showPerfOverlay={!!meta.showPerfOverlay}
        onToggleShowPerfOverlay={(enabled) => {
          saveMeta({ ...meta, showPerfOverlay: enabled });
        }}
        dynamicLightingEnabled={meta.dynamicLightingEnabled !== false}
        onToggleDynamicLighting={(enabled) => {
          saveMeta({ ...meta, dynamicLightingEnabled: enabled });
        }}
        dynamicDifficulty={meta.dynamicDifficulty ?? 3.0}
        onChangeDynamicDifficulty={(diff) => {
          saveMeta({ ...meta, dynamicDifficulty: diff });
        }}
        onOpenCombatTextSettings={onOpenCombatTextSettings}
        onOpenTestMode={onOpenTestMode}
        onOpenAnimationTester={onOpenAnimationTester}
        onOpenPlan={onOpenPlan}
        onOpenResetProgress={onOpenResetProgress}
      />

      {/* COMBAT TEXT SETTINGS MODAL */}
      <CombatTextSettingsModal
        isOpen={isCombatTextModalOpen}
        onClose={onCloseCombatTextModal}
        settings={meta.combatTextSettings || DEFAULT_COMBAT_TEXT_SETTINGS}
        onChangeSettings={(nextSettings) => {
          saveMeta({ ...meta, combatTextSettings: nextSettings });
          setCombatTextSettings(nextSettings);
        }}
      />

      {/* TEST MODE (SANDBOX) MODAL */}
      <TestModeModal
        isOpen={isTestModeOpen}
        onClose={onCloseTestMode}
        onStartTestRun={(hero, levelId, weapons, grandfatherUpgrades) => {
          onStartTestRun(hero, levelId, weapons, grandfatherUpgrades);
        }}
        initialLevelId={selectedLevelId}
        onOpenGrandfatherShop={onOpenGrandfatherShopTest}
      />

      {/* ANIMATION TESTER MODAL */}
      <AnimationTesterModal
        isOpen={isAnimationTesterOpen}
        onClose={onCloseAnimationTester}
      />

      {/* RESET PROGRESS CONFIRMATION MODAL */}
      <ResetProgressModal
        isOpen={isResetModalOpen}
        onClose={onCloseResetModal}
        onConfirmReset={onConfirmResetProgress}
      />

      {/* BESTIARY MODAL */}
      <BestiaryModal
        isOpen={isBestiaryOpen}
        onClose={onCloseBestiary}
        bestiaryKills={meta.bestiaryKills || {}}
      />

      {/* PLAN MODAL */}
      <PlanModal
        isOpen={isPlanOpen}
        onClose={onClosePlan}
        defaultTab="plan"
      />

      {/* HUNTER UNLOCK DETAILS MODAL */}
      <HunterUnlockModal
        progress={selectedHunterDetail}
        onClose={onCloseHunterDetail}
        onStartIfUnlocked={onStartIfHunterUnlocked}
      />
      <HunterInfoModal
        hunter={selectedHunterInfo}
        onClose={onCloseHunterInfo}
      />

      {/* LEVEL UNLOCK DETAILS MODAL */}
      <LevelUnlockModal
        progress={selectedLevelDetail}
        onClose={onCloseLevelDetail}
        onSelectIfUnlocked={onSelectLevelIfUnlocked}
      />

      {/* ARSENAL & WEAPONS UNLOCK MODAL */}
      <ArsenalModal
        isOpen={isArsenalOpen}
        onClose={onCloseArsenal}
        meta={meta}
        onInspectWeapon={onInspectWeapon}
      />

      {/* WEAPON UNLOCK DETAILS MODAL */}
      <WeaponUnlockModal
        progress={selectedWeaponDetail}
        onClose={onCloseWeaponDetail}
      />

      {/* UNLOCK TOAST BANNER */}
      {unlockNotice && isGameEffectEnabled('unlockNotificationsEnabled') && (
        <div className="unlock-toast-banner" onClick={onDismissUnlockNotice}>
          <div style={{ fontSize: '1.2rem', color: 'var(--mustard)', marginBottom: '3px' }}>
            {unlockNotice.title}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            {unlockNotice.desc}
          </div>
        </div>
      )}
    </>
  );
};
