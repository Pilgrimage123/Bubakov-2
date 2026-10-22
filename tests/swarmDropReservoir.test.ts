import { describe, it, expect } from 'vitest';
import {
  createSwarmDropReservoir,
  createPendingDropBank,
  accumulateSwarmDrop,
  shouldReleaseSwarmReservoir,
  releaseSwarmReservoir,
} from '../src/game/drops';
import type { GameDrop } from '../src/types';

describe('Ghost Rezervoár pro hejna a zachování ekonomiky (Plan Section 4 & Gate 4)', () => {
  it('strictly conserves total gingerbread and coin values when compressing swarm drops', () => {
    const reservoir = createSwarmDropReservoir();
    const simulatedSwarmKills = [
      { type: 'gingerbread' as const, value: 2, x: 100, y: 100 },
      { type: 'coin' as const, value: 1, x: 102, y: 101 },
      { type: 'gingerbread' as const, value: 2, x: 105, y: 98 },
      { type: 'gingerbread' as const, value: 6, x: 110, y: 102 },
      { type: 'coin' as const, value: 5, x: 108, y: 104 },
      { type: 'gingerbread' as const, value: 2, x: 112, y: 105 },
      { type: 'gingerbread' as const, value: 2, x: 115, y: 100 },
      { type: 'gingerbread' as const, value: 20, x: 120, y: 110 },
      { type: 'coin' as const, value: 3, x: 118, y: 112 },
    ];

    const totalGingerbreadBefore = simulatedSwarmKills
      .filter((k) => k.type === 'gingerbread')
      .reduce((sum, k) => sum + (k.value || 0), 0);
    const totalCoinsBefore = simulatedSwarmKills
      .filter((k) => k.type === 'coin')
      .reduce((sum, k) => sum + (k.value || 0), 0);

    for (const kill of simulatedSwarmKills) {
      accumulateSwarmDrop(reservoir, kill);
    }

    expect(shouldReleaseSwarmReservoir(reservoir, 5)).toBe(true);

    const targetDrops: GameDrop[] = [];
    const releasedCount = releaseSwarmReservoir(reservoir, targetDrops, createPendingDropBank());

    const totalGingerbreadAfter = targetDrops
      .filter((d) => d.type === 'gingerbread')
      .reduce((sum, d) => sum + (d.value || 0), 0);
    const totalCoinsAfter = targetDrops
      .filter((d) => d.type === 'coin')
      .reduce((sum, d) => sum + (d.value || 0), 0);

    // GATE 4: Rovnost součtu hodnot dropů před a po kompresi
    expect(totalGingerbreadAfter).toBe(totalGingerbreadBefore);
    expect(totalCoinsAfter).toBe(totalCoinsBefore);

    // Entity count dramatically reduced (e.g. from 9 individual entities to 4 consolidated entities)
    expect(targetDrops.length).toBeLessThan(simulatedSwarmKills.length);
    expect(releasedCount).toBe(targetDrops.length);

    // Reservoir is cleanly reset
    expect(reservoir.gingerbread).toBe(0);
    expect(reservoir.coins).toBe(0);
    expect(reservoir.pendingKills).toBe(0);
  });

  it('triggers release immediately when a swarm leader is eliminated', () => {
    const reservoir = createSwarmDropReservoir();
    accumulateSwarmDrop(reservoir, { type: 'gingerbread', value: 4, x: 50, y: 50 }, true);

    expect(shouldReleaseSwarmReservoir(reservoir, 10)).toBe(true);

    const targetDrops: GameDrop[] = [];
    releaseSwarmReservoir(reservoir, targetDrops, createPendingDropBank());
    expect(targetDrops.length).toBeGreaterThan(0);
  });
});
