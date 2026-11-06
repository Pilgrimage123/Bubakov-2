/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 23 & 24 (Únor v Hrusicích – Den & Noc).
 * Stage 23 (Day): Masopustní průvod a koblihy, hostinec U Cikánů, vycpaný medvěd, laufrové a slaměníci.
 * Stage 24 (Night): Masopustní rej a pochovávání basy, stará márnice, louče, bujarý Bakchus.
 * Strictly adheres to the Ladovský kodex: #1A1412 ink outlines, festive ribbons, warm golden tavern glow,
 * snow-covered village cottages, and authentic Czech winter folk carnival motifs.
 */

const INK = '#1A1412';

function strokeOutline(ctx: CanvasRenderingContext2D, width = 3.5) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Draws a snow-laden winter pine with festive carnival ribbons */
function drawCarnivalPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Soft snow shadow
  ctx.fillStyle = isNight ? 'rgba(3, 7, 18, 0.45)' : 'rgba(148, 163, 184, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-6, 12, 12, 24);
  strokeOutline(ctx, 3);

  // Pine boughs
  const tiers = [
    { y: 16, w: 46, h: 22, snowH: 10 },
    { y: -2, w: 38, h: 20, snowH: 9 },
    { y: -18, w: 28, h: 18, snowH: 8 },
    { y: -32, w: 16, h: 16, snowH: 7 },
  ];

  for (const t of tiers) {
    ctx.fillStyle = isNight ? '#064E3B' : '#047857';
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h);
    ctx.lineTo(t.w, t.y);
    ctx.lineTo(-t.w, t.y);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 3);

    // Snow cushion
    ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h - 2);
    ctx.quadraticCurveTo(t.w * 0.5, t.y - t.h + t.snowH, t.w + 2, t.y);
    ctx.quadraticCurveTo(0, t.y - 4, -t.w - 2, t.y);
    ctx.quadraticCurveTo(-t.w * 0.5, t.y - t.h + t.snowH, 0, t.y - t.h - 2);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 2.5);
  }

  // Colorful ribbons hanging from branches
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.quadraticCurveTo(-22, 12, -18, 20);
  ctx.stroke();

  ctx.strokeStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(18, -12);
  ctx.quadraticCurveTo(24, -4, 20, 8);
  ctx.stroke();

  ctx.restore();
}

/** Draws a traditional Czech wooden cottage (roubenka) decorated for Masopust */
function drawCarnivalRoubenka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Log walls
  ctx.fillStyle = isNight ? '#1E1B18' : '#78350F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(-width / 2, -height / 2, width, height, 4);
  } else {
    ctx.rect(-width / 2, -height / 2, width, height);
  }
  ctx.fill();
  ctx.stroke();

  // Chinking lines
  ctx.strokeStyle = isNight ? '#475569' : '#FEF3C7';
  ctx.lineWidth = 2;
  const logSteps = 4;
  for (let i = 1; i < logSteps; i++) {
    const ly = -height / 2 + (height / logSteps) * i;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 3, ly);
    ctx.lineTo(width / 2 - 3, ly);
    ctx.stroke();
  }

  // Windows with warm light
  const winW = 16;
  const winH = 20;
  const winY = -2;
  const winXs = [-width / 4, width / 4];
  for (const wx of winXs) {
    ctx.fillStyle = isNight ? '#FDE047' : '#FEF08A';
    ctx.fillRect(wx - winW / 2, winY - winH / 2, winW, winH);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(wx - winW / 2, winY - winH / 2, winW, winH);

    // Cross panes
    ctx.beginPath();
    ctx.moveTo(wx, winY - winH / 2);
    ctx.lineTo(wx, winY + winH / 2);
    ctx.moveTo(wx - winW / 2, winY);
    ctx.lineTo(wx + winW / 2, winY);
    ctx.stroke();
  }

  // Snow-covered Gable Roof
  const roofOver = 18;
  const roofH = height * 0.85;
  const roofTopY = -height / 2 - roofH;
  ctx.fillStyle = isNight ? '#334155' : '#B45309';
  ctx.beginPath();
  ctx.moveTo(0, roofTopY);
  ctx.lineTo(width / 2 + roofOver, -height / 2 + 4);
  ctx.lineTo(-width / 2 - roofOver, -height / 2 + 4);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3.5);

  // Snow pillow on roof
  ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, roofTopY - 6);
  ctx.quadraticCurveTo(width * 0.35, roofTopY + roofH * 0.45, width / 2 + roofOver + 4, -height / 2 + 4);
  ctx.lineTo(-width / 2 - roofOver - 4, -height / 2 + 4);
  ctx.quadraticCurveTo(-width * 0.35, roofTopY + roofH * 0.45, 0, roofTopY - 6);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Chimney with cozy smoke
  const chimX = width * 0.22;
  const chimY = roofTopY + 12;
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(chimX - 6, chimY - 18, 12, 22);
  strokeOutline(ctx, 2.5);

  ctx.fillStyle = isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(255, 255, 255, 0.65)';
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    ctx.arc(chimX + s * 4, chimY - 26 - s * 12, 6 + s * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Masopust wreath with ribbons on door
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, height / 2 - 10, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, height / 2 - 18, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws the grand Hostinec U Cikánů tavern with frying cauldron and barrel */
function drawCarnivalTavern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Large tavern building
  drawCarnivalRoubenka(ctx, 0, 0, 140, 75, isNight);

  // Tavern signboard (Hostinec U Cikánů)
  ctx.fillStyle = '#78350F';
  ctx.fillRect(-28, -78, 56, 18);
  strokeOutline(ctx, 2.5);

  // Hanging Beer Mug icon
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-8, -58, 16, 14);
  strokeOutline(ctx, 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-8, -62, 16, 5);

  // Iron frying cauldron with steam (koblihy)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(60, 24, 18, 0, Math.PI);
  ctx.fill();
  strokeOutline(ctx, 3);

  // Bubbling golden oil & floating doughnuts
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(44, 20, 32, 5);
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(52, 18, 4, 0, Math.PI * 2);
  ctx.arc(64, 17, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Steam curls
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, 12);
  ctx.quadraticCurveTo(50, 4, 56, -4);
  ctx.moveTo(66, 12);
  ctx.quadraticCurveTo(70, 4, 64, -4);
  ctx.stroke();

  // Wooden beer keg standing beside tavern
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(-62, 22, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-62, 14, 13, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(-62, 28, 13, 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/** Draws the Church & Old Mortuary (Stará márnice) with ceremonial funeral catafalque */
function drawCarnivalChurchAndMortuary(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Church main hall
  ctx.fillStyle = isNight ? '#1E293B' : '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(-60, -30, 120, 65);
  ctx.fill();
  ctx.stroke();

  // Steep roof with snow
  ctx.fillStyle = isNight ? '#0F172A' : '#7F1D1D';
  ctx.beginPath();
  ctx.moveTo(0, -95);
  ctx.lineTo(68, -30);
  ctx.lineTo(-68, -30);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 4);

  // Snow on church roof
  ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -99);
  ctx.quadraticCurveTo(34, -65, 72, -30);
  ctx.lineTo(-72, -30);
  ctx.quadraticCurveTo(-34, -65, 0, -99);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Church bell tower
  ctx.fillStyle = isNight ? '#1E293B' : '#CBD5E1';
  ctx.fillRect(-18, -135, 36, 45);
  strokeOutline(ctx, 3.5);

  // Tower spire & cross
  ctx.fillStyle = isNight ? '#047857' : '#059669';
  ctx.beginPath();
  ctx.moveTo(0, -170);
  ctx.lineTo(18, -135);
  ctx.lineTo(-18, -135);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3.5);

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -182);
  ctx.lineTo(0, -170);
  ctx.moveTo(-5, -177);
  ctx.lineTo(5, -177);
  ctx.stroke();

  // Gothic arched windows with soft candlelight
  ctx.fillStyle = isNight ? '#FEF08A' : '#FDE047';
  ctx.beginPath();
  ctx.arc(-26, -2, 10, Math.PI, 0);
  ctx.rect(-36, -2, 20, 24);
  ctx.arc(26, -2, 10, Math.PI, 0);
  ctx.rect(16, -2, 20, 24);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  // Mortuary catafalque table with draped double bass in front
  ctx.fillStyle = '#09090B';
  ctx.fillRect(-25, 42, 50, 16);
  strokeOutline(ctx, 3);

  // Double bass lying in state
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(0, 40, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  strokeOutline(ctx, 2.5);

  // Black funeral ribbon
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, 36);
  ctx.lineTo(16, 44);
  ctx.stroke();

  // Torch / candles at corners of catafalque
  const torchXs = [-26, 26];
  for (const tx of torchXs) {
    ctx.fillStyle = '#78350F';
    ctx.fillRect(tx - 2, 30, 4, 18);
    // Flickering torch flame
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(tx, 27, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(tx, 28, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Draws the frozen village pond Brčálník with festive skaters and carnival ribbons */
function drawCarnivalPond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Frozen ice surface
  ctx.fillStyle = isNight ? '#1E293B' : '#BAE6FD';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 85, 46, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ice skate scratch marks
  ctx.strokeStyle = isNight ? '#38BDF8' : '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-22, -6, 20, 0.4, 2.2);
  ctx.arc(18, 8, 26, 2.8, 4.4);
  ctx.arc(5, -12, 14, 1.2, 3.4);
  ctx.stroke();

  // Snowbanks along pond shore
  ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-72, -18, 18, 0, Math.PI * 2);
  ctx.arc(-55, -34, 16, 0, Math.PI * 2);
  ctx.arc(68, 22, 19, 0, Math.PI * 2);
  ctx.fill();

  // Reeds poking through ice
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.5;
  const reedXs = [-62, -56, 58, 65, 72];
  for (const rx of reedXs) {
    ctx.beginPath();
    ctx.moveTo(rx, 22);
    ctx.lineTo(rx + 4, 4);
    ctx.stroke();
    // Bulrush head
    ctx.fillStyle = '#451A03';
    ctx.fillRect(rx + 2, 4, 3, 8);
  }

  ctx.restore();
}

/** Draws the festive Carnival Border enclosing the 3200px arena */
function drawCarnivalBorder(
  ctx: CanvasRenderingContext2D,
  _isNight = false
) {
  ctx.save();
  // Ladovské rustic ink border with garland corners
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.strokeRect(-1600, -1600, 3200, 3200);

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(-1585, -1585, 3170, 3170);

  ctx.restore();
}

export function drawUnorDecorItem(
  ctx: CanvasRenderingContext2D,
  decor: { type: string; x: number; y: number; scale?: number },
  isNight = false,
  _time = 0
): void {
  ctx.save();
  ctx.translate(decor.x, decor.y);
  const s = decor.scale || 1;
  ctx.scale(s, s);

  switch (decor.type) {
    case 'unor_border':
      drawCarnivalBorder(ctx, isNight);
      break;

    case 'unor_fields': {
      ctx.save();
      // Snowy field haystacks draped in carnival paper chains
      ctx.fillStyle = isNight ? '#334155' : '#EAB308';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(-35, 10, 22, 28, 0, Math.PI, Math.PI * 2);
      ctx.ellipse(35, 14, 25, 32, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Snow on top of haystacks
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-35, -16, 18, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(35, -16, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'unor_church':
      drawCarnivalChurchAndMortuary(ctx, 0, 0, isNight);
      break;

    case 'unor_village': {
      ctx.save();
      drawCarnivalRoubenka(ctx, -55, -20, 75, 45, isNight);
      drawCarnivalRoubenka(ctx, 50, -10, 80, 48, isNight);
      // Village fountain with garland
      ctx.fillStyle = isNight ? '#1E293B' : '#94A3B8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 30, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'unor_tavern':
      drawCarnivalTavern(ctx, 0, 0, isNight);
      break;

    case 'unor_pond':
      drawCarnivalPond(ctx, 0, 0, isNight);
      break;

    case 'unor_mill': {
      ctx.save();
      // Timber mill with snow on wheel
      drawCarnivalRoubenka(ctx, 0, 0, 95, 55, isNight);
      // Water wheel with icicles
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(62, 10, 24, 0, Math.PI * 2);
      ctx.stroke();
      strokeOutline(ctx, 3);
      ctx.restore();
      break;
    }

    case 'unor_forest': {
      ctx.save();
      drawCarnivalPine(ctx, -45, -20, 1.25, isNight);
      drawCarnivalPine(ctx, 40, -35, 1.15, isNight);
      drawCarnivalPine(ctx, 55, 25, 1.0, isNight);
      drawCarnivalPine(ctx, -20, 30, 0.9, isNight);
      ctx.restore();
      break;
    }

    case 'unor_shrine': {
      ctx.save();
      // Wayside Shrine with festive evergreen garland
      ctx.fillStyle = isNight ? '#334155' : '#CBD5E1';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-10, -25, 20, 50, 2);
      } else {
        ctx.rect(-10, -25, 20, 50);
      }
      ctx.fill();
      ctx.stroke();

      // Evergreen garland around pillar
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.quadraticCurveTo(0, -2, 12, -8);
      ctx.stroke();

      // Snow on top
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.fillRect(-12, -28, 24, 6);
      strokeOutline(ctx, 2);

      // Lantern Niche with warm light
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(0, -10, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'unor_school': {
      ctx.save();
      drawCarnivalRoubenka(ctx, 0, 0, 105, 60, isNight);
      // School bell cupola on roof
      ctx.fillStyle = '#B45309';
      ctx.fillRect(-8, -62, 16, 16);
      strokeOutline(ctx, 2);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, -54, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}

export function drawUnorDecoration(
  ctx: CanvasRenderingContext2D,
  decor: { type: string; x: number; y: number; scale?: number } | string,
  _timeOrScale: number = 0,
  isNight = false,
  time = 0
): void {
  const item = typeof decor === 'string' ? { type: decor, x: 0, y: 0 } : decor;
  drawUnorDecorItem(ctx, item, typeof isNight === 'boolean' ? isNight : false, time);
}
