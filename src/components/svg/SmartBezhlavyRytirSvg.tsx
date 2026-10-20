import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartBezhlavyRytirSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale / folklore illustration of the Headless Knight (Bezhlavý rytíř)
 * Features:
 * - Medieval plate armor with chainmail & golden spurs
 * - White battle tabard with authentic red Czech double-tailed lion rampant
 * - Billowing tattered crimson cape
 * - Severed bloody neck stump
 * - Carrying his own severed head in his left arm with knight helmet and red plume
 * - Interactive cursor tracking: severed head and sword follow the cursor
 * - Mighty sword slash and roar animation states
 */
export const SmartBezhlavyRytirSvg: React.FC<SmartCharacterProps> = ({
  state = 'idle',
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
    showHeadGlow = true,
    showParticles = true,
    showShadow = true,
    showOutline = true,
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
  const isAction = state === 'action';
  const isReact = state === 'react';

  // Kinematics
  const walkSpeed = isAction ? 14 : isWalking ? 8.5 : 2.6;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Armored stride legs
  const leftLegAngle = isWalking ? walkSin * 22 : isAction ? -15 + Math.sin(t * 16) * 10 : -5;
  const rightLegAngle = isWalking ? -walkSin * 22 : isAction ? 18 + Math.cos(t * 16) * 10 : 8;

  // Heavy armored body bobbing
  const bobY = isWalking ? Math.abs(walkSin) * 9 : isAction ? Math.abs(Math.sin(t * 12)) * 14 : Math.sin(t * 2.2) * 2.5;
  const torsoAngle = isWalking ? walkSin * 2.5 : isAction ? -8 + Math.sin(t * 12) * 6 : 0;

  // Billowing tattered cape
  const capeFlutter = Math.sin(t * (isAction ? 14 : isWalking ? 8 : 3.5)) * (isAction ? 22 : isWalking ? 14 : 6);

  // Sword kinematics
  const swordAngle = isAction
    ? -45 + Math.sin(t * 14) * 45
    : isWalking
    ? 5 + walkCos * 8
    : pointer.isHovered
    ? pointer.y * 15
    : 0;

  // Severed head independent tracking & motion
  const headLookX = pointer.isHovered ? pointer.x * 12 : Math.sin(t * 2) * 4;
  const headLookY = pointer.isHovered ? pointer.y * 10 : Math.cos(t * 2) * 2;
  const plumeWave = Math.sin(t * (isAction ? 15 : isWalking ? 9 : 3.8)) * (isAction ? 20 : isWalking ? 12 : 5);
  const mouthRoar = isAction ? 10 + Math.abs(Math.sin(t * 14)) * 8 : isReact ? 6 : 0;

  // Blood drips from neck stump
  const bloodDrip1 = ((t * 70) % 65);
  const bloodDrip2 = (((t * 60) + 30) % 55);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 460 480"
      width={size}
      height={size}
      className={`smart-bezhlavy-rytir-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Bezhlavý rytíř s mečem a hlavou v podpaží"
    >
      <defs>
        {/* Armor Plate Gradient */}
        <linearGradient id="armorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="35%" stopColor="#CBD5E1" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="armorDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Cape Crimson Gradient */}
        <linearGradient id="capeGrad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="40%" stopColor="#DC2626" />
          <stop offset="80%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#660E0E" />
        </linearGradient>

        {/* Tabard Linen Gradient */}
        <linearGradient id="tabardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Golden Spurs & Pommel */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="45%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Sword Steel Blade */}
        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="45%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Blood Red Gradient */}
        <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#580808" />
        </linearGradient>

        {/* Severed Head Furious Eye Glow */}
        <filter id="eyeRageGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Czech Lion Pattern Symbol */}
        <pattern id="chainmailPattern" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.2" fill="none" stroke="#334155" strokeWidth="1" />
          <circle cx="0" cy="0" r="1.5" fill="none" stroke="#1E293B" strokeWidth="0.8" />
          <circle cx="6" cy="6" r="1.5" fill="none" stroke="#1E293B" strokeWidth="0.8" />
        </pattern>
      </defs>

      <g
        transform={`translate(230, 240) scale(${direction}, 1) translate(-230, -240)`}
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <ellipse
            cx={210}
            cy={440}
            rx={105 + (isWalking ? Math.sin(t * walkSpeed) * 8 : 0)}
            ry={19}
            fill="#0F172A"
            opacity="0.25"
          />
        )}

        {/* DYNAMIC SWORD SLASH WIND FX */}
        {showParticles && isAction && (
          <path
            d={`M 110,210 Q 70,300 140,390`}
            stroke="#93C5FD"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity={0.6 + Math.sin(t * 18) * 0.3}
          />
        )}

        {/* 1. TATTERED BILLOWING CRIMSON CAPE (BEHIND BODY) */}
        <g transform={`translate(160, 150) rotate(${capeFlutter * 0.4})`}>
          <path
            d={`M -20,0 C -55,40 -85,110 -115,180 C -125,200 -120,210 -105,205 C -95,200 -88,185 -78,195 C -65,210 -55,205 -45,185 C -35,170 -25,185 -15,195 C 5,205 18,175 12,145 C 5,100 -2,45 0,0 Z`}
            fill="url(#capeGrad)"
            stroke="#1C1610"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Tattered rips and holes */}
          <path
            d="M -90,140 Q -102,152 -88,160 M -60,110 Q -72,125 -58,135 M -40,150 Q -50,165 -35,172"
            stroke="#450A0A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ROOT BODY CONTAINER (WITH WALK BOB & SWAY) */}
        <g transform={`translate(0, ${bobY}) rotate(${torsoAngle}, 220, 280)`}>

          {/* 2. ARMORED LEGS & SABATONS (GREAVES, POLEYNS, SPURS) */}
          {/* Left / Back Leg */}
          <g transform={`translate(180, 275) rotate(${leftLegAngle})`}>
            {/* Poleyn (Knee plate) & Greave */}
            <path
              d="M -14,0 C -18,35 -24,70 -16,110 C -12,125 10,125 15,110 C 20,70 16,35 14,0 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Knee Guard Disc */}
            <circle cx="-3" cy="45" r="9" fill="url(#armorDarkGrad)" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-3" cy="45" r="3" fill="#E2E8F0" />

            {/* Armored Sabaton (Foot/Boot) */}
            <path
              d="M -18,105 C -32,112 -42,125 -38,138 C -32,148 5,148 24,142 C 28,132 20,115 12,105 Z"
              fill="url(#armorDarkGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Articulated foot lames */}
            <line x1="-28" y1="120" x2="8" y2="120" stroke="#1C1610" strokeWidth="2.5" />
            <line x1="-24" y1="128" x2="14" y2="128" stroke="#1C1610" strokeWidth="2.5" />

            {/* GOLDEN SPUR ON HEEL */}
            <g transform="translate(18, 126)">
              <rect x="0" y="-3" width="12" height="6" rx="2" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="2" />
              {/* Pointy Rowel Star */}
              <polygon
                points="16,0 20,-5 22,-1 27,-2 24,3 28,7 23,7 20,12 18,7 13,8 15,3 11,-1"
                fill="url(#goldGrad)"
                stroke="#1C1610"
                strokeWidth="1.5"
              />
            </g>
          </g>

          {/* Right / Front Leg */}
          <g transform={`translate(225, 275) rotate(${rightLegAngle})`}>
            {/* Armored Leg Thigh & Greave */}
            <path
              d="M -12,0 C -5,35 5,75 14,110 C 22,125 45,122 42,105 C 32,70 18,35 12,0 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Knee Guard Plate */}
            <circle cx="10" cy="45" r="9.5" fill="url(#armorDarkGrad)" stroke="#1C1610" strokeWidth="3" />
            <circle cx="10" cy="45" r="3.2" fill="#E2E8F0" />

            {/* Heavy Plate Sabaton with Tread */}
            <path
              d="M 12,105 C 16,120 28,135 62,142 C 78,145 88,138 85,125 C 80,110 52,102 36,102 Z"
              fill="url(#armorDarkGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Lames plate creases */}
            <line x1="26" y1="116" x2="62" y2="116" stroke="#1C1610" strokeWidth="2.5" />
            <line x1="32" y1="126" x2="72" y2="126" stroke="#1C1610" strokeWidth="2.5" />

            {/* GOLDEN SPUR ON FRONT HEEL */}
            <g transform="translate(14, 122)">
              <rect x="-10" y="-3" width="10" height="6" rx="2" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="2" />
              {/* Star rowel */}
              <polygon
                points="-14,0 -18,-5 -20,-1 -25,-2 -22,3 -26,7 -21,7 -18,12 -16,7 -11,8 -13,3 -9,-1"
                fill="url(#goldGrad)"
                stroke="#1C1610"
                strokeWidth="1.5"
              />
            </g>
          </g>

          {/* 3. CHAINMAIL HAUBERK & STEEL FAULDS UNDER TABARD */}
          <g transform="translate(185, 230)">
            <path
              d="M -25,0 L 55,0 L 50,45 L -20,45 Z"
              fill="url(#chainmailPattern)"
              stroke="#1C1610"
              strokeWidth="3"
            />
          </g>

          {/* 4. WHITE HERALDIC BATTLE SURCOAT / TABARD WITH CZECH LION */}
          <g id="tabard-lion" transform="translate(180, 130)">
            {/* Flowing white linen battle surcoat */}
            <path
              d="M -15,0 C -5,-15 35,-15 50,0 C 65,40 75,90 78,130 C 55,142 35,130 18,140 C 2,132 -10,145 -22,130 C -25,90 -22,40 -15,0 Z"
              fill="url(#tabardGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />

            {/* Tattered ragged hem cuts at bottom */}
            <path
              d="M -22,130 L -15,145 L -8,132 L 2,148 L 12,135 L 22,148 L 35,134 L 52,146 L 65,132 L 78,130"
              stroke="#1C1610"
              strokeWidth="3.2"
              fill="none"
              strokeLinejoin="round"
            />

            {/* Dirt, rust and battle wear splatters */}
            <circle cx="5" cy="115" r="2.5" fill="#854D0E" opacity="0.6" />
            <circle cx="45" cy="105" r="3.5" fill="#854D0E" opacity="0.6" />
            <circle cx="25" cy="122" r="2.2" fill="#854D0E" opacity="0.6" />

            {/* REGAL CZECH DOUBLE-TAILED RED LION RAMPANT (ČESKÝ LEV) */}
            <g id="czech-lion" transform="translate(8, 38)">
              {/* Lion Body and Powerful Chest */}
              <path
                d="M 8,0 C 14,-6 24,-6 28,-1 C 26,4 20,6 22,12 C 28,15 32,24 28,32 C 24,38 18,40 10,38 C 5,36 0,28 2,20 C 4,14 4,6 8,0 Z"
                fill="#DC2626"
                stroke="#1C1610"
                strokeWidth="2"
              />
              {/* Crown on Lion Head */}
              <polygon points="12,-10 16,-6 20,-11 24,-6 28,-10 26,-4 14,-4" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="1.2" />

              {/* Lion Roaring Snout & Jaws */}
              <path d="M 24,-2 L 32,-4 L 30,2 L 35,4 L 28,6" fill="#DC2626" stroke="#1C1610" strokeWidth="1.5" />
              {/* Red Eye */}
              <circle cx="22" cy="-2" r="1.5" fill="#FEF08A" />

              {/* Forepaws Rampant with Claws */}
              {/* Upper Paw */}
              <path d="M 22,8 L 36,4 L 38,7 L 34,9 L 40,11 L 32,13" fill="#DC2626" stroke="#1C1610" strokeWidth="1.5" />
              {/* Lower Paw */}
              <path d="M 20,18 L 32,22 L 34,25 L 30,26 L 36,29 L 26,30" fill="#DC2626" stroke="#1C1610" strokeWidth="1.5" />

              {/* Hind Leg with Claws */}
              <path d="M 10,36 L 16,48 L 22,46 L 18,42 L 24,42 L 14,35" fill="#DC2626" stroke="#1C1610" strokeWidth="1.5" />

              {/* Signature TWO TAILS (Dvouocasý lev) curving majestically */}
              {/* Upper Forked Tail */}
              <path
                d="M 4,32 C -8,30 -14,18 -10,8 C -8,2 -2,4 -4,8 C -8,14 -4,22 4,24 Z"
                fill="#DC2626"
                stroke="#1C1610"
                strokeWidth="1.8"
              />
              {/* Lower Forked Tail */}
              <path
                d="M 6,36 C -6,40 -16,46 -12,56 C -10,62 -4,60 -6,54 C -8,48 0,44 6,40 Z"
                fill="#DC2626"
                stroke="#1C1610"
                strokeWidth="1.8"
              />
              {/* Tuft flames on tails */}
              <polygon points="-12,6 -18,2 -14,10" fill="#DC2626" stroke="#1C1610" strokeWidth="1" />
              <polygon points="-14,58 -20,62 -14,52" fill="#DC2626" stroke="#1C1610" strokeWidth="1" />
            </g>

            {/* Sturdy Leather Swordbelt with Brass Buckle */}
            <g transform="translate(-18, 78)">
              <rect x="0" y="0" width="88" height="12" rx="3" fill="#78350F" stroke="#1C1610" strokeWidth="3" />
              {/* Golden Brass Belt Buckle */}
              <rect x="36" y="-3" width="16" height="18" rx="2" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="2.5" />
              <rect x="40" y="1" width="8" height="10" rx="1" fill="#78350F" />
              <line x1="39" y1="6" x2="48" y2="6" stroke="#FEF08A" strokeWidth="2.5" />

              {/* Parrying Dagger Sheath at left hip */}
              <g transform="translate(62, 8) rotate(32)">
                <path d="M 0,0 L 8,0 L 5,38 L 2,38 Z" fill="#451A03" stroke="#1C1610" strokeWidth="2.5" />
                <path d="M -3,0 L 11,0 L 11,-4 L -3,-4 Z" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="1.8" />
                <circle cx="4" cy="-10" r="3" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="1.5" />
              </g>
            </g>
          </g>

          {/* 5. SEVERED NECK STUMP (COLLAR & DRIPPING BLOOD) */}
          <g transform="translate(202, 120)">
            {/* Gorget Collar Plate */}
            <path
              d="M -16,4 C -12,-8 12,-8 18,4 C 10,8 -10,8 -16,4 Z"
              fill="url(#armorDarkGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Severed Flesh & Vertebra Stump */}
            <ellipse cx="1" cy="-2" rx="12" ry="6" fill="#7F1D1D" stroke="#1C1610" strokeWidth="2.5" />
            <ellipse cx="1" cy="-2" rx="5" ry="3" fill="#F87171" />
            {/* White bone cervical vertebra center */}
            <circle cx="1" cy="-2" r="2.2" fill="#FEF2F2" stroke="#1C1610" strokeWidth="1.2" />

            {/* Fresh Dripping Blood Droplets */}
            <path
              d={`M -6,4 C -6,14 -8,${16 + bloodDrip1} -4,${16 + bloodDrip1} C 0,${16 + bloodDrip1} -2,14 -2,4 Z`}
              fill="url(#bloodGrad)"
            />
            <path
              d={`M 4,4 C 4,12 2,${14 + bloodDrip2} 6,${14 + bloodDrip2} C 10,${14 + bloodDrip2} 8,12 8,4 Z`}
              fill="url(#bloodGrad)"
            />
          </g>

          {/* 6. RIGHT ARM WITH BROADSWORD */}
          <g transform={`translate(160, 150) rotate(${swordAngle})`}>
            {/* Segmented Steel Pauldron (Shoulder) */}
            <path
              d="M -15,-10 C 15,-18 28,-10 26,12 C 22,25 0,28 -12,20 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth="3.8"
            />
            {/* Pauldron rivets */}
            <circle cx="18" cy="-2" r="2" fill="#1C1610" />
            <circle cx="20" cy="10" r="2" fill="#1C1610" />

            {/* Arm Vambrace & Gauntlet */}
            <path
              d="M -8,15 L -25,75 L -10,85 L 5,22 Z"
              fill="url(#armorDarkGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />

            {/* Steel Gauntlet Grip on Sword */}
            <circle cx="-18" cy="80" r="10" fill="url(#armorGrad)" stroke="#1C1610" strokeWidth="3" />

            {/* MIGHTY STEEL BROADSWORD */}
            <g transform="translate(-18, 80) rotate(-18)">
              {/* Golden Round Pommel */}
              <circle cx="0" cy="-28" r="7.5" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="0" cy="-28" r="2.5" fill="#FEF08A" />

              {/* Wire-wrapped Leather Hilt Grip */}
              <rect x="-4" y="-22" width="8" height="24" rx="2" fill="#451A03" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="-3" y1="-16" x2="3" y2="-15" stroke="#EAB308" strokeWidth="1.5" />
              <line x1="-3" y1="-10" x2="3" y2="-9" stroke="#EAB308" strokeWidth="1.5" />
              <line x1="-3" y1="-4" x2="3" y2="-3" stroke="#EAB308" strokeWidth="1.5" />

              {/* Solid Steel Crossguard */}
              <path
                d="M -34,0 L 34,0 C 38,0 38,7 34,7 L -34,7 C -38,7 -38,0 -34,0 Z"
                fill="url(#armorGrad)"
                stroke="#1C1610"
                strokeWidth="3"
              />
              <circle cx="-32" cy="3.5" r="3" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="1.5" />
              <circle cx="32" cy="3.5" r="3" fill="url(#goldGrad)" stroke="#1C1610" strokeWidth="1.5" />

              {/* Long Battle-Worn Steel Blade */}
              <path
                d="M -11,7 L -8,180 L 0,205 L 8,180 L 11,7 Z"
                fill="url(#bladeGrad)"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Blade Center Fuller Grooves */}
              <line x1="0" y1="10" x2="0" y2="175" stroke="#334155" strokeWidth="2.5" />
              {/* Battle notches and blood stains on blade */}
              <polygon points="10,50 6,55 10,60" fill="#64748B" stroke="#1C1610" strokeWidth="1.5" />
              <polygon points="-10,110 -6,115 -10,120" fill="#64748B" stroke="#1C1610" strokeWidth="1.5" />
              <path d="M -5,95 Q 3,115 -2,130" stroke="#991B1B" strokeWidth="3" fill="none" opacity="0.8" />
            </g>
          </g>

          {/* 7. LEFT ARM CARRYING THE SEVERED HEAD */}
          <g transform="translate(245, 145)">
            {/* Shoulder Pauldron */}
            <path
              d="M -5,-12 C 25,-16 38,-4 36,18 C 30,30 10,32 0,22 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth="3.8"
            />

            {/* Arm bent firmly around the severed head */}
            <path
              d="M 12,18 C 30,35 48,65 52,95 C 42,108 20,105 12,98 C 6,80 18,50 8,30 Z"
              fill="url(#armorDarkGrad)"
              stroke="#1C1610"
              strokeWidth="3.8"
            />
            {/* Gauntlet fingers clamped around helmet base */}
            <path
              d="M 40,88 C 48,82 58,85 58,95 C 56,105 45,108 38,102 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth="3"
            />
          </g>

          {/* 8. THE SEVERED HEAD (HELD UNDER LEFT ARM) */}
          <g transform={`translate(295, 205)`}>
            {/* TALL RED FEATHERED PLUME (CHOCHOL) WAVING ATOP HELMET */}
            <g transform={`translate(-12, -75) rotate(${plumeWave})`}>
              <path
                d="M 0,0 C 8,-35 25,-70 58,-95 C 52,-70 35,-45 22,-25 C 38,-45 52,-55 68,-65 C 55,-40 38,-20 18,5 Z"
                fill="url(#capeGrad)"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              {/* Plume feather vane details */}
              <path
                d="M 15,-30 Q 35,-42 45,-55 M 10,-15 Q 28,-24 40,-32"
                stroke="#7F1D1D"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>

            {/* STEEL KNIGHT HELMET (BASSET/SALLET) */}
            <path
              d="M -32,-35 C -30,-72 10,-78 35,-65 C 50,-55 52,-25 45,-5 C 40,8 15,10 -15,8 C -30,5 -34,-15 -32,-35 Z"
              fill="url(#armorGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Helmet brow ridge with rivets */}
            <path
              d="M -30,-32 Q 5,-42 42,-22"
              stroke="#1C1610"
              strokeWidth="3.5"
              fill="none"
            />
            <circle cx="-18" cy="-35" r="2.2" fill="#1C1610" />
            <circle cx="2" cy="-35" r="2.2" fill="#1C1610" />
            <circle cx="22" cy="-30" r="2.2" fill="#1C1610" />

            {/* Severed Neck Rim with Blood at base of head */}
            <path
              d="M -18,12 C -8,22 18,22 26,12 C 20,26 -10,26 -18,12 Z"
              fill="url(#bloodGrad)"
              stroke="#1C1610"
              strokeWidth="2.5"
            />

            {/* FURIOUS FACE & WILD BEARD */}
            {/* Wild Brown Beard & Moustache */}
            <path
              d="M -22,-10 C -30,8 -24,24 -10,34 C 4,42 22,38 32,25 C 38,12 36,-2 32,-12 C 24,0 12,5 -2,5 C -12,5 -18,-2 -22,-10 Z"
              fill="#451A03"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Face Skin Area */}
            <path
              d="M -22,-28 C -18,-35 22,-35 32,-20 C 35,-5 32,5 24,10 C 14,14 -12,14 -20,6 C -24,-2 -24,-18 -22,-28 Z"
              fill="#FED7AA"
              stroke="#1C1610"
              strokeWidth="2.8"
            />

            {/* EYES & BROWS (INTERACTIVE CURSOR TRACKING) */}
            <g transform={`translate(${headLookX}, ${headLookY})`}>
              {/* Heavy Bushy Furrowed Eyebrows */}
              <path
                d="M -16,-24 Q -6,-28 2,-20"
                stroke="#2A0800"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 8,-21 Q 18,-27 28,-18"
                stroke="#2A0800"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Furious Bulging Sclera with Red Blood Vessels */}
              <circle cx="-6" cy="-16" r="6" fill="#FFF1F2" stroke="#1C1610" strokeWidth="2" />
              <circle cx="18" cy="-14" r="6.5" fill="#FFF1F2" stroke="#1C1610" strokeWidth="2" />

              {/* Fiery Red Glowing Irises & Pupils */}
              <circle
                cx="-5"
                cy="-16"
                r={isAction ? 3.8 : 3}
                fill={showHeadGlow && (isAction || pointer.isHovered) ? "#EF4444" : "#991B1B"}
                filter={showHeadGlow ? "url(#eyeRageGlow)" : undefined}
              />
              <circle cx="-5" cy="-16" r="1.5" fill="#18181B" />
              <circle cx="-6" cy="-17" r="0.8" fill="#FFFFFF" />

              <circle
                cx="19"
                cy="-14"
                r={isAction ? 4 : 3.2}
                fill={showHeadGlow && (isAction || pointer.isHovered) ? "#EF4444" : "#991B1B"}
                filter={showHeadGlow ? "url(#eyeRageGlow)" : undefined}
              />
              <circle cx="19" cy="-14" r="1.6" fill="#18181B" />
              <circle cx="18" cy="-15" r="0.8" fill="#FFFFFF" />

              {/* Large Bulbous Warrior Nose */}
              <path
                d="M 3,-20 Q 8,-12 10,-8 Q 4,-6 0,-8"
                fill="#FDBA74"
                stroke="#1C1610"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>

            {/* SNARLING MOUTH WITH TEETH & ROAR ACTION */}
            <g transform="translate(6, 2)">
              {/* Mouth Cavity */}
              <path
                d={`M -12,-2 Q 2,${-5 - mouthRoar * 0.3} 16,-2 Q 14,${6 + mouthRoar} -10,${6 + mouthRoar} Z`}
                fill="#18181B"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
              {/* Bared Sharp Teeth */}
              <path
                d="M -8,-2 L -6,2 L -4,-2 L -2,2 L 0,-2 L 2,2 L 4,-2 L 6,2 L 8,-2 L 10,2 L 12,-2"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
};
