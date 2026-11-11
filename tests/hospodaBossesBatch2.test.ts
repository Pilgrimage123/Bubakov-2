import { describe, it, expect } from 'vitest';
import {
  Lada,
  drawHospodaHejkal,
  drawHospodaMlynar,
  drawHospodaBezhlavyRytir,
  drawHospodaDrak,
  drawHospodaPanZajic,
  drawHospodaMorana,
  drawHospodaOldWitch,
  drawHospodaPovidlovyCert,
  drawHospodaBakchusSPivnimSoudkem,
  drawHospodaUmrlecBasista,
} from '../src/render/ladaRenderer';

function createMockCanvasContext(): {
  ctx: CanvasRenderingContext2D;
  gradientCallCount: () => number;
  getSaveDepth: () => number;
  getScales: () => Array<{ sx: number; sy: number }>;
} {
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
  };

  return {
    ctx: ctx as CanvasRenderingContext2D,
    gradientCallCount: () => gradientCalls,
    getSaveDepth: () => saveDepth,
    getScales: () => scales,
  };
}

describe('ADR 0054: Hospodský figurální kánon - 10 dalších bossů', () => {
  const bosses10 = [
    {
      name: 'Hejkal',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawHejkal(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaHejkal,
    },
    {
      name: 'Mlynar',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawMlynar(ctx, 100, 100, 2.0, vx, false, false, attackInfo),
      direct: drawHospodaMlynar,
    },
    {
      name: 'BezhlavyRytir',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBezhlavyRytir(ctx, 100, 100, 2.0, vx, false, false, attackInfo),
      direct: drawHospodaBezhlavyRytir,
    },
    {
      name: 'Drak',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawDrak(ctx, 100, 100, 2.0, vx, false, false, undefined, attackInfo),
      direct: drawHospodaDrak,
    },
    {
      name: 'PanZajic',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawPanZajic(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaPanZajic,
    },
    {
      name: 'Morana',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawMorana(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaMorana,
    },
    {
      name: 'OldWitch',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawOldWitch(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaOldWitch,
    },
    {
      name: 'PovidlovyCert',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawPovidlovyCert(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaPovidlovyCert,
    },
    {
      name: 'BakchusSPivnimSoudkem',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBakchusSPivnimSoudkem(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaBakchusSPivnimSoudkem,
    },
    {
      name: 'UmrlecBasista',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawUmrlecBasista(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaUmrlecBasista,
    },
  ];

  it('renders all 10 bosses cleanly across neutral, windup, and strike states', () => {
    for (const b of bosses10) {
      const mock = createMockCanvasContext();

      // 1. Neutral state
      expect(() => b.render(mock.ctx, 1, undefined)).not.toThrow();

      // 2. Windup attack state
      expect(() =>
        b.render(mock.ctx, 1, {
          isActive: true,
          isWindup: true,
          isStrike: false,
          windupProgress: 0.75,
          strikeProgress: 0,
          facingDir: 1,
        })
      ).not.toThrow();

      // 3. Strike attack state
      expect(() =>
        b.render(mock.ctx, -1, {
          isActive: true,
          isWindup: false,
          isStrike: true,
          windupProgress: 0,
          strikeProgress: 0.85,
          facingDir: -1,
        })
      ).not.toThrow();
    }
  });

  it('verifies ZERO per-frame CanvasGradient allocations across all 10 bosses', () => {
    for (const b of bosses10) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, 1, undefined);
      b.render(mock.ctx, -1, { isActive: true, isStrike: true, strikeProgress: 0.5 });
      expect(mock.gradientCallCount()).toBe(0);
    }
  });

  it('verifies vertical scale sy > 0 when facing left (vx < 0) for all 10 bosses', () => {
    for (const b of bosses10) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, -1, undefined);

      const scales = mock.getScales();
      expect(scales.length).toBeGreaterThan(0);
      for (const s of scales) {
        expect(s.sy).toBeGreaterThan(0);
      }
    }
  });

  it('maintains balanced canvas save and restore stack depth for all 10 bosses', () => {
    for (const b of bosses10) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, 1, undefined);
      expect(mock.getSaveDepth()).toBe(0);

      // Attack state stack balance
      b.render(mock.ctx, -1, { isActive: true, isWindup: true, windupProgress: 0.5 });
      expect(mock.getSaveDepth()).toBe(0);
    }
  });

  it('exports all 10 direct drawHospoda* functions from ladaRenderer', () => {
    for (const b of bosses10) {
      expect(typeof b.direct).toBe('function');
      const mock = createMockCanvasContext();
      expect(() => b.direct(mock.ctx, 0, 0, 1, 1)).not.toThrow();
      expect(mock.getSaveDepth()).toBe(0);
    }
  });
});
