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

import {
  CERVEN_POIS,
  CERVEN_STREAM_WAYPOINTS,
  CERVEN_POND_REGION,
} from '../data/cervenArena';

function drawSummerCottage(
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
  const ink = '#23170F';
  const hw = w / 2;
  const hh = h / 2;
  ctx.save();
  ctx.translate(cx, cy);

  // Ground shadow
  ctx.fillStyle = 'rgba(35, 23, 15, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, hh + 6, hw + 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main cottage walls
  ctx.fillStyle = isNight ? '#CBD5E1' : wallColor;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3.5;
  ctx.fillRect(-hw, -hh, w, h);
  ctx.strokeRect(-hw, -hh, w, h);

  // Door
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(-14, hh - 42, 28, 42);
  ctx.strokeRect(-14, hh - 42, 28, 42);

  // Windows
  for (const wx of [-hw * 0.52, hw * 0.52]) {
    ctx.fillStyle = isNight ? '#FDE047' : '#38BDF8';
    ctx.fillRect(wx - 13, -10, 26, 22);
    ctx.strokeRect(wx - 13, -10, 26, 22);
  }

  // Shingled trapezoid roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(-hw - 14, -hh + 3);
  ctx.lineTo(-hw * 0.45, -hh - roofH);
  ctx.lineTo(hw * 0.55, -hh - roofH);
  ctx.lineTo(hw + 14, -hh + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Folk gable
  ctx.fillStyle = gableColor;
  ctx.beginPath();
  ctx.moveTo(-hw - 8, -hh + 3);
  ctx.lineTo(-hw * 0.45, -hh - roofH);
  ctx.lineTo(0, -hh + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (label) {
    ctx.fillStyle = '#FEF3C7';
    ctx.fillRect(-44, -hh - 14, 88, 20);
    ctx.strokeRect(-44, -hh - 14, 88, 20);
    ctx.fillStyle = ink;
    ctx.font = 'bold 12px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -hh - 4);
  }

  ctx.restore();
}

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
    // 0a. Sun-baked summer dirt road network connecting all Červen POIs & bridges
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

    // 0b. Warm summer Hrusice stream (CERVEN_STREAM_WAYPOINTS)
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 96;
    ctx.beginPath();
    for (let i = 0; i < CERVEN_STREAM_WAYPOINTS.length; i++) {
      const pt = CERVEN_STREAM_WAYPOINTS[i];
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

    // 0d. Village cottages matching CERVEN_OBSTACLES & MARCH_COTTAGE_ROOF_SPECS
    drawSummerCottage(ctx, -350, -362, 250, 138, 112, '#FAF3E0', '#9E3D26', '#D9A55B', isNight);
    drawSummerCottage(ctx, 100, -412, 262, 144, 115, '#FAF3E0', '#C84B31', '#D9A55B', isNight);
    drawSummerCottage(ctx, -375, -75, 238, 138, 110, '#FAF3E0', '#8C3B2B', '#D9A55B', isNight);
    drawSummerCottage(ctx, -275, 200, 250, 138, 112, '#FAF3E0', '#B84A32', '#D9A55B', isNight);

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

    // Radiating summer sun rays (Day) or starry Svatojánská noc moon halo (Night) behind the title
    ctx.save();
    ctx.strokeStyle = isNight ? 'rgba(250, 204, 21, 0.42)' : 'rgba(245, 158, 11, 0.35)';
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
    ctx.fillStyle = isNight ? '#1E293B' : '#FEF3C7';
    ctx.strokeStyle = isNight ? '#FACC15' : ink;
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

    // Serif lettered title: ČERVEN / SVATOJÁNSKÁ NOC
    ctx.fillStyle = isNight ? '#FDE047' : '#DC2626';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.font = isNight ? '900 38px Eczar, Georgia, serif' : '900 50px Eczar, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bannerTitle = isNight ? 'ČERVEN • SVATOJÁNSKÁ NOC' : 'ČERVEN';
    ctx.fillText(bannerTitle, 0, -2);
    ctx.strokeText(bannerTitle, 0, -2);

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

    if (!isNight) {
      // Daytime: Farmer reaper standing with pitchfork (vidle)
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
    } else {
      // Nighttime (Červnová noc): Reapers are asleep; glowing boundary fire wisps (jiskry Ohnivého sudličky) dance over the hay
      for (let f = 0; f < 4; f++) {
        const fx = -80 + f * 52 + Math.sin(time * 2.6 + f) * 14;
        const fy = -55 + Math.cos(time * 3.1 + f * 1.4) * 18;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
        ctx.beginPath();
        ctx.arc(fx, fy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = f % 2 === 0 ? '#FACC15' : '#FB923C';
        ctx.beginPath();
        ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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

    // At night (Červnová noc), draw flickering St. John's votive candles at the base of the oak shrine
    if (isNight) {
      for (const cx of [-22, 22]) {
        const flicker = Math.sin(time * 7 + cx) * 1.5;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.30)';
        ctx.beginPath();
        ctx.arc(cx, 38, 18 + flicker, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF9C3';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.fillRect(cx - 4, 38, 8, 14);
        ctx.strokeRect(cx - 4, 38, 8, 14);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, 34 + flicker * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  } else if (type === 'cerven_crayfish_pool') {
    // Creek weir & deep pool labeled "NA RACÍCH" with river crayfish + mlyn_house at offset (-119, -19)
    ctx.save();
    drawSummerCottage(ctx, -119, -19, 268, 156, 118, '#8C5230', '#7C3F23', '#D9A55B', isNight, 'MLÝN');

    // Shaded cool water pool
    ctx.fillStyle = '#0369A1';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(25, 25, 95, 48, 0, 0, Math.PI * 2);
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
    // Summer village tavern building (hospoda_main at offset +22, 0) + shaded porch under blooming linden tree
    ctx.save();
    drawSummerCottage(ctx, 22, 0, 312, 162, 125, '#F8EED8', '#C84B31', '#E2B464', isNight, 'HOSPODA');

    // Outdoor shaded wooden porch & table in front of tavern (-152, 12)
    ctx.save();
    ctx.translate(-152, 12);
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-52, -24, 104, 48);
    ctx.strokeRect(-52, -24, 104, 48);

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

    ctx.restore();
  } else if (type === 'cerven_pond') {
    // Warm summer pond matching CERVEN_POND_REGION (rx=280, ry=165, angle=-0.08)
    ctx.save();
    ctx.fillStyle = '#8B6E4E';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, CERVEN_POND_REGION.rx + 12, CERVEN_POND_REGION.ry + 12, CERVEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isNight ? '#0369A1' : '#0284C7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, CERVEN_POND_REGION.rx, CERVEN_POND_REGION.ry, CERVEN_POND_REGION.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wooden jetty at (-560, 575) -> offset (+165, -40)
    ctx.fillStyle = '#9C6B43';
    ctx.fillRect(130, -52, 70, 24);
    ctx.strokeRect(130, -52, 70, 24);

    // Floating green water lily pads with notches
    const padPositions = [
      { x: -75, y: -25, r: 18 },
      { x: -30, y: 35, r: 22 },
      { x: 50, y: -30, r: 20 },
      { x: 80, y: 25, r: 19 },
    ];
    for (const pad of padPositions) {
      ctx.fillStyle = isNight ? '#065F46' : '#15803D';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, pad.r, 0.4, Math.PI * 2 - 0.4);
      ctx.lineTo(pad.x, pad.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White blooming flower on pad (glowing softly at night)
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

    // At night, draw dancing will-o'-the-wisps (bludičky) in the reeds around the pond
    if (isNight) {
      for (let w = 0; w < 4; w++) {
        const wAng = time * 1.4 + w * 1.57;
        const wx = Math.cos(wAng) * 115;
        const wy = Math.sin(wAng * 1.3) * 65;
        ctx.fillStyle = w % 2 === 0 ? '#22D3EE' : '#A3E635';
        ctx.beginPath();
        ctx.arc(wx, wy, 4.5 + Math.sin(time * 5 + w) * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
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
    ctx.fillStyle = isNight ? '#B45309' : '#F59E0B';
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
    ctx.strokeStyle = isNight ? '#78350F' : '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-8, 8);
    ctx.moveTo(8, -18);
    ctx.lineTo(14, 6);
    ctx.stroke();

    ctx.restore();
  } else if (type === 'cerven_village') {
    // Hrusice village green (Náves): Timbered cottage + Midsummer Bonfire (Svatojánský oheň)
    ctx.save();

    // Background timbered Hrusice cottage (roubenka) north of the green
    ctx.save();
    ctx.translate(0, -68);
    // Whitewashed cottage walls
    ctx.fillStyle = isNight ? '#CBD5E1' : '#FFFBEB';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-72, -24, 144, 54);
    ctx.strokeRect(-72, -24, 144, 54);
    // Thatched/red gable roof
    ctx.fillStyle = isNight ? '#7F1D1D' : '#B91C1C';
    ctx.beginPath();
    ctx.moveTo(-84, -24);
    ctx.lineTo(0, -72);
    ctx.lineTo(84, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Cottage windows (warmly lit from inside at night!)
    for (const wx of [-42, 42]) {
      if (isNight) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.32)';
        ctx.beginPath();
        ctx.arc(wx, 0, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isNight ? '#FDE047' : '#38BDF8';
      ctx.fillRect(wx - 11, -10, 22, 20);
      ctx.strokeRect(wx - 11, -10, 22, 20);
    }
    ctx.restore();

    // Stone-ringed Midsummer Hearth on the village green (Svatojánské ohniště)
    ctx.save();
    ctx.translate(0, 24);
    ctx.fillStyle = 'rgba(35, 23, 15, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 46, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crossed wooden logs
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    for (const rot of [-0.35, 0.35, 0]) {
      ctx.save();
      ctx.rotate(rot);
      ctx.fillRect(-28, -5, 56, 10);
      ctx.strokeRect(-28, -5, 56, 10);
      ctx.restore();
    }

    // Ring of hearth stones
    for (let s = 0; s < 10; s++) {
      const sa = (s / 10) * Math.PI * 2;
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.arc(Math.cos(sa) * 34, Math.sin(sa) * 14 + 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (isNight) {
      // Roaring Svatojánský oheň (Midsummer Bonfire) at night!
      const flamePulse = Math.sin(time * 8) * 4;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.beginPath();
      ctx.arc(0, -18, 56 + flamePulse, 0, Math.PI * 2);
      ctx.fill();

      // Outer orange flame
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(-24, 2);
      ctx.quadraticCurveTo(-30, -28, 0, -54 - flamePulse);
      ctx.quadraticCurveTo(30, -28, 24, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner golden-white flame core
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(-12, 2);
      ctx.quadraticCurveTo(-15, -18, 0, -36 - flamePulse * 0.6);
      ctx.quadraticCurveTo(15, -18, 12, 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  } else if (type === 'cerven_church') {
    // Hilltop Hrusice Church at (-800, -650) with churchyard walls & Mrakozvon storm bell
    ctx.save();
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

    ctx.fillStyle = isNight ? '#CBD5E1' : '#FEF3C7';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    // Nave & bell tower matching kostel_nave (-800, -685)
    ctx.fillRect(-82, -98, 145, 108);
    ctx.strokeRect(-82, -98, 145, 108);
    ctx.fillStyle = isNight ? '#7F1D1D' : '#C84B31';
    ctx.beginPath();
    ctx.moveTo(-88, -98);
    ctx.lineTo(-10, -152);
    ctx.lineTo(68, -98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isNight ? '#CBD5E1' : '#FEF3C7';
    ctx.fillRect(40, -178, 52, 188);
    ctx.strokeRect(40, -178, 52, 188);
    // Red tiled spire
    ctx.fillStyle = isNight ? '#7F1D1D' : '#DC2626';
    ctx.beginPath();
    ctx.moveTo(30, -178);
    ctx.lineTo(66, -245);
    ctx.lineTo(102, -178);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Golden cross & Mrakozvon belfry arch
    ctx.fillStyle = isNight ? '#FDE047' : '#1E293B';
    ctx.beginPath();
    ctx.arc(66, -140, 11, Math.PI, 0);
    ctx.lineTo(77, -124);
    ctx.lineTo(55, -124);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (type === 'cerven_school') {
    // Hrusice village schoolhouse at (125, 550) matching skola_main (119, 550, 300x156)
    ctx.save();
    drawSummerCottage(ctx, -6, 0, 300, 156, 118, '#FEF9C3', '#B45309', '#DFB66C', isNight, 'ŠKOLA');
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a glowing St. John's herb (Svatojánská bylina) on the ground during Stage 8 (Červnová noc).
 */
export function drawSvatojanskaBylina(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flowerColor = '#FACC15',
  glowColor = '#FEF08A',
  time = 0
): void {
  const pulse = 0.85 + Math.sin(time * 4.2 + x * 0.05) * 0.15;
  ctx.save();
  ctx.translate(x, y);

  // Soft magical ground halo
  ctx.fillStyle = glowColor;
  ctx.globalAlpha = 0.28 * pulse;
  ctx.beginPath();
  ctx.arc(0, -4, 24 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Fern/herb leaves with crisp Josef Lada ink outline
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 2.2;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(side * 14, 2, side * 16, -6);
    ctx.quadraticCurveTo(side * 8, -10, 0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Central stem
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(0, -14);
  ctx.stroke();

  // Blooming enchanted flower head
  for (let p = 0; p < 5; p++) {
    const ang = (p / 5) * Math.PI * 2 + time * 0.8;
    const px = Math.cos(ang) * 5.5;
    const py = -14 + Math.sin(ang) * 5.5;
    ctx.fillStyle = flowerColor;
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(px, py, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Bright golden core
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -14, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the buried Midsummer Earth Treasure & Blooming Golden Fern (Zlaté kapradí a Poklad v zemi)
 * in Stage 8 (Červnová noc).
 */
export function drawSvatojanskyPoklad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unlocked: boolean,
  opened: boolean,
  time = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  const pulse = 0.88 + Math.sin(time * 3.8) * 0.12;

  // Earth fissure / mossy stone circle
  ctx.fillStyle = unlocked ? 'rgba(250, 204, 21, 0.25)' : 'rgba(30, 41, 59, 0.45)';
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 8, 38 * pulse, 18 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fern fronds radiating around the spot
  const frondCount = 6;
  for (let i = 0; i < frondCount; i++) {
    const ang = (i / frondCount) * Math.PI * 2 + Math.sin(time * 1.5 + i) * 0.08;
    const fx = Math.cos(ang) * 28;
    const fy = 4 + Math.sin(ang) * 13;
    ctx.fillStyle = unlocked ? '#FACC15' : '#15803D';
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.quadraticCurveTo(fx * 0.6, fy - 8, fx, fy);
    ctx.quadraticCurveTo(fx * 0.5, fy + 5, 0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (unlocked && !opened) {
    // Glowing open earth chasm with golden treasure chest & blooming golden fern flower
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(-18, -10, 36, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Gold coins & jewels overflowing
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(0, -10, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blooming Golden Fern star above the chest
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -24 + Math.sin(time * 5) * 3, 9 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (opened) {
    // Opened empty ancient coffer with lingering golden sparkles
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-16, -6, 32, 16, 3);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
