import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS, getCurrentDayPhase } from '../src/constants';
import { ENEMY_ARCHETYPE_MAP } from '../src/components/gpu-animation/enemyCatalog';
import { isRegularSpawnAllowedForLevel, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import {
  ZARI_POIS,
  ZARI_NIGHT_POIS,
  getZariPois,
  getZariPoisList,
  isInsideZariPoi,
  ZARI_DECOR,
  getZariWaterEffect,
  resolveZariObstacles,
  createInitialKotelNaPovidlaState,
  createInitialSvatovaclavskyOhenState,
} from '../src/data/zariArena';
import { drawZariDecoration } from '../src/render/zariSvgLandscape';
import { Lada } from '../src/render/ladaRenderer';
import { LEVEL_UNLOCKS, isLevelFullyUnlocked } from '../src/data/levelUnlocks';
import { TROPHIES } from '../src/data/trophies';
import { isCrowWaveNightLevel } from '../src/game/virtualLeaderCrowWave';
import { GameEngine } from '../src/game/engine';

function createMockCtx() {
  let saveDepth = 0;
  return {
    save: () => {
      saveDepth++;
    },
    restore: () => {
      saveDepth--;
    },
    getSaveDepth: () => saveDepth,
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    rect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    roundRect: () => {},
    arc: () => {},
    ellipse: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    fillText: () => {},
    strokeText: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    setLineDash: () => {},
    strokeDasharray: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D & { getSaveDepth: () => number };
}

describe('Stages 13 & 14: Září v Hrusicích (Posvícení & Svatováclavská noc)', () => {
  it('defines Stage 13 (id: 12, Září – Den) and Stage 14 (id: 13, Září – Noc) with autumn themes and bosses', () => {
    const stage13 = GAME_LEVELS[12];
    const stage14 = GAME_LEVELS[13];

    expect(stage13).toBeDefined();
    expect(stage13.id).toBe(12);
    expect(stage13.season).toBe('autumn');
    expect(stage13.theme).toBe('september_feast');
    expect(stage13.weatherEffect).toBe('falling_leaves');
    expect(stage13.isNightLevel).toBeFalsy();
    expect(stage13.miniBoss.id).toBe('kralovsky_srsen');
    expect(stage13.midBoss.id).toBe('povidlovy_cert');
    expect(stage13.finalBoss.id).toBe('posvicensky_hospodar');

    expect(stage14).toBeDefined();
    expect(stage14.id).toBe(13);
    expect(stage14.season).toBe('autumn');
    expect(stage14.theme).toBe('wenceslas_night');
    expect(stage14.weatherEffect).toBe('fog');
    expect(stage14.isNightLevel).toBe(true);
    expect(stage14.miniBoss.id).toBe('svatovaclavsky_strazce');
    expect(stage14.midBoss.id).toBe('chmelovy_skritek');
    expect(stage14.finalBoss.id).toBe('kvilici_meluzina');
  });

  it('registers all 7 September enemies/bosses in ENEMIES, ENEMY_POINTS, ENEMY_ARCHETYPE_MAP, and Lada renderer', () => {
    const newIds = [
      'svestkovy_srsen',
      'kralovsky_srsen',
      'povidlovy_cert',
      'posvicensky_hospodar',
      'svatovaclavsky_strazce',
      'chmelovy_skritek',
      'kvilici_meluzina',
    ] as const;

    for (const id of newIds) {
      expect(ENEMIES[id], `${id} in ENEMIES`).toBeDefined();
      expect((ENEMY_POINTS as Record<string, number>)[id], `${id} in ENEMY_POINTS`).toBeGreaterThan(0);
      expect(ENEMY_ARCHETYPE_MAP[id], `${id} in ENEMY_ARCHETYPE_MAP`).toBeDefined();

      const drawFn = (Lada as any)[ENEMIES[id].method];
      expect(typeof drawFn, `Lada.${ENEMIES[id].method}`).toBe('function');

      const ctx = createMockCtx();
      expect(() => drawFn(ctx, 0, 0, 1.5)).not.toThrow();
      expect(ctx.getSaveDepth(), `Canvas stack balance for ${ENEMIES[id].method}`).toBe(0);
    }
  });

  it('enforces day/night spawn rules for Stage 13 (day: no frost/undead) and Stage 14 (night: no frost, allows undead)', () => {
    expect(isRegularSpawnAllowedForLevel('svestkovy_srsen', 12)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 12)).toBe(false);
    expect(isRegularSpawnAllowedForLevel('mrazik', 12)).toBe(false);

    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 13)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('nocni_mura', 13)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('mrazik', 13)).toBe(false);

    expect(STAGE_THREAT_MULTIPLIERS[12]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[11]);
    expect(STAGE_THREAT_MULTIPLIERS[13]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[12]);
    expect(isCrowWaveNightLevel(12)).toBe(false);
    expect(isCrowWaveNightLevel(13)).toBe(true);
  });

  it('provides distinct day and night POIs, interactive Kotel na povidla (12) and Svatováclavský oheň (13) states', () => {
    expect(getZariPois(12)).toBe(ZARI_POIS);
    expect(getZariPois(13)).toBe(ZARI_NIGHT_POIS);
    expect(getZariPoisList(12).length).toBe(9);
    expect(getZariPoisList(13).length).toBe(9);

    expect(isInsideZariPoi(ZARI_POIS.village.x, ZARI_POIS.village.y, 'village', 12)).toBe(true);
    expect(isInsideZariPoi(ZARI_NIGHT_POIS.church.x, ZARI_NIGHT_POIS.church.y, 'church', 13)).toBe(true);

    const kotel = createInitialKotelNaPovidlaState();
    expect(kotel.x).toBe(45);
    expect(kotel.y).toBe(-95);
    expect(kotel.interactRadius).toBe(175);

    const ohen = createInitialSvatovaclavskyOhenState();
    expect(ohen.x).toBe(-800);
    expect(ohen.y).toBe(-650);
    expect(ohen.interactRadius).toBe(180);
  });

  it('renders all 10 ZARI_DECOR landmarks in both daytime and nighttime modes with balanced ctx.save/restore', () => {
    expect(ZARI_DECOR.length).toBe(10);
    for (const item of ZARI_DECOR) {
      const dayCtx = createMockCtx();
      drawZariDecoration(dayCtx, item, 3.2, false);
      expect(dayCtx.getSaveDepth(), `${item.type} day saveDepth`).toBe(0);

      const nightCtx = createMockCtx();
      drawZariDecoration(nightCtx, item, 3.2, true);
      expect(nightCtx.getSaveDepth(), `${item.type} night saveDepth`).toBe(0);
    }
  });

  it('calculates September water effects and obstacle collisions accurately across all 4 landmarks', () => {
    // On bridge -> dry
    const onBridge = getZariWaterEffect(475, 420, 12);
    expect(onBridge.inOpenWater).toBe(false);
    expect(onBridge.speedMult).toBe(1);

    // Inside pond -> open water slow
    const inPond = getZariWaterEffect(-725, 615, 12);
    expect(inPond.inOpenWater).toBe(true);
    expect(inPond.speedMult).toBeLessThan(1);

    // 1. Obstacle pushout around copper cauldron at (45, -95)
    const entityCauldron = { x: 46, y: -95 };
    const hitCauldron = resolveZariObstacles(entityCauldron, 18);
    expect(hitCauldron).toBe(true);

    // 2. Obstacle pushout around barrels of plums in orchard at (-100, 680)
    const entityPlums = { x: -99, y: 681 };
    const hitPlums = resolveZariObstacles(entityPlums, 18);
    expect(hitPlums).toBe(true);

    // 3. Obstacle pushout around St. Wenceslas fire pedestal at (-800, -650)
    const entityFire = { x: -801, y: -649 };
    const hitFire = resolveZariObstacles(entityFire, 18);
    expect(hitFire).toBe(true);

    // 4. Obstacle pushout around forest boulder at (730, -570)
    const entityBoulder = { x: 731, y: -569 };
    const hitBoulder = resolveZariObstacles(entityBoulder, 18);
    expect(hitBoulder).toBe(true);
  });

  it('handles Stage 13 Kotel na povidla [E] interaction in GameEngine update loop with canonical prompt', () => {
    const engine = new GameEngine();
    engine.initRun(12, 'wanderer');
    const player = engine.state.player!;

    // Position player at village POI near cauldron
    player.x = ZARI_POIS.village.x;
    player.y = ZARI_POIS.village.y;
    player.hp = 50;

    // Before key press: active prompt should match canonical infinitive format
    engine.update(0.05);
    expect(engine.zariActivePoiPrompt).toBe('[E] Zamíchat povidla (Kotel)');

    // Press [E]
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(engine.zari.kotel.cooldown).toBeGreaterThan(15);
    expect(engine.zari.kotel.stirActiveTimer).toBeGreaterThan(15);
    expect(engine.zari.kotel.batchesCooked).toBe(1);
    expect(player.hp).toBeGreaterThan(50);

    // Active prompt indicates bubbling cauldron on cooldown
    engine.state.keys = {};
    engine.update(0.05);
    expect(engine.zariActivePoiPrompt).toContain('Povidla v kotli probublávají');
  });

  it('handles Stage 14 Svatováclavský oheň [E] interaction, prompt and mist warning in GameEngine loop', () => {
    const engine = new GameEngine();
    engine.initRun(13, 'wanderer');
    const player = engine.state.player!;

    // Position player at church POI near fire
    player.x = ZARI_NIGHT_POIS.church.x;
    player.y = ZARI_NIGHT_POIS.church.y;

    // Before key press: active prompt should match canonical format
    engine.update(0.05);
    expect(engine.zariActivePoiPrompt).toBe('[E] Zažehnout svatý oheň (Kostel)');

    // Press [E]
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(engine.zari.ohen.cooldown).toBeGreaterThan(15);
    expect(engine.zari.ohen.blessingActiveTimer).toBeGreaterThan(15);
    expect(engine.zari.ohen.firesKindled).toBe(1);
    expect(player.tempShield).toBeGreaterThan(0);

    // Prompt indicates burning sacred fire
    engine.state.keys = {};
    engine.update(0.05);
    expect(engine.zariActivePoiPrompt).toContain('Svatováclavský oheň plápolá');

    // Trigger mist warning by advancing mistGustTimer
    engine.zari.ohen.mistGustTimer = 0.05;
    engine.update(0.1);
    expect(engine.zari.ohen.mistWarning).toBeDefined();
    expect(engine.zari.ohen.mistWarning?.radius).toBeGreaterThan(0);
  });

  it('applies passive zone buffs for fields and school correctly in both day and night stages', () => {
    const engineDay = new GameEngine();
    engineDay.initRun(12, 'wanderer');
    const playerDay = engineDay.state.player!;

    // In school during day: speed bonus
    playerDay.x = ZARI_POIS.school.x;
    playerDay.y = ZARI_POIS.school.y;
    engineDay.update(0.05);
    expect(playerDay.speedMultiplier).toBeGreaterThanOrEqual(1.18);

    // In fields: defense/cover bonus
    playerDay.x = ZARI_POIS.fields.x;
    playerDay.y = ZARI_POIS.fields.y;
    engineDay.update(0.05);
    expect(playerDay.damageReduction).toBeGreaterThanOrEqual(0.18);
    expect(playerDay.arenaArmorBonus).toBeGreaterThanOrEqual(0.18);

    const engineNight = new GameEngine();
    engineNight.initRun(13, 'wanderer');
    const playerNight = engineNight.state.player!;

    // In school during night: cooldown multiplier
    playerNight.x = ZARI_NIGHT_POIS.school.x;
    playerNight.y = ZARI_NIGHT_POIS.school.y;
    engineNight.update(0.05);
    expect(playerNight.cooldownMultiplier).toBeGreaterThanOrEqual(1.20);
  });

  it('initializes GameEngine runs on levels 12 and 13 and supports unlocks and trophies', () => {
    const engine = new GameEngine();
    engine.initRun(12, 'wanderer');
    expect(engine.state.activeLevelId).toBe(12);
    expect(getCurrentDayPhase(0, 12).id).toBe('noon');

    engine.initRun(13, 'wanderer');
    expect(engine.state.activeLevelId).toBe(13);
    expect(getCurrentDayPhase(0, 13).id).toBe('dusk');

    expect(LEVEL_UNLOCKS[12]).toBeDefined();
    expect(LEVEL_UNLOCKS[13]).toBeDefined();
    expect(isLevelFullyUnlocked(12, { bestiaryKills: { vyr_velky: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(13, { bestiaryKills: { posvicensky_hospodar: 1 } })).toBe(true);

    expect(TROPHIES.some((t) => t.id === 'level12_completed')).toBe(true);
    expect(TROPHIES.some((t) => t.id === 'level13_completed')).toBe(true);
  });
});
