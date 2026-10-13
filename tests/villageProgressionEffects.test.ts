import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';

describe('Village progression effects', () => {
  it('exposes the Chapel Holy damage multiplier per level on player runtime', () => {
    const createPlayer = (churchLevel: number) => {
      const meta = createDefaultMetaProgression();
      meta.churchLevel = churchLevel;
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: 'wanderer', meta, spawnInitialWave: false });
      return engine.state.player as any;
    };

    expect(createPlayer(0).holyDamageMultiplier).toBe(1);
    expect(createPlayer(1).holyDamageMultiplier).toBeCloseTo(1.08, 8);
    expect(createPlayer(2).holyDamageMultiplier).toBeCloseTo(1.16, 8);
  });
});
