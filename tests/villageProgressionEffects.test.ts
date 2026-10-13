import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Village progression effects', () => {
  it('applies Chapel holy damage bonus to enemy damage intake', () => {
    const createEnemy = (churchLevel: number) => {
      const meta = createDefaultMetaProgression();
      meta.churchLevel = churchLevel;
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
      const enemy = engine.spawnMonster('rarach', 300, 0);
      enemy.prefixDamageReduction = 0;
      return enemy;
    };

    const withoutChapel = createEnemy(0);
    const baselineHp = withoutChapel.hp;
    withoutChapel.takeDamage(100, 'holy', 0, 0);
    const baselineDamage = baselineHp - withoutChapel.hp;

    const withChapel = createEnemy(2);
    const boostedHp = withChapel.hp;
    withChapel.takeDamage(100, 'holy', 0, 0);
    const boostedDamage = boostedHp - withChapel.hp;

    // Compare against the same enemy type to account for its own Holy resistance.
    expect(boostedDamage).toBeCloseTo(baselineDamage * 1.16, 5);
  });
});
