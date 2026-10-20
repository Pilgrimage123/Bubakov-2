import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BakedBubakAtlas, getGlobalBakedBubakAtlas } from '../src/render/bakedBubakAtlas';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Sprite-Baking Pilot for Common Bubáks (Plan Section 6)', () => {
  let atlas: BakedBubakAtlas;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    atlas = new BakedBubakAtlas();
    atlas.init();
    ctx = createMockCanvasContext();
  });

  it('pre-renders 4 animation phases for each of the 3 pilot bubáks (rarach, mysak, bludicka)', () => {
    const pilotMobs = ['rarach', 'mysak', 'bludicka'] as const;

    for (const mobId of pilotMobs) {
      for (let step = 0; step < 4; step++) {
        const frame = atlas.getFrame(mobId, step * 0.5);
        expect(frame).toBeDefined();
        expect(frame?.width).toBe(96);
        expect(frame?.height).toBe(96);
        expect(frame?.originX).toBe(48);
        expect(frame?.originY).toBe(48);
      }
    }
  });

  it('draws pilot bubak via fast bitmap blitting (ctx.drawImage) instead of vector re-rasterization', () => {
    const drawn = atlas.draw(ctx, 'rarach', 200, 300, 0.4);
    expect(drawn).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    const args = (ctx.drawImage as any).mock.calls[0];
    // x = 200 - originX(48) = 152, y = 300 - originY(48) = 252
    expect(args[1]).toBe(152);
    expect(args[2]).toBe(252);
  });

  it('global atlas singleton is available and initialized', () => {
    const globalAtlas = getGlobalBakedBubakAtlas();
    expect(globalAtlas).toBeDefined();
    const frame = globalAtlas.getFrame('mysak', 0);
    expect(frame).toBeDefined();
  });
});
