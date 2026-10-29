/**
 * ============================================================================
 * BUBÁKOV – ANIMOVANÁ LADOVSKÁ EDICE
 * ============================================================================
 * Production React/TypeScript game. The repository is the canonical editable
 * source; production deployments use the normal Vite build output.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createInitialEngineState, type EngineState } from './game/engineState';
import { FrameProfiler } from './game/frameProfiler';
import { GameEngine } from './game/engine';
import {
  getKrajanekBlockingHp,
  getKrajanekMomentumMultiplier,
  getKrajanekStoneRadius,
  computeKrajanekSteering,
  stepKrajanekRide,
  stepKrajanekCoastingStones,
  isPlayerAbilityActive,
  KRAJANEK_RIDE_DURATION,
  KRAJANEK_RIDE_SPEED_MULTIPLIER,
} from './game/krajanekAbility';
import { VirtualLeaderCrowWave, CROW_WAVE_HIT_RADIUS } from './game/virtualLeaderCrowWave';
import { VirtualLeaderSnowmanHorde, SNOWMAN_HORDE_HIT_RADIUS } from './game/virtualLeaderSnowmanHorde';
import { getCachedHomingTarget } from './game/homing';
import { isDirectTargetable, isJezinkaSemiVisible, JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER } from './game/targeting';
import { stepCrowForaging, restoreStolenBundleDrops } from './game/crowForaging';
import { CosmeticRingPool } from './game/cosmeticRingPool';
import { tryEmitParticle, tryEmitParticleBurst, getParticleLimit } from './game/particles';
import { SpatialHash } from './game/spatialHash';
import { distanceSq, isInView } from './game/perf';
import {
  CharacterType,
  Season,
  GameLevelId,
  MetaProgression,
  DayPhase,
  EnemyAttackCadence,
  Enemy,
  DropType,
  EnemyPrefixType,
  ENEMY_PREFIX_DEFS,
} from './types';
import {
  COLORS,
  DAY_PHASES,
  getCurrentDayPhase,
  ENEMY_POINTS,
  DROP_THRESHOLDS,
  GRANNY_CUTSCENE,
  DAWN_TIME_SECONDS,
} from './constants';
import { GAME_LEVELS, isLevelUnlocked, GameLevelDef } from './data/levels';
import { sound } from './audio';
import {
  DEFAULT_GAME_EFFECT_SETTINGS,
  setGameEffectSettings,
  isGameEffectEnabled,
  shouldDrawFloatingText,
  type EffectCategory,
  DEFAULT_COMBAT_TEXT_SETTINGS,
  TACTICAL_COMBAT_TEXT_SETTINGS,
  setCombatTextSettings,
  getCombatTextPreset,
  getSettingsForPreset,
  type CombatTextPreset,
  shouldDrawCombatText,
  shouldShowWarningBanner,
  isCombatTextCategoryEnabled,
  inferCombatTextCategory,
  type CombatTextSettings,
  type CombatTextCategory,
} from './game/effectSettings';
import { FROSTLING_AURA_RADIUS, getFrostAuraHealingMultiplier } from './game/frostAura';
import { HUNTER_DETAILS, type HunterDetail, type HunterDetailKey } from './data/hunterDetails';
import { WEAPONS, createWeaponMasteryState } from './data/weapons';
import { getMilestoneChoice, getMilestoneChoices, getRankedWeaponStats, getWeaponRankDef, getEffectiveWeaponCooldown, ensureWeaponMilestones, COOLDOWN_REDUCTION_CAP, getWeaponActiveCooldownBonus, rollRandomWeaponUpgrade } from './data/weaponMilestones';
import { ENEMIES } from './data/enemies';
import { getGingerbreadSize, getGingerbreadValue, GINGERBREAD_CONFIG, GINGERBREAD_VALUES, type GingerbreadSize } from './data/gingerbread';
import {
  isUnholyEnemy,
  getEnemyHolyResistance,
  getHolyDamageMultiplier,
  getHolyPushMultiplier,
} from './data/holy';
import { TROPHIES } from './data/trophies';
import {
  Lada,
  drawEnemyRenderer,
  drawEnemyWarningSign,
  drawStunStars,
  drawValecniceCompanion,
  getEnemyAttackAnimationState,
  drawEnemyAttackEffectsPre,
  drawEnemyAttackEffectsPost,
  drawPrefixAura,
  drawGingerbreadHeartCanvas,
} from './render/ladaRenderer';
import { getGlobalBakedBubakAtlas } from './render/bakedBubakAtlas';
import { drawGlyphText, resetGlobalGlyphAtlas } from './render/glyphAtlas';
import { ChunkBitmapCache } from './render/chunkCache';
import {
  renderArena,
  createReusableRenderMetrics,
  type CameraViewport,
  type ArenaRenderOptions,
  type ArenaRenderMetrics,
} from './render/arenaRenderer';
import {
  createDefaultSunOverlayConfig,
  createReusableSunFrameState,
  type SunOverlayConfig,
  type SunComputedFrameState,
} from './render/sunForegroundRenderer';
import { SunDebugHudPanel, type SunDebugLiveTelemetry } from './components/SunDebugHudPanel';
import {
  getPetrolejkaRadius,
  isPositionIlluminated,
  evaluateShadowDefense,
  getShadowDefenseMultipliers,
  updateLightSources,
  evaluateBludickaAura,
  createOsikovySlashLight,
  createHolyCathedralLight,
  createGarlicHearthSpark,
  createCertEmberLight,
  seedLightingAndOccludersFromDecor,
  type DynamicLightSource,
} from './game/storybookLighting';
import {
  getStorybookSnowColor,
  drawCottageWindowLight,
  drawBoziMukaDecor,
  drawArchitecturalSunShadow,
  renderStorybookLightingComposite,
  drawNormalMappedReliefRim,
} from './render/storybookLightingRenderer';
import { AppModals } from './components/AppModals';
import { VillageView } from './components/VillageView';
import {
  calculateTotalVillageInvested,
  getWallDamageReduction,
  getForestDebuffReduction,
  getMillSpeedMultiplier,
  getScarecrowPickupMultiplier,
  getWallHpMultiplier,
  getBoziMukaLuckMultiplier,
  getUndeadTolarChance,
  getChurchWaveDamage
} from './data/village';
import { TouchControls } from './components/TouchControls';
import { getHunterProgress, HUNTER_UNLOCKS, HunterProgress, getActiveUnlockingHunter } from './data/hunterUnlocks';
import { getWeaponProgress, WEAPON_UNLOCKS, WeaponProgress, getActiveUnlockingWeapon } from './data/weaponUnlocks';
import {
  getLevelProgress,
  LEVEL_UNLOCKS,
  LevelProgress,
  getActiveUnlockingLevel,
  isLevelFullyUnlocked,
} from './data/levelUnlocks';
import { GameIcon } from './components/GameIcon';
import { CzechBuchtaIcon } from './components/CzechBuchtaIcon';
import { KrejcarIcon } from './components/KrejcarIcon';
import { PernicekIcon } from './components/PernicekIcon';
import { BubakovCoverTitle } from './components/BubakovCoverTitle';
import { LadaFrieze } from './components/LadaFrieze';
import { LadaCartouche } from './components/LadaCartouche';
import { LadaCoverScene } from './components/LadaCoverScene';
import { LadaCardCorners } from './components/LadaCardCorners';
import { LadaBotanicalFlourish } from './components/LadaBotanicalFlourish';
import { LadaHudBotanicalDecor } from './components/LadaHudBotanicalDecor';
import { GrandfatherShop } from './components/GrandfatherShop';
import { WeaponMilestoneModal } from './components/WeaponMilestoneModal';
import type { PendingMilestoneChoice } from './game/engineState';
import { gamepadManager, type InputDeviceMode } from './game/gamepad';
import { isInteractiveArenaDrop } from './render/renderDrops';
import { RunDirector, DYNAMIC_DIFFICULTY_PRESETS, getDifficultyPreset } from './game/director';
import {
  canCollectDrop,
  MAX_DROPS_LIMIT,
  hasPendingDrops,
  spawnDropWithLimit,
  releasePendingDrops,
  performDropFusion,
  applyRareItemEffect,
  applyAnanasUpgrade,
  applyMagnetWave,
  pullWhipLoot,
  canSpawnRareBattleDrop,
  rollRareBattleDrop,
  getRareDropAnnouncement,
  resolveDynamicDrop,
  selectWeightedDropType,
  countActiveSoulDrops,
  sweepCoinsIntoBigPouches,
  refundExpiredHotGingerbread,
  isHealingDrop,
  createFolkloreDropTracker,
  evaluateFolkloreDrop,
  createSwarmDropReservoir,
  accumulateSwarmDrop,
  shouldReleaseSwarmReservoir,
  releaseSwarmReservoir,
  FAR_KILL_DISTANCE,
  HOT_GINGERBREAD_DURATION,
  EMERGENCY_HEALTH_RATIO,
  FOOD_DROP_EXPIRATION,
  SOUL_DROP_EXPIRATION,
} from './game/drops';
import { toCanonicalWeaponId, toCanonicalHunterId, toCanonicalEnemyId, migrateMetaProgression, createDefaultMetaProgression } from './game/migration';
import {
  chooseGrandfatherOffers,
  getGrandfatherPrice,
  getGrandfatherRerollCost,
  getGrandfatherInflatingPurchaseCount,
  getWeaponUpgradeOffer,
  replaceCourageOffersIfNeeded,
} from './game/grandfatherRuntime';
import { GRANDFATHER_ITEMS, getGrandfatherItem, type GrandfatherItemDef } from './data/grandfatherItems';
import { SYNERGISTIC_UPGRADES, getSynergisticUpgrade } from './data/synergisticUpgrades';
import {
  MARCH_MARIAN_APPARITION_COOLDOWN,
  MARCH_THAW_DECOR,
  MARCH_THAW_POIS,
  clampToMarchArenaBounds,
  collideCircleWithObstacles,
  getActiveMarchForestZone,
  getMarchWaterAndFloeEffect,
  hasTerrainLineOfSight,
  isAquaticEnemy,
  isInsideMarchPoi,
  pickMarchForestSpawnPoint,
  resolveMarchThawObstacles,
  sanitizeArenaSpawnPoint,
} from './data/marchThawArena';
import { drawMarchThawDynamicLandmark } from './render/marchThawSvgLandscape';

// Helper to render portrait canvases according to unlock tier (0 = 0-24%, 1 = 25-49%, 2 = 50-74%, 3 = 75-99%, 4 = 100%)
// Locked portraits (tier < 4) are pre-rendered statically once per tier change to eliminate 60 FPS menu draw overhead.
function renderHunterPortrait(
  canvas: HTMLCanvasElement | null,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, dx: number, dy: number, flee: boolean, scale: number) => void,
  tier: number,
  t: number
) {
  if (!canvas) return;
  if (tier < 4 && (canvas as any)._cachedTier === tier) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 180, 180);

  if (tier === 4) {
    // 100%: Normal, fully unlocked vivid animation
    (canvas as any)._cachedTier = undefined;
    drawFn(ctx, 90, 120, t, 0, 0, false, 1.4);
    return;
  }

  // Draw base figure first with static pose
  drawFn(ctx, 90, 120, 0, 0, 0, false, 1.4);

  if (tier === 3) {
    // 75% - 99%: Nearly full color, but with a golden lock mist and mystic veil
    ctx.save();
    ctx.fillStyle = 'rgba(243, 233, 210, 0.22)';
    ctx.fillRect(0, 0, 180, 180);
    ctx.strokeStyle = '#D9A036';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 168, 168);
    ctx.fillStyle = 'rgba(45, 25, 10, 0.85)';
    ctx.fillRect(25, 148, 130, 22);
    ctx.strokeStyle = '#D9A036';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 148, 130, 22);
    drawGlyphText(ctx, '⚡ 75 % ODHALENO', 90, 159, { size: 18, color: '#FEF3C7', alpha: 1 });
    ctx.restore();
  } else if (tier === 2) {
    // 50% - 74%: Sepia / monochrome charcoal sketch. Distinct shapes, hat, and props visible
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(92, 72, 50, 0.78)';
    ctx.fillRect(0, 0, 180, 180);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(235, 222, 198, 0.3)';
    ctx.fillRect(0, 0, 180, 180);
    ctx.fillStyle = 'rgba(45, 25, 10, 0.85)';
    ctx.fillRect(25, 148, 130, 22);
    ctx.strokeStyle = '#D9A036';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 148, 130, 22);
    drawGlyphText(ctx, '🔎 50 % ODHALENO', 90, 159, { size: 18, color: '#FEF3C7', alpha: 1 });
    ctx.restore();
  } else if (tier === 1) {
    // 25% - 49%: Deep charcoal silhouette, rough outline visible
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = '#241E18';
    ctx.fillRect(0, 0, 180, 180);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(25, 20, 15, 0.35)';
    ctx.fillRect(0, 0, 180, 180);
    ctx.fillStyle = 'rgba(30, 20, 10, 0.9)';
    ctx.fillRect(25, 148, 130, 22);
    ctx.strokeStyle = '#8C5A35';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 148, 130, 22);
    drawGlyphText(ctx, '🔍 25 % ODHALENO', 90, 159, { size: 18, color: '#F3E9D2', alpha: 1 });
    ctx.restore();
  } else {
    // 0% - 24%: Pitch-black silhouette shrouded in dense mystery fog with glowing question mark
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 180, 180);
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createRadialGradient(90, 90, 15, 90, 90, 85);
    grad.addColorStop(0, 'rgba(35, 28, 20, 0.65)');
    grad.addColorStop(1, 'rgba(12, 10, 8, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 180, 180);
    ctx.fillStyle = '#D9A036';
    ctx.font = '900 48px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 90, 80);
    ctx.fillStyle = 'rgba(25, 15, 10, 0.9)';
    ctx.fillRect(25, 148, 130, 22);
    ctx.strokeStyle = '#5E3A21';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 148, 130, 22);
    drawGlyphText(ctx, '🔒 ZAMČENO (0 %)', 90, 159, { size: 18, color: '#D4CBBA', alpha: 1 });
    ctx.restore();
  }
  (canvas as any)._cachedTier = tier;
}

/** Allocation-free cleanup for frequently mutated entity arrays. */
const keepLiveParticle = (particle: any): boolean => particle.life > 0;
const keepLiveText = (text: any): boolean => text.life > 0;
const keepLiveSmokePuff = (puff: any): boolean => !puff.dead;
const keepLiveDrop = (drop: any): boolean => !drop.dead;
const keepLiveProjectile = (projectile: any): boolean => !projectile.dead;
const keepLiveSlash = (slash: any): boolean => !slash.dead;
const keepLiveEnemy = (enemy: any): boolean => !enemy.dead;
function compactInPlace<T>(items: T[], keep: (item: T) => boolean): void {
  let write = 0;
  for (let read = 0; read < items.length; read++) {
    const item = items[read];
    if (keep(item)) items[write++] = item;
  }
  items.length = write;
}

// Keep HUD changes perceptually smooth while avoiding a React render for every
// simulation frame. Event-driven changes (level-ups, warnings, rewards) still
// update immediately through their existing setters.
const HUD_SYNC_INTERVAL_SECONDS = 0.15;
const MAX_PARTICLES = 300;
const MAX_DAMAGE_TEXTS = 40;

let fogPuffCanvas: HTMLCanvasElement | null = null;
function getFogPuffCanvas(): HTMLCanvasElement {
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
  return fogPuffCanvas!;
}

// Floating damage / status text
class DamageText {
  x: number = 0;
  y: number = 0;
  text: string = '';
  color: string = COLORS.white;
  life: number = 1.0;
  size: number = 18;
  vy: number = -45;
  numericVal: number | null = null;
  category: CombatTextCategory = 'enemyDamage';
  icon?: string;

  constructor(
    x: number = 0,
    y: number = 0,
    text: string = '',
    color = COLORS.white,
    big = false,
    category?: CombatTextCategory,
    icon?: string
  ) {
    this.reset(x, y, text, color, big, category, icon);
  }

  reset(
    x: number,
    y: number,
    text: string,
    color = COLORS.white,
    big = false,
    category?: CombatTextCategory,
    icon?: string
  ): void {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;
    this.numericVal = null;

    // Pokud text obsahuje americkou sušenku 🍪 nebo je předána ikona gingerbread:
    if (icon) {
      this.icon = icon;
      this.text = String(text || '').replace(/🍪/g, '').replace(/\s{2,}/g, ' ').trim();
    } else if (typeof text === 'string' && text.includes('🍪')) {
      this.icon = 'gingerbread';
      this.text = text.replace(/🍪/g, '').replace(/\s{2,}/g, ' ').trim();
    } else {
      this.icon = undefined;
      this.text = text;
    }

    this.category = category || (this.icon === 'gingerbread' ? 'lootResources' : inferCombatTextCategory(text));
    if (this.text && this.text.charCodeAt(0) >= 48 && this.text.charCodeAt(0) <= 57) {
      const parsed = parseInt(this.text, 10);
      if (!Number.isNaN(parsed) && String(parsed) === this.text) {
        this.numericVal = parsed;
      }
    }
  }

  addAmount(amount: number) {
    if (this.numericVal !== null) {
      this.numericVal += Math.round(amount);
      this.text = String(this.numericVal);
      this.life = Math.min(1.0, this.life + 0.35);
      this.vy = -35;
      this.size = Math.min(26, this.size + 1.2);
    }
  }

  update(dt: number) {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.icon === 'gingerbread' || this.icon === 'pernicek') {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.font = `900 ${this.size}px Eczar, serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const text = this.text;
      const textW = text ? ctx.measureText(text).width : 0;
      const iconSize = Math.round(this.size * 0.95);
      const gap = text ? 6 : 0;
      const totalW = textW + gap + iconSize;
      const startX = this.x - totalW / 2;

      if (text) {
        ctx.textAlign = 'left';
        ctx.strokeText(text, startX, this.y);
        ctx.fillText(text, startX, this.y);
      }

      const iconX = startX + textW + gap + iconSize / 2;
      const iconY = this.y - this.size * 0.32;
      drawGingerbreadHeartCanvas(ctx, iconX, iconY, iconSize);
      ctx.restore();
    } else if (this.text) {
      drawGlyphText(ctx, this.text, this.x, this.y, { size: this.size, color: this.color, alpha: this.life });
    }
  }
}

const appDamageTextPool = new CosmeticRingPool<DamageText>(MAX_DAMAGE_TEXTS, () => new DamageText(0, 0, ''));

/**
 * ADR 0016: Pre-allocation check for combat floating text.
 * Prevents heap allocation completely by utilizing a bounded ring pool.
 */
function pushDamageText(
  texts: DamageText[] | undefined,
  x: number,
  y: number,
  text: string,
  color = COLORS.white,
  big = false,
  category?: CombatTextCategory,
  icon?: string
): DamageText | null {
  if (!texts) return null;
  const resolvedCategory = category || (icon === 'gingerbread' || (typeof text === 'string' && text.includes('🍪')) ? 'lootResources' : inferCombatTextCategory(text));
  if (!isCombatTextCategoryEnabled(resolvedCategory)) {
    return null;
  }
  const item = appDamageTextPool.acquire();
  item.reset(x, y, text, color, big, resolvedCategory, icon);
  if (!texts.includes(item)) {
    texts.push(item);
  }
  return item;
}

/**
 * Centrally controlled particle emission respecting combatVfxEnabled & dynamic governor ceiling.
 */
function emitParticle(
  particles: any[] | undefined,
  particleOrFactory: any | (() => any),
  activeMax = MAX_PARTICLES,
  profile?: string
): boolean {
  if (!isGameEffectEnabled('combatVfxEnabled')) return false;
  if (!particles) return false;
  const limit = Math.min(activeMax, getParticleLimit(profile));
  if (particles.length >= limit) return false;
  const p = typeof particleOrFactory === 'function' ? particleOrFactory() : particleOrFactory;
  particles.push(p);
  return true;
}

function canEmitCombatParticle(particles?: any[], activeMax = MAX_PARTICLES): boolean {
  if (!isGameEffectEnabled('combatVfxEnabled')) return false;
  return (particles ? particles.length : 0) < activeMax;
}

function syncPlayerWeaponCache(player: any): void {
  if (!player || !player.weapons) return;
  player._hromnickaWeapon = player.weapons.find((w: any) => w.id === 'hromnicka') || null;
  player._valecniceWeapon = player.weapons.find((w: any) => w.id === 'valecnice') || null;
  player._garlicWeapon =
    player.weapons.find((w: any) => w.id === 'cesnekova-topinka' || w.id === 'cesnekova_topinka') || null;
}

// Nicely animated comic smoke puff in authentic Josef Lada fairy tale art style
class SmokePuff {
  x: number;
  y: number;
  radius: number;
  time: number;
  duration: number;
  dead: boolean;
  kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke';
  damagePerSecond = 0;
  damageAccumulator = 0;
  lobes: Array<{
    ox: number;
    oy: number;
    r: number;
    vx: number;
    vy: number;
  }>;
  wisps: Array<{
    ox: number;
    oy: number;
    scale: number;
    rot: number;
    rotSpd: number;
    vy: number;
  }>;
  poofDots: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
  }>;
  crumbs: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rot: number;
  }>;

  constructor(x: number, y: number, radius = 24, kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke', duration = 1.25) {
    this.x = x;
    this.y = y;
    this.radius = Math.max(8, radius);
    this.kind = kind;
    this.time = 0;
    this.duration = duration;
    this.dead = false;

    // Billowing cloud lobes
    this.lobes = [];
    const count = 7;
    // Main central lobe
    this.lobes.push({
      ox: 0,
      oy: -this.radius * 0.1,
      r: this.radius * 0.78,
      vx: 0,
      vy: -22,
    });
    // Perimeter billowing lobes
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const dist = this.radius * (0.45 + Math.random() * 0.35);
      const r = this.radius * (0.42 + Math.random() * 0.28);
      const pushSpeed = 18 + Math.random() * 20;
      this.lobes.push({
        ox: Math.cos(angle) * dist,
        oy: Math.sin(angle) * dist * 0.85,
        r,
        vx: Math.cos(angle) * pushSpeed,
        vy: Math.sin(angle) * pushSpeed * 0.6 - 28 - Math.random() * 15,
      });
    }

    // Cartoon curling smoke wisps
    this.wisps = [];
    for (let i = 0; i < 3; i++) {
      const ang = Math.random() * Math.PI * 2;
      this.wisps.push({
        ox: Math.cos(ang) * this.radius * 0.5,
        oy: Math.sin(ang) * this.radius * 0.4 - 10,
        scale: 0.6 + Math.random() * 0.5,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 3,
        vy: -35 - Math.random() * 25,
      });
    }

    // Mini poof dot clusters shooting outward - only for basic smoke bursts, omitted for long persistent clouds
    this.poofDots = [];
    if (this.kind === 'smoke') {
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const spd = 45 + Math.random() * 45;
        this.poofDots.push({
          x: Math.cos(ang) * (this.radius * 0.4),
          y: Math.sin(ang) * (this.radius * 0.35),
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd * 0.7 - 15,
          r: 4 + Math.random() * 4,
        });
      }
    }

    // Pastry sugar / bread crumb flakes from the delicious food - omitted for persistent clouds
    this.crumbs = [];
    if (this.kind === 'smoke') {
      const crumbColors = ['#D97706', '#F59E0B', '#FDE68A', '#FEF08A', '#FFFDF9'];
      for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 60;
        this.crumbs.push({
          x: (Math.random() - 0.5) * 16,
          y: (Math.random() - 0.5) * 16,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 20,
          size: 2 + Math.random() * 2.5,
          color: crumbColors[Math.floor(Math.random() * crumbColors.length)],
          rot: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  update(dt: number) {
    this.time += dt;
    if (this.time >= this.duration) {
      this.dead = true;
      return;
    }

    for (const lobe of this.lobes) {
      lobe.ox += lobe.vx * dt;
      lobe.oy += lobe.vy * dt;
      lobe.vx *= 0.94;
      lobe.vy *= 0.96;
    }

    for (const wisp of this.wisps) {
      wisp.oy += wisp.vy * dt;
      wisp.rot += wisp.rotSpd * dt;
    }

    if (this.poofDots.length > 0) {
      for (const dot of this.poofDots) {
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;
        dot.vx *= 0.92;
        dot.vy *= 0.94;
      }
    }

    if (this.crumbs.length > 0) {
      for (const crumb of this.crumbs) {
        crumb.x += crumb.vx * dt;
        crumb.y += crumb.vy * dt;
        crumb.vy += 80 * dt;
        crumb.vx *= 0.93;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.dead) return;
    const progress = Math.min(1, this.time / this.duration);

    // Ease in pop scale (0 -> 1.15 in first 0.18s, then gentle expand to 1.35)
    let scale = 1;
    if (progress < 0.18) {
      const popT = progress / 0.18;
      scale = Math.sin(popT * Math.PI * 0.5) * 1.15;
    } else {
      scale = 1.15 + (progress - 0.18) * 0.35;
    }

    // Alpha fade out in last 35% of duration
    let alpha = 1;
    if (progress > 0.65) {
      alpha = Math.max(0, 1 - (progress - 0.65) / 0.35);
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    // Keep plum-scent, fajfka herbal smoke, and defeat poofs translucent so hunter & monsters remain clearly legible.
    const baseOpacity =
      this.kind === 'plum-scent'
        ? 0.34
        : this.kind === 'fajfka'
        ? 0.38
        : 0.62;
    ctx.globalAlpha = alpha * baseOpacity;

    // 1. Draw outer mini poof dots (skip entirely once faded after progress >= 0.625)
    if (this.poofDots.length > 0 && progress < 0.625) {
      for (const dot of this.poofDots) {
        const dotAlpha = Math.max(0, 1 - progress * 1.6);
        if (dotAlpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = alpha * dotAlpha * baseOpacity;
        ctx.fillStyle = this.kind === 'plum-scent' ? '#9D4EDD' : this.kind === 'fajfka' ? '#898994' : '#FFFDF7';
        ctx.strokeStyle = this.kind === 'plum-scent' ? '#5B167D' : this.kind === 'fajfka' ? '#42424A' : COLORS.ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r * (1 + progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2. Draw ground shadow of smoke cloud
    const shadowAlpha = alpha * Math.max(0, 0.25 - progress * 0.25);
    if (shadowAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = shadowAlpha;
      ctx.fillStyle = 'rgba(25, 20, 15, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, this.radius * 0.5, this.radius * 0.9 * scale, this.radius * 0.4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Shadow / depth under-layer of the main cloud (slightly offset downward)
    ctx.save();
    ctx.translate(0, 4);
    ctx.fillStyle =
      this.kind === 'plum-scent'
        ? 'rgba(126, 34, 206, 0.42)'
        : this.kind === 'fajfka'
        ? 'rgba(77, 99, 83, 0.42)'
        : 'rgba(232, 222, 200, 0.55)';
    ctx.beginPath();
    for (const lobe of this.lobes) {
      const lr = lobe.r * scale;
      ctx.moveTo(lobe.ox + lr, lobe.oy);
      ctx.arc(lobe.ox, lobe.oy, lr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    // 4. Main puffy cloud body with refined Josef Lada ink border
    ctx.fillStyle =
      this.kind === 'plum-scent'
        ? 'rgba(243, 232, 255, 0.58)'
        : this.kind === 'fajfka'
        ? 'rgba(240, 253, 244, 0.58)'
        : 'rgba(255, 253, 247, 0.72)';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = Math.min(3.4, Math.max(1.8, this.radius * 0.04));
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const lobe of this.lobes) {
      const lr = lobe.r * scale;
      ctx.moveTo(lobe.ox + lr, lobe.oy);
      ctx.arc(lobe.ox, lobe.oy, lr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 5. Highlight arcs on the tops of the lobes (whiter cream volume)
    ctx.strokeStyle = this.kind === 'plum-scent' ? '#D8B4FE' : this.kind === 'fajfka' ? '#DCFCE7' : '#FFFFFF';
    ctx.lineWidth = Math.min(2.6, Math.max(1.4, this.radius * 0.03));
    ctx.beginPath();
    for (const lobe of this.lobes) {
      const lr = lobe.r * scale * 0.72;
      ctx.arc(lobe.ox, lobe.oy - lobe.r * scale * 0.15, lr, -Math.PI * 0.85, -Math.PI * 0.15);
    }
    ctx.stroke();

    // 6. Cartoon curling smoke wisps / spirals floating upwards
    for (const wisp of this.wisps) {
      ctx.save();
      ctx.translate(wisp.ox, wisp.oy);
      ctx.rotate(wisp.rot);
      ctx.scale(wisp.scale, wisp.scale);
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2.4; a += 0.2) {
        const sr = 3 + a * 2.2;
        const sx = Math.cos(a) * sr;
        const sy = Math.sin(a) * sr;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 7. Delicious pastry crumbs or floating herbal petals/leaflets
    if (this.crumbs.length > 0) {
      for (const crumb of this.crumbs) {
        ctx.save();
        ctx.translate(crumb.x, crumb.y);
        ctx.rotate(crumb.rot);
        ctx.fillStyle = crumb.color;
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, crumb.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 8. Fragrant herbal particles & smoking folk pipe for fajfka
    if (this.kind === 'fajfka') {
      const herbCount = 6;
      for (let i = 0; i < herbCount; i++) {
        const hpAngle = (i / herbCount) * Math.PI * 2 + this.time * 0.6;
        const hpDist = this.radius * scale * (0.28 + (i % 3) * 0.2);
        const hpx = Math.cos(hpAngle) * hpDist;
        const hpy = Math.sin(hpAngle) * hpDist;
        ctx.save();
        ctx.translate(hpx, hpy);
        ctx.rotate(hpAngle + this.time * 1.5);
        if (i % 2 === 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = COLORS.ink;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.2, 1.6, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(-1.4, 0, 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#22C55E';
          ctx.strokeStyle = COLORS.ink;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.4, 1.5, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }

      if (progress < 0.45) {
        ctx.save();
        const pipeAlpha = Math.max(0, 1 - progress / 0.45);
        ctx.globalAlpha = alpha * pipeAlpha;
        Lada.drawFajfka(ctx, 0, -4, 0.85, Math.sin(this.time * 5) * 0.1, progress);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

function drawMarchThawLandmark(ctx: CanvasRenderingContext2D, type: string, time: number, isNight: boolean): void {
  drawMarchThawDynamicLandmark(ctx, type, time, isNight);
}

// Environmental decor item (tombstone, cross, tree, snowman, cottage)
class DecorItem {
  x: number;
  y: number;
  type: string;
  scale: number;
  flip: number;
  isObstacle: boolean;
  radius: number;
  vx: number;
  vy: number;
  animTime: number;
  floeIndex?: number;

  constructor(x: number, y: number, type: string, scale = 1, flip = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.scale = scale;
    this.flip = flip;
    this.vx = 0;
    this.vy = 0;
    this.animTime = Math.random() * 100;

    if (type === 'cottage') {
      this.isObstacle = true;
      this.radius = 45;
    } else if (type === 'rock') {
      this.isObstacle = true;
      this.radius = 25;
    } else if (type === 'ice_floe') {
      this.isObstacle = false;
      this.radius = 32;
    } else if (type === 'granny_stove') {
      this.isObstacle = true;
      this.radius = 35;
    } else if (type === 'kaca') {
      this.isObstacle = true;
      this.radius = 12;
    } else {
      this.isObstacle = false;
      this.radius = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, season: Season, theme?: string, time = 0, isNight = false) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.flip * this.scale, this.scale);

    if (this.type.startsWith('march_')) {
      drawMarchThawLandmark(ctx, this.type, time, isNight);
    } else if (this.type === 'tree') {
      Lada.setupPath(ctx, COLORS.woodDark);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-10, -50);
      ctx.lineTo(10, -50);
      ctx.lineTo(6, 0);
      ctx.fill();
      ctx.stroke();

      if (theme === 'autumn_graveyard') {
        // Gnarled spooky bare branches for graveyard
        ctx.strokeStyle = COLORS.woodDark;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(-24, -75);
        ctx.lineTo(-34, -70);
        ctx.moveTo(0, -50);
        ctx.lineTo(22, -78);
        ctx.lineTo(32, -92);
        ctx.moveTo(-10, -60);
        ctx.lineTo(-12, -90);
        ctx.moveTo(10, -62);
        ctx.lineTo(14, -88);
        ctx.stroke();
      } else {
        const leafColor = season === 'winter' ? '#FFFFFF' : '#D9A036';
        Lada.setupPath(ctx, leafColor);
        ctx.beginPath();
        ctx.arc(0, -60, 30, 0, Math.PI * 2);
        ctx.arc(-20, -50, 25, 0, Math.PI * 2);
        ctx.arc(20, -50, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (season !== 'winter') {
          // Warm autumn leaf accent
          ctx.fillStyle = '#C65D24';
          ctx.beginPath();
          ctx.arc(-8, -65, 12, 0, Math.PI * 2);
          ctx.arc(12, -55, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (this.type === 'snowman') {
      // Classic Josef Lada Snowman
      Lada.setupPath(ctx, '#FFFFFF', COLORS.ink, 3.5);
      // Bottom snowball
      ctx.beginPath();
      ctx.arc(0, -18, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Middle snowball
      ctx.beginPath();
      ctx.arc(0, -44, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head snowball
      ctx.beginPath();
      ctx.arc(0, -68, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Coal buttons
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(0, -48, 2.5, 0, Math.PI * 2);
      ctx.arc(0, -40, 2.5, 0, Math.PI * 2);
      ctx.arc(0, -22, 3, 0, Math.PI * 2);
      ctx.arc(0, -14, 3, 0, Math.PI * 2);
      ctx.fill();

      // Coal eyes
      ctx.beginPath();
      ctx.arc(-4, -70, 2, 0, Math.PI * 2);
      ctx.arc(4, -70, 2, 0, Math.PI * 2);
      ctx.fill();

      // Carrot nose
      ctx.fillStyle = '#E06D29';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -67);
      ctx.lineTo(12, -65);
      ctx.lineTo(0, -63);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pot hat
      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.rect(-8, -84, 16, 12);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-12, -73, 24, 4);
      ctx.fill();
      ctx.stroke();

      // Twig broom
      Lada.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(22, -60);
      ctx.stroke();
      // Broom bristles
      Lada.setupPath(ctx, COLORS.mustard, COLORS.ink, 2);
      ctx.beginPath();
      ctx.moveTo(22, -60);
      ctx.lineTo(28, -75);
      ctx.lineTo(18, -72);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'cross') {
      Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 3.5);
      ctx.beginPath();
      ctx.rect(-16, -10, 32, 10);
      ctx.fill();
      ctx.stroke();

      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
      ctx.beginPath();
      ctx.rect(-4, -60, 8, 50);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-18, -48, 36, 8);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'tombstone') {
      Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 3);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-16, -26);
      ctx.arc(0, -26, 16, Math.PI, 0);
      ctx.lineTo(16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, -14);
      ctx.moveTo(-7, -24);
      ctx.lineTo(7, -24);
      ctx.stroke();
    } else if (this.type === 'will_o_wisp') {
      const bob = Math.sin(time * 3.33 + this.x) * 8;
      ctx.fillStyle = 'rgba(74, 124, 89, 0.28)';
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(217, 160, 54, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'cottage') {
      // Daylight cast ink shadow behind cottage
      if (!isNight) {
        drawArchitecturalSunShadow(ctx, 0, 10, 56, 35);
      }

      // Cottage wooden logs body
      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3.5);
      ctx.fillRect(-28, -25, 56, 35);
      ctx.strokeRect(-28, -25, 56, 35);

      // Horizontal log lines
      ctx.strokeStyle = COLORS.woodLight;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-26, -14); ctx.lineTo(26, -14);
      ctx.moveTo(-26, -4); ctx.lineTo(26, -4);
      ctx.stroke();

      // Multi-pane cozy window
      const windowFill = isNight ? '#FEF08A' : '#78350F';
      Lada.setupPath(ctx, windowFill, COLORS.ink, 2);
      ctx.fillRect(-8, -15, 16, 13);
      ctx.strokeRect(-8, -15, 16, 13);
      // Window mullions (cross)
      ctx.beginPath();
      ctx.moveTo(0, -15); ctx.lineTo(0, -2);
      ctx.moveTo(-8, -8.5); ctx.lineTo(8, -8.5);
      ctx.stroke();

      // Snow roof
      Lada.setupPath(ctx, '#F8FAFC', COLORS.ink, 4);
      ctx.beginPath();
      ctx.moveTo(-36, -22);
      ctx.quadraticCurveTo(-15, -45, 0, -48);
      ctx.quadraticCurveTo(15, -45, 36, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // At night, cast butter-yellow trapezoid onto snowbank
      if (isNight) {
        drawCottageWindowLight(ctx, 0, 10, 1, 1, time);
      }
    } else if (this.type === 'bozi_muka') {
      drawBoziMukaDecor(ctx, 0, 0, 1, time, isNight);
    } else if (this.type === 'rock') {
      Lada.setupPath(ctx, '#95A5A6', COLORS.ink, 3);
      ctx.beginPath();
      ctx.moveTo(-25, 10);
      ctx.lineTo(-15, -20);
      ctx.lineTo(5, -25);
      ctx.lineTo(20, -5);
      ctx.lineTo(15, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(5, 5);
      ctx.stroke();
    } else if (this.type === 'ice_floe') {
      Lada.setupPath(ctx, '#E5F3F9', COLORS.ink, 3.5);
      ctx.beginPath();
      ctx.moveTo(-35, 5);
      ctx.lineTo(-20, -15);
      ctx.lineTo(15, -20);
      ctx.lineTo(35, -5);
      ctx.lineTo(25, 15);
      ctx.lineTo(-15, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-15, -10);
      ctx.lineTo(10, -15);
      ctx.lineTo(25, -5);
      ctx.lineTo(15, 5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'granny_stove') {
      Lada.setupPath(ctx, '#F8F9F9', COLORS.ink, 3.5);
      ctx.fillRect(-35, -50, 70, 70);
      ctx.strokeRect(-35, -50, 70, 70);
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.arc(-15, -20, 15, Math.PI, 0);
      ctx.lineTo(0, -5);
      ctx.lineTo(-30, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      Lada.setupPath(ctx, '#90A4AE', COLORS.ink, 2);
      ctx.beginPath();
      ctx.arc(20, 0, 15, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FAD7A1';
      ctx.beginPath();
      ctx.arc(20, -25, 12, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#C0392B';
      ctx.beginPath();
      ctx.arc(20, -25, 13, Math.PI, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (this.type === 'kaca') {
      const rot = (this.animTime || 0) * 15;
      ctx.translate(0, -10);
      ctx.rotate(rot);
      Lada.setupPath(ctx, '#E67E22', COLORS.ink, 2);
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(10, -5);
      ctx.lineTo(15, 5);
      ctx.lineTo(0, 20);
      ctx.lineTo(-15, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#D35400';
      ctx.beginPath();
      ctx.arc(0, -5, 10, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(0, -25);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Native Bubákov arena composition.
 *
 * The arena is deliberately quieter than the old "vivid" patch:
 * - the player gets a clean 240px combat core;
 * - large landmarks live on a sparse middle ring;
 * - small scenery fills the outer ring without forming a wall;
 * - every object keeps the existing Lada/ink visual vocabulary.
 *
 * This is presentation-only. It never changes collision, enemy AI,
 * pickups, projectiles or level progression.
 */
function seedArenaDecor(level: GameLevelDef): DecorItem[] {
  if (level.id === 0 && level.arena?.id === 'breznove_tani') {
    const items: DecorItem[] = MARCH_THAW_DECOR.map((item) => new DecorItem(item.x, item.y, item.type, item.scale));
    items.push(new DecorItem(MARCH_THAW_POIS.tavern.x - 105, MARCH_THAW_POIS.tavern.y - 45, 'granny_stove', 1));
    items.push(new DecorItem(MARCH_THAW_POIS.village.x - 45, MARCH_THAW_POIS.village.y + 35, 'kaca', 1));
    return items;
  }
  const pool = [...(level.decorTypes.length ? level.decorTypes : ['tree'])];
  if (level.theme === 'autumn_village' || level.theme === 'winter_frost' || level.theme === 'mill_forge') {
    if (!pool.includes('cottage')) pool.push('cottage');
    if (!pool.includes('bozi_muka')) pool.push('bozi_muka');
  }
  const decor: DecorItem[] = [];

  const themeDensity: Record<GameLevelDef['theme'], number> = {
    autumn_village: 36,
    autumn_graveyard: 38,
    winter_frost: 34,
    mill_forge: 30,
    ruined_castle: 32,
    dragon_cave: 24,
    spring_river: 45,
  };

  const target = themeDensity[level.theme] || 32;
  const minDistance = 110;
  const coreRadius = 260;
  const innerRadius = 380;
  const outerRadius = 1320;

  // Keep landmarks away from the starting/combat area. We only reject
  // scenery against other scenery; enemies remain completely unaffected.
  const placed: Array<{ x: number; y: number; radius: number }> = [];

  const pickType = (index: number) => {
    // Priority seeding for roubenky (cottages) and roadside shrines (Boží muka)
    if (pool.includes('cottage') && (index === 0 || index === 2 || index === 5)) {
      return 'cottage';
    }
    if (pool.includes('bozi_muka') && (index === 1 || index === 4)) {
      return 'bozi_muka';
    }
    if (index < pool.length) return pool[index];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  let attempts = 0;
  let index = 0;

  while (decor.length < target && attempts < target * 30) {
    attempts += 1;

    // Area-weighted radial distribution: less clutter near the player,
    // gradually more scenery farther away.
    const u = Math.random();
    const radius = innerRadius + Math.sqrt(u) * (outerRadius - innerRadius);
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // A few objects may sit in the outer edge only; never place scenery
    // inside the combat core.
    if (Math.hypot(x, y) < coreRadius) continue;

    const type = pickType(index);
    const large = type === 'tree' || type === 'cottage' || type === 'snowman';
    const objectRadius = large ? 72 : 48;

    let overlaps = false;
    for (const other of placed) {
      const dx = x - other.x;
      const dy = y - other.y;
      const min = objectRadius + other.radius + minDistance;
      if (dx * dx + dy * dy < min * min) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    const scale = large
      ? 0.72 + Math.random() * 0.23
      : 0.70 + Math.random() * 0.20;

    const flip = Math.random() > 0.5 ? 1 : -1;
    decor.push(new DecorItem(x, y, type, scale, flip));
    placed.push({ x, y, radius: objectRadius });
    index += 1;
  }

  return decor;
}

// Authentic Josef Lada folk symbols for the painted chest slot machine reels
export const SLOT_REEL_BASE_SYMBOLS: string[][] = [
  ['krejcar', 'czech_buchta', 'zlaty_dukat', 'jitrnice', 'kynuty_kolac', 'toulave_boty', 'osikovy_prut', 'candle', 'coin'],
  ['jitrnice', 'osikovy_prut', 'coin', 'czech_buchta', 'kynuty_kolac', 'krejcar', 'candle', 'zlaty_dukat', 'toulave_boty'],
  ['toulave_boty', 'candle', 'krejcar', 'jitrnice', 'zlaty_dukat', 'osikovy_prut', 'czech_buchta', 'coin', 'kynuty_kolac'],
];

// Doubled seamlessly for infinite CSS translateY(-50%) loops with zero jitter or jumps
export const SLOT_REEL_STRIPS: string[][] = SLOT_REEL_BASE_SYMBOLS.map((base) => [...base, ...base]);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Character preview canvases
  const krajanekRef = useRef<HTMLCanvasElement | null>(null);
  const wandererRef = useRef<HTMLCanvasElement | null>(null);
  const shepherdRef = useRef<HTMLCanvasElement | null>(null);
  const korenarkaRef = useRef<HTMLCanvasElement | null>(null);
  const watchmanRef = useRef<HTMLCanvasElement | null>(null);
  const sextonRef = useRef<HTMLCanvasElement | null>(null);
  const grannyRef = useRef<HTMLCanvasElement | null>(null);
  const arenaChunkCacheRef = useRef<ChunkBitmapCache | null>(null);
  // Transitional owner: App keeps presentation callbacks while GameEngine owns
  // the same state and the spatial index used by gameplay queries.
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Meta progression in LocalStorage
  const [meta, setMeta] = useState<MetaProgression>(() => {
    try {
      const saved = localStorage.getItem('bubakov_meta');
      if (saved) {
        return migrateMetaProgression(JSON.parse(saved));
      }
    } catch {}
    return createDefaultMetaProgression();
  });

  const metaRef = useRef(meta);
  metaRef.current = meta;

  // Preferences added after existing saves default to enabled, preserving the previous game presentation.
  const syncGameEffectSettings = (source: MetaProgression) => {
    const effectSettings = {
      ...DEFAULT_GAME_EFFECT_SETTINGS,
      effectsEnabled: source.effectsEnabled !== false,
      dynamicLightingEnabled: source.dynamicLightingEnabled !== false,
      combatVfxEnabled: source.combatVfxEnabled !== false,
      warningIndicatorsEnabled: source.warningIndicatorsEnabled !== false,
      windupTelegraphCirclesEnabled: Boolean(source.windupTelegraphCirclesEnabled),
      enemyDescriptorsEnabled: source.enemyDescriptorsEnabled !== false,
      attackDescriptorsEnabled: source.attackDescriptorsEnabled !== false,
      statusIndicatorsEnabled: source.statusIndicatorsEnabled !== false,
      unlockNotificationsEnabled: source.unlockNotificationsEnabled !== false,
      soundEffectsEnabled: source.soundEffectsEnabled !== false,
      musicEnabled: source.musicEnabled !== false,
    };
    setGameEffectSettings(effectSettings);
    const combatTextSettings: CombatTextSettings = {
      ...DEFAULT_COMBAT_TEXT_SETTINGS,
      ...(source.combatTextSettings || {}),
    };
    setCombatTextSettings(combatTextSettings);
    sound.enabled = effectSettings.effectsEnabled && effectSettings.soundEffectsEnabled;
    sound.musicEnabled = effectSettings.effectsEnabled && effectSettings.musicEnabled;
    if (!sound.musicEnabled) sound.stopMenuMusic(false);
  };
  syncGameEffectSettings(meta);

  const lastMetaPersistTimeRef = useRef<number>(0);
  const pendingMetaPersistRef = useRef<boolean>(false);

  const flushPendingMeta = () => {
    if (!pendingMetaPersistRef.current) return;
    pendingMetaPersistRef.current = false;
    lastMetaPersistTimeRef.current = performance.now();
    const updated = metaRef.current;
    syncGameEffectSettings(updated);
    setMeta(updated);
    try {
      localStorage.setItem('bubakov_meta', JSON.stringify(updated));
    } catch {}
  };

  const saveMeta = (updated: MetaProgression, immediate = false) => {
    metaRef.current = updated;
    const isPlaying = gameStateRef.current === 'playing';
    const now = performance.now();
    if (immediate || !isPlaying || now - lastMetaPersistTimeRef.current > 1500) {
      pendingMetaPersistRef.current = false;
      lastMetaPersistTimeRef.current = now;
      syncGameEffectSettings(updated);
      setMeta(updated);
      try {
        localStorage.setItem('bubakov_meta', JSON.stringify(updated));
      } catch {}
    } else {
      pendingMetaPersistRef.current = true;
    }
  };

  // Selected level state - Level 0 (Předjaří) default for new players
  const [selectedLevelId, setSelectedLevelId] = useState<GameLevelId>(() => {
    const s = meta.selectedLevel;
    return (typeof s === 'number' && Number.isInteger(s) && s >= 0 && s <= 7 ? s : 0) as GameLevelId;
  });

  const currentLevel = GAME_LEVELS[selectedLevelId] || GAME_LEVELS[0] || GAME_LEVELS[1];
  const season: Season = currentLevel.season;

  // Hunter detail modal, arsenal modal & unlock toast
  const [selectedHunterDetail, setSelectedHunterDetail] = useState<HunterProgress | null>(null);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<WeaponProgress | null>(null);
  const [selectedLevelDetail, setSelectedLevelDetail] = useState<LevelProgress | null>(null);
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);
  const [unlockNotice, setUnlockNotice] = useState<{ title: string; desc: string; icon?: string } | null>(null);

  // Progressive unlock calculations for all hunters
  const krajanekProg = useMemo(() => getHunterProgress('krajanek', meta), [meta]);
  const wandererProg = useMemo(() => getHunterProgress('wanderer', meta), [meta]);
  const shepherdProg = useMemo(() => getHunterProgress('shepherd', meta), [meta]);
  const korenarkaProg = useMemo(() => getHunterProgress('korenarka', meta), [meta]);
  const watchmanProg = useMemo(() => getHunterProgress('watchman', meta), [meta]);
  const sextonProg = useMemo(() => getHunterProgress('sexton', meta), [meta]);
  const grannyProg = useMemo(() => getHunterProgress('granny', meta), [meta]);

  const levelProgress = useMemo(
    () =>
      Object.fromEntries(
        ([0, 1, 2, 3, 4, 5, 6, 7] as GameLevelId[]).map((id) => [id, getLevelProgress(id, meta)])
      ) as Record<GameLevelId, LevelProgress>,
    [meta]
  );

  // Weapon unlock count
  const unlockedWeaponsCount = useMemo(
    () =>
      Object.keys(WEAPONS).filter(
        (k) => getWeaponProgress(k, meta).isUnlocked
      ).length,
    [meta]
  );

  // Game UI state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'chest' | 'fleeing' | 'tally' | 'tavern' | 'grandfather' | 'milestone'>('menu');
  const [pendingMilestones, setPendingMilestones] = useState<PendingMilestoneChoice[]>([]);
  const [menuScreen, setMenuScreen] = useState<'stage' | 'hunter'>('stage');
  // The Canvas loop is intentionally mounted only once. Keep React UI state
  // in refs so the long-lived RAF callback never reads stale render values.
  const gameStateRef = useRef(gameState);
  const menuScreenRef = useRef(menuScreen);
  const selectedLevelIdRef = useRef(selectedLevelId);
  const pendingMilestonesRef = useRef<PendingMilestoneChoice[]>([]);
  gameStateRef.current = gameState;
  menuScreenRef.current = menuScreen;
  selectedLevelIdRef.current = selectedLevelId;
  useEffect(() => {
    if (gameState === 'milestone' && pendingMilestones.length === 0 && pendingMilestonesRef.current.length === 0) {
      const nextState = engineRef.current.levelVictoryTriggered && victoryTimeoutRef.current === null
        ? 'tally'
        : (engineRef.current.player ? 'playing' : 'menu');
      gameStateRef.current = nextState;
      setGameState(nextState);
    }
  }, [gameState, pendingMilestones.length]);
  const [activeTavernTab, setActiveTavernTab] = useState<'crafts' | 'trophies'>('crafts');
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [isAnimationTesterOpen, setIsAnimationTesterOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedHunterInfo, setSelectedHunterInfo] = useState<HunterDetail | null>(null);
  const [isSettingsDevOpen, setIsSettingsDevOpen] = useState(false);
  const [isCombatTextModalOpen, setIsCombatTextModalOpen] = useState(false);
  const soundEnabled = meta.effectsEnabled !== false && meta.soundEffectsEnabled !== false;
  const musicEnabled = meta.effectsEnabled !== false && meta.musicEnabled !== false;

  // Touch controls
  const [touchEnabled, setTouchEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    try {
      const stored = window.localStorage.getItem('bubakov_touch_joystick');
      return stored === null ? isTouch || window.innerWidth <= 1024 : stored === 'true';
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
      // Keep the game usable by falling back to device detection.
      return isTouch || window.innerWidth <= 1024;
    }
  });

  // Mobile accessibility settings persist across runs; effects default to touch devices.
  const [mobileAccessibilityLevel, setMobileAccessibilityLevel] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem('bubakov_mobile_accessibility_level'));
      return Number.isInteger(saved) && saved >= 1 && saved <= 10 ? saved : 5;
    } catch { return 5; }
  });
  const [mobileAccessibilityAllDevices, setMobileAccessibilityAllDevices] = useState(() => {
    try { return window.localStorage.getItem('bubakov_mobile_accessibility_all_devices') === 'true'; }
    catch { return false; }
  });
  const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const mobileAccessibilityEnabled = isTouchScreen || mobileAccessibilityAllDevices;
  const mobileAccessibilityScale = mobileAccessibilityEnabled ? mobileAccessibilityLevel : 0;
  const mobileAccessibilityLevelRef = useRef(mobileAccessibilityScale);
  mobileAccessibilityLevelRef.current = mobileAccessibilityScale;

  // Apply the slider to a live hunter without compounding the pickup range modifier.
  const applyMobileAccessibilityToPlayer = (player: any, level: number) => {
    if (!player) return;
    const safeLevel = Math.max(0, Math.min(10, Math.round(level)));
    player.radius = (player.accessibilityBaseRadius ?? 20) * (1 - safeLevel * 0.05);
    player.accessibilityBasePickupRadius ??= player.pickupRadius / (1 + (player.accessibilityAppliedLevel || 0) * 0.05);
    player.pickupRadius = player.accessibilityBasePickupRadius * (1 + safeLevel * 0.05);
    player.accessibilityAppliedLevel = safeLevel;
  };

  const updateMobileAccessibilityLevel = (level: number) => {
    const next = Math.max(1, Math.min(10, Math.round(level)));
    setMobileAccessibilityLevel(next);
    const effectiveLevel = (isTouchScreen || mobileAccessibilityAllDevices) ? next : 0;
    mobileAccessibilityLevelRef.current = effectiveLevel;
    try { window.localStorage.setItem('bubakov_mobile_accessibility_level', String(next)); } catch {}
    const player = engineRef.current?.player;
    if (player) {
      applyMobileAccessibilityToPlayer(player, effectiveLevel);
    }
  };

  const updateMobileAccessibilityAllDevices = (enabled: boolean) => {
    setMobileAccessibilityAllDevices(enabled);
    const effectiveLevel = (isTouchScreen || enabled) ? mobileAccessibilityLevel : 0;
    mobileAccessibilityLevelRef.current = effectiveLevel;
    try { window.localStorage.setItem('bubakov_mobile_accessibility_all_devices', String(enabled)); } catch {}
    const player = engineRef.current?.player;
    if (player) {
      applyMobileAccessibilityToPlayer(player, effectiveLevel);
    }
  };

  const touchMoveRef = useRef<{ x: number; y: number; active: boolean; intensity: number }>({
    x: 0,
    y: 0,
    active: false,
    intensity: 0,
  });

  // Run stats
  const [runStats, setRunStats] = useState({
    time: 0,
    gingerbread: 0,
    kills: 0,
    chestProgress: 0,
    coins: 0,
    souls: 0,
    chasniks: 0,
    hp: 200,
    maxHp: 200,
    ultCd: 0,
    dayPhase: DAY_PHASES[0],
    bossHpPct: null as number | null,
    bossTitle: '',
    warningBanner: '',
    chasnikIndicator: '',
    levelId: 1 as GameLevelId,
    levelTitle: GAME_LEVELS[1].name,
    levelWon: false,
    isTestMode: false,
  });

  const runStatsRef = useRef(runStats);
  runStatsRef.current = runStats;
  const [grandfatherPurchaseIds, setGrandfatherPurchaseIds] = useState<string[]>([]);
  const grandfatherPurchaseIdsRef = useRef<string[]>([]);
  const [, setGrandfatherVersion] = useState(0);
  const grandfatherOpenRef = useRef(false);
  grandfatherOpenRef.current = gameState === 'grandfather';

const applyBearMaskOverheal = (player: any, healing: number) => {
    const frostHealingMultiplier = player._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(player, enemySpatialHashRef.current.queryCircle(player.x, player.y, FROSTLING_AURA_RADIUS));
    const effectiveHeal = healing * (1 + (player.bearMaskHealBonus || 0)) * frostHealingMultiplier;
    const missingHp = Math.max(0, player.maxHp - player.hp);
    const overheal = Math.max(0, effectiveHeal - missingHp);
    player.hp = Math.min(player.maxHp, player.hp + effectiveHeal);
    if ((player.bearMaskLevel || 0) > 0 && overheal > 0) {
      const damage = overheal * 0.5 * (1 + Math.max(0, player.bearMaskLevel - 1) * 0.2) * (player.damageMultiplier || 1);
      for (const enemy of enemySpatialHashRef.current.queryCircle(player.x, player.y, 290)) {
        if (enemy.isDefeated || enemy.dead || Math.hypot(enemy.x - player.x, enemy.y - player.y) > 230 + (enemy.radius || 0)) continue;
        enemy.takeDamage(damage, 'mask', 0, 0, { allowFractionalDamage: true });
      }
    }
  };

    const applyGrandfatherItem = useCallback((item: GrandfatherItemDef, offer?: any) => {
    const p = engineRef.current.player;
    if (!p) return;
    const effect = item.effect;
    if (effect.type === 'speed') {
      p.speed += effect.amount;
      p.speedCount = (p.speedCount || 0) + 1;
    }
    if (effect.type === 'pickup_radius') {
      const appliedAccessibilityLevel = Math.max(0, Math.min(10, p.accessibilityAppliedLevel || 0));
      p.accessibilityBasePickupRadius ??= p.pickupRadius / (1 + appliedAccessibilityLevel * 0.05);
      p.accessibilityBasePickupRadius += effect.amount;
      p.pickupRadius = p.accessibilityBasePickupRadius * (1 + appliedAccessibilityLevel * 0.05);
      p.magnetCount = (p.magnetCount || 0) + 1;
    }
    if (effect.type === 'damage_multiplier') {
      p.damageMultiplier = (p.damageMultiplier || 1) * (1 + effect.amount);
      if (item.id === 'krvave_jelito') {
        p.jelitoCount = (p.jelitoCount || 0) + 1;
      }
    }
    if (effect.type === 'fajfka' || item.id === 'bylinkova_fajfka') {
      const existing = (p.weapons || []).find((w: any) => w.id === 'bylinkova_fajfka');
      if (existing) {
        existing.level = Math.min(8, existing.level + 1);
      } else {
        (p.weapons as any[]).push({
          id: 'bylinkova_fajfka',
          level: 1,
          cd: 0,
          mastery: createWeaponMasteryState(),
          milestones: [],
          synergisticUpgrades: [],
        });
      }
    }
    if (effect.type === 'bear_mask' || item.id === 'maska_medveda') {
      p.bearMaskLevel = Math.min(4, (p.bearMaskLevel || 0) + 1);
      p.bearMaskHealBonus = Math.max(0, (p.bearMaskLevel - 1) * 0.20);
    }
    if (effect.type === 'max_hp') {
      p.maxHp += effect.amount;
      const fMult = p._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(p, enemySpatialHashRef.current.queryCircle(p.x, p.y, FROSTLING_AURA_RADIUS));
      p.hp = Math.min(p.maxHp, p.hp + effect.amount * fMult);
      if (item.id === 'medvedi_mast') {
        p.kurazCount = (p.kurazCount || 0) + 1;
      }
    }
    if (effect.type === 'luck') p.luck = (p.luck || 0) + effect.amount;
    if (effect.type === 'regen') {
      p.regenLevel = (p.regenLevel || 0) + Math.round(effect.amount * 10) / 10;
    }
    if (effect.type === 'cooldown') {
      p.cooldownBonus = (p.cooldownBonus || 0) + effect.amount;
      p.kavaCount = (p.kavaCount || 0) + 1;
    }
    if (effect.type === 'heal') {
      const fMult = p._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(p, enemySpatialHashRef.current.queryCircle(p.x, p.y, FROSTLING_AURA_RADIUS));
      const effectiveHeal = effect.amount * (1 + (p.bearMaskHealBonus || 0)) * fMult;
      const missingHp = Math.max(0, p.maxHp - p.hp);
      const overheal = Math.max(0, effectiveHeal - missingHp);
      p.hp = Math.min(p.maxHp, p.hp + effectiveHeal);
      if ((p.bearMaskLevel || 0) > 0 && overheal > 0) {
        const damage = overheal * 0.5 * (1 + Math.max(0, p.bearMaskLevel - 1) * 0.2) * (p.damageMultiplier || 1);
        for (const enemy of enemySpatialHashRef.current.queryCircle(p.x, p.y, 290)) {
          if (enemy.isDefeated || enemy.dead) continue;
          if (Math.hypot(enemy.x - p.x, enemy.y - p.y) <= 230 + (enemy.radius || 0)) enemy.takeDamage(damage, 'mask', 0, 0, { allowFractionalDamage: true });
        }
      }
    }
    if (effect.type === 'coins') {
      const reward = Math.max(0, Math.floor(effect.amount));
      engineRef.current.coins += reward;
      pushDamageText(engineRef.current.texts, p.x, p.y - 55, `+${reward} krejcarů!`, COLORS.mustard, true, 'lootResources');
      sound.coin();
    }
    if (effect.type === 'weapon') {
      const canonicalId = toCanonicalWeaponId(effect.weaponId);
      if (!p.weapons) p.weapons = [];
      const existing = p.weapons.find((w: any) => toCanonicalWeaponId(w.id) === canonicalId);
      if (existing) {
        existing.id = canonicalId;
        existing.level = Math.min(8, existing.level + 1);
        const isMilestone = existing.level === 3 || existing.level === 5 || existing.level === 8;
        if (!isMilestone) {
          const rankDef = getWeaponRankDef(canonicalId, existing.level);
          const upId = offer?.candidateUpgradeId || rankDef?.normalUpgradeId || rollRandomWeaponUpgrade(canonicalId, existing)?.id;
          if (upId) {
            if (!existing.normalUpgrades) existing.normalUpgrades = [];
            existing.normalUpgrades.push(upId);
          }
        } else {
          const choices = getMilestoneChoices(canonicalId, existing.level);
          if (choices) {
            pendingMilestonesRef.current.push({ weaponId: canonicalId, rank: existing.level, choices });
            setPendingMilestones([...pendingMilestonesRef.current]);
          }
        }
        existing._cachedStats = getRankedWeaponStats(canonicalId, existing.level, existing);
      } else {
        const newW = {
          id: canonicalId,
          level: 1,
          cd: 0,
          mastery: createWeaponMasteryState(),
          milestones: [],
          normalUpgrades: [],
        };
        p.weapons.push(newW);
      }
      syncPlayerWeaponCache(p);
    }
    if (effect.type === 'rare_instant') {
      applyRareItemEffect(engineRef.current, p, effect.rareItemId, {
        onSound: (name) => (sound as any)[name]?.(),
        onDamageText: (opts) => pushDamageText(engineRef.current.texts, opts.x, opts.y, opts.text, opts.color || '#F59E0B', true, 'lootResources'),
      });
    }
    if (effect.type === 'arcivzacny_ananas') {
      const fMult = p._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(p, enemySpatialHashRef.current.queryCircle(p.x, p.y, FROSTLING_AURA_RADIUS));
      applyAnanasUpgrade(p, {
        onSound: (name) => (sound as any)[name]?.(),
        onDamageText: (opts) => pushDamageText(engineRef.current.texts, opts.x, opts.y, opts.text, opts.color || '#FDE047', true, 'lootResources'),
      }, fMult);
    }
    if (effect.type === 'holy_circle') {
      p.holyCircleStacks = Math.min(3, (p.holyCircleStacks || 0) + 1);
      p.holyCircleReduction = (p.holyCircleReduction || 0) + effect.damageReduction;
    }
    if (effect.type === 'kren_spice') {
      p.krenSpiceStacks = Math.min(4, (p.krenSpiceStacks || 0) + 1);
      p.foodResistReduction = (p.foodResistReduction || 0) + effect.foodResistReduction;
      p.snackBonusDmg = (p.snackBonusDmg || 0) + effect.snackBonusDmg;
    }
    if (effect.type === 'gingerbread_heart') {
      p.poutoveSrdceStacks = Math.min(4, (p.poutoveSrdceStacks || 0) + 1);
      p.gingerbreadHeartCdMult = (1 + ((p.poutoveSrdceStacks || 1) - 1) * 0.35) * (effect.cdReductionMult || 1);
    }
    if (effect.type === 'ulezely_syrecek' || item.id === 'ulezely_syrecek') {
      p.syrecekStacks = Math.min(3, (p.syrecekStacks || 0) + 1);
    }
    if (effect.type === 'pivni_tacek' || item.id === 'pivni_tacek') {
      p.pivniTacekStacks = Math.min(4, (p.pivniTacekStacks || 0) + 1);
    }
    if (effect.type === 'sticky_plum_jam' || item.id === 'bezedny_krajac_povidel') {
      const slowRatio = 'slowRatio' in effect ? effect.slowRatio : 0.35;
      const poiseRed = 'poiseReduction' in effect ? effect.poiseReduction : 0.20;
      p.stickyPlumJamStacks = Math.min(4, (p.stickyPlumJamStacks || 0) + 1);
      p.plumSlowRatio = Math.min(0.80, (p.plumSlowRatio || 0) + slowRatio);
      p.plumPoiseReduction = Math.min(0.80, (p.plumPoiseReduction || 0) + poiseRed);
    }
    if (effect.type === 'goat_bell' || item.id === 'zvonek_zatoulane_kozy') {
      const radius = 'radius' in effect ? effect.radius : 180;
      const intervalSec = 'intervalSec' in effect ? effect.intervalSec : 4.0;
      p.goatBellStacks = Math.min(4, (p.goatBellStacks || 0) + 1);
      p.goatBellRadius = radius + 30 * ((p.goatBellStacks || 1) - 1);
      p.goatBellInterval = Math.max(2.0, intervalSec - 0.4 * ((p.goatBellStacks || 1) - 1));
      p.goatBellTimer = p.goatBellInterval;
    }
    if (effect.type === 'itchy_socks' || item.id === 'babicciny_kousave_fusekle') {
      const speedBonus = 'speedBonus' in effect ? effect.speedBonus : 15;
      const movingCd = 'movingCooldownBonus' in effect ? effect.movingCooldownBonus : 0.12;
      p.itchySocksStacks = Math.min(4, (p.itchySocksStacks || 0) + 1);
      p.speed = (p.speed || 150) + speedBonus;
      p.movingCooldownBonus = Math.min(0.48, (p.movingCooldownBonus || 0) + movingCd);
      p.iceImmunity = true;
    }
    if (effect.type === 'kominicka_supina' || item.id === 'kominicka_supina') {
      const luckBonus = 'luckBonus' in effect ? effect.luckBonus : 8;
      p.luck = (p.luck || 100) + luckBonus;
      p.kominickaSupinaStacks = Math.min(3, (p.kominickaSupinaStacks || 0) + 1);
    }
    if (effect.type === 'jetelovy_ctyrlistek' || item.id === 'jetelovy_ctyrlistek') {
      p.jetelovyCtyrlistekStacks = Math.min(3, (p.jetelovyCtyrlistekStacks || 0) + 1);
    }
    if (effect.type === 'cinovy_strelecky_terc' || item.id === 'cinovy_strelecky_terc') {
      p.cinovyTercStacks = Math.min(4, (p.cinovyTercStacks || 0) + 1);
    }
    if (effect.type === 'vrbova_pistalka' || item.id === 'vrbova_pistalka') {
      const dodgeBonus = 'dodgeBonus' in effect ? effect.dodgeBonus : 0.06;
      p.vrbovaPistalkaStacks = Math.min(3, (p.vrbovaPistalkaStacks || 0) + 1);
      p.dodgeChance = Math.min(0.60, (p.dodgeChance || 0) + dodgeBonus);
    }
    if (effect.type === 'lojem_mazane_krpce' || item.id === 'lojem_mazane_krpce') {
      const dodgeBonus = 'dodgeBonus' in effect ? effect.dodgeBonus : 0.05;
      p.lojemMazaneKrpceStacks = Math.min(3, (p.lojemMazaneKrpceStacks || 0) + 1);
      p.dodgeChance = Math.min(0.60, (p.dodgeChance || 0) + dodgeBonus);
    }
    if (effect.type !== 'heal' && effect.type !== 'coins' && effect.type !== 'rare_instant' && !item.isRareInstant) {
      p.krajanekUpgradeCount = (p.krajanekUpgradeCount || 0) + 1;
    }
    if (item.id === 'zejdlik_piva' || item.id === 'panak_koralky' || item.id === 'tepla_cikorka') {
      if ((p.pivniTacekStacks || 0) > 0) {
        const eng = engineRef.current;
        const stacks = Math.max(1, p.pivniTacekStacks || 1);
        const cdBoost = 1.35 + (stacks - 1) * 0.15;
        p.pivniTacekTimer = 6 + (stacks - 1) * 1.5;
        if (p.weapons) {
          for (const w of p.weapons) {
            if (w.cd > 0) w.cd /= cdBoost;
          }
        }
        const pctLabel = Math.round((cdBoost - 1) * 100);
        pushDamageText(eng.texts, p.x, p.y - 85, '„TENHLE ÚČET ZAPLATÍ BUBÁCI! 🍺“', '#F59E0B', true, 'combatShouts');
        pushDamageText(eng.texts, p.x, p.y - 55, `ROZOHNĚNÍ: +${pctLabel} % RYCHLEJŠÍ NABÍJENÍ! ⚡`, '#38BDF8', true, 'combatShouts');
        sound.coin();

        // 8 closest alive enemies via SpatialHash without 4 temporary array allocations
        const nearby = enemySpatialHashRef.current.queryCircle(p.x, p.y, 400);
        const sortedEnemies: any[] = [];
        for (let i = 0; i < nearby.length; i++) {
          const e = nearby[i];
          if (!e.isDefeated && !e.dead) {
            sortedEnemies.push(e);
            if (sortedEnemies.length >= 8) break;
          }
        }
        if (sortedEnemies.length === 0 && (livingEnemiesRef.current || eng.enemies)) {
          const pool = livingEnemiesRef.current || eng.enemies;
          for (let i = 0; i < pool.length; i++) {
            const e = pool[i];
            if (!e.isDefeated && !e.dead) {
              sortedEnemies.push(e);
              if (sortedEnemies.length >= 8) break;
            }
          }
        }

        const brawlDuration = 3.5 + (stacks - 1) * 1.0;
        for (let i = 0; i < sortedEnemies.length; i++) {
          const foe = sortedEnemies[i];
          foe.brawlTimer = Math.max(foe.brawlTimer || 0, brawlDuration);
          const ang = Math.random() * Math.PI * 2;
          const spd = 55 + Math.random() * 45;
          spawnDropWithLimit(eng.drops, {
            type: 'coin',
            value: 1,
            x: foe.x,
            y: foe.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            radius: 10,
            time: 0,
            dead: false,
          }, eng.pendingDropBank);
          pushDamageText(eng.texts, foe.x, foe.y - 25, '+1 🪙', '#FBBF24', false, 'lootResources');
          for (let k = 0; k < 3; k++) {
            const pAng = Math.random() * Math.PI * 2;
            emitParticle(eng.particles, () => ({
              x: foe.x,
              y: foe.y,
              vx: Math.cos(pAng) * 45,
              vy: Math.sin(pAng) * 45 - 20,
              life: 0.35,
              color: '#F59E0B',
              size: 3,
            }), activeMaxParticlesRef.current);
          }
        }
      }
    }
  }, []);

  const openGrandfatherShop = useCallback(() => {
    const eng = engineRef.current;
    if (!eng.grandfather.active || gameStateRef.current !== 'playing') return;
    const p = eng.player;
    if (p && eng.grandfather.offers && eng.grandfather.offers.length > 0) {
      eng.grandfather.offers = replaceCourageOffersIfNeeded(
        eng.grandfather.offers,
        eng.gingerbread,
        p.luck ?? 100,
        grandfatherPurchaseIdsRef.current,
        p.weapons || [],
        { playerHp: p.hp, playerMaxHp: p.maxHp },
        4
      );
    }
    grandfatherOpenRef.current = true;
    gameStateRef.current = 'grandfather';
    setGameState('grandfather');
  }, []);

  const openGrandfatherShopTest = useCallback(() => {
    const eng = engineRef.current;
    eng.grandfather.active = true;
    eng.grandfather.x = eng.player?.x || 0;
    eng.grandfather.y = eng.player?.y || 0;
    eng.grandfather.waitStartedAt = eng.gameTime - 180;
    eng.gingerbread = Math.max(eng.gingerbread, 350);
    eng.grandfather.offers = replaceCourageOffersIfNeeded(
      chooseGrandfatherOffers(
        eng.gingerbread,
        eng.player?.luck || 100,
        grandfatherPurchaseIdsRef.current,
        eng.player?.weapons || [{ id: 'cane', level: 1 }],
        4,
        { playerHp: eng.player?.hp, playerMaxHp: eng.player?.maxHp }
      ),
      eng.gingerbread,
      eng.player?.luck || 100,
      grandfatherPurchaseIdsRef.current,
      eng.player?.weapons || [{ id: 'cane', level: 1 }],
      { playerHp: eng.player?.hp, playerMaxHp: eng.player?.maxHp },
      4
    );
    setIsTestModeOpen(false);
    grandfatherOpenRef.current = true;
    gameStateRef.current = 'grandfather';
    setGameState('grandfather');
  }, []);

  const closeGrandfatherShop = useCallback(() => {
    const eng = engineRef.current;
    eng.grandfather.active = false;
    eng.grandfather.cooldown = 25;
    eng.grandfather.rerollsThisEncounter = 0;
    grandfatherOpenRef.current = false;
    setGameState((prev) => {
      if (prev === 'grandfather') {
        if (pendingMilestonesRef.current.length > 0) {
          gameStateRef.current = 'milestone';
          return 'milestone';
        }
        const nextState = eng.levelVictoryTriggered && victoryTimeoutRef.current === null
          ? 'tally'
          : (eng.player ? 'playing' : 'menu');
        gameStateRef.current = nextState;
        eng.lastTime = performance.now();
        return nextState;
      }
      return prev;
    });
  }, []);

  const purchaseGrandfatherItem = useCallback((itemId: string) => {
    const eng = engineRef.current;
    const p = eng.player;
    const weaponUpgrade = getWeaponUpgradeOffer(itemId);
    const item = getGrandfatherItem(itemId);
    if (!p || (!item && !weaponUpgrade) || !eng.grandfather.active) return false;

    // Dynamic weapon specializations are run upgrades, not static inventory items.
    if (weaponUpgrade) {
      const weapon = p.weapons?.find((w: any) => toCanonicalWeaponId(w.id) === weaponUpgrade.weaponId);
      const upgradeDef = getSynergisticUpgrade(weaponUpgrade.upgradeId);
      if (!weapon || !upgradeDef) return false;
      weapon.synergisticUpgrades ??= [];
      if (weapon.synergisticUpgrades.some((id: string) => getSynergisticUpgrade(id)?.weaponId === weaponUpgrade.weaponId)) return false;
      const purchasedCount = getGrandfatherInflatingPurchaseCount(grandfatherPurchaseIdsRef.current);
      const waitSeconds = Math.max(0, eng.gameTime - eng.grandfather.waitStartedAt);
      const price = getGrandfatherPrice({
        id: weaponUpgrade.id, name: weaponUpgrade.name, icon: weaponUpgrade.icon,
        description: weaponUpgrade.description, baseCost: weaponUpgrade.baseCost,
        effect: { type: 'luck', amount: 0 },
      } as GrandfatherItemDef, purchasedCount, p.luck ?? 100, waitSeconds);
      if (eng.gingerbread < price) return false;
      eng.gingerbread -= price;
      weapon.synergisticUpgrades.push(weaponUpgrade.upgradeId);
      weapon._cachedStats = undefined;
      eng.grandfather.purchasesThisEncounter += 1;
      eng.grandfather.totalPurchases = (eng.grandfather.totalPurchases || 0) + 1;
      grandfatherPurchaseIdsRef.current.push(weaponUpgrade.id);
      setGrandfatherPurchaseIds([...grandfatherPurchaseIdsRef.current]);
      sound.grandfatherPurchase();
      pushDamageText(eng.texts, p.x, p.y - 70, `${weaponUpgrade.name.toUpperCase()}!`, '#F59E0B', true, 'unlocksMilestones');
      setGrandfatherVersion((v) => v + 1);
      setRunStats((state) => ({ ...state, gingerbread: eng.gingerbread }));
      return true;
    }
    if (!item) return false;
    // Healing consumables have no value at full Courage, so reject the purchase.
    if (item.effect.type === 'heal' && p.hp >= p.maxHp) return false;
    const waitSeconds = Math.max(0, eng.gameTime - eng.grandfather.waitStartedAt);
    const purchaseCount = getGrandfatherInflatingPurchaseCount(grandfatherPurchaseIdsRef.current);
    const price = getGrandfatherPrice(item, purchaseCount, p.luck ?? 100, waitSeconds);
    if (eng.gingerbread < price) return false;

    eng.gingerbread -= price;
    eng.grandfather.purchasesThisEncounter += 1;
    eng.grandfather.totalPurchases = (eng.grandfather.totalPurchases || 0) + 1;
    grandfatherPurchaseIdsRef.current.push(item.id);
    setGrandfatherPurchaseIds([...grandfatherPurchaseIdsRef.current]);
    const offer = eng.grandfather.offers.find((o) => o.itemId === item.id);
    applyGrandfatherItem(item, offer);
    if (item.isWeapon && item.weaponId && offer) {
      const canonicalId = toCanonicalWeaponId(item.weaponId);
      const pw = p.weapons?.find((w: any) => toCanonicalWeaponId(w.id) === canonicalId);
      const nextLvl = (pw ? pw.level : 0) + 1;
      const isMilestone = nextLvl === 3 || nextLvl === 5 || nextLvl === 8;
      if (!isMilestone && nextLvl <= 8) {
        offer.candidateUpgradeId = rollRandomWeaponUpgrade(canonicalId, pw)?.id || getWeaponRankDef(canonicalId, nextLvl)?.normalUpgradeId;
      } else {
        offer.candidateUpgradeId = undefined;
      }
    }
    sound.grandfatherPurchase();
    if (item.effect.type === 'coins') {
      setRunStats((state) => ({ ...state, coins: eng.coins, gingerbread: eng.gingerbread }));
    }
    pushDamageText(eng.texts, p.x, p.y - 70, item.isWeapon ? 'ZBRAŇ ZÍSKÁNA!' : 'PLÁCNUTO!', '#F59E0B', true, 'lootResources');
    if (eng.grandfather.purchasesThisEncounter % 3 === 0) {
      pushDamageText(eng.texts, p.x, p.y - 105, '„Tenhle byl stejně moc okoralý.“', '#78350F', true, 'combatShouts');
    }

    setGrandfatherVersion((v) => v + 1);
    setRunStats((state) => ({ ...state, gingerbread: eng.gingerbread }));
    return true;
  }, [applyGrandfatherItem]);

  const refreshGrandfatherOffers = useCallback(() => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!eng.grandfather.active) return;
    const rerolls = eng.grandfather.rerollsThisEncounter || 0;
    const cost = getGrandfatherRerollCost(rerolls);
    if (eng.gingerbread < cost) return;

    eng.gingerbread -= cost;
    eng.grandfather.rerollsThisEncounter = rerolls + 1;
    eng.grandfather.offers = replaceCourageOffersIfNeeded(
      chooseGrandfatherOffers(eng.gingerbread, p?.luck ?? 100, grandfatherPurchaseIdsRef.current, p?.weapons || [], 4, { playerHp: p?.hp, playerMaxHp: p?.maxHp }),
      eng.gingerbread,
      p?.luck ?? 100,
      grandfatherPurchaseIdsRef.current,
      p?.weapons || [],
      { playerHp: p?.hp, playerMaxHp: p?.maxHp },
      4
    );
    sound.coin();
    sound.grandfatherCall();
    if (p) {
      pushDamageText(eng.texts, p.x, p.y - 85, `„Nové zboží z nůše! (−${cost} perníčků)“`, '#F59E0B', true, 'lootResources', 'gingerbread');
    }
    setRunStats((state) => ({ ...state, gingerbread: eng.gingerbread }));
    setGrandfatherVersion((v) => v + 1);
  }, []);

  // Level Up choices

  // Chest sequence state & slot machine effect
  interface ChestRewardItem {
    name: string;
    desc?: string;
    icon: string;
    action: () => void;
  }
  const [chestRewards, setChestRewards] = useState<ChestRewardItem[]>([]);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotStoppedCount, setSlotStoppedCount] = useState(0);
  const slotTimersRef = useRef<NodeJS.Timeout[]>([]);
  const slotSoundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const slotSpinningRef = useRef(false);
  slotSpinningRef.current = slotSpinning;
  const skipSlotSpinRef = useRef<() => void>(() => {});
  const closeChestSequenceRef = useRef<() => void>(() => {});

  // Tally state
  const [tallyCounters, setTallyCounters] = useState({
    kills: 0,
    coins: 0,
    souls: 0,
    chasniks: 0,
    time: 0,
    isVictory: false,
    levelId: 1 as GameLevelId,
  });


  // One-use, time-limited reward offered on the tally screen.
  type ReturnBonus = { kind: 'damage' | 'courage' | 'coins'; percent: number; multiplier: number };
  const [returnBonus, setReturnBonus] = useState<ReturnBonus | null>(null);
  const [returnBonusSeconds, setReturnBonusSeconds] = useState(7);
  const [returnBonusExpired, setReturnBonusExpired] = useState(false);
  const returnBonusDeadlineRef = useRef(0);
  const returnBonusClaimedRef = useRef(false);
  const pendingReturnBonusRef = useRef<ReturnBonus | null>(null);
  const activeRunBonusRef = useRef<ReturnBonus | null>(null);
  const lastHunterTypeRef = useRef<CharacterType>('wanderer' as CharacterType);
  const victoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockNoticeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showUnlockNotice = useCallback((notice: { title: string; desc: string; icon?: string } | null, durationMs = 4500) => {
    if (unlockNoticeTimeoutRef.current) {
      clearTimeout(unlockNoticeTimeoutRef.current);
      unlockNoticeTimeoutRef.current = null;
    }
    setUnlockNotice(notice);
    if (notice && durationMs > 0) {
      unlockNoticeTimeoutRef.current = setTimeout(() => {
        setUnlockNotice(null);
        unlockNoticeTimeoutRef.current = null;
      }, durationMs);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'tally') { setReturnBonus(null); return; }
    const roll = Math.random();
    const multiplier = roll < 0.005 ? 6 : roll < 0.015 ? 5 : roll < 0.04 ? 4 : roll < 0.12 ? 3 : roll < 0.32 ? 2 : 1;
    const kinds: ReturnBonus['kind'][] = ['damage', 'courage', 'coins'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const percent = kind === 'damage' ? 15 : kind === 'courage' ? 25 : 20;
    setReturnBonus({ kind, percent, multiplier });
    setReturnBonusSeconds(7);
    setReturnBonusExpired(false);
    returnBonusClaimedRef.current = false;
    returnBonusDeadlineRef.current = Date.now() + 7000;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((returnBonusDeadlineRef.current - Date.now()) / 1000));
      setReturnBonusSeconds(remaining);
      if (remaining <= 0) { setReturnBonusExpired(true); window.clearInterval(timer); }
    }, 100);
    return () => window.clearInterval(timer);
  }, [gameState]);

  // Game engine refs (persistent through renders)
  const engineRef = useRef<EngineState>(createInitialEngineState());
  const crowWaveRef = useRef<VirtualLeaderCrowWave | null>(null);
  if (!crowWaveRef.current) crowWaveRef.current = new VirtualLeaderCrowWave();
  const snowmanHordeRef = useRef<VirtualLeaderSnowmanHorde | null>(null);
  if (!snowmanHordeRef.current) snowmanHordeRef.current = new VirtualLeaderSnowmanHorde();
  const enemySpatialHashRef = useRef(new SpatialHash<any>(180));
  const livingEnemiesRef = useRef<any[]>([]);
  const secondarySpatialResultsRef = useRef<any[]>([]);
  const primarySpatialResultsRef = useRef<any[]>([]);
  const terrainSpatialResultsRef = useRef<any[]>([]);
  const directorRef = useRef<RunDirector | null>(null);
  const activeMaxParticlesRef = useRef<number>(MAX_PARTICLES);
  const adaptiveGovernorRef = useRef({
    tier: 0,
    tier1Timer: 0,
    recoveryTimer: 0,
    originalCombatPreset: null as CombatTextPreset | null,
  });
  const lastCombatTextsMsRef = useRef<number>(0);
  const arenaMetricsRef = useRef<ArenaRenderMetrics>(createReusableRenderMetrics());
  const arenaCameraRef = useRef<CameraViewport>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewLeft: 0,
    viewTop: 0,
    viewRight: 0,
    viewBottom: 0,
    zoom: 1,
  });
  const arenaRenderOptionsRef = useRef<ArenaRenderOptions>({});
  const sunOverlayConfigRef = useRef<SunOverlayConfig>(createDefaultSunOverlayConfig());
  const sunFrameStateRef = useRef<SunComputedFrameState>(createReusableSunFrameState());
  const latestFpsRef = useRef<number>(60);
  const isUrlPerfOverlay = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('perf') || params.has('benchmark');
  }, []);

  const getSunDebugTelemetry = useCallback((): SunDebugLiveTelemetry => {
    const eng = engineRef.current;
    return {
      fps: latestFpsRef.current,
      projectileCount: eng.projectiles ? eng.projectiles.length : 0,
      enemyCount: eng.enemies ? eng.enemies.length : 0,
      gameTimeSeconds: eng.gameTime || 0,
    };
  }, []);

  const handleToggleSunStressTest = useCallback((enabled: boolean) => {
    const eng = engineRef.current;
    sunOverlayConfigRef.current.stressTestActive = enabled;
    if (!enabled && eng.projectiles) {
      for (let i = 0; i < eng.projectiles.length; i++) {
        if ((eng.projectiles[i] as any).isSunStressProjectile) {
          eng.projectiles[i].dead = true;
        }
      }
    }
  }, []);

  const pushTransientLight = useCallback((light: DynamicLightSource) => {
    const eng = engineRef.current;
    if (!eng || !eng.lightSources) return;
    if (!isGameEffectEnabled('dynamicLightingEnabled')) return;
    const profile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
    if (profile === 'performance') return;

    const dayPhase = eng.currentPhase || getCurrentDayPhase(eng.gameTime || 0, eng.activeLevelId);
    const player = eng.player;
    const kurazRatio = player && player.maxHp > 0 ? player.hp / player.maxHp : 1;
    const isNightPhase =
      dayPhase.id === 'dusk' ||
      dayPhase.id === 'night' ||
      dayPhase.id === 'midnight' ||
      dayPhase.id === 'dawn';

    // Governor Tier >= 1 restricts transient lights to low-courage emergency illumination (saving composition fillrate)
    if ((adaptiveGovernorRef.current.tier >= 1 || !isNightPhase) && kurazRatio >= 0.25) {
      return;
    }

    let transientCount = 0;
    for (let i = 0; i < eng.lightSources.length; i++) {
      if (typeof eng.lightSources[i].duration === 'number') {
        transientCount++;
      }
    }
    if (transientCount < 16) {
      eng.lightSources.push(light);
    }
  }, []);

  // Pause toggle handler
  const togglePause = useCallback(() => {
    setGameState((cur) => {
      if (cur === 'playing') {
        sound.pause();
        return 'paused';
      } else if (cur === 'paused') {
        sound.resume();
        engineRef.current.lastTime = performance.now();
        return 'playing';
      }
      return cur;
    });
  }, []);

  // Surrender / return to tavern from pause with score tally
  const quitToTavernFromPause = () => {
    sound.coin();
    if (arenaChunkCacheRef.current) {
      arenaChunkCacheRef.current.dispose();
      arenaChunkCacheRef.current = null;
    }
    resetGlobalGlyphAtlas();
    const timeSurvived = engineRef.current.gameTime;
    const updatedHighest = Math.max(metaRef.current.highestSurviveTime || 0, timeSurvived);
    setTallyCounters({
      kills: engineRef.current.kills,
      coins: Math.floor(engineRef.current.coins * (activeRunBonusRef.current?.kind === 'coins' ? 1 + activeRunBonusRef.current.percent * activeRunBonusRef.current.multiplier / 100 : 1)),
      souls: engineRef.current.souls,
      chasniks: engineRef.current.chasniks,
      time: Math.floor(timeSurvived),
      isVictory: engineRef.current.levelVictoryTriggered,
      levelId: engineRef.current.activeLevelId !== undefined ? engineRef.current.activeLevelId : 0,
    });
    saveMeta({
      ...metaRef.current,
      highestSurviveTime: updatedHighest,
    });
    setGameState('tally');
  };

  // Level victory handler when final boss is defeated or dawn reached
  const triggerLevelVictory = (lvlId: GameLevelId, reason: 'boss' | 'dawn') => {
    if (engineRef.current.levelVictoryTriggered) return;
    engineRef.current.levelVictoryTriggered = true;

    sound.victory();
    sound.cheer();

    const curMeta = metaRef.current;
    const nextLvlId = (lvlId + 1) as GameLevelId;
    const canUnlockNext = nextLvlId <= 7;
    const nextHighest = canUnlockNext
      ? Math.max(curMeta.highestLevelUnlocked || 1, nextLvlId)
      : (curMeta.highestLevelUnlocked || 1);
    const updatedCompleted = {
      ...(curMeta.completedLevels || {}),
      [lvlId]: true,
    };

    const nextMeta: MetaProgression = {
      ...curMeta,
      highestLevelUnlocked: nextHighest,
      completedLevels: updatedCompleted,
    };
    saveMeta(nextMeta);

    setRunStats((s) => ({
      ...s,
      levelWon: true,
      warningBanner: reason === 'boss'
        ? `🏆 ${GAME_LEVELS[lvlId].finalBoss.name} POKOŘEN – VÍTĚZSTVÍ!`
        : (lvlId === 0 ? '🔔 ZVONÍ KLEKÁNÍ! PŘEŽILI JSTE DEN V PŘEDJAŘÍ – VÍTĚZSTVÍ!' : '🐓 SVÍTÁNÍ! PŘEŽILI JSTE NOC – VÍTĚZSTVÍ!'),
    }));

    if (canUnlockNext && (curMeta.highestLevelUnlocked || 1) < nextLvlId) {
      showUnlockNotice({
        icon: 'celebration',
        title: `${GAME_LEVELS[lvlId].shortTitle.toUpperCase()} POKOŘENA!`,
        desc: `Odemčena nová úroveň: ${GAME_LEVELS[nextLvlId].name}! Nyní se v ní můžete utkat s novými monstry.`,
      }, 6000);
    } else if (lvlId >= 7) {
      showUnlockNotice({
        icon: 'crown',
        title: `VŠECHNY ÚROVNĚ DOKONČENY!`,
        desc: `Čertův mlýn, bezhlavý rytíř i drak padli! Celý Bubákov oslavuje vaše legendární hrdinství!`,
      }, 6000);
    }

    // Remaining monsters flee
    engineRef.current.enemies.forEach((m) => {
      m.panicked = true;
      m.isDefeated = true;
    });

    // Schedule transition to triumphant victory tally (tracked to prevent leaking across restarts)
    if (victoryTimeoutRef.current) {
      clearTimeout(victoryTimeoutRef.current);
      victoryTimeoutRef.current = null;
    }
    const finalizeVictoryTally = () => {
      // Wait for active chest, grandfather shop, or weapon milestone modal to finish before switching to tally
      if (
        gameStateRef.current === 'chest' ||
        gameStateRef.current === 'grandfather' ||
        gameStateRef.current === 'milestone'
      ) {
        victoryTimeoutRef.current = setTimeout(finalizeVictoryTally, 250);
        return;
      }
      victoryTimeoutRef.current = null;
      slotTimersRef.current.forEach(clearTimeout);
      slotTimersRef.current = [];
      if (slotSoundIntervalRef.current) {
        clearInterval(slotSoundIntervalRef.current);
        slotSoundIntervalRef.current = null;
      }
      setTallyCounters({
        kills: engineRef.current.kills,
        coins: Math.floor(engineRef.current.coins * (activeRunBonusRef.current?.kind === 'coins' ? 1 + activeRunBonusRef.current.percent * activeRunBonusRef.current.multiplier / 100 : 1)),
        souls: engineRef.current.souls,
        chasniks: engineRef.current.chasniks,
        time: Math.floor(engineRef.current.gameTime),
        isVictory: true,
        levelId: lvlId,
      });
      const updatedHighest = Math.max(metaRef.current.highestSurviveTime || 0, engineRef.current.gameTime);
      saveMeta({
        ...metaRef.current,
        highestSurviveTime: updatedHighest,
      });
      gameStateRef.current = 'tally';
      setGameState('tally');
    };
    victoryTimeoutRef.current = setTimeout(finalizeVictoryTally, 3500);
  };

  const toggleSound = () => {
    const next = metaRef.current.soundEffectsEnabled === false;
    saveMeta({ ...metaRef.current, soundEffectsEnabled: next });
    if (next) sound.coin();
  };

  const toggleMusic = () => {
    const next = metaRef.current.musicEnabled === false;
    saveMeta({ ...metaRef.current, musicEnabled: next });
    if (next) sound.coin();
  };

  // Play "Bubáci a hastrmani" polka in main menu & village tavern, smoothly stop during gameplay
  useEffect(() => {
    if ((gameState === 'menu' || gameState === 'tavern') && meta.effectsEnabled !== false && meta.musicEnabled !== false) {
      sound.playMenuMusic(true);
    } else {
      sound.stopMenuMusic(true);
    }
  }, [gameState, meta.effectsEnabled, meta.musicEnabled]);

  const toggleTouch = () => {
    const next = !touchEnabled;
    setTouchEnabled(next);
    try {
      localStorage.setItem('bubakov_touch_joystick', next ? 'true' : 'false');
    } catch {}
    sound.coin();
  };

  // Fullscreen state & toggle (key F)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        const req = document.documentElement.requestFullscreen?.();
        if (req && typeof req.catch === 'function') {
          req.catch(() => {});
        }
      } else {
        const exit = document.exitFullscreen?.();
        if (exit && typeof exit.catch === 'function') {
          exit.catch(() => {});
        }
      }
    } catch {
      // Ignore fullscreen restriction errors in embedded iframes
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Gamepad & Active Input Device UI Indicator state
  const [gamepadUiState, setGamepadUiState] = useState<{
    connected: boolean;
    activeDevice: InputDeviceMode;
    name: string;
  }>({
    connected: false,
    activeDevice: 'keyboard',
    name: '',
  });
  const gamepadUiStateRef = useRef(gamepadUiState);
  gamepadUiStateRef.current = gamepadUiState;

  useEffect(() => {
    const syncGamepadStatus = () => {
      const gp = gamepadManager.getActiveGamepad();
      const connected = Boolean(gp);
      const name = gp ? gp.id || 'Gamepad' : '';
      const nextDevice: InputDeviceMode = connected ? 'gamepad' : 'keyboard';
      gamepadManager.gamepadConnected = connected;
      gamepadManager.gamepadName = name;
      if (connected) gamepadManager.activeDevice = 'gamepad';
      setGamepadUiState({
        connected,
        activeDevice: nextDevice,
        name,
      });
    };
    window.addEventListener('gamepadconnected', syncGamepadStatus);
    window.addEventListener('gamepaddisconnected', syncGamepadStatus);
    return () => {
      window.removeEventListener('gamepadconnected', syncGamepadStatus);
      window.removeEventListener('gamepaddisconnected', syncGamepadStatus);
    };
  }, []);

  // Unified Arena Interaction (Key E or Gamepad X [buttons[2]])
  const triggerArenaInteract = useCallback(() => {
    if (gameStateRef.current !== 'playing') return false;
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return false;

    // 1. Čertův dědeček v dosahu
    if (eng.grandfather.active && Math.hypot(eng.grandfather.x - p.x, eng.grandfather.y - p.y) < 220) {
      gamepadManager.consumeActionsAndLockBleed(eng.keys);
      openGrandfatherShop();
      return true;
    }

    // 2. Level 0 Interaktivní objekty (Kostelní zvonice, Hospodský soudek, Kaplička / Oltář)
    if (eng.activeLevelId === 0) {
      const thaw = eng.marchThaw;
      if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.church, 30) && thaw.bellCooldown <= 0) {
        thaw.bellCooldown = 90;
        const nearby = enemySpatialHashRef.current.queryCircleInto(
          MARCH_THAW_POIS.church.x,
          MARCH_THAW_POIS.church.y,
          1000 + 80,
          terrainSpatialResultsRef.current
        );
        for (let i = 0; i < nearby.length; i++) {
          const enemy = nearby[i];
          if (enemy.dead || enemy.isDefeated || enemy.isBoss || enemy.category === 'bosses') continue;
          const dx = enemy.x - MARCH_THAW_POIS.church.x;
          const dy = enemy.y - MARCH_THAW_POIS.church.y;
          if (dx * dx + dy * dy > 1000 * 1000) continue;
          const holyMult = getHolyDamageMultiplier(enemy);
          const holyPush = Math.max(0.1, 1 - getEnemyHolyResistance(enemy));
          enemy.takeDamage((enemy.hp + 1) * holyMult, 'holy', dx * 2.2 * holyPush, dy * 2.2 * holyPush);
        }
        pushDamageText(eng.texts, p.x, p.y - 52, '🔔 ZVONICE! SVATÝ OTŘES!', COLORS.mustard, true, 'combatStates');
        sound.bell();
        return true;
      }
      if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.tavern, 30) && thaw.kegCooldown <= 0) {
        thaw.kegCooldown = 16;
        const direction = Math.hypot(p.lastDx || 0, p.lastDy || 0) || 1;
        const x = p.x + ((p.lastDx || 1) / direction) * 90;
        const y = p.y + ((p.lastDy || 0) / direction) * 90;
        thaw.beerPuddle = { x, y, time: 6 };
        const nearby = enemySpatialHashRef.current.queryCircleInto(
          x,
          y,
          170 + 80,
          terrainSpatialResultsRef.current
        );
        for (let i = 0; i < nearby.length; i++) {
          const enemy = nearby[i];
          const dx = enemy.x - x;
          const dy = enemy.y - y;
          if (!enemy.dead && !enemy.isDefeated && dx * dx + dy * dy < 170 * 170) {
            enemy.takeDamage(110 * (p.damageMultiplier || 1), 'physical', dx * 3, dy * 3);
            enemy.stunTimer = Math.max(enemy.stunTimer || 0, 2.4);
          }
        }
        pushDamageText(eng.texts, x, y - 30, '🍺 HOSPODSKÁ RVAČKA!', '#F6D365', true, 'combatStates');
        sound.hit();
        return true;
      }
      if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.shrine, 35) && thaw.shrineCooldown <= 0 && (thaw.apparitionTimer || 0) <= 0) {
        thaw.shrineCharge = 0;
        thaw.shrineCooldown = MARCH_MARIAN_APPARITION_COOLDOWN;
        thaw.apparitionTimer = 4.2;
        thaw.apparitionPulseTimer = 0;
        p.hp = Math.min(p.maxHp, p.hp + 18 * (p._cachedFrostHealMult ?? 1));
        const count = enemySpatialHashRef.current.queryCircleInto(
          MARCH_THAW_POIS.shrine.x,
          MARCH_THAW_POIS.shrine.y,
          580,
          terrainSpatialResultsRef.current
        );
        for (let i = 0; i < count.length; i++) {
          const enemy = terrainSpatialResultsRef.current[i];
          const dx = enemy.x - MARCH_THAW_POIS.shrine.x;
          const dy = enemy.y - MARCH_THAW_POIS.shrine.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (!enemy.dead && !enemy.isDefeated && dist < 560 + (enemy.radius || 0)) {
            enemy.takeDamage(145 * (p.damageMultiplier || 1), 'holy', (dx / dist) * 540, (dy / dist) * 540);
            enemy.panicked = true;
            enemy.panicTimer = Math.max(enemy.panicTimer || 0, 5.0);
          }
        }
        eng.lightningFlash = Math.max(eng.lightningFlash, 0.35);
        pushDamageText(eng.texts, MARCH_THAW_POIS.shrine.x, MARCH_THAW_POIS.shrine.y - 110, '✦ ZJEVENÍ PANNY MARIE S JEŽÍŠKEM!', '#FEF08A', true, 'bossAnnouncements');
        sound.bell();
        return true;
      }
    }

    // 3. Interaktivní předmět / Truhla / Chasník v dosahu (~165 px)
    if (eng.drops && eng.drops.length > 0) {
      let nearestDrop: any = null;
      let nearestDistSq = 165 * 165;
      for (let i = 0; i < eng.drops.length; i++) {
        const d = eng.drops[i];
        if (!d || d.dead || !isInteractiveArenaDrop(d.type)) continue;
        const dx = d.x - p.x;
        const dy = d.y - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq <= nearestDistSq) {
          nearestDistSq = distSq;
          nearestDrop = d;
        }
      }
      if (nearestDrop) {
        // Přitáhne objekt přímo k hráči pro okamžitou aktivaci v herní smyčce
        nearestDrop.x = p.x;
        nearestDrop.y = p.y;
        if (nearestDrop.type === 'chest') {
          gamepadManager.consumeActionsAndLockBleed(eng.keys);
        }
        return true;
      }
    }

    return false;
  }, [openGrandfatherShop]);

  const triggerArenaInteractRef = useRef(triggerArenaInteract);
  triggerArenaInteractRef.current = triggerArenaInteract;
  const togglePauseRef = useRef(togglePause);
  togglePauseRef.current = togglePause;
  const toggleFullscreenRef = useRef(toggleFullscreen);
  toggleFullscreenRef.current = toggleFullscreen;

  // Keyboard handlers (with e.repeat edge-detection guard & input bleed protection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts if typing in an input field
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      const wasAlreadyPressed = Boolean(engineRef.current.keys[e.code]);
      engineRef.current.keys[e.code] = true;
      gamepadManager.notifyKeyboardActivity();
      if (gamepadUiStateRef.current.activeDevice !== 'keyboard') {
        setGamepadUiState((prev) => ({ ...prev, activeDevice: 'keyboard' }));
      }

      // Edge detection: ignore auto-repeat keydown events while held
      if (e.repeat || wasAlreadyPressed) {
        if (e.code === 'Space' && gameStateRef.current === 'playing') {
          e.preventDefault();
        }
        return;
      }

      // Fullscreen toggle on [F]
      if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.code === 'Space' && gameStateRef.current === 'playing') {
        e.preventDefault();
        const cs = engineRef.current.cutscene;
        if (cs) {
          if (!cs.applied) {
            cs.t = Math.max(cs.t, cs.applyAt);
          } else {
            cs.t = cs.dur;
          }
          return;
        }
        triggerUltimate();
      }
      const isPKey = e.code === 'KeyP' || e.key === 'p' || e.key === 'P';
      const isEscKey = e.code === 'Escape' || e.key === 'Escape';

      if (isEscKey && isControlsOpen) {
        e.preventDefault();
        setIsControlsOpen(false);
        return;
      }

      if (gameState === 'playing' && (e.code === 'KeyE' || e.key === 'e' || e.key === 'E')) {
        if (triggerArenaInteract()) {
          e.preventDefault();
          return;
        }
      }

      if (gameState === 'chest' || gameStateRef.current === 'chest') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          gamepadManager.consumeActionsAndLockBleed(engineRef.current.keys);
          if (slotSpinningRef.current) {
            skipSlotSpinRef.current();
          } else {
            closeChestSequenceRef.current();
          }
          return;
        }
      }

      if ((isEscKey || isPKey) && (gameState === 'playing' || gameState === 'paused')) {
        e.preventDefault();
        if (isControlsOpen) {
          setIsControlsOpen(false);
          return;
        }
        gamepadManager.consumeActionsAndLockBleed(engineRef.current.keys);
        togglePause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = false;
    };
    const handleBlur = () => {
      engineRef.current.keys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, togglePause, isControlsOpen, toggleFullscreen, triggerArenaInteract]);

  // Start new run
  const startGame = (
    type: CharacterType,
    targetLevelId?: GameLevelId,
    customWeapons?: { id: string; level: number; mastery?: any }[],
    isTestMode = false,
    customGrandfatherUpgrades?: Record<string, number>
  ) => {
    const chosenLevelId: GameLevelId = (targetLevelId !== undefined ? targetLevelId : selectedLevelId !== undefined ? selectedLevelId : 0) as GameLevelId;
    const chosenLevel: GameLevelDef = GAME_LEVELS[chosenLevelId] || GAME_LEVELS[0];

    if (!isTestMode) {
      const levelProg = getLevelProgress(chosenLevelId, metaRef.current);

      if (!levelProg.isUnlocked) {
        sound.hit();
        setSelectedLevelDetail(levelProg);
        if (levelProg.isQueued) {
          showUnlockNotice({
            icon: 'padlock',
            title: `${levelProg.spoiledName} je v pořadí!`,
            desc: `Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň (${levelProg.requiredLevelName}).`,
          }, 4500);
        } else {
          showUnlockNotice({
            icon: 'padlock',
            title: `${levelProg.spoiledName} je uzamčena!`,
            desc: `Splněno ${levelProg.percent} % výzvy (${levelProg.curCount} / ${levelProg.maxCount} zahnáno).`,
          }, 4500);
        }
        return;
      }

      const hunterProg = getHunterProgress(type, metaRef.current);
      if (!hunterProg.isUnlocked) {
        sound.hit();
        setSelectedHunterDetail(hunterProg);
        if (hunterProg.isQueued) {
          showUnlockNotice({
            icon: 'padlock',
            title: `${hunterProg.spoiledName} je v pořadí!`,
            desc: `Tento lovec se začne odemykat teprve poté, co odemknete předchozího lovce (${hunterProg.requiredHunterName}).`,
          }, 4500);
        } else {
          showUnlockNotice({
            icon: 'padlock',
            title: `${hunterProg.spoiledName} je uzamčen!`,
            desc: `Splněno ${hunterProg.percent} % výzvy (${hunterProg.curCount} / ${hunterProg.maxCount} zahnáno).`,
          }, 4500);
        }
        return;
      }
    }

    sound.init();
    sound.coin();
    if (!isTestMode) lastHunterTypeRef.current = type;

    // 1. Cancel any active timeouts or intervals from prior runs to prevent state corruption
    if (victoryTimeoutRef.current) {
      clearTimeout(victoryTimeoutRef.current);
      victoryTimeoutRef.current = null;
    }
    if (unlockNoticeTimeoutRef.current) {
      clearTimeout(unlockNoticeTimeoutRef.current);
      unlockNoticeTimeoutRef.current = null;
    }
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }
    setSlotSpinning(false);
    setSlotStoppedCount(0);

    // 2. Reset pending milestone queue so old pending modals from previous runs never fire
    setPendingMilestones([]);
    pendingMilestonesRef.current = [];

    // 3. Reset persistent spatial query arrays & touch state
    primarySpatialResultsRef.current.length = 0;
    secondarySpatialResultsRef.current.length = 0;
    touchMoveRef.current = { x: 0, y: 0, active: false, intensity: 0 };
    runStatsRef.current.warningBanner = '';

    // 4. Dispose previous arena chunk canvases and clear cached word stamps to free GPU VRAM immediately
    if (arenaChunkCacheRef.current) {
      arenaChunkCacheRef.current.dispose();
      arenaChunkCacheRef.current = null;
    }
    resetGlobalGlyphAtlas();

    const cType = toCanonicalHunterId(type);
    const baseMaxHp =
      cType === 'krajanek' ? 135 : cType === 'tulak' ? 230 : cType === 'pasacek' ? 55 : cType === 'korenarka' ? 125 : cType === 'kostelnik' ? 135 : cType === 'babicka' ? 130 : 140;
    const baseSpeed =
      cType === 'krajanek' ? 180 : cType === 'tulak' ? 165 : cType === 'pasacek' ? 220 : cType === 'korenarka' ? 180 : cType === 'kostelnik' ? 170 : cType === 'babicka' ? 165 : 175;
    const basePickup =
      cType === 'krajanek' ? 115 : cType === 'tulak' ? 75 : cType === 'pasacek' ? 160 : cType === 'korenarka' ? 105 : cType === 'kostelnik' ? 110 : cType === 'babicka' ? 125 : 115;

    const initialWeapons =
      customWeapons && customWeapons.filter((w) => w.level > 0).length > 0
        ? customWeapons.filter((w) => w.level > 0).map((w) => {
            const mapped = {
              ...w,
              id: toCanonicalWeaponId(w.id),
              cd: 0,
              mastery: w.mastery || createWeaponMasteryState(),
              milestones: (w as any).milestones || [],
            };
            ensureWeaponMilestones(mapped);
            return mapped;
          })
        : cType === 'krajanek'
        ? [{ id: 'osikovy_prut', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : cType === 'tulak'
        ? [{ id: 'bylinkova_fajfka', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : cType === 'pasacek'
        ? [{ id: 'povidlove_buchty', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : cType === 'korenarka'
        ? [{ id: 'devatero_kviti', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : cType === 'kostelnik'
        ? [{ id: 'svecena_kropenka', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : cType === 'babicka'
        ? [{ id: 'kynuty_kolac', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }]
        : [{ id: 'kovana_halapartna', level: 1, cd: 0, mastery: createWeaponMasteryState(), milestones: [] }];

    initialWeapons.forEach((w: any) => {
      ensureWeaponMilestones(w);
      w._cachedStats = getRankedWeaponStats(w.id, w.level, w);
    });

    const wallBonusHp = Math.round(baseMaxHp * getWallHpMultiplier(meta.wallLevel || 0));
    const millBonusSpeed = Math.round(baseSpeed * getMillSpeedMultiplier(meta.millLevel || 0));
    const rawBasePickup = basePickup * (cType === 'korenarka' ? 0.25 : 1);
    const scarecrowBonusPickup = Math.round(rawBasePickup * getScarecrowPickupMultiplier(meta.scarecrowLevel || 0));
    const wallDmgRed = getWallDamageReduction(meta.wallLevel || 0);

    const baseLuck =
      cType === 'babicka'
        ? 120
        : cType === 'pasacek'
        ? 105
        : cType === 'tulak'
        ? 70
        : cType === 'kostelnik'
        ? 100
        : cType === 'ponocny'
        ? 90
        : cType === 'korenarka'
        ? 85
        : 100;
    const boziMukaBonusLuck = Math.round(baseLuck * getBoziMukaLuckMultiplier(meta.boziMukaLevel || 0));

    const player = {
      x: 0,
      y: 0,
      radius: 20 * (1 - mobileAccessibilityScale * 0.05),
      accessibilityBaseRadius: 20,
      type,
      maxHp: baseMaxHp + wallBonusHp,
      hp: baseMaxHp + wallBonusHp,
      speed: baseSpeed + millBonusSpeed,
      pickupRadius: (rawBasePickup + scarecrowBonusPickup) * (1 + mobileAccessibilityScale * 0.05),
      accessibilityBasePickupRadius: rawBasePickup + scarecrowBonusPickup,
      accessibilityAppliedLevel: mobileAccessibilityScale,
      luck: baseLuck + boziMukaBonusLuck,
      weapons: initialWeapons,
      _firingWeapon: null as any,
      damageMultiplier: 1,
      churchLevel: meta.churchLevel || 0,
      holyDamageMultiplier: 1 + Math.max(0, meta.churchLevel || 0) * 0.08,
      tulakDamageBonus: cType === 'tulak' ? 35 : 0,
      cooldownMultiplier: 1,
      cooldownBonus: 0,
      kavaCount: 0,
      jelitoCount: 0,
      kurazCount: 0,
      fajfkaLevel: 0,
      fajfkaCooldown: 0,
      bearMaskLevel: 0,
      bearMaskHealBonus: 0,
      speedCount: 0,
      magnetCount: 0,
      damageReduction: wallDmgRed,
      regenLevel: meta.regenLevel || 0,
      regenTimer: 0,
      invulnerabilityTimer: 0,
      krajanekRideTimer: 0,
      krajanekRideTickTimer: 0,
      krajanekUpgradeCount: 0,
      krajanekFlats: [] as Array<{ x: number; y: number; angle: number; scale: number; life: number }>,
      intangibleTimer: 0,
      guaranteedCritTimer: 0,
      facingAngle: 0,
      dodgeCooldown: 0,
      dodgeChance: cType === 'pasacek' ? 0.35 : 0,
      tavernShieldLevel: meta.tavernShieldLevel || 0,
      tempShield: 0,
      herbTimer: 0,
      herbBoostTimer: 0,
      soulBuffTimer: 0,
      waterSoakedTimer: 0,
      meltingPuddleSlowTimer: 0,
      slowTimer: 0,
      hasSoakedCane: false,
      hromnickaPulseTimer: 0,
      hromnickaPulseRadius: 0,
      ultCd: 0,
      ultMaxCd: cType === 'krajanek' ? 30 : cType === 'tulak' ? 21 : cType === 'babicka' ? 45 : cType === 'kostelnik' ? 35 : 30,
      lastDx: 1,
      lastDy: 0,
      animTime: 0,
      valecniceAngle: 0,
      valecniceOrbitDir: 1,
      _valecniceBounceCd: 0,
      valecniceHitTimer: 0,
      garlicAuraTimer: 0,
      _valecniceSlowRadius: 0,
      _valecniceSlowRate: 0,
      _valecnicePulse: false,
      _garlicPulse: false,
      _caneSwingAlt: false,

      // Každý lovec po zranění na blízko bubákem bubáka odhodí (resist neplatí, pokud nejde o bosse levelu)
      // a udělí mu zranění rovné 15 % maximální Kuráže lovce
      counterMeleeAttacker(attacker: any) {
        if (!attacker || attacker.isDefeated || attacker.dead) return;
        const dx = attacker.x - this.x;
        const dy = attacker.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        let nx = dx / dist;
        let ny = dy / dist;
        if (dist < 0.001) {
          nx = this.lastDx || 1;
          ny = this.lastDy || 0;
        }

        // Zranění odpovídající 15 % lovcovy maximální Kuráže
        const counterDmg = Math.max(1, Math.round(this.maxHp * 0.15));
        const pushForce = 540;
        const kbx = nx * pushForce;
        const kby = ny * pushForce;

        attacker.takeDamage(counterDmg, 'physical', kbx, kby, {
          isHunterCounter: true,
          source: 'hunter_melee_counter',
        });

        sound.heavyHit();
        pushDamageText(engineRef.current.texts, attacker.x, attacker.y - 48, 'ODSTRČENÍ! 💨', '#F59E0B', true);
        for (let p = 0; p < 7; p++) {
          const pAng = Math.random() * Math.PI * 2;
          const pSpd = 70 + Math.random() * 90;
          emitParticle(engineRef.current.particles, () => ({
            x: attacker.x,
            y: attacker.y,
            vx: nx * 130 + Math.cos(pAng) * pSpd,
            vy: ny * 130 + Math.sin(pAng) * pSpd,
            life: 0.32,
            color: p % 2 === 0 ? '#F59E0B' : '#FFFFFF',
            size: 3.5,
          }));
        }
      },

      // Take damage from mob contact or hazard attacks
      takeDamage(amount: number, type = 'physical', attacker?: any, isMelee?: boolean) {
        if (gameStateRef.current !== 'playing' || this.hp <= 0) return;
        if (
          this.invulnerabilityTimer > 0 ||
          (this.intangibleTimer && this.intangibleTimer > 0) ||
          (this.type === 'krajanek' && (this.krajanekRideTimer || 0) > 0)
        ) return;
        const effectiveDodgeChance = Math.min(
          0.60,
          typeof this.dodgeChance === 'number' ? this.dodgeChance : ((this.type === 'pasacek' || this.type === 'shepherd') ? 0.35 : 0)
        );
        if (effectiveDodgeChance > 0 && Math.random() < effectiveDodgeChance) {
          pushDamageText(engineRef.current.texts, this.x, this.y - 35, 'ÚHYB! 💨', COLORS.mustard, true, 'combatStates');
          sound.slash();

          // Vrbová píšťalka z pastviny
          if ((this.vrbovaPistalkaStacks || 0) > 0) {
            const pistalkaStacks = this.vrbovaPistalkaStacks || 1;
            this.ultCd = Math.max(0, (this.ultCd || 0) - (2.0 + (pistalkaStacks - 1) * 0.75));
            this.pistalkaSpeedTimer = 3.0 + (pistalkaStacks - 1) * 0.5;
            const shockRadius = 160 + (pistalkaStacks - 1) * 25;
            const shockDmg = Math.round(45 + (pistalkaStacks - 1) * 20 + (this.speed || 180) * 0.4);
            const shockFoes = enemySpatialHashRef.current.queryRadius(this.x, this.y, shockRadius);
            for (let i = 0; i < shockFoes.length; i++) {
              const foe = shockFoes[i];
              if (foe.isDefeated || foe.dead) continue;
              const fdx = foe.x - this.x;
              const fdy = foe.y - this.y;
              const fdist = Math.hypot(fdx, fdy) || 1;
              const kx = (fdx / fdist) * 260;
              const ky = (fdy / fdist) * 260;
              foe.takeDamage(shockDmg, 'physical', kx, ky);
            }
            pushDamageText(engineRef.current.texts, this.x, this.y - 55, 'HVIZD! 🪈', '#38BDF8', true);
          }

          // Vodnický klobouk s pentlí
          if ((this.lojemMazaneKrpceStacks || 0) > 0) {
            const kloboukStacks = this.lojemMazaneKrpceStacks || 1;
            this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer || 0, 0.55 + (kloboukStacks - 1) * 0.15);
            this.hp = Math.min(this.maxHp, this.hp + 4 * kloboukStacks);
            const puddleX = attacker ? attacker.x : this.x;
            const puddleY = attacker ? attacker.y : this.y;
            const slowRatio = Math.min(0.60, 0.40 + (kloboukStacks - 1) * 0.10);
            if (!engineRef.current.plumPuddles) engineRef.current.plumPuddles = [];
            if (engineRef.current.plumPuddles.length >= 24) engineRef.current.plumPuddles.shift();
            engineRef.current.plumPuddles.push({
              x: puddleX,
              y: puddleY,
              radius: 44 + (kloboukStacks - 1) * 8,
              life: 6.5,
              maxLife: 6.5,
              slowRatio,
            });
            pushDamageText(engineRef.current.texts, this.x, this.y - 50, 'SMEKNUTO! 🎩', '#10B981', true);
          }

          return;
        }
        if ((meta.windLevel || 0) > 0 && this.dodgeCooldown <= 0) {
          this.dodgeCooldown = Math.max(10, 60 - ((meta.windLevel || 0) * 10));
          pushDamageText(engineRef.current.texts, this.x, this.y - 35, 'DODGE!', COLORS.mustard, true);
          return;
        }
        let totalReduction = Math.min(0.85, (this.damageReduction || 0) + (this.arenaArmorBonus || 0));
        if (engineRef.current.holyCircle && (this.holyCircleStacks || 0) > 0) {
          const pDist = Math.hypot(this.x - engineRef.current.holyCircle.x, this.y - engineRef.current.holyCircle.y);
          if (pDist <= engineRef.current.holyCircle.radius) {
            totalReduction = Math.min(0.85, totalReduction + Math.min(0.60, this.holyCircleStacks * 0.20));
          }
        }
        const hurtDmg = Math.max(1, amount * (1 - totalReduction));
        let remainingDmg = hurtDmg;
        let absorbed = 0;
        if (this.tempShield > 0) {
          absorbed = Math.min(this.tempShield, remainingDmg);
          this.tempShield -= absorbed;
          remainingDmg -= absorbed;
        }
        const hpBeforeDamage = this.hp;
        if (remainingDmg > 0) this.hp = Math.max(0, this.hp - remainingDmg);
        if (this.hp < hpBeforeDamage) {
          const hitInvulnerability = isMelee && (this.type === 'pasacek' || this.type === 'shepherd') ? 0.6 : 0.3;
          this.invulnerabilityTimer = Math.max(this.invulnerabilityTimer || 0, hitInvulnerability);
          this.hurtTimer = Math.max(this.hurtTimer || 0, 0.42);
        }
        sound.hit();
        if (absorbed > 0 && remainingDmg <= 0) {
          pushDamageText(engineRef.current.texts, this.x, this.y - 35, 'ŠTÍT POHLTIL! 🛡️', '#38BDF8', true);
        } else {
          pushDamageText(engineRef.current.texts, this.x, this.y - 35, `-${Math.ceil(remainingDmg)}`, COLORS.red);
        }

        // Každý lovec potom co je na blízko zraněn bubákem, bubáka puschne pryč
        // (resist zde nefunguje, pokud se nejedná o bosse levelu!)
        // a dá mu zranění, které odpovídá 15 procentům lovcovy maximální Kuráže.
        if (isMelee && attacker && !attacker.isDefeated && !attacker.dead) {
          this.counterMeleeAttacker(attacker);
        }

        if (this.hp <= 0) {
          this.hp = 0;
          sound.hit();
          setGameState('fleeing');
          engineRef.current.fleeTimer = 3.0;
          const fleeDirX = attacker ? (this.x - attacker.x) : (this.lastDx < 0 ? -1 : 1);
          const fleeDirY = attacker ? (this.y - attacker.y) : -0.25;
          const fleeLen = Math.hypot(fleeDirX, fleeDirY) || 1;
          this.fleeVx = (fleeDirX / fleeLen) * 235;
          this.fleeVy = (fleeDirY / fleeLen) * 235;
          this.lastDx = this.fleeVx >= 0 ? 1.8 : -1.8;
          this.lastDy = this.fleeVy >= 0 ? 0.5 : -0.5;
          engineRef.current.enemies.forEach((m) => {
            m.panicked = true;
            m.vx = -m.vx * 3;
            m.vy = -m.vy * 3;
          });
        }
      },

      // Helper methods for weapon scripts
      distTo(e: any) {
        return Math.hypot(e.x - this.x, e.y - this.y);
      },
      distSqTo(e: any) {
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        return dx * dx + dy * dy;
      },
      getLivingEnemies() {
        return livingEnemiesRef.current;
      },
      getNearbyEnemies(radius = 850) {
        return enemySpatialHashRef.current.queryCircle(this.x, this.y, radius);
      },
      spawnProjectile(proj: any) {
        engineRef.current.projectiles.push({
          ...proj,
          weaponId: proj.weaponId || this._firingWeapon?.id,
          vx: Math.cos(proj.angle) * proj.speed,
          vy: Math.sin(proj.angle) * proj.speed,
          hitList: [],
          dead: false,
        });
      },
      spawnMeleeSlash(slash: any) {
        engineRef.current.slashes.push({
          ...slash,
          weaponId: slash.weaponId || this._firingWeapon?.id,
          maxLife: slash.maxLife || slash.life,
          time: 0,
          hitList: [],
          dead: false,
        });
        if (slash.pullLoot) {
          pullWhipLoot(engineRef.current.drops, slash.x, slash.y, slash.angle, slash.reach);
        }
        pushTransientLight(createOsikovySlashLight(slash.x, slash.y));
      },
      spawnAreaImpact(impact: any) {
        if (impact.type === 'holy') {
          pushTransientLight(createHolyCathedralLight(impact.x, impact.y));
        }
        const levelId = engineRef.current.activeLevelId ?? 0;
        const decor = engineRef.current.decor;
        // Broadphase rejects the whole virtual flock or snowman horde before per-entity AOE collision tests.
        const crowWaveImpactMayHit = crowWaveRef.current?.isWithinBounds(
          impact.x, impact.y, impact.radius + CROW_WAVE_HIT_RADIUS
        ) ?? false;
        const snowmanHordeImpactMayHit = snowmanHordeRef.current?.isWithinBounds(
          impact.x, impact.y, impact.radius + SNOWMAN_HORDE_HIT_RADIUS
        ) ?? false;
        const nearby = enemySpatialHashRef.current.queryCircle(impact.x, impact.y, impact.radius + 60);
        for (let i = 0; i < nearby.length; i++) {
          const e = nearby[i];
          if (e.isDefeated) continue;
          if (e.isVirtualCrowMember && !crowWaveImpactMayHit) continue;
          if (e.isVirtualSnowmanMember && !snowmanHordeImpactMayHit) continue;
          const dx=e.x-impact.x, dy=e.y-impact.y, reach=impact.radius+e.radius;
          if (dx*dx+dy*dy <= reach*reach) {
            if (!hasTerrainLineOfSight(impact.x, impact.y, e.x, e.y, levelId, decor)) continue;
            e.takeDamage(impact.dmg, impact.type, dx*4, dy*4);
            if (!impact.noMasteryProc && impact.weaponId) this.triggerWeaponMastery(impact.weaponId, e, 'hit');
          }
        }
        pushDamageText(engineRef.current.texts, impact.x, impact.y - 20, 'BUM!', COLORS.mustard, true);
      },
      spawnHromnickaPulse(reach: number, dmg: number, level: number) {
        this.hromnickaPulseTimer = 0.35;
        this.hromnickaPulseRadius = reach;
        pushTransientLight(createHolyCathedralLight(this.x, this.y));
        const levelId = engineRef.current.activeLevelId ?? 0;
        const decor = engineRef.current.decor;
        const nearby = enemySpatialHashRef.current.queryCircle(this.x, this.y, reach + 50);
        for (let i = 0; i < nearby.length; i++) {
          const e = nearby[i];
          if (e.isDefeated) continue;
          const dx = e.x - this.x;
          const dy = e.y - this.y;
          const distSq = dx * dx + dy * dy;
          const maxReach = reach + e.radius;
          if (distSq <= maxReach * maxReach) {
            if (!hasTerrainLineOfSight(this.x, this.y, e.x, e.y, levelId, decor)) continue;
            const dist = Math.sqrt(distSq) || 1;
            const holyPush = getHolyPushMultiplier(e);
            const kbForce = (120 + level * 10) * holyPush;
            const finalDmg = dmg * (isUnholyEnemy(e) ? 1.5 : 1.0);
            e.takeDamage(finalDmg, 'holy', (dx / dist) * kbForce, (dy / dist) * kbForce);
            if (isUnholyEnemy(e)) {
              pushDamageText(engineRef.current.texts, e.x, e.y - 35, 'SVATÉ SPÁLENÍ! 🔥', COLORS.mustard, true);
            }
          }
        }
        for (let i = 0; i < 6; i++) {
          const sparkAng = (i / 6) * Math.PI * 2;
          const sparkDist = reach * 0.45;
          emitParticle(engineRef.current.particles, () => ({
            x: this.x + Math.cos(sparkAng) * sparkDist,
            y: this.y + Math.sin(sparkAng) * sparkDist,
            vx: Math.cos(sparkAng) * 45,
            vy: Math.sin(sparkAng) * 45,
            life: 0.3,
            color: '#FEF08A',
            size: 3.2,
          }));
        }
      },

      spawnFajfkaCloud(radius: number, dmg: number, duration: number, stats?: any) {
        const cloud = new SmokePuff(this.x, this.y, radius, 'fajfka', duration) as any;
        cloud.damagePerSecond = dmg;
        engineRef.current.smokePuffs.push(cloud);
        const totalDmgMult = dmg > 0 ? (dmg / 9) : ((this.damageMultiplier || 1) * (stats?.damageMult ?? 1));
        const healRatio = 0.08 * totalDmgMult;
        const requestedHeal = this.maxHp * healRatio * (1 + ((this as any).bearMaskHealBonus || 0));
        const missingHp = Math.max(0, this.maxHp - this.hp);
        const overheal = Math.max(0, requestedHeal - missingHp);
        this.hp = Math.min(this.maxHp, this.hp + requestedHeal);
        if ((this as any).bearMaskLevel > 0 && overheal > 0) {
          const levelId = engineRef.current.activeLevelId ?? 0;
          const decor = engineRef.current.decor;
          const maskDamage = overheal * 0.5 * (1 + ((this as any).bearMaskLevel - 1) * 0.2) * (this.damageMultiplier || 1);
          for (const enemy of enemySpatialHashRef.current.queryCircle(this.x, this.y, 290)) {
            if (enemy.isDefeated || enemy.dead) continue;
            if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= 230 + (enemy.radius || 0)) {
              if (!hasTerrainLineOfSight(this.x, this.y, enemy.x, enemy.y, levelId, decor)) continue;
              enemy.takeDamage(maskDamage, 'mask', 0, 0, { allowFractionalDamage: true });
            }
          }
        }
      },

      triggerWeaponMastery(_weaponId: string, _enemy: any, _event: 'hit' | 'pulse' = 'hit') {
        // Legacy no-op; milestone progression replaces new mastery rewards.
      },

      draw(ctx: CanvasRenderingContext2D) {
        Lada.drawShadow(ctx, this.x, this.y, this.radius);

        if (this.soulBuffTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (this.type === 'ponocny' || this.type === 'watchman') {
          ctx.save();
          const grad = ctx.createRadialGradient(this.x, this.y, 12, this.x, this.y, 85);
          grad.addColorStop(0, 'rgba(255, 220, 120, 0.16)');
          grad.addColorStop(0.7, 'rgba(255, 180, 50, 0.06)');
          grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 85, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const isFleeing = (engineRef.current?.fleeTimer ?? 0) > 0;
        const isHurt = !isFleeing && (this.hurtTimer ?? 0) > 0;
        const isPlayerMoving = Math.abs(this.vx || 0) > 0.1 || Math.abs(this.vy || 0) > 0.1;
        const isSprinting =
          !isFleeing &&
          isPlayerMoving &&
          ((this.gingerbreadSpeedTimer ?? 0) > 0 ||
            (this.soulBuffTimer ?? 0) > 0 ||
            (this.pistalkaSpeedTimer ?? 0) > 0 ||
            (this.speedMultiplier ?? 1) > 1.28);
        const animT = this.animTime || engineRef.current?.uiTime || 0;
        const facingSign = (this.lastDx ?? 1) >= 0 ? 1 : -1;
        const drawDx = isPlayerMoving
          ? (isSprinting
              ? facingSign * Math.max(1.6, Math.abs(this.lastDx) * 1.6)
              : this.lastDx)
          : facingSign * 0.001;
        const drawDy = isPlayerMoving ? (isSprinting ? this.lastDy * 1.6 : this.lastDy) : 0;

        if (this.type === 'krajanek') {
          Lada.drawKrajanekFlats(ctx, this.krajanekFlats || []);
          Lada.drawKrajanekFurrows?.(ctx, this.krajanekFurrows || engineRef.current?.krajanekFurrows || []);
          if (engineRef.current?.krajanekCoastingStones && engineRef.current.krajanekCoastingStones.length > 0) {
            for (let i = 0; i < engineRef.current.krajanekCoastingStones.length; i++) {
              Lada.drawCoastingZernov?.(ctx, engineRef.current.krajanekCoastingStones[i], engineRef.current?.uiTime || 0);
            }
          }
          if ((this.krajanekRideTimer || 0) > 0) {
            const colossusScale = 1 + (this.krajanekColossusStacks || 0) * 0.05;
            Lada.drawKrajanekRide(
              ctx,
              this.x,
              this.y,
              engineRef.current?.uiTime || this.animTime || 0,
              drawDx,
              drawDy,
              1,
              this.krajanekTilt || 0,
              Boolean(this.krajanekIsDrifting),
              colossusScale,
            );
          } else {
            Lada.drawKrajanek(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1);
          }
        } else if (this.type === 'tulak' || this.type === 'wanderer') {
          const isWhirling = Boolean(engineRef.current?.sukovice && engineRef.current.sukovice.t < engineRef.current.sukovice.dur);
          const sukoviceT = engineRef.current?.sukovice ? (engineRef.current.sukovice.t / engineRef.current.sukovice.dur) : 0;
          Lada.drawWanderer(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1, isWhirling, sukoviceT, isHurt);
        } else if (this.type === 'pasacek' || this.type === 'shepherd') {
          Lada.drawShepherd(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1, isHurt);
        } else if (this.type === 'korenarka') {
          Lada.drawKorenarka(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1);
        } else if (this.type === 'ponocny' || this.type === 'watchman') {
          Lada.drawWatchman(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1);
        } else if (this.type === 'kostelnik' || this.type === 'sexton') {
          Lada.drawSexton(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1, isHurt);
        } else if (this.type === 'babicka' || this.type === 'granny') {
          Lada.drawGranny(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1, true, isHurt);
        } else {
          const isWhirling = Boolean(engineRef.current?.sukovice && engineRef.current.sukovice.t < engineRef.current.sukovice.dur);
          const sukoviceT = engineRef.current?.sukovice ? (engineRef.current.sukovice.t / engineRef.current.sukovice.dur) : 0;
          Lada.drawWanderer(ctx, this.x, this.y, animT, drawDx, drawDy, isFleeing, 1, isWhirling, sukoviceT, isHurt);
        }

        // Draw blessed candle in hand if Hromnička is equipped
        if (this._hromnickaWeapon) {
          const flip = this.lastDx >= 0 ? 1 : -1;
          Lada.drawBlessedCandle(ctx, this.x + flip * 15, this.y - 10, 1, this.animTime || 0);
        }

        // Draw Petrolejka brass lantern in hand during low-visibility phases
        const petrolejkaRadius = engineRef.current?.petrolejkaLight?.radius ?? 0;
        if (petrolejkaRadius > 0) {
          const kurazRatio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
          const flip = this.lastDx >= 0 ? 1 : -1;
          Lada.drawPetrolejka(ctx, this.x - flip * 14, this.y - 2, 0.85, engineRef.current?.uiTime || 0, kurazRatio);
        }
      },
    };


    const earnedReturnBonus = isTestMode ? null : pendingReturnBonusRef.current;
    activeRunBonusRef.current = earnedReturnBonus;
    if (!isTestMode) pendingReturnBonusRef.current = null;
    if (earnedReturnBonus) {
      const factor = 1 + (earnedReturnBonus.percent * earnedReturnBonus.multiplier) / 100;
      if (earnedReturnBonus.kind === 'damage') player.damageMultiplier *= factor;
      else if (earnedReturnBonus.kind === 'courage') {
        const extraHp = Math.round(player.maxHp * (factor - 1));
        player.maxHp += extraHp;
        player.hp += extraHp;
      }
    }

    // Seed a readable, combat-friendly composition instead of filling the
    // starting area with equally prominent decorative objects.
    const decor = seedArenaDecor(chosenLevel);
    arenaChunkCacheRef.current = new ChunkBitmapCache({ chunkSize: 512 });
    arenaChunkCacheRef.current.build(decor, chosenLevel.season, chosenLevel.theme, false);

    // Start from the engine's canonical defaults, then apply only values that
    // are specific to the selected level/run. This keeps simulation defaults
    // in one place and prevents startGame() from drifting from engineState.ts.
    const engine = createInitialEngineState();
    (player as any).activeLevelId = chosenLevelId;
    (player as any).decor = decor;
    engine.player = player;
    engine.decor = decor;
    engine.activeLevelId = chosenLevelId;

    // Seed architectural lights, shadow zones, and 2D vector occluders from decor
    seedLightingAndOccludersFromDecor(decor, engine.lightSources, engine.shadowZones, engine.occluders);
    engine.nextBossMechanicAt =
      chosenLevel.bossMechanic?.cadenceSeconds ?? Number.POSITIVE_INFINITY;
    engine.spawnTimer = (chosenLevelId === 1 || chosenLevelId === 0) ? 3.5 : 2.0;

    const canvas = canvasRef.current;
    if (canvas) {
      const camZoom = canvas.height < 768 ? Math.max(0.75, Math.min(1.0, canvas.height / 850)) : 1.0;
      engine.camera.x = player.x - (canvas.width / camZoom) / 2;
      engine.camera.y = player.y - (canvas.height / camZoom) / 2;
    }

    engine.crowWave = crowWaveRef.current;
    engine.snowmanHorde = snowmanHordeRef.current;
    engineRef.current = engine;

    // Stage 1's flock & snowman horde use fixed preallocated pools; no enemy objects are created in the frame loop.
    crowWaveRef.current?.resetRun();
    snowmanHordeRef.current?.resetRun();
    if (chosenLevelId === 0) {
      crowWaveRef.current?.preparePool(createEnemyInstance);
    }
    if (chosenLevelId === 0 || chosenLevelId === 1) {
      snowmanHordeRef.current?.preparePool(createEnemyInstance);
    }

    if (customGrandfatherUpgrades && Object.keys(customGrandfatherUpgrades).length > 0) {
      const purchasedIds: string[] = [];
      for (const [id, count] of Object.entries(customGrandfatherUpgrades)) {
        if (!count || count <= 0) continue;

        // 1. Synergické vylepšení zbraně z nůše
        const synDef = getSynergisticUpgrade(id);
        if (synDef) {
          let weapon: any = player.weapons?.find((w: any) => toCanonicalWeaponId(w.id) === synDef.weaponId);
          if (!weapon) {
            weapon = {
              id: synDef.weaponId,
              level: 1,
              cd: 0,
              mastery: createWeaponMasteryState(),
              milestones: [],
              synergisticUpgrades: [],
            } as any;
            (player.weapons as any[]).push(weapon);
          }
          weapon.synergisticUpgrades ??= [];
          if (!weapon.synergisticUpgrades.includes(id)) {
            weapon.synergisticUpgrades.push(id);
            weapon._cachedStats = undefined;
          }
          continue;
        }

        // 2. Položka či vylepšení z dědečkovy nůše
        const item = getGrandfatherItem(id);
        if (!item) continue;
        for (let c = 0; c < count; c++) {
          purchasedIds.push(item.id);
          applyGrandfatherItem(item);
        }
      }

      if (purchasedIds.length > 0) {
        grandfatherPurchaseIdsRef.current.length = 0;
        grandfatherPurchaseIdsRef.current.push(...purchasedIds);
        setGrandfatherPurchaseIds(purchasedIds);
        engine.grandfather.totalPurchases = purchasedIds.length;
      }
    } else {
      grandfatherPurchaseIdsRef.current.length = 0;
      setGrandfatherPurchaseIds([]);
    }

    if (isTestMode) {
      engine.texts = [];
      setRunStats((state) => ({ ...state, coins: engine.coins, gingerbread: engine.gingerbread }));
    }

    // Thematic opening wave right from second 0 tailored for smooth learning curve
    if (chosenLevelId === 0) {
      // Level 0: Předjaří (Denní tání) – 2 vrány
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        engineRef.current.enemies.push(createEnemyInstance('vrana', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.7));
      }
    } else if (chosenLevelId === 1) {
      // Level 1: Předjaří (Noční mrazy) – 2 mrazoví skřítci
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        engineRef.current.enemies.push(createEnemyInstance('mrazovy_skritek', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75));
      }
    } else if (chosenLevelId === 2) {
      // Level 2: Náves a rybník – 2 rarášci
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        engineRef.current.enemies.push(createEnemyInstance('rarach', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75));
      }
    } else if (chosenLevelId === 3) {
      // Level 3: Hřbitov – 2 kostlivci a černý pes
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.5;
        engineRef.current.enemies.push(createEnemyInstance('skeleton', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 0.9));
      }
      engineRef.current.enemies.push(createEnemyInstance('cerny_pes', player.x + 480, player.y - 100, 0.9));
    } else if (chosenLevelId === 4) {
      // Level 4: Ladovská zima – rampouchoví diblíci
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2;
        engineRef.current.enemies.push(createEnemyInstance('zmrzlik', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 1.0));
      }
      engineRef.current.enemies.push(createEnemyInstance('vanicka', player.x - 440, player.y - 180, 1.0));
    } else if (chosenLevelId === 5) {
      // Level 5: Hamry – lapka a jiskřivec
      engineRef.current.enemies.push(createEnemyInstance('zbojnik', player.x + 460, player.y, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('jiskrivec', player.x - 460, player.y, 1.0));
    } else if (chosenLevelId === 6) {
      // Level 6: Hláska – zbrojnoš a bílá paní
      engineRef.current.enemies.push(createEnemyInstance('zbrojnos', player.x + 460, player.y + 100, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('bila_pani', player.x - 460, player.y - 100, 1.0));
    } else if (chosenLevelId === 7) {
      // Level 7: Dračí sluj – ledový sněhulák a noční můra
      engineRef.current.enemies.push(createEnemyInstance('snehulak', player.x + 460, player.y, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('nocni_mura', player.x - 460, player.y, 1.0));
    }

    livingEnemiesRef.current.length = 0;
    for (let i = 0; i < engineRef.current.enemies.length; i++) {
      const e = engineRef.current.enemies[i];
      if (!e.dead && !e.isDefeated) {
        livingEnemiesRef.current.push(e);
      }
    }
    enemySpatialHashRef.current.rebuild(livingEnemiesRef.current);
    syncPlayerWeaponCache(player);
    adaptiveGovernorRef.current.tier = 0;
    adaptiveGovernorRef.current.tier1Timer = 0;
    adaptiveGovernorRef.current.recoveryTimer = 0;
    adaptiveGovernorRef.current.originalCombatPreset = null;
    activeMaxParticlesRef.current = MAX_PARTICLES;
    const dynamicDiff = meta.dynamicDifficulty ?? 3.0;
    const perfProfile = meta.performanceProfile || (meta.performanceMode ? 'performance' : 'balanced');
    const maxLivingEnemies = perfProfile === 'performance' ? 35 : perfProfile === 'balanced' ? 55 : 70;
    directorRef.current = new RunDirector(chosenLevelId, undefined, { dynamicDifficulty: dynamicDiff, maxLivingEnemies });
    engineRef.current.activeHazards = directorRef.current.hazards;
    engineRef.current.bubackaDira = null;
    engineRef.current.enemies.forEach((e) => directorRef.current?.recordEnemySpawn(e, 0));
    gameEngineRef.current = new GameEngine(engine);
    enemySpatialHashRef.current = gameEngineRef.current.spatialHash;
    adaptiveGovernorRef.current = {
      tier: 0,
      tier1Timer: 0,
      recoveryTimer: 0,
      originalCombatPreset: null,
    };
    activeMaxParticlesRef.current = MAX_PARTICLES;
    lastCombatTextsMsRef.current = 0;

    setRunStats({
      time: 0,
      gingerbread: 0,
      kills: 0,
      chestProgress: 0,
      coins: 0,
      souls: 0,
      chasniks: 0,
      hp: player.hp,
      maxHp: player.maxHp,
      ultCd: 0,
      dayPhase: DAY_PHASES[0],
      bossHpPct: null,
      bossTitle: '',
      warningBanner: '',
      chasnikIndicator: '',
      levelId: chosenLevelId,
      levelTitle: chosenLevel.name,
      levelWon: false,
      isTestMode: isTestMode,
    });

    setIsTestModeOpen(false);
    setGameState('playing');
  };

  // Reset all meta progression back to initial state (locks everything, resets all upgrades)
  const handleResetProgress = () => {
    const defaultMeta: MetaProgression = {
      krejcary: 0,
      regenLevel: 0,
      ovenLevel: 0,
      scarecrowLevel: 0,
      millLevel: 0,
      wallLevel: 0,
      bakeryLevel: 0,
      bellLevel: 0,
      boziMukaLevel: 0,
      totalSoulsSaved: 0,
      totalChasnikSaved: 0,
      season: 'autumn',
      trophiesClaimed: {},
      bestiaryKills: {},
      villageStoryRead: {},
      highestSurviveTime: 0,
      unlockedHunters: { krajanek: true, wanderer: true, shepherd: false, korenarka: false, watchman: false, sexton: false, granny: false },
      unlockedWeapons: { povidlove_buchty: true, osikovy_prut: true, hromnicka: true, bylinkova_fajfka: true },
      hunterKillCounts: {},
      weaponKillCounts: {},
      selectedLevel: 0,
      highestLevelUnlocked: 1,
      completedLevels: {},
      levelKillCounts: {},
      dynamicDifficulty: 3.0,
      performanceProfile: 'balanced',
      performanceMode: false,
      dynamicLightingEnabled: true,
    };
    saveMeta(defaultMeta);
    setSelectedLevelId(0);
    setMenuScreen('stage');
    sound.hit();
    setIsResetModalOpen(false);
    showUnlockNotice({
      icon: 'broom',
      title: 'Postup byl úspěšně vymazán',
      desc: 'Veškerý postup, odemykatelní lovci, úrovně, zbraně i upgrady vesnice byly vráceny na nulu a uzamčeny.',
    }, 5000);
  };

  // Ultimate ability trigger
  const triggerUltimate = () => {
    const p = engineRef.current.player;
    if (!p || p.ultCd > 0 || gameStateRef.current !== 'playing') return;

    p.ultCd = p.ultMaxCd * (p.cooldownMultiplier || 1);
    sound.slash();

    if (p.type === 'krajanek') {
      p.krajanekUpgradeCount = getGrandfatherInflatingPurchaseCount(grandfatherPurchaseIdsRef.current);
      p.krajanekRideTimer = KRAJANEK_RIDE_DURATION;
      p.krajanekRideTickTimer = 0;
      p.invulnerabilityTimer = Math.max(p.invulnerabilityTimer || 0, KRAJANEK_RIDE_DURATION);
      sound.heavyHit();
      pushDamageText(engineRef.current.texts, p.x, p.y - 70, 'JÍZDA NA ŽERNOVU! 🪨', '#FDE047', true, 'hunterDamage');
    } else if (p.type === 'tulak' || p.type === 'wanderer') {
      // Pověstná sukovice: zatočí kolem sebe sukovitou holí a zraní a odhodí hodně bubáky kolem,
      // a nepřátelé ve větší vzdálenosti kolem jsou po 4s vystrašení a rychle utíkají pryč (resistable with fear)
      sound.sukoviceWhirl();
      engineRef.current.sukovice = {
        x: p.x,
        y: p.y,
        t: 0,
        dur: 0.85,
        radius: 260,
        outerRadius: 600,
      };
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'POVĚSTNÁ SUKOVICE! 🪵', '#F59E0B', true, 'hunterDamage');

      const innerRadius = 260;
      const outerRadius = 600;

      const targets = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, outerRadius + 60, terrainSpatialResultsRef.current);
      for (let i = 0; i < targets.length; i++) {
        const e = terrainSpatialResultsRef.current[i];
        if (e.isDefeated) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= outerRadius + e.radius) {
          const nx = dist > 0.001 ? dx / dist : 1;
          const ny = dist > 0.001 ? dy / dist : 0;
          const fearResist = Math.min(1, Math.max(0, e.willpower || 0));
          const fearDuration = 4.0 * (1 - fearResist);

          if (dist <= innerRadius + e.radius) {
            // Blízký drtivý zásah sukovicí: silné zranění a masivní odhození bubáků kolem
            const dmg = 185 * p.damageMultiplier;
            e.takeDamage(dmg, 'physical', nx * 850, ny * 850);
            e.poise = 0;
            pushDamageText(engineRef.current.texts, e.x, e.y - 40, 'PRÁSK! 🪵', '#FBBF24', false, 'hunterDamage');

            // Vystrašení zblízka (pokud přežijí zásah)
            if (fearDuration > 0) {
              e.panicTimer = Math.max(e.panicTimer || 0, fearDuration);
              e.panicked = true;
            }
          } else {
            // Nepřátelé ve větší vzdálenosti: po 4s vystrašení a rychle utíkají pryč (resistable with fear)
            if (fearDuration > 0) {
              e.panicTimer = Math.max(e.panicTimer || 0, fearDuration);
              e.panicked = true;
              pushDamageText(engineRef.current.texts, e.x, e.y - 35, 'DĚS! 😱', '#A7F3D0', false, 'combatStates');
            } else {
              pushDamageText(engineRef.current.texts, e.x, e.y - 35, 'ODOLAL! 🛡️', '#E5E7EB', false, 'combatStates');
            }
            // Zranění a odhození i ve větší vzdálenosti
            const outerDmg = 55 * p.damageMultiplier;
            e.takeDamage(outerDmg, 'physical', nx * 320, ny * 320);
          }

          // Efektní třísky a prach u zasažených bubáků
          for (let pi = 0; pi < 5; pi++) {
            emitParticle(engineRef.current.particles, {
              x: e.x + (Math.random() - 0.5) * e.radius,
              y: e.y + (Math.random() - 0.5) * e.radius,
              vx: nx * 120 + (Math.random() - 0.5) * 60,
              vy: ny * 120 + (Math.random() - 0.5) * 60,
              life: 0.35 + Math.random() * 0.25,
              color: Math.random() < 0.5 ? '#8B5A2B' : '#D97706',
              size: 3 + Math.random() * 3,
            }, activeMaxParticlesRef.current);
          }
        }
      }
    } else if (p.type === 'pasacek' || p.type === 'shepherd') {
      // Dusot stáda: pastýřská píšťalka a běsnění beranů (příběhová scénka se zastaveným časem)
      sound.shepherdFlock();
      engineRef.current.cutscene = { type: 'shepherd', t: 0, dur: 4.2, applyAt: 2.2, applied: false };
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'PASTÝŘSKÁ PÍŠŤALKA! 🐑', COLORS.mustard, true, 'hunterDamage');
    } else if (p.type === 'korenarka') {
      // Očistné kadidlo z devatera bylin: klokotání kotlíku a hojivý dým (příběhová scénka se zastaveným časem)
      sound.herbalIncense();
      engineRef.current.cutscene = { type: 'korenarka', t: 0, dur: 4.4, applyAt: 2.3, applied: false };
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'OČISTNÉ KADIDLO! 🌿', COLORS.green, true, 'healing');
    } else if (p.type === 'kostelnik' || p.type === 'sexton') {
      // Farní požehnání: úder zvonu a sloup svatého světla očistí démony a nemrtvé
      sound.churchBell();
      engineRef.current.blessing = { x: p.x, y: p.y, t: 0, dur: 3.6 };
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'FARNÍ POŽEHNÁNÍ!', '#FDE047', true, 'hunterDamage');
      const targets = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, 650 + 60, terrainSpatialResultsRef.current);
      for (let i = 0; i < targets.length; i++) {
        const e = terrainSpatialResultsRef.current[i];
        if (e.isDefeated || Math.hypot(e.x - p.x, e.y - p.y) > 650 + e.radius) continue;
        const unholy = isUnholyEnemy(e) || e.isBoss || e.category === 'bosses';
        const holyMult = getHolyDamageMultiplier(e);
        const holyPush = Math.max(0.1, 1 - getEnemyHolyResistance(e));
        if (!unholy) {
          e.takeDamage(45 * p.damageMultiplier * holyMult, 'holy', (e.x - p.x) * 3 * holyPush, (e.y - p.y) * 3 * holyPush);
        } else if (e.isBoss || e.category === 'bosses') {
          e.takeDamage(e.maxHp * 0.25 * Math.min(1.5, holyMult), 'holy', 0, 0);
          pushDamageText(engineRef.current.texts, e.x, e.y - 50, 'SVATÁ ZKÁZA!', '#FDE047', true, 'hunterDamage');
        } else {
          e.takeDamage((e.hp + 1) * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
        }
      }
    } else if (p.type === 'babicka' || p.type === 'granny') {
      // Chléb se solí a vlídné slovo: čas se zastaví a přehraje se scénka, její účinek nastane v jejím vrcholu
      sound.timeStop();
      engineRef.current.cutscene = { type: 'granny', t: 0, dur: GRANNY_CUTSCENE.duration, applyAt: GRANNY_CUTSCENE.applyAt, applied: false };
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'ČAS SE ZASTAVIL…', '#FDE047', true, 'combatStates');
    } else {
      // Night watchman horn & dog pack
      sound.horn();
      pushDamageText(engineRef.current.texts, p.x, p.y - 60, 'TÚÚ-DÚÚ! POPLACH!', COLORS.mustard, true, 'hunterDamage');
      const targets = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, 900, terrainSpatialResultsRef.current);
      for (let i = 0; i < targets.length; i++) {
        const e = terrainSpatialResultsRef.current[i];
        if (e.isDefeated) continue;
        e.panicTimer = 5.0 * (1 - (e.willpower || 0) * 0.7);
        e.panicked = true;
        e.takeDamage(110 * p.damageMultiplier, 'physical', (e.x - p.x) * 4, (e.y - p.y) * 4);
      }
    }
  };
  const triggerUltimateRef = useRef(triggerUltimate);
  triggerUltimateRef.current = triggerUltimate;

  // Účinek Pasáčkova dusotu stáda
  const applyShepherdStampede = () => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return;
    sound.heavyHit();
    pushDamageText(eng.texts, p.x, p.y - 70, 'DUSOT STÁDA BERANŮ! 🐑', COLORS.mustard, true, 'hunterDamage');

    // Vytvoření běžícího stáda v herním světě
    const sheepList = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      sheepList.push({
        offsetX: -350 - Math.random() * 250,
        offsetY: (Math.random() - 0.5) * 550,
        speed: 550 + Math.random() * 280,
        scale: 0.8 + Math.random() * 0.45,
        isRam: Math.random() < 0.35,
        hasBell: Math.random() < 0.6,
        bobPhase: Math.random() * Math.PI * 2,
        colorVariant: Math.floor(Math.random() * 3),
      });
    }
    eng.shepherdStampede = {
      x: p.x,
      y: p.y,
      dirX: p.lastDx || 1,
      dirY: p.lastDy || 0,
      t: 0,
      dur: 3.6,
      sheep: sheepList,
    };

    // Smetení nepřátel berany: masivní fyzické poškození a odhození
    const sheepHitCount = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, 560 + 60, terrainSpatialResultsRef.current);
    for (let i = 0; i < sheepHitCount.length; i++) {
      const e = terrainSpatialResultsRef.current[i];
      if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 560) {
        e.takeDamage(140 * p.damageMultiplier, 'physical', (p.lastDx || 1) * 380, (Math.random() - 0.5) * 260);
        e.poise = 0;
        pushDamageText(eng.texts, e.x, e.y - 45, 'TRK! 💥', COLORS.mustard, false, 'hunterDamage');
      }
    }
  };

  // Účinek Očistného kadidla báby Kořenářky
  const applyKorenarkaIncense = () => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return;
    applyBearMaskOverheal(p, 55);
    p.tempShield = (p.tempShield || 0) + 30;
    p.invulnerabilityTimer = Math.max(p.invulnerabilityTimer, 1.8);
    sound.potion();
    sound.victory();
    pushDamageText(eng.texts, p.x, p.y - 70, '+55 Kuráž! DEVATERO BYLIN & OČISTNÉ KADIDLO 🌿', '#86EFAC', true, 'healing');

    // Vytvoření bylinného sanctuaria v herním světě
    eng.korenarkaSanctuary = {
      x: p.x,
      y: p.y,
      t: 0,
      dur: 4.8,
      pulseTimer: 0,
    };

    // Plošné zasažení přírodou, nasáknutí a zpomalení všech bubáků
    const incCount = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, 480 + 60, terrainSpatialResultsRef.current);
    for (let i = 0; i < incCount.length; i++) {
      const e = terrainSpatialResultsRef.current[i];
      if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 480) {
        e.takeDamage(120 * p.damageMultiplier, 'nature', (e.x - p.x) * 4.5, (e.y - p.y) * 4.5);
        e.soak();
        e.slowTimer = Math.max(e.slowTimer || 0, 4.5);
        pushDamageText(eng.texts, e.x, e.y - 45, 'OČIŠTĚNO! 🌿', '#4ADE80', false, 'hunterDamage');
      }
    }
  };

  // Účinek Babiččiny scény: laskavost uklidní a zažene hordu
  // Speciální schopnost Babičky a Barunky: bere se buď jako Food (Chléb se solí) nebo jako Holy (Vlídné slovo)
  // podle toho, proti čemu má daný bubák menší resist.
  const applyGrannyKindness = () => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return;
    sound.kindChime();
    pushDamageText(eng.texts, p.x, p.y - 70, 'CHLÉB SE SOLÍ A VLÍDNÉ SLOVO! ❤', '#FDE047', true, 'hunterDamage');
    const grannyCount = enemySpatialHashRef.current.queryCircleInto(p.x, p.y, 1100 + 60, terrainSpatialResultsRef.current);
    for (let i = 0; i < grannyCount.length; i++) {
      const e = terrainSpatialResultsRef.current[i];
      if (e.isDefeated || Math.hypot(e.x - p.x, e.y - p.y) > 1100) continue;
      const bossLike = e.isBoss || e.category === 'bosses';

      // Zjištění resistu na Food a Holy
      const foodResistRaw = typeof e.hunger === 'number' ? e.hunger : (e.foodResist || 0);
      const foodResist = Math.max(0, foodResistRaw - (p.foodResistReduction || 0));
      const holyResist = getEnemyHolyResistance(e);

      // Bere se to, proti čemu má bubák MENŠÍ resist
      const chosenType: 'food' | 'holy' = foodResist <= holyResist ? 'food' : 'holy';

      if (chosenType === 'food') {
        // FOOD: chléb se solí bubáka nasytí
        if (!bossLike && Math.random() < 0.75) {
          // Běžný bubák je nasycen a odchází (pomalý krok, mlsání Ňam, ňam)
          e.takeDamage(e.hp + 1, 'food', 0, 0);
        } else {
          // Boss nebo přeživší začne mlsat chléb a uklidní se (pokud nemá imunitu proti snacku)
          if (e.prefix === 'kamenny' || e.immuneToSnackStun) {
            pushDamageText(eng.texts, e.x, e.y - 45, 'ODRAŽENO! 🪨', '#A8A29E', true, 'combatStates');
          } else {
            const addedSnack = 8.0 * Math.max(0.1, 1 - foodResist);
            e.snackTimer = (e.snackTimer || 0) + addedSnack;
            e.calmTimer = bossLike ? 10 : 8;
            if (bossLike) {
              e.takeDamage(e.maxHp * 0.25 * Math.max(0.1, 1 - foodResist), 'food', 0, 0);
            }
            pushDamageText(eng.texts, e.x, e.y - 45, 'CHLÉB SE SOLÍ! 🍞', '#D97706', true, 'hunterDamage');
            sound.snack();
          }
        }
      } else {
        // HOLY: vlídné posvěcené slovo zasáhne zlé síly
        const holyMult = getHolyDamageMultiplier(e);
        const holyPush = Math.max(0.1, 1 - holyResist);
        if (!bossLike && Math.random() < 0.75) {
          e.takeDamage((e.hp + 1) * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
          pushDamageText(eng.texts, e.x, e.y - 45, 'SVATÉ SLOVO! ✨', '#FDE047', true, 'hunterDamage');
        } else {
          e.calmTimer = bossLike ? 10 : 8;
          if (bossLike) {
            e.takeDamage(e.maxHp * 0.25 * holyMult, 'holy', 0, 0);
            pushDamageText(eng.texts, e.x, e.y - 50, 'SVATÁ ZKÁZA! ✨', '#FDE047', true, 'hunterDamage');
          } else {
            e.takeDamage(45 * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
            pushDamageText(eng.texts, e.x, e.y - 45, 'POŽEHNÁNÍ ✨', '#FDE047', true, 'hunterDamage');
          }
        }
      }
    }
  };

  // The old XP/arena Level Up flow is intentionally removed.
  // Run upgrades are purchased from Dědeček's basket for gingerbread.

  // Skip slot machine spin
  const skipSlotSpin = useCallback(() => {
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }
    slotSpinningRef.current = false;
    setSlotStoppedCount(3);
    setSlotSpinning(false);
    sound.slotStop();
    sound.slotJackpot();
  }, []);
  skipSlotSpinRef.current = skipSlotSpin;

  const closeChestSequence = useCallback(() => {
    if (gameStateRef.current !== 'chest') return;
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }
    slotSpinningRef.current = false;
    setSlotSpinning(false);
    setSlotStoppedCount(0);
    chestRewards.forEach((r) => r.action());
    setChestRewards([]);
    sound.coin();
    if (pendingMilestonesRef.current.length > 0) {
      gameStateRef.current = 'milestone';
      setGameState('milestone');
    } else {
      const nextState = engineRef.current.levelVictoryTriggered && victoryTimeoutRef.current === null
        ? 'tally'
        : 'playing';
      gameStateRef.current = nextState;
      setGameState(nextState);
    }
    engineRef.current.lastTime = performance.now();
  }, [chestRewards]);
  closeChestSequenceRef.current = closeChestSequence;

  // Open Painted Chest sequence with authentic slot machine effect
  const openChestSequence = () => {
    if (gameStateRef.current !== 'playing') return;
    gameStateRef.current = 'chest';
    sound.chest();
    setGameState('chest');

    const p = engineRef.current.player;
    const possibleRewards: ChestRewardItem[] = [
      {
        name: '+100 Krejcarů do měšce',
        desc: 'Hromádka poctivých stříbrňáků',
        icon: 'krejcar',
        action: () => setRunStats((s) => ({ ...s, coins: s.coins + 100 })),
      },
      {
        name: 'Zabijačková jitrnice (+40 Kuráže)',
        desc: 'Poctivá špejlovaná jitrnice zvedne náladu a zažene strach (+40 kuráže)',
        icon: 'jitrnice',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) applyBearMaskOverheal(pl, 40);
        },
      },
      {
        name: 'Pomeranč z Orientu (+25 Max Kuráž)',
        desc: 'Posilující exotická dobrota pro stálou dobrou náladu a odvahu',
        icon: 'pomeranc_z_orientu',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.maxHp += 25;
            const frostMult = pl._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(pl, enemySpatialHashRef.current.queryCircle(pl.x, pl.y, FROSTLING_AURA_RADIUS));
            pl.hp = Math.min(
              pl.maxHp,
              pl.hp + 25 * frostMult
            );
          }
        },
      },
      {
        name: 'Medvědí mast (+30 Max Kuráž)',
        desc: 'Hojivá mast z divočiny pro nezlomnou sílu a odolnost proti všem strašidlům a běsům',
        icon: 'medvedi_mast',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.maxHp += 30;
            const frostMult = pl._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(pl, enemySpatialHashRef.current.queryCircle(pl.x, pl.y, FROSTLING_AURA_RADIUS));
            pl.hp = Math.min(
              pl.maxHp,
              pl.hp + 30 * frostMult
            );
            pl.kurazCount = (pl.kurazCount || 0) + 1;
          }
        },
      },
      {
        name: 'Opravdová káva (+15 % Nabíjení)',
        desc: 'Čerstvě pražená horká černá káva zrychlí nabíjení všech zbraní (+15 %)',
        icon: 'opravdova_kava',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.kavaCount = (pl.kavaCount || 0) + 1;
            pl.cooldownBonus = (pl.cooldownBonus || 0) + 0.15;
          }
        },
      },
      {
        name: 'Krvavé jelito (+15 % Zranění)',
        desc: 'Zabijačkové jelito s kroupami trvale zvýší sílu všech úderů a zbraní',
        icon: 'krvave_jelito',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.jelitoCount = (pl.jelitoCount || 0) + 1;
            pl.damageMultiplier = (pl.damageMultiplier || 1) * 1.15;
          }
        },
      },
      {
        name: 'Toulavé boty (+25 Rychlost)',
        desc: 'Pohotovější krok při obcházení temných koutů',
        icon: 'toulave_boty',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) pl.speed += 25;
        },
      },
      {
        name: 'Zlatý dukát (+200 Krejcarů)',
        desc: 'Velkolepý poklad z kovářské truhly',
        icon: 'zlaty_dukat',
        action: () => setRunStats((s) => ({ ...s, coins: s.coins + 200 })),
      },
      {
        name: 'Škvarková placka (Svačina na cestu)',
        desc: 'Poctivá křupavá placka se sádlem a škvarky pro okamžité doplnění kuráže (+50)',
        icon: 'skvarkova_placka',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) applyBearMaskOverheal(pl, 50);
        },
      },
    ];

    // If player has equipped weapons that can be upgraded, include upgrades in slot machine!
    if (p && p.weapons) {
      p.weapons.forEach((pw: any) => {
        const canonicalId = toCanonicalWeaponId(pw.id);
        const wDef = WEAPONS[canonicalId];
        if (wDef && pw.level < 8) {
          const nextRank = pw.level + 1;
          const isMilestoneRank = nextRank === 3 || nextRank === 5 || nextRank === 8;
          const nextRankDef = getWeaponRankDef(canonicalId, nextRank);
          const candidateUpgrade = !isMilestoneRank ? rollRandomWeaponUpgrade(canonicalId, pw) : undefined;
          const upgradeDesc = isMilestoneRank
            ? 'Milník: výběr ze dvou specializací'
            : candidateUpgrade
              ? `${candidateUpgrade.name}: ${candidateUpgrade.ui_text}`
              : (nextRankDef?.passiveBonusDescription || `Vylepšení zbraně na úroveň ${nextRank}`);

          possibleRewards.push({
            name: `${wDef.name} (Úroveň ${nextRank})`,
            desc: upgradeDesc,
            icon: wDef.icon,
            action: () => {
              pw.id = canonicalId;
              if (pw.level >= 8) return;
              pw.level += 1;
              if (candidateUpgrade && !(pw.level === 3 || pw.level === 5 || pw.level === 8)) {
                if (!pw.normalUpgrades) pw.normalUpgrades = [];
                pw.normalUpgrades.push(candidateUpgrade.id);
              }
              pw._cachedStats = getRankedWeaponStats(canonicalId, pw.level, pw);
              if (pw.level === 3 || pw.level === 5 || pw.level === 8) {
                const choices = getMilestoneChoices(canonicalId, pw.level);
                if (choices) {
                  const nextChoices = [...pendingMilestonesRef.current, { weaponId: canonicalId, rank: pw.level, choices }];
                  pendingMilestonesRef.current = nextChoices;
                  setPendingMilestones(nextChoices);
                }
              }
            },
          });
        }
      });
    }

    possibleRewards.sort(() => 0.5 - Math.random());
    const selected = possibleRewards.slice(0, 3);
    while (selected.length < 3) {
      selected.push({
        name: '+75 Krejcarů do měšce',
        desc: 'Drobné z truhly',
        icon: 'krejcar',
        action: () => setRunStats((s) => ({ ...s, coins: s.coins + 75 })),
      });
    }

    // Clear previous timers & intervals first
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }

    setChestRewards(selected);
    setSlotStoppedCount(0);
    slotSpinningRef.current = true;
    setSlotSpinning(true);

    // Audio ticking sound while reels spin
    slotSoundIntervalRef.current = setInterval(() => {
      sound.slotTick();
    }, 110);

    // Sequential deceleration and stops:
    // Reel 1 locks at 950ms
    const t1 = setTimeout(() => {
      setSlotStoppedCount(1);
      sound.slotStop();
    }, 950);

    // Reel 2 locks at 1700ms
    const t2 = setTimeout(() => {
      setSlotStoppedCount(2);
      sound.slotStop();
    }, 1700);

    // Reel 3 locks at 2450ms -> finishes spin
    const t3 = setTimeout(() => {
      slotSpinningRef.current = false;
      setSlotStoppedCount(3);
      setSlotSpinning(false);
      if (slotSoundIntervalRef.current) {
        clearInterval(slotSoundIntervalRef.current);
        slotSoundIntervalRef.current = null;
      }
      sound.slotJackpot();
    }, 2450);

    slotTimersRef.current = [t1, t2, t3];
  };

  // Rescue Chasník Kuba event
  const triggerRescueChasnik = (x: number, y: number) => {
    sound.cheer();
    engineRef.current.coins += 50;
    engineRef.current.chasniks += 1;
    pushDamageText(engineRef.current.texts, x, y - 50, 'CHASNÍK KUBA ZACHRÁNĚN! +50 kr.', COLORS.mustard, true);
    setRunStats((s) => ({ ...s, coins: engineRef.current.coins, chasniks: engineRef.current.chasniks }));

    const p = engineRef.current.player;
    if (p) {
      applyBearMaskOverheal(p, 35);
      pushDamageText(engineRef.current.texts, p.x, p.y - 30, '+35 Kuráž (Od souseda)', COLORS.green, true);
    }

    // Companion joins player
    engineRef.current.companion = {
      x,
      y,
      life: 30,
      throwCd: 0.5,
      animTime: 0,
    };
  };

  // Village upgrade handler
  const handleVillageUpgrade = (key: keyof MetaProgression, cost: number) => {
    if (meta.krejcary < cost) return;
    const curLevel = (meta[key] as number) || 0;
    saveMeta({
      ...meta,
      krejcary: meta.krejcary - cost,
      [key]: curLevel + 1,
    });
  };

  // Village refund handler (100% respec)
  const handleVillageRefund = () => {
    const totalRefund = calculateTotalVillageInvested(meta);
    if (totalRefund <= 0) return;
    saveMeta({
      ...meta,
      krejcary: meta.krejcary + totalRefund,
      scarecrowLevel: 0,
      millLevel: 0,
      forestLevel: 0,
      wallLevel: 0,
      forgeLevel: 0,
      ovenLevel: 0,
      undeadLevel: 0,
      bellLevel: 0,
      regenLevel: 0,
      tavernShieldLevel: 0,
      waterLevel: 0,
      churchLevel: 0,
      boziMukaLevel: 0,
    });
  };

  // Auto-launch benchmark / performance test run if URL specifies ?benchmark=1 or ?perf_test=1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('benchmark') || urlParams.has('perf_test')) {
      const profile = (urlParams.get('profile') as any) || 'balanced';
      metaRef.current.performanceProfile = profile;
      metaRef.current.showPerfOverlay = true;
      const hero = (urlParams.get('hero') as CharacterType) || 'wanderer';
      const levelId = Number(urlParams.get('level') || 0) as GameLevelId;
      startGame(
        hero,
        levelId,
        [
          { id: 'cane', level: 3 },
          { id: 'halberd', level: 3 },
          { id: 'bees', level: 3 },
        ],
        true
      );
    }
  }, []);

  // Main canvas game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const urlParams = new URLSearchParams(window.location.search);
    const showPerformanceOverlay = urlParams.has('perf') || urlParams.has('benchmark');
    const isBenchmarkMode = urlParams.has('benchmark') || urlParams.has('perf_test');
    const frameProfiler = new FrameProfiler();

    if (typeof window !== 'undefined') {
      (window as any).__BUBAKOV_PERF__ = {
        profiler: frameProfiler,
        getMetricsSummary: () => frameProfiler.getMetricsSummary(),
        getEngineState: () => ({
          enemies: engineRef.current.enemies.length,
          projectiles: engineRef.current.projectiles.length,
          particles: engineRef.current.particles.length,
          drops: engineRef.current.drops.length,
          texts: engineRef.current.texts.length,
          gameState: gameStateRef.current,
        }),
      };
    }

    const resize = () => {
      const profile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
      const isPerf = profile === 'performance';
      const scale = isPerf ? 0.75 : 1.0;
      const maxPhysicalWidth = 1920;
      const maxPhysicalHeight = 1080;
      const rawW = Math.max(1, window.innerWidth * scale);
      const rawH = Math.max(1, window.innerHeight * scale);
      const capRatio = Math.min(1, maxPhysicalWidth / rawW, maxPhysicalHeight / rawH);
      const nextWidth = Math.max(1, Math.round(rawW * capRatio));
      const nextHeight = Math.max(1, Math.round(rawH * capRatio));

      if (canvas.width !== nextWidth) {
        canvas.width = nextWidth;
      }
      if (canvas.height !== nextHeight) {
        canvas.height = nextHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = (now: number) => {
      try {
        frameProfiler.start(now || performance.now());
        // Prevent a background-tab stall from creating a large simulation burst.
        const dt = Math.min(0.05, Math.max(0, (now - engineRef.current.lastTime) / 1000));
        engineRef.current.lastTime = now;
    // HUD is React-owned; gameplay entities stay Canvas/engine-owned.
    // Boss HP is sampled here instead of calling setState from takeDamage().
    const engine = engineRef.current;
    const currentGameState = gameStateRef.current;
    const currentMenuScreen = menuScreenRef.current;
    const currentSelectedLevelId = selectedLevelIdRef.current;
    engineRef.current.uiTime += dt;

    // Poll HTML5 Gamepad API (Array.from(navigator.getGamepads()).find(gp => gp && gp.connected)) + unified keyboard state
    const gpInput = gamepadManager.poll(engine.keys, currentGameState, touchMoveRef.current);
    if (
      gpInput.gamepadConnected !== gamepadUiStateRef.current.connected ||
      gpInput.activeDevice !== gamepadUiStateRef.current.activeDevice ||
      gpInput.gamepadName !== gamepadUiStateRef.current.name
    ) {
      setGamepadUiState({
        connected: gpInput.gamepadConnected,
        activeDevice: gpInput.activeDevice,
        name: gpInput.gamepadName,
      });
    }

    // Handle Gamepad edge-triggered (justPressed) actions per gameState
    if (gpInput.activeDevice === 'gamepad') {
      if (currentGameState === 'playing') {
        if (gpInput.pauseJustPressed) {
          gamepadManager.consumeActionsAndLockBleed(engine.keys);
          togglePauseRef.current();
        } else if (gpInput.abilityJustPressed) {
          const cs = engine.cutscene;
          if (cs) {
            if (!cs.applied) cs.t = Math.max(cs.t, cs.applyAt);
            else cs.t = cs.dur;
          } else {
            triggerUltimateRef.current();
          }
        } else if (gpInput.interactJustPressed) {
          triggerArenaInteractRef.current();
        } else if (gpInput.confirmJustPressed && engine.cutscene) {
          const cs = engine.cutscene;
          if (!cs.applied) cs.t = Math.max(cs.t, cs.applyAt);
          else cs.t = cs.dur;
        }
      } else if (currentGameState === 'paused') {
        if (gpInput.pauseJustPressed || gpInput.cancelJustPressed || gpInput.confirmJustPressed) {
          gamepadManager.consumeActionsAndLockBleed(engine.keys);
          togglePauseRef.current();
        }
      } else if (currentGameState === 'chest') {
        if (gpInput.confirmJustPressed) {
          gamepadManager.consumeActionsAndLockBleed(engine.keys);
          if (slotSpinningRef.current) {
            skipSlotSpinRef.current();
          } else {
            closeChestSequenceRef.current();
          }
        }
      }
    }

    // Autonomous stress bot for automated headless benchmark
    if (isBenchmarkMode && currentGameState === 'playing' && engine.player) {
      // Advance to Midnight to activate full dark kvaš lighting, vector shadow volumes & ambient tint
      if (engine.gameTime < 240) {
        engine.gameTime = 250;
      }

      // Populate realistic dense horde up to profile cap
      const performanceProfile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
      const targetEnemies = performanceProfile === 'performance' ? 35 : performanceProfile === 'balanced' ? 55 : 70;
      while (engine.enemies.length < targetEnemies) {
        const i = engine.enemies.length;
        const ang = (i / targetEnemies) * Math.PI * 2;
        const dist = 160 + (i % 6) * 55;
        const mobId = i % 4 === 0 ? 'hejkal' : i % 3 === 0 ? 'hastrman' : i % 2 === 0 ? 'rarach' : 'cerny_pes';
        const mob = createEnemyInstance(mobId, engine.player.x + Math.cos(ang) * dist, engine.player.y + Math.sin(ang) * dist, 1.0);
        engine.enemies.push(mob);
        directorRef.current?.recordEnemySpawn(mob, engine.gameTime);
      }

      const t = engine.uiTime;
      engine.keys['KeyW'] = Math.sin(t * 1.5) > 0.2;
      engine.keys['KeyS'] = Math.sin(t * 1.5) < -0.2;
      engine.keys['KeyA'] = Math.cos(t * 1.5) > 0.2;
      engine.keys['KeyD'] = Math.cos(t * 1.5) < -0.2;

      // Ensure bot survives for full benchmark duration
      if (engine.player.hp < engine.player.maxHp * 0.6) {
        engine.player.hp = engine.player.maxHp;
      }
    }

      // Animate character portraits in hunter selection screen
      if (currentGameState === 'menu' && currentMenuScreen === 'hunter') {
        const t = engineRef.current.uiTime;
        const curMeta = metaRef.current;
        const krProg = getHunterProgress('krajanek', curMeta);
        const wProg = getHunterProgress('wanderer', curMeta);
        const sProg = getHunterProgress('shepherd', curMeta);
        const kProg = getHunterProgress('korenarka', curMeta);
        const mProg = getHunterProgress('watchman', curMeta);
        const xProg = getHunterProgress('sexton', curMeta);
        const gProg = getHunterProgress('granny', curMeta);

        renderHunterPortrait(krajanekRef.current, Lada.drawKrajanek.bind(Lada), krProg.tier, t);
        renderHunterPortrait(wandererRef.current, Lada.drawWanderer.bind(Lada), wProg.tier, t);
        renderHunterPortrait(shepherdRef.current, Lada.drawShepherd.bind(Lada), sProg.tier, t);
        renderHunterPortrait(korenarkaRef.current, Lada.drawKorenarka.bind(Lada), kProg.tier, t);
        renderHunterPortrait(watchmanRef.current, Lada.drawWatchman.bind(Lada), mProg.tier, t);
        renderHunterPortrait(sextonRef.current, Lada.drawSexton.bind(Lada), xProg.tier, t);
        renderHunterPortrait(grannyRef.current, Lada.drawGranny.bind(Lada), gProg.tier, t);
      }

      // In-game simulation (při scénce Babičky a Barunky je čas zastaven)
      if ((currentGameState === 'playing' || currentGameState === 'fleeing') && engineRef.current.player && engineRef.current.cutscene && currentGameState === 'playing') {
        const engine = engineRef.current;
        // Příběhová scénka se zastaveným časem (Babička, Pasáček, Kořenářka)
          if (engine.cutscene && currentGameState === 'playing') {
            const cs = engine.cutscene;
            cs.t += dt;
            if (!cs.applied && cs.t >= cs.applyAt) {
              cs.applied = true;
              if (cs.type === 'shepherd') {
                applyShepherdStampede();
              } else if (cs.type === 'korenarka') {
                applyKorenarkaIncense();
              } else {
                applyGrannyKindness();
              }
            }
            if (cs.t >= cs.dur) engine.cutscene = null;
          }
      } else if (currentGameState === 'playing' || currentGameState === 'fleeing') {
        const engine = engineRef.current;
        const player = engine.player;

        if (player) {
          // Time & Day/Night phase tracking
          if (currentGameState === 'playing') {
            engine.gameTime += dt;
            if (engine.flourStormTimer > 0) engine.flourStormTimer -= dt;
            if (engine.timeStopTimer > 0) engine.timeStopTimer = Math.max(0, engine.timeStopTimer - dt);
            if (engine.ponocnyFrostTimer > 0) engine.ponocnyFrostTimer = Math.max(0, engine.ponocnyFrostTimer - dt);
            if (engine.masopustShockwaveTimer > 0) engine.masopustShockwaveTimer = Math.max(0, engine.masopustShockwaveTimer - dt);
            if (engine.cameraTremorTimer > 0) engine.cameraTremorTimer = Math.max(0, engine.cameraTremorTimer - dt);
            if (player.intangibleTimer > 0) player.intangibleTimer = Math.max(0, player.intangibleTimer - dt);
            if (player.guaranteedCritTimer > 0) player.guaranteedCritTimer = Math.max(0, player.guaranteedCritTimer - dt);
            if (engine.activeRareOverlay) {
              engine.activeRareOverlay.timer -= dt;
              if (engine.activeRareOverlay.timer <= 0) engine.activeRareOverlay = null;
            }
            if (engine.slivoviceVapor) {
              engine.slivoviceVapor.life -= dt;
              if (engine.slivoviceVapor.life <= 0) engine.slivoviceVapor = null;
            }
            if (engine.sootFootprints && engine.sootFootprints.length > 0) {
              for (let i = 0; i < engine.sootFootprints.length; i++) {
                engine.sootFootprints[i].life -= dt;
              }
              compactInPlace(engine.sootFootprints, (sf: any) => sf.life > 0);
            }

            // Storybook Illumination: update Petrolejka & dynamic light sources
            const dayPhase = getCurrentDayPhase(engine.gameTime, engine.activeLevelId);
            engine.currentPhase = dayPhase;
            const petrolejkaRadius = getPetrolejkaRadius(player.hp, player.maxHp, dayPhase.id, engine.gameTime);
            let pLight = engine.petrolejkaLight;
            if (petrolejkaRadius > 0) {
              if (!pLight) {
                pLight = {
                  id: 'player_petrolejka',
                  x: player.x,
                  y: player.y,
                  radius: petrolejkaRadius,
                  color: '#F59E0B',
                  type: 'petrolejka',
                };
                engine.petrolejkaLight = pLight;
                engine.lightSources.push(pLight);
              } else {
                pLight.x = player.x;
                pLight.y = player.y;
                pLight.radius = petrolejkaRadius;
              }
            } else if (pLight) {
              pLight.radius = 0;
            }

            // Hromnička blessed candle light
            const hromWp = (player as any)._hromnickaWeapon;
            let hLight = engine.hromnickaLight;
            if (hromWp && player.hp > 0) {
              const hReach = 110 + (hromWp?.level || 1) * 12;
              if (!hLight) {
                hLight = {
                  id: 'player_hromnicka',
                  x: player.x,
                  y: player.y,
                  radius: hReach,
                  color: '#FEF9C3',
                  type: 'holy',
                  intensity: 0.9,
                };
                engine.hromnickaLight = hLight;
                engine.lightSources.push(hLight);
              } else {
                hLight.x = player.x;
                hLight.y = player.y;
                hLight.radius = hReach;
              }
            } else if (hLight) {
              hLight.radius = 0;
            }

            engine.lightSources = updateLightSources(engine.lightSources, dt);

            if (engine.grandfather.active) {
              let gHearth = engine.grandfatherLight;
              if (!gHearth) {
                gHearth = {
                  id: 'grandfather_hearth',
                  x: engine.grandfather.x,
                  y: engine.grandfather.y,
                  radius: 240,
                  color: '#EA580C',
                  type: 'hearth',
                };
                engine.grandfatherLight = gHearth;
                engine.lightSources.push(gHearth);
              } else {
                gHearth.x = engine.grandfather.x;
                gHearth.y = engine.grandfather.y;
              }
            } else if (engine.grandfatherLight) {
              const gHearthIdx = engine.lightSources.indexOf(engine.grandfatherLight);
              if (gHearthIdx !== -1) {
                engine.lightSources.splice(gHearthIdx, 1);
              }
              engine.grandfatherLight = null;
            }

            // Dědeček is a roaming run encounter, not a village NPC.
            if (engine.grandfather.cooldown > 0) engine.grandfather.cooldown = Math.max(0, engine.grandfather.cooldown - dt);
            const luck = player.luck ?? 100;
            const affordableBase = GRANDFATHER_ITEMS.some((item) => item.baseCost <= engine.gingerbread);
            if (
              !engine.grandfather.active &&
              engine.grandfather.cooldown <= 0 &&
              affordableBase &&
              engine.gameTime >= 25
            ) {
              const angle = Math.random() * Math.PI * 2;
              // Dědeček se zjevuje v příjemné blízkosti (220–280 px), nespawnuje se příliš daleko ani za hranicí mapy či ve zdi
              const distance = 220 + Math.random() * 60;
              const safeGrandfatherPos = sanitizeArenaSpawnPoint(
                player.x + Math.cos(angle) * distance,
                player.y + Math.sin(angle) * distance,
                26,
                engine.activeLevelId ?? 0,
                engine.decor,
                60
              );
              engine.grandfather.active = true;
              engine.grandfather.x = safeGrandfatherPos.x;
              engine.grandfather.y = safeGrandfatherPos.y;
              engine.grandfather.spawnedAt = engine.gameTime;
              engine.grandfather.waitStartedAt = engine.gameTime;
              engine.grandfather.purchasesThisEncounter = 0;
              engine.grandfather.rerollsThisEncounter = 0;
              engine.grandfather.animTime = 0;
              engine.grandfather.isMoving = false;
              engine.grandfather.vx = 0;
              engine.grandfather.vy = 0;
              engine.grandfather.facingDir = player.x >= engine.grandfather.x ? 1 : -1;
              engine.grandfather.offers = replaceCourageOffersIfNeeded(
                chooseGrandfatherOffers(
                  engine.gingerbread,
                  luck,
                  grandfatherPurchaseIdsRef.current,
                  player?.weapons || [],
                  4,
                  { playerHp: player?.hp, playerMaxHp: player?.maxHp }
                ),
                engine.gingerbread,
                luck,
                grandfatherPurchaseIdsRef.current,
                player?.weapons || [],
                { playerHp: player?.hp, playerMaxHp: player?.maxHp },
                4
              );
              sound.grandfatherCall();
              pushDamageText(engine.texts, player.x, player.y - 80, '„Pssst! Perníčky!“', '#F59E0B', true);
            }

            if (engine.grandfather.active) {
              const dx = player.x - engine.grandfather.x;
              const dy = player.y - engine.grandfather.y;
              const grandfatherDistance = Math.hypot(dx, dy);
              engine.grandfather.animTime = (engine.grandfather.animTime || 0) + dt;

              // Pokud se hráč vzdálí extrémně daleko (> 1400 px), dědeček se bezpečně přemístí blíž za ním
              if (grandfatherDistance > 1400) {
                const ang = Math.random() * Math.PI * 2;
                const safeReloc = sanitizeArenaSpawnPoint(
                  player.x + Math.cos(ang) * 280,
                  player.y + Math.sin(ang) * 280,
                  26,
                  engine.activeLevelId ?? 0,
                  engine.decor,
                  60
                );
                engine.grandfather.x = safeReloc.x;
                engine.grandfather.y = safeReloc.y;
                engine.grandfather.vx = 0;
                engine.grandfather.vy = 0;
                engine.grandfather.isMoving = false;
              } else if (grandfatherDistance > 170) {
                const invDist = grandfatherDistance > 0.001 ? 1 / grandfatherDistance : 0;
                const dirX = dx * invDist;
                const dirY = dy * invDist;
                const moveSpeed = Math.min(grandfatherDistance - 150, grandfatherDistance > 550 ? 150 : 75);
                engine.grandfather.vx = dirX * moveSpeed;
                engine.grandfather.vy = dirY * moveSpeed;
                engine.grandfather.x += engine.grandfather.vx * dt;
                engine.grandfather.y += engine.grandfather.vy * dt;
                if (Math.abs(dx) > 3) {
                  engine.grandfather.facingDir = dx >= 0 ? 1 : -1;
                }
                engine.grandfather.isMoving = true;
              } else {
                engine.grandfather.vx = 0;
                engine.grandfather.vy = 0;
                engine.grandfather.isMoving = false;
                if (Math.abs(dx) > 8) {
                  engine.grandfather.facingDir = dx >= 0 ? 1 : -1;
                }
              }
            }

            const newTime = engine.gameTime;
            const curLvl = GAME_LEVELS[engine.activeLevelId !== undefined ? engine.activeLevelId : currentSelectedLevelId] || GAME_LEVELS[0];
            const currentPhase = engine.currentPhase || getCurrentDayPhase(newTime, curLvl.id);

            // Check dawn victory
            if (newTime >= DAWN_TIME_SECONDS && !engine.dawnVictoryTriggered) {
              engine.dawnVictoryTriggered = true;
              sound.rooster();
              sound.victory();
              const isDayLevel = (engine.activeLevelId ?? 0) === 0;
              const announcement = isDayLevel ? 'ZVONÍ KLEKÁNÍ! PŘEŽILI JSTE DEN!' : 'KUROPĚNÍ! KOHOUT ZAKOKRHAL!';
              pushDamageText(engine.texts, player.x, player.y - 70, announcement, COLORS.mustard, true, 'bossAnnouncements');
              // All monsters panic and flee
              engine.enemies.forEach((e) => {
                e.panicked = true;
                e.isDefeated = true;
              });
              triggerLevelVictory(engine.activeLevelId ?? 0, 'dawn');
            }

            if (directorRef.current) {
              const performanceProfile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
              let targetMaxLiving = performanceProfile === 'performance' ? 35 : performanceProfile === 'balanced' ? 55 : 70;
              if (adaptiveGovernorRef.current.tier >= 3) {
                targetMaxLiving = Math.min(targetMaxLiving, 45);
              }
              directorRef.current.maxLivingEnemies = targetMaxLiving;
              const directorAdapter = {
                state: engine,
                livingEnemies: livingEnemiesRef.current,
                activeLevelDef: curLvl,
                currentPhase: currentPhase,
                callbacks: {
                  onSound: (soundName: string) => {
                    if (soundName === 'howl') sound.horn?.();
                    else if (soundName === 'bell') sound.bell?.();
                  },
                  onDamageText: (opts: any) => {
                    pushDamageText(engineRef.current.texts, opts.x, opts.y, opts.text, opts.color || '#F59E0B', true, 'bossAnnouncements');
                  },
                },
                spawnScatterDrop: (type: any, opts: any = {}) => {
                  const angle = opts.angle ?? Math.random() * Math.PI * 2;
                  const burstSpeed = opts.speed ?? (55 + Math.random() * 85);
                  const radius = opts.radius ?? (type === 'chest' ? 25 : opts.size === 'giant' ? 19 : opts.size === 'large' ? 14 : 10);
                  const safeDropPos = sanitizeArenaSpawnPoint(
                    opts.x ?? player.x,
                    opts.y ?? player.y,
                    radius,
                    engine.activeLevelId ?? 0,
                    engine.decor,
                    48
                  );
                  spawnDropWithLimit(engine.drops, {
                    type,
                    value: opts.value,
                    size: opts.size,
                    x: safeDropPos.x,
                    y: safeDropPos.y,
                    vx: opts.vx ?? Math.cos(angle) * burstSpeed,
                    vy: opts.vy ?? Math.sin(angle) * burstSpeed,
                    radius,
                    time: Math.random() * 6.28,
                  }, engine.pendingDropBank);
                  if (opts.text) {
                    pushDamageText(engine.texts, safeDropPos.x, safeDropPos.y - 45, opts.text, opts.textColor || COLORS.mustard, true, 'bossAnnouncements');
                  }
                },
                spawnMonster: (
                  mobId: string,
                  x: number,
                  y: number,
                  multiplier = 1,
                  isBoss = false,
                  isMiniboss = false,
                  customBossTitle?: string,
                  prefix?: EnemyPrefixType
                ) => {
                  const safeSpawn = sanitizeArenaSpawnPoint(
                    x,
                    y,
                    isBoss || isMiniboss ? 32 : 22,
                    engine.activeLevelId ?? 0,
                    engine.decor,
                    48
                  );
                  x = safeSpawn.x;
                  y = safeSpawn.y;
                  if (mobId === 'vrana' && isMiniboss) {
                    (engine as any).flockTreasureDropped = false;
                    const crowCount = 9;
                    let leaderCrow: any = null;
                    for (let i = 0; i < crowCount; i++) {
                      const flockAngle = (i / crowCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
                      const dist = i === 0 ? 0 : 35 + (i % 3) * 15;
                      const crowPos = sanitizeArenaSpawnPoint(
                        x + Math.cos(flockAngle) * dist,
                        y + Math.sin(flockAngle) * dist,
                        18,
                        engine.activeLevelId ?? 0,
                        engine.decor,
                        36
                      );
                      const cx = crowPos.x;
                      const cy = crowPos.y;
                      const crowTitle = i === 0 ? (customBossTitle || '🐦‍⬛ Hejno mrazivých vran') : undefined;
                      const crowEnemy = createEnemyInstance(mobId, cx, cy, multiplier, isBoss, true, crowTitle, prefix);
                      (crowEnemy as any).isMinibossFlockMember = true;
                      (crowEnemy as any).flockIndex = i;
                      (crowEnemy as any).flockTotal = crowCount;
                      engine.enemies.push(crowEnemy);
                      directorRef.current?.recordEnemySpawn(crowEnemy, newTime);
                      if (i === 0) leaderCrow = crowEnemy;
                    }
                    return leaderCrow;
                  }
                  const newMob = createEnemyInstance(mobId, x, y, multiplier, isBoss, isMiniboss, customBossTitle, prefix);
                  engine.enemies.push(newMob);
                  directorRef.current?.recordEnemySpawn(newMob, newTime);
                  return newMob;
                },
              };
              directorRef.current.step(dt, directorAdapter);
              engine.activeHazards = directorRef.current.hazards;
              engine.bubackaDira = directorRef.current.bubackaDira;
              if (directorRef.current.telegraphMessage && runStatsRef.current.warningBanner !== directorRef.current.telegraphMessage) {
                runStatsRef.current.warningBanner = directorRef.current.telegraphMessage;
                setRunStats((s) => ({ ...s, warningBanner: directorRef.current!.telegraphMessage || '' }));
              }
            }

            // 1. Mini-boss encounter (polední přízrak podle plánu úrovně)
            if (!engine.miniBossSpawned && newTime >= curLvl.miniBoss.time) {
              engine.miniBossSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const spawnPos = RunDirector.getOffscreenPosition(player, ang, engine, 180);
              if (curLvl.miniBoss.id === 'vrana') {
                (engine as any).flockTreasureDropped = false;
                const crowCount = 9;
                for (let i = 0; i < crowCount; i++) {
                  const flockAngle = (i / crowCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
                  const dist = i === 0 ? 0 : 35 + (i % 3) * 15;
                  const crowPos = sanitizeArenaSpawnPoint(
                    spawnPos.x + Math.cos(flockAngle) * dist,
                    spawnPos.y + Math.sin(flockAngle) * dist,
                    18,
                    engine.activeLevelId ?? 0,
                    engine.decor,
                    36
                  );
                  const crowTitle = i === 0 ? curLvl.miniBoss.name : undefined;
                  const crowEnemy = createEnemyInstance(
                    curLvl.miniBoss.id,
                    crowPos.x,
                    crowPos.y,
                    curLvl.miniBoss.multiplier,
                    false,
                    true,
                    crowTitle
                  );
                  (crowEnemy as any).isMinibossFlockMember = true;
                  (crowEnemy as any).flockIndex = i;
                  (crowEnemy as any).flockTotal = crowCount;
                  engine.enemies.push(crowEnemy);
                  directorRef.current?.recordEnemySpawn(crowEnemy, newTime);
                }
              } else {
                const safeMiniPos = sanitizeArenaSpawnPoint(
                  spawnPos.x,
                  spawnPos.y,
                  24,
                  engine.activeLevelId ?? 0,
                  engine.decor,
                  40
                );
                const miniBossEnemy = createEnemyInstance(
                  curLvl.miniBoss.id,
                  safeMiniPos.x,
                  safeMiniPos.y,
                  curLvl.miniBoss.multiplier,
                  false,
                  true,
                  curLvl.miniBoss.name
                );
                engine.enemies.push(miniBossEnemy);
                directorRef.current?.recordEnemySpawn(miniBossEnemy, newTime);
              }
              pushDamageText(engine.texts, player.x, player.y - 50, `👑 ${curLvl.miniBoss.name}`, COLORS.mustard, true);
              setRunStats((s) => ({
                ...s,
                warningBanner: curLvl.miniBoss.warning,
                bossTitle: `👑 MINIBOSS: ${curLvl.miniBoss.name}`,
                bossHpPct: 100,
              }));
              sound.boss();
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
            }

            // 2. Mid-boss encounter (odpolední protivník po mini-bossovi)
            if (!engine.midBossSpawned && (engine.miniBossSpawned || newTime >= curLvl.midBoss.time + 10) && newTime >= curLvl.midBoss.time) {
              engine.midBossSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const spawnPos = RunDirector.getOffscreenPosition(player, ang, engine, 180);
              const safeMidPos = sanitizeArenaSpawnPoint(
                spawnPos.x,
                spawnPos.y,
                26,
                engine.activeLevelId ?? 0,
                engine.decor,
                40
              );
              const midBossEnemy = createEnemyInstance(
                curLvl.midBoss.id,
                safeMidPos.x,
                safeMidPos.y,
                curLvl.midBoss.multiplier,
                false,
                true,
                curLvl.midBoss.name
              );
              engine.enemies.push(midBossEnemy);
              directorRef.current?.recordEnemySpawn(midBossEnemy, newTime);
              pushDamageText(engine.texts, player.x, player.y - 50, `👑 ${curLvl.midBoss.name}`, COLORS.mustard, true);
              setRunStats((s) => ({
                ...s,
                warningBanner: curLvl.midBoss.warning,
                bossTitle: `👑 MINIBOSS: ${curLvl.midBoss.name}`,
                bossHpPct: 100,
              }));
              sound.boss();
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
            }

            // 3. Final Level Boss encounter (hlavní šéf úrovně za soumraku / v noci)
            if (!engine.finalBossSpawned && (engine.midBossSpawned || newTime >= curLvl.finalBoss.time + 10) && newTime >= curLvl.finalBoss.time) {
              engine.finalBossSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const spawnPos = RunDirector.getOffscreenPosition(player, ang, engine, 200);
              if (curLvl.finalBoss.id === 'vrana') {
                (engine as any).flockTreasureDropped = false;
                const crowCount = 9;
                for (let i = 0; i < crowCount; i++) {
                  const flockAngle = (i / crowCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
                  const dist = i === 0 ? 0 : 35 + (i % 3) * 15;
                  const crowPos = sanitizeArenaSpawnPoint(
                    spawnPos.x + Math.cos(flockAngle) * dist,
                    spawnPos.y + Math.sin(flockAngle) * dist,
                    18,
                    engine.activeLevelId ?? 0,
                    engine.decor,
                    36
                  );
                  const crowTitle = i === 0 ? curLvl.finalBoss.name : undefined;
                  const crowEnemy = createEnemyInstance(
                    curLvl.finalBoss.id,
                    crowPos.x,
                    crowPos.y,
                    curLvl.finalBoss.multiplier,
                    i === 0,
                    true,
                    crowTitle
                  );
                  (crowEnemy as any).isMinibossFlockMember = true;
                  (crowEnemy as any).flockIndex = i;
                  (crowEnemy as any).flockTotal = crowCount;
                  engine.enemies.push(crowEnemy);
                  directorRef.current?.recordEnemySpawn(crowEnemy, newTime);
                }
              } else {
                const safeBossPos = sanitizeArenaSpawnPoint(
                  spawnPos.x,
                  spawnPos.y,
                  30,
                  engine.activeLevelId ?? 0,
                  engine.decor,
                  45
                );
                const finalBossEnemy = createEnemyInstance(
                  curLvl.finalBoss.id,
                  safeBossPos.x,
                  safeBossPos.y,
                  curLvl.finalBoss.multiplier,
                  true
                );
                engine.enemies.push(finalBossEnemy);
                directorRef.current?.recordEnemySpawn(finalBossEnemy, newTime);
              }
              sound.roar();
              setRunStats((s) => ({
                ...s,
                bossTitle: curLvl.finalBoss.name,
                bossHpPct: 100,
                warningBanner: curLvl.finalBoss.warning,
              }));
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
            }

            // SINGLE-PASS ACTIVE BOSS LOOKUP (avoids scanning engine.enemies 7x every frame)
            let moranaBoss: any = null;
            let cert: any = null;
            let hejkal: any = null;
            let obr: any = null;
            let mlynar: any = null;
            let rytir: any = null;
            let drak: any = null;
            for (let bIdx = 0, bLen = engine.enemies.length; bIdx < bLen; bIdx++) {
              const e = engine.enemies[bIdx];
              if (!e || e.isDefeated) continue;
              const eid = e.id;
              if (eid === 'morana' && !moranaBoss && (e.isBoss || (engine.activeLevelId === 1 && engine.finalBossSpawned))) moranaBoss = e;
              else if (eid === 'cert' && !cert) cert = e;
              else if (eid === 'hejkal' && !hejkal) hejkal = e;
              else if (eid === 'obr' && !obr) obr = e;
              else if (eid === 'mlynar' && !mlynar) mlynar = e;
              else if (eid === 'bezhlavy_rytir' && !rytir) rytir = e;
              else if (eid === 'drak' && !drak) drak = e;
            }

            // MORANA BOSS DYNAMIC MECHANICS (LEVEL 1 - MRAZIVÝ DECH A SNĚŽNÁ VÁNICE)
            if (moranaBoss && curLvl.id === 1) {
              const isPhase2 = moranaBoss.hp <= moranaBoss.maxHp * 0.5;
              moranaBoss.moranaWindTimer = (moranaBoss.moranaWindTimer !== undefined ? moranaBoss.moranaWindTimer : 4.5) - dt;
              moranaBoss.moranaBlizzardTimer = (moranaBoss.moranaBlizzardTimer !== undefined ? moranaBoss.moranaBlizzardTimer : 10.5) - dt;

              if (isPhase2 && !moranaBoss.enraged) {
                moranaBoss.enraged = true;
                moranaBoss.speed = 82;
                sound.roar();
                pushDamageText(engine.texts, moranaBoss.x, moranaBoss.y - 110, '❄️ SMRTÍCÍ MRAZ!', '#BAE6FD', true);
                setRunStats((s) => ({ ...s, warningBanner: '❄️ MORANA SE ROZHNĚVALA! PŘICHÁZÍ SNĚŽNÁ VÁNICE!' }));
                setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                for (let i = 0; i < 28; i++) {
                  const ang = (i / 28) * Math.PI * 2;
                  emitParticle(engine.particles, () => ({
                    x: moranaBoss.x,
                    y: moranaBoss.y,
                    vx: Math.cos(ang) * (95 + Math.random() * 100),
                    vy: Math.sin(ang) * (95 + Math.random() * 100),
                    life: 0.9,
                    color: i % 2 === 0 ? '#E0F2FE' : '#93C5FD',
                    size: 4 + Math.random() * 3,
                  }));
                }
              }

              // Aimed icy wind blades fan toward the player's current position.
              if (moranaBoss.moranaWindTimer <= 0) {
                moranaBoss.moranaWindTimer = isPhase2 ? 3.3 : 4.8;
                const targetAngle = Math.atan2(player.y - moranaBoss.y, player.x - moranaBoss.x);
                const count = isPhase2 ? 5 : 3;
                const spread = isPhase2 ? 0.30 : 0.22;
                for (let i = 0; i < count; i++) {
                  const angle = targetAngle + (i - (count - 1) / 2) * spread;
                  const speed = isPhase2 ? 245 : 210;
                  engine.projectiles.push({
                    x: moranaBoss.x,
                    y: moranaBoss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    angle,
                    speed,
                    dmg: isPhase2 ? 22 : 16,
                    radius: isPhase2 ? 15 : 13,
                    type: 'physical',
                    visual: 'dragon_wind',
                    life: 2.8,
                    maxLife: 2.8,
                    isEnemy: true,
                    pushback: isPhase2 ? 48 : 34,
                    statusText: 'MRAZIVÝ VÍTR! ❄️',
                    dead: false,
                  });
                }
                for (let i = 0; i < 10; i++) {
                  const angle = targetAngle + (Math.random() - 0.5) * 1.4;
                  emitParticle(engine.particles, () => ({
                    x: moranaBoss.x,
                    y: moranaBoss.y,
                    vx: Math.cos(angle) * (100 + Math.random() * 110),
                    vy: Math.sin(angle) * (100 + Math.random() * 110),
                    life: 0.55,
                    color: i % 2 === 0 ? '#E0F2FE' : '#7DD3FC',
                    size: 4 + Math.random() * 3,
                  }));
                }
              }

              // A second attack fills the arena with slower, dodgeable spiral gusts.
              if (moranaBoss.moranaBlizzardTimer <= 0) {
                moranaBoss.moranaBlizzardTimer = isPhase2 ? 8 : 12;
                sound.roar();
                pushDamageText(engine.texts, moranaBoss.x, moranaBoss.y - 95, '🌨️ VÁNICE!', '#E0F2FE', true);
                const count = isPhase2 ? 12 : 8;
                for (let i = 0; i < count; i++) {
                  const angle = (i / count) * Math.PI * 2;
                  const speed = isPhase2 ? 175 : 145;
                  engine.projectiles.push({
                    x: moranaBoss.x,
                    y: moranaBoss.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    angle,
                    speed,
                    dmg: isPhase2 ? 18 : 12,
                    radius: isPhase2 ? 13 : 11,
                    type: 'physical',
                    visual: 'dragon_wind',
                    life: 2.5,
                    maxLife: 2.5,
                    isEnemy: true,
                    pushback: 32,
                    statusText: 'VÁNICE! 🌨️',
                    dead: false,
                  });
                }
              }
            }

            // PEKELNÝ ČERT BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 2)
            if (cert && (cert.isBoss || engine.finalBossSpawned || curLvl.id === 2)) {
              if (cert) {
                const isPhase2 = cert.hp <= cert.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Čertovské rejdy)
                if (isPhase2 && !cert.enraged) {
                  cert.enraged = true;
                  cert.speed = 102;
                  sound.roar();
                  pushDamageText(engine.texts, cert.x, cert.y - 70, '🔥 ČERTOVSKÉ REJDY!', COLORS.red, true);
                  setRunStats((s) => ({ ...s, warningBanner: '🔥 ČERTOVSKÉ REJDY! ČERT ZUŘÍ A DUPE KOPYTY!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Summon 2 mischievous rarášci
                  for (let i = 0; i < 2; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    engine.enemies.push(createEnemyInstance('rarach', cert.x + Math.cos(ang) * 90, cert.y + Math.sin(ang) * 90, 1.1));
                  }
                  // Brimstone smoke and fiery sparks burst
                  for (let i = 0; i < 26; i++) {
                    emitParticle(engine.particles, () => ({
                      x: cert.x,
                      y: cert.y,
                      vx: (Math.random() - 0.5) * 220,
                      vy: (Math.random() - 0.5) * 220,
                      life: 0.8,
                      color: i % 2 === 0 ? '#DC2626' : '#F59E0B',
                      size: 6,
                    }));
                  }
                }

                // 0. Mariáš ďáblů — Čert pravidelně vytáhne jednu kartu a spustí tematický útok.
                engine.certMariashCd -= dt;
                if (engine.certMariashCd <= 0) {
                  engine.certMariashCd = isPhase2 ? 13.5 : 18.0;
                  const cards = [
                    { label: 'SRDCE', icon: '♥', color: '#E11D48' },
                    { label: 'KULE', icon: '♦', color: '#F59E0B' },
                    { label: 'LISTY', icon: '♣', color: '#16A34A' },
                    { label: 'ŽALUDY', icon: '♠', color: '#7C3AED' },
                  ];
                  const card = cards[Math.floor(Math.random() * cards.length)];
                  pushDamageText(engine.texts, cert.x, cert.y - 95, `MARIÁŠ: ${card.icon} ${card.label}!`, card.color, true);

                  if (card.label === 'SRDCE') {
                    const heal = cert.maxHp * (isPhase2 ? 0.035 : 0.025);
                    cert.hp = Math.min(cert.maxHp, cert.hp + heal);
                    const radius = isPhase2 ? 250 : 210;
                    if (Math.hypot(player.x - cert.x, player.y - cert.y) <= radius) {
                      player.takeDamage(isPhase2 ? 24 : 18, 'fire');
                    }
                    for (let i = 0; i < 18; i++) {
                      const a = (i / 18) * Math.PI * 2;
                      engine.projectiles.push({
                        x: cert.x, y: cert.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150,
                        angle: a, speed: 150, dmg: isPhase2 ? 22 : 16, radius: 10, type: 'fire',
                        visual: 'hell_spark', life: 2.8, maxLife: 2.8, isEnemy: true, pushback: 20,
                        statusText: 'SRDCE! ♥', dead: false,
                      });
                    }
                  } else if (card.label === 'KULE') {
                    const baseAng = Math.atan2(player.y - cert.y, player.x - cert.x);
                    const count = isPhase2 ? 5 : 3;
                    for (let i = 0; i < count; i++) {
                      const spread = (i - (count - 1) / 2) * 0.18;
                      const a = baseAng + spread;
                      engine.projectiles.push({
                        x: cert.x, y: cert.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300,
                        angle: a, speed: 300, dmg: isPhase2 ? 30 : 23, radius: 13, type: 'fire',
                        visual: 'hell_spark', life: 2.6, maxLife: 2.6, isEnemy: true, pushback: 28,
                        statusText: 'KULE! ♦', dead: false,
                      });
                    }
                  } else if (card.label === 'LISTY') {
                    const count = isPhase2 ? 3 : 2;
                    for (let i = 0; i < count; i++) {
                      const a = Math.random() * Math.PI * 2;
                      engine.enemies.push(createEnemyInstance(
                        'sazovy_rarach',
                        cert.x + Math.cos(a) * 110,
                        cert.y + Math.sin(a) * 110,
                        isPhase2 ? 1.15 : 1.0
                      ));
                    }
                  } else {
                    const dashAng = Math.atan2(player.y - cert.y, player.x - cert.x);
                    cert.vx = Math.cos(dashAng) * (isPhase2 ? 340 : 285);
                    cert.vy = Math.sin(dashAng) * (isPhase2 ? 340 : 285);
                    cert.aiState = 'charge';
                    cert.aiTimer = isPhase2 ? 0.75 : 0.55;
                  }
                }

                // 1. Devil's Stomp (Pekelný dupák - ring of spinning hot embers)
                engine.certStompTimer -= dt;
                if (engine.certStompTimer <= 0) {
                  engine.certStompTimer = isPhase2 ? 7.5 : 11.0;
                  sound.thunder();
                  pushDamageText(engine.texts, cert.x, cert.y - 45, 'PEKELNÝ DUPÁK! 💥', COLORS.red, true);
                  const sparkCount = isPhase2 ? 10 : 8;
                  for (let i = 0; i < sparkCount; i++) {
                    const sAng = (i / sparkCount) * Math.PI * 2;
                    engine.projectiles.push({
                      x: cert.x,
                      y: cert.y,
                      vx: Math.cos(sAng) * 210,
                      vy: Math.sin(sAng) * 210,
                      angle: sAng,
                      speed: 210,
                      dmg: isPhase2 ? 26 : 20,
                      radius: 12,
                      type: 'fire',
                      visual: 'hell_spark',
                      life: 3.5,
                      maxLife: 3.5,
                      isEnemy: true,
                      pushback: 30,
                      statusText: 'UHLÍK! 🔥',
                      dead: false,
                    });
                  }
                  for (let i = 0; i < 16; i++) {
                    const pAng = Math.random() * Math.PI * 2;
                    emitParticle(engine.particles, () => ({
                      x: cert.x,
                      y: cert.y,
                      vx: Math.cos(pAng) * 150,
                      vy: Math.sin(pAng) * 150,
                      life: 0.55,
                      color: '#F97316',
                      size: 5,
                    }));
                  }
                }

                // 2. Pitchfork Thrust / Hoofed Charge (Pekelný efektivní charge s telegrafem a kopyty)
                engine.certChargeTimer -= dt;
                if (engine.certChargeTimer <= 0) {
                  const dToP = Math.hypot(player.x - cert.x, player.y - cert.y);
                  if (dToP < 550 && dToP > 40 && cert.aiState !== 'charge' && cert.aiState !== 'windup') {
                    engine.certChargeTimer = isPhase2 ? 4.8 : 6.8;
                    cert.aiState = 'windup';
                    cert.aiTimer = 0.65;
                    const chAng = Math.atan2(player.y - cert.y, player.x - cert.x);
                    cert.chargeDirX = chAng;
                    cert.chargeSpeed = isPhase2 ? 560 : 490;
                    cert.vx = 0;
                    cert.vy = 0;
                    sound.roar();
                    pushDamageText(engine.texts, cert.x, cert.y - 55, 'DUSOT KOPYT! 🐂🔥', '#EF4444', true);
                    // Hoof scratch dust & brimstone sparks
                    for (let i = 0; i < 14; i++) {
                      emitParticle(engine.particles, () => ({
                        x: cert.x + (Math.random() - 0.5) * 20,
                        y: cert.y + cert.radius * 0.7,
                        vx: -Math.cos(chAng) * (60 + Math.random() * 80) + (Math.random() - 0.5) * 30,
                        vy: -Math.sin(chAng) * (60 + Math.random() * 80) + (Math.random() - 0.5) * 30,
                        life: 0.5,
                        color: i % 2 === 0 ? '#F97316' : '#DC2626',
                        size: 5,
                      }));
                    }
                  } else if (cert.aiState !== 'charge' && cert.aiState !== 'windup') {
                    engine.certChargeTimer = 1.0;
                  }
                }
              }
            }

            // PŮLNOČNÍ HEJKAL BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 3)
            if (hejkal && (hejkal.isBoss || engine.finalBossSpawned || curLvl.id === 3)) {
              if (hejkal) {
                const isPhase2 = hejkal.hp <= hejkal.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Probuzení hvozdu)
                if (isPhase2 && !hejkal.enraged) {
                  hejkal.enraged = true;
                  hejkal.speed = 88;
                  sound.roar();
                  pushDamageText(engine.texts, hejkal.x, hejkal.y - 70, '🌲 PROBUZENÍ HVOZDU!', '#16A34A', true);
                  setRunStats((s) => ({ ...s, warningBanner: '🌲 PROBUZENÍ HVOZDU! HEJKAL PŘIVOLÁVÁ LESNÍ ŠELMY!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Summon a forest skodnik & cemetery hound
                  engine.enemies.push(createEnemyInstance('skodnik', hejkal.x + 80, hejkal.y, 1.1));
                  engine.enemies.push(createEnemyInstance('cerny_pes', hejkal.x - 80, hejkal.y, 1.1));
                  for (let i = 0; i < 30; i++) {
                    emitParticle(engine.particles, () => ({
                      x: hejkal.x,
                      y: hejkal.y,
                      vx: (Math.random() - 0.5) * 200,
                      vy: (Math.random() - 0.5) * 200,
                      life: 1.1,
                      color: i % 2 === 0 ? '#15803D' : '#D97706',
                      size: 6,
                    }));
                  }
                }

                // 1. Sonic Timber Howl (Hromové zahejkání - acoustic gale & flying oak shards)
                engine.hejkalHowlTimer -= dt;
                if (engine.hejkalHowlTimer <= 0) {
                  engine.hejkalHowlTimer = isPhase2 ? 7.5 : 11.0;
                  sound.roar();
                  pushDamageText(engine.texts, hejkal.x, hejkal.y - 50, 'HÉÉÉ-J! 🌲🔊', '#22C55E', true);
                  // Push player backward from acoustic blast
                  const pushAng = Math.atan2(player.y - hejkal.y, player.x - hejkal.x);
                  player.x += Math.cos(pushAng) * 65;
                  player.y += Math.sin(pushAng) * 65;
                  // Spray sharp flying oak shards / pinecones in fan
                  const shardsCount = isPhase2 ? 6 : 4;
                  const baseAng = Math.atan2(player.y - hejkal.y, player.x - hejkal.x);
                  for (let i = 0; i < shardsCount; i++) {
                    const spread = ((i - (shardsCount - 1) / 2) * Math.PI) / 8;
                    const wAng = baseAng + spread;
                    engine.projectiles.push({
                      x: hejkal.x,
                      y: hejkal.y,
                      vx: Math.cos(wAng) * 240,
                      vy: Math.sin(wAng) * 240,
                      angle: wAng,
                      speed: 240,
                      dmg: isPhase2 ? 28 : 22,
                      radius: 12,
                      type: 'physical',
                      visual: 'wood_shard',
                      life: 3.0,
                      maxLife: 3.0,
                      isEnemy: true,
                      pushback: 35,
                      statusText: 'VĚTEV! 🪵',
                      dead: false,
                    });
                  }
                }

                // 2. Heavy club ground smash in close quarters
                engine.hejkalSmashTimer -= dt;
                if (engine.hejkalSmashTimer <= 0) {
                  engine.hejkalSmashTimer = isPhase2 ? 6.0 : 8.5;
                  const dToP = Math.hypot(player.x - hejkal.x, player.y - hejkal.y);
                  sound.heavyHit();
                  pushDamageText(engine.texts, hejkal.x, hejkal.y - 40, 'DUBILKA! 🔨', '#A16207', true);
                  for (let i = 0; i < 16; i++) {
                    const ang = (i / 16) * Math.PI * 2;
                    emitParticle(engine.particles, () => ({
                      x: hejkal.x + Math.cos(ang) * 30,
                      y: hejkal.y + Math.sin(ang) * 30,
                      vx: Math.cos(ang) * 140,
                      vy: Math.sin(ang) * 140,
                      life: 0.45,
                      color: i % 2 === 0 ? '#15803D' : '#78350F',
                      size: 5,
                    }));
                  }
                  if (dToP < 210) {
                    player.takeDamage(isPhase2 ? 32 : 24, 'physical', hejkal, true);
                    const pushAng = Math.atan2(player.y - hejkal.y, player.x - hejkal.x);
                    player.x += Math.cos(pushAng) * 45;
                    player.y += Math.sin(pushAng) * 45;
                  }
                }
              }
            }

            // SKALNÍ OBR BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 4)
            if (obr && (obr.isBoss || engine.finalBossSpawned || curLvl.id === 4)) {
              if (obr) {
                const isPhase2 = obr.hp <= obr.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Pukající žula)
                if (isPhase2 && !obr.enraged) {
                  obr.enraged = true;
                  obr.speed = 64;
                  sound.roar();
                  pushDamageText(engine.texts, obr.x, obr.y - 70, '🗿 PUKAJÍCÍ ŽULA!', '#F59E0B', true);
                  setRunStats((s) => ({ ...s, warningBanner: '🗿 PUKAJÍCÍ ŽULA! SKÁLY SE HROUTÍ A ŽULA PUKÁ!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  for (let i = 0; i < 30; i++) {
                    emitParticle(engine.particles, () => ({
                      x: obr.x,
                      y: obr.y,
                      vx: (Math.random() - 0.5) * 190,
                      vy: (Math.random() - 0.5) * 190,
                      life: 0.9,
                      color: i % 2 === 0 ? '#71717A' : '#F59E0B',
                      size: 7,
                    }));
                  }
                }

                // 1. Rolling river boulders (Valící se balvany)
                engine.obrBoulderTimer -= dt;
                if (engine.obrBoulderTimer <= 0) {
                  engine.obrBoulderTimer = isPhase2 ? 5.2 : 8.0;
                  sound.hit();
                  pushDamageText(engine.texts, obr.x, obr.y - 45, 'VALÍCÍ SE BALVAN! 🪨', '#71717A', true);
                  const bAng = Math.atan2(player.y - obr.y, player.x - obr.x);
                  const bCount = isPhase2 ? 2 : 1;
                  for (let i = 0; i < bCount; i++) {
                    const offset = (i - (bCount - 1) / 2) * 0.35;
                    engine.projectiles.push({
                      x: obr.x,
                      y: obr.y,
                      vx: Math.cos(bAng + offset) * 190,
                      vy: Math.sin(bAng + offset) * 190,
                      angle: bAng + offset,
                      speed: 190,
                      dmg: isPhase2 ? 34 : 26,
                      radius: 22,
                      type: 'physical',
                      visual: 'boulder',
                      life: 4.5,
                      maxLife: 4.5,
                      isEnemy: true,
                      pushback: 50,
                      statusText: 'BALVAN! 🪨',
                      dead: false,
                    });
                  }
                }

                // 2. Riverquake Slam (Sázavské zemětřesení)
                engine.obrQuakeTimer -= dt;
                if (engine.obrQuakeTimer <= 0) {
                  engine.obrQuakeTimer = isPhase2 ? 7.0 : 10.0;
                  sound.thunder();
                  pushDamageText(engine.texts, obr.x, obr.y - 50, 'ZEMĚTŘESENÍ! ⚡', '#D97706', true);
                  const dist = Math.hypot(player.x - obr.x, player.y - obr.y);
                  if (dist < 260) {
                    player.takeDamage(isPhase2 ? 28 : 20, 'physical', obr, true);
                    const qAng = Math.atan2(player.y - obr.y, player.x - obr.x);
                    player.x += Math.cos(qAng) * 55;
                    player.y += Math.sin(qAng) * 55;
                  }
                  for (let i = 0; i < 20; i++) {
                    const qAng = Math.random() * Math.PI * 2;
                    const qDist = Math.random() * 200;
                    emitParticle(engine.particles, () => ({
                      x: obr.x + Math.cos(qAng) * qDist,
                      y: obr.y + Math.sin(qAng) * qDist,
                      vx: 0,
                      vy: -30,
                      life: 0.5,
                      color: '#52525B',
                      size: 6,
                    }));
                  }
                }
              }
            }

            // MLYNÁŘ BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 5)
            if (mlynar && (mlynar.isBoss || engine.finalBossSpawned || curLvl.id === 5)) {
              if (mlynar) {
                const isPhase2 = mlynar.hp <= mlynar.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Pekelné mletí)
                if (isPhase2 && !mlynar.enraged) {
                  mlynar.enraged = true;
                  mlynar.speed = 82;
                  sound.roar();
                  pushDamageText(engine.texts, mlynar.x, mlynar.y - 70, '🔥 PEKELNÉ MLETÍ!', COLORS.red, true);
                  setRunStats((s) => ({ ...s, warningBanner: '🔥 PEKELNÉ MLETÍ! ČERTŮV MLÝN SE ROZTÁČÍ!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Forge sparks burst
                  for (let i = 0; i < 2; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    engine.enemies.push(createEnemyInstance('jiskrivec', mlynar.x + Math.cos(ang) * 80, mlynar.y + Math.sin(ang) * 80, 0.9));
                  }
                  // Flour & spark explosion
                  for (let i = 0; i < 25; i++) {
                    emitParticle(engine.particles, () => ({
                      x: mlynar.x,
                      y: mlynar.y,
                      vx: (Math.random() - 0.5) * 200,
                      vy: (Math.random() - 0.5) * 200,
                      life: 0.8,
                      color: i % 2 === 0 ? '#FFFFFF' : '#F97316',
                      size: 6,
                    }));
                  }
                }

                // Rolling Millstones (Mlýnské kameny)
                engine.mlynarStoneTimer -= dt;
                if (engine.mlynarStoneTimer <= 0) {
                  engine.mlynarStoneTimer = isPhase2 ? 4.2 : 6.5;
                  const stonesCount = isPhase2 ? 2 : 1;
                  for (let i = 0; i < stonesCount; i++) {
                    const baseAng = Math.atan2(player.y - mlynar.y, player.x - mlynar.x);
                    const ang = baseAng + (i === 0 ? -0.2 : 0.2) * (stonesCount > 1 ? 1 : 0);
                    engine.projectiles.push({
                      x: mlynar.x,
                      y: mlynar.y,
                      vx: Math.cos(ang) * 230,
                      vy: Math.sin(ang) * 230,
                      angle: ang,
                      rotation: 0,
                      rotSpeed: 5.5,
                      speed: 230,
                      dmg: 28,
                      radius: 20,
                      type: 'blunt',
                      visual: 'millstone',
                      life: 5.5,
                      isEnemy: true,
                      pushback: 35,
                      dead: false,
                    });
                  }
                  sound.slash();
                  pushDamageText(engine.texts, mlynar.x, mlynar.y - 40, 'MLÝNSKÝ KÁMEN! ⚙️', COLORS.grey, true);
                }

                // Sluice Gate Flood Waves (Povodňová vlna ze stavidel)
                engine.mlynarWaveTimer -= dt;
                if (engine.mlynarWaveTimer <= 0) {
                  engine.mlynarWaveTimer = isPhase2 ? 8.5 : 12.5;
                  sound.splash();
                  setRunStats((s) => ({ ...s, warningBanner: '🌊 STAVIDLA OTEVŘENA – POVODŇOVÁ VLNA!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2500);
                  pushDamageText(engine.texts, mlynar.x, mlynar.y - 50, 'POVODEŇ ZE STAVIDEL! 🌊', '#38BDF8', true);

                  const waveCount = isPhase2 ? 5 : 3;
                  const baseAng = Math.atan2(player.y - mlynar.y, player.x - mlynar.x);
                  const spread = isPhase2 ? 0.75 : 0.5;
                  for (let i = 0; i < waveCount; i++) {
                    const ang = baseAng - spread / 2 + (i * spread) / (waveCount - 1);
                    engine.projectiles.push({
                      x: mlynar.x,
                      y: mlynar.y,
                      vx: Math.cos(ang) * 280,
                      vy: Math.sin(ang) * 280,
                      angle: ang,
                      speed: 280,
                      dmg: 22,
                      radius: 26,
                      type: 'water',
                      visual: 'water_wave',
                      life: 3.5,
                      isEnemy: true,
                      pushback: 55,
                      soakPlayer: true,
                      dead: false,
                    });
                  }
                }

                // Flour Storm & Blindness (Moučný mrak)
                engine.mlynarStormTimer -= dt;
                if (engine.mlynarStormTimer <= 0) {
                  engine.mlynarStormTimer = 16.0;
                  engine.flourStormTimer = 4.5;
                  sound.hit();
                  setRunStats((s) => ({ ...s, warningBanner: '💨 MOUČNÝ OBLAK – BÍLÁ TMA!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2800);
                  pushDamageText(engine.texts, mlynar.x, mlynar.y - 60, 'MOUČNÝ MRAK!', '#F5F5F4', true);
                  // Shove player gently from blast
                  const fAng = Math.atan2(player.y - mlynar.y, player.x - mlynar.x);
                  player.x += Math.cos(fAng) * 45;
                  player.y += Math.sin(fAng) * 45;
                  // Flour particles
                  for (let i = 0; i < 35; i++) {
                    const pAng = Math.random() * Math.PI * 2;
                    const pDist = Math.random() * 120;
                    emitParticle(engine.particles, () => ({
                      x: mlynar.x + Math.cos(pAng) * pDist,
                      y: mlynar.y + Math.sin(pAng) * pDist,
                      vx: (Math.random() - 0.5) * 160,
                      vy: (Math.random() - 0.5) * 160,
                      life: 1.5,
                      color: 'rgba(255, 255, 255, 0.9)',
                      size: 8,
                    }));
                  }
                  // Spawn one jiskrivec
                  engine.enemies.push(createEnemyInstance('jiskrivec', mlynar.x + (Math.random() - 0.5) * 120, mlynar.y + (Math.random() - 0.5) * 120, 0.8));
                }
              }
            }

            // BEZHLAVÝ RYTÍŘ BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 6)
            if (rytir && (rytir.isBoss || engine.finalBossSpawned || curLvl.id === 6)) {
              if (rytir) {
                const isPhase2 = rytir.hp <= rytir.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Prokletí hlásky)
                if (isPhase2 && !rytir.enraged) {
                  rytir.enraged = true;
                  rytir.speed = 98;
                  sound.roar();
                  pushDamageText(engine.texts, rytir.x, rytir.y - 70, '🗡️ PROKLETÍ HLÁSKY!', '#94A3B8', true);
                  setRunStats((s) => ({ ...s, warningBanner: '🗡️ PROKLETÍ HLÁSKY! BEZHLAVÝ RYTÍŘ CVÁLÁ PO BOJIŠTI!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  engine.enemies.push(createEnemyInstance('zbrojnos', rytir.x + 90, rytir.y, 1.1));
                  engine.enemies.push(createEnemyInstance('bila_pani', rytir.x - 90, rytir.y, 1.1));
                  for (let i = 0; i < 28; i++) {
                    emitParticle(engine.particles, () => ({
                      x: rytir.x,
                      y: rytir.y,
                      vx: (Math.random() - 0.5) * 210,
                      vy: (Math.random() - 0.5) * 210,
                      life: 0.9,
                      color: i % 2 === 0 ? '#64748B' : '#38BDF8',
                      size: 6,
                    }));
                  }
                }

                // 1. Odražená hlava (Rebounded boomerang skull projectile)
                engine.rytirHeadTimer -= dt;
                if (engine.rytirHeadTimer <= 0) {
                  engine.rytirHeadTimer = isPhase2 ? 5.5 : 8.5;
                  sound.roar();
                  pushDamageText(engine.texts, rytir.x, rytir.y - 45, 'ODRAŽENÁ HLAVA! 💀', '#94A3B8', true);
                  setRunStats((s) => ({ ...s, warningBanner: '💀 ODRAŽENÁ HLAVA SE VRACÍ!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2500);

                  const headAng = Math.atan2(player.y - rytir.y, player.x - rytir.x);
                  const headCount = isPhase2 ? 2 : 1;
                  for (let i = 0; i < headCount; i++) {
                    const spread = (i - (headCount - 1) / 2) * 0.35;
                    const ang = headAng + spread;
                    engine.projectiles.push({
                      x: rytir.x,
                      y: rytir.y,
                      vx: Math.cos(ang) * 290,
                      vy: Math.sin(ang) * 290,
                      angle: ang,
                      speed: 290,
                      dmg: isPhase2 ? 38 : 30,
                      radius: 18,
                      type: 'physical',
                      visual: 'head_projectile',
                      life: 3.5,
                      maxLife: 3.5,
                      boomerang: true,
                      owner: rytir,
                      isEnemy: true,
                      pushback: 40,
                      statusText: 'ZTRACENÁ HLAVA! 💀',
                      dead: false,
                    });
                  }
                }

                // 2. Heavy Cavalry Strike / Blade Thrust (Výpad čepelí)
                engine.rytirChargeTimer -= dt;
                if (engine.rytirChargeTimer <= 0) {
                  engine.rytirChargeTimer = isPhase2 ? 5.0 : 7.5;
                  const dToP = Math.hypot(player.x - rytir.x, player.y - rytir.y);
                  if (dToP < 340 && dToP > 60) {
                    sound.slash();
                    const chAng = Math.atan2(player.y - rytir.y, player.x - rytir.x);
                    const chSpd = isPhase2 ? 330 : 260;
                    rytir.aiState = 'charge';
                    rytir.aiTimer = isPhase2 ? 0.75 : 0.65;
                    rytir.chargeDirX = chAng;
                    rytir.chargeSpeed = chSpd;
                    rytir.vx = Math.cos(chAng) * chSpd;
                    rytir.vy = Math.sin(chAng) * chSpd;
                    pushDamageText(engine.texts, rytir.x, rytir.y - 50, 'VÝPAD ČEPELÍ! ⚔️', COLORS.red, true);
                  }
                }
              }
            }

            // TŘÍHLAVÝ DRAK BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 7)
            if (drak && (drak.isBoss || engine.finalBossSpawned || curLvl.id === 7)) {
              if (drak) {
                const isPhase2 = drak.hp <= drak.maxHp * 0.5;
                const distToP = Math.hypot(player.x - drak.x, player.y - drak.y);

                // Enrage trigger when dropping to 50% HP (Probuzení všech tří hlav!)
                if (isPhase2 && !drak.enraged) {
                  drak.enraged = true;
                  drak.speed = 68;
                  sound.roar();
                  sound.churchBell();
                  pushDamageText(engine.texts, drak.x, drak.y - 85, '🐉 PROBUZENÍ VŠECH TŘÍ HLAV!', '#DC2626', true);
                  setRunStats((s) => ({ ...s, warningBanner: '🐉 VŠECHNY TŘI HLAVY PROBUZENY! OHEŇ, MRÁZ A VICHR KŘÍDEL!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4000);
                  engine.enemies.push(createEnemyInstance('snehulak', drak.x + 110, drak.y, 1.15));
                  engine.enemies.push(createEnemyInstance('nocni_mura', drak.x - 110, drak.y, 1.15));
                  for (let i = 0; i < 45; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 60 + Math.random() * 220;
                    emitParticle(engine.particles, () => ({
                      x: drak.x,
                      y: drak.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      life: 1.2,
                      color: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#38BDF8' : '#FEF08A',
                      size: 8,
                    }));
                  }
                }

                // Head snout coordinates calculated dynamically from facing direction and head offsets
                const drakDir = (drak.vx || 1) < 0 ? -1 : 1;
                const fireHeadX = drak.x + drakDir * 120;
                const fireHeadY = drak.y - 68;
                const crownHeadX = drak.x + drakDir * 15;
                const crownHeadY = drak.y - 127;
                const frostHeadX = drak.x - drakDir * 103;
                const frostHeadY = drak.y - 78;

                // 1. Dragon Flame Breath (Ohnivá hlava - vějíř dračích plamenů vychází z ohnivé tlamy)
                engine.drakBreathTimer -= dt;
                if (engine.drakBreathTimer <= 0) {
                  engine.drakBreathTimer = isPhase2 ? 3.8 : 5.8;
                  sound.roar();
                  pushDamageText(engine.texts, fireHeadX, fireHeadY - 30, 'DRAČÍ PLAMEN! 🔥', '#DC2626', true);
                  const bAng = Math.atan2(player.y - fireHeadY, player.x - fireHeadX);
                  const flameCount = isPhase2 ? 8 : 6;
                  const spread = isPhase2 ? 0.8 : 0.6;

                  // Fire muzzle flash sparks directly at Head 3 snout
                  for (let i = 0; i < 15; i++) {
                    const ang = bAng + (Math.random() - 0.5) * 0.9;
                    const spd = 120 + Math.random() * 180;
                    emitParticle(engine.particles, () => ({
                      x: fireHeadX,
                      y: fireHeadY,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      life: 0.45,
                      color: i % 3 === 0 ? '#FEF08A' : i % 3 === 1 ? '#F97316' : '#DC2626',
                      size: 6,
                    }));
                  }

                  for (let i = 0; i < flameCount; i++) {
                    const ang = bAng - spread / 2 + (i * spread) / (flameCount - 1);
                    engine.projectiles.push({
                      x: fireHeadX + Math.cos(ang) * 12,
                      y: fireHeadY + Math.sin(ang) * 12,
                      vx: Math.cos(ang) * 270,
                      vy: Math.sin(ang) * 270,
                      angle: ang,
                      speed: 270,
                      dmg: isPhase2 ? 34 : 25,
                      radius: 16,
                      type: 'fire',
                      visual: 'dragon_fireball',
                      life: 3.5,
                      maxLife: 3.5,
                      isEnemy: true,
                      pushback: 35,
                      statusText: 'PLAMEN! 🔥',
                      dead: false,
                    });
                  }
                }

                // 2. Falling Cave Icicles (Hlídací majestátní hlava zařve klenbou sluje a strhne rampouchy)
                engine.drakIcicleTimer -= dt;
                if (engine.drakIcicleTimer <= 0) {
                  engine.drakIcicleTimer = isPhase2 ? 5.0 : 7.5;
                  sound.freeze();
                  sound.roar();
                  pushDamageText(engine.texts, crownHeadX, crownHeadY - 45, 'MRAZIVÝ ŘEV DO STROPU! 🧊🔊', '#38BDF8', true);
                  setRunStats((s) => ({ ...s, warningBanner: '🧊 POZOR NA PADAJÍCÍ RAMPOUCHY ZE STROPU SLUJE!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2500);

                  // Vertical sonic & frost beam shooting straight from center crown head up into cave ceiling
                  for (let i = 0; i < 20; i++) {
                    const beamY = crownHeadY - i * 16;
                    emitParticle(engine.particles, () => ({
                      x: crownHeadX + (Math.random() - 0.5) * 20,
                      y: beamY,
                      vx: (Math.random() - 0.5) * 40,
                      vy: -150 - Math.random() * 120,
                      life: 0.6,
                      color: i % 2 === 0 ? '#38BDF8' : '#BAE6FD',
                      size: 6,
                    }));
                  }

                  const icicleCount = isPhase2 ? 7 : 5;
                  for (let i = 0; i < icicleCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 260;
                    const offsetY = (Math.random() - 0.5) * 200;
                    const targetX = player.x + offsetX;
                    const targetY = player.y + offsetY;
                    engine.projectiles.push({
                      x: targetX,
                      y: targetY - 320,
                      vx: 0,
                      vy: 420,
                      angle: Math.PI / 2,
                      speed: 420,
                      dmg: isPhase2 ? 28 : 22,
                      radius: 16,
                      type: 'ice',
                      visual: 'icicle',
                      life: 1.0,
                      maxLife: 1.0,
                      isEnemy: true,
                      slowPlayer: true,
                      pushback: 22,
                      statusText: 'RAMPOUCH! 🧊',
                      dead: false,
                    });
                  }
                }

                // 3. Spiked Tail Whip (Švih trnitým ocasem v blízkosti nebo periodicky)
                engine.drakTailWhipTimer -= dt;
                if (engine.drakTailWhipTimer <= 0 || (distToP < 150 && engine.drakTailWhipTimer <= 3.0)) {
                  engine.drakTailWhipTimer = isPhase2 ? 5.5 : 8.0;
                  sound.heavyHit();
                  pushDamageText(engine.texts, drak.x, drak.y - 45, 'ŠVIH TRNITÝM OCASEM! 🐉💥', '#D97706', true);
                  const tailSparks = isPhase2 ? 14 : 10;
                  for (let i = 0; i < tailSparks; i++) {
                    const tAng = (i / tailSparks) * Math.PI * 2;
                    engine.projectiles.push({
                      x: drak.x + Math.cos(tAng) * 35,
                      y: drak.y + Math.sin(tAng) * 35,
                      vx: Math.cos(tAng) * 210,
                      vy: Math.sin(tAng) * 210,
                      angle: tAng,
                      speed: 210,
                      dmg: isPhase2 ? 26 : 20,
                      radius: 13,
                      type: 'physical',
                      visual: 'hell_spark',
                      life: 1.8,
                      maxLife: 1.8,
                      isEnemy: true,
                      pushback: 45,
                      statusText: 'OCAS! 💥',
                      dead: false,
                    });
                  }
                  if (distToP < 165) {
                    player.takeDamage(isPhase2 ? 32 : 24, 'physical', drak, true);
                    const pushAng = Math.atan2(player.y - drak.y, player.x - drak.x);
                    player.x += Math.cos(pushAng) * 55;
                    player.y += Math.sin(pushAng) * 55;
                  }
                }

                // 4. Lazy / Sleeping Head Snore (Phase 1: Chrápání a sirná kouřová bublina z líné levé hlavy)
                if (!isPhase2) {
                  engine.drakSnoreTimer -= dt;
                  if (engine.drakSnoreTimer <= 0) {
                    engine.drakSnoreTimer = 6.0;
                    sound.snack();
                    pushDamageText(engine.texts, frostHeadX, frostHeadY - 35, 'CHRRR... Zzz 💤', '#FEF08A', false);
                    const snoreAng = Math.atan2(player.y - frostHeadY, player.x - frostHeadX) + (Math.random() - 0.5) * 0.4;
                    engine.projectiles.push({
                      x: frostHeadX,
                      y: frostHeadY,
                      vx: Math.cos(snoreAng) * 110,
                      vy: Math.sin(snoreAng) * 110,
                      angle: snoreAng,
                      speed: 110,
                      dmg: 18,
                      radius: 20,
                      type: 'poison',
                      visual: 'mud_ball',
                      life: 4.5,
                      maxLife: 4.5,
                      isEnemy: true,
                      pushback: 15,
                      statusText: 'SÍRA! 💨',
                      dead: false,
                    });
                  }
                } else {
                  // PHASE 2 EXCLUSIVE MECHANICS (All 3 heads awake!):
                  // 4b. Awakened Frost Head (Mrazivý ledový dech probuzené levé hlavy)
                  engine.drakSnoreTimer -= dt;
                  if (engine.drakSnoreTimer <= 0) {
                    engine.drakSnoreTimer = 4.5;
                    sound.freeze();
                    pushDamageText(engine.texts, frostHeadX, frostHeadY - 35, 'MRAZIVÝ DECH! ❄️', '#38BDF8', true);
                    const fAng = Math.atan2(player.y - frostHeadY, player.x - frostHeadX);

                    // Ice frost particles right at Head 1 snout
                    for (let i = 0; i < 14; i++) {
                      const ang = fAng + (Math.random() - 0.5) * 0.8;
                      const spd = 100 + Math.random() * 160;
                      emitParticle(engine.particles, () => ({
                        x: frostHeadX,
                        y: frostHeadY,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        life: 0.45,
                        color: i % 2 === 0 ? '#38BDF8' : '#BAE6FD',
                        size: 5,
                      }));
                    }

                    for (let i = 0; i < 5; i++) {
                      const ang = fAng - 0.4 + i * 0.2;
                      engine.projectiles.push({
                        x: frostHeadX,
                        y: frostHeadY,
                        vx: Math.cos(ang) * 230,
                        vy: Math.sin(ang) * 230,
                        angle: ang,
                        speed: 230,
                        dmg: 26,
                        radius: 15,
                        type: 'ice',
                        visual: 'dragon_frostball',
                        life: 3.0,
                        maxLife: 3.0,
                        isEnemy: true,
                        slowPlayer: true,
                        pushback: 25,
                        statusText: 'MRÁZ! ❄️',
                        dead: false,
                      });
                    }
                  }

                  // 5. Wing Buffet Gale (Vichr z dračích křídel)
                  engine.drakWingGustTimer -= dt;
                  if (engine.drakWingGustTimer <= 0) {
                    engine.drakWingGustTimer = 8.0;
                    sound.sukoviceWhirl();
                    pushDamageText(engine.texts, drak.x, drak.y - 65, 'VICHR DRAČÍCH KŘÍDEL! 💨', '#67E8F9', true);
                    const gAng = Math.atan2(player.y - drak.y, player.x - drak.x);
                    for (let i = -1; i <= 1; i++) {
                      const ang = gAng + i * 0.35;
                      engine.projectiles.push({
                        x: drak.x,
                        y: drak.y,
                        vx: Math.cos(ang) * 310,
                        vy: Math.sin(ang) * 310,
                        angle: ang,
                        speed: 310,
                        dmg: 22,
                        radius: 22,
                        type: 'physical',
                        visual: 'dragon_wind',
                        life: 2.2,
                        maxLife: 2.2,
                        isEnemy: true,
                        pushback: 65,
                        statusText: 'VICHR! 💨',
                        dead: false,
                      });
                    }
                  }

                  // 6. Dragon Leap Stomp & Cave Shockwave (Dračí střemhlavý skok a zadupání)
                  engine.drakSwoopTimer -= dt;
                  if (engine.drakSwoopTimer <= 0) {
                    engine.drakSwoopTimer = 11.0;
                    sound.heavyHit();
                    sound.roar();
                    pushDamageText(engine.texts, drak.x, drak.y - 80, 'DRAČÍ ZADUPÁNÍ! 💥🏔️', '#DC2626', true);
                    const jumpAng = Math.atan2(player.y - drak.y, player.x - drak.x);
                    drak.x += Math.cos(jumpAng) * 90;
                    drak.y += Math.sin(jumpAng) * 90;
                    for (let i = 0; i < 24; i++) {
                      const ang = (i / 24) * Math.PI * 2;
                      emitParticle(engine.particles, () => ({
                        x: drak.x + Math.cos(ang) * 40,
                        y: drak.y + Math.sin(ang) * 40,
                        vx: Math.cos(ang) * 160,
                        vy: Math.sin(ang) * 160,
                        life: 0.6,
                        color: i % 2 === 0 ? '#DC2626' : '#E2E8F0',
                        size: 6,
                      }));
                    }
                    if (Math.hypot(player.x - drak.x, player.y - drak.y) < 190) {
                      player.takeDamage(35, 'physical', drak, true);
                      player.x += Math.cos(jumpAng) * 60;
                      player.y += Math.sin(jumpAng) * 60;
                    }
                  }
                }
              }
            }

            if (!engine.chasnikSpawned && newTime >= 50) {
              engine.chasnikSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const rawPos = RunDirector.getOffscreenPosition(player, ang, engine, 180);
              const cPos = sanitizeArenaSpawnPoint(rawPos.x, rawPos.y, 28, engine.activeLevelId ?? 0, engine.decor, 60);
              const cx = cPos.x;
              const cy = cPos.y;
              spawnDropWithLimit(engine.drops, {
                type: 'chasnik',
                x: cx,
                y: cy,
                radius: 26,
                time: 0,
                rescued: false,
              }, engine.pendingDropBank);
              // Spawn wave of sprites harassing him (frost sprites in Stage 1, rarachs in later stages)
              const chasnikHarasserId = (engine.activeLevelId ?? 0) === 0 ? 'mrazovy_skritek' : 'rarach';
              for (let i = 0; i < 5; i++) {
                const hPos = sanitizeArenaSpawnPoint(
                  cx + (Math.random() - 0.5) * 60,
                  cy + (Math.random() - 0.5) * 60,
                  18,
                  engine.activeLevelId ?? 0,
                  engine.decor,
                  40
                );
                engine.enemies.push(createEnemyInstance(chasnikHarasserId, hPos.x, hPos.y, 1));
              }
              pushDamageText(engine.texts, player.x, player.y - 50, 'CHASNÍK V NOUZI!', COLORS.mustard, true);
              sound.hit();
            }

            // Saint Elias holy lightning strike event in dusk, night, and midnight
            if (currentPhase.id === 'dusk' || currentPhase.id === 'night' || currentPhase.id === 'midnight') {
              engine.lightningTimer -= dt;
              if (engine.lightningTimer <= 0) {
                engine.lightningTimer = 35 + Math.random() * 30;
                sound.thunder();
                engine.lightningFlash = 0.45;

                const living = livingEnemiesRef.current;
                let strikeX = player.x + (Math.random() - 0.5) * 240;
                let strikeY = player.y + (Math.random() - 0.5) * 240;
                if (living.length > 0) {
                  const target = living[Math.floor(Math.random() * living.length)];
                  strikeX = target.x;
                  strikeY = target.y;
                }

                engine.lightningStrike = { x: strikeX, y: strikeY, time: 0.45 };

                // Burn enemies in blast radius
                const blastNearby = enemySpatialHashRef.current.queryCircleInto(strikeX, strikeY, 260, secondarySpatialResultsRef.current);
                for (let i = 0; i < blastNearby.length; i++) {
                  const e = blastNearby[i];
                  if (!e.isDefeated && Math.hypot(e.x - strikeX, e.y - strikeY) < 220) {
                    const holyMult = getHolyDamageMultiplier(e);
                    const holyPush = Math.max(0.1, 1 - getEnemyHolyResistance(e));
                    e.takeDamage(80 * player.damageMultiplier * holyMult, 'holy', (e.x - strikeX) * 3 * holyPush, (e.y - strikeY) * 3 * holyPush);
                  }
                }

                pushDamageText(engine.texts, strikeX, strikeY - 45, '⚡ BLESK SV. ELIÁŠE!', COLORS.mustard, true);

                if (!metaRef.current.lightningWitnessed) {
                  const updatedMeta = { ...metaRef.current, lightningWitnessed: true };
                  saveMeta(updatedMeta);
                }
              }
            }

            // Spawning strašidel je konsolidováno výhradně pod Režiséra výpravy (RunDirector).
            // Původní duplicitní vlnový generátor byl deaktivován, aby chránil plynulých 60 FPS
            // a udržoval počet aktivních monster do stropu 70 (45 v Performance Mode).

            // Player movement (combined Keyboard WASD/Arrows + Gamepad Left Stick [deadzone 0.15] + D-Pad [12..15] + Touch, normalized)
            const mx = gpInput.moveX;
            const my = gpInput.moveY;

            const BASE_PLAYER_SPEED = player.speed || 220;
            const MIN_SPEED_RATIO = 0.2;
            const DRAG_COEFFICIENT = 0.35;
            const PUSH_FORCE = 6.0;
            const MAX_PUSH_SPEED = 300;

            let moveVx = 0;
            let moveVy = 0;

            let hazardSpeedMult = 1;
            if (directorRef.current && directorRef.current.hazards.length > 0) {
              for (const h of directorRef.current.hazards) {
                const distH = Math.hypot(player.x - h.x, player.y - h.y);
                if (distH <= h.radius) {
                  if (h.type === 'mud' || (h.type === 'frost' && !player.iceImmunity)) {
                    hazardSpeedMult = Math.min(hazardSpeedMult, h.slowFactor || 0.6);
                  }
                }
              }
            }
            const buffMultiplier =
              (player.soulBuffTimer > 0 ? 1.25 : 1) *
              (player.gingerbreadSpeedTimer > 0 ? (1 + (player.gingerbreadSpeedBonus || 0.15)) : 1) *
              ((player.pistalkaSpeedTimer || 0) > 0 ? 1.25 : 1) *
              (player.waterSoakedTimer > 0 ? 0.75 : 1) *
              ((player.slowTimer > 0 && !player.iceImmunity) ? 0.65 : 1) *
              ((player.type === 'krajanek' && player.krajanekRideTimer > 0) || player.iceImmunity ? 1 : ((player.meltingPuddleSlowTimer || 0) > 0 ? 0.75 : 1)) *
              hazardSpeedMult *
              ((engine.activeLevelId === 0 && isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.pond)) ? 1.15 : 1);

            const isKrajanekRiding = player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0;

            if (isKrajanekRiding) {
              const isTouchActive = touchMoveRef.current.active || touchEnabled || isTouchScreen;
              const steer = computeKrajanekSteering(player, mx, my, dt, {
                isTouchInput: isTouchActive,
                onSound: (name: string) => (sound as any)[name]?.(),
                onDriftSpray: (p: any, angle: number, sign: number) => {
                  if (engine.particles.length < activeMaxParticlesRef.current) {
                    const sprayAngle = angle - sign * (Math.PI / 2);
                    for (let k = 0; k < 6 && engine.particles.length < activeMaxParticlesRef.current; k++) {
                      const spread = sprayAngle + (Math.random() - 0.5) * 0.8;
                      const spd = 120 + Math.random() * 140;
                      emitParticle(engine.particles, () => ({
                        x: p.x + Math.cos(spread) * 20,
                        y: p.y + Math.sin(spread) * 20,
                        vx: Math.cos(spread) * spd,
                        vy: Math.sin(spread) * spd - 30,
                        life: 0.35 + Math.random() * 0.25,
                        color: k % 2 === 0 ? '#E2E8F0' : '#452A1C',
                        size: 2.5 + Math.random() * 2.5,
                      }));
                    }
                  }
                },
              });
              const effectiveSpeed = BASE_PLAYER_SPEED * buffMultiplier * getKrajanekMomentumMultiplier(player);
              player.krajanekCurrentSpeed = effectiveSpeed;
              moveVx = steer.vxRatio * effectiveSpeed;
              moveVy = steer.vyRatio * effectiveSpeed;
              player.lastDx = steer.vxRatio;
              player.lastDy = steer.vyRatio;
              player.animTime += dt;
            } else if (mx !== 0 || my !== 0) {
              const len = Math.hypot(mx, my);
              const normScale = len > 1 ? 1 / len : 1;
              const effectiveSpeed = BASE_PLAYER_SPEED * buffMultiplier;
              moveVx = mx * normScale * effectiveSpeed;
              moveVy = my * normScale * effectiveSpeed;
              player.lastDx = mx * normScale;
              player.lastDy = my * normScale;
              player.animTime += dt;
            } else {
              player.animTime = 0;
            }

            // Výpočet odporu a odtlačení davu v 1 průchodu přes spatialHash.queryRadius
            let pushX = 0;
            let pushY = 0;
            let totalResistance = 0;

            const crowdNearby = enemySpatialHashRef.current.queryRadius(
              player.x,
              player.y,
              isKrajanekRiding ? (getKrajanekStoneRadius(player) + 20) : (player.radius + 35)
            );
            for (let i = 0; i < crowdNearby.length; i++) {
              const e = crowdNearby[i];
              if (e.isDefeated || e.dead || (e.snackTimer || 0) > 0) continue;

              if (isKrajanekRiding) {
                // Valivý lis: Mobs do not push or drag down the runaway millstone!
                continue;
              }

              const dx = player.x - e.x;
              const dy = player.y - e.y;
              const dist = Math.hypot(dx, dy);
              const collisionReach = player.radius + e.radius;

              if (dist < collisionReach) {
                const overlap = collisionReach - dist;
                if (dist > 0.0001) {
                  const invDist = 1 / dist;
                  pushX += dx * invDist * overlap * PUSH_FORCE;
                  pushY += dy * invDist * overlap * PUSH_FORCE;
                } else {
                  pushX += overlap * PUSH_FORCE;
                }

                let enemyMass = typeof e.mass === 'number' ? e.mass : (e.radius / 15);
                if (e.isAttacking) {
                  enemyMass *= 2; // Efekt lapení hráče při nápřahu
                }
                totalResistance += enemyMass;
              }
            }

            // Aplikace odporu davu na hráčův vstup
            const crowdSpeedMultiplier = isKrajanekRiding
              ? 1
              : Math.max(MIN_SPEED_RATIO, 1 / (1 + totalResistance * DRAG_COEFFICIENT));
            moveVx *= crowdSpeedMultiplier;
            moveVy *= crowdSpeedMultiplier;

            // Omezení velikosti vektoru push na MAX_PUSH_SPEED
            const pushSpeed = Math.hypot(pushX, pushY);
            if (pushSpeed > MAX_PUSH_SPEED) {
              const pushScale = MAX_PUSH_SPEED / pushSpeed;
              pushX *= pushScale;
              pushY *= pushScale;
            }

            // Výsledný posun hráče
            player.x += (moveVx + pushX) * dt;
            player.y += (moveVy + pushY) * dt;

            if (player.type === 'krajanek') {
              const rideActive = player.krajanekRideTimer > 0;
              if (rideActive) {
                enemySpatialHashRef.current.queryCircleInto(player.x, player.y, 280, terrainSpatialResultsRef.current);
              }
              const candidateCount = rideActive ? terrainSpatialResultsRef.current.length : 0;
              const callbacks = {
                onSound: (name: string) => (sound as any)[name]?.(),
                onDamageText: (opts: any) => pushDamageText(engine.texts, opts.x, opts.y, opts.text, opts.color || '#FDE047', true, 'hunterDamage'),
                onCameraShake: (time: number, intensity: number) => {
                  engine.cameraTremorTimer = Math.max(engine.cameraTremorTimer || 0, time);
                  engine.cameraTremorIntensity = intensity;
                },
                onHitstop: (time: number) => {
                  engine.hitstopTimer = Math.max(engine.hitstopTimer || 0, time);
                },
                onFrostBurst: (x: number, y: number) => {
                  const frostColors = ['#A5F3FC', '#38BDF8', '#E0F2FE', '#FFFFFF'];
                  for (let k = 0; k < 12 && engine.particles.length < activeMaxParticlesRef.current; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const spd = 80 + Math.random() * 160;
                    emitParticle(engine.particles, () => ({
                      x,
                      y,
                      vx: Math.cos(a) * spd,
                      vy: Math.sin(a) * spd - 20,
                      life: 0.4 + Math.random() * 0.3,
                      color: frostColors[k % frostColors.length],
                      size: 3 + Math.random() * 3,
                    }));
                  }
                },
                onPinballSparks: (x: number, y: number) => {
                  const sparkColors = ['#FDE047', '#FEF08A', '#F59E0B', '#FFFFFF'];
                  for (let k = 0; k < 22 && engine.particles.length < activeMaxParticlesRef.current; k++) {
                    const a = Math.random() * Math.PI * 2;
                    const spd = 120 + Math.random() * 220;
                    emitParticle(engine.particles, () => ({
                      x,
                      y,
                      vx: Math.cos(a) * spd,
                      vy: Math.sin(a) * spd,
                      life: 0.35 + Math.random() * 0.3,
                      color: sparkColors[k % sparkColors.length],
                      size: 2.5 + Math.random() * 3,
                    }));
                  }
                },
                onSpawnCoastingStone: (stone: any) => {
                  if (!engine.krajanekCoastingStones) engine.krajanekCoastingStones = [];
                  engine.krajanekCoastingStones.push(stone);
                },
                engine,
              };
              const sparkBeat = stepKrajanekRide(player, dt, terrainSpatialResultsRef.current, candidateCount, callbacks);
              if (sparkBeat && engine.particles.length < activeMaxParticlesRef.current) {
                const colors = ['#FDE047', '#FFF7C2', '#F59E0B', '#D1D5DB'];
                for (let i = 0; i < 8 && engine.particles.length < activeMaxParticlesRef.current; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 90 + Math.random() * 150;
                  emitParticle(engine.particles, () => ({
                    x: player.x + Math.cos(angle) * 16,
                    y: player.y + Math.sin(angle) * 16,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 24,
                    life: 0.2 + Math.random() * 0.2,
                    color: colors[i % colors.length],
                    size: 2 + Math.random() * 2.5,
                  }));
                }
              }
            }

            // Step coasting runaway millstones (Phase 4 unguided projectile)
            if (engine.krajanekCoastingStones && engine.krajanekCoastingStones.length > 0) {
              const coastCallbacks = {
                onSound: (name: string) => (sound as any)[name]?.(),
                onDamageText: (opts: any) => pushDamageText(engine.texts, opts.x, opts.y, opts.text, opts.color || '#FDE047', true, 'hunterDamage'),
                onCameraShake: (time: number, intensity: number) => {
                  engine.cameraTremorTimer = Math.max(engine.cameraTremorTimer || 0, time);
                  engine.cameraTremorIntensity = intensity;
                },
              };
              stepKrajanekCoastingStones(engine.krajanekCoastingStones, dt, engine.enemies, coastCallbacks);
            }

            if (moveVx !== 0 || moveVy !== 0) {
              player.facingAngle = Math.atan2(moveVy, moveVx);
            }

            const isMoving = Math.hypot(moveVx, moveVy) > 10;
            if ((player.goatBellStacks || 0) > 0 && isMoving) {
              player.goatBellTimer = (player.goatBellTimer || player.goatBellInterval || 4.0) - dt;
              if (player.goatBellTimer <= 0) {
                player.goatBellTimer = player.goatBellInterval || 4.0;
                const rad = player.goatBellRadius || 180;
                sound.bell();
                pushDamageText(engine.texts, player.x, player.y - 45, 'CINK! 🔔', '#FDE047', true);
                const nearbyFoes = enemySpatialHashRef.current.queryCircle(player.x, player.y, rad);
                for (let bi = 0; bi < nearbyFoes.length; bi++) {
                  const foe = nearbyFoes[bi];
                  if (foe.isDefeated || foe.dead) continue;
                  if (typeof foe.interruptAttack === 'function') foe.interruptAttack();
                  foe.isAttacking = false;
                  foe.windupTimer = 0;
                  foe.strikeTimer = 0;
                  if (foe.aiState === 'windup') foe.aiState = 'idle';
                  pushDamageText(engine.texts, foe.x, foe.y - 25, 'VYRUŠENÍ! 🔔', '#F8FAFC', false);
                }
                if (engine.drops) {
                  for (let di = 0; di < engine.drops.length; di++) {
                    const d = engine.drops[di];
                    if (d.dead || d.rescued) continue;
                    const dist = Math.hypot(d.x - player.x, d.y - player.y);
                    if (dist <= rad + 100) {
                      const ang = Math.atan2(player.y - d.y, player.x - d.x);
                      d.vx = Math.cos(ang) * 380;
                      d.vy = Math.sin(ang) * 380;
                    }
                  }
                }
              }
            }
            if (player.holyCircleStacks && player.holyCircleStacks > 0) {
              const hcRadius = 120 + Math.max(0, (player.holyCircleStacks || 1) - 1) * 20;
              if (!isMoving) {
                player.stillTimer = (player.stillTimer || 0) + dt;
                if (player.stillTimer >= 0.6) {
                  if (!engine.holyCircle) {
                    engine.holyCircle = {
                      x: player.x,
                      y: player.y,
                      radius: hcRadius,
                      life: 1.5,
                      active: true,
                    };
                  } else {
                    engine.holyCircle.x = player.x;
                    engine.holyCircle.y = player.y;
                    engine.holyCircle.radius = hcRadius;
                    engine.holyCircle.life = 1.5;
                    engine.holyCircle.active = true;
                  }
                }
              } else {
                player.stillTimer = 0;
                if (engine.holyCircle) {
                  engine.holyCircle.life -= dt;
                  if (engine.holyCircle.life <= 0) {
                    engine.holyCircle = null;
                  }
                }
              }
            }

            // Holy Chalk Circle unholy barrier & repellent damage (10 Hz spatial check, full-rate contact push)
            if (engine.holyCircle && engine.holyCircle.active) {
              const hc = engine.holyCircle as any;
              hc._scanTimer = (hc._scanTimer || 0) + dt;
              if (hc._scanTimer >= 0.1 || !hc._cachedUnholy) {
                hc._scanTimer = 0;
                hc._cachedUnholy = enemySpatialHashRef.current.queryCircle(hc.x, hc.y, hc.radius + 60);
              }
              const nearbyUnholy = hc._cachedUnholy;
              for (let ui = 0; ui < nearbyUnholy.length; ui++) {
                const foe = nearbyUnholy[ui];
                if (foe.isDefeated || foe.dead || !isUnholyEnemy(foe)) continue;
                const dx = foe.x - hc.x;
                const dy = foe.y - hc.y;
                const dist = Math.hypot(dx, dy);
                const reach = hc.radius + (foe.radius || 15);
                if (dist < reach) {
                  if (!hasTerrainLineOfSight(hc.x, hc.y, foe.x, foe.y, engine.activeLevelId ?? 0, engine.decor)) continue;
                  const nx = dist > 0.001 ? dx / dist : 1;
                  const ny = dist > 0.001 ? dy / dist : 0;
                  const holyPush = getHolyPushMultiplier(foe);
                  const pushForce = 380 * holyPush;
                  foe.kbx += nx * pushForce * dt * 10;
                  foe.kby += ny * pushForce * dt * 10;
                  const overlap = reach - dist;
                  foe.x += nx * overlap * Math.min(1, dt * 15);
                  foe.y += ny * overlap * Math.min(1, dt * 15);

                  foe._holyCircleTick = (foe._holyCircleTick || 0) - dt;
                  if (foe._holyCircleTick <= 0) {
                    foe._holyCircleTick = 0.4;
                    const holyDmgMult = getHolyDamageMultiplier(foe);
                    const baseHolyDmg = 24 + Math.max(0, (player.holyCircleStacks || 1) - 1) * 12;
                    const dmg = baseHolyDmg * holyDmgMult * (player.damageMultiplier || 1);
                    foe.takeDamage(dmg, 'holy', nx * 180 * holyPush, ny * 180 * holyPush);
                    pushDamageText(engine.texts, foe.x, foe.y - 30, 'POSVÁTNÝ ODRAZ! ✝️', '#FDE047', false);
                  }
                }
              }
            }

            if (player.intangibleTimer > 0) {
              const moveDist = Math.hypot(moveVx, moveVy);
              if (moveDist > 20 && Math.random() < 0.25) {
                if (!engine.sootFootprints) engine.sootFootprints = [];
                engine.sootFootprints.push({
                  x: player.x,
                  y: player.y,
                  life: 3.0,
                  angle: Math.atan2(moveVy, moveVx),
                });
              }
              player._sootScanTimer = (player._sootScanTimer || 0) + dt;
              if (player._sootScanTimer >= 0.1 || !player._cachedSootEnemies) {
                player._sootScanTimer = 0;
                player._cachedSootEnemies = enemySpatialHashRef.current.queryCircle(player.x, player.y, player.radius + 35);
              }
              const enemiesNearby = player._cachedSootEnemies;
              for (const e of enemiesNearby) {
                if (e.dead || e.isDefeated) continue;
                if (Math.hypot(e.x - player.x, e.y - player.y) < player.radius + e.radius) {
                  if ((e.sootBlindedVolleys || 0) < 3) {
                    e.sootBlindedVolleys = 3;
                    pushDamageText(engine.texts, e.x, e.y - 30, 'SAZE V OČÍCH! 🔘💨', '#FDE047', true);
                    const currentPerf = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
                    tryEmitParticleBurst(engine.particles, 6, () => ({
                      x: e.x + (Math.random() - 0.5) * 16,
                      y: e.y + (Math.random() - 0.5) * 16,
                      vx: (Math.random() - 0.5) * 90,
                      vy: (Math.random() - 0.5) * 90,
                      life: 0.35,
                      color: '#1C1917',
                      size: 3.5,
                    }), currentPerf);
                  }
                }
              }
            }

            // Periodic spatial scan for frost aura healing multiplier (runs at 4 Hz instead of 60 Hz)
            (player as any).activeLevelId = engine.activeLevelId ?? 0;
            (player as any).decor = engine.decor;
            player._frostAuraScanTimer = (player._frostAuraScanTimer || 0) + dt;
            if (player._frostAuraScanTimer >= 0.25 || player._cachedFrostHealMult === undefined) {
              player._frostAuraScanTimer = 0;
              player._cachedFrostHealMult = getFrostAuraHealingMultiplier(
                player,
                enemySpatialHashRef.current.queryCircle(player.x, player.y, FROSTLING_AURA_RADIUS),
                engine.activeLevelId ?? 0,
                engine.decor
              );
            }

            // Level 0 is a hand-composed, asymmetric map rather than a flat
            // decoration field.  These local rules intentionally run after
            // movement so every POI remains a readable, opt-in playstyle.
            if (engine.activeLevelId === 0) {
              const thaw = engine.marchThaw as any;
              thaw.bellCooldown = Math.max(0, thaw.bellCooldown - dt);
              thaw.shrineCooldown = Math.max(0, thaw.shrineCooldown - dt);
              thaw.kegCooldown = Math.max(0, thaw.kegCooldown - dt);
              thaw.terrainHazardTimer = (thaw.terrainHazardTimer || 0) + dt;
              const shouldTickTerrainHazards = thaw.terrainHazardTimer >= 0.25;
              const terrainHazardDt = shouldTickTerrainHazards ? thaw.terrainHazardTimer : 0;
              if (shouldTickTerrainHazards) thaw.terrainHazardTimer = 0;

              const inChurch = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.church);
              const activeForestZone = getActiveMarchForestZone(player.x, player.y);
              const inForest = Boolean(activeForestZone);
              const inTavern = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.tavern);
              const inVillage = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.village);
              const inSchool = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.school);
              const inShrine = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.shrine);
              const inFields = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.fields);
              const inMill = isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.mill);

              // 1. KOSTEL & LES: Armor & regeneration bonuses
              player.arenaArmorBonus = (inChurch ? 0.20 : 0) + (inForest ? 0.15 : 0);
              if (inChurch) {
                player.hp = Math.min(player.maxHp, player.hp + 2.2 * dt * (player._cachedFrostHealMult ?? 1));
              }

              // 2. HOSPODA & LES: Tactical damage aura (Hospodská kuráž +18 %, Lesní krytí +15 %)
              const baseDmgMult = (player as any)._baseMarchDmgMult ?? ((player as any)._baseMarchDmgMult = player.damageMultiplier || 1);
              player.damageMultiplier = baseDmgMult * (1 + (inTavern ? 0.18 : 0) + (inForest ? 0.15 : 0));

              // 3. VESNICE: Čapí štěstí (+16 % movement speed & 2x faster Ultimate ability cooldown)
              if (inVillage) {
                player.x += moveVx * 0.16 * dt;
                player.y += moveVy * 0.16 * dt;
                if (player.ultCd > 0) {
                  player.ultCd = Math.max(0, player.ultCd - dt);
                }
              }

              // 4. ŠKOLA & BOŽÍ MUKA: Faster weapon cooldowns (+20 % cadence) & Školní rákoska pulse
              if ((inSchool || inShrine) && player.weapons) {
                for (let wi = 0; wi < player.weapons.length; wi++) {
                  const w = player.weapons[wi];
                  if (w && w.cd > 0) {
                    w.cd = Math.max(0, w.cd - dt * 0.22);
                  }
                }
              }
              if (inSchool) {
                thaw.schoolPulseTimer = (thaw.schoolPulseTimer || 0) + dt;
                if (thaw.schoolPulseTimer >= 5.5) {
                  thaw.schoolPulseTimer = 0;
                  const nearSchoolFoes = enemySpatialHashRef.current.queryCircleInto(
                    MARCH_THAW_POIS.school.x,
                    MARCH_THAW_POIS.school.y,
                    260,
                    terrainSpatialResultsRef.current,
                  );
                  let hitCount = 0;
                  for (let i = 0; i < nearSchoolFoes.length; i++) {
                    const enemy = nearSchoolFoes[i];
                    if (!enemy.dead && !enemy.isDefeated && Math.hypot(enemy.x - player.x, enemy.y - player.y) < 250) {
                      enemy.takeDamage(42 * (player.damageMultiplier || 1), 'physical', 90, 0);
                      enemy.slowTimer = Math.max(enemy.slowTimer || 0, 2.5);
                      hitCount++;
                    }
                  }
                  if (hitCount > 0) {
                    pushDamageText(engine.texts, MARCH_THAW_POIS.school.x, MARCH_THAW_POIS.school.y - 60, '📏 ŠKOLNÍ RÁKOSKA!', '#FDE047', true, 'combatStates');
                  }
                }
              }

              // 5. RYBNÍK A ŘEKA: Smart Ice Floes vs. Deep River/Pond Water
              // - On ice floe (onFloe): carried smoothly + 20% sliding speed boost & protected from freezing water.
              // - In open water off the floes (inOpenWater): VERY STRONG SLOW (-72% in river, -68% in pond) + current drag & cold exposure.
              const waterFloe = getMarchWaterAndFloeEffect(player.x, player.y, engine.uiTime);
              if (waterFloe.onFloe) {
                thaw.floeExposure = Math.max(0, thaw.floeExposure - dt * 2.5);
                player.x += (waterFloe.carryVx + moveVx * 0.20) * dt;
                player.y += (waterFloe.carryVy + moveVy * 0.20) * dt;
              } else if (waterFloe.inOpenWater) {
                thaw.floeExposure += dt;
                const slowDrag = 1 - waterFloe.speedMultiplier; // 0.72 in river, 0.68 in pond
                player.x += (waterFloe.carryVx - moveVx * slowDrag) * dt;
                player.y += (waterFloe.carryVy - moveVy * slowDrag) * dt;
                if (thaw.floeExposure > 4.0) {
                  thaw.floeExposure = 0;
                  player.takeDamage(7, 'cold');
                  pushDamageText(engine.texts, player.x, player.y - 35, 'LEDOVÁ VODA! ❄️', '#BDEAF7', true, 'hunterDamage');
                }
              } else {
                thaw.floeExposure = Math.max(0, thaw.floeExposure - dt * 2);
              }

              // 6. KAPLIČKA: Zjevení Panny Marie s Ježíškem (brief 4.2s apparition: starts small, grows larger while scattering bubáci, then vanishes)
              let bubakNearShrine = false;
              if (inShrine && thaw.shrineCooldown <= 0) {
                const nearShrineFoes = enemySpatialHashRef.current.queryCircleInto(
                  MARCH_THAW_POIS.shrine.x,
                  MARCH_THAW_POIS.shrine.y,
                  250,
                  terrainSpatialResultsRef.current,
                );
                for (let si = 0; si < nearShrineFoes.length; si++) {
                  const sf = nearShrineFoes[si];
                  if (!sf.dead && !sf.isDefeated) {
                    bubakNearShrine = true;
                    break;
                  }
                }
              }
              if (inShrine && bubakNearShrine) {
                thaw.shrineCharge += dt * 1.35;
                if (thaw.shrineCharge >= 1.6 && thaw.shrineCooldown <= 0) {
                  thaw.shrineCharge = 0;
                  thaw.shrineCooldown = MARCH_MARIAN_APPARITION_COOLDOWN;
                  thaw.apparitionTimer = 4.2;
                  thaw.apparitionPulseTimer = 0;
                  player.hp = Math.min(player.maxHp, player.hp + 18 * (player._cachedFrostHealMult ?? 1));
                  const count = enemySpatialHashRef.current.queryCircleInto(
                    MARCH_THAW_POIS.shrine.x,
                    MARCH_THAW_POIS.shrine.y,
                    580,
                    terrainSpatialResultsRef.current,
                  );
                  for (let i = 0; i < count.length; i++) {
                    const enemy = terrainSpatialResultsRef.current[i];
                    const dx = enemy.x - MARCH_THAW_POIS.shrine.x;
                    const dy = enemy.y - MARCH_THAW_POIS.shrine.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    if (!enemy.dead && !enemy.isDefeated && dist < 560 + (enemy.radius || 0)) {
                      enemy.takeDamage(145 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 540, (dy / dist) * 540);
                      enemy.panicked = true;
                      enemy.panicTimer = Math.max(enemy.panicTimer || 0, 5.0);
                    }
                  }
                  engine.lightningFlash = Math.max(engine.lightningFlash, 0.35);
                  pushDamageText(engine.texts, MARCH_THAW_POIS.shrine.x, MARCH_THAW_POIS.shrine.y - 110, '✦ ZJEVENÍ PANNY MARIE S JEŽÍŠKEM!', '#FEF08A', true, 'bossAnnouncements');
                  sound.bell();
                }
              } else {
                thaw.shrineCharge = Math.max(0, thaw.shrineCharge - dt * 1.5);
              }

              if ((thaw.apparitionTimer || 0) > 0) {
                thaw.apparitionTimer = Math.max(0, thaw.apparitionTimer - dt);
                thaw.apparitionPulseTimer = (thaw.apparitionPulseTimer || 0) + dt;
                if (thaw.apparitionPulseTimer >= 0.45) {
                  thaw.apparitionPulseTimer = 0;
                  const growFrac = Math.min(1, Math.max(0.25, (4.2 - thaw.apparitionTimer) / 3.2));
                  const activeReach = 220 + 340 * growFrac;
                  const nearApparition = enemySpatialHashRef.current.queryCircleInto(
                    MARCH_THAW_POIS.shrine.x,
                    MARCH_THAW_POIS.shrine.y,
                    activeReach + 30,
                    terrainSpatialResultsRef.current,
                  );
                  for (let i = 0; i < nearApparition.length; i++) {
                    const enemy = nearApparition[i];
                    if (enemy.dead || enemy.isDefeated) continue;
                    const dx = enemy.x - MARCH_THAW_POIS.shrine.x;
                    const dy = enemy.y - MARCH_THAW_POIS.shrine.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    if (dist < activeReach + (enemy.radius || 0)) {
                      enemy.takeDamage(28 * (player.damageMultiplier || 1), 'holy', (dx / dist) * 320, (dy / dist) * 320);
                      enemy.panicked = true;
                      enemy.panicTimer = Math.max(enemy.panicTimer || 0, 3.2);
                    }
                  }
                }
              }

              // 7. HORNÍ POLE & MLÝN: Furrow speed + Golden Seed + Plough hazard + Millwheel & Flour cloud
              if (inFields) {
                player.x += moveVx * 0.15 * dt;
                player.y += moveVy * 0.15 * dt;
                thaw.fieldSeedTimer = (thaw.fieldSeedTimer || 0) + dt;
                if (thaw.fieldSeedTimer >= 6.5) {
                  thaw.fieldSeedTimer = 0;
                  player.hp = Math.min(player.maxHp, player.hp + 3 * (player._cachedFrostHealMult ?? 1));
                  pushDamageText(engine.texts, player.x, player.y - 42, '🌾 ZLATÉ ZRNÍ! +3 Kuráž', '#FACC15', false, 'healing');
                }
              }
              if (inMill) {
                if (isInsideMarchPoi(player.x, player.y, MARCH_THAW_POIS.mill, -40)) {
                  player.y += 45 * dt;
                }
                thaw.millFlourTimer = (thaw.millFlourTimer || 0) + dt;
                if (thaw.millFlourTimer >= 6.0) {
                  thaw.millFlourTimer = 0;
                  const nearMillFoes = enemySpatialHashRef.current.queryCircleInto(
                    MARCH_THAW_POIS.mill.x,
                    MARCH_THAW_POIS.mill.y,
                    260,
                    terrainSpatialResultsRef.current,
                  );
                  for (let i = 0; i < nearMillFoes.length; i++) {
                    const enemy = nearMillFoes[i];
                    if (!enemy.dead && !enemy.isDefeated) {
                      enemy.stunTimer = Math.max(enemy.stunTimer || 0, 1.4);
                    }
                  }
                  player.hp = Math.min(player.maxHp, player.hp + 2 * (player._cachedFrostHealMult ?? 1));
                  pushDamageText(engine.texts, MARCH_THAW_POIS.mill.x, MARCH_THAW_POIS.mill.y - 55, '💨 MOUČNÝ PRACH!', '#F8FAFC', false, 'combatStates');
                }
              }

              const ploughY = MARCH_THAW_POIS.fields.y + Math.sin(engine.uiTime * 0.62) * 68;
              const playerInPlough = Math.abs(player.y - ploughY) < 38 && Math.abs(player.x - MARCH_THAW_POIS.fields.x) < 185;
              if (playerInPlough) {
                player.ploughHitCooldown = Math.max(0, (player.ploughHitCooldown || 0) - dt);
                if (player.ploughHitCooldown <= 0) {
                  player.ploughHitCooldown = 0.8;
                  player.takeDamage(12, 'physical');
                  pushDamageText(engine.texts, player.x, player.y - 35, 'POZOR, SPŘEŽENÍ!', '#B45309', true);
                }
              }
              if (shouldTickTerrainHazards) {
                const nearMill = enemySpatialHashRef.current.queryCircleInto(
                  MARCH_THAW_POIS.mill.x,
                  MARCH_THAW_POIS.mill.y,
                  MARCH_THAW_POIS.mill.radius - 35,
                  terrainSpatialResultsRef.current,
                );
                for (let i = 0; i < nearMill.length; i++) {
                  const enemy = nearMill[i];
                  if (!enemy.dead && !enemy.isDefeated && isInsideMarchPoi(enemy.x, enemy.y, MARCH_THAW_POIS.mill, -35)) {
                    enemy.takeDamage(52 * terrainHazardDt, 'physical', (enemy.x - MARCH_THAW_POIS.mill.x) * 2, 35, { allowFractionalDamage: true });
                  }
                }

                const nearPlough = enemySpatialHashRef.current.queryCircleInto(
                  MARCH_THAW_POIS.fields.x,
                  ploughY,
                  210,
                  terrainSpatialResultsRef.current,
                );
                for (let i = 0; i < nearPlough.length; i++) {
                  const enemy = nearPlough[i];
                  const isAirborne = Boolean((enemy.isFlying || enemy.id === 'vrana') && !enemy.isGroundedForLoot);
                  if (!enemy.dead && !enemy.isDefeated && !isAirborne && Math.abs(enemy.y - ploughY) < 34 && Math.abs(enemy.x - MARCH_THAW_POIS.fields.x) < 200) {
                    enemy.takeDamage(32 * terrainHazardDt, 'physical', 210, 15, { allowFractionalDamage: true });
                  }
                }

                // Non-aquatic enemies wading in the freezing pond take cold damage
                const nearPond = enemySpatialHashRef.current.queryCircleInto(
                  MARCH_THAW_POIS.pond.x,
                  MARCH_THAW_POIS.pond.y,
                  MARCH_THAW_POIS.pond.radius,
                  terrainSpatialResultsRef.current,
                );
                for (let i = 0; i < nearPond.length; i++) {
                  const enemy = nearPond[i];
                  if (!enemy.dead && !enemy.isDefeated && !enemy.isFlying && enemy.id !== 'vrana' && !isAquaticEnemy(enemy)) {
                    const eff = getMarchWaterAndFloeEffect(enemy.x, enemy.y, engine.uiTime);
                    if (eff.inOpenWater && eff.waterZone === 'pond') {
                      enemy.takeDamage(8 * terrainHazardDt, 'cold', 0, 0, { allowFractionalDamage: true });
                    }
                  }
                }
              }

              // 8. HUSTÝ LES (All 4 larger forests can spawn enemies + bush ambushes when player enters any forest)
              if (activeForestZone) {
                thaw.forestAmbushCooldown = (thaw.forestAmbushCooldown !== undefined ? thaw.forestAmbushCooldown : 8) - dt;
                if (thaw.forestAmbushCooldown <= 0) {
                  thaw.forestAmbushCooldown = 16;
                  const ang1 = Math.random() * Math.PI * 2;
                  const ang2 = ang1 + Math.PI * 0.7;
                  const p1 = sanitizeArenaSpawnPoint(player.x + Math.cos(ang1) * 240, player.y + Math.sin(ang1) * 240, 20, 0, engine.decor, 48);
                  const p2 = sanitizeArenaSpawnPoint(player.x + Math.cos(ang2) * 240, player.y + Math.sin(ang2) * 240, 20, 0, engine.decor, 48);
                  const e1 = createEnemyInstance('mysak', p1.x, p1.y, 0.75);
                  const e2 = createEnemyInstance('sotek', p2.x, p2.y, 0.75);
                  engine.enemies.push(e1, e2);
                  pushDamageText(engine.texts, player.x, player.y - 35, 'PŘEPAD Z HOUŠTIN! 🌲🐾', '#84CC16', true, 'directorWarningBanners');
                }
              }

              // Periodic hunting packs emerging from all 4 larger forests throughout Stage 1
              thaw.forestPackTimer = (thaw.forestPackTimer !== undefined ? thaw.forestPackTimer : 11) - dt;
              if (thaw.forestPackTimer <= 0 && engine.enemies.length < 48) {
                thaw.forestPackTimer = 14;
                thaw.forestSpawnSeed = (thaw.forestSpawnSeed || 0) + 1;
                const spawnPt = pickMarchForestSpawnPoint(player.x, player.y, thaw.forestSpawnSeed);
                const forestPool = ['mrazovy_skritek', 'vrana', 'mysak', 'sotek'];
                const pick1 = forestPool[thaw.forestSpawnSeed % forestPool.length];
                const pick2 = forestPool[(thaw.forestSpawnSeed + 1) % forestPool.length];
                const fp1 = sanitizeArenaSpawnPoint(spawnPt.x - 24, spawnPt.y - 18, 20, 0, engine.decor, 48);
                const fp2 = sanitizeArenaSpawnPoint(spawnPt.x + 24, spawnPt.y + 18, 20, 0, engine.decor, 48);
                const fe1 = createEnemyInstance(pick1, fp1.x, fp1.y, 0.8);
                const fe2 = createEnemyInstance(pick2, fp2.x, fp2.y, 0.8);
                engine.enemies.push(fe1, fe2);
              }

              // Impassable cottages (chalupy), church walls, school, millhouse, dense forest & outer arena border
              resolveMarchThawObstacles(player, false);

              // Interaktivní vesnické objekty: Babiččina kamna a dřevěná Káča
              for (const dec of engine.decor) {
                dec.animTime = (dec.animTime || 0) + dt;
                if (dec.type === 'kaca') {
                  const distP = Math.hypot(player.x - dec.x, player.y - dec.y);
                  if (distP < player.radius + dec.radius) {
                    const dx = dec.x - player.x || 1;
                    const dy = dec.y - player.y || 0;
                    const len = Math.hypot(dx, dy) || 1;
                    dec.vx = (dx / len) * 250;
                    dec.vy = (dy / len) * 250;
                  }
                  dec.x += (dec.vx || 0) * dt;
                  dec.y += (dec.vy || 0) * dt;
                  dec.vx = (dec.vx || 0) * Math.max(0, 1 - 2.5 * dt);
                  dec.vy = (dec.vy || 0) * Math.max(0, 1 - 2.5 * dt);
                  clampToMarchArenaBounds(dec);
                  if (Math.hypot(dec.vx, dec.vy) > 40) {
                    const nearbyEnemies = enemySpatialHashRef.current.queryCircleInto(
                      dec.x,
                      dec.y,
                      dec.radius + 80,
                      terrainSpatialResultsRef.current,
                    );
                    for (let i = 0; i < nearbyEnemies.length; i++) {
                      const enemy = nearbyEnemies[i];
                      if (!enemy.dead && !enemy.isDefeated && Math.hypot(enemy.x - dec.x, enemy.y - dec.y) < enemy.radius + dec.radius) {
                        enemy.takeDamage(24, 'physical', dec.vx * 1.5, dec.vy * 1.5);
                        dec.vx *= -0.5;
                        dec.vy *= -0.5;
                      }
                    }
                  }
                } else if (dec.type === 'granny_stove') {
                  const dx = player.x - dec.x;
                  const dy = player.y - dec.y;
                  const dist = Math.hypot(dx, dy);
                  const reach = player.radius + dec.radius;
                  if (dist < reach && dist > 0.001) {
                    const overlap = reach - dist;
                    player.x += (dx / dist) * overlap;
                    player.y += (dy / dist) * overlap;
                  }
                  if (dist < reach + 20) {
                    player.hp = Math.min(player.maxHp, player.hp + 2.5 * dt * (player._cachedFrostHealMult ?? 1));
                  }
                }
              }

              if (thaw.beerPuddle) {
                thaw.beerPuddle.time -= dt;
                if (thaw.beerPuddle.time <= 0) thaw.beerPuddle = null;
                else if (shouldTickTerrainHazards) {
                  const nearbyEnemies = enemySpatialHashRef.current.queryCircleInto(
                    thaw.beerPuddle.x,
                    thaw.beerPuddle.y,
                    100,
                    terrainSpatialResultsRef.current,
                  );
                  for (let i = 0; i < nearbyEnemies.length; i++) {
                    const enemy = nearbyEnemies[i];
                    const dx = enemy.x - thaw.beerPuddle.x; const dy = enemy.y - thaw.beerPuddle.y;
                    if (!enemy.dead && !enemy.isDefeated && dx * dx + dy * dy < 100 * 100) {
                      enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.28);
                    }
                  }
                }
              }
            } else {
              player.arenaArmorBonus = 0;
            }

            if (player.soulBuffTimer > 0) player.soulBuffTimer -= dt;
            if (player.gingerbreadSpeedTimer > 0) player.gingerbreadSpeedTimer -= dt;
            if ((player.pistalkaSpeedTimer || 0) > 0) player.pistalkaSpeedTimer = Math.max(0, player.pistalkaSpeedTimer - dt);
            if ((player.zPeklaStestiTimer || 0) > 0) player.zPeklaStestiTimer = Math.max(0, player.zPeklaStestiTimer - dt);
            if (player.waterSoakedTimer > 0) player.waterSoakedTimer -= dt;
            if (player.type === 'krajanek' && player.krajanekRideTimer > 0) {
              player.meltingPuddleSlowTimer = 0;
              player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, player.krajanekRideTimer);
            } else if (player.meltingPuddleSlowTimer > 0) {
              player.meltingPuddleSlowTimer = player.iceImmunity ? 0 : player.meltingPuddleSlowTimer - dt;
            }
            if (player.slowTimer > 0) {
              player.slowTimer = player.iceImmunity ? 0 : player.slowTimer - dt;
            }
            if (player.ultCd > 0 && !isPlayerAbilityActive(player, engineRef.current)) player.ultCd -= dt * (1 + ((metaRef.current.bellLevel || 0) * 0.08));
            if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer -= dt;
            if ((player.hurtTimer || 0) > 0) player.hurtTimer = Math.max(0, player.hurtTimer - dt);
            if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;

            if (engine.plumPuddles && engine.plumPuddles.length > 0) {
              for (let pi = engine.plumPuddles.length - 1; pi >= 0; pi--) {
                engine.plumPuddles[pi].life -= dt;
                if (engine.plumPuddles[pi].life <= 0) {
                  engine.plumPuddles.splice(pi, 1);
                }
              }
            }

            if (player.type === 'korenarka') {
              player.herbBoostTimer = Math.max(0, (player.herbBoostTimer || 0) - dt);
              const accessibilityLevel = Math.max(0, Math.min(10, player.accessibilityAppliedLevel || 0));
              const accessibilityMultiplier = 1 + accessibilityLevel * 0.05;
              const baseMagnetRadius = player.accessibilityBasePickupRadius ?? player.pickupRadius;
              player.pickupRadius = baseMagnetRadius * accessibilityMultiplier * (player.herbBoostTimer > 0 ? 5 : 1);
              player.herbTimer = (player.herbTimer || 0) + dt;
              if (player.herbTimer >= 9) {
                player.herbTimer = 0;
                const hpBefore = player.hp;
                player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.18 * (player._cachedFrostHealMult ?? 1));
                const actualHeal = Math.max(0, player.hp - hpBefore);
                player.herbBoostTimer = 3;
                player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, 3);
                player.pickupRadius = baseMagnetRadius * accessibilityMultiplier * 5;
                pushDamageText(engine.texts, player.x, player.y - 58, '🌿 BYLINNÝ ZÁBLESK! MAGNET ×5 · 3 s NEZRANITELNOST', COLORS.green, true, 'healing');
                if (actualHeal > 0) {
                  pushDamageText(engine.texts, player.x, player.y - 36, '+' + Math.round(actualHeal) + ' Kuráž', COLORS.green, false, 'healing');
                }
                sound.potion();
              }
            }

            // Player regeneration (+2 Kuráže per 5s per level from Bylinková zahrádka)
      if ((player as any).bearMaskLevel > 0) {
        const mask = player as any;
        const heals: Array<{ amount: number; timer?: string }> = [];
        if (player.regenLevel > 0 && player.hp < player.maxHp) {
          player.regenTimer += dt;
          if (player.regenTimer >= 5) {
            heals.push({ amount: player.regenLevel * 4, timer: 'regenTimer' });
          }
        }
        if (heals.length > 0) {
          for (const heal of heals) {
            applyBearMaskOverheal(player, heal.amount);
            if (heal.timer === 'regenTimer') player.regenTimer = 0;
            if (heal.timer === 'herbTimer') player.herbTimer = 0;
            pushDamageText(engine.texts, player.x, player.y - 40, '+' + heal.amount + ' 🌿', COLORS.green, false, 'healing');
          }
        }
      } else if (player.regenLevel > 0 && player.hp < player.maxHp) {
              player.regenTimer += dt;
              if (player.regenTimer >= 5) {
                player.hp = Math.min(player.maxHp, player.hp + player.regenLevel * 4 * (player._cachedFrostHealMult ?? 1));
                player.regenTimer = 0;
                pushDamageText(engine.texts, player.x, player.y - 40, `+${player.regenLevel * 4} 🌿`, COLORS.green, false, 'healing');
              }
            }
            // Kořenářka's timed passive runs independently of the optional garden regeneration above.

            // Zoufalá kuráž visual feedback & aura
            const kurazRatioNow = player.maxHp > 0 ? player.hp / player.maxHp : 1;
            const tavernLvl = player.tavernShieldLevel || 0;
            if (tavernLvl > 0 && kurazRatioNow <= 0.35) {
              if (!player._inZoufalaKurazState) {
                player._inZoufalaKurazState = true;
                pushDamageText(engine.texts, player.x, player.y - 50, '🍺 ZOUFALÁ KURÁŽ!', '#F97316', true, 'combatShouts');
                sound.levelUp();
              }
              player._zoufalaParticleTimer = (player._zoufalaParticleTimer || 0) + dt;
              if (player._zoufalaParticleTimer >= 0.25) {
                player._zoufalaParticleTimer = 0;
                emitParticle(engine.particles, {
                  x: player.x + (Math.random() - 0.5) * 24,
                  y: player.y + (Math.random() - 0.5) * 24,
                  vx: (Math.random() - 0.5) * 40,
                  vy: -30 - Math.random() * 30,
                  life: 0.45,
                  color: '#EA580C',
                  size: 3.5,
                }, activeMaxParticlesRef.current);
              }
            } else {
              player._inZoufalaKurazState = false;
            }

            // Night Watchman passive holy aura (throttled to 4 ticks/sec instead of 60 ticks/sec to prevent damage text flood)
            if (player.type === 'ponocny' || player.type === 'watchman') {
              player.watchmanAuraTimer = (player.watchmanAuraTimer || 0) - dt;
              if (player.watchmanAuraTimer <= 0) {
                player.watchmanAuraTimer = 0.25;
                const nearby = enemySpatialHashRef.current.queryCircle(player.x, player.y, 85 + 40);
                for (let i = 0; i < nearby.length; i++) {
                  const e = nearby[i];
                  if (e.isDefeated) continue;
                  const dx = player.x - e.x, dy = player.y - e.y, reach = 85 + e.radius;
                  if (dx * dx + dy * dy < reach * reach) {
                    if (!hasTerrainLineOfSight(player.x, player.y, e.x, e.y, engine.activeLevelId ?? 0, engine.decor)) continue;
                    const holyMult = getHolyDamageMultiplier(e);
                    e.takeDamage(4 * player.damageMultiplier * holyMult, 'holy', 0, 0);
                  }
                }
              }
            }

            // Hromnička flickering light aura: continuous gentle outward push resisted by Fear resist (10 Hz spatial check, full-rate contact push)
            const hromnickaWp = (player as any)._hromnickaWeapon;
            if (hromnickaWp) {
              if (player.hromnickaPulseTimer > 0) player.hromnickaPulseTimer -= dt;
              const auraReach = 135 + hromnickaWp.level * 15;
              player._hromnickaScanTimer = (player._hromnickaScanTimer || 0) + dt;
              if (player._hromnickaScanTimer >= 0.1 || !player._cachedHromnickaNearby) {
                player._hromnickaScanTimer = 0;
                player._cachedHromnickaNearby = enemySpatialHashRef.current.queryCircle(player.x, player.y, auraReach + 40);
              }
              const nearby = player._cachedHromnickaNearby;
              for (let i = 0; i < nearby.length; i++) {
                const e = nearby[i];
                if (e.isDefeated) continue;
                const dx = e.x - player.x, dy = e.y - player.y, distSq = dx * dx + dy * dy, reach = auraReach + e.radius;
                if (distSq < reach * reach && distSq > 0.000001) {
                  if (!hasTerrainLineOfSight(player.x, player.y, e.x, e.y, engine.activeLevelId ?? 0, engine.decor)) continue;
                  const dist = Math.sqrt(distSq);
                  const dirX = (e.x - player.x) / dist;
                  const dirY = (e.y - player.y) / dist;
                  const holyPush = getHolyPushMultiplier(e);
                  // Gentle continuous repulsion away from blessed light, resisted by Fear resist & poise
                  const pushSpeed = (52 + hromnickaWp.level * 6) * holyPush;
                  e.x += dirX * pushSpeed * dt;
                  e.y += dirY * pushSpeed * dt;
                }
              }
            }

            // Update persistent orbit angle, obstacle bounce reversal, and slow aura for Válečnice.
            const valecniceWeapon = (player as any)._valecniceWeapon;
            if (valecniceWeapon) {
              const stats = (valecniceWeapon as any)._cachedStats || ((valecniceWeapon as any)._cachedStats = getRankedWeaponStats('valecnice', valecniceWeapon.level, valecniceWeapon));
              const orbitRadius = 115 * stats.areaRadiusMult;
              player._valecniceSlowRadius = orbitRadius * 1.15;
              const orbitSpeed = valecniceWeapon.level >= 3 ? 2.5 : 2.2;
              if (typeof (player as any).valecniceOrbitDir !== 'number' || (player as any).valecniceOrbitDir === 0) {
                (player as any).valecniceOrbitDir = 1;
              }
              if (((player as any)._valecniceBounceCd || 0) > 0) {
                (player as any)._valecniceBounceCd = Math.max(0, (player as any)._valecniceBounceCd - dt);
              }
              player.valecniceAngle = ((player.valecniceAngle || 0) + dt * orbitSpeed * (player as any).valecniceOrbitDir + Math.PI * 4) % (Math.PI * 2);

              if (((player as any)._valecniceBounceCd || 0) <= 0) {
                const count = Math.max(1, 1 + stats.projectileCount);
                const levelId = engine.activeLevelId ?? 0;
                for (let vi = 0; vi < count; vi++) {
                  const ang = player.valecniceAngle + (vi * Math.PI * 2) / count;
                  const ox = player.x + Math.cos(ang) * orbitRadius;
                  const oy = player.y + Math.sin(ang) * orbitRadius;
                  const hit = collideCircleWithObstacles(ox, oy, 20, levelId, engine.decor);
                  if (hit.hit) {
                    (player as any).valecniceOrbitDir *= -1;
                    (player as any)._valecniceBounceCd = 0.22;
                    player.valecniceAngle = ((player.valecniceAngle || 0) + dt * orbitSpeed * (player as any).valecniceOrbitDir * 2 + Math.PI * 4) % (Math.PI * 2);
                    sound.hit();
                    for (let sp = 0; sp < 4; sp++) {
                      const sAng = Math.random() * Math.PI * 2;
                      emitParticle(engine.particles, () => ({
                        x: hit.x,
                        y: hit.y,
                        vx: Math.cos(sAng) * 70,
                        vy: Math.sin(sAng) * 70 - 15,
                        life: 0.28,
                        color: sp % 2 === 0 ? '#D97706' : '#FEF08A',
                        size: 3,
                      }));
                    }
                    break;
                  }
                }
              }
            } else {
              player._valecniceSlowRadius = 0;
            }

            if ((player.pivniTacekTimer || 0) > 0) {
              player.pivniTacekTimer = Math.max(0, player.pivniTacekTimer - dt);
            }

            // Fire weapons
            for (const w of player.weapons) {
              if (player.type === 'krajanek' && player.krajanekRideTimer > 0) continue;
              w.cd -= dt;
              if (w.cd <= 0) {
                const wDef = WEAPONS[w.id];
                if (wDef) {
                  if (!w.mastery) w.mastery = createWeaponMasteryState();
                  (player as any)._firingWeapon = w;
                  const fired = wDef.fire(player, w.level);
                  (player as any)._firingWeapon = null;
                  const rankDef = getWeaponRankDef(w.id, w.level);
                  const weaponCooldownBonus = getWeaponActiveCooldownBonus(w, rankDef);
                  const movingBonus = isMoving ? (player.movingCooldownBonus || 0) : 0;
                  const ctyrlistekBonus = (player.jetelovyCtyrlistekStacks || 0) > 0 && (player.luck || 100) > 100
                    ? (player.luck - 100) * 0.0015 * player.jetelovyCtyrlistekStacks
                    : 0;
                  const playerCooldownBonus = typeof player.cooldownBonus === 'number'
                    ? Math.max(0, player.cooldownBonus + movingBonus + ctyrlistekBonus)
                    : Math.max(0, ((player.cooldownMultiplier || 1) - 1) / 0.9 + movingBonus + ctyrlistekBonus);
                  const baseCd = wDef.baseCd;
                  const formulaCd = getEffectiveWeaponCooldown(baseCd, playerCooldownBonus, weaponCooldownBonus);
                  const stats = (w as any)._cachedStats || ((w as any)._cachedStats = getRankedWeaponStats(w.id, w.level, w));
                  let localCd = formulaCd * stats.cooldownMult;
                  if ((player.pivniTacekTimer || 0) > 0) {
                    const cdBoost = 1.35 + Math.max(0, (player.pivniTacekStacks || 1) - 1) * 0.15;
                    localCd = localCd / cdBoost;
                  }

                  (w as any).lastMaxCd = localCd;
                  w.cd = fired ? localCd : 0.1;
                }
              }
            }

            // Companion behavior (Kuba with sling)
            if (engine.companion) {
              const comp = engine.companion;
              comp.life -= dt;
              comp.animTime += dt;
              comp.throwCd -= dt;

              const targetX = player.x + Math.cos(comp.animTime * 1.5) * 60;
              const targetY = player.y + Math.sin(comp.animTime * 1.5) * 60;
              comp.x += (targetX - comp.x) * 4 * dt;
              comp.y += (targetY - comp.y) * 4 * dt;

              if (comp.throwCd <= 0) {
                const living = player.getLivingEnemies();
                const target = living.find((enemy: any) => isDirectTargetable(enemy, player));
                if (target) {
                  const ang = Math.atan2(target.y - comp.y, target.x - comp.x);
                  player.spawnProjectile({
                    x: comp.x,
                    y: comp.y,
                    angle: ang,
                    speed: 420,
                    dmg: 18,
                    radius: 10,
                    type: 'physical',
                    visual: season === 'winter' ? 'snowball_small' : 'stone',
                    life: 2.0,
                  });
                  sound.slash();
                  comp.throwCd = 0.85;
                }
              }

              if (comp.life <= 0) {
                engine.companion = null;
                pushDamageText(engine.texts, comp.x, comp.y - 30, 'Mějte se, sousede!', COLORS.parchment);
              }
            }

            // Camera follow (ADR 0034)
            const camZoom = canvas.height < 768 ? Math.max(0.75, Math.min(1.0, canvas.height / 850)) : 1.0;
            const targetCamX = player.x - (canvas.width / camZoom) / 2;
            const targetCamY = player.y - (canvas.height / camZoom) / 2;
            engine.camera.x += (targetCamX - engine.camera.x) * 0.1;
            engine.camera.y += (targetCamY - engine.camera.y) * 0.1;

            // Sync run stats
            runStatsRef.current.time = newTime;
            runStatsRef.current.dayPhase = currentPhase;
            runStatsRef.current.hp = player.hp;
            runStatsRef.current.maxHp = player.maxHp;
            runStatsRef.current.ultCd = player.ultCd;
            runStatsRef.current.kills = engine.kills;
            runStatsRef.current.coins = engine.coins;
            runStatsRef.current.souls = engine.souls;
            runStatsRef.current.chasniks = engine.chasniks;
            runStatsRef.current.gingerbread = engine.gingerbread;

            engine.lastStatsSync += dt;
            const isPerfProfile = (metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced')) === 'performance';
            const hudSyncInterval = isPerfProfile ? 0.25 : HUD_SYNC_INTERVAL_SECONDS;
            if (engine.lastStatsSync >= hudSyncInterval) {
              engine.lastStatsSync = 0;
              if (pendingMetaPersistRef.current && performance.now() - lastMetaPersistTimeRef.current > 1500) {
                flushPendingMeta();
              }

              // Boss bar je řízený přímo živým bossem, takže reaguje i na běžné zásahy.
              // Dříve se aktualizoval hlavně při spawn/death událostech a během boje mohl zamrznout.
              const activeBoss = engine.enemies.find(
                (e) =>
                  !e.isDefeated &&
                  (e.isBoss || e.isMiniboss || e.category === 'bosses')
              );
              let nextBossHpPct: number | null = null;
              let nextBossTitle = '';
              if (activeBoss) {
                if (activeBoss.isMinibossFlockMember) {
                  const flockMembers = engine.enemies.filter(
                    (e: any) => e.isMinibossFlockMember && !e.isDefeated && !e.dead
                  );
                  const totalFlockHp = flockMembers.reduce((sum: number, e: any) => sum + Math.max(0, e.hp || 0), 0);
                  const totalFlockMaxHp = (activeBoss.flockTotal || 9) * (activeBoss.maxHp || 38);
                  nextBossHpPct = Math.max(0, Math.min(100, (totalFlockHp / Math.max(1, totalFlockMaxHp)) * 100));
                  nextBossTitle = '👑 MINIBOSS: 🐦‍⬛ Hejno mrazivých vran';
                } else {
                  nextBossHpPct = Math.max(
                    0,
                    Math.min(
                      100,
                      (Math.max(0, activeBoss.hp) / Math.max(1, activeBoss.maxHp)) * 100
                    )
                  );
                  nextBossTitle = activeBoss.customBossTitle
                    ? `👑 ${activeBoss.customBossTitle}`
                    : activeBoss.isMiniboss
                      ? `👑 MINIBOSS: ${activeBoss.name}`
                      : activeBoss.name;
                }
              }

              const prevStats = runStatsRef.current;
              const nextChestProgress = Math.floor(engine.pointsChest);
              const hasChanged =
                prevStats.time !== newTime ||
                prevStats.kills !== engine.kills ||
                prevStats.coins !== engine.coins ||
                prevStats.souls !== engine.souls ||
                prevStats.chasniks !== engine.chasniks ||
                prevStats.gingerbread !== engine.gingerbread ||
                Math.round(prevStats.hp) !== Math.round(player.hp) ||
                prevStats.maxHp !== player.maxHp ||
                Math.round(prevStats.ultCd) !== Math.round(player.ultCd) ||
                prevStats.bossHpPct !== nextBossHpPct ||
                prevStats.bossTitle !== nextBossTitle ||
                prevStats.chestProgress !== nextChestProgress;

              if (hasChanged) {
                setRunStats((prev) => ({
                  ...prev,
                  time: newTime,
                  dayPhase: currentPhase,
                  kills: engine.kills,
                  coins: engine.coins,
                  souls: engine.souls,
                  chasniks: engine.chasniks,
                  gingerbread: engine.gingerbread,
                  hp: player.hp,
                  maxHp: player.maxHp,
                  ultCd: player.ultCd,
                  chestProgress: nextChestProgress,
                  bossHpPct: nextBossHpPct,
                  bossTitle: nextBossTitle,
                }));
              }
            }
          } else if (currentGameState === 'fleeing') {
            engine.fleeTimer -= dt;
            player.animTime = (player.animTime || 0) + dt * 1.6;
            const fleeVx = typeof player.fleeVx === 'number' ? player.fleeVx : (player.lastDx < 0 ? -220 : 220);
            const fleeVy = typeof player.fleeVy === 'number' ? player.fleeVy : -45;
            player.x += fleeVx * dt;
            player.y += fleeVy * dt;
            player.lastDx = fleeVx < 0 ? -1.8 : 1.8;
            player.lastDy = fleeVy < 0 ? -0.5 : 0.5;
            if (engine.fleeTimer <= 0) {
              // Transition to tally screen
              setTallyCounters({
                kills: engine.kills,
                coins: Math.floor(engine.coins * (activeRunBonusRef.current?.kind === 'coins' ? 1 + activeRunBonusRef.current.percent * activeRunBonusRef.current.multiplier / 100 : 1)),
                souls: engine.souls,
                chasniks: engine.chasniks,
                time: Math.floor(engine.gameTime),
                isVictory: false,
                levelId: engine.activeLevelId !== undefined ? engine.activeLevelId : 0,
              });
              const updatedHighest = Math.max(metaRef.current.highestSurviveTime || 0, engine.gameTime);
              saveMeta({
                ...metaRef.current,
                highestSurviveTime: updatedHighest,
              });
              setGameState('tally');
            }
          }

          // Maintain bullet-heaven readability stress-test projectiles & enemies when enabled in Stage 1
          if (sunOverlayConfigRef.current.stressTestActive && (engine.activeLevelId ?? 0) === 0 && player) {
            const targetStressProjectiles = 320;
            const stressVisuals = ['hell_spark', 'dragon_frostball', 'dragon_fireball', 'icicle', 'mud_ball', 'kolac'];
            let SpawnBudget = 32;
            while (engine.projectiles.length < targetStressProjectiles && SpawnBudget > 0) {
              SpawnBudget--;
              const idx = engine.projectiles.length;
              const angle = (idx * 0.61803398875 * Math.PI * 2 + engine.uiTime * 0.9) % (Math.PI * 2);
              const speed = 155 + (idx % 7) * 28;
              const spawnSpanX = Math.max(640, canvas.width * 0.48);
              const spawnSpanY = Math.max(420, canvas.height * 0.44);
              const offsetX = Math.cos(idx * 1.7 + engine.uiTime) * spawnSpanX;
              const offsetY = Math.sin(idx * 2.3 + engine.uiTime * 0.7) * spawnSpanY - canvas.height * 0.14;
              engine.projectiles.push({
                x: player.x + offsetX,
                y: player.y + offsetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                angle,
                speed,
                dmg: 0,
                radius: 10 + (idx % 3) * 2,
                type: 'fire',
                visual: stressVisuals[idx % stressVisuals.length],
                life: 2.6 + (idx % 5) * 0.45,
                maxLife: 4.5,
                isEnemy: true,
                isSunStressProjectile: true,
                dead: false,
              } as any);
            }
            const targetStressEnemies = 28;
            const stage1Mobs = ['blatouch', 'mrazovy_skritek', 'sotek', 'mysak'];
            while (engine.enemies.length < targetStressEnemies) {
              const eIdx = engine.enemies.length;
              const eAng = (eIdx / targetStressEnemies) * Math.PI * 2;
              const eDist = 190 + (eIdx % 4) * 55;
              const mobId = stage1Mobs[eIdx % stage1Mobs.length];
              const mob = createEnemyInstance(
                mobId,
                player.x + Math.cos(eAng) * eDist,
                player.y + Math.sin(eAng) * eDist,
                1.0
              );
              engine.enemies.push(mob);
            }
          }

          // Update Projectiles
          for (const p of engine.projectiles) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;

            // An expired projectile must not process collisions
            // during the same frame in which it expires.
            if (p.life <= 0) {
              p.dead = true;
              continue;
            }

            // Stress-test readability projectiles stream freely without terrain/damage overhead
            if ((p as any).isSunStressProjectile) {
              continue;
            }

            // Solid obstacle collision (cottages, church, walls, dense forest; water never blocks projectiles).
            // High-flying projectiles (Včelí roj) fly over obstacles.
            const isHighFlyingProj =
              p.visual === 'bee' ||
              p.weaponId === 'vceli_roj' ||
              p.weaponId === 'vceli-roj' ||
              p.isPuddle ||
              p.isFissureTelegraph;
            if (!isHighFlyingProj) {
              const obsHit = collideCircleWithObstacles(
                p.x,
                p.y,
                Math.max(6, (p.radius || 10) * 0.75),
                engine.activeLevelId ?? 0,
                engine.decor
              );
              if (obsHit.hit) {
                p.x = obsHit.x;
                p.y = obsHit.y;
                const isBouncingProj =
                  (typeof p.bounces === 'number' && p.bounces > 0) ||
                  p.visual === 'kolac' ||
                  p.visual === 'gander' ||
                  p.weaponId === 'kynuty_kolac' ||
                  p.weaponId === 'poutovy_kolac' ||
                  p.weaponId === 'splaseny_houser' ||
                  p.weaponId === 'houser';
                if (isBouncingProj) {
                  const dot = p.vx * obsHit.nx + p.vy * obsHit.ny;
                  if (dot < 0) {
                    p.vx -= 2 * dot * obsHit.nx;
                    p.vy -= 2 * dot * obsHit.ny;
                  } else {
                    p.vx = -p.vx;
                    p.vy = -p.vy;
                  }
                  p.angle = Math.atan2(p.vy, p.vx);
                  if (typeof p.bounces === 'number' && p.bounces > 0) {
                    p.bounces--;
                  }
                  sound.hit();
                  for (let k = 0; k < 4; k++) {
                    const ang = Math.random() * Math.PI * 2;
                    emitParticle(engine.particles, () => ({
                      x: p.x,
                      y: p.y,
                      vx: Math.cos(ang) * 65,
                      vy: Math.sin(ang) * 65 - 15,
                      life: 0.28,
                      color: p.visual === 'gander' ? '#F8FAFC' : '#F59E0B',
                      size: 3,
                    }));
                  }
                } else {
                  p.dead = true;
                  for (let k = 0; k < 4; k++) {
                    const ang = Math.random() * Math.PI * 2;
                    emitParticle(engine.particles, () => ({
                      x: p.x,
                      y: p.y,
                      vx: Math.cos(ang) * 55,
                      vy: Math.sin(ang) * 55 - 10,
                      life: 0.25,
                      color: '#D6D3D1',
                      size: 2.8,
                    }));
                  }
                  continue;
                }
              }
            }

            // Hazard projectiles fired by bosses (Mlynář rolling millstone, water flood wave, Bezhlavý rytíř head)
            if (p.isEnemy) {
              if (engine.timeStopTimer > 0) {
                p.x -= p.vx * dt;
                p.y -= p.vy * dt;
                p.life += dt;
                continue;
              }
              if (engine.masopustShockwaveTimer > 0) {
                const distToPlayer = Math.hypot(p.x - player.x, p.y - player.y);
                if (distToPlayer <= 180) {
                  p.dead = true;
                  sound.hit();
                  const confettiColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];
                  for (let c = 0; c < 6; c++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 60 + Math.random() * 80;
                    emitParticle(engine.particles, () => ({
                      x: p.x,
                      y: p.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      life: 0.4,
                      color: confettiColors[c % confettiColors.length],
                      size: 3.5,
                    }));
                  }
                  continue;
                }
              }
              if (p.hitCooldown && p.hitCooldown > 0) {
                p.hitCooldown -= dt;
              }
              if (p.rotation !== undefined) {
                p.rotation += (p.rotSpeed || 5) * dt;
              }

              // Returning Boomerang projectile (Bezhlavý rytíř head)
              if (p.boomerang && p.owner && !p.owner.isDefeated) {
                if (p.life < (p.maxLife || 3.0) * 0.55) {
                  const retAng = Math.atan2(p.owner.y - p.y, p.owner.x - p.x);
                  p.vx = Math.cos(retAng) * (p.speed || 280);
                  p.vy = Math.sin(retAng) * (p.speed || 280);
                  p.angle = retAng;
                  if (Math.hypot(p.owner.x - p.x, p.owner.y - p.y) < p.owner.radius + 15) {
                    p.dead = true;
                    continue;
                  }
                }
              }

              // Stationary Ground Puddle hazard (Hastrman water pools & Pekelný magma pools)
              if (p.isPuddle) {
                if (currentGameState === 'playing' && Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
                  if (p.visual === 'magma_trail') {
                    if ((p.burnCooldown || 0) <= 0) {
                      p.burnCooldown = 0.5;
                      player.takeDamage(p.dmg || 6, 'fire');
                      pushDamageText(engine.texts, player.x, player.y - 40, 'LÁVA! -6 🔥', '#EA580C', true);
                      sound.hit();
                    }
                  } else {
                    if (player.waterSoakedTimer < 1.0) {
                      player.waterSoakedTimer = 2.5 * Math.max(0.15, 1 - getForestDebuffReduction(metaRef.current.forestLevel || 0));
                      pushDamageText(engine.texts, player.x, player.y - 40, 'MOKRÁ LOUŽE! 🌊', '#60A5FA');
                      sound.splash();
                    }
                  }
                }
                if (p.burnCooldown && p.burnCooldown > 0) p.burnCooldown -= dt;
                continue;
              }

              // Trajectory Eruption telegraph (Pekelný anti-kiting interceptor)
              if (p.isFissureTelegraph) {
                if (p.life <= dt) {
                  sound.heavyHit();
                  const pDist = Math.hypot(p.x - player.x, p.y - player.y);
                  if (pDist < p.radius + player.radius) {
                    player.takeDamage(p.dmg || 18, 'fire');
                    pushDamageText(engine.texts, player.x, player.y - 45, 'SOPEČNÝ VÝBUCH! -18 🔥💥', '#EF4444', true);
                  }
                  for (let i = 0; i < 12; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 60 + Math.random() * 110;
                    emitParticle(engine.particles, () => ({
                      x: p.x,
                      y: p.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd - 25,
                      life: 0.45,
                      color: Math.random() < 0.5 ? '#EF4444' : '#F59E0B',
                      size: 4.2,
                    }));
                  }
                  engine.projectiles.push({
                    x: p.x,
                    y: p.y,
                    vx: 0,
                    vy: 0,
                    radius: 26,
                    life: 6.0,
                    dmg: 8,
                    isEnemy: true,
                    isPuddle: true,
                    visual: 'magma_trail',
                    dead: false,
                  });
                }
              }

              if (currentGameState === 'playing' && Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
                if (p.boomerang && (p.hitCooldown || 0) > 0) {
                  continue;
                }
                player.takeDamage(p.dmg, p.type || 'blunt');
                if (p.pushback) {
                  player.x += Math.cos(p.angle) * p.pushback;
                  player.y += Math.sin(p.angle) * p.pushback;
                }
                if (p.soakPlayer) {
                  player.waterSoakedTimer = 3.5 * Math.max(0.15, 1 - getForestDebuffReduction(metaRef.current.forestLevel || 0));
                }
                if (p.slowPlayer) {
                  player.slowTimer = 2.2 * Math.max(0.15, 1 - getForestDebuffReduction(metaRef.current.forestLevel || 0));
                }
                if (p.statusText) {
                  pushDamageText(engine.texts, player.x, player.y - 40, p.statusText, p.statusColor || COLORS.mustard, true);
                }
                sound.hit();
                for (let k = 0; k < 6; k++) {
                  emitParticle(engine.particles, () => ({
                    x: p.x,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 120,
                    vy: (Math.random() - 0.5) * 120,
                    life: 0.4,
                    color: p.visual === 'dragon_fireball' ? '#EF4444' : p.visual === 'dragon_frostball' || p.visual === 'icicle' ? '#38BDF8' : p.visual === 'dragon_wind' ? '#BAE6FD' : p.visual === 'ink_bottle' ? '#0F172A' : p.visual === 'dirt_clod' ? '#5C4033' : p.visual === 'mud_ball' ? '#365314' : p.visual === 'millstone' || p.visual === 'boulder' ? COLORS.grey : p.visual === 'hell_spark' ? '#EF4444' : p.visual === 'wood_shard' ? '#78350F' : COLORS.ice,
                    size: 5,
                  }));
                }
                if (p.boomerang) {
                  p.hitCooldown = 0.9;
                } else {
                  p.dead = true;
                }
              }
              continue;
            }

            // Vapor ignition for friendly projectiles (Slivovice blue flame)
            if (engine.slivoviceVapor && !p.slivoviceFlame) {
              const dx = p.x - engine.slivoviceVapor.x;
              const dy = p.y - engine.slivoviceVapor.y;
              if (Math.hypot(dx, dy) <= 260) {
                p.slivoviceFlame = true;
                p.dmg = Math.round((p.dmg || 15) * 1.4);
                emitParticle(engine.particles, () => ({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.35,
                  color: '#60A5FA',
                  size: 4,
                }));
              }
            }

            // Homing bees: vyhledání nejbližšího strašidla přes SpatialHash s přirozenou hmyzí vlnivou křivkou
            if (p.homing) {
              if (p._target && !isDirectTargetable(p._target, engineRef.current.player)) {
                p._target = null;
                p._targetScanTimer = 0;
              }
              const nearest = getCachedHomingTarget(p, dt, () => {
                const nearbyTargets = enemySpatialHashRef.current.queryCircle(p.x, p.y, 380);
                let candidate: any = null;
                let nearestDistSq = Infinity;
                for (let i = 0; i < nearbyTargets.length; i++) {
                  const target = nearbyTargets[i];
                  if (target.isDefeated || target.dead || !isDirectTargetable(target, engineRef.current.player)) continue;
                  const dSq = distanceSq(p.x, p.y, target.x, target.y);
                  if (dSq < nearestDistSq) {
                    nearestDistSq = dSq;
                    candidate = target;
                  }
                }
                return candidate;
              });
              if (nearest) {
                const baseAng = Math.atan2(nearest.y - p.y, nearest.x - p.x);
                // Přirozená křivka letu hmyzu (sinusové vlnění kmitající v průběhu letu)
                const wobble = Math.sin((p.life || 0) * 16 + p.x * 0.04) * 0.45;
                const targetAng = baseAng + wobble;
                p.vx += Math.cos(targetAng) * 450 * dt;
                p.vy += Math.sin(targetAng) * 450 * dt;
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 350) {
                  p.vx = (p.vx / spd) * 350;
                  p.vy = (p.vy / spd) * 350;
                }
                p.angle = Math.atan2(p.vy, p.vx);
              }
            }

            // One squared-distance check against the virtual leader can reject this
            // projectile before it tests the individual crows or snowmen in the spatial query.
            const crowWaveProjectileMayHit = crowWaveRef.current?.isWithinBounds(
              p.x, p.y, (p.radius || 0) + CROW_WAVE_HIT_RADIUS
            ) ?? false;
            const snowmanHordeProjectileMayHit = snowmanHordeRef.current?.isWithinBounds(
              p.x, p.y, (p.radius || 0) + SNOWMAN_HORDE_HIT_RADIUS
            ) ?? false;
            const nearby=enemySpatialHashRef.current.queryCircle(p.x,p.y,p.radius+72);
            for (const e of nearby) {
              if (e.isDefeated) continue;
              if (e.isVirtualCrowMember && !crowWaveProjectileMayHit) continue;
              if (e.isVirtualSnowmanMember && !snowmanHordeProjectileMayHit) continue;
              const dx=p.x-e.x, dy=p.y-e.y, reach=p.radius+e.radius;
              if (!p.hitList.includes(e) && distanceSq(p.x, p.y, e.x, e.y) < reach*reach) {
                p.hitList.push(e);
                const baseHunger = typeof e.hunger === 'number' ? e.hunger : (e.foodResist || 0);
                const red = player.foodResistReduction || 0;
                const hungerResist = Math.max(0, baseHunger * (1 - red));
                const resist = p.type === 'food' ? hungerResist : 0;
                if (resist >= 0.95) {
                  pushDamageText(engine.texts, e.x, e.y - 20, 'IMUNNÍ', COLORS.ink);
                } else {
                  let dmg = p.dmg * (1 - resist);
                  if (p.type === 'food') {
                    // Food type weapons like Buchta don't cause graphical hit effect or knockback
                    // but they cause enemy to snack and do nothing for a time, with Ňam, ňam note.
                    // Kamenný bubák má kompletní imunitu vůči snack-omráčení!
                    if (e.prefix === 'kamenny' || e.immuneToSnackStun) {
                      pushDamageText(engine.texts, e.x, e.y - 25, 'ODRAŽENO! 🪨', '#A8A29E', true);
                    } else {
                      const baseSnack = p.snackDuration ?? 4.0;
                      const effectiveSnack = baseSnack * Math.max(0, 1 - hungerResist);
                      e.snackTimer = Math.min(2.5, (e.snackTimer || 0) + effectiveSnack);
                      pushDamageText(engine.texts, e.x, e.y - 25, 'Ňam, ňam', '#D97706', true);
                      sound.snack();
                    }
                  }

                  if (p.type === 'holy') {
                    const holyMult = getHolyDamageMultiplier(e);
                    dmg *= holyMult;
                    if (isUnholyEnemy(e)) {
                      pushDamageText(engine.texts, e.x, e.y - 45, 'SVATÁ ZKÁZA!', COLORS.mustard, true);
                    }
                  }
                  const holyPush = p.type === 'holy' ? Math.max(0.1, 1 - getEnemyHolyResistance(e)) : 1;
                  const poiseMult = 1 + (player.plumPoiseReduction || 0);
                  e.takeDamage(dmg, p.type, p.type === 'food' ? 0 : p.vx * 0.3 * holyPush * poiseMult, p.type === 'food' ? 0 : p.vy * 0.3 * holyPush * poiseMult);
                  if (p.plumScent) {
                    const cloud = new SmokePuff(e.x, e.y, p.plumScentRadius || 140, 'plum-scent', p.plumScentDuration || 3.5) as any;
                    cloud.damagePerSecond = (p.dmg || dmg) * 0.20;
                    engine.smokePuffs.push(cloud);
                  }
                  if (!p.noMasteryProc && p.weaponId) player.triggerWeaponMastery(p.weaponId, e, 'hit');
                  if (p.type === 'ice') e.chill(3.5);
                  if (p.interruptsWindup) {
                    if (typeof e.interruptAttack === 'function') e.interruptAttack();
                    e.isAttacking = false;
                    e.windupTimer = 0;
                    e.strikeTimer = 0;
                    if (e.aiState === 'windup') e.aiState = 'idle';
                    pushDamageText(engine.texts, e.x, e.y - 25, 'ŠTÍP! 🪿', '#F8FAFC', false);
                  }
                  if (p.panicDuration && !e.isBoss) {
                    e.panicked = true;
                    e.panicTimer = Math.max(e.panicTimer || 0, p.panicDuration);
                    const pAng = Math.atan2(e.y - p.y, e.x - p.x);
                    e.kbx = (e.kbx || 0) + Math.cos(pAng) * 140;
                    e.kby = (e.kby || 0) + Math.sin(pAng) * 140;
                  }
                  if (p.coinStealChance && Math.random() < p.coinStealChance) {
                    spawnDropWithLimit(engine.drops, {
                      type: 'coin',
                      value: 1,
                      x: e.x,
                      y: e.y,
                      vx: (Math.random() - 0.5) * 60,
                      vy: (Math.random() - 0.5) * 60 - 20,
                      radius: 10,
                      time: 0,
                      dead: false,
                    }, engine.pendingDropBank);
                    pushDamageText(engine.texts, e.x, e.y - 35, '+1 🪙', '#FBBF24', false);
                    sound.coin();
                  }
                  if (p.type === 'pickle') {
                    e.applyStatusEffect('pickle_sickness', { addStacks: 1, maxStacks: 3, duration: 6, damageTakenMultiplier: p.pickleDamageTakenMultiplier || 1.35, damageDealtMultiplier: 0.65 });
                    const after = e.getStatusEffect('pickle_sickness')?.stacks || 0;
                    const burstColor = after >= 3 ? '#84CC16' : '#A3E635';
                    for (let k = 0; k < (after >= 3 ? 8 : 4); k++) {
                      emitParticle(engine.particles, () => ({x:e.x+(Math.random()-.5)*14,y:e.y+(Math.random()-.5)*14,vx:(Math.random()-.5)*100,vy:(Math.random()-.5)*100,life:.35,color:burstColor,size:after>=3?4:2.5}));
                    }
                    pushDamageText(engine.texts, e.x, e.y-30, after >= 3 ? 'PŘEJEDENÍ! 🥒' : String(after) + '/3 🥒', burstColor, after >= 3);
                  }

                  // Bouncing poppy cake
                  if (p.bounces && p.bounces > 0) {
                    p.bounces--;
                    let next:any=null;
                    for(const candidate of livingEnemiesRef.current){if(candidate!==e&&!candidate.isDefeated){next=candidate;break;}}
                    if(next){
                      const bAng = Math.atan2(next.y - p.y, next.x - p.x);
                      p.vx = Math.cos(bAng) * p.speed;
                      p.vy = Math.sin(bAng) * p.speed;
                      p.hitList = [];
                      break;
                    }
                  }
                  if (p.penetrate || (typeof p.pierce === 'number' && p.pierce > 0)) {
                    if (p.pierce) p.pierce--;
                    continue;
                  }
                  p.dead = true;
                  break;
                }
              }
            }
          }
          compactInPlace(engine.projectiles, keepLiveProjectile);

          // Update Melee Slashes
          for (const s of engine.slashes) {
            s.x = player.x;
            s.y = player.y;
            s.time = (s.time || 0) + dt;
            s.life -= dt;
            if (s.life <= 0) s.dead = true;

            const nearby = enemySpatialHashRef.current.queryCircle(s.x, s.y, s.reach + 72);
            for (const e of nearby) {
              if (e.isDefeated) continue;
              const dx = s.x - e.x, dy = s.y - e.y, reach = s.reach + e.radius;
              if (
                !s.hitList.includes(e) &&
                distanceSq(s.x, s.y, e.x, e.y) <= reach * reach &&
                hasTerrainLineOfSight(s.x, s.y, e.x, e.y, engine.activeLevelId ?? 0, engine.decor)
              ) {
                const ang = Math.atan2(e.y - s.y, e.x - s.x);
                let diff = Math.abs(ang - s.angle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                if (diff <= s.arc / 2) {
                  s.hitList.push(e);
                  const isCane = s.style === 'cane' || s.weaponId === 'cane';
                  const isWhip = s.style === 'whip' || s.weaponId === 'formansky_bic';
                  let kbForce = isWhip ? 340 : (isCane ? 480 : 260);
                  let dmg = s.dmg;
                  let dmgType = s.type;
                  const dmgOpts: any = {};
                  const milestones = s.milestones || [];

                  if (isWhip) {
                    dmgOpts.cannotDodge = true;
                    dmgOpts.ignoreDodge = true;
                    const distFromPlayer = Math.hypot(e.x - s.x, e.y - s.y);
                    const isTipHit = distFromPlayer >= s.reach * 0.65;

                    // Immediately interrupt attack
                    if (typeof e.interruptAttack === 'function') {
                      e.interruptAttack();
                    }
                    e.isAttacking = false;
                    e.windupTimer = 0;
                    e.strikeTimer = 0;
                    if (e.aiState === 'windup') e.aiState = 'idle';

                    if (isTipHit) {
                      // Třesk na konci biče
                      if (milestones.includes('whip_lead_knot_3')) {
                        dmgOpts.ignoreResist = 1.0;
                        dmg *= 1.25;
                      }
                      if (milestones.includes('whip_tar_tip_5')) {
                        dmgType = 'fire';
                        if (e.prefix === 'mrazivy' || e.category === 'frost') {
                          dmg *= 1.5;
                        }
                      }
                      if (milestones.includes('whip_thunder_crack_8')) {
                        const fearResist = e.willpower || 0;
                        e.panicTimer = Math.max(e.panicTimer || 0, 2.0 * (1 - fearResist * 0.5));
                        e.panicked = true;
                        const tipNear = enemySpatialHashRef.current.queryCircle(e.x, e.y, 100);
                        for (let ti = 0; ti < tipNear.length; ti++) {
                          const te = tipNear[ti];
                          if (!te.isDefeated && !te.dead) {
                            te.panicTimer = Math.max(te.panicTimer || 0, 2.0 * (1 - (te.willpower || 0) * 0.5));
                            te.panicked = true;
                          }
                        }
                      }
                      pushDamageText(engine.texts, e.x, e.y - 28, 'PRÁSK! 🪢', '#FDE047', true);
                      for (let pIdx = 0; pIdx < 4; pIdx++) {
                        emitParticle(engine.particles, () => ({
                          x: e.x + (Math.random() - 0.5) * 12,
                          y: e.y + (Math.random() - 0.5) * 12,
                          vx: (Math.random() - 0.5) * 120,
                          vy: (Math.random() - 0.5) * 120,
                          life: 0.3,
                          color: milestones.includes('whip_tar_tip_5') ? '#F97316' : '#FDE047',
                          size: 3,
                        }));
                      }
                    }

                    if (s.soaked || milestones.includes('whip_wet_strap_5')) {
                      kbForce *= 1.45;
                      if (typeof e.soak === 'function') e.soak();
                      if (typeof e.chill === 'function') e.chill(2.0);
                    }
                  }

                  e.takeDamage(dmg, dmgType, Math.cos(s.angle) * kbForce, Math.sin(s.angle) * kbForce, dmgOpts);
                  if (isCane && e.isAttacking) {
                    e.isAttacking = false;
                    e.windupTimer = 0;
                    e.strikeTimer = 0;
                  }
                  if (!s.noMasteryProc && s.weaponId) player.triggerWeaponMastery(s.weaponId, e, 'hit');
                  if (s.soaked && !isWhip) e.soak();
                  if (s.style === 'cane' || s.weaponId === 'cane') {
                    // Aspen whip hit effects: bud/leaf/wood particles & splash
                    for (let pIdx = 0; pIdx < (s.soaked ? 4 : 3); pIdx++) {
                      emitParticle(engine.particles, () => ({
                        x: e.x + (Math.random() - 0.5) * 16,
                        y: e.y + (Math.random() - 0.5) * 16,
                        vx: Math.cos(s.angle + (Math.random() - 0.5) * 1.4) * (120 + Math.random() * 80),
                        vy: Math.sin(s.angle + (Math.random() - 0.5) * 1.4) * (120 + Math.random() * 80),
                        life: 0.35,
                        color: s.soaked ? (pIdx % 2 === 0 ? '#60A5FA' : '#93C5FD') : (pIdx % 2 === 0 ? '#84CC16' : '#78350F'),
                        size: s.soaked ? 3.5 : 2.5,
                      }));
                    }
                    if (Math.random() < 0.35) {
                      const whipWords = s.soaked ? ['ŠPLOUCH!', 'PLESK!', 'ŠVIH!'] : ['ŠVIH!', 'PRÁSK!', 'PLESK!', 'ŠLEH!'];
                      const word = whipWords[Math.floor(Math.random() * whipWords.length)];
                      pushDamageText(engine.texts, e.x + (Math.random() - 0.5) * 20, e.y - 30, word, s.soaked ? '#38BDF8' : '#FDE047', false);
                    }
                  }
                }
              }
            }
          }
          compactInPlace(engine.slashes, keepLiveSlash);

          // Update the circular Stage 1 flock once, then let the existing spatial-hash
          // rebuild below index the freshly computed crow positions for the next frame.
          let crowWavePlayerInBounds = false;
          const virtualCrowWave = crowWaveRef.current;
          if (currentGameState === 'playing' && player && virtualCrowWave) {
            const spawnedCrowWave = virtualCrowWave.update(dt, engine, player, canvas.width, canvas.height);
            if (spawnedCrowWave) {
              pushDamageText(engine.texts, player.x, player.y - 64, '🐦‍⬛ HEJNO VRAN PŘILÉTÁ!', '#1F2937', true, 'directorWarningBanners');
            }
            crowWavePlayerInBounds = virtualCrowWave.isWithinBounds(
              player.x, player.y, (player.radius || 20) + CROW_WAVE_HIT_RADIUS
            );
          }

          const virtualSnowmanHorde = snowmanHordeRef.current;
          if (currentGameState === 'playing' && player && virtualSnowmanHorde) {
            const spawnedSnowmanHorde = virtualSnowmanHorde.update(dt, engine, player, canvas.width, canvas.height);
            if (spawnedSnowmanHorde) {
              pushDamageText(engine.texts, player.x, player.y - 64, '⛄ HORDA TAJÍCÍCH SNĚHULÁKŮ SE BLÍŽÍ!', '#38BDF8', true, 'directorWarningBanners');
              sound.splash();
            }
          }

          // Update Enemies
          for (const e of engine.enemies) {
            if (engine.timeStopTimer > 0 || e.dead) {
              continue;
            }

            // Virtual flock and snowman horde members never use the optional friendly-fire brawl AI.
            if (!e.isVirtualCrowMember && !e.isVirtualSnowmanMember && e.brawlTimer && e.brawlTimer > 0) {
              e.brawlTimer = Math.max(0, e.brawlTimer - dt);
              let nearestFoe: any = null;
              let nearestDist = 999999;
              for (const other of engine.enemies) {
                if (other === e || other.dead || other.isDefeated || other.isVirtualCrowMember || other.isVirtualSnowmanMember) continue;
                const d = Math.hypot(other.x - e.x, other.y - e.y);
                if (d < nearestDist) {
                  nearestDist = d;
                  nearestFoe = other;
                }
              }
              if (nearestFoe) {
                const brawlAng = Math.atan2(nearestFoe.y - e.y, nearestFoe.x - e.x);
                e.vx = Math.cos(brawlAng) * (e.speed || 100) * 1.15;
                e.vy = Math.sin(brawlAng) * (e.speed || 100) * 1.15;
                e.x += e.vx * dt;
                e.y += e.vy * dt;
                if (nearestDist < e.radius + nearestFoe.radius + 18) {
                  e.brawlAttackCooldown = (e.brawlAttackCooldown || 0) - dt;
                  if (e.brawlAttackCooldown <= 0) {
                    e.brawlAttackCooldown = 0.55;
                    const bDmg = Math.max(8, Math.round((e.damage || 15) * (0.8 + Math.random() * 0.5)));
                    nearestFoe.takeDamage(bDmg, 'physical', Math.cos(brawlAng) * 200, Math.sin(brawlAng) * 200);
                    if (nearestFoe.hp <= 0) {
                      nearestFoe.killedByFriendlyFire = true;
                    }
                    sound.hit();
                  }
                }
                continue;
              }
            }

            const isActiveVirtualCrow = e.isVirtualCrowMember === true && e._crowWaveActive === true;
            const isActiveVirtualSnowman = e.isVirtualSnowmanMember === true && e._snowmanHordeActive === true;
            if (isActiveVirtualSnowman) {
              // The virtual leader already computed this snowman's motion, steering blend,
              // leash detach, time-sliced separation, melting HP decay, and contact damage.
              continue;
            }
            // The virtual leader already computed this bird's motion. Skip homing AI,
            // status-map iteration and enemy-to-enemy behavior for active flock members.
            if (!isActiveVirtualCrow || e.isDefeated || e.dead) {
              const prevEx = e.x;
              const prevEy = e.y;
              e.update(dt, player);
              if (engine.activeLevelId === 0 && !e.isDefeated && !e.dead) {
                const isFlyingEnemy = Boolean((e.isFlying || e.id === 'vrana' || isActiveVirtualCrow) && !e.isGroundedForLoot);
                if (!isFlyingEnemy) {
                  const enemyWater = getMarchWaterAndFloeEffect(e.x, e.y, engine.uiTime);
                  if (enemyWater.onFloe) {
                    e.x += enemyWater.carryVx * dt;
                    e.y += enemyWater.carryVy * dt;
                  } else if (enemyWater.inOpenWater && !isAquaticEnemy(e)) {
                    // Very strong river/pond slow (72% slow in river, 68% in pond) for non-flying, non-water enemies
                    e.x = prevEx + (e.x - prevEx) * enemyWater.speedMultiplier + enemyWater.carryVx * dt;
                    e.y = prevEy + (e.y - prevEy) * enemyWater.speedMultiplier + enemyWater.carryVy * dt;
                  }
                  resolveMarchThawObstacles(e, false);
                } else {
                  clampToMarchArenaBounds(e);
                }
              }
            }

            if (e.isDefeated || e.dead || e.isCarryingLootBundle || (e.snackTimer || 0) > 0 || !player || player.hp <= 0) {
              e.isAttacking = false;
              e.windupTimer = 0;
              e.strikeTimer = 0;
              e.inContact = false;
              continue;
            }

            // This flock-level broadphase avoids distance and attack checks for each
            // crow while the hunter is outside the leader's enclosing bounding circle.
            if (isActiveVirtualCrow && !crowWavePlayerInBounds) {
              e.isAttacking = false;
              e.inContact = false;
              e.windupTimer = 0;
              e.strikeTimer = 0;
              continue;
            }

            // Tick active strike animation timer
            if ((e.strikeTimer || 0) > 0) {
              const fajfkaAttackSlow = (e.fajfkaSlowTimer || 0) > 0 ? Math.max(0.1, e.fajfkaAttackSlowFactor || 0.65) : 1;
              e.strikeTimer = Math.max(0, e.strikeTimer - dt * fajfkaAttackSlow);
            }

            const cadence: EnemyAttackCadence = e.attackCadence || 'normal';
            const strikeDuration = cadence === 'slow' ? 0.65 : cadence === 'fast' ? 0.22 : 0.42;
            const playerDx = e.x - player.x;
            const playerDy = e.y - player.y;
            const distToPlayerSq = playerDx * playerDx + playerDy * playerDy;
            const distToPlayer = isActiveVirtualCrow ? 0 : Math.hypot(playerDx, playerDy);
            const attackRange = typeof e.attackRange === 'number' ? e.attackRange : (e.radius + 25);

            // Flock crows damage only on actual player contact, using squared
            // distance and an individual staggered cooldown (no targeting AI).
            if (isActiveVirtualCrow) {
              const reach = e.radius + player.radius;
              const touchingPlayer = distToPlayerSq < reach * reach;
              if (touchingPlayer) {
                e.isAttacking = true;
                e.inContact = true;
                e.contactLeaveTimer = 0;
                if (e.crowContactCooldown <= 0 && currentGameState === 'playing') {
                  e.crowContactCooldown = 0.65;
                  const damageMult = typeof e.getDamageDealtMultiplier === 'function'
                    ? e.getDamageDealtMultiplier()
                    : 1;
                  player.takeDamage(e.damage * damageMult, 'physical', e, true);
                  sound.hit();
                }
              } else {
                e.isAttacking = false;
                e.inContact = false;
              }
              continue;
            }

            const totalInterval = e.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
            const attackSlowFactor = (e.fajfkaSlowTimer || 0) > 0 ? Math.max(0.1, e.fajfkaAttackSlowFactor || 0.65) : 1;
            const attackDelay = (typeof e.attackDelay === 'number' && e.attackDelay > 0
              ? e.attackDelay
              : Math.max(0.2, totalInterval - strikeDuration)) / attackSlowFactor;
            e.attackDelay = attackDelay;
            const contactReach = e.radius + player.radius;
            const isColliding = isActiveVirtualCrow
              ? distToPlayerSq < contactReach * contactReach
              : distToPlayer < contactReach;
            const inAttackRange = isActiveVirtualCrow
              ? distToPlayerSq <= attackRange * attackRange
              : distToPlayer <= attackRange;

            // Speciální výpad Čerta s vidlemi
            if (isColliding && currentGameState === 'playing' && e.id === 'cert' && e.aiState === 'charge') {
              const chDmg = (e.damage * (typeof e.getDamageDealtMultiplier === 'function' ? e.getDamageDealtMultiplier() : 1) * 1.55) * (1 - player.damageReduction);
              player.takeDamage(chDmg, 'physical', e, true);
              sound.heavyHit();
              const pushDist = 110;
              const pushAng = Number.isFinite(e.chargeDirX) ? e.chargeDirX : Math.atan2(player.y - e.y, player.x - e.x);
              player.x += Math.cos(pushAng) * pushDist;
              player.y += Math.sin(pushAng) * pushDist;
              pushDamageText(engine.texts, player.x, player.y - 50, `DRTIVÝ NÁRAZ VIDLEMI! -${Math.ceil(chDmg)} 🔱💥`, COLORS.red, true);
              e.aiState = 'brake';
              e.aiTimer = 0.55;
              e.vx = 0;
              e.vy = 0;
            }

            // Telegrafovaný nápřah a útok monster (Windup -> Strike -> Recovery)
            if ((e.strikeTimer || 0) > 0) {
              // Enemy is currently playing out the active strike & recovery animation
              e.isAttacking = false;
              e.inContact = true;
            } else if (inAttackRange) {
              e.isAttacking = true;
              e.inContact = true;
              e.contactLeaveTimer = 0;
              e.attackAngle = Math.atan2(player.y - e.y, player.x - e.x);
              e.attackTargetX = player.x;
              e.attackTargetY = player.y;

              // Uleželý syreček v kapse:
              // Jakmile se nepřítel v těsné blízkosti lovce začne napřahovat k útoku (windupTimer),
              // závan ze syrečku mu podlomí kolena a přepne ho na 4 sekundy do stavu Vyčerpaný (vycerpany – poloviční rychlost pohybu i útoku).
              const closeReach = Math.max(attackRange, 85 + (((player.syrecekStacks || 1) - 1) * 15));
              const withinCloseReach = isActiveVirtualCrow
                ? distToPlayerSq <= closeReach * closeReach
                : distToPlayer <= closeReach;
              if (
                (player.syrecekStacks || 0) > 0 &&
                withinCloseReach &&
                (!e.vycerpanyTimer || e.vycerpanyTimer <= 0)
              ) {
                e.vycerpanyTimer = 4.0;
                if (typeof e.interruptAttack === 'function') {
                  e.interruptAttack();
                } else {
                  e.isAttacking = false;
                  e.windupTimer = 0;
                }
                pushDamageText(engine.texts, e.x, e.y - 30, 'VYČERPÁN! 🧀', '#A3E635', true);
                if (engine.particles && engine.particles.length < MAX_PARTICLES - 6) {
                  for (let pIdx = 0; pIdx < 4; pIdx++) {
                    const ang = Math.random() * Math.PI * 2;
                    emitParticle(engine.particles, () => ({
                      x: e.x + (Math.random() - 0.5) * 12,
                      y: e.y + (Math.random() - 0.5) * 12,
                      vx: Math.cos(ang) * 35,
                      vy: Math.sin(ang) * 35 - 15,
                      life: 0.45,
                      color: pIdx % 2 === 0 ? '#BEF264' : '#EAB308',
                      size: 3.5,
                    }));
                  }
                }
              }

              const attackSpeedMult = ((e.vycerpanyTimer || 0) > 0 || e.prefix === 'vycerpany') ? 0.5 : 1.0;
              e.windupTimer = (e.windupTimer || 0) + dt * attackSpeedMult;
              if (e.windupTimer >= attackDelay) {
                // THE HIT LANDS: damage is dealt and smooth multi-frame strike is triggered!
                e.strikeTimer = strikeDuration;
                e.strikeMaxTimer = strikeDuration;
                e.windupTimer = 0;
                e.isAttacking = false;
                if (currentGameState === 'playing') {
                  const mult = typeof e.getDamageDealtMultiplier === 'function' ? e.getDamageDealtMultiplier() : 1;
                  const contactDamage = e.damage * mult;
                  player.takeDamage(contactDamage, 'physical', e, true);
                  if (cadence === 'slow') {
                    sound.heavyHit();
                  }
                }
              }
            } else {
              // Pokud hráč stihne uniknout mimo dosah: postupné snižování nápřahu
              e.windupTimer = Math.max(0, (e.windupTimer || 0) - dt * 2);
              if (e.windupTimer === 0 && (e.strikeTimer || 0) <= 0) {
                e.isAttacking = false;
                e.inContact = false;
              }
            }
          }
          compactInPlace(engine.enemies, keepLiveEnemy);

          // Rebuild the spatial hash AFTER enemy movement.
          // Collision systems later in this frame must see current enemy positions.
          livingEnemiesRef.current.length = 0;
          for (const e of engine.enemies) {
            if (!e.isDefeated && !e.dead) {
              livingEnemiesRef.current.push(e);
            }
          }
          enemySpatialHashRef.current.rebuild(livingEnemiesRef.current);

          // Slévání kořisti každých 1,5 s; při čekajících odměnách uvolní místo pod limitem 40.
          engine.dropFusionTimer = (engine.dropFusionTimer || 0) + dt;
          if (engine.dropFusionTimer >= 1.5 || engine.drops.length > MAX_DROPS_LIMIT) {
            engine.dropFusionTimer = 0;
            const viewBounds = {
              left: engine.camera.x - 120,
              top: engine.camera.y - 160,
              right: engine.camera.x + canvas.width + 120,
              bottom: engine.camera.y + canvas.height + 160,
            };
            const fusionTarget = hasPendingDrops(engine.pendingDropBank)
              ? MAX_DROPS_LIMIT - 1
              : MAX_DROPS_LIMIT;
            performDropFusion(engine.drops, viewBounds, fusionTarget);
            compactInPlace(engine.drops, keepLiveDrop);
            releasePendingDrops(engine.drops, engine.pendingDropBank);
          }

          // Update Drops
          sweepCoinsIntoBigPouches(engine.drops, dt);
          for (const d of engine.drops) {
            if (d.dead) continue;
            d.time += dt;
            if (d.isHot && d.goldenRushTimer && d.goldenRushTimer > 0) {
              d.goldenRushTimer -= dt;
              if (d.goldenRushTimer <= 0) {
                d.isHot = false;
              }
            }
            if (typeof d.expiration === 'number') {
              d.expiration -= dt;
              if (d.expiration <= 0) {
                if (d.type === 'gingerbread' && d.isHot) {
                  refundExpiredHotGingerbread(d, engine.pendingDropBank);
                }
                d.dead = true;
                continue;
              }
            }
            if (d.vx || d.vy) {
              d.x += d.vx * dt;
              d.y += d.vy * dt;
              const drag = Math.max(0, 1 - 7.5 * dt);
              d.vx *= drag;
              d.vy *= drag;
              if (Math.abs(d.vx) < 1.5) d.vx = 0;
              if (Math.abs(d.vy) < 1.5) d.vy = 0;
              clampToMarchArenaBounds(d, 32);
            }
            const dist = Math.hypot(d.x - player.x, d.y - player.y);

            if (d.type === 'chasnik') {
              if (!d.rescued && dist < d.radius + player.radius + 35) {
                d.rescued = true;
                d.dead = true;
                triggerRescueChasnik(d.x, d.y);
              }
            } else if (dist < player.pickupRadius && currentGameState === 'playing' && gameStateRef.current === 'playing' && canCollectDrop(d.type, player.hp, player.maxHp, player)) {
              const passiveMagnetSpeed = player.type === 'korenarka' && (player.herbBoostTimer || 0) > 0 ? 5 : 1;
              const mobility = d.magnetMobility !== undefined ? d.magnetMobility : 1.0;
              const spd = Math.max(520, (player.pickupRadius - dist) * 7.5 + 380) * passiveMagnetSpeed * mobility * dt;
              const ang = Math.atan2(player.y - d.y, player.x - d.x);
              d.x += Math.cos(ang) * spd;
              d.y += Math.sin(ang) * spd;
              const curDist = Math.hypot(d.x - player.x, d.y - player.y);

              if (curDist < player.radius + d.radius + 14 || dist < player.radius + d.radius + 14) {
                d.dead = true;
                if (d.type === 'coin') {
                  const undeadLvl = metaRef.current.undeadLevel || 0;
                  const rawVal = d.value || 1;
                  const bonusVal = rawVal * (1 + undeadLvl * 0.10);
                  const whole = Math.floor(bonusVal);
                  engine.coinFraction = (engine.coinFraction || 0) + (bonusVal - whole);
                  let extra = 0;
                  if (engine.coinFraction >= 1.0) {
                    extra = Math.floor(engine.coinFraction);
                    engine.coinFraction -= extra;
                  }
                  const val = Math.max(1, whole + extra);
                  sound.coin();
                  engine.coins += val;
                  if (val >= 15) {
                    pushDamageText(engine.texts, player.x, player.y - 48, `+${val} kr. (Tolar)`, COLORS.mustard, true);
                  } else if (val >= 5) {
                    pushDamageText(engine.texts, player.x, player.y - 40, `+${val} kr. (Groš)`, '#E2E8F0');
                  }
                } else if (d.type === 'gingerbread') {
                  const isHotActive = !!(d.isHot && (!d.goldenRushTimer || d.goldenRushTimer > 0));
                  const ovenLvl = metaRef.current.ovenLevel || 0;
                  const rawVal = (d.value || 1) * (isHotActive ? 2 : 1);
                  const bonusVal = rawVal * (1 + ovenLvl * 0.10);
                  const whole = Math.floor(bonusVal);
                  engine.gingerbreadFraction = (engine.gingerbreadFraction || 0) + (bonusVal - whole);
                  let extra = 0;
                  if (engine.gingerbreadFraction >= 1.0) {
                    extra = Math.floor(engine.gingerbreadFraction);
                    engine.gingerbreadFraction -= extra;
                  }
                  const val = Math.max(1, whole + extra);
                  engine.gingerbread += val;
                  const size = d.size || 'small';
                  sound.gingerbreadPickup();
                  pushDamageText(engine.texts, 
                    player.x,
                    player.y - 42,
                    `+${val}`,
                    size === 'giant' ? '#F59E0B' : '#B45309',
                    true,
                    'lootResources',
                    'gingerbread'
                  );
                  if (player.poutoveSrdceStacks && player.poutoveSrdceStacks > 0) {
                    const cdMult = player.gingerbreadHeartCdMult || 1;
                    const oldUltCd = player.ultCd || 0;
                    let cdReduction = 0.2 * cdMult;
                    if (size === 'large') cdReduction = 0.6 * cdMult;
                    else if (size === 'giant') cdReduction = 2.0 * cdMult;

                    player.ultCd = Math.max(0, oldUltCd - cdReduction);

                    // Jemný záblesk zrcátka při dobití schopnosti
                    const fullyRecharged = oldUltCd > 0 && player.ultCd <= 0;
                    const sparkCount = fullyRecharged ? 14 : (size === 'giant' ? 8 : (size === 'large' ? 5 : 3));
                    const mirrorColors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#94A3B8', '#BAE6FD'];
                    for (let sp = 0; sp < sparkCount; sp++) {
                      const ang = Math.random() * Math.PI * 2;
                      const speed = (fullyRecharged ? 85 : 50) + Math.random() * 40;
                      emitParticle(engine.particles, () => ({
                        x: player.x + (Math.random() - 0.5) * 16,
                        y: player.y + (Math.random() - 0.5) * 16,
                        vx: Math.cos(ang) * speed,
                        vy: Math.sin(ang) * speed - 15,
                        life: fullyRecharged ? 0.45 : 0.32,
                        color: mirrorColors[sp % mirrorColors.length],
                        size: fullyRecharged ? 3.8 : 2.5,
                      }));
                    }

                    if (fullyRecharged) {
                      pushDamageText(engine.texts, player.x, player.y - 72, '🪞 ZRCÁTKO: NABITO!', '#F8FAFC', true);
                    }

                    if (size === 'large') {
                      player.gingerbreadSpeedTimer = 2.0;
                      pushDamageText(engine.texts, player.x, player.y - 50, 'CUKROVÝ SPĚCH! ⚡', '#F59E0B', true);
                    } else if (size === 'giant') {
                      const heal = 8 * player.poutoveSrdceStacks;
                      player.hp = Math.min(player.maxHp, player.hp + heal);
                      pushDamageText(engine.texts, player.x, player.y - 50, `+${heal} KURÁŽ! 💝`, '#EC4899', true);
                      for (let k = 0; k < 10; k++) {
                        const ang = (k / 10) * Math.PI * 2;
                        emitParticle(engine.particles, () => ({
                          x: player.x,
                          y: player.y,
                          vx: Math.cos(ang) * 90,
                          vy: Math.sin(ang) * 90,
                          life: 0.4,
                          color: '#FDE047',
                          size: 3.5,
                        }));
                      }
                    }
                  }
                  for (let i = 0; i < (size === 'giant' ? 8 : 4); i++) {
                    emitParticle(engine.particles, () => ({
                      x: player.x,
                      y: player.y,
                      vx: (Math.random() - 0.5) * 110,
                      vy: (Math.random() - 0.5) * 110,
                      life: 0.45,
                      color: '#F59E0B',
                      size: 3,
                    }));
                  }
                } else if (d.type === 'potion') {
                  sound.potion();
                  const waterLevel = metaRef.current.waterLevel || 0;
                  let potionHeal = 30 * (1 + waterLevel * 0.20);
                  if (d.isMercyDrop) {
                    const mercyCap = player.maxHp * 0.45;
                    if (player.hp + potionHeal > mercyCap) {
                      potionHeal = Math.max(0, mercyCap - player.hp);
                    }
                  }
                  applyBearMaskOverheal(player, potionHeal);
                  player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, Math.min(5, waterLevel > 0 ? 1 + waterLevel * 0.5 : 0));
                  pushDamageText(engine.texts, player.x, player.y - 45, `+${Math.round(potionHeal)} Kuráž (Jitrnice)`, COLORS.green, true);
                } else if (d.type === 'bread' || d.type === 'pear') {
                  sound.potion();
                  let foodHeal = 15;
                  if (d.isMercyDrop) {
                    const mercyCap = player.maxHp * 0.45;
                    if (player.hp + foodHeal > mercyCap) {
                      foodHeal = Math.max(0, mercyCap - player.hp);
                    }
                  }
                  applyBearMaskOverheal(player, foodHeal);
                  pushDamageText(engine.texts, player.x, player.y - 40, `+${Math.round(foodHeal)} Kuráž 🍐`, '#84CC16');
                } else if (d.type === 'soul') {
                  sound.soul();
                  player.soulBuffTimer = 6.0;
                  engine.souls += 1;
                  engine.coins += 25;
                  pushDamageText(engine.texts, player.x, player.y - 45, 'DUŠIČKA OSVOBOZENA! +25 kr.', COLORS.mustard, true);
                  const churchLvl = metaRef.current.churchLevel || 0;
                  if (churchLvl > 0) {
                    const waveDmg = getChurchWaveDamage(churchLvl);
                    const waveRadius = 350;
                    const nearby = enemySpatialHashRef.current.queryCircle(player.x, player.y, waveRadius + 60);
                    for (let i = 0; i < nearby.length; i++) {
                      const e = nearby[i];
                      if (e.isDefeated) continue;
                      const dx = e.x - player.x;
                      const dy = e.y - player.y;
                      const dist = Math.hypot(dx, dy) || 1;
                      if (dist <= waveRadius) {
                        e.takeDamage(waveDmg, 'holy', (dx / dist) * 280, (dy / dist) * 280);
                      }
                    }
                    sound.bell();
                    pushDamageText(engine.texts, player.x, player.y - 80, `SVATÁ VLNA! ⛪ -${waveDmg}`, '#FEF08A', true);
                    for (let i = 0; i < 18; i++) {
                      const ang = (i / 18) * Math.PI * 2;
                      emitParticle(engine.particles, () => ({
                        x: player.x + Math.cos(ang) * 30,
                        y: player.y + Math.sin(ang) * 30,
                        vx: Math.cos(ang) * 280,
                        vy: Math.sin(ang) * 280,
                        life: 0.35,
                        color: '#FEF08A',
                        size: 3.5,
                      }));
                    }
                  }
                } else if (d.type === 'chest') {
                  openChestSequence();
                } else if (d.type === 'horseshoe') {
                  sound.horseshoe();
                  applyMagnetWave(engine.drops, player.x, player.y, 99999, true);
                  pushDamageText(engine.texts, player.x, player.y - 48, 'KOVÁŘSKÁ PODKOVA! 🧲', '#EAB308', true, 'lootResources');
                } else if (d.type === 'rooster') {
                  sound.rooster();
                  engine.screenFlashTimer = 0.45;
                  engine.screenFlashColor = '#FFFFFF';
                  for (let k = 0; k < engine.enemies.length; k++) {
                    const foe = engine.enemies[k];
                    if (!foe.isDefeated && !foe.dead) {
                      if (foe.isBoss || foe.isMiniboss) {
                        foe.takeDamage(650, 'holy');
                      } else {
                        foe.takeDamage(foe.hp || 50, 'holy');
                      }
                    }
                  }
                  pushDamageText(engine.texts, player.x, player.y - 48, 'HLINĚNÝ KOHOUTEK! 🐓☀️', '#F59E0B', true, 'lootResources');
                } else if (d.type === 'cuckoo_clock') {
                  sound.cuckooClock();
                  engine.timeStopTimer = 4.0;
                  pushDamageText(engine.texts, player.x, player.y - 48, 'VYŘEZÁVANÉ KUKAČKY! ⏰', '#EAB308', true, 'lootResources');
                } else if (
                  d.type === 'ponocny_horn' ||
                  d.type === 'masopust_rattle' ||
                  d.type === 'babicka_apron' ||
                  d.type === 'slivovice_splash' ||
                  d.type === 'svanda_bagpipes' ||
                  d.type === 'kominik_button'
                ) {
                  applyRareItemEffect(engine, player, d.type, {
                    onSound: (name) => (sound as any)[name]?.(),
                    onDamageText: (opts) => pushDamageText(engine.texts, opts.x, opts.y, opts.text, opts.color || '#F59E0B', true, 'lootResources'),
                  });
                } else if (d.type === 'arcivzacny_ananas') {
                  const fMult = player._cachedFrostHealMult ?? getFrostAuraHealingMultiplier(player, enemySpatialHashRef.current.queryCircle(player.x, player.y, FROSTLING_AURA_RADIUS));
                  applyAnanasUpgrade(player, {
                    onSound: (name) => (sound as any)[name]?.(),
                    onDamageText: (opts) => pushDamageText(engine.texts, opts.x, opts.y, opts.text, opts.color || '#FDE047', true, 'lootResources'),
                  }, fMult);
                } else if (d.type === 'big_pouch') {
                  sound.coin();
                  const pouchVal = d.value || 35;
                  engine.coins += pouchVal;
                  pushDamageText(engine.texts, player.x, player.y - 75, `VELKÝ MĚŠEC! +${pouchVal} kr. 🪙`, '#F59E0B', true, 'lootResources');
                } else if (d.type === 'gingerbread_stash') {
                  sound.gingerbreadPickup();
                  const stashVal = d.value || 25;
                  engine.gingerbread += stashVal;
                  const mercyCap = player.maxHp * 0.45;
                  const healAmt = Math.max(0, Math.min(30, mercyCap - player.hp));
                  if (healAmt > 0) {
                    applyBearMaskOverheal(player, healAmt);
                    pushDamageText(engine.texts, player.x, player.y - 50, `+${Math.round(healAmt)} Kuráž! 🧺`, '#F43F5E', true, 'lootResources');
                  }
                  pushDamageText(engine.texts, player.x, player.y - 75, `KOŠÍK PERNÍKU! +${stashVal} 🧺`, '#D97706', true, 'lootResources', 'gingerbread');
                }
              }
            }
          }
          compactInPlace(engine.drops, keepLiveDrop);
          // Pickups and other removals free slots for any queued rewards.
          releasePendingDrops(engine.drops, engine.pendingDropBank);

          // Update texts
          for (const txt of engine.texts) {
            if (typeof txt.update === 'function') {
              txt.update(dt);
            } else {
              txt.y += (txt.vy ?? -45) * dt;
              txt.life = (txt.life ?? 0) - dt;
            }
          }
          compactInPlace(engine.texts, keepLiveText);
          if (engine.texts.length > MAX_DAMAGE_TEXTS) {
            engine.texts.splice(0, engine.texts.length - MAX_DAMAGE_TEXTS);
          }

          // Update smoke puffs
          if (engine.smokePuffs) {
            for (const puff of engine.smokePuffs) {
              puff.update(dt);
              if (puff.kind === 'plum-scent' || puff.kind === 'fajfka') {
                puff.damageAccumulator = (puff.damageAccumulator || 0) + dt;
                while (puff.damageAccumulator >= 0.25) {
                  const tick = 0.25;
                  puff.damageAccumulator -= 0.25;
                  const targets = enemySpatialHashRef.current.queryCircle(puff.x, puff.y, puff.radius + 60);
                  for (const enemy of targets) {
                    if (enemy.isDefeated || enemy.dead || Math.hypot(enemy.x - puff.x, enemy.y - puff.y) > puff.radius + (enemy.radius || 0)) continue;
                    if (!hasTerrainLineOfSight(puff.x, puff.y, enemy.x, enemy.y, engine.activeLevelId ?? 0, engine.decor)) continue;
                    if (puff.kind === 'plum-scent') {
                      enemy.takeDamage((puff.damagePerSecond || 0) * tick, 'food', 0, 0, { allowFractionalDamage: true });
                    } else {
                      const maxHp = Math.max(1, enemy.maxHp || 75);
                      const resistance = maxHp <= 75 ? 2 - (maxHp - 1) / 74 : Math.max(0, 1 - (maxHp - 75) / 75);
                      if (resistance <= 0) continue;
                      enemy.fajfkaSlowTimer = Math.max(enemy.fajfkaSlowTimer || 0, 0.30);
                      enemy.fajfkaMoveSlowFactor = 1 - 0.35 * resistance;
                      enemy.fajfkaAttackSlowFactor = 1 - 0.35 * resistance;
                      enemy.takeDamage((puff.damagePerSecond || 9) * tick * resistance, 'food', 0, 0, { allowFractionalDamage: true });
                    }
                  }
                }
              }
            }
            compactInPlace(engine.smokePuffs, keepLiveSmokePuff);
          }

          // Update particles
          if (engine.particles) {
            for (const p of engine.particles) {
              p.x += (p.vx || 0) * dt;
              p.y += (p.vy || 0) * dt;
              p.life -= dt;
            }
            compactInPlace(engine.particles, keepLiveParticle);
            const particleLimit = getParticleLimit(metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced'));
            if (engine.particles.length > particleLimit) {
              engine.particles.splice(0, engine.particles.length - particleLimit);
            }
          }
        }
      }      // Doznívání Pověstné sukovice
      if (engineRef.current.sukovice) {
        const suk = engineRef.current.sukovice;
        suk.t += dt;
        const p = engineRef.current.player;
        if (p) {
          suk.x = p.x;
          suk.y = p.y;
        }
        if (suk.t >= suk.dur) {
          engineRef.current.sukovice = null;
        }
      }

      // Doznívání Farního požehnání
      if (engineRef.current.blessing) {
        engineRef.current.blessing.t += dt;
        if (engineRef.current.blessing.t >= engineRef.current.blessing.dur) engineRef.current.blessing = null;
      }

      // Doznívání a aktivní trample Pasáčkova stáda beranů
      if (engineRef.current.shepherdStampede) {
        const st = engineRef.current.shepherdStampede;
        st.t += dt;
        st.lastTrampleCheck = (st.lastTrampleCheck || 0) + dt;
        if (st.lastTrampleCheck >= 0.25) {
          st.lastTrampleCheck = 0;
          const p = engineRef.current.player;
          const dmg = 35 * (p?.damageMultiplier || 1);
          const nearby = enemySpatialHashRef.current.queryCircle(st.x, st.y, 560);
          for (let i = 0; i < nearby.length; i++) {
            const e = nearby[i];
            if (!e.isDefeated && Math.hypot(e.x - st.x, e.y - st.y) <= 520) {
              e.takeDamage(dmg, 'physical', (st.dirX || 1) * 140, (Math.random() - 0.5) * 60);
            }
          }
        }
        if (st.t >= st.dur) engineRef.current.shepherdStampede = null;
      }

      // Doznívání a pulsy bylinného sanctuaria Kořenářky
      if (engineRef.current.korenarkaSanctuary) {
        const sc = engineRef.current.korenarkaSanctuary;
        sc.t += dt;
        sc.pulseTimer += dt;
        if (sc.pulseTimer >= 0.75) {
          sc.pulseTimer = 0;
          const p = engineRef.current.player;
          if (p && p.hp < p.maxHp) {
            applyBearMaskOverheal(p, 6);
            pushDamageText(engineRef.current.texts, p.x + (Math.random() - 0.5) * 20, p.y - 45, '+6 Kuráž', '#4ADE80', false);
          }
          const dmg = 25 * (p?.damageMultiplier || 1);
          const nearby = enemySpatialHashRef.current.queryCircle(sc.x, sc.y, 460);
          for (let i = 0; i < nearby.length; i++) {
            const e = nearby[i];
            if (!e.isDefeated && Math.hypot(e.x - sc.x, e.y - sc.y) <= 420) {
              e.takeDamage(dmg, 'nature', (e.x - sc.x) * 1.5, (e.y - sc.y) * 1.5);
              e.soak();
            }
          }
        }
        if (sc.t >= sc.dur) engineRef.current.korenarkaSanctuary = null;
      }

      // Update lightning atmospheric timers
      if (engineRef.current.lightningFlash > 0) {
        engineRef.current.lightningFlash -= dt;
      }
      if (engineRef.current.lightningStrike) {
        engineRef.current.lightningStrike.time -= dt;
        if (engineRef.current.lightningStrike.time <= 0) {
          engineRef.current.lightningStrike = null;
        }
      }

      // -------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------
      frameProfiler.mark('backdrop', performance.now());
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentGameState === 'playing' || currentGameState === 'fleeing' || currentGameState === 'chest' || currentGameState === 'paused' || currentGameState === 'grandfather' || currentGameState === 'milestone') {
        const engine = engineRef.current;
        const player = engine.player;
        const cam = engine.camera;
        const curLvl = GAME_LEVELS[engine.activeLevelId !== undefined ? engine.activeLevelId : (currentSelectedLevelId !== undefined ? currentSelectedLevelId : 0)] || GAME_LEVELS[0];
        const phase = engine.currentPhase || getCurrentDayPhase(engine.gameTime, curLvl.id);
        const isWinter = curLvl.season === 'winter';

        const kurazRatio = player ? Math.max(0, Math.min(1, player.hp / Math.max(1, player.maxHp))) : 1;

// Rebuild static decor chunks if day phase, season or theme changed
        const isNight = ['dusk', 'night', 'midnight', 'dawn'].includes(phase.id);
        if (arenaChunkCacheRef.current && arenaChunkCacheRef.current.getChunkCount() > 0) {
          arenaChunkCacheRef.current.rebuildIfChanged(engine.decor, curLvl.season, curLvl.theme, isNight);
        }

        const tremor = (engine.cameraTremorTimer > 0)
          ? (engine.cameraTremorIntensity || 10) * Math.min(1, engine.cameraTremorTimer / 0.25)
          : 0;
        const shakeX = tremor > 0 ? (Math.random() - 0.5) * tremor : 0;
        const shakeY = tremor > 0 ? (Math.random() - 0.5) * tremor : 0;

        // ADR 0034: Native 1.0 scale on 900p+ screens; adaptive zoom on compact displays (< 768px)
        const camZoom = canvas.height < 768 ? Math.max(0.75, Math.min(1.0, canvas.height / 850)) : 1.0;
        const effectiveW = canvas.width / camZoom;
        const effectiveH = canvas.height / camZoom;

        const camera = arenaCameraRef.current;
        camera.x = cam.x + shakeX;
        camera.y = cam.y + shakeY;
        camera.width = effectiveW;
        camera.height = effectiveH;
        camera.viewLeft = camera.x - 120;
        camera.viewTop = camera.y - 160;
        camera.viewRight = camera.x + effectiveW + 120;
        camera.viewBottom = camera.y + effectiveH + 160;
        camera.zoom = camZoom;

        const currentProfile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');

        frameProfiler.mark('world', performance.now());

        const arenaOptions = arenaRenderOptionsRef.current;
        arenaOptions.performanceProfile = currentProfile;
        arenaOptions.combatVfxEnabled = isGameEffectEnabled('combatVfxEnabled');
        arenaOptions.combatTextsEnabled = isGameEffectEnabled('effectsEnabled');
        arenaOptions.lightingEnabled = isGameEffectEnabled('dynamicLightingEnabled');
        arenaOptions.warningIndicatorsEnabled = isGameEffectEnabled('warningIndicatorsEnabled');
        arenaOptions.statusIndicatorsEnabled = isGameEffectEnabled('statusIndicatorsEnabled');
        arenaOptions.chunkCache = arenaChunkCacheRef.current ?? undefined;
        arenaOptions.curLvl = curLvl;
        arenaOptions.dayPhase = phase;
        arenaOptions.snowmanHorde = snowmanHordeRef.current;
        arenaOptions.isPaused = currentGameState !== 'playing';
        arenaOptions.deltaTimeSeconds = frameProfiler.frameDelta / 1000;
        arenaOptions.sunOverlayConfig = sunOverlayConfigRef.current;
        arenaOptions.sunFrameState = sunFrameStateRef.current;
        latestFpsRef.current = frameProfiler.fps;
        const arenaMetrics = renderArena(ctx, engine, camera, arenaOptions, arenaMetricsRef.current);

        lastCombatTextsMsRef.current = arenaMetrics.timings.combatTextsMs;
        frameProfiler.mark('overlays', performance.now());
        // Partition renderArena's measured sub-passes into FrameProfiler's backdrop / world / lighting buckets
        frameProfiler.current.backdrop += arenaMetrics.timings.backdropMs;
        frameProfiler.current.lighting += arenaMetrics.timings.lightingMs;
        frameProfiler.current.world = Math.max(
          0,
          frameProfiler.current.world - arenaMetrics.timings.backdropMs - arenaMetrics.timings.lightingMs
        );

        // Mrazivý zimní okraj z Trouby obecního ponocného
        if (isGameEffectEnabled('combatVfxEnabled') && engine.ponocnyFrostTimer > 0) {
          Lada.drawFrostBorder(ctx, canvas.width, canvas.height, Math.min(1, engine.ponocnyFrostTimer / 2));
        }

        // Atmosférický banner vzácných pomocných předmětů
        if (isGameEffectEnabled('combatVfxEnabled') && engine.activeRareOverlay) {
          if (engine.activeRareOverlay.type === 'ponocny_horn') {
            Lada.drawPonocnyNightOverlay(ctx, canvas.width, canvas.height, Math.min(1, engine.activeRareOverlay.timer));
          } else if (engine.activeRareOverlay.type === 'kominik_button') {
            Lada.drawKominikOverlay(ctx, canvas.width, canvas.height, Math.min(1, engine.activeRareOverlay.timer));
          }
        }

        // Ladovský ukazatel na dědečka, pokud se ocitne mimo obrazovku
        if (engine.grandfather.active && player && currentGameState === 'playing') {
          const gScreenX = engine.grandfather.x - engine.camera.x;
          const gScreenY = engine.grandfather.y - engine.camera.y;
          const isOffscreen = gScreenX < 40 || gScreenX > canvas.width - 40 || gScreenY < 40 || gScreenY > canvas.height - 40;
          if (isOffscreen) {
            const pScreenX = player.x - engine.camera.x;
            const pScreenY = player.y - engine.camera.y;
            const dx = gScreenX - pScreenX;
            const dy = gScreenY - pScreenY;
            const angle = Math.atan2(dy, dx);
            const dist = Math.round(Math.hypot(engine.grandfather.x - player.x, engine.grandfather.y - player.y));
            const edgeMargin = 55;
            const cx = Math.max(edgeMargin, Math.min(canvas.width - edgeMargin, canvas.width / 2 + Math.cos(angle) * (canvas.width / 2 - 75)));
            const cy = Math.max(edgeMargin, Math.min(canvas.height - edgeMargin, canvas.height / 2 + Math.sin(angle) * (canvas.height / 2 - 65)));

            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = '#FDECC8';
            ctx.strokeStyle = '#2D1609';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-60, -16, 120, 32, 10);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#5B2118';
            ctx.font = '900 13px Eczar, serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`🧺 Dědeček (${dist} m)`, 0, 0);
            ctx.restore();
          }
        }

        // Enable with ?perf or Settings toggle to inspect the live frame budget
        const isPerfVisible = showPerformanceOverlay || !!metaRef.current.showPerfOverlay;
        if (isPerfVisible) {
          const timings = frameProfiler.smoothed;
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(12, 12, 318, 126);
          ctx.strokeStyle = '#D9A036';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(12, 12, 318, 126);
          ctx.font = '700 13px monospace';
          const currentFps = frameProfiler.fps;
          ctx.fillStyle = currentFps >= 50 ? '#4ADE80' : currentFps >= 30 ? '#FBBF24' : '#EF4444';
          ctx.fillText(`${currentFps} FPS (CPU: ${timings.total.toFixed(1)} ms)${(metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced')) === 'performance' ? ' [MAX FPS]' : (metaRef.current.performanceProfile || 'balanced') === 'fidelity' ? ' [GRAFIKA]' : ' [VYVÁŽENÝ]'}`, 22, 33);
          ctx.fillStyle = '#E2E8F0';
          ctx.fillText(`Nepřátelé: ${engine.enemies.length} | Střely: ${engine.projectiles.length}`, 22, 51);
          ctx.fillText(`Částice: ${engine.particles.length} | Texty: ${engine.texts.length}`, 22, 69);
          ctx.fillText(`Sim: ${timings.simulation.toFixed(1)} | Pozadí: ${timings.backdrop.toFixed(1)} | Svět: ${timings.world.toFixed(1)} ms`, 22, 87);
          ctx.fillText(`Světla: ${timings.lighting.toFixed(1)} | Overlaye: ${timings.overlays.toFixed(1)} ms`, 22, 105);
          ctx.font = '500 11px monospace';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`FPS = rAF (${frameProfiler.frameDelta.toFixed(0)} ms) | CPU = průměr fází`, 22, 123);
          ctx.restore();
        }

        // Screen flash from Saint Elias lightning
        if (engine.lightningFlash > 0) {
          ctx.fillStyle = `rgba(255, 255, 240, ${Math.min(0.65, engine.lightningFlash * 1.5)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Příběhová scénka se zastaveným časem (Babička, Pasáček, Kořenářka)
        if (engine.cutscene) {
          if (engine.cutscene.type === 'shepherd') {
            Lada.drawShepherdScene(ctx, canvas.width, canvas.height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
          } else if (engine.cutscene.type === 'korenarka') {
            Lada.drawKorenarkaScene(ctx, canvas.width, canvas.height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
          } else {
            Lada.drawGrannyScene(ctx, canvas.width, canvas.height, engine.cutscene.t, engine.cutscene.dur, engine.cutscene.applyAt);
          }
        }

        // Weather overlay per level: snowflakes, autumn leaves, or graveyard mist
        if (curLvl.weatherEffect === 'snow') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          const t = engine.uiTime;
          for (let i = 0; i < 55; i++) {
            const sx = ((i * 123 + t * 45) % canvas.width);
            const sy = ((i * 77 + t * 85) % canvas.height);
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (curLvl.weatherEffect === 'leaves') {
          const t = engine.uiTime;
          for (let i = 0; i < 35; i++) {
            const sx = ((i * 147 + t * 35 + Math.sin(t + i) * 25) % canvas.width);
            const sy = ((i * 93 + t * 45) % canvas.height);
            ctx.fillStyle = i % 3 === 0 ? 'rgba(217, 160, 54, 0.75)' : i % 3 === 1 ? 'rgba(209, 52, 43, 0.65)' : 'rgba(140, 90, 53, 0.7)';
            ctx.beginPath();
            ctx.ellipse(sx, sy, 4, 2.5, Math.sin(t * 1.5 + i), 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (curLvl.weatherEffect === 'fog') {
          const t = engine.uiTime;
          const fogCanvas = getFogPuffCanvas();
          if (fogCanvas) {
            for (let i = 0; i < 22; i++) {
              const sx = ((i * 190 + t * 22) % (canvas.width + 200)) - 100;
              const sy = (i * 55 + Math.sin(t * 0.5 + i) * 30) % canvas.height;
              ctx.drawImage(fogCanvas, sx - 120, sy - 120);
            }
          }
        }

        const smoothedTimings = frameProfiler.end(performance.now());
        if (currentGameState === 'playing') {
          const gov = adaptiveGovernorRef.current;
          const smoothedMs = smoothedTimings.total;
          const combatMs = lastCombatTextsMsRef.current;

          if (smoothedMs > 18) {
            gov.tier1Timer += dt;
            gov.recoveryTimer = 0;
          } else if (smoothedMs < 16) {
            gov.recoveryTimer += dt;
            if (gov.recoveryTimer >= 3.0) {
              if (gov.tier > 0) {
                gov.tier--;
                gov.recoveryTimer = 0;
                if (gov.tier === 0) {
                  gov.tier1Timer = 0;
                  activeMaxParticlesRef.current = MAX_PARTICLES;
                  if (gov.originalCombatPreset) {
                    const preset = gov.originalCombatPreset === 'custom' ? 'full' : gov.originalCombatPreset;
                    setCombatTextSettings(getSettingsForPreset(preset));
                    gov.originalCombatPreset = null;
                  }
                } else if (gov.tier === 1) {
                  if (gov.originalCombatPreset) {
                    const preset = gov.originalCombatPreset === 'custom' ? 'full' : gov.originalCombatPreset;
                    setCombatTextSettings(getSettingsForPreset(preset));
                    gov.originalCombatPreset = null;
                  }
                }
              }
            }
          } else {
            gov.recoveryTimer = 0;
          }

          if (smoothedMs > 26 && gov.tier < 3) {
            gov.tier = 3;
            if (!gov.originalCombatPreset) {
              gov.originalCombatPreset = getCombatTextPreset();
            }
            setCombatTextSettings(TACTICAL_COMBAT_TEXT_SETTINGS);
            activeMaxParticlesRef.current = 100;
          } else if ((smoothedMs > 22 || combatMs > 2.0) && gov.tier < 2) {
            gov.tier = 2;
            if (!gov.originalCombatPreset) {
              gov.originalCombatPreset = getCombatTextPreset();
            }
            setCombatTextSettings(TACTICAL_COMBAT_TEXT_SETTINGS);
            activeMaxParticlesRef.current = 100;
          } else if (gov.tier1Timer >= 2.0 && gov.tier < 1) {
            gov.tier = 1;
            activeMaxParticlesRef.current = 100;
          }
        }
      }
      } catch (err) {
        console.error('Error in game loop:', err);
      } finally {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Enemy instance factory with customized AI state machine
  // Consistent authentic stats: specific enemies (e.g. Kostlivec) always have identical base stats;
  // challenge scales solely through arrival of advanced enemies and enemy density.
  // Minibosses are significantly larger, more prominent with golden runic aura/overhead HP bar, and much tougher.
  const createEnemyInstance = (
    id: string,
    x: number,
    y: number,
    multiplier = 1,
    isBoss = false,
    isMiniboss = false,
    customBossTitle?: string,
    prefix?: EnemyPrefixType
  ) => {
    let resolvedId = id;
    let stats = ENEMIES[resolvedId];
    if (!stats) {
      console.warn(`[Bubakov] Unknown enemy id: "${id}", resolving safe fallback`);
      const fallbackMap: Record<string, string> = {
        kostlivec_obr: 'umrlec',
        skeleton: 'kostlivec',
        skeleton_scythe: 'kostlivec_kosa',
        kostlivec_koste: 'kostlivec_kosa',
        smrtka_minion: 'krvavy_kostlivec',
        rampouch: 'severak',
        sanice: 'vanicka',
        medved_bubak: 'hromotluk',
        lapka: 'zbojnik',
        uhlif: 'sazovy_rarach',
        cernokneznik_minion: 'plivnik',
        permonik: 'zbojnik',
        kamenny_bubak: 'obrneny_zbojnik',
        prizrak: 'bila_pani',
        panos: 'zbrojnos',
        strazce: 'obrneny_zbojnik',
        chrlivka: 'nocni_mura',
        netopyr_obr: 'bubak',
        draci_plivnik: 'plivnik',
        lavy_rarach: 'sazovy_rarach',
        pekelny_pes: 'ohnivy_pes',
      };
      resolvedId =
        fallbackMap[id] ||
        ((engineRef.current?.activeLevelId ?? 0) === 0
          ? 'mrazovy_skritek'
          : (engineRef.current?.activeLevelId ?? 1) === 2
          ? 'skeleton'
          : 'rarach');
      stats = ENEMIES[resolvedId] || ENEMIES.rarach;
    }
    const isLevel0 = (engineRef.current?.activeLevelId ?? 0) === 0;
    if (isLevel0 && prefix === 'pekelny') {
      prefix = undefined;
    }
    let finalHp = Math.round(stats.hp * (multiplier || 1));
    if (isMiniboss) {
      if (resolvedId === 'vrana') {
        finalHp = 38; // 38 Kuráže na vránu = ~342 Kuráže celkem pro vyvážené 9členné hejno
      } else {
        finalHp = isLevel0 ? Math.max(finalHp, 220) : Math.max(finalHp, 1400);
      }
    }
    const renderScale = (resolvedId === 'vrana' && isMiniboss) ? 1.2 : resolvedId === 'vrana' ? 0.34 : isMiniboss ? 1.75 : (isBoss ? 1.35 : 1.0);
    const radius = (resolvedId === 'vrana' && isMiniboss) ? Math.round(stats.radius * 1.15) : isMiniboss ? Math.round(stats.radius * 1.65) : (isBoss ? stats.radius * 1.3 : stats.radius);
    let poiseResist = isMiniboss ? Math.max(0.82, (stats.poiseResist || 0) + 0.45) : (stats.poiseResist || 0);
    const foodResist = isMiniboss ? Math.max(0.78, (stats.foodResist || 0) + 0.45) : (stats.foodResist || 0);
    const hunger = isMiniboss
      ? Math.max(0.78, (stats.hunger !== undefined ? stats.hunger : (stats.foodResist || 0)) + 0.45)
      : (stats.hunger !== undefined ? stats.hunger : (stats.foodResist || 0));
    const willpower = isMiniboss ? Math.max(0.85, (stats.willpower || 0) + 0.45) : (stats.willpower || 0);
    const cadence: EnemyAttackCadence = stats.attackCadence || 'normal';
    let attackInterval = stats.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
    const baseDamage = (resolvedId === 'vrana' && isMiniboss)
      ? 8 // férové poškození 8 na vránu (souhrnně ~24 dmg při zásahu několika vran)
      : isMiniboss
      ? Math.round(stats.damage * (isLevel0 ? 1.05 : 1.35))
      : stats.damage;
    let enemyDamage = baseDamage;
    const coinValue = isMiniboss ? Math.max(25, (stats.coinValue || 1) * 6) : (stats.coinValue || 1);
    const xp = isMiniboss ? Math.max(20, (stats.xp || 1) * 5) : stats.xp;

    const isLevel1 = (engineRef.current?.activeLevelId ?? 1) === 1;
    const rawMinibossSpeed = (resolvedId === 'vrana' && isMiniboss) ? 260 : stats.speed;
    let enemySpeed = (resolvedId === 'vrana' && isMiniboss) ? 260 : (isMiniboss ? Math.max(rawMinibossSpeed * 0.95, 68) : rawMinibossSpeed);
    if (resolvedId === 'polednice' && isLevel1) {
      enemySpeed = Math.round(enemySpeed * 0.85);
    }

    let dodgeChance = 0;
    let prefixDamageReduction = 0;
    let isThunderous = false;
    let hasFireTrail = false;
    let immuneToStun = false;
    let immuneToSnackStun = false;
    let thornsReflectRatio = 0;
    let thornsRange = 0;

    if (prefix) {
      const pDef = ENEMY_PREFIX_DEFS[prefix];
      if (pDef) {
        if (pDef.hpMultiplier) finalHp = Math.max(1, Math.round(finalHp * pDef.hpMultiplier));
        if (pDef.speedBonus) enemySpeed += pDef.speedBonus;
        if (pDef.speedMultiplier) enemySpeed = Math.round(enemySpeed * pDef.speedMultiplier);
        if (pDef.attackIntervalMultiplier) attackInterval = attackInterval * pDef.attackIntervalMultiplier;
        if (pDef.dodgeChance) dodgeChance = pDef.dodgeChance;
        if (pDef.damageReduction) prefixDamageReduction = pDef.damageReduction;
        if (pDef.immuneToStun) immuneToStun = true;
        if (pDef.immuneToSnackStun) immuneToSnackStun = true;
        if (pDef.thornsReflectRatio) thornsReflectRatio = pDef.thornsReflectRatio;
        if (pDef.thornsRange) thornsRange = pDef.thornsRange;
        if (prefix === 'hromovy') isThunderous = true;
        if (prefix === 'pekelny') hasFireTrail = true;
        if (prefix === 'kamenny') poiseResist = Math.min(0.98, poiseResist + 0.6);
      }
    }

    const mass = typeof stats.mass === 'number' ? stats.mass : (radius / 15);
    // Accessibility modifiers apply after enemy prefixes, including elites and bosses.
    const accessibilityLevel = mobileAccessibilityLevelRef.current;
    const accessibilityAttackMultiplier = 1 - accessibilityLevel * 0.02;
    if (accessibilityLevel > 0) {
      enemySpeed *= accessibilityAttackMultiplier;
      enemyDamage = Math.max(1, Math.round(enemyDamage * (1 - accessibilityLevel * 0.03)));
      attackInterval /= accessibilityAttackMultiplier;
    }

    const strikeDuration = cadence === 'slow' ? 0.65 : cadence === 'fast' ? 0.22 : 0.42;
    const computedWindupDelay = Math.max(0.2, attackInterval - strikeDuration);
    let attackDelay = typeof stats.attackDelay === 'number' ? stats.attackDelay : computedWindupDelay;
    if (prefix && ENEMY_PREFIX_DEFS[prefix]?.attackIntervalMultiplier && typeof stats.attackDelay === 'number') {
      attackDelay = attackDelay * ENEMY_PREFIX_DEFS[prefix].attackIntervalMultiplier!;
    }
    // Computed windup delay already uses the reduced attack interval; avoid scaling it twice.
    if (accessibilityLevel > 0 && typeof stats.attackDelay === 'number') {
      attackDelay /= accessibilityAttackMultiplier;
    }
    const attackRange = typeof stats.attackRange === 'number' ? stats.attackRange : (radius + 25);

    const instance = {
      id: resolvedId,
      x,
      y,
      isBoss,
      isMiniboss,
      customBossTitle: customBossTitle || '',
      prefix,
      dodgeChance,
      prefixDamageReduction,
      isThunderous,
      hasFireTrail,
      immuneToStun,
      immuneToSnackStun,
      thornsReflectRatio,
      thornsRange,
      stalkSpeedBonus: 0,
      magmaTrailTimer: 0,
      fissureTimer: 0,
      renderScale,
      maxHp: finalHp,
      hp: finalHp,
      speed: enemySpeed,
      damage: enemyDamage,
      mass,
      attackDelay,
      attackRange,
      windupTimer: 0,
      vycerpanyTimer: 0,
      isAttacking: false,
      strikeTimer: 0,
      strikeMaxTimer: strikeDuration,
      attackAngle: 0,
      attackTargetX: 0,
      attackTargetY: 0,
      attackCadence: cadence,
      attackInterval,
      radius,
      foodResist,
      hunger,
      poiseResist,
      willpower,
      coinValue,
      xp,
      isFlying: Boolean(stats.isFlying || resolvedId === 'vrana'),
      category: stats.category,
      method: stats.method,
      palette: stats.palette,
      vx: 0,
      vy: 0,
      kbx: 0,
      kby: 0,
      soaked: false,
      soakedTimer: 0,
      chilled: false,
      chillTimer: 0,
      statusEffects: {} as Record<string, any>,
      knockbackImmune: false,
      knockbackResistance: 0,
      garlicSlowTimer: 0,
      fajfkaSlowTimer: 0,
      fajfkaMoveSlowFactor: 1,
      fajfkaAttackSlowFactor: 1,
      snackTimer: 0,
      stunTimer: 0,
      valecniceSlowed: false,
      defeatedByFood: false,
      foodDefeatTimer: 0,
      snackSoundTimer: 0,
      dead: false,
      isDefeated: false,
      panicked: false,
      panicTimer: 0,
      calmTimer: 0,
      hitFlashTimer: 0,
      inContact: false,
      contactTimer: 0,
      contactLeaveTimer: 0,
      animTime: Math.random() * 10,
      semiVisible: resolvedId === 'jezinka_mraziva',

      hasShadowDefense: false,
      shadowVulnerabilityTimer: 0,
      silhouetteInvertTimer: 0,
      bludickaAttracted: false,
      bludickaLight: null as DynamicLightSource | null,
      _lightCheckTimer: Math.random() * 0.12,
      _isLit: false,

      cleanupLight() {
        if (this.bludickaLight && engineRef.current?.lightSources) {
          const idx = engineRef.current.lightSources.indexOf(this.bludickaLight);
          if (idx !== -1) {
            engineRef.current.lightSources.splice(idx, 1);
          }
          this.bludickaLight = null;
        }
      },

      // Specialized AI state machine variables
      aiState: 'idle' as string,
      aiTimer: Math.random() * 1.2,
      specialCd: (1.0 + Math.random() * 2.0) * (isBoss || isMiniboss || stats.category === 'bosses' ? 1.0 : 1.3),
      orbitRadius: 130 + Math.random() * 60,
      orbitDir: Math.random() < 0.5 ? 1 : -1,
      orbitAngle: Math.random() * Math.PI * 2,
      crowForageTarget: null as any,
      crowForageTimer: 0,
      crowForageCooldown: 2 + Math.random() * 2,
      isGroundedForLoot: false,
      isCarryingLootBundle: false,
      carryingLootBundle: [] as any[],
      crowEscapeTimer: 0,
      escapeDirX: 0,
      escapeDirY: 0,
      escapedWithLoot: false,
      isVirtualCrowMember: false,
      _crowWaveActive: false,
      _crowWaveInEngine: false,
      _crowWaveOwner: null as VirtualLeaderCrowWave | null,
      crowWaveIndex: -1,
      crowWavePointMultiplier: 1,
      crowHeading: 0,
      crowFlapScale: 1,
      crowContactCooldown: 0,
      isVirtualSnowmanMember: false,
      _snowmanHordeActive: false,
      _snowmanHordeInEngine: false,
      _snowmanHordeOwner: null as VirtualLeaderSnowmanHorde | null,
      snowmanHordeIndex: -1,
      snowmanPointMultiplier: 1,
      snowmanContactCooldown: 0,
      meltHpRatio: 1.0,
      meltSquashX: 1.0,
      meltSquashY: 1.0,
      wobbleScaleX: 1.0,
      wobbleScaleY: 1.0,
      zigZagTimer: 0,
      zigZagDir: Math.random() < 0.5 ? 1 : -1,
      chargeDirX: 0,
      chargeSpeed: 0,
      pendingAttack: '' as string,
      puddleCd: (2.0 + Math.random() * 2.0) * (isBoss || isMiniboss || stats.category === 'bosses' ? 1.0 : 1.3),

      update(dt: number, player: any) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.contactTimer > 0) this.contactTimer -= dt;
        if (this.garlicSlowTimer > 0) this.garlicSlowTimer -= dt;
        if (this.fajfkaSlowTimer > 0) this.fajfkaSlowTimer -= dt;
        if (this.fajfkaSlowTimer <= 0) { this.fajfkaMoveSlowFactor = 1; this.fajfkaAttackSlowFactor = 1; }
        if ((this.fajfkaSlowTimer || 0) > 0 && this.strikeTimer > 0) this.strikeTimer += dt * ((1 / Math.max(0.1, this.fajfkaAttackSlowFactor || 0.65)) - 1);
        if (this.silhouetteInvertTimer > 0) this.silhouetteInvertTimer -= dt;

        // Pekelný: Stopa žhavých uhlíků a plamínků
        if (this.hasFireTrail && !this.dead && !this.isDefeated && Math.random() < 0.28) {
          emitParticle(
            engineRef.current?.particles,
            {
              x: this.x + (Math.random() - 0.5) * (this.radius * 0.8),
              y: this.y + this.radius * 0.4 + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 20,
              vy: -15 - Math.random() * 25,
              life: 0.35,
              color: Math.random() < 0.5 ? '#F97316' : '#EF4444',
              size: 3.5,
            },
            activeMaxParticlesRef.current
          );
        }

        for (const statusType in this.statusEffects) {
          const effect = this.statusEffects[statusType];
          if (!effect) continue;
          effect.remaining -= dt;
          if (effect.remaining <= 0) delete this.statusEffects[statusType];
        }
        if ((this.vycerpanyTimer || 0) > 0) {
          this.vycerpanyTimer = Math.max(0, this.vycerpanyTimer - dt);
        }
        if (this.id === 'tajici_snehulak' && !this.isVirtualSnowmanMember && !this.isDefeated && !this.dead) {
          const ratio = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp || 280)));
          this.meltHpRatio = ratio;
          this.meltSquashX = 1.0 + (1.0 - ratio) * 0.25;
          this.meltSquashY = 0.65 + ratio * 0.35;
          const s = Math.sin((this.animTime || 0) * 3.2);
          this.wobbleScaleX = 1.0 + 0.08 * s;
          this.wobbleScaleY = 1.0 - 0.08 * s;
        }
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        if (this.isDefeated) {
          this.cleanupLight();
          if (this.defeatedByFood) {
            // Defeated by food weapons: slowly walk away, enjoying the food snack
            this.foodDefeatTimer = (this.foodDefeatTimer || 0) + dt;

            // In the last 0.25s before disappearing, spawn gentle little anticipatory smoke / steam puffs (only if on screen)
            if (this.foodDefeatTimer >= 0.55 && Math.random() < 0.35 && distToPlayer < 650) {
              const ang = Math.random() * Math.PI * 2;
              emitParticle(
                engineRef.current.particles,
                {
                  x: this.x + Math.cos(ang) * (this.radius * 0.4),
                  y: this.y - this.radius * 0.35 + Math.sin(ang) * (this.radius * 0.25),
                  vx: (Math.random() - 0.5) * 15,
                  vy: -30 - Math.random() * 20,
                  life: 0.35,
                  color: '#FFFDF7',
                  size: 3.5,
                },
                activeMaxParticlesRef.current
              );
            }

            // Enemies defeated by food disappear after 0.85s or once off-screen
            if (this.foodDefeatTimer >= 0.85 || distToPlayer > 600) {
              this.dead = true;
              if (distToPlayer < 750) {
                engineRef.current.smokePuffs.push(new SmokePuff(this.x, this.y - this.radius * 0.35, this.radius));
                sound.smokePuff();
                pushDamageText(engineRef.current.texts, this.x, this.y - this.radius - 12, 'Puf! 💨', '#A8A29E');
              }
              return;
            }

            const walkSpd = this.speed * 0.45;
            const ang = Math.atan2(this.y - player.y, this.x - player.x);
            this.vx = Math.cos(ang) * walkSpd;
            this.vy = Math.sin(ang) * walkSpd;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.animTime += dt * 0.75;
            this.panicked = false;

            // Periodic gentle munch sound while walking away
            this.snackSoundTimer = (this.snackSoundTimer || 0) + dt;
            if (this.snackSoundTimer > 1.6) {
              this.snackSoundTimer = 0;
              if (distToPlayer < 650) {
                sound.snack();
              }
            }

            return;
          }

          // Defeated in combat: lively comic scramble sprint away from the hero!
          this.fleeTimer = (this.fleeTimer || 0) + dt;
          if (this.fleeTimer >= 0.85 || distToPlayer > 600) {
            this.dead = true;
            if (distToPlayer < 750) {
              engineRef.current.smokePuffs.push(new SmokePuff(this.x, this.y - this.radius * 0.35, this.radius));
              sound.smokePuff();
            }
            return;
          }

          const fleeSpd = this.speed * 3.2;
          const ang = Math.atan2(this.y - player.y, this.x - player.x);
          this.vx = Math.cos(ang) * fleeSpd;
          this.vy = Math.sin(ang) * fleeSpd;
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.animTime += dt * 2.2;
          this.panicked = true;

          // Occasionally spawn little cartoon dust puffs behind fleeing feet ONLY IF ON SCREEN
          if (distToPlayer < 650 && Math.random() < 0.15) {
            emitParticle(engineRef.current.particles, () => ({
              x: this.x - Math.cos(ang) * (this.radius * 0.8) + (Math.random() - 0.5) * 6,
              y: this.y + this.radius * 0.6 + (Math.random() - 0.5) * 4,
              vx: -Math.cos(ang) * 40 + (Math.random() - 0.5) * 20,
              vy: -Math.random() * 20,
              life: 0.3,
              color: '#D8C6A5',
              size: 3,
            }));
          }

          return;
        }

        if (this.prefix === 'kamenny' || this.immuneToStun || this.immuneToSnackStun) {
          this.stunTimer = 0;
          this.snackTimer = 0;
        }

        // Stunned state (e.g. struck by Válečnice's heavy rolling pin)
        if (this.stunTimer > 0) {
          this.stunTimer -= dt;
          if (this.stunTimer < 0) this.stunTimer = 0;
          this.vx = 0;
          this.vy = 0;
          if (this.aiState === 'windup') {
            this.aiState = 'idle';
            this.windupTimer = 0;
          }
          this.kbx *= 0.88;
          this.kby *= 0.88;
          this.x += this.kbx * dt;
          this.y += this.kby * dt;
          this.animTime += dt * 0.2;
          return;
        }

        // Snacking state (food weapons like Buchta) - enemy snacks and does nothing for a time
        if (this.snackTimer > 0) {
          this.snackTimer -= dt;
          if (this.snackTimer < 0) this.snackTimer = 0;
          this.vx = 0;
          this.vy = 0;
          this.kbx *= 0.85;
          this.kby *= 0.85;
          this.animTime += dt * 0.7; // gentle munch animation
          this.x += this.kbx * dt;
          this.y += this.kby * dt;
          return;
        }

        this.kbx *= 0.9;
        this.kby *= 0.9;
        const animRate =
          this.aiState === 'charge' || this.aiState === 'lunge' || this.aiState === 'hop_leap'
            ? 1.45
            : this.chilled
            ? 0.55
            : this.soaked || (this.vycerpanyTimer || 0) > 0 || this.prefix === 'vycerpany'
            ? 0.65
            : (this.calmTimer || 0) > 0
            ? 0.5
            : 1.0;
        this.animTime += dt * animRate;

        if (this.panicTimer > 0) {
          this.panicTimer = Math.max(0, this.panicTimer - dt);
        }
        this.panicked = this.panicTimer > 0;

        const shadowMods = getShadowDefenseMultipliers(this);
        let spd = this.speed * this.getMovementSpeedMultiplier() * shadowMods.speedMult * (this.garlicSlowTimer > 0 ? 0.85 : 1) * ((this.fajfkaSlowTimer || 0) > 0 ? (this.fajfkaMoveSlowFactor || 0.65) : 1);
        if (this.bludickaAttracted) spd *= 1.15;
        if (player._valecniceSlowRadius && player._valecniceSlowRadius > 0) {
          const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
          if (distToPlayer <= player._valecniceSlowRadius + this.radius) {
            this.valecniceSlowed = true;
            const effWillpower = Math.max(0, Math.min(1, (this.willpower || 0) * (1 - 0.20)));
            const slowBase = player._valecniceSlowRate || 0.25;
            const slowFactor = slowBase * Math.max(0.15, 1 - effWillpower * 0.75);
            spd *= (1 - slowFactor);
          } else {
            this.valecniceSlowed = false;
          }
        } else {
          this.valecniceSlowed = false;
        }
        if (this.soaked) {
          spd *= 0.55;
          this.soakedTimer -= dt;
          if (this.soakedTimer <= 0) this.soaked = false;
        }
        if (this.chilled) {
          spd *= 0.45;
          this.chillTimer -= dt;
          if (this.chillTimer <= 0) this.chilled = false;
        }
        if (this.calmTimer > 0) {
          spd *= 0.3;
          this.calmTimer -= dt;
        }
        if ((this.vycerpanyTimer || 0) > 0) {
          spd *= 0.50;
        }
        if (
          !((this.isFlying || this.id === 'vrana') && !this.isGroundedForLoot) &&
          engineRef.current.plumPuddles &&
          engineRef.current.plumPuddles.length > 0
        ) {
          for (let pi = 0; pi < engineRef.current.plumPuddles.length; pi++) {
            const pud = engineRef.current.plumPuddles[pi];
            const maxR = (pud.radius || 44) + this.radius;
            const pdx = this.x - pud.x;
            const pdy = this.y - pud.y;
            if (Math.abs(pdx) <= maxR && Math.abs(pdy) <= maxR && pdx * pdx + pdy * pdy <= maxR * maxR) {
              spd *= (1 - (pud.slowRatio || 0.35));
              break;
            }
          }
        }

        // ----------------------------------------------------
        // PEKELNÝ PREFIX: ANTI-KITING SYSTÉM (3 INSPIRACE)
        // ----------------------------------------------------
        if (this.prefix === 'pekelny' && !this.panicked && !this.isDefeated) {
          // 1. INSPIRACE: Slag Snails (Lingering Magma Trail)
          // Zanechává za sebou trvalé hořící louže lávy trvající 8-10 sekund
          this.magmaTrailTimer = (this.magmaTrailTimer || 0) - dt;
          if (this.magmaTrailTimer <= 0) {
            this.magmaTrailTimer = 0.38;
            engineRef.current.projectiles.push({
              x: this.x,
              y: this.y,
              vx: 0,
              vy: 0,
              radius: 20,
              life: 8.5,
              dmg: 6,
              isEnemy: true,
              isPuddle: true,
              visual: 'magma_trail',
              dead: false,
            });
            if (Math.random() < 0.5) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x + (Math.random() - 0.5) * 12,
                y: this.y + (Math.random() - 0.5) * 12,
                vx: (Math.random() - 0.5) * 20,
                vy: -30 - Math.random() * 25,
                life: 0.4,
                color: Math.random() < 0.5 ? '#EA580C' : '#F59E0B',
                size: 3.5,
              }));
            }
          }

          // 2. INSPIRACE: Apex Prowler (Predatory Stalk)
          // Pokud hráč drží odstup > 220px, nabírá každou sekundu +18% rychlosti (až do +120%)
          if (distToPlayer > 220) {
            this.stalkSpeedBonus = Math.min(1.20, (this.stalkSpeedBonus || 0) + dt * 0.18);
          } else if (distToPlayer < 120) {
            // Přiblížení na tělo resetuje predátorský hon
            this.stalkSpeedBonus = Math.max(0, (this.stalkSpeedBonus || 0) - dt * 0.8);
          }

          if ((this.stalkSpeedBonus || 0) > 0) {
            spd *= (1 + this.stalkSpeedBonus);
          }

          // 3. INSPIRACE: Predictive Path Interceptors (Trajectory Eruption)
          // Pokud hráč nepřetržitě utíká přímočaře, pošle sopečnou erupci 210px dopředu na hráčův vektor
          this.fissureTimer = (this.fissureTimer || 0) - dt;
          const playerSpeed = Math.hypot(player.vx || 0, player.vy || 0);
          if (this.fissureTimer <= 0 && distToPlayer > 180 && distToPlayer < 700 && playerSpeed > 40) {
            this.fissureTimer = 4.2;
            const pMoveAng = Math.atan2(player.vy || 0, player.vx || 0);
            const leadDist = 210;
            const targetX = player.x + Math.cos(pMoveAng) * leadDist;
            const targetY = player.y + Math.sin(pMoveAng) * leadDist;

            engineRef.current.projectiles.push({
              x: targetX,
              y: targetY,
              vx: 0,
              vy: 0,
              radius: 36,
              life: 1.25,
              dmg: 18,
              isEnemy: true,
              isFissureTelegraph: true,
              visual: 'volcanic_fissure',
              dead: false,
            });
            pushDamageText(engineRef.current.texts, this.x, this.y - 45, 'SOPEČNÁ TRHLINA! 🔥', '#EF4444', true);
          }
        }

        const dirToPlayer = Math.atan2(player.y - this.y, player.x - this.x);

        // Flee state has absolute priority over distance and specialized AI.
        if (this.panicked) {
          const dx = this.x - player.x;
          const dy = this.y - player.y;
          const distSq = dx * dx + dy * dy;
          let fleeX = 1;
          let fleeY = 0;

          if (distSq > 0.0001) {
            const invDist = 1 / Math.sqrt(distSq);
            fleeX = dx * invDist;
            fleeY = dy * invDist;
          } else {
            fleeX = this.lastDx || 1;
            fleeY = this.lastDy || 0;
            const len = Math.hypot(fleeX, fleeY) || 1;
            fleeX /= len;
            fleeY /= len;
          }

          const fleeSpd = spd * 1.8;
          this.vx = fleeX * fleeSpd;
          this.vy = fleeY * fleeSpd;
          this.x += (this.vx + this.kbx) * dt;
          this.y += (this.vy + this.kby) * dt;
          this.animTime += dt * 0.5;
          this.lastDx = this.vx;
          this.lastDy = this.vy;

          if (distSq < 650 * 650 && Math.random() < 0.15) {
            emitParticle(engineRef.current.particles, () => ({
              x: this.x - fleeX * (this.radius * 0.7) + (Math.random() - 0.5) * 6,
              y: this.y - fleeY * (this.radius * 0.7) + (Math.random() - 0.5) * 6,
              vx: -fleeX * 20 + (Math.random() - 0.5) * 15,
              vy: -fleeY * 20 - Math.random() * 20,
              life: 0.35,
              color: 'rgba(215, 200, 175, 0.65)',
              size: 3 + Math.random() * 3,
            }));
          }
          return;
        }

        // Reposition stranded enemies that are far away back to active perimeter around player
        if (distToPlayer > 1350 && !this.isBoss && !this.isMiniboss && !this.isCarryingLootBundle) {
          const ang = Math.random() * Math.PI * 2;
          const pos = RunDirector.getOffscreenPosition(player, ang, engineRef.current, 180);
          this.x = pos.x;
          this.y = pos.y;
          this.vx = 0;
          this.vy = 0;
          return;
        }

        // Streamlined update for distant off-screen enemies: direct pursuit towards hero
        if (distToPlayer > 850 && !this.isBoss && !this.isMiniboss && !this.isCarryingLootBundle) {
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
          this.x += (this.vx + this.kbx) * dt;
          this.y += (this.vy + this.kby) * dt;
          return;
        }

        // Bludička dynamic ambient light (on-screen only)
        if (this.id === 'bludicka') {
          if (!this.bludickaLight) {
            this.bludickaLight = {
              id: `bludicka_${this.bludickaLightId || (this.bludickaLightId = Math.random().toString(36).substring(2, 9))}`,
              x: this.x,
              y: this.y,
              radius: 175,
              color: '#67E8F9',
              type: 'bludicka',
            };
            engineRef.current?.lightSources?.push(this.bludickaLight);
          } else {
            this.bludickaLight.x = this.x;
            this.bludickaLight.y = this.y;
          }
        }

        // Stínová záštita (Shadow Defense) - throttled ray/occluder check (0.10s-0.15s, staggered by animTime)
        if (this.category === 'shadows' && !this.dead && !this.isDefeated) {
          this._lightCheckTimer = (this._lightCheckTimer ?? 0) - dt;
          if (this._lightCheckTimer <= 0) {
            this._lightCheckTimer = 0.10 + (Math.abs(Math.sin(this.animTime)) * 0.05);
            const dayPhase = engineRef.current?.currentPhase || getCurrentDayPhase(engineRef.current?.gameTime || 0, engineRef.current?.activeLevelId);
            this._isLit = isPositionIlluminated(
              this.x,
              this.y,
              engineRef.current?.lightSources || [],
              dayPhase.id,
              engineRef.current?.shadowZones || [],
              engineRef.current?.occluders || []
            );
          }
          evaluateShadowDefense(this, this._isLit ?? false, dt, {
            onBreak: (shadowEnemy) => {
              if (engineRef.current?.particles && engineRef.current.particles.length < MAX_PARTICLES - 8) {
                for (let k = 0; k < 6; k++) {
                  const ang = Math.random() * Math.PI * 2;
                  const spd = 40 + Math.random() * 50;
                  emitParticle(engineRef.current.particles, () => ({
                    x: shadowEnemy.x,
                    y: shadowEnemy.y - shadowEnemy.radius * 0.4,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    life: 0.35,
                    color: '#1E1B18',
                    size: 3.5,
                  }));
                }
              }
            },
          });
        }

        // ----------------------------------------------------
        // SPECIALIZED ENEMY AI BEHAVIORS
        // ----------------------------------------------------
        const prevAiState = this.aiState;
        this.aiTimer -= dt;
        this.specialCd -= dt;

        const isEliteOrBoss = Boolean(this.isBoss || this.isMiniboss || this.category === 'bosses');
        // Všem bubákům, kteří nejsou boss nebo miniboss, se zvyšuje doba nápřahu i cooldown speciálních útoků o 30 %
        const windupMult = isEliteOrBoss ? 1.0 : 1.3;
        const specialCdMult = isEliteOrBoss ? 1.0 : 1.3;

        // Stage 1: fast airborne crows weave around the hunter instead of hopping on the ground.
        if (this.id === 'vrana') {
          if (this.isMinibossFlockMember) {
            this.isGroundedForLoot = false;
            const flockIdx = typeof this.flockIndex === 'number' ? this.flockIndex : 0;
            const flockTot = typeof this.flockTotal === 'number' && this.flockTotal > 0 ? this.flockTotal : 9;
            const phaseOffset = (flockIdx / flockTot) * Math.PI * 2;
            const swirlRadius = distToPlayer > 110 ? 38 : 16;
            const targetX = player.x + Math.cos(this.animTime * 2.8 + phaseOffset) * swirlRadius;
            const targetY = player.y + Math.sin(this.animTime * 2.8 + phaseOffset) * swirlRadius;
            const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
            const weave = Math.sin(this.animTime * 7.5 + phaseOffset) * 0.34;
            const flightAngle = angleToTarget + weave;
            const flightSpeed = spd * (distToPlayer > 170 ? 1.24 : 0.94);
            this.vx = Math.cos(flightAngle) * flightSpeed;
            this.vy = Math.sin(flightAngle) * flightSpeed + Math.sin(this.animTime * 9 + phaseOffset) * 10;
          } else {
            const eng = engineRef.current;
            if (eng && !eng.dynamicDropLedger) {
              eng.dynamicDropLedger = { stolenCoins: 0, stolenGingerbread: 0, stolenHeals: 0, stolenItemsCount: 0 };
            }
            const foraging = stepCrowForaging(this, eng?.drops || [], dt, spd, {
              player,
              camera: eng?.camera,
              viewWidth: canvasRef.current?.width,
              viewHeight: canvasRef.current?.height,
              pendingDropBank: eng?.pendingDropBank,
              swarmReservoir: eng?.swarmReservoir,
              dynamicDropLedger: eng?.dynamicDropLedger,
              onBundlePacked: (crow, items) => {
                if (eng?.texts) {
                  pushDamageText(eng.texts, crow.x, crow.y - 28, `UZLÍČEK! (${items.length}×) 🐦‍⬛🎒`, '#EF4444', true, 'lootResources');
                }
              },
              onEscape: (crow, summary) => {
                if (eng?.texts && player) {
                  pushDamageText(eng.texts, player.x, player.y - 58, `VRÁNA ULÉTLA S KOŘISTÍ! (-${summary.totalItems}) 🐦‍⬛💨`, '#DC2626', true, 'lootResources');
                }
              },
            });
            if (foraging.escaped) {
              return;
            }
            if (foraging.active) {
              this.vx = foraging.vx;
              this.vy = foraging.vy;
            } else {
              const weave = Math.sin(this.animTime * 8 + (this.orbitAngle || 0)) * 0.48;
              const flightAngle = dirToPlayer + weave;
              const flightSpeed = spd * (distToPlayer > 170 ? 1.22 : 0.88);
              this.vx = Math.cos(flightAngle) * flightSpeed;
              this.vy = Math.sin(flightAngle) * flightSpeed + Math.sin(this.animTime * 10) * 12;
            }
          }
        } else if (this.id === 'mrazovy_skritek') {
          this.vx = Math.cos(dirToPlayer) * spd * 0.82;
          this.vy = Math.sin(dirToPlayer) * spd * 0.82;
          this.frostAuraTimer = Math.max(0, (this.frostAuraTimer || 0) - dt);
          if (distToPlayer <= FROSTLING_AURA_RADIUS && this.frostAuraTimer <= 0) {
            this.frostAuraTimer = 0.7;
            player.takeDamage(3, 'cold');
            if (typeof player.chill === 'function') player.chill(0.65);
            emitParticle(engineRef.current.particles, () => ({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 24, vy: (Math.random() - 0.5) * 24, life: 0.35, color: '#BAE6FD', size: 3 }));
          }
        }

        // 1. RARÁŠEK (rarach / sazovy_rarach) - Hejnové obkličování & prudké výpady
        else if (this.id === 'rarach' || this.id === 'sazovy_rarach') {
          if (this.aiState === 'lunge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.5;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.5;
            if (this.aiTimer <= 0 || distToPlayer < this.radius + player.radius) {
              this.aiState = 'recoil';
              this.aiTimer = 0.4;
            }
          } else if (this.aiState === 'recoil') {
            this.vx = -Math.cos(dirToPlayer) * spd * 1.5;
            this.vy = -Math.sin(dirToPlayer) * spd * 1.5;
            if (this.aiTimer <= 0) {
              this.aiState = 'circle';
              this.specialCd = (2.5 + Math.random() * 2.5) * specialCdMult;
            }
          } else {
            if (this.specialCd <= 0 && distToPlayer < 240) {
              this.aiState = 'lunge';
              this.aiTimer = 0.45 * windupMult;
              this.chargeDirX = dirToPlayer;
              for (let i = 0; i < 3; i++) {
                emitParticle(engineRef.current.particles, () => ({
                  x: this.x,
                  y: this.y,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.3,
                  color: this.id === 'sazovy_rarach' ? '#F97316' : '#262626',
                  size: 3,
                }));
              }
            } else {
              this.aiState = 'circle';
              this.orbitAngle += this.orbitDir * 1.8 * dt;
              const targetOrbitX = player.x + Math.cos(this.orbitAngle) * (this.orbitRadius + Math.sin(this.animTime * 3) * 20);
              const targetOrbitY = player.y + Math.sin(this.orbitAngle) * (this.orbitRadius + Math.sin(this.animTime * 3) * 20);
              const toOrbitAng = Math.atan2(targetOrbitY - this.y, targetOrbitX - this.x);
              const circleSpd = distToPlayer > 280 ? spd * 1.3 : spd;
              this.vx = Math.cos(toOrbitAng) * circleSpd;
              this.vy = Math.sin(toOrbitAng) * circleSpd;
            }
          }
        }

        // 2. ŠOTEK (sotek) - Náhlé změny směru (erratic zig-zagging)
        else if (this.id === 'sotek') {
          this.zigZagTimer -= dt;
          if (this.zigZagTimer <= 0) {
            this.zigZagTimer = 0.6 + Math.random() * 0.7;
            this.zigZagDir = Math.random() < 0.5 ? -1 : 1;
          }
          const zigAngle = dirToPlayer + this.zigZagDir * 0.85;
          this.vx = Math.cos(zigAngle) * spd * 1.15;
          this.vy = Math.sin(zigAngle) * spd * 1.15;
        }

        // 3. PLIVNÍK (plivnik) - Hbité poskakování & ohnivé jiskření
        else if (this.id === 'plivnik') {
          if (this.aiState === 'hop_leap') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.3;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.3;
            if (Math.random() < 0.4) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 70,
                vy: (Math.random() - 0.5) * 70,
                life: 0.25,
                color: Math.random() < 0.5 ? '#F97316' : '#FDE047',
                size: 3,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'hop_rest';
              this.aiTimer = 0.25 + Math.random() * 0.15;
            }
          } else {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'hop_leap';
              this.aiTimer = 0.32;
              this.chargeDirX = dirToPlayer + (Math.random() - 0.5) * 0.4;
            }
          }
        }

        // 4. RYBNIČNÍ ŽABKA / ROPUCHA (zaba / ropucha) - Skákavý pohyb
        else if (this.id === 'zaba' || this.id === 'ropucha') {
          if (this.aiState === 'hop_leap') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.5;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.5;
            if (this.aiTimer <= 0) {
              this.aiState = 'hop_rest';
              this.aiTimer = 0.55 + Math.random() * 0.25;
            }
          } else {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'hop_leap';
              this.aiTimer = 0.38;
              this.chargeDirX = dirToPlayer + (Math.random() - 0.5) * 0.3;
              for (let i = 0; i < 2; i++) {
                emitParticle(engineRef.current.particles, () => ({
                  x: this.x,
                  y: this.y,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.2,
                  color: this.id === 'ropucha' ? '#15803D' : '#60A5FA',
                  size: 2.5,
                }));
              }
            }
          }
        }

        // 5. KOSTLIVEC ZE SVATÉHO JIŘÍ / KRVAVÝ KOSTLIVEC (kostlivec / skeleton / krvavy_kostlivec)
        else if (this.id === 'kostlivec' || this.id === 'skeleton' || this.id === 'krvavy_kostlivec') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.22;
              sound.slash();
            }
          } else if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.8;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.8;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 2.4 * specialCdMult;
            }
          } else {
            if (distToPlayer < 78 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.32 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 6. KOSTLIVEC S KOSOU (kostlivec_kosa / skeleton_scythe) - Seknutí kosou & vlnový oblouk
        else if (this.id === 'kostlivec_kosa' || this.id === 'skeleton_scythe') {
          const isLvl1 = (engineRef.current.activeLevelId ?? 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.6 * specialCdMult;
              sound.slash();
              if (!isLvl1 || this.isBoss) {
                engineRef.current.projectiles.push({
                  x: this.x + Math.cos(this.chargeDirX) * 20,
                  y: this.y + Math.sin(this.chargeDirX) * 20,
                  vx: Math.cos(this.chargeDirX) * 230,
                  vy: Math.sin(this.chargeDirX) * 230,
                  angle: this.chargeDirX,
                  speed: 230,
                  dmg: this.damage,
                  radius: 20,
                  type: 'physical',
                  visual: 'scythe_wave',
                  life: 1.1,
                  isEnemy: true,
                  pushback: 30,
                  statusText: 'SEKNUTÍ KOSOU! 🌾',
                  dead: false,
                });
              } else {
                if (distToPlayer < 75) {
                  player.takeDamage(this.damage, 'physical', this, true);
                  pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'SEKNUTÍ KOSOU! 🌾', COLORS.bone, true);
                }
              }
            }
          } else {
            if (distToPlayer < 140 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.42 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 7. PANSKÝ PÍSAŘ PO SMRTI (pisar) - Ranged kiting & vrh lahviček s inkoustem
        else if (this.id === 'pisar') {
          const isLvl1 = (engineRef.current.activeLevelId ?? 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.2 * specialCdMult;
              sound.slash();
              if (!isLvl1 || this.isBoss) {
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(this.chargeDirX) * 260,
                  vy: Math.sin(this.chargeDirX) * 260,
                  angle: this.chargeDirX,
                  rotation: 0,
                  rotSpeed: 8,
                  speed: 260,
                  dmg: this.damage,
                  radius: 14,
                  type: 'magic',
                  visual: 'ink_bottle',
                  life: 2.2,
                  isEnemy: true,
                  slowPlayer: true,
                  statusText: 'ZALEPEN INKOUSTEM! ✒️',
                  dead: false,
                });
              } else {
                if (distToPlayer < 70) {
                  player.takeDamage(this.damage, 'magic', this, true);
                }
              }
            }
          } else {
            if (!isLvl1 || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 320) {
                this.aiState = 'windup';
                this.aiTimer = 0.35 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              } else {
                if (distToPlayer < 170) {
                  this.vx = -Math.cos(dirToPlayer) * spd * 0.9;
                  this.vy = -Math.sin(dirToPlayer) * spd * 0.9;
                } else if (distToPlayer > 260) {
                  this.vx = Math.cos(dirToPlayer) * spd;
                  this.vy = Math.sin(dirToPlayer) * spd;
                } else {
                  this.vx = -Math.sin(dirToPlayer) * spd * 0.45;
                  this.vy = Math.cos(dirToPlayer) * spd * 0.45;
                }
              }
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 8. PROKLETÝ HROBNÍK (hrobnik) - Vrhání hrobové hlíny
        else if (this.id === 'hrobnik') {
          const isLvl1 = (engineRef.current.activeLevelId ?? 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.6 * specialCdMult;
              sound.heavyHit();
              if (!isLvl1 || this.isBoss) {
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(this.chargeDirX) * 230,
                  vy: Math.sin(this.chargeDirX) * 230,
                  angle: this.chargeDirX,
                  speed: 230,
                  dmg: this.damage,
                  radius: 16,
                  type: 'blunt',
                  visual: 'dirt_clod',
                  life: 2.2,
                  isEnemy: true,
                  pushback: 25,
                  statusText: 'HROBOVÁ HLÍNA! 🪦',
                  dead: false,
                });
              } else {
                if (distToPlayer < 75) {
                  player.takeDamage(this.damage, 'blunt', this, true);
                  pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'ÚDER LOPATOU! 🪦', COLORS.grey, true);
                }
              }
            }
          } else {
            if (!isLvl1 || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 300) {
                this.aiState = 'windup';
                this.aiTimer = 0.4 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              } else {
                if (distToPlayer < 150) {
                  this.vx = -Math.cos(dirToPlayer) * spd * 0.75;
                  this.vy = -Math.sin(dirToPlayer) * spd * 0.75;
                } else if (distToPlayer > 230) {
                  this.vx = Math.cos(dirToPlayer) * spd;
                  this.vy = Math.sin(dirToPlayer) * spd;
                } else {
                  this.vx = -Math.sin(dirToPlayer) * spd * 0.35;
                  this.vy = Math.cos(dirToPlayer) * spd * 0.35;
                }
              }
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 9. RYCHTÁŘŮV UMRLEC (umrlec) - Těžký dupot s otřesem
        else if (this.id === 'umrlec') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.8 * specialCdMult;
              sound.heavyHit();
              pushDamageText(engineRef.current.texts, this.x, this.y - 45, 'DUPOT! 💥', COLORS.ink, true);
              for (let i = 0; i < 16; i++) {
                const ang = (i / 16) * Math.PI * 2;
                emitParticle(engineRef.current.particles, () => ({
                  x: this.x + Math.cos(ang) * 20,
                  y: this.y + Math.sin(ang) * 20,
                  vx: Math.cos(ang) * 160,
                  vy: Math.sin(ang) * 160,
                  life: 0.45,
                  color: '#78350F',
                  size: 5,
                }));
              }
              if (distToPlayer < 125) {
                player.takeDamage(22, 'blunt', this, true);
                player.x += Math.cos(dirToPlayer) * 45;
                player.y += Math.sin(dirToPlayer) * 45;
              }
            }
          } else {
            if (distToPlayer < 110 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.5 * windupMult;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 10. ČERNÝ PES (cerny_pes) - Neobyčejně rychlý náběh (stalk & charge)
        else if (this.id === 'cerny_pes' || this.id === 'ohnivy_pes') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (Math.random() < 0.6) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x + (Math.random() - 0.5) * 12,
                y: this.y - 10 + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 20,
                vy: -Math.random() * 30,
                life: 0.35,
                color: '#EF4444',
                size: 3,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.75;
              sound.roar();
            }
          } else if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.4;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.4;
            if (this.aiTimer <= 0) {
              this.aiState = 'cooldown';
              this.aiTimer = 0.8;
            }
          } else if (this.aiState === 'cooldown') {
            this.vx = Math.cos(dirToPlayer) * spd * 0.4;
            this.vy = Math.sin(dirToPlayer) * spd * 0.4;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = (3.8 + Math.random() * 2.0) * specialCdMult;
            }
          } else {
            if (this.specialCd <= 0 && distToPlayer < 280) {
              this.aiState = 'windup';
              this.aiTimer = 0.5 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 11. BAHENNÍ VODNÍČEK (vodnicek) - Hází mazlavé leknínové bahno (v úvodních úrovních nestřílí!)
        else if (this.id === 'vodnicek') {
          const isIntroLvl = (engineRef.current.activeLevelId ?? 1) <= 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.4 * specialCdMult;
              sound.splash();
              if (!isIntroLvl || this.isBoss) {
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(this.chargeDirX) * 240,
                  vy: Math.sin(this.chargeDirX) * 240,
                  angle: this.chargeDirX,
                  speed: 240,
                  dmg: this.damage,
                  radius: 14,
                  type: 'nature',
                  visual: 'mud_ball',
                  life: 2.0,
                  isEnemy: true,
                  soakPlayer: true,
                  slowPlayer: true,
                  statusText: 'LEKNÍNOVÉ BAHNO! 🌿',
                  dead: false,
                });
              } else {
                // V úvodních úrovních střílí jen bossové – vodníček pouze šplíchne zblízka
                if (distToPlayer < 70) {
                  player.takeDamage(Math.round(this.damage * 0.65), 'nature', this, true);
                  pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'ŠPLÍCH! 💧', '#38BDF8', true);
                }
              }
            }
          } else {
            if (!isIntroLvl || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 290) {
                this.aiState = 'windup';
                this.aiTimer = 0.35 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              } else {
                if (distToPlayer < 160) {
                  this.vx = -Math.cos(dirToPlayer) * spd * 0.8;
                  this.vy = -Math.sin(dirToPlayer) * spd * 0.8;
                } else if (distToPlayer > 240) {
                  this.vx = Math.cos(dirToPlayer) * spd;
                  this.vy = Math.sin(dirToPlayer) * spd;
                } else {
                  this.vx = -Math.sin(dirToPlayer) * spd * 0.5;
                  this.vy = Math.cos(dirToPlayer) * spd * 0.5;
                }
              }
            } else {
              // V 1. levelu se běžně pohybuje za hráčem
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 12. HASTRMAN V ŠOSU (hastrman) - Rozlévá louže & přivolává žabky
        else if (this.id === 'hastrman') {
          this.puddleCd -= dt;
          if (this.puddleCd <= 0) {
            this.puddleCd = 3.5 * specialCdMult;
            engineRef.current.projectiles.push({
              x: this.x,
              y: this.y,
              vx: 0,
              vy: 0,
              radius: 24,
              life: 6.0,
              dmg: 0,
              isEnemy: true,
              isPuddle: true,
              visual: 'water_puddle',
              dead: false,
            });
          }
          if (this.specialCd <= 0) {
            this.specialCd = 8.5 * specialCdMult;
            sound.splash();
            pushDamageText(engineRef.current.texts, this.x, this.y - 45, 'ŽABÍ POMOCNÍCI! 🐸', '#38BDF8', true);
            for (let i = 0; i < 2; i++) {
              const ang = Math.random() * Math.PI * 2;
              engineRef.current.enemies.push(
                createEnemyInstance('zaba', this.x + Math.cos(ang) * 45, this.y + Math.sin(ang) * 45, 0.75)
              );
            }
          }
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 13. ZIMNÍ MELUZÍNA (meluzina) - Krouživý let & bleskový náběh
        else if (this.id === 'meluzina') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.85;
              sound.freeze();
            }
          } else if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.8;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.8;
            if (Math.random() < 0.4) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                life: 0.35,
                color: '#E2E8F0',
                size: 3.5,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'circle';
              this.specialCd = 4.2 * specialCdMult;
              this.orbitRadius = 180 + Math.random() * 60;
            }
          } else {
            if (this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.4 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.orbitAngle += 2.0 * dt;
              const targetX = player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
              const targetY = player.y + Math.sin(this.orbitAngle) * this.orbitRadius;
              const ang = Math.atan2(targetY - this.y, targetX - this.x);
              this.vx = Math.cos(ang) * spd * 1.2;
              this.vy = Math.sin(ang) * spd * 1.2;
            }
          }
        }

        // 14. POLEDNICE (polednice) - Extrémní rychlost & srpový výpad
        else if (this.id === 'polednice') {
          const phaseId = runStatsRef.current.dayPhase?.id;
          const isNoon = phaseId === 'noon' || phaseId === 'afternoon';
          const currentSpd = isNoon ? spd * 1.35 : spd;

          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.32;
              sound.slash();
            }
          } else if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * currentSpd * 2.5;
            this.vy = Math.sin(this.chargeDirX) * currentSpd * 2.5;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.0 * specialCdMult;
            }
          } else {
            if (distToPlayer < 160 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.3 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * currentSpd;
              this.vy = Math.sin(dirToPlayer) * currentSpd;
            }
          }
        }

        // 15. BEZHLAVÝ RYTÍŘ (bezhlavy_rytir) - Odražená hlava se vrací & těžký výpad čepelí
        else if (this.id === 'bezhlavy_rytir') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              if (this.pendingAttack === 'throw') {
                this.aiState = 'idle';
                this.specialCd = 6.0 * specialCdMult;
                sound.roar();
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(this.chargeDirX) * 280,
                  vy: Math.sin(this.chargeDirX) * 280,
                  angle: this.chargeDirX,
                  speed: 280,
                  dmg: 36,
                  radius: 18,
                  type: 'physical',
                  visual: 'head_projectile',
                  life: 3.0,
                  maxLife: 3.0,
                  boomerang: true,
                  owner: this,
                  isEnemy: true,
                  pushback: 35,
                  statusText: 'ZTRACENÁ HLAVA! 💀',
                  dead: false,
                });
              } else {
                this.aiState = 'charge';
                this.aiTimer = 0.65;
                this.chargeSpeed = 260;
                this.specialCd = 5.0 * specialCdMult;
                sound.slash();
                pushDamageText(engineRef.current.texts, this.x, this.y - 50, 'VÝPAD ČEPELÍ! ⚔️', COLORS.red, true);
                this.vx = Math.cos(this.chargeDirX) * this.chargeSpeed;
                this.vy = Math.sin(this.chargeDirX) * this.chargeSpeed;
              }
            }
          } else if (this.aiState === 'charge') {
            const chargeSpd = this.chargeSpeed || (this.enraged ? 330 : 260);
            this.vx = Math.cos(this.chargeDirX) * chargeSpd;
            this.vy = Math.sin(this.chargeDirX) * chargeSpd;
            if (Math.random() < 0.35) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + this.radius * 0.5,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 30,
                life: 0.35,
                color: '#94A3B8',
                size: 3.5,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
            }
          } else {
            if (!this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 360 && distToPlayer >= 180) {
                this.aiState = 'windup';
                this.pendingAttack = 'throw';
                this.aiTimer = 0.45 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              } else if (this.specialCd <= 0 && distToPlayer < 180) {
                this.aiState = 'windup';
                this.pendingAttack = 'charge';
                this.aiTimer = 0.4 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              }
            }
            this.vx = Math.cos(dirToPlayer) * spd;
            this.vy = Math.sin(dirToPlayer) * spd;
          }
        }

        // 16. ZLOMYSLNÝ SNĚHULÁK (snehulak) - Mrazivé kutálení (rolling snowball dash)
        else if (this.id === 'snehulak') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.9;
              sound.freeze();
            }
          } else if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.2;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.2;
            if (Math.random() < 0.3) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.3,
                color: '#FFFFFF',
                size: 4,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.2 * specialCdMult;
            }
          } else {
            if (distToPlayer < 240 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.45 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 17. PEKELNÝ DRÁB (drab) - Těžký řetěz s velkým odhozením
        else if (this.id === 'drab') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.0 * specialCdMult;
              sound.slash();
              if (distToPlayer < 135) {
                player.takeDamage(this.damage, 'physical', this, true);
                player.x += Math.cos(dirToPlayer) * 55;
                player.y += Math.sin(dirToPlayer) * 55;
                pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'ŠLEHNUTÍ ŘETĚZEM! ⛓️', COLORS.red, true);
              }
            }
          } else {
            if (distToPlayer < 125 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.4 * windupMult;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 18. BLUDIČKA MOČÁLOVÁ (bludicka) - Vlnivý let vábící do bažin
        else if (this.id === 'bludicka') {
          const wave = Math.sin(this.animTime * 3.5) * 0.7;
          this.vx = Math.cos(dirToPlayer + wave) * spd;
          this.vy = Math.sin(dirToPlayer + wave) * spd;
        }

        // 19. PEKELNÝ ČERT (cert) - Pekelný výpad vidlemi & kopyty
        else if (this.id === 'cert') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            this.chargeDirX = dirToPlayer;
            if (Math.random() < 0.6) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x + (Math.random() - 0.5) * 22,
                y: this.y + this.radius * 0.7,
                vx: -Math.cos(this.chargeDirX) * (50 + Math.random() * 70),
                vy: -Math.sin(this.chargeDirX) * (50 + Math.random() * 70),
                life: 0.35,
                color: Math.random() < 0.5 ? '#F97316' : '#EF4444',
                size: 4,
              }));
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = this.isBoss ? (this.enraged ? 1.05 : 0.9) : 0.75;
              this.chargeSpeed = this.chargeSpeed || (this.isBoss ? (this.enraged ? 560 : 490) : 440);
              sound.slash();
              sound.roar();
              pushDamageText(engineRef.current.texts, this.x, this.y - 50, 'PEKELNÝ VÝPAD! 🔱💨', COLORS.mustard, true);
            }
          } else if (this.aiState === 'charge') {
            const chargeSpd = this.chargeSpeed || (this.isBoss ? (this.enraged ? 560 : 490) : 440);
            const chAng = Number.isFinite(this.chargeDirX) ? this.chargeDirX : dirToPlayer;
            this.vx = Math.cos(chAng) * chargeSpd;
            this.vy = Math.sin(chAng) * chargeSpd;

            for (let i = 0; i < 2; i++) {
              emitParticle(engineRef.current.particles, () => ({
                x: this.x - Math.cos(chAng) * 20 + (Math.random() - 0.5) * 16,
                y: this.y + this.radius * 0.4 + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.45,
                color: Math.random() < 0.4 ? '#DC2626' : Math.random() < 0.7 ? '#F97316' : '#FEF08A',
                size: 5,
              }));
            }

            if (this.aiTimer <= 0) {
              this.aiState = 'brake';
              this.aiTimer = 0.4;
              this.vx *= 0.25;
              this.vy *= 0.25;
              this.specialCd = (this.isBoss ? (this.enraged ? 4.5 : 6.5) : 5.5) * specialCdMult;
            }
          } else if (this.aiState === 'brake') {
            this.vx *= 0.85;
            this.vy *= 0.85;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
            }
          } else {
            if (!this.isBoss && distToPlayer < 380 && distToPlayer > 80 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.55 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.chargeSpeed = 440;
              this.vx = 0;
              this.vy = 0;
              sound.roar();
              pushDamageText(engineRef.current.texts, this.x, this.y - 50, 'DUSOT KOPYT! 🐂🔥', '#EF4444', true);
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 20. PŮLNOČNÍ HEJKAL (hejkal) - Hromové zahejkání & dubilka
        else if (this.id === 'hejkal') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 7.0 * specialCdMult;
              sound.roar();
              pushDamageText(engineRef.current.texts, this.x, this.y - 50, 'HÉÉÉ-J! 🌲🔊', '#22C55E', true);
              const baseAng = this.chargeDirX;
              for (let i = 0; i < 3; i++) {
                const wAng = baseAng + (i - 1) * 0.28;
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(wAng) * 230,
                  vy: Math.sin(wAng) * 230,
                  angle: wAng,
                  speed: 230,
                  dmg: 22,
                  radius: 12,
                  type: 'physical',
                  visual: 'wood_shard',
                  life: 2.5,
                  maxLife: 2.5,
                  isEnemy: true,
                  pushback: 30,
                  dead: false,
                });
              }
            }
          } else {
            if (!this.isBoss && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.5 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 21. SKALNÍ OBR (obr) - Valící se balvan
        else if (this.id === 'obr') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 6.5 * specialCdMult;
              sound.hit();
              pushDamageText(engineRef.current.texts, this.x, this.y - 45, 'VALÍCÍ SE BALVAN! 🪨', '#71717A', true);
              engineRef.current.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(this.chargeDirX) * 190,
                vy: Math.sin(this.chargeDirX) * 190,
                angle: this.chargeDirX,
                speed: 190,
                dmg: 26,
                radius: 20,
                type: 'physical',
                visual: 'boulder',
                life: 4.0,
                maxLife: 4.0,
                isEnemy: true,
                pushback: 45,
                dead: false,
              });
            }
          } else {
            if (!this.isBoss && this.specialCd <= 0 && distToPlayer > 160) {
              this.aiState = 'windup';
              this.aiTimer = 0.5 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 22. PROKLETÝ MLYNÁŘ (mlynar) - Mlýnský kámen
        else if (this.id === 'mlynar') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 6.0 * specialCdMult;
              sound.slash();
              pushDamageText(engineRef.current.texts, this.x, this.y - 40, 'MLÝNSKÝ KÁMEN! ⚙️', COLORS.grey, true);
              engineRef.current.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(this.chargeDirX) * 230,
                vy: Math.sin(this.chargeDirX) * 230,
                angle: this.chargeDirX,
                rotation: 0,
                rotSpeed: 5.5,
                speed: 230,
                dmg: 26,
                radius: 20,
                type: 'blunt',
                visual: 'millstone',
                life: 4.5,
                isEnemy: true,
                pushback: 35,
                dead: false,
              });
            }
          } else {
            if (!this.isBoss && this.specialCd <= 0 && distToPlayer > 150) {
              this.aiState = 'windup';
              this.aiTimer = 0.45 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 23. TŘÍHLAVÝ DRAK (drak) - Pohyb, kousnutí a ohnivý dračí dech
        else if (this.id === 'drak') {
          if (this.isBoss) {
            // Close range dragon bite & claw swipe
            if (distToPlayer < 135 && this.specialCd <= 0) {
              this.specialCd = 2.8;
              sound.heavyHit();
              sound.slash();
              pushDamageText(engineRef.current.texts, this.x, this.y - 65, 'DRAČÍ KRAFNUTÍ! 🐉🦷', '#DC2626', true);
              player.takeDamage(this.enraged ? 36 : 28, 'physical', this, true);
              player.x += Math.cos(dirToPlayer) * 55;
              player.y += Math.sin(dirToPlayer) * 55;
            }
          } else {
            if (this.aiState === 'windup') {
              this.vx = 0;
              this.vy = 0;
              if (this.aiTimer <= 0) {
                this.aiState = 'idle';
                this.specialCd = 5.5 * specialCdMult;
                sound.roar();
                pushDamageText(engineRef.current.texts, this.x, this.y - 55, 'DRAČÍ PLAMEN! 🔥', '#DC2626', true);
                for (let i = 0; i < 4; i++) {
                  const ang = this.chargeDirX - 0.3 + i * 0.2;
                  engineRef.current.projectiles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(ang) * 250,
                    vy: Math.sin(ang) * 250,
                    angle: ang,
                    speed: 250,
                    dmg: 26,
                    radius: 15,
                    type: 'fire',
                    visual: 'dragon_fireball',
                    life: 3.0,
                    maxLife: 3.0,
                    isEnemy: true,
                    pushback: 30,
                    dead: false,
                  });
                }
              }
            } else {
              if (this.specialCd <= 0) {
                this.aiState = 'windup';
                this.aiTimer = 0.5 * windupMult;
                this.chargeDirX = dirToPlayer;
                this.vx = 0;
                this.vy = 0;
              } else {
                this.vx = Math.cos(dirToPlayer) * spd;
                this.vy = Math.sin(dirToPlayer) * spd;
              }
            }
          }
        }

        // 24. ZBOJNÍK / OBRNĚNÝ ZBOJNÍK (zbojnik / obrneny_zbojnik) - Rychlý výpad z úkrytu
        else if (this.id === 'zbojnik' || this.id === 'obrneny_zbojnik') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.35;
              sound.slash();
            }
          } else if (this.aiState === 'charge') {
            const lungeSpd = spd * 2.2;
            this.vx = Math.cos(this.chargeDirX) * lungeSpd;
            this.vy = Math.sin(this.chargeDirX) * lungeSpd;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.5 * specialCdMult;
            }
          } else {
            if (distToPlayer < 175 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.35 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 25. BÍLÁ PANÍ (bila_pani) - Přízračný plavný let & náhlé zjevení
        else if (this.id === 'bila_pani') {
          const wave = Math.sin(this.animTime * 2.8) * 0.45;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 5.0 * specialCdMult;
              const stepAng = this.chargeDirX + (Math.random() - 0.5) * 0.35;
              this.x += Math.cos(stepAng) * 75;
              this.y += Math.sin(stepAng) * 75;
              sound.smokePuff();
              for (let i = 0; i < 8; i++) {
                emitParticle(engineRef.current.particles, () => ({
                  x: this.x + (Math.random() - 0.5) * 25,
                  y: this.y + (Math.random() - 0.5) * 25,
                  vx: (Math.random() - 0.5) * 35,
                  vy: (Math.random() - 0.5) * 35,
                  life: 0.45,
                  color: 'rgba(240, 249, 255, 0.85)',
                  size: 3.5,
                }));
              }
            }
          } else {
            if (distToPlayer < 240 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.35 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer + wave) * spd;
              this.vy = Math.sin(dirToPlayer + wave) * spd;
            }
          }
        }

        // 26. NOČNÍ MŮRA (nocni_mura) - Rychlý přepad ze tmy
        else if (this.id === 'nocni_mura') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.4;
              sound.roar();
            }
          } else if (this.aiState === 'charge') {
            const rushSpd = spd * 2.1;
            this.vx = Math.cos(this.chargeDirX) * rushSpd;
            this.vy = Math.sin(this.chargeDirX) * rushSpd;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.0 * specialCdMult;
            }
          } else {
            if (distToPlayer < 220 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.38 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 27. KLEKÁNICE (klekanice) - Šlehnutí pytlem & temný chlad
        else if (this.id === 'klekanice') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.5 * specialCdMult;
              sound.heavyHit();
              pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'JUTOVÝ PYTEL! 🎒', '#A16207', true);
              player.takeDamage(this.damage, 'blunt', this, true);
              player.slowTimer = Math.max(player.slowTimer || 0, 1.8);
              player.x += Math.cos(dirToPlayer) * 45;
              player.y += Math.sin(dirToPlayer) * 45;
            }
          } else {
            if (distToPlayer < 135 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.42 * windupMult;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 28. ZBROJNOŠ (zbrojnoš) - Úder kovaným štítem
        else if (this.id === 'zbrojnos') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.0 * specialCdMult;
              sound.heavyHit();
              pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'ÚDER ŠTÍTEM! 🛡️', '#64748B', true);
              player.takeDamage(Math.round(this.damage * 0.8), 'physical', this, true);
              player.x += Math.cos(dirToPlayer) * 50;
              player.y += Math.sin(dirToPlayer) * 50;
            }
          } else {
            if (distToPlayer < 120 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.38 * windupMult;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 29. DUCH DŘEVORUBCE (drevorubec) - Silný sek širočinou
        else if (this.id === 'drevorubec') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.6 * specialCdMult;
              sound.slash();
              pushDamageText(engineRef.current.texts, player.x, player.y - 45, 'SEK SEKEROU! 🪓', '#78350F', true);
              player.takeDamage(this.damage, 'physical', this, true);
            }
          } else {
            if (distToPlayer < 95 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.4 * windupMult;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 30. OHNIVÝ RARACH (ohnivy_muz) - Žhavé jiskry z pece
        else if (this.id === 'ohnivy_muz') {
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.5 * specialCdMult;
              sound.slash();
              engineRef.current.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(this.chargeDirX) * 220,
                vy: Math.sin(this.chargeDirX) * 220,
                angle: this.chargeDirX,
                speed: 220,
                dmg: this.damage,
                radius: 12,
                type: 'fire',
                visual: 'hell_spark',
                life: 2.2,
                maxLife: 2.2,
                isEnemy: true,
                pushback: 20,
                dead: false,
              });
            }
          } else {
            if (this.specialCd <= 0 && distToPlayer < 300) {
              this.aiState = 'windup';
              this.aiTimer = 0.45 * windupMult;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // STANDARD HOMING FOR OTHER MOBS
        else {
          if (this.aiState === 'charge') {
            const chargeSpd = this.chargeSpeed || (spd * 2.2);
            this.vx = Math.cos(this.chargeDirX) * chargeSpd;
            this.vy = Math.sin(this.chargeDirX) * chargeSpd;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
            }
          } else {
            this.vx = Math.cos(dirToPlayer) * spd;
            this.vy = Math.sin(dirToPlayer) * spd;
          }
        }

        if (this.aiState === 'windup') {
          if (prevAiState !== 'windup') {
            this.aiWindupDuration = Math.max(0.15, this.aiTimer || 0.45);
            if (!Number.isFinite(this.chargeDirX)) {
              this.chargeDirX = dirToPlayer;
            }
          }
          this.attackAngle = Number.isFinite(this.chargeDirX) ? this.chargeDirX : dirToPlayer;
        } else if (prevAiState === 'windup' && this.aiState === 'idle') {
          const strikeDur = this.attackCadence === 'slow' ? 0.45 : this.attackCadence === 'fast' ? 0.22 : 0.32;
          this.strikeTimer = strikeDur;
          this.strikeMaxTimer = strikeDur;
          this.attackAngle = Number.isFinite(this.chargeDirX) ? this.chargeDirX : dirToPlayer;
        }

        if (Math.abs(this.vx) > 0.1) {
          this.lastDx = this.vx;
        }

        this.x += (this.vx + this.kbx) * dt;
        this.y += (this.vy + this.kby) * dt;
      },

      takeDamage(amount: number, type: string, kbx: number, kby: number, options?: { ignoreResist?: number; stunDuration?: number; source?: string; isHunterCounter?: boolean; allowFractionalDamage?: boolean; cannotDodge?: boolean; ignoreDodge?: boolean; isCrit?: boolean; isCritical?: boolean }) {
        if (this.isDefeated) return;

        // Vichřicový: 50% šance vyhnout se jakémukoliv zranění (pokud útok neignoruje úhyb např. Formanský bič)
        if (this.prefix === 'vichricovy' && !options?.cannotDodge && !options?.ignoreDodge) {
          const dodge = typeof this.dodgeChance === 'number' ? this.dodgeChance : 0.50;
          if (Math.random() < dodge) {
            pushDamageText(engineRef.current.texts, this.x, this.y - 25, 'MINUL! 💨', '#38BDF8', true);
            return;
          }
        }

        // Kamenný: +60% redukce poškození
        if (this.prefixDamageReduction) {
          amount *= (1 - this.prefixDamageReduction);
        }

        const isLevelBoss = Boolean(this.isBoss);

        let finalDmg: number;
        if (options?.isHunterCounter) {
          // Zranění odpovídající 15 % maximální Kuráže lovce.
          // Resist zde nefunguje, pokud se nejedná o bosse levelu!
          if (isLevelBoss) {
            finalDmg = Math.max(1, amount * this.getDamageTakenMultiplier());
          } else {
            finalDmg = Math.max(1, amount);
          }
        } else {
          const ignore = Math.min(0.85, Math.max(0, options?.ignoreResist || 0));
          let mult = this.getDamageTakenMultiplier();
          if (type === 'mask') mult = Math.max(0, 1 - Math.max(0, Math.min(1, typeof this.willpower === 'number' ? this.willpower : 0)));
          if (ignore > 0 && mult < 1.0) {
            mult = mult + (1.0 - mult) * ignore;
          }
          finalDmg = amount * mult;
          if (!options?.allowFractionalDamage) finalDmg = Math.max(1, finalDmg);
          if (this.soaked) finalDmg *= 1.45;
          finalDmg += (metaRef.current.forgeLevel || 0) * 2;
        }

        const shadowMods = getShadowDefenseMultipliers(this);
        finalDmg *= shadowMods.damageTakenMult;
        if (type === 'holy') {
          const holyMult = (engineRef.current.player?.holyDamageMultiplier) || (1 + Math.max(0, metaRef.current.churchLevel || 0) * 0.08);
          finalDmg *= holyMult;
          this.silhouetteInvertTimer = 0.12;
        }

        const player = engineRef.current.player;
        if (player && player.snackBonusDmg && player.snackBonusDmg > 0 && type !== 'food') {
          const isSnacking = (this.snackTimer || 0) > 0;
          const isPickled = Boolean(this.statusEffects?.pickle_sickness);
          if (isSnacking || isPickled) {
            finalDmg *= (1 + player.snackBonusDmg);
          }
        }

        let isCriticalHit = Boolean(options?.isCrit || options?.isCritical);
        if (player && player.guaranteedCritTimer > 0) {
          isCriticalHit = true;
          finalDmg = Math.round(finalDmg * 2.2);
          if (finalDmg >= 1) {
            pushDamageText(engineRef.current.texts, this.x, this.y - 48, 'KRITICKÝ ZÁSAH! ✨', '#FDE047', true);
          }
        } else if (player) {
          let critChance = Math.max(0, player.luck ?? 0) * 0.001;
          if ((player.zPeklaStestiTimer || 0) > 0) {
            critChance += 0.10;
          }
          if ((player.cinovyTercStacks || 0) > 0 && this.hp >= (this.maxHp || 0)) {
            critChance *= 2.0 + (player.cinovyTercStacks - 1) * 0.5;
          }
          if (Math.random() < critChance) {
            isCriticalHit = true;
            const supinaBonus = (player.kominickaSupinaStacks || 0) * 0.25;
            finalDmg = Math.round(finalDmg * (1.65 + supinaBonus));
            if (finalDmg >= 1) {
              pushDamageText(engineRef.current.texts, this.x, this.y - 48, 'ŠŤASTNÝ ZÁSAH! 🎯', '#FBBF24', true);
            }
          }
        }

        if (isCriticalHit && player) {
          const now = engineRef.current?.gameTime ?? 0;

          // 1. Kominická šupina z kapra
          if ((player.kominickaSupinaStacks || 0) > 0 && now - (player._lastSupinaTime || 0) >= 0.8) {
            player._lastSupinaTime = now;
            const rollChance = Math.min(1.0, Math.max(0, player.luck || 100) * 0.0008 * player.kominickaSupinaStacks);
            if (Math.random() < rollChance) {
              const eng = engineRef.current;
              let closestDrop: any = null;
              let closestDistSq = 350 * 350;
              if (eng.drops) {
                for (let di = 0; di < eng.drops.length; di++) {
                  const d = eng.drops[di];
                  if (d.type === 'gingerbread' && !d.dead) {
                    const distSq = (d.x - this.x) * (d.x - this.x) + (d.y - this.y) * (d.y - this.y);
                    if (distSq < closestDistSq) {
                      closestDistSq = distSq;
                      closestDrop = d;
                    }
                  }
                }
              }
              if (closestDrop) {
                if (!closestDrop.size || closestDrop.size === 'small') {
                  closestDrop.size = 'large';
                  closestDrop.value = (closestDrop.value || 1) * 3;
                } else if (closestDrop.size === 'large') {
                  closestDrop.size = 'giant';
                  closestDrop.value = (closestDrop.value || 3) * 3;
                } else {
                  closestDrop.size = 'stash';
                  closestDrop.value = (closestDrop.value || 9) * 2;
                }
                sound.bell();
                pushDamageText(eng.texts, closestDrop.x, closestDrop.y - 25, 'POVÝŠENO! 🐟', '#FBBF24', true);
              } else {
                const ang = Math.random() * Math.PI * 2;
                spawnDropWithLimit(eng.drops, {
                  type: 'coin',
                  value: 2,
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(ang) * 65,
                  vy: Math.sin(ang) * 65,
                  radius: 10,
                  time: 0,
                  dead: false,
                }, eng.pendingDropBank);
                sound.coin();
                pushDamageText(eng.texts, this.x, this.y - 35, 'ŠUPINA DALA KREJCAR! 🐟', '#FDE047', true);
              }
            }
          }

          // 2. Jetelový čtyřlístek z mezí
          if ((player.jetelovyCtyrlistekStacks || 0) > 0 && now - (player._lastCtyrlistekTime || 0) >= 0.5) {
            player._lastCtyrlistekTime = now;
            player.zPeklaStestiTimer = 2.5;
            player.ultCd = Math.max(0, (player.ultCd || 0) - 0.25 * player.jetelovyCtyrlistekStacks);
            pushDamageText(engineRef.current.texts, player.x, player.y - 40, 'Z PEKLA ŠTĚSTÍ! 🍀', '#10B981', true);
          }

          // 3. Cínový střelecký terč ze střelnice
          if ((player.cinovyTercStacks || 0) > 0 && now - (player._lastTercTime || 0) >= 0.2) {
            player._lastTercTime = now;
            const tercStacks = player.cinovyTercStacks || 1;
            const tercRadius = 95 + (tercStacks - 1) * 20;
            const splashRatio = 0.35 + (tercStacks - 1) * 0.15;
            const splashDmg = Math.max(1, Math.round(finalDmg * splashRatio));
            const splashNearby = enemySpatialHashRef.current.queryRadius(this.x, this.y, tercRadius);
            for (let si = 0; si < splashNearby.length; si++) {
              const foe = splashNearby[si];
              if (foe === this || foe.isDefeated || foe.dead) continue;
              foe.takeDamage(splashDmg, 'area', 0, 0);
              if (typeof foe.interruptAttack === 'function') foe.interruptAttack();
            }
            pushDamageText(engineRef.current.texts, this.x, this.y - 30, 'POUŤOVÝ TŘESK! 🎯', '#F59E0B', false);
          }
        }

        if (!isCriticalHit && isJezinkaSemiVisible(this)) {
          finalDmg *= JEZINKA_UNCRITICAL_DAMAGE_MULTIPLIER;
        }

        this.hp -= finalDmg;
        this.hitFlashTimer = 0.12;

        // Hromový: Blesky vrací hráči polovinu zranění ve vzdálenosti 200px (zastropováno na max 25 % maxHp hráče, cooldown 0.25 s)
        if (this.prefix === 'hromovy' && player && player.hp > 0 && finalDmg > 0) {
          const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
          const now = engineRef.current?.gameTime ?? 0;
          const isKrajanekInvulnerable = player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0;
          if (distToPlayer <= 200 && (player.invulnerabilityTimer || 0) <= 0 && !isKrajanekInvulnerable && (!(this as any)._lastThornsTime || now - (this as any)._lastThornsTime >= 0.25)) {
            (this as any)._lastThornsTime = now;
            const maxReflect = Math.max(1, Math.round((player.maxHp || 100) * 0.25));
            const rawReflect = Math.max(1, Math.round(finalDmg * 0.5));
            const reflectDmg = Math.min(rawReflect, maxReflect);
            player.takeDamage(reflectDmg, 'lightning', this, false);
            sound.heavyHit();
            pushDamageText(engineRef.current.texts, this.x, this.y - 45, `BLESKOVÝ ODRAZ! -${reflectDmg} ⚡`, '#FDE047', true);
            for (let i = 0; i < 7; i++) {
              const t = i / 6;
              const px = this.x + (player.x - this.x) * t + (Math.random() - 0.5) * 20;
              const py = this.y + (player.y - this.y) * t + (Math.random() - 0.5) * 20;
              emitParticle(engineRef.current.particles, () => ({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                life: 0.22,
                color: '#FDE047',
                size: 3.5,
              }));
            }
          }
        }

        // Pekelný: Útok na blízko (<140px) nebo kontaktní zranění resetuje predatory stalk zrychlení
        if (this.prefix === 'pekelny') {
          const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
          if (distToPlayer <= 140 || options?.isHunterCounter || options?.source === 'valecnice') {
            this.stalkSpeedBonus = 0;
          }
        }

        // Damage numbers displayed for all weapon types, aggregated within 0.25s for fast multi-hits
        const dmgInt = Math.floor(finalDmg);
        if (dmgInt >= 1 && isCombatTextCategoryEnabled('enemyDamage')) {
          if ((this as any)._lastDamageText && (this as any)._lastDamageText.life > 0.45 && (this as any)._lastDamageTextType === type) {
            (this as any)._lastDamageText.addAmount?.(dmgInt);
          } else {
            let dt: DamageText;
            if (options?.isHunterCounter) {
              dt = pushDamageText(engineRef.current?.texts, this.x, this.y - 25, `${dmgInt} 💥`, '#F97316', false, 'enemyDamage');
            } else if (type === 'food') {
              dt = pushDamageText(engineRef.current?.texts, this.x, this.y - 25, `${dmgInt} 🥐`, '#F59E0B', false, 'enemyDamage');
            } else {
              dt = pushDamageText(engineRef.current?.texts, this.x, this.y - 25, dmgInt.toString(), COLORS.white, this.soaked, 'enemyDamage');
            }
            (this as any)._lastDamageText = dt;
            (this as any)._lastDamageTextType = type;
            engineRef.current.texts.push(dt);
          }
        }

        // Apply stun if provided (Kamenný má kompletní imunitu!)
        if (options?.stunDuration && options.stunDuration > 0) {
          if (this.prefix === 'kamenny' || this.immuneToStun) {
            pushDamageText(engineRef.current.texts, this.x, this.y - 42, 'IMUNNÍ! 🪨', '#A8A29E', true);
          } else {
            const ignore = options?.isHunterCounter
              ? (!isLevelBoss ? 1 : 0)
              : Math.min(0.85, Math.max(0, options?.ignoreResist || 0));
            const effectiveWillpower = (this.willpower || 0) * (1 - ignore);
            const finalStun = Math.max(0.25, options.stunDuration * (1 - effectiveWillpower * 0.65));
            this.stunTimer = Math.max(this.stunTimer || 0, finalStun);
            if (this.aiState === 'windup') {
              this.aiState = 'idle';
              this.windupTimer = 0;
              this.strikeTimer = 0;
            }
          }
        }

        // Push / knockback calculation:
        if (options?.isHunterCounter) {
          if (!isLevelBoss) {
            // Resist nefunguje, pokud se nejedná o bosse levelu!
            this.kbx = kbx;
            this.kby = kby;
            const kDist = Math.hypot(kbx, kby);
            if (kDist > 0) {
              this.x += (kbx / kDist) * 65;
              this.y += (kby / kDist) * 65;
            }
            if (this.isAttacking) {
              this.isAttacking = false;
              this.windupTimer = 0;
              this.strikeTimer = 0;
            }
          } else {
            // Boss levelu – resist zde funguje!
            const effectivePoise = this.poiseResist || 0;
            const effectiveKbResist = Math.min(1, Math.max(0, this.knockbackResistance ?? 0));
            const poiseFactor = Math.max(0.1, 1 - effectivePoise);
            const resistanceFactor = Math.max(0.1, 1 - effectiveKbResist);
            const kbDamp = this.knockbackImmune ? 0 : 0.25;
            this.kbx = kbx * poiseFactor * resistanceFactor * kbDamp;
            this.kby = kby * poiseFactor * resistanceFactor * kbDamp;
          }
        } else if (this.prefix === 'kamenny') {
          // Kamenný bubák má masivní kamennou setrvačnost
          this.kbx = kbx * 0.15;
          this.kby = kby * 0.15;
        } else if (type !== 'food') {
          const ignore = Math.min(0.85, Math.max(0, options?.ignoreResist || 0));
          const poiseRed = player?.plumPoiseReduction || 0;
          const effectivePoise = Math.max(0, (this.poiseResist || 0) - poiseRed) * (1 - ignore);
          const effectiveKbResist = Math.min(1, Math.max(0, (this.knockbackResistance ?? 0) * (1 - ignore)));
          const poiseFactor = Math.max(0.1, 1 - effectivePoise);
          const resistanceFactor = Math.max(0.1, 1 - effectiveKbResist);
          const kbDamp = this.isMiniboss
            ? Math.min(0.8, 0.25 + 0.45 * ignore)
            : (this.knockbackImmune && ignore > 0.3 ? 0.45 : (this.knockbackImmune ? 0 : 1.0));
          this.kbx = kbx * poiseFactor * resistanceFactor * kbDamp;
          this.kby = kby * poiseFactor * resistanceFactor * kbDamp;
        } else {
          this.kbx = 0;
          this.kby = 0;
        }

        if (options?.source === 'valecnice') {
          if (Math.random() < 0.35) {
            const shouts = ['BÁC! 🪵💥', 'PRÁSK! 🪵', 'HYBAJ! 💥', 'TADY MÁŠ! 🪵'];
            const shout = shouts[Math.floor(Math.random() * shouts.length)];
            pushDamageText(engineRef.current.texts, this.x, this.y - 42, shout, '#EA580C', true);
          }
          for (let p = 0; p < 3; p++) {
            const pAng = Math.random() * Math.PI * 2;
            const pSpd = 45 + Math.random() * 75;
            emitParticle(engineRef.current.particles, () => ({
              x: this.x,
              y: this.y,
              vx: Math.cos(pAng) * pSpd,
              vy: Math.sin(pAng) * pSpd,
              life: 0.28,
              color: Math.random() < 0.5 ? '#FBBF24' : '#D97706',
              size: 3.2,
            }));
          }
        }

        if (this.hp <= 0 && !this.isDefeated) {
          this.isDefeated = true;
          this.cleanupLight();
          if ((player?.stickyPlumJamStacks || 0) > 0) {
            const engPud = engineRef.current;
            if (!engPud.plumPuddles) engPud.plumPuddles = [];
            if (engPud.plumPuddles.length >= 24) engPud.plumPuddles.shift();
            engPud.plumPuddles.push({
              x: this.x,
              y: this.y,
              radius: 44,
              life: 6.5,
              maxLife: 6.5,
              slowRatio: player.plumSlowRatio || 0.35,
            });
            pushDamageText(engPud.texts, this.x, this.y - 25, 'POVIDLÍ! 🍯', '#A855F7', false);
          }
          if (this.id === 'tajici_snehulak' && !this.isVirtualSnowmanMember) {
            snowmanHordeRef.current?.spawnPuddle(this.x, this.y);
          }
          if (directorRef.current) {
            directorRef.current.recordEnemyDeath(this, engineRef.current.gameTime);
          }
          if (type === 'food') {
            this.defeatedByFood = true;
            this.foodDefeatTimer = 0;
            this.panicked = false;
            sound.snack();
            pushDamageText(engineRef.current.texts, this.x, this.y - 32, 'Usmířen! 🥐✨', '#D97706', true, 'combatStates');
          } else {
            this.panicked = true;
            pushDamageText(engineRef.current.texts, this.x, this.y - 32, 'Zahnán! 💨', COLORS.mustard, true, 'combatStates');
          }
          const eng = engineRef.current;
          if (this.isCarryingLootBundle && Array.isArray(this.carryingLootBundle) && this.carryingLootBundle.length > 0) {
            restoreStolenBundleDrops(this, eng.drops, eng.pendingDropBank);
            pushDamageText(eng.texts, this.x, this.y - 44, 'UZLÍČEK ZACHRÁNĚN! 🎒✨', '#22C55E', true, 'lootResources');
          }

          // Helper to spawn drops with natural radial spray and velocity
          const spawnScatterDrop = (
            dropType: DropType,
            opts: { value?: number; radius?: number; speed?: number; angle?: number; text?: string; textColor?: string; size?: string; isHot?: boolean; goldenRushTimer?: number; expiration?: number; isMercyDrop?: boolean } = {}
          ) => {
            let finalType = dropType;
            let finalValue = opts.value;
            let finalSize = opts.size;
            let finalSpeed = opts.speed;
            let finalText = opts.text;
            let finalTextColor = opts.textColor;
            let finalRadius = opts.radius;
            let finalExpiration = opts.expiration;
            let finalIsHot = opts.isHot || false;
            let finalGoldenRushTimer = opts.goldenRushTimer || 0;
            let finalIsMercyDrop = opts.isMercyDrop;

            // ADR 0006, 0028b, 0032 & Dynamic Soul Throttling: Context-aware dynamic drop resolution
            if (
              (isHealingDrop(dropType) ||
                dropType === 'soul' ||
                (dropType === 'gingerbread' && directorRef.current?.dropPacingPhase === 'stress')) &&
              player
            ) {
              const res = resolveDynamicDrop(dropType, player.hp, player.maxHp, {
                isBoss,
                isMiniboss: this.isMiniboss,
                category: this.category,
                text: opts.text,
                textColor: opts.textColor,
                value: opts.value,
                speed: opts.speed,
                size: opts.size,
                radius: opts.radius,
                vulnerabilityScore: directorRef.current?.vulnerabilityScore,
                pacingPhase: directorRef.current?.dropPacingPhase,
                mercyCooldownActive: directorRef.current ? directorRef.current.mercyPityCooldown > 0 : false,
                expiration: opts.expiration,
                activeDrops: eng.drops,
                soulBuffActive: (player.soulBuffTimer || 0) > 0,
                bearMaskLevel: player.bearMaskLevel || 0,
              });
              finalType = res.type;
              if (res.value !== undefined) finalValue = res.value;
              if (res.size !== undefined) finalSize = res.size;
              if (res.speed !== undefined) finalSpeed = res.speed;
              if (res.text !== undefined) finalText = res.text;
              if (res.textColor !== undefined) finalTextColor = res.textColor;
              if (res.radius !== undefined) finalRadius = res.radius;
              if (res.expiration !== undefined) finalExpiration = res.expiration;
              if (res.isHot !== undefined) {
                finalIsHot = res.isHot;
                if (res.isHot) finalGoldenRushTimer = res.expiration || HOT_GINGERBREAD_DURATION;
              }
              if (res.isMercyDrop !== undefined) finalIsMercyDrop = res.isMercyDrop;
              if (finalIsMercyDrop && isHealingDrop(finalType) && directorRef.current) {
                directorRef.current.mercyPityCooldown = 15.0;
              }
            }

            if (isHealingDrop(finalType) && finalExpiration === undefined) {
              finalExpiration = FOOD_DROP_EXPIRATION;
            } else if (finalType === 'soul' && finalExpiration === undefined) {
              finalExpiration = SOUL_DROP_EXPIRATION;
            }

            const angle = opts.angle ?? Math.random() * Math.PI * 2;
            const burstSpeed = finalSpeed ?? (55 + Math.random() * 85);
            const radius = finalRadius ?? (
              finalType === 'chest' ? 25 :
              finalType === 'ponocny_horn' || finalType === 'masopust_rattle' || finalType === 'babicka_apron' || finalType === 'slivovice_splash' || finalType === 'svanda_bagpipes' || finalType === 'kominik_button' || finalType === 'arcivzacny_ananas' ? 20 :
              finalType === 'horseshoe' || finalType === 'rooster' || finalType === 'cuckoo_clock' ? 18 :
              finalType === 'soul' ? 14 :
              finalType === 'potion' ? 12 :
              finalType === 'bread' ? 10 :
              (finalValue && finalValue >= 15 ? 12 : finalValue && finalValue >= 5 ? 10 : 8)
            );
            const isSwarm = this.category === 'swarms' || this.isSwarmMember || this.isVirtualSnowmanMember || this.isVirtualCrowMember;
            if (isSwarm && !this.isMiniboss && !this.isBoss && (finalType === 'gingerbread' || finalType === 'coin')) {
              if (!eng.swarmReservoir) eng.swarmReservoir = createSwarmDropReservoir();
              accumulateSwarmDrop(eng.swarmReservoir, {
                type: finalType,
                value: finalValue,
                x: this.x + Math.cos(angle) * 8,
                y: this.y + Math.sin(angle) * 8,
              }, !!this.isSwarmLeader);
              if (shouldReleaseSwarmReservoir(eng.swarmReservoir)) {
                releaseSwarmReservoir(eng.swarmReservoir, eng.drops, eng.pendingDropBank);
              }
            } else {
              spawnDropWithLimit(eng.drops, {
                type: finalType,
                value: finalValue,
                size: finalSize,
                x: this.x + Math.cos(angle) * 8,
                y: this.y + Math.sin(angle) * 8,
                vx: Math.cos(angle) * burstSpeed,
                vy: Math.sin(angle) * burstSpeed,
                radius,
                time: Math.random() * 6.28,
                isHot: finalIsHot,
                goldenRushTimer: finalGoldenRushTimer,
                expiration: finalExpiration,
                isMercyDrop: finalIsMercyDrop,
              }, eng.pendingDropBank);
            }
            if (finalText && !isSwarm) {
              pushDamageText(eng.texts, this.x, this.y - 45, finalText, finalTextColor || COLORS.mustard, true, finalType === 'gingerbread' ? 'lootResources' : undefined, finalType === 'gingerbread' ? 'gingerbread' : undefined);
            }
          };

          const rawPt = ENEMY_POINTS[this.id] ?? Math.max(12, Math.floor((this.maxHp || 40) * 0.38));
          // Natural organic variance (±15%) so points don't feel like rigid clockwork
          const variance = 0.85 + Math.random() * 0.30;
          // Only regular members of the virtual crow wave get 40% less score.
          // The scheduled crow miniboss remains an ordinary, untagged enemy.
          const pointMultiplier = this.isVirtualCrowMember && !this.isMiniboss && !this.isBoss
            ? Math.max(0, Math.min(1, this.crowWavePointMultiplier ?? 1))
            : this.isVirtualSnowmanMember && !this.isMiniboss && !this.isBoss
            ? Math.max(0, Math.min(1, this.snowmanPointMultiplier ?? 0.35))
            : 1;
          const pt = Math.max(6, Math.round(rawPt * pointMultiplier * variance));

          const isWater = this.category === 'water';
          const isFields = this.category === 'fields';
          const isUndead = this.category === 'undead';
          const isDemons = this.category === 'demons';
          const isFrost = this.category === 'frost';
          const isShadows = this.category === 'shadows';
          const isSwarms = this.category === 'swarms';
          const isBoss = this.category === 'bosses' || this.isBoss || this.isMiniboss || (this.maxHp || 0) >= 1000;
          const isFlockMember = Boolean(this.isMinibossFlockMember);
          const remainingFlock = isFlockMember
            ? (eng.enemies || []).filter(
                (e: any) => e !== this && e.isMinibossFlockMember && !e.isDefeated && !e.dead
              ).length
            : 0;
          const isFlockDefeated = isFlockMember && remainingFlock === 0;

          // Dědečkovy perníčky: každý zahnáný nepřítel dá odměnu podle své herní hodnoty.
          // ADR 0006: Overkill poškození (> 200 % max Kuráže) komprimuje dropy do vyšších řádů (Velké za 6 a Obří za 20).
          // Horde-like bosses (Hejno mrazivých vran) members drop normal gingerbread per their individual point value.
          let gingerbreadSize = isFlockMember
            ? getGingerbreadSize(false, false, rawPt)
            : getGingerbreadSize(isBoss, this.isMiniboss, rawPt);
          if (this.overkill) {
            if (gingerbreadSize === 'small') gingerbreadSize = 'large';
            else if (gingerbreadSize === 'large') gingerbreadSize = 'giant';
          }
          const playerLuck = player?.luck ?? 100;
          const luckGingerbreadUpgradeChance = Math.max(0, playerLuck) * 0.001;
          if (Math.random() < luckGingerbreadUpgradeChance) {
            if (gingerbreadSize === 'small') gingerbreadSize = 'large';
            else if (gingerbreadSize === 'large') gingerbreadSize = 'giant';
          }
          let gingerbreadValue = getGingerbreadValue(gingerbreadSize);
          if (this.killedByFriendlyFire) {
            gingerbreadValue *= 2;
          }

          // ADR 0006: Rizikové zóny: Dropy z bubáků poražených ve velké vzdálenosti (> 420 px) se stávají Horkými perníčky s 3s časovačem na 2× výnos.
          const distToPlayer = player ? Math.hypot(this.x - player.x, this.y - player.y) : 0;
          const isFarKill = distToPlayer >= FAR_KILL_DISTANCE;

          spawnScatterDrop('gingerbread', {
            value: gingerbreadValue,
            radius: gingerbreadSize === 'giant' ? 19 : gingerbreadSize === 'large' ? 14 : 10,
            speed: 65 + Math.random() * 55,
            text: isFarKill
              ? `+${gingerbreadValue} 🔥 HORKÝ PERNÍK (2×)`
              : `+${gingerbreadValue}${this.killedByFriendlyFire ? ' (2x Rvačka!)' : ''}`,
            textColor: isFarKill ? '#F97316' : (gingerbreadSize === 'giant' ? '#F59E0B' : '#B45309'),
            size: gingerbreadSize,
            isHot: isFarKill,
            goldenRushTimer: isFarKill ? HOT_GINGERBREAD_DURATION : 0,
          });

          // ADR 0013: Šance na extra krejcar podle Štěstí lovce (Štěstí * 0.05 %)
          const coinChance = Math.max(0, playerLuck) * 0.0005;
          if (Math.random() < coinChance) {
            spawnScatterDrop('coin', {
              value: 1,
              speed: 70 + Math.random() * 40,
              text: '+1 krejcar! 🪙🍀',
              textColor: '#F59E0B',
            });
          }

          // Folklórní mocné předměty s Pity Timerem (ADR 0006: Podkova při > 120 perníčcích, Kohoutek, Kukačky)
          if (!eng.folkloreDropTracker) {
            eng.folkloreDropTracker = createFolkloreDropTracker();
          }
          const folkloreItem = evaluateFolkloreDrop(
            eng.folkloreDropTracker,
            eng.drops,
            eng.gameTime,
            0.016,
            isFlockMember ? isFlockDefeated : (isBoss || this.isMiniboss)
          );
          if (folkloreItem) {
            const ann = getRareDropAnnouncement(folkloreItem);
            spawnScatterDrop(folkloreItem, {
              speed: 90,
              text: ann.text,
              textColor: ann.textColor,
            });
            sound.bell();
          }

          // Vzácné folklórní pomocné předměty (2 až 4 za výpravu)
          if (canSpawnRareBattleDrop(eng.rareDropTracker, eng.gameTime, isFlockMember ? isFlockDefeated : (isBoss || this.isMiniboss))) {
            const rareType = rollRareBattleDrop(eng.rareDropTracker, eng.gameTime);
            const ann = getRareDropAnnouncement(rareType);
            spawnScatterDrop(rareType, {
              speed: 85,
              text: ann.text,
              textColor: ann.textColor,
            });
            sound.bell();
          }

          // Garantovaný perníček za zasycení jídlem
          if (this.defeatedByFood) {
            spawnScatterDrop('gingerbread', {
              value: GINGERBREAD_VALUES.large,
              radius: 14,
              speed: 55 + Math.random() * 45,
              size: 'large',
            });
          }

          // Thematic category affinities & multipliers for threshold counters
          // Horde-like bosses like Hejno mrazivých vran count as only one boss for the sake of treasure.
          const flockTotal = isFlockMember ? (this.flockTotal || 9) : 1;
          const chestMult = isBoss ? (3.0 / flockTotal) : isDemons ? 1.4 : isUndead ? 1.25 : 1.0;
          const potionMult = isWater ? 1.6 : isFields ? 1.3 : isBoss ? (2.0 / flockTotal) : 1.0;
          const breadMult = isFields ? 2.0 : isFrost ? 1.5 : isSwarms ? 1.2 : 0.9;
          const soulMult = isWater ? 1.35 : isShadows ? 1.2 : isUndead ? 1.0 : 0.4;

          eng.pointsChest += Math.round(pt * chestMult);
          eng.pointsPotion += Math.round(pt * potionMult);
          eng.pointsBread += Math.round(pt * breadMult);
          if (isWater || isShadows || isUndead || isBoss || this.defeatedByFood) {
            eng.pointsSoul += Math.round(pt * (isFlockMember ? soulMult / flockTotal : soulMult));
          }

          // Unified Bonus Drop Router: At most 1 secondary bonus drop per defeated enemy
          // Priority: 1. Boss/Miniboss or Threshold Chest -> 2. Emergency Rescue Jitrnice -> 3. Single Ready Point Threshold -> 4. Weighted Director Drop (V)
          const shouldDropTreasure = this.isMiniboss
            ? (!isFlockMember || (isFlockDefeated && !eng.flockTreasureDropped))
            : Boolean(this.isBoss);
          const chestThreshold = DROP_THRESHOLDS.chest;
          const activeChests = (eng.drops || []).filter((d: any) => !d.dead && d.type === 'chest').length;
          const isEligibleForEmergencyBias = isFlockMember
            ? isFlockDefeated
            : (this.isMiniboss || isBoss || (this.maxHp || 0) >= 650);
          const mercyCooldownReady = !directorRef.current || directorRef.current.mercyPityCooldown <= 0;

          if (shouldDropTreasure) {
            if (isFlockMember) {
              eng.flockTreasureDropped = true;
            }
            sound.chest();
            const treasureText = this.isBoss ? '👑 POKLAD VLÁDCE BUBÁKŮ!' : '🎁 POKLAD MINIBOSSE!';
            spawnScatterDrop('chest', { speed: 85, text: treasureText, textColor: COLORS.mustard });
            for (let i = 0; i < 24; i++) {
              emitParticle(eng.particles, () => ({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 0.8,
                color: i % 2 === 0 ? '#F59E0B' : '#FDE047',
                size: 5,
              }));
            }
            pushDamageText(eng.texts, this.x, this.y - 70, treasureText, COLORS.mustard, true);
          } else if (eng.pointsChest >= chestThreshold && activeChests < 2) {
            eng.pointsChest -= chestThreshold;
            spawnScatterDrop('chest', { speed: 65, text: `POKLAD (${chestThreshold} BODŮ)!`, textColor: COLORS.mustard });
            spawnScatterDrop('gingerbread', { value: GINGERBREAD_VALUES.giant, radius: 19, speed: 65, size: 'giant' });
            sound.chest();
          } else if (
            player &&
            player.hp < player.maxHp * EMERGENCY_HEALTH_RATIO &&
            isEligibleForEmergencyBias &&
            mercyCooldownReady
          ) {
            // ADR 0006 & ADR 0028b: Záchranná jitrnice při Kuráži < 25 % vystřelená na taktickou vzdálenost 220-300 px s 15s mercy cooldownem
            const rescueAngle = Math.random() * Math.PI * 2;
            if (directorRef.current) {
              directorRef.current.mercyPityCooldown = 15.0;
            }
            spawnScatterDrop('potion', {
              speed: 230 + Math.random() * 60,
              angle: rescueAngle,
              text: 'ZÁCHRANNÁ JITRNICE! 🍖🚨',
              textColor: COLORS.green,
              isMercyDrop: true,
            });
          } else {
            // 3. Single Ready Point Threshold Drop (unspent ready thresholds stay in bank for next enemy)
            const potionReady = eng.pointsPotion >= DROP_THRESHOLDS.potion;
            const breadReady = eng.pointsBread >= DROP_THRESHOLDS.bread;
            const soulReady = eng.pointsSoul >= DROP_THRESHOLDS.soul;

            if (potionReady || breadReady || soulReady) {
              const needsHealing =
                directorRef.current?.dropPacingPhase === 'mercy' ||
                (player && player.hp < player.maxHp * 0.65);
              let chosenThreshold: 'potion' | 'bread' | 'soul' | null = null;

              if (needsHealing) {
                if (potionReady) chosenThreshold = 'potion';
                else if (breadReady) chosenThreshold = 'bread';
                else if (soulReady) chosenThreshold = 'soul';
              } else {
                const candidates: Array<{ type: 'potion' | 'bread' | 'soul'; ratio: number }> = [];
                if (potionReady) candidates.push({ type: 'potion', ratio: eng.pointsPotion / DROP_THRESHOLDS.potion });
                if (breadReady) candidates.push({ type: 'bread', ratio: eng.pointsBread / DROP_THRESHOLDS.bread });
                if (soulReady) candidates.push({ type: 'soul', ratio: eng.pointsSoul / DROP_THRESHOLDS.soul });
                candidates.sort((a, b) => b.ratio - a.ratio);
                chosenThreshold = candidates[0]?.type ?? null;
              }

              if (chosenThreshold === 'potion') {
                eng.pointsPotion -= DROP_THRESHOLDS.potion;
                spawnScatterDrop('potion', { speed: 60 });
              } else if (chosenThreshold === 'bread') {
                eng.pointsBread -= DROP_THRESHOLDS.bread;
                spawnScatterDrop('bread', { speed: 60 });
              } else if (chosenThreshold === 'soul') {
                eng.pointsSoul -= DROP_THRESHOLDS.soul;
                spawnScatterDrop('soul', { speed: 70 });
              }
            } else if (!isBoss) {
              // 4. Unified Director Weighted Surprise / Pacification Drop (ADR 0028b)
              const undeadLvl = metaRef.current.undeadLevel || 0;
              const tolarBonus = getUndeadTolarChance(undeadLvl);
              const baseSurpriseChance = this.defeatedByFood
                ? 0.38
                : (isUndead ? 0.24 : isDemons ? 0.22 : isWater || isFields ? 0.20 : 0.15) + tolarBonus * 0.5;

              if (Math.random() < baseSurpriseChance) {
                const vScore = directorRef.current?.vulnerabilityScore ?? 0.5;
                const phase = directorRef.current?.dropPacingPhase ?? 'flow';
                const mercyCdActive = directorRef.current ? directorRef.current.mercyPityCooldown > 0 : false;
                const activeSouls = countActiveSoulDrops(eng.drops);
                const soulBuffActive = (player?.soulBuffTimer || 0) > 0;

                const selectedDrop = selectWeightedDropType(
                  vScore,
                  phase,
                  mercyCdActive,
                  activeSouls,
                  soulBuffActive,
                  {
                    category: this.category,
                    defeatedByFood: this.defeatedByFood,
                    bearMaskLevel: player?.bearMaskLevel || 0,
                  }
                );

                if (selectedDrop.type === 'coin') {
                  const rollDenom = Math.random();
                  let coinVal = 1;
                  let coinTxt: string | undefined = undefined;
                  if (rollDenom < (0.08 + tolarBonus) || (isDemons && rollDenom < 0.16)) {
                    coinVal = 15 + Math.floor(Math.random() * 10);
                    coinTxt = 'Zlatý tolar!';
                  } else if (rollDenom < 0.38 || (isUndead && rollDenom < 0.55)) {
                    coinVal = 5 + Math.floor(Math.random() * 5);
                  } else {
                    coinVal = 1 + Math.floor(Math.random() * 2);
                  }
                  spawnScatterDrop('coin', { value: coinVal, speed: 70 + Math.random() * 50, text: coinTxt });
                } else if (selectedDrop.type === 'potion') {
                  spawnScatterDrop('potion', {
                    speed: 75,
                    text: 'Čerstvá jitrnice!',
                    textColor: COLORS.green,
                    isMercyDrop: selectedDrop.isMercyDrop,
                  });
                } else if (selectedDrop.type === 'bread' || selectedDrop.type === 'pear') {
                  spawnScatterDrop('bread', {
                    speed: 65,
                    text: this.defeatedByFood ? 'Sladká hruška 🍐' : undefined,
                    textColor: this.defeatedByFood ? '#84CC16' : undefined,
                    isMercyDrop: selectedDrop.isMercyDrop,
                  });
                } else if (selectedDrop.type === 'soul') {
                  spawnScatterDrop('soul', {
                    speed: 85,
                    text: this.defeatedByFood ? 'Vděčná dušička 🕊️' : 'Zbloudilá dušička!',
                    textColor: '#38BDF8',
                    expiration: selectedDrop.expiration,
                  });
                } else if (selectedDrop.type === 'gingerbread') {
                  const isHot = Boolean(selectedDrop.isHot || phase === 'stress');
                  const hotExp = selectedDrop.expiration ?? (isHot ? HOT_GINGERBREAD_DURATION : undefined);
                  spawnScatterDrop('gingerbread', {
                    value: GINGERBREAD_VALUES.large,
                    radius: 14,
                    speed: 65 + Math.random() * 45,
                    size: 'large',
                    isHot,
                    goldenRushTimer: isHot ? (hotExp || HOT_GINGERBREAD_DURATION) : 0,
                    expiration: hotExp,
                    text: isHot ? `+${GINGERBREAD_VALUES.large} 🔥 HORKÝ PERNÍK (2×)` : undefined,
                    textColor: isHot ? '#F97316' : undefined,
                  });
                }
              }
            }
          }
// Bestiary tracking & progressive sequential hunter unlocks
          const curMeta = metaRef.current;
          const canonicalEnemyId = toCanonicalEnemyId(this.id);
          const prevKillCount = Math.max(curMeta.bestiaryKills[canonicalEnemyId] || 0, curMeta.bestiaryKills[this.id] || 0);
          const updatedKills = {
            ...curMeta.bestiaryKills,
            [canonicalEnemyId]: prevKillCount + 1,
            [this.id]: prevKillCount + 1,
          };
          let nextMeta: MetaProgression = { ...curMeta, bestiaryKills: updatedKills };

          // 1. Sequential Hunter Progression: only active hunter collects kills!
          const activeHunterId = getActiveUnlockingHunter(curMeta);
          let announceName = '';
          if (activeHunterId) {
            const hDef = HUNTER_UNLOCKS[activeHunterId];
            const matchedHunterTarget = hDef?.targetEnemies.find((e) => toCanonicalEnemyId(e.id) === canonicalEnemyId);
            if (hDef && matchedHunterTarget) {
              const prevHunterCounts = curMeta.hunterKillCounts || {};
              const curHunterKills = {
                ...(prevHunterCounts[activeHunterId] || (activeHunterId === 'shepherd' || activeHunterId === 'pasacek' ? curMeta.bestiaryKills || {} : {})),
              };
              const nextTargetCount = Math.max(
                curHunterKills[matchedHunterTarget.id] || 0,
                curHunterKills[canonicalEnemyId] || 0,
                curHunterKills[this.id] || 0
              ) + 1;
              curHunterKills[matchedHunterTarget.id] = nextTargetCount;
              curHunterKills[canonicalEnemyId] = nextTargetCount;
              curHunterKills[this.id] = nextTargetCount;

              const nextHunterCounts = {
                ...prevHunterCounts,
                [activeHunterId]: curHunterKills,
              };
              nextMeta = { ...nextMeta, hunterKillCounts: nextHunterCounts };

              const nextHunterProg = getHunterProgress(activeHunterId, nextMeta);
              if (nextHunterProg.isUnlocked) {
                const newlyUnlockedHunters = {
                  ...(curMeta.unlockedHunters || { wanderer: true, shepherd: false, korenarka: false, watchman: false, sexton: false, granny: false }),
                  [activeHunterId]: true,
                };
                nextMeta = { ...nextMeta, unlockedHunters: newlyUnlockedHunters };
                announceName = hDef.realName;
              }
            }
          }

          if (announceName) {
            sound.victory();
            sound.cheer();
            pushDamageText(engineRef.current.texts, this.x, this.y - 75, `🎉 ${announceName.toUpperCase()} ODEMČEN!`, COLORS.mustard, true, 'unlocksMilestones');
            showUnlockNotice({
              icon: 'celebration',
              title: `Odemčen nový lovec: ${announceName}!`,
              desc: `Nyní si ho můžete vybrat v hlavní nabídce pro novou výpravu.`,
            }, 5000);
          }

          // 2. Sequential Weapon Progression: only active weapon collects kills!
          const activeWeaponId = getActiveUnlockingWeapon(nextMeta);
          let announceWeaponName = '';
          if (activeWeaponId) {
            const wDef = WEAPON_UNLOCKS[activeWeaponId];
            const matchedWeaponTarget = wDef?.targetEnemies.find((e) => toCanonicalEnemyId(e.id) === canonicalEnemyId);
            if (wDef && matchedWeaponTarget) {
              const prevWeaponCounts = nextMeta.weaponKillCounts || {};
              const curWeaponKills = {
                ...(prevWeaponCounts[activeWeaponId] || (activeWeaponId === 'kovarske_vidle' || activeWeaponId === 'pitchfork' ? curMeta.bestiaryKills || {} : {})),
              };
              const nextWTargetCount = Math.max(
                curWeaponKills[matchedWeaponTarget.id] || 0,
                curWeaponKills[canonicalEnemyId] || 0,
                curWeaponKills[this.id] || 0
              ) + 1;
              curWeaponKills[matchedWeaponTarget.id] = nextWTargetCount;
              curWeaponKills[canonicalEnemyId] = nextWTargetCount;
              curWeaponKills[this.id] = nextWTargetCount;

              const nextWeaponCounts = {
                ...prevWeaponCounts,
                [activeWeaponId]: curWeaponKills,
              };
              nextMeta = { ...nextMeta, weaponKillCounts: nextWeaponCounts };

              const nextWeaponProg = getWeaponProgress(activeWeaponId, nextMeta);
              if (nextWeaponProg.isUnlocked) {
                const newlyUnlockedWeapons = {
                  ...(curMeta.unlockedWeapons || { povidlove_buchty: true, osikovy_prut: true, hromnicka: true, bylinkova_fajfka: true }),
                  [activeWeaponId]: true,
                };
                nextMeta = { ...nextMeta, unlockedWeapons: newlyUnlockedWeapons };
                announceWeaponName = wDef.realName;
              }
            }
          }

          if (announceWeaponName) {
            sound.victory();
            sound.cheer();
            pushDamageText(engineRef.current.texts, this.x, this.y - 85, `🎉 ZBRAŇ: ${announceWeaponName.toUpperCase()}`, COLORS.mustard, true, 'unlocksMilestones');
            showUnlockNotice({
              icon: 'celebration',
              title: `Odemčena nová zbraň: ${announceWeaponName}!`,
              desc: 'Tato zbraň se trvale přidala do výběru vylepšení při postupu na novou úroveň!',
            }, 5000);
          }

          // 3. Sequential Level Progression: track kills towards revealing / unlocking the next level!
          const activeLevelId = getActiveUnlockingLevel(nextMeta);
          let announceLevelName = '';
          if (activeLevelId !== null) {
            const lDef = LEVEL_UNLOCKS[activeLevelId];
            const matchedLevelTarget = lDef?.targetEnemies.find((e) => toCanonicalEnemyId(e.id) === canonicalEnemyId);
            if (lDef && matchedLevelTarget) {
              const prevLevelCounts = nextMeta.levelKillCounts || {};
              const curLevelKills = {
                ...(prevLevelCounts[activeLevelId] || {}),
              };
              const nextLTargetCount = Math.max(
                curLevelKills[matchedLevelTarget.id] || 0,
                curLevelKills[canonicalEnemyId] || 0,
                curLevelKills[this.id] || 0
              ) + 1;
              curLevelKills[matchedLevelTarget.id] = nextLTargetCount;
              curLevelKills[canonicalEnemyId] = nextLTargetCount;
              curLevelKills[this.id] = nextLTargetCount;

              const nextLevelCounts = {
                ...prevLevelCounts,
                [activeLevelId]: curLevelKills,
              };
              nextMeta = { ...nextMeta, levelKillCounts: nextLevelCounts };

              const nextLevelProg = getLevelProgress(activeLevelId, nextMeta);
              if (nextLevelProg.isUnlocked) {
                const nextHighest = Math.max(nextMeta.highestLevelUnlocked || 1, activeLevelId);
                nextMeta = {
                  ...nextMeta,
                  highestLevelUnlocked: nextHighest,
                };
                announceLevelName = lDef.realName;
              }
            }
          }

          if (announceLevelName) {
            sound.victory();
            sound.cheer();
            pushDamageText(engineRef.current.texts, this.x, this.y - 95, `🎉 ${announceLevelName.toUpperCase()} ODEMČENA!`, COLORS.mustard, true, 'unlocksMilestones');
            showUnlockNotice({
              icon: 'celebration',
              title: `Odemčena nová výprava: ${announceLevelName}!`,
              desc: 'Tato úroveň je nyní otevřena v hlavní nabídce pro novou výpravu!',
            }, 5500);
          }

          saveMeta(nextMeta, Boolean(announceName || announceWeaponName || announceLevelName));

          engineRef.current.kills += 1;

          const isBossMonster = this.isBoss || this.isMiniboss || this.category === 'bosses';

          if (isBossMonster) {
            const remainingBoss = engineRef.current.enemies.find(
              (e) => (e.isBoss || e.isMiniboss) && !e.isDefeated && e !== this
            );
            if (remainingBoss) {
              if (remainingBoss.isMinibossFlockMember) {
                const flockMembers = engineRef.current.enemies.filter(
                  (e: any) => e.isMinibossFlockMember && !e.isDefeated && !e.dead && e !== this
                );
                const totalFlockHp = flockMembers.reduce((sum: number, e: any) => sum + Math.max(0, e.hp || 0), 0);
                const totalFlockMaxHp = (remainingBoss.flockTotal || 9) * (remainingBoss.maxHp || 38);
                setRunStats((s) => ({
                  ...s,
                  bossHpPct: Math.max(0, Math.min(100, (totalFlockHp / Math.max(1, totalFlockMaxHp)) * 100)),
                  bossTitle: '👑 MINIBOSS: 🐦‍⬛ Hejno mrazivých vran',
                }));
              } else {
                setRunStats((s) => ({
                  ...s,
                  bossHpPct: Math.max(0, Math.min(100, (remainingBoss.hp / remainingBoss.maxHp) * 100)),
                  bossTitle: remainingBoss.customBossTitle
                    ? `👑 ${remainingBoss.customBossTitle}`
                    : (remainingBoss.isMiniboss ? `👑 MINIBOSS: ${remainingBoss.name}` : remainingBoss.name),
                }));
              }
            } else {
              setRunStats((s) => ({ ...s, bossHpPct: null, bossTitle: '' }));
            }

            if (!isFlockMember || isFlockDefeated) {
              sound.victory();
              sound.cheer();
              const defeatName = this.customBossTitle || (isFlockMember ? 'Hejno mrazivých vran' : stats.name);
              pushDamageText(engineRef.current.texts, this.x, this.y - 60, `👑 ${defeatName.toUpperCase()} ZKLIDNĚN!`, COLORS.mustard, true);
              if (this.isMiniboss) {
                engineRef.current.coins = (engineRef.current.coins || 0) + 25;
                pushDamageText(engineRef.current.texts, this.x, this.y - 95, '+25 KREJCARŮ! 💰', '#FDE047', true);
              }
            }
            // Check if final boss of this level
            const curLvlId = engineRef.current.activeLevelId !== undefined ? engineRef.current.activeLevelId : 0;
            const curLvl = GAME_LEVELS[curLvlId];
            if (this.isBoss && curLvl && this.id === curLvl.finalBoss.id) {
              triggerLevelVictory(curLvlId, 'boss');
            }
          }
        }
      },

      applyStatusEffect(type: string, effect: any) {
        const current = this.statusEffects[type];
        if (type === 'pickle_sickness') {
          const nextStacks = Math.min(effect.maxStacks || 3, (current?.stacks || 0) + (effect.addStacks || 1));
          this.statusEffects[type] = {
            type,
            stacks: nextStacks,
            maxStacks: effect.maxStacks || 3,
            remaining: effect.duration ?? 6,
            damageDealtMultiplier: nextStacks >= 3 ? (effect.damageDealtMultiplier ?? 0.65) : 1,
            damageTakenMultiplier: nextStacks >= 3 ? (effect.damageTakenMultiplier ?? 1.35) : 1,
            movementSpeedMultiplier: nextStacks >= 3 ? 0.90 : 1,
          };
        }
      },
      getStatusEffect(type: string) { return this.statusEffects[type]; },
      getDamageTakenMultiplier() {
        let m = 1;
        for (const k in this.statusEffects) {
          const e = this.statusEffects[k];
          if (e && e.damageTakenMultiplier !== undefined) m *= e.damageTakenMultiplier;
        }
        return m;
      },
      getDamageDealtMultiplier() {
        let m = 1;
        for (const k in this.statusEffects) {
          const e = this.statusEffects[k];
          if (e && e.damageDealtMultiplier !== undefined) m *= e.damageDealtMultiplier;
        }
        return m;
      },
      getMovementSpeedMultiplier() {
        let m = 1;
        for (const k in this.statusEffects) {
          const e = this.statusEffects[k];
          if (e && e.movementSpeedMultiplier !== undefined) m *= e.movementSpeedMultiplier;
        }
        return m;
      },

      soak() {
        this.soaked = true;
        this.soakedTimer = 5.0;
      },

      chill(duration = 3.5) {
        this.chilled = true;
        this.chillTimer = duration;
      },

      interruptAttack() {
        this.isAttacking = false;
        this.windupTimer = 0;
        this.strikeTimer = 0;
        if (this.aiState === 'windup') this.aiState = 'idle';
      },

      draw(ctx: CanvasRenderingContext2D) {
        // Virtual flock members blit the pre-baked 12-frame Ladovská flying crow
        // from BakedBubakAtlas with zero per-frame path rasterization or allocations.
        if (this.isVirtualCrowMember) {
          ctx.save();
          if (this.isDefeated) {
            const fadeProgress = Math.min(1, Math.max(0, (this.fleeTimer || this.foodDefeatTimer || 0) / 0.85));
            ctx.globalAlpha = Math.max(0.08, 1 - fadeProgress * 0.92);
          }
          const vx = this.vx || (Number.isFinite(this.crowHeading) ? Math.cos(this.crowHeading) : 1);
          const vy = this.vy || (Number.isFinite(this.crowHeading) ? Math.sin(this.crowHeading) : 0);
          const dir = vx < 0 ? -1 : 1;
          const pitch = Math.max(-0.42, Math.min(0.42, Math.atan2(vy, Math.abs(vx) || 1) * 0.42)) * dir;
          const phaseTime = (this.animTime || 0) + (this.crowWaveIndex || 0) * 0.13;
          const flapScale = Number.isFinite(this.crowFlapScale) ? this.crowFlapScale : 1;
          const waveScale = this.renderScale || 0.34;
          ctx.translate(this.x, this.y);
          ctx.rotate(pitch);
          ctx.scale(dir * waveScale, waveScale * (0.9 + (flapScale - 0.78) * 0.45));
          const frame = getGlobalBakedBubakAtlas().getFrame('vrana', phaseTime, Boolean(this.panicked));
          if (frame && typeof ctx.drawImage === 'function') {
            ctx.drawImage(frame.canvas, -frame.originX, -frame.originY);
          } else {
            Lada.drawStageCrow(ctx, 0, 0, phaseTime, 1, Boolean(this.panicked));
          }
          ctx.restore();
          return;
        }

        let didSaveAlpha = false;
        if (this.isDefeated) {
          const fadeProgress = Math.min(1, Math.max(0, (this.fleeTimer || this.foodDefeatTimer || 0) / 0.85));
          ctx.save();
          ctx.globalAlpha = Math.max(0.08, 1 - fadeProgress * 0.92);
          didSaveAlpha = true;
        }

        const shadowRadius = this.id === 'vrana' && !this.isMiniboss
          ? this.radius * (this.renderScale || 0.34)
          : this.radius;
        Lada.drawShadow(ctx, this.x, this.y, shadowRadius);

        // Animovaná tematická svítící aura pro bubáky se speciálními prefixy i stav Vyčerpaný
        if (isGameEffectEnabled('combatVfxEnabled') && !this.isDefeated) {
          if (this.prefix) {
            drawPrefixAura(ctx, this.x, this.y, this.radius, this.prefix, this.animTime);
          } else if ((this.vycerpanyTimer || 0) > 0) {
            drawPrefixAura(ctx, this.x, this.y, this.radius, 'vycerpany', this.animTime);
          }
        }

        // Vznášející se závan z uleželého tvarůžku (curly cheese aroma vapors)
        if (isGameEffectEnabled('combatVfxEnabled') && (this.vycerpanyTimer || 0) > 0 && !this.isDefeated) {
          ctx.save();
          ctx.strokeStyle = 'rgba(163, 230, 53, 0.70)';
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          const tAroma = this.animTime * 3.5;
          for (let ai = 0; ai < 2; ai++) {
            const ox = (ai - 0.5) * (this.radius * 0.9);
            ctx.beginPath();
            ctx.moveTo(this.x + ox, this.y - this.radius * 0.7);
            ctx.quadraticCurveTo(
              this.x + ox + Math.sin(tAroma + ai * 2) * 8,
              this.y - this.radius * 0.7 - 12,
              this.x + ox + Math.cos(tAroma + ai * 2) * 5,
              this.y - this.radius * 0.7 - 22
            );
            ctx.stroke();
          }
          ctx.restore();
        }

        // Stínová záštita - dark gouache smoke aura around shadow enemies in darkness
        if (isGameEffectEnabled('combatVfxEnabled') && this.hasShadowDefense && !this.isDefeated) {
          ctx.save();
          const p = Math.sin(this.animTime * 3) * 3;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
          ctx.beginPath();
          ctx.arc(this.x, this.y - 8, this.radius * 1.25 + p, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Fairytale Silhouette Inversion (chalk-white woodcut contour on holy/flare burst)
        if (isGameEffectEnabled('combatVfxEnabled') && this.silhouetteInvertTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#FFFBEB';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(this.x, this.y - 10, this.radius * 1.15, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Ground Miniboss Aura (illuminating halo and rotating folklore radial notches)
        if (isGameEffectEnabled('combatVfxEnabled') && this.isMiniboss && !this.isDefeated) {
          ctx.save();
          const auraRadius = this.radius * 1.35;
          const pulse = Math.sin(this.animTime * 3.5) * 3;
          const glowAlpha = 0.28 + Math.sin(this.animTime * 3.5) * 0.12;

          // Glowing translucent ground pool
          const grad = ctx.createRadialGradient(this.x, this.y + this.radius * 0.7, this.radius * 0.2, this.x, this.y + this.radius * 0.7, auraRadius + pulse);
          grad.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha})`);
          grad.addColorStop(0.7, `rgba(217, 119, 6, ${glowAlpha * 0.7})`);
          grad.addColorStop(1, 'rgba(180, 83, 9, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(this.x, this.y + this.radius * 0.75, auraRadius + pulse, (auraRadius + pulse) * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rotating folklore runic ring with teeth / notches
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.ellipse(this.x, this.y + this.radius * 0.75, auraRadius, auraRadius * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();

          // 8 rotating folklore dashes/spokes around the ellipse
          const spokeCount = 8;
          const rotOffset = this.animTime * 0.8;
          for (let i = 0; i < spokeCount; i++) {
            const ang = rotOffset + (i / spokeCount) * Math.PI * 2;
            const ex1 = this.x + Math.cos(ang) * (auraRadius - 4);
            const ey1 = this.y + this.radius * 0.75 + Math.sin(ang) * (auraRadius * 0.38 - 1.5);
            const ex2 = this.x + Math.cos(ang) * (auraRadius + 5);
            const ey2 = this.y + this.radius * 0.75 + Math.sin(ang) * (auraRadius * 0.38 + 2);
            ctx.beginPath();
            ctx.moveTo(ex1, ey1);
            ctx.lineTo(ex2, ey2);
            ctx.strokeStyle = i % 2 === 0 ? '#F59E0B' : '#B45309';
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }
          ctx.restore();
        }

        if (isGameEffectEnabled('statusIndicatorsEnabled') && this.calmTimer > 0 && !this.isDefeated) {
          Lada.drawHeart(ctx, this.x, this.y - this.radius - 22 - Math.sin(this.animTime * 4) * 3, 8, '#F4A6BF');
        }

        // Snacking state ("Ňam, ňam note")
        if (isGameEffectEnabled('statusIndicatorsEnabled') && ((this.snackTimer > 0 && !this.isDefeated) || (this.isDefeated && this.defeatedByFood))) {
          ctx.save();
          const bob = Math.sin(this.animTime * 7) * 2;
          const noteY = this.y - this.radius - 22 + bob;
          const noteText = 'Ňam, ňam';

          ctx.font = '900 13px "Eczar", serif';
          const textWidth = ctx.measureText(noteText).width;
          const boxW = textWidth + 18;
          const boxH = 20;
          const boxX = this.x - boxW / 2;
          const boxY = noteY - boxH / 2;

          // Creamy folk parchment bubble
          ctx.fillStyle = '#FFFBEB';
          ctx.strokeStyle = '#2A170A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(boxX, boxY, boxW, boxH, 6);
          } else {
            ctx.rect(boxX, boxY, boxW, boxH);
          }
          ctx.fill();
          ctx.stroke();

          // Bubble pointer
          ctx.beginPath();
          ctx.moveTo(this.x - 3, boxY + boxH);
          ctx.lineTo(this.x, boxY + boxH + 4);
          ctx.lineTo(this.x + 3, boxY + boxH);
          ctx.fillStyle = '#FFFBEB';
          ctx.fill();
          ctx.strokeStyle = '#2A170A';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text "Ňam, ňam"
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#92400E';
          ctx.fillText(noteText, this.x, noteY);

          // Pastry / Buchta crumbs falling
          const crumbT = (this.animTime * 3.5) % 1;
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.arc(this.x - 7 + Math.sin(this.animTime * 4) * 3, this.y - 2 + crumbT * 14, 1.5, 0, Math.PI * 2);
          ctx.arc(this.x + 7 + Math.cos(this.animTime * 5) * 3, this.y - 4 + ((crumbT + 0.5) % 1) * 14, 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Telegraphed windup warning cue for tactical combat
        if (isGameEffectEnabled('warningIndicatorsEnabled') && this.aiState === 'windup' && !this.isDefeated) {
          ctx.save();
          ctx.font = '900 16px "Eczar", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 3.5;
          ctx.fillStyle = '#EF4444';
          const wy = this.y - this.radius - 16;
          ctx.strokeText('!', this.x, wy);
          ctx.fillText('!', this.x, wy);
          ctx.restore();
        }

        const isFleeing = this.panicked || (this.isDefeated && !this.defeatedByFood);
        const isSpecialBoss = this.id === 'cert' || this.id === 'hejkal' || this.id === 'obr' || this.id === 'mlynar' || this.id === 'drak';
        const scale = this.renderScale || 1.0;
        if (isSpecialBoss && scale !== 1.0) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.scale(scale, scale);
          ctx.translate(-this.x, -this.y);
        }

        if (isSpecialBoss) {
          // Get smart detailed attack animation state according to enemy attack speed & cadence
          const attackInfo = getEnemyAttackAnimationState(this, this.animTime);

          // Pre-sprite attack effects (ground impact shockwave for slow monsters, foot dust clouds)
          if (isGameEffectEnabled('combatVfxEnabled') && attackInfo.isActive) {
            drawEnemyAttackEffectsPre(ctx, this, attackInfo);
          }

          // Apply procedural attack kinematics (lunge, lean, squash & stretch, tension tremor)
          if (attackInfo.isActive) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.translate(attackInfo.lungeX + attackInfo.shakeX, attackInfo.lungeY + attackInfo.shakeY);
            ctx.rotate(attackInfo.leanAngle * attackInfo.facingDir);
            ctx.scale(attackInfo.squashX, attackInfo.squashY);
            ctx.translate(-this.x, -this.y);
          }

          const idleFacingVx = Math.abs(this.vx) > 0.01 ? this.vx : (this.lastDx || 1);
          const renderFacingVx = attackInfo.isActive ? (attackInfo.facingDir >= 0 ? 1 : -1) : idleFacingVx;

          if (this.id === 'cert') {
            const certFacingVx = this.aiState === 'windup' && Number.isFinite(this.chargeDirX)
              ? Math.cos(this.chargeDirX)
              : renderFacingVx;
            Lada.drawCert(ctx, this.x, this.y, this.animTime, certFacingVx, isFleeing, this.isBoss, this.aiState === 'charge' || this.aiState === 'windup' || Math.abs(this.vx) > 300, attackInfo);
          } else if (this.id === 'hejkal') {
            Lada.drawHejkal(ctx, this.x, this.y, this.animTime, renderFacingVx, isFleeing, attackInfo);
          } else if (this.id === 'obr') {
            Lada.drawObr(ctx, this.x, this.y, this.animTime, renderFacingVx, isFleeing, attackInfo);
          } else if (this.id === 'mlynar') {
            Lada.drawMlynar(ctx, this.x, this.y, this.animTime, renderFacingVx, isFleeing, this.hp <= this.maxHp * 0.5);
          } else if (this.id === 'drak') {
            const attacks = {
              fire: engineRef.current.drakBreathTimer > (this.hp <= this.maxHp * 0.5 ? 3.0 : 5.0) ? 1 : 0,
              ice: engineRef.current.drakSnoreTimer > 3.6 && (this.enraged || this.hp <= this.maxHp * 0.5) ? 1 : 0,
              roar: engineRef.current.drakIcicleTimer > (this.hp <= this.maxHp * 0.5 ? 4.2 : 6.7) || engineRef.current.drakWingGustTimer > 7.2 ? 1 : 0,
            };
            Lada.drawDrak(ctx, this.x, this.y, this.animTime, renderFacingVx, isFleeing, this.enraged || this.hp <= this.maxHp * 0.5, attacks);
          }

          if (attackInfo.isActive) {
            ctx.restore();
            // Optional post-sprite attack graphics; hit/damage simulation is independent.
            if (isGameEffectEnabled('combatVfxEnabled')) drawEnemyAttackEffectsPost(ctx, this, attackInfo);
          }
        } else {
          // Unified modern enemy renderer with computeEnemyKinematics, underlay ground VFX, single transform and overlay weapon VFX
          drawEnemyRenderer(
            this.id === 'vrana' && this.isGroundedForLoot ? 'drawStageCrowGround' : this.method,
            ctx,
            this.x,
            this.y,
            this.animTime,
            this.vx,
            isFleeing,
            this
          );
        }

        if (isGameEffectEnabled('statusIndicatorsEnabled') && this.soaked && !this.isDefeated) {
          ctx.save();
          ctx.fillStyle = 'rgba(58, 118, 168, 0.14)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        if (isGameEffectEnabled('statusIndicatorsEnabled') && this.chilled && !this.isDefeated) {
          ctx.save();
          ctx.fillStyle = 'rgba(196, 225, 246, 0.16)';
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.78)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
        const pickleStatus = this.statusEffects?.pickle_sickness;
        if (isGameEffectEnabled('statusIndicatorsEnabled') && pickleStatus && !this.isDefeated) {
          const pulse = 0.12 + Math.sin(this.animTime * 7) * 0.04;
          ctx.save();
          ctx.fillStyle = 'rgba(101, 163, 13, ' + pulse + ')';
          ctx.strokeStyle = 'rgba(132, 204, 22, 0.65)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.fillStyle = '#A3E635';
          ctx.globalAlpha = 0.85;
          for(let i=0;i<pickleStatus.stacks;i++){
            const a=this.animTime*2+i*Math.PI*2/3;
            ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(this.radius+8),this.y-this.radius-4+Math.sin(a)*4,2.5,0,Math.PI*2);ctx.fill();
          }
          ctx.restore();
        }

        if (!this.isDefeated && engineRef.current?.lightSources && isGameEffectEnabled('dynamicLightingEnabled')) {
          const profile = metaRef.current.performanceProfile || (metaRef.current.performanceMode ? 'performance' : 'balanced');
          if (profile !== 'performance') {
            const maxLights = profile === 'balanced' ? 8 : Number.MAX_SAFE_INTEGER;
            drawNormalMappedReliefRim(ctx, this.x, this.y, this.radius, engineRef.current.lightSources, { maxLights });
          }
        }

        if (isSpecialBoss && scale !== 1.0) {
          ctx.restore();
        }

        // Miniboss Overhead Crown Badge & Distinct Health Bar
        const isPrimaryMinibossDisplay =
          this.isMiniboss &&
          !this.isDefeated &&
          (!this.isMinibossFlockMember ||
            engineRef.current?.enemies?.find(
              (e: any) => e.isMinibossFlockMember && !e.isDefeated && !e.dead
            ) === this);

        if (isPrimaryMinibossDisplay) {
          ctx.save();
          const activeFlockMembers = this.isMinibossFlockMember
            ? (engineRef.current?.enemies?.filter(
                (e: any) => e.isMinibossFlockMember && !e.isDefeated && !e.dead
              ) || [this])
            : [this];
          const displayHp = this.isMinibossFlockMember
            ? activeFlockMembers.reduce((sum: number, e: any) => sum + Math.max(0, e.hp || 0), 0)
            : this.hp;
          const displayMaxHp = this.isMinibossFlockMember
            ? (this.flockTotal || 9) * (this.maxHp || 38)
            : this.maxHp;

          const barWidth = Math.max(88, this.radius * 2.2);
          const barHeight = 8;
          const barX = this.x - barWidth / 2;
          const barY = this.y - this.radius * 1.5 - 14;

          // 1. Miniboss Title / Crown Badge (optional descriptor)
          if (isGameEffectEnabled('enemyDescriptorsEnabled')) {
            const badgeTitle = this.customBossTitle || (this.isMinibossFlockMember ? '🐦‍⬛ Hejno mrazivých vran' : stats.name);
            ctx.font = '900 12px "Eczar", serif';
            const titleText = `👑 ${badgeTitle.toUpperCase()}`;
            const titleWidth = ctx.measureText(titleText).width;
            const badgeW = titleWidth + 16;
            const badgeH = 18;
            const badgeX = this.x - badgeW / 2;
            const badgeY = barY - badgeH - 3;

            // Badge Cartouche
            ctx.fillStyle = '#FEF3C7';
            ctx.strokeStyle = '#1C1917';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 5);
            } else {
              ctx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            ctx.fill();
            ctx.stroke();

            // Gold border accent
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(badgeX + 1.5, badgeY + 1.5, badgeW - 3, badgeH - 3, 3);
            } else {
              ctx.rect(badgeX + 1.5, badgeY + 1.5, badgeW - 3, badgeH - 3);
            }
            ctx.stroke();

            // Badge text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#78350F';
            ctx.fillText(titleText, this.x, badgeY + badgeH / 2);
          }

          // 2. Health Bar Background
          ctx.fillStyle = '#1C1917';
          ctx.fillRect(barX, barY, barWidth, barHeight);

          // Health Bar Fill
          const hpPct = Math.max(0, Math.min(1, displayHp / Math.max(1, displayMaxHp)));
          const fillW = Math.max(0, barWidth * hpPct);
          if (fillW > 0) {
            const barGrad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
            barGrad.addColorStop(0, '#DC2626');
            barGrad.addColorStop(0.5, '#EA580C');
            barGrad.addColorStop(1, '#F59E0B');
            ctx.fillStyle = barGrad;
            ctx.fillRect(barX + 1, barY + 1, fillW - 2, barHeight - 2);
          }

          // Health Bar Frame
          ctx.strokeStyle = '#FDE047';
          ctx.lineWidth = 1.6;
          ctx.strokeRect(barX, barY, barWidth, barHeight);

          // Health HP text
          ctx.font = '900 9px "Eczar", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          const hpText = this.isMinibossFlockMember
            ? `${Math.ceil(displayHp)} / ${displayMaxHp} (${activeFlockMembers.length}/${this.flockTotal || 9})`
            : `${Math.ceil(displayHp)} / ${displayMaxHp} Kuráž`;
          ctx.strokeText(hpText, this.x, barY + barHeight / 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(hpText, this.x, barY + barHeight / 2);

          ctx.restore();
        } else if (this.hp < this.maxHp && !this.isDefeated) {
          // Standard regular enemy health bar when damaged
          ctx.save();
          const barWidth = Math.max(26, this.radius * 1.5);
          const barHeight = 4;
          const barX = this.x - barWidth / 2;
          const barY = this.y - this.radius - 12;
          ctx.fillStyle = '#1C1917';
          ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
          const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));
          ctx.fillStyle = hpPct > 0.4 ? '#DC2626' : '#EF4444';
          ctx.fillRect(barX, barY, Math.max(0, barWidth * hpPct), barHeight);
          ctx.strokeStyle = '#44403C';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
          ctx.restore();
        }

        // Název / odznak pro prefixovaného bubáka
        if (isGameEffectEnabled('enemyDescriptorsEnabled') && this.prefix && !this.isMiniboss && !this.isDefeated) {
          ctx.save();
          const pDef = ENEMY_PREFIX_DEFS[this.prefix as EnemyPrefixType];
          const badgeText = pDef ? pDef.badge : this.prefix;
          ctx.font = '900 11px "Eczar", serif';
          const bWidth = ctx.measureText(badgeText).width;
          const badgeW = bWidth + 14;
          const badgeH = 17;
          const badgeX = this.x - badgeW / 2;
          const badgeY = this.y - this.radius - 18 - (this.hp < this.maxHp ? 8 : 0);

          ctx.fillStyle = 'rgba(255, 251, 235, 0.94)';
          ctx.strokeStyle = pDef ? pDef.color : '#38BDF8';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 4);
          } else {
            ctx.rect(badgeX, badgeY, badgeW, badgeH);
          }
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#1C1917';
          ctx.fillText(badgeText, this.x, badgeY + badgeH / 2);
          ctx.restore();
        }

        // Attack charging / windup telegraph while in attack range
        if (isGameEffectEnabled('windupTelegraphCirclesEnabled') && isGameEffectEnabled('warningIndicatorsEnabled') && ((this.windupTimer || 0) > 0 || (this.inContact && (this.contactTimer || 0) > 0)) && !this.isDefeated && (this.strikeTimer || 0) <= 0) {
          ctx.save();
          const totalInterval = this.attackDelay || this.attackInterval || (this.attackCadence === 'fast' ? 0.6 : this.attackCadence === 'slow' ? 1.8 : 1.2);
          const currentTimer = this.windupTimer || (totalInterval - (this.contactTimer || 0));
          const progress = Math.max(0, Math.min(1, currentTimer / totalInterval));
          ctx.strokeStyle = this.attackCadence === 'slow' ? '#DC2626' : this.attackCadence === 'normal' ? '#EA580C' : '#EAB308';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
          ctx.stroke();
          ctx.restore();
        }

        // Brief hurt/hit flash silhouette
        if (this.hitFlashTimer > 0 && !this.isDefeated) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(this.x, this.y - this.radius * 0.4, this.radius * 1.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (didSaveAlpha) {
          ctx.restore();
        }
      },
    };
    if (directorRef.current) {
      directorRef.current.recordEnemySpawn(instance, engineRef.current.gameTime || 0);
    }
    return instance;
  };

  // Manual trigger to immediately spawn current level's miniboss (available in pause menu for instant action/testing)
  const spawnMinibossNow = () => {
    const curLvlId = engineRef.current.activeLevelId !== undefined ? engineRef.current.activeLevelId : (selectedLevelId !== undefined ? selectedLevelId : 0);
    const curLvl = GAME_LEVELS[curLvlId] || GAME_LEVELS[0];
    const player = engineRef.current.player;
    if (!player) return;

    const bossDef = !engineRef.current.miniBossSpawned ? curLvl.miniBoss : curLvl.midBoss;
    engineRef.current.miniBossSpawned = true;
    const ang = Math.random() * Math.PI * 2;
    const pos = RunDirector.getOffscreenPosition(player, ang, engineRef.current, 180);
    if (bossDef.id === 'vrana') {
      (engineRef.current as any).flockTreasureDropped = false;
      const crowCount = 9;
      for (let i = 0; i < crowCount; i++) {
        const flockAngle = (i / crowCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const dist = i === 0 ? 0 : 35 + (i % 3) * 15;
        const cx = pos.x + Math.cos(flockAngle) * dist;
        const cy = pos.y + Math.sin(flockAngle) * dist;
        const crowTitle = i === 0 ? bossDef.name : undefined;
        const crowEnemy = createEnemyInstance(
          bossDef.id,
          cx,
          cy,
          bossDef.multiplier,
          false,
          true,
          crowTitle
        );
        (crowEnemy as any).isMinibossFlockMember = true;
        (crowEnemy as any).flockIndex = i;
        (crowEnemy as any).flockTotal = crowCount;
        engineRef.current.enemies.push(crowEnemy);
        directorRef.current?.recordEnemySpawn(crowEnemy, engineRef.current.gameTime);
      }
    } else {
      const bossEnemy = createEnemyInstance(
        bossDef.id,
        pos.x,
        pos.y,
        bossDef.multiplier,
        false,
        true,
        bossDef.name
      );
      engineRef.current.enemies.push(bossEnemy);
      directorRef.current?.recordEnemySpawn(bossEnemy, engineRef.current.gameTime);
    }
    pushDamageText(engineRef.current.texts, player.x, player.y - 50, `👑 ${bossDef.name}`, COLORS.mustard, true);
    setRunStats((s) => ({
      ...s,
      warningBanner: bossDef.warning,
      bossTitle: `👑 MINIBOSS: ${bossDef.name}`,
      bossHpPct: 100,
    }));
    sound.boss();
    setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
  };

  // Manual trigger to immediately spawn an elite enemy with one of the 4 prefixes (Vichřicový, Hromový, Kamenný, Pekelný)
  const spawnPrefixedEnemyNow = (forcedPrefix?: EnemyPrefixType) => {
    const curLvlId = engineRef.current.activeLevelId !== undefined ? engineRef.current.activeLevelId : (selectedLevelId !== undefined ? selectedLevelId : 0);
    const curLvl = GAME_LEVELS[curLvlId] || GAME_LEVELS[0];
    const player = engineRef.current.player;
    if (!player) return;

    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    const prefix = forcedPrefix || prefixes[Math.floor(Math.random() * prefixes.length)];
    const pDef = ENEMY_PREFIX_DEFS[prefix];
    const mobPool = curLvl.enemies || ['rarach'];
    const mobId = mobPool[Math.floor(Math.random() * mobPool.length)] || 'rarach';

    const ang = Math.random() * Math.PI * 2;
    const pos = RunDirector.getOffscreenPosition(player, ang, engineRef.current, 180);
    const enemy = createEnemyInstance(
      mobId,
      pos.x,
      pos.y,
      1.0,
      false,
      false,
      undefined,
      prefix
    );
    engineRef.current.enemies.push(enemy);
    directorRef.current?.recordEnemySpawn(enemy, engineRef.current.gameTime || 0);
    pushDamageText(engineRef.current.texts, enemy.x, enemy.y - 45, `${pDef.badge}!`, pDef.color, true, 'directorWarningBanners');
    sound.roar();
    setRunStats((s) => ({
      ...s,
      warningBanner: `⚠️ ELITNÍ BUBÁK: ${pDef.badge} (${ENEMIES[mobId]?.name || mobId})!`,
    }));
    setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const claimTrophy = (id: string) => {
    const trophy = TROPHIES.find((t) => t.id === id);
    if (!trophy || meta.trophiesClaimed[id] || !trophy.isMet(meta)) return;

    sound.cheer();
    sound.coin();
    saveMeta({
      ...meta,
      krejcary: meta.krejcary + trophy.reward,
      trophiesClaimed: { ...meta.trophiesClaimed, [id]: true },
    });
  };

  // Compact Hunter Card body: role, headline stats and gear names. Full numbers and ability text live in the Hunter Dossier modal.
  const renderHunterInfoCard = (hunterInfo: HunterDetail) => {
    const weaponDef = WEAPONS[hunterInfo.weaponId];
    if (!weaponDef) return null;

    return (
      <div className="hunter-card-info">
        <div className="hunter-card-role">{hunterInfo.role}</div>
        <div className="hunter-card-statrow">
          <span title="Kuráž"><GameIcon icon="heart" size={14} /> {hunterInfo.maxHp}</span>
          <span title="Rychlost"><GameIcon icon="boots" size={14} /> {hunterInfo.speed}</span>
          <span title="Magnet"><GameIcon icon="horseshoe" size={14} /> {hunterInfo.pickupRadius}</span>
          <span title="Štěstí"><GameIcon icon="clover" size={14} /> {hunterInfo.luck}</span>
        </div>
        <div className="hunter-card-gear" title="Počáteční výbava">
          <GameIcon icon="sword" size={13} /> <span>{weaponDef.name}</span>
        </div>
        <div className="hunter-card-gear" title={`Zvláštní schopnost · ${hunterInfo.cooldownSeconds} s`}>
          <GameIcon icon="lightning" size={13} /> <span>{hunterInfo.abilityName}</span>
        </div>
      </div>
    );
  };

  // Single Hunter Card for every unlocked hunter (starters included). Clicking the card starts the run.
  const renderUnlockedHunterCard = (
    id: HunterDetailKey,
    name: string,
    portrait?: React.ReactNode
  ) => {
    const hunterInfo = HUNTER_DETAILS[id];
    return (
      <div
        key={id}
        className="char-card"
        style={{ minHeight: 0, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflowWrap: 'anywhere' }}
        onClick={() => startGame(id)}
        title={`Zvolit lovce: ${name}`}
      >
        <LadaCardCorners variant="default" showBottomCorners={true} />
        <span className="char-card-unlocked-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <GameIcon icon="checkmark" size={13} /> Odemčeno
        </span>
        {portrait}
        <h3 style={{ fontSize: '1.42rem', margin: '4px 0 2px 0', minHeight: '36px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {name}
        </h3>
        {renderHunterInfoCard(hunterInfo)}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <button
            className="lada-btn btn-small"
            style={{ width: '100%', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
            onClick={(event) => {
              event.stopPropagation();
              sound.coin();
              setSelectedHunterInfo(hunterInfo);
            }}
          >
            <GameIcon icon="scroll" size={15} /> Spis lovce
          </button>
        </div>
      </div>
    );
  };

  // Helper to render hunter card with progressive spoil
  const renderHunterSelectCard = (
    prog: HunterProgress,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  ) => {
    const portrait = <canvas ref={canvasRef} className="portrait-canvas hunter-portrait-compact" width={180} height={180} />;
    if (prog.isUnlocked) {
      return renderUnlockedHunterCard(prog.id as HunterDetailKey, prog.spoiledName, portrait);
    }

    return (
      <div
        key={prog.id}
        className="char-card char-card-locked"
        style={{ minHeight: 0, minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflowWrap: 'anywhere' }}
        onClick={() => {
          sound.hit();
          setSelectedHunterDetail(prog);
          if (prog.isQueued) {
            showUnlockNotice({
              icon: 'padlock',
              title: `${prog.spoiledName} je v pořadí!`,
              desc: `Tento lovec se začne odemykat teprve poté, co odemknete předchozího lovce (${prog.requiredHunterName}).`,
            }, 4500);
          } else {
            showUnlockNotice({
              icon: 'padlock',
              title: `${prog.spoiledName} je uzamčen!`,
              desc: `Splněno ${prog.percent} % výzvy: ${prog.curCount} / ${prog.maxCount} zahnáno.`,
            }, 4500);
          }
        }}
        title="Klikněte pro podrobnosti výzvy"
      >
        <LadaCardCorners variant="locked" showBottomCorners={true} />
        <span className="char-card-locked-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <GameIcon icon="padlock" size={13} /> {prog.isQueued ? 'V pořadí' : 'Zamčeno'}
        </span>
        {portrait}
        <h3 style={{ fontSize: '1.42rem', margin: '4px 0 2px 0', minHeight: '36px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {prog.spoiledName}
        </h3>
        <div>
          <span className={`hunter-tier-stamp tier-stamp-${prog.tier}`}>
            {prog.clueTag}
          </span>
        </div>

        <div className="hunter-progress-wrap">
          <div className="hunter-progress-header">
            <span>{prog.isQueued ? `Čeká na: ${prog.requiredHunterName}` : 'Výzva k odemčení:'}</span>
            <span>
              {prog.curCount} / {prog.maxCount} ({prog.percent} %)
            </span>
          </div>
          <div className="hunter-progress-bar-outer">
            <div
              className="hunter-progress-bar-fill"
              style={{ width: `${prog.percent}%` }}
            />
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <button
            className="lada-btn btn-small"
            style={{
              width: '100%',
              fontSize: '0.9rem',
              background: 'var(--wood-dark)',
              color: 'var(--parchment)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              sound.coin();
              setSelectedHunterDetail(prog);
            }}
          >
            <GameIcon icon="scroll" size={15} /> Zobrazit výzvu
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <canvas
        id="gameCanvas"
        ref={canvasRef}
        onClick={(e) => {
          const cs = engineRef.current.cutscene;
          if (cs) {
            if (!cs.applied) {
              cs.t = Math.max(cs.t, cs.applyAt);
            } else {
              cs.t = cs.dur;
            }
            return;
          }
          if (gameState === 'playing') {
            const eng = engineRef.current;
            const p = eng.player;
            if (eng.grandfather.active && p && Math.hypot(eng.grandfather.x - p.x, eng.grandfather.y - p.y) < 240) {
              const canvas = canvasRef.current;
              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const clickScreenX = (e.clientX - rect.left) * (canvas.width / rect.width);
                const clickScreenY = (e.clientY - rect.top) * (canvas.height / rect.height);
                const gScreenX = eng.grandfather.x - eng.camera.x;
                const gScreenY = eng.grandfather.y - eng.camera.y;
                if (Math.hypot(clickScreenX - gScreenX, clickScreenY - gScreenY) < 100) {
                  openGrandfatherShop();
                }
              }
            }
          }
        }}
      />

      {/* IN-GAME HUD */}
      {gameState === 'playing' && (
        <div id="hud">
          {/* Top HUD: Kuráž + XP + compact combat stats */}
          <div id="top-bar">
            <LadaHudBotanicalDecor />

            {/* Kuráž = Lovcovo HP + Kompaktní perníčky + Mobile Quick Pause Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', position: 'relative' }}>
              <div
                id="courage-container"
                className="bar-container"
                style={{ flex: 1 }}
                aria-label={`Kuráž ${Math.ceil(runStats.hp)} z ${Math.ceil(runStats.maxHp)}`}
              >
                <div
                  id="courage-fill"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (runStats.hp / Math.max(1, runStats.maxHp)) * 100)
                    )}%`,
                  }}
                />
                <div className="bar-text">
                  <span style={{ marginRight: '6px', display: 'inline-flex', verticalAlign: 'middle' }}><GameIcon icon="lion" size={16} /></span>
                  KURÁŽ {Math.ceil(runStats.hp)} / {Math.ceil(runStats.maxHp)}
                </div>
              </div>
              <div
                id="hud-gingerbread-chip"
                className="hud-gingerbread-chip"
                title="Perníčky pro Čertova dědečka"
                aria-label={`Perníčky ${runStats.gingerbread}`}
              >
                <PernicekIcon size={20} />
                <span>{runStats.gingerbread}</span>
              </div>
              <button
                className="hud-pause-btn"
                onClick={togglePause}
                title={gamepadUiState.activeDevice === 'gamepad' ? 'Pozastavit hru [Start]' : 'Pozastavit hru [P / Esc]'}
                aria-label="Pozastavit hru"
              >
                <GameIcon icon="pause" size={16} />
              </button>
            </div>

            {/* Stats row with Day/Night clock indicator */}
            <div id="stats-row">
              <div className="stats-clock-block">
                <span className="stats-clock-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon={runStats.dayPhase.icon} size={22} /></span>
                <div>
                  <div className="stats-clock-timer">{formatTimer(runStats.time)}</div>
                  <div className="stats-clock-phase">
                    {runStats.dayPhase.name}
                  </div>
                </div>
              </div>
              <span className="hud-stat-divider" style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon="leaf" size={12} /></span>
              <div id="coins-text" style={{ color: '#111111', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Krejcary: {runStats.coins} <KrejcarIcon size={18} />
              </div>
              <span className="hud-stat-divider" style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon="leaf" size={12} /></span>
              <div id="souls-text" style={{ color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '5px' }}><GameIcon icon="urn" size={16} /> Dušičky: {runStats.souls}</div>
              <span className="hud-stat-divider" style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon="leaf" size={12} /></span>
              <div id="kills-text" style={{ color: '#7F1D1D', display: 'flex', alignItems: 'center', gap: '5px' }}>Zklidněno: {runStats.kills} <GameIcon icon="bread" size={16} /></div>
              <span className="hud-stat-divider" style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon="leaf" size={12} /></span>
              <div id="chest-progress-text" style={{ color: '#78350F', display: 'flex', alignItems: 'center', gap: '5px' }} title={`Truhla s pokladem se objeví po každých ${DROP_THRESHOLDS.chest} bodech zahnadých nepřátel a po každém bossovi`}>
                <GameIcon icon="chest" size={16} /> Poklad: {runStats.chestProgress}/{DROP_THRESHOLDS.chest}
              </div>
            </div>

            {/* Boss Bar if boss spawned */}
            {runStats.bossHpPct !== null && (
              <div id="boss-bar-wrap">
                <div className="boss-title-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <GameIcon icon="devil" size={20} /> {runStats.bossTitle} <GameIcon icon="devil" size={20} />
                </div>
                <div id="boss-bar-container">
                  <div id="boss-hp-fill" style={{ width: `${runStats.bossHpPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Warning Banner */}
          {runStats.warningBanner &&
            isGameEffectEnabled('effectsEnabled') &&
            shouldShowWarningBanner(runStats.warningBanner, meta.combatTextSettings || DEFAULT_COMBAT_TEXT_SETTINGS) && (
              <div id="boss-warning-banner" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <GameIcon icon="warning" size={22} />
                <span>{runStats.warningBanner.replace(/^[^\p{L}\p{N}]+/u, '').trim()}</span>
              </div>
          )}

          {/* Ultimate ability indicator button with cooldown countdown & visual readiness indicator */}
          {!touchEnabled && (() => {
            const p = engineRef.current.player;
            const pType = p?.type;
            const totalMaxCd = Math.max(1, (p?.ultMaxCd || 25) * (p?.cooldownMultiplier || 1));
            const isReady = runStats.ultCd <= 0;
            const readinessPct = isReady ? 100 : Math.max(0, Math.min(100, (1 - runStats.ultCd / totalMaxCd) * 100));
            const abilityIcon =
              pType === 'tulak' || pType === 'wanderer'
                ? 'wood_log'
                : pType === 'krajanek'
                  ? 'mill'
                  : pType === 'pasacek' || pType === 'shepherd'
                    ? 'sheep'
                    : pType === 'korenarka'
                      ? 'herbs'
                      : pType === 'kostelnik' || pType === 'sexton'
                        ? 'bell'
                        : pType === 'babicka' || pType === 'granny'
                          ? 'bread'
                          : 'lightning';
            const abilityName =
              pType === 'krajanek'
                ? 'Jízda na žernovu'
                : pType === 'tulak' || pType === 'wanderer'
                  ? 'Pověstná sukovice'
                  : pType === 'pasacek' || pType === 'shepherd'
                    ? 'Pastýřská píšťalka'
                    : pType === 'korenarka'
                      ? 'Očistné kadidlo'
                      : pType === 'kostelnik' || pType === 'sexton'
                        ? 'Farní požehnání'
                        : pType === 'babicka' || pType === 'granny'
                          ? 'Vlídné slovo'
                          : 'Speciální schopnost';
            const keyHint = gamepadUiState.activeDevice === 'gamepad' ? '[RB / B]' : '[MEZERNÍK]';

            return (
              <button
                id="ult-indicator"
                onClick={triggerUltimate}
                style={{
                  backgroundColor: isReady ? 'var(--blood-red)' : '#3E2723',
                  transform: isReady ? 'translateX(-50%) scale(1.04)' : 'translateX(-50%) scale(1)',
                  overflow: 'hidden',
                  padding: '8px 18px 11px',
                  minWidth: '290px',
                }}
                title={`${abilityName} — ${isReady ? 'Připravena!' : `Nabíjí se (${Math.ceil(runStats.ultCd)} s)`} ${keyHint}`}
              >
                {/* Visual readiness fill bar at bottom of button */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    height: '5px',
                    width: `${readinessPct}%`,
                    background: isReady ? '#FDE047' : '#F59E0B',
                    transition: 'width 0.15s linear',
                  }}
                />
                {isReady ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#FEF08A',
                        border: '1.5px solid #1C1610',
                      }}
                    >
                      <GameIcon icon={abilityIcon} size={16} />
                    </span>
                    <span>{abilityName.toUpperCase()}: PŘIPRAVENA!</span>
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.28)',
                        border: '1px solid rgba(255,255,255,0.45)',
                        borderRadius: 5,
                        padding: '1px 6px',
                        fontSize: '0.82rem',
                      }}
                    >
                      {keyHint}
                    </span>
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.14)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <GameIcon icon={abilityIcon} size={14} />
                    </span>
                    <span>
                      {abilityName}: <strong>{Math.ceil(runStats.ultCd)} s</strong> ({Math.round(readinessPct)} %)
                    </span>
                    <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>{keyHint}</span>
                  </span>
                )}
              </button>
            );
          })()}
        </div>
      )}

      {/* STAGE 1 FOREGROUND SUN DEVELOPER & STRESS-TEST HUD (VISIBLE WITH FPS OVERLAY) */}
      {gameState === 'playing' &&
        (engineRef.current.activeLevelId ?? selectedLevelId) === 0 &&
        (isUrlPerfOverlay || Boolean(meta.showPerfOverlay)) && (
          <SunDebugHudPanel
            configRef={sunOverlayConfigRef}
            sunStateRef={sunFrameStateRef}
            getTelemetry={getSunDebugTelemetry}
            onToggleStressTest={handleToggleSunStressTest}
          />
        )}

      {/* TOUCH CONTROLS */}
      {gameState === 'playing' && (
        <TouchControls
          enabled={touchEnabled}
          active={touchMoveRef.current.active}
          isRideActive={engineRef.current.player?.type === 'krajanek' && (engineRef.current.player?.krajanekRideTimer || 0) > 0}
          hunterType={engineRef.current.player?.type}
          onMove={(x, y, intensity) => {
            touchMoveRef.current = { x, y, active: true, intensity };
          }}
          onStop={() => {
            touchMoveRef.current = { x: 0, y: 0, active: false, intensity: 0 };
          }}
          onTriggerUltimate={triggerUltimate}
          ultCooldown={runStats.ultCd}
        />
      )}

      {/* 1. OBRAZOVKA: VÝBĚR VÝPRAVY (STAGE SELECT) */}
      {gameState === 'menu' && menuScreen === 'stage' && (
        <div id="main-menu" className="overlay">
          <div className="panel" style={{ maxWidth: '1040px' }}>
            {/* Top quick audio toggles */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <button
                className="sound-toggle-btn"
                style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                onClick={toggleSound}
                title="Zapnout / vypnout zvukové efekty"
              >
                <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon={soundEnabled ? "sound_on" : "sound_off"} size={16} /> {soundEnabled ? 'Zvuk: Zap' : 'Zvuk: Vyp'}</span>
              </button>
              <button
                className="sound-toggle-btn"
                style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                onClick={toggleMusic}
                title="Zapnout / vypnout vesnickou hudbu"
              >
                <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon={musicEnabled ? "music_on" : "music_off"} size={16} /> {musicEnabled ? 'Hudba: Zap' : 'Hudba: Vyp'}</span>
              </button>
            </div>

            <BubakovCoverTitle />

            {/* 8 PROGRESSIVE GAME LEVELS SELECTOR */}
            <div className="level-select-section" style={{ margin: '10px 0 16px 0' }}>
              <div className="level-grid">
                {([0, 1, 2, 3, 4, 5, 6, 7] as GameLevelId[]).map((lvlId) => {
                  const prog = levelProgress[lvlId];
                  const lvl = GAME_LEVELS[lvlId];
                  const isUnlocked = prog?.isUnlocked ?? false;
                  const isSelected = selectedLevelId === lvlId;
                  const isCompleted = !!(meta.completedLevels && meta.completedLevels[lvlId]) ||
                    (lvlId === 0 && (meta.bestiaryKills?.vrana || 0) >= 1) ||
                    (lvlId === 1 && (meta.bestiaryKills?.morana || 0) >= 1) ||
                    (lvlId === 2 && (meta.bestiaryKills?.cert || 0) >= 1) ||
                    (lvlId === 3 && (meta.bestiaryKills?.hejkal || 0) >= 1) ||
                    (lvlId === 4 && (meta.bestiaryKills?.obr || 0) >= 1) ||
                    (lvlId === 5 && (meta.bestiaryKills?.mlynar || 0) >= 1) ||
                    (lvlId === 6 && (meta.bestiaryKills?.bezhlavy_rytir || 0) >= 1) ||
                    (lvlId === 7 && (meta.bestiaryKills?.drak || 0) >= 1);

                  return (
                    <div
                      key={lvlId}
                      className={`level-card ${isSelected ? 'level-card-selected' : ''} ${isUnlocked ? '' : 'level-card-locked'}`}
                      onClick={() => {
                        if (isUnlocked) {
                          sound.coin();
                          setSelectedLevelId(lvlId);
                          saveMeta({ ...meta, selectedLevel: lvlId });
                        } else {
                          sound.hit();
                          setSelectedLevelDetail(prog);
                          if (prog.isQueued) {
                            showUnlockNotice({
                              title: `${prog.spoiledName} je v pořadí!`,
                              desc: `Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň (${prog.requiredLevelName}).`,
                            });
                          } else {
                            showUnlockNotice({
                              title: `${prog.spoiledName} (${prog.percent} %)`,
                              desc: `Splněno ${prog.percent} % výzvy: ${prog.curCount} / ${prog.maxCount} zahnáno. Klikněte pro podrobnosti výzvy!`,
                            });
                          }
                        }
                      }}
                      title={isUnlocked ? (isSelected ? `Zvoleno: ${lvl.name} (klikněte pro výběr lovce)` : `Zvolit výpravu: ${lvl.name}`) : 'Klikněte pro podrobnosti výzvy a milníků'}
                    >
                      <LadaCardCorners
                        variant={isSelected ? 'selected' : isUnlocked ? 'default' : 'locked'}
                        showBottomCorners={true}
                      />
                      <div className="level-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <span className={`level-badge ${isSelected ? 'badge-selected' : isCompleted ? 'badge-completed' : isUnlocked ? 'badge-unlocked' : 'badge-locked'}`} style={{ maxWidth: '100%', overflowWrap: 'break-word', whiteSpace: 'normal', lineHeight: 1.2 }}>
                          {isSelected ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="star" size={13} /> Zvolená výprava</span>
                          ) : isCompleted ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="checkmark" size={13} /> Pokořeno</span>
                          ) : isUnlocked ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="padlock_open" size={13} /> Otevřeno</span>
                          ) : prog.isQueued ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="padlock" size={13} /> V pořadí (0 %)</span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="padlock" size={13} /> Zamčeno ({prog.percent} %)</span>
                          )}
                        </span>
                        <span className="level-theme-tag" style={{ overflowWrap: 'break-word', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <GameIcon icon={prog.spoiledIcon} size={15} /> {prog.spoiledBadge}
                        </span>
                      </div>

                      <div className="level-title" style={{ fontSize: '1.25rem', fontWeight: 900, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {prog.spoiledName}
                      </div>
                      <div className="level-subtitle" style={{ fontSize: '0.85rem', color: 'var(--wood-dark)', fontWeight: 800, minHeight: '32px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {prog.spoiledSubtitle}
                      </div>

                      <div>
                        <span className={`hunter-tier-stamp tier-stamp-${prog.tier}`} style={{ fontSize: '0.74rem', margin: '4px 0 6px 0', maxWidth: '100%', overflowWrap: 'break-word' }}>
                          {prog.clueTag}
                        </span>
                      </div>


                      {/* Challenge progress bar for locked / progressive levels */}
                      {!isUnlocked && (
                        <div className="hunter-progress-wrap" style={{ marginTop: 'auto', paddingTop: '6px' }}>
                          <div className="hunter-progress-header">
                            <span>{prog.isQueued ? `Čeká na: ${prog.requiredLevelName}` : 'Výzva k odhalení cesty:'}</span>
                            <span>
                              {prog.curCount} / {prog.maxCount} ({prog.percent} %)
                            </span>
                          </div>
                          <div className="hunter-progress-bar-outer" style={{ height: '12px' }}>
                            <div
                              className="hunter-progress-bar-fill"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                          <div className="hunter-progress-ticks">
                            <span className={`hunter-tick ${prog.percent >= 0 ? 'reached' : ''}`}>0%</span>
                            <span className={`hunter-tick ${prog.percent >= 25 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              {prog.percent >= 25 ? <GameIcon icon="checkmark" size={11} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 25%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 50 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              {prog.percent >= 50 ? <GameIcon icon="checkmark" size={11} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 50%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 75 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              {prog.percent >= 75 ? <GameIcon icon="checkmark" size={11} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 75%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 100 ? 'reached' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                              {prog.percent >= 100 ? <GameIcon icon="checkmark" size={11} /> : <span style={{ opacity: 0.5, fontSize: '9px' }}>○</span>} 100%
                            </span>
                          </div>
                          {prog.enemiesBreakdown.length > 0 && (
                            <div className="hunter-enemy-pills">
                              {prog.enemiesBreakdown.map((e) => (
                                <span key={e.id} className="hunter-enemy-pill" title={`${e.name}: ${e.count} zahnáno`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <GameIcon icon={e.icon} size={13} /> {e.count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive detail button */}
                      <div style={{ marginTop: isUnlocked ? 'auto' : '6px', paddingTop: '6px', display: 'flex', gap: '6px' }}>
                        {!isUnlocked ? (
                          <button
                            className="lada-btn btn-small"
                            style={{ width: '100%', fontSize: '0.84rem', padding: '5px 8px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.coin();
                              setSelectedLevelDetail(prog);
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}><GameIcon icon="scroll" size={14} /> Prozkoumat stopy a milníky</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', width: '100%', gap: '6px' }}>
                            <button
                              className="lada-btn btn-small"
                              style={{
                                flex: 1,
                                fontSize: '0.84rem',
                                padding: '5px 8px',
                                background: isSelected ? 'var(--mustard)' : undefined,
                                color: isSelected ? 'var(--ink)' : undefined,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.coin();
                                setSelectedLevelId(lvlId);
                                saveMeta({ ...meta, selectedLevel: lvlId });
                                setMenuScreen('hunter');
                              }}
                              title={isSelected ? 'Pokračovat k výběru lovce' : 'Zvolit tuto výpravu a pokračovat'}
                            >
                              {isSelected ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                                  Pokračovat k lovci <GameIcon icon="arrow" size={14} />
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                                  <GameIcon icon="map" size={14} /> Zvolit výpravu
                                </span>
                              )}
                            </button>
                            <button
                              className="tab-btn"
                              style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.coin();
                                setSelectedLevelDetail(prog);
                              }}
                              title="Zobrazit kroniku a milníky této úrovně"
                            >
                              <GameIcon icon="scroll" size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC DIFFICULTY PRE-RUN SELECTOR */}
            <div
              style={{
                background: '#FEF3C7',
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '10px 16px',
                margin: '10px 0 14px 0',
                color: 'var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}><GameIcon icon="flame" size={24} /></span>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#92400E' }}>
                      Dynamická obtížnost (Režisér výpravy)
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: '#451A03', fontWeight: 700 }}>
                      Agresivita a tempo vln Režiséra výpravy během noci
                    </div>
                  </div>
                </div>
                {(() => {
                  const activePreset = getDifficultyPreset(meta.dynamicDifficulty ?? 3.0);
                  const isLightBg = activePreset.value <= 3.0;
                  return (
                    <div
                      style={{
                        background: activePreset.color,
                        color: isLightBg ? 'var(--ink)' : '#FFFFFF',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        border: '2px solid var(--ink)',
                        boxShadow: '1px 1px 0 var(--ink)',
                      }}
                    >
                      {activePreset.badge}
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.5"
                  value={meta.dynamicDifficulty ?? 3.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    sound.coin();
                    saveMeta({ ...meta, dynamicDifficulty: val });
                  }}
                  style={{ flex: 1, accentColor: '#92400E', cursor: 'pointer', height: '8px' }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#78350F',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}
              >
                {DYNAMIC_DIFFICULTY_PRESETS.map((preset) => (
                  <span
                    key={preset.value}
                    style={{
                      cursor: 'pointer',
                      color: Math.abs((meta.dynamicDifficulty ?? 3.0) - preset.value) < 0.24 ? '#9A3412' : '#78350F',
                      fontWeight: Math.abs((meta.dynamicDifficulty ?? 3.0) - preset.value) < 0.24 ? 900 : 700,
                      textDecoration: Math.abs((meta.dynamicDifficulty ?? 3.0) - preset.value) < 0.24 ? 'underline' : 'none',
                    }}
                    onClick={() => {
                      sound.coin();
                      saveMeta({ ...meta, dynamicDifficulty: preset.value });
                    }}
                  >
                    {preset.shortLabel}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#451A03',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1.5px dashed #B45309',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  marginTop: '6px',
                  lineHeight: 1.35,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="scroll" size={15} /> <em>{getDifficultyPreset(meta.dynamicDifficulty ?? 3.0).subtitle}</em></span>
              </div>
            </div>

            {/* CONFIRMATION / PROCEED CALLOUT BAR */}
            <div className="stage-summary-callout">
              <LadaCardCorners variant="callout" showBottomCorners={true} />
              <div className="stage-summary-info">
                <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--wood-dark)' }}>
                  Vybraná výprava pro nadcházející noc:
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0', flexWrap: 'wrap' }}>
                  <GameIcon icon={currentLevel.icon} size={32} />
                  <span>{currentLevel.name}</span>
                  <span style={{ fontSize: '0.9rem', color: '#78350F' }}>
                    ({currentLevel.shortTitle} • {currentLevel.season === 'winter' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="snowflake" size={13} /> Zima</span> : currentLevel.season === 'spring' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="seedling" size={13} /> Jaro</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="autumn_leaf" size={13} /> Podzim</span>})
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="wheat" size={16} /> {levelProgress[selectedLevelId]?.spoiledBossHint || `Hlavní noční nezbeda: ${currentLevel.finalBoss.name}`}</span>
                </div>
              </div>

              <button
                className="lada-btn stage-proceed-btn"
                style={{
                  padding: '12px 28px',
                  fontSize: '1.25rem',
                  background: 'var(--leaf-green)',
                  color: 'var(--white)',
                  boxShadow: '4px 4px 0px var(--ink)',
                }}
                onClick={() => {
                  sound.coin();
                  setMenuScreen('hunter');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Pokračovat k výběru lovce <GameIcon icon="arrow" size={18} />
                </span>
              </button>
            </div>

            {/* MAIN HUB TOOLBAR */}
            <div className="menu-hub-toolbar">
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                onClick={() => setGameState('tavern')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="village" size={18} /> Vesnice & Hospoda ({meta.krejcary} <KrejcarIcon size={16} />)
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="sword" size={16} /> Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
                </span>
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="book" size={16} /> Bestiář nočního venkova
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#1D4ED8', color: '#FFFFFF', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
                title="Detailní vysvětlení ovládání hry, cílů a rad pro přežití"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="gamepad" size={16} /> Ovládání hry
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--wood-dark)', color: 'var(--parchment)', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsSettingsDevOpen(true);
                }}
                title="Nastavení grafiky, audia, výkonu a vývojářské nástroje"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="gear" size={16} /> Nastavení a vývoj
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. OBRAZOVKA: VÝBĚR LOVCE (HUNTER SELECT) */}
      {gameState === 'menu' && menuScreen === 'hunter' && (
        <div id="hunter-menu" className="overlay">
          <div className="panel" style={{ maxWidth: '1040px' }}>
            {/* Top Navigation Bar: Back button and chosen stage badge */}
            <div className="hunter-screen-nav-bar">
              <button
                className="lada-btn btn-small"
                style={{
                  background: 'var(--wood-dark)',
                  color: 'var(--parchment)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.95rem',
                  padding: '8px 14px',
                }}
                onClick={() => {
                  sound.coin();
                  setMenuScreen('stage');
                }}
              >
                ⬅️ Zpět k výběru výpravy
              </button>

              <div
                className="hunter-stage-chip"
                onClick={() => {
                  sound.coin();
                  setMenuScreen('stage');
                }}
                title="Klikněte pro změnu výpravy"
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.5rem' }}>{currentLevel.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--wood-dark)' }}>
                    Cíl výpravy:
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--ink)' }}>
                    {currentLevel.name} <span style={{ fontSize: '0.82rem', color: '#78350F' }}>({currentLevel.shortTitle} • {currentLevel.season === 'winter' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="snowflake" size={13} /> Zima</span> : currentLevel.season === 'spring' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="seedling" size={13} /> Jaro</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><GameIcon icon="autumn_leaf" size={13} /> Podzim</span>})</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1D4ED8', textDecoration: 'underline', marginLeft: '6px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Změnit <GameIcon icon="map" size={14} /></span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <button
                  className="sound-toggle-btn"
                  style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                  onClick={toggleSound}
                  title="Zapnout / vypnout zvukové efekty"
                >
                  <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon={soundEnabled ? "sound_on" : "sound_off"} size={14} /> {soundEnabled ? 'Zvuk' : 'Zvuk'}</span>
                </button>
                <button
                  className="sound-toggle-btn"
                  style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                  onClick={toggleMusic}
                  title="Zapnout / vypnout vesnickou hudbu"
                >
                  <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon={musicEnabled ? "music_on" : "music_off"} size={14} /> {musicEnabled ? 'Hudba' : 'Hudba'}</span>
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '4px 0 16px 0' }}>
              <LadaCartouche variant="green" size="md">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="bow" size={16} /> KROK 2 ZE 2: VÝBĚR LOVCE</span>
              </LadaCartouche>
              <h1 style={{ fontSize: '2.4rem', margin: '8px 0 2px 0', color: '#C53026' }}>
                VYBERTE SI SVÉHO LOVCE
              </h1>
              <LadaBotanicalFlourish height={20} />
              <p style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '-2px', color: 'var(--wood-dark)' }}>
                Koho vyšlete do noci na výpravu do kraje: <strong>{currentLevel.name}</strong>?
              </p>
              <LadaFrieze repeatCount={16} height={18} />
            </div>

            {/* Character Selection Grid with animated canvas portraits */}
            <div className="char-select-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 215px), 1fr))', gap: '15px' }}>
              {/* Krajánek a Tulák */}
              {renderHunterSelectCard(krajanekProg, krajanekRef)}
              {renderHunterSelectCard(wandererProg, wandererRef)}

              {/* Pasáček (Progressive unlock) */}
              {renderHunterSelectCard(shepherdProg, shepherdRef)}

              {/* Bába kořenářka (Progressive unlock) */}
              {renderHunterSelectCard(korenarkaProg, korenarkaRef)}

              {/* Ponocný (Progressive unlock) */}
              {renderHunterSelectCard(watchmanProg, watchmanRef)}

              {/* Pobožný kostelník (Progressive unlock) */}
              {renderHunterSelectCard(sextonProg, sextonRef)}

              {/* Babička a Barunka (Progressive unlock) */}
              {renderHunterSelectCard(grannyProg, grannyRef)}
            </div>

            {/* Bottom Toolbar on Hunter Select Screen */}
            <div className="menu-hub-toolbar">
              <button
                className="lada-btn btn-small"
                style={{
                  background: 'var(--wood-dark)',
                  color: 'var(--parchment)',
                  fontWeight: 900,
                }}
                onClick={() => {
                  sound.coin();
                  setMenuScreen('stage');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="arrow_left" size={14} /> Zpět k výběru výpravy</span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                onClick={() => setGameState('tavern')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="village" size={18} /> Vesnice & Hospoda ({meta.krejcary} <KrejcarIcon size={16} />)
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="sword" size={16} /> Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
                </span>
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="book" size={16} /> Bestiář nočního venkova
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#1D4ED8', color: '#FFFFFF', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
                title="Detailní vysvětlení ovládání hry, cílů a rad pro přežití"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="gamepad" size={16} /> Ovládání hry
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--wood-dark)', color: 'var(--parchment)', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsSettingsDevOpen(true);
                }}
                title="Nastavení grafiky, audia, výkonu a vývojářské nástroje"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="gear" size={16} /> Nastavení a vývoj
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL (ODPOČINEK U MILNÍKU) */}
      {gameState === 'paused' && (
        <div id="pause-screen" className="overlay" style={{ background: 'rgba(20, 15, 10, 0.88)', zIndex: 40 }}>
          <div className="panel" style={{ maxWidth: '820px' }}>
            <h1><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><GameIcon icon="pause" size={24} /> HRA POZASTAVENA</span></h1>
            <LadaBotanicalFlourish height={20} />

            {/* Top Primary Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '12px 0 10px' }}>
              <button
                className="lada-btn"
                style={{ background: 'var(--leaf-green)', fontSize: '1.2rem', padding: '10px 32px' }}
                onClick={togglePause}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Pokračovat ve hře <GameIcon icon="sword" size={16} /></span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#1D4ED8', color: '#FFFFFF', padding: '10px 18px', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="gamepad" size={16} /> Ovládání hry</span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--wood-dark)', color: 'var(--parchment)', padding: '10px 18px', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsSettingsDevOpen(true);
                }}
                title="Nastavení grafiky, osvětlení, audia a zobrazení"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="gear" size={16} /> Nastavení výpravy</span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--blood-red)', padding: '10px 18px', color: '#FFFFFF' }}
                onClick={quitToTavernFromPause}
                title="Bezpečně ukončí výpravu a sečte všechny dosud získané krejcary a dušičky do hospody"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Ukončit výpravu <GameIcon icon="beer" size={16} /></span>
              </button>
            </div>

            {/* In-pause toggles */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '6px 0 16px' }}>
              <div className="hud-level-badge" style={{ padding: '6px 14px', fontSize: '0.95rem' }}>
                <span><GameIcon icon={GAME_LEVELS[runStats.levelId !== undefined ? runStats.levelId : selectedLevelId]?.icon} size={18} /></span>
                <span>{GAME_LEVELS[runStats.levelId !== undefined ? runStats.levelId : selectedLevelId]?.name}</span>
              </div>
              <div className="touch-toggle-btn" style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 240, maxWidth: '100%', padding: '8px 12px', textAlign: 'left' }}>
                <label htmlFor="mobile-accessibility-level" style={{ fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="mobile" size={16} /> Mobilní usnadnění: {mobileAccessibilityLevel}/10</label>
                <input id="mobile-accessibility-level" type="range" min={1} max={10} step={1} value={mobileAccessibilityLevel}
                  onChange={(event) => updateMobileAccessibilityLevel(Number(event.target.value))}
                  aria-label="Úroveň mobilního usnadnění" style={{ width: '100%', accentColor: '#4D7C0F' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', fontWeight: 700 }}>
                  <input type="checkbox" checked={mobileAccessibilityAllDevices} onChange={(event) => updateMobileAccessibilityAllDevices(event.target.checked)} />
                  Použít i na jiných zařízeních
                </label>
                <span style={{ fontSize: '0.72rem', lineHeight: 1.25, opacity: 0.85 }}>
                  {mobileAccessibilityEnabled
                    ? `Útok a pohyb nepřátel −${mobileAccessibilityLevel * 2} %, poškození −${mobileAccessibilityLevel * 3} %, magnet +${mobileAccessibilityLevel * 5} %, hitbox lovce −${mobileAccessibilityLevel * 5} %.`
                    : 'Účinky jsou vypnuté mimo dotyková zařízení.'}
                </span>
              </div>
              <button className="touch-toggle-btn" onClick={toggleTouch} title="Přepnout dotykový joystick">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="joystick" size={16} /> Joystick:</span> <span className="touch-toggle-text">{touchEnabled ? 'Zap' : 'Vyp'}</span>
              </button>
              <button className="sound-toggle-btn" onClick={toggleSound} title="Přepnout zvukové efekty">
                <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon={soundEnabled ? "sound_on" : "sound_off"} size={14} /> {soundEnabled ? 'Zvuk: Zap' : 'Zvuk: Vyp'}</span>
              </button>
              <button className="sound-toggle-btn" onClick={toggleMusic} title="Přepnout vesnickou hudbu">
                <span className="sound-btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon={musicEnabled ? "music_on" : "music_off"} size={14} /> {musicEnabled ? 'Hudba: Zap' : 'Hudba: Vyp'}</span>
              </button>
              <button
                className="touch-toggle-btn"
                onClick={() => {
                  sound.coin();
                  const nextPerf = (meta.performanceProfile || (meta.performanceMode ? 'performance' : 'balanced')) !== 'performance';
                  saveMeta({ ...meta, performanceMode: nextPerf, performanceProfile: nextPerf ? 'performance' : 'balanced' });
                  window.dispatchEvent(new Event('resize'));
                }}
                title="Plynulý režim: optimalizuje strop nepřátel a částic pro stálých 60 FPS"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="lightning" size={14} /> Výkon:</span> <span className="touch-toggle-text">{meta.performanceMode ? 'Plynulý (60 FPS)' : 'Plný'}</span>
              </button>
              <button
                className="touch-toggle-btn"
                onClick={() => {
                  sound.coin();
                  const nextShow = !meta.showPerfOverlay;
                  saveMeta({ ...meta, showPerfOverlay: nextShow });
                }}
                title="Zapnout / vypnout statistiky FPS a počtu nepřátel na obrazovce"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="chart" size={14} /> FPS:</span> <span className="touch-toggle-text">{meta.showPerfOverlay ? 'Zap' : 'Vyp'}</span>
              </button>
              <button
                className="touch-toggle-btn"
                onClick={() => {
                  sound.coin();
                  const nextShow = !meta.windupTelegraphCirclesEnabled;
                  saveMeta({ ...meta, windupTelegraphCirclesEnabled: nextShow });
                }}
                title="Zapnout / vypnout kruhy nápřahu kolem útočících nepřátel"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="target" size={14} /> Kruhy nápřahu:</span> <span className="touch-toggle-text">{meta.windupTelegraphCirclesEnabled ? 'Zap' : 'Vyp'}</span>
              </button>
              <button
                className="touch-toggle-btn"
                onClick={() => {
                  sound.coin();
                  setIsCombatTextModalOpen(true);
                }}
                title="Nastavit kategorie plovoucích textů v aréně"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><GameIcon icon="chat" size={14} /> Texty:</span> <span className="touch-toggle-text">
                  {getCombatTextPreset(meta.combatTextSettings || DEFAULT_COMBAT_TEXT_SETTINGS) === 'full'
                    ? 'Plné'
                    : getCombatTextPreset(meta.combatTextSettings || DEFAULT_COMBAT_TEXT_SETTINGS) === 'tactical'
                    ? 'Taktické'
                    : getCombatTextPreset(meta.combatTextSettings || DEFAULT_COMBAT_TEXT_SETTINGS) === 'performance'
                    ? 'Vypnuto'
                    : 'Vlastní'}
                </span>
              </button>
            </div>

            {/* Run summary stats card */}
            <div
              style={{
                background: 'var(--parchment)',
                color: '#111111',
                border: '3.5px solid var(--ink)',
                borderRadius: '12px',
                padding: '16px 20px',
                margin: '16px 0',
                textAlign: 'left',
                boxShadow: '4px 4px 0px var(--ink)',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <LadaCardCorners variant="default" showBottomCorners={true} />
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111111' }}>
                    Lovec: {HUNTER_UNLOCKS[engineRef.current.player?.type as CharacterType || 'wanderer']?.realName || 'Tulák'}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#451A03', marginTop: '2px' }}>
                    {HUNTER_UNLOCKS[engineRef.current.player?.type as CharacterType || 'wanderer']?.realTitle || 'Vesnický tulák'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111111', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <GameIcon icon={runStats.dayPhase.icon} size={20} /> {runStats.dayPhase.name}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#78350F' }}>
                    Čas přežití: {formatTimer(runStats.time)}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '2px dashed var(--ink)', margin: '10px 0', opacity: 0.3 }} />

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.95rem', fontWeight: 800, color: '#111111' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="lion" size={16} /> Kuráž: <strong>{Math.max(0, Math.ceil(engineRef.current.player?.hp || 0))}</strong> / {engineRef.current.player?.maxHp || 150}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="map" size={16} /> Výprava: <strong>{runStats.levelTitle}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><KrejcarIcon size={18} /> Krejcary: <strong>{runStats.coins}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="urn" size={16} /> Dušičky: <strong>{runStats.souls}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="wheat" size={16} /> Chasníci: <strong>{runStats.chasniks}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="bread" size={16} /> Zklidněno: <strong>{runStats.kills}</strong></span>
              </div>
            </div>

            {/* Current weapons inventory */}
            <h3 style={{ margin: '14px 0 8px 0', textAlign: 'left', color: 'var(--ink)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="sword" size={18} /> Nesený arzenál a výbava lovce:</span>
            </h3>

            <div className="pause-weapons-grid">
              {(engineRef.current.player?.weapons || []).map((w: any) => {
                const wDef = WEAPONS[w.id];
                if (!wDef) return null;
                const dmgMult = engineRef.current.player?.damageMultiplier || 1;
                const cooldownBonus = engineRef.current.player?.cooldownBonus ?? 0;
                const rankDef = getWeaponRankDef(w.id, w.level);
                const weaponCooldownBonus = getWeaponActiveCooldownBonus(w, rankDef);
                const stats = getRankedWeaponStats(w.id, w.level, w);
                const playerCooldownBonus = cooldownBonus > 0 ? cooldownBonus : Math.max(0, ((engineRef.current.player?.cooldownMultiplier || 1) - 1) / 0.9);
                const tulakMult = 1 + ((engineRef.current.player?.tulakDamageBonus || 0) / 100);
                const estDmg = Math.round(wDef.baseDmg * stats.damageMult * dmgMult * tulakMult);
                const effectiveCd = Math.max(wDef.baseCd * (1 - COOLDOWN_REDUCTION_CAP), getEffectiveWeaponCooldown(wDef.baseCd, playerCooldownBonus, weaponCooldownBonus) * stats.cooldownMult).toFixed(2);
                const isCane = w.id === 'cane';
                const hasSoaked = isCane && engineRef.current.player?.hasSoakedCane;
                const displayName = hasSoaked ? 'Mokrý prut' : wDef.name;
                const displayIcon = hasSoaked ? 'water' : wDef.icon;
                const isAtCap = weaponCooldownBonus >= COOLDOWN_REDUCTION_CAP - 0.001;

                return (
                  <div key={w.id} className="pause-weapon-card" style={{ position: 'relative' }}>
                    <LadaCardCorners variant="default" showBottomCorners={false} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#111111', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GameIcon icon={displayIcon} size={22} /> {displayName}
                      </span>
                      <span
                        style={{
                          background: 'var(--blood-red)',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                        }}
                      >
                        Úr. {w.level}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.86rem', fontWeight: 900, flexWrap: 'wrap' }}>
                      <span style={{ color: '#111111', display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="impact" size={14} /> Zásah: ~{estDmg}</span>
                      <span style={{ color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="clock" size={14} /> Nabíjení: {effectiveCd} s{stats.cooldownMult < 0.999 ? ` (+${Math.round((1 / stats.cooldownMult - 1) * 100)} %)` : ''}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.25, color: '#111111' }}>
                      {wDef.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Active passive perks / upgrades */}
            {(() => {
              const pl = engineRef.current.player;
              if (!pl) return null;
              const perks: { icon: string; name: string; desc: string; badge?: string }[] = [];
              if (pl.kavaCount > 0) {
                const cdBonusPct = (pl.cooldownBonus || 0) * 100;
                perks.push({
                  icon: 'opravdova_kava',
                  name: `Opravdová káva`,
                  desc: `+${cdBonusPct.toFixed(0)} % nabíjení (rychlost všech útoků)`,
                  badge: `${pl.kavaCount}×`,
                });
              }
              if (pl.jelitoCount > 0) {
                const dmgBonusPct = pl.jelitoCount * 15;
                perks.push({
                  icon: 'krvave_jelito',
                  name: `Krvavé jelito`,
                  desc: `Násobení poškození všech zbraní ×${(1.15 ** pl.jelitoCount).toFixed(2)}; každý stack je ×1,15`,
                  badge: `${pl.jelitoCount}×`,
                });
              }
              if ((pl.tulakDamageBonus || 0) > 0) {
                perks.push({
                  icon: 'bag',
                  name: `Tulácký instinkt`,
                  desc: `+${pl.tulakDamageBonus} % k poškození všech zbraní (+35 % síla úderu); násobí se se všemi damage multiplikátory`,
                  badge: `+${pl.tulakDamageBonus} %`,
                });
              }
              if (pl.kurazCount > 0) {
                perks.push({
                  icon: 'medvedi_mast',
                  name: `Medvědí mast`,
                  desc: `+${pl.kurazCount * 30} k maximální kuráži a okamžité zhojení`,
                  badge: `${pl.kurazCount}×`,
                });
              }
              if ((pl.bearMaskLevel || 0) > 0) {
                const healBonusPct = ((pl.bearMaskLevel || 1) - 1) * 20;
                const dmgPct = 50 * (1 + ((pl.bearMaskLevel || 1) - 1) * 0.2);
                perks.push({
                  icon: 'bear',
                  name: `Maska medvěda`,
                  desc: `Přeléčení se mění v ${dmgPct.toFixed(0)} % zranění do okruhu 230 px${healBonusPct > 0 ? `; +${healBonusPct} % léčení i zranění masky` : ''}`,
                  badge: `Úr. ${pl.bearMaskLevel}`,
                });
              }
              if (pl.regenLevel > 0) {
                perks.push({
                  icon: 'clover',
                  name: `Voňavé býlí (Bylinková zahrádka)`,
                  desc: `+${pl.regenLevel * 4} kuráže doplňováno každých 5 sekund`,
                  badge: `Úr. ${pl.regenLevel}`,
                });
              }
              if (pl.speedCount > 0) {
                perks.push({
                  icon: 'boots',
                  name: `Sedmimílové krpce`,
                  desc: `+${pl.speedCount * 20} k rychlosti pohybu při obcházení strašidel`,
                  badge: `${pl.speedCount}×`,
                });
              }
              if (pl.magnetCount > 0) {
                perks.push({
                  icon: 'lantern',
                  name: `Pytlácká petrolejka`,
                  desc: `+${pl.magnetCount * 30} k dosahu přitahování krejcarů a posilujících dobrot`,
                  badge: `${pl.magnetCount}×`,
                });
              }
              if (pl.hasSoakedCane) {
                perks.push({
                  icon: 'drop',
                  name: 'Mokrý prut',
                  desc: 'Údery osikového prutu zchladí a výrazně zpomalují zasažené bubáky',
                  badge: 'Aktivní',
                });
              }
              if ((pl.stickyPlumJamStacks || 0) > 0) {
                perks.push({
                  icon: 'honey',
                  name: 'Krajáč povidel',
                  desc: `-${Math.round((pl.plumPoiseReduction || 0.20) * 100)} % odolnost bubáků vůči odhození a po zahnání tvoří zpomalující louži (-${Math.round((pl.plumSlowRatio || 0.35) * 100)} % rychlost)`,
                  badge: `${pl.stickyPlumJamStacks}×`,
                });
              }
              if ((pl.goatBellStacks || 0) > 0) {
                perks.push({
                  icon: 'bell',
                  name: 'Kozí zvonek',
                  desc: `Každé ${(pl.goatBellInterval || 4.0).toFixed(1)} s běhu zazvoní: vyruší nápřah strašidel a přitáhne perníčky i krejcary v okruhu ${pl.goatBellRadius || 180} px`,
                  badge: `${pl.goatBellStacks}×`,
                });
              }
              if ((pl.itchySocksStacks || 0) > 0) {
                perks.push({
                  icon: 'socks',
                  name: 'Kousavé fusekle',
                  desc: `+${pl.itchySocksStacks * 15} rychlost, imunita na mráz/led a +${Math.round((pl.movingCooldownBonus || 0.12) * 100)} % nabíjení v pohybu`,
                  badge: `${pl.itchySocksStacks}×`,
                });
              }

              if (perks.length === 0) return null;

              return (
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ margin: '12px 0 8px 0', textAlign: 'left', color: 'var(--ink)', fontSize: '1.05rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="sparkles" size={18} /> Získaná vylepšení a posílení lovce:</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                    {perks.map((p, idx) => (
                      <div
                        key={idx}
                        className="pause-weapon-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          position: 'relative',
                        }}
                      >
                        <LadaCardCorners variant="default" showBottomCorners={false} />
                        <div style={{ flexShrink: 0 }}>
                          <GameIcon icon={p.icon} size={28} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, fontSize: '1.02rem', color: '#111111' }}>
                              {p.name}
                            </span>
                            {p.badge && (
                              <span
                                style={{
                                  background: 'var(--wood-dark)',
                                  color: '#FEF3C7',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 900,
                                  fontSize: '0.8rem',
                                  border: '1px solid var(--ink)',
                                }}
                              >
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', fontWeight: 700, color: '#333333', lineHeight: 1.2 }}>
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* DĚDEČEK ENCOUNTER */}
      {gameState === 'playing' && engineRef.current.grandfather.active && engineRef.current.player &&
        Math.hypot(engineRef.current.grandfather.x - engineRef.current.player.x, engineRef.current.grandfather.y - engineRef.current.player.y) < 220 && (
        <button
          onClick={() => {
            gamepadManager.consumeActionsAndLockBleed(engineRef.current.keys);
            openGrandfatherShop();
          }}
          style={{
            position: 'fixed', left: '50%', bottom: '17%', transform: 'translateX(-50%)',
            zIndex: 40, padding: '12px 24px', border: '3px solid var(--ink)', borderRadius: 12,
            background: '#FDECC8', color: '#5B2118', fontWeight: 1000, fontSize: '1.05rem',
            boxShadow: '4px 4px 0 rgba(0,0,0,.3)', cursor: 'pointer',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <GameIcon icon="basket" size={22} /> OTEVŘÍT DĚDEČKOVU NŮŠI ({gamepadUiState.activeDevice === 'gamepad' ? '[X] / [E]' : '[E] / [X]'})
          </span>
        </button>
      )}

      {gameState === 'grandfather' && (
        <GrandfatherShop
          gingerbread={engineRef.current.gingerbread}
          luck={engineRef.current.player?.luck ?? 100}
          waitSeconds={Math.max(0, engineRef.current.gameTime - engineRef.current.grandfather.waitStartedAt)}
          offers={engineRef.current.grandfather.offers}
          purchasedIds={grandfatherPurchaseIds}
          playerWeapons={engineRef.current.player?.weapons || []}
          purchasesThisEncounter={engineRef.current.grandfather.purchasesThisEncounter}
          totalPurchases={engineRef.current.grandfather.totalPurchases ?? grandfatherPurchaseIds.length}
          rerollCost={getGrandfatherRerollCost(engineRef.current.grandfather.rerollsThisEncounter || 0)}
          churchLevel={metaRef.current.churchLevel || 0}
          playerHp={engineRef.current.player?.hp ?? 0}
          playerMaxHp={engineRef.current.player?.maxHp ?? 0}
          onPurchase={purchaseGrandfatherItem}
          onRefreshOffers={refreshGrandfatherOffers}
          onClose={closeGrandfatherShop}
        />
      )}

      {gameState === 'milestone' && pendingMilestones.length > 0 && (
        <WeaponMilestoneModal
          pendingMilestone={pendingMilestones[0]}
          lang={(metaRef.current.currentLang as any) || 'cs'}
          onChoose={(weaponId, choiceId) => {
            const canonicalId = toCanonicalWeaponId(weaponId);
            const currentPending = pendingMilestones[0];
            if (currentPending) {
              const choice = getMilestoneChoice(canonicalId, currentPending.rank, choiceId);
              if (choice?.audioSfx) {
                const sfxCamel = choice.audioSfx.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                if (typeof (sound as any)[sfxCamel] === 'function') {
                  (sound as any)[sfxCamel]();
                } else if (typeof (sound as any)[choice.audioSfx] === 'function') {
                  (sound as any)[choice.audioSfx]();
                }
              }
            }
            if (gameEngineRef.current && typeof gameEngineRef.current.chooseWeaponMilestone === 'function') {
              try {
                gameEngineRef.current.chooseWeaponMilestone(canonicalId, choiceId);
              } catch (e) {
                console.warn('chooseWeaponMilestone warning', e);
              }
            } else if (engineRef.current && typeof (engineRef.current as any).chooseWeaponMilestone === 'function') {
              try {
                (engineRef.current as any).chooseWeaponMilestone(canonicalId, choiceId);
              } catch (e) {
                console.warn('chooseWeaponMilestone warning', e);
              }
            }
            const p = engineRef.current?.player;
            if (p && p.weapons) {
              const wp = p.weapons.find((w: any) => toCanonicalWeaponId(w.id) === canonicalId);
              if (wp) {
                if (!wp.milestones) wp.milestones = [];
                if (!wp.milestones.includes(choiceId)) {
                  wp.milestones.push(choiceId);
                }
                wp._cachedStats = getRankedWeaponStats(canonicalId, wp.level, wp);
              }
            }
            const remaining = pendingMilestonesRef.current.slice(1);
            pendingMilestonesRef.current = remaining;
            setPendingMilestones(remaining);
            if (remaining.length === 0) {
              const nextState = engineRef.current.levelVictoryTriggered && victoryTimeoutRef.current === null
                ? 'tally'
                : 'playing';
              gameStateRef.current = nextState;
              setGameState(nextState);
              engineRef.current.lastTime = performance.now();
            }
          }}
        />
      )}

      {/* Dědečkův obchod je finální runový upgrade loop; původní Level Up modal je odstraněn. */}

      {/* PAINTED CHEST SEQUENCE – LADOVSKÝ VENKOVSKÝ AUTOMAT / SLOT MACHINE */}
      {gameState === 'chest' && (
        <div id="chest-ui" className="overlay" style={{ background: 'rgba(10, 6, 3, 0.88)', backdropFilter: 'blur(3px)' }}>
          <div className="panel slot-machine-cabinet" style={{ textAlign: 'center' }}>
            {/* Ornate slot machine header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <GameIcon icon="chest" size={36} />
              <h1 style={{ color: '#FDE047', textShadow: '3px 3px 0 var(--ink)', margin: 0, fontSize: '2.2rem' }}>
                MALOVANÁ TRUHLA!
              </h1>
              <GameIcon icon="chest" size={36} />
            </div>
            <LadaBotanicalFlourish height={20} />

            <p style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FEF3C7', marginTop: '6px', marginBottom: '4px' }}>
              {slotSpinning
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="lightning" size={16} /> Válce venkovského automatu štěstěny se točí...</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="sparkles" size={16} /> Velkolepá kořist! Zde jsou vaše venkovské poklady:</span>}
            </p>

            {/* 3 Reel Housing */}
            <div
              className={`slot-reel-housing ${!slotSpinning && slotStoppedCount >= 3 ? 'slot-all-locked' : ''}`}
              onClick={() => {
                if (slotSpinningRef.current) {
                  skipSlotSpin();
                }
              }}
              style={{ cursor: slotSpinning ? 'pointer' : 'default' }}
              title={slotSpinning ? 'Klikněte pro přeskočení točení' : undefined}
            >
              {chestRewards.map((reward, i) => {
                const isLocked = i < slotStoppedCount;
                const reelSymbols = SLOT_REEL_STRIPS[i] || SLOT_REEL_STRIPS[0];
                return (
                  <div
                    key={i}
                    className={`slot-reel-card ${isLocked ? 'slot-locked' : 'slot-spinning'}`}
                  >
                    <LadaCardCorners variant={isLocked ? 'selected' : 'default'} showBottomCorners={true} />
                    {/* Header / Reel Label */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        letterSpacing: '1px',
                        color: isLocked ? '#78350F' : '#8A887D',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isLocked ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="sparkles" size={13} /> Válec {i + 1}</span> : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="dice" size={13} /> Válec {i + 1}</span>}
                    </div>

                    {/* Reel Window */}
                    <div className="slot-reel-window">
                      {!isLocked ? (
                        <div className={`slot-spinning-strip slot-reel-strip-${i}`}>
                          {reelSymbols.map((sym, sIdx) => (
                            <div key={sIdx} style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <GameIcon icon={sym} size={38} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'popIn 0.3s ease-out' }}>
                          <GameIcon icon={reward.icon} size={52} />
                        </div>
                      )}
                    </div>

                    {/* Reel Content / Title */}
                    <div style={{ minHeight: '62px', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '8px', width: '100%' }}>
                      {isLocked ? (
                        <>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#111111', lineHeight: '1.2' }}>
                            {reward.name}
                          </div>
                          {reward.desc && (
                            <div style={{ fontSize: '0.78rem', color: '#5E3A21', fontWeight: 800, marginTop: '3px' }}>
                              {reward.desc}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#78350F', fontStyle: 'italic', opacity: 0.85 }}>
                          Točí se...
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Badge */}
                    <div style={{ marginTop: '6px', width: '100%' }}>
                      {isLocked ? (
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#166534',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid #111111',
                          }}
                        >
                          ODHALENO
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            background: '#D97706',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1.5px solid #111111',
                          }}
                        >
                          V POHYBU...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {slotSpinning ? (
                <button
                  className="lada-btn"
                  style={{
                    padding: '12px 32px',
                    fontSize: '1.25rem',
                    background: 'var(--mustard)',
                    color: 'var(--ink)',
                  }}
                  onClick={() => {
                    gamepadManager.consumeActionsAndLockBleed(engineRef.current.keys);
                    skipSlotSpin();
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="dash" size={16} /> Přeskočit točení</span>{' '}
                  <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>{gamepadUiState.activeDevice === 'gamepad' ? '[A]' : '[Mezerník]'}</span>
                </button>
              ) : (
                <button
                  className="lada-btn"
                  style={{
                    padding: '14px 42px',
                    fontSize: '1.4rem',
                    background: 'var(--blood-red)',
                    color: '#FEF3C7',
                    animation: 'popIn 0.3s ease-out',
                  }}
                  onClick={() => {
                    gamepadManager.consumeActionsAndLockBleed(engineRef.current.keys);
                    closeChestSequence();
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><GameIcon icon="chest" size={20} /> Vyzvednout poklad</span>{' '}
                  <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{gamepadUiState.activeDevice === 'gamepad' ? '[A]' : '[Mezerník]'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TALLY SCREEN */}
      {gameState === 'tally' && (
        <div id="tally-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '780px', margin: 'auto' }}>
            <h1 className="tally-title" id="tally-title" style={{ animation: 'popIn 0.5s forwards', color: tallyCounters.isVictory ? '#D97706' : '#C53026', textShadow: '2px 2px 0 var(--ink)', margin: '4px 0' }}>
              {tallyCounters.isVictory ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><GameIcon icon="trophy" size={28} /> ÚROVEŇ POKOŘENA – VÍTĚZSTVÍ!</span> : 'KURÁŽ VYPRCHALA – ÚTĚK DO BEZPEČÍ!'}
            </h1>
            <LadaBotanicalFlourish height={22} />
            <p style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--wood-dark)', marginTop: '-4px', marginBottom: '16px' }}>
              {GAME_LEVELS[tallyCounters.levelId]?.name || 'Venkovská výprava'}
            </p>

            <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
              <span>Zklidněných bubáků:</span>
              <span className="tally-number">{tallyCounters.kills}</span>
            </div>
            <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
              <span>Získaných krejcarů:</span>
              <span className="tally-number" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {tallyCounters.coins} <KrejcarIcon size={22} />
              </span>
            </div>
            <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
              <span>Osvobozených dušiček:</span>
              <span className="tally-number">{tallyCounters.souls}</span>
            </div>
            {tallyCounters.chasniks > 0 && (
              <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
                <span>Zachráněných chasníků:</span>
                <span className="tally-number" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{tallyCounters.chasniks} <GameIcon icon="wheat" size={16} /></span>
              </div>
            )}
            <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
              <span>Čas výpravy:</span>
              <span className="tally-number">{formatTimer(tallyCounters.time)}</span>
            </div>


              {returnBonus && (
                <div className="return-bonus-card">
                  {!returnBonusExpired && returnBonusSeconds > 0 && !returnBonusClaimedRef.current ? (
                    <>
                      <div className="return-bonus-orb" aria-live="polite">
                        <span className="return-bonus-slogan">{returnBonus.multiplier >= 4 ? 'NEBUDE SE OPAKOVAT!' : returnBonus.multiplier >= 2 ? 'POJĎ NA TO!' : 'ŠTĚSTÍ PŘEJE ODVÁŽNÝM!'}</span>
                        <span className="return-bonus-emoji"><GameIcon icon={returnBonus.kind === 'damage' ? 'sword' : returnBonus.kind === 'courage' ? 'heart' : 'krejcar'} size={28} /></span>
                        <strong>+{returnBonus.percent * returnBonus.multiplier}%</strong>
                        <span>{returnBonus.kind === 'damage' ? 'POŠKOZENÍ' : returnBonus.kind === 'courage' ? 'KURÁŽ' : 'KREJCARŮ'}{returnBonus.multiplier > 1 ? ` · ${returnBonus.multiplier}×` : ''}</span>
                      </div>
                      <div className="return-bonus-countdown">Z PEKLA SMŮLA ZA <strong>{returnBonusSeconds}</strong> SEKUND!</div>
                      <button className="lada-btn return-to-field-btn" onClick={() => {
                        if (returnBonusClaimedRef.current || returnBonusExpired || Date.now() >= returnBonusDeadlineRef.current) { setReturnBonusExpired(true); return; }
                        returnBonusClaimedRef.current = true;
                        pendingReturnBonusRef.current = returnBonus;
                        sound.coin();
                        startGame(lastHunterTypeRef.current, tallyCounters.levelId);
                      }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="sword" size={16} /> Zpátky na plac</span></button>
                    </>
                  ) : <div className="return-bonus-expired"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="dash" size={16} /> Z PEKLA SMŮLA!! Bonus uletěl.</span></div>}
                </div>
              )}
            <div className="tally-actions-row" style={{ marginTop: '20px' }}>
              {tallyCounters.isVictory && tallyCounters.levelId < 7 && (
                <button
                  className="lada-btn"
                  style={{ fontSize: '1.25rem', padding: '12px 32px', background: 'var(--leaf-green)' }}
                  onClick={() => {
                    const nextId = (tallyCounters.levelId + 1) as GameLevelId;
                    saveMeta({
                      ...meta,
                      krejcary: meta.krejcary + tallyCounters.coins,
                      totalSoulsSaved: (meta.totalSoulsSaved || 0) + tallyCounters.souls,
                      totalChasnikSaved: (meta.totalChasnikSaved || 0) + tallyCounters.chasniks,
                      selectedLevel: nextId,
                    });
                    setSelectedLevelId(nextId);
                    setMenuScreen('hunter');
                    setGameState('menu');
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Vyrazit do další úrovně ({tallyCounters.levelId + 2}. úroveň) <GameIcon icon="dash" size={16} /></span>
                </button>
              )}

              <button
                className="lada-btn"
                style={{ fontSize: '1.25rem', padding: '12px 28px', background: 'var(--wood-dark)', color: 'var(--parchment)' }}
                onClick={() => {
                  sound.coin();
                  saveMeta({
                    ...meta,
                    krejcary: meta.krejcary + tallyCounters.coins,
                    totalSoulsSaved: (meta.totalSoulsSaved || 0) + tallyCounters.souls,
                    totalChasnikSaved: (meta.totalChasnikSaved || 0) + tallyCounters.chasniks,
                  });
                  setMenuScreen('stage');
                  setGameState('menu');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GameIcon icon="map" size={18} /> Zpět do nabídky výprav</span>
              </button>

              <button
                className="lada-btn"
                style={{ fontSize: '1.25rem', padding: '12px 32px' }}
                onClick={() => {
                  sound.coin();
                  saveMeta({
                    ...meta,
                    krejcary: meta.krejcary + tallyCounters.coins,
                    totalSoulsSaved: (meta.totalSoulsSaved || 0) + tallyCounters.souls,
                    totalChasnikSaved: (meta.totalChasnikSaved || 0) + tallyCounters.chasniks,
                  });
                  setGameState('tavern');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Vstoupit do hospody <GameIcon icon="beer" size={18} /></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAVERN & VILLAGE SCREEN */}
      {gameState === 'tavern' && (
        <div id="tavern-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '1000px' }}>
            <h1 style={{ color: '#C53026', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>HOSPODA U ČERNÉHO KOCOURA <GameIcon icon="beer" size={32} /></h1>
            <LadaBotanicalFlourish height={20} />
            <p style={{ fontWeight: 900, fontSize: '1.25rem', marginTop: '-4px', color: 'var(--wood-dark)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><GameIcon icon="music_on" size={18} /> V koutě vyhrávají pekelné dudy a voní čerstvý chléb... <GameIcon icon="music_on" size={18} /></span>
            </p>
            <LadaCoverScene height={150} />
            <LadaFrieze repeatCount={18} height={20} />

            <div className="modal-tabs" style={{ marginBottom: '14px' }}>
              <button
                className={`tab-btn ${activeTavernTab === 'crafts' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTavernTab('crafts');
                  sound.coin();
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="village" size={18} /> Naše vesnice Bubákov
                </span>
              </button>
              <button
                className={`tab-btn ${activeTavernTab === 'trophies' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTavernTab('trophies');
                  sound.coin();
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <GameIcon icon="trophy" size={18} /> Síň slávy a Syslovské výzvy
                </span>
              </button>
            </div>

            {activeTavernTab === 'crafts' ? (
              <VillageView
                meta={meta}
                onUpgrade={handleVillageUpgrade}
                onRefundAll={handleVillageRefund}
                onClose={() => {
                  setMenuScreen('stage');
                  setGameState('menu');
                }}
              />
            ) : (
              <div>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '5px 0 15px 0' }}>
                  Plňte výzvy rychtáře a pamětníků a získejte štědré odměny do své stálé pokladny!
                </p>
                <div className="trophies-grid">
                  {TROPHIES.map((t) => {
                    const claimed = !!meta.trophiesClaimed[t.id];
                    const isMet = t.isMet(meta);
                    const prog = t.getProgress(meta);

                    return (
                      <div key={t.id} className={`trophy-card ${claimed ? 'claimed' : isMet ? 'completed' : ''}`}>
                        <div>
                          <div className="trophy-header">
                            <h4 className="trophy-title">{t.title}</h4>
                            <span className="trophy-reward" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              +{t.reward} <KrejcarIcon size={16} />
                            </span>
                          </div>
                          <p className="trophy-desc">{t.desc}</p>
                        </div>
                        <div className="trophy-action-row">
                          <span className="trophy-progress-text">
                            Postup: {prog.cur} / {prog.max}
                          </span>
                          {claimed ? (
                            <span className="badge-claimed" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="checkmark" size={13} /> Splněno</span>
                          ) : isMet ? (
                            <button className="btn-claim-trophy" onClick={() => claimTrophy(t.id)}>
                              Vyzvednout (+{t.reward})
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: 4 }}><GameIcon icon="clock" size={13} /> Nesplněno</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="menu-hub-toolbar" style={{ marginTop: '20px' }}>
              <button
                className="lada-btn"
                style={{ padding: '10px 24px', background: 'var(--wood-dark)', color: 'var(--parchment)' }}
                onClick={() => {
                  sound.coin();
                  setMenuScreen('stage');
                  setGameState('menu');
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <GameIcon icon="map" size={16} /> Zpět do nabídky
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <GameIcon icon="sword" size={16} /> Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
                </span>
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <GameIcon icon="book" size={16} /> Bestiář nočního venkova
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#1D4ED8', color: '#FFFFFF', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
                title="Detailní vysvětlení ovládání hry, cílů a rad pro přežití"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <GameIcon icon="gamepad" size={16} /> Ovládání hry
                </span>
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--wood-dark)', color: 'var(--parchment)', fontWeight: 900 }}
                onClick={() => {
                  sound.coin();
                  setIsSettingsDevOpen(true);
                }}
                title="Nastavení grafiky, audia, výkonu a vývojářské nástroje"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <GameIcon icon="gear" size={16} /> Nastavení a vývoj
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APP MODALS (MODÁLNÍ ŠEV - ADR 0018) */}
      <AppModals
        meta={meta}
        saveMeta={saveMeta}
        isControlsOpen={isControlsOpen}
        onCloseControls={() => setIsControlsOpen(false)}
        isSettingsDevOpen={isSettingsDevOpen}
        onCloseSettingsDev={() => setIsSettingsDevOpen(false)}
        soundEffectsEnabled={soundEnabled}
        onToggleSoundEffects={toggleSound}
        musicEnabled={musicEnabled}
        onToggleMusic={toggleMusic}
        onOpenCombatTextSettings={() => setIsCombatTextModalOpen(true)}
        onOpenTestMode={() => setIsTestModeOpen(true)}
        onOpenAnimationTester={() => setIsAnimationTesterOpen(true)}
        onOpenPlan={() => setIsPlanOpen(true)}
        onOpenResetProgress={() => setIsResetModalOpen(true)}
        isCombatTextModalOpen={isCombatTextModalOpen}
        onCloseCombatTextModal={() => setIsCombatTextModalOpen(false)}
        isTestModeOpen={isTestModeOpen}
        onCloseTestMode={() => setIsTestModeOpen(false)}
        onStartTestRun={(hero, levelId, weapons, grandfatherUpgrades) => {
          startGame(hero, levelId as any, weapons, true, grandfatherUpgrades);
        }}
        selectedLevelId={selectedLevelId}
        onOpenGrandfatherShopTest={openGrandfatherShopTest}
        isAnimationTesterOpen={isAnimationTesterOpen}
        onCloseAnimationTester={() => setIsAnimationTesterOpen(false)}
        isResetModalOpen={isResetModalOpen}
        onCloseResetModal={() => setIsResetModalOpen(false)}
        onConfirmResetProgress={handleResetProgress}
        isBestiaryOpen={isBestiaryOpen}
        onCloseBestiary={() => setIsBestiaryOpen(false)}
        isPlanOpen={isPlanOpen}
        onClosePlan={() => setIsPlanOpen(false)}
        selectedHunterDetail={selectedHunterDetail}
        onCloseHunterDetail={() => setSelectedHunterDetail(null)}
        onStartIfHunterUnlocked={(id) => startGame(id)}
        selectedHunterInfo={selectedHunterInfo}
        onCloseHunterInfo={() => setSelectedHunterInfo(null)}
        selectedLevelDetail={selectedLevelDetail}
        onCloseLevelDetail={() => setSelectedLevelDetail(null)}
        onSelectLevelIfUnlocked={(id) => {
          setSelectedLevelId(id);
          saveMeta({ ...meta, selectedLevel: id });
          setSelectedLevelDetail(null);
          setMenuScreen('hunter');
        }}
        isArsenalOpen={isArsenalOpen}
        onCloseArsenal={() => setIsArsenalOpen(false)}
        selectedWeaponDetail={selectedWeaponDetail}
        onCloseWeaponDetail={() => setSelectedWeaponDetail(null)}
        onInspectWeapon={(prog) => setSelectedWeaponDetail(prog)}
        unlockNotice={unlockNotice}
        onDismissUnlockNotice={() => setUnlockNotice(null)}
      />

      {/* CORNER GAMEPAD & FULLSCREEN INDICATOR */}
      <div
        id="gamepad-corner-indicator"
        style={{
          position: 'fixed',
          bottom: 10,
          right: 12,
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          pointerEvents: 'auto',
        }}
      >
        {/* Connected Gamepad & Active Input Mode Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 8,
            background: gamepadUiState.connected ? 'rgba(254, 243, 199, 0.94)' : 'rgba(250, 246, 237, 0.84)',
            border: '2px solid #1C1610',
            boxShadow: '2px 2px 0 rgba(28, 22, 16, 0.65)',
            fontSize: '0.76rem',
            fontWeight: 900,
            color: '#2D1609',
          }}
          title={
            gamepadUiState.connected
              ? `Připojen gamepad: ${gamepadUiState.name} • Aktivní vstup: ${gamepadUiState.activeDevice === 'gamepad' ? 'Gamepad' : 'Klávesnice'}`
              : 'Ovládání klávesnicí (připojte USB/Bluetooth gamepad a stiskněte libovolné tlačítko)'
          }
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: gamepadUiState.connected ? '#16A34A' : '#9CA3AF',
              border: '1px solid #1C1610',
              display: 'inline-block',
            }}
          />
          <GameIcon icon="gamepad" size={15} />
          <span>
            {gamepadUiState.connected
              ? gamepadUiState.activeDevice === 'gamepad'
                ? 'Gamepad aktivní'
                : 'Gamepad (Klávesnice)'
              : 'Klávesnice'}
          </span>
        </div>

        {/* Fullscreen Toggle Button [F] */}
        <button
          onClick={toggleFullscreen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 9px',
            borderRadius: 8,
            background: isFullscreen ? '#FDE68A' : 'rgba(250, 246, 237, 0.9)',
            border: '2px solid #1C1610',
            boxShadow: '2px 2px 0 rgba(28, 22, 16, 0.65)',
            fontSize: '0.76rem',
            fontWeight: 900,
            color: '#2D1609',
            cursor: 'pointer',
          }}
          title="Přepnout celou obrazovku (Klávesa F)"
        >
          <span>{isFullscreen ? 'Okno' : 'Celá obrazovka'}</span>
          <span
            style={{
              background: 'rgba(0,0,0,0.14)',
              borderRadius: 4,
              padding: '0 4px',
              fontSize: '0.7rem',
            }}
          >
            [F]
          </span>
        </button>
      </div>
    </>
  );
}
