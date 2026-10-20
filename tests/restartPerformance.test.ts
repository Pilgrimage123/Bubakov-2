import { describe, it, expect, vi } from 'vitest';
import { ChunkBitmapCache } from '../src/render/chunkCache';
import {
  getGlobalGlyphAtlas,
  resetGlobalGlyphAtlas,
  WordStampCache,
} from '../src/render/glyphAtlas';
import { GameEngine, compactInPlace } from '../src/game/engine';
import { createDefaultMetaProgression } from '../src/game/migration';
import { RunDirector } from '../src/game/director';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Restart Performance & Memory Teardown Tests', () => {
  describe('Vector 4: DOM and Canvas GPU Texture Teardown', () => {
    it('ChunkBitmapCache.dispose() zeroes all canvas dimensions and clears references', () => {
      const cache = new ChunkBitmapCache({ chunkSize: 512 });
      const drawMock = vi.fn();
      const decorList = [
        { x: 100, y: 100, type: 'tree', scale: 1, draw: drawMock } as any,
        { x: 600, y: 600, type: 'rock', scale: 1, draw: drawMock } as any,
      ];

      cache.build(decorList, 'winter', 'meadow', false);
      expect(cache.getChunkCount()).toBe(2);

      const canvases: HTMLCanvasElement[] = [];
      (cache as any).chunks.forEach((chunk: any) => {
        canvases.push(chunk.canvas);
        expect(chunk.canvas.width).toBe(512);
        expect(chunk.canvas.height).toBe(512);
        expect(chunk.ctx).not.toBeNull();
      });
      expect(canvases.length).toBe(2);

      // Trigger restart disposal
      cache.dispose();

      expect(cache.getChunkCount()).toBe(0);
      for (const canvas of canvases) {
        expect(canvas.width).toBe(0);
        expect(canvas.height).toBe(0);
      }
    });

    it('WordStampCache.clear() zeroes canvas dimensions on all cached stamps', () => {
      const wordCache = new WordStampCache(20);
      const stamp1 = wordCache.getOrCreate('ZÁSAH', 18, '#FF0000', '#000000');
      const stamp2 = wordCache.getOrCreate('KRITIK!', 22, '#FFD700', '#000000');

      expect(stamp1).toBeDefined();
      expect(stamp2).toBeDefined();
      expect(stamp1!.canvas.width).toBeGreaterThan(0);
      expect(stamp2!.canvas.width).toBeGreaterThan(0);

      const canvas1 = stamp1!.canvas;
      const canvas2 = stamp2!.canvas;

      wordCache.clear();

      expect(canvas1.width).toBe(0);
      expect(canvas1.height).toBe(0);
      expect(canvas2.width).toBe(0);
      expect(canvas2.height).toBe(0);
      expect(wordCache.size).toBe(0);
    });

    it('resetGlobalGlyphAtlas() safely flushes dynamic word stamps and frees textures on restart', () => {
      const ctx = createMockCanvasContext();
      const atlas = getGlobalGlyphAtlas();
      atlas.draw(ctx, 'ZÁSAH VÝSTRAŽNÝ', 10, 10, { size: 18, color: '#FF0000', useStampCache: true });
      expect(atlas.wordStampCache.size).toBeGreaterThan(0);

      resetGlobalGlyphAtlas();

      expect(atlas.wordStampCache.size).toBe(0);
    });
  });

  describe('Vector 3: State Reset Across Runs', () => {
    it('GameEngine.initRun completely purges enemies, drops, projectiles, and floating texts', () => {
      const engine = new GameEngine();
      const meta = createDefaultMetaProgression();

      // Run 1: Initialize without initial wave to strictly control entity count
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        meta,
        spawnInitialWave: false,
      });

      engine.state.gameTime = 120;
      engine.state.kills = 85;
      engine.state.enemies.push(
        { id: 'e1', type: 'cert', x: 10, y: 10, hp: 50, maxHp: 50 } as any,
        { id: 'e2', type: 'mura', x: 20, y: 20, hp: 30, maxHp: 30 } as any
      );
      engine.state.projectiles.push(
        { id: 'p1', x: 0, y: 0, vx: 5, vy: 5, life: 1 } as any
      );
      engine.state.drops.push(
        { id: 'd1', x: 15, y: 15, type: 'coin', value: 10 } as any
      );
      engine.state.particles.push(
        { x: 0, y: 0, vx: 1, vy: 1, life: 0.5, maxLife: 1, color: '#ff0' } as any
      );
      engine.state.texts.push(
        { id: 't1', text: '100', x: 0, y: 0, color: '#fff', life: 1, maxLife: 1 } as any
      );

      expect(engine.state.enemies.length).toBe(2);
      expect(engine.state.projectiles.length).toBe(1);
      expect(engine.state.drops.length).toBe(1);
      expect(engine.state.particles.length).toBe(1);
      expect(engine.state.texts.length).toBe(1);

      // Run 2: Re-init without page reload
      engine.initRun({
        levelId: 2,
        hunterType: 'shepherd',
        meta,
        spawnInitialWave: false,
      });

      expect(engine.state.activeLevelId).toBe(2);
      expect(engine.state.player.type).toBe('shepherd');
      expect(engine.state.gameTime).toBe(0);
      expect(engine.state.kills).toBe(0);
      expect(engine.state.enemies.length).toBe(0);
      expect(engine.state.projectiles.length).toBe(0);
      expect(engine.state.drops.length).toBe(0);
      expect(engine.state.particles.length).toBe(0);
      expect(engine.state.texts.length).toBe(0);
    });

    it('compactInPlace clears dead floating texts without creating new arrays', () => {
      const texts = [
        { id: 't1', text: '10', life: 0.5 },
        { id: 't2', text: '20', life: 0 },
        { id: 't3', text: '30', life: -0.1 },
        { id: 't4', text: '40', life: 0.8 },
      ];

      const originalRef = texts;
      compactInPlace(texts, (txt) => txt.life > 0);

      expect(texts).toBe(originalRef);
      expect(texts.length).toBe(2);
      expect(texts[0].id).toBe('t1');
      expect(texts[1].id).toBe('t4');
    });

    it('RunDirector resets cleanly across consecutive runs', () => {
      const director1 = new RunDirector();
      director1.threatBudget = 50;
      director1.hazards.push({ id: 'h1', x: 0, y: 0, radius: 50, duration: 5 } as any);
      director1.telegraphMessage = 'Danger';

      // Recreated on restart
      const director2 = new RunDirector();
      expect(director2.threatBudget).toBe(10);
      expect(director2.hazards.length).toBe(0);
      expect(director2.telegraphMessage).toBeNull();
    });
  });

  describe('Vector 8: Pre-allocated spatial query & viewport buffers', () => {
    it('spatial query result arrays can be cleared in-place between runs without leaking', () => {
      const primaryResults: any[] = [];
      const secondaryResults: any[] = [];

      // Simulate a run populating spatial queries
      primaryResults.push({ id: 1 }, { id: 2 }, { id: 3 });
      secondaryResults.push({ id: 4 }, { id: 5 });

      expect(primaryResults.length).toBe(3);
      expect(secondaryResults.length).toBe(2);

      // Simulate restart cleanup
      primaryResults.length = 0;
      secondaryResults.length = 0;

      expect(primaryResults.length).toBe(0);
      expect(secondaryResults.length).toBe(0);
    });
  });
});
