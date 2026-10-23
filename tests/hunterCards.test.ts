import { describe, expect, it } from 'vitest';
import { HUNTER_DETAILS } from '../src/data/hunterDetails';

describe('Hunter Card data', () => {
  it.each(Object.entries(HUNTER_DETAILS))('%s has a role and ability name for its card', (_id, hunter) => {
    expect(hunter.role.trim().length).toBeGreaterThan(0);
    expect(hunter.abilityName.trim().length).toBeGreaterThan(0);
  });
});
