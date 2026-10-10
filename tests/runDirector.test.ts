import { describe, it, expect, beforeEach } from 'vitest';
import { RunDirector } from '../src/game/director';
import { GameEngine } from '../src/game/engine';
import { selectRunRozmar, RUN_ROZMARY } from '../src/data/runArchetypes';
import { ENEMIES } from '../src/data/enemies';

describe('RunRozmar and Procedural Variance', () => {
  it('defines exactly 3 unique folklore Rozmars for each of the 6 levels', () => {
    for (let lvl = 1; lvl <= 6; lvl++) {
      const rozmary = RUN_ROZMARY[lvl as 1 | 2 | 3 | 4 | 5 | 6];
      expect(rozmary).toBeDefined();
      expect(rozmary.length).toBe(3);
      const ids = new Set(rozmary.map((r) => r.id));
      expect(ids.size).toBe(3);
      for (const r of rozmary) {
        expect(r.name).toBeTruthy();
        expect(r.subtitle).toBeTruthy();
        expect(r.icon).toBeTruthy();
        expect(r.threatMultiplier).toBeGreaterThan(0.8);
        expect(r.anomalyWindow[0]).toBeLessThan(r.anomalyWindow[1]);
        for (const enemyId of r.preferredEnemyIds) {
          expect(ENEMIES[enemyId]).toBeDefined();
        }
      }
    }
  });

  it('selectRunRozmar returns deterministic results given a numeric seed', () => {
    const r1 = selectRunRozmar(1, 42);
    const r2 = selectRunRozmar(1, 42);
    const r3 = selectRunRozmar(1, 43);
    expect(r1.id).toBe(r2.id);
    expect(typeof r3.id).toBe('string');
  });

  it('level 2 runs smoothly without throwing unknown enemy errors for all rozmary', () => {
    for (const seed of [0, 1, 2]) {
      const eng = new GameEngine();
      eng.initRun({ levelId: 2, seed, spawnInitialWave: true });
      expect(() => {
        for (let i = 0; i < 50; i++) {
          eng.update(0.1);
        }
      }).not.toThrow();
    }
  });

  it('createHeadlessEnemy recovers safely with fallback when given an unknown enemy id', () => {
    const eng = new GameEngine();
    eng.initRun({ levelId: 2, seed: 0, spawnInitialWave: false });
    expect(() => {
      const mob = eng.createHeadlessEnemy('unknown_dummy_mob', 0, 0);
      expect(mob).toBeDefined();
      expect(mob.hp).toBeGreaterThan(0);
    }).not.toThrow();
  });
});

describe('RunDirector Core & Threat Budget', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 100, spawnInitialWave: false });
    director = engine.director!;
  });

  it('initializes with level Rozmar and initial threat budget', () => {
    expect(director).toBeDefined();
    expect(director.rozmar).toBeDefined();
    expect(director.threatBudget).toBeGreaterThanOrEqual(10);
    expect(director.valvePhase).toBe('buildup');
  });

  it('accrues budget over time and scales capacity with daytime', () => {
    engine.livingEnemies = new Array(75).fill({ hp: 50 });
    const initBudget = director.threatBudget;
    director.update(1.0, engine);
    expect(director.threatBudget).toBeGreaterThan(initBudget);

    // Fast-forward gameTime to dusk/night
    engine.state.gameTime = 250;
    director.update(1.0, engine);
    expect(director.budgetCap).toBeGreaterThanOrEqual(85);
  });

  it('respects the 75 living enemy hard-cap to protect 60 FPS', () => {
    director.threatBudget = 100;
    engine.livingEnemies = new Array(75).fill({ hp: 50, speed: 80, x: 0, y: 0 });

    const enemiesBefore = engine.state.enemies.length;
    director.update(1.0, engine);
    const enemiesAfter = engine.state.enemies.length;

    // No new entities should be spawned when cap of 75 is reached
    expect(enemiesAfter).toBe(enemiesBefore);
  });
});

describe('TTK Tracking & Player Dominance', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 77, spawnInitialWave: false });
    director = engine.director!;
  });

  it('tracks kill duration and computes high dominance when player clears fast', () => {
    const fakeMob1 = { id: 'rarach', hp: 40 };
    const fakeMob2 = { id: 'rarach', hp: 40 };

    director.recordEnemySpawn(fakeMob1, 10.0);
    director.recordEnemyDeath(fakeMob1, 10.4); // 0.4s kill

    director.recordEnemySpawn(fakeMob2, 11.0);
    director.recordEnemyDeath(fakeMob2, 11.5); // 0.5s kill

    const avgTTK = director.getAverageTTK();
    expect(avgTTK).toBeCloseTo(0.45, 1);

    const player = engine.state.player;
    player.hp = player.maxHp;
    const dom = director.computeDominanceIndex(player);
    expect(dom).toBeGreaterThan(0.7);
  });

  it('activates assistance when player has slow TTK and low courage', () => {
    const fakeMob = { id: 'vodnik', hp: 200 };
    director.recordEnemySpawn(fakeMob, 5.0);
    director.recordEnemyDeath(fakeMob, 8.5); // 3.5s kill

    const player = engine.state.player;
    player.hp = player.maxHp * 0.25; // low courage

    director.update(0.1, engine);
    expect(director.assistanceActive).toBe(true);
  });
});

describe('Pacing Valves (Oddych a Přepadení)', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 12, spawnInitialWave: false });
    director = engine.director!;
  });

  it('transitions from buildup to peak when budget is exhausted under pressure', () => {
    director.threatBudget = 3;
    engine.livingEnemies = new Array(20).fill({ hp: 50 });

    director.update(0.1, engine);
    expect(director.valvePhase).toBe('peak');
  });

  it('triggers lull (Oddych) when enemies are wiped out, followed by telegraph and ambush', () => {
    director.valvePhase = 'peak';
    engine.livingEnemies = [ { hp: 10 } ]; // <= 4 enemies

    director.update(0.1, engine);
    expect(director.valvePhase).toBe('lull');
    expect(director.valveTimer).toBeGreaterThan(3.0);

    // Step through lull (3.5s)
    for (let i = 0; i < 36; i++) {
      director.update(0.1, engine);
    }
    expect(director.valvePhase).toBe('telegraph');
    expect(director.telegraphMessage).toContain('přepadení');

    // Step through telegraph (1.0s) to ambush
    const enemiesBefore = engine.state.enemies.length;
    for (let i = 0; i < 11; i++) {
      director.update(0.1, engine);
    }
    expect(director.valvePhase).toBe('buildup');
    expect(engine.state.enemies.length).toBeGreaterThan(enemiesBefore);
  });
});

describe('Anomálie: Bubácká díra', () => {
  let engine: GameEngine;
  let director: RunDirector;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, seed: 50, spawnInitialWave: false });
    director = engine.director!;
  });

  it('spawns Bubacka dira inside anomaly time window', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;

    director.update(0.1, engine);
    expect(director.bubackaDira).toBeDefined();
    expect(director.bubackaDira?.isCompleted).toBe(false);
    expect(director.bubackaDira?.isFailed).toBe(false);
  });

  it('completes ritual when player stays inside for cumulative required hold time', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    const player = engine.state.player;
    player.x = dira.x;
    player.y = dira.y; // inside

    // Step hold time (4.0s required)
    director.update(2.0, engine);
    expect(dira.holdTimeRemaining).toBeCloseTo(2.0, 1);
    expect(dira.isCompleted).toBe(false);

    director.update(2.1, engine);
    expect(dira.isCompleted).toBe(true);
  });

  it('fails and spawns furious miniboss if timer expires before hold is completed', () => {
    const [startSec] = director.rozmar.anomalyWindow;
    engine.state.gameTime = startSec + 1;
    director.update(0.1, engine);

    const dira = director.bubackaDira!;
    const player = engine.state.player;
    player.x = dira.x + 800; // far away outside
    player.y = dira.y + 800;

    const enemiesBefore = engine.state.enemies.length;
    director.update(15.5, engine);
    expect(dira.isFailed).toBe(true);
    expect(engine.state.enemies.length).toBeGreaterThan(enemiesBefore);
  });
});
