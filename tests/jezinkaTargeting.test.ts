import { describe, expect, it } from 'vitest';
import { isDirectTargetable, JEZINKA_DIRECT_TARGET_RANGE } from '../src/game/targeting';
import { GameEngine } from '../src/game/engine';

describe('Frost Jezinka targeting', () => {
  it('allows direct targeting within 100 px but not beyond that range', () => {
    const hunter = { x: 0, y: 0 };
    expect(JEZINKA_DIRECT_TARGET_RANGE).toBe(100);
    expect(isDirectTargetable({ id: 'jezinka_mraziva', x: 100, y: 0 }, hunter)).toBe(true);
    expect(isDirectTargetable({ id: 'jezinka_mraziva', x: 100.01, y: 0 }, hunter)).toBe(false);
    expect(isDirectTargetable({ id: 'rarach', x: 1000, y: 0 }, hunter)).toBe(true);
  });

  it('keeps the Jezinka damageable even when direct targeting is blocked', () => {
    const engine = new GameEngine();
    const state = engine.initRun({ levelId: 0, hunterType: 'wanderer', spawnInitialWave: false });
    state.player!.x = 0;
    state.player!.y = 0;
    const jezinka = engine.spawnMonster('jezinka_mraziva', 150, 0);
    expect(isDirectTargetable(jezinka, state.player)).toBe(false);
    const hpBefore = jezinka.hp;
    jezinka.takeDamage(10, 'physical');
    expect(jezinka.hp).toBeLessThan(hpBefore);
  });
});
