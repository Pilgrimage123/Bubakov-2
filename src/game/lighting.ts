import type { GameEngine } from './engine';
import type { LightSource, LightingEnvironment, DayPhase } from '../types';
import { getCurrentDayPhase } from '../constants';

export const BASE_LANTERN_RADIUS = 170;
export const WATCHMAN_RADIUS_MULTIPLIER = 1.25;
export const BASE_LANTERN_INTENSITY = 0.9;
export const WATCHMAN_LANTERN_INTENSITY = 1.0;
export const LANTERN_COLOR = '#FFE8A3';

/**
 * Ambient darkness values for each DayPhase:
 * - noon (Poledne): 0.0 (full daylight)
 * - afternoon (Odpoledne): 0.1 (early shadows)
 * - dusk (Klekání): 0.35 (twilight)
 * - night (Hluboká noc): 0.65 (heavy darkness)
 * - midnight (Půlnoční hodina): 0.85 (peak witching hour)
 * - dawn (Kuropění & Svítání): 0.0 (morning clear)
 */
export const PHASE_AMBIENT_DARKNESS: Record<string, number> = {
  noon: 0.0,
  afternoon: 0.1,
  dusk: 0.35,
  night: 0.65,
  midnight: 0.85,
  dawn: 0.0,
};

/**
 * Returns the ambient darkness level (0.0 = bright daylight, 0.85 = peak folk midnight).
 * Accepts either gameTime in seconds, a DayPhase object, or a phase ID string.
 */
export function getAmbientDarkness(gameTimeOrPhase: number | DayPhase | string): number {
  if (typeof gameTimeOrPhase === 'number') {
    const phase = getCurrentDayPhase(gameTimeOrPhase);
    return PHASE_AMBIENT_DARKNESS[phase.id] ?? 0.0;
  }
  if (typeof gameTimeOrPhase === 'string') {
    return PHASE_AMBIENT_DARKNESS[gameTimeOrPhase] ?? 0.0;
  }
  if (gameTimeOrPhase && typeof gameTimeOrPhase === 'object' && 'id' in gameTimeOrPhase) {
    return PHASE_AMBIENT_DARKNESS[gameTimeOrPhase.id] ?? 0.0;
  }
  return 0.0;
}

/**
 * Tests whether a light source's circular bounding radius intersects with a given 2D view rectangle.
 */
export function isLightInView(
  light: LightSource,
  viewLeft?: number,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): boolean {
  if (viewLeft !== undefined && light.x + light.radius < viewLeft) return false;
  if (viewRight !== undefined && light.x - light.radius > viewRight) return false;
  if (viewTop !== undefined && light.y + light.radius < viewTop) return false;
  if (viewBottom !== undefined && light.y - light.radius > viewBottom) return false;
  return true;
}

/**
 * Deterministically computes active dynamic light sources from the game simulation state.
 * Includes player lantern (with character scaling and sinusoidal flame flicker) and applies
 * optional spatial view-frustum culling.
 */
export function computeLightSources(
  engine: GameEngine,
  viewLeft?: number,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): LightSource[] {
  const sources: LightSource[] = [];
  const player = engine.state?.player;

  if (player) {
    const isWatchman = player.type === 'watchman';
    const baseRadius = isWatchman
      ? BASE_LANTERN_RADIUS * WATCHMAN_RADIUS_MULTIPLIER
      : BASE_LANTERN_RADIUS;
    const intensity = isWatchman ? WATCHMAN_LANTERN_INTENSITY : BASE_LANTERN_INTENSITY;

    const time = engine.state?.gameTime ?? 0;
    const flicker = Math.sin(time * 5) * 6;
    const radius = Math.max(0, baseRadius + flicker);

    sources.push({
      id: 'player_lantern',
      x: player.x,
      y: player.y,
      radius,
      color: LANTERN_COLOR,
      intensity,
      flickerSpeed: 5,
      flickerAmount: 6,
      pulseAmount: 6,
      kind: 'player_lantern',
    });
  }

  if (
    viewLeft !== undefined ||
    viewTop !== undefined ||
    viewRight !== undefined ||
    viewBottom !== undefined
  ) {
    return sources.filter((light) => isLightInView(light, viewLeft, viewTop, viewRight, viewBottom));
  }

  return sources;
}

/**
 * Computes the complete dynamic lighting environment (ambient darkness + visible light sources).
 */
export function computeLightingEnvironment(
  engine: GameEngine,
  viewLeft?: number,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): LightingEnvironment {
  const gameTime = engine.state?.gameTime ?? 0;
  return {
    ambientDarkness: getAmbientDarkness(gameTime),
    sources: computeLightSources(engine, viewLeft, viewTop, viewRight, viewBottom),
  };
}
