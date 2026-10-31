/**
 * Červen v Hrusicích – Authentic Josef Lada June Summer Landmarks & Decorative Cartouche
 *
 * Implements the handcrafted procedural canvas rendering for Stage 7:
 * - Hand-lettered ČERVEN title cartouche adorned with meadow blossoms (daisies, blue cornflowers, buttercups).
 * - Golden haymaking meadow (senoseč) with horse-drawn hay wagon (žebřiňák) and farmers with pitchforks.
 * - Pilgrimage oak shrine of Sv. Antonín Paduánského with flower garland, framed icon, and red squirrel.
 * - Creek pool labeled "NA RACÍCH" with stone weir, willow roots, and authentic river crayfish.
 * - Blueberry grove (Borůvkový háj) with gathering wicker baskets, tin cans, and wild strawberries.
 * - Shaded tavern porch under blooming lime tree with cold buttermilk jugs.
 * - Hilltop church with storm bells and warm water lily pond.
 */

import { CERVEN_POIS } from '../data/cervenArena';

export function drawCervenSummerLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  time = 0,
  isNight = false
): void {
  const ink = '#23170F';
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (type === 'cerven_border') {
    // 1. Physical and folk boundary at [-1920..1920, -1675..1675]
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(-1920, -1675, 3840, 3350);

    // Warm golden harvest & meadow green folk trim
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 10;
    ctx.strokeRect(-1930, -1685, 3860, 3370);

    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-1936, -1691, 3872, 3382);

    // 2. Top Ornamental ČERVEN Cartouche Banner
    ctx.save();
    ctx.translate(0, -1590);

    // Radiating summer sun rays behind the title
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 120, Math.sin(angle) * 60);
      ctx.lineTo(Math.cos(angle) * 360, Math.sin(angle) * 110);
      ctx.stroke();
    }
    ctx.restore();

    // Parchment ribbon scroll
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-290, -48);
    ctx.quadraticCurveTo(0, -68, 290, -48);
    ctx.quadraticCurveTo(310, 0, 290, 48);
    ctx.quadraticCurveTo(0, 28, -290, 48);
    ctx.quadraticCurveTo(-310, 0, -290, -48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red serif lettered title: ČERVEN
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.font = '900 50px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ČERVEN', 0, -2);
    ctx.strokeText('ČERVEN', 0, -2);

    // Woven meadow flowers flanking the banner (daisies, blue cornflowers, buttercups)
    const drawMeadowFlowerCluster = (lx: number, ly: number, flip: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.scale(flip, 1);

      // Green stem & foliage
      ctx.fillStyle = '#16A34A';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-16, 6, 18, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(14, 10, 16, 7, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Daisy (Sedmikráska / Kopretina)
      ctx.fillStyle = '#FFFFFF';
      for (let p = 0; p < 8; p++) {
        const pa = (p / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(-18 + Math.cos(pa) * 8, -12 + Math.sin(pa) * 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(-18, -12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Blue Cornflower (Chrpa modrá)
      ctx.fillStyle = '#2563EB';
      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(16, -10);
        ctx.lineTo(16 + Math.cos(pa) * 11, -10 + Math.sin(pa) * 11);
        ctx.lineTo(16 + Math.cos(pa + 0.3) * 8, -10 + Math.sin(pa + 0.3) * 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#1E3A8A';
      ctx.beginPath();
      ctx.arc(16, -10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden Buttercup (Blatouch / Pryskyřník)
      ctx.fillStyle = '#F59E0B';
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0 + Math.cos(pa) * 7, 14 + Math.sin(pa) * 7, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(0, 14, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    drawMeadowFlowerCluster(-305, 0, -1);
    drawMeadowFlowerCluster(305, 0, 1);

    ctx.restore();
  } else if (type === 'cerven_hay_wagon') {
    // Golden haymaking meadow with loaded hay wagon (žebřiňák)
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(35, 23, 15, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 40, 130, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brown workhorse
    ctx.fillStyle = '#854D0E';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(110, 10, 38, 22, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Horse neck & head
    ctx.beginPath();
    ctx.moveTo(135, 5);
    ctx.lineTo(155, -25);
    ctx.lineTo(170, -20);
    ctx.lineTo(150, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Horse legs
    ctx.beginPath();
    ctx.moveTo(95, 25);
    ctx.lineTo(95, 48);
    ctx.moveTo(125, 25);
    ctx.lineTo(125, 48);
    ctx.stroke();

    // Wooden cart body & big spoked wheels
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-70, 0, 140, 26);
    ctx.strokeRect(-70, 0, 140, 26);

    // Front & rear wagon wheels
    const drawWheel = (wx: number, wy: number) => {
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(wx, wy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(wx, wy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 22, wy + Math.sin(a) * 22);
        ctx.lineTo(wx - Math.cos(a) * 22, wy - Math.sin(a) * 22);
        ctx.stroke();
      }
    };
    drawWheel(-45, 28);
    drawWheel(45, 28);

    // Huge pile of fragrant dried golden hay on the wagon
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-75, 2);
    ctx.quadraticCurveTo(-85, -60, -20, -85);
    ctx.quadraticCurveTo(0, -95, 30, -82);
    ctx.quadraticCurveTo(85, -55, 75, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Straw texture strokes
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 12; i++) {
      const sx = -55 + i * 10;
      const sy = -30 - Math.sin(i * 0.5) * 35;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 14, sy + 18);
      ctx.stroke();
    }

    // Farmer reaper standing with pitchfork (vidle)
    ctx.fillStyle = '#1D4ED8'; // Blue trousers
    ctx.fillRect(-95, 5, 14, 32);
    ctx.strokeRect(-95, 5, 14, 32);
    ctx.fillStyle = '#FFFFFF'; // White folk shirt
    ctx.beginPath();
    ctx.ellipse(-88, -8, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FCD34D'; // Straw hat
    ctx.beginPath();
    ctx.ellipse(-88, -24, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Pitchfork
    ctx.strokeStyle = '#525252';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-96, 35);
    ctx.lineTo(-76, -55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-78, -55);
    ctx.lineTo(-72, -68);
    ctx.moveTo(-76, -55);
    ctx.lineTo(-76, -70);
    ctx.moveTo(-74, -55);
    ctx.lineTo(-80, -68);
    ctx.stroke();

    ctx.restore();
  } else if (type === 'cerven_anthony_shrine') {
    // Pilgrimage oak shrine of Sv. Antonín Paduánského with flower garland and squirrel
    ctx.save();
    // Mighty oak trunk
    ctx.fillStyle = '#451A03';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-35, 50);
    ctx.lineTo(-25, -120);
    ctx.quadraticCurveTo(0, -135, 25, -120);
    ctx.lineTo(35, 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spreading oak branch to the left
    ctx.beginPath();
    ctx.moveTo(-18, -60);
    ctx.quadraticCurveTo(-65, -85, -100, -75);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#451A03';
    ctx.stroke();

    // Oak foliage
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-100, -85, 36, 0, Math.PI * 2);
    ctx.arc(0, -150, 48, 0, Math.PI * 2);
    ctx.arc(70, -110, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red squirrel (veverka) perched on branch
    ctx.save();
    ctx.translate(-75, -92);
    ctx.fillStyle = '#C2410C';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    // Body & head
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bushy tail curled up
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.quadraticCurveTo(20, -15, 12, -24);
    ctx.quadraticCurveTo(4, -20, 6, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Framed holy picture of Sv. Antonín with baby Jesus and white lily
    ctx.save();
    ctx.translate(0, -25);
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-28, -38, 56, 76);
    ctx.strokeRect(-28, -38, 56, 76);

    // Inner icon background
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(-22, -32, 44, 64);
    ctx.strokeRect(-22, -32, 44, 64);

    // Golden halo & Franciscan brown robe
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -14, 14, 0, Math.PI * 2);
    ctx.fill();

    // Saint Antonín figure
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(-12, 18);
    ctx.lineTo(-8, -12);
    ctx.lineTo(8, -12);
    ctx.lineTo(12, 18);
    ctx.closePath();
    ctx.fill();

    // Infant Jesus in arms
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4, -4, 6, 0, Math.PI * 2);
    ctx.fill();

    // White lily in hand
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(-14, -6);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-14, -8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Caption on frame
    ctx.fillStyle = '#451A03';
    ctx.font = 'bold 9px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SV. ANTONÍN', 0, 28);

    ctx.restore();

    // Braided flower garland (věnec z lučního kvítí) hanging below picture
    ctx.save();
    ctx.translate(0, 35);
    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Flowers in the wreath
    const garlandColors = ['#DC2626', '#2563EB', '#FBBF24', '#FFFFFF'];
    for (let f = 0; f < 8; f++) {
      const fa = (f / 8) * Math.PI * 2;
      ctx.fillStyle = garlandColors[f % garlandColors.length];
      ctx.beginPath();
      ctx.arc(Math.cos(fa) * 22, Math.sin(fa) * 22, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  } else if (type === 'cerven_crayfish_pool') {
    // Creek weir & deep pool labeled "NA RACÍCH" with river crayfish
    ctx.save();

    // Shaded cool water pool
    ctx.fillStyle = '#0369A1';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 15, 95, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Stone weir boulders
    const weirRocks = [
      { x: -75, y: -5, r: 16 },
      { x: -50, y: -18, r: 19 },
      { x: -18, y: -24, r: 22 },
      { x: 18, y: -22, r: 20 },
      { x: 55, y: -15, r: 18 },
      { x: 80, y: -2, r: 15 },
    ];
    for (const r of weirRocks) {
      ctx.fillStyle = '#64748B';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Wooden folk board with label: NA RACÍCH
    ctx.save();
    ctx.translate(0, -60);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-4, 0, 8, 30);
    ctx.strokeRect(-4, 0, 8, 30);
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(-55, -20, 110, 24);
    ctx.strokeRect(-55, -20, 110, 24);
    ctx.fillStyle = '#991B1B';
    ctx.font = 'bold 13px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('~ NA RACÍCH ~', 0, -8);
    ctx.restore();

    // Authentic Josef Lada river crayfish (Říční rak klepetáč)
    ctx.save();
    ctx.translate(15, 20);
    ctx.fillStyle = '#0F766E'; // Dark greenish-blue crustacean shell
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;

    // Segmented abdomen & fan tail
    ctx.beginPath();
    ctx.ellipse(-24, 0, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-38, -10);
    ctx.lineTo(-48, 0);
    ctx.lineTo(-38, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Carapace (body)
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Big pincers (klepeta)
    const drawClaw = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(14, 0, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Pincer split
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(34, -4);
      ctx.moveTo(26, 0);
      ctx.lineTo(34, 4);
      ctx.stroke();
      ctx.restore();
    };
    drawClaw(14, -10, -0.4);
    drawClaw(14, 10, 0.4);

    // Long antennae
    ctx.strokeStyle = '#0F766E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(16, -4);
    ctx.quadraticCurveTo(38, -18, 55, -14);
    ctx.moveTo(16, 4);
    ctx.quadraticCurveTo(38, 18, 55, 14);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  } else if (type === 'cerven_blueberry_grove') {
    // Forest blueberry patch with baskets and wild woodland strawberries
    ctx.save();

    // Green moss & blueberry foliage patch
    ctx.fillStyle = '#14532D';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 85, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ripe blue blueberries (borůvky)
    ctx.fillStyle = '#1E1B4B';
    for (let i = 0; i < 18; i++) {
      const bx = -60 + (i * 7) + (Math.sin(i * 1.5) * 6);
      const by = -20 + (Math.cos(i * 2.1) * 22);
      ctx.beginPath();
      ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wild woodland red strawberries (lesní jahůdky) along edges
    ctx.fillStyle = '#DC2626';
    for (let s = 0; s < 5; s++) {
      const sx = -40 + s * 20;
      const sy = 24 + Math.sin(s * 1.2) * 8;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 4);
      ctx.lineTo(sx, sy - 8);
      ctx.stroke();
    }

    // Woven wicker basket (nůše na borůvky)
    ctx.save();
    ctx.translate(45, -5);
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, 18);
    ctx.lineTo(-20, -10);
    ctx.lineTo(20, -10);
    ctx.lineTo(16, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Berries heaping out of basket
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Basket handle
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -12, 16, Math.PI, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  } else if (type === 'cerven_tavern') {
    // Summer village tavern porch under blooming linden tree
    ctx.save();
    // Shaded wooden floor
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-65, -30, 130, 60);
    ctx.strokeRect(-65, -30, 130, 60);

    // Bench & wooden table
    ctx.fillStyle = '#92400E';
    ctx.fillRect(-35, -15, 70, 30);
    ctx.strokeRect(-35, -15, 70, 30);

    // Earthenware jug of cool buttermilk (džbán podmáslí)
    ctx.fillStyle = '#D97706';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-14, 0, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Two foamy beer steins for thirsty reapers
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(8, -6, 9, 12);
    ctx.strokeRect(8, -6, 9, 12);
    ctx.fillStyle = '#FFFFFF'; // Foam
    ctx.beginPath();
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (type === 'cerven_pond') {
    // Warm summer pond with floating water lilies
    ctx.save();
    ctx.fillStyle = '#0284C7';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 160, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Floating green water lily pads with notches
    const padPositions = [
      { x: -75, y: -25, r: 18 },
      { x: -30, y: 35, r: 22 },
      { x: 50, y: -30, r: 20 },
      { x: 80, y: 25, r: 19 },
    ];
    for (const pad of padPositions) {
      ctx.fillStyle = '#15803D';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r, 0.4, Math.PI * 2 - 0.4);
      ctx.lineTo(pad.x, pad.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White blooming flower on pad
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  } else if (type === 'cerven_haystack') {
    // Standalone thatched haystack (kopa sena)
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(35, 23, 15, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center wooden pole sticking out of top
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, -52);
    ctx.stroke();

    // Hay mound
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28, 16);
    ctx.quadraticCurveTo(-32, -15, 0, -40);
    ctx.quadraticCurveTo(32, -15, 28, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Straw ridges
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-8, 8);
    ctx.moveTo(8, -18);
    ctx.lineTo(14, 6);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}
