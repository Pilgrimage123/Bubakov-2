import { describe, it, expect } from 'vitest';
import {
  Lada,
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

describe('ADR 0054: Hospodský figurální kánon - Dávka 3: Předjaří a Jaro (10 bossů)', () => {
  const springBosses = [
    {
      name: 'Blatouch',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawBlatouch(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaBlatouch,
    },
    {
      name: 'Vodnicek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawVodnicek(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaVodnicek,
    },
    {
      name: 'StageCrow',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawStageCrow(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaStageCrow,
    },
    {
      name: 'MeltingSnowman',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMeltingSnowman(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMeltingSnowman,
    },
    {
      name: 'FrostGiant',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawFrostGiant(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaFrostGiant,
    },
    {
      name: 'Beranek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawBeranek(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaBeranek,
    },
    {
      name: 'Klekanice',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKlekanice(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKlekanice,
    },
    {
      name: 'BroomWitchZaspalka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawBroomWitchZaspalka(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaBroomWitchZaspalka,
    },
    {
      name: 'LedoviMuzi',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawLedoviMuzi(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaLedoviMuzi,
    },
    {
      name: 'Zbojnik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawZbojnik(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaZbojnik,
    },
  ];

  it('verifies all 10 spring boss draw functions are defined on Lada and can render directly', () => {
    for (const b of springBosses) {
      expect(typeof b.direct, `${b.name} direct function must exist`).toBe('function');
      const { ctx, getSaveDepth } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(getSaveDepth(), `${b.name} must leave canvas stack balanced`).toBe(0);
    }
  });

  it('guarantees zero canvas gradient allocations across all 10 spring bosses (60FPS rule)', () => {
    for (const b of springBosses) {
      const { ctx, gradientCallCount } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(gradientCallCount(), `${b.name} must not call createGradient`).toBe(0);
    }
  });

  it('verifies directional flipping for left movement (vx < 0) does not invert vertical axis', () => {
    for (const b of springBosses) {
      const { ctx, getScales } = createMockCanvasContext();
      b.render(ctx, -1);
      const rootScale = getScales()[0];
      expect(rootScale, `${b.name} must perform root scale transform`).toBeDefined();
      expect(rootScale.sx, `${b.name} horizontal scale must be negative`).toBeLessThan(0);
      expect(rootScale.sy, `${b.name} vertical scale must remain positive`).toBeGreaterThan(0);
    }
  });

  it('handles combat reaction phases (windup, strike, enraged, panicked) without throwing', () => {
    const states = [
      { label: 'neutral', attack: undefined, enemy: { isEnraged: false } },
      { label: 'windup', attack: { isWindup: true, progress: 0.8 }, enemy: { isWindup: true } },
      { label: 'strike', attack: { isStrike: true, progress: 0.2 }, enemy: { isStrike: true } },
      { label: 'enraged', attack: undefined, enemy: { isEnraged: true, hp: 100, maxHp: 1000 } },
      { label: 'panicked', attack: undefined, enemy: { panicked: true } },
    ];

    for (const b of springBosses) {
      for (const st of states) {
        const { ctx, getSaveDepth } = createMockCanvasContext();
        expect(() => {
          b.render(ctx, 1, st.attack, st.enemy);
        }, `${b.name} must render cleanly in ${st.label}`).not.toThrow();
        expect(getSaveDepth(), `${b.name} in state ${st.label} must preserve stack depth`).toBe(0);
      }
    }
  });
});
