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
  | 'topivec'
  | 'plivnik'
  | 'sotek'
  | 'zaba'
  | 'kostlivec_kosa'
  | 'umrlec'
  | 'pisar'
  | 'hrobnik'
  | 'bubak'
  | 'hromotluk'
  | 'stodolnik'
  | 'cerny_pes'
  | 'hastrman'
  | 'blatouch'
  | 'meluzina'
  | 'mrazik'
  | 'severak'
  | 'vanicka'
  | 'polednice'
  | 'klekanice'
  | 'drevorubec'
  | 'ohnivy_muz'
  | 'drab'
  | 'zbojnik'
  | 'jiskrivec'
  | 'ohnivy_pes'
  | 'bila_pani'
  | 'zbrojnos'
  | 'nocni_mura'
  | 'jezinka_mraziva'
  | 'mrazivy_obr';

export interface BakedFrame {
  canvas: any;
  ctx: any;
  flippedCanvas: any;
  flippedCtx: any;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

interface MobConfig {
  size: number;
  drawFn: (ctx: any, x: number, y: number, time: number, vx: number, panicked: boolean) => void;
}

const MOB_CONFIGS: Record<BakedBubakId, MobConfig> = {
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
  plivnik: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawPlivnik(c, x, y, t, v, p) },
  sotek: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawSotek(c, x, y, t, v, p) },
  zaba: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawZaba(c, x, y, t, v, p) },
  kostlivec_kosa: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawSkeletonScythe(c, x, y, t, v, p) },
  umrlec: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawUmrlec(c, x, y, t, v, p) },
  pisar: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawPisar(c, x, y, t, v, p) },
  hrobnik: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHrobnik(c, x, y, t, v, p) },
  bubak: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawBubak(c, x, y, t, v, p) },
  hromotluk: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawHromotluk(c, x, y, t, v, p) },
  stodolnik: { size: 136, drawFn: (c, x, y, t, v, p) => Lada.drawStodolnik(c, x, y, t, v, p) },
  cerny_pes: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawCernyPes(c, x, y, t, v, p) },
  hastrman: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawHastrman(c, x, y, t, v, p) },
  blatouch: { size: 96, drawFn: (c, x, y, t, v, p) => Lada.drawBlatouch(c, x, y, t, v, p) },
  meluzina: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawMeluzina(c, x, y, t, v, p) },
  mrazik: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawMrazik(c, x, y, t, v, p) },
  severak: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawSeverak(c, x, y, t, v, p) },
  vanicka: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawVanicka(c, x, y, t, v, p) },
  polednice: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawPolednice(c, x, y, t, v, p) },
  klekanice: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawKlekanice(c, x, y, t, v, p) },
  drevorubec: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawDrevorubec(c, x, y, t, v, p) },
  ohnivy_muz: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawOhnivyMuz(c, x, y, t, v, p) },
  drab: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawDrab(c, x, y, t, v, p) },
  zbojnik: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawZbojnik(c, x, y, t, v, p) },
  jiskrivec: { size: 112, drawFn: (c, x, y, t, v, p) => Lada.drawJiskrivec(c, x, y, t, v, p) },
  ohnivy_pes: { size: 136, drawFn: (c, x, y, t, v, p) => Lada.drawOhnivyPes(c, x, y, t, v, p) },
  bila_pani: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawBilaPani(c, x, y, t, v, p) },
  zbrojnos: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawZbrojnos(c, x, y, t, v, p) },
  nocni_mura: { size: 128, drawFn: (c, x, y, t, v, p) => Lada.drawNocniMura(c, x, y, t, v, p) },
  jezinka_mraziva: { size: 144, drawFn: (c, x, y, t, v, p) => Lada.drawFrostJezinka(c, x, y, t, v, p) },
  mrazivy_obr: { size: 160, drawFn: (c, x, y, t, v, p) => Lada.drawFrostGiant(c, x, y, t, v, p) },
};

export class BakedBubakAtlas {
  private frames: Map<string, BakedFrame> = new Map();
  private bakedMobs: Set<string> = new Set();
  private initialized = false;
  private readonly frameSteps = 12; // 12 evenly spaced walk-cycle phases (~23 FPS playback, zero aliasing)

  public init(): void {
    this.initialized = true;
  }

  public ensureMobBaked(mobId: string): void {
    const resolvedId = (mobId === 'skeleton' ? 'kostlivec' : mobId) as BakedBubakId;
    if (this.bakedMobs.has(resolvedId)) return;

    const cfg = MOB_CONFIGS[resolvedId];
    if (!cfg) return;

    this.bakedMobs.add(resolvedId);
    if (resolvedId === 'kostlivec') {
      this.bakedMobs.add('skeleton');
    }

    const canvasSize = cfg.size;
    const originX = canvasSize / 2;
    const originY = canvasSize / 2;

    // Pre-bake both normal and panicked states across discrete animation steps with pre-flipped left/right canvases
    for (const panicked of [false, true]) {
      const cyclePeriod = (Math.PI * 2) / (panicked ? 20 : 12);
      for (let step = 0; step < this.frameSteps; step++) {
        const animTime = (step / this.frameSteps) * cyclePeriod;
        const { canvas, ctx } = this.createFrameCanvas(canvasSize, canvasSize);

        ctx.save();
        ctx.translate(originX, originY);
        cfg.drawFn(ctx, 0, 0, animTime, 1, panicked);
        ctx.restore();

        const { canvas: flippedCanvas, ctx: flippedCtx } = this.createFrameCanvas(canvasSize, canvasSize);
        flippedCtx.save();
        flippedCtx.translate(canvasSize, 0);
        flippedCtx.scale(-1, 1);
        flippedCtx.drawImage(canvas, 0, 0);
        flippedCtx.restore();

        const frameObj: BakedFrame = {
          canvas,
          ctx,
          flippedCanvas,
          flippedCtx,
          width: canvasSize,
          height: canvasSize,
          originX,
          originY,
        };

        // Standard key
        const key = `${resolvedId}_${step}_${panicked ? 1 : 0}`;
        this.frames.set(key, frameObj);
        if (resolvedId === 'kostlivec') {
          this.frames.set(`skeleton_${step}_${panicked ? 1 : 0}`, frameObj);
        }

        // Also set legacy key for backward compatibility with pilot tests
        if (!panicked) {
          this.frames.set(`${resolvedId}_${step}`, frameObj);
          if (resolvedId === 'kostlivec') {
            this.frames.set(`skeleton_${step}`, frameObj);
          }
        }
      }
    }
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
      arcTo: () => {},
      ellipse: () => {},
      rect: () => {},
      roundRect: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      setLineDash: () => {},
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
    if (!this.bakedMobs.has(resolvedId)) {
      this.ensureMobBaked(resolvedId);
    }
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

    const srcCanvas = vx < 0 ? (frame.flippedCanvas || frame.canvas) : frame.canvas;
    ctx.drawImage(
      srcCanvas,
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

export function resetGlobalBakedBubakAtlas(): void {
  globalBakedBubakAtlas = null;
}
