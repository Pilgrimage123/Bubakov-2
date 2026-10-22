/**
 * Fixed-capacity Ring Buffer for cosmetic effects (Combat Text, Hit Sparks, Blood Decals).
 *
 * Prevents V8 Minor GC (Scavenge) pauses during heavy combat without dropping gameplay state.
 * ADR 0029 - Priority 5: Deterministic Pooling vs. Cosmetic Budgets.
 */

export class CosmeticRingPool<T> {
  private readonly items: T[];
  private writeCursor = 0;
  public activeCount = 0;

  constructor(
    public readonly capacity: number,
    factory: (index: number) => T
  ) {
    this.items = Array.from({ length: capacity }, (_, i) => factory(i));
  }

  /**
   * Never allocates. If capacity is reached during a massive AoE hit,
   * overwrites the oldest cosmetic instance immediately.
   */
  public acquire(): T {
    const item = this.items[this.writeCursor];
    this.writeCursor = (this.writeCursor + 1) % this.capacity;
    if (this.activeCount < this.capacity) {
      this.activeCount++;
    }
    return item;
  }

  public get(index: number): T {
    return this.items[index];
  }

  public forEach(fn: (item: T, index: number) => void): void {
    const len = this.activeCount;
    for (let i = 0; i < len; i++) {
      fn(this.items[i], i);
    }
  }

  public clear(): void {
    this.writeCursor = 0;
    this.activeCount = 0;
  }

  public toArray(): T[] {
    return this.items.slice(0, this.activeCount);
  }
}
