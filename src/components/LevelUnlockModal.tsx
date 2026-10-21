import React from 'react';
import { sound } from '../audio';
import { LEVEL_UNLOCKS } from '../data/levelUnlocks';
import { GAME_LEVELS } from '../data/levels';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { GameIcon } from './GameIcon';
import type { GameLevelId, LevelProgress } from '../types';

export interface LevelUnlockModalProps {
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

  const lvlId = progress.id as GameLevelId;
  const def = LEVEL_UNLOCKS[lvlId];
  const lvl = GAME_LEVELS[lvlId];

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
      desc: `Cesta do ${def?.realName || lvl?.name || 'této oblasti'} je plně probádána a přístupna pro všechny vaše hrdiny a výpravy!`,
      boss: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledBossHint || '',
      weather: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledWeatherHint || '',
      reached: progress.isUnlocked || progress.percent >= 100,
    },
  ];

  return (
    <div className="overlay" style={{ zIndex: 45 }} onClick={onClose}>
      <div
        className="panel"
        style={{
          maxWidth: '720px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
          padding: '20px 22px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              className={`hunter-tier-stamp tier-stamp-${progress.tier}`}
              style={{ fontSize: '0.84rem' }}
            >
              {progress.clueTag}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <GameIcon icon={progress.spoiledIcon} size={36} />
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  color: '#8B1E0F',
                  fontFamily: "'Eczar', serif",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '0.5px',
                  textShadow: '1px 1px 0 rgba(255, 255, 255, 0.8)',
                }}
              >
                {progress.spoiledName}
              </h2>
            </div>

            <div
              style={{
                fontWeight: 800,
                color: '#3D2210',
                fontSize: '0.98rem',
                marginTop: '4px',
                lineHeight: 1.3,
                fontFamily: "'Eczar', serif",
              }}
            >
              {progress.spoiledSubtitle}
            </div>

            <LadaBotanicalFlourish height={16} />
          </div>

          <button
            className="tab-btn"
            style={{ padding: '6px 12px', fontSize: '1.2rem', minWidth: 'auto' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
            aria-label="Zavřít"
          >
            <GameIcon icon="cross" size={16} />
          </button>
        </div>

        {/* QUEUED NOTIFICATION BANNER */}
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <GameIcon icon="padlock" size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#92400E', fontSize: '1.05rem' }}>
                Výprava do této úrovně je zatím uzamčena!
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350F', marginTop: '2px' }}>
                Nová úroveň se začne odemykat teprve poté, co prozkoumáte a pokoříte předchozí úroveň:{' '}
                <strong>{progress.requiredLevelName}</strong>.
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B45309', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <GameIcon icon="scroll" size={14} /> Cesta se odemyká postupně zdoláváním hlavních bossů předchozích výprav.
              </div>
            </div>
          </div>
        )}

        {/* POPIS STAGE, BOSS A KLÍČOVÁ HAVĚŤ (PŘESUNUTO Z HLAVNÍCH KARET ÚROVNÍ) */}
        <div
          style={{
            background: '#FFFDF7',
            border: '2.5px solid var(--ink)',
            borderRadius: '10px',
            padding: '14px 16px',
            margin: '12px 0',
            boxShadow: '3px 3px 0 var(--ink)',
          }}
        >
          {/* Popis výpravy */}
          <div
            style={{
              fontSize: '0.94rem',
              lineHeight: 1.45,
              color: '#1F1610',
              fontWeight: 600,
            }}
          >
            {progress.spoiledDesc || lvl?.description}
          </div>

          {/* Folklórní kronika / lore (je-li odhaleno) */}
          {lvl?.lore && (progress.isUnlocked || progress.tier >= 2) && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '0.88rem',
                fontStyle: 'italic',
                color: '#5C3D2E',
                borderLeft: '3px solid #D97706',
                paddingLeft: '10px',
                lineHeight: 1.38,
              }}
            >
              „{lvl.lore}“
            </div>
          )}

          {/* Hlavní boss preview box */}
          <div
            className="level-boss-pill"
            style={{
              marginTop: '12px',
              marginBottom: '10px',
              fontSize: '0.9rem',
              fontWeight: 800,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <GameIcon icon="crown" size={16} />
            <span>
              {progress.spoiledBossHint
                ? progress.spoiledBossHint.replace(/👑\s*/g, '')
                : (lvl?.finalBoss
                  ? `Hlavní boss: ${lvl.finalBoss.name} (${lvl.finalBoss.time} s)`
                  : 'Hlavní boss: ???')}
            </span>
          </div>

          {/* Klíčová havěť a běsi */}
          <div style={{ marginTop: '8px' }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 900,
                color: '#3D2210',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              Havěť a běsi v této výpravě:
            </div>
            <div className="level-enemies-preview" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {progress.isUnlocked || progress.tier === 4 ? (
                lvl?.keyEnemies?.map((e) => (
                  <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GameIcon icon={e.icon} size={15} /> {e.name}
                  </span>
                ))
              ) : progress.tier === 3 ? (
                <>
                  {lvl?.keyEnemies?.slice(0, 4).map((e) => (
                    <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon={e.icon} size={15} /> {e.name}
                    </span>
                  ))}
                  <span className="level-enemy-tag" style={{ opacity: 0.7, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="question" size={13} /> ???</span>
                </>
              ) : progress.tier === 2 ? (
                <>
                  {lvl?.keyEnemies?.slice(0, 3).map((e) => (
                    <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon={e.icon} size={15} /> {e.name}
                    </span>
                  ))}
                  <span className="level-enemy-tag" style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="question" size={13} /> ???</span>
                  <span className="level-enemy-tag" style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="question" size={13} /> ???</span>
                </>
              ) : progress.tier === 1 ? (
                <>
                  {lvl?.keyEnemies?.slice(0, 1).map((e) => (
                    <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon={e.icon} size={15} /> {e.name}
                    </span>
                  ))}
                  <span className="level-enemy-tag" style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="wind" size={13} /> Zahaleno v mlze</span>
                  <span className="level-enemy-tag" style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="question" size={13} /> ???</span>
                </>
              ) : (
                <>
                  <span className="level-enemy-tag" style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="padlock" size={13} /> Neznámé bytosti</span>
                  <span className="level-enemy-tag" style={{ opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="question" size={13} /> Skryto v mlze</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CHALENGE & POSTUP PRŮZKUMU */}
        <div
          style={{
            background: 'var(--parchmentDark)',
            border: '3px solid var(--ink)',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '8px 0 12px 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111111', fontWeight: 900, fontFamily: "'Eczar', serif" }}>
              {def?.challengeTitle}
            </h3>
            <span
              style={{
                background: progress.isUnlocked ? 'var(--leaf-green)' : progress.isQueued ? 'var(--wood-dark)' : '#2A170A',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {progress.isUnlocked ? (
                <>
                  <GameIcon icon="checkmark" size={12} /> OTEVŘENO
                </>
              ) : progress.isQueued ? (
                <>
                  <GameIcon icon="padlock" size={12} /> ČEKÁ NA PŘEDCHOZÍ ÚROVEŇ
                </>
              ) : (
                `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`
              )}
            </span>
          </div>

          <p
            style={{
              margin: '6px 0 10px 0',
              fontSize: '0.92rem',
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#111111',
            }}
          >
            {def?.challengeLongDesc}
          </p>

          {!progress.isUnlocked && def?.bossDefeatRequirement && (
            <div
              style={{
                background: 'rgba(217, 119, 6, 0.15)',
                border: '1.5px dashed #D97706',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#78350F',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <GameIcon icon="lightning" size={14} />
              <span>
                <strong>Královská zkratka:</strong> {def.bossDefeatRequirement} odemkne tuto úroveň okamžitě na 100 %!
              </span>
            </div>
          )}

          <div className="hunter-progress-bar-outer" style={{ height: '18px' }}>
            <div
              className="hunter-progress-bar-fill"
              style={{
                width: `${progress.percent}%`,
                background: progress.isUnlocked ? 'linear-gradient(90deg, #10B981, #059669)' : undefined,
              }}
            />
          </div>

          <div className="hunter-progress-ticks" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
            <span className={`hunter-tick ${progress.percent >= 0 ? 'reached' : ''}`}>0%</span>
            <span className={`hunter-tick ${progress.percent >= 25 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {progress.percent >= 25 ? <GameIcon icon="checkmark" size={10} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 25%
            </span>
            <span className={`hunter-tick ${progress.percent >= 50 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {progress.percent >= 50 ? <GameIcon icon="checkmark" size={10} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 50%
            </span>
            <span className={`hunter-tick ${progress.percent >= 75 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {progress.percent >= 75 ? <GameIcon icon="checkmark" size={10} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 75%
            </span>
            <span className={`hunter-tick ${progress.percent >= 100 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {progress.percent >= 100 ? <GameIcon icon="checkmark" size={10} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 100%
            </span>
          </div>

          {progress.enemiesBreakdown && progress.enemiesBreakdown.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: '#111111',
                  marginBottom: '4px',
                }}
              >
                Zahnáno přízraků na stezce k této úrovni:
              </div>
              <div className="hunter-enemy-pills">
                {progress.enemiesBreakdown.map((e: any) => (
                  <div key={e.id} className="hunter-enemy-pill" style={{ padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GameIcon icon={e.icon} size={15} />
                    <span>{e.name}:</span>
                    <strong style={{ color: '#111111' }}>{e.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* POSTUPNÉ ODHALOVÁNÍ TAJEMSTVÍ KRAJINY */}
        <h4
          style={{
            margin: '14px 0 8px 0',
            fontSize: '1.15rem',
            color: '#2A170A',
            fontWeight: 900,
            fontFamily: "'Eczar', serif",
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <GameIcon icon="map" size={18} /> Postupné odhalování tajemství krajiny (25 %, 50 % a 75 %):
        </h4>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <strong
                  style={{
                    fontSize: '0.9rem',
                    color: m.reached ? '#065F46' : '#2A170A',
                    minWidth: 0,
                    overflowWrap: 'break-word',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <GameIcon icon={m.reached ? 'checkmark' : 'padlock'} size={13} /> {m.title}
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: m.reached ? '#065F46' : '#78350F',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.reached ? 'ODHALENO' : `Vyžaduje ${m.pct} %`}
                </span>
              </div>

              <p
                style={{
                  margin: '4px 0 2px 0',
                  fontSize: '0.86rem',
                  lineHeight: 1.3,
                  color: '#111111',
                  fontWeight: 600,
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
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

        {/* BOTTOM ACTION BUTTONS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          {progress.isUnlocked && onSelectIfUnlocked && (
            <button
              className="lada-btn"
              style={{
                background: 'var(--leaf-green)',
                color: '#FFFFFF',
                padding: '10px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                onClose();
                onSelectIfUnlocked(progress.id);
              }}
            >
              Zvolit tuto úroveň a vyrazit <GameIcon icon="map" size={16} />
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
