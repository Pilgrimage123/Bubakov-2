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
  '⚙', // Wooden watermill cogwheel
  '⚔', // Crossed swords
  '🗡', // Dagger / hunter knife
  '🧊', // Ice cube / freeze
  '💤', // Sleep snore
  '🔱', // Blacksmith pitchfork / trident
  '⛪', // Village chapel
  '☀', // Village sun
  '🧺', // Woven wicker basket
  '🌾', // Golden wheat / rye ear
  '✒', // Goose feather quill
  '🪦', // Cemetery gravestone
  '💧', // Water drop
  '🐸', // Millpond frog
  '⛓', // Iron chains
  '🦷', // Wolf/boar fang tooth
  '🎒', // Wanderer haversack
  '🪓', // Woodcutter axe
  '🎯', // Archery target
  '🥐', // Czech baked roll / rohlik
  '🎁', // Gift parcel
  '🏺', // Clay jug
  '🕊', // White dove
  '🍯', // Honey pot
  '🖍', // Three Kings chalk
  '♫', // Musical note
  '🎵', // Eighth note
  '🎶', // Musical notes
  '🔊', // Herald's horn
  '📯', // Post horn
  '🔨', // Blacksmith hammer
  '🗿', // Wayside stone idol
  '🌱', // Spring seedling
  '🍂', // Autumn fallen leaf
  '🍁', // Maple leaf
  '🐦‍⬛', // Black raven / crow
  '🐦', // Songbird
  '🦁', // Bohemian lion
  '🌙', // Crescent moon
  '🔘', // Pewter button
  '✦', // Folk star
  '♥', // Card heart
  '♦', // Card diamond
  '♠', // Card spade
  '♣', // Card club
  '🌨', // Snowcloud
  '🏔', // Mountain peak
  '✝', // Wayside cross
  '⚠', // Warning sign
  '🚨', // Emergency / warning
  '🍀', // Four-leaf clover
  '🍖', // Roasted ham
  '🔓', // Open padlock
];

export function normalizeEmojiToken(token: string): string {
  return token.replace(/[\uFE0E\uFE0F]/g, '');
}

export function isSupportedCanvasEmoji(token: string): boolean {
  const norm = normalizeEmojiToken(token);
  return SUPPORTED_CANVAS_EMOJIS.includes(norm);
}

const graphemeSegmenter =
  typeof Intl !== 'undefined' && (Intl as any).Segmenter
    ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' })
    : null;

export interface TextOrEmojiSegment {
  isEmoji: boolean;
  token: string;
}

export function splitTextAndEmojis(text: string): TextOrEmojiSegment[] {
  if (!text) return [];
  const graphemes = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), (s: any) => s.segment as string)
    : Array.from(text);

  const segments: TextOrEmojiSegment[] = [];
  let curText = '';

  for (let i = 0; i < graphemes.length; i++) {
    const g = graphemes[i];
    const norm = normalizeEmojiToken(g);
    if (isSupportedCanvasEmoji(norm)) {
      if (curText) {
        segments.push({ isEmoji: false, token: curText });
        curText = '';
      }
      segments.push({ isEmoji: true, token: norm });
    } else {
      curText += g;
    }
  }

  if (curText) {
    segments.push({ isEmoji: false, token: curText });
  }

  return segments;
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

    // Maintain max capacity (FIFO eviction with GPU canvas cleanup)
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

    const segments = splitTextAndEmojis(text);
    const hasEmoji = segments.some((s) => s.isEmoji);

    let measuredWidth = 0;
    const emojiSlotWidth = Math.ceil(size * 1.25);

    if (!hasEmoji) {
      const metrics = testCtx.measureText ? testCtx.measureText(text) : { width: text.length * size * 0.7 };
      measuredWidth = Math.ceil(metrics.width || text.length * size * 0.7);
    } else {
      for (const seg of segments) {
        if (seg.isEmoji) {
          measuredWidth += emojiSlotWidth;
        } else {
          const metrics = testCtx.measureText ? testCtx.measureText(seg.token) : { width: seg.token.length * size * 0.7 };
          measuredWidth += Math.ceil(metrics.width || seg.token.length * size * 0.7);
        }
      }
    }

    const stampWidth = measuredWidth + padding * 2;
    const stampHeight = Math.ceil(size * 1.5) + padding * 2;
    const baseline = Math.ceil(size * 1.1) + padding;

    const { canvas, ctx } = createAtlasCanvas(stampWidth, stampHeight);
    ctx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    if (!hasEmoji) {
      ctx.strokeText(text, padding, baseline);
      ctx.fillStyle = color;
      ctx.fillText(text, padding, baseline);
    } else {
      let curX = padding;
      for (const seg of segments) {
        if (seg.isEmoji) {
          const cx = curX + emojiSlotWidth / 2;
          const cy = baseline - size * 0.35;
          drawStaticMiniIcon(ctx, seg.token, cx, cy, size);
          curX += emojiSlotWidth;
        } else {
          ctx.strokeText(seg.token, curX, baseline);
          ctx.fillStyle = color;
          ctx.fillText(seg.token, curX, baseline);
          const segMetrics = testCtx.measureText ? testCtx.measureText(seg.token) : { width: seg.token.length * size * 0.7 };
          curX += Math.ceil(segMetrics.width || seg.token.length * size * 0.7);
        }
      }
    }

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

  public dispose(): void {
    this.clear();
    if (this.measureCanvas) {
      this.measureCanvas.width = 0;
      this.measureCanvas.height = 0;
      this.measureCanvas = null;
      this.measureCtx = null;
    }
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
    case '🔓': {
      // Open wrought-iron padlock
      ctx.fillStyle = '#2A170A';
      ctx.fillRect(cx - r * 0.7, cy - r * 0.2, r * 1.4, r * 1.1);
      ctx.strokeRect(cx - r * 0.7, cy - r * 0.2, r * 1.4, r * 1.1);
      // Swung open shackle
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.35, r * 0.45, Math.PI * 1.1, 0, false);
      ctx.stroke();
      // Brass keyhole
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '⚙': {
      // Wooden watermill cogwheel with iron hub
      ctx.fillStyle = '#8C5A35';
      ctx.beginPath();
      const teeth = 8;
      for (let i = 0; i < teeth * 2; i++) {
        const rad = i % 2 === 0 ? r * 1.05 : r * 0.75;
        const ang = (i * Math.PI) / teeth;
        const px = cx + Math.cos(ang) * rad;
        const py = cy + Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Iron hub
      ctx.fillStyle = '#2A170A';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '⚔': {
      // Crossed swords
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = size >= 26 ? 3.0 : 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy - r * 0.8);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.8);
      ctx.moveTo(cx + r * 0.8, cy - r * 0.8);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.8);
      ctx.stroke();
      // Brass crossguards
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 4.0 : 3.0;
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.35, cy + r * 0.65);
      ctx.lineTo(cx + r * 0.65, cy + r * 0.35);
      ctx.moveTo(cx - r * 0.65, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.35, cy + r * 0.65);
      ctx.stroke();
      break;
    }
    case '🗡': {
      // Hunting dagger
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = size >= 26 ? 3.2 : 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.7, cy - r * 0.7);
      ctx.stroke();
      // Brass crossguard
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 4.0 : 3.0;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.1, cy + r * 0.3);
      ctx.stroke();
      break;
    }
    case '🧊': {
      // Frost ice block
      ctx.fillStyle = '#BAE6FD';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.35);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.45);
      ctx.lineTo(cx, cy + r * 0.85);
      ctx.lineTo(cx - r * 0.8, cy + r * 0.45);
      ctx.lineTo(cx - r * 0.8, cy - r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Top facet
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.35);
      ctx.lineTo(cx, cy + r * 0.05);
      ctx.lineTo(cx - r * 0.8, cy - r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '💤': {
      // Folk Zzz snore
      ctx.fillStyle = '#60A5FA';
      ctx.font = `900 ${Math.round(size * 0.6)}px Eczar, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Z', cx - r * 0.25, cy + r * 0.2);
      ctx.font = `900 ${Math.round(size * 0.45)}px Eczar, serif`;
      ctx.fillText('z', cx + r * 0.45, cy - r * 0.35);
      break;
    }
    case '🔱': {
      // Wrought-iron three-prong pitchfork / vidle
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = size >= 26 ? 3.0 : 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.9);
      ctx.lineTo(cx, cy - r * 0.2);
      ctx.stroke();
      // 3 Iron prongs
      ctx.strokeStyle = '#2A170A';
      ctx.lineWidth = size >= 26 ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.2);
      ctx.lineTo(cx, cy - r * 0.95);
      ctx.moveTo(cx - r * 0.6, cy - r * 0.8);
      ctx.quadraticCurveTo(cx - r * 0.5, cy - r * 0.1, cx, cy - r * 0.1);
      ctx.quadraticCurveTo(cx + r * 0.5, cy - r * 0.1, cx + r * 0.6, cy - r * 0.8);
      ctx.stroke();
      break;
    }
    case '⛪': {
      // Village chapel with red roof & tower cross
      ctx.fillStyle = '#FAF5E8';
      ctx.fillRect(cx - r * 0.7, cy - r * 0.1, r * 1.4, r * 0.9);
      ctx.strokeRect(cx - r * 0.7, cy - r * 0.1, r * 1.4, r * 0.9);
      // Red gabled roof
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.85, cy - r * 0.1);
      ctx.lineTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.85, cy - r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Golden belltower cross
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.lineTo(cx, cy - r * 1.15);
      ctx.moveTo(cx - r * 0.2, cy - r * 1.02);
      ctx.lineTo(cx + r * 0.2, cy - r * 1.02);
      ctx.stroke();
      break;
    }
    case '☀': {
      // Golden village sun
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 2.2 : 1.6;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (r * 0.65), cy + Math.sin(ang) * (r * 0.65));
        ctx.lineTo(cx + Math.cos(ang) * (r * 0.95), cy + Math.sin(ang) * (r * 0.95));
        ctx.stroke();
      }
      break;
    }
    case '🧺': {
      // Woven wicker basket
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.75, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.75, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.55, cy + r * 0.8);
      ctx.lineTo(cx - r * 0.55, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Woven overhead handle
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.1, r * 0.65, Math.PI, 0, false);
      ctx.stroke();
      break;
    }
    case '🌾': {
      // Golden wheat ear
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = size >= 26 ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.9);
      ctx.lineTo(cx, cy - r * 0.8);
      ctx.stroke();
      // Grains
      ctx.fillStyle = '#FEF08A';
      for (let i = 0; i < 4; i++) {
        const gy = cy + r * 0.4 - i * r * 0.35;
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, gy, r * 0.22, r * 0.32, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.3, gy, r * 0.22, r * 0.32, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case '✒': {
      // Goose feather quill
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy + r * 0.8);
      ctx.quadraticCurveTo(cx - r * 0.3, cy - r * 0.5, cx + r * 0.8, cy - r * 0.9);
      ctx.quadraticCurveTo(cx + r * 0.2, cy + r * 0.1, cx - r * 0.7, cy + r * 0.8);
      ctx.fill();
      ctx.stroke();
      // Ink tip
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx - r * 0.65, cy + r * 0.75, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🪦': {
      // Cemetery headstone
      ctx.fillStyle = '#A1A1AA';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.8);
      ctx.lineTo(cx - r * 0.6, cy - r * 0.2);
      ctx.arc(cx, cy - r * 0.2, r * 0.6, Math.PI, 0, false);
      ctx.lineTo(cx + r * 0.6, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Carved cross
      ctx.strokeStyle = '#1A1612';
      ctx.lineWidth = size >= 26 ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.45);
      ctx.lineTo(cx, cy + r * 0.3);
      ctx.moveTo(cx - r * 0.25, cy - r * 0.2);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.2);
      ctx.stroke();
      break;
    }
    case '💧': {
      // Water dew drop
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.95);
      ctx.bezierCurveTo(cx + r * 0.85, cy, cx + r * 0.7, cy + r * 0.85, cx, cy + r * 0.85);
      ctx.bezierCurveTo(cx - r * 0.7, cy + r * 0.85, cx - r * 0.85, cy, cx, cy - r * 0.95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Highlight
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.arc(cx - r * 0.25, cy + r * 0.1, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🐸': {
      // Millpond frog head
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.1, r * 0.8, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Protruding bulbous eyes
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx - r * 0.45, cy - r * 0.35, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.45, cy - r * 0.35, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '⛓': {
      // Two interlocking iron chain links
      ctx.strokeStyle = '#52525B';
      ctx.lineWidth = size >= 26 ? 3.0 : 2.2;
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.3, cy - r * 0.2, r * 0.45, r * 0.25, -Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(cx + r * 0.3, cy + r * 0.2, r * 0.45, r * 0.25, -Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case '🦷': {
      // Fang tooth
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.45, cy - r * 0.7);
      ctx.bezierCurveTo(cx + r * 0.4, cy, cx, cy + r * 0.9, cx, cy + r * 0.9);
      ctx.bezierCurveTo(cx, cy + r * 0.9, cx - r * 0.4, cy, cx - r * 0.45, cy - r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🎒': {
      // Wanderer haversack
      ctx.fillStyle = '#8C5A35';
      ctx.fillRect(cx - r * 0.65, cy - r * 0.4, r * 1.3, r * 1.2);
      ctx.strokeRect(cx - r * 0.65, cy - r * 0.4, r * 1.3, r * 1.2);
      // Flap
      ctx.fillStyle = '#5E3A21';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.7, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.5, cy + r * 0.3);
      ctx.lineTo(cx - r * 0.5, cy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Buckle
      ctx.fillStyle = '#D9A036';
      ctx.fillRect(cx - r * 0.15, cy + r * 0.15, r * 0.3, r * 0.25);
      break;
    }
    case '🪓': {
      // Woodcutter's axe
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = size >= 26 ? 3.2 : 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.8);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.7);
      ctx.stroke();
      // Axe blade
      ctx.fillStyle = '#71717A';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.2, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.9, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.6, cy);
      ctx.lineTo(cx + r * 0.05, cy - r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🎯': {
      // Target
      ctx.fillStyle = '#F3E9D2';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🥐': {
      // Czech baked rohlík / loupák
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, Math.PI * 0.2, Math.PI * 1.1, false);
      ctx.bezierCurveTo(cx - r * 0.4, cy - r * 0.3, cx + r * 0.2, cy - r * 0.6, cx + r * 0.6, cy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🎁': {
      // Wrapped gift package
      ctx.fillStyle = '#F3E9D2';
      ctx.fillRect(cx - r * 0.65, cy - r * 0.4, r * 1.3, r * 1.1);
      ctx.strokeRect(cx - r * 0.65, cy - r * 0.4, r * 1.3, r * 1.1);
      // Ribbon
      ctx.fillStyle = '#C83E31';
      ctx.fillRect(cx - r * 0.15, cy - r * 0.4, r * 0.3, r * 1.1);
      ctx.fillRect(cx - r * 0.65, cy + r * 0.05, r * 1.3, r * 0.25);
      // Bow
      ctx.beginPath();
      ctx.arc(cx - r * 0.2, cy - r * 0.55, r * 0.2, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.2, cy - r * 0.55, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🏺': {
      // Clay jug / džbán
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy - r * 0.75);
      ctx.lineTo(cx + r * 0.35, cy - r * 0.75);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.3);
      ctx.bezierCurveTo(cx + r * 0.8, cy, cx + r * 0.7, cy + r * 0.75, cx, cy + r * 0.85);
      ctx.bezierCurveTo(cx - r * 0.7, cy + r * 0.75, cx - r * 0.8, cy, cx - r * 0.25, cy - r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Handle
      ctx.beginPath();
      ctx.arc(cx + r * 0.55, cy + r * 0.1, r * 0.3, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    }
    case '🕊': {
      // White dove
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.8, cy + r * 0.3);
      ctx.quadraticCurveTo(cx - r * 0.2, cy - r * 0.8, cx + r * 0.6, cy - r * 0.7);
      ctx.lineTo(cx + r * 0.4, cy);
      ctx.lineTo(cx + r * 0.8, cy + r * 0.5);
      ctx.lineTo(cx, cy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🍯': {
      // Stoneware honey pot
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.2, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tied linen cover
      ctx.fillStyle = '#F3E9D2';
      ctx.fillRect(cx - r * 0.55, cy - r * 0.6, r * 1.1, r * 0.35);
      ctx.strokeRect(cx - r * 0.55, cy - r * 0.6, r * 1.1, r * 0.35);
      // Honey drip
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.15, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🖍': {
      // Three Kings chalk
      ctx.fillStyle = '#FAF5E8';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.5, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.8, cy - r * 0.3);
      ctx.lineTo(cx - r * 0.3, cy + r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '♫':
    case '🎵':
    case '🎶': {
      // Musical eighth note
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.25, cy + r * 0.45, r * 0.35, r * 0.25, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#1A1612';
      ctx.lineWidth = size >= 26 ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.05, cy + r * 0.35);
      ctx.lineTo(cx - r * 0.05, cy - r * 0.75);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.45);
      ctx.stroke();
      break;
    }
    case '🔊':
    case '📯': {
      // Post horn
      ctx.strokeStyle = '#D9A036';
      ctx.lineWidth = size >= 26 ? 3.0 : 2.2;
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      // Bell
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.3, cy - r * 0.1);
      ctx.lineTo(cx + r * 0.85, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.85, cy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🔨': {
      // Blacksmith hammer
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = size >= 26 ? 3.0 : 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy + r * 0.7);
      ctx.lineTo(cx + r * 0.3, cy - r * 0.4);
      ctx.stroke();
      // Heavy iron hammer head
      ctx.fillStyle = '#3F3F46';
      ctx.fillRect(cx + r * 0.1, cy - r * 0.8, r * 0.7, r * 0.45);
      ctx.strokeRect(cx + r * 0.1, cy - r * 0.8, r * 0.7, r * 0.45);
      break;
    }
    case '🗿': {
      // Wayside stone monument / idol
      ctx.fillStyle = '#78716C';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy + r * 0.85);
      ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
      ctx.lineTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.55, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.45, cy + r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🌱': {
      // Spring seedling
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.4, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Stem
      ctx.strokeStyle = '#4D7C0F';
      ctx.lineWidth = size >= 26 ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.8);
      ctx.lineTo(cx, cy - r * 0.2);
      ctx.stroke();
      break;
    }
    case '🍂':
    case '🍁': {
      // Autumn fallen leaf
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.bezierCurveTo(cx + r * 0.85, cy - r * 0.2, cx + r * 0.5, cy + r * 0.7, cx, cy + r * 0.85);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.7, cx - r * 0.85, cy - r * 0.2, cx, cy - r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🐦‍⬛':
    case '🐦': {
      // Crow / black raven profile
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Beak
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.4, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.9, cy);
      ctx.lineTo(cx + r * 0.4, cy + r * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🦁': {
      // Bohemian heraldic lion
      ctx.fillStyle = '#D9A036';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Mane tufts
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy - r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.5, cy - r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🌙': {
      // Nocturnal crescent moon
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, Math.PI * 0.5, Math.PI * 1.5, false);
      ctx.bezierCurveTo(cx + r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3, cx, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🔘': {
      // Pewter coat button
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx - r * 0.22, cy, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.22, cy, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '✦': {
      // Four-point folk star
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.95);
      ctx.quadraticCurveTo(cx, cy, cx + r * 0.95, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + r * 0.95);
      ctx.quadraticCurveTo(cx, cy, cx - r * 0.95, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - r * 0.95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '♥': {
      // Playing card heart
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.8, cy - r * 1.1, cx + r, cy + r * 0.2, cx, cy + r);
      ctx.bezierCurveTo(cx - r, cy + r * 0.2, cx - r * 0.8, cy - r * 1.1, cx, cy - r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '♦': {
      // Playing card diamond
      ctx.fillStyle = '#C83E31';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.9);
      ctx.lineTo(cx + r * 0.75, cy);
      ctx.lineTo(cx, cy + r * 0.9);
      ctx.lineTo(cx - r * 0.75, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '♠': {
      // Playing card spade
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.bezierCurveTo(cx + r * 0.8, cy - r * 0.2, cx + r * 0.5, cy + r * 0.5, cx, cy + r * 0.4);
      ctx.bezierCurveTo(cx - r * 0.5, cy + r * 0.5, cx - r * 0.8, cy - r * 0.2, cx, cy - r * 0.85);
      ctx.fill();
      // Base
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.35, cy + r * 0.85);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.85);
      ctx.lineTo(cx, cy + r * 0.4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case '♣': {
      // Playing card club
      ctx.fillStyle = '#1A1612';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.35, cy + r * 0.1, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.35, cy + r * 0.1, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Base
      ctx.fillRect(cx - r * 0.15, cy + r * 0.1, r * 0.3, r * 0.75);
      break;
    }
    case '🌨': {
      // Snowcloud with snowflakes
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.45, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.2, cy - r * 0.25, r * 0.5, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.4, cy + r * 0.05, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Falling snowflakes
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx - r * 0.4, cy + r * 0.6, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx, cy + r * 0.75, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.4, cy + r * 0.6, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🏔': {
      // Mountain peak
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.85, cy + r * 0.8);
      ctx.lineTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.85, cy + r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Snow cap
      ctx.fillStyle = '#FFFDF6';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.85);
      ctx.lineTo(cx + r * 0.35, cy - r * 0.2);
      ctx.lineTo(cx - r * 0.35, cy - r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case '✝': {
      // Wayside wooden cross
      ctx.fillStyle = '#8C5A35';
      ctx.fillRect(cx - r * 0.18, cy - r * 0.9, r * 0.36, r * 1.75);
      ctx.strokeRect(cx - r * 0.18, cy - r * 0.9, r * 0.36, r * 1.75);
      ctx.fillRect(cx - r * 0.7, cy - r * 0.4, r * 1.4, r * 0.35);
      ctx.strokeRect(cx - r * 0.7, cy - r * 0.4, r * 1.4, r * 0.35);
      break;
    }
    case '⚠':
    case '🚨': {
      // Warning triangle
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.9);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.75);
      ctx.lineTo(cx - r * 0.9, cy + r * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Exclamation mark
      ctx.fillStyle = '#1A1612';
      ctx.fillRect(cx - r * 0.1, cy - r * 0.4, r * 0.2, r * 0.55);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.5, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case '🍀': {
      // Four-leaf clover
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.3, cy + r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.3, cy + r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case '🍖': {
      // Smoked roasted ham leg
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.1, cy, r * 0.65, r * 0.5, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Ivory bone
      ctx.fillStyle = '#FFFDF6';
      ctx.fillRect(cx - r * 0.8, cy + r * 0.15, r * 0.45, r * 0.25);
      ctx.strokeRect(cx - r * 0.8, cy + r * 0.15, r * 0.45, r * 0.25);
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
  private readonly glyphsScratch: CachedGlyph[] = [];
  private static readonly spaceGlyph: CachedGlyph = {
    char: ' ',
    size: 18,
    color: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    advanceWidth: 7,
  };

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

    const glyphsToDraw = this.glyphsScratch;
    glyphsToDraw.length = 0;
    let hasUncachedChar = false;

    // Check if string contains any high/low surrogate pairs (e.g. multi-byte emoji sequences)
    let hasSurrogates = false;
    const textLen = text.length;
    for (let i = 0; i < textLen; i++) {
      const code = text.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdfff) {
        hasSurrogates = true;
        break;
      }
    }

    GlyphAtlas.spaceGlyph.advanceWidth = Math.ceil(size * 0.4);

    if (hasSurrogates) {
      const rawTokens = Array.from(text);
      for (let i = 0; i < rawTokens.length; i++) {
        const token = rawTokens[i];
        if (token === '\uFE0F') continue; // Skip variation selector

        if (token === ' ') {
          glyphsToDraw.push(GlyphAtlas.spaceGlyph);
          continue;
        }

        const g = this.getGlyph(token, size, color);
        if (!g) {
          hasUncachedChar = true;
          break;
        }
        glyphsToDraw.push(g);
      }
    } else {
      for (let i = 0; i < textLen; i++) {
        const char = text[i];
        if (char === ' ') {
          glyphsToDraw.push(GlyphAtlas.spaceGlyph);
          continue;
        }
        const g = this.getGlyph(char, size, color);
        if (!g) {
          hasUncachedChar = true;
          break;
        }
        glyphsToDraw.push(g);
      }
    }

    if (hasUncachedChar) {
      if (options?.useStampCache) {
        return this.drawWordStamp(ctx, text, x, y, options);
      }
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

    const segments = splitTextAndEmojis(text);
    const hasAnyEmoji = segments.some((s) => s.isEmoji);

    if (!hasAnyEmoji) {
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
      return false;
    }

    // Measure total width to center align
    const emojiSlotWidth = Math.ceil(size * 1.25);
    let totalW = 0;
    for (const seg of segments) {
      if (seg.isEmoji) {
        totalW += emojiSlotWidth;
      } else {
        totalW += ctx.measureText(seg.token).width;
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let startX = x - totalW * 0.5;

    for (const seg of segments) {
      if (seg.isEmoji) {
        const cx = startX + emojiSlotWidth / 2;
        const cy = y - size * 0.35;
        drawStaticMiniIcon(ctx, seg.token, cx, cy, size);
        startX += emojiSlotWidth;
      } else {
        ctx.strokeText(seg.token, startX, y);
        ctx.fillStyle = color;
        ctx.fillText(seg.token, startX, y);
        startX += ctx.measureText(seg.token).width;
      }
    }

    ctx.restore();
    return false;
  }

  public drawWordStamp(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options?: DrawGlyphOptions
  ): boolean {
    const size = options?.size ?? 18;
    const color = (options?.color ?? '#FFFFFF').toUpperCase();
    const alpha = options?.alpha ?? 1.0;

    const stamp = this.wordStampCache.getOrCreate(text, size, color);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.drawImage(
      stamp.canvas,
      Math.round(x - stamp.width * 0.5),
      Math.round(y - stamp.baseline)
    );
    ctx.restore();
    return true;
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

const defaultDrawGlyphOptions: DrawGlyphOptions = {
  useStampCache: true,
};

export function drawGlyphText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: DrawGlyphOptions
): boolean {
  if (options) {
    if (options.useStampCache === undefined) {
      options.useStampCache = true;
    }
    return getGlobalGlyphAtlas().draw(ctx, text, x, y, options);
  }
  return getGlobalGlyphAtlas().draw(ctx, text, x, y, defaultDrawGlyphOptions);
}
