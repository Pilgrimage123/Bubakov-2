import React, { useEffect, useRef, useCallback } from 'react';
import { sound } from '../audio';

export interface LadaCoverSceneProps {
  className?: string;
  width?: number | string;
  height?: number;
}

export const TAVERN_TOAST_CYCLE_DURATION = 7.6;

export type TavernToastPhase =
  | 'pipe_puff_and_sway'
  | 'smoke_rings_and_windup'
  | 'hearty_clink'
  | 'synchronized_gulp'
  | 'satisfied_ah';

export interface SmokeRingState {
  x: number;
  y: number;
  rx: number;
  ry: number;
  alpha: number;
  tilt: number;
}

export interface TavernSceneChoreographyState {
  phase: TavernToastPhase;
  cycleTime: number;
  // Hastrman (left) sly pipe & wink state
  hastrmanPuffCheek: number; // 0..1
  pipeEmberGlow: number; // 0..1
  hastrmanWink: number; // 0..1 (1 = closed sly wink)
  hastrmanEyeShiftX: number;
  hastrmanFootTapY: number; // 0..1
  hastrmanChuckleBobY: number;
  smokeRings: SmokeRingState[];
  // Bubák & Rusalka (right) mug toast & gulp state
  bubakMugX: number;
  bubakMugY: number;
  bubakMugTiltRad: number;
  rusalkaMugX: number;
  rusalkaMugY: number;
  rusalkaMugTiltRad: number;
  beerLevel: number; // 0.25 .. 1.0
  foamHeadScale: number; // 0.6 .. 1.45
  clinkImpact: number; // 0..1 at moment of clink
  foamSplashProgress: number; // 0..1 for flying foam & golden droplets
  gulpIntensity: number; // 0..1 during synchronized gulp
  gulpBob: number; // rhythmic throat/head bob during gulp
  bubakHeadTiltRad: number;
  rusalkaHeadTiltRad: number;
  bubakBodyLeanX: number;
  rusalkaBodyLeanX: number;
  foamMustacheAlpha: number; // 0..1 on Bubák after gulping
  folkCallout: '' | 'ŠIBALSKÉ BAF!' | 'CINK! NA ZDRAVÍ!' | 'GLUG! GLUG!' | 'ÁÁCH!';
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep01(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/**
 * Pure deterministic choreography calculator for the Hospoda U Černého kocoura scene:
 * - Left: Hastrman slyly puffing on his clay pipe, blowing smoke rings, winking, and tapping his webbed foot.
 * - Center: Tavern table with glazed pitcher and hanging portrait of Emperor Franz Joseph I.
 * - Right: Czech Bubák and beautiful Rusalka clinking foaming beer mugs with a hearty splash and taking a synchronized gulp.
 */
export function computeTavernSceneChoreography(
  t: number,
  manualToastStart: number = -100,
  manualPipeStart: number = -100,
  hoverMix: number = 0
): TavernSceneChoreographyState {
  const toastElapsed = t - manualToastStart;
  const isManualToast = toastElapsed >= 0 && toastElapsed < 4.8;

  const pipeElapsed = t - manualPipeStart;
  const isManualPipe = pipeElapsed >= 0 && pipeElapsed < 2.8;

  const cycleTime = isManualToast
    ? Math.min(TAVERN_TOAST_CYCLE_DURATION - 0.05, 2.75 + toastElapsed)
    : ((t % TAVERN_TOAST_CYCLE_DURATION) + TAVERN_TOAST_CYCLE_DURATION) %
      TAVERN_TOAST_CYCLE_DURATION;

  let phase: TavernToastPhase = 'pipe_puff_and_sway';

  // --- 1. HASTRMAN SLY PIPE PUFFING, WINK & WEBBED FOOT TAP ---
  const footTempo = 5.5 + hoverMix * 1.5;
  const hastrmanFootTapY = Math.max(0, Math.sin(t * footTempo)) * 4.2;

  let hastrmanPuffCheek = 0.2 + 0.2 * Math.sin(t * 4.2);
  let pipeEmberGlow = 0.45 + 0.25 * Math.sin(t * 5.0);
  let hastrmanWink = 0;
  let hastrmanEyeShiftX = Math.sin(t * 1.8) * 1.4;
  let hastrmanChuckleBobY = Math.sin(t * 2.8) * 1.2;

  if (cycleTime < 1.8 || isManualPipe) {
    const p = isManualPipe ? clamp01(pipeElapsed / 1.8) : cycleTime / 1.8;
    // Deep sly draw on the clay pipe followed by cheek puff
    const drawPulse = Math.sin(p * Math.PI * 2);
    hastrmanPuffCheek = 0.45 + 0.52 * Math.max(0, drawPulse);
    pipeEmberGlow = 0.65 + 0.35 * Math.abs(Math.sin(p * Math.PI * 3));
    // Sly knowing wink in the middle of the pipe draw
    if (p > 0.22 && p < 0.72) {
      hastrmanWink = Math.sin(((p - 0.22) / 0.5) * Math.PI);
    }
    hastrmanEyeShiftX = 1.6;
  } else if (cycleTime >= 3.1 && cycleTime < 4.5) {
    // Hastrman chuckles and winks while watching Bubák & Rusalka clink mugs
    hastrmanChuckleBobY = Math.sin(t * 14) * 2.2;
    hastrmanWink = cycleTime < 3.85 ? smoothstep01(1 - Math.abs(cycleTime - 3.45) / 0.4) : 0;
    pipeEmberGlow = 0.75;
  } else if (cycleTime >= 5.6 && cycleTime < 6.4) {
    // Playful extra sly wink during the satisfied sigh phase
    hastrmanWink = Math.sin(((cycleTime - 5.6) / 0.8) * Math.PI) * 0.92;
    hastrmanEyeShiftX = 1.8;
  }

  // Generate 4 continuous drifting & expanding smoke rings from golden-lidded pipe bowl (x=166, y=88)
  const smokeRings: SmokeRingState[] = [];
  const pipeBowlX = 166;
  const pipeBowlY = 88;
  const ringCount = 4;
  for (let i = 0; i < ringCount; i++) {
    const ringPeriod = 2.4;
    const rawAge = ((t + i * (ringPeriod / ringCount)) % ringPeriod) / ringPeriod; // 0..1
    const ringX = pipeBowlX + rawAge * 18 + Math.sin(t * 2.5 + i * 1.7) * 4;
    const ringY = pipeBowlY - 4 - rawAge * 56; // stays well inside y >= 22
    const rx = 4.0 + rawAge * 10.5;
    const ry = 2.3 + rawAge * 5.2;
    const fadeIn = smoothstep01(rawAge / 0.18);
    const fadeOut = 1 - smoothstep01((rawAge - 0.58) / 0.42);
    const boost = isManualPipe || cycleTime < 3.1 ? 1.0 : 0.78;
    smokeRings.push({
      x: ringX,
      y: ringY,
      rx,
      ry,
      alpha: clamp01(fadeIn * fadeOut * boost),
      tilt: Math.sin(t * 2.0 + i) * 0.18 - 0.12,
    });
  }

  // --- 2. BUBÁK & RUSALKA BEER TOAST & SYNCHRONIZED GULP ---
  // Base resting positions for the two foaming beer mugs (spaced clearly in front of Bubák's torso!)
  const baseBubakMugX = 348;
  const baseBubakMugY = 116;
  const baseRusalkaMugX = 414;
  const baseRusalkaMugY = 118;

  let bubakMugX = baseBubakMugX;
  let bubakMugY = baseBubakMugY;
  let bubakMugTiltRad = 0.04;
  let rusalkaMugX = baseRusalkaMugX;
  let rusalkaMugY = baseRusalkaMugY;
  let rusalkaMugTiltRad = -0.04;

  let beerLevel = 0.92;
  let foamHeadScale = 1.05;
  let clinkImpact = 0;
  let foamSplashProgress = 0;
  let gulpIntensity = 0;
  let gulpBob = 0;
  let bubakHeadTiltRad = 0;
  let rusalkaHeadTiltRad = 0;
  let bubakBodyLeanX = 0;
  let rusalkaBodyLeanX = 0;
  let foamMustacheAlpha = 0;
  let folkCallout: TavernSceneChoreographyState['folkCallout'] = '';

  if (cycleTime < 1.8) {
    // PHASE 1: PIPE PUFF & TAVERN SWAY
    phase = 'pipe_puff_and_sway';
    const sway = Math.sin(t * 3.2);
    bubakBodyLeanX = sway * 2.5;
    rusalkaBodyLeanX = -sway * 2.5;
    bubakMugX = baseBubakMugX + sway * 3;
    bubakMugY = baseBubakMugY + Math.cos(t * 3.2) * 2;
    rusalkaMugX = baseRusalkaMugX - sway * 3;
    rusalkaMugY = baseRusalkaMugY + Math.cos(t * 3.2) * 2;
    bubakMugTiltRad = sway * 0.06;
    rusalkaMugTiltRad = -sway * 0.06;
    beerLevel = 0.95;
    foamHeadScale = 1.08 + 0.05 * Math.sin(t * 5);
    if (isManualPipe) {
      folkCallout = 'ŠIBALSKÉ BAF!';
    }
  } else if (cycleTime < 3.1) {
    // PHASE 2: SMOKE RINGS & WINDUP TO RAISE MUGS
    phase = 'smoke_rings_and_windup';
    const p = (cycleTime - 1.8) / 1.3; // 0..1
    const windup = smoothstep01(p);
    // First pull back slightly (p < 0.6), then surge inward toward the clink point (p >= 0.6)
    if (p < 0.6) {
      const pull = smoothstep01(p / 0.6);
      bubakBodyLeanX = lerp(0, -5, pull);
      rusalkaBodyLeanX = lerp(0, 5, pull);
      bubakMugX = lerp(baseBubakMugX, 340, pull);
      bubakMugY = lerp(baseBubakMugY, 102, pull);
      bubakMugTiltRad = lerp(0.04, -0.18, pull);
      rusalkaMugX = lerp(baseRusalkaMugX, 428, pull);
      rusalkaMugY = lerp(baseRusalkaMugY, 104, pull);
      rusalkaMugTiltRad = lerp(-0.04, 0.18, pull);
      bubakHeadTiltRad = lerp(0, -0.08, pull);
      rusalkaHeadTiltRad = lerp(0, 0.08, pull);
    } else {
      const surge = smoothstep01((p - 0.6) / 0.4);
      bubakBodyLeanX = lerp(-5, 9, surge);
      rusalkaBodyLeanX = lerp(5, -9, surge);
      bubakMugX = lerp(340, 360, surge);
      bubakMugY = lerp(102, 92, surge);
      bubakMugTiltRad = lerp(-0.18, 0.16, surge);
      rusalkaMugX = lerp(428, 390, surge);
      rusalkaMugY = lerp(104, 92, surge);
      rusalkaMugTiltRad = lerp(0.18, -0.16, surge);
      bubakHeadTiltRad = lerp(-0.08, 0.06, surge);
      rusalkaHeadTiltRad = lerp(0.08, -0.06, surge);
    }
    beerLevel = 0.96;
    foamHeadScale = lerp(1.08, 1.24, windup);
    if (p < 0.45) {
      folkCallout = 'ŠIBALSKÉ BAF!';
    }
  } else if (cycleTime < 4.3) {
    // PHASE 3: HEARTY CLINK OF FOAMING MUGS ("CINK! NA ZDRAVÍ!")
    phase = 'hearty_clink';
    const p = (cycleTime - 3.1) / 1.2; // 0..1
    const impactDecay = Math.max(0, 1 - p * 1.45);
    const bounce = Math.sin(p * Math.PI * 3) * impactDecay * 3.5;

    clinkImpact = Math.max(0, 1 - p * 1.15);
    foamSplashProgress = clamp01(p * 1.15);

    bubakBodyLeanX = 9 - p * 3;
    rusalkaBodyLeanX = -9 + p * 3;

    // Mugs meet right over the center of the table at x=359 & x=389
    bubakMugX = 359 - bounce;
    bubakMugY = 91 - Math.sin(p * Math.PI) * 3;
    bubakMugTiltRad = 0.19 - bounce * 0.02;

    rusalkaMugX = 389 + bounce;
    rusalkaMugY = 91 - Math.sin(p * Math.PI) * 3;
    rusalkaMugTiltRad = -0.19 + bounce * 0.02;

    beerLevel = 0.95;
    foamHeadScale = 1.38 + Math.sin(p * Math.PI * 4) * 0.1;
    folkCallout = 'CINK! NA ZDRAVÍ!';
  } else if (cycleTime < 6.1) {
    // PHASE 4: PLAYFUL TOAST FOLLOWED BY HEARTY SYNCHRONIZED GULP ("GLUG! GLUG!")
    phase = 'synchronized_gulp';
    const p = (cycleTime - 4.3) / 1.8; // 0..1
    const enterGulp = smoothstep01(Math.min(1, p / 0.25));
    const exitGulp = 1 - smoothstep01(Math.max(0, (p - 0.82) / 0.18));
    gulpIntensity = enterGulp * exitGulp;

    // 3 rhythmic hearty gulps in unison
    gulpBob = Math.sin(p * Math.PI * 6) * gulpIntensity;

    bubakBodyLeanX = lerp(6, -4, enterGulp);
    rusalkaBodyLeanX = lerp(-6, 4, enterGulp);

    bubakHeadTiltRad = -0.34 * gulpIntensity + gulpBob * 0.04;
    rusalkaHeadTiltRad = 0.34 * gulpIntensity - gulpBob * 0.04;

    bubakMugX = lerp(359, 314, enterGulp);
    bubakMugY = lerp(91, 88, enterGulp) + gulpBob * 1.8;
    bubakMugTiltRad = lerp(0.18, -0.78, enterGulp);

    rusalkaMugX = lerp(389, 434, enterGulp);
    rusalkaMugY = lerp(91, 88, enterGulp) + gulpBob * 1.8;
    rusalkaMugTiltRad = lerp(-0.18, 0.78, enterGulp);

    beerLevel = lerp(0.95, 0.34, smoothstep01(p));
    foamHeadScale = lerp(1.3, 0.78, smoothstep01(p));
    foamMustacheAlpha = smoothstep01(Math.max(0, (p - 0.5) / 0.5));
    folkCallout = 'GLUG! GLUG!';
  } else {
    // PHASE 5: SATISFIED SIGH, FOAM MUSTACHE & REFILL ("ÁÁCH!")
    phase = 'satisfied_ah';
    const p = (cycleTime - 6.1) / 1.5; // 0..1
    const settle = smoothstep01(p);

    bubakBodyLeanX = lerp(-4, 0, settle);
    rusalkaBodyLeanX = lerp(4, 0, settle);
    bubakHeadTiltRad = lerp(-0.18, 0, settle);
    rusalkaHeadTiltRad = lerp(0.18, 0, settle);

    bubakMugX = lerp(314, baseBubakMugX, settle);
    bubakMugY = lerp(88, baseBubakMugY, settle);
    bubakMugTiltRad = lerp(-0.4, 0.04, settle);

    rusalkaMugX = lerp(434, baseRusalkaMugX, settle);
    rusalkaMugY = lerp(88, baseRusalkaMugY, settle);
    rusalkaMugTiltRad = lerp(0.4, -0.04, settle);

    const refill = smoothstep01(Math.max(0, (p - 0.45) / 0.55));
    beerLevel = lerp(0.34, 0.94, refill);
    foamHeadScale = lerp(0.78, 1.08, refill);
    foamMustacheAlpha = 1 - smoothstep01(Math.max(0, (p - 0.65) / 0.35));
    if (p < 0.75) {
      folkCallout = 'ÁÁCH!';
    }
  }

  return {
    phase,
    cycleTime,
    hastrmanPuffCheek,
    pipeEmberGlow,
    hastrmanWink,
    hastrmanEyeShiftX,
    hastrmanFootTapY,
    hastrmanChuckleBobY,
    smokeRings,
    bubakMugX,
    bubakMugY,
    bubakMugTiltRad,
    rusalkaMugX,
    rusalkaMugY,
    rusalkaMugTiltRad,
    beerLevel,
    foamHeadScale,
    clinkImpact,
    foamSplashProgress,
    gulpIntensity,
    gulpBob,
    bubakHeadTiltRad,
    rusalkaHeadTiltRad,
    bubakBodyLeanX,
    rusalkaBodyLeanX,
    foamMustacheAlpha,
    folkCallout,
  };
}

/**
 * Helper to draw a 5-petal folk flower in Josef Lada gouache style.
 */
function drawFolkFlower2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  petalRadius: number,
  petalColor: string,
  centerColor: string,
  rotationRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationRad);
  ctx.fillStyle = petalColor;
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    const px = Math.cos(ang) * (petalRadius * 0.68);
    const py = Math.sin(ang) * (petalRadius * 0.68);
    ctx.beginPath();
    ctx.arc(px, py, petalRadius * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, petalRadius * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws an authentic 2D canvas painting of Emperor Franz Joseph I (Císař František Josef I.)
 * in an ornate gilded baroque frame hanging on the tavern wall, complete with imperial uniform,
 * gold-embroidered crimson collar, orders/medals, iconic mutton-chop sideburns, and a tiny tavern fly.
 */
function drawEmperorPortrait2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number
): void {
  const INK = '#1C1610';

  ctx.save();
  // 1. Brass hanging nail & chain from above
  const nailX = x + w / 2;
  const nailY = y - 7;
  ctx.strokeStyle = '#94611D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(nailX, nailY);
  ctx.lineTo(x + 7, y + 2);
  ctx.moveTo(nailX, nailY);
  ctx.lineTo(x + w - 7, y + 2);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(nailX, nailY, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Heavy dark walnut frame backing
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  // Ornate gold leaf inner frame moulding
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(x + 3.5, y + 3.5, w - 7, h - 7);
  ctx.fill();
  ctx.stroke();

  // Gold fillet beading
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.rect(x + 5, y + 5, w - 10, h - 10);
  ctx.stroke();

  // 3. Portrait Canvas Area
  const px = x + 6.5;
  const py = y + 6.5;
  const pw = w - 13;
  const ph = h - 13;

  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();

  // Deep imperial burgundy/maroon backdrop
  ctx.fillStyle = '#2B0E12';
  ctx.fillRect(px, py, pw, ph);

  // Soft atmospheric spotlight on portrait backdrop
  ctx.fillStyle = '#4A151A';
  ctx.beginPath();
  ctx.ellipse(px + pw * 0.48, py + ph * 0.38, pw * 0.48, ph * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  const cx = px + pw * 0.48;
  const cy = py + ph * 0.34;

  // 4. Uniform & Shoulders of Franz Joseph I
  // Dark Austrian pike-grey / military general tunic
  ctx.fillStyle = '#243044';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(cx - 18, py + ph);
  ctx.lineTo(cx - 15, cy + 18);
  ctx.quadraticCurveTo(cx - 8, cy + 12, cx, cy + 13);
  ctx.quadraticCurveTo(cx + 8, cy + 12, cx + 15, cy + 18);
  ctx.lineTo(cx + 18, py + ph);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red piping on tunic front opening
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy + 15);
  ctx.lineTo(cx - 2, py + ph);
  ctx.stroke();

  // Double-breasted golden brass buttons
  ctx.fillStyle = '#FACC15';
  for (let b = 0; b < 3; b++) {
    const by = cy + 20 + b * 7;
    ctx.beginPath();
    ctx.arc(cx - 7, by, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, by, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // High stand-up crimson collar with golden oak-leaf embroidery
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 8);
  ctx.lineTo(cx + 7, cy + 8);
  ctx.lineTo(cx + 8, cy + 14);
  ctx.lineTo(cx - 8, cy + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden embroidery stitches on collar
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 11);
  ctx.lineTo(cx - 1, cy + 11);
  ctx.moveTo(cx + 1, cy + 11);
  ctx.lineTo(cx + 6, cy + 11);
  ctx.stroke();

  // Orders and Medals on chest
  // Cross of the Order of Maria Theresa on black-and-gold ribbon
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.rect(cx - 6, cy + 16, 4, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E6392B';
  ctx.fillRect(cx - 5, cy + 17, 2, 2);

  // Order of the Golden Fleece (Zlaté rouno) pendant
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(cx - 1, cy + 18, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Imperial breast star badge
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(cx + 7, cy + 23, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(cx + 7, cy + 23, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 5. Head, Neck & Hair of Franz Joseph I
  // Neck
  ctx.fillStyle = '#F5D0A9';
  ctx.beginPath();
  ctx.rect(cx - 4.5, cy + 3, 9, 7);
  ctx.fill();

  // Head oval
  ctx.fillStyle = '#F5D0A9';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 7.8, 10.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair: light brown/blonde brushed back from high forehead
  ctx.fillStyle = '#C8A365';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy - 7, 7.6, Math.PI * 1.05, Math.PI * 1.95);
  ctx.quadraticCurveTo(cx, cy - 8, cx, cy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Iconic imperial mutton-chop whiskers & mustache (licousy spojené s knírem)
  ctx.fillStyle = '#D9A036';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  // Left sideburn & mustache wing
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 3);
  ctx.quadraticCurveTo(cx - 11, cy + 2, cx - 8, cy + 6);
  ctx.quadraticCurveTo(cx - 4, cy + 4, cx - 1, cy + 3);
  ctx.quadraticCurveTo(cx - 5, cy + 1, cx - 6, cy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right sideburn & mustache wing
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy - 3);
  ctx.quadraticCurveTo(cx + 11, cy + 2, cx + 8, cy + 6);
  ctx.quadraticCurveTo(cx + 4, cy + 4, cx + 1, cy + 3);
  ctx.quadraticCurveTo(cx + 5, cy + 1, cx + 6, cy - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Parted chin visible below mustache
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy + 5, 2.0, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Eyes: noble calm blue eyes
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.ellipse(cx - 3.2, cy - 3.2, 1.8, 1.3, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 3.2, cy - 3.2, 1.8, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.arc(cx - 3.2, cy - 3.2, 0.9, 0, Math.PI * 2);
  ctx.arc(cx + 3.2, cy - 3.2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows & straight aristocratic nose
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(cx - 5.5, cy - 5.5);
  ctx.lineTo(cx - 1.5, cy - 5.0);
  ctx.moveTo(cx + 1.5, cy - 5.0);
  ctx.lineTo(cx + 5.5, cy - 5.5);
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(cx - 0.5, cy - 4.5);
  ctx.lineTo(cx - 0.5, cy);
  ctx.lineTo(cx + 1.2, cy + 0.6);
  ctx.stroke();

  ctx.restore(); // end clip

  // 6. Whimsical Czech Tavern Detail (Homage to Švejk):
  // A tiny tavern fly (moucha) perched on the top right corner of the picture frame!
  const flyBob = Math.sin(t * 8) * 0.4;
  const flyX = x + w - 5.5;
  const flyY = y + 5.5 + flyBob;

  // Fly body
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.ellipse(flyX, flyY, 1.6, 1.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Fly tiny translucent wings
  ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
  ctx.beginPath();
  ctx.ellipse(flyX - 1.2, flyY - 1.4, 1.4, 0.7, -0.6, 0, Math.PI * 2);
  ctx.ellipse(flyX + 0.8, flyY - 1.4, 1.4, 0.7, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a glistening crystal-blue teardrop water droplet with India ink outline and white highlight.
 */
function drawWaterDroplet2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 2.6
): void {
  const INK = '#1C1610';
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.45);
  ctx.quadraticCurveTo(size * 1.15, 0, 0, size);
  ctx.quadraticCurveTo(-size * 1.15, 0, 0, -size * 1.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crisp white specular highlight
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.arc(-size * 0.25, size * 0.15, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the detailed, colorful Hastrman (Vodník) based on the user's reference illustration,
 * with slyly winking and glancing eyes (šibalsky pomrkávající oči):
 * - Seated on a three-legged honey-oak wooden stool (štokrle) with wood grain.
 * - Crossed legs in indigo-blue breeches with bright red cuff trim, red-and-white striped
 *   stockings, and brown leather laced boots with shiny bulbous toes and dripping water drops.
 * - Dark emerald-green frock coat with bold red piping along the lapel, pocket flap, cuffs,
 *   and 3-scalloped dripping swallowtail (kapající šos), plus shiny golden buttons.
 * - Golden-yellow waistcoat, white shirt collar, and a big tied red neckerchief bow.
 * - Left hand holding a curved brown pipe (fajfka) with a golden fish emblem on the bowl
 *   and a hinged golden brass wind-cap (zlaté víčko) puffing fragrant smoke.
 * - Long wavy two-tone green hair locks with dripping water droplets.
 * - Slouchy bright-red knitted cap with ribbed brim, big fluffy red pom-pom, two yellow
 *   marsh marigold flowers (blatouchy), green leaves, and two brown cattails (orobinec).
 * - Expressive lime-green face with shaved chin stubble, big bulbous shiny Ladovský nose,
 *   rosy cheek, sly grin, and mischievously winking & side-glancing eyes!
 */
function drawHastrman2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: TavernSceneChoreographyState,
  t: number
): void {
  const INK = '#1C1610';
  const tapY = state.hastrmanFootTapY;
  const hairWave = Math.sin(t * 2.5) * 1.6;

  // Sly eye-winking & mischievous squint calculation:
  // Combines choreography winks with playful periodic double-wink & sly half-squint pulses!
  const periodicWinkWave = Math.sin(t * 3.4) * Math.sin(t * 1.7);
  const microWink = periodicWinkWave > 0.62 ? (periodicWinkWave - 0.62) / 0.38 : 0;
  const nearEyeWink = clamp01(Math.max(state.hastrmanWink, microWink * 0.95));
  const farEyeSquint = clamp01(nearEyeWink * 0.65 + 0.15 * Math.sin(t * 4.2));
  const pupilDartX = state.hastrmanEyeShiftX + Math.sin(t * 2.9) * 0.6;
  const pupilDartY = Math.cos(t * 2.3) * 0.45;
  const browWiggleY = nearEyeWink * 1.8 + Math.sin(t * 5.0) * 0.6;

  ctx.save();
  ctx.translate(x, y + state.hastrmanChuckleBobY);

  // --------------------------------------------------------------------------
  // 1. SHIMMERING WATER PUDDLE UNDER STOOL & DRIPPING COAT-TAIL
  // --------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(62, 142, 48, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ripple ring under dripping coat-tail
  const rippleR = 4 + ((t * 16) % 16);
  const rippleAlpha = Math.max(0, 1 - rippleR / 20);
  ctx.strokeStyle = `rgba(56, 189, 248, ${rippleAlpha * 0.75})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(30, 142, rippleR, rippleR * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 2. THREE-LEGGED HONEY-OAK WOODEN STOOL (ŠTOKRLE)
  // --------------------------------------------------------------------------
  const stoolLegs = [
    { x1: 52, y1: 104, x2: 41, y2: 142, col: '#D97706' },
    { x1: 63, y1: 105, x2: 61, y2: 140, col: '#B45309' },
    { x1: 73, y1: 104, x2: 83, y2: 142, col: '#D97706' },
  ];
  for (const leg of stoolLegs) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7.2;
    ctx.beginPath();
    ctx.moveTo(leg.x1, leg.y1);
    ctx.lineTo(leg.x2, leg.y2);
    ctx.stroke();

    ctx.strokeStyle = leg.col;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(leg.x1, leg.y1);
    ctx.lineTo(leg.x2, leg.y2);
    ctx.stroke();

    // Wood grain streak on leg
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo((leg.x1 + leg.x2) * 0.5, (leg.y1 + leg.y2) * 0.5 - 6);
    ctx.lineTo(leg.x2, leg.y2 - 3);
    ctx.stroke();
  }

  // Thick round honey-oak stool seat
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(63, 103, 19, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.ellipse(63, 100, 19, 5.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. SUPPORTING RIGHT LEG (BLUE BREECHES, RED CUFF, STRIPED STOCKING & BOOT)
  // --------------------------------------------------------------------------
  // Indigo-blue lower trouser leg
  ctx.fillStyle = '#1D4ED8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(76, 92);
  ctx.lineTo(97, 94);
  ctx.lineTo(100, 115);
  ctx.lineTo(83, 117);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright red cuff band at bottom of blue trouser leg
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(82, 114);
  ctx.lineTo(101, 112);
  ctx.lineTo(101, 116.5);
  ctx.lineTo(82, 118.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red-and-white horizontally striped stocking on supporting leg
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(86, 117, 11, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.fillRect(87, 119.5, 9, 3.0);
  ctx.fillRect(87, 125.0, 9, 3.0);

  // Sturdy brown leather ankle boot on floor with shiny bulbous toe & yellow laces
  ctx.fillStyle = '#9A3412';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(85, 128);
  ctx.lineTo(98, 127);
  ctx.lineTo(103, 134);
  // Bulbous upturned boot toe
  ctx.quadraticCurveTo(118, 131, 119, 139);
  ctx.quadraticCurveTo(118, 144, 104, 143);
  ctx.lineTo(85, 143);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden-amber shine on bulbous boot toe
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.ellipse(112, 136, 4.2, 2.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Yellow tied boot laces
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(95, 129); ctx.lineTo(100, 127);
  ctx.moveTo(97, 132); ctx.lineTo(102, 130);
  ctx.stroke();

  // Water droplet dripping from floor boot toe
  drawWaterDroplet2D(ctx, 119, 142, 2.2);

  // --------------------------------------------------------------------------
  // 4. LEFT ARM & ORNATE PIPE WITH GOLDEN BRASS LID & FISH EMBLEM
  // --------------------------------------------------------------------------
  // Left emerald-green sleeve reaching toward pipe
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(82, 52);
  ctx.lineTo(96, 49);
  ctx.lineTo(102, 61);
  ctx.lineTo(86, 65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red cuff trim & crisp white shirt cuff with golden cufflink
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(95, 49);
  ctx.lineTo(101, 61);
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(96, 49);
  ctx.lineTo(103, 47);
  ctx.lineTo(106, 58);
  ctx.lineTo(100, 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Curved brown pipe stem from mouth corner (89, 32) to bowl (107, 46)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(88, 32);
  ctx.quadraticCurveTo(98, 34, 105, 46);
  ctx.stroke();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(88, 32);
  ctx.quadraticCurveTo(98, 34, 105, 46);
  ctx.stroke();

  // Golden ferrule band on pipe stem
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(98, 37);
  ctx.lineTo(101, 35);
  ctx.stroke();

  // Ornate terracotta-red pipe bowl (hlavička fajfky) at (110, 44)
  ctx.fillStyle = '#C2410C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(103, 45);
  ctx.quadraticCurveTo(103, 54, 110, 54);
  ctx.quadraticCurveTo(118, 54, 118, 39);
  ctx.lineTo(104, 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Fish relief emblem (zlatá rybička) on pipe bowl side!
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.ellipse(111, 45.5, 3.6, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(107.5, 45.5);
  ctx.lineTo(105.5, 44);
  ctx.lineTo(105.5, 47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Domed hinged golden brass wind-cap (zlaté víčko fajfky) on top of bowl
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(111, 39, 6.8, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brass cap rim & top finial knob
  ctx.fillRect(103.5, 37.5, 15, 2.5);
  ctx.strokeRect(103.5, 37.5, 15, 2.5);
  ctx.beginPath();
  ctx.arc(111, 31.2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curling blue-white smoke wisp rising directly from the golden pipe cap
  ctx.save();
  ctx.globalAlpha = 0.72 + state.pipeEmberGlow * 0.25;
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(110 + Math.sin(t * 4) * 1.5, 25, 4.2, 0, Math.PI * 2);
  ctx.arc(113 + Math.cos(t * 3.5) * 2, 18, 6.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Hastrman's lime-green left hand with upright thumb & 3 fingers cradling the pipe
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  // Palm & upright thumb
  ctx.beginPath();
  ctx.moveTo(99, 51);
  ctx.quadraticCurveTo(97, 43, 100, 41);
  ctx.quadraticCurveTo(103, 41, 103, 48);
  ctx.lineTo(108, 50);
  ctx.lineTo(106, 59);
  ctx.lineTo(99, 57);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3 curled green fingers gripping below the pipe bowl
  for (let f = 0; f < 3; f++) {
    ctx.beginPath();
    ctx.ellipse(109 - f * 0.8, 51.5 + f * 3.2, 4.2, 1.7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 5. GOLDEN WAISTCOAT, WHITE COLLAR & BIG RED NECKERCHIEF BOW
  // --------------------------------------------------------------------------
  // Warm golden-ochre waistcoat (žlutá vestička)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(68, 46);
  ctx.lineTo(84, 48);
  ctx.lineTo(86, 82);
  ctx.lineTo(68, 84);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Small golden waistcoat buttons
  ctx.fillStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.arc(78, 59 + b * 6.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Crisp white shirt collar
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(62, 40);
  ctx.lineTo(77, 45);
  ctx.lineTo(72, 50);
  ctx.lineTo(60, 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Big festive red neckerchief bow (červený šátek s mašlí)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  // Left & right bow loops + hanging ribbon tails
  ctx.beginPath();
  ctx.ellipse(73, 46, 5.2, 2.8, 0.35, 0, Math.PI * 2);
  ctx.ellipse(84, 49, 5.8, 3.0, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(77, 47);
  ctx.lineTo(75, 60);
  ctx.lineTo(81, 57);
  ctx.lineTo(79, 47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Center knot of red bow
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(78, 47, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 6. CROSSED UPPER LEFT LEG IN BLUE BREECHES, RED CUFF & TAPPING BROWN BOOT
  // --------------------------------------------------------------------------
  ctx.save();
  // Subtle pivot at hip so crossed leg & raised boot bob rhythmically with tapY
  ctx.translate(64, 92);
  ctx.rotate(-tapY * 0.028);
  ctx.translate(-64, -92);

  // Indigo-blue crossed upper leg (bent at knee (90, 65))
  ctx.fillStyle = '#2563EB';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(56, 94);
  ctx.quadraticCurveTo(72, 74, 88, 65);
  ctx.quadraticCurveTo(96, 63, 108, 82);
  ctx.lineTo(94, 93);
  ctx.quadraticCurveTo(78, 98, 56, 98);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Darker blue fabric fold crease lines on breeches
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(68, 88); ctx.lineTo(87, 72);
  ctx.moveTo(76, 92); ctx.lineTo(92, 79);
  ctx.stroke();

  // Bold red cuff band at bottom of crossed trouser leg
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(93, 92);
  ctx.lineTo(108, 81);
  ctx.lineTo(110, 84.5);
  ctx.lineTo(95, 95.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red-and-white striped stocking on crossed leg
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(97, 94);
  ctx.lineTo(107, 86);
  ctx.lineTo(114, 96);
  ctx.lineTo(103, 103);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(99, 97); ctx.lineTo(109, 89);
  ctx.moveTo(102, 101); ctx.lineTo(112, 93);
  ctx.stroke();

  // Raised brown leather laced boot with bulbous shiny toe (bobs in the air!)
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(101, 102);
  ctx.lineTo(113, 93);
  ctx.lineTo(119, 98);
  // Upturned bulbous toe pointing upper-right
  ctx.quadraticCurveTo(131, 88, 135, 95);
  ctx.quadraticCurveTo(136, 103, 123, 109);
  ctx.lineTo(106, 114);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden-amber highlight on bulbous raised boot toe
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.ellipse(129, 95, 4.2, 2.6, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // White lace stitches on raised boot
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(113, 96); ctx.lineTo(116, 101);
  ctx.moveTo(116, 95); ctx.lineTo(119, 100);
  ctx.moveTo(119, 94); ctx.lineTo(122, 99);
  ctx.stroke();

  // Water droplets dripping from the heel & upturned sole of the raised boot!
  const bootDropOffset = ((t * 2.2) % 1) * 6;
  drawWaterDroplet2D(ctx, 109, 120 + bootDropOffset * 0.6, 2.5);
  drawWaterDroplet2D(ctx, 126, 114 + bootDropOffset * 0.4, 2.3);
  drawWaterDroplet2D(ctx, 132, 107 + bootDropOffset * 0.3, 1.9);

  ctx.restore();

  // --------------------------------------------------------------------------
  // 7. DARK EMERALD FROCK COAT WITH RED PIPING, POCKET FLAP & DRIPPING SWALLOWTAIL
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  // Back of neck down spine to swallowtail
  ctx.moveTo(56, 44);
  ctx.quadraticCurveTo(44, 68, 34, 88);
  // Outer swallowtail scalloped tips hanging behind stool
  ctx.quadraticCurveTo(24, 102, 20, 115);
  ctx.quadraticCurveTo(28, 105, 32, 107);
  ctx.quadraticCurveTo(28, 120, 27, 131);
  ctx.quadraticCurveTo(35, 118, 38, 120);
  ctx.quadraticCurveTo(46, 110, 56, 96);
  // Up along front coat opening & notched lapel
  ctx.quadraticCurveTo(68, 78, 74, 58);
  ctx.lineTo(68, 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bold red piping (červené lemování) along swallowtail scallops & front coat edge
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(21, 114);
  ctx.quadraticCurveTo(28, 104, 32, 106);
  ctx.quadraticCurveTo(28, 119, 27, 130);
  ctx.quadraticCurveTo(35, 117, 38, 119);
  ctx.quadraticCurveTo(46, 109, 55, 95);
  ctx.quadraticCurveTo(67, 77, 73, 58);
  ctx.lineTo(64, 54);
  ctx.lineTo(68, 45);
  ctx.stroke();

  // Side pocket flap with red piping & golden button
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(33, 83);
  ctx.lineTo(48, 86);
  ctx.lineTo(45, 95);
  ctx.lineTo(30, 91);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(31, 90);
  ctx.lineTo(44, 94);
  ctx.lineTo(47, 86);
  ctx.stroke();

  // Shiny golden buttons on pocket flap & coat front
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  const coatButtons = [
    [39, 89],
    [68, 63],
    [59, 86],
  ];
  for (const [bx, by] of coatButtons) {
    ctx.beginPath();
    ctx.arc(bx, by, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Right arm (near side) resting in lap with red-piped cuff & golden button
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(55, 50);
  ctx.quadraticCurveTo(45, 66, 49, 76);
  ctx.lineTo(62, 82);
  ctx.lineTo(66, 70);
  ctx.quadraticCurveTo(60, 62, 62, 52);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red-piped green cuff with golden button + white shirt cuff + green hand in lap
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.moveTo(55, 79);
  ctx.lineTo(61, 68);
  ctx.lineTo(67, 71);
  ctx.lineTo(61, 82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(56, 78);
  ctx.lineTo(62, 68);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(61, 76, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.moveTo(62, 82);
  ctx.lineTo(67, 72);
  ctx.lineTo(71, 74);
  ctx.lineTo(65, 84);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#A3E635';
  ctx.beginPath();
  ctx.ellipse(69, 79, 4.0, 3.0, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Water droplets dripping from the swallowtail tips & coat
  const tailDrop = ((t * 2.4) % 1) * 7;
  drawWaterDroplet2D(ctx, 20, 121 + tailDrop * 0.5, 2.2);
  drawWaterDroplet2D(ctx, 27, 136 + tailDrop * 0.7, 2.4);
  drawWaterDroplet2D(ctx, 35, 131 + tailDrop * 0.4, 2.1);
  drawWaterDroplet2D(ctx, 46, 102 + tailDrop * 0.3, 2.3);

  // --------------------------------------------------------------------------
  // 8. LONG WAVY TWO-TONE GREEN HAIR LOCKS WITH DRIPPING WATER DROPLETS
  // --------------------------------------------------------------------------
  // Back layer of emerald-green wavy hair locks sweeping left
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(52, 18);
  ctx.bezierCurveTo(36, 26, 28 + hairWave, 38, 18 + hairWave, 46);
  ctx.bezierCurveTo(28 + hairWave, 48, 36, 40, 46, 34);
  ctx.bezierCurveTo(32, 48, 26 + hairWave, 64, 21 + hairWave, 76);
  ctx.bezierCurveTo(32 + hairWave, 70, 42, 56, 54, 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright lime-green upper wavy hair locks framing ear & shoulder
  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.bezierCurveTo(48, 22, 42 + hairWave * 0.6, 42, 31 + hairWave, 58);
  ctx.bezierCurveTo(42 + hairWave * 0.5, 52, 48, 38, 58, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front green lock curling down over shoulder (with water droplet at tip)
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.moveTo(68, 14);
  ctx.bezierCurveTo(60, 28, 52, 46, 54, 60);
  ctx.bezierCurveTo(60, 50, 64, 34, 71, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Water droplets dripping from green hair tips
  drawWaterDroplet2D(ctx, 21 + hairWave, 64, 2.1);
  drawWaterDroplet2D(ctx, 22 + hairWave, 83, 2.5);
  drawWaterDroplet2D(ctx, 32 + hairWave * 0.7, 68, 2.0);
  drawWaterDroplet2D(ctx, 55, 65, 2.2);

  // --------------------------------------------------------------------------
  // 9. EXPRESSIVE FACE, SHAVED STUBBLE, BULBOUS NOSE & SLYLY WINKING EYES!
  // --------------------------------------------------------------------------
  // Ear peeking out between green hair locks
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(59, 28, 4.2, 5.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Main lime-green head, cheek & rounded chin contour
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(68, 8);
  ctx.quadraticCurveTo(84, 6, 87, 18);
  ctx.quadraticCurveTo(91, 26, 90, 33);
  ctx.quadraticCurveTo(90, 41, 80, 41);
  ctx.quadraticCurveTo(66, 41, 64, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shaved chin & jaw stubble dots (strniště na bradě podle předlohy!)
  ctx.fillStyle = '#14532D';
  const stubbleDots = [
    [71, 33], [74, 35], [77, 37], [81, 38], [85, 37],
    [69, 36], [73, 38], [78, 39.5], [83, 39.5], [87, 35],
  ];
  for (const [sx, sy] of stubbleDots) {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm rosy red-orange cheek blush with two crisp white shine dashes
  const cheekR = 4.6 + state.hastrmanPuffCheek * 1.4;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.ellipse(75, 25.5, cheekR, cheekR * 0.72, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(72.5, 24.5); ctx.lineTo(74.2, 23.8);
  ctx.moveTo(75.0, 24.8); ctx.lineTo(76.5, 24.2);
  ctx.stroke();

  // --- SLYLY WINKING & GLANCING EYES (ŠIBALSKY POMRKÁVAJÍCÍ OČI) ---
  // 1) Far (right) eye peeking slyly over the nose bridge
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(85.5, 15.5, 3.2, 4.2 * (1 - farEyeSquint * 0.65), 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (farEyeSquint < 0.75) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(86.2 + pupilDartX * 0.5, 15.8 + pupilDartY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2) Main near (left) eye with expressive sly wink & mischievous side-glance
  if (nearEyeWink > 0.52) {
    // Sly, joyful upturned crescent wink with crinkling crow's-feet laugh lines!
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(78.5, 18.0, 4.6, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Lower cheek laugh-fold pushing up into the wink
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(78.5, 19.5, 3.8, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    // 3 mischievous crow's-feet laugh lines at outer corner of eye
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(73.5, 15.5); ctx.lineTo(70.5, 14.0);
    ctx.moveTo(73.2, 17.2); ctx.lineTo(70.0, 17.0);
    ctx.moveTo(73.8, 18.8); ctx.lineTo(71.0, 20.0);
    ctx.stroke();
  } else {
    // Large, bright, slyly squinting/glancing eye matching the uploaded picture!
    const openScaleY = 1 - nearEyeWink * 0.65;
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(78.5, 16.2, 4.6, 5.4 * openScaleY, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bold black pupil darting slyly toward the pipe smoke / viewer
    const px = 79.6 + pupilDartX * 0.75;
    const py = 16.5 + pupilDartY;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(px, py, 2.5, 3.1 * openScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white specular catchlight wedge (giving that unmistakable sly twinkle!)
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(px - 1.0, py - 1.0 * openScaleY, 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Sly lower laugh-eyelid fold curving up from the rosy cheek
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(73.8, 19.5);
    ctx.quadraticCurveTo(78.5, 18.0 - nearEyeWink * 1.5, 82.8, 19.8);
    ctx.stroke();
  }

  // Thick dark-green/black arched eyebrow that wiggles mischievously
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(71.5, 11.5 - browWiggleY * 0.5);
  ctx.quadraticCurveTo(77.5, 7.2 - browWiggleY, 83.0, 11.0 - browWiggleY * 0.4);
  ctx.stroke();

  // Prominent, round, bulbous Ladovský lime-green nose with bright shiny tip!
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(84, 18);
  ctx.bezierCurveTo(99, 13, 103, 27, 90, 27);
  ctx.quadraticCurveTo(85, 27, 83, 24);
  ctx.stroke();
  ctx.fill();

  // Bright pale-lime highlight on bulbous nose tip
  ctx.fillStyle = '#ECFCCB';
  ctx.beginPath();
  ctx.ellipse(94.5, 20.5, 3.2, 2.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tiny freckle dots across nose bridge
  ctx.fillStyle = '#3F6212';
  ctx.beginPath();
  ctx.arc(86.5, 20.5, 0.6, 0, Math.PI * 2);
  ctx.arc(88.5, 19.8, 0.6, 0, Math.PI * 2);
  ctx.arc(87.8, 21.8, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // High sly smile with deep laugh-dimple gripping the pipe stem
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(74.5, 28.0);
  ctx.quadraticCurveTo(81.5, 32.5, 89.5, 31.8);
  ctx.stroke();

  // Cheek dimple arc at smile corner
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.arc(74.2, 27.8, 2.4, Math.PI * 0.65, Math.PI * 1.45);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 10. BRIGHT RED KNITTED CAP WITH FLUFFY POM-POM, MARIGOLDS & CATTAILS
  // --------------------------------------------------------------------------
  // Two brown Cattails (orobinec / doutníky) & green reed blades sticking out left of cap
  ctx.save();
  // Arched green reed leaves with hanging water droplet
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(52, 14);
  ctx.quadraticCurveTo(34, 14, 24, 25);
  ctx.quadraticCurveTo(36, 19, 52, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawWaterDroplet2D(ctx, 23, 30 + ((t * 4) % 4), 2.3);

  // Cattail 1 (lower-left)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(52, 13);
  ctx.lineTo(29, -1);
  ctx.stroke();
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.save();
  ctx.translate(36, 3.5);
  ctx.rotate(-2.55);
  ctx.roundRect(-2.4, -6, 4.8, 12, 2.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Cattail 2 (upper-left)
  ctx.beginPath();
  ctx.moveTo(54, 10);
  ctx.lineTo(39, -9);
  ctx.stroke();
  ctx.fillStyle = '#9A3412';
  ctx.beginPath();
  ctx.save();
  ctx.translate(45, -1.5);
  ctx.rotate(-2.25);
  ctx.roundRect(-2.2, -5.5, 4.4, 11, 2.0);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Slouchy bright-red knitted cap dome (červená pletená čepice)
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(49, 20);
  ctx.bezierCurveTo(44, 4, 62, -7, 79, -1);
  ctx.quadraticCurveTo(85, 2, 85, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Knitted rib lines on cap dome
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(56, 14); ctx.quadraticCurveTo(58, 3, 66, -1);
  ctx.moveTo(65, 10); ctx.quadraticCurveTo(68, 1, 74, -1);
  ctx.stroke();

  // Rolled ribbed red brim slanting across brow
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(47, 22);
  ctx.quadraticCurveTo(64, 6, 86, 6);
  ctx.quadraticCurveTo(89, 10, 85, 12);
  ctx.quadraticCurveTo(66, 11, 51, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ribbed stitch ticks along red brim
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 6; r++) {
    const rx = 53 + r * 5.5;
    const ry = 21 - r * 2.3;
    ctx.beginPath();
    ctx.moveTo(rx, ry - 2);
    ctx.lineTo(rx + 1.5, ry + 2);
    ctx.stroke();
  }

  // Big fluffy red pom-pom (velká červená bambule) on top of cap
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(59, -5, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Fluffy texture ticks inside pom-pom
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(56, -7); ctx.lineTo(58, -5);
  ctx.moveTo(60, -8); ctx.lineTo(62, -6);
  ctx.moveTo(57, -3); ctx.lineTo(60, -3);
  ctx.stroke();

  // Two yellow marsh marigold flowers (žluté blatouchy) tucked into cap brim!
  drawFolkFlower2D(ctx, 56, 12, 3.8, '#FACC15', '#EA580C', t * 0.4);
  drawFolkFlower2D(ctx, 61, 7, 3.4, '#FACC15', '#EA580C', -t * 0.4);

  ctx.restore();
}

/**
 * Draws a multi-petal blooming white water-lily (leknín) with pointed snow-white petals
 * and a glowing golden-yellow stamen crown, matching the reference Rusalka illustration.
 */
function drawWaterLilyBlossom2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  tiltRad: number = 0
): void {
  const INK = '#1C1610';
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);

  // Back row of pointed snow-white petals
  const backAngles = [-2.4, -1.85, -1.3, -0.75, -0.2];
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.35;
  for (const ang of backAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.32, 0);
    ctx.quadraticCurveTo(-radius * 0.42, -radius * 0.75, 0, -radius * 1.18);
    ctx.quadraticCurveTo(radius * 0.42, -radius * 0.75, radius * 0.32, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Front row of bright snow-white pointed petals
  const frontAngles = [-2.65, -2.1, -1.57, -1.05, -0.5, 0.05];
  ctx.fillStyle = '#FFFDF7';
  for (const ang of frontAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.3, 0.5);
    ctx.quadraticCurveTo(-radius * 0.38, -radius * 0.6, 0, -radius * 1.0);
    ctx.quadraticCurveTo(radius * 0.38, -radius * 0.6, radius * 0.3, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Golden-yellow stamen center (zlatý střed leknínu)
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, -radius * 0.12, radius * 0.42, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Warm orange-amber stamen pollen dots
  ctx.fillStyle = '#EA580C';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * radius * 0.14, -radius * 0.18 - (1 - Math.abs(i) * 0.3) * 1.2, 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws the detailed, colorful, naturally oriented Rusalka (Vodní víla s leknínovou korunou)
 * based on the user's reference illustration, turned in a graceful three-quarter/side profile
 * facing LEFT toward Český Bubák across the tavern table:
 * - Multi-layered shimmering pond puddle beneath her bare feet.
 * - Voluminous, cascading S-curved golden-blonde hair waves intertwined with green pond reeds
 *   and glistening crystal-blue water droplets.
 * - Elaborate botanical crown of notched green water-lily pads, three blooming white water-lilies
 *   (lekníny), and two brown cattails (orobinec / doutníky) rising at the back.
 * - Warm sun-kissed peach skin, feminine profile with upturned button nose, rosy coral blush,
 *   and a large, enchanting ocean-blue eye with sweeping black eyelashes.
 * - Wet translucent ice-blue & seafoam-mint off-shoulder gown with tattered dripping hems,
 *   green pond-moss waist accent, and a side slit revealing her bare leg and feet.
 */
function drawRusalka2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: TavernSceneChoreographyState,
  t: number
): void {
  const INK = '#1C1610';
  const hairSway = Math.sin(t * 2.4) * 2.2;

  ctx.save();
  ctx.translate(x, y);

  // --------------------------------------------------------------------------
  // 1. SHIMMERING MULTI-LAYERED WATER PUDDLE AT HER BARE FEET
  // --------------------------------------------------------------------------
  const puddlePulse = Math.sin(t * 3.8) * 2.5;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(2, 70, 32 + puddlePulse, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner bright sky-blue puddle reflection
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.ellipse(-2, 70, 21 + puddlePulse * 0.5, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small detached puddle splashes on left and right
  ctx.fillStyle = '#7DD3FC';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-29, 72, 5.5, 2.0, 0, 0, Math.PI * 2);
  ctx.ellipse(28, 71, 6.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 2. BACK CASCADE OF LUSH WAVY GOLDEN-BLONDE HAIR & GREEN POND REEDS
  // --------------------------------------------------------------------------
  // Trailing emerald pond-weed / eelgrass ribbons weaving out of her hair (right side)
  ctx.fillStyle = '#4D7C0F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(16, -24);
  ctx.bezierCurveTo(34, -14, 24 + hairSway, 6, 36 + hairSway, 20);
  ctx.bezierCurveTo(30 + hairSway, 8, 24, -8, 13, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.moveTo(18, -10);
  ctx.bezierCurveTo(38 + hairSway, 4, 28 + hairSway, 28, 38 + hairSway * 1.2, 45);
  ctx.bezierCurveTo(26 + hairSway, 30, 28, 8, 15, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Deep honey-gold under-layer of voluminous wavy hair
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(2, -36);
  ctx.bezierCurveTo(26, -30, 32 + hairSway, -6, 26 + hairSway, 14);
  ctx.bezierCurveTo(35 + hairSway, 30, 24 + hairSway, 50, 29 + hairSway, 63);
  ctx.bezierCurveTo(18 + hairSway, 56, 12, 38, 6, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main cascading S-curved golden-blonde hair waves (bohaté zlaté vlnité vlasy)
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-2, -38);
  ctx.bezierCurveTo(20, -34, 26 + hairSway * 0.7, -14, 19 + hairSway * 0.8, 4);
  ctx.bezierCurveTo(29 + hairSway, 18, 18 + hairSway, 36, 25 + hairSway, 54);
  ctx.bezierCurveTo(14 + hairSway, 46, 16, 26, 8, 12);
  ctx.bezierCurveTo(4, -4, 4, -20, -2, -38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Secondary bright sun-gold hair lock with curled tip
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(5, -28);
  ctx.bezierCurveTo(18, -16, 11 + hairSway * 0.5, 2, 21 + hairSway * 0.8, 18);
  ctx.bezierCurveTo(15 + hairSway * 0.6, 30, 22 + hairSway, 42, 17 + hairSway, 52);
  ctx.bezierCurveTo(11 + hairSway * 0.5, 38, 13, 22, 7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Decorative wave-lines inside the golden hair
  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(12, -22);
  ctx.bezierCurveTo(21, -10, 14 + hairSway * 0.6, 6, 22 + hairSway * 0.8, 22);
  ctx.moveTo(16, -6);
  ctx.bezierCurveTo(25 + hairSway * 0.5, 10, 17 + hairSway * 0.8, 28, 24 + hairSway, 44);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. GRACEFUL BARE LEGS & FEET STEPPING IN THE PUDDLE (FACING LEFT)
  // --------------------------------------------------------------------------
  // Back leg (warm shaded peach)
  ctx.fillStyle = '#E59866';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-1, 32);
  ctx.quadraticCurveTo(-2, 50, 1, 65);
  ctx.lineTo(-9, 68);
  ctx.quadraticCurveTo(-5, 63, -4, 58);
  ctx.quadraticCurveTo(-6, 44, -5, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front bare leg & dainty bare foot with toes facing left (revealed through dress slit)
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-6, 26);
  ctx.quadraticCurveTo(-9, 46, -4, 64);
  // Heel
  ctx.quadraticCurveTo(-2, 68, -5, 69);
  // Sole and dainty toes pointing left
  ctx.lineTo(-17, 69);
  ctx.quadraticCurveTo(-20, 67, -15, 65);
  // Ankle arch
  ctx.quadraticCurveTo(-10, 62, -10, 56);
  ctx.quadraticCurveTo(-12, 42, -10, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Delicate toe lines on bare foot
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-16, 67.5); ctx.lineTo(-13.5, 67.2);
  ctx.moveTo(-15, 68.5); ctx.lineTo(-12.5, 68.2);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. WET TRANSLUCENT AQUA-MINT & ICE-BLUE GOWN WITH DRIPPING TATTERED HEM
  // --------------------------------------------------------------------------
  // Back/right flowing skirt train in seafoam-aqua
  ctx.fillStyle = '#A7F3D0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.bezierCurveTo(19, 14, 20, 42, 24, 67);
  ctx.lineTo(14, 69);
  ctx.lineTo(11, 58);
  ctx.lineTo(6, 68);
  ctx.lineTo(0, 65);
  ctx.quadraticCurveTo(3, 40, -2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main fitted bodice & draped wet ice-blue skirt with side slit over front leg
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Neckline / upper bodice (facing left)
  ctx.moveTo(-11, -10);
  // Fitted front waist
  ctx.quadraticCurveTo(-9, 0, -11, 10);
  // Front skirt panel hanging down with dripping tips
  ctx.quadraticCurveTo(-16, 28, -18, 52);
  ctx.lineTo(-14, 46);
  ctx.lineTo(-12, 57);
  // High slit opening up to hip (-6, 22) revealing her warm peach leg!
  ctx.quadraticCurveTo(-9, 38, -6, 22);
  // Back skirt panel sweeping over curvy hip and down to puddle
  ctx.quadraticCurveTo(-4, 42, -1, 61);
  ctx.lineTo(4, 52);
  ctx.lineTo(8, 67);
  ctx.lineTo(15, 66);
  // Curvy right hip & back waist contour
  ctx.bezierCurveTo(16, 42, 18, 18, 8, 4);
  ctx.quadraticCurveTo(6, -4, 6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Soft sky-blue wet fabric fold highlights & vertical drapery lines
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.moveTo(-4, 12);
  ctx.quadraticCurveTo(4, 28, 6, 56);
  ctx.lineTo(11, 62);
  ctx.quadraticCurveTo(11, 32, 3, 10);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-7, 6);
  ctx.quadraticCurveTo(-11, 24, -13, 44);
  ctx.moveTo(1, 8);
  ctx.quadraticCurveTo(6, 28, 7, 52);
  ctx.stroke();

  // Organic green pond-moss sash / Tendril draped across her waist & hip (as in reference pic!)
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-10, 7);
  ctx.quadraticCurveTo(-1, 12, 8, 22);
  ctx.lineTo(5, 27);
  ctx.quadraticCurveTo(-2, 17, -11, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm sun-kissed peach upper chest, neck & bare shoulder
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-9, -18);
  ctx.quadraticCurveTo(-12, -13, -11, -8);
  ctx.quadraticCurveTo(-4, -5, 4, -8);
  ctx.quadraticCurveTo(5, -14, 1, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle collar-bone & shoulder pearl highlight
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-2, -10, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Sweetheart ruffled wet neckline trim
  ctx.fillStyle = '#F0FDFA';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-12, -9);
  ctx.quadraticCurveTo(-6, -5, 4, -8);
  ctx.lineTo(3, -4);
  ctx.quadraticCurveTo(-6, -2, -12, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 5. HEAD, CHARMING SIDE/THREE-QUARTER PROFILE & WATER-LILY CROWN (FACING LEFT)
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -29 + state.gulpBob * 1.2);
  ctx.rotate(state.rusalkaHeadTiltRad);

  // 5A. Two iconic brown Cattail Reeds (Orobinec / Doutníky) rising from back of crown
  ctx.save();
  // Cattail 1 (taller, inner-right)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(9, -12);
  ctx.quadraticCurveTo(13, -24, 14, -36);
  ctx.stroke();
  ctx.fillStyle = '#9A3412';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(11.5, -33, 4.8, 12, 2.4);
  ctx.fill();
  ctx.stroke();
  // Cattail 2 (slightly lower, outer-right)
  ctx.beginPath();
  ctx.moveTo(14, -10);
  ctx.quadraticCurveTo(18, -20, 20, -30);
  ctx.stroke();
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.roundRect(17.5, -27, 4.5, 10.5, 2.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5B. Warm Sun-Kissed Peach Face Profile (facing LEFT toward Bubák!)
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Forehead top
  ctx.moveTo(-4, -14);
  // Smooth forehead curving down to nose bridge
  ctx.quadraticCurveTo(-13, -12, -13, -4);
  // Cute upturned button nose tip pointing left
  ctx.quadraticCurveTo(-17.5, -2.5, -16.5, 0.5);
  ctx.quadraticCurveTo(-15, 1.8, -13.5, 2.0);
  // Upper & lower lips and soft chin
  ctx.quadraticCurveTo(-15, 4.5, -13.5, 7.5);
  ctx.quadraticCurveTo(-12.5, 11.5, -6, 11.5);
  // Jawline curving back toward ear & neck
  ctx.quadraticCurveTo(3, 11.5, 6, 4);
  ctx.quadraticCurveTo(8, -6, -4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny upturned nostril dot
  ctx.fillStyle = '#9A3412';
  ctx.beginPath();
  ctx.arc(-14.5, 0.3, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Rosy coral-pink cheek blush with tiny white highlight dashes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-7.5, 3.8, 4.2, 2.8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-8.5, 2.5); ctx.lineTo(-7.2, 2.0);
  ctx.moveTo(-6.5, 2.8); ctx.lineTo(-5.3, 2.3);
  ctx.stroke();

  // Joyful smile or hearty synchronized beer-gulping mouth
  if (state.gulpIntensity > 0.3) {
    ctx.fillStyle = '#BE123C';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(-11.5, 5.8, 2.8, 2.5 + state.gulpBob * 0.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Warm rosy smile line curving up at the corner
    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-14.2, 4.6);
    ctx.quadraticCurveTo(-10.5, 6.2, -8.2, 3.8);
    ctx.stroke();
    // Subtle smile dimple arc
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(-7.8, 3.6, 1.4, -0.6, 1.1);
    ctx.stroke();
  }

  // 5C. Large Enchanting Side-Profile Eye with Sweeping Black Eyelashes
  // White sclera
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-7.2, -3.2, 4.4, 5.0, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Deep ocean-blue iris looking left toward Bubák
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(-8.6, -3.0, 2.7, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rich navy pupil
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(-9.0, -3.0, 1.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bright white dual catchlights in eye
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-7.8, -4.6, 1.15, 0, Math.PI * 2);
  ctx.arc(-9.5, -1.6, 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Thick upper eyelid & 3 sweeping curved eyelashes (výrazné dlouhé řasy)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-7.2, -3.2, 4.6, Math.PI * 1.1, Math.PI * 1.95);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.beginPath();
  // Lash 1 (top outer)
  ctx.moveTo(-4.0, -6.8);
  ctx.quadraticCurveTo(-1.2, -8.8, -0.5, -7.5);
  // Lash 2 (middle outer)
  ctx.moveTo(-2.8, -4.8);
  ctx.quadraticCurveTo(0.2, -6.0, 0.6, -4.5);
  // Lash 3 (front inner lash)
  ctx.moveTo(-10.8, -6.2);
  ctx.quadraticCurveTo(-12.5, -8.0, -11.5, -8.8);
  ctx.stroke();

  // High expressive arched eyebrow
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-11.5, -9.2);
  ctx.quadraticCurveTo(-7.0, -12.2, -2.5, -8.8);
  ctx.stroke();

  // 5D. Golden Front Hair Wave Framing Forehead & Delicate Ear
  // Delicate peach ear peeking out between golden curls
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(3.5, 2.5, 3.2, 2.4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden S-wave framing temple and sweeping behind the ear
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.quadraticCurveTo(2, -16, 4, -5);
  ctx.quadraticCurveTo(6, 1, 1, 5);
  ctx.quadraticCurveTo(9, 4, 11, -3);
  ctx.quadraticCurveTo(12, -13, 0, -16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5E. Lush Notched Green Water-Lily Pads & 3 Blooming White Water-Lilies (Leknínová koruna)
  // Front-left lily pad over brow
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-9, -15, 6.5, 3.8, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Top-center notched lily pad
  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.ellipse(-1, -18, 7.5, 4.8, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Back-right lily pad behind ear
  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.ellipse(15, -6, 7.2, 4.8, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Three blooming white water-lilies with golden stamen centers
  drawWaterLilyBlossom2D(ctx, -9, -17, 4.8, -0.35);
  drawWaterLilyBlossom2D(ctx, 5, -16, 7.2, 0.18);
  drawWaterLilyBlossom2D(ctx, 12, -7, 5.4, 0.55);

  ctx.restore(); // end head transform

  // --------------------------------------------------------------------------
  // 6. GLISTENING CRYSTAL-BLUE WATER DROPLETS DRIPPING FROM HAIR & HEM
  // --------------------------------------------------------------------------
  const d1 = ((t * 1.4) % 1) * 8;
  const d2 = (((t * 1.4) + 0.5) % 1) * 8;
  drawWaterDroplet2D(ctx, 11, -12 + d1 * 0.6, 2.2);
  drawWaterDroplet2D(ctx, 18 + hairSway * 0.5, 8 + d2 * 0.8, 2.5);
  drawWaterDroplet2D(ctx, 13 + hairSway * 0.4, 28 + d1 * 0.7, 2.1);
  drawWaterDroplet2D(ctx, 27 + hairSway, 52 + d2 * 0.5, 2.2);
  drawWaterDroplet2D(ctx, -15, 54 + d1 * 0.6, 2.0);

  ctx.restore();
}

/**
 * Draws the middle Tavern Bubák (Hospodský Bubák) based on the user's reference illustration,
 * with a smartly animated expressive face:
 * - Bare 4-toed lime-green troll feet with yellowish toenails.
 * - Tattered brown burlap shorts with frayed hems, golden waist button, a blue cross-stitched
 *   patch + torn green-knee hole on the left leg, and a red cross-stitched patch on the right leg.
 * - Right arm akimbo on his hip with bristly forearm hairs.
 * - Plump lime-green pot-belly with belly creases, swirl navel, and red suspenders with silver buckles.
 * - Blue-and-white polka-dot neckerchief tied in a front knot.
 * - Wild spiky two-tone dark-brown & golden-tan hair mane.
 * - Smartly animated face: huge wiggling jug ears, bushy black eyebrows, big bulging golden-yellow
 *   eyes with dynamic pupil tracking & blinking, bulbous freckled red nose, and a huge open grin/roar
 *   with blocky crooked yellowish teeth and a wagging curling red tongue!
 */
function drawTavernBubak2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: TavernSceneChoreographyState,
  t: number
): void {
  const INK = '#1C1610';

  // Smart facial animation drivers synchronized with tavern choreography
  const isClink = state.phase === 'hearty_clink';
  const isWindup = state.phase === 'smoke_rings_and_windup';
  const isGulp = state.gulpIntensity > 0.3;
  const isSatisfied = state.phase === 'satisfied_ah';

  // Mouth jaw openness (0 = closed grin, 1 = full ecstatic open roar like reference pic!)
  let jawOpen = 0.65 + 0.15 * Math.sin(t * 4.8);
  if (isClink) {
    jawOpen = 1.0;
  } else if (isWindup) {
    jawOpen = 0.78 + 0.2 * Math.sin(t * 8.0);
  } else if (isSatisfied) {
    jawOpen = 0.52 + 0.18 * Math.sin(t * 6.0);
  }

  // Natural periodic blink + ecstatic squint during clink/gulp
  const blinkPulse = (t % 3.7) > 3.54 ? Math.sin(((t % 3.7) - 3.54) / 0.16 * Math.PI) : 0;
  const eyeSquint = isGulp ? 0.55 : isClink ? 0.18 : blinkPulse * 0.85;

  // Smart pupil gaze tracking (looks at foaming mug, up at clink splash, or warmly at Rusalka)
  const pupilShiftX = isClink ? 1.6 : isWindup ? 1.8 : 1.1 + Math.sin(t * 2.2) * 0.7;
  const pupilShiftY = isClink ? -1.4 : isGulp ? -1.8 : Math.cos(t * 2.6) * 0.6;

  // Dynamic ear wiggle, eyebrow lift, nose twitch & tongue wag
  const earWiggle = Math.sin(t * 6.5) * 0.07 + (isClink ? 0.16 : 0);
  const browLift = (isClink ? 2.6 : isWindup ? 1.8 : 0.8) + Math.sin(t * 5.2) * 0.7;
  const noseTwitchY = Math.sin(t * 8.5) * 0.6 - (isClink ? 0.8 : 0);
  const tongueWagX = Math.sin(t * 7.2) * 2.0;
  const tongueCurlY = Math.cos(t * 5.6) * 1.2;

  ctx.save();
  ctx.translate(x, y);

  // --------------------------------------------------------------------------
  // 1. BIG BARE LIME-GREEN TROLL FEET WITH 4 TOES & YELLOWISH TOENAILS
  // --------------------------------------------------------------------------
  // Subtle ground shadow under Bubák's bare feet
  ctx.fillStyle = 'rgba(28, 22, 16, 0.18)';
  ctx.beginPath();
  ctx.ellipse(2, 71, 26, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left & Right bare green ankles and feet
  const feetConfigs = [
    { legX: -10, footX: -12, dir: -1 },
    { legX: 9, footX: 11, dir: 1 },
  ];
  for (const fc of feetConfigs) {
    // Ankle shaft
    ctx.fillStyle = '#84CC16';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(fc.legX - 4, 46);
    ctx.lineTo(fc.legX - 5, 65);
    ctx.lineTo(fc.legX + 5, 65);
    ctx.lineTo(fc.legX + 4, 46);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Foot base
    ctx.fillStyle = '#84CC16';
    ctx.beginPath();
    ctx.ellipse(fc.footX + fc.dir * 2, 67, 11.5, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4 plump toes with yellowish toenails
    for (let toe = 0; toe < 4; toe++) {
      const tx = fc.footX - 4 + toe * 3.8 + (fc.dir > 0 ? 2 : -1);
      const ty = 67.5 + (toe === 1 || toe === 2 ? 0.8 : 0);
      ctx.fillStyle = '#A3E635';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 2.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yellowish-amber toenail
      ctx.fillStyle = '#FACC15';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(tx + fc.dir * 0.4, ty + 0.6, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // --------------------------------------------------------------------------
  // 2. PLUMP LIME-GREEN TORSO, POT-BELLY & RED SUSPENDERS
  // --------------------------------------------------------------------------
  // Bare lime-green torso & rounded pot-belly
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-13, -11);
  ctx.quadraticCurveTo(-17, 4, -15, 18);
  ctx.quadraticCurveTo(2, 23, 17, 17);
  ctx.quadraticCurveTo(19, 3, 11, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright lime belly highlight
  ctx.fillStyle = '#A3E635';
  ctx.beginPath();
  ctx.ellipse(3, 7, 9.5, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly-fat creases & cute spiral navel (pupík)
  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(4, 5, 5.5, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(5, 11, 1.6, 0, Math.PI * 1.65);
  ctx.stroke();

  // Red Suspenders (červené kšandy) with silver metal buckles
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  // Left suspender strap
  ctx.beginPath();
  ctx.moveTo(-11, -10);
  ctx.lineTo(-6, -10);
  ctx.lineTo(-2, 18);
  ctx.lineTo(-7, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right suspender strap
  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.lineTo(11, -10);
  ctx.lineTo(15, 17);
  ctx.lineTo(10, 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Silver metal buckles on suspenders
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-8.5, -1, 6.2, 4.5);
  ctx.rect(-7.5, 12, 5.8, 6.5);
  ctx.rect(9.5, 2, 5.8, 4.5);
  ctx.rect(10.2, 11, 5.5, 6.2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. TATTERED BROWN BURLAP SHORTS WITH BLUE & RED STITCHED PATCHES
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  // Jagged frayed waistband
  ctx.moveTo(-17, 16);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-6, 17);
  ctx.lineTo(1, 14);
  ctx.lineTo(8, 17);
  ctx.lineTo(14, 14);
  ctx.lineTo(19, 17);
  // Right trouser outer contour & jagged bottom hem
  ctx.quadraticCurveTo(21, 34, 18, 52);
  ctx.lineTo(14, 47);
  ctx.lineTo(11, 53);
  ctx.lineTo(7, 47);
  ctx.lineTo(3, 52);
  // Crotch split
  ctx.lineTo(1, 36);
  // Left trouser inner & jagged bottom hem
  ctx.lineTo(-3, 53);
  ctx.lineTo(-7, 47);
  ctx.lineTo(-11, 54);
  ctx.lineTo(-15, 48);
  ctx.lineTo(-20, 52);
  ctx.quadraticCurveTo(-21, 34, -17, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Vertical burlap texture lines
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, 18); ctx.lineTo(-6, 44);
  ctx.moveTo(4, 21); ctx.lineTo(6, 44);
  ctx.moveTo(13, 19); ctx.lineTo(14, 32);
  ctx.stroke();

  // Golden oval waist button
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(5, 19, 3.0, 2.0, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue cross-stitched fabric patch on left leg
  ctx.fillStyle = '#3B82F6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(-15, 24, 9.5, 9.5);
  ctx.fill();
  ctx.stroke();
  // Stitches around blue patch
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-17, 26); ctx.lineTo(-13, 26);
  ctx.moveTo(-17, 31); ctx.lineTo(-13, 31);
  ctx.moveTo(-7, 26); ctx.lineTo(-4, 26);
  ctx.moveTo(-7, 31); ctx.lineTo(-4, 31);
  ctx.stroke();

  // Small torn hole below blue patch showing lime-green knee!
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-14, 39);
  ctx.lineTo(-9, 38);
  ctx.lineTo(-10, 43);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red cross-stitched fabric patch on right leg
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(6, 33, 9.5, 9.5);
  ctx.fill();
  ctx.stroke();
  // Stitches around red patch
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(4, 35); ctx.lineTo(8, 35);
  ctx.moveTo(4, 40); ctx.lineTo(8, 40);
  ctx.moveTo(14, 35); ctx.lineTo(17, 35);
  ctx.moveTo(14, 40); ctx.lineTo(17, 40);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. FOREGROUND RIGHT ARM AKIMBO ON HIP (CLEARLY VISIBLE ON TOP OF TORSO!)
  // --------------------------------------------------------------------------
  // Two-segment bent arm: Shoulder (-13, -7) -> Outer Elbow (-31, 4) -> Wrist on Hip (-13, 13)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 9.2;
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.lineTo(-30, 4);
  ctx.lineTo(-13, 13);
  ctx.stroke();

  ctx.strokeStyle = '#84CC16';
  ctx.lineWidth = 5.6;
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.lineTo(-30, 4);
  ctx.lineTo(-13, 13);
  ctx.stroke();

  // Bright lime highlight along upper edge of bent arm
  ctx.strokeStyle = '#A3E635';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(-29, 3);
  ctx.lineTo(-14, 12);
  ctx.stroke();

  // Bristly black hairs sticking out along the outer elbow & forearm
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-24, -2); ctx.lineTo(-28, -5);
  ctx.moveTo(-29, 1); ctx.lineTo(-34, 0);
  ctx.moveTo(-31, 5); ctx.lineTo(-36, 6);
  ctx.moveTo(-26, 9); ctx.lineTo(-30, 12);
  ctx.stroke();

  // Plump green fist resting visibly in the foreground on his hip with 3 curled knuckles!
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-11.5, 13.5, 5.5, 4.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Distinct finger knuckles on hip hand
  ctx.fillStyle = '#84CC16';
  ctx.lineWidth = 1.4;
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.ellipse(-8.5, 13.2 + k * 2.2, 2.2, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 5. BLUE-AND-WHITE POLKA-DOT NECKERCHIEF / BANDANA (PUNTÍKOVANÝ ŠÁTEK)
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  // Neck band
  ctx.beginPath();
  ctx.moveTo(-13, -13);
  ctx.quadraticCurveTo(0, -7, 12, -12);
  ctx.lineTo(10, -6);
  ctx.quadraticCurveTo(0, -2, -12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Two hanging triangular knot ends at front of throat
  ctx.beginPath();
  ctx.moveTo(1, -7);
  ctx.lineTo(-2, 3);
  ctx.lineTo(4, -2);
  ctx.lineTo(9, 2);
  ctx.lineTo(7, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crisp white polka dots on neckerchief
  ctx.fillStyle = '#FFFDF7';
  const dotCoords = [
    [-8, -10], [-3, -8.5], [2, -8], [6, -9], [1, -2], [6, -2.5],
  ];
  for (const [dx, dy] of dotCoords) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // --------------------------------------------------------------------------
  // 6. SMARTLY ANIMATED HEAD, WILD SPIKY HAIR & EXPRESSIVE GOBLIN FACE
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -29 + state.gulpBob * 1.2);
  ctx.rotate(state.bubakHeadTiltRad);

  // 6A. Wild Spiky Two-Tone Dark-Brown & Golden-Tan Hair Mane (divoká hříva)
  const hairSpikes = [
    { ang: -3.45, len: 24, col: '#451A03' },
    { ang: -3.15, len: 27, col: '#D97706' },
    { ang: -2.85, len: 29, col: '#451A03' },
    { ang: -2.55, len: 28, col: '#F59E0B' },
    { ang: -2.25, len: 30, col: '#451A03' },
    { ang: -1.95, len: 28, col: '#D97706' },
    { ang: -1.65, len: 29, col: '#451A03' },
    { ang: -1.35, len: 26, col: '#F59E0B' },
    { ang: -1.05, len: 25, col: '#451A03' },
    { ang: -0.75, len: 22, col: '#D97706' },
    { ang: -0.45, len: 19, col: '#451A03' },
  ];
  for (let i = 0; i < hairSpikes.length; i++) {
    const sp = hairSpikes[i];
    const flutter = Math.sin(t * 7.5 + i * 1.1) * (isClink ? 0.08 : 0.03);
    const a = sp.ang + flutter;
    const tipX = Math.cos(a) * sp.len;
    const tipY = -4 + Math.sin(a) * sp.len;
    const perpX = -Math.sin(a) * 4.5;
    const perpY = Math.cos(a) * 4.5;

    ctx.fillStyle = sp.col;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(perpX, -4 + perpY);
    ctx.quadraticCurveTo(
      tipX * 0.55 + perpX * 0.6,
      -4 + (tipY + 4) * 0.55 - 3,
      tipX,
      tipY
    );
    ctx.quadraticCurveTo(
      tipX * 0.55 - perpX * 0.4,
      -4 + (tipY + 4) * 0.55 + 2,
      -perpX,
      -4 - perpY
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 6B. Huge Wiggling Jug Ears (Velké odstávající uši)
  // Right (far) ear behind right cheek
  ctx.save();
  ctx.translate(14, -4);
  ctx.rotate(-earWiggle);
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(4, 0, 6.5, 9.0, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(4, 0.5, 4.0, 6.0, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Left (near/back) huge jug ear
  ctx.save();
  ctx.translate(-15, -1);
  ctx.rotate(earWiggle);
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-5, 0, 7.8, 10.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(-4.8, 0.5, 5.0, 7.0, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Inner ear concha curve
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-4.5, 1, 2.8, 0.5, Math.PI * 1.4);
  ctx.stroke();
  ctx.restore();

  // 6C. Lime-Green Goblin Head Contour (widens with cheek laugh lines)
  const jawDropPx = isGulp ? 1.5 : jawOpen * 3.8;
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-13, -12);
  ctx.quadraticCurveTo(0, -18, 12, -12);
  ctx.quadraticCurveTo(18, -2, 16, 7 + jawDropPx * 0.6);
  ctx.quadraticCurveTo(3, 16 + jawDropPx, -12, 10 + jawDropPx * 0.5);
  ctx.quadraticCurveTo(-18, 1, -13, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6D. Smartly Animated Mouth, Crooked Yellowish Teeth & Wagging Red Tongue!
  if (isGulp) {
    // Synchronized Beer Gulp mouth (rhythmic O-gulp)
    const gulpR = 5.0 + state.gulpBob * 1.1;
    ctx.fillStyle = '#3B0707';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(4, 6.5, gulpR * 1.1, gulpR * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top & bottom teeth peeking inside gulping mouth
    ctx.fillStyle = '#FEF08A';
    ctx.lineWidth = 1.2;
    ctx.fillRect(0, 2.2, 3.2, 2.6);
    ctx.strokeRect(0, 2.2, 3.2, 2.6);
    ctx.fillRect(4.2, 2.2, 3.2, 2.6);
    ctx.strokeRect(4.2, 2.2, 3.2, 2.6);

    // Tongue at bottom of gulping mouth
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.ellipse(4, 9.2, 3.8, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Huge ecstatic ear-to-ear open grin / roar (matching uploaded reference pic!)
    const mouthBotY = 10.5 + jawDropPx;

    // Coral-pink inner lip rim
    ctx.fillStyle = '#F87171';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-11, -0.5);
    ctx.quadraticCurveTo(2, 2.5, 14, -1.0);
    ctx.quadraticCurveTo(16, mouthBotY, 2, mouthBotY + 2.5);
    ctx.quadraticCurveTo(-12, mouthBotY, -11, -0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deep dark mouth interior cavity
    ctx.fillStyle = '#2A0808';
    ctx.beginPath();
    ctx.moveTo(-9.5, 0.5);
    ctx.quadraticCurveTo(2, 3.2, 12.5, 0.2);
    ctx.quadraticCurveTo(14, mouthBotY - 1, 2, mouthBotY + 1.0);
    ctx.quadraticCurveTo(-10.5, mouthBotY - 1, -9.5, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lively Curling Red Tongue wagging inside mouth
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-5, mouthBotY - 1);
    ctx.quadraticCurveTo(
      -2 + tongueWagX,
      3.5 + tongueCurlY,
      5 + tongueWagX * 0.7,
      5.5 + tongueCurlY
    );
    ctx.quadraticCurveTo(9, mouthBotY - 0.5, 3, mouthBotY + 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tongue center groove
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-1 + tongueWagX * 0.5, 5.2 + tongueCurlY);
    ctx.quadraticCurveTo(2 + tongueWagX * 0.5, 7.5, 2, mouthBotY - 0.8);
    ctx.stroke();

    // Upper row of 5 blocky crooked yellowish goblin teeth
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    const topTeethX = [-8.5, -4.2, 0.2, 4.8, 9.0];
    for (let i = 0; i < topTeethX.length; i++) {
      const tx = topTeethX[i];
      const ty = i === 0 || i === 4 ? 0.2 : 1.2;
      const tw = 3.3;
      const th = (i === 1 || i === 2 ? 3.8 : 3.2) * (0.75 + jawOpen * 0.25);
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 0.8);
      ctx.fill();
      ctx.stroke();
    }

    // Lower row of 4 blocky crooked yellowish teeth moving with jaw
    const botTeethX = [-7.0, -2.2, 3.2, 7.8];
    for (let i = 0; i < botTeethX.length; i++) {
      const tx = botTeethX[i];
      const th = (i === 1 || i === 2 ? 3.5 : 2.9) * (0.75 + jawOpen * 0.25);
      const ty = mouthBotY - th + (i === 0 || i === 3 ? -0.8 : 0.4);
      ctx.beginPath();
      ctx.roundRect(tx, ty, 3.2, th, 0.8);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Cheerful cheek laugh-fold arcs beside mouth corners
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-10.5, -1, 2.8, Math.PI * 0.65, Math.PI * 1.45);
  ctx.stroke();

  // 6E. Big Bulging Golden-Yellow Eyes with Smart Pupil Tracking & Eyelids
  const eyeCenters = [
    { cx: -2.2, cy: -6.8, rx: 5.0, ry: 5.4 },
    { cx: 6.8, cy: -7.6, rx: 4.5, ry: 4.9 },
  ];
  for (const ec of eyeCenters) {
    // Bulging golden-yellow eyeball
    ctx.fillStyle = '#FDE047';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(ec.cx, ec.cy, ec.rx, ec.ry * (1 - eyeSquint * 0.65), -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (eyeSquint < 0.7) {
      // Warm amber outer iris ring
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX, ec.cy + pupilShiftY, 2.3, 0, Math.PI * 2);
      ctx.fill();

      // Lively black pupil
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX, ec.cy + pupilShiftY, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Crisp white specular highlight
      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX - 0.7, ec.cy + pupilShiftY - 0.8, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Thick Bushy Black Eyebrows that arch & bounce with excitement
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  // Left eyebrow
  ctx.moveTo(-8.5, -11.5 - browLift);
  ctx.quadraticCurveTo(-3.0, -15.5 - browLift, 1.5, -12.0 - browLift * 0.7);
  // Right eyebrow
  ctx.moveTo(2.5, -12.5 - browLift * 0.8);
  ctx.quadraticCurveTo(7.2, -16.0 - browLift, 11.5, -12.2 - browLift * 0.6);
  ctx.stroke();

  // 6F. Big Bulbous Freckled Red-Orange Tavern Nose (velký červený frňák)
  const ny = -2.2 + noseTwitchY;
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(7.5, ny, 6.4, 4.4, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Warm orange-coral highlight on top of nose
  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.ellipse(7.2, ny - 1.2, 4.2, 2.0, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Tiny freckle/pore dots on bulbous nose (just like reference pic!)
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  ctx.arc(5.5, ny - 0.5, 0.65, 0, Math.PI * 2);
  ctx.arc(8.2, ny - 1.2, 0.65, 0, Math.PI * 2);
  ctx.arc(10.0, ny + 0.2, 0.65, 0, Math.PI * 2);
  ctx.arc(7.0, ny + 0.8, 0.65, 0, Math.PI * 2);
  ctx.fill();

  // 6G. Frothy White Beer-Foam Mustache after gulping!
  if (state.foamMustacheAlpha > 0.05) {
    ctx.save();
    ctx.globalAlpha = state.foamMustacheAlpha;
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 5.8, 2.6, -0.18, 0, Math.PI * 2);
    ctx.ellipse(8.5, 1.5, 5.8, 2.6, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // end head transform
  ctx.restore(); // end Bubák transform
}

/**
 * Helper to draw a hefty foaming Czech tavern beer mug (korbel s pěnivým pivem).
 */
function drawFoamingBeerMug2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tiltRad: number,
  handleSide: 'left' | 'right',
  beerLevel: number,
  foamScale: number,
  t: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tiltRad);

  const mugW = 22;
  const mugH = 28;
  const halfW = mugW / 2;
  const halfH = mugH / 2;

  // 1. Thick glass / pewter mug handle on outer side
  const hSign = handleSide === 'left' ? -1 : 1;
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 5.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(hSign * (halfW + 1), 1, 7.5, hSign > 0 ? -Math.PI * 0.45 : Math.PI * 0.55, hSign > 0 ? Math.PI * 0.45 : Math.PI * 1.45);
  ctx.stroke();

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(hSign * (halfW + 1), 1, 7.5, hSign > 0 ? -Math.PI * 0.45 : Math.PI * 0.55, hSign > 0 ? Math.PI * 0.45 : Math.PI * 1.45);
  ctx.stroke();

  // 2. Glass mug body background
  ctx.fillStyle = '#FEF9C3';
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 2.8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.rect(-halfW, -halfH, mugW, mugH);
  ctx.fill();

  // 3. Golden Czech lager liquid inside mug
  const liquidH = Math.max(4, (mugH - 4) * clamp01(beerLevel));
  const liquidTopY = halfH - 2 - liquidH;
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.rect(-halfW + 2, liquidTopY, mugW - 4, liquidH);
  ctx.fill();

  // Rich amber depth stripe on side of beer
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.rect(0, liquidTopY, halfW - 2, liquidH);
  ctx.fill();

  // Crisp vertical glass flutes / dimples & white specular highlight
  ctx.strokeStyle = 'rgba(255, 253, 247, 0.78)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-halfW + 5, -halfH + 5);
  ctx.lineTo(-halfW + 5, halfH - 4);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -halfH + 6);
  ctx.lineTo(0, halfH - 4);
  ctx.moveTo(halfW - 5, -halfH + 6);
  ctx.lineTo(halfW - 5, halfH - 4);
  ctx.stroke();

  // Rising carbonation bubbles inside the golden beer
  ctx.fillStyle = '#FFFDF7';
  for (let b = 0; b < 3; b++) {
    const by = halfH - 4 - (((t * 16 + b * 7) % Math.max(6, liquidH - 2)));
    const bx = -4 + b * 4;
    if (by > liquidTopY + 2) {
      ctx.beginPath();
      ctx.arc(bx, by, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Re-stroke mug outer ink frame and bottom pewter base rim
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 2.8;
  ctx.strokeRect(-halfW, -halfH, mugW, mugH);

  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(-halfW - 1, halfH - 3.5, mugW + 2, 4);
  ctx.strokeRect(-halfW - 1, halfH - 3.5, mugW + 2, 4);

  // 4. Rich, billowing snow-white beer foam head (bohatá čepice pěny)
  const fS = Math.max(0.65, foamScale);
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 2.3;

  ctx.beginPath();
  ctx.arc(-halfW + 2, -halfH - 1, 6.2 * fS, 0, Math.PI * 2);
  ctx.arc(halfW - 2, -halfH - 1, 6.2 * fS, 0, Math.PI * 2);
  ctx.arc(0, -halfH - 4.5 * fS, 7.8 * fS, 0, Math.PI * 2);
  ctx.arc(hSign < 0 ? 4 : -4, -halfH + 4, 4.5 * fS, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.ellipse(0, -halfH - 1.5, (halfW - 1) * Math.min(1.2, fS), 5.2 * fS, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders the complete Josef Lada tavern scene in Hospoda U Černého kocoura on a 2D Canvas (560 × 230 logical stage):
 * - Left: Naturally proportioned Hastrman in snug green frock coat with dripping coat-tail, puffing smoke rings & winking.
 * - Wall: Authentic gold-framed portrait of Emperor Franz Joseph I (Císař František Josef I.) with a tiny tavern fly.
 * - Center: Rustic wooden tavern table with glazed beer pitcher and black tavern cat (clutter flower mug removed!).
 * - Right: Czech Bubák and beautiful Rusalka clinking foaming beer mugs with flying foam splashes and taking a hearty synchronized gulp.
 *
 * Strictly zero per-frame CanvasGradient allocations (100% flat gouache polygons & bold India ink lines).
 */
export function drawTavernCoverCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  t: number,
  manualToastStart: number = -100,
  manualPipeStart: number = -100,
  hoverMix: number = 0
): void {
  const state = computeTavernSceneChoreography(t, manualToastStart, manualPipeStart, hoverMix);

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const scaleX = canvasWidth / 560;
  const scaleY = canvasHeight / 230;
  ctx.scale(scaleX, scaleY);

  const INK = '#1C1610';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ==========================================================================
  // 1. COZY TAVERN WALL BACKDROP & WOODEN FLOORBOARDS
  // ==========================================================================
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(18, 198);
  ctx.lineTo(542, 198);
  ctx.stroke();

  ctx.strokeStyle = '#8C5C36';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(24, 204);
  ctx.lineTo(536, 204);
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([28, 8, 38, 10]);
  ctx.beginPath();
  ctx.moveTo(32, 210);
  ctx.lineTo(528, 210);
  ctx.stroke();
  ctx.setLineDash([]);

  // ==========================================================================
  // 2. WALL PORTRAIT: CÍSAŘ FRANTIŠEK JOSEF I. (EMPEROR FRANZ JOSEPH I)
  // ==========================================================================
  // Replaces the generic flower picture with the iconic Austrian imperial tavern portrait!
  drawEmperorPortrait2D(ctx, 194, 16, 52, 68, t);

  // Floating tavern musical notes ("V koutě vyhrávají pekelné dudy...")
  for (let n = 0; n < 2; n++) {
    const noteProgress = ((t * 0.45 + n * 0.5) % 1);
    const nx = 42 + n * 24 + Math.sin(t * 2.5 + n) * 4;
    const ny = 66 - noteProgress * 34;
    const nAlpha = Math.sin(noteProgress * Math.PI) * 0.85;
    if (nAlpha > 0.08) {
      ctx.save();
      ctx.globalAlpha = nAlpha;
      ctx.fillStyle = '#78350F';
      ctx.font = '900 14px Eczar, serif';
      ctx.fillText(n === 0 ? '♪' : '♫', nx, ny);
      ctx.restore();
    }
  }

  // ==========================================================================
  // 3. RUSTIC TAVERN TABLE WITH EMBROIDERED GREEN CLOTH & PITCHER
  // (Removed cluttered flower mug per user request!)
  // ==========================================================================
  // Table ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.16)';
  ctx.beginPath();
  ctx.ellipse(268, 200, 108, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Table legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 9.5;
  ctx.beginPath();
  ctx.moveTo(196, 130);
  ctx.lineTo(186, 196);
  ctx.moveTo(340, 130);
  ctx.lineTo(350, 196);
  ctx.stroke();

  ctx.strokeStyle = '#8C5832';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(196, 130);
  ctx.lineTo(186, 196);
  ctx.moveTo(340, 130);
  ctx.lineTo(350, 196);
  ctx.stroke();

  // Crossbar stretcher between table legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(189, 168);
  ctx.lineTo(347, 168);
  ctx.stroke();

  ctx.strokeStyle = '#7A4B27';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(189, 168);
  ctx.lineTo(347, 168);
  ctx.stroke();

  drawFolkFlower2D(ctx, 268, 168, 4.8, '#FACC15', '#E6392B', -t * 0.7);

  // Little Black Tavern Cat ("Černý kocour") perched near the stretcher
  ctx.save();
  ctx.translate(225, 194);
  const catTailWag = Math.sin(t * 4.2) * 5;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.quadraticCurveTo(-22, -10 + catTailWag, -18, -18);
  ctx.stroke();

  ctx.fillStyle = '#1C1610';
  ctx.beginPath();
  ctx.ellipse(0, -6, 11, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(9, -13, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -17);
  ctx.lineTo(6, -23);
  ctx.lineTo(9, -18);
  ctx.moveTo(10, -18);
  ctx.lineTo(13, -23);
  ctx.lineTo(15, -17);
  ctx.fill();

  ctx.fillStyle = '#E6392B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(6, -8, 3.5, 2, -0.3, 0, Math.PI * 2);
  ctx.ellipse(11, -7, 3.5, 2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(8, -13.5, 1.5, 0, Math.PI * 2);
  ctx.arc(12.2, -13.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Table wooden apron underboard
  ctx.fillStyle = '#7A4B27';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(166, 128);
  ctx.lineTo(372, 128);
  ctx.lineTo(364, 143);
  ctx.lineTo(174, 143);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Green embroidered tablecloth top
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(156, 121);
  ctx.lineTo(382, 121);
  ctx.lineTo(376, 130);
  ctx.lineTo(162, 130);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(162, 125.5);
  ctx.lineTo(376, 125.5);
  ctx.stroke();

  drawFolkFlower2D(ctx, 182, 135, 4.4, '#E11D48', '#FACC15', t * 0.9);
  drawFolkFlower2D(ctx, 354, 135, 4.4, '#38BDF8', '#FACC15', -t * 0.9);

  // Glazed Earthenware Beer Pitcher (Džbánek s hvězdou) on table
  ctx.save();
  ctx.translate(228, 79);
  ctx.fillStyle = 'rgba(28, 22, 16, 0.2)';
  ctx.beginPath();
  ctx.ellipse(24, 44, 15, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(11, 17);
  ctx.bezierCurveTo(-1, 21, -1, 36, 11, 38);
  ctx.stroke();
  ctx.strokeStyle = '#9A6138';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(11, 17);
  ctx.bezierCurveTo(-1, 21, -1, 36, 11, 38);
  ctx.stroke();

  ctx.fillStyle = '#B47B49';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(14, 10);
  ctx.bezierCurveTo(8, 22, 8, 37, 14, 42);
  ctx.bezierCurveTo(18, 45, 34, 45, 38, 42);
  ctx.bezierCurveTo(44, 37, 44, 22, 38, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(20, 9, 4.5, 0, Math.PI * 2);
  ctx.arc(26, 7.5, 5.2, 0, Math.PI * 2);
  ctx.arc(32, 9, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawFolkFlower2D(ctx, 26, 28, 6.2, '#FACC15', '#E6392B', t * 0.5);
  ctx.restore();

  // ==========================================================================
  // 4. LEFT CHARACTER: AUTENTICKÝ ŠIBALSKÝ HASTRMAN (VODNÍK)
  // Cleanly proportioned, natural face, snug coat with dripping coat-tail!
  // ==========================================================================
  drawHastrman2D(ctx, 56, 56, state, t);

  // Render Hastrman's expanding folk smoke rings in world space
  for (const ring of state.smokeRings) {
    if (ring.alpha <= 0.03) continue;
    ctx.save();
    ctx.globalAlpha = ring.alpha;
    ctx.translate(ring.x, ring.y);
    ctx.rotate(ring.tilt);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#F0FDF4';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================================
  // 5. RIGHT GROUP LEFT SIDE: ČESKÝ BUBÁK TOASTING AT THE TABLE
  // Drawn after the user's reference illustration with a smartly animated face:
  // - Wild spiky two-tone brown & golden-tan hair mane
  // - Huge wiggling jug ears, bushy black eyebrows, bulging golden-yellow eyes
  //   with smart pupil tracking & blinking, and a bulbous freckled red nose
  // - Smartly animated jaw, blocky crooked yellowish teeth & wagging red tongue
  // - Blue-and-white polka-dot neckerchief, red suspenders with metal buckles,
  //   lime-green pot-belly, right arm akimbo on hip, tattered burlap shorts
  //   with blue & red stitched patches, and big bare 4-toed green troll feet!
  // ==========================================================================
  const bubakX = 298 + state.bubakBodyLeanX;
  const bubakY = 126;

  drawTavernBubak2D(ctx, bubakX, bubakY, state, t);

  // ==========================================================================
  // 6. RIGHT CHARACTER: KRÁSNÁ RUSALKA (VODNÍ VÍLA S LEKNÍNOVOU KORUNOU)
  // Detailed side/three-quarter profile facing LEFT toward Bubák, drawn after
  // the reference illustration: lush wavy golden hair with pond reeds, water-lily
  // crown with two brown cattails (orobinec), warm sun-kissed peach skin, big
  // expressive blue eye with lashes, wet ruffled aqua-mint dress, bare feet in
  // a puddle, and toasting heartily with her foaming beer mug!
  // ==========================================================================
  const rusalkaX = 456 + state.rusalkaBodyLeanX;
  const rusalkaY = 126;

  drawRusalka2D(ctx, rusalkaX, rusalkaY, state, t);

  // ==========================================================================
  // 7. TOASTING ARMS & THE TWO FOAMING BEER MUGS (KORBELE S PĚNIVÝM PIVEM)
  // ==========================================================================
  // Bubák's left arm extends clearly OUTWARD in front of his shoulder (never buried in torso!)
  const bubakShoulderX = bubakX + 12;
  const bubakShoulderY = bubakY - 5;
  const bubakHandX = state.bubakMugX - 13;
  const bubakHandY = state.bubakMugY + 2;
  const bubakElbowX = (bubakShoulderX + bubakHandX) * 0.5 + 3;
  const bubakElbowY = Math.max(bubakY + 5, bubakHandY + 12);

  // Bubák's fuzzy lime-green raised arm (outline + green fill + bright highlight)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 9.6;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY, bubakHandX, bubakHandY);
  ctx.stroke();

  ctx.strokeStyle = '#84CC16';
  ctx.lineWidth = 6.0;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY, bubakHandX, bubakHandY);
  ctx.stroke();

  ctx.strokeStyle = '#A3E635';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY - 1);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY - 1, bubakHandX, bubakHandY - 1);
  ctx.stroke();

  // Bristly goblin hairs along Bubák's raised forearm (as in reference pic!)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  for (let h = 1; h <= 4; h++) {
    const u = h * 0.2;
    const hx = (1 - u) * (1 - u) * bubakShoulderX + 2 * (1 - u) * u * bubakElbowX + u * u * bubakHandX;
    const hy = (1 - u) * (1 - u) * bubakShoulderY + 2 * (1 - u) * u * bubakElbowY + u * u * bubakHandY;
    ctx.beginPath();
    ctx.moveTo(hx + 2, hy + 3);
    ctx.lineTo(hx + 5, hy + 7);
    ctx.stroke();
  }

  // Rusalka's warm sun-kissed peach arm reaching from her ruffled off-shoulder sleeve to the beer mug
  const rusalkaShoulderX = rusalkaX - 3;
  const rusalkaShoulderY = rusalkaY - 6;
  const rusalkaElbowX = (rusalkaShoulderX + state.rusalkaMugX + 14) * 0.5 + 2;
  const rusalkaElbowY = Math.max(rusalkaY + 10, state.rusalkaMugY + 11);
  const rusalkaHandX = state.rusalkaMugX + 11;
  const rusalkaHandY = state.rusalkaMugY + 2;

  // Trailing wet green pond stem & water droplet near Rusalka's wrist (homage to reference artwork)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(rusalkaHandX + 1, rusalkaHandY + 3);
  ctx.quadraticCurveTo(rusalkaHandX + 5, rusalkaHandY + 14, rusalkaHandX + 1 + Math.sin(t * 3.5) * 2, rusalkaHandY + 23);
  ctx.stroke();
  ctx.strokeStyle = '#65A30D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(rusalkaHandX + 1, rusalkaHandY + 3);
  ctx.quadraticCurveTo(rusalkaHandX + 5, rusalkaHandY + 14, rusalkaHandX + 1 + Math.sin(t * 3.5) * 2, rusalkaHandY + 23);
  ctx.stroke();
  drawWaterDroplet2D(ctx, rusalkaHandX + 1, rusalkaHandY + 27 + ((t * 12) % 8), 2.2);

  // Arm outline & warm peach skin fill
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8.2;
  ctx.beginPath();
  ctx.moveTo(rusalkaShoulderX, rusalkaShoulderY);
  ctx.quadraticCurveTo(rusalkaElbowX, rusalkaElbowY, rusalkaHandX, rusalkaHandY);
  ctx.stroke();

  ctx.strokeStyle = '#F7C59F';
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.moveTo(rusalkaShoulderX, rusalkaShoulderY);
  ctx.quadraticCurveTo(rusalkaElbowX, rusalkaElbowY, rusalkaHandX, rusalkaHandY);
  ctx.stroke();

  // Translucent wet aqua off-shoulder sleeve ruffle draping over upper arm
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(rusalkaShoulderX - 7, rusalkaShoulderY - 2);
  ctx.quadraticCurveTo(rusalkaShoulderX, rusalkaShoulderY - 6, rusalkaShoulderX + 7, rusalkaShoulderY - 1);
  ctx.lineTo(rusalkaShoulderX + 5, rusalkaShoulderY + 7);
  ctx.lineTo(rusalkaShoulderX + 1, rusalkaShoulderY + 4);
  ctx.lineTo(rusalkaShoulderX - 2, rusalkaShoulderY + 9);
  ctx.lineTo(rusalkaShoulderX - 6, rusalkaShoulderY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw both foaming beer mugs
  drawFoamingBeerMug2D(
    ctx,
    state.bubakMugX,
    state.bubakMugY,
    state.bubakMugTiltRad,
    'left',
    state.beerLevel,
    state.foamHeadScale,
    t
  );
  drawFoamingBeerMug2D(
    ctx,
    state.rusalkaMugX,
    state.rusalkaMugY,
    state.rusalkaMugTiltRad,
    'right',
    state.beerLevel,
    state.foamHeadScale,
    t + 0.7
  );

  // Bubák's plump lime-green hand with 3 distinct fingers wrapped around the mug handle!
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(bubakHandX - 1, bubakHandY, 5.0, 4.4, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Bubák's curled green fingers gripping the handle
  ctx.fillStyle = '#A3E635';
  for (let f = -1; f <= 1; f++) {
    ctx.beginPath();
    ctx.ellipse(bubakHandX + 1.5, bubakHandY + f * 2.4, 2.6, 1.4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Rusalka's warm peach hand with delicate fingers wrapped around the mug handle
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(rusalkaHandX, rusalkaHandY, 4.4, 3.8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Finger knuckle lines on Rusalka's hand
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(rusalkaHandX - 2.5, rusalkaHandY - 1);
  ctx.lineTo(rusalkaHandX + 1, rusalkaHandY - 1);
  ctx.moveTo(rusalkaHandX - 2.5, rusalkaHandY + 1.2);
  ctx.lineTo(rusalkaHandX + 1, rusalkaHandY + 1.2);
  ctx.stroke();

  // ==========================================================================
  // 8. HEARTY CLINK STARBURST, FLYING FOAM BLOBS & GOLDEN BEER DROPLETS
  // ==========================================================================
  if (state.foamSplashProgress > 0.01) {
    const sp = state.foamSplashProgress;
    const clinkCenterX = (state.bubakMugX + state.rusalkaMugX) * 0.5;
    const clinkCenterY = Math.min(state.bubakMugY, state.rusalkaMugY) - 10;

    if (state.clinkImpact > 0.08) {
      ctx.save();
      ctx.globalAlpha = state.clinkImpact;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3.2;
      const rayCount = 8;
      for (let r = 0; r < rayCount; r++) {
        const ang = (r * Math.PI * 2) / rayCount - Math.PI * 0.5;
        const rInner = 8 + (1 - state.clinkImpact) * 8;
        const rOuter = 19 + (1 - state.clinkImpact) * 14;
        ctx.beginPath();
        ctx.moveTo(clinkCenterX + Math.cos(ang) * rInner, clinkCenterY + Math.sin(ang) * rInner);
        ctx.lineTo(clinkCenterX + Math.cos(ang) * rOuter, clinkCenterY + Math.sin(ang) * rOuter);
        ctx.stroke();
      }
      ctx.restore();
    }

    const splashAlpha = clamp01(1 - (sp - 0.55) / 0.45);
    ctx.save();
    ctx.globalAlpha = splashAlpha;
    const splashSeeds = [
      { vx: -34, vy: -36, isFoam: true, r: 4.6 },
      { vx: -18, vy: -44, isFoam: false, r: 3.0 },
      { vx: -6, vy: -48, isFoam: true, r: 5.2 },
      { vx: 8, vy: -46, isFoam: true, r: 4.8 },
      { vx: 22, vy: -42, isFoam: false, r: 3.2 },
      { vx: 36, vy: -34, isFoam: true, r: 4.4 },
      { vx: -26, vy: -24, isFoam: false, r: 2.8 },
      { vx: 28, vy: -22, isFoam: false, r: 2.8 },
    ];
    for (const item of splashSeeds) {
      const px = clinkCenterX + item.vx * sp;
      const py = clinkCenterY + item.vy * sp + 52 * sp * sp;
      ctx.fillStyle = item.isFoam ? '#FFFDF7' : '#F59E0B';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(px, py, item.r * (1 - sp * 0.25), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // 9. WHIMSICAL LADA FOLK CALLOUT BANNER ("CINK! NA ZDRAVÍ!", "GLUG! GLUG!")
  // ==========================================================================
  if (state.folkCallout) {
    const isPipeCallout = state.folkCallout === 'ŠIBALSKÉ BAF!';
    const badgeX = isPipeCallout ? 132 : 374;
    const badgeY = isPipeCallout ? 24 : 26;

    ctx.save();
    ctx.translate(badgeX, badgeY);
    const popScale = 0.96 + Math.sin(t * 14) * 0.04;
    ctx.scale(popScale, popScale);

    ctx.font = '900 13px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pillW = isPipeCallout ? 118 : state.folkCallout === 'CINK! NA ZDRAVÍ!' ? 136 : 104;
    const pillH = 22;

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW, pillH, 6);
    ctx.fill();

    ctx.fillStyle = state.phase === 'hearty_clink' ? '#FEF08A' : '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = state.phase === 'hearty_clink' ? '#B91C1C' : '#1C1610';
    ctx.fillText(state.folkCallout, 0, 1);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Illustrated 2D Canvas vignette for Hospoda U Černého kocoura:
 * - Left: Naturally proportioned Hastrman in snug green frock coat with dripping coat-tail, puffing smoke rings & winking.
 * - Wall: Authentic gold-framed portrait of Emperor Franz Joseph I (Císař František Josef I.) with a tiny tavern fly.
 * - Center: Rustic wooden tavern table with glazed beer pitcher and black tavern cat (clutter flower mug removed!).
 * - Right: Czech Bubák and beautiful Rusalka clinking foaming beer mugs across the rustic table and taking a hearty synchronized gulp.
 */
export const LadaCoverScene: React.FC<LadaCoverSceneProps> = ({
  className = '',
  width = '100%',
  height = 180,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const manualToastStartRef = useRef<number>(-100);
  const manualPipeStartRef = useRef<number>(-100);
  const isHoveredRef = useRef<boolean>(false);
  const hoverMixRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const nowSec = performance.now() / 1000;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const relX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
      if (relX < 0.38) {
        // Clicked on Hastrman -> trigger immediate sly pipe puff & smoke ring volley
        manualPipeStartRef.current = nowSec;
        try {
          sound.coin();
        } catch {
          // ignore audio error
        }
        return;
      }
    }
    // Clicked on Bubák, Rusalka, or the tavern table -> trigger immediate hearty mug clink & gulp!
    manualToastStartRef.current = nowSec;
    try {
      sound.coin();
    } catch {
      // ignore audio error
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasResolution = () => {
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(280, Math.round((rect.width || 560) * dpr));
      const targetH = Math.max(115, Math.round((rect.height || 230) * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    updateCanvasResolution();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateCanvasResolution);
      resizeObserver.observe(canvas);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && container) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isVisibleRef.current = entry.isIntersecting;
          }
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    const renderFrame = (nowMs: number) => {
      const ctx = canvas.getContext('2d');
      if (ctx && isVisibleRef.current) {
        const tSec = prefersReducedMotion ? 3.35 : nowMs / 1000;
        const targetHover = isHoveredRef.current ? 1 : 0;
        hoverMixRef.current += (targetHover - hoverMixRef.current) * 0.12;
        drawTavernCoverCanvas(
          ctx,
          canvas.width,
          canvas.height,
          tSec,
          manualToastStartRef.current,
          manualPipeStartRef.current,
          hoverMixRef.current
        );
      }
      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`lada-cover-scene flex items-center justify-center my-2 select-none ${className}`}
      style={{ width, height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        id="lada-tavern-cover-scene"
        data-testid="tavern-cover-canvas"
        width={560}
        height={230}
        onClick={handleCanvasClick}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        title="Hastrman šibalsky popotahuje z fajfky a Český bubák s krásnou rusalkou si připíjejí pěnivým pivem (klikni pro přípitek nebo vyfouknutí kroužků dýmu!)"
        aria-label="Hospoda U Černého kocoura – Hastrman s fajfkou, Český bubák a krásná rusalka s pěnivými korbely"
        className="cursor-pointer select-none"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '560px',
          aspectRatio: '560 / 230',
          display: 'block',
        }}
      />
    </div>
  );
};
