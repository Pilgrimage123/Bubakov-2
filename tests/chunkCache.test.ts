import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChunkBitmapCache, type ChunkBounds } from '../src/render/chunkCache';
import type { CameraViewport } from '../src/render/arenaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Chunk Bitmap Cache (Ticket #29)', () => {
  let ctx: CanvasRenderingContext2D;
  let camera: CameraViewport;

  beforeEach(() => {
    ctx = createMockCanvasContext();
    camera = {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      viewLeft: -640,
      viewTop: -360,
      viewRight: 640,
      viewBottom: 360,
    };
  });

  it('partitions static decor items into spatial chunks and renders each item only once', () => {
    const drawDecor1 = vi.fn();
    const drawDecor2 = vi.fn();

    const decorList = [
      { x: 100, y: 100, type: 'tree', scale: 1, draw: drawDecor1 } as any,
      { x: 1500, y: 1500, type: 'roubenka', scale: 1, draw: drawDecor2 } as any,
    ];

    const cache = new ChunkBitmapCache({ chunkSize: 512 });
    cache.build(decorList, 'winter', 'meadow', false);

    // Initial build calls draw on each decor item once
    expect(drawDecor1).toHaveBeenCalledTimes(1);
    expect(drawDecor2).toHaveBeenCalledTimes(1);

    // Frame rendering does not re-call decor item draw methods
    const activeChunks = cache.render(ctx, camera);
    expect(drawDecor1).toHaveBeenCalledTimes(1);
    expect(drawDecor2).toHaveBeenCalledTimes(1);

    // Only chunk containing decor1 (-640..640) was drawn, decor2 at (1500,1500) was culled
    expect(activeChunks).toBe(1);
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
  });

  it('correctly maps negative and positive coordinates to chunk keys', () => {
    const cache = new ChunkBitmapCache({ chunkSize: 512 });
    expect(cache.getChunkKey(-50, -100)).toBe('-1,-1');
    expect(cache.getChunkKey(0, 0)).toBe('0,0');
    expect(cache.getChunkKey(511, 511)).toBe('0,0');
    expect(cache.getChunkKey(512, 512)).toBe('1,1');
    expect(cache.getChunkKey(-513, 100)).toBe('-2,0');
  });

  it('excludes interactive / dynamic objects like kaca from static bitmap cache', () => {
    const drawStatic = vi.fn();
    const drawDynamic = vi.fn();

    const decorList = [
      { x: 50, y: 50, type: 'tree', scale: 1, draw: drawStatic } as any,
      { x: 60, y: 60, type: 'kaca', scale: 1, draw: drawDynamic } as any,
    ];

    const cache = new ChunkBitmapCache({ chunkSize: 512 });
    cache.build(decorList, 'winter', 'meadow', false);

    expect(drawStatic).toHaveBeenCalledTimes(1);
    expect(drawDynamic).not.toHaveBeenCalled();
    expect(cache.getDynamicDecor().length).toBe(1);
    expect(cache.getDynamicDecor()[0].type).toBe('kaca');
  });

  it('invalidates and rebuilds when season, theme or night mode changes', () => {
    const drawDecor = vi.fn();
    const decorList = [
      { x: 100, y: 100, type: 'tree', scale: 1, draw: drawDecor } as any,
    ];

    const cache = new ChunkBitmapCache({ chunkSize: 512 });
    cache.build(decorList, 'winter', 'meadow', false);
    expect(drawDecor).toHaveBeenCalledTimes(1);

    // Rebuild when night mode changes
    cache.build(decorList, 'winter', 'meadow', true);
    expect(drawDecor).toHaveBeenCalledTimes(2);
  });

  it('rebuildIfChanged only rebuilds when day/night, season or theme actually changes', () => {
    const drawDecor = vi.fn();
    const decorList = [
      { x: 100, y: 100, type: 'tree', scale: 1, draw: drawDecor } as any,
    ];

    const cache = new ChunkBitmapCache({ chunkSize: 512 });
    cache.build(decorList, 'winter', 'meadow', false);
    expect(drawDecor).toHaveBeenCalledTimes(1);

    // Same state: no rebuild
    const changed1 = cache.rebuildIfChanged(decorList, 'winter', 'meadow', false);
    expect(changed1).toBe(false);
    expect(drawDecor).toHaveBeenCalledTimes(1);

    // Night phase transition: rebuilds!
    const changed2 = cache.rebuildIfChanged(decorList, 'winter', 'meadow', true);
    expect(changed2).toBe(true);
    expect(drawDecor).toHaveBeenCalledTimes(2);
  });

  it('decouples time of day when timeOfDayDecoupled is enabled, preventing rebuild freezes', () => {
    const drawDecor = vi.fn();
    const decorList = [
      { x: 100, y: 100, type: 'tree', scale: 1, draw: drawDecor } as any,
    ];

    const cache = new ChunkBitmapCache({ chunkSize: 512, timeOfDayDecoupled: true });
    cache.build(decorList, 'winter', 'meadow', false);
    expect(drawDecor).toHaveBeenCalledTimes(1);

    // Day/night phase transition should NOT rebuild or cause GC allocation
    const changedNight = cache.rebuildIfChanged(decorList, 'winter', 'meadow', true);
    expect(changedNight).toBe(false);
    expect(drawDecor).toHaveBeenCalledTimes(1);

    // Return to day should NOT rebuild either
    const changedDay = cache.rebuildIfChanged(decorList, 'winter', 'meadow', false);
    expect(changedDay).toBe(false);
    expect(drawDecor).toHaveBeenCalledTimes(1);
  });
});
