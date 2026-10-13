import { describe, expect, it } from 'vitest';
import {
  FROSTLING_AURA_RADIUS,
  getFrostAuraHealingMultiplier,
  type FrostAuraEnemy,
} from './frostAura';

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

  it('ignores frostlings outside aura range and inactive enemies', () => {
    expect(getFrostAuraHealingMultiplier({ x: 0, y: 0 }, [
      frostling(FROSTLING_AURA_RADIUS + 1),
      frostling(1, 1, { dead: true }),
      frostling(2, 2, { isDefeated: true }),
    ])).toBe(1);
  });
});
