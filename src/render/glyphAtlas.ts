/**
 * Bitmap Glyph Atlas for Combat Floating Numbers (Glyph Cache)
 * 
 * Pre-renders digits 0-9, decimal point, signs and status punctuation with authentic Josef Lada
 * ink outline into a cached offscreen texture atlas.
 * Floating damage, healing and coin numbers are blitted as fast bitmap sub-rectangles,
 * completely eliminating vector font rasterization overhead and GPU stalls.
 * 
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
}

export interface DrawGlyphOptions {
  size?: number;
  color?: string;
  alpha?: number;
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
    rect: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
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

export class GlyphAtlas {
  private canvas: any = null;
  private ctx: any = null;
  private glyphs: Map<string, CachedGlyph> = new Map();
  private initialized = false;

  private makeKey(char: string, size: number, color: string): string {
    return `${char}_${size}_${color.toUpperCase()}`;
  }

  public init(): void {
    if (this.initialized) return;

    const atlasWidth = 512;
    const atlasHeight = 512;
    const { canvas, ctx } = createAtlasCanvas(atlasWidth, atlasHeight);
    this.canvas = canvas;
    this.ctx = ctx;

    let cursorX = 4;
    let cursorY = 4;
    let rowHeight = 0;

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

    this.initialized = true;
  }

  public getGlyph(char: string, size = 18, color = '#FFFFFF'): CachedGlyph | undefined {
    if (!this.initialized) this.init();
    const normalizedColor = color.toUpperCase();
    return this.glyphs.get(this.makeKey(char, size, normalizedColor));
  }

  /**
   * Fast blit of text string using pre-rendered glyphs.
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

    // Check if all characters can be served from atlas
    const glyphsToDraw: CachedGlyph[] = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ') {
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
      const g = this.getGlyph(ch, size, color);
      if (!g) {
        // Fallback: uncached character (e.g. arbitrary Czech words or unique status texts)
        return this.fallbackVectorDraw(ctx, text, x, y, size, options?.color ?? '#FFFFFF', alpha);
      }
      glyphsToDraw.push(g);
    }

    // Blit pre-rendered glyphs
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Align text centered if desired, or left-to-right from (x, y)
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
    alpha: number
  ): boolean {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.font = `900 ${size}px Eczar, "Cinzel Decorative", serif`;
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = size >= 26 ? 4.0 : 3.0;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
    return false;
  }
}

let globalGlyphAtlas: GlyphAtlas | null = null;

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
