import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderArena,
  type CameraViewport,
  type ArenaRenderMetrics,
  createReusableRenderMetrics,
} from '../src/render/arenaRenderer';
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
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    canvas: { width: 1280, height: 720 },
    fillStyle: '#000',
    strokeStyle: '#000',
  } as unknown as CanvasRenderingContext2D;
}

describe('Zero-Allocation Entity Pipeline (Ticket #30)', () => {
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

  it('correctly sorts entities by Y coordinate for authentic isometric depth', () => {
    const drawOrder: string[] = [];

    engine.enemies = [
      { id: 'bottom', x: 0, y: 200, radius: 20, isDefeated: false, dead: false, draw: () => drawOrder.push('bottom') } as any,
      { id: 'top', x: 0, y: -100, radius: 20, isDefeated: false, dead: false, draw: () => drawOrder.push('top') } as any,
      { id: 'middle', x: 0, y: 50, radius: 20, isDefeated: false, dead: false, draw: () => drawOrder.push('middle') } as any,
    ];

    renderArena(ctx, engine, camera);

    expect(drawOrder).toEqual(['top', 'middle', 'bottom']);
  });

  it('runs 100 consecutive frames without invoking Array.prototype.sort or creating temporary sorting arrays', () => {
    const sortSpy = vi.spyOn(Array.prototype, 'sort');

    // Create 40 enemies
    engine.enemies = [];
    for (let i = 0; i < 40; i++) {
      engine.enemies.push({
        id: `foe_${i}`,
        x: (i * 25) % 500 - 250,
        y: (i * 37) % 500 - 250,
        radius: 20,
        isDefeated: false,
        dead: false,
        draw: () => {},
      } as any);
    }

    const reusableMetrics = createReusableRenderMetrics();

    for (let frame = 0; frame < 100; frame++) {
      // Jiggle positions slightly
      for (const e of engine.enemies) {
        e.y += (frame % 2 === 0 ? 1 : -1);
      }
      renderArena(ctx, engine, camera, {}, reusableMetrics);
    }

    // Zero-allocation invariant: native Array.sort was never invoked
    expect(sortSpy).not.toHaveBeenCalled();

    sortSpy.mockRestore();
  });

  it('safely handles entity counts exceeding buffer capacity without crashing', () => {
    engine.enemies = [];
    for (let i = 0; i < 2500; i++) {
      engine.enemies.push({
        id: `foe_${i}`,
        x: 0,
        y: i,
        radius: 10,
        isDefeated: false,
        dead: false,
        draw: () => {},
      } as any);
    }

    const metrics = renderArena(ctx, engine, camera);
    expect(metrics.renderedEntities).toBeGreaterThan(0);
    expect(metrics.renderedEntities).toBeLessThanOrEqual(2048);
  });

  it('mutates reusable metrics object when provided instead of allocating new objects', () => {
    const reusableMetrics = createReusableRenderMetrics();
    const result = renderArena(ctx, engine, camera, {}, reusableMetrics);

    expect(result).toBe(reusableMetrics);
    expect(reusableMetrics.timings.totalMs).toBeGreaterThanOrEqual(0);
  });
});
