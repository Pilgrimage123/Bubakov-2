import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sound } from '../audio';
import { ladaPageFoley } from './ladaPageTurnAudio';
import { GAME_LEVELS, type GameLevelDef } from '../data/levels';
import { HUNTER_UNLOCKS, getHunterProgress } from '../data/hunterUnlocks';
import { HUNTER_DETAILS, type HunterDetailKey } from '../data/hunterDetails';
import { ENEMIES, getEnemyCadenceInfo } from '../data/enemies';
import { WEAPONS } from '../data/weapons';
import { getWeaponProgress } from '../data/weaponUnlocks';
import { WEAPONS_WITH_MILESTONES } from '../data/weaponMilestones';
import { GameIcon } from './GameIcon';
import { LadaHunterCanvasPreview } from './LadaHunterCanvasPreview';
import { drawEnemyRenderer } from '../render/ladaRenderer';
import type { CharacterType, GameLevelId, MetaProgression } from '../types';

export type BookChapterTab = 'map' | 'inventory' | 'bestiary';
const CHAPTER_ORDER: BookChapterTab[] = ['map', 'inventory', 'bestiary'];

/**
 * Monotonic, Asymmetric 1940s 150gsm Wood-Pulp Paper Curve:
 * - 0.00 -> 0.35: Smooth corner lift and diagonal peel initiation.
 * - 0.35 -> 0.78: Brisk, weighty sweep across the central book spine.
 * - 0.78 -> 1.00: Air-cushion deceleration (softly pillows onto the page stack
 *   without ever reversing direction or jittering).
 */
export function evaluatePaperTurnCurve(rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // Smooth asymmetric ease-in-out with gentle air-cushion settle tail:
  // At t = 0.95, value is ~0.984 (strictly between 0.96 and 1.0, monotonically increasing)
  const easeInOut = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smoothQuint = 1 - Math.pow(1 - t, 3.4);
  return easeInOut * 0.55 + smoothQuint * 0.45;
}

function smoothstep01(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

/**
 * Computes the synchronized Diagonal Corner-Peel Curl geometry across the full
 * two-page book spread:
 * - Right Page local coordinates: x in [0% (spine) .. 100% (right outer edge)]
 * - Full Two-Page Spread coordinates: x in [0% (left outer edge) .. 50% (spine) .. 100% (right outer edge)]
 * Because creaseTopSpreadX = 50 + foldTopX * 0.5 and creaseBotSpreadX = 50 + foldBotX * 0.5,
 * the Outgoing Front Page (recto) and Folded Back-Of-Page (verso) share the EXACT same
 * diagonal crease line at every frame — zero detachment, zero gap, zero jarring!
 */
export interface PageTurnGeometry {
  progress: number; // 0..1
  effectiveP: number; // 0 (flat on right page) .. 1 (turned onto left page)
  direction: 'forward' | 'backward';
  peelXPercent: number; // 100% down to -100%
  peelYPercent: number;
  foldTopX: number; // 0..100% on right page
  foldBotX: number; // 0..100% on right page
  creaseTopSpreadX: number; // 50..100% across full 2-page spread
  creaseBotSpreadX: number; // 50..100% across full 2-page spread
  leadTopSpreadX: number; // 0..100% across full 2-page spread
  leadBotSpreadX: number; // 0..100% across full 2-page spread
  leadTopY: number; // 0..100%
  leadBotY: number; // 0..100%
  foldAngleDeg: number;
  archSkewYDeg: number; // Peaks at -3.5deg around 40% turn
  inkShowThroughOpacity: number; // 6% opacity between 25% and 75% of turn
  versoOpacity: number; // Smoothly settles into left page at end of turn
  rightLiftShadowOpacity: number;
  rightLiftShadowWidthPct: number;
  leftLandingShadowOpacity: number;
  leftLandingShadowWidthPct: number;
  spineCompression: number; // 0..1
  rectoClipPath: string;
  versoClipPath: string;
  versoPolygonSvgPoints: string;
}

export function computePageTurnGeometry(
  progress: number,
  direction: 'forward' | 'backward' = 'forward'
): PageTurnGeometry {
  const p = Math.max(0, Math.min(1, progress));
  // For forward turn (right -> left): effectiveP goes 0 -> 1.
  // For backward turn (left -> right): effectiveP goes 1 -> 0.
  const effectiveP = direction === 'forward' ? p : 1 - p;

  // Peel point X travels from +100% (bottom-right corner) across spine (0%) to -100% (bottom-left corner)
  const peelXPercent = 100 - effectiveP * 200;
  // Natural cylinder arch lift: bottom corner lifts up during mid-turn
  const archSin = Math.sin(effectiveP * Math.PI);
  const peelYPercent = 100 - archSin * 14;

  // Curved Paper Arch & Belly Deformation: skewY peaks at -3.5deg at 40% turn
  const skewEnvelope =
    effectiveP <= 0.4
      ? effectiveP / 0.4
      : Math.max(0, 1 - (effectiveP - 0.4) / 0.6);
  const archSkewYDeg = -3.5 * Math.sin(skewEnvelope * (Math.PI / 2));

  // Ink Show-Through (Průsvit tisku): 6% opacity between 20% and 80% of turn (peaking at 50%)
  let inkShowThroughOpacity = 0;
  if (effectiveP >= 0.2 && effectiveP <= 0.8) {
    const midDist = 1 - Math.abs(effectiveP - 0.5) / 0.3;
    inkShowThroughOpacity = Math.max(0, Math.min(1, midDist)) * 0.06;
  }

  // Diagonal crease line across the right page (100% = right edge, 0% = central spine):
  // Bottom corner leads the top corner so lifting from the bottom-right corner creates
  // a natural diagonal fold that smoothly straightens into the central spine (0%).
  const botCreaseT = smoothstep01(effectiveP / 0.74);
  const topCreaseT = smoothstep01(Math.max(0, (effectiveP - 0.04) / 0.80));

  const foldBotX = Math.max(0, Math.min(100, 100 * (1 - botCreaseT)));
  const foldTopX = Math.max(0, Math.min(100, 100 * (1 - topCreaseT)));

  // Convert crease line to Full Two-Page Spread coordinates (50% = spine, 100% = right outer edge)
  const creaseBotSpreadX = 50 + foldBotX * 0.5;
  const creaseTopSpreadX = 50 + foldTopX * 0.5;

  // Leading lifted edge of the turning page in Full Two-Page Spread coordinates (100% down to 0%):
  // Foreshortened in 3D while arched in mid-air, expanding to full 50% page width on landing.
  const peeledBotSpreadLen = (100 - foldBotX) * 0.5; // 0..50%
  const peeledTopSpreadLen = (100 - foldTopX) * 0.5; // 0..50%
  const projBot = 1 - 0.24 * Math.sin(effectiveP * Math.PI);
  const projTop = 1 - 0.20 * Math.sin(effectiveP * Math.PI);

  const leadBotSpreadX = Math.max(0, Math.min(100, creaseBotSpreadX - peeledBotSpreadLen * projBot));
  const leadTopSpreadX = Math.max(0, Math.min(100, creaseTopSpreadX - peeledTopSpreadLen * projTop));

  // Vertical arch lift of the leading page corners during mid-turn (3D cylinder arch)
  const leadBotY = 100 - archSin * 11.5;
  const leadTopY = archSin * 3.2;

  // Diagonal crease angle in degrees
  const dx = foldTopX - foldBotX;
  const foldAngleDeg = -(Math.atan2(dx, 100) * 180) / Math.PI;

  // Outgoing Front Page (recto) clip-path on Right Page [0..100%]:
  const rectoClipPath = `polygon(0% 0%, ${foldTopX.toFixed(2)}% 0%, ${foldBotX.toFixed(
    2
  )}% 100%, 0% 100%)`;

  // Folded Back-Of-Page (verso) clip-path across Full Two-Page Spread [0..100%]:
  // Notice that its right edge (creaseTopSpreadX -> creaseBotSpreadX) is locked 1:1
  // to the recto crease line (foldTopX -> foldBotX)!
  const versoClipPath = `polygon(${leadTopSpreadX.toFixed(2)}% ${leadTopY.toFixed(
    2
  )}%, ${creaseTopSpreadX.toFixed(2)}% 0%, ${creaseBotSpreadX.toFixed(
    2
  )}% 100%, ${leadBotSpreadX.toFixed(2)}% ${leadBotY.toFixed(2)}%)`;

  // SVG points in viewBox="0 0 200 100" for drawing crisp Josef Lada ink borders on the curl
  const versoPolygonSvgPoints = `${(leadTopSpreadX * 2).toFixed(2)},${leadTopY.toFixed(2)} ${(
    creaseTopSpreadX * 2
  ).toFixed(2)},0 ${(creaseBotSpreadX * 2).toFixed(2)},100 ${(leadBotSpreadX * 2).toFixed(
    2
  )},${leadBotY.toFixed(2)}`;

  // Smooth settle opacity on the Left Page (between effectiveP = 0.78 and 1.00)
  // so the turning leaf blends into the left page stack with zero pop on finish/start
  const versoOpacity =
    effectiveP <= 0.002
      ? 0
      : effectiveP < 0.78
      ? 1
      : 0.5 * (1 + Math.cos(((effectiveP - 0.78) / 0.22) * Math.PI));

  // Traveling Cast Shadow on Static Pages Beneath (warm dark umber rgba(42, 26, 14, 0.45))
  // 1. Right-Side Lift Shadow (0% to 68%)
  const rightLiftShadowOpacity =
    effectiveP > 0.002 && effectiveP < 0.72
      ? Math.sin((effectiveP / 0.72) * Math.PI) * 0.42
      : 0;
  const rightLiftShadowWidthPct = 8 + Math.sin(Math.min(1, effectiveP * 1.4) * Math.PI) * 26;

  // 2. Left-Side Landing Shadow (38% to 100%)
  const leftLandingShadowOpacity =
    effectiveP > 0.38 && effectiveP < 0.998
      ? Math.sin(((effectiveP - 0.38) / 0.62) * Math.PI) * 0.42
      : 0;
  const leftLandingShadowWidthPct = Math.max(
    6,
    Math.min(95, ((effectiveP - 0.32) / 0.68) * 92)
  );

  const spineCompression = archSin;

  return {
    progress: p,
    effectiveP,
    direction,
    peelXPercent,
    peelYPercent,
    foldTopX,
    foldBotX,
    creaseTopSpreadX,
    creaseBotSpreadX,
    leadTopSpreadX,
    leadBotSpreadX,
    leadTopY,
    leadBotY,
    foldAngleDeg,
    archSkewYDeg,
    inkShowThroughOpacity,
    versoOpacity,
    rightLiftShadowOpacity,
    rightLiftShadowWidthPct,
    leftLandingShadowOpacity,
    leftLandingShadowWidthPct,
    spineCompression,
    rectoClipPath,
    versoClipPath,
    versoPolygonSvgPoints,
  };
}

/**
 * Computes synchronized Diagonal Corner-Peel Curl geometry for a single-sheet
 * storybook page (`0%..100%` width, used in the "Jak hrát" handbook modal).
 * Both the outgoing front face (recto) and the curling back face (verso)
 * share the exact same diagonal crease line `(foldTopX, 0) -> (foldBotX, 100)`
 * in local `0%..100%` sheet coordinates.
 */
export function computeSingleSheetTurnGeometry(
  progress: number,
  direction: 'forward' | 'backward' = 'forward'
): PageTurnGeometry {
  const base = computePageTurnGeometry(progress, direction);
  const { effectiveP, foldTopX, foldBotX } = base;
  const archSin = Math.sin(effectiveP * Math.PI);

  const peeledBotLen = (100 - foldBotX) * (0.48 - 0.1 * archSin);
  const peeledTopLen = (100 - foldTopX) * (0.44 - 0.08 * archSin);

  const leadBotSpreadX = Math.max(0, Math.min(100, foldBotX - peeledBotLen));
  const leadTopSpreadX = Math.max(0, Math.min(100, foldTopX - peeledTopLen));
  const leadBotY = 100 - archSin * 10;
  const leadTopY = archSin * 2.8;

  const versoClipPath = `polygon(${leadTopSpreadX.toFixed(2)}% ${leadTopY.toFixed(
    2
  )}%, ${foldTopX.toFixed(2)}% 0%, ${foldBotX.toFixed(
    2
  )}% 100%, ${leadBotSpreadX.toFixed(2)}% ${leadBotY.toFixed(2)}%)`;

  const versoPolygonSvgPoints = `${leadTopSpreadX.toFixed(2)},${leadTopY.toFixed(
    2
  )} ${foldTopX.toFixed(2)},0 ${foldBotX.toFixed(2)},100 ${leadBotSpreadX.toFixed(
    2
  )},${leadBotY.toFixed(2)}`;

  const versoOpacity =
    effectiveP <= 0.002
      ? 0
      : effectiveP < 0.72
      ? 1
      : 0.5 * (1 + Math.cos(((effectiveP - 0.72) / 0.28) * Math.PI));

  return {
    ...base,
    creaseTopSpreadX: foldTopX,
    creaseBotSpreadX: foldBotX,
    leadTopSpreadX,
    leadBotSpreadX,
    leadTopY,
    leadBotY,
    versoOpacity,
    versoClipPath,
    versoPolygonSvgPoints,
  };
}

/**
 * Global SVG Filter & Pattern Definitions for the 1930s–1950s SNDK / Albatros
 * Josef Lada fairy-tale book aesthetic:
 * - #lada-ink-filter: Subtle feTurbulence + feDisplacementMap (scale="1.8") so every
 *   panel, frame, signpost, and divider looks hand-inked with a reed or steel nib pen.
 * - #lada-crosshatch: India-ink cross-hatched shading for Bestiary & woodcut frames.
 */
export const LadaBookSvgDefs: React.FC = () => (
  <svg
    aria-hidden="true"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
  >
    <defs>
      <filter id="lada-ink-filter" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.035"
          numOctaves="3"
          seed="11"
          result="inkNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="inkNoise"
          scale="1.8"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <filter id="lada-ink-jitter-hover" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.045"
          numOctaves="3"
          seed="23"
          result="jitterNoise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="jitterNoise"
          scale="2.4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <pattern
        id="lada-crosshatch"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(28)"
      >
        <line x1="0" y1="0" x2="0" y2="8" stroke="#1C1613" strokeWidth="1.1" strokeOpacity="0.18" />
        <line x1="0" y1="4" x2="8" y2="4" stroke="#1C1613" strokeWidth="0.9" strokeOpacity="0.12" />
      </pattern>

      <pattern
        id="lada-linen-weave"
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 0 3 L 6 3 M 3 0 L 3 6"
          stroke="#18261D"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      </pattern>
    </defs>
  </svg>
);

/**
 * 3-Line-Tall Boxed Woodcut Drop Cap (Iniciála)
 * Painted in Poppy Red (#C83E2B) and Golden Ochre (#E2A83B) with folk floral motifs.
 */
export const LadaDropCap: React.FC<{
  letter: string;
  variant?: 'poppy' | 'cobalt' | 'willow';
}> = ({ letter, variant = 'poppy' }) => {
  const bgFill =
    variant === 'cobalt' ? '#2B5B84' : variant === 'willow' ? '#4D784E' : '#C83E2B';
  const accentFill = '#E2A83B';

  return (
    <span className="lada-drop-cap" aria-hidden="true">
      <svg
        viewBox="0 0 64 64"
        className="lada-drop-cap-svg"
        style={{ filter: 'url(#lada-ink-filter)' }}
      >
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="6"
          fill={bgFill}
          stroke="#1C1613"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="7.5"
          y="7.5"
          width="49"
          height="49"
          rx="3.5"
          fill="none"
          stroke={accentFill}
          strokeWidth="2"
          strokeDasharray="6 2"
        />
        <path
          d="M 10 18 C 10 11, 17 10, 21 14 C 16 16, 12 15, 10 18 Z"
          fill={accentFill}
          stroke="#1C1613"
          strokeWidth="1.4"
        />
        <path
          d="M 54 18 C 54 11, 47 10, 43 14 C 48 16, 52 15, 54 18 Z"
          fill={accentFill}
          stroke="#1C1613"
          strokeWidth="1.4"
        />
        <path
          d="M 10 46 C 10 53, 17 54, 21 50 C 16 48, 12 49, 10 46 Z"
          fill={accentFill}
          stroke="#1C1613"
          strokeWidth="1.4"
        />
        <path
          d="M 54 46 C 54 53, 47 54, 43 50 C 48 48, 52 49, 54 46 Z"
          fill={accentFill}
          stroke="#1C1613"
          strokeWidth="1.4"
        />
        <circle cx="13" cy="13" r="2.2" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.2" />
        <circle cx="51" cy="13" r="2.2" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.2" />
        <circle cx="13" cy="51" r="2.2" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.2" />
        <circle cx="51" cy="51" r="2.2" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.2" />
      </svg>
      <span className="lada-drop-cap-letter">{letter}</span>
    </span>
  );
};

/**
 * Ornamental Ink Divider (Viněta with Czech linden leaves and folk berries)
 */
export const LadaLindenVineta: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`lada-vineta ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 360 28"
      className="w-full max-w-[340px] h-[26px] mx-auto overflow-visible"
      style={{ filter: 'url(#lada-ink-filter)' }}
    >
      <path
        d="M 12 14 Q 80 11, 142 14"
        fill="none"
        stroke="#1C1613"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M 218 14 Q 280 11, 348 14"
        fill="none"
        stroke="#1C1613"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="14" r="2.5" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.8" />
      <circle cx="348" cy="14" r="2.5" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.8" />

      <path
        d="M 168 14 C 160 4, 146 5, 144 13 C 146 21, 160 22, 168 14 Z"
        fill="#4D784E"
        fillOpacity="0.88"
        stroke="#1C1613"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M 147 13 L 165 14" stroke="#1C1613" strokeWidth="1.4" strokeLinecap="round" />

      <path
        d="M 192 14 C 200 4, 214 5, 216 13 C 214 21, 200 22, 192 14 Z"
        fill="#4D784E"
        fillOpacity="0.88"
        stroke="#1C1613"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M 195 14 L 213 13" stroke="#1C1613" strokeWidth="1.4" strokeLinecap="round" />

      <circle
        cx="180"
        cy="14"
        r="7"
        fill="#C83E2B"
        fillOpacity="0.9"
        stroke="#1C1613"
        strokeWidth="2.5"
      />
      <circle cx="180" cy="14" r="3" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.6" />
    </svg>
  </div>
);

/**
 * Renders the authentic in-game enemy sprite directly from `drawEnemyRenderer` (same as BestiaryModal
 * and the main arena canvas), ensuring 1:1 visual parity with the game.
 */
const LadaEnemyCanvasPreview: React.FC<{ enemyId: string; size?: number; animated?: boolean }> = ({
  enemyId,
  size = 64,
  animated = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const m = ENEMIES[enemyId];
    if (!m) return;

    const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    let rafId = 0;
    const startTime = performance.now();

    const renderFrame = (elapsed: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      let scale = 1.02;
      if (m.radius > 45) scale = 0.45;
      else if (m.radius > 35) scale = 0.55;
      else if (m.radius > 25) scale = 0.72;
      else if (m.radius < 15) scale = 1.3;

      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      const extraArgs: any[] = [];
      let extraY = 6;
      if (m.method === 'drawHastrman') {
        extraArgs.push(false);
        extraY = 12;
      } else if (m.method === 'drawStrasak') {
        extraArgs.push(true);
      } else if (m.method === 'drawKrakonos') {
        extraArgs.push(0);
        extraY = 18;
      } else if (m.method === 'drawRarach') {
        extraArgs.push('#ef4444');
      } else if (m.method === 'drawPira') {
        extraArgs.push('#eab308');
      } else if (m.method === 'drawVozka') {
        extraArgs.push(1);
      } else if (m.method === 'drawVila') {
        extraArgs.push('#ec4899');
      } else if (m.method === 'drawKanciKral') {
        extraArgs.push(false);
      } else if (
        ['drawCert', 'drawPolednice', 'drawCarodejnice', 'drawDivous', 'drawKozel'].includes(m.method)
      ) {
        extraY = 12;
      } else if (
        ['drawMorana', 'drawGolem', 'drawBazilisek', 'drawPerchta', 'drawDrak', 'drawZitnyDedek'].includes(
          m.method
        )
      ) {
        extraY = 18;
      }

      const enemyToRender = { ...m, semiVisible: false };
      drawEnemyRenderer(m.method, ctx, cx, cy + extraY, elapsed, 0, false, enemyToRender, extraArgs);
      ctx.restore();
    };

    if (animated) {
      const tick = (now: number) => {
        renderFrame((now - startTime) / 1000);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    } else {
      renderFrame(0.6);
      return undefined;
    }
  }, [enemyId, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="block select-none pointer-events-none"
      aria-label={ENEMIES[enemyId]?.name || enemyId}
    />
  );
};

const CANONICAL_ENEMY_CATEGORY_LABELS: Record<string, string> = {
  swarms: 'Šotci a havěť',
  undead: 'Kostlivci a umrlci',
  water: 'Hastrmani a tůně',
  winter: 'Mrazíci a vánice',
  forest: 'Lesní přízraky',
  demons: 'Pekelná cháska',
  bosses: 'Velcí bossové',
};

export interface FolkBestiaryPreviewEntry {
  id: string;
  legacyKillId?: string;
  czechName: string;
  folkSubtitle: string;
  categoryLabel: string;
  weakness: string;
  strength: string;
  statsSummary: string;
  gouacheBg: string;
  lore: string;
  drawCreatureSvg: () => React.ReactNode;
}

const buildBestiaryStatsSummary = (enemyId: string): string => {
  const e = ENEMIES[enemyId];
  if (!e) return '';
  const cad = getEnemyCadenceInfo(e.attackCadence);
  const hungerPct = Math.round((e.foodResist || 0) * 100);
  const poisePct = Math.round((e.poiseResist || 0) * 100);
  const willPct = Math.round((e.willpower || 0) * 100);
  return `Kuráž ${e.hp} · Rychlost ${e.speed} · Útok ${e.damage} (${cad.shortLabel} ${cad.interval.toFixed(1).replace('.', ',')} s) · Odolnosti: Hlad ${hungerPct} %, Postoj ${poisePct} %, Vůle ${willPct} %`;
};

const buildBestiaryEntry = (
  id: string,
  gouacheBg: string,
  legacyKillId?: string
): FolkBestiaryPreviewEntry => {
  const e = ENEMIES[id];
  return {
    id,
    legacyKillId,
    czechName: e?.name || id,
    folkSubtitle: e?.title || '',
    categoryLabel: CANONICAL_ENEMY_CATEGORY_LABELS[e?.category || ''] || 'Strašidla',
    weakness: e?.weakness || '',
    strength: e?.strength || '',
    statsSummary: buildBestiaryStatsSummary(id),
    gouacheBg,
    lore: e?.lore || '',
    drawCreatureSvg: () => <LadaEnemyCanvasPreview enemyId={id} size={64} />,
  };
};

const FOLK_BESTIARY_ENTRIES: FolkBestiaryPreviewEntry[] = [
  buildBestiaryEntry('hastrman', '#E6F0F5', 'vodnik'),
  buildBestiaryEntry('rarach', '#FBE9E5'),
  buildBestiaryEntry('klekanice', '#F6EBD8'),
  buildBestiaryEntry('cert', '#F5E4DC'),
  buildBestiaryEntry('morana', '#E8EEF5'),
  buildBestiaryEntry('hejkal', '#E6F0E6'),
];

export interface LadaStorybookSpreadProps {
  meta: MetaProgression;
  selectedLevelId: GameLevelId;
  levelProgress: Record<number, any>;
  onSelectLevel: (lvlId: GameLevelId) => void;
  onInspectLockedLevel: (prog: any) => void;
  onProceedToHunters: () => void;
  onQuickStartWithHunter: (hunterId: CharacterType) => void;
  onOpenTavern: () => void;
  onOpenArsenal: () => void;
  onOpenBestiary: () => void;
  onOpenControls: () => void;
  onOpenSettings?: () => void;
  unlockedWeaponsCount: number;
  totalWeaponsCount: number;
}

interface PortraitHunterEntry {
  id: CharacterType;
  czechTitle: string;
  czechSubtitle: string;
  role: string;
  maxHp: number;
  speed: number;
  pickupRadius: number;
  luck: number;
  weaponName: string;
  weaponIcon: string;
  weaponBaseDmg: number;
  weaponBaseCd: number;
  weaponDesc: string;
  weaponSummary: string;
  passiveSummary: string;
  abilityName: string;
  abilityDetail: string;
  cooldownSeconds: number;
  playstyle: string;
}

const buildPortraitHunterEntry = (
  id: CharacterType,
  detailKey: HunterDetailKey
): PortraitHunterEntry => {
  const d = HUNTER_DETAILS[detailKey];
  const w = WEAPONS[d.weaponId];
  return {
    id,
    czechTitle: d.name,
    czechSubtitle: d.title,
    role: d.role,
    maxHp: d.maxHp,
    speed: d.speed,
    pickupRadius: d.pickupRadius,
    luck: d.luck,
    weaponName: w?.name || d.weapon.split('–')[0].trim(),
    weaponIcon: w?.icon || '⚔️',
    weaponBaseDmg: w?.baseDmg ?? 20,
    weaponBaseCd: w?.baseCd ?? 1.0,
    weaponDesc: w?.desc || d.weapon,
    weaponSummary: d.weapon,
    passiveSummary: d.passive,
    abilityName: d.abilityName,
    abilityDetail: d.ability,
    cooldownSeconds: d.cooldownSeconds,
    playstyle: d.playstyle,
  };
};

const PORTRAIT_CHARACTERS: PortraitHunterEntry[] = [
  buildPortraitHunterEntry('krajanek', 'krajanek'),
  buildPortraitHunterEntry('wanderer', 'tulak'),
  buildPortraitHunterEntry('shepherd', 'pasacek'),
  buildPortraitHunterEntry('korenarka', 'korenarka'),
  buildPortraitHunterEntry('watchman', 'ponocny'),
  buildPortraitHunterEntry('sexton', 'kostelnik'),
  buildPortraitHunterEntry('granny', 'babicka'),
];

export const LadaStorybookSpread: React.FC<LadaStorybookSpreadProps> = ({
  meta,
  selectedLevelId,
  levelProgress,
  onSelectLevel,
  onInspectLockedLevel,
  onProceedToHunters,
  onQuickStartWithHunter,
  onOpenTavern,
  onOpenArsenal,
  onOpenBestiary,
  onOpenControls,
  onOpenSettings,
  unlockedWeaponsCount,
  totalWeaponsCount,
}) => {
  const [activeTab, setActiveTab] = useState<BookChapterTab>('map');
  const [outgoingTab, setOutgoingTab] = useState<BookChapterTab | null>(null);
  const [isPeekingCorner, setIsPeekingCorner] = useState<boolean>(false);
  const [hasSecondaryCascade, setHasSecondaryCascade] = useState<boolean>(false);
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward');
  const [hoverCorner, setHoverCorner] = useState<'next' | 'prev' | null>(null);
  const [ribbonPendulumSwing, setRibbonPendulumSwing] = useState<boolean>(false);
  const [settleThudJolt, setSettleThudJolt] = useState<boolean>(false);
  // Default to silky-smooth 60 FPS page turn physics; 16 FPS Karel Zeman stop-motion is optional
  const [stopMotion16Fps, setStopMotion16Fps] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem('bubakov_storybook_stopmotion') === 'true';
    } catch {
      return false;
    }
  });
  const [foleyMuted, setFoleyMuted] = useState<boolean>(() => {
    try {
      if (ladaPageFoley.muted) return true;
      return typeof window !== 'undefined' && window.localStorage.getItem('bubakov_storybook_foleymuted') === 'true';
    } catch {
      return false;
    }
  });

  const [portraitIndex, setPortraitIndex] = useState<number>(0);
  const canonicalWeaponIds = useMemo(() => Array.from(WEAPONS_WITH_MILESTONES), []);
  const canonicalWeaponProgresses = useMemo(
    () => canonicalWeaponIds.map((id) => getWeaponProgress(id, meta)),
    [canonicalWeaponIds, meta]
  );
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(
    () => Array.from(WEAPONS_WITH_MILESTONES)[0] || 'osikovy_prut'
  );
  const selectedWeaponProg = useMemo(
    () =>
      canonicalWeaponProgresses.find((p) => p.id === selectedWeaponId) ||
      canonicalWeaponProgresses[0],
    [canonicalWeaponProgresses, selectedWeaponId]
  );
  const [selectedBestiaryEntry, setSelectedBestiaryEntry] = useState<FolkBestiaryPreviewEntry>(
    FOLK_BESTIARY_ENTRIES[0]
  );

  const bookSpreadRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peekFrameRef = useRef<number | null>(null);
  const peekValRef = useRef<number>(0);
  const turnProgressRef = useRef<number>(0);
  const turnDirectionRef = useRef<'forward' | 'backward'>('forward');

  // Direct DOM refs for 60/120 FPS page-turn geometry updates (zero React re-renders per frame!)
  const leftLandingShadowRef = useRef<HTMLDivElement | null>(null);
  const spineGutterRef = useRef<HTMLDivElement | null>(null);
  const rightLiftShadowRef = useRef<HTMLDivElement | null>(null);
  const rectoDivRef = useRef<HTMLDivElement | null>(null);
  const rectoHighlightRef = useRef<HTMLDivElement | null>(null);
  const versoDivRef = useRef<HTMLDivElement | null>(null);
  const versoBellyRef = useRef<HTMLDivElement | null>(null);
  const inkShowthroughRef = useRef<HTMLDivElement | null>(null);
  const curlSvgRef = useRef<SVGSVGElement | null>(null);
  const curlPolyRef = useRef<SVGPolygonElement | null>(null);
  const curlLineRef = useRef<SVGLineElement | null>(null);
  const cascadeWrapRef = useRef<HTMLDivElement | null>(null);
  const cascadeVersoRef = useRef<HTMLDivElement | null>(null);
  const cascadeBellyRef = useRef<HTMLDivElement | null>(null);
  const cascadeSvgRef = useRef<SVGSVGElement | null>(null);
  const cascadePolyRef = useRef<SVGPolygonElement | null>(null);

  const dragStateRef = useRef<{
    active: boolean;
    corner: 'next' | 'prev';
    startX: number;
    targetTab: BookChapterTab;
    moved: boolean;
  } | null>(null);

  const applySpreadTurnDomGeometry = useCallback(
    (
      primaryP: number,
      dir: 'forward' | 'backward',
      secondaryP: number | null = null
    ) => {
      const g = computePageTurnGeometry(primaryP, dir);

      if (leftLandingShadowRef.current) {
        const show = g.leftLandingShadowOpacity > 0.004;
        leftLandingShadowRef.current.style.opacity = show
          ? g.leftLandingShadowOpacity.toFixed(3)
          : '0';
        leftLandingShadowRef.current.style.width = `${g.leftLandingShadowWidthPct.toFixed(1)}%`;
      }

      if (spineGutterRef.current) {
        spineGutterRef.current.style.boxShadow =
          g.spineCompression > 0.02
            ? `inset 0 0 ${(14 + g.spineCompression * 16).toFixed(1)}px rgba(28, 22, 19, ${(
                0.45 + g.spineCompression * 0.35
              ).toFixed(2)})`
            : '';
      }

      if (rightLiftShadowRef.current) {
        const show = g.rightLiftShadowOpacity > 0.004;
        rightLiftShadowRef.current.style.opacity = show
          ? g.rightLiftShadowOpacity.toFixed(3)
          : '0';
        rightLiftShadowRef.current.style.left = `${Math.max(0, g.foldBotX - 3).toFixed(2)}%`;
        rightLiftShadowRef.current.style.width = `${g.rightLiftShadowWidthPct.toFixed(2)}%`;
        rightLiftShadowRef.current.style.transform = `skewX(${g.foldAngleDeg.toFixed(2)}deg)`;
      }

      if (rectoDivRef.current) {
        if (g.foldTopX > 0.15) {
          rectoDivRef.current.style.display = '';
          rectoDivRef.current.style.clipPath = g.rectoClipPath;
        } else {
          rectoDivRef.current.style.display = 'none';
        }
      }

      if (rectoHighlightRef.current) {
        rectoHighlightRef.current.style.backgroundPosition = `${(
          100 - g.effectiveP * 100
        ).toFixed(1)}% 0%`;
      }

      if (versoDivRef.current) {
        if (g.versoOpacity > 0.004) {
          versoDivRef.current.style.display = '';
          versoDivRef.current.style.clipPath = g.versoClipPath;
          versoDivRef.current.style.opacity = g.versoOpacity.toFixed(3);
        } else {
          versoDivRef.current.style.display = 'none';
        }
      }

      if (versoBellyRef.current) {
        versoBellyRef.current.style.background = `linear-gradient(${(
          90 + g.foldAngleDeg
        ).toFixed(
          1
        )}deg, rgba(42, 26, 14, 0.28) 0%, rgba(255, 249, 235, 0.32) 34%, rgba(242, 229, 198, 0.08) 68%, rgba(42, 26, 14, 0.36) 100%)`;
      }

      if (inkShowthroughRef.current) {
        if (g.inkShowThroughOpacity > 0.001) {
          inkShowthroughRef.current.style.opacity = g.inkShowThroughOpacity.toFixed(4);
          inkShowthroughRef.current.style.transform = `scaleX(-1) skewY(${g.archSkewYDeg.toFixed(
            2
          )}deg)`;
        } else {
          inkShowthroughRef.current.style.opacity = '0';
        }
      }

      if (curlSvgRef.current) {
        curlSvgRef.current.style.opacity = g.versoOpacity > 0.004 ? g.versoOpacity.toFixed(3) : '0';
      }
      if (curlPolyRef.current) {
        curlPolyRef.current.setAttribute('points', g.versoPolygonSvgPoints);
      }
      if (curlLineRef.current) {
        curlLineRef.current.setAttribute('x1', (g.creaseTopSpreadX * 2).toFixed(2));
        curlLineRef.current.setAttribute('x2', (g.creaseBotSpreadX * 2).toFixed(2));
      }

      if (cascadeWrapRef.current) {
        if (secondaryP !== null && secondaryP > 0.005 && secondaryP < 0.995) {
          const sg = computePageTurnGeometry(secondaryP, dir);
          cascadeWrapRef.current.style.display = sg.versoOpacity > 0.01 ? '' : 'none';
          if (cascadeVersoRef.current) {
            cascadeVersoRef.current.style.clipPath = sg.versoClipPath;
            cascadeVersoRef.current.style.opacity = sg.versoOpacity.toFixed(3);
          }
          if (cascadeBellyRef.current) {
            cascadeBellyRef.current.style.background = `linear-gradient(${(
              90 + sg.foldAngleDeg
            ).toFixed(
              1
            )}deg, rgba(42, 26, 14, 0.28) 0%, rgba(255, 249, 235, 0.28) 38%, rgba(242, 229, 198, 0.1) 68%, rgba(42, 26, 14, 0.34) 100%)`;
          }
          if (cascadeSvgRef.current) {
            cascadeSvgRef.current.style.opacity = sg.versoOpacity.toFixed(3);
          }
          if (cascadePolyRef.current) {
            cascadePolyRef.current.setAttribute('points', sg.versoPolygonSvgPoints);
          }
        } else {
          cascadeWrapRef.current.style.display = 'none';
        }
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (peekFrameRef.current !== null) {
        cancelAnimationFrame(peekFrameRef.current);
      }
    };
  }, []);

  // Smoothly animate corner-hover peek (0 <-> 0.072) via direct DOM updates without 60fps React re-renders
  useEffect(() => {
    if (outgoingTab !== null) {
      peekValRef.current = 0;
      setIsPeekingCorner(false);
      return;
    }
    const targetPeek = hoverCorner === 'next' ? 0.072 : 0;
    if (targetPeek > 0) {
      setIsPeekingCorner(true);
    }
    if (peekFrameRef.current !== null) {
      cancelAnimationFrame(peekFrameRef.current);
    }
    let lastTs = performance.now();
    const stepPeek = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const cur = peekValRef.current;
      const diff = targetPeek - cur;
      if (Math.abs(diff) < 0.0015) {
        peekValRef.current = targetPeek;
        applySpreadTurnDomGeometry(targetPeek, 'forward', null);
        if (targetPeek === 0) {
          setIsPeekingCorner(false);
        }
        peekFrameRef.current = null;
        return;
      }
      const nextVal = cur + diff * Math.min(1, dt * 16);
      peekValRef.current = nextVal;
      applySpreadTurnDomGeometry(nextVal, 'forward', null);
      peekFrameRef.current = requestAnimationFrame(stepPeek);
    };
    peekFrameRef.current = requestAnimationFrame(stepPeek);
    return () => {
      if (peekFrameRef.current !== null) {
        cancelAnimationFrame(peekFrameRef.current);
      }
    };
  }, [hoverCorner, outgoingTab, applySpreadTurnDomGeometry]);

  const currentLevel: GameLevelDef = GAME_LEVELS[selectedLevelId] || GAME_LEVELS[0];
  const activePortrait = PORTRAIT_CHARACTERS[portraitIndex % PORTRAIT_CHARACTERS.length];

  /**
   * Triggers a physically grounded 640ms single page turn OR an 800ms multi-page
   * bookmark cascade (with 130ms stagger between leaves) when jumping 2 chapters.
   * Updates all polygon clip-paths and shadows directly on DOM refs inside requestAnimationFrame
   * for zero React VDOM re-render overhead during the animation.
   */
  const startAnimatedPageTurn = useCallback(
    (
      nextTab: BookChapterTab,
      fromTab: BookChapterTab,
      initialProgress = 0,
      forceMultiLeaf = false,
      explicitDirection?: 'forward' | 'backward'
    ) => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      const fromIdx = CHAPTER_ORDER.indexOf(fromTab);
      const toIdx = CHAPTER_ORDER.indexOf(nextTab);
      const dir: 'forward' | 'backward' =
        explicitDirection ?? (toIdx >= fromIdx ? 'forward' : 'backward');
      const isMultiLeafCascade =
        forceMultiLeaf || (!explicitDirection && Math.abs(toIdx - fromIdx) >= 2);
      const singleLeafDurationMs = 640;
      const staggerMs = 130;
      const totalDurationMs = isMultiLeafCascade
        ? singleLeafDurationMs + staggerMs
        : singleLeafDurationMs;

      const clampedStart = Math.max(0.005, Math.min(0.95, initialProgress));
      turnProgressRef.current = clampedStart;
      turnDirectionRef.current = dir;
      setOutgoingTab(fromTab);
      setActiveTab(nextTab);
      setTurnDirection(dir);
      setHasSecondaryCascade(isMultiLeafCascade);
      setRibbonPendulumSwing(true);

      if (initialProgress <= 0.08) {
        if (isMultiLeafCascade) {
          ladaPageFoley.playMultiPageCascade();
        } else {
          ladaPageFoley.playFullPageTurn(0);
        }
      }

      const startTime = performance.now() - initialProgress * singleLeafDurationMs;
      let thudTriggered = false;

      const step = (now: number) => {
        const elapsed = Math.max(0, now - startTime);
        const effectiveElapsed = stopMotion16Fps
          ? Math.floor(elapsed / (1000 / 16)) * (1000 / 16)
          : elapsed;

        const rawLeaf1 = Math.min(1, effectiveElapsed / singleLeafDurationMs);
        const curvedLeaf1 = evaluatePaperTurnCurve(rawLeaf1);
        turnProgressRef.current = curvedLeaf1;

        let curvedLeaf2: number | null = null;
        if (isMultiLeafCascade) {
          const rawLeaf2 = Math.max(
            0,
            Math.min(1, (effectiveElapsed - staggerMs) / singleLeafDurationMs)
          );
          curvedLeaf2 = rawLeaf2 > 0 && rawLeaf2 < 1 ? evaluatePaperTurnCurve(rawLeaf2) : null;
        }

        applySpreadTurnDomGeometry(curvedLeaf1, dir, curvedLeaf2);

        if (!thudTriggered && elapsed >= totalDurationMs * 0.91) {
          thudTriggered = true;
          setSettleThudJolt(true);
          window.setTimeout(() => setSettleThudJolt(false), 260);
        }

        if (elapsed < totalDurationMs) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          turnProgressRef.current = 0;
          applySpreadTurnDomGeometry(0, dir, null);
          setOutgoingTab(null);
          setHasSecondaryCascade(false);
          window.setTimeout(() => setRibbonPendulumSwing(false), 580);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [stopMotion16Fps, applySpreadTurnDomGeometry]
  );

  const handleSwitchTab = (nextTab: BookChapterTab) => {
    if (nextTab === activeTab) return;
    const fromIdx = CHAPTER_ORDER.indexOf(activeTab);
    const toIdx = CHAPTER_ORDER.indexOf(nextTab);
    const dir: 'forward' | 'backward' = toIdx > fromIdx ? 'forward' : 'backward';
    startAnimatedPageTurn(nextTab, activeTab, 0, Math.abs(toIdx - fromIdx) >= 2, dir);
  };

  /**
   * Interactive Pointer Drag for the Bottom-Right & Bottom-Left Dog-Eared Corners
   * Allows actively dragging the fold line across the spine with mouse or finger!
   */
  const handleCornerPointerDown = (
    corner: 'next' | 'prev',
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    const idx = CHAPTER_ORDER.indexOf(activeTab);
    const nextIdx =
      corner === 'next'
        ? (idx + 1) % CHAPTER_ORDER.length
        : (idx - 1 + CHAPTER_ORDER.length) % CHAPTER_ORDER.length;
    const targetTab = CHAPTER_ORDER[nextIdx];

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      corner,
      startX: e.clientX,
      targetTab,
      moved: false,
    };
  };

  const handleCornerPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!drag || !drag.active) return;

    const dx = e.clientX - drag.startX;
    const dir: 'forward' | 'backward' = drag.corner === 'next' ? 'forward' : 'backward';
    if (Math.abs(dx) > 8 && !drag.moved) {
      drag.moved = true;
      turnDirectionRef.current = dir;
      setOutgoingTab(activeTab);
      setActiveTab(drag.targetTab);
      setTurnDirection(dir);
      ladaPageFoley.playFullPageTurn(0);
    }

    if (drag.moved) {
      const spreadWidth = bookSpreadRef.current?.clientWidth || 760;
      const rawDragProgress =
        drag.corner === 'next'
          ? Math.max(0.03, Math.min(0.96, -dx / (spreadWidth * 0.65)))
          : Math.max(0.03, Math.min(0.96, dx / (spreadWidth * 0.65)));
      turnProgressRef.current = rawDragProgress;
      applySpreadTurnDomGeometry(rawDragProgress, dir, null);
    }
  };

  const handleCornerPointerUp = () => {
    const drag = dragStateRef.current;
    if (!drag) return;
    dragStateRef.current = null;
    const dir: 'forward' | 'backward' = drag.corner === 'next' ? 'forward' : 'backward';

    if (!drag.moved) {
      const startP = drag.corner === 'next' ? Math.max(0.02, peekValRef.current) : 0.02;
      startAnimatedPageTurn(drag.targetTab, activeTab, startP, false, dir);
    } else if (turnProgressRef.current > 0.2) {
      startAnimatedPageTurn(
        drag.targetTab,
        outgoingTab || activeTab,
        turnProgressRef.current,
        false,
        dir
      );
    } else {
      const revertTab = outgoingTab || activeTab;
      turnProgressRef.current = 0;
      applySpreadTurnDomGeometry(0, dir, null);
      setActiveTab(revertTab);
      setOutgoingTab(null);
    }
  };

  const handleCyclePortrait = () => {
    sound.coin();
    ladaPageFoley.playCornerHover();
    setPortraitIndex((prev) => (prev + 1) % PORTRAIT_CHARACTERS.length);
  };

  // Signpost coordinates on the Right-Page Illustrated Landscape Map (aligned 1:1 with the 12 GAME_LEVELS)
  const MAP_SIGNPOSTS: Array<{
    levelId: GameLevelId;
    x: number;
    y: number;
    shortLabel: string;
    regionNote: string;
    tilt: number;
  }> = [
    { levelId: 0, x: 18, y: 74, shortLabel: '1. Předjaří (Den)', regionNote: 'Tající louky u vsi', tilt: -3 },
    { levelId: 1, x: 44, y: 80, shortLabel: '2. Předjaří (Noc)', regionNote: 'Zamrzlý rybník', tilt: 2 },
    { levelId: 2, x: 24, y: 48, shortLabel: '3. Duben (Den)', regionNote: 'Rozkvetlá náves', tilt: -2 },
    { levelId: 3, x: 54, y: 54, shortLabel: '4. Duben (Noc)', regionNote: 'Filipojakubská noc', tilt: 3 },
    { levelId: 4, x: 78, y: 68, shortLabel: '5. Květen (Den)', regionNote: 'Májová slavnost', tilt: -2 },
    { levelId: 5, x: 76, y: 40, shortLabel: '6. Květen (Noc)', regionNote: 'Májová noc v hvozdu', tilt: 2 },
    { levelId: 6, x: 34, y: 22, shortLabel: '7. Červen (Den)', regionNote: 'Letní senoseč', tilt: -3 },
    { levelId: 7, x: 74, y: 18, shortLabel: '8. Červen (Noc)', regionNote: 'Svatojánská noc', tilt: 3 },
    { levelId: 8, x: 16, y: 32, shortLabel: '9. Červenec (Den)', regionNote: 'Červencové žně', tilt: -2 },
    { levelId: 9, x: 52, y: 34, shortLabel: '10. Červenec (Noc)', regionNote: 'Bouře sv. Eliáše', tilt: 2 },
    { levelId: 10, x: 52, y: 14, shortLabel: '11. Srpen (Den)', regionNote: 'Dožínková slavnost', tilt: -1 },
    { levelId: 11, x: 88, y: 24, shortLabel: '12. Srpen (Noc)', regionNote: 'Vavřinecká noc', tilt: 3 },
    { levelId: 12, x: 30, y: 10, shortLabel: '13. Září (Den)', regionNote: 'Zářijové posvícení', tilt: -2 },
    { levelId: 13, x: 82, y: 10, shortLabel: '14. Září (Noc)', regionNote: 'Svatováclavská noc', tilt: 2 },
    { levelId: 14, x: 22, y: 6, shortLabel: '15. Říjen (Den)', regionNote: 'Říjnová drakiáda', tilt: -1 },
    { levelId: 15, x: 74, y: 6, shortLabel: '16. Říjen (Noc)', regionNote: 'Dušičková noc', tilt: 2 },
    { levelId: 16, x: 14, y: 16, shortLabel: '17. Listopad (Den)', regionNote: 'Svatomartinské posvícení', tilt: -2 },
    { levelId: 17, x: 62, y: 16, shortLabel: '18. Listopad (Noc)', regionNote: 'Lov v mlze a uhlířský milíř', tilt: 3 },
    { levelId: 18, x: 38, y: 4, shortLabel: '19. Prosinec (Den)', regionNote: 'Adventní čas a koledy', tilt: -1 },
    { levelId: 19, x: 86, y: 4, shortLabel: '20. Prosinec (Noc)', regionNote: 'Štědrovečerní tichá noc', tilt: 2 },
    { levelId: 20, x: 26, y: 88, shortLabel: '21. Leden (Den)', regionNote: 'Tříkrálová koleda a sníh', tilt: -2 },
    { levelId: 21, x: 68, y: 88, shortLabel: '22. Leden (Noc)', regionNote: 'Tříkrálová noc a perchta', tilt: 2 },
    { levelId: 22, x: 20, y: 94, shortLabel: '23. Únor (Den)', regionNote: 'Masopustní průvod a koblihy', tilt: -2 },
    { levelId: 23, x: 64, y: 94, shortLabel: '24. Únor (Noc)', regionNote: 'Masopustní rej a pochovávání basy', tilt: 2 },
  ];

  const activeHunterProg = getHunterProgress(activePortrait.id, meta);
  const levelLoreText = currentLevel.lore || currentLevel.description || '';
  const storyFirstLetter = levelLoreText.replace(/^„/, '').charAt(0) || 'B';
  const storyRestText = levelLoreText.slice(1);

  // Dynamic Left & Right Page Stack Thickness (8px–12px of stepped deckled parchment)
  const currentChapterIdx = CHAPTER_ORDER.indexOf(activeTab);
  const leftStackPx = 8 + currentChapterIdx * 2;
  const rightStackPx = 12 - currentChapterIdx * 2;

  // Next chapter waiting underneath when hovering over the bottom-right corner
  const nextPeekTab: BookChapterTab =
    CHAPTER_ORDER[(currentChapterIdx + 1) % CHAPTER_ORDER.length];

  const isTurning = outgoingTab !== null;
  const isPeekingNext = !isTurning && isPeekingCorner;
  const effectiveDirection: 'forward' | 'backward' = isTurning ? turnDirection : 'forward';
  const initialGeom = computePageTurnGeometry(
    isTurning ? turnProgressRef.current : isPeekingNext ? peekValRef.current : 0,
    effectiveDirection
  );

  const underPageTab: BookChapterTab = isTurning
    ? effectiveDirection === 'forward'
      ? activeTab
      : outgoingTab || activeTab
    : isPeekingNext
    ? nextPeekTab
    : activeTab;

  const rectoPageTab: BookChapterTab = isTurning
    ? effectiveDirection === 'forward'
      ? outgoingTab || activeTab
      : activeTab
    : activeTab;

  /**
   * Renders any of the 3 right-hand page chapters (so both the Outgoing Front Page
   * and the Newly Revealed Under-Page render genuine, complete Josef Lada content
   * during the diagonal corner-peel turn!).
   */
  const renderChapterBody = (
    tab: BookChapterTab,
    isStaticInteractive: boolean,
    lightweightFilter = false
  ) => {
    const pageNum = tab === 'map' ? 15 : tab === 'inventory' ? 17 : 19;
    return (
      <>
        <div className="lada-page-running-header">
          <span>
            {tab === 'map'
              ? 'Kapitola I · Krajina za devatero horami'
              : tab === 'inventory'
              ? `Kapitola II · Venkovská zbrojnice (${unlockedWeaponsCount}/${totalWeaponsCount})`
              : 'Kapitola III · Bubáci a hastrmani'}
          </span>
          <span>Str. {pageNum}</span>
        </div>

        {tab === 'map' && (
          <div className="lada-right-tab-content">
            <div className="lada-chapter-heading-wrap">
              <h2 className="lada-chapter-heading">Krajina za devatero horami</h2>
              <p className="lada-chapter-sub">
                Ilustrovaná mapa a výběr výpravy
              </p>
            </div>

            <div className="lada-illustrated-map-frame">
              <svg
                viewBox="0 0 520 310"
                className="w-full h-full block"
                style={{
                  filter: lightweightFilter ? undefined : 'url(#lada-ink-filter)',
                  mixBlendMode: 'multiply',
                }}
              >
                <rect x="0" y="0" width="520" height="310" fill="#F2E5C6" />
                <path
                  d="M 0 0 L 520 0 L 520 120 Q 380 95, 250 115 Q 110 135, 0 105 Z"
                  fill="#2B5B84"
                  fillOpacity="0.82"
                />
                <path
                  d="M 0 115 Q 120 72, 260 105 Q 390 70, 520 102 L 520 310 L 0 310 Z"
                  fill="#4D784E"
                  fillOpacity="0.55"
                  stroke="#1C1613"
                  strokeWidth="3"
                />
                <path
                  d="M 0 175 Q 160 145, 310 175 Q 430 195, 520 165 L 520 310 L 0 310 Z"
                  fill="#E2A83B"
                  fillOpacity="0.45"
                  stroke="#1C1613"
                  strokeWidth="2.8"
                />

                <path
                  d="M 45 295 Q 140 245, 210 210 Q 285 170, 240 120 Q 200 80, 370 55"
                  fill="none"
                  stroke="#1C1613"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 45 295 Q 140 245, 210 210 Q 285 170, 240 120 Q 200 80, 370 55"
                  fill="none"
                  stroke="#F6EBD8"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                <ellipse
                  cx="235"
                  cy="255"
                  rx="76"
                  ry="32"
                  fill="#2B5B84"
                  fillOpacity="0.88"
                  stroke="#1C1613"
                  strokeWidth="3.2"
                />
                <path
                  d="M 195 252 Q 215 247, 235 252 M 235 264 Q 255 259, 275 264"
                  stroke="#F6EBD8"
                  strokeWidth="2"
                  fill="none"
                />

                <path
                  d="M 175 222 Q 210 198, 245 222 L 245 236 Q 210 218, 175 236 Z"
                  fill="#D5B886"
                  stroke="#1C1613"
                  strokeWidth="3"
                />
                <path d="M 192 230 A 18 12 0 0 1 228 230" fill="#1C1613" />

                <g transform="translate(88, 92) rotate(-2)">
                  <rect x="0" y="28" width="44" height="36" fill="#F6EBD8" stroke="#1C1613" strokeWidth="3" />
                  <polygon
                    points="-4,28 22,8 48,28"
                    fill="#C83E2B"
                    stroke="#1C1613"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <rect x="30" y="-12" width="18" height="76" fill="#F6EBD8" stroke="#1C1613" strokeWidth="3" />
                  <path
                    d="M 27 -12 C 25 -26, 39 -34, 39 -42 C 39 -34, 53 -26, 51 -12 Z"
                    fill="#C83E2B"
                    stroke="#1C1613"
                    strokeWidth="3"
                  />
                  <line x1="39" y1="-42" x2="39" y2="-52" stroke="#1C1613" strokeWidth="2.5" />
                  <line x1="34" y1="-48" x2="44" y2="-48" stroke="#1C1613" strokeWidth="2.5" />
                </g>

                {[
                  { tx: 420, ty: 52, s: 1 },
                  { tx: 452, ty: 62, s: 1.1 },
                  { tx: 482, ty: 48, s: 0.95 },
                  { tx: 438, ty: 88, s: 1 },
                  { tx: 474, ty: 94, s: 1.05 },
                ].map((tree, idx) => (
                  <g key={idx} transform={`translate(${tree.tx}, ${tree.ty}) scale(${tree.s})`}>
                    <polygon
                      points="0,-28 -16,6 16,6"
                      fill="#25382C"
                      stroke="#1C1613"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="0,-42 -13,-12 13,-12"
                      fill="#4D784E"
                      stroke="#1C1613"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}
              </svg>

              {MAP_SIGNPOSTS.map((sp) => {
                const prog = levelProgress[sp.levelId];
                const isUnlocked = prog?.isUnlocked ?? false;
                const isSelected = selectedLevelId === sp.levelId;
                return (
                  <button
                    key={sp.levelId}
                    type="button"
                    disabled={!isStaticInteractive}
                    className={`lada-signpost-marker ${isSelected ? 'selected' : ''} ${
                      isUnlocked ? 'unlocked' : 'locked'
                    }`}
                    style={{
                      left: `${sp.x}%`,
                      top: `${sp.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sp.tilt}deg)`,
                    }}
                    onClick={() => {
                      if (!isStaticInteractive) return;
                      if (isUnlocked) {
                        sound.coin();
                        onSelectLevel(sp.levelId);
                      } else {
                        sound.hit();
                        onInspectLockedLevel(prog);
                      }
                    }}
                    title={`${prog?.spoiledName || sp.shortLabel} (${sp.regionNote})`}
                  >
                    <span className="lada-signpost-plank">
                      {isSelected ? '★ ' : !isUnlocked ? '🔒 ' : ''}
                      {sp.shortLabel}
                    </span>
                    <span className="lada-signpost-post" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <div
              className={`lada-map-selected-banner ${
                settleThudJolt ? 'lada-ex-libris-thud-jolt' : ''
              }`}
            >
              <div className="min-w-0 flex-1 text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#6E3B1E]">
                  Zvolená výprava:
                </div>
                <div className="text-lg font-black text-[#221B17] leading-tight">
                  {currentLevel.name}{' '}
                  <span className="text-sm font-bold text-[#C83E2B]">
                    · Hlavní postrach: {currentLevel.finalBoss.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="lada-btn btn-small"
                style={{ margin: 0, background: '#4D784E', color: '#F6EBD8' }}
                onClick={() => {
                  if (!isStaticInteractive) return;
                  ladaPageFoley.playFullPageTurn(0);
                  sound.coin();
                  onProceedToHunters();
                }}
              >
                Vybrat lovce →
              </button>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="lada-right-tab-content">
            <div className="lada-chapter-heading-wrap">
              <h2 className="lada-chapter-heading">Venkovská zbrojnice</h2>
              <p className="lada-chapter-sub">
                Zbraně a řemeslný fortel · Stav zbrojnice: {unlockedWeaponsCount} / {totalWeaponsCount} zbraní odemčeno
              </p>
            </div>

            <div
              className="lada-fotoruzky-grid"
              role="listbox"
              aria-label="Zbraně ve venkovské zbrojnici"
              style={{ maxHeight: '290px', overflowY: 'auto', padding: '2px 4px 4px 2px' }}
            >
              {canonicalWeaponProgresses.map((prog) => {
                const isActive = selectedWeaponProg?.id === prog.id;
                const isUnlocked = prog.isUnlocked;
                return (
                  <button
                    key={prog.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    disabled={!isStaticInteractive}
                    className={`lada-fotoruzky-slot ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (!isStaticInteractive) return;
                      ladaPageFoley.playCornerHover();
                      sound.coin();
                      setSelectedWeaponId(prog.id);
                    }}
                  >
                    <span className="fotoruzek fotoruzek-tl" aria-hidden="true" />
                    <span className="fotoruzek fotoruzek-tr" aria-hidden="true" />
                    <span className="fotoruzek fotoruzek-bl" aria-hidden="true" />
                    <span className="fotoruzek fotoruzek-br" aria-hidden="true" />

                    {isActive && (
                      <span className="lada-wax-seal-check" aria-hidden="true">
                        ✓
                      </span>
                    )}

                    <div
                      className="lada-slot-illustration flex items-center justify-center"
                      style={{
                        filter:
                          !isUnlocked && prog.tier === 0
                            ? 'grayscale(1) brightness(0.4)'
                            : !isUnlocked && prog.tier === 1
                            ? 'contrast(150%) brightness(0.65)'
                            : 'none',
                      }}
                    >
                      <GameIcon
                        icon={prog.tier === 0 ? 'question' : prog.realIcon}
                        size={42}
                      />
                    </div>
                    <span className="lada-slot-caption">
                      {prog.spoiledName}
                    </span>
                    <span
                      className={`text-[9.5px] font-black px-1.5 py-0.5 rounded border border-[#1C1613] ${
                        isUnlocked
                          ? 'bg-[#4D784E] text-[#F6EBD8]'
                          : 'bg-[#E2A83B] text-[#1C1613]'
                      }`}
                    >
                      {isUnlocked ? '✓ Odemčeno' : `🔒 ${prog.percent} %`}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedWeaponProg && (
              <div
                className={`lada-ex-libris-slip ${
                  settleThudJolt ? 'lada-ex-libris-thud-jolt' : ''
                }`}
              >
                <div className="lada-brass-pin" aria-hidden="true" />
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="lada-ex-libris-kicker">
                      {selectedWeaponProg.clueTag}
                    </div>
                    <h3 className="lada-ex-libris-title">
                      {selectedWeaponProg.spoiledName}{' '}
                      <span className="text-xs font-normal italic opacity-80">
                        ({selectedWeaponProg.spoiledTitle})
                      </span>
                    </h3>
                  </div>
                  <span
                    className="lada-ex-libris-stat"
                    style={{
                      backgroundColor: selectedWeaponProg.isUnlocked ? '#4D784E' : '#2B5B84',
                    }}
                  >
                    {selectedWeaponProg.spoiledStatsHint}
                  </span>
                </div>
                <p className="lada-ex-libris-lore">{selectedWeaponProg.spoiledDesc}</p>
                {selectedWeaponProg.isUnlocked &&
                  WEAPONS[selectedWeaponProg.id]?.desc &&
                  WEAPONS[selectedWeaponProg.id]?.desc !== selectedWeaponProg.spoiledDesc && (
                    <p className="text-xs font-bold text-[#6E3B1E] mt-1 mb-0">
                      ⚔ V aréně: {WEAPONS[selectedWeaponProg.id].desc}
                    </p>
                  )}
                {!selectedWeaponProg.isUnlocked && (
                  <div className="text-xs font-extrabold text-[#6E3B1E] mt-1">
                    {selectedWeaponProg.isQueued
                      ? `🔒 V pořadí — nejprve odemkni: ${selectedWeaponProg.requiredWeaponName}`
                      : `🎯 Výzva (${selectedWeaponProg.curCount}/${selectedWeaponProg.maxCount} · ${selectedWeaponProg.percent} %): ${selectedWeaponProg.challengeShortDesc}`}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-dashed border-[#6E3B1E]/40">
                  <span className="text-xs font-bold text-[#221B17]/85">
                    Celkem ve zbrojnici: {unlockedWeaponsCount} z {totalWeaponsCount} zbraní
                  </span>
                  <button
                    type="button"
                    className="lada-inline-switch-btn"
                    onClick={() => {
                      if (!isStaticInteractive) return;
                      sound.coin();
                      onOpenArsenal();
                    }}
                  >
                    ⚔ Otevřít celou Venkovskou zbrojnici ({unlockedWeaponsCount}/{totalWeaponsCount})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'bestiary' && (
          <div className="lada-right-tab-content">
            <div className="lada-chapter-heading-wrap">
              <h2 className="lada-chapter-heading">Bubáci a hastrmani</h2>
              <p className="lada-chapter-sub">
                Bestiář českého venkova: útočná kadence, odolnosti (Hlad · Postoj · Vůle) a slabiny
              </p>
            </div>

            <div className="lada-bestiary-spread-grid">
              {FOLK_BESTIARY_ENTRIES.map((entry) => {
                const isSelected = selectedBestiaryEntry.id === entry.id;
                const killCount =
                  (meta.bestiaryKills?.[entry.id] || 0) +
                  (entry.legacyKillId ? meta.bestiaryKills?.[entry.legacyKillId] || 0 : 0);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={!isStaticInteractive}
                    className={`lada-bestiary-encyclo-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (!isStaticInteractive) return;
                      ladaPageFoley.playCornerHover();
                      sound.coin();
                      setSelectedBestiaryEntry(entry);
                    }}
                  >
                    <div
                      className="lada-bestiary-card-art"
                      style={{
                        backgroundColor: entry.gouacheBg,
                      }}
                    >
                      {entry.drawCreatureSvg()}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-black text-base text-[#221B17] leading-tight">
                        {entry.czechName}
                      </div>
                      <div className="text-xs italic text-[#6E3B1E] mb-1">
                        {entry.folkSubtitle}
                      </div>
                      <div className="text-xs font-bold text-[#221B17]/90 line-clamp-2">
                        {entry.lore}
                      </div>
                      <div className="mt-1 text-[11px] font-extrabold text-[#C83E2B]">
                        Zahnáno na výpravách: {killCount}×
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className={`lada-ex-libris-slip mt-2 ${
                settleThudJolt ? 'lada-ex-libris-thud-jolt' : ''
              }`}
            >
              <div className="lada-brass-pin" aria-hidden="true" />
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 rounded-lg border-2 border-[#1C1613] flex items-center justify-center shadow-[2px_2px_0_#1C1613]"
                  style={{
                    width: '78px',
                    height: '78px',
                    backgroundColor: selectedBestiaryEntry.gouacheBg,
                  }}
                >
                  <LadaEnemyCanvasPreview
                    enemyId={selectedBestiaryEntry.id}
                    size={74}
                    animated={isStaticInteractive}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="lada-ex-libris-kicker">
                        BESTIÁŘ ČESKÉHO VENKOVA · {selectedBestiaryEntry.categoryLabel}
                      </div>
                      <h3 className="lada-ex-libris-title">
                        {selectedBestiaryEntry.czechName} ({selectedBestiaryEntry.folkSubtitle})
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="lada-btn btn-small"
                      style={{ margin: 0, background: '#2B5B84', color: '#F6EBD8' }}
                      onClick={() => {
                        if (!isStaticInteractive) return;
                        sound.coin();
                        onOpenBestiary();
                      }}
                    >
                      📖 Otevřít celý Bestiář
                    </button>
                  </div>
                  {selectedBestiaryEntry.statsSummary && (
                    <div className="text-xs font-extrabold text-[#6E3B1E] mt-1">
                      📊 {selectedBestiaryEntry.statsSummary}
                    </div>
                  )}
                  <p className="lada-ex-libris-lore mt-1">
                    <strong>Silná stránka:</strong> {selectedBestiaryEntry.strength} ·{' '}
                    <strong>Slabina:</strong> {selectedBestiaryEntry.weakness}.{' '}
                    {selectedBestiaryEntry.lore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <section
      className={`lada-book-hardcover ${stopMotion16Fps ? 'lada-stop-motion-16fps' : ''}`}
      aria-label="Otevřená pohádková kniha Bubákova (Edice SNDK / Albatros)"
    >
      {/* 4 Brass / Gold Hardcover Corner Protectors */}
      <div className="lada-brass-corner lada-brass-tl" aria-hidden="true" />
      <div className="lada-brass-corner lada-brass-tr" aria-hidden="true" />
      <div className="lada-brass-corner lada-brass-bl" aria-hidden="true" />
      <div className="lada-brass-corner lada-brass-br" aria-hidden="true" />

      {/* Top Woven Cloth Bookmark Navigation Tabs (Záložky) + Margin Foley & Stop-Motion Controls */}
      <div className="flex items-end justify-between gap-2 flex-wrap px-3">
        <nav
          className={`lada-bookmarks-top-bar ${
            ribbonPendulumSwing ? 'lada-ribbon-pendulum-active' : ''
          }`}
          aria-label="Záložky pohádkové knihy"
        >
          <button
            type="button"
            className={`lada-bookmark-ribbon ribbon-cobalt ${activeTab === 'map' ? 'active' : ''}`}
            onMouseEnter={() => ladaPageFoley.playCornerHover()}
            onClick={() => handleSwitchTab('map')}
          >
            <span className="lada-ribbon-stitch">
              🗺️ Krajina za devatero horami
            </span>
          </button>
          <button
            type="button"
            className={`lada-bookmark-ribbon ribbon-poppy ${
              activeTab === 'inventory' ? 'active' : ''
            }`}
            onMouseEnter={() => ladaPageFoley.playCornerHover()}
            onClick={() => handleSwitchTab('inventory')}
          >
            <span className="lada-ribbon-stitch">
              ⚔️ Venkovská zbrojnice ({unlockedWeaponsCount}/{totalWeaponsCount})
            </span>
          </button>
          <button
            type="button"
            className={`lada-bookmark-ribbon ribbon-ochre ${
              activeTab === 'bestiary' ? 'active' : ''
            }`}
            onMouseEnter={() => ladaPageFoley.playCornerHover()}
            onClick={() => handleSwitchTab('bestiary')}
          >
            <span className="lada-ribbon-stitch">
              📖 Bubáci a hastrmani
            </span>
          </button>
          <button
            type="button"
            className="lada-bookmark-ribbon ribbon-willow"
            onMouseEnter={() => ladaPageFoley.playCornerHover()}
            onClick={() => {
              ladaPageFoley.playFullPageTurn(0);
              sound.coin();
              onOpenTavern();
            }}
          >
            <span className="lada-ribbon-stitch">
              🍺 Hospoda ({meta.krejcary} kr.)
            </span>
          </button>
          {onOpenSettings && (
            <button
              type="button"
              className="lada-bookmark-ribbon ribbon-slate"
              onMouseEnter={() => ladaPageFoley.playCornerHover()}
              onClick={() => {
                ladaPageFoley.playCornerHover();
                sound.coin();
                onOpenSettings();
              }}
              title="Nastavení hry, audia a grafiky"
            >
              <span className="lada-ribbon-stitch">
                ⚙️ Nastavení
              </span>
            </button>
          )}
        </nav>

        {/* Book Margin Controls: Karel Zeman 16-FPS Stop-Motion Toggle & Paper Foley Mute Toggle */}
        <div className="lada-book-margin-controls">
          <button
            type="button"
            className={`lada-margin-pill-btn ${stopMotion16Fps ? 'active' : ''}`}
            onClick={() => {
              ladaPageFoley.playCornerHover();
              setStopMotion16Fps((prev) => {
                const next = !prev;
                try {
                  window.localStorage.setItem('bubakov_storybook_stopmotion', String(next));
                } catch {}
                return next;
              });
            }}
            title="Přepnout krokovou animaci po okénkách (styl loutkového filmu Karla Zemana a Jiřího Trnky) vs. plynulý otáčecí arch"
          >
            🎞 {stopMotion16Fps ? 'Loutkový krok: Zap (Zeman)' : 'Plynulý list (Loutkový krok)'}
          </button>
          <button
            type="button"
            className={`lada-margin-pill-btn ${!foleyMuted ? 'active' : ''}`}
            onClick={() => {
              const nextMuted = !foleyMuted;
              setFoleyMuted(nextMuted);
              ladaPageFoley.muted = nextMuted;
              try {
                window.localStorage.setItem('bubakov_storybook_foleymuted', String(nextMuted));
              } catch {}
              if (!nextMuted) {
                ladaPageFoley.playCornerHover();
              }
            }}
            title="Zapnout nebo ztlumit procedurální šelest 150g dřevitého papíru při otáčení stránek"
          >
            {foleyMuted ? '🔇 Šelest stránek: Vyp' : '🔊 Šelest stránek: Zap'}
          </button>
        </div>
      </div>

      {/* Outer Stepped Deckled Parchment Page Stack Wrapper */}
      <div
        className="lada-book-deckled-stack-wrap"
        style={{
          paddingLeft: `${leftStackPx}px`,
          paddingRight: `${rightStackPx}px`,
        }}
      >
        {/* Open Two-Page Book Spread */}
        <div
          ref={bookSpreadRef}
          className="lada-book-spread"
          style={{ perspective: '2200px' }}
        >
          {/* Paper Fiber Grain Overlay across the entire open book */}
          <div className="lada-paper-fiber-overlay" aria-hidden="true" />

          {/* ====================================================================
              LEFT PAGE: CHARACTER PORTRAIT, CERAMIC GAUGES & CÍL VÝPRAVY
             ==================================================================== */}
          <div className="lada-book-page lada-book-page-left">
            <div className="lada-foxing-layer lada-foxing-left" aria-hidden="true" />

            {/* Left-Side Landing Shadow (38% to 100% of page turn, updated via DOM ref) */}
            <div
              ref={leftLandingShadowRef}
              className="lada-left-landing-shadow"
              aria-hidden="true"
              style={{
                opacity: initialGeom.leftLandingShadowOpacity,
                width: `${initialGeom.leftLandingShadowWidthPct}%`,
              }}
            />

            <div className="lada-page-running-header">
              <span>Str. {14 + currentChapterIdx * 2} · Edice SNDK</span>
              <span>„ČESKÉ POHÁDKY A BUBÁCI“</span>
            </div>

            {/* 1. AUTHENTIC IN-GAME HUNTER PORTRAIT & HEADER */}
            <div className="lada-portrait-section">
              <div
                className="lada-oval-garland-frame flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  width: '126px',
                  height: '126px',
                  background: 'radial-gradient(circle at 50% 42%, #FFFDF7 0%, #F2E5C6 68%, #DFCCA4 100%)',
                  border: '3px solid #1C1613',
                  borderRadius: '14px',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
                onClick={handleCyclePortrait}
                title="Klikněte pro přelistování postavy (skutečná podoba lovce ze hry)"
              >
                <div
                  className="absolute inset-x-0 bottom-0 h-6 pointer-events-none"
                  style={{
                    background: '#4D784E',
                    opacity: 0.28,
                    borderTop: '2px solid #1C1613',
                  }}
                />
                <LadaHunterCanvasPreview
                  hunterId={activePortrait.id}
                  size={114}
                  className="relative z-10 block mx-auto"
                />
              </div>

              <div className="lada-portrait-caption">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border-2 border-[#1C1613] bg-[#2B5B84] text-[#F6EBD8]">
                    {activePortrait.role}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-black rounded border-2 border-[#1C1613] ${
                      activeHunterProg?.isUnlocked
                        ? 'bg-[#4D784E] text-[#F6EBD8]'
                        : 'bg-[#E2A83B] text-[#1C1613]'
                    }`}
                  >
                    {activeHunterProg?.isUnlocked
                      ? '✓ Odemčeno'
                      : `🔒 Uzamčeno (${activeHunterProg?.percent ?? 0} %)`}
                  </span>
                </div>
                <div className="lada-portrait-title">{activePortrait.czechTitle}</div>
                <div className="lada-portrait-subtitle">{activePortrait.czechSubtitle}</div>
                <div className="text-[11px] font-bold text-[#221B17]/85 leading-snug mb-1.5">
                  {activePortrait.playstyle}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    className="lada-inline-switch-btn"
                    onClick={() => {
                      sound.coin();
                      ladaPageFoley.playCornerHover();
                      setPortraitIndex(
                        (prev) => (prev - 1 + PORTRAIT_CHARACTERS.length) % PORTRAIT_CHARACTERS.length
                      );
                    }}
                  >
                    ◀ Předchozí
                  </button>
                  <button
                    type="button"
                    className="lada-inline-switch-btn"
                    onClick={handleCyclePortrait}
                  >
                    Další lovec ({(portraitIndex % PORTRAIT_CHARACTERS.length) + 1}/{PORTRAIT_CHARACTERS.length}) ▶
                  </button>
                </div>
              </div>
            </div>

            {/* 2. CLEAR, STRUCTURED HUNTER DOSSIER: ZÁKLADNÍ VLASTNOSTI, VÝCHOZÍ ZBRAŇ, PASIVNÍ A HLAVNÍ SCHOPNOST */}
            <div className="lada-gauges-block space-y-2">
              {/* 4 Canonical Base Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md px-2 py-1 shadow-[1.5px_1.5px_0_#1C1613]">
                  <div className="text-[10px] font-black uppercase tracking-wide text-[#6E3B1E] flex items-center gap-1">
                    <GameIcon icon="heart" size={13} />
                    <span>Základní Kuráž</span>
                  </div>
                  <div className="text-sm font-black text-[#C83E2B] tabular-nums">
                    {activePortrait.maxHp}
                  </div>
                </div>
                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md px-2 py-1 shadow-[1.5px_1.5px_0_#1C1613]">
                  <div className="text-[10px] font-black uppercase tracking-wide text-[#6E3B1E] flex items-center gap-1">
                    <GameIcon icon="boots" size={13} />
                    <span>Rychlost</span>
                  </div>
                  <div className="text-sm font-black text-[#2B5B84] tabular-nums">
                    {activePortrait.speed}
                  </div>
                </div>
                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md px-2 py-1 shadow-[1.5px_1.5px_0_#1C1613]">
                  <div className="text-[10px] font-black uppercase tracking-wide text-[#6E3B1E] flex items-center gap-1">
                    <GameIcon icon="horseshoe" size={13} />
                    <span>Dosah sběru</span>
                  </div>
                  <div className="text-sm font-black text-[#4D784E] tabular-nums">
                    {activePortrait.pickupRadius} px
                  </div>
                </div>
                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md px-2 py-1 shadow-[1.5px_1.5px_0_#1C1613]">
                  <div className="text-[10px] font-black uppercase tracking-wide text-[#6E3B1E] flex items-center gap-1">
                    <GameIcon icon="clover" size={13} />
                    <span>Štěstí</span>
                  </div>
                  <div className="text-sm font-black text-[#9A5B13] tabular-nums">
                    {activePortrait.luck}
                  </div>
                </div>
              </div>

              {/* Starting Weapon + Passive Ability in a clean 2-column or stacked layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md p-2 shadow-[2px_2px_0_#1C1613]">
                  <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                    <div className="text-[11px] font-black uppercase tracking-wide text-[#6E3B1E] flex items-center gap-1">
                      <GameIcon icon={activePortrait.weaponIcon} size={16} />
                      <span>Výchozí zbraň: {activePortrait.weaponName}</span>
                    </div>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#F2E5C6] border border-[#1C1613] text-[#221B17] tabular-nums">
                      Útok {activePortrait.weaponBaseDmg} · {activePortrait.weaponBaseCd} s
                    </span>
                  </div>
                  <p className="text-[11.5px] font-bold text-[#221B17] leading-snug m-0">
                    {activePortrait.weaponDesc}
                  </p>
                </div>

                <div className="bg-[#FFFDF7] border-2 border-[#1C1613] rounded-md p-2 shadow-[2px_2px_0_#1C1613]">
                  <div className="text-[11px] font-black uppercase tracking-wide text-[#4D784E] flex items-center gap-1 mb-1">
                    <GameIcon icon="clover" size={15} />
                    <span>Pasivní schopnost lovce</span>
                  </div>
                  <p className="text-[11.5px] font-bold text-[#221B17] leading-snug m-0">
                    {activePortrait.passiveSummary}
                  </p>
                </div>
              </div>

              {/* Active Ability [Mezerník] — Full Detailed Breakdown */}
              <div className="bg-[#FEF3C7] border-2 border-[#1C1613] rounded-md p-2.5 shadow-[2px_2px_0_#1C1613]">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="text-xs font-black uppercase tracking-wide text-[#9A3412] flex items-center gap-1.5">
                    <GameIcon icon="lightning" size={16} />
                    <span>Zvláštní schopnost [Mezerník]: {activePortrait.abilityName}</span>
                  </div>
                  <span className="text-[10.5px] font-black px-2 py-0.5 rounded bg-[#FFFDF7] border border-[#1C1613] text-[#1C1613] tabular-nums">
                    ⏱ Nabíjení: {activePortrait.cooldownSeconds} s
                  </span>
                </div>
                <p className="text-xs font-bold text-[#221B17] leading-relaxed m-0">
                  {activePortrait.abilityDetail}
                </p>
              </div>
            </div>

            <LadaLindenVineta />

            {/* 3. ACTIVE QUEST / STORY PASSAGE (Cíl výpravy) */}
            <div className="lada-story-passage">
              <div className="lada-story-header">
                <span>📜 Cíl výpravy ({currentLevel.badge})</span>
                <span className="lada-story-stage-tag">{currentLevel.shortTitle}</span>
              </div>

              <p className="lada-story-prose">
                <LadaDropCap letter={storyFirstLetter} variant="poppy" />
                {storyRestText}{' '}
                <span className="lada-story-stage-note">
                  Postupně čelíte třem postrachům kraje: <strong>{currentLevel.miniBoss.name}</strong> (1:25),{' '}
                  <strong>{currentLevel.midBoss.name}</strong> (3:05) a na závěr{' '}
                  <em>{currentLevel.finalBoss.name}</em> (5:00).
                </span>
              </p>

              <div className="lada-calligraphy-choices" role="group" aria-label="Volby výpravy">
                <button
                  type="button"
                  className="lada-calligraphy-choice active-choice"
                  onClick={() => {
                    ladaPageFoley.playFullPageTurn(0);
                    sound.coin();
                    onProceedToHunters();
                  }}
                >
                  <span className="lada-choice-seal" aria-hidden="true">
                    ✓
                  </span>
                  <span className="flex-1 text-left">
                    <strong>„Vyrazit do kraje: {currentLevel.name}“</strong>
                    <small className="block opacity-80">
                      Výběr lovce a odchod na 6minutovou výpravu
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="lada-calligraphy-choice"
                  onClick={() => {
                    ladaPageFoley.playFullPageTurn(0);
                    sound.coin();
                    const chosenHunter: CharacterType = activePortrait.id;
                    const prog = HUNTER_UNLOCKS[chosenHunter];
                    if (prog) {
                      onQuickStartWithHunter(chosenHunter);
                    } else {
                      onProceedToHunters();
                    }
                  }}
                >
                  <span className="lada-choice-quill" aria-hidden="true">
                    ✒
                  </span>
                  <span className="flex-1 text-left">
                    <strong>
                      „Hned vyslat na výpravu: {activePortrait.czechTitle}“
                    </strong>
                    <small className="block opacity-80">
                      {activeHunterProg?.isUnlocked
                        ? `Výchozí zbraň: ${activePortrait.weaponName} · Schopnost: ${activePortrait.abilityName}`
                        : `Lovec je zatím uzamčen (${activeHunterProg?.percent ?? 0} %) — otevře výběr lovců`}
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="lada-calligraphy-choice"
                  onClick={() => {
                    ladaPageFoley.playCornerHover();
                    sound.coin();
                    onOpenControls();
                  }}
                >
                  <span className="lada-choice-quill" aria-hidden="true">
                    ?
                  </span>
                  <span className="flex-1 text-left">
                    <strong>„Rady starého hospodáře“</strong>
                    <small className="block opacity-80">
                      Ovládání, pamětihodnosti [E], Dědečkova nůše a Hospoda
                    </small>
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom-Left Dog-Eared Corner Peek (Oslí ucho — Předchozí strana / Previous Page) */}
            <button
              type="button"
              className={`lada-dog-ear-bottom lada-dog-ear-prev ${
                hoverCorner === 'prev' ? 'hovered' : ''
              }`}
              onMouseEnter={() => {
                setHoverCorner('prev');
                ladaPageFoley.playCornerHover();
              }}
              onMouseLeave={() => setHoverCorner((c) => (c === 'prev' ? null : c))}
              onPointerDown={(e) => handleCornerPointerDown('prev', e)}
              onPointerMove={handleCornerPointerMove}
              onPointerUp={handleCornerPointerUp}
              title="Předchozí strana knihy (klikněte nebo táhněte růžek přes hřbet)"
              aria-label="Předchozí strana knihy"
            >
              <span className="lada-dog-ear-flap" />
              <span className="lada-dog-ear-label">← Předchozí</span>
            </button>
          </div>

          {/* ====================================================================
              CENTRAL SPINE GUTTER (Hluboký stín ve hřbetu knihy + šití)
             ==================================================================== */}
          <div
            ref={spineGutterRef}
            className="lada-book-spine-gutter"
            aria-hidden="true"
          >
            <div className="lada-spine-cord cord-top" />
            <div className="lada-spine-cord cord-mid" />
            <div className="lada-spine-cord cord-bot" />
          </div>

          {/* ====================================================================
              RIGHT PAGE STACK + DOUBLE-SIDED TURNING LEAF (<div class="turning-leaf">)
             ==================================================================== */}
          <div className="lada-right-page-viewport">
            {/* 1. STATIC REVEALED UNDER-PAGE (Newly revealed page underneath the peel) */}
            <div className="lada-book-page lada-book-page-right lada-under-page">
              <div className="lada-foxing-layer lada-foxing-right" aria-hidden="true" />
              {renderChapterBody(underPageTab, !isTurning, false)}
            </div>

            {/* 2. TRAVELING RIGHT-SIDE LIFT SHADOW ON UNDER-PAGE (updated via DOM ref) */}
            <div
              ref={rightLiftShadowRef}
              className="lada-right-lift-shadow"
              aria-hidden="true"
              style={{
                left: `${Math.max(0, initialGeom.foldBotX - 3)}%`,
                width: `${initialGeom.rightLiftShadowWidthPct}%`,
                opacity: initialGeom.rightLiftShadowOpacity,
                transform: `skewX(${initialGeom.foldAngleDeg.toFixed(2)}deg)`,
              }}
            />

            {/* 3. SECONDARY CASCADE LEAF (Visible during multi-page bookmark jumps, updated via DOM ref!) */}
            {hasSecondaryCascade && (
              <div
                ref={cascadeWrapRef}
                className="turning-leaf turning-leaf-cascade"
                aria-hidden="true"
                style={{ display: 'none' }}
              >
                <div ref={cascadeVersoRef} className="turning-leaf-verso">
                  <div ref={cascadeBellyRef} className="turning-leaf-belly-gradient" />
                </div>
                <svg
                  ref={cascadeSvgRef}
                  className="turning-leaf-curl-svg"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    ref={cascadePolyRef}
                    points={initialGeom.versoPolygonSvgPoints}
                    fill="none"
                    stroke="#1C1613"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            )}

            {/* 4. TRUE DOUBLE-SIDED TURNING LEAF (<div class="turning-leaf">)
                   Synchronized Diagonal Corner-Peel clip-path polygons updated at 60/120 FPS
                   directly via DOM refs — zero React VDOM re-render overhead per frame! */}
            {(isTurning || isPeekingNext) && (
              <div className="turning-leaf" aria-hidden="true">
                {/* FRONT FACE (recto — unpeeled portion on the Right Page) */}
                <div
                  ref={rectoDivRef}
                  className="turning-leaf-recto lada-book-page lada-book-page-right"
                  style={{
                    clipPath: initialGeom.rectoClipPath,
                  }}
                >
                  <div className="lada-foxing-layer lada-foxing-right" />
                  {renderChapterBody(rectoPageTab, false, true)}
                  <div
                    ref={rectoHighlightRef}
                    className="turning-leaf-recto-highlight"
                    style={{
                      backgroundPosition: `${(100 - initialGeom.effectiveP * 100).toFixed(1)}% 0%`,
                    }}
                  />
                </div>

                {/* BACK FACE (verso — Folded Back of Page sweeping across the spine onto the Left Page) */}
                <div
                  ref={versoDivRef}
                  className="turning-leaf-verso"
                  style={{
                    clipPath: initialGeom.versoClipPath,
                    opacity: initialGeom.versoOpacity,
                  }}
                >
                  <div className="lada-foxing-layer lada-foxing-left" />
                  <div
                    ref={inkShowthroughRef}
                    className="turning-leaf-ink-showthrough"
                    style={{
                      opacity: initialGeom.inkShowThroughOpacity,
                      transform: `scaleX(-1) skewY(${initialGeom.archSkewYDeg.toFixed(2)}deg)`,
                    }}
                  >
                    {renderChapterBody(rectoPageTab, false, true)}
                  </div>
                  <div
                    ref={versoBellyRef}
                    className="turning-leaf-belly-gradient"
                    style={{
                      background: `linear-gradient(${(90 + initialGeom.foldAngleDeg).toFixed(
                        1
                      )}deg, rgba(42, 26, 14, 0.28) 0%, rgba(255, 249, 235, 0.32) 34%, rgba(242, 229, 198, 0.08) 68%, rgba(42, 26, 14, 0.36) 100%)`,
                    }}
                  />
                </div>

                {/* Crisp Josef Lada India-Ink Outline & Crease Highlight along the exact Verso Polygon */}
                <svg
                  ref={curlSvgRef}
                  className="turning-leaf-curl-svg"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                  style={{ opacity: initialGeom.versoOpacity }}
                >
                  <polygon
                    ref={curlPolyRef}
                    points={initialGeom.versoPolygonSvgPoints}
                    fill="none"
                    stroke="#1C1613"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    ref={curlLineRef}
                    x1={(initialGeom.creaseTopSpreadX * 2).toFixed(2)}
                    y1="0"
                    x2={(initialGeom.creaseBotSpreadX * 2).toFixed(2)}
                    y2="100"
                    stroke="#FFF9EB"
                    strokeOpacity="0.55"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            )}

            {/* Bottom-Right Dog-Eared Corner Peek (Oslí ucho — Další strana / Next Page) */}
            <button
              type="button"
              className={`lada-dog-ear-bottom lada-dog-ear-next ${
                hoverCorner === 'next' ? 'hovered' : ''
              }`}
              onMouseEnter={() => {
                setHoverCorner('next');
                ladaPageFoley.playCornerHover();
              }}
              onMouseLeave={() => setHoverCorner((c) => (c === 'next' ? null : c))}
              onPointerDown={(e) => handleCornerPointerDown('next', e)}
              onPointerMove={handleCornerPointerMove}
              onPointerUp={handleCornerPointerUp}
              title="Další strana knihy (klikněte nebo chytněte a přetáhněte růžek přes hřbet)"
              aria-label="Další strana knihy"
            >
              <span className="lada-dog-ear-label">Další strana →</span>
              <span className="lada-dog-ear-flap" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
