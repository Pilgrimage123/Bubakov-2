/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 19 & 20 (Prosinec v Hrusicích – Den & Noc).
 * Stage 19 (Day): Mikulášská obchůzka, zasněžená náves, adventní věnec, kluci na sáňkách a čertovské maškary.
 * Stage 20 (Night): Štědrovečerní tichá noc, slavnostní zvon v kostele sv. Mikuláše, vánice a Král Mrazík.
 * Strictly adheres to the Ladovský kodex: #1A1412 ink outlines, pure white snowdrifts with blue tints,
 * warm golden cottage windows, snow cushions on gables, and Christmas star reflections.
 */

const INK = '#1A1412';

function strokeOutline(ctx: CanvasRenderingContext2D, width = 3.5) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Draws a snow-laden pine or fir tree with snow blankets */
function drawWinterPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Soft blue-white snow shadow
  ctx.fillStyle = isNight ? 'rgba(3, 7, 18, 0.45)' : 'rgba(148, 163, 184, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brown trunk
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-6, 12, 12, 24);
  strokeOutline(ctx, 3);

  // Tiered green pine boughs with thick snow cushions on top
  const tiers = [
    { y: 16, w: 46, h: 22, snowH: 10 },
    { y: -2, w: 38, h: 20, snowH: 9 },
    { y: -18, w: 28, h: 18, snowH: 8 },
    { y: -32, w: 16, h: 16, snowH: 7 },
  ];

  for (const t of tiers) {
    // Green needles
    ctx.fillStyle = isNight ? '#064E3B' : '#047857';
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h);
    ctx.lineTo(t.w, t.y);
    ctx.lineTo(-t.w, t.y);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 3);

    // Pure white snow cushion resting on needles
    ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h);
    ctx.lineTo(t.w * 0.75, t.y - t.h * 0.4);
    ctx.quadraticCurveTo(0, t.y - t.snowH, -t.w * 0.75, t.y - t.h * 0.4);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 2.5);
  }

  ctx.restore();
}

export function drawProsinecDecoration(
  ctx: CanvasRenderingContext2D,
  itemOrType: { type: string; x?: number; y?: number; scale?: number } | string,
  timeOrX: number = 0,
  isNightOrY: boolean | number = false,
  maybeTime = 0,
  maybeIsNight = false
) {
  const isObj = typeof itemOrType === 'object' && itemOrType !== null;
  const type = isObj ? itemOrType.type : itemOrType;
  const x = isObj ? 0 : timeOrX;
  const y = isObj ? 0 : (typeof isNightOrY === 'number' ? isNightOrY : 0);
  const time = isObj ? timeOrX : maybeTime;
  const isNight = isObj ? Boolean(isNightOrY) : maybeIsNight;

  ctx.save();
  if (x !== 0 || y !== 0) {
    ctx.translate(x, y);
  }

  switch (type) {
    case 'prosinec_border': {
      ctx.save();

      // Snow-covered paths (trampled white snow with icy grey borders)
      ctx.strokeStyle = isNight ? '#1E293B' : '#E2E8F0';
      ctx.lineWidth = 56;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-800, -650);
      ctx.quadraticCurveTo(-380, -350, 50, -75);
      ctx.lineTo(440, -75);
      ctx.quadraticCurveTo(430, -280, 425, -455);
      ctx.quadraticCurveTo(460, 180, 475, 420);
      ctx.quadraticCurveTo(80, 240, 125, 550);
      ctx.quadraticCurveTo(-410, 20, -880, 110);
      ctx.stroke();

      // Completely frozen solid brook (white ice and blue cracks)
      ctx.strokeStyle = INK;
      ctx.lineWidth = 96;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#0B132B' : '#BAE6FD';
      ctx.lineWidth = 86;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#1E293B' : '#F8FAFC';
      ctx.lineWidth = 42;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      // Two wooden snow-capped bridges
      const bridges = [
        { bx: 425, by: -455, w: 90, h: 52 },
        { bx: 475, by: 420, w: 90, h: 52 },
      ];
      for (const br of bridges) {
        ctx.fillStyle = isNight ? '#1E293B' : '#451A03';
        ctx.fillRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.strokeRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);

        // Snow on railings
        ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFFFF';
        ctx.fillRect(br.bx - br.w / 2, br.by - br.h / 2 - 4, br.w, 6);
        ctx.fillRect(br.bx - br.w / 2, br.by + br.h / 2 - 2, br.w, 6);
      }

      // Title Cartouche top center with Christmas star
      ctx.fillStyle = isNight ? '#0F172A' : '#F8FAFC';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-240, -1630, 480, 56, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isNight ? '#F8FAFC' : '#0F172A';
      ctx.font = 'bold 22px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNight ? 'ŠTĚDROVEČERNÍ NOC V HRUSICÍCH' : 'MIKULÁŠSKÁ OBCHŮZKA V HRUSICÍCH', 0, -1602);

      ctx.restore();
      break;
    }

    case 'prosinec_fields': {
      ctx.save();
      // Snowy plains with firs and snowbanks
      drawWinterPine(ctx, -70, -20, 1.2, isNight);
      drawWinterPine(ctx, 80, 30, 0.95, isNight);

      // Huge white snowdrift
      ctx.fillStyle = isNight ? '#334155' : '#F1F5F9';
      ctx.beginPath();
      ctx.ellipse(-10, 20, 46, 20, 0.05, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'prosinec_church': {
      ctx.save();
      // Church of St. Nicholas with snowy roof and bell tower (Interactive POI)
      ctx.fillStyle = isNight ? '#1E293B' : '#E2E8F0';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-45, -35, 90, 70, 6);
      ctx.fill();
      ctx.stroke();

      // Steeple with thick snow cover
      ctx.fillStyle = isNight ? '#0F172A' : '#64748B';
      ctx.beginPath();
      ctx.moveTo(-35, -35);
      ctx.lineTo(0, -95);
      ctx.lineTo(35, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snow on steeple
      ctx.fillStyle = isNight ? '#94A3B8' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-20, -60);
      ctx.lineTo(0, -95);
      ctx.lineTo(20, -60);
      ctx.closePath();
      ctx.fill();

      // Big Christmas Bell inside the open arch
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -12, 10, Math.PI, 0);
      ctx.lineTo(12, 2);
      ctx.lineTo(-12, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clapper
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden St. Nicholas Star on top
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(0, -102, 6, 0, Math.PI * 2);
      ctx.fill();

      drawWinterPine(ctx, 65, 15, 1.05, isNight);
      ctx.restore();
      break;
    }

    case 'prosinec_village': {
      ctx.save();
      // Village green with Christmas tree and Advent Wreath (Interactive POI)
      drawWinterPine(ctx, 0, -20, 1.4, isNight);

      // Advent Wreath around the base
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 25, 24, 0, Math.PI * 2);
      ctx.stroke();

      // 4 Advent Candles
      const candlePositions = [
        { cx: -20, cy: 20 },
        { cx: 20, cy: 20 },
        { cx: -10, cy: 35 },
        { cx: 10, cy: 35 },
      ];
      for (const cp of candlePositions) {
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(cp.cx - 2.5, cp.cy - 10, 5, 10);
        strokeOutline(ctx, 1.5);
        // Golden Flame
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(cp.cx, cp.cy - 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Traditional snowman on the side
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(60, 20, 14, 0, Math.PI * 2);
      ctx.arc(60, 0, 10, 0, Math.PI * 2);
      ctx.arc(60, -14, 7, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);

      // Carrot nose and coal hat
      ctx.fillStyle = '#EA580C';
      ctx.fillRect(66, -16, 8, 3);
      ctx.fillStyle = '#18181B';
      ctx.fillRect(54, -26, 12, 6);
      ctx.fillRect(50, -20, 20, 3);
      ctx.restore();
      break;
    }

    case 'prosinec_tavern': {
      ctx.save();
      // Warm tavern U Sejků with smoke from chimney and snow on roof
      ctx.fillStyle = isNight ? '#1C1917' : '#FDE68A';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-60, -40, 120, 80, 4);
      ctx.fill();
      ctx.stroke();

      // Red roof with snow cushion
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(-70, -40);
      ctx.lineTo(0, -85);
      ctx.lineTo(70, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snow on roof
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-74, -40);
      ctx.quadraticCurveTo(0, -96, 74, -40);
      ctx.lineTo(65, -34);
      ctx.quadraticCurveTo(0, -80, -65, -34);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 2.5);

      // Glowing golden windows
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(-45, -20, 22, 22);
      ctx.fillRect(25, -20, 22, 22);
      strokeOutline(ctx, 2);

      // Chimney with cozy woodsmoke
      ctx.fillStyle = '#78350F';
      ctx.fillRect(32, -90, 14, 20);
      strokeOutline(ctx, 2.5);

      const smokeWobble = Math.sin(time * 3) * 6;
      ctx.strokeStyle = isNight ? 'rgba(241, 245, 249, 0.55)' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(39, -92);
      ctx.quadraticCurveTo(39 + smokeWobble, -115, 45, -135);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'prosinec_school': {
      ctx.save();
      // Village school with frost flowers on glass
      ctx.fillStyle = isNight ? '#1E293B' : '#FEF3C7';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-50, -35, 100, 70, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isNight ? '#334155' : '#B45309';
      ctx.beginPath();
      ctx.moveTo(-58, -35);
      ctx.lineTo(0, -75);
      ctx.lineTo(58, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snow blanket on school roof
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-62, -35);
      ctx.quadraticCurveTo(0, -85, 62, -35);
      ctx.lineTo(52, -30);
      ctx.quadraticCurveTo(0, -70, -52, -30);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 2);
      ctx.restore();
      break;
    }

    case 'prosinec_pond': {
      ctx.save();
      // Completely frozen pond Brčálník with smooth skating ice
      ctx.fillStyle = isNight ? '#0F172A' : '#BAE6FD';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 55, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White ice skates grooves
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-20, -10, 25, 0.2, Math.PI * 0.9);
      ctx.arc(15, 10, 30, Math.PI * 0.8, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'prosinec_mill': {
      ctx.save();
      // Mill with frozen icicles hanging from waterwheel
      ctx.fillStyle = isNight ? '#1C1917' : '#78350F';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-45, -30, 90, 60, 4);
      ctx.fill();
      ctx.stroke();

      // Frozen Wheel
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-55, 10, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Sharp icicles hanging from the roof
      ctx.fillStyle = '#BAE6FD';
      for (let ix = -40; ix <= 40; ix += 10) {
        ctx.beginPath();
        ctx.moveTo(ix, -30);
        ctx.lineTo(ix + 4, -30);
        ctx.lineTo(ix + 2, -18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'prosinec_forest': {
      ctx.save();
      // Deep Snowy Pine Forest
      drawWinterPine(ctx, -45, -20, 1.25, isNight);
      drawWinterPine(ctx, 40, -35, 1.15, isNight);
      drawWinterPine(ctx, 55, 25, 1.0, isNight);
      drawWinterPine(ctx, -20, 30, 0.9, isNight);
      ctx.restore();
      break;
    }

    case 'prosinec_shrine': {
      ctx.save();
      // Snowy Wayside Shrine with glowing lantern inside niche
      ctx.fillStyle = isNight ? '#334155' : '#CBD5E1';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-10, -25, 20, 50, 2);
      ctx.fill();
      ctx.stroke();

      // Snow on top of shrine
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
  }

  ctx.restore();
}
