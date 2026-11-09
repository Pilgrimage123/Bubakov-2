/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 15 & 16 (Říjen v Hrusicích – Den & Noc).
 * Stage 15 (Day): Říjnová drakiáda, sklizeň brambor, ohníčky z bramborové natě a pečené brambory v popelu.
 * Stage 16 (Night): Dušičková noc, výlov rybníka Brčálníku, kádě s kapry a plápolající svíce u Božích muk.
 * Strictly follows the Ladovský kodex: #1A1412 ink outlines, rich autumnal ochres, russet bronzes,
 * burning potato-ash glows, and mysterious All Souls candlelights.
 */

const INK = '#1A1412';
import {
  drawAllVillageCottages,
  drawAuthenticChurch,
  drawAuthenticTavern,
  drawAuthenticSchool,
  drawAuthenticMill,
} from './villageBuildingRenderer';

function strokeOutline(ctx: CanvasRenderingContext2D, width = 3.5) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Draws an authentic autumn tree (golden beech / orange oak) with thick ink outline */
function drawAutumnTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  palette: 'golden' | 'russet' | 'orange' = 'golden',
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(6, 10, 22, 0.35)' : 'rgba(54, 38, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(6, 38, 48, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = isNight ? '#36241A' : '#543622';
  ctx.beginPath();
  ctx.moveTo(-9, 38);
  ctx.quadraticCurveTo(-6, 6, -5, -26);
  ctx.lineTo(6, -26);
  ctx.quadraticCurveTo(7, 6, 10, 38);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Colors for autumn canopy puffs
  let colors: string[];
  if (isNight) {
    colors = ['#3E3220', '#4A3B22', '#524024', '#382B1B', '#44341E'];
  } else if (palette === 'russet') {
    colors = ['#B45309', '#C2410C', '#D97706', '#9A3412', '#EA580C'];
  } else if (palette === 'orange') {
    colors = ['#D97706', '#F59E0B', '#B45309', '#EA580C', '#FBBF24'];
  } else {
    colors = ['#EAB308', '#FACC15', '#CA8A04', '#D97706', '#FDE047'];
  }

  const puffs = [
    { cx: -25, cy: -36, r: 28, c: colors[0] },
    { cx: 25, cy: -34, r: 27, c: colors[1] },
    { cx: 0, cy: -56, r: 33, c: colors[2] },
    { cx: -15, cy: -24, r: 25, c: colors[3] },
    { cx: 15, cy: -24, r: 25, c: colors[4] },
  ];

  for (const p of puffs) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 3);
  }

  ctx.restore();
}

/** Draws a traditional Czech paper kite (Lada kite) floating with bows */
function drawPaperKite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
  colors: [string, string, string, string] = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  // Kite body (diamond shape)
  const top = { x: 0, y: -36 };
  const right = { x: 26, y: -6 };
  const bottom = { x: 0, y: 38 };
  const left = { x: -26, y: -6 };
  const center = { x: 0, y: -6 };

  // 4 colored triangles
  const triangles = [
    { p1: top, p2: right, p3: center, c: colors[0] },
    { p1: right, p2: bottom, p3: center, c: colors[1] },
    { p1: bottom, p2: left, p3: center, c: colors[2] },
    { p1: left, p2: top, p3: center, c: colors[3] },
  ];

  for (const t of triangles) {
    ctx.fillStyle = t.c;
    ctx.beginPath();
    ctx.moveTo(t.p1.x, t.p1.y);
    ctx.lineTo(t.p2.x, t.p2.y);
    ctx.lineTo(t.p3.x, t.p3.y);
    ctx.closePath();
    ctx.fill();
  }

  // Cross wooden frame
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.strokeStyle = '#5A381E';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Ink diamond perimeter
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(left.x, left.y);
  ctx.closePath();
  strokeOutline(ctx, 3);

  // Friendly Lada smiling face on kite
  ctx.fillStyle = '#1A1412';
  ctx.beginPath();
  ctx.arc(-8, -12, 2.5, 0, Math.PI * 2);
  ctx.arc(8, -12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -2, 7, 0.2 * Math.PI, 0.8 * Math.PI);
  strokeOutline(ctx, 2);

  // Kite tail with colorful paper bows
  ctx.beginPath();
  ctx.moveTo(bottom.x, bottom.y);
  ctx.quadraticCurveTo(12, 55, -6, 75);
  ctx.quadraticCurveTo(-18, 95, 8, 120);
  ctx.strokeStyle = '#3E2718';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  const bows = [
    { x: 10, y: 55, c: '#EF4444' },
    { x: -5, y: 75, c: '#FBBF24' },
    { x: -14, y: 95, c: '#3B82F6' },
    { x: 6, y: 118, c: '#10B981' },
  ];

  for (const b of bows) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = b.c;
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(7, 4);
    ctx.lineTo(7, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 1.5);
    ctx.restore();
  }

  ctx.restore();
}

/** Draws the signature smoking potato-foliage fire (Ohníček z bramborové natě) */
function drawPotatoFire(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time = 0,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Ash circle on ground
  ctx.fillStyle = isNight ? 'rgba(30, 25, 20, 0.75)' : 'rgba(75, 60, 45, 0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 44, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  // Heap of dry potato stems and foliage
  ctx.fillStyle = isNight ? '#2E2214' : '#4E381C';
  ctx.beginPath();
  ctx.moveTo(-32, 10);
  ctx.quadraticCurveTo(-20, -18, 0, -20);
  ctx.quadraticCurveTo(22, -18, 32, 10);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 2.8);

  // Glowing red embers inside the ash
  const emberPulse = 0.7 + 0.3 * Math.sin(time * 3);
  ctx.fillStyle = `rgba(239, 68, 68, ${emberPulse})`;
  ctx.beginPath();
  ctx.ellipse(-6, 2, 14, 8, -0.2, 0, Math.PI * 2);
  ctx.ellipse(8, 4, 12, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(251, 191, 36, ${emberPulse * 0.9})`;
  ctx.beginPath();
  ctx.arc(-2, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Fragrant blueish-white smoke billowing upward
  const smokePuffs = [
    { ox: Math.sin(time * 1.5) * 6, oy: -28 - (time * 18) % 24, r: 12 + Math.sin(time * 2) * 2 },
    { ox: Math.cos(time * 1.2) * 8 + 4, oy: -46 - (time * 18) % 26, r: 16 },
    { ox: Math.sin(time * 1.7) * 10 - 6, oy: -68 - (time * 18) % 30, r: 20 },
  ];

  for (const s of smokePuffs) {
    ctx.fillStyle = isNight ? 'rgba(148, 163, 184, 0.28)' : 'rgba(203, 213, 225, 0.45)';
    ctx.beginPath();
    ctx.arc(s.ox, s.oy, s.r, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 1.8);
  }

  // Roasted potatoes in the ash at the edge
  const potatoes = [
    { px: -18, py: 6, r: 5.5 },
    { px: 16, py: 8, r: 6.0 },
    { px: -2, py: 11, r: 5.0 },
  ];
  for (const p of potatoes) {
    ctx.fillStyle = isNight ? '#452A14' : '#6B4226';
    ctx.beginPath();
    ctx.ellipse(p.px, p.py, p.r * 1.2, p.r * 0.85, 0.2, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 2);
  }

  ctx.restore();
}

/** Draws wooden fish tubs with carps for the pond harvest (výlov rybníka) */
function drawCarpTub(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  withCarp = true,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(6, 10, 22, 0.35)' : 'rgba(54, 38, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wooden barrel / tub body
  ctx.fillStyle = isNight ? '#3E2A1C' : '#65432B';
  ctx.beginPath();
  ctx.moveTo(-22, -10);
  ctx.lineTo(-25, 14);
  ctx.quadraticCurveTo(0, 20, 25, 14);
  ctx.lineTo(22, -10);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Iron hoops around tub
  ctx.strokeStyle = '#261B14';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-23, -2);
  ctx.quadraticCurveTo(0, 4, 23, -2);
  ctx.moveTo(-24, 8);
  ctx.quadraticCurveTo(0, 14, 24, 8);
  ctx.stroke();

  // Water surface inside tub
  ctx.fillStyle = isNight ? '#1E293B' : '#38BDF8';
  ctx.beginPath();
  ctx.ellipse(0, -10, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  // Glistening carp sticking out / splashing
  if (withCarp) {
    ctx.save();
    ctx.fillStyle = isNight ? '#475569' : '#0D9488';
    ctx.beginPath();
    ctx.ellipse(4, -14, 12, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 2);
    // Golden scales glint
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(6, -14, 2, 0, Math.PI * 2);
    ctx.fill();
    // Carp tail
    ctx.beginPath();
    ctx.moveTo(14, -18);
    ctx.lineTo(22, -24);
    ctx.lineTo(20, -16);
    ctx.lineTo(23, -11);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 1.8);
    ctx.restore();
  }

  ctx.restore();
}

/** Draws a wayside shrine with glowing All Souls candles (Boží muka) */
function drawAllSoulsShrine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  time = 0,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(6, 10, 22, 0.35)' : 'rgba(54, 38, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 32, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone base pedestal
  ctx.fillStyle = isNight ? '#334155' : '#CBD5E1';
  ctx.beginPath();
  ctx.rect(-16, 12, 32, 12);
  ctx.fill();
  strokeOutline(ctx, 3);

  // Whitewashed column
  ctx.fillStyle = isNight ? '#475569' : '#E2E8F0';
  ctx.beginPath();
  ctx.rect(-10, -28, 20, 40);
  ctx.fill();
  strokeOutline(ctx, 3);

  // Niche with saint image / cross
  ctx.fillStyle = isNight ? '#1E293B' : '#64748B';
  ctx.beginPath();
  ctx.arc(0, -14, 6, Math.PI, 0);
  ctx.lineTo(6, -6);
  ctx.lineTo(-6, -6);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 2);

  // Tiny golden cross inside niche
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, -8);
  ctx.moveTo(-3, -13);
  ctx.lineTo(3, -13);
  ctx.stroke();

  // Shingle roof on top
  ctx.fillStyle = isNight ? '#3A1E14' : '#854D0E';
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.lineTo(0, -44);
  ctx.lineTo(16, -28);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Small iron cross on roof
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.lineTo(0, -54);
  ctx.moveTo(-4, -50);
  ctx.lineTo(4, -50);
  ctx.stroke();

  // All Souls candles flickering around the base in red glass cups
  const candlePositions = [
    { cx: -18, cy: 18, color: '#EF4444' },
    { cx: 18, cy: 18, color: '#EF4444' },
    { cx: -8, cy: 22, color: '#F59E0B' },
    { cx: 8, cy: 22, color: '#F59E0B' },
  ];

  for (const c of candlePositions) {
    // Red glass cup
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.rect(c.cx - 3.5, c.cy - 7, 7, 8);
    ctx.fill();
    strokeOutline(ctx, 1.4);

    // Warm candleflame with gentle flicker
    const flicker = 0.8 + 0.25 * Math.sin(time * 6 + c.cx);
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(c.cx, c.cy - 9, 2.2 * flicker, 3.8 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nighttime candle glow halo
    if (isNight) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
      ctx.beginPath();
      ctx.arc(c.cx, c.cy - 9, 14 * flicker, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Draws a traditional straw scarecrow with pumpkin/turnip head and coat */
function drawScarecrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = isNight ? 'rgba(6, 10, 22, 0.35)' : 'rgba(54, 38, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wooden stake in the ground
  ctx.strokeStyle = '#543622';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(0, -30);
  ctx.moveTo(-26, -10);
  ctx.lineTo(26, -10);
  ctx.stroke();

  // Old torn coat
  ctx.fillStyle = isNight ? '#1E293B' : '#334155';
  ctx.beginPath();
  ctx.moveTo(-18, -12);
  ctx.lineTo(-24, 10);
  ctx.lineTo(-12, 18);
  ctx.lineTo(0, 16);
  ctx.lineTo(12, 18);
  ctx.lineTo(24, 10);
  ctx.lineTo(18, -12);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Straw sticking out of sleeves and bottom
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-24, 10);
  ctx.lineTo(-30, 14);
  ctx.moveTo(24, 10);
  ctx.lineTo(30, 14);
  ctx.moveTo(-6, 16);
  ctx.lineTo(-8, 24);
  ctx.moveTo(6, 16);
  ctx.lineTo(8, 24);
  ctx.stroke();

  // Pumpkin / turnip head
  ctx.fillStyle = isNight ? '#9A3412' : '#EA580C';
  ctx.beginPath();
  ctx.arc(0, -24, 12, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.8);

  // Eyes and crooked grin
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-4, -26, 2, 0, Math.PI * 2);
  ctx.arc(4, -26, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -20, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Old floppy hat
  ctx.fillStyle = isNight ? '#2A2016' : '#451A03';
  ctx.beginPath();
  ctx.ellipse(0, -32, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.5);
  ctx.beginPath();
  ctx.rect(-8, -42, 16, 10);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  ctx.restore();
}

/**
 * Main dispatcher for all October decorations (10 canonical decorations):
 * 1 border frame + 9 authentic points of interest (fields, church, tavern, village,
 * school, pond, mill, forest, shrine).
 */
export function drawRijenDecoration(
  ctx: CanvasRenderingContext2D,
  itemOrType: { type: string; x?: number; y?: number; scale?: number } | string,
  timeOrX: number = 0,
  isNightOrY: boolean | number = false,
  maybeTime = 0,
  maybeIsNight = false
) {
  const isObj = typeof itemOrType === 'object' && itemOrType !== null;
  const type = isObj ? itemOrType.type : itemOrType;
  const x = isObj ? 0 : (typeof timeOrX === 'number' && typeof isNightOrY === 'number' ? timeOrX : 0);
  const y = isObj ? 0 : (typeof isNightOrY === 'number' ? isNightOrY : 0);
  const time = isObj ? timeOrX : (typeof timeOrX === 'number' && typeof isNightOrY === 'boolean' ? timeOrX : maybeTime);
  const isNight = isObj
    ? Boolean(isNightOrY)
    : (typeof isNightOrY === 'boolean' ? isNightOrY : (typeof timeOrX === 'boolean' ? timeOrX : maybeIsNight));

  ctx.save();
  if (x !== 0 || y !== 0) {
    ctx.translate(x, y);
  }

  switch (type) {
    case 'rijen_border': {
      // World-level backdrop: polní cesty, potok, mostky, 4 roubenky, ozdobný trojitý rám
      ctx.save();

      // Polní cesty (Field dirt paths connecting church-village-tavern-bridges)
      ctx.strokeStyle = isNight ? '#251D18' : '#8A5D3B';
      ctx.lineWidth = 56;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Church (-800, -650) to village (50, -75)
      ctx.moveTo(-800, -650);
      ctx.quadraticCurveTo(-380, -350, 50, -75);
      // Village (50, -75) to tavern (440, -75)
      ctx.lineTo(440, -75);
      // Tavern to north bridge (425, -455)
      ctx.quadraticCurveTo(430, -280, 425, -455);
      // Tavern to south bridge (475, 420)
      ctx.quadraticCurveTo(460, 180, 475, 420);
      // Village to school (125, 550)
      ctx.quadraticCurveTo(80, 240, 125, 550);
      // Village to mill (-880, 110)
      ctx.quadraticCurveTo(-410, 20, -880, 110);
      ctx.stroke();

      // Hrusický potok (Brook: bank, water body, and current ripples)
      ctx.strokeStyle = INK;
      ctx.lineWidth = 96;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#0F172A' : '#0284C7';
      ctx.lineWidth = 86;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#1E293B' : '#38BDF8';
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      // Two wooden bridges across brook: (425, -455) and (475, 420)
      const bridges = [
        { bx: 425, by: -455, w: 90, h: 52 },
        { bx: 475, by: 420, w: 90, h: 52 },
      ];
      for (const br of bridges) {
        ctx.fillStyle = isNight ? '#382516' : '#6E4524';
        ctx.fillRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.strokeRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);
        // Railings
        ctx.beginPath();
        ctx.moveTo(br.bx - br.w / 2, br.by - br.h / 2);
        ctx.lineTo(br.bx + br.w / 2, br.by - br.h / 2);
        ctx.moveTo(br.bx - br.w / 2, br.by + br.h / 2);
        ctx.lineTo(br.bx + br.w / 2, br.by + br.h / 2);
        ctx.stroke();
      }

      // Decorative boundary frame around arena [-1920..1920, -1675..1675]
      ctx.strokeStyle = isNight ? '#1E293B' : '#854D0E';
      ctx.lineWidth = 16;
      ctx.strokeRect(-1910, -1665, 3820, 3330);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.strokeRect(-1918, -1673, 3836, 3346);

      // Title Cartouche at top (0, -1590)
      ctx.save();
      ctx.translate(0, -1590);
      ctx.fillStyle = isNight ? '#0F172A' : '#FEF3C7';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-240, -32, 480, 64, 16);
      } else {
        ctx.rect(-240, -32, 480, 64);
      }
      ctx.fill();
      strokeOutline(ctx, 4);
      ctx.fillStyle = isNight ? '#F8FAFC' : '#78350F';
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNight ? '✦ ŘÍJEN V HRUSICÍCH – DUŠIČKOVÁ NOC ✦' : '✦ ŘÍJEN V HRUSICÍCH – DRAKIÁDA ✦', 0, 0);
      ctx.restore();

      // A few decorative paper kites floating high in the sky (day)
      if (!isNight) {
        drawPaperKite(ctx, -520, -780, 0.85, 0.25, ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']);
        drawPaperKite(ctx, 280, -820, 0.95, -0.2, ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6']);
        drawPaperKite(ctx, -150, -640, 0.75, 0.15, ['#3B82F6', '#EF4444', '#F59E0B', '#EC4899']);
      }

      // Canonical 6 village cottages matching MARCH_THAW_OBSTACLES
      drawAllVillageCottages(ctx, 'autumn', isNight, time);

      ctx.restore();
      break;
    }

    case 'rijen_fields': {
      // Severní pole a brambořiště (225, -975): potato furrows, kites, scarecrow, sacks
      ctx.save();
      // Furrows on ground
      ctx.strokeStyle = isNight ? 'rgba(40, 30, 20, 0.4)' : 'rgba(120, 75, 40, 0.35)';
      ctx.lineWidth = 6;
      for (let i = -70; i <= 70; i += 22) {
        ctx.beginPath();
        ctx.moveTo(-90, i);
        ctx.lineTo(90, i);
        ctx.stroke();
      }
      // Straw scarecrow in field
      drawScarecrow(ctx, -38, -12, 1, isNight);
      // Flying kite over the field
      if (!isNight) {
        drawPaperKite(ctx, 35, -45, 0.8, 0.2);
      }
      // Sacks of harvested potatoes
      ctx.fillStyle = isNight ? '#3E2A18' : '#785434';
      ctx.beginPath();
      ctx.ellipse(32, 24, 14, 18, 0.1, 0, Math.PI * 2);
      ctx.ellipse(54, 26, 12, 16, -0.15, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.8);
      ctx.restore();
      break;
    }

    case 'rijen_church': {
      // Kostel sv. Mikuláše a hřbitůvek (-800, -650)
      ctx.save();
      drawAuthenticChurch(ctx, 0, -30, isNight, 'autumn', time);

      // Autumn trees by churchyard
      drawAutumnTree(ctx, -75, 15, 0.85, 'golden', isNight);
      drawAutumnTree(ctx, 75, 15, 0.85, 'orange', isNight);

      // All Souls candles by cemetery wall (night)
      if (isNight) {
        drawAllSoulsShrine(ctx, 45, 30, 0.7, time, isNight);
      }
      ctx.restore();
      break;
    }

    case 'rijen_village': {
      // Náves s lípou a ohníčkem z bramborové natě (50, -75)
      ctx.save();
      // Village lime tree in golden autumn foliage
      drawAutumnTree(ctx, -40, -35, 1.15, 'golden', isNight);
      // The signature potato fire on the green!
      drawPotatoFire(ctx, 0, 10, time, isNight);
      // Wooden basket of raw potatoes
      ctx.fillStyle = isNight ? '#3A281A' : '#714827';
      ctx.beginPath();
      ctx.ellipse(36, 18, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'rijen_tavern': {
      // Hospoda U Sejků (440, -75) - full scale matching hospoda_main collision
      ctx.save();
      drawAuthenticTavern(ctx, 22, 0, isNight, 'autumn', time);

      // Wooden beer table and benches outside
      ctx.fillStyle = isNight ? '#2A1B10' : '#5C381E';
      ctx.fillRect(-28, 65, 56, 12);
      strokeOutline(ctx, 2.5);

      // Golden autumn tree next to tavern
      drawAutumnTree(ctx, 165, 0, 0.9, 'russet', isNight);
      ctx.restore();
      break;
    }

    case 'rijen_pond': {
      // Rybník Brčálník s výlovem a káděmi kaprů (-725, 615)
      ctx.save();
      // Brown autumn reeds around water edge
      ctx.strokeStyle = isNight ? '#3A3222' : '#854D0E';
      ctx.lineWidth = 3;
      const reeds = [-65, -45, -25, 25, 45, 65];
      for (const rx of reeds) {
        ctx.beginPath();
        ctx.moveTo(rx, -20);
        ctx.quadraticCurveTo(rx + 6, -45, rx + 2, -60);
        ctx.stroke();
      }

      // Wooden fishing tubs with carps
      drawCarpTub(ctx, -35, 15, 1.0, true, isNight);
      drawCarpTub(ctx, 25, 18, 1.1, true, isNight);
      drawCarpTub(ctx, -5, -10, 0.85, false, isNight);

      // Weeping willow in bronze/gold
      drawAutumnTree(ctx, -75, -20, 0.95, 'russet', isNight);
      ctx.restore();
      break;
    }

    case 'rijen_mill': {
      // Vodní mlýn s náhonem a pytli brambor (-880, 110)
      ctx.save();
      drawAuthenticMill(ctx, 0, 0, isNight, 'autumn', time);

      // Sacks of potatoes leaning on the mill wall
      ctx.fillStyle = isNight ? '#3E2A18' : '#A16207';
      ctx.beginPath();
      ctx.ellipse(-28, 60, 12, 15, 0.1, 0, Math.PI * 2);
      ctx.ellipse(-12, 62, 11, 14, -0.1, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'rijen_forest': {
      // Hluboký hvozd a spadané listí (650, 725)
      ctx.save();
      drawAutumnTree(ctx, -40, -10, 1.1, 'russet', isNight);
      drawAutumnTree(ctx, 20, -25, 1.25, 'golden', isNight);
      drawAutumnTree(ctx, 45, 15, 1.0, 'orange', isNight);
      // Fallen leaves on ground
      const leaves = [
        { lx: -25, ly: 25, c: '#EAB308' },
        { lx: 5, ly: 28, c: '#EA580C' },
        { lx: 30, ly: 22, c: '#CA8A04' },
      ];
      for (const l of leaves) {
        ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.ellipse(l.lx, l.ly, 5, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'rijen_shrine': {
      // Boží muka u rozcestí (820, -620)
      ctx.save();
      drawAllSoulsShrine(ctx, 0, 0, 1.15, time, isNight);
      drawAutumnTree(ctx, 45, -15, 0.8, 'golden', isNight);
      ctx.restore();
      break;
    }

    case 'rijen_school': {
      // Obecní škola s dílnou na papírové draky (125, 550)
      ctx.save();
      drawAuthenticSchool(ctx, -6, 0, isNight, 'autumn', time);

      // Displayed paper kites made by children
      if (!isNight) {
        drawPaperKite(ctx, 110, -5, 0.6, -0.15, ['#EC4899', '#FBBF24', '#3B82F6', '#10B981']);
      }
      ctx.restore();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
