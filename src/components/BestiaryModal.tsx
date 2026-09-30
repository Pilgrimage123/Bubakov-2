import React, { useState, useEffect, useRef } from 'react';
import { ENEMIES } from '../data/enemies';
import { Lada } from '../render/ladaRenderer';
import { EnemyCategory } from '../types';
import { sound } from '../audio';
import { getEnemyProgress, EnemyProgress } from '../data/enemyUnlocks';
import { KrejcarIcon } from './KrejcarIcon';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bestiaryKills: Record<string, number>;
}

const CATEGORIES: { id: EnemyCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Všechna strašidla' },
  { id: 'swarms', label: '🐭 Šotci a havěť' },
  { id: 'undead', label: '💀 Hroboví umrlci' },
  { id: 'shadows', label: '👤 Noční stíny' },
  { id: 'water', label: '💧 Vodní cháska' },
  { id: 'frost', label: '❄️ Větrné a zimní' },
  { id: 'fields', label: '🌾 Polní a lesní' },
  { id: 'demons', label: '🔥 Pekelníci' },
  { id: 'bosses', label: '👑 Velcí bossové' },
];

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose, bestiaryKills }) => {
  const [selectedCategory, setSelectedCategory] = useState<EnemyCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string>('rarach');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const monsterList = Object.values(ENEMIES).filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory
  );

  const currentMonster = ENEMIES[selectedId] || monsterList[0] || ENEMIES.rarach;
  const currentKills = bestiaryKills[currentMonster.id] || 0;
  const enemyProg = getEnemyProgress(currentMonster.id, currentKills);

  // Progressive canvas portrait rendering respecting tiers (0 = locked silhouette with ?, 1 = dark charcoal, 2 = sepia, 3 = mystic veil, 4 = full color)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const m = currentMonster;
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.65;
      const tier = enemyProg.tier;

      // Draw the monster base
      const palette = m.palette;
      if (palette && tier >= 2) {
        ctx.save();
        if (palette === 'soot') {
          ctx.filter = 'brightness(0.52) contrast(1.4) drop-shadow(0 0 3px #EA580C)';
        } else if (palette === 'crimson') {
          ctx.filter = 'sepia(1) saturate(5) hue-rotate(320deg) brightness(0.9)';
        } else if (palette === 'bog') {
          ctx.filter = 'sepia(0.85) hue-rotate(65deg) saturate(2.5) brightness(0.85)';
        } else if (palette === 'steel') {
          ctx.filter = 'grayscale(0.85) contrast(1.35) brightness(1.15)';
        }
      }

      if (m.id === 'cert') {
        Lada.drawCert(ctx, cx, cy + 5, elapsed, 0, false, true);
      } else if (m.id === 'hejkal') {
        Lada.drawHejkal(ctx, cx, cy + 5, elapsed, 0, false);
      } else if (m.id === 'obr') {
        Lada.drawObr(ctx, cx, cy + 10, elapsed, 0, false);
      } else if (m.id === 'meluzina') {
        Lada.drawMeluzina(ctx, cx, cy - 15, elapsed, 0, false);
      } else if (m.id === 'polednice') {
        Lada.drawPolednice(ctx, cx, cy - 5, elapsed, 0, false);
      } else if (m.id === 'klekanice') {
        Lada.drawKlekanice(ctx, cx, cy - 5, elapsed, 0, false);
      } else {
        const drawer = (Lada as any)[m.method];
        if (typeof drawer === 'function') {
          drawer.call(Lada, ctx, cx, cy, elapsed, 0, false);
        } else {
          Lada.drawRarach(ctx, cx, cy, elapsed, 0, false);
        }
      }

      if (palette && tier >= 2) {
        ctx.restore();
        if (palette === 'soot') {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx + 4, cy - 12, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (palette === 'crimson') {
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(cx + 3, cy - 14, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Progressive tier visual filters
      if (tier === 4) {
        // Fully revealed vivid animation
      } else if (tier === 3) {
        // 75%: Golden mystical veil
        ctx.save();
        ctx.fillStyle = 'rgba(243, 233, 210, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#D9A036';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
        ctx.restore();
      } else if (tier === 2) {
        // 50%: Sepia / monochrome charcoal sketch
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(92, 72, 50, 0.76)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(235, 222, 198, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (tier === 1) {
        // 25%: Deep charcoal silhouette, rough outline visible
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#241E18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(25, 20, 15, 0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        // 0%: Pitch-black silhouette shrouded in dense mystery fog with glowing question mark
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        const grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, 80);
        grad.addColorStop(0, 'rgba(35, 28, 20, 0.7)');
        grad.addColorStop(1, 'rgba(12, 10, 8, 0.96)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#D9A036';
        ctx.font = '900 48px Eczar, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy - 8);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedId, currentMonster, enemyProg.tier]);

  if (!isOpen) return null;

  // Stats for the encyclopedia overview
  const totalMonsters = Object.keys(ENEMIES).length;
  const discoveredCount = Object.keys(ENEMIES).filter((id) => (bestiaryKills[id] || 0) > 0).length;
  const fullyMasteredCount = Object.keys(ENEMIES).filter((id) => {
    const k = bestiaryKills[id] || 0;
    return getEnemyProgress(id, k).isUnlocked;
  }).length;

  return (
    <div className="overlay" style={{ zIndex: 30 }}>
      <div className="panel" style={{ maxWidth: '960px', width: '95%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0' }}>📖 Bestiář nočního venkova Josefa Lady</h2>
            <p style={{ fontWeight: 700, margin: '0 0 8px 0', fontSize: '0.94rem' }}>
              Encyklopedie {totalMonsters} lidových strašidel, diblíků a obrů. Zkoumejte jejich slabiny, folklorní pověsti a záznamy střetnutí.
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
            ✕
          </button>
        </div>

        {/* Global Progress Banner */}
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
            fontSize: '0.88rem',
            fontWeight: 900,
            color: '#111111',
          }}
        >
          <span>
            🔍 Spatřeno strašidel: <strong>{discoveredCount} / {totalMonsters}</strong>
          </span>
          <span>
            🏆 Zcela probádáno (100 %): <strong>{fullyMasteredCount} / {totalMonsters}</strong>
          </span>
          <span style={{ color: '#2A170A', fontWeight: 900 }}>
            📜 Úrovně odhalení: 0 % ➔ 25 % ➔ 50 % ➔ 75 % ➔ 100 %
          </span>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div className="bestiary-container">
          {/* Monster List */}
          <div className="bestiary-list">
            {monsterList.map((m) => {
              const k = bestiaryKills[m.id] || 0;
              const prog = getEnemyProgress(m.id, k);
              const isSelected = m.id === currentMonster.id;
              return (
                <button
                  key={m.id}
                  className={`bestiary-item-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    background: isSelected ? 'var(--mustard)' : prog.tier === 4 ? '#ECFDF5' : prog.tier === 0 ? '#F3F4F6' : undefined,
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
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, color: prog.tier === 4 ? '#065F46' : '#2A170A' }}>
                      {prog.tier === 4 ? '✅ 100 %' : prog.tier === 0 ? '🔒 0 %' : `${prog.percent} %`}
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#111111' }}>💀 {k}×</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Monster Detail Card */}
          <div className="bestiary-detail-card">
            {/* Header with tier badge */}
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

              {/* Progress pill indicator */}
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
                }}
              >
                {enemyProg.isUnlocked
                  ? '✅ ZCELA PROBÁDÁNO'
                  : `VÝZKUM: ${enemyProg.kills} / ${enemyProg.maxKills} (${enemyProg.percent} %)`}
              </div>
            </div>

            {/* Canvas illustration with visual stage */}
            <div className="bestiary-canvas-wrap">
              <canvas ref={previewCanvasRef} width={180} height={180} className="bestiary-canvas" />
            </div>

            {/* Study Progress Bar (0% - 25% - 50% - 75% - 100%) */}
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
                <span className={`hunter-tick ${enemyProg.percent >= 25 ? 'reached' : ''}`}>
                  {enemyProg.percent >= 25 ? '✓' : '🔒'} 25%
                </span>
                <span className={`hunter-tick ${enemyProg.percent >= 50 ? 'reached' : ''}`}>
                  {enemyProg.percent >= 50 ? '✓' : '🔒'} 50%
                </span>
                <span className={`hunter-tick ${enemyProg.percent >= 75 ? 'reached' : ''}`}>
                  {enemyProg.percent >= 75 ? '✓' : '🔒'} 75%
                </span>
                <span className={`hunter-tick ${enemyProg.percent >= 100 ? 'reached' : ''}`}>
                  {enemyProg.percent >= 100 ? '✓' : '🔒'} 100%
                </span>
              </div>
            </div>

            {/* Tags / Stats */}
            <div className="bestiary-tags">
              <span className="tag-badge tag-weak">Nebezpečnost: {enemyProg.spoiledStats.danger}</span>
              <span className="tag-badge tag-neutral">💀 Přemoženo: {enemyProg.kills}×</span>
              <span className="tag-badge" style={{ background: '#E2E8F0', color: 'var(--ink)' }}>
                ❤️ {enemyProg.spoiledStats.hp}
              </span>
              <span className="tag-badge" style={{ background: '#FEF3C7', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <KrejcarIcon size={16} /> {enemyProg.spoiledStats.coinValue}
              </span>
              {enemyProg.tier >= 2 && (
                <span className="tag-badge" style={{ background: '#FEF9C3', color: '#854D0E' }}>
                  🥐 Hlad: {Math.round((1 - (currentMonster.hunger ?? currentMonster.foodResist ?? 0)) * 100)} %
                </span>
              )}
              {enemyProg.tier >= 3 && (
                <span className="tag-badge" style={{ background: '#E0E7FF', color: 'var(--ink)' }}>
                  ⚡ Rychlost: {enemyProg.spoiledStats.speed}
                </span>
              )}
            </div>

            {/* Lore */}
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
              📜 „Z kroniky Ladova kraje: {enemyProg.tier >= 2 ? 'Kdo chce přemoci tohoto tvora, musí znát jeho zvyky a nenechat se překvapit nočním přepadem.' : 'Kronikáři zatím shromažďují zkazky o tomto tajemném nočním úkazu.'}“
            </div>

            {/* Weakness & Strength */}
            <div style={{ borderTop: '2px dashed #bbb', paddingTop: '10px', marginTop: '10px', fontSize: '0.92rem' }}>
              <div>
                <strong style={{ color: '#166534' }}>🌿 Slabiny:</strong>{' '}
                <span style={{ color: enemyProg.tier >= 2 ? '#166534' : '#6B7280', fontWeight: 700 }}>
                  {enemyProg.spoiledWeakness}
                </span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong style={{ color: '#991b1b' }}>⚠️ Přednosti a záludnosti:</strong>{' '}
                <span style={{ color: enemyProg.tier >= 3 ? '#991b1b' : '#6B7280', fontWeight: 700 }}>
                  {enemyProg.spoiledStrength}
                </span>
              </div>
            </div>
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
