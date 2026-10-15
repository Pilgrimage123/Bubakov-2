import React from 'react';
import { sound } from '../audio';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { DYNAMIC_DIFFICULTY_PRESETS, getDifficultyPreset } from '../game/director';

interface SettingsDevModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceMode: boolean;
  performanceProfile: 'fidelity' | 'balanced' | 'performance';
  onChangePerformanceProfile: (profile: 'fidelity' | 'balanced' | 'performance') => void;
  onTogglePerformanceMode: (enabled: boolean) => void;
  showPerfOverlay: boolean;
  onToggleShowPerfOverlay: (enabled: boolean) => void;
  dynamicLightingEnabled?: boolean;
  onToggleDynamicLighting?: (enabled: boolean) => void;
  dynamicDifficulty?: number;
  onChangeDynamicDifficulty?: (diff: number) => void;
  onOpenTestMode: () => void;
  onOpenAnimationTester: () => void;
  onOpenPlan: () => void;
  onOpenResetProgress: () => void;
}

export const SettingsDevModal: React.FC<SettingsDevModalProps> = ({
  isOpen,
  onClose,
  performanceMode,
  performanceProfile,
  onChangePerformanceProfile,
  onTogglePerformanceMode,
  showPerfOverlay,
  onToggleShowPerfOverlay,
  dynamicLightingEnabled = true,
  onToggleDynamicLighting,
  dynamicDifficulty = 3.0,
  onChangeDynamicDifficulty,
  onOpenTestMode,
  onOpenAnimationTester,
  onOpenPlan,
  onOpenResetProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 45 }} onClick={onClose}>
      <div
        className="panel"
        style={{
          maxWidth: '740px',
          width: '95%',
          maxHeight: '90vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LadaCardCorners variant="callout" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '1.8rem', color: 'var(--ink)' }}>
              ⚙️ NASTAVENÍ A VÝVOJ
            </h2>
            <LadaBotanicalFlourish height={16} />
          </div>
          <button
            className="tab-btn"
            style={{ padding: '6px 12px', fontSize: '1.15rem', minWidth: 'auto' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '10px',
            paddingRight: '4px',
          }}
        >
          {/* SEKCE 1: EFEKTY, PLYNULOST A VÝKON */}
          <div
            style={{
              background: 'var(--parchmentDark)',
              border: '2px solid var(--ink)',
              borderRadius: '10px',
              padding: '14px 18px',
              textAlign: 'left',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--ink)' }}>
              ⚡ Zapnuté efekty a plynulost
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700, color: '#451A03' }}>
              Vyberte poměr mezi vizuálními efekty scény a snímkovou frekvencí (FPS).
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontWeight: 900, fontSize: '0.88rem', color: '#78350F', flexWrap: 'wrap' }}>
              <span>🎨 Vizuální kvalita</span>
              <span>⚖️ Vyvážený</span>
              <span>⚡ Max FPS</span>
            </div>

            <input
              aria-label="Nastavení vizuálních efektů a plynulosti"
              type="range"
              min={0}
              max={2}
              step={1}
              value={({ fidelity: 0, balanced: 1, performance: 2 } as const)[performanceProfile]}
              onChange={(event) => {
                const profiles = ['fidelity', 'balanced', 'performance'] as const;
                const next = profiles[Number(event.target.value)] ?? 'balanced';
                sound.coin();
                onChangePerformanceProfile(next);
              }}
              style={{ width: '100%', accentColor: '#B45309', cursor: 'pointer', margin: '10px 0 6px' }}
            />

            <div style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 900, color: '#92400E', marginBottom: '4px' }}>
              {performanceProfile === 'fidelity' ? '🎨 Vizuální kvalita (plné efekty)' : performanceProfile === 'performance' ? '⚡ Maximum FPS (plynulost)' : '⚖️ Vyvážený režim (doporučeno)'}
            </div>

            <p style={{ margin: '4px 0 12px', fontSize: '0.84rem', fontWeight: 700, color: '#451A03', lineHeight: 1.35 }}>
              {performanceProfile === 'fidelity'
                ? 'Plné kvašové světelné efekty a částice. Vhodné pro silnější zařízení a stolní počítače.'
                : performanceProfile === 'performance'
                  ? 'Omezuje náročné světelné efekty a strop částic pro co nejplynulejší chod (60 FPS) i na slabých telefonech.'
                  : 'Zachovává ladovskou atmosféru a mírně tlumí zátěž při masivních vlnách nepřátel.'}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #B45309' }}>
              <button
                className="lada-btn btn-small"
                style={{
                  background: performanceMode ? '#16A34A' : 'var(--wood-dark)',
                  color: '#FFFFFF',
                }}
                onClick={() => {
                  sound.coin();
                  onTogglePerformanceMode(!performanceMode);
                }}
              >
                Plynulý režim (strop 60 FPS): {performanceMode ? 'ZAP' : 'VYP'}
              </button>

              <button
                className="lada-btn btn-small"
                style={{
                  background: showPerfOverlay ? '#16A34A' : 'var(--wood-dark)',
                  color: '#FFFFFF',
                }}
                onClick={() => {
                  sound.coin();
                  onToggleShowPerfOverlay(!showPerfOverlay);
                }}
              >
                Ukazatel FPS na obrazovce: {showPerfOverlay ? 'ZAP' : 'VYP'}
              </button>

              {onToggleDynamicLighting && (
                <button
                  className="lada-btn btn-small"
                  style={{
                    background: dynamicLightingEnabled ? '#16A34A' : 'var(--wood-dark)',
                    color: '#FFFFFF',
                  }}
                  onClick={() => {
                    sound.coin();
                    onToggleDynamicLighting(!dynamicLightingEnabled);
                  }}
                >
                  Dynamické osvětlení: {dynamicLightingEnabled ? 'ZAP' : 'VYP'}
                </button>
              )}
            </div>
          </div>

          {/* DYNAMICKÁ OBTÍŽNOST */}
          {onChangeDynamicDifficulty && (
            <div
              style={{
                background: 'var(--parchmentDark)',
                border: '2px solid var(--ink)',
                borderRadius: '10px',
                padding: '14px 18px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--ink)' }}>
                  🔥 Dynamická obtížnost (Režisér výpravy)
                </h3>
                {(() => {
                  const activePreset = getDifficultyPreset(dynamicDifficulty);
                  return (
                    <span
                      style={{
                        background: activePreset.color,
                        color: '#FFFFFF',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        border: '1.5px solid var(--ink)',
                      }}
                    >
                      {activePreset.badge}
                    </span>
                  );
                })()}
              </div>

              <input
                aria-label="Nastavení dynamické obtížnosti"
                type="range"
                min="2.0"
                max="5.0"
                step="0.5"
                value={dynamicDifficulty}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  sound.coin();
                  onChangeDynamicDifficulty(val);
                }}
                style={{ width: '100%', accentColor: '#92400E', cursor: 'pointer', height: '8px', margin: '8px 0 4px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 800, color: '#78350F', flexWrap: 'wrap', gap: '4px' }}>
                {DYNAMIC_DIFFICULTY_PRESETS.map((preset) => (
                  <span
                    key={preset.value}
                    style={{
                      cursor: 'pointer',
                      color: Math.abs(dynamicDifficulty - preset.value) < 0.24 ? '#9A3412' : '#78350F',
                      fontWeight: Math.abs(dynamicDifficulty - preset.value) < 0.24 ? 900 : 700,
                      textDecoration: Math.abs(dynamicDifficulty - preset.value) < 0.24 ? 'underline' : 'none',
                    }}
                    onClick={() => {
                      sound.coin();
                      onChangeDynamicDifficulty(preset.value);
                    }}
                  >
                    {preset.shortLabel}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SEKCE 2: VÝVOJÁŘSKÉ A TESTOVACÍ NÁSTROJE */}
          <div
            style={{
              background: 'var(--parchmentDark)',
              border: '2px solid var(--ink)',
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'left',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: 'var(--ink)' }}>
              🛠️ Vývojářská dílna
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="lada-btn btn-small"
                style={{ background: '#7C3AED', color: '#FFFFFF', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  onClose();
                  onOpenTestMode();
                }}
              >
                🧪 Testovací mód (Sandbox)
              </button>

              <button
                className="lada-btn btn-small"
                style={{ background: '#0284C7', color: '#FFFFFF', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  onClose();
                  onOpenAnimationTester();
                }}
              >
                🎬 Tester animací
              </button>

              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--wood-light)', color: 'var(--parchment)' }}
                onClick={() => {
                  sound.coin();
                  onClose();
                  onOpenPlan();
                }}
              >
                📜 Kronika verzí a plán
              </button>
            </div>
          </div>

          {/* SEKCE 3: SPRÁVA ULOŽENÉ HRY */}
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              border: '2px dashed #DC2626',
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'left',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#991B1B' }}>
              ⚠️ Správa postupu
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: 'var(--ink)', fontWeight: 700 }}>
              Vymazání vrátí veškeré odemčené postavy, zbraně i vylepšení ve vsi do výchozího stavu.
            </p>
            <button
              className="lada-btn btn-small"
              style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 900 }}
              onClick={() => {
                sound.hit();
                onClose();
                onOpenResetProgress();
              }}
            >
              🗑️ Vymazat veškerý postup
            </button>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            className="lada-btn"
            style={{ padding: '8px 24px' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
