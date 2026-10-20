/**
 * Arena Rendering Pipeline (Vykreslovací pipeline arény)
 * 
 * Stateless rendering module handling transformation of EngineState into 2D Canvas graphics.
 * Encapsulates frustum culling, zero-allocation depth sorting, chunk caching,
 * downscaled lighting pass, glyph cache for combat numbers, and modular layers.
 * 
 * ADR 0002, ADR 0003, ADR 0017, ADR 0020
 */

import type { EngineState } from '../game/engineState';
import { getStorybookSnowColor, renderStorybookLightingComposite } from './storybookLightingRenderer';
import { shouldDrawCombatText } from '../game/effectSettings';
import { ChunkBitmapCache } from './chunkCache';
import { drawGlyphText } from './glyphAtlas';
import { COLORS } from '../constants';
import { Lada, drawValecniceCompanion } from './ladaRenderer';
import { renderDrops } from './renderDrops';
import { renderProjectilesAndSlashes } from './renderProjectiles';
import { renderParticles } from './renderParticles';
import { renderGroundOverlays } from './renderGroundOverlays';
import { renderEnemyTelegraphs } from './renderTelegraphs';
import { getRankedWeaponStats } from '../data/weaponMilestones';

export interface CameraViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  viewLeft?: number;
  viewTop?: number;
  viewRight?: number;
  viewBottom?: number;
}

export interface ArenaRenderOptions {
  performanceProfile?: 'performance' | 'balanced' | 'fidelity';
  combatVfxEnabled?: boolean;
  combatTextsEnabled?: boolean;
  damageNumbersEnabled?: boolean; // deprecated alias for combatTextsEnabled (GLOSSARY.md)
  lightingEnabled?: boolean;
  chunkCullingEnabled?: boolean;
  warningIndicatorsEnabled?: boolean;
  statusIndicatorsEnabled?: boolean;
  weatherEnabled?: boolean;
  showPerfOverlay?: boolean;
  chunkCache?: ChunkBitmapCache;
  curLvl?: any;
  dayPhase?: any;
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
  renderedDrops?: number;
  renderedProjectiles?: number;
  renderedSlashes?: number;
  renderedParticles?: number;
  timings: ArenaPhaseTimings;
}

/**
 * Creates a reusable metrics object to avoid Garbage Collector allocations per frame.
 */
export function createReusableRenderMetrics(): ArenaRenderMetrics {
  return {
    renderedEntities: 0,
    renderedDecor: 0,
    activeChunks: 0,
    renderedDrops: 0,
    renderedProjectiles: 0,
    renderedSlashes: 0,
    renderedParticles: 0,
    timings: {
      backdropMs: 0,
      staticDecorMs: 0,
      entitiesMs: 0,
      lightingMs: 0,
      combatTextsMs: 0,
      totalMs: 0,
    },
  };
}

/**
 * Frustum culling test against camera viewport with bounding radius margin.
 * Supports passing CameraViewport directly or individual coordinate bounds.
 */
export function isInView(
  x: number,
  y: number,
  radius: number,
  viewLeftOrCamera: number | CameraViewport,
  viewTop?: number,
  viewRight?: number,
  viewBottom?: number
): boolean {
  if (typeof viewLeftOrCamera === 'object') {
    const cam = viewLeftOrCamera;
    const vl = cam.viewLeft !== undefined ? cam.viewLeft : (cam.x - 120);
    const vr = cam.viewRight !== undefined ? cam.viewRight : (cam.x + cam.width + 120);
    const vt = cam.viewTop !== undefined ? cam.viewTop : (cam.y - 160);
    const vb = cam.viewBottom !== undefined ? cam.viewBottom : (cam.y + cam.height + 160);
    return (
      x + radius >= vl &&
      x - radius <= vr &&
      y + radius >= vt &&
      y - radius <= vb
    );
  }
  return (
    x + radius >= viewLeftOrCamera &&
    x - radius <= (viewRight ?? 0) &&
    y + radius >= (viewTop ?? 0) &&
    y - radius <= (viewBottom ?? 0)
  );
}

// Preallocated buffer for zero-allocation isometric depth sorting
const MAX_DRAWABLE_CAPACITY = 2048;
const preallocatedDrawables: any[] = new Array(MAX_DRAWABLE_CAPACITY);
let drawableCount = 0;

let fogPuffCanvas: HTMLCanvasElement | null = null;
function getFogPuffCanvas(): HTMLCanvasElement | null {
  if (!fogPuffCanvas && typeof document !== 'undefined') {
    fogPuffCanvas = document.createElement('canvas');
    fogPuffCanvas.width = 240;
    fogPuffCanvas.height = 240;
    const fctx = fogPuffCanvas.getContext('2d');
    if (fctx) {
      const grad = fctx.createRadialGradient(120, 120, 10, 120, 120, 120);
      grad.addColorStop(0, 'rgba(180, 195, 215, 0.12)');
      grad.addColorStop(1, 'rgba(180, 195, 215, 0)');
      fctx.fillStyle = grad;
      fctx.beginPath();
      fctx.arc(120, 120, 120, 0, Math.PI * 2);
      fctx.fill();
    }
  }
  return fogPuffCanvas;
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

let smoothedFrameMs = 16.6;

/**
 * Primary interface for rendering a full frame of the game arena.
 */
export function renderArena(
  ctx: CanvasRenderingContext2D,
  engine: EngineState,
  camera: CameraViewport,
  options?: ArenaRenderOptions,
  outMetrics?: ArenaRenderMetrics
): ArenaRenderMetrics {
  const tStart = now();

  const opts: ArenaRenderOptions = {
    performanceProfile: 'balanced',
    combatVfxEnabled: true,
    combatTextsEnabled: true,
    lightingEnabled: true,
    chunkCullingEnabled: true,
    warningIndicatorsEnabled: true,
    statusIndicatorsEnabled: true,
    weatherEnabled: true,
    ...options,
  };

  const width = camera.width;
  const height = camera.height;
  const viewLeft = camera.viewLeft !== undefined ? camera.viewLeft : (camera.x - 120);
  const viewTop = camera.viewTop !== undefined ? camera.viewTop : (camera.y - 160);
  const viewRight = camera.viewRight !== undefined ? camera.viewRight : (camera.x + camera.width + 120);
  const viewBottom = camera.viewBottom !== undefined ? camera.viewBottom : (camera.y + camera.height + 160);

  const fullCamera: CameraViewport = {
    x: camera.x,
    y: camera.y,
    width,
    height,
    viewLeft,
    viewTop,
    viewRight,
    viewBottom,
  };

  let renderedEntities = 0;
  let renderedDecor = 0;
  let activeChunks = 0;
  let renderedDropsCount = 0;
  let renderedProjectilesCount = 0;
  let renderedSlashesCount = 0;
  let renderedParticlesCount = 0;

  // 1. BACKDROP PASS
  const tBackdropStart = now();
  const curLvl = opts.curLvl || (engine as any).curLvl || { season: 'winter', theme: 'meadow' };
  const phase = opts.dayPhase || (engine as any).dayPhase || { id: 'noon', skyColor: '#E2E8F0', ambientTint: 'transparent' };
  const isWinter = curLvl.season === 'winter';
  const player = engine.player;
  const kurazRatio = player && player.maxHp > 0
    ? Math.max(0, Math.min(1, (player.hp ?? player.kuraz ?? 0) / player.maxHp))
    : (player && player.maxKuraz > 0 ? Math.max(0, player.kuraz / player.maxKuraz) : 1);

  if (isWinter) {
    ctx.fillStyle = getStorybookSnowColor(phase.id || 'noon', kurazRatio);
  } else if (curLvl.theme === 'autumn_graveyard') {
    ctx.fillStyle = phase.id === 'noon' || phase.id === 'afternoon' ? '#383B30' : '#202127';
  } else if (curLvl.theme === 'spring_river') {
    ctx.fillStyle = phase.id === 'noon' || phase.id === 'afternoon' ? '#D6EAF8' : (phase.id === 'dusk' ? '#9AA9BB' : '#1B2A38');
  } else {
    ctx.fillStyle = phase.skyColor || '#E2E8F0';
  }
  ctx.fillRect(0, 0, width, height);
  const backdropMs = now() - tBackdropStart;

  // 2. WORLD SPACE LAYER
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // 2a. Ambient tint and atmospheric haze over world
  if (curLvl.theme === 'autumn_graveyard') {
    ctx.fillStyle = phase.ambientTint !== 'transparent' ? 'rgba(32, 24, 45, 0.42)' : 'rgba(25, 20, 30, 0.22)';
    ctx.fillRect(camera.x, camera.y, width, height);
  } else if (!isWinter && phase.ambientTint && phase.ambientTint !== 'transparent') {
    ctx.fillStyle = phase.ambientTint;
    ctx.fillRect(camera.x, camera.y, width, height);
  } else if (isWinter) {
    ctx.fillStyle = 'rgba(180, 210, 240, 0.12)';
    ctx.fillRect(camera.x, camera.y, width, height);
  }

  if (engine.flourStormTimer && engine.flourStormTimer > 0) {
    ctx.save();
    const alpha = Math.min(0.35, engine.flourStormTimer * 0.08);
    ctx.fillStyle = `rgba(255, 252, 240, ${alpha})`;
    ctx.fillRect(camera.x, camera.y, width, height);
    ctx.restore();
  }

  // 2b. STATIC DECOR PASS (WITH CHUNK BITMAP CACHE)
  const tDecorStart = now();
  const isNight = ['dusk', 'night', 'midnight', 'dawn'].includes(phase.id);
  if (opts.chunkCache && opts.chunkCache.getChunkCount() > 0) {
    opts.chunkCache.rebuildIfChanged(engine.decor || [], curLvl.season, curLvl.theme, false);
    activeChunks = opts.chunkCache.render(ctx, fullCamera);
    const dynamicDecor = opts.chunkCache.getDynamicDecor();
    if (dynamicDecor && dynamicDecor.length > 0) {
      for (let i = 0; i < dynamicDecor.length; i++) {
        const dec = dynamicDecor[i];
        const scale = dec.scale || 1;
        const decorExtent = (dec.type && dec.type.startsWith('march_')) ? 270 * scale : 100 * scale;
        if (!isInView(dec.x, dec.y - 45 * scale, decorExtent, fullCamera)) continue;
        renderedDecor++;
        if (typeof dec.draw === 'function') {
          dec.draw(ctx, curLvl.season, curLvl.theme, engine.uiTime || 0, isNight);
        }
      }
    }
  } else if (engine.decor && engine.decor.length > 0) {
    for (let i = 0; i < engine.decor.length; i++) {
      const dec = engine.decor[i];
      const scale = dec.scale || 1;
      const decorExtent = (dec.type && dec.type.startsWith('march_')) ? 270 * scale : 100 * scale;
      if (!isInView(dec.x, dec.y - 45 * scale, decorExtent, fullCamera)) continue;
      renderedDecor++;
      if (typeof dec.draw === 'function') {
        dec.draw(ctx, curLvl.season, curLvl.theme, engine.uiTime || 0, isNight);
      }
    }
  }
  const staticDecorMs = now() - tDecorStart;

  // 2c. GROUND OVERLAYS PASS
  renderGroundOverlays(ctx, engine, fullCamera, {
    warningIndicatorsEnabled: opts.warningIndicatorsEnabled,
  });

  // 2d. DROPS PASS
  renderedDropsCount = renderDrops(ctx, engine.drops || [], fullCamera);

  // 2e. DĚDEČEK & COMPANION & WEAPON AURAS
  if (engine.grandfather && engine.grandfather.active) {
    const g = engine.grandfather;
    const dist = player ? Math.hypot(g.x - player.x, g.y - player.y) : 999;
    const isInteracting = dist < 220;
    Lada.drawGrandfather(
      ctx,
      g.x,
      g.y,
      g.animTime || engine.uiTime || 0,
      g.vx || 0,
      !!g.isMoving,
      g.facingDir || 1,
      isInteracting,
      1.2
    );
    if (isInteracting) {
      ctx.save();
      ctx.fillStyle = '#FFF7DF';
      ctx.strokeStyle = '#2D1609';
      ctx.lineWidth = 2;
      ctx.font = '900 15px Eczar, serif';
      ctx.textAlign = 'center';
      ctx.beginPath();
      ctx.roundRect(g.x - 110, g.y - 92, 220, 32, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5B2118';
      ctx.fillText('DĚDEČEK — nůše [E / klik]', g.x, g.y - 71);
      ctx.restore();
    }
  }

  if (engine.companion) {
    Lada.drawChasnik(ctx, engine.companion.x, engine.companion.y, engine.companion.animTime || 0, false);
  }

  if (player) {
    const hromnickaWp = player.weapons?.find((w: any) => w.id === 'hromnicka');
    if (hromnickaWp) {
      const reach = 135 + hromnickaWp.level * 15;
      Lada.drawHromnickaAura(ctx, player.x, player.y, reach, engine.uiTime || 0, player.hromnickaPulseTimer || 0);
    }

    const garlicWp = player.weapons?.find((w: any) => w.id === 'cesnekova-topinka');
    if (garlicWp) {
      const auraRadius = 110 * (garlicWp.level >= 2 ? 1.2 : 1) * (garlicWp.level >= 5 ? 1.15 : 1);
      ctx.save();
      const pulse = 1 + Math.sin((engine.uiTime || 0) * 2.6) * 0.045;
      const grad = ctx.createRadialGradient(player.x, player.y, auraRadius * 0.12, player.x, player.y, auraRadius * pulse);
      grad.addColorStop(0, 'rgba(190, 230, 110, 0.05)');
      grad.addColorStop(0.62, 'rgba(132, 180, 55, 0.12)');
      grad.addColorStop(1, 'rgba(101, 145, 35, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(player.x, player.y, auraRadius * pulse, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = (engine.uiTime || 0) * (0.28 + i * 0.01) + i * Math.PI / 4;
        const rr = auraRadius * (0.35 + (((engine.uiTime || 0) * 0.12 + i * 0.17) % 0.65));
        const x = player.x + Math.cos(a) * rr;
        const y = player.y + Math.sin(a) * rr;
        ctx.globalAlpha = 0.28 * (1 - rr / auraRadius);
        ctx.fillStyle = i % 2 ? '#A3E635' : '#D9F99D';
        ctx.beginPath();
        ctx.arc(x, y, 7 + Math.sin((engine.uiTime || 0) * 2 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = 'rgba(101,145,35,.32)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, auraRadius * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    const valecniceWp = player.weapons?.find((w: any) => w.id === 'valecnice');
    if (valecniceWp) {
      const stats = getRankedWeaponStats('valecnice', valecniceWp.level, valecniceWp);
      const count = Math.max(1, 1 + stats.projectileCount);
      const orbitRadius = 115 * stats.areaRadiusMult;
      const slowRadius = orbitRadius * 1.15;

      ctx.save();
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, slowRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.32)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      for (let i = 0; i < count; i++) {
        const a = (player.valecniceAngle || 0) + i * Math.PI * 2 / count;
        const x = player.x + Math.cos(a) * orbitRadius;
        const y = player.y + Math.sin(a) * orbitRadius;
        drawValecniceCompanion(ctx, x, y, a, i, engine.uiTime || 0, 1.71, player._valecnicePulse);
      }
    }
  }

  // 2f. DYNAMIC ENTITIES PASS (ZERO-ALLOCATION BUFFER SORTED BY Y)
  const tEntitiesStart = now();
  drawableCount = 0;

  if (engine.player) {
    preallocatedDrawables[drawableCount++] = engine.player;
  }

  if (engine.enemies && engine.enemies.length > 0) {
    for (let i = 0; i < engine.enemies.length; i++) {
      const enemy = engine.enemies[i];
      if (enemy.isDefeated || enemy.dead) continue;
      const radius = (enemy.radius || 20) + 40;
      if (isInView(enemy.x, enemy.y, radius, fullCamera)) {
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
      if (isInView(puff.x, puff.y, r, fullCamera)) {
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
  try {
    for (let i = 0; i < drawableCount; i++) {
      const d = preallocatedDrawables[i];
      if (d && typeof d.draw === 'function') {
        d.draw(ctx);
        renderedEntities++;
      }
    }
  } finally {
    for (let i = 0; i < drawableCount; i++) {
      preallocatedDrawables[i] = null;
    }
    drawableCount = 0;
  }
  const entitiesMs = now() - tEntitiesStart;

  // 2g. TELEGRAPHS & STATUS INDICATORS
  renderEnemyTelegraphs(ctx, engine.enemies || [], fullCamera, opts, engine.uiTime || 0);

  // 2h. PROJECTILES AND MELEE SLASHES
  if (opts.combatVfxEnabled) {
    const projResult = renderProjectilesAndSlashes(
      ctx,
      engine.projectiles || [],
      engine.slashes || [],
      fullCamera,
      engine.uiTime || 0
    );
    renderedProjectilesCount = projResult.renderedProjectiles;
    renderedSlashesCount = projResult.renderedSlashes;
  }

  // 2i. COMBAT FLOATING TEXTS PASS
  let combatTextsMs = 0;
  const isCombatTextsActive = opts.combatTextsEnabled ?? opts.damageNumbersEnabled ?? true;
  if (isCombatTextsActive && engine.texts && engine.texts.length > 0) {
    const tTextsStart = now();
    for (let i = 0; i < engine.texts.length; i++) {
      const txt = engine.texts[i];
      if (!txt || (txt.life ?? 0) <= 0) continue;
      if (!isInView(txt.x, txt.y, txt.size || 18, fullCamera)) continue;
      if (!shouldDrawCombatText(txt.category, txt.text)) continue;
      if (typeof txt.draw === 'function') {
        txt.draw(ctx);
      } else if (txt.text) {
        drawGlyphText(ctx, txt.text, txt.x, txt.y, { size: txt.size || 18, color: txt.color, alpha: txt.life });
      }
    }
    combatTextsMs = now() - tTextsStart;
  }

  // 2j. BATCHED PARTICLES PASS
  if (opts.combatVfxEnabled && engine.particles && engine.particles.length > 0) {
    renderedParticlesCount = renderParticles(ctx, engine.particles, fullCamera);
  }

  // 2k. IN-WORLD SPECIAL COMBAT EFFECTS
  if (opts.combatVfxEnabled && engine.lightningStrike) {
    const ls = engine.lightningStrike;
    ctx.save();
    ctx.strokeStyle = '#FEF08A';
    ctx.shadowColor = '#60A5FA';
    ctx.shadowBlur = 22;
    ctx.lineWidth = 6;
    ctx.beginPath();
    let curX = ls.x + (Math.random() - 0.5) * 40;
    let curY = camera.y - 120;
    ctx.moveTo(curX, curY);
    const steps = 7;
    for (let s = 1; s <= steps; s++) {
      const targetY = (camera.y - 120) + (ls.y - (camera.y - 120)) * (s / steps);
      const targetX = s === steps ? ls.x : ls.x + (Math.random() - 0.5) * 55;
      ctx.lineTo(targetX, targetY);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.beginPath();
    ctx.arc(ls.x, ls.y, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (opts.combatVfxEnabled && engine.blessing) {
    Lada.drawBlessingFx(ctx, engine.blessing.x, engine.blessing.y, engine.blessing.t, engine.blessing.dur);
  }

  if (opts.combatVfxEnabled && engine.shepherdStampede && player) {
    Lada.drawShepherdStampedeFx(ctx, engine.shepherdStampede, 0.016, player.x, player.y);
  }

  if (opts.combatVfxEnabled && engine.korenarkaSanctuary && player) {
    Lada.drawKorenarkaSanctuaryFx(ctx, engine.korenarkaSanctuary, 0.016, player.x, player.y);
  }

  if (opts.combatVfxEnabled && engine.sukovice && player) {
    Lada.drawSukoviceFx(ctx, engine.sukovice, player.x, player.y);
  }

  if (engine.sootFootprints && engine.sootFootprints.length > 0) {
    for (let i = 0; i < engine.sootFootprints.length; i++) {
      const sf = engine.sootFootprints[i];
      if (isInView(sf.x, sf.y, 16, fullCamera)) {
        Lada.drawSootFootprint(ctx, sf.x, sf.y, sf.angle);
      }
    }
  }

  if (engine.slivoviceVapor) {
    Lada.drawSlivoviceVapor(ctx, engine.slivoviceVapor.x, engine.slivoviceVapor.y, engine.slivoviceVapor.dirAngle, engine.slivoviceVapor.life);
  }

  if (engine.masopustShockwaveTimer && engine.masopustShockwaveTimer > 0 && player) {
    Lada.drawMasopustShockwave(ctx, player.x, player.y, 140, engine.uiTime || 0);
  }

  // Restore camera translation
  ctx.restore();

  // 3. SCREEN-SPACE POST-PROCESSING PASSES
  // 3a. Lighting pass
  let lightingMs = 0;
  if (opts.lightingEnabled) {
    const tLightStart = now();
    if (isNight && engine.lightSources && engine.lightSources.length > 0) {
      renderStorybookLightingComposite(
        ctx,
        width,
        height,
        { x: camera.x, y: camera.y },
        engine.lightSources,
        phase.id,
        kurazRatio,
        isWinter,
        engine.shadowZones || [],
        engine.occluders || [],
        opts.performanceProfile ?? 'balanced',
        true
      );
    }
    lightingMs = now() - tLightStart;
  }

  // 3b. Mrazivý zimní okraj z Trouby obecního ponocného
  if (opts.combatVfxEnabled && engine.ponocnyFrostTimer && engine.ponocnyFrostTimer > 0) {
    Lada.drawFrostBorder(ctx, width, height, Math.min(1, engine.ponocnyFrostTimer / 2));
  }

  // 3c. Atmosférický banner vzácných pomocných předmětů
  if (opts.combatVfxEnabled && engine.activeRareOverlay) {
    if (engine.activeRareOverlay.type === 'ponocny_horn') {
      Lada.drawPonocnyNightOverlay(ctx, width, height, Math.min(1, engine.activeRareOverlay.timer));
    } else if (engine.activeRareOverlay.type === 'kominik_button') {
      Lada.drawKominikOverlay(ctx, width, height, Math.min(1, engine.activeRareOverlay.timer));
    }
  }

  // 3d. Ladovský ukazatel na dědečka, pokud se ocitne mimo obrazovku
  if (engine.grandfather && engine.grandfather.active && player) {
    const gScreenX = engine.grandfather.x - camera.x;
    const gScreenY = engine.grandfather.y - camera.y;
    const isOffscreen = gScreenX < 40 || gScreenX > width - 40 || gScreenY < 40 || gScreenY > height - 40;
    if (isOffscreen) {
      const pScreenX = player.x - camera.x;
      const pScreenY = player.y - camera.y;
      const dx = gScreenX - pScreenX;
      const dy = gScreenY - pScreenY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.round(Math.hypot(engine.grandfather.x - player.x, engine.grandfather.y - player.y));
      const edgeMargin = 55;
      const cx = Math.max(edgeMargin, Math.min(width - edgeMargin, width / 2 + Math.cos(angle) * (width / 2 - 75)));
      const cy = Math.max(edgeMargin, Math.min(height - edgeMargin, height / 2 + Math.sin(angle) * (height / 2 - 65)));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#FDECC8';
      ctx.strokeStyle = '#2D1609';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-60, -16, 120, 32, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5B2118';
      ctx.font = '900 13px Eczar, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🧺 Dědeček (${dist} m)`, 0, 0);
      ctx.restore();
    }
  }

  // 3e. Screen flash from Saint Elias lightning
  if (engine.lightningFlash && engine.lightningFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 240, ${Math.min(0.65, engine.lightningFlash * 1.5)})`;
    ctx.fillRect(0, 0, width, height);
  }

  // 3f. Příběhová scénka se zastaveným časem (Babička, Pasáček, Kořenářka)
  if (engine.cutscene) {
    if (engine.cutscene.type === 'shepherd') {
      Lada.drawShepherdScene(ctx, width, height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
    } else if (engine.cutscene.type === 'korenarka') {
      Lada.drawKorenarkaScene(ctx, width, height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
    } else {
      Lada.drawGrannyScene(ctx, width, height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
    }
  }

  // 3g. Weather overlay per level: snowflakes, autumn leaves, or graveyard mist
  if (opts.weatherEnabled && curLvl.weatherEffect) {
    const t = engine.uiTime || 0;
    if (curLvl.weatherEffect === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      for (let i = 0; i < 55; i++) {
        const sx = ((i * 123 + t * 45) % width);
        const sy = ((i * 77 + t * 85) % height);
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (curLvl.weatherEffect === 'leaves') {
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 147 + t * 35 + Math.sin(t + i) * 25) % width);
        const sy = ((i * 93 + t * 45) % height);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(217, 160, 54, 0.75)' : i % 3 === 1 ? 'rgba(209, 52, 43, 0.65)' : 'rgba(140, 90, 53, 0.7)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 4, 2.5, Math.sin(t * 1.5 + i), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (curLvl.weatherEffect === 'fog') {
      const fogCanvas = getFogPuffCanvas();
      if (fogCanvas) {
        for (let i = 0; i < 22; i++) {
          const sx = ((i * 190 + t * 22) % (width + 200)) - 100;
          const sy = (i * 55 + Math.sin(t * 0.5 + i) * 30) % height;
          ctx.drawImage(fogCanvas, sx - 120, sy - 120);
        }
      }
    } else if (curLvl.weatherEffect === 'ice_drift') {
      Lada.setupPath(ctx, '#FFFFFF', COLORS.ink, 3);
      for (let i = 0; i < 15; i++) {
        const sx = ((i * 220 + t * 35) % (width + 400)) - 200;
        const sy = ((i * 87 + Math.sin(t * 0.2 + i) * 12) % (height + 300)) - 150;
        const rot = Math.sin(t * 0.15 + i) * 0.15;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);

        ctx.beginPath();
        ctx.moveTo(-35, -5);
        ctx.lineTo(-5, -20);
        ctx.lineTo(25, -10);
        ctx.lineTo(40, 5);
        ctx.lineTo(10, 20);
        ctx.lineTo(-20, 15);
        ctx.closePath();

        ctx.fillStyle = (i % 2 === 0) ? '#FFFFFF' : '#E9F1F7';
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(10, 5);
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  // 3h. Perf overlay (if enabled)
  if (opts.showPerfOverlay) {
    const frameMs = now() - tStart;
    smoothedFrameMs += (frameMs - smoothedFrameMs) * 0.08;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(12, 12, 240, 72);
    ctx.strokeStyle = '#D9A036';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, 12, 240, 72);
    ctx.font = '700 13px monospace';
    const currentFps = Math.round(1000 / Math.max(1, smoothedFrameMs));
    ctx.fillStyle = currentFps >= 50 ? '#4ADE80' : currentFps >= 30 ? '#FBBF24' : '#EF4444';
    ctx.fillText(`${currentFps} FPS (${smoothedFrameMs.toFixed(1)} ms) [${(opts.performanceProfile || 'balanced').toUpperCase()}]`, 22, 33);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`Nepřátelé: ${engine.enemies?.length || 0} | Střely: ${engine.projectiles?.length || 0}`, 22, 51);
    ctx.fillText(`Částice: ${engine.particles?.length || 0} | Texty: ${engine.texts?.length || 0}`, 22, 69);
    ctx.restore();
  }

  const totalMs = now() - tStart;

  if (outMetrics) {
    outMetrics.renderedEntities = renderedEntities;
    outMetrics.renderedDecor = renderedDecor;
    outMetrics.activeChunks = activeChunks;
    outMetrics.renderedDrops = renderedDropsCount;
    outMetrics.renderedProjectiles = renderedProjectilesCount;
    outMetrics.renderedSlashes = renderedSlashesCount;
    outMetrics.renderedParticles = renderedParticlesCount;
    outMetrics.timings.backdropMs = backdropMs;
    outMetrics.timings.staticDecorMs = staticDecorMs;
    outMetrics.timings.entitiesMs = entitiesMs;
    outMetrics.timings.lightingMs = lightingMs;
    outMetrics.timings.combatTextsMs = combatTextsMs;
    outMetrics.timings.totalMs = totalMs;
    return outMetrics;
  }

  return {
    renderedEntities,
    renderedDecor,
    activeChunks,
    renderedDrops: renderedDropsCount,
    renderedProjectiles: renderedProjectilesCount,
    renderedSlashes: renderedSlashesCount,
    renderedParticles: renderedParticlesCount,
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
