import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getLevelTranslation } from '../src/i18n';
import { getCurrentDayPhase } from '../src/constants';

describe('Level 5: Květen v Hrusicích (Stage 5 Core Definition & Progression)', () => {
  it('numbers player-facing game stages from 1 through 8 with Stage 5 mapped to ID 4', () => {
    expect(Object.values(GAME_LEVELS).map((level) => Number(level.name.match(/^\d+/)?.[0])))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(GAME_LEVELS[4].id).toBe(4);
    expect(GAME_LEVELS[4].name.startsWith('5. ')).toBe(true);
  });

  it('defines valid Level 4 structure (Květen v Hrusicích) with spring theme, palette, and 5-minute schedule', () => {
    const lvl4 = GAME_LEVELS[4];
    expect(lvl4).toBeDefined();
    expect(lvl4.id).toBe(4);
    expect(lvl4.name).toBe('5. Květen v Hrusicích – Májová slavnost');
    expect(lvl4.shortTitle).toBe('Májová slavnost');
    expect(lvl4.theme).toBe('spring_village');
    expect(lvl4.season).toBe('spring');
    expect(lvl4.icon).toBe('🌸');
    expect(lvl4.badge).toBe('5. Úroveň');
    expect(lvl4.skyColor).toBe('#CBE8FA');
    expect(lvl4.groundColor).toBe('#A3D48B');

    // 5-minute (300 s) daytime schedule
    expect(lvl4.miniBoss).toMatchObject({ id: 'carodejnice_zaspalka', time: 85, kills: 50, multiplier: 0.92 });
    expect(lvl4.midBoss).toMatchObject({ id: 'hastrman', time: 185, kills: 130, multiplier: 6.10 });
    expect(lvl4.finalBoss).toMatchObject({ id: 'ledovi_muzi', time: 300, kills: 250, multiplier: 0.84 });
    expect(lvl4.keyEnemies.some((e) => e.id === 'hastrman')).toBe(true);
    expect(lvl4.bossMechanic.cadenceSeconds).toBe(6);
    expect(lvl4.arena).toMatchObject({ id: 'kvetnova_naves', layout: 'asymmetric_poi' });
  });

  it('populates daylight spawn pools with May-appropriate creatures and excludes winter/graveyard mobs', () => {
    const lvl4 = GAME_LEVELS[4];
    expect(lvl4.spawnPools.noon).toContain('chroust');
    expect(lvl4.spawnPools.noon).toContain('pampeliska_chmyri');
    expect(lvl4.spawnPools.noon).toContain('zaba');
    expect(lvl4.spawnPools.noon).toContain('vodnicek');
    expect(lvl4.spawnPools.afternoon).toContain('hastrman');

    const allSpawns = Object.values(lvl4.spawnPools).flat();
    const excludedWinterGraveyard = [
      'tajici_snehulak',
      'mrazivy_obr',
      'morana',
      'mrazik',
      'zmrzlik',
      'cert',
      'hejkal',
      'kostlivec',
      'skeleton',
      'nocni_mura',
    ];
    for (const excluded of excludedWinterGraveyard) {
      expect(allSpawns).not.toContain(excluded);
    }
  });

  it('gates Stage 5 progression behind Level 3 (Dubnová noc / Hejkal)', () => {
    expect(LEVEL_UNLOCKS[4]).toBeDefined();
    expect(LEVEL_UNLOCKS[4].defaultUnlocked).toBe(false);
    expect(LEVEL_UNLOCKS[4].realShortTitle).toBe(GAME_LEVELS[4].shortTitle);
    expect(GAME_LEVELS[4].unlockRequirementText).toContain('Dubnové noci');
    expect(GAME_LEVELS[3].name).toBe('4. Duben v Hrusicích – Dubnová noc');

    // Locked when Level 3 is not beaten
    const lockedProg = getLevelProgress(4, {});
    expect(lockedProg.isUnlocked).toBe(false);

    // Unlocked when Level 3 is beaten
    const unlockedProg = getLevelProgress(4, { completedLevels: { 3: true } });
    expect(unlockedProg.isUnlocked).toBe(true);
    expect(unlockedProg.spoiledName).toBe(GAME_LEVELS[4].name);
    expect(unlockedProg.tier).toBe(4);

    // Also unlocked if Hejkal is killed in bestiary
    const unlockedViaBoss = getLevelProgress(4, { bestiaryKills: { hejkal: 1 } });
    expect(unlockedViaBoss.isUnlocked).toBe(true);
  });

  it('defeating Level 4 final boss unlocks Level 5 (Staré hamry a Čertův mlýn)', () => {
    const unlockedLvl5ViaBoss = getLevelProgress(5, { bestiaryKills: { ledovi_muzi: 1 } });
    expect(unlockedLvl5ViaBoss.isUnlocked).toBe(true);

    const unlockedLvl5ViaCompleted = getLevelProgress(5, { completedLevels: { 4: true } });
    expect(unlockedLvl5ViaCompleted.isUnlocked).toBe(true);
  });

  it('stretches day phases across the 5-minute (300 s) daytime run', () => {
    // Level 4 (Květen): Noon 0–150 s, Afternoon 150–300 s
    expect(getCurrentDayPhase(0, 4).id).toBe('noon');
    expect(getCurrentDayPhase(75, 4).id).toBe('noon');
    expect(getCurrentDayPhase(149, 4).id).toBe('noon');
    expect(getCurrentDayPhase(150, 4).id).toBe('afternoon');
    expect(getCurrentDayPhase(250, 4).id).toBe('afternoon');
    expect(getCurrentDayPhase(299, 4).id).toBe('afternoon');
  });

  it('provides complete Czech and English localizations via getLevelTranslation', () => {
    const cs = getLevelTranslation(4, 'cs');
    expect(cs.name).toBe('5. Květen v Hrusicích – Májová slavnost');
    expect(cs.shortTitle).toBe('Májová slavnost');
    expect(cs.badge).toBe('5. Úroveň');
    expect(cs.finalBoss.name).toContain('Ledoví Muži');
    expect(cs.miniBoss.name).toContain('Čarodějnice Zaspalka');

    const en = getLevelTranslation(4, 'en');
    expect(en.name).toBe('5. Maytime in Hrusice – Maypole Feast');
    expect(en.shortTitle).toBe('Maypole Feast');
    expect(en.badge).toBe('Level 5');
    expect(en.finalBoss.name).toContain('Ice Saints');
    expect(en.miniBoss.name).toContain('Zaspalka');
  });
});
