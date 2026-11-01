/**
 * Storybook Illumination Renderer (Ladovské kvašové svícení)
 * Handcrafted Josef Lada fairytale lighting pipeline:
 * - 2D Lightmap Pipeline (Multiplicative Blending): Final Color = Scene Color * Lightmap Color
 * - Dynamic 2D Vector Shadow Geometry (Vertex Raycasting / Extruded Shadow Volumes)
 * - Stepped Gouache Halos (3-4 tonal bands) & Pen Stippling rims
 * - 2D Surface Relief / Normal Map Diffuse Shading: I = max(0, N · L)
 * - Seasonal snow color shifts (midday warm-white -> night pastel indigo)
 * - Cottage window butter-yellow trapezoids with mullions
 * - Boží muka & Grandfather's stove hearth warmth
 * - Fairytale Silhouette Inversion (chalk-white woodcut contours)
 *
 * Designed to strictly maintain 60 FPS via cached offscreen buffers (ADR 0002 & ADR 0003).
 */

import { COLORS } from '../constants';
import type { DynamicLightSource, ShadowZone, LightOccluder } from '../game/storybookLighting';
import { computeOccluderSegments, computeSurfaceReliefHighlight } from '../game/storybookLighting';

let lightBufferCanvas: HTMLCanvasElement | null = null;
let lightBufferCtx: CanvasRenderingContext2D | null = null;

let singleLightCanvas: HTMLCanvasElement | null = null;
let singleLightCtx: CanvasRenderingContext2D | null = null;

let stipplePatternCanvas: HTMLCanvasElement | null = null;
let stipplePattern: CanvasPattern | null = null;

/**
 * Initializes a cached 128x128 procedural pen-and-ink stipple pattern
 * mimicking Josef Lada's signature stippling and ink hatching.
 */
function getStipplePattern(mainCtx: CanvasRenderingContext2D): CanvasPattern | null {
  if (stipplePattern) return stipplePattern;
  if (typeof document === 'undefined') return null;

  stipplePatternCanvas = document.createElement('canvas');
  stipplePatternCanvas.width = 128;
  stipplePatternCanvas.height = 128;
  const pctx = stipplePatternCanvas.getContext('2d');
  if (!pctx) return null;

  pctx.clearRect(0, 0, 128, 128);

  // Procedural ink dots and tiny hatching marks
  pctx.fillStyle = 'rgba(25, 20, 15, 0.72)';
  for (let i = 0; i < 90; i++) {
    const x = (i * 37 + (i % 5) * 11) % 128;
    const y = (i * 73 + (i % 7) * 13) % 128;
    const size = 1.0 + (i % 3) * 0.5;
    pctx.beginPath();
    pctx.arc(x, y, size, 0, Math.PI * 2);
    pctx.fill();

    // Occasional tiny ink crosshatch tick
    if (i % 6 === 0) {
      pctx.strokeStyle = 'rgba(25, 20, 15, 0.65)';
      pctx.lineWidth = 1.2;
      pctx.beginPath();
      pctx.moveTo(x - 2, y - 2);
      pctx.lineTo(x + 3, y + 2);
      pctx.stroke();
    }
  }

  stipplePattern = mainCtx.createPattern(stipplePatternCanvas, 'repeat');
  return stipplePattern;
}

export const LIGHT_DOWNSCALE_FACTOR = 0.5;

export function getProfileLightFactor(profile?: string): number {
  if (profile === 'performance') return 0.25;
  if (profile === 'fidelity') return 0.5;
  return 0.33; // Default balanced profile (ADR 0029)
}

const radialLightStamps = new Map<string, HTMLCanvasElement>();

/**
 * Pre-rendered 128x128 soft radial light stamps (warm, fire, cold)
 * eliminating per-frame createRadialGradient overhead (ADR 0029).
 */
export function getRadialLightStamp(colorKey: 'warm' | 'fire' | 'cold'): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let canvas = radialLightStamps.get(colorKey);
  if (canvas) return canvas;

  canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const sCtx = canvas.getContext('2d');
  if (!sCtx) return null;

  const grad = sCtx.createRadialGradient(64, 64, 58, 64, 64, 64);
  if (colorKey === 'fire') {
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  } else if (colorKey === 'cold') {
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  } else {
    // warm lamp / petrolejka
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  }

  sCtx.fillStyle = grad;
  sCtx.beginPath();
  sCtx.arc(64, 64, 64, 0, Math.PI * 2);
  sCtx.fill();

  radialLightStamps.set(colorKey, canvas);
  return canvas;
}

/**
 * Ensures the offscreen light composite canvas matches current screen dimensions at downscaled resolution.
 * Achieves 75%-89% fillrate reduction and soft gouache blending.
 */
export function getLightBuffer(
  width: number,
  height: number,
  factor: number = LIGHT_DOWNSCALE_FACTOR
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const scaledWidth = Math.ceil(width * factor);
  const scaledHeight = Math.ceil(height * factor);

  if (typeof document === 'undefined') {
    if (!lightBufferCanvas) {
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        setTransform: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        ellipse: () => {},
        rect: () => {},
        fill: () => {},
        stroke: () => {},
        fillRect: () => {},
        clearRect: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fillStyle: '#000',
        globalCompositeOperation: 'source-over',
      };
      lightBufferCanvas = {
        width: scaledWidth,
        height: scaledHeight,
        getContext: () => mockCtx,
      } as any;
      lightBufferCtx = mockCtx;
    }
    if (lightBufferCanvas.width !== scaledWidth || lightBufferCanvas.height !== scaledHeight) {
      lightBufferCanvas.width = scaledWidth;
      lightBufferCanvas.height = scaledHeight;
    }
    return { canvas: lightBufferCanvas, ctx: lightBufferCtx! };
  }

  if (!lightBufferCanvas) {
    lightBufferCanvas = document.createElement('canvas');
    lightBufferCtx = lightBufferCanvas.getContext('2d');
  }
  if (lightBufferCanvas.width !== scaledWidth || lightBufferCanvas.height !== scaledHeight) {
    lightBufferCanvas.width = scaledWidth;
    lightBufferCanvas.height = scaledHeight;
  }
  if (!lightBufferCtx) return null;
  return { canvas: lightBufferCanvas, ctx: lightBufferCtx };
}

/**
 * Reusable scratch buffer for rendering an individual light source with shadow volume cutouts.
 */
function getSingleLightBuffer(requiredDim: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null;
  const dim = Math.min(1600, Math.max(256, Math.ceil(requiredDim)));
  if (!singleLightCanvas) {
    singleLightCanvas = document.createElement('canvas');
    singleLightCtx = singleLightCanvas.getContext('2d');
  }
  if (singleLightCanvas.width < dim || singleLightCanvas.height < dim) {
    singleLightCanvas.width = dim;
    singleLightCanvas.height = dim;
  }
  if (!singleLightCtx) return null;
  return { canvas: singleLightCanvas, ctx: singleLightCtx };
}

let bloomCanvas: HTMLCanvasElement | null = null;

/**
 * Pre-rendered 64x64 incandescent bloom sprite to avoid per-light radial gradient allocations.
 */
function getBloomSprite(): HTMLCanvasElement | null {
  if (bloomCanvas) return bloomCanvas;
  if (typeof document === 'undefined') return null;
  bloomCanvas = document.createElement('canvas');
  bloomCanvas.width = 64;
  bloomCanvas.height = 64;
  const bCtx = bloomCanvas.getContext('2d');
  if (!bCtx) return null;

  const grad = bCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 250, 220, 1.0)');
  grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.49)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  bCtx.fillStyle = grad;
  bCtx.beginPath();
  bCtx.arc(32, 32, 32, 0, Math.PI * 2);
  bCtx.fill();
  return bloomCanvas;
}

let cachedVignetteGrad: CanvasGradient | null = null;
let cachedVignetteCtx: CanvasRenderingContext2D | null = null;
let cachedVignetteWidth = 0;
let cachedVignetteHeight = 0;

/**
 * Computes winter snow ground tint according to day phase and Kuráž.
 */
export function getStorybookSnowColor(dayPhaseId: string, kurazRatio: number): string {
  if (dayPhaseId === 'noon' || dayPhaseId === 'afternoon') {
    if (kurazRatio < 0.25) {
      // Bleached winter glare
      return '#FFF8E8';
    }
    // Idyllic midday creamy warm-white
    return '#FFFDF5';
  }

  if (dayPhaseId === 'dusk') {
    // Dreamy sunset pastel lavender-indigo
    return '#433858';
  }

  if (dayPhaseId === 'night') {
    // Deep romantic pastel indigo
    return '#222543';
  }

  if (dayPhaseId === 'midnight') {
    // Crisp star-dusted periwinkle midnight
    return '#171A31';
  }

  // Dawn (Svítání)
  return '#FBE9DC';
}

/**
 * Returns the cached ambient color for the current day phase.
 */
function getAmbientLightmapRgb(
  dayPhaseId: string,
  kurazRatio: number,
  isWinter = true
): string {
  if (dayPhaseId === 'noon' || dayPhaseId === 'afternoon') {
    if (kurazRatio < 0.25) {
      // Glaring winter haze
      return '#EBE8DC';
    }
    return '#FFFFFF';
  }

  if (dayPhaseId === 'dusk') {
    return '#70628E';
  }

  if (dayPhaseId === 'night') {
    if (isWinter) {
      return '#343E62';
    }
    return '#3A3652';
  }

  if (dayPhaseId === 'midnight') {
    return '#1C2241';
  }

  // Dawn
  return '#D4AFA8';
}

/**
 * Parses hex color or returns fallback RGB.
 */
function parseHexToRgb(color: string): number {
  if (color.startsWith('#') && color.length === 7) {
    return Number.parseInt(color.slice(1), 16);
  }
  return 0xFEF08A; // Default warm butter
}

/**
 * Renders a single Stepped Gouache Halo onto an offscreen scratch buffer:
 * 3-4 soft, painterly stepped tone bands with a stippled ink rim.
 */
function renderSteppedGouacheHaloToBuffer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  baseColor: string,
  stipplePat: CanvasPattern | null,
  intensity = 1.0
): void {
  if (radius <= 0 || intensity <= 0) return;

  const rgb = parseHexToRgb(baseColor);
  const red = (rgb >> 16) & 0xFF;
  const green = (rgb >> 8) & 0xFF;
  const blue = rgb & 0xFF;
  const coreR = radius * 0.38;
  const midR = radius * 0.70;
  const haloR = radius * 0.92;

  ctx.save();

  // 1. Core Band (brightest inner gouache pool: 0% - 38%)
  ctx.fillStyle = `rgba(${Math.min(255, red + 30)}, ${Math.min(255, green + 30)}, ${Math.min(255, blue + 30)}, ${0.98 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Midtone Band (warm gouache tone: 38% - 70%)
  ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.75 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, midR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Halo Periphery Band (soft stepped transition: 70% - 92%)
  ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.45 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();

  // 4. Outer rim fade (92% - 100%)
  const stamp = getRadialLightStamp(
    red > 200 && green < 100 ? 'fire' : blue > 200 && red < 100 ? 'cold' : 'warm'
  );
  if (stamp) {
    ctx.save();
    ctx.globalAlpha = (ctx.globalAlpha || 1.0) * intensity;
    ctx.drawImage(stamp, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
  } else {
    const grad = ctx.createRadialGradient(cx, cy, haloR, cx, cy, radius);
    grad.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${0.45 * intensity})`);
    grad.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Stippled ink edge
  if (stipplePat && radius > 40) {
    ctx.globalAlpha = 0.26 * intensity;
    ctx.strokeStyle = stipplePat;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function isOccluderInLightRange(lightX: number, lightY: number, reach: number, occ: LightOccluder): boolean {
  const occRadius = occ.radius || (occ.width ? Math.max(occ.width, occ.height || 0) * 0.75 : 40);
  const dx = occ.x - lightX;
  const dy = occ.y - lightY;
  const maxDistance = reach + occRadius;
  return dx * dx + dy * dy <= maxDistance * maxDistance;
}

/**
 * Cuts shadow volumes straight into the light scratch buffer.  The simulation
 * helper returns friendly polygon objects for tests and gameplay queries, but
 * constructing those objects in the render loop would reintroduce GC pressure.
 */
function cutShadowVolumesIntoLightBuffer(
  ctx: CanvasRenderingContext2D,
  lightX: number,
  lightY: number,
  lightRadius: number,
  occ: LightOccluder,
  halfSize: number
): void {
  const segments = computeOccluderSegments(occ);
  const extrudeDistance = Math.max(lightRadius * 2.2, 500);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const nx = -(seg.y2 - seg.y1);
    const ny = seg.x2 - seg.x1;
    const midX = (seg.x1 + seg.x2) * 0.5 - lightX;
    const midY = (seg.y1 + seg.y2) * 0.5 - lightY;
    if (nx * midX + ny * midY > 0) continue;

    const d1x = seg.x1 - lightX;
    const d1y = seg.y1 - lightY;
    const d1Length = Math.hypot(d1x, d1y) || 1;
    const d2x = seg.x2 - lightX;
    const d2y = seg.y2 - lightY;
    const d2Length = Math.hypot(d2x, d2y) || 1;

    ctx.beginPath();
    ctx.moveTo(seg.x1 - lightX + halfSize, seg.y1 - lightY + halfSize);
    ctx.lineTo(seg.x2 - lightX + halfSize, seg.y2 - lightY + halfSize);
    ctx.lineTo(seg.x2 + (d2x / d2Length) * extrudeDistance - lightX + halfSize, seg.y2 + (d2y / d2Length) * extrudeDistance - lightY + halfSize);
    ctx.lineTo(seg.x1 + (d1x / d1Length) * extrudeDistance - lightX + halfSize, seg.y1 + (d1y / d1Length) * extrudeDistance - lightY + halfSize);
    ctx.closePath();
    ctx.fill();
  }

  // Keep the light from being composited into a solid cottage/tree itself.
  const occX = occ.x - lightX + halfSize;
  const occY = occ.y - lightY + halfSize;
  if (occ.width && occ.height) {
    ctx.fillRect(occX - occ.width * 0.5, occY - occ.height * 0.5, occ.width, occ.height);
  } else if (occ.radius) {
    ctx.beginPath();
    ctx.arc(occX, occY, occ.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws the iconic Josef Lada butter-yellow cottage window light trapezoid on snow.
 */
export function drawCottageWindowLight(
  ctx: CanvasRenderingContext2D,
  cottageX: number,
  cottageY: number,
  scale: number,
  flip: number,
  time = 0
): void {
  ctx.save();
  ctx.translate(cottageX, cottageY);
  ctx.scale(flip * scale, scale);

  const flicker = Math.sin(time * 3 + cottageX * 0.05) * 0.03;
  const alpha = 0.48 + flicker;

  // Butter-yellow light trapezoid poured out from window onto the snowbank
  const grad = ctx.createLinearGradient(0, -10, 0, 65);
  grad.addColorStop(0, `rgba(254, 240, 138, ${alpha})`);
  grad.addColorStop(0.55, `rgba(245, 158, 11, ${alpha * 0.7})`);
  grad.addColorStop(1, 'rgba(217, 119, 6, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(16, -10);
  ctx.lineTo(44, 65);
  ctx.lineTo(-44, 65);
  ctx.closePath();
  ctx.fill();

  // Window mullions (tušový okenní kříž vržený na sníh)
  ctx.strokeStyle = 'rgba(25, 20, 15, 0.28)';
  ctx.lineWidth = 2;
  // Vertical mullion shadow
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, 60);
  ctx.stroke();
  // Horizontal mullion shadow
  ctx.beginPath();
  ctx.moveTo(-18, 25);
  ctx.lineTo(18, 25);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a traditional Czech Boží muka (roadside shrine) with a glowing eternal candle.
 */
export function drawBoziMukaDecor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  time = 0,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Stone base pedestal
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(-14, -8, 28, 8);
  ctx.fill();
  ctx.stroke();

  // Slender stone shaft
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.rect(-7, -48, 14, 40);
  ctx.fill();
  ctx.stroke();

  // Shingle roof capital with lantern niche
  ctx.fillStyle = COLORS.woodDark;
  ctx.beginPath();
  ctx.rect(-12, -70, 24, 22);
  ctx.fill();
  ctx.stroke();

  // Arched niche for candle
  ctx.fillStyle = isNight ? '#FEF08A' : '#475569';
  ctx.beginPath();
  ctx.arc(0, -58, 6, Math.PI, 0);
  ctx.rect(-6, -58, 12, 8);
  ctx.fill();

  // Candle flame
  if (isNight) {
    const flicker = Math.sin(time * 12 + x) * 1.5;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(0, -57 + flicker * 0.3, 2.5, 4 + flicker * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(0, -57, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Little pitched roof
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.moveTo(-16, -70);
  ctx.lineTo(0, -84);
  ctx.lineTo(16, -70);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Small iron cross atop
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -84);
  ctx.lineTo(0, -96);
  ctx.moveTo(-5, -91);
  ctx.lineTo(5, -91);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws low winter sun long directional ink shadows behind architecture.
 */
export function drawArchitecturalSunShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  sunAngle = 0.75
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(25, 20, 30, 0.22)';
  ctx.beginPath();
  ctx.moveTo(x - width * 0.5, y);
  ctx.lineTo(x + width * 0.5, y);
  ctx.lineTo(x + width * 0.5 + Math.cos(sunAngle) * height * 1.2, y + Math.sin(sunAngle) * height * 1.2);
  ctx.lineTo(x - width * 0.5 + Math.cos(sunAngle) * height * 1.2, y + Math.sin(sunAngle) * height * 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws 2D directional surface relief bevel highlights & ink depth crescent on sprites:
 * Uses Lambertian diffuse reflection I = max(0, N · L) from virtual 3D point light positions.
 */
export function drawNormalMappedReliefRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  lightSources: DynamicLightSource[],
  options?: { bevelWidth?: number; rimAlpha?: number; maxLights?: number }
): void {
  const relief = computeSurfaceReliefHighlight(x, y, radius, lightSources, options?.maxLights);
  if (!relief || relief.intensity <= 0.05) return;

  const bevelW = options?.bevelWidth ?? Math.max(2.5, radius * 0.16);
  const alpha = (options?.rimAlpha ?? 0.65) * relief.intensity;

  ctx.save();

  // 1. Directional rim highlight along facing surface bevel
  const lightAngle = relief.dominantDirAngle;
  ctx.strokeStyle = relief.color;
  ctx.globalAlpha = Math.min(1.0, alpha);
  ctx.lineWidth = bevelW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius - bevelW * 0.5), lightAngle - Math.PI * 0.35, lightAngle + Math.PI * 0.35);
  ctx.stroke();

  // 2. Volumetric depth ink shadow along opposite bevel
  const oppAngle = lightAngle + Math.PI;
  ctx.strokeStyle = 'rgba(15, 12, 10, 0.45)';
  ctx.globalAlpha = Math.min(0.6, alpha * 0.8);
  ctx.lineWidth = bevelW * 0.9;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius - bevelW * 0.5), oppAngle - Math.PI * 0.28, oppAngle + Math.PI * 0.28);
  ctx.stroke();

  ctx.restore();
}

/**
 * Main 2D Storybook Lighting Pipeline:
 *
 * 1. Base Pass: The game renders world sprites under flat neutral lighting (already in ctx).
 * 2. Light Pass: Clears screen-sized lightmap texture with ambient color (moonlight / twilight).
 *    Each dynamic light source draws onto this texture using additive blending ('lighter').
 *    Dynamic 2D shadow geometry extrudes occluder edges to prevent light from passing through solid walls.
 * 3. Composite Pass: Multiplicative Blending over scene: Final Color = Scene Color * Lightmap Color.
 * 4. Luminous Bloom Pass: Gentle warm screen glow on brightest flame cores.
 */
export function renderStorybookLightingComposite(
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number,
  camera: { x: number; y: number },
  lightSources: DynamicLightSource[],
  dayPhaseId: string,
  kurazRatio: number,
  isWinter = true,
  shadowZones: ShadowZone[] = [],
  occluders: LightOccluder[] = [],
  quality: 'fidelity' | 'balanced' | 'performance' | 'off' = 'balanced',
  enabled = true
): void {
  if (!enabled || quality === 'off') {
    return;
  }

  const isNightPhase =
    dayPhaseId === 'dusk' ||
    dayPhaseId === 'night' ||
    dayPhaseId === 'midnight' ||
    dayPhaseId === 'dawn';

  // Daytime with high Kuráž requires only the subtle atmosphere; no darkness veil
  if (!isNightPhase && kurazRatio >= 0.25) {
    return;
  }

  const lightFactor = getProfileLightFactor(quality);
  const buf = getLightBuffer(screenWidth, screenHeight, lightFactor);
  if (!buf) return;
  const { canvas: lCanvas, ctx: lCtx } = buf;
  // Clear offscreen light buffer and apply downscaling transform (0.33x balanced / 0.25x performance)
  lCtx.save();
  lCtx.setTransform(1, 0, 0, 1, 0, 0);
  lCtx.clearRect(0, 0, lCanvas.width, lCanvas.height);
  lCtx.setTransform(lightFactor, 0, 0, lightFactor, 0, 0);

  // -------------------------------------------------------------
  // 1. LIGHT PASS: Ambient fill
  // -------------------------------------------------------------
  lCtx.fillStyle = getAmbientLightmapRgb(dayPhaseId, kurazRatio, isWinter);
  lCtx.fillRect(0, 0, screenWidth, screenHeight);

  // Daytime cast shadows on daylight lightmap
  if (!isNightPhase && shadowZones.length > 0) {
    lCtx.save();
    lCtx.fillStyle = 'rgba(180, 190, 215, 0.45)';
    for (let i = 0; i < shadowZones.length; i++) {
      const sz = shadowZones[i];
      const sx = sz.x - camera.x;
      const sy = sz.y - camera.y;
      if (sx + sz.radius < 0 || sx - sz.radius > screenWidth || sy + sz.radius < 0 || sy - sz.radius > screenHeight) {
        continue;
      }
      lCtx.beginPath();
      lCtx.ellipse(sx, sy, sz.radius, sz.radius * 0.65, 0, 0, Math.PI * 2);
      lCtx.fill();
    }
    lCtx.restore();
  }

  // -------------------------------------------------------------
  // 2. LIGHT PASS: Dynamic Light Sources with Vector Shadow Volumes
  // -------------------------------------------------------------
  const stipple = getStipplePattern(lCtx);

  for (let i = 0; i < lightSources.length; i++) {
    const src = lightSources[i];
    const reach = src.radius * (src.intensity ?? 1);
    if (reach <= 0) continue;

    const sx = src.x - camera.x;
    const sy = src.y - camera.y;

    // Viewport cull with safety padding
    if (sx + reach < -80 || sx - reach > screenWidth + 80 || sy + reach < -80 || sy - reach > screenHeight + 80) {
      continue;
    }

    // Fidelity keeps all shadows. Balanced bounds expensive shadow-volume work;
    // performance keeps light halos but skips dynamic occlusion shadows.
    const castShadows = quality === 'fidelity' || (quality === 'balanced' && i < 12);
    let hasNearbyOccluder = false;
    if (castShadows && occluders.length > 0) {
      for (let j = 0; j < occluders.length; j++) {
        if (isOccluderInLightRange(src.x, src.y, reach, occluders[j])) {
          hasNearbyOccluder = true;
          break;
        }
      }
    }

    if (!hasNearbyOccluder) {
      // Direct rendering into 0.5x lightmap without clearRect and scratch buffer copying!
      lCtx.save();
      lCtx.globalCompositeOperation = 'lighter';
      renderSteppedGouacheHaloToBuffer(
        lCtx,
        sx,
        sy,
        reach,
        src.color || '#FEF08A',
        stipple,
        src.intensity ?? 1
      );
      lCtx.restore();
      continue;
    }

    // Render individual light source with shadow volume cutouts downscaled by lightFactor
    const lightSize = Math.ceil(reach * 2 + 10);
    const scaledLightSize = Math.ceil(lightSize * lightFactor);
    const sBuf = getSingleLightBuffer(scaledLightSize);

    if (sBuf) {
      const { canvas: sCanvas, ctx: sCtx } = sBuf;
      const halfSize = lightSize * 0.5;

      // Clear scratch light canvas (downscaled)
      sCtx.clearRect(0, 0, scaledLightSize, scaledLightSize);

      sCtx.save();
      sCtx.scale(lightFactor, lightFactor);

      // Render stepped gouache halo into scratch buffer
      renderSteppedGouacheHaloToBuffer(
        sCtx,
        halfSize,
        halfSize,
        reach,
        src.color || '#FEF08A',
        stipple,
        src.intensity ?? 1
      );

      // If there are occluders, extrude vector shadow volumes and erase light from blocked zones
      sCtx.save();
      sCtx.globalCompositeOperation = 'destination-out';
      sCtx.fillStyle = '#000000';

      for (let j = 0; j < occluders.length; j++) {
        const occ = occluders[j];
        if (isOccluderInLightRange(src.x, src.y, reach, occ)) {
          cutShadowVolumesIntoLightBuffer(sCtx, src.x, src.y, reach, occ, halfSize);
        }
      }
      sCtx.restore();
      sCtx.restore();

      // Additively composite the masked light onto the main lightmap
      lCtx.save();
      lCtx.globalCompositeOperation = 'lighter';
      lCtx.drawImage(
        sCanvas,
        0,
        0,
        scaledLightSize,
        scaledLightSize,
        sx - halfSize,
        sy - halfSize,
        lightSize,
        lightSize
      );
      lCtx.restore();
    }
  }

  lCtx.restore();

  // -------------------------------------------------------------
  // 3. COMPOSITE PASS: Multiplicative Blending
  // Final Color = Scene Color * Lightmap Color
  // -------------------------------------------------------------
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(lCanvas, 0, 0, lCanvas.width, lCanvas.height, 0, 0, screenWidth, screenHeight);
  ctx.restore();

  // -------------------------------------------------------------
  // 4. LUMINOUS BLOOM PASS: Warm Incandescent Glow for Flame Cores
  // -------------------------------------------------------------
  if (isNightPhase) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const bloomSprite = getBloomSprite();
    for (let i = 0; i < lightSources.length; i++) {
      const src = lightSources[i];
      const reach = src.radius * (src.intensity ?? 1);
      if (reach <= 0) continue;

      const sx = src.x - camera.x;
      const sy = src.y - camera.y;

      if (sx + reach < 0 || sx - reach > screenWidth || sy + reach < 0 || sy - reach > screenHeight) {
        continue;
      }

      const coreR = reach * 0.32;
      const intensity = src.intensity ?? 1;

      if (bloomSprite) {
        ctx.globalAlpha = Math.min(1.0, 0.45 * intensity);
        ctx.drawImage(bloomSprite, sx - coreR, sy - coreR, coreR * 2, coreR * 2);
      } else {
        const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreR);
        glowGrad.addColorStop(0, `rgba(255, 250, 220, ${0.45 * intensity})`);
        glowGrad.addColorStop(0.55, `rgba(245, 158, 11, ${0.22 * intensity})`);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, coreR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 5. CRITICAL KURÁŽ FEAR VIGNETTE & TREMBLING INK CONTOURS
  // -------------------------------------------------------------
  if (kurazRatio < 0.25) {
    ctx.save();
    ctx.strokeStyle = 'rgba(25, 20, 15, 0.40)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    const t = performance.now() * 0.012;

    // Jittering vignette pen corners
    ctx.moveTo(10, 10 + Math.sin(t) * 4);
    ctx.lineTo(85, 10 + Math.cos(t) * 3);
    ctx.moveTo(screenWidth - 10, 10 + Math.sin(t * 1.2) * 4);
    ctx.lineTo(screenWidth - 85, 10);
    ctx.moveTo(10, screenHeight - 10 + Math.cos(t * 1.5) * 4);
    ctx.lineTo(85, screenHeight - 10);
    ctx.moveTo(screenWidth - 10, screenHeight - 10);
    ctx.lineTo(screenWidth - 85, screenHeight - 10 + Math.sin(t) * 4);
    ctx.stroke();

    // Darkening edge fear wash (cached on screen resize / context change)
    if (
      !cachedVignetteGrad ||
      cachedVignetteCtx !== ctx ||
      cachedVignetteWidth !== screenWidth ||
      cachedVignetteHeight !== screenHeight
    ) {
      cachedVignetteCtx = ctx;
      cachedVignetteWidth = screenWidth;
      cachedVignetteHeight = screenHeight;
      cachedVignetteGrad = ctx.createRadialGradient(
        screenWidth * 0.5,
        screenHeight * 0.5,
        screenHeight * 0.35,
        screenWidth * 0.5,
        screenHeight * 0.5,
        Math.hypot(screenWidth, screenHeight) * 0.52
      );
      cachedVignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      cachedVignetteGrad.addColorStop(1, 'rgba(12, 10, 20, 0.42)');
    }
    ctx.fillStyle = cachedVignetteGrad;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    ctx.restore();
  }
}

const eyeGlowStamps = new Map<string, HTMLCanvasElement>();

function getEyeGlowStamp(hexColor: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let stamp = eyeGlowStamps.get(hexColor);
  if (stamp) return stamp;

  stamp = document.createElement('canvas');
  stamp.width = 64;
  stamp.height = 64;
  const sCtx = stamp.getContext('2d');
  if (!sCtx) return null;

  const grad = sCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.28, hexColor);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.beginPath();
  sCtx.arc(32, 32, 30, 0, Math.PI * 2);
  sCtx.fill();

  eyeGlowStamps.set(hexColor, stamp);
  return stamp;
}

const EMISSIVE_DEVIL_IDS = new Set<string>([
  'cert',
  'certik',
  'pekelnicek',
  'rarach',
  'sazovy_rarach',
  'krvavy_rarach',
  'pekelny_cert',
  'cert_sekac',
  'plivnik',
  'polni_plivnik',
  'ohnivy_muz',
  'ohnivy_pes',
  'ohniva_kobyla',
  'ohnivy_sudlicka',
  'pekelny_roj_sazovniku',
]);

/**
 * Returns true if the enemy is a devil/fiery demon that glows with its full body in the dark
 * (rendered above the night lightmap without casting ground light circles).
 */
export function isEmissiveDevil(enemyOrId?: string | { id?: string; category?: string } | null): boolean {
  if (!enemyOrId) return false;
  if (typeof enemyOrId === 'string') return EMISSIVE_DEVIL_IDS.has(enemyOrId);
  return (!!enemyOrId.id && EMISSIVE_DEVIL_IDS.has(enemyOrId.id)) || enemyOrId.category === 'devils';
}

/**
 * Returns the signature glowing eye color for an enemy in night arenas based on its folklore category.
 */
export function getEnemyNightEyeColor(enemy: any): string {
  const id = enemy?.id || '';
  if (enemy?.nightWispColor) return enemy.nightWispColor;
  if (id === 'bludicka') return '#22D3EE';
  if (id === 'jiskrivec') return '#FACC15';

  // Devils: bright sulfur-gold eyes
  if (EMISSIVE_DEVIL_IDS.has(id)) return '#FACC15';

  // Undead: spectral emerald or crimson-ruby
  if (id === 'krvavy_kostlivec' || id === 'morana') return '#F43F5E';
  if (
    id === 'skeleton' ||
    id === 'kostlivec' ||
    id === 'skeleton_scythe' ||
    id === 'kostlivec_kosa' ||
    id === 'umrlec' ||
    id === 'pisar' ||
    id === 'hrobnik' ||
    id === 'mlynar_duch' ||
    id === 'bila_pani' ||
    id === 'bezhlavy_rytir' ||
    id === 'zbrojnos'
  ) {
    return '#34D399';
  }

  // Beasts, hounds, bailiffs & brigands: fiery crimson
  if (
    id === 'cerny_pes' ||
    id === 'cerny_vlkodlak' ||
    id === 'drab' ||
    id === 'pekelny_drab' ||
    id === 'zbojnik' ||
    id === 'obrneny_zbojnik' ||
    id === 'mlynar'
  ) {
    return '#EF4444';
  }

  // Night wraiths, witches & nightmares: mystic violet or amber
  if (
    id === 'klekanice' ||
    id === 'nocni_mura' ||
    id === 'bubak' ||
    id === 'vrchni_carodejnice' ||
    id === 'carodejnice_stara' ||
    id === 'carodejnice_koste' ||
    id === 'carodejnice_zaspalka'
  ) {
    return '#C084FC';
  }

  // Frost & water spooks
  if (
    id === 'mrazovy_skritek' ||
    id === 'jezinka_mraziva' ||
    id === 'mrazivy_obr' ||
    id === 'tajici_snehulak' ||
    id === 'snehulak' ||
    id === 'ledovi_muzi'
  ) {
    return '#38BDF8';
  }
  if (
    id === 'vodnicek' ||
    id === 'hastrman' ||
    id === 'kalny_hastrman' ||
    id === 'topivec' ||
    id === 'zaba' ||
    id === 'ropucha' ||
    id === 'rusalka'
  ) {
    return '#A3E635';
  }

  // Hejkalové, forest spooks & default nocturnal creatures: warm amber-gold
  return '#FBBF24';
}

/**
 * Post-lightmap emissive pass for Night Arenas (Stages 2, 4, 6 and any night phase):
 * 1. Full-body self-illuminated devils (Čerti, Rarášci, Čertíci) are re-rendered above the
 *    multiplicative shadow layer so their whole body shines in the dark without casting ground light.
 * 2. All living enemies in the dark receive category-colored glowing eyes (plus colorful luminescence
 *    for wisp swarms) using pre-baked radial stamps with zero per-frame allocations.
 */
export function renderNightEmissiveEntitiesPass(
  ctx: CanvasRenderingContext2D,
  enemies: any[] | undefined,
  camera: {
    x: number;
    y: number;
    viewLeft: number;
    viewTop: number;
    viewRight: number;
    viewBottom: number;
    zoom?: number;
  },
  dayPhaseId: string,
  time = 0
): number {
  if (!enemies || enemies.length === 0) return 0;
  if (dayPhaseId !== 'dusk' && dayPhaseId !== 'night' && dayPhaseId !== 'midnight') {
    return 0;
  }

  const nightStrength = dayPhaseId === 'dusk' ? 0.68 : 0.96;
  const { viewLeft, viewTop, viewRight, viewBottom } = camera;
  let renderedCount = 0;

  ctx.save();
  if (camera.zoom && camera.zoom !== 1) {
    ctx.scale(camera.zoom, camera.zoom);
  }
  ctx.translate(-camera.x, -camera.y);

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (!enemy || enemy.dead || enemy.isDefeated) continue;
    if (enemy._crowWaveOwner && !enemy._crowWaveActive) continue;

    const r = Math.max(10, enemy.radius || 20);
    if (
      enemy.x + r + 24 < viewLeft ||
      enemy.x - r - 24 > viewRight ||
      enemy.y + r + 24 < viewTop ||
      enemy.y - r - 24 > viewBottom
    ) {
      continue;
    }

    const id = enemy.id || '';
    const isDevil = isEmissiveDevil(id);

    // 1. Full-body self-luminous devils: draw their body above the night shadow pass
    //    without adding any ground light source.
    if (isDevil && typeof enemy.draw === 'function') {
      const devilStamp = getEyeGlowStamp('#EF4444');
      if (devilStamp) {
        const auraR = r * 1.45;
        ctx.globalAlpha = 0.26 * nightStrength;
        ctx.drawImage(devilStamp, enemy.x - auraR, enemy.y - r * 0.4 - auraR, auraR * 2, auraR * 2);
      }
      ctx.globalAlpha = 0.88 * nightStrength;
      enemy.draw(ctx);
      renderedCount++;
    }

    // 2. Colorful wisp swarm luminescence for Bludičky & Jiskřivci
    const eyeColor = getEnemyNightEyeColor(enemy);
    const stamp = getEyeGlowStamp(eyeColor);
    const phaseSeed = (enemy.crowWaveIndex ?? i) * 1.37;
    const pulse = 0.82 + Math.sin(time * 4.5 + phaseSeed) * 0.18;

    if (id === 'bludicka' || id === 'jiskrivec') {
      const wispR = r * 1.55 * pulse;
      if (stamp) {
        ctx.globalAlpha = 0.78 * nightStrength;
        ctx.drawImage(stamp, enemy.x - wispR, enemy.y - r * 0.35 - wispR, wispR * 2, wispR * 2);
      }
      ctx.globalAlpha = 0.95 * nightStrength;
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - r * 0.35, Math.max(3.5, r * 0.34), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - r * 0.35, Math.max(1.8, r * 0.16), 0, Math.PI * 2);
      ctx.fill();
      renderedCount++;
      continue;
    }

    // 3. Glowing eyes in the dark for all other nocturnal spooks, undead, hejkalové, hounds & bosses
    // Periodic natural blink so eyes feel alive in the dark
    const blinkWave = Math.sin(time * 2.7 + phaseSeed * 2.1);
    if (blinkWave < -0.94) continue;

    const facingDir = (enemy.lastDx ?? (enemy.vx !== undefined && enemy.vx < 0 ? -1 : 1)) >= 0 ? 1 : -1;
    const isQuadruped = id === 'cerny_pes' || id === 'cerny_vlkodlak' || id === 'ohnivy_pes' || id === 'ohniva_kobyla';
    const isFlying = id === 'vrana' || id === 'carodejnice_koste' || id === 'carodejnice_zaspalka' || id === 'vrchni_carodejnice';
    const headX = enemy.x + facingDir * (isQuadruped ? r * 0.42 : isFlying ? r * 0.18 : r * 0.14);
    const headY = enemy.y - (isQuadruped ? r * 0.48 : isFlying ? r * 0.72 : r * 0.68);
    const eyeSpread = Math.max(2.6, Math.min(7.5, r * (enemy.isBoss || enemy.isMiniboss ? 0.24 : 0.21)));
    const eyeRadius = Math.max(1.6, Math.min(4.2, r * (enemy.isBoss || enemy.isMiniboss ? 0.13 : 0.11))) * pulse;

    const leftEyeX = headX - eyeSpread * 0.5;
    const rightEyeX = headX + eyeSpread * 0.5;

    if (stamp) {
      const haloR = eyeRadius * 3.8;
      ctx.globalAlpha = 0.65 * nightStrength;
      ctx.drawImage(stamp, leftEyeX - haloR, headY - haloR, haloR * 2, haloR * 2);
      ctx.drawImage(stamp, rightEyeX - haloR, headY - haloR, haloR * 2, haloR * 2);
    }

    ctx.globalAlpha = 0.96 * nightStrength;
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(leftEyeX, headY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(rightEyeX, headY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Crisp bright inner pupil spark
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX + facingDir * 0.4, headY - 0.3, eyeRadius * 0.42, 0, Math.PI * 2);
    ctx.arc(rightEyeX + facingDir * 0.4, headY - 0.3, eyeRadius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    renderedCount++;
  }

  ctx.restore();
  return renderedCount;
}

