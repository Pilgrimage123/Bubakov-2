import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GlyphAtlas,
  getGlobalGlyphAtlas,
  drawGlyphText,
} from '../src/render/glyphAtlas';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Bitmap Glyph Cache for Combat Numbers (Ticket #32)', () => {
  let ctx: CanvasRenderingContext2D;
  let atlas: GlyphAtlas;

  beforeEach(() => {
    ctx = createMockCanvasContext();
    atlas = new GlyphAtlas();
    atlas.init();
  });

  it('pre-renders digits 0-9 and combat punctuation into atlas', () => {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '!', '%'];
    for (const ch of chars) {
      const glyph = atlas.getGlyph(ch, 18, '#FFFFFF');
      expect(glyph).toBeDefined();
      expect(glyph?.width).toBeGreaterThan(0);
      expect(glyph?.height).toBeGreaterThan(0);
    }
  });

  it('renders numeric damage text via bitmap blitting without calling strokeText or fillText', () => {
    const handled = atlas.draw(ctx, '450', 100, 200, { size: 18, color: '#FFFFFF' });

    expect(handled).toBe(true);
    // 3 digits blitted from atlas
    expect(ctx.drawImage).toHaveBeenCalledTimes(3);
    // Vector rasterization skipped
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.strokeText).not.toHaveBeenCalled();
  });

  it('correctly tracks character advance width during blitting', () => {
    atlas.draw(ctx, '78', 50, 60, { size: 18, color: '#FFFFFF' });

    expect(ctx.drawImage).toHaveBeenCalledTimes(2);
    const calls = (ctx.drawImage as any).mock.calls;
    // Destination X of second digit should be greater than destination X of first digit
    const firstDigitDstX = calls[0][5];
    const secondDigitDstX = calls[1][5];
    expect(secondDigitDstX).toBeGreaterThan(firstDigitDstX);
  });

  it('falls back safely to vector text methods for uncached complex words', () => {
    const handled = atlas.draw(ctx, 'ZOUFALÁ KURÁŽ', 100, 200, { size: 18, color: '#FFFFFF' });

    expect(handled).toBe(false);
    expect(ctx.fillText).toHaveBeenCalledWith('ZOUFALÁ KURÁŽ', 100, 200);
    expect(ctx.strokeText).toHaveBeenCalledWith('ZOUFALÁ KURÁŽ', 100, 200);
  });

  it('global helper drawGlyphText works seamlessly', () => {
    const handled = drawGlyphText(ctx, '+75', 200, 300, { size: 26, color: '#10B981' });
    expect(handled).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(3);
  });
});
