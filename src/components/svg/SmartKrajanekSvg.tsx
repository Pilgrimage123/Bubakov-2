import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartKrajanekSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale & Josef Lada folklore illustration of the wandering miller's lad (Krajánek)
 * Features:
 * - Cheerful wandering journeyman in dusty flour-flecked clothes
 * - Floppy peaked miller's cap with an ear of ripe wheat tucked into the band
 * - Red-and-white polka-dot bindle on a carved shoulder stick (uzlík s bílými puntíky)
 * - Peasant linen shirt, warm corduroy vest with brass buttons & spotted neckerchief
 * - Stonecraft dressing hammer (kamenické mlynářské kladívko / pemrlice)
 * - Patched blue trousers and sturdy articulated traveling boots with brass buckles
 * - "Jízda na žernovu" action: rides atop a massive spinning granite millstone with friction sparks & flour bursts
 * - Complete animation set: idle, walk, sprint, action, react, flee with interactive pointer tracking
 */
export const SmartKrajanekSvg: React.FC<SmartCharacterProps> = ({
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
    showMillstone = true,
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
  const walkSpeed = isFleeing ? 18 : isSprinting ? 14 : isWalking ? 8 : isReact ? 24 : 2.4;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Body vertical bobbing and sway
  const bobY = isAction
    ? -Math.abs(Math.sin(t * 12)) * 6 - 8
    : isFleeing
    ? -Math.abs(walkSin) * 16
    : isSprinting
    ? -Math.abs(walkSin) * 12
    : isWalking
    ? -Math.abs(walkSin) * 8
    : isReact
    ? -Math.abs(Math.sin(t * 16)) * 10 - 4
    : Math.sin(t * 2.2) * 2.5;

  const bodyLean = isAction
    ? 6 + Math.sin(t * 10) * 3
    : isFleeing
    ? 14 + walkSin * 4
    : isSprinting
    ? 12 + walkSin * 3
    : isWalking
    ? 5 + walkCos * 2.5
    : isReact
    ? -12 + Math.sin(t * 26) * 4
    : Math.sin(t * 1.5) * 1.2;

  // Stride kinematics for boots (legs ONLY swing when actively moving)
  const strideAmp = isMoving ? (isFleeing ? 26 : isSprinting ? 20 : 13) : 0;
  const legSwingRot = isMoving ? (isFleeing ? 28 : isSprinting ? 22 : 14) : 0;
  const leftShoeX = isMoving ? -26 + walkSin * strideAmp : -26;
  const leftShoeY = isMoving ? 32 - Math.max(0, walkCos) * (strideAmp * 0.65) : 32;
  const leftShoeRot = isMoving ? walkSin * legSwingRot : 0;

  const rightShoeX = isMoving ? 26 - walkSin * strideAmp : 26;
  const rightShoeY = isMoving ? 32 - Math.max(0, -walkCos) * (strideAmp * 0.65) : 32;
  const rightShoeRot = isMoving ? -walkSin * legSwingRot : 0;

  // Shoulder stick & bindle bounce
  const bindleAngle = isAction
    ? -25 + Math.sin(t * 14) * 8
    : isFleeing
    ? -35 + Math.sin(t * 22) * 26
    : isSprinting
    ? -22 + Math.sin(t * 16) * 16
    : isWalking
    ? -12 + Math.sin(t * 8) * 10
    : isReact
    ? 20 + Math.sin(t * 24) * 14
    : -8 + Math.sin(t * 2.5) * 3;

  const bindleSagY = Math.sin(t * (isMoving ? walkSpeed * 1.5 : 3)) * (isMoving ? 7 : 2);

  // Stonecraft hammer swing
  const hammerAngle = isAction
    ? -65 + Math.sin(t * 16) * 38
    : isReact
    ? -45 + Math.sin(t * 26) * 15
    : isFleeing
    ? 25 + Math.sin(t * 20) * 25
    : isSprinting
    ? -30 + Math.sin(t * 14) * 15
    : isWalking
    ? 15 + Math.sin(t * 8) * 18
    : Math.sin(t * 2) * 4;

  // Gaze & eye tracking
  const gazeX = isReact
    ? -2.5 + Math.sin(t * 26) * 1.2
    : isFleeing
    ? 2.8
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

  // Cap wheat ear fluttering in the wind
  const wheatWave = isAction
    ? -18 + Math.sin(t * 20) * 12
    : isSprinting || isFleeing
    ? -22 + Math.sin(t * 18) * 10
    : Math.sin(t * 4) * 5;

  // Millstone rotation and sparks during "Jízda na žernovu"
  const millstoneSpin = isAction ? (t * 720) % 360 : (t * 40) % 360;

  // Flying friction sparks
  const sparks = [
    { x: 190 + Math.sin(t * 18 + 0) * 55, y: 440 - ((t * 120 + 10) % 45), r: 3.5, col: '#FDE047' },
    { x: 235 + Math.cos(t * 22 + 1) * 60, y: 442 - ((t * 140 + 25) % 48), r: 4.2, col: '#F97316' },
    { x: 275 + Math.sin(t * 19 + 2) * 50, y: 445 - ((t * 130 + 40) % 42), r: 3.2, col: '#EF4444' },
    { x: 210 + Math.cos(t * 25 + 3) * 70, y: 438 - ((t * 150 + 55) % 50), r: 3.8, col: '#FACC15' },
    { x: 255 + Math.sin(t * 21 + 4) * 65, y: 446 - ((t * 110 + 70) % 44), r: 3.0, col: '#FFFBEB' },
  ];

  // Flour dust puffs
  const flourPuffs = [
    { x: 160 - ((t * 80) % 65), y: 425 - ((t * 40) % 30), r: 12 + Math.sin(t * 6) * 4, op: 0.55 },
    { x: 140 - ((t * 90 + 30) % 75), y: 415 - ((t * 50 + 10) % 35), r: 16 + Math.cos(t * 5) * 5, op: 0.4 },
    { x: 310 + ((t * 85 + 15) % 65), y: 420 - ((t * 45 + 15) % 30), r: 14 + Math.sin(t * 7) * 4, op: 0.5 },
  ];

  // Sweat droplets for panic or hit react
  const sweatDrops = [
    { x: 205 - ((t * 95) % 30), y: 135 + ((t * 75) % 32), r: 3.6 },
    { x: 280 + ((t * 90 + 12) % 30), y: 130 + ((t * 80 + 10) % 30), r: 3.2 },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 480 480"
      width={size}
      height={size}
      className={`smart-krajanek-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Krajánek – mlynářský tovaryš s mošnou a žernovem"
    >
      <defs>
        {/* Warm Folk Skin Tone */}
        <radialGradient id="krajanekSkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF4EC" />
          <stop offset="55%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>

        {/* Dusty Miller Cap Felt */}
        <linearGradient id="krajanekCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78716C" />
          <stop offset="50%" stopColor="#57534E" />
          <stop offset="100%" stopColor="#44403C" />
        </linearGradient>

        {/* Brown Corduroy Vest */}
        <linearGradient id="krajanekVestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="40%" stopColor="#B45309" />
          <stop offset="80%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#5B2105" />
        </linearGradient>

        {/* Peasant Trousers */}
        <linearGradient id="krajanekPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Granite Millstone Texture */}
        <radialGradient id="graniteStoneGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="45%" stopColor="#64748B" />
          <stop offset="80%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* Polka-Dot Bindle Pattern */}
        <pattern id="krajanekPolkaDot" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#DC2626" />
          <circle cx="7" cy="7" r="2.8" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="2.8" fill="#FFFFFF" />
          <circle cx="14" cy="0" r="2.8" fill="#FFFFFF" />
          <circle cx="0" cy="14" r="2.8" fill="#FFFFFF" />
          <circle cx="14" cy="14" r="2.8" fill="#FFFFFF" />
        </pattern>

        {/* Golden Wheat Spikelet */}
        <linearGradient id="wheatSpikeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Stonecraft Hammer Iron */}
        <linearGradient id="ironHammerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Spark Glow Filter */}
        <filter id="krajanekSparkGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(240, 240) scale(${direction}, 1) translate(-240, -240)`}>
        {/* GROUND SHADOW / MILLSTONE */}
        {showShadow && !isAction && (
          <g opacity="0.3">
            <ellipse cx={240} cy={445} rx={75} ry={15} fill="#1E293B" />
          </g>
        )}

        {/* ======================================================== */}
        {/* JÍZDA NA ŽERNOVU (ACTION MODE - GIANT ROTATING MILLSTONE) */}
        {/* ======================================================== */}
        {showMillstone && (isAction || features.showMillstone) && (
          <g id="giant-millstone" transform={`translate(240, ${isAction ? 425 : 435})`}>
            {/* Stone Drop Shadow */}
            <ellipse cx="0" cy="18" rx="115" ry="24" fill="#0F172A" opacity="0.45" />

            {/* Side Rim of Granite Millstone */}
            <path
              d="M -110,0 C -110,16 110,16 110,0 L 110,18 C 110,34 -110,34 -110,18 Z"
              fill="#334155"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
            />

            {/* Top Face of Massive Granite Millstone (Oval in 2.5D perspective) */}
            <g transform={`scale(1, 0.32) rotate(${millstoneSpin})`}>
              <circle
                cx="0"
                cy="0"
                r="110"
                fill="url(#graniteStoneGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '8' : '6'}
              />

              {/* Radial Carved Dressing Grooves (mlynářské rýhování) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <line x1="22" y1="0" x2="104" y2="0" stroke="#1E293B" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="38" y1="-8" x2="100" y2="-12" stroke="#334155" strokeWidth="3.5" />
                  <line x1="38" y1="8" x2="100" y2="12" stroke="#334155" strokeWidth="3.5" />
                </g>
              ))}

              {/* Central Square Eye with Iron Rynd / Cross (kypřice / papřice) */}
              <rect x="-18" y="-18" width="36" height="36" fill="#0F172A" stroke="#1C1610" strokeWidth="4" />
              <path
                d="M -26,-7 L -7,-7 L -7,-26 L 7,-26 L 7,-7 L 26,-7 L 26,7 L 7,7 L 7,26 L -7,26 L -7,7 L -26,7 Z"
                fill="#475569"
                stroke="#1C1610"
                strokeWidth="2.5"
              />
            </g>

            {/* Friction Speed Blur Ring */}
            {isAction && (
              <ellipse
                cx="0"
                cy="0"
                rx="116"
                ry="36"
                fill="none"
                stroke="#FDE047"
                strokeWidth="3.5"
                strokeDasharray="20 12"
                opacity="0.8"
                filter="url(#krajanekSparkGlow)"
              />
            )}
          </g>
        )}

        {/* FLOUR DUST BILLOWS & SPARKS */}
        {showParticles && (isAction || isSprinting) && (
          <g className="flour-sparks">
            {/* Flour Puffs */}
            {flourPuffs.map((puff, idx) => (
              <ellipse
                key={`flour-${idx}`}
                cx={puff.x}
                cy={puff.y}
                rx={puff.r * 1.3}
                ry={puff.r}
                fill="#FEF3C7"
                opacity={puff.op}
              />
            ))}

            {/* Sparks during Action */}
            {isAction &&
              sparks.map((spark, idx) => (
                <circle
                  key={`spark-${idx}`}
                  cx={spark.x}
                  cy={spark.y}
                  r={spark.r}
                  fill={spark.col}
                  stroke="#1C1610"
                  strokeWidth="1.2"
                  filter="url(#krajanekSparkGlow)"
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
        {/* KRAJÁNEK - ROOT TRANSFORMED WITH BOB AND SWAY           */}
        {/* ======================================================== */}
        <g id="krajanek-body" transform={`translate(0, ${bobY}) rotate(${bodyLean}, 240, 300)`}>
          {/* 1. ARTICULATED FEET / BOOTS (UNDER SKIRT/PANTS) */}
          {!isAction && (
            <g id="krajanek-shoes" transform="translate(240, 395)">
              {/* Left Boot */}
              <g
                id="krajanek-left-boot"
                transform={`translate(${leftShoeX}, ${leftShoeY}) rotate(${leftShoeRot})`}
              >
                <path
                  d="M -14,-14 L -6,-14 L 6,10 L 18,10 C 24,10 26,16 22,20 C 14,24 -16,24 -20,20 C -22,16 -18,-6 -14,-14 Z"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? '4' : '3'}
                  strokeLinejoin="round"
                />
                {/* Boot Brass Buckle */}
                <rect x="0" y="8" width="9" height="7" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Right Boot */}
              <g
                id="krajanek-right-boot"
                transform={`translate(${rightShoeX}, ${rightShoeY}) rotate(${rightShoeRot})`}
              >
                <path
                  d="M -14,-14 L -6,-14 L 6,10 L 18,10 C 24,10 26,16 22,20 C 14,24 -16,24 -20,20 C -22,16 -18,-6 -14,-14 Z"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? '4' : '3'}
                  strokeLinejoin="round"
                />
                <rect x="0" y="8" width="9" height="7" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {/* Action-specific Crouched Stance on Millstone */}
          {isAction && (
            <g id="krajanek-action-feet" transform="translate(240, 390)">
              <g transform="translate(-32, 10) rotate(-12)">
                <path
                  d="M -12,-12 L 8,6 L 20,6 C 26,6 28,12 24,16 C 14,20 -14,20 -18,16 Z"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth="3.5"
                />
              </g>
              <g transform="translate(34, 12) rotate(16)">
                <path
                  d="M -12,-12 L 8,6 L 20,6 C 26,6 28,12 24,16 C 14,20 -14,20 -18,16 Z"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth="3.5"
                />
              </g>
            </g>
          )}

          {/* 2. BLUE PEASANT PANTS WITH KNEE PATCHES */}
          <g id="krajanek-trousers" transform="translate(240, 320)">
            <path
              d="M -38,-10 C -42,30 -44,70 -30,85 C -20,86 -14,75 -6,45 C 2,75 8,86 18,85 C 32,70 30,30 26,-10 Z"
              fill="url(#krajanekPantsGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />
            {/* Knee Patch (Czech folklore craft aesthetic) */}
            <g transform="translate(-24, 45) rotate(-8)">
              <rect x="-8" y="-8" width="16" height="15" rx="3" fill="#D97706" stroke="#1C1610" strokeWidth="2" />
              <line x1="-6" y1="-8" x2="-6" y2="7" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="6" y1="-8" x2="6" y2="7" stroke="#FEF3C7" strokeWidth="1.2" strokeDasharray="2 2" />
            </g>
            {/* White flour dusting on thigh */}
            <ellipse cx="14" cy="40" rx="10" ry="16" fill="#FFFFFF" opacity="0.45" />
          </g>

          {/* 3. SHOULDER STICK & POLKA-DOT BINDLE (uzlík na holi) */}
          <g id="shoulder-stick-group" transform={`translate(240, 205) rotate(${bindleAngle})`}>
            {/* Wooden Branch Stick */}
            <path
              d="M -115,22 C -60,0 60,-15 110,-28"
              fill="none"
              stroke="#78350F"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M -115,22 C -60,0 60,-15 110,-28"
              fill="none"
              stroke="#B45309"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Red & White Polka-Dot Bindle (Ranec / Mošna) */}
            <g transform={`translate(-85, 30) translate(0, ${bindleSagY})`}>
              {/* Knot on Stick */}
              <ellipse cx="0" cy="-14" rx="10" ry="8" fill="#B91C1C" stroke="#1C1610" strokeWidth="3" />
              <path d="M -8,-16 C -14,-26 -4,-28 0,-18 C 4,-28 14,-26 8,-16 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2.5" />

              {/* Main Swollen Pouch */}
              <ellipse
                cx="0"
                cy="18"
                rx="34"
                ry="30"
                fill="url(#krajanekPolkaDot)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
              />

              {/* Wooden Spoon & Loaf Crust Sticking Out of Bindle */}
              <g transform="translate(-14, -8) rotate(-24)">
                {/* Spoon Handle */}
                <rect x="-2" y="-22" width="4" height="22" rx="2" fill="#D97706" stroke="#1C1610" strokeWidth="1.5" />
                <ellipse cx="0" cy="-24" rx="6" ry="8" fill="#F59E0B" stroke="#1C1610" strokeWidth="1.5" />
              </g>
              <g transform="translate(15, -4) rotate(20)">
                {/* Bread Crust */}
                <path d="M 0,-14 C 8,-18 16,-12 18,-4 C 12,-2 4,2 0,-14 Z" fill="#92400E" stroke="#1C1610" strokeWidth="2" />
              </g>

              {/* Bindle Fabric Crease Lines */}
              <path d="M -18,12 C -8,28 12,28 22,14" fill="none" stroke="#991B1B" strokeWidth="3" />
              <path d="M -12,3 C -4,15 10,16 16,5" fill="none" stroke="#991B1B" strokeWidth="2.5" />
            </g>
          </g>

          {/* 4. LINEN SHIRT & CORDUROY VEST */}
          <g id="krajanek-torso" transform="translate(240, 260)">
            {/* White Peasant Linen Shirt Sleeves */}
            <path
              d="M -56,-30 C -75,0 -70,30 -58,40 C -50,42 -42,30 -44,12 L -42,-18 Z"
              fill="#F8FAFC"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            <path
              d="M 44,-18 L 42,12 C 40,30 48,42 56,40 C 68,30 73,0 54,-30 Z"
              fill="#F8FAFC"
              stroke="#1C1610"
              strokeWidth="3.5"
            />

            {/* Vest Body */}
            <path
              d="M -44,-32 C -46,20 -44,55 -38,62 C -18,66 18,66 38,62 C 44,55 46,20 44,-32 C 24,-24 -24,-24 -44,-32 Z"
              fill="url(#krajanekVestGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
              strokeLinejoin="round"
            />

            {/* Open Linen Collar / Lapels */}
            <path d="M -30,-30 L 0,8 L -16,-30 Z" fill="#F1F5F9" stroke="#1C1610" strokeWidth="2.8" />
            <path d="M 30,-30 L 0,8 L 16,-30 Z" fill="#F1F5F9" stroke="#1C1610" strokeWidth="2.8" />

            {/* Red & White Spotted Neckerchief Knot */}
            <g transform="translate(0, -22)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="#DC2626" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="-3" cy="-1" r="1.8" fill="#FFFFFF" />
              <circle cx="3" cy="1" r="1.8" fill="#FFFFFF" />
              {/* Neckerchief Tails */}
              <path d="M -4,5 L -10,18 L -1,14 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2" />
              <path d="M 4,5 L 10,18 L 1,14 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Brass Horn Buttons on Vest */}
            {[0, 18, 36].map((by) => (
              <circle key={by} cx="0" cy={by} r="4.5" fill="#FACC15" stroke="#1C1610" strokeWidth="2" />
            ))}

            {/* White Flour Smudge on Vest */}
            <ellipse cx="-20" cy="22" rx="12" ry="8" fill="#FFFFFF" opacity="0.4" />
          </g>

          {/* 5. STONECRAFT HAMMER IN HAND (kamenické kladívko / pemrlice) */}
          <g id="krajanek-hammer-arm" transform={`translate(285, 255) rotate(${hammerAngle})`}>
            {/* Forearm & Linen Sleeve */}
            <path
              d="M 0,0 C 8,14 16,28 22,42 C 26,40 28,34 26,28 C 20,16 12,4 0,0 Z"
              fill="#F8FAFC"
              stroke="#1C1610"
              strokeWidth="3.2"
            />
            {/* Clenched Hand */}
            <circle cx="24" cy="40" r="9" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />

            {/* Wooden Hammer Handle */}
            <rect
              x="18"
              y="10"
              width="8"
              height="65"
              rx="3"
              fill="#B45309"
              stroke="#1C1610"
              strokeWidth="2.8"
            />

            {/* Forged Iron Pick / Millstone Dressing Head */}
            <g transform="translate(22, 14)">
              {/* Double-headed pick */}
              <path
                d="M -22,-6 L 22,-6 L 26,0 L 22,6 L -22,6 L -26,0 Z"
                fill="url(#ironHammerGrad)"
                stroke="#1C1610"
                strokeWidth="3.2"
              />
              <rect x="-8" y="-9" width="16" height="18" rx="2" fill="#64748B" stroke="#1C1610" strokeWidth="2" />
            </g>
          </g>

          {/* 6. HEAD, EXPRESSION & FLOUR-DUSTED CAP */}
          <g id="krajanek-head" transform={`translate(240, 165)`}>
            {/* Neck */}
            <rect x="-14" y="32" width="28" height="24" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="3" />

            {/* Cheerful Round Face */}
            <ellipse
              cx="0"
              cy="12"
              rx="34"
              ry="38"
              fill="url(#krajanekSkinGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.5' : '3.5'}
            />

            {/* Rosy Cheeks */}
            <circle cx="-20" cy="18" r="9" fill="#F87171" opacity="0.45" />
            <circle cx="20" cy="18" r="9" fill="#F87171" opacity="0.45" />

            {/* White Flour Dusting on Cheeks */}
            <ellipse cx="-16" cy="12" rx="7" ry="5" fill="#FFFFFF" opacity="0.5" />
            <ellipse cx="18" cy="14" rx="6" ry="4" fill="#FFFFFF" opacity="0.5" />

            {/* Rounded Nose with cute highlight */}
            <circle cx="0" cy="14" r="8.5" fill="#FB923C" stroke="#1C1610" strokeWidth="2.8" />
            <circle cx="-2" cy="12" r="3" fill="#FED7AA" />

            {/* Friendly Ears with Earlobes */}
            <g transform="translate(-34, 12)">
              <ellipse cx="0" cy="0" rx="6" ry="11" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
              <path d="M 0,-4 C 3,-2 3,2 0,4" fill="none" stroke="#EA580C" strokeWidth="2" />
            </g>
            <g transform="translate(34, 12)">
              <ellipse cx="0" cy="0" rx="6" ry="11" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
              <path d="M 0,-4 C -3,-2 -3,2 0,4" fill="none" stroke="#EA580C" strokeWidth="2" />
            </g>

            {/* Big Friendly Eyes with Pupil Tracking */}
            <g transform="translate(-14, 0)">
              <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx={gazeX} cy={gazeY} r="4.2" fill="#451A03" />
              <circle cx={gazeX - 1.5} cy={gazeY - 1.5} r="1.5" fill="#FFFFFF" />
            </g>
            <g transform="translate(14, 0)">
              <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx={gazeX} cy={gazeY} r="4.2" fill="#451A03" />
              <circle cx={gazeX - 1.5} cy={gazeY - 1.5} r="1.5" fill="#FFFFFF" />
            </g>

            {/* Cheerful Eyebrows */}
            <path
              d={isReact ? "M -22,-14 C -16,-18 -8,-14 -6,-10" : "M -22,-10 C -16,-16 -8,-14 -6,-10"}
              fill="none"
              stroke="#78350F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d={isReact ? "M 6,-10 C 8,-14 16,-18 22,-14" : "M 6,-10 C 8,-14 16,-16 22,-10"}
              fill="none"
              stroke="#78350F"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Jovial Smile / Expression */}
            {isReact || isFleeing ? (
              /* Startled / Panic Open Mouth */
              <ellipse cx="0" cy="28" rx="10" ry="12" fill="#7F1D1D" stroke="#1C1610" strokeWidth="3" />
            ) : isAction ? (
              /* Determined Battle Shout */
              <g transform="translate(0, 26)">
                <path d="M -16,-4 C -10,14 10,14 16,-4 Z" fill="#991B1B" stroke="#1C1610" strokeWidth="3" />
                <path d="M -12,-3 C -6,2 6,2 12,-3" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />
              </g>
            ) : (
              /* Broad Warm Folk Smile */
              <g transform="translate(0, 24)">
                <path d="M -18,-2 C -10,12 10,12 18,-2" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                {/* Dimples */}
                <path d="M -20,-4 C -22,-2 -20,2 -18,2" fill="none" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 20,-4 C 22,-2 20,2 18,2" fill="none" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            )}

            {/* 7. FLOPPY PEAKED MILLER'S CAP WITH WHEAT EAR */}
            <g id="krajanek-cap" transform="translate(0, -22)">
              {/* Dark Cap Brim */}
              <ellipse cx="0" cy="0" rx="42" ry="12" fill="#292524" stroke="#1C1610" strokeWidth="3.8" />
              <rect x="-38" y="-7" width="76" height="12" fill="#44403C" />

              {/* Crumpled Crown of the Cap */}
              <path
                d="M -38,-4 C -44,-36 -20,-56 8,-54 C 36,-52 46,-32 38,-4 Z"
                fill="url(#krajanekCapGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />

              {/* White Flour Dusting on Cap Peak */}
              <ellipse cx="-8" cy="-42" rx="18" ry="10" fill="#FFFFFF" opacity="0.45" />

              {/* Red Ribbon Band */}
              <path d="M -38,-2 C -20,4 20,4 38,-2 L 37,3 C 20,9 -20,9 -37,3 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2.2" />

              {/* GOLDEN EAR OF WHEAT (Klas pšenice / ječmene) */}
              <g transform={`translate(-28, -6) rotate(${wheatWave})`}>
                {/* Wheat Stem */}
                <path d="M 0,0 C -6,-22 -14,-45 -22,-68" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                {/* Wheat Grains / Spikelets */}
                {[-15, -28, -42, -55, -66].map((gy, idx) => (
                  <g key={idx} transform={`translate(${gy * 0.3}, ${gy})`}>
                    <ellipse cx="-4" cy="0" rx="3.5" ry="6" transform="rotate(-35)" fill="url(#wheatSpikeGrad)" stroke="#78350F" strokeWidth="1.2" />
                    <ellipse cx="4" cy="0" rx="3.5" ry="6" transform="rotate(35)" fill="url(#wheatSpikeGrad)" stroke="#78350F" strokeWidth="1.2" />
                    {/* Awn / Beard Hair */}
                    <line x1="-5" y1="-3" x2="-14" y2="-12" stroke="#B45309" strokeWidth="1.2" />
                    <line x1="5" y1="-3" x2="14" y2="-12" stroke="#B45309" strokeWidth="1.2" />
                  </g>
                ))}
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
