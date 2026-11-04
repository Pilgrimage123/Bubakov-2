import { drawMarchThawDynamicLandmark } from './marchThawSvgLandscape';
import { SRPEN_SPECIAL_OBSTACLES } from '../data/srpenArena';

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

/**
 * Draws bright yellow August sunflowers (Slunečnice) with dark seeded centers.
 */
function drawSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, r = 16, isNight = false): void {
  ctx.save();
  ctx.translate(x, y);

  // Stalk and green leaves
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 32);
  ctx.strokeStyle = isNight ? '#166534' : '#15803D';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-10, 16, 12, 6, -0.4, 0, Math.PI * 2);
  ctx.ellipse(10, 22, 12, 6, 0.4, 0, Math.PI * 2);
  strokeAndFill(ctx, isNight ? '#166534' : '#22C55E', INK, 2);

  // Golden petals (12 petals in a circle)
  const petalFill = isNight ? '#CA8A04' : '#FACC15';
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(ang) * (r * 0.75), Math.sin(ang) * (r * 0.75), r * 0.55, r * 0.28, ang, 0, Math.PI * 2);
    strokeAndFill(ctx, petalFill, INK, 1.8);
  }

  // Dark seeded center
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  strokeAndFill(ctx, isNight ? '#451A03' : '#78350F', INK, 2.2);

  ctx.restore();
}

/**
 * Draws the village Bread Baking Oven (Chlebová pec) on the Hrusice village green.
 */
function drawBreadOven(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(10, 15, 30, 0.55)' : 'rgba(92, 58, 24, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 68, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone dome base
  const stoneFill = isNight ? '#475569' : '#E2E8F0';
  ctx.beginPath();
  ctx.arc(0, 10, 48, Math.PI, 0);
  ctx.lineTo(48, 28);
  ctx.lineTo(-48, 28);
  ctx.closePath();
  strokeAndFill(ctx, stoneFill, INK, 3.5);

  // Brick oven mouth (čelo pece)
  ctx.beginPath();
  ctx.arc(0, 16, 24, Math.PI, 0);
  ctx.lineTo(24, 28);
  ctx.lineTo(-24, 28);
  ctx.closePath();
  strokeAndFill(ctx, isNight ? '#1E293B' : '#7C2D12', INK, 3);

  // Glowing oven fire inside
  const glow = Math.sin(time * 4) * 0.15 + 0.85;
  ctx.fillStyle = isNight ? `rgba(249, 115, 22, ${glow})` : `rgba(251, 146, 60, ${glow})`;
  ctx.beginPath();
  ctx.arc(0, 20, 17, Math.PI, 0);
  ctx.lineTo(17, 28);
  ctx.lineTo(-17, 28);
  ctx.closePath();
  ctx.fill();

  // Wooden bread peel (sázecí lopata na chléb)
  ctx.save();
  ctx.rotate(0.35);
  ctx.beginPath();
  ctx.rect(-35, -12, 14, 22);
  strokeAndFill(ctx, '#B45309', INK, 2);
  ctx.beginPath();
  ctx.rect(-24, -3, 65, 5);
  strokeAndFill(ctx, '#78350F', INK, 2);

  // Fresh round loaf of bread on the peel
  ctx.beginPath();
  ctx.ellipse(-28, -1, 10, 7, 0, 0, Math.PI * 2);
  strokeAndFill(ctx, '#D97706', INK, 2);
  ctx.restore();

  // Brick chimney with smoke puffs
  ctx.beginPath();
  ctx.rect(-34, -42, 16, 32);
  strokeAndFill(ctx, '#991B1B', INK, 2.5);

  const puffY = (time * 18) % 40;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
  ctx.beginPath();
  ctx.arc(-26 + Math.sin(time * 3) * 6, -48 - puffY, 10 + puffY * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Sign: "PEČENÍ CHLEBA"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(-38, 30, 76, 16);
  ctx.strokeRect(-38, 30, 76, 16);
  ctx.fillStyle = INK;
  ctx.font = 'bold 9px Eczar, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHLEBOVÁ PEC [E]', 0, 38);

  ctx.restore();
}

/**
 * Draws the decorated Harvest Wagon (Dožínkový žebřiňák) with wreaths & ribbons.
 */
function drawHarvestWagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(10, 15, 30, 0.55)' : 'rgba(92, 58, 24, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 72, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large spoked cartwheels
  for (const wx of [-46, 46]) {
    ctx.beginPath();
    ctx.arc(wx, 16, 18, 0, Math.PI * 2);
    strokeAndFill(ctx, '#B45309', INK, 3);
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(sa) * 16, 16 + Math.sin(sa) * 16);
      ctx.lineTo(wx - Math.cos(sa) * 16, 16 - Math.sin(sa) * 16);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(wx, 16, 4.5, 0, Math.PI * 2);
    strokeAndFill(ctx, '#27272A', INK, 1.5);
  }

  // Wooden wagon body (žebřiny)
  ctx.beginPath();
  ctx.moveTo(-54, 4);
  ctx.lineTo(54, 4);
  ctx.lineTo(60, -18);
  ctx.lineTo(-60, -18);
  ctx.closePath();
  strokeAndFill(ctx, isNight ? '#78350F' : '#92400E', INK, 3);

  // Slatted rungs (příčky)
  for (let r = -45; r <= 45; r += 15) {
    ctx.beginPath();
    ctx.moveTo(r, 4);
    ctx.lineTo(r * 1.1, -18);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  // Golden wheat crop mounded high
  ctx.beginPath();
  ctx.arc(0, -18, 48, Math.PI, 0);
  strokeAndFill(ctx, isNight ? '#A16207' : '#FDE047', INK, 3);

  // Giant Harvest Wreath (Dožínkový věnec) mounted in center
  ctx.beginPath();
  ctx.arc(0, -38, 22, 0, Math.PI * 2);
  strokeAndFill(ctx, isNight ? '#CA8A04' : '#EAB308', INK, 3.5);
  ctx.beginPath();
  ctx.arc(0, -38, 12, 0, Math.PI * 2);
  strokeAndFill(ctx, isNight ? '#1E293B' : '#FEF3C7', INK, 2.5);

  // Colorful ribbons hanging from the wreath
  const colors = ['#EF4444', '#3B82F6', '#22C55E', '#EC4899'];
  for (let i = 0; i < 4; i++) {
    const rx = -12 + i * 8;
    const wave = Math.sin(time * 3 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(rx, -18);
    ctx.quadraticCurveTo(rx + wave, -4, rx, 10);
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws the St. Lawrence Hilltop Bonfire (Vavřinecká vatra) near the church.
 */
function drawVavrineckaVatra(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isNight = false
): void {
  ctx.save();
  ctx.translate(x, y);

  // Ground soot circle
  ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 54, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone circle rim
  for (let a = 0; a < Math.PI * 2; a += 0.52) {
    const sx = Math.cos(a) * 36;
    const sy = Math.sin(a) * 16 + 10;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 7, 5, a, 0, Math.PI * 2);
    strokeAndFill(ctx, '#71717A', INK, 2);
  }

  // Wooden log pyramid
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 12, 14);
    ctx.lineTo(0, -16);
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Blazing fire (flames dancing)
  const flameH = 34 + Math.sin(time * 8) * 8;
  const flameW = 20 + Math.cos(time * 7) * 4;

  // Outer orange flame
  ctx.beginPath();
  ctx.moveTo(-flameW, 8);
  ctx.quadraticCurveTo(-flameW * 0.6, -flameH * 0.5, 0, -flameH);
  ctx.quadraticCurveTo(flameW * 0.6, -flameH * 0.5, flameW, 8);
  ctx.closePath();
  ctx.fillStyle = '#EA580C';
  ctx.fill();

  // Inner yellow flame
  ctx.beginPath();
  ctx.moveTo(-flameW * 0.6, 6);
  ctx.quadraticCurveTo(-flameW * 0.3, -flameH * 0.4, 0, -flameH * 0.75);
  ctx.quadraticCurveTo(flameW * 0.3, -flameH * 0.4, flameW * 0.6, 6);
  ctx.closePath();
  ctx.fillStyle = '#FACC15';
  ctx.fill();

  // Sparks flying upward
  for (let s = 0; s < 4; s++) {
    const spY = ((time * 30 + s * 14) % 60);
    const spX = Math.sin(time * 5 + s) * 12;
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(spX, -flameH - spY + 12, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hint tag
  ctx.fillStyle = isNight ? '#FEF08A' : '#FEF3C7';
  ctx.fillRect(-44, 28, 88, 16);
  ctx.strokeRect(-44, 28, 88, 16);
  ctx.fillStyle = INK;
  ctx.font = 'bold 9px Eczar, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VAVŘINECKÁ VATRA [E]', 0, 36);

  ctx.restore();
}

/**
 * Draws rounded Haystacks (Stohy slámy) in the August fields.
 */
function drawAugustHaystack(
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
  ctx.ellipse(4, 16, radius * 1.1, radius * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Haystack mound
  const strawFill = isNight ? '#A16207' : '#FACC15';
  const strawShade = isNight ? '#713F12' : '#EAB308';

  ctx.beginPath();
  ctx.moveTo(-radius * 0.95, 14);
  ctx.quadraticCurveTo(-radius * 0.9, -radius * 0.4, 0, -radius * 0.95);
  ctx.quadraticCurveTo(radius * 0.9, -radius * 0.4, radius * 0.95, 14);
  ctx.quadraticCurveTo(0, 22, -radius * 0.95, 14);
  ctx.closePath();
  strokeAndFill(ctx, strawFill, INK, 3.0);

  // Hay thatch lines
  ctx.strokeStyle = strawShade;
  ctx.lineWidth = 2.0;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, -radius * 0.7);
    ctx.lineTo(i * 9, 12);
    ctx.stroke();
  }

  // Central pole (tyč stohu) sticking out the top
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.95);
  ctx.lineTo(0, -radius * 1.25);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Main dispatcher for August landmark decor rendering.
 */
export function drawSrpenSummerLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  time = 0,
  isNight = false
): void {
  ctx.save();

  if (type === 'srpen_border') {
    // Outer wooden folk cartouche and banner
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(-1920, -1675, 3840, 3350);

    // Warm golden ribbon trim
    ctx.strokeStyle = isNight ? '#1E1B4B' : '#EAB308';
    ctx.lineWidth = 10;
    ctx.strokeRect(-1930, -1685, 3860, 3370);

    ctx.strokeStyle = isNight ? '#4338CA' : '#B45309';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-1936, -1691, 3872, 3382);

    // Top August Banner: SRPEN / VAVŘINECKÁ NOC
    ctx.save();
    ctx.translate(0, -1590);

    ctx.fillStyle = isNight ? '#0F172A' : '#FEF3C7';
    ctx.strokeStyle = isNight ? '#FACC15' : INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-310, -48);
    ctx.quadraticCurveTo(0, -68, 310, -48);
    ctx.quadraticCurveTo(330, 0, 310, 48);
    ctx.quadraticCurveTo(0, 28, -310, 48);
    ctx.quadraticCurveTo(-330, 0, -310, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isNight ? '#FDE047' : '#DC2626';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.font = isNight ? '900 36px Eczar, Georgia, serif' : '900 44px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bannerTitle = isNight ? 'SRPEN • VAVŘINECKÁ NOC' : 'SRPEN • DOŽÍNKOVÁ SLAVNOST';
    ctx.fillText(bannerTitle, 0, -2);
    ctx.strokeText(bannerTitle, 0, -2);

    ctx.restore();

    // Render tactical August obstacles: Bread oven, harvest wagon, haystacks
    for (const obs of SRPEN_SPECIAL_OBSTACLES) {
      if (obs.id === 'chlebova_pec_budka') {
        drawBreadOven(ctx, obs.x, obs.y + 12, time, isNight);
      } else if (obs.id === 'dozinkovy_zebrinak') {
        drawHarvestWagon(ctx, obs.x, obs.y + 10, time, isNight);
      } else if (obs.id.startsWith('stoh_slamy_')) {
        drawAugustHaystack(ctx, obs.x, obs.y, obs.radius || 45, time, isNight);
      }
    }

    // Render St. Lawrence Bonfire near the church
    drawVavrineckaVatra(ctx, -800, -650, time, isNight);

    // Border sunflower clusters in the corners and along field borders
    for (const sf of [
      { x: -160, y: -860 },
      { x: 170, y: -890 },
      { x: 340, y: -860 },
      { x: 580, y: -880 },
      { x: 740, y: -940 },
    ]) {
      drawSunflower(ctx, sf.x, sf.y, 16, isNight);
      drawSunflower(ctx, sf.x + 22, sf.y + 8, 13, isNight);
    }
  } else {
    // Delegate landscape ground features to existing March/July renderer for consistency
    const marchType = type.replace('srpen_', 'march_');
    drawMarchThawDynamicLandmark(ctx, marchType, time, isNight);
  }

  ctx.restore();
}

/**
 * Standard decor renderer adapter for DecorItem instances.
 */
export function drawSrpenDecoration(
  ctx: CanvasRenderingContext2D,
  decorItem: { type: string },
  time = 0,
  isNight = false
): void {
  drawSrpenSummerLandmark(ctx, decorItem.type, time, isNight);
}
