/**
 * Storybook Illumination Renderer (Ladovské kvašové svícení)
 * Handcrafted Lada fairytale lighting pipeline:
 * - Stepped Gouache Halos (3-4 tonal bands) & Pen Stippling rims
 * - Seasonal snow color shifts (midday warm-white -> night pastel indigo)
 * - Cottage window butter-yellow trapezoids with mullions
 * - Boží muka & Grandfather's stove hearth warmth
 * - Fairytale Silhouette Inversion (chalk-white woodcut contours)
 *
 * Designed to strictly maintain 60 FPS via cached offscreen buffers (ADR 0002 & ADR 0003).
 */

import { COLORS } from '../constants';
import type { DynamicLightSource, ShadowZone } from '../game/storybookLighting';

let lightBufferCanvas: HTMLCanvasElement | null = null;
let lightBufferCtx: CanvasRenderingContext2D | null = null;

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

/**
 * Ensures the offscreen light composite canvas matches current screen dimensions.
 */
function getLightBuffer(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === 'undefined') return null;
  if (!lightBufferCanvas) {
    lightBufferCanvas = document.createElement('canvas');
    lightBufferCtx = lightBufferCanvas.getContext('2d');
  }
  if (lightBufferCanvas.width !== width || lightBufferCanvas.height !== height) {
    lightBufferCanvas.width = width;
    lightBufferCanvas.height = height;
  }
  if (!lightBufferCtx) return null;
  return { canvas: lightBufferCanvas, ctx: lightBufferCtx };
}

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
 * Renders a single Stepped Gouache Halo:
 * 3-4 soft, painterly stepped tone bands with a stippled ink rim.
 */
function renderSteppedGouacheHalo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  baseColor: string,
  stipplePat: CanvasPattern | null,
  intensity = 1.0
): void {
  if (radius <= 0 || intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  // 1. Core Band (brightest inner gouache pool: 0% - 38%)
  const coreR = radius * 0.38;
  ctx.fillStyle = `rgba(0, 0, 0, ${0.92 * intensity})`;
  ctx.beginPath();
  ctx.arc(x, y, coreR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Midtone Band (warm gouache tone: 38% - 70%)
  const midR = radius * 0.70;
  ctx.fillStyle = `rgba(0, 0, 0, ${0.68 * intensity})`;
  ctx.beginPath();
  ctx.arc(x, y, midR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Halo Periphery Band (soft stepped transition: 70% - 92%)
  const haloR = radius * 0.92;
  ctx.fillStyle = `rgba(0, 0, 0, ${0.40 * intensity})`;
  ctx.beginPath();
  ctx.arc(x, y, haloR, 0, Math.PI * 2);
  ctx.fill();

  // 4. Outer rim fade (92% - 100%)
  ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * intensity})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 5. Procedural Pen Stippling & Gouache Color overlay
  ctx.save();
  ctx.globalAlpha = 0.42 * intensity;
  const colGrad = ctx.createRadialGradient(x, y, coreR, x, y, radius);
  colGrad.addColorStop(0, baseColor);
  colGrad.addColorStop(0.65, baseColor);
  colGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = colGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Stippled ink edge
  if (stipplePat && radius > 40) {
    ctx.globalAlpha = 0.22 * intensity;
    ctx.strokeStyle = stipplePat;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.88, 0, Math.PI * 2);
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
 * Main Composite Pass:
 * Renders the storybook lighting darkness veil and carves out stepped gouache halos.
 */
export function renderStorybookLightingComposite(
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number,
  camera: { x: number; y: number },
  lightSources: DynamicLightSource[],
  dayPhaseId: string,
  kurazRatio: number,
  isWinter = true
): void {
  const isNightPhase =
    dayPhaseId === 'dusk' ||
    dayPhaseId === 'night' ||
    dayPhaseId === 'midnight' ||
    dayPhaseId === 'dawn';

  // Daytime with high Kuráž requires only the subtle atmosphere; no darkness veil
  if (!isNightPhase && kurazRatio >= 0.25) {
    return;
  }

  const buf = getLightBuffer(screenWidth, screenHeight);
  if (!buf) return;
  const { canvas: lCanvas, ctx: lCtx } = buf;

  // Clear offscreen light buffer
  lCtx.clearRect(0, 0, screenWidth, screenHeight);

  // Compute ambient darkness veil color
  let ambientDarkness = 'rgba(0, 0, 0, 0)';
  if (dayPhaseId === 'dusk') {
    ambientDarkness = isWinter ? 'rgba(38, 30, 56, 0.48)' : 'rgba(48, 28, 20, 0.42)';
  } else if (dayPhaseId === 'night') {
    ambientDarkness = isWinter ? 'rgba(22, 28, 48, 0.65)' : 'rgba(25, 20, 35, 0.62)';
  } else if (dayPhaseId === 'midnight') {
    ambientDarkness = isWinter ? 'rgba(12, 16, 32, 0.82)' : 'rgba(15, 15, 24, 0.80)';
  } else if (dayPhaseId === 'dawn') {
    ambientDarkness = 'rgba(45, 30, 35, 0.35)';
  } else if (kurazRatio < 0.25) {
    // Critical Kuráž daytime winter glare wash
    ambientDarkness = 'rgba(255, 248, 230, 0.22)';
  }

  lCtx.fillStyle = ambientDarkness;
  lCtx.fillRect(0, 0, screenWidth, screenHeight);

  // Carve out Stepped Gouache Halos from light sources
  const stipple = getStipplePattern(lCtx);

  for (let i = 0; i < lightSources.length; i++) {
    const src = lightSources[i];
    const reach = src.radius * (src.intensity ?? 1);
    if (reach <= 0) continue;

    // Translate from world coordinates to screen coordinates
    const sx = src.x - camera.x;
    const sy = src.y - camera.y;

    // Viewport cull with safety padding
    if (sx + reach < -50 || sx - reach > screenWidth + 50 || sy + reach < -50 || sy - reach > screenHeight + 50) {
      continue;
    }

    renderSteppedGouacheHalo(lCtx, sx, sy, reach, src.color || '#FEF08A', stipple, src.intensity ?? 1);
  }

  // Draw offscreen composite light buffer directly onto main canvas
  ctx.save();
  ctx.drawImage(lCanvas, 0, 0);

  // Critical Kuráž screen edge jittering ink contours
  if (kurazRatio < 0.25 && !isNightPhase) {
    ctx.strokeStyle = 'rgba(25, 20, 15, 0.35)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const t = performance.now() * 0.01;
    // Four trembling vignette corners
    ctx.moveTo(10, 10 + Math.sin(t) * 4);
    ctx.lineTo(80, 10 + Math.cos(t) * 3);
    ctx.moveTo(screenWidth - 10, 10 + Math.sin(t * 1.2) * 4);
    ctx.lineTo(screenWidth - 80, 10);
    ctx.moveTo(10, screenHeight - 10 + Math.cos(t * 1.5) * 4);
    ctx.lineTo(80, screenHeight - 10);
    ctx.moveTo(screenWidth - 10, screenHeight - 10);
    ctx.lineTo(screenWidth - 80, screenHeight - 10 + Math.sin(t) * 4);
    ctx.stroke();
  }

  ctx.restore();
}
