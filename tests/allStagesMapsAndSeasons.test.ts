import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { CERVEN_DECOR_TYPES, drawCervenSummerLandmark } from '../src/render/cervenSvgLandscape';
import { CERVENEC_DECOR, getCervenecWaterEffect, CERVENEC_POIS } from '../src/data/cervenecArena';
import { drawCervenecDecoration, drawCervenecSummerLandmark } from '../src/render/cervenecSvgLandscape';
import { SRPEN_DECOR, getSrpenWaterEffect, SRPEN_POIS } from '../src/data/srpenArena';
import { drawSrpenDecoration, drawSrpenSummerLandmark } from '../src/render/srpenSvgLandscape';
import { ZARI_DECOR, getZariWaterEffect, ZARI_POIS } from '../src/data/zariArena';
import { drawZariDecoration } from '../src/render/zariSvgLandscape';
import { RIJEN_DECOR, getRijenWaterEffect, RIJEN_POIS } from '../src/data/rijenArena';
import { drawRijenDecoration } from '../src/render/rijenSvgLandscape';
import { LISTOPAD_DECOR, getListopadWaterEffect, LISTOPAD_POIS } from '../src/data/listopadArena';
import { drawListopadDecoration } from '../src/render/listopadSvgLandscape';
import { PROSINEC_DECOR, getProsinecWaterEffect, PROSINEC_POIS } from '../src/data/prosinecArena';
import { drawProsinecDecoration } from '../src/render/prosinecSvgLandscape';
import { LEDEN_DECOR, getLedenWaterEffect, LEDEN_POIS } from '../src/data/ledenArena';
import { drawLedenDecoration } from '../src/render/ledenSvgLandscape';
import { UNOR_DECOR, getUnorWaterEffect, UNOR_POIS } from '../src/data/unorArena';
import { drawUnorDecoration } from '../src/render/unorSvgLandscape';
import { drawDubenSpringLandmark } from '../src/render/marchThawSvgLandscape';
import { drawKvetenMayLandmark } from '../src/render/kvetenSvgLandscape';
import { getCervenWaterEffect } from '../src/data/cervenArena';

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

describe('Seasonal Maps & Month Representation Audit (All 16 Stages)', () => {
  it('verifies that each of the 8 represented months matches its authentic season and thematic setting', () => {
    const monthConfigs = [
      { id: 0, month: 'Březen (Předjaří)', season: 'spring', theme: 'spring_river', isNight: false },
      { id: 1, month: 'Březen (Noční mráz)', season: 'spring', theme: 'spring_river', isNight: true },
      { id: 2, month: 'Duben (Zelenání)', season: 'spring', theme: 'spring_village', isNight: false },
      { id: 3, month: 'Duben (Filipojakubská noc)', season: 'spring', theme: 'spring_village', isNight: true },
      { id: 4, month: 'Květen (Májová slavnost)', season: 'spring', theme: 'spring_village', isNight: false },
      { id: 5, month: 'Květen (Čarovný les)', season: 'spring', theme: 'spring_village', isNight: true },
      { id: 6, month: 'Červen (Senoseč)', season: 'summer', theme: 'summer_harvest', isNight: false },
      { id: 7, month: 'Červen (Svatojánská noc)', season: 'summer', theme: 'summer_harvest', isNight: true },
      { id: 8, month: 'Červenec (Žně na Markétu)', season: 'summer', theme: 'summer_harvest', isNight: false },
      { id: 9, month: 'Červenec (Bouře sv. Eliáše)', season: 'summer', theme: 'summer_harvest', isNight: true },
      { id: 10, month: 'Srpen (Dožínky)', season: 'summer', theme: 'august_harvest', isNight: false },
      { id: 11, month: 'Srpen (Vavřinecká noc)', season: 'summer', theme: 'laurence_night', isNight: true },
      { id: 12, month: 'Září (Posvícení a švestky)', season: 'autumn', theme: 'september_feast', isNight: false },
      { id: 13, month: 'Září (Svatováclavská noc)', season: 'autumn', theme: 'wenceslas_night', isNight: true },
      { id: 14, month: 'Říjen (Bramborová nať a drakiáda)', season: 'autumn', theme: 'october_harvest', isNight: false },
      { id: 15, month: 'Říjen (Dušičková noc a výlov rybníka)', season: 'autumn', theme: 'all_souls_night', isNight: true },
      { id: 16, month: 'Listopad (Svatomartinské posvícení)', season: 'autumn', theme: 'st_martin_feast', isNight: false },
      { id: 17, month: 'Listopad (Lov v mlze)', season: 'autumn', theme: 'november_fog_hunt', isNight: true },
      { id: 18, month: 'Prosinec (Mikulášská obchůzka)', season: 'winter', theme: 'st_nicholas_procession', isNight: false },
      { id: 19, month: 'Prosinec (Štědrovečerní noc)', season: 'winter', theme: 'christmas_eve_miracle', isNight: true },
      { id: 20, month: 'Leden (Tříkrálová koleda a sníh)', season: 'winter', theme: 'january_frost', isNight: false },
      { id: 21, month: 'Leden (Tříkrálová noc a perchta)', season: 'winter', theme: 'january_frost', isNight: true },
      { id: 22, month: 'Únor (Masopustní průvod a koblihy)', season: 'winter', theme: 'carnival_feast', isNight: false },
      { id: 23, month: 'Únor (Masopustní rej a pochovávání basy)', season: 'winter', theme: 'carnival_night', isNight: true },
    ];

    for (const cfg of monthConfigs) {
      const level = GAME_LEVELS[cfg.id as keyof typeof GAME_LEVELS];
      expect(level, `Stage ${cfg.id + 1} (${cfg.month}) exists`).toBeDefined();
      expect(level.season, `Stage ${cfg.id + 1} season`).toBe(cfg.season);
      expect(level.theme, `Stage ${cfg.id + 1} theme`).toBe(cfg.theme);
      expect(Boolean(level.isNightLevel), `Stage ${cfg.id + 1} isNight`).toBe(cfg.isNight);
    }
  });

  it('verifies Duben (Stages 3 & 4) spring landscape renders without canvas stack imbalances', () => {
    const dubenTypes = [
      'duben_border',
      'duben_pond',
      'duben_church',
      'duben_tavern',
      'duben_maypole',
      'duben_mill',
      'duben_orchard',
      'duben_fields',
      'duben_shrine',
      'duben_birch_grove',
    ];

    for (const t of dubenTypes) {
      const ctx = createMockCtx();
      expect(() => drawDubenSpringLandmark(ctx, t, 1.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${t} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawDubenSpringLandmark(ctxNight, t, 1.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${t} (night)`).toBe(0);
    }
  });

  it('verifies Květen (Stages 5 & 6) May festival landscape renders cleanly', () => {
    const kvetenTypes = [
      'kveten_border',
      'kveten_pond',
      'kveten_pasture',
      'kveten_orchard',
      'kveten_tavern',
      'kveten_school',
      'kveten_maypole',
      'kveten_brook',
      'kveten_shrine',
      'kveten_goat_grove',
      'kveten_elder',
    ];

    for (const t of kvetenTypes) {
      const ctx = createMockCtx();
      expect(() => drawKvetenMayLandmark(ctx, t, 1.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${t} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawKvetenMayLandmark(ctxNight, t, 1.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${t} (night)`).toBe(0);
    }
  });

  it('verifies Červen (Stages 7 & 8) haymaking landscape renders all landmarks with balanced canvas', () => {
    const cervenTypes = [
      'cerven_border',
      'cerven_hay_wagon',
      'cerven_anthony_shrine',
      'cerven_crayfish_pool',
      'cerven_blueberry_grove',
      'cerven_tavern',
      'cerven_pond',
      'cerven_haystack',
      'cerven_village',
      'cerven_church',
      'cerven_school',
    ];

    for (const t of cervenTypes) {
      const ctx = createMockCtx();
      expect(() => drawCervenSummerLandmark(ctx, t, 1.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${t} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawCervenSummerLandmark(ctxNight, t, 1.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${t} (night)`).toBe(0);
    }
  });

  it('verifies Červenec (Stages 9 & 10) July harvest map has all 10 landmarks properly positioned without collision overlapping', () => {
    expect(CERVENEC_DECOR.length).toBe(10);
    const types = CERVENEC_DECOR.map((d) => d.type);
    expect(types).toContain('cervenec_border');
    expect(types).toContain('cervenec_fields');
    expect(types).toContain('cervenec_church');
    expect(types).toContain('cervenec_village');
    expect(types).toContain('cervenec_tavern');
    expect(types).toContain('cervenec_pond');
    expect(types).toContain('cervenec_mill');
    expect(types).toContain('cervenec_forest');
    expect(types).toContain('cervenec_shrine');
    expect(types).toContain('cervenec_school');

    const villageDecor = CERVENEC_DECOR.find((d) => d.type === 'cervenec_village');
    const tavernDecor = CERVENEC_DECOR.find((d) => d.type === 'cervenec_tavern');
    expect(villageDecor?.x).toBe(CERVENEC_POIS.village.x);
    expect(villageDecor?.y).toBe(CERVENEC_POIS.village.y);
    expect(tavernDecor?.x).toBe(CERVENEC_POIS.tavern.x);
    expect(tavernDecor?.y).toBe(CERVENEC_POIS.tavern.y);
    expect(villageDecor?.x).not.toBe(tavernDecor?.x);

    for (const d of CERVENEC_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawCervenecDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawCervenecDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Srpen (Stages 11 & 12) August festival map has all 10 landmarks properly positioned', () => {
    expect(SRPEN_DECOR.length).toBe(10);
    const types = SRPEN_DECOR.map((d) => d.type);
    expect(types).toContain('srpen_border');
    expect(types).toContain('srpen_fields');
    expect(types).toContain('srpen_church');
    expect(types).toContain('srpen_village');
    expect(types).toContain('srpen_tavern');
    expect(types).toContain('srpen_pond');
    expect(types).toContain('srpen_mill');
    expect(types).toContain('srpen_forest');
    expect(types).toContain('srpen_shrine');
    expect(types).toContain('srpen_school');

    const villageDecor = SRPEN_DECOR.find((d) => d.type === 'srpen_village');
    const tavernDecor = SRPEN_DECOR.find((d) => d.type === 'srpen_tavern');
    expect(villageDecor?.x).toBe(SRPEN_POIS.village.x);
    expect(villageDecor?.y).toBe(SRPEN_POIS.village.y);
    expect(tavernDecor?.x).toBe(SRPEN_POIS.tavern.x);
    expect(tavernDecor?.y).toBe(SRPEN_POIS.tavern.y);
    expect(villageDecor?.x).not.toBe(tavernDecor?.x);

    for (const d of SRPEN_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawSrpenDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawSrpenDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Září (Stages 13 & 14) September feast & St. Wenceslas night map has all 10 landmarks properly positioned', () => {
    expect(ZARI_DECOR.length).toBe(10);
    const types = ZARI_DECOR.map((d) => d.type);
    expect(types).toContain('zari_border');
    expect(types).toContain('zari_fields');
    expect(types).toContain('zari_church');
    expect(types).toContain('zari_village');
    expect(types).toContain('zari_tavern');
    expect(types).toContain('zari_pond');
    expect(types).toContain('zari_mill');
    expect(types).toContain('zari_forest');
    expect(types).toContain('zari_shrine');
    expect(types).toContain('zari_school');

    const villageDecor = ZARI_DECOR.find((d) => d.type === 'zari_village');
    const tavernDecor = ZARI_DECOR.find((d) => d.type === 'zari_tavern');
    expect(villageDecor?.x).toBe(ZARI_POIS.village.x);
    expect(villageDecor?.y).toBe(ZARI_POIS.village.y);
    expect(tavernDecor?.x).toBe(ZARI_POIS.tavern.x);
    expect(tavernDecor?.y).toBe(ZARI_POIS.tavern.y);
    expect(villageDecor?.x).not.toBe(tavernDecor?.x);

    for (const d of ZARI_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawZariDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawZariDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Říjen (Stages 15 & 16) autumn landscape renders without canvas stack imbalances', () => {
    for (const d of RIJEN_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawRijenDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawRijenDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Listopad (Stages 17 & 18) November landscape renders without canvas stack imbalances', () => {
    for (const d of LISTOPAD_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawListopadDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawListopadDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Prosinec (Stages 19 & 20) December winter landscape renders without canvas stack imbalances', () => {
    for (const d of PROSINEC_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawProsinecDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawProsinecDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Leden (Stages 21 & 22) January winter landscape renders without canvas stack imbalances', () => {
    for (const d of LEDEN_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawLedenDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawLedenDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies Únor (Stages 23 & 24) February carnival landscape renders without canvas stack imbalances', () => {
    for (const d of UNOR_DECOR) {
      const ctx = createMockCtx();
      expect(() => drawUnorDecoration(ctx, d, 2.0, false)).not.toThrow();
      expect(ctx.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawUnorDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies summer, autumn & winter water physics in Stages 7–24 treats ice/bridges correctly', () => {
    // Test June water
    const juneBridge = getCervenWaterEffect(425, -455, 10);
    expect(juneBridge.inOpenWater).toBe(false);
    expect(juneBridge.carryVx).toBe(0);

    const junePond = getCervenWaterEffect(-725, 615, 10);
    expect(junePond.inOpenWater).toBe(true);

    // Test July water
    const julyBridge = getCervenecWaterEffect(425, -455, 10);
    expect(julyBridge.inOpenWater).toBe(false);
    expect(julyBridge.carryVx).toBe(0);

    const julyPond = getCervenecWaterEffect(-725, 615, 10);
    expect(julyPond.inOpenWater).toBe(true);

    // Test August water
    const augustBridge = getSrpenWaterEffect(475, 420, 10);
    expect(augustBridge.inOpenWater).toBe(false);
    expect(augustBridge.carryVx).toBe(0);

    const augustPond = getSrpenWaterEffect(-725, 615, 10);
    expect(augustPond.inOpenWater).toBe(true);

    // Test September water
    const septemberBridge = getZariWaterEffect(475, 420, 10);
    expect(septemberBridge.inOpenWater).toBe(false);
    expect(septemberBridge.carryVx).toBe(0);

    const septemberPond = getZariWaterEffect(-725, 615, 10);
    expect(septemberPond.inOpenWater).toBe(true);

    // Test October water
    const octoberBridge = getRijenWaterEffect(475, 420, 14);
    expect(octoberBridge.inOpenWater).toBe(false);
    expect(octoberBridge.carryVx).toBe(0);

    const octoberPond = getRijenWaterEffect(-725, 615, 14);
    expect(octoberPond.inOpenWater).toBe(true);

    // Test November water
    const novemberBridge = getListopadWaterEffect(475, 420, 16);
    expect(novemberBridge.inOpenWater).toBe(false);

    const novemberPond = getListopadWaterEffect(-725, 615, 16);
    expect(novemberPond.inOpenWater).toBe(true);

    // Test December frozen water
    const decemberIce = getProsinecWaterEffect(-725, 615, 18);
    expect(decemberIce.onIce).toBe(true);
    expect(decemberIce.speedMult).toBeGreaterThan(1.0);

    // Test January frozen water
    const januaryIce = getLedenWaterEffect(-725, 615, 20);
    expect(januaryIce.onIce).toBe(true);
    expect(januaryIce.speedMult).toBeGreaterThan(1.0);

    // Test February frozen water
    const februaryIce = getUnorWaterEffect(-725, 615, 22);
    expect(februaryIce.onIce).toBe(true);
    expect(februaryIce.speedMult).toBeGreaterThan(1.0);
  });

  it('verifies stage numbering and ordering: IDs 0..23, titles 1..24, and sequential unlock progression', () => {
    for (let id = 0; id <= 23; id++) {
      const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
      expect(level.id).toBe(id);
      expect(level.name.startsWith(`${id + 1}.`), `Level ${id} name should start with '${id + 1}.'`).toBe(true);
      expect(level.badge).toBe(`${id + 1}. Úroveň`);

      if (id > 0) {
        expect(
          level.unlockRequirementText.toLowerCase(),
          `Level ${id} unlock text mentions level ${id}`
        ).toContain(`${id}.`);
      }
    }
  });
});
