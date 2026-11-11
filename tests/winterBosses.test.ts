import { describe, it, expect } from 'vitest';
import {
  Lada,
  drawHospodaCertSPytlem,
  drawHospodaMaskarniKozel,
  drawHospodaMikulasskyCert,
  drawHospodaMrazivaSova,
  drawHospodaJezdecMeluziny,
  drawHospodaKralMrazik,
  drawHospodaObriSnehulak,
  drawHospodaTrikralovyJezdec,
  drawHospodaVladceChumelenice,
  drawHospodaLedovaKlekanice,
  drawHospodaKostlivecSKosou,
  drawHospodaPerchtaSNozem,
  drawHospodaMasopustniMedved,
  drawHospodaSlamennikObr,
  drawHospodaRychtarMasek,
  drawHospodaNocniKobold,
  drawHospodaMasopustniLaufr,
  drawHospodaCertovaBabicka,
  drawHospodaZakletaPrincezna,
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

describe('ADR 0054: Hospodský figurální kánon - Dávka 6: Zima, Masopust a Speciální bossové (19 bossů)', () => {
  const winterBosses = [
    {
      name: 'CertSPytlem',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawCertSPytlem(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaCertSPytlem,
    },
    {
      name: 'MaskarniKozel',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMaskarniKozel(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMaskarniKozel,
    },
    {
      name: 'MikulasskyCert',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMikulasskyCert(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMikulasskyCert,
    },
    {
      name: 'MrazivaSova',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMrazivaSova(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMrazivaSova,
    },
    {
      name: 'JezdecMeluziny',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawJezdecMeluziny(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaJezdecMeluziny,
    },
    {
      name: 'KralMrazik',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKralMrazik(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKralMrazik,
    },
    {
      name: 'ObriSnehulak',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawObriSnehulak(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaObriSnehulak,
    },
    {
      name: 'TrikralovyJezdec',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawTrikralovyJezdec(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaTrikralovyJezdec,
    },
    {
      name: 'VladceChumelenice',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawVladceChumelenice(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaVladceChumelenice,
    },
    {
      name: 'LedovaKlekanice',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawLedovaKlekanice(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaLedovaKlekanice,
    },
    {
      name: 'KostlivecSKosou',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawKostlivecSKosou(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaKostlivecSKosou,
    },
    {
      name: 'PerchtaSNozem',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawPerchtaSNozem(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaPerchtaSNozem,
    },
    {
      name: 'MasopustniMedved',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMasopustniMedved(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMasopustniMedved,
    },
    {
      name: 'SlamennikObr',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawSlamennikObr(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaSlamennikObr,
    },
    {
      name: 'RychtarMasek',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawRychtarMasek(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaRychtarMasek,
    },
    {
      name: 'NocniKobold',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawNocniKobold(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaNocniKobold,
    },
    {
      name: 'MasopustniLaufr',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawMasopustniLaufr(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaMasopustniLaufr,
    },
    {
      name: 'CertovaBabicka',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawCertovaBabicka(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaCertovaBabicka,
    },
    {
      name: 'ZakletaPrincezna',
      render: (ctx: CanvasRenderingContext2D, vx: number, attackInfo?: any, enemy?: any) =>
        (Lada as any).drawZakletaPrincezna(ctx, 100, 100, 2.0, vx, false, attackInfo, enemy),
      direct: drawHospodaZakletaPrincezna,
    },
  ];

  it('verifies all 19 winter and special boss draw functions are defined on Lada and can render directly', () => {
    for (const b of winterBosses) {
      expect(typeof b.direct, `${b.name} direct function must exist`).toBe('function');
      const { ctx, getSaveDepth } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(getSaveDepth(), `${b.name} must leave canvas stack balanced`).toBe(0);
    }
  });

  it('guarantees zero canvas gradient allocations across all 19 winter bosses (60FPS rule)', () => {
    for (const b of winterBosses) {
      const { ctx, gradientCallCount } = createMockCanvasContext();
      b.render(ctx, 1);
      expect(gradientCallCount(), `${b.name} must not call createGradient`).toBe(0);
    }
  });

  it('verifies directional flipping for left movement (vx < 0) does not invert vertical axis', () => {
    for (const b of winterBosses) {
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

    for (const b of winterBosses) {
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
