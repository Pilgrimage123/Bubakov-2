/**
 * Květen v Hrusicích – Authentic Josef Lada May Village Landmarks & Decorative Cartouche
 *
 * Implements the handcrafted procedural canvas rendering for Stage 5:
 * - Hand-lettered KVĚTEN title cartouche with blossoming lilac, climbing cockchafers, and Gemini cherubs.
 * - Tall decorated Maypole (Májka) with dancing folk dancers in colorful Bohemian kroje.
 * - Roadside post with framed shrine of Sv. Jan Nepomucký (feast May 16) with 5-star halo.
 * - Upper sheep pasture with flute-playing shepherd under gentle May rain showers.
 * - Blooming orchard with village maidens weaving floral wreaths.
 * - Warm brook shallows with splashing village boys.
 * - Goat grove with spotted goats grazing among blooming birches.
 * - Village elder in thick winter sheepskin coat (kožuch) with pipe and cane.
 */

import {
  KVETEN_POIS,
  KVETEN_STREAM_WAYPOINTS,
  KVETEN_POND_REGION,
} from '../data/kvetenArena';
import {
  drawAuthenticRoubenka,
  drawAllVillageCottages,
} from './villageBuildingRenderer';

function drawMayCottage(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  roofH: number,
  wallColor: string,
  roofColor: string,
  gableColor: string,
  isNight: boolean,
  label?: string
): void {
  drawAuthenticRoubenka(ctx, cx, cy, w, h, roofH, {
    wallColor,
    roofColor,
    gableColor,
    isNight,
    label,
    season: 'spring',
  });
}

export function drawKvetenMayLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  time = 0,
  isNight = false
): void {
  const ink = '#23170F';
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (type === 'kveten_border') {
    // 0a. Village dirt road network connecting church, green, bridges, school, pond, and mill
    ctx.save();
    ctx.strokeStyle = isNight ? '#5C4938' : '#D4B483';
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

    // 0b. Warm May Hrusice stream (KVETEN_STREAM_WAYPOINTS)
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 96;
    ctx.beginPath();
    for (let i = 0; i < KVETEN_STREAM_WAYPOINTS.length; i++) {
      const pt = KVETEN_STREAM_WAYPOINTS[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    ctx.strokeStyle = isNight ? '#0369A1' : '#38BDF8';
    ctx.lineWidth = 86;
    ctx.stroke();

    ctx.strokeStyle = isNight ? 'rgba(186, 230, 253, 0.25)' : 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 36;
    ctx.stroke();
    ctx.restore();

    // 0c. Two wooden bridges across the stream at (425, -455) and (475, 420)
    for (const br of [
      { x: 425, y: -455, w: 148, h: 66 },
      { x: 475, y: 420, w: 148, h: 66 },
    ]) {
      ctx.save();
      ctx.translate(br.x, br.y);
      ctx.fillStyle = '#8C5832';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3.5;
      ctx.fillRect(-br.w / 2, -br.h / 2, br.w, br.h);
      ctx.strokeRect(-br.w / 2, -br.h / 2, br.w, br.h);
      ctx.restore();
    }

    // 0d. Village cottages matching KVETEN_OBSTACLES & MARCH_COTTAGE_ROOF_SPECS (all 6 cottages)
    drawAllVillageCottages(ctx, 'spring', isNight, time);

    // 1. Physical and folk boundary at [-1920..1920, -1675..1675]
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(-1920, -1675, 3840, 3350);

    // Warm green and gold folk trim
    ctx.strokeStyle = '#4D7C0F';
    ctx.lineWidth = 10;
    ctx.strokeRect(-1930, -1685, 3860, 3370);

    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-1936, -1691, 3872, 3382);

    // 2. Top Ornamental KVĚTEN Cartouche Banner
    ctx.save();
    ctx.translate(0, -1590);

    // Parchment ribbon scroll
    ctx.fillStyle = isNight ? '#1E293B' : '#FEF3C7';
    ctx.strokeStyle = isNight ? '#FACC15' : ink;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-280, -45);
    ctx.quadraticCurveTo(0, -65, 280, -45);
    ctx.quadraticCurveTo(300, 0, 280, 45);
    ctx.quadraticCurveTo(0, 25, -280, 45);
    ctx.quadraticCurveTo(-300, 0, -280, -45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red/gold serif lettered title: KVĚTEN / MÁJOVÁ NOC
    ctx.fillStyle = isNight ? '#FDE047' : '#DC2626';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.font = isNight ? '900 40px Eczar, Georgia, serif' : '900 48px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bannerTitle = isNight ? 'KVĚTEN • MÁJOVÁ NOC' : 'KVĚTEN';
    ctx.fillText(bannerTitle, 0, -2);
    ctx.strokeText(bannerTitle, 0, -2);

    // Blossoming lilac (šeřík) trusses flanking the banner
    const drawLilacTruss = (lx: number, ly: number, flip: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.scale(flip, 1);
      // Green stem and leaves
      ctx.fillStyle = '#65A30D';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(-15, 8, 18, 9, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(15, 12, 16, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Clusters of lilac florets
      const floretColors = ['#D8B4FE', '#C084FC', '#E879F9', '#F472B6'];
      for (let i = 0; i < 9; i++) {
        const ox = (i % 3 - 1) * 11 + (Math.sin(i * 1.7) * 3);
        const oy = -14 + Math.floor(i / 3) * 11;
        ctx.fillStyle = floretColors[i % floretColors.length];
        ctx.beginPath();
        ctx.arc(ox, oy, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    drawLilacTruss(-295, 0, -1);
    drawLilacTruss(295, 0, 1);

    // Crawling Cockchafer (Chroust) with waistcoat on top border
    const drawBorderChroust = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      // Brown shiny elytras
      ctx.fillStyle = '#854D0E';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tiny green waistcoat
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-8, -4, 16, 8);
      ctx.strokeRect(-8, -4, 16, 8);
      // Golden buttons
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(0, -1, 1.6, 0, Math.PI * 2);
      ctx.arc(0, 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // Head and fan antennae
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.arc(0, -14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Antenna fans
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-3, -18);
      ctx.lineTo(-10, -26);
      ctx.moveTo(3, -18);
      ctx.lineTo(10, -26);
      ctx.stroke();
      ctx.restore();
    };

    drawBorderChroust(-370, -15, 0.4);
    drawBorderChroust(370, -15, -0.4);

    ctx.restore();

    // 3. Bottom Center Gemini (Blíženci) Medallion
    ctx.save();
    ctx.translate(0, 1600);
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Two twin cherub silhouettes holding hands
    ctx.fillStyle = '#F472B6';
    ctx.font = '900 24px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♊ MÁJ', 0, 0);
    ctx.restore();

    ctx.restore();
    return;
  }

  if (type === 'kveten_maypole') {
    // Central Maypole (Májka) at the village green
    // High wooden spruce trunk
    ctx.fillStyle = '#FDE68A';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.fillRect(-6, -180, 12, 195);
    ctx.strokeRect(-6, -180, 12, 195);

    // Green decorated spruce top
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, -230);
    ctx.lineTo(-24, -175);
    ctx.lineTo(24, -175);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wreath at the spruce neck with streaming ribbons
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.ellipse(0, -175, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fluttering silk ribbons
    const ribbonColors = ['#DC2626', '#2563EB', '#FACC15', '#FFFFFF', '#16A34A'];
    for (let r = 0; r < 5; r++) {
      const rx = (r - 2) * 10;
      const sway = Math.sin(time * 3 + r * 1.2) * 14;
      ctx.strokeStyle = ribbonColors[r];
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(rx, -175);
      ctx.quadraticCurveTo(rx + sway * 0.6, -120, rx + sway, -65);
      ctx.stroke();
    }

    if (!isNight) {
      // Dancing village folk around the base (Bohemian kroje)
      const drawDancer = (dx: number, dy: number, isBoy: boolean) => {
        ctx.save();
        ctx.translate(dx, dy);
        // Legs
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-5, 10);
        ctx.lineTo(-7, 24);
        ctx.moveTo(5, 10);
        ctx.lineTo(7, 24);
        ctx.stroke();
        if (isBoy) {
          // Boy: blue waistcoat, white shirt, red feather cap
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-8, -12, 16, 22);
          ctx.strokeRect(-8, -12, 16, 22);
          ctx.fillStyle = '#1D4ED8';
          ctx.fillRect(-7, -8, 14, 16);
          ctx.strokeRect(-7, -8, 14, 16);
          // Head
          ctx.fillStyle = '#FED7AA';
          ctx.beginPath();
          ctx.arc(0, -20, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Green hat with feather
          ctx.fillStyle = '#15803D';
          ctx.fillRect(-8, -27, 16, 6);
          ctx.strokeRect(-8, -27, 16, 6);
        } else {
          // Girl: wide pink skirt, white apron, red scarf
          ctx.fillStyle = '#F43F5E';
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(-18, 16);
          ctx.lineTo(18, 16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Apron
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-6, -4, 12, 18);
          ctx.strokeRect(-6, -4, 12, 18);
          // Head
          ctx.fillStyle = '#FED7AA';
          ctx.beginPath();
          ctx.arc(0, -18, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Red scarf
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(0, -22, 6.5, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      };

      const danceWave = Math.sin(time * 2.5);
      drawDancer(-42 + danceWave * 4, 12, false);
      drawDancer(-18 - danceWave * 3, 14, true);
      drawDancer(22 + danceWave * 3, 14, false);
      drawDancer(46 - danceWave * 4, 12, true);
    } else {
      // At night, the dancers have gone inside the warm tavern and cottages;
      // warm festive lanterns glow at the foot of the Maypole while fireflies circle.
      for (const lx of [-28, 28]) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.28)';
        ctx.beginPath();
        ctx.arc(lx, 6, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF08A';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.4;
        ctx.fillRect(lx - 6, 0, 12, 14);
        ctx.strokeRect(lx - 6, 0, 12, 14);
      }
    }

    ctx.restore();
    return;
  }

  if (type === 'kveten_shrine') {
    // Roadside post with framed image of Sv. Jan Nepomucký (feast May 16)
    // Wooden post
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.fillRect(-6, -40, 12, 60);
    ctx.strokeRect(-6, -40, 12, 60);

    // Carved wooden picture shrine
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(-34, -112, 68, 76);
    ctx.strokeRect(-34, -112, 68, 76);

    // Little shrine shingle roof
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(0, -132);
    ctx.lineTo(-44, -110);
    ctx.lineTo(44, -110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Saint John of Nepomuk with crucifix and 5 stars
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0, Math.PI * 2);
    ctx.fill();
    // Biretta cap
    ctx.fillRect(-8, -94, 16, 7);
    // Crucifix
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(2, -88);
    ctx.lineTo(14, -66);
    ctx.moveTo(6, -82);
    ctx.lineTo(14, -76);
    ctx.stroke();

    // 5 golden halo stars
    ctx.fillStyle = '#FACC15';
    for (let s = 0; s < 5; s++) {
      const sa = (s / 5) * Math.PI + Math.PI;
      const sx = Math.cos(sa) * 18;
      const sy = -80 + Math.sin(sa) * 14;
      ctx.beginPath();
      ctx.arc(sx, sy, isNight ? 3.2 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred protective glow pulse + swirling St. John's fireflies at night
    ctx.strokeStyle = isNight ? 'rgba(250, 204, 21, 0.72)' : 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 3.0;
    const pulseR = 55 + Math.sin(time * 3) * 6;
    ctx.beginPath();
    ctx.arc(0, -78, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    if (isNight) {
      const fireflyColors = ['#FDE047', '#A3E635', '#38BDF8', '#F472B6'];
      for (let f = 0; f < 7; f++) {
        const fa = time * 1.9 + f * 0.9;
        const fx = Math.cos(fa) * (36 + (f % 3) * 14);
        const fy = -72 + Math.sin(fa * 1.3) * 28;
        ctx.fillStyle = fireflyColors[f % fireflyColors.length];
        ctx.beginPath();
        ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    return;
  }

  if (type === 'kveten_pasture') {
    // Upper sheep pastures ("V máji nemá pastýřovi oschnout hůl")
    // Grassy knoll
    ctx.fillStyle = isNight ? '#365314' : '#65A30D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 75, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isNight) {
      // Fluffy sheep
      const drawSheep = (sx: number, sy: number) => {
        ctx.save();
        ctx.translate(sx, sy);
        // Legs
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(-8, 15);
        ctx.moveTo(8, 6);
        ctx.lineTo(8, 15);
        ctx.stroke();
        // Wool body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.arc(-8, -2, 10, 0, Math.PI * 2);
        ctx.arc(8, -2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Head
        ctx.fillStyle = '#1C1917';
        ctx.beginPath();
        ctx.arc(14, -4, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      drawSheep(-42, 6);
      drawSheep(36, 10);

      // Sitting shepherd with flute
      ctx.save();
      ctx.translate(0, -18);
      // Brown coat and hat
      ctx.fillStyle = '#78350F';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.6;
      ctx.fillRect(-10, -6, 20, 22);
      ctx.strokeRect(-10, -6, 20, 22);
      // Head and hat with feather
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.arc(0, -14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(-9, -21, 18, 5);
      ctx.strokeRect(-9, -21, 18, 5);
      // Wooden fife/flute
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(2, -12);
      ctx.lineTo(16, -6);
      ctx.stroke();
      // Musical notes floating up
      ctx.fillStyle = '#2563EB';
      ctx.font = '14px sans-serif';
      ctx.fillText('♪', 18 + Math.sin(time * 2) * 4, -18 - (time * 12 % 24));
      ctx.restore();
    } else {
      // At night, the shepherd and sheep are tucked inside the sheepfold;
      // only the shepherd's crook and dewy fireflies remain on the moonlit knoll.
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(0, -28);
      ctx.arc(7, -28, 7, Math.PI, Math.PI * 2.2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const fx = Math.cos(time * 1.6 + i * 1.5) * 46;
        const fy = -10 + Math.sin(time * 2.4 + i) * 12;
        ctx.fillStyle = i % 2 === 0 ? '#FDE047' : '#38BDF8';
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    return;
  }

  if (type === 'kveten_orchard') {
    // Hilltop Church at (-800, -650) + Blooming May Orchard & Maidens' Wreaths
    // Stone churchyard walls matching church_wall_w, church_wall_n, church_wall_s
    ctx.fillStyle = '#D6CFC2';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-195, -185, 22, 300);
    ctx.strokeRect(-195, -185, 22, 300);
    ctx.fillRect(-195, -185, 265, 22);
    ctx.strokeRect(-195, -185, 265, 22);
    ctx.fillRect(-195, 95, 240, 22);
    ctx.strokeRect(-195, 95, 240, 22);

    // Church nave & tower at offset (0, -35) matching kostel_nave (-800, -685)
    ctx.fillStyle = isNight ? '#E2E8F0' : '#F9F1DC';
    ctx.fillRect(-82, -98, 145, 108);
    ctx.strokeRect(-82, -98, 145, 108);
    ctx.fillStyle = '#C84B31';
    ctx.beginPath();
    ctx.moveTo(-88, -98);
    ctx.lineTo(-10, -152);
    ctx.lineTo(68, -98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bell tower
    ctx.fillStyle = isNight ? '#E2E8F0' : '#F9F1DC';
    ctx.fillRect(40, -178, 52, 188);
    ctx.strokeRect(40, -178, 52, 188);
    ctx.fillStyle = '#4A2E23';
    ctx.beginPath();
    ctx.moveTo(30, -178);
    ctx.lineTo(66, -245);
    ctx.lineTo(102, -178);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blooming cherry/apple tree in the orchard courtyard
    ctx.save();
    ctx.translate(125, 45);
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(-8, 20);
    ctx.lineTo(-5, -30);
    ctx.lineTo(5, -30);
    ctx.lineTo(8, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dense crown of pink and white blossoms
    ctx.fillStyle = '#FCE7F3';
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(-22, -45, 26, 0, Math.PI * 2);
    ctx.arc(22, -45, 26, 0, Math.PI * 2);
    ctx.arc(0, -65, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Floral head-wreaths (věnečky)
    ctx.fillStyle = '#F43F5E';
    for (let w = 0; w < 4; w++) {
      const wa = (w / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(wa) * 22, -50 + Math.sin(wa) * 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
    return;
  }

  if (type === 'kveten_tavern') {
    // Májová hospoda at (440, -75) -> hospoda_main is at (462, -75), offset (+22, 0)
    drawMayCottage(ctx, 22, 0, 312, 162, 125, '#F8EED8', '#C84B31', '#E2B464', isNight, 'HOSPODA');
    ctx.restore();
    return;
  }

  if (type === 'kveten_school') {
    // Májová škola at (125, 550) -> skola_main is at (119, 550), offset (-6, 0)
    drawMayCottage(ctx, -6, 0, 300, 156, 118, '#F7EFE0', '#B8432E', '#DFB66C', isNight, 'ŠKOLA');
    ctx.restore();
    return;
  }

  if (type === 'kveten_brook') {
    // Mlýn a koupaliště v potoce at (650, 725) -> mlyn_house is at (531, 706), offset (-119, -19)
    drawMayCottage(ctx, -119, -19, 268, 156, 118, '#8C5230', '#7C3F23', '#D9A55B', isNight, 'MLÝN');

    // Rotating wooden waterwheel next to the millhouse
    ctx.save();
    ctx.translate(-18, -10);
    ctx.rotate(time * 1.1);
    ctx.fillStyle = '#9C6234';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(6, -4, 30, 8);
      ctx.strokeRect(6, -4, 30, 8);
    }
    ctx.restore();

    // Warm brook shallows (boys bathing by day, moonlit ripples & wisps by night)
    ctx.fillStyle = isNight ? '#0369A1' : '#38BDF8';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(25, 30, 80, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Water ripple rings
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2.0;
    const rip = (time * 25) % 28;
    ctx.beginPath();
    ctx.ellipse(8, 30, rip, rip * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (!isNight) {
      // Boy splashing barefoot
      ctx.save();
      ctx.translate(8, 18);
      ctx.fillStyle = '#FED7AA';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Blue rolled up trousers
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(-6, -2, 12, 14);
      ctx.strokeRect(-6, -2, 12, 14);
      ctx.restore();
    } else {
      // Glowing turquoise water-wisp hovering over the night brook
      const wx = 25 + Math.sin(time * 2.2) * 32;
      ctx.fillStyle = '#22D3EE';
      ctx.beginPath();
      ctx.arc(wx, 22, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  if (type === 'kveten_goat_grove') {
    // Goat grove ("Máj, vyženeme kozy v háj" by day, Hejkal's dark grove by night)
    // Blooming birch trunk with white bark and black notches
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.4;
    ctx.fillRect(-7, -55, 14, 75);
    ctx.strokeRect(-7, -55, 14, 75);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-6, -38, 5, 4);
    ctx.fillRect(1, -22, 5, 4);
    ctx.fillRect(-6, -8, 6, 5);

    // Green birch leaf umbrella
    ctx.fillStyle = isNight ? '#365314' : '#84CC16';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, -70, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isNight) {
      // Spotted goat with curved horns
      ctx.save();
      ctx.translate(28, 6);
      // Legs
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(-8, 16);
      ctx.moveTo(8, 6);
      ctx.lineTo(8, 16);
      ctx.stroke();
      // Body (white with black spots)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(-2, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Head with horns
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(14, -5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Horns
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(14, -10);
      ctx.quadraticCurveTo(10, -18, 6, -16);
      ctx.stroke();
      ctx.restore();
    } else {
      // At night, the goats are locked in the barn and Hejkal's glowing amber eyes peer from the thicket
      const blink = Math.sin(time * 3.5) > -0.8 ? 1 : 0.15;
      ctx.fillStyle = `rgba(251, 191, 36, ${0.95 * blink})`;
      ctx.beginPath();
      ctx.arc(24, -8, 4.2, 0, Math.PI * 2);
      ctx.arc(35, -8, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  if (type === 'kveten_elder') {
    // Village elder in heavy winter sheepskin coat ("Do svatého Ducha nesvlíkej kožucha...")
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    // Long sheepskin fur coat (kožuch) with embroidered hem
    ctx.beginPath();
    ctx.moveTo(-16, -24);
    ctx.lineTo(16, -24);
    ctx.lineTo(22, 28);
    ctx.lineTo(-22, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fur collar & embroidery
    ctx.fillStyle = '#92400E';
    ctx.fillRect(-18, -28, 36, 9);
    ctx.strokeRect(-18, -28, 36, 9);

    // Old face with pipe and fur cap
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(0, -38, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pipe with smoke puff
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, -36);
    ctx.lineTo(14, -32);
    ctx.stroke();
    ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.beginPath();
    ctx.arc(16 + Math.sin(time * 3) * 3, -36 - ((time * 8) % 16), 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Fur hat
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.ellipse(0, -46, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Walking stick
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(-20, 30);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (type === 'kveten_pond') {
    // Fully thawed spring pond Brčálník matching KVETEN_POND_REGION (rx=280, ry=165, angle=-0.08)
    ctx.fillStyle = '#8B6E4E';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, KVETEN_POND_REGION.rx + 12, KVETEN_POND_REGION.ry + 12, KVETEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Shallow spring water
    ctx.fillStyle = isNight ? '#0369A1' : '#38BDF8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, KVETEN_POND_REGION.rx, KVETEN_POND_REGION.ry, KVETEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Deep pond center
    ctx.fillStyle = isNight ? '#075985' : '#0284C7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 192, 114, KVETEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();

    // Wooden jetty at (-560, 575) -> offset (+165, -40)
    ctx.fillStyle = '#9C6B43';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.fillRect(130, -52, 70, 24);
    ctx.strokeRect(130, -52, 70, 24);

    // Floating water lilies and yellow marsh marigolds
    const lilyColors = ['#15803D', '#166534', '#14532D'];
    for (let l = 0; l < 6; l++) {
      const la = (l / 6) * Math.PI * 2 + Math.sin(time + l) * 0.1;
      const lx = Math.cos(la) * 110;
      const ly = Math.sin(la) * 65;
      ctx.fillStyle = lilyColors[l % lilyColors.length];
      ctx.beginPath();
      ctx.ellipse(lx, ly, 14, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Yellow marsh marigold flower
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(lx + 2, ly - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  ctx.restore();
}
