import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sound } from '../audio';
import { ladaPageFoley } from './ladaPageTurnAudio';
import { GAME_LEVELS, type GameLevelDef } from '../data/levels';
import { HUNTER_UNLOCKS } from '../data/hunterUnlocks';
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

export interface FolklorePocketItem {
  id: string;
  czechName: string;
  folkSubtitle: string;
  categoryLabel: string;
  statsBadge: string;
  rarityColor: string;
  czechLore: string;
  usageNote: string;
  drawSvg: () => React.ReactNode;
}

export const FOLKLORE_POCKET_ITEMS: FolklorePocketItem[] = [
  {
    id: 'buchty_v_uzlicku',
    czechName: 'Buchty v uzlíčku',
    folkSubtitle: 'Poctivé povidlové buchty z pece',
    categoryLabel: 'Dar na cestu · Hojení',
    statsBadge: '+45 Kuráže · Usmíří bubáky',
    rarityColor: '#C83E2B',
    czechLore:
      '„Kdo má v uzlíčku poctivé povidlové buchty od mámy, toho v lese ani hladový hejkal nepřemůže.“',
    usageNote:
      'Teplé kynuté buchty v puntíkovaném šátku obnovují Kuráž a lákají mlsná strašidla.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <path
          d="M 18 48 C 14 30, 30 22, 42 24 C 54 22, 70 30, 66 48 C 64 64, 20 64, 18 48 Z"
          fill="#C83E2B"
          stroke="#1C1613"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M 42 24 C 34 12, 22 10, 26 20 C 30 25, 38 25, 42 24 Z"
          fill="#C83E2B"
          stroke="#1C1613"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 42 24 C 50 12, 62 10, 58 20 C 54 25, 46 25, 42 24 Z"
          fill="#C83E2B"
          stroke="#1C1613"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse
          cx="42"
          cy="42"
          rx="17"
          ry="11"
          fill="#E2A83B"
          stroke="#1C1613"
          strokeWidth="2.8"
        />
        <path d="M 35 34 Q 42 42, 35 50 M 49 34 Q 42 42, 49 50" stroke="#1C1613" strokeWidth="2" fill="none" />
        <circle cx="26" cy="52" r="2.3" fill="#F6EBD8" />
        <circle cx="57" cy="51" r="2.3" fill="#F6EBD8" />
        <circle cx="42" cy="58" r="2.3" fill="#F6EBD8" />
      </svg>
    ),
  },
  {
    id: 'certuv_roh',
    czechName: 'Čertův roh z kovárny',
    folkSubtitle: 'Očouzený suvenýr z pekla',
    categoryLabel: 'Pekelná trofej · Síla',
    statsBadge: '+25 % Zásah · Pekelný žár',
    rarityColor: '#C83E2B',
    czechLore:
      '„Upadl starému čertovi, když ho kovář v Hrusicích vzal kleštěmi za nos a vyprovodil ze dveří.“',
    usageNote:
      'Zakroucený roh dosud hřeje pekelným uhlím a přidává zbraním pádnou sílu proti noční chásce.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <path
          d="M 22 62 C 16 38, 32 16, 62 18 C 52 28, 42 40, 40 60 Z"
          fill="#2B5B84"
          stroke="#1C1613"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path d="M 25 50 Q 34 48, 39 53 M 29 38 Q 38 36, 44 41 M 36 28 Q 44 27, 49 31" stroke="#1C1613" strokeWidth="2.4" fill="none" />
        <circle cx="58" cy="28" r="4" fill="#C83E2B" stroke="#1C1613" strokeWidth="2" />
        <circle cx="24" cy="24" r="3" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'hrnecek_s_dusickou',
    czechName: 'Hrneček s dušičkou',
    folkSubtitle: 'Malovaný hrníček s pokličkou',
    categoryLabel: 'Vodníkův poklad · Čáry',
    statsBadge: '+1 Dušička · Ochrana u vody',
    rarityColor: '#2B5B84',
    czechLore:
      '„Pod pokličkou to tichounce šplouchá a svítí. Kdo hrneček odklopí na břehu, vysvobodí dušičku z tůně.“',
    usageNote:
      'Keramický hrníček střežený starým hastrmanem pod vrbou vyzařuje tiché světlo a chrání u vody.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <ellipse cx="40" cy="64" rx="24" ry="5.5" fill="#F6EBD8" stroke="#1C1613" strokeWidth="3" />
        <path
          d="M 22 34 L 26 60 C 28 65, 52 65, 54 60 L 58 34 Z"
          fill="#2B5B84"
          stroke="#1C1613"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          d="M 56 39 C 68 39, 68 55, 54 55"
          fill="none"
          stroke="#1C1613"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="40" cy="48" r="5.5" fill="#E2A83B" stroke="#1C1613" strokeWidth="2" />
        <circle cx="40" cy="48" r="2" fill="#C83E2B" />
        <ellipse
          cx="39"
          cy="29"
          rx="20"
          ry="5"
          transform="rotate(-8 39 29)"
          fill="#F6EBD8"
          stroke="#1C1613"
          strokeWidth="3"
        />
        <circle cx="38" cy="22" r="4" fill="#C83E2B" stroke="#1C1613" strokeWidth="2.4" />
        <path d="M 48 22 C 52 14, 58 16, 54 25" stroke="#E2A83B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'kouzelna_pistalka',
    czechName: 'Kouzelná vrbová píšťalka',
    folkSubtitle: 'Jarní píšťalka z vrbové kůry',
    categoryLabel: 'Pasáčkův nástroj · Rychlost',
    statsBadge: '+18 % Nabíjení · Veselá nota',
    rarityColor: '#4D784E',
    czechLore:
      '„Uřezaná na jaře z čerstvého vrbového proutku, když míza stoupá: ‚Otloukej se, píšťaličko, nebudeš-li se otloukati...‘“',
    usageNote:
      'Veselá písnička pasáčka zahání chmury v lese a zrychluje kadenci všech venkovských zbraní.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <g transform="rotate(-28 42 42)">
          <rect
            x="14"
            y="36"
            width="56"
            height="13"
            rx="5"
            fill="#E2A83B"
            stroke="#1C1613"
            strokeWidth="3.2"
          />
          <rect
            x="38"
            y="36"
            width="32"
            height="13"
            rx="4"
            fill="#4D784E"
            stroke="#1C1613"
            strokeWidth="3"
          />
          <circle cx="46" cy="42.5" r="2.2" fill="#1C1613" />
          <circle cx="54" cy="42.5" r="2.2" fill="#1C1613" />
          <circle cx="62" cy="42.5" r="2.2" fill="#1C1613" />
        </g>
        <path d="M 54 18 L 54 30 M 54 18 L 64 15 L 64 27" stroke="#1C1613" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="52" cy="30" r="2.8" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.6" />
        <circle cx="62" cy="27" r="2.8" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'osikovy_prut',
    czechName: 'Poctivý osikový prut',
    folkSubtitle: 'Pružný proutek od rybníka',
    categoryLabel: 'Základní zbraň · Švih',
    statsBadge: 'Široký švih · Odraz strašidel',
    rarityColor: '#4D784E',
    czechLore:
      '„Na rarášky a noční darmošlapy platí nejlépe pružný proutek z osiky, namočený v obecním rybníku.“',
    usageNote:
      'Klasický ohebný prut s jarními lístky svižně práská kolem lovce a zahání dotěrné skřítky.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <path
          d="M 18 66 Q 38 38, 66 18"
          fill="none"
          stroke="#1C1613"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 18 66 Q 38 38, 66 18"
          fill="none"
          stroke="#E2A83B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M 48 32 C 44 20, 54 14, 60 22 C 56 28, 52 32, 48 32 Z"
          fill="#4D784E"
          stroke="#1C1613"
          strokeWidth="2.5"
        />
        <path
          d="M 36 46 C 26 42, 26 32, 36 34 C 40 38, 38 44, 36 46 Z"
          fill="#4D784E"
          stroke="#1C1613"
          strokeWidth="2.5"
        />
      </svg>
    ),
  },
  {
    id: 'pytlacka_petrolejka',
    czechName: 'Pytlácká petrolejka',
    folkSubtitle: 'Mosazná lucerna ponocného',
    categoryLabel: 'Světlo v noci · Dosah',
    statsBadge: '+30 Dosah sběru · Záře v mlze',
    rarityColor: '#E2A83B',
    czechLore:
      '„Hřejivý plamínek v mosazné lucerně prosvětlí i nejhlubší lesní houštinu a ukáže zatoulané krejcary.“',
    usageNote:
      'Zlatavé světlo lucerny rozhání noční stíny na návsi a přitahuje perníčky i krejcary z větší dálky.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <circle cx="42" cy="44" r="24" fill="#E2A83B" fillOpacity="0.28" />
        <path d="M 30 24 L 54 24 L 50 16 L 34 16 Z" fill="#2B5B84" stroke="#1C1613" strokeWidth="2.8" strokeLinejoin="round" />
        <rect x="28" y="56" width="28" height="10" rx="3" fill="#C83E2B" stroke="#1C1613" strokeWidth="2.8" />
        <path d="M 32 24 L 29 56 L 55 56 L 52 24 Z" fill="#F6EBD8" stroke="#1C1613" strokeWidth="2.8" strokeLinejoin="round" />
        <path
          d="M 42 32 C 36 40, 37 50, 42 52 C 47 50, 48 40, 42 32 Z"
          fill="#E2A83B"
          stroke="#1C1613"
          strokeWidth="2.2"
        />
      </svg>
    ),
  },
  {
    id: 'medvedi_mast',
    czechName: 'Bylinková medvědí mast',
    folkSubtitle: 'Kamenný kelímek od kořenářky',
    categoryLabel: 'Kořenářčin kelímek · Kuráž',
    statsBadge: '+30 Max Kuráže · Zocelení',
    rarityColor: '#4D784E',
    czechLore:
      '„Svařená o svatojánské noci z devatera kvítí, smůly a medvědího sádla. Dává chasníkům medvědí výdrž.“',
    usageNote:
      'Kameninový kelímek převázaný režným provázkem trvale posiluje maximální Kuráž pro dlouhé zimní noci.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <rect x="24" y="30" width="36" height="36" rx="8" fill="#E2A83B" stroke="#1C1613" strokeWidth="3.2" />
        <path d="M 22 24 L 62 24 L 58 32 L 26 32 Z" fill="#F6EBD8" stroke="#1C1613" strokeWidth="3" strokeLinejoin="round" />
        <rect x="30" y="40" width="24" height="16" rx="3" fill="#F6EBD8" stroke="#1C1613" strokeWidth="2.2" />
        <path d="M 42 43 L 42 53 M 37 48 L 47 48" stroke="#C83E2B" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'krajac_povidel',
    czechName: 'Krajáč švestkových povidel',
    folkSubtitle: 'Malovaný džbánek ze špajzu',
    categoryLabel: 'Dědečkův dar · Zpomalení',
    statsBadge: '-35 % Rychlost bubáků v louži',
    rarityColor: '#2B5B84',
    czechLore:
      '„Tak hustá a sladká povidla, že v nich uvízne i splašený hejkal a zapomene, kam vlastně pospíchal.“',
    usageNote:
      'Poctivá domácí švestková povidla v puntíkovaném krajáči lepí bubákům paty a brzdí jejich úprk.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <path
          d="M 25 28 C 20 42, 22 62, 30 66 L 54 66 C 62 62, 64 42, 59 28 Z"
          fill="#C83E2B"
          stroke="#1C1613"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <ellipse cx="42" cy="28" rx="17" ry="5" fill="#2B5B84" stroke="#1C1613" strokeWidth="3" />
        <circle cx="34" cy="46" r="2.8" fill="#F6EBD8" />
        <circle cx="48" cy="44" r="2.8" fill="#F6EBD8" />
        <circle cx="41" cy="55" r="2.8" fill="#F6EBD8" />
      </svg>
    ),
  },
  {
    id: 'svaty_kropac',
    czechName: 'Kostelníkův svatý kropáč',
    folkSubtitle: 'Posvěcená kropenka od oltáře',
    categoryLabel: 'Posvěcená zbraň · Světlo',
    statsBadge: 'Dvojnásobný zásah nemrtvým',
    rarityColor: '#2B5B84',
    czechLore:
      '„Když kostelník třikrát máchne kropáčem u hřbitovní zdi, kostlivci si raději spořádaně lehnou zpátky pod drn.“',
    usageNote:
      'Rozstřikuje svěcenou studánkovou vodu v širokém oblouku a zahání kostlivce, umrlce i čerty.',
    drawSvg: () => (
      <svg viewBox="0 0 84 84" className="w-16 h-16 overflow-visible">
        <line x1="22" y1="64" x2="50" y2="36" stroke="#1C1613" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="22" y1="64" x2="50" y2="36" stroke="#E2A83B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="54" cy="32" r="11" fill="#E2A83B" stroke="#1C1613" strokeWidth="3.2" />
        <circle cx="51" cy="29" r="1.6" fill="#1C1613" />
        <circle cx="57" cy="30" r="1.6" fill="#1C1613" />
        <circle cx="54" cy="35" r="1.6" fill="#1C1613" />
        <path d="M 68 18 C 68 23, 63 23, 63 18 C 63 15, 65.5 12, 65.5 12 C 65.5 12, 68 15, 68 18 Z" fill="#2B5B84" stroke="#1C1613" strokeWidth="1.8" />
        <path d="M 38 18 C 38 22, 34 22, 34 18 C 34 15, 36 13, 36 13 C 36 13, 38 15, 38 18 Z" fill="#2B5B84" stroke="#1C1613" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export interface FolkBestiaryPreviewEntry {
  id: string;
  czechName: string;
  folkSubtitle: string;
  habitat: string;
  weakness: string;
  gouacheBg: string;
  lore: string;
  drawCreatureSvg: () => React.ReactNode;
}

const FOLK_BESTIARY_ENTRIES: FolkBestiaryPreviewEntry[] = [
  {
    id: 'vodnik',
    czechName: 'Hastrman od vrb',
    folkSubtitle: 'Pán vrbové tůně a stavidel',
    habitat: 'Rybník a mlýnský náhon',
    weakness: 'Usmíří ho teplá buchta, nemá rád suché pruty',
    gouacheBg: '#2B5B84',
    lore: 'Sedává za měsíčních nocí na hlavaté vrbě, bafá z fajfky a v zeleném šosatém fraku přešívá střevíce. Ze šosu mu věčně kape voda.',
    drawCreatureSvg: () => (
      <svg viewBox="0 0 110 110" className="w-24 h-24 overflow-visible">
        <rect x="6" y="6" width="98" height="98" rx="10" fill="url(#lada-crosshatch)" />
        <path d="M 10 86 Q 55 78, 100 88" stroke="#1C1613" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 36 52 L 28 82 L 82 82 L 74 52 Z" fill="#4D784E" stroke="#1C1613" strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="55" cy="40" r="15" fill="#7BA07B" stroke="#1C1613" strokeWidth="3.2" />
        <circle cx="50" cy="38" r="2.2" fill="#1C1613" />
        <circle cx="60" cy="38" r="2.2" fill="#1C1613" />
        <path d="M 49 46 Q 55 50, 61 46" stroke="#1C1613" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M 60 47 Q 76 49, 80 42 L 85 42 L 84 50 Q 76 54, 60 47 Z" fill="#E2A83B" stroke="#1C1613" strokeWidth="2.2" />
        <ellipse cx="55" cy="26" rx="21" ry="4.5" fill="#4D784E" stroke="#1C1613" strokeWidth="3" />
        <path d="M 42 26 L 44 10 L 66 10 L 68 26 Z" fill="#4D784E" stroke="#1C1613" strokeWidth="3" strokeLinejoin="round" />
        <rect x="43" y="20" width="24" height="5" fill="#C83E2B" stroke="#1C1613" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'rarach',
    czechName: 'Rarášek šotek',
    folkSubtitle: 'Čiperný šotek z kovářské pece',
    habitat: 'Rozpálené pece a stodoly',
    weakness: 'Kropáč se svěcenou vodou a rychlý prut',
    gouacheBg: '#C83E2B',
    lore: 'Čiperný venkovský nezbeda v rudém kožíšku, jenž v noci plete koním hřívy, krade ze špajzu povidla a práská dvířky od pece.',
    drawCreatureSvg: () => (
      <svg viewBox="0 0 110 110" className="w-24 h-24 overflow-visible">
        <rect x="6" y="6" width="98" height="98" rx="10" fill="url(#lada-crosshatch)" />
        <path d="M 38 56 L 32 86 L 78 86 L 72 56 Z" fill="#C83E2B" stroke="#1C1613" strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="55" cy="40" r="15" fill="#C83E2B" stroke="#1C1613" strokeWidth="3.2" />
        <path d="M 44 28 C 36 16, 40 10, 48 22" fill="#221B17" stroke="#1C1613" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 66 28 C 74 16, 70 10, 62 22" fill="#221B17" stroke="#1C1613" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="49" cy="38" r="2.8" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.5" />
        <circle cx="61" cy="38" r="2.8" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.5" />
        <path d="M 48 46 Q 55 51, 62 46" stroke="#1C1613" strokeWidth="2.5" fill="none" />
        <path d="M 53 48 C 53 56, 59 56, 58 48 Z" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'klekanice',
    czechName: 'Šerá Klekánice',
    folkSubtitle: 'Večerní postrach opozdilců',
    habitat: 'Okolí zvonice a náves',
    weakness: 'Jasná záře petrolejky a kostelní zvon',
    gouacheBg: '#E2A83B',
    lore: 'Jakmile ze zvonice odzvoní klekání, vynoří se z večerní mlhy v šedém plášti a dívá se, kdo zůstal venku po soumraku.',
    drawCreatureSvg: () => (
      <svg viewBox="0 0 110 110" className="w-24 h-24 overflow-visible">
        <rect x="6" y="6" width="98" height="98" rx="10" fill="url(#lada-crosshatch)" />
        <path d="M 24 88 C 26 42, 38 16, 55 16 C 72 16, 84 42, 86 88 Z" fill="#2B5B84" stroke="#1C1613" strokeWidth="3.2" strokeLinejoin="round" />
        <ellipse cx="55" cy="44" rx="13" ry="14" fill="#F6EBD8" stroke="#1C1613" strokeWidth="2.8" />
        <circle cx="50" cy="42" r="2.2" fill="#1C1613" />
        <circle cx="60" cy="42" r="2.2" fill="#1C1613" />
        <path d="M 55 43 L 52 50 L 57 50" fill="none" stroke="#1C1613" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="55" cy="62" r="5" fill="#C83E2B" stroke="#1C1613" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    id: 'hejkal',
    czechName: 'Lesní Hejkal z boru',
    folkSubtitle: 'Divoký pán hlubokého hvozdu',
    habitat: 'Hustý borový les',
    weakness: 'Neodpovídat mu na zahoukání a pálit z dálky',
    gouacheBg: '#4D784E',
    lore: 'Zarostlý divous v mechovém kožichu s větvičkami ve vousech. Kdo mu v lese odpoví na jeho „Hej, hej!“, tomu skočí za krk.',
    drawCreatureSvg: () => (
      <svg viewBox="0 0 110 110" className="w-24 h-24 overflow-visible">
        <rect x="6" y="6" width="98" height="98" rx="10" fill="url(#lada-crosshatch)" />
        <path d="M 26 88 C 24 50, 36 22, 55 22 C 74 22, 86 50, 84 88 Z" fill="#4D784E" stroke="#1C1613" strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M 42 24 L 34 10 M 68 24 L 76 10 M 55 22 L 55 8" stroke="#1C1613" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="42" r="2.5" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.6" />
        <circle cx="62" cy="42" r="2.5" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.6" />
        <ellipse cx="55" cy="54" rx="8" ry="6" fill="#C83E2B" stroke="#1C1613" strokeWidth="2.6" />
      </svg>
    ),
  },
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

const PORTRAIT_CHARACTERS: Array<{
  id: CharacterType;
  czechTitle: string;
  czechSubtitle: string;
  hp: number;
  maxHp: number;
  magic: number;
  maxMagic: number;
  quote: string;
}> = [
  {
    id: 'krajanek',
    czechTitle: 'Vandrovní Krajánek',
    czechSubtitle: 'Mlynářský chasník a hraniční obránce',
    hp: 170,
    maxHp: 170,
    magic: 100,
    maxMagic: 100,
    quote:
      '„Z mlýna do mlýna putuje veselý krajánek s uzlíčkem buchet a mlýnským kamenem. Kde udeří do země, tam se bubákům zatočí šiška!“',
  },
  {
    id: 'wanderer',
    czechTitle: 'Vesnický Tulák',
    czechSubtitle: 'Znalec polních mezí a mistr osikového prutu',
    hp: 150,
    maxHp: 150,
    magic: 95,
    maxMagic: 100,
    quote:
      '„Kdo zná každou polní mez a u potoka si uřízne pružný osikový prut, ten se ani půlnoční chásky u kapličky nezalekne.“',
  },
  {
    id: 'shepherd',
    czechTitle: 'Veselý Pasáček',
    czechSubtitle: 'Čiperný chasník a pán vrbové muziky',
    hp: 140,
    maxHp: 140,
    magic: 115,
    maxMagic: 120,
    quote:
      '„Jen co pasáček zaduje do vrbové píšťalky a zazvoní kozím zvonkem, dají se noční strašidla do tance, až z nich lítají krejcary!“',
  },
  {
    id: 'watchman',
    czechTitle: 'Hrusický Ponocný',
    czechSubtitle: 'Strážce nočního klidu s lucernou a halapartnou',
    hp: 180,
    maxHp: 180,
    magic: 110,
    maxMagic: 110,
    quote:
      '„Chval každý duch Hospodina i v noční hodinu! Ponocný zatroubí na roh, rozsvítí lucernu a zbloudilé duše provede bezpečně k domovu.“',
  },
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
  const [selectedPocketItem, setSelectedPocketItem] = useState<FolklorePocketItem>(
    FOLKLORE_POCKET_ITEMS[0]
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

  // Signpost coordinates on the Right-Page Illustrated Landscape Map (aligned 1:1 with the 8 GAME_LEVELS)
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
  ];

  const hpPct = Math.round((activePortrait.hp / activePortrait.maxHp) * 100);
  const magicPct = Math.round((activePortrait.magic / activePortrait.maxMagic) * 100);
  const storyFirstLetter = activePortrait.quote.replace(/^„/, '').charAt(0) || 'B';
  const storyRestText = activePortrait.quote.replace(/^„./, '„');

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
              ? 'Kapitola II · Mošna a poklady'
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
              <h2 className="lada-chapter-heading">Mošna a poklady</h2>
              <p className="lada-chapter-sub">
                Sběratelské album nalezených pokladů
              </p>
            </div>

            <div className="lada-fotoruzky-grid" role="listbox" aria-label="Předměty v mošně">
              {FOLKLORE_POCKET_ITEMS.map((item) => {
                const isActive = selectedPocketItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    disabled={!isStaticInteractive}
                    className={`lada-fotoruzky-slot ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (!isStaticInteractive) return;
                      ladaPageFoley.playCornerHover();
                      sound.coin();
                      setSelectedPocketItem(item);
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

                    <div className="lada-slot-illustration" style={{ mixBlendMode: 'multiply' }}>
                      {item.drawSvg()}
                    </div>
                    <span className="lada-slot-caption">{item.czechName}</span>
                  </button>
                );
              })}
            </div>

            <div
              className={`lada-ex-libris-slip ${
                settleThudJolt ? 'lada-ex-libris-thud-jolt' : ''
              }`}
            >
              <div className="lada-brass-pin" aria-hidden="true" />
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="lada-ex-libris-kicker">
                    EX LIBRIS BUBÁKOV · {selectedPocketItem.categoryLabel}
                  </div>
                  <h3 className="lada-ex-libris-title">
                    {selectedPocketItem.czechName}{' '}
                    <span className="text-xs font-normal italic opacity-80">
                      ({selectedPocketItem.folkSubtitle})
                    </span>
                  </h3>
                </div>
                <span
                  className="lada-ex-libris-stat"
                  style={{ backgroundColor: selectedPocketItem.rarityColor }}
                >
                  {selectedPocketItem.statsBadge}
                </span>
              </div>
              <p className="lada-ex-libris-lore">{selectedPocketItem.czechLore}</p>
              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-dashed border-[#6E3B1E]/40">
                <span className="text-xs italic text-[#221B17]/80">
                  {selectedPocketItem.usageNote}
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
                  ⚔ Otevřít celou Zbrojnici ({unlockedWeaponsCount}/{totalWeaponsCount})
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'bestiary' && (
          <div className="lada-right-tab-content">
            <div className="lada-chapter-heading-wrap">
              <h2 className="lada-chapter-heading">Bubáci a hastrmani</h2>
              <p className="lada-chapter-sub">
                Lidový bestiář: slabiny a zvyky nočních běsů
              </p>
            </div>

            <div className="lada-bestiary-spread-grid">
              {FOLK_BESTIARY_ENTRIES.map((entry) => {
                const isSelected = selectedBestiaryEntry.id === entry.id;
                const killCount = meta.bestiaryKills?.[entry.id] || 0;
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
                        mixBlendMode: 'multiply',
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
                        Zklidněno v noci: {killCount}×
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="lada-ex-libris-kicker">
                    ZÁPIS V KRONICE STRAŠIDEL · {selectedBestiaryEntry.habitat}
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
              <p className="lada-ex-libris-lore mt-1">
                <strong>Rada hospodáře:</strong> „{selectedBestiaryEntry.weakness}.“{' '}
                {selectedBestiaryEntry.lore}
              </p>
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
              🎒 Mošna a poklady ({unlockedWeaponsCount}/{totalWeaponsCount})
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

            {/* 1. OVAL FOLKLORIC GARLAND PORTRAIT FRAME */}
            <div className="lada-portrait-section">
              <div
                className="lada-oval-garland-frame"
                onClick={handleCyclePortrait}
                title="Klikněte pro přelistování postavy v medailonu (Krajánek / Tulák / Pasáček / Ponocný)"
              >
                <svg
                  viewBox="0 0 240 190"
                  className="w-full h-full overflow-visible"
                  style={{ filter: 'url(#lada-ink-filter)' }}
                >
                  <defs>
                    <clipPath id="lada-oval-clip">
                      <ellipse cx="120" cy="95" rx="86" ry="72" />
                    </clipPath>
                  </defs>

                  <g clipPath="url(#lada-oval-clip)" style={{ mixBlendMode: 'multiply' }}>
                    <rect x="20" y="15" width="200" height="160" fill="#2B5B84" fillOpacity="0.9" />
                    <path
                      d="M 64 42 A 14 14 0 1 0 78 58 A 11 11 0 1 1 64 42 Z"
                      fill="#E2A83B"
                      stroke="#1C1613"
                      strokeWidth="2"
                    />
                    <circle cx="172" cy="40" r="2.5" fill="#E2A83B" />
                    <circle cx="152" cy="54" r="2" fill="#F6EBD8" />
                    <circle cx="94" cy="34" r="2" fill="#F6EBD8" />

                    <rect
                      x="154"
                      y="96"
                      width="34"
                      height="22"
                      fill="#F6EBD8"
                      stroke="#1C1613"
                      strokeWidth="2.4"
                    />
                    <polygon
                      points="150,96 171,78 192,96"
                      fill="#C83E2B"
                      stroke="#1C1613"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="166"
                      y="102"
                      width="8"
                      height="8"
                      fill="#E2A83B"
                      stroke="#1C1613"
                      strokeWidth="1.8"
                    />

                    <ellipse
                      cx="120"
                      cy="148"
                      rx="95"
                      ry="32"
                      fill="#4D784E"
                      stroke="#1C1613"
                      strokeWidth="3"
                    />
                    <ellipse
                      cx="92"
                      cy="154"
                      rx="58"
                      ry="16"
                      fill="#2B5B84"
                      stroke="#1C1613"
                      strokeWidth="2.5"
                    />

                    <path
                      d="M 44 142 C 46 118, 40 94, 48 82 C 56 80, 62 86, 58 102 C 55 116, 58 132, 60 142 Z"
                      fill="#6E3B1E"
                      stroke="#1C1613"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 48 82 Q 32 60, 26 48 M 50 80 Q 48 56, 46 42 M 54 82 Q 66 58, 72 48"
                      stroke="#4D784E"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {activePortrait.id === 'krajanek' && (
                      <g transform="translate(88, 52)">
                        {/* Sturdy Miller Walking Stick & Red Polka-Dot Bundle */}
                        <line
                          x1="62"
                          y1="18"
                          x2="56"
                          y2="96"
                          stroke="#1C1613"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {/* Spotted Red Cloth Bundle */}
                        <circle cx="58" cy="24" r="11" fill="#C83E2B" stroke="#1C1613" strokeWidth="2.6" />
                        <circle cx="54" cy="20" r="2.2" fill="#FFFDF7" />
                        <circle cx="62" cy="22" r="2.2" fill="#FFFDF7" />
                        <circle cx="58" cy="28" r="2.2" fill="#FFFDF7" />
                        <path d="M 52 16 C 50 10, 60 10, 58 16" fill="#C83E2B" stroke="#1C1613" strokeWidth="2" />

                        {/* Miller's Ochre Yellow Coat */}
                        <path
                          d="M 14 54 L 6 96 L 62 96 L 54 54 Z"
                          fill="#E2A83B"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        {/* Rustic White Undershirt & Brass Buttons */}
                        <path
                          d="M 22 54 L 20 90 L 48 90 L 46 54 Z"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="2.6"
                        />
                        <circle cx="34" cy="64" r="2.2" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.2" />
                        <circle cx="34" cy="74" r="2.2" fill="#C83E2B" stroke="#1C1613" strokeWidth="1.2" />

                        {/* Head & Cheerful Face */}
                        <circle
                          cx="34"
                          cy="38"
                          r="15.5"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                        />
                        <circle cx="29" cy="36" r="2.3" fill="#1C1613" />
                        <circle cx="39" cy="36" r="2.3" fill="#1C1613" />
                        <circle cx="26" cy="41" r="3.2" fill="#C83E2B" fillOpacity="0.45" />
                        <circle cx="42" cy="41" r="3.2" fill="#C83E2B" fillOpacity="0.45" />
                        <path
                          d="M 28 44 Q 34 49, 40 44"
                          stroke="#1C1613"
                          strokeWidth="2.4"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Peasant Miller Cap (Navy with red feather cockade) */}
                        <ellipse
                          cx="34"
                          cy="24"
                          rx="22"
                          ry="5.5"
                          fill="#221B17"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <path
                          d="M 19 24 C 20 10, 48 10, 49 24 Z"
                          fill="#2B5B84"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <path
                          d="M 44 16 C 54 6, 64 8, 56 20"
                          fill="#C83E2B"
                          stroke="#1C1613"
                          strokeWidth="2.2"
                        />
                      </g>
                    )}

                    {activePortrait.id === 'wanderer' && (
                      <g transform="translate(88, 52)">
                        {/* Slender Willow Fishing Rod & Line */}
                        <path
                          d="M 64 96 Q 60 40, 72 10"
                          stroke="#7A5832"
                          strokeWidth="3.4"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 72 10 Q 76 35, 68 60"
                          stroke="#1C1613"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          fill="none"
                        />

                        {/* Weathered Moss Green Coat */}
                        <path
                          d="M 14 54 L 6 96 L 62 96 L 54 54 Z"
                          fill="#4D784E"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M 23 54 L 21 90 L 47 90 L 45 54 Z"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="2.6"
                        />
                        <circle cx="34" cy="65" r="2.2" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.2" />
                        <circle cx="34" cy="76" r="2.2" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.2" />

                        {/* Head & Weathered Face with Clay Pipe */}
                        <circle
                          cx="34"
                          cy="38"
                          r="15.5"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                        />
                        <circle cx="29" cy="36" r="2.3" fill="#1C1613" />
                        <circle cx="39" cy="36" r="2.3" fill="#1C1613" />
                        <circle cx="26" cy="41" r="3.2" fill="#C83E2B" fillOpacity="0.35" />
                        <circle cx="42" cy="41" r="3.2" fill="#C83E2B" fillOpacity="0.35" />
                        {/* Clay Pipe */}
                        <path
                          d="M 38 46 Q 52 48, 56 42 L 60 42 L 59 48 Q 50 53, 38 46 Z"
                          fill="#E2A83B"
                          stroke="#1C1613"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="62" cy="35" r="3.5" fill="#F6EBD8" fillOpacity="0.75" />

                        {/* Wide-Brimmed Felt Hat */}
                        <ellipse
                          cx="34"
                          cy="23"
                          rx="24"
                          ry="6"
                          fill="#5D3A1A"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <path
                          d="M 20 23 L 23 7 L 45 7 L 48 23 Z"
                          fill="#6E4423"
                          stroke="#1C1613"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                      </g>
                    )}

                    {activePortrait.id === 'shepherd' && (
                      <g transform="translate(88, 52)">
                        {/* Shepherd's Willow Whistle in Hand */}
                        <path
                          d="M 36 46 L 54 48 L 53 54 L 35 52 Z"
                          fill="#D97706"
                          stroke="#1C1613"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />
                        <circle cx="42" cy="49" r="1.3" fill="#1C1613" />
                        <circle cx="47" cy="50" r="1.3" fill="#1C1613" />

                        {/* Sheepskin Vest over Red Plaid Shirt */}
                        <path
                          d="M 14 54 L 6 96 L 62 96 L 54 54 Z"
                          fill="#C83E2B"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        {/* Fluffy Sheepskin Vest Front */}
                        <path
                          d="M 20 54 Q 18 72, 19 92 L 49 92 Q 50 72, 48 54 Z"
                          fill="#F4EED8"
                          stroke="#1C1613"
                          strokeWidth="2.6"
                          strokeLinejoin="round"
                        />
                        <line x1="34" y1="56" x2="34" y2="90" stroke="#1C1613" strokeWidth="2" strokeDasharray="3 3" />

                        {/* Head & Youthful Face */}
                        <circle
                          cx="34"
                          cy="38"
                          r="15"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                        />
                        <circle cx="29" cy="35" r="2.3" fill="#1C1613" />
                        <circle cx="39" cy="35" r="2.3" fill="#1C1613" />
                        <circle cx="25" cy="40" r="3.4" fill="#C83E2B" fillOpacity="0.5" />
                        <circle cx="43" cy="40" r="3.4" fill="#C83E2B" fillOpacity="0.5" />
                        <path
                          d="M 28 44 Q 34 49, 40 44"
                          stroke="#1C1613"
                          strokeWidth="2.4"
                          fill="none"
                          strokeLinecap="round"
                        />

                        {/* Young Peasant Cap with Tassel */}
                        <ellipse
                          cx="34"
                          cy="24"
                          rx="21"
                          ry="5.5"
                          fill="#221B17"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <path
                          d="M 20 24 C 20 12, 48 12, 48 24 Z"
                          fill="#2B5B84"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <line x1="48" y1="20" x2="56" y2="28" stroke="#E2A83B" strokeWidth="2.8" strokeLinecap="round" />
                        <circle cx="57" cy="30" r="3" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.4" />
                      </g>
                    )}

                    {activePortrait.id === 'watchman' && (
                      <g transform="translate(88, 52)">
                        {/* Night Watchman Halberd Staff & Blade */}
                        <line
                          x1="62"
                          y1="10"
                          x2="56"
                          y2="96"
                          stroke="#1C1613"
                          strokeWidth="3.8"
                          strokeLinecap="round"
                        />
                        {/* Crescent Moon Halberd Blade */}
                        <path
                          d="M 62 10 Q 72 16, 70 28 Q 63 24, 62 10 Z"
                          fill="#78716C"
                          stroke="#1C1613"
                          strokeWidth="2.2"
                        />
                        <path
                          d="M 62 8 L 62 2 L 64 2 L 64 8 Z"
                          fill="#78716C"
                          stroke="#1C1613"
                          strokeWidth="1.5"
                        />

                        {/* Heavy Navy Night Watchman Greatcoat */}
                        <path
                          d="M 14 54 L 6 96 L 62 96 L 54 54 Z"
                          fill="#1E293B"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                          strokeLinejoin="round"
                        />
                        {/* Large Warm Collar */}
                        <path
                          d="M 16 54 L 28 66 L 40 66 L 52 54 Z"
                          fill="#334155"
                          stroke="#1C1613"
                          strokeWidth="2.4"
                        />
                        {/* Brass Lantern in Hand */}
                        <rect x="10" y="66" width="12" height="16" rx="2" fill="#FACC15" stroke="#1C1613" strokeWidth="2.2" />
                        <line x1="16" y1="62" x2="16" y2="66" stroke="#1C1613" strokeWidth="2" />
                        <circle cx="16" cy="74" r="3" fill="#FFFDF7" />

                        {/* Head & Stern Vigilant Face with Beard */}
                        <circle
                          cx="34"
                          cy="38"
                          r="15.5"
                          fill="#F6EBD8"
                          stroke="#1C1613"
                          strokeWidth="3.2"
                        />
                        <circle cx="29" cy="35" r="2.3" fill="#1C1613" />
                        <circle cx="39" cy="35" r="2.3" fill="#1C1613" />
                        {/* Graying Beard */}
                        <path
                          d="M 26 42 Q 34 53, 42 42 Z"
                          fill="#E2E8F0"
                          stroke="#1C1613"
                          strokeWidth="2.2"
                        />

                        {/* Tall Black Night Watchman Hat */}
                        <ellipse
                          cx="34"
                          cy="24"
                          rx="22"
                          ry="5.5"
                          fill="#1C1613"
                          stroke="#1C1613"
                          strokeWidth="3"
                        />
                        <path
                          d="M 21 24 L 23 8 L 45 8 L 47 24 Z"
                          fill="#0F172A"
                          stroke="#1C1613"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                      </g>
                    )}
                  </g>

                  <ellipse
                    cx="120"
                    cy="95"
                    rx="86"
                    ry="72"
                    fill="none"
                    stroke="#1C1613"
                    strokeWidth="4.2"
                  />
                  <ellipse
                    cx="120"
                    cy="95"
                    rx="92"
                    ry="78"
                    fill="none"
                    stroke="#E2A83B"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <ellipse
                    cx="120"
                    cy="95"
                    rx="95"
                    ry="81"
                    fill="none"
                    stroke="#1C1613"
                    strokeWidth="2.5"
                  />

                  {[
                    { cx: 30, cy: 65, col: '#C83E2B' },
                    { cx: 30, cy: 125, col: '#E2A83B' },
                    { cx: 210, cy: 65, col: '#C83E2B' },
                    { cx: 210, cy: 125, col: '#E2A83B' },
                    { cx: 120, cy: 16, col: '#C83E2B' },
                  ].map((fl, idx) => (
                    <g key={idx} transform={`translate(${fl.cx}, ${fl.cy})`}>
                      <path
                        d="M -10 0 C -14 -8, -4 -14, 0 -4 C 4 -14, 14 -8, 10 0 Z"
                        fill="#4D784E"
                        stroke="#1C1613"
                        strokeWidth="2"
                      />
                      <circle cx="0" cy="0" r="6.5" fill={fl.col} stroke="#1C1613" strokeWidth="2.2" />
                      <circle cx="0" cy="0" r="2.5" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.4" />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="lada-portrait-caption">
                <div className="lada-portrait-title">{activePortrait.czechTitle}</div>
                <div className="lada-portrait-subtitle">{activePortrait.czechSubtitle}</div>
                <button
                  type="button"
                  className="lada-inline-switch-btn"
                  onClick={handleCyclePortrait}
                >
                  🔄 Přelistovat postavu ({(portraitIndex % PORTRAIT_CHARACTERS.length) + 1}/{PORTRAIT_CHARACTERS.length})
                </button>
              </div>
            </div>

            {/* 2. VITALITY & MAGIC GAUGES (Kuráž & Čáry) */}
            <div className="lada-gauges-block">
              <div className="lada-vessel-row">
                <div className="lada-ceramic-vessel" aria-hidden="true">
                  <svg viewBox="0 0 44 44" className="w-10 h-10 overflow-visible">
                    <path
                      d="M 13 12 L 31 12 L 28 18 C 35 22, 35 36, 28 39 L 16 39 C 9 36, 9 22, 16 18 Z"
                      fill="#C83E2B"
                      stroke="#1C1613"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <path d="M 28 16 C 37 16, 37 28, 29 28" fill="none" stroke="#1C1613" strokeWidth="2.8" />
                    <circle cx="22" cy="27" r="4" fill="#E2A83B" stroke="#1C1613" strokeWidth="1.6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="lada-gauge-label-row">
                    <span>♥ Kuráž lovce</span>
                    <span className="tabular-nums">
                      {activePortrait.hp} / {activePortrait.maxHp}
                    </span>
                  </div>
                  <div className="lada-gouache-gauge-track">
                    <div
                      className="lada-gouache-gauge-fill fill-poppy"
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="lada-vessel-row">
                <div className="lada-ceramic-vessel" aria-hidden="true">
                  <svg viewBox="0 0 44 44" className="w-10 h-10 overflow-visible">
                    <path
                      d="M 14 10 L 30 10 L 33 38 L 11 38 Z"
                      fill="#2B5B84"
                      stroke="#1C1613"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <ellipse
                      cx="22"
                      cy="10"
                      rx="9"
                      ry="3"
                      fill="#F6EBD8"
                      stroke="#1C1613"
                      strokeWidth="2.4"
                    />
                    <circle cx="22" cy="25" r="4.2" fill="#F6EBD8" stroke="#1C1613" strokeWidth="1.6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="lada-gauge-label-row">
                    <span>✦ Čáry a fortel</span>
                    <span className="tabular-nums">
                      {activePortrait.magic} / {activePortrait.maxMagic}
                    </span>
                  </div>
                  <div className="lada-gouache-gauge-track">
                    <div
                      className="lada-gouache-gauge-fill fill-cobalt"
                      style={{ width: `${magicPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <LadaLindenVineta />

            {/* 3. ACTIVE QUEST / STORY PASSAGE (Cíl výpravy) */}
            <div className="lada-story-passage">
              <div className="lada-story-header">
                <span>📜 Cíl výpravy</span>
                <span className="lada-story-stage-tag">{currentLevel.shortTitle}</span>
              </div>

              <p className="lada-story-prose">
                <LadaDropCap letter={storyFirstLetter} variant="poppy" />
                {storyRestText}{' '}
                <span className="lada-story-stage-note">
                  {currentLevel.isNightLevel ? 'Dnes v noci čeká kraj' : 'Dnes za bílého dne čeká kraj'}{' '}
                  <strong>„{currentLevel.name}“</strong>, kde řádí{' '}
                  <em>{currentLevel.finalBoss.name}</em>.
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
                      Výběr lovce a odchod na výpravu
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
                      „Hned vyslat na stráž: {activePortrait.czechTitle}“
                    </strong>
                    <small className="block opacity-80">
                      Rychlý odchod do noci
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
                      Ovládání, pamětihodnosti a směna perníčků
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
