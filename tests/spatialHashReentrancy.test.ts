import { describe, it, expect } from 'vitest';
import { SpatialHash } from '../src/game/spatialHash';
import { GameEngine } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import { createDefaultMetaProgression } from '../src/game/migration';

interface TestEntity {
  id: string;
  x: number;
  y: number;
  radius?: number;
}

describe('SpatialHash Re-entrancy & Scratch Stack Safety (ADR 0029)', () => {
  it('handles basic insertion and circle queries', () => {
    const sh = new SpatialHash<TestEntity>(100);
    const e1 = { id: 'e1', x: 50, y: 50 };
    const e2 = { id: 'e2', x: 250, y: 250 };
    sh.insert(e1);
    sh.insert(e2);

    const near = sh.queryCircle(50, 50, 60);
    expect(near).toHaveLength(1);
    expect(near[0].id).toBe('e1');
  });

  it('populates caller-owned buffer via queryCircleInto', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'e1', x: 10, y: 10 });
    sh.insert({ id: 'e2', x: 20, y: 20 });

    const out: TestEntity[] = [];
    const res = sh.queryCircleInto(15, 15, 50, out);
    expect(res).toBe(out);
    expect(out).toHaveLength(2);
  });

  it('prevents array corruption during nested re-entrant queryCircle calls', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'outer_1', x: 10, y: 10 });
    sh.insert({ id: 'outer_2', x: 15, y: 15 });
    sh.insert({ id: 'inner_1', x: 500, y: 500 });
    sh.insert({ id: 'inner_2', x: 505, y: 505 });

    const outerResults = sh.queryCircle(10, 10, 50);
    expect(outerResults).toHaveLength(2);

    const visitedOuterIds: string[] = [];
    for (let i = 0; i < outerResults.length; i++) {
      const outerEntity = outerResults[i];
      visitedOuterIds.push(outerEntity.id);

      // Re-entrant query inside the outer iteration (targeting disjoint cell)
      const innerResults = sh.queryCircle(500, 500, 50);
      expect(innerResults).toHaveLength(2);
      expect(innerResults.map(e => e.id)).toEqual(expect.arrayContaining(['inner_1', 'inner_2']));

      // Verify that outerResults was NOT wiped by inner query
      expect(outerResults).toHaveLength(2);
    }

    expect(visitedOuterIds).toEqual(['outer_1', 'outer_2']);
  });

  it('provides scoped zero-allocation querying via withQuery', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'e1', x: 0, y: 0 });
    sh.insert({ id: 'e2', x: 30, y: 40 });

    let count = 0;
    sh.withQuery(0, 0, 60, (results) => {
      count = results.length;
      expect(results).toHaveLength(2);
    });

    expect(count).toBe(2);
  });

  it('supports deeply nested withQuery calls up to and exceeding stack capacity without throwing', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'center', x: 0, y: 0 });

    let recursionDepth = 0;
    const recurse = (depth: number) => {
      sh.withQuery(0, 0, 50, (results) => {
        expect(results).toHaveLength(1);
        recursionDepth = Math.max(recursionDepth, depth);
        if (depth < 12) {
          recurse(depth + 1);
        }
      });
    };

    expect(() => recurse(1)).not.toThrow();
    expect(recursionDepth).toBe(12);
  });

  it('finds nearest entity safely via withQuery in queryNearest', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'far', x: 100, y: 0 });
    sh.insert({ id: 'near', x: 20, y: 0 });

    const closest = sh.queryNearest(0, 0, 150);
    expect(closest).not.toBeNull();
    expect(closest?.id).toBe('near');
  });

  it('does not corrupt active queryCircle buffer when withQuery or queryNearest is called inside the loop', () => {
    const sh = new SpatialHash<TestEntity>(100);
    sh.insert({ id: 'outer_1', x: 10, y: 10 });
    sh.insert({ id: 'outer_2', x: 20, y: 20 });
    sh.insert({ id: 'target_far', x: 400, y: 400 });

    const outer = sh.queryCircle(15, 15, 50);
    expect(outer).toHaveLength(2);

    const visited: string[] = [];
    for (let i = 0; i < outer.length; i++) {
      visited.push(outer[i].id);
      const nearest = sh.queryNearest(400, 400, 80);
      expect(nearest?.id).toBe('target_far');
      // Outer buffer must remain intact after nested withQuery / queryNearest
      expect(outer).toHaveLength(2);
    }

    expect(visited).toEqual(['outer_1', 'outer_2']);
  });

  it('integrates safely with GameEngine spatial query helpers', () => {
    const state = createInitialEngineState();
    state.meta = createDefaultMetaProgression();
    const engine = new GameEngine(state);

    const enemy1 = { id: 'm1', x: 100, y: 100, radius: 20, isDefeated: false, dead: false } as any;
    const enemy2 = { id: 'm2', x: 120, y: 100, radius: 20, isDefeated: false, dead: false } as any;
    engine.state.enemies = [enemy1, enemy2];
    engine.spatialHash.rebuild(engine.state.enemies);

    const out: any[] = [];
    engine.queryCircleInto(100, 100, 50, out);
    expect(out).toHaveLength(2);

    let withQueryChecked = false;
    engine.withQuery(100, 100, 50, (res) => {
      expect(res).toHaveLength(2);
      withQueryChecked = true;
    });
    expect(withQueryChecked).toBe(true);
  });
});
