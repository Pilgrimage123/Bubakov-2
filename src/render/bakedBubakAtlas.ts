/**
 * Sprite-Baking Atlas for Common Bubáks (Atlas běžných strašidel)
 *
 * Pre-renders key animation frames of high-frequency wave mobs into offscreen
 * bitmap canvases, enabling fast blitting via ctx.drawImage in real gameplay
 * without losing authentic Josef Lada styling.
 *
 * ADR 0017, ADR 0029
 */

import { Lada } from './ladaRenderer';

export type BakedBubakId =
  | 'rarach'
  | 'mysak'
  | 'bludicka'
  | 'hejkal'
  | 'divozenka'
  | 'certik'
  | 'skeleton'
  | 'kostlivec'
  | 'vrana'
  | 'zmrzlik'
  | 'tajici_snehulak'
  | 'vodnicek'
  | 'skodnik'
  | 'topivec';

export interface BakedFrame {
  canvas: any;
  ctx: any;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

interface MobConfig {
  size: number;
  drawFn: (ctx: any, x: number, y: number, time: number, vx: number, panicked: boolean) => void;
}

export class BakedBubakAtlas {
  private frames: Map<string, BakedFrame> = new Map();
  private initialized = false;
  private readonly frameSteps = 12; // 12 evenly spaced walk-cycle phases (~23 FPS playback, zero aliasing)

  public init(): void {
    if (this.initialized) return;

    const mobConfigs: Record<BakedBubakId, MobConfig> = {
      rarach: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawRarach(c, x, y, t, v, p) },
      mysak: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawMysak(c, x, y, t, v, p) },
      bludicka: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawBludicka(c, x, y, t, v, p) },
      hejkal: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHejkal(c, x, y, t, v, p) },
      divozenka: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawDivozenka(c, x, y, t, v, p) },
      certik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawCertik(c, x, y, t, v, p) },
      skeleton: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawSkeleton(c, x, y, t, v, p) },
      kostlivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawSkeleton(c, x, y, t, v, p) },
      vrana: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawStageCrow(c, x, y, t, v, p) },
      zmrzlik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawZmrzlik(c, x, y, t, v, p) },
      tajici_snehulak: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawMeltingSnowman(c, x, y, t, v, p) },
      vodnicek: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawVodnicek(c, x, y, t, v, p) },
      skodnik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawSkodnik(c, x, y, t, v, p) },
      topivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawTopivec(c, x, y, t, v, p) },
    };

    const mobIds = Object.keys(mobConfigs) as BakedBubakId[];

    for (let m = 0; m < mobIds.length; m++) {
      const mobId = mobIds[m];
      const cfg = mobConfigs[mobId];
      const canvasSize = cfg.size;
      const originX = canvasSize / 2;
      const originY = canvasSize / 2;

      // Pre-bake both normal and panicked states across discrete animation steps of a full walk cycle
      for (const panicked of [false, true]) {
        const cyclePeriod = (Math.PI * 2) / (panicked ? 20 : 12);
        for (let step = 0; step < this.frameSteps; step++) {
          const animTime = (step / this.frameSteps) * cyclePeriod;
          const { canvas, ctx } = this.createFrameCanvas(canvasSize, canvasSize);

          ctx.save();
          ctx.translate(originX, originY);
          cfg.drawFn(ctx, 0, 0, animTime, 1, panicked);
          ctx.restore();

          // Standard key
          const key = `${mobId}_${step}_${panicked ? 1 : 0}`;
          this.frames.set(key, {
            canvas,
            ctx,
            width: canvasSize,
            height: canvasSize,
            originX,
            originY,
          });

          // Also set legacy key for backward compatibility with pilot tests
          if (!panicked) {
            this.frames.set(`${mobId}_${step}`, {
              canvas,
              ctx,
              width: canvasSize,
              height: canvasSize,
              originX,
              originY,
            });
          }
        }
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

  public getFrame(mobId: string, animTime: number, panicked = false): BakedFrame | undefined {
    if (!this.initialized) this.init();
    const resolvedId = mobId === 'skeleton' ? 'kostlivec' : mobId;
    const cyclePeriod = (Math.PI * 2) / (panicked ? 20 : 12);
    const step = Math.floor(((Math.abs(animTime) / cyclePeriod) * this.frameSteps) % this.frameSteps);
    return (
      this.frames.get(`${resolvedId}_${step}_${panicked ? 1 : 0}`) ||
      this.frames.get(`${resolvedId}_${step}`) ||
      this.frames.get(`${mobId}_${step}_${panicked ? 1 : 0}`) ||
      this.frames.get(`${mobId}_${step}`)
    );
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    mobId: string,
    x: number,
    y: number,
    animTime: number,
    vx = 1,
    panicked = false
  ): boolean {
    const frame = this.getFrame(mobId, animTime, panicked);
    if (!frame || typeof ctx.drawImage !== 'function') return false;

    if (vx < 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.drawImage(frame.canvas, -frame.originX, -frame.originY);
      ctx.restore();
    } else {
      ctx.drawImage(
        frame.canvas,
        Math.round(x - frame.originX),
        Math.round(y - frame.originY)
      );
    }
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

export function resetGlobalBakedBubakAtlas(): void {
  globalBakedBubakAtlas = null;
}
