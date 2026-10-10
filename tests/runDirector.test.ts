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

describe('Dynamická obtížnost & Aktivní Režisér výpravy', () => {
  it('defaults to 2.0 (Pekelná štvanice - Max) and clamps to [1.0, 2.0]', () => {
    const defaultDirector = new RunDirector(1);
    expect(defaultDirector.dynamicDifficulty).toBe(2.0);

    const clampedLow = new RunDirector(1, undefined, { dynamicDifficulty: 0.5 });
    expect(clampedLow.dynamicDifficulty).toBe(1.0);

    const clampedHigh = new RunDirector(1, undefined, { dynamicDifficulty: 3.0 });
    expect(clampedHigh.dynamicDifficulty).toBe(2.0);

    const midDirector = new RunDirector(1, undefined, { dynamicDifficulty: 1.5 });
    expect(midDirector.dynamicDifficulty).toBe(1.5);
  });

  it('scales budget cap and accrual higher with dynamicDifficulty', () => {
    const engine1 = new GameEngine();
    engine1.initRun({ levelId: 1, dynamicDifficulty: 1.0, spawnInitialWave: false });
    const dir1 = engine1.director!;

    const engine2 = new GameEngine();
    engine2.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const dir2 = engine2.director!;

    engine1.livingEnemies = new Array(75).fill({ hp: 50 });
    engine2.livingEnemies = new Array(75).fill({ hp: 50 });

    dir1.threatBudget = 0;
    dir2.threatBudget = 0;

    dir1.update(1.0, engine1);
    dir2.update(1.0, engine2);

    expect(dir2.threatBudget).toBeGreaterThan(dir1.threatBudget);
    expect(dir2.budgetCap).toBeGreaterThan(dir1.budgetCap);
  });

  it('triggers Drtivý přepad with dual commanders and poise buffs after lull', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const director = engine.director!;

    director.valvePhase = 'lull';
    director.threatBudget = 35;
    director.valveTimer = 0.05;

    // Advance past lull (0.05s) to telegraph
    director.update(0.1, engine);
    expect(director.valvePhase).toBe('telegraph');
    expect(director.telegraphMessage).toContain('přepad');

    // Advance past telegraph (1.0s) to ambush / drtivý přepad
    const enemiesBefore = engine.state.enemies.length;
    director.update(1.1, engine);

    const newEnemies = engine.state.enemies.slice(enemiesBefore);
    expect(newEnemies.length).toBeGreaterThanOrEqual(4);

    // Look for commanders with Drtivý přepad buffs
    const commanders = newEnemies.filter((e: any) => e.name === 'Přepadový velitel');
    expect(commanders.length).toBe(2);
    for (const c of commanders) {
      expect(c.poiseResist).toBeGreaterThanOrEqual(0.35);
      expect(c.drtivyBuffTimer).toBe(3.5);
    }
  });

  it('spawns Zrádný terén when player moves straight for 3.5s (anti-kiting)', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const director = engine.director!;
    const player = engine.state.player;

    player.vx = 80;
    player.vy = 0; // moving straight right

    expect(director.hazards.length).toBe(0);

    // Run for 3.6 seconds in the same direction
    for (let i = 0; i < 36; i++) {
      director.update(0.1, engine);
    }

    expect(director.hazards.length).toBeGreaterThanOrEqual(1);
    const zradny = director.hazards[0];
    expect(zradny.id).toContain('hazard_zradny');
    expect(zradny.slowFactor).toBe(0.75); // -25% slow
    expect(zradny.x).toBeGreaterThan(player.x); // ahead of player
  });

  it('transforms existing enemies into Ostřílení běsi when reaching 75 entity cap', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const director = engine.director!;

    // 75 living enemies
    const fakeMobs = Array.from({ length: 75 }, (_, i) => ({
      id: `mob_${i}`,
      hp: 50,
      speed: 80,
      poiseResist: 0.1,
      isBoss: false,
    }));
    engine.livingEnemies = fakeMobs;
    director.threatBudget = 30;

    // Trigger update at cap
    director.update(1.0, engine);

    const ostri = fakeMobs.filter((m: any) => m.isOstryBes);
    expect(ostri.length).toBeGreaterThanOrEqual(1);
    expect(ostri[0].poiseResist).toBeGreaterThanOrEqual(0.5);
    expect(ostri[0].speed).toBeGreaterThan(80);
    // Entity count remains capped at 75
    expect(engine.livingEnemies.length).toBe(75);
  });

  it('halves the assistance penalty on maximum difficulty 2.0 vs standard 1.0', () => {
    const engineLow = new GameEngine();
    engineLow.initRun({ levelId: 1, dynamicDifficulty: 1.0, spawnInitialWave: false });
    const dirLow = engineLow.director!;
    engineLow.livingEnemies = new Array(75).fill({ hp: 50 });

    const engineHigh = new GameEngine();
    engineHigh.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const dirHigh = engineHigh.director!;
    engineHigh.livingEnemies = new Array(75).fill({ hp: 50 });

    // Enable assistance
    dirLow.assistanceActive = true;
    dirHigh.assistanceActive = true;
    dirLow.threatBudget = 0;
    dirHigh.threatBudget = 0;

    dirLow.update(1.0, engineLow);
    dirHigh.update(1.0, engineHigh);

    // On 2.0x, penalty is only 25% (0.75x factor), on 1.0x penalty is 50% (0.50x factor)
    // Combined with higher base accrual on 2.0x, dirHigh accrues significantly more
    expect(dirHigh.threatBudget).toBeGreaterThan(dirLow.threatBudget * 1.5);
  });
});
