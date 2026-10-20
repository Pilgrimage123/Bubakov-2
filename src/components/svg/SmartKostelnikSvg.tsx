import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartKostelnikSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale / folklore illustration of the stern Churchwarden (Kostelník)
 * Features:
 * - Stern determined face with bushy mustache, red nose & double chin
 * - Parish dark brown fedora hat & dark olive-green church frock coat
 * - Waistcoat with golden buttons & large golden Latin cross on chest
 * - Heavy ornate golden brass holy water bucket (kropenka) with sloshing water
 * - Golden aspergillum sprinkler brush (kropáč) casting flying droplets of holy water
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

  // Stately bobbing
  const bobY = isWalking ? Math.abs(walkSin) * 8 : isAction ? Math.abs(Math.sin(t * 10)) * 12 : Math.sin(t * 2.2) * 2;
  const coatSway = isWalking ? walkSin * 2.5 : 0;

  // Bucket swing & water slosh
  const bucketSwing = isWalking ? Math.sin(t * walkSpeed) * 12 : isAction ? Math.sin(t * 12) * 18 : 0;
  const waterSlosh = Math.sin(t * (isWalking ? 14 : 3)) * (isWalking ? 6 : 2);

  // Aspergillum (sprinkler brush) raised high & dynamic swing
  const aspergillumAngle = isAction
    ? -40 + Math.sin(t * 14) * 45
    : isWalking
    ? 5 + walkCos * 8
    : pointer.isHovered
    ? pointer.y * 14
    : Math.sin(t * 2) * 4;

  // Holy water flying droplets
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
        <radialGradient id="kostelnikSkin" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF2E8" />
          <stop offset="65%" stopColor="#FBD4BD" />
          <stop offset="100%" stopColor="#E5A682" />
        </radialGradient>

        {/* Church Frock Coat Olive Gradient */}
        <linearGradient id="coatOliveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5D6B49" />
          <stop offset="50%" stopColor="#465335" />
          <stop offset="100%" stopColor="#2E3821" />
        </linearGradient>

        {/* Golden Holy Brass / Bronze Gradient */}
        <linearGradient id="holyBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#EAB308" />
          <stop offset="80%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        {/* Holy Water Crystal Gradient */}
        <linearGradient id="holyWater" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Fedora Hat Dark Felt */}
        <linearGradient id="fedoraFelt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#543C28" />
          <stop offset="60%" stopColor="#3C2A1B" />
          <stop offset="100%" stopColor="#22170D" />
        </linearGradient>

        {/* Trousers Tweed Brown */}
        <linearGradient id="tweedPants" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A6C50" />
          <stop offset="60%" stopColor="#694F37" />
          <stop offset="100%" stopColor="#453120" />
        </linearGradient>

        {/* Golden Cross Holy Shine Glow */}
        <filter id="crossGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        transform={`translate(230, 240) scale(${direction}, 1) translate(-230, -240)`}
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <ellipse
            cx={215}
            cy={445}
            rx={98 + (isWalking ? Math.sin(t * walkSpeed) * 6 : 0)}
            ry={17}
            fill="#1E293B"
            opacity="0.25"
          />
        )}

        {/* FLYING HOLY WATER DROPLETS */}
        {showParticles && (isAction || isWalking) && (
          <g className="holy-water-droplets">
            {droplets.map((d, i) => (
              <path
                key={i}
                d={`M ${d.x},${d.y} C ${d.x - 3},${d.y + 6} ${d.x + 3},${d.y + 6} ${d.x},${d.y} Z`}
                fill="#38BDF8"
                stroke="#1C1610"
                strokeWidth="1.2"
                opacity={d.op}
              />
            ))}
          </g>
        )}

        {/* ROOT BODY CONTAINER WITH MARCHING BOB */}
        <g transform={`translate(0, ${bobY}) rotate(${coatSway}, 210, 280)`}>

          {/* 1. BACK LEG (DETERMINED CHURCH STRIDE) */}
          <g transform={`translate(180, 275) rotate(${backLegAngle})`}>
            {/* Tweed trousers */}
            <path
              d="M -15,0 C -20,35 -24,70 -30,110 C -22,122 0,122 14,110 C 16,70 16,35 12,0 Z"
              fill="url(#tweedPants)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Polished Black Leather Boot */}
            <g transform="translate(-16, 110)">
              <path
                d="M -12,0 C -18,12 -30,22 -35,28 C -30,38 8,40 32,32 C 34,22 24,10 16,0 Z"
                fill="#1E293B"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <rect x="-32" y="26" width="16" height="8" fill="#0F172A" stroke="#1C1610" strokeWidth="2.5" />
              <path d="M -10,12 Q 10,18 26,14" stroke="#475569" strokeWidth="2" fill="none" />
            </g>
          </g>

          {/* 2. FRONT LEG (FIRM STEP FORWARD) */}
          <g transform={`translate(225, 275) rotate(${frontLegAngle})`}>
            {/* Tweed trousers */}
            <path
              d="M -12,0 C -5,35 5,75 18,110 C 30,122 52,118 48,102 C 34,70 20,35 14,0 Z"
              fill="url(#tweedPants)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Trouser crease */}
            <line x1="16" y1="20" x2="32" y2="105" stroke="#453120" strokeWidth="2.2" />

            {/* Solid Church Shoe with Tread */}
            <g transform="translate(24, 110)">
              <path
                d="M -10,0 C -5,14 10,25 38,30 C 50,30 58,22 54,12 C 45,5 30,0 16,-2 Z"
                fill="#1E293B"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M -6,18 Q 20,28 50,24" stroke="#475569" strokeWidth="2.5" fill="none" />
            </g>
          </g>

          {/* 3. PARISH VEST, WHITE COLLAR & LARGE GOLDEN CROSS */}
          <g id="kostelnik-torso" transform="translate(180, 150)">
            {/* Dark parish waistcoat/vest */}
            <path
              d="M -18,0 L -24,80 L 48,80 L 42,0 C 26,10 5,10 -18,0 Z"
              fill="#2A1B10"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Crisp White Shirt Collar peeking out */}
            <polygon points="-8,0 12,22 32,0 20,0 12,8 4,0" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.5" />

            {/* Neat Golden Buttons down waistcoat */}
            {[26, 44, 60, 74].map((by) => (
              <circle key={by} cx="12" cy={by} r="3" fill="url(#holyBrass)" stroke="#1C1610" strokeWidth="1.5" />
            ))}

            {/* PECTORAL GOLDEN LATIN CROSS (ZLATÝ KŘÍŽ NA HRUDI) */}
            <g transform="translate(12, 38)">
              {/* Chain around neck */}
              <path d="M -14,-32 Q 0,-20 0,0 M 14,-32 Q 0,-20 0,0" stroke="#CA8A04" strokeWidth="2" fill="none" />

              {/* Miracle Glow during action */}
              {isAction && (
                <ellipse cx="0" cy="8" rx="22" ry="24" fill="#FEF08A" filter="url(#crossGlow)" opacity="0.8" />
              )}

              {/* Golden Latin Cross */}
              <path
                d="M -4,-8 L 4,-8 L 4,-2 L 12,-2 L 12,4 L 4,4 L 4,24 L -4,24 L -4,4 L -12,4 L -12,-2 L -4,-2 Z"
                fill="url(#holyBrass)"
                stroke="#1C1610"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Cross center engraved shine */}
              <line x1="0" y1="-6" x2="0" y2="20" stroke="#FFFBEB" strokeWidth="1.5" />
              <line x1="-8" y1="1" x2="8" y2="1" stroke="#FFFBEB" strokeWidth="1.5" />
            </g>
          </g>

          {/* 4. DARK OLIVE-GREEN CHURCH FROCK COAT */}
          <g id="kostelnik-coat" transform="translate(180, 140)">
            {/* Coat body with tails */}
            <path
              d="M -42,10 C -52,50 -56,110 -35,135 C -15,125 15,125 35,130 C 58,135 72,110 65,10 C 45,0 -20,0 -42,10 Z"
              fill="url(#coatOliveGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Coat Lapels */}
            <path d="M -26,10 L -6,65 L 12,65 M 48,10 L 30,65 L 12,65" stroke="#1C1610" strokeWidth="3" fill="none" />
            {/* Coat Pocket flaps */}
            <rect x="-40" y="85" width="22" height="7" rx="2" fill="#2E3821" stroke="#1C1610" strokeWidth="2" />
            <rect x="36" y="85" width="22" height="7" rx="2" fill="#2E3821" stroke="#1C1610" strokeWidth="2" />
          </g>

          {/* 5. RIGHT HAND CARRYING HEAVY GOLDEN BRASS HOLY WATER BUCKET */}
          <g transform="translate(140, 205)">
            {/* Sleeve & Hand */}
            <path
              d="M 15,-10 C 2,15 -10,35 -14,50 C -8,58 6,56 12,48 C 18,35 24,15 28,-5 Z"
              fill="url(#coatOliveGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Hand grasping bucket handle */}
            <g transform="translate(-14, 52)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="url(#kostelnikSkin)" stroke="#1C1610" strokeWidth="2.8" />
              <line x1="-5" y1="-2" x2="5" y2="-2" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* HEAVY GOLDEN BRASS HOLY WATER BUCKET (KROPENKA) */}
            <g transform={`translate(-14, 52) rotate(${bucketSwing})`}>
              {/* Curved Brass Bail Handle */}
              <path
                d="M -26,38 C -28,10 0,0 26,38"
                stroke="url(#holyBrass)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M -26,38 C -28,10 0,0 26,38"
                stroke="#1C1610"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Bucket Body with Pedestal Foot */}
              <g transform="translate(0, 36)">
                {/* Sloshing Crystal Blue Holy Water */}
                <ellipse cx="0" cy="5" rx="22" ry={8 + waterSlosh * 0.4} fill="url(#holyWater)" stroke="#1C1610" strokeWidth="2" />

                {/* Golden Brass Vessel */}
                <path
                  d="M -25,5 C -28,35 -20,65 0,70 C 20,65 28,35 25,5 Z"
                  fill="url(#holyBrass)"
                  stroke="#1C1610"
                  strokeWidth="3.8"
                  strokeLinejoin="round"
                />

                {/* Molded Ring Rim */}
                <ellipse cx="0" cy="5" rx="25" ry="7" fill="none" stroke="#1C1610" strokeWidth="3" />

                {/* Pedestal Foot */}
                <path
                  d="M -12,70 L -16,84 L 16,84 L 12,70 Z"
                  fill="url(#holyBrass)"
                  stroke="#1C1610"
                  strokeWidth="3"
                />

                {/* Engraved Latin Cross on Bucket */}
                <g transform="translate(0, 38)">
                  <path
                    d="M -3,-12 L 3,-12 L 3,-4 L 10,-4 L 10,2 L 3,2 L 3,14 L -3,14 L -3,2 L -10,2 L -10,-4 L -3,-4 Z"
                    fill="#CA8A04"
                    stroke="#1C1610"
                    strokeWidth="1.8"
                  />
                </g>
              </g>
            </g>
          </g>

          {/* 6. LEFT ARM RAISED HIGH WIELDING THE ASPERGILLUM SPRINKLER */}
          <g transform={`translate(240, 175) rotate(${aspergillumAngle})`}>
            {/* Raised Sleeve */}
            <path
              d="M -5,-5 C 15,-25 45,-55 75,-78 C 84,-72 88,-60 76,-50 C 50,-30 25,-8 10,12 Z"
              fill="url(#coatOliveGrad)"
              stroke="#1C1610"
              strokeWidth="3.8"
            />
            {/* White shirt cuff */}
            <rect x="70" y="-76" width="12" height="15" rx="2" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" transform="rotate(-35 76 -68)" />

            {/* Hand firmly holding sprinkler */}
            <g transform="translate(82, -72)">
              <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#kostelnikSkin)" stroke="#1C1610" strokeWidth="2.8" />
              <line x1="-5" y1="-3" x2="3" y2="4" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* ORNATE GOLDEN ASPERGILLUM BRUSH (KROPÁČ) */}
            <g transform="translate(86, -74) rotate(45)">
              {/* Turned Handle */}
              <rect x="-3" y="0" width="6" height="42" rx="2" fill="url(#holyBrass)" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="0" cy="42" r="5" fill="url(#holyBrass)" stroke="#1C1610" strokeWidth="2" />

              {/* Sprinkler Ferrule & Bulb */}
              <circle cx="0" cy="-2" r="7" fill="url(#holyBrass)" stroke="#1C1610" strokeWidth="2.5" />

              {/* Fan of Stiff Sprinkler Bristles (Štětce kropáče) */}
              <path
                d="M -6,-2 C -18,-25 -28,-42 -22,-52 C -15,-58 15,-58 22,-52 C 28,-42 18,-25 6,-2 Z"
                fill="#FEF08A"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Bristle Straw Lines */}
              <line x1="-12" y1="-35" x2="-6" y2="-4" stroke="#D97706" strokeWidth="1.8" />
              <line x1="0" y1="-48" x2="0" y2="-4" stroke="#D97706" strokeWidth="1.8" />
              <line x1="12" y1="-35" x2="6" y2="-4" stroke="#D97706" strokeWidth="1.8" />
            </g>
          </g>

          {/* 7. STERN FACE, GREY MUSTACHE & FEDORA HAT */}
          <g id="kostelnik-head" transform="translate(205, 120)">
            {/* Grey Hair at Neck & Temples */}
            <path
              d="M -30,-8 C -36,8 -25,24 -12,28 C -5,28 10,24 20,18 C 14,8 10,-8 5,-15 Z"
              fill="#94A3B8"
              stroke="#1C1610"
              strokeWidth="3"
            />

            {/* Sturdy Flesh Face & Double Chin */}
            <path
              d="M -24,-15 C -28,-35 25,-35 28,-15 C 30,12 18,28 -5,30 C -22,28 -26,12 -24,-15 Z"
              fill="url(#kostelnikSkin)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />

            {/* Ear */}
            <ellipse cx="-24" cy="-8" rx="6" ry="8" fill="url(#kostelnikSkin)" stroke="#1C1610" strokeWidth="2.2" />

            {/* STERN FEATURES (EYES, MUSTACHE, RED NOSE) */}
            <g transform={`translate(${lookX}, ${lookY})`}>
              {/* Furrowed Stern Eyebrows (V-angled, righteous scowl) */}
              <path d="M -16,-22 Q -8,-24 0,-18" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 6,-18 Q 14,-24 22,-20" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />

              {/* Stern Glaring Dark Eyes */}
              <circle cx="-8" cy="-14" r="3.2" fill="#1C1610" />
              <circle cx="-9" cy="-15" r="1.1" fill="#FFFFFF" />
              <circle cx="12" cy="-14" r="3.2" fill="#1C1610" />
              <circle cx="11" cy="-15" r="1.1" fill="#FFFFFF" />

              {/* Round Bulbous Red Nose */}
              <ellipse cx="6" cy="-8" rx="7.5" ry="6.5" fill="#EF4444" stroke="#1C1610" strokeWidth="2.5" />
              <circle cx="8" cy="-10" r="1.8" fill="#FCA5A5" />

              {/* Rosy Red Cheeks */}
              <circle cx="-14" cy="-5" r="6.5" fill="#FB7185" opacity="0.5" />
              <circle cx="22" cy="-4" r="6.5" fill="#FB7185" opacity="0.5" />

              {/* BUSHY GREY PARISH MUSTACHE */}
              <path
                d="M -6,-2 C -18,2 -24,8 -18,14 C -10,12 -2,4 6,4 C 14,4 22,12 30,14 C 36,8 30,2 18,-2 C 10,0 2,0 -6,-2 Z"
                fill="#475569"
                stroke="#1C1610"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Firm Mouth below mustache & Double Chin */}
              <path d="M -2,16 Q 6,19 14,16" stroke="#1C1610" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M -8,25 Q 4,32 16,25" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* DARK BROWN PARISH FEDORA HAT */}
            <g transform="translate(0, -32) rotate(-6)">
              {/* Fedora Crown with Crease */}
              <path
                d="M -28,0 C -32,-35 -15,-48 0,-50 C 15,-48 30,-32 28,0 Z"
                fill="url(#fedoraFelt)"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              {/* Crown top indentation pinch */}
              <path d="M -14,-38 Q 0,-30 14,-38" stroke="#1C1610" strokeWidth="2.5" fill="none" />

              {/* Fedora Brim with Curled Back */}
              <path
                d="M -46,0 C -20,-10 25,-10 48,0 C 54,4 48,10 38,10 C 15,6 -20,6 -40,10 C -48,8 -48,2 -46,0 Z"
                fill="#3C2A1B"
                stroke="#1C1610"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Black Ribbon Hatband */}
              <path
                d="M -26,-2 C -10,-8 10,-8 26,-2 L 27,4 C 10,-2 -10,-2 -26,4 Z"
                fill="#0F172A"
                stroke="#1C1610"
                strokeWidth="2"
              />
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
};
