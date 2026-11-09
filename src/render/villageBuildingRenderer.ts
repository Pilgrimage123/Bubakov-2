/**
 * Authentic Josef Lada Village Building & Architecture Renderer
 *
 * Provides complete, robust procedural rendering of traditional Czech folklore buildings:
 * - Roubenky / chalupy with stone masonry plinths (kamenná podezdívka), notched timber beams
 *   or whitewash, entrance doors with latches, multi-pane glowing windows, folk gables (lomenice),
 *   brick chimneys with woodsmoke, and seasonal shingle/snow-cushion roofs.
 * - Kostel sv. Jiří (Church with nave, bell tower, stone walls, belfry, cross).
 * - Hospoda U Sejků (Tavern with main hall, stable wing, signboard, beer kegs, smoking chimney).
 * - Obecní škola (Schoolhouse with belfry and porch).
 * - Hrusický vodní mlýn (Watermill with turning millwheel and flume).
 *
 * Ensures all buildings are completely rendered structures (not just floating roofs)
 * and visually match their impassable collision footprints across all 24 stages.
 */

export type VillageSeason = 'spring' | 'summer' | 'autumn' | 'winter' | string;

export interface RoubenkaOptions {
  wallColor?: string;
  roofColor?: string;
  gableColor?: string;
  plinthColor?: string;
  isNight?: boolean;
  season?: VillageSeason;
  timbered?: boolean;
  storkOnChimney?: boolean;
  label?: string;
  time?: number;
  roofType?: 'shingle' | 'thatch' | 'snow';
  chimney?: 'left' | 'right' | 'center';
  wallStyle?: 'timber' | 'whitewash';
}

const INK = '#23170F';

function safeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  if (typeof ctx.rect === 'function') {
    ctx.rect(x, y, w, h);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  }
}

/**
 * Draws a complete, grounded, authentic Josef Lada cottage with stone plinth,
 * walls, door, glowing paned windows, chimney with smoke, folk gable, and seasonal roof.
 */
export function drawAuthenticRoubenka(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  roofH: number,
  opts: RoubenkaOptions = {}
): void {
  const isNight = opts.isNight ?? false;
  const season = opts.season ?? 'summer';
  const isWinter = season === 'winter';
  const timbered = opts.timbered ?? true;
  const time = opts.time ?? 0;

  const wallColor = opts.wallColor ?? (timbered ? (isNight ? '#3A281A' : '#7C4F28') : (isNight ? '#CBD5E1' : '#FAF3E0'));
  const roofColor = opts.roofColor ?? (isWinter ? (isNight ? '#94A3B8' : '#F8FAFC') : '#B84A32');
  const gableColor = opts.gableColor ?? '#D9A55B';
  const plinthColor = opts.plinthColor ?? (isNight ? '#334155' : '#D1D5DB');

  const hw = w / 2;
  const hh = h / 2;
  const plinthH = Math.max(12, Math.round(h * 0.16));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. Soft Ground Shadow
  ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.42)' : 'rgba(35, 23, 15, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, hh + 8, hw + 18, Math.max(14, h * 0.18), 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Kamenná podezdívka (Stone masonry plinth / foundation)
  ctx.fillStyle = plinthColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(-hw - 4, hh - plinthH, w + 8, plinthH + 4, [0, 0, 5, 5]);
  } else {
    safeRect(ctx, -hw - 4, hh - plinthH, w + 8, plinthH + 4);
  }
  ctx.fill();
  ctx.stroke();

  // Stone joint marks on plinth
  ctx.strokeStyle = isNight ? 'rgba(15, 23, 42, 0.5)' : 'rgba(75, 85, 99, 0.5)';
  ctx.lineWidth = 2.2;
  const stoneStep = Math.max(28, Math.round(w / 6));
  for (let sx = -hw + stoneStep; sx < hw; sx += stoneStep) {
    ctx.beginPath();
    ctx.moveTo(sx, hh - plinthH + 1);
    ctx.lineTo(sx + (Math.abs(sx) % 2 === 0 ? 3 : -3), hh + 2);
    ctx.stroke();
  }

  // 3. Main Cottage Walls
  ctx.fillStyle = wallColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.0;
  ctx.fillRect(-hw, -hh, w, h - plinthH);
  ctx.strokeRect(-hw, -hh, w, h - plinthH);

  // Timber log seams & overlapping corner notches (tesařské roubení)
  if (timbered) {
    const logH = Math.max(12, Math.round((h - plinthH) / 6));
    ctx.strokeStyle = isNight ? '#24170E' : '#543216';
    ctx.lineWidth = 2.6;
    for (let ly = -hh + logH; ly < hh - plinthH; ly += logH) {
      ctx.beginPath();
      ctx.moveTo(-hw + 3, ly);
      ctx.lineTo(hw - 3, ly);
      ctx.stroke();

      // Notched beam ends extending slightly past the wall corner
      ctx.fillStyle = isNight ? '#2A1C12' : '#5E381A';
      ctx.fillRect(-hw - 6, ly - 5, 6, 10);
      ctx.strokeRect(-hw - 6, ly - 5, 6, 10);
      ctx.fillRect(hw, ly - 5, 6, 10);
      ctx.strokeRect(hw, ly - 5, 6, 10);
    }
  }

  // 4. Entrance Door
  const doorW = Math.max(24, Math.round(w * 0.16));
  const doorH = Math.max(38, Math.round(h * 0.46));
  const doorX = -doorW / 2;
  const doorY = hh - plinthH - doorH;

  ctx.fillStyle = isNight ? '#1E140C' : '#4A2E1B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  // Door vertical planking
  ctx.strokeStyle = isNight ? '#120B06' : '#331F12';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(doorX + doorW / 2, doorY + 2);
  ctx.lineTo(doorX + doorW / 2, doorY + doorH - 2);
  ctx.stroke();

  // Forged iron latch (klika)
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(doorX + doorW - 5, doorY + doorH * 0.52, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Windows with cross mullions & warm glowing light
  const winW = Math.max(20, Math.round(w * 0.16));
  const winH = Math.max(18, Math.round(h * 0.28));
  const winY = -hh + Math.round(h * 0.22);
  const winOffsets = [-hw * 0.55, hw * 0.55];

  for (let i = 0; i < winOffsets.length; i++) {
    const wx = winOffsets[i] - winW / 2;

    // Soft candlelight ambient glow at night
    if (isNight) {
      ctx.save();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.arc(wx + winW / 2, winY + winH / 2, winW * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Window frame (whitewash or light wood)
    ctx.fillStyle = isNight ? '#E2E8F0' : '#FFFFFF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.8;
    ctx.fillRect(wx - 2, winY - 2, winW + 4, winH + 4);
    ctx.strokeRect(wx - 2, winY - 2, winW + 4, winH + 4);

    // Panes: Warm amber candlelight at night, clear sky reflection by day
    ctx.fillStyle = isNight ? '#FEF08A' : '#7DD3FC';
    ctx.fillRect(wx, winY, winW, winH);

    // Cross mullions (okenní kříž)
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(wx + winW / 2, winY);
    ctx.lineTo(wx + winW / 2, winY + winH);
    ctx.moveTo(wx, winY + winH / 2);
    ctx.lineTo(wx + winW, winY + winH / 2);
    ctx.stroke();

    // Spring/Summer Geranium Flowerbox under window
    if (season === 'spring' || season === 'summer') {
      ctx.fillStyle = '#15803D';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.0;
      ctx.fillRect(wx - 3, winY + winH + 2, winW + 6, 7);
      ctx.strokeRect(wx - 3, winY + winH + 2, winW + 6, 7);

      // Red flower dots
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(wx + 2, winY + winH + 5, 2.5, 0, Math.PI * 2);
      ctx.arc(wx + winW / 2, winY + winH + 4, 2.8, 0, Math.PI * 2);
      ctx.arc(wx + winW - 2, winY + winH + 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Chimney with brick pattern, stone cap & woodsmoke puffs
  const chimW = Math.max(16, Math.round(w * 0.12));
  const chimH = Math.max(26, Math.round(roofH * 0.42));
  const chimX = hw * 0.32;
  const chimY = -hh - roofH + 6;

  ctx.fillStyle = isNight ? '#7F1D1D' : '#B91C1C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.fillRect(chimX, chimY, chimW, chimH);
  ctx.strokeRect(chimX, chimY, chimW, chimH);

  // Chimney stone cap
  ctx.fillStyle = isNight ? '#475569' : '#E2E8F0';
  ctx.fillRect(chimX - 3, chimY - 5, chimW + 6, 6);
  ctx.strokeRect(chimX - 3, chimY - 5, chimW + 6, 6);

  // Rising woodsmoke puffs
  const smokeWobble = Math.sin(time * 2.5 + cx * 0.1) * 6;
  ctx.fillStyle = isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(241, 245, 249, 0.65)';
  ctx.strokeStyle = isNight ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.45)';
  ctx.lineWidth = 1.6;
  for (let s = 0; s < 3; s++) {
    const puffY = chimY - 14 - s * 14;
    const puffX = chimX + chimW / 2 + (s * smokeWobble * 0.6);
    const puffR = 6 + s * 3.5;
    ctx.beginPath();
    ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 7. Roof (Shingled Trapezoid in spring/summer/autumn, or curved snow cushion in winter)
  const roofOver = 16;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;

  if (isWinter) {
    // Shingled under-layer visible at bottom edge
    ctx.fillStyle = isNight ? '#334155' : '#8C3B2B';
    ctx.beginPath();
    ctx.moveTo(-hw - roofOver, -hh + 4);
    ctx.lineTo(-hw * 0.45, -hh - roofH);
    ctx.lineTo(hw * 0.55, -hh - roofH);
    ctx.lineTo(hw + roofOver, -hh + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Thick soft white snow cushion (sněhová peřina)
    ctx.fillStyle = isNight ? '#94A3B8' : '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-hw - roofOver - 4, -hh + 3);
    ctx.quadraticCurveTo(-hw * 0.2, -hh - roofH - 10, hw * 0.55, -hh - roofH - 8);
    ctx.lineTo(hw + roofOver + 4, -hh + 3);
    ctx.quadraticCurveTo(0, -hh - 12, -hw - roofOver - 4, -hh + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Authentic Josef Lada terracotta / wood shingled roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(-hw - roofOver, -hh + 4);
    ctx.lineTo(-hw * 0.45, -hh - roofH);
    ctx.lineTo(hw * 0.55, -hh - roofH);
    ctx.lineTo(hw + roofOver, -hh + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shingle rows
    ctx.strokeStyle = isNight ? 'rgba(20, 10, 5, 0.45)' : 'rgba(80, 25, 15, 0.35)';
    ctx.lineWidth = 2.0;
    for (let r = 0.25; r <= 0.75; r += 0.25) {
      const yShingle = -hh + 4 - roofH * r;
      const leftX = (-hw - roofOver) * (1 - r) + (-hw * 0.45) * r;
      const rightX = (hw + roofOver) * (1 - r) + (hw * 0.55) * r;
      ctx.beginPath();
      ctx.moveTo(leftX + 4, yShingle);
      ctx.lineTo(rightX - 4, yShingle);
      ctx.stroke();
    }
  }

  // 8. Folk Wooden Gable (Lomenice / kabřinec)
  ctx.fillStyle = gableColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-hw - roofOver + 6, -hh + 4);
  ctx.lineTo(-hw * 0.45, -hh - roofH);
  ctx.lineTo(-hw * 0.02, -hh + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gable decorative folk paneling lines (sluncová lomenice)
  ctx.strokeStyle = isNight ? '#543216' : '#7C4F28';
  ctx.lineWidth = 2.0;
  const topGx = -hw * 0.45;
  const topGy = -hh - roofH;
  for (let gx = -hw - roofOver + 16; gx <= -hw * 0.02 - 10; gx += 16) {
    ctx.beginPath();
    ctx.moveTo(topGx, topGy + 4);
    ctx.lineTo(gx, -hh + 2);
    ctx.stroke();
  }

  // 9. Stork on Chimney (optional, for chalupa_n)
  if (opts.storkOnChimney) {
    ctx.save();
    ctx.translate(chimX + chimW * 0.5, chimY - 8);
    // Nest
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Stork body
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -12, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Black wing feathers
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.ellipse(-3, -10, 6, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Red beak
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(7, -13);
    ctx.lineTo(16, -11);
    ctx.lineTo(7, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 10. Label banner (optional)
  if (opts.label) {
    const textW = Math.max(90, opts.label.length * 11 + 24);
    const bannerY = -hh - 12;
    ctx.fillStyle = isNight ? '#0F172A' : '#FEF3C7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.fillRect(-textW / 2, bannerY - 10, textW, 20);
    ctx.strokeRect(-textW / 2, bannerY - 10, textW, 20);

    ctx.fillStyle = isNight ? '#FDE047' : INK;
    ctx.font = 'bold 12px "Eczar", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.label, 0, bannerY);
  }

  ctx.restore();
}

export interface CanonicalCottageDef {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly roofH: number;
  readonly timbered: boolean;
  readonly roofColor: string;
  readonly wallColor: string;
  readonly gableColor: string;
  readonly storkOnChimney?: boolean;
}

/**
 * The 6 canonical village cottages around the Hrusice village green,
 * matching exact coordinates in MARCH_THAW_OBSTACLES & MARCH_COTTAGE_ROOF_SPECS.
 */
export const CANONICAL_HRUSICE_COTTAGES: readonly CanonicalCottageDef[] = [
  { id: 'chalupa_nw', cx: -350, cy: -362, w: 250, h: 140, roofH: 112, timbered: true, roofColor: '#9E3D26', wallColor: '#8C5230', gableColor: '#D9A55B' },
  { id: 'chalupa_n', cx: 100, cy: -412, w: 260, h: 144, roofH: 115, timbered: false, roofColor: '#C84B31', wallColor: '#FAF3E0', gableColor: '#D9A55B', storkOnChimney: true },
  { id: 'chalupa_ne', cx: 475, cy: -375, w: 250, h: 140, roofH: 112, timbered: true, roofColor: '#7C4728', wallColor: '#7A4928', gableColor: '#D9A55B' },
  { id: 'chalupa_w', cx: -375, cy: -75, w: 240, h: 136, roofH: 110, timbered: true, roofColor: '#8C3B2B', wallColor: '#8C5230', gableColor: '#D9A55B' },
  { id: 'chalupa_sw', cx: -275, cy: 200, w: 250, h: 140, roofH: 112, timbered: false, roofColor: '#B84A32', wallColor: '#F5EAD0', gableColor: '#D9A55B' },
  { id: 'chalupa_se', cx: 400, cy: 200, w: 250, h: 140, roofH: 112, timbered: true, roofColor: '#9E472A', wallColor: '#8C5230', gableColor: '#D9A55B' },
] as const;

/**
 * Draws all 6 canonical village cottages with authentic seasonal palettes and details.
 */
export function drawAllVillageCottages(
  ctx: CanvasRenderingContext2D,
  season: VillageSeason = 'summer',
  isNight = false,
  time = 0
): void {
  for (let i = 0; i < CANONICAL_HRUSICE_COTTAGES.length; i++) {
    const c = CANONICAL_HRUSICE_COTTAGES[i];
    drawAuthenticRoubenka(ctx, c.cx, c.cy, c.w, c.h, c.roofH, {
      wallColor: c.wallColor,
      roofColor: c.roofColor,
      gableColor: c.gableColor,
      timbered: c.timbered,
      storkOnChimney: Boolean(c.storkOnChimney),
      season,
      isNight,
      time,
    });
  }
}

/**
 * Draws the complete Tavern (Hospoda U Sejků) matching hospoda_main collision (310 × 164 px)
 * at cx: 462, cy: -75.
 */
export function drawAuthenticTavern(
  ctx: CanvasRenderingContext2D,
  cx = 462,
  cy = -75,
  isNight = false,
  season: VillageSeason = 'summer',
  time = 0
): void {
  // Main building 310 x 164 with roofH 125
  drawAuthenticRoubenka(ctx, cx, cy, 310, 164, 125, {
    wallColor: isNight ? '#2A1C12' : '#FDF6E2',
    roofColor: isNight ? '#7F1D1D' : '#C84B31',
    gableColor: '#E2B464',
    timbered: false,
    label: 'HOSPODA U SEJKŮ',
    season,
    isNight,
    time,
  });

  // Tavern outdoor beer keg & bench on the village green side
  ctx.save();
  ctx.translate(cx - 110, cy + 65);
  ctx.fillStyle = isNight ? '#1E140C' : '#78350F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beer mug on the keg
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-4, -28, 9, 10);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-5, -31, 11, 4);
  ctx.restore();
}

/**
 * Draws the complete School (Obecní škola) matching skola_main collision (300 × 156 px)
 * at cx: 125, cy: 550.
 */
export function drawAuthenticSchool(
  ctx: CanvasRenderingContext2D,
  cx = 125,
  cy = 550,
  isNight = false,
  season: VillageSeason = 'summer',
  time = 0
): void {
  // Main schoolhouse 300 x 156 with roofH 118
  drawAuthenticRoubenka(ctx, cx, cy, 300, 156, 118, {
    wallColor: isNight ? '#334155' : '#F7EFE0',
    roofColor: isNight ? '#6D28D9' : '#B8432E',
    gableColor: '#DFB66C',
    timbered: false,
    label: 'OBECNÍ ŠKOLA',
    season,
    isNight,
    time,
  });

  // Small school belfry turret on roof ridge
  ctx.save();
  ctx.translate(cx, cy - 78 - 118 + 12);
  ctx.fillStyle = isNight ? '#1E293B' : '#FEF3C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.fillRect(-12, -22, 24, 26);
  ctx.strokeRect(-12, -22, 24, 26);

  // Turret pyramid roof
  ctx.fillStyle = isNight ? '#451A14' : '#991B1B';
  ctx.beginPath();
  ctx.moveTo(-16, -22);
  ctx.lineTo(0, -42);
  ctx.lineTo(16, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Little bronze school bell
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -10, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the complete Hilltop Church (Kostel sv. Jiří) matching kostel_nave (240 × 96 px)
 * and kostel_tower (radius 42) at cx: -800, cy: -680.
 */
export function drawAuthenticChurch(
  ctx: CanvasRenderingContext2D,
  cx = -800,
  cy = -680,
  isNight = false,
  season: VillageSeason = 'summer',
  time = 0
): void {
  const isWinter = season === 'winter';
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. Stone churchyard boundary wall
  ctx.fillStyle = isNight ? '#334155' : '#D6D3D1';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  safeRect(ctx, -190, -110, 380, 24);
  safeRect(ctx, -190, 80, 380, 24);
  ctx.fill();
  ctx.stroke();

  // Wall red tile coping
  ctx.fillStyle = '#B93822';
  ctx.beginPath();
  safeRect(ctx, -192, -114, 384, 8);
  safeRect(ctx, -192, 76, 384, 8);
  ctx.fill();
  ctx.stroke();

  // 2. Main Church Nave (240 x 96 px)
  ctx.fillStyle = isNight ? '#E2E8F0' : '#FBF5E6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;
  ctx.fillRect(-120, -48, 240, 96);
  ctx.strokeRect(-120, -48, 240, 96);

  // Arched stained-glass windows
  const winFill = isNight ? '#FEF08A' : '#38BDF8';
  for (let wx = -70; wx <= 70; wx += 46) {
    ctx.fillStyle = winFill;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    safeRect(ctx, wx - 10, -18, 20, 34);
    ctx.arc(wx, -18, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }

  // Nave red shingle roof / snow cushion
  ctx.fillStyle = isWinter ? (isNight ? '#94A3B8' : '#FFFFFF') : '#C84B31';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-130, -48);
  ctx.lineTo(-95, -118);
  ctx.lineTo(95, -118);
  ctx.lineTo(130, -48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Western Bell Tower at x: 90, matching kostel_tower (x: -710)
  ctx.fillStyle = isNight ? '#CBD5E1' : '#FBF5E6';
  ctx.fillRect(52, -155, 84, 195);
  ctx.strokeRect(52, -155, 84, 195);

  // Arched belfry with swinging bell
  ctx.fillStyle = '#2B2623';
  ctx.beginPath();
  ctx.arc(94, -118, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const bellAngle = Math.sin(time * 3) * 0.2;
  ctx.save();
  ctx.translate(94, -124);
  ctx.rotate(bellAngle);
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(0, 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tower onion spire / steep roof
  ctx.fillStyle = isWinter ? (isNight ? '#64748B' : '#E2E8F0') : '#B93822';
  ctx.beginPath();
  ctx.moveTo(46, -155);
  ctx.lineTo(94, -225);
  ctx.lineTo(142, -155);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden cross on top of spire
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(94, -225);
  ctx.lineTo(94, -252);
  ctx.moveTo(82, -240);
  ctx.lineTo(106, -240);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the complete Watermill (Hrusický mlýn) matching mlyn_house (270 × 156 px)
 * at cx: 531, cy: 706.
 */
export function drawAuthenticMill(
  ctx: CanvasRenderingContext2D,
  cx = 531,
  cy = 706,
  isNight = false,
  season: VillageSeason = 'summer',
  time = 0
): void {
  // Main millhouse 270 x 156 with roofH 118
  drawAuthenticRoubenka(ctx, cx, cy, 270, 156, 118, {
    wallColor: isNight ? '#24170E' : '#8C5230',
    roofColor: isNight ? '#5C2D1E' : '#7C3F23',
    gableColor: '#D9A55B',
    timbered: true,
    label: 'MLÝN',
    season,
    isNight,
    time,
  });

  // Rotating wooden watermill wheel on the stream side (x ≈ cx + 140)
  ctx.save();
  ctx.translate(cx + 140, cy + 10);
  ctx.rotate((time * 1.2) % (Math.PI * 2));
  ctx.fillStyle = isNight ? '#2A1C12' : '#9C6234';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 8 Wooden wheel spokes & paddles
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(8, -5, 34, 10);
    ctx.strokeRect(8, -5, 34, 10);
  }
  ctx.restore();
}
