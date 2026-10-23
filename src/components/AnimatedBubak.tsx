import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio';

export interface AnimatedBubakProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  frameRateMs?: number;
  interactive?: boolean;
  showBadge?: boolean;
  onFrameChange?: (frame: number) => void;
}

export interface BubakFramePose {
  headX: number;
  headY: number;
  headRot: number;
  headScale: number;
  browDy: number;
  pupilDx: number;
  pupilDy: number;
  eyeSquintLeft: number;
  eyeScaleRight: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthRot: number;
  mouthType: 'open' | 'wide' | 'snarl' | 'chomp' | 'smirk';
  leftArmAngle: number;
  rightArmAngle: number;
  torsoX: number;
  torsoY: number;
  torsoScaleX: number;
  torsoScaleY: number;
  skirtRot: number;
}

export const BUBAK_FRAME_NAMES = [
  'Základní postoj z knihy (vyceněné zuby & zvednuté paže)',
  'Příprava k bafnutí (přikrčení, pohled doleva, nápřah)',
  'Velké BAF! (obří tlama, vyvalené oči, rozpažené rukávy)',
  'Záchvěv děsu (chvění paží a zubů, pohled doprava)',
  'Cvaknutí zuby (zaklapnutí čelistí se zuby do sebe jako zip)',
  'Šibalský úšklebek (pokřivený úsměv, houpavé rukávy)',
  'Plynulý návrat (nadechnutí a návrat do výchozí polohy)',
];

export const BUBAK_POSES: BubakFramePose[] = [
  {
    headX: 0,
    headY: 0,
    headRot: 0,
    headScale: 1,
    browDy: 0,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1,
    mouthScaleY: 1,
    mouthRot: 0,
    mouthType: 'open',
    leftArmAngle: 0,
    rightArmAngle: 0,
    torsoX: 0,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 0,
  },
  {
    headX: -2.5,
    headY: 2,
    headRot: -6,
    headScale: 0.98,
    browDy: 1.5,
    pupilDx: -2.8,
    pupilDy: 0.6,
    eyeSquintLeft: 0.85,
    eyeScaleRight: 0.95,
    mouthScaleX: 0.92,
    mouthScaleY: 0.78,
    mouthRot: -2,
    mouthType: 'snarl',
    leftArmAngle: 12,
    rightArmAngle: -12,
    torsoX: -1.5,
    torsoY: 1,
    torsoScaleX: 0.98,
    torsoScaleY: 0.98,
    skirtRot: 2.5,
  },
  {
    headX: 0,
    headY: 3.5,
    headRot: 0,
    headScale: 1.08,
    browDy: -1.5,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1.15,
    eyeScaleRight: 1.15,
    mouthScaleX: 1.25,
    mouthScaleY: 1.35,
    mouthRot: 0,
    mouthType: 'wide',
    leftArmAngle: -16,
    rightArmAngle: 16,
    torsoX: 0,
    torsoY: -0.5,
    torsoScaleX: 1.05,
    torsoScaleY: 1.02,
    skirtRot: 0,
  },
  {
    headX: 2.5,
    headY: -1,
    headRot: 6,
    headScale: 1.02,
    browDy: -0.5,
    pupilDx: 2.8,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1.1,
    mouthScaleY: 0.95,
    mouthRot: 3,
    mouthType: 'wide',
    leftArmAngle: -8,
    rightArmAngle: 8,
    torsoX: 1.5,
    torsoY: -0.5,
    torsoScaleX: 1.02,
    torsoScaleY: 1,
    skirtRot: -2.5,
  },
  {
    headX: 1,
    headY: -3,
    headRot: 2,
    headScale: 0.99,
    browDy: -1,
    pupilDx: 0,
    pupilDy: 2.4,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 1,
    mouthScaleY: 1,
    mouthRot: 0,
    mouthType: 'chomp',
    leftArmAngle: 20,
    rightArmAngle: -18,
    torsoX: 0,
    torsoY: 0.5,
    torsoScaleX: 0.99,
    torsoScaleY: 1,
    skirtRot: 0,
  },
  {
    headX: -1,
    headY: -1,
    headRot: -3,
    headScale: 1,
    browDy: 0.5,
    pupilDx: -1.5,
    pupilDy: -1.5,
    eyeSquintLeft: 0.78,
    eyeScaleRight: 1.05,
    mouthScaleX: 1.05,
    mouthScaleY: 0.85,
    mouthRot: -4,
    mouthType: 'smirk',
    leftArmAngle: 6,
    rightArmAngle: -6,
    torsoX: -0.5,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 1.5,
  },
  {
    headX: 0,
    headY: 0,
    headRot: 0,
    headScale: 1,
    browDy: 0,
    pupilDx: 0,
    pupilDy: 0,
    eyeSquintLeft: 1,
    eyeScaleRight: 1,
    mouthScaleX: 0.98,
    mouthScaleY: 0.95,
    mouthRot: 0,
    mouthType: 'open',
    leftArmAngle: 0,
    rightArmAngle: 0,
    torsoX: 0,
    torsoY: 0,
    torsoScaleX: 1,
    torsoScaleY: 1,
    skirtRot: 0,
  },
];

/**
 * Animated Bubák (Strašák) from the classic Josef Lada book cover "Bubáci a hastrmani".
 * Smooth 60 FPS continuous procedural kinematics with zero jerky frame jumps.
 */
export const AnimatedBubak: React.FC<AnimatedBubakProps> = ({
  className = '',
  width = 160,
  height = 190,
  autoPlay = true,
  frameRateMs = 540,
  interactive = true,
  showBadge = false,
  onFrameChange,
}) => {
  const [animTime, setAnimTime] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const animTimeRef = useRef<number>(0);
  const scareStartRef = useRef<number>(-100);
  const hoverMixRef = useRef<number>(0);
  const lastReportedFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!autoPlay) return;

    let rafId: number;
    let lastNow = performance.now();
    const speedScale = 540 / Math.max(200, frameRateMs);

    const tick = (now: number) => {
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      animTimeRef.current += dt * speedScale;
      const t = animTimeRef.current;

      const targetHover = isHovered ? 1 : 0;
      hoverMixRef.current += (targetHover - hoverMixRef.current) * (1 - Math.exp(-dt * 7));

      if (onFrameChange) {
        const approxFrame = Math.floor((t * 1.5) % 7);
        if (approxFrame !== lastReportedFrameRef.current) {
          lastReportedFrameRef.current = approxFrame;
          onFrameChange(approxFrame);
        }
      }

      setAnimTime(t);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoPlay, frameRateMs, isHovered, onFrameChange]);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();

    try {
      sound.caneWhip();
    } catch {}

    scareStartRef.current = animTimeRef.current;
  };

  const t = animTime;
  const bHover = hoverMixRef.current;
  const scareElapsed = t - scareStartRef.current;
  const isScaringActive = scareElapsed >= 0 && scareElapsed < 1.65;
  const scareEnv = isScaringActive
    ? Math.sin(Math.min(1, scareElapsed / 0.28) * (Math.PI / 2)) *
      Math.pow(Math.max(0, 1 - Math.max(0, scareElapsed - 0.28) / 1.37), 1.6)
    : 0;
  const scareChompWave = isScaringActive && scareElapsed > 0.55
    ? Math.sin((scareElapsed - 0.55) * 14) * Math.exp(-(scareElapsed - 0.55) * 2.5)
    : 0;

  const bPhase = t * (1.5 + bHover * 0.35);
  const bSlow = t * 0.85;

  const rootScale = 1 + bHover * 0.025 + scareEnv * 0.065;
  const rootLiftY = -bHover * 1 - scareEnv * 3;

  const torsoX = Math.sin(bPhase) * 1.4 - scareEnv * 0.5;
  const torsoY = Math.sin(bPhase * 2) * 0.9 - scareEnv * 1.8;
  const torsoRot = Math.sin(bPhase) * 2.2 + Math.sin(t * 18) * scareEnv * 2.5;
  const torsoScaleX = 1 + Math.sin(bPhase * 2) * 0.018 + scareEnv * 0.045;
  const torsoScaleY = 1 - Math.sin(bPhase * 2) * 0.014 + scareEnv * 0.025;
  const skirtRot = Math.sin(bPhase - 0.55) * 3.2 + Math.sin(t * 14) * scareEnv * 3.0;

  const leftArmAngle =
    Math.sin(bPhase - 0.2) * 11 +
    Math.cos(bSlow * 1.7) * 4 -
    bHover * 5 -
    scareEnv * 22 +
    Math.sin(t * 20) * scareEnv * 6;
  const rightArmAngle =
    Math.sin(bPhase + 0.3) * 11 -
    Math.cos(bSlow * 1.7) * 4 +
    bHover * 5 +
    scareEnv * 22 -
    Math.sin(t * 20) * scareEnv * 6;

  const leftCuffFlutter = Math.sin(t * 4.2) * 4 + Math.sin(t * 24) * scareEnv * 8;
  const rightCuffFlutter = Math.cos(t * 4.5) * 4 - Math.sin(t * 24) * scareEnv * 8;

  const headX = Math.sin(bPhase + 0.2) * 2.0;
  const headY = Math.cos(bPhase * 2) * 1.2 - scareEnv * 2.2;
  const headRot = Math.sin(bPhase - 0.15) * 5.2 + Math.sin(t * 22) * scareEnv * 4.5;
  const headScale = 1 + Math.max(0, Math.sin(bPhase)) * 0.03 + scareEnv * 0.08;

  const pupilDx = Math.sin(bSlow * 1.4) * 2.3 * (1 - scareEnv * 0.7);
  const pupilDy = Math.cos(bSlow * 1.1) * 1.1 * (1 - scareEnv * 0.7);
  const eyeSquintL = 0.94 + Math.sin(bPhase + 0.8) * 0.08 + scareEnv * 0.18;
  const eyeScaleR = 0.97 + Math.cos(bPhase) * 0.06 + scareEnv * 0.16;
  const browDy = Math.cos(bPhase) * 1.1 - scareEnv * 2.0;

  const idleMouthWave = 0.72 + Math.sin(bPhase) * 0.32 + Math.cos(bPhase * 2) * 0.15;
  const mouthOpen = Math.max(
    0.16,
    Math.min(1.48, idleMouthWave + scareEnv * 0.65 + scareChompWave * 0.45)
  );
  const mouthScaleX = 0.96 + (mouthOpen - 0.7) * 0.22 + scareEnv * 0.12;
  const mouthRot = Math.sin(bPhase * 0.7) * 2.2;

  const currentFrameIdx = Math.floor((t * 1.5) % 7);

  return (
    <div
      className={`animated-bubak-wrapper relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ width, height }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Bubák z knihy Bubáci a hastrmani (klikni pro bafnutí!)"
      role="img"
      aria-label="Animovaný Bubák Josefa Lady"
    >
      <svg
        viewBox="0 0 170 195"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="bubak-anim-burlap-dots"
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

          <pattern
            id="bubak-anim-frond-texture"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="#1E2319" />
            <circle cx="2" cy="3" r="0.8" fill="#5F733E" />
            <circle cx="6" cy="6" r="0.8" fill="#7C924F" />
            <circle cx="5" cy="1.5" r="0.6" fill="#A8813C" />
          </pattern>

          <radialGradient id="bubak-anim-mouth-depth" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#8A1310" />
            <stop offset="65%" stopColor="#B3211B" />
            <stop offset="100%" stopColor="#5E0B09" />
          </radialGradient>
        </defs>

        <g transform={`translate(84, ${100 + rootLiftY}) scale(${rootScale}) translate(-84, -100)`}>
          {/* 1. Grounded Wooden Pole */}
          <g id="bubak-anim-stake">
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
          </g>

          {/* 2. Articulated Upper Body */}
          <g transform={`translate(${torsoX}, ${torsoY}) rotate(${torsoRot}, 84, 124)`}>
            {/* Lower Shredded Frond Skirt */}
            <g id="bubak-anim-skirt" transform={`rotate(${skirtRot}, 84, 126)`}>
              <path
                d="M 54,124 Q 40,140 32,154 Q 44,148 56,134 Q 68,158 84,164 Q 100,158 112,134 Q 124,148 136,154 Q 128,140 114,124 Z"
                fill="url(#bubak-anim-frond-texture)"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path d="M 84,130 L 84,160 M 70,128 L 52,148 M 98,128 L 116,148" stroke="#3D4B2A" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Left Arm */}
            <g id="bubak-anim-left-arm" transform={`rotate(${leftArmAngle}, 68, 74)`}>
              <polygon
                points="68,76 34,58 14,38 28,32 54,48 74,68"
                fill="url(#bubak-anim-burlap-dots)"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path d="M 46,58 C 38,54 30,48 24,42" stroke="#1C1610" strokeWidth="2" fill="none" />
              <path d="M 56,66 C 48,60 40,54 34,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />
              <g transform={`rotate(${leftCuffFlutter}, 24, 38)`}>
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

            {/* Right Arm */}
            <g id="bubak-anim-right-arm" transform={`rotate(${rightArmAngle}, 100, 74)`}>
              <polygon
                points="100,76 134,58 154,38 140,32 114,48 94,68"
                fill="url(#bubak-anim-burlap-dots)"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              <path d="M 122,58 C 130,54 138,48 144,42" stroke="#1C1610" strokeWidth="2" fill="none" />
              <path d="M 112,66 C 120,60 128,54 134,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />
              <g transform={`rotate(${rightCuffFlutter}, 144, 38)`}>
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

            {/* Persistent Stable Torso */}
            <g
              id="bubak-anim-torso"
              transform={`translate(84, 98) scale(${torsoScaleX}, ${torsoScaleY}) translate(-84, -98)`}
            >
              <ellipse
                cx="84"
                cy="98"
                rx="24.5"
                ry="29.5"
                fill="url(#bubak-anim-burlap-dots)"
                stroke="#1C1610"
                strokeWidth="3.4"
              />
              <path d="M 84,69 L 84,127" stroke="#486935" strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 84,69 L 84,127" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
              {[76, 86, 96, 106, 116, 123].map((y) => (
                <line key={`anim-seam-stitch-${y}`} x1="81" y1={y} x2="87" y2={y} stroke="#1C1610" strokeWidth="1.8" />
              ))}
              <path d="M 65,88 C 72,92 78,92 82,90" stroke="#1C1610" strokeWidth="2.2" fill="none" />
              <path d="M 86,90 C 92,92 98,92 103,88" stroke="#1C1610" strokeWidth="2.2" fill="none" />
              <path d="M 66,108 C 73,112 78,112 82,110" stroke="#1C1610" strokeWidth="2.2" fill="none" />
              <path d="M 86,110 C 92,112 97,112 102,108" stroke="#1C1610" strokeWidth="2.2" fill="none" />
              <path d="M 62,96 C 63,102 64,108 67,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />
              <path d="M 106,96 C 105,102 104,108 101,114" stroke="#8A5C2C" strokeWidth="1.4" fill="none" />

              {/* Patches */}
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

            {/* Burlap Sack Head */}
            <g
              id="bubak-anim-head"
              transform={`translate(${headX}, ${headY}) rotate(${headRot}, 84, 68) translate(84, 68) scale(${headScale}) translate(-84, -68)`}
            >
              <g transform="translate(84, 42)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx="20.5"
                  ry="25.5"
                  fill="url(#bubak-anim-burlap-dots)"
                  stroke="#1C1610"
                  strokeWidth="3.4"
                />
                <line x1="0" y1="-25" x2="0" y2="-32" stroke="#D9A036" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="-4" y1="-24" x2="-9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="4" y1="-24" x2="9" y2="-30" stroke="#D9A036" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M -16,-6 C -12,-8 -8,-8 -6,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />
                <path d="M 6,-6 C 8,-8 12,-8 16,-6" stroke="#1C1610" strokeWidth="1.8" fill="none" />

                {/* Brow Furrow Ticks */}
                <g transform={`translate(0, ${browDy})`}>
                  <line x1="-3" y1="-17" x2="-2" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                  <line x1="2" y1="-17" x2="3" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
                </g>

                {/* Left Eye */}
                <g transform={`translate(-8, -8) scale(1, ${eyeSquintL})`}>
                  <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                  <g transform={`translate(${pupilDx}, ${pupilDy})`}>
                    <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                    <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Right Eye */}
                <g transform={`translate(8, -8) scale(${eyeScaleR})`}>
                  <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
                  <g transform={`translate(${pupilDx}, ${pupilDy})`}>
                    <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                    <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Snout / Button Nose with two nostrils */}
                <ellipse cx="0" cy="1" rx="3.6" ry="3.2" fill="#A06E3B" stroke="#1C1610" strokeWidth="2.2" />
                <circle cx="-1.2" cy="1.2" r="0.8" fill="#1C1610" />
                <circle cx="1.2" cy="1.2" r="0.8" fill="#1C1610" />

                {/* Continuous Unified Mouth */}
                <g
                  transform={`translate(0, 11) rotate(${mouthRot}) scale(${mouthScaleX}, ${mouthOpen}) translate(0, -11)`}
                >
                  <path
                    d="M -12,7 C -12,3 12,3 12,7 C 13,20 -13,20 -12,7 Z"
                    fill="url(#bubak-anim-mouth-depth)"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="-10,6 -8,11 -6,6 -4,11 -2,6 0,11 2,6 4,11 6,6 8,11 10,6"
                    fill="#FAF6ED"
                    stroke="#1C1610"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
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
      </svg>

      {showBadge && (
        <div className="absolute -bottom-2 bg-amber-950/85 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-600/50 shadow-sm pointer-events-none tracking-wider">
          {BUBAK_FRAME_NAMES[currentFrameIdx]}
        </div>
      )}
    </div>
  );
};
