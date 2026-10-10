import React, { useEffect, useRef } from 'react';
import { sound } from '../audio';
import { Lada } from '../render/ladaRenderer';
import { KrejcarIcon } from './KrejcarIcon';
import {
  VILLAGE_BUILDINGS,
  getVillageTotalLevels,
  calculateTotalVillageInvested,
  VILLAGE_TAX_RATE
} from '../data/village';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import type { MetaProgression } from '../types';

export interface VillageViewProps {
  meta: MetaProgression;
  onUpgrade: (key: keyof MetaProgression, cost: number) => void;
  onRefundAll?: () => void;
  onClose?: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ meta, onUpgrade, onRefundAll, onClose }) => {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      VILLAGE_BUILDINGS.forEach((b) => {
        const c = canvasRefs.current[b.id];
        if (c) {
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, c.width, c.height);
            const drawer = (Lada as any)[b.canvasDrawer];
            if (typeof drawer === 'function') drawer.call(Lada, ctx, c.width, c.height, elapsed);
          }
        }
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const totalVillageLevels = getVillageTotalLevels(meta);
  const taxPercent = Math.round(totalVillageLevels * VILLAGE_TAX_RATE * 100);
  const totalInvested = calculateTotalVillageInvested(meta);

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Header Info Panel */}
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
          position: 'relative'
        }}
      >
        <LadaCardCorners variant="callout" />
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '1.45rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            color: '#111111'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Hospodská pokladna: <strong style={{ color: '#78350F' }}>{meta.krejcary}</strong> krejcarů{' '}
            <KrejcarIcon size={18} />
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            🏺 Osvobozeno dušiček: <strong style={{ color: '#1E40AF' }}>{meta.totalSoulsSaved || 0}</strong>
          </span>
        </h3>

        {/* Village progress & tax panel */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '2px dashed #D97706'
          }}
        >
          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#111111' }}>
            <span>Rozvoj vsi: <strong style={{ color: '#166534' }}>{totalVillageLevels} úrovní</strong></span>
            <span style={{ margin: '0 8px', color: '#9CA3AF' }}>•</span>
            <span>
              Obecní přirážka:{' '}
              <strong style={{ color: taxPercent > 0 ? '#B45309' : '#166534' }}>
                +{taxPercent} %
              </strong>
            </span>
          </div>

          {onRefundAll && (
            <button
              className="lada-btn"
              disabled={totalVillageLevels === 0}
              onClick={() => {
                onRefundAll();
                sound.coin();
              }}
              style={{
                margin: 0,
                fontSize: '0.90rem',
                padding: '6px 14px',
                cursor: totalVillageLevels === 0 ? 'not-allowed' : 'pointer',
                opacity: totalVillageLevels === 0 ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Vrátí 100 % všech utracených krejcarů a vynuluje úrovně budov pro nové přerozdělení"
            >
              🔄 Vrátit krejcary ({totalInvested} <KrejcarIcon size={15} />)
            </button>
          )}
        </div>

        <p
          style={{
            margin: '8px 0 0 0',
            fontWeight: 700,
            fontSize: '0.90rem',
            color: '#4B5563'
          }}
        >
          Každé zakoupené vylepšení ve vsi posílí lovce a zároveň zvedne obecní přirážku o +15 % k ceně všech budov.
          Investice můžete kdykoliv bezplatně vrátit!
        </p>
      </div>

      <LadaBotanicalFlourish height={20} />

      {/* Buildings Grid */}
      <div
        className="vignettes-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}
      >
        {VILLAGE_BUILDINGS.map((b) => {
          const lvl = (meta[b.levelKey] as number) || 0;
          const cost = b.cost(lvl, totalVillageLevels);
          const canAfford = meta.krejcary >= cost;

          return (
            <div key={b.id} className="vignette-card">
              <LadaCardCorners variant="default" showBottomCorners={true} />
              <canvas
                ref={(el) => {
                  canvasRefs.current[b.id] = el;
                }}
                className="vig-canvas"
                width={300}
                height={140}
              />
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  marginBottom: '4px',
                  color: '#2A170A'
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  color: '#78350F',
                  marginBottom: '6px'
                }}
              >
                🤝 Pomocníci: {b.helpers}
              </div>
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  minHeight: '44px',
                  color: '#111111'
                }}
              >
                {b.story}
              </div>
              <div className="vignette-craft-action">
                <div>
                  <span className="vignette-level-badge">
                    (Úr. {lvl})
                  </span>
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
                  Vylepšit ({cost} <KrejcarIcon size={14} />)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
