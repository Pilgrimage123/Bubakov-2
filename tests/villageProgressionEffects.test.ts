import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Village progression effects', () => {
  it('applies Chapel holy damage bonus to enemy damage intake', () => {
    const meta = createDefaultMetaProgression();
    meta.churchLevel = 2;
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
    const enemy = engine.spawnMonster('rarach', 300, 0);
    enemy.prefixDamageReduction = 0;
    const startHp = enemy.hp;

    enemy.takeDamage(100, 'holy', 0, 0);

    // Level 2 chapel gives +16% Holy damage before enemy-specific Holy resistance.
    expect(startHp - enemy.hp).toBeGreaterThan(100);
  });
});
