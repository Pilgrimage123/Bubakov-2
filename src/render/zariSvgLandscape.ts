/**
 * Procedural Josef Lada Canvas 2D landscape renderer for Stages 13 & 14 (Září v Hrusicích – Den & Noc).
 * Stage 13 (Day): Zářijové posvícení, sklizeň švestek, měděný kotel na povidla a babí léto.
 * Stage 14 (Night): Svatováclavská noc, mlhy u rybníka a svatý oheň u kostela sv. Václava.
 * Strictly follows Ladovská paleta: #1A1412 ink outlines, warm early-autumn ochres, plum purples,
 * copper cauldron glints, and silvery Wenceslas mist.
 */

const INK = '#1A1412';

function strokeOutline(ctx: CanvasRenderingContext2D, width = 3.5) {
  ctx.lineWidth = width;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawPlumTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  withLadder = false,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(8, 12, 24, 0.34)' : 'rgba(58, 42, 24, 0.22)';
  ctx.beginPath();
  ctx.ellipse(6, 36, 46, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = isNight ? '#3B281E' : '#5C3D28';
  ctx.beginPath();
  ctx.moveTo(-9, 36);
  ctx.quadraticCurveTo(-6, 4, -5, -24);
  ctx.lineTo(6, -24);
  ctx.quadraticCurveTo(7, 4, 10, 36);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3);

  // Canopy (early autumn olive-green & golden-bronze foliage)
  const puffs = [
    { cx: -24, cy: -34, r: 28, c: isNight ? '#2C4230' : '#5E7A36' },
    { cx: 24, cy: -32, r: 27, c: isNight ? '#354A2E' : '#6E883B' },
    { cx: 0, cy: -52, r: 32, c: isNight ? '#3D4E2C' : '#859638' },
    { cx: -14, cy: -22, r: 24, c: isNight ? '#283C2B' : '#4E6B2E' },
    { cx: 14, cy: -22, r: 24, c: isNight ? '#44522A' : '#9B8E34' }
  ];
  for (const p of puffs) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 3);
  }

  // Ripe blue-purple Hrusice plums (švestky) hanging in the crown
  const plums = [
    [-26, -34], [-14, -46], [4, -56], [20, -40],
    [-18, -20], [0, -30], [16, -22], [28, -26], [-6, -64]
  ];
  for (const [px, py] of plums) {
    ctx.fillStyle = isNight ? '#3A285C' : '#4A2E7A';
    ctx.beginPath();
    ctx.ellipse(px, py, 4.5, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 1.8);
    // powdery bloom highlight on plum
    ctx.fillStyle = isNight ? '#7B68A8' : '#9B84C9';
    ctx.beginPath();
    ctx.arc(px - 1.3, py - 1.8, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Optional wooden orchard ladder leaning on the plum tree
  if (withLadder) {
    ctx.save();
    ctx.strokeStyle = '#8C5E32';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(16, 38);
    ctx.lineTo(6, -26);
    ctx.moveTo(28, 38);
    ctx.lineTo(18, -26);
    for (let r = 0; r < 5; r++) {
      const t = (r + 0.6) / 5.5;
      const lx = 16 + (6 - 16) * t;
      const ly = 38 + (-26 - 38) * t;
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 12, ly);
    }
    ctx.stroke();
    strokeOutline(ctx, 2);
    ctx.restore();
  }

  ctx.restore();
}

function drawAutumnBirchOrMaple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  variant: 'gold' | 'crimson' = 'gold',
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = isNight ? 'rgba(8, 12, 24, 0.34)' : 'rgba(58, 42, 24, 0.2)';
  ctx.beginPath();
  ctx.ellipse(5, 36, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk (birch white-bark or maple brown)
  ctx.fillStyle = variant === 'gold' ? (isNight ? '#9E9A90' : '#E5DFD2') : (isNight ? '#3E2B1F' : '#63432B');
  ctx.beginPath();
  ctx.moveTo(-8, 36);
  ctx.lineTo(-5, -26);
  ctx.lineTo(5, -26);
  ctx.lineTo(8, 36);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 2.8);

  if (variant === 'gold') {
    // Birch bark notches
    ctx.fillStyle = INK;
    ctx.fillRect(-4, -4, 5, 2.5);
    ctx.fillRect(1, 10, 5, 2.5);
    ctx.fillRect(-3, 22, 4, 2.5);
  }

  const c1 = variant === 'gold'
    ? (isNight ? '#6E531E' : '#E0A82E')
    : (isNight ? '#5E2820' : '#C84B31');
  const c2 = variant === 'gold'
    ? (isNight ? '#584218' : '#C98A22')
    : (isNight ? '#4A1F18' : '#A83824');

  const blobs = [
    { cx: -20, cy: -34, r: 26, c: c2 },
    { cx: 20, cy: -32, r: 25, c: c1 },
    { cx: 0, cy: -52, r: 30, c: c1 },
    { cx: 0, cy: -24, r: 24, c: c2 }
  ];
  for (const b of blobs) {
    ctx.fillStyle = b.c;
    ctx.beginPath();
    ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
    ctx.fill();
    strokeOutline(ctx, 3);
  }

  ctx.restore();
}

function drawCottage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  roofColor: string,
  wallColor = '#F5EDD8',
  trimColor = '#709255',
  label?: string,
  isNight = false
) {
  ctx.save();
  ctx.translate(x, y);

  // Ground shadow
  ctx.fillStyle = isNight ? 'rgba(6, 10, 22, 0.42)' : 'rgba(54, 38, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(8, h * 0.42, w * 0.62, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walls
  ctx.fillStyle = isNight ? '#B8B09C' : wallColor;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2 + 18, w, h - 18, 6);
  ctx.fill();
  strokeOutline(ctx, 3.5);

  // Plinth (podezdívka)
  ctx.fillStyle = isNight ? '#5C5449' : trimColor;
  ctx.beginPath();
  ctx.roundRect(-w / 2, h / 2 - 14, w, 14, [0, 0, 6, 6]);
  ctx.fill();
  strokeOutline(ctx, 3);

  // Door
  ctx.fillStyle = '#5E3A22';
  ctx.beginPath();
  ctx.roundRect(-14, h / 2 - 48, 28, 48, [12, 12, 0, 0]);
  ctx.fill();
  strokeOutline(ctx, 3);

  // Windows (glowing amber at night, warm blue-ochre by day)
  const winFill = isNight ? '#FFB838' : '#FCE8A6';
  for (const wx of [-w * 0.3, w * 0.3 - 22]) {
    if (isNight) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 184, 56, 0.25)';
      ctx.beginPath();
      ctx.arc(wx + 11, -4, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = winFill;
    ctx.beginPath();
    ctx.roundRect(wx, -16, 22, 24, 3);
    ctx.fill();
    strokeOutline(ctx, 2.5);
    ctx.beginPath();
    ctx.moveTo(wx + 11, -16);
    ctx.lineTo(wx + 11, 8);
    ctx.moveTo(wx, -4);
    ctx.lineTo(wx + 22, -4);
    strokeOutline(ctx, 2);
  }

  // Posvícení garland under the eaves (colorful ribbons & rowan berries)
  ctx.strokeStyle = '#3E5E2A';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-w * 0.45, -h / 2 + 22);
  ctx.quadraticCurveTo(0, -h / 2 + 34, w * 0.45, -h / 2 + 22);
  ctx.stroke();

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.58, -h / 2 + 22);
  ctx.lineTo(-w * 0.36, -h - 6);
  ctx.lineTo(w * 0.36, -h - 6);
  ctx.lineTo(w * 0.58, -h / 2 + 22);
  ctx.closePath();
  ctx.fill();
  strokeOutline(ctx, 3.8);

  // Chimney with warm smoke
  ctx.fillStyle = '#B84A32';
  ctx.beginPath();
  ctx.rect(w * 0.18, -h - 24, 18, 22);
  ctx.fill();
  strokeOutline(ctx, 2.8);

  if (label) {
    ctx.fillStyle = '#F7E7C4';
    ctx.beginPath();
    ctx.roundRect(-52, -h / 2 + 24, 104, 18, 4);
    ctx.fill();
    strokeOutline(ctx, 2);
    ctx.fillStyle = INK;
    ctx.font = 'bold 10px serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -h / 2 + 37);
  }

  ctx.restore();
}

export function drawZariDecoration(
  ctx: CanvasRenderingContext2D,
  itemOrType: { type: string; x?: number; y?: number; scale?: number } | string,
  timeOrX: number = 0,
  isNightOrY: boolean | number = false,
  maybeTime = 0,
  maybeIsNight = false
) {
  const isObj = typeof itemOrType === 'object' && itemOrType !== null;
  const type = isObj ? itemOrType.type : itemOrType;
  const x = isObj ? 0 : timeOrX;
  const y = isObj ? 0 : (typeof isNightOrY === 'number' ? isNightOrY : 0);
  const time = isObj ? timeOrX : maybeTime;
  const isNight = isObj ? Boolean(isNightOrY) : maybeIsNight;

  ctx.save();
  if (x !== 0 || y !== 0) {
    ctx.translate(x, y);
  }

  switch (type) {
    case 'zari_border': {
      // Early-autumn Hrusice backdrop: golden stubble, fallen plum leaves, gossamer threads (babí léto) by day,
      // and creeping silvery Svatováclavská mist by night.
      const patchCoords = [
        [-480, -420, 260, 140],
        [420, -380, 280, 150],
        [-380, 320, 290, 145],
        [360, 280, 250, 130],
        [0, 380, 320, 140]
      ];
      for (const [px, py, rx, ry] of patchCoords) {
        ctx.fillStyle = isNight
          ? 'rgba(32, 40, 58, 0.32)'
          : 'rgba(196, 154, 72, 0.24)';
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, 0.12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Winding village earthen paths dusted with golden birch & plum leaves
      ctx.strokeStyle = isNight ? '#3E352B' : '#C9AA74';
      ctx.lineWidth = 44;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-760, -580);
      ctx.quadraticCurveTo(-320, -280, 45, -95);
      ctx.quadraticCurveTo(360, 110, 650, 400);
      ctx.moveTo(45, -95);
      ctx.quadraticCurveTo(-310, 210, -680, 520);
      ctx.moveTo(45, -95);
      ctx.quadraticCurveTo(400, -340, 740, -580);
      ctx.stroke();

      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 16]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gossamer threads (babí léto) floating in the sun OR silvery night mist ribbons
      if (!isNight) {
        ctx.strokeStyle = 'rgba(255, 252, 240, 0.65)';
        ctx.lineWidth = 1.6;
        const gossamers = [
          [-340, -220], [180, -340], [-220, 180], [320, 140], [-520, -360], [520, -180]
        ];
        for (let i = 0; i < gossamers.length; i++) {
          const [gx, gy] = gossamers[i];
          const sway = Math.sin(time * 0.0015 + i) * 14;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + 35 + sway, gy - 12, gx + 72 + sway, gy + 6);
          ctx.stroke();
        }
      } else {
        // Svatováclavská noc: drifting low pond & meadow mist banks
        const mistBanks = [
          [-680, 500, 280, 90],
          [-260, 420, 240, 75],
          [480, 380, 250, 80],
          [-520, -480, 220, 70],
          [120, -240, 240, 75]
        ];
        for (let i = 0; i < mistBanks.length; i++) {
          const [mx, my, mrx, mry] = mistBanks[i];
          const drift = Math.sin(time * 0.001 + i * 1.4) * 24;
          ctx.fillStyle = 'rgba(186, 206, 232, 0.16)';
          ctx.beginPath();
          ctx.ellipse(mx + drift, my, mrx, mry, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Perimeter trees: plum orchards, golden birches, crimson maples
      const borderTrees: Array<[number, number, number, 'plum' | 'gold' | 'crimson']> = [
        [-1060, -820, 1.05, 'gold'],
        [-520, -880, 1.0, 'plum'],
        [-180, -890, 1.08, 'crimson'],
        [340, -880, 1.0, 'gold'],
        [980, -820, 1.1, 'plum'],
        [-1120, -260, 1.05, 'plum'],
        [-1120, 220, 1.0, 'gold'],
        [1100, -180, 1.05, 'crimson'],
        [1080, 220, 1.0, 'gold'],
        [-1020, 820, 1.08, 'gold'],
        [380, 860, 1.05, 'plum'],
        [960, 820, 1.05, 'crimson']
      ];
      for (const [tx, ty, sc, kind] of borderTrees) {
        if (kind === 'plum') {
          drawPlumTree(ctx, tx, ty, sc, false, isNight);
        } else {
          drawAutumnBirchOrMaple(ctx, tx, ty, sc, kind, isNight);
        }
      }
      break;
    }

    case 'zari_fields': {
      // Švestkový sad a strniště za vsí (-100, 680)
      // Golden-ochre orchard terrace & late stubble
      ctx.fillStyle = isNight ? '#2B3024' : '#C9A654';
      ctx.beginPath();
      ctx.ellipse(0, 0, 350, 190, -0.05, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Orchard rows of plum trees with ladders
      drawPlumTree(ctx, -210, -60, 1.05, true, isNight);
      drawPlumTree(ctx, -90, -85, 1.1, false, isNight);
      drawPlumTree(ctx, 65, -75, 1.05, true, isNight);
      drawPlumTree(ctx, 200, -45, 1.0, false, isNight);
      drawPlumTree(ctx, -155, 65, 0.95, false, isNight);
      drawPlumTree(ctx, 130, 65, 0.98, false, isNight);

      // Central wooden barrels & wicker baskets brimming with blue plums (solid obstacle at 0,0 -> -100, 680)
      const baskets = [
        { bx: -22, by: -6, r: 22 },
        { bx: 20, by: -4, r: 22 },
        { bx: 0, by: 18, r: 20 }
      ];
      for (const b of baskets) {
        // Wicker basket / tub
        ctx.fillStyle = '#9C6B3B';
        ctx.beginPath();
        ctx.roundRect(b.bx - b.r, b.by - 12, b.r * 2, 28, 6);
        ctx.fill();
        strokeOutline(ctx, 2.8);

        // Mound of blue plums inside basket
        ctx.fillStyle = '#4A2E7A';
        ctx.beginPath();
        ctx.ellipse(b.bx, b.by - 12, b.r - 2, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        strokeOutline(ctx, 2.2);
      }
      break;
    }

    case 'zari_church': {
      // Kostel sv. Václava (-800, -650)
      // Hilltop terrace
      ctx.fillStyle = isNight ? '#253028' : '#8FA352';
      ctx.beginPath();
      ctx.ellipse(0, 28, 195, 95, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Nave
      ctx.fillStyle = isNight ? '#C8C0AE' : '#F7EFE0';
      ctx.beginPath();
      ctx.roundRect(-82, -48, 132, 92, 6);
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Nave roof
      ctx.fillStyle = isNight ? '#7A3124' : '#C84B31';
      ctx.beginPath();
      ctx.moveTo(-94, -46);
      ctx.lineTo(-62, -104);
      ctx.lineTo(36, -104);
      ctx.lineTo(60, -46);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Bell tower
      ctx.fillStyle = isNight ? '#D2C9B8' : '#FAF3E6';
      ctx.beginPath();
      ctx.roundRect(18, -148, 64, 192, 5);
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Onion dome (báň)
      ctx.fillStyle = isNight ? '#38221B' : '#6E2B1F';
      ctx.beginPath();
      ctx.moveTo(10, -148);
      ctx.quadraticCurveTo(50, -218, 50, -228);
      ctx.quadraticCurveTo(50, -218, 90, -148);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Golden cross
      ctx.strokeStyle = '#F2C138';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(50, -228);
      ctx.lineTo(50, -254);
      ctx.moveTo(39, -243);
      ctx.lineTo(61, -243);
      ctx.stroke();
      strokeOutline(ctx, 1.6);

      // St. Wenceslas wreath on church portal
      ctx.strokeStyle = '#3B6E28';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(-20, -8, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#D93829';
      ctx.beginPath();
      ctx.arc(-20, 8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Stage 14 (Night) / Stage 13 (Day): Svatováclavský svatý oheň brazier in front of church
      const brazierX = -18;
      const brazierY = 66;
      if (isNight) {
        const pulse = 1 + Math.sin(time * 0.008) * 0.12;
        ctx.fillStyle = 'rgba(255, 168, 46, 0.26)';
        ctx.beginPath();
        ctx.arc(brazierX, brazierY - 12, 74 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      // Stone hearth ring
      ctx.fillStyle = '#6E6A63';
      ctx.beginPath();
      ctx.ellipse(brazierX, brazierY, 30, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3);

      // Sacred logs & flame
      ctx.fillStyle = isNight ? '#FF7A1C' : '#D96B27';
      ctx.beginPath();
      ctx.moveTo(brazierX - 18, brazierY - 2);
      ctx.quadraticCurveTo(brazierX - 6, brazierY - (isNight ? 46 : 24), brazierX, brazierY - (isNight ? 54 : 28));
      ctx.quadraticCurveTo(brazierX + 8, brazierY - (isNight ? 44 : 22), brazierX + 18, brazierY - 2);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 2.5);

      ctx.fillStyle = '#FFD94A';
      ctx.beginPath();
      ctx.moveTo(brazierX - 9, brazierY - 2);
      ctx.quadraticCurveTo(brazierX, brazierY - (isNight ? 34 : 18), brazierX + 9, brazierY - 2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'zari_village': {
      // Hrusická náves s kotlem na povidla (45, -95)
      // Surrounding cottages at exact ZARI_SPECIAL_OBSTACLES offsets relative to (45, -95):
      // Chalupa 1 (-120, -190) => offset (-165, -95)
      // Chalupa 2 (-95, 55) => offset (-140, 150)
      // Chalupa 3 (165, 85) => offset (120, 180)
      drawCottage(ctx, -165, -95, 134, 88, '#C84B31', '#F7EED7', '#6E8F4E', 'Č.P. 7', isNight);
      drawCottage(ctx, -140, 150, 128, 84, '#B85D28', '#F5E8C8', '#8C6239', 'Č.P. 12', isNight);
      drawCottage(ctx, 120, 180, 128, 84, '#A83E2B', '#F8F0DC', '#5A7D4C', 'Č.P. 19', isNight);

      // Posvícení cobblestone circle in the center of the green (0, 0 => world 45, -95)
      ctx.fillStyle = isNight ? '#4A433B' : '#CDB892';
      ctx.beginPath();
      ctx.ellipse(0, 8, 92, 56, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3);

      // Posvícení Maypole/Festive Ribbon Pole & Koláče Table on the side of the green
      ctx.fillStyle = '#8C5A2E';
      ctx.beginPath();
      ctx.roundRect(-78, -42, 48, 22, 4);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      // White tablecloth with posvícenské koláče
      ctx.fillStyle = '#FAF6EE';
      ctx.beginPath();
      ctx.roundRect(-76, -44, 44, 14, 3);
      ctx.fill();
      strokeOutline(ctx, 2);
      for (const kx of [-66, -54, -42]) {
        ctx.fillStyle = '#E09F3E';
        ctx.beginPath();
        ctx.arc(kx, -37, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3B1E47'; // povidla center
        ctx.beginPath();
        ctx.arc(kx, -37, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central Interactive Landmark: Měděný kotel na povidla (Copper Plum-Butter Cauldron) at (0, 0)
      // Brick furnace base (kotlina)
      ctx.fillStyle = '#A63A24';
      ctx.beginPath();
      ctx.ellipse(0, 16, 42, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Glowing fire under cauldron
      const flicker = Math.sin(time * 0.01) * 3;
      ctx.fillStyle = '#FF7B1C';
      ctx.beginPath();
      ctx.ellipse(0, 22, 20 + flicker * 0.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE052';
      ctx.beginPath();
      ctx.ellipse(0, 22, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Copper cauldron body
      ctx.fillStyle = '#C86D3B';
      ctx.beginPath();
      ctx.arc(0, -4, 38, 0, Math.PI, false);
      ctx.lineTo(-38, -14);
      ctx.lineTo(38, -14);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Cauldron rim & dark bubbling povidla
      ctx.fillStyle = '#D9824E';
      ctx.beginPath();
      ctx.ellipse(0, -14, 40, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      ctx.fillStyle = '#2E1538';
      ctx.beginPath();
      ctx.ellipse(0, -14, 33, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.2);

      // Bubbling plum jam blisters
      const b1 = Math.sin(time * 0.006) * 2 + 4;
      const b2 = Math.cos(time * 0.007) * 2 + 3.5;
      ctx.fillStyle = '#562969';
      ctx.beginPath();
      ctx.arc(-12, -15, b1, 0, Math.PI * 2);
      ctx.arc(10, -12, b2, 0, Math.PI * 2);
      ctx.arc(2, -17, 3, 0, Math.PI * 2);
      ctx.fill();

      // Long wooden stirring paddle (měchačka na povidla)
      const stirAngle = Math.sin(time * 0.0025) * 0.14;
      ctx.save();
      ctx.rotate(stirAngle);
      ctx.fillStyle = '#8C582B';
      ctx.beginPath();
      ctx.roundRect(-4, -58, 8, 48, 3);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      ctx.restore();
      break;
    }

    case 'zari_tavern': {
      // Hospoda U Sejků (285, -180)
      drawCottage(
        ctx,
        0,
        0,
        186,
        118,
        '#B8432A',
        '#F7EED8',
        '#5B7A44',
        'HOSPODA U SEJKŮ',
        isNight
      );
      // Posvícení wreath & pitcher sign
      ctx.fillStyle = '#E6B83A';
      ctx.beginPath();
      ctx.arc(68, -28, 12, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 2.5);
      break;
    }

    case 'zari_pond': {
      // Rybník u vrb (-750, 550) — offset to match water ellipse around (-725, 615)
      ctx.save();
      ctx.translate(25, 65);

      // Reed & muddy bank
      ctx.fillStyle = isNight ? '#2B3830' : '#7E8C4A';
      ctx.beginPath();
      ctx.ellipse(0, 0, 315, 192, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.8);

      // Autumn water surface
      ctx.fillStyle = isNight ? '#1E334A' : '#3E7A94';
      ctx.beginPath();
      ctx.ellipse(0, 0, 290, 170, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Floating golden willow leaves & water ripples
      ctx.strokeStyle = isNight ? 'rgba(170, 205, 240, 0.35)' : 'rgba(225, 244, 252, 0.55)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(-65, -25, 65, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(75, 30, 80, 24, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Golden willow tree on pond bank
      drawAutumnBirchOrMaple(ctx, -235, -95, 1.1, 'gold', isNight);
      drawAutumnBirchOrMaple(ctx, 225, -80, 1.0, 'gold', isNight);

      // Night mist swirling over the pond in Stage 14
      if (isNight) {
        const mistShift = Math.sin(time * 0.0015) * 18;
        ctx.fillStyle = 'rgba(195, 218, 242, 0.24)';
        ctx.beginPath();
        ctx.ellipse(mistShift, -10, 250, 95, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    case 'zari_mill': {
      // Starý mlýn u potoka (680, 420) + safe bridge at (475, 420) => offset (-205, 0)
      // Stream channel
      ctx.fillStyle = isNight ? '#1D334A' : '#3B7894';
      ctx.beginPath();
      ctx.moveTo(-380, -52);
      ctx.quadraticCurveTo(-120, -18, 210, 48);
      ctx.lineTo(210, 118);
      ctx.quadraticCurveTo(-120, 52, -380, 18);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Wooden footbridge at (-205, 0) -> world (475, 420)
      ctx.save();
      ctx.translate(-205, -8);
      ctx.fillStyle = '#8C5B30';
      ctx.beginPath();
      ctx.roundRect(-68, -36, 136, 72, 6);
      ctx.fill();
      strokeOutline(ctx, 3.5);
      for (let px = -52; px <= 52; px += 18) {
        ctx.beginPath();
        ctx.moveTo(px, -36);
        ctx.lineTo(px, 36);
        strokeOutline(ctx, 2);
      }
      ctx.restore();

      // Mill building at (0, 0) -> world (680, 420)
      drawCottage(ctx, 0, -10, 168, 108, '#9E3A26', '#F4E9D2', '#6B533B', 'MLÝN', isNight);

      // Rotating wooden waterwheel
      ctx.save();
      ctx.translate(-92, 18);
      ctx.rotate((time * 0.0012) % (Math.PI * 2));
      ctx.fillStyle = '#6E4423';
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 38, Math.sin(a) * 38);
        strokeOutline(ctx, 2.8);
      }
      ctx.restore();
      break;
    }

    case 'zari_forest': {
      // Temný les / Svatováclavský hvozd (780, -620)
      const forestTrees: Array<[number, number, number, 'plum' | 'gold' | 'crimson']> = [
        [-140, -90, 1.12, 'gold'],
        [40, -110, 1.18, 'crimson'],
        [155, -55, 1.08, 'gold'],
        [-170, 50, 1.05, 'plum'],
        [135, 85, 1.1, 'crimson']
      ];
      for (const [tx, ty, sc, kind] of forestTrees) {
        if (kind === 'plum') {
          drawPlumTree(ctx, tx, ty, sc, false, isNight);
        } else {
          drawAutumnBirchOrMaple(ctx, tx, ty, sc, kind, isNight);
        }
      }

      // Mossy forest boulder at (-50, 50) -> world (730, -570)
      ctx.fillStyle = isNight ? '#4A5058' : '#7C7A72';
      ctx.beginPath();
      ctx.ellipse(-50, 50, 42, 30, -0.1, 0, Math.PI * 2);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Autumn porcini mushrooms (hřiby praváky) near the boulder
      for (const [mx, my] of [[-88, 68], [-12, 74], [18, 62]]) {
        ctx.fillStyle = '#F2E5C9';
        ctx.beginPath();
        ctx.roundRect(mx - 4, my - 8, 8, 11, 3);
        ctx.fill();
        strokeOutline(ctx, 2);
        ctx.fillStyle = '#7A4322';
        ctx.beginPath();
        ctx.ellipse(mx, my - 9, 10, 6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        strokeOutline(ctx, 2);
      }
      break;
    }

    case 'zari_shrine': {
      // Kaplička na rozcestí (60, -680)
      ctx.fillStyle = isNight ? '#C8BFA8' : '#FAF0DC';
      ctx.beginPath();
      ctx.roundRect(-28, -46, 56, 68, 6);
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Terracotta cap
      ctx.fillStyle = '#C84B31';
      ctx.beginPath();
      ctx.moveTo(-36, -44);
      ctx.lineTo(0, -82);
      ctx.lineTo(36, -44);
      ctx.closePath();
      ctx.fill();
      strokeOutline(ctx, 3.5);

      // Niche with glowing candle
      ctx.fillStyle = '#2B211B';
      ctx.beginPath();
      ctx.roundRect(-12, -30, 24, 28, [10, 10, 2, 2]);
      ctx.fill();
      strokeOutline(ctx, 2.5);

      ctx.fillStyle = '#FFCC38';
      ctx.beginPath();
      ctx.arc(0, -16, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rowan berry (jeřabina) garland
      ctx.fillStyle = '#D93829';
      for (const rx of [-18, -8, 0, 8, 18]) {
        ctx.beginPath();
        ctx.arc(rx, -42, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'zari_school': {
      // Obecní škola (-600, -100)
      drawCottage(
        ctx,
        0,
        0,
        164,
        106,
        '#B83F28',
        '#F8F1DF',
        '#7A6548',
        'OBECNÍ ŠKOLA',
        isNight
      );
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

export function drawZariAutumnLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  time: number,
  isNight = false
) {
  drawZariDecoration(ctx, type, x, y, time, isNight);
}
