import React, { useState, useMemo } from 'react';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { getWeaponProgress, type WeaponProgress } from '../data/weaponUnlocks';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { WEAPONS_WITH_MILESTONES } from '../data/weaponMilestones';

export interface ArsenalModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: any;
  onInspectWeapon: (weapon: WeaponProgress) => void;
}

export const ArsenalModal: React.FC<ArsenalModalProps> = ({ isOpen, onClose, meta, onInspectWeapon }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const canonicalWeaponIds = useMemo(() => Array.from(WEAPONS_WITH_MILESTONES), []);
  const progresses = useMemo(
    () => canonicalWeaponIds.map((key) => getWeaponProgress(key, meta)),
    [canonicalWeaponIds, meta]
  );

  if (!isOpen) return null;

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
        style={{
          maxWidth: '1020px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2
              style={{
                margin: '0 0 4px 0',
                fontSize: '1.9rem',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <GameIcon icon="sword" size={28} />
              Zbrojnice &amp; Knihovna zbraní Bubákova
            </h2>
            <LadaBotanicalFlourish height={18} />
          </div>
          <button
            className="tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '1.2rem',
              minWidth: 'auto',
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            <GameIcon icon="cross" size={16} />
          </button>
        </div>

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
          <div
            style={{
              fontWeight: 900,
              fontSize: '0.95rem',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <GameIcon icon="chart" size={18} />
            Stav zbrojnice:{' '}
            <span style={{ color: '#111111', fontWeight: 900 }}>
              {unlockedCount} / {totalCount}
            </span>{' '}
            zbraní odemčeno ({Math.floor((unlockedCount / totalCount) * 100)} %)
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
              style={{
                padding: '4px 10px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => {
                sound.coin();
                setFilter('unlocked');
              }}
            >
              <GameIcon icon="checkmark" size={15} />
              Odemčené ({unlockedCount})
            </button>
            <button
              className={`tab-btn ${filter === 'locked' ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => {
                sound.coin();
                setFilter('locked');
              }}
            >
              <GameIcon icon="padlock" size={15} />
              Uzamčené ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: '14px',
            overflowY: 'auto',
            padding: '4px',
            flex: 1,
            minHeight: 0,
            width: '100%',
          }}
        >
          {filtered.map((prog) => {
            const isUnlocked = prog.isUnlocked;
            return (
              <div
                key={prog.id}
                className={`char-card ${isUnlocked ? '' : 'char-card-locked'}`}
                style={{
                  width: 'auto',
                  margin: 0,
                  padding: '12px',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflowWrap: 'break-word',
                }}
                onClick={() => {
                  sound.coin();
                  onInspectWeapon(prog);
                }}
              >
                <span
                  className={isUnlocked ? 'char-card-unlocked-badge' : 'char-card-locked-badge'}
                  style={{
                    maxWidth: 'calc(100% - 20px)',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                    lineHeight: 1.2,
                  }}
                >
                  {isUnlocked ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="checkmark" size={13} />
                      Odemčeno
                    </span>
                  ) : prog.isQueued ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="padlock" size={13} />
                      V pořadí (0 %)
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="padlock" size={13} />
                      {prog.percent} %
                    </span>
                  )}
                </span>
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
                    filter:
                      prog.tier === 0
                        ? 'grayscale(1) brightness(0.3)'
                        : prog.tier === 1
                        ? 'contrast(160%) brightness(0.5)'
                        : 'none',
                    flexShrink: 0,
                  }}
                >
                  <GameIcon
                    icon={prog.tier === 0 ? 'question' : prog.realIcon}
                    size={prog.id === 'buns' || prog.id === 'povidlove_buchty' ? 44 : '2.2rem'}
                  />
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    margin: '2px 0',
                    minHeight: '32px',
                    color: '#111111',
                    fontWeight: 900,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {prog.spoiledName}
                </h3>
                <div>
                  <span
                    className={`hunter-tier-stamp tier-stamp-${prog.tier}`}
                    style={{ fontSize: '0.72rem', maxWidth: '100%', overflowWrap: 'break-word' }}
                  >
                    {prog.clueTag}
                  </span>
                </div>
                <p
                  style={{
                    margin: '4px 0',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    minHeight: '44px',
                    color: '#111111',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {prog.spoiledDesc}
                </p>
                <div
                  className="hunter-clue-box"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <GameIcon icon="lightning" size={14} />
                  {prog.spoiledStatsHint}
                </div>
                {!isUnlocked && (
                  <div className="hunter-progress-wrap" style={{ marginTop: '6px' }}>
                    <div
                      className="hunter-progress-header"
                      style={{ fontSize: '0.74rem', flexWrap: 'wrap', gap: '4px' }}
                    >
                      <span>{prog.isQueued ? `Čeká na: ${prog.requiredWeaponName}` : 'Výzva:'}</span>
                      <span>
                        {prog.curCount} / {prog.maxCount} ({prog.percent} %)
                      </span>
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
                          <span
                            key={e.id}
                            className="hunter-enemy-pill"
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title={`${e.name}: ${e.count}`}
                          >
                            <GameIcon icon={e.icon} size={14} />
                            {e.count}
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
                      whiteSpace: 'normal',
                      overflowWrap: 'break-word',
                      lineHeight: 1.2,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.coin();
                      onInspectWeapon(prog);
                    }}
                  >
                    {isUnlocked ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          justifyContent: 'center',
                        }}
                      >
                        <GameIcon icon="scroll" size={15} />
                        Podrobnosti zbraně
                      </span>
                    ) : prog.isQueued ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          justifyContent: 'center',
                        }}
                      >
                        <GameIcon icon="padlock" size={14} />
                        Čeká na: {prog.requiredWeaponName}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          justifyContent: 'center',
                        }}
                      >
                        <GameIcon icon="magnifier" size={14} />
                        Prozkoumat stopu ({prog.percent} %)
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

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
