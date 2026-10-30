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

import { KVETEN_POIS } from '../data/kvetenArena';

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
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = ink;
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

    // Red serif lettered title: KVĚTEN
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.font = '900 48px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KVĚTEN', 0, -2);
    ctx.strokeText('KVĚTEN', 0, -2);

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
      ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred protective glow pulse
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 3.0;
    const pulseR = 55 + Math.sin(time * 3) * 6;
    ctx.beginPath();
    ctx.arc(0, -78, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (type === 'kveten_pasture') {
    // Upper sheep pastures with flute-playing shepherd ("V máji nemá pastýřovi oschnout hůl")
    // Grassy knoll
    ctx.fillStyle = '#65A30D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 75, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

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

    ctx.restore();
    return;
  }

  if (type === 'kveten_orchard') {
    // Blooming orchard by church with maidens weaving flower wreaths
    // Blooming cherry/apple tree
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
    return;
  }

  if (type === 'kveten_brook') {
    // Warm brook with boys bathing and splashing
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Water ripple rings
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2.0;
    const rip = (time * 25) % 28;
    ctx.beginPath();
    ctx.ellipse(-18, 0, rip, rip * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Boy splashing barefoot
    ctx.save();
    ctx.translate(-18, -12);
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

    ctx.restore();
    return;
  }

  if (type === 'kveten_goat_grove') {
    // Goat grove ("Máj, vyženeme kozy v háj")
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
    ctx.fillStyle = '#84CC16';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, -70, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

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
    // Fully thawed spring pond Brčálník with yellow marsh marigolds and water lilies
    ctx.fillStyle = '#8B6E4E';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 290, 195, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Shallow spring water
    ctx.fillStyle = '#38BDF8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 276, 182, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Deep pond center
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 192, 126, 0, 0, Math.PI * 2);
    ctx.fill();

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
