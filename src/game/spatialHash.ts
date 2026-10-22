const HASH_OFFSET = 32768;

function getCellKey(cx: number, cy: number): number {
  return (((cx + HASH_OFFSET) & 0xffff) << 16) | ((cy + HASH_OFFSET) & 0xffff);
}

export class SpatialHash<T extends { x: number; y: number }> {
  private readonly cellSize: number;
  private readonly cells: Map<number, T[]>;
  private readonly touchedCells: number[];

  // Stack of preallocated scratch arrays for re-entrant / nested queries without allocations (ADR 0029)
  public static readonly SCRATCH_CAPACITY = 8;
  private readonly scratchStack: T[][] = Array.from(
    { length: SpatialHash.SCRATCH_CAPACITY },
    () => [],
  );
  private scratchDepth = 0;
  private scratchPoolIndex = 0;

  constructor(cellSize: number = 180) {
    if (!Number.isFinite(cellSize) || cellSize <= 0) {
      throw new RangeError(
        `SpatialHash cellSize must be > 0, got ${cellSize}`,
      );
    }

    this.cellSize = cellSize;
    this.cells = new Map();
    this.touchedCells = [];
  }

  clear(): void {
    const len = this.touchedCells.length;
    for (let i = 0; i < len; i++) {
      const cell = this.cells.get(this.touchedCells[i]);
      if (cell) cell.length = 0;
    }
    this.touchedCells.length = 0;
    for (let i = 0; i < this.scratchStack.length; i++) {
      this.scratchStack[i].length = 0;
    }
    this.scratchDepth = 0;
    this.scratchPoolIndex = 0;
  }

  insert(entity: T): void {
    if (!Number.isFinite(entity.x) || !Number.isFinite(entity.y)) return;

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

  rebuild(entities: readonly T[] | null | undefined): void {
    this.clear();
    if (!entities || entities.length === 0) return;
    const len = entities.length;
    for (let i = 0; i < len; i++) {
      this.insert(entities[i]);
    }
  }

  /**
   * Queries entities within a circle.
   *
   * Automatically cycles through preallocated scratch buffers so nested / re-entrant
   * queries do not corrupt each other's active results (ADR 0029).
   */
  queryCircle(x: number, y: number, radius: number): T[] {
    const buffer = this.scratchStack[this.scratchPoolIndex];
    this.scratchPoolIndex = (this.scratchPoolIndex + 1) % SpatialHash.SCRATCH_CAPACITY;
    buffer.length = 0;
    this.collectCircle(x, y, radius, buffer);
    return buffer;
  }

  queryRadius(x: number, y: number, radius: number): T[] {
    return this.queryCircle(x, y, radius);
  }

  /**
   * Fills a caller-owned array.
   *
   * Use this when the result must survive another SpatialHash query or persist across ticks.
   */
  queryCircleInto(
    x: number,
    y: number,
    radius: number,
    out: T[],
  ): T[] {
    out.length = 0;
    this.collectCircle(x, y, radius, out);
    return out;
  }

  queryRadiusInto(
    x: number,
    y: number,
    radius: number,
    out: T[],
  ): T[] {
    return this.queryCircleInto(x, y, radius, out);
  }

  /**
   * Scoped zero-allocation query: automatically acquires and releases
   * a depth-tracked scratch buffer from the scratch stack.
   */
  public withQuery(
    x: number,
    y: number,
    radius: number,
    fn: (results: readonly T[]) => void,
  ): void {
    let buffer: T[];
    let usedStack = false;
    if (this.scratchDepth < this.scratchStack.length) {
      buffer = this.scratchStack[this.scratchDepth++];
      usedStack = true;
    } else {
      buffer = [];
    }
    buffer.length = 0;
    try {
      this.collectCircle(x, y, radius, buffer);
      fn(buffer);
    } finally {
      buffer.length = 0;
      if (usedStack) {
        this.scratchDepth--;
      }
    }
  }

  private collectCircle(
    x: number,
    y: number,
    radius: number,
    out: T[],
  ): void {
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(radius) ||
      radius < 0
    ) {
      return;
    }

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
            out.push(cell[i]);
          }
        }
      }
    }
  }

  query(x: number, y: number, radius: number): T[] {
    return this.queryCircle(x, y, radius);
  }

  queryNearest(x: number, y: number, maxRadius: number, filter?: (e: T) => boolean): T | null {
    let closest: T | null = null;
    let minDistSq = maxRadius * maxRadius;
    this.withQuery(x, y, maxRadius, (nearby) => {
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
    });
    return closest;
  }
}
