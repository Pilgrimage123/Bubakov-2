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
  const isAction = state === 'action';
  const isReact = state === 'react';

  // Kinematics
  const walkSpeed = isAction ? 11 : isWalking ? 7.5 : 2.4;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Stern marching stride
  const backLegAngle = isWalking ? walkSin * 24 : isAction ? -14 : -6;
  const frontLegAngle = isWalking ? -walkSin * 24 : isAction ? 18 : 8;

  // Stately bobbing & coat sway
  const bobY = isWalking ? Math.abs(walkSin) * 8 : isAction ? Math.abs(Math.sin(t * 10)) * 12 : Math.sin(t * 2.2) * 2;
  const coatSway = isWalking ? walkSin * 2.5 : 0;

  // Bucket swing & water slosh
  const bucketSwing = isWalking ? Math.sin(t * walkSpeed) * 12 : isAction ? Math.sin(t * 12) * 18 : 0;
  const waterSlosh = Math.sin(t * (isWalking ? 14 : 3)) * (isWalking ? 6 : 2);

  // Aspergillum (sprinkler brush) raised high & dynamic swing
  const aspergillumAngle = isAction
    ? -45 + Math.sin(t * 14) * 45
    : isWalking
    ? 5 + walkCos * 8
    : pointer.isHovered
    ? pointer.y * 14
    : Math.sin(t * 2) * 4;

  // Holy water flying droplets sprayed from the brush
  const droplets = [
    { x: 385 + Math.sin(t * 10 + 1) * 8, y: 85 + ((t * 90) % 95), r: 4.5, op: 0.85 },
    { x: 405 + Math.cos(t * 9 + 2) * 10, y: 70 + ((t * 110 + 25) % 105), r: 5.5, op: 0.9 },
    { x: 420 + Math.sin(t * 11 + 3) * 12, y: 95 + ((t * 130 + 50) % 115), r: 4, op: 0.8 },
    { x: 395 + Math.cos(t * 12 + 4) * 8, y: 115 + ((t * 100 + 75) % 100), r: 3.5, op: 0.75 },
    { x: 415 + Math.sin(t * 8 + 5) * 10, y: 135 + ((t * 120 + 90) % 110), r: 4.2, op: 0.8 },
  ];

  // Head and stern eyes tracking
  const lookX = pointer.isHovered ? pointer.x * 5 : Math.sin(t * 1.5) * 1.5;
  const lookY = pointer.isHovered ? pointer.y * 4 : 0;

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

        {/* Church Frock Coat Rust Brown Gradient */}
        <linearGradient id="koCoatBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="40%" stopColor="#92400E" />
          <stop offset="85%" stopColor="#713F12" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Lapel Dark Blue-Grey Trim */}
        <linearGradient id="koLapelTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Alpine Hat Dark Green Felt */}
        <linearGradient id="koHatGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F6212" />
          <stop offset="50%" stopColor="#283E0B" />
          <stop offset="100%" stopColor="#1A2807" />
        </linearGradient>

        {/* Vest Floral Dark Green Base */}
        <linearGradient id="koVestGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4D7C0F" />
          <stop offset="60%" stopColor="#365314" />
          <stop offset="100%" stopColor="#1E300B" />
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

        {/* Tweed Pants Warm Khaki-Brown */}
        <linearGradient id="koPantsBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#854D0E" />
          <stop offset="60%" stopColor="#713F12" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Ribbed Stockings Ivory */}
        <linearGradient id="koStockingIvory" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Dark Leather Buckled Shoes */}
        <linearGradient id="koShoeLeather" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#451A03" />
          <stop offset="60%" stopColor="#2A1002" />
          <stop offset="100%" stopColor="#120601" />
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
          {/* 1. BACK LEG (Ribbed stocking & buckled parish shoe) */}
          <g id="ko-back-leg" transform={`translate(180, 275) rotate(${backLegAngle})`}>
            {/* Breeches Thigh */}
            <path
              d="M -16,-2 C -24,35 -28,70 -16,105 C -12,112 5,112 12,105 C 18,70 16,35 12,-2 Z"
              fill="url(#koPantsBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4 : 0}
            />
            {/* Ribbed Ivory Knit Stocking */}
            <g transform="translate(0, 105)">
              <path
                d="M -15,0 C -18,22 -16,45 -12,65 C -8,68 8,68 12,65 C 15,45 15,22 12,0 Z"
                fill="url(#koStockingIvory)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              {/* Ribbing lines */}
              {[12, 24, 36, 48].map((y) => (
                <line key={`ko-b-rib-${y}`} x1="-14" y1={y} x2="12" y2={y} stroke="#B45309" strokeWidth="1.2" />
              ))}
            </g>
            {/* Buckled Pilgrim / Parish Leather Shoe */}
            <g transform="translate(0, 168)">
              <path
                d="M -18,-4 C -28,8 -32,22 -14,26 C 6,28 26,26 38,18 C 36,8 20,4 12,-4 Z"
                fill="url(#koShoeLeather)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
              {/* Sole */}
              <path d="M -22,22 C -2,26 18,25 36,18" stroke="#1C1610" strokeWidth="3" />
              {/* Square Golden Brass Buckle */}
              <rect x="-6" y="4" width="14" height="12" rx="2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.8" />
              <rect x="-2" y="7" width="6" height="6" fill="#1C1610" />
            </g>
          </g>

          {/* 2. CHURCH FROCK COAT (Back layer / coat tails) */}
          <path
            d="M 125,180 C 105,240 90,300 120,335 C 135,348 165,345 190,340 C 155,290 145,230 140,180 Z"
            fill="url(#koCoatBrown)"
            stroke="#1C1610"
            strokeWidth={showOutline ? 4.4 : 0}
          />
          {/* Pocket Flap on back coat */}
          <path d="M 122,275 L 148,272" stroke="#1C1610" strokeWidth="3.5" strokeLinecap="round" />

          {/* 3. FRONT LEG (Forward marching stride, buckled shoe) */}
          <g id="ko-front-leg" transform={`translate(225, 275) rotate(${frontLegAngle})`}>
            {/* Breeches Thigh */}
            <path
              d="M -12,-2 C -4,35 6,70 18,105 C 24,112 40,110 38,100 C 28,70 16,35 12,-2 Z"
              fill="url(#koPantsBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Ribbed Ivory Knit Stocking */}
            <g transform="translate(18, 105)">
              <path
                d="M -8,0 C -5,22 -2,45 2,65 C 6,68 22,68 25,65 C 26,45 22,22 18,0 Z"
                fill="url(#koStockingIvory)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              {/* Ribbing lines */}
              {[12, 24, 36, 48].map((y) => (
                <line key={`ko-f-rib-${y}`} x1="-5" y1={y} x2="22" y2={y} stroke="#B45309" strokeWidth="1.2" />
              ))}
            </g>
            {/* Buckled Pilgrim / Parish Leather Shoe */}
            <g transform="translate(18, 168)">
              <path
                d="M -6,-4 C 0,8 6,22 25,26 C 45,28 65,24 74,15 C 68,4 52,2 40,-4 Z"
                fill="url(#koShoeLeather)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
              {/* Sole */}
              <path d="M 0,22 C 20,26 40,25 72,15" stroke="#1C1610" strokeWidth="3" />
              {/* Square Golden Brass Buckle */}
              <rect x="22" y="4" width="14" height="12" rx="2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.8" />
              <rect x="26" y="7" width="6" height="6" fill="#1C1610" />
            </g>
          </g>

          {/* 4. MAIN TORSO & FLORAL EMBROIDERED WAISTCOAT (With Golden Cross & Pocket Watch) */}
          <g id="ko-torso" transform="translate(160, 140)">
            {/* Crisp Cream Shirt ruffled bib */}
            <path
              d="M 25,-12 L 55,-12 L 60,35 L 20,35 Z"
              fill="#FFFDF7"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Shirt Collar points */}
            <polygon points="26,-14 36,5 42,-12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.2" />
            <polygon points="54,-14 44,5 38,-12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.2" />

            {/* Dark Red Bow Tie */}
            <g transform="translate(40, -4)">
              <path d="M 0,0 C -12,-8 -16,4 0,2 C 16,4 12,-8 0,0 Z" fill="#991B1B" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx="0" cy="1" r="3.5" fill="#7F1D1D" stroke="#1C1610" strokeWidth="1.8" />
            </g>

            {/* Splendid Dark Green Folk-Embroidered Vest */}
            <path
              d="M 14,25 C 22,10 60,10 68,25 C 75,70 82,115 76,145 C 50,154 28,154 6,145 C 0,115 8,70 14,25 Z"
              fill="url(#koVestGreen)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />

            {/* Delicate Folk Red Floral Embroidery on Vest */}
            <g id="vest-floral-pattern">
              {/* Small Red Flower Buds & Green Tendrils */}
              {[
                { x: 24, y: 48 }, { x: 56, y: 52 },
                { x: 28, y: 85 }, { x: 54, y: 92 },
                { x: 32, y: 122 }, { x: 50, y: 128 },
              ].map((pos, idx) => (
                <g key={`vest-flower-${idx}`} transform={`translate(${pos.x}, ${pos.y}) scale(0.85)`}>
                  <circle cx="0" cy="0" r="3.2" fill="#DC2626" />
                  <circle cx="-2" cy="-2" r="2" fill="#EF4444" />
                  <circle cx="2" cy="-2" r="2" fill="#EF4444" />
                  <circle cx="0" cy="2.5" r="1.5" fill="#F87171" />
                  <circle cx="0" cy="0" r="1.2" fill="#FDE047" />
                  {/* Green leaves */}
                  <path d="M -4,2 Q -6,6 -2,5" stroke="#65A30D" strokeWidth="1.2" fill="none" />
                  <path d="M 4,2 Q 6,6 2,5" stroke="#65A30D" strokeWidth="1.2" fill="none" />
                </g>
              ))}
            </g>

            {/* Vest Small Golden Buttons */}
            {[45, 65, 85, 105, 125].map((by) => (
              <circle key={`ko-btn-${by}`} cx="42" cy={by} r="2.8" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.2" />
            ))}

            {/* PROMINENT GOLDEN LATIN CROSS NECKLACE */}
            <g id="ko-golden-cross" transform="translate(42, 44)" filter="url(#koCrossGlow)">
              {/* Golden chain */}
              <path d="M -14,-32 C -8,-10 0,0 0,0 C 0,0 8,-10 14,-32" stroke="url(#koHolyBrass)" strokeWidth="2.2" fill="none" strokeDasharray="2 1.5" />
              {/* Latin Cross */}
              <polygon
                points="-3,0 3,0 3,6 9,6 9,12 3,12 3,25 -3,25 -3,12 -9,12 -9,6 -3,6"
                fill="url(#koHolyBrass)"
                stroke="#1C1610"
                strokeWidth="1.8"
              />
              <circle cx="0" cy="9" r="1.5" fill="#FEF08A" />
            </g>

            {/* GOLDEN POCKET WATCH CHAIN & WATCH WITH CLOCK HANDS */}
            <g id="ko-pocket-watch" transform="translate(42, 85)">
              {/* Draped golden chain in sweeping curve to side pocket */}
              <path
                d="M 0,0 C 12,18 28,24 38,18"
                stroke="url(#koHolyBrass)"
                strokeWidth="2.4"
                fill="none"
                strokeDasharray="2.5 1.5"
              />
              {/* Round Golden Pocket Watch */}
              <g transform="translate(38, 20)">
                <circle cx="0" cy="0" r="11" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2" />
                {/* Watch dial face */}
                <circle cx="0" cy="0" r="8" fill="#FFFDF5" stroke="#1C1610" strokeWidth="1.2" />
                {/* Clock hands pointing at 10 to 2 */}
                <line x1="0" y1="0" x2="-3.5" y2="-4" stroke="#1C1610" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="4" y2="-2" stroke="#1C1610" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="0" cy="0" r="1" fill="#CA8A04" />
                {/* Watch crown */}
                <rect x="-1.5" y="-13" width="3" height="3" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1" />
              </g>
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
            {/* Dark velvet lapels */}
            <polygon points="12,18 24,65 14,68 4,24" fill="url(#koLapelTrim)" stroke="#1C1610" strokeWidth="2" />
            <polygon points="70,18 58,65 68,68 78,24" fill="url(#koLapelTrim)" stroke="#1C1610" strokeWidth="2" />
            {/* Coat Brass Buttons */}
            <circle cx="8" cy="85" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="3" cy="115" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="75" cy="85" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="80" cy="115" r="3.2" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.4" />
          </g>

          {/* 5. RIGHT ARM & HOLY WATER BUCKET (KROPENKA) */}
          <g id="ko-bucket-arm" transform="translate(150, 165)">
            {/* Frock coat sleeve reaching down */}
            <path
              d="M 0,0 C -25,28 -38,65 -45,102 C -35,108 -22,105 -15,98 C -10,65 -2,32 15,0 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* White shirt cuff */}
            <path d="M -46,102 L -35,108 L -32,102 L -43,96 Z" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />

            {/* Hand holding bucket handle */}
            <g transform="translate(-40, 106)">
              <ellipse cx="0" cy="0" rx="9" ry="8" fill="url(#koSkin)" stroke="#1C1610" strokeWidth="3" />
              <path d="M -4,-2 C 0,-6 6,-6 8,-2" stroke="#1C1610" strokeWidth="2" fill="none" />

              {/* Swiveling Holy Water Bucket (Kropenka) */}
              <g transform={`translate(-6, 8) rotate(${bucketSwing})`}>
                {/* Curved Brass Handle */}
                <path
                  d="M -16,-2 C -18,-18 18,-18 16,-2"
                  stroke="url(#koHolyBrass)"
                  strokeWidth="3.8"
                  fill="none"
                />
                <circle cx="-16" cy="-2" r="3" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="16" cy="-2" r="3" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="1.5" />

                {/* Footed Brass Holy Water Vessel */}
                {/* Vessel Foot */}
                <polygon points="-12,38 12,38 16,46 -16,46" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2.5" />
                <ellipse cx="0" cy="46" rx="16" ry="4" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2" />
                {/* Main Calyx Bowl */}
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
                {/* Water splash slosh */}
                <path
                  d={`M -14,0 C -5,${waterSlosh} 5,${-waterSlosh} 14,0 Z`}
                  fill="#E0F2FE"
                />
                {/* Droplets splashing out of bucket */}
                <circle cx="-12" cy="-8" r="2.5" fill="#38BDF8" stroke="#1C1610" strokeWidth="1" />
                <circle cx="10" cy="-12" r="3" fill="#38BDF8" stroke="#1C1610" strokeWidth="1" />
              </g>
            </g>
          </g>

          {/* 6. LEFT ARM & ASPERGILLUM SPRINKLER BRUSH (KROPÁČ) */}
          <g id="ko-aspergillum-arm" transform="translate(235, 165)">
            {/* Raised Sleeve */}
            <path
              d="M 0,0 C 25,-25 50,-45 75,-62 C 84,-55 86,-42 78,-35 C 55,-18 30,5 5,15 Z"
              fill="url(#koCoatBrown)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* White ruffled cuff */}
            <path d="M 72,-62 L 78,-55 L 85,-48 L 78,-35 Z" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />

            {/* Hand raising the Aspergillum */}
            <g transform="translate(80, -52)">
              <ellipse cx="0" cy="0" rx="8" ry="7" fill="url(#koSkin)" stroke="#1C1610" strokeWidth="3" />
              <path d="M -3,-3 C 0,-6 4,-6 6,-3" stroke="#1C1610" strokeWidth="2" fill="none" />

              {/* Dynamic swinging Aspergillum (Kropáč) */}
              <g transform={`rotate(${aspergillumAngle})`}>
                {/* Wooden turned handle */}
                <path
                  d="M -3,0 L -4,-35 C -4,-40 4,-40 4,-35 L 3,0 Z"
                  fill="url(#koHolyBrass)"
                  stroke="#1C1610"
                  strokeWidth="2.6"
                />
                {/* Golden Brass Ferrule Bulb */}
                <ellipse cx="0" cy="-38" rx="8" ry="6" fill="url(#koHolyBrass)" stroke="#1C1610" strokeWidth="2.5" />
                {/* Sprinkler Bristles (Straw / Horsehair Brush) */}
                <path
                  d="M -12,-42 C -24,-65 -28,-88 -18,-100 C -6,-105 6,-105 18,-100 C 28,-88 24,-65 12,-42 Z"
                  fill="#D97706"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.8 : 0}
                />
                {/* Bristle texture lines */}
                <path d="M -8,-50 L -14,-95 M -3,-50 L -4,-98 M 3,-50 L 4,-98 M 8,-50 L 14,-95" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M -5,-50 L -8,-85 M 0,-50 L 0,-90 M 5,-50 L 8,-85" stroke="#FEF08A" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 7. HEAD, MUSTACHE, ALPINE HAT WITH FLOWER & PINE SPRIG */}
          <g id="ko-head" transform="translate(200, 100)">
            {/* Short Wavy Dark Grey Hair at back & ears */}
            <path
              d="M -38,-15 C -45,15 -32,38 -20,42 C -18,44 -14,40 -16,35 C -25,28 -30,12 -26,-15 Z"
              fill="#374151"
              stroke="#1C1610"
              strokeWidth="3.2"
            />
            <path
              d="M 28,-15 C 38,15 32,38 22,42 C 20,44 16,40 18,35 C 24,28 26,12 24,-15 Z"
              fill="#374151"
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
            {/* Double Chin crease */}
            <path d="M -6,44 Q 6,52 18,44" stroke="#1C1610" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Rosy Round Cheeks */}
            <ellipse cx="-16" cy="12" rx="9" ry="7" fill="#F87171" opacity="0.6" />
            <ellipse cx="20" cy="12" rx="9" ry="7" fill="#F87171" opacity="0.6" />

            {/* Face Details (Interactive Eyes, Big Handlebar Mustache, Bulbous Red Nose) */}
            <g id="ko-face" transform={`translate(${lookX}, ${lookY})`}>
              {/* Furrowed Stern Eyebrows (Dark Bushy) */}
              <path d="M -22,-12 Q -12,-20 -2,-12" stroke="#1F2937" strokeWidth="4.8" strokeLinecap="round" fill="none" />
              <path d="M 6,-12 Q 16,-20 26,-12" stroke="#1F2937" strokeWidth="4.8" strokeLinecap="round" fill="none" />
              {/* Forehead furrow lines */}
              <line x1="-8" y1="-22" x2="12" y2="-22" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="-4" y1="-17" x2="8" y2="-17" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round" />

              {/* Stern Eyes */}
              <g transform="translate(-11, -6)">
                <ellipse cx="0" cy="0" rx="5" ry="4.5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.4" />
                <circle cx={pointer.isHovered ? pointer.x * 1.5 : 0.5} cy={pointer.isHovered ? pointer.y * 1.2 : 0} r="2.8" fill="#1C1610" />
                <circle cx="-0.8" cy="-1" r="1" fill="#FFFFFF" />
              </g>
              <g transform="translate(15, -6)">
                <ellipse cx="0" cy="0" rx="5" ry="4.5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.4" />
                <circle cx={pointer.isHovered ? pointer.x * 1.5 : 0.5} cy={pointer.isHovered ? pointer.y * 1.2 : 0} r="2.8" fill="#1C1610" />
                <circle cx="-0.8" cy="-1" r="1" fill="#FFFFFF" />
              </g>

              {/* Prominent Bulbous Red Nose */}
              <ellipse cx="2" cy="4" rx="8" ry="7" fill="#EF4444" stroke="#1C1610" strokeWidth="3" />
              <circle cx="0" cy="2" r="2.5" fill="#FCA5A5" />

              {/* Magnificent Upward-Curling Dark Grey Handlebar Mustache */}
              <path
                d="M -30,12 C -24,8 -10,12 2,10 C 14,12 28,8 34,12 C 38,15 36,25 28,26 C 20,27 12,18 2,18 C -8,18 -16,27 -24,26 C -32,25 -34,15 -30,12 Z"
                fill="#374151"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.8 : 0}
              />
              <path d="M -26,16 C -18,14 -6,14 2,14 C 10,14 22,14 30,16" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Mouth peek below mustache */}
              <path d="M -2,26 Q 2,29 6,26" stroke="#7F1D1D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* ALPINE / TYROLEAN HAT WITH FLOWER & PINE SPRIG */}
            <g id="ko-hat" transform="translate(0, -32) rotate(-3)">
              {/* Pine Needle Sprig behind flower */}
              <g transform="translate(-24, 0)">
                <line x1="0" y1="0" x2="-22" y2="-15" stroke="#713F12" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="-8" y1="-5" x2="-15" y2="-25" stroke="#166534" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="-14" y1="-10" x2="-26" y2="-22" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="-18" y1="-12" x2="-32" y2="-12" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" />
              </g>

              {/* Vivid Red Carnation Flower (Hřebíček) */}
              <g transform="translate(-20, 2)">
                <path d="M -8,-6 C -12,-14 -4,-18 0,-14 C 4,-18 12,-14 8,-6 C 10,-2 6,4 0,6 C -6,4 -10,-2 -8,-6 Z" fill="#DC2626" stroke="#1C1610" strokeWidth="2.2" />
                <circle cx="-3" cy="-8" r="3" fill="#EF4444" />
                <circle cx="3" cy="-8" r="3" fill="#EF4444" />
                <circle cx="0" cy="-4" r="2.5" fill="#F87171" />
                <circle cx="0" cy="0" r="1.5" fill="#FDE047" />
              </g>

              {/* Crown of Alpine Green Felt Hat */}
              <path
                d="M -34,4 C -36,-30 -22,-52 0,-54 C 22,-52 36,-30 34,4 Z"
                fill="url(#koHatGreen)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
              />
              {/* Hat Crease in crown */}
              <path d="M -12,-48 Q 0,-38 12,-48" stroke="#1A2807" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Dark Hatband */}
              <path
                d="M -35,-2 C -15,-6 15,-6 35,-2 L 34,6 C 15,2 -15,2 -34,6 Z"
                fill="#1A2807"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Up-Folded Hat Brim */}
              <path
                d="M -44,8 C -20,0 20,0 44,8 C 48,10 46,18 36,18 C 16,14 -16,14 -36,18 C -46,18 -48,10 -44,8 Z"
                fill="#283E0B"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
            </g>
          </g>
        </g>

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
