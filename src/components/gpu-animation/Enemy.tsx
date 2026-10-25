import React, { useRef } from 'react';
import {
  type EnemyProps,
  type EnemyArchetype,
  ARCHETYPE_PRESETS,
  computeVolumePreservingStretch,
} from './types';
import { ENEMY_ARCHETYPE_MAP, getEnemyGpuConfig } from './enemyCatalog';
import { BAKED_SPRITES } from './sprites';
import './enemyAnimation.css';

/**
 * High-performance GPU-procedural Walking Enemy Component.
 *
 * ARCHITECTURAL SPECIFICATION:
 * 1. Zero JS thread overhead: Deformations (squash, stretch, wobble) run entirely in
 *    CSS @keyframes and GPU composited transforms.
 * 2. Vector re-rasterization lock: Rendered exclusively as a single
 *    <img decoding="async" draggable="false" /> with will-change: transform and translateZ(0).
 * 3. Two-layer DOM structure:
 *    - Outer <div>: translates to (x, y) on screen, applies base-scale and flip-x (with 5px deadzone)
 *    - Inner <img>: executes walking cycle anchored at feet (transform-origin: 50% 100%)
 * 4. Phase shift: Randomized negative animation-delay (-0.01s to -1.5s) per enemy instance.
 * 5. Full coverage for ALL 58 folklore enemies + generic archetypes (runner, slime, bug, golem).
 */
const EnemyComponent: React.FC<EnemyProps> = ({
  id,
  x,
  y,
  playerX,
  src: propSrc,
  archetype,
  baseScale: propBaseScale,
  customParams,
  width: propWidth,
  height: propHeight,
  alt,
  className = '',
  style,
  onClick,
  showDebugBadge = false,
}) => {
  // 1. Resolve archetype & enemy configuration (supporting all 58 folklore enemies)
  const enemyKey = String(archetype in ENEMY_ARCHETYPE_MAP ? archetype : (String(id) in ENEMY_ARCHETYPE_MAP ? id : ''));
  const catalogConfig = enemyKey ? getEnemyGpuConfig(enemyKey) : null;

  const resolvedArchetype: EnemyArchetype = catalogConfig
    ? catalogConfig.archetype
    : (archetype in ARCHETYPE_PRESETS ? (archetype as EnemyArchetype) : 'runner');

  const preset = catalogConfig ? catalogConfig.params : ARCHETYPE_PRESETS[resolvedArchetype];

  const effectiveDuration = customParams?.animDuration ?? preset.animDuration;
  const effectiveWobbleAngle = customParams?.wobbleAngle ?? preset.wobbleAngle;
  const effectiveSquashX = customParams?.squashX ?? preset.squashX;
  const effectiveSquashY = customParams?.squashY ?? preset.squashY;

  // Preserve volume: automatically compute stretch if not explicitly provided
  const derivedStretch = computeVolumePreservingStretch(effectiveSquashX, effectiveSquashY);
  const effectiveStretchX = customParams?.stretchX ?? preset.stretchX ?? derivedStretch.stretchX;
  const effectiveStretchY = customParams?.stretchY ?? preset.stretchY ?? derivedStretch.stretchY;

  const effectiveBaseScale = propBaseScale ?? customParams?.baseScale ?? preset.baseScale;
  const width = propWidth ?? preset.width;
  const height = propHeight ?? preset.height;

  // Resolve sprite source: provided prop -> catalog baked URI -> archetype fallback
  const effectiveSrc =
    propSrc ||
    (catalogConfig ? catalogConfig.spriteUrl : null) ||
    BAKED_SPRITES[resolvedArchetype] ||
    BAKED_SPRITES.runner;

  // 2. FlipX facing logic with 5px dead zone to prevent jitter
  // Math.abs(playerX - enemy.x) > 5
  const lastFacingRef = useRef<1 | -1>(playerX >= x ? 1 : -1);
  const dx = playerX - x;
  if (Math.abs(dx) > 5) {
    lastFacingRef.current = dx >= 0 ? 1 : -1;
  }
  const flipX = lastFacingRef.current;

  // 3. Unique phase shift: randomized negative animation-delay locked on mount
  // Stored in ref so it never recalculates or causes desync across re-renders
  const animDelayRef = useRef<string>(
    `${(-0.01 - Math.random() * 1.49).toFixed(3)}s`
  );

  return (
    <div
      className={`gpu-enemy-root ${className}`}
      data-enemy-id={id}
      data-archetype={archetype}
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        // GPU composite positioning & facing orientation:
        transform: `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) scaleX(${flipX}) scale(${effectiveBaseScale})`,
        transformOrigin: '50% 100%',
        // Pass CSS custom variables down to GPU keyframes
        ['--wobble-angle' as any]: effectiveWobbleAngle,
        ['--anim-duration' as any]: effectiveDuration,
        ['--squash-x' as any]: effectiveSquashX,
        ['--squash-y' as any]: effectiveSquashY,
        ['--stretch-x' as any]: effectiveStretchX,
        ['--stretch-y' as any]: effectiveStretchY,
        ['--anim-delay' as any]: animDelayRef.current,
        ['--flip-x' as any]: flipX,
        ['--base-scale' as any]: effectiveBaseScale,
        ...style,
      }}
    >
      {/*
        Inner <img>: Pure GPU walking animation.
        - NEVER inline SVG (bypasses vector re-rasterization)
        - transform-origin: 50% 100% (anchors feet to ground)
        - will-change: transform + backface-visibility: hidden + translateZ(0) (GPU texture baking)
      */}
      <img
        src={effectiveSrc}
        decoding="async"
        draggable={false}
        alt={alt || `${archetype} ${id}`}
        className="gpu-enemy-sprite"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          transformOrigin: '50% 100%',
          animationName: 'enemy-gpu-walk-wobble',
          animationDuration: effectiveDuration,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: animDelayRef.current,
        }}
      />

      {/* Optional developer debug badge showing live archetype and flip */}
      {showDebugBadge && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap px-1 py-0.2 bg-black/75 text-amber-200 text-[9px] font-mono rounded border border-amber-500/40"
          style={{ transform: `scaleX(${flipX})` }}
        >
          {archetype} {flipX > 0 ? '▶' : '◀'}
        </div>
      )}
    </div>
  );
};

/**
 * Wrapped in React.memo for zero redundant Virtual DOM reconciliation.
 */
export const Enemy = React.memo(EnemyComponent);
