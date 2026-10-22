import { describe, expect, it } from 'vitest';
import type { GameDrop } from '../src/types';
import {
  MAX_DROPS_LIMIT,
  countActiveDrops,
  createDropInstance,
  createPendingDropBank,
  hasPendingDrops,
  releasePendingDrops,
  spawnDropWithLimit,
} from '../src/game/drops';

describe('Global drop hard cap', () => {
  it('never creates a 41st live drop and releases a queued special item when a slot opens', () => {
    const drops: GameDrop[] = [];
    const pending = createPendingDropBank();

    expect(MAX_DROPS_LIMIT).toBe(40);
    for (let i = 0; i < MAX_DROPS_LIMIT; i++) {
      expect(
        spawnDropWithLimit(
          drops,
          createDropInstance('horseshoe', i * 100, 0, { speed: 0 }),
          pending,
        ),
      ).toBe(true);
    }

    const queued = createDropInstance('ponocny_horn', 5000, 0, { speed: 0 });
    expect(spawnDropWithLimit(drops, queued, pending)).toBe(false);
    expect(queued.dead).toBe(true);
    expect(countActiveDrops(drops)).toBe(40);
    expect(hasPendingDrops(pending)).toBe(true);

    drops[0].dead = true;
    expect(releasePendingDrops(drops, pending)).toBe(1);
    expect(countActiveDrops(drops)).toBe(40);
    expect(drops.some((drop) => !drop.dead && drop.type === 'ponocny_horn')).toBe(true);
    expect(hasPendingDrops(pending)).toBe(false);
  });

  it('combines overflowing coins into one pending drop without losing their value', () => {
    const drops: GameDrop[] = [];
    const pending = createPendingDropBank();

    for (let i = 0; i < MAX_DROPS_LIMIT; i++) {
      spawnDropWithLimit(
        drops,
        createDropInstance('horseshoe', i * 100, 0, { speed: 0 }),
        pending,
      );
    }

    for (let i = 0; i < 25; i++) {
      spawnDropWithLimit(
        drops,
        createDropInstance('coin', 6000 + i, 0, { value: 1, speed: 0 }),
        pending,
      );
    }

    expect(countActiveDrops(drops)).toBe(40);
    expect(pending.byKey.coin?.count).toBe(1);
    expect(pending.byKey.coin?.totalValue).toBe(25);

    drops[0].dead = true;
    expect(releasePendingDrops(drops, pending)).toBe(1);
    const pendingCoin = drops.find((drop) => !drop.dead && drop.type === 'coin');
    expect(pendingCoin?.value).toBe(25);
    expect(countActiveDrops(drops)).toBe(40);
    expect(hasPendingDrops(pending)).toBe(false);
  });

  it('keeps hot and regular gingerbread in separate pending buckets', () => {
    const drops: GameDrop[] = [];
    const pending = createPendingDropBank();

    for (let i = 0; i < MAX_DROPS_LIMIT; i++) {
      spawnDropWithLimit(
        drops,
        createDropInstance('horseshoe', i * 100, 0, { speed: 0 }),
        pending,
      );
    }

    spawnDropWithLimit(
      drops,
      createDropInstance('gingerbread', 6000, 0, { value: 4, isHot: true, goldenRushTimer: 3 }),
      pending,
    );
    spawnDropWithLimit(
      drops,
      createDropInstance('gingerbread', 6100, 0, { value: 6, isHot: false }),
      pending,
    );

    expect(pending.byKey.hot_gingerbread?.totalValue).toBe(4);
    expect(pending.byKey.gingerbread?.totalValue).toBe(6);
    expect(countActiveDrops(drops)).toBe(40);
  });
});
