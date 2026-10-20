/**
 * Chunk Bitmap Cache (Dlaždicová mezipaměť statické arény)
 * 
 * Partitions static arena decor (roubenky, trees, Boží muka, fences, snowdrifts)
 * into a spatial 2D grid of offscreen bitmap tiles generated once during expedition start.
 * In the frame loop, only tiles intersecting the camera viewport are blitted via drawImage.
 * 
 * ADR 0017
 */

import type { CameraViewport } from './arenaRenderer';

export interface ChunkBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ChunkCacheOptions {
  chunkSize?: number;
  timeOfDayDecoupled?: boolean;
}

export interface ChunkTile {
  cx: number;
  cy: number;
  canvas: HTMLCanvasElement | any;
  ctx: CanvasRenderingContext2D | any;
  itemCount: number;
}

function createOffscreenCanvas(width: number, height: number): { canvas: any; ctx: any } {
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
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
  };

  const canvas = {
    width,
    height,
    getContext: () => ctx,
  };

  return { canvas, ctx };
}

export class ChunkBitmapCache {
  public readonly chunkSize: number;
  public readonly timeOfDayDecoupled: boolean;
  private chunks: Map<string, ChunkTile> = new Map();
  private dynamicDecor: any[] = [];
  private lastSeason: string | null = null;
  private lastTheme: string | null = null;
  private lastIsNight: boolean | null = null;

  constructor(options?: ChunkCacheOptions) {
    this.chunkSize = options?.chunkSize || 512;
    this.timeOfDayDecoupled = options?.timeOfDayDecoupled ?? false;
  }

  public getChunkKey(x: number, y: number): string {
    const cx = Math.floor(x / this.chunkSize);
    const cy = Math.floor(y / this.chunkSize);
    return `${cx},${cy}`;
  }

  /**
   * Identifies whether a decor item is dynamic/interactive and should be excluded from static caching.
   */
  public isDynamicItem(item: any): boolean {
    if (!item) return false;
    if (item.isDynamic) return true;
    if (item.type === 'kaca') return true;
    if (typeof item.vx === 'number' || typeof item.vy === 'number') return true;
    return false;
  }

  /**
   * Rebuilds the chunk bitmap cache only if the season, theme, or night state has changed.
   * Returns true if rebuilt, false if cached state is still valid.
   */
  public rebuildIfChanged(
    decorList: any[],
    season = 'winter',
    theme = 'meadow',
    isNight = false
  ): boolean {
    const effectiveNight = this.timeOfDayDecoupled ? false : isNight;
    if (
      this.chunks.size > 0 &&
      this.lastSeason === season &&
      this.lastTheme === theme &&
      this.lastIsNight === effectiveNight
    ) {
      return false;
    }
    this.build(decorList, season, theme, effectiveNight);
    return true;
  }

  /**
   * Builds or rebuilds the chunk bitmap cache from the provided decor items.
   */
  public build(
    decorList: any[],
    season = 'winter',
    theme = 'meadow',
    isNight = false
  ): void {
    this.chunks.clear();
    this.dynamicDecor = [];
    this.lastSeason = season;
    this.lastTheme = theme;
    this.lastIsNight = isNight;

    if (!decorList || decorList.length === 0) return;

    // Group static items by chunk
    const chunkBuckets = new Map<string, { cx: number; cy: number; items: any[] }>();

    for (let i = 0; i < decorList.length; i++) {
      const item = decorList[i];
      if (this.isDynamicItem(item)) {
        this.dynamicDecor.push(item);
        continue;
      }

      const cx = Math.floor(item.x / this.chunkSize);
      const cy = Math.floor(item.y / this.chunkSize);
      const key = `${cx},${cy}`;

      let bucket = chunkBuckets.get(key);
      if (!bucket) {
        bucket = { cx, cy, items: [] };
        chunkBuckets.set(key, bucket);
      }
      bucket.items.push(item);
    }

    // Render each chunk bucket into an offscreen canvas once
    chunkBuckets.forEach((bucket, key) => {
      const { cx, cy, items } = bucket;
      const { canvas, ctx } = createOffscreenCanvas(this.chunkSize, this.chunkSize);

      ctx.save();
      // Translate chunk origin so coordinates (item.x, item.y) map correctly into the chunk canvas
      ctx.translate(-cx * this.chunkSize, -cy * this.chunkSize);

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (typeof item.draw === 'function') {
          item.draw(ctx, season, theme, 0, isNight);
        }
      }

      ctx.restore();

      this.chunks.set(key, {
        cx,
        cy,
        canvas,
        ctx,
        itemCount: items.length,
      });
    });
  }

  /**
   * Fast blit of visible chunk bitmaps intersecting the camera viewport.
   * Returns the count of active chunks drawn.
   */
  public render(ctx: CanvasRenderingContext2D, camera: CameraViewport): number {
    if (this.chunks.size === 0) return 0;

    const minCx = Math.floor(camera.viewLeft / this.chunkSize);
    const maxCx = Math.floor(camera.viewRight / this.chunkSize);
    const minCy = Math.floor(camera.viewTop / this.chunkSize);
    const maxCy = Math.floor(camera.viewBottom / this.chunkSize);

    let activeChunks = 0;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        const chunk = this.chunks.get(key);
        if (chunk) {
          activeChunks++;
          const worldX = cx * this.chunkSize;
          const worldY = cy * this.chunkSize;
          ctx.drawImage(chunk.canvas, worldX, worldY);
        }
      }
    }

    return activeChunks;
  }

  public getDynamicDecor(): any[] {
    return this.dynamicDecor;
  }

  public getChunkCount(): number {
    return this.chunks.size;
  }
}
