import { describe, expect, it } from 'vitest';
import { HUNTER_DETAILS } from '../src/data/hunterDetails';

describe('Hunter Card data', () => {
  it.each(Object.entries(HUNTER_DETAILS))('%s has a role and ability name for its card', (_id, hunter) => {
    expect(hunter.role.trim().length).toBeGreaterThan(0);
    expect(hunter.abilityName.trim().length).toBeGreaterThan(0);
  });

  it('Tulák passive applies +35 % damage to weapons and does not grant a bonus to his special ability', () => {
    expect(HUNTER_DETAILS.wanderer.passive).toBe('Tulácký instinkt: +35 % poškození všech zbraní.');
    expect(HUNTER_DETAILS.wanderer.passive).not.toContain('Pověstnou sukovici');
  });
});
