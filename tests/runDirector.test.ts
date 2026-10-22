import { describe, it, expect, beforeEach } from 'vitest';
import { RunDirector } from '../src/game/director';
import { GameEngine } from '../src/game/engine';
import { selectRunRozmar, RUN_ROZMARY } from '../src/data/runArchetypes';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';
import { getCurrentDayPhase } from '../src/constants';

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
  it('defaults to 3.0 (Zlověstná noc) and clamps to [2.0, 5.0]', () => {
    const defaultDirector = new RunDirector(1);
    expect(defaultDirector.dynamicDifficulty).toBe(3.0);

    const clampedLow = new RunDirector(1, undefined, { dynamicDifficulty: 1.0 });
    expect(clampedLow.dynamicDifficulty).toBe(2.0);

    const clampedHigh = new RunDirector(1, undefined, { dynamicDifficulty: 6.0 });
    expect(clampedHigh.dynamicDifficulty).toBe(5.0);

    const midDirector = new RunDirector(1, undefined, { dynamicDifficulty: 3.0 });
    expect(midDirector.dynamicDifficulty).toBe(3.0);
  });

  it('scales budget cap and accrual higher with dynamicDifficulty', () => {
    const engine1 = new GameEngine();
    engine1.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const dir1 = engine1.director!;

    const engine2 = new GameEngine();
    engine2.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
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

  it.each([2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0])(
    'is significantly more forgiving during the opening 90 seconds at difficulty %s',
    (difficulty) => {
      const openingEngine = new GameEngine();
      openingEngine.initRun({ levelId: 1, dynamicDifficulty: difficulty, spawnInitialWave: false });
      const openingDirector = openingEngine.director!;
      openingEngine.livingEnemies = new Array(75).fill({ hp: 50 });
      openingEngine.state.gameTime = 20;
      openingDirector.threatBudget = 0;
      openingDirector.update(1.0, openingEngine);
      const openingAccrual = openingDirector.threatBudget;
      const openingCap = openingDirector.budgetCap;

      const establishedEngine = new GameEngine();
      establishedEngine.initRun({ levelId: 1, dynamicDifficulty: difficulty, spawnInitialWave: false });
      const establishedDirector = establishedEngine.director!;
      establishedEngine.livingEnemies = new Array(75).fill({ hp: 50 });
      establishedEngine.state.gameTime = 120;
      establishedDirector.threatBudget = 0;
      establishedDirector.update(1.0, establishedEngine);

      expect(openingAccrual).toBeLessThan(establishedDirector.threatBudget);
      expect(openingCap).toBeLessThan(establishedDirector.budgetCap);
    }
  );

  it('triggers Drtivý přepad with dual commanders and poise buffs after lull', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
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

    // Look for commanders with Drtivý přepad tactical formation bonus
    const commanders = newEnemies.filter((e: any) => e.name === 'Přepadový strážmistr');
    expect(commanders.length).toBe(2);
    for (const c of commanders) {
      // Tactical formation speed is applied (1.20x), but poiseResist remains strictly unbuffed
      const prefixMult = c.prefix === 'kamenny' ? 0.8 : c.prefix === 'vycerpany' ? 0.5 : 1.0;
      const expectedBase = (ENEMIES[c.id]?.speed || 40) * prefixMult;
      expect(c.speed).toBeGreaterThan(expectedBase);
      const expectedPoise = c.prefix === 'kamenny'
        ? Math.min(0.95, (ENEMIES[c.id]?.poiseResist || 0) + 0.60)
        : (ENEMIES[c.id]?.poiseResist || 0);
      expect(c.poiseResist).toBe(expectedPoise);
      expect(c.drtivyBuffTimer).toBe(3.5);
    }
  });

  it('spawns Zrádný terén when player moves straight for 3.5s (anti-kiting)', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;
    const player = engine.state.player;

    engine.state.gameTime = 100; // exercise normal hazard timing after the protected opening
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

  it('transforms existing enemies into Ostřílení běsi when reaching 75 entity cap without hidden stat cheating', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
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
    // Marked as veteran without artificially boosting poise or speed stats behind player back
    expect(ostri[0].isOstryBes).toBe(true);
    expect(ostri[0].poiseResist).toBe(0.1);
    expect(ostri[0].speed).toBe(80);
    // Entity count remains capped at 75
    expect(engine.livingEnemies.length).toBe(75);
  });

  it('keeps assistance equally effective across difficulty presets while preserving higher baseline pressure', () => {
    const engineLow = new GameEngine();
    engineLow.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const dirLow = engineLow.director!;
    engineLow.livingEnemies = new Array(75).fill({ hp: 50 });

    const engineHigh = new GameEngine();
    engineHigh.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const dirHigh = engineHigh.director!;
    engineHigh.livingEnemies = new Array(75).fill({ hp: 50 });

    // Assistance is recalculated by update; give both runs a genuinely struggling player.
    engineLow.state.player.hp = engineLow.state.player.maxHp * 0.2;
    engineHigh.state.player.hp = engineHigh.state.player.maxHp * 0.2;
    dirLow.assistanceActive = true;
    dirHigh.assistanceActive = true;
    dirLow.threatBudget = 0;
    dirHigh.threatBudget = 0;

    dirLow.update(1.0, engineLow);
    dirHigh.update(1.0, engineHigh);

    // Assistance uses the same reduction at every preset; the higher preset
    // still accrues more because its baseline threat rate is higher.
    expect(dirHigh.threatBudget).toBeGreaterThan(dirLow.threatBudget * 1.5);
  });

  it('deadlock fix: transitions buildup -> peak -> lull even when player wipes all enemies instantly', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;

    // Player keeps screen completely clear (0 living enemies)
    engine.livingEnemies = [];
    expect(director.valvePhase).toBe('buildup');

    // Advance the simulated run clock as well as director time. The protected
    // opening is longer than the ordinary buildup threshold on this preset.
    for (let i = 0; i <= 360; i++) {
      engine.state.gameTime = i * 0.1;
      director.update(0.1, engine);
      engine.livingEnemies = []; // Keep clear
    }
    // The threshold transition moves buildup -> peak; the next tick sees an
    // empty arena and enters lull.
    director.update(0.1, engine);

    expect(director.valvePhase).toBe('lull');
    expect(director.valveTimer).toBeGreaterThan(0);

    // Advance past remaining lull timer to enter telegraph
    const lullSteps = Math.ceil(director.valveTimer / 0.1) + 1;
    for (let i = 0; i < lullSteps; i++) {
      director.update(0.1, engine);
    }
    expect(director.valvePhase).toBe('telegraph');
    expect(director.telegraphMessage).toContain('přepad');
  });

  it('suppresses heavy formations when the player is struggling, even on high baseline difficulty', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;

    // Low health and no kill evidence must not be mistaken for dominance.
    engine.state.player.hp = engine.state.player.maxHp * 0.2;
    director.threatBudget = 25;
    (director as any).formationCooldown = 0;

    const dom = director.computeDominanceIndex(engine.state.player);
    expect(dom).toBeLessThan(0.35);

    (director as any).lastSpawnCheck = 2.0; // exercise the spawn gate during the opening ramp
    director.update(0.1, engine);

    expect(director.assistanceActive).toBe(true);
    expect(director.pressureMultiplier).toBeLessThan(1);
    expect((director as any).formationCooldown).toBeLessThanOrEqual(0);
  });

  it('allows heavy formations on the lowest difficulty when the player is not struggling', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    const director = engine.director!;
    engine.state.gameTime = 120;
    engine.state.player.hp = engine.state.player.maxHp;
    director.threatBudget = 25;
    (director as any).formationCooldown = 0;
    (director as any).lastSpawnCheck = 2.0;

    const before = engine.state.enemies.length;
    director.update(0.1, engine);

    expect(engine.state.enemies.length).toBeGreaterThan(before);
    expect((director as any).formationCooldown).toBeGreaterThan(0);
  });

  it('does not classify a healthy player as dominating before any kills are recorded', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, spawnInitialWave: false });
    const director = engine.director!;
    engine.state.player.hp = engine.state.player.maxHp;

    expect(director.computeDominanceIndex(engine.state.player)).toBeLessThan(0.6);
  });

  it('raises adaptive pressure for sustained dominance and lowers it for sustained struggle', () => {
    const struggling = new GameEngine();
    struggling.initRun({ levelId: 1, spawnInitialWave: false });
    const strugglingDirector = struggling.director!;
    struggling.state.player.hp = struggling.state.player.maxHp * 0.2;
    for (let i = 0; i < 12; i++) strugglingDirector.update(0.5, struggling);
    expect(strugglingDirector.pressureMultiplier).toBeLessThan(0.9);

    const thriving = new GameEngine();
    thriving.initRun({ levelId: 1, spawnInitialWave: false });
    const thrivingDirector = thriving.director!;
    thriving.state.player.hp = thriving.state.player.maxHp;
    for (let i = 0; i < 4; i++) {
      const mob = { id: `fast_${i}` };
      thrivingDirector.recordEnemySpawn(mob, i);
      thrivingDirector.recordEnemyDeath(mob, i + 0.3);
    }
    for (let i = 0; i < 12; i++) thrivingDirector.update(0.5, thriving);
    expect(thrivingDirector.pressureMultiplier).toBeGreaterThan(1);
  });

  it('deploys Ladovske visual elite variants without inflating base enemy stats (Zero-Cheat Policy)', () => {
    const director = new RunDirector(1, undefined, { dynamicDifficulty: 4.0 });

    // Verify mapping from base to visually distinct elite variant
    expect(director.getEliteVariantForId('rarach')).toBe('krvavy_rarach');
    expect(director.getEliteVariantForId('skeleton')).toBe('krvavy_kostlivec');
    expect(director.getEliteVariantForId('hastrman')).toBe('kalny_hastrman');
    expect(director.getEliteVariantForId('cerny_pes')).toBe('cerny_vlkodlak');
    expect(director.getEliteVariantForId('zbojnik')).toBe('obrneny_zbojnik');

    // Verify authentic base stats and buffed special bubaks
    expect(ENEMIES.rarach.hp).toBe(48);
    expect(ENEMIES.krvavy_rarach.hp).toBe(160);
    expect(ENEMIES.krvavy_rarach.palette).toBe('crimson');
    expect(ENEMIES.cerny_vlkodlak.palette).toBe('soot');
    expect(ENEMIES.kalny_hastrman.palette).toBe('bog');
  });

  it('keeps eight angular spawn directions and spends threat budget on tactical spawns', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;

    // Spawn directions are angles around the player, not world/map cells.
    expect(RunDirector.CELL_COUNT).toBe(8);
    expect(RunDirector.CELL_ANGLES.length).toBe(8);

    director.threatBudget = 30;
    (director as any).formationCooldown = 10; // Bypass heavy formation to test ordinary tactical spawns.
    (director as any).lastSpawnCheck = 1.0;

    const initialLiving = engine.state.enemies.length;
    director.update(0.1, engine);

    expect(engine.state.enemies.length).toBeGreaterThan(initialLiving);
    expect(director.threatBudget).toBeLessThan(30);

    // At the living-enemy cap, excess threat is still converted into elite upgrades.
    director.threatBudget = 25;
    engine.livingEnemies = new Array(75).fill({ hp: 50, speed: 80, x: 0, y: 0 });
    director.update(0.1, engine);
    expect(director.threatBudget).toBeLessThan(25);
  });

  it('limits the available enemy pool to the active phase and its elite variants', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 1, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;
    const levelDef = GAME_LEVELS[engine.state.activeLevelId];
    const phaseKey = getCurrentDayPhase(engine.state.gameTime || 0).id;
    const phasePool = levelDef.spawnPools?.[phaseKey] ?? levelDef.spawnPools?.noon ?? [];

    const expectedPool = new Set(
      phasePool.filter((id) => Boolean(ENEMIES[id]) && ENEMIES[id].category !== 'bosses')
    );
    // At every difficulty, only add elite variants whose base enemies are in this phase.
    for (const baseId of [...expectedPool]) {
      const eliteId = director.getEliteVariantForId(baseId);
      if (eliteId && ENEMIES[eliteId]) {
        expectedPool.add(eliteId);
      }
    }

    const actualPool = director.getAllBubaksPool(engine);
    expect(actualPool.length).toBeGreaterThan(0);
    expect(actualPool.every((id) => expectedPool.has(id))).toBe(true);
    expect(actualPool).not.toContain('krvavy_kostlivec');
    expect(actualPool).not.toContain('cerny_vlkodlak');
    expect(actualPool).not.toContain('obrneny_zbojnik');

    const lowDirector = new RunDirector(1, undefined, { dynamicDifficulty: 2.0 });
    expect(lowDirector.getAllBubaksPool(engine)).toEqual(actualPool);
  });

  it('keeps devils and watermen out of all regular Stage 1 pools, including elite upgrades', () => {
    const engine = new GameEngine();
    engine.initRun({ levelId: 0, dynamicDifficulty: 4.0, spawnInitialWave: false });
    const director = engine.director!;
    const forbidden = new Set([
      'rarach', 'krvavy_rarach', 'certik', 'cert', 'sazovy_rarach', 'drab',
      'jiskrivec', 'ohnivy_muz', 'ohnivy_pes', 'plivnik',
      'vodnicek', 'hastrman', 'topivec', 'kalny_hastrman', 'zaba', 'ropucha',
    ]);

    // Cover noon, afternoon, dusk, night, and midnight pools.
    for (const gameTime of [0, 30, 60, 120, 180]) {
      engine.state.gameTime = gameTime;
      const pool = director.getAllBubaksPool(engine);
      expect(pool.length).toBeGreaterThan(0);
      for (const enemyId of pool) {
        expect(forbidden.has(enemyId), enemyId).toBe(false);
        expect(ENEMIES[enemyId].category, enemyId).not.toBe('demons');
      }
    }

    // Legacy archetypes must not reintroduce banned enemies if a phase pool is empty.
    for (const rozmar of RUN_ROZMARY[0]) {
      for (const enemyId of rozmar.preferredEnemyIds) {
        expect(forbidden.has(enemyId), enemyId).toBe(false);
        expect(ENEMIES[enemyId].category, enemyId).not.toBe('demons');
      }
    }
  });

  it('keeps regular and elite threat costs distinct', () => {
    const director = new RunDirector(1, undefined, { dynamicDifficulty: 4.0 });

    expect(director.getBubakThreatCost('rarach')).toBe(3);
    expect(director.getBubakThreatCost('krvavy_rarach')).toBe(8);
    expect(director.getBubakThreatCost('obrneny_zbojnik')).toBe(8);
  });

  it('lowest difficulty (2.0) does not punish success at all while highest (5.0) provides insane punishment', () => {
    // 1. Lowest difficulty (2.0): player dominating with full HP and rapid kills
    const lowDirector = new RunDirector(1, undefined, { dynamicDifficulty: 2.0 });
    const lowEngine = new GameEngine();
    lowEngine.initRun({ levelId: 1, dynamicDifficulty: 2.0, spawnInitialWave: false });
    lowEngine.state.player.hp = lowEngine.state.player.maxHp;

    for (let i = 0; i < 6; i++) {
      const mob = { id: `fast_low_${i}` };
      lowDirector.recordEnemySpawn(mob, i);
      lowDirector.recordEnemyDeath(mob, i + 0.2);
    }
    for (let i = 0; i < 20; i++) {
      lowDirector.update(0.5, lowEngine);
    }
    // Lowest difficulty must NEVER punish success: pressure multiplier stays <= 1.0
    expect(lowDirector.pressureMultiplier).toBeLessThanOrEqual(1.0);

    // 2. Highest difficulty (5.0): player dominating triggers disproportionate insane pressure
    const highDirector = new RunDirector(1, undefined, { dynamicDifficulty: 5.0 });
    const highEngine = new GameEngine();
    highEngine.initRun({ levelId: 1, dynamicDifficulty: 5.0, spawnInitialWave: false });
    highEngine.state.player.hp = highEngine.state.player.maxHp;

    for (let i = 0; i < 6; i++) {
      const mob = { id: `fast_high_${i}` };
      highDirector.recordEnemySpawn(mob, i);
      highDirector.recordEnemyDeath(mob, i + 0.2);
    }
    for (let i = 0; i < 20; i++) {
      highDirector.update(0.5, highEngine);
    }
    // Disproportionate punishment: pressure skyrockets well above normal
    expect(highDirector.pressureMultiplier).toBeGreaterThan(2.5);
  });

  it('RunDirector.getOffscreenPosition guarantees enemy spawns outside visible viewport', () => {
    const player = { x: 1000, y: 1000 };
    const mockEngine = {
      camera: { x: player.x - 960, y: player.y - 540 },
    };

    // Test across all 8 cardinal / diagonal angles
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const pos = RunDirector.getOffscreenPosition(player, angle, mockEngine, 160);
      const dist = Math.hypot(pos.x - player.x, pos.y - player.y);
      // Must be safely beyond viewport diagonal/distance
      expect(dist).toBeGreaterThanOrEqual(750);

      // Verify coordinate is outside camera viewport rect [camX, camY, camX + 1920, camY + 1080]
      const inViewX = pos.x >= mockEngine.camera.x && pos.x <= mockEngine.camera.x + 1920;
      const inViewY = pos.y >= mockEngine.camera.y && pos.y <= mockEngine.camera.y + 1080;
      expect(inViewX && inViewY).toBe(false);
    }
  });

  it('isHordeClearingArsenal accurately identifies horde-clearing builds', async () => {
    const { isHordeClearingArsenal } = await import('../src/game/director');
    expect(isHordeClearingArsenal(null)).toBe(false);
    expect(isHordeClearingArsenal({ weapons: [] })).toBe(false);

    // Single-target only loadout
    expect(isHordeClearingArsenal({ weapons: [{ id: 'osikovy_prut' }, { id: 'povidlove_buchty' }] })).toBe(false);

    // 50% horde-clearing loadout (aura + single-target)
    expect(isHordeClearingArsenal({ weapons: [{ id: 'osikovy_prut' }, { id: 'hromnicka' }] })).toBe(true);

    // 2+ horde-clearing weapons
    expect(isHordeClearingArsenal({
      weapons: [{ id: 'valecnice' }, { id: 'cesnekova_topinka' }, { id: 'kovarske_vidle' }, { id: 'formansky_bic' }]
    })).toBe(true);
  });

  it('spawns Dvojce minibosse on standard difficulty (3.0) when dominating with horde-clearing arsenal', () => {
    const director = new RunDirector(1, 42, { dynamicDifficulty: 3.0 });
    const eng = new GameEngine();
    eng.initRun({ levelId: 1, seed: 42, dynamicDifficulty: 3.0, spawnInitialWave: false });

    eng.state.player.weapons = [{ id: 'hromnicka' }, { id: 'valecnice' }];
    eng.state.player.hp = eng.state.player.maxHp;
    eng.state.gameTime = 120;
    director.threatBudget = 30;

    // Simulate fast kills within the 3s window for high dominance and kill velocity
    for (let i = 0; i < 5; i++) {
      const mob = { id: `fast_kill_${i}` };
      director.recordEnemySpawn(mob, 118 + i * 0.3);
      director.recordEnemyDeath(mob, 118 + i * 0.3 + 0.15);
    }

    // Step tactical spawns with enough dt to pass spawnInterval (~0.49s)
    director.update(0.6, eng);

    const twin = eng.state.enemies.find((e: any) => e.isPunitiveTwin);
    expect(twin).toBeDefined();
    expect(twin.isMiniboss).toBe(true);
    expect(twin.customBossTitle).toContain('Dvojče');
    expect(director.threatBudget).toBeLessThanOrEqual(20); // 30 - 18 = 12 (+ accrual during 0.6s)
    expect(director.punitiveTwinCooldown).toBeGreaterThan(50);
  });

  it('strictly suppresses Dvojce minibosse on lowest preset 2.00x (Poklid za peci)', () => {
    const director = new RunDirector(1, 42, { dynamicDifficulty: 2.0 });
    const eng = new GameEngine();
    eng.initRun({ levelId: 1, seed: 42, dynamicDifficulty: 2.0, spawnInitialWave: false });

    eng.state.player.weapons = [{ id: 'hromnicka' }, { id: 'valecnice' }];
    eng.state.player.hp = eng.state.player.maxHp;
    eng.state.gameTime = 120;
    director.threatBudget = 35;

    for (let i = 0; i < 6; i++) {
      const mob = { id: `fast_${i}` };
      director.recordEnemySpawn(mob, 118 + i * 0.3);
      director.recordEnemyDeath(mob, 118 + i * 0.3 + 0.1);
    }

    director.update(0.6, eng);
    const twin = eng.state.enemies.find((e: any) => e.isPunitiveTwin);
    expect(twin).toBeUndefined();
  });

  it('triggers panic brake on sudden burst damage and bleeds 10 threat points', () => {
    const director = new RunDirector(1, 42, { dynamicDifficulty: 3.5 });
    const eng = new GameEngine();
    eng.initRun({ levelId: 1, seed: 42, dynamicDifficulty: 3.5, spawnInitialWave: false });

    eng.state.player.hp = 100;
    eng.state.player.maxHp = 100;
    director.threatBudget = 25;
    director.pressureMultiplier = 1.4;

    // Normal step with full HP
    director.update(0.1, eng);
    expect(director.panicBrakeActiveTimer).toBe(0);

    // Sudden 35% health loss in next frame
    eng.state.player.hp = 65;
    director.update(0.1, eng);

    expect(director.panicBrakeActiveTimer).toBeGreaterThan(0);
    expect(director.panicBrakeCooldown).toBeGreaterThan(15);
    expect(director.pressureMultiplier).toBeLessThanOrEqual(0.75);
    expect(director.threatBudget).toBeLessThanOrEqual(16); // 25 - 10 + minor accrual <= 16
    expect(director.assistanceActive).toBe(true);
  });

  it('exposes killVelocity, panicBrakeActive, and punitiveTwinCooldown in telemetry', () => {
    const director = new RunDirector(1, 42, { dynamicDifficulty: 3.0 });
    director.punitiveTwinCooldown = 45.2;
    director.panicBrakeActiveTimer = 1.5;

    const telem = director.getTelemetry();
    expect(telem.punitiveTwinCooldown).toBe(45.2);
    expect(telem.panicBrakeActive).toBe(true);
    expect(typeof telem.killVelocity).toBe('number');
  });
});

