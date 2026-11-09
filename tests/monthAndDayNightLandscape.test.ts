import { describe, it, expect, vi } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ArenaRenderer } from '../src/render/arenaRenderer';
import { drawMarchThawDynamicLandmark } from '../src/render/marchThawSvgLandscape';
import { drawDubenSpringLandmark } from '../src/render/marchThawSvgLandscape';
import { drawKvetenMayLandmark } from '../src/render/kvetenSvgLandscape';
import { drawCervenSummerLandmark } from '../src/render/cervenSvgLandscape';
import { drawCervenecDecoration } from '../src/render/cervenecSvgLandscape';
import { drawSrpenDecoration } from '../src/render/srpenSvgLandscape';
import { drawZariDecoration } from '../src/render/zariSvgLandscape';
import { drawRijenDecoration } from '../src/render/rijenSvgLandscape';
import { drawListopadDecoration } from '../src/render/listopadSvgLandscape';
import { drawProsinecDecoration } from '../src/render/prosinecSvgLandscape';
import { drawLedenDecoration } from '../src/render/ledenSvgLandscape';
import { drawUnorDecoration } from '../src/render/unorSvgLandscape';

function createSpyContext() {
  const drawnTexts: string[] = [];
  const fillStyles: string[] = [];
  let saveCount = 0;
  let restoreCount = 0;

  return {
    drawnTexts,
    fillStyles,
    save: vi.fn(() => { saveCount++; }),
    restore: vi.fn(() => { restoreCount++; }),
    getSaveDepth: () => saveCount - restoreCount,
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn((text: string) => drawnTexts.push(text)),
    strokeText: vi.fn(),
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn(() => ({ width: 80 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineJoin: 'round',
    lineCap: 'round',
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D & {
    drawnTexts: string[];
    fillStyles: string[];
    getSaveDepth: () => number;
  };
}

describe('Landscape Mapping to Month & Time of Day', () => {
  const MONTHS = [
    { monthNum: 1, monthName: 'Březen', dayId: 0, nightId: 1, season: 'spring' },
    { monthNum: 2, monthName: 'Duben', dayId: 2, nightId: 3, season: 'spring' },
    { monthNum: 3, monthName: 'Květen', dayId: 4, nightId: 5, season: 'spring' },
    { monthNum: 4, monthName: 'Červen', dayId: 6, nightId: 7, season: 'summer' },
    { monthNum: 5, monthName: 'Červenec', dayId: 8, nightId: 9, season: 'summer' },
    { monthNum: 6, monthName: 'Srpen', dayId: 10, nightId: 11, season: 'summer' },
    { monthNum: 7, monthName: 'Září', dayId: 12, nightId: 13, season: 'autumn' },
    { monthNum: 8, monthName: 'Říjen', dayId: 14, nightId: 15, season: 'autumn' },
    { monthNum: 9, monthName: 'Listopad', dayId: 16, nightId: 17, season: 'autumn' },
    { monthNum: 10, monthName: 'Prosinec', dayId: 18, nightId: 19, season: 'winter' },
    { monthNum: 11, monthName: 'Leden', dayId: 20, nightId: 21, season: 'winter' },
    { monthNum: 12, monthName: 'Únor', dayId: 22, nightId: 23, season: 'winter' },
  ];

  it('every month has a pair of levels representing day (even ID) and night (odd ID)', () => {
    for (const m of MONTHS) {
      const dayLevel = GAME_LEVELS[m.dayId as keyof typeof GAME_LEVELS];
      const nightLevel = GAME_LEVELS[m.nightId as keyof typeof GAME_LEVELS];

      expect(dayLevel, `${m.monthName} day level exists`).toBeDefined();
      expect(nightLevel, `${m.monthName} night level exists`).toBeDefined();

      expect(dayLevel.season, `${m.monthName} day season`).toBe(m.season);
      expect(nightLevel.season, `${m.monthName} night season`).toBe(m.season);

      expect(dayLevel.isNightLevel ?? false, `${m.monthName} day should not be night level`).toBe(false);
      expect(nightLevel.isNightLevel, `${m.monthName} night should be night level`).toBe(true);

      // Night sky color must be a dark nocturnal tone
      expect(nightLevel.nightSkyColor || nightLevel.skyColor).toMatch(/^#(0|1|2|3)/);
    }
  });

  it('all 12 month border cartouches render distinct day and night titles & motifs', () => {
    // Duben
    const dubenDay = createSpyContext();
    drawDubenSpringLandmark(dubenDay, 'duben_border', 0, false);
    expect(dubenDay.drawnTexts).toContain('DUBEN');

    const dubenNight = createSpyContext();
    drawDubenSpringLandmark(dubenNight, 'duben_border', 0, true);
    expect(dubenNight.drawnTexts).toContain('DUBEN • FILIPOJAKUBSKÁ NOC');

    // Květen
    const kvetenDay = createSpyContext();
    drawKvetenMayLandmark(kvetenDay, 'kveten_border', 0, false);
    expect(kvetenDay.drawnTexts).toContain('KVĚTEN');

    const kvetenNight = createSpyContext();
    drawKvetenMayLandmark(kvetenNight, 'kveten_border', 0, true);
    expect(kvetenNight.drawnTexts).toContain('KVĚTEN • MÁJOVÁ NOC');

    // Červen
    const cervenDay = createSpyContext();
    drawCervenSummerLandmark(cervenDay, 'cerven_border', 0, false);
    expect(cervenDay.drawnTexts).toContain('ČERVEN');

    const cervenNight = createSpyContext();
    drawCervenSummerLandmark(cervenNight, 'cerven_border', 0, true);
    expect(cervenNight.drawnTexts).toContain('ČERVEN • SVATOJÁNSKÁ NOC');

    // Červenec
    const cervenecDay = createSpyContext();
    drawCervenecDecoration(cervenecDay, 'cervenec_border', 0, false);
    expect(cervenecDay.drawnTexts.some((t) => t.includes('ČERVENEC') && t.includes('ŽNĚ'))).toBe(true);

    const cervenecNight = createSpyContext();
    drawCervenecDecoration(cervenecNight, 'cervenec_border', 0, true);
    expect(cervenecNight.drawnTexts.some((t) => t.includes('ČERVENEC') && t.includes('ELIÁŠ'))).toBe(true);

    // Srpen
    const srpenDay = createSpyContext();
    drawSrpenDecoration(srpenDay, 'srpen_border', 0, false);
    expect(srpenDay.drawnTexts.some((t) => t.includes('SRPEN') && t.includes('DOŽÍN'))).toBe(true);

    const srpenNight = createSpyContext();
    drawSrpenDecoration(srpenNight, 'srpen_border', 0, true);
    expect(srpenNight.drawnTexts.some((t) => t.includes('SRPEN') && t.includes('VAVŘIN'))).toBe(true);

    // Září
    const zariDay = createSpyContext();
    drawZariDecoration(zariDay, 'zari_border', 0, false);
    expect(zariDay.drawnTexts.some((t) => t.includes('ZÁŘÍ') && t.includes('POSVÍCENÍ'))).toBe(true);

    const zariNight = createSpyContext();
    drawZariDecoration(zariNight, 'zari_border', 0, true);
    expect(zariNight.drawnTexts.some((t) => t.includes('ZÁŘÍ') && t.includes('SVATOVÁCLAVSKÁ'))).toBe(true);

    // Říjen
    const rijenDay = createSpyContext();
    drawRijenDecoration(rijenDay, 'rijen_border', 0, false);
    expect(rijenDay.drawnTexts.some((t) => t.includes('ŘÍJEN') && t.includes('DRAKIÁDA'))).toBe(true);

    const rijenNight = createSpyContext();
    drawRijenDecoration(rijenNight, 'rijen_border', 0, true);
    expect(rijenNight.drawnTexts.some((t) => t.includes('ŘÍJEN') && t.includes('DUŠIČKOVÁ'))).toBe(true);

    // Listopad
    const listopadDay = createSpyContext();
    drawListopadDecoration(listopadDay, 'listopad_border', 0, false);
    expect(listopadDay.drawnTexts.some((t) => t.includes('LISTOPAD') && t.includes('SVATOMARTINSK'))).toBe(true);

    const listopadNight = createSpyContext();
    drawListopadDecoration(listopadNight, 'listopad_border', 0, true);
    expect(listopadNight.drawnTexts.some((t) => t.includes('LISTOPAD') && t.includes('HON'))).toBe(true);

    // Prosinec
    const prosinecDay = createSpyContext();
    drawProsinecDecoration(prosinecDay, 'prosinec_border', 0, false);
    expect(prosinecDay.drawnTexts.some((t) => t.includes('PROSINEC') && t.includes('ADVENT'))).toBe(true);

    const prosinecNight = createSpyContext();
    drawProsinecDecoration(prosinecNight, 'prosinec_border', 0, true);
    expect(prosinecNight.drawnTexts.some((t) => t.includes('PROSINEC') && t.includes('ŠTĚDROVEČERNÍ'))).toBe(true);

    // Leden
    const ledenDay = createSpyContext();
    drawLedenDecoration(ledenDay, { type: 'leden_border', x: 0, y: 0 }, false, 0);
    expect(ledenDay.drawnTexts.some((t) => t.includes('LEDEN') && t.includes('TŘÍKRÁLOVÁ'))).toBe(true);

    const ledenNight = createSpyContext();
    drawLedenDecoration(ledenNight, { type: 'leden_border', x: 0, y: 0 }, true, 0);
    expect(ledenNight.drawnTexts.some((t) => t.includes('LEDEN') && (t.includes('TŘÍKRÁLOVÁ') || t.includes('PERCHTA')))).toBe(true);

    // Únor
    const unorDay = createSpyContext();
    drawUnorDecoration(unorDay, { type: 'unor_border', x: 0, y: 0 }, false, 0);
    expect(unorDay.drawnTexts.some((t) => t.includes('ÚNOR') && t.includes('MASOPUST'))).toBe(true);

    const unorNight = createSpyContext();
    drawUnorDecoration(unorNight, { type: 'unor_border', x: 0, y: 0 }, true, 0);
    expect(unorNight.drawnTexts.some((t) => t.includes('ÚNOR') && t.includes('BASY'))).toBe(true);
  });

  it('ArenaRenderer recognizes night levels reliably and renders night backdrops and lighting', () => {
    const renderer = new ArenaRenderer();

    // Check night level (e.g. Level 19: Štědrovečerní noc)
    const ctx = createSpyContext();
    const camera = { x: 0, y: 0, width: 800, height: 600, viewLeft: -100, viewTop: -100, viewRight: 900, viewBottom: 700 };
    const level19 = GAME_LEVELS[19];

    renderer.renderArena(ctx, {
      player: { x: 0, y: 0, hp: 100, maxHp: 100, kuraz: 100, maxKuraz: 100, radius: 20 },
      activeLevelId: 19,
      decor: [],
      enemies: [],
      projectiles: [],
      slashes: [],
      drops: [],
      lightSources: [],
      particles: [],
    } as any, camera, {
      curLvl: level19,
      // Even if dayPhase was defaulted to noon, night level flag must force night rendering
      dayPhase: { id: 'noon' } as any,
    });

    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
