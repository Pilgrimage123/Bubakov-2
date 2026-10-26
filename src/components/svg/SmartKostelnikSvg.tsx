import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartKostelnikSvg - Interactive smart vector SVG animation
 * Inspired by the classic Czech folklore illustration of the stern Churchwarden / Sexton (Kostelník)
 *
 * Visual fidelity details matching the reference art:
 * - Green Alpine/Tyrolean hat with folded brim, red carnation flower & pine sprig
 * - Stern determined face with bushy dark-grey mustache curled at tips, red bulbous nose & double chin
 * - Dark red bow tie and white ruffled shirt collar and cuffs
 * - Splendid dark-green folk-embroidered vest with red floral motifs & small golden buttons
 * - Prominent golden Latin cross necklace on chest
 * - Golden pocket watch chain draped across the vest leading to a visible pocket watch with clock hands
 * - Warm rust-brown frock coat with dark lapels, pocket flaps & brass buttons
 * - Brown knee breeches, ribbed ivory knit stockings & buckled dark brown leather shoes with brass buckles
 * - Right hand carrying an ornate footed golden brass holy water bucket (kropenka) with an engraved cross and sloshing blue water
 * - Left hand raised high swinging a golden aspergillum sprinkler brush (kropáč) flicking droplets of holy water
 * - Marching kinematics and interactive cursor tracking
 */
export const SmartKostelnikSvg: React.FC<SmartCharacterProps> = ({
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

  // Kinematics
  const walkSpeed = isFleeing ? 17.5 : isSprinting ? 13.5 : isAction ? 11 : isWalking ? 7.8 : isReact ? 20 : 2.4;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Stern marching / sprinting / startled / panicked fleeing stride (legs ONLY swing when actively moving)
  const backLegAngle = isMoving
    ? walkSin * (isFleeing ? 48 : isSprinting ? 38 : 26)
    : isAction
    ? -14
    : isReact
    ? -18
    : -6;
  const frontLegAngle = isMoving
    ? -walkSin * (isFleeing ? 48 : isSprinting ? 38 : 26)
    : isAction
    ? 18
    : isReact
    ? 22
    : 8;

  // Stately bobbing, startle recoil jolt & coat sway
  const bobY = isFleeing
    ? -Math.abs(walkSin) * 18
    : isSprinting
    ? -Math.abs(walkSin) * 14
    : isWalking
    ? -Math.abs(walkSin) * 8
    : isAction
    ? -Math.abs(Math.sin(t * 10)) * 12
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 12 - 5
    : Math.sin(t * 2.2) * 2;
  const coatSway = isFleeing
    ? 16 + walkSin * 5
    : isSprinting
    ? 12 + walkSin * 4
    : isWalking
    ? 5 + walkSin * 2.5
    : isReact
    ? -14 + Math.sin(t * 26) * 4
    : 0;

  // Shoulder & Bucket swing + water slosh
  const bucketArmAngle = isFleeing
    ? -78 + Math.sin(t * 19) * 26
    : isReact
    ? 38 + Math.sin(t * 24) * 12
    : isSprinting
    ? -walkCos * 28
    : isWalking
    ? -walkCos * 16
    : 0;
  const bucketSwing = isFleeing
    ? Math.sin(t * 22) * 32
    : isReact
    ? -28 + Math.sin(t * 26) * 16
    : isSprinting
    ? Math.sin(t * walkSpeed) * 22
    : isWalking
    ? Math.sin(t * walkSpeed) * 12
    : isAction
    ? Math.sin(t * 12) * 18
    : 0;
  const waterSlosh = Math.sin(t * (isFleeing ? 24 : isSprinting ? 18 : isWalking ? 14 : isReact ? 26 : 3)) * (isFleeing || isReact ? 10 : isSprinting ? 8 : isWalking ? 6 : 2);

  // Left arm & Aspergillum (sprinkler brush) raised high & dynamic swing
  const leftArmShoulderAngle = isFleeing
    ? -38 + Math.cos(t * 19) * 24
    : isReact
    ? -28 + Math.cos(t * 24) * 10
    : isSprinting
    ? walkCos * 22
    : isWalking
    ? walkCos * 12
    : 0;
  const aspergillumAngle = isFleeing
    ? -35 + Math.sin(t * 22) * 38
    : isReact
    ? -50 + Math.sin(t * 26) * 20
    : isAction
    ? -45 + Math.sin(t * 14) * 45
    : isSprinting
    ? 12 + walkCos * 18
    : isWalking
    ? 5 + walkCos * 10
    : pointer.isHovered
    ? pointer.y * 14
    : Math.sin(t * 2) * 4;

  // Hat pop on startle & tilt on sprint/flee
  const hatPopY = isReact ? -10 - Math.abs(Math.sin(t * 22)) * 6 : isFleeing ? -4 - Math.abs(walkSin) * 4 : 0;
  const hatTilt = isReact ? -14 + Math.sin(t * 26) * 5 : isFleeing ? -12 + walkSin * 6 : isSprinting ? -6 : -2;

  // Holy water flying droplets sprayed from the brush
  const droplets = [
    { x: 385 + Math.sin(t * 10 + 1) * 8, y: 85 + ((t * 90) % 95), r: 4.5, op: 0.85 },
    { x: 405 + Math.cos(t * 9 + 2) * 10, y: 70 + ((t * 110 + 25) % 105), r: 5.5, op: 0.9 },
    { x: 420 + Math.sin(t * 11 + 3) * 12, y: 95 + ((t * 130 + 50) % 115), r: 4, op: 0.8 },
    { x: 395 + Math.cos(t * 12 + 4) * 8, y: 115 + ((t * 100 + 75) % 100), r: 3.5, op: 0.75 },
    { x: 415 + Math.sin(t * 8 + 5) * 10, y: 135 + ((t * 120 + 90) % 110), r: 4.2, op: 0.8 },
  ];

  // Sweat droplets for react (startled by bubák) and flee (zero courage)
  const sweatDrops = [
    { x: 155 - ((t * 105) % 42), y: 82 + ((t * 80) % 38), r: 4.2 },
    { x: 245 + ((t * 100 + 14) % 44), y: 76 + ((t * 88 + 12) % 42), r: 3.8 },
    { x: 145 - ((t * 118 + 22) % 48), y: 98 + ((t * 72 + 18) % 38), r: 3.5 },
  ];

  // Head and stern eyes tracking
  const lookX = isReact ? -2 + Math.sin(t * 28) * 1.5 : isFleeing ? 3 : pointer.isHovered ? pointer.x * 5 : Math.sin(t * 1.5) * 1.5;
  const lookY = isReact ? -2 : isFleeing ? -1 : pointer.isHovered ? pointer.y * 4 : 0;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 470 480"
      width={size}
      height={size}
      className={`smart-kostelnik-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Kostelník s kropenkou a kropáčem svěcené vody"
    >
      <defs>
        {/* Skin Tone Gradient */}
        <radialGradient id="koSkin" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF2E8" />
          <stop offset="65%" stopColor="#FBD4BD" />
          <stop offset="100%" stopColor="#E5A682" />
        </radialGradient>

        {/* Church Frock Coat Olive-Brown Gradient */}
        <linearGradient id="koCoatBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8C6747" />
          <stop offset="45%" stopColor="#7C5A3F" />
          <stop offset="85%" stopColor="#624630" />
          <stop offset="100%" stopColor="#432F20" />
        </linearGradient>

        {/* Lapel Dark Brown Trim */}
        <linearGradient id="koLapelTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4E3629" />
          <stop offset="100%" stopColor="#2D1E17" />
        </linearGradient>

        {/* Brown Felt Fedora Hat */}
        <linearGradient id="koHatGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6540" />
          <stop offset="55%" stopColor="#7C5836" />
          <stop offset="100%" stopColor="#563B23" />
        </linearGradient>

        {/* Dark Brown Patterned Waistcoat */}
        <linearGradient id="koVestGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A372B" />
          <stop offset="60%" stopColor="#3B2B22" />
          <stop offset="100%" stopColor="#261B15" />
        </linearGradient>

        {/* Golden Holy Brass / Bronze Gradient */}
        <linearGradient id="koHolyBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        {/* Holy Water Crystal Gradient */}
        <linearGradient id="koHolyWater" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Full-Length Dark Brown Trousers */}
        <linearGradient id="koPantsBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D5442" />
          <stop offset="60%" stopColor="#564133" />
          <stop offset="100%" stopColor="#3B2B20" />
        </linearGradient>

        {/* Lower Trouser Cuff */}
        <linearGradient id="koStockingIvory" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#634B3A" />
          <stop offset="50%" stopColor="#523E30" />
          <stop offset="100%" stopColor="#3B2B20" />
        </linearGradient>

        {/* Black Leather Parish Shoes */}
        <linearGradient id="koShoeLeather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="55%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>

        {/* Golden Cross Holy Shine Glow */}
        <filter id="koCrossGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow filter */}
        <filter id="koPaperDrop" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="2" dy="4" stdDeviation="3.5" floodColor="#1C1610" floodOpacity="0.2" />
        </filter>
      </defs>

      <g
        transform={`translate(230, 240) scale(${direction}, 1) translate(-230, -240)`}
        filter="url(#koPaperDrop)"
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <ellipse
            cx={215}
            cy={445}
            rx={98 + (isWalking ? Math.sin(t * walkSpeed) * 6 : 0)}
            ry={17}
            fill="#1E293B"
            opacity="0.24"
          />
        )}

        {/* KINEMATIC BODY BOB & COAT SWAY */}
        <g id="ko-bob-group" transform={`translate(0, ${bobY}) rotate(${coatSway}, 210, 280)`}>
          {/* 1. BACK LEG (Brown wool trousers & black leather parish shoe) */}
          <g id="ko-back-leg" transform={`translate(180, 275) rotate(${backLegAngle})`}>
            {/* Upper Trouser */}
            <path
              d="M -16,-2 C -24,35 -26,72 -18,108 C -12,112 8,112 14,108 C 18,72 16,35 12,-2 Z"
              fill="url(#koPantsBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4 : 0}
            />
            {/* Lower Trouser Leg */}
            <g transform="translate(0, 105)">
              <path
                d="M -17,0 C -19,22 -18,45 -15,65 C -8,68 10,68 15,65 C 17,45 16,22 14,0 Z"
                fill="url(#koStockingIvory)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              {/* Subtle trouser fold crease */}
              <line x1="-2" y1="6" x2="-4" y2="58" stroke="#2D1E17" strokeWidth="1.6" />
            </g>
            {/* Black Leather Parish Shoe */}
            <g transform="translate(0, 168)">
              <path
                d="M -18,-4 C -28,8 -32,22 -14,26 C 6,28 26,26 38,18 C 36,8 20,4 12,-4 Z"
                fill="url(#koShoeLeather)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
              <path d="M -22,22 C -2,26 18,25 36,18" stroke="#1C1610" strokeWidth="3" />
            </g>
          </g>

          {/* 2. CHURCH FROCK COAT (Back layer / coat tails) */}
          <path
            d="M 125,180 C 105,240 90,300 120,335 C 135,348 165,345 190,340 C 155,290 145,230 140,180 Z"
            fill="url(#koCoatBrown)"
            stroke="#1C1610"
            strokeWidth={showOutline ? 4.4 : 0}
          />
          <path d="M 122,275 L 148,272" stroke="#1C1610" strokeWidth="3.5" strokeLinecap="round" />

          {/* 3. FRONT LEG (Forward marching stride, brown trousers & black shoe) */}
          <g id="ko-front-leg" transform={`translate(225, 275) rotate(${frontLegAngle})`}>
            <path
              d="M -12,-2 C -4,35 6,72 16,108 C 22,112 38,110 38,102 C 28,70 16,35 12,-2 Z"
              fill="url(#koPantsBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            <g transform="translate(18, 105)">
              <path
                d="M -10,0 C -7,22 -4,45 0,65 C 6,68 24,68 27,65 C 28,45 24,22 20,0 Z"
                fill="url(#koStockingIvory)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              <line x1="6" y1="6" x2="10" y2="58" stroke="#2D1E17" strokeWidth="1.6" />
            </g>
            {/* Black Leather Parish Shoe */}
            <g transform="translate(18, 168)">
              <path
                d="M -6,-4 C 0,8 6,22 25,26 C 45,28 65,24 74,15 C 68,4 52,2 40,-4 Z"
                fill="url(#koShoeLeather)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
              <path d="M 0,22 C 20,26 40,25 72,15" stroke="#1C1610" strokeWidth="3" />
            </g>
          </g>

          {/* 4. MAIN TORSO & DARK PATTERNED WAISTCOAT (With Golden Cross) */}
          <g id="ko-torso" transform="translate(160, 140)">
            {/* Crisp Cream Shirt Collar */}
            <path
              d="M 25,-12 L 55,-12 L 60,35 L 20,35 Z"
              fill="#FFFDF7"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            <polygon points="26,-14 36,5 42,-12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.2" />
            <polygon points="54,-14 44,5 38,-12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.2" />

            {/* Dark Brown Waistcoat */}
            <path
              d="M 14,20 C 22,8 60,8 68,20 C 75,70 82,115 76,145 C 50,154 28,154 6,145 C 0,115 8,70 14,20 Z"
              fill="url(#koVestGreen)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Subtle Folk Brocade Motifs on Dark Brown Waistcoat */}
            <g id="vest-floral-pattern" opacity="0.55">
              {[
                { x: 24, y: 48 }, { x: 56, y: 52 },
                { x: 28, y: 85 }, { x: 54, y: 92 },
                { x: 32, y: 122 }, { x: 50, y: 128 },
              ].map((pos, idx) => (
                <g key={`vest-flower-${idx}`} transform={`translate(${pos.x}, ${pos.y}) scale(0.85)`}>
                  <circle cx="0" cy="0" r="3" fill="#78350F" />
                  <circle cx="0" cy="0" r="1.3" fill="#B45309" />
                </g>
              ))}
            </g>

            {/* Vest Small Golden Brass Buttons */}
            {[45, 65, 85, 105, 125].map((by) => (
              <circle key={`ko-btn-${by}`} cx="42" cy={by} r="2.8" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.2" />
            ))}

            {/* PROMINENT GOLDEN LATIN CROSS NECKLACE */}
            <g id="ko-golden-cross" transform="translate(42, 38)" filter="url(#koCrossGlow)">
              {/* Dark cord around neck */}
              <path d="M -15,-34 C -8,-10 0,0 0,0 C 0,0 8,-10 15,-34" stroke="#1C1610" strokeWidth="2.6" fill="none" />
              {/* Latin Cross */}
              <polygon
                points="-3.5,0 3.5,0 3.5,7 10,7 10,13 3.5,13 3.5,27 -3.5,27 -3.5,13 -10,13 -10,7 -3.5,7"
                fill="url(#koHolyBrass)"
                stroke="#1C1610"
                strokeWidth="2"
              />
              <circle cx="0" cy="10" r="1.6" fill="#FEF08A" />
            </g>

            {/* Church Frock Coat Front & Notched Lapels */}
            <path
              d="M 10,20 C 5,60 0,110 -15,150 C 5,158 35,158 50,152 C 25,120 18,70 16,20 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            <path
              d="M 72,20 C 76,60 82,110 98,150 C 78,158 52,158 42,152 C 65,120 70,70 70,20 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Coat lapels */}
            <polygon points="12,18 24,65 14,68 4,24" fill="url(#koLapelTrim)" stroke="#1C1610" strokeWidth="2" />
            <polygon points="70,18 58,65 68,68 78,24" fill="url(#koLapelTrim)" stroke="#1C1610" strokeWidth="2" />
            {/* Coat Brass Buttons */}
            <circle cx="8" cy="85" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="3" cy="115" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="75" cy="85" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="80" cy="115" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
          </g>

          {/* 5. RIGHT ARM & HOLY WATER BUCKET (KROPENKA) */}
          <g id="ko-bucket-arm" transform={`translate(150, 165) rotate(${bucketArmAngle})`}>
            <path
              d="M 0,0 C -25,28 -38,65 -45,102 C -35,108 -22,105 -15,98 C -10,65 -2,32 15,0 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            <path d="M -46,102 L -35,108 L -32,102 L -43,96 Z" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />

            {/* Hand holding bucket handle */}
            <g transform="translate(-40, 106)">
              <ellipse cx="0" cy="0" rx="9" ry="8" fill="url(#koSkin)" stroke="#1C1610" strokeWidth="3" />
              <path d="M -4,-2 C 0,-6 6,-6 8,-2" stroke="#1C1610" strokeWidth="2" fill="none" />

              {/* Swiveling Holy Water Bucket (Kropenka) */}
              <g transform={`translate(-6, 8) rotate(${bucketSwing})`}>
                <path
                  d="M -16,-2 C -18,-18 18,-18 16,-2"
                  stroke="url(#koHolyBrass)"
                  strokeWidth="3.8"
                  fill="none"
                />
                <circle cx="-16" cy="-2" r="3" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="16" cy="-2" r="3" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.5" />

                <polygon points="-12,38 12,38 16,46 -16,46" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2.5" />
                <ellipse cx="0" cy="46" rx="16" ry="4" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2" />
                <path
                  d="M -22,0 C -25,18 -18,34 -8,38 L 8,38 C 18,34 25,18 22,0 Z"
                  fill="url(#koHolyBrass)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 4 : 0}
                />
                {/* Engraved Latin Cross on Bucket */}
                <polygon
                  points="-2,10 2,10 2,14 6,14 6,18 2,18 2,26 -2,26 -2,18 -6,18 -6,14 -2,14"
                  fill="#78350F"
                  stroke="#1C1610"
                  strokeWidth="1.2"
                />
                {/* Holy Water Rim & Sloshing Water */}
                <ellipse cx="0" cy="0" rx="22" ry="7" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="3" />
                <ellipse cx="0" cy="0" rx="19" ry="5.5" fill="url(#koHolyWater)" />
                <path
                  d={`M -14,0 C -5,${waterSlosh} 5,${-waterSlosh} 14,0 Z`}
                  fill="#E0F2FE"
                />
                <circle cx="-12" cy="-8" r="2.5" fill="#38BDF8" stroke="#1C1610" strokeWidth="1" />
                <circle cx="10" cy="-12" r="3" fill="#38BDF8" stroke="#1C1610" strokeWidth="1" />
                {(isReact || isFleeing) && (
                  <g id="ko-bucket-splash">
                    <circle cx="-6" cy={-16 - Math.abs(waterSlosh)} r="3.5" fill="#38BDF8" stroke="#1C1610" strokeWidth="1.2" />
                    <circle cx="8" cy={-20 - Math.abs(waterSlosh) * 0.8} r="3" fill="#BAE6FD" stroke="#1C1610" strokeWidth="1.2" />
                  </g>
                )}
              </g>
            </g>
          </g>

          {/* 6. LEFT ARM & ASPERGILLUM SPRINKLER BRUSH (KROPÁČ) */}
          <g id="ko-aspergillum-arm" transform={`translate(235, 165) rotate(${leftArmShoulderAngle})`}>
            <path
              d="M 0,0 C 25,-25 50,-45 75,-62 C 84,-55 86,-42 78,-35 C 55,-18 30,5 5,15 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            <path d="M 72,-62 L 78,-55 L 85,-48 L 78,-35 Z" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />

            {/* Hand raising the Aspergillum */}
            <g transform="translate(80, -52)">
              <ellipse cx="0" cy="0" rx="8" ry="7" fill="url(#koSkin)" stroke="#1C1610" strokeWidth="3" />
              <path d="M -3,-3 C 0,-6 4,-6 6,-3" stroke="#1C1610" strokeWidth="2" fill="none" />

              {/* Dynamic swinging Aspergillum (Kropáč) */}
              <g transform={`rotate(${aspergillumAngle})`}>
                <path
                  d="M -3,0 L -4,-35 C -4,-40 4,-40 4,-35 L 3,0 Z"
                  fill="#8C5A35"
                  stroke="#1C1610"
                  strokeWidth="2.6"
                />
                <ellipse cx="0" cy="-38" rx="8" ry="6" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2.5" />
                <path
                  d="M -12,-42 C -24,-65 -28,-88 -18,-100 C -6,-105 6,-105 18,-100 C 28,-88 24,-65 12,-42 Z"
                  fill="#EAB308"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.8 : 0}
                />
                <path d="M -8,-50 L -14,-95 M -3,-50 L -4,-98 M 3,-50 L 4,-98 M 8,-50 L 14,-95" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M -5,-50 L -8,-85 M 0,-50 L 0,-90 M 5,-50 L 8,-85" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 7. HEAD, GREY MUSTACHE & BROWN FEDORA HAT WITH DARK BAND */}
          <g id="ko-head" transform="translate(200, 100)">
            {/* Short Wavy Grey Hair at back & ears */}
            <path
              d="M -38,-15 C -45,15 -32,38 -20,42 C -18,44 -14,40 -16,35 C -25,28 -30,12 -26,-15 Z"
              fill="#9CA3AF"
              stroke="#1C1610"
              strokeWidth="3.2"
            />
            <path
              d="M 28,-15 C 38,15 32,38 22,42 C 20,44 16,40 18,35 C 24,28 26,12 24,-15 Z"
              fill="#9CA3AF"
              stroke="#1C1610"
              strokeWidth="3.2"
            />

            {/* Plump Face & Double Chin */}
            <path
              d="M -26,-25 C -35,5 -32,35 -14,48 C -4,56 18,56 26,46 C 36,32 38,5 28,-25 Z"
              fill="url(#koSkin)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.4 : 0}
            />
            <path d="M -6,44 Q 6,52 18,44" stroke="#1C1610" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Rosy Round Cheeks */}
            <ellipse cx="-16" cy="12" rx="9" ry="7" fill="#F87171" opacity="0.55" />
            <ellipse cx="20" cy="12" rx="9" ry="7" fill="#F87171" opacity="0.55" />

            {/* Face Details (Interactive Eyes, Thick Grey Mustache, Bulbous Red Nose) */}
            <g id="ko-face" transform={`translate(${lookX}, ${lookY})`}>
              {/* Furrowed Stern Eyebrows (or Raised High in Startle / Terror) */}
              <path
                d={isReact || isFleeing ? 'M -24,-18 Q -12,-28 -2,-18' : 'M -22,-12 Q -12,-20 -2,-12'}
                stroke="#4B5563"
                strokeWidth="4.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={isReact || isFleeing ? 'M 6,-18 Q 16,-28 28,-18' : 'M 6,-12 Q 16,-20 26,-12'}
                stroke="#4B5563"
                strokeWidth="4.8"
                strokeLinecap="round"
                fill="none"
              />
              <line x1="-8" y1="-22" x2="12" y2="-22" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="-4" y1="-17" x2="8" y2="-17" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round" />

              {/* Stern / Startled / Terrified Eyes */}
              <g transform="translate(-11, -6)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx={isReact || isFleeing ? 7 : 5}
                  ry={isReact || isFleeing ? 7.8 : 4.5}
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                />
                <circle
                  cx={pointer.isHovered ? pointer.x * 1.5 : isReact ? -0.8 : 0.5}
                  cy={pointer.isHovered ? pointer.y * 1.2 : 0}
                  r={isReact || isFleeing ? 2 : 2.8}
                  fill="#1C1610"
                />
                <circle cx="-0.8" cy="-1" r="1" fill="#FFFFFF" />
              </g>
              <g transform="translate(15, -6)">
                <ellipse
                  cx="0"
                  cy="0"
                  rx={isReact || isFleeing ? 7 : 5}
                  ry={isReact || isFleeing ? 7.8 : 4.5}
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="2.4"
                />
                <circle
                  cx={pointer.isHovered ? pointer.x * 1.5 : isReact ? -0.8 : 0.5}
                  cy={pointer.isHovered ? pointer.y * 1.2 : 0}
                  r={isReact || isFleeing ? 2 : 2.8}
                  fill="#1C1610"
                />
                <circle cx="-0.8" cy="-1" r="1" fill="#FFFFFF" />
              </g>

              {/* Prominent Bulbous Red Nose */}
              <ellipse cx="2" cy="4" rx="8" ry="7" fill="#E06D53" stroke="#1C1610" strokeWidth="3" />
              <circle cx="0" cy="2" r="2.5" fill="#FCA5A5" />

              {/* Open Startled / Screaming Mouth under Mustache */}
              {(isReact || isFleeing) && (
                <ellipse
                  cx="2"
                  cy="27"
                  rx={isFleeing ? 8.5 : 6.5}
                  ry={isFleeing ? 9 : 7}
                  fill="#7F1D1D"
                  stroke="#1C1610"
                  strokeWidth="2.8"
                />
              )}

              {/* Thick Grey Mustache (Bristling up in React / Flee) */}
              <g transform={isReact || isFleeing ? `translate(0, -3) rotate(${Math.sin(t * 28) * 5})` : undefined}>
                <path
                  d="M -28,13 C -20,8 -8,11 2,10 C 12,11 24,8 32,13 C 35,17 31,24 24,24 C 16,24 10,18 2,18 C -6,18 -12,24 -20,24 C -27,24 -31,17 -28,13 Z"
                  fill="#9CA3AF"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.8 : 0}
                />
                <path d="M -22,16 C -14,14 -4,14 2,14 C 8,14 18,14 26,16" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              </g>
              {!isReact && !isFleeing && (
                <path d="M -3,25 Q 2,27 7,25" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              )}
            </g>

            {/* BROWN FELT FEDORA HAT WITH DARK BROWN BAND (Pops up on startle!) */}
            <g id="ko-hat" transform={`translate(0, ${-32 + hatPopY}) rotate(${hatTilt})`}>
              {/* Pinched Crown of Brown Felt Hat */}
              <path
                d="M -35,4 C -36,-26 -26,-48 -12,-50 C -4,-45 4,-45 12,-50 C 26,-48 36,-26 35,4 Z"
                fill="url(#koHatGreen)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
              />
              {/* Hat Crown Side Dents */}
              <path d="M -18,-36 Q -6,-28 0,-36 Q 6,-28 18,-36" stroke="#432F20" strokeWidth="2.6" strokeLinecap="round" fill="none" />

              {/* Dark Brown Hatband */}
              <path
                d="M -35,-3 C -15,-7 15,-7 35,-3 L 34,6 C 15,2 -15,2 -34,6 Z"
                fill="#3E2723"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Curved Brown Hat Brim */}
              <path
                d="M -48,7 C -22,-2 22,-2 48,7 C 52,10 48,17 38,16 C 16,12 -16,12 -38,16 C -48,17 -52,10 -48,7 Z"
                fill="#6E4E30"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
            </g>
          </g>
        </g>

        {/* SPRINT & FLEE DUST PUFFS BEHIND PARISH SHOES */}
        {(isSprinting || isFleeing) && showParticles && (
          <g id="ko-sprint-dust">
            {[0, 1, 2].map((i) => {
              const phase = (t * (isFleeing ? 4.2 : 3.0) + i * 0.33) % 1;
              const dx = 130 - phase * 62 - i * 12;
              const dy = 436 - Math.sin(phase * Math.PI) * 16 - i * 4;
              const rad = (1 - phase * 0.5) * (isFleeing ? 14 : 10);
              return (
                <circle
                  key={`ko-dust-${i}`}
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
          <g id="ko-panic-vfx">
            {sweatDrops.map((d, idx) => (
              <path
                key={`ko-sweat-${idx}`}
                d={`M ${d.x},${d.y - d.r * 1.8} C ${d.x - d.r},${d.y} ${d.x - d.r},${d.y + d.r} ${d.x},${d.y + d.r} C ${d.x + d.r},${d.y + d.r} ${d.x + d.r},${d.y} ${d.x},${d.y - d.r * 1.8} Z`}
                fill="#38BDF8"
                stroke="#1C1610"
                strokeWidth="1.6"
              />
            ))}
            {isReact && (
              <g id="ko-startle-sparks" transform={`translate(200, ${18 - Math.abs(Math.sin(t * 20)) * 8})`}>
                <line x1="-24" y1="-4" x2="-36" y2="-18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="-8" x2="0" y2="-26" stroke="#FACC15" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="24" y1="-4" x2="36" y2="-18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* DYNAMIC SPRAY OF HOLY WATER DROPLETS */}
        {showParticles && (
          <g id="ko-droplets">
            {droplets.map((d, idx) => (
              <g key={`ko-drop-${idx}`} transform={`translate(${d.x}, ${d.y})`}>
                <ellipse cx="0" cy="0" rx={d.r} ry={d.r * 1.3} fill="url(#koHolyWater)" opacity={d.op} stroke="#1C1610" strokeWidth="1" />
                <circle cx="-1" cy="-1.5" r={d.r * 0.35} fill="#FFFFFF" opacity="0.8" />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};
