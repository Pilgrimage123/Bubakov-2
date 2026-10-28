/**
 * Arena Rendering Pipeline (Vykreslovací pipeline arény)
 * 
 * Stateless rendering module handling transformation of EngineState into 2D Canvas graphics.
 * Encapsulates frustum culling, zero-allocation depth sorting, chunk caching,
 * downscaled lighting pass, and glyph cache for combat numbers.
 * 
 * ADR 0002, ADR 0003, ADR 0017, ADR 0020
 */

import type { EngineState } from '../game/engineState';
import { getStorybookSnowColor, renderStorybookLightingComposite } from './storybookLightingRenderer';
import { shouldDrawCombatText } from '../game/effectSettings';

import { ChunkBitmapCache } from './chunkCache';
import { drawGlyphText } from './glyphAtlas';
import { renderDrops } from './renderDrops';
import { renderParticles } from './renderParticles';
import { renderProjectilesAndSlashes, type ProjectileRenderMetrics } from './renderProjectiles';
import { renderEnemyTelegraphs, type TelegraphRenderOptions } from './renderTelegraphs';
import {
  renderWorldHazardsAndEncounters,
  renderWorldCombatVfx,
  type WorldHazardsRenderOptions,
} from './renderWorldHazards';
import { OffScreenIndicatorController } from './offScreenIndicators';
import { FROSTLING_AURA_RADIUS } from '../game/frostAura';
import { Lada } from './ladaRenderer';

export interface CameraViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  viewLeft: number;
  viewTop: number;
  viewRight: number;
  viewBottom: number;
  zoom?: number;
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
  chunkCache?: ChunkBitmapCache;
  curLvl?: any;
  dayPhase?: any;
  snowmanHorde?: any;
  isPaused?: boolean;
  deltaTimeSeconds?: number;
  afterEntitiesDrawn?: (entity: any) => void;
}

export interface ArenaPhaseTimings {
  backdropMs: number;
  staticDecorMs: number;
  entitiesMs: number;
  worldEffectsMs?: number;
  projectilesMs?: number;
  dropsMs?: number;
  particlesMs?: number;
  lightingMs: number;
  combatTextsMs: number;
  totalMs: number;
}

export interface ArenaRenderMetrics {
  renderedEntities: number;
  renderedDecor: number;
  activeChunks: number;
  renderedProjectiles?: number;
  renderedSlashes?: number;
  drawableCapacity?: number;
  culledEntities?: number;
  renderedDrops?: number;
  renderedParticles?: number;
  timings: ArenaPhaseTimings;
}

/**
 * Optional presentation applied after every visible entity has been drawn.
 * It keeps world-specific ornaments out of the renderer while preserving the
 * renderer as the owner of culling and depth ordering.
 */
export interface ArenaEntityPassOptions {
  combatVfxEnabled?: boolean;
  afterEntitiesDrawn?: (entity: any) => void;
}

/**
 * Creates a reusable metrics object to avoid Garbage Collector allocations per frame.
 */
export function createReusableRenderMetrics(): ArenaRenderMetrics {
  return {
    renderedEntities: 0,
    renderedDecor: 0,
    activeChunks: 0,
    renderedProjectiles: 0,
    renderedSlashes: 0,
    drawableCapacity: MAX_DRAWABLE_CAPACITY,
    culledEntities: 0,
    renderedDrops: 0,
    renderedParticles: 0,
    timings: {
      backdropMs: 0,
      staticDecorMs: 0,
      entitiesMs: 0,
      worldEffectsMs: 0,
      projectilesMs: 0,
      dropsMs: 0,
      particlesMs: 0,
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
    return (
      x + radius >= cam.viewLeft &&
      x - radius <= cam.viewRight &&
      y + radius >= cam.viewTop &&
      y - radius <= cam.viewBottom
    );
  }
  return (
    x + radius >= viewLeftOrCamera &&
    x - radius <= (viewRight ?? 0) &&
    y + radius >= (viewTop ?? 0) &&
    y - radius <= (viewBottom ?? 0)
  );
}

export const MAX_DRAWABLE_CAPACITY = 2048;
const EMPTY_LIGHT_OCCLUDERS: any[] = [];
const EMPTY_RENDER_ITEMS: any[] = [];
const DEFAULT_LEVEL = { season: 'winter', theme: 'meadow' };
const DEFAULT_DAY_PHASE = { id: 'noon' };

function isNightPhase(phaseId: string): boolean {
  return phaseId === 'dusk' || phaseId === 'night' || phaseId === 'midnight' || phaseId === 'dawn';
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * ArenaRenderer instance containing isolated preallocated sorting buffers.
 * Moving the Y-buffer into the instance avoids cross-canvas collisions (Plan Section 2).
 */
export class ArenaRenderer {
  public preallocatedDrawables: any[] = new Array(MAX_DRAWABLE_CAPACITY);
  public drawableCapacity = MAX_DRAWABLE_CAPACITY;
  public drawableCount = 0;
  public culledEntities = 0;
  public readonly indicatorController = new OffScreenIndicatorController();
  private readonly projectileMetrics: ProjectileRenderMetrics = {
    renderedProjectiles: 0,
    renderedSlashes: 0,
  };
  private readonly entityPassOptions: ArenaEntityPassOptions = {};
  private readonly telegraphOptions: TelegraphRenderOptions = {};
  private readonly worldHazardOptions: WorldHazardsRenderOptions = {};
  private readonly worldCombatVfxOptions: WorldHazardsRenderOptions = {};

  private ensureDrawableCapacity(required: number): void {
    if (required <= this.drawableCapacity) return;
    let nextCapacity = this.drawableCapacity;
    while (nextCapacity < required) {
      nextCapacity += Math.max(512, nextCapacity >> 1);
    }
    const nextBuffer = new Array(nextCapacity);
    for (let i = 0; i < this.drawableCount; i++) nextBuffer[i] = this.preallocatedDrawables[i];
    this.preallocatedDrawables = nextBuffer;
    this.drawableCapacity = nextCapacity;
  }

  private addDrawable(drawable: any): void {
    this.ensureDrawableCapacity(this.drawableCount + 1);
    this.preallocatedDrawables[this.drawableCount++] = drawable;
  }

  /**
   * Renders the depth-sorted dynamic entity layer using this instance's isolated buffer.
   */
  public renderEntities(
    ctx: CanvasRenderingContext2D,
    engine: EngineState,
    camera: CameraViewport,
    options?: ArenaEntityPassOptions
  ): number {
    const { viewLeft, viewTop, viewRight, viewBottom } = camera;
    let renderedEntities = 0;
    this.drawableCount = 0;
    this.culledEntities = 0;

    if (engine.player) {
      if (isInView(engine.player.x, engine.player.y, engine.player.radius || 24, viewLeft, viewTop, viewRight, viewBottom)) {
        this.addDrawable(engine.player);
      }
    }

    if (engine.enemies && engine.enemies.length > 0) {
      for (let i = 0; i < engine.enemies.length; i++) {
        const enemy = engine.enemies[i];
        if (!enemy || enemy.dead) continue;
        // Skip defeated enemies only if they have no active flee / food-defeat fade animation
        if (
          enemy.isDefeated &&
          typeof enemy.fleeTimer !== 'number' &&
          typeof enemy.foodDefeatTimer !== 'number'
        ) {
          continue;
        }
        const radius = enemy.radius || 20;
        if (isInView(enemy.x, enemy.y, radius, viewLeft, viewTop, viewRight, viewBottom)) this.addDrawable(enemy);
        else this.culledEntities++;
      }
    }

    if (options?.combatVfxEnabled !== false && engine.smokePuffs && engine.smokePuffs.length > 0) {
      for (let i = 0; i < engine.smokePuffs.length; i++) {
        const puff = engine.smokePuffs[i];
        if (!puff || puff.dead) continue;
        const radius = (puff.radius || 15) * 2;
        if (isInView(puff.x, puff.y, radius, viewLeft, viewTop, viewRight, viewBottom)) {
          if (typeof puff.draw === 'function') {
            puff.draw(ctx);
            renderedEntities++;
          }
          if (options?.afterEntitiesDrawn) {
            options.afterEntitiesDrawn(puff);
          }
        }
      }
    }

    // Render mrazovy_skritek frost auras on the ground layer before characters with overlap attenuation
    if (options?.combatVfxEnabled !== false) {
      const overlapRadiusSq = (FROSTLING_AURA_RADIUS * 1.15) * (FROSTLING_AURA_RADIUS * 1.15);
      for (let i = 0; i < this.drawableCount; i++) {
        const d = this.preallocatedDrawables[i];
        if (!d || (d.id !== 'mrazovy_skritek' && d.method !== 'drawFrostling') || d.id === 'mrazivy_obr' || d.isDefeated) {
          continue;
        }
        let overlapCount = 1;
        for (let j = 0; j < this.drawableCount; j++) {
          if (i === j) continue;
          const other = this.preallocatedDrawables[j];
          if (!other || (other.id !== 'mrazovy_skritek' && other.method !== 'drawFrostling') || other.id === 'mrazivy_obr' || other.isDefeated) {
            continue;
          }
          const dx = d.x - other.x;
          const dy = d.y - other.y;
          if (dx * dx + dy * dy <= overlapRadiusSq) {
            overlapCount++;
          }
        }
        Lada.drawFrostlingAura(ctx, d.x, d.y, d.animTime || 0, overlapCount);
        d._auraDrawnInGroundPass = true;
      }
    }

    // Depth sort (insertion sort optimal for nearly sorted arrays)
    for (let i = 1; i < this.drawableCount; i++) {
      const item = this.preallocatedDrawables[i];
      let j = i - 1;
      while (j >= 0 && this.preallocatedDrawables[j].y > item.y) {
        this.preallocatedDrawables[j + 1] = this.preallocatedDrawables[j];
        j--;
      }
      this.preallocatedDrawables[j + 1] = item;
    }

    try {
      for (let i = 0; i < this.drawableCount; i++) {
        const drawable = this.preallocatedDrawables[i];
        if (drawable && typeof drawable.draw === 'function') {
          drawable.draw(ctx);
          renderedEntities++;
        }
      }
      if (options?.afterEntitiesDrawn) {
        for (let i = 0; i < this.drawableCount; i++) {
          options.afterEntitiesDrawn(this.preallocatedDrawables[i]);
        }
      }
    } finally {
      for (let i = 0; i < this.drawableCount; i++) {
        const d = this.preallocatedDrawables[i];
        if (d && d._auraDrawnInGroundPass) {
          d._auraDrawnInGroundPass = false;
        }
        this.preallocatedDrawables[i] = null;
      }
      this.drawableCount = 0;
    }

    return renderedEntities;
  }

  /**
   * Primary interface for rendering a full frame of the game arena.
   */
  public renderArena(
    ctx: CanvasRenderingContext2D,
    engine: EngineState,
    camera: CameraViewport,
    options?: ArenaRenderOptions,
    outMetrics?: ArenaRenderMetrics
  ): ArenaRenderMetrics {
    const tStart = now();

    const performanceProfile = options?.performanceProfile ?? 'balanced';
    const combatVfxEnabled = options?.combatVfxEnabled ?? true;
    const combatTextsEnabled = options?.combatTextsEnabled ?? options?.damageNumbersEnabled ?? true;
    const lightingEnabled = options?.lightingEnabled ?? true;
    const warningIndicatorsEnabled = options?.warningIndicatorsEnabled ?? true;
    const statusIndicatorsEnabled = options?.statusIndicatorsEnabled ?? true;

    const { width, height, viewLeft, viewTop, viewRight, viewBottom } = camera;

    let renderedEntities = 0;
    let renderedDecor = 0;
    let activeChunks = 0;
    let renderedProjectiles = 0;
    let renderedDrops = 0;
    let renderedParticles = 0;

    // 1. BACKDROP PASS
    const tBackdropStart = now();
    const curLvl = options?.curLvl || (engine as any).curLvl || DEFAULT_LEVEL;
    const phase = options?.dayPhase || (engine as any).dayPhase || DEFAULT_DAY_PHASE;
    const playerHp = engine?.player?.kuraz ?? engine?.player?.hp ?? 100;
    const playerMaxHp = engine?.player?.maxKuraz ?? engine?.player?.maxHp ?? 100;
    const kurazRatio = engine.player && playerMaxHp > 0
      ? Math.max(0, Math.min(1, playerHp / playerMaxHp))
      : 1;
    const isWinter = curLvl.season === 'winter';

    if (isWinter) {
      ctx.fillStyle = getStorybookSnowColor(phase.id || 'noon', kurazRatio);
    } else if (curLvl.theme === 'autumn_graveyard') {
      ctx.fillStyle = phase.id === 'noon' || phase.id === 'afternoon' ? '#383B30' : '#202127';
    } else if (curLvl.theme === 'spring_river') {
      ctx.fillStyle = phase.id === 'noon' || phase.id === 'afternoon' ? '#D6EAF8' : (phase.id === 'dusk' ? '#9AA9BB' : '#1B2A38');
    } else {
      ctx.fillStyle = phase.skyColor || getStorybookSnowColor(phase.id || 'noon', kurazRatio);
    }
    ctx.fillRect(0, 0, width, height);
    const backdropMs = now() - tBackdropStart;

    // 2. WORLD SPACE PASS (TRANSLATED BY CAMERA - ADR 0029, ADR 0034)
    ctx.save();
    if (camera.zoom && camera.zoom !== 1) {
      ctx.scale(camera.zoom, camera.zoom);
    }
    ctx.translate(-camera.x, -camera.y);

    // 2a. Ambient tint and storm haze over world
    if (curLvl.theme === 'autumn_graveyard') {
      ctx.fillStyle = phase.ambientTint !== 'transparent' ? 'rgba(32, 24, 45, 0.42)' : 'rgba(25, 20, 30, 0.22)';
      ctx.fillRect(camera.x, camera.y, width, height);
    } else if (!isWinter && phase.ambientTint !== 'transparent') {
      ctx.fillStyle = phase.ambientTint;
      ctx.fillRect(camera.x, camera.y, width, height);
    } else if (isWinter) {
      ctx.fillStyle = 'rgba(180, 210, 240, 0.12)';
      ctx.fillRect(camera.x, camera.y, width, height);
    }

    if (engine.flourStormTimer && engine.flourStormTimer > 0) {
      ctx.save();
      const alpha = Math.min(0.16, engine.flourStormTimer * 0.05);
      ctx.fillStyle = `rgba(255, 252, 240, ${alpha})`;
      ctx.fillRect(camera.x, camera.y, width, height);
      ctx.restore();
    }

    // 2b. STATIC DECOR PASS (WITH OPTIONAL CHUNK BITMAP CACHE)
    const tDecorStart = now();
    if (options?.chunkCache) {
      activeChunks = options.chunkCache.render(ctx, camera);
      const dynamicDecor = options.chunkCache.getDynamicDecor();
      if (dynamicDecor && dynamicDecor.length > 0) {
        const isNight = isNightPhase(phase.id);
        for (let i = 0; i < dynamicDecor.length; i++) {
          const dec = dynamicDecor[i];
          const scale = dec.scale || 1;
          const decorExtent =
            dec.type === 'march_mill'
              ? 2600 * scale
              : dec.type && dec.type.startsWith('march_')
              ? 450 * scale
              : 100 * scale;
          if (!isInView(dec.x, dec.y - 45 * scale, decorExtent, viewLeft, viewTop, viewRight, viewBottom)) {
            continue;
          }
          renderedDecor++;
          if (typeof dec.draw === 'function') {
            dec.draw(ctx, curLvl.season, curLvl.theme, engine.uiTime || 0, isNight);
          }
        }
      }
    } else if (engine.decor && engine.decor.length > 0) {
      const isNight = isNightPhase(phase.id);
      for (let i = 0; i < engine.decor.length; i++) {
        const dec = engine.decor[i];
        const scale = dec.scale || 1;
        const decorExtent =
          dec.type === 'march_mill'
            ? 2600 * scale
            : dec.type && dec.type.startsWith('march_')
            ? 450 * scale
            : 100 * scale;
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

    // Include hazards/encounters and telegraphs in an explicit timing bucket.
    const tWorldEffectsStart = now();
    // 2c. WORLD HAZARDS, ANOMALIES & ENCOUNTERS (ADR 0029)
    this.worldHazardOptions.warningIndicatorsEnabled = warningIndicatorsEnabled;
    this.worldHazardOptions.statusIndicatorsEnabled = statusIndicatorsEnabled;
    this.worldHazardOptions.combatVfxEnabled = combatVfxEnabled;
    this.worldHazardOptions.snowmanHorde = options?.snowmanHorde || (engine as any).snowmanHorde;
    this.worldHazardOptions.isPaused = options?.isPaused;
    this.worldHazardOptions.deferCombatVfxToOverlayPass = true;
    renderWorldHazardsAndEncounters(ctx, engine, camera, this.worldHazardOptions);

    // 3. DROPS PASS
    const tDropsStart = now();
    if (engine.drops && engine.drops.length > 0) {
      renderedDrops = renderDrops(ctx, engine.drops, camera, engine.player);
    }
    const dropsMs = now() - tDropsStart;

    // 4. DYNAMIC ENTITIES PASS (ZERO-ALLOCATION BUFFER)
    const tEntitiesStart = now();
    this.entityPassOptions.combatVfxEnabled = combatVfxEnabled;
    this.entityPassOptions.afterEntitiesDrawn = options?.afterEntitiesDrawn;
    renderedEntities = this.renderEntities(ctx, engine, camera, this.entityPassOptions);
    const entitiesMs = now() - tEntitiesStart;

    // 5. ENEMY TELEGRAPHS PASS
    if (engine.enemies && engine.enemies.length > 0) {
      this.telegraphOptions.warningIndicatorsEnabled = warningIndicatorsEnabled;
      this.telegraphOptions.statusIndicatorsEnabled = statusIndicatorsEnabled;
      renderEnemyTelegraphs(ctx, engine.enemies, camera, this.telegraphOptions, engine.uiTime || 0);
    }
    const worldEffectsMs = now() - tWorldEffectsStart;

    // 6. PROJECTILES & SLASHES PASS
    const tProjStart = now();
    this.projectileMetrics.renderedProjectiles = 0;
    this.projectileMetrics.renderedSlashes = 0;
    if (combatVfxEnabled && ((engine.projectiles && engine.projectiles.length > 0) || (engine.slashes && engine.slashes.length > 0))) {
      const projResult = renderProjectilesAndSlashes(
        ctx,
        engine.projectiles || EMPTY_RENDER_ITEMS,
        engine.slashes || EMPTY_RENDER_ITEMS,
        camera,
        engine.uiTime || 0,
        this.projectileMetrics
      );
      renderedProjectiles = projResult.renderedProjectiles;
    }
    const projectilesMs = now() - tProjStart;

    // 7. PARTICLES PASS
    const tParticlesStart = now();
    if (combatVfxEnabled && engine.particles && engine.particles.length > 0) {
      renderedParticles = renderParticles(ctx, engine.particles, camera);
    }
    const particlesMs = now() - tParticlesStart;

    // 8. COMBAT FLOATING TEXTS PASS
    let combatTextsMs = 0;
    if (combatTextsEnabled && engine.texts && engine.texts.length > 0) {
      const tTextsStart = now();
      ctx.font = '900 18px Eczar, serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2D1609';
      ctx.lineJoin = 'round';
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
        } else if (txt.text) {
          drawGlyphText(ctx, txt.text, txt.x, txt.y, { size: txt.size || 18, color: txt.color, alpha: txt.life });
        }
      }
      ctx.globalAlpha = 1;
      combatTextsMs = now() - tTextsStart;
    }

    // 8b. OVER-ENTITY WORLD COMBAT VFX PASS (Lightning bolt, Blessing bell, Stampede, Sukovice, Slivovice, Masopust shield)
    this.worldCombatVfxOptions.combatVfxEnabled = combatVfxEnabled;
    this.worldCombatVfxOptions.isPaused = options?.isPaused;
    renderWorldCombatVfx(ctx, engine, camera, this.worldCombatVfxOptions);

    ctx.restore(); // END WORLD SPACE PASS (TRANSLATED BY CAMERA)

    // 9. LIGHTING PASS (SCREEN SPACE)
    let lightingMs = 0;
    if (lightingEnabled) {
      const tLightStart = now();
      const isNight = isNightPhase(phase.id);
      if ((isNight && engine.lightSources && engine.lightSources.length > 0) || kurazRatio < 0.25) {
        renderStorybookLightingComposite(
          ctx,
          width,
          height,
          camera,
          engine.lightSources || EMPTY_RENDER_ITEMS,
          phase.id,
          kurazRatio,
          curLvl.season === 'winter',
          engine.shadowZones || EMPTY_RENDER_ITEMS,
          performanceProfile === 'performance' ? EMPTY_LIGHT_OCCLUDERS : (engine.occluders || EMPTY_LIGHT_OCCLUDERS),
          performanceProfile,
          true
        );
      }
      lightingMs = now() - tLightStart;
    }

    // 10. OFF-SCREEN INDICATORS PASS (HEAVY ANCHORS)
    const hpPct = playerHp / (playerMaxHp || 1);
    const dropsArray = engine?.drops ?? [];
    const deltaTimeSeconds = options?.deltaTimeSeconds ?? 1 / 60;
    this.indicatorController.update(dropsArray, camera, Math.max(0, Math.min(0.1, deltaTimeSeconds)), hpPct);
    this.indicatorController.render(ctx);

    const totalMs = now() - tStart;

    if (outMetrics) {
      outMetrics.renderedEntities = renderedEntities;
      outMetrics.renderedDecor = renderedDecor;
      outMetrics.activeChunks = activeChunks;
      outMetrics.renderedProjectiles = renderedProjectiles;
      outMetrics.renderedSlashes = this.projectileMetrics.renderedSlashes;
      outMetrics.drawableCapacity = this.drawableCapacity;
      outMetrics.culledEntities = this.culledEntities;
      outMetrics.renderedDrops = renderedDrops;
      outMetrics.renderedParticles = renderedParticles;
      outMetrics.timings.backdropMs = backdropMs;
      outMetrics.timings.staticDecorMs = staticDecorMs;
      outMetrics.timings.entitiesMs = entitiesMs;
      outMetrics.timings.worldEffectsMs = worldEffectsMs;
      outMetrics.timings.projectilesMs = projectilesMs;
      outMetrics.timings.dropsMs = dropsMs;
      outMetrics.timings.particlesMs = particlesMs;
      outMetrics.timings.lightingMs = lightingMs;
      outMetrics.timings.combatTextsMs = combatTextsMs;
      outMetrics.timings.totalMs = totalMs;
      return outMetrics;
    }

    return {
      renderedEntities,
      renderedDecor,
      activeChunks,
      renderedProjectiles,
      renderedSlashes: this.projectileMetrics.renderedSlashes,
      drawableCapacity: this.drawableCapacity,
      culledEntities: this.culledEntities,
      renderedDrops,
      renderedParticles,
      timings: {
        backdropMs,
        staticDecorMs,
        entitiesMs,
        worldEffectsMs,
        projectilesMs,
        dropsMs,
        particlesMs,
        lightingMs,
        combatTextsMs,
        totalMs,
      },
    };
  }
}

export const defaultArenaRenderer = new ArenaRenderer();

export function renderArenaEntities(
  ctx: CanvasRenderingContext2D,
  engine: EngineState,
  camera: CameraViewport,
  options?: ArenaEntityPassOptions
): number {
  return defaultArenaRenderer.renderEntities(ctx, engine, camera, options);
}

export function renderArena(
  ctx: CanvasRenderingContext2D,
  engine: EngineState,
  camera: CameraViewport,
  options?: ArenaRenderOptions,
  outMetrics?: ArenaRenderMetrics
): ArenaRenderMetrics {
  return defaultArenaRenderer.renderArena(ctx, engine, camera, options, outMetrics);
}
