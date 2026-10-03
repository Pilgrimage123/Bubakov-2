export class SpatialHash<T extends { x: number; y: number } = any> {
  cellSize: number;
  cells: Map<string, T[]>;
  touchedCells: string[];
  results: T[];

  constructor(cellSize: number = 180) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.touchedCells = [];
    this.results = [];
  }

  clear(): void {
    for (let i = 0; i < this.touchedCells.length; i++) {
      const cell = this.cells.get(this.touchedCells[i]);
      if (cell) cell.length = 0;
    }
    this.touchedCells.length = 0;
    this.results.length = 0;
  }

  insert(entity: T): void {
    const key = `${Math.floor(entity.x / this.cellSize)}_${Math.floor(entity.y / this.cellSize)}`;
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
    for (let i = 0; i < entities.length; i++) {
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
        const cell = this.cells.get(`${cx}_${cy}`);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
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
}
