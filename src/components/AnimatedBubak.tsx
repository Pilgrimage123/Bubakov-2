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
  // Snímek 1: Základní postoj z knihy
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
  // Snímek 2: Příprava k bafnutí (přikrčení, pohled doleva, nápřah)
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
  // Snímek 3: Velké BAF! (obří tlama, vyvalené oči, rozpažené rukávy)
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
  // Snímek 4: Záchvěv děsu (chvění paží a zubů, pohled doprava)
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
  // Snímek 5: Cvaknutí zuby (zaklapnutí čelistí se zuby do sebe jako zip)
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
  // Snímek 6: Šibalský úšklebek (pokřivený úsměv, houpavé rukávy)
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
  // Snímek 7: Plynulý návrat (nadechnutí a návrat do výchozí polohy)
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
 *
 * Meticulously modeled on the original Josef Lada cover art with extra detail:
 * - Extremely smooth, slow theatrical animation (540ms cadence, 440ms easing)
 * - Persistent stable torso with green seam and stitches (zero popping lines)
 * - Coordinated mobile movements of hands, head, eyes, and mouth across 7 frames
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
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isScaring, setIsScaring] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const scareTimeoutRef = useRef<number | null>(null);

  // Animation cycle: slow & stately (~540ms default)
  useEffect(() => {
    if (!autoPlay || isScaring) return;

    const currentDelay = isHovered ? Math.max(380, frameRateMs * 0.8) : frameRateMs;

    const interval = window.setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % 7;
        if (onFrameChange) onFrameChange(next);
        return next;
      });
    }, currentDelay);

    return () => window.clearInterval(interval);
  }, [autoPlay, frameRateMs, isHovered, isScaring, onFrameChange]);

  // Click interaction: jumps straight to the big scare (Frame 2) and plays sound
  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();

    try {
      sound.caneWhip();
    } catch {}

    setIsScaring(true);
    setCurrentFrame(2); // The big "BAF!" roar

    if (scareTimeoutRef.current) {
      window.clearTimeout(scareTimeoutRef.current);
    }

    scareTimeoutRef.current = window.setTimeout(() => {
      setCurrentFrame(3);
      scareTimeoutRef.current = window.setTimeout(() => {
        setCurrentFrame(4);
        scareTimeoutRef.current = window.setTimeout(() => {
          setIsScaring(false);
          setCurrentFrame(0);
        }, 520);
      }, 480);
    }, 620);
  };

  const pose = BUBAK_POSES[currentFrame] || BUBAK_POSES[0];

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
        style={{
          transform: isScaring
            ? 'scale(1.08) translateY(-4px)'
            : isHovered
            ? 'scale(1.03) translateY(-1px)'
            : 'scale(1)',
          transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          filter: isScaring
            ? 'drop-shadow(0 6px 12px rgba(197, 48, 38, 0.4))'
            : isHovered
            ? 'drop-shadow(0 4px 8px rgba(28, 22, 16, 0.3))'
            : 'drop-shadow(0 2px 4px rgba(28, 22, 16, 0.2))',
        }}
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

        {/* 1. Grounded Wooden Pole */}
        <g id="bubak-anim-stake">
          <rect
            x="79.5"
            y="136"
            width="9"
            height="56"
            fill="#783E24"
            stroke="#1C1610"
            strokeWidth="2.8"
            rx="1.5"
          />
          <line x1="82.5" y1="140" x2="82.5" y2="190" stroke="#9A5632" strokeWidth="1.6" />
          <line x1="85.5" y1="142" x2="85.5" y2="186" stroke="#522712" strokeWidth="1.2" />
          <ellipse cx="83.5" cy="164" rx="2" ry="3.2" fill="#3D1A0B" stroke="#1C1610" strokeWidth="1" />
        </g>

        {/* 2. Lower Shredded Frond Skirt */}
        <g
          id="bubak-anim-skirt"
          style={{
            transformOrigin: '84px 126px',
            transform: `rotate(${pose.skirtRot}deg)`,
            transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          }}
        >
          <path
            d="M 54,124 Q 40,140 32,154 Q 44,148 56,134 Q 68,158 84,164 Q 100,158 112,134 Q 124,148 136,154 Q 128,140 114,124 Z"
            fill="url(#bubak-anim-frond-texture)"
            stroke="#1C1610"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M 84,130 L 84,160 M 70,128 L 52,148 M 98,128 L 116,148" stroke="#3D4B2A" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* 3. Left Arm */}
        <g
          id="bubak-anim-left-arm"
          style={{
            transformOrigin: '68px 74px',
            transform: `rotate(${pose.leftArmAngle}deg)`,
            transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          }}
        >
          <polygon
            points="68,76 34,58 14,38 28,32 54,48 74,68"
            fill="url(#bubak-anim-burlap-dots)"
            stroke="#1C1610"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M 46,58 C 38,54 30,48 24,42" stroke="#1C1610" strokeWidth="2" fill="none" />
          <path d="M 56,66 C 48,60 40,54 34,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />
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

        {/* 4. Right Arm */}
        <g
          id="bubak-anim-right-arm"
          style={{
            transformOrigin: '100px 74px',
            transform: `rotate(${pose.rightArmAngle}deg)`,
            transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          }}
        >
          <polygon
            points="100,76 134,58 154,38 140,32 114,48 94,68"
            fill="url(#bubak-anim-burlap-dots)"
            stroke="#1C1610"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M 122,58 C 130,54 138,48 144,42" stroke="#1C1610" strokeWidth="2" fill="none" />
          <path d="M 112,66 C 120,60 128,54 134,48" stroke="#8A5C2C" strokeWidth="1.5" fill="none" />
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

        {/* 5. Persistent Stable Torso (NO POPPING STRIPES!) */}
        <g
          id="bubak-anim-torso"
          style={{
            transformOrigin: '84px 98px',
            transform: `translate(${pose.torsoX}px, ${pose.torsoY}px) scale(${pose.torsoScaleX}, ${pose.torsoScaleY})`,
            transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          }}
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
          {/* Smooth, persistent organic fold wrinkles */}
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

        {/* 6. Burlap Sack Head */}
        <g
          id="bubak-anim-head"
          style={{
            transformOrigin: '84px 68px',
            transform: `translate(${pose.headX}px, ${pose.headY}px) rotate(${pose.headRot}deg) scale(${pose.headScale})`,
            transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
          }}
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
            <g
              style={{
                transform: `translateY(${pose.browDy}px)`,
                transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
              }}
            >
              <line x1="-3" y1="-17" x2="-2" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="2" y1="-17" x2="3" y2="-12" stroke="#1C1610" strokeWidth="2.6" strokeLinecap="round" />
            </g>

            {/* Left Eye */}
            <g
              style={{
                transform: `translate(-8px, -8px) scaleY(${pose.eyeSquintLeft})`,
                transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
              }}
            >
              <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
              <g
                style={{
                  transform: `translate(${pose.pupilDx}px, ${pose.pupilDy}px)`,
                  transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                }}
              >
                <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
              </g>
            </g>

            {/* Right Eye */}
            <g
              style={{
                transform: `translate(8px, -8px) scale(${pose.eyeScaleRight})`,
                transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
              }}
            >
              <circle cx="0" cy="0" r="6.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2.6" />
              <g
                style={{
                  transform: `translate(${pose.pupilDx}px, ${pose.pupilDy}px)`,
                  transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
                }}
              >
                <circle cx="0.5" cy="0" r="3" fill="#1C1610" />
                <circle cx="-0.5" cy="-1" r="1" fill="#FFFFFF" />
              </g>
            </g>

            {/* Snout / Button Nose with two nostrils */}
            <ellipse cx="0" cy="1" rx="3.6" ry="3.2" fill="#A06E3B" stroke="#1C1610" strokeWidth="2.2" />
            <circle cx="-1.2" cy="1.2" r="0.8" fill="#1C1610" />
            <circle cx="1.2" cy="1.2" r="0.8" fill="#1C1610" />

            {/* Mouth */}
            <g
              style={{
                transformOrigin: '0px 11px',
                transform: `scale(${pose.mouthScaleX}, ${pose.mouthScaleY}) rotate(${pose.mouthRot}deg)`,
                transition: 'transform 440ms cubic-bezier(0.35, 0, 0.25, 1)',
              }}
            >
              {pose.mouthType === 'chomp' ? (
                <g id="anim-mouth-chomp">
                  <path d="M -11,9 Q 0,11 11,9 Q 0,7 -11,9 Z" fill="#6E0F0C" />
                  <polygon
                    points="-11,6 -9,12 -7,6 -5,12 -3,6 -1,12 1,6 3,12 5,6 7,12 9,6 11,12 11,7 -11,7"
                    fill="#FAF6ED"
                    stroke="#1C1610"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points="-11,13 -9,7 -7,13 -5,7 -3,13 -1,7 1,13 3,7 5,13 7,7 9,13 11,7 11,12 -11,12"
                    fill="#FAF6ED"
                    stroke="#1C1610"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <path d="M -12,9 Q 0,10 12,9" stroke="#1C1610" strokeWidth="2.4" fill="none" />
                </g>
              ) : (
                <g id="anim-mouth-open">
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
              )}
            </g>
          </g>
        </g>
      </svg>

      {/* Frame Badge */}
      {showBadge && (
        <div className="absolute -bottom-2 bg-amber-950/85 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-600/50 shadow-sm pointer-events-none tracking-wider">
          SNÍMEK {currentFrame + 1}/7 • {BUBAK_FRAME_NAMES[currentFrame]}
        </div>
      )}
    </div>
  );
};
