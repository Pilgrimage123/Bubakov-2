/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 21 & 22 (Leden v Hrusicích – Den & Noc).
 * Stage 21 (Day): Tříkrálová koleda, zasněžená náves, stavění obřího sněhuláka, kluci na sáňkách.
 * Stage 22 (Night): Tříkrálová tichá noc, svěcená křída K+M+B na faře, vánice a Šeredná Perchta s nožem.
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
    ctx.fillStyle = isNight ? '#064E3B' : '#047857';
    ctx.beginPath();
    ctx.moveTo(0, t.y - t.h);
    ctx.lineTo(t.w, t.y);
    ctx.lineTo(-t.w, t.y);
    ctx.closePath();
    ctx.fill();
    strokeOutline(ctx, 3);

    // Snow cushion on top
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

  ctx.restore();
}

/** Draws a traditional Czech wooden cottage (roubenka) under thick winter snow */
function drawWinterRoubenka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Wooden log walls
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

  // White whitewashed log chinking lines
  ctx.strokeStyle = isNight ? '#475569' : '#FEF3C7';
  ctx.lineWidth = 2;
  const logRows = 5;
  const rowH = height / logRows;
  for (let r = 1; r < logRows; r++) {
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 4, -height / 2 + r * rowH);
    ctx.lineTo(width / 2 - 4, -height / 2 + r * rowH);
    ctx.stroke();
  }

  // Gable roof with massive puffy snow blanket
  const roofOverhang = 18;
  const roofH = height * 0.9;
  ctx.fillStyle = isNight ? '#0F172A' : '#991B1B';
  ctx.beginPath();
  ctx.moveTo(-width / 2 - roofOverhang, -height / 2);
  ctx.lineTo(0, -height / 2 - roofH);
  ctx.lineTo(width / 2 + roofOverhang, -height / 2);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3.5);

  // Thick puffy snow blanket on roof
  ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-width / 2 - roofOverhang - 4, -height / 2);
  ctx.quadraticCurveTo(0, -height / 2 - roofH - 18, width / 2 + roofOverhang + 4, -height / 2);
  ctx.lineTo(width / 2 + roofOverhang - 2, -height / 2 + 6);
  ctx.quadraticCurveTo(0, -height / 2 - roofH + 6, -width / 2 - roofOverhang + 2, -height / 2 + 6);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Golden glowing window
  ctx.fillStyle = '#FDE047';
  const winW = width * 0.28;
  const winH = height * 0.35;
  ctx.fillRect(-winW - 6, -winH / 2, winW, winH);
  strokeOutline(ctx, 2.5);

  ctx.fillRect(6, -winH / 2, winW, winH);
  strokeOutline(ctx, 2.5);

  // Window mullions (cross)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-winW - 6 + winW / 2, -winH / 2);
  ctx.lineTo(-winW - 6 + winW / 2, winH / 2);
  ctx.moveTo(-winW - 6, 0);
  ctx.lineTo(-6, 0);
  ctx.moveTo(6 + winW / 2, -winH / 2);
  ctx.lineTo(6 + winW / 2, winH / 2);
  ctx.moveTo(6, 0);
  ctx.lineTo(6 + winW, 0);
  ctx.stroke();

  ctx.restore();
}

export function drawLedenDecorItem(
  ctx: CanvasRenderingContext2D,
  decor: { type: string; x: number; y: number; scale?: number },
  isNight = false,
  time = 0
): void {
  ctx.save();
  ctx.translate(decor.x, decor.y);
  const s = decor.scale ?? 1;
  ctx.scale(s, s);

  switch (decor.type) {
    case 'leden_border': {
      ctx.save();
      // Massive landscape backdrop with rolling white snowdrifts and bare willows
      const driftColor = isNight ? '#0F172A' : '#F1F5F9';
      const shadowDrift = isNight ? '#020617' : '#E2E8F0';

      // Soft snowy rolling hills
      ctx.fillStyle = shadowDrift;
      ctx.beginPath();
      ctx.arc(-800, -700, 420, 0, Math.PI * 2);
      ctx.arc(800, -600, 480, 0, Math.PI * 2);
      ctx.arc(-600, 700, 460, 0, Math.PI * 2);
      ctx.arc(600, 750, 440, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = driftColor;
      ctx.beginPath();
      ctx.arc(-800, -750, 400, 0, Math.PI * 2);
      ctx.arc(800, -650, 450, 0, Math.PI * 2);
      ctx.arc(-600, 750, 430, 0, Math.PI * 2);
      ctx.arc(600, 800, 410, 0, Math.PI * 2);
      ctx.fill();

      // Frozen Stream with solid ice
      ctx.strokeStyle = isNight ? '#1E293B' : '#BAE6FD';
      ctx.lineWidth = 48;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-1600, 320);
      ctx.bezierCurveTo(-600, 280, 400, 420, 1600, 360);
      ctx.stroke();

      // Dark ink edge on stream banks
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Snow Fence around borders
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      for (let fx = -1200; fx <= 1200; fx += 80) {
        ctx.beginPath();
        ctx.moveTo(fx, -900);
        ctx.lineTo(fx, -860);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-1200, -880);
      ctx.lineTo(1200, -880);
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'leden_fields': {
      ctx.save();
      // Haystack with heavy winter snowcap
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Snow pillow on top
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, -18, 32, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);

      // Wooden hay sled
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-28, 22, 56, 8);
      strokeOutline(ctx, 2);
      ctx.restore();
      break;
    }

    case 'leden_church': {
      ctx.save();
      // Parsonage & Church with sacred K+M+B inscription above wooden door
      ctx.fillStyle = isNight ? '#1E293B' : '#FEF3C7';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-65, -45, 130, 90, 6);
      } else {
        ctx.rect(-65, -45, 130, 90);
      }
      ctx.fill();
      ctx.stroke();

      // Church Tower
      ctx.fillStyle = isNight ? '#0F172A' : '#FDE68A';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-30, -125, 60, 85, 4);
      } else {
        ctx.rect(-30, -125, 60, 85);
      }
      ctx.fill();
      ctx.stroke();

      // Steeple Roof with Snow
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(-35, -125);
      ctx.lineTo(0, -185);
      ctx.lineTo(35, -125);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snow cap on steeple
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-38, -125);
      ctx.quadraticCurveTo(0, -195, 38, -125);
      ctx.lineTo(30, -120);
      ctx.quadraticCurveTo(0, -180, -30, -120);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 2.5);

      // Wooden Arched Doorway with K+M+B chalk inscription
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, 15, 18, Math.PI, 0);
      ctx.lineTo(18, 45);
      ctx.lineTo(-18, 45);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 2.5);

      // Glowing Holy Chalk K+M+B Letters
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px serif';
      ctx.textAlign = 'center';
      ctx.fillText('K + M + B', 0, 8);

      ctx.restore();
      break;
    }

    case 'leden_village': {
      ctx.save();
      // Village square with large decorative Snowman and village stone fountain
      ctx.fillStyle = isNight ? '#334155' : '#94A3B8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center Snowman
      const sBob = Math.sin(time * 3) * 2;
      ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;

      // Bottom snowball
      ctx.beginPath();
      ctx.arc(0, 10 + sBob, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Middle snowball
      ctx.beginPath();
      ctx.arc(0, -8 + sBob, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head snowball
      ctx.beginPath();
      ctx.arc(0, -22 + sBob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Carrot nose
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.moveTo(0, -22 + sBob);
      ctx.lineTo(8, -20 + sBob);
      ctx.lineTo(0, -19 + sBob);
      ctx.closePath();
      ctx.fill();

      // Pot on head
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-6, -26 + sBob);
      ctx.lineTo(-5, -36 + sBob);
      ctx.lineTo(5, -36 + sBob);
      ctx.lineTo(6, -26 + sBob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sled tracks in snow
      ctx.strokeStyle = isNight ? 'rgba(255,255,255,0.4)' : 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-20, -15, 25, 0.2, Math.PI * 0.9);
      ctx.arc(20, 15, 30, Math.PI * 0.8, Math.PI * 1.6);
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'leden_tavern': {
      ctx.save();
      drawWinterRoubenka(ctx, 0, 0, 110, 75, isNight);

      // Cozy smoking chimney
      ctx.fillStyle = '#78350F';
      ctx.fillRect(28, -75, 14, 20);
      strokeOutline(ctx, 2.5);

      const smokeWobble = Math.sin(time * 3) * 6;
      ctx.strokeStyle = isNight ? 'rgba(241, 245, 249, 0.55)' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(35, -77);
      ctx.quadraticCurveTo(35 + smokeWobble, -100, 42, -120);
      ctx.stroke();

      ctx.restore();
      break;
    }

    case 'leden_school': {
      ctx.save();
      drawWinterRoubenka(ctx, 0, 0, 100, 70, isNight);

      // Star of Bethlehem above entrance
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(0, -28, 6, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 1.5);
      ctx.restore();
      break;
    }

    case 'leden_pond': {
      ctx.save();
      // Completely frozen pond with ice skates grooves
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

    case 'leden_mill': {
      ctx.save();
      // Mill with frozen icicles hanging from waterwheel
      ctx.fillStyle = isNight ? '#1C1917' : '#78350F';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-45, -30, 90, 60, 4);
      } else {
        ctx.rect(-45, -30, 90, 60);
      }
      ctx.fill();
      ctx.stroke();

      // Frozen Wheel
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-55, 10, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Icicles
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

    case 'leden_forest': {
      ctx.save();
      drawWinterPine(ctx, -45, -20, 1.25, isNight);
      drawWinterPine(ctx, 40, -35, 1.15, isNight);
      drawWinterPine(ctx, 55, 25, 1.0, isNight);
      drawWinterPine(ctx, -20, 30, 0.9, isNight);
      ctx.restore();
      break;
    }

    case 'leden_shrine': {
      ctx.save();
      // Snowy Wayside Shrine with glowing lantern inside niche
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

export function drawLedenDecoration(
  ctx: CanvasRenderingContext2D,
  decor: { type: string; x: number; y: number; scale?: number } | string,
  _timeOrScale: number = 0,
  isNight = false,
  time = 0
): void {
  const item = typeof decor === 'string' ? { type: decor, x: 0, y: 0 } : decor;
  drawLedenDecorItem(ctx, item, typeof isNight === 'boolean' ? isNight : false, time);
}
