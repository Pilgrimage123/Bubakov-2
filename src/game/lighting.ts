import type { GameEngine } from './engine';
import type { LightSource, LightingEnvironment, DayPhase } from '../types';
import { getCurrentDayPhase } from '../constants';

export const BASE_LANTERN_RADIUS = 170;
export const WATCHMAN_RADIUS_MULTIPLIER = 1.25;
export const BASE_LANTERN_INTENSITY = 0.9;
export const WATCHMAN_LANTERN_INTENSITY = 1.0;
export const LANTERN_COLOR = '#FFE8A3';

export const HROMNICKA_BASE_RADIUS = 135;
export const HROMNICKA_RADIUS_PER_LEVEL = 18;
export const HROMNICKA_COLOR = '#FEF08A';
export const HROMNICKA_INTENSITY = 0.9;

export const BLUDICKA_RADIUS = 75;
export const BLUDICKA_COLOR = '#67E8F9';
export const BLUDICKA_INTENSITY = 0.85;

export const PROJECTILE_LIGHT_RADIUS = 45;
export const PROJECTILE_LIGHT_COLOR = '#F97316';
export const PROJECTILE_LIGHT_INTENSITY = 0.75;

export const RARE_LOOT_LIGHT_RADIUS = 32;
export const RARE_LOOT_LIGHT_COLOR = '#FDE68A';
export const RARE_LOOT_LIGHT_INTENSITY = 0.6;

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
 * Supports both isLightInView(light, viewLeft, viewTop, viewRight, viewBottom)
 * and isLightInView(x, y, radius, viewLeft, viewTop, viewRight, viewBottom).
 */
export function isLightInView(
  light: LightSource,
  viewLeft?: number,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): boolean;
export function isLightInView(
  x: number,
  y: number,
  radius: number,
  viewLeft?: number,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): boolean;
export function isLightInView(
  lightOrX: LightSource | number,
  viewLeftOrY?: number,
  viewTopOrRadius?: number,
  viewRightOrLeft?: number,
  viewBottomOrTop?: number,
  maybeRight?: number,
  maybeBottom?: number
): boolean {
  let x: number;
  let y: number;
  let radius: number;
  let viewLeft: number | undefined;
  let viewTop: number | undefined;
  let viewRight: number | undefined;
  let viewBottom: number | undefined;

  if (typeof lightOrX === 'number') {
    x = lightOrX;
    y = viewLeftOrY ?? 0;
    radius = viewTopOrRadius ?? 0;
    viewLeft = viewRightOrLeft;
    viewTop = viewBottomOrTop;
    viewRight = maybeRight;
    viewBottom = maybeBottom;
  } else {
    x = lightOrX.x;
    y = lightOrX.y;
    radius = lightOrX.radius;
    viewLeft = viewLeftOrY;
    viewTop = viewTopOrRadius;
    viewRight = viewRightOrLeft;
    viewBottom = viewBottomOrTop;
  }

  if (viewLeft !== undefined && x + radius < viewLeft) return false;
  if (viewRight !== undefined && x - radius > viewRight) return false;
  if (viewTop !== undefined && y + radius < viewTop) return false;
  if (viewBottom !== undefined && y - radius > viewBottom) return false;
  return true;
}

/**
 * Deterministically computes active dynamic light sources from the game simulation state.
 * Includes player lantern (with character scaling and sinusoidal flame flicker),
 * holy candle weapon (Hromnička), will-o'-the-wisp enemies (Bludičky),
 * fiery projectiles, and rare loot glows, and applies spatial view-frustum culling.
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
  const time = engine.state?.gameTime ?? 0;

  if (player) {
    const isWatchman = player.type === 'watchman';
    const baseRadius = isWatchman
      ? BASE_LANTERN_RADIUS * WATCHMAN_RADIUS_MULTIPLIER
      : BASE_LANTERN_RADIUS;
    const intensity = isWatchman ? WATCHMAN_LANTERN_INTENSITY : BASE_LANTERN_INTENSITY;

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

    // Hromnička (Holy candle weapon): secondary holy flame aura
    if (player.weapons && Array.isArray(player.weapons)) {
      const hromnicka = player.weapons.find((w: any) => w.id === 'hromnicka');
      if (hromnicka) {
        const level = hromnicka.level || 1;
        const candleBaseRadius = HROMNICKA_BASE_RADIUS + level * HROMNICKA_RADIUS_PER_LEVEL;
        const candlePulse = Math.sin(time * 4) * 6;
        const candleRadius = Math.max(0, candleBaseRadius + candlePulse);

        sources.push({
          id: 'holy_candle',
          x: player.x,
          y: player.y,
          radius: candleRadius,
          color: HROMNICKA_COLOR,
          intensity: HROMNICKA_INTENSITY,
          flickerSpeed: 4,
          flickerAmount: 6,
          pulseAmount: 6,
          kind: 'holy_candle',
        });
      }
    }
  }

  // Bludička (Will-o'-the-wisp enemy): spectral cyan light
  const enemies = (engine as any).enemies ?? engine.state?.enemies ?? engine.livingEnemies ?? [];
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy || enemy.dead || enemy.isDefeated || (enemy.hp !== undefined && enemy.hp <= 0)) {
      continue;
    }

    const isBludicka =
      enemy.type === 'bludicka' ||
      enemy.id === 'bludicka' ||
      (typeof enemy.type === 'string' && enemy.type.includes('bludicka')) ||
      (typeof enemy.id === 'string' && enemy.id.includes('bludicka'));

    if (isBludicka) {
      const wobble = Math.sin(time * 6) * 4;
      const radius = Math.max(0, BLUDICKA_RADIUS + wobble);
      sources.push({
        id: enemy.id ? `wisp_${enemy.id}` : `wisp_${i}`,
        x: enemy.x,
        y: enemy.y,
        radius,
        color: BLUDICKA_COLOR,
        intensity: BLUDICKA_INTENSITY,
        flickerSpeed: 6,
        flickerAmount: 4,
        pulseAmount: 4,
        kind: 'will_o_wisp',
      });
    }
  }

  // Illuminated / Flaming Projectiles
  const projectiles = (engine as any).projectiles ?? engine.state?.projectiles ?? [];
  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    if (!p || p.dead) continue;

    if (
      p.visual === 'hell_spark' ||
      p.visual === 'dragon_fireball' ||
      p.visual === 'boulder' ||
      p.weaponId === 'horky_brambor'
    ) {
      sources.push({
        id: p.id ? `projectile_${p.id}` : `projectile_${i}`,
        x: p.x,
        y: p.y,
        radius: PROJECTILE_LIGHT_RADIUS,
        color: PROJECTILE_LIGHT_COLOR,
        intensity: PROJECTILE_LIGHT_INTENSITY,
        kind: 'projectile',
      });
    }
  }

  // Loot Glow for Rare Drops
  const drops = (engine as any).drops ?? engine.state?.drops ?? [];
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d || d.dead || d.collected) continue;

    const isRareDrop =
      d.type === 'chest' ||
      d.type === 'horseshoe' ||
      d.type === 'rooster' ||
      (d.type === 'gingerbread' && d.size === 'giant');

    if (isRareDrop) {
      sources.push({
        id: d.id ? `loot_${d.id}` : `loot_${i}`,
        x: d.x,
        y: d.y,
        radius: RARE_LOOT_LIGHT_RADIUS,
        color: RARE_LOOT_LIGHT_COLOR,
        intensity: RARE_LOOT_LIGHT_INTENSITY,
        kind: 'loot',
      });
    }
  }

  if (
    viewLeft !== undefined ||
    viewTop !== undefined ||
    viewRight !== undefined ||
    viewBottom !== undefined
  ) {
    return sources.filter((light) =>
      isLightInView(light.x, light.y, light.radius, viewLeft, viewTop, viewRight, viewBottom)
    );
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
