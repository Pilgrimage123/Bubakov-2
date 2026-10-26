import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartTulakSvg - Interactive smart vector SVG animation
 * Faithfully inspired by classic Czech folklore illustration of the joyful laughing Wanderer of Hrusice (Tulák) by Josef Lada
 * Features:
 * - Authentic Josef Lada art style matching canonical reference illustrations
 * - Battered floppy brown slouch hat with turned brim, green hatband & tucked sprig
 * - Wide jovial laughing expression showing upper teeth and red tongue, rosy cheeks & glowing red nose
 * - Thick curly white hair, bushy eyebrows, flowing white beard & wavy mustache
 * - Unbuttoned linen shirt, tattered ragged moss-green coat with patches & frayed cuffs
 * - Rope belt with knotted ends, hanging wooden canteen (čutora na řemínku)
 * - Canvas knapsack (torna) over shoulder with dark brown, blue, and checkered patches
 * - Torn brown trousers with blue knee patch, cream cloth leg wraps (ovinky), and lugged walking boots
 * - Massive multi-branched gnarled oak sukovice staff with carved bark knots
 * - Clay herbal pipe (Bylinková fajfka) with aromatic animated smoke puffs
 * - Whirlwind action strike "Pověstná sukovice" with swirling autumn leaves
 * - Grounded scale: baseline y=435, head height ~355px matching Krajánek & Babička
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
      aria-label="Smart animovaný Tulák z Hrusic s dýmkou, torna a sukovicí"
    >
      <defs>
        {/* Warm Weathered Skin Tone */}
        <radialGradient id="tulakSkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF2E8" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>

        {/* Patched Wool Ragged Coat Green */}
        <linearGradient id="tulakCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#556B2F" />
          <stop offset="45%" stopColor="#637C34" />
          <stop offset="85%" stopColor="#4A5D24" />
          <stop offset="100%" stopColor="#2D3B14" />
        </linearGradient>

        {/* Battered Crumpled Brown Slouch Hat */}
        <linearGradient id="tulakHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C7A53" />
          <stop offset="40%" stopColor="#84633E" />
          <stop offset="80%" stopColor="#6B4D2C" />
          <stop offset="100%" stopColor="#4A341C" />
        </linearGradient>

        {/* Gnarled Oak Sukovice Staff */}
        <linearGradient id="sukoviceBarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B4723E" />
          <stop offset="45%" stopColor="#965625" />
          <stop offset="80%" stopColor="#753C14" />
          <stop offset="100%" stopColor="#452008" />
        </linearGradient>

        {/* Burlap Canvas Torna */}
        <linearGradient id="tulakTornaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EAD8BE" />
          <stop offset="50%" stopColor="#D9BF9B" />
          <stop offset="100%" stopColor="#B89B74" />
        </linearGradient>

        {/* Trousers Brown */}
        <linearGradient id="tulakPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8C6239" />
          <stop offset="50%" stopColor="#734B24" />
          <stop offset="100%" stopColor="#543314" />
        </linearGradient>

        {/* Whirlwind Dust Filter */}
        <filter id="tulakWhirlGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Red & Cream Checkered Pattern for Sack Patch */}
        <pattern id="sackCheckered" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#B91C1C" />
          <rect x="4" width="4" height="4" fill="#FEF3C7" />
          <rect y="4" width="4" height="4" fill="#FEF3C7" />
          <rect x="4" y="4" width="4" height="4" fill="#B91C1C" />
        </pattern>
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
          {/* 1. ARTICULATED HOBNAIL BOOTS WITH TREADED LUGS & OVINKY */}
          <g id="tulak-boots" transform="translate(240, 395)">
            {/* Left Boot */}
            <g
              id="tulak-left-boot"
              transform={`translate(${leftBootX}, ${leftBootY}) rotate(${leftBootRot})`}
            >
              {/* White cloth ovinky (leg wraps) above boot */}
              <path
                d="M -13,-24 L 7,-24 L 8,-6 L -12,-6 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
              <line x1="-12" y1="-18" x2="7" y2="-15" stroke="#94A3B8" strokeWidth="2" />
              <line x1="-13" y1="-11" x2="8" y2="-8" stroke="#94A3B8" strokeWidth="2" />

              {/* Sturdy Brown Boot with thick sole */}
              <path
                d="M -16,-6 L -8,-6 L 8,10 L 25,10 C 30,10 32,16 27,21 C 18,25 -18,25 -22,19 C -24,13 -20,-2 -16,-6 Z"
                fill="#4E311A"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              {/* Boot Sole & Cleat/Lug Treads */}
              <path
                d="M -21,19 C -17,25 18,25 27,21 L 28,24 C 20,29 -18,29 -23,23 Z"
                fill="#1C1610"
              />
              {/* Yellow bootlaces */}
              <line x1="-5" y1="2" x2="6" y2="7" stroke="#FBBF24" strokeWidth="2" />
              <line x1="-8" y1="7" x2="3" y2="12" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="16" cy="18" r="1.8" fill="#FACC15" />
              <circle cx="0" cy="19" r="1.8" fill="#FACC15" />
              <circle cx="-14" cy="17" r="1.8" fill="#FACC15" />
            </g>

            {/* Right Boot */}
            <g
              id="tulak-right-boot"
              transform={`translate(${rightBootX}, ${rightBootY}) rotate(${rightBootRot})`}
            >
              {/* White cloth ovinky (leg wraps) */}
              <path
                d="M -13,-24 L 7,-24 L 8,-6 L -12,-6 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
              <line x1="-12" y1="-18" x2="7" y2="-15" stroke="#94A3B8" strokeWidth="2" />
              <line x1="-13" y1="-11" x2="8" y2="-8" stroke="#94A3B8" strokeWidth="2" />

              {/* Sturdy Brown Boot */}
              <path
                d="M -16,-6 L -8,-6 L 8,10 L 25,10 C 30,10 32,16 27,21 C 18,25 -18,25 -22,19 C -24,13 -20,-2 -16,-6 Z"
                fill="#4E311A"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              <path
                d="M -21,19 C -17,25 18,25 27,21 L 28,24 C 20,29 -18,29 -23,23 Z"
                fill="#1C1610"
              />
              <line x1="-5" y1="2" x2="6" y2="7" stroke="#FBBF24" strokeWidth="2" />
              <line x1="-8" y1="7" x2="3" y2="12" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="16" cy="18" r="1.8" fill="#FACC15" />
              <circle cx="0" cy="19" r="1.8" fill="#FACC15" />
              <circle cx="-14" cy="17" r="1.8" fill="#FACC15" />
            </g>
          </g>

          {/* 2. TRAVELER'S CANVAS KNAPSACK (TORNA) - SLUNG OVER BACK */}
          <g id="tulak-torna" transform={`translate(162, 230) translate(0, ${knapsackBounce})`}>
            {/* Bulging Canvas Burlap Sack matching Image 2 */}
            <path
              d="M -10,-45 C -45,-30 -58,15 -35,55 C -15,75 22,65 35,35 C 45,5 30,-30 0,-48 Z"
              fill="url(#tulakTornaGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />
            {/* Sack Tied Neck at Top */}
            <g transform="translate(-5, -45) rotate(-20)">
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#B89B74" stroke="#1C1610" strokeWidth="3" />
              <path d="M -8,-5 C -15,-18 5,-22 0,-32" stroke="#785324" strokeWidth="3.5" fill="none" />
              <circle cx="-1" cy="-2" r="5" fill="#E28743" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Dark Brown Stitched Patch */}
            <g transform="translate(-8, 8) rotate(-6)">
              <rect x="-14" y="-12" width="28" height="24" rx="2" fill="#452712" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="-12" y1="-10" x2="-12" y2="10" stroke="#EAD8BE" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="12" y1="-10" x2="12" y2="10" stroke="#EAD8BE" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="-12" y1="-10" x2="12" y2="-10" stroke="#EAD8BE" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="-12" y1="10" x2="12" y2="10" stroke="#EAD8BE" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>

            {/* Denim Blue Patch on the lower corner */}
            <g transform="translate(-32, 28) rotate(18)">
              <rect x="-10" y="-8" width="20" height="16" rx="2" fill="#3B6790" stroke="#1C1610" strokeWidth="2" />
              <line x1="-8" y1="-6" x2="8" y2="6" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="2 2" />
            </g>

            {/* Red & Cream Checkered Patch */}
            <g transform="translate(14, 18) rotate(12)">
              <rect x="-9" y="-8" width="18" height="16" rx="2" fill="url(#sackCheckered)" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Strong leather shoulder sling strap running to chest */}
            <path
              d="M 5,-35 C 35,5 45,45 60,95"
              fill="none"
              stroke="#5C3615"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 5,-35 C 35,5 45,45 60,95"
              fill="none"
              stroke="#874E1D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* 3. PATCHED TROUSERS WITH JAGGED HEMS & KNEE PATCHES */}
          <g id="tulak-trousers" transform="translate(240, 315)">
            {/* Ragged Tattered Brown Trousers */}
            <path
              d="M -44,-5 C -48,35 -52,70 -36,86 C -28,92 -20,85 -16,72 C -12,85 -4,90 4,75 C 10,88 18,92 26,86 C 42,70 42,35 34,-5 Z"
              fill="url(#tulakPantsGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />

            {/* Jagged cloth rips and fringes at trouser cuffs */}
            <path
              d="M -42,75 L -38,88 L -32,78 L -26,87 L -20,74"
              stroke="#1C1610"
              strokeWidth="2.5"
              fill="#543314"
            />
            <path
              d="M 12,74 L 18,87 L 24,78 L 30,88 L 34,75"
              stroke="#1C1610"
              strokeWidth="2.5"
              fill="#543314"
            />

            {/* Distinct Blue Denim Patch on Right Knee (matching Image 2) */}
            <g transform="translate(18, 48) rotate(-6)">
              <rect x="-11" y="-10" width="22" height="20" rx="3" fill="#3B82F6" stroke="#1C1610" strokeWidth="2.2" />
              <rect x="-11" y="-10" width="22" height="20" rx="3" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 2" />
              <line x1="-7" y1="-6" x2="7" y2="6" stroke="#1D4ED8" strokeWidth="1.5" />
            </g>

            {/* Weathered Ochre Patch on Left Thigh */}
            <g transform="translate(-24, 38) rotate(8)">
              <rect x="-9" y="-8" width="18" height="16" rx="2" fill="#D97706" stroke="#1C1610" strokeWidth="2" />
              <line x1="-7" y1="-6" x2="-7" y2="6" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="7" y1="-6" x2="7" y2="6" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="2 2" />
            </g>
          </g>

          {/* 4. WEATHERED TATTERED WOOL COAT WITH SHIRT & ROPE BELT */}
          <g id="tulak-coat" transform="translate(240, 240)">
            {/* White unbuttoned linen peasant shirt peeking from beneath coat */}
            <path
              d="M -25,-42 C -18,-15 -12,10 0,22 C 12,10 18,-15 25,-42 Z"
              fill="#F8FAFC"
              stroke="#1C1610"
              strokeWidth="3"
            />
            {/* Shirt collar & chest buttons */}
            <path d="M -18,-42 L 0,-15 L 18,-42" stroke="#1C1610" strokeWidth="2.5" fill="none" />
            <circle cx="0" cy="-6" r="2.2" fill="#475569" />
            <circle cx="0" cy="6" r="2.2" fill="#475569" />

            {/* Main Ragged Coat Body & Jagged Flared Tails (matching Image 2) */}
            <path
              d="M -54,-45 C -60,25 -68,90 -52,118 C -42,125 -32,108 -24,124 C -15,110 -6,126 0,115 C 8,126 18,110 26,124 C 36,108 44,125 54,118 C 68,90 60,25 54,-45 C 32,-36 -32,-36 -54,-45 Z"
              fill="url(#tulakCoatGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '5' : '4'}
              strokeLinejoin="round"
            />

            {/* Coat Lapels & ragged fringes */}
            <path d="M -34,-44 L -12,-8 L -24,-42 Z" fill="#6B8E23" stroke="#1C1610" strokeWidth="2.5" />
            <path d="M 34,-44 L 12,-8 L 24,-42 Z" fill="#6B8E23" stroke="#1C1610" strokeWidth="2.5" />

            {/* Ragged cuts in coat tails */}
            <path d="M -42,105 L -36,120 M -18,102 L -12,122 M 16,104 L 22,121 M 38,103 L 44,118" stroke="#1C1610" strokeWidth="2.2" />

            {/* Folk Patches on Coat */}
            {/* Rust-Brown Patch on Right Shoulder */}
            <g transform="translate(-36, -20) rotate(-12)">
              <rect x="-10" y="-8" width="20" height="16" rx="2" fill="#8B4513" stroke="#1C1610" strokeWidth="2" />
              <rect x="-10" y="-8" width="20" height="16" rx="2" fill="none" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="3 2" />
            </g>

            {/* Purple-Brown Patch on lower flank */}
            <g transform="translate(32, 60) rotate(8)">
              <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#6D3B47" stroke="#1C1610" strokeWidth="2.2" />
              <line x1="-8" y1="-10" x2="8" y2="10" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 2" />
            </g>

            {/* Ochre Patch on left flank */}
            <g transform="translate(-34, 52) rotate(6)">
              <rect x="-11" y="-9" width="22" height="18" rx="2" fill="#D97706" stroke="#1C1610" strokeWidth="2.2" />
              <line x1="-8" y1="-7" x2="8" y2="7" stroke="#1C1610" strokeWidth="1.2" strokeDasharray="2 2" />
            </g>

            {/* Rope Cord Belt Around Waist with Knotted Ends (matching Image 2) */}
            <g transform="translate(0, 18)">
              <ellipse cx="0" cy="0" rx="52" ry="9" fill="none" stroke="#CA8A04" strokeWidth="5" />
              <ellipse cx="0" cy="0" rx="52" ry="9" fill="none" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="6 4" />
              {/* Knotted Rope Ends */}
              <circle cx="16" cy="3" r="5.5" fill="#A16207" stroke="#1C1610" strokeWidth="2" />
              <path d="M 14,7 C 12,18 8,28 6,36" stroke="#CA8A04" strokeWidth="4" strokeLinecap="round" />
              <path d="M 18,7 C 22,20 25,30 26,38" stroke="#CA8A04" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Wooden Water Canteen (Čutora na řemínku) */}
            <g transform={`translate(36, 22) rotate(${canteenSway})`}>
              {/* Leather strap */}
              <line x1="0" y1="0" x2="-2" y2="30" stroke="#5C3615" strokeWidth="2.5" />
              {/* Oval Wooden Flask / Canteen */}
              <ellipse cx="-2" cy="42" rx="14" ry="17" fill="#8B4513" stroke="#1C1610" strokeWidth="2.8" />
              <ellipse cx="-2" cy="42" rx="9" ry="11" fill="#A0522D" stroke="#5C3615" strokeWidth="1.5" />
              {/* Cork Stopper with neck binding */}
              <rect x="-5" y="22" width="7" height="6" fill="#D97706" stroke="#1C1610" strokeWidth="1.5" />
              <line x1="-6" y1="28" x2="3" y2="28" stroke="#FACC15" strokeWidth="1.5" />
            </g>
          </g>

          {/* 5. HEAVY MULTI-BRANCHED OAK SUKOVICE WALKING STAFF */}
          <g id="tulak-sukovice-arm" transform={`translate(285, 235) rotate(${staffAngle})`}>
            {/* Arm with Tattered Green Coat Sleeve & Ragged Cuff */}
            <path
              d="M -10,-10 C 6,10 20,25 25,46 C 32,42 34,30 28,22 C 20,10 8,-2 -10,-10 Z"
              fill="url(#tulakCoatGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Ragged frayed sleeve cuff */}
            <path
              d="M 16,38 L 22,48 L 28,42 L 32,50 L 30,36"
              fill="#3D4C1E"
              stroke="#1C1610"
              strokeWidth="2"
            />
            {/* Clenched Weathered Hand */}
            <circle cx="28" cy="44" r="10.5" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
            <path d="M 23,38 Q 28,42 33,38 M 23,44 Q 28,48 33,44" stroke="#1C1610" strokeWidth="1.8" fill="none" />

            {/* The Massive Oak Sukovice Staff with Large Knobby Branch Stubs (matching Image 2) */}
            <g transform="translate(26, 0)">
              {/* Main Gnarled Staff Body with Natural Burls */}
              <path
                d="M -8,-105 C -4,-80 -12,-50 -6,-10 C -2,30 -9,80 -5,178 C -1,180 5,180 7,178 C 11,80 4,30 8,-10 C 14,-50 6,-80 8,-105 C 4,-108 -4,-108 -8,-105 Z"
                fill="url(#sukoviceBarkGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />

              {/* Prominent Branch Stub Knots (Suky s letokruhy) */}
              {/* Large top-left knot branch */}
              <g transform="translate(-14, -85) rotate(-25)">
                <ellipse cx="0" cy="0" rx="9" ry="12" fill="#5C3110" stroke="#1C1610" strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="5" ry="7" fill="#8A4E20" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Top-right branch stub */}
              <g transform="translate(14, -68) rotate(30)">
                <ellipse cx="0" cy="0" rx="8" ry="11" fill="#5C3110" stroke="#1C1610" strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="4" ry="6" fill="#8A4E20" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Mid-height knot */}
              <g transform="translate(-10, -20) rotate(-15)">
                <ellipse cx="0" cy="0" rx="8" ry="10" fill="#5C3110" stroke="#1C1610" strokeWidth="2.5" />
                <ellipse cx="0" cy="0" rx="4" ry="5" fill="#8A4E20" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Lower right knot */}
              <g transform="translate(10, 35) rotate(20)">
                <ellipse cx="0" cy="0" rx="7" ry="9" fill="#5C3110" stroke="#1C1610" strokeWidth="2.2" />
                <ellipse cx="0" cy="0" rx="3.5" ry="4.5" fill="#8A4E20" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Lower left knot */}
              <g transform="translate(-8, 95) rotate(-15)">
                <ellipse cx="0" cy="0" rx="6" ry="8" fill="#5C3110" stroke="#1C1610" strokeWidth="2" />
              </g>

              {/* Bark Grain Rings & Grooves */}
              <path d="M -6,-45 C 0,-48 3,-48 7,-45" fill="none" stroke="#5C3110" strokeWidth="2" />
              <path d="M -5,12 C 0,9 4,9 7,12" fill="none" stroke="#5C3110" strokeWidth="2" />
              <path d="M -5,65 C 0,62 3,62 6,65" fill="none" stroke="#5C3110" strokeWidth="2" />
              <path d="M -5,135 C 0,132 3,132 6,135" fill="none" stroke="#5C3110" strokeWidth="2" />

              {/* Weathered Staff Tip */}
              <path d="M -5,168 L -4,179 L 4,179 L 5,168 Z" fill="#452008" stroke="#1C1610" strokeWidth="2" />
            </g>
          </g>

          {/* 6. HEAD, JOVIAL FACE, BUSHY BEARD & HERBAL PIPE */}
          <g id="tulak-head" transform="translate(240, 155)">
            {/* Weathered neck */}
            <rect x="-16" y="24" width="32" height="24" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="3" />

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

            {/* Broad Rosy Round Cheeks */}
            <circle cx="-22" cy="14" r="12" fill="#F87171" opacity="0.6" />
            <circle cx="22" cy="14" r="12" fill="#F87171" opacity="0.6" />

            {/* Jovial Red Bulbous Nose with glossy highlight (signature Lada look) */}
            <circle cx="0" cy="10" r="12" fill="#EF4444" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-3" cy="7" r="4" fill="#FED7AA" />

            {/* Friendly Ears */}
            <ellipse cx="-36" cy="10" rx="7" ry="12" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
            <ellipse cx="36" cy="10" rx="7" ry="12" fill="url(#tulakSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />

            {/* Joyful Squinting Eyes with Smile Crinkles (matching Image 2) */}
            <g transform="translate(-16, -4)">
              {isReact || isFleeing ? (
                <>
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx={gazeX} cy={gazeY} r="3.5" fill="#1C1610" />
                </>
              ) : (
                /* Merry squinting crescent laughing eyes */
                <g>
                  <path d="M -8,2 Q 0,-6 8,2" stroke="#1C1610" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                  <path d="M -10,0 L -14,-2 M -9,3 L -13,4" stroke="#1C1610" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              )}
            </g>
            <g transform="translate(16, -4)">
              {isReact || isFleeing ? (
                <>
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx={gazeX} cy={gazeY} r="3.5" fill="#1C1610" />
                </>
              ) : (
                <g>
                  <path d="M -8,2 Q 0,-6 8,2" stroke="#1C1610" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                  <path d="M 8,0 L 12,-2 M 9,3 L 13,4" stroke="#1C1610" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* Bushy Curly White Eyebrows */}
            <g transform="translate(-16, -14)">
              <path
                d="M -14,4 C -10,-8 6,-8 10,4 C 6,2 -10,2 -14,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
            </g>
            <g transform="translate(16, -14)">
              <path
                d="M -10,4 C -6,-8 10,-8 14,4 C 10,2 -6,2 -10,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
            </g>

            {/* BROAD JOVIAL LAUGHING MOUTH WITH TEETH & RED TONGUE (matching Image 2) */}
            {isReact || isFleeing ? (
              <ellipse cx="0" cy="24" rx="12" ry="14" fill="#7F1D1D" stroke="#1C1610" strokeWidth="3" />
            ) : (
              <g transform="translate(0, 22)">
                {/* Wide open laughing mouth cavity */}
                <path
                  d="M -22,-2 C -14,22 14,22 22,-2 Z"
                  fill="#7F1D1D"
                  stroke="#1C1610"
                  strokeWidth="3.5"
                />
                {/* Gleaming upper teeth */}
                <path
                  d="M -18,-1 L -18,5 C -10,7 10,7 18,5 L 18,-1 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="1.5"
                />
                <line x1="-6" y1="-1" x2="-6" y2="6" stroke="#CBD5E1" strokeWidth="1.2" />
                <line x1="0" y1="-1" x2="0" y2="7" stroke="#CBD5E1" strokeWidth="1.2" />
                <line x1="6" y1="-1" x2="6" y2="6" stroke="#CBD5E1" strokeWidth="1.2" />
                {/* Red joyful tongue */}
                <ellipse cx="0" cy="15" rx="10" ry="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
              </g>
            )}

            {/* LUSH CURLY FLOWING WHITE FOLK BEARD & MUSTACHE */}
            <g id="tulak-beard" transform="translate(0, 18)">
              {/* Full Flowing Wild Folk Beard */}
              <path
                d="M -36,4 C -52,32 -38,72 0,78 C 38,72 52,32 36,4 C 30,16 16,18 0,18 C -16,18 -30,16 -36,4 Z"
                fill="#F8FAFC"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              {/* Curly Beard Tufts and waves */}
              <path d="M -20,28 C -28,48 -12,64 0,72" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
              <path d="M 20,28 C 28,48 12,64 0,72" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
              <path d="M -10,24 C -16,42 -4,56 0,62" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 10,24 C 16,42 4,56 0,62" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

              {/* Bushy Wavy Mustache */}
              <g transform="translate(0, -5)">
                <path
                  d="M -28,8 C -16,-6 -3,0 0,4 C 3,0 16,-6 28,8 C 16,14 3,8 0,8 C -3,8 -16,14 -28,8 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="3.2"
                />
              </g>
            </g>

            {/* CLAY HERBAL PIPE (BYLINKOVÁ FAJFKA) */}
            <g id="herbal-pipe" transform="translate(18, 16) rotate(14)">
              {/* Curved Cherry-wood Stem */}
              <path
                d="M 0,0 C 12,2 26,-4 38,-10"
                fill="none"
                stroke="#8A4E20"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Clay Pipe Bowl */}
              <g transform="translate(38, -10)">
                <path
                  d="M -6,-16 L 6,-16 C 8,-4 8,6 0,8 C -8,6 -8,-4 -6,-16 Z"
                  fill="#5C3110"
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

            {/* 7. BATTERED CRUMPLED BROWN SLOUCH HAT (matching Image 2) */}
            <g id="tulak-hat" transform="translate(0, -20)">
              {/* Floppy Turned-Up Brim */}
              <path
                d="M -52,2 C -54,-14 54,-14 52,2 C 42,12 -42,12 -52,2 Z"
                fill="#6B4D2C"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Crumpled Battered Tall Crown with indentations */}
              <path
                d="M -42,-4 C -48,-36 -28,-62 -12,-68 C 2,-72 18,-64 24,-58 C 34,-62 44,-42 40,-4 Z"
                fill="url(#tulakHatGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.8' : '3.8'}
                strokeLinejoin="round"
              />

              {/* Deep Olive Green Hatband Band */}
              <path
                d="M -43,-2 C -20,6 20,6 41,-2 L 40,4 C 20,11 -20,11 -42,4 Z"
                fill="#2E4A10"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Tucked Feather / Forest Sprig in Hatband */}
              <g transform="translate(-26, -14) rotate(-22)">
                {/* Foliage Leaf */}
                <path d="M 0,0 C -8,-16 2,-26 8,-14 C 10,-8 6,0 0,0 Z" fill="#65A30D" stroke="#1C1610" strokeWidth="1.5" />
                {/* Small Tucked Feather */}
                <path d="M 4,-4 C 12,-20 22,-16 16,-4 Z" fill="#E2E8F0" stroke="#1C1610" strokeWidth="1.5" />
                <line x1="6" y1="-2" x2="14" y2="-16" stroke="#94A3B8" strokeWidth="1" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
