import { describe, it, expect } from 'vitest';
import {
  Lada,
  drawRusalka,
  drawBarbucha,
  drawHospodaHastrman,
  drawHospodaRusalka,
  drawHospodaKoledujiciBubak,
  drawHospodaObr,
  drawHospodaCert,
  drawHospodaBarbucha,
} from '../src/render/ladaRenderer';

function createMockCanvasContext(): { ctx: CanvasRenderingContext2D; gradientCallCount: () => number } {
  let saveDepth = 0;
  let gradientCalls = 0;
  const scales: Array<{ sx: number; sy: number }> = [];

  const ctx: any = {
    save: () => {
      saveDepth++;
    },
    restore: () => {
      saveDepth--;
    },
    translate: () => {},
    rotate: () => {},
    scale: (sx: number, sy: number) => {
      scales.push({ sx, sy });
    },
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
    createLinearGradient: () => {
      gradientCalls++;
      return { addColorStop: () => {} };
    },
    createRadialGradient: () => {
      gradientCalls++;
      return { addColorStop: () => {} };
    },
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
    textAlign: 'center',
    textBaseline: 'middle',
    getSaveDepth: () => saveDepth,
    getScales: () => scales,
  };

  return { ctx: ctx as CanvasRenderingContext2D, gradientCallCount: () => gradientCalls };
}

describe('ADR 0051 & Showcase: Hospodský figurální kánon 6 bossů', () => {
  const showcaseBosses = [
    {
      name: 'Hastrman',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        Lada.drawHastrman(ctx, 100, 100, 1.5, vx, false, attackInfo),
    },
    {
      name: 'Rusalka',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawRusalka(ctx, 100, 100, 1.5, vx, false, 1, attackInfo),
    },
    {
      name: 'Koledující Bubák',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        Lada.drawKoledujiciBubak(ctx, 100, 100, 1.5, vx, false, attackInfo),
    },
    {
      name: 'Obr',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        Lada.drawObr(ctx, 100, 100, 1.5, vx, false, attackInfo),
    },
    {
      name: 'Čert',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        Lada.drawCert(ctx, 100, 100, 1.5, vx, false, true, false, attackInfo),
    },
    {
      name: 'Barbucha',
      call: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBarbucha(ctx, 100, 100, 1.5, vx, false, attackInfo),
    },
  ];

  it('renders all 6 showcase bosses facing right (vx > 0) with zero gradient allocations and balanced stack', () => {
    for (const boss of showcaseBosses) {
      const { ctx, gradientCallCount } = createMockCanvasContext();
      expect(() => boss.call(ctx, 1)).not.toThrow();
      expect((ctx as any).getSaveDepth(), `${boss.name} save/restore stack balance`).toBe(0);
      expect(gradientCallCount(), `${boss.name} must have zero CanvasGradient allocations`).toBe(0);
    }
  });

  it('renders all 6 showcase bosses facing left (vx < 0) without upside-down flipping (sy > 0)', () => {
    for (const boss of showcaseBosses) {
      const { ctx } = createMockCanvasContext();
      expect(() => boss.call(ctx, -1)).not.toThrow();
      expect((ctx as any).getSaveDepth(), `${boss.name} save/restore stack balance`).toBe(0);

      // Verify that no scale call ever inverted sy (sy must always be positive so boss does not flip upside down)
      const scales: Array<{ sx: number; sy: number }> = (ctx as any).getScales();
      for (const scaleCall of scales) {
        expect(scaleCall.sy, `${boss.name} sy must be strictly positive`).toBeGreaterThan(0);
      }
    }
  });

  it('renders all 6 showcase bosses in combat windup and strike states without throwing', () => {
    const windupState = { isActive: true, isWindup: true, windupProgress: 0.85 };
    const strikeState = { isActive: true, isStrike: true, strikeProgress: 0.65 };

    for (const boss of showcaseBosses) {
      const mockWindup = createMockCanvasContext();
      expect(() => boss.call(mockWindup.ctx, 1, windupState)).not.toThrow();
      expect((mockWindup.ctx as any).getSaveDepth()).toBe(0);
      expect(mockWindup.gradientCallCount()).toBe(0);

      const mockStrike = createMockCanvasContext();
      expect(() => boss.call(mockStrike.ctx, -1, strikeState)).not.toThrow();
      expect((mockStrike.ctx as any).getSaveDepth()).toBe(0);
      expect(mockStrike.gradientCallCount()).toBe(0);
    }
  });

  it('verifies named functions are also directly exported and callable', () => {
    const { ctx } = createMockCanvasContext();
    expect(typeof drawHospodaHastrman).toBe('function');
    expect(typeof drawHospodaRusalka).toBe('function');
    expect(typeof drawHospodaKoledujiciBubak).toBe('function');
    expect(typeof drawHospodaObr).toBe('function');
    expect(typeof drawHospodaCert).toBe('function');
    expect(typeof drawHospodaBarbucha).toBe('function');

    expect(() => drawHospodaHastrman(ctx, 0, 0, 1, 1)).not.toThrow();
    expect(() => drawHospodaRusalka(ctx, 0, 0, 1, 1)).not.toThrow();
    expect(() => drawHospodaKoledujiciBubak(ctx, 0, 0, 1, 1)).not.toThrow();
    expect(() => drawHospodaObr(ctx, 0, 0, 1, 1)).not.toThrow();
    expect(() => drawHospodaCert(ctx, 0, 0, 1, 1)).not.toThrow();
    expect(() => drawHospodaBarbucha(ctx, 0, 0, 1, 1)).not.toThrow();
    expect((ctx as any).getSaveDepth()).toBe(0);
  });
});
