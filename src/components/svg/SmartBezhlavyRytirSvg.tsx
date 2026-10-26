import React, { useRef, useState, useEffect } from 'react';
import type { SmartCharacterProps, MousePointerState } from './types';

/**
 * SmartBezhlavyRytirSvg - Interactive smart vector SVG animation
 * Inspired by classic Czech fairy tale & castle legends (Hrad Zlenice, Karlštejn) of the Headless Knight (Bezhlavý rytíř) – ENEMY BOSS
 * Features:
 * - Menacing blackened gothic plate armor with spiked pauldrons, brass rivets & golden spurs
 * - White battle tabard with the authentic Czech two-tailed crowned lion rampant
 * - Billowing tattered royal crimson cape with shredded gothic edges
 * - Bloody severed neck stump pulsing with cursed crimson embers & ghost ectoplasm
 * - Severed helmeted head carried in left armored arm: glowing spectral eyes track pointer, flowing battle plume & roaring visor
 * - Massive two-handed runic executioner greatsword crackling with cursed energy
 * - Dark boss aura with glowing red ground runes, cursed sparks & spectral mist
 * - Boss animation set: idle, walk, sprint (charge), action (midnight cleave & roar), react (enrage/poise), flee (spectral phase shift)
 */
export const SmartBezhlavyRytirSvg: React.FC<SmartCharacterProps> = ({
  state = 'idle',
  time: externalTime,
  speed = 1,
  isPlaying = true,
  direction = 1,
  size = 440,
  interactive = true,
  className = '',
  style = {},
  onClick,
  features = {},
}) => {
  const {
    showHeadGlow = true,
    showParticles = true,
    showShadow = true,
    showOutline = true,
    showBossAura = true,
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

  // Kinematic parameters
  const walkSpeed = isSprinting ? 12 : isWalking ? 7.5 : isAction ? 14 : isReact ? 18 : 2.2;
  const walkSin = Math.sin(t * walkSpeed);
  const walkCos = Math.cos(t * walkSpeed);

  // Heavy armored boss body bobbing and lean
  const bobY = isAction
    ? -Math.abs(Math.sin(t * 12)) * 12 - 4
    : isSprinting
    ? -Math.abs(walkSin) * 14
    : isWalking
    ? -Math.abs(walkSin) * 9
    : isReact
    ? -Math.abs(Math.sin(t * 14)) * 6 - 2
    : Math.sin(t * 2.2) * 2.5;

  const torsoLean = isAction
    ? -12 + Math.sin(t * 10) * 10
    : isSprinting
    ? 15 + walkSin * 3
    : isWalking
    ? 5 + walkCos * 2
    : isReact
    ? -8 + Math.sin(t * 20) * 3
    : isFleeing
    ? -6 + Math.sin(t * 4) * 2
    : Math.sin(t * 1.5) * 1.2;

  // Armored stride kinematics for plate boots (sabatons) - legs ONLY swing when actively moving
  const strideAmp = isMoving ? (isSprinting ? 24 : isFleeing ? 20 : 15) : 0;
  const legSwingRot = isMoving ? (isSprinting ? 26 : isFleeing ? 22 : 16) : 0;
  const leftLegX = isMoving ? -26 + walkSin * strideAmp : -26;
  const leftLegY = isMoving ? 32 - Math.max(0, walkCos) * (strideAmp * 0.65) : 32;
  const leftLegRot = isMoving ? walkSin * legSwingRot : 0;

  const rightLegX = isMoving ? 26 - walkSin * strideAmp : 26;
  const rightLegY = isMoving ? 32 - Math.max(0, -walkCos) * (strideAmp * 0.65) : 32;
  const rightLegRot = isMoving ? -walkSin * legSwingRot : 0;

  // Cape flutter in cursed night wind
  const capeFlutter = isSprinting
    ? -25 + Math.sin(t * 16) * 18
    : isAction
    ? -18 + Math.sin(t * 14) * 22
    : isWalking
    ? -8 + Math.sin(t * 8) * 12
    : Math.sin(t * 3) * 6;

  // Greatsword combat stance and cleave swing
  const swordAngle = isAction
    ? -85 + Math.sin(t * 14) * 75 // Massive overhead cleave
    : isReact
    ? -35 + Math.sin(t * 18) * 15 // Defensive parry guard
    : isSprinting
    ? 45 + Math.sin(t * 12) * 15 // Leveled charge thrust
    : isWalking
    ? 12 + Math.sin(t * 7.5) * 16
    : 8 + Math.sin(t * 2) * 4;

  // Severed head position & gaze tracking
  const headBobX = Math.sin(t * (isMoving ? walkSpeed : 2.5)) * (isMoving ? 4 : 1.5);
  const headBobY = Math.cos(t * (isMoving ? walkSpeed : 2.5)) * (isMoving ? 5 : 2);
  const headAngle = isAction
    ? -18 + Math.sin(t * 14) * 14
    : isReact
    ? 15 + Math.sin(t * 16) * 10
    : isSprinting
    ? 10
    : -5 + Math.sin(t * 2) * 4;

  // Fiery spectral eye gaze tracking
  const gazeX = isReact
    ? 2.5 + Math.sin(t * 24) * 1.5
    : pointer.isHovered
    ? pointer.x * 4.5
    : Math.sin(t * 1.5) * 2;

  const gazeY = isReact
    ? -1.5
    : pointer.isHovered
    ? pointer.y * 3.5
    : 0;

  // Severed helmet plume waft
  const plumeWaft = isSprinting
    ? -30 + Math.sin(t * 16) * 18
    : isAction
    ? -22 + Math.sin(t * 18) * 16
    : Math.sin(t * 3.5) * 8;

  // Cursed embers rising from neck stump
  const neckEmbers = [
    { x: 235 + Math.sin(t * 8 + 0) * 12, y: 155 - ((t * 40 + 0) % 36), r: 2.8, col: '#EF4444' },
    { x: 245 + Math.cos(t * 9 + 2) * 14, y: 152 - ((t * 45 + 15) % 40), r: 3.2, col: '#F97316' },
    { x: 240 + Math.sin(t * 7 + 4) * 10, y: 150 - ((t * 50 + 25) % 42), r: 2.5, col: '#DC2626' },
  ];

  // Dark boss aura particles (floating souls/sparks)
  const bossParticles = [
    { x: 190 + Math.sin(t * 2.5 + 0) * 40, y: 340 + Math.cos(t * 2.8 + 0) * 40, r: 4.5, op: 0.5 },
    { x: 290 + Math.cos(t * 2.2 + 1) * 35, y: 320 + Math.sin(t * 2.5 + 1) * 45, r: 5.0, op: 0.6 },
    { x: 240 + Math.sin(t * 3.1 + 2) * 55, y: 220 + Math.cos(t * 2.9 + 2) * 50, r: 3.8, op: 0.45 },
    { x: 150 + Math.cos(t * 2.7 + 3) * 30, y: 260 + Math.sin(t * 2.4 + 3) * 35, r: 4.2, op: 0.55 },
  ];

  // Ground rune rotation
  const runeAngle = (t * 25) % 360;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 480 480"
      width={size}
      height={size}
      className={`smart-bezhlavy-rytir-svg select-none cursor-pointer ${className}`}
      style={{ overflow: 'visible', ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label="Smart animovaný Bezhlavý rytíř – mocný boss z tajemné hlásky s vlastním hrdlem a popravčím mečem"
    >
      <defs>
        {/* Dark Gothic Blackened Steel Armor */}
        <linearGradient id="bossPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#334155" />
          <stop offset="70%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Polished Steel Highlight */}
        <linearGradient id="bossSteelShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Royal Tattered Crimson Cloak */}
        <linearGradient id="bossCapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="50%" stopColor="#7F1D1D" />
          <stop offset="85%" stopColor="#450A0A" />
          <stop offset="100%" stopColor="#250505" />
        </linearGradient>

        {/* Cursed Runic Sword Glow */}
        <linearGradient id="cursedBladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="40%" stopColor="#F87171" />
          <stop offset="60%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>

        {/* Severed Neck Stump Blood */}
        <radialGradient id="neckStumpGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="60%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#450A0A" />
        </radialGradient>

        {/* Boss Spectral Fire Filter */}
        <filter id="bossFireGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Cleave Slash Glow */}
        <filter id="bossSlashGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        transform={`translate(240, 240) scale(${direction}, 1) translate(-240, -240)`}
        opacity={isFleeing ? 0.72 : 1}
      >
        {/* GROUND SHADOW & RUNIC BOSS SUMMON CIRCLE */}
        {showShadow && (
          <g opacity="0.45">
            <ellipse cx={240} cy={445} rx={95} ry={18} fill="#020617" />
          </g>
        )}

        {/* BOSS CURSED GROUND RUNES */}
        {showBossAura && (
          <g id="boss-ground-runes" transform="translate(240, 442) scale(1, 0.32)">
            {/* Outer Runic Circle */}
            <circle
              cx="0"
              cy="0"
              r="135"
              fill="none"
              stroke="#DC2626"
              strokeWidth="3"
              strokeDasharray="20 10 5 10"
              opacity="0.75"
              filter="url(#bossFireGlow)"
              transform={`rotate(${runeAngle})`}
            />
            {/* Inner Runic Pentagon & Spikes */}
            <circle
              cx="0"
              cy="0"
              r="105"
              fill="none"
              stroke="#B91C1C"
              strokeWidth="2.5"
              strokeDasharray="14 8"
              opacity="0.6"
              transform={`rotate(${-runeAngle * 1.4})`}
            />
            {/* Radial Rune Rays */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="40"
                y1="0"
                x2="125"
                y2="0"
                stroke="#EF4444"
                strokeWidth="2"
                opacity="0.45"
                transform={`rotate(${deg + runeAngle})`}
              />
            ))}
          </g>
        )}

        {/* FLOATING CURSED PARTICLES & GHOSTLY WISPS */}
        {showParticles && showBossAura && (
          <g className="boss-wisps">
            {bossParticles.map((p, idx) => (
              <circle
                key={`wisp-${idx}`}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill="#DC2626"
                opacity={p.op}
                filter="url(#bossFireGlow)"
              />
            ))}
          </g>
        )}

        {/* BOSS CLEAVE SHOCKWAVE (ACTION MODE) */}
        {isAction && (
          <g id="boss-cleave-wave" transform="translate(320, 260)">
            <path
              d="M -70,-130 C 50,-80 120,20 80,140"
              fill="none"
              stroke="#EF4444"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#bossSlashGlow)"
            />
            <path
              d="M -50,-110 C 60,-65 110,25 75,120"
              fill="none"
              stroke="#FEF08A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ======================================================== */}
        {/* BILLOWING TATTERED CRIMSON CLOAK (DRAWN BEHIND ARMOR)   */}
        {/* ======================================================== */}
        <g id="boss-cape" transform={`translate(225, 200) rotate(${capeFlutter})`}>
          {/* Main Heavy Crimson Cloak */}
          <path
            d="M -45,-30 C -95,60 -115,160 -95,215 C -65,225 -40,195 -20,215 C 5,230 30,195 55,210 C 70,180 50,60 35,-30 Z"
            fill="url(#bossCapeGrad)"
            stroke="#1C1610"
            strokeWidth={showOutline ? '5' : '4'}
            strokeLinejoin="round"
          />
          {/* Cloak Frayed Gothic Hem Points */}
          <path
            d="M -95,215 L -85,200 L -72,218 L -60,198 L -48,220 L -35,202 L -20,215"
            fill="#450A0A"
            stroke="#1C1610"
            strokeWidth="2"
          />
          {/* Golden Hem Trim */}
          <path
            d="M -45,-30 C -95,60 -115,160 -95,215"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeDasharray="6 3"
          />
          <path
            d="M 35,-30 C 50,60 70,180 55,210"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeDasharray="6 3"
          />
        </g>

        {/* ======================================================== */}
        {/* BOSS ROOT BODY (ARMOR & KINEMATICS)                      */}
        {/* ======================================================== */}
        <g id="boss-body" transform={`translate(0, ${bobY}) rotate(${torsoLean}, 240, 280)`}>
          {/* 1. ARTICULATED GOTHIC PLATE GREAVES & SABATONS */}
          <g id="boss-legs" transform="translate(240, 395)">
            {/* Left Armored Boot */}
            <g
              id="boss-left-leg"
              transform={`translate(${leftLegX}, ${leftLegY}) rotate(${leftLegRot})`}
            >
              {/* Thigh Poleyn & Shin Greave */}
              <path
                d="M -16,-28 L 8,-28 L 12,10 L -12,10 Z"
                fill="url(#bossPlateGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
              />
              {/* Spiked Knee Poleyn */}
              <circle cx="-2" cy="-14" r="8" fill="#475569" stroke="#1C1610" strokeWidth="2.5" />
              <path d="M 6,-14 L 14,-14 L 6,-10 Z" fill="#64748B" stroke="#1C1610" strokeWidth="1.5" />

              {/* Pointed Gothic Sabaton Boot */}
              <path
                d="M -16,8 L 10,8 L 26,16 C 30,18 28,24 22,24 C 8,24 -16,24 -22,18 C -24,14 -20,8 -16,8 Z"
                fill="url(#bossSteelShine)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              {/* Golden Heraldic Spur on Heel */}
              <g transform="translate(-20, 16)">
                <line x1="0" y1="0" x2="-10" y2="0" stroke="#F59E0B" strokeWidth="2.5" />
                <polygon points="-10,-5 -15,0 -10,5 -5,0" fill="#FACC15" stroke="#1C1610" strokeWidth="1.2" />
              </g>
            </g>

            {/* Right Armored Boot */}
            <g
              id="boss-right-leg"
              transform={`translate(${rightLegX}, ${rightLegY}) rotate(${rightLegRot})`}
            >
              <path
                d="M -16,-28 L 8,-28 L 12,10 L -12,10 Z"
                fill="url(#bossPlateGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
              />
              <circle cx="-2" cy="-14" r="8" fill="#475569" stroke="#1C1610" strokeWidth="2.5" />
              <path d="M 6,-14 L 14,-14 L 6,-10 Z" fill="#64748B" stroke="#1C1610" strokeWidth="1.5" />

              <path
                d="M -16,8 L 10,8 L 26,16 C 30,18 28,24 22,24 C 8,24 -16,24 -22,18 C -24,14 -20,8 -16,8 Z"
                fill="url(#bossSteelShine)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.5' : '3.5'}
                strokeLinejoin="round"
              />
              <g transform="translate(-20, 16)">
                <line x1="0" y1="0" x2="-10" y2="0" stroke="#F59E0B" strokeWidth="2.5" />
                <polygon points="-10,-5 -15,0 -10,5 -5,0" fill="#FACC15" stroke="#1C1610" strokeWidth="1.2" />
              </g>
            </g>
          </g>

          {/* 2. ARMORED TORSO & CZECH TWO-TAILED LION TABARD */}
          <g id="boss-torso" transform="translate(240, 240)">
            {/* Chainmail Hauberk Skirt */}
            <path
              d="M -42,45 C -44,80 44,80 42,45 Z"
              fill="#334155"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Chainmail Ring Pattern */}
            <line x1="-35" y1="58" x2="35" y2="58" stroke="#64748B" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="-30" y1="68" x2="30" y2="68" stroke="#64748B" strokeWidth="2" strokeDasharray="3 3" />

            {/* Gothic Steel Breastplate Cuirass */}
            <path
              d="M -50,-45 C -54,10 -48,45 -36,52 C -18,58 18,58 36,52 C 48,45 54,10 50,-45 C 28,-36 -28,-36 -50,-45 Z"
              fill="url(#bossPlateGrad)"
              stroke="#1C1610"
              strokeWidth={showOutline ? '5' : '4'}
              strokeLinejoin="round"
            />

            {/* WHITE HERALDIC SURCOAT / TABARD OVER CHEST */}
            <path
              d="M -32,-42 C -34,15 -28,45 -22,50 C -10,54 10,54 22,50 C 28,45 34,15 32,-42 Z"
              fill="#F8FAFC"
              stroke="#1C1610"
              strokeWidth="3"
            />

            {/* CZECH TWO-TAILED LION RAMPANT (Český dvouocasý lev se zlatou korunou) */}
            <g transform="translate(0, 4) scale(0.72)">
              {/* Lion Body Silhouette */}
              <path
                d="M -8,-24 C -2,-26 6,-24 8,-20 C 14,-12 10,0 8,8 C 12,14 16,18 20,24 C 18,26 12,24 8,18 C 4,22 0,26 -6,24 C -12,20 -10,12 -8,6 C -12,0 -16,-12 -8,-24 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="1.5"
              />
              {/* Lion's Forepaws with Golden Claws */}
              <path d="M 8,-14 L 18,-20 L 16,-10 Z" fill="#DC2626" />
              <path d="M 6,-4 L 18,-2 L 14,4 Z" fill="#DC2626" />
              <circle cx="18" cy="-20" r="1.5" fill="#FACC15" />
              <circle cx="18" cy="-2" r="1.5" fill="#FACC15" />

              {/* Iconic Double Forked Tails (Dva ocasy s chomáči) */}
              <path
                d="M -8,12 C -18,6 -24,-4 -18,-14 C -14,-18 -10,-10 -14,-4 C -12,2 -8,6 -4,8"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3"
              />
              <path
                d="M -8,14 C -22,12 -28,24 -24,34 C -18,36 -16,28 -20,24 C -18,18 -10,16 -4,14"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3"
              />
              {/* Golden Crown on Lion's Head */}
              <polygon points="2,-28 5,-23 8,-28 11,-23 14,-28 12,-20 4,-20" fill="#FACC15" stroke="#B45309" strokeWidth="0.8" />
            </g>

            {/* Massive Spiked Pauldrons (Ramenní pláty s hroty) */}
            <g transform="translate(-48, -40)">
              <ellipse cx="0" cy="0" rx="16" ry="14" fill="url(#bossSteelShine)" stroke="#1C1610" strokeWidth="3" />
              {/* Shoulder Spike */}
              <polygon points="-8,-4 -22,-14 -4,-12" fill="#64748B" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="2.5" fill="#F59E0B" />
            </g>
            <g transform="translate(48, -40)">
              <ellipse cx="0" cy="0" rx="16" ry="14" fill="url(#bossSteelShine)" stroke="#1C1610" strokeWidth="3" />
              <polygon points="8,-4 22,-14 4,-12" fill="#64748B" stroke="#1C1610" strokeWidth="2" />
              <circle cx="0" cy="0" r="2.5" fill="#F59E0B" />
            </g>
          </g>

          {/* 3. BLOODY SEVERED NECK STUMP (Krvavý pahýl krku) */}
          <g id="boss-neck-stump" transform="translate(240, 185)">
            {/* Dark Bloody Gorget Base */}
            <path
              d="M -22,-10 C -12,-16 12,-16 22,-10 L 24,0 C 12,6 -12,6 -24,0 Z"
              fill="url(#bossPlateGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* The Severed Flesh & Blood Basin */}
            <ellipse cx="0" cy="-8" rx="20" ry="9" fill="url(#neckStumpGrad)" stroke="#1C1610" strokeWidth="3" />
            {/* Exposed Spinal Bone Ring */}
            <ellipse cx="0" cy="-8" rx="6" ry="3.5" fill="#F8FAFC" stroke="#7F1D1D" strokeWidth="1.8" />

            {/* Blood Dripping Down the Breastplate */}
            <path d="M -12,-3 C -10,12 -12,24 -11,32" stroke="#991B1B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 8,-3 C 10,15 9,28 11,36" stroke="#991B1B" strokeWidth="2.8" strokeLinecap="round" fill="none" />

            {/* Glowing Ethereal Crimson Embers */}
            {showParticles &&
              neckEmbers.map((emb, idx) => (
                <circle
                  key={`ember-${idx}`}
                  cx={emb.x - 240}
                  cy={emb.y - 185}
                  r={emb.r}
                  fill={emb.col}
                  filter="url(#bossFireGlow)"
                />
              ))}
          </g>

          {/* 4. COLOSSAL TWO-HANDED EXECUTIONER GREATSWORD (Right Arm) */}
          <g id="boss-sword-arm" transform={`translate(295, 205) rotate(${swordAngle})`}>
            {/* Armored Forearm & Spiked Vambrace */}
            <path
              d="M -10,-10 L 12,5 L 24,30 L 8,34 Z"
              fill="url(#bossPlateGrad)"
              stroke="#1C1610"
              strokeWidth="3.5"
            />
            {/* Armored Steel Gauntlet */}
            <circle cx="22" cy="30" r="11" fill="url(#bossSteelShine)" stroke="#1C1610" strokeWidth="3" />

            {/* THE GREATSWORD (Obouruční zlenický meč) */}
            <g transform="translate(22, 28)">
              {/* Sword Hilt & Skull Pommel */}
              <line x1="0" y1="28" x2="0" y2="-20" stroke="#78350F" strokeWidth="5.5" />
              <line x1="0" y1="28" x2="0" y2="-20" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="3 3" />
              {/* Skull Pommel */}
              <circle cx="0" cy="30" r="6" fill="#CBD5E1" stroke="#1C1610" strokeWidth="2" />

              {/* Cruciform Crossguard with Spikes */}
              <path
                d="M -30,-20 L 30,-20 L 34,-25 L 30,-30 L -30,-30 L -34,-25 Z"
                fill="url(#bossSteelShine)"
                stroke="#1C1610"
                strokeWidth="3"
              />
              <circle cx="0" cy="-25" r="4.5" fill="#EF4444" stroke="#1C1610" strokeWidth="1.5" />

              {/* Colossal Blade (190px long!) with Blood Groove */}
              <path
                d="M -14,-30 L 14,-30 L 10,-210 L 0,-235 L -10,-210 Z"
                fill="url(#cursedBladeGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '4.8' : '3.8'}
                strokeLinejoin="round"
              />
              {/* Central Fuller / Blood Groove */}
              <line x1="0" y1="-30" x2="0" y2="-200" stroke="#7F1D1D" strokeWidth="3" />

              {/* Ancient Carved Runes Glowing Crimson on Blade */}
              {[-60, -95, -130, -165].map((ry, idx) => (
                <g key={idx} transform={`translate(0, ${ry})`}>
                  <path
                    d="M -4,-6 L 4,6 M -4,6 L 4,-6 M 0,-8 L 0,8"
                    stroke="#FEF08A"
                    strokeWidth="1.8"
                    filter="url(#bossFireGlow)"
                  />
                </g>
              ))}
            </g>
          </g>

          {/* 5. SEVERED HEAD CARRIED IN LEFT ARM (With Visor, Plume & Tracking Eyes) */}
          <g
            id="boss-severed-head-group"
            transform={`translate(${160 + headBobX}, ${205 + headBobY}) rotate(${headAngle})`}
          >
            {/* Armored Left Gauntlet Cradling the Severed Head */}
            <path
              d="M 55,20 C 35,45 10,48 -15,40 C -18,34 -12,28 -5,30 C 15,36 35,32 45,10 Z"
              fill="url(#bossPlateGrad)"
              stroke="#1C1610"
              strokeWidth="4"
            />
            {/* Armored Finger Claws Wrapping Around Helmet */}
            <circle cx="-10" cy="30" r="5" fill="#94A3B8" stroke="#1C1610" strokeWidth="2" />
            <circle cx="2" cy="34" r="5" fill="#94A3B8" stroke="#1C1610" strokeWidth="2" />
            <circle cx="16" cy="32" r="5" fill="#94A3B8" stroke="#1C1610" strokeWidth="2" />

            {/* SEVERED HELMET (Gothic Great Helm / Sallet) */}
            <g id="knight-helm" transform="translate(0, -5)">
              {/* Helmet Dome */}
              <path
                d="M -32,-30 C -36,-72 36,-72 32,-30 C 30,15 24,35 0,38 C -24,35 -30,15 -32,-30 Z"
                fill="url(#bossPlateGrad)"
                stroke="#1C1610"
                strokeWidth={showOutline ? '5' : '4'}
                strokeLinejoin="round"
              />

              {/* Gothic Helmet Crest Ridge */}
              <path
                d="M 0,-72 L 0,38"
                stroke="#94A3B8"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* MENACING HORIZONTAL EYE VISOR SLIT */}
              <g transform="translate(0, -18)">
                {/* Dark Visor Inset */}
                <path
                  d="M -26,-4 L 26,-4 C 28,6 20,10 0,11 C -20,10 -28,6 -26,-4 Z"
                  fill="#020617"
                  stroke="#1C1610"
                  strokeWidth="3"
                />

                {/* PIERCING FIERY RED SPECTRAL EYES (Track pointer) */}
                {showHeadGlow && (
                  <g className="boss-spectral-eyes" filter="url(#bossFireGlow)">
                    {/* Left Eye */}
                    <ellipse
                      cx={-11 + gazeX}
                      cy={2 + gazeY}
                      rx="5"
                      ry="2.8"
                      fill="#EF4444"
                    />
                    <circle cx={-11 + gazeX} cy={2 + gazeY} r="1.5" fill="#FFFBEB" />

                    {/* Right Eye */}
                    <ellipse
                      cx={11 + gazeX}
                      cy={2 + gazeY}
                      rx="5"
                      ry="2.8"
                      fill="#EF4444"
                    />
                    <circle cx={11 + gazeX} cy={2 + gazeY} r="1.5" fill="#FFFBEB" />
                  </g>
                )}
              </g>

              {/* BREATHING HOLES / MENACING SKULL GRILLE */}
              <g transform="translate(0, 8)">
                {[-14, -7, 0, 7, 14].map((hx) => (
                  <circle key={hx} cx={hx} cy="0" r="1.8" fill="#020617" />
                ))}
                {[-10, -3, 4, 11].map((hx) => (
                  <circle key={hx} cx={hx} cy="6" r="1.8" fill="#020617" />
                ))}
              </g>

              {/* ARTICULATED VISOR / JAW FOR BOSS ROAR */}
              {isAction && (
                <g id="boss-roar-jaw" transform="translate(0, 18)">
                  <path
                    d="M -20,-2 C -12,14 12,14 20,-2 Z"
                    fill="#450A0A"
                    stroke="#1C1610"
                    strokeWidth="2.8"
                  />
                  {/* Jagged teeth inside visor */}
                  <polygon points="-12,0 -9,6 -6,0 -3,6 0,0 3,6 6,0 9,6 12,0" fill="#F8FAFC" />
                  {/* Sonic Roar Shockwave Rings */}
                  <ellipse
                    cx="0"
                    cy="8"
                    rx="35"
                    ry="18"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeDasharray="10 6"
                    filter="url(#bossFireGlow)"
                  />
                </g>
              )}

              {/* FLOWING CRIMSON BATTLE PLUME (Chochol na přilbě) */}
              <g id="helmet-plume" transform={`translate(0, -68) rotate(${plumeWaft})`}>
                {/* Plume Socket */}
                <rect x="-5" y="0" width="10" height="7" rx="2" fill="#F59E0B" stroke="#1C1610" strokeWidth="2" />
                {/* Long Billowing Feather Plume */}
                <path
                  d="M 0,0 C -25,-25 -45,-15 -65,15 C -45,5 -20,8 0,0 Z"
                  fill="#DC2626"
                  stroke="#1C1610"
                  strokeWidth="3"
                />
                <path
                  d="M 0,0 C 15,-30 45,-25 60,8 C 40,-4 18,2 0,0 Z"
                  fill="#991B1B"
                  stroke="#1C1610"
                  strokeWidth="2.5"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
