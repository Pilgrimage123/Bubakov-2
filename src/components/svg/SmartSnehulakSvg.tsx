import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartSnehulakSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale illustration of the angry sneaking snowman
 * Features:
 * - Two-legged sneaky walk kinematics
 * - Sweeping broom with birch twigs and twine binding
 * - Battered pot hat with snow crust and pine needles
 * - Red-and-dark striped woolen fringe scarf
 * - Expressive carrot nose and angry coal eyes with interactive cursor tracking
 * - Dynamic snow flurry and wind particles
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

  // Head and accessories
  const headBob = isWalking ? Math.sin(t * walkFreq * 2) * 2.5 : Math.sin(t * 2.5) * 1.5;
  const scarfWave = Math.sin(t * (isAction ? 16 : isWalking ? 10 : 3.5)) * (isAction ? 18 : isWalking ? 12 : 5);
  const broomAngle = isAction ? -25 + Math.sin(t * 16) * 32 : isWalking ? -12 + walkCos * 14 : -10 + Math.sin(t * 2) * 4;

  // Cursor tracking offsets for eyes and carrot nose
  const lookX = pointer.isHovered ? pointer.x * 7 : Math.sin(t * 1.5) * 2;
  const lookY = pointer.isHovered ? pointer.y * 6 : 0;
  const noseWiggle = isAction ? Math.sin(t * 30) * 4 : 0;

  // Flurry particles during action or walking
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
      aria-label="Smart animovaný Sněhulák s koštětem"
    >
      <defs>
        {/* Snow Body Gradients */}
        <radialGradient id="snowGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F0F8FF" />
          <stop offset="85%" stopColor="#D9EEF9" />
          <stop offset="100%" stopColor="#BADCF0" />
        </radialGradient>

        <radialGradient id="snowLegGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E2F1F8" />
          <stop offset="100%" stopColor="#B3D5E7" />
        </radialGradient>

        {/* Battered Pot Gradient */}
        <linearGradient id="potGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#647466" />
          <stop offset="35%" stopColor="#4A584C" />
          <stop offset="70%" stopColor="#374338" />
          <stop offset="100%" stopColor="#252D26" />
        </linearGradient>

        {/* Carrot Nose Gradient */}
        <linearGradient id="carrotGrad" x1="0%" y1="40%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>

        {/* Scarf Red Knit Gradient */}
        <linearGradient id="scarfRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>

        {/* Scarf Dark Stripe */}
        <linearGradient id="scarfDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#450A0A" />
          <stop offset="100%" stopColor="#2A0505" />
        </linearGradient>

        {/* Broom Wood Handle */}
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9A6A38" />
          <stop offset="45%" stopColor="#784B22" />
          <stop offset="100%" stopColor="#4A2D12" />
        </linearGradient>

        {/* Twigs Bristles */}
        <linearGradient id="twigsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B48243" />
          <stop offset="60%" stopColor="#7C5223" />
          <stop offset="100%" stopColor="#4D3110" />
        </linearGradient>

        {/* Ink outline filter for genuine Czech hand-drawn book feel */}
        <filter id="ladaPaperDrop" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#1C1610" floodOpacity="0.18" />
        </filter>
      </defs>

      <g
        transform={`translate(220, 240) scale(${direction}, 1) translate(-220, -240)`}
        filter="url(#ladaPaperDrop)"
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <ellipse
            cx={210}
            cy={425}
            rx={95 + (isWalking ? Math.sin(t * walkFreq) * 10 : 0)}
            ry={17}
            fill="#1E293B"
            opacity="0.22"
          />
        )}

        {/* DYNAMIC SNOW PARTICLES / FLURRY (ACTION / RUN) */}
        {showParticles && (isAction || isWalking) && (
          <g className="snow-flurry">
            {particles.map((p, idx) => (
              <circle
                key={idx}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="#F0F9FF"
                stroke="#1C1610"
                strokeWidth="1.2"
                opacity={p.op}
              />
            ))}
            {/* Speed wind slashes */}
            <path
              d={`M 110,${370 + Math.sin(t * 10) * 8} q -25,-4 -45,2`}
              stroke="#1C1610"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d={`M 130,${390 + Math.cos(t * 10) * 8} q -20,-2 -35,5`}
              stroke="#1C1610"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>
        )}

        {/* ROOT CHARACTER CONTAINER WITH CROUCH & BOB */}
        <g transform={`translate(0, ${bobY}) rotate(${crouchAngle}, 205, 300)`}>

          {/* 1. BACK LEG (BENT SNEAKING LEG) */}
          <g transform={`translate(170, 275) rotate(${backLegAngle})`}>
            {/* Thigh & Shank */}
            <path
              d="M -12,0 C -22,40 -26,75 -35,110 C -39,122 -30,132 -14,130 C 6,128 14,115 15,95 C 16,65 14,35 12,0 Z"
              fill="url(#snowLegGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4" : "2"}
              strokeLinejoin="round"
            />
            {/* Chunky Snow Boot/Foot */}
            <path
              d="M -35,110 C -52,118 -70,126 -65,138 C -61,146 -45,148 -18,145 C 8,142 22,136 20,126 C 18,114 -8,116 -18,114 Z"
              fill="url(#snowLegGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Foot sole contour line */}
            <path
              d="M -60,140 Q -20,146 16,134"
              stroke="#1C1610"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* 2. BROOMSTICK & TWIG BRISTLES (HELD BY HANDS) */}
          <g transform={`translate(285, 230) rotate(${broomAngle})`}>
            {/* Long Wooden Birch Handle */}
            <rect
              x="-6"
              y="-150"
              width="12"
              height="330"
              rx="4"
              fill="url(#woodGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Bark notches on stick */}
            <line x1="-3" y1="-90" x2="3" y2="-88" stroke="#1C1610" strokeWidth="2" />
            <line x1="-2" y1="-20" x2="4" y2="-18" stroke="#1C1610" strokeWidth="2" />
            <line x1="-3" y1="50" x2="3" y2="52" stroke="#1C1610" strokeWidth="2" />
            <line x1="-3" y1="120" x2="3" y2="122" stroke="#1C1610" strokeWidth="2" />

            {/* Broom Head: Bundled Birch Twigs */}
            <g transform="translate(0, -145)">
              {/* Twig mass */}
              <path
                d="M -22,0 C -36,-45 -48,-100 -36,-135 C -30,-140 -20,-142 -12,-120 C -6,-148 4,-148 10,-122 C 18,-145 28,-140 34,-130 C 45,-95 35,-45 22,0 Z"
                fill="url(#twigsGrad)"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Individual twig bristles details */}
              <path
                d="M -16,-20 L -30,-115 M -8,-20 L -12,-132 M 0,-20 L 4,-138 M 8,-20 L 16,-128 M 16,-20 L 28,-118 M -22,-60 L -38,-105 M 20,-60 L 36,-100"
                stroke="#45270A"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Wound twine / rope binding holding the twigs */}
              <rect x="-24" y="-18" width="48" height="9" rx="3" fill="#D97706" stroke="#1C1610" strokeWidth="3" />
              <line x1="-22" y1="-14" x2="22" y2="-14" stroke="#78350F" strokeWidth="2" />
              <line x1="-22" y1="-11" x2="22" y2="-11" stroke="#FEF3C7" strokeWidth="1.5" />
              <line x1="-22" y1="-8" x2="22" y2="-8" stroke="#78350F" strokeWidth="2" />
            </g>
          </g>

          {/* 3. SNOWMAN TORSO & PLUMP ROUND BELLY */}
          <g id="snowman-torso">
            {/* Chunky snow body with distinctive hunchback silhouette */}
            <path
              d="M 180,140 C 145,155 125,185 120,225 C 112,275 125,320 160,345 C 195,368 250,360 275,325 C 298,295 292,245 278,205 C 265,168 235,142 180,140 Z"
              fill="url(#snowGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3"}
              strokeLinejoin="round"
            />

            {/* Snow texture stippling & shade folds */}
            <path
              d="M 132,235 C 128,260 135,290 152,315"
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 155,335 C 180,352 225,355 255,330"
              stroke="#93C5FD"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Three Bumpy Black Coal Buttons */}
            {/* Top Button */}
            <ellipse cx={245} cy={225} rx={8.5} ry={7.5} fill="#18181B" stroke="#1C1610" strokeWidth="2.5" />
            <circle cx={243} cy={223} r={2.2} fill="#71717A" />

            {/* Middle Button */}
            <ellipse cx={238} cy={260} rx={9} ry={8} fill="#18181B" stroke="#1C1610" strokeWidth="2.5" />
            <circle cx={235} cy={258} r={2.4} fill="#71717A" />

            {/* Bottom Button */}
            <ellipse cx={226} cy={298} rx={9.5} ry={8.5} fill="#18181B" stroke="#1C1610" strokeWidth="2.5" />
            <circle cx={223} cy={295} r={2.5} fill="#71717A" />
          </g>

          {/* 4. FRONT LEG (STEPPING FORWARD WITH STOUT WEIGHT) */}
          <g transform={`translate(225, 290) rotate(${frontLegAngle})`}>
            {/* Powerful forward snow leg */}
            <path
              d="M -14,0 C -8,35 -2,70 18,105 C 28,122 45,130 68,132 C 86,134 98,125 96,112 C 94,98 75,95 62,82 C 42,62 30,30 22,0 Z"
              fill="url(#snowLegGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3"}
              strokeLinejoin="round"
            />
            {/* Front Foot / Boot with Flat Sturdy Tread */}
            <path
              d="M 18,105 C 24,124 38,138 72,138 C 96,138 112,126 108,112 C 104,98 84,98 68,90 Z"
              fill="url(#snowLegGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Ground contact line on foot */}
            <path
              d="M 28,136 Q 65,142 105,125"
              stroke="#1C1610"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* 5. TRAILING SCARF TAIL (BILLOWING IN WIND) */}
          <g transform={`translate(155, 142) rotate(${-crouchAngle + scarfWave})`}>
            {/* Red and dark striped trailing wool scarf */}
            <path
              d="M 0,0 C -35,-8 -75,6 -105,25 C -122,35 -132,55 -136,75 C -124,78 -112,68 -100,52 C -78,32 -45,18 0,16 Z"
              fill="url(#scarfRedGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Scarf Dark Wool Stripes */}
            <path
              d="M -30,-2 C -40,3 -45,12 -38,18 L -48,22 C -55,14 -50,5 -40,1 Z"
              fill="url(#scarfDarkGrad)"
            />
            <path
              d="M -70,9 C -80,18 -84,28 -76,34 L -88,38 C -95,30 -90,19 -80,13 Z"
              fill="url(#scarfDarkGrad)"
            />
            <path
              d="M -105,28 C -114,38 -118,52 -110,60 L -120,66 C -128,55 -124,40 -115,32 Z"
              fill="url(#scarfDarkGrad)"
            />
            {/* Knitted Fringe Tassels at tip */}
            <path
              d="M -136,75 L -148,88 M -133,78 L -145,95 M -128,80 L -138,100 M -122,80 L -130,102 M -116,77 L -120,98"
              stroke="#B91C1C"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* 6. SNOW HEAD & ANGRY FACE */}
          <g transform={`translate(225, 125) translate(0, ${headBob})`}>
            {/* Neck Scarf Collar Wrap (Front loop) */}
            <g transform="translate(-50, 0)">
              <path
                d="M 0,5 C 20,18 60,20 95,6 C 105,2 108,-12 95,-18 C 70,-26 25,-26 -5,-12 C -15,-5 -12,2 0,5 Z"
                fill="url(#scarfRedGrad)"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Scarf collar folds */}
              <path
                d="M 22,-18 C 30,2 28,10 32,18 M 65,-18 C 72,-2 70,8 72,16"
                stroke="#450A0A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>

            {/* Round Snow Head */}
            <circle
              cx={0}
              cy={-42}
              r={46}
              fill="url(#snowGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
            />

            {/* Snow head shadow contour */}
            <path
              d="M -36,-30 C -42,-10 -30,15 -5,12"
              stroke="#93C5FD"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* FACE: Wicked Angry Eyebrows, Coal Eyes, Scowl */}
            <g transform={`translate(${lookX}, ${lookY})`}>
              {/* Back Brow & Eye */}
              <path
                d="M -16,-62 Q -6,-65 2,-55"
                stroke="#18181B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx={-5} cy={-54} r={4.5} fill="#18181B" />
              <circle cx={-6} cy={-55} r={1.3} fill="#FFFFFF" />

              {/* Front Angry Brow (V-angled, menacing furrow) */}
              <path
                d="M 12,-60 Q 24,-66 38,-54"
                stroke="#18181B"
                strokeWidth="4.8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx={25} cy={-52} r={5} fill="#18181B" />
              <circle cx={24} cy={-53} r={1.5} fill="#FFFFFF" />

              {/* Frowning, Angry Mouth */}
              <path
                d="M 8,-30 Q 18,-36 28,-33 Q 34,-31 40,-35"
                stroke="#18181B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Little scowl dimple */}
              <line x1="7" y1="-33" x2="6" y2="-27" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

              {/* LONG POINTED CARROT NOSE WITH RIDGES */}
              <g transform={`translate(28, -42) rotate(${noseWiggle})`}>
                {/* Carrot cone */}
                <path
                  d="M 0,-8 C 25,-6 65,3 88,14 C 65,18 20,16 0,8 Z"
                  fill="url(#carrotGrad)"
                  stroke="#1C1610"
                  strokeWidth="3.6"
                  strokeLinejoin="round"
                />
                {/* Carrot root base rings */}
                <ellipse cx={2} cy={0} rx={4} ry={8} fill="#EA580C" stroke="#1C1610" strokeWidth="2.5" />
                {/* Carrot ridges */}
                <path d="M 22,-4 Q 24,1 21,7" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M 44,-1 Q 46,5 43,11" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M 64,4 Q 66,9 63,13" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            </g>

            {/* 7. BATTERED OLD POT HAT WITH SNOW AND PINE NEEDLES */}
            <g transform="translate(-8, -82) rotate(-8)">
              {/* Pine Needles sticking out at back of pot */}
              <g className="pine-needles">
                <line x1="-30" y1="6" x2="-62" y2="-6" stroke="#14532D" strokeWidth="3.2" strokeLinecap="round" />
                <line x1="-32" y1="12" x2="-65" y2="10" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
                <line x1="-28" y1="16" x2="-58" y2="24" stroke="#854D0E" strokeWidth="2.8" strokeLinecap="round" />
              </g>

              {/* The Metal Pot Hat */}
              {/* Inverted Bucket / Pot body */}
              <path
                d="M -32,18 C -30,-15 -25,-48 -18,-52 C -5,-55 25,-55 38,-50 C 44,-46 48,-15 50,18 Z"
                fill="url(#potGrad)"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Flared Pot Rim */}
              <path
                d="M -42,16 C -15,10 35,10 60,16 C 65,18 63,26 55,27 C 30,22 -20,22 -38,27 C -46,26 -46,18 -42,16 Z"
                fill="#374338"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />

              {/* Dents and mossy/rust patches on pot */}
              <path d="M 5,-28 Q 12,-30 18,-24" stroke="#252D26" strokeWidth="2.5" fill="none" />
              <circle cx={-8} cy={-22} r={3} fill="#854D0E" opacity="0.7" />
              <circle cx={22} cy={-12} r={4.5} fill="#14532D" opacity="0.65" />

              {/* Crust of Fresh White Snow on top crown of the pot */}
              <path
                d="M -20,-50 C -15,-62 -2,-66 12,-65 C 26,-64 36,-58 40,-48 C 30,-48 10,-46 -18,-48 Z"
                fill="#FFFFFF"
                stroke="#1C1610"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* 8. SNOW ARMS & MITTEN HANDS (GRIPPING BROOM) */}
          {/* Back Arm (Reaching forward) */}
          <g transform="translate(195, 210)">
            <path
              d="M 0,0 C 25,-5 55,-2 78,12 C 85,16 88,28 78,35 C 65,42 50,32 38,22 C 22,12 8,8 0,0 Z"
              fill="url(#snowGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Clenched snow fist / mitten */}
            <circle cx={78} cy={22} r={12} fill="url(#snowGrad)" stroke="#1C1610" strokeWidth="3.5" />
          </g>

          {/* Front Arm (Reaching up to grasp the broom handle firmly) */}
          <g transform="translate(235, 205)">
            <path
              d="M 0,0 C 18,10 32,25 44,45 C 50,55 58,54 64,44 C 68,30 52,15 35,0 C 22,-8 10,-5 0,0 Z"
              fill="url(#snowGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Front grasping mitten curled around handle */}
            <ellipse cx={56} cy={42} rx={14} ry={11} fill="url(#snowGrad)" stroke="#1C1610" strokeWidth="3.8" />
            {/* Thumb curved over stick */}
            <path
              d="M 48,34 Q 56,28 62,38"
              stroke="#1C1610"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>

        </g>
      </g>
    </svg>
  );
};
