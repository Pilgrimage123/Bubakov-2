/**
 * Zero-allocation Combat Floating Text Manager (Správce Bojových plovoucích textů)
 * 
 * Centralizes all combat text creation, enforces category filtering before allocation,
 * enables cumulative damage number aggregation on enemies, and maintains a bounded
 * ring buffer of maximum 40 items to completely eliminate Array.prototype.splice allocations.
 * 
 * ADR 0002, ADR 0016, ADR 0020
 */

import type { EngineState } from './engineState';
import {
  isCombatTextCategoryEnabled,
  inferCombatTextCategory,
  type CombatTextCategory,
} from './combatTextSettings';
import { drawGlyphText } from '../render/glyphAtlas';
import { COLORS } from '../constants';

export const MAX_COMBAT_TEXTS = 40;

export class DamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  size: number;
  vy: number;
  numericVal: number | null = null;
  category: CombatTextCategory;

  constructor(
    x: number,
    y: number,
    text: string,
    color: string = COLORS?.white || '#FFFFFF',
    big = false,
    category?: CombatTextCategory
  ) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.text = text;
    this.color = color;
    this.life = 1.0;
    this.size = big ? 26 : 18;
    this.vy = -45;
    this.category = category || inferCombatTextCategory(text);
    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed) && String(parsed) === text) {
      this.numericVal = parsed;
    }
  }

  addAmount(amount: number): void {
    if (this.numericVal !== null) {
      this.numericVal += Math.round(amount);
      this.text = String(this.numericVal);
      this.life = Math.min(1.0, this.life + 0.35);
      this.vy = -35;
      this.size = Math.min(26, this.size + 1.2);
    }
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.text) {
      drawGlyphText(ctx, this.text, this.x, this.y, {
        size: this.size,
        color: this.color,
        alpha: this.life,
      });
    }
  }
}

/**
 * Central zero-allocation entry point for spawning or merging combat floating texts.
 */
export function addCombatText(
  engine: EngineState,
  x: number,
  y: number,
  text: string,
  color: string = COLORS?.white || '#FFFFFF',
  big = false,
  category?: CombatTextCategory,
  targetEnemy?: any
): DamageText | null {
  const cat = category || inferCombatTextCategory(text);
  if (!isCombatTextCategoryEnabled(cat)) {
    return null;
  }

  // 1. If targetEnemy is given and this is a numeric damage amount, merge cumulatively into existing text
  if (targetEnemy) {
    const active = targetEnemy._activeCombatText as DamageText | undefined;
    if (active && active.life > 0.15 && active.numericVal !== null) {
      const parsed = parseInt(text, 10);
      if (!Number.isNaN(parsed)) {
        active.addAmount(parsed);
        // Keep slightly elevated above current enemy position
        active.x = targetEnemy.x + (Math.random() - 0.5) * 6;
        active.y = targetEnemy.y - 28;
        return active;
      }
    }
  }

  const dt = new DamageText(x, y, text, color, big, cat);
  if (targetEnemy && dt.numericVal !== null) {
    targetEnemy._activeCombatText = dt;
  }

  if (!engine.texts) {
    engine.texts = [];
  }

  // 2. Bound collection to MAX_COMBAT_TEXTS with O(1) in-place replacement (avoids splice allocations)
  if (engine.texts.length >= MAX_COMBAT_TEXTS) {
    let oldestIdx = 0;
    let minLife = 999;
    for (let i = 0; i < engine.texts.length; i++) {
      const item = engine.texts[i];
      if (item.life < minLife) {
        minLife = item.life;
        oldestIdx = i;
        if (minLife <= 0) break;
      }
    }
    engine.texts[oldestIdx] = dt;
  } else {
    engine.texts.push(dt);
  }

  return dt;
}
