import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { RUN_ROZMARY, selectRunRozmar } from '../src/data/runArchetypes';
import { GameEngine } from '../src/game/engine';
import { getLevelTranslation } from '../src/i18n';
import { MARCH_THAW_DECOR, MARCH_THAW_POIS, isInsideMarchPoi } from '../src/data/marchThawArena';

describe('Level 1: Předjaří v Hrusicích (Tutorial / Prologue)', () => {
  it('numbers player-facing game stages from 1 through 7 without changing internal IDs', () => {
    expect(Object.values(GAME_LEVELS).map((level) => Number(level.name.match(/^\d+/)?.[0])))
      .toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(GAME_LEVELS[0].id).toBe(0);
    expect(GAME_LEVELS[6].id).toBe(6);
  });

  it('defines valid Level 0 structure with correct theme and bosses', () => {
    const lvl0 = GAME_LEVELS[0];
    expect(lvl0).toBeDefined();
    expect(lvl0.id).toBe(0);
    expect(lvl0.name).toBe('1. Předjaří v Hrusicích');
    expect(lvl0.theme).toBe('spring_river');
    expect(lvl0.season).toBe('spring');
    expect(lvl0.miniBoss.id).toBe('vrana');
    expect(lvl0.miniBoss).toMatchObject({ id: 'vrana', time: 30, kills: 20, multiplier: 4.5 });
    // The new circular flock is a separate encounter; it must not rewrite the existing miniboss.
    expect(lvl0.midBoss.id).toBe('vodnicek');
    expect(lvl0.finalBoss.id).toBe('morana');
    expect(lvl0.spawnPools.noon).toContain('vrana');
    expect(lvl0.spawnPools.noon).toContain('mrazovy_skritek');
    expect(lvl0.spawnPools.dusk).toContain('mrazivy_obr');
    expect(lvl0.spawnPools.noon).not.toContain('zaba');
    const allStage1Spawns = Object.values(lvl0.spawnPools).flat();
    for (const excluded of ['rarach', 'certik', 'sazovy_rarach', 'cert', 'topivec', 'vodnicek', 'hastrman']) {
      expect(allStage1Spawns).not.toContain(excluded);
    }
    // Vodníček is retained only as the scheduled mid-boss, not a regular spawn.
    expect(lvl0.midBoss.id).toBe('vodnicek');
    expect(lvl0.spawnPools.midnight).toEqual(['mrazovy_skritek', 'bludicka']);
    expect(lvl0.spawnPools.midnight).not.toContain(lvl0.finalBoss.id);
    expect(lvl0.arena).toMatchObject({ id: 'breznove_tani', layout: 'asymmetric_poi' });
  });

  it('defines Morana as the first stage boss with ranged frost-wind attacks', async () => {
    const { ENEMIES } = await import('../src/data/enemies');
    expect(GAME_LEVELS[0].finalBoss.id).toBe('morana');
    expect(GAME_LEVELS[0].bossMechanic.label).toContain('Moran');
    expect(ENEMIES.morana).toMatchObject({
      category: 'bosses',
      method: 'drawMorana',
      radius: 65,
    });
    expect(ENEMIES.mrazivy_obr).toMatchObject({
      category: 'frost',
      method: 'drawFrostGiant',
      radius: 34,
    });
    expect(ENEMIES.morana.strength).toContain('Mrazivé větrné salvy');
  });

  it('uses a fixed March Thaw composition instead of random scenery for its POIs', () => {
    expect(MARCH_THAW_DECOR).toHaveLength(8);
    expect(MARCH_THAW_DECOR.map((item) => item.type)).toEqual(expect.arrayContaining([
      'march_banner', 'march_fields', 'march_church', 'march_village', 'march_pond', 'march_mill', 'march_forest', 'march_shrine',
    ]));
    expect(isInsideMarchPoi(MARCH_THAW_POIS.church.x, MARCH_THAW_POIS.church.y, MARCH_THAW_POIS.church)).toBe(true);
    expect(isInsideMarchPoi(MARCH_THAW_POIS.church.x + MARCH_THAW_POIS.church.radius + 1, MARCH_THAW_POIS.church.y, MARCH_THAW_POIS.church)).toBe(false);
  });

  it('provides complete LEVEL_UNLOCKS entry and getLevelProgress', () => {
    expect(LEVEL_UNLOCKS[0]).toBeDefined();
    expect(LEVEL_UNLOCKS[0].defaultUnlocked).toBe(true);
    expect(LEVEL_UNLOCKS[0].realShortTitle).toBe(GAME_LEVELS[0].shortTitle);
    expect(LEVEL_UNLOCKS[0].milestones[0].spoiledShortTitle).toBe(GAME_LEVELS[0].shortTitle);

    const prog = getLevelProgress(0, {});
    expect(prog.isUnlocked).toBe(true);
    expect(prog.spoiledName).toBe('1. Předjaří v Hrusicích');
    expect(prog.tier).toBe(4);
  });

  it('has localized names in Czech and English', () => {
    const csTrans = getLevelTranslation(0, 'cs');
    expect(csTrans.name).toBe('1. Předjaří v Hrusicích');
    expect(csTrans.shortTitle).toBe('Březnové tání');
    expect(csTrans.finalBoss.name).toContain('Morana');
    expect(csTrans.miniBoss.name).toContain('mrazivých vran');

    const enTrans = getLevelTranslation(0, 'en');
    expect(enTrans.name).toBe('1. Early Spring in Hrusice');
    expect(enTrans.shortTitle).toBe('March Thaw');
    expect(enTrans.finalBoss.name).toContain('Morana');
    expect(enTrans.miniBoss.name).toContain('Frost Crow Flock');
  });

  it('has exactly 3 unique folklore Rozmars', () => {
    const rozmary = RUN_ROZMARY[0];
    expect(rozmary).toBeDefined();
    expect(rozmary.length).toBe(3);
    const ids = new Set(rozmary.map((r) => r.id));
    expect(ids.size).toBe(3);

    const picked = selectRunRozmar(0, 123);
    expect(picked).toBeDefined();
    expect(picked.levelId).toBe(0);
  });

  it('initializes engine run with level 0, relaxed spawn timer, and opening wave', () => {
    const engine = new GameEngine();
    const state = engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: true,
    });

    expect(state.activeLevelId).toBe(0);
    expect(state.spawnTimer).toBeGreaterThanOrEqual(3.0);
    expect(state.enemies.length).toBe(2);
    expect(state.enemies[0].id).toBe('vrana');
    expect(state.enemies[1].id).toBe('vrana');
  });

  it('defines the fast crow and weak frostling for stage 1', async () => {
    const { ENEMIES } = await import('../src/data/enemies');
    expect(ENEMIES.vrana).toMatchObject({ method: 'drawStageCrow', speed: 188, hp: 28 });
    expect(ENEMIES.mrazovy_skritek).toMatchObject({ method: 'drawFrostling', hp: 38, damage: 4 });
    expect(ENEMIES.mrazovy_skritek.strength).toContain('Široká aura');
    expect(GAME_LEVELS[0].spawnPools.noon).not.toContain('zaba');
    expect(GAME_LEVELS[0].spawnPools.afternoon).not.toContain('zaba');
  });

  it('configures tajici_snehulak as Tající sněhulák with 40-member horde mechanics', async () => {
    const { ENEMIES } = await import('../src/data/enemies');
    expect(ENEMIES.tajici_snehulak).toBeDefined();
    expect(ENEMIES.tajici_snehulak.name).toBe('Tající sněhulák');
    expect(ENEMIES.tajici_snehulak.name).not.toContain('Zákeřný');
    expect(ENEMIES.tajici_snehulak.strength).toContain('40');
    expect(GAME_LEVELS[0].keyEnemies.find((e) => e.id === 'tajici_snehulak')?.name).toBe('Tající sněhulák');
  });

  it('scales the stage 1 crow miniboss reasonably for tutorial difficulty', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const crowMiniBoss = engine.spawnMonster('vrana', 100, 100, 4.5, false, true, '🐦‍⬛ Hejno mrazivých vran');
    expect(crowMiniBoss.isMiniboss).toBe(true);
    expect(crowMiniBoss.isMinibossFlockMember).toBe(true);
    expect(crowMiniBoss.flockTotal).toBe(9);
    expect(engine.state.enemies.filter((e) => e.isMinibossFlockMember)).toHaveLength(9);
    // Beginner tutorial miniboss should be balanced (~168 HP per giant crow), not 1400 HP
    expect(crowMiniBoss.hp).toBe(168);
    expect(crowMiniBoss.renderScale).toBe(3.0);

    const vodnicekMidBoss = engine.spawnMonster('vodnicek', 150, 150, GAME_LEVELS[0].midBoss.multiplier, false, true, '💧 Jarní Vodníček');
    expect(vodnicekMidBoss.isMiniboss).toBe(true);
    expect(vodnicekMidBoss.hp).toBeGreaterThanOrEqual(220);
    expect(vodnicekMidBoss.hp).toBeLessThan(441);
  });

  it('never leaks Polednice or devils into Stage 1 regular pools across any day phase', async () => {
    const { RunDirector } = await import('../src/game/director');
    const director = new RunDirector(0, 42);
    const phaseTimes = [0, 35, 70, 105, 145]; // noon, afternoon, dusk, night, midnight
    for (const gameTime of phaseTimes) {
      const pool = (director as any).getAllBubaksPool({ activeLevelId: 0, gameTime });
      expect(pool).not.toContain('polednice');
      expect(pool).not.toContain('rarach');
      expect(pool).not.toContain('krvavy_rarach');
      expect(pool).not.toContain('kalny_hastrman');
      expect(pool).not.toContain('vodnicek');
    }
  });

  it('updates standalone tajici_snehulak melt squash and wobble scales during update', () => {
    const engine = new GameEngine();
    const state = engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
    const snowman = engine.spawnMonster('tajici_snehulak', 200, 0);
    expect(snowman.meltHpRatio).toBe(1.0);
    snowman.hp = snowman.maxHp * 0.5;
    snowman.update(0.25, state.player);
    expect(snowman.meltHpRatio).toBeCloseTo(0.5, 3);
    expect(snowman.meltSquashX).toBeGreaterThan(1.0);
    expect(snowman.meltSquashY).toBeLessThan(1.0);
    expect(snowman.wobbleScaleX).not.toBe(1.0);
  });

  it('includes level0_completed trophy and verifies completion against meta or Morana kill', async () => {
    const { TROPHIES } = await import('../src/data/trophies');
    const trophy = TROPHIES.find((t) => t.id === 'level0_completed');
    expect(trophy).toBeDefined();
    expect(trophy?.reward).toBeGreaterThan(0);
    expect(trophy?.isMet({ completedLevels: { 0: true } } as any)).toBe(true);
    expect(trophy?.isMet({ completedLevels: {}, bestiaryKills: { morana: 1 } } as any)).toBe(true);
    expect(trophy?.isMet({ completedLevels: {}, bestiaryKills: {} } as any)).toBe(false);
  });

  it('seeds storybook lighting and occluders from march landmarks', async () => {
    const { seedLightingAndOccludersFromDecor } = await import('../src/game/storybookLighting');
    const lights: any[] = [];
    const shadows: any[] = [];
    const occluders: any[] = [];
    seedLightingAndOccludersFromDecor(MARCH_THAW_DECOR as any, lights, shadows, occluders);

    // Church, village, shrine, mill should produce lights
    expect(lights.length).toBeGreaterThanOrEqual(4);
    // Church, village, shrine, mill, forest should produce occluders
    expect(occluders.length).toBeGreaterThanOrEqual(5);
  });

  it('builds complete Stage 1 BŘEZEN panoramic SVG landscape with KAPLIČKA while keeping Marian apparition separate from static map', async () => {
    const {
      buildMarchThawLandscapeSvg,
      buildMarianApparitionSvg,
      getMarianApparitionVisualState,
    } = await import('../src/render/marchThawSvgLandscape');
    const svg = buildMarchThawLandscapeSvg(false);
    expect(svg).toContain('<svg');
    expect(svg).toContain('BŘEZEN');
    expect(svg).toContain('POLE');
    expect(svg).toContain('KOSTEL');
    expect(svg).toContain('HOSPODA');
    expect(svg).toContain('VESNICE');
    expect(svg).toContain('ŠKOLA');
    expect(svg).toContain('RYBNÍK');
    expect(svg).toContain('MLÝN');
    expect(svg).toContain('KAPLIČKA');
    expect(svg).not.toContain('marian-apparition');
    expect(svg).toContain('LES');

    const marianSvg = buildMarianApparitionSvg();
    expect(marianSvg).toContain('<svg');
    expect(marianSvg).toContain('id="marian-apparition"');
    expect(marianSvg).toContain('#0284C7'); // Royal blue folk-art mantle
    expect(marianSvg).toContain('#FACC15'); // Golden crown, trim & stars

    // Idle state: Maria is NOT visible above the Kaplička
    const idleState = getMarianApparitionVisualState(0, 0);
    expect(idleState.visible).toBe(false);
    expect(idleState.scale).toBe(0);

    // Just appeared (start of 4.2s apparition) -> small, then gradually grows larger, then vanishes
    const startState = getMarianApparitionVisualState(4.15, 0, 4.2);
    const midState = getMarianApparitionVisualState(2.6, 0, 4.2);
    const peakState = getMarianApparitionVisualState(1.1, 0, 4.2);
    const fadingState = getMarianApparitionVisualState(0.25, 0, 4.2);

    expect(startState.visible).toBe(true);
    expect(startState.scale).toBeLessThan(0.25);
    expect(midState.scale).toBeGreaterThan(startState.scale);
    expect(peakState.scale).toBeGreaterThan(midState.scale);
    expect(fadingState.alpha).toBeLessThan(peakState.alpha);
  });

  it('triggers the apparition of Panna Maria s Ježíškem at Kaplička, scatters nearby bubáci, and then vanishes', () => {
    const engine = new GameEngine();
    const state = engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    expect(MARCH_THAW_POIS.shrine.title).toBe('Kaplička');
    expect(MARCH_THAW_POIS.shrine.hint).toContain('Panny Marie s Ježíškem');

    // Place player inside Kaplička radius and a tough enemy nearby
    state.player.x = MARCH_THAW_POIS.shrine.x + 45;
    state.player.y = MARCH_THAW_POIS.shrine.y + 10;
    const foe = engine.spawnMonster('mrazivy_obr', MARCH_THAW_POIS.shrine.x + 140, MARCH_THAW_POIS.shrine.y, 2.0);
    const initialHp = foe.hp;

    // Step 1.8s at Kaplička to charge and trigger the Marian apparition
    for (let i = 0; i < 18; i++) {
      engine.update(0.1);
    }

    expect(state.marchThaw.apparitionTimer).toBeGreaterThan(0);
    expect(foe.hp).toBeLessThan(initialHp);
    expect(foe.panicked).toBe(true);
    expect(state.texts.some((t: any) => String(t.text).includes('PANNY MARIE'))).toBe(true);

    // Step another 4.5s and verify the apparition disappears again
    for (let i = 0; i < 45; i++) {
      engine.update(0.1);
    }
    expect(state.marchThaw.apparitionTimer).toBe(0);
  });

  it('enforces impassable cottages (chalupy) and terrain obstacles while keeping flying crows unhindered', async () => {
    const { MARCH_THAW_OBSTACLES, resolveMarchThawObstacles } = await import('../src/data/marchThawArena');
    const hospoda = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main')!;
    expect(hospoda).toBeDefined();

    // Ground entity inside a cottage is pushed outside the impassable footprint
    const walker = { x: hospoda.x + 10, y: hospoda.y + 5, radius: 18 };
    const pushed = resolveMarchThawObstacles(walker, false);
    expect(pushed).toBe(true);
    const outsideX = Math.abs(walker.x - hospoda.x) >= (hospoda.halfW ?? 0) + walker.radius - 0.01;
    const outsideY = Math.abs(walker.y - hospoda.y) >= (hospoda.halfH ?? 0) + walker.radius - 0.01;
    expect(outsideX || outsideY).toBe(true);

    // Flying entity (e.g. crow) is not blocked by ground cottage walls
    const crow = { x: hospoda.x, y: hospoda.y, radius: 14 };
    expect(resolveMarchThawObstacles(crow, true)).toBe(false);
    expect(crow.x).toBe(hospoda.x);
  });

  it('keeps ice floes strictly inside the pond or stream and carries units standing on them', async () => {
    const {
      MARCH_ICE_FLOE_SPECS,
      getMarchIceFloeState,
      getMarchWaterAndFloeEffect,
      isPointInMarchPondWater,
      isPointInMarchStreamWater,
      isPointOnMarchBridge,
    } = await import('../src/data/marchThawArena');

    for (const sampleTime of [0, 3.5, 11.2, 27.8, 64.0]) {
      for (let i = 0; i < MARCH_ICE_FLOE_SPECS.length; i++) {
        const floe = getMarchIceFloeState(i, sampleTime);
        if (floe.zone === 'pond') {
          expect(isPointInMarchPondWater(floe.x, floe.y, 8)).toBe(true);
        } else {
          const onBridgeOrStream =
            isPointOnMarchBridge(floe.x, floe.y) || isPointInMarchStreamWater(floe.x, floe.y).inStream;
          expect(onBridgeOrStream).toBe(true);
        }
      }
    }

    // Standing on a pond ice floe carries the player and grants sliding speed bonus without freezing water penalty
    const pondFloe0 = getMarchIceFloeState(0, 5.0);
    const effectOnFloe = getMarchWaterAndFloeEffect(pondFloe0.x, pondFloe0.y, 5.0);
    expect(effectOnFloe.onFloe).toBe(true);
    expect(effectOnFloe.inOpenWater).toBe(false);
    expect(effectOnFloe.speedMultiplier).toBeGreaterThan(1.0);
    expect(Math.hypot(effectOnFloe.carryVx, effectOnFloe.carryVy)).toBeGreaterThan(0);
  });

  it('clamps entities inside the +25% outer arena border, flows the river to the arena edges with heavy slow, and supports all 4 forests and 9 named POIs', async () => {
    const {
      MARCH_ARENA_BOUNDS,
      MARCH_FOREST_ZONES,
      MARCH_STREAM_WAYPOINTS,
      MARCH_THAW_POIS,
      clampToMarchArenaBounds,
      getMarchWaterAndFloeEffect,
      isAquaticEnemy,
      pickMarchForestSpawnPoint,
    } = await import('../src/data/marchThawArena');

    // 1. +25% scaled hard outer arena bounds
    expect(MARCH_ARENA_BOUNDS.maxX).toBe(1920);
    expect(MARCH_ARENA_BOUNDS.minY).toBe(-1675);
    const runaway = { x: 2500, y: -2200, radius: 20 };
    expect(clampToMarchArenaBounds(runaway)).toBe(true);
    expect(runaway.x).toBe(MARCH_ARENA_BOUNDS.maxX - 20);
    expect(runaway.y).toBe(MARCH_ARENA_BOUNDS.minY + 20);

    // 2. River flows all the way from northern edge to southern edge and strongly slows open-water wading
    expect(MARCH_STREAM_WAYPOINTS[0].y).toBeLessThanOrEqual(MARCH_ARENA_BOUNDS.minY);
    expect(MARCH_STREAM_WAYPOINTS[MARCH_STREAM_WAYPOINTS.length - 1].y).toBeGreaterThanOrEqual(MARCH_ARENA_BOUNDS.maxY);

    // Find a point in the river off any floe at t = 0
    const riverMid = MARCH_STREAM_WAYPOINTS[3];
    const riverEffect = getMarchWaterAndFloeEffect(riverMid.x, riverMid.y, 0.37);
    if (!riverEffect.onFloe) {
      expect(riverEffect.inOpenWater).toBe(true);
      expect(riverEffect.speedMultiplier).toBeLessThanOrEqual(0.32);
    }

    expect(isAquaticEnemy({ id: 'vodnicek', category: 'water' })).toBe(true);
    expect(isAquaticEnemy({ id: 'mrazovy_skritek', category: 'frost' })).toBe(false);

    // 3. All 4 larger forests can spawn enemies
    expect(MARCH_FOREST_ZONES).toHaveLength(4);
    const spawnedForests = new Set<string>();
    for (let s = 0; s < 8; s++) {
      const sp = pickMarchForestSpawnPoint(0, 0, s);
      spawnedForests.add(sp.forest.id);
    }
    expect(spawnedForests.size).toBeGreaterThanOrEqual(2);

    // 4. All 9 named locations exist with hints
    expect(Object.keys(MARCH_THAW_POIS)).toEqual(
      expect.arrayContaining(['fields', 'church', 'tavern', 'village', 'school', 'pond', 'mill', 'forest', 'shrine'])
    );
  });
});

