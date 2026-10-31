import { describe, it, expect } from 'vitest';
import {
  CERVEN_ARENA_BOUNDS,
  CERVEN_OBSTACLES,
  CERVEN_HAYSTACK_OBSTACLES,
  CERVEN_POIS,
  CERVEN_POIS_LIST,
  resolveCervenObstacles,
  hasCervenTerrainLineOfSight,
  getCervenWaterEffect,
  isInsideCervenPoi,
} from '../src/data/cervenArena';
import { MARCH_ARENA_BOUNDS, MARCH_THAW_OBSTACLES, MARCH_THAW_POIS } from '../src/data/marchThawArena';
import { drawCervenSummerLandmark } from '../src/render/cervenSvgLandscape';

describe('Level 7: Červen v Hrusicích (Arena Geometry & June Harvest Motifs)', () => {
  it('preserves exact physical arena boundaries from Stage 1 while introducing tactical haystacks', () => {
    expect(CERVEN_ARENA_BOUNDS).toEqual(MARCH_ARENA_BOUNDS);
    expect(CERVEN_OBSTACLES.length).toBeGreaterThan(MARCH_THAW_OBSTACLES.length);
    expect(CERVEN_HAYSTACK_OBSTACLES.length).toBe(5);

    // Verify key building locations match exactly
    const marchTavern = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main');
    const cervenTavern = CERVEN_OBSTACLES.find((o) => o.id === 'hospoda_main');
    expect(cervenTavern).toEqual(marchTavern);

    const marchChurch = MARCH_THAW_OBSTACLES.find((o) => o.id === 'kostel_nave');
    const cervenChurch = CERVEN_OBSTACLES.find((o) => o.id === 'kostel_nave');
    expect(cervenChurch).toEqual(marchChurch);
  });

  it('defines 9 themed June POIs transformed with authentic folkloric harvest motifs', () => {
    expect(CERVEN_POIS_LIST.length).toBe(9);
    expect(CERVEN_POIS.fields.title).toContain('senoseč');
    expect(CERVEN_POIS.fields.hint).toContain('žebřiňák');
    expect(CERVEN_POIS.shrine.title).toContain('Sv. Antonína');
    expect(CERVEN_POIS.shrine.interactPrompt).toContain('Požehnání sv. Antonína');
    expect(CERVEN_POIS.mill.title).toContain('Na racích');
    expect(CERVEN_POIS.forest.title).toContain('Borůvkový háj');
    expect(CERVEN_POIS.tavern.title).toContain('pod lipou');

    // POI coordinates match Stage 1 anchors
    expect(CERVEN_POIS.fields.x).toBe(MARCH_THAW_POIS.fields.x);
    expect(CERVEN_POIS.fields.y).toBe(MARCH_THAW_POIS.fields.y);
    expect(CERVEN_POIS.church.x).toBe(MARCH_THAW_POIS.church.x);
    expect(CERVEN_POIS.church.y).toBe(MARCH_THAW_POIS.church.y);
    expect(CERVEN_POIS.village.x).toBe(MARCH_THAW_POIS.village.x);
    expect(CERVEN_POIS.village.y).toBe(MARCH_THAW_POIS.village.y);
  });

  it('resolves collision against cottages and tactical haystacks, clamping within arena bounds', () => {
    // Attempting to step inside northern cottage (-350, -362)
    const entity = { x: -350, y: -362, radius: 20 };
    resolveCervenObstacles(entity, false);
    const distCottage = Math.hypot(entity.x - (-350), entity.y - (-362));
    expect(distCottage).toBeGreaterThan(40);

    // Collision against haystack_1 (x: 160, y: -880, radius: 26)
    const hayEntity = { x: 160, y: -880, radius: 18 };
    resolveCervenObstacles(hayEntity, false);
    const distHay = Math.hypot(hayEntity.x - 160, hayEntity.y - (-880));
    expect(distHay).toBeGreaterThanOrEqual(40);

    // Clamping to outer boundary
    const escapedEntity = { x: 3000, y: 3000, radius: 20 };
    resolveCervenObstacles(escapedEntity, false);
    expect(escapedEntity.x).toBeLessThanOrEqual(CERVEN_ARENA_BOUNDS.maxX);
    expect(escapedEntity.y).toBeLessThanOrEqual(CERVEN_ARENA_BOUNDS.maxY);
  });

  it('blocks line of sight through solid stone walls and buildings', () => {
    // Clear sight across open village green
    expect(hasCervenTerrainLineOfSight(0, 0, 100, 0)).toBe(true);

    // Obstructed sight through Hospoda (x: 462, y: -75)
    expect(hasCervenTerrainLineOfSight(250, -75, 650, -75)).toBe(false);

    // Obstructed sight through hilltop church
    expect(hasCervenTerrainLineOfSight(-900, -700, -650, -700)).toBe(false);
  });

  it('simulates warm open thawed water currents at crayfish pools and pond without winter ice floes', () => {
    // Outside water
    const landEffect = getCervenWaterEffect(0, 0, 10);
    expect(landEffect.inOpenWater).toBe(false);

    // On wooden bridge
    const bridgeEffect = getCervenWaterEffect(475, 420, 10);
    expect(bridgeEffect.inOpenWater).toBe(false);

    // In open warm pond
    const pondEffect = getCervenWaterEffect(CERVEN_POIS.pond.x, CERVEN_POIS.pond.y, 10);
    expect(pondEffect.inOpenWater).toBe(true);
  });

  it('safely renders all procedural June landmark decor items without canvas stack leaks', () => {
    let saveCount = 0;
    let restoreCount = 0;
    const mockCtx: any = {
      save: () => { saveCount++; },
      restore: () => { restoreCount++; },
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      quadraticCurveTo: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
    };

    const landmarks = [
      'cerven_border',
      'cerven_hay_wagon',
      'cerven_anthony_shrine',
      'cerven_crayfish_pool',
      'cerven_blueberry_grove',
      'cerven_tavern',
      'cerven_pond',
      'cerven_haystack',
    ];

    for (const lm of landmarks) {
      saveCount = 0;
      restoreCount = 0;
      expect(() => drawCervenSummerLandmark(mockCtx, lm, 5.0, false)).not.toThrow();
      expect(saveCount).toBe(restoreCount);
    }
  });
});
