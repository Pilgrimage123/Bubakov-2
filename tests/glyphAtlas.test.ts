import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GlyphAtlas,
  getGlobalGlyphAtlas,
  resetGlobalGlyphAtlas,
  drawGlyphText,
  splitTextAndEmojis,
  isSupportedCanvasEmoji,
  SUPPORTED_CANVAS_EMOJIS,
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

  it('falls back safely to vector text methods for uncached complex words when useStampCache is false', () => {
    const handled = atlas.draw(ctx, 'ZOUFALÁ KURÁŽ', 100, 200, { size: 18, color: '#FFFFFF', useStampCache: false });

    expect(handled).toBe(false);
    expect(ctx.fillText).toHaveBeenCalledWith('ZOUFALÁ KURÁŽ', 100, 200);
    expect(ctx.strokeText).toHaveBeenCalledWith('ZOUFALÁ KURÁŽ', 100, 200);
  });

  it('WordStampCache caches offscreen stamps and evicts oldest when exceeding max capacity', () => {
    const cache = atlas.wordStampCache;
    const stamp1 = cache.getOrCreate('Word1', 18, '#FFFFFF');
    const stamp2 = cache.getOrCreate('Word1', 18, '#FFFFFF');
    expect(stamp1).toBe(stamp2);
    expect(cache.size).toBe(1);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('blits non-numeric combat text via WordStampCache without calling strokeText or fillText on target context', () => {
    const handled = atlas.draw(ctx, 'DODGE!', 100, 200, { size: 18, color: '#FFFFFF', useStampCache: true });
    expect(handled).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('global helper drawGlyphText works seamlessly', () => {
    const handled = drawGlyphText(ctx, '+75', 200, 300, { size: 26, color: '#10B981' });
    expect(handled).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(3);
  });

  it('WordStampCache caches offscreen stamps and evicts oldest when exceeding max capacity', () => {
    const cache = atlas.wordStampCache;
    cache.clear();

    for (let i = 0; i < 130; i++) {
      cache.getOrCreate(`Word_${i}`, 18, '#FFFFFF');
    }

    expect(cache.size).toBe(128);
    // Oldest items (Word_0, Word_1) should have been evicted
    expect(cache.get('Word_0_18_#FFFFFF')).toBeUndefined();
    expect(cache.get('Word_1_18_#FFFFFF')).toBeUndefined();
    // Recent items must exist
    expect(cache.get('Word_129_18_#FFFFFF')).toBeDefined();
  });

  it('blits non-numeric combat text via WordStampCache without calling strokeText or fillText on target context', () => {
    const handled = atlas.drawWordStamp(ctx, 'ŠVIH! 🥒', 120, 240, { size: 18, color: '#EF4444' });

    expect(handled).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.strokeText).not.toHaveBeenCalled();
  });

  it('drawGlyphText automatically uses word stamp cache for words with emoji and diacritics', () => {
    const handled = drawGlyphText(ctx, 'PŘEJEDENÍ! 🥒', 150, 250, { size: 26, color: '#F59E0B' });

    expect(handled).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).not.toHaveBeenCalled();
    expect(ctx.strokeText).not.toHaveBeenCalled();
  });

  it('WordStampCache.clear sets canvas dimensions to 0 to free GPU backing buffers', () => {
    const cache = atlas.wordStampCache;
    cache.clear();

    const stamp1 = cache.getOrCreate('Test1', 18, '#FFFFFF');
    const stamp2 = cache.getOrCreate('Test2', 18, '#FFFFFF');
    expect(stamp1.canvas.width).toBeGreaterThan(0);
    expect(stamp2.canvas.width).toBeGreaterThan(0);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(stamp1.canvas.width).toBe(0);
    expect(stamp1.canvas.height).toBe(0);
    expect(stamp2.canvas.width).toBe(0);
    expect(stamp2.canvas.height).toBe(0);
  });

  it('WordStampCache evicting oldest item frees its canvas dimensions', () => {
    const cache = atlas.wordStampCache;
    cache.clear();

    const stamp0 = cache.getOrCreate('Oldest', 18, '#FFFFFF');
    expect(stamp0.canvas.width).toBeGreaterThan(0);

    for (let i = 1; i <= 130; i++) {
      cache.getOrCreate(`Word_${i}`, 18, '#FFFFFF');
    }

    expect(stamp0.canvas.width).toBe(0);
    expect(stamp0.canvas.height).toBe(0);
  });

  it('resetGlobalGlyphAtlas clears cached word stamps', () => {
    getGlobalGlyphAtlas().wordStampCache.getOrCreate('Global1', 18, '#FFFFFF');
    expect(getGlobalGlyphAtlas().wordStampCache.size).toBeGreaterThan(0);

    resetGlobalGlyphAtlas();
    expect(getGlobalGlyphAtlas().wordStampCache.size).toBe(0);
  });

  it('splitTextAndEmojis properly segments plain text, emojis, and ZWJ sequences', () => {
    const plain = splitTextAndEmojis('Živoucí hvozd');
    expect(plain).toEqual([{ isEmoji: false, token: 'Živoucí hvozd' }]);

    const mixed = splitTextAndEmojis('⚡ 75 % ODHALENO');
    expect(mixed).toEqual([
      { isEmoji: true, token: '⚡' },
      { isEmoji: false, token: ' 75 % ODHALENO' },
    ]);

    const complex = splitTextAndEmojis('VÁLKA! ⚔️ A OHEŇ 🔥!');
    expect(complex).toEqual([
      { isEmoji: false, token: 'VÁLKA! ' },
      { isEmoji: true, token: '⚔' },
      { isEmoji: false, token: ' A OHEŇ ' },
      { isEmoji: true, token: '🔥' },
      { isEmoji: false, token: '!' },
    ]);

    const crowZWJ = splitTextAndEmojis('Hejno vran 🐦‍⬛ vánice');
    expect(crowZWJ).toEqual([
      { isEmoji: false, token: 'Hejno vran ' },
      { isEmoji: true, token: '🐦‍⬛' },
      { isEmoji: false, token: ' vánice' },
    ]);
  });

  it('WordStampCache.getOrCreate draws static mini-icons and never calls strokeText or fillText with emoji', () => {
    const cache = atlas.wordStampCache;
    const stamp = cache.getOrCreate('⚡ 75 % ODHALENO', 18, '#FEF3C7');

    expect(stamp).toBeDefined();
    expect(stamp.width).toBeGreaterThan(0);
    expect(stamp.height).toBeGreaterThan(0);

    // Verify stamp context was not called with the raw emoji
    const ctxCalls = (stamp.ctx.fillText as any)?.mock?.calls || [];
    for (const call of ctxCalls) {
      expect(call[0]).not.toContain('⚡');
      expect(call[0]).toBe(' 75 % ODHALENO');
    }
  });

  it('supports all required canvas emojis including newly added village symbols', () => {
    const required = [
      '⚙', '⚔', '🗡', '🧊', '💤', '🔱', '⛪', '☀', '🧺', '🌾',
      '✒', '🪦', '💧', '🐸', '⛓', '🦷', '🎒', '🪓', '🎯', '🥐',
      '🎁', '🏺', '🕊', '🍯', '🖍', '♫', '🎵', '🎶', '🔊', '📯',
      '🔨', '🗿', '🌱', '🍂', '🍁', '🐦‍⬛', '🐦', '🦁', '🌙', '🔘',
      '✦', '♥', '♦', '♠', '♣', '🌨', '🏔', '✝', '⚠', '🚨', '🍀', '🍖', '🔓'
    ];

    for (const emoji of required) {
      expect(isSupportedCanvasEmoji(emoji)).toBe(true);
      expect(SUPPORTED_CANVAS_EMOJIS).toContain(emoji);
    }
  });
});
