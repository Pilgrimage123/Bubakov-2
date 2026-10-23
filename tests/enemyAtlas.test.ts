import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BakedBubakAtlas, getGlobalBakedBubakAtlas } from '../src/render/bakedBubakAtlas';
import { drawEnemyRenderer, Lada } from '../src/render/ladaRenderer';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Enemy Atlas Baking & Pipeline Integration (ADR 0029)', () => {
  let atlas: BakedBubakAtlas;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    atlas = new BakedBubakAtlas();
    atlas.init();
    ctx = createMockCanvasContext();
  });

  it('bakes frames for all 12 canonical wave mobs in both normal and panicked states', () => {
    const canonicalMobs = [
      'rarach', 'mysak', 'bludicka', 'hejkal', 'divozenka',
      'certik', 'skeleton', 'vrana', 'zmrzlik', 'vodnicek',
      'skodnik', 'topivec'
    ];

    for (const mobId of canonicalMobs) {
      // Normal frame
      const normalFrame = atlas.getFrame(mobId, 0.5, false);
      expect(normalFrame, `Missing normal frame for ${mobId}`).toBeDefined();
      expect(normalFrame?.width).toBeGreaterThanOrEqual(96);

      // Panicked frame
      const panicFrame = atlas.getFrame(mobId, 0.5, true);
      expect(panicFrame, `Missing panicked frame for ${mobId}`).toBeDefined();
    }
  });

  it('draws with horizontal flip when moving left (vx < 0)', () => {
    const drawn = atlas.draw(ctx, 'rarach', 100, 150, 0.2, -1, false);
    expect(drawn).toBe(true);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws without transform overhead when moving right (vx >= 0)', () => {
    const drawn = atlas.draw(ctx, 'rarach', 100, 150, 0.2, 1, false);
    expect(drawn).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it('integrates into drawEnemyRenderer: walking mobs use atlas, skipping procedural vector commands', () => {
    // Ensure atlas is initialized before attaching spy so baking passes are not counted
    getGlobalBakedBubakAtlas().init();
    const spyDrawRarach = vi.spyOn(Lada, 'drawRarach');

    const enemy = {
      id: 'mob_1',
      x: 100,
      y: 100,
      radius: 20,
      isAttacking: false,
      windupTimer: 0,
      strikeTimer: 0,
    };

    drawEnemyRenderer('drawRarach', ctx, 100, 100, 1.0, 1, false, enemy);

    // Should have drawn via baked atlas drawImage, not calling procedural drawRarach
    expect(ctx.drawImage).toHaveBeenCalled();
    expect(spyDrawRarach).not.toHaveBeenCalled();

    spyDrawRarach.mockRestore();
  });

  it('falls back to procedural drawing when mob is actively attacking (windup / strike)', () => {
    const spyDrawRarach = vi.spyOn(Lada, 'drawRarach');

    const enemy = {
      id: 'mob_1',
      x: 100,
      y: 100,
      radius: 20,
      isAttacking: true,
      windupTimer: 0.25,
      strikeTimer: 0,
    };

    drawEnemyRenderer('drawRarach', ctx, 100, 100, 1.0, 1, false, enemy);

    // Procedural drawer must be invoked for full attack fidelity
    expect(spyDrawRarach).toHaveBeenCalled();

    spyDrawRarach.mockRestore();
  });

  it('falls back to procedural drawing during attack recovery phase (recoveryTimer > 0)', () => {
    const spyDrawRarach = vi.spyOn(Lada, 'drawRarach');

    const enemy = {
      id: 'mob_1',
      x: 100,
      y: 100,
      radius: 20,
      isAttacking: false,
      windupTimer: 0,
      strikeTimer: 0,
      recoveryTimer: 0.15,
    };

    drawEnemyRenderer('drawRarach', ctx, 100, 100, 1.0, 1, false, enemy);
    expect(spyDrawRarach).toHaveBeenCalled();

    spyDrawRarach.mockRestore();
  });

  it('advances across multiple distinct walk-cycle frames within a 0.5s stride window', () => {
    const seenCanvases = new Set<any>();
    for (let i = 0; i < 12; i++) {
      const frame = atlas.getFrame('mysak', i * 0.04, false);
      expect(frame).toBeDefined();
      seenCanvases.add(frame?.canvas);
    }
    expect(seenCanvases.size).toBeGreaterThanOrEqual(8);
  });
});
