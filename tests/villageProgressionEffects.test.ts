import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Village progression effects', () => {
  it('applies the Chapel Holy damage bonus per level', () => {
    const damageAtChapelLevel = (churchLevel: number) => {
      const meta = createDefaultMetaProgression();
      meta.churchLevel = churchLevel;
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
      const enemy = engine.spawnMonster('rarach', 300, 0);
      enemy.prefixDamageReduction = 0;
      const startHp = enemy.hp;
      enemy.takeDamage(100, 'holy', 0, 0);
      return startHp - enemy.hp;
    };

    const baseDamage = damageAtChapelLevel(0);
    const twoLevels = damageAtChapelLevel(2);

    expect(twoLevels).toBeCloseTo(baseDamage * 1.16, 5);
  });
});
