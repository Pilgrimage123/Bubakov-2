import { drawMarchThawDynamicLandmark } from './marchThawSvgLandscape';
import { CERVENEC_SHEAF_OBSTACLES } from '../data/cervenecArena';

const INK = '#23170F';

function strokeAndFill(
  ctx: CanvasRenderingContext2D,
  fill: string,
  stroke = INK,
  lineWidth = 3
): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawPoppyFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r = 7, isNight = false): void {
  ctx.save();
  ctx.translate(x, y);
  const petalFill = isNight ? '#991B1B' : '#EF4444';
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + 0.3;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * (r * 0.45), Math.sin(ang) * (r * 0.45), r * 0.58, 0, Math.PI * 2);
    strokeAndFill(ctx, petalFill, INK, 1.8);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
  strokeAndFill(ctx, '#18181B', INK, 1.4);
  ctx.restore();
}

function drawCornflower(ctx: CanvasRenderingContext2D, x: number, y: number, r = 6.5, isNight = false): void {
  ctx.save();
  ctx.translate(x, y);
  const petalFill = isNight ? '#1D4ED8' : '#3B82F6';
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(ang) * (r * 0.5), Math.sin(ang) * (r * 0.5), r * 0.52, r * 0.28, ang, 0, Math.PI * 2);
    strokeAndFill(ctx, petalFill, INK, 1.5);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  strokeAndFill(ctx, '#1E3A8A', INK, 1.2);
  ctx.restore();
}

/**
 * Draws a conical golden grain sheaf (Panák / mandel žita) in authentic Josef Lada ink style.
 */
function drawGrainSheafPanak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(10, 15, 30, 0.48)' : 'rgba(92, 58, 24, 0.28)';
  ctx.beginPath();
  ctx.ellipse(4, 16, radius * 1.08, radius * 0.56, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base splayed stalks (postavené snopy do panáka)
  const strawFill = isNight ? '#A16207' : '#FACC15';
  const strawShade = isNight ? '#713F12' : '#EAB308';
  const tieColor = isNight ? '#B45309' : '#D97706';

  ctx.beginPath();
  ctx.moveTo(-radius * 0.92, 14);
  ctx.quadraticCurveTo(-radius * 0.55, -radius * 0.35, -radius * 0.22, -radius * 0.95);
  ctx.lineTo(radius * 0.22, -radius * 0.95);
  ctx.quadraticCurveTo(radius * 0.55, -radius * 0.35, radius * 0.92, 14);
  ctx.quadraticCurveTo(0, 22, -radius * 0.92, 14);
  ctx.closePath();
  strokeAndFill(ctx, strawFill, INK, 3.0);

  // Inner sheaf shadow & vertical stalk lines
  ctx.strokeStyle = strawShade;
  ctx.lineWidth = 2.0;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4, -radius * 0.8);
    ctx.lineTo(i * 10, 12);
    ctx.stroke();
  }

  // Ink contour lines for bundled sheaves
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.75);
  ctx.lineTo(0, 16);
  ctx.moveTo(-radius * 0.15, -radius * 0.65);
  ctx.lineTo(-radius * 0.48, 13);
  ctx.moveTo(radius * 0.15, -radius * 0.65);
  ctx.lineTo(radius * 0.48, 13);
  ctx.stroke();

  // Twisted straw binding band (povříslo) around the waist
  ctx.beginPath();
  ctx.roundRect(-radius * 0.54, -4, radius * 1.08, 8, 4);
  strokeAndFill(ctx, tieColor, INK, 2.2);

  // Conical cap sheaf on top (klobouk panáka) with drooping rye ears
  const sway = Math.sin(time * 2.2 + x * 0.02) * 1.8;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.55 + sway, -radius * 0.42);
  ctx.quadraticCurveTo(0 + sway, -radius * 1.28, radius * 0.55 + sway, -radius * 0.42);
  ctx.quadraticCurveTo(0 + sway, -radius * 0.28, -radius * 0.55 + sway, -radius * 0.42);
  ctx.closePath();
  strokeAndFill(ctx, isNight ? '#CA8A04' : '#FDE047', INK, 2.6);

  // Red poppy & blue cornflower tucked into the sheaf base
  drawPoppyFlower(ctx, -radius * 0.62, 10, 6, isNight);
  drawCornflower(ctx, radius * 0.58, 11, 5.5, isNight);

  ctx.restore();
}

/**
 * Draws the festive Poutní střelnice (Fairground Shooting Gallery) & colorful ribbons on the village green.
 */
function drawPoutniStrelniceBooth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(8, 12, 24, 0.52)' : 'rgba(78, 46, 18, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 76, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wooden booth counter (spodní pult střelnice)
  ctx.beginPath();
  ctx.roundRect(-62, -4, 124, 30, 5);
  strokeAndFill(ctx, isNight ? '#78350F' : '#B45309', INK, 2.8);

  // Festive red-and-white striped front bunting
  for (let i = -3; i <= 2; i++) {
    ctx.beginPath();
    ctx.rect(i * 20, -2, 20, 10);
    strokeAndFill(ctx, i % 2 === 0 ? (isNight ? '#991B1B' : '#EF4444') : (isNight ? '#E2E8F0' : '#FFFBEB'), INK, 1.8);
  }

  // Back wall & side posts
  ctx.beginPath();
  ctx.rect(-58, -48, 116, 44);
  strokeAndFill(ctx, isNight ? '#1E293B' : '#FEF3C7', INK, 2.6);

  // Target shelf & 3 spinning tin targets (cínové terče) + paper roses (papírové růže)
  for (let t = -1; t <= 1; t++) {
    const tx = t * 34;
    const ty = -26;
    const bob = Math.sin(time * 3.5 + t * 1.4) * 1.5;

    // Target concentric rings
    ctx.beginPath();
    ctx.arc(tx, ty + bob, 11, 0, Math.PI * 2);
    strokeAndFill(ctx, '#F8FAFC', INK, 2.0);
    ctx.beginPath();
    ctx.arc(tx, ty + bob, 6.5, 0, Math.PI * 2);
    strokeAndFill(ctx, '#EF4444', INK, 1.5);
    ctx.beginPath();
    ctx.arc(tx, ty + bob, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill();

    // Paper rose on wire stem beside each target
    drawPoppyFlower(ctx, tx + 13, ty - 7 + bob, 5.2, isNight);
  }

  // Striped canopy awning (pruhovaná stříška střelnice)
  ctx.beginPath();
  ctx.moveTo(-70, -46);
  ctx.lineTo(-56, -68);
  ctx.lineTo(56, -68);
  ctx.lineTo(70, -46);
  ctx.closePath();
  strokeAndFill(ctx, isNight ? '#991B1B' : '#DC2626', INK, 2.8);

  // Canopy white stripes
  for (let s = -2; s <= 2; s += 2) {
    ctx.beginPath();
    ctx.moveTo(s * 18 - 9, -46);
    ctx.lineTo(s * 15 - 7, -68);
    ctx.lineTo(s * 15 + 7, -68);
    ctx.lineTo(s * 18 + 9, -46);
    ctx.closePath();
    strokeAndFill(ctx, isNight ? '#CBD5E1' : '#FFFFFF', INK, 1.8);
  }

  // Signboard "STŘELNICE"
  ctx.beginPath();
  ctx.roundRect(-44, -82, 88, 16, 4);
  strokeAndFill(ctx, isNight ? '#FDE047' : '#FEF08A', INK, 2.2);
  ctx.fillStyle = INK;
  ctx.font = '900 10px "Inter", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STŘELNICE', 0, -74);

  // Warm lantern glow at night
  if (isNight) {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -24, 52 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawCervenecDecoration(
  ctx: CanvasRenderingContext2D,
  itemOrType: string | { type: string; x?: number; y?: number; scale?: number },
  timeOrX = 0,
  isNightOrY: boolean | number = false,
  scale = 1,
  timeArg = 0,
  isNightArg = false
): boolean {
  let type: string;
  let x = 0;
  let y = 0;
  let s = 1;
  let time = 0;
  let isNight = false;

  if (typeof itemOrType === 'object' && itemOrType !== null) {
    type = itemOrType.type || '';
    time = typeof timeOrX === 'number' ? timeOrX : 0;
    isNight = Boolean(isNightOrY);
  } else {
    type = String(itemOrType || '');
    if (typeof isNightOrY === 'boolean') {
      time = typeof timeOrX === 'number' ? timeOrX : 0;
      isNight = isNightOrY;
    } else {
      x = typeof timeOrX === 'number' ? timeOrX : 0;
      y = typeof isNightOrY === 'number' ? isNightOrY : 0;
      s = scale;
      time = timeArg;
      isNight = isNightArg;
    }
  }

  if (!type.startsWith('cervenec_')) return false;

  if (type === 'cervenec_border') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    drawMarchThawDynamicLandmark(ctx, 'march_banner', time, isNight);

    // Top Cartouche: "ČERVENEC" in golden rye harvest or St. Elias storm theme
    const bannerY = -1340;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-225, bannerY - 40, 450, 78, 14);
    } else {
      ctx.rect(-225, bannerY - 40, 450, 78);
    }
    strokeAndFill(
      ctx,
      isNight ? '#1E1B4B' : '#FEF08A',
      INK,
      4.5
    );

    // Inner decorative border
    ctx.strokeStyle = isNight ? '#38BDF8' : '#D97706';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-215, bannerY - 31, 430, 60);

    // Crossed golden sickles & grain ears on left and right of cartouche
    drawPoppyFlower(ctx, -185, bannerY, 12, isNight);
    drawCornflower(ctx, -158, bannerY - 6, 10, isNight);
    drawPoppyFlower(ctx, 185, bannerY, 12, isNight);
    drawCornflower(ctx, 158, bannerY - 6, 10, isNight);

    ctx.fillStyle = isNight ? '#E0F2FE' : INK;
    ctx.font = '900 40px "Inter", "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ČERVENEC', 0, bannerY + 1);

    ctx.restore();
    return true;
  }

  const marchEquivalent = type.replace('cervenec_', 'march_');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  drawMarchThawDynamicLandmark(ctx, marchEquivalent, time, isNight);

  if (type === 'cervenec_fields') {
    // Draw golden stubble ridges, poppies, cornflowers, and the 4 solid grain sheaf panáky
    const stubblePositions = [
      { dx: -230, dy: -45 },
      { dx: -95, dy: 55 },
      { dx: 75, dy: -35 },
      { dx: 215, dy: 45 },
      { dx: 310, dy: -60 },
    ];
    for (const pos of stubblePositions) {
      drawPoppyFlower(ctx, pos.dx, pos.dy, 6.5, isNight);
      drawCornflower(ctx, pos.dx + 22, pos.dy - 8, 6.0, isNight);
    }

    for (let i = 0; i < CERVENEC_SHEAF_OBSTACLES.length; i++) {
      const obs = CERVENEC_SHEAF_OBSTACLES[i];
      if (obs.shape === 'circle') {
        drawGrainSheafPanak(ctx, obs.x, obs.y, obs.radius || 44, time, isNight);
      }
    }
  } else if (type === 'cervenec_village') {
    // Draw the Poutní střelnice booth on the Hrusice village green
    drawPoutniStrelniceBooth(ctx, 65, -135, time, isNight);
  } else if (type === 'cervenec_forest') {
    // Draw ripe red raspberry bushes (maliní) at the forest edge
    const bushes = [
      { bx: 85, by: 65 },
      { bx: 145, by: 30 },
      { bx: 45, by: 110 },
    ];
    for (const b of bushes) {
      ctx.beginPath();
      ctx.arc(b.bx, b.by, 18, 0, Math.PI * 2);
      strokeAndFill(ctx, isNight ? '#064E3B' : '#15803D', INK, 2.4);
      const berryColor = isNight ? '#E11D48' : '#F43F5E';
      ctx.fillStyle = berryColor;
      ctx.beginPath();
      ctx.arc(b.bx - 6, b.by - 4, 4, 0, Math.PI * 2);
      ctx.arc(b.bx + 5, b.by - 5, 4, 0, Math.PI * 2);
      ctx.arc(b.bx, b.by + 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  return true;
}
