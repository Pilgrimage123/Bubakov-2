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
import type { DynamicLightSource, ShadowZone, LightOccluder, ShadowPolygon } from '../game/storybookLighting';
import { computeShadowVolume, computeSurfaceReliefHighlight } from '../game/storybookLighting';

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
 * Returns RGB tuple for ambient lightmap color according to day phase.
 */
function getAmbientLightmapRgb(
  dayPhaseId: string,
  kurazRatio: number,
  isWinter = true
): { r: number; g: number; b: number; hex: string } {
  if (dayPhaseId === 'noon' || dayPhaseId === 'afternoon') {
    if (kurazRatio < 0.25) {
      // Glaring winter haze
      return { r: 235, g: 232, b: 220, hex: '#EBE8DC' };
    }
    return { r: 255, g: 255, b: 255, hex: '#FFFFFF' };
  }

  if (dayPhaseId === 'dusk') {
    const scale = kurazRatio < 0.25 ? 0.8 : 1.0;
    return {
      r: Math.round(112 * scale),
      g: Math.round(98 * scale),
      b: Math.round(142 * scale),
      hex: '#70628E',
    };
  }

  if (dayPhaseId === 'night') {
    const scale = kurazRatio < 0.25 ? 0.75 : 1.0;
    if (isWinter) {
      return {
        r: Math.round(52 * scale),
        g: Math.round(62 * scale),
        b: Math.round(98 * scale),
        hex: '#343E62',
      };
    }
    return {
      r: Math.round(58 * scale),
      g: Math.round(54 * scale),
      b: Math.round(82 * scale),
      hex: '#3A3652',
    };
  }

  if (dayPhaseId === 'midnight') {
    const scale = kurazRatio < 0.25 ? 0.7 : 1.0;
    return {
      r: Math.round(28 * scale),
      g: Math.round(34 * scale),
      b: Math.round(65 * scale),
      hex: '#1C2241',
    };
  }

  // Dawn
  const scale = kurazRatio < 0.25 ? 0.85 : 1.0;
  return {
    r: Math.round(212 * scale),
    g: Math.round(175 * scale),
    b: Math.round(168 * scale),
    hex: '#D4AFA8',
  };
}

/**
 * Parses hex color or returns fallback RGB.
 */
function parseHexToRgb(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('#') && color.length === 7) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };
  }
  return { r: 254, g: 240, b: 138 }; // Default warm butter
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
  const coreR = radius * 0.38;
  const midR = radius * 0.70;
  const haloR = radius * 0.92;

  ctx.save();

  // 1. Core Band (brightest inner gouache pool: 0% - 38%)
  ctx.fillStyle = `rgba(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)}, ${0.98 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Midtone Band (warm gouache tone: 38% - 70%)
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.75 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, midR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Halo Periphery Band (soft stepped transition: 70% - 92%)
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.45 * intensity})`;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();

  // 4. Outer rim fade (92% - 100%)
  const stamp = getRadialLightStamp(
    rgb.r > 200 && rgb.g < 100 ? 'fire' : rgb.b > 200 && rgb.r < 100 ? 'cold' : 'warm'
  );
  if (stamp) {
    ctx.save();
    ctx.globalAlpha = (ctx.globalAlpha || 1.0) * intensity;
    ctx.drawImage(stamp, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();
  } else {
    const grad = ctx.createRadialGradient(cx, cy, haloR, cx, cy, radius);
    grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.45 * intensity})`);
    grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
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
  const ambient = getAmbientLightmapRgb(dayPhaseId, kurazRatio, isWinter);
  lCtx.fillStyle = ambient.hex;
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
    const nearbyOccluders: LightOccluder[] = [];
    if (castShadows && occluders.length > 0) {
      for (let j = 0; j < occluders.length; j++) {
        const occ = occluders[j];
        const occRad = occ.radius || (occ.width ? Math.max(occ.width, occ.height || 0) * 0.75 : 40);
        if (Math.hypot(occ.x - src.x, occ.y - src.y) <= reach + occRad) {
          nearbyOccluders.push(occ);
        }
      }
    }

    if (nearbyOccluders.length === 0) {
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

      for (let j = 0; j < nearbyOccluders.length; j++) {
        const occ = nearbyOccluders[j];
        const shadowVols = computeShadowVolume(src.x, src.y, reach, occ);

        for (let k = 0; k < shadowVols.length; k++) {
          const poly = shadowVols[k];
          sCtx.beginPath();
          // Transform world coordinates to scratch buffer relative coordinates
          sCtx.moveTo(poly.p1.x - src.x + halfSize, poly.p1.y - src.y + halfSize);
          sCtx.lineTo(poly.p2.x - src.x + halfSize, poly.p2.y - src.y + halfSize);
          sCtx.lineTo(poly.e2.x - src.x + halfSize, poly.e2.y - src.y + halfSize);
          sCtx.lineTo(poly.e1.x - src.x + halfSize, poly.e1.y - src.y + halfSize);
          sCtx.closePath();
          sCtx.fill();
        }

        // Also mask out the occluder interior so light doesn't shine inside the solid house
        if (occ.width && occ.height) {
          const ox = occ.x - src.x + halfSize;
          const oy = occ.y - src.y + halfSize;
          sCtx.fillRect(ox - occ.width * 0.5, oy - occ.height * 0.5, occ.width, occ.height);
        } else if (occ.radius) {
          const ox = occ.x - src.x + halfSize;
          const oy = occ.y - src.y + halfSize;
          sCtx.beginPath();
          sCtx.arc(ox, oy, occ.radius, 0, Math.PI * 2);
          sCtx.fill();
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
