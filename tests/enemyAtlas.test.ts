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

  it('draws with pre-flipped left-facing canvas when moving left (vx < 0) without per-frame save/scale/restore overhead', () => {
    const frame = atlas.getFrame('rarach', 0.2, false);
    expect(frame).toBeDefined();
    expect(frame?.flippedCanvas).toBeDefined();
    expect(frame?.flippedCanvas).not.toBe(frame?.canvas);

    const drawn = atlas.draw(ctx, 'rarach', 100, 150, 0.2, -1, false);
    expect(drawn).toBe(true);
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.scale).not.toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalledWith(
      frame?.flippedCanvas,
      100 - (frame?.originX ?? 48),
      150 - (frame?.originY ?? 48)
    );
    expect(ctx.restore).not.toHaveBeenCalled();
  });

  it('draws without transform overhead when moving right (vx >= 0)', () => {
    const drawn = atlas.draw(ctx, 'rarach', 100, 150, 0.2, 1, false);
    expect(drawn).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it('integrates into drawEnemyRenderer: walking mobs use atlas, skipping procedural vector commands', () => {
    // Ensure rarach is lazily baked before attaching spy so baking passes are not counted
    getGlobalBakedBubakAtlas().ensureMobBaked('rarach');
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

  it('bakes 112x112 flying crow (vrana) frames and applies individual phase offsets to flock members', () => {
    const crowFrame0 = atlas.getFrame('vrana', 0, false);
    expect(crowFrame0).toBeDefined();
    expect(crowFrame0?.width).toBe(112);
    expect(crowFrame0?.height).toBe(112);

    const flockCrowA = { id: 'vrana', flockIndex: 0, isMinibossFlockMember: true };
    const flockCrowB = { id: 'vrana', flockIndex: 2, isMinibossFlockMember: true };

    drawEnemyRenderer('drawStageCrow', ctx, 100, 100, 0.1, 1, false, flockCrowA);
    drawEnemyRenderer('drawStageCrow', ctx, 140, 100, 0.1, 1, false, flockCrowB);

    const calls = (ctx.drawImage as any).mock.calls;
    expect(calls.length).toBe(2);
    // Different flock indices should sample different wing-flap frames at the same game time
    expect(calls[0][0]).not.toBe(calls[1][0]);
  });
});
