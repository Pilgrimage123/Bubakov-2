import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getLevelTranslation } from '../src/i18n';
import { getCurrentDayPhase } from '../src/constants';
import { GameEngine } from '../src/game/engine';
import { CERVEN_POIS } from '../src/data/cervenArena';
import { ENEMIES } from '../src/data/enemies';

describe('Level 7: Červen v Hrusicích (Stage 7 Core Definition & Progression)', () => {
  it('numbers player-facing game stages from 1 through 8 with Stage 7 mapped to ID 6', () => {
    expect(Object.values(GAME_LEVELS).map((level) => Number(level.name.match(/^\d+/)?.[0])))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(GAME_LEVELS[6].id).toBe(6);
    expect(GAME_LEVELS[6].name.startsWith('7. ')).toBe(true);
  });

  it('defines valid Level 6 structure (Červen v Hrusicích) with summer theme, palette, and 5-minute schedule', () => {
    const lvl6 = GAME_LEVELS[6];
    expect(lvl6).toBeDefined();
    expect(lvl6.id).toBe(6);
    expect(lvl6.name).toBe('7. Červen v Hrusicích – Senoseč a pekelný žár');
    expect(lvl6.shortTitle).toBe('Letní senoseč');
    expect(lvl6.theme).toBe('summer_harvest');
    expect(lvl6.season).toBe('summer');
    expect(lvl6.icon).toBe('🌾');
    expect(lvl6.badge).toBe('7. Úroveň');
    expect(lvl6.skyColor).toBe('#FDEBD0');
    expect(lvl6.groundColor).toBe('#E59866');

    // 5-minute (300 s) daytime schedule with +200% difficulty over Stage 1
    expect(lvl6.miniBoss).toMatchObject({ id: 'kralovsky_vele_rak', time: 85, kills: 90, multiplier: 3.8 });
    expect(lvl6.midBoss).toMatchObject({ id: 'cert_sekac', time: 185, kills: 210, multiplier: 2.2 });
    expect(lvl6.finalBoss).toMatchObject({ id: 'kralovska_polednice', time: 300, kills: 350, multiplier: 1.45 });
    expect(lvl6.keyEnemies.some((e) => e.id === 'cert_sekac')).toBe(true);
    expect(lvl6.keyEnemies.some((e) => e.id === 'kralovska_polednice')).toBe(true);
    expect(lvl6.arena).toMatchObject({ id: 'cervnova_senosec', layout: 'asymmetric_poi' });
  });

  it('populates spawn pools with June harvest creatures, devils, and strictly excludes undead', () => {
    const lvl6 = GAME_LEVELS[6];
    expect(lvl6.spawnPools.noon).toContain('roj_polnich_mysaku');
    expect(lvl6.spawnPools.noon).toContain('rak_ricni');
    expect(lvl6.spawnPools.noon).toContain('boruvkovy_diblik');
    expect(lvl6.spawnPools.noon).toContain('certik');
    expect(lvl6.spawnPools.afternoon).toContain('pekelny_roj_sazovniku');
    expect(lvl6.spawnPools.afternoon).toContain('polednice');
    expect(lvl6.spawnPools.dusk).toContain('cert_sekac');

    const allSpawns = Object.values(lvl6.spawnPools).flat();
    const excludedUndead = [
      'skeleton',
      'kostlivec',
      'kostlivec_kosa',
      'skeleton_scythe',
      'krvavy_kostlivec',
      'umrlec',
      'bila_pani',
      'bezhlavy_rytir',
      'zbrojnos',
      'hrobnik',
      'stodolnik',
    ];
    for (const excluded of excludedUndead) {
      expect(allSpawns).not.toContain(excluded);
    }
  });

  it('gates Stage 7 progression behind Level 5 (Staré hamry a Čertův mlýn / Mlynář)', () => {
    expect(LEVEL_UNLOCKS[6]).toBeDefined();
    expect(LEVEL_UNLOCKS[6].defaultUnlocked).toBe(false);
    expect(LEVEL_UNLOCKS[6].realShortTitle).toBe(GAME_LEVELS[6].shortTitle);
    expect(GAME_LEVELS[6].unlockRequirementText).toContain('Prokletého Mlynáře');
    expect(GAME_LEVELS[5].name).toContain('Staré hamry a Čertův mlýn');

    // Locked when Level 5 is not beaten
    const lockedProg = getLevelProgress(6, {});
    expect(lockedProg.isUnlocked).toBe(false);

    // Unlocked when Level 5 is beaten
    const unlockedProg = getLevelProgress(6, { completedLevels: { 5: true } });
    expect(unlockedProg.isUnlocked).toBe(true);
    expect(unlockedProg.spoiledName).toBe(GAME_LEVELS[6].name);
    expect(unlockedProg.tier).toBe(4);

    // Also unlocked if Mlynar is killed in bestiary
    const unlockedViaBoss = getLevelProgress(6, { bestiaryKills: { mlynar: 1 } });
    expect(unlockedViaBoss.isUnlocked).toBe(true);
  });

  it('defeating Level 6 final boss unlocks Level 7 (Dračí sluj pod Melechovskou skálou)', () => {
    const unlockedLvl7ViaBoss = getLevelProgress(7, { bestiaryKills: { kralovska_polednice: 1 } });
    expect(unlockedLvl7ViaBoss.isUnlocked).toBe(true);

    const unlockedLvl7ViaCompleted = getLevelProgress(7, { completedLevels: { 6: true } });
    expect(unlockedLvl7ViaCompleted.isUnlocked).toBe(true);
  });

  it('stretches day phases across the 5-minute (300 s) daytime June run', () => {
    // Level 6 (Červen): Noon (0–120 s), Afternoon (120–220 s), Dusk (220–300 s), Dawn (300 s+)
    expect(getCurrentDayPhase(0, 6).id).toBe('noon');
    expect(getCurrentDayPhase(60, 6).id).toBe('noon');
    expect(getCurrentDayPhase(119, 6).id).toBe('noon');
    expect(getCurrentDayPhase(120, 6).id).toBe('afternoon');
    expect(getCurrentDayPhase(200, 6).id).toBe('afternoon');
    expect(getCurrentDayPhase(219, 6).id).toBe('afternoon');
    expect(getCurrentDayPhase(220, 6).id).toBe('dusk');
    expect(getCurrentDayPhase(299, 6).id).toBe('dusk');
    expect(getCurrentDayPhase(300, 6).id).toBe('dawn');
  });

  it('provides complete Czech and English localizations via getLevelTranslation', () => {
    const cs = getLevelTranslation(6, 'cs');
    expect(cs.name).toBe('7. Červen v Hrusicích – Senoseč a pekelný žár');
    expect(cs.shortTitle).toBe('Letní senoseč');
    expect(cs.badge).toBe('7. Úroveň');
    expect(cs.finalBoss.name).toContain('Královská Polednice');
    expect(cs.midBoss.name).toContain('Pekelný čert sekáč');
    expect(cs.miniBoss.name).toContain('Královský Vele-rak');

    const en = getLevelTranslation(6, 'en');
    expect(en.name).toContain('June in Hrusice');
    expect(en.shortTitle).toBe('Summer Haymaking');
    expect(en.badge).toBe('Level 7');
    expect(en.finalBoss.name).toContain('Queen Polednice');
    expect(en.midBoss.name).toContain('Devil Reaper');
    expect(en.miniBoss.name).toContain('Royal Crayfish');
  });

  it('executes full E2E run simulation through Level 6, boss phases, and triggers Level 7 unlock', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer', { highestLevelUnlocked: 6, completedLevels: { 5: true } });

    // 1. Initial spawns are June seasonal mobs without any undead
    expect(engine.state.activeLevelId).toBe(6);
    expect(engine.livingEnemies.length).toBeGreaterThan(0);
    const initialIds = engine.livingEnemies.map((e: any) => e.id);
    expect(initialIds).toContain('rak_ricni');
    expect(initialIds).toContain('roj_polnich_mysaku');
    const undeadList = ['skeleton', 'kostlivec', 'umrlec', 'bila_pani', 'bezhlavy_rytir', 'zbrojnos'];
    for (const u of undeadList) {
      expect(initialIds).not.toContain(u);
    }

    // 2. Timeline progression through Miniboss (85 s), Midboss (185 s), and Final Boss (300 s)
    const miniBoss = engine.spawnMonster(GAME_LEVELS[6].miniBoss.id, 200, 200, GAME_LEVELS[6].miniBoss.multiplier, true, true);
    expect(miniBoss.id).toBe('kralovsky_vele_rak');
    expect(miniBoss.isMiniboss).toBe(true);

    const midBoss = engine.spawnMonster(GAME_LEVELS[6].midBoss.id, -200, -200, GAME_LEVELS[6].midBoss.multiplier, true, true);
    expect(midBoss.id).toBe('cert_sekac');
    expect(midBoss.isMiniboss).toBe(true);

    const finalBoss = engine.spawnMonster(GAME_LEVELS[6].finalBoss.id, 0, 300, GAME_LEVELS[6].finalBoss.multiplier, true, false);
    expect(finalBoss.id).toBe('kralovska_polednice');
    expect(finalBoss.isBoss).toBe(true);

    // Defeating final boss triggers victory sequence and unlocks Level 7
    finalBoss.hp = 0;
    finalBoss.takeDamage(1000, 'holy');

    expect(engine.state.levelVictoryTriggered).toBe(true);
    expect(engine.state.meta.completedLevels[6]).toBe(true);
    expect(engine.state.meta.highestLevelUnlocked).toBeGreaterThanOrEqual(7);
  });

  it('executes all interactive summer POIs ([E] St. Anthony magnet blessing, church storm bell, blueberry grove, tavern buttermilk, field cover)', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer');

    const player = engine.state.player;
    expect(player).toBeDefined();

    // A. Tactical haystacks / fields cover
    player.x = CERVEN_POIS.fields.x;
    player.y = CERVEN_POIS.fields.y;
    engine.update(0.1);
    expect(player.damageReduction).toBeGreaterThanOrEqual(0.15);

    // B. St. Anthony Tree Shrine: [E] Vacuum-pulls all loose drops & grants holy shield
    player.x = CERVEN_POIS.shrine.x;
    player.y = CERVEN_POIS.shrine.y;
    // Spawn loose drops at distance
    engine.spawnDrop('coin', player.x + 800, player.y + 800);
    engine.spawnDrop('coin', player.x - 700, player.y - 700);

    // Press [E]
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(player.tempShield).toBeGreaterThanOrEqual(80);
    expect(player.invulnerabilityTimer).toBeGreaterThanOrEqual(2.0);

    // C. Hrusice Church Mrakozvon: [E] panics nearby enemies within 400px
    const nearbyDemon = engine.spawnMonster('certik', CERVEN_POIS.church.x + 100, CERVEN_POIS.church.y + 100, 1.0);
    player.x = CERVEN_POIS.church.x;
    player.y = CERVEN_POIS.church.y;
    player._cervenChurchCooldown = 0;
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(nearbyDemon.panicked).toBe(true);
    expect(nearbyDemon.panicTimer).toBeGreaterThan(0);

    // D. Blueberry grove: [E] heals and grants speed boost
    player.x = CERVEN_POIS.forest.x;
    player.y = CERVEN_POIS.forest.y;
    player.hp = 50;
    player._cervenForestCooldown = 0;
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(player.hp).toBeGreaterThan(50);
    expect(player.speedMultiplier).toBeGreaterThanOrEqual(1.20);

    // E. Village Tavern: [E] restores health and grants courage damage boost
    player.x = CERVEN_POIS.tavern.x;
    player.y = CERVEN_POIS.tavern.y;
    player.hp = 50;
    player._cervenTavernCooldown = 0;
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(player.hp).toBeGreaterThan(50);
    expect(player.damageMultiplier).toBeGreaterThanOrEqual(1.25);
  });

  it('verifies +200% difficulty calibration compared to Stage 1 (enemy density, base stats, and boss scaling)', () => {
    const lvl0 = GAME_LEVELS[0];
    const lvl6 = GAME_LEVELS[6];

    // Stage 1 vs Stage 7 Boss Effective Health:
    // Stage 1 MiniBoss (blatouch: 60 * 3.5 = 210) vs Stage 7 MiniBoss (kralovsky_vele_rak: 3800 * 3.8 = 14440) -> >3x (+200%)
    const s1MiniHp = ENEMIES[lvl0.miniBoss.id].hp * lvl0.miniBoss.multiplier;
    const s7MiniHp = ENEMIES[lvl6.miniBoss.id].hp * lvl6.miniBoss.multiplier;
    expect(s7MiniHp).toBeGreaterThanOrEqual(s1MiniHp * 3.0);

    // Stage 1 MidBoss (vodnicek: 800 * 1.6 = 1280) vs Stage 7 MidBoss (cert_sekac: 3200 * 2.2 = 7040) -> >3x (+200%)
    const s1MidHp = ENEMIES[lvl0.midBoss.id].hp * lvl0.midBoss.multiplier;
    const s7MidHp = ENEMIES[lvl6.midBoss.id].hp * lvl6.midBoss.multiplier;
    expect(s7MidHp).toBeGreaterThanOrEqual(s1MidHp * 3.0);

    // Stage 1 FinalBoss (vodnik: 2500 * 1.0 = 2500) vs Stage 7 FinalBoss (kralovska_polednice: 7500 * 1.45 = 10875) -> >3x (+200%)
    const s1FinalHp = ENEMIES[lvl0.finalBoss.id].hp * lvl0.finalBoss.multiplier;
    const s7FinalHp = ENEMIES[lvl6.finalBoss.id].hp * lvl6.finalBoss.multiplier;
    expect(s7FinalHp).toBeGreaterThanOrEqual(s1FinalHp * 3.0);

    // Kill thresholds scale up: 45 / 120 / 220 -> 90 / 210 / 350
    expect(lvl6.miniBoss.kills).toBeGreaterThanOrEqual(lvl0.miniBoss.kills * 1.8);
    expect(lvl6.finalBoss.kills).toBeGreaterThanOrEqual(lvl0.finalBoss.kills * 1.5);

    // Both swarm types feature high count and relentless rush
    expect(ENEMIES.roj_polnich_mysaku.speed).toBeGreaterThanOrEqual(140);
    expect(ENEMIES.pekelny_roj_sazovniku.speed).toBeGreaterThanOrEqual(135);
  });
});
