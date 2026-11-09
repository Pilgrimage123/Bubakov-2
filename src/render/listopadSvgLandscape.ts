/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 17 & 18 (Listopad v Hrusicích – Den & Noc).
 * Stage 17 (Day): Svatomartinská slavnost, husí hody, pekáč s husou u Sejků, holé stromy a ranní jinovatka.
 * Stage 18 (Night): Listopadový noční hon, sychravé mlhy, uhlířský milíř a běsnící kanec Kňour.
 * Strictly adheres to the Ladovský kodex: #1A1412 ink outlines, late autumn earthy tones,
 * frosty greys, warm tavern glow, and dense charcoal kiln smoke.
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

/** Draws a late autumn barren birch or willow tree with black ink knots */
function drawLateAutumnTree(
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
  ctx.fillStyle = isNight ? 'rgba(5, 10, 20, 0.35)' : 'rgba(40, 30, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(4, 38, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // White/Grey Birch Trunk with black horizontal bark stripes
  ctx.fillStyle = isNight ? '#64748B' : '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(-8, 38);
  ctx.quadraticCurveTo(-5, 6, -4, -28);
  ctx.lineTo(5, -28);
  ctx.quadraticCurveTo(6, 6, 8, 38);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Bark stripes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  const stripes = [-18, -8, 4, 16, 26];
  for (const sy of stripes) {
    ctx.beginPath();
    ctx.moveTo(-6, sy);
    ctx.lineTo(0, sy + 1);
    ctx.moveTo(2, sy - 2);
    ctx.lineTo(6, sy - 1);
    ctx.stroke();
  }

  // Bare gnarled branches
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-2, -28);
  ctx.quadraticCurveTo(-18, -44, -28, -60);
  ctx.moveTo(2, -28);
  ctx.quadraticCurveTo(16, -46, 28, -62);
  ctx.moveTo(0, -28);
  ctx.quadraticCurveTo(2, -50, 0, -70);
  ctx.moveTo(-10, -40);
  ctx.lineTo(-4, -54);
  ctx.moveTo(10, -42);
  ctx.lineTo(6, -56);
  ctx.stroke();

  ctx.restore();
}

export function drawListopadDecoration(
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
    case 'listopad_border': {
      ctx.save();

      // Field paths in late-autumn chilled earth
      ctx.strokeStyle = isNight ? '#1E293B' : '#785338';
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

      // Brook in late autumn (dark cold water)
      ctx.strokeStyle = INK;
      ctx.lineWidth = 96;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#0B132B' : '#0369A1';
      ctx.lineWidth = 86;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      ctx.strokeStyle = isNight ? '#1E293B' : '#38BDF8';
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(425, -1675);
      ctx.quadraticCurveTo(410, -455, 430, 0);
      ctx.quadraticCurveTo(480, 420, 460, 1675);
      ctx.stroke();

      // Two wooden bridges
      const bridges = [
        { bx: 425, by: -455, w: 90, h: 52 },
        { bx: 475, by: 420, w: 90, h: 52 },
      ];
      for (const br of bridges) {
        ctx.fillStyle = isNight ? '#292524' : '#573016';
        ctx.fillRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 4;
        ctx.strokeRect(br.bx - br.w / 2, br.by - br.h / 2, br.w, br.h);
      }

      // Title Cartouche top center
      ctx.fillStyle = isNight ? '#1E293B' : '#F8FAFC';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-240, -1630, 480, 56, 12);
      } else {
        ctx.rect(-240, -1630, 480, 56);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isNight ? '#F8FAFC' : '#1E293B';
      ctx.font = 'bold 22px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNight ? '✦ LISTOPAD V HRUSICÍCH – NOČNÍ HON ✦' : '✦ LISTOPAD V HRUSICÍCH – SVATOMARTINSKÁ SLAVNOST ✦', 0, -1602);

      // Canonical 6 village cottages matching MARCH_THAW_OBSTACLES
      drawAllVillageCottages(ctx, 'autumn', isNight, time);

      ctx.restore();
      break;
    }

    case 'listopad_fields': {
      ctx.save();
      // Bare trees and frost on furrow ridges
      drawLateAutumnTree(ctx, -60, -30, 1.1, isNight);
      drawLateAutumnTree(ctx, 80, 20, 0.9, isNight);
      // Piles of beet leaves
      ctx.fillStyle = isNight ? '#1C1917' : '#78350F';
      ctx.beginPath();
      ctx.ellipse(-10, 10, 36, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'listopad_church': {
      ctx.save();
      // Complete Church of St. Nicholas matching kostel_nave & tower
      drawAuthenticChurch(ctx, 0, -30, isNight, 'autumn', time);
      drawLateAutumnTree(ctx, 65, 10, 0.95, isNight);
      ctx.restore();
      break;
    }

    case 'listopad_village': {
      ctx.save();
      // Village green with central linden
      drawLateAutumnTree(ctx, 0, -10, 1.3, isNight);

      // Chilled mud puddle
      ctx.fillStyle = isNight ? '#0F172A' : '#475569';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(35, 30, 48, 22, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'listopad_tavern': {
      ctx.save();
      // Complete tavern matching hospoda_main collision
      drawAuthenticTavern(ctx, 22, 0, isNight, 'autumn', time);

      // Roast Goose Spit (Interactive POI marker)
      ctx.strokeStyle = '#23170F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(35, 75);
      ctx.lineTo(35, 50);
      ctx.lineTo(65, 50);
      ctx.lineTo(65, 75);
      ctx.stroke();

      // Golden roasted goose on spit
      ctx.fillStyle = isNight ? '#D97706' : '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(50, 50, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2);

      ctx.restore();
      break;
    }

    case 'listopad_school': {
      ctx.save();
      // Complete school matching skola_main collision
      drawAuthenticSchool(ctx, -6, 0, isNight, 'autumn', time);
      ctx.restore();
      break;
    }

    case 'listopad_pond': {
      ctx.save();
      // Freezing pond Brčálník with ice rim
      ctx.fillStyle = isNight ? '#0F172A' : '#0284C7';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 55, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Thin rim of white ice
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'listopad_mill': {
      ctx.save();
      // Complete watermill matching mlyn_house collision
      drawAuthenticMill(ctx, 0, 0, isNight, 'autumn', time);
      ctx.restore();
      break;
    }

    case 'listopad_forest': {
      ctx.save();
      // Dense Beech & Oak Forest with Charcoal Kiln (Uhlířský milíř)
      drawLateAutumnTree(ctx, -40, -20, 1.2, isNight);
      drawLateAutumnTree(ctx, 45, -30, 1.15, isNight);
      drawLateAutumnTree(ctx, 55, 30, 1.0, isNight);

      // Charcoal Kiln mound
      ctx.fillStyle = isNight ? '#18181B' : '#292524';
      ctx.beginPath();
      ctx.ellipse(0, 15, 34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3);

      // Glowing charcoal embers in kiln
      const pulse = 0.5 + Math.sin(time * 4) * 0.35;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.beginPath();
      ctx.arc(0, 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Smoke rising from kiln
      ctx.strokeStyle = isNight ? 'rgba(148, 163, 184, 0.55)' : 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 3.5;
      const kilnSmoke = Math.sin(time * 2.5) * 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(kilnSmoke, -25, -kilnSmoke, -50);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'listopad_shrine': {
      ctx.save();
      // Wayside Shrine with frost
      ctx.fillStyle = isNight ? '#475569' : '#CBD5E1';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-10, -25, 20, 50, 2);
      ctx.fill();
      ctx.stroke();

      // Cross
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(0, -42);
      ctx.moveTo(-7, -35);
      ctx.lineTo(7, -35);
      ctx.stroke();
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}
