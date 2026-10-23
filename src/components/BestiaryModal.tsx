import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio';
import { ENEMIES } from '../data/enemies';
import { drawEnemyRenderer, drawPrefixAura } from '../render/ladaRenderer';
import { getEnemyProgress } from '../data/enemyUnlocks';
import { KrejcarIcon } from './KrejcarIcon';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { GameIcon } from './GameIcon';
import { ENEMY_PREFIX_DEFS, EnemyPrefixType } from '../types';

export const PREFIX_KEYS: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny', 'vycerpany'];

export const PREFIX_LORE: Record<EnemyPrefixType, { title: string; lore: string; advice: string; traits: string[] }> = {
  vichricovy: {
    title: 'Vichřicové strašidlo',
    lore: 'Strašidlo ovinuté divokým podzimním vichrem z polí, jež se míhá jako stín mezi stromy.',
    advice:
      'Vyhýbá se 50 % všech přímých úderů. Použijte zbraně s plošným účinkem nebo husté krupobití střel, aby se úhyb rychle vyčerpal.',
    traits: ['+110 rychlost pohybu', '50 % šance na úhyb zásahu', 'Azurová větrná spirála'],
  },
  hromovy: {
    title: 'Hromový běs',
    lore: 'Běs nabitý letním hromobitím, jehož tělem probíjejí nezkrotné elektrické výboje.',
    advice:
      'Vrací 50 % zranění zpět lovci do 200 px (zastropováno na max 25 % Kuráže, cooldown 0,25 s). Neútočte silným úderem zblízka, odstřelujte ho z bezpečné vzdálenosti!',
    traits: [
      '+70 rychlost pohybu',
      'Bleskový odraz (50 % dmg do 200 px)',
      'Ochranný bezpečnostní strop',
      'Zlato-modrá blesková aura',
    ],
  },
  kamenny: {
    title: 'Kamenný krunýřník',
    lore: 'Monstrum obrostlé starobylou žulovou krustou z hrusických lomů a mezí.',
    advice:
      'Pohlcuje 91 % veškerého poškození a nelze jej omráčit ani uplatit jídlem. Plouží se pomalu – není nutné s ním plýtvat časem, raději kolem něj manévrujte.',
    traits: [
      '91 % redukce veškerého zranění',
      '-20 % rychlost pohybu',
      'Imunita vůči omráčení i buchtám',
      'Puklinová kamenná krusta',
    ],
  },
  pekelny: {
    title: 'Pekelný spřeženec',
    lore: 'Plamenný pekelník vyvržený přímo z Čertova kotle, soptící síru a žhavé uhlíky.',
    advice:
      'Zanechává hořící magmatickou stopu a při dlouhém přímém běhu před vás vychrlí prediktivní puklinu. Nekružte přímočaře a přerušujte jeho sprint.',
    traits: [
      'Magmatická stopa na 9 s',
      'Pronásledovací zrychlení až +120 %',
      'Prediktivní lávová puklina',
      'Sálavá rudozlatá aura',
    ],
  },
  vycerpany: {
    title: 'Vyčerpaný bubák',
    lore: 'Strašidlo zmožené nočním bojem a tísní lovce, sotva pletoucí nohama a zívající v chladu.',
    advice:
      'Zjevuje se v kritických chvílích na záchranu hráče. Má poloviční zdraví, poloviční rychlost a potácí se, avšak zanechává plnou odměnu perníčků i dropů!',
    traits: [
      '-50 % Kuráž (HP)',
      '-50 % rychlost pohybu',
      '-50 % kadence útoků',
      'Kolébavé potácení a ospalá aura',
      '100 % plné odměny a perníčky',
    ],
  },
};

export const CATEGORIES = [
  { id: 'all', label: 'Všechna strašidla', icon: 'book' },
  { id: 'swarms', label: 'Šotci a havěť', icon: 'rooster' },
  { id: 'undead', label: 'Kostlivci a umrlci', icon: 'tomb' },
  { id: 'water', label: 'Hastrmani a tůně', icon: 'water' },
  { id: 'winter', label: 'Mrazíci a vánice', icon: 'snowflake' },
  { id: 'forest', label: 'Lesní přízraky', icon: 'pine' },
  { id: 'demons', label: 'Pekelná cháska', icon: 'devil' },
  { id: 'bosses', label: 'Velcí bossové', icon: 'dragon' },
  { id: 'prefixes', label: 'Afixy a aury', icon: 'star' },
];

export interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestiaryKills: Record<string, number>;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose, bestiaryKills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string>('rarach');
  const [selectedPrefixId, setSelectedPrefixId] = useState<EnemyPrefixType>('vichricovy');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const monsterList = Object.values(ENEMIES).filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory
  );
  const currentMonster = ENEMIES[selectedId] || monsterList[0] || ENEMIES.rarach;
  const currentKills = bestiaryKills[currentMonster.id] || 0;
  const enemyProg = getEnemyProgress(currentMonster.id, currentKills);

  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.65;

      if (selectedCategory === 'prefixes') {
        const m = ENEMIES.rarach;
        const demoEnemy = { ...m, prefix: selectedPrefixId };
        drawPrefixAura(ctx, cx, cy, 30, selectedPrefixId, elapsed);
        drawEnemyRenderer(m.method, ctx, cx, cy, elapsed, 0, false, demoEnemy, []);
        animId = requestAnimationFrame(render);
        return;
      }

      const m = currentMonster;
      const tier = enemyProg.tier;
      const extraY =
        m.id === 'cert'
          ? 5
          : m.id === 'obr'
          ? 10
          : m.id === 'meluzina'
          ? -15
          : m.id === 'polednice' || m.id === 'klekanice'
          ? -5
          : m.id === 'drak'
          ? 12
          : m.id === 'jezinka_mraziva'
          ? 10
          : 0;
      const extraArgs = m.id === 'cert' ? [true] : m.id === 'drak' ? [false, false] : [];
      const enemyToRender = tier >= 2 ? { ...m, semiVisible: false } : { ...m, palette: undefined, semiVisible: false };

      drawEnemyRenderer(m.method, ctx, cx, cy + extraY, elapsed, 0, false, enemyToRender, extraArgs);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedCategory, currentMonster, enemyProg.tier, selectedPrefixId]);

  if (!isOpen) return null;

  const totalMonsters = Object.keys(ENEMIES).length;
  const discoveredCount = Object.keys(ENEMIES).filter((id) => (bestiaryKills[id] || 0) > 0).length;
  const fullyMasteredCount = Object.keys(ENEMIES).filter((id) => {
    const k = bestiaryKills[id] || 0;
    return getEnemyProgress(id, k).isUnlocked;
  }).length;

  return (
    <div className="overlay" style={{ zIndex: 30 }} onClick={onClose}>
      <div className="panel" style={{ maxWidth: '960px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GameIcon icon="book" size={24} /> Bestiář noční české vesnice
            </h2>
            <LadaBotanicalFlourish height={18} />
            <p style={{ fontWeight: 700, margin: '0 0 8px 0', fontSize: '0.94rem' }}>
              Encyklopedie {totalMonsters} lidových strašidel, bubáků a diblíků. Zkoumejte, jak je zklidnit
              poctivým výpraskem nebo usmířit voňavou buchtou.
            </p>
          </div>
          <button
            className="tab-btn"
            style={{ padding: '4px 10px', fontSize: '1.1rem', minWidth: 'auto' }}
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
            background: 'var(--parchmentDark)',
            border: '2px solid var(--ink)',
            borderRadius: '8px',
            padding: '6px 14px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 900,
            color: '#111111',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <GameIcon icon="magnifier" size={14} />
            Spatřeno strašidel:{' '}
            <strong>
              {discoveredCount} / {totalMonsters}
            </strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <GameIcon icon="trophy" size={14} />
            Zcela probádáno (100 %):{' '}
            <strong>
              {fullyMasteredCount} / {totalMonsters}
            </strong>
          </span>
          <span
            style={{
              color: '#2A170A',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap',
            }}
          >
            <GameIcon icon="scroll" size={14} /> Úrovně odhalení: 0 %{' '}
            <GameIcon icon="arrow" size={10} /> 25 % <GameIcon icon="arrow" size={10} /> 50 %{' '}
            <GameIcon icon="arrow" size={10} /> 75 % <GameIcon icon="arrow" size={10} /> 100 %
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '5px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`btn-small lada-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{
                margin: '2px',
                padding: '4px 9px',
                fontSize: '0.82rem',
                backgroundColor: selectedCategory === cat.id ? 'var(--mustard)' : 'var(--wood-dark)',
                color: selectedCategory === cat.id ? 'var(--ink)' : 'var(--parchment)',
              }}
              onClick={() => {
                setSelectedCategory(cat.id);
                sound.coin();
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <GameIcon icon={cat.icon} size={14} />
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        <div className="bestiary-container">
          <div className="bestiary-list">
            {selectedCategory === 'prefixes'
              ? PREFIX_KEYS.map((pKey) => {
                  const pDef = ENEMY_PREFIX_DEFS[pKey];
                  const isSelected = pKey === selectedPrefixId;
                  return (
                    <button
                      key={pKey}
                      className={`bestiary-item-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        background: isSelected ? 'var(--mustard)' : '#F3F4F6',
                        color: '#111111',
                      }}
                      onClick={() => {
                        setSelectedPrefixId(pKey);
                        sound.slash();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{pDef.badge.split(' ')[0]}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111111' }}>
                          {pDef.name}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#78350F',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <GameIcon icon="star" size={11} /> Přívlastek
                      </div>
                    </button>
                  );
                })
              : monsterList.map((m) => {
                  const k = bestiaryKills[m.id] || 0;
                  const prog = getEnemyProgress(m.id, k);
                  const isSelected = m.id === currentMonster.id;
                  return (
                    <button
                      key={m.id}
                      className={`bestiary-item-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        background: isSelected
                          ? 'var(--mustard)'
                          : prog.tier === 4
                          ? '#ECFDF5'
                          : prog.tier === 0
                          ? '#F3F4F6'
                          : undefined,
                        color: '#111111',
                      }}
                      onClick={() => {
                        setSelectedId(m.id);
                        sound.slash();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{prog.icon}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111111' }}>
                          {prog.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 900,
                            color: prog.tier === 4 ? '#065F46' : '#2A170A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {prog.tier === 4 ? (
                            <>
                              <GameIcon icon="checkmark" size={12} /> 100 %
                            </>
                          ) : prog.tier === 0 ? (
                            <>
                              <GameIcon icon="padlock" size={12} /> 0 %
                            </>
                          ) : (
                            `${prog.percent} %`
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#111111',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <GameIcon icon="skull" size={12} />
                          {`${k}×`}
                        </span>
                      </div>
                    </button>
                  );
                })}
          </div>

          <div className="bestiary-detail-card">
            {selectedCategory === 'prefixes' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className="hunter-tier-stamp tier-stamp-4"
                      style={{
                        fontSize: '0.8rem',
                        marginBottom: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <GameIcon icon="star" size={13} /> FOLKLÓRNÍ PŘÍVLASTEK
                    </span>
                    <h2 style={{ margin: '2px 0 2px 0', fontSize: '1.85rem', color: '#2A170A' }}>
                      {ENEMY_PREFIX_DEFS[selectedPrefixId].badge}
                    </h2>
                    <div style={{ fontWeight: 900, fontSize: '1.02rem', color: '#78350F', marginBottom: '8px' }}>
                      {PREFIX_LORE[selectedPrefixId].title}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--mustard)',
                      color: 'var(--ink)',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      border: '2px solid var(--ink)',
                      textAlign: 'right',
                    }}
                  >
                    Rejdový afix
                  </div>
                </div>

                <div className="bestiary-canvas-wrap">
                  <canvas ref={previewCanvasRef} width={180} height={180} className="bestiary-canvas" />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                  {PREFIX_LORE[selectedPrefixId].traits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="tag-badge"
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <GameIcon icon="lightning" size={13} />
                      {trait}
                    </span>
                  ))}
                </div>

                <p style={{ fontWeight: 700, lineHeight: 1.35, margin: '10px 0' }}>
                  {PREFIX_LORE[selectedPrefixId].lore}
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    borderLeft: '4px solid var(--mustard)',
                    padding: '8px 12px',
                    margin: '10px 0',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                  }}
                >
                  <GameIcon
                    icon="scroll"
                    size={14}
                    style={{ marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  „Z kroniky Ladova kraje: {PREFIX_LORE[selectedPrefixId].lore}“
                </div>

                <div
                  style={{
                    borderTop: '2px dashed #bbb',
                    paddingTop: '10px',
                    marginTop: '10px',
                    fontSize: '0.92rem',
                  }}
                >
                  <div>
                    <strong
                      style={{ color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <GameIcon icon="clover" size={14} />
                      Taktika a rady pro lovce:{' '}
                    </strong>
                    <span style={{ color: '#166534', fontWeight: 700 }}>
                      {PREFIX_LORE[selectedPrefixId].advice}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className={`hunter-tier-stamp tier-stamp-${enemyProg.tier}`}
                      style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'inline-block' }}
                    >
                      {enemyProg.clueTag}
                    </span>
                    <h2 style={{ margin: '2px 0 2px 0', fontSize: '1.85rem', color: '#2A170A' }}>
                      {enemyProg.name}
                    </h2>
                    <div style={{ fontWeight: 900, fontSize: '1.02rem', color: '#78350F', marginBottom: '8px' }}>
                      {enemyProg.title}
                    </div>
                  </div>
                  <div
                    style={{
                      background: enemyProg.isUnlocked ? 'var(--leaf-green)' : 'var(--wood-dark)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      border: '2px solid var(--ink)',
                      textAlign: 'right',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {enemyProg.isUnlocked ? (
                      <>
                        <GameIcon icon="checkmark" size={14} /> ZCELA PROBÁDÁNO
                      </>
                    ) : (
                      `VÝZKUM: ${enemyProg.kills} / ${enemyProg.maxKills} (${enemyProg.percent} %)`
                    )}
                  </div>
                </div>

                <div className="bestiary-canvas-wrap">
                  <canvas ref={previewCanvasRef} width={180} height={180} className="bestiary-canvas" />
                </div>

                <div className="hunter-progress-wrap" style={{ margin: '10px 0 14px 0' }}>
                  <div className="hunter-progress-header">
                    <span>Postup terénního výzkumu a zápisů v kronice:</span>
                    <span>
                      {enemyProg.kills} / {enemyProg.maxKills} zahnáno ({enemyProg.percent} %)
                    </span>
                  </div>
                  <div className="hunter-progress-bar-outer" style={{ height: '14px' }}>
                    <div
                      className="hunter-progress-bar-fill"
                      style={{
                        width: `${enemyProg.percent}%`,
                        background: enemyProg.isUnlocked ? 'linear-gradient(90deg, #10B981, #059669)' : undefined,
                      }}
                    />
                  </div>
                  <div className="hunter-progress-ticks" style={{ fontSize: '0.75rem', marginTop: '3px' }}>
                    <span className={`hunter-tick ${enemyProg.percent >= 0 ? 'reached' : ''}`}>0%</span>
                    <span
                      className={`hunter-tick ${enemyProg.percent >= 25 ? 'reached' : ''}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <GameIcon icon={enemyProg.percent >= 25 ? 'checkmark' : 'padlock'} size={11} /> 25%
                    </span>
                    <span
                      className={`hunter-tick ${enemyProg.percent >= 50 ? 'reached' : ''}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <GameIcon icon={enemyProg.percent >= 50 ? 'checkmark' : 'padlock'} size={11} /> 50%
                    </span>
                    <span
                      className={`hunter-tick ${enemyProg.percent >= 75 ? 'reached' : ''}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <GameIcon icon={enemyProg.percent >= 75 ? 'checkmark' : 'padlock'} size={11} /> 75%
                    </span>
                    <span
                      className={`hunter-tick ${enemyProg.percent >= 100 ? 'reached' : ''}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <GameIcon icon={enemyProg.percent >= 100 ? 'checkmark' : 'padlock'} size={11} /> 100%
                    </span>
                  </div>
                </div>

                <div className="bestiary-tags">
                  <span className="tag-badge tag-weak">Nebezpečnost: {enemyProg.spoiledStats.danger}</span>
                  <span
                    className="tag-badge tag-neutral"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <GameIcon icon="skull" size={13} /> Přemoženo: {enemyProg.kills}×
                  </span>
                  <span
                    className="tag-badge"
                    style={{
                      background: '#E2E8F0',
                      color: 'var(--ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <GameIcon icon="heart" size={13} /> {enemyProg.spoiledStats.hp}
                  </span>
                  <span
                    className="tag-badge"
                    style={{
                      background: '#FEF3C7',
                      color: 'var(--ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <KrejcarIcon size={16} /> {enemyProg.spoiledStats.coinValue}
                  </span>
                  {enemyProg.tier >= 2 && (
                    <span
                      className="tag-badge"
                      style={{
                        background: '#FEF9C3',
                        color: '#854D0E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <GameIcon icon="croissant" size={14} />
                      Hlad:{' '}
                      {Math.round(
                        (1 - (currentMonster.hunger ?? currentMonster.foodResist ?? 0)) * 100
                      )}{' '}
                      %
                    </span>
                  )}
                  {enemyProg.tier >= 3 && (
                    <span
                      className="tag-badge"
                      style={{
                        background: '#E0E7FF',
                        color: 'var(--ink)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <GameIcon icon="lightning" size={13} /> Rychlost: {enemyProg.spoiledStats.speed}
                    </span>
                  )}
                  {enemyProg.tier >= 2 && (
                    <span
                      className="tag-badge"
                      style={{
                        background:
                          currentMonster.attackCadence === 'fast'
                            ? '#ECFDF5'
                            : currentMonster.attackCadence === 'slow'
                            ? '#FEF2F2'
                            : '#EFF6FF',
                        color:
                          currentMonster.attackCadence === 'fast'
                            ? '#065F46'
                            : currentMonster.attackCadence === 'slow'
                            ? '#991B1B'
                            : '#1E40AF',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {currentMonster.attackCadence === 'fast' ? (
                        <>
                          <GameIcon icon="lightning" size={13} /> Útok: Rychlý (0,6 s)
                        </>
                      ) : currentMonster.attackCadence === 'slow' ? (
                        <>
                          <GameIcon icon="hammer" size={13} /> Útok: Pomalý (1,8 s)
                        </>
                      ) : (
                        <>
                          <GameIcon icon="sword" size={13} /> Útok: Normální (1,2 s)
                        </>
                      )}
                    </span>
                  )}
                  {enemyProg.tier >= 2 && (
                    <span
                      className="tag-badge"
                      style={{
                        background: '#FEE2E2',
                        color: '#991B1B',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <GameIcon icon="impact" size={13} /> Úder: {currentMonster.damage}
                    </span>
                  )}
                </div>

                <p style={{ fontWeight: 700, lineHeight: 1.35, margin: '10px 0' }}>
                  {enemyProg.spoiledLore}
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    borderLeft: '4px solid var(--mustard)',
                    padding: '8px 12px',
                    margin: '10px 0',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                  }}
                >
                  <GameIcon
                    icon="scroll"
                    size={14}
                    style={{ marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  „Z kroniky Ladova kraje:{' '}
                  {enemyProg.tier >= 2
                    ? 'Kdo chce přemoci tohoto tvora, musí znát jeho zvyky a nenechat se překvapit nočním přepadem.'
                    : 'Kronikáři zatím shromažďují zkazky o tomto tajemném nočním úkazu.'}
                  “
                </div>

                <div
                  style={{
                    borderTop: '2px dashed #bbb',
                    paddingTop: '10px',
                    marginTop: '10px',
                    fontSize: '0.92rem',
                  }}
                >
                  <div>
                    <strong
                      style={{ color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <GameIcon icon="clover" size={14} /> Slabiny:
                    </strong>{' '}
                    <span
                      style={{
                        color: enemyProg.tier >= 2 ? '#166534' : '#6B7280',
                        fontWeight: 700,
                      }}
                    >
                      {enemyProg.spoiledWeakness}
                    </span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <strong
                      style={{ color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <GameIcon icon="warning" size={14} /> Přednosti a záludnosti:
                    </strong>{' '}
                    <span
                      style={{
                        color: enemyProg.tier >= 3 ? '#991b1b' : '#6B7280',
                        fontWeight: 700,
                      }}
                    >
                      {enemyProg.spoiledStrength}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button className="lada-btn" onClick={onClose}>
            Zavřít bestiář
          </button>
        </div>
      </div>
    </div>
  );
};
