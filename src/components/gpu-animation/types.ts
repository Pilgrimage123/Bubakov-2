export type EnemyArchetype = 'runner' | 'slime' | 'bug' | 'golem';

export interface ArchetypeParams {
  animDuration: string; // e.g. "0.52s"
  wobbleAngle: string;  // e.g. "12deg"
  squashX: number;      // e.g. 1.16
  squashY: number;      // e.g. 0.86
  stretchX: number;     // e.g. 0.92
  stretchY: number;     // e.g. 1.09
  baseScale: number;    // e.g. 1.0
  width: number;        // in px
  height: number;       // in px
  speed: number;        // movement speed in px/s for simulation
  name: string;         // Czech label
  description: string;  // Explanation of physical behavior
}

/**
 * Calculates volume-preserving stretch values (stretchX, stretchY)
 * from squash values so that area (Sx * Sy) stays approximately 1.0.
 */
export function computeVolumePreservingStretch(
  squashX: number,
  squashY: number
): { stretchX: number; stretchY: number } {
  // Volume preservation: when squashing down (squashY < 1, squashX > 1),
  // stretching up does the inverse (stretchY > 1, stretchX < 1).
  const stretchY = Number((1 / Math.max(0.1, squashY)).toFixed(3));
  const stretchX = Number((1 / Math.max(0.1, squashX)).toFixed(3));
  return { stretchX, stretchY };
}

/**
 * Canonical presets for the 4 core archetypes required:
 * - runner: balanced wobble & step cadence
 * - slime: gelatinous body with minimal rotation and massive vertical/horizontal deformation
 * - bug: rapid scuttling with ultra-fast animation duration and high frequency
 * - golem: heavy titan boss with slow, ponderous swing and deep footfall impact
 */
export const ARCHETYPE_PRESETS: Record<EnemyArchetype, ArchetypeParams> = {
  runner: {
    animDuration: '0.52s',
    wobbleAngle: '11deg',
    squashX: 1.16,
    squashY: 0.86,
    stretchX: 0.92,
    stretchY: 1.09,
    baseScale: 1.0,
    width: 60,
    height: 60,
    speed: 125,
    name: 'Běžec (Runner)',
    description: 'Běžný pěšák s vyváženým kolébáním ramen a lehkým poskakováním v kroku.',
  },
  slime: {
    animDuration: '0.72s',
    wobbleAngle: '3deg',
    squashX: 1.38,
    squashY: 0.65,
    stretchX: 0.82,
    stretchY: 1.25,
    baseScale: 1.0,
    width: 64,
    height: 64,
    speed: 70,
    name: 'Slizoun (Slime)',
    description: 'Želatinový sliz – minimální rotace těla, zato extrémní rozplácnutí do šířky a následné vymrštění vzhůru.',
  },
  bug: {
    animDuration: '0.22s',
    wobbleAngle: '6deg',
    squashX: 1.09,
    squashY: 0.92,
    stretchX: 0.95,
    stretchY: 1.06,
    baseScale: 0.75,
    width: 48,
    height: 48,
    speed: 195,
    name: 'Hmyzák (Bug)',
    description: 'Rychlý hmyz – blesková frekvence kmitání nohou, malý náklon a neposedné cupitání.',
  },
  golem: {
    animDuration: '1.15s',
    wobbleAngle: '16deg',
    squashX: 1.24,
    squashY: 0.80,
    stretchX: 0.89,
    stretchY: 1.14,
    baseScale: 1.55,
    width: 80,
    height: 80,
    speed: 48,
    name: 'Golem (Heavy Boss)',
    description: 'Těžký obrněný boss – pomalý masivní krok, těžkopádné vyklopení do stran a drtivé došlápnutí.',
  },
};

export interface EnemyProps {
  id: string | number;
  x: number;
  y: number;
  playerX: number;
  src: string;
  archetype: EnemyArchetype | string;
  baseScale?: number;
  customParams?: Partial<ArchetypeParams>;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  showDebugBadge?: boolean;
}

export interface EnemyRuntimeData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  archetype: EnemyArchetype;
  src: string;
  baseScale: number;
  width: number;
  height: number;
}
