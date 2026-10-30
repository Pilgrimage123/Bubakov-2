import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { Lada, drawValecniceCompanion } from '../render/ladaRenderer';
import { GameIcon } from './GameIcon';
import { WEAPON_UNLOCKS, type WeaponProgress } from '../data/weaponUnlocks';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';

export const ValecnicePreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWhacking, setIsWhacking] = useState(false);
  const [, setWhackCount] = useState(0);

  const triggerWhack = useCallback(() => {
    setIsWhacking(true);
    setWhackCount((c) => c + 1);
    if (typeof (sound as any).valecWhack === 'function') {
      (sound as any).valecWhack();
    } else {
      sound.heavyHit();
    }
    setTimeout(() => setIsWhacking(false), 380);
  }, []);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Soft decorative background parchment circle
          ctx.save();
          ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2 + 10, 52, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // Draw Válečnice in center
          ctx.save();
          drawValecniceCompanion(
            ctx,
            canvas.width / 2,
            canvas.height / 2 + 6,
            elapsed * 2.4,
            0,
            elapsed,
            1.71,
            isWhacking
          );
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isWhacking]);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        border: '3px solid var(--ink)',
        borderRadius: '12px',
        padding: '14px 16px',
        margin: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '3px 3px 0 var(--ink)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '100px',
              height: '92px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '2.5px solid var(--ink)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            <canvas ref={canvasRef} width={180} height={160} style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: '#78350F', fontSize: '1.15rem' }}>
              Rázná venkovská hospodyňka Válečnice
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#92400E',
                marginTop: '3px',
                lineHeight: 1.35,
              }}
            >
              Věrná rázná společnice obíhá lovce s bukovým válečkem (+40 % zvětšený model), omračuje bubáky na
              1,2 s a zónou zpomalení chrání celý obvod!
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="hud-btn"
            style={{
              padding: '8px 16px',
              fontSize: '0.92rem',
              fontWeight: 900,
              background: '#F59E0B',
              borderColor: 'var(--ink)',
              color: '#1E140C',
              boxShadow: '2px 2px 0 var(--ink)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={triggerWhack}
          >
            <GameIcon icon="log" size={16} /> Bácnout válečkem!
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.75)',
          border: '2px solid var(--ink)',
          borderRadius: '8px',
          padding: '10px 12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="impact" size={12} /> Poškození
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#991B1B' }}>32 (fyzické)</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="clock" size={12} /> Kadence úderů
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#1E293B' }}>0,75 s</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="star" size={12} /> Omráčení (Stun)
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#D97706' }}>1,2 s</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="wind" size={12} /> Zpomalení (Zóna +15 %)
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#EA580C' }}>25 % (dle Vůle)</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="shield" size={12} /> Ignorace resistu
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#15803D' }}>20 %</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="compass" size={12} /> Dosah zásahu
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#0369A1' }}>58 px (+60 %)</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="impact" size={12} /> Odhození
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#B45309' }}>520 (důrazné)</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="target" size={12} /> Poloměr hlídky
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#7C3AED' }}>115 px (kruh)</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#78350F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GameIcon icon="granny" size={12} /> Měřítko postavy
          </span>
          <strong style={{ fontSize: '0.98rem', color: '#DC2626' }}>+40 % (scale 1,71)</strong>
        </div>
      </div>
    </div>
  );
};

export const CaneWhipPreview: React.FC<{ soaked?: boolean }> = ({ soaked = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const slashRef = useRef<any>({
    reach: 82,
    arc: 1.45,
    angle: 0,
    life: 0,
    maxLife: 0.32,
    swingDir: 1,
    soaked,
  });
  const [activeSoaked, setActiveSoaked] = useState(soaked);
  const [, setWhipCount] = useState(0);

  const triggerWhip = useCallback(() => {
    slashRef.current = {
      reach: 82,
      arc: 1.45,
      angle: 0,
      life: 0.32,
      maxLife: 0.32,
      swingDir: slashRef.current.swingDir === 1 ? -1 : 1,
      soaked: activeSoaked,
    };
    setWhipCount((c) => c + 1);
    if (typeof (sound as any).caneWhip === 'function') {
      (sound as any).caneWhip(activeSoaked);
    } else {
      sound.slash();
    }
  }, [activeSoaked]);

  useEffect(() => {
    let animId: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Soft decorative background parchment circle
          ctx.save();
          ctx.fillStyle = 'rgba(239, 230, 213, 0.4)';
          ctx.strokeStyle = 'rgba(43, 24, 16, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          const s = slashRef.current;
          s.soaked = activeSoaked;
          if (s.life > 0) {
            s.life -= dt;
            ctx.save();
            ctx.translate(canvas.width / 2 - 25, canvas.height / 2);
            Lada.drawOsikovyPrutSlash(ctx, s);
            ctx.restore();
          } else {
            // Subtle idle display
            ctx.save();
            ctx.translate(canvas.width / 2 - 25, canvas.height / 2);
            const idleS = {
              reach: 82,
              arc: 1.45,
              angle: 0,
              life: 0.18,
              maxLife: 0.32,
              swingDir: 1,
              soaked: activeSoaked,
            };
            ctx.globalAlpha = 0.88;
            Lada.drawOsikovyPrutSlash(ctx, idleS);
            ctx.restore();
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeSoaked]);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
        border: '3px solid var(--ink)',
        borderRadius: '12px',
        padding: '12px 16px',
        margin: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '3px 3px 0 var(--ink)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '2px solid var(--ink)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <canvas ref={canvasRef} width={150} height={120} style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: '#78350F', fontSize: '1.08rem' }}>
              Ohebný osikový prut s pupeny
            </div>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#92400E',
                marginTop: '2px',
                lineHeight: 1.35,
              }}
            >
              Pružný sečný švih s dynamickým prohnutím dřeva, vějířem větru, inkoustovými čárami a prásknutím
              špičky!
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            className="hud-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 900,
              background: '#22C55E',
              borderColor: 'var(--ink)',
              color: '#FFFFFF',
              boxShadow: '2px 2px 0 var(--ink)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={triggerWhip}
          >
            <GameIcon icon="cane" size={16} /> Švihnout prutem!
          </button>
          <button
            type="button"
            style={{
              padding: '4px 8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: activeSoaked ? '#0284C7' : '#E2E8F0',
              color: activeSoaked ? '#FFFFFF' : '#1E293B',
              border: '1.5px solid var(--ink)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onClick={() => setActiveSoaked(!activeSoaked)}
          >
            <GameIcon icon={activeSoaked ? 'water' : 'basket'} size={13} />
            {activeSoaked ? 'Mokrý prut (aktivní)' : 'Namočit prut'}
          </button>
        </div>
      </div>
    </div>
  );
};

export interface WeaponUnlockModalProps {
  progress: WeaponProgress | null;
  onClose: () => void;
}

export const WeaponUnlockModal: React.FC<WeaponUnlockModalProps> = ({ progress, onClose }) => {
  if (!progress) return null;
  const def = WEAPON_UNLOCKS[progress.id];
  const milestonesList = [
    {
      pct: 25,
      tier: 1,
      title: '25 % – První stopa a tvar zbraně',
      desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledStatsHint || '',
      reached: progress.percent >= 25,
    },
    {
      pct: 50,
      tier: 2,
      title: '50 % – Skica a odhalení mechaniky útoku',
      desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledStatsHint || '',
      reached: progress.percent >= 50,
    },
    {
      pct: 75,
      tier: 3,
      title: '75 % – Téměř ukováno a přesná síla',
      desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledDesc || '',
      stats: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledStatsHint || '',
      reached: progress.percent >= 75,
    },
    {
      pct: 100,
      tier: 4,
      title: '100 % – Plné odemčení do arzenálu',
      desc: `Zbraň ${def?.realName || ''} se trvale přidá k výběru vylepšení při postupu na novou úroveň!`,
      stats: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledStatsHint || '',
      reached: progress.isUnlocked || progress.percent >= 100,
    },
  ];

  const isBuns = progress.id === 'buns' || progress.id === 'povidlove_buchty';
  const isCane = progress.id === 'cane' || progress.id === 'osikovy_prut';
  const isValecnice = progress.id === 'valecnice';

  return (
    <div className="overlay" style={{ zIndex: 50 }} onClick={onClose}>
      <div
        className="panel"
        style={{
          maxWidth: '660px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LadaCardCorners variant="callout" showBottomCorners={true} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: progress.isUnlocked
                  ? 'var(--mustard)'
                  : progress.tier === 0
                  ? '#1A1510'
                  : progress.tier === 1
                  ? '#3A2818'
                  : progress.tier === 2
                  ? '#785A35'
                  : '#D9A036',
                border: '3px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: progress.tier === 0 ? '2.2rem' : '2.4rem',
                boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), 3px 3px 0 var(--ink)',
                filter:
                  progress.tier === 0
                    ? 'grayscale(1) brightness(0.4)'
                    : progress.tier === 1
                    ? 'contrast(150%) brightness(0.6)'
                    : 'none',
              }}
            >
              <GameIcon
                icon={progress.tier === 0 ? 'question' : progress.realIcon}
                size={isBuns ? 52 : '2.4rem'}
              />
            </div>
            <div>
              <span
                className={`hunter-tier-stamp tier-stamp-${progress.tier}`}
                style={{ fontSize: '0.8rem' }}
              >
                {progress.clueTag}
              </span>
              <h2
                style={{
                  margin: '2px 0 1px 0',
                  fontSize: '1.75rem',
                  color: '#8B1E0F',
                  textShadow: '1px 1px 0 rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <LadaFolkFlower variant="buttercup" size={18} spin />
                <span>{progress.spoiledName}</span>
                <LadaFolkFlower variant="poppy" size={18} spin="reverse" />
              </h2>
              <div style={{ fontWeight: 900, color: '#3D2210', fontSize: '0.98rem' }}>
                {progress.spoiledTitle}
              </div>
              <LadaBotanicalFlourish height={16} />
            </div>
          </div>
          <button
            className="tab-btn"
            style={{ padding: '6px 12px', fontSize: '1.2rem', minWidth: 'auto' }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            <GameIcon icon="cross" size={16} />
          </button>
        </div>

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
                Výzva k ukování je zatím uzamčena!
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350F', marginTop: '2px' }}>
                Nová zbraň se nikdy nezačne odemykat, dokud není odemčena zbraň před ní. Kovář začne tuto zbraň
                kalit teprve po odemčení zbraně: <strong>{progress.requiredWeaponName}</strong>.
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#B45309',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <GameIcon icon="impact" size={14} /> Pořadí kovářské dílny: Vidle{' '}
                <GameIcon icon="arrow" size={11} /> Halapartna{' '}
                <GameIcon icon="arrow" size={11} /> Cep{' '}
                <GameIcon icon="arrow" size={11} /> Byliny{' '}
                <GameIcon icon="arrow" size={11} /> Sněhová koule{' '}
                <GameIcon icon="arrow" size={11} /> Koláč{' '}
                <GameIcon icon="arrow" size={11} /> Brambor{' '}
                <GameIcon icon="arrow" size={11} /> Včely{' '}
                <GameIcon icon="arrow" size={11} /> Svěcená voda
              </div>
            </div>
          </div>
        )}

        {isBuns && (
          <div
            style={{
              background: '#FFFBEB',
              border: '3px solid #B45309',
              borderRadius: '10px',
              padding: '12px 16px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '3px 3px 0 var(--ink)',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: '96px',
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CzechBuchtaIcon size={84} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#78350F', fontSize: '1.08rem' }}>
                Tradiční česká pečená buchta s povidly
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#92400E',
                  marginTop: '2px',
                  lineHeight: 1.35,
                }}
              >
                Zlatavá kynutá buchta upečená v pekáči do křupava, poprášená jemným moučkovým cukrem a plněná
                lahodným švestkovým povidlem.
              </div>
            </div>
          </div>
        )}

        {isCane && <CaneWhipPreview />}
        {isValecnice && <ValecnicePreview />}

        <div
          style={{
            background: 'var(--parchmentDark)',
            border: '3px solid var(--ink)',
            borderRadius: '10px',
            padding: '12px 16px',
            margin: '14px 0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111111' }}>{def?.challengeTitle}</h3>
            <span
              style={{
                background: progress.isUnlocked
                  ? 'var(--leaf-green)'
                  : progress.isQueued
                  ? 'var(--wood-dark)'
                  : '#2A170A',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.82rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1.5px solid var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {progress.isUnlocked ? (
                <>
                  <GameIcon icon="checkmark" size={12} /> ODEMČENO
                </>
              ) : progress.isQueued ? (
                <>
                  <GameIcon icon="padlock" size={12} /> ČEKÁ NA: {progress.requiredWeaponName?.toUpperCase()}
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
          <div className="hunter-progress-bar-outer" style={{ height: '16px' }}>
            <div
              className="hunter-progress-bar-fill"
              style={{
                width: `${progress.percent}%`,
                background: progress.isUnlocked ? 'linear-gradient(90deg, #10B981, #059669)' : undefined,
              }}
            />
          </div>
          <div className="hunter-progress-ticks" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            <span className={`hunter-tick ${progress.percent >= 0 ? 'reached' : ''}`}>0%</span>
            <span
              className={`hunter-tick ${progress.percent >= 25 ? 'reached' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              <GameIcon icon={progress.percent >= 25 ? 'checkmark' : 'padlock'} size={10} /> 25%
            </span>
            <span
              className={`hunter-tick ${progress.percent >= 50 ? 'reached' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              <GameIcon icon={progress.percent >= 50 ? 'checkmark' : 'padlock'} size={10} /> 50%
            </span>
            <span
              className={`hunter-tick ${progress.percent >= 75 ? 'reached' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              <GameIcon icon={progress.percent >= 75 ? 'checkmark' : 'padlock'} size={10} /> 75%
            </span>
            <span
              className={`hunter-tick ${progress.percent >= 100 ? 'reached' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              <GameIcon icon={progress.percent >= 100 ? 'checkmark' : 'padlock'} size={10} /> 100%
            </span>
          </div>

          {progress.enemiesBreakdown.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: '#111111',
                  marginBottom: '4px',
                }}
              >
                Zahnáni vybraní nepřátelé pro tuto zbraň:
              </div>
              <div className="hunter-enemy-pills">
                {progress.enemiesBreakdown.map((e) => (
                  <div
                    key={e.id}
                    className="hunter-enemy-pill"
                    style={{ padding: '3px 7px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <GameIcon icon={e.icon} size={15} />
                    <span>{e.name}:</span>
                    <strong style={{ color: '#111111' }}>{e.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <h4
          style={{
            margin: '12px 0 6px 0',
            fontSize: '1.1rem',
            color: '#2A170A',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <GameIcon icon="magnifier" size={18} /> Postupné odhalování zbraně (25 %, 50 % a 75 %):
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
                    fontSize: '0.88rem',
                    color: m.reached ? '#065F46' : '#2A170A',
                    minWidth: 0,
                    overflowWrap: 'break-word',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
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
                  fontSize: '0.85rem',
                  lineHeight: 1.3,
                  color: '#111111',
                  fontWeight: 600,
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {m.reached ? m.desc : 'Tato stopa a vlastnost se odhalí po dosažení tohoto milníku.'}
              </p>
              {m.reached && m.stats && (
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    color: '#2A170A',
                    marginTop: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <GameIcon icon="lightning" size={14} /> {m.stats}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button className="lada-btn" style={{ padding: '8px 22px' }} onClick={onClose}>
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
