import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartBabickaBarunkaSvg - Interactive smart vector SVG animation
 * Faithfully inspired by classic Czech fairy tale & folklore illustrations of Babička a Barunka by Josef Lada
 * Features:
 * - Babička in white kerchief with authentic blue four-leaf clover border embroidery, black woolen shawl with rich fringe tassels
 * - Rust-orange buttoned vest, sturdy hazel walking cane in right hand
 * - Gathered royal blue vertically striped apron with kangaroo pocket holding golden bread loaf, checkered napkin & herbs
 * - Babička's left hand lovingly reaching into the apron pouch
 * - Dark brown pleated peasant skirt and dark sturdy shoes
 * - Barunka beside her with brown platted side-braid & fluttering red bow
 * - Puffed white blouse, red folk bodice, crisp white apron over dark blue skirt with white floral dots
 * - Holding in both hands a lush meadow bouquet of blue cornflowers, white daisies & yellow buttercups
 * - Tan-brown lace-up ankle boots with stride kinematics
 * - Miracle action "Laskavý zázrak" with golden glow & drifting flower petals
 * - Equal sizing: baseline y=435, head height ~351px matching Tulák & Krajánek
 */
export const SmartBabickaBarunkaSvg: React.FC<SmartCharacterProps> = ({
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
    showCompanion = true,
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
  const walkSpeed = isFleeing ? 17.5 : isSprinting ? 13.5 : isWalking ? 7.5 : isReact ? 22 : 2.2;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Babička walking / sprinting / startled / fleeing stride and cane motion
  const grannyBobY = isFleeing
    ? -Math.abs(walkSin) * 16
    : isSprinting
    ? -Math.abs(walkSin) * 12
    : isWalking
    ? -Math.abs(walkSin) * 7
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 12 - 5
    : Math.sin(t * 2.2) * 2;
  const grannySway = isFleeing
    ? 14 + walkSin * 4.5
    : isSprinting
    ? 10 + walkSin * 3.5
    : isWalking
    ? 4 + walkCos * 2.5
    : isReact
    ? -13 + Math.sin(t * 26) * 4
    : 0;
  const caneTapAngle = isFleeing
    ? -58 + Math.sin(t * 22) * 28
    : isReact
    ? -38 + Math.sin(t * 26) * 14
    : isSprinting
    ? Math.sin(t * walkSpeed) * 22
    : isWalking
    ? Math.sin(t * walkSpeed) * 12
    : Math.sin(t * 1.5) * 1.5;

  // Articulated foot stride for Babička's shoes (only moves when actively moving)
  const grannyStrideAmp = isMoving ? (isFleeing ? 24 : isSprinting ? 18 : 11) : 0;
  const grannyLeftShoeX = -28 + (isMoving ? walkSin * grannyStrideAmp : 0);
  const grannyLeftShoeY = 36 - (isMoving ? Math.max(0, walkCos) * (grannyStrideAmp * 0.55) : 0);
  const grannyLeftShoeRot = isMoving ? walkSin * (isFleeing ? 26 : isSprinting ? 20 : 12) : 0;
  const grannyRightShoeX = 28 - (isMoving ? walkSin * grannyStrideAmp : 0);
  const grannyRightShoeY = 36 - (isMoving ? Math.max(0, -walkCos) * (grannyStrideAmp * 0.55) : 0);
  const grannyRightShoeRot = isMoving ? -walkSin * (isFleeing ? 26 : isSprinting ? 20 : 12) : 0;

  // Barunka skipping / sprinting / startled / fleeing and braid bounce
  const barunkaSin = Math.sin(t * walkSpeed * 1.15 + 0.4);
  const barunkaCos = Math.cos(t * walkSpeed * 1.15 + 0.4);
  const barunkaBobY = isFleeing
    ? -Math.abs(barunkaSin) * 19
    : isSprinting
    ? -Math.abs(barunkaSin) * 14
    : isWalking
    ? -Math.abs(barunkaSin) * 9
    : isReact
    ? -Math.abs(Math.sin(t * 15)) * 14 - 6
    : Math.sin(t * 2.5 + 0.5) * 2.5;
  const barunkaSway = isFleeing
    ? 16 + barunkaSin * 5
    : isSprinting
    ? 12 + barunkaSin * 4
    : isWalking
    ? 5 + barunkaCos * 2.5
    : isReact
    ? -15 + Math.cos(t * 26) * 4.5
    : 0;
  const braidWave = isFleeing
    ? -36 + Math.sin(t * 24) * 22
    : isSprinting
    ? -24 + Math.sin(t * 18) * 18
    : isReact
    ? 22 + Math.sin(t * 28) * 14
    : Math.sin(t * (isWalking ? 12 : 2.8)) * (isWalking ? 14 : 4);
  const bouquetLift = isFleeing
    ? -28 + Math.sin(t * 22) * 14
    : isReact
    ? -18 + Math.sin(t * 26) * 8
    : isAction
    ? -15 + Math.sin(t * 8) * 6
    : isMoving
    ? Math.sin(t * walkSpeed) * 5
    : 0;

  // Articulated boot stride for Barunka (only moves when actively moving)
  const barunkaStrideAmp = isMoving ? (isFleeing ? 22 : isSprinting ? 17 : 11) : 0;
  const barunkaLeftBootX = -15 + (isMoving ? barunkaSin * barunkaStrideAmp : 0);
  const barunkaLeftBootY = -(isMoving ? Math.max(0, barunkaCos) * (barunkaStrideAmp * 0.65) : 0);
  const barunkaLeftBootRot = isMoving ? barunkaSin * (isFleeing ? 30 : isSprinting ? 22 : 14) : 0;
  const barunkaRightBootX = 15 - (isMoving ? barunkaSin * barunkaStrideAmp : 0);
  const barunkaRightBootY = -(isMoving ? Math.max(0, -barunkaCos) * (barunkaStrideAmp * 0.65) : 0);
  const barunkaRightBootRot = isMoving ? -barunkaSin * (isFleeing ? 30 : isSprinting ? 22 : 14) : 0;

  // Eye gaze tracking
  const gazeX = isReact ? -2 + Math.sin(t * 28) * 1.2 : isFleeing ? 2.5 : pointer.isHovered ? pointer.x * 4 : Math.sin(t * 1.2) * 1.2;
  const gazeY = isReact ? -2 : isFleeing ? -1 : pointer.isHovered ? pointer.y * 3.5 : 0;

  // Sweat droplets for react (startled by bubák) and flee (zero courage)
  const sweatDrops = [
    { x: 125 - ((t * 105) % 38), y: 80 + ((t * 80) % 36), r: 4.0 },
    { x: 215 + ((t * 100 + 14) % 38), y: 75 + ((t * 85 + 10) % 36), r: 3.6 },
    { x: 305 - ((t * 110 + 10) % 34), y: 150 + ((t * 78 + 15) % 34), r: 3.5 },
    { x: 375 + ((t * 115 + 22) % 36), y: 145 + ((t * 82 + 20) % 34), r: 3.5 },
  ];

  // Holy bread aura & floating flower petals
  const holyAuraScale = isAction ? 1 + Math.sin(t * 10) * 0.15 : 0;
  const petals = [
    { x: 330 + Math.sin(t * 3 + 1) * 25, y: 160 + ((t * 40) % 130), col: '#3B82F6', r: 3 },
    { x: 355 + Math.cos(t * 2.8 + 2) * 30, y: 140 + ((t * 48 + 40) % 150), col: '#FACC15', r: 3.5 },
    { x: 310 + Math.sin(t * 3.5 + 3) * 20, y: 180 + ((t * 35 + 80) % 120), col: '#FFFFFF', r: 3 },
    { x: 365 + Math.cos(t * 3.2 + 4) * 25, y: 150 + ((t * 52 + 100) % 140), col: '#F43F5E', r: 2.8 },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 480 480"
      width={size}
      height={size}
      className={`smart-babicka-barunka-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaná Babička s vnučkou Barunkou"
    >
      <defs>
        {/* Soft Skin Tones */}
        <radialGradient id="grannySkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF1E6" />
          <stop offset="60%" stopColor="#FAD8C0" />
          <stop offset="100%" stopColor="#E9B996" />
        </radialGradient>

        <radialGradient id="barunkaSkinGrad" cx="42%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF5ED" />
          <stop offset="60%" stopColor="#FDE2D0" />
          <stop offset="100%" stopColor="#F8BA9A" />
        </radialGradient>

        {/* Fringed Black Woolen Shawl */}
        <linearGradient id="shawlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F3935" />
          <stop offset="50%" stopColor="#2E2824" />
          <stop offset="100%" stopColor="#1B1613" />
        </linearGradient>

        {/* Royal Blue Peasant Apron */}
        <linearGradient id="apronBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Crusty Bohemian Country Bread */}
        <radialGradient id="breadCrustGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="85%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#5C2508" />
        </radialGradient>

        {/* Miracle Glow Filter */}
        <filter id="holyGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Red & White Checkered Cloth Pattern */}
        <pattern id="checkeredCloth" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#DC2626" />
          <rect x="4" width="4" height="4" fill="#FFFFFF" />
          <rect y="4" width="4" height="4" fill="#FFFFFF" />
          <rect x="4" y="4" width="4" height="4" fill="#DC2626" />
        </pattern>

        {/* Wooden Walking Cane */}
        <linearGradient id="caneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B4723E" />
          <stop offset="50%" stopColor="#8A4E20" />
          <stop offset="100%" stopColor="#5C3110" />
        </linearGradient>
      </defs>

      <g
        transform={`translate(240, 240) scale(${direction}, 1) translate(-240, -240)`}
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <g opacity="0.25">
            {/* Granny Shadow */}
            <ellipse cx={170} cy={445} rx={85} ry={16} fill="#1E293B" />
            {/* Barunka Shadow */}
            {showCompanion && <ellipse cx={340} cy={445} rx={50} ry={13} fill="#1E293B" />}
          </g>
        )}

        {/* FLOATING FLOWER PETALS (ACTION / HAPPINESS) */}
        {showParticles && (isAction || isReact) && (
          <g className="floating-petals">
            {petals.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={p.col}
                stroke="#1C1610"
                strokeWidth="1.2"
                opacity="0.85"
              />
            ))}
          </g>
        )}

        {/* ======================================================== */}
        {/* BABIČKA (MAIN CHARACTER)                                  */}
        {/* ======================================================== */}
        <g
          id="babicka"
          transform={`translate(0, ${grannyBobY}) rotate(${grannySway}, 180, 260)`}
        >
          {/* 1. BROWN PEASANT SKIRT (BOTTOM HEM & ARTICULATED SHOES) */}
          <g transform="translate(170, 400)">
            {/* Articulated Shoes stepping with stride */}
            <g
              id="granny-left-shoe"
              transform={`translate(${grannyLeftShoeX}, ${grannyLeftShoeY}) rotate(${grannyLeftShoeRot})`}
            >
              <ellipse cx="0" cy="0" rx="20" ry="11" fill="#3B2219" stroke="#1C1610" strokeWidth="3" />
              <ellipse cx="4" cy="-2" rx="6" ry="3.5" fill="#C2410C" stroke="#1C1610" strokeWidth="1.5" />
            </g>
            <g
              id="granny-right-shoe"
              transform={`translate(${grannyRightShoeX}, ${grannyRightShoeY}) rotate(${grannyRightShoeRot})`}
            >
              <ellipse cx="0" cy="0" rx="20" ry="11" fill="#3B2219" stroke="#1C1610" strokeWidth="3" />
              <ellipse cx="4" cy="-2" rx="6" ry="3.5" fill="#C2410C" stroke="#1C1610" strokeWidth="1.5" />
            </g>

            {/* Pleated dark brown skirt hem matching Image 1 */}
            <path
              d="M -75,0 C -50,15 50,15 75,0 L 78,32 C 50,42 -50,42 -78,32 Z"
              fill="#422C1D"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Vertical skirt pleats swaying with stride (only when moving) */}
            <line x1="-50" y1="5" x2={-52 + (isMoving ? walkSin * 4 : 0)} y2="35" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="-25" y1="8" x2={-26 + (isMoving ? walkSin * 4 : 0)} y2="38" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="0" y1="10" x2={isMoving ? walkSin * 4 : 0} y2="39" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="25" y1="8" x2={26 + (isMoving ? walkSin * 4 : 0)} y2="38" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="50" y1="5" x2={52 + (isMoving ? walkSin * 4 : 0)} y2="35" stroke="#2B1A0E" strokeWidth="2.5" />
          </g>

          {/* 2. WOODEN WALKING CANE IN RIGHT HAND (matching Image 1) */}
          <g transform={`translate(82, 175) rotate(${caneTapAngle})`}>
            {/* Long sturdy straight wooden cane */}
            <rect
              x="-5"
              y="0"
              width="10"
              height="268"
              rx="4"
              fill="url(#caneGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Cane grain rings */}
            <line x1="-3" y1="50" x2="3" y2="52" stroke="#451A03" strokeWidth="2" />
            <line x1="-3" y1="120" x2="3" y2="122" stroke="#451A03" strokeWidth="2" />
            <line x1="-3" y1="190" x2="3" y2="192" stroke="#451A03" strokeWidth="2" />
          </g>

          {/* 3. BIG BLUE STRIPED APRON WITH SIGNATURE KANGAROO POUCH (matching Image 1) */}
          <g id="granny-apron" transform="translate(170, 220)">
            {/* Full Blue Pleated Apron */}
            <path
              d="M -58,0 C -78,75 -88,145 -78,195 C -45,212 45,212 78,195 C 88,145 78,75 58,0 Z"
              fill="url(#apronBlueGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Apron Vertical Blue Stripes */}
            {[-55, -40, -25, -10, 5, 20, 35, 50].map((xOffset) => (
              <line
                key={xOffset}
                x1={xOffset * 0.8}
                y1="5"
                x2={xOffset * 1.3}
                y2="195"
                stroke="#1E3A8A"
                strokeWidth="4"
                opacity="0.8"
              />
            ))}

            {/* SIGNATURE GATHERED POUCH / POCKET IN FRONT (KANGAROO POCKET) */}
            <g transform="translate(0, 48)">
              {/* Pocket Body & Outline */}
              <path
                d="M -48,-10 C -56,50 -48,95 0,98 C 48,95 56,50 48,-10 C 25,-4 -25,-4 -48,-10 Z"
                fill="#2563EB"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              {/* Pocket vertical stripes */}
              {[-32, -16, 0, 16, 32].map((px) => (
                <line
                  key={px}
                  x1={px}
                  y1="5"
                  x2={px * 1.1}
                  y2="92"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                />
              ))}

              {/* CONTENTS OF THE POUCH: BREAD, CHECKERED CLOTH, HERBS */}
              {/* Red & White Checkered Cloth Peeking Out */}
              <path
                d="M -15,-5 C -25,-35 -4,-40 6,-30 C 14,-22 10,-5 8,0 Z"
                fill="url(#checkeredCloth)"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Fresh Herbal Sprigs & Wildflowers peeking out */}
              <g transform="translate(18, -12)">
                <path d="M 0,0 Q 8,-22 18,-28 M 4,-12 Q 18,-18 25,-12 M -2,-6 Q 10,-32 4,-38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="-28" r="3.2" fill="#FACC15" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="25" cy="-12" r="3.2" fill="#60A5FA" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="4" cy="-38" r="3.2" fill="#FDE047" stroke="#1C1610" strokeWidth="1.2" />
              </g>

              {/* CRUSTY GOLDEN BREAD LOAF (PECEN CHLEBA) */}
              <g transform="translate(-20, -18)">
                {/* Holy Miracle Glow during action */}
                {isAction && (
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={28 * holyAuraScale}
                    ry={20 * holyAuraScale}
                    fill="#FEF08A"
                    filter="url(#holyGlow)"
                    opacity="0.7"
                  />
                )}
                {/* Bread loaf crust */}
                <ellipse cx="0" cy="0" rx="20" ry="14" fill="url(#breadCrustGrad)" stroke="#1C1610" strokeWidth="3" />
                {/* Flour dusting and baker's crust cut slits */}
                <path d="M -10,-4 Q 0,-2 10,-4 M -8,3 Q 0,5 8,3" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* BABIČKA'S LEFT HAND REACHING DOWN INTO THE POUCH (matching Image 1) */}
              <g transform="translate(32, -6)">
                <ellipse cx="0" cy="0" rx="9" ry="8" fill="url(#grannySkinGrad)" stroke="#1C1610" strokeWidth="2.5" />
                <line x1="-3" y1="-3" x2="-3" y2="4" stroke="#1C1610" strokeWidth="1.8" />
                <line x1="2" y1="-3" x2="2" y2="4" stroke="#1C1610" strokeWidth="1.8" />
              </g>
            </g>
          </g>

          {/* 4. RUST-ORANGE BODICE / VEST WITH BUTTONS (matching Image 1) */}
          <g id="granny-bodice" transform="translate(170, 150)">
            <path
              d="M -35,0 C -42,35 -48,70 -42,75 C -15,80 15,80 42,75 C 48,70 42,35 35,0 Z"
              fill="#C2410C"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Center closure row */}
            <line x1="0" y1="0" x2="0" y2="76" stroke="#1C1610" strokeWidth="2.5" />
            {/* Dark rustic buttons */}
            {[12, 24, 36, 48, 60, 70].map((btnY) => (
              <circle key={btnY} cx="0" cy={btnY} r="3" fill="#18181B" stroke="#1C1610" strokeWidth="1.5" />
            ))}
          </g>

          {/* 5. BLACK WOOLEN SHAWL WITH FRINGE TASSELS (matching Image 1) */}
          <g id="granny-shawl" transform="translate(170, 125)">
            {/* Shawl draped across shoulders */}
            <path
              d="M -68,25 C -75,65 -80,125 -68,145 C -45,115 -25,95 0,95 C 25,95 45,115 68,145 C 80,125 75,65 68,25 C 48,15 -48,15 -68,25 Z"
              fill="url(#shawlGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Shawl Fringe Tassels along the entire hem and sleeves */}
            {[-70, -58, -46, -34, -22, -10, 2, 14, 26, 38, 50, 62, 72].map((tasselX, idx) => (
              <line
                key={idx}
                x1={tasselX}
                y1={idx < 2 || idx > 10 ? 142 : 98 + Math.abs(tasselX) * 0.4}
                x2={tasselX * 1.05}
                y2={idx < 2 || idx > 10 ? 162 : 118 + Math.abs(tasselX) * 0.4}
                stroke="#18181B"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            ))}

            {/* Right hand grasping walking cane */}
            <g transform="translate(-78, 52)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="url(#grannySkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
              <path d="M -5,-3 Q 0,-6 5,-3" stroke="#1C1610" strokeWidth="2" fill="none" />
            </g>
          </g>

          {/* 6. BABIČKA'S HEAD, KERCHIEF & KIND SMILING FACE */}
          <g id="granny-head" transform="translate(170, 115)">
            {/* White Kerchief (Šátek) tied under chin */}
            <path
              d="M -44,-8 C -48,-48 -35,-80 0,-84 C 35,-80 48,-48 44,-8 C 30,22 12,28 0,30 C -12,28 -30,22 -44,-8 Z"
              fill="#FFFFFF"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Blue clover embroidery pattern along kerchief fold and perimeter (matching Image 1) */}
            <g className="kerchief-clover-embroidery" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="0.8">
              {/* Left rim clovers */}
              <circle cx="-38" cy="-18" r="2.2" />
              <circle cx="-42" cy="-32" r="2.2" />
              <circle cx="-40" cy="-48" r="2.2" />
              <circle cx="-30" cy="-62" r="2.2" />
              <circle cx="-16" cy="-74" r="2.2" />
              {/* Right rim clovers */}
              <circle cx="38" cy="-18" r="2.2" />
              <circle cx="42" cy="-32" r="2.2" />
              <circle cx="40" cy="-48" r="2.2" />
              <circle cx="30" cy="-62" r="2.2" />
              <circle cx="16" cy="-74" r="2.2" />
              {/* Top center clover */}
              <circle cx="0" cy="-78" r="2.5" />
            </g>

            {/* Tied Knot under Chin */}
            <g transform={`translate(0, 26) rotate(${isMoving || isReact ? Math.sin(t * 20) * 14 : 0})`}>
              <ellipse cx="0" cy="0" rx="7" ry="5" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2.5" />
              <path d="M -6,2 L -14,14 L -4,12 Z" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2" />
              <path d="M 6,2 L 14,14 L 4,12 Z" fill="#F8FAFC" stroke="#1C1610" strokeWidth="2" />
            </g>

            {/* Friendly Round Face */}
            <path
              d="M -26,-15 C -28,-38 28,-38 26,-15 C 24,12 -24,12 -26,-15 Z"
              fill="url(#grannySkinGrad)"
              stroke="#1C1610"
              strokeWidth="3.2"
            />

            {/* White Hair peeking out neatly parted in middle */}
            <path
              d="M -24,-32 C -18,-42 0,-38 0,-38 C 0,-38 18,-42 24,-32 C 16,-34 -16,-34 -24,-32 Z"
              fill="#E2E8F0"
              stroke="#1C1610"
              strokeWidth="2.5"
            />

            {/* Gentle Eyes, Wrinkles & Rosy Cheeks */}
            <g transform={`translate(${gazeX}, ${gazeY})`}>
              {/* Kind Eyebrows */}
              <path
                d={isReact || isFleeing ? 'M -19,-28 Q -12,-35 -4,-29' : 'M -18,-24 Q -12,-30 -4,-25'}
                stroke="#78716C"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={isReact || isFleeing ? 'M 4,-29 Q 12,-35 19,-28' : 'M 4,-25 Q 12,-30 18,-24'}
                stroke="#78716C"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Sparkling Kind Dark Eyes */}
              {(isReact || isFleeing) && (
                <>
                  <circle cx="-10" cy="-18" r="5.5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />
                  <circle cx="10" cy="-18" r="5.5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />
                </>
              )}
              <circle cx="-10" cy="-18" r={isReact || isFleeing ? 2.2 : 3.2} fill="#1C1610" />
              <circle cx="-11" cy="-19" r="1.1" fill="#FFFFFF" />
              <circle cx="10" cy="-18" r={isReact || isFleeing ? 2.2 : 3.2} fill="#1C1610" />
              <circle cx="9" cy="-19" r="1.1" fill="#FFFFFF" />

              {/* Gentle Crows Feet / Smile Wrinkles */}
              <path d="M -18,-19 L -23,-21 M -18,-17 L -23,-16 M -18,-15 L -22,-13" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 18,-19 L 23,-21 M 18,-17 L 23,-16 M 18,-15 L 22,-13" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />

              {/* Button Grandmother Nose */}
              <path d="M -3,-14 Q 0,-10 3,-14" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Warm Rosy Cheeks */}
              <circle cx="-16" cy="-10" r="5.5" fill="#FB7185" opacity="0.45" />
              <circle cx="16" cy="-10" r="5.5" fill="#FB7185" opacity="0.45" />

              {/* Mouth: Warm Benevolent Smile */}
              {isFleeing ? (
                <ellipse cx="0" cy="-1" rx="7" ry="6.5" fill="#7F1D1D" stroke="#1C1610" strokeWidth="2.5" />
              ) : isReact ? (
                <ellipse cx="0" cy="-1" rx="5.2" ry="5.5" fill="#7F1D1D" stroke="#1C1610" strokeWidth="2.5" />
              ) : (
                <>
                  <path d="M -10,-2 Q 0,8 10,-2" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M -11,-3 L -13,-1 M 11,-3 L 13,-1" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* BARUNKA (GRANDDAUGHTER COMPANION)                        */}
        {/* ======================================================== */}
        {showCompanion && (
          <g
            id="barunka"
            transform={`translate(0, ${barunkaBobY}) rotate(${barunkaSway}, 340, 320)`}
          >
            {/* 1. BROWN LEATHER LACE-UP BOOTS (Articulated Stride) */}
            <g transform="translate(340, 405)">
              {/* Left Boot */}
              <g
                id="barunka-left-boot"
                transform={`translate(${barunkaLeftBootX}, ${barunkaLeftBootY}) rotate(${barunkaLeftBootRot})`}
              >
                {/* White stocking */}
                <rect x="-6" y="-12" width="12" height="14" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />
                {/* Boot */}
                <path d="M -7,0 L 7,0 L 8,26 L 16,30 L 14,35 L -7,35 Z" fill="#854D0E" stroke="#1C1610" strokeWidth="3" strokeLinejoin="round" />
                <line x1="-2" y1="8" x2="4" y2="8" stroke="#1C1610" strokeWidth="1.8" />
                <line x1="-2" y1="16" x2="4" y2="16" stroke="#1C1610" strokeWidth="1.8" />
              </g>
              {/* Right Boot */}
              <g
                id="barunka-right-boot"
                transform={`translate(${barunkaRightBootX}, ${barunkaRightBootY}) rotate(${barunkaRightBootRot})`}
              >
                <rect x="-6" y="-12" width="12" height="14" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2" />
                <path d="M -7,0 L 7,0 L 7,35 L -14,35 L -16,30 L -8,26 Z" fill="#854D0E" stroke="#1C1610" strokeWidth="3" strokeLinejoin="round" />
                <line x1="-4" y1="8" x2="2" y2="8" stroke="#1C1610" strokeWidth="1.8" />
                <line x1="-4" y1="16" x2="2" y2="16" stroke="#1C1610" strokeWidth="1.8" />
              </g>
            </g>

            {/* 2. DARK BLUE FOLK SKIRT WITH EMBROIDERED HEM (matching Image 1) */}
            <g id="barunka-skirt" transform="translate(340, 290)">
              <path
                d="M -32,0 C -45,45 -54,85 -48,115 C -25,124 25,124 48,115 C 54,85 45,45 32,0 Z"
                fill="#1D4ED8"
                stroke="#1C1610"
                strokeWidth={showOutline ? "4" : "3"}
                strokeLinejoin="round"
              />
              {/* White folk dots along bottom rim (matching Image 1) */}
              {[-38, -26, -14, 0, 14, 26, 38].map((dx, i) => (
                <g key={i} transform={`translate(${dx}, 108)`}>
                  <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
                  <circle cx="0" cy="-4" r="1.2" fill="#FFFFFF" />
                </g>
              ))}

              {/* CRISP WHITE APRON OVER SKIRT */}
              <path
                d="M -22,0 C -26,35 -30,75 -24,98 C -12,102 12,102 24,98 C 30,75 26,35 22,0 Z"
                fill="#FFFFFF"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
            </g>

            {/* 3. WHITE BLOUSE & RED FOLK BODICE (matching Image 1) */}
            <g id="barunka-torso" transform="translate(340, 230)">
              {/* White Puffed Sleeves with frilled cuffs */}
              <ellipse cx="-28" cy="18" rx="14" ry="12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="3" />
              <ellipse cx="28" cy="18" rx="14" ry="12" fill="#FFFFFF" stroke="#1C1610" strokeWidth="3" />

              {/* Red Folk Bodice */}
              <path
                d="M -22,0 L -25,60 L 25,60 L 22,0 C 14,8 -14,8 -22,0 Z"
                fill="#DC2626"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* White Blouse Ruffled Neckline */}
              <path d="M -16,0 Q 0,10 16,0" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* 4. LONG BRAIDED HAIR WITH BRIGHT RED RIBBON BOW (matching Image 1) */}
            <g id="barunka-braid" transform={`translate(366, 210) rotate(${braidWave})`}>
              {/* Platted Braid Structure */}
              <path
                d="M -6,0 C 2,15 -8,30 -2,45 C 4,60 -6,75 0,90 L -2,95 L -8,90 C -14,75 -4,60 -10,45 C -16,30 -6,15 -12,0 Z"
                fill="#5C3110"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Plait strand lines */}
              <line x1="-10" y1="20" x2="0" y2="35" stroke="#381D07" strokeWidth="2" />
              <line x1="-2" y1="35" x2="-8" y2="50" stroke="#381D07" strokeWidth="2" />
              <line x1="-8" y1="50" x2="0" y2="65" stroke="#381D07" strokeWidth="2" />

              {/* BRIGHT RED RIBBON BOW (ČERVENÁ MAŠLIČKA) */}
              <g transform="translate(-4, 92)">
                <ellipse cx="-7" cy="0" rx="7" ry="4" fill="#EF4444" stroke="#1C1610" strokeWidth="2" />
                <ellipse cx="7" cy="0" rx="7" ry="4" fill="#EF4444" stroke="#1C1610" strokeWidth="2" />
                <circle cx="0" cy="0" r="3.2" fill="#B91C1C" stroke="#1C1610" strokeWidth="1.8" />
                <path d="M -2,3 L -6,14 M 2,3 L 6,14" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            {/* 5. WILDFLOWER MEADOW BOUQUET (HELD IN BOTH HANDS - matching Image 1) */}
            <g id="barunka-bouquet" transform={`translate(338, 255) translate(0, ${bouquetLift})`}>
              {/* Green Stems gathered together */}
              <path d="M -8,18 L -3,35 M 0,18 L 0,36 M 8,18 L 3,35" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />

              {/* Child Hands Holding Bouquet */}
              <ellipse cx="-15" cy="24" rx="6" ry="5" fill="url(#barunkaSkinGrad)" stroke="#1C1610" strokeWidth="2" />
              <ellipse cx="15" cy="24" rx="6" ry="5" fill="url(#barunkaSkinGrad)" stroke="#1C1610" strokeWidth="2" />

              {/* Rich Meadow Flowers: Cornflowers, Daisies, Buttercups matching Image 1 */}
              {/* Blue Cornflowers (Chrpy) */}
              <g transform="translate(-12, 0)">
                <polygon points="0,-12 4,-4 10,-8 5,0 12,4 4,5 6,12 0,6 -6,12 -4,5 -12,4 -5,0 -10,-8 -4,-4" fill="#2563EB" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#1E3A8A" />
              </g>
              <g transform="translate(14, -8)">
                <polygon points="0,-10 3,-3 8,-6 4,0 10,3 3,4 5,10 0,5 -5,10 -3,4 -10,3 -4,0 -8,-6 -3,-3" fill="#3B82F6" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#1D4ED8" />
              </g>
              <g transform="translate(6, 6)">
                <polygon points="0,-8 2,-2 7,-4 3,0 8,3 2,3 4,7 0,4 -4,7 -2,3 -8,3 -3,0 -7,-4 -2,-2" fill="#2563EB" stroke="#1C1610" strokeWidth="1.2" />
              </g>

              {/* White Daisies (Kopretiny) with golden center */}
              <g transform="translate(0, -6)">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                  <ellipse key={ang} cx="0" cy="0" rx="3" ry="8" transform={`rotate(${ang}) translate(0, -6)`} fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.2" />
                ))}
                <circle cx="0" cy="0" r="4.5" fill="#FACC15" stroke="#1C1610" strokeWidth="1.5" />
              </g>

              {/* Yellow Buttercups (Pryskyřníky) */}
              <circle cx="-6" cy="-14" r="5" fill="#FDE047" stroke="#1C1610" strokeWidth="1.5" />
              <circle cx="-6" cy="-14" r="2" fill="#EAB308" />
              <circle cx="-14" cy="8" r="4.5" fill="#FDE047" stroke="#1C1610" strokeWidth="1.5" />
            </g>

            {/* 6. BARUNKA'S SWEET SMILING HEAD */}
            <g id="barunka-head" transform="translate(340, 180)">
              {/* Back Hair Mass */}
              <ellipse cx="0" cy="-6" rx="25" ry="24" fill="#5C3110" stroke="#1C1610" strokeWidth="3.5" />

              {/* Round Cheerful Face */}
              <ellipse cx="0" cy="0" rx="20" ry="19" fill="url(#barunkaSkinGrad)" stroke="#1C1610" strokeWidth="3.2" />

              {/* Neat Brown Hair parting and bangs */}
              <path
                d="M -20,-6 C -15,-20 0,-24 0,-24 C 0,-24 15,-20 20,-6 C 12,-14 -12,-14 -20,-6 Z"
                fill="#5C3110"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Cute Eyes, Rosy Cheeks & Sweet Smile */}
              <g transform={`translate(${gazeX * 1.2}, ${gazeY * 1.2})`}>
                {/* Thin Eyebrows */}
                <path
                  d={isReact || isFleeing ? 'M -15,-12 Q -9,-18 -4,-13' : 'M -14,-9 Q -9,-14 -4,-10'}
                  stroke="#381D07"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={isReact || isFleeing ? 'M 4,-13 Q 9,-18 15,-12' : 'M 4,-10 Q 9,-14 14,-9'}
                  stroke="#381D07"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Big Sparkling Dark Eyes */}
                {(isReact || isFleeing) && (
                  <>
                    <circle cx="-8" cy="-4" r="5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.8" />
                    <circle cx="8" cy="-4" r="5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.8" />
                  </>
                )}
                <circle cx="-8" cy="-4" r={isReact || isFleeing ? 2 : 3.2} fill="#1C1610" />
                <circle cx="-9" cy="-5" r="1.1" fill="#FFFFFF" />
                <circle cx="8" cy="-4" r={isReact || isFleeing ? 2 : 3.2} fill="#1C1610" />
                <circle cx="7" cy="-5" r="1.1" fill="#FFFFFF" />

                {/* Button Nose */}
                <circle cx="0" cy="1" r="1.5" fill="#E09F80" />

                {/* Cute Rosy Cheeks */}
                <circle cx="-13" cy="3" r="5" fill="#FB7185" opacity="0.55" />
                <circle cx="13" cy="3" r="5" fill="#FB7185" opacity="0.55" />

                {/* Sweet Childish Smile */}
                {isFleeing ? (
                  <ellipse cx="0" cy="9" rx="6" ry="5.5" fill="#881337" stroke="#1C1610" strokeWidth="2.2" />
                ) : isReact ? (
                  <ellipse cx="0" cy="8" rx="4.5" ry="5" fill="#881337" stroke="#1C1610" strokeWidth="2.2" />
                ) : (
                  <path d="M -7,6 Q 0,13 7,6" stroke="#1C1610" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                )}
              </g>
            </g>
          </g>
        )}

        {/* SPRINT & FLEE DUST PUFFS BEHIND BABIČKA & BARUNKA */}
        {(isSprinting || isFleeing) && showParticles && (
          <g id="granny-sprint-dust">
            {[0, 1, 2].map((i) => {
              const phase = (t * (isFleeing ? 4.2 : 3.0) + i * 0.33) % 1;
              const dx = 105 - phase * 55 - i * 10;
              const dy = 442 - Math.sin(phase * Math.PI) * 14 - i * 3;
              const rad = (1 - phase * 0.5) * (isFleeing ? 13 : 9);
              return (
                <g key={`gr-dust-${i}`}>
                  <circle
                    cx={dx}
                    cy={dy}
                    r={rad}
                    fill="#E7E5E4"
                    stroke="#1C1610"
                    strokeWidth="2"
                    opacity={Math.max(0.15, 0.72 * (1 - phase))}
                  />
                  {showCompanion && (
                    <circle
                      cx={dx + 190}
                      cy={dy - 2}
                      r={rad * 0.85}
                      fill="#E7E5E4"
                      stroke="#1C1610"
                      strokeWidth="1.8"
                      opacity={Math.max(0.15, 0.72 * (1 - phase))}
                    />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* STARTLE SPARKS & SWEAT DROPS FOR REACT (HIT BY BUBÁK) & FLEE (ZERO COURAGE) */}
        {(isReact || isFleeing) && showParticles && (
          <g id="granny-panic-vfx">
            {sweatDrops.map((d, idx) => (
              <path
                key={`gr-sweat-${idx}`}
                d={`M ${d.x},${d.y - d.r * 1.8} C ${d.x - d.r},${d.y} ${d.x - d.r},${d.y + d.r} ${d.x},${d.y + d.r} C ${d.x + d.r},${d.y + d.r} ${d.x + d.r},${d.y} ${d.x},${d.y - d.r * 1.8} Z`}
                fill="#38BDF8"
                stroke="#1C1610"
                strokeWidth="1.5"
              />
            ))}
            {isReact && (
              <>
                <g id="granny-startle-sparks" transform={`translate(170, ${18 - Math.abs(Math.sin(t * 20)) * 7})`}>
                  <line x1="-22" y1="-4" x2="-34" y2="-16" stroke="#EF4444" strokeWidth="3.8" strokeLinecap="round" />
                  <line x1="0" y1="-8" x2="0" y2="-24" stroke="#FACC15" strokeWidth="4.2" strokeLinecap="round" />
                  <line x1="22" y1="-4" x2="34" y2="-16" stroke="#EF4444" strokeWidth="3.8" strokeLinecap="round" />
                </g>
                {showCompanion && (
                  <g id="barunka-startle-sparks" transform={`translate(340, ${135 - Math.abs(Math.sin(t * 20)) * 7})`}>
                    <line x1="-18" y1="-3" x2="-28" y2="-14" stroke="#EF4444" strokeWidth="3.4" strokeLinecap="round" />
                    <line x1="0" y1="-6" x2="0" y2="-20" stroke="#FACC15" strokeWidth="3.8" strokeLinecap="round" />
                    <line x1="18" y1="-3" x2="28" y2="-14" stroke="#EF4444" strokeWidth="3.4" strokeLinecap="round" />
                  </g>
                )}
              </>
            )}
          </g>
        )}
      </g>
    </svg>
  );
};
