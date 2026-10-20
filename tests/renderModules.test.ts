import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderDrops } from '../src/render/renderDrops';
import { renderProjectilesAndSlashes } from '../src/render/renderProjectiles';
import { renderParticles } from '../src/render/renderParticles';
import { renderEnemyTelegraphs } from '../src/render/renderTelegraphs';
import { renderGroundOverlays } from '../src/render/renderGroundOverlays';
import type { CameraViewport } from '../src/render/arenaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Modular Render Pipeline Layers (Milestone 3)', () => {
  let ctx: CanvasRenderingContext2D;
  let camera: CameraViewport;

  beforeEach(() => {
    ctx = createMockCanvasContext();
    camera = {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      viewLeft: -640,
      viewTop: -360,
      viewRight: 640,
      viewBottom: 360,
    };
  });

  describe('renderDrops', () => {
    it('culls drops outside camera viewport and renders only visible items', () => {
      const drops = [
        { type: 'coin', x: 0, y: 0, radius: 14, time: 0, value: 5 },
        { type: 'potion', x: 200, y: 150, radius: 14, time: 0 },
        { type: 'coin', x: 2500, y: 3000, radius: 14, time: 0, value: 1 }, // Culled
      ];

      const renderedCount = renderDrops(ctx, drops, camera);
      expect(renderedCount).toBe(2);
    });
  });

  describe('renderProjectilesAndSlashes', () => {
    it('culls projectiles and slashes outside viewport', () => {
      const projectiles = [
        { visual: 'snowball', x: 100, y: 100, radius: 12, angle: 0 },
        { visual: 'bun', x: -3000, y: 0, radius: 12, angle: 0 }, // Culled
      ];
      const slashes = [
        { style: 'thrust', x: 50, y: 50, reach: 60, angle: 0 },
        { style: 'whip', x: 4000, y: 4000, reach: 80, angle: 0 }, // Culled
      ];

      const result = renderProjectilesAndSlashes(ctx, projectiles, slashes, camera, 0);
      expect(result.renderedProjectiles).toBe(1);
      expect(result.renderedSlashes).toBe(1);
    });
  });

  describe('renderParticles', () => {
    it('batches visible particles without extra state allocations', () => {
      const particles = [
        { x: 0, y: 0, size: 4, life: 0.5, color: '#FFFFFF' },
        { x: 50, y: 50, size: 5, life: 0.8, color: '#F59E0B' },
        { x: -2000, y: -2000, size: 4, life: 0.5, color: '#FFFFFF' }, // Culled
      ];

      const renderedCount = renderParticles(ctx, particles, camera);
      expect(renderedCount).toBe(2);
      expect(ctx.arc).toHaveBeenCalledTimes(2);
    });
  });

  describe('renderGroundOverlays', () => {
    it('renders active holy circle and director hazards within camera', () => {
      const engine = {
        activeLevelId: 0,
        marchThaw: {
          beerPuddle: { x: 50, y: 50, time: 0.5 },
        },
        activeHazards: [
          { type: 'mud', x: 100, y: 100, radius: 40, duration: 2.0 },
          { type: 'frost', x: 3000, y: 3000, radius: 50, duration: 1.0 }, // Culled
        ],
        holyCircle: { active: true, x: 0, y: 0, radius: 120, life: 10 },
        sootFootprints: [
          { x: -50, y: -50, angle: 0.5 },
        ],
      };

      expect(() => renderGroundOverlays(ctx, engine, camera)).not.toThrow();
    });
  });

  describe('renderEnemyTelegraphs', () => {
    it('renders windup warning signs and stun stars with frustum culling', () => {
      const enemies = [
        { x: 0, y: 0, radius: 20, windupTimer: 0.5, attackDelay: 1.0, isDefeated: false },
        { x: 50, y: 50, radius: 20, stunTimer: 1.2, isDefeated: false },
        { x: 2500, y: 2500, radius: 20, windupTimer: 0.5, attackDelay: 1.0, isDefeated: false }, // Culled
      ];

      const count = renderEnemyTelegraphs(ctx, enemies, camera, {
        warningIndicatorsEnabled: true,
        statusIndicatorsEnabled: true,
      }, 1.0);

      expect(count).toBe(2);
    });
  });
});
