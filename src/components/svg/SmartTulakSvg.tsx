import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartTulakSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech folklore illustration of the joyful laughing Wanderer / Vagabond (Tulák)
 * Features:
 * - Broad happy laughing expression with bushy white beard, red nose, and rosy cheeks
 * - Battered pointed felt hat with green band & sprig
 * - Patched tattered green coat with multi-colored stitched patches
 * - Heavy knobby wooden walking staff (sukovitá sukovice)
 * - Patched travel knapsack over shoulder & wooden canteen
 * - Patched trousers with rope belt & bandaged shins
 * - Jaunty walking stride kinematics and interactive cursor tracking
 */
export const SmartTulakSvg: React.FC<SmartCharacterProps> = ({
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
  const walkSpeed = isAction ? 12 : isWalking ? 9 : 2.5;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // High-stepping jaunty stride
  const backLegAngle = isWalking ? walkSin * 28 : isAction ? -15 + Math.sin(t * 14) * 12 : -8;
  const frontLegAngle = isWalking ? -walkSin * 30 : isAction ? 24 + Math.cos(t * 14) * 12 : 12;

  // Body bobbing and joyful bounce
  const bobY = isWalking ? Math.abs(walkSin) * 12 : isAction ? Math.abs(Math.sin(t * 12)) * 16 : Math.sin(t * 3.5) * 3;
  const torsoLean = isWalking ? 6 + walkSin * 4 : isAction ? -8 + Math.sin(t * 12) * 8 : 4;

  // Sukovice staff swing
  const staffAngle = isAction
    ? -28 + Math.sin(t * 14) * 35
    : isWalking
    ? -8 + walkCos * 14
    : pointer.isHovered
    ? pointer.y * 12
    : Math.sin(t * 2) * 3;

  // Sack and beard dynamics
  const sackBounce = Math.sin(t * (isWalking ? 18 : 3.5)) * (isWalking ? 8 : 2);
  const beardWave = Math.sin(t * (isWalking ? 14 : 3)) * (isWalking ? 6 : 2.5);

  // Gaze tracking
  const lookX = pointer.isHovered ? pointer.x * 6 : Math.sin(t * 1.5) * 2;
  const lookY = pointer.isHovered ? pointer.y * 4 : 0;

  // Musical joy notes during action
  const joyNotes = [
    { x: 340 + Math.sin(t * 4 + 1) * 20, y: 110 + ((t * 45) % 90), note: '♪', size: 18 },
    { x: 365 + Math.cos(t * 3.5 + 2) * 25, y: 90 + ((t * 50 + 30) % 90), note: '♫', size: 22 },
    { x: 320 + Math.sin(t * 4.2 + 3) * 18, y: 130 + ((t * 40 + 60) % 90), note: '♩', size: 16 },
  ];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 460 480"
      width={size}
      height={size}
      className={`smart-tulak-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný veselý Tulák s ranečkem a sukovicí"
    >
      <defs>
        {/* Warm Flesh Gradient */}
        <radialGradient id="tulakSkin" cx="42%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF2E8" />
          <stop offset="60%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>

        {/* Tattered Green Coat */}
        <linearGradient id="tulakCoat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60764D" />
          <stop offset="50%" stopColor="#465837" />
          <stop offset="100%" stopColor="#2E3C24" />
        </linearGradient>

        {/* Gnarly Wood Sukovice Staff */}
        <linearGradient id="sukoviceWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C98B50" />
          <stop offset="40%" stopColor="#A46835" />
          <stop offset="70%" stopColor="#7E4A1E" />
          <stop offset="100%" stopColor="#532C0D" />
        </linearGradient>

        {/* Patched Sack Linen */}
        <radialGradient id="sackGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="60%" stopColor="#EADBC0" />
          <stop offset="100%" stopColor="#CBB594" />
        </radialGradient>

        {/* Trousers Brown */}
        <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9B663A" />
          <stop offset="60%" stopColor="#784B22" />
          <stop offset="100%" stopColor="#4A2B0E" />
        </linearGradient>

        {/* Hat Felt */}
        <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C6044" />
          <stop offset="60%" stopColor="#59422C" />
          <stop offset="100%" stopColor="#3A2818" />
        </linearGradient>

        {/* Canteen Flask */}
        <radialGradient id="canteenGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="70%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </radialGradient>
      </defs>

      <g
        transform={`translate(225, 240) scale(${direction}, 1) translate(-225, -240)`}
      >
        {/* GROUND SHADOW */}
        {showShadow && (
          <ellipse
            cx={210}
            cy={440}
            rx={98 + (isWalking ? Math.sin(t * walkSpeed) * 8 : 0)}
            ry={17}
            fill="#1E293B"
            opacity="0.24"
          />
        )}

        {/* JOYFUL MUSICAL NOTES (ACTION / LAUGHTER) */}
        {showParticles && isAction && (
          <g className="joy-notes" fill="#D97706" opacity="0.85">
            {joyNotes.map((n, i) => (
              <text key={i} x={n.x} y={n.y} fontSize={n.size} fontWeight="bold" fontFamily="serif">
                {n.note}
              </text>
            ))}
          </g>
        )}

        {/* ROOT CONTAINER WITH JAUNTY BOB AND LEAN */}
        <g transform={`translate(0, ${bobY}) rotate(${torsoLean}, 210, 290)`}>

          {/* 1. TRAVEL KNAPSACK (SLUNG OVER SHOULDER BEHIND BACK) */}
          <g transform={`translate(100, 220) rotate(${sackBounce})`}>
            {/* Round bulky linen sack */}
            <path
              d="M 0,0 C -35,-25 -65,-5 -72,35 C -78,75 -45,105 -10,110 C 25,115 50,85 45,45 C 40,15 25,-15 0,0 Z"
              fill="url(#sackGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Tied cloth knot & neck on sack */}
            <path
              d="M 5,5 C 15,-10 28,-18 36,-12 C 40,-4 32,8 20,12 Z"
              fill="url(#sackGrad)"
              stroke="#1C1610"
              strokeWidth="3.2"
            />
            {/* Shoulder carrying strap */}
            <path
              d="M 12,8 Q 55,50 78,82"
              stroke="#92400E"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Stitched patches on sack */}
            {/* Brown square patch */}
            <rect x="-48" y="42" width="28" height="24" rx="2" fill="#854D0E" stroke="#1C1610" strokeWidth="2.5" transform="rotate(-8 -34 54)" />
            <path d="M -46,40 L -46,68 M -22,40 L -22,68 M -50,44 L -20,44 M -50,64 L -20,64" stroke="#1C1610" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Blue patch */}
            <rect x="-65" y="65" width="22" height="20" rx="2" fill="#2563EB" stroke="#1C1610" strokeWidth="2.5" transform="rotate(12 -54 75)" />
          </g>

          {/* 2. BACK LEG (JAUNTY STRIDE) */}
          <g transform={`translate(170, 280) rotate(${backLegAngle})`}>
            {/* Patched brown trousers leg */}
            <path
              d="M -14,0 C -22,35 -26,65 -32,95 C -25,108 -10,105 10,95 C 16,65 15,35 12,0 Z"
              fill="url(#pantsGrad)"
              stroke="#1C1610"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Tattered jagged hem */}
            <path d="M -32,95 L -26,108 L -18,98 L -10,109 L -2,98 L 8,108 L 10,95" stroke="#1C1610" strokeWidth="3" fill="none" />

            {/* Bandaged shin (White cloth rags wrapped around leg) */}
            <g transform="translate(-14, 98)">
              <rect x="-8" y="0" width="22" height="30" rx="3" fill="#F8FAFC" stroke="#1C1610" strokeWidth="3" />
              <line x1="-8" y1="8" x2="14" y2="10" stroke="#CBD5E1" strokeWidth="2.2" />
              <line x1="-8" y1="16" x2="14" y2="18" stroke="#CBD5E1" strokeWidth="2.2" />
              <line x1="-8" y1="24" x2="14" y2="26" stroke="#CBD5E1" strokeWidth="2.2" />
            </g>

            {/* Sturdy Brown Worn Boot with Sole & Heel */}
            <g transform="translate(-16, 126)">
              <path
                d="M -10,0 C -15,10 -25,18 -32,22 C -28,32 5,34 32,28 C 36,18 28,6 18,0 Z"
                fill="#583318"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Boot Heel & Tread */}
              <rect x="-28" y="22" width="16" height="7" fill="#2E1B0E" stroke="#1C1610" strokeWidth="2.5" />
              {/* Laces */}
              <line x1="-8" y1="4" x2="6" y2="8" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-6" y1="10" x2="8" y2="14" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>

          {/* 3. FRONT LEG (STEPPING FORWARD WITH EXAGGERATED PRANCE) */}
          <g transform={`translate(220, 275) rotate(${frontLegAngle})`}>
            {/* Patched trouser leg */}
            <path
              d="M -12,0 C -6,35 0,70 15,100 C 26,108 42,102 45,88 C 36,60 22,30 16,0 Z"
              fill="url(#pantsGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Jagged hem cuts */}
            <path d="M 12,98 L 18,110 L 26,100 L 34,112 L 40,102 L 46,95" stroke="#1C1610" strokeWidth="3" fill="none" />

            {/* Stitched Blue Heart/Oval Patch on front thigh */}
            <g transform="translate(14, 52) rotate(15)">
              <ellipse cx="0" cy="0" rx="11" ry="8" fill="#2563EB" stroke="#1C1610" strokeWidth="2.2" />
              <path d="M -8,0 L 8,0 M 0,-6 L 0,6" stroke="#1C1610" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>

            {/* Bandaged shin */}
            <g transform="translate(24, 98) rotate(10)">
              <rect x="-8" y="0" width="22" height="30" rx="3" fill="#F8FAFC" stroke="#1C1610" strokeWidth="3" />
              <line x1="-8" y1="8" x2="14" y2="10" stroke="#CBD5E1" strokeWidth="2.2" />
              <line x1="-8" y1="16" x2="14" y2="18" stroke="#CBD5E1" strokeWidth="2.2" />
              <line x1="-8" y1="24" x2="14" y2="26" stroke="#CBD5E1" strokeWidth="2.2" />
            </g>

            {/* Front Brown Boot Raised / Pointed */}
            <g transform="translate(28, 126) rotate(12)">
              <path
                d="M -10,0 C -5,12 8,24 35,28 C 45,28 52,22 48,12 C 40,4 25,0 12,-2 Z"
                fill="#583318"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Distinctive boot sole with hobnails */}
              <path d="M -8,15 Q 15,26 44,22" stroke="#1C1610" strokeWidth="3" fill="none" />
              <circle cx="2" cy="18" r="1.8" fill="#1C1610" />
              <circle cx="15" cy="20" r="1.8" fill="#1C1610" />
              <circle cx="28" cy="19" r="1.8" fill="#1C1610" />
              {/* Laces */}
              <line x1="2" y1="4" x2="12" y2="8" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>

          {/* 4. TATTERED GREEN COAT & WHITE LINEN SHIRT */}
          <g id="tulak-torso" transform="translate(180, 160)">
            {/* White/Cream Peasant Shirt */}
            <path
              d="M -12,0 L -18,65 L 42,65 L 36,0 C 22,12 5,12 -12,0 Z"
              fill="#FFFDF5"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Shirt button placket & chest opening */}
            <line x1="12" y1="4" x2="12" y2="65" stroke="#1C1610" strokeWidth="2.2" />
            <circle cx="12" cy="22" r="2.2" fill="#78350F" />
            <circle cx="12" cy="40" r="2.2" fill="#78350F" />

            {/* Rope belt (Provaz) tied around waist with dangling ends */}
            <g transform="translate(-16, 62)">
              <rect x="0" y="0" width="62" height="7" rx="3" fill="#D97706" stroke="#1C1610" strokeWidth="2.2" />
              <path d="M 32,7 C 35,18 42,28 40,38 M 30,7 C 26,18 24,28 28,36" stroke="#B45309" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>

            {/* Ragged Tattered Green Coat */}
            <path
              d="M -35,5 C -45,45 -55,95 -35,125 C -15,115 -5,130 15,118 C 35,130 45,115 65,122 C 72,95 65,45 52,5 C 32,-4 -15,-4 -35,5 Z"
              fill="url(#tulakCoat)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />
            {/* Tattered Coat Tail Cuts & Fringes */}
            <path
              d="M -35,125 L -28,138 L -18,126 L -8,140 L 4,124 L 16,138 L 28,125 L 40,138 L 52,122 L 65,122"
              stroke="#1C1610"
              strokeWidth="3.2"
              fill="none"
            />

            {/* MULTI-COLORED PATCHES ON COAT */}
            {/* Brown shoulder patch */}
            <rect x="-38" y="32" width="18" height="18" rx="2" fill="#854D0E" stroke="#1C1610" strokeWidth="2.2" transform="rotate(-12 -29 41)" />
            {/* Purple patch */}
            <rect x="25" y="82" width="16" height="15" rx="2" fill="#7E22CE" stroke="#1C1610" strokeWidth="2" transform="rotate(10 33 89)" />
            {/* Pale ochre patch */}
            <rect x="-18" y="95" width="15" height="14" rx="2" fill="#D97706" stroke="#1C1610" strokeWidth="2" transform="rotate(-6 -10 102)" />

            {/* WOODEN CANTEEN / FLASK (ČUTORA) HANGING AT RIGHT HIP */}
            <g transform="translate(-32, 75)">
              <line x1="8" y1="-20" x2="-2" y2="0" stroke="#78350F" strokeWidth="2.5" />
              {/* Flask body */}
              <ellipse cx="-4" cy="12" rx="12" ry="15" fill="url(#canteenGrad)" stroke="#1C1610" strokeWidth="3" />
              {/* Wooden spout & stopper */}
              <rect x="-7" y="-2" width="6" height="6" rx="1" fill="#CA8A04" stroke="#1C1610" strokeWidth="1.8" />
            </g>
          </g>

          {/* 5. MASSIVE KNOBBY WOODEN WALKING STAFF (SUKOVITÁ SUKOVICE) */}
          <g transform={`translate(285, 230) rotate(${staffAngle})`}>
            {/* Big gnarly knobby branch staff */}
            <path
              d="M -12,-160 C -18,-115 -2,-80 -14,-35 C -6,10 -16,65 -8,120 C -4,165 -10,210 -8,255 L 4,255 C 6,210 0,165 6,120 C 0,65 14,10 6,-35 C 16,-80 2,-115 12,-160 Z"
              fill="url(#sukoviceWood)"
              stroke="#1C1610"
              strokeWidth={showOutline ? "4.5" : "3.5"}
              strokeLinejoin="round"
            />

            {/* DISTINCTIVE PROMINENT WOODEN KNOBS & BURLS (SUKY) */}
            {/* Top gnarly branch crown */}
            <g transform="translate(0, -160)">
              <circle cx="-16" cy="-8" r="9" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3" />
              <circle cx="-16" cy="-8" r="4" fill="#532C0D" stroke="#1C1610" strokeWidth="1.8" />
              <circle cx="15" cy="-14" r="8" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3" />
              <circle cx="15" cy="-14" r="3.5" fill="#532C0D" stroke="#1C1610" strokeWidth="1.8" />
            </g>

            {/* Upper Knob */}
            <circle cx="-14" cy="-85" r="11" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-14" cy="-85" r="5" fill="#532C0D" stroke="#1C1610" strokeWidth="2" />

            {/* Middle Knob */}
            <circle cx="12" cy="-25" r="12" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3.2" />
            <circle cx="12" cy="-25" r="5.5" fill="#532C0D" stroke="#1C1610" strokeWidth="2" />

            {/* Lower Knobs */}
            <circle cx="-10" cy="45" r="10" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3" />
            <circle cx="-10" cy="45" r="4.5" fill="#532C0D" stroke="#1C1610" strokeWidth="1.8" />
            <circle cx="10" cy="110" r="9" fill="url(#sukoviceWood)" stroke="#1C1610" strokeWidth="3" />

            {/* Wood Grain Lines */}
            <path d="M -4,-120 Q 2,-70 -3,-20 M 3,-20 Q -2,35 2,90" stroke="#532C0D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>

          {/* 6. LEFT ARM FIRMLY GRASPING THE SUKOVICE */}
          <g transform="translate(235, 185)">
            {/* Green coat sleeve */}
            <path
              d="M 0,0 C 18,5 40,15 54,32 C 60,42 55,54 44,52 C 30,46 15,30 0,22 Z"
              fill="url(#tulakCoat)"
              stroke="#1C1610"
              strokeWidth="3.8"
            />
            {/* Peasant hand clenched tightly around staff */}
            <g transform="translate(54, 38)">
              <ellipse cx="0" cy="0" rx="11" ry="9" fill="url(#tulakSkin)" stroke="#1C1610" strokeWidth="3" />
              {/* Fingers clenched */}
              <line x1="-8" y1="-6" x2="-8" y2="4" stroke="#1C1610" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-2" y1="-8" x2="-2" y2="6" stroke="#1C1610" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4" y1="-7" x2="4" y2="6" stroke="#1C1610" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>

          {/* 7. RIGHT ARM HOLDING SACK STRAP */}
          <g transform="translate(170, 185)">
            <ellipse cx="14" cy="15" rx="9" ry="8" fill="url(#tulakSkin)" stroke="#1C1610" strokeWidth="2.8" />
            <path d="M 8,10 Q 15,16 22,12" stroke="#1C1610" strokeWidth="2" fill="none" />
          </g>

          {/* 8. TULÁK'S JOYFUL LAUGHING HEAD & BUSHY BEARD */}
          <g id="tulak-head" transform={`translate(210, 130)`}>
            {/* VOLUMINOUS WILD WHITE-GREY BEARD & HAIR */}
            <g transform={`rotate(${beardWave})`}>
              {/* Beard main mass */}
              <path
                d="M -35,-5 C -45,25 -25,65 0,72 C 28,78 65,65 72,25 C 68,-5 45,-15 35,-15 C 20,5 -5,5 -20,-5 Z"
                fill="#F1F5F9"
                stroke="#1C1610"
                strokeWidth={showOutline ? "4.5" : "3.5"}
                strokeLinejoin="round"
              />
              {/* Spiky hair tufts on beard */}
              <path
                d="M -25,45 L -35,58 L -18,56 M -8,65 L -12,78 L 2,68 M 15,70 L 22,82 L 28,68 M 42,60 L 55,68 L 48,52 M 62,35 L 75,42 L 65,25"
                stroke="#1C1610"
                strokeWidth="2.8"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Silver hair strands */}
              <path d="M -15,15 Q -10,45 0,55 M 10,18 Q 20,45 32,50" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Jolly Round Flesh Face */}
            <ellipse cx="10" cy="-14" rx="28" ry="24" fill="url(#tulakSkin)" stroke="#1C1610" strokeWidth="3.2" />

            {/* Ear */}
            <ellipse cx="-20" cy="-12" rx="7" ry="10" fill="url(#tulakSkin)" stroke="#1C1610" strokeWidth="2.5" />

            {/* INTERACTIVE LAUGHING FACE FEATURES */}
            <g transform={`translate(${lookX}, ${lookY})`}>
              {/* Joyful Crinkled Laughing Eyes (Smiling Arcs ^^) */}
              <path d="M -4,-20 Q 3,-28 10,-20" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              <path d="M 16,-20 Q 23,-28 30,-20" stroke="#1C1610" strokeWidth="3.8" strokeLinecap="round" fill="none" />
              {/* Laugh lines around eyes */}
              <line x1="-6" y1="-22" x2="-10" y2="-24" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="-22" x2="36" y2="-24" stroke="#1C1610" strokeWidth="2" strokeLinecap="round" />

              {/* BIG BULBOUS RED VAGABOND NOSE */}
              <ellipse cx="25" cy="-16" rx="9.5" ry="8.5" fill="#EF4444" stroke="#1C1610" strokeWidth="2.8" />
              <circle cx="27" cy="-18" r="2.2" fill="#FCA5A5" />

              {/* Warm Rosy Cheeks */}
              <circle cx="-2" cy="-10" r="7.5" fill="#FB7185" opacity="0.55" />
              <circle cx="34" cy="-8" r="7.5" fill="#FB7185" opacity="0.55" />

              {/* HUGE WIDE OPEN LAUGHING MOUTH (:D) */}
              <path
                d="M 5,2 C 10,-4 32,-4 38,2 C 40,24 5,24 5,2 Z"
                fill="#18181B"
                stroke="#1C1610"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Pink Tongue Showing in laughter */}
              <path
                d="M 14,14 C 18,8 26,8 30,14 C 28,22 16,22 14,14 Z"
                fill="#F43F5E"
              />
              {/* White Upper Teeth */}
              <rect x="12" y="1" width="18" height="5" rx="1.5" fill="#FFFFFF" />
            </g>

            {/* BATTERED POINTED FELT HAT WITH GREEN BAND & SPRIG */}
            <g transform="translate(0, -32) rotate(-8)">
              {/* Sprig / pine needles in hatband */}
              <line x1="32" y1="-12" x2="52" y2="-32" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
              <line x1="35" y1="-8" x2="55" y2="-22" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />

              {/* Conical Battered Crown */}
              <path
                d="M -26,0 C -35,-35 -30,-65 -8,-75 C 5,-80 20,-65 24,-40 C 28,-15 35,0 35,0 Z"
                fill="url(#hatGrad)"
                stroke="#1C1610"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Hat crown crease & dent */}
              <path d="M -15,-48 Q 2,-42 12,-52" stroke="#2B1A0E" strokeWidth="2.5" fill="none" />

              {/* Curled Hat Brim */}
              <path
                d="M -42,2 C -20,-8 30,-8 52,2 C 58,4 55,12 45,12 C 20,8 -20,8 -38,12 C -46,12 -46,4 -42,2 Z"
                fill="#59422C"
                stroke="#1C1610"
                strokeWidth="3.8"
                strokeLinejoin="round"
              />

              {/* Green Forest Hatband */}
              <path
                d="M -24,-2 C -5,-8 18,-8 33,-2 L 34,5 C 18,-1 -5,-1 -25,5 Z"
                fill="#166534"
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
