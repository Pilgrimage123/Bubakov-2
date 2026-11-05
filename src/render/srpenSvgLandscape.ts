/**
 * Srpen v Hrusicích – Authentic Josef Lada August Harvest Festival & Dynamic Landmarks
 *
 * Implements the handcrafted procedural canvas rendering for Stages 11 & 12:
 * - Hand-lettered SRPEN title cartouche adorned with August sunflowers, golden wheat ears, and Perseid shooting stars.
 * - Traditional bread baking oven (Chlebová pec) on the village green with glowing stone hearth, loaves, and chimney smoke.
 * - Decorated harvest wagon (Dožínkový žebřiňák) outside the village tavern loaded with sheaves and giant ribboned wreath.
 * - Hilltop church of St. Nicholas with St. Lawrence Bonfire (Vavřinecká vatra) blazing into the night sky.
 * - Warm August pond with water lilies, reeds, cattails, dragonflies, completely free of winter ice.
 * - Schoolhouse with ripe August apple orchard (jabloňový sad).
 * - Water mill with turning wheel and flour sacks.
 * - Deep forest with rock spring (Lesní pramen pod skalami).
 * - Roadside shrine (Boží muka) adorned with harvest wreath.
 */

import { drawSummerCottage } from './cervenSvgLandscape';
import {
  SRPEN_SPECIAL_OBSTACLES,
  SRPEN_STREAM_WAYPOINTS,
  SRPEN_POND_REGION,
} from '../data/srpenArena';

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
export function drawSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, r = 16, isNight = false): void {
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
export function drawBreadOven(
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

  // Sign: "CHLEBOVÁ PEC [E]"
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(-44, 30, 88, 16);
  ctx.strokeRect(-44, 30, 88, 16);
  ctx.fillStyle = INK;
  ctx.font = 'bold 9px Eczar, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHLEBOVÁ PEC [E]', 0, 38);

  ctx.restore();
}

/**
 * Draws the decorated Harvest Wagon (Dožínkový žebřiňák) with sheaves, wreaths & ribbons.
 */
export function drawHarvestWagon(
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
export function drawVavrineckaVatra(
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
  ctx.fillRect(-48, 28, 96, 16);
  ctx.strokeRect(-48, 28, 96, 16);
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
export function drawAugustHaystack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  _time = 0,
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
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (type === 'srpen_border') {
    // 0a. Sun-baked August dirt road network connecting all POIs & bridges
    ctx.save();
    ctx.strokeStyle = isNight ? '#574636' : '#D9B882';
    ctx.lineWidth = 56;
    ctx.beginPath();
    ctx.moveTo(-800, -650);
    ctx.quadraticCurveTo(-420, -280, 50, -75);
    ctx.lineTo(440, -75);
    ctx.moveTo(50, -75);
    ctx.quadraticCurveTo(180, -320, 425, -455);
    ctx.lineTo(225, -975);
    ctx.moveTo(50, -75);
    ctx.quadraticCurveTo(90, 250, 125, 550);
    ctx.lineTo(475, 420);
    ctx.lineTo(650, 725);
    ctx.moveTo(50, -75);
    ctx.quadraticCurveTo(-350, -45, -675, -25);
    ctx.lineTo(-725, 615);
    ctx.stroke();
    ctx.restore();

    // 0b. Warm August stream without winter ice
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 96;
    ctx.beginPath();
    for (let i = 0; i < SRPEN_STREAM_WAYPOINTS.length; i++) {
      const pt = SRPEN_STREAM_WAYPOINTS[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    ctx.strokeStyle = isNight ? '#0369A1' : '#0284C7';
    ctx.lineWidth = 86;
    ctx.stroke();

    ctx.strokeStyle = isNight ? 'rgba(186, 230, 253, 0.22)' : 'rgba(186, 230, 253, 0.5)';
    ctx.lineWidth = 34;
    ctx.stroke();
    ctx.restore();

    // 0c. Two wooden bridges across stream at (425, -455) and (475, 420)
    for (const br of [
      { x: 425, y: -455, w: 148, h: 66 },
      { x: 475, y: 420, w: 148, h: 66 },
    ]) {
      ctx.save();
      ctx.translate(br.x, br.y);
      ctx.fillStyle = '#8C5832';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.fillRect(-br.w / 2, -br.h / 2, br.w, br.h);
      ctx.strokeRect(-br.w / 2, -br.h / 2, br.w, br.h);
      ctx.restore();
    }

    // 0d. Four village cottages matching physical obstacle footprints with Dožínky wreaths
    drawSummerCottage(ctx, -350, -362, 250, 138, 112, '#FAF3E0', '#9E3D26', '#D9A55B', isNight);
    drawSummerCottage(ctx, 100, -412, 262, 144, 115, '#FAF3E0', '#C84B31', '#D9A55B', isNight);
    drawSummerCottage(ctx, -375, -75, 238, 138, 110, '#FAF3E0', '#8C3B2B', '#D9A55B', isNight);
    drawSummerCottage(ctx, -275, 200, 250, 138, 112, '#FAF3E0', '#B84A32', '#D9A55B', isNight);

    // 1. Physical and folk boundary at [-1920..1920, -1675..1675]
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

    // 2. Top August Banner: SRPEN • DOŽÍNKOVÁ SLAVNOST / VAVŘINECKÁ NOC
    ctx.save();
    ctx.translate(0, -1590);

    // Starry night or golden August sunburst
    if (isNight) {
      // Perseid shooting stars across banner
      for (let s = 0; s < 3; s++) {
        const starPhase = (time * 1.5 + s * 1.2) % 3.0;
        if (starPhase < 1.0) {
          const sx = -240 + s * 220 + starPhase * 120;
          const sy = -60 + starPhase * 45;
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx - 28, sy - 14);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = isNight ? '#0F172A' : '#FEF3C7';
    ctx.strokeStyle = isNight ? '#FACC15' : INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-330, -48);
    ctx.quadraticCurveTo(0, -68, 330, -48);
    ctx.quadraticCurveTo(350, 0, 330, 48);
    ctx.quadraticCurveTo(0, 28, -330, 48);
    ctx.quadraticCurveTo(-330, 0, -330, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isNight ? '#FDE047' : '#DC2626';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.font = isNight ? '900 34px Eczar, Georgia, serif' : '900 42px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bannerTitle = isNight ? 'SRPEN • VAVŘINECKÁ NOC' : 'SRPEN • DOŽÍNKOVÁ SLAVNOST';
    ctx.fillText(bannerTitle, 0, -2);
    ctx.strokeText(bannerTitle, 0, -2);

    // Sunflowers flanking the banner
    drawSunflower(ctx, -270, 0, 15, isNight);
    drawSunflower(ctx, 270, 0, 15, isNight);

    ctx.restore();

    // 3. Render tactical August straw stacks in the fields
    for (const obs of SRPEN_SPECIAL_OBSTACLES) {
      if (obs.id.startsWith('stoh_slamy_')) {
        drawAugustHaystack(ctx, obs.x, obs.y, obs.radius || 45, time, isNight);
      }
    }

    // Border sunflower clusters along field borders
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
  } else if (type === 'srpen_fields') {
    // August Harvest Fields at (225, -975): sunflowers, golden stubble
    for (const sf of [
      { x: -180, y: -30 },
      { x: -60, y: 40 },
      { x: 80, y: -40 },
      { x: 190, y: 30 },
    ]) {
      drawSunflower(ctx, sf.x, sf.y, 18, isNight);
    }
  } else if (type === 'srpen_village') {
    // Village Green (Náves) at (50, -75): Roubenka cottage + Chlebová pec (Bread Oven)
    drawSummerCottage(ctx, 0, -68, 144, 54, 48, '#FFFBEB', '#B91C1C', '#E2B464', isNight);

    // Chlebová pec (at world x=45, y=-135 -> relative -5, -60)
    drawBreadOven(ctx, -5, -60, time, isNight);
  } else if (type === 'srpen_tavern') {
    // Village Tavern (Hospoda U Sejků) at (440, -75) + Dožínkový žebřiňák (Harvest Wagon)
    drawSummerCottage(ctx, 22, 0, 312, 162, 125, '#F8EED8', '#C84B31', '#E2B464', isNight, 'HOSPODA U SEJKŮ');

    // Dožínkový žebřiňák (at world x=460, y=-140 -> relative 20, -65)
    drawHarvestWagon(ctx, 20, -65, time, isNight);

    // Outdoor tavern porch
    ctx.save();
    ctx.translate(-152, 12);
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-52, -24, 104, 48);
    ctx.strokeRect(-52, -24, 104, 48);

    // Bench & wooden table
    ctx.fillStyle = '#92400E';
    ctx.fillRect(-35, -15, 70, 30);
    ctx.strokeRect(-35, -15, 70, 30);

    // Foamy celebratory beer steins
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(8, -6, 9, 12);
    ctx.strokeRect(8, -6, 9, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    if (isNight) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (type === 'srpen_church') {
    // Hilltop Church of St. Nicholas at (-800, -650) with churchyard wall + Vavřinecká vatra
    // Stone churchyard wall
    ctx.fillStyle = '#D6CFC2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-195, -185, 22, 300);
    ctx.strokeRect(-195, -185, 22, 300);
    ctx.fillRect(-195, -185, 265, 22);
    ctx.strokeRect(-195, -185, 265, 22);
    ctx.fillRect(-195, 95, 240, 22);
    ctx.strokeRect(-195, 95, 240, 22);

    // Church nave
    ctx.fillStyle = isNight ? '#CBD5E1' : '#FEF3C7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-82, -98, 145, 108);
    ctx.strokeRect(-82, -98, 145, 108);

    // Roof
    ctx.fillStyle = isNight ? '#7F1D1D' : '#C84B31';
    ctx.beginPath();
    ctx.moveTo(-88, -98);
    ctx.lineTo(-10, -152);
    ctx.lineTo(68, -98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bell tower with spire
    ctx.fillStyle = isNight ? '#CBD5E1' : '#FEF3C7';
    ctx.fillRect(40, -178, 52, 188);
    ctx.strokeRect(40, -178, 52, 188);

    // Red-tiled spire
    ctx.fillStyle = isNight ? '#7F1D1D' : '#DC2626';
    ctx.beginPath();
    ctx.moveTo(30, -178);
    ctx.lineTo(66, -245);
    ctx.lineTo(102, -178);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vavřinecká vatra (St. Lawrence Bonfire) near the church
    drawVavrineckaVatra(ctx, 0, 45, time, isNight);
  } else if (type === 'srpen_school') {
    // Village schoolhouse at (125, 550) with ripe apple orchard
    drawSummerCottage(ctx, -6, 0, 300, 156, 118, '#FEF9C3', '#B45309', '#DFB66C', isNight, 'ŠKOLA');

    // Apple trees with red & golden apples
    for (const tree of [
      { tx: -190, ty: 20 },
      { tx: 180, ty: 30 },
    ]) {
      ctx.save();
      ctx.translate(tree.tx, tree.ty);
      // Trunk
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-6, 0, 12, 34);
      // Foliage
      ctx.fillStyle = isNight ? '#14532D' : '#16A34A';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -15, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Ripe apples
      ctx.fillStyle = '#DC2626';
      for (const a of [
        { ax: -12, ay: -20 },
        { ax: 8, ay: -22 },
        { ax: -4, ay: -8 },
        { ax: 14, ay: -10 },
      ]) {
        ctx.beginPath();
        ctx.arc(a.ax, a.ay, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  } else if (type === 'srpen_pond') {
    // Warm August pond matching SRPEN_POND_REGION (rx=280, ry=165, angle=-0.08)
    // Mud/sand bank
    ctx.fillStyle = '#8B6E4E';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, SRPEN_POND_REGION.rx + 12, SRPEN_POND_REGION.ry + 12, SRPEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clear summer water (NO ice floes!)
    ctx.fillStyle = isNight ? '#0369A1' : '#0284C7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, SRPEN_POND_REGION.rx, SRPEN_POND_REGION.ry, SRPEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wooden jetty at (130, -52)
    ctx.fillStyle = '#9C6B43';
    ctx.fillRect(130, -52, 70, 24);
    ctx.strokeRect(130, -52, 70, 24);

    // Floating water lily pads (lekníny)
    const padPositions = [
      { x: -75, y: -25, r: 18 },
      { x: -30, y: 35, r: 22 },
      { x: 50, y: -30, r: 20 },
      { x: 80, y: 25, r: 19 },
    ];
    for (const pad of padPositions) {
      ctx.fillStyle = isNight ? '#065F46' : '#15803D';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r, 0.4, Math.PI * 2 - 0.4);
      ctx.lineTo(pad.x, pad.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White water lily bloom
      ctx.fillStyle = isNight ? '#E0F2FE' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Tall cattails & reeds (orobinec a rákosí)
    for (let c = 0; c < 3; c++) {
      const cx = -180 + c * 20;
      const cy = 20 + c * 8;
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 15);
      ctx.lineTo(cx, cy - 25);
      ctx.stroke();
      // Brown cattail cigar
      ctx.fillStyle = '#5C3A21';
      ctx.beginPath();
      ctx.roundRect(cx - 3, cy - 22, 6, 16, 3);
      ctx.fill();
    }
  } else if (type === 'srpen_mill') {
    // Water mill at (-880, 110)
    drawSummerCottage(ctx, 40, -30, 200, 120, 90, '#F5E6CC', '#8C3B2B', '#C8924A', isNight, 'MLÝN');

    // Rotating wooden waterwheel
    ctx.save();
    ctx.translate(-85, 20);
    const wheelAngle = time * 2.2;
    ctx.rotate(wheelAngle);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    for (let p = 0; p < 8; p++) {
      const pa = (p / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(pa) * 36, Math.sin(pa) * 36);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Sacks of August flour
    for (const sx of [70, 92]) {
      ctx.fillStyle = isNight ? '#CBD5E1' : '#F8FAFC';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx, 14, 18, 26, 4);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === 'srpen_forest') {
    // Forest POI at (650, 725): Spruce/pine trees + Lesní pramen pod skalami (Natural rock spring)
    // Spruce tree
    ctx.fillStyle = isNight ? '#064E3B' : '#14532D';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(44, -30);
    ctx.lineTo(24, -30);
    ctx.lineTo(52, 20);
    ctx.lineTo(-52, 20);
    ctx.lineTo(-24, -30);
    ctx.lineTo(-44, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mossy rocks with trickling natural spring
    ctx.save();
    ctx.translate(65, 45);
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-16, 0, 18, 0, Math.PI * 2);
    ctx.arc(14, 2, 22, 0, Math.PI * 2);
    ctx.arc(0, -14, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cool spring water trickle
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(6, 12, 2, 26);
    ctx.stroke();
    ctx.restore();
  } else if (type === 'srpen_shrine') {
    // Roadside shrine (Boží muka) at (820, -620)
    // Whitewashed stone pillar
    ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFBEB';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-16, -60, 32, 100);
    ctx.strokeRect(-16, -60, 32, 100);

    // Stepped stone base
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-26, 40, 52, 16);
    ctx.strokeRect(-26, 40, 52, 16);

    // Arched niche
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-10, -50, 20, 26);
    ctx.strokeRect(-10, -50, 20, 26);

    // Pyramid roof & forged cross
    ctx.fillStyle = isNight ? '#7F1D1D' : '#991B1B';
    ctx.beginPath();
    ctx.moveTo(-22, -60);
    ctx.lineTo(0, -88);
    ctx.lineTo(22, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -88);
    ctx.lineTo(0, -106);
    ctx.moveTo(-6, -98);
    ctx.lineTo(6, -98);
    ctx.stroke();

    // Braided August wheat wreath (Dožínkový věneček)
    ctx.beginPath();
    ctx.arc(0, -8, 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Devotional candle at night
    if (isNight) {
      const candleFlicker = Math.sin(time * 8) * 2;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath();
      ctx.arc(0, -38, 22 + candleFlicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, -38, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Standard decor renderer adapter for DecorItem instances.
 */
export function drawSrpenDecoration(
  ctx: CanvasRenderingContext2D,
  decorItem: string | { type: string },
  time = 0,
  isNight = false
): void {
  const type = typeof decorItem === 'string' ? decorItem : decorItem?.type || '';
  if (!type.startsWith('srpen_')) return;
  drawSrpenSummerLandmark(ctx, type, time, isNight);
}
