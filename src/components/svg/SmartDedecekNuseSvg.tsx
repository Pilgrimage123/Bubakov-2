import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartDedecekNuseSvg - Interactive smart vector SVG illustration & animation
 * Faithfully modeled after the folklore illustration of Čertův dědeček opening his giant
 * woven wicker basket (otevřená nůše):
 * - Earthy folk patchwork coat (teal, olive green, mustard ochre, rust, burgundy) with cross-stitching
 *   and golden-ochre curly lambskin (beránek) trim — distinctly Czech folklore devil-merchant, never Santa Claus!
 * - Tilted expressive devil face with round wire spectacles (brýle) perched on his long hooked nose
 * - Wide-open mischievous grin full of crooked, uneven ivory/yellowed teeth (vyceněné křivé zuby)
 * - Briar smoking pipe (fajfka) tucked in the corner of his mouth with rising smoke wisps
 * - Wild, wiry, wavy cream-parchment beard & hair around the jaw, pointed devil ears, and heavy ribbed ram horns
 * - Smooth, continuous, 100% unbroken S-curve devil tail (bez zlomeného ocasu) with a lush flame-shaped brush tuft
 * - Coiled leg bindings, shaggy crimson ankle fur, and massive grooved cloven hooves
 * - Giant arched woven nůše overflowing with potions, lavender, embroidered folk cloth, wooden chest,
 *   sausages, painted red box, mushrooms, carrots, golden pineapple, and a lively moving mouse (pohybující se myška)!
 */
export const SmartDedecekNuseSvg: React.FC<SmartCharacterProps> = ({
  state = 'idle',
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

  // Kinematic speeds
  const cycleSpeed = isAction ? 10 : isReact ? 18 : isFleeing ? 15 : isSprinting ? 13 : isWalking ? 7.5 : 2.4;
  const sinTime = Math.sin(t * cycleSpeed);

  // Leg swing angles (only swing when actively moving: walk, sprint, flee)
  const backLegAngle = isMoving ? sinTime * (isSprinting || isFleeing ? 16 : 11) : 0;
  const frontLegAngle = isMoving ? -sinTime * (isSprinting || isFleeing ? 18 : 12) : 0;

  // Breathing & body bobbing
  const bobY = isReact
    ? -14 + Math.abs(Math.sin(t * 16)) * 12
    : isAction
    ? -6 + Math.sin(t * 6) * 4.5
    : isSprinting || isFleeing
    ? Math.abs(sinTime) * 10
    : isWalking
    ? Math.abs(sinTime) * 5
    : Math.sin(t * 2.2) * 2.8;

  const torsoLean = isFleeing
    ? -10
    : isReact
    ? -11 + Math.sin(t * 20) * 3.5
    : isAction
    ? 5 + Math.sin(t * 5) * 2.5
    : isSprinting
    ? 7 + sinTime * 2.5
    : isWalking
    ? 2 + sinTime * 1.3
    : Math.sin(t * 2.2) * 0.8;

  // Eye & head tracking offsets
  const eyeDx = pointer.x * 3.8;
  const eyeDy = pointer.y * 2.8;
  const headRot =
    (isReact ? -7 : isFleeing ? -9 : isAction ? 4 : 0) +
    pointer.x * 4.5 +
    Math.sin(t * 2.3) * 1.6;

  // Continuous, smooth, unbroken S-curve tail kinematics (NO segmented joints!)
  const tailFreq = isReact ? 12 : isSprinting ? 5.5 : isAction ? 3.2 : 1.6;
  const tailWave1 = Math.sin(t * tailFreq);
  const tailWave2 = Math.cos(t * tailFreq - 0.7);
  const tailSwayX = (isReact ? -14 : isFleeing ? 16 : 0) + tailWave1 * 12;
  const tailMidX = tailWave2 * 7;
  const tailTipY = Math.sin(t * tailFreq * 2) * 4;

  // Upper claw arm reaching over the top of the nůše
  const upperArmAngle = isReact
    ? -14 + Math.sin(t * 18) * 5
    : isAction
    ? 8 + Math.sin(t * 7) * 7
    : isFleeing
    ? -16
    : Math.sin(t * 2.1) * 3.5 + pointer.y * 2.5;

  // Front welcoming claw hand gesturing toward the wares
  const frontArmAngle = isReact
    ? -18 + Math.sin(t * 18) * 6
    : isAction
    ? -10 + Math.sin(t * 6.5) * 9
    : isSprinting
    ? 8 + sinTime * 10
    : Math.sin(t * 2.6) * 4.5 + pointer.x * 4.5;

  // Subtle basket bounce
  const basketBounce = isAction
    ? Math.sin(t * 8) * 2.2
    : isSprinting
    ? Math.sin(t * 13) * 1.8
    : Math.sin(t * 2.2) * 0.9;

  // Lively moving mouse (pohybující se myška) inside the nůše
  const mouseSpeed = isAction ? 5.5 : isReact ? 9 : pointer.isHovered ? 4.2 : 2.8;
  const mouseScurryX =
    Math.sin(t * mouseSpeed) * 7.5 +
    Math.cos(t * mouseSpeed * 0.6) * 3.5 +
    pointer.x * 4;
  const mouseHopY =
    (isReact ? 16 : isAction ? -10 : 0) -
    Math.abs(Math.sin(t * mouseSpeed * 1.8)) * 6.5 +
    Math.cos(t * mouseSpeed) * 2;
  const mouseBodyTilt = Math.sin(t * mouseSpeed) * 8 + pointer.x * 5;
  const mouseHeadTilt = Math.cos(t * mouseSpeed * 1.3) * 7 - pointer.y * 4;
  const mouseEarL = Math.sin(t * 11) * 8;
  const mouseEarR = Math.cos(t * 9.5) * 8;
  const mousePawWave = Math.sin(t * 10) * 4.5;
  const mouseTailSwing = Math.sin(t * mouseSpeed * 2.2) * 14;
  const mouseWhiskerTwitch = Math.sin(t * 16) * 3;

  // Pipe smoke puffs
  const smokePuffs = [
    { delay: 0, size: 6.5, opacity: 0.72 },
    { delay: 0.38, size: 9.5, opacity: 0.54 },
    { delay: 0.76, size: 13.5, opacity: 0.38 },
    { delay: 1.14, size: 17.5, opacity: 0.22 },
  ];

  const strokeCol = '#1E1108';

  // Smooth dynamic Bézier coordinates for the unbroken devil tail
  const tailCtrl1X = -82 + tailMidX * 0.5;
  const tailCtrl1Y = 22;
  const tailCtrl2X = -96 + tailMidX;
  const tailCtrl2Y = 74;
  const tailEndStemX = -74 + tailSwayX * 0.75;
  const tailEndStemY = 128 + tailTipY * 0.5;

  const tuftTipX = -84 + tailSwayX * 1.35;
  const tuftTipY = 204 + tailTipY;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 560 530"
      width={size}
      height={size}
      className={`smart-dedecek-nuse-svg select-none transition-transform duration-300 ${className}`}
      style={{
        ...style,
        transform: `${style.transform || ''} scaleX(${direction})`,
        overflow: 'visible',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      role="img"
      aria-label="Dědeček s nůší perníčků a tretek"
    >
      <defs>
        {/* Ground shadow gradient */}
        <radialGradient id="dd-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E1108" stopOpacity="0.55" />
          <stop offset="65%" stopColor="#1E1108" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#1E1108" stopOpacity="0" />
        </radialGradient>

        {/* Warm ribbed ram horn gradient */}
        <linearGradient id="dd-horn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="28%" stopColor="#B45309" />
          <stop offset="68%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#3B1505" />
        </linearGradient>

        {/* Terracotta / coral-red devil skin gradient */}
        <linearGradient id="dd-skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="35%" stopColor="#EA580C" />
          <stop offset="78%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>

        {/* Cheek & nose warm flush */}
        <radialGradient id="dd-nose-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>

        {/* Golden-tan curly sheepskin (beránek) gradient — NOT Santa white */}
        <linearGradient id="dd-fleece-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Wicker basket warm willow gradient */}
        <linearGradient id="dd-wicker-grad" x1="0%" y1="0%" x2="100%" y2="15%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="22%" stopColor="#B45309" />
          <stop offset="52%" stopColor="#D97706" />
          <stop offset="82%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>

        {/* Dark interior basket shadow */}
        <linearGradient id="dd-basket-inside" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#271003" />
          <stop offset="50%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#1E0B02" />
        </linearGradient>

        {/* Heavy saddle leather gradient */}
        <linearGradient id="dd-leather-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="45%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#3B1505" />
        </linearGradient>

        {/* Aged brass buckle gradient */}
        <linearGradient id="dd-brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Cloven hoof horn gradient */}
        <linearGradient id="dd-hoof-grad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="38%" stopColor="#78350F" />
          <stop offset="78%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#1E0B02" />
        </linearGradient>

        {/* Potion gradients */}
        <radialGradient id="dd-green-potion" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="85%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>

        <radialGradient id="dd-red-potion" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="85%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#450A0A" />
        </radialGradient>

        <radialGradient id="dd-gold-potion" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>

        {/* Golden pineapple gradient */}
        <linearGradient id="dd-pineapple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Mouse fur gradient */}
        <radialGradient id="dd-mouse-fur" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#D6D3D1" />
          <stop offset="55%" stopColor="#A8A29E" />
          <stop offset="100%" stopColor="#57534E" />
        </radialGradient>

        {/* Smoke puff gradient */}
        <radialGradient id="dd-smoke-grad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.82" />
          <stop offset="60%" stopColor="#E7E5E4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A8A29E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ================= 1. GROUND SHADOWS ================= */}
      {showShadow && (
        <g id="ground-shadows">
          <ellipse cx="115" cy="492" rx="95" ry="18" fill="url(#dd-ground-shadow)" />
          <ellipse cx="375" cy="502" rx="155" ry="24" fill="url(#dd-ground-shadow)" />
        </g>
      )}

      {/* ================= 2. GRANDFATHER BODY, LEGS, UNBROKEN TAIL & HEAD ================= */}
      <g
        id="grandfather-root"
        transform={`translate(0, ${bobY})`}
        style={{ transformOrigin: '140px 440px', transition: 'transform 0.15s ease-out' }}
      >
        {/* --- LOWER LEGS, COILED WRAPPINGS, SHAGGY FUR & MASSIVE CLOVEN HOOVES --- */}
        <g id="devil-legs">
          {/* Back Leg (Right-side hoof slightly behind) */}
          <g id="dn-back-leg" transform={`translate(135, 340) rotate(${backLegAngle.toFixed(2)})`}>
            {/* Red-orange breeches */}
            <path
              d="M -18,-15 C 12,-18 38,-8 44,22 C 36,38 8,42 -16,32 Z"
              fill="#C2410C"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.6 : 0}
            />
            {/* Coiled dark brown leg bindings */}
            <path
              d="M -14,24 C 4,20 26,22 38,30 C 36,42 12,46 -12,40 Z"
              fill="#3B2314"
              stroke={strokeCol}
              strokeWidth="2.2"
            />
            <path
              d="M -12,36 C 6,32 26,34 36,42 C 34,54 10,56 -12,50 Z"
              fill="#27170C"
              stroke={strokeCol}
              strokeWidth="2.2"
            />
            {/* Shaggy crimson ankle fur */}
            <path
              d="M -22,46 C -4,40 24,42 44,50 L 52,66 L 38,60 L 32,70 L 20,62 L 12,72 L 0,62 L -12,70 L -24,58 Z"
              fill="#991B1B"
              stroke={strokeCol}
              strokeWidth="2"
            />
            {/* Rear Cloven Hoof */}
            <path
              d="M -16,64 L 36,60 L 48,124 L 12,130 L 6,96 L -2,96 L -6,128 L -30,122 Z"
              fill="url(#dd-hoof-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
              strokeLinejoin="round"
            />
            <path d="M 3,66 L 2,126" stroke="#140701" strokeWidth="4" />
            <path d="M -12,84 Q 14,78 38,84" stroke="#B45309" strokeWidth="1.6" strokeOpacity="0.55" fill="none" />
          </g>

          {/* Front Dominant Leg & Massive Cloven Hoof (Planted on bottom-left like reference) */}
          <g id="dn-front-leg" transform={`translate(88, 325) rotate(${frontLegAngle.toFixed(2)})`}>
            {/* Puffed rust-red breeches with small ochre dots */}
            <path
              d="M -16,-10 C 16,-16 56,-6 66,24 C 58,48 16,52 -18,38 C -26,20 -24,4 -16,-10 Z"
              fill="#DC2626"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />
            <circle cx="8" cy="14" r="2.2" fill="#FDE047" opacity="0.75" />
            <circle cx="26" cy="18" r="2.2" fill="#FDE047" opacity="0.75" />
            <circle cx="42" cy="12" r="2.2" fill="#FDE047" opacity="0.75" />
            <circle cx="18" cy="28" r="2.2" fill="#FDE047" opacity="0.75" />

            {/* Thick coiled dark brown leg bindings (3 heavy rope coils around shin) */}
            <path
              d="M -14,32 C 10,24 44,28 58,40 C 54,52 14,54 -16,44 Z"
              fill="#422818"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <path
              d="M -18,44 C 8,36 42,40 56,52 C 50,64 12,66 -20,56 Z"
              fill="#331E11"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <path
              d="M -20,56 C 6,48 38,52 52,64 C 46,74 8,76 -22,66 Z"
              fill="#26150B"
              stroke={strokeCol}
              strokeWidth="2.5"
            />

            {/* Flared shaggy crimson-red fur skirt overhanging the hoof */}
            <path
              d="M -36,64 C -6,50 34,54 62,68 L 72,88 L 56,78 L 50,92 L 36,80 L 28,94 L 14,80 L 4,94 L -8,80 L -20,94 L -30,78 L -46,88 Z"
              fill="#B91C1C"
              stroke={strokeCol}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path
              d="M -24,66 L -16,80 M -4,62 L -2,78 M 18,64 L 22,80 M 38,68 L 44,82"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Massive Sculpted Cloven Hoof */}
            <path
              d="M -32,78 C -4,70 28,72 52,82 L 66,148 C 46,158 22,160 6,156 L 4,112 L -4,110 L -14,154 C -36,150 -54,142 -66,132 Z"
              fill="url(#dd-hoof-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 3 : 0}
              strokeLinejoin="round"
            />
            {/* Deep central hoof cleft */}
            <path
              d="M 2,76 L -2,152"
              stroke="#140701"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Hoof horn ridges & warm highlights */}
            <path d="M -26,86 C -14,108 -26,128 -44,138" stroke="#D97706" strokeWidth="2.5" strokeOpacity="0.65" fill="none" />
            <path d="M 16,84 C 24,112 22,136 18,152" stroke="#D97706" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
            <path d="M -42,102 Q -20,96 -4,102 M 6,104 Q 32,100 56,110" stroke="#451A03" strokeWidth="2" fill="none" />
            <path d="M -52,120 Q -26,114 -8,122 M 6,124 Q 34,120 60,130" stroke="#451A03" strokeWidth="2" fill="none" />
          </g>
        </g>

        {/* --- GRANDFATHER'S TORSO, UNBROKEN S-CURVE TAIL & PATCHWORK COAT --- */}
        <g
          id="grandfather-torso"
          transform={`translate(135, 225) rotate(${torsoLean})`}
          style={{ transformOrigin: '0px 85px' }}
        >
          {/* --- UNBROKEN, CONTINUOUS S-CURVE DEVIL TAIL (Bez zlomeného ocasu!) --- */}
          <g id="devil-tail">
            {/* Single continuous tapering Bézier shape from hip to brush socket — impossible to kink or break */}
            <path
              d={`M -52,10
                  C ${tailCtrl1X},${tailCtrl1Y} ${tailCtrl2X},${tailCtrl2Y} ${tailEndStemX},${tailEndStemY}
                  L ${tailEndStemX + 11},${tailEndStemY - 2}
                  C ${tailCtrl2X + 13},${tailCtrl2Y - 4} ${tailCtrl1X + 14},${tailCtrl1Y + 6} -40,24 Z`}
              fill="url(#dd-skin-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.6 : 0}
              strokeLinejoin="round"
            />
            {/* Subtle scale/ring markings along the smooth tail stem */}
            <path
              d={`M ${tailCtrl1X + 8},${tailCtrl1Y + 12} Q ${tailCtrl1X + 14},${tailCtrl1Y + 16} ${tailCtrl1X + 18},${tailCtrl1Y + 11}`}
              fill="none"
              stroke="#7C2D12"
              strokeWidth="1.8"
            />
            <path
              d={`M ${tailCtrl2X + 4},${tailCtrl2Y - 6} Q ${tailCtrl2X + 10},${tailCtrl2Y - 2} ${tailCtrl2X + 15},${tailCtrl2Y - 6}`}
              fill="none"
              stroke="#7C2D12"
              strokeWidth="1.8"
            />

            {/* Lush, long, flame-shaped dark mahogany & crimson tail brush flowing seamlessly from the stem */}
            <path
              d={`M ${tailEndStemX - 2},${tailEndStemY - 6}
                  C ${tailEndStemX - 24},${tailEndStemY + 18} ${tuftTipX - 30},${tuftTipY - 36} ${tuftTipX - 6},${tuftTipY}
                  C ${tuftTipX - 14},${tuftTipY - 18} ${tuftTipX + 8},${tuftTipY - 12} ${tuftTipX + 2},${tuftTipY + 8}
                  C ${tuftTipX + 24},${tuftTipY - 12} ${tailEndStemX + 34},${tailEndStemY + 42} ${tailEndStemX + 18},${tailEndStemY + 12}
                  C ${tailEndStemX + 14},${tailEndStemY + 2} ${tailEndStemX + 10},${tailEndStemY - 4} ${tailEndStemX - 2},${tailEndStemY - 6} Z`}
              fill="#450A0A"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.5 : 0}
              strokeLinejoin="round"
            />
            {/* Warm crimson & flame-orange flowing hair locks inside the tail brush */}
            <path
              d={`M ${tailEndStemX + 2},${tailEndStemY - 4}
                  C ${tailEndStemX - 14},${tailEndStemY + 18} ${tuftTipX - 16},${tuftTipY - 38} ${tuftTipX - 2},${tuftTipY - 12}
                  C ${tuftTipX + 12},${tuftTipY - 28} ${tailEndStemX + 20},${tailEndStemY + 24} ${tailEndStemX + 10},${tailEndStemY - 2} Z`}
              fill="#991B1B"
            />
            <path
              d={`M ${tailEndStemX + 4},${tailEndStemY - 2}
                  C ${tailEndStemX - 6},${tailEndStemY + 14} ${tuftTipX - 6},${tuftTipY - 46} ${tuftTipX + 2},${tuftTipY - 26}
                  C ${tuftTipX + 8},${tuftTipY - 38} ${tailEndStemX + 12},${tailEndStemY + 10} ${tailEndStemX + 4},${tailEndStemY - 2} Z`}
              fill="#EA580C"
            />
          </g>

          {/* --- UPPER LEFT ARM REACHING OVER THE ARCHED TOP OF THE NŮŠE --- */}
          <g
            id="upper-reaching-arm"
            transform={`translate(58, -95) rotate(${upperArmAngle})`}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Patchwork shoulder & sleeve */}
            <path
              d="M -15,-22 C 25,-42 78,-52 128,-46 C 134,-12 128,22 104,36 C 62,32 20,22 -15,-22 Z"
              fill="#15803D"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />
            {/* Sleeve quilt patches (crimson, mustard, olive) */}
            <path d="M 10,-32 L 54,-42 L 62,-6 L 16,2 Z" fill="#B91C1C" stroke={strokeCol} strokeWidth="2" />
            <path d="M 54,-42 L 96,-46 L 98,-10 L 62,-6 Z" fill="#D97706" stroke={strokeCol} strokeWidth="2" />
            <path d="M 16,2 L 62,-6 L 66,26 L 22,20 Z" fill="#4D7C0F" stroke={strokeCol} strokeWidth="2" />
            {/* Cross-stitches on upper sleeve */}
            <g stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round">
              <path d="M 50,-28 L 58,-22 M 56,-30 L 48,-20" />
              <path d="M 32,-2 L 38,6 M 40,-2 L 30,6" />
              <path d="M 74,-26 L 82,-20 M 80,-28 L 72,-18" />
            </g>

            {/* Golden-tan curly sheepskin cuff (beránek) */}
            <path
              d="M 98,-56 C 114,-62 132,-52 136,-32 C 142,-12 138,16 128,36 C 116,50 96,46 92,28 C 86,4 88,-34 98,-56 Z"
              fill="url(#dd-fleece-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Fleece wool curls & stipple dots */}
            <circle cx="114" cy="-36" r="2.2" fill="#78350F" />
            <circle cx="122" cy="-16" r="2.2" fill="#78350F" />
            <circle cx="112" cy="4" r="2.2" fill="#78350F" />
            <circle cx="120" cy="22" r="2.2" fill="#78350F" />
            <path d="M 106,-44 Q 118,-38 112,-26 Q 124,-18 116,-6 Q 126,6 114,18" fill="none" stroke="#92400E" strokeWidth="1.8" />

            {/* Sinewy hairy devil forearm & large 5-taloned claw hovering over basket */}
            <g transform="translate(124, -26)">
              {/* Bristly hairs along top of forearm */}
              <path
                d="M 8,-14 L 14,-22 M 20,-16 L 28,-24 M 34,-18 L 42,-25 M 48,-18 L 56,-24"
                stroke="#1E1108"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Forearm & palm */}
              <path
                d="M -6,-10 C 26,-20 62,-22 92,-16 C 114,-28 134,-28 148,-16 C 136,-4 120,-6 106,0 C 126,6 142,20 144,36 C 130,34 118,22 104,16 C 116,28 124,44 118,58 C 106,50 98,36 88,24 C 94,38 96,52 88,64 C 76,54 72,38 66,24 C 54,18 42,22 36,38 C 24,30 18,16 14,6 C 4,8 -4,12 -10,16 Z"
                fill="url(#dd-skin-grad)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.6 : 0}
                strokeLinejoin="round"
              />
              {/* Knuckle wrinkles & skin texture */}
              <path d="M 88,-6 Q 96,2 92,12 M 72,4 Q 80,12 76,20" stroke="#7C2D12" strokeWidth="1.8" fill="none" />
              <circle cx="24" cy="-2" r="1.5" fill="#7C2D12" />
              <circle cx="38" cy="2" r="1.5" fill="#7C2D12" />
              <circle cx="52" cy="-4" r="1.5" fill="#7C2D12" />

              {/* 5 Long Curved Dark Horn Talons (Pazoury) */}
              {/* Thumb claw (left-down) */}
              <path
                d="M 32,34 C 34,50 42,64 54,72 C 48,58 44,44 42,32 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Top index talon */}
              <path
                d="M 144,-20 C 160,-16 172,-4 176,12 C 164,2 152,-6 140,-10 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Middle talon */}
              <path
                d="M 142,32 C 148,48 144,64 134,76 C 136,60 136,46 132,34 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Ring talon */}
              <path
                d="M 118,52 C 122,66 116,80 106,90 C 108,76 110,62 108,50 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Pinky talon */}
              <path
                d="M 88,58 C 88,70 80,80 68,86 C 74,74 78,64 78,54 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
            </g>
          </g>

          {/* --- MAIN PATCHWORK FOLK MERCHANT COAT (Záplatovaný kožich) --- */}
          <g id="patchwork-coat">
            {/* Base coat silhouette */}
            <path
              d="M -98,-60 C -65,-95 25,-95 68,-60 C 82,-10 84,52 70,98 C 25,116 -48,116 -86,94 C -106,45 -112,-15 -98,-60 Z"
              fill="#1E6B7B"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />

            {/* Patchwork Swatches — Teal, Mustard Ochre, Olive Green, Burnt Orange, Brick */}
            {/* Upper left mustard & brick shoulder patches */}
            <path d="M -98,-38 L -52,-52 L -44,-8 L -96,4 Z" fill="#D97706" stroke={strokeCol} strokeWidth="2" />
            <path d="M -112,-4 L -68,-14 L -62,32 L -108,26 Z" fill="#1D6F7A" stroke={strokeCol} strokeWidth="2" />
            {/* Center teal & green quilt blocks */}
            <path d="M -48,-24 L 8,-28 L 14,28 L -42,32 Z" fill="#0F766E" stroke={strokeCol} strokeWidth="2" />
            <path d="M -38,32 L 16,28 L 22,82 L -32,86 Z" fill="#C2410C" stroke={strokeCol} strokeWidth="2" />
            {/* Lower left teal & mustard blocks */}
            <path d="M -82,36 L -36,32 L -32,86 L -78,84 Z" fill="#0D9488" stroke={strokeCol} strokeWidth="2" />
            <path d="M -42,60 L 4,58 L 8,96 L -38,96 Z" fill="#EAB308" stroke={strokeCol} strokeWidth="2" />
            {/* Right side olive & crimson blocks */}
            <path d="M 12,18 L 68,14 L 66,88 L 18,86 Z" fill="#991B1B" stroke={strokeCol} strokeWidth="2" />
            <path d="M 8,-36 L 64,-32 L 68,18 L 12,18 Z" fill="#3F6212" stroke={strokeCol} strokeWidth="2" />

            {/* Decorative Folk Cross-Stitches along patch seams */}
            <g stroke="#FEF08A" strokeWidth="2" strokeLinecap="round">
              <path d="M -76,-12 L -68,-4 M -68,-12 L -76,-4" />
              <path d="M -58,-16 L -50,-8 M -50,-16 L -58,-8" />
              <path d="M -42,8 L -34,16 M -34,8 L -42,16" />
              <path d="M -38,44 L -30,52 M -30,44 L -38,52" />
              <path d="M -58,32 L -50,40 M -50,32 L -58,40" />
              <path d="M -18,56 L -10,64 M -10,56 L -18,64" />
              <path d="M 14,42 L 22,50 M 22,42 L 14,50" />
              <path d="M 16,64 L 24,72 M 24,64 L 16,72" />
            </g>

            {/* Golden-Ochre Curly Lambskin Coat Hem (Beránek — NOT white!) */}
            <path
              d="M -88,84 C -45,74 18,76 68,88 C 76,98 70,114 54,116 C 8,112 -42,110 -82,114 C -96,108 -96,92 -88,84 Z"
              fill="url(#dd-fleece-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Curly lambskin scallops & brown wool dots */}
            <path
              d="M -78,96 Q -62,86 -48,98 Q -32,86 -16,98 Q 0,86 16,98 Q 34,86 52,98"
              fill="none"
              stroke="#92400E"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="-64" cy="96" r="2" fill="#78350F" />
            <circle cx="-36" cy="94" r="2" fill="#78350F" />
            <circle cx="-8" cy="96" r="2" fill="#78350F" />
            <circle cx="22" cy="95" r="2" fill="#78350F" />
            <circle cx="48" cy="98" r="2" fill="#78350F" />

            {/* Heavy Leather Harness Straps & Square Buckled Satchel on Left Hip */}
            <g id="leather-harness-and-bag">
              {/* Curved shoulder-to-hip leather straps */}
              <path
                d="M -96,12 C -74,-18 -42,-34 -14,-36 L -8,-18 C -34,-16 -62,-2 -84,26 Z"
                fill="url(#dd-leather-grad)"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              <path
                d="M -86,32 C -64,4 -36,-10 -10,-14 L -4,2 C -28,6 -52,18 -72,44 Z"
                fill="url(#dd-leather-grad)"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              {/* Brass rings holding the satchel */}
              <circle cx="-62" cy="18" r="5" fill="none" stroke="url(#dd-brass-grad)" strokeWidth="2.8" />
              <circle cx="-46" cy="24" r="5" fill="none" stroke="url(#dd-brass-grad)" strokeWidth="2.8" />

              {/* Square Buckled Leather Pouch (Brašna) matching reference */}
              <g transform="translate(-62, 26) rotate(-10)">
                <rect
                  x="-20"
                  y="0"
                  width="46"
                  height="50"
                  rx="6"
                  fill="url(#dd-leather-grad)"
                  stroke={strokeCol}
                  strokeWidth="2.6"
                />
                {/* Top flap */}
                <path
                  d="M -20,4 L 26,4 L 24,24 C 10,28 -6,28 -18,24 Z"
                  fill="#92400E"
                  stroke={strokeCol}
                  strokeWidth="2.2"
                />
                {/* Center buckle strap & brass buckle */}
                <rect x="-2" y="10" width="10" height="28" rx="2" fill="#451A03" stroke={strokeCol} strokeWidth="1.6" />
                <rect x="-4" y="20" width="14" height="11" rx="2" fill="url(#dd-brass-grad)" stroke={strokeCol} strokeWidth="1.6" />
                {/* Leather grain dots */}
                <circle cx="-10" cy="36" r="1.5" fill="#3B1505" />
                <circle cx="14" cy="38" r="1.5" fill="#3B1505" />
                <circle cx="16" cy="14" r="1.5" fill="#3B1505" />
              </g>
            </g>
          </g>

          {/* --- GRANDFATHER'S HEAD, HORNS, SPECTACLES, CROOKED TEETH & PIPE --- */}
          {/* Placed before the front welcoming arm so the welcoming hand naturally gestures in front of the beard tip */}
          <g
            id="grandfather-head"
            transform={`translate(-4, -82) rotate(${headRot})`}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Wild, Wiry, Wavy Cream-Parchment Beard & Hair (NOT solid white Santa beard!) */}
            <g id="wild-folklore-beard">
              {/* Base layered beard mass */}
              <path
                d="M -68,-10 C -92,12 -96,48 -78,80 C -62,112 -22,140 16,144 C 54,140 88,108 98,68 C 106,32 98,-8 78,-32 C 42,-28 -32,-28 -68,-10 Z"
                fill="#E7DEC8"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.6 : 0}
              />
              {/* Lighter parchment inner beard layer */}
              <path
                d="M -56,-2 C -76,18 -78,48 -62,76 C -46,104 -14,126 18,128 C 48,126 76,96 84,62 C 90,32 82,-2 64,-22 Z"
                fill="#F5EFE6"
              />
              {/* Dozens of individual wiry, wavy folklore hair strands */}
              <g fill="none" stroke="#8C7A6B" strokeWidth="1.8" strokeLinecap="round">
                <path d="M -58,8 Q -82,18 -74,36 Q -66,52 -78,66" />
                <path d="M -48,22 Q -68,38 -56,58 Q -46,76 -58,94" />
                <path d="M -34,38 Q -52,62 -38,84 Q -26,104 -36,120" />
                <path d="M -18,48 Q -32,76 -16,102 Q -4,122 -10,138" />
                <path d="M 0,52 Q -10,82 4,108 Q 14,126 10,142" />
                <path d="M 18,50 Q 12,80 26,106 Q 36,124 32,138" />
                <path d="M 36,40 Q 34,68 48,92 Q 58,110 52,126" />
                <path d="M 52,22 Q 56,50 68,72 Q 78,90 72,106" />
                <path d="M 64,-2 Q 76,22 86,44 Q 94,62 88,78" />
                <path d="M 70,-24 Q 88,-6 94,16 Q 102,34 94,48" />
              </g>
              {/* Fine cream highlight curls */}
              <g fill="none" stroke="#FFFDF9" strokeWidth="2.2" strokeLinecap="round">
                <path d="M -42,28 Q -58,48 -46,68 Q -36,86 -44,104" />
                <path d="M -10,50 Q -22,78 -8,104 Q 2,122 -2,136" />
                <path d="M 26,46 Q 20,76 34,100 Q 44,118 40,132" />
                <path d="M 58,12 Q 66,38 78,60 Q 86,78 80,92" />
              </g>
            </g>

            {/* Pointed Red Devil Ears Jutting Out on Both Sides */}
            <g id="devil-ears">
              {/* Left ear pointing out horizontally to the left */}
              <path
                d="M -48,-6 C -72,-12 -98,-12 -118,-22 C -106,-2 -84,12 -52,10 Z"
                fill="url(#dd-skin-grad)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.5 : 0}
                strokeLinejoin="round"
              />
              <path d="M -56,-2 C -76,-6 -92,-6 -104,-14 C -94,-2 -78,6 -56,5 Z" fill="#7C2D12" />
              {/* Right ear pointing high up-right */}
              <path
                d="M 42,-28 C 52,-54 58,-80 54,-104 C 68,-82 72,-50 56,-16 Z"
                fill="url(#dd-skin-grad)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.5 : 0}
                strokeLinejoin="round"
              />
              <path d="M 46,-26 C 54,-48 56,-68 54,-86 C 62,-68 64,-44 52,-20 Z" fill="#7C2D12" />
            </g>

            {/* Golden-Ochre Curly Lambskin Cap / Hood Trim (Beránek) */}
            <g id="curly-fleece-cap">
              {/* Cap crown */}
              <path
                d="M -62,-32 C -58,-72 12,-96 48,-62 C 56,-44 48,-24 32,-18 Z"
                fill="#B45309"
                stroke={strokeCol}
                strokeWidth="2.5"
              />
              {/* Fluffy golden curly lambskin brim across forehead */}
              <path
                d="M -72,-18 C -78,-36 -64,-56 -44,-62 C -32,-78 -6,-86 16,-76 C 36,-76 52,-60 48,-40 C 32,-48 10,-52 -14,-44 C -36,-36 -54,-24 -72,-18 Z"
                fill="url(#dd-fleece-grad)"
                stroke={strokeCol}
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {/* Stipple dots inside the golden lambskin curls */}
              <circle cx="-54" cy="-38" r="2.2" fill="#78350F" />
              <circle cx="-38" cy="-50" r="2.2" fill="#78350F" />
              <circle cx="-18" cy="-60" r="2.2" fill="#78350F" />
              <circle cx="4" cy="-64" r="2.2" fill="#78350F" />
              <circle cx="24" cy="-56" r="2.2" fill="#78350F" />
            </g>

            {/* MASSIVE RIBBED DEVIL RAM HORNS (Matching the asymmetrical spiral curves in reference) */}
            <g id="devil-horns">
              {/* Left Horn — Arches up-left and curls down into an inward spiral */}
              <g>
                <path
                  d="M -38,-48 C -64,-84 -122,-98 -154,-62 C -178,-34 -172,12 -142,26 C -118,36 -94,20 -98,2 C -102,-12 -118,-14 -124,-4 C -116,4 -116,12 -128,10 C -144,6 -148,-18 -132,-38 C -110,-62 -68,-54 -48,-24 Z"
                  fill="url(#dd-horn-grad)"
                  stroke={strokeCol}
                  strokeWidth={showOutline ? 2.8 : 0}
                  strokeLinejoin="round"
                />
                {/* Deep transverse horn rings on left horn */}
                <g stroke="#271003" strokeWidth="2.2" fill="none">
                  <path d="M -52,-58 C -46,-46 -46,-36 -54,-28" />
                  <path d="M -68,-68 C -62,-56 -62,-44 -70,-38" />
                  <path d="M -86,-74 C -82,-60 -82,-48 -90,-44" />
                  <path d="M -106,-74 C -102,-60 -104,-48 -112,-46" />
                  <path d="M -126,-68 C -122,-54 -124,-44 -132,-42" />
                  <path d="M -144,-54 C -136,-42 -136,-32 -144,-30" />
                  <path d="M -156,-34 C -146,-26 -144,-16 -152,-14" />
                  <path d="M -158,-12 C -146,-8 -142,0 -148,4" />
                </g>
                {/* Warm amber highlight along upper horn ridge */}
                <path
                  d="M -46,-50 C -72,-78 -118,-86 -146,-56"
                  stroke="#FDE68A"
                  strokeWidth="2.5"
                  strokeOpacity="0.65"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Right Horn — Arches high above head and sweeps right into an upward curl */}
              <g>
                <path
                  d="M -8,-68 C 4,-114 54,-138 98,-116 C 134,-98 156,-76 164,-92 C 170,-104 160,-122 144,-124 C 154,-132 174,-122 178,-102 C 182,-76 154,-56 120,-68 C 92,-78 68,-94 44,-86 C 24,-80 14,-64 12,-48 Z"
                  fill="url(#dd-horn-grad)"
                  stroke={strokeCol}
                  strokeWidth={showOutline ? 2.8 : 0}
                  strokeLinejoin="round"
                />
                {/* Deep transverse horn rings on right horn */}
                <g stroke="#271003" strokeWidth="2.2" fill="none">
                  <path d="M -4,-78 C 6,-76 14,-68 12,-58" />
                  <path d="M 6,-94 C 18,-90 24,-80 22,-70" />
                  <path d="M 22,-108 C 32,-100 38,-90 34,-80" />
                  <path d="M 42,-116 C 50,-106 52,-94 46,-86" />
                  <path d="M 64,-118 C 68,-106 68,-94 62,-86" />
                  <path d="M 86,-112 C 88,-100 84,-88 78,-82" />
                  <path d="M 108,-102 C 106,-90 100,-80 94,-76" />
                  <path d="M 130,-90 C 126,-78 120,-70 114,-68" />
                </g>
                {/* Warm amber highlight along right horn ridge */}
                <path
                  d="M 0,-74 C 16,-110 58,-126 96,-108"
                  stroke="#FDE68A"
                  strokeWidth="2.5"
                  strokeOpacity="0.65"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* Expressive Tilted Devil Face Base */}
            <path
              d="M -48,-18 C -42,-42 -6,-56 26,-42 C 48,-32 54,2 44,28 C 34,54 6,66 -18,56 C -42,46 -54,10 -48,-18 Z"
              fill="url(#dd-skin-grad)"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.5 : 0}
            />

            {/* Cheekbones, Forehead Furrows & Laugh Lines */}
            <ellipse cx="-28" cy="14" rx="14" ry="10" fill="#EF4444" opacity="0.55" />
            <ellipse cx="26" cy="-4" rx="13" ry="10" fill="#EF4444" opacity="0.55" />
            {/* Expressive arched eyebrows */}
            <path
              d="M -42,-12 C -34,-26 -18,-28 -8,-18"
              stroke="#450A0A"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M -2,-26 C 6,-42 24,-44 36,-32"
              stroke="#450A0A"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/*Crow's feet & forehead creases */}
            <path d="M -28,-30 Q -12,-38 6,-38" stroke="#7C2D12" strokeWidth="1.8" fill="none" />
            <path d="M 34,-18 L 44,-22 M 36,-12 L 46,-14" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" />

            {/* WIDE BULGING EXPRESSIVE EYES (Tilted along face axis) */}
            <g id="eyes">
              {/* Left Eye (lower-left) */}
              <ellipse
                cx="-20"
                cy="-4"
                rx="13.5"
                ry="14.5"
                fill="#FFFBEB"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              <circle cx={-18 + eyeDx * 0.85} cy={-4 + eyeDy * 0.85} r="7.5" fill="#7C2D12" />
              <circle cx={-18 + eyeDx * 0.85} cy={-4 + eyeDy * 0.85} r="4.5" fill="#1C1917" />
              <circle cx={-20 + eyeDx * 0.85} cy={-7 + eyeDy * 0.85} r="2.4" fill="#FFFFFF" />

              {/* Right Eye (higher-right, wider) */}
              <ellipse
                cx="14"
                cy="-18"
                rx="15"
                ry="16"
                fill="#FFFBEB"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              <circle cx={14 + eyeDx * 0.85} cy={-17 + eyeDy * 0.85} r="8.5" fill="#7C2D12" />
              <circle cx={14 + eyeDx * 0.85} cy={-17 + eyeDy * 0.85} r="5.2" fill="#1C1917" />
              <circle cx={11 + eyeDx * 0.85} cy={-20 + eyeDy * 0.85} r="2.8" fill="#FFFFFF" />
            </g>

            {/* WIDE OPEN MISCHIEVOUS GRIN WITH BARED CROOKED TEETH (Vyceněné křivé zuby!) */}
            <g id="grinning-mouth-crooked-teeth">
              {/* Outer grin smile folds */}
              <path
                d="M -34,20 C -26,8 18,-10 38,-2 C 42,24 26,52 2,56 C -20,58 -36,40 -34,20 Z"
                fill="#3B0707"
                stroke={strokeCol}
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {/* Upper & lower red gums */}
              <path
                d="M -30,20 C -18,10 14,-4 34,0 C 32,6 14,12 -28,24 Z"
                fill="#9F1239"
              />
              <path
                d="M -18,48 C -4,56 16,52 26,38 C 18,46 -2,50 -18,48 Z"
                fill="#9F1239"
              />
              {/* Lively pink-red tongue */}
              <path
                d="M -12,42 C -6,28 12,24 22,34 C 16,46 0,52 -12,42 Z"
                fill="#FB7185"
                stroke="#881337"
                strokeWidth="1.5"
              />
              <path d="M 0,32 Q 6,38 8,44" stroke="#881337" strokeWidth="1.5" fill="none" />

              {/* UPPER ROW OF BARED CROOKED TEETH (Uneven angles, sizes & gaps matching image) */}
              <g stroke={strokeCol} strokeWidth="1.6" strokeLinejoin="round">
                {/* Far-left crooked tooth */}
                <polygon points="-28,20 -20,17 -19,27 -27,28" fill="#FDE047" />
                {/* Second left tilted incisor */}
                <polygon points="-19,17 -10,13 -8,25 -17,27" fill="#FEF9C3" />
                {/* Center-left prominent crooked tooth */}
                <polygon points="-9,13 1,9 4,22 -6,25" fill="#FEF08A" />
                {/* Center-right angled tooth (with small gap) */}
                <polygon points="3,8 13,4 16,17 6,20" fill="#FEF9C3" />
                {/* Right sharp canine/premolar */}
                <polygon points="14,4 24,1 26,15 17,17" fill="#FDE047" />
                {/* Far-right molar */}
                <polygon points="24,1 33,1 32,12 25,13" fill="#EAB308" />
              </g>

              {/* LOWER ROW OF BARED CROOKED TEETH */}
              <g stroke={strokeCol} strokeWidth="1.6" strokeLinejoin="round">
                <polygon points="-22,36 -14,35 -12,45 -20,46" fill="#EAB308" />
                <polygon points="-12,40 -4,39 -3,49 -11,49" fill="#FEF08A" />
                <polygon points="-1,39 7,37 9,48 0,49" fill="#FEF9C3" />
                <polygon points="10,36 18,32 22,42 13,46" fill="#FDE047" />
                <polygon points="20,28 28,22 32,31 24,37" fill="#FEF08A" />
                <polygon points="27,20 34,14 37,22 31,28" fill="#EAB308" />
              </g>
            </g>

            {/* CARVED BRIAR WOODEN PIPE (Fajfka) tucked into left corner of grinning mouth */}
            <g id="smoking-pipe" transform="translate(-26, 28)">
              {/* Curved dark stem entering mouth */}
              <path
                d="M 6,-4 C -8,6 -20,18 -26,32 L -16,38 C -10,24 0,10 10,2 Z"
                fill="#451A03"
                stroke={strokeCol}
                strokeWidth="2.2"
              />
              {/* Warm amber-brown carved pipe bowl */}
              <path
                d="M -52,8 C -58,22 -52,40 -38,46 C -22,52 -8,42 -6,26 L -18,22 C -20,30 -26,32 -32,28 C -36,24 -36,16 -32,10 Z"
                fill="url(#dd-horn-grad)"
                stroke={strokeCol}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Bowl rim & glowing tobacco ember */}
              <ellipse
                cx="-42"
                cy="9"
                rx="11"
                ry="5.5"
                transform="rotate(14 -42 9)"
                fill="#271003"
                stroke={strokeCol}
                strokeWidth="2"
              />
              <ellipse
                cx="-42"
                cy="9"
                rx="7"
                ry="3.2"
                transform="rotate(14 -42 9)"
                fill="#EA580C"
                className="animate-pulse"
              />
              {/* Bowl highlight */}
              <path d="M -46,20 Q -42,34 -30,38" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.65" fill="none" strokeLinecap="round" />

              {/* Rising animated smoke puffs */}
              {showParticles && (
                <g id="pipe-smoke">
                  {smokePuffs.map((p, idx) => {
                    const cycle = ((t * 0.75 + p.delay) % 1.5) / 1.5;
                    const px = -44 - cycle * 32 + Math.sin(t * 3.2 + idx) * 7;
                    const py = 2 - cycle * 60;
                    const pr = p.size * (0.65 + cycle * 0.85);
                    const pOp = (1 - cycle) * p.opacity;
                    return (
                      <circle
                        key={idx}
                        cx={px}
                        cy={py}
                        r={pr}
                        fill="url(#dd-smoke-grad)"
                        opacity={pOp}
                      />
                    );
                  })}
                </g>
              )}
            </g>

            {/* ROUND WIRE-RIMMED SPECTACLES (Brýle) perched on nose bridge + HOOKED NOSE */}
            <g id="spectacles-and-nose" transform={`translate(0, ${isReact ? 4 : 0})`}>
              {/* Left spectacle temple & round lens rim (perched low on nose) */}
              <path d="M -48,4 L -36,10" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse
                cx="-25"
                cy="11"
                rx="11.5"
                ry="9.5"
                transform="rotate(-18 -25 11)"
                fill="#FEF9C3"
                fillOpacity="0.18"
                stroke="#271003"
                strokeWidth="2.8"
              />
              <ellipse
                cx="-25"
                cy="11"
                rx="11.5"
                ry="9.5"
                transform="rotate(-18 -25 11)"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.4"
              />
              <path d="M -31,7 L -22,14" stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.75" strokeLinecap="round" />

              {/* Long Hooked Red Goblin/Devil Nose drooping between the spectacle lenses */}
              <path
                d="M -6,-10 C -18,-2 -28,16 -24,28 C -20,38 -6,36 2,24 C 8,14 8,-2 -6,-10 Z"
                fill="url(#dd-nose-grad)"
                stroke={strokeCol}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Bright nose tip highlight */}
              <ellipse cx="-15" cy="18" rx="4.5" ry="7.5" transform="rotate(24 -15 18)" fill="#FCA5A5" opacity="0.75" />

              {/* Spectacle arched wire bridge over the nose + Right round lens rim */}
              <path
                d="M -15,6 C -12,-2 -4,-6 0,-2"
                fill="none"
                stroke="#271003"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M -15,6 C -12,-2 -4,-6 0,-2"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <ellipse
                cx="11"
                cy="-4"
                rx="12.5"
                ry="10.5"
                transform="rotate(-18 11 -4)"
                fill="#FEF9C3"
                fillOpacity="0.18"
                stroke="#271003"
                strokeWidth="2.8"
              />
              <ellipse
                cx="11"
                cy="-4"
                rx="12.5"
                ry="10.5"
                transform="rotate(-18 11 -4)"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.4"
              />
              <path d="M 5,-9 L 15,-1" stroke="#FFFFFF" strokeWidth="1.8" strokeOpacity="0.75" strokeLinecap="round" />
              {/* Right spectacle temple going toward right ear */}
              <path d="M 22,-8 L 40,-18" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>

          {/* --- WELCOMING FRONT RIGHT ARM & TALONED HAND (Gesturing in front of beard toward nůše) --- */}
          <g
            id="front-welcoming-arm"
            transform={`translate(-48, -10) rotate(${frontArmAngle})`}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Patchwork sleeve (teal, mustard, orange, crimson with cross-stitches) */}
            <path
              d="M -25,-12 C 4,-16 36,-4 64,18 C 56,52 32,74 4,76 C -22,58 -36,24 -25,-12 Z"
              fill="#EA580C"
              stroke={strokeCol}
              strokeWidth={showOutline ? 2.8 : 0}
            />
            <path d="M -22,-8 L 16,-8 L 12,26 L -26,22 Z" fill="#0D9488" stroke={strokeCol} strokeWidth="2" />
            <path d="M -20,22 L 18,24 L 14,54 L -16,48 Z" fill="#EAB308" stroke={strokeCol} strokeWidth="2" />
            <path d="M 16,-4 L 48,10 L 38,44 L 12,26 Z" fill="#15803D" stroke={strokeCol} strokeWidth="2" />
            <g stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round">
              <path d="M -6,18 L 2,26 M 2,18 L -6,26" />
              <path d="M 10,8 L 18,16 M 18,8 L 10,16" />
              <path d="M 4,44 L 12,52 M 12,44 L 4,52" />
            </g>

            {/* Golden-Ochre Curly Lambskin Cuff (Beránek) */}
            <path
              d="M 46,4 C 64,-2 82,12 82,32 C 82,56 64,82 42,88 C 22,92 8,78 14,58 C 20,34 32,12 46,4 Z"
              fill="url(#dd-fleece-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            <circle cx="58" cy="22" r="2.2" fill="#78350F" />
            <circle cx="62" cy="42" r="2.2" fill="#78350F" />
            <circle cx="50" cy="60" r="2.2" fill="#78350F" />
            <circle cx="34" cy="72" r="2.2" fill="#78350F" />
            <path d="M 48,16 Q 60,28 48,40 Q 58,54 42,64" fill="none" stroke="#92400E" strokeWidth="1.8" />

            {/* Open Inviting Devil Hand with 5 Long Curved Black Talons */}
            <g transform="translate(56, 42) rotate(-8)">
              {/* Wrist & open palm */}
              <path
                d="M -6,-10 C 14,-16 34,-26 52,-38 C 60,-32 58,-18 44,-8 C 66,-4 86,4 102,16 C 96,26 78,22 60,14 C 80,24 98,36 108,50 C 98,56 80,46 60,32 C 74,44 88,58 92,70 C 80,72 64,60 48,44 C 58,56 66,68 68,78 C 56,78 40,64 24,46 C 8,34 -8,24 -16,14 Z"
                fill="url(#dd-skin-grad)"
                stroke={strokeCol}
                strokeWidth={showOutline ? 2.5 : 0}
                strokeLinejoin="round"
              />
              {/* Palm life lines & forearm hair */}
              <path d="M 24,2 C 36,12 40,26 34,38 M 42,8 C 52,18 52,30 46,40" stroke="#7C2D12" strokeWidth="1.8" fill="none" />
              <circle cx="8" cy="6" r="1.5" fill="#7C2D12" />
              <circle cx="16" cy="14" r="1.5" fill="#7C2D12" />

              {/* 5 Sharp Curved Black Talons */}
              {/* Raised Thumb Talon */}
              <path
                d="M 48,-36 C 62,-46 78,-46 92,-38 C 78,-32 64,-28 52,-26 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Index Finger Talon */}
              <path
                d="M 98,14 C 114,20 128,28 138,38 C 122,36 108,30 94,22 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Middle Finger Talon */}
              <path
                d="M 104,46 C 120,54 132,62 140,72 C 124,68 110,60 98,52 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Ring Finger Talon */}
              <path
                d="M 88,66 C 102,74 112,82 118,90 C 104,86 92,78 82,70 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
              {/* Pinky Talon */}
              <path
                d="M 64,74 C 76,82 84,88 88,96 C 76,92 66,84 58,76 Z"
                fill="#1C1917"
                stroke={strokeCol}
                strokeWidth="1.8"
              />
            </g>
          </g>
        </g>
      </g>

      {/* ================= 3. GIANT OPEN WOVEN WICKER BASKET (OTEVŘENÁ NŮŠE) ================= */}
      <g
        id="wicker-nuse-root"
        transform={`translate(0, ${basketBounce})`}
      >
        {/* --- ARCHED UPPER WICKER HOOD / BACK OF THE OPEN NŮŠE --- */}
        <g id="nuse-open-hood">
          {/* Dark interior cavity of the tall arched basket */}
          <path
            d="M 210,305 L 285,180 C 318,125 352,110 400,108 L 520,100 C 544,148 548,245 532,355 L 320,395 Z"
            fill="url(#dd-basket-inside)"
            stroke={strokeCol}
            strokeWidth={showOutline ? 3 : 0}
            strokeLinejoin="round"
          />

          {/* Warm wooden planks lining the inner back wall of the hood */}
          <g stroke="#271003" strokeWidth="2">
            <path d="M 325,122 L 508,112 L 516,155 L 302,168 Z" fill="#92400E" />
            <path d="M 302,168 L 516,155 L 522,202 L 282,216 Z" fill="#78350F" />
            <path d="M 340,122 L 365,118 M 420,142 L 460,138" stroke="#B45309" strokeWidth="1.5" />
          </g>

          {/* Arched right outer wicker rim & wooden stay */}
          <path
            d="M 512,100 C 538,145 544,235 530,340 L 508,340 C 520,235 516,150 492,104 Z"
            fill="url(#dd-wicker-grad)"
            stroke={strokeCol}
            strokeWidth="2.5"
          />
          {/* Wooden stay bar with brass hinges on right inside wall */}
          <path
            d="M 505,112 L 478,245 L 494,248 L 520,115 Z"
            fill="#B45309"
            stroke={strokeCol}
            strokeWidth="2.2"
          />
          <circle cx="502" cy="155" r="3" fill="#FEF08A" stroke={strokeCol} strokeWidth="1.2" />
          <circle cx="494" cy="195" r="3" fill="#FEF08A" stroke={strokeCol} strokeWidth="1.2" />

          {/* Thick braided wicker & hemp rope along top rim + leather clasp loops */}
          <path
            d="M 278,185 C 310,128 345,108 395,106 L 518,98"
            fill="none"
            stroke="#D97706"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 278,185 C 310,128 345,108 395,106 L 518,98"
            fill="none"
            stroke="#451A03"
            strokeWidth="2.5"
            strokeDasharray="6 5"
          />
          {/* Leather clasp loop in top center */}
          <rect x="415" y="96" width="18" height="26" rx="4" transform="rotate(12 424 109)" fill="url(#dd-leather-grad)" stroke={strokeCol} strokeWidth="2.2" />
          <circle cx="423" cy="114" r="2.5" fill="#FEF08A" />

          {/* Hanging braided golden hemp ropes inside the hood */}
          <path
            d="M 368,108 C 354,132 342,158 332,182"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 368,108 C 354,132 342,158 332,182"
            fill="none"
            stroke="#451A03"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 448,104 C 446,132 450,158 456,184"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 448,104 C 446,132 450,158 456,184"
            fill="none"
            stroke="#451A03"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 498,98 C 482,124 470,152 464,178"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 498,98 C 482,124 470,152 464,178"
            fill="none"
            stroke="#451A03"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </g>

        {/* --- TIER 1 (TOP SHELF): APOTHECARY BOTTLES, SPICE JAR & LAVENDER BOUQUET --- */}
        <g id="nuse-tier-1-top">
          {/* Green leafy herbs on upper left */}
          <g transform="translate(316, 156)">
            <path d="M 0,28 L -8,-12 M 4,28 L 6,-16 M 8,28 L 16,-8" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="-8" cy="-12" rx="4" ry="7" transform="rotate(-25 -8 -12)" fill="#22C55E" stroke={strokeCol} strokeWidth="1.2" />
            <ellipse cx="6" cy="-16" rx="4" ry="7" fill="#16A34A" stroke={strokeCol} strokeWidth="1.2" />
            <ellipse cx="16" cy="-8" rx="4" ry="7" transform="rotate(25 16 -8)" fill="#22C55E" stroke={strokeCol} strokeWidth="1.2" />
          </g>

          {/* Top-left Ruby Red Bottle */}
          <g transform="translate(335, 146)">
            <path d="M 4,14 L 18,14 L 22,42 L 0,42 Z" fill="url(#dd-red-potion)" stroke={strokeCol} strokeWidth="2" />
            <rect x="6" y="4" width="10" height="10" rx="1.5" fill="#E2E8F0" fillOpacity="0.65" stroke={strokeCol} strokeWidth="1.6" />
            <rect x="5" y="-3" width="12" height="8" rx="1.5" fill="#B45309" stroke={strokeCol} strokeWidth="1.6" />
            <circle cx="8" cy="26" r="1.5" fill="#FCA5A5" />
            <circle cx="14" cy="32" r="1.5" fill="#FCA5A5" />
          </g>

          {/* Top-middle Emerald Herbal Bottle */}
          <g transform="translate(362, 148)">
            <path d="M 4,14 L 18,14 L 22,42 L 0,42 Z" fill="url(#dd-green-potion)" stroke={strokeCol} strokeWidth="2" />
            <rect x="6" y="4" width="10" height="10" rx="1.5" fill="#E2E8F0" fillOpacity="0.65" stroke={strokeCol} strokeWidth="1.6" />
            <rect x="5" y="-3" width="12" height="8" rx="1.5" fill="#B45309" stroke={strokeCol} strokeWidth="1.6" />
          </g>

          {/* Wide Glass Spice Jar & Golden Bottle */}
          <g transform="translate(390, 138)">
            <rect x="0" y="8" width="28" height="34" rx="5" fill="#DC2626" stroke={strokeCol} strokeWidth="2" />
            <rect x="3" y="0" width="22" height="9" rx="2" fill="#CBD5E1" stroke={strokeCol} strokeWidth="1.8" />
            {/* Golden bottle in front of jar */}
            <path d="M 4,24 L 20,24 L 24,52 L 0,52 Z" fill="url(#dd-gold-potion)" stroke={strokeCol} strokeWidth="2" />
            <rect x="7" y="16" width="10" height="8" rx="1.5" fill="#B45309" stroke={strokeCol} strokeWidth="1.5" />
          </g>

          {/* Lush Purple Lavender & Golden Wildflower Bouquet on Top Right */}
          <g transform="translate(458, 152)">
            {/* Stems */}
            <path d="M -12,42 L -22,-14 M -4,42 L -6,-24 M 4,42 L 10,-26 M 12,42 L 24,-16" stroke="#166534" strokeWidth="2.4" strokeLinecap="round" />
            {/* Lavender spikes */}
            {[
              { x: -20, y: -14 }, { x: -16, y: -6 }, { x: -12, y: 2 },
              { x: -6, y: -24 }, { x: -5, y: -15 }, { x: -4, y: -6 },
              { x: 10, y: -26 }, { x: 8, y: -17 }, { x: 6, y: -8 },
              { x: 24, y: -16 }, { x: 20, y: -8 }, { x: 16, y: 0 },
            ].map((fl, i) => (
              <ellipse
                key={i}
                cx={fl.x}
                cy={fl.y}
                rx="3.8"
                ry="6"
                transform={`rotate(${i % 2 === 0 ? -15 : 15} ${fl.x} ${fl.y})`}
                fill={i % 2 === 0 ? '#A855F7' : '#C084FC'}
                stroke={strokeCol}
                strokeWidth="1.2"
              />
            ))}
            {/* Golden wildflower clusters below lavender */}
            <circle cx="-18" cy="14" r="5" fill="#FACC15" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="-8" cy="18" r="5.5" fill="#EAB308" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="4" cy="16" r="5" fill="#FDE047" stroke={strokeCol} strokeWidth="1.2" />
            <circle cx="14" cy="22" r="4.5" fill="#FACC15" stroke={strokeCol} strokeWidth="1.2" />
          </g>
        </g>

        {/* --- TIER 2: BARREL, EMBROIDERED RED FOLK CLOTH, POTION RACK & PINEAPPLE --- */}
        <g id="nuse-tier-2-middle">
          {/* Curved Wooden Barrel & Folk Red Embroidered Textile Roll */}
          <g transform="translate(302, 178)">
            {/* Wooden barrel staves & brass hoop */}
            <path
              d="M 0,18 C 12,-6 42,-12 68,-2 L 155,34 C 138,62 110,82 82,86 L -10,45 Z"
              fill="#92400E"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <path
              d="M 24,-6 C 42,6 52,28 46,56 L 34,52 C 40,26 30,6 14,-4 Z"
              fill="url(#dd-brass-grad)"
              stroke={strokeCol}
              strokeWidth="1.8"
            />

            {/* Czech Traditional Red Embroidered Folk Cloth (Červený vyšívaný pás) */}
            <path
              d="M 52,-2 C 78,-10 108,-2 128,16 C 118,46 98,68 74,78 L 32,58 C 46,36 54,14 52,-2 Z"
              fill="#DC2626"
              stroke={strokeCol}
              strokeWidth="2.4"
            />
            {/* Intricate white geometric diamond & cross-stitch folk pattern */}
            <g stroke="#FFFBEB" strokeWidth="1.8" fill="none">
              <path d="M 60,4 L 116,26" strokeDasharray="3 3" />
              <path d="M 42,48 L 96,70" strokeDasharray="3 3" />
              <polygon points="68,16 78,12 82,22 72,26" />
              <polygon points="88,24 98,20 102,30 92,34" />
              <polygon points="56,34 66,30 70,40 60,44" />
              <polygon points="76,42 86,38 90,48 80,52" />
            </g>
          </g>

          {/* Tied Herb Pouches & Bright Orange Persimmon/Apple tucked above Pineapple */}
          <g transform="translate(415, 176)">
            {/* Small tied herb pouch */}
            <ellipse cx="14" cy="22" rx="16" ry="14" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2" />
            <path d="M 8,8 L 20,8 L 16,0 L 10,0 Z" fill="#D6C7B2" stroke={strokeCol} strokeWidth="1.6" />
            {/* Ripe orange fruit */}
            <circle cx="38" cy="34" r="16" fill="#EA580C" stroke={strokeCol} strokeWidth="2.2" />
            <circle cx="33" cy="29" r="4" fill="#FDBA74" opacity="0.65" />
          </g>

          {/* WOODEN APOTHECARY RACK WITH 4 CORKED POTION BOTTLES (Center-Left) */}
          <g transform="translate(274, 212)">
            {/* 4 Bottles standing in the rack: Green, Red, Gold, Green */}
            {[
              { x: 8, y: -2, rot: -10, fill: 'url(#dd-green-potion)' },
              { x: 36, y: 4, rot: -8, fill: 'url(#dd-red-potion)' },
              { x: 64, y: 12, rot: -6, fill: 'url(#dd-gold-potion)' },
              { x: 92, y: 22, rot: -4, fill: 'url(#dd-green-potion)' },
            ].map((b, idx) => (
              <g key={idx} transform={`translate(${b.x}, ${b.y}) rotate(${b.rot})`}>
                <path
                  d="M 4,14 L 20,14 L 24,46 L 0,46 Z"
                  fill={b.fill}
                  stroke={strokeCol}
                  strokeWidth="2.2"
                />
                <rect x="6" y="4" width="12" height="10" rx="2" fill="#E2E8F0" fillOpacity="0.7" stroke={strokeCol} strokeWidth="1.6" />
                <rect x="5" y="-4" width="14" height="9" rx="2" fill="#B45309" stroke={strokeCol} strokeWidth="1.6" />
                <path d="M 5,18 L 4,38" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.75" strokeLinecap="round" />
              </g>
            ))}

            {/* Wooden crate front board holding the bottles */}
            <path
              d="M -6,32 L 82,54 L 74,84 L -14,60 Z"
              fill="#B45309"
              stroke={strokeCol}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M -10,46 L 78,68" stroke="#78350F" strokeWidth="2" />
            <circle cx="0" cy="40" r="2" fill="#271003" />
            <circle cx="70" cy="60" r="2" fill="#271003" />
          </g>

          {/* LEGENDARY GOLDEN PINEAPPLE (Arzivzácný ananas) on Right Side */}
          <g transform="translate(452, 224) rotate(14)">
            {/* Lush spiky green leaf crown */}
            <g fill="#15803D" stroke={strokeCol} strokeWidth="2" strokeLinejoin="round">
              <path d="M 18,4 C 6,-18 -6,-34 -18,-44 C -4,-30 4,-14 8,6 Z" fill="#166534" />
              <path d="M 24,2 C 16,-24 10,-44 4,-58 C 18,-40 24,-20 26,4 Z" fill="#15803D" />
              <path d="M 30,2 C 30,-26 32,-48 36,-64 C 40,-44 38,-20 34,4 Z" fill="#22C55E" />
              <path d="M 34,4 C 44,-20 56,-38 68,-48 C 56,-28 46,-10 38,8 Z" fill="#16A34A" />
              <path d="M 38,8 C 52,-8 68,-18 82,-22 C 66,-8 52,4 40,12 Z" fill="#15803D" />
            </g>
            {/* Golden pineapple body with quilted diamond segments */}
            <ellipse
              cx="26"
              cy="42"
              rx="32"
              ry="40"
              fill="url(#dd-pineapple-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Diamond cross-hatching & dots */}
            <g stroke="#78350F" strokeWidth="1.8">
              <path d="M 4,20 L 48,64 M -2,34 L 38,74 M 14,8 L 56,50" />
              <path d="M 48,20 L 4,64 M 38,8 L -2,48 M 56,34 L 16,74" />
            </g>
            <circle cx="26" cy="24" r="2" fill="#FEF9C3" />
            <circle cx="14" cy="36" r="2" fill="#FEF9C3" />
            <circle cx="38" cy="36" r="2" fill="#FEF9C3" />
            <circle cx="26" cy="48" r="2" fill="#FEF9C3" />
            <circle cx="14" cy="60" r="2" fill="#FEF9C3" />
            <circle cx="38" cy="60" r="2" fill="#FEF9C3" />
          </g>
        </g>

        {/* --- TIER 3: TIED LINEN SACKS, SAUSAGES, WOODEN CHEST & BOUQUETS --- */}
        <g id="nuse-tier-3">
          {/* Red Apple & Two Plump Tied Linen Sacks (One with Blue Ribbon) */}
          <g transform="translate(362, 260)">
            {/* Glossy Red Apple */}
            <circle cx="0" cy="22" r="15" fill="#DC2626" stroke={strokeCol} strokeWidth="2.2" />
            <ellipse cx="-5" cy="17" rx="4" ry="2.5" transform="rotate(-25 -5 17)" fill="#FCA5A5" />

            {/* Large Linen Sack tied with Blue Ribbon */}
            <ellipse cx="42" cy="28" rx="30" ry="26" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2.4" />
            <path d="M 28,2 C 36,-4 50,-4 58,2 L 50,12 L 34,12 Z" fill="#F5EFE6" stroke={strokeCol} strokeWidth="2" />
            {/* Blue ribbon knot & tails */}
            <path
              d="M 30,10 C 38,6 48,6 54,10 C 50,16 36,16 30,10 Z"
              fill="#0284C7"
              stroke={strokeCol}
              strokeWidth="1.8"
            />
            <path d="M 42,12 L 34,28 M 44,12 L 52,26" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />

            {/* Second Cream Linen Sack to the right */}
            <ellipse cx="82" cy="42" rx="26" ry="22" fill="#F5EFE6" stroke={strokeCol} strokeWidth="2.4" />
            <path d="M 70,20 C 78,14 90,14 96,20 L 90,28 L 76,28 Z" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2" />
            <path d="M 74,27 L 92,27" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Left Bouquet of Lavender, Golden Yarrow & Green Herbs + Smoked Sausages */}
          <g transform="translate(232, 265)">
            {/* Green herbs & yellow flower clusters on far left corner */}
            <g fill="#16A34A" stroke={strokeCol} strokeWidth="1.6">
              <ellipse cx="8" cy="48" rx="6" ry="12" transform="rotate(-30 8 48)" />
              <ellipse cx="18" cy="42" rx="6" ry="12" transform="rotate(-15 18 42)" />
              <ellipse cx="28" cy="52" rx="6" ry="12" transform="rotate(10 28 52)" />
              <ellipse cx="16" cy="60" rx="6" ry="12" transform="rotate(-20 16 60)" />
            </g>
            {/* Purple & Golden Flower Bundles */}
            <circle cx="38" cy="18" r="6" fill="#A855F7" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="48" cy="12" r="6" fill="#C084FC" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="56" cy="20" r="6" fill="#9333EA" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="32" cy="32" r="7" fill="#F59E0B" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="44" cy="30" r="7.5" fill="#FACC15" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="56" cy="36" r="7" fill="#EAB308" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="46" cy="46" r="8" fill="#FEF08A" stroke={strokeCol} strokeWidth="1.4" />
            <circle cx="62" cy="50" r="7.5" fill="#FACC15" stroke={strokeCol} strokeWidth="1.4" />

            {/* Smoked Links of Red Sausages / Klobásy */}
            <path
              d="M 78,45 C 84,18 104,8 122,18 C 114,32 98,46 88,58 Z"
              fill="#B91C1C"
              stroke={strokeCol}
              strokeWidth="2.2"
            />
            <path
              d="M 92,52 C 100,26 118,16 136,26 C 128,40 112,54 102,64 Z"
              fill="#991B1B"
              stroke={strokeCol}
              strokeWidth="2.2"
            />
            <circle cx="96" cy="28" r="2" fill="#FCA5A5" />
            <circle cx="108" cy="24" r="2" fill="#FCA5A5" />
            <circle cx="114" cy="34" r="2" fill="#FCA5A5" />
          </g>

          {/* Spiced Glass Jar & Carved Wooden Treasure Chest with Brass Swing Handle */}
          <g transform="translate(322, 294)">
            {/* Spiced glass jar on left of chest */}
            <g transform="translate(0, 0) rotate(12)">
              <rect x="0" y="10" width="34" height="42" rx="6" fill="url(#dd-gold-potion)" stroke={strokeCol} strokeWidth="2.2" />
              <rect x="4" y="2" width="26" height="9" rx="2" fill="#E2E8F0" fillOpacity="0.8" stroke={strokeCol} strokeWidth="1.8" />
              <rect x="6" y="-5" width="22" height="8" rx="2" fill="#B45309" stroke={strokeCol} strokeWidth="1.8" />
              <circle cx="12" cy="28" r="3" fill="#DC2626" />
              <circle cx="22" cy="34" r="3" fill="#DC2626" />
            </g>

            {/* Carved Wooden Keepsake Coffer (Dřevěná truhlička) */}
            <g transform="translate(46, -2) rotate(14)">
              {/* Side & Front 3D box perspective */}
              <polygon
                points="0,8 68,8 84,-4 18,-4"
                fill="#92400E"
                stroke={strokeCol}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <rect
                x="0"
                y="8"
                width="68"
                height="46"
                rx="3"
                fill="#78350F"
                stroke={strokeCol}
                strokeWidth="2.6"
              />
              <polygon
                points="68,8 84,-4 84,40 68,54"
                fill="#451A03"
                stroke={strokeCol}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Brass studs */}
              <circle cx="6" cy="14" r="2" fill="#FEF08A" />
              <circle cx="62" cy="14" r="2" fill="#FEF08A" />
              <circle cx="6" cy="48" r="2" fill="#FEF08A" />
              <circle cx="62" cy="48" r="2" fill="#FEF08A" />
              {/* Swinging brass handle */}
              <circle cx="22" cy="26" r="3.5" fill="url(#dd-brass-grad)" stroke={strokeCol} strokeWidth="1.4" />
              <circle cx="46" cy="26" r="3.5" fill="url(#dd-brass-grad)" stroke={strokeCol} strokeWidth="1.4" />
              <path
                d="M 22,26 C 22,42 46,42 46,26"
                fill="none"
                stroke="url(#dd-brass-grad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {/* --- TIER 4 (FRONT RIM): PAINTED RED FOLK BOX, MUSHROOMS, SALAMI, ONIONS, CARROTS & MOVING MOUSE! --- */}
        <g id="nuse-tier-4-front">
          {/* Cream Garlic Sack on Left Corner */}
          <g transform="translate(274, 326)">
            <ellipse cx="22" cy="24" rx="24" ry="18" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2.4" />
            <path d="M 14,6 L 30,6 L 26,-2 L 18,-2 Z" fill="#F5EFE6" stroke={strokeCol} strokeWidth="2" />
            <path d="M 10,20 Q 22,14 34,20" fill="none" stroke="#8C7A6B" strokeWidth="1.6" />
          </g>

          {/* Round Red Folkloric Painted Box (Červená malovaná krabička) */}
          <g transform="translate(328, 336) rotate(12)">
            <ellipse cx="32" cy="24" rx="32" ry="18" fill="#B91C1C" stroke={strokeCol} strokeWidth="2.4" />
            <ellipse cx="32" cy="16" rx="32" ry="16" fill="#EF4444" stroke={strokeCol} strokeWidth="2.4" />
            {/* White folk star & wave patterns */}
            <g stroke="#FFFBEB" strokeWidth="1.6" fill="none">
              <path d="M 20,14 L 44,14 M 32,6 L 32,22 M 24,8 L 40,20 M 40,8 L 24,20" />
              <path d="M 6,24 Q 18,32 32,26 Q 46,32 58,24" />
            </g>
          </g>

          {/* Forest Mushrooms (Hříbky), Golden Onion, Marbled Salami & Carrots */}
          <g transform="translate(405, 314)">
            {/* Two Boletus Mushrooms (Hříbky) */}
            <g transform="translate(0, 12)">
              <path d="M 6,16 L 16,16 L 18,36 L 4,36 Z" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2" />
              <path d="M -2,16 C -2,2 24,2 24,16 Z" fill="#92400E" stroke={strokeCol} strokeWidth="2" />
              <path d="M 24,10 L 34,10 L 36,34 L 22,34 Z" fill="#E7DEC8" stroke={strokeCol} strokeWidth="2" />
              <path d="M 16,12 C 16,-2 42,-2 42,12 Z" fill="#78350F" stroke={strokeCol} strokeWidth="2" />
            </g>

            {/* Large Golden Onion under the mouse */}
            <ellipse cx="64" cy="28" rx="24" ry="20" fill="url(#dd-horn-grad)" stroke={strokeCol} strokeWidth="2.4" />
            <path d="M 52,12 Q 46,28 54,44 M 64,8 Q 64,28 64,46 M 76,12 Q 82,28 74,44" stroke="#78350F" strokeWidth="1.5" fill="none" />

            {/* Green bell pepper / apple */}
            <circle cx="52" cy="48" r="12" fill="#22C55E" stroke={strokeCol} strokeWidth="2" />

            {/* Red Marbled Salami / Tlačenka */}
            <g transform="translate(8, 38)">
              <ellipse cx="24" cy="18" rx="22" ry="16" fill="#991B1B" stroke={strokeCol} strokeWidth="2.2" />
              <ellipse cx="30" cy="20" rx="16" ry="14" fill="#DC2626" stroke="#FCA5A5" strokeWidth="1.8" />
              <circle cx="26" cy="16" r="2.5" fill="#FFFBEB" />
              <circle cx="34" cy="18" r="2" fill="#FFFBEB" />
              <circle cx="28" cy="24" r="2.2" fill="#FFFBEB" />
              <circle cx="35" cy="25" r="1.8" fill="#FFFBEB" />
            </g>

            {/* Two Bright Orange Carrots (Mrkve) on Bottom Right */}
            <g transform="translate(56, 36)">
              <path d="M 24,-4 L 32,-16 M 28,-2 L 38,-12" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M 18,-2 L 32,4 L 8,42 L 0,36 Z"
                fill="#F97316"
                stroke={strokeCol}
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path
                d="M 32,2 L 46,8 L 22,44 L 14,38 Z"
                fill="#EA580C"
                stroke={strokeCol}
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path d="M 14,10 L 22,14 M 10,20 L 18,24 M 28,14 L 36,18" stroke="#9A3412" strokeWidth="1.5" />
            </g>
          </g>

          {/* === THE LIVELY MOVING MOUSE IN THE NŮŠE (Pohybující se myška Rézinka!) === */}
          {showCompanion && (
            <g
              id="mouse-rezinka"
              transform={`translate(${474 + mouseScurryX}, ${296 + mouseHopY}) rotate(${mouseBodyTilt})`}
              style={{ transformOrigin: '20px 35px' }}
              className="cursor-pointer"
            >
              {/* Animated curling pink mouse tail */}
              <path
                d={`M 36,42 C ${54 + mouseTailSwing * 0.5},46 ${62 + mouseTailSwing},${28 - mouseTailSwing * 0.4} ${50 + mouseTailSwing * 0.7},14`}
                fill="none"
                stroke={strokeCol}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d={`M 36,42 C ${54 + mouseTailSwing * 0.5},46 ${62 + mouseTailSwing},${28 - mouseTailSwing * 0.4} ${50 + mouseTailSwing * 0.7},14`}
                fill="none"
                stroke="#FDA4AF"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Plump furry mouse body */}
              <path
                d="M 4,24 C 0,38 4,52 18,54 C 34,54 42,42 36,26 C 32,16 10,16 4,24 Z"
                fill="url(#dd-mouse-fur)"
                stroke={strokeCol}
                strokeWidth="2.4"
              />
              {/* Soft warm cream belly */}
              <ellipse cx="18" cy="38" rx="11" ry="12" fill="#F5EFE6" />

              {/* Cute pink hind feet perched on the onion */}
              <ellipse cx="8" cy="52" rx="6" ry="3.5" transform="rotate(-15 8 52)" fill="#FDA4AF" stroke={strokeCol} strokeWidth="1.8" />
              <ellipse cx="28" cy="53" rx="6" ry="3.5" transform="rotate(15 28 53)" fill="#FDA4AF" stroke={strokeCol} strokeWidth="1.8" />

              {/* Animated Mouse Head & Big Round Ears */}
              <g
                transform={`translate(18, 16) rotate(${mouseHeadTilt})`}
                style={{ transformOrigin: '0px 6px' }}
              >
                {/* Left Big Round Ear */}
                <g transform={`translate(-15, -10) rotate(${mouseEarL})`}>
                  <circle cx="0" cy="0" r="12" fill="#78716C" stroke={strokeCol} strokeWidth="2.2" />
                  <circle cx="0" cy="1" r="8.5" fill="#FDA4AF" />
                  <circle cx="1" cy="2" r="5" fill="#FB7185" opacity="0.55" />
                </g>

                {/* Right Big Round Ear */}
                <g transform={`translate(15, -8) rotate(${mouseEarR})`}>
                  <circle cx="0" cy="0" r="12" fill="#78716C" stroke={strokeCol} strokeWidth="2.2" />
                  <circle cx="0" cy="1" r="8.5" fill="#FDA4AF" />
                  <circle cx="-1" cy="2" r="5" fill="#FB7185" opacity="0.55" />
                </g>

                {/* Furry head & rosy cheeks */}
                <path
                  d="M -14,-2 C -14,-14 14,-14 14,-2 C 18,8 12,16 0,16 C -12,16 -18,8 -14,-2 Z"
                  fill="url(#dd-mouse-fur)"
                  stroke={strokeCol}
                  strokeWidth="2.2"
                />
                <ellipse cx="-10" cy="6" rx="4.5" ry="3" fill="#FB7185" opacity="0.55" />
                <ellipse cx="10" cy="6" rx="4.5" ry="3" fill="#FB7185" opacity="0.55" />

                {/* Cheerful open smiling mouth with tiny white tooth & pink tongue (just like reference!) */}
                <path
                  d="M -6,7 C -2,6 2,6 6,7 C 5,14 -5,14 -6,7 Z"
                  fill="#881337"
                  stroke={strokeCol}
                  strokeWidth="1.5"
                />
                <ellipse cx="0" cy="11.5" rx="3" ry="2" fill="#FB7185" />
                <rect x="-1.8" y="6.8" width="3.6" height="2.4" rx="0.5" fill="#FFFFFF" />

                {/* Big glossy dark eyes with bright catchlights */}
                <circle cx={-6 + eyeDx * 0.35} cy="-1" r="3.6" fill="#1C1917" />
                <circle cx={-7 + eyeDx * 0.35} cy="-2.2" r="1.3" fill="#FFFFFF" />
                <circle cx={6 + eyeDx * 0.35} cy="-1" r="3.6" fill="#1C1917" />
                <circle cx={5 + eyeDx * 0.35} cy="-2.2" r="1.3" fill="#FFFFFF" />

                {/* Sniffing pink nose & twitching whiskers */}
                <ellipse
                  cx="0"
                  cy={3.5 + Math.sin(t * 14) * 0.7}
                  rx="3.2"
                  ry="2.2"
                  fill="#F43F5E"
                  stroke={strokeCol}
                  strokeWidth="1.2"
                />
                <g stroke={strokeCol} strokeWidth="1.2" strokeLinecap="round">
                  <path d={`M -8,4 L -22,${1 + mouseWhiskerTwitch}`} />
                  <path d={`M -8,6 L -21,${8 + mouseWhiskerTwitch}`} />
                  <path d={`M 8,4 L 22,${1 - mouseWhiskerTwitch}`} />
                  <path d={`M 8,6 L 21,${8 - mouseWhiskerTwitch}`} />
                </g>
              </g>

              {/* Animated little front paws held on chest */}
              <ellipse
                cx={11 - mousePawWave * 0.4}
                cy={32 + mousePawWave}
                rx="4.5"
                ry="3.2"
                transform="rotate(20 11 32)"
                fill="#FDA4AF"
                stroke={strokeCol}
                strokeWidth="1.6"
              />
              <ellipse
                cx={24 + mousePawWave * 0.4}
                cy={32 - mousePawWave}
                rx="4.5"
                ry="3.2"
                transform="rotate(-20 24 32)"
                fill="#FDA4AF"
                stroke={strokeCol}
                strokeWidth="1.6"
              />
            </g>
          )}
        </g>

        {/* --- 3D WOVEN WICKER FRONT & LEFT BASKET WALLS, HEAVY STRAPS & SIDE POUCH --- */}
        <g id="nuse-front-wicker-walls">
          {/* Main 3D basket lower body (angled left wall + front wall) */}
          <path
            d="M 205,302 L 375,382 L 522,348 L 492,492 C 445,512 375,515 335,504 L 214,442 Z"
            fill="url(#dd-wicker-grad)"
            stroke={strokeCol}
            strokeWidth={showOutline ? 3 : 0}
            strokeLinejoin="round"
          />

          {/* Thick braided top rim of the lower basket wall */}
          <path
            d="M 204,300 L 375,382 L 524,346"
            fill="none"
            stroke="#D97706"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 204,300 L 375,382 L 524,346"
            fill="none"
            stroke={strokeCol}
            strokeWidth="2.6"
            strokeDasharray="7 5"
          />

          {/* Brass corner bracket at the center-front rim corner */}
          <path
            d="M 352,370 L 375,382 L 398,376 L 396,390 L 374,396 L 350,384 Z"
            fill="url(#dd-brass-grad)"
            stroke={strokeCol}
            strokeWidth="2"
          />

          {/* Intricate Diagonal & Herringbone Wicker Weave Texture */}
          <g stroke="#3B1505" strokeWidth="2.4" strokeOpacity="0.82" fill="none">
            {/* Left wall horizontal/angled weave courses */}
            <path d="M 208,326 L 372,406" />
            <path d="M 210,350 L 370,430" />
            <path d="M 212,374 L 368,454" />
            <path d="M 214,398 L 366,478" />
            <path d="M 216,422 L 355,494" />
            {/* Left wall vertical ribs */}
            <path d="M 245,322 L 250,458" />
            <path d="M 285,340 L 288,476" />
            <path d="M 325,360 L 326,494" />
            <path d="M 368,382 L 364,504" />

            {/* Front/Right wall weave courses */}
            <path d="M 374,406 L 516,374" />
            <path d="M 372,430 L 510,398" />
            <path d="M 370,454 L 504,422" />
            <path d="M 368,478 L 498,448" />
            <path d="M 418,372 L 412,502" />
            <path d="M 462,362 L 454,496" />
          </g>

          {/* Warm golden wicker glints */}
          <g stroke="#FEF08A" strokeWidth="1.6" strokeOpacity="0.45" fill="none">
            <path d="M 214,324 L 368,402" />
            <path d="M 216,372 L 364,450" />
            <path d="M 378,402 L 508,372" />
            <path d="M 376,450 L 496,420" />
          </g>

          {/* Hanging Dried Herbs on Front-Left Basket Wall */}
          <g transform="translate(296, 344)">
            <path
              d="M -6,12 C -14,34 -22,58 -24,78 M 0,14 C -4,42 -4,68 -2,92 M 6,16 C 12,42 16,66 14,88"
              stroke="#15803D"
              strokeWidth="2.4"
              fill="none"
            />
            <path
              d="M -2,24 C 6,52 8,82 4,108 M 8,26 C 18,54 22,82 18,104"
              stroke="#D97706"
              strokeWidth="2.2"
              fill="none"
            />
            {/* Braided rope ring holding the herbs */}
            <ellipse cx="2" cy="8" rx="14" ry="8" fill="#D97706" stroke={strokeCol} strokeWidth="2" />
          </g>

          {/* TWO HEAVY RIVETED LEATHER HARNESS STRAPS WITH BRASS BUCKLES */}
          {/* Left Harness Strap */}
          <g transform="translate(222, 308) rotate(8)">
            <rect
              x="0"
              y="0"
              width="28"
              height="168"
              rx="6"
              fill="url(#dd-leather-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Brass Buckle */}
            <rect x="-4" y="24" width="36" height="26" rx="4" fill="url(#dd-brass-grad)" stroke={strokeCol} strokeWidth="2.2" />
            <rect x="4" y="30" width="20" height="14" rx="2" fill="#3B1505" />
            <path d="M 14,24 L 14,42" stroke="url(#dd-brass-grad)" strokeWidth="4" strokeLinecap="round" />
            {/* Rivets / holes */}
            <circle cx="14" cy="72" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
            <circle cx="14" cy="96" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
            <circle cx="14" cy="120" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
            <circle cx="14" cy="144" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
          </g>

          {/* Center-Front Harness Strap */}
          <g transform="translate(338, 368) rotate(8)">
            <rect
              x="0"
              y="0"
              width="30"
              height="152"
              rx="6"
              fill="url(#dd-leather-grad)"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Brass Buckle */}
            <rect x="-4" y="42" width="38" height="28" rx="4" fill="url(#dd-brass-grad)" stroke={strokeCol} strokeWidth="2.2" />
            <rect x="4" y="48" width="22" height="16" rx="2" fill="#3B1505" />
            <path d="M 15,42 L 15,62" stroke="url(#dd-brass-grad)" strokeWidth="4" strokeLinecap="round" />
            {/* Rivets / holes */}
            <circle cx="15" cy="88" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
            <circle cx="15" cy="110" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
            <circle cx="15" cy="132" r="2.5" fill="#1E0B02" stroke="#D97706" strokeWidth="1" />
          </g>

          {/* RIGHT SIDE HANGING LINEN POUCH WITH RED BEADED CORD, GARLIC & COILED ROPES */}
          <g transform="translate(415, 368)">
            {/* Braided rope loop & bottom coil */}
            <path
              d="M -6,12 C 4,48 -2,88 -18,136 C 18,144 68,138 102,118"
              fill="none"
              stroke="#D97706"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <path
              d="M -6,12 C 4,48 -2,88 -18,136 C 18,144 68,138 102,118"
              fill="none"
              stroke={strokeCol}
              strokeWidth="2.4"
              strokeDasharray="6 5"
            />

            {/* Plump Linen Side Pouch */}
            <path
              d="M 46,24 C 24,38 18,74 32,98 C 46,120 82,118 96,94 C 106,72 94,38 72,24 Z"
              fill="#E7DEC8"
              stroke={strokeCol}
              strokeWidth="2.6"
            />
            {/* Garlic bulb tied to the top of the pouch */}
            <ellipse cx="78" cy="20" rx="14" ry="11" fill="#F5EFE6" stroke={strokeCol} strokeWidth="2" />
            <path d="M 70,12 Q 74,20 72,28 M 82,12 Q 84,20 82,28" stroke="#8C7A6B" strokeWidth="1.5" fill="none" />

            {/* Red Beaded Folk Cord / Tassel */}
            <g fill="#DC2626" stroke={strokeCol} strokeWidth="1.4">
              <circle cx="56" cy="12" r="4" />
              <circle cx="62" cy="18" r="4" />
              <circle cx="54" cy="24" r="4" />
              <circle cx="48" cy="34" r="3.8" />
              <circle cx="44" cy="44" r="3.8" />
              <circle cx="42" cy="54" r="3.8" />
              <circle cx="56" cy="36" r="3.8" />
              <circle cx="54" cy="46" r="3.8" />
            </g>

            {/* Diagonal Leather Strap End across bottom right */}
            <path
              d="M 4,-2 C 12,48 38,94 88,128 L 74,142 C 24,106 -4,56 -12,4 Z"
              fill="url(#dd-leather-grad)"
              stroke={strokeCol}
              strokeWidth="2.5"
            />
            <circle cx="24" cy="58" r="2.2" fill="#1E0B02" />
            <circle cx="40" cy="80" r="2.2" fill="#1E0B02" />
            <circle cx="58" cy="100" r="2.2" fill="#1E0B02" />
          </g>
        </g>
      </g>

      {/* ================= 4. ACTION SPARKLES & MAGIC GLOW ================= */}
      {isAction && showParticles && (
        <g id="action-particles" pointerEvents="none">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = ((angle + t * 40) * Math.PI) / 180;
            const dist = 78 + Math.sin(t * 7 + i) * 16;
            const sx = 395 + Math.cos(rad) * dist;
            const sy = 245 + Math.sin(rad) * dist;
            return (
              <g key={i} transform={`translate(${sx}, ${sy}) rotate(${t * 85})`}>
                <polygon points="0,-8 2.2,-2.2 8,0 2.2,2.2 0,8 -2.2,2.2 -8,0 -2.2,-2.2" fill="#FEF08A" stroke={strokeCol} strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.8" fill="#D97706" />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
