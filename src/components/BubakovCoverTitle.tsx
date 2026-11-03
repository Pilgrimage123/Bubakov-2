import React, { useEffect, useRef, useMemo } from 'react';
import { LadaFrieze } from './LadaFrieze';
import { LadaCanvasSvg } from './LadaCanvasIcon';
import { sound } from '../audio';

interface BubakovCoverTitleProps {
  className?: string;
  showCharacters?: boolean;
  showSubtitle?: boolean;
  compact?: boolean;
  interactiveBubak?: boolean;
}

export const BUBAK_CROW_CYCLE_DURATION = 9.6;

export type BubakCrowPhase =
  | 'patrol_approach'
  | 'pestering'
  | 'landing_on_head'
  | 'taunting_on_head'
  | 'angry_scream'
  | 'recovery_settle';

export interface BubakCrowChoreographyState {
  phase: BubakCrowPhase;
  cycleT: number;
  annoyanceLevel: number;
  screamLevel: number;
  inhaleLevel: number;
  landingImpact: number;
  isCrowOnHead: boolean;
  crowStartledLevel: number;
  // Bubák kinematics (in local 0..170 x 0..195 space)
  bubakRootScale: number;
  bubakRootLiftY: number;
  bubakPoleBendX: number;
  bubakTorsoX: number;
  bubakTorsoY: number;
  bubakTorsoRot: number;
  bubakTorsoScaleX: number;
  bubakTorsoScaleY: number;
  bubakSkirtRot: number;
  bubakLeftArmAngle: number;
  bubakRightArmAngle: number;
  bubakLeftCuffFlutter: number;
  bubakRightCuffFlutter: number;
  bubakHeadX: number;
  bubakHeadY: number;
  bubakHeadRot: number;
  bubakHeadScaleX: number;
  bubakHeadScaleY: number;
  bubakHeadCrownX: number;
  bubakHeadCrownY: number;
  bubakPupilDx: number;
  bubakPupilDy: number;
  bubakEyeSquint: number;
  bubakBrowSlant: number;
  bubakBrowDy: number;
  bubakRageFlush: number;
  bubakMouthOpen: number;
  bubakMouthWidth: number;
  bubakMouthSlant: number;
  // Black-and-white Crow kinematics (in Bubák local space)
  crowX: number;
  crowY: number;
  crowFacing: 1 | -1;
  crowFlightBlend: number;
  crowWingFlapAngle: number;
  crowWingFold: number;
  crowBodyPitch: number;
  crowHeadPitch: number;
  crowBeakOpen: number;
  crowTailWag: number;
  crowEyeScale: number;
  crowLegReach: number;
  crowTauntHopY: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const u = clamp01((x - edge0) / (edge1 - edge0));
  return u * u * (3 - 2 * u);
}

function smootherstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const u = clamp01((x - edge0) / (edge1 - edge0));
  return u * u * u * (u * (u * 6 - 15) + 10);
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

/**
 * Computes the 60 FPS continuous choreography state for Bubák (Scarecrow)
 * and the black-and-white hooded crow (vrána šedivka) pestering him,
 * tauntingly landing on his head, and getting blasted away by his angry scream.
 */
export function computeBubakCrowChoreography(
  t: number,
  manualScreamStart = -100,
  hoverMix = 0
): BubakCrowChoreographyState {
  const manualElapsed = t - manualScreamStart;
  const isManualActive = manualElapsed >= 0 && manualElapsed < 2.6;

  // Map time into the 9.6s narrative cycle (or jump to the head-taunt -> scream climax on click)
  const rawCycleT = ((t % BUBAK_CROW_CYCLE_DURATION) + BUBAK_CROW_CYCLE_DURATION) % BUBAK_CROW_CYCLE_DURATION;
  const cycleT = isManualActive
    ? Math.min(BUBAK_CROW_CYCLE_DURATION - 0.01, 5.55 + manualElapsed * 1.25)
    : rawCycleT;

  let phase: BubakCrowPhase = 'patrol_approach';
  if (cycleT < 1.2) {
    phase = 'patrol_approach';
  } else if (cycleT < 3.3) {
    phase = 'pestering';
  } else if (cycleT < 3.85) {
    phase = 'landing_on_head';
  } else if (cycleT < 5.85) {
    phase = 'taunting_on_head';
  } else if (cycleT < 7.75) {
    phase = 'angry_scream';
  } else {
    phase = 'recovery_settle';
  }

  // Smooth emotional envelopes (0..1)
  // Annoyance builds during pestering (1.2..3.3), hits high boil while crow hops on head (3.85..6.15), and fades after scream
  const pesterRamp = smoothstep(1.15, 3.2, cycleT) * 0.58;
  const headBoilRamp = smoothstep(3.3, 4.3, cycleT) * 0.42;
  const screamReleaseDrop = smoothstep(6.25, 7.85, cycleT);
  const annoyanceLevel = clamp01((pesterRamp + headBoilRamp) * (1 - screamReleaseDrop) + hoverMix * 0.12);

  // Pre-scream deep inhale (5.82s .. 6.20s)
  const inhaleLevel =
    smoothstep(5.80, 6.08, cycleT) * (1 - smoothstep(6.12, 6.26, cycleT));

  // Full-throated angry scream envelope (6.16s .. 7.65s)
  const screamAttack = smoothstep(6.14, 6.32, cycleT);
  const screamDecay = 1 - smootherstep(7.05, 7.78, cycleT);
  const screamLevel = clamp01(screamAttack * screamDecay);

  // Crow landing impact squash on Bubák's head (peaks around 3.74s)
  const landingImpact =
    smoothstep(3.58, 3.74, cycleT) * (1 - smoothstep(3.75, 4.10, cycleT));

  // Taunting peck rhythm while crow is perched on Bubák's head (3.85s .. 5.85s)
  const onHeadMask =
    smoothstep(3.68, 3.85, cycleT) * (1 - smoothstep(6.14, 6.24, cycleT));
  const isCrowOnHead = cycleT >= 3.70 && cycleT < 6.20;

  const tauntLocalT = Math.max(0, cycleT - 3.85);
  const tauntWave = Math.sin(tauntLocalT * 9.2);
  const crowTauntPeck = onHeadMask * Math.max(0, -tauntWave);
  const crowTauntHopY = onHeadMask * Math.max(0, tauntWave) * 5.2;
  const crowTauntShiftX = onHeadMask * Math.sin(tauntLocalT * 4.6) * 3.8;

  // High-frequency rage vibration when boiling with annoyance or screaming
  const rageTremble =
    Math.sin(t * 34) * (annoyanceLevel * 0.65 + inhaleLevel * 1.1) +
    Math.sin(t * 42) * screamLevel * 1.45;

  // Base wind-sway rhythm
  const bPhase = t * (1.55 + hoverMix * 0.25);

  // Bubák root & pole kinematics
  const bubakRootScale =
    1 + hoverMix * 0.02 + inhaleLevel * 0.035 + screamLevel * 0.085 - landingImpact * 0.025;
  const bubakRootLiftY =
    -hoverMix * 1.0 + landingImpact * 2.4 + inhaleLevel * 1.5 - screamLevel * 5.5;
  const bubakPoleBendX =
    Math.sin(bPhase) * 0.6 + rageTremble * 0.35 - landingImpact * 0.8;

  // Torso sway, breathing & squash/stretch
  const peckCompress = crowTauntPeck * 1.35 + landingImpact * 3.2;
  const bubakTorsoX = Math.sin(bPhase) * 1.35 * (1 - onHeadMask * 0.5) + rageTremble * 0.55;
  const bubakTorsoY =
    Math.sin(bPhase * 2) * 0.85 + peckCompress * 0.55 + inhaleLevel * 1.2 - screamLevel * 2.8;
  const bubakTorsoRot =
    Math.sin(bPhase) * 2.0 * (1 - onHeadMask * 0.4) +
    Math.sin(t * 6.5) * annoyanceLevel * 1.8 +
    rageTremble * 1.2;
  const bubakTorsoScaleX =
    1 +
    Math.sin(bPhase * 2) * 0.018 +
    inhaleLevel * 0.11 +
    screamLevel * 0.065 +
    peckCompress * 0.012;
  const bubakTorsoScaleY =
    1 -
    Math.sin(bPhase * 2) * 0.014 +
    inhaleLevel * 0.04 +
    screamLevel * 0.045 -
    peckCompress * 0.02;

  // Frond skirt follow-through
  const bubakSkirtRot =
    Math.sin(bPhase - 0.55) * 3.1 +
    rageTremble * 1.5 +
    Math.sin(t * 22) * screamLevel * 3.6;

  // Swatting arms during pestering (1.2s .. 3.3s)
  const pesterMask =
    smoothstep(1.2, 1.5, cycleT) * (1 - smoothstep(3.1, 3.45, cycleT));
  // Left arm swats up when crow is on the left, right arm swats up when crow is on the right
  const leftSwatWave = pesterMask * Math.max(0, Math.sin((cycleT - 1.35) * 5.2));
  const rightSwatWave = pesterMask * Math.max(0, -Math.sin((cycleT - 1.35) * 5.2));

  // Post-scream warning fist shake (7.75s .. 8.7s)
  const recoveryShakeMask =
    smoothstep(7.65, 7.9, cycleT) * (1 - smoothstep(8.5, 8.95, cycleT));

  const bubakLeftArmAngle =
    Math.sin(bPhase - 0.2) * 10 * (1 - onHeadMask * 0.6) -
    leftSwatWave * 36 +
    onHeadMask * 14 +
    inhaleLevel * 20 -
    screamLevel * 44 -
    recoveryShakeMask * 26 +
    Math.sin(t * 24) * (screamLevel * 8 + annoyanceLevel * 3.5);

  const bubakRightArmAngle =
    Math.sin(bPhase + 0.3) * 10 * (1 - onHeadMask * 0.6) +
    rightSwatWave * 36 -
    onHeadMask * 14 -
    inhaleLevel * 20 +
    screamLevel * 44 +
    recoveryShakeMask * 18 -
    Math.sin(t * 24) * (screamLevel * 8 + annoyanceLevel * 3.5);

  const bubakLeftCuffFlutter =
    Math.sin(t * 4.4) * 4 +
    leftSwatWave * 14 +
    Math.sin(t * 28) * (screamLevel * 11 + annoyanceLevel * 4);
  const bubakRightCuffFlutter =
    Math.cos(t * 4.6) * 4 -
    rightSwatWave * 14 -
    Math.sin(t * 28) * (screamLevel * 11 + annoyanceLevel * 4);

  // Head position, tilt & squash-stretch
  const pesterHeadTrackX =
    pesterMask * Math.cos((cycleT - 1.2) * 4.5) * 2.8;
  const bubakHeadX =
    Math.sin(bPhase + 0.2) * 1.6 * (1 - onHeadMask * 0.6) +
    pesterHeadTrackX +
    crowTauntShiftX * 0.35 +
    rageTremble * 0.75;
  const bubakHeadY =
    Math.cos(bPhase * 2) * 1.0 +
    peckCompress * 1.45 +
    inhaleLevel * 2.2 -
    screamLevel * 4.8;
  const bubakHeadRot =
    Math.sin(bPhase - 0.15) * 4.5 * (1 - onHeadMask * 0.65) +
    pesterHeadTrackX * 1.9 +
    crowTauntShiftX * 0.8 +
    rageTremble * 1.8;

  const bubakHeadScaleX =
    1 +
    landingImpact * 0.09 +
    crowTauntPeck * 0.045 +
    inhaleLevel * 0.07 +
    screamLevel * 0.09;
  const bubakHeadScaleY =
    1 -
    landingImpact * 0.10 -
    crowTauntPeck * 0.055 -
    inhaleLevel * 0.05 +
    screamLevel * 0.12;

  // Compute exact world/local position of the top crown of Bubák's head where the crow perches
  const headCenterLocalX = 84 + bubakTorsoX + bubakHeadX;
  const headCenterLocalY = 42 + bubakTorsoY + bubakHeadY;
  const headRotRad = ((bubakTorsoRot + bubakHeadRot) * Math.PI) / 180;
  const crownRadiusY = 25.0 * bubakHeadScaleY;
  const bubakHeadCrownX = headCenterLocalX + Math.sin(headRotRad) * crownRadiusY;
  const bubakHeadCrownY = headCenterLocalY - Math.cos(headRotRad) * crownRadiusY;

  // ============================================================================
  // BLACK-AND-WHITE CROW FLIGHT & TAUNTING TRAJECTORY (100% C1 CONTINUOUS & UNCROPPED)
  // ============================================================================
  let crowX = 10;
  let crowY = -8;
  let crowFacing: 1 | -1 = 1;
  let crowFlightBlend = 1;
  let crowWingFold = 0;
  let crowBodyPitch = 0;
  let crowHeadPitch = 0;
  let crowBeakOpen = 0.15;
  let crowTailWag = Math.sin(t * 6) * 0.08;
  let crowEyeScale = 1.0;
  let crowLegReach = 0;
  let crowStartledLevel = 0;

  if (cycleT < 1.2) {
    // Phase 1: Swooping in from upper-left (10, -8) to right of Bubák's head (140, 34)
    const u = smootherstep(0.0, 1.2, cycleT);
    crowX = lerp(10, 140, u);
    crowY = lerp(-8, 34, u) + Math.sin(u * Math.PI) * 14;
    crowFacing = cycleT < 1.02 ? 1 : -1;
    crowFlightBlend = 1;
    crowBodyPitch = (1 - u) * 0.18;
    crowBeakOpen = 0.12 + Math.max(0, Math.sin(t * 7)) * 0.25;
  } else if (cycleT < 3.3) {
    // Phase 2: Pestering figure-eight around Bubák's head & shoulders
    crowFlightBlend = 1;
    if (cycleT < 1.9) {
      // Pass A: Darts right-to-left across Bubák's nose (140, 34) -> (26, 38)
      const u = smootherstep(1.2, 1.9, cycleT);
      crowX = lerp(140, 26, u);
      crowY = lerp(34, 38, u) + Math.sin(u * Math.PI) * 12;
      crowFacing = -1;
      crowBodyPitch = -0.12 * Math.sin(u * Math.PI);
    } else if (cycleT < 2.65) {
      // Pass B: Banks left-to-right across Bubák's brow (26, 38) -> (134, 24)
      const u = smootherstep(1.9, 2.65, cycleT);
      crowX = lerp(26, 134, u);
      crowY = lerp(38, 24, u) - Math.sin(u * Math.PI) * 10;
      crowFacing = 1;
      crowBodyPitch = 0.14 * Math.sin(u * Math.PI);
    } else {
      // Pass C: Swoops right-to-upper-left (134, 24) -> (46, 18)
      const u = smootherstep(2.65, 3.3, cycleT);
      crowX = lerp(134, 46, u);
      crowY = lerp(24, 18, u) - Math.sin(u * Math.PI) * 8;
      crowFacing = -1;
      crowBodyPitch = -0.08;
    }
    // Cheeky pestering caws while buzzing Bubák
    crowBeakOpen = 0.25 + Math.max(0, Math.sin(cycleT * 14)) * 0.65;
    crowTailWag = Math.sin(t * 14) * 0.16;
  } else if (cycleT < 3.85) {
    // Phase 3: Swoops up from (46, 18) and lands squarely on Bubák's head crown
    const u = smootherstep(3.3, 3.85, cycleT);
    const targetX = bubakHeadCrownX;
    const targetY = bubakHeadCrownY;
    crowX = lerp(46, targetX, u);
    crowY = lerp(18, targetY, u) - Math.sin(u * Math.PI) * 14;
    crowFacing = 1;
    crowFlightBlend = 1 - smoothstep(3.62, 3.84, cycleT);
    crowWingFold = 1 - crowFlightBlend;
    crowLegReach = smoothstep(3.40, 3.72, cycleT);
    crowBodyPitch = -Math.sin(u * Math.PI) * 0.28;
    crowBeakOpen = 0.2 + (1 - crowFlightBlend) * 0.35;
  } else if (cycleT < 5.85) {
    // Phase 4: Tauntingly perched on Bubák's head — hopping, pecking straw, and laughing!
    const localT = cycleT - 3.85;
    crowX = bubakHeadCrownX + crowTauntShiftX;
    crowY = bubakHeadCrownY - crowTauntHopY;
    // Turns cheekily left and right while dancing on his head
    crowFacing = Math.sin(localT * 2.8) >= -0.15 ? 1 : -1;
    // Brief little wing-flaps on high hops
    const hopFlap = clamp01(crowTauntHopY / 5.0) * 0.45;
    crowFlightBlend = hopFlap;
    crowWingFold = 1 - hopFlap;
    crowLegReach = 1;
    // Pitches forward to peck Bubák's head when down, tilts back to laugh when up!
    const isLaughing = Math.sin(localT * 9.2) > 0.15;
    crowBodyPitch = crowTauntPeck * 0.48 - (isLaughing ? 0.22 : 0);
    crowHeadPitch = crowTauntPeck * 0.35 - (isLaughing ? 0.28 : 0);
    crowBeakOpen = isLaughing
      ? 0.65 + Math.abs(Math.sin(localT * 18)) * 0.35
      : 0.12 + crowTauntPeck * 0.25;
    crowTailWag = Math.sin(localT * 15) * 0.24;
  } else if (cycleT < 7.75) {
    // Phase 5: Bubák's Furious Inhale (5.85..6.20) & Angry Scream Blast-Off (6.20..7.75)
    if (cycleT < 6.20) {
      // Perched on swelling, trembling head, looking down at Bubák in surprise
      crowX = bubakHeadCrownX;
      crowY = bubakHeadCrownY;
      crowFacing = 1;
      crowFlightBlend = 0.15;
      crowWingFold = 0.85;
      crowLegReach = 1;
      crowBodyPitch = 0.18;
      crowHeadPitch = 0.32;
      crowBeakOpen = 0.18;
      crowEyeScale = 1.0 + inhaleLevel * 0.25;
    } else {
      // Blasted off Bubák's head in comical startled panic (stays strictly inside upper canvas bounds!)
      const blastElapsed = cycleT - 6.20;
      crowStartledLevel = clamp01(1 - smoothstep(0.55, 1.35, blastElapsed));
      crowFlightBlend = 1;
      crowWingFold = 0;
      crowEyeScale = 1.0 + crowStartledLevel * 0.48;
      crowBeakOpen = 0.35 + crowStartledLevel * 0.65;
      crowLegReach = crowStartledLevel * 0.7;

      if (cycleT < 6.90) {
        // Catapulted upward & right to (134, -10) with safe headroom for flapping wings
        const u = smootherstep(6.20, 6.90, cycleT);
        crowX = lerp(bubakHeadCrownX, 134, u);
        crowY = lerp(bubakHeadCrownY, -10, u) - Math.sin(u * Math.PI) * 8;
        crowFacing = 1;
        crowBodyPitch = -0.35 * (1 - u);
      } else {
        // Scrambling across high sky to (48, -12)
        const u = smootherstep(6.90, 7.75, cycleT);
        crowX = lerp(134, 48, u);
        crowY = lerp(-10, -12, u) - Math.sin(u * Math.PI) * 4;
        crowFacing = -1;
        crowBodyPitch = 0.08;
      }
    }
  } else {
    // Phase 6: High sky recovery glide from (48, -12) back to loop start (10, -8)
    const u = smootherstep(7.75, BUBAK_CROW_CYCLE_DURATION, cycleT);
    crowX = lerp(48, 10, u);
    crowY = lerp(-12, -8, u) + Math.sin(u * Math.PI) * 4;
    crowFacing = u < 0.72 ? -1 : 1;
    crowFlightBlend = 1;
    crowWingFold = 0;
    crowBodyPitch = 0.06;
    crowBeakOpen = 0.12;
  }

  // Wing flap phase (faster when startled or pestering)
  const flapFreq = 13 + crowStartledLevel * 12 + pesterMask * 4;
  const crowWingFlapAngle = Math.sin(t * flapFreq) * (0.58 * crowFlightBlend + 0.06);

  // ============================================================================
  // BUBÁK EYES, BROWS, RAGE FLUSH & DEFORMABLE SCREAMING MAW
  // ============================================================================
  // Vector from Bubák's eyes (headCenterLocalX, headCenterLocalY - 8) to the crow
  const eyeWorldX = headCenterLocalX;
  const eyeWorldY = headCenterLocalY - 8;
  const toCrowDx = crowX - eyeWorldX;
  const toCrowDy = crowY - eyeWorldY;
  const toCrowDist = Math.max(1, Math.hypot(toCrowDx, toCrowDy));
  const trackDx = (toCrowDx / toCrowDist) * 2.9;
  const trackDy = (toCrowDy / toCrowDist) * 2.9;

  // Blend between calm meadow scan and intense tracking of the pestering/perched crow
  const gazeTrackWeight = clamp01(
    smoothstep(0.7, 1.3, cycleT) * (1 - smoothstep(7.8, 9.1, cycleT))
  );
  const idlePupilDx = Math.sin(t * 1.2) * 2.1;
  const idlePupilDy = Math.cos(t * 0.95) * 0.9;

  // When the crow is on Bubák's head, force his pupils to roll strongly UPWARD at the bird!
  const rolledUpDy = -3.2;
  const rolledUpDx = clamp01(onHeadMask) * (crowTauntShiftX * 0.45);
  const targetPupilDx = lerp(trackDx, rolledUpDx, onHeadMask * 0.85);
  const targetPupilDy = lerp(trackDy, rolledUpDy, onHeadMask * 0.9);

  const bubakPupilDx =
    lerp(idlePupilDx, targetPupilDx, gazeTrackWeight) +
    Math.sin(t * 38) * (annoyanceLevel * 0.25 + screamLevel * 0.35);
  const bubakPupilDy =
    lerp(idlePupilDy, targetPupilDy, gazeTrackWeight) +
    Math.cos(t * 38) * (annoyanceLevel * 0.2 + screamLevel * 0.25);

  // Lower-lid annoyance squint vs wide-open screaming eyes
  const bubakEyeSquint = clamp01(annoyanceLevel * 0.52 - screamLevel * 0.65);

  // Angry V-shaped brow slant (in degrees) & vertical press
  const bubakBrowSlant =
    annoyanceLevel * 22 + inhaleLevel * 25 + screamLevel * 28 + hoverMix * 4;
  const bubakBrowDy =
    Math.cos(bPhase) * 0.8 * (1 - annoyanceLevel) +
    annoyanceLevel * 2.8 +
    inhaleLevel * 3.2 -
    screamLevel * 1.8;

  // Warm crimson rage flush on Bubák's burlap cheeks/brow
  const bubakRageFlush = clamp01(annoyanceLevel * 0.68 + inhaleLevel * 0.75 + screamLevel * 0.95);

  // Deformable Toothy Maw (0.16 = grumbling clenched teeth, 0.7 = normal open, 1.68 = giant ANGRY SCREAM!)
  const idleMouthWave = 0.58 + Math.sin(bPhase) * 0.22 + Math.cos(bPhase * 2) * 0.1;
  const grumbleMutters =
    annoyanceLevel * (0.28 + Math.abs(Math.sin(t * 16)) * 0.22);
  const screamRoarWave =
    screamLevel * (1.58 + Math.sin(t * 28) * 0.12);
  const recoveryChomp =
    smoothstep(7.55, 7.8, cycleT) *
    (1 - smoothstep(8.2, 8.8, cycleT)) *
    Math.abs(Math.sin(t * 14)) *
    0.45;

  let bubakMouthOpen = lerp(idleMouthWave, grumbleMutters, clamp01(annoyanceLevel * 1.2));
  bubakMouthOpen = lerp(bubakMouthOpen, 0.18, inhaleLevel * 0.85);
  bubakMouthOpen = Math.max(bubakMouthOpen, screamRoarWave) + recoveryChomp;
  bubakMouthOpen = Math.max(0.16, Math.min(1.72, bubakMouthOpen));

  const bubakMouthWidth =
    0.95 +
    screamLevel * 0.32 -
    inhaleLevel * 0.12 +
    annoyanceLevel * 0.06;

  // Crooked annoyed snarl slant when the crow is pestering or on his head
  const bubakMouthSlant =
    (annoyanceLevel * Math.sin(t * 5.5) * 4.5 + onHeadMask * -5.5) * (1 - screamLevel * 0.8);

  return {
    phase,
    cycleT,
    annoyanceLevel,
    screamLevel,
    inhaleLevel,
    landingImpact,
    isCrowOnHead,
    crowStartledLevel,
    bubakRootScale,
    bubakRootLiftY,
    bubakPoleBendX,
    bubakTorsoX,
    bubakTorsoY,
    bubakTorsoRot,
    bubakTorsoScaleX,
    bubakTorsoScaleY,
    bubakSkirtRot,
    bubakLeftArmAngle,
    bubakRightArmAngle,
    bubakLeftCuffFlutter,
    bubakRightCuffFlutter,
    bubakHeadX,
    bubakHeadY,
    bubakHeadRot,
    bubakHeadScaleX,
    bubakHeadScaleY,
    bubakHeadCrownX,
    bubakHeadCrownY,
    bubakPupilDx,
    bubakPupilDy,
    bubakEyeSquint,
    bubakBrowSlant,
    bubakBrowDy,
    bubakRageFlush,
    bubakMouthOpen,
    bubakMouthWidth,
    bubakMouthSlant,
    crowX,
    crowY,
    crowFacing,
    crowFlightBlend,
    crowWingFlapAngle,
    crowWingFold,
    crowBodyPitch,
    crowHeadPitch,
    crowBeakOpen,
    crowTailWag,
    crowEyeScale,
    crowLegReach,
    crowTauntHopY,
  };
}

function drawFivePetalFolkFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotRad: number,
  petalRadius: number,
  petalColor: string,
  coreColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotRad);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -petalRadius * 0.42,
      -petalRadius * 0.45,
      -petalRadius * 0.46,
      -petalRadius * 0.92,
      0,
      -petalRadius
    );
    ctx.bezierCurveTo(
      petalRadius * 0.46,
      -petalRadius * 0.92,
      petalRadius * 0.42,
      -petalRadius * 0.45,
      0,
      0
    );
    ctx.closePath();
    ctx.fillStyle = petalColor;
    ctx.fill();
    ctx.strokeStyle = '#1C1610';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, petalRadius * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = coreColor;
  ctx.fill();
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = 0.95;
  ctx.stroke();
  ctx.restore();
}

function drawBurlapCrosshatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 1.2, ry - 1.2, 0, 0, Math.PI * 2);
  ctx.clip();

  // Batch all horizontal & vertical woven burlap lines into a single stroke call
  ctx.beginPath();
  for (let y = cy - ry; y <= cy + ry; y += 5.5) {
    ctx.moveTo(cx - rx, y);
    ctx.lineTo(cx + rx, y);
  }
  for (let x = cx - rx; x <= cx + rx; x += 5.5) {
    ctx.moveTo(x, cy - ry);
    ctx.lineTo(x, cy + ry);
  }
  ctx.strokeStyle = 'rgba(110, 68, 29, 0.32)';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // Batch all stippled lithograph burlap grain dots into a single fill call
  ctx.beginPath();
  for (let y = cy - ry + 2.5; y < cy + ry; y += 6) {
    for (let x = cx - rx + 2.5; x < cx + rx; x += 6) {
      ctx.rect(x - 0.7, y - 0.7, 1.4, 1.4);
    }
  }
  ctx.fillStyle = 'rgba(82, 47, 17, 0.38)';
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the Black-and-White Hooded Crow (Vrána šedivka Josefa Lady)
 * in 2D Canvas, blending seamlessly between agile flapping flight and
 * tauntingly hopping/pecking on top of Bubák's burlap head.
 */
function drawBlackAndWhiteCrow2D(
  ctx: CanvasRenderingContext2D,
  t: number,
  state: BubakCrowChoreographyState
) {
  const {
    crowX,
    crowY,
    crowFacing,
    crowFlightBlend,
    crowWingFlapAngle,
    crowBodyPitch,
    crowHeadPitch,
    crowBeakOpen,
    crowTailWag,
    crowEyeScale,
    crowLegReach,
    crowStartledLevel,
    isCrowOnHead,
  } = state;

  const ink = '#1C1610';
  const blackPlumage = '#1E2430';
  const blackDeep = '#12161F';
  const slateSheen = '#475569';
  const whitePlumage = '#FAF6ED';
  const whiteShadow = '#E2E8F0';
  const beakGold = '#F59E0B';
  const beakOrange = '#D97706';
  const tongueRed = '#E11D48';

  ctx.save();
  ctx.translate(crowX, crowY);
  ctx.scale(crowFacing * 0.92, 0.92);
  ctx.rotate(crowBodyPitch);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. FAR WING (visible when flying, braking, or hopping with wing-flap)
  if (crowFlightBlend > 0.05) {
    ctx.save();
    ctx.translate(3, -10);
    ctx.rotate(-crowWingFlapAngle * 0.9 - 0.15);
    ctx.scale(1, 0.45 + crowFlightBlend * 0.55);

    // Glossy black primary wing fan
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(6, -12, 16, -22);
    ctx.lineTo(22, -25);
    ctx.lineTo(18, -16);
    ctx.lineTo(25, -18);
    ctx.lineTo(19, -10);
    ctx.lineTo(24, -10);
    ctx.quadraticCurveTo(15, -3, 6, 2);
    ctx.closePath();
    ctx.fillStyle = blackDeep;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Crisp white covert wing patch on far wing
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.quadraticCurveTo(6, -8, 12, -12);
    ctx.quadraticCurveTo(11, -5, 5, 0);
    ctx.closePath();
    ctx.fillStyle = whiteShadow;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 2. FANNED BLACK-AND-WHITE TAIL FEATHERS
  ctx.save();
  ctx.translate(-9, -6);
  ctx.rotate(crowTailWag);
  // Outer white-edged tail feather backplate
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(-17, -6);
  ctx.quadraticCurveTo(-20, -2, -16, 1);
  ctx.lineTo(-19, 4);
  ctx.quadraticCurveTo(-19, 8, -13, 7);
  ctx.lineTo(-15, 10);
  ctx.quadraticCurveTo(-13, 13, -8, 10);
  ctx.lineTo(2, 4);
  ctx.closePath();
  ctx.fillStyle = blackDeep;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.stroke();

  // Contrasting white outer tail vane stripe
  ctx.beginPath();
  ctx.moveTo(-2, -1);
  ctx.lineTo(-15, -4.5);
  ctx.lineTo(-14, -1.5);
  ctx.lineTo(-2, 1);
  ctx.closePath();
  ctx.fillStyle = whitePlumage;
  ctx.fill();
  ctx.restore();

  // 3. YELLOW SCALY LEGS & GRASPING TALONS (planted on Bubák's head at y=0 when perched!)
  const legSpread = isCrowOnHead ? 1.0 : 0.45 + crowLegReach * 0.55;
  const footY = isCrowOnHead ? 0 : -1 + crowLegReach * 3;
  const drawLeg = (hipX: number, footX: number) => {
    ctx.beginPath();
    ctx.moveTo(hipX, -5);
    ctx.lineTo(footX, footY);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.8;
    ctx.stroke();
    ctx.strokeStyle = beakGold;
    ctx.lineWidth = 1.9;
    ctx.stroke();

    // 3 grasping talons
    ctx.beginPath();
    ctx.moveTo(footX - 3.8 * legSpread, footY + 0.8);
    ctx.lineTo(footX, footY);
    ctx.lineTo(footX + 4.5 * legSpread, footY + 0.6);
    ctx.moveTo(footX, footY);
    ctx.lineTo(footX + 2.2 * legSpread, footY + 2.2);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  };
  drawLeg(-3.5, -2.5);
  drawLeg(2.5, 4.0);

  // 4. PLUMP BODY WITH SNOW-WHITE VEST / SADDLE & BLACK HOODED BIB (Vrána šedivka)
  // Main snow-white breast, belly, and back saddle
  ctx.beginPath();
  ctx.ellipse(0, -9, 11.5, 7.8, -0.08, 0, Math.PI * 2);
  ctx.fillStyle = whitePlumage;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.stroke();

  // Subtle grey-cream underbelly shading & Lada ink feather ticks on white vest
  ctx.beginPath();
  ctx.arc(-1, -6.5, 6.5, 0.15, Math.PI - 0.2);
  ctx.strokeStyle = whiteShadow;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, -8);
  ctx.quadraticCurveTo(5, -7, 6.5, -8.5);
  ctx.moveTo(1, -5.5);
  ctx.quadraticCurveTo(3, -4.5, 4.8, -6);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glossy black throat bib & lower tail-base pants
  ctx.beginPath();
  ctx.moveTo(5, -15);
  ctx.quadraticCurveTo(11.5, -13, 10.5, -8.5);
  ctx.quadraticCurveTo(7.5, -7.5, 4.5, -10.5);
  ctx.closePath();
  ctx.fillStyle = blackPlumage;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  // 5. NEAR WING (blends between folded black-and-white wing when perched and sweeping 5-primary flight wing)
  if (crowFlightBlend > 0.18) {
    ctx.save();
    ctx.translate(-2, -11);
    ctx.rotate(crowWingFlapAngle);
    ctx.scale(1, 0.35 + crowFlightBlend * 0.65);

    // Splayed black primary flight feathers
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(-8, -10, -18, -24);
    ctx.lineTo(-26, -29);
    ctx.lineTo(-20, -19);
    ctx.lineTo(-29, -21);
    ctx.lineTo(-21, -13);
    ctx.lineTo(-28, -12);
    ctx.lineTo(-19, -7);
    ctx.lineTo(-23, -4);
    ctx.quadraticCurveTo(-13, 2, -2, 3);
    ctx.closePath();
    ctx.fillStyle = blackPlumage;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Bold white upper wing-covert bar (signature black-and-white crow contrast)
    ctx.beginPath();
    ctx.moveTo(1, -1);
    ctx.quadraticCurveTo(-6, -8, -14, -14);
    ctx.quadraticCurveTo(-15, -7, -9, -2);
    ctx.quadraticCurveTo(-4, 1, 1, -1);
    ctx.closePath();
    ctx.fillStyle = whitePlumage;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.7;
    ctx.stroke();
    ctx.restore();
  } else {
    // Neatly folded black-and-white wing resting along the crow's side while perched on Bubák's head
    ctx.save();
    ctx.translate(-1, -10);
    ctx.rotate(Math.sin(t * 14) * 0.05);

    // Black primary tips pointing back toward the tail
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.quadraticCurveTo(-7, -3, -15, 1);
    ctx.lineTo(-11, 2.5);
    ctx.lineTo(-14, 4.8);
    ctx.quadraticCurveTo(-5, 5.5, 3, 2);
    ctx.closePath();
    ctx.fillStyle = blackPlumage;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Crisp white shoulder covert bar on the folded wing
    ctx.beginPath();
    ctx.moveTo(2.5, -2.2);
    ctx.quadraticCurveTo(-3, -2.8, -7.5, -0.2);
    ctx.quadraticCurveTo(-3, 2.2, 2.5, 0.8);
    ctx.closePath();
    ctx.fillStyle = whitePlumage;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 6. GLOSSY BLACK HOODED HEAD, RUFFLED CROWN CREST, GOLDEN BEAK & MISCHIEVOUS EYE
  ctx.save();
  ctx.translate(7.5, -14.5);
  ctx.rotate(crowHeadPitch);

  // Head & spiky 3-tuft crown crest (stands straight up when startled!)
  const crestSpike = 1 + crowStartledLevel * 0.55;
  ctx.beginPath();
  ctx.arc(0, 0, 5.8, 0, Math.PI * 2);
  ctx.fillStyle = blackPlumage;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Slate-blue glossy highlight on black crown
  ctx.beginPath();
  ctx.arc(-0.5, -2.2, 3.2, Math.PI * 1.1, Math.PI * 1.85);
  ctx.strokeStyle = slateSheen;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // 3 spiky crown feathers
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(-6.5, -8.5 * crestSpike);
  ctx.lineTo(-2, -5.2);
  ctx.lineTo(-2.8, -9.5 * crestSpike);
  ctx.lineTo(0.8, -5.4);
  ctx.lineTo(1.2, -8.8 * crestSpike);
  ctx.lineTo(3.2, -4.5);
  ctx.closePath();
  ctx.fillStyle = blackPlumage;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Articulated Golden-Ochre Beak & Red Tongue
  const jawAngle = crowBeakOpen * 0.52;
  // Red tongue inside open beak when cawing/taunting
  if (crowBeakOpen > 0.28) {
    ctx.beginPath();
    ctx.moveTo(4, 0.5);
    ctx.quadraticCurveTo(7.5, 1.2 + crowBeakOpen * 2, 9.2, 0.8 + crowBeakOpen * 1.5);
    ctx.strokeStyle = tongueRed;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  // Lower mandible
  ctx.save();
  ctx.translate(4.2, 0.8);
  ctx.rotate(jawAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(7.8, 1.2);
  ctx.quadraticCurveTo(4.5, 2.8, 0, 2.0);
  ctx.closePath();
  ctx.fillStyle = beakOrange;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  // Upper hooked golden mandible
  ctx.save();
  ctx.translate(4.2, -1.2);
  ctx.rotate(-jawAngle * 0.35);
  ctx.beginPath();
  ctx.moveTo(0, -1.6);
  ctx.quadraticCurveTo(6.5, -2.2, 10.2, 1.2);
  ctx.quadraticCurveTo(5.5, 1.4, 0, 1.2);
  ctx.closePath();
  ctx.fillStyle = beakGold;
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.9;
  ctx.stroke();
  // Nostril dot
  ctx.beginPath();
  ctx.arc(4.2, -0.3, 0.7, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.restore();

  // Expressive white eye with cheeky or startled pupil
  ctx.save();
  ctx.translate(1.4, -1.2);
  ctx.scale(crowEyeScale, crowEyeScale);
  ctx.beginPath();
  ctx.ellipse(0, 0, 2.4, 2.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF8';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Pupil looks down at Bubák's head when perched!
  const pupilLookY = isCrowOnHead ? 0.7 : 0;
  ctx.beginPath();
  ctx.arc(0.5, pupilLookY, 1.15, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0.1, pupilLookY - 0.5, 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Cheeky angled brow ridge (or raised arch when startled)
  if (crowStartledLevel < 0.25) {
    ctx.beginPath();
    ctx.moveTo(-2.4, -2.2);
    ctx.lineTo(2.4, -1.0);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.7;
    ctx.stroke();
  }
  ctx.restore();

  // 7. TAUNTING CAW SOUND ARCS WHEN PERCHED OR PESTERING
  if (crowBeakOpen > 0.42 && crowStartledLevel < 0.2) {
    ctx.save();
    ctx.translate(16.5, -1.5);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    for (let ring = 0; ring < 2; ring++) {
      const r = 3.2 + ring * 3.0 + ((t * 12) % 2.0);
      ctx.beginPath();
      ctx.arc(0, 0, r, -0.65, 0.65);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore(); // end head
  ctx.restore(); // end crow root

  // 8. TAUNTING "KRÁ!" / "HEČ!" CALLOUT OR STARTLED FEATHERS IN WORLD SPACE
  if (isCrowOnHead && crowBeakOpen > 0.52) {
    ctx.save();
    const labelX = crowX + crowFacing * 24;
    const labelY = crowY - 22 - Math.abs(Math.sin(t * 12)) * 2.5;
    ctx.font = "900 10px 'Eczar', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    const text = Math.sin(t * 4.6) > 0 ? 'KRÁ!' : 'HEČ!';
    ctx.strokeText(text, labelX, labelY);
    ctx.fillStyle = '#FEF08A';
    ctx.fillText(text, labelX, labelY);
    ctx.restore();
  }

  // Loose black-and-white feathers fluttering down when startled by Bubák's scream
  if (crowStartledLevel > 0.05) {
    const blastT = Math.max(0, state.cycleT - 6.2);
    for (let i = 0; i < 3; i++) {
      const fx = state.bubakHeadCrownX + (i - 1) * 18 + Math.sin(t * 9 + i * 2) * 5;
      const fy = state.bubakHeadCrownY - 12 - blastT * 14 + i * 6 + blastT * blastT * 22;
      const fRot = t * 5 * (i % 2 === 0 ? 1 : -1) + i;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(fRot);
      ctx.globalAlpha = clamp01(crowStartledLevel * 1.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.2, 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = i === 1 ? whitePlumage : blackPlumage;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
  }
}

const FROND_SKIRT_DOTS = [
  [52, 138, '#7C924F'],
  [75, 145, '#A8813C'],
  [84, 152, '#7C924F'],
  [93, 145, '#A8813C'],
  [116, 138, '#7C924F'],
] as const;

const TORSO_SEAM_STITCH_YS = [76, 86, 96, 106, 116, 123] as const;

const HEAD_STRAW_TUFTS = [
  [-10, -22, -16, -29, 0.4],
  [-6, -24, -10, -32, 0.8],
  [-2, -25, -3, -34, 1.0],
  [0, -25, 1, -35, 1.0],
  [3, -25, 5, -33, 1.0],
  [6, -24, 11, -31, 0.8],
  [10, -22, 16, -28, 0.4],
] as const;

/**
 * Renders the complete fluent 60 FPS 2D Canvas animation of Bubák (Scarecrow)
 * and the pestering Black-and-White Crow next to the main "BUBÁKOV" headline.
 *
 * Stage coordinate mapping:
 * The canvas covers stageX = [-20 .. 205] (width 225) and stageY = [-48 .. 204] (height 252)
 * of the uncropped 900x252 banner coordinate space (viewBox="-20 -48 900 252").
 */
export function drawBubakAndCrowCoverCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  t: number,
  manualScreamStart = -100,
  hoverMix = 0
): BubakCrowChoreographyState {
  const state = computeBubakCrowChoreography(t, manualScreamStart, hoverMix);
  const ink = '#1C1610';

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.save();

  // Map 225x252 stage region onto canvasWidth x canvasHeight
  const scaleX = canvasWidth / 225;
  const scaleY = canvasHeight / 252;
  ctx.scale(scaleX, scaleY);
  // Shift origin so (0,0) is top-left of the 880x195 SVG stage, then + (12, 4) for Bubák local space
  ctx.translate(20 + 12, 48 + 4);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Apply root scale & lift around (84, 100)
  ctx.save();
  ctx.translate(84, 100 + state.bubakRootLiftY);
  ctx.scale(state.bubakRootScale, state.bubakRootScale);
  ctx.translate(-84, -100);

  // ==========================================================================
  // 1. WEATHERED WOODEN MOUNTING POLE & BLOOMING MEADOW TURF PEDESTAL
  // ==========================================================================
  // Soft ground shadow
  ctx.beginPath();
  ctx.ellipse(84, 192, 26, 6.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(28, 22, 16, 0.18)';
  ctx.fill();

  // Wooden pole
  ctx.save();
  ctx.translate(state.bubakPoleBendX, 0);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(79.5, 130, 9, 60, 1.5);
  } else {
    ctx.rect(79.5, 130, 9, 60);
  }
  ctx.fillStyle = '#783E24';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Wood grain lines & knot
  ctx.beginPath();
  ctx.moveTo(82.5, 134);
  ctx.lineTo(82.5, 189);
  ctx.strokeStyle = '#9A5632';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(85.5, 136);
  ctx.lineTo(85.5, 186);
  ctx.strokeStyle = '#522712';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(83.5, 164, 2.0, 3.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3D1A0B';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.0;
  ctx.stroke();
  ctx.restore();

  // Green meadow turf mound & grass blades
  ctx.beginPath();
  ctx.ellipse(84, 190, 23, 6.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(84, 189, 18, 3.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4ADE80';
  ctx.fill();

  drawFivePetalFolkFlower(ctx, 70, 187, t * 0.55, 5.2, '#FACC15', '#E6392B');
  drawFivePetalFolkFlower(ctx, 97, 188, -t * 0.62, 4.8, '#38BDF8', '#FACC15');

  // ==========================================================================
  // 2. ARTICULATED UPPER BODY (SKIRT, ARMS, TORSO & EXPRESSIVE HEAD)
  // ==========================================================================
  ctx.save();
  ctx.translate(84 + state.bubakTorsoX, 124 + state.bubakTorsoY);
  ctx.rotate((state.bubakTorsoRot * Math.PI) / 180);
  ctx.translate(-84, -124);

  // 2a. Lower Shredded Leaf-Frond Skirt (pivots at waist 84, 126)
  ctx.save();
  ctx.translate(84, 126);
  ctx.rotate((state.bubakSkirtRot * Math.PI) / 180);
  ctx.translate(-84, -126);

  ctx.beginPath();
  ctx.moveTo(54, 124);
  ctx.quadraticCurveTo(40, 140, 31, 154);
  ctx.quadraticCurveTo(44, 148, 56, 134);
  ctx.quadraticCurveTo(68, 158, 84, 165);
  ctx.quadraticCurveTo(100, 158, 112, 134);
  ctx.quadraticCurveTo(124, 148, 137, 154);
  ctx.quadraticCurveTo(128, 140, 114, 124);
  ctx.closePath();
  ctx.fillStyle = '#1E2519';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.1;
  ctx.stroke();

  // Inner moss-green & russet frond highlights
  ctx.beginPath();
  ctx.moveTo(60, 126);
  ctx.quadraticCurveTo(50, 138, 42, 147);
  ctx.moveTo(84, 128);
  ctx.lineTo(84, 159);
  ctx.moveTo(72, 128);
  ctx.lineTo(62, 149);
  ctx.moveTo(96, 128);
  ctx.lineTo(106, 149);
  ctx.moveTo(108, 126);
  ctx.quadraticCurveTo(118, 138, 126, 147);
  ctx.strokeStyle = '#5F733E';
  ctx.lineWidth = 2.1;
  ctx.stroke();

  // Folk stipple dots on frond skirt
  for (const [fx, fy, col] of FROND_SKIRT_DOTS) {
    ctx.beginPath();
    ctx.arc(fx, fy, 1.3, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }
  ctx.restore();

  // Helper to draw Left (-1) and Right (+1) Flared Burlap Arms & Shredded Straw Cuffs
  const drawScarecrowArm = (side: -1 | 1, armAngleDeg: number, cuffFlutterDeg: number) => {
    const shoulderX = side === -1 ? 68 : 100;
    const shoulderY = 74;
    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate((armAngleDeg * Math.PI) / 180);
    if (side === 1) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-68, -74);

    // Shredded frayed cuff fingers & golden straw bristles at wrist (24, 38)
    ctx.save();
    ctx.translate(24, 38);
    ctx.rotate((cuffFlutterDeg * Math.PI) / 180);
    ctx.translate(-24, -38);

    // Golden straw bristles poking out of sleeve cuff
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(20, 34);
    ctx.lineTo(8, 22);
    ctx.moveTo(16, 39);
    ctx.lineTo(1, 35);
    ctx.moveTo(18, 44);
    ctx.lineTo(5, 49);
    ctx.stroke();

    // 5 Shredded burlap cuff fingers
    ctx.beginPath();
    ctx.moveTo(28, 32);
    ctx.lineTo(18, 21);
    ctx.lineTo(14, 33);
    ctx.lineTo(5, 27);
    ctx.lineTo(10, 41);
    ctx.lineTo(2, 44);
    ctx.lineTo(14, 52);
    ctx.lineTo(23, 46);
    ctx.closePath();
    ctx.fillStyle = '#946332';
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.7;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(14, 36);
    ctx.lineTo(22, 40);
    ctx.strokeStyle = '#FAF5E8';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Main flared burlap sleeve polygon (flat gouache + highlight layer, zero gradient allocation)
    ctx.beginPath();
    ctx.moveTo(68, 76);
    ctx.lineTo(34, 58);
    ctx.lineTo(14, 38);
    ctx.lineTo(28, 32);
    ctx.lineTo(54, 48);
    ctx.lineTo(74, 68);
    ctx.closePath();
    ctx.fillStyle = '#C2945D';
    ctx.fill();

    // Upper sleeve warm ochre highlight band
    ctx.beginPath();
    ctx.moveTo(28, 33);
    ctx.lineTo(54, 49);
    ctx.lineTo(70, 66);
    ctx.lineTo(62, 68);
    ctx.lineTo(24, 40);
    ctx.closePath();
    ctx.fillStyle = '#D4A56A';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(68, 76);
    ctx.lineTo(34, 58);
    ctx.lineTo(14, 38);
    ctx.lineTo(28, 32);
    ctx.lineTo(54, 48);
    ctx.lineTo(74, 68);
    ctx.closePath();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.1;
    ctx.stroke();

    // Sleeve fold creases
    ctx.beginPath();
    ctx.moveTo(46, 58);
    ctx.bezierCurveTo(38, 54, 30, 48, 24, 42);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(56, 66);
    ctx.bezierCurveTo(48, 60, 40, 54, 34, 48);
    ctx.strokeStyle = '#8A5C2C';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  };

  drawScarecrowArm(-1, state.bubakLeftArmAngle, state.bubakLeftCuffFlutter);
  drawScarecrowArm(1, state.bubakRightArmAngle, state.bubakRightCuffFlutter);

  // 2b. Plump Burlap Sack Torso (pivots/scales at 84, 98)
  ctx.save();
  ctx.translate(84, 98);
  ctx.scale(state.bubakTorsoScaleX, state.bubakTorsoScaleY);
  ctx.translate(-84, -98);

  ctx.beginPath();
  ctx.ellipse(84, 98, 24.5, 29.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#C2945D';
  ctx.fill();

  // Warm sunlit burlap belly highlight (zero per-frame gradient allocation)
  ctx.beginPath();
  ctx.ellipse(79, 91, 15.5, 19.0, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#D5A76E';
  ctx.fill();

  drawBurlapCrosshatch(ctx, 84, 98, 24.5, 29.5);

  ctx.beginPath();
  ctx.ellipse(84, 98, 24.5, 29.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.4;
  ctx.stroke();

  // Vertical Forest-Green Center Seam with black ink core & cross-stitches
  ctx.beginPath();
  ctx.moveTo(84, 69);
  ctx.lineTo(84, 126);
  ctx.strokeStyle = '#486935';
  ctx.lineWidth = 5.4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(84, 69);
  ctx.lineTo(84, 126);
  for (const sy of TORSO_SEAM_STITCH_YS) {
    ctx.moveTo(81, sy);
    ctx.lineTo(87, sy);
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  // Organic belly fold wrinkles
  ctx.beginPath();
  ctx.moveTo(65, 88);
  ctx.bezierCurveTo(72, 92, 78, 92, 82, 90);
  ctx.moveTo(86, 90);
  ctx.bezierCurveTo(92, 92, 98, 92, 103, 88);
  ctx.moveTo(66, 108);
  ctx.bezierCurveTo(73, 112, 78, 112, 82, 110);
  ctx.moveTo(86, 110);
  ctx.bezierCurveTo(92, 112, 97, 112, 102, 108);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.stroke();

  // Stitched Fabric Patches on Torso
  const drawPatch = (px: number, py: number, rx: number, ry: number, fill: string) => {
    ctx.save();
    ctx.translate(px, py);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = '#886036';
    ctx.fill();
    ctx.strokeStyle = '#FAF5E8';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.55, -ry * 0.72);
    ctx.lineTo(-rx * 0.55, -ry * 1.05);
    ctx.moveTo(rx * 0.55, -ry * 0.72);
    ctx.lineTo(rx * 0.55, -ry * 1.05);
    ctx.moveTo(-rx * 0.55, ry * 0.72);
    ctx.lineTo(-rx * 0.55, ry * 1.05);
    ctx.moveTo(rx * 0.55, ry * 0.72);
    ctx.lineTo(rx * 0.55, ry * 1.05);
    ctx.stroke();
    ctx.restore();
  };
  drawPatch(98, 86, 5, 7, '#382C1E');
  drawPatch(71, 110, 4.5, 6, '#2E2419');
  ctx.restore(); // end torso

  // ==========================================================================
  // 3. EXPRESSIVE BURLAP SACK HEAD (PIVOTS AT NECK 84, 68)
  // ==========================================================================
  ctx.save();
  ctx.translate(84 + state.bubakHeadX, 68 + state.bubakHeadY);
  ctx.rotate((state.bubakHeadRot * Math.PI) / 180);
  ctx.scale(state.bubakHeadScaleX, state.bubakHeadScaleY);
  ctx.translate(0, -26); // Center of head is now (0, 0)

  // 3a. Golden Straw Tufts sprouting from top of head (bend under crow's feet!)
  const strawSquash = state.isCrowOnHead ? 2.8 : 0;
  ctx.beginPath();
  for (const [x1, y1, x2, y2, w] of HEAD_STRAW_TUFTS) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2 + strawSquash * w);
  }
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // 3b. Burlap Head Oval with Woven Cross-Hatch & Emotional Rage Flush
  ctx.beginPath();
  ctx.ellipse(0, 0, 21.0, 25.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#C2945D';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-3.5, -5.5, 13.5, 16.5, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#D7A971';
  ctx.fill();

  drawBurlapCrosshatch(ctx, 0, 0, 21.0, 25.5);

  // Crimson-vermilion rage flush across cheeks and forehead when annoyed or screaming
  if (state.bubakRageFlush > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp01(state.bubakRageFlush * 0.46);
    ctx.beginPath();
    ctx.ellipse(0, -4, 17.5, 16.0, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.restore();
  }

  // Bold outer ink contour of head
  ctx.beginPath();
  ctx.ellipse(0, 0, 21.0, 25.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.4;
  ctx.stroke();

  // Cheek contour wrinkles
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.bezierCurveTo(-12, -7, -8, -7, -6, -5);
  ctx.moveTo(6, -5);
  ctx.bezierCurveTo(8, -7, 12, -7, 16, -5);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 3c. Left & Right Expressive Eyes with Glaring Pupils, Annoyed Lower Squint & V-Scowl Brows
  const drawBubakEye = (ex: number, ey: number, side: -1 | 1) => {
    ctx.save();
    ctx.translate(ex, ey);
    const eyeScale = 1 + state.screamLevel * 0.16;
    ctx.scale(eyeScale, eyeScale);

    // Sclera (warm cream, turns fiery gold-tinted rim during scream)
    ctx.beginPath();
    ctx.arc(0, 0, 6.6, 0, Math.PI * 2);
    ctx.fillStyle = state.screamLevel > 0.35 ? '#FEF9C3' : '#FAF6ED';
    ctx.fill();

    // Clip inside eye for pupil & eyelids
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
    ctx.clip();

    // Bloodshot crimson upper/lower rim when furious
    if (state.bubakRageFlush > 0.35) {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 5.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mobile pupil (rolls straight up when crow is on Bubák's head!)
    const px = state.bubakPupilDx;
    const py = state.bubakPupilDy;
    if (state.screamLevel > 0.25) {
      ctx.beginPath();
      ctx.arc(px, py, 3.9, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(px, py, 2.9, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px - 0.8, py - 0.9, 1.0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Annoyed lower eyelid squint rising from bottom of eye
    if (state.bubakEyeSquint > 0.04) {
      const lidY = 6.5 - state.bubakEyeSquint * 5.2;
      ctx.beginPath();
      ctx.rect(-8, lidY, 16, 8);
      ctx.fillStyle = '#B6844E';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-7, lidY);
      ctx.lineTo(7, lidY);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.9;
      ctx.stroke();
    }

    // Angry upper eyelid cut-in matching brow slant
    if (state.annoyanceLevel > 0.15 || state.screamLevel > 0.15) {
      ctx.save();
      ctx.translate(0, -5.2 + state.bubakBrowDy * 0.65);
      ctx.rotate(((-side * state.bubakBrowSlant) * Math.PI) / 180);
      ctx.beginPath();
      ctx.rect(-9, -8, 18, 8);
      ctx.fillStyle = '#B6844E';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore(); // end eye clip

    // Eye outer ink ring
    ctx.beginPath();
    ctx.arc(0, 0, 6.6, 0, Math.PI * 2);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Heavy expressive outer brow ridge above eye
    ctx.save();
    ctx.translate(0, -6.8 + state.bubakBrowDy * 0.5);
    ctx.rotate(((-side * state.bubakBrowSlant) * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(-7.2, -0.5);
    ctx.quadraticCurveTo(0, -2.2, 7.2, 0.5);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  drawBubakEye(-8.5, -8, -1);
  drawBubakEye(8.5, -8, 1);

  // Center brow furrow ticks between eyes
  ctx.beginPath();
  ctx.moveTo(-2.8, -16 + state.bubakBrowDy * 0.5);
  ctx.lineTo(-1.5, -10.5 + state.bubakBrowDy * 0.5);
  ctx.moveTo(2.8, -16 + state.bubakBrowDy * 0.5);
  ctx.lineTo(1.5, -10.5 + state.bubakBrowDy * 0.5);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Pulsing folk comic anger vein on temple when boiling with annoyance
  if (state.annoyanceLevel > 0.42 || state.screamLevel > 0.2) {
    const veinScale = 0.75 + Math.abs(Math.sin(t * 16)) * 0.35;
    ctx.save();
    ctx.translate(14.5, -15.5);
    ctx.scale(veinScale, veinScale);
    ctx.strokeStyle = '#E6392B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-4, -1.5);
    ctx.quadraticCurveTo(-1.2, -1.2, -1.5, -4);
    ctx.moveTo(4, -1.5);
    ctx.quadraticCurveTo(1.2, -1.2, 1.5, -4);
    ctx.moveTo(-4, 1.5);
    ctx.quadraticCurveTo(-1.2, 1.2, -1.5, 4);
    ctx.moveTo(4, 1.5);
    ctx.quadraticCurveTo(1.2, 1.2, 1.5, 4);
    ctx.stroke();
    ctx.restore();
  }

  // 3d. Snout / Button Nose (wrinkles upward during snarl & scream)
  const noseY = 1.0 - Math.max(state.annoyanceLevel, state.screamLevel) * 1.4;
  ctx.beginPath();
  ctx.ellipse(0, noseY, 3.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#A06E3B';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-1.3, noseY + 0.3, 0.85, 0, Math.PI * 2);
  ctx.arc(1.3, noseY + 0.3, 0.85, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();

  // 3e. Deformable Stitched Toothy Maw (mutters in annoyance -> rips wide open in ANGRY SCREAM!)
  ctx.save();
  ctx.translate(0, 11.5);
  ctx.rotate((state.bubakMouthSlant * Math.PI) / 180);

  const mw = 12.5 * state.bubakMouthWidth;
  const openH = Math.max(2.2, 8.8 * state.bubakMouthOpen);
  const topY = -openH * 0.38;
  const botY = openH * 0.72;

  // Mouth cavity path (flat crimson-burgundy gouache fill, zero gradient allocation)
  ctx.beginPath();
  ctx.moveTo(-mw, 0);
  ctx.bezierCurveTo(-mw * 0.65, topY - 2.5, mw * 0.65, topY - 2.5, mw, 0);
  ctx.bezierCurveTo(mw * 0.88, botY + 3.5, -mw * 0.88, botY + 3.5, -mw, 0);
  ctx.closePath();
  ctx.fillStyle = '#7A110E';
  ctx.fill();

  // Clip teeth & roaring tongue inside the mouth cavity
  ctx.save();
  ctx.clip();

  // Inner dark throat depth ellipse
  ctx.beginPath();
  ctx.ellipse(0, openH * 0.15, mw * 0.65, openH * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#450A0A';
  ctx.fill();

  // Vibrating red tongue & uvula during the angry scream
  if (state.bubakMouthOpen > 0.85) {
    const tongueVibX = Math.sin(t * 40) * 0.9;
    ctx.beginPath();
    ctx.ellipse(tongueVibX, botY * 0.72, mw * 0.52, openH * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#E11D48';
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Uvula hanging at top center of throat
    ctx.beginPath();
    ctx.moveTo(-2.2, topY - 1);
    ctx.quadraticCurveTo(tongueVibX, topY + openH * 0.36, 2.2, topY - 1);
    ctx.fillStyle = '#991B1B';
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Upper row of sharp saw-teeth
  const toothCount = 6;
  const toothSpan = mw * 1.72;
  const startX = -toothSpan * 0.5;
  const stepX = toothSpan / toothCount;
  const toothDepth = Math.min(5.2, openH * 0.46);

  ctx.beginPath();
  ctx.moveTo(startX, topY - 3);
  for (let i = 0; i < toothCount; i++) {
    const tx0 = startX + i * stepX;
    const txMid = tx0 + stepX * 0.5;
    const tx1 = tx0 + stepX;
    const archOffset = (1 - Math.pow((txMid / mw), 2)) * 1.4;
    ctx.lineTo(tx0, topY - archOffset);
    ctx.lineTo(txMid, topY - archOffset + toothDepth);
    ctx.lineTo(tx1, topY - archOffset);
  }
  ctx.lineTo( startX + toothSpan, topY - 3);
  ctx.closePath();
  ctx.fillStyle = '#FAF6ED';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Lower row of sharp saw-teeth
  ctx.beginPath();
  ctx.moveTo(startX, botY + 4);
  for (let i = 0; i < toothCount; i++) {
    const tx0 = startX + i * stepX;
    const txMid = tx0 + stepX * 0.5;
    const tx1 = tx0 + stepX;
    const archOffset = (1 - Math.pow((txMid / mw), 2)) * 1.8;
    ctx.lineTo(tx0, botY + archOffset);
    ctx.lineTo(txMid, botY + archOffset - toothDepth);
    ctx.lineTo(tx1, botY + archOffset);
  }
  ctx.lineTo(startX + toothSpan, botY + 4);
  ctx.closePath();
  ctx.fillStyle = '#FAF6ED';
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  ctx.restore(); // end mouth clip

  // Outer stitched lip seam outline
  ctx.beginPath();
  ctx.moveTo(-mw, 0);
  ctx.bezierCurveTo(-mw * 0.65, topY - 2.5, mw * 0.65, topY - 2.5, mw, 0);
  ctx.bezierCurveTo(mw * 0.88, botY + 3.5, -mw * 0.88, botY + 3.5, -mw, 0);
  ctx.closePath();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  ctx.restore(); // end mouth
  ctx.restore(); // end head
  ctx.restore(); // end articulated upper body

  // ==========================================================================
  // 4. ANGRY SCREAM ACOUSTIC SHOCKWAVES, STEAM PUFFS & FLYING STRAW
  // ==========================================================================
  // Rising annoyance steam puffs from Bubák's temples when crow is on his head
  if (state.annoyanceLevel > 0.45 && state.screamLevel < 0.3) {
    for (let i = 0; i < 2; i++) {
      const puffPhase = (t * 1.8 + i * 0.5) % 1;
      const side = i === 0 ? -1 : 1;
      const px = state.bubakHeadCrownX + side * (22 + puffPhase * 9);
      const py = state.bubakHeadCrownY + 12 - puffPhase * 16;
      const pr = 2.2 + puffPhase * 3.2;
      ctx.save();
      ctx.globalAlpha = Math.sin(puffPhase * Math.PI) * state.annoyanceLevel * 0.85;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = '#FAF6ED';
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Straw bits popping loose when the crow lands or pecks on Bubák's head
  if (state.landingImpact > 0.05 || (state.isCrowOnHead && state.crowHeadPitch > 0.15)) {
    const burstAmt = Math.max(state.landingImpact, state.isCrowOnHead ? 0.6 : 0);
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI * 0.5 + (i - 1) * 0.65 + Math.sin(t * 10 + i) * 0.2;
      const dist = 6 + ((t * 28 + i * 5) % 14);
      const sx = state.bubakHeadCrownX + Math.cos(angle) * dist;
      const sy = state.bubakHeadCrownY + Math.sin(angle) * dist * 0.7;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + 0.8);
      ctx.globalAlpha = clamp01(burstAmt);
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Monumental ANGRY SCREAM shockwave rings & "KŠÁÁ! BAF!" callout
  if (state.screamLevel > 0.08) {
    const mouthOriginX = 84 + state.bubakTorsoX + state.bubakHeadX;
    const mouthOriginY = 52 + state.bubakTorsoY + state.bubakHeadY;

    ctx.save();
    ctx.translate(mouthOriginX, mouthOriginY);
    for (let ring = 0; ring < 3; ring++) {
      const ringProgress = ((t * 3.4 + ring * 0.33) % 1);
      const radius = 16 + ringProgress * 44;
      const alpha = Math.sin(ringProgress * Math.PI) * state.screamLevel;
      ctx.save();
      ctx.globalAlpha = clamp01(alpha * 0.95);
      ctx.beginPath();
      ctx.arc(0, -6, radius, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4.2;
      ctx.stroke();
      ctx.strokeStyle = ring % 2 === 0 ? '#E6392B' : '#FACC15';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // Radial spiky scream lines
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI * 0.88 + (i / 5) * Math.PI * 0.76;
      const r1 = 22 + Math.sin(t * 30 + i) * 3;
      const r2 = r1 + 12 * state.screamLevel;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * r1, -6 + Math.sin(ang) * r1);
      ctx.lineTo(Math.cos(ang) * r2, -6 + Math.sin(ang) * r2);
      ctx.strokeStyle = i % 2 === 0 ? '#FEF08A' : '#E6392B';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // Bold Czech folk scream callout ("KŠÁÁ!")
    const jitterX = Math.sin(t * 45) * 1.4;
    const jitterY = Math.cos(t * 42) * 1.4;
    ctx.save();
    ctx.translate(-36 + jitterX, -42 + jitterY);
    ctx.rotate(-0.18);
    ctx.globalAlpha = clamp01(state.screamLevel * 1.2);
    ctx.font = "900 14px 'Eczar', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.2;
    ctx.strokeText('KŠÁÁ!', 0, 0);
    ctx.fillStyle = '#FACC15';
    ctx.fillText('KŠÁÁ!', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================================
  // 5. BLACK-AND-WHITE CROW (VRÁNA ŠEDIVKA)
  // ==========================================================================
  drawBlackAndWhiteCrow2D(ctx, t, state);

  ctx.restore(); // end bubak root scale/lift
  ctx.restore(); // end canvas transform

  return state;
}

// ============================================================================
// RIGHT-SIDE 2D CANVAS: ČERTÍK (GOOGLY EYE-ROLLING & BURNING TAIL COMEDY SCENE)
// - Čert koulí velkýma očima (huge googly ruby eyes rolling in 360° orbits)
// - Ocas náhle začne velice hořet (tail suddenly erupts into a huge roaring blaze)
// - Čert si vyděšeně musí sfouknout svůj ocas (panics, chases tail in a spin & blows it out)
// ============================================================================
export const CERT_TAIL_FIRE_CYCLE_DURATION = 8.4;

export type CertTailFirePhase =
  | 'mischievous_eye_roll'
  | 'tail_flare_up'
  | 'startled_panic'
  | 'chasing_and_blowing'
  | 'sizzling_extinguish'
  | 'cheeky_recovery';

export interface CertTailFireChoreographyState {
  phase: CertTailFirePhase;
  cycleTime: number;
  // Eye-rolling & facial expression
  eyeScaleX: number;
  eyeScaleY: number;
  leftPupilDx: number;
  leftPupilDy: number;
  rightPupilDx: number;
  rightPupilDy: number;
  pupilRadius: number;
  eyeRollAngleRad: number;
  browTiltDeg: number;
  browLiftY: number;
  // Mouth, puffed cheeks & blowing wind
  mouthMode: 'grin_tongue' | 'startled_gasp' | 'blowing' | 'relieved_phew';
  cheekPuff: number; // 0..1
  windBlowPower: number; // 0..1
  tongueLength: number; // 0..1
  // Body & tail-chasing spin kinematics
  spinAngleRad: number;
  bodyTurnDir: number; // -1 (facing left) .. +1 (facing right)
  torsoBobY: number;
  torsoSwayX: number;
  torsoTiltDeg: number;
  jumpY: number;
  leftHoofLiftY: number;
  rightHoofLiftY: number;
  pitchforkPlanted: number; // 0 (held in hand) .. 1 (planted upright in turf)
  // Tail & roaring fire state
  tailTipX: number;
  tailTipY: number;
  tailBaseX: number;
  tailBaseY: number;
  flameIntensity: number; // 0.15 (tiny ember) .. 1.0 (normal) .. 3.0 (huge roaring fire)
  smokePuffIntensity: number; // 0..1
  sparkCount: number;
  folkCallout: '' | 'JÉMINÁČKU!' | 'FÚÚÚ!' | 'UF!';
}

export function computeCertTailFireChoreography(
  t: number,
  manualFireStart: number = -100,
  hoverMix: number = 0
): CertTailFireChoreographyState {
  const clickElapsed = t - manualFireStart;
  const isManualActive = clickElapsed >= 0 && clickElapsed < 6.4;

  // 8.4s cycle vs Bubák's 9.6s cycle ensures the two characters run on independent, offset comedy loops
  const cycleTime = isManualActive
    ? Math.min(CERT_TAIL_FIRE_CYCLE_DURATION - 0.05, 1.82 + clickElapsed)
    : ((t % CERT_TAIL_FIRE_CYCLE_DURATION) + CERT_TAIL_FIRE_CYCLE_DURATION) %
      CERT_TAIL_FIRE_CYCLE_DURATION;

  let phase: CertTailFirePhase = 'mischievous_eye_roll';
  let eyeScaleX = 1.24 + hoverMix * 0.08;
  let eyeScaleY = 1.24 + hoverMix * 0.08;
  let eyeRollAngleRad = t * 5.6;
  let leftPupilDx = 0;
  let leftPupilDy = 0;
  let rightPupilDx = 0;
  let rightPupilDy = 0;
  let pupilRadius = 2.6;
  let browTiltDeg = -6;
  let browLiftY = 0;

  let mouthMode: CertTailFireChoreographyState['mouthMode'] = 'grin_tongue';
  let cheekPuff = 0;
  let windBlowPower = 0;
  let tongueLength = 0.82;

  let spinAngleRad = 0;
  let bodyTurnDir = -1; // -1 = facing left/viewer, +1 = turned right toward tail
  let torsoBobY = Math.sin(t * 4.4) * 1.8;
  let torsoSwayX = Math.sin(t * 2.2) * 1.5;
  let torsoTiltDeg = Math.sin(t * 2.2) * 2.4;
  let jumpY = 0;
  let leftHoofLiftY = 0;
  let rightHoofLiftY = 0;
  let pitchforkPlanted = 0;

  let flameIntensity = 0.85 + hoverMix * 0.15;
  let smokePuffIntensity = 0.15;
  let sparkCount = 2;
  let folkCallout: CertTailFireChoreographyState['folkCallout'] = '';

  if (cycleTime < 1.8) {
    // PHASE 1: MISCHIEVOUS EYE-ROLL (Čert koulí velkýma očima)
    phase = 'mischievous_eye_roll';
    const p = cycleTime / 1.8;
    // Huge googly eyes rolling in wide 360-degree circles with playful phase offset
    const rollSpeed = p * Math.PI * 4 + t * 2.2;
    eyeRollAngleRad = rollSpeed;
    const orbitR = 3.9;
    leftPupilDx = Math.cos(rollSpeed) * orbitR;
    leftPupilDy = Math.sin(rollSpeed) * orbitR;
    rightPupilDx = Math.cos(rollSpeed + 0.55) * orbitR;
    rightPupilDy = Math.sin(rollSpeed + 0.55) * orbitR;
    eyeScaleX = 1.28 + Math.sin(p * Math.PI * 2) * 0.08;
    eyeScaleY = 1.28 + Math.cos(p * Math.PI * 2) * 0.08;
    pupilRadius = 2.55;
    browTiltDeg = Math.sin(p * Math.PI * 2) * 10 - 4;
    browLiftY = -1.8 - Math.abs(Math.sin(p * Math.PI * 2)) * 2.2;

    mouthMode = 'grin_tongue';
    tongueLength = 0.78 + Math.sin(t * 6.5) * 0.18;
    leftHoofLiftY = Math.max(0, Math.sin(t * 5.2)) * 3.5;
    rightHoofLiftY = Math.max(0, -Math.sin(t * 5.2)) * 3.5;
    flameIntensity = 0.85 + Math.sin(t * 9.5) * 0.12;
    sparkCount = 3;
  } else if (cycleTime < 2.75) {
    // PHASE 2: TAIL SUDDENLY BURSTS INTO HUGE ROARING FIRE (Ocas náhle začne velice hořet!)
    phase = 'tail_flare_up';
    const p = (cycleTime - 1.8) / 0.95; // 0..1
    const flareEase = smoothstep(0, 1, Math.min(1, p * 1.35));

    // Flame explodes from 0.85 up to 2.95x roaring blaze!
    flameIntensity = lerp(0.85, 2.95, flareEase) + Math.sin(t * 24) * 0.18;
    smokePuffIntensity = lerp(0.2, 0.75, flareEase);
    sparkCount = Math.round(lerp(4, 12, flareEase));

    // Eyes widen and snap sideways toward the burning tail on the left
    eyeRollAngleRad = lerp(eyeRollAngleRad, Math.PI, flareEase);
    eyeScaleX = lerp(1.28, 1.44, flareEase);
    eyeScaleY = lerp(1.28, 1.48, flareEase);
    leftPupilDx = lerp(Math.cos(t * 5) * 3.5, -3.8, flareEase);
    leftPupilDy = lerp(Math.sin(t * 5) * 3.5, -1.2, flareEase);
    rightPupilDx = lerp(Math.cos(t * 5) * 3.5, -3.8, flareEase);
    rightPupilDy = lerp(Math.sin(t * 5) * 3.5, -1.2, flareEase);
    pupilRadius = lerp(2.55, 1.85, flareEase);
    browTiltDeg = lerp(-4, 16, flareEase);
    browLiftY = lerp(-2, -5.5, flareEase);

    mouthMode = p < 0.45 ? 'grin_tongue' : 'startled_gasp';
    tongueLength = Math.max(0, 0.8 * (1 - p * 2.1));
    pitchforkPlanted = smoothstep(0, 1, Math.max(0, (p - 0.35) / 0.65));
    torsoTiltDeg = lerp(0, 7, flareEase);
  } else if (cycleTime < 3.7) {
    // PHASE 3: STARTLED PANIC DOUBLE-TAKE ("JÉMINÁČKU!")
    phase = 'startled_panic';
    const p = (cycleTime - 2.75) / 0.95; // 0..1
    const jumpArc = Math.sin(Math.min(1, p * 1.35) * Math.PI);

    jumpY = -jumpArc * 11.5;
    leftHoofLiftY = jumpArc * 9;
    rightHoofLiftY = jumpArc * 11;
    pitchforkPlanted = 1;

    // Giant bugged-out eyes & trembling pinpoint pupils staring at roaring tail blaze
    eyeScaleX = 1.48 + Math.sin(t * 32) * 0.05;
    eyeScaleY = 1.54 + Math.cos(t * 32) * 0.05;
    const jitterX = Math.sin(t * 45) * 0.55;
    const jitterY = Math.cos(t * 41) * 0.55;
    leftPupilDx = -3.9 + jitterX;
    leftPupilDy = -1.0 + jitterY;
    rightPupilDx = -3.9 + jitterX;
    rightPupilDy = -1.0 + jitterY;
    pupilRadius = 1.65;
    browTiltDeg = 20;
    browLiftY = -6.5;

    mouthMode = 'startled_gasp';
    tongueLength = 0;
    torsoSwayX = 3.5 + Math.sin(t * 30) * 1.2;
    torsoTiltDeg = 9 + Math.sin(t * 26) * 3;

    flameIntensity = 3.0 + Math.sin(t * 28) * 0.22;
    smokePuffIntensity = 0.85;
    sparkCount = 12;
    folkCallout = 'JÉMINÁČKU!';
  } else if (cycleTime < 6.2) {
    // PHASE 4: FRANTIC TAIL-CHASING SPIN & BLOWING OUT TAIL FIRE ("FÚÚÚ!")
    phase = 'chasing_and_blowing';
    const p = (cycleTime - 3.7) / 2.5; // 0..1 over 2.5 seconds
    pitchforkPlanted = 1;

    // 3 energetic tail-chasing revolutions on his cloven goat hooves
    spinAngleRad = p * Math.PI * 6;
    bodyTurnDir = Math.cos(spinAngleRad);
    torsoSwayX = Math.sin(spinAngleRad) * 9.5;
    torsoBobY = -Math.abs(Math.sin(spinAngleRad * 2)) * 4.5;
    torsoTiltDeg = -11 + Math.sin(spinAngleRad) * 7;

    // Rapid prancing hooves while spinning & chasing tail
    leftHoofLiftY = Math.max(0, Math.sin(t * 22)) * 8.5;
    rightHoofLiftY = Math.max(0, -Math.sin(t * 22)) * 8.5;

    // Big eyes locked onto the burning tail while rolling with the spin
    eyeScaleX = 1.34;
    eyeScaleY = 1.38;
    eyeRollAngleRad = spinAngleRad;
    leftPupilDx = -3.5 + Math.cos(spinAngleRad) * 1.1;
    leftPupilDy = 0.9 + Math.sin(spinAngleRad * 2) * 0.8;
    rightPupilDx = -3.5 + Math.cos(spinAngleRad) * 1.1;
    rightPupilDy = 0.9 + Math.sin(spinAngleRad * 2) * 0.8;
    pupilRadius = 2.05;
    browTiltDeg = -14; // Furrowed determined blowing brows
    browLiftY = -2.2;

    // Puffed-out furry cheeks & rhythmic forceful blowing gusts ("FÚÚÚ!")
    mouthMode = 'blowing';
    const blowPulse = 0.82 + 0.18 * Math.sin(t * 19);
    cheekPuff = blowPulse;
    windBlowPower = blowPulse;
    tongueLength = 0;

    // Flame gets blown sideways and shrinks progressively from 2.95 down to 0.35 as Čertík blows it out!
    const extinguishProgress = smoothstep(0, 1, p);
    flameIntensity =
      lerp(2.9, 0.35, extinguishProgress) * (0.88 + 0.12 * Math.sin(t * 30));
    smokePuffIntensity = lerp(0.65, 1.0, extinguishProgress);
    sparkCount = Math.max(3, Math.round(lerp(11, 3, extinguishProgress)));
    folkCallout = 'FÚÚÚ!';
  } else if (cycleTime < 7.35) {
    // PHASE 5: SIZZLING EXTINGUISH & DIZZY RELIEF ("UF!")
    phase = 'sizzling_extinguish';
    const p = (cycleTime - 6.2) / 1.15; // 0..1
    pitchforkPlanted = 1 - smoothstep(0, 1, Math.max(0, (p - 0.65) / 0.35));

    // Dizzy swirling eyes after spinning & relieved sigh
    eyeScaleX = 1.22;
    eyeScaleY = 1.14;
    const dizzyAngle = t * 9.5 * (1 - p * 0.5);
    eyeRollAngleRad = dizzyAngle;
    leftPupilDx = Math.cos(dizzyAngle) * 2.8;
    leftPupilDy = Math.sin(dizzyAngle) * 2.4;
    rightPupilDx = -Math.cos(dizzyAngle) * 2.8;
    rightPupilDy = Math.sin(dizzyAngle) * 2.4;
    pupilRadius = 2.35;
    browTiltDeg = 12;
    browLiftY = -1.5;

    mouthMode = 'relieved_phew';
    cheekPuff = Math.max(0, (1 - p * 1.6) * 0.45);
    windBlowPower = Math.max(0, (1 - p * 2.2) * 0.35);
    tongueLength = 0;

    torsoBobY = Math.sin(p * Math.PI) * 2.5;
    torsoSwayX = Math.sin(p * Math.PI * 2) * 2.0;
    torsoTiltDeg = lerp(-6, 2, smoothstep(0, 1, p));

    // Tiny sizzling ember on tail tip + big rising dark soot cloud
    flameIntensity = 0.18 + Math.sin(t * 16) * 0.05;
    smokePuffIntensity = 1.0 - p * 0.35;
    sparkCount = 2;
    folkCallout = 'UF!';
  } else {
    // PHASE 6: CHEEKY RECOVERY & PILOT FLAME RELIGHT
    phase = 'cheeky_recovery';
    const p = (cycleTime - 7.35) / 1.05; // 0..1
    const settle = smoothstep(0, 1, p);
    pitchforkPlanted = 0;

    eyeScaleX = lerp(1.22, 1.26, settle);
    eyeScaleY = lerp(1.16, 1.26, settle);
    const rollAngle = t * 4.8;
    eyeRollAngleRad = rollAngle;
    leftPupilDx = Math.cos(rollAngle) * lerp(1.8, 3.6, settle);
    leftPupilDy = Math.sin(rollAngle) * lerp(1.8, 3.6, settle);
    rightPupilDx = Math.cos(rollAngle + 0.5) * lerp(1.8, 3.6, settle);
    rightPupilDy = Math.sin(rollAngle + 0.5) * lerp(1.8, 3.6, settle);
    pupilRadius = 2.55;
    browTiltDeg = lerp(8, -5, settle);
    browLiftY = -1.8;

    mouthMode = 'grin_tongue';
    tongueLength = lerp(0.2, 0.8, settle);
    flameIntensity = lerp(0.22, 0.85, settle);
    smokePuffIntensity = lerp(0.55, 0.15, settle);
    sparkCount = 2;
  }

  // Compute tail base and world-space tail tip coordinates
  const tailBaseX = 60 + torsoSwayX * 0.65;
  const tailBaseY = 114 + torsoBobY + jumpY * 0.75;

  let tailTipX = 16;
  let tailTipY = 86;

  if (phase === 'chasing_and_blowing') {
    // During tail-chasing spin, tail whips in an energetic ellipse in front/left of Čertík so his wind streams hit the blaze directly!
    const chaseWave = Math.sin(spinAngleRad);
    tailTipX = 18 + chaseWave * 10;
    tailTipY = 88 + Math.cos(spinAngleRad * 2) * 6 + jumpY * 0.5;
  } else if (phase === 'tail_flare_up' || phase === 'startled_panic') {
    // Tail jerks upright in alarm so the huge roaring fire is prominently framed
    tailTipX = 16 + Math.sin(t * 22) * 2.2;
    tailTipY = 84 + Math.cos(t * 19) * 2.0 + jumpY * 0.6;
  } else {
    // Playful sinuous wag
    const wagDeg = Math.sin(t * 3.1) * 10 + Math.cos(t * 1.9) * 4;
    const wagRad = (wagDeg * Math.PI) / 180;
    const rawDx = -42;
    const rawDy = -28;
    tailTipX = tailBaseX + rawDx * Math.cos(wagRad) - rawDy * Math.sin(wagRad);
    tailTipY = tailBaseY + rawDx * Math.sin(wagRad) + rawDy * Math.cos(wagRad);
  }

  return {
    phase,
    cycleTime,
    eyeScaleX,
    eyeScaleY,
    leftPupilDx,
    leftPupilDy,
    rightPupilDx,
    rightPupilDy,
    pupilRadius,
    eyeRollAngleRad,
    browTiltDeg,
    browLiftY,
    mouthMode,
    cheekPuff,
    windBlowPower,
    tongueLength,
    spinAngleRad,
    bodyTurnDir,
    torsoBobY,
    torsoSwayX,
    torsoTiltDeg,
    jumpY,
    leftHoofLiftY,
    rightHoofLiftY,
    pitchforkPlanted,
    tailTipX,
    tailTipY,
    tailBaseX,
    tailBaseY,
    flameIntensity,
    smokePuffIntensity,
    sparkCount,
    folkCallout,
  };
}

/**
 * Draws the complete right-side Josef Lada Čertík (Devil) comedy scene on a 2D Canvas:
 * - Čert koulí velkýma očima (huge googly ruby eyes rolling in 360° circular orbits)
 * - Ocas náhle začne velice hořet (tail suddenly bursts into a huge multi-layered roaring fire)
 * - Čert si vyděšeně musí sfouknout svůj ocas (panics, chases tail in a spin & blows out the blaze)
 *
 * Strictly zero per-frame CanvasGradient allocations (100% flat gouache Lada polygons & ink strokes)
 * and 100% uncropped within the 225x252 stage box (local x in [-45..180], y in [-52..200]).
 */
export function drawCertCoverCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  t: number,
  manualFireStart: number = -100,
  hoverMix: number = 0
): CertTailFireChoreographyState {
  const state = computeCertTailFireChoreography(t, manualFireStart, hoverMix);
  const ink = '#1C1610';

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Map 225x252 stage slice (stageX: 655..880, stageY: -48..204)
  // Local origin (0, 0) corresponds to stageX = 700, stageY = 4
  const scaleX = canvasWidth / 225;
  const scaleY = canvasHeight / 252;
  ctx.scale(scaleX, scaleY);
  ctx.translate(45, 52);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ==========================================================================
  // 1. WATERCOLOR TURF SHADOW & MEADOW GRASS TUFTS
  // ==========================================================================
  ctx.save();
  ctx.fillStyle = 'rgba(28, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(74, 165, 38, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Warm fiery ground reflection when tail is blazing
  if (state.flameIntensity > 1.2) {
    const glowAlpha = Math.min(0.32, (state.flameIntensity - 1.0) * 0.15);
    ctx.fillStyle = `rgba(249, 115, 22, ${glowAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(32, 163, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ladovské green turf tufts
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(42, 165);
  ctx.quadraticCurveTo(38, 157, 34, 162);
  ctx.moveTo(46, 165);
  ctx.quadraticCurveTo(45, 156, 49, 161);
  ctx.moveTo(100, 165);
  ctx.quadraticCurveTo(104, 156, 109, 161);
  ctx.moveTo(105, 165);
  ctx.quadraticCurveTo(111, 158, 115, 163);
  ctx.stroke();
  ctx.restore();

  // ==========================================================================
  // 2. IRON PITCHFORK WHEN PLANTED IN TURF (DURING PANIC & TAIL-CHASING SPIN)
  // ==========================================================================
  const drawIronPitchfork = (
    pivotX: number,
    pivotY: number,
    angleDeg: number,
    withWobble: number = 0
  ) => {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(((angleDeg + withWobble) * Math.PI) / 180);

    // Ash-wood pole shaft
    ctx.fillStyle = '#7A4924';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-3.4, -36, 6.8, 134, 3);
    ctx.fill();
    ctx.stroke();

    // Warm wood highlight stripe
    ctx.strokeStyle = '#C89662';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1.1, -33);
    ctx.lineTo(-1.1, 93);
    ctx.stroke();

    // Forged iron socket collar
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.roundRect(-4.6, -42, 9.2, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Forged 3-prong iron pitchfork head
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5.4;
    ctx.beginPath();
    ctx.moveTo(-17, -42);
    ctx.quadraticCurveTo(-19, -66, -13, -84);
    ctx.moveTo(-17, -42);
    ctx.quadraticCurveTo(0, -39, 17, -42);
    ctx.moveTo(17, -42);
    ctx.quadraticCurveTo(19, -66, 13, -84);
    ctx.moveTo(0, -40);
    ctx.lineTo(0, -88);
    ctx.stroke();

    // Steel inner highlight on prongs
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-17, -42);
    ctx.quadraticCurveTo(-19, -66, -13, -84);
    ctx.moveTo(-17, -42);
    ctx.quadraticCurveTo(0, -39, 17, -42);
    ctx.moveTo(17, -42);
    ctx.quadraticCurveTo(19, -66, 13, -84);
    ctx.moveTo(0, -40);
    ctx.lineTo(0, -88);
    ctx.stroke();

    // Red-hot glowing barb tips
    const drawProngTip = (tx: number, ty: number, rotDeg: number) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((rotDeg * Math.PI) / 180);
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(-4.2, 2);
      ctx.lineTo(4.2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawProngTip(-13, -84, 11);
    drawProngTip(0, -88, 0);
    drawProngTip(13, -84, -11);

    ctx.restore();
  };

  if (state.pitchforkPlanted > 0.5) {
    // Pitchfork planted upright in the turf to the right of Čertík while he panics & chases his tail
    const plantedWobble =
      state.phase === 'startled_panic'
        ? Math.sin(t * 28) * 3.5
        : state.phase === 'chasing_and_blowing'
          ? Math.sin(t * 16) * 1.8
          : 0;
    drawIronPitchfork(118, 66, 6, plantedWobble);
  }

  // ==========================================================================
  // 3. SINUOUS DEVIL TAIL & ROARING MULTI-LAYERED TAIL BLAZE
  // ==========================================================================
  const { tailBaseX, tailBaseY, tailTipX, tailTipY, flameIntensity, smokePuffIntensity } = state;

  // Sinuous double-curved devil tail from pelvis to tailTip
  const ctrl1X = tailBaseX - 24;
  const ctrl1Y = tailBaseY + 14 + Math.sin(t * 7) * 3;
  const ctrl2X = tailTipX + 8;
  const ctrl2Y = tailTipY + 26 - Math.cos(t * 7) * 3;

  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 8.4;
  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, tailTipX, tailTipY);
  ctx.stroke();

  ctx.strokeStyle = '#3D2E27';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, tailTipX, tailTipY);
  ctx.stroke();

  // Shaggy black fur tuft at the tip of the tail
  ctx.fillStyle = '#221915';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(tailTipX + 4, tailTipY + 4);
  ctx.bezierCurveTo(tailTipX - 6, tailTipY + 10, tailTipX - 12, tailTipY + 2, tailTipX - 9, tailTipY - 6);
  ctx.bezierCurveTo(tailTipX - 4, tailTipY - 4, tailTipX - 1, tailTipY - 9, tailTipX + 3, tailTipY - 5);
  ctx.bezierCurveTo(tailTipX + 8, tailTipY - 2, tailTipX + 8, tailTipY + 4, tailTipX + 4, tailTipY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Rising smoke & soot puffs above tail tip
  if (smokePuffIntensity > 0.05) {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const puffCycle = (t * 1.45 + i * 0.25) % 1;
      const puffAlpha = Math.sin(puffCycle * Math.PI) * 0.78 * smokePuffIntensity;
      if (puffAlpha <= 0.02) continue;

      const windPushX = state.windBlowPower * 22 * puffCycle;
      const px =
        tailTipX -
        3 -
        windPushX +
        Math.sin(t * 4.2 + i * 1.7) * (4 + puffCycle * 7);
      const py = tailTipY - 18 - puffCycle * 46;
      const pr = 4.2 + puffCycle * (state.phase === 'sizzling_extinguish' ? 9.5 : 6.5);

      ctx.globalAlpha = puffAlpha;
      ctx.fillStyle = state.phase === 'sizzling_extinguish' ? '#475569' : '#64748B';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner warm highlight on smoke puff
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(px - pr * 0.25, py - pr * 0.25, pr * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Roaring multi-layered Josef Lada tail fire!
  if (flameIntensity > 0.12) {
    ctx.save();
    ctx.translate(tailTipX - 2, tailTipY - 3);

    // When Čertík blows on the tail ("chasing_and_blowing"), the wind bends the roaring flame sharply to the left!
    const windLeanRad =
      (-state.windBlowPower * 34 + Math.sin(t * 18) * (4 + flameIntensity * 2.5)) *
      (Math.PI / 180);
    ctx.rotate(windLeanRad);

    const fScaleX = (0.65 + flameIntensity * 0.52) * (1 + Math.sin(t * 23) * 0.09);
    const fScaleY = (0.65 + flameIntensity * 0.58) * (1 + Math.cos(t * 27) * 0.12);
    ctx.scale(fScaleX, fScaleY);

    // 1. Warm outer fire halo (flat gouache amber-red disk, zero CanvasGradient allocation)
    if (flameIntensity > 1.1) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.45, (flameIntensity - 0.8) * 0.22);
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.ellipse(0, -16, 19, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Outer Crimson-Vermilion scalloped Lada flame tongue
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2 / Math.max(0.7, fScaleX);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-13, 2, -16, -12, -9, -22);
    ctx.bezierCurveTo(-13, -18, -11, -30, -4, -36);
    ctx.bezierCurveTo(-2, -29, 0, -41, 2, -45);
    ctx.bezierCurveTo(6, -36, 11, -30, 8, -21);
    ctx.bezierCurveTo(14, -25, 16, -13, 11, -5);
    ctx.bezierCurveTo(10, 2, 5, 5, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Middle Bright Marigold Orange flame tongue
    ctx.fillStyle = '#F97316';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6 / Math.max(0.7, fScaleX);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-8, 0, -10, -10, -5, -19);
    ctx.bezierCurveTo(-7, -24, -2, -32, 1, -36);
    ctx.bezierCurveTo(5, -28, 9, -20, 6, -12);
    ctx.bezierCurveTo(8, -5, 4, 2, 0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Inner Buttercup Gold & Cream white-hot core
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(-4.5, -1, -5.5, -9, -1.5, -18);
    ctx.bezierCurveTo(0, -23, 2, -25, 3, -17);
    ctx.bezierCurveTo(5, -9, 3.5, -1, 0, 1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.ellipse(0, -7, 2.3, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. Crackling golden & crimson sparks flying off the burning tail
    ctx.save();
    for (let s = 0; s < state.sparkCount; s++) {
      const sparkPhase = (t * (2.6 + (s % 3) * 0.5) + s * 0.29) % 1;
      const sparkAlpha = Math.sin(sparkPhase * Math.PI);
      if (sparkAlpha <= 0.05) continue;

      const angle = -Math.PI * 0.5 + ((s % 5) - 2) * 0.42 - state.windBlowPower * 0.65;
      const dist = (8 + sparkPhase * (18 + flameIntensity * 11)) * (0.8 + (s % 2) * 0.3);
      const sx = tailTipX - 2 + Math.cos(angle) * dist;
      const sy = tailTipY - 12 + Math.sin(angle) * dist;

      ctx.globalAlpha = sparkAlpha;
      ctx.fillStyle = s % 2 === 0 ? '#FEF08A' : '#F97316';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, s % 3 === 0 ? 2.4 : 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================================
  // 4. TWO-JOINT CLOVEN GOAT LEGS (GROUNDED & PRANCING DURING SPIN)
  // ==========================================================================
  const hipCenterX = 72 + state.torsoSwayX * 0.55;
  const hipCenterY = 115 + state.torsoBobY + state.jumpY;

  const leftHipX = hipCenterX - 8;
  const leftHipY = hipCenterY;
  const leftHoofX = 59 + Math.sin(state.spinAngleRad) * 6;
  const leftHoofY = 162 - state.leftHoofLiftY + state.jumpY * 0.35;
  const leftKneeX = (leftHipX + leftHoofX) * 0.5 - 5.5;
  const leftKneeY = (leftHipY + leftHoofY) * 0.5 - 2;

  const rightHipX = hipCenterX + 9;
  const rightHipY = hipCenterY;
  const rightHoofX = 85 - Math.sin(state.spinAngleRad) * 6;
  const rightHoofY = 162 - state.rightHoofLiftY + state.jumpY * 0.35;
  const rightKneeX = (rightHipX + rightHoofX) * 0.5 + 5.5;
  const rightKneeY = (rightHipY + rightHoofY) * 0.5 - 2;

  const drawGoatLeg = (
    hx: number,
    hy: number,
    kx: number,
    ky: number,
    fx: number,
    fy: number
  ) => {
    ctx.save();
    // Shaggy black goat thigh & shin
    ctx.strokeStyle = ink;
    ctx.lineWidth = 11.5;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy - 5);
    ctx.stroke();

    ctx.strokeStyle = '#2B201B';
    ctx.lineWidth = 7.2;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy - 5);
    ctx.stroke();

    // Fur tuft at knee
    ctx.fillStyle = '#221915';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(kx, ky, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hard cloven goat hoof
    ctx.fillStyle = '#110D0A';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(fx - 5, fy - 6);
    ctx.lineTo(fx + 5, fy - 6);
    ctx.lineTo(fx + 7, fy + 2);
    ctx.lineTo(fx + 1, fy + 2);
    ctx.lineTo(fx - 1, fy - 2);
    ctx.lineTo(fx - 2, fy + 2);
    ctx.lineTo(fx - 8, fy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hoof horn highlight
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(fx - 5, fy - 3);
    ctx.lineTo(fx - 6, fy + 0.5);
    ctx.moveTo(fx + 3, fy - 3);
    ctx.lineTo(fx + 4, fy + 0.5);
    ctx.stroke();
    ctx.restore();
  };

  drawGoatLeg(leftHipX, leftHipY, leftKneeX, leftKneeY, leftHoofX, leftHoofY);
  drawGoatLeg(rightHipX, rightHipY, rightKneeX, rightKneeY, rightHoofX, rightHoofY);

  // Whirling comic dust/motion ring around hooves when spinning to chase tail
  if (state.phase === 'chasing_and_blowing') {
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.ellipse(72, 156, 26, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ==========================================================================
  // 5. SHAGGY BLACK FURRY TORSO & PELVIS (WITH SPIN MOTION)
  // ==========================================================================
  ctx.save();
  ctx.translate(73 + state.torsoSwayX, 96 + state.torsoBobY + state.jumpY);
  ctx.rotate((state.torsoTiltDeg * Math.PI) / 180);

  // Shaggy pelvis & belly silhouette
  ctx.fillStyle = '#221915';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 15, 18.5, 13.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-17, -20);
  ctx.bezierCurveTo(-24, -4, -22, 14, -13, 22);
  ctx.bezierCurveTo(-4, 27, 6, 27, 15, 22);
  ctx.bezierCurveTo(22, 14, 24, -4, 17, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ladovské curly fur hatch marks on chest & belly
  ctx.strokeStyle = '#4D3B31';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-6, -6, 4.2, 0.2, Math.PI - 0.2);
  ctx.moveTo(9, -6);
  ctx.arc(5, -6, 4.2, 0.2, Math.PI - 0.2);
  ctx.moveTo(-2, 4);
  ctx.arc(-6, 4, 4.5, 0.2, Math.PI - 0.2);
  ctx.moveTo(10, 5);
  ctx.arc(6, 5, 4.5, 0.2, Math.PI - 0.2);
  ctx.moveTo(4, 14);
  ctx.arc(0, 14, 4.5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Folksy hemp rope belt with brass buckle around Čertík's waist
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.roundRect(-18.5, 9, 37, 5.5, 2.5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.roundRect(-4.5, 7.8, 9, 7.8, 1.8);
  ctx.fill();
  ctx.stroke();

  // ==========================================================================
  // 6. ARMS & HANDS (GRIPPING PITCHFORK, GRABBING HEAD IN PANIC, OR FANNING)
  // ==========================================================================
  if (state.phase === 'startled_panic') {
    // Both furry arms raised up grabbing his head in sheer comic shock!
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(-15, -14);
    ctx.quadraticCurveTo(-30, -28, -20, -44);
    ctx.moveTo(15, -14);
    ctx.quadraticCurveTo(30, -28, 20, -44);
    ctx.stroke();

    ctx.strokeStyle = '#2B201B';
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(-15, -14);
    ctx.quadraticCurveTo(-30, -28, -20, -44);
    ctx.moveTo(15, -14);
    ctx.quadraticCurveTo(30, -28, 20, -44);
    ctx.stroke();
  } else if (state.phase === 'chasing_and_blowing') {
    // Arms pumping & fanning frantically while spinning and blowing out the tail!
    const pump = Math.sin(t * 24) * 8;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.quadraticCurveTo(-30, -6 + pump, -36, 4 - pump);
    ctx.moveTo(15, -12);
    ctx.quadraticCurveTo(28, -8 - pump, 22, 6 + pump);
    ctx.stroke();

    ctx.strokeStyle = '#2B201B';
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.quadraticCurveTo(-30, -6 + pump, -36, 4 - pump);
    ctx.moveTo(15, -12);
    ctx.quadraticCurveTo(28, -8 - pump, 22, 6 + pump);
    ctx.stroke();
  } else {
    // Left arm gesturing playfully (or wiping brow during sizzling_extinguish)
    const wipeLift = state.phase === 'sizzling_extinguish' ? -24 : 0;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.quadraticCurveTo(-28, -2 + wipeLift * 0.6, -24, 12 + wipeLift);
    ctx.stroke();

    ctx.strokeStyle = '#2B201B';
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.quadraticCurveTo(-28, -2 + wipeLift * 0.6, -24, 12 + wipeLift);
    ctx.stroke();
  }

  // ==========================================================================
  // 7. DEVIL HEAD, CURVED CRIMSON HORNS, BIG ROLLING EYES & PUFFED CHEEKS
  // ==========================================================================
  ctx.save();
  // Head sits at (0, -37) relative to torso center
  const headLookOffsetX =
    state.phase === 'chasing_and_blowing' ||
    state.phase === 'tail_flare_up' ||
    state.phase === 'startled_panic'
      ? -3.5
      : Math.sin(t * 2.5) * 1.4;
  ctx.translate(headLookOffsetX, -37);

  // Shaggy goat ears sticking out from sides of head
  const earWiggle = Math.sin(t * 8) * 4;
  ctx.fillStyle = '#221915';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.2;
  // Left ear
  ctx.save();
  ctx.translate(-17, -4);
  ctx.rotate(((-18 + earWiggle) * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.quadraticCurveTo(-13, -8, -16, -1);
  ctx.quadraticCurveTo(-11, 5, 0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.ellipse(-7, -1, 4.5, 1.8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right ear
  ctx.save();
  ctx.translate(17, -4);
  ctx.rotate(((18 - earWiggle) * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.quadraticCurveTo(13, -8, 16, -1);
  ctx.quadraticCurveTo(11, 5, 0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.ellipse(7, -1, 4.5, 1.8, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Curved Crimson Devil Horns with gold-ribbed rings
  const hornTremble =
    state.phase === 'startled_panic' ? Math.sin(t * 38) * 3.5 : Math.sin(t * 3.5) * 1.8;

  // Left horn
  ctx.save();
  ctx.translate(-9, -15);
  ctx.rotate(((-8 - hornTremble) * Math.PI) / 180);
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.bezierCurveTo(-12, -12, -21, -22, -24, -29);
  ctx.bezierCurveTo(-14, -25, -4, -14, 3, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Horn ribs
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-6, -5);
  ctx.lineTo(-1, -7);
  ctx.moveTo(-11, -12);
  ctx.lineTo(-6, -14);
  ctx.moveTo(-16, -19);
  ctx.lineTo(-12, -21);
  ctx.stroke();
  ctx.restore();

  // Right horn
  ctx.save();
  ctx.translate(9, -15);
  ctx.rotate(((8 + hornTremble) * Math.PI) / 180);
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-3, -1);
  ctx.bezierCurveTo(4, -14, 14, -25, 24, -29);
  ctx.bezierCurveTo(21, -22, 12, -12, 5, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Horn ribs
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(1, -7);
  ctx.lineTo(6, -5);
  ctx.moveTo(6, -14);
  ctx.lineTo(11, -12);
  ctx.moveTo(12, -21);
  ctx.lineTo(16, -19);
  ctx.stroke();
  ctx.restore();

  // Furry black devil head silhouette
  ctx.fillStyle = '#221915';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.7;
  ctx.beginPath();
  ctx.ellipse(0, 0, 19.5, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaggy chin goatee tuft
  ctx.beginPath();
  ctx.moveTo(-6, 15);
  ctx.lineTo(-3, 24);
  ctx.lineTo(0, 20);
  ctx.lineTo(3, 25);
  ctx.lineTo(6, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Puffed-out furry cheeks when blowing out the burning tail ("FÚÚÚ!")
  if (state.cheekPuff > 0.05) {
    const puffR = 6.5 + state.cheekPuff * 5.2;
    ctx.fillStyle = '#2B201B';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;

    // Left big puffed cheek (closest to the burning tail)
    ctx.beginPath();
    ctx.arc(-15.5, 5.5, puffR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy exertion blush on puffed cheek
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.ellipse(-16.5, 4.5, puffR * 0.48, puffR * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right puffed cheek
    ctx.fillStyle = '#2B201B';
    ctx.beginPath();
    ctx.arc(13.5, 5.5, puffR * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // ==========================================================================
  // HUGE GOOGLY ROLLING EYES (Čert koulí velkýma očima!)
  // ==========================================================================
  const drawGooglyEye = (
    ex: number,
    ey: number,
    pdx: number,
    pdy: number,
    isLeft: boolean
  ) => {
    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(state.eyeScaleX, state.eyeScaleY);

    // Oversized bright buttercup-cream sclera so the eye-rolling is super expressive and legible
    ctx.fillStyle = '#FEF9C3';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0 / state.eyeScaleX;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.2, 6.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Subtle motion swirl arc inside sclera during mischievous eye-roll or dizzy phase
    if (
      state.phase === 'mischievous_eye_roll' ||
      state.phase === 'sizzling_extinguish'
    ) {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        4.1,
        state.eyeRollAngleRad + (isLeft ? 0 : 0.6),
        state.eyeRollAngleRad + (isLeft ? 0 : 0.6) + Math.PI * 1.15
      );
      ctx.stroke();
    }

    // Clamped pupil offset so it rolls right along the inner rim of the huge eye
    const clampDx = Math.max(-3.6, Math.min(3.6, pdx));
    const clampDy = Math.max(-3.8, Math.min(3.8, pdy));

    // Glowing ruby-red iris ring
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(clampDx, clampDy, state.pupilRadius + 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Deep ink pupil core
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(clampDx, clampDy, state.pupilRadius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white catchlight glint
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(clampDx - 0.9, clampDy - 0.9, 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Expressive eyebrow above eye
    const browSign = isLeft ? 1 : -1;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4 / state.eyeScaleX;
    ctx.save();
    ctx.translate(0, -7.2 + state.browLiftY / state.eyeScaleY);
    ctx.rotate(((state.browTiltDeg * browSign) * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(-5.5, 0);
    ctx.quadraticCurveTo(0, -2.4, 5.5, 0.5);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  drawGooglyEye(-7.8, -3.5, state.leftPupilDx, state.leftPupilDy, true);
  drawGooglyEye(7.8, -3.5, state.rightPupilDx, state.rightPupilDy, false);

  // Red devilish nose
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 3.2, 3.4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ==========================================================================
  // MOUTH EXPRESSIONS: CHEEKY TONGUE, STARTLED GASP, BLOWING NOZZLE, OR PHEW
  // ==========================================================================
  if (state.mouthMode === 'grin_tongue') {
    // Wide mischievous grin
    ctx.fillStyle = '#7F1D1D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-10, 7.5);
    ctx.quadraticCurveTo(0, 16.5, 10, 7.5);
    ctx.quadraticCurveTo(0, 11.0, -10, 7.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little white devil fangs
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.moveTo(-6.5, 8.5);
    ctx.lineTo(-4.5, 12.2);
    ctx.lineTo(-2.8, 9.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(6.5, 8.5);
    ctx.lineTo(4.5, 12.2);
    ctx.lineTo(2.8, 9.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Long undulating scarlet tongue (čert vyplazuje jazyk)
    if (state.tongueLength > 0.1) {
      const tLen = 15 * state.tongueLength;
      const tWave = Math.sin(t * 8.5) * 3.5;
      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-3.5, 11);
      ctx.bezierCurveTo(-5, 11 + tLen * 0.5, -4 + tWave, 11 + tLen * 0.9, tWave, 12 + tLen);
      ctx.bezierCurveTo(4 + tWave, 11 + tLen * 0.9, 5, 11 + tLen * 0.5, 3.5, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tongue center crease
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 11.5);
      ctx.quadraticCurveTo(tWave * 0.5, 11 + tLen * 0.5, tWave * 0.8, 10 + tLen * 0.8);
      ctx.stroke();
    }
  } else if (state.mouthMode === 'startled_gasp') {
    // Shocked O-mouth gasping at the roaring tail fire!
    ctx.fillStyle = '#7F1D1D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-1, 10.5, 5.5, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Upper & lower teeth in shock
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.roundRect(-4.2, 4.5, 6.4, 2.6, 1);
    ctx.fill();
  } else if (state.mouthMode === 'blowing') {
    // Tightly pursed whistling/blowing lips aimed left toward the burning tail!
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-11.5, 8.2, 3.8, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(-12.5, 8.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Relieved "UF!" smile + shiny blue sweat drop on temple
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-6, 9.5);
    ctx.quadraticCurveTo(0, 13.5, 6, 9.5);
    ctx.stroke();

    // Comic blue sweat droplet on forehead
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(15, -10);
    ctx.bezierCurveTo(12, -4, 12, 1, 15, 1);
    ctx.bezierCurveTo(18, 1, 18, -4, 15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore(); // end head group

  // ==========================================================================
  // 8. RIGHT ARM & HELD PITCHFORK (WHEN NOT PLANTED IN TURF)
  // ==========================================================================
  if (state.pitchforkPlanted <= 0.5) {
    const handX = 24 + Math.sin(t * 2.5) * 2.0;
    const handY = -28 + Math.cos(t * 5.0) * 1.8;

    // Right arm from shoulder (15, -14) to hand
    ctx.strokeStyle = ink;
    ctx.lineWidth = 9.5;
    ctx.beginPath();
    ctx.moveTo(15, -14);
    ctx.quadraticCurveTo(24, -18, handX, handY);
    ctx.stroke();

    ctx.strokeStyle = '#2B201B';
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(15, -14);
    ctx.quadraticCurveTo(24, -18, handX, handY);
    ctx.stroke();

    const forkSwayDeg = -6 + Math.sin(t * 2.5) * 3.5;
    drawIronPitchfork(handX, handY, forkSwayDeg, 0);

    // Clawed devil fist clutching the shaft
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(handX, handY, 5.0, 5.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FAF6ED';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(handX - 3, handY - 3);
    ctx.lineTo(handX + 4, handY - 2);
    ctx.moveTo(handX - 3, handY);
    ctx.lineTo(handX + 4, handY + 1);
    ctx.moveTo(handX - 3, handY + 3);
    ctx.lineTo(handX + 4, handY + 4);
    ctx.stroke();
  }

  ctx.restore(); // end torso group

  // ==========================================================================
  // 9. FORCEFUL WIND GUST STREAMS & COMIC PUFF CLOUDS AIMED AT BURNING TAIL
  // ==========================================================================
  if (state.windBlowPower > 0.08) {
    ctx.save();
    const mouthOriginX = 56 + state.torsoSwayX * 0.6;
    const mouthOriginY = 66 + state.torsoBobY + state.jumpY;
    const targetX = tailTipX + 2;
    const targetY = tailTipY - 10;

    ctx.globalAlpha = Math.min(1, state.windBlowPower * 1.1);

    // 3 streaming sky-blue & cream Ladovské wind lines from pursed lips to tail blaze
    const streamOffsets = [-1, 0, 1];
    for (let i = 0; i < streamOffsets.length; i++) {
      const off = streamOffsets[i];
      const dashOffset = -((t * 95) % 18);
      const midX = (mouthOriginX + targetX) * 0.5 + off * 4;
      const midY = (mouthOriginY + targetY) * 0.5 + off * 7 - 5;
      const endX = targetX - 6 + off * 5;
      const endY = targetY + off * 8;

      // Bold ink under-stroke
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4.2;
      ctx.setLineDash([12, 6]);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.moveTo(mouthOriginX, mouthOriginY + off * 2.5);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      // Sky-blue & cream inner wind stream
      ctx.strokeStyle = i === 1 ? '#FFFDF7' : '#BAE6FD';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(mouthOriginX, mouthOriginY + off * 2.5);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Travelling comic air-puff clouds ("foukání") hitting the tail flame
    for (let c = 0; c < 3; c++) {
      const travel = (t * 2.8 + c * 0.33) % 1;
      const cx = lerp(mouthOriginX - 4, targetX - 4, travel);
      const cy =
        lerp(mouthOriginY, targetY - 4, travel) +
        Math.sin(travel * Math.PI * 2 + c) * 4;
      const cr = 3.2 + travel * 5.2;

      ctx.fillStyle = '#E0F2FE';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Small curling wind spiral at front of puff
      ctx.beginPath();
      ctx.arc(cx - cr * 0.3, cy - cr * 0.2, cr * 0.45, 0, Math.PI * 1.3);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================================
  // 10. PLAYFUL JOSEF LADA FOLK CALLOUT BUBBLE ("JÉMINÁČKU!", "FÚÚÚ!", "UF!")
  // ==========================================================================
  if (state.folkCallout) {
    ctx.save();
    // Positioned safely inside [x: 10..135, y: -24..18] so it never clips top or right edges
    const bubbleX = 56;
    const bubbleY = -12 + Math.sin(t * 14) * 1.8;
    const isPanic = state.folkCallout === 'JÉMINÁČKU!';
    const isBlow = state.folkCallout === 'FÚÚÚ!';
    const bw = isPanic ? 88 : isBlow ? 58 : 44;
    const bh = 22;

    ctx.translate(bubbleX, bubbleY);
    ctx.rotate(
      ((isPanic ? -5 + Math.sin(t * 24) * 2.5 : isBlow ? -4 : 3) * Math.PI) / 180
    );

    // Speech bubble body
    ctx.fillStyle = isPanic ? '#FEF08A' : isBlow ? '#E0F2FE' : '#FAF6ED';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.roundRect(-bw * 0.5, -bh * 0.5, bw, bh, 8);
    ctx.fill();
    ctx.stroke();

    // Pointer triangle toward Čertík's head
    ctx.beginPath();
    ctx.moveTo(4, bh * 0.5 - 1);
    ctx.lineTo(12, bh * 0.5 + 8);
    ctx.lineTo(16, bh * 0.5 - 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bold folk typography inside callout
    ctx.font = "900 11.5px 'Eczar', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isPanic ? '#B91C1C' : ink;
    ctx.fillText(state.folkCallout, 0, 0.5);

    ctx.restore();
  }

  ctx.restore(); // end canvas transform
  return state;
}

/**
 * Authentic Josef Lada title banner inspired directly by his classic book covers,
 * Easter postcard vignettes, and zincography floral motifs ("zinkografie"):
 *
 * Features:
 * - Silky-smooth 60 FPS continuous 2D Canvas animation for Bubák (Scarecrow) on the left
 *   with a mischievous black-and-white crow (vrána šedivka) pestering him, tauntingly
 *   landing on his head, and triggering Bubák's boiling annoyance and angry scream
 * - Silky-smooth 60 FPS continuous 2D Canvas animation for Čertík (Devil) on the right
 *   rolling his huge googly eyes (čert koulí velkýma očima), whose tail suddenly erupts
 *   into a huge roaring flame (ocas náhle začne velice hořet) that he panics and
 *   frantically spins around to blow out (vyděšeně si musí sfouknout svůj ocas)
 * - Zero React re-renders per second during animation for maximum performance
 */
const BUBAKOV_TITLE_LETTERS: readonly {
  char: string;
  x: number;
  badgeColor: string;
  hasCarka?: boolean;
}[] = [
  { char: 'B', x: 256, badgeColor: '#FACC15' },
  { char: 'U', x: 314, badgeColor: '#38BDF8' },
  { char: 'B', x: 372, badgeColor: '#4ADE80' },
  { char: 'A', x: 430, badgeColor: '#FACC15', hasCarka: true },
  { char: 'K', x: 488, badgeColor: '#E11D48' },
  { char: 'O', x: 546, badgeColor: '#38BDF8' },
  { char: 'V', x: 604, badgeColor: '#FACC15' },
];

export const BubakovCoverTitle: React.FC<BubakovCoverTitleProps> = ({
  className = '',
  showCharacters = true,
  showSubtitle = true,
  compact = false,
  interactiveBubak = true,
}) => {
  const headerRef = useRef<HTMLElement | null>(null);
  const starWrapRef = useRef<HTMLDivElement | null>(null);
  const bubakCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const letterGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const letterCarkaRef = useRef<SVGGElement | null>(null);

  const isBubakHoveredRef = useRef<boolean>(false);
  const isCertHoveredRef = useRef<boolean>(false);

  // Timestamps (in animTime seconds) for click-triggered special animations
  const scareStartRef = useRef<number>(-100);
  const certStompStartRef = useRef<number>(-100);
  const starSpinBurstRef = useRef<number>(-100);
  const letterJumpRef = useRef<number[]>([-100, -100, -100, -100, -100, -100, -100]);
  const animTimeRef = useRef<number>(0);

  // Smoothly interpolated hover weights (0..1) to prevent any sudden jumps on mouse enter/leave
  const bubakHoverMixRef = useRef<number>(0);
  const certHoverMixRef = useRef<number>(0);

  useEffect(() => {
    let rafId = 0;
    let isRunning = false;
    let isVisible = true;
    let lastNow = performance.now();

    const syncOneCanvasBackingSize = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.max(180, Math.min(540, Math.round(rect.width * dpr)));
        const targetH = Math.max(200, Math.min(600, Math.round(rect.height * dpr)));
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }
    };

    const syncCanvasBackingSize = () => {
      syncOneCanvasBackingSize(bubakCanvasRef.current);
      syncOneCanvasBackingSize(certCanvasRef.current);
    };

    const renderFastDomAndCanvasFrame = (timeSec: number) => {
      // 1a. Direct 60 FPS 2D Canvas render for Left Bubák & Black-and-White Crow
      const bubakCanvas = bubakCanvasRef.current;
      if (bubakCanvas) {
        const ctx = bubakCanvas.getContext('2d');
        if (ctx) {
          drawBubakAndCrowCoverCanvas(
            ctx,
            bubakCanvas.width,
            bubakCanvas.height,
            timeSec,
            scareStartRef.current,
            bubakHoverMixRef.current
          );
        }
      }

      // 1b. Direct 60 FPS 2D Canvas render for Right Čertík (eye-rolling & burning tail comedy scene)
      const certCanvas = certCanvasRef.current;
      if (certCanvas) {
        const ctx = certCanvas.getContext('2d');
        if (ctx) {
          drawCertCoverCanvas(
            ctx,
            certCanvas.width,
            certCanvas.height,
            timeSec,
            certStompStartRef.current,
            certHoverMixRef.current
          );
        }
      }

      // 2. Direct 60 FPS DOM transform update for the top 5-pointed folk star (zero React re-render)
      const starEl = starWrapRef.current;
      if (starEl) {
        const starBurstElapsed = timeSec - starSpinBurstRef.current;
        const starBurstEnv =
          starBurstElapsed >= 0 && starBurstElapsed < 1.2
            ? Math.sin((starBurstElapsed / 1.2) * Math.PI) * (1 - starBurstElapsed / 1.2)
            : 0;
        const starAngleDeg = timeSec * 38 + Math.sin(timeSec * 2.6) * 18 + starBurstEnv * 360;
        const starScale = 1 + Math.sin(timeSec * 3.4) * 0.09 + starBurstEnv * 0.28;
        starEl.style.transform = `rotate(${starAngleDeg.toFixed(1)}deg) scale(${starScale.toFixed(3)})`;
      }

      // 3. Direct 60 FPS DOM transform update for B-U-B-Á-K-O-V letters (zero React re-render)
      for (let idx = 0; idx < BUBAKOV_TITLE_LETTERS.length; idx++) {
        const gEl = letterGroupRefs.current[idx];
        if (!gEl) continue;
        const item = BUBAKOV_TITLE_LETTERS[idx];
        const wavePhase = timeSec * 3.2 - idx * 0.62;
        const jumpElapsed = timeSec - (letterJumpRef.current[idx] ?? -100);
        const jumpEnv =
          jumpElapsed >= 0 && jumpElapsed < 0.75
            ? Math.sin((jumpElapsed / 0.75) * Math.PI)
            : 0;

        const dy = Math.sin(wavePhase) * 4.2 - jumpEnv * 11;
        const rot =
          Math.cos(wavePhase * 0.85) * 3.6 +
          Math.sin(jumpElapsed * 18) * jumpEnv * 10;
        const scale = 1 + Math.max(0, Math.sin(wavePhase)) * 0.045 + jumpEnv * 0.14;

        gEl.setAttribute(
          'transform',
          `translate(${item.x}, ${(114 + dy).toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${scale.toFixed(3)})`
        );

        if (item.hasCarka && letterCarkaRef.current) {
          letterCarkaRef.current.setAttribute(
            'transform',
            `translate(-16, ${(-72 + Math.sin(wavePhase - 0.5) * 2.2).toFixed(2)}) rotate(${(Math.cos(wavePhase - 0.4) * 5).toFixed(2)}, 20, 10)`
          );
        }
      }
    };

    syncCanvasBackingSize();
    renderFastDomAndCanvasFrame(animTimeRef.current);

    const tick = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      animTimeRef.current += dt;
      const t = animTimeRef.current;

      // Smooth exponential damping for hover states
      const targetBubakHover = isBubakHoveredRef.current ? 1 : 0;
      const targetCertHover = isCertHoveredRef.current ? 1 : 0;
      const lerpFactor = 1 - Math.exp(-dt * 7);
      bubakHoverMixRef.current += (targetBubakHover - bubakHoverMixRef.current) * lerpFactor;
      certHoverMixRef.current += (targetCertHover - certHoverMixRef.current) * lerpFactor;

      renderFastDomAndCanvasFrame(t);

      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isRunning) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!isVisible) return;
      isRunning = true;
      lastNow = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!isRunning) return;
      isRunning = false;
      cancelAnimationFrame(rafId);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && headerRef.current) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry ? entry.isIntersecting : true;
          if (isVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.01 }
      );
      intersectionObserver.observe(headerRef.current);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        syncCanvasBackingSize();
        renderFastDomAndCanvasFrame(animTimeRef.current);
      });
      if (bubakCanvasRef.current) resizeObserver.observe(bubakCanvasRef.current);
      if (certCanvasRef.current) resizeObserver.observe(certCanvasRef.current);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    startLoop();

    return () => {
      stopLoop();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [showCharacters]);

  const triggerLetterJump = (idx: number) => {
    letterJumpRef.current[idx] = animTimeRef.current;
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    starSpinBurstRef.current = animTimeRef.current;
    try {
      sound.caneWhip();
    } catch {}
  };

  // Click on Bubák 2D Canvas: trigger annoyed windup + furious angry scream & startled crow!
  const handleBubakClick = (e: React.MouseEvent) => {
    if (!interactiveBubak) return;
    e.stopPropagation();

    try {
      sound.caneWhip();
      window.setTimeout(() => {
        try {
          sound.roar();
        } catch {}
      }, 140);
    } catch {}

    scareStartRef.current = animTimeRef.current;
  };

  // Click on Čert 2D Canvas: ignite roaring tail blaze & frantic tail-chasing blow-out comedy!
  const handleCertClick = (e: React.MouseEvent) => {
    if (!interactiveBubak) return;
    e.stopPropagation();

    try {
      sound.heavyHit();
      window.setTimeout(() => {
        try {
          sound.slash();
        } catch {}
      }, 110);
    } catch {}

    certStompStartRef.current = animTimeRef.current;
  };

  const staticStarGraphic = useMemo(
    () => (
      <LadaCanvasSvg
        width={32}
        height={32}
        viewBox="0 0 40 40"
        aria-label="Ladovská pouťová hvězdička"
      >
        <g className="lada-anim-pulse">
          {/* Warm golden village sun-rays behind the star */}
          <polygon
            points="20,0 23,12 35,5 28,16 40,20 28,24 35,35 23,28 20,40 17,28 5,35 12,24 0,20 12,16 5,5 17,12"
            fill="#FACC15"
            stroke="#1C1610"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Ink outer outline & Bright Poppy Vermilion star body */}
          <polygon
            points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14"
            fill="#E6392B"
            stroke="#1C1610"
            strokeWidth="3.0"
            strokeLinejoin="round"
          />
          {/* Inner warm cream & gold folk highlight */}
          <polygon
            points="20,7 23,15 32,16 25,22 27,31 20,26 13,31 15,22 8,16 17,15"
            fill="#FACC15"
            stroke="#FFFDF7"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Center cornflower blue folk cabochon */}
          <circle cx="20" cy="21" r="3.6" fill="#2563EB" stroke="#1C1610" strokeWidth="1.4" />
          <circle cx="19" cy="20" r="1.2" fill="#FFFDF7" className="lada-anim-glint" />
        </g>
      </LadaCanvasSvg>
    ),
    []
  );

  return (
    <header
      ref={headerRef}
      className={`bubakov-cover-header relative select-none w-full box-border flex flex-col items-center justify-center my-0.5 sm:my-1 overflow-visible ${className}`}
    >
      {/* Hand-drawn 2D Canvas 5-pointed folk star with playful spin & twinkle */}
      <div
        ref={starWrapRef}
        className="my-0.5 cursor-pointer will-change-transform"
        onClick={handleStarClick}
        title="Ladovská pouťová hvězdička (klikni pro zatočení!)"
        style={{
          transform: 'rotate(0deg) scale(1)',
        }}
      >
        {staticStarGraphic}
      </div>

      {/* Main Illustration & Typography Stage (viewBox="-20 -48 900 252" prevents any edge cropping on mobile or desktop) */}
      <div className="relative w-full max-w-[840px] px-1 sm:px-3 box-border flex items-center justify-center">
        <div className="relative w-full aspect-[900/252]">
          <svg
            viewBox="-20 -48 900 252"
            className="w-full h-full overflow-visible block"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Bubákov - Ladovská výprava"
          >
          <defs>
            {/* Bright Poppy Vermilion & Buttercup Gold hatched folk fill pattern */}
            <pattern
              id="folk-red-hatch"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="10" height="10" fill="#E6392B" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#FEF08A" strokeWidth="2.6" />
            </pattern>

            {/* GPU-composited CSS animations for folk floral stems & rosettes (zero React re-renders!) */}
            <style>{`
              @keyframes ladaStemSwayLeft {
                0%, 100% { transform: rotate(-2.8deg); }
                50% { transform: rotate(2.8deg); }
              }
              @keyframes ladaStemSwayRight {
                0%, 100% { transform: rotate(2.8deg); }
                50% { transform: rotate(-2.8deg); }
              }
              @keyframes ladaRosettePulse {
                0%, 100% { transform: rotate(-8deg) scale(0.96); }
                50% { transform: rotate(8deg) scale(1.05); }
              }
              .lada-stem-sway-l {
                transform-origin: 174px 166px;
                animation: ladaStemSwayLeft 3.2s ease-in-out infinite;
              }
              .lada-stem-sway-r {
                transform-origin: 686px 166px;
                animation: ladaStemSwayRight 3.2s ease-in-out infinite;
              }
              .lada-rosette-pulse {
                transform-box: fill-box;
                transform-origin: center;
                animation: ladaRosettePulse 2.8s ease-in-out infinite;
              }
            `}</style>
          </defs>

          {/* Pale Sage Green Watercolor Meadow Contour (like the book cover wash) */}
          <path
            d="M 160,50 Q 240,25 360,40 Q 480,20 620,35 Q 720,60 690,130 Q 640,165 480,165 Q 320,165 180,150 Q 130,110 160,50 Z"
            fill="#D5E3C9"
            fillOpacity="0.5"
          />

          {/* Josef Lada Vignette Frame / Cartouche */}
          <rect
            x="180"
            y="18"
            width="500"
            height="154"
            rx="24"
            ry="24"
            fill="#FAF6ED"
            stroke="#1C1610"
            strokeWidth="3.6"
          />
          {/* Inner double border line */}
          <rect
            x="188"
            y="26"
            width="484"
            height="138"
            rx="18"
            ry="18"
            fill="#FFFDF8"
            fillOpacity="0.65"
            stroke="#1C1610"
            strokeWidth="1.6"
          />

          {/* ============================================================== */}
          {/* LEFT FOLK FLORAL STEM (BREEZE-SWAYING & BLOOMING)              */}
          {/* ============================================================== */}
          <g id="ribbon-streamer-left" className="lada-stem-sway-l">
            <path
              d="M 174,166 Q 170,118 174,74 Q 178,50 176,30"
              stroke="#1C1610"
              strokeWidth="5.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 174,166 Q 170,118 174,74 Q 178,50 176,30"
              stroke="#FACC15"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <g transform="translate(167, 148)">
              <g className="lada-rosette-pulse">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -2.2,-2.6 -2.4,-5.6 0,-6.2 C 2.4,-5.6 2.2,-2.6 0,0 Z"
                    fill="#38BDF8"
                    stroke="#1C1610"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="2.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
              </g>
            </g>
            <g transform="translate(182, 94)">
              <g className="lada-rosette-pulse">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -2,-2.4 -2.2,-5.2 0,-5.7 C 2.2,-5.2 2,-2.4 0,0 Z"
                    fill="#FACC15"
                    stroke="#1C1610"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="2.0" fill="#E6392B" stroke="#1C1610" strokeWidth="1" />
              </g>
            </g>
            <g>
              <path
                d="M 174,142 C 182,142 186,126 178,118 C 172,113 170,127 174,142 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 174,138 C 177,132 179,127 180,122" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g>
              <path
                d="M 173,108 C 167,101 163,112 169,120 C 174,124 176,116 173,108 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 173,111 C 171,114 169,116 167,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
            <g>
              <path
                d="M 174,82 C 182,80 186,66 178,58 C 172,54 170,66 174,82 Z"
                fill="#16A34A"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 174,78 C 177,72 179,66 180,62" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g transform="translate(176, 28)">
              <g className="lada-rosette-pulse">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -5,-6 -5,-13 0,-14 C 5,-13 5,-6 0,0 Z"
                    fill="#E11D48"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="5.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.8" />
                <circle cx="-1.2" cy="-1.2" r="1.4" fill="#FFFDF7" />
              </g>
            </g>
          </g>

          {/* ============================================================== */}
          {/* RIGHT FOLK FLORAL STEM (BREEZE-SWAYING & BLOOMING)             */}
          {/* ============================================================== */}
          <g id="ribbon-streamer-right" className="lada-stem-sway-r">
            <path
              d="M 686,166 Q 690,118 686,74 Q 682,50 684,30"
              stroke="#1C1610"
              strokeWidth="5.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 686,166 Q 690,118 686,74 Q 682,50 684,30"
              stroke="#FACC15"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <g transform="translate(693, 148)">
              <g className="lada-rosette-pulse">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -2.2,-2.6 -2.4,-5.6 0,-6.2 C 2.4,-5.6 2.2,-2.6 0,0 Z"
                    fill="#38BDF8"
                    stroke="#1C1610"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="2.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
              </g>
            </g>
            <g transform="translate(678, 94)">
              <g className="lada-rosette-pulse">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -2,-2.4 -2.2,-5.2 0,-5.7 C 2.2,-5.2 2,-2.4 0,0 Z"
                    fill="#FACC15"
                    stroke="#1C1610"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="2.0" fill="#E6392B" stroke="#1C1610" strokeWidth="1" />
              </g>
            </g>
            <g>
              <path
                d="M 686,142 C 678,142 674,126 682,118 C 688,113 690,127 686,142 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 686,138 C 683,132 681,127 680,122" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g>
              <path
                d="M 687,108 C 693,101 697,112 691,120 C 686,124 684,116 687,108 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 687,111 C 689,114 691,116 693,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
            <g>
              <path
                d="M 686,82 C 678,80 674,66 682,58 C 688,54 690,66 686,82 Z"
                fill="#16A34A"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 686,78 C 683,72 681,66 680,62" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g transform="translate(684, 28)">
              <g className="lada-rosette-pulse">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -5,-6 -5,-13 0,-14 C 5,-13 5,-6 0,0 Z"
                    fill="#E11D48"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="5.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.8" />
                <circle cx="-1.2" cy="-1.2" r="1.4" fill="#FFFDF7" />
              </g>
            </g>
          </g>

          {/* ============================================================== */}
          {/* AUTHENTIC JOSEF LADA YELLOW CORNER FLOWERS                     */}
          {/* ============================================================== */}
          <g id="lada-cartouche-corner-flowers">
            {[
              { x: 204, y: 40, rot: -15, prefix: 'tl', petal: '#FACC15', core: '#F59E0B', budPetal: '#38BDF8', budDx: 15, budDy: 5 },
              { x: 656, y: 40, rot: 15, prefix: 'tr', petal: '#FACC15', core: '#F59E0B', budPetal: '#38BDF8', budDx: -15, budDy: 5 },
              { x: 204, y: 150, rot: -45, prefix: 'bl', petal: '#E11D48', core: '#FACC15', budPetal: '#FACC15', budDx: 15, budDy: -5 },
              { x: 656, y: 150, rot: 45, prefix: 'br', petal: '#E11D48', core: '#FACC15', budPetal: '#FACC15', budDx: -15, budDy: -5 },
            ].map((corner) => (
              <g key={corner.prefix} transform={`translate(${corner.x}, ${corner.y})`}>
                <g>
                  <path
                    d="M 0,0 C -10,-6 -20,-4 -18,4 C -16,10 -7,8 0,0 Z"
                    fill="#22C55E"
                    stroke="#1C1610"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M 0,0 C 10,-6 20,-4 18,4 C 16,10 7,8 0,0 Z"
                    fill="#4ADE80"
                    stroke="#1C1610"
                    strokeWidth="1.8"
                  />
                </g>
                <g transform={`translate(${corner.budDx}, ${corner.budDy})`}>
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <path
                      key={deg}
                      transform={`rotate(${deg})`}
                      d="M 0,0 C -2.4,-2.8 -2.6,-6 0,-6.6 C 2.6,-6 2.4,-2.8 0,0 Z"
                      fill={corner.budPetal}
                      stroke="#1C1610"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  ))}
                  <circle cx="0" cy="0" r="2.3" fill="#E6392B" stroke="#1C1610" strokeWidth="1.1" />
                </g>
                <g transform={`rotate(${corner.rot})`} className="lada-rosette-pulse">
                  {[0, 72, 144, 216, 288].map((angle, idx) => (
                    <path
                      key={`${corner.prefix}-${idx}`}
                      transform={`rotate(${angle})`}
                      d="M 0,0 C -7,-7 -8,-17 0,-19 C 8,-17 7,-7 0,0 Z"
                      fill={corner.petal}
                      stroke="#1C1610"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />
                  ))}
                  {[0, 72, 144, 216, 288].map((angle, idx) => (
                    <path
                      key={`${corner.prefix}-hi-${idx}`}
                      transform={`rotate(${angle})`}
                      d="M 0,-3 C -3.2,-6.5 -3.2,-12.5 0,-14 C 3.2,-12.5 3.2,-6.5 0,-3 Z"
                      fill="#FFFDF7"
                      opacity="0.82"
                    />
                  ))}
                  <circle cx="0" cy="0" r="7.2" fill={corner.core} stroke="#1C1610" strokeWidth="2" />
                  <circle cx="0" cy="0" r="1.1" fill="#1C1610" />
                  <circle cx="0" cy="-3.2" r="0.8" fill="#1C1610" />
                  <circle cx="3" cy="-1" r="0.8" fill="#1C1610" />
                  <circle cx="1.9" cy="2.5" r="0.8" fill="#1C1610" />
                  <circle cx="-1.9" cy="2.5" r="0.8" fill="#1C1610" />
                  <circle cx="-3" cy="-1" r="0.8" fill="#1C1610" />
                </g>
              </g>
            ))}
          </g>

          {/* ============================================================== */}
          {/* MAIN LETTERING: "BUBÁKOV" (ANIMATED FOLK WAVE LETTERS)         */}
          {/* ============================================================== */}
          <g id="bubakov-word-group">
            <title>BUBÁKOV</title>
            {/* Author label above title */}
            <text
              x="430"
              y="50"
              textAnchor="middle"
              fill="#7A4B27"
              stroke="#FAF5E8"
              strokeWidth="0.8"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "5px",
              }}
            >
              • JOS. LADA • BUBÁCI A HASTRMANI •
            </text>

            {/* Individually animated B-U-B-Á-K-O-V letters updated at 60 FPS via direct DOM refs */}
            {BUBAKOV_TITLE_LETTERS.map((item, idx) => (
              <g
                key={idx}
                ref={(el) => {
                  letterGroupRefs.current[idx] = el;
                }}
                className="cursor-pointer"
                transform={`translate(${item.x}, 114)`}
                onMouseEnter={() => triggerLetterJump(idx)}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerLetterJump(idx);
                  try {
                    sound.caneWhip();
                  } catch {}
                }}
              >
                {/* Deep black 3D ink shadow offset */}
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fill="#1C1610"
                  stroke="#1C1610"
                  strokeWidth="11"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    fontFamily: "'Eczar', serif",
                    fontSize: '76px',
                    fontWeight: 900,
                  }}
                >
                  {item.char}
                </text>

                {/* Vibrant Poppy Vermilion & Buttercup Gold folk hatched main fill */}
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="url(#folk-red-hatch)"
                  stroke="#FFFDF7"
                  strokeWidth="2.5"
                  style={{
                    fontFamily: "'Eczar', serif",
                    fontSize: '76px',
                    fontWeight: 900,
                  }}
                >
                  {item.char}
                </text>

                {/* Inner inline warm cream folk contour / pinstripe */}
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="none"
                  stroke="#FFFDF7"
                  strokeWidth="1.2"
                  strokeDasharray="12 3"
                  style={{
                    fontFamily: "'Eczar', serif",
                    fontSize: '76px',
                    fontWeight: 900,
                  }}
                >
                  {item.char}
                </text>

                {/* Hand-drawn Czech acute accent (čárka) on 'Á' with playful secondary follow-through */}
                {item.hasCarka && (
                  <g
                    ref={letterCarkaRef}
                    transform="translate(-16, -72)"
                  >
                    <polygon
                      points="10,16 26,2 32,4 16,20"
                      fill="#1C1610"
                      stroke="#1C1610"
                      strokeWidth="4.5"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="10,16 26,2 32,4 16,20"
                      fill="#FACC15"
                      stroke="#FFFDF7"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <line x1="14" y1="16" x2="26" y2="5" stroke="#E6392B" strokeWidth="1.6" />
                  </g>
                )}
              </g>
            ))}
          </g>

          {/* ============================================================== */}
          {/* CLEAN BASELINE FOLK ORNAMENT UNDER TITLE (SWAYING & BLOOMING)  */}
          {/* ============================================================== */}
          <g id="bubakov-sub-ornament" transform="translate(430, 148)">
            {/* Left sprig branch with animated folk flowers & breathing leaves */}
            <g className="lada-rosette-pulse">
              <line x1="-102" y1="0" x2="-22" y2="0" stroke="#1C1610" strokeWidth="2.4" />
              <line x1="-102" y1="0" x2="-22" y2="0" stroke="#FACC15" strokeWidth="1.3" strokeDasharray="4 2" />
              {/* Breathing green meadow leaves */}
              <path
                d="M -58,0 C -62,-7 -70,-6 -68,0 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="1.3"
              />
              <path
                d="M -38,0 C -42,7 -50,6 -48,0 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="1.3"
              />
              {/* Animated Cornflower Blue flower at x=-78 */}
              <g transform="translate(-78, 0)">
                <g className="lada-rosette-pulse">
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <path
                      key={deg}
                      transform={`rotate(${deg})`}
                      d="M 0,0 C -2,-2.3 -2.2,-4.8 0,-5.3 C 2.2,-4.8 2,-2.3 0,0 Z"
                      fill="#38BDF8"
                      stroke="#1C1610"
                      strokeWidth="1.1"
                    />
                  ))}
                  <circle cx="0" cy="0" r="1.9" fill="#FACC15" stroke="#1C1610" strokeWidth="0.95" />
                </g>
              </g>
              {/* Animated Carmine Rose flower at tip x=-104 */}
              <g transform="translate(-104, 0)">
                <g className="lada-rosette-pulse">
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <path
                      key={deg}
                      transform={`rotate(${deg})`}
                      d="M 0,0 C -2.2,-2.8 -2.4,-6 0,-6.5 C 2.4,-6 2.2,-2.8 0,0 Z"
                      fill="#E11D48"
                      stroke="#1C1610"
                      strokeWidth="1.15"
                    />
                  ))}
                  <circle cx="0" cy="0" r="2.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
                </g>
              </g>
            </g>

            {/* Central spinning golden & poppy folk flower rosette */}
            <g className="lada-rosette-pulse">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -3.2,-3.8 -3.6,-8.6 0,-9.4 C 3.6,-8.6 3.2,-3.8 0,0 Z"
                  fill="#E6392B"
                  stroke="#1C1610"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="4.6" fill="#FACC15" stroke="#1C1610" strokeWidth="1.6" />
              <circle cx="0" cy="0" r="1.4" fill="#1C1610" />
            </g>

            {/* Right sprig branch with animated folk flowers & breathing leaves */}
            <g className="lada-rosette-pulse">
              <line x1="22" y1="0" x2="102" y2="0" stroke="#1C1610" strokeWidth="2.4" />
              <line x1="22" y1="0" x2="102" y2="0" stroke="#FACC15" strokeWidth="1.3" strokeDasharray="4 2" />
              {/* Breathing green meadow leaves */}
              <path
                d="M 58,0 C 62,-7 70,-6 68,0 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="1.3"
              />
              <path
                d="M 38,0 C 42,7 50,6 48,0 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="1.3"
              />
              {/* Animated Cornflower Blue flower at x=78 */}
              <g transform="translate(78, 0)">
                <g className="lada-rosette-pulse">
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <path
                      key={deg}
                      transform={`rotate(${deg})`}
                      d="M 0,0 C -2,-2.3 -2.2,-4.8 0,-5.3 C 2.2,-4.8 2,-2.3 0,0 Z"
                      fill="#38BDF8"
                      stroke="#1C1610"
                      strokeWidth="1.1"
                    />
                  ))}
                  <circle cx="0" cy="0" r="1.9" fill="#FACC15" stroke="#1C1610" strokeWidth="0.95" />
                </g>
              </g>
              {/* Animated Carmine Rose flower at tip x=104 */}
              <g transform="translate(104, 0)">
                <g className="lada-rosette-pulse">
                  {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <path
                      key={deg}
                      transform={`rotate(${deg})`}
                      d="M 0,0 C -2.2,-2.8 -2.4,-6 0,-6.5 C 2.4,-6 2.2,-2.8 0,0 Z"
                      fill="#E11D48"
                      stroke="#1C1610"
                      strokeWidth="1.15"
                    />
                  ))}
                  <circle cx="0" cy="0" r="2.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
                </g>
              </g>
            </g>
          </g>
          </svg>

          {/* 2D Canvas Animation of Scarecrow/Bubák & Pestering Black-and-White Crow next to Headline */}
          {showCharacters && (
            <>
              <canvas
                ref={bubakCanvasRef}
                id="lada-cover-strasak"
                data-testid="bubak-crow-canvas"
                width={225}
                height={252}
                onClick={handleBubakClick}
                onMouseEnter={() => {
                  isBubakHoveredRef.current = true;
                }}
                onMouseLeave={() => {
                  isBubakHoveredRef.current = false;
                }}
                title="Strašák Bubák a strakatá vrána šedivka (klikni pro rozzuřený křik a odehnání vrány!)"
                aria-label="Strašák Bubák a strakatá vrána šedivka"
                className="absolute cursor-pointer select-none pointer-events-auto"
                style={{
                  left: '0%',
                  top: '0%',
                  width: '25%',
                  height: '100%',
                }}
              />
              <canvas
                ref={certCanvasRef}
                id="lada-cover-cert"
                data-testid="cert-tail-fire-canvas"
                width={225}
                height={252}
                onClick={handleCertClick}
                onMouseEnter={() => {
                  isCertHoveredRef.current = true;
                }}
                onMouseLeave={() => {
                  isCertHoveredRef.current = false;
                }}
                title="Rozpustilý čertík koulí velkýma očima a sfoukává hořící ocas (klikni pro vzplanutí a hašení ocasu!)"
                aria-label="Čertík s hořícím ocasem"
                className="absolute cursor-pointer select-none pointer-events-auto"
                style={{
                  left: '75%',
                  top: '0%',
                  width: '25%',
                  height: '100%',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Subtitle in authentic Czech storybook typography */}
      {showSubtitle && (
        <p
          className="text-center px-4 text-xs sm:text-sm md:text-base font-bold text-amber-950 max-w-[720px] my-1"
          style={{
            fontFamily: "'Eczar', serif",
            lineHeight: '1.35',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          Česká vesnice, kde se nezbední bubáci zklidní poctivým výpraskem nebo je usmíří voňavá pečená buchta.
        </p>
      )}

      {/* Iconic Scalloped Folk Frieze (Lada Scallops) */}
      <LadaFrieze repeatCount={compact ? 14 : 22} height={compact ? 18 : 22} />
    </header>
  );
};
