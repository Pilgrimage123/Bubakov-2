import type { GameDrop, DropType } from '../types';
import type { EngineState } from './engineState';
import { GINGERBREAD_VALUES, type GingerbreadSize, getGingerbreadSize } from '../data/gingerbread';
import { ENEMY_POINTS } from '../constants';
import {
  SoADropManager,
  DropBank,
  MAX_ACTIVE_DROPS,
  HEAVY_ANCHOR_MAGNET_MOBILITY,
  STANDARD_MAGNET_MOBILITY,
  POUCH_SWEEP_RADIUS,
  CONSOLIDATION_BONUS,
} from './soaDropManager';
import {
  computeVulnerabilityScore,
  getDropPacingPhase,
  selectWeightedDropType,
  CampingDetector,
  sampleAnnulusPosition,
} from './directorDrops';

export {
  SoADropManager,
  DropBank,
  MAX_ACTIVE_DROPS,
  HEAVY_ANCHOR_MAGNET_MOBILITY,
  STANDARD_MAGNET_MOBILITY,
  POUCH_SWEEP_RADIUS,
  CONSOLIDATION_BONUS,
  computeVulnerabilityScore,
  getDropPacingPhase,
  selectWeightedDropType,
  CampingDetector,
  sampleAnnulusPosition,
};

export const MAX_DROPS_LIMIT = 40;
export const SPECIAL_DROP_PITY_COOLDOWN = 45.0;
export const UNCOLLECTED_GINGERBREAD_PITY_THRESHOLD = 120;
export const HOT_GINGERBREAD_DURATION = 3.0;
export const EMERGENCY_HEALTH_RATIO = 0.25;
export const COMBO_PULSE_KILL_COUNT = 30;
export const COMBO_PULSE_WINDOW_SECONDS = 1.2;
export const COMBO_PULSE_RADIUS = 550;
export const FAR_KILL_DISTANCE = 420;

/** Healing drops stay on the map until the player can benefit from them. */
export function isHealingDrop(type: DropType): boolean {
  return type === 'potion' || type === 'bread' || type === 'pear';
}

export function canCollectDrop(type: DropType, currentHp: number, maxHp: number): boolean {
  return !isHealingDrop(type) || currentHp < maxHp;
}

export interface DynamicDropResolution {
  type: DropType;
  value?: number;
  size?: 'small' | 'large' | 'giant' | string;
  speed?: number;
  text?: string;
  textColor?: string;
  radius?: number;
  isHot?: boolean;
  expiration?: number;
  isMercyDrop?: boolean;
}

/**
 * Dynamický drop systém: Pokud má lovec plnou Kuráž (nebo téměř plnou >= 95%),
 * šance na padnutí léčivých předmětů se dramaticky sníží (o 85-90%)
 * a místo nich padají užitečnější předměty: krejcary, perníčky, dušičky nebo podkovy.
 */
export function resolveDynamicDrop(
  intendedType: DropType,
  currentHp: number,
  maxHp: number,
  opts: {
    isBoss?: boolean;
    isMiniboss?: boolean;
    category?: string;
    text?: string;
    textColor?: string;
    value?: number;
    speed?: number;
    size?: string;
    radius?: number;
    forceDivert?: boolean;
    isHot?: boolean;
    vulnerabilityScore?: number;
    pacingPhase?: 'stress' | 'flow' | 'mercy';
    mercyCooldownActive?: boolean;
  } = {}
): DynamicDropResolution {
  // When AI Director's Vulnerability Score V is supplied, modulate drops
  if (typeof opts.vulnerabilityScore === 'number') {
    const v = opts.vulnerabilityScore;
    const phase = opts.pacingPhase ?? getDropPacingPhase(v);
    const isHealing = isHealingDrop(intendedType);

    if (isHealing) {
      if (phase === 'stress' || currentHp >= maxHp * 0.95) {
        // Stress phase: suppress healing by 80% (or 88% if full courage)
        const suppressRate = currentHp >= maxHp * 0.95 ? 0.88 : 0.80;
        if (Math.random() < suppressRate && !opts.forceDivert) {
          const isVolatile = Math.random() < 0.50;
          return {
            type: 'gingerbread',
            value: opts.value ?? GINGERBREAD_VALUES.large,
            size: 'large',
            isHot: isVolatile,
            expiration: isVolatile ? 4.0 + Math.random() * 2.0 : undefined,
            speed: opts.speed,
            text: isVolatile ? 'Horký perník! 🔥' : '+6 Perníček!',
            textColor: isVolatile ? '#EF4444' : '#B45309',
          };
        }
      } else if (phase === 'mercy') {
        return {
          type: intendedType,
          value: opts.value,
          size: opts.size,
          speed: opts.speed,
          radius: opts.radius,
          isMercyDrop: true,
          text: opts.text,
          textColor: opts.textColor,
        };
      }
    } else if (intendedType === 'gingerbread' && phase === 'stress' && !opts.isHot) {
      // 50% chance volatile offensive buff inside stress clusters
      if (Math.random() < 0.50) {
        return {
          type: 'gingerbread',
          value: opts.value,
          size: opts.size,
          speed: opts.speed,
          radius: opts.radius,
          isHot: true,
          expiration: 4.0 + Math.random() * 2.0,
          text: 'Horký perník! 🔥',
          textColor: '#EF4444',
        };
      }
    }
  }

  const isFullCourage = currentHp >= maxHp * 0.95;
  const isHealing = isHealingDrop(intendedType);

  if (!isHealing || !isFullCourage) {
    return {
      type: intendedType,
      value: opts.value,
      size: opts.size,
      speed: opts.speed,
      radius: opts.radius,
      text: opts.text,
      textColor: opts.textColor,
    };
  }

  // Lovec má plnou Kuráž! 88% šance vyměnit zbytečné léčení za cennější kořist.
  const roll = Math.random();
  if (roll < 0.12 && !opts.forceDivert) {
    // 12% šance ponechat léčení na zemi pro budoucí nouzi
    return {
      type: intendedType,
      value: opts.value,
      size: opts.size,
      speed: opts.speed,
      radius: opts.radius,
      text: opts.text,
      textColor: opts.textColor,
    };
  }

  if (opts.isBoss || opts.isMiniboss) {
    if (roll < 0.48) {
      return {
        type: 'coin',
        value: 30,
        speed: opts.speed ?? 85,
        text: 'Zlatý tolar! +30 kr. 🪙',
        textColor: '#F59E0B',
      };
    } else if (roll < 0.82) {
      return {
        type: 'gingerbread',
        value: GINGERBREAD_VALUES.giant,
        size: 'giant',
        radius: 19,
        speed: opts.speed ?? 80,
        text: '+20 Obří perník!',
        textColor: '#F59E0B',
      };
    } else {
      return {
        type: 'soul',
        radius: 14,
        speed: opts.speed ?? 95,
        text: 'Vděčná dušička! 🕊️',
        textColor: '#38BDF8',
      };
    }
  }

  if (roll < 0.52) {
    const coinVal = roll < 0.22 ? 10 : 5;
    return {
      type: 'coin',
      value: coinVal,
      speed: opts.speed ?? 70,
      text: `+${coinVal} kr. do měšce! 🪙`,
      textColor: '#FCD34D',
    };
  } else if (roll < 0.82) {
    return {
      type: 'gingerbread',
      value: GINGERBREAD_VALUES.large,
      size: 'large',
      radius: 14,
      speed: opts.speed ?? 65,
      text: '+6 Perníček!',
      textColor: '#B45309',
    };
  } else if (roll < 0.94) {
    return {
      type: 'soul',
      radius: 14,
      speed: opts.speed ?? 80,
      text: 'Zbloudilá dušička! 🕊️',
      textColor: '#38BDF8',
    };
  } else {
    const rareType: DropType = Math.random() < 0.5 ? 'horseshoe' : 'cuckoo_clock';
    return {
      type: rareType,
      radius: 18,
      speed: opts.speed ?? 75,
      text: rareType === 'horseshoe' ? 'Kovářská podkova! 🧲' : 'Vyřezávané kukačky! ⏰',
      textColor: '#EAB308',
    };
  }
}

export const RARE_BATTLE_ITEMS: DropType[] = [
  'ponocny_horn',
  'masopust_rattle',
  'babicka_apron',
  'slivovice_splash',
  'svanda_bagpipes',
  'kominik_button',
];

export interface RareDropTracker {
  rareDropsSpawned: number;
  targetRareDrops: number; // 2 to 4 per run
  lastRareDropTime: number;
  scheduledWindows: number[];
}

export function createRareDropTracker(targetDrops?: number): RareDropTracker {
  const target = targetDrops ?? (2 + Math.floor(Math.random() * 3)); // 2, 3, or 4 per run
  const clamped = Math.min(4, Math.max(2, target));
  const windows = clamped === 2
    ? [140, 380]
    : clamped === 3
    ? [110, 290, 480]
    : [95, 240, 410, 600];

  return {
    rareDropsSpawned: 0,
    targetRareDrops: clamped,
    lastRareDropTime: -999,
    scheduledWindows: windows,
  };
}

export function canSpawnRareBattleDrop(
  tracker: RareDropTracker,
  gameTime: number,
  isEliteOrBoss = false
): boolean {
  if (tracker.rareDropsSpawned >= tracker.targetRareDrops) return false;
  if (gameTime - tracker.lastRareDropTime < 60) return false;
  const nextWindow = tracker.scheduledWindows[tracker.rareDropsSpawned] ?? 120;
  if (gameTime >= nextWindow) return true;
  if (isEliteOrBoss && gameTime >= nextWindow * 0.75) return true;
  return false;
}

export function rollRareBattleDrop(tracker: RareDropTracker, gameTime: number): DropType {
  tracker.rareDropsSpawned++;
  tracker.lastRareDropTime = gameTime;
  const available = [...RARE_BATTLE_ITEMS];
  return available[Math.floor(Math.random() * available.length)];
}

export function getRareDropAnnouncement(type: DropType): { text: string; textColor: string } {
  switch (type) {
    case 'ponocny_horn':
      return { text: 'Trouba ponocného! 📯❄️', textColor: '#38BDF8' };
    case 'masopust_rattle':
      return { text: 'Masopustní řehtačka! 🪇💥', textColor: '#EF4444' };
    case 'babicka_apron':
      return { text: 'Babiččina zástěra! 🧺✨', textColor: '#60A5FA' };
    case 'slivovice_splash':
      return { text: 'Hlt slivovice! 🏺🔥', textColor: '#A855F7' };
    case 'svanda_bagpipes':
      return { text: 'Dudácká skočná! 🎶😈', textColor: '#F59E0B' };
    case 'kominik_button':
      return { text: 'Kominický knoflík! 🔘🎩', textColor: '#FDE047' };
    case 'horseshoe':
      return { text: 'Kovářská podkova! 🧲', textColor: '#EAB308' };
    case 'rooster':
      return { text: 'Hliněný kohoutek! 🐓☀️', textColor: '#F59E0B' };
    case 'cuckoo_clock':
      return { text: 'Vyřezávané kukačky! ⏰', textColor: '#EAB308' };
    case 'arcivzacny_ananas':
      return { text: 'Arcivzácný ananas! 🍍👑', textColor: '#FDE047' };
    default:
      return { text: 'Vzácný poklad! ✨', textColor: '#F59E0B' };
  }
}

export interface FolkloreDropTracker {
  lastFolkloreDropTime: number;
  uncollectedAccumulationTimer: number;
}

export function createFolkloreDropTracker(): FolkloreDropTracker {
  return {
    lastFolkloreDropTime: -999,
    uncollectedAccumulationTimer: 0,
  };
}

/**
 * ADR 0006: Folklórní mocné předměty s Pity Timerem (45 s cooldown):
 * - Kovářská podkova: Magnet přitahující veškeré perníčky a kořist (garantovaný drop při nahromadění > 120 perníčků po 20 s)
 * - Hliněný kohoutek: Board clear a poškození bossů
 * - Vyřezávané kukačky: Zastavení času na 4 s
 */
export function evaluateFolkloreDrop(
  tracker: FolkloreDropTracker,
  drops: GameDrop[],
  gameTime: number,
  dt: number,
  isEliteOrBoss: boolean
): DropType | null {
  const uncollected = calculateUncollectedGingerbread(drops);
  if (uncollected >= UNCOLLECTED_GINGERBREAD_PITY_THRESHOLD) {
    tracker.uncollectedAccumulationTimer += dt;
  } else {
    tracker.uncollectedAccumulationTimer = Math.max(0, tracker.uncollectedAccumulationTimer - dt * 0.5);
  }

  // Cooldown between folklore drops (45 s)
  if (gameTime - tracker.lastFolkloreDropTime < SPECIAL_DROP_PITY_COOLDOWN) {
    return null;
  }

  // Guaranteed horseshoe when > 120 gingerbread has accumulated on meadow for > 20s
  if (tracker.uncollectedAccumulationTimer >= 20.0) {
    tracker.uncollectedAccumulationTimer = 0;
    tracker.lastFolkloreDropTime = gameTime;
    return 'horseshoe';
  }

  // Elite or boss defeat can trigger a folklore drop
  if (isEliteOrBoss) {
    tracker.lastFolkloreDropTime = gameTime;
    const roll = Math.random();
    if (roll < 0.40) return 'horseshoe';
    if (roll < 0.70) return 'cuckoo_clock';
    return 'rooster';
  }

  return null;
}

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
  magnetMobility?: number;
  expiration?: number;
  isHeavyAnchor?: boolean;
  isMercyDrop?: boolean;
  skipConsolidation?: boolean;
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
  opts: DropSpawnOptions = {},
  target?: GameDrop
): GameDrop {
  const angle = opts.angle ?? Math.random() * Math.PI * 2;
  const burstSpeed = opts.speed ?? (55 + Math.random() * 85);
  const vx = opts.vx ?? Math.cos(angle) * burstSpeed;
  const vy = opts.vy ?? Math.sin(angle) * burstSpeed;

  let radius = opts.radius;
  if (!radius) {
    if (type === 'big_pouch' || type === 'gingerbread_stash') radius = 28;
    else if (type === 'chest') radius = 25;
    else if (type === 'arcivzacny_ananas') radius = 22;
    else if (
      type === 'ponocny_horn' ||
      type === 'masopust_rattle' ||
      type === 'babicka_apron' ||
      type === 'slivovice_splash' ||
      type === 'svanda_bagpipes' ||
      type === 'kominik_button'
    ) radius = 20;
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

  const drop = target || ({} as GameDrop);
  drop.type = type;
  drop.x = x + (opts.vx !== undefined ? 0 : Math.cos(angle) * 8);
  drop.y = y + (opts.vy !== undefined ? 0 : Math.sin(angle) * 8);
  drop.vx = vx;
  drop.vy = vy;
  drop.radius = radius;
  drop.value = opts.value;
  drop.size = opts.size;
  drop.time = Math.random() * 6.28;
  drop.isHot = opts.isHot || false;
  drop.goldenRushTimer = opts.goldenRushTimer || 0;
  drop.dead = false;
  drop.magnetMobility = opts.magnetMobility !== undefined
    ? opts.magnetMobility
    : (opts.isHeavyAnchor || type === 'big_pouch' || type === 'gingerbread_stash' || type === 'chest' ? HEAVY_ANCHOR_MAGNET_MOBILITY : 1.0);
  drop.expiration = opts.expiration;
  drop.isHeavyAnchor = opts.isHeavyAnchor || type === 'big_pouch' || type === 'gingerbread_stash';
  drop.isMercyDrop = opts.isMercyDrop;
  return drop;
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
    // Fusion must preserve the value of the drops it replaces.
    const accumulatedValue = (d1.value ?? GINGERBREAD_VALUES.large) + (d2.value ?? GINGERBREAD_VALUES.large) + (d3.value ?? GINGERBREAD_VALUES.large);
    d1.dead = true;
    d2.dead = true;
    d3.dead = true;
    aliveCount -= 3;
    fusedCount += 2;

    const fused = createDropInstance('gingerbread', d1.x, d1.y, {
      value: accumulatedValue,
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
      const mobility = d.magnetMobility !== undefined
        ? d.magnetMobility
        : (d.isHeavyAnchor || d.type === 'big_pouch' || d.type === 'gingerbread_stash' || d.type === 'chest' ? HEAVY_ANCHOR_MAGNET_MOBILITY : 1.0);
      const effectiveSpeed = impulseSpeed * mobility;
      d.vx = Math.cos(ang) * effectiveSpeed;
      d.vy = Math.sin(ang) * effectiveSpeed;
      pulled++;
    }
  }
  return pulled;
}

/**
 * Stržení kořisti Formanským bičem:
 * Přitáhne všechny krejcary (coin) a perníčky (gingerbread) ležící v dráze švihu přímo k hráči.
 */
export function pullWhipLoot(
  drops: GameDrop[],
  originX: number,
  originY: number,
  angle: number,
  reach: number,
  width: number = 75
): number {
  let pulled = 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (d.dead || (d.type !== 'coin' && d.type !== 'gingerbread' && d.type !== 'big_pouch' && d.type !== 'gingerbread_stash' && d.type !== 'chest')) continue;
    const dx = d.x - originX;
    const dy = d.y - originY;
    const projAlong = dx * cos + dy * sin;
    if (projAlong < -10 || projAlong > reach + 35) continue;
    const perpDist = Math.abs(-dx * sin + dy * cos);
    if (perpDist <= width) {
      const distToPlayer = Math.hypot(dx, dy);
      const angToPlayer = Math.atan2(originY - d.y, originX - d.x);
      const impulseSpeed = Math.max(680, Math.min(960, distToPlayer * 4.5));
      const mobility = d.magnetMobility !== undefined
        ? d.magnetMobility
        : (d.isHeavyAnchor || d.type === 'big_pouch' || d.type === 'gingerbread_stash' || d.type === 'chest' ? HEAVY_ANCHOR_MAGNET_MOBILITY : 1.0);
      const effectiveSpeed = impulseSpeed * mobility;
      d.vx = Math.cos(angToPlayer) * effectiveSpeed;
      d.vy = Math.sin(angToPlayer) * effectiveSpeed;
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

export function applyRareItemEffect(
  engineState: any,
  player: any,
  type: DropType,
  callbacks?: {
    onSound?: (name: string) => void;
    onDamageText?: (opts: { x: number; y: number; text: string; color?: string }) => void;
  }
): void {
  if (!player) return;

  if (type === 'ponocny_horn') {
    callbacks?.onSound?.('ponocnyHorn');
    engineState.timeStopTimer = 5.0;
    engineState.ponocnyFrostTimer = 5.0;
    engineState.activeRareOverlay = {
      type: 'ponocny_horn',
      timer: 3.5,
      title: 'TROUBA OBECNÍHO PONOCNÉHO',
      subtitle: '„Chval každý duch Hospodina!“',
    };
    if (engineState.particles) {
      for (let i = 0; i < 28; i++) {
        const ang = (i / 28) * Math.PI * 2;
        engineState.particles.push({
          x: player.x + Math.cos(ang) * 45,
          y: player.y + Math.sin(ang) * 45,
          vx: Math.cos(ang) * 220,
          vy: Math.sin(ang) * 220,
          life: 1.2,
          color: i % 2 === 0 ? '#E0F2FE' : '#38BDF8',
          size: 4,
        });
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 70,
      text: '„CHVAL KAŽDÝ DUCH HOSPODINA!“ 📯❄️',
      color: '#38BDF8',
    });
  } else if (type === 'masopust_rattle') {
    callbacks?.onSound?.('masopustRattle');
    engineState.cameraTremorTimer = 0.8;
    engineState.masopustShockwaveTimer = 2.0;

    if (engineState.enemies) {
      const confettiColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#EAB308', '#78350F'];
      for (let i = 0; i < engineState.enemies.length; i++) {
        const foe = engineState.enemies[i];
        if (foe.isDefeated || foe.dead) continue;
        const isEliteOrBoss = foe.isBoss || foe.isMiniboss || (foe.maxHp && foe.maxHp >= 650);
        if (isEliteOrBoss) {
          const dmg = Math.max(1, Math.round((foe.maxHp || 100) * 0.35));
          foe.takeDamage(dmg, 'physical');
          const ang = Math.atan2(foe.y - player.y, foe.x - player.x) || (Math.random() * Math.PI * 2);
          foe.x += Math.cos(ang) * 1600;
          foe.y += Math.sin(ang) * 1600;
        } else {
          foe.takeDamage(foe.hp || 9999, 'physical');
          if (engineState.particles) {
            for (let p = 0; p < 8; p++) {
              const pAng = Math.random() * Math.PI * 2;
              const spd = 60 + Math.random() * 120;
              engineState.particles.push({
                x: foe.x,
                y: foe.y,
                vx: Math.cos(pAng) * spd,
                vy: Math.sin(pAng) * spd,
                life: 0.65,
                color: confettiColors[p % confettiColors.length],
                size: p % 3 === 0 ? 4 : 2.5,
              });
            }
          }
        }
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 70,
      text: 'MASOPUSTNÍ ŘEHTAČKA! 🪇💥',
      color: '#EF4444',
    });
  } else if (type === 'babicka_apron') {
    callbacks?.onSound?.('grandmothersApron');
    applyMagnetWave(engineState.drops, player.x, player.y, 99999, true);
    player.hp = Math.min(player.maxHp, (player.hp || 0) + 15);
    if (engineState.particles) {
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 180;
        engineState.particles.push({
          x: player.x + Math.cos(ang) * dist,
          y: player.y + Math.sin(ang) * dist,
          vx: -Math.cos(ang) * 280,
          vy: -Math.sin(ang) * 280,
          life: 0.75,
          color: i % 2 === 0 ? '#60A5FA' : '#DBEAFE',
          size: 3.5,
        });
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 65,
      text: 'BABIČČINA KROPENATÁ ZÁSTĚRA! 🧺✨',
      color: '#60A5FA',
    });
  } else if (type === 'slivovice_splash') {
    callbacks?.onSound?.('slivoviceSplash');
    player.slowTimer = 0;
    player.waterSoakedTimer = 0;
    player.burnTimer = 0;
    player.fissureBurnTimer = 0;
    player.hexTimer = 0;

    const facingAngle = typeof player.facingAngle === 'number'
      ? player.facingAngle
      : ((player.facingDir && player.facingDir < 0) ? Math.PI : 0);

    if (engineState.enemies) {
      for (let i = 0; i < engineState.enemies.length; i++) {
        const foe = engineState.enemies[i];
        if (foe.isDefeated || foe.dead) continue;
        const dx = foe.x - player.x;
        const dy = foe.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 260) {
          const angleToFoe = Math.atan2(dy, dx);
          let angleDiff = Math.abs(angleToFoe - facingAngle);
          while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
          if (angleDiff <= (Math.PI / 2) + 0.1) {
            foe.stunTimer = Math.max(foe.stunTimer || 0, 4.5);
            foe.drunkenStaggerTimer = 4.5;
            const pushX = (dx / (dist || 1)) * 180;
            const pushY = (dy / (dist || 1)) * 180;
            foe.x += pushX;
            foe.y += pushY;
          }
        }
      }
    }

    engineState.slivoviceVapor = {
      x: player.x,
      y: player.y,
      dirAngle: facingAngle,
      life: 4.0,
    };

    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 65,
      text: '„A JE TO DOMA!“ 🏺🔥 (Omráčení na 4,5 s & Modrý plamen)',
      color: '#A855F7',
    });
  } else if (type === 'svanda_bagpipes') {
    callbacks?.onSound?.('svandaBagpipes');
    if (engineState.enemies) {
      for (let i = 0; i < engineState.enemies.length; i++) {
        const foe = engineState.enemies[i];
        if (!foe.isDefeated && !foe.dead) {
          foe.brawlTimer = 6.0;
        }
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 70,
      text: 'DUDÁCKÁ ČERTOVSKÁ SKOČNÁ! 🎶😈 (Rvačka na 6 s & 2x perníčky)',
      color: '#F59E0B',
    });
  } else if (type === 'kominik_button') {
    callbacks?.onSound?.('kominikButton');
    player.intangibleTimer = 7.0;
    player.guaranteedCritTimer = 7.0;
    engineState.activeRareOverlay = {
      type: 'kominik_button',
      timer: 3.5,
      title: 'KOMINICKÝ KNOFLÍK PRO ŠTĚSTÍ',
      subtitle: '„Štěstí v kapse, saze v očích!“',
    };
    if (engineState.particles) {
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 85;
        engineState.particles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1.0,
          color: '#1C1917',
          size: 4,
        });
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 70,
      text: 'KOMINICKÝ KNOFLÍK! 🔘🎩 (Nehmotnost & Kritické zásahy na 7 s)',
      color: '#FDE047',
    });
  } else if (type === 'horseshoe') {
    callbacks?.onSound?.('horseshoe');
    applyMagnetWave(engineState.drops, player.x, player.y, 99999, true);
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 65,
      text: 'KOVÁŘSKÁ PODKOVA! 🧲 (Přitažení celé louky)',
      color: '#EAB308',
    });
  } else if (type === 'rooster') {
    callbacks?.onSound?.('rooster');
    engineState.screenFlashTimer = 0.45;
    engineState.screenFlashColor = '#FFFFFF';
    if (engineState.enemies) {
      for (let k = 0; k < engineState.enemies.length; k++) {
        const foe = engineState.enemies[k];
        if (!foe.isDefeated && !foe.dead) {
          if (foe.isBoss || foe.isMiniboss) {
            foe.takeDamage(650, 'holy');
          } else {
            foe.takeDamage(foe.hp || 50, 'holy');
          }
          foe.panicked = true;
          foe.panicTimer = 3.0;
        }
      }
    }
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 65,
      text: 'HLINĚNÝ KOHOUTEK! 🐓☀️ (Ranní rozbřesk & Posvátná záře)',
      color: '#F59E0B',
    });
  } else if (type === 'cuckoo_clock') {
    callbacks?.onSound?.('cuckooClock');
    engineState.timeStopTimer = 4.0;
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 65,
      text: 'VYŘEZÁVANÉ KUKAČKY! ⏰ (Zastavení času na 4 s & Popohnání kroku)',
      color: '#EAB308',
    });
  }
}

export function applyAnanasUpgrade(
  player: any,
  callbacks?: {
    onSound?: (name: string) => void;
    onDamageText?: (opts: { x: number; y: number; text: string; color?: string }) => void;
  },
  healingMultiplier = 1,
): void {
  callbacks?.onSound?.('ananasPickup');
  player.maxHp = Math.round(player.maxHp * 1.30);
  // The max-Courage upgrade always applies; only restoration of missing Courage
  // is reduced by nearby frostlings' healing dampening.
  const missingHp = Math.max(0, player.maxHp - player.hp);
  const safeHealingMultiplier = Math.max(0, Math.min(1, healingMultiplier));
  player.hp = Math.min(player.maxHp, player.hp + missingHp * safeHealingMultiplier);
  player.speed = Math.round(player.speed * 1.30);
  player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 10.0);
  callbacks?.onDamageText?.({
    x: player.x,
    y: player.y - 75,
    text: '🍍 ARCIVZÁCNÝ ANANAS! (+30 % Kuráž & Rychlost, plné zdraví a 10 s nezranitelnost)',
    color: '#FDE047',
  });
}

/**
 * Ghost rezervoár pro hejna (ADR 0006 & Plan Section 4)
 * Drobná hejna (swarms) nezasypávají bojiště desítkami drobných samostatných dropů.
 * Místo toho se jejich hodnota kumuluje do rezervoáru a po zahnání vůdce roje
 * nebo dosažení limitu se uvolní jako komprimovaný perníček a krejcary.
 */
export interface SwarmDropReservoir {
  points: number;
  gingerbread: number;
  coins: number;
  lastX?: number;
  lastY?: number;
  pendingKills?: number;
  leaderSeen?: boolean;
}

export function createSwarmDropReservoir(): SwarmDropReservoir {
  return {
    points: 0,
    gingerbread: 0,
    coins: 0,
    lastX: 0,
    lastY: 0,
    pendingKills: 0,
    leaderSeen: false,
  };
}

export function accumulateSwarmDrop(
  reservoir: SwarmDropReservoir,
  drop: { type: DropType; value?: number; x: number; y: number },
  isLeader = false
): boolean {
  if (drop.type === 'gingerbread') {
    reservoir.gingerbread += drop.value ?? 2;
  } else if (drop.type === 'coin') {
    reservoir.coins += drop.value ?? 1;
  }
  reservoir.lastX = drop.x;
  reservoir.lastY = drop.y;
  reservoir.pendingKills = (reservoir.pendingKills || 0) + 1;
  if (isLeader) {
    reservoir.leaderSeen = true;
  }
  return true;
}

export function shouldReleaseSwarmReservoir(reservoir: SwarmDropReservoir, threshold = 6): boolean {
  return !!reservoir.leaderSeen || (reservoir.pendingKills || 0) >= threshold;
}

export function releaseSwarmReservoir(
  reservoir: SwarmDropReservoir,
  targetDropsArray: GameDrop[]
): number {
  if (reservoir.gingerbread <= 0 && reservoir.coins <= 0) {
    reservoir.pendingKills = 0;
    reservoir.leaderSeen = false;
    return 0;
  }

  let releasedCount = 0;
  const lx = reservoir.lastX || 0;
  const ly = reservoir.lastY || 0;

  // Release consolidated gingerbreads
  let gbVal = reservoir.gingerbread;
  while (gbVal > 0) {
    if (gbVal >= GINGERBREAD_VALUES.giant) {
      targetDropsArray.push(
        createDropInstance('gingerbread', lx, ly, {
          value: GINGERBREAD_VALUES.giant,
          size: 'giant',
          radius: 18,
        })
      );
      gbVal -= GINGERBREAD_VALUES.giant;
      releasedCount++;
    } else if (gbVal >= GINGERBREAD_VALUES.large) {
      targetDropsArray.push(
        createDropInstance('gingerbread', lx, ly, {
          value: GINGERBREAD_VALUES.large,
          size: 'large',
          radius: 14,
        })
      );
      gbVal -= GINGERBREAD_VALUES.large;
      releasedCount++;
    } else {
      targetDropsArray.push(
        createDropInstance('gingerbread', lx, ly, {
          value: gbVal,
          size: 'small',
          radius: 10,
        })
      );
      gbVal = 0;
      releasedCount++;
    }
  }

  // Release consolidated coins
  if (reservoir.coins > 0) {
    targetDropsArray.push(
      createDropInstance('coin', lx + 10, ly - 10, {
        value: reservoir.coins,
        speed: 60,
      })
    );
    releasedCount++;
  }

  reservoir.gingerbread = 0;
  reservoir.coins = 0;
  reservoir.pendingKills = 0;
  reservoir.leaderSeen = false;
  return releasedCount;
}


