import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { RUN_ROZMARY, selectRunRozmar } from '../src/data/runArchetypes';
import { GameEngine } from '../src/game/engine';
import { getLevelTranslation } from '../src/i18n';

describe('Level 0: Předjaří v Hrusicích (Tutorial / Prologue)', () => {
  it('defines valid Level 0 structure with correct theme and bosses', () => {
    const lvl0 = GAME_LEVELS[0];
    expect(lvl0).toBeDefined();
    expect(lvl0.id).toBe(0);
    expect(lvl0.name).toBe('0. Předjaří v Hrusicích');
    expect(lvl0.theme).toBe('spring_river');
    expect(lvl0.season).toBe('spring');
    expect(lvl0.miniBoss.id).toBe('zaba');
    expect(lvl0.midBoss.id).toBe('vodnicek');
    expect(lvl0.finalBoss.id).toBe('hastrman');
    expect(lvl0.spawnPools.noon).toContain('zaba');
    expect(lvl0.spawnPools.midnight).toContain('hastrman' in lvl0.spawnPools.midnight ? 'hastrman' : 'vodnicek');
  });

  it('provides complete LEVEL_UNLOCKS entry and getLevelProgress', () => {
    expect(LEVEL_UNLOCKS[0]).toBeDefined();
    expect(LEVEL_UNLOCKS[0].defaultUnlocked).toBe(true);

    const prog = getLevelProgress(0, {});
    expect(prog.isUnlocked).toBe(true);
    expect(prog.spoiledName).toBe('0. Předjaří v Hrusicích');
    expect(prog.tier).toBe(4);
  });

  it('has localized names in Czech and English', () => {
    const csTrans = getLevelTranslation(0, 'cs');
    expect(csTrans.name).toBe('0. Předjaří v Hrusicích');
    expect(csTrans.shortTitle).toBe('Předjaří');
    expect(csTrans.finalBoss.name).toContain('Vodník');

    const enTrans = getLevelTranslation(0, 'en');
    expect(enTrans.name).toBe('0. Early Spring in Hrusice');
    expect(enTrans.shortTitle).toBe('Early Spring');
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
    expect(state.enemies[0].id).toBe('zaba');
    expect(state.enemies[1].id).toBe('zaba');
  });

  it('scales miniboss frog reasonably for tutorial difficulty without excessive 1400 HP sponge', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 0,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const frogMiniBoss = engine.spawnMonster('zaba', 100, 100, 4.5, false, true, '🐸 Probuzená Žába');
    expect(frogMiniBoss.isMiniboss).toBe(true);
    // Beginner tutorial miniboss should be balanced (~220 HP), not 1400 HP
    expect(frogMiniBoss.hp).toBeLessThan(500);
    expect(frogMiniBoss.hp).toBeGreaterThanOrEqual(100);
  });
});
