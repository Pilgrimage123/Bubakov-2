/**
 * Bitmap Glyph Atlas for Combat Floating Numbers & Static Lada Mini-Icons
 * 
 * Pre-renders digits 0-9, decimal point, signs and authentic Josef Lada
 * "česká vesnice" static mini-illustrations into a cached offscreen texture atlas.
 * Floating combat numbers, coin counts and arena labels are blitted as fast
 * bitmap sub-rectangles, completely eliminating vector font rasterization overhead
 * and replacing OS emoji fonts with authentic Josef Lada folk illustrations.
 * 
 * STRICT RULE: Emojis on the 2D Canvas MUST NOT BE ANIMATED.
 * ADR 0016, ADR 0017
 */

import { COLORS } from '../constants';

export interface CachedGlyph {
  char: string;
  size: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advanceWidth: number;
  isCustomIcon?: boolean;
}

export interface DrawGlyphOptions {
  size?: number;
  color?: string;
  alpha?: number;
  useStampCache?: boolean;
}

const SUPPORTED_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '!', '%', '.', ','];
const SUPPORTED_SIZES = [18, 26];
const SUPPORTED_COLORS = [
  '#FFFFFF', // normal damage / text
  '#F59E0B', // critical gold / yellow
  '#EF4444', // fire / heavy damage
  '#10B981', // heal green
  '#38BDF8', // frost / cyan
  '#A855F7', // poison / purple
  '#D97706', // bronze / coins
];

export const SUPPORTED_CANVAS_EMOJIS = [
  '🪙', // Krejcar coin
  '🍪', // Gingerbread heart
  '🍺', // Tavern beer mug
  '⚡', // Lightning bolt
  '🔔', // Chapel bell
  '💨', // Wind gust / dash
  '🛡', // Shield
  '🔥', // Hearth ember fire
  '🪵', // Birch log
  '😱', // Scared face / ghost
  '🌿', // Rosemary sprig
  '💥', // Comic impact burst
  '❄', // Frost snowflake
  '🪨', // Fieldstone
  '🍞', // Sourdough loaf
  '✨', // Star glint
  '👢', // Wanderer boot
  '💰', // Linen ducat pouch
  '🫓', // Škvarková placka
  '👑', // Folk crown
  '🏆', // Folk trophy cup
  '🎉', // Rosemary ribbon
  '🧹', // Birch broom
  '🥒', // Pickled gherkin
  '🪢', // Hemp rope
  '🧀', // Olomouc curd cheese
  '🪞', // Fairground mirror
  '💝', // Fairground heart
  '🍐', // Folk pear
  '🧲', // Forged horseshoe
  '🐓', // Clay rooster
  '⏰', // Cuckoo clock
  '💀', // Masopust skull
  '🐉', // Serpent / dragon
  '🪿', // Village goose
  '🌲', // Spruce pine
  '🐾', // Animal paw print
  '🌊', // Mill pond wave
  '❤', // Folk painted heart
  '🐑', // Woolly sheep
  '🐂', // Farm ox
  '🔒', // Wrought-iron padlock
  '🔎', // Magnifying glass
  '🔍', // Magnifying glass
];

function normalizeEmojiToken(token: string): string {
  return token.replace(/\uFE0F/g, '');
}

export function isSupportedCanvasEmoji(token: string): boolean {
  const norm = normalizeEmojiToken(token);
  return SUPPORTED_CANVAS_EMOJIS.includes(norm);
}

function createAtlasCanvas(width: number, height: number): { canvas: any; ctx: any } {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }

  // Headless environment fallback (Vitest / Node.js)
  const ctx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    bezierCurveTo: () => {},
    quadraticCurveTo: () => {},
    rect: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: (text: string) => ({ width: text.length * 12 }),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    font: '',
    globalAlpha: 1,
  };

  const canvas = {
    width,
    height,
    getContext: () => ctx,
  };

  return { canvas, ctx };
}

export interface CachedWordStamp {
  canvas: any;
  ctx: any;
  width: number;
  height: number;
  baseline: number;
}

export class WordStampCache {
  private stamps = new Map<string, CachedWordStamp>();
  private readonly maxCapacity: number;
  private measureCanvas: any = null;
  private measureCtx: any = null;

  constructor(maxCapacity = 128) {
    this.maxCapacity = maxCapacity;
  }

  public get size(): number {
    return this.stamps.size;
  }

  private getMeasureContext(): any {
    if (!this.measureCtx) {
      const { canvas, ctx } = createAtlasCanvas(1, 1);
      this.measureCanvas = canvas;
      this.measureCtx = ctx;
    }
    return this.measureCtx;
  }

  public get(key: string): CachedWordStamp | undefined {
    return this.stamps.get(key);
  }

  public clear(): void {
    for (const stamp of this.stamps.values()) {
      if (stamp.canvas) {
        stamp.canvas.width = 0;
        stamp.canvas.height = 0;
      }
    }
    this.stamps.clear();
  }

  public getOrCreate(text: string, size: number, color: string): CachedWordStamp {
    const key = `${text}_${size}_${color.toUpperCase()}`;
    const existing = this.stamps.get(key);
    if (existing) {
      return existing;
    }

    if (this.stamps.size >= this.maxCapacity) {
      const firstKey = this.stamps.keys().next().value;
      if (firstKey !== undefined) {
        const evicted = this.stamps.get(firstKey);
        if (evicted?.canvas) {
          evicted.canvas.width = 0;
          evicted.canvas.height = 0;
        }
        this.stamps.delete(firstKey);
      }
    }

    const strokeWidth = size >= 26 ? 4.0 : 3.0;
    const padding = Math.ceil(strokeWidth * 2) + 6;

    const testCtx = this.getMeasureContext();
    testCtx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;
    const metrics = testCtx.measureText ? testCtx.measureText(text) : { width: text.length * size * 0.7 };
    const measuredWidth = Math.ceil(metrics.width || text.length * size * 0.7);

    const stampWidth = measuredWidth + padding * 2;
    const stampHeight = Math.ceil(size * 1.5) + padding * 2;
    const baseline = Math.ceil(size * 1.1) + padding;

    const { canvas, ctx } = createAtlasCanvas(stampWidth, stampHeight);
    ctx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeText(text, padding, baseline);

    ctx.fillStyle = color;
    ctx.fillText(text, padding, baseline);

    const stamp: CachedWordStamp = {
      canvas,
      ctx,
      width: stampWidth,
      height: stampHeight,
      baseline,
    };

    this.stamps.set(key, stamp);
    return stamp;
  }
}

// ----------------------------------------------------------------------------
// Static Josef Lada Mini-Drawing Functions for Canvas Atlas
// All drawn in authentic Lada style: thick ink outline, warm gouache colors
// ----------------------------------------------------------------------------

function drawStaticMiniIcon(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.lineWidth = size >= 26 ? 2.4 : 1.8;
  ctx.strokeStyle = '#1A1612';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const r = size * 0.42;

  switch (emoji) {
    case '🪙': {
      // Stamped silver/gold Krejcar coin
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // Inscribed K letter
      ctx.fillStyle = '#451A03';
      ctx.font = `900 ${Math.round(size * 0.52)}px Eczar, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K', cx, cy + 0.5);
      break;
    }
    case '🍪':
    case '💝': {
      // Fairground gingerbread heart
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.5);
      ctx.bezierCurveTo(cx + r, cy - r * 1.3, cx + r * 1.3, cy + r * 0.3, cx, cy + r * 1.1);
      ctx.bezierCurveTo(cx - r * 1.3, cy + r * 0.3, cx - r, cy - r * 1.3, cx, cy - r * 0.5);
      ctx.fill();
      ctx.stroke();

      // White sugar piping border
      ctx.strokeStyle = '#FFFDF6';
      ctx.lineWidth = size >= 26 ? 1.6 : 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.35);
      ctx.bezierCurveTo(cx + r * 0.75, cy - r * 0.9, cx + r, cy + r * 0.2, cx, cy + r * 0.85);
      ctx.bezierCurveTo(cx - r, cy + r * 0.2, cx - r * 0.75, cy - r * 0.9, cx, cy - r * 0.35);
      ctx.stroke();
      break;
    }
    case '🍺': {
      // Foaming earthenware tavern mug
      const mw = r * 0.9;
      const mh = r * 1.2;
      // Handle
      ctx.beginPath();
      ctx.arc(cx + mw * 0.9, cy, mh * 0.45, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Mug body
      ctx.fillStyle = '#8C5A35';
      ctx.fillRect(cx - mw * 0.8, cy - mh * 0.4, mw * 1.6, mh);
      ctx.strokeRect(cx - mw * 0.8, cy - mh * 0.4, mw * 1.6, mh);

      // Blue decorative band
      ctx.fillStyle = '#3A76A8';
      ctx.fillRect(cx - mw * 0.8, cy - mh * 0.05, mw * 1.6, mh * 0.3);
      ctx.strokeRect(cx - mw * 0.8, cy - mh * 0.05, mw * 1.6, mh * 0.3);

      // Frothy white beer head
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.arc(cx - mw * 0.5, cy - mh * 0.5, r * 0.45, 0, Math.PI * 2);
      ctx.arc(cx, cy - mh * 0.65, r * 0.55, 0, Math.PI * 2);
      ctx.arc(cx + mw * 0.5, cy - mh * 0.5, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '⚡': {
      // Jagged golden lightning
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.3, cy - r);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.1, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.4, cy + r * 1.1);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🔔': {
      // Bronze chapel bell
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.35, cy - r * 0.8);
      ctx.bezierCurveTo(cx + r * 0.4, cy, cx + r * 0.9, cy + r * 0.7, cx + r, cy + r * 0.9);
      ctx.lineTo(cx - r, cy + r * 0.9);
      ctx.bezierCurveTo(cx - r * 0.9, cy + r * 0.7, cx - r * 0.4, cy, cx - r * 0.35, cy - r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clapper
      ctx.fillStyle = '#2A170A';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 1.05, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '💨': {
      // Wind swirls
      ctx.strokeStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.6, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy + r * 0.3, r * 0.5, 0, Math.PI, false);
      ctx.stroke();
      break;
    }
    case '🛡': {
      // Round studded shield
      ctx.fillStyle = '#8C5A35';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iron center boss
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Studs
      ctx.fillStyle = '#2A170A';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🔥': {
      // Hearth fire
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.bezierCurveTo(cx + r, cy - r * 0.2, cx + r * 0.8, cy + r, cx, cy + r);
      ctx.bezierCurveTo(cx - r * 0.8, cy + r, cx - r, cy - r * 0.2, cx, cy - r);
      ctx.fill();
      ctx.stroke();

      // Inner flame
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.5, cy, cx + r * 0.4, cy + r * 0.8, cx, cy + r * 0.8);
      ctx.bezierCurveTo(cx - r * 0.4, cy + r * 0.8, cx - r * 0.5, cy, cx, cy - r * 0.4);
      ctx.fill();
      break;
    }
    case '🪵': {
      // Birch log
      ctx.fillStyle = '#FFFDF6';
      ctx.fillRect(cx - r * 0.9, cy - r * 0.45, r * 1.8, r * 0.9);
      ctx.strokeRect(cx - r * 0.9, cy - r * 0.45, r * 1.8, r * 0.9);
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.9, cy, r * 0.25, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Birch notches
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.2, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.1);
      ctx.moveTo(cx + r * 0.3, cy + r * 0.1);
      ctx.lineTo(cx + r * 0.6, cy + r * 0.4);
      ctx.stroke();
      break;
    }
    case '😱': {
      // Frightened face / pale ghost
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Wide hollow eyes
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.35, cy - r * 0.2, r * 0.25, r * 0.35, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.35, cy - r * 0.2, r * 0.25, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      // O-shaped open mouth
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.4, r * 0.25, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🌿': {
      // Rosemary sprig
      ctx.strokeStyle = '#4D7C0F';
      ctx.lineWidth = size >= 26 ? 2.5 : 2.0;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.8);
      ctx.quadraticCurveTo(cx, cy, cx + r * 0.6, cy - r * 0.8);
      ctx.stroke();
      // Leaves
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.2, cy + r * 0.3, r * 0.2, r * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.2, cy - r * 0.3, r * 0.2, r * 0.4, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '💥': {
      // Comic impact burst
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i < points * 2; i++) {
        const rad = i % 2 === 0 ? r * 1.1 : r * 0.5;
        const angle = (i * Math.PI) / points;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '❄': {
      // Frost snowflake
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = size >= 26 ? 2.5 : 1.8;
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(angle) * r, cy - Math.sin(angle) * r);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
      }
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🪨': {
      // Fieldstone
      ctx.fillStyle = '#8A887D';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy + r * 0.5);
      ctx.lineTo(cx - r * 0.9, cy - r * 0.3);
      ctx.lineTo(cx - r * 0.2, cy - r * 0.9);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Moss patch
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.4, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🍞': {
      // Rye bread
      ctx.fillStyle = '#8C5A35';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cuts
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.4, cy - r * 0.3);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.3);
      ctx.moveTo(cx + r * 0.2, cy - r * 0.3);
      ctx.lineTo(cx + r * 0.4, cy + r * 0.3);
      ctx.stroke();
      break;
    }
    case '✨': {
      // Star glint
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.quadraticCurveTo(cx, cy, cx + r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r);
      ctx.quadraticCurveTo(cx, cy, cx - r, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '👢': {
      // Stitched leather boot
      ctx.fillStyle = '#8C5A35';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.2, cy + r * 0.1);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.5);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.9);
      ctx.lineTo(cx - r * 0.6, cy + r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '💰': {
      // Linen coin pouch
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.4, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.7);
      ctx.lineTo(cx - r * 0.9, cy + r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Tie band & gold coin
      ctx.fillStyle = '#D9A036';
      ctx.fillRect(cx - r * 0.5, cy - r * 0.7, r, r * 0.2);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🫓': {
      // Škvarková placka
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Diced roasted cracklings
      ctx.fillStyle = '#451A03';
      ctx.fillRect(cx - r * 0.4, cy - r * 0.2, r * 0.25, r * 0.25);
      ctx.fillRect(cx + r * 0.1, cy - r * 0.3, r * 0.25, r * 0.25);
      ctx.fillRect(cx - r * 0.1, cy + r * 0.15, r * 0.25, r * 0.25);
      break;
    }
    case '👑': {
      // Gold crown
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.moveTo(cx - r, cy + r * 0.8);
      ctx.lineTo(cx - r * 0.9, cy - r * 0.5);
      ctx.lineTo(cx - r * 0.3, cy);
      ctx.lineTo(cx, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.3, cy);
      ctx.lineTo(cx + r * 0.9, cy - r * 0.5);
      ctx.lineTo(cx + r, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Red jewel in center
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.8, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🏆': {
      // Painted folk trophy
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.6, cy + r * 0.2);
      ctx.lineTo(cx - r * 0.6, cy + r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Base
      ctx.fillStyle = '#D9A036';
      ctx.fillRect(cx - r * 0.5, cy + r * 0.5, r, r * 0.4);
      ctx.strokeRect(cx - r * 0.5, cy + r * 0.5, r, r * 0.4);
      break;
    }
    case '🎉': {
      // Rosemary ribbon & confetti
      ctx.strokeStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.5, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.7);
      ctx.stroke();
      // Red bow
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🧹': {
      // Birch broom
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = size >= 26 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.8, cy - r * 0.8);
      ctx.lineTo(cx - r * 0.2, cy + r * 0.2);
      ctx.stroke();
      // Twigs
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.2, cy + r * 0.2);
      ctx.lineTo(cx - r * 0.9, cy + r * 0.5);
      ctx.lineTo(cx - r * 0.5, cy + r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🥒': {
      // Pickled gherkin
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.45, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🪢': {
      // Rope loop
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 3 : 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case '🧀': {
      // Cheese wedge
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy + r * 0.5);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🪞': {
      // Pocket mirror
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.2, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🍐': {
      // Pear
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.65, 0, Math.PI * 2);
      ctx.arc(cx, cy - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🧲': {
      // Forged horseshoe
      ctx.strokeStyle = '#2A170A';
      ctx.lineWidth = size >= 26 ? 4 : 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, Math.PI * 0.2, Math.PI * 0.8, true);
      ctx.stroke();
      break;
    }
    case '🐓': {
      // Rooster comb & head
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '⏰': {
      // Clock
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - r * 0.6);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * 0.5, cy);
      ctx.stroke();
      break;
    }
    case '💀': {
      // Skull
      ctx.fillStyle = '#FAF5E8';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.15, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(cx - r * 0.35, cy + r * 0.3, r * 0.7, r * 0.5);
      ctx.strokeRect(cx - r * 0.35, cy + r * 0.3, r * 0.7, r * 0.5);
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🐉': {
      // Dragon serpent
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🪿': {
      // Goose
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(cx - r * 0.6, cy, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🌲': {
      // Spruce pine
      ctx.fillStyle = '#3D7843';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.8);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🐾': {
      // Animal paw
      ctx.fillStyle = '#2A170A';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.45, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.4, cy - r * 0.3, r * 0.2, 0, Math.PI * 2);
      ctx.arc(cx, cy - r * 0.5, r * 0.2, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.4, cy - r * 0.3, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🌊': {
      // Wave
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = size >= 26 ? 3 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI, false);
      ctx.stroke();
      break;
    }
    case '❤': {
      // Red heart
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.8, cy - r * 1.1, cx + r, cy + r * 0.2, cx, cy + r);
      ctx.bezierCurveTo(cx - r, cy + r * 0.2, cx - r * 0.8, cy - r * 1.1, cx, cy - r * 0.4);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🐑': {
      // Sheep
      ctx.fillStyle = '#FAF5E8';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🐂': {
      // Farm ox
      ctx.fillStyle = '#8C5A35';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🔒': {
      // Padlock
      ctx.fillStyle = '#2A170A';
      ctx.fillRect(cx - r * 0.7, cy - r * 0.2, r * 1.4, r * 1.1);
      ctx.strokeRect(cx - r * 0.7, cy - r * 0.2, r * 1.4, r * 1.1);
      // Shackle
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.2, r * 0.45, Math.PI, 0, false);
      ctx.stroke();
      // Brass keyhole
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🔎':
    case '🔍': {
      // Magnifying glass
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 2.8 : 2.0;
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#E0F2FE';
      ctx.fill();
      // Handle
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = size >= 26 ? 3.5 : 2.4;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.2, cy + r * 0.2);
      ctx.lineTo(cx + r * 0.85, cy + r * 0.85);
      ctx.stroke();
      break;
    }
    default: {
      // Generic circular folk token
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

export class GlyphAtlas {
  private canvas: any = null;
  private ctx: any = null;
  private glyphs: Map<string, CachedGlyph> = new Map();
  private initialized = false;
  public wordStampCache: WordStampCache = new WordStampCache(128);

  private makeKey(char: string, size: number, color: string): string {
    const norm = normalizeEmojiToken(char);
    return `${norm}_${size}_${color.toUpperCase()}`;
  }

  public init(): void {
    if (this.initialized) return;

    // Generous 1024x1024 atlas canvas accommodating all digits, punctuation, and static Lada icons
    const atlasWidth = 1024;
    const atlasHeight = 1024;
    const { canvas, ctx } = createAtlasCanvas(atlasWidth, atlasHeight);
    this.canvas = canvas;
    this.ctx = ctx;

    let cursorX = 4;
    let cursorY = 4;
    let rowHeight = 0;

    // 1. Pre-render numeric digits and standard combat punctuation in all supported colors
    for (const size of SUPPORTED_SIZES) {
      const cellHeight = Math.ceil(size * 1.5) + 6;
      rowHeight = Math.max(rowHeight, cellHeight);

      for (const color of SUPPORTED_COLORS) {
        ctx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;

        for (const char of SUPPORTED_CHARS) {
          const charWidth = Math.max(10, Math.ceil(size * 0.72));
          const cellWidth = charWidth + 8;

          if (cursorX + cellWidth > atlasWidth - 4) {
            cursorX = 4;
            cursorY += rowHeight + 4;
            rowHeight = cellHeight;
          }

          const glyphX = cursorX;
          const glyphY = cursorY;
          const textBaselineY = glyphY + Math.ceil(size * 1.05);

          // Render authentic Josef Lada heavy ink contour
          ctx.strokeStyle = COLORS?.ink || '#1E1B18';
          ctx.lineWidth = size >= 26 ? 4.0 : 3.0;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.strokeText(char, glyphX + 2, textBaselineY);

          // Render inner gouache color fill
          ctx.fillStyle = color;
          ctx.fillText(char, glyphX + 2, textBaselineY);

          const key = this.makeKey(char, size, color);
          this.glyphs.set(key, {
            char,
            size,
            color: color.toUpperCase(),
            x: glyphX,
            y: glyphY,
            width: cellWidth,
            height: cellHeight,
            advanceWidth: charWidth + 1,
          });

          cursorX += cellWidth + 2;
        }
      }
    }

    // 2. Pre-render static Josef Lada folk mini-illustrations for all emojis
    for (const size of SUPPORTED_SIZES) {
      const cellWidth = Math.ceil(size * 1.25) + 4;
      const cellHeight = Math.ceil(size * 1.35) + 4;
      rowHeight = Math.max(rowHeight, cellHeight);

      for (const emoji of SUPPORTED_CANVAS_EMOJIS) {
        if (cursorX + cellWidth > atlasWidth - 4) {
          cursorX = 4;
          cursorY += rowHeight + 4;
          rowHeight = cellHeight;
        }

        const glyphX = cursorX;
        const glyphY = cursorY;
        const cx = glyphX + cellWidth / 2;
        const cy = glyphY + cellHeight / 2;

        drawStaticMiniIcon(ctx, emoji, cx, cy, size);

        // Store under normalized key for all supported colors
        for (const color of SUPPORTED_COLORS) {
          const key = this.makeKey(emoji, size, color);
          this.glyphs.set(key, {
            char: emoji,
            size,
            color: color.toUpperCase(),
            x: glyphX,
            y: glyphY,
            width: cellWidth,
            height: cellHeight,
            advanceWidth: Math.ceil(size * 1.1),
            isCustomIcon: true,
          });
        }

        cursorX += cellWidth + 2;
      }
    }

    this.initialized = true;
  }

  public getGlyph(char: string, size = 18, color = '#FFFFFF'): CachedGlyph | undefined {
    if (!this.initialized) this.init();
    const normalizedColor = color.toUpperCase();
    return this.glyphs.get(this.makeKey(char, size, normalizedColor));
  }

  /**
   * Fast blit of text string using pre-rendered glyphs & static Lada mini-icons.
   * Returns true if successfully rendered via glyph cache, false if fell back to vector text.
   */
  public draw(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options?: DrawGlyphOptions
  ): boolean {
    if (!text || text.length === 0) return true;
    if (!this.initialized) this.init();

    const size = options?.size ?? 18;
    const color = (options?.color ?? '#FFFFFF').toUpperCase();
    const alpha = options?.alpha ?? 1.0;

    // Tokenize text into characters while respecting Unicode surrogate pairs and emoji sequences
    const rawTokens = Array.from(text);
    const glyphsToDraw: CachedGlyph[] = [];
    let hasUncachedChar = false;

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      if (token === '\uFE0F') continue; // Skip variation selector

      if (token === ' ') {
        glyphsToDraw.push({
          char: ' ',
          size,
          color,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          advanceWidth: Math.ceil(size * 0.4),
        });
        continue;
      }

      const g = this.getGlyph(token, size, color);
      if (!g) {
        hasUncachedChar = true;
        break;
      }
      glyphsToDraw.push(g);
    }

    if (hasUncachedChar) {
      // Fallback: uncached complex words or mixed status sentences
      return this.fallbackVectorDraw(ctx, text, x, y, size, options?.color ?? '#FFFFFF', alpha, options?.useStampCache);
    }

    // Blit pre-rendered glyphs
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Align text centered around (x, y)
    let totalWidth = 0;
    for (let i = 0; i < glyphsToDraw.length; i++) {
      totalWidth += glyphsToDraw[i].advanceWidth;
    }

    let drawX = x - totalWidth * 0.5;
    const drawY = y - size;

    for (let i = 0; i < glyphsToDraw.length; i++) {
      const g = glyphsToDraw[i];
      if (g.char !== ' ' && g.width > 0 && g.height > 0) {
        ctx.drawImage(
          this.canvas,
          g.x,
          g.y,
          g.width,
          g.height,
          drawX,
          drawY,
          g.width,
          g.height
        );
      }
      drawX += g.advanceWidth;
    }

    ctx.restore();
    return true;
  }

  private fallbackVectorDraw(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number,
    useStampCache = true
  ): boolean {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = size >= 26 ? 4.0 : 3.0;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // If text does not contain any emojis, blit cached word stamp without vector rasterization
    const hasAnyEmoji = SUPPORTED_CANVAS_EMOJIS.some((e) => text.includes(e));
    if (!hasAnyEmoji) {
      if (useStampCache) {
        const stamp = this.wordStampCache.getOrCreate(text, size, color);
        ctx.drawImage(
          stamp.canvas,
          Math.round(x - stamp.width * 0.5),
          Math.round(y - stamp.baseline)
        );
        ctx.restore();
        return true;
      }
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
      return false;
    }

    // Parse string into text runs and emoji tokens to prevent OS emoji rendering
    const rawTokens = Array.from(text);
    interface TextOrGlyph {
      isEmoji: boolean;
      str: string;
      glyph?: CachedGlyph;
    }

    const segments: TextOrGlyph[] = [];
    let curText = '';

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      if (token === '\uFE0F') continue;

      const norm = normalizeEmojiToken(token);
      if (isSupportedCanvasEmoji(norm)) {
        if (curText) {
          segments.push({ isEmoji: false, str: curText });
          curText = '';
        }
        const g = this.getGlyph(norm, size, color);
        segments.push({ isEmoji: true, str: norm, glyph: g });
      } else {
        curText += token;
      }
    }
    if (curText) {
      segments.push({ isEmoji: false, str: curText });
    }

    // Measure total width to center align
    let totalW = 0;
    for (const seg of segments) {
      if (seg.isEmoji) {
        totalW += seg.glyph?.advanceWidth ?? Math.ceil(size * 1.1);
      } else {
        totalW += ctx.measureText(seg.str).width;
      }
    }

    let startX = x - totalW * 0.5;
    for (const seg of segments) {
      if (seg.isEmoji && seg.glyph) {
        ctx.drawImage(
          this.canvas,
          seg.glyph.x,
          seg.glyph.y,
          seg.glyph.width,
          seg.glyph.height,
          startX,
          y - size * 0.95,
          seg.glyph.width,
          seg.glyph.height
        );
        startX += seg.glyph.advanceWidth;
      } else if (!seg.isEmoji) {
        ctx.strokeText(seg.str, startX, y);
        ctx.fillStyle = color;
        ctx.fillText(seg.str, startX, y);
        startX += ctx.measureText(seg.str).width;
      }
    }

    ctx.restore();
    return false;
  }
}

let globalGlyphAtlas: GlyphAtlas | null = null;

export function resetGlobalGlyphAtlas(): void {
  if (globalGlyphAtlas) {
    globalGlyphAtlas.wordStampCache.clear();
  }
}

export function getGlobalGlyphAtlas(): GlyphAtlas {
  if (!globalGlyphAtlas) {
    globalGlyphAtlas = new GlyphAtlas();
    globalGlyphAtlas.init();
  }
  return globalGlyphAtlas;
}

export function drawGlyphText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: DrawGlyphOptions
): boolean {
  return getGlobalGlyphAtlas().draw(ctx, text, x, y, options);
}
