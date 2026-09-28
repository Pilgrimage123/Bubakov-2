import React from 'react';
import { GameLevelId } from '../types';
import { LevelProgress, LEVEL_UNLOCKS } from '../data/levelUnlocks';
import { sound } from '../audio';

interface LevelUnlockModalProps {
  progress: LevelProgress | null;
  onClose: () => void;
  onSelectIfUnlocked?: (id: GameLevelId) => void;
}

export const LevelUnlockModal: React.FC<LevelUnlockModalProps> = ({
  progress,
  onClose,
  onSelectIfUnlocked,
}) => {
  if (!progress) return null;

  const def = LEVEL_UNLOCKS[progress.id];

  const milestonesList = [
    {
      pct: 25,
      tier: 1,
      title: '25 % – První stopa, mlha a obrysy krajiny',
      desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledDesc || '',
      boss: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledBossHint || '',
      weather: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledWeatherHint || '',
      reached: progress.percent >= 25,
    },
    {
      pct: 50,
      tier: 2,
      title: '50 % – Zřetelná stezka, počasí a první běsi',
      desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledDesc || '',
      boss: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledBossHint || '',
      weather: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledWeatherHint || '',
      reached: progress.percent >= 50,
    },
    {
      pct: 75,
      tier: 3,
      title: '75 % – Téměř plné barvy a odhalení hlavního bosse',
      desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledDesc || '',
      boss: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledBossHint || '',
      weather: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledWeatherHint || '',
      reached: progress.percent >= 75,
    },
    {
      pct: 100,
      tier: 4,
      title: '100 % – Otevřená brána a neomezený přístup',
      desc: `Cesta do ${def?.realName || ''} je plně probádána a přístupna pro všechny vaše hrdiny a výpravy!`,
      boss: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledBossHint || '',
      weather: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledWeatherHint || '',
      reached: progress.isUnlocked || progress.percent >= 100,
    },
  ];

  return (
    <div className="overlay" style={{ zIndex: 45 }} onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: '700px', width: '95%', textAlign: 'left' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              className={`hunter-tier-stamp tier-stamp-${progress.tier}`}
              style={{ fontSize: '0.85rem' }}
            >
              {progress.clueTag}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '2.2rem' }}>{progress.spoiledIcon}</span>
              <h2 style={{ margin: '0', fontSize: '1.85rem', color: '#FEF3C7', textShadow: '2px 2px 0 var(--ink)' }}>
                {progress.spoiledName}
              </h2>
            </div>
            <div style={{ fontWeight: 900, color: '#FEF3C7', fontSize: '1.05rem', marginTop: '2px' }}>
              {progress.spoiledSubtitle}
            </div>
          </div>
          <button
            className="tab-btn"
            style={{ padding: '6px 12px', fontSize: '1.2rem', minWidth: 'auto' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {/* Queued Warning Notice */}
        {progress.isQueued && (
          <div
            style={{
              background: '#FFFBEB',
              border: '3px solid #D97706',
              borderRadius: '10px',
              padding: '12px 16px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '2rem' }}>🔒</div>
            <div>
              <div style={{ fontWeight: 900, color: '#92400E', fontSize: '1.05rem' }}>
                Výprava do této úrovně je zatím uzamčena!
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350F', marginTop: '2px' }}>
                Nová úroveň se nikdy nezačne odemykat, dokud není pokořena předchozí úroveň.
                Nejprve musíte zvládnout úroveň: <strong>{progress.requiredLevelName}</strong>.
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>
                📜 Pořadí odemykání úrovní: 1. Náves a rybník ➔ 2. Starý hřbitov a hvozd ➔ 3. Ladovská zima na Melechově
              </div>
            </div>
          </div>
        )}

        {/* Challenge Goal Box */}
        <div
          style={{
            background: 'var(--parchmentDark)',
            border: '3px solid var(--ink)',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '14px 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.22rem', color: '#111111' }}>
              {def?.challengeTitle}
            </h3>
            <span
              style={{
                background: progress.isUnlocked
                  ? 'var(--leaf-green)'
                  : progress.isQueued
                  ? 'var(--wood-dark)'
                  : '#2A170A',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid var(--ink)',
              }}
            >
              {progress.isUnlocked
                ? '✅ OTEVŘENO'
                : progress.isQueued
                ? `🔒 ČEKÁ NA PŘEDCHOZÍ ÚROVEŇ`
                : `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`}
            </span>
          </div>

          <p style={{ margin: '6px 0 10px 0', fontSize: '0.94rem', fontWeight: 700, lineHeight: 1.35, color: '#111111' }}>
            {def?.challengeLongDesc}
          </p>

          {/* Alternative boss shortcut info */}
          {!progress.isUnlocked && def?.bossDefeatRequirement && (
            <div
              style={{
                background: 'rgba(217, 119, 6, 0.15)',
                border: '1.5px dashed #D97706',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                color: '#78350F',
                marginBottom: '10px',
              }}
            >
              ⚡ <strong>Královská zkratka:</strong> {def.bossDefeatRequirement} odemkne tuto úroveň okamžitě na 100 %!
            </div>
          )}

          {/* Progress bar */}
          <div className="hunter-progress-bar-outer" style={{ height: '18px' }}>
            <div
              className="hunter-progress-bar-fill"
              style={{
                width: `${progress.percent}%`,
                background: progress.isUnlocked
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : undefined,
              }}
            />
          </div>
          <div className="hunter-progress-ticks" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
            <span className={`hunter-tick ${progress.percent >= 0 ? 'reached' : ''}`}>0%</span>
            <span className={`hunter-tick ${progress.percent >= 25 ? 'reached' : ''}`}>
              {progress.percent >= 25 ? '✓' : '🔒'} 25%
            </span>
            <span className={`hunter-tick ${progress.percent >= 50 ? 'reached' : ''}`}>
              {progress.percent >= 50 ? '✓' : '🔒'} 50%
            </span>
            <span className={`hunter-tick ${progress.percent >= 75 ? 'reached' : ''}`}>
              {progress.percent >= 75 ? '✓' : '🔒'} 75%
            </span>
            <span className={`hunter-tick ${progress.percent >= 100 ? 'reached' : ''}`}>
              {progress.percent >= 100 ? '✓' : '🔒'} 100%
            </span>
          </div>

          {/* Targeted enemies counters */}
          {progress.enemiesBreakdown.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#111111', marginBottom: '4px' }}>
                Zahnáno přízraků na stezce k této úrovni:
              </div>
              <div className="hunter-enemy-pills">
                {progress.enemiesBreakdown.map((e) => (
                  <div key={e.id} className="hunter-enemy-pill" style={{ padding: '3px 8px' }}>
                    <span>{e.icon}</span>
                    <span>{e.name}:</span>
                    <strong style={{ color: '#111111' }}>{e.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progressive Spoil Milestones */}
        <h4 style={{ margin: '14px 0 8px 0', fontSize: '1.15rem', color: '#FEF3C7' }}>
          🗺️ Postupné odhalování tajemství krajiny (25 %, 50 % a 75 %):
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '230px', overflowY: 'auto' }}>
          {milestonesList.map((m) => (
            <div
              key={m.pct}
              style={{
                background: m.reached ? '#FAF5E8' : '#EDE4D1',
                border: m.reached ? '2.5px solid var(--leaf-green)' : '2px solid #3D2210',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#111111',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: m.reached ? '#065F46' : '#2A170A' }}>
                  {m.reached ? '✅' : '🔒'} {m.title}
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: m.reached ? '#065F46' : '#78350F',
                  }}
                >
                  {m.reached ? 'ODHALENO' : `Vyžaduje ${m.pct} %`}
                </span>
              </div>
              <p style={{ margin: '4px 0 2px 0', fontSize: '0.86rem', lineHeight: 1.3, color: '#111111', fontWeight: 600 }}>
                {m.reached ? m.desc : 'Podrobnosti o krajině a počasí se odhalí po splnění tohoto milníku.'}
              </p>
              {m.reached && m.boss && (
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#7F1D1D', marginTop: '2px' }}>
                  {m.boss}
                </div>
              )}
              {m.reached && m.weather && (
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E40AF', marginTop: '1px' }}>
                  {m.weather}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          {progress.isUnlocked && onSelectIfUnlocked && (
            <button
              className="lada-btn"
              style={{ background: 'var(--leaf-green)', color: '#FFFFFF', padding: '10px 24px' }}
              onClick={() => {
                onClose();
                onSelectIfUnlocked(progress.id);
              }}
            >
              Zvolit tuto úroveň a vyrazit 🗺️
            </button>
          )}
          <button
            className="lada-btn"
            style={{ padding: '10px 20px' }}
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
