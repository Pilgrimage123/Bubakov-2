import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  drawFolkFlower2D,
  drawWaterDroplet2D,
  drawRealisticDripCycle2D,
  drawFlatGouacheSmokeLobe,
  drawFuriantSteamPuffs,
  drawFoamingBeerMug2D,
  drawHopCone2D,
  drawMusicNote2D,
  drawStrawBundle2D,
  safeRoundRect,
} from './hospodaBossHelpers';

// ---------------------------------------------------------------------------
// 1. PŮLNOČNÍ HEJKAL (Komicky vzteklý lesní hejkal ze smrkového hvozdu)
// ---------------------------------------------------------------------------
export function drawHospodaHejkal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.45;
  const rustle = Math.sin(time * 8.5) * 3.5;
  const howlJaw = s.isAttacking ? (s.isStrike ? 14 : 10) : s.isPanicked ? 12 : 5;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.1);
  }

  // 1. Forest Moss Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Bark & Root Legs (Svalnaté křivé pařezové nohy)
  ctx.fillStyle = '#3E2723';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Stride animation
  const leg1Y = 8 + s.stride * 4;
  const leg2Y = 8 - s.stride * 4;

  ctx.beginPath();
  ctx.moveTo(-11, 6);
  ctx.lineTo(-13, 24 + leg1Y * 0.2);
  ctx.lineTo(-6, 25 + leg1Y * 0.2);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.lineTo(6, 25 + leg2Y * 0.2);
  ctx.lineTo(13, 24 + leg2Y * 0.2);
  ctx.lineTo(11, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Root claws on feet
  ctx.fillStyle = '#1C1917';
  for (const side of [-1, 1]) {
    const fx = side === -1 ? -12 : 7;
    const fy = 24 + (side === -1 ? leg1Y : leg2Y) * 0.2;
    ctx.beginPath();
    ctx.rect(fx, fy, 8, 3.5);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Shaggy Moss-Coat Torso (Tělo z mechu, lišejníků a smrkového chvojí)
  ctx.fillStyle = '#2E4C23';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Overlapping layers of spruce needles & lichen scales
  const spruceScales = [
    [-11, -8, '#166534'],
    [0, -10, '#15803D'],
    [10, -7, '#166534'],
    [-14, 2, '#365314'],
    [-4, 4, '#4D7C0F'],
    [6, 3, '#3F6212'],
    [13, 1, '#365314'],
    [-8, 12, '#14532D'],
    [4, 13, '#166534'],
  ];

  ctx.lineWidth = 1.8;
  for (const [mx, my, col] of spruceScales) {
    ctx.fillStyle = col as string;
    ctx.beginPath();
    ctx.ellipse(mx as number, (my as number) + rustle * 0.15, 6.5, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Birch bark vest patches with black cross stitches
  ctx.fillStyle = '#F5F5F4';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, -7, -4, 14, 15, 2.5);
  ctx.fill();
  ctx.stroke();

  // Birch bark black lenticels
  ctx.fillStyle = HOSPODA_INK;
  ctx.fillRect(-5, -1, 3.5, 1.2);
  ctx.fillRect(1, 2, 4.0, 1.2);
  ctx.fillRect(-4, 6, 4.5, 1.2);

  // Pinecone buttons on vest
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
  ctx.arc(0, 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Arms & Giant Knotted Spruce Club (Sukovitý smrkový kyj)
  const clubSwing = s.isStrike
    ? 0.9 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.75 * s.windupProgress
    : Math.sin(time * 5) * 0.22;

  // Left arm waving furiously
  ctx.fillStyle = '#3E2723';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.quadraticCurveTo(-26, -12 - rustle, -24, -20 - rustle);
  ctx.quadraticCurveTo(-18, -16, -12, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right arm wielding the giant knotted pine club
  ctx.save();
  ctx.translate(14, -4);
  ctx.rotate(clubSwing);

  // Arm
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, 4, 16, 2);
  ctx.lineTo(14, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Knotted pine club
  ctx.fillStyle = '#713F12';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(12, 10);
  ctx.lineTo(18, -32);
  ctx.quadraticCurveTo(24, -38, 30, -30);
  ctx.lineTo(20, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pine branch knobs on club
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.arc(22, -26, 4.5, 0, Math.PI * 2);
  ctx.arc(17, -14, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Green pine sprig stuck in club top
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(25, -34);
  ctx.lineTo(29, -42);
  ctx.moveTo(27, -37);
  ctx.lineTo(33, -39);
  ctx.stroke();

  ctx.restore();

  // 5. Head: Wild Bushy Foliage, Roaring Howling Mouth & Big Yellow Eyes
  ctx.save();
  ctx.translate(0, -18);

  // Wild spiky spruce foliage hair framing head
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;

  const foliageSpikes = [
    [-15, -6, -24, -14, -14, -18],
    [-12, -18, -18, -28, -6, -24],
    [-5, -24, 0, -34, 5, -24],
    [6, -24, 18, -28, 12, -18],
    [14, -18, 24, -14, 15, -6],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of foliageSpikes) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Bark Face
  ctx.fillStyle = '#5A3825';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mossy bushy eyebrows
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-5, -6 + s.browLift, 6, 3, -0.2, 0, Math.PI * 2);
  ctx.ellipse(5, -6 + s.browLift, 6, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Huge wide-popping yellow eyes (Kukadla)
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-5, -3, 4.2, 0, Math.PI * 2);
  ctx.arc(5, -3, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black pupils with white highlight dots
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-5 + s.pupilShiftX * 0.8, -3 + s.pupilShiftY * 0.6, 2.0, 0, Math.PI * 2);
  ctx.arc(5 + s.pupilShiftX * 0.8, -3 + s.pupilShiftY * 0.6, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-6, -4, 0.9, 0, Math.PI * 2);
  ctx.arc(4, -4, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Knotted wooden nose
  ctx.fillStyle = '#3E2723';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 1, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gaping roaring howling mouth (Hejkalovský ryk)
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 6, 7.5, howlJaw * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pink tongue & wooden cartoon teeth
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, 6 + howlJaw * 0.25, 4.0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(-4, 6 - howlJaw * 0.45, 2.8, 3.0);
  ctx.fillRect(1.2, 6 - howlJaw * 0.45, 2.8, 3.0);

  // Bushy moss mustache/beard
  ctx.fillStyle = '#4D7C0F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-9, 5);
  ctx.quadraticCurveTo(-14, 16, 0, 15);
  ctx.quadraticCurveTo(14, 16, 9, 5);
  ctx.quadraticCurveTo(0, 9, -9, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-8, 2, 2.8, 0, Math.PI * 2);
  ctx.arc(8, 2, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Furiant steam puffs rising when howling or enraged
  if (s.isAttacking || s.isEnraged) {
    drawFuriantSteamPuffs(ctx, 0, -20, time, s.isEnraged ? 1.4 : 0.9);
  }

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. ČERTOVSKÝ MLYNÁŘ (Rozšafný pomoučněný mlynář s ocasem a mlýnským kolem)
// ---------------------------------------------------------------------------
export function drawHospodaMlynar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  isEnraged: boolean = false,
  attackInfo?: EnemyAttackInfo,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const enraged = isEnraged || s.isEnraged;
  const scale = 2.4;
  const wheelAngle = time * (panicked ? -4.5 : enraged ? 6.5 : 2.8);
  const flourPuff = Math.sin(time * 6) * 2;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  }

  // 1. Water mill race puddle with water wheel spray
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawRealisticDripCycle2D(ctx, -14, 24, 20, time, 1.2, 0.2, 2.0);
  ctx.restore();

  // 2. Wooden Mill Wheel on back (Mlýnské kolo na zádech s kapkami vody)
  ctx.save();
  ctx.translate(-16, -2);
  ctx.rotate(wheelAngle);

  // Outer wooden wheel rim
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();

  // Iron rim band
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Wooden spokes & water paddles (lopatky)
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang) * 22, Math.sin(ang) * 22);
    ctx.stroke();

    // Paddle blade on end
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * 22, Math.sin(ang) * 22, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wheel center axle hub
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 3. Devil Tail Peeking Out from Miller's Apron (Čertovský ocas s bodcem)
  const tailSway = Math.sin(time * 6) * 12;
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.quadraticCurveTo(-26, 16 + tailSway, -32, 8 + tailSway * 0.8);
  ctx.stroke();

  // Tail barb (čertovský bodec)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-32, 8 + tailSway * 0.8 - 6);
  ctx.lineTo(-38, 8 + tailSway * 0.8);
  ctx.lineTo(-32, 8 + tailSway * 0.8 + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Sturdy Miller Legs & Dusty Boots
  ctx.fillStyle = '#44403C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  const legStride = s.stride * 5;
  ctx.beginPath();
  ctx.rect(-12, 12 + legStride * 0.5, 8, 14);
  ctx.rect(4, 12 - legStride * 0.5, 8, 14);
  ctx.fill();
  ctx.stroke();

  // Flour dusted boot toes
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.ellipse(-8, 25 + legStride * 0.5, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(8, 25 - legStride * 0.5, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Rotund Flour-Dusted Body & Folk Waistcoat (Plný mlynářský pupek a vestička)
  ctx.fillStyle = '#F5F5F4';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bright blue waistcoat (modrá mlynářská vesta)
  ctx.fillStyle = '#1D4ED8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-12, -10);
  ctx.lineTo(-16, 8);
  ctx.lineTo(16, 8);
  ctx.lineTo(12, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold waistcoat buttons
  ctx.fillStyle = '#F59E0B';
  for (let b = -6; b <= 6; b += 5) {
    ctx.beginPath();
    ctx.arc(0, b, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // White floury baker's apron with flour smudges (Pomoučněná zástěra)
  ctx.fillStyle = '#F3F4F6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -10, -2, 20, 16, 2.5);
  ctx.fill();
  ctx.stroke();

  // Flour dust smudges on apron
  ctx.fillStyle = '#E5E7EB';
  ctx.beginPath();
  ctx.arc(-4, 4, 3.5, 0, Math.PI * 2);
  ctx.arc(4, 7, 4.0, 0, Math.PI * 2);
  ctx.arc(0, 10, 3.0, 0, Math.PI * 2);
  ctx.fill();

  // 6. Arms & Wooden Flour Scoop / Shovel (Moučná sázecí lopata)
  const paddleSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.4)
    : s.isWindup
    ? -0.8 * s.windupProgress
    : Math.sin(time * 5.5) * 0.25;

  ctx.save();
  ctx.translate(12, -2);
  ctx.rotate(paddleSwing);

  // Arm in white linen rolled-up sleeve
  ctx.fillStyle = '#F9FAFB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-3, -3, 16, 6);
  ctx.fill();
  ctx.stroke();

  // Long wooden flour shovel / scoop (sázecí lopata s bílou moukou)
  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.fillRect(10, -2, 28, 4);
  ctx.strokeRect(10, -2, 28, 4);

  // Wide flat paddle blade
  ctx.fillStyle = '#CA8A04';
  ctx.beginPath();
  safeRoundRect(ctx, 36, -8, 14, 16, 3);
  ctx.fill();
  ctx.stroke();

  // Mound of fresh white flour on shovel
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(43, -4, 5.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 7. Jolly/Furious Face, Smoking Pipe & Flour-Dusted Cap with Devil Horn
  ctx.save();
  ctx.translate(0, -18);

  // Round fleshy face
  ctx.fillStyle = enraged ? '#FCA5A5' : '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy miller cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.arc(-6, 2, 3.5, 0, Math.PI * 2);
  ctx.arc(6, 2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // White flour smudge across one cheek
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 3.2, 1.8, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful/Angry Eyes
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-4 + s.pupilShiftX * 0.7, -3, 2.0, 0, Math.PI * 2);
  ctx.arc(4 + s.pupilShiftX * 0.7, -3, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Broad bushy brown mustache
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-9, 3);
  ctx.quadraticCurveTo(-14, 8, -4, 7);
  ctx.quadraticCurveTo(0, 4, 4, 7);
  ctx.quadraticCurveTo(14, 8, 9, 3);
  ctx.quadraticCurveTo(0, 1, -9, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Big bulbous red potato nose
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 1, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Clay tobacco pipe in mouth (Hliněná fajfka s obláčkem)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(16, 7);
  ctx.lineTo(18, 3);
  ctx.lineTo(15, 3);
  ctx.lineTo(13, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gouache smoke puff from pipe
  drawFlatGouacheSmokeLobe(ctx, 20, 0 + flourPuff * 0.4, 4.0);

  // White Miller's Nightcap with Tassel & Devil's Horn (Mlynářská čapka s rohem)
  ctx.fillStyle = '#F3F4F6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-12, -7);
  ctx.quadraticCurveTo(-16, -24, 0, -22);
  ctx.quadraticCurveTo(16, -18, 12, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Drooping cap tail with fluffy pompon
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.quadraticCurveTo(16, -26, 20, -18);
  ctx.quadraticCurveTo(16, -14, 10, -16);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(21, -17, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sharp black devil horn bursting through the white cap!
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-4, -18);
  ctx.quadraticCurveTo(-14, -30, -8, -34);
  ctx.quadraticCurveTo(-2, -26, 2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. BEZHLAVÝ RYTÍŘ (Furiantský rytíř připíjející si s vlastní helmou)
// ---------------------------------------------------------------------------
export function drawHospodaBezhlavyRytir(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  isEnraged: boolean = false,
  attackInfo?: EnemyAttackInfo,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.45;
  const capeFlutter = Math.sin(time * 6.5) * 6;
  const helmetBlink = (time * 1.5) % 4 > 3.8;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Ghostly Night Tavern Shadow
  ctx.save();
  ctx.fillStyle = isEnraged ? 'rgba(239, 68, 68, 0.28)' : 'rgba(30, 41, 59, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Billowing Tattered Red Velvet Cape (Vlající červený plášť)
  ctx.fillStyle = isEnraged ? '#B91C1C' : '#991B1B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-12, -12);
  ctx.quadraticCurveTo(-28 + capeFlutter, 4, -34 + capeFlutter * 1.2, 24);
  ctx.lineTo(-24 + capeFlutter, 28);
  ctx.quadraticCurveTo(-16, 12, -4, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Plate Greaves & Iron Sabatons (Plechové škorně a plátové nohy)
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  const legStep = s.stride * 4;
  ctx.beginPath();
  ctx.rect(-12, 10 + legStep * 0.5, 8, 14);
  ctx.rect(4, 10 - legStep * 0.5, 8, 14);
  ctx.fill();
  ctx.stroke();

  // Iron knee cops (nákoleníky)
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(-8, 10 + legStep * 0.5, 4.5, 0, Math.PI * 2);
  ctx.arc(8, 10 - legStep * 0.5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Riveted shoe sabatons
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.rect(-14, 24 + legStep * 0.5, 11, 4.5);
  ctx.rect(3, 24 - legStep * 0.5, 11, 4.5);
  ctx.fill();
  ctx.stroke();

  // 4. Archaic Tin-Can Breastplate with Heraldic Coat of Arms (Plátové brnění a erb)
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rust stains & rivets
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.arc(-10, 4, 1.6, 0, Math.PI * 2);
  ctx.arc(8, -6, 1.8, 0, Math.PI * 2);
  ctx.arc(2, 8, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Hrusice Red & White Heraldic Crest on Breastplate (Znak Hlásky)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(6, -8);
  ctx.lineTo(6, 2);
  ctx.lineTo(0, 7);
  ctx.lineTo(-6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, -8);
  ctx.lineTo(6, 2);
  ctx.lineTo(0, 7);
  ctx.closePath();
  ctx.fill();

  // Golden cross on shield
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -7); ctx.lineTo(0, 5);
  ctx.moveTo(-4, -3); ctx.lineTo(4, -3);
  ctx.stroke();

  // 5. Neck: Clean Ruff Collar & Comical Smoking Hollow Neck Hole (Dýmající otvor bez hlavy)
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -14, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hollow neck opening
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.ellipse(0, -14, 6, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Comical blue ghost smoke puff wafting from headless collar
  drawFlatGouacheSmokeLobe(ctx, 0, -20 + Math.sin(time * 4) * 2, 4.5);

  // 6. Right Arm Holding Broadsword or Foaming Beer Stein (Meč či korbel)
  const swordSwing = s.isStrike
    ? 0.9 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.7 * s.windupProgress
    : Math.sin(time * 5) * 0.22;

  ctx.save();
  ctx.translate(14, -6);
  ctx.rotate(swordSwing);

  // Arm gauntlet
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-2, -3, 14, 6);
  ctx.fill();
  ctx.stroke();

  // Heavy steel broadsword
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(42, -2);
  ctx.lineTo(47, 0);
  ctx.lineTo(42, 2);
  ctx.lineTo(12, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crossguard & pommel
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(10, -7, 3.5, 14);
  ctx.strokeRect(10, -7, 3.5, 14);
  ctx.beginPath();
  ctx.arc(6, 0, 3.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 7. Left Arm Tucking Severed Armored Helm Under Elbow (Přilba pod paží připíjející si s hospodou)
  ctx.save();
  ctx.translate(-12, -4);

  // Left arm hugging helmet
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(-14, 0, -10, 10);
  ctx.quadraticCurveTo(0, 12, 6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Armored Great Helm Held Under Arm (Přilba s očima a pavím perem)
  ctx.translate(-8, 6);
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  safeRoundRect(ctx, -8, -12, 16, 20, 4);
  ctx.fill();
  ctx.stroke();

  // Helmet visor slit (Hledí)
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.rect(-6, -6, 12, 4);
  ctx.fill();
  ctx.stroke();

  // Lively cartoon eyes peeking out through the dark visor!
  if (!helmetBlink) {
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(-2.5, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(2.5, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-2.5, -4, 0.8, 0, Math.PI * 2);
    ctx.arc(2.5, -4, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rosy red drunk nose sticking out through visor bottom!
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -0.5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Peacock feather proudly stuck in helmet crest
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(-6, -24, -12, -28);
  ctx.stroke();

  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.ellipse(-12, -28, 4.5, 2.8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(-12, -28, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. TŘÍHLAVÝ LÍNÝ DRAK (Rozšafný pohádkový drak z Ladových pohádek)
// ---------------------------------------------------------------------------
export function drawHospodaDrak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  isEnraged: boolean = false,
  headAttacks?: any,
  attackInfo?: EnemyAttackInfo,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.45;
  const enraged = isEnraged || s.isEnraged;
  const wingFlap = Math.sin(time * 5.5) * 0.3;
  const tailWag = Math.sin(time * 4) * 8;
  const bellyBreathe = Math.sin(time * 2.8) * 2;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.06);
  }

  // 1. Dragon Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 36, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Thick Dragon Tail with Yellow Spine Ridges (Dračí ocas s hřebenem)
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.quadraticCurveTo(-38, 14 + tailWag, -48, 6 + tailWag * 1.2);
  ctx.quadraticCurveTo(-36, 0 + tailWag, -14, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spine triangular ridges on tail
  ctx.fillStyle = '#EAB308';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  for (let t = 0; t < 4; t++) {
    const tx = -22 - t * 7;
    const ty = 5 + tailWag * (0.3 + t * 0.2);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 3, ty - 6);
    ctx.lineTo(tx - 6, ty + 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Far Bat Wing (Malá komická netopýří křidélka na zádech)
  ctx.save();
  ctx.translate(-8, -12);
  ctx.rotate(-0.2 + wingFlap);
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, -22);
  ctx.lineTo(-6, -18);
  ctx.lineTo(0, -24);
  ctx.lineTo(4, -16);
  ctx.lineTo(10, -20);
  ctx.lineTo(6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Chubby Green Legs in Felt Slippers (Krátké tlusté nožky v pantoflích)
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-14, 12, 11, 14);
  ctx.rect(4, 12, 11, 14);
  ctx.fill();
  ctx.stroke();

  // Red felt tavern slippers on paws! (Červené domácí bačkory)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, -16, 22, 14, 6, 2.5);
  safeRoundRect(ctx, 2, 22, 14, 6, 2.5);
  ctx.fill();
  ctx.stroke();

  // 5. Giant Pear-Shaped Potbelly with Polka Dots & Checkered Bib (Břichaté tělo s bryndákem)
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 21 + bellyBreathe * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow scaly underbelly
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(2, 6, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Authentic Ladovské brown spots on dragon belly
  ctx.fillStyle = '#92400E';
  const spots = [
    [-6, 4, 2.2],
    [2, 2, 2.8],
    [8, 7, 2.0],
    [-2, 12, 2.5],
    [6, 13, 2.1],
  ];
  for (const [sx, sy, sr] of spots) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red & White Checkered Tavern Bib around Middle Neck (Hospodský kostkovaný bryndák)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(10, -10);
  ctx.lineTo(7, 4);
  ctx.lineTo(-7, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(-7, -8, 4, 4);
  ctx.fillRect(1, -8, 4, 4);
  ctx.fillRect(-3, -4, 4, 4);
  ctx.fillRect(3, 0, 3, 4);

  // Near Wing
  ctx.save();
  ctx.translate(6, -8);
  ctx.rotate(0.2 - wingFlap);
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, -20);
  ctx.lineTo(8, -16);
  ctx.lineTo(2, -22);
  ctx.lineTo(-2, -14);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 6. THREE DISTINCT HEADS (Tři hlavy s komickou mimikou z Ladových pohádek)

  // --- A. LEFT HEAD: Lazy & Sleepy (Bafá z fajfky, napůl spící) ---
  ctx.save();
  ctx.translate(-14, -14);
  const leftBob = Math.sin(time * 3 + 1) * 2;
  ctx.translate(0, leftBob);

  // Curved green neck
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(4, 8);
  ctx.quadraticCurveTo(-8, -4, -10, -14);
  ctx.lineTo(-2, -18);
  ctx.quadraticCurveTo(2, -6, 10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(-8, -18, 9, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Small horns
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(-12, -23); ctx.lineTo(-17, -29); ctx.lineTo(-9, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sleepy slit eye with Zzz
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-8, -19, 3.5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Small clay pipe puffing smoke
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(-15, -15, 6, 2.5);
  ctx.fill();
  ctx.stroke();
  drawFlatGouacheSmokeLobe(ctx, -20, -17, 3.0);

  ctx.restore();

  // --- B. MIDDLE HEAD: Jovial & Hungry (Vyhlíží buchtu, velký úsměv s jazykem) ---
  ctx.save();
  ctx.translate(0, -18);
  const midBob = Math.sin(time * 3.5) * 2.5;
  ctx.translate(0, midBob);

  // Upright neck
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.rect(-5, 0, 10, 14);
  ctx.fill();
  ctx.stroke();

  // Broad friendly dragon head
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.ellipse(0, -8, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Two yellow horns
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(-6, -15); ctx.lineTo(-10, -24); ctx.lineTo(-2, -17);
  ctx.moveTo(6, -15); ctx.lineTo(10, -24); ctx.lineTo(2, -17);
  ctx.fill();
  ctx.stroke();

  // Big jolly round eyes
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-4, -10, 3.2, 0, Math.PI * 2);
  ctx.arc(4, -10, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-4 + s.pupilShiftX * 0.6, -10, 1.6, 0, Math.PI * 2);
  ctx.arc(4 + s.pupilShiftX * 0.6, -10, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.beginPath();
  ctx.arc(-7, -5, 2.5, 0, Math.PI * 2);
  ctx.arc(7, -5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Gaping friendly smile with pink tongue hanging out
  ctx.fillStyle = '#450A0A';
  ctx.beginPath();
  ctx.arc(0, -3, 6, 0.1, Math.PI - 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.ellipse(0, 1, 3.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // --- C. RIGHT HEAD: Comically Angry / Spitting Sparks (Prská saze a vzteká se) ---
  ctx.save();
  ctx.translate(14, -14);
  const rightBob = Math.sin(time * 3 + 2) * 2;
  ctx.translate(0, rightBob);

  // Curved neck reaching forward
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.quadraticCurveTo(8, -4, 12, -14);
  ctx.lineTo(4, -18);
  ctx.quadraticCurveTo(0, -6, -10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = enraged ? '#F87171' : '#22C55E';
  ctx.beginPath();
  ctx.ellipse(10, -16, 9, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Horns
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(12, -22); ctx.lineTo(19, -28); ctx.lineTo(7, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Angry furrowed eyes
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(9, -17, 3.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(9, -17, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Snorting smoke & fiery sparks from nostrils
  drawFuriantSteamPuffs(ctx, 16, -18, time, 0.8);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. PAN ZAJÍC Z BŘEZOVÉHO HÁJE (Rozšafný velikonoční zajíc gentleman)
// ---------------------------------------------------------------------------
export function drawHospodaPanZajic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.35;
  const earTwitch = Math.sin(time * 12) * 0.12;
  const whiskerWiggle = Math.sin(time * 16) * 1.5;
  const hopBob = Math.abs(Math.sin(time * 7)) * 4;

  ctx.save();
  ctx.translate(x, y - s.bob - hopBob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Shadow on Meadow Grass
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 26 + hopBob, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Woven Wicker Backpack Basket of Painted Eggs (Nůše plná malovaných kraslic)
  ctx.save();
  ctx.translate(-14, -2);
  ctx.rotate(-0.1);

  // Wicker backpack
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(2, 14);
  ctx.lineTo(-14, 10);
  ctx.lineTo(-18, -14);
  ctx.lineTo(4, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wicker weave lines
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.6;
  for (let l = -10; l <= 10; l += 5) {
    ctx.beginPath();
    ctx.moveTo(-16, l); ctx.lineTo(3, l + 2);
    ctx.stroke();
  }

  // Colorful folk eggs peaking out of basket
  const eggs = [
    [-12, -15, '#EF4444'],
    [-6, -17, '#FBBF24'],
    [0, -15, '#38BDF8'],
    [-8, -12, '#34D399'],
  ];
  for (const [ex, ey, col] of eggs) {
    ctx.fillStyle = col as string;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(ex as number, ey as number, 4.2, 5.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 3. Stately Hare Hindlegs & Polished Spats (Bílé tlapky v kamaších)
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  const legHop = s.stride * 4;
  ctx.beginPath();
  ctx.rect(-11, 12 + legHop * 0.5, 7, 14);
  ctx.rect(3, 12 - legHop * 0.5, 7, 14);
  ctx.fill();
  ctx.stroke();

  // White furry paws with claws
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.ellipse(-8, 25 + legHop * 0.5, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(6, 25 - legHop * 0.5, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Gentleman's Tweed Frock Coat & Ochre Waistcoat (Myslivecký frak a vestička)
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ochre waistcoat (okrová sváteční vesta)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-12, 6);
  ctx.lineTo(12, 6);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden pocket watch chain across vest
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 1, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // White shirt collar & red polka-dot bow tie (Červený motýlek)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-5, -9); ctx.lineTo(0, -6); ctx.lineTo(5, -9);
  ctx.fill();

  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -8); ctx.lineTo(6, -6); ctx.lineTo(-6, -4); ctx.lineTo(6, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Carrot Walking Stick with Gold Pommel (Karotková hůlka se zlatou rukojetí)
  const caneWave = Math.sin(time * 6) * 0.18;
  ctx.save();
  ctx.translate(12, -2);
  ctx.rotate(caneWave);

  // Arm in green tweed sleeve
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-2, -3, 14, 5.5);
  ctx.fill();
  ctx.stroke();

  // Carrot cane shaft
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(13, 26);
  ctx.lineTo(16, 26);
  ctx.lineTo(14, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden round pommel
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(12, -6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 6. Expressive Hare Head, Long Ears & Twitching Whiskers (Ušák s brýlemi na špičce nosu)
  ctx.save();
  ctx.translate(0, -18);

  // Velvet brown hare head
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White fluffy muzzle (baňatý bílý čumáček)
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 3, 6.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pink nose
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, 1, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Twitching whiskers
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-4, 3); ctx.lineTo(-15, 1 + whiskerWiggle);
  ctx.moveTo(-4, 5); ctx.lineTo(-14, 7 - whiskerWiggle);
  ctx.moveTo(4, 3); ctx.lineTo(15, 1 - whiskerWiggle);
  ctx.moveTo(4, 5); ctx.lineTo(14, 7 + whiskerWiggle);
  ctx.stroke();

  // Jolly expressive eyes with round wire spectacles (Kulaté brejličky)
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-4, -3, 3.2, 0, Math.PI * 2);
  ctx.arc(4, -3, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-4 + s.pupilShiftX * 0.6, -3, 1.6, 0, Math.PI * 2);
  ctx.arc(4 + s.pupilShiftX * 0.6, -3, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Wire glasses rims
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-4, -3, 4.2, 0, Math.PI * 2);
  ctx.arc(4, -3, 4.2, 0, Math.PI * 2);
  ctx.moveTo(-0.2, -3); ctx.lineTo(0.2, -3);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-6, 1, 2.8, 0, Math.PI * 2);
  ctx.arc(6, 1, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Long expressive hare ears (Right ear tall, Left ear comically bent!)
  // Left ear (bent downward in folksy charm)
  ctx.save();
  ctx.translate(-5, -9);
  ctx.rotate(-0.35 + earTwitch);
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -14, -12, -22);
  ctx.quadraticCurveTo(-14, -18, -6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FCA5A5';
  ctx.beginPath();
  ctx.ellipse(-7, -12, 2.5, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right ear (standing tall and proud)
  ctx.save();
  ctx.translate(5, -9);
  ctx.rotate(0.15 - earTwitch);
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(4, -18, 5, -28);
  ctx.quadraticCurveTo(10, -18, 6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FCA5A5';
  ctx.beginPath();
  ctx.ellipse(4, -14, 2.6, 9, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. MORANA, ŠPATNĚ VYNESENÁ SMRTKA (Komicky vzteklá slaměná Morana)
// ---------------------------------------------------------------------------
export function drawHospodaMorana(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.4;
  const dripWave = Math.sin(time * 5) * 3;
  const rageShudder = s.isAttacking || s.isEnraged ? Math.sin(time * 28) * 1.5 : 0;

  ctx.save();
  ctx.translate(x + rageShudder, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  }

  // 1. Water Puddle Under Dripping Straw Effigy
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawRealisticDripCycle2D(ctx, -12, 24, 20, time, 1.4, 0.25, 2.0);
  drawRealisticDripCycle2D(ctx, 12, 24, 20, time + 0.5, 1.4, 0.25, 2.0);
  ctx.restore();

  // 2. Straw Skirt & Reeds (Slaměná suknice se stékající vodou a stuhami)
  drawStrawBundle2D(ctx, 0, 4, 28, 22, time * 2);

  // Red folk ribbons hanging from straw waist
  const ribbons = ['#DC2626', '#2563EB', '#F59E0B', '#16A34A'];
  for (let r = 0; r < ribbons.length; r++) {
    ctx.strokeStyle = ribbons[r];
    ctx.lineWidth = 2.0;
    const rx = (r - 1.5) * 6;
    const rWave = Math.sin(time * 6 + r) * 4;
    ctx.beginPath();
    ctx.moveTo(rx, 10);
    ctx.quadraticCurveTo(rx + rWave, 18, rx + rWave * 1.4, 26);
    ctx.stroke();
  }

  // 3. Bleached Linen Chemise Body (Roztrhaná lněná košile na dřevěném kříži)
  ctx.fillStyle = '#E5E7EB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(14, 8);
  ctx.lineTo(12, -10);
  ctx.lineTo(-12, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wooden crossbar sticking out of shoulders
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.fillRect(-22, -9, 8, 4);
  ctx.strokeRect(-22, -9, 8, 4);
  ctx.fillRect(14, -9, 8, 4);
  ctx.strokeRect(14, -9, 8, 4);

  // 4. Eggshell Necklace (Náhrdelník z vyfouknutých vaječných skořápek - výdumků)
  const eggshells = [
    [-8, -7], [-4, -4], [0, -3], [4, -4], [8, -7]
  ];
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.quadraticCurveTo(0, 0, 10, -8);
  ctx.stroke();

  for (const [ex, ey] of eggshells) {
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 5. Birch Broom / Ice Flail in Hand (Březové pometlo namočené v ledové vodě)
  const broomSwing = s.isStrike
    ? 0.9 * (1 - s.strikeProgress * 0.4)
    : s.isWindup
    ? -0.75 * s.windupProgress
    : Math.sin(time * 6) * 0.25;

  ctx.save();
  ctx.translate(16, -6);
  ctx.rotate(broomSwing);

  // Straw arm
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(12, 2);
  ctx.stroke();

  // Birch broom handle
  ctx.fillStyle = '#713F12';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.fillRect(8, -26, 4, 48);
  ctx.strokeRect(8, -26, 4, 48);

  // Wet dripping broom twigs (pometlo)
  ctx.fillStyle = '#854D0E';
  ctx.beginPath();
  ctx.moveTo(5, -26);
  ctx.lineTo(15, -26);
  ctx.lineTo(20, -42);
  ctx.lineTo(0, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ice drops spraying from broom
  ctx.fillStyle = '#38BDF8';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(10 + i * 5, -44 - i * 3, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // 6. Pale Straw Head with Rowan Wreath & Frosty Howl (Slaměná hlava, jeřabiny a mráz)
  ctx.save();
  ctx.translate(0, -18);

  // Straw braid hair
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Straw plait hanging on side
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-18, 10 + dripWave * 0.3, -14, 20);
  ctx.quadraticCurveTo(-8, 14, -6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rowan berry wreath on head (Věneček z červených jeřabin)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -7, 9.5, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  for (let b = -8; b <= 8; b += 4) {
    ctx.beginPath();
    ctx.arc(b, -8 + Math.abs(b) * 0.2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Comically angry straw face
  ctx.fillStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  // Furrowed slanted eyes
  ctx.beginPath();
  ctx.moveTo(-6, -4); ctx.lineTo(-2, -2);
  ctx.moveTo(6, -4); ctx.lineTo(2, -2);
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(-4, -2, 2.2, 0, Math.PI * 2);
  ctx.arc(4, -2, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Gaping shivering mouth with frost breath
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.ellipse(0, 4, 4.5, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Frost puffs billowing from mouth
  drawFuriantSteamPuffs(ctx, 0, -2, time, 0.9);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. STARÁ JEŽIBABA Z MELECHU (Zlomyslná pohádková baba jaga s koštětem)
// ---------------------------------------------------------------------------
export function drawHospodaOldWitch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.35;
  const hunchBob = Math.sin(time * 6.5) * 3;
  const cackleJaw = s.isAttacking ? 6 : Math.sin(time * 8) * 2 + 3;

  ctx.save();
  ctx.translate(x, y - s.bob - hunchBob * 0.4);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.14);
  }

  // 1. Shadow on Forest Clearing
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 24, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Crooked Witch Boots & Striped Stockings (Pruhované punčochy a křivé škorně)
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  const wStride = s.stride * 4;
  // Left leg
  ctx.beginPath();
  ctx.rect(-10, 12 + wStride * 0.4, 6, 12);
  ctx.rect(3, 12 - wStride * 0.4, 6, 12);
  ctx.fill();
  ctx.stroke();

  // Upturned pointy witch shoes
  ctx.fillStyle = '#3F3F46';
  ctx.beginPath();
  ctx.moveTo(-11, 24 + wStride * 0.4);
  ctx.lineTo(-3, 24 + wStride * 0.4);
  ctx.quadraticCurveTo(-14, 20 + wStride * 0.4, -16, 21 + wStride * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, 24 - wStride * 0.4);
  ctx.lineTo(10, 24 - wStride * 0.4);
  ctx.quadraticCurveTo(0, 20 - wStride * 0.4, -2, 21 - wStride * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Flower Skirt & Patched Apron (Květovaná suknice a záplatovaná zástěra)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(14, 8);
  ctx.lineTo(18, 22);
  ctx.lineTo(-18, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Folk floral dots on skirt
  drawFolkFlower2D(ctx, -10, 16, 3.5, '#F43F5E', '#FBBF24');
  drawFolkFlower2D(ctx, 10, 16, 3.5, '#38BDF8', '#FBBF24');

  // Brown patched apron
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, -8, 7, 16, 14, 2);
  ctx.fill();
  ctx.stroke();

  // Apron patch with stitches
  ctx.fillStyle = '#A16207';
  ctx.fillRect(1, 11, 5, 5);
  ctx.strokeRect(1, 11, 5, 5);

  // Black cat head peeking from apron pocket!
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.arc(-3, 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Cat ears
  ctx.beginPath();
  ctx.moveTo(-6, 7); ctx.lineTo(-7, 3); ctx.lineTo(-4, 6);
  ctx.moveTo(-2, 6); ctx.lineTo(1, 3); ctx.lineTo(0, 7);
  ctx.fill();
  // Cat eyes
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-4, 7.5, 0.8, 0, Math.PI * 2);
  ctx.arc(-1.5, 7.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // 4. Hunched Body & Blue/Grey Wool Jacket with Elbow Patches (Shrbený kabátek s loketními záplatami)
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(-2, -2, 16, 17, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Birch Flying Broom in Gnarly Hands (Březové koště se zakroucenou násadou)
  const witchBroomSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.8 * s.windupProgress
    : Math.sin(time * 6.5) * 0.25;

  ctx.save();
  ctx.translate(12, -4);
  ctx.rotate(witchBroomSwing);

  // Gnarled claw arm
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-2, -3, 14, 5);
  ctx.fill();
  ctx.stroke();

  // Long birch broom stick
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.fillRect(10, -32, 4.5, 52);
  ctx.strokeRect(10, -32, 4.5, 52);

  // Twig bundle on broom top (svazek březových větviček)
  ctx.fillStyle = '#854D0E';
  ctx.beginPath();
  ctx.moveTo(6, -32);
  ctx.lineTo(18, -32);
  ctx.lineTo(24, -48);
  ctx.lineTo(0, -48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 6. Crooked Head, Red Polka-Dot Headscarf, Hooked Nose & Wart (Šátek s puntíky, skoba a bradavice)
  ctx.save();
  ctx.translate(2, -18);

  // Red polka-dot babushka headscarf tied under chin (Červený šátek s puntíky)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.quadraticCurveTo(-14, -22, 0, -20);
  ctx.quadraticCurveTo(14, -22, 12, -6);
  ctx.quadraticCurveTo(0, 10, -12, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White polka dots on scarf
  ctx.fillStyle = '#FFFFFF';
  const dots = [
    [-6, -14], [2, -16], [8, -12], [-8, -6], [6, -4], [-2, 0]
  ];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Knotted scarf tails sticking out under chin
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath();
  ctx.moveTo(-2, 7); ctx.lineTo(-6, 12); ctx.lineTo(0, 9);
  ctx.moveTo(2, 7); ctx.lineTo(6, 12); ctx.lineTo(0, 9);
  ctx.fill();

  // Hag face inside scarf
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -4, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Prominent hooked witch nose (Orlí skoba)
  ctx.fillStyle = '#EAB308';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.quadraticCurveTo(10, -7, 12, -2);
  ctx.quadraticCurveTo(6, 1, 0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hairy black wart on nose tip!
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(10, -4, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Sly mischievous squinting eyes
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.arc(-2, -6, 2.0, 0, Math.PI * 2);
  ctx.arc(4, -6, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-2, -6, 1.0, 0, Math.PI * 2);
  ctx.arc(4, -6, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Toothless cackling mouth with single crooked bottom tooth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(1, 2, 4.5, 0.2, Math.PI - 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Single crooked yellow tooth sticking up
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(0, 2, 2.2, 2.8);
  ctx.strokeRect(0, 2, 2.2, 2.8);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. POVIDLOVÝ ČERT S MĚCHAČKOU (Zlomyslný pekelník upatlaný od švestkových povidel)
// ---------------------------------------------------------------------------
export function drawHospodaPovidlovyCert(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.35;
  const stirWave = Math.sin(time * 7) * 0.25;
  const tongueWobble = Math.sin(time * 12) * 2;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.1);
  }

  // 1. Dark Plum Jam Ground Puddle with Splatters
  ctx.save();
  ctx.fillStyle = 'rgba(74, 4, 78, 0.35)';
  ctx.strokeStyle = '#581C87';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 25, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sticky plum drops on ground
  ctx.fillStyle = '#3B0764';
  ctx.beginPath();
  ctx.arc(-14, 25, 2.2, 0, Math.PI * 2);
  ctx.arc(12, 26, 2.5, 0, Math.PI * 2);
  ctx.arc(0, 28, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Cloven Hooves & Tail with Jam Drop (Kopyta a čertovský ocas s kapkou povidel)
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  const legHop = s.stride * 4;
  ctx.beginPath();
  ctx.rect(-10, 12 + legHop * 0.5, 7, 14);
  ctx.rect(3, 12 - legHop * 0.5, 7, 14);
  ctx.fill();
  ctx.stroke();

  // Split cloven hooves
  ctx.fillStyle = '#71717A';
  ctx.beginPath();
  ctx.rect(-11, 24 + legHop * 0.5, 8, 4);
  ctx.rect(2, 24 - legHop * 0.5, 8, 4);
  ctx.fill();
  ctx.stroke();

  // Swishing devil tail
  const tailSway = Math.sin(time * 8) * 10;
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-26, 12 + tailSway, -32, 6 + tailSway * 0.8);
  ctx.stroke();

  // Tail barb with plum jam dollop
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-32, 6 + tailSway * 0.8 - 5);
  ctx.lineTo(-38, 6 + tailSway * 0.8);
  ctx.lineTo(-32, 6 + tailSway * 0.8 + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4A044E';
  ctx.beginPath();
  ctx.arc(-39, 6 + tailSway * 0.8, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // 3. Jet Black Sooty Torso Stained with Purple Plum Butter (Uhlové tělo a povidla)
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Large glossy purple plum jam splotches across belly
  ctx.fillStyle = '#4A044E';
  ctx.strokeStyle = '#581C87';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-3, 2, 9, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shiny white highlight dash on jam
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-5, 0, 3.5, 1.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Red spotted neckerchief (Červený šátek na krku)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, -9);
  ctx.lineTo(10, -9);
  ctx.lineTo(0, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Giant Wooden Plum Paddle / Ladle (Obří dřevěná měchačka na povidla)
  const paddleAngle = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.85 * s.windupProgress
    : stirWave;

  ctx.save();
  ctx.translate(14, -2);
  ctx.rotate(paddleAngle);

  // Arm
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-2, -3, 14, 6);
  ctx.fill();
  ctx.stroke();

  // Long wooden shaft of the paddle (rukojeť měchačky)
  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.fillRect(8, -32, 5, 52);
  ctx.strokeRect(8, -32, 5, 52);

  // Wide flat paddle blade dripping with sticky povidla
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  safeRoundRect(ctx, 4, -36, 13, 18, 4);
  ctx.fill();
  ctx.stroke();

  // Glossy dark purple povidla coating paddle blade
  ctx.fillStyle = '#4A044E';
  ctx.beginPath();
  safeRoundRect(ctx, 5, -34, 11, 14, 3);
  ctx.fill();

  // Thick dripping droplets falling from paddle
  drawRealisticDripCycle2D(ctx, 10, -18, 16, time, 1.2, 0.25, 2.0);

  ctx.restore();

  // 5. Devil Head, Horns, Mischievous Eyes & Licking Tongue (Čertovská hlava s jazykem)
  ctx.save();
  ctx.translate(0, -18);

  // Black fur head
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Plum jam smudge on cheek
  ctx.fillStyle = '#581C87';
  ctx.beginPath();
  ctx.ellipse(-5, 2, 4.0, 2.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Curved yellow devil horns with black ridges
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 4, -9);
    ctx.quadraticCurveTo(side * 14, -22, side * 8, -26);
    ctx.quadraticCurveTo(side * 4, -18, side * 1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Glowing orange mischievous eyes
  ctx.fillStyle = '#F97316';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-4, -2, 3.2, 0, Math.PI * 2);
  ctx.arc(4, -2, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-4 + s.pupilShiftX * 0.6, -2, 1.6, 0, Math.PI * 2);
  ctx.arc(4 + s.pupilShiftX * 0.6, -2, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Long pink tongue licking plum jam off upper lip
  ctx.fillStyle = '#F43F5E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-3, 3);
  ctx.quadraticCurveTo(-6, 8 + tongueWobble, 0, 11 + tongueWobble);
  ctx.quadraticCurveTo(4, 7 + tongueWobble, 3, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Plum dollop on tongue tip!
  ctx.fillStyle = '#4A044E';
  ctx.beginPath();
  ctx.arc(0, 11 + tongueWobble, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. BAKCHUS S PIVNÍM SOUDKEM (Rozšafný patron hospodského veselí na sudu)
// ---------------------------------------------------------------------------
export function drawHospodaBakchusSPivnimSoudkem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.45;
  const barrelRoll = Math.sin(time * 3.5) * 2;
  const beerSplash = Math.sin(time * 5.5) * 2;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Foaming Tavern Ground Shadow & Golden Beer Puddle
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 26, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Giant Oak Beer Barrel (Obří dubový pivní sud s železnými obručemi a pípou)
  ctx.save();
  ctx.translate(0, 14 + barrelRoll * 0.4);

  // Oak barrel belly
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dark iron hoops (železné obruče na sudu)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.ellipse(0, -6, 26, 6.5, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 6, 26, 6.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Brass tap spout & bung (dřevěná pípa)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-3, -2, 6, 8);
  ctx.fill();
  ctx.stroke();

  // Golden beer dripping from tap
  drawRealisticDripCycle2D(ctx, 0, 6, 12, time * 1.5, 1.0, 0.3, 1.8);

  ctx.restore();

  // 3. Bakchus Boots Straddling the Barrel (Nohy v kožených holínkách obkročmo na sudu)
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  safeRoundRect(ctx, -24, 10, 9, 14, 3);
  safeRoundRect(ctx, 15, 10, 9, 14, 3);
  ctx.fill();
  ctx.stroke();

  // Shiny brass buckles on boots
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-22, 18, 5, 3.5);
  ctx.fillRect(17, 18, 5, 3.5);

  // 4. Jolly Rotund Belly in Crimson Doublet & White Frilled Collar (Furiantský pupík a kabátec)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden vest embroidery & round gold buttons
  ctx.fillStyle = '#FACC15';
  for (let b = -8; b <= 6; b += 5) {
    ctx.beginPath();
    ctx.arc(0, b, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // White ruffled folk shirt collar (bílý volánový límec)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -10, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Right Arm Raising Foaming Ceramic Stein Aloft (Pozdvižený tuplák s pěnou)
  const mugSwing = s.isStrike
    ? 0.85 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.6 * s.windupProgress
    : Math.sin(time * 5) * 0.2;

  ctx.save();
  ctx.translate(14, -6);
  ctx.rotate(mugSwing);

  // Sleeve
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-2, -3, 14, 6.5);
  ctx.fill();
  ctx.stroke();

  // Foaming Stoneware Beer Stein (Tuplák)
  drawFoamingBeerMug2D(ctx, 18, -4, 1.2, 0.15, time + beerSplash);

  ctx.restore();

  // 6. Left Hand Clutching Chain of Roast Sausages (Šňůra jitrnic v ruce)
  ctx.save();
  ctx.translate(-14, -4);
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.rect(-12, -3, 14, 6.5);
  ctx.fill();
  ctx.stroke();

  // Links of juicy roasted village sausages (šňůra jitrnic)
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  const sausages = [
    [-14, 4], [-12, 11], [-14, 18]
  ];
  for (const [sx, sy] of sausages) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3.8, 6.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 7. Jovial Triple-Chinned Face with Hop Wreath (Růžolící hlava s trojitou bradou a chmelem)
  ctx.save();
  ctx.translate(0, -18);

  // Double and triple chins!
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 5, 8, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // Round rosy face
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big ruddy red tavern cheeks (červené hospodské líce)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.arc(-7, 2, 4.0, 0, Math.PI * 2);
  ctx.arc(7, 2, 4.0, 0, Math.PI * 2);
  ctx.fill();

  // Jolly laughing eyes
  ctx.fillStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(-5, -2, 3.5, Math.PI * 0.1, Math.PI * 0.9);
  ctx.arc(5, -2, 3.5, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Bulbous red drinker's nose
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Roaring laughing mouth with white teeth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 5, 6.5, 0.1, Math.PI - 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-4, 4, 8, 2.5);

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, 7, 3.2, 0, Math.PI);
  ctx.fill();

  // Wreath of Fresh Žatec Hops & Ivy on Head (Věnec z chmelových šištic)
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -9, 11, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  drawHopCone2D(ctx, -8, -12, 0.9, -0.3);
  drawHopCone2D(ctx, 0, -15, 1.0, 0);
  drawHopCone2D(ctx, 8, -12, 0.9, 0.3);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. UMRLEC BASISTA (Furiantský hospodský muzikant s basou a cylindrem)
// ---------------------------------------------------------------------------
export function drawHospodaUmrlecBasista(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const scale = 2.4;
  const bowingMotion = Math.sin(time * 8.5) * 12;
  const noteBob = (time * 2) % 3;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Tavern Floor Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(24, 24, 27, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Giant Dark Wooden Double Bass (Hospodská kontrabasa s strunami)
  ctx.save();
  ctx.translate(6, 4);
  ctx.rotate(-0.15);

  // Lower bass bout
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Upper bass bout
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(0, -6, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // F-holes (houslové otvory f)
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-9, 4, -5, 10);
  ctx.moveTo(6, -2); ctx.quadraticCurveTo(9, 4, 5, 10);
  ctx.stroke();

  // Bass neck & scroll with tuning pegs (krk basy a kolíčky)
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-2, -26, 4, 24);
  ctx.strokeRect(-2, -26, 4, 24);

  // Scroll pegbox
  ctx.beginPath();
  safeRoundRect(ctx, -4, -34, 8, 9, 2);
  ctx.fill();
  ctx.stroke();

  // 4 Gut strings
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.0;
  for (let str = -1.5; str <= 1.5; str += 1.0) {
    ctx.beginPath();
    ctx.moveTo(str, -30); ctx.lineTo(str * 1.5, 20);
    ctx.stroke();
  }

  // Endpin spike resting on floor
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 24); ctx.lineTo(0, 30);
  ctx.stroke();

  ctx.restore();

  // 3. Black Funeral Frock Coat & Tailcoat (Smuteční frak s dlouhými šosy)
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;

  // Stride of skeleton legs in black trousers
  const legWalk = s.stride * 4;
  ctx.beginPath();
  ctx.rect(-10, 12 + legWalk * 0.4, 6, 14);
  ctx.rect(2, 12 - legWalk * 0.4, 6, 14);
  ctx.fill();
  ctx.stroke();

  // Black funeral boots
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.rect(-12, 24 + legWalk * 0.4, 9, 4.5);
  ctx.rect(0, 24 - legWalk * 0.4, 9, 4.5);
  ctx.fill();
  ctx.stroke();

  // Frock coat torso
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(11, -8);
  ctx.lineTo(13, 14);
  ctx.lineTo(-13, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Long fluttering tailcoat tails (šosy fraku)
  ctx.beginPath();
  ctx.moveTo(-12, 14);
  ctx.quadraticCurveTo(-16, 24, -20, 28);
  ctx.lineTo(-10, 14);
  ctx.fill();
  ctx.stroke();

  // White shirt front & black bow tie (Bílá náprsenka a motýlek)
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(2, 2); ctx.lineTo(-2, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.ellipse(0, -6, 3.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Skeleton Arms Sawing the Horsehair Bow (Smyčec a kostlivé ruce)
  // Left hand on double bass fingerboard
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(4, -8, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right arm sawing furiously with bass bow
  ctx.save();
  ctx.translate(-4, -2);
  ctx.rotate(0.2);

  // Arm
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-4, -2, 12, 4.5);
  ctx.fill();
  ctx.stroke();

  // Horsehair bass bow (smyčec kmitající po strunách)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8 - bowingMotion, -12);
  ctx.lineTo(8 - bowingMotion + 32, 10);
  ctx.stroke();

  // Bow hair
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(9 - bowingMotion, -11);
  ctx.lineTo(8 - bowingMotion + 31, 9);
  ctx.stroke();

  ctx.restore();

  // 5. Smiling Skeleton Skull in Battered Top Hat with Cigar (Lebka v cylindru)
  ctx.save();
  ctx.translate(0, -18);

  // Bleached skull
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Deep black eye sockets
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.ellipse(-4, -2, 3.0, 3.8, -0.15, 0, Math.PI * 2);
  ctx.ellipse(4, -2, 3.0, 3.8, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Eerie green glowing pupils inside sockets
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(-4, -2, 1.2, 0, Math.PI * 2);
  ctx.arc(4, -2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Inverted heart-shaped nasal cavity
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.moveTo(0, 1); ctx.lineTo(-1.5, 4); ctx.lineTo(1.5, 4);
  ctx.closePath();
  ctx.fill();

  // Broad grinning teeth (zubiska muzikanta)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(-6, 5, 12, 5);
  ctx.fill();
  ctx.stroke();

  // Individual tooth vertical lines
  for (let t = -4; t <= 4; t += 2) {
    ctx.beginPath();
    ctx.moveTo(t, 5); ctx.lineTo(t, 10);
    ctx.stroke();
  }

  // Lit cigar in teeth with red ash & smoke
  ctx.fillStyle = '#78350F';
  ctx.fillRect(4, 7, 8, 2.5);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(11, 7, 2, 2.5);
  drawFlatGouacheSmokeLobe(ctx, 16, 5, 3.2);

  // Battered Black Top Hat Tilted on Head (Otlučený cylindr s červenou stuhou)
  ctx.save();
  ctx.translate(0, -9);
  ctx.rotate(0.12);

  // Hat brim
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tall hat crown
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-8, -18);
  ctx.lineTo(8, -18);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red velvet ribbon on hat
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-9, -4, 18, 4);

  ctx.restore();

  // Floating folk music notes rising into the tavern air!
  drawMusicNote2D(ctx, -16, -26 - noteBob * 6, 0, 0.9);
  drawMusicNote2D(ctx, 16, -30 - noteBob * 5, 1, 0.85);

  ctx.restore();
  ctx.restore();
}
