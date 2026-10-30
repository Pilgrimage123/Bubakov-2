/**
 * Procedural Fairytale Sun Foreground Overlay Renderer (Ladovské slunce v popředí)
 *
 * Implements a 7-stage daily narrative transformation across the 5-minute (300 s) run
 * in Stage 1 ("1. Předjaří v Hrusicích – Denní tání", ID 0):
 *   0. Východ slunce (cca 6:00)  — Sleepy/yawning, rose-orange with purple rim, short stretching rays
 *   1. Ráno (cca 8:00)           — Curious wide eyes looking sideways, raised brows, golden-yellow, brisk rays
 *   2. Dopoledne (cca 10:00)     — Mischievous side-glance, wide open smile with heart tongue, full yellow-orange
 *   3. Poledne (cca 12:00)       — Peak euphoria, sunglasses + laughing eyes, forehead sweat drop, white-hot core & long sharp rays
 *   4. Odpoledne (cca 15:00)     — Contented peaceful smile, gaze upward/afar, warm amber & honey, relaxed rays
 *   5. Podvečer (cca 18:00)      — Dreamy tender smile, heavy eyelids, deep blushing cheeks, downward-curving red-orange rays
 *   6. Západ slunce (cca 20:00)  — Sleepy smile, nightcap with pom-pom, waving/yawning, crimson & purple shadows along horizon
 *
 * Performance Architecture:
 * - All 7 keyframe pairs (`raysCanvas` + `faceCanvas`, 512x512 px) are pre-rendered once into
 *   offscreen canvases at initialization.
 * - The 60+ FPS `requestAnimationFrame` loop NEVER executes Bezier curves or gradients; it blends
 *   adjacent keyframe canvases exclusively via hardware-accelerated `ctx.drawImage()` calls.
 */

export const SUN_OFFSCREEN_SIZE = 512;
export const SUN_RUN_DURATION_SECONDS = 300; // 5-minute run = 300 seconds
export const SUN_KEYFRAME_COUNT = 7;

export type SunVisualPhaseId =
  | 'sunrise'
  | 'morning'
  | 'late_morning'
  | 'noon'
  | 'afternoon'
  | 'early_evening'
  | 'sunset';

export interface SunPhaseMetadata {
  index: number;
  id: SunVisualPhaseId;
  label: string;
  clockLabel: string;
  defaultTimeSeconds: number;
}

export const SUN_VISUAL_PHASES: readonly SunPhaseMetadata[] = [
  {
    index: 0,
    id: 'sunrise',
    label: 'Východ slunce',
    clockLabel: '6:00',
    defaultTimeSeconds: 0,
  },
  {
    index: 1,
    id: 'morning',
    label: 'Ráno',
    clockLabel: '8:00',
    defaultTimeSeconds: 50,
  },
  {
    index: 2,
    id: 'late_morning',
    label: 'Dopoledne',
    clockLabel: '10:00',
    defaultTimeSeconds: 100,
  },
  {
    index: 3,
    id: 'noon',
    label: 'Poledne',
    clockLabel: '12:00',
    defaultTimeSeconds: 150,
  },
  {
    index: 4,
    id: 'afternoon',
    label: 'Odpoledne',
    clockLabel: '15:00',
    defaultTimeSeconds: 200,
  },
  {
    index: 5,
    id: 'early_evening',
    label: 'Podvečer',
    clockLabel: '18:00',
    defaultTimeSeconds: 250,
  },
  {
    index: 6,
    id: 'sunset',
    label: 'Západ slunce',
    clockLabel: '20:00',
    defaultTimeSeconds: 300,
  },
];

export interface SunOverlayConfig {
  /** Override time in seconds (0..300) from debug slider; null = use live engine.gameTime */
  manualTimeSeconds: number | null;
  /** Multiplier for foreground camera parallax (default 1.0) */
  parallaxStrength: number;
  /** Protective repulsion radius around screen center (width/2, height/2) in px (default 280) */
  deadzoneRadius: number;
  /** Visual scale of the rendered sun overlay on screen (default 0.62 -> ~317px diameter) */
  sunScale: number;
  /** Whether to draw a subtle dashed debug ring showing the deadzone boundary */
  showDeadzoneDebugRing: boolean;
  /** Whether the bullet-heaven readability stress test (hundreds of projectiles) is active */
  stressTestActive: boolean;
}

export function createDefaultSunOverlayConfig(): SunOverlayConfig {
  return {
    manualTimeSeconds: null,
    parallaxStrength: 1.0,
    deadzoneRadius: 280,
    sunScale: 0.62,
    showDeadzoneDebugRing: false,
    stressTestActive: false,
  };
}

export interface LensFlareNode {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  tint: 'gold' | 'amber' | 'rose';
}

export interface ParallaxCloudNode {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  variant: 0 | 1;
}

export interface SunComputedFrameState {
  progress: number;
  effectiveTimeSeconds: number;
  phaseIndexA: number;
  phaseIndexB: number;
  phaseBlend: number;
  activePhaseId: SunVisualPhaseId;
  activePhaseLabel: string;
  activeClockLabel: string;
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  /** 1.15x differential 3D relief offset of the sun's convex face relative to its rays crown */
  faceOffsetX: number;
  faceOffsetY: number;
  /** 3D perspective depth scale factor (0.93..1.09) based on vertical parallax */
  depthScale: number;
  /** 0.78x parallax volumetric sunbeams behind the sun */
  sunbeamsX: number;
  sunbeamsY: number;
  sunbeamsTiltRad: number;
  /** 0.45x parallax distant sky clouds behind the sun */
  farClouds: [ParallaxCloudNode, ParallaxCloudNode];
  /** 1.48x parallax foreground Ladovské clouds that pass IN FRONT OF and partially occlude the sun */
  nearClouds: [ParallaxCloudNode, ParallaxCloudNode];
  /** 1.62x parallax high-flying spring birds passing in front of the sun */
  birdsFlock: {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
  };
  distanceToCenter: number;
  alpha: number;
  raysRotationRad: number;
  renderSizePx: number;
  wasRepelled: boolean;
  ambientR: number;
  ambientG: number;
  ambientB: number;
  ambientAlpha: number;
  flares: [LensFlareNode, LensFlareNode, LensFlareNode];
}

export function createReusableSunFrameState(): SunComputedFrameState {
  return {
    progress: 0,
    effectiveTimeSeconds: 0,
    phaseIndexA: 0,
    phaseIndexB: 0,
    phaseBlend: 0,
    activePhaseId: 'sunrise',
    activePhaseLabel: 'Východ slunce',
    activeClockLabel: '6:00',
    anchorX: 0,
    anchorY: 0,
    x: 0,
    y: 0,
    faceOffsetX: 0,
    faceOffsetY: 0,
    depthScale: 1,
    sunbeamsX: 0,
    sunbeamsY: 0,
    sunbeamsTiltRad: 0,
    farClouds: [
      { x: 0, y: 0, width: 260, height: 122, alpha: 0.55, variant: 0 },
      { x: 0, y: 0, width: 230, height: 110, alpha: 0.48, variant: 1 },
    ],
    nearClouds: [
      { x: 0, y: 0, width: 320, height: 158, alpha: 0.86, variant: 0 },
      { x: 0, y: 0, width: 285, height: 142, alpha: 0.82, variant: 1 },
    ],
    birdsFlock: {
      x: 0,
      y: 0,
      width: 180,
      height: 90,
      alpha: 0.85,
    },
    distanceToCenter: 0,
    alpha: 0.9,
    raysRotationRad: 0,
    renderSizePx: 317,
    wasRepelled: false,
    ambientR: 255,
    ambientG: 215,
    ambientB: 90,
    ambientAlpha: 0.04,
    flares: [
      { x: 0, y: 0, radius: 42, alpha: 0.14, tint: 'gold' },
      { x: 0, y: 0, radius: 26, alpha: 0.11, tint: 'amber' },
      { x: 0, y: 0, radius: 58, alpha: 0.09, tint: 'rose' },
    ],
  };
}

export interface SunPhaseCanvasPair {
  phase: SunPhaseMetadata;
  raysCanvas: HTMLCanvasElement;
  faceCanvas: HTMLCanvasElement;
}

export interface CachedSunCanvases {
  /** Legacy/default aliases pointing to late_morning (classic full sun) for backwards compatibility */
  raysCanvas: HTMLCanvasElement;
  faceCanvas: HTMLCanvasElement;
  /** All 7 pre-rendered keyframe canvas pairs */
  keyframes: SunPhaseCanvasPair[];
  /** 0.45x parallax distant sky cloud canvas */
  farCloudCanvas: HTMLCanvasElement;
  /** 0.78x parallax volumetric golden sunbeams canvas */
  sunbeamsCanvas: HTMLCanvasElement;
  /** 1.48x parallax foreground occluding Ladovské cloud canvases (pass in front of sun) */
  nearCloudCanvasA: HTMLCanvasElement;
  nearCloudCanvasB: HTMLCanvasElement;
  /** 1.62x parallax high-flying spring swallows/crows flock canvas (passes in front of sun) */
  birdsCanvas: HTMLCanvasElement;
  flareGoldCanvas: HTMLCanvasElement;
  flareAmberCanvas: HTMLCanvasElement;
  flareRoseCanvas: HTMLCanvasElement;
}

let cachedSunCanvases: CachedSunCanvases | null = null;

function createOffscreenCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
} {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }
  const fakeCanvas = { width, height } as HTMLCanvasElement;
  return { canvas: fakeCanvas, ctx: null };
}

interface PhaseRayPalette {
  coronaInner: string;
  coronaMid: string;
  spikeStops: [string, string, string, string];
  flameStops: [string, string, string, string];
  spikeLenMult: number;
  flameLenMult: number;
  waveAmpMult: number;
  droopGravity: number;
  horizonFlatten: number;
  stretchingArmsOnly: boolean;
}

const PHASE_RAY_PALETTES: Record<SunVisualPhaseId, PhaseRayPalette> = {
  sunrise: {
    coronaInner: 'rgba(251, 146, 60, 0.28)',
    coronaMid: 'rgba(168, 85, 247, 0.15)',
    spikeStops: ['#FDBA74', '#FB7185', '#E11D48', '#7E22CE'],
    flameStops: ['#FDE8E8', '#FDBA74', '#FB7185', '#9333EA'],
    spikeLenMult: 0.56,
    flameLenMult: 0.58,
    waveAmpMult: 0.65,
    droopGravity: 0,
    horizonFlatten: 0,
    stretchingArmsOnly: true, // a few rays stretch long like morning arms
  },
  morning: {
    coronaInner: 'rgba(253, 224, 71, 0.32)',
    coronaMid: 'rgba(251, 146, 60, 0.15)',
    spikeStops: ['#FEF08A', '#FBBF24', '#F59E0B', '#EA580C'],
    flameStops: ['#FFFBEB', '#FDE047', '#FBBF24', '#F97316'],
    spikeLenMult: 0.86,
    flameLenMult: 0.9,
    waveAmpMult: 1.25, // brisk morning wave
    droopGravity: 0,
    horizonFlatten: 0,
    stretchingArmsOnly: false,
  },
  late_morning: {
    coronaInner: 'rgba(255, 215, 64, 0.34)',
    coronaMid: 'rgba(251, 146, 60, 0.16)',
    spikeStops: ['#FBBF24', '#F97316', '#EA580C', '#DC2626'],
    flameStops: ['#FEF08A', '#FACC15', '#F59E0B', '#EA580C'],
    spikeLenMult: 1.0,
    flameLenMult: 1.0,
    waveAmpMult: 1.0,
    droopGravity: 0,
    horizonFlatten: 0,
    stretchingArmsOnly: false,
  },
  noon: {
    coronaInner: 'rgba(255, 255, 220, 0.52)',
    coronaMid: 'rgba(250, 204, 21, 0.28)',
    spikeStops: ['#FFFFFF', '#FEF08A', '#FACC15', '#F59E0B'],
    flameStops: ['#FFFFFF', '#FEF9C3', '#FDE047', '#F59E0B'],
    spikeLenMult: 1.24, // sharp straight spikes dominate at noon
    flameLenMult: 1.05,
    waveAmpMult: 0.35, // straighter, sharper rays
    droopGravity: 0,
    horizonFlatten: 0,
    stretchingArmsOnly: false,
  },
  afternoon: {
    coronaInner: 'rgba(251, 191, 36, 0.32)',
    coronaMid: 'rgba(217, 119, 6, 0.16)',
    spikeStops: ['#FCD34D', '#F59E0B', '#D97706', '#B45309'],
    flameStops: ['#FEF3C7', '#FBBF24', '#D97706', '#B45309'],
    spikeLenMult: 0.92,
    flameLenMult: 0.94,
    waveAmpMult: 0.78,
    droopGravity: 14, // slightly relaxed/drooping
    horizonFlatten: 0,
    stretchingArmsOnly: false,
  },
  early_evening: {
    coronaInner: 'rgba(249, 115, 22, 0.34)',
    coronaMid: 'rgba(185, 28, 28, 0.18)',
    spikeStops: ['#FB923C', '#EA580C', '#DC2626', '#991B1B'],
    flameStops: ['#FED7AA', '#FB923C', '#EA580C', '#991B1B'],
    spikeLenMult: 0.76,
    flameLenMult: 0.8,
    waveAmpMult: 0.7,
    droopGravity: 34, // rays bend downward as the sun sits down
    horizonFlatten: 0.15,
    stretchingArmsOnly: false,
  },
  sunset: {
    coronaInner: 'rgba(225, 29, 72, 0.34)',
    coronaMid: 'rgba(107, 33, 168, 0.22)',
    spikeStops: ['#FB7185', '#E11D48', '#9F1239', '#581C87'],
    flameStops: ['#FDBA74', '#F43F5E', '#BE123C', '#4C1D95'],
    spikeLenMult: 0.58,
    flameLenMult: 0.62,
    waveAmpMult: 0.5,
    droopGravity: 26,
    horizonFlatten: 0.45, // short, soft rays laid out along the horizon
    stretchingArmsOnly: false,
  },
};

/**
 * Pre-renders the crown of 12 wavy S-curved flame rays and 12 sharp triangular spikes
 * for a specific time-of-day phase onto a 512x512 offscreen canvas.
 */
export function bakeSunRaysCanvas(
  ctx: CanvasRenderingContext2D,
  size = SUN_OFFSCREEN_SIZE,
  phaseId: SunVisualPhaseId = 'late_morning'
): void {
  const cx = size * 0.5;
  const cy = size * 0.5;
  const innerR = 102;
  const baseSpikeSpan = 94;
  const baseFlameSpan = 142;
  const count = 12;
  const inkColor = '#231409';
  const pal = PHASE_RAY_PALETTES[phaseId];

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Soft outer corona aura (extra luminous at noon)
  const coronaRadius = phaseId === 'noon' ? 254 : 244;
  const coronaGrad = ctx.createRadialGradient(0, 0, innerR * 0.82, 0, 0, coronaRadius);
  coronaGrad.addColorStop(0, pal.coronaInner);
  coronaGrad.addColorStop(0.58, pal.coronaMid);
  coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coronaRadius, 0, Math.PI * 2);
  ctx.fill();

  if (phaseId === 'noon') {
    // Distinct shimmering noon aura ring around the head
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 220, 0.55)';
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, innerR + 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 1. Draw the 12 shorter sharp triangular spikes
  for (let i = 0; i < count; i++) {
    const rawAngle = (i * Math.PI * 2) / count + Math.PI / count;
    // At sunset, rays below the horizon tuck in and side rays lay flatter along the horizon
    const sinA = Math.sin(rawAngle);
    const cosA = Math.cos(rawAngle);
    if (phaseId === 'sunset' && cosA > 0.35) {
      continue;
    }

    let spikeMult = pal.spikeLenMult;
    if (pal.horizonFlatten > 0) {
      // Emphasize horizontal rays along the horizon
      spikeMult *= 0.72 + Math.abs(sinA) * pal.horizonFlatten * 0.9;
    }
    const spikeOuterR = innerR + baseSpikeSpan * spikeMult;
    const droopTipX = sinA * pal.droopGravity * 0.55;

    ctx.save();
    ctx.rotate(rawAngle);

    const baseHalfW = phaseId === 'noon' ? 25 : 21;
    const spikeGrad = ctx.createLinearGradient(0, -innerR + 6, 0, -spikeOuterR);
    spikeGrad.addColorStop(0, pal.spikeStops[0]);
    spikeGrad.addColorStop(0.45, pal.spikeStops[1]);
    spikeGrad.addColorStop(0.85, pal.spikeStops[2]);
    spikeGrad.addColorStop(1, pal.spikeStops[3]);

    ctx.beginPath();
    ctx.moveTo(-baseHalfW, -innerR + 6);
    ctx.quadraticCurveTo(
      -baseHalfW * 0.45 + droopTipX * 0.3,
      -(innerR + spikeOuterR) * 0.5,
      droopTipX,
      -spikeOuterR
    );
    ctx.quadraticCurveTo(
      baseHalfW * 0.45 + droopTipX * 0.3,
      -(innerR + spikeOuterR) * 0.5,
      baseHalfW,
      -innerR + 6
    );
    ctx.closePath();

    ctx.fillStyle = spikeGrad;
    ctx.fill();

    // Left facet highlight
    ctx.beginPath();
    ctx.moveTo(-baseHalfW * 0.7, -innerR + 8);
    ctx.lineTo(droopTipX, -spikeOuterR + 10);
    ctx.lineTo(2, -innerR + 8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 251, 235, 0.3)';
    ctx.fill();

    // Bold fairytale ink outline
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-baseHalfW, -innerR + 6);
    ctx.quadraticCurveTo(
      -baseHalfW * 0.45 + droopTipX * 0.3,
      -(innerR + spikeOuterR) * 0.5,
      droopTipX,
      -spikeOuterR
    );
    ctx.quadraticCurveTo(
      baseHalfW * 0.45 + droopTipX * 0.3,
      -(innerR + spikeOuterR) * 0.5,
      baseHalfW,
      -innerR + 6
    );
    ctx.stroke();

    ctx.restore();
  }

  // 2. Draw the 12 wavy S-shaped flame rays via bezierCurveTo
  for (let i = 0; i < count; i++) {
    const rawAngle = (i * Math.PI * 2) / count;
    const sinA = Math.sin(rawAngle);
    const cosA = Math.cos(rawAngle);

    if (phaseId === 'sunset' && cosA > 0.28) {
      continue;
    }

    let flameMult = pal.flameLenMult;
    // At sunrise, 3 rays stretch out long like arms in a morning stretch while others stay tucked in
    if (pal.stretchingArmsOnly) {
      const isStretchingArm = i === 2 || i === 10 || i === 0;
      flameMult = isStretchingArm ? 1.04 : 0.52;
    }
    if (pal.horizonFlatten > 0) {
      flameMult *= 0.68 + Math.abs(sinA) * pal.horizonFlatten * 1.1;
    }

    const span = baseFlameSpan * flameMult;
    const flameOuterR = innerR + span;
    const wave = pal.waveAmpMult;
    const bendX = sinA * pal.droopGravity;

    ctx.save();
    ctx.rotate(rawAngle);

    const baseHalfW = 24;
    const flameGrad = ctx.createLinearGradient(0, -innerR + 6, 0, -flameOuterR);
    flameGrad.addColorStop(0, pal.flameStops[0]);
    flameGrad.addColorStop(0.34, pal.flameStops[1]);
    flameGrad.addColorStop(0.74, pal.flameStops[2]);
    flameGrad.addColorStop(1, pal.flameStops[3]);

    ctx.beginPath();
    ctx.moveTo(-baseHalfW, -innerR + 8);
    ctx.bezierCurveTo(
      -baseHalfW * 1.2 * wave + bendX * 0.2,
      -innerR - span * 0.26,
      18 * wave + bendX * 0.5,
      -innerR - span * 0.58,
      -9 * wave + bendX * 0.85,
      -innerR - span * 0.83
    );
    ctx.bezierCurveTo(
      -18 * wave + bendX,
      -innerR - span * 0.92,
      -5 * wave + bendX,
      -flameOuterR + 4,
      3 * wave + bendX,
      -flameOuterR
    );
    ctx.bezierCurveTo(
      19 * wave + bendX,
      -flameOuterR + 16,
      29 * wave + bendX * 0.7,
      -innerR - span * 0.72,
      11 * wave + bendX * 0.4,
      -innerR - span * 0.45
    );
    ctx.bezierCurveTo(
      -4 * wave + bendX * 0.2,
      -innerR - span * 0.24,
      baseHalfW * 0.95,
      -innerR - span * 0.12,
      baseHalfW,
      -innerR + 8
    );
    ctx.closePath();

    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Inner painterly gouache highlight stroke
    ctx.beginPath();
    ctx.moveTo(-baseHalfW * 0.4, -innerR + 10);
    ctx.bezierCurveTo(
      -12 * wave + bendX * 0.25,
      -innerR - span * 0.25,
      10 * wave + bendX * 0.5,
      -innerR - span * 0.52,
      -2 * wave + bendX * 0.8,
      -innerR - span * 0.78
    );
    ctx.strokeStyle = 'rgba(255, 251, 235, 0.52)';
    ctx.lineWidth = 3.8;
    ctx.stroke();

    // Bold fairytale ink outline
    ctx.beginPath();
    ctx.moveTo(-baseHalfW, -innerR + 8);
    ctx.bezierCurveTo(
      -baseHalfW * 1.2 * wave + bendX * 0.2,
      -innerR - span * 0.26,
      18 * wave + bendX * 0.5,
      -innerR - span * 0.58,
      -9 * wave + bendX * 0.85,
      -innerR - span * 0.83
    );
    ctx.bezierCurveTo(
      -18 * wave + bendX,
      -innerR - span * 0.92,
      -5 * wave + bendX,
      -flameOuterR + 4,
      3 * wave + bendX,
      -flameOuterR
    );
    ctx.bezierCurveTo(
      19 * wave + bendX,
      -flameOuterR + 16,
      29 * wave + bendX * 0.7,
      -innerR - span * 0.72,
      11 * wave + bendX * 0.4,
      -innerR - span * 0.45
    );
    ctx.bezierCurveTo(
      -4 * wave + bendX * 0.2,
      -innerR - span * 0.24,
      baseHalfW * 0.95,
      -innerR - span * 0.12,
      baseHalfW,
      -innerR + 8
    );
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.8;
    ctx.stroke();

    ctx.restore();
  }

  // Solid warm inner base disc (r=102) so when faceCanvas shifts in 3D relief (+/-13px), no gap ever appears at the ray roots
  ctx.fillStyle = pal.flameStops[2];
  ctx.beginPath();
  ctx.arc(0, 0, innerR + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

interface PhaseFacePalette {
  discStops: [string, string, string, string, string];
  cheekInner: string;
  cheekMid: string;
  cheekRadius: number;
  swirlStroke: string;
}

const PHASE_FACE_PALETTES: Record<SunVisualPhaseId, PhaseFacePalette> = {
  sunrise: {
    discStops: ['#FFF1F2', '#FED7AA', '#FB923C', '#F43F5E', '#7E22CE'],
    cheekInner: 'rgba(244, 63, 94, 0.86)', // pronounced sleep-flushed pink cheeks
    cheekMid: 'rgba(251, 113, 133, 0.52)',
    cheekRadius: 34,
    swirlStroke: 'rgba(190, 24, 93, 0.22)',
  },
  morning: {
    discStops: ['#FFFBEB', '#FEF08A', '#FACC15', '#F59E0B', '#D97706'],
    cheekInner: 'rgba(239, 68, 68, 0.72)',
    cheekMid: 'rgba(249, 115, 22, 0.45)',
    cheekRadius: 30,
    swirlStroke: 'rgba(217, 119, 6, 0.22)',
  },
  late_morning: {
    discStops: ['#FFFBEB', '#FEF08A', '#FACC15', '#F59E0B', '#EA580C'],
    cheekInner: 'rgba(220, 38, 38, 0.78)',
    cheekMid: 'rgba(234, 88, 12, 0.52)',
    cheekRadius: 31,
    swirlStroke: 'rgba(234, 88, 12, 0.22)',
  },
  noon: {
    discStops: ['#FFFFFF', '#FFFFFF', '#FEF08A', '#FACC15', '#F59E0B'], // white-hot overexposed core
    cheekInner: 'rgba(239, 68, 68, 0.82)',
    cheekMid: 'rgba(249, 115, 22, 0.5)',
    cheekRadius: 32,
    swirlStroke: 'rgba(245, 158, 11, 0.25)',
  },
  afternoon: {
    discStops: ['#FEF3C7', '#FDE68A', '#FBBF24', '#D97706', '#B45309'], // warm honey & amber
    cheekInner: 'rgba(220, 38, 38, 0.72)',
    cheekMid: 'rgba(217, 119, 6, 0.48)',
    cheekRadius: 31,
    swirlStroke: 'rgba(180, 83, 9, 0.24)',
  },
  early_evening: {
    discStops: ['#FFEDD5', '#FDBA74', '#FB923C', '#EA580C', '#991B1B'], // orange to red-orange
    cheekInner: 'rgba(220, 38, 38, 0.88)', // deep farewell blush
    cheekMid: 'rgba(185, 28, 28, 0.58)',
    cheekRadius: 35,
    swirlStroke: 'rgba(153, 27, 27, 0.26)',
  },
  sunset: {
    discStops: ['#FED7AA', '#FB7185', '#E11D48', '#9F1239', '#4C1D95'], // crimson & purple shadows
    cheekInner: 'rgba(225, 29, 72, 0.85)',
    cheekMid: 'rgba(136, 19, 55, 0.52)',
    cheekRadius: 34,
    swirlStroke: 'rgba(88, 28, 135, 0.28)',
  },
};

function drawOpenHeartMouth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  widthScale: number,
  openScale: number,
  inkColor: string
): void {
  ctx.save();
  const mouthLeftX = cx - 48 * widthScale;
  const mouthRightX = cx + 48 * widthScale;
  const mouthCornerY = cy + 18;
  const bottomControlY = cy + 38 + 50 * openScale;

  ctx.beginPath();
  ctx.moveTo(mouthLeftX, mouthCornerY);
  ctx.quadraticCurveTo(cx, cy + 36, mouthRightX, mouthCornerY);
  ctx.bezierCurveTo(
    cx + 34 * widthScale,
    bottomControlY,
    cx - 34 * widthScale,
    bottomControlY,
    mouthLeftX,
    mouthCornerY
  );
  ctx.closePath();

  ctx.fillStyle = '#3B1109';
  ctx.fill();

  ctx.save();
  ctx.clip();

  const tongueTopY = cy + 44 + (openScale - 1) * 8;
  const tongueGrad = ctx.createLinearGradient(cx, tongueTopY, cx, bottomControlY);
  tongueGrad.addColorStop(0, '#F87171');
  tongueGrad.addColorStop(0.45, '#EF4444');
  tongueGrad.addColorStop(1, '#B91C1C');

  ctx.beginPath();
  ctx.moveTo(cx, tongueTopY + 8);
  ctx.bezierCurveTo(
    cx - 14,
    tongueTopY - 4,
    cx - 34,
    tongueTopY + 8,
    cx - 26,
    bottomControlY - 8
  );
  ctx.quadraticCurveTo(cx, bottomControlY + 4, cx + 26, bottomControlY - 8);
  ctx.bezierCurveTo(
    cx + 34,
    tongueTopY + 8,
    cx + 14,
    tongueTopY - 4,
    cx,
    tongueTopY + 8
  );
  ctx.closePath();
  ctx.fillStyle = tongueGrad;
  ctx.fill();

  ctx.fillStyle = 'rgba(254, 202, 202, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - 10, tongueTopY + 12, 7, 4.5, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(cx, tongueTopY + 8);
  ctx.bezierCurveTo(
    cx - 14,
    tongueTopY - 4,
    cx - 34,
    tongueTopY + 8,
    cx - 26,
    bottomControlY - 8
  );
  ctx.moveTo(cx, tongueTopY + 8);
  ctx.bezierCurveTo(
    cx + 14,
    tongueTopY - 4,
    cx + 34,
    tongueTopY + 8,
    cx + 26,
    bottomControlY - 8
  );
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(mouthLeftX - 4, mouthCornerY - 3);
  ctx.quadraticCurveTo(cx, cy + 37, mouthRightX + 4, mouthCornerY - 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mouthLeftX, mouthCornerY);
  ctx.bezierCurveTo(
    cx + 34 * widthScale,
    bottomControlY,
    cx - 34 * widthScale,
    bottomControlY,
    mouthLeftX,
    mouthCornerY
  );
  ctx.stroke();

  // Laugh creases at corners
  ctx.lineWidth = 4.0;
  ctx.beginPath();
  ctx.arc(mouthLeftX - 3, mouthCornerY - 2, 11, -2.3, -0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(mouthRightX + 3, mouthCornerY - 2, 11, -2.6, -0.8);
  ctx.stroke();

  ctx.restore();
}

/**
 * Pre-renders the central sun disc, signature nose & cheeks, and the phase-specific
 * fairytale expression (eyes, mouth, noon sweat drop & shades, or sunset nightcap).
 */
export function bakeSunFaceCanvas(
  ctx: CanvasRenderingContext2D,
  size = SUN_OFFSCREEN_SIZE,
  phaseId: SunVisualPhaseId = 'late_morning'
): void {
  const cx = size * 0.5;
  const cy = size * 0.5;
  const discR = 108;
  const inkColor = '#231409';
  const pal = PHASE_FACE_PALETTES[phaseId];

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. Sun Body Disc (consistent shape and brushstroke style across all 7 phases)
  const bodyGrad = ctx.createRadialGradient(cx - 14, cy - 18, 12, cx, cy, discR);
  bodyGrad.addColorStop(0, pal.discStops[0]);
  bodyGrad.addColorStop(0.28, pal.discStops[1]);
  bodyGrad.addColorStop(0.64, pal.discStops[2]);
  bodyGrad.addColorStop(0.88, pal.discStops[3]);
  bodyGrad.addColorStop(1, pal.discStops[4]);

  ctx.beginPath();
  ctx.arc(cx, cy, discR, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Hand-painted gouache circular texture strokes
  ctx.save();
  ctx.strokeStyle = pal.swirlStroke;
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const startAng = (i * Math.PI) / 4 + 0.2;
    const r = discR * (0.76 + (i % 2) * 0.12);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAng, startAng + 0.52);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 251, 235, 0.36)';
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 6; i++) {
    const startAng = (i * Math.PI) / 3 + 0.4;
    const r = discR * (0.48 + (i % 2) * 0.16);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAng, startAng + 0.45);
    ctx.stroke();
  }
  ctx.restore();

  // Outer dark brown/black contour of the sun disc
  ctx.beginPath();
  ctx.arc(cx, cy, discR, 0, Math.PI * 2);
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 6.2;
  ctx.stroke();

  // 2. Signature Cheeks (intensity & hue shift smoothly with the time of day)
  const cheekOffsets = [
    { x: cx - 58, y: cy + 15, rot: -0.22 },
    { x: cx + 58, y: cy + 15, rot: 0.22 },
  ];
  for (let i = 0; i < cheekOffsets.length; i++) {
    const ch = cheekOffsets[i];
    const cheekGrad = ctx.createRadialGradient(
      ch.x,
      ch.y,
      3,
      ch.x,
      ch.y,
      pal.cheekRadius
    );
    cheekGrad.addColorStop(0, pal.cheekInner);
    cheekGrad.addColorStop(0.52, pal.cheekMid);
    cheekGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.arc(ch.x, ch.y, pal.cheekRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(ch.x, ch.y);
    ctx.rotate(ch.rot);
    ctx.strokeStyle = 'rgba(153, 27, 27, 0.26)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, 18, -0.8, 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Phase-Specific Mouth Expression
  if (phaseId === 'sunrise') {
    // 6:00 Sunrise: Cute sleepy yawning 'O' mouth + gentle sleepy smile corners
    ctx.save();
    const yawnX = cx + 2;
    const yawnY = cy + 42;
    ctx.fillStyle = '#3B1109';
    ctx.beginPath();
    ctx.ellipse(yawnX, yawnY, 17, 21, 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(yawnX, yawnY + 14, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.ellipse(yawnX, yawnY, 17, 21, 0.06, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (phaseId === 'morning') {
    // 8:00 Morning: Cheerful medium-open grin
    drawOpenHeartMouth(ctx, cx, cy, 0.86, 0.78, inkColor);
  } else if (phaseId === 'late_morning') {
    // 10:00 Late Morning: Classic wide joyful open smile with heart tongue
    drawOpenHeartMouth(ctx, cx, cy, 1.0, 1.0, inkColor);
  } else if (phaseId === 'noon') {
    // 12:00 Noon: Maximum euphoria wide laughing mouth
    drawOpenHeartMouth(ctx, cx, cy, 1.08, 1.14, inkColor);
  } else if (phaseId === 'afternoon') {
    // 15:00 Afternoon: Contented, peaceful warm smile
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 5.0;
    ctx.beginPath();
    ctx.moveTo(cx - 44, cy + 22);
    ctx.bezierCurveTo(cx - 18, cy + 56, cx + 18, cy + 56, cx + 44, cy + 22);
    ctx.stroke();

    // Cute warm lower lip highlight
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(cx, cy + 36, 16, 0.25, Math.PI - 0.25);
    ctx.stroke();

    // Smile dimples
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.arc(cx - 46, cy + 20, 9, -2.3, -0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 46, cy + 20, 9, -2.6, -0.8);
    ctx.stroke();
    ctx.restore();
  } else if (phaseId === 'early_evening') {
    // 18:00 Early Evening: Dreamy, tender, slightly melancholic soft smile
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(cx - 34, cy + 28);
    ctx.quadraticCurveTo(cx, cy + 48, cx + 34, cy + 28);
    ctx.stroke();

    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(cx - 36, cy + 26, 7.5, -2.2, -0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 36, cy + 26, 7.5, -2.6, -0.9);
    ctx.stroke();
    ctx.restore();
  } else {
    // 20:00 Sunset: Sleepy contented smile / blowing a goodnight kiss with waving little hand
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 26);
    ctx.quadraticCurveTo(cx - 2, cy + 45, cx + 28, cy + 25);
    ctx.stroke();

    // Little waving golden-red sun hand on the bottom-right greeting goodbye
    ctx.fillStyle = '#FB7185';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.ellipse(cx + 82, cy + 44, 18, 13, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 4. Phase-Specific Eyes & Eyebrows
  const eyes = [
    { x: cx - 31, y: cy - 23, rot: -0.08 },
    { x: cx + 31, y: cy - 23, rot: 0.08 },
  ];

  if (phaseId === 'sunrise') {
    // 6:00 Sunrise: Closed / half-closed sleepy eyelids with soft lashes
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.8;
    for (let i = 0; i < eyes.length; i++) {
      const e = eyes[i];
      ctx.beginPath();
      ctx.arc(e.x, e.y - 2, 15, 0.15, Math.PI - 0.15);
      ctx.stroke();
      // Sleepy eyelashes
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(e.x - 12, e.y + 8);
      ctx.lineTo(e.x - 16, e.y + 14);
      ctx.moveTo(e.x, e.y + 12);
      ctx.lineTo(e.x, e.y + 18);
      ctx.moveTo(e.x + 12, e.y + 8);
      ctx.lineTo(e.x + 16, e.y + 14);
      ctx.stroke();
      ctx.lineWidth = 4.8;
    }
    // Relaxed low sleepy eyebrows
    ctx.lineWidth = 5.2;
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy - 36);
    ctx.quadraticCurveTo(cx - 31, cy - 46, cx - 14, cy - 38);
    ctx.moveTo(cx + 14, cy - 38);
    ctx.quadraticCurveTo(cx + 31, cy - 46, cx + 48, cy - 36);
    ctx.stroke();
    ctx.restore();
  } else if (phaseId === 'noon') {
    // 12:00 Noon: Euphoric laughing arched eyes + cool fairytale sunglasses perched on nose bridge + forehead sweat drop!
    ctx.save();
    // Laughing upper eye crescents peeking happily above the sunglasses
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 5.0;
    for (let i = 0; i < eyes.length; i++) {
      const e = eyes[i];
      ctx.beginPath();
      ctx.arc(e.x, e.y - 6, 14, Math.PI + 0.25, Math.PI * 2 - 0.25);
      ctx.stroke();
    }

    // Stylish folk sunglasses perched across the eyes
    const leftLensX = cx - 33;
    const rightLensX = cx + 33;
    const lensY = cy - 16;
    ctx.fillStyle = '#1E1B18';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 4.6;

    // Left & right dark lenses
    ctx.beginPath();
    ctx.roundRect(leftLensX - 22, lensY - 12, 44, 26, 9);
    ctx.roundRect(rightLensX - 22, lensY - 12, 44, 26, 9);
    ctx.fill();
    ctx.stroke();

    // Brass bridge & temple arms
    ctx.beginPath();
    ctx.moveTo(leftLensX + 22, lensY - 3);
    ctx.quadraticCurveTo(cx, lensY - 9, rightLensX - 22, lensY - 3);
    ctx.moveTo(leftLensX - 22, lensY - 4);
    ctx.lineTo(cx - 98, lensY - 12);
    ctx.moveTo(rightLensX + 22, lensY - 4);
    ctx.lineTo(cx + 98, lensY - 12);
    ctx.stroke();

    // Crisp white diagonal sun glare on the sunglasses lenses
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(leftLensX - 12, lensY + 7);
    ctx.lineTo(leftLensX - 2, lensY - 7);
    ctx.moveTo(rightLensX - 12, lensY + 7);
    ctx.lineTo(rightLensX - 2, lensY - 7);
    ctx.stroke();

    // High euphoric eyebrows
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 6.2;
    ctx.beginPath();
    ctx.moveTo(cx - 52, cy - 48);
    ctx.quadraticCurveTo(cx - 32, cy - 68, cx - 12, cy - 52);
    ctx.moveTo(cx + 12, cy - 52);
    ctx.quadraticCurveTo(cx + 32, cy - 68, cx + 52, cy - 48);
    ctx.stroke();

    // Detail: Glistening drop of sweat on the forehead ("Kapička potu na čele")
    const dropX = cx + 56;
    const dropY = cy - 54;
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(dropX, dropY - 14);
    ctx.bezierCurveTo(dropX + 11, dropY - 2, dropX + 9, dropY + 12, dropX, dropY + 12);
    ctx.bezierCurveTo(dropX - 9, dropY + 12, dropX - 11, dropY - 2, dropX, dropY - 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(dropX - 2.5, dropY + 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Open eyes for morning (8:00), late_morning (10:00), afternoon (15:00), early_evening (18:00), sunset (20:00)
    let pupilOffsetX = -3.6;
    let pupilOffsetY = -3.8;
    let eyelidCoverage = 0; // 0 = wide open, 0.48 = heavy drooping lids, 0.65 = half-asleep

    if (phaseId === 'morning') {
      // 8:00 Morning: Looking curiously to the right side, wide open
      pupilOffsetX = 4.6;
      pupilOffsetY = -1.0;
      eyelidCoverage = 0;
    } else if (phaseId === 'late_morning') {
      // 10:00 Late Morning: Classic mischievous glance up-left
      pupilOffsetX = -3.6;
      pupilOffsetY = -3.8;
      eyelidCoverage = 0;
    } else if (phaseId === 'afternoon') {
      // 15:00 Afternoon: Calm gaze turned upward into the distance
      pupilOffsetX = 0.8;
      pupilOffsetY = -5.6;
      eyelidCoverage = 0.22;
    } else if (phaseId === 'early_evening') {
      // 18:00 Early Evening: Heavy dreamy eyelids
      pupilOffsetX = -1.5;
      pupilOffsetY = 1.5;
      eyelidCoverage = 0.48;
    } else if (phaseId === 'sunset') {
      // 20:00 Sunset: Half-closed sleepy eyes
      pupilOffsetX = -1.0;
      pupilOffsetY = 2.8;
      eyelidCoverage = 0.64;
    }

    for (let i = 0; i < eyes.length; i++) {
      const eye = eyes[i];
      ctx.save();
      ctx.translate(eye.x, eye.y);
      ctx.rotate(eye.rot);

      ctx.fillStyle = 'rgba(217, 119, 6, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // White sclera
      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.5, 19.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Clip inside the eye for iris, pupil, and upper drooping eyelid
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.5, 19.5, 0, 0, Math.PI * 2);
      ctx.clip();

      // Deep slate-blue iris
      ctx.fillStyle = '#1E3A5F';
      ctx.beginPath();
      ctx.ellipse(pupilOffsetX, pupilOffsetY, 9.2, 11.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ink-black pupil
      ctx.fillStyle = '#14110F';
      ctx.beginPath();
      ctx.ellipse(pupilOffsetX, pupilOffsetY, 6.4, 8.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle catchlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pupilOffsetX - 2.6, pupilOffsetY - 3.4, 2.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pupilOffsetX + 2.4, pupilOffsetY + 3.0, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Heavy / sleepy upper eyelid when eyelidCoverage > 0
      if (eyelidCoverage > 0) {
        const lidBottomY = -19.5 + eyelidCoverage * 36;
        ctx.fillStyle = pal.discStops[2];
        ctx.beginPath();
        ctx.rect(-20, -24, 40, lidBottomY + 24);
        ctx.fill();

        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.moveTo(-17, lidBottomY);
        ctx.quadraticCurveTo(0, lidBottomY + 4, 17, lidBottomY);
        ctx.stroke();
      }

      ctx.restore(); // end eye clip

      // Eye outline
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15.5, 19.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Eyebrows per phase
    ctx.save();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 6.0;
    const browLift = phaseId === 'morning' ? -8 : phaseId === 'early_evening' || phaseId === 'sunset' ? 4 : 0;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 42 + browLift);
    ctx.quadraticCurveTo(cx - 32, cy - 60 + browLift, cx - 13, cy - 46 + browLift);
    ctx.moveTo(cx + 13, cy - 46 + browLift);
    ctx.quadraticCurveTo(cx + 32, cy - 60 + browLift, cx + 50, cy - 42 + browLift);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Signature Chubby Orange Nose (consistent across the entire day)
  ctx.save();
  const noseX = cx;
  const noseY = cy - 1;
  const noseRx = 20.5;
  const noseRy = 15.5;

  ctx.fillStyle = 'rgba(180, 50, 10, 0.32)';
  ctx.beginPath();
  ctx.ellipse(noseX, noseY + 4, noseRx * 0.98, noseRy * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();

  const noseGrad = ctx.createRadialGradient(noseX - 5, noseY - 5, 2, noseX, noseY, noseRx);
  noseGrad.addColorStop(0, '#FDE68A');
  noseGrad.addColorStop(0.32, '#FB923C');
  noseGrad.addColorStop(0.78, '#EA580C');
  noseGrad.addColorStop(1, '#C2410C');

  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(noseX, noseY, noseRx, noseRy, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 251, 235, 0.65)';
  ctx.beginPath();
  ctx.ellipse(noseX - 5.5, noseY - 5.0, 6.8, 3.8, -0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.ellipse(noseX, noseY, noseRx, noseRy, 0, -0.25, Math.PI + 0.25);
  ctx.stroke();
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.ellipse(noseX, noseY, noseRx, noseRy, 0, Math.PI + 0.2, Math.PI * 2 - 0.2);
  ctx.stroke();
  ctx.restore();

  // 6. Sunset (20:00) Special Details: Fairytale Nightcap ("Noční čepice") & Horizon Mist Veil
  if (phaseId === 'sunset') {
    ctx.save();
    // Cozy blue-indigo fairytale nightcap with golden stars/dots and a fluffy pom-pom
    const capGrad = ctx.createLinearGradient(cx - 75, cy - 115, cx + 95, cy - 30);
    capGrad.addColorStop(0, '#312E81');
    capGrad.addColorStop(0.55, '#4338CA');
    capGrad.addColorStop(1, '#1E1B4B');

    ctx.fillStyle = capGrad;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 5.0;

    // Nightcap cone drooping to the right
    ctx.beginPath();
    ctx.moveTo(cx - 86, cy - 58);
    ctx.bezierCurveTo(cx - 55, cy - 142, cx + 45, cy - 148, cx + 118, cy - 64);
    ctx.bezierCurveTo(cx + 86, cy - 52, cx + 52, cy - 78, cx + 72, cy - 54);
    ctx.quadraticCurveTo(cx - 5, cy - 92, cx - 86, cy - 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft cream brim cuff of the nightcap
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.moveTo(cx - 92, cy - 52);
    ctx.quadraticCurveTo(cx - 5, cy - 94, cx + 82, cy - 50);
    ctx.quadraticCurveTo(cx + 88, cy - 66, cx + 76, cy - 72);
    ctx.quadraticCurveTo(cx - 5, cy - 110, cx - 84, cy - 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fluffy round pom-pom at the tip of the nightcap
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(cx + 122, cy - 58, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft purple-crimson horizon mist across the lower rim so the sun looks like it is sinking behind the horizon
    const horizonGrad = ctx.createLinearGradient(0, cy + 38, 0, cy + discR + 18);
    horizonGrad.addColorStop(0, 'rgba(88, 28, 135, 0)');
    horizonGrad.addColorStop(0.55, 'rgba(88, 28, 135, 0.42)');
    horizonGrad.addColorStop(1, 'rgba(46, 16, 101, 0.72)');
    ctx.fillStyle = horizonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, discR + 4, 0.12, Math.PI - 0.12);
    ctx.closePath();
    ctx.fill();

    // Subtle horizon cloud line
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.55)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx - 118, cy + 72);
    ctx.lineTo(cx + 118, cy + 72);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function bakeLensFlareSprite(
  size: number,
  innerColor: string,
  midColor: string,
  ringColor: string
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreenCanvas(size, size);
  if (!ctx) return canvas;

  const r = size * 0.5;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.55, midColor);
  grad.addColorStop(0.84, ringColor);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

/**
 * Pre-renders a Ladovské fairytale cloud onto an offscreen canvas.
 * Distant clouds (`isForeground = false`) have softer contours; foreground occluder clouds
 * (`isForeground = true`) have bold dark-brown `#231409` ink outlines, warm golden sunlit
 * top rims, and creamy-pearly gouache bodies that partially cover the sun in 3D parallax.
 */
function bakeFairytaleCloudSprite(
  width: number,
  height: number,
  isForeground: boolean,
  variant: 0 | 1
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreenCanvas(width, height);
  if (!ctx) return canvas;

  const cx = width * 0.5;
  const cy = height * 0.56;
  const ink = isForeground ? '#231409' : '#4A3525';

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Golden-amber outer halo when the cloud passes in front of the sun
  if (isForeground) {
    const rimGrad = ctx.createRadialGradient(0, -14, 24, 0, -4, width * 0.48);
    rimGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    rimGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.18)');
    rimGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(0, -6, width * 0.47, height * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const bodyGrad = ctx.createLinearGradient(0, -height * 0.42, 0, height * 0.32);
  if (isForeground) {
    bodyGrad.addColorStop(0, '#FFFDF5');
    bodyGrad.addColorStop(0.35, '#FDF6E2');
    bodyGrad.addColorStop(0.75, '#E9DFC8');
    bodyGrad.addColorStop(1, '#CBD5E1');
  } else {
    bodyGrad.addColorStop(0, 'rgba(255, 251, 235, 0.85)');
    bodyGrad.addColorStop(0.6, 'rgba(245, 235, 215, 0.72)');
    bodyGrad.addColorStop(1, 'rgba(214, 211, 209, 0.55)');
  }

  const traceCloudOutline = () => {
    ctx.beginPath();
    if (variant === 0) {
      ctx.moveTo(-118, 26);
      ctx.bezierCurveTo(-148, 24, -154, -12, -120, -22);
      ctx.bezierCurveTo(-116, -54, -74, -68, -44, -48);
      ctx.bezierCurveTo(-22, -84, 36, -86, 56, -46);
      ctx.bezierCurveTo(92, -62, 134, -38, 126, -6);
      ctx.bezierCurveTo(154, 2, 148, 30, 114, 30);
      ctx.bezierCurveTo(48, 36, -48, 36, -118, 26);
    } else {
      ctx.moveTo(-106, 24);
      ctx.bezierCurveTo(-136, 20, -140, -14, -108, -24);
      ctx.bezierCurveTo(-96, -62, -42, -74, -14, -48);
      ctx.bezierCurveTo(14, -78, 68, -70, 82, -34);
      ctx.bezierCurveTo(118, -40, 142, -8, 118, 18);
      ctx.bezierCurveTo(106, 32, -46, 34, -106, 24);
    }
    ctx.closePath();
  };

  traceCloudOutline();
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Sunlit golden-ivory top crest highlight
  ctx.strokeStyle = isForeground ? 'rgba(254, 240, 138, 0.88)' : 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = isForeground ? 6.5 : 4.5;
  ctx.beginPath();
  ctx.arc(variant === 0 ? 6 : -18, -36, 36, Math.PI * 1.08, Math.PI * 1.9);
  ctx.stroke();

  // Internal puffy gouache curls
  ctx.strokeStyle = isForeground ? 'rgba(148, 163, 184, 0.48)' : 'rgba(168, 162, 158, 0.35)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-52, 2, 24, Math.PI * 0.15, Math.PI * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(38, 4, 28, Math.PI * 0.12, Math.PI * 0.85);
  ctx.stroke();

  // Ladovské ink contour & interiorpuff lines
  traceCloudOutline();
  ctx.strokeStyle = ink;
  ctx.lineWidth = isForeground ? 4.2 : 2.8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-44, -16, 22, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(46, -12, 20, Math.PI * 1.2, Math.PI * 1.9);
  ctx.stroke();

  ctx.restore();
  return canvas;
}

/**
 * Pre-renders volumetric diagonal golden sunbeams (God-rays) onto a 512x512 offscreen canvas
 * for the 0.78x parallax sky layer behind the sun.
 */
function bakeVolumetricSunbeamsCanvas(size = 512): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreenCanvas(size, size);
  if (!ctx) return canvas;

  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  // Outer warm golden atmospheric corona halo
  const haloGrad = ctx.createRadialGradient(0, 0, size * 0.14, 0, 0, size * 0.48);
  haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
  haloGrad.addColorStop(0.52, 'rgba(251, 191, 36, 0.18)');
  haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
  ctx.fill();

  const beamAngles = [-0.88, -0.52, -0.18, 0.16, 0.5, 0.84, 2.35, -2.35];
  const beamWidths = [28, 38, 46, 42, 36, 28, 26, 26];

  for (let i = 0; i < beamAngles.length; i++) {
    ctx.save();
    ctx.rotate(beamAngles[i]);
    const w = beamWidths[i];
    const len = size * 0.49;
    const grad = ctx.createLinearGradient(0, 14, 0, len);
    grad.addColorStop(0, 'rgba(254, 249, 195, 0.36)');
    grad.addColorStop(0.55, 'rgba(251, 191, 36, 0.18)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.32, 12);
    ctx.lineTo(-w * 1.45, len);
    ctx.lineTo(w * 1.45, len);
    ctx.lineTo(w * 0.32, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

/**
 * Pre-renders a small Ladovské V-flock of high-flying spring swallows/crows onto a 260x130
 * offscreen canvas that glides in the 1.58x foreground parallax plane around the sun's outer perimeter.
 */
function bakeSpringBirdsCanvas(width = 260, height = 130): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreenCanvas(width, height);
  if (!ctx) return canvas;

  const birds = [
    { x: 58, y: 68, sc: 1.05, tilt: -0.08 },
    { x: 118, y: 44, sc: 1.22, tilt: 0.04 },
    { x: 176, y: 58, sc: 0.95, tilt: 0.11 },
    { x: 218, y: 82, sc: 0.82, tilt: -0.05 },
  ];

  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < birds.length; i++) {
    const b = birds[i];
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.tilt);
    ctx.scale(b.sc, b.sc);

    // Warm golden sunlit top edge
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.quadraticCurveTo(-10, -15, 0, -2);
    ctx.quadraticCurveTo(10, -15, 22, -4);
    ctx.stroke();

    // Bold dark-brown fairytale silhouette
    ctx.strokeStyle = '#231409';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.quadraticCurveTo(-10, -13, 0, 0);
    ctx.quadraticCurveTo(10, -13, 22, -2);
    ctx.stroke();

    ctx.fillStyle = '#231409';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  return canvas;
}

/**
 * Builds and caches all 7 daily keyframe offscreen canvas pairs (`raysCanvas` + `faceCanvas`),
 * multi-plane 3D parallax clouds, volumetric sunbeams, spring birds, and lens flare stamps once at initialization.
 */
export function getSunOffscreenCanvases(): CachedSunCanvases {
  if (cachedSunCanvases) return cachedSunCanvases;

  const keyframes: SunPhaseCanvasPair[] = [];
  for (let i = 0; i < SUN_VISUAL_PHASES.length; i++) {
    const phase = SUN_VISUAL_PHASES[i];
    const { canvas: rCanvas, ctx: rCtx } = createOffscreenCanvas(
      SUN_OFFSCREEN_SIZE,
      SUN_OFFSCREEN_SIZE
    );
    if (rCtx) {
      bakeSunRaysCanvas(rCtx, SUN_OFFSCREEN_SIZE, phase.id);
    }

    const { canvas: fCanvas, ctx: fCtx } = createOffscreenCanvas(
      SUN_OFFSCREEN_SIZE,
      SUN_OFFSCREEN_SIZE
    );
    if (fCtx) {
      bakeSunFaceCanvas(fCtx, SUN_OFFSCREEN_SIZE, phase.id);
    }

    keyframes.push({
      phase,
      raysCanvas: rCanvas,
      faceCanvas: fCanvas,
    });
  }

  const farCloudCanvas = bakeFairytaleCloudSprite(340, 160, false, 0);
  const sunbeamsCanvas = bakeVolumetricSunbeamsCanvas(512);
  const nearCloudCanvasA = bakeFairytaleCloudSprite(380, 184, true, 0);
  const nearCloudCanvasB = bakeFairytaleCloudSprite(350, 172, true, 1);
  const birdsCanvas = bakeSpringBirdsCanvas(260, 130);

  const flareGoldCanvas = bakeLensFlareSprite(
    128,
    'rgba(255, 250, 205, 0.95)',
    'rgba(253, 224, 71, 0.48)',
    'rgba(245, 158, 11, 0.25)'
  );
  const flareAmberCanvas = bakeLensFlareSprite(
    128,
    'rgba(254, 243, 199, 0.9)',
    'rgba(251, 146, 60, 0.52)',
    'rgba(234, 88, 12, 0.28)'
  );
  const flareRoseCanvas = bakeLensFlareSprite(
    128,
    'rgba(255, 237, 213, 0.85)',
    'rgba(249, 115, 22, 0.42)',
    'rgba(225, 29, 72, 0.24)'
  );

  // Classic late_morning (index 2) exposed as default raysCanvas / faceCanvas
  const defaultPair = keyframes[2] || keyframes[0];

  cachedSunCanvases = {
    raysCanvas: defaultPair.raysCanvas,
    faceCanvas: defaultPair.faceCanvas,
    keyframes,
    farCloudCanvas,
    sunbeamsCanvas,
    nearCloudCanvasA,
    nearCloudCanvasB,
    birdsCanvas,
    flareGoldCanvas,
    flareAmberCanvas,
    flareRoseCanvas,
  };
  return cachedSunCanvases;
}

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Smoothly wraps a value into [-halfSpan, +halfSpan] for continuous multi-plane cloud parallax */
function wrapSignedSpan(value: number, halfSpan: number): number {
  const span = halfSpan * 2;
  if (span <= 0.001) return 0;
  const shifted = ((((value + halfSpan) % span) + span) % span) - halfSpan;
  return shifted;
}

interface AmbientStageColor {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

const STAGE_AMBIENT_COLORS: readonly AmbientStageColor[] = [
  { r: 244, g: 162, b: 184, alpha: 0.045 }, // 0. 6:00 Sunrise (rose-lavender morning mist)
  { r: 254, g: 226, b: 112, alpha: 0.038 }, // 1. 8:00 Morning (warm golden yellow)
  { r: 255, g: 215, b: 90, alpha: 0.042 },  // 2. 10:00 Late Morning (sunny gold)
  { r: 255, g: 248, b: 195, alpha: 0.055 }, // 3. 12:00 Noon (bright white-gold glare)
  { r: 251, g: 182, b: 68, alpha: 0.072 },  // 4. 15:00 Afternoon (honey-amber warmth)
  { r: 242, g: 108, b: 48, alpha: 0.115 },  // 5. 18:00 Early Evening (red-orange twilight)
  { r: 190, g: 42, b: 92, alpha: 0.155 },   // 6. 20:00 Sunset (crimson-purple dusk)
];

/**
 * Pure zero-allocation math pass that computes the sun's diegetic 5-minute arc anchor,
 * 7-phase keyframe interpolation indices, 6-plane 3D parallax scrolling:
 *   Plane 1 (0.30x): Distant horizon clouds (`farClouds`)
 *   Plane 2 (0.58x): Mid-sky Ladovské clouds (`nearClouds` — rendered behind the sun so they never cover it)
 *   Plane 3 (0.80x): Volumetric golden sunbeams & corona (`sunbeams`)
 *   Plane 4 (1.00x): Rotating outer sun rays crown (`raysCanvas` + 3D perspective `depthScale`)
 *   Plane 5 (1.24x): 3D convex sun face differential relief (`faceCanvas` shifting relative to rays)
 *   Plane 6 (1.58x & 1.90x): High-flying spring birds on outer perimeter + fast camera lens flares (`flares`)
 */
export function computeSunForegroundState(
  screenWidth: number,
  screenHeight: number,
  cameraX: number,
  cameraY: number,
  gameTimeSeconds: number,
  uiTimeSeconds: number,
  config: SunOverlayConfig,
  outState: SunComputedFrameState
): SunComputedFrameState {
  const effectiveTime =
    config.manualTimeSeconds !== null && Number.isFinite(config.manualTimeSeconds)
      ? clamp(config.manualTimeSeconds, 0, SUN_RUN_DURATION_SECONDS)
      : clamp(gameTimeSeconds || 0, 0, SUN_RUN_DURATION_SECONDS);

  const progress = clamp(effectiveTime / SUN_RUN_DURATION_SECONDS, 0, 1);
  outState.effectiveTimeSeconds = effectiveTime;
  outState.progress = progress;

  // Map 0..1 progress across the 7 daily keyframes (indices 0..6)
  const scaledPhase = progress * (SUN_KEYFRAME_COUNT - 1);
  const idxA = Math.min(SUN_KEYFRAME_COUNT - 1, Math.floor(scaledPhase));
  const idxB = Math.min(SUN_KEYFRAME_COUNT - 1, idxA + 1);
  const rawFraction = scaledPhase - idxA;
  const phaseBlend = smoothstep(0.08, 0.92, rawFraction);

  outState.phaseIndexA = idxA;
  outState.phaseIndexB = idxB;
  outState.phaseBlend = phaseBlend;

  const dominantMeta = SUN_VISUAL_PHASES[rawFraction >= 0.5 ? idxB : idxA];
  outState.activePhaseId = dominantMeta.id;
  outState.activePhaseLabel = dominantMeta.label;
  outState.activeClockLabel = dominantMeta.clockLabel;

  const centerX = screenWidth * 0.5;
  const centerY = screenHeight * 0.5;

  // 1. Diegetic 5-minute arc (0:00 top-left -> 2:30 zenith -> 5:00 top-right)
  const marginX = Math.max(135, Math.min(240, screenWidth * 0.14));
  const anchorX = marginX + progress * Math.max(40, screenWidth - marginX * 2);

  const zenithY = Math.max(96, Math.min(152, screenHeight * 0.135));
  const cornerDropY = Math.max(55, Math.min(130, screenHeight * 0.12));
  const normalizedArc = (progress - 0.5) * 2; // -1 at 0:00, 0 at 2:30, +1 at 5:00
  const anchorY = zenithY + normalizedArc * normalizedArc * cornerDropY;

  outState.anchorX = anchorX;
  outState.anchorY = anchorY;

  // 2. High-Visibility Multi-Plane 3D Parallax Scrolling (responsive to every WASD step across the arena)
  const camCenterX = cameraX + centerX;
  const camCenterY = cameraY + centerY;
  const parallaxStrength = clamp(config.parallaxStrength ?? 1.0, 0, 3.0);

  const maxParallaxX = Math.min(365, screenWidth * 0.27) * parallaxStrength;
  const maxParallaxY = Math.min(225, screenHeight * 0.22) * parallaxStrength;

  // Fast initial response (tanh / 680) + continuous spatial wave (sin / 210) so every WASD step gives unmistakable 3D motion
  const normParallaxX =
    Math.tanh(camCenterX / 680) * 0.68 + Math.sin(camCenterX / 210) * 0.32;
  const normParallaxY =
    Math.tanh(camCenterY / 560) * 0.68 + Math.sin(camCenterY / 185) * 0.32;

  const parallaxOffsetX = -normParallaxX * maxParallaxX;
  const parallaxOffsetY = -normParallaxY * maxParallaxY;

  let sunX = anchorX + parallaxOffsetX;
  let sunY = anchorY + parallaxOffsetY;

  // 3. Repulsive Deadzone around Player at Screen Center (width/2, height/2)
  const deadzoneR = clamp(config.deadzoneRadius ?? 280, 80, 520);
  const softMargin = 75;
  const repulsionOuterR = deadzoneR + softMargin;

  const dx = sunX - centerX;
  let dy = sunY - centerY;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    dy = -1;
  }
  const rawDist = Math.hypot(dx, dy);
  let wasRepelled = false;

  if (rawDist < repulsionOuterR) {
    wasRepelled = rawDist < deadzoneR + 20;
    const normalizedInZone = clamp((repulsionOuterR - rawDist) / repulsionOuterR, 0, 1);
    const targetDist =
      rawDist < deadzoneR
        ? deadzoneR + (1 - rawDist / Math.max(1, deadzoneR)) * 18
        : rawDist + normalizedInZone * normalizedInZone * softMargin * 0.65;

    const dirAngle = Math.atan2(dy, dx);
    const curvedAngle = dirAngle + Math.sin(dirAngle) * -0.12 * normalizedInZone;
    sunX = centerX + Math.cos(curvedAngle) * targetDist;
    sunY = centerY + Math.sin(curvedAngle) * targetDist;
  }

  const edgePadding = 72;
  sunX = clamp(sunX, edgePadding, Math.max(edgePadding, screenWidth - edgePadding));
  sunY = clamp(sunY, edgePadding, Math.max(edgePadding, screenHeight - edgePadding));

  const postClampDx = sunX - centerX;
  const postClampDy = sunY - centerY;
  const postClampDist = Math.hypot(postClampDx, postClampDy);
  if (postClampDist < deadzoneR && postClampDist > 0.001) {
    const pushScale = deadzoneR / postClampDist;
    sunX = centerX + postClampDx * pushScale;
    sunY = centerY + postClampDy * pushScale;
    wasRepelled = true;
  }

  const finalDist = Math.hypot(sunX - centerX, sunY - centerY);
  outState.x = sunX;
  outState.y = sunY;
  outState.distanceToCenter = finalDist;
  outState.wasRepelled = wasRepelled;

  // 3b. PLANE 4 & PLANE 5: 3D Perspective Depth Scale (0.89..1.13) & 1.24x Differential Convex Face Parallax
  const depthScale = clamp(
    1.0 + (parallaxOffsetY / Math.max(1, maxParallaxY || 1)) * 0.115 * Math.min(1.6, parallaxStrength),
    0.89,
    1.13
  );
  outState.depthScale = depthScale;

  // Plane 5 (1.24x): The convex sun face shifts up to ±20px relative to the rays crown (Plane 4, 1.00x),
  // creating a dramatic 3D spherical relief where the face turns toward/away from the camera as you move!
  outState.faceOffsetX = clamp(
    parallaxOffsetX * 0.115 + Math.sin(camCenterX / 170) * 6.5 * parallaxStrength,
    -20,
    20
  );
  outState.faceOffsetY = clamp(
    parallaxOffsetY * 0.115 + Math.cos(camCenterY / 160) * 5.2 * parallaxStrength,
    -15,
    15
  );

  // 4. Proximity Alpha Fade (0.25 near the deadzone -> 0.95 toward the outer edges)
  const fadeFactor = smoothstep(deadzoneR, deadzoneR + 210, finalDist);
  outState.alpha = 0.25 + fadeFactor * (0.95 - 0.25);

  // Ray rotation slows down gently in the late afternoon & evening
  const afternoonSlowdown = 1 - smoothstep(0.55, 1.0, progress) * 0.65;
  outState.raysRotationRad = (uiTimeSeconds || 0) * 0.14 * afternoonSlowdown;
  outState.renderSizePx = Math.round(
    SUN_OFFSCREEN_SIZE * (config.sunScale ?? 0.62) * depthScale
  );

  const halfSunR = outState.renderSizePx * 0.5;
  const tUi = uiTimeSeconds || 0;

  // PLANE 1 (0.30x Parallax): Deep Horizon Sky Clouds drifting slowly behind the sun
  // Anchored to the sky arc with 0.30x parallax so they visibly lag behind the 1.00x sun by 0.70x!
  const plane1BaseX = anchorX + parallaxOffsetX * 0.3;
  const plane1BaseY = anchorY + parallaxOffsetY * 0.3;
  const farDriftX = -camCenterX * 0.16 * parallaxStrength + tUi * 5.0;
  const farDriftY = -camCenterY * 0.11 * parallaxStrength;

  const far0 = outState.farClouds[0];
  far0.x = plane1BaseX - 155 + wrapSignedSpan(farDriftX, 260);
  far0.y = plane1BaseY - 42 + wrapSignedSpan(farDriftY, 68);
  far0.width = 285;
  far0.height = 134;
  far0.alpha = outState.alpha * 0.64;

  const far1 = outState.farClouds[1];
  far1.x = plane1BaseX + 165 + wrapSignedSpan(farDriftX + 180, 260);
  far1.y = plane1BaseY + 32 + wrapSignedSpan(farDriftY - 34, 68);
  far1.width = 255;
  far1.height = 120;
  far1.alpha = outState.alpha * 0.58;

  // PLANE 2 (0.58x Parallax): Mid-Sky Ladovské Cumulus Clouds framing the sun from behind
  // Rendered BEHIND the sun so they never occlude the sun's rays or face while providing strong 0.58x vs 1.00x shear!
  const plane2BaseX = anchorX + parallaxOffsetX * 0.58;
  const plane2BaseY = anchorY + parallaxOffsetY * 0.58;
  const midDriftX = -camCenterX * 0.28 * parallaxStrength - tUi * 7.5;
  const midDriftY = -camCenterY * 0.19 * parallaxStrength;

  const near0 = outState.nearClouds[0];
  near0.x = plane2BaseX - 135 + wrapSignedSpan(midDriftX + 45, 290);
  near0.y = plane2BaseY + 46 + wrapSignedSpan(midDriftY + 14, 78);
  near0.width = Math.round(325 * depthScale);
  near0.height = Math.round(156 * depthScale);
  near0.alpha = clamp(outState.alpha * 0.86, 0.24, 0.88);

  const near1 = outState.nearClouds[1];
  near1.x = plane2BaseX + 140 + wrapSignedSpan(midDriftX - 150, 290);
  near1.y = plane2BaseY - 36 + wrapSignedSpan(midDriftY - 22, 78);
  near1.width = Math.round(295 * depthScale);
  near1.height = Math.round(142 * depthScale);
  near1.alpha = clamp(outState.alpha * 0.82, 0.22, 0.84);

  // PLANE 3 (0.80x Parallax): Volumetric Golden Sunbeams & Corona lagging slightly behind the sun disc
  outState.sunbeamsX = sunX - parallaxOffsetX * 0.22;
  outState.sunbeamsY = sunY - parallaxOffsetY * 0.22 + 10;
  outState.sunbeamsTiltRad = clamp(
    (centerX - sunX) / Math.max(360, screenWidth * 0.75) + normParallaxX * 0.22,
    -0.48,
    0.48
  );

  // PLANE 6A (1.58x Parallax): High-flying spring swallows gliding around the outer sky perimeter
  // Kept strictly outside the sun's disc radius so they never cover the sun's face!
  const birdsShiftX =
    -camCenterX * 0.48 * parallaxStrength + parallaxOffsetX * 0.58 + tUi * 20;
  const birdsShiftY =
    -camCenterY * 0.32 * parallaxStrength + parallaxOffsetY * 0.58 + Math.sin(tUi * 1.8) * 10;
  let birdX = sunX + wrapSignedSpan(birdsShiftX - 180, 360);
  let birdY = sunY + wrapSignedSpan(birdsShiftY + 110, 140);
  const birdDx = birdX - sunX;
  const birdDy = birdY - sunY;
  const birdDist = Math.hypot(birdDx, birdDy);
  const minBirdClearance = halfSunR + 68;
  if (birdDist < minBirdClearance) {
    const bAng = birdDist > 0.001 ? Math.atan2(birdDy, birdDx) : 0.65;
    birdX = sunX + Math.cos(bAng) * minBirdClearance;
    birdY = sunY + Math.sin(bAng) * minBirdClearance;
  }
  outState.birdsFlock.x = birdX;
  outState.birdsFlock.y = birdY;
  outState.birdsFlock.width = Math.round(186 * depthScale);
  outState.birdsFlock.height = Math.round(93 * depthScale);
  outState.birdsFlock.alpha = clamp(outState.alpha * 0.9, 0.25, 0.9);

  // 5. Smoothly interpolated 7-stage atmospheric tint
  const ambA = STAGE_AMBIENT_COLORS[idxA];
  const ambB = STAGE_AMBIENT_COLORS[idxB];
  outState.ambientR = Math.round(ambA.r + (ambB.r - ambA.r) * phaseBlend);
  outState.ambientG = Math.round(ambA.g + (ambB.g - ambA.g) * phaseBlend);
  outState.ambientB = Math.round(ambA.b + (ambB.b - ambA.b) * phaseBlend);
  outState.ambientAlpha = ambA.alpha + (ambB.alpha - ambA.alpha) * phaseBlend;

  // PLANE 6B (1.90x Parallax Camera Lens): Fast Optical Lens Flares along the optical axis opposite the sun
  const flareParallaxX = -normParallaxX * maxParallaxX * 1.9;
  const flareParallaxY = -normParallaxY * maxParallaxY * 1.9;

  const axisX = centerX - sunX + flareParallaxX * 0.55;
  const axisY = centerY - sunY + flareParallaxY * 0.55;
  const eveningFactor = smoothstep(0.45, 1.0, progress);

  const flare1 = outState.flares[0];
  flare1.x = sunX + axisX * 0.72;
  flare1.y = sunY + axisY * 0.72;
  flare1.radius = 46;
  flare1.alpha = 0.16 + eveningFactor * 0.06;
  flare1.tint = 'gold';

  const flare2 = outState.flares[1];
  flare2.x = sunX + axisX * 1.22;
  flare2.y = sunY + axisY * 1.22;
  flare2.radius = 30;
  flare2.alpha = 0.14 + eveningFactor * 0.05;
  flare2.tint = 'amber';

  const flare3 = outState.flares[2];
  flare3.x = sunX + axisX * 1.66;
  flare3.y = sunY + axisY * 1.66;
  flare3.radius = 66;
  flare3.alpha = 0.11 + eveningFactor * 0.06;
  flare3.tint = 'rose';

  return outState;
}

export type SunRenderPassMode = 'all' | 'sky_disc' | 'lens_only';

/**
 * Renders the Stage 1 Multi-Plane 3D Sun Foreground Overlay (6 depth planes via offscreen cache):
 *   1. Plane 1 (0.30x): Distant horizon clouds (`farCloudCanvas`)
 *   2. Plane 2 (0.58x): Mid-sky Ladovské cumulus clouds (`nearCloudCanvasA/B`, behind the sun)
 *   3. Plane 3 (0.80x): Volumetric golden sunbeams & corona (`sunbeamsCanvas`, behind the sun)
 *   4. Plane 4 (1.00x): Rotating outer sun rays crown (`raysCanvas` + 3D perspective `depthScale`)
 *   5. Plane 5 (1.24x): 3D convex sun face relief (`faceCanvas`, shifting relative to rays crown)
 *   6. Plane 6 (1.58x & 1.90x): Perimeter spring swallows (`birdsCanvas`) + camera lens flares (`flare*Canvas`)
 *
 * Uses strictly pre-rendered offscreen canvases (`drawImage`) for zero frame-time lag,
 * and guarantees that the sun's rays and face are NEVER occluded by clouds or other elements.
 */
export function renderSunForegroundOverlay(
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number,
  cameraX: number,
  cameraY: number,
  gameTimeSeconds: number,
  uiTimeSeconds: number,
  config: SunOverlayConfig,
  outState: SunComputedFrameState,
  passMode: SunRenderPassMode = 'all'
): SunComputedFrameState {
  if (passMode !== 'lens_only') {
    computeSunForegroundState(
      screenWidth,
      screenHeight,
      cameraX,
      cameraY,
      gameTimeSeconds,
      uiTimeSeconds,
      config,
      outState
    );
  }

  const buffers = getSunOffscreenCanvases();
  const halfSize = outState.renderSizePx * 0.5;

  ctx.save();

  if (passMode === 'all' || passMode === 'sky_disc') {
    // PLANE 1 (0.30x Parallax): Distant Ladovské horizon clouds drifting slowly in the deep sky
    for (let i = 0; i < outState.farClouds.length; i++) {
      const fc = outState.farClouds[i];
      ctx.globalAlpha = fc.alpha;
      ctx.drawImage(
        buffers.farCloudCanvas,
        fc.x - fc.width * 0.5,
        fc.y - fc.height * 0.5,
        fc.width,
        fc.height
      );
    }

    // PLANE 2 (0.58x Parallax): Mid-sky Ladovské clouds framing the sun from behind (never covering the sun!)
    for (let i = 0; i < outState.nearClouds.length; i++) {
      const nc = outState.nearClouds[i];
      const cloudStamp = nc.variant === 0 ? buffers.nearCloudCanvasA : buffers.nearCloudCanvasB;
      ctx.globalAlpha = nc.alpha;
      ctx.drawImage(
        cloudStamp,
        nc.x - nc.width * 0.5,
        nc.y - nc.height * 0.5,
        nc.width,
        nc.height
      );
    }

    // PLANE 3 (0.80x Parallax): Volumetric golden sunbeams (God-rays) & outer corona radiating behind the sun
    ctx.save();
    ctx.translate(outState.sunbeamsX, outState.sunbeamsY);
    ctx.rotate(outState.sunbeamsTiltRad);
    ctx.globalAlpha = outState.alpha * 0.82;
    const beamSize = outState.renderSizePx * 1.52;
    ctx.drawImage(
      buffers.sunbeamsCanvas,
      -beamSize * 0.5,
      -beamSize * 0.5,
      beamSize,
      beamSize
    );
    ctx.restore();

    // PLANE 6A (1.58x Parallax): High-flying spring swallows gliding around the outer sky perimeter
    const bf = outState.birdsFlock;
    ctx.globalAlpha = bf.alpha;
    ctx.drawImage(
      buffers.birdsCanvas,
      bf.x - bf.width * 0.5,
      bf.y - bf.height * 0.5,
      bf.width,
      bf.height
    );

    // PLANE 4 (1.00x Parallax): Rotating Sun Rays Crown + PLANE 5 (1.24x Parallax): 3D Convex Sun Face
    // Rendered AFTER all clouds, beams, and birds so NOTHING ever covers the sun!
    const pairA = buffers.keyframes[outState.phaseIndexA] || buffers.keyframes[0];
    const pairB = buffers.keyframes[outState.phaseIndexB] || pairA;
    const blend = outState.phaseBlend;
    const isCrossfading =
      outState.phaseIndexA !== outState.phaseIndexB && blend > 0.01 && blend < 0.99;

    const faceDrawX = outState.x + outState.faceOffsetX - halfSize;
    const faceDrawY = outState.y + outState.faceOffsetY - halfSize;

    if (!isCrossfading) {
      const activePair = blend >= 0.5 ? pairB : pairA;
      ctx.globalAlpha = outState.alpha;

      ctx.save();
      ctx.translate(outState.x, outState.y);
      ctx.rotate(outState.raysRotationRad);
      ctx.drawImage(
        activePair.raysCanvas,
        -halfSize,
        -halfSize,
        outState.renderSizePx,
        outState.renderSizePx
      );
      ctx.restore();

      ctx.drawImage(
        activePair.faceCanvas,
        faceDrawX,
        faceDrawY,
        outState.renderSizePx,
        outState.renderSizePx
      );
    } else {
      const alphaA = outState.alpha * (1 - blend);
      const alphaB = outState.alpha * blend;

      ctx.save();
      ctx.translate(outState.x, outState.y);
      ctx.rotate(outState.raysRotationRad);
      ctx.globalAlpha = alphaA;
      ctx.drawImage(
        pairA.raysCanvas,
        -halfSize,
        -halfSize,
        outState.renderSizePx,
        outState.renderSizePx
      );
      ctx.globalAlpha = alphaB;
      ctx.drawImage(
        pairB.raysCanvas,
        -halfSize,
        -halfSize,
        outState.renderSizePx,
        outState.renderSizePx
      );
      ctx.restore();

      ctx.globalAlpha = alphaA;
      ctx.drawImage(
        pairA.faceCanvas,
        faceDrawX,
        faceDrawY,
        outState.renderSizePx,
        outState.renderSizePx
      );
      ctx.globalAlpha = alphaB;
      ctx.drawImage(
        pairB.faceCanvas,
        faceDrawX,
        faceDrawY,
        outState.renderSizePx,
        outState.renderSizePx
      );
    }
  }

  if (passMode === 'all' || passMode === 'lens_only') {
    // LAYER 7 (Camera Lens): Diegetic 7-phase atmospheric sunlight tint
    if (outState.ambientAlpha > 0.005) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(${outState.ambientR}, ${outState.ambientG}, ${outState.ambientB}, ${outState.ambientAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, screenWidth, screenHeight);
    }

    // LAYER 8 (1.80x Parallax Camera Lens): Fast Optical Lens Flares
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < outState.flares.length; i++) {
      const f = outState.flares[i];
      const stamp =
        f.tint === 'gold'
          ? buffers.flareGoldCanvas
          : f.tint === 'amber'
            ? buffers.flareAmberCanvas
            : buffers.flareRoseCanvas;
      ctx.globalAlpha = f.alpha;
      ctx.drawImage(stamp, f.x - f.radius, f.y - f.radius, f.radius * 2, f.radius * 2);
    }
    ctx.restore();

    // Optional debug visualization of the protective player deadzone ring
    if (config.showDeadzoneDebugRing) {
      ctx.save();
      ctx.strokeStyle = outState.wasRepelled
        ? 'rgba(249, 115, 22, 0.75)'
        : 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 2;
      if (typeof ctx.setLineDash === 'function') {
        ctx.setLineDash([8, 6]);
      }
      ctx.beginPath();
      ctx.arc(screenWidth * 0.5, screenHeight * 0.5, config.deadzoneRadius, 0, Math.PI * 2);
      ctx.stroke();
      if (typeof ctx.setLineDash === 'function') {
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }

  ctx.restore();
  return outState;
}

