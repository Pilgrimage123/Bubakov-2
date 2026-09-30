import React from 'react';
import { WeaponProgress, WEAPON_UNLOCKS } from '../data/weaponUnlocks';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';

interface WeaponUnlockModalProps {
  progress: WeaponProgress | null;
  onClose: () => void;
}

export const WeaponUnlockModal: React.FC<WeaponUnlockModalProps> = ({ progress, onClose }) => {
  if (!progress) return null;

  const def = WEAPON_UNLOCKS[progress.id];

  const milestonesList = [
    {
      pct: 25,
      tier: 1,
      title: '25 % – První stopa a tvar zbraně',
      desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledStatsHint || '',
      reached: progress.percent >= 25,
    },
    {
      pct: 50,
      tier: 2,
      title: '50 % – Skica a odhalení mechaniky útoku',
      desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledStatsHint || '',
      reached: progress.percent >= 50,
    },
    {
      pct: 75,
      tier: 3,
      title: '75 % – Téměř ukováno a přesná síla',
      desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledStatsHint || '',
      reached: progress.percent >= 75,
    },
    {
      pct: 100,
      tier: 4,
      title: '100 % – Plné odemčení do arzenálu',
      desc: `Zbraň ${def?.realName || ''} se trvale přidá k výběru vylepšení při postupu na novou úroveň!`,
      stats: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledStatsHint || '',
      reached: progress.isUnlocked || progress.percent >= 100,
    },
  ];

  return (
    <div className="overlay" style={{ zIndex: 50 }} onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: '660px', width: '95%', textAlign: 'left' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: progress.isUnlocked
                  ? 'var(--mustard)'
                  : progress.tier === 0
                  ? '#1A1510'
                  : progress.tier === 1
                  ? '#3A2818'
                  : progress.tier === 2
                  ? '#785A35'
                  : '#D9A036',
                border: '3px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: progress.tier === 0 ? '2.2rem' : '2.4rem',
                boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), 3px 3px 0 var(--ink)',
                filter: progress.tier === 0 ? 'grayscale(1) brightness(0.4)' : progress.tier === 1 ? 'contrast(150%) brightness(0.6)' : 'none',
              }}
            >
              <GameIcon icon={progress.tier === 0 ? '❓' : progress.realIcon} size={progress.id === 'buns' ? 52 : '2.4rem'} />
            </div>
            <div>
              <span
                className={`hunter-tier-stamp tier-stamp-${progress.tier}`}
                style={{ fontSize: '0.8rem' }}
              >
                {progress.clueTag}
              </span>
              <h2 style={{ margin: '2px 0 1px 0', fontSize: '1.75rem', color: '#FEF3C7', textShadow: '2px 2px 0 var(--ink)' }}>
                {progress.spoiledName}
              </h2>
              <div style={{ fontWeight: 900, color: '#FEF3C7', fontSize: '0.98rem' }}>
                {progress.spoiledTitle}
              </div>
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
                Výzva k ukování je zatím uzamčena!
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350F', marginTop: '2px' }}>
                Nová zbraň se nikdy nezačne odemykat, dokud není odemčena zbraň před ní.
                Kovář začne tuto zbraň kalit teprve po odemčení zbraně: <strong>{progress.requiredWeaponName}</strong>.
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>
                🔨 Pořadí kovářské dílny: Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda
              </div>
            </div>
          </div>
        )}

        {/* Buchta illustration showcase when viewing buns */}
        {progress.id === 'buns' && (
          <div
            style={{
              background: '#FFFBEB',
              border: '3px solid #B45309',
              borderRadius: '10px',
              padding: '12px 16px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '3px 3px 0 var(--ink)',
            }}
          >
            <div style={{ flexShrink: 0, width: '96px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CzechBuchtaIcon size={84} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#78350F', fontSize: '1.08rem' }}>
                Tradiční česká pečená buchta s povidly
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400E', marginTop: '2px', lineHeight: 1.35 }}>
                Zlatavá kynutá buchta upečená v pekáči do křupava, poprášená jemným moučkovým cukrem a plněná lahodným švestkovým povidlem.
              </div>
            </div>
          </div>
        )}

        {/* Challenge Box */}
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
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111111' }}>
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
                fontSize: '0.82rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid var(--ink)',
              }}
            >
              {progress.isUnlocked
                ? '✅ ODEMČENO'
                : progress.isQueued
                ? `🔒 ČEKÁ NA: ${progress.requiredWeaponName?.toUpperCase()}`
                : `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`}
            </span>
          </div>
          <p style={{ margin: '6px 0 10px 0', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.35, color: '#111111' }}>
            {def?.challengeLongDesc}
          </p>

          {/* Progress bar */}
          <div className="hunter-progress-bar-outer" style={{ height: '16px' }}>
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
          <div className="hunter-progress-ticks" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
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
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#111111', marginBottom: '4px' }}>
                Zahnáni vybraní nepřátelé pro tuto zbraň:
              </div>
              <div className="hunter-enemy-pills">
                {progress.enemiesBreakdown.map((e) => (
                  <div key={e.id} className="hunter-enemy-pill" style={{ padding: '3px 7px' }}>
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
        <h4 style={{ margin: '12px 0 6px 0', fontSize: '1.1rem', color: '#FEF3C7' }}>
          🕵️ Postupné odhalování zbraně (25 %, 50 % a 75 %):
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
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
                <strong style={{ fontSize: '0.88rem', color: m.reached ? '#065F46' : '#2A170A' }}>
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
              <p style={{ margin: '4px 0 2px 0', fontSize: '0.85rem', lineHeight: 1.3, color: '#111111', fontWeight: 600 }}>
                {m.reached ? m.desc : 'Tato stopa a vlastnost se odhalí po dosažení tohoto milníku.'}
              </p>
              {m.reached && m.stats && (
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#2A170A', marginTop: '2px' }}>
                  ⚡ {m.stats}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            className="lada-btn"
            style={{ padding: '8px 22px' }}
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
