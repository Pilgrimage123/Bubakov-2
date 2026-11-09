import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import {
  LEVEL_ORDER,
  LEVEL_UNLOCKS,
  getLevelProgress,
  isLevelFullyUnlocked,
  canLevelUnlock,
  getActiveUnlockingLevel,
} from '../src/data/levelUnlocks';
import type { GameLevelId } from '../src/types';

describe('Level Unlocks & Progression Balance', () => {
  it('contains all 24 canonical levels in LEVEL_ORDER and LEVEL_UNLOCKS', () => {
    expect(LEVEL_ORDER).toHaveLength(24);
    for (let i = 0; i < 24; i++) {
      expect(LEVEL_ORDER[i]).toBe(i);
      expect(LEVEL_UNLOCKS[i]).toBeDefined();
      expect(LEVEL_UNLOCKS[i].id).toBe(i);
      expect(GAME_LEVELS[i as GameLevelId]).toBeDefined();
    }
  });

  it('level 0 is unlocked by default for new players', () => {
    const prog = getLevelProgress(0, {});
    expect(prog.isUnlocked).toBe(true);
    expect(prog.percent).toBe(100);
    expect(isLevelFullyUnlocked(0, {})).toBe(true);
    expect(canLevelUnlock(0, {})).toBe(true);
  });

  it('guarantees conditions are not tedious: maxCount is 40 and targetEnemies match previous stage regular spawns', () => {
    for (let id = 1; id <= 23; id++) {
      const def = LEVEL_UNLOCKS[id];
      const prevLvl = GAME_LEVELS[(id - 1) as GameLevelId];

      // Condition requirement: not tedious (maxCount <= 50, ideally 40)
      expect(def.maxCount, `Level ${id} maxCount should be <= 50`).toBeLessThanOrEqual(50);
      expect(def.maxCount, `Level ${id} maxCount`).toBe(40);

      // Collect all enemies from previous level
      const allPrevEnemies = new Set<string>();
      if (prevLvl.spawnPools) {
        Object.values(prevLvl.spawnPools).forEach((pool: any) => {
          pool.forEach((e: string) => allPrevEnemies.add(e));
        });
      }
      if (prevLvl.miniBoss) allPrevEnemies.add(prevLvl.miniBoss.id);
      if (prevLvl.midBoss) allPrevEnemies.add(prevLvl.midBoss.id);
      if (prevLvl.finalBoss) allPrevEnemies.add(prevLvl.finalBoss.id);

      // Regular spawns from previous stage
      const regularPool = new Set<string>();
      if (prevLvl.spawnPools) {
        Object.values(prevLvl.spawnPools).forEach((pool: any) => {
          pool.forEach((e: string) => regularPool.add(e));
        });
      }

      const targetEnemyIds = def.targetEnemies.map((e: any) => e.id);
      expect(targetEnemyIds.length, `Level ${id} should have at least 3 target enemies`).toBeGreaterThanOrEqual(3);

      // Verify that every target enemy actually exists in previous level
      const nonMatching = targetEnemyIds.filter((tid: string) => !allPrevEnemies.has(tid));
      expect(nonMatching, `All target enemies for level ${id} must exist in stage ${id - 1}`).toEqual([]);

      // Verify that targetEnemies contains common regular spawns (not just one-time bosses!)
      const commonSpawns = targetEnemyIds.filter((tid: string) => regularPool.has(tid));
      expect(
        commonSpawns.length,
        `Level ${id} must include regular common spawns from level ${id - 1} so players can unlock it without grind`
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('allows instant 100% unlock upon defeating previous level boss', () => {
    for (let id = 1; id <= 23; id++) {
      const prevLvl = GAME_LEVELS[(id - 1) as GameLevelId];
      const bossId = prevLvl.finalBoss.id;

      // Unlocking via bestiary kill of previous boss
      const metaWithBoss = {
        highestLevelUnlocked: id - 1,
        completedLevels: {},
        bestiaryKills: { [bossId]: 1 },
      };

      const prog = getLevelProgress(id, metaWithBoss);
      expect(prog.isUnlocked, `Level ${id} should unlock when boss ${bossId} is defeated`).toBe(true);
      expect(prog.percent).toBe(100);
      expect(prog.bossDefeated).toBe(true);
    }
  });

  it('allows instant 100% unlock upon completing previous level (dawn victory)', () => {
    for (let id = 1; id <= 23; id++) {
      const metaCompleted = {
        highestLevelUnlocked: id - 1,
        completedLevels: { [id - 1]: true },
        bestiaryKills: {},
      };

      const prog = getLevelProgress(id, metaCompleted);
      expect(prog.isUnlocked, `Level ${id} should unlock when stage ${id - 1} is marked completed`).toBe(true);
      expect(prog.percent).toBe(100);
    }
  });

  it('progressively reveals clues at 25%, 50%, 75% and unlocks at 40 kills on failed runs', () => {
    // Test on Level 1 (unlocking by playing Level 0)
    const def1 = LEVEL_UNLOCKS[1];
    expect(def1.maxCount).toBe(40);

    // 0 kills
    const p0 = getLevelProgress(1, { highestLevelUnlocked: 0, levelKillCounts: { 1: {} } });
    expect(p0.isUnlocked).toBe(false);
    expect(p0.percent).toBe(0);
    expect(p0.tier).toBe(0);
    expect(p0.spoiledName).toContain('???');

    // 10 kills (25%) -> Tier 1
    const p25 = getLevelProgress(1, {
      highestLevelUnlocked: 0,
      levelKillCounts: { 1: { blatouch: 10 } },
    });
    expect(p25.isUnlocked).toBe(false);
    expect(p25.percent).toBe(25);
    expect(p25.tier).toBe(1);

    // 20 kills (50%) -> Tier 2
    const p50 = getLevelProgress(1, {
      highestLevelUnlocked: 0,
      levelKillCounts: { 1: { blatouch: 10, mysak: 10 } },
    });
    expect(p50.isUnlocked).toBe(false);
    expect(p50.percent).toBe(50);
    expect(p50.tier).toBe(2);
    expect(p50.spoiledSubtitle).toBe(GAME_LEVELS[1].subtitle);

    // 30 kills (75%) -> Tier 3
    const p75 = getLevelProgress(1, {
      highestLevelUnlocked: 0,
      levelKillCounts: { 1: { blatouch: 15, mysak: 15 } },
    });
    expect(p75.isUnlocked).toBe(false);
    expect(p75.percent).toBe(75);
    expect(p75.tier).toBe(3);
    expect(p75.spoiledBossHint).toContain(GAME_LEVELS[1].finalBoss.name);

    // 40 kills (100%) -> Fully Unlocked without killing the boss!
    const p100 = getLevelProgress(1, {
      highestLevelUnlocked: 0,
      levelKillCounts: { 1: { blatouch: 20, mysak: 20 } },
    });
    expect(p100.isUnlocked).toBe(true);
    expect(p100.percent).toBe(100);
    expect(p100.tier).toBe(4);
    expect(p100.spoiledName).toBe(GAME_LEVELS[1].name);
    expect(isLevelFullyUnlocked(1, { levelKillCounts: { 1: { blatouch: 20, mysak: 20 } } })).toBe(true);
  });

  it('correctly reports getActiveUnlockingLevel along the 24-stage sequence', () => {
    // Fresh meta: level 0 is unlocked, active unlocking level is 1
    expect(getActiveUnlockingLevel({})).toBe(1);

    // Level 0 completed: level 1 is now unlocked, active unlocking level is 2
    expect(getActiveUnlockingLevel({ completedLevels: { 0: true } })).toBe(2);

    // Levels 0..21 completed: level 22 is unlocked, active unlocking level is 23
    const meta21: any = { completedLevels: {} };
    for (let i = 0; i < 22; i++) meta21.completedLevels[i] = true;
    expect(getActiveUnlockingLevel(meta21)).toBe(23);

    // Levels 0..22 completed: all 24 levels (0..23) are now unlocked, none waiting
    const meta22: any = { completedLevels: {} };
    for (let i = 0; i < 23; i++) meta22.completedLevels[i] = true;
    expect(getActiveUnlockingLevel(meta22)).toBe(null);
  });
});
