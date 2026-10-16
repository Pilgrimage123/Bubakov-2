import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderArena, type CameraViewport, type ArenaRenderOptions } from '../src/render/arenaRenderer';
import { createInitialEngineState } from '../src/game/engineState';
import type { EngineState } from '../src/game/engineState';

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
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
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(),
    canvas: { width: 1280, height: 720 },
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    font: '16px sans-serif',
  } as unknown as CanvasRenderingContext2D;
}

describe('Arena Renderer Seam & Performance Pipeline (Ticket #28)', () => {
  let ctx: CanvasRenderingContext2D;
  let engine: EngineState;
  let camera: CameraViewport;

  beforeEach(() => {
    ctx = createMockContext();
    engine = createInitialEngineState();
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

  it('renders arena without throwing errors on default engine state', () => {
    const metrics = renderArena(ctx, engine, camera);
    expect(metrics).toBeDefined();
    expect(metrics.renderedEntities).toBe(0);
    expect(metrics.timings.totalMs).toBeGreaterThanOrEqual(0);
  });

  it('implements frustum culling: only entities within camera viewport are rendered', () => {
    const drawInside = vi.fn();
    const drawOutside = vi.fn();

    engine.enemies = [
      { id: 'inside_1', x: 0, y: 0, radius: 20, isDefeated: false, dead: false, draw: drawInside } as any,
      { id: 'inside_2', x: 200, y: 150, radius: 25, isDefeated: false, dead: false, draw: drawInside } as any,
      { id: 'outside_1', x: 2000, y: 3000, radius: 20, isDefeated: false, dead: false, draw: drawOutside } as any,
      { id: 'outside_2', x: -1500, y: 0, radius: 20, isDefeated: false, dead: false, draw: drawOutside } as any,
    ];

    const metrics = renderArena(ctx, engine, camera);

    expect(drawInside).toHaveBeenCalledTimes(2);
    expect(drawOutside).not.toHaveBeenCalled();
    expect(metrics.renderedEntities).toBe(2);
  });

  it('implements frustum culling for decor items', () => {
    const drawDecorInside = vi.fn();
    const drawDecorOutside = vi.fn();

    engine.decor = [
      { x: 50, y: 50, scale: 1, type: 'tree', draw: drawDecorInside } as any,
      { x: 1000, y: 1000, scale: 1, type: 'tree', draw: drawDecorOutside } as any,
    ];

    const metrics = renderArena(ctx, engine, camera);

    expect(drawDecorInside).toHaveBeenCalled();
    expect(drawDecorOutside).not.toHaveBeenCalled();
    expect(metrics.renderedDecor).toBe(1);
  });

  it('measures timing metrics across rendering phases', () => {
    const metrics = renderArena(ctx, engine, camera);

    expect(metrics.timings).toBeDefined();
    expect(typeof metrics.timings.backdropMs).toBe('number');
    expect(typeof metrics.timings.staticDecorMs).toBe('number');
    expect(typeof metrics.timings.entitiesMs).toBe('number');
    expect(typeof metrics.timings.lightingMs).toBe('number');
    expect(typeof metrics.timings.combatTextsMs).toBe('number');
    expect(typeof metrics.timings.totalMs).toBe('number');
  });

  it('respects optional toggle flags to skip passes (lighting, VFX, damage texts)', () => {
    const drawText = vi.fn();
    engine.texts = [
      { x: 10, y: 10, size: 18, category: 'normal_damage', text: '50', draw: drawText } as any,
    ];

    const options: ArenaRenderOptions = {
      lightingEnabled: false,
      damageNumbersEnabled: false,
    };

    const metrics = renderArena(ctx, engine, camera, options);

    expect(drawText).not.toHaveBeenCalled();
    expect(metrics.timings.lightingMs).toBe(0);
    expect(metrics.timings.combatTextsMs).toBe(0);
  });
});
