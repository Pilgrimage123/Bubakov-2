import { describe, it, expect } from 'vitest';
import { CosmeticRingPool } from '../src/game/cosmeticRingPool';

describe('CosmeticRingPool (ADR 0029 Priority 5)', () => {
  it('preallocates fixed capacity upon construction', () => {
    let callCount = 0;
    const pool = new CosmeticRingPool(10, (idx) => {
      callCount++;
      return { id: idx, value: 0 };
    });

    expect(callCount).toBe(10);
    expect(pool.capacity).toBe(10);
    expect(pool.activeCount).toBe(0);
  });

  it('acquires instances without allocating new objects', () => {
    const pool = new CosmeticRingPool(4, (idx) => ({ id: idx, active: false }));

    const item0 = pool.acquire();
    const item1 = pool.acquire();
    const item2 = pool.acquire();
    const item3 = pool.acquire();

    expect(item0.id).toBe(0);
    expect(item1.id).toBe(1);
    expect(item2.id).toBe(2);
    expect(item3.id).toBe(3);
    expect(pool.activeCount).toBe(4);

    // 5th acquire wraps around and reuses oldest item (item 0)
    const item4 = pool.acquire();
    expect(item4).toBe(item0);
    expect(pool.activeCount).toBe(4); // Capped at capacity
  });

  it('forEach iterates only over active items', () => {
    const pool = new CosmeticRingPool(8, (idx) => ({ val: idx * 10 }));

    pool.acquire();
    pool.acquire();
    pool.acquire();

    const collected: number[] = [];
    pool.forEach((item) => collected.push(item.val));

    expect(collected).toEqual([0, 10, 20]);
  });

  it('clear resets cursor and activeCount without deallocating', () => {
    const pool = new CosmeticRingPool(5, (idx) => ({ id: idx }));

    pool.acquire();
    pool.acquire();
    expect(pool.activeCount).toBe(2);

    pool.clear();
    expect(pool.activeCount).toBe(0);

    const first = pool.acquire();
    expect(first.id).toBe(0);
  });
});
