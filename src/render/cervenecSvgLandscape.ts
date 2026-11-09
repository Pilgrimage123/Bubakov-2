/**
 * Červenec v Hrusicích – Authentic Josef Lada July Harvest Landscape & Dynamic Landmarks
 *
 * Implements the handcrafted procedural canvas rendering for Stages 9 & 10:
 * - Hand-lettered ČERVENEC title cartouche adorned with red poppies, blue cornflowers, and golden wheat ears.
 * - Golden rye harvest fields (Žně na sv. Markétu) with solid grain sheaves (panáky a mandele žita).
 * - Festive fairground shooting gallery (Poutní střelnice) on the village green with spinning tin targets and paper roses.
 * - Hilltop church of St. Nicholas with lightning rod (hromosvod) protecting against St. Elias thunderstorms.
 * - Village tavern (Hospoda U Sejků) with shaded porch, cool buttermilk jugs, and foamy beer mugs.
 * - Hrusice water mill with rotating waterwheel, weeping willows, and sacks of summer flour.
 * - Warm July pond with swimming ducks and blooming water lilies, completely free of winter ice.
 * - Wild raspberry bushes at the edge of the spruce and birch woods.
 * - Roadside shrine of St. Elias the Thunderer (Boží muka sv. Eliáše).
 */

import { drawSummerCottage } from './cervenSvgLandscape';
import { drawAllVillageCottages } from './villageBuildingRenderer';
import {
  CERVENEC_SHEAF_OBSTACLES,
  CERVENEC_STREAM_WAYPOINTS,
  CERVENEC_POND_REGION,
} from '../data/cervenecArena';

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

export function drawPoppyFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r = 7,
  isNight = false
): void {
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

export function drawCornflower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r = 6.5,
  isNight = false
): void {
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
export function drawGrainSheafPanak(
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
 * Draws the festive Poutní střelnice (Fairground Shooting Gallery) on the village green.
 */
export function drawPoutniStrelniceBooth(
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

  // Signboard "STŘELNICE [E]"
  ctx.beginPath();
  ctx.roundRect(-48, -82, 96, 16, 4);
  strokeAndFill(ctx, isNight ? '#FDE047' : '#FEF08A', INK, 2.2);
  ctx.fillStyle = INK;
  ctx.font = '900 10px Eczar, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STŘELNICE [E]', 0, -74);

  // Warm lantern glow at night
  if (isNight) {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -24, 52 + Math.sin(time * 5) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Main landmark dispatcher for July (Červenec) landscape rendering.
 */
export function drawCervenecSummerLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  time = 0,
  isNight = false
): void {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (type === 'cervenec_border') {
    // 0a. Sun-baked summer dirt road network connecting all POIs & bridges
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

    // 0b. Warm summer Hrusice stream without winter ice
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 96;
    ctx.beginPath();
    for (let i = 0; i < CERVENEC_STREAM_WAYPOINTS.length; i++) {
      const pt = CERVENEC_STREAM_WAYPOINTS[i];
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

    // 0d. Village cottages matching physical obstacle footprints (all 6 cottages)
    drawAllVillageCottages(ctx, 'summer', isNight, time);

    // 1. Physical and folk boundary at [-1920..1920, -1675..1675]
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(-1920, -1675, 3840, 3350);

    // Golden rye harvest & meadow folk trim
    ctx.strokeStyle = isNight ? '#1E1B4B' : '#D97706';
    ctx.lineWidth = 10;
    ctx.strokeRect(-1930, -1685, 3860, 3370);

    ctx.strokeStyle = isNight ? '#38BDF8' : '#15803D';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-1936, -1691, 3872, 3382);

    // 2. Top Cartouche Banner: ČERVENEC • ŽNĚ NA SV. MARKÉTU / BOUŘE SV. ELIÁŠE
    ctx.save();
    ctx.translate(0, -1590);

    // Night storm lightning aura or golden sun rays
    if (isNight) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 3;
      const flash = Math.sin(time * 6) > 0.85 ? 1 : 0;
      if (flash) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      }
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 120, Math.sin(angle) * 60);
        ctx.lineTo(Math.cos(angle) * 360, Math.sin(angle) * 110);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 120, Math.sin(angle) * 60);
        ctx.lineTo(Math.cos(angle) * 360, Math.sin(angle) * 110);
        ctx.stroke();
      }
    }

    // Parchment ribbon scroll
    ctx.fillStyle = isNight ? '#0F172A' : '#FEF3C7';
    ctx.strokeStyle = isNight ? '#38BDF8' : INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-330, -48);
    ctx.quadraticCurveTo(0, -68, 330, -48);
    ctx.quadraticCurveTo(350, 0, 330, 48);
    ctx.quadraticCurveTo(0, 28, -330, 48);
    ctx.quadraticCurveTo(-350, 0, -330, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Banner title
    ctx.fillStyle = isNight ? '#FDE047' : '#DC2626';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.font = isNight ? '900 34px Eczar, Georgia, serif' : '900 42px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bannerTitle = isNight ? 'ČERVENEC • BOUŘE SV. ELIÁŠE' : 'ČERVENEC • ŽNĚ NA SV. MARKÉTU';
    ctx.fillText(bannerTitle, 0, -2);
    ctx.strokeText(bannerTitle, 0, -2);

    // Poppies and cornflowers flanking the banner
    drawPoppyFlower(ctx, -270, 0, 11, isNight);
    drawCornflower(ctx, -240, -8, 9.5, isNight);
    drawPoppyFlower(ctx, 270, 0, 11, isNight);
    drawCornflower(ctx, 240, -8, 9.5, isNight);

    ctx.restore();
  } else if (type === 'cervenec_fields') {
    // July Rye Harvest Field at (225, -975)
    // Draw wheat stubble ridges, poppies, cornflowers, and the 4 solid grain sheaf panáky
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

    // Draw the 4 solid grain sheaf panáky relative to fields POI (225, -975)
    for (let i = 0; i < CERVENEC_SHEAF_OBSTACLES.length; i++) {
      const obs = CERVENEC_SHEAF_OBSTACLES[i];
      if (obs.shape === 'circle') {
        const relX = obs.x - 225;
        const relY = obs.y - (-975);
        drawGrainSheafPanak(ctx, relX, relY, obs.radius || 44, time, isNight);
      }
    }
  } else if (type === 'cervenec_village') {
    // Village Green (Náves) at (50, -75): roubenka cottage + Poutní střelnice booth
    // Background cottage north of green
    drawSummerCottage(ctx, 0, -68, 144, 54, 48, '#FFFBEB', '#B91C1C', '#E2B464', isNight);

    // Poutní střelnice booth (at world x=65, y=-135 -> relative 15, -60)
    drawPoutniStrelniceBooth(ctx, 15, -60, time, isNight);
  } else if (type === 'cervenec_tavern') {
    // Village Tavern (Hospoda U Sejků) at (440, -75)
    drawSummerCottage(ctx, 22, 0, 312, 162, 125, '#F8EED8', '#C84B31', '#E2B464', isNight, 'HOSPODA U SEJKŮ');

    // Outdoor shaded porch with wooden benches and table
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

    // Cool earthenware buttermilk jug (džbán podmáslí)
    ctx.fillStyle = '#D97706';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-14, 0, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Two foamy beer mugs
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(8, -6, 9, 12);
    ctx.strokeRect(8, -6, 9, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    // Warm lantern glow at night
    if (isNight) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (type === 'cervenec_church') {
    // Hilltop Church of St. Nicholas at (-800, -650) with churchyard wall & lightning rod
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

    // Lightning rod (Hromosvod sv. Eliáše) on spire top
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(66, -245);
    ctx.lineTo(66, -270);
    ctx.stroke();

    if (isNight) {
      // Crackling St. Elmo's fire spark on the lightning rod tip
      const sparkPulse = Math.sin(time * 12) * 3;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.arc(66, -270, 10 + sparkPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(66, -270, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'cervenec_school') {
    // Village schoolhouse at (125, 550)
    drawSummerCottage(ctx, -6, 0, 300, 156, 118, '#FEF9C3', '#B45309', '#DFB66C', isNight, 'ŠKOLA');
  } else if (type === 'cervenec_pond') {
    // Warm summer pond matching CERVENEC_POND_REGION (rx=280, ry=165, angle=-0.08)
    // Mud/sand bank
    ctx.fillStyle = '#8B6E4E';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, CERVENEC_POND_REGION.rx + 12, CERVENEC_POND_REGION.ry + 12, CERVENEC_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clear summer water (NO ice floes!)
    ctx.fillStyle = isNight ? '#0369A1' : '#0284C7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, CERVENEC_POND_REGION.rx, CERVENEC_POND_REGION.ry, CERVENEC_POND_REGION.angle, 0, Math.PI * 2);
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
      ctx.fillStyle = isNight ? '#22D3EE' : '#FBBF24';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swimming mallards (Day) or raindrops with ripples (Night storm)
    if (!isNight) {
      for (let d = 0; d < 2; d++) {
        const duckX = -40 + d * 70 + Math.sin(time * 0.8 + d) * 15;
        const duckY = -5 + d * 30 + Math.cos(time * 0.8 + d) * 10;
        ctx.save();
        ctx.translate(duckX, duckY);
        // Duck body
        ctx.fillStyle = '#78350F';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Mallard green head
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.arc(10, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Yellow bill
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(14, -6, 5, 3);
        ctx.restore();
      }
    } else {
      // Expanding ripples from storm raindrops
      for (let r = 0; r < 4; r++) {
        const ripplePhase = (time * 1.8 + r * 0.7) % 2.0;
        const rx = -80 + r * 50;
        const ry = -20 + (r % 2) * 40;
        ctx.strokeStyle = `rgba(186, 230, 253, ${Math.max(0, 1 - ripplePhase * 0.5)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rx, ry, ripplePhase * 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (type === 'cervenec_mill') {
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

    // Sacks of summer flour outside the mill
    for (const sx of [70, 92]) {
      ctx.fillStyle = isNight ? '#CBD5E1' : '#F8FAFC';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx, 14, 18, 26, 4);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === 'cervenec_forest') {
    // Forest POI at (650, 725): Spruce trees, birch, wild raspberry bushes (maliní)
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

    // Raspberry bushes (maliní) heavy with red berries
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
  } else if (type === 'cervenec_shrine') {
    // Roadside Shrine of St. Elias (Boží muka) at (820, -620)
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

    // Arched niche with golden icon of St. Elias
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-10, -50, 20, 26);
    ctx.strokeRect(-10, -50, 20, 26);

    // Pyramid roof & forged cross with lightning rod
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

    // Sheaf of wheat tied with red ribbon around pillar
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-14, 2, 28, 22);
    ctx.strokeRect(-14, 2, 28, 22);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-16, 10, 32, 6);

    // Protective holy glow / storm spark
    if (isNight) {
      const aura = Math.sin(time * 5) * 4;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.arc(0, -20, 56 + aura, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Standard decor renderer adapter for Cervenec landscape elements.
 */
export function drawCervenecDecoration(
  ctx: CanvasRenderingContext2D,
  itemOrType: string | { type: string; x?: number; y?: number; scale?: number },
  timeOrX = 0,
  isNightOrY: boolean | number = false,
  _scale = 1,
  _timeArg = 0,
  _isNightArg = false
): boolean {
  let type: string;
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
      time = typeof timeOrX === 'number' ? timeOrX : 0;
      isNight = false;
    }
  }

  if (!type.startsWith('cervenec_')) return false;

  drawCervenecSummerLandmark(ctx, type, time, isNight);
  return true;
}
