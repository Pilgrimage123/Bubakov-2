import React from 'react';
import { sound } from '../audio';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { GameIcon } from './GameIcon';
import {
  COMBAT_TEXT_CATEGORIES,
  CombatTextCategory,
  CombatTextSettings,
  getCombatTextPreset,
  getSettingsForPreset,
} from '../game/combatTextSettings';

interface CombatTextSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CombatTextSettings;
  onChangeSettings: (nextSettings: CombatTextSettings) => void;
}

export const CombatTextSettingsModal: React.FC<CombatTextSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  if (!isOpen) return null;

  const currentPreset = getCombatTextPreset(settings);

  const handleToggle = (key: CombatTextCategory) => {
    sound.coin();
    onChangeSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleApplyPreset = (preset: 'full' | 'tactical' | 'performance') => {
    sound.coin();
    onChangeSettings(getSettingsForPreset(preset));
  };

  return (
    <div
      className="overlay"
      style={{ zIndex: 55, background: 'rgba(20, 15, 10, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '92vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '24px 28px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LadaCardCorners variant="callout" />

        {/* Hlavička modalu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '1.75rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GameIcon icon="combat_text" size={26} /> BOJOVÉ TEXTY A VAROVÁNÍ
            </h2>
            <LadaBotanicalFlourish height={16} />
          </div>
          <button
            className="tab-btn"
            style={{ padding: '6px 12px', fontSize: '1.15rem', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
            title="Zavřít okno"
          >
            <GameIcon icon="cross" size={16} />
          </button>
        </div>

        <p
          style={{
            margin: '8px 0 14px',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#451A03',
            lineHeight: 1.4,
          }}
        >
          Přizpůsobte si zobrazení čísel, textů i varovných bannerů pro maximální snímkovou frekvenci (FPS) a nerušený přehled v boji.
        </p>

        {/* Sekce rychlých předvoleb */}
        <div
          style={{
            background: 'var(--parchmentDark)',
            border: '2px solid var(--ink)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '0.92rem', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <GameIcon icon="lightning" size={16} /> Rychlé předvolby:
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1.5px solid var(--ink)',
                background:
                  currentPreset === 'full'
                    ? '#15803D'
                    : currentPreset === 'tactical'
                    ? '#B45309'
                    : currentPreset === 'performance'
                    ? '#DC2626'
                    : 'var(--wood-dark)',
                color: '#FFFFFF',
              }}
            >
              {currentPreset === 'full' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="palette" size={14} /> Plná atmosféra
                </span>
              )}
              {currentPreset === 'tactical' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="scales" size={14} /> Taktický režim
                </span>
              )}
              {currentPreset === 'performance' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="lightning" size={14} /> Čistý výkon
                </span>
              )}
              {currentPreset === 'custom' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="cog" size={14} /> Vlastní výběr
                </span>
              )}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="lada-btn btn-small"
              style={{
                background: currentPreset === 'full' ? '#15803D' : 'var(--wood-light)',
                color: '#FFFFFF',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => handleApplyPreset('full')}
              title="Zapne všech 12 kategorií textů i varování pro plný zážitek"
            >
              <GameIcon icon="palette" size={16} /> Plná atmosféra (vše ZAP)
            </button>

            <button
              className="lada-btn btn-small"
              style={{
                background: currentPreset === 'tactical' ? '#B45309' : 'var(--wood-light)',
                color: '#FFFFFF',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => handleApplyPreset('tactical')}
              title="Ponechá čísla, bojové stavy a varování bossů, vypne nápřahy, pokřiky a suroviny"
            >
              <GameIcon icon="scales" size={16} /> Taktický režim (pouze fakta)
            </button>

            <button
              className="lada-btn btn-small"
              style={{
                background: currentPreset === 'performance' ? '#DC2626' : 'var(--wood-light)',
                color: '#FFFFFF',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => handleApplyPreset('performance')}
              title="Vypne všechny texty, varovné bannery i telegrafy v aréně pro maximální FPS"
            >
              <GameIcon icon="lightning" size={16} /> Čistý výkon (vše VYP)
            </button>
          </div>
        </div>

        {/* Seznam 9 zaškrtávacích kategorií */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '6px',
          }}
        >
          {COMBAT_TEXT_CATEGORIES.map((cat) => {
            const isEnabled = !!settings[cat.key];
            return (
              <div
                key={cat.key}
                onClick={() => handleToggle(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: isEnabled ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.04)',
                  border: isEnabled ? '2px solid var(--ink)' : '2px dashed rgba(45, 22, 9, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {}} // handled by parent onClick
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#B45309',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  aria-label={cat.label}
                />

                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{cat.icon}</span>

                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: '0.98rem',
                      color: isEnabled ? 'var(--ink)' : '#78716C',
                    }}
                  >
                    {cat.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: isEnabled ? '#573318' : '#A8A29E',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      marginTop: '2px',
                    }}
                  >
                    {cat.description}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--ink)',
                    background: isEnabled ? '#15803D' : '#78716C',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  {isEnabled ? 'ZAP' : 'VYP'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spodní akční tlačítko */}
        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <button
            className="lada-btn"
            style={{ padding: '8px 30px', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            Hotovo <GameIcon icon="sword" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
