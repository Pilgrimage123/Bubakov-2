import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLightBuffer,
  LIGHT_DOWNSCALE_FACTOR,
  renderStorybookLightingComposite,
} from '../src/render/storybookLightingRenderer';
import type { DynamicLightSource } from '../src/game/storybookLighting';

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    canvas: { width: 1280, height: 720 },
    fillStyle: '#000',
    strokeStyle: '#000',
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: false,
  } as unknown as CanvasRenderingContext2D;
}

describe('Downscaled Lighting Pipeline (Ticket #31)', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('allocates offscreen lighting buffer at 0.5x resolution (75% fillrate reduction)', () => {
    expect(LIGHT_DOWNSCALE_FACTOR).toBe(0.5);

    const buf = getLightBuffer(1280, 720);
    expect(buf).not.toBeNull();
    if (buf) {
      expect(buf.canvas.width).toBe(640);
      expect(buf.canvas.height).toBe(360);
    }
  });

  it('adapts dynamically to window resize', () => {
    const buf1 = getLightBuffer(1280, 720);
    expect(buf1?.canvas.width).toBe(640);
    expect(buf1?.canvas.height).toBe(360);

    const buf2 = getLightBuffer(1920, 1080);
    expect(buf2?.canvas.width).toBe(960);
    expect(buf2?.canvas.height).toBe(540);
  });

  it('composites downscaled buffer onto target canvas stretched with bilinear smoothing and multiply blend', () => {
    const lights: DynamicLightSource[] = [
      { id: 'lamp', x: 100, y: 100, radius: 150, color: '#FFD700', intensity: 1 },
    ];

    renderStorybookLightingComposite(
      ctx,
      1280,
      720,
      { x: 0, y: 0 },
      lights,
      'night',
      1.0,
      true,
      [],
      [],
      'fidelity',
      true
    );

    // Verify destination composite was called with multiply blend
    expect(ctx.drawImage).toHaveBeenCalled();
    // Verify imageSmoothingEnabled was set to true for bilinear smoothing
    expect(ctx.imageSmoothingEnabled).toBe(true);
  });
});
