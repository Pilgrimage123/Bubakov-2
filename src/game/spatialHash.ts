/**
 * Reusable uniform spatial hash for combat broad-phase queries.
 * Buckets and the query result buffer are retained between frames to avoid
 * per-query array/string allocations.
 */
export class SpatialHash<T extends { x: number; y: number }> {
  private readonly cellSize: number;
  private readonly cells = new Map<number, T[]>();
  private readonly touchedCells: number[] = [];
  private readonly results: T[] = [];

  constructor(cellSize = 160) {
    this.cellSize = cellSize;
  }

  clear(): void {
    for (const key of this.touchedCells) {
      const bucket = this.cells.get(key);
      if (bucket) bucket.length = 0;
    }
    this.touchedCells.length = 0;
    this.results.length = 0;
  }

  rebuild(entities: readonly T[]): void {
    this.clear();
    for (const entity of entities) {
      const cx = Math.floor(entity.x / this.cellSize);
      const cy = Math.floor(entity.y / this.cellSize);
      const key = this.key(cx, cy);
      let bucket = this.cells.get(key);
      if (!bucket) {
        bucket = [];
        this.cells.set(key, bucket);
        this.touchedCells.push(key);
      }
      bucket.push(entity);
    }
  }

  queryCircle(x: number, y: number, radius: number): T[] {
    this.results.length = 0;
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) continue;
        for (const entity of bucket) this.results.push(entity);
      }
    }
    return this.results;
  }

  private key(cx: number, cy: number): number {
    return (cx + 32768) * 65536 + (cy + 32768);
  }
}
