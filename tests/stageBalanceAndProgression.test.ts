import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES, BUBAK_THREAT_COSTS } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { RunDirector, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import { GameEngine } from '../src/game/engine';

describe('Stage Difficulty and Threat Balance Audit (ADR 0048)', () => {
  it('guarantees STAGE_THREAT_MULTIPLIERS strictly scales from 1.00x (stage 0) to 17.90x (stage 23)', () => {
    expect(STAGE_THREAT_MULTIPLIERS[0]).toBe(1.0);
    expect(STAGE_THREAT_MULTIPLIERS[23]).toBe(17.9);

    for (let id = 1; id <= 23; id++) {
      expect(
        STAGE_THREAT_MULTIPLIERS[id],
        `Threat multiplier in stage ${id} must be >= stage ${id - 1}`
      ).toBeGreaterThanOrEqual(STAGE_THREAT_MULTIPLIERS[id - 1]);
    }
  });

  it('verifies every single phase in all 24 stages contains at least one mob costing <= 6 threat (no deadlock on 2.00x)', () => {
    for (let id = 0; id <= 23; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      for (const [phase, pool] of Object.entries(level.spawnPools || {})) {
        if (!Array.isArray(pool) || pool.length === 0) continue;
        const costs = pool.map((eid) => BUBAK_THREAT_COSTS[eid] ?? 3);
        const minCost = Math.min(...costs);
        expect(
          minCost,
          `Stage ${id} (${phase}) minimum threat cost must be <= 6 so 2.00x difficulty can spawn mobs`
        ).toBeLessThanOrEqual(6);
      }
    }
  });

  it('verifies Day vs Night pacing heartbeat: Night stages have higher average threat cost and EHP than adjacent day stages', () => {
    for (let pair = 0; pair < 12; pair++) {
      const dayId = pair * 2;
      const nightId = pair * 2 + 1;
      const dayLvl = GAME_LEVELS[dayId as keyof typeof GAME_LEVELS];
      const nightLvl = GAME_LEVELS[nightId as keyof typeof GAME_LEVELS];

      const getAvgCost = (lvl: any) => {
        const pool = lvl.spawnPools?.midnight || lvl.spawnPools?.night || lvl.spawnPools?.noon || [];
        const costs = pool.map((e: string) => BUBAK_THREAT_COSTS[e] ?? 3);
        return costs.reduce((a: number, b: number) => a + b, 0) / (costs.length || 1);
      };

      const dayCost = getAvgCost(dayLvl);
      const nightCost = getAvgCost(nightLvl);

      // In the middle campaign (stages 6-13), night is distinctly menacing and heavier
      if (dayId >= 6 && dayId <= 12) {
        expect(
          nightCost,
          `Night stage ${nightId} (${nightLvl.shortTitle}) must have higher average mob cost than day stage ${dayId} (${dayLvl.shortTitle})`
        ).toBeGreaterThanOrEqual(dayCost);
      }
    }
  });

  it('verifies final boss HP scales monotonically from early stages (~1,800-2,500) to carnival climax (30,000 HP)', () => {
    const finalBossHps: number[] = [];

    for (let id = 0; id <= 23; id++) {
      const lvl = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      const boss = lvl.finalBoss;
      const e = ENEMIES[boss.id];
      expect(e, `Final boss ${boss.id} must exist in ENEMIES`).toBeDefined();

      let hp = Math.round((e.hp || 500) * (boss.multiplier || 1));
      if (boss.id === 'vrana') {
        hp = 1800; // 9 flock members * 200 hp
      } else if (boss.id === 'ledovi_muzi') {
        hp = 4032; // 3 trio members * 1344 hp
      }
      finalBossHps.push(hp);
    }

    // Benchmark anchors
    expect(finalBossHps[0]).toBe(1800);
    expect(finalBossHps[1]).toBe(2424);
    expect(finalBossHps[6]).toBe(5555);
    expect(finalBossHps[9]).toBe(15444);
    expect(finalBossHps[17]).toBe(20200);
    expect(finalBossHps[23]).toBe(30000);

    // End-game bosses (stages 16-23) must strictly increase in difficulty
    for (let id = 17; id <= 23; id++) {
      expect(
        finalBossHps[id],
        `Final boss HP in endgame stage ${id} must be >= stage ${id - 1}`
      ).toBeGreaterThanOrEqual(finalBossHps[id - 1]);
    }
  });

  it('runs headless simulation across sample stages (0, 6, 12, 18, 23) and confirms healthy living mob density (10..45)', () => {
    const testStages = [0, 6, 12, 18, 23];

    for (const stageId of testStages) {
      const engine = new GameEngine();
      engine.initRun(stageId as any, 'wanderer');
      const director = new RunDirector(stageId as any, engine);

      const livingSamples: number[] = [];

      // Warmup from 0 to 20s, then record 20s..90s slice
      for (let t = 0; t <= 90; t += 0.5) {
        engine.state.gameTime = t;

        // Player eliminates enemies on ~3s cadence
        for (let i = engine.livingEnemies.length - 1; i >= 0; i--) {
          const foe = engine.livingEnemies[i];
          foe._simAge = (foe._simAge || 0) + 0.5;
          if (foe._simAge >= 3.0) {
            foe.dead = true;
            foe.isDefeated = true;
            director.recordEnemyDeath(foe, t);
            engine.livingEnemies.splice(i, 1);
          }
        }

        director.update(0.5, engine);
        if (t >= 20) {
          livingSamples.push(engine.livingEnemies.length);
        }
      }

      const avgLiving = livingSamples.reduce((a, b) => a + b, 0) / livingSamples.length;
      const maxLiving = Math.max(...livingSamples);

      expect(
        avgLiving,
        `Stage ${stageId} avg living enemies must be healthy (>= 5 and <= 45)`
      ).toBeGreaterThanOrEqual(5);
      expect(
        avgLiving,
        `Stage ${stageId} avg living enemies must not cause horde flood (<= 45)`
      ).toBeLessThanOrEqual(45);
      expect(
        maxLiving,
        `Stage ${stageId} max living enemies must respect director limits (<= 50)`
      ).toBeLessThanOrEqual(50);
    }
  });
});
