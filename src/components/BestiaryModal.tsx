import React, { useState, useEffect, useRef } from 'react';
import { ENEMIES } from '../data/enemies';
import { Lada } from '../render/ladaRenderer';
import { EnemyCategory } from '../types';
import { sound } from '../audio';

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

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedId, currentMonster]);

  if (!isOpen) return null;

  const kills = bestiaryKills[currentMonster.id] || 0;

  return (
    <div className="overlay" style={{ zIndex: 30 }}>
      <div className="panel" style={{ maxWidth: '920px', width: '95%' }}>
        <h2>📖 Bestiář nočního venkova Josefa Lady</h2>
        <p style={{ fontWeight: 700, marginTop: '-8px', marginBottom: '12px' }}>
          Encyklopedie 32 lidových strašidel, diblíků a obrů. Zkoumejte jejich slabiny, folklorní pověsti a záznamy střetnutí.
        </p>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '14px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`btn-small lada-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{
                margin: '2px',
                padding: '4px 10px',
                fontSize: '0.85rem',
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
              const isSelected = m.id === currentMonster.id;
              return (
                <button
                  key={m.id}
                  className={`bestiary-item-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(m.id);
                    sound.slash();
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{m.name}</span>
                  <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>💀 {k}×</span>
                </button>
              );
            })}
          </div>

          {/* Monster Detail Card */}
          <div className="bestiary-detail-card">
            <div className="bestiary-canvas-wrap">
              <canvas ref={previewCanvasRef} width={180} height={180} className="bestiary-canvas" />
            </div>

            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', color: 'var(--wood-dark)' }}>{currentMonster.name}</h2>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--mustard)', marginBottom: '8px' }}>
              {currentMonster.title}
            </div>

            <div className="bestiary-tags">
              <span className="tag-badge tag-weak">Nebezpečnost: {currentMonster.danger}</span>
              <span className="tag-badge tag-neutral">💀 Přemoženo: {kills}×</span>
              <span className="tag-badge" style={{ background: '#E2E8F0', color: 'var(--ink)' }}>
                ❤️ {currentMonster.hp} HP
              </span>
              <span className="tag-badge" style={{ background: '#FEF3C7', color: 'var(--ink)' }}>
                💰 {currentMonster.coinValue} 🪙
              </span>
            </div>

            <p style={{ fontWeight: 700, lineHeight: 1.35, margin: '10px 0' }}>{currentMonster.lore}</p>

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
              📜 „Z kroniky Ladova kraje: Proti tomuto tvoru se nejlépe osvědčily poctivé zbraně a odvaha venkovanů.“
            </div>

            <div style={{ borderTop: '2px dashed #bbb', paddingTop: '10px', marginTop: '10px', fontSize: '0.92rem' }}>
              <div>
                <strong style={{ color: '#166534' }}>🌿 Slabiny:</strong> {currentMonster.weakness}
              </div>
              <div style={{ marginTop: '4px' }}>
                <strong style={{ color: '#991b1b' }}>⚠️ Přednosti:</strong> {currentMonster.strength}
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
