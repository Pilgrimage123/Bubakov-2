import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartSnehulakSvg - Interactive smart vector SVG animation
 * Inspired by the classic Czech folklore illustration of the angry melting snowman (Tající sněhulák)
 *
 * Visual fidelity details matching the reference art:
 * - Sneaking forward crouched two-legged gait
 * - Melting slushy snow body with dripping icicles/drops hanging from chin, limbs, belly & hat brim
 * - Ground water puddles with ripple rings beneath feet and dripping drops
 * - Battered moss-green top hat with stitched leather patch, snow crust on crown, and pine needle sprig
 * - Red and dark-crimson striped woolen scarf blowing behind, wet dripping fringe tassels
 * - Fierce wicked grin with individually visible sharp teeth, deep dark mouth cavity
 * - Intensely scowling coal eyebrows, coal eyes with interactive cursor tracking
 * - Long ridged orange carrot nose jutting forward horizontally
 * - 3 dark, rough charcoal buttons down the torso
 * - Sturdy birch twig broom with twine binding and wooden handle
 */
export const SmartSnehulakSvg: React.FC<SmartCharacterProps> = ({
  state = 'idle',
  time: externalTime,
  speed = 1,
  isPlaying = true,
  direction = 1,
  size = 380,
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

  // Animation frame loop
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

  // Handle pointer tracking
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

  // Kinematic parameters based on state
  const isWalking = state === 'walk';
  const isAction = state === 'action';
  const isReact = state === 'react';

  // Walk and sneak variables
  const walkFreq = isAction ? 14 : isWalking ? 9 : 2.5;
  const walkCycle = Math.sin(t * walkFreq);
  const walkCos = Math.cos(t * walkFreq);

  // Leg swings (two-legged snowman sneak)
  const backLegAngle = isWalking ? walkCycle * 28 : isAction ? -25 + Math.sin(t * 18) * 15 : isReact ? -10 : -8;
  const frontLegAngle = isWalking ? -walkCycle * 28 : isAction ? 25 + Math.sin(t * 18 + Math.PI) * 15 : isReact ? 10 : 8;

  // Torso crouch and bob
  const bobY = isWalking ? Math.abs(walkCycle) * 12 : isAction ? Math.abs(Math.sin(t * 12)) * 16 : Math.sin(t * 2.2) * 3;
  const crouchAngle = isWalking ? 8 + walkCycle * 3 : isAction ? 15 + Math.sin(t * 12) * 5 : isReact ? -6 : 3;

  // Accessories
  const scarfWave = Math.sin(t * (isAction ? 16 : isWalking ? 10 : 3.5)) * (isAction ? 18 : isWalking ? 12 : 5);
  const broomAngle = isAction ? -25 + Math.sin(t * 16) * 32 : isWalking ? -12 + walkCos * 14 : -10 + Math.sin(t * 2) * 4;

  // Cursor tracking offsets for eyes and carrot nose
  const lookX = pointer.isHovered ? pointer.x * 7 : Math.sin(t * 1.5) * 2;
  const lookY = pointer.isHovered ? pointer.y * 6 : 0;
  const noseWiggle = isAction ? Math.sin(t * 30) * 4 : 0;

  // Dynamic dripping water particles (melting effect from image)
  const dripCycle1 = (t * 1.6) % 1;
  const dripCycle2 = (t * 1.9 + 0.3) % 1;
  const dripCycle3 = (t * 1.4 + 0.6) % 1;
  const dripCycle4 = (t * 2.1 + 0.1) % 1;

  // Flying snow / water flurries
  const particles = [
    { cx: 310 + Math.sin(t * 7 + 1) * 30, cy: 120 + ((t * 85) % 180), r: 4, op: 0.7 },
    { cx: 340 + Math.sin(t * 8 + 2) * 40, cy: 90 + ((t * 110 + 40) % 200), r: 5.5, op: 0.8 },
    { cx: 270 + Math.sin(t * 6 + 3) * 25, cy: 150 + ((t * 95 + 80) % 190), r: 3.5, op: 0.6 },
    { cx: 360 + Math.sin(t * 9 + 4) * 35, cy: 110 + ((t * 125 + 120) % 210), r: 4.8, op: 0.75 },
    { cx: 290 + Math.sin(t * 7.5 + 5) * 20, cy: 170 + ((t * 75 + 160) % 170), r: 3, op: 0.5 },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 440 460"
      width={size}
      height={size}
      className={`smart-snehulak-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Tající sněhulák s koštětem"
    >
      <defs>
        {/* Slushy Snow Body Gradients with Ice Blues */}
        <radialGradient id="snMeltGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F0F8FF" />
          <stop offset="85%" stopColor="#D2E9F7" />
          <stop offset="100%" stopColor="#A2CCE5" />
        </radialGradient>

        <radialGradient id="snLegMeltGrad" cx="42%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#E6F3FA" />
          <stop offset="100%" stopColor="#9AC7E2" />
        </radialGradient>

        {/* Melting Water Puddle Gradient */}
        <radialGradient id="puddleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#7DD3FC" stopOpacity="0.65" />
          <stop offset="90%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>

        {/* Droplet Blue Gradient */}
        <linearGradient id="dripBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="60%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Mossy Battered Top Hat Gradient */}
        <linearGradient id="mossHatGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#6E7D65" />
          <stop offset="35%" stopColor="#55644C" />
          <stop offset="70%" stopColor="#3E4C36" />
          <stop offset="100%" stopColor="#283323" />
        </linearGradient>

        {/* Patch Leather on Hat */}
        <linearGradient id="hatPatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="50%" stopColor="#854D0E" />
          <stop offset="100%" stopColor="#713F12" />
        </linearGradient>

        {/* Carrot Nose Gradient */}
        <linearGradient id="carrotMeltGrad" x1="0%" y1="40%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Scarf Red Stripe Gradient */}
        <linearGradient id="scarfRedMelt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>

        {/* Scarf Dark Crimson Stripe Gradient */}
        <linearGradient id="scarfDarkMelt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B1313" />
          <stop offset="60%" stopColor="#3F0D0D" />
          <stop offset="100%" stopColor="#250505" />
        </linearGradient>

        {/* Broom Wood Handle */}
        <linearGradient id="broomWoodMelt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B48243" />
          <stop offset="45%" stopColor="#8C5C26" />
          <stop offset="100%" stopColor="#5A3712" />
        </linearGradient>

        {/* Broom Twigs Bristles */}
        <linearGradient id="broomTwigsMelt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="40%" stopColor="#B45309" />
          <stop offset="80%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Coal Button Texture */}
        <radialGradient id="coalGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="40%" stopColor="#27272A" />
          <stop offset="85%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </radialGradient>

        {/* Drop Shadow filter */}
        <filter id="meltPaperDrop" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="2" dy="4" stdDeviation="3.5" floodColor="#1C1610" floodOpacity="0.22" />
        </filter>
      </defs>

      <g
        transform={`translate(220, 240) scale(${direction}, 1) translate(-220, -240)`}
        filter="url(#meltPaperDrop)"
      >
        {/* GROUND MELTING WATER PUDDLES WITH RIPPLES */}
        {showShadow && (
          <g id="melting-puddles">
            {/* Main Puddle beneath front foot */}
            <ellipse cx="295" cy="426" rx="68" ry="16" fill="url(#puddleGrad)" />
            <path
              d="M 235,426 C 245,418 285,418 340,422 C 365,424 358,432 330,436 C 285,442 240,436 235,426 Z"
              fill="#7DD3FC"
              opacity="0.5"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            {/* Ripple rings front foot */}
            <ellipse cx="295" cy="426" rx="55" ry="11" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.65" />
            <ellipse cx="295" cy="426" rx="35" ry="7" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.8" />

            {/* Back puddle beneath back foot */}
            <ellipse cx="120" cy="420" rx="54" ry="14" fill="url(#puddleGrad)" />
            <path
              d="M 80,420 C 90,412 130,414 165,418 C 175,424 160,428 135,431 C 105,434 75,428 80,420 Z"
              fill="#7DD3FC"
              opacity="0.5"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            {/* Ripple rings back foot */}
            <ellipse cx="120" cy="420" rx="42" ry="9" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="120" cy="420" rx="24" ry="5.5" fill="none" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.75" />

            {/* Center drip puddle under torso */}
            <ellipse cx="215" cy="430" rx="40" ry="9" fill="url(#puddleGrad)" opacity="0.7" />
            <ellipse cx="215" cy="430" rx="25" ry="5" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.55" />
          </g>
        )}

        {/* KINEMATIC SNEAKING SNOWMAN */}
        <g
          id="sn-crouch-group"
          transform={`translate(0, ${bobY}) rotate(${crouchAngle}, 205, 300)`}
        >
          {/* 1. BACK LEG (Trailing leg with melting drops and large snowy foot) */}
          <g id="sn-back-leg" transform={`translate(170, 275) rotate(${backLegAngle})`}>
            {/* Back Leg Thigh and Calf */}
            <path
              d="M -18,-5 C -28,32 -32,70 -42,105 C -46,120 -36,132 -18,130 C 5,128 16,115 16,92 C 16,60 14,30 10,-5 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Melting Stalactites / Drips hanging on Back Leg */}
            <path
              d="M -38,70 C -42,78 -44,88 -40,94 C -37,90 -34,80 -32,72 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2"
            />
            <path
              d="M -22,105 C -26,115 -27,124 -24,128 C -21,124 -19,114 -18,105 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2"
            />

            {/* Back Snowy Foot splashing into puddle */}
            <path
              d="M -42,105 C -62,114 -82,122 -78,136 C -74,146 -52,148 -18,144 C 12,141 28,134 26,122 C 22,112 2,110 -18,110 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Foot Melting Details */}
            <path
              d="M -68,138 C -70,146 -68,152 -64,152 C -61,148 -62,142 -63,138 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M -48,142 C -50,150 -48,155 -45,155 C -42,151 -43,145 -44,142 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            {/* Falling Water Droplet from Back Thigh */}
            <g transform={`translate(-35, ${80 + dripCycle1 * 50}) scale(${1 - dripCycle1 * 0.3})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>

          {/* 2. BROOM (Held firmly in back hand, birch twigs & wood handle) */}
          <g id="sn-broom" transform={`translate(285, 230) rotate(${broomAngle})`}>
            {/* Broom Wooden Handle */}
            <rect
              x="-6"
              y="-155"
              width="13"
              height="335"
              rx="4"
              fill="url(#broomWoodMelt)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 3.8 : 0}
            />
            {/* Wood grain ridges */}
            <line x1="-2" y1="-140" x2="-2" y2="160" stroke="#5A3712" strokeWidth="1.8" />
            <line x1="2" y1="-120" x2="2" y2="140" stroke="#D97706" strokeWidth="1.2" />

            {/* Broom Bristles (Birch Twigs) */}
            <g transform="translate(0, -150)">
              {/* Splayed twigs clump */}
              <path
                d="M -26,0 C -42,-45 -55,-105 -42,-142 C -34,-148 -22,-150 -12,-124 C -6,-154 6,-154 12,-126 C 22,-152 34,-146 40,-136 C 54,-98 42,-45 26,0 Z"
                fill="url(#broomTwigsMelt)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
              />
              {/* Internal twig lines */}
              <path d="M -15,-15 L -35,-125 M -6,-15 L -10,-140 M 4,-15 L 10,-138 M 15,-15 L 32,-122" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M -22,-20 L -25,-100 M 0,-20 L 0,-115 M 20,-20 L 22,-105" stroke="#FBBF24" strokeWidth="1.4" strokeLinecap="round" />

              {/* Twine / Straw Cord Binding */}
              <rect x="-28" y="-20" width="56" height="12" rx="3" fill="#D97706" stroke="#1C1610" strokeWidth="3" />
              <line x1="-26" y1="-16" x2="26" y2="-16" stroke="#FEF08A" strokeWidth="1.5" />
              <line x1="-26" y1="-12" x2="26" y2="-12" stroke="#78350F" strokeWidth="1.5" />
            </g>
          </g>

          {/* 3. TORSO (Melting lump of snow with jagged drips, ice blue accents, 3 coal buttons) */}
          <g id="sn-torso">
            {/* Melting Snow Belly & Chest */}
            <path
              d="M 180,140 C 145,155 120,185 115,225 C 108,265 112,305 135,335 C 148,352 165,364 195,366 C 235,368 268,354 285,328 C 304,298 296,252 282,210 C 268,172 238,142 180,140 Z"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.6 : 0}
            />

            {/* Melting Stalactites & Drips hanging along bottom torso edge */}
            <path
              d="M 125,275 C 122,295 125,308 129,310 C 132,305 131,290 134,278 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2.2"
            />
            <path
              d="M 145,325 C 142,342 144,354 148,356 C 151,350 150,336 153,326 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2.2"
            />
            <path
              d="M 172,348 C 170,364 172,374 176,375 C 179,370 178,358 180,348 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2.2"
            />
            <path
              d="M 210,358 C 208,376 211,388 215,389 C 218,382 217,370 218,358 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2.2"
            />
            <path
              d="M 252,342 C 250,360 253,370 256,370 C 259,365 258,352 260,340 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2.2"
            />

            {/* Falling Water Droplets from Torso Rump & Belly */}
            <g transform={`translate(148, ${356 + dripCycle2 * 60}) scale(${1 - dripCycle2 * 0.25})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
            <g transform={`translate(215, ${389 + dripCycle3 * 55}) scale(${1 - dripCycle3 * 0.25})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>

            {/* Shading folds & slushy texture on snow body */}
            <path d="M 145,210 C 138,245 142,280 162,310" stroke="#A2CCE5" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M 145,210 C 138,245 142,280 162,310" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 220,175 C 245,200 262,235 268,275" stroke="#A2CCE5" strokeWidth="4.5" strokeLinecap="round" fill="none" />

            {/* 3 Large Irregular Charcoal Coal Buttons down torso */}
            {/* Top Button */}
            <g transform="translate(245, 222)">
              <path d="M -8,-6 C -3,-10 6,-8 9,-3 C 11,3 8,9 2,10 C -5,11 -10,6 -10,-1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.6" />
              <circle cx="-2" cy="-3" r="1.5" fill="#71717A" />
            </g>
            {/* Middle Button */}
            <g transform="translate(238, 260)">
              <path d="M -9,-5 C -4,-11 7,-9 10,-4 C 12,3 9,10 3,11 C -4,12 -11,8 -11,1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.6" />
              <circle cx="-2" cy="-2" r="1.5" fill="#71717A" />
            </g>
            {/* Bottom Button */}
            <g transform="translate(225, 298)">
              <path d="M -10,-6 C -5,-12 8,-10 11,-4 C 13,4 10,11 3,12 C -5,13 -12,8 -12,1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.6" />
              <circle cx="-3" cy="-2" r="1.6" fill="#71717A" />
            </g>
          </g>

          {/* 4. FRONT LEG (Stepping forward boldly, giant sculpted snowy foot splashing puddle) */}
          <g id="sn-front-leg" transform={`translate(225, 290) rotate(${frontLegAngle})`}>
            {/* Front Leg Thigh and Shin */}
            <path
              d="M -14,-5 C -8,32 -2,68 18,102 C 28,118 45,128 68,130 C 86,132 98,124 96,110 C 94,96 75,92 62,80 C 42,60 30,28 22,-5 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.5 : 0}
            />
            {/* Melting Drips hanging on front leg */}
            <path
              d="M 8,62 C 6,75 8,85 12,86 C 15,82 14,70 16,62 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2"
            />
            <path
              d="M 32,92 C 30,105 32,115 36,116 C 39,112 38,100 40,92 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2"
            />

            {/* Front Giant Melting Snowy Foot */}
            <path
              d="M 18,102 C 24,122 38,136 72,136 C 96,136 112,126 108,110 C 104,96 82,98 62,98 C 45,98 28,100 18,102 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Drip on toe tip */}
            <path
              d="M 104,118 C 106,128 108,134 112,134 C 114,130 113,122 110,116 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            {/* Falling Water Droplet from Front Knee */}
            <g transform={`translate(12, ${86 + dripCycle4 * 50}) scale(${1 - dripCycle4 * 0.3})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>

          {/* 5. ARMS (Holding broom with sculpted snow mitten hands) */}
          <g id="sn-arms">
            {/* Front Arm reaching across holding broom */}
            <path
              d="M 195,185 C 220,195 248,198 268,210 C 278,216 288,228 285,240 C 280,248 268,245 255,236 C 240,226 218,215 195,205 Z"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4 : 0}
            />
            {/* Snowy Mitten Hand wrapped around handle */}
            <ellipse cx="282" cy="235" rx="14" ry="12" fill="url(#snMeltGrad)" stroke="#1C1610" strokeWidth="3.5" />
            <path d="M 272,228 C 275,224 285,224 290,228" stroke="#1C1610" strokeWidth="2.5" fill="none" />
            {/* Drip hanging from elbow */}
            <path d="M 235,212 C 234,224 236,232 239,232 C 241,228 240,220 241,214 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.8" />
          </g>

          {/* 6. RED & DARK STRIPED SCARF (Waving in wind behind him with fringe tassels) */}
          <g id="sn-scarf" transform={`translate(225, 125)`}>
            {/* Tail of scarf flying behind */}
            <g transform={`rotate(${scarfWave})`}>
              <path
                d="M -45,15 C -85,25 -130,30 -165,5 C -172,3 -178,12 -170,18 C -135,46 -85,42 -45,28 Z"
                fill="url(#scarfRedMelt)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />
              {/* Dark Stripes across scarf tail */}
              {[-65, -95, -125, -155].map((sx, i) => (
                <path
                  key={`scarf-stripe-${i}`}
                  d={`M ${sx},18 L ${sx - 8},38 L ${sx + 4},40 L ${sx + 4},20 Z`}
                  fill="url(#scarfDarkMelt)"
                  stroke="#1C1610"
                  strokeWidth="1.6"
                />
              ))}
              {/* Fringed Tassels at tip */}
              <path
                d="M -168,10 L -188,8 M -170,14 L -192,15 M -170,18 L -190,22 M -168,22 L -186,28"
                stroke="#DC2626"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Melting water drop at scarf end */}
              <circle cx="-190" cy="24" r="3.2" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>

            {/* Scarf wrapped around neck */}
            <path
              d="M -50,5 C -30,18 10,20 45,6 C 55,2 58,-12 45,-18 C 20,-26 -25,-26 -55,-12 Z"
              fill="url(#scarfRedMelt)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Scarf Front Stripes */}
            <path d="M -35,-8 L -30,16 M -10,-12 L -6,18 M 15,-10 L 18,16 M 35,-6 L 36,10" stroke="url(#scarfDarkMelt)" strokeWidth="8" strokeLinecap="round" />
            <path d="M -35,-8 L -30,16 M -10,-12 L -6,18 M 15,-10 L 18,16 M 35,-6 L 36,10" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          {/* 7. HEAD & BATTERED TOP HAT WITH SNOW CRUST & PINE NEEDLE */}
          <g id="sn-head" transform={`translate(225, 125)`}>
            {/* Snow Head Sphere */}
            <circle
              cx="0"
              cy="-42"
              r="46"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.6 : 0}
            />
            {/* Shading contour on head */}
            <path d="M -38,-50 C -44,-25 -32,2 -5,-2" stroke="#A2CCE5" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M -38,-50 C -44,-25 -32,2 -5,-2" stroke="#1C1610" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Melting Drips hanging from Chin */}
            <path d="M -15,-2 C -18,12 -17,20 -14,21 C -11,18 -12,8 -10,-2 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="2" />
            <path d="M 6,-1 C 4,14 6,24 9,25 C 12,20 11,10 13,-1 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="2" />

            {/* Falling Water Droplet from Chin */}
            <g transform={`translate(8, ${24 + dripCycle1 * 40}) scale(${1 - dripCycle1 * 0.3})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>

            {/* FACE (Interactive eyes, wicked grin with individual sharp teeth, ridged carrot nose) */}
            <g id="sn-face" transform={`translate(${lookX}, ${lookY})`}>
              {/* Wicked Open Mouth Cavity */}
              <path
                d="M 5,-28 C 12,-38 34,-36 42,-28 C 45,-20 40,-12 32,-10 C 20,-8 8,-16 5,-28 Z"
                fill="#3F0D0D"
                stroke="#1C1610"
                strokeWidth="3.5"
              />
              {/* Upper Row of Sharp White Teeth */}
              <polygon points="12,-30 15,-24 17,-30 20,-24 22,-30 25,-24 27,-30 30,-24 32,-30" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.2" />
              {/* Lower Row of Sharp White Teeth */}
              <polygon points="14,-17 17,-22 19,-17 22,-22 24,-17 27,-22 29,-17 32,-22 34,-17" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.2" />
              {/* Mouth crease smirk */}
              <path d="M 3,-30 C -2,-32 -6,-28 -5,-24" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 42,-28 C 47,-30 52,-26 50,-22" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Angry Scowling Eyebrows (Slanted dark coal bars) */}
              <path d="M 12,-62 Q 25,-69 42,-55" stroke="#18181B" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              <path d="M -18,-64 Q -6,-67 4,-56" stroke="#18181B" strokeWidth="4.5" strokeLinecap="round" fill="none" />

              {/* Fierce Coal Eyes with Intense Pupils */}
              {/* Right eye (closer to viewer) */}
              <g transform="translate(26, -53)">
                <ellipse cx="0" cy="0" rx="6.5" ry="5.5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.8" />
                <circle cx={pointer.isHovered ? pointer.x * 2.2 : 0.8} cy={pointer.isHovered ? pointer.y * 1.5 : 0} r="3.2" fill="#18181B" />
                <circle cx="-1" cy="-1.5" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Left eye (further back) */}
              <g transform="translate(-4, -55)">
                <ellipse cx="0" cy="0" rx="5.5" ry="5" fill="#FFFFFF" stroke="#1C1610" strokeWidth="2.6" />
                <circle cx={pointer.isHovered ? pointer.x * 1.8 : 0.6} cy={pointer.isHovered ? pointer.y * 1.2 : 0} r="2.8" fill="#18181B" />
                <circle cx="-0.8" cy="-1.2" r="1" fill="#FFFFFF" />
              </g>

              {/* Carrot Nose (Pointing forward with textured ridges) */}
              <g id="sn-carrot" transform={`translate(32, -43) rotate(${noseWiggle})`}>
                <path
                  d="M 0,-8 C 30,-14 75,-6 98,3 C 75,8 30,5 0,6 Z"
                  fill="url(#carrotMeltGrad)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.6 : 0}
                />
                {/* Carrot dark textured ridges */}
                <line x1="18" y1="-7" x2="20" y2="4" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="38" y1="-6" x2="40" y2="3" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="58" y1="-4" x2="60" y2="2" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
                <line x1="78" y1="-2" x2="80" y2="2" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
                {/* Melting drop on tip of carrot */}
                <path d="M 94,4 C 95,9 98,12 100,12 C 101,10 100,6 98,4 Z" fill="#7DD3FC" stroke="#1C1610" strokeWidth="1.4" />
              </g>
            </g>

            {/* BATTERED TOP HAT WITH PATCH, SNOW CRUST & PINE NEEDLE */}
            <g id="sn-top-hat" transform="translate(-10, -84) rotate(-8)">
              {/* Pine Needle Sprig sticking out on the left */}
              <g transform="translate(-32, 6)">
                <line x1="0" y1="0" x2="-26" y2="-12" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="-8" y1="-4" x2="-18" y2="-22" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="-14" y1="-7" x2="-28" y2="-18" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="-20" y1="-9" x2="-35" y2="-12" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" />
              </g>

              {/* Hat Crown (Mossy green cylindrical top hat, dented and battered) */}
              <path
                d="M -34,18 C -32,-18 -26,-52 -18,-56 C -4,-60 26,-60 40,-54 C 46,-50 50,-18 52,18 Z"
                fill="url(#mossHatGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
              />

              {/* Stitched Leather Patch on Hat Crown */}
              <g transform="translate(18, -25)">
                <polygon points="-12,-10 10,-8 8,12 -14,10" fill="url(#hatPatchGrad)" stroke="#1C1610" strokeWidth="2" />
                {/* Stitches */}
                <line x1="-10" y1="-12" x2="-10" y2="-6" stroke="#FEF3C7" strokeWidth="1.4" />
                <line x1="2" y1="-10" x2="2" y2="-4" stroke="#FEF3C7" strokeWidth="1.4" />
                <line x1="10" y1="-2" x2="4" y2="-2" stroke="#FEF3C7" strokeWidth="1.4" />
                <line x1="8" y1="8" x2="2" y2="8" stroke="#FEF3C7" strokeWidth="1.4" />
                <line x1="-12" y1="4" x2="-6" y2="4" stroke="#FEF3C7" strokeWidth="1.4" />
              </g>

              {/* Hat Wide Brim (Curving with sagging drips) */}
              <path
                d="M -46,16 C -18,8 35,8 64,16 C 70,18 68,28 58,28 C 30,22 -20,22 -42,28 C -48,26 -50,18 -46,16 Z"
                fill="#3E4C36"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4 : 0}
              />

              {/* Melting Drips hanging from Hat Brim */}
              <path d="M -35,26 C -37,34 -36,40 -33,40 C -31,37 -32,30 -31,26 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />
              <path d="M 8,24 C 7,35 9,42 12,42 C 14,38 13,30 14,24 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />
              <path d="M 42,26 C 41,34 43,40 46,40 C 48,37 47,30 47,26 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />

              {/* Thick Melting Snow Crust on Hat Crown */}
              <path
                d="M -22,-54 C -16,-66 -2,-70 14,-69 C 28,-68 38,-62 42,-52 C 34,-50 24,-52 16,-48 C 6,-45 -4,-54 -12,-50 C -16,-48 -18,-52 -22,-54 Z"
                fill="#FFFFFF"
                stroke="#1C1610"
                strokeWidth={showOutline ? 3.4 : 0}
              />
              {/* Snow drip down side of hat */}
              <path d="M 38,-50 C 42,-40 44,-30 42,-26 C 40,-26 38,-35 36,-48 Z" fill="#FFFFFF" stroke="#1C1610" strokeWidth="1.8" />
            </g>
          </g>
        </g>

        {/* DYNAMIC SNOW & WATER DROPLET PARTICLES */}
        {showParticles && (
          <g id="sn-particles">
            {particles.map((p, idx) => (
              <circle
                key={`sn-p-${idx}`}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="#BAE6FD"
                opacity={p.op}
                stroke="#0284C7"
                strokeWidth="0.8"
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};
