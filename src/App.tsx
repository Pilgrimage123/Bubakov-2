/**
 * ============================================================================
 * BUBÁKOV – ANIMOVANÁ LADOVSKÁ EDICE
 * ============================================================================
 * Production React/TypeScript game. The repository is the canonical editable
 * source; production deployments use the normal Vite build output.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createInitialEngineState, type EngineState } from './game/engineState';
import { SpatialHash } from './game/spatialHash';
import { distanceSq, isInView } from './game/perf';
import {
  CharacterType,
  Season,
  GameLevelId,
  MetaProgression,
  UpgradeChoice,
  DayPhase,
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
import { WEAPONS, createWeaponMasteryState } from './data/weapons';
import { getMilestoneChoice, getMilestoneChoices, getRankedWeaponStats, getWeaponRankDef, getEffectiveWeaponCooldown } from './data/weaponMilestones';
import { ENEMIES } from './data/enemies';
import {
  isUnholyEnemy,
  getEnemyHolyResistance,
  getHolyDamageMultiplier,
  getHolyPushMultiplier,
} from './data/holy';
import { TROPHIES } from './data/trophies';
import { Lada, drawEnemyRenderer } from './render/ladaRenderer';
import { BestiaryModal } from './components/BestiaryModal';
import { PlanModal } from './components/PlanModal';
import { ControlsModal } from './components/ControlsModal';
import { VillageView } from './components/VillageView';
import { TouchControls } from './components/TouchControls';
import { HunterUnlockModal } from './components/HunterUnlockModal';
import { getHunterProgress, HUNTER_UNLOCKS, HunterProgress, getActiveUnlockingHunter } from './data/hunterUnlocks';
import { ArsenalModal } from './components/ArsenalModal';
import { WeaponUnlockModal } from './components/WeaponUnlockModal';
import { getWeaponProgress, WEAPON_UNLOCKS, WeaponProgress, getActiveUnlockingWeapon } from './data/weaponUnlocks';
import { LevelUnlockModal } from './components/LevelUnlockModal';
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
import { TestModeModal } from './components/TestModeModal';
import { ResetProgressModal } from './components/ResetProgressModal';
import { BubakovCoverTitle } from './components/BubakovCoverTitle';
import { LadaFrieze } from './components/LadaFrieze';
import { LadaCartouche } from './components/LadaCartouche';
import { LadaCoverScene } from './components/LadaCoverScene';
import { LadaCardCorners } from './components/LadaCardCorners';
import { LadaBotanicalFlourish } from './components/LadaBotanicalFlourish';
import { LadaHudBotanicalDecor } from './components/LadaHudBotanicalDecor';

// Helper to render portrait canvases according to unlock tier (0 = 0-24%, 1 = 25-49%, 2 = 50-74%, 3 = 75-99%, 4 = 100%)
function renderHunterPortrait(
  canvas: HTMLCanvasElement | null,
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, t: number, dx: number, dy: number, flee: boolean, scale: number) => void,
  tier: number,
  t: number
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 180, 180);

  if (tier === 4) {
    // 100%: Normal, fully unlocked vivid animation
    drawFn(ctx, 90, 120, t, 0, 0, false, 1.4);
    return;
  }

  // Draw base figure first
  drawFn(ctx, 90, 120, t, 0, 0, false, 1.4);

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
    ctx.fillStyle = '#FEF3C7';
    ctx.font = '900 11px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ 75 % ODHALENO', 90, 159);
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
    ctx.fillStyle = '#FEF3C7';
    ctx.font = '900 11px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔎 50 % ODHALENO', 90, 159);
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
    ctx.fillStyle = '#F3E9D2';
    ctx.font = '900 11px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔍 25 % ODHALENO', 90, 159);
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
    ctx.fillStyle = '#D4CBBA';
    ctx.font = '900 11px Eczar, serif';
    ctx.fillText('🔒 ZAMČENO (0 %)', 90, 159);
    ctx.restore();
  }
}

/** Allocation-free cleanup for frequently mutated entity arrays. */
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
const HUD_SYNC_INTERVAL_SECONDS = 0.1;
const MAX_PARTICLES = 300;
const MAX_DAMAGE_TEXTS = 90;
const BOSS_HUD_SYNC_INTERVAL_SECONDS = 0.1;

// Floating damage / status text
class DamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  size: number;
  vy: number;

  constructor(x: number, y: number, text: string, color = COLORS.white, big = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.text = text;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;
  }

  update(dt: number) {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.font = `900 ${this.size}px Eczar`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineJoin = 'round';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// Nicely animated comic smoke puff in authentic Josef Lada fairy tale art style
class SmokePuff {
  x: number;
  y: number;
  radius: number;
  time: number;
  duration: number;
  dead: boolean;
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

  constructor(x: number, y: number, radius = 24) {
    this.x = x;
    this.y = y;
    this.radius = Math.max(22, radius);
    this.time = 0;
    this.duration = 1.25;
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

    // Mini poof dot clusters shooting outward
    this.poofDots = [];
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

    // Pastry sugar / bread crumb flakes from the delicious food
    this.crumbs = [];
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

    for (const dot of this.poofDots) {
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      dot.vx *= 0.92;
      dot.vy *= 0.94;
    }

    for (const crumb of this.crumbs) {
      crumb.x += crumb.vx * dt;
      crumb.y += crumb.vy * dt;
      crumb.vy += 80 * dt;
      crumb.vx *= 0.93;
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
    ctx.globalAlpha = alpha;

    // 1. Draw outer mini poof dots
    for (const dot of this.poofDots) {
      const dotAlpha = Math.max(0, 1 - progress * 1.6);
      if (dotAlpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = alpha * dotAlpha;
      ctx.fillStyle = '#FFFDF7';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r * (1 + progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw ground shadow of smoke cloud
    const shadowAlpha = alpha * Math.max(0, 0.4 - progress * 0.4);
    if (shadowAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = shadowAlpha;
      ctx.fillStyle = 'rgba(25, 20, 15, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, this.radius * 0.5, this.radius * 0.9 * scale, this.radius * 0.4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Shadow / depth under-layer of the main cloud (slightly offset downward)
    ctx.save();
    ctx.translate(0, 4);
    ctx.fillStyle = '#E8DEC8';
    ctx.beginPath();
    for (const lobe of this.lobes) {
      const lr = lobe.r * scale;
      ctx.moveTo(lobe.ox + lr, lobe.oy);
      ctx.arc(lobe.ox, lobe.oy, lr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    // 4. Main puffy cloud body with authentic Josef Lada ink border
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = Math.max(2.5, this.radius * 0.09);
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
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1.8, this.radius * 0.05);
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
      ctx.lineWidth = 2.2;
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

    // 7. Delicious pastry crumbs / sugar sparkles tumbling away
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

    ctx.restore();
  }
}

// Environmental decor item (tombstone, cross, tree, snowman, cottage)
class DecorItem {
  x: number;
  y: number;
  type: string;
  scale: number;
  flip: number;

  constructor(x: number, y: number, type: string, scale = 1, flip = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.scale = scale;
    this.flip = flip;
  }

  draw(ctx: CanvasRenderingContext2D, season: Season, theme?: string) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.flip * this.scale, this.scale);

    if (this.type === 'tree') {
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
      const bob = Math.sin(performance.now() / 300 + this.x) * 8;
      ctx.shadowColor = COLORS.water;
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(217, 160, 54, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -25 + bob, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.type === 'cottage') {
      Lada.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3.5);
      ctx.fillRect(-28, -25, 56, 35);
      ctx.strokeRect(-28, -25, 56, 35);
      Lada.setupPath(ctx, '#F8FAFC', COLORS.ink, 4);
      ctx.beginPath();
      ctx.moveTo(-36, -22);
      ctx.quadraticCurveTo(-15, -45, 0, -48);
      ctx.quadraticCurveTo(15, -45, 36, -22);
      ctx.closePath();
      ctx.fill();
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
  const pool = level.decorTypes.length ? level.decorTypes : ['tree'];
  const decor: DecorItem[] = [];

  const themeDensity: Record<GameLevelDef['theme'], number> = {
    autumn_village: 34,
    autumn_graveyard: 38,
    winter_frost: 30,
    mill_forge: 28,
    ruined_castle: 32,
    dragon_cave: 24,
  };

  const target = themeDensity[level.theme];
  const minDistance = 115;
  const coreRadius = 260;
  const innerRadius = 380;
  const outerRadius = 1320;

  // Keep landmarks away from the starting/combat area. We only reject
  // scenery against other scenery; enemies remain completely unaffected.
  const placed: Array<{ x: number; y: number; radius: number }> = [];

  const pickType = (index: number) => {
    // First few objects are intentionally thematic anchors. The remaining
    // objects use the level's existing decor pool.
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Character preview canvases
  const wandererRef = useRef<HTMLCanvasElement | null>(null);
  const shepherdRef = useRef<HTMLCanvasElement | null>(null);
  const korenarkaRef = useRef<HTMLCanvasElement | null>(null);
  const watchmanRef = useRef<HTMLCanvasElement | null>(null);
  const sextonRef = useRef<HTMLCanvasElement | null>(null);
  const grannyRef = useRef<HTMLCanvasElement | null>(null);

  // Meta progression in LocalStorage
  const [meta, setMeta] = useState<MetaProgression>(() => {
    try {
      const saved = localStorage.getItem('bubakov_meta');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          selectedLevel: parsed.selectedLevel || 1,
          highestLevelUnlocked: parsed.highestLevelUnlocked || (
            (parsed.bestiaryKills?.bezhlavy_rytir || 0) >= 1 ? 6 :
            (parsed.bestiaryKills?.mlynar || 0) >= 1 ? 5 :
            (parsed.bestiaryKills?.obr || 0) >= 1 ? 4 :
            (parsed.bestiaryKills?.hejkal || 0) >= 1 ? 3 :
            (parsed.bestiaryKills?.cert || 0) >= 1 ? 2 : 1
          ),
          completedLevels: parsed.completedLevels || {},
          unlockedWeapons: {
            ...(parsed.unlockedWeapons || {}),
            buns: true,
            cane: true,
            hromnicka: true,
          },
        };
      }
    } catch {}
    return {
      krejcary: 0,
      regenLevel: 0,
      ovenLevel: 0,
      scarecrowLevel: 0,
      millLevel: 0,
      wallLevel: 0,
      tavernShieldLevel: 0,
      forgeLevel: 0,
      churchLevel: 0,
      verminLevel: 0,
      waterLevel: 0,
      undeadLevel: 0,
      windLevel: 0,
      forestLevel: 0,
      totalSoulsSaved: 0,
      totalChasnikSaved: 0,
      season: 'autumn',
      trophiesClaimed: {},
      bestiaryKills: {},
      highestSurviveTime: 0,
      unlockedHunters: { wanderer: true, shepherd: false, korenarka: false, watchman: false, sexton: false, granny: false },
      unlockedWeapons: { buns: true, cane: true, hromnicka: true },
      hunterKillCounts: {},
      weaponKillCounts: {},
      selectedLevel: 1,
      highestLevelUnlocked: 1,
      completedLevels: {},
    };
  });

  const metaRef = useRef(meta);
  metaRef.current = meta;

  const saveMeta = (updated: MetaProgression) => {
    metaRef.current = updated;
    setMeta(updated);
    try {
      localStorage.setItem('bubakov_meta', JSON.stringify(updated));
    } catch {}
  };

  // Selected level state
  const [selectedLevelId, setSelectedLevelId] = useState<GameLevelId>(() => {
    const s = meta.selectedLevel;
    return (s && s >= 1 && s <= 6 ? s : 1) as GameLevelId;
  });

  const currentLevel = GAME_LEVELS[selectedLevelId] || GAME_LEVELS[1];
  const season: Season = currentLevel.season;

  // Hunter detail modal, arsenal modal & unlock toast
  const [selectedHunterDetail, setSelectedHunterDetail] = useState<HunterProgress | null>(null);
  const [selectedWeaponDetail, setSelectedWeaponDetail] = useState<WeaponProgress | null>(null);
  const [selectedLevelDetail, setSelectedLevelDetail] = useState<LevelProgress | null>(null);
  const [isArsenalOpen, setIsArsenalOpen] = useState(false);
  const [unlockNotice, setUnlockNotice] = useState<{ title: string; desc: string } | null>(null);

  // Progressive unlock calculations for all 4 hunters
  const wandererProg = getHunterProgress('wanderer', meta);
  const shepherdProg = getHunterProgress('shepherd', meta);
  const korenarkaProg = getHunterProgress('korenarka', meta);
  const watchmanProg = getHunterProgress('watchman', meta);
  const sextonProg = getHunterProgress('sexton', meta);
  const grannyProg = getHunterProgress('granny', meta);

  const levelProgress = Object.fromEntries(
    ([1, 2, 3, 4, 5, 6] as GameLevelId[]).map((id) => [id, getLevelProgress(id, meta)])
  ) as Record<GameLevelId, LevelProgress>;

  // Weapon unlock count
  const unlockedWeaponsCount = Object.keys(WEAPONS).filter(
    (k) => getWeaponProgress(k, meta).isUnlocked
  ).length;

  // Game UI state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'levelup' | 'chest' | 'fleeing' | 'tally' | 'tavern'>('menu');
  const [menuScreen, setMenuScreen] = useState<'stage' | 'hunter'>('stage');
  // The Canvas loop is intentionally mounted only once. Keep React UI state
  // in refs so the long-lived RAF callback never reads stale render values.
  const gameStateRef = useRef(gameState);
  const menuScreenRef = useRef(menuScreen);
  const selectedLevelIdRef = useRef(selectedLevelId);
  gameStateRef.current = gameState;
  menuScreenRef.current = menuScreen;
  selectedLevelIdRef.current = selectedLevelId;
  const [activeTavernTab, setActiveTavernTab] = useState<'crafts' | 'trophies'>('crafts');
  const [isBestiaryOpen, setIsBestiaryOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // Touch controls
  const [touchEnabled, setTouchEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const stored = localStorage.getItem('bubakov_touch_joystick');
    return stored === null ? isTouch || window.innerWidth <= 1024 : stored === 'true';
  });

  const touchMoveRef = useRef<{ x: number; y: number; active: boolean; intensity: number }>({
    x: 0,
    y: 0,
    active: false,
    intensity: 0,
  });

  // Run stats
  const [runStats, setRunStats] = useState({
    time: 0,
    level: 1,
    xp: 0,
    xpNeeded: 10,
    kills: 0,
    chestProgress: 0,
    coins: 0,
    souls: 0,
    chasniks: 0,
    hp: 150,
    maxHp: 150,
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

  // Level Up choices
  const [levelUpChoices, setLevelUpChoices] = useState<UpgradeChoice[]>([]);

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

  // Game engine refs (persistent through renders)
  const engineRef = useRef<EngineState>(createInitialEngineState());
  const enemySpatialHashRef = useRef(new SpatialHash<any>(180));
  const livingEnemiesRef = useRef<any[]>([]);

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
    const timeSurvived = engineRef.current.gameTime;
    const updatedHighest = Math.max(metaRef.current.highestSurviveTime || 0, timeSurvived);
    setTallyCounters({
      kills: engineRef.current.kills,
      coins: engineRef.current.coins,
      souls: engineRef.current.souls,
      chasniks: engineRef.current.chasniks,
      time: Math.floor(timeSurvived),
      isVictory: engineRef.current.levelVictoryTriggered,
      levelId: engineRef.current.activeLevelId || 1,
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
    const canUnlockNext = nextLvlId <= 6;
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
        : '🐓 SVÍTÁNÍ! PŘEŽILI JSTE NOC – VÍTĚZSTVÍ!',
    }));

    if (canUnlockNext && (curMeta.highestLevelUnlocked || 1) < nextLvlId) {
      setUnlockNotice({
        title: `🎉 ${GAME_LEVELS[lvlId].shortTitle.toUpperCase()} POKOŘENA!`,
        desc: `Odemčena nová úroveň: ${GAME_LEVELS[nextLvlId].name}! Nyní se v ní můžete utkat s novými monstry.`,
      });
      setTimeout(() => setUnlockNotice(null), 6000);
    } else if (lvlId >= 6) {
      setUnlockNotice({
        title: `👑 VŠECHNY ÚROVNĚ DOKONČENY!`,
        desc: `Čertův mlýn, bezhlavý rytíř i drak padli! Celý Bubákov oslavuje vaše legendární hrdinství!`,
      });
      setTimeout(() => setUnlockNotice(null), 6000);
    }

    // Remaining monsters flee
    engineRef.current.enemies.forEach((m) => {
      m.panicked = true;
      m.isDefeated = true;
    });

    // Schedule transition to triumphant victory tally
    setTimeout(() => {
      setTallyCounters({
        kills: engineRef.current.kills,
        coins: engineRef.current.coins,
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
      setGameState('tally');
    }, 3500);
  };

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
    setMusicEnabled(sound.musicEnabled);
    if (next) sound.coin();
  };

  const toggleMusic = () => {
    const next = sound.toggleMusic();
    setMusicEnabled(next);
    if (next) sound.coin();
  };

  // Play "Bubáci a hastrmani" polka in main menu & village tavern, smoothly stop during gameplay
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'tavern') {
      sound.playMenuMusic(true);
    } else {
      sound.stopMenuMusic(true);
    }
  }, [gameState]);

  const toggleTouch = () => {
    const next = !touchEnabled;
    setTouchEnabled(next);
    try {
      localStorage.setItem('bubakov_touch_joystick', next ? 'true' : 'false');
    } catch {}
    sound.coin();
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = true;
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

      if (gameState === 'chest') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
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
        togglePause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause, isControlsOpen]);

  // Start new run
  const startGame = (
    type: CharacterType,
    targetLevelId?: GameLevelId,
    customWeapons?: { id: string; level: number; mastery?: any }[],
    isTestMode = false
  ) => {
    const chosenLevelId = targetLevelId || selectedLevelId || 1;
    const chosenLevel = GAME_LEVELS[chosenLevelId] || GAME_LEVELS[1];

    if (!isTestMode) {
      const levelProg = getLevelProgress(chosenLevelId, metaRef.current);

      if (!levelProg.isUnlocked) {
        sound.hit();
        setSelectedLevelDetail(levelProg);
        if (levelProg.isQueued) {
          setUnlockNotice({
            title: `🔒 ${levelProg.spoiledName} je v pořadí!`,
            desc: `Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň (${levelProg.requiredLevelName}).`,
          });
        } else {
          setUnlockNotice({
            title: `🔒 ${levelProg.spoiledName} je uzamčena!`,
            desc: `Splněno ${levelProg.percent} % výzvy (${levelProg.curCount} / ${levelProg.maxCount} zahnáno).`,
          });
        }
        setTimeout(() => setUnlockNotice(null), 4500);
        return;
      }

      const hunterProg = getHunterProgress(type, metaRef.current);
      if (!hunterProg.isUnlocked) {
        sound.hit();
        setSelectedHunterDetail(hunterProg);
        if (hunterProg.isQueued) {
          setUnlockNotice({
            title: `🔒 ${hunterProg.spoiledName} je v pořadí!`,
            desc: `Tento lovec se začne odemykat teprve poté, co odemknete předchozího lovce (${hunterProg.requiredHunterName}).`,
          });
        } else {
          setUnlockNotice({
            title: `🔒 ${hunterProg.spoiledName} je uzamčen!`,
            desc: `Splněno ${hunterProg.percent} % výzvy (${hunterProg.curCount} / ${hunterProg.maxCount} zahnáno).`,
          });
        }
        setTimeout(() => setUnlockNotice(null), 4500);
        return;
      }
    }

    sound.init();
    sound.coin();

    const baseMaxHp =
      type === 'wanderer' ? 150 : type === 'shepherd' ? 110 : type === 'korenarka' ? 125 : type === 'sexton' ? 135 : type === 'granny' ? 130 : 140;
    const baseSpeed =
      type === 'wanderer' ? 165 : type === 'shepherd' ? 220 : type === 'korenarka' ? 180 : type === 'sexton' ? 170 : type === 'granny' ? 165 : 175;
    const basePickup =
      type === 'wanderer' ? 75 : type === 'shepherd' ? 160 : type === 'korenarka' ? 105 : type === 'sexton' ? 110 : type === 'granny' ? 125 : 115;

    const initialWeapons =
      customWeapons && customWeapons.filter((w) => w.level > 0).length > 0
        ? customWeapons.filter((w) => w.level > 0).map((w) => ({ ...w, cd: 0, mastery: w.mastery || createWeaponMasteryState() }))
        : type === 'wanderer'
        ? [{ id: 'buns', level: 1, cd: 0, mastery: createWeaponMasteryState() }, { id: 'cane', level: 1, cd: 0, mastery: createWeaponMasteryState() }]
        : type === 'shepherd'
        ? [{ id: 'buns', level: 1, cd: 0, mastery: createWeaponMasteryState() }]
        : type === 'korenarka'
        ? [{ id: 'herbs', level: 1, cd: 0, mastery: createWeaponMasteryState() }]
        : type === 'sexton'
        ? [{ id: 'holywater', level: 1, cd: 0, mastery: createWeaponMasteryState() }]
        : type === 'granny'
        ? [{ id: 'kolac', level: 1, cd: 0, mastery: createWeaponMasteryState() }]
        : [{ id: 'halberd', level: 1, cd: 0, mastery: createWeaponMasteryState() }];

    const wallBonusHp = (meta.wallLevel || 0) * 25;
    const millBonusSpeed = (meta.millLevel || 0) * 15;
    const scarecrowBonusPickup = (meta.scarecrowLevel || 0) * 25;
    const ovenDmgMult = 1 + (meta.ovenLevel || 0) * 0.1;
    const wallDmgRed = Math.min(0.5, (meta.wallLevel || 0) * 0.05);

    const player = {
      x: 0,
      y: 0,
      radius: 20,
      type,
      maxHp: baseMaxHp + wallBonusHp,
      hp: baseMaxHp + wallBonusHp,
      speed: baseSpeed + millBonusSpeed,
      pickupRadius: basePickup + scarecrowBonusPickup,
      weapons: initialWeapons,
      _firingWeapon: null as any,
      damageMultiplier: ovenDmgMult,
      tulakDamageBonus: type === 'wanderer' ? 30 : 0,
      cooldownMultiplier: 1,
      cooldownBonus: 0,
      kavaCount: 0,
      jelitoCount: 0,
      kurazCount: 0,
      speedCount: 0,
      magnetCount: 0,
      damageReduction: wallDmgRed,
      regenLevel: meta.regenLevel || 0,
      regenTimer: 0,
      invulnerabilityTimer: 0,
      dodgeCooldown: 0,
      tempShield: (meta.tavernShieldLevel || 0) > 0 ? 40 + ((meta.tavernShieldLevel || 0) * 20) : 0,
      herbTimer: 0,
      soulBuffTimer: 0,
      waterSoakedTimer: 0,
      slowTimer: 0,
      hasSoakedCane: false,
      hromnickaPulseTimer: 0,
      hromnickaPulseRadius: 0,
      ultCd: 0,
      ultMaxCd: type === 'wanderer' ? 21 : type === 'granny' ? 45 : type === 'sexton' ? 35 : 30,
      lastDx: 1,
      lastDy: 0,
      animTime: 0,
      valecniceAngle: 0,
      valecniceHitTimer: 0,
      garlicAuraTimer: 0,
      _valecnicePulse: false,
      _garlicPulse: false,

      // Take damage from mob contact or hazard attacks
      takeDamage(amount: number, type = 'physical') {
        if (gameStateRef.current !== 'playing' || this.hp <= 0) return;
        if (this.invulnerabilityTimer > 0) return;
        if ((meta.windLevel || 0) > 0 && this.dodgeCooldown <= 0) {
          this.dodgeCooldown = Math.max(10, 60 - ((meta.windLevel || 0) * 10));
          engineRef.current.texts.push(new DamageText(this.x, this.y - 35, 'DODGE!', COLORS.mustard, true));
          return;
        }
        const hurtDmg = Math.max(1, amount * (1 - this.damageReduction));
        let remainingDmg = hurtDmg;
        if (this.tempShield > 0) {
          const absorbed = Math.min(this.tempShield, remainingDmg);
          this.tempShield -= absorbed;
          remainingDmg -= absorbed;
        }
        if (remainingDmg > 0) this.hp = Math.max(0, this.hp - remainingDmg);
        sound.hit();
        engineRef.current.texts.push(
          new DamageText(this.x, this.y - 35, `-${Math.ceil(hurtDmg)}`, COLORS.red)
        );
        if (this.hp <= 0) {
          this.hp = 0;
          sound.hit();
          setGameState('fleeing');
          engineRef.current.fleeTimer = 3.0;
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
      },
      spawnAreaImpact(impact: any) {
        const nearby = enemySpatialHashRef.current.queryCircle(impact.x, impact.y, impact.radius + 60);
        for (let i = 0; i < nearby.length; i++) {
          const e = nearby[i];
          if (e.isDefeated) continue;
          const dx=e.x-impact.x, dy=e.y-impact.y, reach=impact.radius+e.radius;
          if (dx*dx+dy*dy <= reach*reach) {
            e.takeDamage(impact.dmg, impact.type, dx*4, dy*4);
            if (!impact.noMasteryProc && impact.weaponId) this.triggerWeaponMastery(impact.weaponId, e, 'hit');
          }
        }
        engineRef.current.texts.push(new DamageText(impact.x, impact.y - 20, 'BUM!', COLORS.mustard, true));
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

        if (this.type === 'watchman') {
          ctx.save();
          const grad = ctx.createRadialGradient(this.x, this.y, 8, this.x, this.y, 85);
          grad.addColorStop(0, 'rgba(255, 220, 120, 0.3)');
          grad.addColorStop(0.7, 'rgba(255, 180, 50, 0.12)');
          grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(this.x, this.y, 85, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const isFleeing = (engineRef.current?.fleeTimer ?? 0) > 0;
        if (this.type === 'wanderer') {
          Lada.drawWanderer(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'shepherd') {
          Lada.drawShepherd(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'korenarka') {
          Lada.drawKorenarka(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'watchman') {
          Lada.drawWatchman(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'sexton') {
          Lada.drawSexton(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else if (this.type === 'granny') {
          Lada.drawGranny(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        } else {
          Lada.drawWanderer(ctx, this.x, this.y, this.animTime, this.lastDx, this.lastDy, isFleeing, 1);
        }

        // Draw blessed candle in hand if Hromnička is equipped
        if (this.weapons && this.weapons.some((w: any) => w.id === 'hromnicka')) {
          const flip = this.lastDx >= 0 ? 1 : -1;
          Lada.drawBlessedCandle(ctx, this.x + flip * 15, this.y - 10, 1, this.animTime || 0);
        }
      },
    };

    // Seed a readable, combat-friendly composition instead of filling the
    // starting area with equally prominent decorative objects.
    const decor = seedArenaDecor(chosenLevel);

    // Start from the engine's canonical defaults, then apply only values that
    // are specific to the selected level/run. This keeps simulation defaults
    // in one place and prevents startGame() from drifting from engineState.ts.
    const engine = createInitialEngineState();
    engine.player = player;
    engine.decor = decor;
    engine.activeLevelId = chosenLevelId;
    engine.nextBossMechanicAt =
      chosenLevel.bossMechanic?.cadenceSeconds ?? Number.POSITIVE_INFINITY;
    engine.spawnTimer = chosenLevelId === 1 ? 3.5 : 2.0;

    const canvas = canvasRef.current;
    if (canvas) {
      engine.camera.x = player.x - canvas.width / 2;
      engine.camera.y = player.y - canvas.height / 2;
    }

    engineRef.current = engine;

    // Thematic opening wave right from second 0 tailored for smooth learning curve
    if (chosenLevelId === 1) {
      // Level 1: Mírný a vlídný začátek – jen 2 rarášci ve vzdálenosti na seznámení s pohybem a první zásah
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.3;
        engineRef.current.enemies.push(createEnemyInstance('rarach', player.x + Math.cos(ang) * 480, player.y + Math.sin(ang) * 480, 0.75));
      }
    } else if (chosenLevelId === 2) {
      // Level 2: Hřbitov – 2 kostlivci a černý pes
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2 + 0.5;
        engineRef.current.enemies.push(createEnemyInstance('skeleton', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 0.9));
      }
      engineRef.current.enemies.push(createEnemyInstance('cerny_pes', player.x + 480, player.y - 100, 0.9));
    } else if (chosenLevelId === 3) {
      // Level 3: Ladovská zima – rampouchoví diblíci
      for (let i = 0; i < 2; i++) {
        const ang = (i / 2) * Math.PI * 2;
        engineRef.current.enemies.push(createEnemyInstance('zmrzlik', player.x + Math.cos(ang) * 460, player.y + Math.sin(ang) * 460, 1.0));
      }
      engineRef.current.enemies.push(createEnemyInstance('vanicka', player.x - 440, player.y - 180, 1.0));
    } else if (chosenLevelId === 4) {
      // Level 4: Hamry – lapka a jiskřivec
      engineRef.current.enemies.push(createEnemyInstance('zbojnik', player.x + 460, player.y, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('jiskrivec', player.x - 460, player.y, 1.0));
    } else if (chosenLevelId === 5) {
      // Level 5: Hláska – zbrojnoš a bílá paní
      engineRef.current.enemies.push(createEnemyInstance('zbrojnos', player.x + 460, player.y + 100, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('bila_pani', player.x - 460, player.y - 100, 1.0));
    } else if (chosenLevelId === 6) {
      // Level 6: Dračí sluj – ledový sněhulák a noční můra
      engineRef.current.enemies.push(createEnemyInstance('snehulak', player.x + 460, player.y, 1.0));
      engineRef.current.enemies.push(createEnemyInstance('nocni_mura', player.x - 460, player.y, 1.0));
    }

    livingEnemiesRef.current = engineRef.current.enemies.slice();
    enemySpatialHashRef.current.rebuild(livingEnemiesRef.current);

    setRunStats({
      time: 0,
      level: 1,
      xp: 0,
      xpNeeded: 10,
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
      totalSoulsSaved: 0,
      totalChasnikSaved: 0,
      season: 'autumn',
      trophiesClaimed: {},
      bestiaryKills: {},
      villageStoryRead: {},
      highestSurviveTime: 0,
      unlockedHunters: { wanderer: true, shepherd: false, korenarka: false, watchman: false, sexton: false, granny: false },
      unlockedWeapons: { buns: true, cane: true, hromnicka: true },
      hunterKillCounts: {},
      weaponKillCounts: {},
      selectedLevel: 1,
      highestLevelUnlocked: 1,
      completedLevels: {},
      levelKillCounts: {},
    };
    saveMeta(defaultMeta);
    setSelectedLevelId(1);
    setMenuScreen('stage');
    sound.hit();
    setIsResetModalOpen(false);
    setUnlockNotice({
      title: '🧹 Postup byl úspěšně vymazán',
      desc: 'Veškerý postup, odemykatelní lovci, úrovně, zbraně i upgrady vesnice byly vráceny na nulu a uzamčeny.',
    });
    setTimeout(() => setUnlockNotice(null), 5000);
  };

  // Ultimate ability trigger
  const triggerUltimate = () => {
    const p = engineRef.current.player;
    if (!p || p.ultCd > 0 || gameStateRef.current !== 'playing') return;

    p.ultCd = p.ultMaxCd * (p.cooldownMultiplier || 1);
    sound.slash();

    if (p.type === 'wanderer') {
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
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'POVĚSTNÁ SUKOVICE! 🪵', '#F59E0B', true));

      const innerRadius = 260;
      const outerRadius = 600;

      for (const e of engineRef.current.enemies) {
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
            engineRef.current.texts.push(new DamageText(e.x, e.y - 40, 'PRÁSK! 🪵', '#FBBF24', false));

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
              engineRef.current.texts.push(new DamageText(e.x, e.y - 35, 'DĚS! 😱', '#A7F3D0', false));
            } else {
              engineRef.current.texts.push(new DamageText(e.x, e.y - 35, 'ODOLAL! 🛡️', '#E5E7EB', false));
            }
            // Zranění a odhození i ve větší vzdálenosti
            const outerDmg = 55 * p.damageMultiplier;
            e.takeDamage(outerDmg, 'physical', nx * 320, ny * 320);
          }

          // Efektní třísky a prach u zasažených bubáků
          for (let pi = 0; pi < 5; pi++) {
            engineRef.current.particles.push({
              x: e.x + (Math.random() - 0.5) * e.radius,
              y: e.y + (Math.random() - 0.5) * e.radius,
              vx: nx * 120 + (Math.random() - 0.5) * 60,
              vy: ny * 120 + (Math.random() - 0.5) * 60,
              life: 0.35 + Math.random() * 0.25,
              color: Math.random() < 0.5 ? '#8B5A2B' : '#D97706',
              size: 3 + Math.random() * 3,
            });
          }
        }
      }
    } else if (p.type === 'shepherd') {
      // Dusot stáda: pastýřská píšťalka a běsnění beranů (příběhová scénka se zastaveným časem)
      sound.shepherdFlock();
      engineRef.current.cutscene = { type: 'shepherd', t: 0, dur: 4.2, applyAt: 2.2, applied: false };
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'PASTÝŘSKÁ PÍŠŤALKA! 🐑', COLORS.mustard, true));
    } else if (p.type === 'korenarka') {
      // Očistné kadidlo z devatera bylin: klokotání kotlíku a hojivý dým (příběhová scénka se zastaveným časem)
      sound.herbalIncense();
      engineRef.current.cutscene = { type: 'korenarka', t: 0, dur: 4.4, applyAt: 2.3, applied: false };
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'OČISTNÉ KADIDLO! 🌿', COLORS.green, true));
    } else if (p.type === 'sexton') {
      // Farní požehnání: úder zvonu a sloup svatého světla očistí démony a nemrtvé
      sound.churchBell();
      engineRef.current.blessing = { x: p.x, y: p.y, t: 0, dur: 3.6 };
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'FARNÍ POŽEHNÁNÍ!', '#FDE047', true));
      for (const e of engineRef.current.enemies) {
        if (e.isDefeated || Math.hypot(e.x - p.x, e.y - p.y) > 650 + e.radius) continue;
        const unholy = isUnholyEnemy(e) || e.isBoss || e.category === 'bosses';
        const holyMult = getHolyDamageMultiplier(e);
        const holyPush = Math.max(0.1, 1 - getEnemyHolyResistance(e));
        if (!unholy) {
          e.takeDamage(45 * p.damageMultiplier * holyMult, 'holy', (e.x - p.x) * 3 * holyPush, (e.y - p.y) * 3 * holyPush);
        } else if (e.isBoss || e.category === 'bosses') {
          e.takeDamage(e.maxHp * 0.25 * Math.min(1.5, holyMult), 'holy', 0, 0);
          engineRef.current.texts.push(new DamageText(e.x, e.y - 50, 'SVATÁ ZKÁZA!', '#FDE047', true));
        } else {
          e.takeDamage((e.hp + 1) * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
        }
      }
    } else if (p.type === 'granny') {
      // Chléb se solí a vlídné slovo: čas se zastaví a přehraje se scénka, její účinek nastane v jejím vrcholu
      sound.timeStop();
      engineRef.current.cutscene = { type: 'granny', t: 0, dur: GRANNY_CUTSCENE.duration, applyAt: GRANNY_CUTSCENE.applyAt, applied: false };
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'ČAS SE ZASTAVIL…', '#FDE047', true));
    } else {
      // Night watchman horn & dog pack
      sound.horn();
      engineRef.current.texts.push(new DamageText(p.x, p.y - 60, 'TÚÚ-DÚÚ! POPLACH!', COLORS.mustard, true));
      for (const e of engineRef.current.enemies) {
        e.panicTimer = 5.0 * (1 - (e.willpower || 0) * 0.7);
        e.panicked = true;
        e.takeDamage(110 * p.damageMultiplier, 'physical', (e.x - p.x) * 4, (e.y - p.y) * 4);
      }
    }
  };

  // Účinek Pasáčkova dusotu stáda
  const applyShepherdStampede = () => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return;
    sound.heavyHit();
    eng.texts.push(new DamageText(p.x, p.y - 70, 'DUSOT STÁDA BERANŮ! 🐑', COLORS.mustard, true));

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
    for (const e of eng.enemies) {
      if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 560) {
        e.takeDamage(140 * p.damageMultiplier, 'physical', (p.lastDx || 1) * 380, (Math.random() - 0.5) * 260);
        e.poise = 0;
        eng.texts.push(new DamageText(e.x, e.y - 45, 'TRK! 💥', COLORS.mustard, false));
      }
    }
  };

  // Účinek Očistného kadidla báby Kořenářky
  const applyKorenarkaIncense = () => {
    const eng = engineRef.current;
    const p = eng.player;
    if (!p) return;
    p.hp = Math.min(p.maxHp, p.hp + 55);
    p.tempShield = (p.tempShield || 0) + 30;
    p.invulnerabilityTimer = Math.max(p.invulnerabilityTimer, 1.8);
    sound.potion();
    sound.victory();
    eng.texts.push(new DamageText(p.x, p.y - 70, '+55 HP! DEVATERO BYLIN & OČISTNÉ KADIDLO 🌿', '#86EFAC', true));

    // Vytvoření bylinného sanctuaria v herním světě
    eng.korenarkaSanctuary = {
      x: p.x,
      y: p.y,
      t: 0,
      dur: 4.8,
      pulseTimer: 0,
    };

    // Plošné zasažení přírodou, nasáknutí a zpomalení všech bubáků
    for (const e of eng.enemies) {
      if (!e.isDefeated && Math.hypot(e.x - p.x, e.y - p.y) <= 480) {
        e.takeDamage(120 * p.damageMultiplier, 'nature', (e.x - p.x) * 4.5, (e.y - p.y) * 4.5);
        e.soak();
        e.slowTimer = Math.max(e.slowTimer || 0, 4.5);
        eng.texts.push(new DamageText(e.x, e.y - 45, 'OČIŠTĚNO! 🌿', '#4ADE80', false));
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
    eng.texts.push(new DamageText(p.x, p.y - 70, 'CHLÉB SE SOLÍ A VLÍDNÉ SLOVO! ❤', '#FDE047', true));
    for (const e of eng.enemies) {
      if (e.isDefeated || Math.hypot(e.x - p.x, e.y - p.y) > 1100) continue;
      const bossLike = e.isBoss || e.category === 'bosses';

      // Zjištění resistu na Food a Holy
      const foodResist = typeof e.hunger === 'number' ? e.hunger : (e.foodResist || 0);
      const holyResist = getEnemyHolyResistance(e);

      // Bere se to, proti čemu má bubák MENŠÍ resist
      const chosenType: 'food' | 'holy' = foodResist <= holyResist ? 'food' : 'holy';

      if (chosenType === 'food') {
        // FOOD: chléb se solí bubáka nasytí
        if (!bossLike && Math.random() < 0.75) {
          // Běžný bubák je nasycen a odchází (pomalý krok, mlsání Ňam, ňam)
          e.takeDamage(e.hp + 1, 'food', 0, 0);
        } else {
          // Boss nebo přeživší začne mlsat chléb a uklidní se
          const addedSnack = 8.0 * Math.max(0.1, 1 - foodResist);
          e.snackTimer = (e.snackTimer || 0) + addedSnack;
          e.calmTimer = bossLike ? 10 : 8;
          if (bossLike) {
            e.takeDamage(e.maxHp * 0.25 * Math.max(0.1, 1 - foodResist), 'food', 0, 0);
          }
          eng.texts.push(new DamageText(e.x, e.y - 45, 'CHLÉB SE SOLÍ! 🍞', '#D97706', true));
          sound.snack();
        }
      } else {
        // HOLY: vlídné posvěcené slovo zasáhne zlé síly
        const holyMult = getHolyDamageMultiplier(e);
        const holyPush = Math.max(0.1, 1 - holyResist);
        if (!bossLike && Math.random() < 0.75) {
          e.takeDamage((e.hp + 1) * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
          eng.texts.push(new DamageText(e.x, e.y - 45, 'SVATÉ SLOVO! ✨', '#FDE047', true));
        } else {
          e.calmTimer = bossLike ? 10 : 8;
          if (bossLike) {
            e.takeDamage(e.maxHp * 0.25 * holyMult, 'holy', 0, 0);
            eng.texts.push(new DamageText(e.x, e.y - 50, 'SVATÁ ZKÁZA! ✨', '#FDE047', true));
          } else {
            e.takeDamage(45 * holyMult, 'holy', (e.x - p.x) * 2 * holyPush, (e.y - p.y) * 2 * holyPush);
            eng.texts.push(new DamageText(e.x, e.y - 45, 'POŽEHNÁNÍ ✨', '#FDE047', true));
          }
        }
      }
    }
  };

  // Open Level Up Choice Modal
  const openLevelUpModal = () => {
    const p = engineRef.current.player;
    if (!p) return;

    sound.levelUp();
    const churchLevel = metaRef.current.churchLevel || 0;
    if (churchLevel > 0) {
      engineRef.current.texts.push(new DamageText(p.x, p.y - 70, 'SVATÁ VLNA!', '#FDE047', true));
      for (const e of engineRef.current.enemies) {
        if (e.isDefeated) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 400 + e.radius) {
          const nx = dist > 0.001 ? dx / dist : 1;
          const ny = dist > 0.001 ? dy / dist : 0;
          e.takeDamage(100 * churchLevel, 'holy', nx * 520, ny * 520);
          e.panicked = true;
          e.panicTimer = Math.max(e.panicTimer || 0, 2.5);
        }
      }
    }
    setGameState('levelup');

    const choices: UpgradeChoice[] = [];
    const combatChoices: UpgradeChoice[] = [];
    const passiveChoices: UpgradeChoice[] = [];
    const availableWeaponKeys = Object.keys(WEAPONS);

    // New weapons - only offered if unlocked in meta progression!
    for (const key of availableWeaponKeys) {
      const wProg = getWeaponProgress(key, metaRef.current);
      if (wProg.isUnlocked && !p.weapons.find((w: any) => w.id === key)) {
        combatChoices.push({
          type: 'new_weapon',
          id: key,
          name: WEAPONS[key].name,
          desc: WEAPONS[key].desc,
          icon: WEAPONS[key].icon,
        });
      }
    }

    // Eight-rank progression: milestones 3/5/8, standard upgrades 2/4/6/7.
    for (const w of p.weapons) {
      if (w.level >= 8) continue;
      const nextLevel = w.level + 1;
      const milestoneChoices = getMilestoneChoices(w.id, nextLevel);
      if (milestoneChoices) {
        for (const option of milestoneChoices) {
          combatChoices.push({
            type: 'weapon_milestone',
            id: w.id,
            milestoneRank: nextLevel,
            milestoneChoiceId: option.id,
            name: WEAPONS[w.id].name + ': ' + option.name,
            desc: option.description,
            icon: WEAPONS[w.id].icon,
          });
        }
      } else {
        const rankDef = getWeaponRankDef(w.id, nextLevel);
        combatChoices.push({
          type: 'upgrade_weapon',
          id: w.id,
          name: WEAPONS[w.id].name + ' — Úroveň ' + nextLevel,
          desc: rankDef?.passiveBonusDescription || 'Postupné posílení zbraně.',
          icon: WEAPONS[w.id].icon,
        });
      }
    }

    // Passives
    passiveChoices.push({
      type: 'passive',
      stat: 'cooldown',
      name: 'Opravdová káva',
      desc: 'Horká černá káva z pražených zrn. Zkracuje dobu přípravy všech zbraní (-10 % cooldown / rychlejší útoky).',
      icon: 'opravdova_kava',
    });
    passiveChoices.push({
      type: 'passive',
      stat: 'damage',
      name: 'Krvavé jelito',
      desc: 'Zabijačkové jelito plné krup a síly. Trvale zvyšuje zranění všech útoků a zbraní lovce (+15 % k poškození).',
      icon: 'krvave_jelito',
    });
    passiveChoices.push({
      type: 'passive',
      stat: 'maxHp',
      name: 'Medvědí mast',
      desc: '+30 k maximální kuráži a odolnosti lovce proti vylekání a strachu.',
      icon: 'medvedi_mast',
    });
    passiveChoices.push({
      type: 'passive',
      stat: 'regen',
      name: 'Veselá mysl a písnička',
      desc: 'Písnička na rtech zažene splín a doplňuje +3 kuráže každých 5 sekund.',
      icon: '🎵',
    });
    passiveChoices.push({
      type: 'passive',
      stat: 'speed',
      name: 'Toulavé boty sedmimílové',
      desc: '+20 k rychlosti pohybu při obcházení strašidel.',
      icon: '👢',
    });
    passiveChoices.push({
      type: 'passive',
      stat: 'pickupRadius',
      name: 'Magnetický měšec na krejcary',
      desc: '+30 k dosahu přitahování krejcarů a posilujících dobrot.',
      icon: '🧲',
    });

    if (p.weapons.find((w: any) => w.id === 'cane') && !p.hasSoakedCane) {
      combatChoices.push({
        type: 'modifier',
        id: 'soaked_cane',
        name: 'Mokrý prut',
        desc: 'Osikový prut namočený ve studené rybniční vodě. Údery bubáky zchladí, zkrotí a výrazně je zpomalují.',
        icon: '💧',
      });
    }

    const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
    const pick = <T,>(items: T[]) => items.length ? items[Math.floor(Math.random() * items.length)] : undefined;
    const combat = pick(shuffle(combatChoices));
    const passive = pick(shuffle(passiveChoices));
    if (combat) choices.push(combat);
    if (passive) choices.push(passive);
    const selectedKeys = new Set(choices.map((c) => c.type + ':' + (c.id ?? c.stat ?? c.name)));
    const wildcardPool = [...combatChoices, ...passiveChoices].filter((c) => !selectedKeys.has(c.type + ':' + (c.id ?? c.stat ?? c.name)));
    const wildcard = pick(shuffle(wildcardPool));
    if (wildcard) choices.push(wildcard);
    setLevelUpChoices(shuffle(choices).slice(0, 3));
  };

  const selectUpgrade = (choice: UpgradeChoice) => {
    const p = engineRef.current.player;
    if (p) {
      if (choice.type === 'new_weapon' && choice.id) {
        p.weapons.push({ id: choice.id, level: 1, cd: 0, mastery: createWeaponMasteryState() });
      } else if (choice.type === 'upgrade_weapon' && choice.id) {
        const w = p.weapons.find((x: any) => x.id === choice.id);
        if (w) w.level++;
      } else if (choice.type === 'weapon_milestone' && choice.id && choice.milestoneRank && choice.milestoneChoiceId) {
        const w = p.weapons.find((x: any) => x.id === choice.id);
        if (w) {
          const rank = choice.milestoneRank;
          const selected = getMilestoneChoice(w.id, rank, choice.milestoneChoiceId);
          if (selected && (rank === 3 || rank === 5 || rank === 8)) {
            if (!w.milestones) w.milestones = {};
            if (!w.milestones[rank]) {
              w.milestones[rank] = selected.id;
              w.level = rank;
            }
          }
        }
      }      } else if (choice.type === 'passive' && choice.stat) {
        if (choice.stat === 'maxHp') {
          p.maxHp += 30;
          p.hp += 30;
          p.kurazCount = (p.kurazCount || 0) + 1;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, 'Medvědí mast! (+30 Max Kuráž)', '#F59E0B', true));
        } else if (choice.stat === 'cooldown') {
          p.kavaCount = (p.kavaCount || 0) + 1;
          p.cooldownBonus = (p.cooldownBonus || 0) + 0.1111111111;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, 'Opravdová káva! (+11,11 % cooldown bonus)', '#38BDF8', true));
        } else if (choice.stat === 'damage') {
          p.jelitoCount = (p.jelitoCount || 0) + 1;
          p.damageMultiplier = (p.damageMultiplier || 1) * 1.15;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, 'Krvavé jelito! (×1,15 Zranění)', '#DC2626', true));
        } else if (choice.stat === 'regen') {
          p.regenLevel = (p.regenLevel || 0) + 1;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, 'Veselá mysl! (+3 Kuráž/5s)', '#4ADE80', true));
        } else if (choice.stat === 'speed') {
          p.speed += 20;
          p.speedCount = (p.speedCount || 0) + 1;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, '+20 Rychlost!', '#60A5FA', true));
        } else if (choice.stat === 'pickupRadius') {
          p.pickupRadius += 30;
          p.magnetCount = (p.magnetCount || 0) + 1;
          engineRef.current.texts.push(new DamageText(p.x, p.y - 45, '+30 Dosah sběru!', '#FCD34D', true));
        }
      } else if (choice.type === 'modifier') {
        p.hasSoakedCane = true;
      }
    }
    sound.coin();
    setGameState('playing');
    engineRef.current.lastTime = performance.now();
  };

  // Skip slot machine spin
  const skipSlotSpin = useCallback(() => {
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }
    setSlotStoppedCount(3);
    setSlotSpinning(false);
    sound.slotStop();
    sound.slotJackpot();
  }, []);
  skipSlotSpinRef.current = skipSlotSpin;

  const closeChestSequence = useCallback(() => {
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
      slotSoundIntervalRef.current = null;
    }
    setSlotSpinning(false);
    setSlotStoppedCount(0);
    chestRewards.forEach((r) => r.action());
    sound.coin();
    setGameState('playing');
    engineRef.current.lastTime = performance.now();
  }, [chestRewards]);
  closeChestSequenceRef.current = closeChestSequence;

  // Open Painted Chest sequence with authentic slot machine effect
  const openChestSequence = () => {
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
          if (pl) pl.hp = Math.min(pl.maxHp, pl.hp + 40);
        },
      },
      {
        name: 'Kynutý koláč (+25 Max Kuráž)',
        desc: 'Posilující tradiční venkovská dobrota pro stálou dobrou náladu a odvahu',
        icon: 'kynuty_kolac',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.maxHp += 30;
            pl.hp += 30;
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
            pl.hp += 30;
            pl.kurazCount = (pl.kurazCount || 0) + 1;
          }
        },
      },
      {
        name: 'Opravdová káva (-10 % Cooldown)',
        desc: 'Čerstvě pražená horká černá káva zkrátí dobu přípravy všech zbraní',
        icon: 'opravdova_kava',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) {
            pl.kavaCount = (pl.kavaCount || 0) + 1;
            pl.cooldownBonus = (pl.cooldownBonus || 0) + 0.1111111111;
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
        icon: '👢',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) pl.speed += 25;
        },
      },
      {
        name: 'Zlatý dukát (+200 Krejcarů)',
        desc: 'Velkolepý poklad z kovářské truhly',
        icon: '💰',
        action: () => setRunStats((s) => ({ ...s, coins: s.coins + 200 })),
      },
      {
        name: 'Povidlová buchta (Svačina na cestu)',
        desc: 'Sladká svačina pro povzbuzení nálady a okamžité doplnění kuráže (+50)',
        icon: 'czech_buchta',
        action: () => {
          const pl = engineRef.current.player;
          if (pl) pl.hp = Math.min(pl.maxHp, pl.hp + 50);
        },
      },
    ];

    // If player has equipped weapons that can be upgraded, include upgrades in slot machine!
    if (p && p.weapons) {
      p.weapons.forEach((pw: any) => {
        const wDef = WEAPONS[pw.id];
        if (wDef && pw.level < 8) {
          possibleRewards.push({
            name: `${wDef.name} (Úroveň ${pw.level + 1})`,
            desc: `Vylepšení zbraně na úroveň ${pw.level + 1}`,
            icon: wDef.icon,
            action: () => {
              pw.level += 1;
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

    setChestRewards(selected);
    setSlotStoppedCount(0);
    setSlotSpinning(true);

    // Clear previous timers
    slotTimersRef.current.forEach(clearTimeout);
    slotTimersRef.current = [];
    if (slotSoundIntervalRef.current) {
      clearInterval(slotSoundIntervalRef.current);
    }

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
    engineRef.current.texts.push(new DamageText(x, y - 50, 'CHASNÍK KUBA ZACHRÁNĚN! +50 kr.', COLORS.mustard, true));
    setRunStats((s) => ({ ...s, coins: engineRef.current.coins, chasniks: engineRef.current.chasniks }));

    const p = engineRef.current.player;
    if (p) {
      p.hp = Math.min(p.maxHp, p.hp + 35);
      engineRef.current.texts.push(new DamageText(p.x, p.y - 30, '+35 HP (Od souseda)', COLORS.green, true));
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

  // Main canvas game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const showPerformanceOverlay = new URLSearchParams(window.location.search).has('perf');
    let smoothedFrameMs = 16.7;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = (now: number) => {
      // Prevent a background-tab stall from creating a large simulation burst.
      const dt = Math.min(0.05, Math.max(0, (now - engineRef.current.lastTime) / 1000));
      engineRef.current.lastTime = now;
    // HUD is React-owned; gameplay entities stay Canvas/engine-owned.
    // Boss HP is sampled here instead of calling setState from takeDamage().
    const engine = engineRef.current;
    const currentGameState = gameStateRef.current;
    const currentMenuScreen = menuScreenRef.current;
    const currentSelectedLevelId = selectedLevelIdRef.current;
    const shouldSyncBossHud =
      now - engine.lastStatsSync >= BOSS_HUD_SYNC_INTERVAL_SECONDS * 1000;
      engineRef.current.uiTime += dt;

      // Animate character portraits in hunter selection screen
      if (currentGameState === 'menu' && currentMenuScreen === 'hunter') {
        const t = engineRef.current.uiTime;
        const curMeta = metaRef.current;
        const wProg = getHunterProgress('wanderer', curMeta);
        const sProg = getHunterProgress('shepherd', curMeta);
        const kProg = getHunterProgress('korenarka', curMeta);
        const mProg = getHunterProgress('watchman', curMeta);
        const xProg = getHunterProgress('sexton', curMeta);
        const gProg = getHunterProgress('granny', curMeta);

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
            const newTime = engine.gameTime;
            const currentPhase = getCurrentDayPhase(newTime);

            const curLvl = GAME_LEVELS[engine.activeLevelId || currentSelectedLevelId] || GAME_LEVELS[1];

            // Check dawn victory
            if (newTime >= DAWN_TIME_SECONDS && !engine.dawnVictoryTriggered) {
              engine.dawnVictoryTriggered = true;
              sound.rooster();
              sound.victory();
              engine.texts.push(new DamageText(player.x, player.y - 70, 'KUROPĚNÍ! KOHOUT ZAKOKRHAL!', COLORS.mustard, true));
              // All monsters panic and flee
              engine.enemies.forEach((e) => {
                e.panicked = true;
                e.isDefeated = true;
              });
              triggerLevelVictory(engine.activeLevelId || 1, 'dawn');
            }

            // 1. Mini-boss encounter (polední přízrak podle plánu úrovně)
            if (!engine.miniBossSpawned && newTime >= curLvl.miniBoss.time) {
              engine.miniBossSpawned = true;
              const ang = Math.random() * Math.PI * 2;
              const miniBossEnemy = createEnemyInstance(
                curLvl.miniBoss.id,
                player.x + Math.cos(ang) * 550,
                player.y + Math.sin(ang) * 550,
                curLvl.miniBoss.multiplier,
                false,
                true,
                curLvl.miniBoss.name
              );
              engine.enemies.push(miniBossEnemy);
              engine.texts.push(new DamageText(player.x, player.y - 50, `👑 ${curLvl.miniBoss.name}`, COLORS.mustard, true));
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
              const midBossEnemy = createEnemyInstance(
                curLvl.midBoss.id,
                player.x + Math.cos(ang) * 560,
                player.y + Math.sin(ang) * 560,
                curLvl.midBoss.multiplier,
                false,
                true,
                curLvl.midBoss.name
              );
              engine.enemies.push(midBossEnemy);
              engine.texts.push(new DamageText(player.x, player.y - 50, `👑 ${curLvl.midBoss.name}`, COLORS.mustard, true));
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
              engine.enemies.push(
                createEnemyInstance(
                  curLvl.finalBoss.id,
                  player.x + Math.cos(ang) * 580,
                  player.y + Math.sin(ang) * 580,
                  curLvl.finalBoss.multiplier,
                  true
                )
              );
              sound.roar();
              setRunStats((s) => ({
                ...s,
                bossTitle: curLvl.finalBoss.name,
                bossHpPct: 100,
                warningBanner: curLvl.finalBoss.warning,
              }));
              setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
            }

            // PEKELNÝ ČERT BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 1)
            const cert = engine.enemies.find((e) => e.id === 'cert' && !e.isDefeated);
            if (cert && (cert.isBoss || engine.finalBossSpawned || curLvl.id === 1)) {
              if (cert) {
                const isPhase2 = cert.hp <= cert.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Čertovské rejdy)
                if (isPhase2 && !cert.enraged) {
                  cert.enraged = true;
                  cert.speed = 102;
                  sound.roar();
                  engine.texts.push(new DamageText(cert.x, cert.y - 70, '🔥 ČERTOVSKÉ REJDY!', COLORS.red, true));
                  setRunStats((s) => ({ ...s, warningBanner: '🔥 ČERTOVSKÉ REJDY! ČERT ZUŘÍ A DUPE KOPYTY!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Summon 2 mischievous rarášci
                  for (let i = 0; i < 2; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    engine.enemies.push(createEnemyInstance('rarach', cert.x + Math.cos(ang) * 90, cert.y + Math.sin(ang) * 90, 1.1));
                  }
                  // Brimstone smoke and fiery sparks burst
                  for (let i = 0; i < 26; i++) {
                    engine.particles.push({
                      x: cert.x,
                      y: cert.y,
                      vx: (Math.random() - 0.5) * 220,
                      vy: (Math.random() - 0.5) * 220,
                      life: 0.8,
                      color: i % 2 === 0 ? '#DC2626' : '#F59E0B',
                      size: 6,
                    });
                  }
                }

                // 1. Devil's Stomp (Pekelný dupák - ring of spinning hot embers)
                engine.certStompTimer -= dt;
                if (engine.certStompTimer <= 0) {
                  engine.certStompTimer = isPhase2 ? 7.5 : 11.0;
                  sound.thunder();
                  engine.texts.push(new DamageText(cert.x, cert.y - 45, 'PEKELNÝ DUPÁK! 💥', COLORS.red, true));
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
                    engine.particles.push({
                      x: cert.x,
                      y: cert.y,
                      vx: Math.cos(pAng) * 150,
                      vy: Math.sin(pAng) * 150,
                      life: 0.55,
                      color: '#F97316',
                      size: 5,
                    });
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
                    engine.texts.push(new DamageText(cert.x, cert.y - 55, 'DUSOT KOPYT! 🐂🔥', '#EF4444', true));
                    // Hoof scratch dust & brimstone sparks
                    for (let i = 0; i < 14; i++) {
                      engine.particles.push({
                        x: cert.x + (Math.random() - 0.5) * 20,
                        y: cert.y + cert.radius * 0.7,
                        vx: -Math.cos(chAng) * (60 + Math.random() * 80) + (Math.random() - 0.5) * 30,
                        vy: -Math.sin(chAng) * (60 + Math.random() * 80) + (Math.random() - 0.5) * 30,
                        life: 0.5,
                        color: i % 2 === 0 ? '#F97316' : '#DC2626',
                        size: 5,
                      });
                    }
                  } else if (cert.aiState !== 'charge' && cert.aiState !== 'windup') {
                    engine.certChargeTimer = 1.0;
                  }
                }
              }
            }

            // PŮLNOČNÍ HEJKAL BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 2)
            const hejkal = engine.enemies.find((e) => e.id === 'hejkal' && !e.isDefeated);
            if (hejkal && (hejkal.isBoss || engine.finalBossSpawned || curLvl.id === 2)) {
              if (hejkal) {
                const isPhase2 = hejkal.hp <= hejkal.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Probuzení hvozdu)
                if (isPhase2 && !hejkal.enraged) {
                  hejkal.enraged = true;
                  hejkal.speed = 88;
                  sound.roar();
                  engine.texts.push(new DamageText(hejkal.x, hejkal.y - 70, '🌲 PROBUZENÍ HVOZDU!', '#16A34A', true));
                  setRunStats((s) => ({ ...s, warningBanner: '🌲 PROBUZENÍ HVOZDU! HEJKAL PŘIVOLÁVÁ LESNÍ ŠELMY!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Summon a forest skodnik & cemetery hound
                  engine.enemies.push(createEnemyInstance('skodnik', hejkal.x + 80, hejkal.y, 1.1));
                  engine.enemies.push(createEnemyInstance('cerny_pes', hejkal.x - 80, hejkal.y, 1.1));
                  for (let i = 0; i < 30; i++) {
                    engine.particles.push({
                      x: hejkal.x,
                      y: hejkal.y,
                      vx: (Math.random() - 0.5) * 200,
                      vy: (Math.random() - 0.5) * 200,
                      life: 1.1,
                      color: i % 2 === 0 ? '#15803D' : '#D97706',
                      size: 6,
                    });
                  }
                }

                // 1. Sonic Timber Howl (Hromové zahejkání - acoustic gale & flying oak shards)
                engine.hejkalHowlTimer -= dt;
                if (engine.hejkalHowlTimer <= 0) {
                  engine.hejkalHowlTimer = isPhase2 ? 7.5 : 11.0;
                  sound.roar();
                  engine.texts.push(new DamageText(hejkal.x, hejkal.y - 50, 'HÉÉÉ-J! 🌲🔊', '#22C55E', true));
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
                  engine.texts.push(new DamageText(hejkal.x, hejkal.y - 40, 'DUBILKA! 🔨', '#A16207', true));
                  for (let i = 0; i < 16; i++) {
                    const ang = (i / 16) * Math.PI * 2;
                    engine.particles.push({
                      x: hejkal.x + Math.cos(ang) * 30,
                      y: hejkal.y + Math.sin(ang) * 30,
                      vx: Math.cos(ang) * 140,
                      vy: Math.sin(ang) * 140,
                      life: 0.45,
                      color: i % 2 === 0 ? '#15803D' : '#78350F',
                      size: 5,
                    });
                  }
                  if (dToP < 210) {
                    player.takeDamage(isPhase2 ? 32 : 24, 'physical');
                    const pushAng = Math.atan2(player.y - hejkal.y, player.x - hejkal.x);
                    player.x += Math.cos(pushAng) * 45;
                    player.y += Math.sin(pushAng) * 45;
                  }
                }
              }
            }

            // SKALNÍ OBR BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 3)
            const obr = engine.enemies.find((e) => e.id === 'obr' && !e.isDefeated);
            if (obr && (obr.isBoss || engine.finalBossSpawned || curLvl.id === 3)) {
              if (obr) {
                const isPhase2 = obr.hp <= obr.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Pukající žula)
                if (isPhase2 && !obr.enraged) {
                  obr.enraged = true;
                  obr.speed = 64;
                  sound.roar();
                  engine.texts.push(new DamageText(obr.x, obr.y - 70, '🗿 PUKAJÍCÍ ŽULA!', '#F59E0B', true));
                  setRunStats((s) => ({ ...s, warningBanner: '🗿 PUKAJÍCÍ ŽULA! SKÁLY SE HROUTÍ A ŽULA PUKÁ!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  for (let i = 0; i < 30; i++) {
                    engine.particles.push({
                      x: obr.x,
                      y: obr.y,
                      vx: (Math.random() - 0.5) * 190,
                      vy: (Math.random() - 0.5) * 190,
                      life: 0.9,
                      color: i % 2 === 0 ? '#71717A' : '#F59E0B',
                      size: 7,
                    });
                  }
                }

                // 1. Rolling river boulders (Valící se balvany)
                engine.obrBoulderTimer -= dt;
                if (engine.obrBoulderTimer <= 0) {
                  engine.obrBoulderTimer = isPhase2 ? 5.2 : 8.0;
                  sound.hit();
                  engine.texts.push(new DamageText(obr.x, obr.y - 45, 'VALÍCÍ SE BALVAN! 🪨', '#71717A', true));
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
                  engine.texts.push(new DamageText(obr.x, obr.y - 50, 'ZEMĚTŘESENÍ! ⚡', '#D97706', true));
                  const dist = Math.hypot(player.x - obr.x, player.y - obr.y);
                  if (dist < 260) {
                    player.takeDamage(isPhase2 ? 28 : 20, 'physical');
                    const qAng = Math.atan2(player.y - obr.y, player.x - obr.x);
                    player.x += Math.cos(qAng) * 55;
                    player.y += Math.sin(qAng) * 55;
                  }
                  for (let i = 0; i < 20; i++) {
                    const qAng = Math.random() * Math.PI * 2;
                    const qDist = Math.random() * 200;
                    engine.particles.push({
                      x: obr.x + Math.cos(qAng) * qDist,
                      y: obr.y + Math.sin(qAng) * qDist,
                      vx: 0,
                      vy: -30,
                      life: 0.5,
                      color: '#52525B',
                      size: 6,
                    });
                  }
                }
              }
            }

            // MLYNÁŘ BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 4)
            const mlynar = engine.enemies.find((e) => e.id === 'mlynar' && !e.isDefeated);
            if (mlynar && (mlynar.isBoss || engine.finalBossSpawned || curLvl.id === 4)) {
              if (mlynar) {
                const isPhase2 = mlynar.hp <= mlynar.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Pekelné mletí)
                if (isPhase2 && !mlynar.enraged) {
                  mlynar.enraged = true;
                  mlynar.speed = 82;
                  sound.roar();
                  engine.texts.push(new DamageText(mlynar.x, mlynar.y - 70, '🔥 PEKELNÉ MLETÍ!', COLORS.red, true));
                  setRunStats((s) => ({ ...s, warningBanner: '🔥 PEKELNÉ MLETÍ! ČERTŮV MLÝN SE ROZTÁČÍ!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  // Forge sparks burst
                  for (let i = 0; i < 2; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    engine.enemies.push(createEnemyInstance('jiskrivec', mlynar.x + Math.cos(ang) * 80, mlynar.y + Math.sin(ang) * 80, 0.9));
                  }
                  // Flour & spark explosion
                  for (let i = 0; i < 25; i++) {
                    engine.particles.push({
                      x: mlynar.x,
                      y: mlynar.y,
                      vx: (Math.random() - 0.5) * 200,
                      vy: (Math.random() - 0.5) * 200,
                      life: 0.8,
                      color: i % 2 === 0 ? '#FFFFFF' : '#F97316',
                      size: 6,
                    });
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
                  engine.texts.push(new DamageText(mlynar.x, mlynar.y - 40, 'MLÝNSKÝ KÁMEN! ⚙️', COLORS.grey, true));
                }

                // Sluice Gate Flood Waves (Povodňová vlna ze stavidel)
                engine.mlynarWaveTimer -= dt;
                if (engine.mlynarWaveTimer <= 0) {
                  engine.mlynarWaveTimer = isPhase2 ? 8.5 : 12.5;
                  sound.splash();
                  setRunStats((s) => ({ ...s, warningBanner: '🌊 STAVIDLA OTEVŘENA – POVODŇOVÁ VLNA!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2500);
                  engine.texts.push(new DamageText(mlynar.x, mlynar.y - 50, 'POVODEŇ ZE STAVIDEL! 🌊', '#38BDF8', true));

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
                  engine.texts.push(new DamageText(mlynar.x, mlynar.y - 60, 'MOUČNÝ MRAK!', '#F5F5F4', true));
                  // Shove player gently from blast
                  const fAng = Math.atan2(player.y - mlynar.y, player.x - mlynar.x);
                  player.x += Math.cos(fAng) * 45;
                  player.y += Math.sin(fAng) * 45;
                  // Flour particles
                  for (let i = 0; i < 35; i++) {
                    const pAng = Math.random() * Math.PI * 2;
                    const pDist = Math.random() * 120;
                    engine.particles.push({
                      x: mlynar.x + Math.cos(pAng) * pDist,
                      y: mlynar.y + Math.sin(pAng) * pDist,
                      vx: (Math.random() - 0.5) * 160,
                      vy: (Math.random() - 0.5) * 160,
                      life: 1.5,
                      color: 'rgba(255, 255, 255, 0.9)',
                      size: 8,
                    });
                  }
                  // Spawn one jiskrivec
                  engine.enemies.push(createEnemyInstance('jiskrivec', mlynar.x + (Math.random() - 0.5) * 120, mlynar.y + (Math.random() - 0.5) * 120, 0.8));
                }
              }
            }

            // BEZHLAVÝ RYTÍŘ BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 5)
            const rytir = engine.enemies.find((e) => e.id === 'bezhlavy_rytir' && !e.isDefeated);
            if (rytir && (rytir.isBoss || engine.finalBossSpawned || curLvl.id === 5)) {
              if (rytir) {
                const isPhase2 = rytir.hp <= rytir.maxHp * 0.5;

                // Enrage trigger when dropping to 50% HP (Prokletí hlásky)
                if (isPhase2 && !rytir.enraged) {
                  rytir.enraged = true;
                  rytir.speed = 98;
                  sound.roar();
                  engine.texts.push(new DamageText(rytir.x, rytir.y - 70, '🗡️ PROKLETÍ HLÁSKY!', '#94A3B8', true));
                  setRunStats((s) => ({ ...s, warningBanner: '🗡️ PROKLETÍ HLÁSKY! BEZHLAVÝ RYTÍŘ CVÁLÁ PO BOJIŠTI!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 3500);
                  engine.enemies.push(createEnemyInstance('zbrojnos', rytir.x + 90, rytir.y, 1.1));
                  engine.enemies.push(createEnemyInstance('bila_pani', rytir.x - 90, rytir.y, 1.1));
                  for (let i = 0; i < 28; i++) {
                    engine.particles.push({
                      x: rytir.x,
                      y: rytir.y,
                      vx: (Math.random() - 0.5) * 210,
                      vy: (Math.random() - 0.5) * 210,
                      life: 0.9,
                      color: i % 2 === 0 ? '#64748B' : '#38BDF8',
                      size: 6,
                    });
                  }
                }

                // 1. Odražená hlava (Rebounded boomerang skull projectile)
                engine.rytirHeadTimer -= dt;
                if (engine.rytirHeadTimer <= 0) {
                  engine.rytirHeadTimer = isPhase2 ? 5.5 : 8.5;
                  sound.roar();
                  engine.texts.push(new DamageText(rytir.x, rytir.y - 45, 'ODRAŽENÁ HLAVA! 💀', '#94A3B8', true));
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
                    engine.texts.push(new DamageText(rytir.x, rytir.y - 50, 'VÝPAD ČEPELÍ! ⚔️', COLORS.red, true));
                  }
                }
              }
            }

            // TŘÍHLAVÝ DRAK BOSS DYNAMIC SPECIAL MECHANICS (LEVEL 6)
            const drak = engine.enemies.find((e) => e.id === 'drak' && !e.isDefeated);
            if (drak && (drak.isBoss || engine.finalBossSpawned || curLvl.id === 6)) {
              if (drak) {
                const isPhase2 = drak.hp <= drak.maxHp * 0.5;
                const distToP = Math.hypot(player.x - drak.x, player.y - drak.y);

                // Enrage trigger when dropping to 50% HP (Probuzení všech tří hlav!)
                if (isPhase2 && !drak.enraged) {
                  drak.enraged = true;
                  drak.speed = 68;
                  sound.roar();
                  sound.churchBell();
                  engine.texts.push(new DamageText(drak.x, drak.y - 85, '🐉 PROBUZENÍ VŠECH TŘÍ HLAV!', '#DC2626', true));
                  setRunStats((s) => ({ ...s, warningBanner: '🐉 VŠECHNY TŘI HLAVY PROBUZENY! OHEŇ, MRÁZ A VICHR KŘÍDEL!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4000);
                  engine.enemies.push(createEnemyInstance('snehulak', drak.x + 110, drak.y, 1.15));
                  engine.enemies.push(createEnemyInstance('nocni_mura', drak.x - 110, drak.y, 1.15));
                  for (let i = 0; i < 45; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    const spd = 60 + Math.random() * 220;
                    engine.particles.push({
                      x: drak.x,
                      y: drak.y,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      life: 1.2,
                      color: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#38BDF8' : '#FEF08A',
                      size: 8,
                    });
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
                  engine.texts.push(new DamageText(fireHeadX, fireHeadY - 30, 'DRAČÍ PLAMEN! 🔥', '#DC2626', true));
                  const bAng = Math.atan2(player.y - fireHeadY, player.x - fireHeadX);
                  const flameCount = isPhase2 ? 8 : 6;
                  const spread = isPhase2 ? 0.8 : 0.6;

                  // Fire muzzle flash sparks directly at Head 3 snout
                  for (let i = 0; i < 15; i++) {
                    const ang = bAng + (Math.random() - 0.5) * 0.9;
                    const spd = 120 + Math.random() * 180;
                    engine.particles.push({
                      x: fireHeadX,
                      y: fireHeadY,
                      vx: Math.cos(ang) * spd,
                      vy: Math.sin(ang) * spd,
                      life: 0.45,
                      color: i % 3 === 0 ? '#FEF08A' : i % 3 === 1 ? '#F97316' : '#DC2626',
                      size: 6,
                    });
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
                  engine.texts.push(new DamageText(crownHeadX, crownHeadY - 45, 'MRAZIVÝ ŘEV DO STROPU! 🧊🔊', '#38BDF8', true));
                  setRunStats((s) => ({ ...s, warningBanner: '🧊 POZOR NA PADAJÍCÍ RAMPOUCHY ZE STROPU SLUJE!' }));
                  setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 2500);

                  // Vertical sonic & frost beam shooting straight from center crown head up into cave ceiling
                  for (let i = 0; i < 20; i++) {
                    const beamY = crownHeadY - i * 16;
                    engine.particles.push({
                      x: crownHeadX + (Math.random() - 0.5) * 20,
                      y: beamY,
                      vx: (Math.random() - 0.5) * 40,
                      vy: -150 - Math.random() * 120,
                      life: 0.6,
                      color: i % 2 === 0 ? '#38BDF8' : '#BAE6FD',
                      size: 6,
                    });
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
                  engine.texts.push(new DamageText(drak.x, drak.y - 45, 'ŠVIH TRNITÝM OCASEM! 🐉💥', '#D97706', true));
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
                    player.takeDamage(isPhase2 ? 32 : 24, 'physical');
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
                    engine.texts.push(new DamageText(frostHeadX, frostHeadY - 35, 'CHRRR... Zzz 💤', '#FEF08A', false));
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
                    engine.texts.push(new DamageText(frostHeadX, frostHeadY - 35, 'MRAZIVÝ DECH! ❄️', '#38BDF8', true));
                    const fAng = Math.atan2(player.y - frostHeadY, player.x - frostHeadX);

                    // Ice frost particles right at Head 1 snout
                    for (let i = 0; i < 14; i++) {
                      const ang = fAng + (Math.random() - 0.5) * 0.8;
                      const spd = 100 + Math.random() * 160;
                      engine.particles.push({
                        x: frostHeadX,
                        y: frostHeadY,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        life: 0.45,
                        color: i % 2 === 0 ? '#38BDF8' : '#BAE6FD',
                        size: 5,
                      });
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
                    engine.texts.push(new DamageText(drak.x, drak.y - 65, 'VICHR DRAČÍCH KŘÍDEL! 💨', '#67E8F9', true));
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
                    engine.texts.push(new DamageText(drak.x, drak.y - 80, 'DRAČÍ ZADUPÁNÍ! 💥🏔️', '#DC2626', true));
                    const jumpAng = Math.atan2(player.y - drak.y, player.x - drak.x);
                    drak.x += Math.cos(jumpAng) * 90;
                    drak.y += Math.sin(jumpAng) * 90;
                    for (let i = 0; i < 24; i++) {
                      const ang = (i / 24) * Math.PI * 2;
                      engine.particles.push({
                        x: drak.x + Math.cos(ang) * 40,
                        y: drak.y + Math.sin(ang) * 40,
                        vx: Math.cos(ang) * 160,
                        vy: Math.sin(ang) * 160,
                        life: 0.6,
                        color: i % 2 === 0 ? '#DC2626' : '#E2E8F0',
                        size: 6,
                      });
                    }
                    if (Math.hypot(player.x - drak.x, player.y - drak.y) < 190) {
                      player.takeDamage(35, 'physical');
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
              const cx = player.x + Math.cos(ang) * 480;
              const cy = player.y + Math.sin(ang) * 480;
              engine.drops.push({
                type: 'chasnik',
                x: cx,
                y: cy,
                radius: 26,
                time: 0,
                rescued: false,
              });
              // Spawn wave of rarachs harassing him
              for (let i = 0; i < 5; i++) {
                engine.enemies.push(createEnemyInstance('rarach', cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60, 1));
              }
              engine.texts.push(new DamageText(player.x, player.y - 50, 'CHASNÍK V NOUZI!', COLORS.mustard, true));
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
                const blastNearby = enemySpatialHashRef.current.queryCircle(strikeX, strikeY, 260);
                for (let i = 0; i < blastNearby.length; i++) {
                  const e = blastNearby[i];
                  if (!e.isDefeated && Math.hypot(e.x - strikeX, e.y - strikeY) < 220) {
                    const holyMult = getHolyDamageMultiplier(e);
                    const holyPush = Math.max(0.1, 1 - getEnemyHolyResistance(e));
                    e.takeDamage(80 * player.damageMultiplier * holyMult, 'holy', (e.x - strikeX) * 3 * holyPush, (e.y - strikeY) * 3 * holyPush);
                  }
                }

                engine.texts.push(new DamageText(strikeX, strikeY - 45, '⚡ BLESK SV. ELIÁŠE!', COLORS.mustard, true));

                if (!metaRef.current.lightningWitnessed) {
                  const updatedMeta = { ...metaRef.current, lightningWitnessed: true };
                  saveMeta(updatedMeta);
                }
              }
            }

            // Controlled, time-based enemy spawning with gradual progression both within level and across levels
            engine.spawnTimer -= dt;
            const curLvlId = (engine.activeLevelId || currentSelectedLevelId || 1) as GameLevelId;
            const timeProgress = Math.min(1, newTime / 260); // 0 at start -> 1 at 4:20

            // 1. Max enemy caps scaled by level and elapsed time
            // In Performance Mode, caps are streamlined by ~40% for silky smooth 60 FPS
            const isPerfMode = !!metaRef.current.performanceMode;
            const baseCapByLevel: Record<number, number> = isPerfMode
              ? { 1: 8, 2: 11, 3: 14, 4: 17, 5: 20, 6: 24 }
              : { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 36 };
            const maxCapByLevel: Record<number, number> = isPerfMode
              ? { 1: 30, 2: 40, 3: 50, 4: 60, 5: 68, 6: 76 }
              : { 1: 48, 2: 65, 3: 82, 4: 100, 5: 118, 6: 135 };
            const minCap = baseCapByLevel[curLvlId] ?? 12;
            const maxCap = maxCapByLevel[curLvlId] ?? 60;
            const currentEnemyCap = Math.floor(minCap + (maxCap - minCap) * timeProgress);

            if (engine.spawnTimer <= 0) {
              // 2. Spawn interval scaled by level and elapsed time
              // Level 1: 2.2s at noon, gradually speeding up to 0.95s at midnight
              // Level 6: 1.1s at start, speeding up to 0.38s at midnight
              const startIntervalByLevel: Record<number, number> = { 1: 2.2, 2: 1.8, 3: 1.5, 4: 1.3, 5: 1.15, 6: 1.0 };
              const endIntervalByLevel: Record<number, number> = { 1: 0.95, 2: 0.75, 3: 0.60, 4: 0.50, 5: 0.42, 6: 0.36 };
              const startInt = startIntervalByLevel[curLvlId] ?? 1.8;
              const endInt = endIntervalByLevel[curLvlId] ?? 0.8;
              engine.spawnTimer = startInt - (startInt - endInt) * timeProgress;

              if (engine.enemies.length < currentEnemyCap) {
                // 3. Batch size scaling:
                // Level 1: strictly 1 enemy per spawn during first 75s, then 1-2
                let batchSize = 1;
                if (curLvlId === 1) {
                  batchSize = newTime < 75 ? 1 : (newTime < 180 ? (Math.random() < 0.7 ? 1 : 2) : 2);
                } else if (curLvlId === 2) {
                  batchSize = newTime < 60 ? 1 : (newTime < 180 ? (Math.random() < 0.5 ? 1 : 2) : (Math.random() < 0.6 ? 2 : 3));
                } else if (curLvlId === 3) {
                  batchSize = newTime < 60 ? (Math.random() < 0.6 ? 1 : 2) : (newTime < 180 ? 2 : 3);
                } else if (curLvlId === 4) {
                  batchSize = newTime < 60 ? 2 : (newTime < 180 ? (Math.random() < 0.5 ? 2 : 3) : 3);
                } else if (curLvlId === 5) {
                  batchSize = newTime < 60 ? 2 : (newTime < 180 ? 3 : 4);
                } else {
                  batchSize = newTime < 60 ? (Math.random() < 0.5 ? 2 : 3) : (newTime < 180 ? 3 : (Math.random() < 0.5 ? 4 : 5));
                }

                // Never exceed current cap
                const actualCount = Math.min(batchSize, currentEnemyCap - engine.enemies.length);

                for (let i = 0; i < actualCount; i++) {
                  const ang = Math.random() * Math.PI * 2;
                  const dist = 650 + Math.random() * 200;
                  const phaseKey = currentPhase.id as keyof typeof curLvl.spawnPools;
                  const pool = curLvl.spawnPools[phaseKey] || curLvl.spawnPools.noon;
                  const mobId = pool[Math.floor(Math.random() * pool.length)] || 'rarach';

                  engine.enemies.push(
                    createEnemyInstance(
                      mobId,
                      player.x + Math.cos(ang) * dist,
                      player.y + Math.sin(ang) * dist,
                      1
                    )
                  );
                }
              }
            }

            // Player movement
            let mx = 0;
            let my = 0;
            const keys = engine.keys;
            if (keys.KeyW || keys.ArrowUp) my -= 1;
            if (keys.KeyS || keys.ArrowDown) my += 1;
            if (keys.KeyA || keys.ArrowLeft) mx -= 1;
            if (keys.KeyD || keys.ArrowRight) mx += 1;

            if (touchMoveRef.current.active) {
              mx += touchMoveRef.current.x;
              my += touchMoveRef.current.y;
            }

            if (mx !== 0 || my !== 0) {
              const len = Math.hypot(mx, my);
              const speedMultiplier =
                (player.soulBuffTimer > 0 ? 1.25 : 1) *
                (player.waterSoakedTimer > 0 ? 0.75 : 1) *
                (player.slowTimer > 0 ? 0.65 : 1);
              player.x += (mx / len) * player.speed * speedMultiplier * dt;
              player.y += (my / len) * player.speed * speedMultiplier * dt;
              player.lastDx = mx;
              player.lastDy = my;
              player.animTime += dt;
            } else {
              player.animTime = 0;
            }

            if (player.soulBuffTimer > 0) player.soulBuffTimer -= dt;
            if (player.waterSoakedTimer > 0) player.waterSoakedTimer -= dt;
            if (player.slowTimer > 0) player.slowTimer -= dt;
            if (player.ultCd > 0) player.ultCd -= dt * (1 + ((metaRef.current.bellLevel || 0) * 0.08));
            if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer -= dt;
            if (player.dodgeCooldown > 0) player.dodgeCooldown -= dt;

            // Player regeneration
            if (player.regenLevel > 0 && player.hp < player.maxHp) {
              player.regenTimer += dt;
              if (player.regenTimer >= 5) {
                player.hp = Math.min(player.maxHp, player.hp + player.regenLevel * 3);
                player.regenTimer = 0;
                engine.texts.push(new DamageText(player.x, player.y - 40, `+${player.regenLevel * 3} 🍺`, COLORS.green));
              }
            }
            if (player.type === 'korenarka' && player.hp < player.maxHp) {
              player.herbTimer += dt;
              if (player.herbTimer >= 4) {
                player.hp = Math.min(player.maxHp, player.hp + 2);
                player.herbTimer = 0;
                engine.texts.push(new DamageText(player.x, player.y - 45, '+2 🌿', COLORS.green));
              }
            }

            // Night Watchman passive holy aura (throttled to 4 ticks/sec instead of 60 ticks/sec to prevent damage text flood)
            if (player.type === 'watchman') {
              player.watchmanAuraTimer = (player.watchmanAuraTimer || 0) - dt;
              if (player.watchmanAuraTimer <= 0) {
                player.watchmanAuraTimer = 0.25;
                const nearby = enemySpatialHashRef.current.queryCircle(player.x, player.y, 85 + 40);
                for (let i = 0; i < nearby.length; i++) {
                  const e = nearby[i];
                  if (e.isDefeated) continue;
                  const dx = player.x - e.x, dy = player.y - e.y, reach = 85 + e.radius;
                  if (dx * dx + dy * dy < reach * reach) {
                    const holyMult = getHolyDamageMultiplier(e);
                    e.takeDamage(4 * player.damageMultiplier * holyMult, 'holy', 0, 0);
                  }
                }
              }
            }

            // Hromnička flickering light aura: continuous gentle outward push resisted by Fear resist
            const hromnickaWp = player.weapons.find((w: any) => w.id === 'hromnicka');
            if (hromnickaWp) {
              if (player.hromnickaPulseTimer > 0) player.hromnickaPulseTimer -= dt;
              const auraReach = 135 + hromnickaWp.level * 15;
              const nearby = enemySpatialHashRef.current.queryCircle(player.x, player.y, auraReach + 40);
              for (let i = 0; i < nearby.length; i++) {
                const e = nearby[i];
                if (e.isDefeated) continue;
                const dx = e.x - player.x, dy = e.y - player.y, distSq = dx * dx + dy * dy, reach = auraReach + e.radius;
                if (distSq < reach * reach && distSq > 0.000001) {
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

            // Update persistent orbit angle for Válečnice.
            const valecniceWeapon = player.weapons.find((w: any) => w.id === 'valecnice');
            if (valecniceWeapon) {
              const orbitSpeed = valecniceWeapon.level >= 3 ? 2.16 : 1.8;
              player.valecniceAngle = (player.valecniceAngle + dt * orbitSpeed) % (Math.PI * 2);
            }

            // Fire weapons
            for (const w of player.weapons) {
              w.cd -= dt;
              if (w.cd <= 0) {
                const wDef = WEAPONS[w.id];
                if (wDef) {
                  if (!w.mastery) w.mastery = createWeaponMasteryState();
                  (player as any)._firingWeapon = w;
                  const fired = wDef.fire(player, w.level);
                  (player as any)._firingWeapon = null;
                  const rankDef = getWeaponRankDef(w.id, w.level);
                  const weaponCooldownBonus = rankDef?.cooldownReductionBonus ?? 0;
                  const playerCooldownBonus = typeof player.cooldownBonus === 'number'
                    ? Math.max(0, player.cooldownBonus)
                    : Math.max(0, ((player.cooldownMultiplier || 1) - 1) / 0.9);
                  const baseCd = wDef.baseCd;
                  const formulaCd = getEffectiveWeaponCooldown(baseCd, playerCooldownBonus, weaponCooldownBonus);
                  const stats = getRankedWeaponStats(w.id, w.level, w);
                  const localCd = Math.max(baseCd * 0.50, formulaCd * stats.cooldownMult);
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
                if (living.length > 0) {
                  const target = living[0];
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
                engine.texts.push(new DamageText(comp.x, comp.y - 30, 'Mějte se, sousede!', COLORS.parchment));
              }
            }

            // Camera follow
            engine.camera.x += (player.x - canvas.width / 2 - engine.camera.x) * 0.1;
            engine.camera.y += (player.y - canvas.height / 2 - engine.camera.y) * 0.1;

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

            engine.lastStatsSync += dt;
            if (engine.lastStatsSync >= HUD_SYNC_INTERVAL_SECONDS) {
              engine.lastStatsSync = 0;
              setRunStats((prev) => ({
                ...prev,
                time: newTime,
                dayPhase: currentPhase,
                kills: engine.kills,
                coins: engine.coins,
                souls: engine.souls,
                chasniks: engine.chasniks,
                hp: player.hp,
                maxHp: player.maxHp,
                ultCd: player.ultCd,
                chestProgress: Math.floor(engine.pointsChest),
              }));
            }
          } else if (currentGameState === 'fleeing') {
            engine.fleeTimer -= dt;
            if (engine.fleeTimer <= 0) {
              // Transition to tally screen
              setTallyCounters({
                kills: engine.kills,
                coins: engine.coins,
                souls: engine.souls,
                chasniks: engine.chasniks,
                time: Math.floor(engine.gameTime),
                isVictory: false,
                levelId: engine.activeLevelId || 1,
              });
              const updatedHighest = Math.max(metaRef.current.highestSurviveTime || 0, engine.gameTime);
              saveMeta({
                ...metaRef.current,
                highestSurviveTime: updatedHighest,
              });
              setGameState('tally');
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

            // Hazard projectiles fired by bosses (Mlynář rolling millstone, water flood wave, Bezhlavý rytíř head)
            if (p.isEnemy) {
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

              // Stationary Ground Puddle hazard (Hastrman water pools)
              if (p.isPuddle) {
                if (currentGameState === 'playing' && Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius) {
                  if (player.waterSoakedTimer < 1.0) {
                    player.waterSoakedTimer = 2.5 * Math.max(0, 1 - (metaRef.current.forestLevel || 0) * 0.40);
                    engine.texts.push(new DamageText(player.x, player.y - 40, 'MOKRÁ LOUŽE! 🌊', '#60A5FA'));
                    sound.splash();
                  }
                }
                continue;
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
                  player.waterSoakedTimer = 3.5 * Math.max(0, 1 - (metaRef.current.forestLevel || 0) * 0.40);
                }
                if (p.slowPlayer) {
                  player.slowTimer = 2.2 * Math.max(0, 1 - (metaRef.current.forestLevel || 0) * 0.40);
                }
                if (p.statusText) {
                  engine.texts.push(new DamageText(player.x, player.y - 40, p.statusText, p.statusColor || COLORS.mustard, true));
                }
                sound.hit();
                for (let k = 0; k < 6; k++) {
                  engine.particles.push({
                    x: p.x,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 120,
                    vy: (Math.random() - 0.5) * 120,
                    life: 0.4,
                    color: p.visual === 'dragon_fireball' ? '#EF4444' : p.visual === 'dragon_frostball' || p.visual === 'icicle' ? '#38BDF8' : p.visual === 'dragon_wind' ? '#BAE6FD' : p.visual === 'ink_bottle' ? '#0F172A' : p.visual === 'dirt_clod' ? '#5C4033' : p.visual === 'mud_ball' ? '#365314' : p.visual === 'millstone' || p.visual === 'boulder' ? COLORS.grey : p.visual === 'hell_spark' ? '#EF4444' : p.visual === 'wood_shard' ? '#78350F' : COLORS.ice,
                    size: 5,
                  });
                }
                if (p.boomerang) {
                  p.hitCooldown = 0.9;
                } else {
                  p.dead = true;
                }
              }
              continue;
            }

            // Homing bees
            if (p.homing) {
              const living = player.getLivingEnemies();
              if (living.length > 0) {
                const target = living[0];
                const targetAng = Math.atan2(target.y - p.y, target.x - p.x);
                p.vx += Math.cos(targetAng) * 400 * dt;
                p.vy += Math.sin(targetAng) * 400 * dt;
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 350) {
                  p.vx = (p.vx / spd) * 350;
                  p.vy = (p.vy / spd) * 350;
                }
              }
            }

            const nearby=enemySpatialHashRef.current.queryCircle(p.x,p.y,p.radius+72);
            for (const e of nearby) {
              if (e.isDefeated) continue;
              const dx=p.x-e.x, dy=p.y-e.y, reach=p.radius+e.radius;
              if (!p.hitList.includes(e) && distanceSq(p.x, p.y, e.x, e.y) < reach*reach) {
                p.hitList.push(e);
                const hungerResist = typeof e.hunger === 'number' ? e.hunger : (e.foodResist || 0);
                const resist = p.type === 'food' ? hungerResist : 0;
                if (resist >= 0.95) {
                  engine.texts.push(new DamageText(e.x, e.y - 20, 'IMUNNÍ', COLORS.ink));
                } else {
                  let dmg = p.dmg * (1 - resist);
                  if (p.type === 'food') {
                    // Food type weapons like Buchta don't cause graphical hit effect or knockback
                    // but they cause enemy to snack and do nothing for a time, with Ňam, ňam note.
                    // Buchta causes snack for 4s, multiple hits cumulate time. Snack is resistable with Hunger.
                    const baseSnack = p.snackDuration ?? 4.0;
                    const effectiveSnack = baseSnack * Math.max(0, 1 - hungerResist);
                    e.snackTimer = (e.snackTimer || 0) + effectiveSnack;
                    engine.texts.push(new DamageText(e.x, e.y - 25, 'Ňam, ňam', '#D97706', true));
                    sound.snack();
                  }

                  if (p.type === 'holy') {
                    const holyMult = getHolyDamageMultiplier(e);
                    dmg *= holyMult;
                    if (isUnholyEnemy(e)) {
                      engine.texts.push(new DamageText(e.x, e.y - 45, 'SVATÁ ZKÁZA!', COLORS.mustard, true));
                    }
                  }
                  const holyPush = p.type === 'holy' ? Math.max(0.1, 1 - getEnemyHolyResistance(e)) : 1;
                  e.takeDamage(dmg, p.type, p.type === 'food' ? 0 : p.vx * 0.3 * holyPush, p.type === 'food' ? 0 : p.vy * 0.3 * holyPush);
                  if (!p.noMasteryProc && p.weaponId) player.triggerWeaponMastery(p.weaponId, e, 'hit');
                  if (p.type === 'ice') e.chill(3.5);
                  if (p.type === 'pickle') {
                    e.applyStatusEffect('pickle_sickness', { addStacks: 1, maxStacks: 3, duration: 6, damageTakenMultiplier: p.pickleDamageTakenMultiplier || 1.35, damageDealtMultiplier: 0.65 });
                    const after = e.getStatusEffect('pickle_sickness')?.stacks || 0;
                    const burstColor = after >= 3 ? '#84CC16' : '#A3E635';
                    for (let k = 0; k < (after >= 3 ? 8 : 4); k++) {
                      engine.particles.push({x:e.x+(Math.random()-.5)*14,y:e.y+(Math.random()-.5)*14,vx:(Math.random()-.5)*100,vy:(Math.random()-.5)*100,life:.35,color:burstColor,size:after>=3?4:2.5});
                    }
                    engine.texts.push(new DamageText(e.x, e.y-30, after >= 3 ? 'PŘEJEDENÍ! 🥒' : String(after) + '/3 🥒', burstColor, after >= 3));
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
                  if (p.type === 'pickle' && p.penetrate) {
                    continue;
                  }
                  p.dead = true;
                  break;
                }
              }
            }
          }
          compactInPlace(engine.projectiles, (p) => !p.dead);

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
              if (!s.hitList.includes(e) && distanceSq(s.x, s.y, e.x, e.y) <= reach * reach) {
                const ang = Math.atan2(e.y - s.y, e.x - s.x);
                let diff = Math.abs(ang - s.angle);
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                if (diff <= s.arc / 2) {
                  s.hitList.push(e);
                  e.takeDamage(s.dmg, s.type, Math.cos(s.angle) * 260, Math.sin(s.angle) * 260);
                  if (!s.noMasteryProc && s.weaponId) player.triggerWeaponMastery(s.weaponId, e, 'hit');
                  if (s.soaked) e.soak();
                  if (s.style === 'cane' || s.weaponId === 'cane') {
                    // Aspen whip hit effects: bud/leaf/wood particles & splash
                    for (let pIdx = 0; pIdx < (s.soaked ? 4 : 3); pIdx++) {
                      engine.particles.push({
                        x: e.x + (Math.random() - 0.5) * 16,
                        y: e.y + (Math.random() - 0.5) * 16,
                        vx: Math.cos(s.angle + (Math.random() - 0.5) * 1.4) * (120 + Math.random() * 80),
                        vy: Math.sin(s.angle + (Math.random() - 0.5) * 1.4) * (120 + Math.random() * 80),
                        life: 0.35,
                        color: s.soaked ? (pIdx % 2 === 0 ? '#60A5FA' : '#93C5FD') : (pIdx % 2 === 0 ? '#84CC16' : '#78350F'),
                        size: s.soaked ? 3.5 : 2.5,
                      });
                    }
                    if (Math.random() < 0.35) {
                      const whipWords = s.soaked ? ['ŠPLOUCH!', 'PLESK!', 'ŠVIH!'] : ['ŠVIH!', 'PRÁSK!', 'PLESK!', 'ŠLEH!'];
                      const word = whipWords[Math.floor(Math.random() * whipWords.length)];
                      engine.texts.push(new DamageText(e.x + (Math.random() - 0.5) * 20, e.y - 30, word, s.soaked ? '#38BDF8' : '#FDE047', false));
                    }
                  }
                }
              }
            }
          }
          compactInPlace(engine.slashes, (s) => !s.dead);

          // Update Enemies
          for (const e of engine.enemies) {
            e.update(dt, player);

            if (!e.isDefeated && (e.snackTimer || 0) <= 0 && Math.hypot(e.x - player.x, e.y - player.y) < e.radius + player.radius) {
              if (currentGameState === 'playing') {
                if (e.id === 'cert' && e.aiState === 'charge') {
                  const chDmg = (e.damage * e.getDamageDealtMultiplier() * 1.55) * (1 - player.damageReduction);
                  player.takeDamage(chDmg, 'physical');
                  sound.heavyHit();
                  const pushDist = 110;
                  player.x += Math.cos(e.chargeDirX) * pushDist;
                  player.y += Math.sin(e.chargeDirX) * pushDist;
                  engine.texts.push(new DamageText(player.x, player.y - 50, `DRTIVÝ NÁRAZ VIDLEMI! -${Math.ceil(chDmg)} 🔱💥`, COLORS.red, true));
                  e.aiState = 'brake';
                  e.aiTimer = 0.55;
                  e.vx = 0;
                  e.vy = 0;
                } else {
                  e.contactTimer = (e.contactTimer || 0) - dt;
                  if (e.contactTimer <= 0) {
                    e.contactTimer = 0.45;
                    player.takeDamage(e.damage * e.getDamageDealtMultiplier(), 'physical');
                  }
                }
              }
            }
          }
          compactInPlace(engine.enemies, (e) => !e.dead);

          // Rebuild the spatial hash AFTER enemy movement.
          // Collision systems later in this frame must see current enemy positions.
          livingEnemiesRef.current.length = 0;
          for (const e of engine.enemies) {
            if (!e.isDefeated && !e.dead) {
              livingEnemiesRef.current.push(e);
            }
          }
          enemySpatialHashRef.current.rebuild(livingEnemiesRef.current);

          // Update Drops
          for (const d of engine.drops) {
            d.time += dt;
            if (d.vx || d.vy) {
              d.x += d.vx * dt;
              d.y += d.vy * dt;
              const drag = Math.max(0, 1 - 7.5 * dt);
              d.vx *= drag;
              d.vy *= drag;
              if (Math.abs(d.vx) < 1.5) d.vx = 0;
              if (Math.abs(d.vy) < 1.5) d.vy = 0;
            }
            const dist = Math.hypot(d.x - player.x, d.y - player.y);

            if (d.type === 'chasnik') {
              if (!d.rescued && dist < d.radius + player.radius + 35) {
                d.rescued = true;
                d.dead = true;
                triggerRescueChasnik(d.x, d.y);
              }
            } else if (dist < player.pickupRadius && currentGameState === 'playing') {
              const spd = Math.max(520, (player.pickupRadius - dist) * 7.5 + 380) * dt;
              const ang = Math.atan2(player.y - d.y, player.x - d.x);
              d.x += Math.cos(ang) * spd;
              d.y += Math.sin(ang) * spd;
              const curDist = Math.hypot(d.x - player.x, d.y - player.y);

              if (curDist < player.radius + d.radius + 14 || dist < player.radius + d.radius + 14) {
                d.dead = true;
                if (d.type === 'coin') {
                  const val = d.value || 1;
                  sound.coin();
                  engine.coins += val;
                  if (val >= 15) {
                    engine.texts.push(new DamageText(player.x, player.y - 48, `+${val} kr. (Tolar)`, COLORS.mustard, true));
                  } else if (val >= 5) {
                    engine.texts.push(new DamageText(player.x, player.y - 40, `+${val} kr. (Groš)`, '#E2E8F0'));
                  }
                  setRunStats((s) => {
                    const nextXp = s.xp + val;
                    const nextCoins = engine.coins;
                    if (nextXp >= s.xpNeeded) {
                      openLevelUpModal();
                      return {
                        ...s,
                        xp: nextXp - s.xpNeeded,
                        level: s.level + 1,
                        xpNeeded: Math.floor(s.xpNeeded * 1.5),
                        coins: nextCoins,
                      };
                    }
                    return { ...s, xp: nextXp, coins: nextCoins };
                  });
                } else if (d.type === 'potion') {
                  sound.potion();
                  const waterLevel = metaRef.current.waterLevel || 0;
                  const potionHeal = 30 * (1 + waterLevel * 0.20);
                  player.hp = Math.min(player.maxHp, player.hp + potionHeal);
                  player.invulnerabilityTimer = waterLevel * 2;
                  engine.texts.push(new DamageText(player.x, player.y - 45, '+30 Kuráž (Jitrnice)', COLORS.green, true));
                } else if (d.type === 'bread' || d.type === 'pear') {
                  sound.potion();
                  player.hp = Math.min(player.maxHp, player.hp + 15);
                  engine.texts.push(new DamageText(player.x, player.y - 40, '+15 Kuráž 🍐', '#84CC16'));
                } else if (d.type === 'soul') {
                  sound.soul();
                  player.soulBuffTimer = 6.0;
                  engine.souls += 1;
                  engine.coins += 25;
                  setRunStats((s) => ({ ...s, souls: engine.souls, coins: engine.coins }));
                  engine.texts.push(new DamageText(player.x, player.y - 45, 'DUŠIČKA OSVOBOZENA! +25 kr.', COLORS.mustard, true));
                } else if (d.type === 'chest') {
                  openChestSequence();
                }
              }
            }
          }
          compactInPlace(engine.drops, (d) => !d.dead);

          // Update texts
          for (const txt of engine.texts) txt.update(dt);
          compactInPlace(engine.texts, (t) => t.life > 0);
          if (engine.texts.length > MAX_DAMAGE_TEXTS) {
            engine.texts.splice(0, engine.texts.length - MAX_DAMAGE_TEXTS);
          }

          // Update smoke puffs
          if (engine.smokePuffs) {
            for (const puff of engine.smokePuffs) puff.update(dt);
            compactInPlace(engine.smokePuffs, (p) => !p.dead);
          }

          // Update particles
          if (engine.particles) {
            for (const p of engine.particles) {
              p.x += (p.vx || 0) * dt;
              p.y += (p.vy || 0) * dt;
              p.life -= dt;
            }
            compactInPlace(engine.particles, (p) => p.life > 0);
            if (engine.particles.length > MAX_PARTICLES) {
              engine.particles.splice(0, engine.particles.length - MAX_PARTICLES);
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
            p.hp = Math.min(p.maxHp, p.hp + 6);
            engineRef.current.texts.push(new DamageText(p.x + (Math.random() - 0.5) * 20, p.y - 45, '+6 HP', '#4ADE80', false));
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (currentGameState === 'playing' || currentGameState === 'fleeing' || currentGameState === 'levelup' || currentGameState === 'chest' || currentGameState === 'paused') {
        const engine = engineRef.current;
        const player = engine.player;
        const cam = engine.camera;
        const phase = getCurrentDayPhase(engine.gameTime);

        const curLvl = GAME_LEVELS[engine.activeLevelId || currentSelectedLevelId] || GAME_LEVELS[1];
        const isWinter = curLvl.season === 'winter';

        // Sky / Grass background tailored to level
        if (isWinter) {
          ctx.fillStyle = '#E9F1F7';
        } else if (curLvl.theme === 'autumn_graveyard') {
          ctx.fillStyle = phase.id === 'noon' || phase.id === 'afternoon' ? '#383B30' : '#202127';
        } else {
          ctx.fillStyle = phase.skyColor;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply camera translate
        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        // Ambient night/day tint over world
        if (curLvl.theme === 'autumn_graveyard') {
          ctx.fillStyle = phase.ambientTint !== 'transparent' ? 'rgba(32, 24, 45, 0.42)' : 'rgba(25, 20, 30, 0.22)';
          ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
        } else if (!isWinter && phase.ambientTint !== 'transparent') {
          ctx.fillStyle = phase.ambientTint;
          ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
        } else if (isWinter) {
          ctx.fillStyle = 'rgba(180, 210, 240, 0.12)';
          ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
        }

        // Ambient flour storm haze from Mlynář
        if (engine.flourStormTimer > 0) {
          ctx.save();
          const alpha = Math.min(0.35, engine.flourStormTimer * 0.08);
          ctx.fillStyle = `rgba(255, 252, 240, ${alpha})`;
          ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);
          ctx.restore();
        }

        // Compute a padded viewport once and reuse it for every world layer.
        // The padding keeps tall art from visibly popping at the edge.
        const viewLeft = cam.x - 120;
        const viewTop = cam.y - 160;
        const viewRight = cam.x + canvas.width + 120;
        const viewBottom = cam.y + canvas.height + 160;

        // Draw only decor that can contribute pixels this frame. Decor is
        // generated across the whole level, so drawing it unconditionally
        // becomes increasingly expensive on large maps.
        for (const dec of engine.decor) {
          if (!isInView(dec.x, dec.y - 45 * dec.scale, 100 * dec.scale, viewLeft, viewTop, viewRight, viewBottom)) continue;
          dec.draw(ctx, curLvl.season, curLvl.theme);
        }

        // Draw Drops
        for (const d of engine.drops) {
          if (!isInView(d.x, d.y, (d.radius || 14) + 24, viewLeft, viewTop, viewRight, viewBottom)) continue;
          if (d.type === 'coin') {
            Lada.drawCoin(ctx, d.x, d.y, d.time, d.value || 1);
          } else if (d.type === 'potion') {
            Lada.drawPotion(ctx, d.x, d.y, d.time);
          } else if (d.type === 'bread' || d.type === 'pear') {
            Lada.drawPear(ctx, d.x, d.y, d.time);
          } else if (d.type === 'soul') {
            Lada.drawSoulJar(ctx, d.x, d.y, d.time);
          } else if (d.type === 'chest') {
            Lada.drawChest(ctx, d.x, d.y, 0, Math.abs(Math.sin(d.time * 2)), 0.65);
          } else if (d.type === 'chasnik') {
            Lada.drawChasnik(ctx, d.x, d.y, d.time, true);
          }
        }

        // Draw Companion if active
        if (engine.companion) {
          Lada.drawChasnik(ctx, engine.companion.x, engine.companion.y, engine.companion.animTime, false);
        }

        // Draw Hromnička flickering holy light aura on ground under characters
        const hromnickaWp = player ? player.weapons.find((w: any) => w.id === 'hromnicka') : null;
        if (player && hromnickaWp) {
          const reach = 135 + hromnickaWp.level * 15;
          Lada.drawHromnickaAura(ctx, player.x, player.y, reach, engine.uiTime, player.hromnickaPulseTimer || 0);
        }

        // Persistent weapon visuals: animated garlic stink aura and orbiting Válečnice.
        const garlicWp = player ? player.weapons.find((w: any) => w.id === 'cesnekova-topinka') : null;
        if (player && garlicWp) {
          const auraRadius = 110 * (garlicWp.level >= 2 ? 1.2 : 1) * (garlicWp.level >= 5 ? 1.15 : 1);
          ctx.save();
          const pulse = 1 + Math.sin(engine.uiTime * 2.6) * 0.045;
          const grad = ctx.createRadialGradient(player.x, player.y, auraRadius * 0.12, player.x, player.y, auraRadius * pulse);
          grad.addColorStop(0, 'rgba(190, 230, 110, 0.05)');
          grad.addColorStop(0.62, 'rgba(132, 180, 55, 0.12)');
          grad.addColorStop(1, 'rgba(101, 145, 35, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(player.x, player.y, auraRadius * pulse, 0, Math.PI * 2); ctx.fill();
          for (let i=0;i<8;i++) {
            const a = engine.uiTime * (0.28 + i*0.01) + i * Math.PI / 4;
            const rr = auraRadius * (0.35 + ((engine.uiTime * 0.12 + i * 0.17) % 0.65));
            const x = player.x + Math.cos(a) * rr, y = player.y + Math.sin(a) * rr;
            ctx.globalAlpha = 0.28 * (1-rr/auraRadius);
            ctx.fillStyle = i%2 ? '#A3E635' : '#D9F99D';
            ctx.beginPath(); ctx.arc(x, y, 7 + Math.sin(engine.uiTime*2+i)*2, 0, Math.PI*2); ctx.fill();
          }
          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = 'rgba(101,145,35,.32)'; ctx.lineWidth = 2;
          ctx.setLineDash([4,8]); ctx.beginPath(); ctx.arc(player.x, player.y, auraRadius*pulse, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
          ctx.restore();
        }

        const valecniceWp = player ? player.weapons.find((w: any) => w.id === 'valecnice') : null;
        if (player && valecniceWp) {
          const count = valecniceWp.level >= 2 ? 2 : 1;
          const orbitRadius = 55 + (valecniceWp.level >= 5 ? 16 : 0);
          for (let i=0;i<count;i++) {
            const a = (player.valecniceAngle || 0) + i*Math.PI*2/count;
            const x = player.x + Math.cos(a)*orbitRadius, y = player.y + Math.sin(a)*orbitRadius;
            const bob = Math.sin(engine.uiTime*7+i)*2;
            ctx.save();
            ctx.translate(x, y+bob);
            ctx.rotate(a + Math.sin(engine.uiTime*5+i)*0.08);
            ctx.fillStyle='#E7B98B'; ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2.5;
            ctx.beginPath(); ctx.arc(0,-5,13,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#B91C1C'; ctx.beginPath(); ctx.arc(0,-8,14,Math.PI,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#7C2D12'; ctx.beginPath(); ctx.ellipse(0,9,13,15,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            const swing = Math.sin(engine.uiTime*9+i)*0.18;
            ctx.rotate(swing);
            ctx.strokeStyle='#8B5A2B'; ctx.lineWidth=6; ctx.lineCap='round';
            ctx.beginPath(); ctx.moveTo(-21,7); ctx.lineTo(21,7); ctx.stroke();
            ctx.strokeStyle='#D6A15A'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-18,3); ctx.lineTo(18,3); ctx.stroke();
            ctx.restore();
          }
        }

        // Sort characters & enemies by Y for correct isometric depth
        const drawables = engine.renderBuffer;
        drawables.length = 0;
        if(player) drawables.push(player);
        for(const enemy of engine.enemies){if (isInView(enemy.x, enemy.y, enemy.radius, viewLeft, viewTop, viewRight, viewBottom)) drawables.push(enemy);}
        if(engine.smokePuffs){for(const puff of engine.smokePuffs){if (isInView(puff.x, puff.y, puff.radius * 2, viewLeft, viewTop, viewRight, viewBottom)) drawables.push(puff);}}
        drawables.sort((a,b)=>a.y-b.y);

        for (const d of drawables) {
          if (d && typeof d.draw === 'function') {
            d.draw(ctx);
          }
        }

        // Draw Projectiles
        for (const p of engine.projectiles) {
          if (!isInView(p.x, p.y, p.radius || 12, viewLeft, viewTop, viewRight, viewBottom)) continue;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          if (p.visual === 'bun') {
            Lada.drawCzechBuchta(ctx, 0, 0, 1.15);
          } else if (p.visual === 'herb_leaf') {
            Lada.setupPath(ctx, COLORS.green, COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'snowball' || p.visual === 'snowball_small') {
            const rad = p.visual === 'snowball' ? 12 : 7;
            Lada.setupPath(ctx, '#F8FAFC', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'kolac') {
            Lada.drawKynutyKolac(ctx, 0, 0, 1.25, 0);
          } else if (p.visual === 'pickle') {
            ctx.save();
            ctx.rotate(Math.sin(engine.uiTime * 8 + p.x * 0.01) * 0.08);
            Lada.setupPath(ctx, '#5E9F3B', '#193B18', 2.5);
            ctx.beginPath(); ctx.ellipse(0,0,15,8,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#A8D96D';
            for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(i*6,-2+(i%2)*3,1.4,0,Math.PI*2);ctx.fill();}
            ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath();ctx.ellipse(-5,-3,3,1.5,-.3,0,Math.PI*2);ctx.fill();
            ctx.restore();
          } else if (p.visual === 'potato') {
            Lada.setupPath(ctx, '#78350F', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'bee') {
            Lada.setupPath(ctx, COLORS.mustard, COLORS.ink, 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'holy_droplet') {
            Lada.setupPath(ctx, COLORS.ice, COLORS.ink, 2);
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.visual === 'millstone') {
            Lada.drawMillstone(ctx, 0, 0, p.radius || 20, p.rotation || 0);
          } else if (p.visual === 'water_wave') {
            Lada.drawWaterWave(ctx, 0, 0, p.radius || 26, 0, engine.uiTime);
          } else if (p.visual === 'ink_bottle') {
            // Písař's ink bottle
            Lada.setupPath(ctx, '#1E293B', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.rect(-8, -10, 16, 20);
            ctx.fill();
            ctx.stroke();
            Lada.setupPath(ctx, '#D9A036', COLORS.ink, 2);
            ctx.fillRect(-4, -15, 8, 5);
            ctx.strokeRect(-4, -15, 8, 5);
            ctx.fillStyle = '#F3E9D2';
            ctx.fillRect(-5, -5, 10, 10);
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.visual === 'dirt_clod') {
            // Hrobník's dirt clod
            Lada.setupPath(ctx, '#5C4033', COLORS.ink, 2.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#3D2210';
            ctx.beginPath();
            ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(3, 3, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.visual === 'mud_ball') {
            // Vodníček's swamp mud
            Lada.setupPath(ctx, '#365314', COLORS.ink, 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#65A30D';
            ctx.beginPath();
            ctx.arc(-2, -1, 3.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.visual === 'scythe_wave') {
            // Kostlivec s kosou spectral blade
            ctx.save();
            ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 22, -Math.PI / 3, Math.PI / 3, false);
            ctx.arc(-6, 0, 18, Math.PI / 3, -Math.PI / 3, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          } else if (p.visual === 'water_puddle') {
            // Hastrman's water puddle hazard
            ctx.save();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const ripple = (Math.sin(engine.uiTime * 3) + 1) * 0.5 * 14;
            ctx.ellipse(0, 0, ripple + 4, (ripple + 4) * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else if (p.visual === 'head_projectile') {
            // Bezhlavý rytíř returning head
            ctx.save();
            Lada.setupPath(ctx, '#475569', COLORS.ink, 3);
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#FDE047';
            ctx.fillRect(-8, -3, 16, 5);
            ctx.strokeRect(-8, -3, 16, 5);
            ctx.restore();
          } else if (p.visual === 'boulder') {
            Lada.drawRollingBoulder(ctx, 0, 0, p.radius || 22, p.angle || 0);
          } else if (p.visual === 'hell_spark') {
            Lada.drawHellSpark(ctx, 0, 0, p.radius || 10, engine.uiTime);
          } else if (p.visual === 'wood_shard') {
            Lada.drawWoodShard(ctx, 0, 0, p.radius || 12, p.angle || 0);
          } else if (p.visual === 'icicle') {
            Lada.drawIcicle(ctx, 0, 0, p.radius || 14, p.angle || Math.PI / 2);
          } else if (p.visual === 'dragon_fireball') {
            Lada.drawDragonFireball(ctx, 0, 0, p.radius || 16, engine.uiTime);
          } else if (p.visual === 'dragon_frostball') {
            Lada.drawDragonFrostball(ctx, 0, 0, p.radius || 16, engine.uiTime);
          } else if (p.visual === 'dragon_wind') {
            Lada.drawDragonWind(ctx, 0, 0, p.radius || 22, p.angle || 0, engine.uiTime);
          } else {
            Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Melee Slashes
        for (const s of engine.slashes) {
          if (!isInView(s.x, s.y, s.reach || 80, viewLeft, viewTop, viewRight, viewBottom)) continue;
          ctx.save();
          ctx.translate(s.x, s.y);
          if (s.style === 'thrust') {
            ctx.rotate(s.angle);
            ctx.strokeStyle = COLORS.ink;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(s.reach, 0);
            ctx.moveTo(15, -12);
            ctx.lineTo(s.reach * 0.9, -12);
            ctx.moveTo(15, 12);
            ctx.lineTo(s.reach * 0.9, 12);
            ctx.stroke();
          } else if (s.style === 'cane' || ((!s.style || s.style === 'arc') && s.weaponId !== 'halberd')) {
            Lada.drawOsikovyPrutSlash(ctx, s);
          } else {
            Lada.setupPath(ctx, 'transparent', s.style === 'halberd' ? '#94A3B8' : COLORS.white, 8);
            ctx.beginPath();
            ctx.arc(0, 0, s.reach * 0.8, s.angle - s.arc / 2, s.angle + s.arc / 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw Damage Texts
        for (const txt of engine.texts) {
          if (!isInView(txt.x, txt.y, txt.size || 18, viewLeft, viewTop, viewRight, viewBottom)) continue;
          txt.draw(ctx);
        }

        // Draw particles
        if (engine.particles) {
          for (const p of engine.particles) {
            if (!isInView(p.x, p.y, p.size || 6, viewLeft, viewTop, viewRight, viewBottom)) continue;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, (p.life || 0) * 2.5));
            ctx.fillStyle = p.color || COLORS.white;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Draw lightning strike bolt
        if (engine.lightningStrike) {
          const ls = engine.lightningStrike;
          ctx.save();
          ctx.strokeStyle = '#FEF08A';
          ctx.shadowColor = '#60A5FA';
          ctx.shadowBlur = 22;
          ctx.lineWidth = 6;
          ctx.beginPath();
          let curX = ls.x + (Math.random() - 0.5) * 40;
          let curY = cam.y - 120;
          ctx.moveTo(curX, curY);
          const steps = 7;
          for (let s = 1; s <= steps; s++) {
            const targetY = (cam.y - 120) + (ls.y - (cam.y - 120)) * (s / steps);
            const targetX = s === steps ? ls.x : ls.x + (Math.random() - 0.5) * 55;
            ctx.lineTo(targetX, targetY);
          }
          ctx.stroke();

          ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
          ctx.beginPath();
          ctx.arc(ls.x, ls.y, 65, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }        // Farní požehnání: zvon a sloup svatého světla
        if (engine.blessing) {
          Lada.drawBlessingFx(ctx, engine.blessing.x, engine.blessing.y, engine.blessing.t, engine.blessing.dur);
        }
        // In-world pastevecké stádo a částicové efekty Pasáčka
        if (engine.shepherdStampede) {
          Lada.drawShepherdStampedeFx(ctx, engine.shepherdStampede, dt, player.x, player.y);
        }
        // In-world bylinné sanctuarium a očistné kadidlo Kořenářky
        if (engine.korenarkaSanctuary) {
          Lada.drawKorenarkaSanctuaryFx(ctx, engine.korenarkaSanctuary, dt, player.x, player.y);
        }
        // Pověstná sukovice – roztočená sukovitá hůl a rázová vlna s aurou děsu
        if (engine.sukovice) {
          Lada.drawSukoviceFx(ctx, engine.sukovice, player.x, player.y);
        }

        ctx.restore();

        // Enable with ?perf or Settings toggle to inspect the live frame budget
        const isPerfVisible = showPerformanceOverlay || !!metaRef.current.showPerfOverlay;
        if (isPerfVisible) {
          const frameMs = performance.now() - now;
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
          ctx.fillText(`${currentFps} FPS (${smoothedFrameMs.toFixed(1)} ms)${metaRef.current.performanceMode ? ' [PLYNULÝ]' : ''}`, 22, 33);
          ctx.fillStyle = '#E2E8F0';
          ctx.fillText(`Nepřátelé: ${engine.enemies.length} | Střely: ${engine.projectiles.length}`, 22, 51);
          ctx.fillText(`Částice: ${engine.particles.length} | Texty: ${engine.texts.length}`, 22, 69);
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
          for (let i = 0; i < 22; i++) {
            const sx = ((i * 190 + t * 22) % (canvas.width + 200)) - 100;
            const sy = (i * 55 + Math.sin(t * 0.5 + i) * 30) % canvas.height;
            const grad = ctx.createRadialGradient(sx, sy, 10, sx, sy, 120);
            grad.addColorStop(0, 'rgba(180, 195, 215, 0.12)');
            grad.addColorStop(1, 'rgba(180, 195, 215, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, 120, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(loop);
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
    customBossTitle?: string
  ) => {
    const stats = ENEMIES[id];
    if (!stats) {
      throw new Error(`[Bubakov] Unknown enemy id: "${id}"`);
    }
    let finalHp = Math.round(stats.hp * (multiplier || 1));
    if (isMiniboss) {
      finalHp = Math.max(finalHp, 1400);
    }
    const renderScale = isMiniboss ? 1.75 : (isBoss ? 1.35 : 1.0);
    const radius = isMiniboss ? Math.round(stats.radius * 1.65) : (isBoss ? stats.radius * 1.3 : stats.radius);
    const poiseResist = isMiniboss ? Math.max(0.82, (stats.poiseResist || 0) + 0.45) : (stats.poiseResist || 0);
    const foodResist = isMiniboss ? Math.max(0.78, (stats.foodResist || 0) + 0.45) : (stats.foodResist || 0);
    const hunger = isMiniboss
      ? Math.max(0.78, (stats.hunger !== undefined ? stats.hunger : (stats.foodResist || 0)) + 0.45)
      : (stats.hunger !== undefined ? stats.hunger : (stats.foodResist || 0));
    const willpower = isMiniboss ? Math.max(0.85, (stats.willpower || 0) + 0.45) : (stats.willpower || 0);
    const damage = Math.round((isMiniboss ? stats.damage * 1.35 : stats.damage) * 1.6);
    const coinValue = isMiniboss ? Math.max(25, (stats.coinValue || 1) * 6) : (stats.coinValue || 1);
    const xp = isMiniboss ? Math.max(20, (stats.xp || 1) * 5) : stats.xp;

    return {
      id,
      x,
      y,
      isBoss,
      isMiniboss,
      customBossTitle: customBossTitle || '',
      renderScale,
      maxHp: finalHp,
      hp: finalHp,
      speed: isMiniboss ? Math.max(stats.speed * 0.95, 68) : stats.speed,
      damage,
      radius,
      foodResist,
      hunger,
      poiseResist,
      willpower,
      coinValue,
      xp,
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
      snackTimer: 0,
      defeatedByFood: false,
      foodDefeatTimer: 0,
      snackSoundTimer: 0,
      dead: false,
      isDefeated: false,
      panicked: false,
      panicTimer: 0,
      calmTimer: 0,
      hitFlashTimer: 0,
      contactTimer: 0,
      animTime: Math.random() * 10,

      // Specialized AI state machine variables
      aiState: 'idle' as string,
      aiTimer: Math.random() * 1.2,
      specialCd: 1.0 + Math.random() * 2.0,
      orbitRadius: 130 + Math.random() * 60,
      orbitDir: Math.random() < 0.5 ? 1 : -1,
      orbitAngle: Math.random() * Math.PI * 2,
      zigZagTimer: 0,
      zigZagDir: Math.random() < 0.5 ? 1 : -1,
      chargeDirX: 0,
      chargeSpeed: 0,
      puddleCd: 2.0 + Math.random() * 2.0,

      update(dt: number, player: any) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
        if (this.contactTimer > 0) this.contactTimer -= dt;
        if (this.garlicSlowTimer > 0) this.garlicSlowTimer -= dt;
        for (const [statusType, effect] of Object.entries(this.statusEffects) as [string, any][]) {
          effect.remaining -= dt;
          if (effect.remaining <= 0) delete this.statusEffects[statusType];
        }
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        if (this.isDefeated) {
          if (this.defeatedByFood) {
            // Defeated by food weapons: slowly walk away, enjoying the food snack
            this.foodDefeatTimer = (this.foodDefeatTimer || 0) + dt;

            // In the last 0.25s before disappearing, spawn gentle little anticipatory smoke / steam puffs (only if on screen)
            if (this.foodDefeatTimer >= 0.55 && Math.random() < 0.35 && distToPlayer < 650) {
              const ang = Math.random() * Math.PI * 2;
              engineRef.current.particles.push({
                x: this.x + Math.cos(ang) * (this.radius * 0.4),
                y: this.y - this.radius * 0.35 + Math.sin(ang) * (this.radius * 0.25),
                vx: (Math.random() - 0.5) * 15,
                vy: -30 - Math.random() * 20,
                life: 0.35,
                color: '#FFFDF7',
                size: 3.5,
              });
            }

            // Enemies defeated by food disappear after 0.85s or once off-screen
            if (this.foodDefeatTimer >= 0.85 || distToPlayer > 600) {
              this.dead = true;
              if (distToPlayer < 750) {
                engineRef.current.smokePuffs.push(new SmokePuff(this.x, this.y - this.radius * 0.35, this.radius));
                sound.smokePuff();
                engineRef.current.texts.push(new DamageText(this.x, this.y - this.radius - 12, 'Puf! 💨', '#A8A29E'));
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
            engineRef.current.particles.push({
              x: this.x - Math.cos(ang) * (this.radius * 0.8) + (Math.random() - 0.5) * 6,
              y: this.y + this.radius * 0.6 + (Math.random() - 0.5) * 4,
              vx: -Math.cos(ang) * 40 + (Math.random() - 0.5) * 20,
              vy: -Math.random() * 20,
              life: 0.3,
              color: '#D8C6A5',
              size: 3,
            });
          }

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
        this.animTime += dt;

        if (this.panicTimer > 0) {
          this.panicTimer = Math.max(0, this.panicTimer - dt);
        }
        this.panicked = this.panicTimer > 0;

        let spd = this.speed * this.getMovementSpeedMultiplier() * (this.garlicSlowTimer > 0 ? 0.9 : 1);
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
            engineRef.current.particles.push({
              x: this.x - fleeX * (this.radius * 0.7) + (Math.random() - 0.5) * 6,
              y: this.y - fleeY * (this.radius * 0.7) + (Math.random() - 0.5) * 6,
              vx: -fleeX * 20 + (Math.random() - 0.5) * 15,
              vy: -fleeY * 20 - Math.random() * 20,
              life: 0.35,
              color: 'rgba(215, 200, 175, 0.65)',
              size: 3 + Math.random() * 3,
            });
          }
          return;
        }

        // Reposition stranded enemies that are far away back to active perimeter around player
        if (distToPlayer > 1350 && !this.isBoss && !this.isMiniboss) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 720 + Math.random() * 120;
          this.x = player.x + Math.cos(ang) * dist;
          this.y = player.y + Math.sin(ang) * dist;
          this.vx = 0;
          this.vy = 0;
          return;
        }

        // Streamlined update for distant off-screen enemies: direct pursuit towards hero
        if (distToPlayer > 850 && !this.isBoss && !this.isMiniboss) {
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
          this.x += (this.vx + this.kbx) * dt;
          this.y += (this.vy + this.kby) * dt;
          return;
        }

        // ----------------------------------------------------
        // SPECIALIZED ENEMY AI BEHAVIORS
        // ----------------------------------------------------
        this.aiTimer -= dt;
        this.specialCd -= dt;

        // 1. RARÁŠEK (rarach / sazovy_rarach) - Hejnové obkličování & prudké výpady
        if (this.id === 'rarach' || this.id === 'sazovy_rarach') {
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
              this.specialCd = 2.5 + Math.random() * 2.5;
            }
          } else {
            if (this.specialCd <= 0 && distToPlayer < 240) {
              this.aiState = 'lunge';
              this.aiTimer = 0.45;
              this.chargeDirX = dirToPlayer;
              for (let i = 0; i < 3; i++) {
                engineRef.current.particles.push({
                  x: this.x,
                  y: this.y,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.3,
                  color: this.id === 'sazovy_rarach' ? '#F97316' : '#262626',
                  size: 3,
                });
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
              engineRef.current.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 70,
                vy: (Math.random() - 0.5) * 70,
                life: 0.25,
                color: Math.random() < 0.5 ? '#F97316' : '#FDE047',
                size: 3,
              });
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
                engineRef.current.particles.push({
                  x: this.x,
                  y: this.y,
                  vx: (Math.random() - 0.5) * 40,
                  vy: (Math.random() - 0.5) * 40,
                  life: 0.2,
                  color: this.id === 'ropucha' ? '#15803D' : '#60A5FA',
                  size: 2.5,
                });
              }
            }
          }
        }

        // 5. KOSTLIVEC ZE SVATÉHO JIŘÍ / KRVAVÝ KOSTLIVEC (skeleton / krvavy_kostlivec)
        else if (this.id === 'skeleton' || this.id === 'krvavy_kostlivec') {
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
              this.specialCd = 2.4;
            }
          } else {
            if (distToPlayer < 78 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.32;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 6. KOSTLIVEC S KOSOU (skeleton_scythe) - Seknutí kosou & vlnový oblouk
        else if (this.id === 'skeleton_scythe') {
          const isLvl1 = (engineRef.current.activeLevelId || 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.6;
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
                  player.takeDamage(this.damage, 'physical');
                  engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'SEKNUTÍ KOSOU! 🌾', COLORS.bone, true));
                }
              }
            }
          } else {
            if (distToPlayer < 140 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.42;
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
          const isLvl1 = (engineRef.current.activeLevelId || 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.2;
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
                  player.takeDamage(this.damage, 'magic');
                }
              }
            }
          } else {
            if (!isLvl1 || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 320) {
                this.aiState = 'windup';
                this.aiTimer = 0.35;
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
          const isLvl1 = (engineRef.current.activeLevelId || 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.6;
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
                  player.takeDamage(this.damage, 'blunt');
                  engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'ÚDER LOPATOU! 🪦', COLORS.grey, true));
                }
              }
            }
          } else {
            if (!isLvl1 || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 300) {
                this.aiState = 'windup';
                this.aiTimer = 0.4;
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
              this.specialCd = 4.8;
              sound.heavyHit();
              engineRef.current.texts.push(new DamageText(this.x, this.y - 45, 'DUPOT! 💥', COLORS.ink, true));
              for (let i = 0; i < 16; i++) {
                const ang = (i / 16) * Math.PI * 2;
                engineRef.current.particles.push({
                  x: this.x + Math.cos(ang) * 20,
                  y: this.y + Math.sin(ang) * 20,
                  vx: Math.cos(ang) * 160,
                  vy: Math.sin(ang) * 160,
                  life: 0.45,
                  color: '#78350F',
                  size: 5,
                });
              }
              if (distToPlayer < 125) {
                player.takeDamage(22, 'blunt');
                player.x += Math.cos(dirToPlayer) * 45;
                player.y += Math.sin(dirToPlayer) * 45;
              }
            }
          } else {
            if (distToPlayer < 110 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.5;
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
              engineRef.current.particles.push({
                x: this.x + (Math.random() - 0.5) * 12,
                y: this.y - 10 + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 20,
                vy: -Math.random() * 30,
                life: 0.35,
                color: '#EF4444',
                size: 3,
              });
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
              this.specialCd = 3.8 + Math.random() * 2.0;
            }
          } else {
            if (this.specialCd <= 0 && distToPlayer < 280) {
              this.aiState = 'windup';
              this.aiTimer = 0.5;
              this.chargeDirX = dirToPlayer;
              this.vx = 0;
              this.vy = 0;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 11. BAHENNÍ VODNÍČEK (vodnicek) - Hází mazlavé leknínové bahno (v 1. úrovni nestřílí!)
        else if (this.id === 'vodnicek') {
          const isLvl1 = (engineRef.current.activeLevelId || 1) === 1;
          if (this.aiState === 'windup') {
            this.vx = 0;
            this.vy = 0;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.4;
              sound.splash();
              if (!isLvl1 || this.isBoss) {
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
                // V 1. levelu střílí jen bossové – vodníček pouze šplíchne zblízka
                if (distToPlayer < 70) {
                  player.takeDamage(Math.round(this.damage * 0.65), 'nature');
                  engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'ŠPLÍCH! 💧', '#38BDF8', true));
                }
              }
            }
          } else {
            if (!isLvl1 || this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 290) {
                this.aiState = 'windup';
                this.aiTimer = 0.35;
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
            this.puddleCd = 3.5;
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
            this.specialCd = 8.5;
            sound.splash();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 45, 'ŽABÍ POMOCNÍCI! 🐸', '#38BDF8', true));
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
          if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.8;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.8;
            if (Math.random() < 0.4) {
              engineRef.current.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                life: 0.35,
                color: '#E2E8F0',
                size: 3.5,
              });
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'circle';
              this.specialCd = 4.2;
              this.orbitRadius = 180 + Math.random() * 60;
            }
          } else {
            if (this.specialCd <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.85;
              this.chargeDirX = dirToPlayer;
              sound.freeze();
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

          if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * currentSpd * 2.5;
            this.vy = Math.sin(this.chargeDirX) * currentSpd * 2.5;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.0;
            }
          } else {
            if (distToPlayer < 160 && this.specialCd <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.32;
              this.chargeDirX = dirToPlayer;
              sound.slash();
            } else {
              this.vx = Math.cos(dirToPlayer) * currentSpd;
              this.vy = Math.sin(dirToPlayer) * currentSpd;
            }
          }
        }

        // 15. BEZHLAVÝ RYTÍŘ (bezhlavy_rytir) - Odražená hlava se vrací & těžký výpad čepelí
        else if (this.id === 'bezhlavy_rytir') {
          if (this.aiState === 'charge') {
            const chargeSpd = this.chargeSpeed || (this.enraged ? 330 : 260);
            this.vx = Math.cos(this.chargeDirX) * chargeSpd;
            this.vy = Math.sin(this.chargeDirX) * chargeSpd;
            if (Math.random() < 0.35) {
              engineRef.current.particles.push({
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + this.radius * 0.5,
                vx: (Math.random() - 0.5) * 50,
                vy: -Math.random() * 30,
                life: 0.35,
                color: '#94A3B8',
                size: 3.5,
              });
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
            }
          } else {
            if (!this.isBoss) {
              if (this.specialCd <= 0 && distToPlayer < 360 && distToPlayer >= 180) {
                this.specialCd = 6.0;
                sound.roar();
                engineRef.current.projectiles.push({
                  x: this.x,
                  y: this.y,
                  vx: Math.cos(dirToPlayer) * 280,
                  vy: Math.sin(dirToPlayer) * 280,
                  angle: dirToPlayer,
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
              } else if (this.specialCd <= 0 && distToPlayer < 180) {
                this.aiState = 'charge';
                this.aiTimer = 0.65;
                this.chargeDirX = dirToPlayer;
                this.chargeSpeed = 260;
                this.specialCd = 5.0;
                sound.slash();
                engineRef.current.texts.push(new DamageText(this.x, this.y - 50, 'VÝPAD ČEPELÍ! ⚔️', COLORS.red, true));
                this.vx = Math.cos(dirToPlayer) * this.chargeSpeed;
                this.vy = Math.sin(dirToPlayer) * this.chargeSpeed;
              }
            }
            this.vx = Math.cos(dirToPlayer) * spd;
            this.vy = Math.sin(dirToPlayer) * spd;
          }
        }

        // 16. ZLOMYSLNÝ SNĚHULÁK (snehulak) - Mrazivé kutálení (rolling snowball dash)
        else if (this.id === 'snehulak') {
          if (this.aiState === 'charge') {
            this.vx = Math.cos(this.chargeDirX) * spd * 2.2;
            this.vy = Math.sin(this.chargeDirX) * spd * 2.2;
            if (Math.random() < 0.3) {
              engineRef.current.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.3,
                color: '#FFFFFF',
                size: 4,
              });
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.2;
            }
          } else {
            if (distToPlayer < 240 && this.specialCd <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.9;
              this.chargeDirX = dirToPlayer;
              sound.freeze();
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
              this.specialCd = 4.0;
              sound.slash();
              if (distToPlayer < 135) {
                player.takeDamage(this.damage, 'physical');
                player.x += Math.cos(dirToPlayer) * 55;
                player.y += Math.sin(dirToPlayer) * 55;
                engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'ŠLEHNUTÍ ŘETĚZEM! ⛓️', COLORS.red, true));
              }
            }
          } else {
            if (distToPlayer < 125 && this.specialCd <= 0) {
              this.aiState = 'windup';
              this.aiTimer = 0.4;
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
              engineRef.current.particles.push({
                x: this.x + (Math.random() - 0.5) * 22,
                y: this.y + this.radius * 0.7,
                vx: -Math.cos(this.chargeDirX) * (50 + Math.random() * 70),
                vy: -Math.sin(this.chargeDirX) * (50 + Math.random() * 70),
                life: 0.35,
                color: Math.random() < 0.5 ? '#F97316' : '#EF4444',
                size: 4,
              });
            }
            if (this.aiTimer <= 0) {
              this.aiState = 'charge';
              this.aiTimer = this.isBoss ? (this.enraged ? 1.05 : 0.9) : 0.75;
              this.chargeSpeed = this.chargeSpeed || (this.isBoss ? (this.enraged ? 560 : 490) : 440);
              sound.slash();
              sound.roar();
              engineRef.current.texts.push(new DamageText(this.x, this.y - 50, 'PEKELNÝ VÝPAD! 🔱💨', COLORS.mustard, true));
            }
          } else if (this.aiState === 'charge') {
            const chargeSpd = this.chargeSpeed || (this.isBoss ? (this.enraged ? 560 : 490) : 440);
            this.vx = Math.cos(this.chargeDirX) * chargeSpd;
            this.vy = Math.sin(this.chargeDirX) * chargeSpd;

            for (let i = 0; i < 2; i++) {
              engineRef.current.particles.push({
                x: this.x - Math.cos(this.chargeDirX) * 20 + (Math.random() - 0.5) * 16,
                y: this.y + this.radius * 0.4 + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                life: 0.45,
                color: Math.random() < 0.4 ? '#DC2626' : Math.random() < 0.7 ? '#F97316' : '#FEF08A',
                size: 5,
              });
            }

            if (this.aiTimer <= 0) {
              this.aiState = 'brake';
              this.aiTimer = 0.4;
              this.vx *= 0.25;
              this.vy *= 0.25;
              this.specialCd = this.isBoss ? (this.enraged ? 4.5 : 6.5) : 5.5;
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
              this.aiTimer = 0.55;
              this.chargeDirX = dirToPlayer;
              this.chargeSpeed = 440;
              this.vx = 0;
              this.vy = 0;
              sound.roar();
              engineRef.current.texts.push(new DamageText(this.x, this.y - 50, 'DUSOT KOPYT! 🐂🔥', '#EF4444', true));
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 20. PŮLNOČNÍ HEJKAL (hejkal) - Hromové zahejkání & dubilka
        else if (this.id === 'hejkal') {
          if (!this.isBoss && this.specialCd <= 0) {
            this.specialCd = 7.0;
            sound.roar();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 50, 'HÉÉÉ-J! 🌲🔊', '#22C55E', true));
            const baseAng = dirToPlayer;
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
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 21. SKALNÍ OBR (obr) - Valící se balvan
        else if (this.id === 'obr') {
          if (!this.isBoss && this.specialCd <= 0 && distToPlayer > 160) {
            this.specialCd = 6.5;
            sound.hit();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 45, 'VALÍCÍ SE BALVAN! 🪨', '#71717A', true));
            engineRef.current.projectiles.push({
              x: this.x,
              y: this.y,
              vx: Math.cos(dirToPlayer) * 190,
              vy: Math.sin(dirToPlayer) * 190,
              angle: dirToPlayer,
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
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 22. PROKLETÝ MLYNÁŘ (mlynar) - Mlýnský kámen
        else if (this.id === 'mlynar') {
          if (!this.isBoss && this.specialCd <= 0 && distToPlayer > 150) {
            this.specialCd = 6.0;
            sound.slash();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 40, 'MLÝNSKÝ KÁMEN! ⚙️', COLORS.grey, true));
            engineRef.current.projectiles.push({
              x: this.x,
              y: this.y,
              vx: Math.cos(dirToPlayer) * 230,
              vy: Math.sin(dirToPlayer) * 230,
              angle: dirToPlayer,
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
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 23. TŘÍHLAVÝ DRAK (drak) - Pohyb, kousnutí a ohnivý dračí dech
        else if (this.id === 'drak') {
          if (this.isBoss) {
            // Close range dragon bite & claw swipe
            if (distToPlayer < 135 && this.specialCd <= 0) {
              this.specialCd = 2.8;
              sound.heavyHit();
              sound.slash();
              engineRef.current.texts.push(new DamageText(this.x, this.y - 65, 'DRAČÍ KRAFNUTÍ! 🐉🦷', '#DC2626', true));
              player.takeDamage(this.enraged ? 36 : 28, 'physical');
              player.x += Math.cos(dirToPlayer) * 55;
              player.y += Math.sin(dirToPlayer) * 55;
            }
          } else if (this.specialCd <= 0) {
            this.specialCd = 5.5;
            sound.roar();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 55, 'DRAČÍ PLAMEN! 🔥', '#DC2626', true));
            for (let i = 0; i < 4; i++) {
              const ang = dirToPlayer - 0.3 + i * 0.2;
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
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 24. ZBOJNÍK / OBRNĚNÝ ZBOJNÍK (zbojnik / obrneny_zbojnik) - Rychlý výpad z úkrytu
        else if (this.id === 'zbojnik' || this.id === 'obrneny_zbojnik') {
          if (this.aiState === 'charge') {
            const lungeSpd = spd * 2.2;
            this.vx = Math.cos(this.chargeDirX) * lungeSpd;
            this.vy = Math.sin(this.chargeDirX) * lungeSpd;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 3.5;
            }
          } else {
            if (distToPlayer < 175 && this.specialCd <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.35;
              this.chargeDirX = dirToPlayer;
              sound.slash();
              const lungeSpd = spd * 2.2;
              this.vx = Math.cos(dirToPlayer) * lungeSpd;
              this.vy = Math.sin(dirToPlayer) * lungeSpd;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 25. BÍLÁ PANÍ (bila_pani) - Přízračný plavný let & náhlé zjevení
        else if (this.id === 'bila_pani') {
          const wave = Math.sin(this.animTime * 2.8) * 0.45;
          if (distToPlayer < 240 && this.specialCd <= 0) {
            this.specialCd = 5.0;
            const stepAng = dirToPlayer + (Math.random() - 0.5) * 0.35;
            this.x += Math.cos(stepAng) * 75;
            this.y += Math.sin(stepAng) * 75;
            sound.smokePuff();
            for (let i = 0; i < 8; i++) {
              engineRef.current.particles.push({
                x: this.x + (Math.random() - 0.5) * 25,
                y: this.y + (Math.random() - 0.5) * 25,
                vx: (Math.random() - 0.5) * 35,
                vy: (Math.random() - 0.5) * 35,
                life: 0.45,
                color: 'rgba(240, 249, 255, 0.85)',
                size: 3.5,
              });
            }
          }
          this.vx = Math.cos(dirToPlayer + wave) * spd;
          this.vy = Math.sin(dirToPlayer + wave) * spd;
        }

        // 26. NOČNÍ MŮRA (nocni_mura) - Rychlý přepad ze tmy
        else if (this.id === 'nocni_mura') {
          if (this.aiState === 'charge') {
            const rushSpd = spd * 2.1;
            this.vx = Math.cos(this.chargeDirX) * rushSpd;
            this.vy = Math.sin(this.chargeDirX) * rushSpd;
            if (this.aiTimer <= 0) {
              this.aiState = 'idle';
              this.specialCd = 4.0;
            }
          } else {
            if (distToPlayer < 220 && this.specialCd <= 0) {
              this.aiState = 'charge';
              this.aiTimer = 0.4;
              this.chargeDirX = dirToPlayer;
              sound.roar();
              const rushSpd = spd * 2.1;
              this.vx = Math.cos(dirToPlayer) * rushSpd;
              this.vy = Math.sin(dirToPlayer) * rushSpd;
            } else {
              this.vx = Math.cos(dirToPlayer) * spd;
              this.vy = Math.sin(dirToPlayer) * spd;
            }
          }
        }

        // 27. KLEKÁNICE (klekanice) - Šlehnutí pytlem & temný chlad
        else if (this.id === 'klekanice') {
          if (distToPlayer < 135 && this.specialCd <= 0) {
            this.specialCd = 4.5;
            sound.heavyHit();
            engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'JUTOVÝ PYTEL! 🎒', '#A16207', true));
            player.takeDamage(this.damage, 'blunt');
            player.slowTimer = Math.max(player.slowTimer || 0, 1.8);
            player.x += Math.cos(dirToPlayer) * 45;
            player.y += Math.sin(dirToPlayer) * 45;
          }
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 28. ZBROJNOŠ (zbrojnoš) - Úder kovaným štítem
        else if (this.id === 'zbrojnos') {
          if (distToPlayer < 120 && this.specialCd <= 0) {
            this.specialCd = 4.0;
            sound.heavyHit();
            engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'ÚDER ŠTÍTEM! 🛡️', '#64748B', true));
            player.takeDamage(Math.round(this.damage * 0.8), 'physical');
            player.x += Math.cos(dirToPlayer) * 50;
            player.y += Math.sin(dirToPlayer) * 50;
          }
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 29. DUCH DŘEVORUBCE (drevorubec) - Silný sek širočinou
        else if (this.id === 'drevorubec') {
          if (distToPlayer < 95 && this.specialCd <= 0) {
            this.specialCd = 3.6;
            sound.slash();
            engineRef.current.texts.push(new DamageText(player.x, player.y - 45, 'SEK SEKEROU! 🪓', '#78350F', true));
            player.takeDamage(this.damage, 'physical');
          }
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
        }

        // 30. OHNIVÝ RARACH (ohnivy_muz) - Žhavé jiskry z pece
        else if (this.id === 'ohnivy_muz') {
          if (this.specialCd <= 0 && distToPlayer < 300) {
            this.specialCd = 4.5;
            sound.slash();
            engineRef.current.projectiles.push({
              x: this.x,
              y: this.y,
              vx: Math.cos(dirToPlayer) * 220,
              vy: Math.sin(dirToPlayer) * 220,
              angle: dirToPlayer,
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
          this.vx = Math.cos(dirToPlayer) * spd;
          this.vy = Math.sin(dirToPlayer) * spd;
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

        this.x += (this.vx + this.kbx) * dt;
        this.y += (this.vy + this.kby) * dt;
      },

      takeDamage(amount: number, type: string, kbx: number, kby: number) {
        if (this.isDefeated) return;
        let finalDmg = amount * this.getDamageTakenMultiplier();
        if (this.soaked) finalDmg *= 1.45;
        finalDmg += (metaRef.current.forgeLevel || 0) * 2;

        this.hp -= finalDmg;
        this.hitFlashTimer = 0.12;

        // Damage numbers displayed for all weapon types
        if (Math.floor(finalDmg) >= 1) {
          if (type === 'food') {
            engineRef.current.texts.push(
              new DamageText(this.x, this.y - 25, `${Math.floor(finalDmg)} 🥐`, '#F59E0B')
            );
          } else {
            engineRef.current.texts.push(
              new DamageText(this.x, this.y - 25, Math.floor(finalDmg).toString(), COLORS.white, this.soaked)
            );
          }
        }

        // Food type weapons like Buchta don't cause knockback
        if (type !== 'food' && !this.knockbackImmune && (this.knockbackResistance ?? 0) < 1) {
          const poiseFactor = 1 - this.poiseResist;
          const resistanceFactor = 1 - Math.max(0, Math.min(1, this.knockbackResistance ?? 0));
          const kbDamp = this.isMiniboss ? 0.25 : 1.0;
          this.kbx = kbx * poiseFactor * resistanceFactor * kbDamp;
          this.kby = kby * poiseFactor * resistanceFactor * kbDamp;
        } else {
          this.kbx = 0;
          this.kby = 0;
        }

        if (this.hp <= 0 && !this.isDefeated) {
          this.isDefeated = true;
          if (type === 'food') {
            this.defeatedByFood = true;
            this.foodDefeatTimer = 0;
            this.panicked = false;
            sound.snack();
            engineRef.current.texts.push(new DamageText(this.x, this.y - 32, 'Usmířen! 🥐✨', '#D97706', true));
          } else {
            this.panicked = true;
            engineRef.current.texts.push(new DamageText(this.x, this.y - 32, 'Zahnán! 💨', COLORS.mustard, true));
          }
          const eng = engineRef.current;

          // Helper to spawn drops with natural radial spray and velocity
          const spawnScatterDrop = (
            dropType: string,
            opts: { value?: number; radius?: number; speed?: number; angle?: number; text?: string; textColor?: string } = {}
          ) => {
            const angle = opts.angle ?? Math.random() * Math.PI * 2;
            const burstSpeed = opts.speed ?? (55 + Math.random() * 85);
            const radius = opts.radius ?? (
              dropType === 'chest' ? 25 :
              dropType === 'soul' ? 14 :
              dropType === 'potion' ? 12 :
              dropType === 'bread' ? 10 :
              (opts.value && opts.value >= 15 ? 12 : opts.value && opts.value >= 5 ? 10 : 8)
            );
            eng.drops.push({
              type: dropType,
              value: opts.value,
              x: this.x + Math.cos(angle) * 8,
              y: this.y + Math.sin(angle) * 8,
              vx: Math.cos(angle) * burstSpeed,
              vy: Math.sin(angle) * burstSpeed,
              radius,
              time: Math.random() * 6.28,
            });
            if (opts.text) {
              eng.texts.push(new DamageText(this.x, this.y - 45, opts.text, opts.textColor || COLORS.mustard, true));
            }
          };

          const rawPt = ENEMY_POINTS[this.id] ?? Math.max(12, Math.floor((this.maxHp || 40) * 0.38));
          // Natural organic variance (±15%) so points don't feel like rigid clockwork
          const variance = 0.85 + Math.random() * 0.30;
          const pt = Math.max(6, Math.round(rawPt * variance));

          const isWater = this.category === 'water';
          const isFields = this.category === 'fields';
          const isUndead = this.category === 'undead';
          const isDemons = this.category === 'demons';
          const isFrost = this.category === 'frost';
          const isShadows = this.category === 'shadows';
          const isSwarms = this.category === 'swarms';
          const isBoss = this.category === 'bosses' || this.isBoss || this.isMiniboss || (this.maxHp || 0) >= 1000;

          // Thematic category affinities & multipliers
          const chestMult = isBoss ? 3.0 : isDemons ? 1.4 : isUndead ? 1.25 : 1.0;
          const potionMult = isWater ? 1.6 : isFields ? 1.3 : isBoss ? 2.0 : 1.0;
          const breadMult = isFields ? 2.0 : isFrost ? 1.5 : isSwarms ? 1.2 : 0.9;
          const soulMult = isWater ? 2.5 : isShadows ? 2.0 : isUndead ? 1.4 : 0.5;
          const coinMult = isUndead ? 1.8 : isDemons ? 1.6 : isFrost ? 1.3 : isBoss ? 2.5 : 1.0;

          eng.pointsChest += Math.round(pt * chestMult);
          eng.pointsPotion += Math.round(pt * potionMult);
          eng.pointsBread += Math.round(pt * breadMult);
          eng.pointsCoin += Math.round(pt * coinMult);
          if (isWater || isShadows || isUndead || isBoss || this.defeatedByFood) {
            eng.pointsSoul += Math.round(pt * soulMult);
          }

          // 1. Miniboss & Boss celebration loot cascade
          if (this.isMiniboss) {
            sound.chest();
            spawnScatterDrop('chest', { speed: 85, text: '🎁 POKLAD MINIBOSSE!', textColor: COLORS.mustard });
            for (let i = 0; i < 5; i++) {
              spawnScatterDrop('coin', { value: 5, speed: 70 + i * 20 });
            }
            spawnScatterDrop('coin', { value: 25, speed: 120, text: 'Zlatý tolar! +25', textColor: COLORS.mustard });
            spawnScatterDrop('potion', { speed: 95, text: 'Čerstvá jitrnice!', textColor: COLORS.green });
            spawnScatterDrop('bread', { speed: 80, text: 'Šťavnatá hruška! +15 Kuráž', textColor: '#84CC16' });
            spawnScatterDrop('soul', { speed: 105, text: 'Mocná dušička! 🏺', textColor: '#38BDF8' });
            for (let i = 0; i < 24; i++) {
              eng.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 0.8,
                color: i % 2 === 0 ? '#F59E0B' : '#FDE047',
                size: 5,
              });
            }
            eng.texts.push(new DamageText(this.x, this.y - 70, '👑 POKLAD MINIBOSSE!', COLORS.mustard, true));
          } else if (isBoss) {
            sound.chest();
            spawnScatterDrop('potion', { speed: 110, text: 'ZABIJAČKOVÁ JITRNICE! +30 Kuráž', textColor: COLORS.green });
            spawnScatterDrop('bread', { speed: 90, text: 'ŠŤAVNATÁ HRUŠKA! +15 Kuráž', textColor: '#84CC16' });
            spawnScatterDrop('soul', { speed: 120, text: 'DUŠIČKA OSVOBOZENA!', textColor: '#38BDF8' });
            spawnScatterDrop('coin', { value: 25, speed: 130, text: 'ZLATÝ TOLAR!', textColor: COLORS.mustard });
            spawnScatterDrop('coin', { value: 10, speed: 105 });
            spawnScatterDrop('coin', { value: 10, speed: 85 });
            spawnScatterDrop('coin', { value: 5, speed: 70 });
            eng.texts.push(new DamageText(this.x, this.y - 70, '👑 POKLAD VLÁDCE BUBÁKŮ!', COLORS.mustard, true));
          }

          // 2. Food pacification extra flavor & peaceful rewards
          if (this.defeatedByFood) {
            if (Math.random() < 0.28) {
              spawnScatterDrop('bread', { speed: 65, text: 'Sladká hruška 🍐', textColor: '#84CC16' });
            }
            if (Math.random() < 0.16 || isWater) {
              spawnScatterDrop('soul', { speed: 85, text: 'Vděčná dušička 🕊️', textColor: '#38BDF8' });
            }
            const gratefulVal = Math.random() < 0.35 ? 5 : (1 + Math.floor(Math.random() * 3));
            spawnScatterDrop('coin', { value: gratefulVal, speed: 75 });
          }

          // 3. Direct surprise / lucky drops (instant chance on kill, scaled by theme)
          if (!isBoss) {
            // Surprise bread / snack
            const breadChance = isFields ? 0.08 : isFrost ? 0.06 : 0.035;
            if (Math.random() < breadChance) {
              spawnScatterDrop('bread', { speed: 65 });
            }

            // Surprise jitrnice balm
            const potionChance = isWater ? 0.045 : ((this.maxHp || 0) >= 120 ? 0.035 : 0.015);
            if (Math.random() < potionChance) {
              spawnScatterDrop('potion', { speed: 75, text: 'Čerstvá jitrnice!', textColor: COLORS.green });
            }

            // Surprise soul jar
            const soulChance = isWater ? 0.07 : isShadows ? 0.05 : isUndead ? 0.03 : 0.01;
            if (Math.random() < soulChance) {
              spawnScatterDrop('soul', { speed: 85, text: 'Zbloudilá dušička!', textColor: '#38BDF8' });
            }

            // Surprise coin burst from enemy pouch
            const coinBonusChance = isUndead ? 0.32 : isDemons ? 0.30 : 0.18;
            if (Math.random() < coinBonusChance) {
              const rollDenom = Math.random();
              let coinVal = 1;
              let coinTxt: string | undefined = undefined;
              if (rollDenom < 0.08 || (isDemons && rollDenom < 0.16)) {
                coinVal = 15 + Math.floor(Math.random() * 10);
                coinTxt = 'Zlatý tolar!';
              } else if (rollDenom < 0.38 || (isUndead && rollDenom < 0.55)) {
                coinVal = 5 + Math.floor(Math.random() * 5);
              } else {
                coinVal = 1 + Math.floor(Math.random() * 2);
              }
              spawnScatterDrop('coin', { value: coinVal, speed: 70 + Math.random() * 50, text: coinTxt });
            }
          }

          // 4. Guaranteed threshold drops with dynamic scatter & multi-coin breakdown
          const chestThreshold = Math.max(50, DROP_THRESHOLDS.chest - 20 * (metaRef.current.undeadLevel || 0));
          if (eng.pointsChest >= chestThreshold) {
            eng.pointsChest -= chestThreshold;
            spawnScatterDrop('chest', { speed: 45, text: `POKLAD (${chestThreshold} BODŮ)!`, textColor: COLORS.mustard });
            sound.chest();
          }
          if (eng.pointsPotion >= DROP_THRESHOLDS.potion) {
            eng.pointsPotion -= DROP_THRESHOLDS.potion;
            spawnScatterDrop('potion', { speed: 60 });
          }
          if (eng.pointsBread >= DROP_THRESHOLDS.bread) {
            eng.pointsBread -= DROP_THRESHOLDS.bread;
            spawnScatterDrop('bread', { speed: 60 });
          }
          if (eng.pointsSoul >= DROP_THRESHOLDS.soul) {
            eng.pointsSoul -= DROP_THRESHOLDS.soul;
            spawnScatterDrop('soul', { speed: 70 });
          }
          if (eng.pointsCoin >= DROP_THRESHOLDS.coin) {
            let v = Math.floor(eng.pointsCoin / DROP_THRESHOLDS.coin);
            eng.pointsCoin %= DROP_THRESHOLDS.coin;
            if (Math.random() < 0.06 * (metaRef.current.verminLevel || 0)) {
              v *= 2;
            }
            let remaining = v;
            const coinsToSpawn: number[] = [];
            while (remaining > 0) {
              if (remaining >= 15 && Math.random() < 0.70) {
                const tVal = Math.min(25, remaining);
                coinsToSpawn.push(tVal);
                remaining -= tVal;
              } else if (remaining >= 5 && Math.random() < 0.75) {
                const gVal = Math.min(10, remaining >= 10 ? (Math.random() < 0.5 ? 10 : 5) : 5);
                coinsToSpawn.push(gVal);
                remaining -= gVal;
              } else {
                const cVal = Math.min(remaining, Math.max(1, Math.min(3, remaining)));
                coinsToSpawn.push(cVal);
                remaining -= cVal;
              }
              if (coinsToSpawn.length >= 7) {
                if (remaining > 0) coinsToSpawn[coinsToSpawn.length - 1] += remaining;
                break;
              }
            }
            for (const cVal of coinsToSpawn) {
              spawnScatterDrop('coin', { value: cVal, speed: 55 + Math.random() * 85 });
            }
          }

// Bestiary tracking & progressive sequential hunter unlocks
          const curMeta = metaRef.current;
          const updatedKills = { ...curMeta.bestiaryKills, [this.id]: (curMeta.bestiaryKills[this.id] || 0) + 1 };
          let nextMeta: MetaProgression = { ...curMeta, bestiaryKills: updatedKills };

          // 1. Sequential Hunter Progression: only active hunter collects kills!
          const activeHunterId = getActiveUnlockingHunter(curMeta);
          let announceName = '';
          if (activeHunterId) {
            const hDef = HUNTER_UNLOCKS[activeHunterId];
            if (hDef && hDef.targetEnemies.some((e) => e.id === this.id)) {
              const prevHunterCounts = curMeta.hunterKillCounts || {};
              const curHunterKills = {
                ...(prevHunterCounts[activeHunterId] || (activeHunterId === 'shepherd' ? curMeta.bestiaryKills || {} : {})),
              };
              curHunterKills[this.id] = (curHunterKills[this.id] || 0) + 1;

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
            engineRef.current.texts.push(new DamageText(this.x, this.y - 75, `🎉 ${announceName.toUpperCase()} ODEMČEN!`, COLORS.mustard, true));
            setUnlockNotice({
              title: `🎉 Odemčen nový lovec: ${announceName}!`,
              desc: `Nyní si ho můžete vybrat v hlavní nabídce pro novou výpravu.`,
            });
            setTimeout(() => setUnlockNotice(null), 5000);
          }

          // 2. Sequential Weapon Progression: only active weapon collects kills!
          const activeWeaponId = getActiveUnlockingWeapon(nextMeta);
          let announceWeaponName = '';
          if (activeWeaponId) {
            const wDef = WEAPON_UNLOCKS[activeWeaponId];
            if (wDef && wDef.targetEnemies.some((e) => e.id === this.id)) {
              const prevWeaponCounts = nextMeta.weaponKillCounts || {};
              const curWeaponKills = {
                ...(prevWeaponCounts[activeWeaponId] || (activeWeaponId === 'pitchfork' ? curMeta.bestiaryKills || {} : {})),
              };
              curWeaponKills[this.id] = (curWeaponKills[this.id] || 0) + 1;

              const nextWeaponCounts = {
                ...prevWeaponCounts,
                [activeWeaponId]: curWeaponKills,
              };
              nextMeta = { ...nextMeta, weaponKillCounts: nextWeaponCounts };

              const nextWeaponProg = getWeaponProgress(activeWeaponId, nextMeta);
              if (nextWeaponProg.isUnlocked) {
                const newlyUnlockedWeapons = {
                  ...(curMeta.unlockedWeapons || { buns: true, cane: true }),
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
            engineRef.current.texts.push(new DamageText(this.x, this.y - 85, `🎉 ZBRAŇ: ${announceWeaponName.toUpperCase()}`, COLORS.mustard, true));
            setUnlockNotice({
              title: `🎉 Odemčena nová zbraň: ${announceWeaponName}!`,
              desc: 'Tato zbraň se trvale přidala do výběru vylepšení při postupu na novou úroveň!',
            });
            setTimeout(() => setUnlockNotice(null), 5000);
          }

          // 3. Sequential Level Progression: track kills towards revealing / unlocking the next level!
          const activeLevelId = getActiveUnlockingLevel(nextMeta);
          let announceLevelName = '';
          if (activeLevelId) {
            const lDef = LEVEL_UNLOCKS[activeLevelId];
            if (lDef && lDef.targetEnemies.some((e) => e.id === this.id)) {
              const prevLevelCounts = nextMeta.levelKillCounts || {};
              const curLevelKills = {
                ...(prevLevelCounts[activeLevelId] || {}),
              };
              curLevelKills[this.id] = (curLevelKills[this.id] || 0) + 1;

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
            engineRef.current.texts.push(new DamageText(this.x, this.y - 95, `🎉 ${announceLevelName.toUpperCase()} ODEMČENA!`, COLORS.mustard, true));
            setUnlockNotice({
              title: `🎉 Odemčena nová výprava: ${announceLevelName}!`,
              desc: 'Tato úroveň je nyní otevřena v hlavní nabídce pro novou výpravu!',
            });
            setTimeout(() => setUnlockNotice(null), 5500);
          }

          saveMeta(nextMeta);

          engineRef.current.kills += 1;
          setRunStats((s) => ({ ...s, kills: engineRef.current.kills }));

          const isBossMonster = this.isBoss || this.isMiniboss || this.category === 'bosses';

          if (isBossMonster) {
            const remainingBoss = engineRef.current.enemies.find(
              (e) => (e.isBoss || e.isMiniboss) && !e.isDefeated && e !== this
            );
            if (remainingBoss) {
              setRunStats((s) => ({
                ...s,
                bossHpPct: Math.max(0, Math.min(100, (remainingBoss.hp / remainingBoss.maxHp) * 100)),
                bossTitle: remainingBoss.customBossTitle
                  ? `👑 ${remainingBoss.customBossTitle}`
                  : (remainingBoss.isMiniboss ? `👑 MINIBOSS: ${remainingBoss.name}` : remainingBoss.name),
              }));
            } else {
              setRunStats((s) => ({ ...s, bossHpPct: null, bossTitle: '' }));
            }

            sound.victory();
            sound.cheer();
            const defeatName = this.customBossTitle || stats.name;
            engineRef.current.texts.push(
              new DamageText(this.x, this.y - 60, `👑 ${defeatName.toUpperCase()} ZKLIDNĚN!`, COLORS.mustard, true)
            );
            if (this.isMiniboss) {
              engineRef.current.texts.push(
                new DamageText(this.x, this.y - 95, '+25 KREJCARŮ! 💰', '#FDE047', true)
              );
            }
            // Check if final boss of this level
            const curLvlId = engineRef.current.activeLevelId || 1;
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
        return Object.values(this.statusEffects).reduce((m: number, e: any) => m * (e.damageTakenMultiplier ?? 1), 1);
      },
      getDamageDealtMultiplier() {
        return Object.values(this.statusEffects).reduce((m: number, e: any) => m * (e.damageDealtMultiplier ?? 1), 1);
      },
      getMovementSpeedMultiplier() {
        return Object.values(this.statusEffects).reduce((m: number, e: any) => m * (e.movementSpeedMultiplier ?? 1), 1);
      },

      soak() {
        this.soaked = true;
        this.soakedTimer = 5.0;
      },

      chill(duration = 3.5) {
        this.chilled = true;
        this.chillTimer = duration;
      },

      draw(ctx: CanvasRenderingContext2D) {
        let didSaveAlpha = false;
        if (this.isDefeated) {
          const fadeProgress = Math.min(1, Math.max(0, (this.fleeTimer || this.foodDefeatTimer || 0) / 0.85));
          ctx.save();
          ctx.globalAlpha = Math.max(0.08, 1 - fadeProgress * 0.92);
          didSaveAlpha = true;
        }

        Lada.drawShadow(ctx, this.x, this.y, this.radius);

        // Ground Miniboss Aura (illuminating halo and rotating folklore radial notches)
        if (this.isMiniboss && !this.isDefeated) {
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

        if (this.calmTimer > 0 && !this.isDefeated) {
          Lada.drawHeart(ctx, this.x, this.y - this.radius - 22 - Math.sin(this.animTime * 4) * 3, 8, '#F4A6BF');
        }

        // Snacking state ("Ňam, ňam note")
        if ((this.snackTimer > 0 && !this.isDefeated) || (this.isDefeated && this.defeatedByFood)) {
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
        if (this.aiState === 'windup' && !this.isDefeated) {
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

        const scale = this.renderScale || 1.0;
        if (scale !== 1.0) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.scale(scale, scale);
          ctx.translate(-this.x, -this.y);
        }

        const isFleeing = this.panicked || (this.isDefeated && !this.defeatedByFood);

        if (this.id === 'cert') {
          Lada.drawCert(ctx, this.x, this.y, this.animTime, this.vx, isFleeing, this.isBoss, this.aiState === 'charge' || this.aiState === 'windup' || Math.abs(this.vx) > 300);
        } else if (this.id === 'hejkal') {
          Lada.drawHejkal(ctx, this.x, this.y, this.animTime, this.vx, isFleeing);
        } else if (this.id === 'obr') {
          Lada.drawObr(ctx, this.x, this.y, this.animTime, this.vx, isFleeing);
        } else if (this.id === 'mlynar') {
          Lada.drawMlynar(ctx, this.x, this.y, this.animTime, this.vx, isFleeing, this.hp <= this.maxHp * 0.5);
        } else if (this.id === 'meluzina') {
          Lada.drawMeluzina(ctx, this.x, this.y, this.animTime, this.vx, isFleeing);
        } else if (this.id === 'polednice') {
          Lada.drawPolednice(ctx, this.x, this.y, this.animTime, this.vx, isFleeing);
        } else if (this.id === 'klekanice') {
          Lada.drawKlekanice(ctx, this.x, this.y, this.animTime, this.vx, isFleeing);
        } else if (this.id === 'drak') {
          const attacks = {
            fire: engineRef.current.drakBreathTimer > (this.hp <= this.maxHp * 0.5 ? 3.0 : 5.0) ? 1 : 0,
            ice: engineRef.current.drakSnoreTimer > 3.6 && (this.enraged || this.hp <= this.maxHp * 0.5) ? 1 : 0,
            roar: engineRef.current.drakIcicleTimer > (this.hp <= this.maxHp * 0.5 ? 4.2 : 6.7) || engineRef.current.drakWingGustTimer > 7.2 ? 1 : 0,
          };
          Lada.drawDrak(ctx, this.x, this.y, this.animTime, this.vx, isFleeing, this.enraged || this.hp <= this.maxHp * 0.5, attacks);
        } else {
          drawEnemyRenderer(
            this.method,
            ctx,
            this.x,
            this.y,
            this.animTime,
            this.vx,
            isFleeing,
          );
        }

        const palette = this.palette || (ENEMIES[this.id]?.palette);
        if (palette) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          if (palette === 'soot') {
            ctx.fillStyle = 'rgba(25, 20, 18, 0.45)';
          } else if (palette === 'crimson') {
            ctx.fillStyle = 'rgba(185, 28, 28, 0.40)';
          } else if (palette === 'bog') {
            ctx.fillStyle = 'rgba(65, 95, 30, 0.38)';
          } else if (palette === 'steel') {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          }
          ctx.beginPath();
          ctx.arc(this.x, this.y - 5, this.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (palette === 'soot' && !this.isDefeated) {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(this.x + 4 * (this.vx < 0 ? -1 : 1), this.y - 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (palette === 'crimson' && !this.isDefeated) {
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(this.x + 3 * (this.vx < 0 ? -1 : 1), this.y - 14, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (this.soaked && !this.isDefeated) {
          ctx.fillStyle = 'rgba(58, 118, 168, 0.4)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        if (this.chilled && !this.isDefeated) {
          ctx.fillStyle = 'rgba(196, 225, 246, 0.45)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
          ctx.fill();
        }
        const pickleStatus = this.statusEffects?.pickle_sickness;
        if (pickleStatus && !this.isDefeated) {
          const pulse = 0.28 + Math.sin(this.animTime * 7) * 0.08;
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = 'rgba(101, 163, 13, ' + pulse + ')';
          ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          ctx.save();
          ctx.fillStyle = '#A3E635';
          ctx.globalAlpha = 0.8;
          for(let i=0;i<pickleStatus.stacks;i++){
            const a=this.animTime*2+i*Math.PI*2/3;
            ctx.beginPath();ctx.arc(this.x+Math.cos(a)*(this.radius+8),this.y-this.radius-4+Math.sin(a)*4,2.5,0,Math.PI*2);ctx.fill();
          }
          ctx.restore();
        }

        if (scale !== 1.0) {
          ctx.restore();
        }

        // Miniboss Overhead Crown Badge & Distinct Health Bar
        if (this.isMiniboss && !this.isDefeated) {
          ctx.save();
          const barWidth = Math.max(88, this.radius * 2.2);
          const barHeight = 8;
          const barX = this.x - barWidth / 2;
          const barY = this.y - this.radius * 1.5 - 14;

          // 1. Miniboss Title / Crown Badge
          const badgeTitle = this.customBossTitle || stats.name;
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

          // 2. Health Bar Background
          ctx.fillStyle = '#1C1917';
          ctx.fillRect(barX, barY, barWidth, barHeight);

          // Health Bar Fill
          const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));
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
          const hpText = `${Math.ceil(this.hp)} / ${this.maxHp} HP`;
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
  };

  // Manual trigger to immediately spawn current level's miniboss (available in pause menu for instant action/testing)
  const spawnMinibossNow = () => {
    const curLvlId = engineRef.current.activeLevelId || selectedLevelId || 1;
    const curLvl = GAME_LEVELS[curLvlId] || GAME_LEVELS[1];
    const player = engineRef.current.player;
    if (!player) return;

    const bossDef = !engineRef.current.miniBossSpawned ? curLvl.miniBoss : curLvl.midBoss;
    engineRef.current.miniBossSpawned = true;
    const ang = Math.random() * Math.PI * 2;
    const bossEnemy = createEnemyInstance(
      bossDef.id,
      player.x + Math.cos(ang) * 440,
      player.y + Math.sin(ang) * 440,
      bossDef.multiplier,
      false,
      true,
      bossDef.name
    );
    engineRef.current.enemies.push(bossEnemy);
    engineRef.current.texts.push(new DamageText(player.x, player.y - 50, `👑 ${bossDef.name}`, COLORS.mustard, true));
    setRunStats((s) => ({
      ...s,
      warningBanner: bossDef.warning,
      bossTitle: `👑 MINIBOSS: ${bossDef.name}`,
      bossHpPct: 100,
    }));
    sound.boss();
    setTimeout(() => setRunStats((s) => ({ ...s, warningBanner: '' })), 4500);
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

  // Helper to render hunter card with progressive spoil
  const renderHunterSelectCard = (
    prog: HunterProgress,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  ) => {
    const isUnlocked = prog.isUnlocked;

    return (
      <div
        key={prog.id}
        className={`char-card ${isUnlocked ? '' : 'char-card-locked'}`}
        onClick={() => {
          if (isUnlocked) {
            startGame(prog.id);
          } else {
            sound.hit();
            setSelectedHunterDetail(prog);
            if (prog.isQueued) {
              setUnlockNotice({
                title: `🔒 ${prog.spoiledName} je v pořadí!`,
                desc: `Tento lovec se začne odemykat teprve poté, co odemknete předchozího lovce (${prog.requiredHunterName}).`,
              });
            } else {
              setUnlockNotice({
                title: `🔒 ${prog.spoiledName} je uzamčen!`,
                desc: `Splněno ${prog.percent} % výzvy: ${prog.curCount} / ${prog.maxCount} zahnáno.`,
              });
            }
            setTimeout(() => setUnlockNotice(null), 4500);
          }
        }}
        title={isUnlocked ? `Zvolit lovce: ${HUNTER_UNLOCKS[prog.id].realName}` : 'Klikněte pro podrobnosti výzvy'}
      >
        <LadaCardCorners variant={isUnlocked ? 'default' : 'locked'} showBottomCorners={true} />
        <span className={isUnlocked ? 'char-card-unlocked-badge' : 'char-card-locked-badge'}>
          {isUnlocked ? '✅ Odemčeno' : prog.isQueued ? '🔒 V pořadí (0 %)' : `🔒 Zamčeno (${prog.percent} %)`}
        </span>
        <canvas ref={canvasRef} className="portrait-canvas" width={180} height={180} />
        <h3 style={{ fontSize: '1.42rem', margin: '4px 0 2px 0', minHeight: '36px' }}>
          {prog.spoiledName}
        </h3>
        <div>
          <span className={`hunter-tier-stamp tier-stamp-${prog.tier}`}>
            {prog.clueTag}
          </span>
        </div>

        <p style={{ fontWeight: 700, margin: '4px 0', fontSize: '0.84rem', lineHeight: 1.3, color: '#111111' }}>
          {prog.spoiledLore}
        </p>

        {/* Weapons and Ability hints */}
        <div className="hunter-clue-box">
          <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#111111' }}>
            🗡️ {prog.spoiledWeaponHint}
          </div>
          <div style={{ fontWeight: 900, fontSize: '0.8rem', marginTop: '2px', color: '#111111' }}>
            ⚡ {prog.spoiledAbilityHint}
          </div>
        </div>

        {/* Challenge progress bar for locked characters */}
        {!isUnlocked && (
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
            <div className="hunter-progress-ticks">
              <span className={`hunter-tick ${prog.percent >= 0 ? 'reached' : ''}`}>0%</span>
              <span className={`hunter-tick ${prog.percent >= 25 ? 'reached' : ''}`}>
                {prog.percent >= 25 ? '✓' : '🔒'} 25%
              </span>
              <span className={`hunter-tick ${prog.percent >= 50 ? 'reached' : ''}`}>
                {prog.percent >= 50 ? '✓' : '🔒'} 50%
              </span>
              <span className={`hunter-tick ${prog.percent >= 75 ? 'reached' : ''}`}>
                {prog.percent >= 75 ? '✓' : '🔒'} 75%
              </span>
              <span className={`hunter-tick ${prog.percent >= 100 ? 'reached' : ''}`}>
                {prog.percent >= 100 ? '✓' : '🔒'} 100%
              </span>
            </div>
            {prog.enemiesBreakdown.length > 0 && (
              <div className="hunter-enemy-pills">
                {prog.enemiesBreakdown.map((e) => (
                  <span key={e.id} className="hunter-enemy-pill" title={`${e.name}: ${e.count} zahnáno`}>
                    {e.icon} {e.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          {isUnlocked ? (
            <button className="lada-btn btn-small" style={{ width: '100%', fontSize: '0.95rem' }}>
              Vyrazit do noci ⚔️
            </button>
          ) : (
            <button
              className="lada-btn btn-small"
              style={{
                width: '100%',
                fontSize: '0.84rem',
                background: 'var(--wood-dark)',
                color: 'var(--parchment)',
                padding: '6px 8px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                sound.coin();
                setSelectedHunterDetail(prog);
              }}
            >
              {prog.isQueued ? `🔒 Čeká na: ${prog.requiredHunterName}` : `📜 Zobrazit výzvu (${prog.percent} %)`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <canvas
        id="gameCanvas"
        ref={canvasRef}
        onClick={() => {
          const cs = engineRef.current.cutscene;
          if (cs) {
            if (!cs.applied) {
              cs.t = Math.max(cs.t, cs.applyAt);
            } else {
              cs.t = cs.dur;
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

            {/* Kuráž = Lovcovo HP + Mobile Quick Pause Button */}
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
                  <span style={{ marginRight: '6px' }}>🦁</span>
                  KURÁŽ {Math.ceil(runStats.hp)} / {Math.ceil(runStats.maxHp)}
                </div>
              </div>
              <button
                className="hud-pause-btn"
                onClick={togglePause}
                title="Pozastavit hru [P / Esc]"
                aria-label="Pozastavit hru"
              >
                ⏸️
              </button>
            </div>

            {/* XP bar */}
            <div id="xp-container" className="bar-container">
              <div id="xp-fill" style={{ width: `${(runStats.xp / runStats.xpNeeded) * 100}%` }} />
              <div className="bar-text" id="level-text">
                <span style={{ marginRight: '6px' }}>🌾</span>
                ÚROVEŇ {runStats.level}
              </div>
            </div>

            {/* Stats row with Day/Night clock indicator */}
            <div id="stats-row">
              <div className="stats-clock-block">
                <span className="stats-clock-icon">{runStats.dayPhase.icon}</span>
                <div>
                  <div className="stats-clock-timer">{formatTimer(runStats.time)}</div>
                  <div className="stats-clock-phase">
                    {runStats.dayPhase.name}
                  </div>
                </div>
              </div>
              <span className="hud-stat-divider">🌿</span>
              <div id="coins-text" style={{ color: '#111111', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Krejcary: {runStats.coins} <KrejcarIcon size={18} />
              </div>
              <span className="hud-stat-divider">🌿</span>
              <div id="souls-text" style={{ color: '#1E40AF' }}>🏺 Dušičky: {runStats.souls}</div>
              <span className="hud-stat-divider">🌿</span>
              <div id="kills-text" style={{ color: '#7F1D1D' }}>Zklidněno: {runStats.kills} 🥖</div>
              <span className="hud-stat-divider">🌿</span>
              <div id="chest-progress-text" style={{ color: '#78350F' }} title={`Truhla s pokladem se objeví po každých ${DROP_THRESHOLDS.chest} bodech zahnadých nepřátel a po každém bossovi`}>
                🎁 Poklad: {runStats.chestProgress}/{DROP_THRESHOLDS.chest}
              </div>
            </div>

            {/* Boss Bar if boss spawned */}
            {runStats.bossHpPct !== null && (
              <div id="boss-bar-wrap">
                <div className="boss-title-text">
                  <span style={{ color: '#C53026' }}>👹</span> {runStats.bossTitle} <span style={{ color: '#C53026' }}>👹</span>
                </div>
                <div id="boss-bar-container">
                  <div id="boss-hp-fill" style={{ width: `${runStats.bossHpPct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Warning Banner */}
          {runStats.warningBanner && (
            <div id="boss-warning-banner">{runStats.warningBanner}</div>
          )}

          {/* Ultimate ability indicator button – skryto na dotykovém displeji a při aktivním dotykovém ovládání, kde bohatě stačí kruhové tlačítko */}
          {!touchEnabled && (
            <button
              id="ult-indicator"
              onClick={triggerUltimate}
              style={{
                backgroundColor: runStats.ultCd <= 0 ? 'var(--blood-red)' : 'var(--wood-light)',
                transform: runStats.ultCd <= 0 ? 'translateX(-50%) scale(1.05)' : 'translateX(-50%) scale(1)',
              }}
            >
              {runStats.ultCd <= 0
                ? (engineRef.current.player?.type === 'wanderer'
                    ? '🪵 POVĚSTNÁ SUKOVICE: PŘIPRAVENA! (MEZERNÍK / KLIK)'
                    : '⚡ SPECIÁLNÍ SCHOPNOST: PŘIPRAVENA! (MEZERNÍK / KLIK)')
                : `⚡ ${engineRef.current.player?.type === 'wanderer' ? 'Pověstná sukovice' : 'Speciální schopnost'}: ${Math.ceil(runStats.ultCd)} s`}
            </button>
          )}
        </div>
      )}

      {/* TOUCH CONTROLS */}
      {gameState === 'playing' && (
        <TouchControls
          enabled={touchEnabled}
          active={touchMoveRef.current.active}
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
            <LadaCardCorners variant="callout" />
            <BubakovCoverTitle />

            <div style={{ textAlign: 'center', margin: '6px 0 10px 0' }}>
              <LadaCartouche variant="ochre" size="md">
                🗺️ KROK 1 ZE 2: VÝBĚR VÝPRAVY
              </LadaCartouche>
            </div>

            {/* 6 PROGRESSIVE GAME LEVELS SELECTOR */}
            <div className="level-select-section" style={{ margin: '10px 0 16px 0' }}>
              <div className="level-grid">
                {([1, 2, 3, 4, 5, 6] as GameLevelId[]).map((lvlId) => {
                  const prog = levelProgress[lvlId];
                  const lvl = GAME_LEVELS[lvlId];
                  const isUnlocked = prog.isUnlocked;
                  const isSelected = selectedLevelId === lvlId;
                  const isCompleted = !!(meta.completedLevels && meta.completedLevels[lvlId]) ||
                    (lvlId === 1 && (meta.bestiaryKills?.cert || 0) >= 1) ||
                    (lvlId === 2 && (meta.bestiaryKills?.hejkal || 0) >= 1) ||
                    (lvlId === 3 && (meta.bestiaryKills?.obr || 0) >= 1) ||
                    (lvlId === 4 && (meta.bestiaryKills?.mlynar || 0) >= 1) ||
                    (lvlId === 5 && (meta.bestiaryKills?.bezhlavy_rytir || 0) >= 1) ||
                    (lvlId === 6 && (meta.bestiaryKills?.drak || 0) >= 1);

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
                            setUnlockNotice({
                              title: `🔒 ${prog.spoiledName} je v pořadí!`,
                              desc: `Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň (${prog.requiredLevelName}).`,
                            });
                          } else {
                            setUnlockNotice({
                              title: `🔒 ${prog.spoiledName} (${prog.percent} %)`,
                              desc: `Splněno ${prog.percent} % výzvy: ${prog.curCount} / ${prog.maxCount} zahnáno. Klikněte pro podrobnosti výzvy!`,
                            });
                          }
                          setTimeout(() => setUnlockNotice(null), 4500);
                        }
                      }}
                      title={isUnlocked ? (isSelected ? `Zvoleno: ${lvl.name} (klikněte pro výběr lovce)` : `Zvolit výpravu: ${lvl.name}`) : 'Klikněte pro podrobnosti výzvy a milníků'}
                    >
                      <LadaCardCorners
                        variant={isSelected ? 'selected' : isUnlocked ? 'default' : 'locked'}
                        showBottomCorners={true}
                      />
                      <div className="level-card-header">
                        <span className={`level-badge ${isSelected ? 'badge-selected' : isCompleted ? 'badge-completed' : isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                          {isSelected ? '⭐ Zvolená výprava' : isCompleted ? '✅ Pokořeno' : isUnlocked ? '🔓 Otevřeno' : prog.isQueued ? '🔒 V pořadí (0 %)' : `🔒 Zamčeno (${prog.percent} %)`}
                        </span>
                        <span className="level-theme-tag">{prog.spoiledIcon} {prog.spoiledBadge}</span>
                      </div>

                      <div className="level-title" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                        {prog.spoiledName}
                      </div>
                      <div className="level-subtitle" style={{ fontSize: '0.85rem', color: 'var(--wood-dark)', fontWeight: 800, minHeight: '32px' }}>
                        {prog.spoiledSubtitle}
                      </div>

                      <div>
                        <span className={`hunter-tier-stamp tier-stamp-${prog.tier}`} style={{ fontSize: '0.74rem', margin: '4px 0 6px 0' }}>
                          {prog.clueTag}
                        </span>
                      </div>

                      <div className="level-desc" style={{ fontSize: '0.84rem', lineHeight: 1.32, color: 'var(--ink)' }}>
                        {prog.spoiledDesc}
                      </div>

                      <div className="level-boss-preview" style={{ fontSize: '0.84rem', fontWeight: 800, margin: '6px 0' }}>
                        {prog.spoiledBossHint}
                      </div>

                      {/* Enemies preview tailored to milestone tier */}
                      <div className="level-enemies-preview">
                        {isUnlocked || prog.tier === 4 ? (
                          lvl.keyEnemies.map((e) => (
                            <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`}>
                              {e.icon} {e.name}
                            </span>
                          ))
                        ) : prog.tier === 3 ? (
                          <>
                            {lvl.keyEnemies.slice(0, 4).map((e) => (
                              <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`}>
                                {e.icon} {e.name}
                              </span>
                            ))}
                            <span className="level-enemy-tag" style={{ opacity: 0.7 }}>❓ ???</span>
                          </>
                        ) : prog.tier === 2 ? (
                          <>
                            {lvl.keyEnemies.slice(0, 3).map((e) => (
                              <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`}>
                                {e.icon} {e.name}
                              </span>
                            ))}
                            <span className="level-enemy-tag" style={{ opacity: 0.6 }}>❓ ???</span>
                            <span className="level-enemy-tag" style={{ opacity: 0.6 }}>❓ ???</span>
                          </>
                        ) : prog.tier === 1 ? (
                          <>
                            {lvl.keyEnemies.slice(0, 1).map((e) => (
                              <span key={e.id} className="level-enemy-tag" title={`${e.name} – ${e.role}`}>
                                {e.icon} {e.name}
                              </span>
                            ))}
                            <span className="level-enemy-tag" style={{ opacity: 0.55 }}>🌫️ Zahaleno v mlze</span>
                            <span className="level-enemy-tag" style={{ opacity: 0.55 }}>❓ ???</span>
                          </>
                        ) : (
                          <>
                            <span className="level-enemy-tag" style={{ opacity: 0.6 }}>🔒 Neznámé bytosti</span>
                            <span className="level-enemy-tag" style={{ opacity: 0.6 }}>❓ Skryto v mlze</span>
                          </>
                        )}
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
                            <span className={`hunter-tick ${prog.percent >= 25 ? 'reached' : ''}`}>
                              {prog.percent >= 25 ? '✓' : '🔒'} 25%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 50 ? 'reached' : ''}`}>
                              {prog.percent >= 50 ? '✓' : '🔒'} 50%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 75 ? 'reached' : ''}`}>
                              {prog.percent >= 75 ? '✓' : '🔒'} 75%
                            </span>
                            <span className={`hunter-tick ${prog.percent >= 100 ? 'reached' : ''}`}>
                              {prog.percent >= 100 ? '✓' : '🔒'} 100%
                            </span>
                          </div>
                          {prog.enemiesBreakdown.length > 0 && (
                            <div className="hunter-enemy-pills">
                              {prog.enemiesBreakdown.map((e) => (
                                <span key={e.id} className="hunter-enemy-pill" title={`${e.name}: ${e.count} zahnáno`}>
                                  {e.icon} {e.count}
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
                            📜 Prozkoumat stopy a milníky
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
                              {isSelected ? 'Pokračovat k lovci ➔' : 'Zvolit výpravu 🗺️'}
                            </button>
                            <button
                              className="tab-btn"
                              style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: 'auto' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.coin();
                                setSelectedLevelDetail(prog);
                              }}
                              title="Zobrazit kroniku a milníky této úrovně"
                            >
                              📜
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                  <span style={{ fontSize: '1.7rem' }}>{currentLevel.icon}</span>
                  <span>{currentLevel.name}</span>
                  <span style={{ fontSize: '0.9rem', color: '#78350F' }}>
                    ({currentLevel.shortTitle} • {currentLevel.season === 'winter' ? '❄️ Zima' : '🍂 Podzim'})
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>
                  🌾 {levelProgress[selectedLevelId]?.spoiledBossHint || `Hlavní noční nezbeda: ${currentLevel.finalBoss.name}`}
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
                Pokračovat k výběru lovce ➔
              </button>
            </div>

            {/* MAIN HUB TOOLBAR */}
            <div className="menu-hub-toolbar">
              <button
                className="lada-btn btn-small"
                style={{
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  boxShadow: '4px 4px 0px var(--ink)',
                }}
                onClick={() => {
                  sound.coin();
                  setIsTestModeOpen(true);
                }}
                title="Otevřít testovací mód: zvolte libovolného hrdinu, libovolnou úroveň a startovní zbraně včetně jejich levelů"
              >
                🧪 Testovací mód
              </button>
              <button
                className="lada-btn btn-small"
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  boxShadow: '4px 4px 0px var(--ink)',
                }}
                onClick={() => {
                  sound.hit();
                  setIsResetModalOpen(true);
                }}
                title="Vymazat veškerý postup (zamkne vše odemykatelné a vrátí upgrady na nulu)"
              >
                🗑️ Vymazat postup
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
                🎮 Ovládání hry
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                📖 Bestiář nočního venkova
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                🗡️ Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsPlanOpen(true)}>
                📜 Plán změn a kronika
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                onClick={() => setGameState('tavern')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  🏘️ Vesnice & Hospoda ({meta.krejcary} <KrejcarIcon size={16} />)
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
            <LadaCardCorners variant="callout" />
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
                    {currentLevel.name} <span style={{ fontSize: '0.82rem', color: '#78350F' }}>({currentLevel.shortTitle} • {currentLevel.season === 'winter' ? '❄️ Zima' : '🍂 Podzim'})</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#1D4ED8', textDecoration: 'underline', marginLeft: '6px' }}>
                  Změnit 🗺️
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '4px 0 16px 0' }}>
              <LadaCartouche variant="green" size="md">
                🏹 KROK 2 ZE 2: VÝBĚR LOVCE
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
              {/* Poutník - Výchozí odemčený lovec */}
              <div
                className="char-card"
                onClick={() => startGame('wanderer')}
                title="Poutník – připraven k výpravě"
              >
                <LadaCardCorners variant="default" showBottomCorners={true} />
                <span className="char-card-unlocked-badge">✅ Odemčeno</span>
                <canvas ref={wandererRef} className="portrait-canvas" width={180} height={180} />
                <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px 0' }}>Poutník</h3>
                <div>
                  <span className="hunter-tier-stamp tier-stamp-4">Výchozí vesnický lovec</span>
                </div>
                <p style={{ fontWeight: 700, margin: '4px 0', fontSize: '0.86rem', lineHeight: 1.3 }}>
                  Vysoká kuráž a dobrá nálada. Povidlové buchty a Osikový prut. Tulácký instinkt: +30 k poškození všech zbraní. Schopnost: Pověstná sukovice.
                </p>
                <div className="hunter-clue-box">
                  <div style={{ fontWeight: 800, fontSize: '0.78rem' }}>🗡️ Osikový prut & Povidlové buchty</div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', marginTop: '2px' }}>🪵 Schopnost: Pověstná sukovice (21 s)</div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <button className="lada-btn btn-small" style={{ width: '100%', fontSize: '0.95rem' }}>
                    Vyrazit do noci ⚔️
                  </button>
                </div>
              </div>

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
                ⬅️ Zpět k výběru výpravy
              </button>
              <button
                className="lada-btn btn-small"
                style={{
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  boxShadow: '4px 4px 0px var(--ink)',
                }}
                onClick={() => {
                  sound.coin();
                  setIsTestModeOpen(true);
                }}
                title="Otevřít testovací mód: zvolte libovolného hrdinu, libovolnou úroveň a startovní zbraně včetně jejich levelů"
              >
                🧪 Testovací mód
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
                🎮 Ovládání hry
              </button>
              <button className="lada-btn btn-small" onClick={() => setIsBestiaryOpen(true)}>
                📖 Bestiář nočního venkova
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                🗡️ Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: 'var(--mustard)', color: 'var(--ink)' }}
                onClick={() => setGameState('tavern')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  🏘️ Vesnice & Hospoda ({meta.krejcary} <KrejcarIcon size={16} />)
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
            <LadaCardCorners variant="callout" />
            <h1>⏸️ HRA POZASTAVENA</h1>
            <LadaBotanicalFlourish height={20} />
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FEF3C7', marginTop: '-4px' }}>
              Výprava je pozastavena klávesou <strong>[P]</strong>. Zkontrolujte svůj arzenál, posilněte se chlebem a nadechněte se!
            </p>

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
                    Lovec: {HUNTER_UNLOCKS[engineRef.current.player?.type as CharacterType || 'wanderer']?.realName || 'Poutník'}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#451A03', marginTop: '2px' }}>
                    {HUNTER_UNLOCKS[engineRef.current.player?.type as CharacterType || 'wanderer']?.realTitle || 'Vesnický poutník'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111111' }}>
                    {runStats.dayPhase.icon} {runStats.dayPhase.name}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#78350F' }}>
                    Čas přežití: {formatTimer(runStats.time)}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '2px dashed var(--ink)', margin: '10px 0', opacity: 0.3 }} />

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.95rem', fontWeight: 800, color: '#111111' }}>
                <span>🦁 Kuráž: <strong>{Math.max(0, Math.ceil(engineRef.current.player?.hp || 0))}</strong> / {engineRef.current.player?.maxHp || 150}</span>
                <span>⭐ Úroveň: <strong>{runStats.level}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><KrejcarIcon size={18} /> Krejcary: <strong>{runStats.coins}</strong></span>
                <span>🏺 Dušičky: <strong>{runStats.souls}</strong></span>
                <span>🌾 Chasníci: <strong>{runStats.chasniks}</strong></span>
                <span>🥖 Zklidněno: <strong>{runStats.kills}</strong></span>
              </div>
            </div>

            {/* Current weapons inventory */}
            <h3 style={{ margin: '14px 0 8px 0', textAlign: 'left', color: '#FEF3C7' }}>
              🗡️ Nesený arzenál a výbava lovce:
            </h3>

            <div className="pause-weapons-grid">
              {(engineRef.current.player?.weapons || []).map((w: any) => {
                const wDef = WEAPONS[w.id];
                if (!wDef) return null;
                const dmgMult = engineRef.current.player?.damageMultiplier || 1;
                const cooldownBonus = engineRef.current.player?.cooldownBonus ?? 0;
                const rankDef = getWeaponRankDef(w.id, w.level);
                const weaponCooldownBonus = rankDef?.cooldownReductionBonus ?? 0;
                const stats = getRankedWeaponStats(w.id, w.level, w);
                const playerCooldownBonus = cooldownBonus > 0 ? cooldownBonus : Math.max(0, ((engineRef.current.player?.cooldownMultiplier || 1) - 1) / 0.9);
                const estDmg = Math.round(wDef.baseDmg * stats.damageMult * dmgMult);
                const effectiveCd = Math.max(wDef.baseCd * 0.50, getEffectiveWeaponCooldown(wDef.baseCd, playerCooldownBonus, weaponCooldownBonus) * stats.cooldownMult).toFixed(2);
                const isCane = w.id === 'cane';
                const hasSoaked = isCane && engineRef.current.player?.hasSoakedCane;
                const displayName = hasSoaked ? 'Mokrý prut' : wDef.name;
                const displayIcon = hasSoaked ? '💧' : wDef.icon;

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
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.86rem', fontWeight: 900 }}>
                      <span style={{ color: '#111111' }}>💥 Zásah: ~{estDmg}</span>
                      <span style={{ color: '#166534' }}>⏱️ Kadence: {effectiveCd} s{cdMult < 0.999 ? ` (-${Math.round((1 - cdMult) * 100)} %)` : ''}</span>
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
                  desc: `+${cdBonusPct.toFixed(1)} % cooldown bonus (svižnější útoky)`,
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
                  icon: '🧳',
                  name: `Tulácký instinkt`,
                  desc: `+${pl.tulakDamageBonus} k poškození všech zbraní; bonus se násobí se všemi damage multiplikátory`,
                  badge: `+${pl.tulakDamageBonus}`,
                });
              }
              if (pl.kurazCount > 0) {
                perks.push({
                  icon: 'medvedi_mast',
                  name: `Medvědí mast`,
                  desc: `+${pl.kurazCount * 25} k maximální kuráži a odolnosti lovce`,
                  badge: `${pl.kurazCount}×`,
                });
              }
              if (pl.regenLevel > 0) {
                perks.push({
                  icon: '🎵',
                  name: `Veselá mysl a písnička`,
                  desc: `+${pl.regenLevel * 3} kuráže doplňováno každých 5 sekund`,
                  badge: `Úr. ${pl.regenLevel}`,
                });
              }
              if (pl.speedCount > 0) {
                perks.push({
                  icon: '👢',
                  name: `Toulavé boty sedmimílové`,
                  desc: `+${pl.speedCount * 20} k rychlosti pohybu při obcházení strašidel`,
                  badge: `${pl.speedCount}×`,
                });
              }
              if (pl.magnetCount > 0) {
                perks.push({
                  icon: '🧲',
                  name: `Magnetický měšec`,
                  desc: `+${pl.magnetCount * 30} k dosahu přitahování krejcarů a posilujících dobrot`,
                  badge: `${pl.magnetCount}×`,
                });
              }
              if (pl.hasSoakedCane) {
                perks.push({
                  icon: '💧',
                  name: 'Mokrý prut',
                  desc: 'Údery osikového prutu zchladí a výrazně zpomalují zasažené bubáky',
                  badge: 'Aktivní',
                });
              }

              if (perks.length === 0) return null;

              return (
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ margin: '12px 0 8px 0', textAlign: 'left', color: '#FEF3C7', fontSize: '1.05rem' }}>
                    ✨ Získaná vylepšení a posílení lovce:
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

            {/* In-pause toggles */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', margin: '14px 0' }}>
              <div className="hud-level-badge" style={{ padding: '6px 14px', fontSize: '0.95rem' }}>
                <span>{GAME_LEVELS[runStats.levelId || selectedLevelId]?.icon}</span>
                <span>{GAME_LEVELS[runStats.levelId || selectedLevelId]?.name}</span>
              </div>
              <button className="touch-toggle-btn" onClick={toggleTouch} title="Přepnout dotykový joystick">
                🕹️ Joystick: <span className="touch-toggle-text">{touchEnabled ? 'Zap' : 'Vyp'}</span>
              </button>
              <button className="sound-toggle-btn" onClick={toggleSound}>
                <span className="sound-btn-text">{soundEnabled ? '🔊 Zvuk: Zap' : '🔇 Zvuk: Vyp'}</span>
              </button>
              <button
                className="touch-toggle-btn"
                onClick={() => {
                  sound.coin();
                  const nextPerf = !meta.performanceMode;
                  saveMeta({ ...meta, performanceMode: nextPerf });
                }}
                title="Plynulý režim: optimalizuje strop nepřátel a částic pro stálých 60 FPS"
              >
                ⚡ Výkon: <span className="touch-toggle-text">{meta.performanceMode ? 'Plynulý (60 FPS)' : 'Plný'}</span>
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
                📊 FPS: <span className="touch-toggle-text">{meta.showPerfOverlay ? 'Zap' : 'Vyp'}</span>
              </button>
            </div>

            {/* Pause Action Buttons */}
            <div className="pause-actions-row">
              <button
                className="lada-btn"
                style={{ background: 'var(--leaf-green)' }}
                onClick={togglePause}
              >
                Pokračovat ve hře ⚔️
              </button>
              <button
                className="lada-btn"
                style={{ background: '#D97706', color: '#FFFFFF' }}
                onClick={() => {
                  spawnMinibossNow();
                  togglePause();
                }}
                title="Okamžitě přivolá mocného minibosse této úrovně pro testování a boj!"
              >
                👑 Přivolat Minibosse! ⚔️
              </button>
              <button
                className="lada-btn"
                style={{ background: '#1D4ED8', color: '#FFFFFF' }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
              >
                🎮 Ovládání a cíl hry
              </button>
              <button
                className="lada-btn"
                style={{ background: 'var(--wood-dark)' }}
                onClick={quitToTavernFromPause}
                title="Bezpečně ukončí výpravu a sečte všechny dosud získané krejcary a dušičky do hospody"
              >
                Ukončit výpravu a sečíst skóre 🍺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL UP MODAL */}
      {gameState === 'levelup' && (
        <div id="level-up-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '650px' }}>
            <LadaCardCorners variant="callout" />
            <h2 style={{ color: '#C53026', fontSize: '2.2rem', margin: '4px 0' }}>NOVÁ ÚROVEŇ!</h2>
            <LadaBotanicalFlourish height={18} />
            <p style={{ fontWeight: 800, marginTop: '-2px', marginBottom: '15px', color: 'var(--wood-dark)' }}>
              Vyberte si vylepšení pro svého lovce:
            </p>
            <div id="choices-container">
              {levelUpChoices.map((c, i) => (
                <div key={i} className="choice-card" onClick={() => selectUpgrade(c)}>
                  <LadaCardCorners variant="default" showBottomCorners={true} />
                  <div className="choice-icon"><GameIcon icon={c.icon} size={36} /></div>
                  <div className="choice-text">
                    <h3>{c.name}</h3>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAINTED CHEST SEQUENCE – LADOVSKÝ VENKOVSKÝ AUTOMAT / SLOT MACHINE */}
      {gameState === 'chest' && (
        <div id="chest-ui" className="overlay" style={{ background: 'rgba(10, 6, 3, 0.88)', backdropFilter: 'blur(3px)' }}>
          <div className="panel slot-machine-cabinet" style={{ textAlign: 'center' }}>
            <LadaCardCorners variant="callout" />
            {/* Ornate slot machine header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎰</span>
              <h1 style={{ color: '#FDE047', textShadow: '3px 3px 0 var(--ink)', margin: 0, fontSize: '2.2rem' }}>
                MALOVANÁ TRUHLA!
              </h1>
              <span style={{ fontSize: '2rem' }}>🎰</span>
            </div>
            <LadaBotanicalFlourish height={20} />

            <p style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FEF3C7', marginTop: '6px', marginBottom: '4px' }}>
              {slotSpinning
                ? '⚡ Válce venkovského automatu štěstěny se točí...'
                : '✨ Velkolepá kořist! Zde jsou vaše venkovské poklady:'}
            </p>

            {/* 3 Reel Housing */}
            <div className={`slot-reel-housing ${!slotSpinning && slotStoppedCount >= 3 ? 'slot-all-locked' : ''}`}>
              {chestRewards.map((reward, i) => {
                const isLocked = i < slotStoppedCount;
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
                      {isLocked ? `✨ Válec ${i + 1}` : `🎲 Válec ${i + 1}`}
                    </div>

                    {/* Reel Window */}
                    <div className="slot-reel-window">
                      {!isLocked ? (
                        <div className="slot-spinning-strip">
                          {['krejcar', 'czech_buchta', '💰', 'jitrnice', 'kynuty_kolac', '👢', 'osikovy_prut', '🕯️', '🪙', 'krejcar', 'czech_buchta', '💰', 'jitrnice', 'kynuty_kolac', '👢', 'osikovy_prut'].map((sym, sIdx) => (
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
                  onClick={skipSlotSpin}
                >
                  ⏩ Přeskočit točení <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>[Mezerník]</span>
                </button>
              ) : (
                <button
                  className="lada-btn"
                  style={{
                    padding: '14px 42px',
                    fontSize: '1.4rem',
                    background: 'var(--red)',
                    color: '#FEF3C7',
                    animation: 'popIn 0.3s ease-out',
                  }}
                  onClick={closeChestSequence}
                >
                  🎁 Vyzvednout poklad <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>[Mezerník]</span>
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
            <LadaCardCorners variant="callout" />
            <h1 className="tally-title" id="tally-title" style={{ animation: 'popIn 0.5s forwards', color: tallyCounters.isVictory ? '#D97706' : '#C53026', textShadow: '2px 2px 0 var(--ink)', margin: '4px 0' }}>
              {tallyCounters.isVictory ? '🏆 ÚROVEŇ POKOŘENA – VÍTĚZSTVÍ!' : 'KURÁŽ VYPRCHALA – ÚTĚK DO BEZPEČÍ!'}
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
                <span className="tally-number">{tallyCounters.chasniks} 🌾</span>
              </div>
            )}
            <div className="tally-row" style={{ opacity: 1, transform: 'none' }}>
              <span>Čas výpravy:</span>
              <span className="tally-number">{formatTimer(tallyCounters.time)}</span>
            </div>

            <div className="tally-actions-row" style={{ marginTop: '20px' }}>
              {tallyCounters.isVictory && tallyCounters.levelId < 6 && (
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
                  Vyrazit do další úrovně ({tallyCounters.levelId + 1}. úroveň) ⏩
                </button>
              )}

              <button
                className="lada-btn"
                style={{ fontSize: '1.25rem', padding: '12px 32px' }}
                onClick={() => {
                  saveMeta({
                    ...meta,
                    krejcary: meta.krejcary + tallyCounters.coins,
                    totalSoulsSaved: (meta.totalSoulsSaved || 0) + tallyCounters.souls,
                    totalChasnikSaved: (meta.totalChasnikSaved || 0) + tallyCounters.chasniks,
                  });
                  setGameState('tavern');
                }}
              >
                Vstoupit do hospody 🍺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAVERN & VILLAGE SCREEN */}
      {gameState === 'tavern' && (
        <div id="tavern-screen" className="overlay">
          <div className="panel" style={{ maxWidth: '1000px' }}>
            <LadaCardCorners variant="callout" />
            <h1 style={{ color: '#C53026', margin: '4px 0' }}>HOSPODA U ČERNÉHO KOCOURA 🍻</h1>
            <LadaBotanicalFlourish height={20} />
            <p style={{ fontWeight: 900, fontSize: '1.25rem', marginTop: '-4px', color: 'var(--wood-dark)' }}>
              🎶 V koutě vyhrávají pekelné dudy a voní čerstvý chléb... 🎵
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
                🏘️ Naše vesnice Bubákov
              </button>
              <button
                className={`tab-btn ${activeTavernTab === 'trophies' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTavernTab('trophies');
                  sound.coin();
                }}
              >
                🏆 Síň slávy a Syslovské výzvy
              </button>
            </div>

            {activeTavernTab === 'crafts' ? (
              <VillageView
                meta={meta}
                onUpgrade={handleVillageUpgrade}
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
                            <span className="badge-claimed">✅ Splněno</span>
                          ) : isMet ? (
                            <button className="btn-claim-trophy" onClick={() => claimTrophy(t.id)}>
                              Vyzvednout (+{t.reward})
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6 }}>⏳ Nesplněno</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="tavern-footer-buttons">
              <button
                className="lada-btn btn-small"
                style={{ background: '#1D4ED8', color: '#FFFFFF', padding: '12px 24px' }}
                onClick={() => {
                  sound.coin();
                  setIsControlsOpen(true);
                }}
              >
                🎮 Ovládání hry
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#E06D29', color: '#FFFFFF', padding: '12px 24px' }}
                onClick={() => setIsArsenalOpen(true)}
              >
                🗡️ Zbrojnice ({unlockedWeaponsCount}/{Object.keys(WEAPONS).length})
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: meta.performanceMode ? '#16A34A' : '#78350F', color: '#FFFFFF', padding: '12px 24px' }}
                onClick={() => {
                  sound.coin();
                  saveMeta({ ...meta, performanceMode: !meta.performanceMode });
                }}
                title="Plynulý režim: optimalizuje strop nepřátel a částic pro stálých 60 FPS"
              >
                ⚡ Výkon: {meta.performanceMode ? 'Plynulý (60 FPS)' : 'Plný'}
              </button>
              <button
                className="lada-btn btn-small"
                style={{ background: '#DC2626', color: '#FFFFFF', padding: '12px 24px' }}
                onClick={() => {
                  sound.hit();
                  setIsResetModalOpen(true);
                }}
                title="Vymazat veškerý postup (zamkne vše odemykatelné a vrátí upgrady na nulu)"
              >
                🗑️ Vymazat postup
              </button>
              <button className="lada-btn" style={{ padding: '12px 28px' }} onClick={() => {
                setMenuScreen('stage');
                setGameState('menu');
              }}>
                Zpět do nabídky
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS & OBJECTIVE MODAL */}
      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        performanceMode={!!meta.performanceMode}
        onTogglePerformanceMode={(enabled) => {
          saveMeta({ ...meta, performanceMode: enabled });
        }}
        showPerfOverlay={!!meta.showPerfOverlay}
        onToggleShowPerfOverlay={(enabled) => {
          saveMeta({ ...meta, showPerfOverlay: enabled });
        }}
      />

      {/* TEST MODE (SANDBOX) MODAL */}
      <TestModeModal
        isOpen={isTestModeOpen}
        onClose={() => setIsTestModeOpen(false)}
        onStartTestRun={(hero, levelId, weapons) => {
          startGame(hero, levelId, weapons, true);
        }}
        initialLevelId={selectedLevelId}
      />

      {/* RESET PROGRESS CONFIRMATION MODAL */}
      <ResetProgressModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleResetProgress}
      />

      {/* BESTIARY MODAL */}
      <BestiaryModal
        isOpen={isBestiaryOpen}
        onClose={() => setIsBestiaryOpen(false)}
        bestiaryKills={meta.bestiaryKills || {}}
      />

      {/* PLAN MODAL */}
      <PlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        defaultTab="plan"
      />

      {/* HUNTER UNLOCK DETAILS MODAL */}
      <HunterUnlockModal
        progress={selectedHunterDetail}
        onClose={() => setSelectedHunterDetail(null)}
        onStartIfUnlocked={(id) => startGame(id)}
      />

      {/* LEVEL UNLOCK DETAILS MODAL */}
      <LevelUnlockModal
        progress={selectedLevelDetail}
        onClose={() => setSelectedLevelDetail(null)}
        onSelectIfUnlocked={(id) => {
          setSelectedLevelId(id);
          saveMeta({ ...meta, selectedLevel: id });
          setSelectedLevelDetail(null);
          setMenuScreen('hunter');
        }}
      />

      {/* ARSENAL & WEAPONS UNLOCK MODAL */}
      <ArsenalModal
        isOpen={isArsenalOpen}
        onClose={() => setIsArsenalOpen(false)}
        meta={meta}
        onInspectWeapon={(prog) => setSelectedWeaponDetail(prog)}
      />

      {/* WEAPON UNLOCK DETAILS MODAL */}
      <WeaponUnlockModal
        progress={selectedWeaponDetail}
        onClose={() => setSelectedWeaponDetail(null)}
      />

      {/* UNLOCK TOAST BANNER */}
      {unlockNotice && (
        <div className="unlock-toast-banner" onClick={() => setUnlockNotice(null)}>
          <div style={{ fontSize: '1.2rem', color: 'var(--mustard)', marginBottom: '3px' }}>
            {unlockNotice.title}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            {unlockNotice.desc}
          </div>
        </div>
      )}
    </>
  );
}
