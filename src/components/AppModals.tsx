import React, { lazy, Suspense } from 'react';
import type { MetaProgression } from '../types';
import { GameIcon } from './GameIcon';
import { ControlsModal } from './ControlsModal';

const SettingsDevModal = lazy(() => import('./SettingsDevModal').then(m => ({ default: m.SettingsDevModal })));
const CombatTextSettingsModal = lazy(() => import('./CombatTextSettingsModal').then(m => ({ default: m.CombatTextSettingsModal })));
const TestModeModal = lazy(() => import('./TestModeModal').then(m => ({ default: m.TestModeModal })));
const AnimationTesterModal = lazy(() => import('./AnimationTesterModal').then(m => ({ default: m.AnimationTesterModal })));
const ResetProgressModal = lazy(() => import('./ResetProgressModal').then(m => ({ default: m.ResetProgressModal })));
const BestiaryModal = lazy(() => import('./BestiaryModal').then(m => ({ default: m.BestiaryModal })));
const PlanModal = lazy(() => import('./PlanModal').then(m => ({ default: m.PlanModal })));
const ArsenalModal = lazy(() => import('./ArsenalModal').then(m => ({ default: m.ArsenalModal })));

import { HunterUnlockModal } from './HunterUnlockModal';
import { HunterInfoModal } from './HunterInfoModal';
import { LevelUnlockModal } from './LevelUnlockModal';
import { WeaponUnlockModal } from './WeaponUnlockModal';
import {
  DEFAULT_COMBAT_TEXT_SETTINGS,
  setCombatTextSettings,
  isCombatTextCategoryEnabled,
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
  soundEffectsEnabled?: boolean;
  onToggleSoundEffects?: (enabled: boolean) => void;
  musicEnabled?: boolean;
  onToggleMusic?: (enabled: boolean) => void;
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
  unlockNotice: { title: string; desc: string; icon?: string } | null;
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
  soundEffectsEnabled,
  onToggleSoundEffects,
  musicEnabled,
  onToggleMusic,
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
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWeaponDetail) {
          e.preventDefault();
          onCloseWeaponDetail();
        } else if (selectedLevelDetail) {
          e.preventDefault();
          onCloseLevelDetail();
        } else if (selectedHunterInfo) {
          e.preventDefault();
          onCloseHunterInfo();
        } else if (selectedHunterDetail) {
          e.preventDefault();
          onCloseHunterDetail();
        } else if (isResetModalOpen) {
          e.preventDefault();
          onCloseResetModal();
        } else if (isAnimationTesterOpen) {
          e.preventDefault();
          onCloseAnimationTester();
        } else if (isTestModeOpen) {
          e.preventDefault();
          onCloseTestMode();
        } else if (isCombatTextModalOpen) {
          e.preventDefault();
          onCloseCombatTextModal();
        } else if (isPlanOpen) {
          e.preventDefault();
          onClosePlan();
        } else if (isArsenalOpen) {
          e.preventDefault();
          onCloseArsenal();
        } else if (isBestiaryOpen) {
          e.preventDefault();
          onCloseBestiary();
        } else if (isSettingsDevOpen) {
          e.preventDefault();
          onCloseSettingsDev();
        } else if (isControlsOpen) {
          e.preventDefault();
          onCloseControls();
        } else if (unlockNotice) {
          e.preventDefault();
          onDismissUnlockNotice();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedWeaponDetail,
    selectedLevelDetail,
    selectedHunterInfo,
    selectedHunterDetail,
    isResetModalOpen,
    isAnimationTesterOpen,
    isTestModeOpen,
    isCombatTextModalOpen,
    isPlanOpen,
    isArsenalOpen,
    isBestiaryOpen,
    isSettingsDevOpen,
    isControlsOpen,
    unlockNotice,
    onCloseWeaponDetail,
    onCloseLevelDetail,
    onCloseHunterInfo,
    onCloseHunterDetail,
    onCloseResetModal,
    onCloseAnimationTester,
    onCloseTestMode,
    onCloseCombatTextModal,
    onClosePlan,
    onCloseArsenal,
    onCloseBestiary,
    onCloseSettingsDev,
    onCloseControls,
    onDismissUnlockNotice,
  ]);

  return (
    <>
      {/* CONTROLS & OBJECTIVE MODAL */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={onCloseControls}
      />

      <Suspense fallback={null}>
        {/* SETTINGS & DEV MODAL */}
      <SettingsDevModal
        isOpen={isSettingsDevOpen}
        onClose={onCloseSettingsDev}
        soundEffectsEnabled={soundEffectsEnabled}
        onToggleSoundEffects={onToggleSoundEffects}
        musicEnabled={musicEnabled}
        onToggleMusic={onToggleMusic}
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
        windupTelegraphCirclesEnabled={Boolean(meta.windupTelegraphCirclesEnabled)}
        onToggleWindupTelegraphCircles={(enabled) => {
          saveMeta({ ...meta, windupTelegraphCirclesEnabled: enabled });
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
      </Suspense>

      {/* UNLOCK TOAST BANNER */}
      {unlockNotice &&
        isGameEffectEnabled('unlockNotificationsEnabled') &&
        isCombatTextCategoryEnabled('unlocksMilestones', meta.combatTextSettings) && (
        <div className="unlock-toast-banner" onClick={onDismissUnlockNotice}>
          <div style={{ fontSize: '1.2rem', color: 'var(--mustard)', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {unlockNotice.icon && <GameIcon icon={unlockNotice.icon} size={20} />}
            <span>{unlockNotice.title}</span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            {unlockNotice.desc}
          </div>
        </div>
      )}
    </>
  );
};
