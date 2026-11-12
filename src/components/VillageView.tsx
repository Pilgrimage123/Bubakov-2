import React, { useEffect, useRef } from 'react';
import { sound } from '../audio';
import { Lada } from '../render/ladaRenderer';
import { KrejcarIcon } from './KrejcarIcon';
import { GameIcon } from './GameIcon';
import {
  VILLAGE_BUILDINGS,
  getVillageTotalLevels,
  calculateTotalVillageInvested,
  VILLAGE_TAX_RATE
} from '../data/village';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';
import type { MetaProgression } from '../types';

export interface VillageViewProps {
  meta: MetaProgression;
  onUpgrade: (key: keyof MetaProgression, cost: number) => void;
  onRefundAll?: () => void;
  onClose?: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ meta, onUpgrade, onRefundAll, onClose }) => {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const metaRef = useRef<MetaProgression>(meta);
  metaRef.current = meta;
  const hoveredIdRef = useRef<string | null>(null);
  const upgradeBurstsRef = useRef<Record<string, number>>({});
  const animStateRef = useRef<
    Record<string, { phase: number; speed: number; highlightAlpha: number }>
  >({});

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      lastTime = now;

      const currentMeta = metaRef.current;
      const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
      const logicalW = 300;
      const logicalH = 140;

      VILLAGE_BUILDINGS.forEach((b, idx) => {
        const c = canvasRefs.current[b.id];
        if (!c) return;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        const targetW = Math.round(logicalW * dpr);
        const targetH = Math.round(logicalH * dpr);
        if (c.width !== targetW || c.height !== targetH) {
          c.width = targetW;
          c.height = targetH;
        }

        let st = animStateRef.current[b.id];
        if (!st) {
          st = { phase: idx * 0.85, speed: 1, highlightAlpha: 0 };
          animStateRef.current[b.id] = st;
        }

        const burstStart = upgradeBurstsRef.current[b.id] || 0;
        const burstAge = burstStart > 0 ? now - burstStart : Infinity;
        const isBursting = burstAge < 1500;
        const isHovered = hoveredIdRef.current === b.id;
        const isHighlighted = isHovered || isBursting;

        const burstBoost = isBursting ? Math.max(0, 1 - burstAge / 1500) * 0.95 : 0;
        const targetSpeed = (isHovered ? 1.42 : 1.0) + burstBoost;
        const lerpFactor = 1 - Math.exp(-dt * 9);
        st.speed += (targetSpeed - st.speed) * lerpFactor;
        st.phase += dt * st.speed;

        const targetHighlight = isHighlighted ? 1 : 0;
        st.highlightAlpha += (targetHighlight - st.highlightAlpha) * (1 - Math.exp(-dt * 10));

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, logicalW, logicalH);

        const lvl = (currentMeta[b.levelKey] as number) || 0;
        const drawer = (Lada as any)[b.canvasDrawer];
        if (typeof drawer === 'function') {
          drawer.call(
            Lada,
            ctx,
            logicalW,
            logicalH,
            st.phase,
            lvl,
            isHighlighted || st.highlightAlpha > 0.15
          );
        }
        ctx.restore();
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
            <LadaFolkFlower variant="buttercup" size={18} spin />
            <span>Hospodská pokladna:</span> <strong style={{ color: '#78350F', fontVariantNumeric: 'tabular-nums' }}>{meta.krejcary}</strong> krejcarů{' '}
            <KrejcarIcon size={18} />
            <LadaFolkFlower variant="cornflower" size={18} spin="reverse" />
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <GameIcon icon="amphora" size={20} /> Osvobozeno dušiček: <strong style={{ color: '#1E40AF', fontVariantNumeric: 'tabular-nums' }}>{meta.totalSoulsSaved || 0}</strong>
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
              <GameIcon icon="refresh" size={16} /> Vrátit krejcary ({totalInvested} <KrejcarIcon size={15} />)
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
          Každé vylepšení zvedne obecní přirážku o +20 %. Investice lze kdykoli zdarma vrátit.
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
            <div
              key={b.id}
              className="vignette-card"
              onMouseEnter={() => {
                hoveredIdRef.current = b.id;
              }}
              onMouseLeave={() => {
                if (hoveredIdRef.current === b.id) {
                  hoveredIdRef.current = null;
                }
              }}
            >
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
                  color: '#2A170A',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  color: '#78350F',
                  marginBottom: '6px',
                  overflowWrap: 'break-word',
                }}
              >
                Pomocníci: {b.helpers}
              </div>
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  minHeight: '44px',
                  color: '#111111',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {b.story}
              </div>
              <div className="vignette-craft-action" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <span className="vignette-level-badge">
                    (Úr. {lvl})
                  </span>
                  <div className="vignette-bonus-desc" style={{ overflowWrap: 'break-word' }}>{b.bonusDesc(lvl)}</div>
                </div>
                <button
                  className="vignette-buy-btn"
                  disabled={!canAfford}
                  style={{ whiteSpace: 'normal', textAlign: 'center' }}
                  onClick={() => {
                    upgradeBurstsRef.current[b.id] = performance.now();
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
