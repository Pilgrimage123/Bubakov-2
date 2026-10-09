import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderLightingMask,
  getAmbientColor,
  getOrCreateOffscreenBuffer,
  resetOffscreenBuffer,
  setOffscreenBufferForTesting,
  LIGHTING_MASK_SCALE,
} from '../src/render/lightingRenderer';
import type { LightSource } from '../src/types';

describe('Ladovský Canvas 2D Lighting Renderer (Ticket 02)', () => {
  beforeEach(() => {
    resetOffscreenBuffer();
  });

  describe('Theme Ambient Color Resolution', () => {
    it('generates correct theme ambient colors and clamps alpha', () => {
      expect(getAmbientColor(0.85, 'autumn_graveyard')).toBe('rgba(20, 16, 28, 0.85)');
      expect(getAmbientColor(0.65, 'graveyard')).toBe('rgba(20, 16, 28, 0.65)');
      expect(getAmbientColor(0.85, 'winter')).toBe('rgba(18, 28, 45, 0.85)');
      expect(getAmbientColor(0.70, 'spring_river')).toBe('rgba(18, 26, 38, 0.7)');
      expect(getAmbientColor(0.50, 'standard')).toBe('rgba(15, 23, 42, 0.5)');
      expect(getAmbientColor(0.85)).toBe('rgba(15, 23, 42, 0.85)');

      // Clamp test
      expect(getAmbientColor(1.5, 'winter')).toBe('rgba(18, 28, 45, 1)');
      expect(getAmbientColor(-0.2, 'winter')).toBe('rgba(18, 28, 45, 0)');
    });
  });

  describe('Headless Fallback & Early Return', () => {
    it('gracefully handles headless environments without DOM or OffscreenCanvas', () => {
      const mockMainCtx = {
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const lights: LightSource[] = [
        {
          id: 'lantern',
          x: 100,
          y: 100,
          radius: 150,
          color: '#FFE8A3',
          intensity: 0.9,
          kind: 'player_lantern',
        },
      ];

      // With no mock buffer injected and headless environment, should not crash
      expect(() => {
        renderLightingMask(
          mockMainCtx,
          lights,
          { x: 0, y: 0 },
          800,
          600,
          0.85,
          'standard'
        );
      }).not.toThrow();

      expect(mockMainCtx.drawImage).not.toHaveBeenCalled();
    });

    it('early returns without rendering when ambientDarkness <= 0.05 (Noon / Dawn)', () => {
      const mockOffscreenCtx = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
      };
      const mockOffscreenCanvas = {
        width: 400,
        height: 300,
      };
      setOffscreenBufferForTesting(mockOffscreenCanvas, mockOffscreenCtx);

      const mockMainCtx = {
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const lights: LightSource[] = [
        {
          id: 'lantern',
          x: 100,
          y: 100,
          radius: 150,
          color: '#FFE8A3',
          intensity: 0.9,
          kind: 'player_lantern',
        },
      ];

      // Noon (0.0) -> early return
      renderLightingMask(mockMainCtx, lights, { x: 0, y: 0 }, 800, 600, 0.0, 'standard');
      expect(mockOffscreenCtx.clearRect).not.toHaveBeenCalled();
      expect(mockOffscreenCtx.fillRect).not.toHaveBeenCalled();
      expect(mockMainCtx.drawImage).not.toHaveBeenCalled();

      // Dawn / threshold (0.05) -> early return
      renderLightingMask(mockMainCtx, lights, { x: 0, y: 0 }, 800, 600, 0.05, 'standard');
      expect(mockOffscreenCtx.clearRect).not.toHaveBeenCalled();
      expect(mockMainCtx.drawImage).not.toHaveBeenCalled();
    });

    it('early returns when viewport dimensions are non-positive', () => {
      const mockMainCtx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D;
      renderLightingMask(mockMainCtx, [], { x: 0, y: 0 }, 0, 600, 0.85);
      renderLightingMask(mockMainCtx, [], { x: 0, y: 0 }, 800, -10, 0.85);
      expect(mockMainCtx.drawImage).not.toHaveBeenCalled();
    });
  });

  describe('Offscreen Buffer Management & Scaling', () => {
    it('allocates and resizes offscreen buffer to 0.5x resolution', () => {
      const mockOffscreenCtx = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
      };
      const mockOffscreenCanvas = {
        width: 100,
        height: 100,
      };
      setOffscreenBufferForTesting(mockOffscreenCanvas, mockOffscreenCtx);

      const buffer = getOrCreateOffscreenBuffer(1200, 800);
      expect(buffer).not.toBeNull();
      expect(buffer?.canvas.width).toBe(Math.ceil(1200 * LIGHTING_MASK_SCALE));
      expect(buffer?.canvas.height).toBe(Math.ceil(800 * LIGHTING_MASK_SCALE));
      expect(buffer?.canvas.width).toBe(600);
      expect(buffer?.canvas.height).toBe(400);

      // Reusing with same dimensions does not change width/height
      const buffer2 = getOrCreateOffscreenBuffer(1200, 800);
      expect(buffer2?.canvas.width).toBe(600);
      expect(buffer2?.canvas.height).toBe(400);

      // Changing viewport dimensions resizes the existing buffer
      const buffer3 = getOrCreateOffscreenBuffer(1600, 900);
      expect(buffer3?.canvas.width).toBe(800);
      expect(buffer3?.canvas.height).toBe(450);
    });
  });

  describe('Mask Rendering & Stepped Cel-rings', () => {
    function createMockCanvas() {
      const addedColorStops: Array<{ offset: number; color: string }> = [];
      const gradient = {
        addColorStop: vi.fn((offset: number, color: string) => {
          addedColorStops.push({ offset, color });
        }),
      };

      const offscreenCtx = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        createRadialGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalCompositeOperation: 'source-over',
      };

      const offscreenCanvas = {
        width: 400,
        height: 300,
      };

      const mainCtx = {
        drawImage: vi.fn(),
        getTransform: vi.fn(() => null),
      } as unknown as CanvasRenderingContext2D;

      return { offscreenCanvas, offscreenCtx, mainCtx, gradient, addedColorStops };
    }

    it('executes full regular lighting pass with destination-out and stepped cel-rings', () => {
      const { offscreenCanvas, offscreenCtx, mainCtx, addedColorStops } = createMockCanvas();
      setOffscreenBufferForTesting(offscreenCanvas, offscreenCtx);

      const lights: LightSource[] = [
        {
          id: 'lantern',
          x: 200,
          y: 200,
          radius: 100,
          color: '#FFE8A3',
          intensity: 0.9,
          kind: 'player_lantern',
        },
      ];

      renderLightingMask(
        mainCtx,
        lights,
        { x: 0, y: 0 },
        800,
        600,
        0.85,
        'autumn_graveyard'
      );

      // 1. Cleared
      expect(offscreenCtx.clearRect).toHaveBeenCalledWith(0, 0, 400, 300);

      // 2. Filled with ambient darkness
      expect(offscreenCtx.fillRect).toHaveBeenCalledWith(0, 0, 400, 300);

      // 3. Radial gradient created for light cutout
      expect(offscreenCtx.createRadialGradient).toHaveBeenCalled();

      // Check stepped gradient stops (0, 0.45, 0.451, 0.75, 0.751, 0.999, 1.0)
      const offsets = addedColorStops.map((s) => s.offset);
      expect(offsets).toContain(0);
      expect(offsets).toContain(0.45);
      expect(offsets).toContain(0.75);
      expect(offsets).toContain(1.0);

      // Check destination-out cutout was drawn
      expect(offscreenCtx.arc).toHaveBeenCalled();
      expect(offscreenCtx.fill).toHaveBeenCalled();

      // Check globalCompositeOperation was reset to source-over
      expect(offscreenCtx.globalCompositeOperation).toBe('source-over');

      // Check main canvas blit
      expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0, 800, 600);
    });

    it('renders simplified single-pass circles when isPerformanceMode is enabled', () => {
      const { offscreenCanvas, offscreenCtx, mainCtx } = createMockCanvas();
      setOffscreenBufferForTesting(offscreenCanvas, offscreenCtx);

      const lights: LightSource[] = [
        {
          id: 'lantern',
          x: 200,
          y: 200,
          radius: 100,
          color: '#FFE8A3',
          intensity: 0.9,
          kind: 'player_lantern',
        },
      ];

      renderLightingMask(
        mainCtx,
        lights,
        { x: 0, y: 0 },
        800,
        600,
        0.85,
        'autumn_graveyard',
        true // isPerformanceMode
      );

      // In performance mode, createRadialGradient is NOT used for cutout or halo
      expect(offscreenCtx.createRadialGradient).not.toHaveBeenCalled();

      // But the circle cutout arc is still drawn
      expect(offscreenCtx.beginPath).toHaveBeenCalled();
      expect(offscreenCtx.arc).toHaveBeenCalled();
      expect(offscreenCtx.fill).toHaveBeenCalled();

      // Main canvas receives drawImage
      expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0, 800, 600);
    });

    it('culls offscreen lights that do not intersect the camera viewport', () => {
      const { offscreenCanvas, offscreenCtx, mainCtx } = createMockCanvas();
      setOffscreenBufferForTesting(offscreenCanvas, offscreenCtx);

      const lights: LightSource[] = [
        {
          id: 'far_lantern',
          x: 5000, // Very far outside viewport
          y: 5000,
          radius: 100,
          color: '#FFE8A3',
          intensity: 0.9,
          kind: 'player_lantern',
        },
      ];

      renderLightingMask(
        mainCtx,
        lights,
        { x: 0, y: 0 },
        800,
        600,
        0.85,
        'standard'
      );

      // Radial gradient and arc should not be called because light is culled
      expect(offscreenCtx.createRadialGradient).not.toHaveBeenCalled();
      expect(offscreenCtx.arc).not.toHaveBeenCalled();

      // Ambient mask is still drawn to main canvas
      expect(mainCtx.drawImage).toHaveBeenCalledWith(offscreenCanvas, 0, 0, 800, 600);
    });

    it('aligns destination coordinates when main canvas is translated by camera', () => {
      const { offscreenCanvas, offscreenCtx, mainCtx } = createMockCanvas();
      setOffscreenBufferForTesting(offscreenCanvas, offscreenCtx);

      const cam = { x: 350, y: 450 };

      // Mock context where ctx.translate(-cam.x, -cam.y) was previously called
      (mainCtx.getTransform as any) = vi.fn(() => ({
        e: -cam.x,
        f: -cam.y,
      }));

      renderLightingMask(
        mainCtx,
        [],
        cam,
        800,
        600,
        0.85,
        'winter'
      );

      // Should blit at (cam.x, cam.y) so that (-cam.x, -cam.y) translates to (0, 0)
      expect(mainCtx.drawImage).toHaveBeenCalledWith(
        offscreenCanvas,
        cam.x,
        cam.y,
        800,
        600
      );
    });
  });
});
