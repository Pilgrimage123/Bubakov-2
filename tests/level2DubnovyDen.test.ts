import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { RUN_ROZMARY, selectRunRozmar } from '../src/data/runArchetypes';
import { GameEngine } from '../src/game/engine';
import { getLevelTranslation } from '../src/i18n';
import { getCurrentDayPhase } from '../src/constants';

describe('Level 3: Dubnový den (Stage 3 Core Definition & Pacing)', () => {
  it('numbers player-facing game stages from 1 through 8 with Stage 3 mapped to ID 2', () => {
    expect(Object.values(GAME_LEVELS).map((level) => Number(level.name.match(/^\d+/)?.[0])))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(GAME_LEVELS[2].id).toBe(2);
    expect(GAME_LEVELS[2].name.startsWith('3. ')).toBe(true);
  });

  it('defines valid Level 2 structure (Dubnový den) with spring theme, palette, and 5-minute pacing', () => {
    const lvl2 = GAME_LEVELS[2];
    expect(lvl2).toBeDefined();
    expect(lvl2.id).toBe(2);
    expect(lvl2.name).toBe('3. Duben v Hrusicích – Dubnový den');
    expect(lvl2.shortTitle).toBe('Dubnový den');
    expect(lvl2.theme).toBe('spring_village');
    expect(lvl2.season).toBe('spring');
    expect(lvl2.icon).toBe('🌸');
    expect(lvl2.badge).toBe('3. Úroveň');
    expect(lvl2.skyColor).toBe('#BEE3F8');
    expect(lvl2.groundColor).toBe('#A8D08D');

    // 5-minute (300 s) daytime schedule
    expect(lvl2.miniBoss).toMatchObject({ id: 'beranek', time: 85, kills: 50, multiplier: 3.2 });
    expect(lvl2.midBoss).toMatchObject({ id: 'carodejnice_stara', time: 185, kills: 130, multiplier: 1.6 });
    expect(lvl2.finalBoss).toMatchObject({ id: 'vrchni_carodejnice', time: 300, kills: 240, multiplier: 1.1 });
    expect(lvl2.bossMechanic.cadenceSeconds).toBe(6);
    expect(lvl2.arena).toMatchObject({ id: 'dubnova_naves', layout: 'asymmetric_poi' });
  });

  it('populates initial daylight spawn pools with spring-appropriate creatures and excludes winter/autumn mobs', () => {
    const lvl2 = GAME_LEVELS[2];
    expect(lvl2.spawnPools.noon).toContain('blatouch');
    expect(lvl2.spawnPools.noon).toContain('zaba');
    expect(lvl2.spawnPools.afternoon).toContain('ropucha');
    expect(lvl2.spawnPools.afternoon).toContain('jiskrivec');

    const allSpawns = Object.values(lvl2.spawnPools).flat();
    const excludedWinterAutumn = [
      'tajici_snehulak',
      'mrazivy_obr',
      'morana',
      'mrazik',
      'zmrzlik',
      'cert',
      'hejkal',
      'kostlivec',
      'skeleton',
    ];
    for (const excluded of excludedWinterAutumn) {
      expect(allSpawns).not.toContain(excluded);
    }
  });

  it('gates Stage 3 progression behind Level 1 (Noční mrazy / Morana)', () => {
    expect(LEVEL_UNLOCKS[2]).toBeDefined();
    expect(LEVEL_UNLOCKS[2].defaultUnlocked).toBe(false);
    expect(LEVEL_UNLOCKS[2].realShortTitle).toBe(GAME_LEVELS[2].shortTitle);

    // Locked when level 1 is not beaten
    const lockedProg = getLevelProgress(2, {});
    expect(lockedProg.isUnlocked).toBe(false);

    // Unlocked when level 1 (Noční mrazy) is beaten
    const unlockedProg = getLevelProgress(2, { completedLevels: { 1: true } });
    expect(unlockedProg.isUnlocked).toBe(true);
    expect(unlockedProg.spoiledName).toBe(GAME_LEVELS[2].name);
    expect(unlockedProg.tier).toBe(4);

    // Also unlocked if Morana is killed in bestiary
    const unlockedViaBoss = getLevelProgress(2, { bestiaryKills: { morana: 1 } });
    expect(unlockedViaBoss.isUnlocked).toBe(true);
  });

  it('stretches day phases across the 5-minute (300 s) daytime run', () => {
    // Level 2 (Dubnový den): Noon 0–150 s, Afternoon 150–300 s
    expect(getCurrentDayPhase(0, 2).id).toBe('noon');
    expect(getCurrentDayPhase(75, 2).id).toBe('noon');
    expect(getCurrentDayPhase(149, 2).id).toBe('noon');
    expect(getCurrentDayPhase(150, 2).id).toBe('afternoon');
    expect(getCurrentDayPhase(250, 2).id).toBe('afternoon');
    expect(getCurrentDayPhase(299, 2).id).toBe('afternoon');
  });

  it('provides complete Czech and English localizations via getLevelTranslation', () => {
    const cs = getLevelTranslation(2, 'cs');
    expect(cs.name).toBe('3. Duben v Hrusicích – Dubnový den');
    expect(cs.shortTitle).toBe('Dubnový den');
    expect(cs.finalBoss.name).toContain('Čarodějnice');
    expect(cs.miniBoss.name).toContain('beránek');
    expect(cs.unlockRequirementText).toContain('Morany');

    const en = getLevelTranslation(2, 'en');
    expect(en.name).toBe('3. April in Hrusice – April Day');
    expect(en.shortTitle).toBe('April Day');
    expect(en.finalBoss.name).toContain('Witch');
    expect(en.miniBoss.name).toContain('Lamb');
    expect(en.unlockRequirementText).toContain('Morana');
  });

  it('defines exactly 3 April folklore Rozmars for Level 2', () => {
    const rozmary = RUN_ROZMARY[2];
    expect(rozmary).toBeDefined();
    expect(rozmary.length).toBe(3);

    const ids = rozmary.map((r) => r.id);
    expect(ids).toContain('aprilove_vrtochy');
    expect(ids).toContain('velikonocni_koleda');
    expect(ids).toContain('filipojakubsky_rej');

    const picked = selectRunRozmar(2, 42);
    expect(picked).toBeDefined();
    expect(picked.levelId).toBe(2);
    expect(picked.anomalyWindow[0]).toBeGreaterThanOrEqual(100);
  });

  it('initializes game engine run for level 2 without throwing', () => {
    const engine = new GameEngine();
    const state = engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: true,
    });

    expect(state.activeLevelId).toBe(2);
    expect(state.spawnTimer).toBeGreaterThanOrEqual(2.0);
    expect(state.enemies.length).toBeGreaterThan(0);
  });
});
