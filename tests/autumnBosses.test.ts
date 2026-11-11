import { describe, it, expect } from 'vitest';
import {
  Lada,
  drawHospodaKralovskySrsen,
  drawHospodaPosvicenskyHospodar,
  drawHospodaSvatovaclavskyStrazce,
  drawHospodaChmelovySkritek,
  drawHospodaKviliciMeluzina,
  drawHospodaKralovskyHavran,
  drawHospodaHastrmanPodzimni,
  drawHospodaDrakVetrnik,
  drawHospodaDusickovaBludicka,
  drawHospodaCertRybnikar,
  drawHospodaVeleStika,
  drawHospodaKralovskaHusa,
  drawHospodaMartinskyJezdec,
  drawHospodaListopadovyMrazivec,
  drawHospodaMlznyPrizrak,
  drawHospodaCernyMyslivec,
  drawHospodaKanecKnour,
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

describe('ADR 0054: Hospodský figurální kánon - Dávka 5: Podzim a Dušičky (17 bossů)', () => {
  const autumnBosses = [
    {
      name: 'KralovskySrsen',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskySrsen(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskySrsen,
    },
    {
      name: 'PosvicenskyHospodar',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawPosvicenskyHospodar(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaPosvicenskyHospodar,
    },
    {
      name: 'SvatovaclavskyStrazce',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawSvatovaclavskyStrazce(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaSvatovaclavskyStrazce,
    },
    {
      name: 'ChmelovySkritek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawChmelovySkritek(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaChmelovySkritek,
    },
    {
      name: 'KviliciMeluzina',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKviliciMeluzina(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKviliciMeluzina,
    },
    {
      name: 'KralovskyHavran',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskyHavran(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskyHavran,
    },
    {
      name: 'HastrmanPodzimni',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawHastrmanPodzimni(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaHastrmanPodzimni,
    },
    {
      name: 'DrakVetrnik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawDrakVetrnik(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaDrakVetrnik,
    },
    {
      name: 'DusickovaBludicka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawDusickovaBludicka(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaDusickovaBludicka,
    },
    {
      name: 'CertRybnikar',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawCertRybnikar(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaCertRybnikar,
    },
    {
      name: 'VeleStika',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawVeleStika(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaVeleStika,
    },
    {
      name: 'KralovskaHusa',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralovskaHusa(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralovskaHusa,
    },
    {
      name: 'MartinskyJezdec',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMartinskyJezdec(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMartinskyJezdec,
    },
    {
      name: 'ListopadovyMrazivec',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawListopadovyMrazivec(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaListopadovyMrazivec,
    },
    {
      name: 'MlznyPrizrak',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMlznyPrizrak(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMlznyPrizrak,
    },
    {
      name: 'CernyMyslivec',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawCernyMyslivec(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaCernyMyslivec,
    },
    {
      name: 'KanecKnour',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKanecKnour(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKanecKnour,
    },
  ];

  it('verifies all 17 autumn boss draw functions are defined on Lada and can render directly', () => {
    for (const b of autumnBosses) {
      expect(typeof b.direct, `${b.name} direct function must exist`).toBe('function');
      const { ctx, getSaveDepth } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(getSaveDepth(), `${b.name} must leave canvas stack balanced`).toBe(0);
    }
  });

  it('guarantees zero canvas gradient allocations across all 17 autumn bosses (60FPS rule)', () => {
    for (const b of autumnBosses) {
      const { ctx, gradientCallCount } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(gradientCallCount(), `${b.name} must not call createGradient`).toBe(0);
    }
  });

  it('verifies directional flipping for left movement (vx < 0) does not invert vertical axis', () => {
    for (const b of autumnBosses) {
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

    for (const b of autumnBosses) {
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
