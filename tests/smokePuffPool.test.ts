import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SmokePuff,
  SmokePuffPool,
  spawnSmokePuff,
  MAX_SMOKE_PUFFS,
} from '../src/game/smokePuff';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Zero-Allocation SmokePuff Pool (Milestone 2)', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCanvasContext();
  });

  it('preallocates 25 SmokePuff instances and reuses existing lobe/wisp/crumb arrays', () => {
    const pool = new SmokePuffPool(MAX_SMOKE_PUFFS);
    const list: SmokePuff[] = [];

    const puff1 = pool.spawn(list, 100, 200, 30, 'smoke', 1.5);
    expect(list.length).toBe(1);
    expect(puff1.x).toBe(100);
    expect(puff1.y).toBe(200);
    expect(puff1.radius).toBe(30);
    expect(puff1.lobes.length).toBe(8);
    expect(puff1.wisps.length).toBe(3);
    expect(puff1.poofDots.length).toBe(6);
    expect(puff1.crumbs.length).toBe(8);

    const lobesRef = puff1.lobes;
    const wispsRef = puff1.wisps;
    const crumbsRef = puff1.crumbs;

    // Simulate life cycle: update past duration
    puff1.update(2.0);
    expect(puff1.dead).toBe(true);

    // Spawn again from pool
    const list2: SmokePuff[] = [];
    const puff2 = pool.spawn(list2, 300, 400, 40, 'fajfka', 2.0);
    expect(puff2).toBe(puff1); // Reused identical object instance!
    expect(puff2.lobes).toBe(lobesRef); // Sub-arrays were NOT reallocated!
    expect(puff2.wisps).toBe(wispsRef);
    expect(puff2.crumbs).toBe(crumbsRef);
    expect(puff2.x).toBe(300);
    expect(puff2.dead).toBe(false);
  });

  it('recycles oldest active puff when pool capacity is exceeded', () => {
    const pool = new SmokePuffPool(5);
    const list: SmokePuff[] = [];

    for (let i = 0; i < 5; i++) {
      pool.spawn(list, i * 10, i * 10, 20, 'smoke', 5.0);
    }
    expect(list.length).toBe(5);

    // Spawning a 6th puff should shift the oldest without crashing
    const sixth = pool.spawn(list, 999, 999, 25, 'fajfka', 3.0);
    expect(list.length).toBe(5);
    expect(sixth.x).toBe(999);
  });

  it('renders with reduced save/restore state stack overhead', () => {
    const puff = new SmokePuff(50, 50, 25, 'smoke', 1.0);
    puff.draw(ctx);

    // Previously took 20+ save/restore calls per puff, now only 5 (1 outer + 1 dots + 3 wisps)
    expect(ctx.save).toHaveBeenCalled();
    const saveCount = (ctx.save as any).mock.calls.length;
    const restoreCount = (ctx.restore as any).mock.calls.length;
    expect(saveCount).toBeLessThanOrEqual(5);
    expect(saveCount).toBe(restoreCount);
  });
});
