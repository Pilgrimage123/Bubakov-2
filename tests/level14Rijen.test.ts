import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS, getCurrentDayPhase } from '../src/constants';
import { ENEMY_ARCHETYPE_MAP } from '../src/components/gpu-animation/enemyCatalog';
import { isRegularSpawnAllowedForLevel, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import {
  RIJEN_POIS,
  RIJEN_NIGHT_POIS,
  getRijenPois,
  getRijenPoisList,
  isInsideRijenPoi,
  RIJEN_DECOR,
  getRijenWaterEffect,
  resolveRijenObstacles,
  createInitialOhnicekBramborState,
  createInitialDusickovaSviceState,
} from '../src/data/rijenArena';
import { drawRijenDecoration } from '../src/render/rijenSvgLandscape';
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

describe('Stages 15 & 16: Říjen v Hrusicích (Bramborová nať & Dušičková noc)', () => {
  it('defines Stage 15 (id: 14, Říjen – Den) and Stage 16 (id: 15, Říjen – Noc) with autumn themes and bosses', () => {
    const stage15 = GAME_LEVELS[14];
    const stage16 = GAME_LEVELS[15];

    expect(stage15).toBeDefined();
    expect(stage15.id).toBe(14);
    expect(stage15.season).toBe('autumn');
    expect(stage15.theme).toBe('october_harvest');
    expect(stage15.weatherEffect).toBe('falling_leaves');
    expect(stage15.isNightLevel).toBeFalsy();
    expect(stage15.miniBoss.id).toBe('kralovsky_havran');
    expect(stage15.midBoss.id).toBe('hastrman_podzimni');
    expect(stage15.finalBoss.id).toBe('drak_vetrnik');

    expect(stage16).toBeDefined();
    expect(stage16.id).toBe(15);
    expect(stage16.season).toBe('autumn');
    expect(stage16.theme).toBe('all_souls_night');
    expect(stage16.weatherEffect).toBe('fog');
    expect(stage16.isNightLevel).toBe(true);
    expect(stage16.miniBoss.id).toBe('dusickova_bludicka');
    expect(stage16.midBoss.id).toBe('cert_rybnikar');
    expect(stage16.finalBoss.id).toBe('vele_stika');
  });

  it('registers all 8 October enemies/bosses in ENEMIES, ENEMY_POINTS, ENEMY_ARCHETYPE_MAP, and Lada renderer', () => {
    const newIds = [
      'bramborova_mandelinka',
      'podzimni_strasak',
      'kralovsky_havran',
      'hastrman_podzimni',
      'drak_vetrnik',
      'dusickova_bludicka',
      'cert_rybnikar',
      'vele_stika',
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

  it('enforces day/night spawn rules for Stage 15 (day: no frost/undead) and Stage 16 (night: no frost, allows undead)', () => {
    expect(isRegularSpawnAllowedForLevel('bramborova_mandelinka', 14)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('podzimni_strasak', 14)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 14)).toBe(false);
    expect(isRegularSpawnAllowedForLevel('mrazik', 14)).toBe(false);

    expect(isRegularSpawnAllowedForLevel('krvavy_kostlivec', 15)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('nocni_mura', 15)).toBe(true);
    expect(isRegularSpawnAllowedForLevel('mrazik', 15)).toBe(false);

    expect(STAGE_THREAT_MULTIPLIERS[14]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[13]);
    expect(STAGE_THREAT_MULTIPLIERS[15]).toBeGreaterThan(STAGE_THREAT_MULTIPLIERS[14]);
    expect(isCrowWaveNightLevel(14)).toBe(false);
    expect(isCrowWaveNightLevel(15)).toBe(true);
  });

  it('provides distinct day and night POIs, interactive Ohníček (14) and Dušičková svíce (15) states', () => {
    expect(getRijenPois(14)).toBe(RIJEN_POIS);
    expect(getRijenPois(15)).toBe(RIJEN_NIGHT_POIS);
    expect(getRijenPoisList(14).length).toBe(9);
    expect(getRijenPoisList(15).length).toBe(9);

    expect(isInsideRijenPoi(RIJEN_POIS.village.x, RIJEN_POIS.village.y, 'village', 14)).toBe(true);
    expect(isInsideRijenPoi(RIJEN_NIGHT_POIS.shrine.x, RIJEN_NIGHT_POIS.shrine.y, 'shrine', 15)).toBe(true);

    const ohnicek = createInitialOhnicekBramborState();
    expect(ohnicek.x).toBe(50);
    expect(ohnicek.y).toBe(-75);
    expect(ohnicek.interactRadius).toBe(180);

    const svice = createInitialDusickovaSviceState();
    expect(svice.x).toBe(820);
    expect(svice.y).toBe(-620);
    expect(svice.interactRadius).toBe(185);
  });

  it('renders all 10 RIJEN_DECOR landmarks in both daytime and nighttime modes with balanced ctx.save/restore', () => {
    expect(RIJEN_DECOR.length).toBe(10);
    for (const item of RIJEN_DECOR) {
      const dayCtx = createMockCtx();
      drawRijenDecoration(dayCtx, item, 3.2, false);
      expect(dayCtx.getSaveDepth(), `${item.type} day saveDepth`).toBe(0);

      const nightCtx = createMockCtx();
      drawRijenDecoration(nightCtx, item, 3.2, true);
      expect(nightCtx.getSaveDepth(), `${item.type} night saveDepth`).toBe(0);
    }
  });

  it('calculates October water effects and obstacle collisions accurately', () => {
    // On bridge -> dry
    const onBridge = getRijenWaterEffect(475, 420, 14);
    expect(onBridge.inOpenWater).toBe(false);
    expect(onBridge.speedMult).toBe(1);

    // Inside pond -> open water slow
    const inPond = getRijenWaterEffect(-725, 615, 14);
    expect(inPond.inOpenWater).toBe(true);
    expect(inPond.speedMult).toBeLessThan(1);

    // Obstacle pushout around potato fire pit at (50, -75)
    const entity = { x: 51, y: -75 };
    const hit = resolveRijenObstacles(entity, 18);
    expect(hit).toBe(true);
  });

  it('initializes GameEngine runs on levels 14 and 15 and supports unlocks and trophies', () => {
    const engine = new GameEngine();
    engine.initRun(14, 'wanderer');
    expect(engine.state.activeLevelId).toBe(14);
    expect(getCurrentDayPhase(0, 14).id).toBe('noon');

    engine.initRun(15, 'wanderer');
    expect(engine.state.activeLevelId).toBe(15);
    expect(getCurrentDayPhase(0, 15).id).toBe('dusk');

    expect(LEVEL_UNLOCKS[14]).toBeDefined();
    expect(LEVEL_UNLOCKS[15]).toBeDefined();
    expect(isLevelFullyUnlocked(14, { bestiaryKills: { kvilici_meluzina: 1 } })).toBe(true);
    expect(isLevelFullyUnlocked(15, { bestiaryKills: { drak_vetrnik: 1 } })).toBe(true);

    expect(TROPHIES.some((t) => t.id === 'level14_completed')).toBe(true);
    expect(TROPHIES.some((t) => t.id === 'level15_completed')).toBe(true);
  });
});
