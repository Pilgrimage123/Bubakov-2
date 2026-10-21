import { describe, expect, it } from 'vitest';
import { stepCrowForaging } from '../src/game/crowForaging';

describe('stage-one crow foraging', () => {
  it('flies toward nearby loot, lands to peck, then steals it', () => {
    const loot: any = { type: 'coin', x: 30, y: 0, radius: 5, dead: false };
    const crow: any = { id: 'vrana', x: 0, y: 0, radius: 13, crowForageCooldown: 0 };

    const approach = stepCrowForaging(crow, [loot], 1 / 60, 100);
    expect(approach.active).toBe(true);
    expect(approach.grounded).toBe(false);
    expect(approach.vx).toBeGreaterThan(0);

    crow.x = 20;
    const landed = stepCrowForaging(crow, [loot], 0.4, 100);
    expect(landed.grounded).toBe(true);
    expect(loot.dead).toBe(false);

    stepCrowForaging(crow, [loot], 0.45, 100);
    expect(loot.dead).toBe(true);
    expect(crow.crowForageTarget).toBeNull();
    expect(crow.isGroundedForLoot).toBe(false);
  });

  it('ignores non-loot drops and does not ground without a target', () => {
    const crow: any = { id: 'vrana', x: 0, y: 0, radius: 13, crowForageCooldown: 0 };
    const result = stepCrowForaging(crow, [{ type: 'chest', x: 1, y: 0, dead: false }], 1 / 60, 100);
    expect(result.active).toBe(false);
    expect(result.grounded).toBe(false);
  });
});
