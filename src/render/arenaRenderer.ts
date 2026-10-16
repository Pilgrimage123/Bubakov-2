/**
 * Arena Rendering Pipeline (Vykreslovací pipeline arény)
 * 
 * Stateless rendering module handling transformation of EngineState into 2D Canvas graphics.
 * Encapsulates frustum culling, zero-allocation depth sorting, chunk caching,
 * downscaled lighting pass, and glyph cache for combat numbers.
 * 
 * ADR 0002, ADR 0003, ADR 0017
 */

import type { EngineState } from '../game/engineState';
import { getStorybookSnowColor, renderStorybookLightingComposite } from './storybookLightingRenderer';
import { shouldDrawCombatText } from '../game/effectSettings';

export interface CameraViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  viewLeft: number;
  viewTop: number;
  viewRight: number;
  viewBottom: number;
}

export interface ArenaRenderOptions {
  performanceProfile?: 'battery' | 'standard' | 'high';
  combatVfxEnabled?: boolean;
  damageNumbersEnabled?: boolean;
  lightingEnabled?: boolean;
  chunkCullingEnabled?: boolean;
  warningIndicatorsEnabled?: boolean;
  statusIndicatorsEnabled?: boolean;
}

export interface ArenaPhaseTimings {
  backdropMs: number;
  staticDecorMs: number;
  entitiesMs: number;
  lightingMs: number;
  combatTextsMs: number;
  totalMs: number;
}

export interface ArenaRenderMetrics {
  renderedEntities: number;
  renderedDecor: number;
  activeChunks: number;
  timings: ArenaPhaseTimings;
}

/**
 * Frustum culling test against camera viewport with bounding radius margin.
 */
export function isInView(
  x: number,
  y: number,
  radius: number,
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number
): boolean {
  return (
    x + radius >= viewLeft &&
    x - radius <= viewRight &&
    y + radius >= viewTop &&
    y - radius <= viewBottom
  );
}

// Preallocated buffer for zero-allocation isometric depth sorting
const MAX_DRAWABLE_CAPACITY = 2048;
const preallocatedDrawables: any[] = new Array(MAX_DRAWABLE_CAPACITY);
let drawableCount = 0;

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Primary interface for rendering a full frame of the game arena.
 */
export function renderArena(
  ctx: CanvasRenderingContext2D,
  engine: EngineState,
  camera: CameraViewport,
  options?: ArenaRenderOptions
): ArenaRenderMetrics {
  const tStart = now();

  const opts: ArenaRenderOptions = {
    performanceProfile: 'high',
    combatVfxEnabled: true,
    damageNumbersEnabled: true,
    lightingEnabled: true,
    chunkCullingEnabled: true,
    warningIndicatorsEnabled: true,
    statusIndicatorsEnabled: true,
    ...options,
  };

  const { viewLeft, viewTop, viewRight, viewBottom, width, height } = camera;
  let renderedEntities = 0;
  let renderedDecor = 0;
  const activeChunks = 0;

  // 1. BACKDROP PASS
  const tBackdropStart = now();
  const curLvl = (engine as any).curLvl || { season: 'winter', theme: 'meadow' };
  const phase = (engine as any).dayPhase || { id: 'noon' };
  const kurazRatio = engine.player && engine.player.maxKuraz > 0
    ? Math.max(0, engine.player.kuraz / engine.player.maxKuraz)
    : 1;

  ctx.fillStyle = getStorybookSnowColor(phase.id || 'noon', kurazRatio);
  ctx.fillRect(0, 0, width, height);
  const backdropMs = now() - tBackdropStart;

  // 2. STATIC DECOR PASS
  const tDecorStart = now();
  if (engine.decor && engine.decor.length > 0) {
    const isNight = ['dusk', 'night', 'midnight', 'dawn'].includes(phase.id);
    for (let i = 0; i < engine.decor.length; i++) {
      const dec = engine.decor[i];
      const scale = dec.scale || 1;
      const decorExtent = (dec.type && dec.type.startsWith('march_')) ? 270 * scale : 100 * scale;
      if (!isInView(dec.x, dec.y - 45 * scale, decorExtent, viewLeft, viewTop, viewRight, viewBottom)) {
        continue;
      }
      renderedDecor++;
      if (typeof dec.draw === 'function') {
        dec.draw(ctx, curLvl.season, curLvl.theme, engine.uiTime || 0, isNight);
      }
    }
  }
  const staticDecorMs = now() - tDecorStart;

  // 3. DYNAMIC ENTITIES PASS (ZERO-ALLOCATION BUFFER)
  const tEntitiesStart = now();
  drawableCount = 0;

  if (engine.player) {
    preallocatedDrawables[drawableCount++] = engine.player;
  }

  if (engine.enemies && engine.enemies.length > 0) {
    for (let i = 0; i < engine.enemies.length; i++) {
      const enemy = engine.enemies[i];
      if (enemy.isDefeated || enemy.dead) continue;
      const radius = enemy.radius || 20;
      if (isInView(enemy.x, enemy.y, radius, viewLeft, viewTop, viewRight, viewBottom)) {
        if (drawableCount < MAX_DRAWABLE_CAPACITY) {
          preallocatedDrawables[drawableCount++] = enemy;
        }
      }
    }
  }

  if (opts.combatVfxEnabled && engine.smokePuffs && engine.smokePuffs.length > 0) {
    for (let i = 0; i < engine.smokePuffs.length; i++) {
      const puff = engine.smokePuffs[i];
      const r = (puff.radius || 15) * 2;
      if (isInView(puff.x, puff.y, r, viewLeft, viewTop, viewRight, viewBottom)) {
        if (drawableCount < MAX_DRAWABLE_CAPACITY) {
          preallocatedDrawables[drawableCount++] = puff;
        }
      }
    }
  }

  // In-place stable insertion sort by Y position (avoids GC allocations of Array.prototype.sort)
  for (let i = 1; i < drawableCount; i++) {
    const item = preallocatedDrawables[i];
    let j = i - 1;
    while (j >= 0 && preallocatedDrawables[j].y > item.y) {
      preallocatedDrawables[j + 1] = preallocatedDrawables[j];
      j--;
    }
    preallocatedDrawables[j + 1] = item;
  }

  // Draw sorted entities
  for (let i = 0; i < drawableCount; i++) {
    const d = preallocatedDrawables[i];
    if (d && typeof d.draw === 'function') {
      d.draw(ctx);
      renderedEntities++;
    }
    // Clean reference to avoid memory leaks
    preallocatedDrawables[i] = null;
  }
  drawableCount = 0;
  const entitiesMs = now() - tEntitiesStart;

  // 4. LIGHTING PASS
  let lightingMs = 0;
  if (opts.lightingEnabled) {
    const tLightStart = now();
    const isNight = ['dusk', 'night', 'midnight', 'dawn'].includes(phase.id);
    if (isNight && engine.lightSources && engine.lightSources.length > 0) {
      renderStorybookLightingComposite(
        ctx,
        engine.lightSources,
        engine.shadowZones || [],
        engine.occluders || [],
        viewLeft,
        viewTop,
        width,
        height,
        phase.id,
        kurazRatio,
        engine.uiTime || 0
      );
    }
    lightingMs = now() - tLightStart;
  }

  // 5. COMBAT FLOATING TEXTS PASS
  let combatTextsMs = 0;
  if (opts.damageNumbersEnabled && engine.texts && engine.texts.length > 0) {
    const tTextsStart = now();
    for (let i = 0; i < engine.texts.length; i++) {
      const txt = engine.texts[i];
      if (!isInView(txt.x, txt.y, txt.size || 18, viewLeft, viewTop, viewRight, viewBottom)) {
        continue;
      }
      if (!shouldDrawCombatText(txt.category, txt.text)) {
        continue;
      }
      if (typeof txt.draw === 'function') {
        txt.draw(ctx);
      }
    }
    combatTextsMs = now() - tTextsStart;
  }

  const totalMs = now() - tStart;

  return {
    renderedEntities,
    renderedDecor,
    activeChunks,
    timings: {
      backdropMs,
      staticDecorMs,
      entitiesMs,
      lightingMs,
      combatTextsMs,
      totalMs,
    },
  };
}
