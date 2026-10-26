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

        {/* Alpine Green Felt Hat */}
        <linearGradient id="krajanekCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F7A35" />
          <stop offset="50%" stopColor="#2D5A27" />
          <stop offset="100%" stopColor="#1B3817" />
        </linearGradient>

        {/* Royal Blue Folk Vest (Kordulka) with piping */}
        <linearGradient id="krajanekVestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="80%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Golden-Yellow Peasant Breeches */}
        <linearGradient id="krajanekPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="80%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
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

        {/* Blue and White Striped Stockings Pattern */}
        <pattern id="krajanekStripedSocks" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="8" fill="#FFFFFF" />
          <rect x="4" width="4" height="8" fill="#2563EB" />
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
        {/* KRAJÁNEK ROOT WITH KINEMATICS                           */}
        {/* ======================================================== */}
        <g id="krajanek-body" transform={isAction ? 'translate(0, 0)' : `translate(0, ${bobY}) rotate(${bodyLean}, 240, 290)`}>
          {/* 1. ARTICULATED FEET & STRIPED STOCKINGS & BUCKLED SHOES */}
          {!isAction && (
            <g id="krajanek-shoes" transform="translate(240, 395)">
              {/* Left Leg: Blue-White Striped Stocking & Shoe */}
              <g
                id="krajanek-left-boot"
                transform={`translate(${leftShoeX}, ${leftShoeY}) rotate(${leftShoeRot})`}
              >
                {/* Striped Stocking */}
                <path
                  d="M -10,-24 L 10,-24 L 8,4 L -8,4 Z"
                  fill="url(#krajanekStripedSocks)"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
                {/* Black Leather Shoe with Heel & Brass Buckle */}
                <path
                  d="M -16,-2 L -8,-2 L 6,10 L 22,10 C 28,10 30,16 26,21 C 18,25 -16,25 -22,21 C -24,16 -20,-2 -16,-2 Z"
                  fill="#1E293B"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? '4.5' : '3.5'}
                  strokeLinejoin="round"
                />
                {/* Thick Sole */}
                <path d="M -22,21 C -16,25 18,25 26,21 L 24,25 C 16,28 -16,28 -22,25 Z" fill="#0F172A" stroke="#1C1610" strokeWidth="2" />
                {/* Boot Brass Buckle */}
                <rect x="2" y="8" width="10" height="8" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.6" />
                <rect x="5" y="10" width="4" height="4" fill="#0F172A" />
              </g>

              {/* Right Leg: Blue-White Striped Stocking & Shoe */}
              <g
                id="krajanek-right-boot"
                transform={`translate(${rightShoeX}, ${rightShoeY}) rotate(${rightShoeRot})`}
              >
                <path
                  d="M -10,-24 L 10,-24 L 8,4 L -8,4 Z"
                  fill="url(#krajanekStripedSocks)"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
                <path
                  d="M -16,-2 L -8,-2 L 6,10 L 22,10 C 28,10 30,16 26,21 C 18,25 -16,25 -22,21 C -24,16 -20,-2 -16,-2 Z"
                  fill="#1E293B"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? '4.5' : '3.5'}
                  strokeLinejoin="round"
                />
                <path d="M -22,21 C -16,25 18,25 26,21 L 24,25 C 16,28 -16,28 -22,25 Z" fill="#0F172A" stroke="#1C1610" strokeWidth="2" />
                <rect x="2" y="8" width="10" height="8" rx="2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.6" />
                <rect x="5" y="10" width="4" height="4" fill="#0F172A" />
              </g>
            </g>
          )}

          {/* Action-specific Crouched Stance on Millstone */}
          {isAction && (
            <g id="krajanek-action-feet" transform="translate(240, 390)">
              <g transform="translate(-32, 10) rotate(-12)">
                <path
                  d="M -10,-22 L 10,-22 L 8,2 L -8,2 Z"
                  fill="url(#krajanekStripedSocks)"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
                <path
                  d="M -14,-4 L 8,6 L 22,6 C 28,6 30,14 26,18 C 16,22 -14,22 -20,18 Z"
                  fill="#1E293B"
                  stroke="#1C1610"
                  strokeWidth="3.5"
                />
              </g>
              <g transform="translate(34, 12) rotate(16)">
                <path
                  d="M -10,-22 L 10,-22 L 8,2 L -8,2 Z"
                  fill="url(#krajanekStripedSocks)"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
                <path
                  d="M -14,-4 L 8,6 L 22,6 C 28,6 30,14 26,18 C 16,22 -14,22 -20,18 Z"
                  fill="#1E293B"
                  stroke="#1C1610"
                  strokeWidth="3.5"
                />
              </g>
            </g>
          )}

          {/* 2. GOLDEN YELLOW PEASANT BREECHES WITH KNEE PATCH */}
          <g id="krajanek-trousers" transform="translate(240, 320)">
            <path
              d="M -40,-12 C -46,30 -48,68 -32,84 C -22,86 -14,75 -6,45 C 2,75 8,86 18,84 C 34,68 32,30 28,-12 Z"
              fill="url(#krajanekPantsGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.8' : '3.8'}
              strokeLinejoin="round"
            />
            {/* Gathers at knees */}
            <path d="M -38,72 C -32,76 -24,76 -18,72" fill="none" stroke="#CA8A04" strokeWidth="2.5" />
            <path d="M 6,72 C 12,76 20,76 26,72" fill="none" stroke="#CA8A04" strokeWidth="2.5" />
            {/* Stitched Brown Knee Patch on Right Thigh */}
            <g transform="translate(-24, 38) rotate(-6)">
              <rect x="-9" y="-9" width="18" height="18" rx="2" fill="#92400E" stroke="#1C1610" strokeWidth="2.2" />
              <line x1="-7" y1="-7" x2="-7" y2="7" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="7" y1="-7" x2="7" y2="7" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="-7" y1="-7" x2="7" y2="-7" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="-7" y1="7" x2="7" y2="7" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
            {/* White flour dusting on thigh */}
            <ellipse cx="14" cy="40" rx="9" ry="14" fill="#FFFFFF" opacity="0.4" />
          </g>

          {/* 3. SHOULDER STICK & RED POLKA-DOT BINDLE (uzlík na holi) */}
          <g id="shoulder-stick-group" transform={`translate(240, 205) rotate(${bindleAngle})`}>
            {/* Carved Wooden Branch Stick */}
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
              stroke="#D97706"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Red & White Polka-Dot Bindle (Ranec na holi dle předlohy) */}
            <g transform={`translate(-85, 30) translate(0, ${bindleSagY})`}>
              {/* Tied knot ears on stick */}
              <ellipse cx="0" cy="-14" rx="10" ry="8" fill="#B91C1C" stroke="#1C1610" strokeWidth="3" />
              <path d="M -8,-16 C -15,-28 -4,-30 0,-18 C 4,-30 15,-28 8,-16 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2.5" />

              {/* Main Swollen Polka-Dot Pouch */}
              <ellipse
                cx="0"
                cy="18"
                rx="35"
                ry="32"
                fill="url(#krajanekPolkaDot)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.8' : '3.8'}
              />

              {/* Bindle fabric crease lines */}
              <path d="M -18,12 C -8,28 12,28 22,14" fill="none" stroke="#991B1B" strokeWidth="3" />
              <path d="M -12,3 C -4,15 10,16 16,5" fill="none" stroke="#991B1B" strokeWidth="2.5" />
            </g>
          </g>

          {/* 4. PEASANT LINEN SHIRT & ROYAL BLUE FOLK VEST WITH BRASS BUTTONS */}
          <g id="krajanek-torso" transform="translate(240, 255)">
            {/* Puffy White Peasant Linen Shirt Sleeves */}
            <path
              d="M -56,-32 C -78,0 -74,32 -60,42 C -52,44 -44,32 -46,14 L -44,-20 Z"
              fill="#FFFFFF"
              stroke="#1C1610"
              strokeWidth="3.6"
            />
            <path
              d="M 44,-20 L 44,14 C 42,32 50,44 58,42 C 72,32 76,0 54,-32 Z"
              fill="#FFFFFF"
              stroke="#1C1610"
              strokeWidth="3.6"
            />
            {/* Sleeve Crease Lines */}
            <path d="M -64,15 Q -54,20 -48,15" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            <path d="M 48,15 Q 54,20 64,15" stroke="#CBD5E1" strokeWidth="2" fill="none" />

            {/* Royal Blue Folk Vest (Kordulka) Body */}
            <path
              d="M -44,-32 C -46,20 -44,58 -38,65 C -18,70 18,70 38,65 C 44,58 46,20 44,-32 C 24,-24 -24,-24 -44,-32 Z"
              fill="url(#krajanekVestGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.8' : '3.8'}
              strokeLinejoin="round"
            />

            {/* Green and Gold Trim Piping on Vest */}
            <path
              d="M -40,-30 C -42,18 -40,54 -34,60 C -16,64 16,64 34,60 C 40,54 42,18 40,-30"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
            />

            {/* Open Linen Shirt Center */}
            <path d="M -18,-30 L 0,25 L 18,-30 Z" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2.5" />
            <line x1="0" y1="-20" x2="0" y2="25" stroke="#CBD5E1" strokeWidth="2" />

            {/* Two Rows of Golden Brass Ball Buttons (Signature 6 buttons) */}
            {[-12, 6, 24].map((by) => (
              <g key={by}>
                {/* Left Row */}
                <circle cx="-16" cy={by} r="4.5" fill="#FDE047" stroke="#1C1610" strokeWidth="1.8" />
                <circle cx="-17" cy={by - 1} r="1.5" fill="#FFFFFF" />
                {/* Right Row */}
                <circle cx="16" cy={by} r="4.5" fill="#FDE047" stroke="#1C1610" strokeWidth="1.8" />
                <circle cx="15" cy={by - 1} r="1.5" fill="#FFFFFF" />
              </g>
            ))}

            {/* RED & WHITE POLKA-DOT NECKERCHIEF (KRAJÁNKŮV ČERVENÝ ŠÁTEK S BÍLÝMI PUNTÍKY) */}
            <g transform="translate(0, -26)">
              {/* Scarf draped collar */}
              <path
                d="M -26,-6 C -14,14 14,14 26,-6 C 18,-10 -18,-10 -26,-6 Z"
                fill="url(#krajanekPolkaDot)"
                stroke="#1C1610"
                strokeWidth="2.8"
              />
              {/* Tied Neckerchief Knot and Flapping Ends */}
              <ellipse cx="0" cy="4" rx="7" ry="5.5" fill="#DC2626" stroke="#1C1610" strokeWidth="2.2" />
              <circle cx="0" cy="4" r="2" fill="#FFFFFF" />
              <path d="M -4,7 C -10,18 -16,24 -12,28 C -6,26 -2,16 -2,8 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2" />
              <circle cx="-8" cy="18" r="1.8" fill="#FFFFFF" />
              <path d="M 4,7 C 10,18 16,24 12,28 C 6,26 2,16 2,8 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2" />
              <circle cx="8" cy="18" r="1.8" fill="#FFFFFF" />
            </g>
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
              <path
                d="M -22,-6 L 22,-6 L 26,0 L 22,6 L -22,6 L -26,0 Z"
                fill="url(#ironHammerGrad)"
                stroke="#1C1610"
                strokeWidth="3.2"
              />
              <rect x="-8" y="-9" width="16" height="18" rx="2" fill="#64748B" stroke="#1C1610" strokeWidth="2" />
            </g>
          </g>

          {/* 6. HEAD, CHEERFUL WINKING EXPRESSION, CURLY HAIR & GREEN FELT HAT */}
          <g id="krajanek-head" transform="translate(240, 160)">
            {/* Neck */}
            <rect x="-14" y="32" width="28" height="24" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="3" />

            {/* Curly Brown Hair Background */}
            <g transform="translate(0, -6)">
              <circle cx="-32" cy="10" r="14" fill="#78350F" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="32" cy="10" r="14" fill="#78350F" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="-28" cy="22" r="11" fill="#78350F" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="28" cy="22" r="11" fill="#78350F" stroke="#1C1610" strokeWidth="2.5" />
            </g>

            {/* Round Jovial Head Base */}
            <ellipse
              cx="0"
              cy="12"
              rx="35"
              ry="37"
              fill="url(#krajanekSkinGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '4.8' : '3.8'}
            />

            {/* Rosy Round Cheeks */}
            <circle cx="-20" cy="16" r="12" fill="#F87171" opacity="0.6" />
            <circle cx="20" cy="16" r="12" fill="#F87171" opacity="0.6" />

            {/* Bulbous Red Nose */}
            <circle cx="0" cy="13" r="9.5" fill="#EF4444" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-3" cy="10" r="3.2" fill="#FED7AA" />

            {/* Round Ears */}
            <ellipse cx="-35" cy="12" rx="7" ry="11" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
            <ellipse cx="35" cy="12" rx="7" ry="11" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.8" />

            {/* EYES: CHARMING WINK (Right eye winking shut playfully in a happy arch, Left eye wide open and laughing) */}
            {isReact || isFleeing ? (
              // Startled open eyes
              <>
                <g transform="translate(-14, 0)">
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx={gazeX} cy={gazeY} r="3.5" fill="#451A03" />
                </g>
                <g transform="translate(14, 0)">
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx={gazeX} cy={gazeY} r="3.5" fill="#451A03" />
                </g>
              </>
            ) : (
              // Signature Josef Lada Winking Expression from Image 3
              <>
                {/* Left eye winking shut in a joyful curved line */}
                <g transform="translate(-15, 0)">
                  <path d="M -8,4 Q 0,-6 8,4" fill="none" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" />
                  <line x1="-5" y1="2" x2="-8" y2="6" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="5" y1="2" x2="8" y2="6" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" />
                </g>
                {/* Right eye wide open, merry and sparkling */}
                <g transform="translate(15, 0)">
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx={gazeX} cy={gazeY} r="4.5" fill="#451A03" />
                  <circle cx={gazeX - 1.5} cy={gazeY - 1.5} r="1.8" fill="#FFFFFF" />
                </g>
              </>
            )}

            {/* Cheerful Eyebrows */}
            <path d="M -22,-10 Q -15,-17 -7,-11" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 7,-11 Q 15,-17 22,-10" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />

            {/* BROAD JOYFUL LAUGHING MOUTH WITH TONGUE & WHITE TEETH */}
            {isReact || isFleeing ? (
              <ellipse cx="0" cy="27" rx="10" ry="12" fill="#7F1D1D" stroke="#1C1610" strokeWidth="3" />
            ) : (
              <g transform="translate(0, 24)">
                {/* Deep open mouth */}
                <path d="M -18,-2 C -12,20 12,20 18,-2 Z" fill="#881337" stroke="#1C1610" strokeWidth="3.2" />
                {/* White upper teeth */}
                <path d="M -13,0 Q 0,4 13,0" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
                {/* Pink tongue */}
                <path d="M -8,11 Q 0,4 8,11 C 6,17 -6,17 -8,11 Z" fill="#F43F5E" />
              </g>
            )}

            {/* Hand Tipping Hat (as shown in reference image) */}
            <g transform="translate(-36, -18) rotate(-15)">
              {/* Linen sleeve */}
              <path d="M 0,22 Q -8,10 -2,0 L 10,4 Q 8,18 2,24 Z" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2.8" />
              {/* Cheerful hand tipping hat brim */}
              <circle cx="6" cy="-2" r="7" fill="url(#krajanekSkinGrad)" stroke="#1C1610" strokeWidth="2.4" />
              <path d="M 2,-6 Q 8,-8 12,-4" stroke="#1C1610" strokeWidth="2" fill="none" />
            </g>

            {/* 7. ALPINE GREEN PEAKED FELT HAT WITH PLUME & HEATHER */}
            <g id="krajanek-cap" transform="translate(0, -22)">
              {/* Curled Hat Brim */}
              <ellipse cx="0" cy="0" rx="46" ry="14" fill="#1B3817" stroke="#1C1610" strokeWidth="4" />
              <rect x="-42" y="-7" width="84" height="14" fill="#2D5A27" />

              {/* Peaked Crown of Alpine Green Hat */}
              <path
                d="M -42,-4 C -45,-38 -15,-66 12,-62 C 40,-58 48,-35 42,-4 Z"
                fill="url(#krajanekCapGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.8' : '3.8'}
                strokeLinejoin="round"
              />

              {/* Dark Green Ribbon Band */}
              <path d="M -42,-2 C -20,5 20,5 42,-2 L 41,3 C 20,10 -20,10 -41,3 Z" fill="#14532D" stroke="#1C1610" strokeWidth="2.5" />

              {/* WHITE AND CYAN FEATHER PLUME (PÉRO ZA KLOBOUKEM) */}
              <g transform="translate(4, -12) rotate(14)">
                {/* Blue feather back */}
                <path d="M 0,0 C -6,-28 14,-56 18,-65 C 10,-48 4,-24 0,0 Z" fill="#38BDF8" stroke="#1C1610" strokeWidth="1.8" />
                {/* White feather front */}
                <path d="M -2,0 C -12,-32 4,-62 14,-72 C 8,-50 -2,-26 -2,0 Z" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2" />
                <line x1="-2" y1="0" x2="12" y2="-70" stroke="#0284C7" strokeWidth="1.5" />
              </g>

              {/* PURPLE HEATHER / LAVENDER SPRIG (Snítka vřesu za kloboukem) */}
              <g transform="translate(14, -8) rotate(22)">
                <line x1="0" y1="0" x2="6" y2="-45" stroke="#166534" strokeWidth="2" />
                {[-12, -22, -32, -42].map((fy) => (
                  <g key={fy}>
                    <circle cx="3" cy={fy} r="2.8" fill="#A855F7" stroke="#581C87" strokeWidth="1" />
                    <circle cx="8" cy={fy - 3} r="2.5" fill="#C084FC" stroke="#581C87" strokeWidth="1" />
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
