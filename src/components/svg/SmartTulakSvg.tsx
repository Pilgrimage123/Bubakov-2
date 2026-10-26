import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartTulakSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech folklore illustration of the joyful laughing Wanderer / Vagabond of Hrusice (Tulák / Poutník) by Josef Lada
 * Features:
 * - Broad jovial laughing expression with bushy white beard, rosy cheeks, and red nose
 * - Battered pointed felt hat with forest sprig of rowanberries & leaves
 * - Clay herbal pipe (Bylinková fajfka) puffing animated aromatic herbal smoke rings
 * - Heavy knobby wooden walking staff (sukovitá sukovice) with carved knots & bark
 * - Weathered tattered wool coat with colorful stitched folk patches & wooden toggles
 * - Traveler's knapsack (torna) & hanging wooden canteen (čutora)
 * - Articulated hobnail boots with stride kinematics matching Babička & Barunka
 * - Action: "Pověstná sukovice" 360° whirlwind strike with autumn leaves & shockwave
 * - Complete animation set: idle, walk, sprint, action, react, flee with interactive pointer tracking
 */
export const SmartTulakSvg: React.FC<SmartCharacterProps> = ({
  state = 'idle',
  time: externalTime,
  speed = 1,
  isPlaying = true,
  direction = 1,
  size = 420,
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
    showSmoke = true,
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
    setPointer({
      x: Math.max(-1, Math.min(1, nx * direction)),
      y: Math.max(-1, Math.min(1, ny)),
      isHovered: true,
    });
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

  // Kinematic parameters
  const walkSpeed = isFleeing ? 18 : isSprinting ? 14 : isWalking ? 8 : isReact ? 24 : 2.5;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Body bobbing and lean
  const bobY = isAction
    ? -Math.abs(Math.sin(t * 12)) * 8 - 4
    : isFleeing
    ? -Math.abs(walkSin) * 16
    : isSprinting
    ? -Math.abs(walkSin) * 12
    : isWalking
    ? -Math.abs(walkSin) * 8
    : isReact
    ? -Math.abs(Math.sin(t * 16)) * 12 - 5
    : Math.sin(t * 2.2) * 2.6;

  const torsoLean = isAction
    ? -10 + Math.sin(t * 12) * 8
    : isFleeing
    ? 15 + walkSin * 4.5
    : isSprinting
    ? 12 + walkSin * 3.5
    : isWalking
    ? 6 + walkCos * 2.5
    : isReact
    ? -14 + Math.sin(t * 26) * 4
    : 3 + Math.sin(t * 1.5) * 1.5;

  // Stride kinematics for boots (legs ONLY swing when actively moving)
  const strideAmp = isMoving ? (isFleeing ? 28 : isSprinting ? 22 : 14) : 0;
  const bootSwingRot = isMoving ? (isFleeing ? 32 : isSprinting ? 24 : 15) : 0;
  const leftBootX = isMoving ? -26 + walkSin * strideAmp : -26;
  const leftBootY = isMoving ? 32 - Math.max(0, walkCos) * (strideAmp * 0.65) : 32;
  const leftBootRot = isMoving ? walkSin * bootSwingRot : 0;

  const rightBootX = isMoving ? 26 - walkSin * strideAmp : 26;
  const rightBootY = isMoving ? 32 - Math.max(0, -walkCos) * (strideAmp * 0.65) : 32;
  const rightBootRot = isMoving ? -walkSin * bootSwingRot : 0;

  // Sukovice staff swing
  const staffAngle = isAction
    ? -40 + Math.sin(t * 16) * 65
    : isReact
    ? -35 + Math.sin(t * 26) * 20
    : isFleeing
    ? 30 + Math.sin(t * 20) * 25
    : isSprinting
    ? -25 + Math.sin(t * 14) * 18
    : isWalking
    ? -8 + Math.sin(t * 8) * 18
    : -4 + Math.sin(t * 2) * 4;

  // Knapsack & Canteen swing
  const knapsackBounce = Math.sin(t * (isMoving ? walkSpeed * 1.4 : 3)) * (isMoving ? 7 : 2);
  const canteenSway = Math.sin(t * (isMoving ? walkSpeed * 1.2 : 2.5)) * (isMoving ? 22 : 8);

  // Gaze & eye tracking
  const gazeX = isReact
    ? -2.5 + Math.sin(t * 28) * 1.2
    : isFleeing
    ? 3.0
    : pointer.isHovered
    ? pointer.x * 4
    : Math.sin(t * 1.2) * 1.2;

  const gazeY = isReact
    ? -2
    : isFleeing
    ? -1.2
    : pointer.isHovered
    ? pointer.y * 3.5
    : 0;

  // Animated pipe smoke rings
  const smokePuffs = [
    { x: 285 + ((t * 40) % 60), y: 140 - ((t * 50) % 90), r: 8 + ((t * 15) % 18), op: Math.max(0, 0.7 - ((t * 0.6) % 0.7)) },
    { x: 295 + ((t * 45 + 25) % 65), y: 130 - ((t * 55 + 30) % 95), r: 10 + ((t * 18 + 5) % 20), op: Math.max(0, 0.65 - ((t * 0.55 + 0.3) % 0.65)) },
    { x: 305 + ((t * 50 + 50) % 70), y: 120 - ((t * 60 + 60) % 100), r: 12 + ((t * 20 + 10) % 22), op: Math.max(0, 0.6 - ((t * 0.5 + 0.5) % 0.6)) },
  ];

  // Swirling autumn leaves for "Pověstná sukovice" whirlwind
  const autumnLeaves = [
    { x: 240 + Math.sin(t * 8 + 0) * 110, y: 260 + Math.cos(t * 8 + 0) * 55, r: 8, col: '#D97706', rot: t * 300 },
    { x: 240 + Math.sin(t * 8 + 1.8) * 125, y: 250 + Math.cos(t * 8 + 1.8) * 65, r: 10, col: '#B45309', rot: t * 360 + 45 },
    { x: 240 + Math.sin(t * 8 + 3.6) * 115, y: 270 + Math.cos(t * 8 + 3.6) * 60, r: 9, col: '#DC2626', rot: t * 400 + 90 },
    { x: 240 + Math.sin(t * 8 + 5.2) * 130, y: 255 + Math.cos(t * 8 + 5.2) * 70, r: 7.5, col: '#F59E0B', rot: t * 320 + 135 },
  ];

  // Panic / Hit Sweat Drops
  const sweatDrops = [
    { x: 210 - ((t * 95) % 28), y: 110 + ((t * 75) % 30), r: 3.5 },
    { x: 275 + ((t * 90 + 15) % 28), y: 105 + ((t * 80 + 12) % 30), r: 3.2 },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 480 480"
      width={size}
      height={size}
      className={`smart-tulak-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Tulák z Hrusic s dýmkou a sukovicí"
    >
      <defs>
        {/* Warm Weathered Skin Tone */}
        <radialGradient id="tulakSkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF2E8" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>

        {/* Patched Wool Coat Green */}
        <linearGradient id="tulakCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F6212" />
          <stop offset="45%" stopColor="#4D7C0F" />
          <stop offset="85%" stopColor="#365314" />
          <stop offset="100%" stopColor="#1A2E05" />
        </linearGradient>

        {/* Battered Felt Hat Forest Green */}
        <linearGradient id="tulakHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E4A10" />
          <stop offset="60%" stopColor="#3F6212" />
          <stop offset="100%" stopColor="#1A2E05" />
        </linearGradient>

        {/* Gnarled Oak Sukovice Staff */}
        <linearGradient id="sukoviceBarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9A3412" />
          <stop offset="45%" stopColor="#B45309" />
          <stop offset="80%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Trousers Brown */}
        <linearGradient id="tulakPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="50%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#5B2105" />
        </linearGradient>

        {/* Whirlwind Dust Filter */}
        <filter id="tulakWhirlGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(240, 240) scale(${direction}, 1) translate(-240, -240)`}>
        {/* GROUND SHADOW */}
        {showShadow && (
          <g opacity="0.3">
            <ellipse cx={240} cy={445} rx={80} ry={16} fill="#1E293B" />
          </g>
        )}

        {/* WHIRLWIND EFFECT (ACTION MODE - POVĚSTNÁ SUKOVICE) */}
        {isAction && (
          <g id="tulak-whirlwind" transform="translate(240, 270)">
            {/* Swirling Shockwave Rings */}
            <ellipse
              cx="0"
              cy="20"
              rx="135"
              ry="45"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="4"
              strokeDasharray="25 15"
              opacity="0.85"
              filter="url(#tulakWhirlGlow)"
              transform={`rotate(${(t * 400) % 360})`}
            />
            <ellipse
              cx="0"
              cy="20"
              rx="160"
              ry="55"
              fill="none"
              stroke="#EA580C"
              strokeWidth="3"
              strokeDasharray="30 20"
              opacity="0.65"
              transform={`rotate(${-(t * 320) % 360})`}
            />

            {/* Autumn Leaves swirling */}
            {autumnLeaves.map((leaf, idx) => (
              <g
                key={`leaf-${idx}`}
                transform={`translate(${leaf.x - 240}, ${leaf.y - 270}) rotate(${leaf.rot})`}
              >
                <path
                  d="M 0,-12 C 8,-8 10,6 0,12 C -10,6 -8,-8 0,-12 Z"
                  fill={leaf.col}
                  stroke="#1C1610"
                  strokeWidth="1.5"
                />
                <line x1="0" y1="-10" x2="0" y2="10" stroke="#78350F" strokeWidth="1" />
              </g>
            ))}
          </g>
        )}

        {/* HERBAL PIPE SMOKE PUFFS */}
        {showSmoke && showParticles && (
          <g className="smoke-puffs">
            {smokePuffs.map((puff, idx) => (
              <circle
                key={`smoke-${idx}`}
                cx={puff.x}
                cy={puff.y}
                r={puff.r}
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="1.2"
                opacity={puff.op}
              />
            ))}
          </g>
        )}

        {/* SWEAT DROPS (REACT & FLEE) */}
        {showParticles && (isReact || isFleeing) && (
          <g className="sweat-drops">
            {sweatDrops.map((d, idx) => (
              <path
                key={idx}
                d={`M ${d.x},${d.y} Q ${d.x + 3},${d.y + 4} ${d.x},${d.y + 7} Q ${d.x - 3},${d.y + 4} ${d.x},${d.y} Z`}
                fill="#60A5FA"
                stroke="#1E40AF"
                strokeWidth="1.2"
              />
            ))}
          </g>
        )}

        {/* ======================================================== */}
        {/* TULÁK ROOT WITH KINEMATICS                              */}
        {/* ======================================================== */}
        <g id="tulak-body" transform={`translate(0, ${bobY}) rotate(${torsoLean}, 240, 290)`}>
          {/* 1. ARTICULATED HOBNAIL BOOTS */}
          <g id="tulak-boots" transform="translate(240, 395)">
            {/* Left Boot */}
            <g
              id="tulak-left-boot"
              transform={`translate(${leftBootX}, ${leftBootY}) rotate(${leftBootRot})`}
            >
              <path
                d="M -16,-16 L -8,-16 L 8,8 L 22,8 C 28,8 30,15 25,20 C 16,24 -18,24 -22,18 C -24,12 -20,-8 -16,-16 Z"
                fill="#451A03"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              {/* Boot Leather Straps & Hobnails */}
              <line x1="-6" y1="-4" x2="6" y2="4" stroke="#78350F" strokeWidth="2.5" />
              <line x1="-10" y1="4" x2="2" y2="12" stroke="#78350F" strokeWidth="2.5" />
              <circle cx="16" cy="18" r="1.8" fill="#FACC15" />
              <circle cx="0" cy="19" r="1.8" fill="#FACC15" />
              <circle cx="-14" cy="17" r="1.8" fill="#FACC15" />
            </g>

            {/* Right Boot */}
            <g
              id="tulak-right-boot"
              transform={`translate(${rightBootX}, ${rightBootY}) rotate(${rightBootRot})`}
            >
              <path
                d="M -16,-16 L -8,-16 L 8,8 L 22,8 C 28,8 30,15 25,20 C 16,24 -18,24 -22,18 C -24,12 -20,-8 -16,-16 Z"
                fill="#451A03"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              <line x1="-6" y1="-4" x2="6" y2="4" stroke="#78350F" strokeWidth="2.5" />
              <line x1="-10" y1="4" x2="2" y2="12" stroke="#78350F" strokeWidth="2.5" />
              <circle cx="16" cy="18" r="1.8" fill="#FACC15" />
              <circle cx="0" cy="19" r="1.8" fill="#FACC15" />
              <circle cx="-14" cy="17" r="1.8" fill="#FACC15" />
            </g>
          </g>

          {/* 2. TRAVELER'S KNAPSACK (TORNA) - DRAWN BEHIND COAT */}
          <g id="tulak-torna" transform={`translate(170, 240) translate(0, ${knapsackBounce})`}>
            {/* Bulging Canvas Knapsack */}
            <path
              d="M -30,-30 C -45,0 -40,40 -20,55 C 0,65 25,50 30,30 C 35,5 25,-25 0,-35 Z"
              fill="#A16207"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />
            {/* Leather Buckle Straps */}
            <path d="M -15,-30 L -12,45" stroke="#451A03" strokeWidth="3.5" />
            <path d="M 12,-28 L 15,40" stroke="#451A03" strokeWidth="3.5" />
            <rect x="-18" y="0" width="8" height="7" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.5" />
            <rect x="10" y="-2" width="8" height="7" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.5" />
            {/* Bedroll Tied to Top */}
            <path
              d="M -35,-32 C -25,-44 15,-44 32,-30 L 26,-20 C 12,-30 -20,-30 -30,-22 Z"
              fill="#365314"
              stroke="#1C1610"
              strokeWidth="3"
            />
          </g>

          {/* 3. PATCHED TROUSERS */}
          <g id="tulak-trousers" transform="translate(240, 320)">
            <path
              d="M -42,-8 C -48,35 -48,72 -34,88 C -22,90 -16,75 -6,45 C 4,75 10,90 22,88 C 36,72 36,35 30,-8 Z"
              fill="url(#tulakPantsGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />
            {/* Shin Puttees / Bandages */}
            <path d="M -36,55 C -25,52 -18,60 -12,56" stroke="#FEF3C7" strokeWidth="3" fill="none" />
            <path d="M -34,68 C -24,65 -18,72 -14,69" stroke="#FEF3C7" strokeWidth="3" fill="none" />
            <path d="M 12,56 C 20,52 28,60 36,55" stroke="#FEF3C7" strokeWidth="3" fill="none" />
            <path d="M 14,69 C 22,65 28,72 34,68" stroke="#FEF3C7" strokeWidth="3" fill="none" />
          </g>

          {/* 4. WEATHERED PATCHED WOOL COAT */}
          <g id="tulak-coat" transform="translate(240, 245)">
            {/* Main Coat Body & Flared Tails */}
            <path
              d="M -54,-45 C -58,35 -64,95 -48,115 C -22,125 22,125 48,115 C 64,95 58,35 54,-45 C 32,-36 -32,-36 -54,-45 Z"
              fill="url(#tulakCoatGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '5' : '4'}
              strokeLinejoin="round"
            />

            {/* Coat Opening & Lapels */}
            <path d="M 0,-40 L 0,118" stroke="#1A2E05" strokeWidth="3.5" />
            <path d="M -34,-44 L 0,-8 L -18,-42 Z" fill="#65A30D" stroke="#1C1610" strokeWidth="2.5" />
            <path d="M 34,-44 L 0,-8 L 18,-42 Z" fill="#65A30D" stroke="#1C1610" strokeWidth="2.5" />

            {/* Colorful Folk Patches (Signature Josef Lada Vagabond Look) */}
            {/* Red Checkered Patch */}
            <g transform="translate(-32, 45) rotate(6)">
              <rect x="-12" y="-10" width="24" height="20" rx="3" fill="#DC2626" stroke="#1C1610" strokeWidth="2.2" />
              <line x1="-9" y1="-7" x2="9" y2="7" stroke="#FEF08A" strokeWidth="1.5" />
              <line x1="9" y1="-7" x2="-9" y2="7" stroke="#FEF08A" strokeWidth="1.5" />
              <rect x="-12" y="-10" width="24" height="20" rx="3" fill="none" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="3 2" />
            </g>
            {/* Ochre Patch */}
            <g transform="translate(28, 65) rotate(-8)">
              <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#D97706" stroke="#1C1610" strokeWidth="2.2" />
              <line x1="-8" y1="-10" x2="-8" y2="10" stroke="#1C1610" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="8" y1="-10" x2="8" y2="10" stroke="#1C1610" strokeWidth="1.2" strokeDasharray="2 2" />
            </g>
            {/* Blue Patch */}
            <g transform="translate(-18, 92) rotate(-4)">
              <rect x="-8" y="-7" width="16" height="14" rx="2" fill="#2563EB" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Rope Belt Around Waist with Knot */}
            <g transform="translate(0, 14)">
              <ellipse cx="0" cy="0" rx="52" ry="9" fill="none" stroke="#D97706" strokeWidth="5.5" />
              <ellipse cx="0" cy="0" rx="52" ry="9" fill="none" stroke="#FEF08A" strokeWidth="3" strokeDasharray="6 4" />
              {/* Belt Knot */}
              <circle cx="22" cy="3" r="6" fill="#B45309" stroke="#1C1610" strokeWidth="2" />
              <path d="M 22,6 C 26,16 28,26 30,34" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Wooden Water Canteen (Čutora na provázku) */}
            <g transform={`translate(38, 20) rotate(${canteenSway})`}>
              {/* String */}
              <line x1="0" y1="0" x2="0" y2="28" stroke="#78350F" strokeWidth="2" />
              {/* Round Wooden Canteen */}
              <circle cx="0" cy="38" r="14" fill="#92400E" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx="0" cy="38" r="8" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
              {/* Cork Stopper */}
              <rect x="-3" y="21" width="6" height="5" fill="#D97706" stroke="#1C1610" strokeWidth="1.5" />
            </g>

            {/* Big Wooden Horn Buttons */}
            {[-22, -2, 28].map((by) => (
              <g key={by} transform={`translate(-6, ${by})`}>
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="#D97706" stroke="#1C1610" strokeWidth="2" />
                <line x1="-3" y1="0" x2="3" y2="0" stroke="#1C1610" strokeWidth="1.5" />
              </g>
            ))}
          </g>

          {/* 5. HEAVY KNOBBY SUKOVICE WALKING STAFF */}
          <g id="tulak-sukovice-arm" transform={`translate(285, 235) rotate(${staffAngle})`}>
            {/* Arm with Green Coat Sleeve */}
            <path
              d="M -10,-10 C 6,10 18,25 24,45 C 30,42 32,32 28,24 C 20,12 8,-2 -10,-10 Z"
              fill="url(#tulakCoatGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Clenched Weathered Hand */}
            <circle cx="26" cy="42" r="10" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />

            {/* The Massive Oak Sukovice Staff */}
            <g transform="translate(24, 0)">
              {/* Main Gnarled Staff Body */}
              <path
                d="M -6,-95 C -4,-40 -7,40 -5,175 C -1,177 4,177 6,175 C 8,40 5,-40 7,-95 C 4,-98 -3,-98 -6,-95 Z"
                fill="url(#sukoviceBarkGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />

              {/* Carved Knots (Suky) */}
              <ellipse cx="-5" cy="-55" rx="5" ry="7" fill="#451A03" stroke="#1C1610" strokeWidth="2" />
              <ellipse cx="5" cy="15" rx="5" ry="8" fill="#451A03" stroke="#1C1610" strokeWidth="2" />
              <ellipse cx="-4" cy="95" rx="4" ry="6" fill="#451A03" stroke="#1C1610" strokeWidth="2" />

              {/* Bark Growth Rings */}
              <path d="M -5,-15 C 0,-18 3,-18 6,-15" fill="none" stroke="#78350F" strokeWidth="2" />
              <path d="M -5,55 C 0,52 3,52 6,55" fill="none" stroke="#78350F" strokeWidth="2" />
              <path d="M -5,135 C 0,132 3,132 6,135" fill="none" stroke="#78350F" strokeWidth="2" />

              {/* Iron Ferrule at Bottom Tip */}
              <path d="M -5,165 L -4,178 L 4,178 L 5,165 Z" fill="#64748B" stroke="#1C1610" strokeWidth="2" />
            </g>
          </g>

          {/* 6. HEAD, JOVIAL FACE, BUSHY BEARD & HERBAL PIPE */}
          <g id="tulak-head" transform="translate(240, 155)">
            {/* Neck */}
            <rect x="-16" y="25" width="32" height="24" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="3" />

            {/* Cheerful Head Base */}
            <ellipse
              cx="0"
              cy="8"
              rx="36"
              ry="38"
              fill="url(#tulakSkinGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
            />

            {/* Rosy Round Cheeks */}
            <circle cx="-22" cy="14" r="11" fill="#F87171" opacity="0.55" />
            <circle cx="22" cy="14" r="11" fill="#F87171" opacity="0.55" />

            {/* Jovial Red Bulbous Nose */}
            <circle cx="0" cy="10" r="11" fill="#EF4444" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-3" cy="7" r="3.5" fill="#FED7AA" />

            {/* Friendly Round Ears */}
            <ellipse cx="-36" cy="10" rx="7" ry="12" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
            <ellipse cx="36" cy="10" rx="7" ry="12" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />

            {/* Sparkling Merry Eyes with Pupil Tracking */}
            <g transform="translate(-15, -4)">
              <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx={gazeX} cy={gazeY} r="4.2" fill="#3B82F6" />
              <circle cx={gazeX} cy={gazeY} r="2.2" fill="#0F172A" />
              <circle cx={gazeX - 1.5} cy={gazeY - 1.5} r="1.5" fill="#FFFFFF" />
            </g>
            <g transform="translate(15, -4)">
              <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx={gazeX} cy={gazeY} r="4.2" fill="#3B82F6" />
              <circle cx={gazeX} cy={gazeY} r="2.2" fill="#0F172A" />
              <circle cx={gazeX - 1.5} cy={gazeY - 1.5} r="1.5" fill="#FFFFFF" />
            </g>

            {/* Bushy Curly White Eyebrows */}
            <g transform="translate(-16, -15)">
              <path
                d="M -14,4 C -10,-8 6,-8 10,4 C 6,2 -10,2 -14,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
            </g>
            <g transform="translate(16, -15)">
              <path
                d="M -10,4 C -6,-8 10,-8 14,4 C 10,2 -6,2 -10,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
            </g>

            {/* MERRY LAUGHING MOUTH WITH GLEAMING TOOTH */}
            {isReact || isFleeing ? (
              <ellipse cx="0" cy="24" rx="11" ry="14" fill="#7F1D1D" stroke="#1C1610" strokeWidth="3" />
            ) : isAction ? (
              <g transform="translate(0, 24)">
                <path d="M -18,-4 C -12,18 12,18 18,-4 Z" fill="#991B1B" stroke="#1C1610" strokeWidth="3.2" />
                <rect x="-6" y="-3" width="12" height="6" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.5" />
              </g>
            ) : (
              <g transform="translate(0, 22)">
                <path d="M -20,-2 C -12,16 12,16 20,-2 Z" fill="#991B1B" stroke="#1C1610" strokeWidth="3.2" />
                <rect x="-5" y="-1" width="10" height="5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.5" />
              </g>
            )}

            {/* LUSH CURLY WHITE FOLK BEARD & MUSTACHE */}
            <g id="tulak-beard" transform="translate(0, 18)">
              {/* Full Flowing Beard */}
              <path
                d="M -34,4 C -48,35 -30,68 0,74 C 30,68 48,35 34,4 C 28,15 15,18 0,18 C -15,18 -28,15 -34,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              {/* Curly Beard Strands */}
              <path d="M -16,28 C -22,46 -8,60 0,68" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              <path d="M 16,28 C 22,46 8,60 0,68" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              <path d="M -8,25 C -12,40 -2,52 0,58" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />

              {/* Bushy Mustache */}
              <g transform="translate(0, -4)">
                <path
                  d="M -26,8 C -14,-4 -2,0 0,4 C 2,0 14,-4 26,8 C 14,14 2,8 0,8 C -2,8 -14,14 -26,8 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="3.2"
                />
              </g>
            </g>

            {/* CLAY HERBAL PIPE (BYLINKOVÁ FAJFKA) */}
            <g id="herbal-pipe" transform="translate(18, 16) rotate(14)">
              {/* Curved Stem */}
              <path
                d="M 0,0 C 12,2 26,-4 38,-10"
                fill="none"
                stroke="#B45309"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Clay Pipe Bowl */}
              <g transform="translate(38, -10)">
                <path
                  d="M -6,-16 L 6,-16 C 8,-4 8,6 0,8 C -8,6 -8,-4 -6,-16 Z"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
                {/* Glowing Tobacco / Herbs */}
                <ellipse cx="0" cy="-16" rx="5.5" ry="2.5" fill="#DC2626" />
                <ellipse cx="0" cy="-16" rx="3.5" ry="1.5" fill="#F97316" />
                {/* Brass Lid / Chain */}
                <ellipse cx="0" cy="-18" rx="6" ry="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.2" />
              </g>
            </g>

            {/* 7. BATTERED POINTED FELT HAT WITH ROWANBERRY SPRIG */}
            <g id="tulak-hat" transform="translate(0, -20)">
              {/* Curled Hat Brim */}
              <ellipse cx="0" cy="0" rx="46" ry="14" fill="#1A2E05" stroke="#1C1610" strokeWidth="4" />
              <rect x="-42" y="-8" width="84" height="14" fill="#2E4A10" />

              {/* Tall Pointed Crumpled Crown */}
              <path
                d="M -42,-4 C -45,-38 -15,-68 18,-64 C 44,-60 48,-35 42,-4 Z"
                fill="url(#tulakHatGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.8' : '3.8'}
                strokeLinejoin="round"
              />

              {/* Red Hat Ribbon Band */}
              <path d="M -42,-2 C -20,6 20,6 42,-2 L 41,4 C 20,11 -20,11 -41,4 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2.5" />

              {/* Rowanberry Sprig (Jeřabiny s lístky) */}
              <g transform="translate(-24, -10) rotate(-18)">
                {/* Leaf */}
                <path d="M 0,0 C -8,-14 4,-24 8,-12 C 10,-6 6,0 0,0 Z" fill="#65A30D" stroke="#1C1610" strokeWidth="1.5" />
                <path d="M 6,-6 C 14,-18 24,-12 18,-2 Z" fill="#4D7C0F" stroke="#1C1610" strokeWidth="1.5" />
                {/* Red Rowanberries */}
                <circle cx="2" cy="-4" r="3.5" fill="#EF4444" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="-4" cy="-8" r="3.2" fill="#DC2626" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="7" cy="-9" r="3.0" fill="#B91C1C" stroke="#1C1610" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
