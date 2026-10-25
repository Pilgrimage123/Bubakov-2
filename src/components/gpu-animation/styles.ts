/**
 * Embedded CSS styles for the procedural GPU walk animation.
 * Can be rendered directly via <style>{ENEMY_ANIMATION_CSS}</style>
 * or imported from enemyAnimation.css.
 */
export const ENEMY_ANIMATION_CSS = `
@keyframes enemy-gpu-walk-wobble {
  0%, 100% {
    transform: translateZ(0) rotate(calc(var(--wobble-angle, 10deg) * -1)) scale(var(--stretch-x, 0.92), var(--stretch-y, 1.09));
  }
  25%, 75% {
    transform: translateZ(0) rotate(0deg) scale(var(--squash-x, 1.15), var(--squash-y, 0.86));
  }
  50% {
    transform: translateZ(0) rotate(var(--wobble-angle, 10deg)) scale(var(--stretch-x, 0.92), var(--stretch-y, 1.09));
  }
}

.gpu-enemy-root {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--enemy-width, 60px);
  height: var(--enemy-height, 60px);
  transform: translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px), 0)
             scaleX(var(--flip-x, 1))
             scale(var(--base-scale, 1));
  transform-origin: 50% 100%;
  pointer-events: auto;
  user-select: none;
  contain: layout style;
}

.gpu-enemy-sprite {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  transform-origin: 50% 100%;
  animation-name: enemy-gpu-walk-wobble;
  animation-duration: var(--anim-duration, 0.52s);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-delay: var(--anim-delay, 0s);
}
`;
