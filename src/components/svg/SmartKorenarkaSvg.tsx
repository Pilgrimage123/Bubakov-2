import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartKorenarkaSvg - Interactive smart vector SVG character component
 * Bába kořenářka (Herb Woman) - wise healer from the forest cottage
 *
 * Features:
 * - Red headscarf (šátek) with floral polka dots
 * - Woven herbal basket (košík s devaterem kvítí a bylinkami) on her back
 * - Dark teal dress with white apron
 * - Wire spectacles on nose, gentle wise smile
 * - Action: Očistné kadidlo / Devatero kvítí herbal wave & glowing sparkles
 * - Full interactive states: idle, walk, sprint, action, react, flee
 */
export const SmartKorenarkaSvg: React.FC<SmartCharacterProps> = ({
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

  const walkSpeed = isFleeing ? 16 : isSprinting ? 13 : isWalking ? 8.5 : isAction ? 10 : isReact ? 18 : 2.2;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  const bobY = isFleeing
    ? -Math.abs(walkSin) * 12
    : isSprinting
    ? -Math.abs(walkSin) * 10
    : isWalking
    ? -Math.abs(walkSin) * 6
    : isAction
    ? -Math.abs(Math.sin(t * 12)) * 8
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 10 - 4
    : Math.sin(t * 2.5) * 2;

  const bodyLean = isFleeing
    ? 12 + walkSin * 3
    : isSprinting
    ? 10 + walkSin * 2.5
    : isWalking
    ? 4 + walkSin * 2
    : isAction
    ? -4 + Math.sin(t * 8) * 3
    : isReact
    ? -10 + Math.sin(t * 20) * 3
    : Math.sin(t * 1.8) * 1;

  const backFootX = isMoving ? -15 + walkSin * 18 : -15;
  const frontFootX = isMoving ? 15 - walkSin * 18 : 15;

  const gazeX = pointer.isHovered ? pointer.x * 3.5 : Math.sin(t * 1.2) * 1;
  const gazeY = pointer.isHovered ? pointer.y * 2.5 : 0;

  const strokeCol = '#1E1108';

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width={size}
      height={size}
      className={`smart-korenarka-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart Bába kořenářka – moudrá bylinkářka"
    >
      <defs>
        <radialGradient id="korenarkaSkinGrad" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF4EC" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>
        <linearGradient id="korenarkaDressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2F4858" />
          <stop offset="100%" stopColor="#1C2D37" />
        </linearGradient>
        <linearGradient id="korenarkaScarfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="korenarkaBasketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      <g transform={`translate(200, 200) scale(${direction}, 1) translate(-200, -200)`}>
        {showShadow && (
          <ellipse cx="200" cy="370" rx="60" ry="12" fill="#1C1917" opacity="0.25" />
        )}

        {/* HERBAL AURA / SPARKLING INCENSE IN ACTION STATE */}
        {showParticles && (isAction || isReact) && (
          <g className="korenarka-particles">
            <circle cx={160 + Math.sin(t * 8) * 40} cy={160 + Math.cos(t * 8) * 30} r="4" fill="#34D399" opacity="0.8" />
            <circle cx={240 + Math.cos(t * 9) * 40} cy={150 + Math.sin(t * 9) * 30} r="5" fill="#FBBF24" opacity="0.8" />
            <circle cx={200 + Math.sin(t * 11) * 50} cy={120 + Math.cos(t * 11) * 40} r="3" fill="#60A5FA" opacity="0.8" />
          </g>
        )}

        <g transform={`translate(0, ${bobY}) rotate(${bodyLean}, 200, 260)`}>
          {/* HERBAL BASKET ON BACK (Nůše/Košík s bylinami) */}
          <g id="korenarka-back-basket" transform="translate(150, 190) rotate(-10)">
            <path
              d="M 0,0 L 45,-10 L 40,60 L -10,60 Z"
              fill="url(#korenarkaBasketGrad)"
              stroke={strokeCol}
              strokeWidth="3"
            />
            {/* Wicker crosshatching */}
            <path d="M 5,10 L 38,5 M 3,25 L 38,20 M 1,40 L 36,35" stroke="#451A03" strokeWidth="2" />
            {/* Green herbs overflowing */}
            <path d="M 0,-5 C -10,-20 15,-30 20,-10 C 25,-25 45,-15 35,-5 Z" fill="#166534" stroke={strokeCol} strokeWidth="2" />
            <circle cx="10" cy="-18" r="4" fill="#FBBF24" />
            <circle cx="28" cy="-15" r="4" fill="#EF4444" />
          </g>

          {/* FEET / SHOES */}
          <g id="korenarka-shoes">
            <ellipse cx={200 + backFootX} cy="365" rx="12" ry="6" fill="#3B2314" stroke={strokeCol} strokeWidth="2.5" />
            <ellipse cx={200 + frontFootX} cy="365" rx="12" ry="6" fill="#3B2314" stroke={strokeCol} strokeWidth="2.5" />
          </g>

          {/* DRESS & APRON */}
          <g id="korenarka-dress">
            <path
              d="M 165,190 C 150,260 145,330 150,360 L 250,360 C 255,330 250,260 235,190 Z"
              fill="url(#korenarkaDressGrad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? '4' : '3'}
            />
            {/* White Apron */}
            <path
              d="M 175,220 L 225,220 L 232,358 L 168,358 Z"
              fill="#F8FAFC"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <path d="M 175,220 L 225,220" stroke="#CBD5E1" strokeWidth="3" />
          </g>

          {/* ARMS & HERBAL BUNDLE IN HAND */}
          <g id="korenarka-arms">
            <path d="M 160,200 Q 140,230 165,250" stroke="#1C2D37" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M 160,200 Q 140,230 165,250" stroke={strokeCol} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.3" />
            <path d="M 240,200 Q 255,230 225,255" stroke="#1C2D37" strokeWidth="12" strokeLinecap="round" fill="none" />
            {/* Hands */}
            <circle cx="165" cy="250" r="7" fill="url(#korenarkaSkinGrad)" stroke={strokeCol} strokeWidth="2" />
            <circle cx="225" cy="255" r="7" fill="url(#korenarkaSkinGrad)" stroke={strokeCol} strokeWidth="2" />

            {/* Devatero kvítí Bouquet held in front */}
            <g transform="translate(195, 230) rotate(-15)">
              <path d="M 0,20 L 0,-15 M -5,20 L -10,-10 M 5,20 L 10,-10" stroke="#15803D" strokeWidth="2.5" />
              <circle cx="-10" cy="-12" r="5" fill="#EF4444" stroke={strokeCol} strokeWidth="1.2" />
              <circle cx="0" cy="-18" r="6" fill="#FBBF24" stroke={strokeCol} strokeWidth="1.2" />
              <circle cx="10" cy="-12" r="5" fill="#3B82F6" stroke={strokeCol} strokeWidth="1.2" />
            </g>
          </g>

          {/* HEAD, SCARF & FACE */}
          <g id="korenarka-head" transform="translate(200, 160)">
            {/* Wise Face Base */}
            <ellipse cx="0" cy="0" rx="24" ry="26" fill="url(#korenarkaSkinGrad)" stroke={strokeCol} strokeWidth={showOutline ? '4' : '3'} />

            {/* Spectacles (Brýle) */}
            <circle cx="-8" cy="-2" r="7" fill="none" stroke="#78350F" strokeWidth="2" />
            <circle cx="8" cy="-2" r="7" fill="none" stroke="#78350F" strokeWidth="2" />
            <line x1="-1" y1="-2" x2="1" y2="-2" stroke="#78350F" strokeWidth="2" />

            {/* Eyes */}
            <circle cx="-8 + gazeX" cy="-2 + gazeY" r="2.5" fill="#1C1917" />
            <circle cx="8 + gazeX" cy="-2 + gazeY" r="2.5" fill="#1C1917" />

            {/* Nose & Gentle Smile */}
            <path d="M 0,-4 Q 4,4 0,6" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            <path d="M -8,12 Q 0,18 8,12" fill="none" stroke={strokeCol} strokeWidth="2.2" strokeLinecap="round" />

            {/* Red Floral Headscarf (Šátek s puntíky) */}
            <path
              d="M -26,-6 C -28,-35 28,-35 26,-6 C 30,10 20,24 0,22 C -20,24 -30,10 -26,-6 Z"
              fill="url(#korenarkaScarfGrad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? '3.8' : '3'}
            />
            {/* White polka dots on scarf */}
            <circle cx="-12" cy="-18" r="2.5" fill="#FFFFFF" />
            <circle cx="0" cy="-24" r="2.5" fill="#FFFFFF" />
            <circle cx="12" cy="-18" r="2.5" fill="#FFFFFF" />
            <circle cx="-18" cy="-8" r="2.5" fill="#FFFFFF" />
            <circle cx="18" cy="-8" r="2.5" fill="#FFFFFF" />
            {/* Scarf knot under chin */}
            <polygon points="-4,20 4,20 8,30 -8,30" fill="#B91C1C" stroke={strokeCol} strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
};
