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
    // Beginner tutorial miniboss should be balanced (~220 HP), not 1400 HP
    expect(crowMiniBoss.hp).toBeLessThan(500);
    expect(crowMiniBoss.hp).toBeGreaterThanOrEqual(100);
  });

  it('includes level0_completed trophy and verifies completion against meta', async () => {
    const { TROPHIES } = await import('../src/data/trophies');
    const trophy = TROPHIES.find((t) => t.id === 'level0_completed');
    expect(trophy).toBeDefined();
    expect(trophy?.reward).toBeGreaterThan(0);
    expect(trophy?.isMet({ completedLevels: { 0: true } })).toBe(true);
    expect(trophy?.isMet({ completedLevels: {} })).toBe(false);
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
});
