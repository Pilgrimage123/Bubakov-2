import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartPasacekSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech folklore illustration of the nimble barefoot Shepherd Boy (Pasáček)
 *
 * Visual fidelity details matching the reference art:
 * - Wild, messy, tousled spiky brown hair with a barred eagle/hawk feather tucked behind right ear
 * - Expressive wide curious eyes, rosy red cheeks, cute upturned nose & open mouth
 * - Bright red neckerchief tied with fluttering knot ends
 * - Peasant linen shirt with rolled-up sleeves & open collar
 * - Vivid royal-blue folk vest (kordulka) with golden brass ball buttons, red piping & folk embroidery on hem
 * - Khaki-brown trousers with rustic belt and colorful stitched patches (red hip patch, red cross-stitched thigh patch, blue shin patch, ragged frayed ankles)
 * - Bare feet with defined toes bounding across the pasture
 * - Carved 6-hole wooden shepherd's flute (pastýřská píšťalka) held aloft
 * - Interactive cursor tracking and musical notes particle playback during flute play (action state)
 */
export const SmartPasacekSvg: React.FC<SmartCharacterProps> = ({
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

  // Kinematic parameters
  const runSpeed = isFleeing ? 18.5 : isSprinting ? 14.5 : isAction ? 12 : isWalking ? 9.5 : isReact ? 22 : 2.5;
  const runSin = Math.sin(t * runSpeed);
  const runCos = Math.cos(t * runSpeed);

  // High-spirited barefoot running / sprinting / fleeing stride (legs ONLY swing when actively moving)
  const backLegAngle = isMoving
    ? runSin * (isFleeing ? 52 : isSprinting ? 46 : 34)
    : isAction
    ? -16
    : isReact
    ? -20
    : -8;
  const frontLegAngle = isMoving
    ? -runSin * (isFleeing ? 52 : isSprinting ? 46 : 34)
    : isAction
    ? 16
    : isReact
    ? 22
    : 8;

  // Energetic bouncy bobbing, startle recoil jolt, and sprint/flee forward lean
  const bobY = isFleeing
    ? -Math.abs(runSin) * 20
    : isSprinting
    ? -Math.abs(runSin) * 16
    : isWalking
    ? -Math.abs(runSin) * 11
    : isAction
    ? -Math.abs(Math.sin(t * 14)) * 14
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 14 - 6
    : Math.sin(t * 3) * 3;
  const leanAngle = isFleeing
    ? 18 + runSin * 6
    : isSprinting
    ? 15 + runSin * 4.5
    : isWalking
    ? 9 + runSin * 3.5
    : isAction
    ? 5 + Math.sin(t * 10) * 3
    : isReact
    ? -16 + Math.sin(t * 26) * 4.5
    : 2;

  // Arm swings (normal pump vs startled recoil vs frantic overhead flailing in flee)
  const rightArmAngle = isFleeing
    ? -118 + Math.sin(t * 20) * 30
    : isSprinting
    ? -runCos * 42
    : isWalking
    ? -runCos * 28
    : isReact
    ? 52 + Math.sin(t * 24) * 14
    : isAction
    ? -15
    : -6;
  // Flute hand: raised high, brought to mouth in action, jolted back in react, or flailing in flee
  const fluteArmAngle = isFleeing
    ? -68 + Math.cos(t * 20) * 28
    : isReact
    ? -54 + Math.cos(t * 24) * 14
    : isAction
    ? -45 + Math.sin(t * 12) * 6
    : isSprinting
    ? 22 + runCos * 32
    : isWalking
    ? 15 + runCos * 20
    : pointer.isHovered
    ? pointer.y * 15
    : Math.sin(t * 2) * 5;

  // Fluttering neckerchief ends and spiky hair / feather sway
  const scarfFlutter = isFleeing
    ? -25 + Math.sin(t * 26) * 24
    : isSprinting
    ? -18 + Math.sin(t * 20) * 20
    : isReact
    ? 18 + Math.sin(t * 28) * 14
    : Math.sin(t * (isWalking ? 16 : 4)) * (isWalking ? 15 : 4);
  const featherSway = isFleeing
    ? -18 + Math.sin(t * 24) * 16
    : isReact
    ? 24 + Math.sin(t * 28) * 12
    : isSprinting
    ? -12 + Math.sin(t * 18) * 12
    : Math.sin(t * (isWalking ? 14 : 3)) * (isWalking ? 8 : 3);
  const hairJoltY = isReact ? -5 - Math.abs(Math.sin(t * 24)) * 4 : isFleeing ? -3 : 0;

  // Musical notes emitting when playing flute in action state
  const musicNotes = [
    { x: 335 + Math.sin(t * 8 + 1) * 20, y: 130 - ((t * 90) % 120), char: '♪', op: 0.9, scale: 1.2 },
    { x: 360 + Math.cos(t * 7 + 2) * 25, y: 110 - ((t * 85 + 40) % 120), char: '♫', op: 0.85, scale: 1.4 },
    { x: 320 + Math.sin(t * 9 + 3) * 22, y: 150 - ((t * 95 + 80) % 120), char: '♬', op: 0.75, scale: 1.1 },
  ];

  // Sweat droplets & startle marks for react (hit by bubák) and flee (zero courage)
  const sweatDrops = [
    { x: 165 - ((t * 110) % 45), y: 78 + ((t * 85) % 40), r: 4.2 },
    { x: 248 + ((t * 105 + 15) % 45), y: 72 + ((t * 90 + 10) % 45), r: 3.8 },
    { x: 155 - ((t * 125 + 25) % 50), y: 95 + ((t * 75 + 20) % 40), r: 3.5 },
  ];

  // Head and curious eyes tracking
  const lookX = isReact ? -2 + Math.sin(t * 30) * 1.5 : isFleeing ? 3 : pointer.isHovered ? pointer.x * 6 : Math.sin(t * 1.8) * 2;
  const lookY = isReact ? -2 : isFleeing ? -1 : pointer.isHovered ? pointer.y * 5 : 0;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 450 480"
      width={size}
      height={size}
      className={`smart-pasacek-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Pasáček s píšťalkou"
    >
      <defs>
        {/* Skin Tone Gradient */}
        <radialGradient id="paSkin" cx="42%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF4ED" />
          <stop offset="55%" stopColor="#FED7AA" />
          <stop offset="85%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#FB923C" />
        </radialGradient>

        {/* Brown Tousled Hair Gradient */}
        <linearGradient id="paHairBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#854D0E" />
          <stop offset="35%" stopColor="#713F12" />
          <stop offset="75%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#2A1002" />
        </linearGradient>

        {/* Peasant Linen Shirt Cream */}
        <linearGradient id="paLinenShirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>

        {/* Folk Royal Blue Vest (Kordulka) */}
        <linearGradient id="paVestBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="80%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Bright Scarlet Red Bandana / Neckerchief */}
        <linearGradient id="paScarletRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Olive-Khaki Trousers */}
        <linearGradient id="paKhakiPants" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="45%" stopColor="#854D0E" />
          <stop offset="85%" stopColor="#654012" />
          <stop offset="100%" stopColor="#452B09" />
        </linearGradient>

        {/* Wooden Flute Grain */}
        <linearGradient id="paFluteWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="45%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Golden Buttons & Embroidery */}
        <linearGradient id="paGoldDecor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="paPaperDrop" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="2" dy="4" stdDeviation="3.5" floodColor="#1C1610" floodOpacity="0.2" />
        </filter>
      </defs>

      <g
        transform={`translate(225, 240) scale(${direction}, 1) translate(-225, -240)`}
        filter="url(#paPaperDrop)"
      >
        {/* GROUND RUNNING SHADOW */}
        {showShadow && (
          <ellipse
            cx={220}
            cy={448}
            rx={92 + (isWalking ? Math.sin(t * runSpeed) * 8 : 0)}
            ry={16}
            fill="#1E293B"
            opacity="0.22"
          />
        )}

        {/* KINEMATIC BOUNCING TORSO & LEAN */}
        <g id="pa-lean-group" transform={`translate(0, ${bobY}) rotate(${leanAngle}, 210, 290)`}>
          {/* 1. BACK LEG (Trailing bounding leg, barefoot, blue knee patch & ragged cuffs) */}
          <g id="pa-back-leg" transform={`translate(165, 275) rotate(${backLegAngle})`}>
            {/* Trousers Back Thigh & Calf */}
            <path
              d="M -15,-5 C -25,35 -35,75 -42,110 C -48,128 -38,138 -20,135 C -5,132 10,120 12,95 C 15,65 15,30 12,-5 Z"
              fill="url(#paKhakiPants)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Bright Red Patch on Back Hip / Thigh */}
            <g transform="translate(-25, 25) rotate(-8)">
              <polygon points="-12,-10 10,-8 8,14 -14,12" fill="url(#paScarletRed)" stroke="#1C1610" strokeWidth="2" />
              {/* White Stitches */}
              <line x1="-10" y1="-12" x2="-10" y2="-6" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="2" y1="-10" x2="2" y2="-4" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="10" y1="-2" x2="4" y2="-2" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="8" y1="8" x2="2" y2="8" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="-12" y1="4" x2="-6" y2="4" stroke="#FFFFFF" strokeWidth="1.5" />
            </g>

            {/* Vivid Blue Stitched Patch on Shin */}
            <g transform="translate(-32, 92) rotate(6)">
              <polygon points="-8,-8 10,-8 10,10 -8,10" fill="url(#paVestBlue)" stroke="#1C1610" strokeWidth="1.8" />
              <line x1="-6" y1="-10" x2="-6" y2="-6" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="6" y1="-10" x2="6" y2="-6" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="12" y1="-2" x2="8" y2="-2" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="12" y1="6" x2="8" y2="6" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="6" y1="12" x2="6" y2="8" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="-6" y1="12" x2="-6" y2="8" stroke="#FFFFFF" strokeWidth="1.4" />
              <line x1="-10" y1="6" x2="-6" y2="6" stroke="#FFFFFF" strokeWidth="1.4" />
            </g>

            {/* Frayed / Jagged Tattered Hem at Ankle */}
            <polygon
              points="-42,110 -48,125 -38,120 -35,134 -25,124 -18,135 -10,122 -4,130 5,118 10,120 12,95"
              fill="url(#paKhakiPants)"
              stroke="#1C1610"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Back Bare Leg & Expressive Bare Foot with Toes */}
            <g transform="translate(-25, 122)">
              {/* Bare Shin */}
              <path
                d="M -10,0 C -15,18 -18,36 -24,52 C -28,62 -22,70 -12,68 C -4,65 0,55 2,40 C 5,25 2,12 0,0 Z"
                fill="url(#paSkin)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              {/* Back Bare Foot */}
              <g transform="translate(-18, 55)">
                <path
                  d="M -6,-4 C -18,4 -28,15 -25,28 C -22,38 -8,42 12,38 C 24,34 32,24 28,15 C 24,6 8,0 0,-4 Z"
                  fill="url(#paSkin)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.8 : 0}
                />
                {/* Defined Bare Toes */}
                <ellipse cx="28" cy="18" rx="4.5" ry="5.5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.8" />
                <ellipse cx="22" cy="22" rx="4" ry="5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.6" />
                <ellipse cx="16" cy="25" rx="3.5" ry="4.5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.5" />
                <ellipse cx="10" cy="27" rx="3" ry="4" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.4" />
                {/* Arch line */}
                <path d="M -12,24 C 0,26 12,25 22,18" stroke="#FB923C" strokeWidth="1.8" fill="none" />
              </g>
            </g>
          </g>

          {/* 2. FRONT LEG (Forward bounding stride, bare foot, red cross-stitched patch & frayed cuff) */}
          <g id="pa-front-leg" transform={`translate(215, 275) rotate(${frontLegAngle})`}>
            {/* Trousers Front Thigh & Shin */}
            <path
              d="M -12,-5 C -4,35 6,75 22,112 C 30,128 48,124 52,112 C 45,75 30,35 22,-5 Z"
              fill="url(#paKhakiPants)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Bright Red Square Patch on Thigh with Cross-Stitches */}
            <g transform="translate(14, 55) rotate(12)">
              <rect x="-10" y="-10" width="20" height="20" rx="2" fill="url(#paScarletRed)" stroke="#1C1610" strokeWidth="2" />
              {/* White Cross-Stitches in corners & edges */}
              {[-6, 6].map((x) =>
                [-6, 6].map((y) => (
                  <g key={`pa-cross-${x}-${y}`} transform={`translate(${x}, ${y})`}>
                    <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#FFFFFF" strokeWidth="1.4" />
                    <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#FFFFFF" strokeWidth="1.4" />
                  </g>
                ))
              )}
            </g>

            {/* Frayed / Jagged Tattered Hem at Front Ankle */}
            <polygon
              points="15,105 20,122 26,114 32,126 38,115 44,124 50,110 52,112"
              fill="url(#paKhakiPants)"
              stroke="#1C1610"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Front Bare Leg & Bare Foot stepping forward */}
            <g transform="translate(30, 114)">
              {/* Bare Shin */}
              <path
                d="M -5,0 C -2,18 2,36 10,55 C 16,66 28,66 32,54 C 28,36 18,18 10,0 Z"
                fill="url(#paSkin)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              {/* Front Bare Foot with Articulated Toes */}
              <g transform="translate(18, 52)">
                <path
                  d="M -6,-4 C 2,6 12,18 35,22 C 55,25 72,18 78,8 C 72,-2 55,0 42,-4 Z"
                  fill="url(#paSkin)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.8 : 0}
                />
                {/* Defined Bare Toes on front foot */}
                <ellipse cx="76" cy="10" rx="5" ry="6" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.8" />
                <ellipse cx="70" cy="15" rx="4.5" ry="5.5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.6" />
                <ellipse cx="63" cy="18" rx="4" ry="5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.5" />
                <ellipse cx="56" cy="20" rx="3.5" ry="4.5" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.4" />
                <ellipse cx="49" cy="21" rx="3" ry="4" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="1.3" />
                {/* Foot arch line */}
                <path d="M 10,16 C 25,20 45,18 60,10" stroke="#FB923C" strokeWidth="2" fill="none" />
              </g>
            </g>
          </g>

          {/* 3. TORSO, PEASANT LINEN SHIRT & FOLK BLUE VEST (KORDULKA) */}
          <g id="pa-torso" transform="translate(170, 150)">
            {/* White Peasant Linen Shirt Base */}
            <path
              d="M 18,15 C 22,-5 58,-5 62,15 C 70,55 74,95 70,125 C 48,134 28,134 10,125 C 8,95 12,55 18,15 Z"
              fill="url(#paLinenShirt)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Fold wrinkles in peasant shirt */}
            <path d="M 28,45 C 38,55 42,55 52,45" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <path d="M 30,75 C 40,85 45,85 55,75" stroke="#F59E0B" strokeWidth="2" fill="none" />

            {/* Royal Blue Folk Vest (Kordulka) */}
            <path
              d="M 14,28 C 22,12 58,12 66,28 C 72,68 76,108 72,132 C 48,142 28,142 8,132 C 6,108 8,68 14,28 Z"
              fill="url(#paVestBlue)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.4 : 0}
            />

            {/* Red Accent Piping along Vest Edges & Armholes */}
            <path d="M 14,28 C 22,14 36,14 40,28 L 40,136" stroke="url(#paScarletRed)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 66,28 C 58,14 44,14 40,28" stroke="url(#paScarletRed)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 8,132 C 28,142 48,142 72,132" stroke="url(#paScarletRed)" strokeWidth="3.2" fill="none" />

            {/* Delicate Folk Embroidery along Hem (Golden Scallops & Red Dots) */}
            <g id="pa-vest-embroidery" transform="translate(12, 122)">
              <path
                d="M 2,4 Q 8,-2 14,4 Q 20,-2 26,4 Q 32,-2 38,4 Q 44,-2 50,4"
                stroke="url(#paGoldDecor)"
                strokeWidth="2.2"
                fill="none"
              />
              {[8, 20, 32, 44].map((ex) => (
                <circle key={`emb-dot-${ex}`} cx={ex} cy="1" r="1.8" fill="#EF4444" stroke="#1C1610" strokeWidth="0.8" />
              ))}
            </g>

            {/* Golden Ball Buttons down the front of Vest */}
            {[42, 60, 78, 96, 114].map((by) => (
              <circle
                key={`pa-btn-${by}`}
                cx="38"
                cy={by}
                r="3.2"
                fill="url(#paGoldDecor)"
                stroke="#1C1610"
                strokeWidth="1.4"
              />
            ))}

            {/* Belt at Waist holding trousers */}
            <rect x="10" y="128" width="60" height="9" rx="2" fill="#713F12" stroke="#1C1610" strokeWidth="2.4" />
            <rect x="34" y="126" width="10" height="13" rx="2" fill="url(#paGoldDecor)" stroke="#1C1610" strokeWidth="1.6" />
          </g>

          {/* 4. RIGHT ARM (Pumping running fist with rolled-up white sleeve) */}
          <g id="pa-right-arm" transform={`translate(160, 175) rotate(${rightArmAngle})`}>
            {/* Puffy gathered linen sleeve rolled to elbow */}
            <path
              d="M 5,0 C -15,15 -25,35 -35,55 C -25,62 -12,58 -5,52 C 2,35 12,18 15,0 Z"
              fill="url(#paLinenShirt)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4 : 0}
            />
            {/* Rolled cuff crease */}
            <ellipse cx="-20" cy="54" rx="10" ry="5" fill="#FEF3C7" stroke="#1C1610" strokeWidth="2.2" />

            {/* Bare Forearm */}
            <path
              d="M -22,54 C -32,70 -38,85 -42,100 C -34,106 -24,102 -18,94 C -14,80 -12,66 -18,54 Z"
              fill="url(#paSkin)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 3.8 : 0}
            />

            {/* Clenched Pumping Fist */}
            <g transform="translate(-32, 102)">
              <ellipse cx="0" cy="0" rx="9" ry="8" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="3" />
              {/* Clenched fingers */}
              <path d="M -5,-3 C -2,-6 4,-6 7,-3 M -6,1 C -3,-2 3,-2 6,1 M -5,5 C -2,2 2,2 5,5" stroke="#1C1610" strokeWidth="2" fill="none" />
            </g>
          </g>

          {/* 5. LEFT ARM & WOODEN FOLK FLUTE (PÍŠŤALKA) */}
          <g id="pa-left-arm" transform={`translate(240, 175) rotate(${fluteArmAngle})`}>
            {/* Puffy gathered linen sleeve rolled to elbow */}
            <path
              d="M 0,0 C 22,-18 42,-32 62,-46 C 70,-40 72,-28 65,-22 C 45,-10 25,5 5,12 Z"
              fill="url(#paLinenShirt)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4 : 0}
            />
            {/* Rolled cuff */}
            <ellipse cx="64" cy="-34" rx="6" ry="10" fill="#FEF3C7" stroke="#1C1610" strokeWidth="2.2" />

            {/* Bare Forearm raised up */}
            <path
              d="M 64,-34 C 74,-48 84,-62 92,-78 C 100,-72 102,-60 95,-52 C 86,-40 76,-26 64,-34 Z"
              fill="url(#paSkin)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 3.8 : 0}
            />

            {/* Left Hand Holding Flute Aloft */}
            <g transform="translate(92, -68)">
              <ellipse cx="0" cy="0" rx="9" ry="8" fill="url(#paSkin)" stroke="#1C1610" strokeWidth="3" />
              {/* Fingers curled around flute */}
              <path d="M -4,-4 C 0,-7 5,-7 8,-4 M -4,0 C 0,-3 5,-3 8,0 M -4,4 C 0,1 5,1 8,4" stroke="#1C1610" strokeWidth="2" fill="none" />

              {/* Traditional 6-Hole Wooden Shepherd's Flute (Píšťalka) */}
              <g id="pa-flute" transform="rotate(-24)">
                {/* Flute Wooden Tube */}
                <rect
                  x="-5"
                  y="-55"
                  width="10"
                  height="110"
                  rx="4"
                  fill="url(#paFluteWood)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.2 : 0}
                />
                {/* Carved Mouthpiece Bevel at top */}
                <polygon points="-5,-55 5,-55 3,-46 -5,-46" fill="#451A03" stroke="#1C1610" strokeWidth="1.5" />
                <rect x="-3" y="-45" width="6" height="3" fill="#1C1610" />

                {/* 6 Finger Stop Holes */}
                {[-28, -14, 0, 14, 28, 42].map((hy) => (
                  <circle key={`flute-hole-${hy}`} cx="0" cy={hy} r="2.2" fill="#1C1610" />
                ))}

                {/* Ornamental brass/wire rings on flute */}
                <line x1="-5" y1="-50" x2="5" y2="-50" stroke="url(#paGoldDecor)" strokeWidth="1.8" />
                <line x1="-5" y1="50" x2="5" y2="50" stroke="url(#paGoldDecor)" strokeWidth="1.8" />
              </g>
            </g>
          </g>

          {/* 6. RED NECKERCHIEF (Tied in loose knot with fluttering ends) */}
          <g id="pa-neckerchief" transform="translate(205, 142)">
            {/* Knot at center collar */}
            <circle cx="0" cy="0" r="6.5" fill="url(#paScarletRed)" stroke="#1C1610" strokeWidth="2.8" />

            {/* Fluttering Knotted Kerchief Wings */}
            <g transform={`rotate(${scarfFlutter})`}>
              {/* Left Wing */}
              <path
                d="M -4,-2 C -18,-6 -34,4 -38,18 C -32,24 -20,18 -8,6 Z"
                fill="url(#paScarletRed)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.2 : 0}
              />
              {/* Right Wing */}
              <path
                d="M 4,-2 C 18,-8 36,-2 44,12 C 38,18 24,14 8,6 Z"
                fill="url(#paScarletRed)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.2 : 0}
              />
            </g>
          </g>

          {/* 7. HEAD, EXPRESSIVE FACE, TOUSLED BROWN HAIR & BARRED FEATHER */}
          <g id="pa-head" transform="translate(210, 105)">
            {/* Barred Bird Feather (tucked playfully behind right ear) */}
            <g id="pa-feather" transform={`translate(-28, -18) rotate(${-35 + featherSway})`}>
              {/* Feather Quill Shaft */}
              <line x1="0" y1="0" x2="-45" y2="-25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              {/* Feather Vane (Barred hawk/eagle stripes) */}
              <path
                d="M 0,0 C -12,-8 -28,-18 -45,-25 C -40,-35 -24,-24 -10,-12 Z"
                fill="#451A03"
                stroke="#1C1610"
                strokeWidth="2.4"
              />
              <path
                d="M 0,0 C -8,-4 -20,-10 -35,-15 C -30,-22 -18,-15 -8,-8 Z"
                fill="#FDE68A"
              />
              {/* Barred cross-stripes */}
              <line x1="-12" y1="-8" x2="-18" y2="-18" stroke="#1C1610" strokeWidth="2.4" />
              <line x1="-24" y1="-14" x2="-30" y2="-24" stroke="#FFFFFF" strokeWidth="2.4" />
              <line x1="-34" y1="-20" x2="-40" y2="-28" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Boy's Round Head & Cheeks */}
            <ellipse
              cx="0"
              cy="0"
              rx="28"
              ry="32"
              fill="url(#paSkin)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Rosy Flushed Red Cheeks */}
            <ellipse cx="-16" cy="6" rx="8" ry="6" fill="#F87171" opacity="0.65" />
            <ellipse cx="16" cy="6" rx="8" ry="6" fill="#F87171" opacity="0.65" />

            {/* Big Expressive Boyish Face (Curious Dark Eyes, Cute Nose, Wonderstruck / Startled / Terrified Mouth) */}
            <g id="pa-face" transform={`translate(${lookX}, ${lookY})`}>
              {/* Eyebrows (Arched & curious, or shot high in startle/terror) */}
              <path
                d={isReact || isFleeing ? 'M -22,-18 Q -12,-28 -4,-19' : 'M -20,-12 Q -12,-20 -4,-14'}
                stroke="#451A03"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={isReact || isFleeing ? 'M 6,-19 Q 14,-28 24,-18' : 'M 6,-14 Q 14,-20 22,-12'}
                stroke="#451A03"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />

              {/* Large Wonderstruck / Startled / Terrified Eyes */}
              <g transform="translate(-11, -4)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx={isReact || isFleeing ? 8 : 6.5}
                  ry={isReact || isFleeing ? 9.2 : 7.5}
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="2.6"
                />
                {/* Pupil */}
                <circle
                  cx={pointer.isHovered ? pointer.x * 2.2 : isReact ? -1 : 1}
                  cy={pointer.isHovered ? pointer.y * 1.8 : 0.5}
                  r={isReact || isFleeing ? 2.2 : 4}
                  fill="#1C1610"
                />
                <circle cx="-1" cy="-2" r="1.5" fill="#FFFFFF" />
              </g>
              <g transform="translate(13, -4)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx={isReact || isFleeing ? 8 : 6.5}
                  ry={isReact || isFleeing ? 9.2 : 7.5}
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="2.6"
                />
                {/* Pupil */}
                <circle
                  cx={pointer.isHovered ? pointer.x * 2.2 : isReact ? -1 : 1}
                  cy={pointer.isHovered ? pointer.y * 1.8 : 0.5}
                  r={isReact || isFleeing ? 2.2 : 4}
                  fill="#1C1610"
                />
                <circle cx="-1" cy="-2" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Cute Upturned Nose */}
              <path d="M -2,4 Q 2,8 6,4" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="2" cy="3" r="3.2" fill="#F97316" opacity="0.6" />

              {/* Mouth: Screaming in Flee, Gasping O in React, or Cheerful Open Mouth */}
              {isFleeing ? (
                <g id="pa-mouth-flee">
                  <ellipse cx="2" cy="18" rx="8.5" ry="9.5" fill="#881337" stroke="#1C1610" strokeWidth="2.8" />
                  <path d="M -4,12 Q 2,15 8,12" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
                  <ellipse cx="2" cy="23" rx="5" ry="3.5" fill="#FB7185" />
                </g>
              ) : isReact ? (
                <g id="pa-mouth-react">
                  <ellipse cx="2" cy="17" rx="6.8" ry="8" fill="#881337" stroke="#1C1610" strokeWidth="2.8" />
                  <circle cx="2" cy="14" r="2" fill="#FFFFFF" />
                </g>
              ) : (
                <>
                  <path
                    d="M -4,14 C -4,22 8,22 8,14 Z"
                    fill="#881337"
                    stroke="#1C1610"
                    strokeWidth="2.6"
                  />
                  <path d="M -2,14 Q 2,16 6,14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                </>
              )}
            </g>

            {/* WILD, MESSY, TOUSLED BROWN SPIKY HAIR (Josef Lada / Fairy Tale boy hair) */}
            <g id="pa-hair" transform={`translate(0, ${hairJoltY})`}>
              {/* Back Hair Tufts */}
              <path
                d="M -30,-8 C -40,-20 -36,-35 -24,-40 C -18,-45 -8,-42 0,-44 C 12,-44 24,-42 32,-35 C 40,-25 36,-10 32,-2 Z"
                fill="url(#paHairBrown)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
              />
              {/* Front Spiky Wind-Tossed Hair Locks */}
              {/* Center Forehead spikes */}
              <path d="M -16,-28 C -22,-44 -12,-52 -4,-46 C 4,-55 16,-52 14,-38 C 22,-46 32,-38 26,-26" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="3.2" strokeLinejoin="round" />
              {/* Spiky fringe tufts over brow */}
              <polygon points="-22,-22 -16,-34 -12,-20" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
              <polygon points="-10,-24 -4,-38 2,-22" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
              <polygon points="4,-24 12,-38 16,-20" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
              <polygon points="18,-20 26,-32 28,-16" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
              {/* Sideburn tufts */}
              <polygon points="-26,-10 -36,-18 -28,4" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
              <polygon points="26,-10 38,-16 28,4" fill="url(#paHairBrown)" stroke="#1C1610" strokeWidth="2.4" />
            </g>
          </g>
        </g>

        {/* SPRINT & FLEE DUST PUFFS BEHIND BARE FEET */}
        {(isSprinting || isFleeing) && showParticles && (
          <g id="pa-sprint-dust">
            {[0, 1, 2].map((i) => {
              const phase = (t * (isFleeing ? 4.5 : 3.2) + i * 0.33) % 1;
              const dx = 125 - phase * 65 - i * 12;
              const dy = 438 - Math.sin(phase * Math.PI) * 18 - i * 4;
              const rad = (1 - phase * 0.5) * (isFleeing ? 14 : 10);
              return (
                <circle
                  key={`pa-dust-${i}`}
                  cx={dx}
                  cy={dy}
                  r={rad}
                  fill="#E7E5E4"
                  stroke="#1C1610"
                  strokeWidth="2"
                  opacity={Math.max(0.15, 0.75 * (1 - phase))}
                />
              );
            })}
          </g>
        )}

        {/* STARTLE MARKS & SWEAT DROPS FOR REACT (HIT BY BUBÁK) & FLEE (ZERO COURAGE) */}
        {(isReact || isFleeing) && showParticles && (
          <g id="pa-panic-vfx">
            {sweatDrops.map((d, idx) => (
              <path
                key={`pa-sweat-${idx}`}
                d={`M ${d.x},${d.y - d.r * 1.8} C ${d.x - d.r},${d.y} ${d.x - d.r},${d.y + d.r} ${d.x},${d.y + d.r} C ${d.x + d.r},${d.y + d.r} ${d.x + d.r},${d.y} ${d.x},${d.y - d.r * 1.8} Z`}
                fill="#38BDF8"
                stroke="#1C1610"
                strokeWidth="1.6"
              />
            ))}
            {isReact && (
              <g id="pa-startle-sparks" transform={`translate(210, ${38 - Math.abs(Math.sin(t * 20)) * 8})`}>
                <line x1="-22" y1="-4" x2="-34" y2="-18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="-8" x2="0" y2="-26" stroke="#FACC15" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="22" y1="-4" x2="34" y2="-18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* MUSICAL NOTES EMITTING IN ACTION (FLUTE PLAY) STATE */}
        {isAction && showParticles && (
          <g id="pa-music-notes">
            {musicNotes.map((note, idx) => (
              <text
                key={`pa-note-${idx}`}
                x={0}
                y={0}
                fill="#CA8A04"
                stroke="#1C1610"
                strokeWidth="1.2"
                fontSize="24"
                fontWeight="900"
                opacity={note.op}
                transform={`translate(${note.x.toFixed(2)}, ${note.y.toFixed(2)}) scale(${note.scale})`}
                style={{ userSelect: 'none', filter: 'drop-shadow(0 2px 4px rgba(234, 179, 8, 0.4))' }}
              >
                {note.char}
              </text>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};
