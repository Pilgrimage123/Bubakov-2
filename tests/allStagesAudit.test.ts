import { describe, it, expect } from 'vitest';
import { GAME_LEVELS, isLevelUnlocked } from '../src/data/levels';
import { ENEMIES } from '../src/data/enemies';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getCurrentDayPhase, ENEMY_POINTS } from '../src/constants';
import { GameEngine } from '../src/game/engine';
import { RunDirector, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import { cs } from '../src/i18n/locales/cs';
import { en } from '../src/i18n/locales/en';

describe('Comprehensive 16-Stage Audit (Levels 0 through 15)', () => {
  it('verifies that all 16 canonical levels have valid IDs 0 to 15 and complete definitions', () => {
    for (let id = 0; id <= 15; id++) {
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

    for (let id = 0; id <= 15; id++) {
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
    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(ENEMIES[level.miniBoss.id], `miniBoss ${level.miniBoss.id} in level ${id}`).toBeDefined();
      expect(ENEMIES[level.midBoss.id], `midBoss ${level.midBoss.id} in level ${id}`).toBeDefined();
      expect(ENEMIES[level.finalBoss.id], `finalBoss ${level.finalBoss.id} in level ${id}`).toBeDefined();
    }
  });

  it('verifies all keyEnemies across all levels exist in ENEMIES', () => {
    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      for (const keyEnemy of level.keyEnemies || []) {
        expect(ENEMIES[keyEnemy.id], `keyEnemy ${keyEnemy.id} in level ${id}`).toBeDefined();
      }
    }
  });

  it('verifies all targetEnemies in LEVEL_UNLOCKS exist in ENEMIES', () => {
    for (let id = 1; id <= 15; id++) {
      const def = LEVEL_UNLOCKS[id];
      expect(def, `LEVEL_UNLOCKS[${id}] must exist`).toBeDefined();
      for (const target of def.targetEnemies || []) {
        expect(ENEMIES[target.id], `Target enemy ${target.id} in LEVEL_UNLOCKS[${id}]`).toBeDefined();
      }
    }
  });

  it('verifies director wave pools return non-empty valid enemy sets for every day phase in all 16 levels', () => {
    const engine = new GameEngine();

    for (let id = 0; id <= 15; id++) {
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
    expect(engine.cervenec).toBe(engine.state.cervenec);
    expect(engine.srpen).toBe(engine.state.srpen);
    expect(engine.zari).toBe(engine.state.zari);
    expect(engine.rijen).toBe(engine.state.rijen);

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

  it('verifies progressive level unlock chain from level 0 through level 15', () => {
    // Level 0 is always unlocked
    expect(isLevelUnlocked(0, {})).toBe(true);

    let currentMeta: any = { completedLevels: {}, bestiaryKills: {}, highestLevelUnlocked: 0 };

    for (let id = 0; id < 15; id++) {
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

  it('verifies complete Czech and English translations exist for all 16 levels and their bosses', () => {
    for (let id = 0; id <= 15; id++) {
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

  it('verifies all 16 stages have consistent arena IDs and 9 authentic POIs in poiOrder', () => {
    const expectedArenas = [
      'breznove_tani',
      'breznove_tani',
      'dubnova_naves',
      'dubnova_naves',
      'kvetnova_naves',
      'kvetnova_naves',
      'cervnova_senosec',
      'cervnova_senosec',
      'cervencove_zne',
      'cervencove_zne',
      'srpnova_slavnost',
      'vavrinecka_noc',
      'zarijove_posviceni',
      'svatovaclavska_noc',
      'rijnova_drakiada',
      'dusickova_noc',
    ];

    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(level.arena.id, `Level ${id} arena id`).toBe(expectedArenas[id]);
      expect(level.arena.poiOrder.length, `Level ${id} poiOrder length`).toBeGreaterThanOrEqual(9);
      expect(level.arena.poiOrder).toContain('fields');
      expect(level.arena.poiOrder).toContain('church');
      expect(level.arena.poiOrder).toContain('tavern');
      expect(level.arena.poiOrder).toContain('pond');
      expect(level.arena.poiOrder).toContain('mill');
      expect(level.arena.poiOrder).toContain('forest');
      expect(level.arena.poiOrder).toContain('shrine');
    }
  });

  it('verifies non-empty decorTypes and valid themes across all 16 stages', () => {
    const validThemes = [
      'spring_river',
      'spring_village',
      'summer_harvest',
      'august_harvest',
      'laurence_night',
      'september_feast',
      'wenceslas_night',
      'october_harvest',
      'all_souls_night',
    ];
    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(validThemes).toContain(level.theme);
      expect(level.decorTypes.length, `Level ${id} decorTypes`).toBeGreaterThan(0);
      expect(level.decorTypes).toContain('cottage');
      expect(level.decorTypes).toContain('tree');
      expect(level.decorTypes).toContain('rock');
    }
  });

  it('verifies day and night phases across all 16 stages via getCurrentDayPhase and isNightLevel', () => {
    // Even levels (0, 2, 4, 6, 8, 10, 12, 14) are day levels; odd levels (1, 3, 5, 7, 9, 11, 13, 15) are night levels
    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      const isNight = id % 2 === 1;

      if (isNight) {
        expect(level.isNightLevel, `Level ${id} must have isNightLevel = true`).toBe(true);
        // Phase at start (0s) should be dusk
        const startPhase = getCurrentDayPhase(0, id);
        expect(startPhase.id, `Level ${id} at 0s should start in dusk`).toBe('dusk');
      } else {
        expect(level.isNightLevel, `Level ${id} must have isNightLevel = false or undefined`).toBeFalsy();
        const startPhase = getCurrentDayPhase(0, id);
        expect(startPhase.id, `Level ${id} at 0s should start in noon`).toBe('noon');
      }
    }
  });

  it('verifies STAGE_THREAT_MULTIPLIERS exists for every level 0 through 15 and scales progressively', () => {
    for (let id = 0; id <= 15; id++) {
      const mult = STAGE_THREAT_MULTIPLIERS[id];
      expect(mult, `Threat multiplier for level ${id} must be defined`).toBeGreaterThan(0);
      if (id > 0) {
        expect(mult, `Threat multiplier for level ${id} should be >= level ${id - 1}`).toBeGreaterThanOrEqual(
          STAGE_THREAT_MULTIPLIERS[id - 1]
        );
      }
    }
  });

  it('verifies all spawnable enemies across all 16 stages have an entry in ENEMY_POINTS', () => {
    const missingPoints: string[] = [];
    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      for (const pool of Object.values(level.spawnPools || {})) {
        for (const enemyId of pool) {
          if ((ENEMY_POINTS as Record<string, number>)[enemyId] === undefined) {
            missingPoints.push(enemyId);
          }
        }
      }
    }
    expect(Array.from(new Set(missingPoints))).toEqual([]);
  });

  it('enforces campaign-wide 7 / 2 / 1 enemy and boss repetition caps across all stages', () => {
    const regularStageCounts = new Map<string, number>();
    const miniMidStageCounts = new Map<string, number>();
    const finalBossStageCounts = new Map<string, number>();

    for (let id = 0; id <= 15; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      const uniqueRegularInStage = new Set<string>();
      for (const pool of Object.values(level.spawnPools || {})) {
        for (const enemyId of pool) {
          uniqueRegularInStage.add(enemyId);
        }
      }
      for (const enemyId of uniqueRegularInStage) {
        regularStageCounts.set(enemyId, (regularStageCounts.get(enemyId) || 0) + 1);
      }

      miniMidStageCounts.set(level.miniBoss.id, (miniMidStageCounts.get(level.miniBoss.id) || 0) + 1);
      miniMidStageCounts.set(level.midBoss.id, (miniMidStageCounts.get(level.midBoss.id) || 0) + 1);
      finalBossStageCounts.set(level.finalBoss.id, (finalBossStageCounts.get(level.finalBoss.id) || 0) + 1);
    }

    for (const [enemyId, count] of regularStageCounts.entries()) {
      expect(count, `Regular enemy '${enemyId}' appears in ${count} stages (max allowed is 7)`).toBeLessThanOrEqual(7);
    }
    for (const [bossId, count] of miniMidStageCounts.entries()) {
      expect(count, `Mini/Mid-boss '${bossId}' appears in ${count} stages (max allowed is 2)`).toBeLessThanOrEqual(2);
    }
    for (const [finalBossId, count] of finalBossStageCounts.entries()) {
      if (finalBossId === 'vrchni_carodejnice') {
        expect(count).toBeLessThanOrEqual(2);
      } else {
        expect(count, `Final boss '${finalBossId}' must be unique to 1 single stage`).toBe(1);
      }
    }
  });
});

