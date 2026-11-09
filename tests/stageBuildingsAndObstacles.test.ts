import { describe, it, expect, vi } from 'vitest';
import {
  CANONICAL_HRUSICE_COTTAGES,
  drawAuthenticRoubenka,
  drawAllVillageCottages,
  drawAuthenticTavern,
  drawAuthenticSchool,
  drawAuthenticChurch,
  drawAuthenticMill,
} from '../src/render/villageBuildingRenderer';
import { MARCH_THAW_OBSTACLES } from '../src/data/marchThawArena';
import { DecorItem } from '../src/App';
import { resolveListopadObstacles } from '../src/data/listopadArena';
import { resolveProsinecObstacles } from '../src/data/prosinecArena';
import { resolveLedenObstacles } from '../src/data/ledenArena';
import { resolveUnorObstacles } from '../src/data/unorArena';
import { resolveZariObstacles } from '../src/data/zariArena';
import { resolveRijenObstacles } from '../src/data/rijenArena';

/**
 * Creates a mock 2D canvas context for rendering verifications.
 */
function createMockContext(): CanvasRenderingContext2D {
  const calls: string[] = [];
  const ctx = {
    save: vi.fn(() => calls.push('save')),
    restore: vi.fn(() => calls.push('restore')),
    translate: vi.fn((x: number, y: number) => calls.push(`translate(${x},${y})`)),
    scale: vi.fn((sx: number, sy: number) => calls.push(`scale(${sx},${sy})`)),
    rotate: vi.fn((r: number) => calls.push(`rotate(${r})`)),
    beginPath: vi.fn(() => calls.push('beginPath')),
    closePath: vi.fn(() => calls.push('closePath')),
    moveTo: vi.fn((x: number, y: number) => calls.push(`moveTo(${x},${y})`)),
    lineTo: vi.fn((x: number, y: number) => calls.push(`lineTo(${x},${y})`)),
    rect: vi.fn((x: number, y: number, w: number, h: number) => calls.push(`rect(${x},${y},${w},${h})`)),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => calls.push(`fillRect(${x},${y},${w},${h})`)),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => calls.push(`strokeRect(${x},${y},${w},${h})`)),
    arc: vi.fn((x: number, y: number, r: number) => calls.push(`arc(${x},${y},${r})`)),
    ellipse: vi.fn(() => calls.push('ellipse')),
    quadraticCurveTo: vi.fn(() => calls.push('quadraticCurveTo')),
    bezierCurveTo: vi.fn(() => calls.push('bezierCurveTo')),
    fill: vi.fn(() => calls.push('fill')),
    stroke: vi.fn(() => calls.push('stroke')),
    fillText: vi.fn(() => calls.push('fillText')),
    measureText: vi.fn(() => ({ width: 60 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineJoin: 'round',
    lineCap: 'round',
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;

  return ctx;
}

describe('Stage Buildings & Complete Visuals', () => {
  it('CANONICAL_HRUSICE_COTTAGES defines all 6 canonical cottages matching MARCH_THAW_OBSTACLES', () => {
    expect(CANONICAL_HRUSICE_COTTAGES).toHaveLength(6);

    const cottageIds = CANONICAL_HRUSICE_COTTAGES.map((c) => c.id);
    expect(cottageIds).toEqual([
      'chalupa_nw',
      'chalupa_n',
      'chalupa_ne',
      'chalupa_w',
      'chalupa_sw',
      'chalupa_se',
    ]);

    // Verify each canonical cottage corresponds to an obstacle in MARCH_THAW_OBSTACLES with exact coords
    for (const c of CANONICAL_HRUSICE_COTTAGES) {
      const matchingObstacle = MARCH_THAW_OBSTACLES.find((o) => o.id === c.id);
      expect(matchingObstacle, `Obstacle ${c.id} must exist in MARCH_THAW_OBSTACLES`).toBeDefined();
      expect(matchingObstacle?.x).toBe(c.cx);
      expect(matchingObstacle?.y).toBe(c.cy);

      // Verify authentic dimensions: full-scale cottages, not tiny placeholders
      expect(c.w).toBeGreaterThanOrEqual(240);
      expect(c.h).toBeGreaterThanOrEqual(130);
      expect(c.roofH).toBeGreaterThanOrEqual(110);
    }
  });

  it('drawAuthenticRoubenka renders full architectural components (plinth, walls, door, windows, roof, chimney)', () => {
    const ctx = createMockContext();
    drawAuthenticRoubenka(ctx, 100, -200, 250, 140, 112, {
      season: 'winter',
      isNight: false,
      time: 1.5,
      storkOnChimney: true,
      label: 'TEST CHALUPA',
    });

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.strokeRect).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled(); // Windows / chimney smoke
  });

  it('drawAllVillageCottages renders all 6 cottages across all 4 seasons in day and night', () => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
    for (const season of seasons) {
      for (const isNight of [false, true]) {
        const ctx = createMockContext();
        expect(() => {
          drawAllVillageCottages(ctx, season, isNight, 10.0);
        }).not.toThrow();
        // Each cottage does at least 1 save & restore
        expect((ctx.save as any).mock.calls.length).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('drawAuthenticTavern renders 310x164 tavern with full architectural features', () => {
    const ctx = createMockContext();
    expect(() => {
      drawAuthenticTavern(ctx, 462, -75, false, 'summer', 2.0);
    }).not.toThrow();

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.ellipse).toHaveBeenCalled(); // Tavern beer keg
  });

  it('drawAuthenticSchool renders 300x156 school with belfry turret', () => {
    const ctx = createMockContext();
    expect(() => {
      drawAuthenticSchool(ctx, 125, 550, false, 'autumn', 3.0);
    }).not.toThrow();

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('drawAuthenticChurch renders complete Kostel sv. Jiří with stone walls, nave, belfry and cross', () => {
    const ctx = createMockContext();
    expect(() => {
      drawAuthenticChurch(ctx, -800, -680, true, 'winter', 4.0);
    }).not.toThrow();

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled(); // Windows and bell
  });

  it('drawAuthenticMill renders 270x156 mill with flume and turning 8-spoke waterwheel', () => {
    const ctx = createMockContext();
    expect(() => {
      drawAuthenticMill(ctx, 531, 706, false, 'spring', 5.0);
    }).not.toThrow();

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled(); // Mill wheel rotation
  });
});

describe('DecorItem Obstacles & Building Dimensions', () => {
  it('DecorItem marks cottages and landmark buildings as impassable obstacles with box dimensions', () => {
    const cottage = new DecorItem(100, 200, 'cottage');
    expect(cottage.isObstacle).toBe(true);
    expect(cottage.halfW).toBe(55);
    expect(cottage.halfH).toBe(35);
    expect(cottage.radius).toBeCloseTo(Math.hypot(55, 35));

    const church = new DecorItem(-800, -650, 'church');
    expect(church.isObstacle).toBe(true);
    expect(church.halfW).toBe(60);
    expect(church.halfH).toBe(45);

    const dubenTavern = new DecorItem(400, -75, 'duben_tavern');
    expect(dubenTavern.isObstacle).toBe(true);
    expect(dubenTavern.halfW).toBe(75);
    expect(dubenTavern.halfH).toBe(40);

    const cervenSchool = new DecorItem(125, 550, 'cerven_school');
    expect(cervenSchool.isObstacle).toBe(true);
    expect(cervenSchool.halfW).toBe(75);
    expect(cervenSchool.halfH).toBe(38);

    const rijenMill = new DecorItem(500, 700, 'rijen_mill');
    expect(rijenMill.isObstacle).toBe(true);
    expect(rijenMill.halfW).toBe(68);
    expect(rijenMill.halfH).toBe(38);
  });

  it('DecorItem scales halfW, halfH and radius when scale parameter is passed', () => {
    const scaledCottage = new DecorItem(0, 0, 'cottage', 1.5);
    expect(scaledCottage.halfW).toBe(55 * 1.5);
    expect(scaledCottage.halfH).toBe(35 * 1.5);
    expect(scaledCottage.radius).toBeCloseTo(Math.hypot(55 * 1.5, 35 * 1.5));
  });

  it('DecorItem leaves non-obstacle decor items non-blocking', () => {
    const floe = new DecorItem(0, 0, 'ice_floe');
    expect(floe.isObstacle).toBe(false);

    const tree = new DecorItem(0, 0, 'tree');
    expect(tree.isObstacle).toBe(false);
  });

  it('DecorItem.draw uses drawAuthenticRoubenka and drawAuthenticChurch without throwing', () => {
    const cottage = new DecorItem(100, 100, 'cottage');
    const ctx = createMockContext();
    expect(() => {
      cottage.draw(ctx, 'summer', 'autumn_village', 1.0, false);
    }).not.toThrow();

    const church = new DecorItem(200, 200, 'church');
    expect(() => {
      church.draw(ctx, 'winter', 'winter_frost', 2.0, true);
    }).not.toThrow();
  });
});

describe('Building Obstacles Impassability & Flying Enemy Bypass', () => {
  it('resolveListopadObstacles blocks walking entity but allows flying entity to bypass', () => {
    // chalupa_nw is at -350, -362 with halfW: 125, halfH: 70
    const walker = { x: -350, y: -360, radius: 20, isFlying: false };
    const hit = resolveListopadObstacles(walker, 20);
    expect(hit).toBe(true);
    // Entity was pushed out of the cottage box
    expect(Math.abs(walker.y - (-362))).toBeGreaterThanOrEqual(70 + 20);

    // Flying entity should bypass without collision
    const flyer = { x: -350, y: -360, radius: 20, isFlying: true };
    const flyerHit = resolveListopadObstacles(flyer, 20);
    expect(flyerHit).toBe(false);
    expect(flyer.x).toBe(-350);
    expect(flyer.y).toBe(-360);
  });

  it('resolveProsinecObstacles blocks walking entity but allows flying entity to bypass', () => {
    const walker = { x: 100, y: -410, radius: 20, isFlying: false };
    const hit = resolveProsinecObstacles(walker, 20);
    expect(hit).toBe(true);

    const flyer = { x: 100, y: -410, radius: 20, isFlying: true };
    const flyerHit = resolveProsinecObstacles(flyer, 20);
    expect(flyerHit).toBe(false);
  });

  it('resolveLedenObstacles blocks walking entity but allows flying entity to bypass', () => {
    const walker = { x: 475, y: -375, radius: 20, isFlying: false };
    const hit = resolveLedenObstacles(walker, 20);
    expect(hit).toBe(true);

    const flyer = { x: 475, y: -375, radius: 20, isFlying: true };
    const flyerHit = resolveLedenObstacles(flyer, 20);
    expect(flyerHit).toBe(false);
  });

  it('resolveUnorObstacles blocks walking entity but allows flying entity to bypass', () => {
    const walker = { x: 400, y: 200, radius: 20, isFlying: false };
    const hit = resolveUnorObstacles(walker, 20);
    expect(hit).toBe(true);

    const flyer = { x: 400, y: 200, radius: 20, isFlying: true };
    const flyerHit = resolveUnorObstacles(flyer, 20);
    expect(flyerHit).toBe(false);
  });

  it('resolveZariObstacles and resolveRijenObstacles allow flying bypass', () => {
    const zariFlyer = { x: -350, y: -362, radius: 20, isFlying: true };
    expect(resolveZariObstacles(zariFlyer, 20)).toBe(false);

    const rijenFlyer = { x: -350, y: -362, radius: 20, isFlying: true };
    expect(resolveRijenObstacles(rijenFlyer, 20)).toBe(false);
  });
});
