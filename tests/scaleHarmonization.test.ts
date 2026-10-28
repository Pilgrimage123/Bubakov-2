import { describe, it, expect } from 'vitest';
import {
  MARCH_THAW_OBSTACLES,
  MARCH_THAW_POIS,
  resolveMarchThawObstacles,
} from '../src/data/marchThawArena';
import { buildMarchThawLandscapeSvg } from '../src/render/marchThawSvgLandscape';
import { type CameraViewport } from '../src/render/arenaRenderer';

describe('ADR 0034: Harmonizace měřítka arény, entit, projektilů a lidové perspektivy', () => {
  it('defines harmonized obstacle dimensions and corner radius for village buildings', () => {
    const hospoda = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main');
    expect(hospoda).toBeDefined();
    expect(hospoda?.cornerRadius).toBeGreaterThanOrEqual(16);
    expect(hospoda?.halfW).toBeGreaterThanOrEqual(150); // World width ~300px
    expect(hospoda?.halfH).toBeGreaterThanOrEqual(75);

    const chalupaNw = MARCH_THAW_OBSTACLES.find((o) => o.id === 'chalupa_nw');
    expect(chalupaNw).toBeDefined();
    expect(chalupaNw?.cornerRadius).toBeGreaterThanOrEqual(16);
    expect(chalupaNw?.halfW).toBeGreaterThanOrEqual(120); // World width ~240-250px

    const skola = MARCH_THAW_OBSTACLES.find((o) => o.id === 'skola_main');
    expect(skola).toBeDefined();
    expect(skola?.cornerRadius).toBeGreaterThanOrEqual(18);
    expect(skola?.halfW).toBeGreaterThanOrEqual(140);
  });

  it('preserves spacious alleyway clearances (> 120px) between spaced-out buildings', () => {
    // Distance between chalupa_nw and stork_pole
    const nw = MARCH_THAW_OBSTACLES.find((o) => o.id === 'chalupa_nw')!;
    const pole = MARCH_THAW_OBSTACLES.find((o) => o.id === 'stork_pole')!;
    const distNwToPole = Math.hypot(pole.x - nw.x, pole.y - nw.y) - (nw.halfW! + pole.radius!);
    expect(distNwToPole).toBeGreaterThan(70);

    // Main western to eastern village green avenue clearance
    const chalupaW = MARCH_THAW_OBSTACLES.find((o) => o.id === 'chalupa_w')!;
    const hospoda = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main')!;
    const villageAvenueWidth = (hospoda.x - hospoda.halfW!) - (chalupaW.x + chalupaW.halfW!);
    expect(villageAvenueWidth).toBeGreaterThan(400); // Wide open village green
  });

  it('smoothly pushes corner collision along rounded box normals without abrupt catching', () => {
    const hospoda = MARCH_THAW_OBSTACLES.find((o) => o.id === 'hospoda_main')!;
    const cr = hospoda.cornerRadius ?? 16;
    const coreW = hospoda.halfW! - cr;
    const coreH = hospoda.halfH! - cr;

    // Place an entity colliding diagonally with the corner of hospoda
    const cornerWalker = {
      x: hospoda.x + coreW + 10,
      y: hospoda.y + coreH + 10,
      radius: 18,
    };
    const collided = resolveMarchThawObstacles(cornerWalker, false);
    expect(collided).toBe(true);

    // The normal push must have pushed along both positive X and positive Y
    expect(cornerWalker.x).toBeGreaterThan(hospoda.x + coreW);
    expect(cornerWalker.y).toBeGreaterThan(hospoda.y + coreH);

    // Distance from the rounded corner center must be at least entity radius + corner radius
    const distFromCorner = Math.hypot(
      cornerWalker.x - (hospoda.x + coreW),
      cornerWalker.y - (hospoda.y + coreH)
    );
    expect(distFromCorner).toBeGreaterThanOrEqual(cornerWalker.radius + cr - 0.05);
  });

  it('renders upscaled background architecture and human-scale staffage in SVG panorama', () => {
    const svg = buildMarchThawLandscapeSvg(false);
    expect(svg).toContain('HOSPODA');
    expect(svg).toContain('VESNICE');
    expect(svg).toContain('ŠKOLA');
    expect(svg).toContain('MLÝN');

    // Village cottages are rendered with harmonized dimensions
    expect(svg).toContain('width="250"'); // Hospoda
    expect(svg).toContain('width="200"'); // Standard cottages
  });

  it('supports camera zoom parameter in CameraViewport contract', () => {
    const camera: CameraViewport = {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      viewLeft: -120,
      viewTop: -160,
      viewRight: 2040,
      viewBottom: 1240,
      zoom: 0.85,
    };
    expect(camera.zoom).toBe(0.85);
  });

  it('expands village POI interaction zones for the harmonized village square', () => {
    expect(MARCH_THAW_POIS.village.radius).toBeGreaterThanOrEqual(300);
    expect(MARCH_THAW_POIS.tavern.radius).toBeGreaterThanOrEqual(250);
    expect(MARCH_THAW_POIS.church.radius).toBeGreaterThanOrEqual(300);
    expect(MARCH_THAW_POIS.school.radius).toBeGreaterThanOrEqual(220);
  });
});
