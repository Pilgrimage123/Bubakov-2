import { describe, it, expect } from 'vitest';
import {
  KVETEN_ARENA_BOUNDS,
  KVETEN_OBSTACLES,
  KVETEN_POIS,
  KVETEN_POIS_LIST,
  resolveKvetenObstacles,
  hasKvetenTerrainLineOfSight,
  getKvetenWaterEffect,
  isInsideKvetenPoi,
} from '../src/data/kvetenArena';
import { MARCH_ARENA_BOUNDS, MARCH_THAW_OBSTACLES, MARCH_THAW_POIS } from '../src/data/marchThawArena';
import { drawKvetenMayLandmark } from '../src/render/kvetenSvgLandscape';

describe('Level 5: Květen v Hrusicích (Arena Geometry & May Motifs)', () => {
  it('preserves exact physical arena boundaries and obstacle footprint from Stage 1', () => {
    expect(KVETEN_ARENA_BOUNDS).toEqual(MARCH_ARENA_BOUNDS);
    expect(KVETEN_OBSTACLES.length).toBe(MARCH_THAW_OBSTACLES.length);

    // Verify key building locations match exactly
    const marchTavern = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main');
    const kvetenTavern = KVETEN_OBSTACLES.find((o) => o.id === 'hospoda_main');
    expect(kvetenTavern).toEqual(marchTavern);

    const marchChurch = MARCH_THAW_OBSTACLES.find((o) => o.id === 'kostel_nave');
    const kvetenChurch = KVETEN_OBSTACLES.find((o) => o.id === 'kostel_nave');
    expect(kvetenChurch).toEqual(marchChurch);
  });

  it('defines 9 themed May POIs transformed with authentic folkloric motifs', () => {
    expect(KVETEN_POIS_LIST.length).toBe(9);
    expect(KVETEN_POIS.village.title).toContain('májkou');
    expect(KVETEN_POIS.shrine.title).toContain('sv. Jana Nepomuckého');
    expect(KVETEN_POIS.fields.title).toContain('pastviny');
    expect(KVETEN_POIS.fields.hint).toContain('V máji nemá pastýři oschnout hůl');
    expect(KVETEN_POIS.forest.title).toContain('kozí háj');
    expect(KVETEN_POIS.forest.hint).toContain('Máj, vyženeme kozy v háj');

    // POI coordinates match Stage 1 anchors
    expect(KVETEN_POIS.fields.x).toBe(MARCH_THAW_POIS.fields.x);
    expect(KVETEN_POIS.fields.y).toBe(MARCH_THAW_POIS.fields.y);
    expect(KVETEN_POIS.church.x).toBe(MARCH_THAW_POIS.church.x);
    expect(KVETEN_POIS.church.y).toBe(MARCH_THAW_POIS.church.y);
    expect(KVETEN_POIS.village.x).toBe(MARCH_THAW_POIS.village.x);
    expect(KVETEN_POIS.village.y).toBe(MARCH_THAW_POIS.village.y);
  });

  it('resolves collision against cottages and clamps within physical arena borders', () => {
    // Attempting to step inside northern cottage (-350, -362)
    const entity = { x: -350, y: -362, radius: 20 };
    resolveKvetenObstacles(entity, false);
    // Entity is pushed outside the building perimeter
    const dist = Math.hypot(entity.x - (-350), entity.y - (-362));
    expect(dist).toBeGreaterThan(40);

    // Clamping to outer boundary
    const escapedEntity = { x: 3000, y: 3000, radius: 20 };
    resolveKvetenObstacles(escapedEntity, false);
    expect(escapedEntity.x).toBeLessThanOrEqual(KVETEN_ARENA_BOUNDS.maxX);
    expect(escapedEntity.y).toBeLessThanOrEqual(KVETEN_ARENA_BOUNDS.maxY);
  });

  it('blocks line of sight through solid stone walls and buildings', () => {
    // Clear sight across open village green
    expect(hasKvetenTerrainLineOfSight(0, 0, 100, 0)).toBe(true);

    // Obstructed sight straight through Hospoda (x: 462, y: -75)
    expect(hasKvetenTerrainLineOfSight(250, -75, 650, -75)).toBe(false);

    // Obstructed sight through hilltop church
    expect(hasKvetenTerrainLineOfSight(-900, -700, -650, -700)).toBe(false);
  });

  it('simulates warm open thawed water currents without winter ice floes', () => {
    // Outside water
    const landEffect = getKvetenWaterEffect(0, 0, 10);
    expect(landEffect.inOpenWater).toBe(false);

    // On wooden bridge
    const bridgeEffect = getKvetenWaterEffect(475, 420, 10);
    expect(bridgeEffect.inOpenWater).toBe(false);

    // In open warm pond
    const pondEffect = getKvetenWaterEffect(KVETEN_POIS.pond.x, KVETEN_POIS.pond.y, 10);
    expect(pondEffect.inOpenWater).toBe(true);
  });

  it('safely renders all procedural May landmark decor items without canvas stack leaks', () => {
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
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
      'kveten_border',
      'kveten_maypole',
      'kveten_shrine',
      'kveten_pasture',
      'kveten_orchard',
      'kveten_brook',
      'kveten_goat_grove',
      'kveten_elder',
      'kveten_pond',
    ];

    for (const lm of landmarks) {
      expect(() => drawKvetenMayLandmark(mockCtx, lm, 5.0, false)).not.toThrow();
    }
  });
});
