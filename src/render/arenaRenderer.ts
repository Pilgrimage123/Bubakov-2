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
import { renderParticles, ParticleBatchRenderer } from './renderParticles';
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
import {
  isEntityBehindMarchRoof,
  hasRoofsInView,
  ROOF_UNION_MIN_X,
  ROOF_UNION_MAX_X,
  ROOF_UNION_MIN_Y,
  ROOF_UNION_MAX_Y,
  type MarchRoofZone,
} from '../data/marchThawArena';
import {
  drawMarchRoofOverlay,
} from './marchThawSvgLandscape';
import {
  renderSunForegroundOverlay,
  createDefaultSunOverlayConfig,
  createReusableSunFrameState,
  type SunOverlayConfig,
  type SunComputedFrameState,
} from './sunForegroundRenderer';

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
  sunOverlayConfig?: SunOverlayConfig;
  sunFrameState?: SunComputedFrameState;
  skipSunInArenaPass?: boolean;
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
  private readonly particleRenderer = new ParticleBatchRenderer();
  private readonly projectileMetrics: ProjectileRenderMetrics = {
    renderedProjectiles: 0,
    renderedSlashes: 0,
  };
  private readonly entityPassOptions: ArenaEntityPassOptions = {};
  private readonly telegraphOptions: TelegraphRenderOptions = {};
  private readonly worldHazardOptions: WorldHazardsRenderOptions = {};
  private readonly worldCombatVfxOptions: WorldHazardsRenderOptions = {};
  private readonly defaultSunConfig: SunOverlayConfig = createDefaultSunOverlayConfig();
  private readonly defaultSunState: SunComputedFrameState = createReusableSunFrameState();
  private readonly frostlingsScratch: any[] = [];
  private readonly glyphOptionsScratch: { size: number; color?: string; alpha?: number } = {
    size: 18,
    color: '#FFFFFF',
    alpha: 1,
  };

  public ensureDrawableCapacity(required: number): void {
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

  public addDrawable(drawable: any): void {
    if (this.drawableCount >= this.drawableCapacity) {
      this.ensureDrawableCapacity(this.drawableCount + 1);
    }
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

    // Grow buffer before the render loop based on visible candidate capacity requirements
    const maxCandidateEntities = (engine.player ? 1 : 0) + (engine.enemies ? engine.enemies.length : 0);
    this.ensureDrawableCapacity(maxCandidateEntities);

    let visibleFrostlingCount = 0;

    if (engine.player) {
      const pr = engine.player.radius || 24;
      if (
        engine.player.x + pr >= viewLeft &&
        engine.player.x - pr <= viewRight &&
        engine.player.y + pr >= viewTop &&
        engine.player.y - pr <= viewBottom
      ) {
        this.preallocatedDrawables[this.drawableCount++] = engine.player;
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
        if (
          enemy.x + radius >= viewLeft &&
          enemy.x - radius <= viewRight &&
          enemy.y + radius >= viewTop &&
          enemy.y - radius <= viewBottom
        ) {
          if (
            (enemy.id === 'mrazovy_skritek' || enemy.method === 'drawFrostling') &&
            enemy.id !== 'mrazivy_obr' &&
            !enemy.isDefeated
          ) {
            visibleFrostlingCount++;
          }
          this.preallocatedDrawables[this.drawableCount++] = enemy;
        } else {
          this.culledEntities++;
        }
      }
    }

    if (options?.combatVfxEnabled !== false && engine.smokePuffs && engine.smokePuffs.length > 0) {
      for (let i = 0; i < engine.smokePuffs.length; i++) {
        const puff = engine.smokePuffs[i];
        if (!puff || puff.dead) continue;
        const radius = (puff.radius || 15) * 2;
        if (
          puff.x + radius >= viewLeft &&
          puff.x - radius <= viewRight &&
          puff.y + radius >= viewTop &&
          puff.y - radius <= viewBottom
        ) {
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

    // Render mrazovy_skritek frost auras on the ground layer before characters with overlap attenuation.
    // Early exits in O(1) if no visible frostlings are on screen; compares only frostlings with each other.
    if (options?.combatVfxEnabled !== false && visibleFrostlingCount > 0) {
      const overlapRadiusSq = (FROSTLING_AURA_RADIUS * 1.15) * (FROSTLING_AURA_RADIUS * 1.15);
      const frostlings = this.frostlingsScratch;
      frostlings.length = 0;
      for (let i = 0; i < this.drawableCount; i++) {
        const d = this.preallocatedDrawables[i];
        if (
          d &&
          (d.id === 'mrazovy_skritek' || d.method === 'drawFrostling') &&
          d.id !== 'mrazivy_obr' &&
          !d.isDefeated
        ) {
          frostlings.push(d);
        }
      }

      for (let i = 0; i < frostlings.length; i++) {
        const d = frostlings[i];
        let overlapCount = 1;
        for (let j = 0; j < frostlings.length; j++) {
          if (i === j) continue;
          const other = frostlings[j];
          const dx = d.x - other.x;
          const dy = d.y - other.y;
          if (dx * dx + dy * dy <= overlapRadiusSq) {
            overlapCount++;
          }
        }
        Lada.drawFrostlingAura(ctx, d.x, d.y, d.animTime || 0, overlapCount);
        d._auraDrawnInGroundPass = true;
      }
      frostlings.length = 0;
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
    let renderedSlashes = 0;
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

    // 4b. ROOF OCCLUSION PASS FOR CHARACTERS & DROPS (chalupy, hospoda, škola, mlýn, kostel)
    this.renderRoofOcclusionPass(ctx, engine, camera);
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
      renderProjectilesAndSlashes(
        ctx,
        engine.projectiles || EMPTY_RENDER_ITEMS,
        engine.slashes || EMPTY_RENDER_ITEMS,
        camera,
        engine.uiTime || 0,
        this.projectileMetrics
      );
      renderedProjectiles = this.projectileMetrics.renderedProjectiles;
      renderedSlashes = this.projectileMetrics.renderedSlashes;
    }
    const projectilesMs = now() - tProjStart;

    // 7. PARTICLES PASS
    const tParticlesStart = now();
    if (combatVfxEnabled && engine.particles && engine.particles.length > 0) {
      renderedParticles = this.particleRenderer.render(ctx, engine.particles, camera);
    }
    const particlesMs = now() - tParticlesStart;

    // 8. COMBAT FLOATING TEXTS PASS (ZERO-ALLOCATION GLYPH PASS)
    let combatTextsMs = 0;
    if (combatTextsEnabled && engine.texts && engine.texts.length > 0) {
      const tTextsStart = now();
      const glyphOpts = this.glyphOptionsScratch;
      for (let i = 0; i < engine.texts.length; i++) {
        const txt = engine.texts[i];
        const sz = txt.size || 18;
        if (
          txt.x + sz < viewLeft ||
          txt.x - sz > viewRight ||
          txt.y + sz < viewTop ||
          txt.y - sz > viewBottom
        ) {
          continue;
        }
        if (!shouldDrawCombatText(txt.category, txt.text)) {
          continue;
        }
        if (typeof txt.draw === 'function') {
          txt.draw(ctx);
        } else if (txt.text) {
          glyphOpts.size = sz;
          glyphOpts.color = txt.color;
          glyphOpts.alpha = txt.life;
          drawGlyphText(ctx, txt.text, txt.x, txt.y, glyphOpts);
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

    // 11. STAGE 1 FOREGROUND SUN & 6-PLANE 3D PARALLAX OVERLAY PASS (CLOSEST TO CAMERA)
    // Rendered after all entities, roofs, projectiles, particles, floating combat texts, world VFX,
    // lighting, and off-screen indicators so NOTHING in the arena ever covers the sun.
    const isStageOneDaylight =
      (curLvl && curLvl.id === 0) ||
      (engine.activeLevelId === 0 && (!curLvl || curLvl.id === undefined || curLvl.id === 0));
    if (isStageOneDaylight && !options?.skipSunInArenaPass) {
      const tSunStart = now();
      const screenW = camera.zoom && camera.zoom !== 1 ? Math.round(width * camera.zoom) : width;
      const screenH = camera.zoom && camera.zoom !== 1 ? Math.round(height * camera.zoom) : height;
      const sunConfig = options?.sunOverlayConfig || this.defaultSunConfig;
      const sunState = options?.sunFrameState || this.defaultSunState;
      renderSunForegroundOverlay(
        ctx,
        screenW,
        screenH,
        camera.x,
        camera.y,
        engine.gameTime || 0,
        engine.uiTime || 0,
        sunConfig,
        sunState,
        'all'
      );
      if (lightingEnabled) {
        lightingMs += now() - tSunStart;
      }
    }

    const totalMs = now() - tStart;

    if (outMetrics) {
      outMetrics.renderedEntities = renderedEntities;
      outMetrics.renderedDecor = renderedDecor;
      outMetrics.activeChunks = activeChunks;
      outMetrics.renderedProjectiles = renderedProjectiles;
      outMetrics.renderedSlashes = renderedSlashes;
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
      renderedSlashes,
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

  private occludedEntitiesScratch: any[] = [];
  private occludedDropsScratch: any[] = [];
  private activeRoofZonesScratch: MarchRoofZone[] = [];

  private registerRoofZone(zone: MarchRoofZone): void {
    const activeRoofZones = this.activeRoofZonesScratch;
    for (let i = 0; i < activeRoofZones.length; i++) {
      if (activeRoofZones[i].id === zone.id) return;
    }
    activeRoofZones.push(zone);
  }

  private checkRoofEntity(
    ent: any,
    levelId: number,
    decor: any[] | undefined,
    viewLeft: number,
    viewTop: number,
    viewRight: number,
    viewBottom: number
  ): void {
    if (!ent || ent.dead || ent.isDefeated || typeof ent.draw !== 'function') return;
    const r = (ent.radius || 24) + 60;
    if (ent.x + r < viewLeft || ent.x - r > viewRight || ent.y + r < viewTop || ent.y - r > viewBottom) return;
    const zone = isEntityBehindMarchRoof(ent.x, ent.y, levelId, decor);
    if (zone) {
      this.registerRoofZone(zone);
      this.occludedEntitiesScratch.push(ent);
    }
  }

  /**
   * When the player, NPCs, enemies, or drops pass behind a cottage roof or church spire,
   * draws those roofs over them and renders a subtle 32%-opacity silhouette of occluded characters.
   */
  private renderRoofOcclusionPass(
    ctx: CanvasRenderingContext2D,
    engine: EngineState,
    camera: CameraViewport
  ): void {
    const levelId = engine.activeLevelId ?? 0;
    const decor = engine.decor;
    const { viewLeft, viewTop, viewRight, viewBottom } = camera;

    // Fast-exit: If no cottage, tavern, church, or decor roofs intersect the camera frustum,
    // skip the entire occlusion test over all drops and entities in O(1).
    if (!hasRoofsInView(levelId, decor, viewLeft, viewTop, viewRight, viewBottom)) {
      return;
    }

    const occludedEntities = this.occludedEntitiesScratch;
    const occludedDrops = this.occludedDropsScratch;
    const activeRoofZones = this.activeRoofZonesScratch;
    occludedEntities.length = 0;
    occludedDrops.length = 0;
    activeRoofZones.length = 0;

    this.checkRoofEntity(engine.player, levelId, decor, viewLeft, viewTop, viewRight, viewBottom);
    this.checkRoofEntity(engine.grandfather, levelId, decor, viewLeft, viewTop, viewRight, viewBottom);
    this.checkRoofEntity(engine.companion, levelId, decor, viewLeft, viewTop, viewRight, viewBottom);

    if (engine.enemies) {
      for (let i = 0; i < engine.enemies.length; i++) {
        this.checkRoofEntity(engine.enemies[i], levelId, decor, viewLeft, viewTop, viewRight, viewBottom);
      }
    }

    if (engine.drops) {
      for (let i = 0; i < engine.drops.length; i++) {
        const d = engine.drops[i];
        if (!d || d.collected || d.dead) continue;
        if (d.x + 40 < viewLeft || d.x - 40 > viewRight || d.y + 40 < viewTop || d.y - 40 > viewBottom) continue;
        const zone = isEntityBehindMarchRoof(d.x, d.y, levelId, decor);
        if (zone) {
          this.registerRoofZone(zone);
          occludedDrops.push(d);
        }
      }
    }

    if (activeRoofZones.length === 0) return;

    // 1. Draw the roof overlay for every occupied roof zone so the roof covers the sun and characters behind it
    for (let i = 0; i < activeRoofZones.length; i++) {
      const zone = activeRoofZones[i];
      let matchingDecor: any = undefined;
      if (zone.id.startsWith('decor-roof-') && decor) {
        const idx = Number(zone.id.slice('decor-roof-'.length));
        if (!Number.isNaN(idx) && decor[idx]) {
          matchingDecor = decor[idx];
        }
      }
      drawMarchRoofOverlay(ctx, zone.id, matchingDecor);
    }

    // 2. Draw subtle semi-transparent silhouette of occluded drops & entities on top of the roof
    if (occludedDrops.length > 0 || occludedEntities.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      if (occludedDrops.length > 0) {
        renderDrops(ctx, occludedDrops, camera, engine.player);
      }
      for (let i = 0; i < occludedEntities.length; i++) {
        const ent = occludedEntities[i];
        ent.draw(ctx);
      }
      ctx.restore();
    }

    occludedEntities.length = 0;
    occludedDrops.length = 0;
    activeRoofZones.length = 0;
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
