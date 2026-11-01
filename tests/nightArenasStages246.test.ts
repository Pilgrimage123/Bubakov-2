import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { getCurrentDayPhase } from '../src/constants';
import { getMarchPois, MARCH_THAW_POIS, MARCH_NIGHT_POIS } from '../src/data/marchThawArena';
import { getDubenPois, DUBEN_POIS, DUBEN_NIGHT_POIS } from '../src/data/dubnovyDenArena';
import { getKvetenPois, KVETEN_POIS, KVETEN_NIGHT_POIS } from '../src/data/kvetenArena';
import { getCervenPois, CERVEN_POIS, CERVEN_NIGHT_POIS } from '../src/data/cervenArena';
import {
  isEmissiveDevil,
  getEnemyNightEyeColor,
} from '../src/render/storybookLightingRenderer';
import {
  VirtualLeaderCrowWave,
  isCrowWaveNightLevel,
  isCrowWaveSupportedLevel,
} from '../src/game/virtualLeaderCrowWave';

describe('Stages 2, 4, 6, and 8: Night Arenas for Březen, Duben, Květen, and Červen', () => {
  it('shares the exact physical arena definitions between day and night counterparts (Stages 1&2, 3&4, 5&6, 7&8)', () => {
    expect(GAME_LEVELS[0].arena?.id).toBe('breznove_tani');
    expect(GAME_LEVELS[1].arena?.id).toBe('breznove_tani');

    expect(GAME_LEVELS[2].arena?.id).toBe('dubnova_naves');
    expect(GAME_LEVELS[3].arena?.id).toBe('dubnova_naves');

    expect(GAME_LEVELS[4].arena?.id).toBe('kvetnova_naves');
    expect(GAME_LEVELS[5].arena?.id).toBe('kvetnova_naves');

    expect(GAME_LEVELS[6].arena?.id).toBe('cervnova_senosec');
    expect(GAME_LEVELS[7].arena?.id).toBe('cervnova_senosec');
  });

  it('runs Stages 2, 4, 6, and 8 (levelId 1, 3, 5, 7) on the dusk -> night -> midnight -> dawn night schedule', () => {
    for (const nightLevelId of [1, 3, 5, 7]) {
      expect(getCurrentDayPhase(0, nightLevelId).id).toBe('dusk');
      expect(getCurrentDayPhase(50, nightLevelId).id).toBe('dusk');
      expect(getCurrentDayPhase(120, nightLevelId).id).toBe('night');
      expect(getCurrentDayPhase(220, nightLevelId).id).toBe('midnight');
      expect(getCurrentDayPhase(305, nightLevelId).id).toBe('dawn');
    }
  });

  it('assigns Morana to Stage 2, Filipojakubský sabat to Stage 4, Půlnoční Hejkal to Stage 6, and Svatojánský Vládce Hvozdu to Stage 8', () => {
    // Stage 2 (Březen – Noční mrazy)
    expect(GAME_LEVELS[1].miniBoss.id).toBe('tajici_snehulak');
    expect(GAME_LEVELS[1].midBoss.id).toBe('mrazivy_obr');
    expect(GAME_LEVELS[1].finalBoss.id).toBe('morana');

    // Stage 4 (Duben – Dubnová noc / Filipojakubská noc)
    expect(GAME_LEVELS[3].miniBoss.id).toBe('klekanice');
    expect(GAME_LEVELS[3].midBoss.id).toBe('drab');
    expect(GAME_LEVELS[3].finalBoss.id).toBe('vrchni_carodejnice');

    // Stage 6 (Květen – Májová noc v Hrusicích)
    expect(GAME_LEVELS[5].miniBoss.id).toBe('zbojnik');
    expect(GAME_LEVELS[5].midBoss.id).toBe('mlynar');
    expect(GAME_LEVELS[5].finalBoss.id).toBe('hejkal');

    // Stage 8 (Červen – Červnová noc / Svatojánská noc)
    expect(GAME_LEVELS[7].miniBoss.id).toBe('rusalka');
    expect(GAME_LEVELS[7].midBoss.id).toBe('ohnivy_sudlicka');
    expect(GAME_LEVELS[7].finalBoss.id).toBe('svatojansky_vladce');
  });

  it('populates Stages 2, 4, 6, and 8 with folklore night creatures', () => {
    const lvl1All = Object.values(GAME_LEVELS[1].spawnPools).flat();
    expect(lvl1All).toContain('kostlivec');
    expect(lvl1All).toContain('bludicka');
    expect(lvl1All).toContain('umrlec');
    expect(lvl1All).toContain('bubak');
    expect(lvl1All).toContain('hejkal');

    const lvl3All = Object.values(GAME_LEVELS[3].spawnPools).flat();
    expect(lvl3All).toContain('carodejnice_koste');
    expect(lvl3All).toContain('certik');
    expect(lvl3All).toContain('skeleton_scythe');
    expect(lvl3All).toContain('sazovy_rarach');

    const lvl5All = Object.values(GAME_LEVELS[5].spawnPools).flat();
    expect(lvl5All).toContain('hejkal');
    expect(lvl5All).toContain('bludicka');
    expect(lvl5All).toContain('certik');
    expect(lvl5All).toContain('cerny_pes');
    expect(lvl5All).toContain('nocni_mura');

    const lvl7All = Object.values(GAME_LEVELS[7].spawnPools).flat();
    expect(lvl7All).toContain('bludicka');
    expect(lvl7All).toContain('ohnivy_sudlicka');
    expect(lvl7All).toContain('rusalka');
    expect(lvl7All).toContain('hejkal');
    expect(lvl7All).toContain('nocni_mura');
  });

  it('provides distinct night POI metadata where villagers have gone indoors into cottages', () => {
    expect(getMarchPois(false)).toBe(MARCH_THAW_POIS);
    expect(getMarchPois(true)).toBe(MARCH_NIGHT_POIS);
    expect(MARCH_NIGHT_POIS.village.title).toContain('Spící chalupy s teplými okny');

    expect(getDubenPois(false)).toBe(DUBEN_POIS);
    expect(getDubenPois(true)).toBe(DUBEN_NIGHT_POIS);
    expect(DUBEN_NIGHT_POIS.village.title).toContain('Filipojakubská vatra');

    expect(getKvetenPois(false)).toBe(KVETEN_POIS);
    expect(getKvetenPois(true)).toBe(KVETEN_NIGHT_POIS);
    expect(KVETEN_NIGHT_POIS.fields.title).toContain('Opuštěné pastviny pod hvězdami');
    expect(KVETEN_NIGHT_POIS.shrine.title).toContain('svatojánskými muškami');

    expect(getCervenPois(false)).toBe(CERVEN_POIS);
    expect(getCervenPois(true)).toBe(CERVEN_NIGHT_POIS);
    expect(CERVEN_NIGHT_POIS.village.title).toContain('Svatojánská náves s ohníčkem');
    expect(CERVEN_NIGHT_POIS.forest.title).toContain('Svatojánský hvozd a Poklad v zemi');
  });

  it('identifies devils for full-body night self-illumination and assigns category-colored glowing eyes to enemies', () => {
    expect(isEmissiveDevil({ id: 'cert', category: 'devils' })).toBe(true);
    expect(isEmissiveDevil('pekelnicek')).toBe(true);
    expect(isEmissiveDevil('ohnivy_sudlicka')).toBe(true);
    expect(isEmissiveDevil({ id: 'kostlivec', category: 'undead_unholy' })).toBe(false);

    expect(getEnemyNightEyeColor({ id: 'kostlivec', category: 'undead_unholy' })).toBe('#34D399');
    expect(getEnemyNightEyeColor({ id: 'lesni_hejkal', category: 'forest_beasts' })).toBe('#FBBF24');
    expect(getEnemyNightEyeColor({ id: 'cerny_pes', category: 'humanoids' })).toBe('#EF4444');
    expect(getEnemyNightEyeColor({ id: 'vodnicek', category: 'water_creatures' })).toBe('#A3E635');
    expect(getEnemyNightEyeColor({ id: 'rusalka', category: 'water_creatures' })).toBe('#A3E635');
    expect(getEnemyNightEyeColor({ id: 'carodejnice_zaspalka', category: 'witches_crones' })).toBe('#C084FC');
  });

  it('supports VirtualLeaderCrowWave night formations on Stages 2, 4, 6, and 8', () => {
    expect(isCrowWaveSupportedLevel(0)).toBe(true);
    expect(isCrowWaveSupportedLevel(1)).toBe(true);
    expect(isCrowWaveSupportedLevel(3)).toBe(true);
    expect(isCrowWaveSupportedLevel(5)).toBe(true);
    expect(isCrowWaveSupportedLevel(7)).toBe(true);
    expect(isCrowWaveNightLevel(0)).toBe(false);
    expect(isCrowWaveNightLevel(1)).toBe(true);
    expect(isCrowWaveNightLevel(3)).toBe(true);
    expect(isCrowWaveNightLevel(5)).toBe(true);
    expect(isCrowWaveNightLevel(7)).toBe(true);

    const wave = new VirtualLeaderCrowWave();
    const createdIds: string[] = [];
    wave.preparePool((id, x, y, mult) => {
      createdIds.push(id);
      return { id, x, y, mult, radius: 18, hp: 50, maxHp: 50, dead: false, isDefeated: false };
    }, 3);

    expect(createdIds.some((id) => id === 'bludicka' || id === 'jiskrivec')).toBe(true);
    expect(createdIds.some((id) => id === 'cerny_pes' || id === 'kostlivec')).toBe(true);

    const engine: any = {
      activeLevelId: 3,
      gameTime: 45,
      uiTime: 45,
      enemies: [],
    };
    const player = { x: 0, y: 0, vx: 0, vy: 0, radius: 20 };
    const spawned = wave.update(0.016, engine, player, 1280, 720);
    expect(spawned).toBe(true);
    expect(['wisp_swarm', 'night_pack']).toContain(wave.currentFormation);
    expect(engine.enemies.length).toBeGreaterThan(0);
    const announcement = wave.getWaveAnnouncement();
    expect(announcement.text.length).toBeGreaterThan(5);
  });

  it('includes Ohnivý muž (ohnivy_muz) and the new Ohnivá kobyla (ohniva_kobyla) in Stages 2, 4, 6, and 8 night pools', () => {
    for (const nightStageId of [1, 3, 5, 7] as const) {
      const pools = GAME_LEVELS[nightStageId].spawnPools;
      const allStageSpawns = Object.values(pools).flat();
      expect(allStageSpawns).toContain('ohnivy_muz');
      expect(allStageSpawns).toContain('ohniva_kobyla');
    }
    expect(isEmissiveDevil('ohnivy_muz')).toBe(true);
    expect(isEmissiveDevil('ohniva_kobyla')).toBe(true);
  });

  it('executes Ohnivá kobyla fast charge attack leaving burning sulfur flames that hurt both hunter and other bubáky', async () => {
    const { GameEngine } = await import('../src/game/engine');
    const engine = new GameEngine();
    engine.initRun({
      levelId: 3,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
    engine.state.player.x = 0;
    engine.state.player.y = 0;
    engine.state.player.hp = 1000;
    engine.state.player.maxHp = 1000;
    engine.state.player.weapons = [];

    const kobyla = engine.spawnMonster('ohniva_kobyla', 220, 0) as any;
    expect(kobyla).toBeDefined();
    expect(kobyla.id).toBe('ohniva_kobyla');
    expect(kobyla.hp).toBeGreaterThanOrEqual(640);

    // Trigger charge readiness immediately
    kobyla.specialCd = 0;
    engine.update(0.05);
    expect(kobyla.aiState).toBe('windup');

    // Step past 0.45s windup so she launches her blistering charge
    for (let i = 0; i < 6; i++) {
      engine.update(0.1);
    }
    expect(kobyla.aiState).toBe('charge');
    expect(Math.hypot(kobyla.vx, kobyla.vy)).toBeGreaterThanOrEqual(400);

    // Step while charging so she drops sulfur-flame hazards along her path
    for (let i = 0; i < 4; i++) {
      engine.update(0.08);
    }
    const sulfurHazards = engine.director.hazards.filter((h) => h.kind === 'sulfur-flame');
    expect(sulfurHazards.length).toBeGreaterThan(0);
    const flame = sulfurHazards[0];
    expect(flame.damagesEnemies).toBe(true);

    // Place another bubák (kostlivec) and the hunter inside the sulfur flame and verify BOTH take fire damage!
    const victimBubak = engine.spawnMonster('kostlivec', flame.x, flame.y) as any;
    const initialBubakHp = victimBubak.hp;
    engine.state.player.x = flame.x;
    engine.state.player.y = flame.y;
    const initialPlayerHp = engine.state.player.hp;

    flame.damageTimer = 0;
    flame.enemyDamageTimer = 0;
    engine.update(0.1);

    expect(engine.state.player.hp).toBeLessThan(initialPlayerHp);
    expect(victimBubak.hp).toBeLessThan(initialBubakHp);
  });
  it('has valid dawn and midnight spawn pools for all 4 night levels (Stages 2, 4, 6, 8)', () => {
    for (const lvlId of [1, 3, 5, 7] as const) {
      const lvl = GAME_LEVELS[lvlId];
      expect(lvl.spawnPools.midnight).toBeDefined();
      expect(lvl.spawnPools.midnight!.length).toBeGreaterThan(0);
      expect(lvl.spawnPools.dawn).toBeDefined();
      expect(lvl.spawnPools.dawn!.length).toBeGreaterThan(0);
    }
  });

  it('RunDirector getWeightedPool uses nocturnal pools during dawn for night levels and never falls back to noon', async () => {
    const { RunDirector } = await import('../src/game/director');
    for (const lvlId of [1, 3, 5, 7] as const) {
      const director = new RunDirector(lvlId);
      const mockEngine: any = {
        state: {
          gameTime: 310, // Dawn phase (300s+)
          activeLevelId: lvlId,
        },
      };
      const pool = (director as any).getWeightedPool(mockEngine);
      expect(pool).toBeDefined();
      expect(pool.length).toBeGreaterThan(0);
      // Dawn pool should contain all regular enemies from the level's dawn pool (excluding final boss)
      const expectedDawnPool = GAME_LEVELS[lvlId].spawnPools.dawn;
      expect(expectedDawnPool).toBeDefined();
      for (const expectedEnemy of expectedDawnPool!) {
        if (expectedEnemy !== GAME_LEVELS[lvlId].finalBoss.id) {
          expect(pool).toContain(expectedEnemy);
        }
      }
    }
  });

  it('RunDirector getThematicPrefix maps winter to Stage 2 (Level 1) and crimson to Stages 4 & 8 (Levels 3 & 7)', async () => {
    const { RunDirector } = await import('../src/game/director');
    const validPrefixes = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    const dirLvl1 = new RunDirector(1);
    expect(validPrefixes).toContain((dirLvl1 as any).getThematicPrefix());

    const dirLvl3 = new RunDirector(3);
    expect(validPrefixes).toContain((dirLvl3 as any).getThematicPrefix());

    const dirLvl7 = new RunDirector(7);
    expect(validPrefixes).toContain((dirLvl7 as any).getThematicPrefix());
  });

  it('evaluates level unlock progress with canonical bosses for all stages including night levels', async () => {
    const { computeLevelProgress, isLevelFullyUnlocked } = await import('../src/data/levelUnlocks');
    // Level 3 (Dubnová noc) requires defeating Vrchní čarodějnice (from Level 2 Dubnový den)
    const progLvl3 = computeLevelProgress(3, {
      highestLevelUnlocked: 4,
      bestiaryKills: { vrchni_carodejnice: 1 },
    });
    expect(progLvl3.isUnlocked).toBe(true);

    // Level 4 (Májová slavnost) requires defeating Vrchní čarodějnice (from Level 3 Dubnová noc)
    const progLvl4 = computeLevelProgress(4, {
      highestLevelUnlocked: 5,
      bestiaryKills: { vrchni_carodejnice: 1 },
    });
    expect(progLvl4.isUnlocked).toBe(true);

    // Level 6 (Červen Senoseč) requires defeating Hejkal (from Level 5 Májová noc)
    const progLvl6 = computeLevelProgress(6, {
      highestLevelUnlocked: 7,
      bestiaryKills: { hejkal: 1 },
    });
    expect(progLvl6.isUnlocked).toBe(true);

    // isLevelFullyUnlocked checks
    expect(isLevelFullyUnlocked(3, { bestiaryKills: { vrchni_carodejnice: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(4, { bestiaryKills: { vrchni_carodejnice: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(6, { bestiaryKills: { hejkal: 1 } })).toBe(true);
  });

  it('cleans up boss hazards when boss is defeated', async () => {
    const { GameEngine } = await import('../src/game/engine');
    const engine = new GameEngine();
    engine.initRun({
      levelId: 7,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
    engine.director.hazards = [
      { id: 'h1', sourceEnemyId: 'svatojansky_vladce', type: 'bramble', x: 0, y: 0, radius: 40, dead: false } as any,
      { id: 'h2', sourceEnemyId: 'other_mob', type: 'mud', x: 10, y: 10, radius: 20, dead: false } as any,
    ];

    const vladce = engine.spawnMonster('svatojansky_vladce', 0, 0) as any;
    expect(vladce).toBeDefined();
    vladce.isBoss = true;

    // Deal lethal damage to boss
    vladce.takeDamage(999999, 'physical');

    // Boss hazards should be cleared, non-boss hazards remain
    const remainingBossHazards = engine.director.hazards.filter((h: any) => h.sourceEnemyId === 'svatojansky_vladce');
    expect(remainingBossHazards.length).toBe(0);
    const otherHazards = engine.director.hazards.filter((h: any) => h.sourceEnemyId === 'other_mob');
    expect(otherHazards.length).toBe(1);
  });
});

