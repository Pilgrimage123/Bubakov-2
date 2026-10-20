import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartBabickaBarunkaSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale / folklore illustration of Babička a Barunka (from Božena Němcová & Josef Lada)
 * Features:
 * - Babička in white embroidered kerchief, black fringe shawl, rust vest, striped blue apron with kangaroo pouch holding fresh bread, checkered napkin & herbs, and wooden walking cane
 * - Barunka beside her with brown braid, red bow, puffed blouse, red bodice, embroidered apron, and bouquet of meadow flowers
 * - Walking kinematics with synchronized cane tapping and braid bounce
 * - "Laskavý zázrak" action with glowing bread, floating flower petals, and divine golden aura
 * - Interactive pointer tracking for gentle gaze
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
  const isAction = state === 'action';
  const isReact = state === 'react';

  // Kinematic parameters
  const walkSpeed = isWalking ? 6.5 : 2.2;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Babička walking stride and cane tap
  const grannyBobY = isWalking ? Math.abs(walkSin) * 6 : Math.sin(t * 2.2) * 2;
  const grannySway = isWalking ? walkCos * 2 : 0;
  const caneTapAngle = isWalking ? Math.sin(t * walkSpeed) * 8 : Math.sin(t * 1.5) * 1.5;

  // Barunka skipping and braid bounce
  const barunkaBobY = isWalking ? Math.abs(Math.sin(t * walkSpeed * 1.2)) * 8 : Math.sin(t * 2.5 + 0.5) * 2.5;
  const braidWave = Math.sin(t * (isWalking ? 12 : 2.8)) * (isWalking ? 14 : 4);
  const bouquetLift = isAction ? -15 + Math.sin(t * 8) * 6 : 0;

  // Eye gaze tracking
  const gazeX = pointer.isHovered ? pointer.x * 4 : Math.sin(t * 1.2) * 1.2;
  const gazeY = pointer.isHovered ? pointer.y * 3.5 : 0;

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
          <stop offset="65%" stopColor="#FEE4D6" />
          <stop offset="100%" stopColor="#F9C6B0" />
        </radialGradient>

        {/* Shawl Wool Gradient */}
        <linearGradient id="shawlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F332A" />
          <stop offset="60%" stopColor="#2A201A" />
          <stop offset="100%" stopColor="#1B1410" />
        </linearGradient>

        {/* Blue Striped Apron Gradient */}
        <linearGradient id="apronBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="25%" stopColor="#1D4ED8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="75%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Bread Crust Golden Gradient */}
        <radialGradient id="breadCrustGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D97706" />
          <stop offset="85%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#582103" />
        </radialGradient>

        {/* Holy Bread Miracle Glow */}
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
            {showCompanion && <ellipse cx={330} cy={445} rx={50} ry={13} fill="#1E293B" />}
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
          {/* 1. BROWN PEASANT SKIRT (BOTTOM HEM & SHOES) */}
          <g transform="translate(170, 400)">
            {/* Shoes peeking out */}
            <ellipse cx="-28" cy="36" rx="20" ry="11" fill="#3E2719" stroke="#1C1610" strokeWidth="3" />
            <ellipse cx="28" cy="36" rx="20" ry="11" fill="#3E2719" stroke="#1C1610" strokeWidth="3" />

            {/* Pleated dark brown skirt hem */}
            <path
              d="M -75,0 C -50,15 50,15 75,0 L 78,32 C 50,42 -50,42 -78,32 Z"
              fill="#4A3423"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Vertical skirt pleats */}
            <line x1="-50" y1="5" x2="-52" y2="35" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="-25" y1="8" x2="-26" y2="38" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="0" y1="10" x2="0" y2="39" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="25" y1="8" x2="26" y2="38" stroke="#2B1A0E" strokeWidth="2.5" />
            <line x1="50" y1="5" x2="52" y2="35" stroke="#2B1A0E" strokeWidth="2.5" />
          </g>

          {/* 2. WOODEN WALKING CANE IN RIGHT HAND */}
          <g transform={`translate(82, 175) rotate(${caneTapAngle})`}>
            {/* Long sturdy wooden staff */}
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

          {/* 3. BIG BLUE STRIPED APRON WITH SIGNATURE KANGAROO POUCH */}
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
                opacity="0.75"
              />
            ))}

            {/* SIGNATURE GATHERED POUCH / POCKET IN FRONT */}
            <g transform="translate(0, 48)">
              {/* Pocket Shadow & Outline */}
              <path
                d="M -48,-10 C -56,50 -48,95 0,98 C 48,95 56,50 48,-10 C 25,-4 -25,-4 -48,-10 Z"
                fill="#1D4ED8"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />
              {/* Pocket gathered folds */}
              <path
                d="M -30,95 Q -25,50 -28,5 M 0,98 Q 0,55 0,6 M 30,95 Q 25,50 28,5"
                stroke="#1E3A8A"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />

              {/* CONTENTS OF THE POUCH: BREAD, CHECKERED CLOTH, HERBS */}
              {/* Red & White Checkered Cloth Peeking Out */}
              <path
                d="M -15,-5 C -25,-35 -4,-40 6,-30 C 14,-22 10,-5 8,0 Z"
                fill="url(#checkeredCloth)"
                stroke="#1C1610"
                strokeWidth="2.5"
              />

              {/* Fresh Herbal Sprigs & Wildflowers */}
              <g transform="translate(18, -12)">
                <path d="M 0,0 Q 8,-22 18,-28 M 4,-12 Q 18,-18 25,-12 M -2,-6 Q 10,-32 4,-38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="-28" r="3" fill="#FACC15" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="25" cy="-12" r="3" fill="#60A5FA" stroke="#1C1610" strokeWidth="1.2" />
                <circle cx="4" cy="-38" r="3" fill="#F43F5E" stroke="#1C1610" strokeWidth="1.2" />
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
            </g>
          </g>

          {/* 4. RUST-RED BODICE / VEST WITH BUTTONS */}
          <g id="granny-bodice" transform="translate(170, 150)">
            <path
              d="M -35,0 C -42,35 -48,70 -42,75 C -15,80 15,80 42,75 C 48,70 42,35 35,0 Z"
              fill="#B91C1C"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Center closure row */}
            <line x1="0" y1="0" x2="0" y2="76" stroke="#1C1610" strokeWidth="2.5" />
            {/* Dark rustic buttons */}
            {[14, 28, 42, 56, 68].map((btnY) => (
              <circle key={btnY} cx="0" cy={btnY} r="3" fill="#18181B" stroke="#1C1610" strokeWidth="1.5" />
            ))}
          </g>

          {/* 5. BLACK WOOLEN SHAWL WITH FRINGE TASSELS */}
          <g id="granny-shawl" transform="translate(170, 125)">
            {/* Shawl draped across shoulders */}
            <path
              d="M -68,25 C -75,65 -80,125 -68,145 C -45,115 -25,95 0,95 C 25,95 45,115 68,145 C 80,125 75,65 68,25 C 48,15 -48,15 -68,25 Z"
              fill="url(#shawlGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Shawl Fringe Tassels along the hem */}
            {[-68, -55, -42, -30, -18, -6, 6, 18, 30, 42, 55, 68].map((tasselX, idx) => (
              <line
                key={idx}
                x1={tasselX}
                y1={idx < 2 || idx > 9 ? 142 : 98 + Math.abs(tasselX) * 0.4}
                x2={tasselX * 1.05}
                y2={idx < 2 || idx > 9 ? 158 : 115 + Math.abs(tasselX) * 0.4}
                stroke="#1C1610"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}

            {/* Right hand grasping walking cane */}
            <g transform="translate(-78, 52)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="url(#grannySkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
              <path d="M -5,-3 Q 0,-6 5,-3" stroke="#1C1610" strokeWidth="2" fill="none" />
            </g>

            {/* Left hand resting affectionately on apron */}
            <g transform="translate(48, 70)">
              <ellipse cx="0" cy="0" rx="10" ry="8" fill="url(#grannySkinGrad)" stroke="#1C1610" strokeWidth="2.8" />
              <line x1="-3" y1="-4" x2="-3" y2="4" stroke="#1C1610" strokeWidth="1.8" />
              <line x1="2" y1="-4" x2="2" y2="4" stroke="#1C1610" strokeWidth="1.8" />
            </g>
          </g>

          {/* 6. BABIČKA'S HEAD, KERCHIEF & KIND SMILING FACE */}
          <g id="granny-head" transform="translate(170, 115)">
            {/* White Kerchief (Šátek) tied under chin with floral embroidery */}
            <path
              d="M -44,-8 C -48,-48 -35,-80 0,-84 C 35,-80 48,-48 44,-8 C 30,22 12,28 0,30 C -12,28 -30,22 -44,-8 Z"
              fill="#FFFFFF"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Blue floral embroidery sprigs around kerchief rim */}
            <g className="kerchief-embroidery" stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
              <path d="M -38,-20 Q -42,-35 -34,-50 M -38,-35 L -44,-38 M -36,-32 L -30,-34" fill="none" />
              <path d="M 38,-20 Q 42,-35 34,-50 M 38,-35 L 44,-38 M 36,-32 L 30,-34" fill="none" />
            </g>

            {/* Tied Knot under Chin */}
            <g transform="translate(0, 26)">
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

            {/* White Hair peeking out symmetrically */}
            <path
              d="M -24,-32 C -18,-42 0,-38 0,-38 C 0,-38 18,-42 24,-32 C 16,-34 -16,-34 -24,-32 Z"
              fill="#E2E8F0"
              stroke="#1C1610"
              strokeWidth="2.5"
            />

            {/* Gentle Eyes, Wrinkles & Rosy Cheeks */}
            <g transform={`translate(${gazeX}, ${gazeY})`}>
              {/* Kind Eyebrows */}
              <path d="M -18,-24 Q -12,-30 -4,-25" stroke="#78716C" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 4,-25 Q 12,-30 18,-24" stroke="#78716C" strokeWidth="2.8" strokeLinecap="round" fill="none" />

              {/* Sparkling Kind Dark Eyes */}
              <circle cx="-10" cy="-18" r="3.2" fill="#1C1610" />
              <circle cx="-11" cy="-19" r="1.1" fill="#FFFFFF" />
              <circle cx="10" cy="-18" r="3.2" fill="#1C1610" />
              <circle cx="9" cy="-19" r="1.1" fill="#FFFFFF" />

              {/* Gentle Crows Feet / Smile Wrinkles */}
              <path d="M -18,-19 L -23,-21 M -18,-17 L -23,-16 M -18,-15 L -22,-13" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 18,-19 L 23,-21 M 18,-17 L 23,-16 M 18,-15 L 22,-13" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />

              {/* Button Grandmother Nose */}
              <path d="M -3,-14 Q 0,-10 3,-14" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Warm Rosy Cheeks */}
              <circle cx="-16" cy="-10" r="5.5" fill="#FB7185" opacity="0.45" />
              <circle cx="16" cy="-10" r="5.5" fill="#FB7185" opacity="0.45" />

              {/* Warm Benevolent Smile */}
              <path d="M -10,-2 Q 0,8 10,-2" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M -11,-3 L -13,-1 M 11,-3 L 13,-1" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* ======================================================== */}
        {/* BARUNKA (GRANDDAUGHTER COMPANION)                        */}
        {/* ======================================================== */}
        {showCompanion && (
          <g
            id="barunka"
            transform={`translate(0, ${barunkaBobY})`}
          >
            {/* 1. BROWN LEATHER LACE-UP BOOTS */}
            <g transform="translate(340, 405)">
              {/* Left Boot */}
              <g transform="translate(-15, 0)">
                <path d="M -7,0 L 7,0 L 8,26 L 16,30 L 14,35 L -7,35 Z" fill="#854D0E" stroke="#1C1610" strokeWidth="3" strokeLinejoin="round" />
                <line x1="-2" y1="8" x2="4" y2="8" stroke="#1C1610" strokeWidth="1.8" />
                <line x1="-2" y1="16" x2="4" y2="16" stroke="#1C1610" strokeWidth="1.8" />
              </g>
              {/* Right Boot */}
              <g transform="translate(15, 0)">
                <path d="M -7,0 L 7,0 L 7,35 L -14,35 L -16,30 L -8,26 Z" fill="#854D0E" stroke="#1C1610" strokeWidth="3" strokeLinejoin="round" />
                <line x1="-4" y1="8" x2="2" y2="8" stroke="#1C1610" strokeWidth="1.8" />
                <line x1="-4" y1="16" x2="2" y2="16" stroke="#1C1610" strokeWidth="1.8" />
              </g>
            </g>

            {/* 2. DARK BLUE FOLK SKIRT WITH EMBROIDERED HEM */}
            <g id="barunka-skirt" transform="translate(340, 290)">
              <path
                d="M -32,0 C -45,45 -54,85 -48,115 C -25,124 25,124 48,115 C 54,85 45,45 32,0 Z"
                fill="#1E3A8A"
                stroke="#1C1610"
                strokeWidth={showOutline ? "4" : "3"}
                strokeLinejoin="round"
              />
              {/* White folk dots along bottom rim */}
              {[-36, -24, -12, 0, 12, 24, 36].map((dx, i) => (
                <circle key={i} cx={dx} cy="106" r="2.2" fill="#FFFFFF" />
              ))}

              {/* CRISP WHITE APRON WITH SCALLOPED HEM */}
              <path
                d="M -22,0 C -26,35 -30,75 -24,98 C -12,102 12,102 24,98 C 30,75 26,35 22,0 Z"
                fill="#FFFFFF"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Blue folk cross stitches on apron */}
              {[-14, 0, 14].map((dx, i) => (
                <text key={i} x={dx} y="94" fontSize="10" fill="#2563EB" textAnchor="middle" fontWeight="bold">✤</text>
              ))}
            </g>

            {/* 3. WHITE BLOUSE & RED FOLK BODICE (KORDULKA) */}
            <g id="barunka-torso" transform="translate(340, 230)">
              {/* White Puffed Sleeves */}
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

            {/* 4. LONG BRAIDED HAIR WITH BRIGHT RED RIBBON BOW */}
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

            {/* 5. WILDFLOWER MEADOW BOUQUET (HELD IN BOTH HANDS) */}
            <g id="barunka-bouquet" transform={`translate(338, 255) translate(0, ${bouquetLift})`}>
              {/* Green Stems gathered together */}
              <path d="M -8,18 L -3,35 M 0,18 L 0,36 M 8,18 L 3,35" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />

              {/* Child Hands Holding Bouquet */}
              <ellipse cx="-15" cy="24" rx="6" ry="5" fill="url(#barunkaSkinGrad)" stroke="#1C1610" strokeWidth="2" />
              <ellipse cx="15" cy="24" rx="6" ry="5" fill="url(#barunkaSkinGrad)" stroke="#1C1610" strokeWidth="2" />

              {/* Rich Lush Meadow Flowers: Cornflowers, Daisies, Buttercups */}
              {/* Blue Cornflowers (Chrpy) */}
              <g transform="translate(-12, 0)">
                <polygon points="0,-12 4,-4 10,-8 5,0 12,4 4,5 6,12 0,6 -6,12 -4,5 -12,4 -5,0 -10,-8 -4,-4" fill="#2563EB" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#1E3A8A" />
              </g>
              <g transform="translate(14, -8)">
                <polygon points="0,-10 3,-3 8,-6 4,0 10,3 3,4 5,10 0,5 -5,10 -3,4 -10,3 -4,0 -8,-6 -3,-3" fill="#3B82F6" stroke="#1C1610" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2.5" fill="#1D4ED8" />
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
              <circle cx="8" cy="8" r="4.5" fill="#FDE047" stroke="#1C1610" strokeWidth="1.5" />
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
                <path d="M -14,-9 Q -9,-14 -4,-10" stroke="#381D07" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M 4,-10 Q 9,-14 14,-9" stroke="#381D07" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                {/* Big Sparkling Dark Eyes */}
                <circle cx="-8" cy="-4" r="3.2" fill="#1C1610" />
                <circle cx="-9" cy="-5" r="1.1" fill="#FFFFFF" />
                <circle cx="8" cy="-4" r="3.2" fill="#1C1610" />
                <circle cx="7" cy="-5" r="1.1" fill="#FFFFFF" />

                {/* Button Nose */}
                <circle cx="0" cy="1" r="1.5" fill="#E09F80" />

                {/* Cute Rosy Cheeks */}
                <circle cx="-13" cy="3" r="5" fill="#FB7185" opacity="0.55" />
                <circle cx="13" cy="3" r="5" fill="#FB7185" opacity="0.55" />

                {/* Sweet Childish Smile */}
                <path d="M -7,6 Q 0,13 7,6" stroke="#1C1610" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};
