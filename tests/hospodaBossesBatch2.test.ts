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
  drawHospodaBlatouch,
  drawHospodaVodnicek,
  drawHospodaStageCrow,
  drawHospodaMeltingSnowman,
  drawHospodaFrostGiant,
  drawHospodaBeranek,
  drawHospodaKlekanice,
  drawHospodaBroomWitchZaspalka,
  drawHospodaLedoviMuzi,
  drawHospodaZbojnik,
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

describe('ADR 0054 & ADR 0055: Hospodský figurální kánon - Dávky 2, 3 a 4 (20 bossů)', () => {
  const bosses20 = [
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
    {
      name: 'Blatouch',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBlatouch(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaBlatouch,
    },
    {
      name: 'Vodnicek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawVodnicek(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaVodnicek,
    },
    {
      name: 'StageCrow',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawStageCrow(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaStageCrow,
    },
    {
      name: 'MeltingSnowman',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawMeltingSnowman(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaMeltingSnowman,
    },
    {
      name: 'FrostGiant',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawFrostGiant(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaFrostGiant,
    },
    {
      name: 'Beranek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBeranek(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaBeranek,
    },
    {
      name: 'Klekanice',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawKlekanice(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaKlekanice,
    },
    {
      name: 'BroomWitchZaspalka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawBroomWitchZaspalka(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaBroomWitchZaspalka,
    },
    {
      name: 'LedoviMuzi',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawLedoviMuzi(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaLedoviMuzi,
    },
    {
      name: 'Zbojnik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any) =>
        (Lada as any).drawZbojnik(ctx, 100, 100, 2.0, vx, false, attackInfo),
      direct: drawHospodaZbojnik,
    },
  ];

  it('renders all 20 bosses cleanly across neutral, windup, and strike states', () => {
    for (const b of bosses20) {
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

  it('verifies ZERO per-frame CanvasGradient allocations across all 20 bosses', () => {
    for (const b of bosses20) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, 1, undefined);
      b.render(mock.ctx, -1, { isActive: true, isStrike: true, strikeProgress: 0.5 });
      expect(mock.gradientCallCount()).toBe(0);
    }
  });

  it('verifies vertical scale sy > 0 when facing left (vx < 0) for all 20 bosses', () => {
    for (const b of bosses20) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, -1, undefined);

      const scales = mock.getScales();
      expect(scales.length).toBeGreaterThan(0);
      for (const s of scales) {
        expect(s.sy).toBeGreaterThan(0);
      }
    }
  });

  it('maintains balanced canvas save and restore stack depth for all 20 bosses', () => {
    for (const b of bosses20) {
      const mock = createMockCanvasContext();
      b.render(mock.ctx, 1, undefined);
      expect(mock.getSaveDepth()).toBe(0);

      // Attack state stack balance
      b.render(mock.ctx, -1, { isActive: true, isWindup: true, windupProgress: 0.5 });
      expect(mock.getSaveDepth()).toBe(0);
    }
  });

  it('exports all 20 direct drawHospoda* functions from ladaRenderer', () => {
    for (const b of bosses20) {
      expect(typeof b.direct).toBe('function');
      const mock = createMockCanvasContext();
      expect(() => b.direct(mock.ctx, 0, 0, 1, 1)).not.toThrow();
      expect(mock.getSaveDepth()).toBe(0);
    }
  });

  it('distinguishes idle (vx === 0) from walk (vx !== 0) and handles enraged/hurt states for all 20 ADR 0055 bosses', () => {
    const showcase20 = [
      {
        name: 'Hejkal',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaHejkal(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Mlynar',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaMlynar(ctx, 100, 100, 2.5, vx, false, Boolean(enemy?.enraged), attackInfo, enemy),
      },
      {
        name: 'BezhlavyRytir',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaBezhlavyRytir(ctx, 100, 100, 2.5, vx, false, Boolean(enemy?.enraged), attackInfo, enemy),
      },
      {
        name: 'Drak',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaDrak(ctx, 100, 100, 2.5, vx, false, Boolean(enemy?.enraged), undefined, attackInfo, enemy),
      },
      {
        name: 'PanZajic',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaPanZajic(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Morana',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaMorana(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'OldWitch',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaOldWitch(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'PovidlovyCert',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaPovidlovyCert(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'BakchusSPivnimSoudkem',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaBakchusSPivnimSoudkem(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'UmrlecBasista',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaUmrlecBasista(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Blatouch',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaBlatouch(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Vodnicek',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaVodnicek(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'StageCrow',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaStageCrow(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'MeltingSnowman',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaMeltingSnowman(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'FrostGiant',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaFrostGiant(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Beranek',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaBeranek(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Klekanice',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaKlekanice(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'BroomWitchZaspalka',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaBroomWitchZaspalka(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'LedoviMuzi',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaLedoviMuzi(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
      {
        name: 'Zbojnik',
        draw: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
          drawHospodaZbojnik(ctx, 100, 100, 2.5, vx, false, attackInfo, enemy),
      },
    ];

    for (const b of showcase20) {
      const mockIdle = createMockCanvasContext();
      // Idle via effectiveVx = 1 but enemy.vx = 0 (as dispatched by ladaRenderer & AnimationTesterModal)
      expect(() => b.draw(mockIdle.ctx, 1, undefined, { vx: 0 })).not.toThrow();
      expect(mockIdle.getSaveDepth()).toBe(0);
      expect(mockIdle.gradientCallCount()).toBe(0);

      // Enraged + hurt state
      const mockEnraged = createMockCanvasContext();
      expect(() =>
        b.draw(
          mockEnraged.ctx,
          -1,
          { isActive: true, isStrike: true, strikeProgress: 0.4 },
          { vx: -2.2, enraged: true, hurtTimer: 0.3 }
        )
      ).not.toThrow();
      expect(mockEnraged.getSaveDepth()).toBe(0);
      expect(mockEnraged.gradientCallCount()).toBe(0);
    }
  });
});

