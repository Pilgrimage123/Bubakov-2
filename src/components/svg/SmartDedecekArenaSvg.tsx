import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartDedecekArenaSvg - Interactive smart vector SVG illustration & animation
 * of Čertův dědeček walking through the arena with his giant woven wicker basket (nůše)
 * strapped to his back, faithfully matching the folklore reference artwork and unified
 * with SmartDedecekNuseSvg:
 * - Warm earthy brown & multi-colored folk patchwork coat (crimson, teal, mustard, olive green
 *   with cross-stitching) and golden-ochre curly lambskin (beránek) trim
 * - Asymmetrical devil-peddler legs: one leg with puffed red breeches, coiled bindings, shaggy
 *   crimson fur, and a massive grooved cloven hoof; the other leg in a heavy laced leather boot
 * - Smooth, continuous, 100% unbroken S-curve devil tail with a lush flame-shaped brush tuft
 * - Giant woven wicker nůše on his back packed with a wooden treasure chest, rolled embroidered
 *   red folk cloth, tied linen sacks, grain sheaf, stoneware jug, garlic, swaying copper lantern-bell,
 *   tin milk can, and the lively moving mouse Rézinka peeking over the rim!
 * - Expressive devil face with round wire spectacles (brýle) on his hooked red nose, mischievous
 *   grin with crooked teeth, smoking briar pipe (fajfka), wild wavy cream-parchment beard,
 *   pointed devil ears, and massive ribbed ram horns
 */
export const SmartDedecekArenaSvg: React.FC<SmartCharacterProps> = ({
  state = 'walk',
  time: externalTime,
  speed = 1,
  isPlaying = true,
  direction = 1,
  size = 460,
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
    setPointer({
      x: Math.max(-1, Math.min(1, nx * direction)),
      y: Math.max(-1, Math.min(1, ny)),
      isHovered: true,
    });
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

  // Characteristic asymmetrical hoof-and-boot peddler gait
  const cycleSpeed = isReact ? 18 : isFleeing ? 15 : isSprinting ? 12.5 : isAction ? 8.5 : isWalking ? 7.5 : 2.3;
  const phase = t * cycleSpeed;
  const sinPhase = Math.sin(phase);
  const cosPhase = Math.cos(phase);

  const hoofStomp = isMoving ? Math.max(0, sinPhase) : 0;
  const bootStep = isMoving ? Math.max(0, -sinPhase) : 0;

  const bodyBobY = isReact
    ? -14 + Math.abs(Math.sin(t * 16)) * 12
    : isAction
    ? -7 + Math.sin(t * 6) * 5
    : isMoving
    ? hoofStomp * 9 - bootStep * 4.5
    : Math.sin(t * 2.3) * 2.8;

  const torsoLean = isFleeing
    ? -11 + sinPhase * 3
    : isReact
    ? 12 + Math.sin(t * 20) * 3.5
    : isSprinting
    ? -7 + sinPhase * 3.5
    : isWalking
    ? -3 + sinPhase * 2.4
    : isAction
    ? -5 + Math.sin(t * 5) * 2.5
    : Math.sin(t * 1.9) * 1.2;

  // Leg swing angles
  const hoofLegAngle = isMoving ? sinPhase * (isSprinting || isFleeing ? 20 : 14) : isAction ? -6 : 0;
  const bootLegAngle = isMoving ? -sinPhase * (isSprinting || isFleeing ? 22 : 16) : isAction ? 5 : 0;

  // Eye & head tracking
  const eyeDx = pointer.x * 3.6;
  const eyeDy = pointer.y * 2.6;
  const headRot =
    (isReact ? 8 : isFleeing ? -8 : isAction ? -5 : 0) +
    pointer.x * 4.2 +
    Math.sin(t * (isMoving ? cycleSpeed : 2.3)) * 1.8;

  // Clawed arms kinematics
  const rightFrontArmAngle = isReact
    ? -18 + Math.sin(t * 18) * 7
    : isAction
    ? -16 + Math.sin(t * 7) * 12
    : isMoving
    ? -cosPhase * 10
    : Math.sin(t * 2.5) * 4 + pointer.x * 4;

  const leftStrapArmAngle = isReact
    ? 16 + Math.sin(t * 18) * 6
    : isAction
    ? -12 + Math.sin(t * 6.5) * 9
    : isMoving
    ? sinPhase * 8
    : Math.sin(t * 2.2) * 3 + pointer.y * 3;

  // Heavy backpack nůše sway & dangling lantern / milk can swing
  const nuseSway = isMoving
    ? -sinPhase * 2.8
    : isAction
    ? Math.sin(t * 8) * 3.2
    : Math.sin(t * 2.2) * 1.1;

  const lanternSwing = Math.sin(t * (isMoving ? cycleSpeed : 2.8) - 0.5) * (isMoving ? 14 : 5);
  const milkCanSwing = Math.cos(t * (isMoving ? cycleSpeed : 2.6) - 0.8) * (isMoving ? 16 : 6);

  // Continuous, smooth, unbroken S-curve tail kinematics (NO segmented joints!)
  const tailFreq = isReact ? 12 : isMoving ? cycleSpeed * 0.65 : 1.75;
  const tailWave1 = Math.sin(t * tailFreq);
  const tailWave2 = Math.cos(t * tailFreq - 0.6);
  const tailSwayX = tailWave1 * (isMoving ? 14 : 9);
  const tailMidX = tailWave2 * 7;
  const tailTipY = Math.sin(t * tailFreq * 2) * 4.5;

  // Lively moving mouse Rézinka peeking out of the nůše on his back
  const mouseSpeed = isAction ? 6 : isReact ? 9.5 : isMoving ? 4.8 : 3.0;
  const mouseScurryX = Math.sin(t * mouseSpeed) * 4.5 + pointer.x * 2.5;
  const mouseBobY =
    (isReact ? 10 : isAction ? -7 : 0) -
    Math.abs(Math.sin(t * mouseSpeed * 1.6)) * 5;
  const mouseHeadTilt = Math.cos(t * mouseSpeed * 1.3) * 7 + pointer.x * 4;
  const mouseEarTwitch = Math.sin(t * 11) * 8;
  const mouseTailWag = Math.sin(t * mouseSpeed * 2.2) * 12;

  // Pipe smoke puffs
  const smokePuffs = [
    { delay: 0, size: 6.5, opacity: 0.74 },
    { delay: 0.36, size: 9.5, opacity: 0.56 },
    { delay: 0.72, size: 13.5, opacity: 0.38 },
    { delay: 1.08, size: 18, opacity: 0.22 },
  ];

  const strokeCol = '#1E1108';

  // Dynamic control points for the unbroken S-curve tail on the right/rear side
  const tailCtrl1X = 152 + tailMidX * 0.6;
  const tailCtrl1Y = 74;
  const tailCtrl2X = 186 + tailMidX;
  const tailCtrl2Y = 122;
  const tailEndStemX = 152 + tailSwayX * 0.8;
  const tailEndStemY = 166 + tailTipY * 0.5;
  const tuftTipX = 142 + tailSwayX * 1.3;
  const tuftTipY = 236 + tailTipY;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 540 530"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 ${className}`}
      style={{
        ...style,
        transform: `${style.transform || ''} scaleX(${direction})`,
        overflow: 'visible',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      aria-label="Smart animovaný Čertův dědeček v aréně s nůší na zádech"
    >
      <defs>
        <radialGradient id="dda-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E1108" stopOpacity="0.52" />
          <stop offset="65%" stopColor="#1E1108" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1E1108" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="dda-horn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="28%" stopColor="#B45309" />
          <stop offset="68%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#3B1505" />
        </linearGradient>

        <linearGradient id="dda-skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="35%" stopColor="#EA580C" />
          <stop offset="78%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>

        <radialGradient id="dda-nose-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>

        <linearGradient id="dda-fleece-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="dda-coat-brown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        <linearGradient id="dda-wicker-grad" x1="0%" y1="0%" x2="100%" y2="20%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="25%" stopColor="#B45309" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="85%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        <linearGradient id="dda-leather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="48%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#3B1505" />
        </linearGradient>

        <linearGradient id="dda-brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id="dda-tin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="45%" stopColor="#94A3B8" />
          <stop offset="85%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="dda-hoof-grad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="38%" stopColor="#78350F" />
          <stop offset="78%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#1E0B02" />
        </linearGradient>

        <radialGradient id="dda-mouse-fur" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#D6D3D1" />
          <stop offset="55%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#57534E" />
        </radialGradient>

        <radialGradient id="dda-smoke-grad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.82" />
          <stop offset="60%" stopColor="#E7E5E4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A8A29E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ================= 1. GROUND SHADOWS & STEP DUST ================= */}
      {showShadow && (
        <g id="ground-shadows">
          <ellipse
            cx="255"
            cy="495"
            rx={175 + hoofStomp * 10}
            ry={24 + hoofStomp * 3}
            fill="url(#dda-ground-shadow)"
          />
        </g>
      )}

      {/* Footstep dust puffs when heavy hoof stomps */}
      {showParticles && isMoving && hoofStomp > 0.55 && (
        <g id="step-dust" opacity={hoofStomp * 0.75}>
          <circle cx={105 - hoofStomp * 18} cy={482 - hoofStomp * 6} r={6 + hoofStomp * 6} fill="#E7DEC8" stroke={strokeCol} strokeWidth="1.5" />
          <circle cx={88 - hoofStomp * 26} cy={476 - hoofStomp * 10} r={4 + hoofStomp * 4} fill="#F5EFE6" stroke={strokeCol} strokeWidth="1.2" />
        </g>
      )}

      {/* ================= 2. WALKING GRANDFATHER ROOT ================= */}
      <g
        id="grandfather-arena-root"
        transform={`translate(0, ${bodyBobY})`}
        style={{ transformOrigin: '260px 440px', transition: 'transform 0.12s ease-out' }}
      >
        {/* --- ASYMMETRICAL LEGS: CLOVEN HOOF (FRONT-LEFT) & LACED LEATHER BOOT (BACK-RIGHT) --- */}
        <g id="arena-legs">
          {/* Right / Back Leg: Heavy Laced Peddler's Leather Boot (Šněrovací kožená škorně) */}
          <g
            id="laced-boot-leg"
            transform={`translate(345, 360) rotate(${bootLegAngle})`}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Upper boot shaft under coat */}
            <path
              d="M -28,-10 L 34,-4 L 44,58 L -24,62 Z"
              fill="#451A03"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />
            {/* Heavy rounded leather boot foot & sole */}
            <path
              d="M -24,52 C -48,58 -76,72 -82,96 C -84,110 -68,120 -38,122 C 2,124 38,120 48,108 L 54,84 L 42,54 Z"
              fill="url(#dda-leather-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 3 : 0}
              strokeLinejoin="round"
            />
            {/* Thick dark leather treaded sole */}
            <path
              d="M -82,98 C -56,112 8,114 48,102 L 46,116 C 4,126 -56,124 -80,110 Z"
              fill="#271003"
              stroke={strokeCol}
              strokeWidth="2.4"
            />
            {/* Criss-crossing golden-ochre leather straps & laces around ankle and instep */}
            <g stroke="#D97706" strokeWidth="4.5" strokeLinecap="round">
              <path d="M -24,22 L 38,14" />
              <path d="M -24,38 L 42,28" />
              <path d="M -22,52 L 44,44" />
              <path d="M -38,66 L 26,96" />
              <path d="M -52,76 L 8,104" />
            </g>
            {/* Laces knot & hanging tassel on right side of boot */}
            <circle cx="-12" cy="48" r="5" fill="#F59E0B" stroke={strokeCol} strokeWidth="1.8" />
            <path d="M 38,24 L 54,68 M 34,32 L 46,72" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
            {/* Scuffed toe texture dots */}
            <circle cx="-54" cy="88" r="2.2" fill="#271003" />
            <circle cx="-42" cy="92" r="1.8" fill="#271003" />
            <circle cx="-30" cy="86" r="2" fill="#271003" />
          </g>

          {/* Left / Front Leg: Puffed Crimson Breeches, Coiled Wrappings, Shaggy Fur & Massive Cloven Hoof */}
          <g
            id="cloven-hoof-leg"
            transform={`translate(185, 335) rotate(${hoofLegAngle})`}
            style={{ transformOrigin: '10px 0px' }}
          >
            {/* Puffed crimson-red breeches with cross-stitching */}
            <path
              d="M -28,0 C 4,-12 52,-4 68,26 C 60,52 14,56 -32,40 C -42,24 -38,8 -28,0 Z"
              fill="#DC2626"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />
            <path d="M -18,12 L 24,32" stroke="#7F1D1D" strokeWidth="2.2" strokeDasharray="4 4" />
            <circle cx="8" cy="18" r="2" fill="#FDE047" />
            <circle cx="28" cy="24" r="2" fill="#FDE047" />

            {/* Thick dark-brown coiled leg wrappings (ovinky) */}
            <path
              d="M -32,34 C -4,26 36,32 54,48 C 48,60 6,62 -36,48 Z"
              fill="#3B2314"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <path
              d="M -36,46 C -8,38 32,44 50,60 C 44,72 2,74 -40,60 Z"
              fill="#27170C"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <circle cx="26" cy="52" r="4" fill="#D97706" stroke={strokeCol} strokeWidth="1.5" />

            {/* Flared shaggy crimson & dark mahogany fur skirt overhanging the hoof */}
            <path
              d="M -56,58 C -18,44 28,50 58,68 L 66,92 L 48,80 L 42,96 L 26,82 L 18,98 L 2,82 L -10,96 L -24,80 L -42,92 L -52,74 L -70,82 Z"
              fill="#991B1B"
              stroke={strokeCol}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M -38,62 L -28,78 M -12,58 L -8,76 M 14,62 L 18,80 M 34,68 L 40,84"
              stroke="#EF4444"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Massive Sculpted Bronze-Brown Cloven Hoof (Rozeklané kopyto) */}
            <path
              d="M -46,72 C -14,64 22,68 46,82 L 58,148 C 36,158 10,160 -12,156 L -14,108 L -22,106 L -34,152 C -58,148 -78,140 -92,130 C -82,102 -66,82 -46,72 Z"
              fill="url(#dda-hoof-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 3 : 0}
              strokeLinejoin="round"
            />
            {/* Deep central hoof cleft */}
            <path d="M -16,72 L -20,152" stroke="#140701" strokeWidth="5.5" strokeLinecap="round" />
            {/* Horn ridges & warm bevel highlights */}
            <path d="M -42,80 C -58,104 -68,124 -76,138" stroke="#D97706" strokeWidth="2.5" strokeOpacity="0.65" fill="none" />
            <path d="M 4,78 C 8,108 4,134 -2,154" stroke="#D97706" strokeWidth="2.5" strokeOpacity="0.65" fill="none" />
            <path d="M -66,102 Q -42,96 -22,102 M -12,104 Q 18,100 44,110" stroke="#451A03" strokeWidth="2" fill="none" />
            <path d="M -78,120 Q -50,114 -26,122 M -12,124 Q 20,120 50,130" stroke="#451A03" strokeWidth="2" fill="none" />
          </g>
        </g>

        {/* --- TORSO, BACKPACK NŮŠE, UNBROKEN TAIL, PATCHWORK COAT & HEAD --- */}
        <g
          id="arena-torso-group"
          transform={`translate(265, 235) rotate(${torsoLean})`}
          style={{ transformOrigin: '0px 90px' }}
        >
          {/* --- 1. UNBROKEN, CONTINUOUS S-CURVE DEVIL TAIL (Bez zlomeného ocasu!) --- */}
          <g id="devil-tail">
            {/* Single continuous tapering Bézier shape from rear hip to brush socket */}
            <path
              d={`M 95,58
                  C ${tailCtrl1X},${tailCtrl1Y} ${tailCtrl2X},${tailCtrl2Y} ${tailEndStemX},${tailEndStemY}
                  L ${tailEndStemX - 11},${tailEndStemY - 4}
                  C ${tailCtrl2X - 14},${tailCtrl2Y - 4} ${tailCtrl1X - 12},${tailCtrl1Y + 8} 82,70 Z`}
              fill="url(#dda-skin-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.6 : 0}
              strokeLinejoin="round"
            />
            {/* Lush, long, flame-shaped dark mahogany & crimson tail brush flowing seamlessly from the stem */}
            <path
              d={`M ${tailEndStemX + 4},${tailEndStemY - 6}
                  C ${tailEndStemX + 28},${tailEndStemY + 14} ${tuftTipX + 36},${tuftTipY - 28} ${tuftTipX + 4},${tuftTipY + 6}
                  C ${tuftTipX + 16},${tuftTipY - 14} ${tuftTipX - 8},${tuftTipY - 6} ${tuftTipX - 18},${tuftTipY + 2}
                  C ${tuftTipX - 2},${tuftTipY - 12} ${tailEndStemX - 38},${tailEndStemY + 34} ${tailEndStemX - 18},${tailEndStemY + 6}
                  C ${tailEndStemX - 12},${tailEndStemY - 2} ${tailEndStemX - 6},${tailEndStemY - 6} ${tailEndStemX + 4},${tailEndStemY - 6} Z`}
              fill="#271003"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.5 : 0}
              strokeLinejoin="round"
            />
            {/* Crimson & flame-orange flowing hair locks inside the tail brush */}
            <path
              d={`M ${tailEndStemX},${tailEndStemY - 4}
                  C ${tailEndStemX + 16},${tailEndStemY + 14} ${tuftTipX + 20},${tuftTipY - 30} ${tuftTipX + 2},${tuftTipY - 8}
                  C ${tuftTipX - 10},${tuftTipY - 24} ${tailEndStemX - 20},${tailEndStemY + 20} ${tailEndStemX - 10},${tailEndStemY - 2} Z`}
              fill="#991B1B"
            />
            <path
              d={`M ${tailEndStemX - 2},${tailEndStemY - 2}
                  C ${tailEndStemX + 8},${tailEndStemY + 12} ${tuftTipX + 8},${tuftTipY - 38} ${tuftTipX - 2},${tuftTipY - 22}
                  C ${tuftTipX - 6},${tuftTipY - 32} ${tailEndStemX - 10},${tailEndStemY + 10} ${tailEndStemX - 2},${tailEndStemY - 2} Z`}
              fill="#EA580C"
            />
          </g>

          {/* --- 2. GIANT WOVEN WICKER NŮŠE ON HIS BACK (Nůše na zádech!) --- */}
          <g
            id="backpack-nuse"
            transform={`translate(42, -55) rotate(${26 + nuseSway})`}
            style={{ transformOrigin: '0px 60px' }}
          >
            {/* Overflowing Wares at the Top of the Backpack Nůše */}
            <g id="backpack-wares">
              {/* Upper wooden crate boards sticking out at the top */}
              <rect
                x="-38"
                y="-115"
                width="52"
                height="36"
                rx="3"
                transform="rotate(-12 -12 -97)"
                fill="#B45309"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              <rect
                x="42"
                y="-98"
                width="48"
                height="34"
                rx="3"
                transform="rotate(8 66 -81)"
                fill="#92400E"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              {/* Coiled rope & leather strap on top */}
              <ellipse cx="28" cy="-102" rx="22" ry="14" fill="#92400E" stroke={strokeCol} strokeWidth="2.2" />
              <path d="M 14,-106 Q 28,-94 42,-104 M 16,-98 Q 28,-88 40,-96" stroke="#451A03" strokeWidth="2" fill="none" />

              {/* Dried Wildflowers & Herbs near Grandfather's neck (left of nůše) */}
              <g transform="translate(-62, -62) rotate(-25)">
                <path d="M 0,32 L -8,-14 M 6,32 L 4,-20 M 12,32 L 16,-12" stroke="#166534" strokeWidth="2.4" />
                <circle cx="-8" cy="-14" r="5" fill="#FACC15" stroke={strokeCol} strokeWidth="1.2" />
                <circle cx="4" cy="-20" r="5.5" fill="#EAB308" stroke={strokeCol} strokeWidth="1.2" />
                <circle cx="16" cy="-12" r="5" fill="#D97706" stroke={strokeCol} strokeWidth="1.2" />
                <circle cx="0" cy="-6" r="4.5" fill="#15803D" stroke={strokeCol} strokeWidth="1.2" />
              </g>

              {/* Carved Wooden Treasure Chest (Dřevěná truhlička) */}
              <g transform="translate(-36, -86) rotate(-14)">
                <rect x="0" y="0" width="76" height="44" rx="4" fill="#78350F" stroke={strokeCol} strokeWidth="2.6" />
                <rect x="0" y="0" width="12" height="44" fill="#451A03" stroke={strokeCol} strokeWidth="1.8" />
                <rect x="64" y="0" width="12" height="44" fill="#451A03" stroke={strokeCol} strokeWidth="1.8" />
                {/* Swinging iron/brass handle */}
                <circle cx="24" cy="18" r="3.5" fill="url(#dda-brass-grad)" stroke={strokeCol} strokeWidth="1.4" />
                <circle cx="52" cy="18" r="3.5" fill="url(#dda-brass-grad)" stroke={strokeCol} strokeWidth="1.4" />
                <path d="M 24,18 C 24,34 52,34 52,18" fill="none" stroke="url(#dda-brass-grad)" strokeWidth="4" strokeLinecap="round" />
                {/* Red leather strap buckled over left side of chest */}
                <rect x="-12" y="-6" width="14" height="52" rx="3" fill="#B91C1C" stroke={strokeCol} strokeWidth="2.2" />
              </g>

              {/* Stoneware Jug / Corked Flask & Garlic Bulbs */}
              <g transform="translate(-58, -42) rotate(-18)">
                <ellipse cx="18" cy="22" rx="20" ry="18" fill="#78350F" stroke={strokeCol} strokeWidth="2.4" />
                <path d="M 0,18 Q 18,10 36,18" stroke="#D97706" strokeWidth="3" fill="none" />
                <rect x="13" y="-2" width="10" height="10" rx="2" fill="#B45309" stroke={strokeCol} strokeWidth="1.8" />
                {/* Garlic cluster */}
                <circle cx="46" cy="12" r="7" fill="#F5EFE6" stroke={strokeCol} strokeWidth="1.6" />
                <circle cx="56" cy="14" r="7" fill="#E7DEC8" stroke={strokeCol} strokeWidth="1.6" />
                <circle cx="50" cy="20" r="7" fill="#F5EFE6" stroke={strokeCol} strokeWidth="1.6" />
              </g>

              {/* Tied Linen Sacks & Golden Wheat Sheaf on Right */}
              <g transform="translate(46, -68) rotate(12)">
                {/* Upper tied sack */}
                <ellipse cx="14" cy="18" rx="20" ry="16" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2.2" />
                <path d="M 6,2 L 22,2 L 18,-10 L 10,-10 Z" fill="#F5EFE6" stroke={strokeCol} strokeWidth="1.8" />
                {/* Golden grain / wheat sheaf sticking out right */}
                <g transform="translate(36, 10) rotate(32)">
                  <path d="M 0,24 L -8,-18 M 4,24 L 2,-22 M 8,24 L 12,-18 M 12,24 L 20,-12" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="-8" cy="-18" rx="3.5" ry="8" fill="#FACC15" stroke={strokeCol} strokeWidth="1.2" />
                  <ellipse cx="2" cy="-22" rx="3.5" ry="8" fill="#EAB308" stroke={strokeCol} strokeWidth="1.2" />
                  <ellipse cx="12" cy="-18" rx="3.5" ry="8" fill="#FACC15" stroke={strokeCol} strokeWidth="1.2" />
                  <ellipse cx="20" cy="-12" rx="3.5" ry="8" fill="#D97706" stroke={strokeCol} strokeWidth="1.2" />
                </g>
                {/* Large plump burlap sack on far right */}
                <ellipse cx="32" cy="48" rx="28" ry="24" fill="#D6C7B2" stroke={strokeCol} strokeWidth="2.4" />
                <path d="M 22,24 L 42,24 L 38,12 L 26,12 Z" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2" />
                <path d="M 20,24 L 44,24" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Rolled Traditional Red Embroidered Folk Cloth / Carpet (Červený vyšívaný pás) */}
              <g transform="translate(-8, -46) rotate(-10)">
                <path
                  d="M 0,18 C 8,-8 44,-14 68,2 C 78,18 74,42 58,54 L -4,38 Z"
                  fill="#B91C1C"
                  stroke={strokeCol}
                  strokeWidth="2.5"
                />
                {/* Rolled spiral end of the carpet */}
                <ellipse cx="48" cy="28" rx="18" ry="22" fill="#78350F" stroke={strokeCol} strokeWidth="2.2" />
                <ellipse cx="48" cy="28" rx="12" ry="15" fill="#D97706" stroke={strokeCol} strokeWidth="1.6" />
                {/* White & gold folkloric geometric embroidery */}
                <g stroke="#FEF08A" strokeWidth="1.6" fill="none">
                  <path d="M 10,6 L 26,38" strokeDasharray="3 2" />
                  <polygon points="16,14 22,10 26,18 20,22" stroke="#FFFBEB" />
                  <polygon points="22,26 28,22 32,30 26,34" stroke="#FFFBEB" />
                </g>
              </g>
            </g>

            {/* Main Woven Wicker Basket Body (Tělo nůše na zádech) */}
            <path
              d="M -68,-12 L 82,-8 C 88,42 82,102 68,148 L -48,142 C -62,96 -68,38 -68,-12 Z"
              fill="url(#dda-wicker-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 3 : 0}
              strokeLinejoin="round"
            />

            {/* Wicker Basketry Weave Lines */}
            <g stroke="#3B1505" strokeWidth="2.4" strokeOpacity="0.82" fill="none">
              <path d="M -64,12 L 80,16" />
              <path d="M -62,36 L 78,40" />
              <path d="M -60,60 L 76,64" />
              <path d="M -56,84 L 74,88" />
              <path d="M -54,108 L 70,112" />
              <path d="M -50,130 L 68,134" />
              {/* Vertical wicker stakes */}
              <path d="M -38,-8 L -32,140" />
              <path d="M -8,-8 L -4,142" />
              <path d="M 22,-8 L 24,144" />
              <path d="M 52,-8 L 50,146" />
            </g>

            {/* Thick Braided Wicker Top Rim of the Nůše */}
            <path
              d="M -72,-12 L 86,-8"
              fill="none"
              stroke="#D97706"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M -72,-12 L 86,-8"
              fill="none"
              stroke={strokeCol}
              strokeWidth="2.6"
              strokeDasharray="7 5"
            />

            {/* === THE LIVELY MOVING MOUSE RÉZINKA PEEKING OUT OF THE BACKPACK NŮŠE === */}
            {showCompanion && (
              <g
                id="arena-mouse-rezinka"
                transform={`translate(${44 + mouseScurryX}, ${-24 + mouseBobY}) rotate(${-18 + mouseHeadTilt})`}
                className="cursor-pointer"
              >
                {/* Pink tail curling out the right side of the basket */}
                <path
                  d={`M 26,34 C ${44 + mouseTailWag * 0.5},36 ${54 + mouseTailWag},${52 + mouseTailWag * 0.4} ${46 + mouseTailWag * 0.8},68`}
                  fill="none"
                  stroke={strokeCol}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d={`M 26,34 C ${44 + mouseTailWag * 0.5},36 ${54 + mouseTailWag},${52 + mouseTailWag * 0.4} ${46 + mouseTailWag * 0.8},68`}
                  fill="none"
                  stroke="#FDA4AF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Round Ears with Pink Interior */}
                <g transform={`translate(-10, -8) rotate(${mouseEarTwitch})`}>
                  <circle cx="0" cy="0" r="10.5" fill="#78716C" stroke={strokeCol} strokeWidth="2" />
                  <circle cx="0" cy="1" r="7" fill="#FDA4AF" />
                </g>
                <g transform={`translate(16, -6) rotate(${-mouseEarTwitch})`}>
                  <circle cx="0" cy="0" r="10.5" fill="#78716C" stroke={strokeCol} strokeWidth="2" />
                  <circle cx="0" cy="1" r="7" fill="#FDA4AF" />
                </g>

                {/* Cute Mouse Head & Upper Body */}
                <path
                  d="M -12,4 C -14,-10 18,-10 16,4 C 18,16 10,22 2,22 C -8,22 -14,16 -12,4 Z"
                  fill="url(#dda-mouse-fur)"
                  stroke={strokeCol}
                  strokeWidth="2.2"
                />
                {/* Glossy dark eyes */}
                <circle cx="-3" cy="4" r="3" fill="#1C1917" />
                <circle cx="-4" cy="3" r="1.1" fill="#FFFFFF" />
                <circle cx="8" cy="4" r="3" fill="#1C1917" />
                <circle cx="7" cy="3" r="1.1" fill="#FFFFFF" />
                {/* Pink nose & whiskers */}
                <ellipse cx="2.5" cy="9" rx="2.8" ry="2" fill="#F43F5E" stroke={strokeCol} strokeWidth="1" />
                <path d="M -4,9 L -16,7 M -4,11 L -15,14 M 9,9 L 21,7 M 9,11 L 20,14" stroke={strokeCol} strokeWidth="1.2" strokeLinecap="round" />
                {/* Little pink paws gripping the wicker rim */}
                <ellipse cx="-6" cy="20" rx="4.5" ry="3" fill="#FDA4AF" stroke={strokeCol} strokeWidth="1.6" />
                <ellipse cx="10" cy="20" rx="4.5" ry="3" fill="#FDA4AF" stroke={strokeCol} strokeWidth="1.6" />
              </g>
            )}

            {/* SWAYING COPPER BELL-LANTERN (Zavěšená měděná lucerna / zvonec) */}
            <g
              id="dangling-lantern"
              transform={`translate(42, 4) rotate(${-22 + lanternSwing})`}
              style={{ transformOrigin: '0px 0px' }}
            >
              {/* Hanging ring & cap */}
              <circle cx="0" cy="0" r="5" fill="none" stroke="url(#dda-brass-grad)" strokeWidth="2.5" />
              <rect x="-8" y="4" width="16" height="8" rx="2" fill="url(#dda-brass-grad)" stroke={strokeCol} strokeWidth="2" />
              {/* Side guard bars */}
              <path d="M -10,12 L -16,52 M 10,12 L 16,52" stroke={strokeCol} strokeWidth="2.5" />
              {/* Flared copper bell/lantern body */}
              <path
                d="M -10,12 L 10,12 L 18,54 C 8,60 -8,60 -18,54 Z"
                fill="url(#dda-brass-grad)"
                stroke={strokeCol}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <ellipse cx="0" cy="54" rx="18" ry="5" fill="#451A03" stroke={strokeCol} strokeWidth="2" />
              <path d="M -4,18 L -8,48" stroke="#FEF08A" strokeWidth="2" strokeOpacity="0.65" strokeLinecap="round" />
            </g>

            {/* SWAYING TIN MILK CAN (Plechová konvička / bandaska na provaze) */}
            <g
              id="dangling-milk-can"
              transform={`translate(82, 16) rotate(${-24 + milkCanSwing})`}
              style={{ transformOrigin: '0px 0px' }}
            >
              {/* Braided hemp rope loop */}
              <path
                d="M 0,0 C -8,14 -8,32 0,44 C 8,32 8,14 0,0 Z"
                fill="none"
                stroke="#D97706"
                strokeWidth="5.5"
              />
              <path
                d="M 0,0 C -8,14 -8,32 0,44 C 8,32 8,14 0,0 Z"
                fill="none"
                stroke={strokeCol}
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Tin milk can body */}
              <g transform="translate(0, 42)">
                <ellipse cx="0" cy="0" rx="11" ry="4" fill="#475569" stroke={strokeCol} strokeWidth="2" />
                <path
                  d="M -11,0 L -11,10 L -18,20 L -18,54 C -8,60 8,60 18,54 L 18,20 L 11,10 L 11,0 Z"
                  fill="url(#dda-tin-grad)"
                  stroke={strokeCol}
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path d="M -11,8 Q 0,12 11,8" fill="none" stroke="#D97706" strokeWidth="2.5" />
                <path d="M -18,48 Q 0,54 18,48" fill="none" stroke="#334155" strokeWidth="2" />
                <path d="M -8,22 L -8,46" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.55" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* --- 3. RIGHT ARM (Emerging on far left under beard, gesturing with curved talons) --- */}
          <g
            id="right-front-claw-arm"
            transform={`translate(-115, 22) rotate(${rightFrontArmAngle})`}
            style={{ transformOrigin: '20px 0px' }}
          >
            {/* Golden-Ochre Curly Lambskin Cuff (Beránek) */}
            <path
              d="M -42,10 C -36,-6 -10,-10 8,4 C 20,16 18,38 2,48 C -16,56 -40,46 -44,28 Z"
              fill="url(#dda-fleece-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            <circle cx="-26" cy="14" r="2" fill="#78350F" />
            <circle cx="-12" cy="24" r="2" fill="#78350F" />
            <circle cx="-22" cy="36" r="2" fill="#78350F" />

            {/* Clawed Red-Orange Devil Hand with 4 Curved Dark Talons */}
            <g transform="translate(-28, 6)">
              <path
                d="M 10,-8 C -8,-18 -28,-16 -42,-4 C -54,8 -58,24 -52,38 C -42,28 -34,16 -24,10 C -32,22 -36,36 -30,48 C -20,38 -14,24 -6,14 C -10,26 -10,40 -2,50 C 6,38 10,24 14,12 C 14,22 18,32 24,38 C 30,24 28,6 10,-8 Z"
                fill="url(#dda-skin-grad)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.5 : 0}
                strokeLinejoin="round"
              />
              {/* 4 Long Curved Black Talons pointing down-left */}
              <path d="M -52,32 C -56,46 -52,60 -42,68 C -44,54 -44,42 -44,32 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
              <path d="M -30,42 C -32,56 -26,70 -16,78 C -20,64 -20,52 -22,42 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
              <path d="M -4,44 C -4,58 2,70 12,78 C 8,64 6,52 4,42 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
              <path d="M 20,32 C 20,44 24,54 32,60 C 28,48 26,38 26,30 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
            </g>
          </g>

          {/* --- 4. MAIN PATCHWORK SHEEPSKIN COAT (Záplatovaný kožich s beránkem) --- */}
          <g id="arena-patchwork-coat">
            {/* Main Coat Body */}
            <path
              d="M -68,-75 C -12,-92 52,-72 82,-12 C 102,38 112,86 122,118 C 68,148 -6,158 -62,144 C -84,88 -86,-12 -68,-75 Z"
              fill="url(#dda-coat-brown)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 3 : 0}
              strokeLinejoin="round"
            />

            {/* Sewn Colorful Folk Patches on Lower Coat Skirt (Mustard, Crimson, Olive) */}
            <path d="M 18,62 L 62,56 L 78,108 L 32,116 Z" fill="#CA8A04" stroke={strokeCol} strokeWidth="2" />
            <path d="M 52,58 L 92,52 L 108,102 L 68,110 Z" fill="#DC2626" stroke={strokeCol} strokeWidth="2" />
            <path d="M -52,64 L -12,58 L -4,108 L -44,112 Z" fill="#B91C1C" stroke={strokeCol} strokeWidth="2" />
            {/* Cross-stitches on coat skirt */}
            <g stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round">
              <path d="M 50,68 L 58,74 M 56,66 L 48,76" />
              <path d="M 58,86 L 66,92 M 64,84 L 56,94" />
              <path d="M 22,82 L 30,88 M 28,80 L 20,90" />
            </g>

            {/* Golden-Ochre Curly Lambskin Trim along Front Opening & Bottom Hem (Žlutohnědý beránek) */}
            <path
              d="M -18,-78 C -36,-28 -36,48 -14,132 L 122,102 C 132,112 128,128 112,134 L -12,158 C -28,160 -36,148 -34,132 C -54,48 -54,-28 -34,-78 Z"
              fill="url(#dda-fleece-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {/* Stipple dots & wool curls along the golden lambskin trim */}
            <g fill="#78350F">
              <circle cx="-26" cy="-42" r="2.2" />
              <circle cx="-30" cy="-12" r="2.2" />
              <circle cx="-30" cy="22" r="2.2" />
              <circle cx="-26" cy="56" r="2.2" />
              <circle cx="-22" cy="92" r="2.2" />
              <circle cx="-18" cy="126" r="2.2" />
              <circle cx="8" cy="142" r="2.2" />
              <circle cx="38" cy="136" r="2.2" />
              <circle cx="68" cy="128" r="2.2" />
              <circle cx="98" cy="120" r="2.2" />
            </g>

            {/* Heavy Leather Shoulder Strap holding the Nůše */}
            <path
              d="M -24,-84 C -48,-42 -50,12 -32,58 L -14,52 C -30,10 -28,-38 -6,-78 Z"
              fill="url(#dda-leather-grad)"
              stroke={strokeCol}
              strokeWidth="2.5"
            />

            {/* Square Buckled Leather Satchel (Kožená brašna s přezkou) at Hip */}
            <g id="hip-satchel" transform="translate(8, 52) rotate(-8)">
              {/* Satchel strap going up to hand */}
              <path d="M 4,-48 L 12,8" stroke="#78350F" strokeWidth="8" strokeLinecap="round" />
              <path d="M 4,-48 L 12,8" stroke={strokeCol} strokeWidth="2" />
              {/* Main square leather bag */}
              <rect
                x="-12"
                y="4"
                width="58"
                height="62"
                rx="7"
                fill="url(#dda-leather-grad)"
                stroke={strokeCol}
                strokeWidth="2.6"
              />
              {/* Top flap */}
              <path
                d="M -12,8 L 46,8 L 44,32 C 24,38 6,38 -10,32 Z"
                fill="#92400E"
                stroke={strokeCol}
                strokeWidth="2.2"
              />
              {/* Center buckle strap & brass buckle */}
              <rect x="12" y="16" width="11" height="32" rx="2" fill="#3B1505" stroke={strokeCol} strokeWidth="1.6" />
              <rect x="10" y="26" width="15" height="12" rx="2" fill="url(#dda-brass-grad)" stroke={strokeCol} strokeWidth="1.6" />
              <circle cx="2" cy="48" r="1.8" fill="#271003" />
              <circle cx="34" cy="50" r="1.8" fill="#271003" />
            </g>

            {/* --- 5. LEFT SLEEVE & CLAWED HAND (Center-Right, Patched Sleeve + Golden Lambskin Cuff) --- */}
            <g
              id="left-strap-claw-arm"
              transform={`translate(22, -42) rotate(${leftStrapArmAngle})`}
              style={{ transformOrigin: '0px 0px' }}
            >
              {/* Broad curved brown sheepskin sleeve */}
              <path
                d="M -18,-28 C 28,-22 68,8 78,48 C 82,76 58,98 22,94 C -4,90 -24,74 -30,48 C -34,20 -28,-8 -18,-28 Z"
                fill="url(#dda-coat-brown)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.8 : 0}
              />
              {/* Crimson red, teal-green, and mustard patches on the sleeve (just like reference!) */}
              <path d="M 18,-6 L 52,8 L 42,36 L 8,22 Z" fill="#DC2626" stroke={strokeCol} strokeWidth="2" />
              <path d="M 42,24 L 74,38 L 68,64 L 36,48 Z" fill="#1D6F7A" stroke={strokeCol} strokeWidth="2" />
              <path d="M 28,58 L 64,62 L 52,88 L 16,84 Z" fill="#D97706" stroke={strokeCol} strokeWidth="2" />
              {/* Cross-stitches on sleeve patches */}
              <g stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M 14,4 L 22,10 M 20,2 L 12,12" />
                <path d="M 32,-2 L 40,4 M 38,-4 L 30,6" />
                <path d="M 46,32 L 54,38 M 52,30 L 44,40" />
                <path d="M 24,68 L 32,74 M 30,66 L 22,76" />
              </g>

              {/* Golden-Ochre Curly Lambskin Sleeve Cuff */}
              <path
                d="M -24,22 C -12,18 2,34 4,58 C 6,80 -6,98 -20,98 C -34,98 -42,80 -40,56 C -38,36 -32,24 -24,22 Z"
                fill="url(#dda-fleece-grad)"
                stroke={strokeCol}
                strokeWidth="2.6"
              />
              <circle cx="-18" cy="38" r="2" fill="#78350F" />
              <circle cx="-14" cy="58" r="2" fill="#78350F" />
              <circle cx="-18" cy="78" r="2" fill="#78350F" />

              {/* Hairy Red-Orange Devil Hand with 4 Curved Dark Talons */}
              <g transform="translate(-32, 54)">
                <path
                  d="M 8,-14 C -8,-28 -28,-32 -46,-22 C -58,-12 -64,4 -58,18 C -48,8 -38,-2 -26,-6 C -38,6 -44,20 -38,34 C -26,24 -18,12 -8,4 C -16,16 -18,30 -10,42 C 0,30 8,16 14,4 Z"
                  fill="url(#dda-skin-grad)"
                  stroke={strokeCol}
                  strokeWidth={showOutline ? 2.5 : 0}
                  strokeLinejoin="round"
                />
                {/* Dark wrist hairs */}
                <path d="M 2,-4 L 12,-8 M 4,4 L 14,2 M 2,12 L 12,10" stroke="#1E1108" strokeWidth="1.8" strokeLinecap="round" />
                {/* Curved Dark Horn Talons */}
                <path d="M -58,12 C -64,26 -62,40 -54,48 C -54,34 -52,22 -50,12 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
                <path d="M -38,28 C -44,42 -40,56 -32,64 C -32,50 -30,38 -28,28 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
                <path d="M -12,36 C -16,50 -12,62 -4,70 C -4,56 -2,44 0,34 Z" fill="#1C1917" stroke={strokeCol} strokeWidth="1.8" />
              </g>
            </g>
          </g>

          {/* --- 6. GRANDFATHER'S HEAD, RIBBED RAM HORNS, SPECTACLES, CROOKED TEETH, BEARD & PIPE --- */}
          <g
            id="arena-grandfather-head"
            transform={`translate(-68, -72) rotate(${headRot})`}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Long, Wild, Wiry, Wavy Cream-Parchment Beard & Hair (Dlouhý vlnitý plavý vous) */}
            <g id="arena-wild-beard">
              {/* Outer darker parchment hair mass */}
              <path
                d="M -68,-8 C -92,22 -88,68 -68,112 C -48,156 -12,192 22,198 C 56,192 78,148 82,96 C 86,48 76,2 56,-28 Z"
                fill="#D6C7B2"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.6 : 0}
              />
              {/* Inner warm cream beard volume */}
              <path
                d="M -56,0 C -76,26 -72,66 -54,106 C -36,144 -6,174 22,178 C 48,174 68,134 72,88 C 76,46 66,4 48,-20 Z"
                fill="#F5EFE6"
              />
              {/* Flowing individual wavy folklore hair strands */}
              <g fill="none" stroke="#786858" strokeWidth="1.9" strokeLinecap="round">
                <path d="M -58,12 Q -78,28 -66,52 Q -54,76 -68,98" />
                <path d="M -44,26 Q -64,50 -48,78 Q -34,106 -48,132" />
                <path d="M -26,38 Q -46,68 -28,102 Q -14,132 -24,162" />
                <path d="M -6,44 Q -22,78 -4,116 Q 10,148 2,182" />
                <path d="M 14,42 Q 2,78 18,116 Q 32,148 24,184" />
                <path d="M 34,32 Q 26,68 42,102 Q 54,132 46,164" />
                <path d="M 50,14 Q 48,48 62,78 Q 72,106 64,134" />
              </g>
              {/* Bright cream highlight curls */}
              <g fill="none" stroke="#FFFDF9" strokeWidth="2.2" strokeLinecap="round">
                <path d="M -36,32 Q -54,58 -38,88 Q -24,116 -34,144" />
                <path d="M 4,44 Q -10,80 6,118 Q 18,148 12,176" />
                <path d="M 42,24 Q 36,60 52,92 Q 62,120 56,148" />
              </g>
            </g>

            {/* Pointed Red Devil Ears Jutting Out on Both Sides */}
            <g id="arena-devil-ears">
              {/* Left ear sticking out left */}
              <path
                d="M -54,-6 C -76,-10 -98,-8 -116,-18 C -104,2 -82,14 -56,10 Z"
                fill="url(#dda-skin-grad)"
                stroke={strokeCol}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M -62,-2 C -80,-4 -94,-4 -104,-10 C -94,0 -78,6 -60,5 Z" fill="#7C2D12" />
              {/* Right ear pointing high up-right */}
              <path
                d="M 38,-22 C 52,-46 62,-72 62,-96 C 74,-72 72,-40 52,-8 Z"
                fill="url(#dda-skin-grad)"
                stroke={strokeCol}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M 42,-20 C 52,-40 58,-60 58,-78 C 66,-60 64,-36 48,-12 Z" fill="#7C2D12" />
            </g>

            {/* Golden-Ochre Curly Lambskin Cap (Beranice) */}
            <g id="arena-fleece-cap">
              <path
                d="M -60,-34 C -54,-74 14,-94 48,-60 C 56,-42 48,-22 32,-16 Z"
                fill="#92400E"
                stroke={strokeCol}
                strokeWidth="2.5"
              />
              <path
                d="M -72,-18 C -78,-38 -64,-58 -42,-64 C -30,-80 -4,-88 18,-76 C 38,-74 52,-58 46,-38 C 30,-46 8,-50 -16,-42 C -38,-34 -54,-22 -72,-18 Z"
                fill="url(#dda-fleece-grad)"
                stroke={strokeCol}
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              <circle cx="-54" cy="-38" r="2.2" fill="#78350F" />
              <circle cx="-36" cy="-52" r="2.2" fill="#78350F" />
              <circle cx="-16" cy="-62" r="2.2" fill="#78350F" />
              <circle cx="6" cy="-64" r="2.2" fill="#78350F" />
              <circle cx="26" cy="-54" r="2.2" fill="#78350F" />
            </g>

            {/* MASSIVE RIBBED DEVIL RAM HORNS */}
            <g id="arena-devil-horns">
              {/* Left Horn curling out and down-left */}
              <g>
                <path
                  d="M -40,-46 C -68,-82 -124,-92 -154,-54 C -174,-26 -166,18 -136,28 C -114,34 -96,18 -102,2 C -106,-8 -118,-8 -122,0 C -116,8 -118,14 -128,12 C -144,8 -146,-16 -130,-36 C -108,-60 -68,-52 -48,-24 Z"
                  fill="url(#dda-horn-grad)"
                  stroke={strokeCol}
                  strokeWidth={showOutline ? 2.8 : 0}
                  strokeLinejoin="round"
                />
                <g stroke="#271003" strokeWidth="2.2" fill="none">
                  <path d="M -54,-56 C -48,-44 -48,-34 -56,-28" />
                  <path d="M -72,-66 C -66,-54 -66,-42 -74,-38" />
                  <path d="M -92,-70 C -86,-56 -88,-46 -96,-42" />
                  <path d="M -112,-68 C -108,-54 -110,-44 -118,-42" />
                  <path d="M -132,-58 C -126,-46 -128,-36 -136,-34" />
                  <path d="M -148,-40 C -138,-30 -138,-20 -146,-18" />
                </g>
                <path d="M -48,-48 C -74,-76 -120,-80 -146,-48" stroke="#FDE68A" strokeWidth="2.4" strokeOpacity="0.65" fill="none" strokeLinecap="round" />
              </g>

              {/* Right Horn arching high up and curling right */}
              <g>
                <path
                  d="M -8,-66 C 6,-112 56,-134 100,-112 C 134,-94 156,-74 164,-90 C 170,-102 160,-118 144,-120 C 154,-128 174,-118 178,-98 C 182,-72 154,-52 120,-64 C 92,-74 68,-90 44,-82 C 24,-76 14,-60 12,-46 Z"
                  fill="url(#dda-horn-grad)"
                  stroke={strokeCol}
                  strokeWidth={showOutline ? 2.8 : 0}
                  strokeLinejoin="round"
                />
                <g stroke="#271003" strokeWidth="2.2" fill="none">
                  <path d="M -4,-76 C 6,-74 14,-66 12,-56" />
                  <path d="M 8,-92 C 18,-88 24,-78 22,-68" />
                  <path d="M 24,-106 C 34,-98 38,-88 34,-78" />
                  <path d="M 44,-114 C 52,-104 54,-92 48,-84" />
                  <path d="M 66,-114 C 70,-102 70,-90 64,-82" />
                  <path d="M 88,-108 C 90,-96 86,-84 80,-78" />
                  <path d="M 110,-98 C 108,-86 102,-76 96,-72" />
                </g>
                <path d="M 0,-72 C 16,-108 58,-122 96,-104" stroke="#FDE68A" strokeWidth="2.4" strokeOpacity="0.65" fill="none" strokeLinecap="round" />
              </g>
            </g>

            {/* Expressive Terracotta-Coral Devil Face Base */}
            <path
              d="M -52,-16 C -46,-40 -10,-54 22,-40 C 44,-30 50,2 40,26 C 30,50 4,60 -20,50 C -44,40 -56,8 -52,-16 Z"
              fill="url(#dda-skin-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.5 : 0}
            />
            <ellipse cx="-30" cy="12" rx="13" ry="9" fill="#EF4444" opacity="0.55" />
            <ellipse cx="22" cy="-2" rx="12" ry="9" fill="#EF4444" opacity="0.55" />

            {/* Arched Eyebrows & Forehead Furrows */}
            <path d="M -44,-12 C -36,-24 -20,-26 -10,-16" stroke="#450A0A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M -4,-24 C 4,-38 22,-40 34,-28" stroke="#450A0A" strokeWidth="3.4" fill="none" strokeLinecap="round" />

            {/* WIDE BULGING EXPRESSIVE EYES */}
            <g id="arena-eyes">
              {/* Left Eye */}
              <ellipse cx="-22" cy="-4" rx="13" ry="14" fill="#FFFBEB" stroke={strokeCol} strokeWidth="2.4" />
              <circle cx={-20 + eyeDx * 0.85} cy={-4 + eyeDy * 0.85} r="7.2" fill="#991B1B" />
              <circle cx={-20 + eyeDx * 0.85} cy={-4 + eyeDy * 0.85} r="4.2" fill="#1C1917" />
              <circle cx={-22 + eyeDx * 0.85} cy={-7 + eyeDy * 0.85} r="2.2" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="10" cy="-16" rx="14.5" ry="15.5" fill="#FFFBEB" stroke={strokeCol} strokeWidth="2.4" />
              <circle cx={10 + eyeDx * 0.85} cy={-15 + eyeDy * 0.85} r="8" fill="#991B1B" />
              <circle cx={10 + eyeDx * 0.85} cy={-15 + eyeDy * 0.85} r="4.8" fill="#1C1917" />
              <circle cx={7 + eyeDx * 0.85} cy={-18 + eyeDy * 0.85} r="2.6" fill="#FFFFFF" />
            </g>

            {/* MISCHIEVOUS SMILING MOUTH WITH CROOKED TEETH */}
            <g id="arena-mouth">
              <path
                d="M -32,20 C -18,12 10,2 26,4 C 24,20 10,32 -6,34 C -20,34 -30,28 -32,20 Z"
                fill="#3B0707"
                stroke={strokeCol}
                strokeWidth="2.2"
              />
              {/* Crooked yellowed teeth peeking in his mischievous grin */}
              <g stroke={strokeCol} strokeWidth="1.4" strokeLinejoin="round">
                <polygon points="-24,19 -16,16 -15,24 -23,25" fill="#FDE047" />
                <polygon points="-15,16 -6,12 -4,21 -13,23" fill="#FEF9C3" />
                <polygon points="-5,12 4,9 6,18 -2,20" fill="#FEF08A" />
                <polygon points="6,8 15,6 16,15 8,17" fill="#FDE047" />
              </g>
              <path d="M -14,28 Q -2,22 10,24 C 6,32 -6,34 -14,28 Z" fill="#FB7185" />
            </g>

            {/* CARVED BRIAR WOODEN PIPE (Fajfka) */}
            <g id="arena-smoking-pipe" transform="translate(-28, 26)">
              <path
                d="M 4,-2 C -10,8 -22,18 -30,30 L -20,36 C -12,24 0,12 10,4 Z"
                fill="#3B1505"
                stroke={strokeCol}
                strokeWidth="2.2"
              />
              <path
                d="M -56,6 C -62,20 -56,38 -42,44 C -26,50 -12,40 -10,24 L -22,20 C -24,28 -30,30 -36,26 C -40,22 -40,14 -36,8 Z"
                fill="url(#dda-horn-grad)"
                stroke={strokeCol}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <ellipse cx="-46" cy="7" rx="11" ry="5" transform="rotate(14 -46 7)" fill="#271003" stroke={strokeCol} strokeWidth="2" />
              <ellipse cx="-46" cy="7" rx="7" ry="3" transform="rotate(14 -46 7)" fill="#EA580C" className="animate-pulse" />
              <path d="M -50,18 Q -46,32 -34,36" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.65" fill="none" strokeLinecap="round" />

              {showParticles && (
                <g id="arena-pipe-smoke">
                  {smokePuffs.map((p, idx) => {
                    const cycle = ((t * 0.8 + p.delay) % 1.5) / 1.5;
                    const px = -48 - cycle * 30 + Math.sin(t * 3.4 + idx) * 7;
                    const py = 0 - cycle * 58;
                    const pr = p.size * (0.65 + cycle * 0.85);
                    const pOp = (1 - cycle) * p.opacity;
                    return (
                      <circle key={idx} cx={px} cy={py} r={pr} fill="url(#dda-smoke-grad)" opacity={pOp} />
                    );
                  })}
                </g>
              )}
            </g>

            {/* ROUND WIRE-RIMMED SPECTACLES (Brýle) & LONG HOOKED RED NOSE */}
            <g id="arena-spectacles-and-nose" transform={`translate(0, ${isReact ? 4 : 0})`}>
              {/* Left lens rim */}
              <ellipse
                cx="-27"
                cy="10"
                rx="11"
                ry="9"
                transform="rotate(-18 -27 10)"
                fill="#FEF9C3"
                fillOpacity="0.18"
                stroke="#271003"
                strokeWidth="2.6"
              />
              <ellipse
                cx="-27"
                cy="10"
                rx="11"
                ry="9"
                transform="rotate(-18 -27 10)"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.3"
              />
              <path d="M -33,6 L -24,13" stroke="#FFFFFF" strokeWidth="1.6" strokeOpacity="0.75" strokeLinecap="round" />

              {/* Long Hooked Red Devil Nose drooping down over mouth */}
              <path
                d="M -8,-8 C -20,0 -32,18 -28,30 C -24,40 -10,38 -2,26 C 4,16 4,0 -8,-8 Z"
                fill="url(#dda-nose-grad)"
                stroke={strokeCol}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <ellipse cx="-18" cy="20" rx="4.2" ry="7.5" transform="rotate(24 -18 20)" fill="#FCA5A5" opacity="0.75" />

              {/* Bridge & Right lens rim */}
              <path d="M -17,6 C -14,-2 -6,-6 -2,-2" fill="none" stroke="#271003" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M -17,6 C -14,-2 -6,-6 -2,-2" fill="none" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
              <ellipse
                cx="8"
                cy="-3"
                rx="12"
                ry="10"
                transform="rotate(-18 8 -3)"
                fill="#FEF9C3"
                fillOpacity="0.18"
                stroke="#271003"
                strokeWidth="2.6"
              />
              <ellipse
                cx="8"
                cy="-3"
                rx="12"
                ry="10"
                transform="rotate(-18 8 -3)"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.3"
              />
              <path d="M 2,-8 L 12,0" stroke="#FFFFFF" strokeWidth="1.6" strokeOpacity="0.75" strokeLinecap="round" />
              <path d="M 19,-7 L 36,-18" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
