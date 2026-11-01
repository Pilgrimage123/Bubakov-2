import { describe, it, expect } from 'vitest';
import { GAME_LEVELS, isLevelUnlocked } from '../src/data/levels';
import { ENEMIES } from '../src/data/enemies';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getCurrentDayPhase } from '../src/constants';
import { GameEngine } from '../src/game/engine';
import { RunDirector } from '../src/game/director';
import { cs } from '../src/i18n/locales/cs';
import { en } from '../src/i18n/locales/en';

describe('Comprehensive 8-Stage Audit (Levels 0 through 7)', () => {
  it('verifies that all 8 canonical levels have valid IDs 0 to 7 and complete definitions', () => {
    for (let id = 0; id <= 7; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(level, `Level ${id} must be defined in GAME_LEVELS`).toBeDefined();
      expect(level.id).toBe(id);
      expect(level.name).toBeTruthy();
      expect(level.shortTitle).toBeTruthy();
      expect(level.subtitle).toBeTruthy();
      expect(level.theme).toBeTruthy();
      expect(level.season).toBeTruthy();
      expect(level.arena?.id).toBeTruthy();
      expect(level.finalBoss?.id).toBeTruthy();
      expect(level.midBoss?.id).toBeTruthy();
      expect(level.miniBoss?.id).toBeTruthy();
    }
  });

  it('verifies every enemy referenced across all level spawn pools exists in ENEMIES', () => {
    const missingEnemies: Array<{ levelId: number; pool: string; enemyId: string }> = [];

    for (let id = 0; id <= 7; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      for (const [poolName, pool] of Object.entries(level.spawnPools || {})) {
        for (const enemyId of pool) {
          if (!ENEMIES[enemyId]) {
            missingEnemies.push({ levelId: id, pool: poolName, enemyId });
          }
        }
      }
    }

    expect(missingEnemies).toEqual([]);
  });

  it('verifies all miniBoss, midBoss, and finalBoss IDs exist in ENEMIES', () => {
    for (let id = 0; id <= 7; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(ENEMIES[level.miniBoss.id], `miniBoss ${level.miniBoss.id} in level ${id}`).toBeDefined();
      expect(ENEMIES[level.midBoss.id], `midBoss ${level.midBoss.id} in level ${id}`).toBeDefined();
      expect(ENEMIES[level.finalBoss.id], `finalBoss ${level.finalBoss.id} in level ${id}`).toBeDefined();
    }
  });

  it('verifies all keyEnemies across all levels exist in ENEMIES', () => {
    for (let id = 0; id <= 7; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      for (const keyEnemy of level.keyEnemies || []) {
        expect(ENEMIES[keyEnemy.id], `keyEnemy ${keyEnemy.id} in level ${id}`).toBeDefined();
      }
    }
  });

  it('verifies all targetEnemies in LEVEL_UNLOCKS exist in ENEMIES', () => {
    for (let id = 1; id <= 7; id++) {
      const def = LEVEL_UNLOCKS[id];
      expect(def, `LEVEL_UNLOCKS[${id}] must exist`).toBeDefined();
      for (const target of def.targetEnemies || []) {
        expect(ENEMIES[target.id], `Target enemy ${target.id} in LEVEL_UNLOCKS[${id}]`).toBeDefined();
      }
    }
  });

  it('verifies director wave pools return non-empty valid enemy sets for every day phase in all 8 levels', () => {
    const engine = new GameEngine();

    for (let id = 0; id <= 7; id++) {
      engine.initRun(id as any, 'wanderer');
      const director = new RunDirector(id as any, engine);

      // Sample times: 30s (noon/dusk), 150s (afternoon/night), 250s (dusk/midnight), 310s (dawn)
      const testTimes = [30, 150, 250, 310];
      for (const t of testTimes) {
        engine.state.gameTime = t;
        const pool = (director as any).getWeightedPool(engine);
        expect(pool.length, `Pool at time ${t} in level ${id} must not be empty`).toBeGreaterThan(0);
        for (const enemyId of pool) {
          expect(ENEMIES[enemyId], `Enemy ${enemyId} from pool in level ${id} at time ${t} must exist`).toBeDefined();
        }
      }
    }
  });

  it('verifies GameEngine arena runtime state accessors stay synchronized with state', () => {
    const engine = new GameEngine();
    expect(engine.marchThaw).toBe(engine.state.marchThaw);
    expect(engine.dubenDen).toBe(engine.state.dubenDen);
    expect(engine.kveten).toBe(engine.state.kveten);
    expect(engine.cerven).toBe(engine.state.cerven);

    // Verify setting through accessors modifies state directly
    engine.cerven = {
      bellCooldown: 5,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      weatherHayTimer: 0,
    };
    expect(engine.state.cerven?.bellCooldown).toBe(5);
  });

  it('verifies progressive level unlock chain from level 0 through level 7', () => {
    // Level 0 is always unlocked
    expect(isLevelUnlocked(0, {})).toBe(true);

    let currentMeta: any = { completedLevels: {}, bestiaryKills: {}, highestLevelUnlocked: 0 };

    for (let id = 0; id < 7; id++) {
      const nextId = id + 1;
      const curLevel = GAME_LEVELS[id as keyof typeof GAME_LEVELS];

      // Next level not unlocked yet (unless shared boss kill between levels 2 & 3 satisfies condition)
      if (id !== 3) {
        expect(getLevelProgress(nextId, currentMeta).isUnlocked).toBe(false);
      }

      // Simulate completing current level via boss kill
      currentMeta = {
        ...currentMeta,
        completedLevels: { ...currentMeta.completedLevels, [id]: true },
        bestiaryKills: { ...currentMeta.bestiaryKills, [curLevel.finalBoss.id]: 1 },
        highestLevelUnlocked: nextId,
      };

      // Next level should now be unlocked
      const nextProg = getLevelProgress(nextId, currentMeta);
      expect(nextProg.isUnlocked, `Level ${nextId} should unlock after beating level ${id}`).toBe(true);
    }
  });

  it('verifies complete Czech and English translations exist for all 8 levels and their bosses', () => {
    for (let id = 0; id <= 7; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];

      // Level name & subtitle
      expect(cs[`level.${id}.name`], `cs level.${id}.name`).toBeTruthy();
      expect(en[`level.${id}.name`], `en level.${id}.name`).toBeTruthy();
      expect(cs[`level.${id}.subtitle`], `cs level.${id}.subtitle`).toBeTruthy();
      expect(en[`level.${id}.subtitle`], `en level.${id}.subtitle`).toBeTruthy();

      // Boss translations
      const bosses = [level.miniBoss.id, level.midBoss.id, level.finalBoss.id];
      for (const b of bosses) {
        expect(cs[`bestiary.${b}.name`], `cs bestiary.${b}.name`).toBeTruthy();
        expect(en[`bestiary.${b}.name`], `en bestiary.${b}.name`).toBeTruthy();
      }
    }
  });
});
