import React, { useEffect, useRef } from 'react';
import { VILLAGE_BUILDINGS } from '../data/village';
import { MetaProgression } from '../types';
import { Lada } from '../render/ladaRenderer';
import { sound } from '../audio';

interface VillageViewProps {
  meta: MetaProgression;
  onUpgrade: (key: keyof MetaProgression, cost: number) => void;
  onClose: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ meta, onUpgrade, onClose }) => {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      VILLAGE_BUILDINGS.forEach((b) => {
        const c = canvasRefs.current[b.id];
        if (c) {
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, c.width, c.height);
            const drawer = (Lada as any)[b.canvasDrawer];
            if (typeof drawer === 'function') {
              drawer.call(Lada, ctx, c.width, c.height, elapsed);
            }
          }
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const regenCost = 50 * ((meta.regenLevel || 0) + 1);

  return (
    <div style={{ marginTop: '10px' }}>
      <div
        style={{
          background: 'var(--parchment)',
          color: 'var(--ink)',
          border: '4px solid var(--ink)',
          padding: '14px 20px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'left',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '1.45rem',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span>
            Hospodská pokladna:{' '}
            <strong style={{ color: 'var(--mustard)', textShadow: '1px 1px 0 var(--ink)' }}>
              {meta.krejcary}
            </strong>{' '}
            krejcarů 🪙
          </span>
          <span>
            🏺 Osvobozeno dušiček:{' '}
            <strong style={{ color: 'var(--water-blue)', textShadow: '1px 1px 0 var(--ink)' }}>
              {meta.totalSoulsSaved || 0}
            </strong>
          </span>
        </h3>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
          Každé vylepšení cechu rozšiřuje naši vesnici a trvale posílí vašeho lovce do všech nočních výprav!
        </p>
      </div>

      {/* Buildings Grid */}
      <div className="vignettes-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {VILLAGE_BUILDINGS.map((b) => {
          const lvl = (meta[b.levelKey] as number) || 0;
          const cost = b.cost(lvl);
          const canAfford = meta.krejcary >= cost;

          return (
            <div key={b.id} className="vignette-card">
              <canvas
                ref={(el) => {
                  canvasRefs.current[b.id] = el;
                }}
                className="vig-canvas"
                width={300}
                height={140}
              />
              <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '4px', color: 'var(--wood-dark)' }}>
                {b.name}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--mustard)', marginBottom: '6px' }}>
                🤝 Pomocníci: {b.helpers}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.25, minHeight: '44px' }}>
                {b.story}
              </div>

              <div className="vignette-craft-action">
                <div>
                  <span className="vignette-level-badge">(Úr. {lvl})</span>
                  <div className="vignette-bonus-desc">{b.bonusDesc(lvl)}</div>
                </div>
                <button
                  className="vignette-buy-btn"
                  disabled={!canAfford}
                  onClick={() => {
                    onUpgrade(b.levelKey, cost);
                    sound.coin();
                    sound.levelUp();
                  }}
                >
                  Vylepšit ({cost})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tavern Beer Regen Upgrade */}
      <div
        style={{
          background: 'var(--parchment)',
          color: 'var(--ink)',
          border: '4px solid var(--ink)',
          padding: '14px 20px',
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'left',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ fontSize: '1.25rem' }}>🍺 Tekutá kuráž z pivovarských ležáků</strong>{' '}
            <span style={{ fontWeight: 900, color: 'var(--leaf-green)' }}>(Úr. {meta.regenLevel || 0})</span>
            <br />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Přidá trvalou regeneraci +1 HP za každých 5 sekund pro všechny další výpravy do Bubákova.
            </span>
          </div>
          <button
            className="lada-btn"
            style={{ margin: 0 }}
            disabled={meta.krejcary < regenCost}
            onClick={() => {
              onUpgrade('regenLevel', regenCost);
              sound.coin();
              sound.levelUp();
            }}
          >
            Koupit ({regenCost} 🪙)
          </button>
        </div>
      </div>
    </div>
  );
};
