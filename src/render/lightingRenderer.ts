import type { LightSource } from '../types';

export const LIGHTING_MASK_SCALE = 0.5;

let cachedCanvas: any = null;
let cachedCtx: any = null;

/**
 * Resets the cached offscreen buffer (useful for test isolation or cleanup).
 */
export function resetOffscreenBuffer(): void {
  cachedCanvas = null;
  cachedCtx = null;
}

/**
 * Injects a mock canvas and context for unit testing in headless environments.
 */
export function setOffscreenBufferForTesting(canvas: any, ctx: any): void {
  cachedCanvas = canvas;
  cachedCtx = ctx;
}

/**
 * Returns or allocates the offscreen canvas buffer, resized to target dimensions.
 */
export function getOrCreateOffscreenBuffer(
  viewportWidth: number,
  viewportHeight: number
): { canvas: any; ctx: any } | null {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }

  const targetW = Math.max(1, Math.ceil(viewportWidth * LIGHTING_MASK_SCALE));
  const targetH = Math.max(1, Math.ceil(viewportHeight * LIGHTING_MASK_SCALE));

  // If a buffer was already supplied (e.g. testing mock), reuse or update its dimensions
  if (cachedCanvas && cachedCtx) {
    if (cachedCanvas.width !== targetW || cachedCanvas.height !== targetH) {
      cachedCanvas.width = targetW;
      cachedCanvas.height = targetH;
    }
    return { canvas: cachedCanvas, ctx: cachedCtx };
  }

  // Check if browser DOM createElement or OffscreenCanvas is available
  if (typeof document !== 'undefined') {
    cachedCanvas = document.createElement('canvas');
    cachedCanvas.width = targetW;
    cachedCanvas.height = targetH;
    cachedCtx = cachedCanvas.getContext('2d');
  } else if (typeof OffscreenCanvas !== 'undefined') {
    cachedCanvas = new OffscreenCanvas(targetW, targetH);
    cachedCtx = cachedCanvas.getContext('2d');
  } else {
    // Headless environment without mock
    return null;
  }

  if (!cachedCanvas || !cachedCtx) {
    return null;
  }

  return { canvas: cachedCanvas, ctx: cachedCtx };
}

/**
 * Resolves the atmospheric ambient darkness color for the active level theme.
 */
export function getAmbientColor(ambientDarkness: number, theme?: string): string {
  const alpha = Math.max(0, Math.min(1, ambientDarkness));
  if (theme === 'autumn_graveyard' || theme === 'graveyard') {
    return `rgba(20, 16, 28, ${alpha})`;
  }
  if (theme === 'winter') {
    return `rgba(18, 28, 45, ${alpha})`;
  }
  if (theme === 'spring_river') {
    return `rgba(18, 26, 38, ${alpha})`;
  }
  return `rgba(15, 23, 42, ${alpha})`;
}

/**
 * Renders the Josef Lada stylized 2D lighting mask:
 * 1. Skips completely if ambientDarkness <= 0.05 (Noon / Dawn) for optimal CPU/GPU budget.
 * 2. Draws the dark ambient night layer onto an offscreen canvas at 0.5x resolution.
 * 3. Cuts out stepped cel-lit radial rings for all active light sources using 'destination-out'.
 * 4. Optionally adds a warm folk amber halo / ink contour for player lanterns.
 * 5. Blits the offscreen mask over the world onto the primary canvas context.
 */
export function renderLightingMask(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  cam: { x: number; y: number },
  viewportWidth: number,
  viewportHeight: number,
  ambientDarkness: number,
  theme?: string,
  isPerformanceMode?: boolean
): void {
  // Early return for bright daytime phases (Noon / Dawn) or invalid dimensions
  if (ambientDarkness <= 0.05 || viewportWidth <= 0 || viewportHeight <= 0) {
    return;
  }

  const buffer = getOrCreateOffscreenBuffer(viewportWidth, viewportHeight);
  if (!buffer) {
    return;
  }

  const { canvas: offscreenCanvas, ctx: offscreenCtx } = buffer;
  const targetW = offscreenCanvas.width;
  const targetH = offscreenCanvas.height;
  const scale = targetW / Math.max(1, viewportWidth);

  // 1. Clear offscreen canvas
  offscreenCtx.clearRect(0, 0, targetW, targetH);

  // 2. Fill with dark ambient color matching theme
  offscreenCtx.globalCompositeOperation = 'source-over';
  offscreenCtx.fillStyle = getAmbientColor(ambientDarkness, theme);
  offscreenCtx.fillRect(0, 0, targetW, targetH);

  // 3. Cut out lights with 'destination-out'
  offscreenCtx.globalCompositeOperation = 'destination-out';

  for (const light of lights) {
    const intensity = Math.max(0, Math.min(1, light.intensity ?? 1.0));
    if (intensity <= 0 || light.radius <= 0) continue;

    const sx = (light.x - cam.x) * scale;
    const sy = (light.y - cam.y) * scale;
    const sr = light.radius * scale;

    // View-frustum culling on offscreen canvas
    if (sx + sr < 0 || sx - sr > targetW || sy + sr < 0 || sy - sr > targetH) {
      continue;
    }

    if (isPerformanceMode) {
      // Simplified single-pass circular cutout for lightweight devices
      offscreenCtx.fillStyle = `rgba(0, 0, 0, ${0.92 * intensity})`;
      offscreenCtx.beginPath();
      offscreenCtx.arc(sx, sy, sr * 0.88, 0, Math.PI * 2);
      offscreenCtx.fill();
    } else {
      // Josef Lada stepped cel-lit radial rings:
      // Inner bright core (0 -> 0.45r) at full cutout
      // Middle band (0.45r -> 0.75r) at ~60% cutout
      // Outer ring (0.75r -> 1.0r) at ~25% cutout
      const grad = offscreenCtx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      const coreAlpha = 1.0 * intensity;
      const midAlpha = 0.60 * intensity;
      const outerAlpha = 0.25 * intensity;

      grad.addColorStop(0, `rgba(0, 0, 0, ${coreAlpha})`);
      grad.addColorStop(0.45, `rgba(0, 0, 0, ${coreAlpha})`);
      grad.addColorStop(0.451, `rgba(0, 0, 0, ${midAlpha})`);
      grad.addColorStop(0.75, `rgba(0, 0, 0, ${midAlpha})`);
      grad.addColorStop(0.751, `rgba(0, 0, 0, ${outerAlpha})`);
      grad.addColorStop(0.999, `rgba(0, 0, 0, ${outerAlpha})`);
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      offscreenCtx.fillStyle = grad;
      offscreenCtx.beginPath();
      offscreenCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      offscreenCtx.fill();
    }
  }

  // 4. Reset to 'source-over' and render warm amber halo / subtle ink contour for player lantern
  offscreenCtx.globalCompositeOperation = 'source-over';

  if (!isPerformanceMode) {
    for (const light of lights) {
      if (light.kind === 'player_lantern') {
        const intensity = Math.max(0, Math.min(1, light.intensity ?? 1.0));
        if (intensity <= 0 || light.radius <= 0) continue;

        const sx = (light.x - cam.x) * scale;
        const sy = (light.y - cam.y) * scale;
        const sr = light.radius * scale;

        if (sx + sr < 0 || sx - sr > targetW || sy + sr < 0 || sy - sr > targetH) {
          continue;
        }

        // Warm amber glow in the illuminated center
        const haloGrad = offscreenCtx.createRadialGradient(sx, sy, 0, sx, sy, sr * 0.7);
        haloGrad.addColorStop(0, 'rgba(255, 232, 163, 0.12)');
        haloGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.04)');
        haloGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

        offscreenCtx.fillStyle = haloGrad;
        offscreenCtx.beginPath();
        offscreenCtx.arc(sx, sy, sr * 0.7, 0, Math.PI * 2);
        offscreenCtx.fill();

        // Subtle ink/amber contour ring
        offscreenCtx.strokeStyle = 'rgba(217, 119, 6, 0.16)';
        offscreenCtx.lineWidth = Math.max(1, 1.5 * scale);
        offscreenCtx.beginPath();
        offscreenCtx.arc(sx, sy, sr * 0.45, 0, Math.PI * 2);
        offscreenCtx.stroke();
      }
    }
  }

  // 5. Draw offscreen canvas onto the main canvas
  // If the caller has active camera translation (-cam.x, -cam.y),
  // drawing at (cam.x, cam.y) translates back to screen (0, 0).
  const matrix = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const isCamTranslated =
    matrix && Math.abs(matrix.e + cam.x) < 0.01 && Math.abs(matrix.f + cam.y) < 0.01;
  const dstX = isCamTranslated ? cam.x : 0;
  const dstY = isCamTranslated ? cam.y : 0;

  ctx.drawImage(offscreenCanvas, dstX, dstY, viewportWidth, viewportHeight);
}
