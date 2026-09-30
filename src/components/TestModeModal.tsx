import React, { useState, useEffect, useRef } from 'react';
import { CharacterType, GameLevelId } from '../types';
import { GAME_LEVELS } from '../data/levels';
import { WEAPONS } from '../data/weapons';
import { HUNTER_UNLOCKS } from '../data/hunterUnlocks';
import { Lada } from '../render/ladaRenderer';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';

interface TestModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTestRun: (
    hero: CharacterType,
    levelId: GameLevelId,
    weapons: { id: string; level: number }[]
  ) => void;
  initialLevelId?: GameLevelId;
}

const HUNTER_KEYS: CharacterType[] = ['wanderer', 'shepherd', 'korenarka', 'watchman', 'sexton', 'granny'];

const ALL_WEAPON_KEYS = [
  'buns',
  'cane',
  'pitchfork',
  'halberd',
  'flail',
  'herbs',
  'snowball',
  'kolac',
  'potato',
  'bees',
  'hromnicka',
  'holywater',
];

const DEFAULT_HERO_WEAPONS: Record<CharacterType, { id: string; level: number }[]> = {
  wanderer: [
    { id: 'buns', level: 1 },
    { id: 'cane', level: 1 },
  ],
  shepherd: [{ id: 'buns', level: 1 }],
  korenarka: [{ id: 'herbs', level: 1 }],
  watchman: [{ id: 'halberd', level: 1 }],
  sexton: [{ id: 'holywater', level: 1 }],
  granny: [{ id: 'kolac', level: 1 }],
};

const HUNTER_DRAW_MAP: Record<
  CharacterType,
  (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, dx: number, dy: number, flee: boolean, scale: number) => void
> = {
  wanderer: Lada.drawWanderer,
  shepherd: Lada.drawShepherd,
  korenarka: Lada.drawKorenarka,
  watchman: Lada.drawWatchman,
  sexton: Lada.drawSexton,
  granny: Lada.drawGranny,
};

const HUNTER_STATS_INFO: Record<
  CharacterType,
  { hp: number; speed: number; pickup: number; ability: string; role: string }
> = {
  wanderer: {
    hp: 150,
    speed: 165,
    pickup: 75,
    ability: 'Rázová vlna (30 s)',
    role: 'Všestranný vytrvalec s vysokým zdravím a vrbovým prutem',
  },
  shepherd: {
    hp: 110,
    speed: 220,
    pickup: 160,
    ability: 'Pastevecký bič (30 s)',
    role: 'Bleskový běžec s velkým dosahem sběru mincí a buchet',
  },
  korenarka: {
    hp: 125,
    speed: 180,
    pickup: 105,
    ability: 'Hojivá bylinková mlha (30 s)',
    role: 'Přírodní léčitelka, bylinné věnce a podpora zdraví',
  },
  watchman: {
    hp: 140,
    speed: 175,
    pickup: 115,
    ability: 'Hlásná trouba & Lucerna (30 s)',
    role: 'Obrněný strážce noci se smrtonosnou halapartnou a světlem',
  },
  sexton: {
    hp: 135,
    speed: 170,
    pickup: 110,
    ability: 'Svatá záře & Kostelní zvony (35 s)',
    role: 'Pobožný služebník se svěcenou vodou ničící nemrtvé a běsy',
  },
  granny: {
    hp: 130,
    speed: 165,
    pickup: 125,
    ability: 'Vlídné slovo babičky (45 s)',
    role: 'Babička s Barunkou a psem Sultánem, uklidňuje hordy',
  },
};

const WEAPON_TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  food: { label: 'Jídlo', bg: '#D97706', color: '#FFFFFF' },
  physical: { label: 'Fyzické', bg: '#4B5563', color: '#FFFFFF' },
  nature: { label: 'Přírodní', bg: '#15803D', color: '#FFFFFF' },
  ice: { label: 'Mrazivé', bg: '#0284C7', color: '#FFFFFF' },
  holy: { label: 'Svaté', bg: '#CA8A04', color: '#FFFFFF' },
  fire: { label: 'Ohnivé', bg: '#DC2626', color: '#FFFFFF' },
  magic: { label: 'Kouzelné', bg: '#9333EA', color: '#FFFFFF' },
};

export const TestModeModal: React.FC<TestModeModalProps> = ({
  isOpen,
  onClose,
  onStartTestRun,
  initialLevelId = 1,
}) => {
  const [selectedHero, setSelectedHero] = useState<CharacterType>('wanderer');
  const [selectedLevel, setSelectedLevel] = useState<GameLevelId>(initialLevelId);
  const [activeTab, setActiveTab] = useState<'hero' | 'level' | 'weapons'>('hero');

  // Weapons map: weaponId -> { selected: boolean; level: number }
  const [weaponConfig, setWeaponConfig] = useState<Record<string, { selected: boolean; level: number }>>(() => {
    const init: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      init[key] = { selected: false, level: 1 };
    });
    // Default to wanderer weapons
    DEFAULT_HERO_WEAPONS.wanderer.forEach((w) => {
      init[w.id] = { selected: true, level: w.level };
    });
    return init;
  });

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Animate hero portraits in the selection grid
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    const start = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      HUNTER_KEYS.forEach((hKey) => {
        const cvs = canvasRefs.current[hKey];
        if (cvs) {
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            const drawFn = HUNTER_DRAW_MAP[hKey];
            if (drawFn) {
              drawFn.call(Lada, ctx, cvs.width / 2, cvs.height * 0.72, elapsed, 0, 0, false, 0.95);
            }
          }
        }
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  // Presets
  const applyHeroDefaultWeapons = (heroType: CharacterType) => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: false, level: 1 };
    });
    const defaults = DEFAULT_HERO_WEAPONS[heroType] || [{ id: 'buns', level: 1 }];
    defaults.forEach((w) => {
      nextConfig[w.id] = { selected: true, level: w.level };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const applyAllWeaponsLevel = (level: number) => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: true, level };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const clearAllWeapons = () => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: false, level: 1 };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const toggleWeapon = (id: string) => {
    setWeaponConfig((cur) => ({
      ...cur,
      [id]: {
        selected: !cur[id]?.selected,
        level: cur[id]?.level || 1,
      },
    }));
    sound.coin();
  };

  const changeWeaponLevel = (id: string, delta: number) => {
    setWeaponConfig((cur) => {
      const currentLevel = cur[id]?.level || 1;
      const nextLevel = Math.max(1, Math.min(10, currentLevel + delta));
      return {
        ...cur,
        [id]: {
          selected: true, // auto select if adjusting level
          level: nextLevel,
        },
      };
    });
    sound.coin();
  };

  const selectedWeaponsList = ALL_WEAPON_KEYS.filter((k) => weaponConfig[k]?.selected).map((k) => ({
    id: k,
    level: weaponConfig[k]?.level || 1,
  }));

  const handleStart = () => {
    if (selectedWeaponsList.length === 0) {
      sound.hit();
      return;
    }
    sound.cheer();
    onStartTestRun(selectedHero, selectedLevel, selectedWeaponsList);
  };

  return (
    <div
      className="overlay"
      style={{
        zIndex: 45,
        background: 'rgba(20, 15, 10, 0.92)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.coin();
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 24px',
          background: 'var(--wood-light)',
          border: '4px solid var(--ink)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🧪</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.9rem',
                  color: '#FDE047',
                  letterSpacing: '1px',
                  textShadow: '2px 2px 0px var(--ink)',
                }}
              >
                TESTOVACÍ MÓD (SANDBOX)
              </h2>
            </div>
            <p style={{ margin: '2px 0 0 0', fontWeight: 800, fontSize: '0.94rem', color: '#FEF3C7' }}>
              Vyzkoušejte libovolného hrdinu na kterémkoliv stage s libovolnými zbraněmi a jejich levely bez jakéhokoliv omezení!
            </p>
          </div>
          <button
            onClick={() => {
              sound.coin();
              onClose();
            }}
            style={{
              background: '#D1342B',
              color: '#FFFFFF',
              border: '2px solid var(--ink)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--ink)',
            }}
            title="Zavřít"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            margin: '8px 0 14px 0',
            borderBottom: '3px solid var(--ink)',
            paddingBottom: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('hero');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>👤 1. Hrdina:</span>
            <strong>{HUNTER_UNLOCKS[selectedHero]?.realName || 'Poutník'}</strong>
          </button>

          <button
            className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('level');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>🗺️ 2. Úroveň:</span>
            <strong>Úr. {selectedLevel} ({GAME_LEVELS[selectedLevel]?.shortTitle})</strong>
          </button>

          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('weapons');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>🗡️ 3. Startovní zbraně:</span>
            <strong>{selectedWeaponsList.length} vybráno</strong>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', minHeight: '280px' }}>
          {/* TAB 1: HERO SELECT */}
          {activeTab === 'hero' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FEF3C7' }}>
                  Zvolte si hrdinu pro testování (odemčeni jsou všichni):
                </span>
                <button
                  className="lada-btn btn-small"
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    padding: '4px 10px',
                    background: '#15803D',
                    color: '#FFFFFF',
                  }}
                  onClick={() => applyHeroDefaultWeapons(selectedHero)}
                  title="Nastaví startovní zbraně podle zvoleného hrdiny"
                >
                  🎯 Nastavit výchozí zbraně hrdiny
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                }}
              >
                {HUNTER_KEYS.map((hKey) => {
                  const isSelected = selectedHero === hKey;
                  const hunterDef = HUNTER_UNLOCKS[hKey];
                  const stats = HUNTER_STATS_INFO[hKey];

                  return (
                    <div
                      key={hKey}
                      onClick={() => {
                        sound.coin();
                        setSelectedHero(hKey);
                      }}
                      style={{
                        background: isSelected ? '#FEF3C7' : 'var(--parchment)',
                        border: isSelected ? '4px solid #16A34A' : '3px solid var(--ink)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)'
                          : '4px 4px 0px var(--ink)',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#16A34A',
                            color: '#FFFFFF',
                            border: '2px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '2px 7px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                          }}
                        >
                          ✓ ZVOLENO
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: '#EAE3D1',
                            border: '3px solid var(--ink)',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <canvas
                            ref={(el) => {
                              canvasRefs.current[hKey] = el;
                            }}
                            width={90}
                            height={90}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#111111', fontWeight: 900 }}>
                            {hunterDef.realName}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: '#78350F', fontWeight: 800, marginBottom: '4px' }}>
                            {hunterDef.realTitle}
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#111111', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span>❤️ {stats.hp} HP</span>
                            <span>👟 {stats.speed}</span>
                            <span>🧲 {stats.pickup}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: '8px',
                          background: 'rgba(0,0,0,0.05)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: '#B45309' }}>⚡ {stats.ability}</div>
                        <div style={{ marginTop: '2px', color: '#374151' }}>{stats.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LEVEL SELECT */}
          {activeTab === 'level' && (
            <div>
              <div style={{ marginBottom: '10px', fontWeight: 900, fontSize: '1.05rem', color: '#FEF3C7' }}>
                Zvolte si stage pro testování (přístupných je všech 6 úrovní včetně bossů):
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                }}
              >
                {([1, 2, 3, 4, 5, 6] as GameLevelId[]).map((lvlId) => {
                  const lvl = GAME_LEVELS[lvlId];
                  const isSelected = selectedLevel === lvlId;

                  return (
                    <div
                      key={lvlId}
                      onClick={() => {
                        sound.coin();
                        setSelectedLevel(lvlId);
                      }}
                      style={{
                        background: isSelected ? '#FEF3C7' : 'var(--parchment)',
                        border: isSelected ? '4px solid #16A34A' : '3px solid var(--ink)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)'
                          : '4px 4px 0px var(--ink)',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span
                          style={{
                            background: isSelected ? '#16A34A' : 'var(--wood-dark)',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 900,
                          }}
                        >
                          {isSelected ? '✓ ZVOLENO' : `Úroveň ${lvlId}`}
                        </span>
                        <span style={{ fontSize: '1.25rem' }}>{lvl.icon}</span>
                      </div>

                      <h4 style={{ margin: '0 0 2px 0', fontSize: '1.18rem', fontWeight: 900, color: '#111111' }}>
                        {lvl.name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#78350F', marginBottom: '6px' }}>
                        {lvl.subtitle}
                      </div>

                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', lineHeight: 1.3, fontWeight: 700, color: '#1F2937' }}>
                        {lvl.description}
                      </p>

                      <div
                        style={{
                          background: 'rgba(209, 52, 43, 0.12)',
                          border: '1.5px solid #D1342B',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: '#991B1B',
                        }}
                      >
                        👑 Velký boss: <strong>{lvl.finalBoss.name}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WEAPONS CONFIGURATION */}
          {activeTab === 'weapons' && (
            <div>
              {/* Presets Bar */}
              <div
                style={{
                  background: 'var(--parchment)',
                  border: '3px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 900, fontSize: '0.94rem', color: '#111111' }}>
                  ⚡ Rychlé předvolby arzenálu:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#3D2210', color: '#FEF3C7' }}
                    onClick={() => applyHeroDefaultWeapons(selectedHero)}
                  >
                    🎯 Dle hrdiny
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#2563EB', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(1)}
                  >
                    ⚔️ Všechny (Úr. 1)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#EA580C', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(5)}
                  >
                    🔥 Všechny (Úr. 5 – MAX)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#7C3AED', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(10)}
                  >
                    👑 Božský arzenál (Úr. 10)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#6B7280', color: '#FFFFFF' }}
                    onClick={clearAllWeapons}
                  >
                    🧹 Vyčistit
                  </button>
                </div>
              </div>

              {/* Weapons Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '10px',
                }}
              >
                {ALL_WEAPON_KEYS.map((wId) => {
                  const wDef = WEAPONS[wId];
                  if (!wDef) return null;
                  const cfg = weaponConfig[wId] || { selected: false, level: 1 };
                  const isSel = cfg.selected;
                  const typeTag = WEAPON_TYPE_LABELS[wDef.type] || { label: wDef.type, bg: '#4B5563', color: '#FFFFFF' };
                  const estDmg = Math.round(wDef.baseDmg + (cfg.level - 1) * 5);

                  return (
                    <div
                      key={wId}
                      style={{
                        background: isSel ? '#FEF3C7' : '#EFE7D5',
                        border: isSel ? '3px solid #16A34A' : '2px solid #5C3D28',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        color: 'var(--ink)',
                        boxShadow: isSel ? '0 0 10px rgba(22, 163, 74, 0.25), 3px 3px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                        textAlign: 'left',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleWeapon(wId)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#16A34A',
                            }}
                          />
                          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            <GameIcon icon={wDef.icon} size={22} />
                          </span>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#111111', lineHeight: 1.2 }}>
                              {wDef.name}
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                background: typeTag.bg,
                                color: typeTag.color,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                marginTop: '2px',
                              }}
                            >
                              {typeTag.label}
                            </span>
                          </div>
                        </label>

                        {/* Level Controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: isSel ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                            border: '2px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '2px 4px',
                          }}
                        >
                          <button
                            onClick={() => changeWeaponLevel(wId, -1)}
                            disabled={cfg.level <= 1}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level <= 1 ? '#E5E7EB' : '#D1342B',
                              color: cfg.level <= 1 ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level <= 1 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title="Snížit úroveň zbraně"
                          >
                            -
                          </button>

                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              minWidth: '46px',
                              textAlign: 'center',
                              color: isSel ? '#111111' : '#6B7280',
                            }}
                          >
                            Úr. {cfg.level}
                          </span>

                          <button
                            onClick={() => changeWeaponLevel(wId, 1)}
                            disabled={cfg.level >= 10}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level >= 10 ? '#E5E7EB' : '#16A34A',
                              color: cfg.level >= 10 ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level >= 10 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title="Zvýšit úroveň zbraně (až na úroveň 10)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#4B5563', fontWeight: 700, lineHeight: 1.25 }}>
                        💥 Zásah: ~{estDmg} | ⏱️ Kadence: {wDef.baseCd} s
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Action */}
        <div
          style={{
            borderTop: '3px solid var(--ink)',
            paddingTop: '12px',
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ textAlign: 'left', fontSize: '0.92rem', fontWeight: 800, color: '#FEF3C7' }}>
            <span>Vybráno: </span>
            <strong style={{ color: '#FDE047' }}>{HUNTER_UNLOCKS[selectedHero]?.realName}</strong>
            <span> na </span>
            <strong style={{ color: '#FDE047' }}>{GAME_LEVELS[selectedLevel]?.name}</strong>
            <span> s </span>
            <strong style={{ color: '#86EFAC' }}>{selectedWeaponsList.length} zbraněmi</strong>
            {selectedWeaponsList.length === 0 && (
              <span style={{ color: '#F87171', marginLeft: '6px' }}>(Vyberte alespoň 1 zbraň!)</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="lada-btn btn-small"
              style={{
                margin: 0,
                background: '#4B5563',
                color: '#FFFFFF',
              }}
              onClick={() => {
                sound.coin();
                onClose();
              }}
            >
              Zrušit
            </button>

            <button
              className="lada-btn btn-small"
              disabled={selectedWeaponsList.length === 0}
              style={{
                margin: 0,
                background: selectedWeaponsList.length > 0 ? '#16A34A' : '#9CA3AF',
                color: '#FFFFFF',
                fontWeight: 900,
                cursor: selectedWeaponsList.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selectedWeaponsList.length > 0 ? '4px 4px 0 var(--ink)' : 'none',
              }}
              onClick={handleStart}
            >
              ⚔️ Spustit testovací výpravu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
