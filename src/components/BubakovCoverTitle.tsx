import React, { useState, useEffect, useRef } from 'react';
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

/**
 * Authentic Josef Lada title banner inspired directly by his classic book covers,
 * Easter postcard vignettes, and zincography floral motifs ("zinkografie"):
 *
 * Features:
 * - Silky-smooth 60 FPS continuous procedural animation (zero jerky step transitions)
 * - Bubák (Scarecrow) on the left with natural wind-swaying burlap sleeves, breathing torso,
 *   foliage skirt follow-through, smooth eye tracking, and continuous toothy maw opening/chomping
 * - Čertík (Devil) on the right with grounded two-joint goat legs (zero detached/falling legs),
 *   proper two-segment right arm gripping and thrusting the iron pitchfork naturally,
 *   and world-space vertically rising fire & multi-puff smoke trail independent of tail rotation
 * - Clear, unobstructed monumental "BUBÁKOV" typography with Lada scalloped frieze border underneath
 */
export const BubakovCoverTitle: React.FC<BubakovCoverTitleProps> = ({
  className = '',
  showCharacters = true,
  showSubtitle = true,
  compact = false,
  interactiveBubak = true,
}) => {
  const [animTime, setAnimTime] = useState<number>(0);
  const [isBubakHovered, setIsBubakHovered] = useState<boolean>(false);
  const [isCertHovered, setIsCertHovered] = useState<boolean>(false);

  // Timestamps (in animTime seconds) for click-triggered special animations
  const scareStartRef = useRef<number>(-100);
  const certStompStartRef = useRef<number>(-100);
  const starSpinBurstRef = useRef<number>(-100);
  const letterJumpRef = useRef<number[]>([-100, -100, -100, -100, -100, -100, -100]);
  const animTimeRef = useRef<number>(0);

  // Smoothly interpolated hover weights (0..1) to prevent any sudden jumps on mouse enter/leave
  const bubakHoverMixRef = useRef<number>(0);
  const certHoverMixRef = useRef<number>(0);

  // Delayed tail tip coordinates for realistic trailing smoke puffs in world space
  const tailHistoryRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 86 },
    { x: 10, y: 86 },
    { x: 10, y: 86 },
    { x: 10, y: 86 },
    { x: 10, y: 86 },
    { x: 10, y: 86 },
  ]);

  useEffect(() => {
    let rafId: number;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      animTimeRef.current += dt;
      const t = animTimeRef.current;

      // Smooth exponential damping for hover states
      const targetBubakHover = isBubakHovered ? 1 : 0;
      const targetCertHover = isCertHovered ? 1 : 0;
      const lerpFactor = 1 - Math.exp(-dt * 7);
      bubakHoverMixRef.current += (targetBubakHover - bubakHoverMixRef.current) * lerpFactor;
      certHoverMixRef.current += (targetCertHover - certHoverMixRef.current) * lerpFactor;

      setAnimTime(t);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [showCharacters, isBubakHovered, isCertHovered]);

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

  // Click on Bubák: smooth scare reaction ("BAF!") + sound
  const handleBubakClick = (e: React.MouseEvent) => {
    if (!interactiveBubak) return;
    e.stopPropagation();

    try {
      sound.caneWhip();
    } catch {}

    scareStartRef.current = animTimeRef.current;
  };

  // Click on Čert: smooth hoof stomp & pitchfork jab reaction + sounds
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

  // ============================================================================
  // 1. CONTINUOUS BUBÁK KINEMATICS (60 FPS, ZERO DISCRETE JUMPS)
  // ============================================================================
  const t = animTime;
  const bHover = bubakHoverMixRef.current;

  // Scare reaction envelope (duration ~1.65s after click)
  const scareElapsed = t - scareStartRef.current;
  const isScaringActive = scareElapsed >= 0 && scareElapsed < 1.65;
  // Smooth bell curve with quick attack and gentle decay
  const scareEnv = isScaringActive
    ? Math.sin(Math.min(1, scareElapsed / 0.28) * (Math.PI / 2)) *
      Math.pow(Math.max(0, 1 - Math.max(0, scareElapsed - 0.28) / 1.37), 1.6)
    : 0;
  // Chomp wave during the second half of scare
  const scareChompWave = isScaringActive && scareElapsed > 0.55
    ? Math.sin((scareElapsed - 0.55) * 14) * Math.exp(-(scareElapsed - 0.55) * 2.5)
    : 0;

  // Idle theatrical cycle (~4.2s period, slightly livelier on hover)
  const bPhase = t * (1.5 + bHover * 0.35);
  const bSlow = t * 0.85;

  // Whole character subtle scale & lift on scare/hover
  const bubakRootScale = 1 + bHover * 0.025 + scareEnv * 0.065;
  const bubakRootLiftY = -bHover * 1 - scareEnv * 3;

  // Torso breathing & sway (anchored to wooden pole)
  const bubakTorsoX = Math.sin(bPhase) * 1.4 - scareEnv * 0.5;
  const bubakTorsoY = Math.sin(bPhase * 2) * 0.9 - scareEnv * 1.8;
  const bubakTorsoRot = Math.sin(bPhase) * 2.2 + Math.sin(t * 18) * scareEnv * 2.5;
  const bubakTorsoScaleX = 1 + Math.sin(bPhase * 2) * 0.018 + scareEnv * 0.045;
  const bubakTorsoScaleY = 1 - Math.sin(bPhase * 2) * 0.014 + scareEnv * 0.025;

  // Frond skirt secondary follow-through (delayed phase so it sways like real foliage)
  const bubakSkirtRot = Math.sin(bPhase - 0.55) * 3.2 + Math.sin(t * 14) * scareEnv * 3.0;

  // Scarecrow arms (flared sleeves anchored at shoulders 68,74 and 100,74)
  const bubakLeftArmAngle =
    Math.sin(bPhase - 0.2) * 11 +
    Math.cos(bSlow * 1.7) * 4 -
    bHover * 5 -
    scareEnv * 22 +
    Math.sin(t * 20) * scareEnv * 6;
  const bubakRightArmAngle =
    Math.sin(bPhase + 0.3) * 11 -
    Math.cos(bSlow * 1.7) * 4 +
    bHover * 5 +
    scareEnv * 22 -
    Math.sin(t * 20) * scareEnv * 6;

  // Shredded cuff flutter at sleeve ends
  const bubakLeftCuffFlutter = Math.sin(t * 4.2) * 4 + Math.sin(t * 24) * scareEnv * 8;
  const bubakRightCuffFlutter = Math.cos(t * 4.5) * 4 - Math.sin(t * 24) * scareEnv * 8;

  // Burlap Head (anchored at neck 84,68)
  const bubakHeadX = Math.sin(bPhase + 0.2) * 2.0;
  const bubakHeadY = Math.cos(bPhase * 2) * 1.2 - scareEnv * 2.2;
  const bubakHeadRot = Math.sin(bPhase - 0.15) * 5.2 + Math.sin(t * 22) * scareEnv * 4.5;
  const bubakHeadScale = 1 + Math.max(0, Math.sin(bPhase)) * 0.03 + scareEnv * 0.08;

  // Eyes & Pupils (smooth scanning gaze + wide scare eyes)
  const bubakPupilDx = Math.sin(bSlow * 1.4) * 2.3 * (1 - scareEnv * 0.7);
  const bubakPupilDy = Math.cos(bSlow * 1.1) * 1.1 * (1 - scareEnv * 0.7);
  const bubakEyeSquintL = 0.94 + Math.sin(bPhase + 0.8) * 0.08 + scareEnv * 0.18;
  const bubakEyeScaleR = 0.97 + Math.cos(bPhase) * 0.06 + scareEnv * 0.16;
  const bubakBrowDy = Math.cos(bPhase) * 1.1 - scareEnv * 2.0;

  // Continuous Mouth Opening (0.18 = closed zipper teeth, 1.0 = normal open maw, 1.45 = giant BAF!)
  const idleMouthWave = 0.72 + Math.sin(bPhase) * 0.32 + Math.cos(bPhase * 2) * 0.15;
  const bubakMouthOpen = Math.max(
    0.16,
    Math.min(1.48, idleMouthWave + scareEnv * 0.65 + scareChompWave * 0.45)
  );
  const bubakMouthScaleX = 0.96 + (bubakMouthOpen - 0.7) * 0.22 + scareEnv * 0.12;
  const bubakMouthRot = Math.sin(bPhase * 0.7) * 2.2;

  // ============================================================================
  // 2. CONTINUOUS ČERT KINEMATICS (GROUNDED LEGS, NATURAL PITCHFORK, INDEPENDENT FIRE & SMOKE)
  // ============================================================================
  const cHover = certHoverMixRef.current;

  // Click stomp & pitchfork thrust envelope (duration ~1.6s)
  const stompElapsed = t - certStompStartRef.current;
  const isStompClickActive = stompElapsed >= 0 && stompElapsed < 1.6;

  // Periodic natural devilish stomp-and-jab cycle every ~5.2s + immediate on click
  const periodicCycle = (t * 0.95) % 5.2;
  // Windup (lift leg & pull pitchfork back) -> Strike (stomp hoof & jab pitchfork) -> Recover
  let actionWindup = 0;
  let actionStrike = 0;

  if (isStompClickActive) {
    // Immediate responsive windup (0..0.18s) then powerful stomp & thrust (0.18..0.85s) then smooth settle
    if (stompElapsed < 0.18) {
      actionWindup = Math.sin((stompElapsed / 0.18) * (Math.PI / 2));
    } else if (stompElapsed < 0.42) {
      const p = (stompElapsed - 0.18) / 0.24;
      actionWindup = Math.cos(p * (Math.PI / 2));
      actionStrike = Math.sin(p * (Math.PI / 2));
    } else {
      const p = Math.min(1, (stompElapsed - 0.42) / 1.18);
      actionStrike = Math.pow(1 - p, 2.2);
    }
  } else if (periodicCycle > 3.2 && periodicCycle < 4.7) {
    const localT = periodicCycle - 3.2; // 0 .. 1.5s
    if (localT < 0.45) {
      actionWindup = Math.sin((localT / 0.45) * Math.PI);
    }
    if (localT >= 0.32 && localT < 1.35) {
      const sp = (localT - 0.32) / 1.03;
      actionStrike = Math.sin(sp * Math.PI) * Math.pow(1 - sp * 0.6, 1.4);
    }
  }

  const cBreath = t * (2.3 + cHover * 0.4);
  const certRootScale = 1 + cHover * 0.025 + actionStrike * 0.04;

  // Pelvis / Torso vertical bounce & lean:
  // Notice: hipBobY is modest (-2.5px to +3.5px) so the standing left leg stays 100% planted on the ground
  // and the hips NEVER detach from the legs!
  const hipBobY =
    Math.sin(cBreath * 2) * 1.6 +
    actionWindup * 2.5 -
    actionStrike * 2.2;
  const torsoSwayX =
    Math.sin(cBreath) * 1.2 +
    actionWindup * 1.8 -
    actionStrike * 3.8; // Leans left (towards center/viewer) when jabbing pitchfork!
  const torsoTiltDeg =
    Math.sin(cBreath) * 1.8 +
    actionWindup * 3.5 -
    actionStrike * 5.5;

  // --- TWO-JOINT GOAT LEGS (100% ATTACHED TO PELVIS, ZERO FALLING LEGS!) ---
  // Left supporting leg: Hip attached to torso at (64 + torsoSwayX*0.5, 115 + hipBobY), Hoof planted at (59, 162)
  const leftHipX = 64 + torsoSwayX * 0.55;
  const leftHipY = 115 + hipBobY;
  const leftHoofX = 59;
  const leftHoofY = 162;
  // Goat knee bends forward/outward naturally as pelvis bobs
  const leftKneeBend = 4.5 + Math.max(0, hipBobY) * 0.9;
  const leftKneeX = (leftHipX + leftHoofX) * 0.5 - leftKneeBend;
  const leftKneeY = (leftHipY + leftHoofY) * 0.5 - 2;

  // Right stomping leg: Hip attached to torso at (82 + torsoSwayX*0.5, 115 + hipBobY)
  const rightHipX = 82 + torsoSwayX * 0.55;
  const rightHipY = 115 + hipBobY;
  // During windup, right hoof lifts up cleanly by bending knee; during strike, it slams onto the turf at (86, 162)!
  const rightHoofLift = Math.max(0, actionWindup * 15 - actionStrike * 4);
  const rightHoofX = 85 + actionWindup * 2 + actionStrike * 2;
  const rightHoofY = 162 - rightHoofLift;
  const rightKneeBend = 5.0 + rightHoofLift * 0.45 + Math.max(0, hipBobY) * 0.8;
  const rightKneeX = (rightHipX + rightHoofX) * 0.5 + rightKneeBend;
  const rightKneeY = (rightHipY + rightHoofY) * 0.5 - 2 - rightHoofLift * 0.35;

  // Spark intensity when hoof impacts the ground
  const stompImpactIntensity = Math.max(0, actionStrike - 0.25) / 0.75;

  // --- LEFT ARM & CLAWS (Anchored at left shoulder inside torso) ---
  const leftArmAngle =
    -6 +
    Math.sin(cBreath - 0.4) * 6 -
    actionWindup * 14 +
    actionStrike * 18;
  const leftForearmAngle =
    8 +
    Math.cos(cBreath) * 5 +
    actionWindup * 16 -
    actionStrike * 12;

  // --- RIGHT ARM & IRON PITCHFORK (PROPER TWO-JOINT SHOULDER -> HAND -> PITCHFORK KINEMATICS) ---
  // Right shoulder is anchored on the torso at (85 + torsoSwayX, 82 + hipBobY)
  const rightShoulderX = 85 + torsoSwayX;
  const rightShoulderY = 82 + hipBobY;

  // Hand grips the pitchfork shaft:
  // Idle: sways gently near (96, 62)
  // Windup: pulls back & slightly up to (102, 58)
  // Strike/Jab: thrusts forward/left & up to (86, 52), tilting the pitchfork menacingly towards the center!
  const handGripX =
    96 +
    Math.sin(cBreath + 0.3) * 1.8 +
    actionWindup * 5.5 -
    actionStrike * 9.5;
  const handGripY =
    62 +
    Math.cos(cBreath * 2) * 1.6 -
    actionWindup * 3.0 -
    actionStrike * 7.5;

  // Elbow forms a natural muscular curve between (rightShoulderX, rightShoulderY) and (handGripX, handGripY)
  const rightElbowX = (rightShoulderX + handGripX) * 0.5 + 8 - actionStrike * 2;
  const rightElbowY = (rightShoulderY + handGripY) * 0.5 + 5;

  // Pitchfork angle around the hand grip (handGripX, handGripY):
  // Idle: -7 deg (natural slight inward tilt, bottom of shaft resting near ground)
  // Windup: +6 deg (cocked back)
  // Strike: -22 deg (thrusting prongs forward/left without ever detaching from hand or crossing legs awkwardly)
  const pitchforkAngle =
    -7 +
    Math.sin(cBreath + 0.3) * 3.2 +
    actionWindup * 11 -
    actionStrike * 16;

  // --- DEVIL HEAD, EYES & UNDULATING TONGUE ---
  const certHeadX = Math.sin(cBreath + 0.2) * 1.2 - actionStrike * 2.5;
  const certHeadY = Math.cos(cBreath * 2) * 1.0 - actionStrike * 1.5;
  const certHeadRot =
    Math.sin(cBreath - 0.3) * 3.5 +
    actionWindup * 4 -
    actionStrike * 7;

  const certEyeScale = 1 + Math.max(0, Math.sin(cBreath)) * 0.05 + actionStrike * 0.22 + cHover * 0.06;
  const certPupilDx = Math.sin(t * 1.6) * 2.1 - actionStrike * 1.5;
  const certPupilDy = Math.cos(t * 1.2) * 1.4 + actionStrike * 0.5;
  const certBrowDy = Math.cos(cBreath) * 0.9 - actionStrike * 2.4;

  // Smooth continuous tongue extension & S-curve wave
  const tongueExtend =
    0.58 +
    Math.sin(cBreath * 0.85) * 0.18 +
    actionStrike * 0.55 +
    cHover * 0.15;
  const tongueSwingDeg =
    Math.sin(t * 3.4) * 6 +
    actionStrike * 10;

  // --- SINUOUS TAIL & INDEPENDENT WORLD-SPACE FIRE AND SMOKE ---
  // Tail base is anchored at pelvis (58 + torsoSwayX*0.7, 114 + hipBobY)
  const tailBaseX = 58 + torsoSwayX * 0.7;
  const tailBaseY = 114 + hipBobY;
  // Smooth continuous tail wag angle (in degrees, much gentler and organic so it never snaps)
  const tailWagDeg =
    Math.sin(t * 2.6) * 12 +
    Math.cos(t * 1.5) * 5 -
    actionWindup * 14 +
    actionStrike * 18;
  const tailWagRad = (tailWagDeg * Math.PI) / 180;

  // Compute exact world-space position of the tail tip (unrotated offset from base is dx=-42, dy=-28)
  const rawTipDx = -42;
  const rawTipDy = -28;
  const cosT = Math.cos(tailWagRad);
  const sinT = Math.sin(tailWagRad);
  const tailTipX = tailBaseX + rawTipDx * cosT - rawTipDy * sinT;
  const tailTipY = tailBaseY + rawTipDx * sinT + rawTipDy * cosT;

  // Update trailing history of tail tip for smoke inertia
  const history = tailHistoryRef.current;
  history[0] = { x: tailTipX, y: tailTipY };
  for (let i = 1; i < history.length; i++) {
    history[i] = {
      x: history[i].x + (history[i - 1].x - history[i].x) * 0.14,
      y: history[i].y + (history[i - 1].y - history[i].y) * 0.14,
    };
  }

  // Independent high-frequency flame dynamics (always rises vertically in world space!)
  const flameBoost = 1 + actionStrike * 0.35 + cHover * 0.12;
  const flameScaleX = (1 + Math.sin(t * 13.7) * 0.09 + Math.cos(t * 21.3) * 0.06) * flameBoost;
  const flameScaleY = (1 + Math.cos(t * 15.1) * 0.13 + Math.sin(t * 25.7) * 0.08) * flameBoost;
  // Flame leans slightly opposite to tail velocity, but stays upright in world space
  const flameSwayDeg = Math.sin(t * 9.4) * 5 + Math.cos(t * 16.2) * 3 - tailWagDeg * 0.18;
  const innerFlameSwayDeg = Math.cos(t * 14.8) * 7 - Math.sin(t * 22.1) * 4;

  // 6 Independent continuous smoke puffs rising in world space above the flame
  const smokePuffs = [0, 1, 2, 3, 4, 5].map((idx) => {
    const phase = (t * 0.48 + idx / 6) % 1; // 0..1 continuous lifecycle
    const histIdx = Math.min(history.length - 1, Math.floor(phase * history.length));
    const origin = history[histIdx] || { x: tailTipX, y: tailTipY };
    // Smooth rise, gentle wind curl, expansion, and bell-curve fade
    const riseY = phase * 38;
    const windDriftX = -phase * 9 + Math.sin(phase * Math.PI * 2 + idx * 1.3 + t * 1.8) * (2.5 + phase * 3.5);
    const radius = 2.6 + phase * 5.8;
    const alpha = Math.sin(phase * Math.PI) * 0.58;
    return {
      key: idx,
      cx: origin.x + windDriftX,
      cy: origin.y - 12 - riseY,
      r: radius,
      alpha,
    };
  });

  // 4 Independent rising glowing embers from the burning tail tip
  const tailEmbers = [0, 1, 2, 3].map((idx) => {
    const phase = (t * 0.85 + idx * 0.25) % 1;
    const riseY = phase * 28;
    const swayX = Math.sin(t * 6 + idx * 2.1) * (3 + phase * 5) - phase * 4;
    const alpha = Math.sin(phase * Math.PI) * (0.85 + actionStrike * 0.15);
    const r = (1 - phase * 0.5) * 1.6;
    return {
      key: idx,
      cx: tailTipX + swayX,
      cy: tailTipY - 8 - riseY,
      r,
      alpha,
      color: idx % 2 === 0 ? '#FEF08A' : '#FF5722',
    };
  });

  // Top 5-pointed folk star continuous spin & click burst
  const starBurstElapsed = t - starSpinBurstRef.current;
  const starBurstEnv =
    starBurstElapsed >= 0 && starBurstElapsed < 1.2
      ? Math.sin((starBurstElapsed / 1.2) * Math.PI) * (1 - starBurstElapsed / 1.2)
      : 0;
  const starAngleDeg = t * 38 + Math.sin(t * 2.6) * 18 + starBurstEnv * 360;
  const starScale = 1 + Math.sin(t * 3.4) * 0.09 + starBurstEnv * 0.28;

  return (
    <header className={`bubakov-cover-header relative select-none w-full flex flex-col items-center justify-center my-1 ${className}`}>
      {/* Hand-drawn 2D Canvas 5-pointed folk star with playful spin & twinkle */}
      <div
        className="my-0.5 cursor-pointer"
        onClick={handleStarClick}
        title="Ladovská pouťová hvězdička (klikni pro zatočení!)"
        style={{
          transform: `rotate(${starAngleDeg.toFixed(1)}deg) scale(${starScale.toFixed(3)})`,
          transition: 'filter 0.15s ease',
        }}
      >
        <LadaCanvasSvg
          width={32}
          height={32}
          viewBox="0 0 40 40"
          className="drop-shadow-sm"
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
      </div>

      {/* Main Illustration & Typography Stage */}
      <div className="relative w-full max-w-[820px] px-2 sm:px-4 flex items-center justify-center">
        <svg
          viewBox="0 0 880 195"
          className="w-full h-auto max-h-[205px] drop-shadow-md overflow-visible"
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

            {/* Ink filter for organic line pressure */}
            <filter id="lada-ink-spread" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="3" dy="3.5" stdDeviation="0.2" floodColor="#1C1610" floodOpacity="0.9" />
            </filter>

            {/* Lithograph Burlap Fabric Stippled Grain Texture for Bubák */}
            <pattern
              id="bubak-cover-burlap-dots"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#C2945D" />
              <circle cx="1.5" cy="1.5" r="0.75" fill="#916233" />
              <circle cx="4.5" cy="4.5" r="0.75" fill="#916233" />
              <circle cx="1.5" cy="4.5" r="0.5" fill="#6E441D" />
              <circle cx="4.5" cy="1.5" r="0.5" fill="#DCAB75" />
              <line x1="0" y1="3" x2="6" y2="3" stroke="#A87541" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
            </pattern>

            {/* Dark Frond Fleck Pattern for lower foliage/skirt */}
            <pattern
              id="bubak-cover-frond-texture"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#1E2319" />
              <circle cx="2" cy="3" r="0.8" fill="#5F733E" />
              <circle cx="6" cy="6" r="0.8" fill="#7C924F" />
              <circle cx="5" cy="1.5" r="0.6" fill="#A8813C" />
            </pattern>

            {/* Red mouth gradient */}
            <radialGradient id="bubak-cover-mouth-depth" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#8A1310" />
              <stop offset="65%" stopColor="#B3211B" />
              <stop offset="100%" stopColor="#5E0B09" />
            </radialGradient>

            {/* Čert curly black fur pattern */}
            <pattern
              id="cert-cover-fur-pattern"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#221915" />
              <circle cx="2" cy="2" r="0.9" fill="#3D2E27" />
              <circle cx="6" cy="6" r="0.9" fill="#3D2E27" />
              <path d="M 1,4 Q 3,6 5,4" stroke="#150F0D" strokeWidth="0.8" fill="none" />
            </pattern>

            {/* Devil horn sharp crimson gradient */}
            <linearGradient id="cert-horn-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3838" />
              <stop offset="30%" stopColor="#DC2626" />
              <stop offset="70%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#4A0B0B" />
            </linearGradient>

            {/* Devil burning tail flame gradients */}
            <radialGradient id="cert-flame-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5722" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cert-flame-core" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#B91C1C" />
              <stop offset="28%" stopColor="#DC2626" />
              <stop offset="55%" stopColor="#F97316" />
              <stop offset="82%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FEF08A" />
            </linearGradient>
            <radialGradient id="cert-spark-blast-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#DC2626" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#991B1B" stopOpacity="0" />
            </radialGradient>
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
          <g
            id="ribbon-streamer-left"
            transform={`rotate(${(Math.sin(t * 2.1) * 3.2).toFixed(2)}, 174, 166)`}
          >
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
            {/* Animated Cornflower Blue & Buttercup little folk flowers along left stem */}
            <g transform={`translate(167, 148) rotate(${(t * 38).toFixed(1)}) scale(${(1 + Math.sin(t * 3.8) * 0.1).toFixed(3)})`}>
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
            <g transform={`translate(182, 94) rotate(${(-t * 42).toFixed(1)}) scale(${(1 + Math.cos(t * 3.6) * 0.1).toFixed(3)})`}>
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
            <g transform={`translate(174, 142) rotate(${(Math.sin(t * 3.0) * 6).toFixed(2)}) translate(-174, -142)`}>
              <path
                d="M 174,142 C 182,142 186,126 178,118 C 172,113 170,127 174,142 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 174,138 C 177,132 179,127 180,122" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g transform={`translate(173, 108) rotate(${(Math.cos(t * 2.8) * 6).toFixed(2)}) translate(-173, -108)`}>
              <path
                d="M 173,108 C 167,101 163,112 169,120 C 174,124 176,116 173,108 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 173,111 C 171,114 169,116 167,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
            <g transform={`translate(174, 82) rotate(${(Math.sin(t * 3.2 + 1) * 6).toFixed(2)}) translate(-174, -82)`}>
              <path
                d="M 174,82 C 182,80 186,66 178,58 C 172,54 170,66 174,82 Z"
                fill="#16A34A"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 174,78 C 177,72 179,66 180,62" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g
              transform={`translate(176, 28) rotate(${(t * 26).toFixed(1)}) scale(${(1 + Math.sin(t * 3.4) * 0.09).toFixed(3)})`}
            >
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

          {/* ============================================================== */}
          {/* RIGHT FOLK FLORAL STEM (BREEZE-SWAYING & BLOOMING)             */}
          {/* ============================================================== */}
          <g
            id="ribbon-streamer-right"
            transform={`rotate(${(-Math.sin(t * 2.1 + 0.5) * 3.2).toFixed(2)}, 686, 166)`}
          >
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
            {/* Animated Cornflower Blue & Buttercup little folk flowers along right stem */}
            <g transform={`translate(693, 148) rotate(${(-t * 38).toFixed(1)}) scale(${(1 + Math.sin(t * 3.8 + 0.6) * 0.1).toFixed(3)})`}>
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
            <g transform={`translate(678, 94) rotate(${(t * 42).toFixed(1)}) scale(${(1 + Math.cos(t * 3.6 + 0.6) * 0.1).toFixed(3)})`}>
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
            <g transform={`translate(686, 142) rotate(${(-Math.sin(t * 3.0) * 6).toFixed(2)}) translate(-686, -142)`}>
              <path
                d="M 686,142 C 678,142 674,126 682,118 C 688,113 690,127 686,142 Z"
                fill="#22C55E"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 686,138 C 683,132 681,127 680,122" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g transform={`translate(687, 108) rotate(${(-Math.cos(t * 2.8) * 6).toFixed(2)}) translate(-687, -108)`}>
              <path
                d="M 687,108 C 693,101 697,112 691,120 C 686,124 684,116 687,108 Z"
                fill="#4ADE80"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 687,111 C 689,114 691,116 693,117" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
            <g transform={`translate(686, 82) rotate(${(-Math.sin(t * 3.2 + 1) * 6).toFixed(2)}) translate(-686, -82)`}>
              <path
                d="M 686,82 C 678,80 674,66 682,58 C 688,54 690,66 686,82 Z"
                fill="#16A34A"
                stroke="#1C1610"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path d="M 686,78 C 683,72 681,66 680,62" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
            <g
              transform={`translate(684, 28) rotate(${(-t * 26).toFixed(1)}) scale(${(1 + Math.cos(t * 3.4) * 0.09).toFixed(3)})`}
            >
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

          {/* ============================================================== */}
          {/* AUTHENTIC JOSEF LADA YELLOW CORNER FLOWERS (BLOOMING & SPINNING) */}
          {/* ============================================================== */}
          <g id="lada-cartouche-corner-flowers">
            {[
              { x: 204, y: 40, rot: -15, prefix: 'tl', dir: 1, petal: '#FACC15', core: '#F59E0B', budPetal: '#38BDF8', budDx: 15, budDy: 5 },
              { x: 656, y: 40, rot: 15, prefix: 'tr', dir: -1, petal: '#FACC15', core: '#F59E0B', budPetal: '#38BDF8', budDx: -15, budDy: 5 },
              { x: 204, y: 150, rot: -45, prefix: 'bl', dir: -1, petal: '#E11D48', core: '#FACC15', budPetal: '#FACC15', budDx: 15, budDy: -5 },
              { x: 656, y: 150, rot: 45, prefix: 'br', dir: 1, petal: '#E11D48', core: '#FACC15', budPetal: '#FACC15', budDx: -15, budDy: -5 },
            ].map((corner, cIdx) => {
              const flowerRot = corner.rot + Math.sin(t * 2.0 + cIdx * 1.1) * 14 + t * 14 * corner.dir;
              const flowerScale = 1 + Math.sin(t * 3.1 + cIdx * 0.9) * 0.08;
              const leafRot = Math.sin(t * 2.6 + cIdx) * 6;
              return (
                <g key={corner.prefix} transform={`translate(${corner.x}, ${corner.y})`}>
                  {/* Breathing green meadow leaves behind corner flower */}
                  <g transform={`rotate(${leafRot.toFixed(1)})`}>
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
                  {/* Secondary blooming side forget-me-not bud */}
                  <g
                    transform={`translate(${corner.budDx}, ${corner.budDy}) rotate(${(-t * 28 * corner.dir).toFixed(1)}) scale(${(0.95 + Math.cos(t * 3.4 + cIdx) * 0.08).toFixed(3)})`}
                  >
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
                  {/* Main corner flower */}
                  <g transform={`rotate(${flowerRot.toFixed(1)}) scale(${flowerScale.toFixed(3)})`}>
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
                    <circle cx="0" cy="-5.2" r="0.7" fill="#1C1610" />
                    <circle cx="3.6" cy="-3.6" r="0.7" fill="#1C1610" />
                    <circle cx="5.2" cy="0" r="0.7" fill="#1C1610" />
                    <circle cx="3.6" cy="3.6" r="0.7" fill="#1C1610" />
                    <circle cx="0" cy="5.2" r="0.7" fill="#1C1610" />
                    <circle cx="-3.6" cy="3.6" r="0.7" fill="#1C1610" />
                    <circle cx="-5.2" cy="0" r="0.7" fill="#1C1610" />
                    <circle cx="-3.6" cy="-3.6" r="0.7" fill="#1C1610" />
                  </g>
                </g>
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* LEVÁ POSTAVIČKA: STRAŠÁK / BUBÁK (PLYNULÁ 60 FPS KINEMATIKA)   */}
          {/* ============================================================== */}
          {showCharacters && (
            <g transform="translate(12, 4)">
              <g
                id="lada-cover-strasak"
                className="cursor-pointer select-none"
                transform={`translate(84, ${100 + bubakRootLiftY}) scale(${bubakRootScale}) translate(-84, -100)`}
                onClick={handleBubakClick}
                onMouseEnter={() => setIsBubakHovered(true)}
                onMouseLeave={() => setIsBubakHovered(false)}
              >
                <title>Bubák ze slavné knihy Josefa Lady (klikni pro bafnutí!)</title>

                {/* 1. Grounded Weathered Wooden Mounting Pole with Meadow Flowers at Base */}
                <g id="bubak-wood-pole">
                  <rect
                    x="79.5"
                    y="132"
                    width="9"
                    height="60"
                    fill="#783E24"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                    rx="1.5"
                  />
                  <line x1="82.5" y1="136" x2="82.5" y2="190" stroke="#9A5632" strokeWidth="1.6" />
                  <line x1="85.5" y1="138" x2="85.5" y2="186" stroke="#522712" strokeWidth="1.2" />
                  <ellipse cx="83.5" cy="164" rx="2" ry="3.2" fill="#3D1A0B" stroke="#1C1610" strokeWidth="1" />
                  {/* Meadow turf & blooming folk flowers at base of pole */}
                  <ellipse cx="84" cy="190" rx="22" ry="6" fill="#22C55E" stroke="#1C1610" strokeWidth="2.2" />
                  <g transform={`translate(71, 187) rotate(${(t * 32).toFixed(1)})`}>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        transform={`rotate(${deg})`}
                        d="M 0,0 C -2,-2.2 -2.2,-4.8 0,-5.3 C 2.2,-4.8 2,-2.2 0,0 Z"
                        fill="#FACC15"
                        stroke="#1C1610"
                        strokeWidth="1.1"
                      />
                    ))}
                    <circle cx="0" cy="0" r="1.9" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
                  </g>
                  <g transform={`translate(96, 188) rotate(${(-t * 36).toFixed(1)})`}>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        transform={`rotate(${deg})`}
                        d="M 0,0 C -1.8,-2 -2,-4.4 0,-4.8 C 2,-4.4 1.8,-2 0,0 Z"
                        fill="#38BDF8"
                        stroke="#1C1610"
                        strokeWidth="1.1"
                      />
                    ))}
                    <circle cx="0" cy="0" r="1.7" fill="#FACC15" stroke="#1C1610" strokeWidth="0.9" />
                  </g>
                </g>

                {/* 2. Articulated Upper Body Assembly (Torso + Skirt + Arms + Head move coherently together) */}
                <g
                  id="bubak-articulated-body"
                  transform={`translate(${bubakTorsoX}, ${bubakTorsoY}) rotate(${bubakTorsoRot}, 84, 124)`}
                >
                  {/* 2a. Lower Dark Shredded Leaf-Frond Skirt (pivots smoothly at waist 84, 126) */}
                  <g
                    id="bubak-frond-skirt"
                    transform={`rotate(${bubakSkirtRot}, 84, 126)`}
                  >
                    <path
                      d="M 54,124 Q 40,140 32,154 Q 44,148 56,134 Q 68,158 84,164 Q 100,158 112,134 Q 124,148 136,154 Q 128,140 114,124 Z"
                      fill="url(#bubak-cover-frond-texture)"
                      stroke="#1C1610"
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 84,130 L 84,160 M 70,128 L 52,148 M 98,128 L 116,148"
                      stroke="#3D4B2A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>

                  {/* 2b. Left Scarecrow Arm / Flared Sleeve (Pivot at left shoulder: 68, 74) */}
                  <g
                    id="bubak-left-arm"
                    transform={`rotate(${bubakLeftArmAngle}, 68, 74)`}
                  >
                    <polygon
                      points="68,76 34,58 14,38 28,32 54,48 74,68"
                      fill="url(#bubak-cover-burlap-dots)"
                      stroke="#1C1610"
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                    />
                    <path d="M 46,58 C 38,54 30,48 24,42" stroke="#1C1610" strokeWidth="2" fill="none" />
                    <path d="M 56,66 C 48,60 40,54 34,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />

                    {/* 5 Shredded frayed cuff fingers with gentle secondary wrist flutter */}
                    <g transform={`rotate(${bubakLeftCuffFlutter}, 24, 38)`}>
                      <polygon
                        points="28,32 18,22 14,34 6,28 10,42 2,44 14,52 22,46"
                        fill="#946332"
                        stroke="#1C1610"
                        strokeWidth="2.8"
                        strokeLinejoin="round"
                      />
                      <line x1="14" y1="36" x2="22" y2="40" stroke="#FAF5E8" strokeWidth="1.4" />
                      <line x1="8" y1="32" x2="16" y2="34" stroke="#D9A036" strokeWidth="1.4" />
                      <line x1="10" y1="46" x2="18" y2="48" stroke="#D9A036" strokeWidth="1.4" />
                    </g>
                  </g>

                  {/* 2c. Right Scarecrow Arm / Flared Sleeve (Pivot at right shoulder: 100, 74) */}
                  <g
                    id="bubak-right-arm"
                    transform={`rotate(${bubakRightArmAngle}, 100, 74)`}
                  >
                    <polygon
                      points="100,76 134,58 154,38 140,32 114,48 94,68"
                      fill="url(#bubak-cover-burlap-dots)"
                      stroke="#1C1610"
                      strokeWidth="3.2"
                      strokeLinejoin="round"
                    />
                    <path d="M 122,58 C 130,54 138,48 144,42" stroke="#1C1610" strokeWidth="2" fill="none" />
                    <path d="M 112,66 C 120,60 128,54 134,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />

                    {/* 5 Shredded frayed cuff fingers with gentle secondary wrist flutter */}
                    <g transform={`rotate(${bubakRightCuffFlutter}, 144, 38)`}>
                      <polygon
                        points="140,32 150,22 154,34 162,28 158,42 166,44 154,52 146,46"
                        fill="#946332"
                        stroke="#1C1610"
                        strokeWidth="2.8"
                        strokeLinejoin="round"
                      />
                      <line x1="154" y1="36" x2="146" y2="40" stroke="#FAF5E8" strokeWidth="1.4" />
                      <line x1="160" y1="32" x2="152" y2="34" stroke="#D9A036" strokeWidth="1.4" />
                      <line x1="158" y1="46" x2="150" y2="48" stroke="#D9A036" strokeWidth="1.4" />
                    </g>
                  </g>

                  {/* 2d. Persistent Stable Torso / Barrel Sack Belly */}
                  <g
                    id="bubak-torso-group"
                    transform={`translate(84, 98) scale(${bubakTorsoScaleX}, ${bubakTorsoScaleY}) translate(-84, -98)`}
                  >
                    <ellipse
                      cx="84"
                      cy="98"
                      rx="24.5"
                      ry="29.5"
                      fill="url(#bubak-cover-burlap-dots)"
                      stroke="#1C1610"
                      strokeWidth="3.4"
                    />

                    {/* Vertical Green Center Seam with black ink core & cross-stitches */}
                    <path d="M 84,69 L 84,127" stroke="#486935" strokeWidth="5.5" strokeLinecap="round" />
                    <path d="M 84,69 L 84,127" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
                    {[76, 86, 96, 106, 116, 123].map((y) => (
                      <line key={`seam-stitch-${y}`} x1="81" y1={y} x2="87" y2={y} stroke="#1C1610" strokeWidth="1.8" />
                    ))}

                    {/* Organic fold wrinkles */}
                    <path d="M 65,88 C 72,92 78,92 82,90" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                    <path d="M 86,90 C 92,92 98,92 103,88" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                    <path d="M 66,108 C 73,112 78,112 82,110" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                    <path d="M 86,110 C 92,112 97,112 102,108" stroke="#1C1610" strokeWidth="2.2" fill="none" />
                    <path d="M 62,96 C 63,102 64,108 67,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />
                    <path d="M 106,96 C 105,102 104,108 101,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />

                    {/* Stitched Fabric Patches */}
                    <g transform="translate(98, 86)">
                      <ellipse cx="0" cy="0" rx="5" ry="7" fill="#382C1E" stroke="#1C1610" strokeWidth="2" />
                      <circle cx="0" cy="0" r="1.5" fill="#886036" />
                      <line x1="-3" y1="-5" x2="-3" y2="-7" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="3" y1="-5" x2="3" y2="-7" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="-3" y1="5" x2="-3" y2="7" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="3" y1="5" x2="3" y2="7" stroke="#FAF5E8" strokeWidth="1" />
                    </g>
                    <g transform="translate(71, 110)">
                      <ellipse cx="0" cy="0" rx="4.5" ry="6" fill="#2E2419" stroke="#1C1610" strokeWidth="2" />
                      <circle cx="0" cy="0" r="1.2" fill="#886036" />
                      <line x1="-2.5" y1="-4" x2="-2.5" y2="-6" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="2.5" y1="-4" x2="2.5" y2="-6" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="-2.5" y1="4" x2="-2.5" y2="6" stroke="#FAF5E8" strokeWidth="1" />
                      <line x1="2.5" y1="4" x2="2.5" y2="6" stroke="#FAF5E8" strokeWidth="1" />
                    </g>
                  </g>

                  {/* 2e. Burlap Sack Head (Pivot at neck: 84, 68) */}
                  <g
                    id="bubak-head-group"
                    transform={`translate(${bubakHeadX}, ${bubakHeadY}) rotate(${bubakHeadRot}, 84, 68) translate(84, 68) scale(${bubakHeadScale}) translate(-84, -68)`}
                  >
                    <g transform="translate(84, 42)">
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="20.5"
                        ry="25.5"
                        fill="url(#bubak-cover-burlap-dots)"
                        stroke="#1C1610"
                        strokeWidth="3.4"
                      />

                      {/* Straw tufts on head */}
                      <line x1="0" y1="-25" x2="0" y2="-32" stroke="#D9A036" strokeWidth="2.4" strokeLinecap="round" />
                      <line x1="-4" y1="-24" x2="-9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="4" y1="-24" x2="9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Head contour wrinkles */}
                      <path d="M -16,-6 C -12,-8 -8,-8 -6,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                      <path d="M 6,-6 C 8,-8 12,-8 16,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                      {/* Brow Furrow Ticks */}
                      <g transform={`translate(0, ${bubakBrowDy})`}>
                        <line x1="-3" y1="-17" x2="-2" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                        <line x1="2" y1="-17" x2="3" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                      </g>

                      {/* Left Eye with mobile pupil */}
                      <g transform={`translate(-8, -8) scale(1, ${bubakEyeSquintL})`}>
                        <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                        <g transform={`translate(${bubakPupilDx}, ${bubakPupilDy})`}>
                          <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                          <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                        </g>
                      </g>

                      {/* Right Eye with mobile pupil */}
                      <g transform={`translate(8, -8) scale(${bubakEyeScaleR})`}>
                        <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                        <g transform={`translate(${bubakPupilDx}, ${bubakPupilDy})`}>
                          <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                          <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                        </g>
                      </g>

                      {/* Snout / Button Nose with two nostril dots */}
                      <ellipse cx="0" cy="1" rx="3.6" ry="3.2" fill="#A06E3B" stroke="#1C1610" strokeWidth="2.2" />
                      <circle cx="-1.2" cy="1.2" r="0.8" fill="#1C1610" />
                      <circle cx="1.2" cy="1.2" r="0.8" fill="#1C1610" />

                      {/* Continuous Unified Toothy Maw (smoothly interpolates from closed chomp to wide BAF without DOM swaps!) */}
                      <g
                        id="bubak-mouth-group"
                        transform={`translate(0, 11) rotate(${bubakMouthRot}) scale(${bubakMouthScaleX}, ${bubakMouthOpen}) translate(0, -11)`}
                      >
                        <path
                          d="M -12,7 C -12,3 12,3 12,7 C 13,20 -13,20 -12,7 Z"
                          fill="url(#bubak-cover-mouth-depth)"
                          stroke="#1C1610"
                          strokeWidth="2.8"
                          strokeLinejoin="round"
                        />
                        {/* Upper row of saw teeth */}
                        <polygon
                          points="-10,6 -8,11 -6,6 -4,11 -2,6 0,11 2,6 4,11 6,6 8,11 10,6"
                          fill="#FAF6ED"
                          stroke="#1C1610"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Lower row of saw teeth */}
                        <polygon
                          points="-10,18 -8,13 -6,18 -4,13 -2,18 0,13 2,18 4,13 6,18 8,13 10,18"
                          fill="#FAF6ED"
                          stroke="#1C1610"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* PRAVÁ POSTAVIČKA: ČERTÍK (PLYNULÁ 60 FPS KINEMATIKA)           */}
          {/* - Žádné padající nohy: dvoukloubové kozlí nohy ukotvené v pánvi */}
          {/* - Správná animace vidlí: dvoukloubová paže + přirozený úchop   */}
          {/* - Nezávislý oheň a kouř: stoupají vzhůru ve světových souřadnicích */}
          {/* ============================================================== */}
          {showCharacters && (
            <g transform="translate(710, 4)">
              <g
                id="lada-cover-cert"
                className="cursor-pointer select-none"
                transform={`translate(74, 165) scale(${certRootScale}) translate(-74, -165)`}
                onClick={handleCertClick}
                onMouseEnter={() => setIsCertHovered(true)}
                onMouseLeave={() => setIsCertHovered(false)}
              >
                <title>Pekelný čertík Josefa Lady (klikni pro dupnutí kopytem, bodnutí vidlemi a spršku pekelných jisker!)</title>

                {/* 1. Green Meadow Turf Pedestal with Josef Lada Grass Blades & Blooming Meadow Flowers */}
                <g id="cert-turf-pedestal">
                  <ellipse cx="74" cy="168" rx="38" ry="12" fill="#3D7843" stroke="#1C1610" strokeWidth="3" />
                  <ellipse cx="74" cy="166" rx="32" ry="7" fill="#589B5F" />
                  <path
                    d="M 52,162 L 54,152 L 58,162 M 68,160 L 71,150 L 74,160 M 88,160 L 92,151 L 95,160"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Blooming Poppy & Daisy meadow flowers on Čertík's turf */}
                  <g transform={`translate(45, 165) rotate(${(t * 34).toFixed(1)})`}>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        transform={`rotate(${deg})`}
                        d="M 0,0 C -2,-2.2 -2.2,-4.8 0,-5.3 C 2.2,-4.8 2,-2.2 0,0 Z"
                        fill="#FFFDF7"
                        stroke="#1C1610"
                        strokeWidth="1.1"
                      />
                    ))}
                    <circle cx="0" cy="0" r="1.8" fill="#FACC15" stroke="#1C1610" strokeWidth="0.9" />
                  </g>
                  <g transform={`translate(103, 165) rotate(${(-t * 30).toFixed(1)})`}>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        transform={`rotate(${deg})`}
                        d="M 0,0 C -2,-2.2 -2.2,-4.8 0,-5.3 C 2.2,-4.8 2,-2.2 0,0 Z"
                        fill="#FACC15"
                        stroke="#1C1610"
                        strokeWidth="1.1"
                      />
                    ))}
                    <circle cx="0" cy="0" r="1.8" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
                  </g>

                  {/* Smoothly modulated hoof stomp impact sparks */}
                  {stompImpactIntensity > 0.02 && (
                    <g id="cert-stomp-impact-epic" opacity={Math.min(1, stompImpactIntensity * 1.25)}>
                      <ellipse
                        cx="88"
                        cy="164"
                        rx={14 + stompImpactIntensity * 10}
                        ry={4 + stompImpactIntensity * 3.5}
                        fill="url(#cert-spark-blast-radial)"
                      />
                      {/* Radial expanding spark trails */}
                      <line
                        x1="88"
                        y1="158"
                        x2={88 + 32 * stompImpactIntensity}
                        y2={158 - 24 * stompImpactIntensity}
                        stroke="#FEF08A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <line
                        x1="86"
                        y1="156"
                        x2={86 + 16 * stompImpactIntensity}
                        y2={156 - 38 * stompImpactIntensity}
                        stroke="#FBBF24"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="90"
                        y1="160"
                        x2={90 + 42 * stompImpactIntensity}
                        y2={160 - 8 * stompImpactIntensity}
                        stroke="#FEF08A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      <line
                        x1="84"
                        y1="158"
                        x2={84 - 18 * stompImpactIntensity}
                        y2={158 - 26 * stompImpactIntensity}
                        stroke="#F59E0B"
                        strokeWidth="2.0"
                        strokeLinecap="round"
                      />
                      {/* Folk spark stars */}
                      <g
                        transform={`translate(${88 + 34 * stompImpactIntensity}, ${158 - 26 * stompImpactIntensity}) scale(${0.6 + stompImpactIntensity * 0.5})`}
                      >
                        <polygon
                          points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2"
                          fill="#FFFBEB"
                          stroke="#1C1610"
                          strokeWidth="1.2"
                        />
                        <circle cx="0" cy="0" r="1.8" fill="#EF4444" />
                      </g>
                      <g
                        transform={`translate(${86 + 18 * stompImpactIntensity}, ${156 - 40 * stompImpactIntensity}) scale(${0.5 + stompImpactIntensity * 0.5})`}
                      >
                        <polygon
                          points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"
                          fill="#FEF08A"
                          stroke="#1C1610"
                          strokeWidth="1"
                        />
                      </g>
                      {/* Dust puffs at hoof */}
                      <circle
                        cx={92 + stompImpactIntensity * 6}
                        cy={161 - stompImpactIntensity * 2}
                        r={2.5 + stompImpactIntensity * 1.5}
                        fill="#FAF6ED"
                        stroke="#1C1610"
                        strokeWidth="1.6"
                      />
                      <circle
                        cx={78 - stompImpactIntensity * 4}
                        cy={162 - stompImpactIntensity * 1.5}
                        r={2.2 + stompImpactIntensity * 1.2}
                        fill="#FAF6ED"
                        stroke="#1C1610"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </g>

                {/* 2. INDEPENDENT WORLD-SPACE BILLOWING SMOKE (Rises naturally upward, never tilts rigidly with tail!) */}
                <g id="cert-independent-smoke">
                  {smokePuffs.map((puff) => (
                    <circle
                      key={`smoke-${puff.key}`}
                      cx={puff.cx}
                      cy={puff.cy}
                      r={puff.r}
                      fill="rgba(68, 58, 52, 0.75)"
                      stroke="#1C1610"
                      strokeWidth="1.15"
                      opacity={puff.alpha}
                    />
                  ))}
                  {tailEmbers.map((emb) => (
                    <circle
                      key={`ember-${emb.key}`}
                      cx={emb.cx}
                      cy={emb.cy}
                      r={emb.r}
                      fill={emb.color}
                      opacity={emb.alpha}
                    />
                  ))}
                </g>

                {/* 3. Long Sinuous Devil Tail (Stem & spade tip rotate from pelvis base) */}
                <g
                  id="cert-tail"
                  transform={`translate(${tailBaseX}, ${tailBaseY}) rotate(${tailWagDeg}) translate(${-tailBaseX}, ${-tailBaseY})`}
                >
                  <path
                    d={`M ${tailBaseX},${tailBaseY} Q ${tailBaseX - 20},${tailBaseY + 6} ${tailBaseX - 28},${tailBaseY - 8} Q ${tailBaseX - 34},${tailBaseY - 22} ${tailBaseX - 42},${tailBaseY - 28}`}
                    stroke="#1C1610"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M ${tailBaseX},${tailBaseY} Q ${tailBaseX - 20},${tailBaseY + 6} ${tailBaseX - 28},${tailBaseY - 8} Q ${tailBaseX - 34},${tailBaseY - 22} ${tailBaseX - 42},${tailBaseY - 28}`}
                    stroke="#2A1F1B"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Bushy tuft base at tail tip */}
                  <path
                    d={`M ${tailBaseX - 42},${tailBaseY - 28} C ${tailBaseX - 48},${tailBaseY - 34} ${tailBaseX - 54},${tailBaseY - 32} ${tailBaseX - 56},${tailBaseY - 26} C ${tailBaseX - 54},${tailBaseY - 18} ${tailBaseX - 48},${tailBaseY - 16} ${tailBaseX - 42},${tailBaseY - 22} Z`}
                    fill="#1C1610"
                    stroke="#1C1610"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </g>

                {/* 4. INDEPENDENT WORLD-SPACE FIRE AT TAIL TIP (Always licks upward against gravity!) */}
                <g
                  id="cert-independent-fire"
                  transform={`translate(${tailTipX - 6}, ${tailTipY}) rotate(${flameSwayDeg}) scale(${flameScaleX}, ${flameScaleY})`}
                >
                  {/* Glowing outer ruby halo */}
                  <circle cx="0" cy="-6" r="16" fill="url(#cert-flame-glow)" />

                  {/* Outer licking crimson & orange flame tongues */}
                  <path
                    d="M 2,8 C -6,6 -12,-2 -8,-12 C -4,-20 -8,-26 -10,-30 C -4,-26 -2,-18 2,-16 C 6,-24 4,-30 2,-36 C 8,-30 10,-20 8,-12 C 12,-8 10,2 2,8 Z"
                    fill="url(#cert-flame-core)"
                    stroke="#1C1610"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  {/* Secondary independently dancing inner golden flame core */}
                  <g transform={`rotate(${innerFlameSwayDeg}, 0, -2)`}>
                    <path
                      d="M 1,3 C -3,1 -7,-5 -4,-10 C -1,-15 -3,-20 -5,-23 C -1,-20 1,-15 2,-12 C 4,-17 3,-22 2,-27 C 5,-21 6,-15 4,-9 C 7,-6 5,0 1,3 Z"
                      fill="#FEF08A"
                    />
                  </g>

                  {/* Incandescent hot ember heart */}
                  <circle cx="0" cy="0" r="3.0" fill="#FF4500" />
                  <circle cx="0" cy="0" r="1.5" fill="#FFFDE7" />
                </g>

                {/* 5. Left Supporting Goat Leg (Two-joint thigh + shin, 100% connected from pelvis to ground!) */}
                <g id="cert-left-leg">
                  <path
                    d={`M ${leftHipX},${leftHipY} L ${leftKneeX},${leftKneeY} L ${leftHoofX},${leftHoofY}`}
                    stroke="#1C1610"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d={`M ${leftHipX},${leftHipY} L ${leftKneeX},${leftKneeY} L ${leftHoofX},${leftHoofY}`}
                    stroke="#281E19"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Fur tuft on knee */}
                  <path
                    d={`M ${leftKneeX - 1},${leftKneeY - 2} L ${leftKneeX - 6},${leftKneeY + 2} L ${leftKneeX},${leftKneeY + 5}`}
                    stroke="#1C1610"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Cloven hoof firmly on ground */}
                  <polygon
                    points={`${leftHoofX - 4},${leftHoofY - 4} ${leftHoofX + 6},${leftHoofY - 4} ${leftHoofX + 5},${leftHoofY + 3} ${leftHoofX - 6},${leftHoofY + 3}`}
                    fill="#1C1610"
                    stroke="#1C1610"
                    strokeWidth="1.5"
                  />
                  <line x1={leftHoofX} y1={leftHoofY - 2} x2={leftHoofX} y2={leftHoofY + 3} stroke="#FAF6ED" strokeWidth="1.2" />
                </g>

                {/* 6. Right Stomping Goat Leg (Two-joint thigh + shin, lifts from hip and stomps hoof without ever detaching!) */}
                <g id="cert-right-leg">
                  <path
                    d={`M ${rightHipX},${rightHipY} L ${rightKneeX},${rightKneeY} L ${rightHoofX},${rightHoofY}`}
                    stroke="#1C1610"
                    strokeWidth="7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d={`M ${rightHipX},${rightHipY} L ${rightKneeX},${rightKneeY} L ${rightHoofX},${rightHoofY}`}
                    stroke="#281E19"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Fur tuft on knee */}
                  <path
                    d={`M ${rightKneeX + 1},${rightKneeY - 2} L ${rightKneeX + 6},${rightKneeY + 2} L ${rightKneeX},${rightKneeY + 5}`}
                    stroke="#1C1610"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Cloven hoof */}
                  <g transform={`translate(${rightHoofX}, ${rightHoofY}) rotate(${rightHoofLift * 0.8})`}>
                    <polygon
                      points="-5,-4 5,-4 6,3 -5,3"
                      fill="#1C1610"
                      stroke="#1C1610"
                      strokeWidth="1.5"
                    />
                    <line x1="0" y1="-2" x2="0" y2="3" stroke="#FAF6ED" strokeWidth="1.2" />
                  </g>
                </g>

                {/* 7. Articulated Devil Torso, Left Arm & Head (All connected to pelvis/spine) */}
                <g
                  id="cert-torso-assembly"
                  transform={`translate(${torsoSwayX}, ${hipBobY}) rotate(${torsoTiltDeg}, 74, 115)`}
                >
                  {/* 7a. Main Furry Devil Torso */}
                  <g id="cert-torso-group">
                    <ellipse
                      cx="74"
                      cy="96"
                      rx="18"
                      ry="25.5"
                      fill="url(#cert-cover-fur-pattern)"
                      stroke="#1C1610"
                      strokeWidth="3.4"
                    />
                    {/* Josef Lada signature ink fur curls (kudrny) */}
                    <path d="M 64,84 C 62,87 63,91 66,89" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 62,95 C 60,98 62,102 65,99" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 64,106 C 62,109 64,113 67,110" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 83,85 C 85,88 84,92 81,90" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 84,97 C 86,100 85,104 82,101" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <path d="M 82,108 C 84,111 83,114 80,112" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                    <ellipse cx="74" cy="98" rx="8" ry="12" fill="#362922" fillOpacity="0.45" />
                    <path d="M 70,88 Q 74,92 78,88" stroke="#523E33" strokeWidth="1.5" fill="none" />
                    <path d="M 71,98 Q 74,102 77,98" stroke="#523E33" strokeWidth="1.5" fill="none" />
                  </g>

                  {/* 7b. Left Arm with Sharp Claws (Anchored at shoulder 60, 82) */}
                  <g
                    id="cert-left-arm"
                    transform={`rotate(${leftArmAngle}, 60, 82)`}
                  >
                    <path d="M 60,82 Q 46,90 48,102" stroke="#1C1610" strokeWidth="6.5" strokeLinecap="round" fill="none" />
                    <path d="M 60,82 Q 46,90 48,102" stroke="#241B17" strokeWidth="4.0" strokeLinecap="round" fill="none" />
                    <path d="M 46,92 C 42,94 43,98 47,96" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                    {/* Forearm & Hand with Clawed Fingers (Pivot at elbow 48, 102) */}
                    <g transform={`rotate(${leftForearmAngle}, 48, 102)`}>
                      <path d="M 48,102 Q 52,112 50,116" stroke="#1C1610" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                      <path d="M 48,102 Q 52,112 50,116" stroke="#241B17" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                      <circle cx="50" cy="116" r="3.2" fill="#1C1610" />
                      <path d="M 52,114 Q 56,116 54,120" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      <circle cx="54" cy="120" r="0.7" fill="#FAF6ED" />
                      <path d="M 50,117 Q 47,121 44,124" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                      <circle cx="44" cy="124" r="0.8" fill="#FAF6ED" />
                      <path d="M 48,116 Q 44,118 40,121" stroke="#1C1610" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                      <circle cx="40" cy="121" r="0.8" fill="#FAF6ED" />
                      <path d="M 47,114 Q 42,115 39,117" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      <circle cx="39" cy="117" r="0.7" fill="#FAF6ED" />
                    </g>
                  </g>

                  {/* 7c. Devil Head, Crimson Horns, Rolling Ruby Eyes & Undulating Tongue (Pivot at neck 74, 68) */}
                  <g
                    id="cert-head-group"
                    transform={`translate(${certHeadX}, ${certHeadY}) rotate(${certHeadRot}, 74, 68)`}
                  >
                    {/* Wild black hair tuft on top of head */}
                    <path
                      d="M 68,40 L 64,26 L 71,34 L 74,22 L 77,34 L 84,26 L 80,40 Z"
                      fill="#1C1610"
                      stroke="#1C1610"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />

                    {/* Sharp pointed crimson horns */}
                    <path
                      d="M 63,43 Q 53,26 44,16 Q 55,31 62,44 Z"
                      fill="url(#cert-horn-red)"
                      stroke="#1C1610"
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                    />
                    <line x1="57" y1="38" x2="52" y2="34" stroke="#1C1610" strokeWidth="1.5" />
                    <line x1="51" y1="30" x2="48" y2="26" stroke="#1C1610" strokeWidth="1.5" />
                    <path d="M 61,42 Q 52,28 45,18" stroke="#FFA8A8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                    <path
                      d="M 85,43 Q 95,26 104,16 Q 93,31 86,44 Z"
                      fill="url(#cert-horn-red)"
                      stroke="#1C1610"
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                    />
                    <line x1="91" y1="38" x2="96" y2="34" stroke="#1C1610" strokeWidth="1.5" />
                    <line x1="97" y1="30" x2="100" y2="26" stroke="#1C1610" strokeWidth="1.5" />
                    <path d="M 87,42 Q 96,28 103,18" stroke="#FFA8A8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                    {/* Devil Ears */}
                    <path d="M 58,56 C 50,54 51,47 58,50 Z" fill="#241B17" stroke="#1C1610" strokeWidth="2.2" />
                    <path d="M 90,56 C 98,54 97,47 90,50 Z" fill="#241B17" stroke="#1C1610" strokeWidth="2.2" />

                    {/* Round black furry head */}
                    <circle cx="74" cy="56" r="19" fill="#241B17" stroke="#1C1610" strokeWidth="3.2" />

                    {/* Goat beard (kozlí bradka) on chin */}
                    <path
                      d="M 71,72 L 73,83 L 75,74 L 77,82 L 78,72 Z"
                      fill="#1C1610"
                      stroke="#1C1610"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    {/* Left Big Eye */}
                    <g transform={`translate(66, 52) scale(${certEyeScale}) translate(-66, -52)`}>
                      <circle cx="66" cy="52" r="7.4" fill="#FFFDF8" stroke="#1C1610" strokeWidth="2.5" />
                      <path d="M 59,52 A 7 7 0 0 1 66,45" stroke="#DC2626" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                      <circle cx={66 + certPupilDx * 0.7} cy={52 + certPupilDy * 0.7} r="5.0" fill="#B91C1C" />
                      <circle cx={66 + certPupilDx} cy={52 + certPupilDy} r="3.5" fill="#1C1610" />
                      <circle cx={64 + certPupilDx} cy={50 + certPupilDy} r="1.3" fill="#FFFFFF" />
                      <circle cx={67.5 + certPupilDx} cy={53.5 + certPupilDy} r="0.7" fill="#FFFFFF" />
                    </g>

                    {/* Right Big Eye */}
                    <g transform={`translate(82, 52) scale(${certEyeScale}) translate(-82, -52)`}>
                      <circle cx="82" cy="52" r="7.4" fill="#FFFDF8" stroke="#1C1610" strokeWidth="2.5" />
                      <path d="M 75,52 A 7 7 0 0 1 82,45" stroke="#DC2626" strokeWidth="1.2" strokeOpacity="0.6" fill="none" />
                      <circle cx={82 + certPupilDx * 0.7} cy={52 + certPupilDy * 0.7} r="5.0" fill="#B91C1C" />
                      <circle cx={82 + certPupilDx} cy={52 + certPupilDy} r="3.5" fill="#1C1610" />
                      <circle cx={80 + certPupilDx} cy={50 + certPupilDy} r="1.3" fill="#FFFFFF" />
                      <circle cx={83.5 + certPupilDx} cy={53.5 + certPupilDy} r="0.7" fill="#FFFFFF" />
                    </g>

                    {/* Raised bushy eyebrows */}
                    <g transform={`translate(0, ${certBrowDy})`}>
                      <path d="M 58,43 Q 66,39 73,43" stroke="#1C1610" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                      <path d="M 75,43 Q 82,39 90,43" stroke="#1C1610" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* Pug devil nose with 2 nostrils */}
                    <ellipse cx="74" cy="59" rx="3.4" ry="2.6" fill="#1C1610" />
                    <circle cx="72.6" cy="59.4" r="0.7" fill="#886036" />
                    <circle cx="75.4" cy="59.4" r="0.7" fill="#886036" />

                    {/* Grinning devil mouth with white fangs */}
                    <path d="M 62,65 Q 74,74 86,65" stroke="#1C1610" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                    <polygon points="66,65 67.5,70 69.5,65" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1" />
                    <polygon points="79,65 81,70 82.5,65" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1" />

                    {/* Smoothly undulating devil tongue */}
                    <g
                      id="cert-tongue"
                      transform={`translate(74, 66) rotate(${tongueSwingDeg}) scale(${tongueExtend}) translate(-74, -66)`}
                    >
                      <path
                        d="M 72,66 Q 78,76 83,92 Q 91,114 108,118 Q 98,124 81,105 Q 74,88 72,66 Z"
                        fill="#C53026"
                        stroke="#1C1610"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                      />
                      <path d="M 73,68 Q 79,78 85,96 Q 90,108 100,116" stroke="#87140E" strokeWidth="1.5" fill="none" />
                      <path d="M 74,69 Q 78,77 81,89" stroke="#FFA299" strokeWidth="1.1" fill="none" />
                      <polygon points="106,117 110,121 106,122 108,126 104,121" fill="#C53026" stroke="#1C1610" strokeWidth="0.8" />
                    </g>
                  </g>
                </g>

                {/* 8. RIGHT ARM & IRON PITCHFORK (Connected at shoulder -> elbow -> hand grip, natural pitchfork motion!) */}
                <g id="cert-fork-and-arm">
                  {/* Muscular furry right arm from shoulder (rightShoulderX, rightShoulderY) through elbow to hand (handGripX, handGripY) */}
                  <path
                    d={`M ${rightShoulderX},${rightShoulderY} Q ${rightElbowX},${rightElbowY} ${handGripX},${handGripY}`}
                    stroke="#1C1610"
                    strokeWidth="6.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`M ${rightShoulderX},${rightShoulderY} Q ${rightElbowX},${rightElbowY} ${handGripX},${handGripY}`}
                    stroke="#241B17"
                    strokeWidth="4.0"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Fur curl on right elbow */}
                  <path
                    d={`M ${rightElbowX - 2},${rightElbowY - 2} C ${rightElbowX + 3},${rightElbowY} ${rightElbowX + 2},${rightElbowY + 4} ${rightElbowX - 2},${rightElbowY + 2}`}
                    stroke="#1C1610"
                    strokeWidth="1.8"
                    fill="none"
                  />

                  {/* Iron Three-Pronged Pitchfork pivoting smoothly around the hand grip (handGripX, handGripY) */}
                  <g
                    id="cert-pitchfork"
                    transform={`translate(${handGripX}, ${handGripY}) rotate(${pitchforkAngle})`}
                  >
                    {/* Wooden handle shaft (extends from y=-66 above hand down to y=+96 below hand) */}
                    <line x1="0" y1="-66" x2="0" y2="96" stroke="#1C1610" strokeWidth="4.4" strokeLinecap="round" />
                    <line x1="0" y1="-66" x2="0" y2="96" stroke="#8A5128" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="1" y1="-50" x2="1" y2="85" stroke="#5C3214" strokeWidth="1" strokeLinecap="round" />

                    {/* Iron collar ferrule */}
                    <rect x="-3" y="-70" width="6" height="7" fill="#3D4247" stroke="#1C1610" strokeWidth="1.8" rx="1" />

                    {/* Iron crossbar */}
                    <path d="M -14,-68 Q 0,-62 14,-68" fill="none" stroke="#1C1610" strokeWidth="4.0" strokeLinecap="round" />
                    <path d="M -14,-68 Q 0,-62 14,-68" fill="none" stroke="#717A85" strokeWidth="2.1" strokeLinecap="round" />

                    {/* Left prong (sharp curved tine) */}
                    <path d="M -14,-68 Q -16,-82 -18,-95" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M -14,-68 Q -16,-82 -18,-95" fill="none" stroke="#8C97A4" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Center prong */}
                    <line x1="0" y1="-68" x2="0" y2="-99" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                    <line x1="0" y1="-68" x2="0" y2="-99" stroke="#FAF6ED" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Right prong */}
                    <path d="M 14,-68 Q 16,-82 18,-95" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                    <path d="M 14,-68 Q 16,-82 18,-95" fill="none" stroke="#8C97A4" strokeWidth="1.8" strokeLinecap="round" />

                    {/* Subtle metallic glint & thrust motion lines during jab */}
                    {actionStrike > 0.25 && (
                      <g opacity={Math.min(1, (actionStrike - 0.25) * 1.6)}>
                        <line x1="-22" y1="-88" x2="-34" y2="-82" stroke="#FAF6ED" strokeWidth="2.0" strokeLinecap="round" />
                        <line x1="-4" y1="-103" x2="-18" y2="-97" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" />
                        <circle cx="0" cy="-101" r="2.2" fill="#FEF08A" />
                      </g>
                    )}

                    {/* Clawed devil fist clutching the pitchfork shaft firmly at (0, 0) */}
                    <ellipse cx="0" cy="0" rx="5.0" ry="5.4" fill="#1C1610" />
                    <path d="M -3,-4 Q 2,-5 5,-3" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d="M -4,-1 Q 2,-2 5,0" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d="M -4,2 Q 2,1 5,3" stroke="#FAF6ED" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d="M -3,5 Q 2,4 4,6" stroke="#FAF6ED" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <line x1="-2" y1="-3" x2="-2" y2="4" stroke="#4D3B31" strokeWidth="1.2" />
                  </g>
                </g>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* MAIN LETTERING: "BUBÁKOV" (ANIMATED FOLK WAVE LETTERS)         */}
          {/* ============================================================== */}
          <g id="bubakov-word-group" filter="url(#lada-ink-spread)">
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

            {/* Individually animated B-U-B-Á-K-O-V letters in playful Czech village folk wave */}
            {[
              { char: 'B', x: 256, badgeColor: '#FACC15' },
              { char: 'U', x: 314, badgeColor: '#38BDF8' },
              { char: 'B', x: 372, badgeColor: '#4ADE80' },
              { char: 'A', x: 430, badgeColor: '#FACC15', hasCarka: true },
              { char: 'K', x: 488, badgeColor: '#E11D48' },
              { char: 'O', x: 546, badgeColor: '#38BDF8' },
              { char: 'V', x: 604, badgeColor: '#FACC15' },
            ].map((item, idx) => {
              const wavePhase = t * 3.2 - idx * 0.62;
              const jumpElapsed = t - (letterJumpRef.current[idx] ?? -100);
              const jumpEnv =
                jumpElapsed >= 0 && jumpElapsed < 0.75
                  ? Math.sin((jumpElapsed / 0.75) * Math.PI)
                  : 0;

              const dy = Math.sin(wavePhase) * 4.2 - jumpEnv * 11;
              const rot =
                Math.cos(wavePhase * 0.85) * 3.6 +
                Math.sin(jumpElapsed * 18) * jumpEnv * 10;
              const scale = 1 + Math.max(0, Math.sin(wavePhase)) * 0.045 + jumpEnv * 0.14;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  transform={`translate(${item.x}, ${(114 + dy).toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${scale.toFixed(3)})`}
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
                    y="2"
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
                      transform={`translate(-16, ${(-72 + Math.sin(wavePhase - 0.5) * 2.2).toFixed(2)}) rotate(${(Math.cos(wavePhase - 0.4) * 5).toFixed(2)}, 20, 10)`}
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
              );
            })}
          </g>

          {/* ============================================================== */}
          {/* CLEAN BASELINE FOLK ORNAMENT UNDER TITLE (SWAYING & BLOOMING)  */}
          {/* ============================================================== */}
          <g id="bubakov-sub-ornament" transform="translate(430, 148)">
            {/* Left sprig branch with animated folk flowers & breathing leaves */}
            <g transform={`rotate(${(Math.sin(t * 2.4) * 2.5).toFixed(2)})`}>
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
              <g transform={`translate(-78, 0) rotate(${(t * 36).toFixed(1)}) scale(${(1 + Math.sin(t * 3.5) * 0.1).toFixed(3)})`}>
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
              {/* Animated Carmine Rose flower at tip x=-104 */}
              <g transform={`translate(-104, 0) rotate(${(-t * 30).toFixed(1)}) scale(${(1 + Math.cos(t * 3.2) * 0.1).toFixed(3)})`}>
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

            {/* Central spinning golden & poppy folk flower rosette */}
            <g transform={`rotate(${(t * 32).toFixed(1)}) scale(${(1 + Math.sin(t * 3.6) * 0.1).toFixed(3)})`}>
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
            <g transform={`rotate(${(-Math.sin(t * 2.4) * 2.5).toFixed(2)})`}>
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
              <g transform={`translate(78, 0) rotate(${(-t * 36).toFixed(1)}) scale(${(1 + Math.sin(t * 3.5 + 0.5) * 0.1).toFixed(3)})`}>
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
              {/* Animated Carmine Rose flower at tip x=104 */}
              <g transform={`translate(104, 0) rotate(${(t * 30).toFixed(1)}) scale(${(1 + Math.cos(t * 3.2 + 0.5) * 0.1).toFixed(3)})`}>
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
        </svg>
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
