import { describe, it, expect } from 'vitest';
import {
  Lada,
  drawHospodaKralovskyVeleRak,
  drawHospodaCertSekac,
  drawHospodaKralovskaPolednice,
  drawHospodaOhnivySudlicka,
  drawHospodaSvatojanskyVladce,
  drawHospodaKrecekObilnik,
  drawHospodaZitnaMatka,
  drawHospodaHromotlukMarketa,
  drawHospodaBilaPani,
  drawHospodaKralovskyCmelak,
  drawHospodaZlatohlavekZrout,
  drawHospodaDozinkovyChasnik,
  drawHospodaNetopyrUsatec,
  drawHospodaNocniMura,
  drawHospodaVyrVelky,
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

describe('ADR 0054: Hospodský figurální kánon - Dávka 4: Léto a Žně (15 bossů)', () => {
  const summerBosses = [
    {
      name: 'KralovskyVeleRak',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskyVeleRak(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskyVeleRak,
    },
    {
      name: 'CertSekac',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawCertSekac(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaCertSekac,
    },
    {
      name: 'KralovskaPolednice',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskaPolednice(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskaPolednice,
    },
    {
      name: 'OhnivySudlicka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawOhnivySudlicka(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaOhnivySudlicka,
    },
    {
      name: 'SvatojanskyVladce',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawSvatojanskyVladce(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaSvatojanskyVladce,
    },
    {
      name: 'KrecekObilnik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKrecekObilnik(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKrecekObilnik,
    },
    {
      name: 'ZitnaMatka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawZitnaMatka(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaZitnaMatka,
    },
    {
      name: 'HromotlukMarketa',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawHromotlukMarketa(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaHromotlukMarketa,
    },
    {
      name: 'BilaPani',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawBilaPani(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaBilaPani,
    },
    {
      name: 'KralovskyCmelak',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskyCmelak(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskyCmelak,
    },
    {
      name: 'ZlatohlavekZrout',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawZlatohlavekZrout(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaZlatohlavekZrout,
    },
    {
      name: 'DozinkovyChasnik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawDozinkovyChasnik(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaDozinkovyChasnik,
    },
    {
      name: 'NetopyrUsatec',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawNetopyrUsatec(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaNetopyrUsatec,
    },
    {
      name: 'NocniMura',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawNocniMura(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaNocniMura,
    },
    {
      name: 'VyrVelky',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawVyrVelky(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaVyrVelky,
    },
  ];

  it('verifies all 15 summer boss draw functions are defined on Lada and can render directly', () => {
    for (const b of summerBosses) {
      expect(typeof b.direct, `${b.name} direct function must exist`).toBe('function');
      const { ctx, getSaveDepth } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(getSaveDepth(), `${b.name} must leave canvas stack balanced`).toBe(0);
    }
  });

  it('guarantees zero canvas gradient allocations across all 15 summer bosses (60FPS rule)', () => {
    for (const b of summerBosses) {
      const { ctx, gradientCallCount } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(gradientCallCount(), `${b.name} must not call createGradient`).toBe(0);
    }
  });

  it('verifies directional flipping for left movement (vx < 0) does not invert vertical axis', () => {
    for (const b of summerBosses) {
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

    for (const b of summerBosses) {
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
