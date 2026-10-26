import { describe, expect, it } from 'vitest';
import { applyAnanasUpgrade } from '../src/game/drops';
import {
  FROSTLING_AURA_RADIUS,
  getFrostAuraHealingMultiplier,
  type FrostAuraEnemy,
} from '../src/game/frostAura';

const frostling = (x: number, y = 0, overrides: Partial<FrostAuraEnemy> = {}): FrostAuraEnemy => ({
  id: 'mrazovy_skritek',
  x,
  y,
  ...overrides,
});

describe('Mrazivý skřítek frost aura', () => {
  it('extends the 78 px base aura by 55 percent', () => {
    expect(FROSTLING_AURA_RADIUS).toBeCloseTo(120.9);
  });

  it('reduces healing by 20 percentage points per nearby active frostling', () => {
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, [])).toBe(1);
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, [frostling(100)])).toBeCloseTo(0.8);
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, [frostling(20), frostling(-70)])).toBeCloseTo(0.6);
  });

  it('caps stacked healing dampening at 100 percent', () => {
    const enemies = Array.from({ length: 6 }, (_, i) => frostling(i * 4));
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, enemies)).toBe(0);
  });

  it('ignores frostlings outside aura range, inactive enemies, and unrelated enemies', () => {
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, [
      frostling(FROSTLING_AURA_RADIUS + 1),
      frostling(1, 1, { dead: true }),
      frostling(2, 2, { isDefeated: true }),
      { id: 'vrana', x: 0, y: 0 },
    ])).toBe(1);
  });

  it('applies frost dampening to Ananas healing but preserves max-Courage and speed upgrades', () => {
    const player = { maxHp: 100, hp: 100, speed: 100 };
    applyAnanasUpgrade(player, undefined, 0.8);

    expect(player.maxHp).toBe(130);
    // The 30 missing HP from the max-Courage increase is restored at 80%.
    expect(player.hp).toBe(124);
    expect(player.speed).toBe(130);
  });

  it('keeps the normal full-heal behavior when there is no frost aura', () => {
    const player = { maxHp: 100, hp: 40, speed: 100 };
    applyAnanasUpgrade(player);

    expect(player.maxHp).toBe(130);
    expect(player.hp).toBe(130);
    expect(player.speed).toBe(130);
  });
});
