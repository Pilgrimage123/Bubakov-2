/**
 * Sprite-Baking Pilot for Common Bubáks
 *
 * Pre-renders key animation frames of high-frequency mobs (rarach, mysak, bludicka)
 * into offscreen bitmap canvases, enabling fast blitting via ctx.drawImage in
 * performance-constrained scenarios without losing authentic Josef Lada styling.
 *
 * Plan: docs/plans/arena-performance-implementation-plan.md (Section 6)
 */

import { Lada } from './ladaRenderer';

export type BakedBubakId = 'rarach' | 'mysak' | 'bludicka';

export interface BakedFrame {
  canvas: any;
  ctx: any;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export class BakedBubakAtlas {
  private frames: Map<string, BakedFrame> = new Map();
  private initialized = false;
  private readonly frameSteps = 4; // 4 discrete animation phases

  public init(): void {
    if (this.initialized) return;

    const pilotMobs: BakedBubakId[] = ['rarach', 'mysak', 'bludicka'];
    const canvasSize = 96;
    const originX = 48;
    const originY = 48;

    for (const mobId of pilotMobs) {
      for (let step = 0; step < this.frameSteps; step++) {
        const animTime = (step / this.frameSteps) * 2;
        const { canvas, ctx } = this.createFrameCanvas(canvasSize, canvasSize);

        ctx.save();
        ctx.translate(originX, originY);

        if (mobId === 'rarach') {
          Lada.drawRarach(ctx, 0, 0, animTime, 1, false);
        } else if (mobId === 'mysak') {
          Lada.drawMysak(ctx, 0, 0, animTime, 1, false);
        } else if (mobId === 'bludicka') {
          Lada.drawBludicka(ctx, 0, 0, animTime, 1, false);
        }

        ctx.restore();

        const key = `${mobId}_${step}`;
        this.frames.set(key, {
          canvas,
          ctx,
          width: canvasSize,
          height: canvasSize,
          originX,
          originY,
        });
      }
    }

    this.initialized = true;
  }

  private createFrameCanvas(width: number, height: number): { canvas: any; ctx: any } {
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      return { canvas, ctx };
    }

    // Vitest / Node headless fallback
    const ctx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      setTransform: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: (text: string) => ({ width: text.length * 8 }),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      globalAlpha: 1,
      font: '',
    };
    const canvas = { width, height, getContext: () => ctx };
    return { canvas, ctx };
  }

  public getFrame(mobId: BakedBubakId, animTime: number): BakedFrame | undefined {
    if (!this.initialized) this.init();
    // Normalize animTime into one of 4 steps
    const step = Math.floor(Math.abs(animTime * 2) % this.frameSteps);
    return this.frames.get(`${mobId}_${step}`);
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    mobId: BakedBubakId,
    x: number,
    y: number,
    animTime: number
  ): boolean {
    const frame = this.getFrame(mobId, animTime);
    if (!frame) return false;

    ctx.drawImage(
      frame.canvas,
      Math.round(x - frame.originX),
      Math.round(y - frame.originY)
    );
    return true;
  }
}

let globalBakedBubakAtlas: BakedBubakAtlas | null = null;

export function getGlobalBakedBubakAtlas(): BakedBubakAtlas {
  if (!globalBakedBubakAtlas) {
    globalBakedBubakAtlas = new BakedBubakAtlas();
    globalBakedBubakAtlas.init();
  }
  return globalBakedBubakAtlas;
}
