import React, { useState } from 'react';
import { MetaProgression } from '../types';
import { WEAPONS } from '../data/weapons';
import { getWeaponProgress, WeaponProgress } from '../data/weaponUnlocks';
import { sound } from '../audio';

interface ArsenalModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: MetaProgression;
  onInspectWeapon: (prog: WeaponProgress) => void;
}

export const ArsenalModal: React.FC<ArsenalModalProps> = ({
  isOpen,
  onClose,
  meta,
  onInspectWeapon,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const weaponKeys = Object.keys(WEAPONS);
  const progresses = weaponKeys.map((key) => getWeaponProgress(key, meta));

  const unlockedCount = progresses.filter((p) => p.isUnlocked).length;
  const totalCount = progresses.length;

  const filtered = progresses.filter((p) => {
    if (filter === 'unlocked') return p.isUnlocked;
    if (filter === 'locked') return !p.isUnlocked;
    return true;
  });

  return (
    <div className="overlay" style={{ zIndex: 40 }} onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: '1020px', width: '95%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.9rem', color: '#FEF3C7', textShadow: '2px 2px 0 var(--ink)' }}>
              🗡️ Zbrojnice & Arzenál Bubákova
            </h2>
            <p style={{ fontWeight: 800, margin: 0, color: '#FEF3C7', fontSize: '0.96rem' }}>
              Zbraně se odemykají postupně jedna po druhé v kovářské dílně – nová zbraň se začne odemykat teprve po odemčení zbraně předchozí!
            </p>
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

        {/* Status bar & Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            margin: '14px 0 10px 0',
            background: 'var(--parchmentDark)',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '2px solid var(--ink)',
          }}
        >
          <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#111111' }}>
            📊 Stav zbrojnice: <span style={{ color: '#111111', fontWeight: 900 }}>{unlockedCount} / {totalCount}</span> zbraní odemčeno ({Math.floor((unlockedCount / totalCount) * 100)} %)
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.85rem' }}
              onClick={() => {
                sound.coin();
                setFilter('all');
              }}
            >
              Všechny ({totalCount})
            </button>
            <button
              className={`tab-btn ${filter === 'unlocked' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.85rem' }}
              onClick={() => {
                sound.coin();
                setFilter('unlocked');
              }}
            >
              ✅ Odemčené ({unlockedCount})
            </button>
            <button
              className={`tab-btn ${filter === 'locked' ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.85rem' }}
              onClick={() => {
                sound.coin();
                setFilter('locked');
              }}
            >
              🔒 Uzamčené ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* Weapons grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
            overflowY: 'auto',
            padding: '4px',
            flex: 1,
          }}
        >
          {filtered.map((prog) => {
            const isUnlocked = prog.isUnlocked;

            return (
              <div
                key={prog.id}
                className={`char-card ${isUnlocked ? '' : 'char-card-locked'}`}
                style={{ width: 'auto', margin: 0, padding: '12px' }}
                onClick={() => {
                  sound.coin();
                  onInspectWeapon(prog);
                }}
              >
                <span className={isUnlocked ? 'char-card-unlocked-badge' : 'char-card-locked-badge'}>
                  {isUnlocked ? '✅ Odemčeno' : prog.isQueued ? '🔒 V pořadí (0 %)' : `🔒 ${prog.percent} %`}
                </span>

                {/* Big icon circle */}
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isUnlocked
                      ? 'linear-gradient(135deg, var(--bone-white), #D4CBBA)'
                      : prog.tier === 0
                      ? '#1A1410'
                      : prog.tier === 1
                      ? '#3D2818'
                      : prog.tier === 2
                      ? '#6B4E30'
                      : '#C89434',
                    border: '3px solid var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: prog.tier === 0 ? '2rem' : '2.3rem',
                    margin: '0 auto 8px auto',
                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3)',
                    filter: prog.tier === 0 ? 'grayscale(1) brightness(0.3)' : prog.tier === 1 ? 'contrast(160%) brightness(0.5)' : 'none',
                  }}
                >
                  {prog.tier === 0 ? '❓' : prog.realIcon}
                </div>

                <h3 style={{ fontSize: '1.25rem', margin: '2px 0', minHeight: '32px', color: '#111111', fontWeight: 900 }}>
                  {prog.spoiledName}
                </h3>

                <div>
                  <span className={`hunter-tier-stamp tier-stamp-${prog.tier}`} style={{ fontSize: '0.72rem' }}>
                    {prog.clueTag}
                  </span>
                </div>

                <p style={{ margin: '4px 0', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.3, minHeight: '44px', color: '#111111' }}>
                  {prog.spoiledDesc}
                </p>

                {/* Stats clue box */}
                <div className="hunter-clue-box" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                  ⚡ {prog.spoiledStatsHint}
                </div>

                {/* Progress bar for locked weapons */}
                {!isUnlocked && (
                  <div className="hunter-progress-wrap" style={{ marginTop: '6px' }}>
                    <div className="hunter-progress-header" style={{ fontSize: '0.74rem' }}>
                      <span>{prog.isQueued ? `Čeká na: ${prog.requiredWeaponName}` : 'Výzva:'}</span>
                      <span>{prog.curCount} / {prog.maxCount} ({prog.percent} %)</span>
                    </div>
                    <div className="hunter-progress-bar-outer" style={{ height: '10px' }}>
                      <div className="hunter-progress-bar-fill" style={{ width: `${prog.percent}%` }} />
                    </div>
                    <div className="hunter-progress-ticks" style={{ fontSize: '0.65rem' }}>
                      <span className={prog.percent >= 25 ? 'hunter-tick reached' : 'hunter-tick'}>25%</span>
                      <span className={prog.percent >= 50 ? 'hunter-tick reached' : 'hunter-tick'}>50%</span>
                      <span className={prog.percent >= 75 ? 'hunter-tick reached' : 'hunter-tick'}>75%</span>
                      <span className={prog.percent >= 100 ? 'hunter-tick reached' : 'hunter-tick'}>100%</span>
                    </div>
                    {prog.enemiesBreakdown.length > 0 && (
                      <div className="hunter-enemy-pills">
                        {prog.enemiesBreakdown.map((e) => (
                          <span key={e.id} className="hunter-enemy-pill" style={{ fontSize: '0.68rem', padding: '1px 4px' }} title={`${e.name}: ${e.count}`}>
                            {e.icon} {e.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                  <button
                    className="lada-btn btn-small"
                    style={{
                      width: '100%',
                      fontSize: '0.82rem',
                      padding: '5px 8px',
                      background: isUnlocked ? 'var(--mustard)' : 'var(--wood-dark)',
                      color: isUnlocked ? 'var(--ink)' : 'var(--parchment)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.coin();
                      onInspectWeapon(prog);
                    }}
                  >
                    {isUnlocked
                      ? '📜 Podrobnosti zbraně'
                      : prog.isQueued
                      ? `🔒 Čeká na: ${prog.requiredWeaponName}`
                      : `🔍 Prozkoumat stopu (${prog.percent} %)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button
            className="lada-btn"
            style={{ padding: '8px 26px', fontSize: '1.05rem' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            Zpět
          </button>
        </div>
      </div>
    </div>
  );
};
