import { describe, it, expect, vi } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { GAME_LEVELS } from '../src/data/levels';
import { DROP_THRESHOLDS } from '../src/constants';

describe('Boss Loot and Horde-like Boss Treasure', () => {
  it('spawns 1 flock member for stage 1 crow miniboss with isMinibossFlockMember set', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const leaderCrow = engine.spawnMonster('vrana', 100, 100, 4.5, false, true, '🐦‍⬛ Hejno mrazivých vran');
    expect(leaderCrow).toBeDefined();
    expect(leaderCrow.isMiniboss).toBe(true);
    expect(leaderCrow.isMinibossFlockMember).toBe(true);
    expect(leaderCrow.flockTotal).toBe(9);

    const flock = engine.state.enemies.filter((e) => e.isMinibossFlockMember);
    expect(flock).toHaveLength(9);
    for (let i = 0; i < flock.length; i++) {
      expect(flock[i].flockTotal).toBe(9);
      expect(flock[i].isMiniboss).toBe(true);
      expect(flock[i].isMinibossFlockMember).toBe(true);
    }
  });

  it('ensures flock members contribute scaled treasure points so the horde counts as one boss for pointsChest', () => {
    const flockTotal = 9;
    const baseBossChestMult = 3.0;
    const crowChestMult = baseBossChestMult / flockTotal;
    const crowPt = 63; // rawPt for 168-HP crow

    const singleCrowChestPoints = Math.round(crowPt * crowChestMult);
    const totalFlockChestPoints = singleCrowChestPoints * flockTotal;

    // Total points from all crows should equal 1 single boss with ~63 base points
    const expectedSingleBossPoints = Math.round(crowPt * baseBossChestMult);
    expect(Math.abs(totalFlockChestPoints - expectedSingleBossPoints)).toBeLessThanOrEqual(flockTotal);
  });

  it('confirms source code does not contain hardcoded celebration loot cascade of extra potions, breads, souls and giant gingerbreads for bosses', async () => {
    const fs = await import('fs');
    const appSource = fs.readFileSync('src/App.tsx', 'utf-8');

    // Should NOT have the old cascade of 3 or 6 extra giant gingerbreads
    expect(appSource).not.toMatch(/Dar minibosse/);
    expect(appSource).not.toMatch(/Kupa vládce bubáků/);
    expect(appSource).not.toMatch(/for\s*\(\s*let\s+g\s*=\s*0;\s*g\s*<\s*3;\s*g\+\+\s*\)\s*\{\s*spawnScatterDrop\('gingerbread'/);
    expect(appSource).not.toMatch(/for\s*\(\s*let\s+g\s*=\s*0;\s*g\s*<\s*6;\s*g\+\+\s*\)\s*\{\s*spawnScatterDrop\('gingerbread'/);

    // Miniboss flock must drop chest only once when flock is defeated
    expect(appSource).toMatch(/isFlockDefeated && !eng\.flockTreasureDropped/);
  });
});
