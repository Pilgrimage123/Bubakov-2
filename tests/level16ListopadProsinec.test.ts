import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS, getCurrentDayPhase } from '../src/constants';
import { ENEMY_ARCHETYPE_MAP } from '../src/components/gpu-animation/enemyCatalog';
import { isRegularSpawnAllowedForLevel, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import {
  LISTOPAD_POIS,
  LISTOPAD_NIGHT_POIS,
  getListopadPois,
  getListopadPoisList,
  isInsideListopadPoi,
  LISTOPAD_DECOR,
  getListopadWaterEffect,
  resolveListopadObstacles,
  createInitialSvatomartinskaHusaPekacState,
  createInitialUhliarskyMilirState,
} from '../src/data/listopadArena';
import { drawListopadDecoration } from '../src/render/listopadSvgLandscape';
import {
  PROSINEC_POIS,
  PROSINEC_NIGHT_POIS,
  getProsinecPois,
  getProsinecPoisList,
  isInsideProsinecPoi,
  PROSINEC_DECOR,
  getProsinecWaterEffect,
  resolveProsinecObstacles,
  createInitialAdventniVenecState,
  createInitialStedrovecerniZvonState,
} from '../src/data/prosinecArena';
import { drawProsinecDecoration } from '../src/render/prosinecSvgLandscape';
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

describe('Stages 17–20: Listopad & Prosinec v Hrusicích (Svatomartinské posvícení, Lov v mlze, Advent a Štědrý den)', () => {
  it('defines Stages 17 through 20 (ids: 16..19) with authentic themes, seasons, and triad bosses', () => {
    const stage17 = GAME_LEVELS[16];
    const stage18 = GAME_LEVELS[17];
    const stage19 = GAME_LEVELS[18];
    const stage20 = GAME_LEVELS[19];

    expect(stage17).toBeDefined();
    expect(stage17.id).toBe(16);
    expect(stage17.season).toBe('autumn');
    expect(stage17.theme).toBe('st_martin_feast');
    expect(stage17.weatherEffect).toBe('falling_leaves');
    expect(stage17.isNightLevel).toBeFalsy();
    expect(stage17.miniBoss.id).toBe('kralovska_husa');
    expect(stage17.midBoss.id).toBe('martinsky_jezdec');
    expect(stage17.finalBoss.id).toBe('listopadovy_mrazivec');

    expect(stage18).toBeDefined();
    expect(stage18.id).toBe(17);
    expect(stage18.season).toBe('autumn');
    expect(stage18.theme).toBe('november_fog_hunt');
    expect(stage18.weatherEffect).toBe('fog');
    expect(stage18.isNightLevel).toBe(true);
    expect(stage18.miniBoss.id).toBe('mlzny_prizrak');
    expect(stage18.midBoss.id).toBe('cerny_myslivec');
    expect(stage18.finalBoss.id).toBe('kanec_knour');

    expect(stage19).toBeDefined();
    expect(stage19.id).toBe(18);
    expect(stage19.season).toBe('winter');
    expect(stage19.theme).toBe('st_nicholas_procession');
    expect(stage19.weatherEffect).toBe('snow');
    expect(stage19.isNightLevel).toBeFalsy();
    expect(stage19.miniBoss.id).toBe('cert_s_pytlem');
    expect(stage19.midBoss.id).toBe('maskarni_kozel');
    expect(stage19.finalBoss.id).toBe('mikulassky_cert');

    expect(stage20).toBeDefined();
    expect(stage20.id).toBe(19);
    expect(stage20.season).toBe('winter');
    expect(stage20.theme).toBe('christmas_eve_miracle');
    expect(stage20.weatherEffect).toBe('blizzard');
    expect(stage20.isNightLevel).toBe(true);
    expect(stage20.miniBoss.id).toBe('mraziva_sova');
    expect(stage20.midBoss.id).toBe('jezdec_meluziny');
    expect(stage20.finalBoss.id).toBe('kral_mrazik');
  });

  it('registers all 17 new enemies/bosses in ENEMIES, ENEMY_POINTS, ENEMY_ARCHETYPE_MAP, and Lada renderer', () => {
    const newIds = [
      'svatomartinska_husa',
      'divoky_kanec',
      'lesni_pytlak',
      'kralovska_husa',
      'martinsky_jezdec',
      'listopadovy_mrazivec',
      'mlzny_prizrak',
      'cerny_myslivec',
      'kanec_knour',
      'ledovy_rampousik',
      'snehova_jezinka',
      'cert_s_pytlem',
      'maskarni_kozel',
      'mikulassky_cert',
      'mraziva_sova',
      'jezdec_meluziny',
      'kral_mrazik',
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

  it('enforces day/night spawn rules and escalating threat multipliers across levels 16..19', () => {
    // Level 16 (Stage 17 Day)
    expect(isRegularSpawnAllowedForLevel('svatomartinska_husa', 16)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('divoky_kanec', 16)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 16)).toBe(false);

    // Level 17 (Stage 18 Night)
    expect(isRegularSpawnAllowedForLevel('divoky_kanec', 17)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 17)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('nocni_mura', 17)).toBe(true);

    // Level 18 (Stage 19 Day)
    expect(isRegularSpawnAllowedForLevel('ledovy_rampousik', 18)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('snehova_jezinka', 18)).toBe(true);

    // Level 19 (Stage 20 Night)
    expect(isRegularSpawnAllowedForLevel('mrazik', 19)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('ledovy_rampousik', 19)).toBe(true);

    // Threat multipliers
    expect(STAGE_THREAT_MULTIPLIERS[16]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[15]);
    expect(STAGE_THREAT_MULTIPLIERS[17]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[16]);
    expect(STAGE_THREAT_MULTIPLIERS[18]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[17]);
    expect(STAGE_THREAT_MULTIPLIERS[19]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[18]);

    // Crow wave night flag
    expect(isCrowWaveNightLevel(16)).toBe(false);
    expect(isCrowWaveNightLevel(17)).toBe(true);
    expect(isCrowWaveNightLevel(18)).toBe(false);
    expect(isCrowWaveNightLevel(19)).toBe(true);
  });

  it('provides distinct day and night POIs, interactive pekáč, milíř, adventní věnec, and půlnoční zvon', () => {
    // Listopad POIs
    expect(getListopadPois(16)).toBe(LISTOPAD_POIS);
    expect(getListopadPois(17)).toBe(LISTOPAD_NIGHT_POIS);
    expect(getListopadPoisList(16).length).toBe(9);
    expect(getListopadPoisList(17).length).toBe(9);

    expect(isInsideListopadPoi(LISTOPAD_POIS.village.x, LISTOPAD_POIS.village.y, 'village', 16)).toBe(true);
    expect(isInsideListopadPoi(LISTOPAD_NIGHT_POIS.forest.x, LISTOPAD_NIGHT_POIS.forest.y, 'forest', 17)).toBe(true);

    const husaPekac = createInitialSvatomartinskaHusaPekacState();
    expect(husaPekac.x).toBe(440);
    expect(husaPekac.y).toBe(-75);
    expect(husaPekac.radius).toBe(180);

    const milir = createInitialUhliarskyMilirState();
    expect(milir.x).toBe(650);
    expect(milir.y).toBe(725);
    expect(milir.radius).toBe(185);

    // Prosinec POIs
    expect(getProsinecPois(18)).toBe(PROSINEC_POIS);
    expect(getProsinecPois(19)).toBe(PROSINEC_NIGHT_POIS);
    expect(getProsinecPoisList(18).length).toBe(9);
    expect(getProsinecPoisList(19).length).toBe(9);

    expect(isInsideProsinecPoi(PROSINEC_POIS.village.x, PROSINEC_POIS.village.y, 'village', 18)).toBe(true);
    expect(isInsideProsinecPoi(PROSINEC_NIGHT_POIS.church.x, PROSINEC_NIGHT_POIS.church.y, 'church', 19)).toBe(true);

    const advent = createInitialAdventniVenecState();
    expect(advent.x).toBe(50);
    expect(advent.y).toBe(-75);
    expect(advent.radius).toBe(180);

    const zvon = createInitialStedrovecerniZvonState();
    expect(zvon.x).toBe(-800);
    expect(zvon.y).toBe(-650);
    expect(zvon.radius).toBe(190);
  });

  it('renders all 10 LISTOPAD_DECOR and 10 PROSINEC_DECOR landmarks with balanced ctx.save/restore in day and night modes', () => {
    expect(LISTOPAD_DECOR.length).toBe(10);
    for (const item of LISTOPAD_DECOR) {
      const dayCtx = createMockCtx();
      drawListopadDecoration(dayCtx, item, 3.2, false);
      expect(dayCtx.getSaveDepth(), `${item.type} day saveDepth`).toBe(0);

      const nightCtx = createMockCtx();
      drawListopadDecoration(nightCtx, item, 3.2, true);
      expect(nightCtx.getSaveDepth(), `${item.type} night saveDepth`).toBe(0);
    }

    expect(PROSINEC_DECOR.length).toBe(10);
    for (const item of PROSINEC_DECOR) {
      const dayCtx = createMockCtx();
      drawProsinecDecoration(dayCtx, item, 3.2, false);
      expect(dayCtx.getSaveDepth(), `${item.type} day saveDepth`).toBe(0);

      const nightCtx = createMockCtx();
      drawProsinecDecoration(nightCtx, item, 3.2, true);
      expect(nightCtx.getSaveDepth(), `${item.type} night saveDepth`).toBe(0);
    }
  });

  it('calculates water and ice effects and obstacle collisions for Listopad and Prosinec arenas', () => {
    // Listopad: bridge is dry, pond is open water
    const novBridge = getListopadWaterEffect(475, 420, 16);
    expect(novBridge.inOpenWater).toBe(false);
    expect(novBridge.speedMult).toBe(1);

    const novPond = getListopadWaterEffect(-725, 615, 16);
    expect(novPond.inOpenWater).toBe(true);
    expect(novPond.speedMult).toBeLessThan(1);

    // Listopad obstacle pushout around pekáč (440, -75)
    const novEntity = { x: 441, y: -75 };
    const novHit = resolveListopadObstacles(novEntity, 18);
    expect(novHit).toBe(true);

    // Prosinec: frozen pond is ice (boosts speed), bridge is dry
    const decIce = getProsinecWaterEffect(-725, 615, 18);
    expect(decIce.onIce).toBe(true);
    expect(decIce.speedMult).toBeGreaterThan(1);

    const decBridge = getProsinecWaterEffect(475, 420, 18);
    expect(decBridge.inOpenWater).toBe(false);
    expect(decBridge.onIce).toBe(false);

    // Prosinec obstacle pushout around advent tree (50, -75)
    const decEntity = { x: 51, y: -75 };
    const decHit = resolveProsinecObstacles(decEntity, 18);
    expect(decHit).toBe(true);
  });

  it('initializes GameEngine runs on levels 16..19 and verifies unlocks and trophies', () => {
    const engine = new GameEngine();

    engine.initRun(16, 'wanderer');
    expect(engine.state.activeLevelId).toBe(16);
    expect(getCurrentDayPhase(0, 16).id).toBe('noon');

    engine.initRun(17, 'wanderer');
    expect(engine.state.activeLevelId).toBe(17);
    expect(getCurrentDayPhase(0, 17).id).toBe('dusk');

    engine.initRun(18, 'wanderer');
    expect(engine.state.activeLevelId).toBe(18);
    expect(getCurrentDayPhase(0, 18).id).toBe('noon');

    engine.initRun(19, 'wanderer');
    expect(engine.state.activeLevelId).toBe(19);
    expect(getCurrentDayPhase(0, 19).id).toBe('dusk');

    expect(LEVEL_UNLOCKS[16]).toBeDefined();
    expect(LEVEL_UNLOCKS[17]).toBeDefined();
    expect(LEVEL_UNLOCKS[18]).toBeDefined();
    expect(LEVEL_UNLOCKS[19]).toBeDefined();

    expect(isLevelFullyUnlocked(16, { bestiaryKills: { vele_stika: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(17, { bestiaryKills: { listopadovy_mrazivec: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(18, { bestiaryKills: { kanec_knour: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(19, { bestiaryKills: { mikulassky_cert: 1 } })).toBe(true);

    expect(TROPHIES.some((t) => t.id === 'level16_completed')).toBe(true);
    expect(TROPHIES.some((t) => t.id === 'level17_completed')).toBe(true);
    expect(TROPHIES.some((t) => t.id === 'level18_completed')).toBe(true);
    expect(TROPHIES.some((t) => t.id === 'level19_completed')).toBe(true);
  });
});
