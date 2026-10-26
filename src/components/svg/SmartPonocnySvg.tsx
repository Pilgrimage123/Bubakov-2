import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartPonocnySvg - Interactive smart vector SVG character component
 * Ponocný (Watchman) - legendary night guardian of the village with his dog Voříšek
 *
 * Features:
 * - Heavy slate-blue overcoat with brass double-breasted buttons & leather belt
 * - Black felt watchman's hat with brass cockade
 * - Forged halberd (kovaná halapartna) with clover cutout
 * - Hanging candle lantern casting warm glow
 * - Faithful Voříšek dog companion walking at his side
 * - Full interactive states: idle, walk, sprint, action, react, flee
 */
export const SmartPonocnySvg: React.FC<SmartCharacterProps> = ({
  state = 'walk',
  time: externalTime,
  speed = 1,
  isPlaying = true,
  direction = 1,
  size = 400,
  interactive = true,
  className = '',
  style = {},
  onClick,
  features = {},
}) => {
  const {
    showParticles = true,
    showShadow = true,
    showOutline = true,
    showCompanion = true,
  } = features;

  const [localTime, setLocalTime] = useState<number>(0);
  const [pointer, setPointer] = useState<MousePointerState>({ x: 0, y: 0, isHovered: false });
  const animRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!isPlaying && externalTime === undefined) return;

    let mounted = true;
    const loop = (now: number) => {
      const dt = Math.min((now - lastTimestampRef.current) / 1000, 0.1);
      lastTimestampRef.current = now;

      if (isPlaying) {
        setLocalTime((prev) => prev + dt * speed);
      }
      if (mounted) {
        animRef.current = requestAnimationFrame(loop);
      }
    };

    lastTimestampRef.current = performance.now();
    animRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed, externalTime]);

  const t = externalTime !== undefined ? externalTime : localTime;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setPointer({ x: Math.max(-1, Math.min(1, nx * direction)), y: Math.max(-1, Math.min(1, ny)), isHovered: true });
  };

  const handlePointerLeave = () => {
    setPointer({ x: 0, y: 0, isHovered: false });
  };

  const isWalking = state === 'walk';
  const isSprinting = state === 'sprint';
  const isAction = state === 'action';
  const isReact = state === 'react';
  const isFleeing = state === 'flee';
  const isMoving = isWalking || isSprinting || isFleeing;

  const walkSpeed = isFleeing ? 16 : isSprinting ? 13 : isWalking ? 8 : isAction ? 10 : isReact ? 18 : 2.2;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  const bobY = isFleeing
    ? -Math.abs(walkSin) * 12
    : isSprinting
    ? -Math.abs(walkSin) * 10
    : isWalking
    ? -Math.abs(walkSin) * 6
    : isAction
    ? -Math.abs(Math.sin(t * 12)) * 8
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 10 - 4
    : Math.sin(t * 2.5) * 2;

  const bodyLean = isFleeing
    ? 12 + walkSin * 3
    : isSprinting
    ? 10 + walkSin * 2.5
    : isWalking
    ? 4 + walkSin * 2
    : isAction
    ? -6 + Math.sin(t * 8) * 4
    : isReact
    ? -10 + Math.sin(t * 20) * 3
    : Math.sin(t * 1.8) * 1;

  const backFootX = isMoving ? -16 + walkSin * 18 : -16;
  const frontFootX = isMoving ? 16 - walkSin * 18 : 16;

  const gazeX = pointer.isHovered ? pointer.x * 3.5 : Math.sin(t * 1.2) * 1;
  const gazeY = pointer.isHovered ? pointer.y * 2.5 : 0;

  const strokeCol = '#1E1108';

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`smart-ponocny-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart Ponocný – legendární strážce noci"
    >
      <defs>
        <radialGradient id="ponocnySkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF4EC" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>
        <linearGradient id="ponocnyCoatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <radialGradient id="lanternGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(200, 200) scale(${direction}, 1) translate(-200, -200)`}>
        {showShadow && (
          <ellipse cx="200" cy="370" rx="65" ry="13" fill="#1C1917" opacity="0.28" />
        )}

        {/* LANTERN LIGHT AURA */}
        <circle cx="150" cy="250" r="45" fill="url(#lanternGlowGrad)" />

        {/* DOG VOŘÍŠEK COMPANION */}
        {showCompanion && (
          <g id="vorisek-dog" transform={`translate(270, ${325 + Math.sin(t * 10) * 3})`}>
            {/* Body */}
            <ellipse cx="0" cy="0" rx="20" ry="13" fill="#B45309" stroke={strokeCol} strokeWidth="2" />
            {/* Legs */}
            <line x1="-10" y1="10" x2="-10" y2="24" stroke={strokeCol} strokeWidth="3" />
            <line x1="10" y1="10" x2="10" y2="24" stroke={strokeCol} strokeWidth="3" />
            {/* Head & Ears */}
            <circle cx="-16" cy="-10" r="10" fill="#B45309" stroke={strokeCol} strokeWidth="2" />
            <path d="M -22,-18 C -26,-8 -20,-4 -18,-10" fill="#78350F" stroke={strokeCol} strokeWidth="1.5" />
            <circle cx="-19" cy="-11" r="1.5" fill="#1C1917" />
            <circle cx="-24" cy="-8" r="2.5" fill="#1C1917" />
            {/* Wagging Tail */}
            <path d={`M 18,-2 Q 28,-15 ${26 + Math.sin(t * 12) * 5},-20`} fill="none" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            <path d={`M 18,-2 Q 28,-15 ${26 + Math.sin(t * 12) * 5},-20`} fill="none" stroke={strokeCol} strokeWidth="1.8" />
          </g>
        )}

        <g transform={`translate(0, ${bobY}) rotate(${bodyLean}, 200, 260)`}>
          {/* FEET / HEAVY BOOTS */}
          <g id="ponocny-boots">
            <path d={`M ${185 + backFootX},350 L ${210 + backFootX},350 L 212,366 L 180,366 Z`} fill="#18181B" stroke={strokeCol} strokeWidth="2.5" />
            <path d={`M ${185 + frontFootX},350 L ${210 + frontFootX},350 L 212,366 L 180,366 Z`} fill="#18181B" stroke={strokeCol} strokeWidth="2.5" />
          </g>

          {/* OVERCOAT */}
          <g id="ponocny-coat">
            <path
              d="M 160,170 C 145,240 140,310 145,355 L 255,355 C 260,310 255,240 240,170 Z"
              fill="url(#ponocnyCoatGrad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? '4' : '3'}
            />
            {/* Belt & Buckle */}
            <rect x="155" y="240" width="90" height="12" fill="#5A3416" stroke={strokeCol} strokeWidth="2" />
            <rect x="190" y="237" width="20" height="18" fill="#F59E0B" stroke={strokeCol} strokeWidth="2" />

            {/* Brass Buttons */}
            <circle cx="178" cy="195" r="3.5" fill="#FBBF24" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="178" cy="215" r="3.5" fill="#FBBF24" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="222" cy="195" r="3.5" fill="#FBBF24" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="222" cy="215" r="3.5" fill="#FBBF24" stroke={strokeCol} strokeWidth="1.2" />

            {/* Lapels */}
            <path d="M 165,170 L 190,200 L 200,180 L 210,200 L 235,170 Z" fill="#475569" stroke={strokeCol} strokeWidth="2" />
          </g>

          {/* HALBERD & ARMS */}
          <g id="ponocny-halberd-group">
            {/* Diagonal Shaft */}
            <line x1="220" y1="360" x2="270" y2="70" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            <line x1="220" y1="360" x2="270" y2="70" stroke={strokeCol} strokeWidth="2" strokeLinecap="round" />

            {/* Forged Halberd Head */}
            <g transform="translate(270, 70) rotate(-15)">
              <path
                d="M 0,0 L 5,-40 L 2,-12 Q 18,-20 30,-22 Q 26,-5 12,12 Z"
                fill="#64748B"
                stroke={strokeCol}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M 0,0 L -12,-4 L -16,-10 L 0,-12 Z" fill="#64748B" stroke={strokeCol} strokeWidth="2" />
              {/* Clover cutout */}
              <circle cx="16" cy="-8" r="2" fill="#1E293B" />
            </g>

            {/* Arms holding Halberd */}
            <path d="M 235,190 Q 250,220 230,240" stroke="#334155" strokeWidth="12" strokeLinecap="round" fill="none" />
            <circle cx="230" cy="240" r="7" fill="#784A28" stroke={strokeCol} strokeWidth="2" />
          </g>

          {/* HANGING LANTERN IN OTHER HAND */}
          <g id="ponocny-lantern" transform="translate(150, 240)">
            <path d="M 165,190 Q 145,210 150,240" stroke="#334155" strokeWidth="10" strokeLinecap="round" fill="none" />
            {/* Lantern Body */}
            <rect x="-10" y="0" width="20" height="24" rx="3" fill="#FEF08A" stroke={strokeCol} strokeWidth="2" />
            <rect x="-12" y="-5" width="24" height="6" fill="#334155" stroke={strokeCol} strokeWidth="2" />
            <rect x="-12" y="24" width="24" height="5" fill="#1E293B" stroke={strokeCol} strokeWidth="2" />
            <circle cx="0" cy="12" r="4" fill="#EA580C" />
          </g>

          {/* HEAD, MUSTACHE & HAT */}
          <g id="ponocny-head" transform="translate(200, 140)">
            {/* Face Base */}
            <circle cx="0" cy="0" r="22" fill="url(#ponocnySkinGrad)" stroke={strokeCol} strokeWidth={showOutline ? '4' : '3'} />

            {/* Cold red nose */}
            <circle cx="10" cy="0" r="5" fill="#FB7185" stroke={strokeCol} strokeWidth="1.5" />

            {/* Bushy Grey Mustache */}
            <path
              d="M 2,4 Q 12,6 20,14 Q 10,14 4,8 Q -4,14 -12,12 Q -2,6 2,4 Z"
              fill="#CBD5E1"
              stroke={strokeCol}
              strokeWidth="2"
            />

            {/* Eye & Brow */}
            <line x1="2" y1="-8" x2="12" y2="-6" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <circle cx="8 + gazeX" cy="-3 + gazeY" r="2.5" fill="#1C1917" />

            {/* Watchman's Hat (Klobouk ponocného) */}
            <g transform="translate(0, -14)">
              <ellipse cx="0" cy="0" rx="30" ry="8" fill="#1E2229" stroke={strokeCol} strokeWidth="3" />
              <path d="M -18,0 C -20,-22 0,-24 18,-22 C 20,0 18,0 -18,0 Z" fill="#1E2229" stroke={strokeCol} strokeWidth="3" />
              {/* Brass Cockade Badge */}
              <circle cx="6" cy="-8" r="4.5" fill="#F59E0B" stroke={strokeCol} strokeWidth="1.5" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
