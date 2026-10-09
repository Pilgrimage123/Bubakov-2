import type { GameDrop, DropType } from '../types';
import type { EngineState } from './engineState';
import { GINGERBREAD_VALUES, type GingerbreadSize, getGingerbreadSize } from '../data/gingerbread';
import { ENEMY_POINTS } from '../constants';

export const MAX_DROPS_LIMIT = 250;
export const SPECIAL_DROP_PITY_COOLDOWN = 45.0;
export const UNCOLLECTED_GINGERBREAD_PITY_THRESHOLD = 120;
export const HOT_GINGERBREAD_DURATION = 3.0;
export const EMERGENCY_HEALTH_RATIO = 0.25;
export const COMBO_PULSE_KILL_COUNT = 30;
export const COMBO_PULSE_WINDOW_SECONDS = 1.2;
export const COMBO_PULSE_RADIUS = 550;
export const FAR_KILL_DISTANCE = 420;
export const TIME_STOP_DURATION = 4.0;

export interface DropSpawnOptions {
  value?: number;
  radius?: number;
  speed?: number;
  angle?: number;
  vx?: number;
  vy?: number;
  size?: 'small' | 'large' | 'giant' | string;
  isHot?: boolean;
  goldenRushTimer?: number;
  text?: string;
  textColor?: string;
}

/**
 * Creates a drop instance with velocity and scattering.
 */
export function createDropInstance(
  type: DropType,
  x: number,
  y: number,
  opts: DropSpawnOptions = {}
): GameDrop {
  const angle = opts.angle ?? Math.random() * Math.PI * 2;
  const burstSpeed = opts.speed ?? (55 + Math.random() * 85);
  const vx = opts.vx ?? Math.cos(angle) * burstSpeed;
  const vy = opts.vy ?? Math.sin(angle) * burstSpeed;

  let radius = opts.radius;
  if (!radius) {
    if (type === 'chest') radius = 25;
    else if (type === 'horseshoe') radius = 18;
    else if (type === 'rooster') radius = 18;
    else if (type === 'cuckoo_clock') radius = 18;
    else if (type === 'soul') radius = 14;
    else if (type === 'potion') radius = 12;
    else if (type === 'bread' || type === 'pear') radius = 10;
    else if (type === 'chasnik') radius = 26;
    else if (type === 'gingerbread') {
      radius = opts.size === 'giant' ? 19 : opts.size === 'large' ? 14 : 10;
    } else {
      radius = (opts.value && opts.value >= 15 ? 12 : opts.value && opts.value >= 5 ? 10 : 8);
    }
  }

  return {
    type,
    x: x + (opts.vx !== undefined ? 0 : Math.cos(angle) * 8),
    y: y + (opts.vy !== undefined ? 0 : Math.sin(angle) * 8),
    vx,
    vy,
    radius,
    value: opts.value,
    size: opts.size,
    time: Math.random() * 6.28,
    isHot: opts.isHot || false,
    goldenRushTimer: opts.goldenRushTimer || 0,
    dead: false,
  };
}

/**
 * Slévání kořisti (Fúze): Sloučí staré dropy mimo zorné pole kamery do větších kusů,
 * pokud celkový počet překročí MAX_DROPS_LIMIT, aniž by došlo ke ztrátě hodnoty.
 */
export function performDropFusion(
  drops: GameDrop[],
  viewBounds?: { left: number; top: number; right: number; bottom: number },
  maxLimit: number = MAX_DROPS_LIMIT
): number {
  let aliveCount = 0;
  for (let i = 0; i < drops.length; i++) {
    if (!drops[i].dead) aliveCount++;
  }
  if (aliveCount <= maxLimit) return 0;

  const isOffScreen = (d: GameDrop) => {
    if (!viewBounds) return true;
    const pad = 80;
    return (
      d.x < viewBounds.left - pad ||
      d.x > viewBounds.right + pad ||
      d.y < viewBounds.top - pad ||
      d.y > viewBounds.bottom + pad
    );
  };

  let fusedCount = 0;

  // 1. Slévání malých perníčků (3 malé za 2 = 1 velký za 6)
  const smallGingerbreads: GameDrop[] = [];
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d.dead && d.type === 'gingerbread' && (!d.size || d.size === 'small') && !d.isHot && isOffScreen(d)) {
      smallGingerbreads.push(d);
    }
  }

  while (smallGingerbreads.length >= 3 && aliveCount > maxLimit) {
    const d1 = smallGingerbreads.pop()!;
    const d2 = smallGingerbreads.pop()!;
    const d3 = smallGingerbreads.pop()!;
    d1.dead = true;
    d2.dead = true;
    d3.dead = true;
    aliveCount -= 3;
    fusedCount += 2;

    const fused = createDropInstance('gingerbread', d1.x, d1.y, {
      value: GINGERBREAD_VALUES.large,
      size: 'large',
      radius: 14,
      speed: 0,
    });
    drops.push(fused);
    aliveCount++;
  }

  // 2. Slévání velkých perníčků (3-4 velké do obřích)
  const largeGingerbreads: GameDrop[] = [];
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d.dead && d.type === 'gingerbread' && d.size === 'large' && !d.isHot && isOffScreen(d)) {
      largeGingerbreads.push(d);
    }
  }

  while (largeGingerbreads.length >= 3 && aliveCount > maxLimit) {
    const d1 = largeGingerbreads.pop()!;
    const d2 = largeGingerbreads.pop()!;
    const d3 = largeGingerbreads.pop()!;
    d1.dead = true;
    d2.dead = true;
    d3.dead = true;
    aliveCount -= 3;
    fusedCount += 2;

    const fused = createDropInstance('gingerbread', d1.x, d1.y, {
      value: GINGERBREAD_VALUES.giant,
      size: 'giant',
      radius: 19,
      speed: 0,
    });
    drops.push(fused);
    aliveCount++;
  }

  // 3. Slévání drobných krejcarů do zlatých tolarů
  const smallCoins: GameDrop[] = [];
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d.dead && d.type === 'coin' && (d.value || 1) < 5 && isOffScreen(d)) {
      smallCoins.push(d);
    }
  }

  while (smallCoins.length >= 5 && aliveCount > maxLimit) {
    let accumulated = 0;
    let anchorX = 0;
    let anchorY = 0;
    for (let c = 0; c < 5; c++) {
      const coin = smallCoins.pop()!;
      coin.dead = true;
      accumulated += coin.value || 1;
      anchorX = coin.x;
      anchorY = coin.y;
    }
    aliveCount -= 5;
    fusedCount += 4;

    const fusedCoin = createDropInstance('coin', anchorX, anchorY, {
      value: accumulated,
      radius: 12,
      speed: 0,
    });
    drops.push(fusedCoin);
    aliveCount++;
  }

  return fusedCount;
}

/**
 * Magnetická rázová vlna: Přitáhne dropy v okruhu (nebo celou mapu) k lovci.
 */
export function applyMagnetWave(
  drops: GameDrop[],
  targetX: number,
  targetY: number,
  radius: number = COMBO_PULSE_RADIUS,
  fullScreen: boolean = false
): number {
  let pulled = 0;
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.dead || d.type === 'chasnik') continue;
    const dist = Math.hypot(d.x - targetX, d.y - targetY);
    if (fullScreen || dist <= radius) {
      const ang = Math.atan2(targetY - d.y, targetX - d.x);
      const impulseSpeed = fullScreen ? 850 : 620;
      d.vx = Math.cos(ang) * impulseSpeed;
      d.vy = Math.sin(ang) * impulseSpeed;
      pulled++;
    }
  }
  return pulled;
}

/**
 * Záznam zahnání bubáka a vyhodnocení kombo pulzu (30 zahnání za 1.2 s).
 */
export function registerKillAndCheckCombo(
  engineState: EngineState,
  currentTime: number
): boolean {
  if (!engineState.killTimestamps) engineState.killTimestamps = [];
  engineState.killTimestamps.push(currentTime);

  const windowStart = currentTime - COMBO_PULSE_WINDOW_SECONDS;
  // Oříznout staré zásahy
  while (engineState.killTimestamps.length > 0 && engineState.killTimestamps[0] < windowStart) {
    engineState.killTimestamps.shift();
  }

  if (engineState.killTimestamps.length >= COMBO_PULSE_KILL_COUNT) {
    engineState.killTimestamps.length = 0; // Reset komba
    return true;
  }
  return false;
}

/**
 * Spočítá celkovou hodnotu nesebraných perníčků ležících na louce.
 */
export function calculateUncollectedGingerbread(drops: GameDrop[]): number {
  let sum = 0;
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d.dead && d.type === 'gingerbread') {
      sum += (d.value || 1) * (d.isHot ? 2 : 1);
    }
  }
  return sum;
}
