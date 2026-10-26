import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartSnehulakSvg - Interactive smart vector SVG animation
 * Inspired by the classic Czech folklore illustration of the angry melting snowman (Tající sněhulák)
 *
 * Visual fidelity details matching the reference art:
 * - Slender, agile, sneaky melting hunchback body (hubenější štíhlé tělo)
 * - Authentic inverted battered cooking pot on head (omlácený zelený hrnec s uchem a lemem)
 * - Stitched leather patch on pot, pine needle sprig tucked under rim, thick melting snow crust on top
 * - Melting slushy snow body with dripping icicles/stalactites hanging from chin, torso, limbs & pot rim
 * - Ground water puddles with ripple rings beneath feet and splashing droplets
 * - Red and dark-striped woolen scarf blowing behind with wet dripping fringe tassels
 * - Fierce wicked grin with individually visible sharp teeth, deep dark mouth cavity
 * - Intensely scowling coal eyebrows, coal eyes with interactive cursor tracking
 * - Long ridged orange carrot nose jutting forward horizontally with melting drip
 * - 3 dark, rough charcoal buttons down the slender torso
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
  const isSprinting = state === 'sprint';
  const isFleeing = state === 'flee';
  const isMoving = isWalking || isSprinting || isFleeing;
  const isAction = state === 'action';
  const isReact = state === 'react';

  // Walk and sneak variables
  const walkFreq = isFleeing ? 18 : isSprinting ? 15 : isAction ? 14 : isWalking ? 9 : 2.5;
  const walkCycle = Math.sin(t * walkFreq);
  const walkCos = Math.cos(t * walkFreq);

  // Leg swings (two-legged snowman sneak) - ONLY swings when actively moving! Static stance when standing
  const strideAmp = isFleeing ? 38 : isSprinting ? 34 : 28;
  const backLegAngle = isMoving ? walkCycle * strideAmp : isAction ? -16 : isReact ? -10 : -8;
  const frontLegAngle = isMoving ? -walkCycle * strideAmp : isAction ? 18 : isReact ? 10 : 8;

  // Torso crouch and bob (slender sneaky hunchback motion)
  const bobY = isMoving ? Math.abs(walkCycle) * (isFleeing ? 16 : isSprinting ? 14 : 11) : isAction ? Math.abs(Math.sin(t * 12)) * 14 : Math.sin(t * 2.2) * 2.6;
  const crouchAngle = isFleeing ? -8 + walkCycle * 4 : isSprinting ? 12 + walkCycle * 3.5 : isWalking ? 8 + walkCycle * 2.8 : isAction ? 14 + Math.sin(t * 12) * 4 : isReact ? -6 : 3;

  // Accessories
  const scarfWave = Math.sin(t * (isFleeing ? 20 : isSprinting ? 16 : isAction ? 16 : isWalking ? 10 : 3.5)) * (isFleeing ? 22 : isSprinting ? 18 : isAction ? 18 : isWalking ? 12 : 5);
  const broomAngle = isAction ? -25 + Math.sin(t * 16) * 32 : isFleeing ? 18 + walkCos * 20 : isSprinting ? -18 + walkCos * 18 : isWalking ? -12 + walkCos * 14 : -10 + Math.sin(t * 2) * 4;

  // Cursor tracking offsets for eyes and carrot nose
  const lookX = pointer.isHovered ? pointer.x * 6.5 : Math.sin(t * 1.5) * 2;
  const lookY = pointer.isHovered ? pointer.y * 5.5 : 0;
  const noseWiggle = isAction || isFleeing ? Math.sin(t * 30) * 4 : 0;

  // Dynamic dripping water particles (melting effect from reference image)
  const dripCycle1 = (t * 1.6) % 1;
  const dripCycle2 = (t * 1.9 + 0.3) % 1;
  const dripCycle3 = (t * 1.4 + 0.6) % 1;
  const dripCycle4 = (t * 2.1 + 0.1) % 1;
  const dripCycle5 = (t * 1.7 + 0.45) % 1;

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
      aria-label="Smart animovaný Tající sněhulák s hrncem na hlavě a koštětem"
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

        {/* Authentic Inverted Cooking Pot (Hrnec na hlavě) - Mottled Weathered Enamel */}
        <linearGradient id="potEnamelGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#63735B" />
          <stop offset="30%" stopColor="#4D5C45" />
          <stop offset="65%" stopColor="#3B4934" />
          <stop offset="90%" stopColor="#293324" />
          <stop offset="100%" stopColor="#1B2217" />
        </linearGradient>

        {/* Flanged Metallic Rim of the Pot */}
        <linearGradient id="potRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A3525" />
          <stop offset="25%" stopColor="#4E5E47" />
          <stop offset="50%" stopColor="#718269" />
          <stop offset="75%" stopColor="#4E5E47" />
          <stop offset="100%" stopColor="#222B1E" />
        </linearGradient>

        {/* Pot Rust and Scratch Oxidation */}
        <linearGradient id="potRustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="60%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Stitched Burlap / Leather Patch on Pot */}
        <linearGradient id="potPatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="50%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
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
            <ellipse cx="210" cy="430" rx="36" ry="8.5" fill="url(#puddleGrad)" opacity="0.7" />
            <ellipse cx="210" cy="430" rx="22" ry="5" fill="none" stroke="#38BDF8" strokeWidth="1.2" opacity="0.55" />
          </g>
        )}

        {/* KINEMATIC SNEAKING SNOWMAN */}
        <g
          id="sn-crouch-group"
          transform={`translate(0, ${bobY}) rotate(${crouchAngle}, 205, 300)`}
        >
          {/* 1. BACK LEG (Slender, agile, trailing leg with melting stalactite drips) */}
          <g id="sn-back-leg" transform={`translate(170, 275) rotate(${backLegAngle})`}>
            {/* Slender Back Leg Thigh and Calf */}
            <path
              d="M -14,-5 C -22,30 -26,68 -36,105 C -40,118 -30,128 -14,126 C 2,124 10,112 11,90 C 12,58 11,28 8,-5 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Melting Stalactites / Drips hanging on Back Leg */}
            <path
              d="M -32,68 C -36,76 -38,86 -34,92 C -31,88 -29,78 -27,70 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M -18,102 C -22,112 -23,121 -20,125 C -17,121 -15,112 -14,102 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M 4,75 C 2,85 4,92 7,93 C 9,89 8,80 8,74 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.6"
            />

            {/* Back Snowy Foot splashing into puddle */}
            <path
              d="M -36,105 C -56,114 -74,122 -70,135 C -66,145 -46,147 -14,143 C 12,140 24,133 22,122 C 18,112 2,110 -14,110 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Foot Melting Details */}
            <path
              d="M -60,136 C -62,144 -60,150 -56,150 C -53,146 -54,140 -55,136 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            <path
              d="M -42,140 C -44,148 -42,153 -39,153 C -36,149 -37,143 -38,140 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            {/* Falling Water Droplet from Back Thigh */}
            <g transform={`translate(-30, ${76 + dripCycle1 * 50}) scale(${1 - dripCycle1 * 0.3})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>

          {/* 2. BROOM (Held firmly in back hand, birch twigs & natural wood handle) */}
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

          {/* 3. SLENDER MELTING TORSO (Hubenější tající tělo dle předlohy) */}
          <g id="sn-torso">
            {/* Slimmer hunched snow chest, waist & belly with melting folds */}
            <path
              d="M 188,142
                 C 165,152 145,172 138,198
                 C 132,224 138,248 146,270
                 C 152,286 160,302 174,316
                 C 188,326 210,330 226,322
                 C 244,312 254,292 256,272
                 C 258,248 254,222 248,198
                 C 242,174 232,154 212,144 Z"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.5 : 0}
              strokeLinejoin="round"
            />

            {/* Melting stalactites and drips hanging along the slender torso underside and back */}
            <g id="sn-stalactites" className="sn-stalactites">
              {/* Back icicle drips */}
              <path
                d="M 142,215 C 137,228 136,242 140,244 C 143,240 144,228 147,218 Z"
                fill="#A2CCE5"
                stroke="#1C1610"
                strokeWidth="1.8"
              />
              <path
                d="M 148,252 C 144,266 145,278 149,279 C 152,274 153,264 155,254 Z"
                fill="#A2CCE5"
                stroke="#1C1610"
                strokeWidth="1.8"
              />
              {/* Belly & lower torso icicle stalactites */}
              <path
                d="M 166,306 C 163,322 165,334 169,335 C 172,330 172,318 174,308 Z"
                fill="#A2CCE5"
                stroke="#1C1610"
                strokeWidth="2"
              />
            <path
              d="M 188,322 C 185,340 188,352 192,353 C 195,346 195,334 196,322 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="2"
            />
            <path
              d="M 210,324 C 208,338 211,348 214,349 C 217,344 217,334 218,324 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M 234,312 C 232,326 235,335 238,335 C 241,330 240,320 242,310 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            </g>

            {/* Falling Water Droplets from Slender Torso */}
            <g transform={`translate(169, ${335 + dripCycle2 * 55}) scale(${1 - dripCycle2 * 0.25})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
            <g transform={`translate(192, ${353 + dripCycle3 * 50}) scale(${1 - dripCycle3 * 0.25})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
            <g transform={`translate(214, ${349 + dripCycle5 * 45}) scale(${1 - dripCycle5 * 0.25})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>

            {/* Melting surface creases, ribs and blue shadows on slender body */}
            <path d="M 152,192 C 148,220 152,248 168,272" stroke="#A2CCE5" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 152,192 C 148,220 152,248 168,272" stroke="#1C1610" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M 175,230 C 190,242 205,248 224,242" stroke="#A2CCE5" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 182,270 C 198,280 214,282 230,274" stroke="#A2CCE5" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* 3 Irregular Charcoal Coal Buttons vertically aligned down the slimmer torso */}
            <g id="sn-coal-buttons">
              {/* Top Button */}
              <g transform="translate(230, 202)">
                <path d="M -7,-5 C -2,-9 5,-7 8,-2 C 10,3 7,8 2,9 C -4,10 -9,5 -9,-1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.4" />
                <circle cx="-1.5" cy="-2.5" r="1.3" fill="#71717A" />
              </g>
              {/* Middle Button */}
              <g transform="translate(222, 238)">
                <path d="M -8,-4 C -3,-10 6,-8 9,-3 C 11,3 8,9 3,10 C -3,11 -10,7 -10,1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.4" />
                <circle cx="-1.5" cy="-1.5" r="1.3" fill="#71717A" />
              </g>
              {/* Bottom Button */}
              <g transform="translate(210, 274)">
                <path d="M -8,-5 C -4,-10 7,-8 10,-3 C 11,4 9,10 2,11 C -4,12 -10,7 -10,1 Z" fill="url(#coalGrad)" stroke="#1C1610" strokeWidth="2.4" />
                <circle cx="-2" cy="-1.5" r="1.4" fill="#71717A" />
              </g>
            </g>
          </g>

          {/* 4. FRONT LEG (Longer, slender, stepping forward boldly, melting snowy foot) */}
          <g id="sn-front-leg" transform={`translate(225, 290) rotate(${frontLegAngle})`}>
            {/* Slender Front Leg Thigh and Shin */}
            <path
              d="M -10,-5 C -4,28 0,62 16,96 C 24,112 38,122 58,124 C 74,126 84,118 82,106 C 80,92 64,88 54,76 C 36,56 26,26 18,-5 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Melting Drips hanging on slender front leg */}
            <path
              d="M 6,56 C 4,68 6,77 9,78 C 12,74 11,64 13,56 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M 26,84 C 24,96 26,105 29,106 C 32,102 31,92 33,84 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            <path
              d="M 44,104 C 42,114 44,120 47,120 C 49,116 48,108 49,102 Z"
              fill="#A2CCE5"
              stroke="#1C1610"
              strokeWidth="1.6"
            />

            {/* Front Sculpted Melting Snowy Foot */}
            <path
              d="M 16,98 C 22,116 34,130 64,130 C 88,130 102,120 98,106 C 94,94 76,95 56,95 C 40,95 24,96 16,98 Z"
              fill="url(#snLegMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.2 : 0}
            />
            {/* Drip on toe tip */}
            <path
              d="M 94,114 C 96,124 98,130 102,130 C 104,126 103,118 100,112 Z"
              fill="#7DD3FC"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            {/* Falling Water Droplet from Front Knee */}
            <g transform={`translate(9, ${78 + dripCycle4 * 50}) scale(${1 - dripCycle4 * 0.3})`}>
              <path d="M 0,0 C -3,4 -4,8 0,11 C 4,8 3,4 0,0 Z" fill="url(#dripBlueGrad)" stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>

          {/* 5. ARMS (Slender melting arms holding broom & sneaking forward) */}
          <g id="sn-arms">
            {/* Rear arm holding broom with mitten hand */}
            <path
              d="M 192,180 C 214,190 240,194 262,206 C 272,212 280,222 278,234 C 274,242 262,238 250,230 C 235,220 214,210 192,200 Z"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 3.8 : 0}
            />
            {/* Snowy Mitten Hand wrapped around handle */}
            <ellipse cx="276" cy="230" rx="13" ry="11" fill="url(#snMeltGrad)" stroke="#1C1610" strokeWidth="3.2" />
            <path d="M 266,224 C 270,220 278,220 284,224" stroke="#1C1610" strokeWidth="2.2" fill="none" />
            {/* Drip hanging from elbow */}
            <path d="M 230,206 C 229,218 231,225 234,225 C 236,221 235,214 236,208 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />

            {/* Front sneaking arm with curled melting hand */}
            <path
              d="M 218,175 C 236,182 250,192 256,206 C 260,216 256,225 248,228 C 240,230 234,224 230,216 C 226,206 218,196 210,188 Z"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 3.6 : 0}
            />
            <ellipse cx="250" cy="216" rx="9" ry="8" fill="url(#snMeltGrad)" stroke="#1C1610" strokeWidth="2.8" />
            <path d="M 244,214 C 248,211 254,211 258,214" stroke="#1C1610" strokeWidth="1.8" fill="none" />
            <path d="M 248,224 C 247,232 249,236 251,236 C 253,233 252,228 253,224 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.4" />
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

          {/* 7. HEAD & INVERTED COOKING POT (Hrnec na hlavě) */}
          <g id="sn-head" transform={`translate(225, 125)`}>
            {/* Snow Head Sphere */}
            <circle
              cx="0"
              cy="-42"
              r="44"
              fill="url(#snMeltGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? 4.5 : 0}
            />
            {/* Shading contour on head */}
            <path d="M -36,-48 C -42,-24 -30,2 -4,-2" stroke="#A2CCE5" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M -36,-48 C -42,-24 -30,2 -4,-2" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Melting Stalactite Drips hanging from Chin and Cheeks */}
            <path d="M -15,-2 C -18,12 -17,20 -14,21 C -11,18 -12,8 -10,-2 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.8" />
            <path d="M 6,-1 C 4,14 6,24 9,25 C 12,20 11,10 13,-1 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.8" />
            <path d="M -28,-18 C -32,-6 -30,2 -27,3 C -25,-1 -26,-9 -25,-18 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />

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

              {/* Carrot Nose (Pointing forward with textured ridges and melting drip) */}
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

            {/* ======================================================== */}
            {/* HRNEC NA HLAVĚ (INVERTED COOKING POT WITH EAR & PATCH)  */}
            {/* ======================================================== */}
            <g id="sn-pot-hat" className="sn-pot-headgear" transform="translate(-10, -84) rotate(-8)">
              {/* Backwards compatibility id anchor */}
              <g id="sn-top-hat" opacity="0" pointerEvents="none" />

              {/* Pine Needle Sprig (Borovicové jehličí) sticking out under the pot rim */}
              <g transform="translate(-34, 10)">
                <line x1="0" y1="0" x2="-26" y2="-12" stroke="#78350F" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="-8" y1="-4" x2="-20" y2="-22" stroke="#166534" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="-14" y1="-7" x2="-28" y2="-18" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="-20" y1="-9" x2="-36" y2="-12" stroke="#166534" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="-6" y1="-3" x2="-14" y2="-18" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
              </g>

              {/* Iron Pot Handle / Ear (Ucho hrnce) on rear left side */}
              <g id="pot-ear-handle" transform="translate(-32, -18)">
                {/* Rivet base plates */}
                <circle cx="0" cy="-14" r="3.2" fill="#1C1610" />
                <circle cx="0" cy="-14" r="1.8" fill="#64748B" />
                <circle cx="0" cy="8" r="3.2" fill="#1C1610" />
                <circle cx="0" cy="8" r="1.8" fill="#64748B" />
                {/* Forged Iron Curved Handle Loop */}
                <path
                  d="M 0,-14 C -14,-14 -16,8 0,8"
                  fill="none"
                  stroke="#1C1610"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0,-14 C -14,-14 -16,8 0,8"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </g>

              {/* INVERTED POT BODY (Tělo omláceného hrnce - kónický tvar) */}
              <path
                d="M -32,16
                   C -30,-18 -24,-52 -16,-58
                   C -2,-62 26,-62 42,-56
                   C 48,-52 50,-18 52,16 Z"
                fill="url(#potEnamelGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? 4.2 : 0}
                strokeLinejoin="round"
              />

              {/* Rust blemishes and metallic scrape marks on pot surface */}
              <path
                d="M -18,-38 C -14,-46 -8,-44 -10,-34 C -12,-26 -16,-28 -18,-38 Z"
                fill="url(#potRustGrad)"
                opacity="0.85"
              />
              <path
                d="M 28,-14 C 36,-18 38,-10 32,-6 C 26,-2 24,-10 28,-14 Z"
                fill="url(#potRustGrad)"
                opacity="0.8"
              />
              <line x1="-12" y1="-22" x2="6" y2="-26" stroke="#222B1E" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="8" y1="-42" x2="24" y2="-40" stroke="#718269" strokeWidth="1.4" strokeLinecap="round" />

              {/* Stitched Burlap / Leather Patch on Pot (Záplata s křížkovým stehem) */}
              <g transform="translate(14, -28) rotate(-4)">
                <polygon
                  points="-12,-10 11,-8 9,13 -14,11"
                  fill="url(#potPatchGrad)"
                  stroke="#1C1610"
                  strokeWidth="2.2"
                />
                {/* White Stitches around the patch */}
                <line x1="-10" y1="-12" x2="-10" y2="-6" stroke="#FEF3C7" strokeWidth="1.5" />
                <line x1="2" y1="-10" x2="2" y2="-4" stroke="#FEF3C7" strokeWidth="1.5" />
                <line x1="11" y1="-2" x2="5" y2="-2" stroke="#FEF3C7" strokeWidth="1.5" />
                <line x1="9" y1="8" x2="3" y2="8" stroke="#FEF3C7" strokeWidth="1.5" />
                <line x1="-12" y1="4" x2="-6" y2="4" stroke="#FEF3C7" strokeWidth="1.5" />
                {/* Center cross stitch */}
                <line x1="-3" y1="-2" x2="3" y2="4" stroke="#FEF3C7" strokeWidth="1.4" />
                <line x1="3" y1="-2" x2="-3" y2="4" stroke="#FEF3C7" strokeWidth="1.4" />
              </g>

              {/* FLANGED ROLLED POT RIM (Masivní vyhrnutý okraj / lem hrnce) */}
              <g id="pot-flanged-rim">
                <path
                  d="M -46,14
                     C -20,6 36,6 66,14
                     C 72,17 70,27 60,27
                     C 32,20 -20,20 -44,27
                     C -50,25 -52,17 -46,14 Z"
                  fill="url(#potRimGrad)"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 4.2 : 0}
                  strokeLinejoin="round"
                />
                {/* Highlight along pot rim flange */}
                <path
                  d="M -40,17 C -18,10 32,10 58,17"
                  fill="none"
                  stroke="#8A9D82"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Melting Stalactite Drips hanging from Pot Rim */}
                <path d="M -36,25 C -38,36 -37,44 -34,44 C -32,40 -33,32 -32,25 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />
                <path d="M -16,23 C -17,32 -16,38 -13,38 C -11,35 -12,28 -12,23 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.5" />
                <path d="M 10,23 C 9,35 11,43 14,43 C 16,39 15,30 16,23 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />
                <path d="M 44,24 C 43,34 45,41 48,41 C 50,38 49,30 49,24 Z" fill="#A2CCE5" stroke="#1C1610" strokeWidth="1.6" />
              </g>

              {/* THICK MELTING SNOW CAP ON TOP (Dno obráceného hrnce pokryté tajícím sněhem) */}
              <g id="pot-snow-crust">
                <path
                  d="M -22,-55
                     C -16,-68 -2,-72 16,-71
                     C 30,-70 40,-64 44,-53
                     C 36,-51 26,-53 18,-49
                     C 8,-46 -2,-56 -10,-52
                     C -14,-50 -18,-54 -22,-55 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth={showOutline ? 3.5 : 0}
                />
                {/* Snow drips cascading down the side of the pot */}
                <path
                  d="M 38,-51 C 43,-41 45,-30 43,-25 C 41,-25 39,-34 37,-48 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="1.8"
                />
                <path
                  d="M -12,-52 C -13,-42 -10,-32 -7,-28 C -6,-30 -8,-40 -10,-50 Z"
                  fill="#FFFFFF"
                  stroke="#1C1610"
                  strokeWidth="1.6"
                />
              </g>
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
