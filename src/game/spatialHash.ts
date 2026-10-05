const HASH_OFFSET = 32768;

function getCellKey(cx: number, cy: number): number {
  return (((cx + HASH_OFFSET) & 0xffff) << 16) | ((cy + HASH_OFFSET) & 0xffff);
}

export class SpatialHash<T extends { x: number; y: number } = any> {
  cellSize: number;
  cells: Map<number, T[]>;
  touchedCells: number[];
  results: T[];

  constructor(cellSize: number = 180) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.touchedCells = [];
    this.results = [];
  }

  clear(): void {
    const len = this.touchedCells.length;
    for (let i = 0; i < len; i++) {
      const cell = this.cells.get(this.touchedCells[i]);
      if (cell) cell.length = 0;
    }
    this.touchedCells.length = 0;
    this.results.length = 0;
  }

  insert(entity: T): void {
    const cx = Math.floor(entity.x / this.cellSize);
    const cy = Math.floor(entity.y / this.cellSize);
    const key = getCellKey(cx, cy);
    let cell = this.cells.get(key);
    if (!cell) {
      cell = [];
      this.cells.set(key, cell);
    }
    if (cell.length === 0) {
      this.touchedCells.push(key);
    }
    cell.push(entity);
  }

  rebuild(entities: T[]): void {
    this.clear();
    if (!entities) return;
    const len = entities.length;
    for (let i = 0; i < len; i++) {
      this.insert(entities[i]);
    }
  }

  queryCircle(x: number, y: number, radius: number): T[] {
    this.results.length = 0;
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const cell = this.cells.get(getCellKey(cx, cy));
        if (cell) {
          const cellLen = cell.length;
          for (let i = 0; i < cellLen; i++) {
            this.results.push(cell[i]);
          }
        }
      }
    }
    return this.results;
  }

  query(x: number, y: number, radius: number): T[] {
    return this.queryCircle(x, y, radius);
  }

  queryNearest(x: number, y: number, maxRadius: number, filter?: (e: T) => boolean): T | null {
    const nearby = this.queryCircle(x, y, maxRadius);
    if (nearby.length === 0) return null;
    let closest: T | null = null;
    let minDistSq = maxRadius * maxRadius;
    const len = nearby.length;
    for (let i = 0; i < len; i++) {
      const e = nearby[i];
      if (filter && !filter(e)) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closest = e;
      }
    }
    return closest;
  }
}
