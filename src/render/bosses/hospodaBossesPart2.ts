import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  drawArticulatedArm2D,
  drawGrippingHand2D,
  drawLadaExpressiveEye2D,
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
//    ADR 0054 & ADR 0055: Mobilní postoj, 2-kloubové paže, 4-prstý úchop kyje,
//    vícevrstvá okulární mimika, březová vesta se záplatami a šiškovými knoflíky.
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
  const rustle = Math.sin(time * (s.isMoving ? 9.5 : 3.2)) * (s.isMoving ? 3.2 : 1.1);
  const howlJaw = s.isStrike ? 14.5 : s.isWindup ? 11.5 : s.isEnraged || s.isPanicked ? 10.5 : 5.2;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isStrike) {
    ctx.rotate(0.06);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Forest Moss Ground Shadow & Fallen Pinecones
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 25, 27, 8.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small moss tufts at ground level
  ctx.fillStyle = '#365314';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-16, 24, 3.2, Math.PI, Math.PI * 2);
  ctx.arc(17, 24, 2.8, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Articulated Bark & Root Legs (Svalnaté křivé pařezové nohy s kolenními suky)
  const leg1Stride = s.stride * 5.5;
  const leg2Stride = -s.stride * 5.5;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 3.2 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 3.2 : 0;

  const drawRootLeg = (hipX: number, strideX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kneeX = hipX + strideX * 0.45 + (isBack ? -1 : 1.5);
    const kneeY = 15 - liftY * 0.5;
    const footX = hipX + strideX * 0.85;
    const footY = 24 - liftY;

    // Bark leg shaft (3-tier gouache)
    drawArticulatedArm2D(
      ctx,
      hipX,
      7,
      kneeX,
      kneeY,
      footX,
      footY,
      7.2,
      6.2,
      isBack ? '#3E2723' : '#4E342E',
      '#271714',
      '#6D4C41'
    );

    // Mossy knee tuft
    ctx.fillStyle = '#4D7C0F';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(kneeX + 1, kneeY - 1, 4.0, 2.3, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Knotted root foot with 3 gnarled root toes
    ctx.fillStyle = isBack ? '#3E2723' : '#4E342E';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(footX + 1.5, footY, 6.2, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1C1917';
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(footX + 5.5, footY + c * 1.4 - 0.9);
      ctx.lineTo(footX + 8.8, footY + c * 1.6);
      ctx.lineTo(footX + 5.5, footY + c * 1.4 + 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  drawRootLeg(-9, leg1Stride, leg1Lift, true);
  drawRootLeg(8, leg2Stride, leg2Lift, false);

  // 3. Shaggy Moss & Spruce-Needle Torso (Třívrstvý kvašový kožich z chvojí a lišejníku)
  // Base shadow coat
  ctx.fillStyle = '#1E3A1E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 21, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mid-tone forest green body mass
  ctx.fillStyle = '#2E5A27';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 18.5, 19.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upper-left warm foliage highlight
  ctx.fillStyle = '#3F7A34';
  ctx.beginPath();
  ctx.ellipse(-5, -6, 11, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Layered spruce-needle & lichen scales with calligraphic ink outlines
  const spruceScales: Array<[number, number, string, number]> = [
    [-13, -9, '#166534', -0.25],
    [0, -11, '#15803D', 0.0],
    [12, -8, '#166534', 0.25],
    [-15, 1, '#365314', -0.3],
    [-6, 3, '#4D7C0F', -0.1],
    [6, 3, '#3F6212', 0.1],
    [14, 1, '#365314', 0.3],
    [-10, 12, '#14532D', -0.15],
    [0, 14, '#166534', 0.0],
    [9, 12, '#15803D', 0.15],
  ];

  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.75;
  for (const [mx, my, col, rot] of spruceScales) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(mx, my + rustle * 0.12, 6.2, 4.2, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Folk Birch-Bark Vest (Vesta z březové kůry se záplatou a šiškovými knoflíky)
  ctx.fillStyle = '#E7E5E4';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeRoundRect(ctx, -9.5, -6, 19, 17.5, 3.0);
  ctx.fill();
  ctx.stroke();

  // Inner birch highlight panel
  ctx.fillStyle = '#FAFAF9';
  ctx.beginPath();
  safeRoundRect(ctx, -8, -4.5, 7, 14.5, 1.8);
  ctx.fill();

  // Center vest opening seam
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, 11.5);
  ctx.stroke();

  // Birch bark horizontal lenticel striations
  ctx.fillStyle = HOSPODA_INK;
  ctx.fillRect(-7.5, -2.5, 4.2, 1.1);
  ctx.fillRect(2.5, 0.5, 4.5, 1.1);
  ctx.fillRect(-6.5, 4.5, 4.8, 1.1);
  ctx.fillRect(2.0, 7.0, 3.8, 1.1);

  // Stitched moss-cloth patch on lower-left of birch vest (Záplata s křížkovým stehem)
  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, -8.5, 4.5, 6.2, 5.5, 1.2);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-9.2, 6.0);
  ctx.lineTo(-7.5, 6.0);
  ctx.moveTo(-9.2, 8.5);
  ctx.lineTo(-7.5, 8.5);
  ctx.moveTo(-2.8, 6.0);
  ctx.lineTo(-1.5, 6.0);
  ctx.moveTo(-2.8, 8.5);
  ctx.lineTo(-1.5, 8.5);
  ctx.stroke();

  // Three pinecone buttons down vest center
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  for (const by of [-2.5, 2.5, 7.5]) {
    ctx.beginPath();
    ctx.ellipse(0, by, 2.3, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Left Articulated Arm (Zvednutá k uchu/tlamě při hejkalovském zahoukání)
  const leftRaise = s.isAttacking ? 5.5 : rustle * 0.8;
  const lShoulderX = -15;
  const lShoulderY = -5;
  const lElbowX = -25;
  const lElbowY = -9 - leftRaise * 0.5;
  const lWristX = -19;
  const lWristY = -20 - leftRaise;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    6.4,
    5.4,
    '#4E342E',
    '#271714',
    '#6D4C41',
    '#166534'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, -0.9, '#5D4037', '#3E2723', 3.4, '#1C1917');

  // 5. Head: Wild Spruce Crown, Bark Face, Multi-Layered Owl Eyes & Howling Jaw
  ctx.save();
  ctx.translate(0, -19);

  // Wild spiky spruce foliage & branches framing head
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  const foliageSpikes = [
    [-15, -5, -26, -13, -14, -17],
    [-13, -16, -20, -29, -6, -23],
    [-6, -22, 0, -35, 6, -22],
    [6, -23, 20, -29, 13, -16],
    [14, -17, 26, -13, 15, -5],
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

  // Lighter spruce needle highlights in crown
  ctx.fillStyle = '#15803D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.lineTo(-14, -26);
  ctx.lineTo(-4, -21);
  ctx.closePath();
  ctx.moveTo(4, -21);
  ctx.lineTo(14, -26);
  ctx.lineTo(10, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Two hanging spruce cones in his crown (Smrkové šišky ve věnci)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-12, -14, 2.6, 4.2, 0.25, 0, Math.PI * 2);
  ctx.ellipse(12, -14, 2.6, 4.2, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3-Tier Gouache Bark Head
  ctx.fillStyle = '#3E2723';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.arc(-0.8, -0.8, 11.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#795548';
  ctx.beginPath();
  ctx.ellipse(-3.5, -5.0, 6.5, 4.5, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered bulging owl eyes with saccadic pupils & mossy V-brows
  const browAngle = s.isAttacking || s.isEnraged ? 0.32 : 0.18;
  drawLadaExpressiveEye2D(
    ctx,
    -5.2,
    -3.2,
    4.3,
    4.3,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.9,
    s.pupilShiftY * 0.7,
    s.eyeSquint,
    '#65A30D',
    browAngle,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    5.2,
    -3.2,
    4.3,
    4.3,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.9,
    s.pupilShiftY * 0.7,
    s.eyeSquint,
    '#65A30D',
    -browAngle,
    s.browLift
  );

  // Rosy furiant cheeks & bark freckles
  ctx.fillStyle = 'rgba(239, 68, 68, 0.48)';
  ctx.beginPath();
  ctx.arc(-8.5, 1.8, 2.9, 0, Math.PI * 2);
  ctx.arc(8.5, 1.8, 2.9, 0, Math.PI * 2);
  ctx.fill();

  // Knotted wooden nose with highlight
  ctx.fillStyle = '#4E342E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0.8, 3.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.arc(-0.9, -0.2, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Bushy moss beard framing the howling jaw
  ctx.fillStyle = '#3F6212';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10.5, 4.5);
  ctx.quadraticCurveTo(-15, 16.5, 0, 16.0 + howlJaw * 0.18);
  ctx.quadraticCurveTo(15, 16.5, 10.5, 4.5);
  ctx.quadraticCurveTo(0, 9.5, -10.5, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gaping roaring howling mouth (Hejkalovský ryk)
  const mouthRy = Math.max(2.8, howlJaw * 0.56);
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 6.5, 7.6, mouthRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Vibrating tongue & wooden teeth
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.ellipse(0, 6.5 + mouthRy * 0.38, 4.2, mouthRy * 0.45, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  // Upper teeth
  ctx.beginPath();
  ctx.rect(-4.6, 6.5 - mouthRy * 0.82, 3.0, 2.8);
  ctx.rect(1.6, 6.5 - mouthRy * 0.82, 3.0, 2.8);
  // Lower fangs
  ctx.rect(-3.8, 6.5 + mouthRy * 0.35, 2.4, 2.2);
  ctx.rect(1.4, 6.5 + mouthRy * 0.35, 2.4, 2.2);
  ctx.fill();
  ctx.stroke();

  // Acoustic howl rings when attacking or enraged (Zvukové kruhy hejkalova ryku)
  if (s.isAttacking || s.isEnraged) {
    ctx.save();
    const wavePhase = (time * 4.5) % 1;
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = Math.max(0.15, (1 - wavePhase) * 0.75);
    ctx.beginPath();
    ctx.ellipse(6 + wavePhase * 12, 6.5, 4 + wavePhase * 7, 5 + wavePhase * 8, 0, -0.9, 0.9);
    ctx.stroke();
    ctx.restore();
    drawFuriantSteamPuffs(ctx, 0, -21, time, s.isEnraged ? 1.4 : 0.95);
  }

  ctx.restore();

  // 6. Right Articulated Arm & Knotted Spruce Club (Pevný 4-prstý úchop sukovitého smrkového kyje)
  const clubSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.3)
    : s.isWindup
    ? -0.82 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.18
    : Math.sin(time * 2.8) * 0.06;

  ctx.save();
  ctx.translate(13, -5);
  ctx.rotate(clubSwing);

  const rElbowX = 7;
  const rElbowY = 5;
  const rWristX = 16;
  const rWristY = 1;

  // Draw articulated right bark arm first
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.8,
    5.8,
    '#4E342E',
    '#271714',
    '#6D4C41',
    '#166534'
  );

  // Massive knotted spruce club held directly at wrist (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(0.12);

  // Club shaft & bulbous head (3-tier wood gouache)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-2.5, 12);
  ctx.lineTo(-5.5, -31);
  ctx.quadraticCurveTo(0, -39, 7.5, -31);
  ctx.lineTo(3.2, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mid-tone warm spruce wood grain
  ctx.fillStyle = '#713F12';
  ctx.beginPath();
  ctx.moveTo(-1.2, 10);
  ctx.lineTo(-3.6, -30);
  ctx.quadraticCurveTo(1, -36, 5.2, -30);
  ctx.lineTo(1.8, 10);
  ctx.closePath();
  ctx.fill();

  // Wood highlight streak
  ctx.fillStyle = '#A16207';
  ctx.beginPath();
  ctx.ellipse(-1.2, -16, 1.8, 11, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Protruding branch knots on club (Suky)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  for (const [kx, ky, kr] of [
    [-5.5, -24, 3.6],
    [6.2, -20, 3.8],
    [-4.5, -12, 3.1],
  ]) {
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Cushion of green forest moss & spruce sprig on club crown
  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath();
  ctx.ellipse(1.0, -33.5, 5.2, 2.8, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(2.5, -35);
  ctx.lineTo(6.5, -43);
  ctx.moveTo(4.2, -38);
  ctx.lineTo(10.0, -40);
  ctx.stroke();

  ctx.restore();

  // Draw 4-fingered clawed wooden hand wrapping over the club handle at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0.12, '#5D4037', '#3E2723', 3.8, '#1C1917');

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. ČERTOVSKÝ MLYNÁŘ (Rozšafný pomoučněný mlynář s ocasem a mlýnským kolem)
//    ADR 0054 & ADR 0055: Mobilní postoj, rotující mlýnské kolo s kapkami vody,
//    2-kloubové paže v rukávech, 4-prstý úchop sázecí lopaty, fajfka a čertovský roh.
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
    ctx.rotate(0.1);
  } else if (s.isStrike) {
    ctx.rotate(0.06);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Water Mill-Race Puddle & Dripping Water from Wheel (Loužička z náhonu)
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.30)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-2, 26, 29, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner water ripple highlight
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-6, 26, 16, 4.0, 0, 0, Math.PI);
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, -18, 12, 25, time, 1.25, 0.15, 2.1);
  drawRealisticDripCycle2D(ctx, -10, 14, 25, time, 1.25, 0.75, 1.9);
  ctx.restore();

  // 2. Wooden Mill Wheel on Back (Mlýnské kolo s kovovým ráfkem a lopatkami)
  ctx.save();
  ctx.translate(-16, -2);
  ctx.rotate(wheelAngle);

  // Outer wooden wheel rim (3-tier wood & iron band)
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 6.2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();

  // Wooden spokes & bucket paddles (lopatky)
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);

    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cosA * 22, sinA * 22);
    ctx.stroke();

    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cosA * 22, sinA * 22);
    ctx.stroke();

    // Wooden paddle blade & water film on outer rim
    ctx.save();
    ctx.translate(cosA * 23, sinA * 23);
    ctx.rotate(ang);
    ctx.fillStyle = '#451A03';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    safeRoundRect(ctx, -2.2, -3.2, 4.4, 6.4, 1.2);
    ctx.fill();
    ctx.stroke();

    // Glistening blue water film on every second paddle
    if (i % 2 === 0) {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(1.5, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Wheel center iron-bound axle hub
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 3. Devil Tail Peeking Out from Under Miller's Coat (Čertovský ocas s karmínovým bodcem)
  const tailSway = Math.sin(time * (s.isMoving ? 8 : 4.5)) * (s.isMoving ? 10 : 5);
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.quadraticCurveTo(-26, 17 + tailSway, -33, 8 + tailSway * 0.8);
  ctx.stroke();

  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.quadraticCurveTo(-26, 17 + tailSway, -33, 8 + tailSway * 0.8);
  ctx.stroke();

  // Crimson devil tail spade barb
  const tipX = -33;
  const tipY = 8 + tailSway * 0.8;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(tipX + 1, tipY - 5.5);
  ctx.lineTo(tipX - 6.5, tipY);
  ctx.lineTo(tipX + 1, tipY + 5.5);
  ctx.lineTo(tipX - 1.5, tipY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Sturdy Miller Legs & Flour-Dusted Boots (s přezkami, klidový postoj vs. chůze)
  const legStride = s.stride * 5.2;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.8 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.8 : 0;

  const drawMillerLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const bx = lx + stepX * 0.5;
    const by = 12 - liftY * 0.5;
    // Breeches
    ctx.fillStyle = isBack ? '#3F3F46' : '#52525B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    safeRoundRect(ctx, bx - 4, by, 8.2, 8.5, 2.0);
    ctx.fill();
    ctx.stroke();

    // Leather boot
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    safeRoundRect(ctx, bx - 4.2, by + 6.5, 8.6, 6.5, 1.8);
    ctx.fill();
    ctx.stroke();

    // Boot shoe & flour-dusted toe
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.ellipse(bx + 1.5, by + 13, 6.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F3F4F6';
    ctx.beginPath();
    ctx.ellipse(bx + 3.5, by + 12.6, 3.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brass boot buckle
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(bx - 1.2, by + 7.5, 3.5, 2.6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawMillerLeg(-7.5, legStride, leg1Lift, true);
  drawMillerLeg(6.5, -legStride, leg2Lift, false);

  // 5. Rotund Flour-Dusted Body, Folk Waistcoat & Patched Baker's Apron
  // Base linen shirt body
  ctx.fillStyle = '#E7E5E4';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18.5, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cobalt-blue miller's waistcoat (3-tier gouache)
  ctx.fillStyle = '#1E3A8A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-12.5, -10.5);
  ctx.lineTo(-16.5, 8.5);
  ctx.lineTo(16.5, 8.5);
  ctx.lineTo(12.5, -10.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#2563EB';
  ctx.beginPath();
  ctx.moveTo(-10.5, -9.5);
  ctx.lineTo(-14.0, 7.2);
  ctx.lineTo(14.0, 7.2);
  ctx.lineTo(10.5, -9.5);
  ctx.closePath();
  ctx.fill();

  // Red folk piping along waistcoat edges
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2.5, -10);
  ctx.lineTo(-2.5, 0);
  ctx.moveTo(2.5, -10);
  ctx.lineTo(2.5, 0);
  ctx.stroke();

  // Brass waistcoat buttons
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  for (const by of [-6.5, -3.0]) {
    ctx.beginPath();
    ctx.arc(0, by, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // White floury baker's apron (Pomoučněná zástěra se záplatou a úvazem)
  ctx.fillStyle = '#E5E7EB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -11, -1.5, 22, 16.5, 2.8);
  ctx.fill();
  ctx.stroke();

  // Apron front highlight
  ctx.fillStyle = '#F9FAFB';
  ctx.beginPath();
  safeRoundRect(ctx, -9, 0, 17, 13.5, 2.0);
  ctx.fill();

  // Apron waist tie string
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-15.5, -1.5);
  ctx.lineTo(15.5, -1.5);
  ctx.stroke();

  // Stitched burlap patch on apron corner
  ctx.fillStyle = '#D6D3D1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, -8.5, 6.5, 6.0, 5.5, 1.2);
  ctx.fill();
  ctx.stroke();

  // Flour dust smudges on apron & waistcoat
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-3.5, 3.2, 3.2, 0, Math.PI * 2);
  ctx.arc(4.5, 7.5, 3.8, 0, Math.PI * 2);
  ctx.arc(1.0, 11.0, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // 6. Left Articulated Arm in Rolled-Up Linen Sleeve
  drawArticulatedArm2D(
    ctx,
    -13,
    -5,
    -20,
    2,
    -14,
    8,
    6.4,
    5.4,
    '#F9FAFB',
    '#D1D5DB',
    '#FFFFFF',
    '#E5E7EB'
  );
  drawGrippingHand2D(ctx, -14, 8, 0.35, '#FDE047', '#EAB308', 3.4);

  // 7. Expressive Miller Head, Clay Pipe & Nightcap Pierced by Devil Horn
  ctx.save();
  ctx.translate(0, -18.5);

  // 3-Tier Gouache Fleshy Face
  ctx.fillStyle = enraged ? '#F87171' : '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 12.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = enraged ? '#FCA5A5' : '#FDE047';
  ctx.beginPath();
  ctx.arc(-0.6, -0.6, 11.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FEF9C3';
  ctx.beginPath();
  ctx.ellipse(-3.5, -4.5, 5.5, 3.8, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Rosy tavern cheeks & flour smudge on cheek
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.arc(-6.8, 2.2, 3.4, 0, Math.PI * 2);
  ctx.arc(6.8, 2.2, 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-5.2, 0.8, 3.0, 1.6, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered Ladovské eyes with brown irises, saccadic pupils & bushy brows
  const millerBrowTilt = enraged || s.isAttacking ? 0.28 : -0.08;
  drawLadaExpressiveEye2D(
    ctx,
    -4.5,
    -3.2,
    3.4,
    3.2,
    '#FFFDF7',
    '#78350F',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.65,
    s.eyeSquint,
    '#78350F',
    millerBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.5,
    -3.2,
    3.4,
    3.2,
    '#FFFDF7',
    '#78350F',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.65,
    s.eyeSquint,
    '#78350F',
    -millerBrowTilt,
    s.browLift
  );

  // Broad bushy brown miller's mustache dusted with flour
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-9.5, 3.2);
  ctx.quadraticCurveTo(-14.5, 8.5, -4.2, 7.2);
  ctx.quadraticCurveTo(0, 4.5, 4.2, 7.2);
  ctx.quadraticCurveTo(14.5, 8.5, 9.5, 3.2);
  ctx.quadraticCurveTo(0, 1.0, -9.5, 3.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bulbous red potato nose with highlight
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0.8, 3.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(-1.0, -0.3, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Clay tobacco pipe in mouth corner (Hliněná fajfka s žhnoucím uhlíkem a dýmem)
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.65;
  ctx.beginPath();
  ctx.moveTo(4.8, 5.2);
  ctx.lineTo(15.5, 7.2);
  ctx.lineTo(18.0, 2.5);
  ctx.lineTo(14.5, 2.2);
  ctx.lineTo(13.0, 5.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(16.2, 2.3, 1.6, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFlatGouacheSmokeLobe(ctx, 20.0, -0.5 + flourPuff * 0.4, 3.8);
  drawFlatGouacheSmokeLobe(ctx, 24.5, -4.5 - flourPuff * 0.3, 2.8);

  // White Miller's Nightcap with Tassel & Sharp Black Devil Horn (Mlynářská čapka s rohem)
  ctx.fillStyle = '#E5E7EB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-12.5, -6.8);
  ctx.quadraticCurveTo(-16.5, -24.5, 0, -22.5);
  ctx.quadraticCurveTo(16.5, -18.5, 12.5, -6.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner cap highlight & rolled brim
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  safeRoundRect(ctx, -13.0, -9.5, 26.0, 4.2, 2.0);
  ctx.fill();
  ctx.stroke();

  // Drooping cap tail with fluffy pompon
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(2, -21);
  ctx.quadraticCurveTo(16, -26, 20.5, -17.5);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(21.2, -16.8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sharp curved black devil horn bursting through the white cap!
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-5.0, -18.0);
  ctx.quadraticCurveTo(-15.0, -30.5, -8.5, -35.0);
  ctx.quadraticCurveTo(-2.0, -27.0, 1.8, -18.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horn ridges & specular highlight
  ctx.strokeStyle = '#52525B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6.5, -22);
  ctx.lineTo(-2.0, -21);
  ctx.moveTo(-8.0, -26);
  ctx.lineTo(-4.0, -25);
  ctx.stroke();

  if (enraged || s.isAttacking) {
    drawFuriantSteamPuffs(ctx, 0, -24, time, enraged ? 1.3 : 0.85);
  }

  ctx.restore();

  // 8. Right Articulated Arm & Long Wooden Baker's Peel / Flour Shovel (Sázecí lopata s moukou)
  const paddleSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.82 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.2
    : Math.sin(time * 3.0) * 0.07;

  ctx.save();
  ctx.translate(12, -3);
  ctx.rotate(paddleSwing);

  const rElbowX = 6;
  const rElbowY = 5.5;
  const rWristX = 14.5;
  const rWristY = 1.2;

  // Articulated arm in rolled-up white linen sleeve
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.6,
    5.6,
    '#F9FAFB',
    '#D1D5DB',
    '#FFFFFF',
    '#E5E7EB'
  );

  // Baker's wooden peel shaft & blade held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Wooden shaft (3-tier wood)
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -6, -2.1, 30, 4.2, 1.5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.fillRect(-4, -1.2, 26, 1.8);

  // Wide flat baker's peel blade (Lopata)
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  safeRoundRect(ctx, 22, -8.5, 15.5, 17, 3.2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  safeRoundRect(ctx, 23.5, -6.8, 12.5, 13.6, 2.2);
  ctx.fill();

  // Mound of fresh white flour on shovel blade
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(29.8, -1.5, 5.8, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Flour cloud puff flying off shovel during strike
  if (s.isStrike || s.isWindup) {
    drawFlatGouacheSmokeLobe(ctx, 37, -6, 4.2, '#F3F4F6', '#FFFFFF', '#FFFFFF', 1.8);
  }

  ctx.restore();

  // 4-fingered miller hand gripping the peel handle at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#FDE047', '#EAB308', 3.7);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. BEZHLAVÝ RYTÍŘ (Furiantský rytíř v plátové zbroji s přilbicí v podpaží)
//    ADR 0054 & ADR 0055: Mobilní postoj BEZ pivního korbelu! Pravá obrněná paže
//    se 4-prstou rukavicí svírá těžký meč, levá paže nese přilbici s živýma očima.
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
  const enraged = isEnraged || s.isEnraged;
  const scale = 2.45;
  const capeFlutter = Math.sin(time * (s.isMoving ? 8.5 : 4.2)) * (s.isMoving ? 6.5 : 3.0);

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isStrike) {
    ctx.rotate(0.07);
  } else if (s.isWindup) {
    ctx.rotate(-0.06);
  }

  // 1. Ghostly Night Tavern Shadow
  ctx.save();
  ctx.fillStyle = enraged ? 'rgba(239, 68, 68, 0.28)' : 'rgba(30, 41, 59, 0.34)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Billowing Tattered Red Velvet Cape (Třívrstvý karmínový plášť se sponou)
  ctx.fillStyle = '#7F1D1D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-12, -12);
  ctx.quadraticCurveTo(-28 + capeFlutter, 4, -35 + capeFlutter * 1.15, 24);
  ctx.lineTo(-22 + capeFlutter * 0.9, 27);
  ctx.lineTo(-18 + capeFlutter * 0.7, 23);
  ctx.lineTo(-13 + capeFlutter * 0.5, 27);
  ctx.quadraticCurveTo(-12, 11, -3, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Outer crimson cape fold highlight
  ctx.fillStyle = enraged ? '#DC2626' : '#B91C1C';
  ctx.beginPath();
  ctx.moveTo(-11, -11);
  ctx.quadraticCurveTo(-24 + capeFlutter * 0.9, 3, -29 + capeFlutter, 22);
  ctx.lineTo(-21 + capeFlutter * 0.8, 24);
  ctx.quadraticCurveTo(-14, 9, -5, -6);
  ctx.closePath();
  ctx.fill();

  // 3. Articulated Plate Greaves, Knee Cops & Riveted Sabatons (Plátové nohy a škorně)
  const legStep = s.stride * 5.0;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.8 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.8 : 0;

  const drawArmoredLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 11 - liftY * 0.5;
    const fy = 24 - liftY;

    // Steel greave (holeň)
    ctx.fillStyle = isBack ? '#64748B' : '#94A3B8';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 4, ky, 8.2, 13, 2.0);
    ctx.fill();
    ctx.stroke();

    // Specular steel stripe
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(kx - 1.8, ky + 1.5, 2.0, 10);

    // Iron knee cop (nákoleník s nýty)
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(kx, ky, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Riveted sabaton (železný škorňový střevíc s ostruhou)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    safeRoundRect(ctx, kx - 5, fy, 11.8, 4.6, 2.0);
    ctx.fill();
    ctx.stroke();

    // Golden spur at heel (ostruha)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(kx - 5, fy + 2.2);
    ctx.lineTo(kx - 8, fy + 2.2);
    ctx.stroke();
    ctx.restore();
  };

  drawArmoredLeg(-8, legStep, leg1Lift, true);
  drawArmoredLeg(7, -legStep, leg2Lift, false);

  // 4. Archaic Steel Breastplate with Hrusice Heraldic Crest (Třívrstvý kyrys a erb)
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18.5, 19.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mid-tone polished steel torso
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 16.2, 17.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upper-left specular steel gleam
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(-6, -6, 7.5, 5.2, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // Knight's leather waist belt with brass buckle
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, -17.5, 8.5, 35, 4.2, 1.5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  safeRoundRect(ctx, -3.2, 7.8, 6.4, 5.6, 1.2);
  ctx.fill();
  ctx.stroke();

  // Hrusice Red & White Heraldic Crest on Breastplate (Znak Hlásky)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-6.5, -8.5);
  ctx.lineTo(6.5, -8.5);
  ctx.lineTo(6.5, 1.5);
  ctx.lineTo(0, 6.8);
  ctx.lineTo(-6.5, 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -8.5);
  ctx.lineTo(6.5, -8.5);
  ctx.lineTo(6.5, 1.5);
  ctx.lineTo(0, 6.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden heraldic cross on shield
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(0, -7.2);
  ctx.lineTo(0, 4.8);
  ctx.moveTo(-4.5, -2.8);
  ctx.lineTo(4.5, -2.8);
  ctx.stroke();

  // 5. Neck: Pleated Ruff Collar & Smoking Hollow Neck Opening (Dýmající otvor bez hlavy)
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -14.5, 10.8, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pleat lines on ruff collar
  ctx.lineWidth = 1.2;
  for (let p = -7.5; p <= 7.5; p += 3.0) {
    ctx.beginPath();
    ctx.moveTo(p * 0.6, -14.5);
    ctx.lineTo(p, -10.2);
    ctx.stroke();
  }

  // Hollow neck opening
  ctx.fillStyle = '#0F172A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -14.8, 6.2, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Comical ghost smoke puffs wafting from headless collar
  drawFlatGouacheSmokeLobe(ctx, 0, -20.5 + Math.sin(time * 4) * 1.8, 4.2);
  if (enraged || s.isAttacking) {
    drawFuriantSteamPuffs(ctx, 0, -18, time, enraged ? 1.3 : 0.9);
  }

  // 6. Left Armored Arm Tucking Severed Great-Helm Under Elbow (Přilbice v podpaží s živou mimikou)
  ctx.save();
  ctx.translate(-12, -4);

  // Armored pauldron at left shoulder
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -3, 5.5, Math.PI * 0.6, Math.PI * 2.1);
  ctx.fill();
  ctx.stroke();

  // Articulated left arm cradling the helmet
  drawArticulatedArm2D(
    ctx,
    0,
    -3,
    -11,
    3,
    -4,
    11,
    6.2,
    5.4,
    '#94A3B8',
    '#475569',
    '#E2E8F0',
    '#64748B'
  );

  // Severed Armored Great-Helm Held Under Arm (Sňatá přilbice s očima, nosem a pavím perem)
  ctx.save();
  ctx.translate(-7.5, 5.5);
  ctx.rotate(Math.sin(time * 3.5) * 0.05);

  // Great-helm steel shell (3-tier gouache)
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  safeRoundRect(ctx, -8.5, -12.5, 17, 20.5, 4.2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  safeRoundRect(ctx, -7.0, -11.0, 12.5, 17.5, 3.2);
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(-5.5, -9.5, 3.0, 14.0);

  // Brass trim band & breathing holes on lower helm
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-8.5, 2.5, 17, 2.4);
  ctx.fill();
  ctx.stroke();

  // Dark Helmet Visor Slit (Štěrbina hledí)
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  safeRoundRect(ctx, -6.8, -6.8, 13.6, 5.4, 1.4);
  ctx.fill();
  ctx.stroke();

  // Lively multi-layered eyes peeking out through the dark visor slit!
  const helmBlink = s.eyeSquint > 0.45;
  if (!helmBlink) {
    for (const ex of [-3.0, 3.0]) {
      // Sclera
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(ex, -4.1, 2.0, 0, Math.PI * 2);
      ctx.fill();
      // Iris & Saccadic Pupil
      ctx.fillStyle = enraged ? '#DC2626' : '#0284C7';
      ctx.beginPath();
      ctx.arc(ex + s.pupilShiftX * 0.45, -4.1 + s.pupilShiftY * 0.35, 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = HOSPODA_INK;
      ctx.beginPath();
      ctx.arc(ex + s.pupilShiftX * 0.45, -4.1 + s.pupilShiftY * 0.35, 0.75, 0, Math.PI * 2);
      ctx.fill();
      // White catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 0.5, -4.6, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4.8, -4.1);
    ctx.lineTo(-1.2, -4.1);
    ctx.moveTo(1.2, -4.1);
    ctx.lineTo(4.8, -4.1);
    ctx.stroke();
  }

  // Expressive armored brow ridge above visor
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-6.5, -7.8 + (enraged || s.isAttacking ? 1.2 : 0));
  ctx.lineTo(0, -6.6);
  ctx.lineTo(6.5, -7.8 + (enraged || s.isAttacking ? 1.2 : 0));
  ctx.stroke();

  // Rosy red nose tip sticking out beneath the visor slit
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -0.4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FCA5A5';
  ctx.beginPath();
  ctx.arc(-0.7, -1.1, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Proud peacock feather plume on helmet crest (Paví pero s okem)
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -12.5);
  ctx.quadraticCurveTo(-5, -23, -11.5, -27.5);
  ctx.stroke();

  ctx.fillStyle = '#10B981';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-11.5, -27.5, 4.8, 3.0, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.arc(-11.5, -27.5, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-11.5, -27.5, 1.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Left 4-fingered steel gauntlet holding the bottom rim of the helmet
  drawGrippingHand2D(ctx, -4, 11, -0.25, '#94A3B8', '#475569', 3.6);
  ctx.restore();

  // 7. Right Armored Arm & Heavy Broadsword (Pevný 4-prstý úchop těžkého meče, žádný korbel!)
  const swordSwing = s.isStrike
    ? 1.05 * (1 - s.strikeProgress * 0.3)
    : s.isWindup
    ? -0.85 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.18
    : Math.sin(time * 2.8) * 0.06;

  ctx.save();
  ctx.translate(13.5, -6);
  ctx.rotate(swordSwing);

  const rElbowX = 6.5;
  const rElbowY = 4.5;
  const rWristX = 15.0;
  const rWristY = 0.5;

  // Right shoulder pauldron
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -1, 5.5, -Math.PI * 0.9, Math.PI * 0.4);
  ctx.fill();
  ctx.stroke();

  // Articulated 2-jointed steel arm
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.6,
    5.8,
    '#94A3B8',
    '#475569',
    '#E2E8F0',
    '#64748B'
  );

  // Heavy steel broadsword held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Leather-wrapped hilt & golden pommel
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  safeRoundRect(ctx, -5.5, -1.8, 8.5, 3.6, 1.2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-6.8, 0, 3.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Broad steel blade with upper specular edge & fuller groove
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(4, -3.2);
  ctx.lineTo(35, -2.8);
  ctx.lineTo(42, 0);
  ctx.lineTo(35, 2.8);
  ctx.lineTo(4, 3.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Upper blade gleam
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.moveTo(4, -2.6);
  ctx.lineTo(35, -2.2);
  ctx.lineTo(40, 0);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  // Central fuller groove (žlábek čepele)
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(32, 0);
  ctx.stroke();

  // Golden cruciform crossguard (záštita)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, 2.2, -8.5, 3.8, 17.0, 1.6);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 4-fingered steel gauntlet gripping the hilt at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#94A3B8', '#475569', 3.7);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. TŘÍHLAVÝ LÍNÝ DRAK (Rozšafný pohádkový drak z Ladových pohádek)
//    ADR 0054 & ADR 0055: Mobilní postoj v červených bačkorách, kostkovaný bryndák,
//    2-kloubové přední tlapy se 4 drápy a 3 nezávislé hlavy s plnou okulární mimikou.
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
  const wingFlap = Math.sin(time * (s.isAttacking ? 11 : 5.2)) * (s.isAttacking ? 0.42 : 0.25);
  const tailWag = Math.sin(time * (s.isMoving ? 7.5 : 3.6)) * (s.isMoving ? 9.0 : 5.5);
  const bellyBreathe = Math.sin(time * 2.8) * 1.8;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.06);
  } else if (s.isStrike) {
    ctx.rotate(0.05);
  } else if (s.isWindup) {
    ctx.rotate(-0.04);
  }

  // 1. Dragon Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 36, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Thick Scaly Dragon Tail with Golden Dorsal Ridges (Dračí ocas s hřebenem)
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.quadraticCurveTo(-38, 15 + tailWag, -49, 6 + tailWag * 1.15);
  ctx.quadraticCurveTo(-36, -1 + tailWag, -14, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.moveTo(-17, 8);
  ctx.quadraticCurveTo(-35, 12 + tailWag, -45, 5 + tailWag * 1.1);
  ctx.quadraticCurveTo(-34, 1 + tailWag, -15, 3);
  ctx.closePath();
  ctx.fill();

  // Golden triangular spine ridges on tail
  ctx.fillStyle = '#EAB308';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  for (let t = 0; t < 4; t++) {
    const tx = -22 - t * 6.8;
    const ty = 4.5 + tailWag * (0.28 + t * 0.2);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 3.2, ty - 6.2);
    ctx.lineTo(tx - 6.2, ty + 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Far Bat Wing (Zadní netopýří křidélko s drápkem)
  ctx.save();
  ctx.translate(-9, -12);
  ctx.rotate(-0.22 + wingFlap);
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-15, -23);
  ctx.quadraticCurveTo(-9, -17, -6, -18);
  ctx.lineTo(0, -24);
  ctx.quadraticCurveTo(2, -17, 4, -16);
  ctx.lineTo(10, -20);
  ctx.lineTo(6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Chubby Green Legs Shod in Red Felt Tavern Slippers (Nohy v červených bačkorách)
  const legStep = s.stride * 4.8;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.6 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.6 : 0;

  const drawDragonLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 12 - liftY * 0.5;
    const fy = 22.5 - liftY;

    // Chubby scaly leg
    ctx.fillStyle = isBack ? '#14532D' : '#166534';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 5.2, ky, 10.5, 12.5, 3.0);
    ctx.fill();
    ctx.stroke();

    // Red felt tavern slipper (Červená domácí bačkora s bílým lemem a bambulkou)
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 6.5, fy, 14.5, 5.8, 2.8);
    ctx.fill();
    ctx.stroke();

    // White felt collar & pompon on slipper toe
    ctx.fillStyle = '#FFFDF7';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 5.5, fy - 1.2, 10.5, 2.4, 1.0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(kx + 6.8, fy + 1.2, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawDragonLeg(-9, legStep, leg1Lift, true);
  drawDragonLeg(9, -legStep, leg2Lift, false);

  // 5. Giant Pear-Shaped Potbelly with Ladovské Spots & Checkered Tavern Bib
  // Base 3-tier green dragon body
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 21 + bellyBreathe * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.ellipse(-1, 1, 21.5, 18.8 + bellyBreathe * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellow scaly underbelly with horizontal belly plates
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(2, 6, 17, 14.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 1.3;
  for (const py of [0, 5, 10, 15]) {
    ctx.beginPath();
    ctx.arc(2, py - 3, 13 - Math.abs(py - 7) * 0.45, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }

  // Authentic Ladovské brown spots on dragon flanks
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  for (const [sx, sy, sr] of [
    [-15, 1, 2.4],
    [-12, 8, 2.8],
    [-16, 13, 2.0],
    [15, 3, 2.3],
    [13, 11, 2.5],
  ]) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Red & White Checkered Tavern Bib around Necks (Hospodský kostkovaný bryndák)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-11, -10.5);
  ctx.lineTo(11, -10.5);
  ctx.lineTo(8, 4.5);
  ctx.quadraticCurveTo(0, 7.5, -8, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(-7.5, -8.5, 4.2, 4.2);
  ctx.fillRect(0.8, -8.5, 4.2, 4.2);
  ctx.fillRect(-3.4, -4.3, 4.2, 4.2);
  ctx.fillRect(4.8, -4.3, 3.2, 4.2);
  ctx.fillRect(-6.8, -0.1, 3.6, 3.6);
  ctx.fillRect(1.0, -0.1, 3.8, 3.6);

  // Near Wing
  ctx.save();
  ctx.translate(6, -8);
  ctx.rotate(0.2 - wingFlap);
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, -21);
  ctx.quadraticCurveTo(10, -15, 8, -16);
  ctx.lineTo(2, -22);
  ctx.quadraticCurveTo(-1, -15, -2, -14);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 6. Articulated Scaly Forelimbs with 4 Claws (Přední článkované tlapy se 4 drápy)
  const clawLunge = s.isStrike ? 4.5 : s.isWindup ? -3.5 : 0;
  // Left forelimb
  drawArticulatedArm2D(
    ctx,
    -15,
    -2,
    -21,
    4,
    -16 + clawLunge * 0.6,
    9,
    5.8,
    5.0,
    '#16A34A',
    '#14532D',
    '#4ADE80'
  );
  drawGrippingHand2D(
    ctx,
    -16 + clawLunge * 0.6,
    9,
    0.35,
    '#22C55E',
    '#15803D',
    3.3,
    '#FEF08A'
  );

  // Right forelimb
  drawArticulatedArm2D(
    ctx,
    14,
    -2,
    20,
    4,
    17 + clawLunge,
    8.5,
    5.8,
    5.0,
    '#16A34A',
    '#14532D',
    '#4ADE80'
  );
  drawGrippingHand2D(
    ctx,
    17 + clawLunge,
    8.5,
    0.2,
    '#22C55E',
    '#15803D',
    3.4,
    '#FEF08A'
  );

  // 7. THREE DISTINCT HEADS (Tři nezávislé dračí hlavy s plnou okulární mimikou)

  // --- A. LEFT HEAD: Lazy & Sleepy (Ospale přivírá víčka a bafá z fajfky) ---
  ctx.save();
  ctx.translate(-14, -14);
  const leftBob = Math.sin(time * 3.0 + 1.0) * 1.8;
  ctx.translate(0, leftBob);

  // Curved scaly neck
  ctx.fillStyle = '#15803D';
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
  ctx.ellipse(-8.5, -18.5, 9.5, 7.5, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden horns
  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-12, -23.5);
  ctx.lineTo(-17.5, -30);
  ctx.lineTo(-8.5, -25.5);
  ctx.closePath();
  ctx.moveTo(-6, -24.5);
  ctx.lineTo(-9, -31);
  ctx.lineTo(-3, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Multi-layered sleepy eyes (high squint)
  drawLadaExpressiveEye2D(
    ctx,
    -11.0,
    -19.5,
    2.6,
    2.4,
    '#FEF08A',
    '#15803D',
    s.pupilShiftX * 0.4,
    0.3,
    0.68,
    '#14532D',
    -0.15,
    0.2
  );
  drawLadaExpressiveEye2D(
    ctx,
    -5.2,
    -19.2,
    2.6,
    2.4,
    '#FEF08A',
    '#15803D',
    s.pupilShiftX * 0.4,
    0.3,
    0.68,
    '#14532D',
    0.15,
    0.2
  );

  // Rosy cheek & nostrils
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-13, -16, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Clay pipe in sleepy snout puffing flat gouache smoke lobes
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-13, -14.5);
  ctx.lineTo(-22, -13.5);
  ctx.lineTo(-23.5, -17.5);
  ctx.lineTo(-20.5, -17.5);
  ctx.lineTo(-19.5, -15.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawFlatGouacheSmokeLobe(ctx, -24.5, -20.5 + leftBob * 0.4, 3.2);

  ctx.restore();

  // --- B. MIDDLE HEAD: Jovial & Hungry (Vyhlíží buchtu, živé oči a úsměv s jazykem) ---
  ctx.save();
  ctx.translate(0, -18);
  const midBob = Math.sin(time * 3.5) * 2.2;
  ctx.translate(0, midBob);

  // Upright neck
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  safeRoundRect(ctx, -5.5, -1, 11, 15, 2.5);
  ctx.fill();
  ctx.stroke();

  // Broad friendly dragon head (3-tier gouache)
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(0, -8.5, 11.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.ellipse(-1, -9.5, 9.2, 7.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Twin golden horns
  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-6.5, -15.5);
  ctx.lineTo(-11, -25);
  ctx.lineTo(-2, -17.5);
  ctx.closePath();
  ctx.moveTo(6.5, -15.5);
  ctx.lineTo(11, -25);
  ctx.lineTo(2, -17.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Multi-layered lively eyes with orange irises & saccadic pupils
  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -10.5,
    3.2,
    3.2,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#14532D',
    -0.1,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -10.5,
    3.2,
    3.2,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#14532D',
    0.1,
    s.browLift
  );

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.52)';
  ctx.beginPath();
  ctx.arc(-7.5, -5.2, 2.6, 0, Math.PI * 2);
  ctx.arc(7.5, -5.2, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Gaping friendly toothy mouth with hanging pink tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -3.5, 6.4, 0.08, Math.PI - 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White dragon fangs
  ctx.fillStyle = '#FEF3C7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4.5, -3.2);
  ctx.lineTo(-3.2, -0.5);
  ctx.lineTo(-1.8, -3.2);
  ctx.moveTo(1.8, -3.2);
  ctx.lineTo(3.2, -0.5);
  ctx.lineTo(4.5, -3.2);
  ctx.fill();
  ctx.stroke();

  // Pink tongue hanging out
  ctx.fillStyle = '#F43F5E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 1.2, 3.4, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // --- C. RIGHT HEAD: Comically Furious / Spitting Sparks (Furiantsky se mračí a prská) ---
  ctx.save();
  ctx.translate(14, -14);
  const rightBob = Math.sin(time * 3.2 + 2.0) * 2.0;
  ctx.translate(0, rightBob);

  // Forward-curving neck
  ctx.fillStyle = '#15803D';
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

  // Furious head (flushes red when enraged or attacking)
  ctx.fillStyle = enraged || s.isAttacking ? '#EF4444' : '#22C55E';
  ctx.beginPath();
  ctx.ellipse(10.5, -16.5, 9.5, 7.5, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sharp golden horns
  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -22.5);
  ctx.lineTo(19.5, -29);
  ctx.lineTo(7, -24.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Multi-layered furious glaring eyes with sharp V-brows
  drawLadaExpressiveEye2D(
    ctx,
    7.5,
    -17.8,
    2.7,
    2.7,
    '#FEF08A',
    '#DC2626',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.6,
    0.25,
    '#14532D',
    0.35,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    13.2,
    -17.2,
    2.7,
    2.7,
    '#FEF08A',
    '#DC2626',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.6,
    0.25,
    '#14532D',
    -0.35,
    s.browLift
  );

  // Snarling jaw with fangs
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.ellipse(11.5, -12.2, 5.2, 2.4, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snorting smoke & fiery sparks from nostrils
  drawFuriantSteamPuffs(ctx, 16, -18, time, enraged || s.isAttacking ? 1.25 : 0.85);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. PAN ZAJÍC Z BŘEZOVÉHO HÁJE (Rozšafný velikonoční zajíc gentleman)
//    ADR 0054 & ADR 0055: Klidový postoj bez poskakování při vx === 0, nůše s kraslicemi,
//    kamaše s knoflíky, myslivecký frak, 2-kloubové paže a 4-prstý úchop mrkvové hůlky.
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
  const earTwitch = Math.sin(time * (s.isMoving ? 12 : 5.5)) * (s.isMoving ? 0.12 : 0.05);
  const whiskerWiggle = Math.sin(time * 14) * 1.4;
  // Hop only when actively walking! In idle (vx === 0), feet stay firmly on the ground.
  const hopBob = s.isMoving ? Math.abs(Math.sin(time * 9)) * 3.8 : 0;

  ctx.save();
  ctx.translate(x, y - s.bob - hopBob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isStrike) {
    ctx.rotate(0.06);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Shadow on Meadow Grass
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 26 + hopBob, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Woven Wicker Backpack Basket of Painted Easter Eggs (Proutěná nůše s kraslicemi)
  ctx.save();
  ctx.translate(-14, -2);
  ctx.rotate(-0.1);

  // Wicker basket body (3-tier brown wicker)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(2, 14);
  ctx.lineTo(-14, 10);
  ctx.lineTo(-18.5, -14);
  ctx.lineTo(4.5, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(1, 12.5);
  ctx.lineTo(-12.5, 9);
  ctx.lineTo(-16.5, -12.5);
  ctx.lineTo(3, -11);
  ctx.closePath();
  ctx.fill();

  // Wicker horizontal & vertical weave lines
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.4;
  for (let l = -9; l <= 9; l += 4.5) {
    ctx.beginPath();
    ctx.moveTo(-16.5, l);
    ctx.lineTo(3, l + 1.8);
    ctx.stroke();
  }

  // Colorful painted folk Easter eggs (kraslice s proužky a tečkami)
  const eggs: Array<[number, number, string, string]> = [
    [-12.5, -15.5, '#EF4444', '#FEF08A'],
    [-6.5, -17.5, '#FBBF24', '#DC2626'],
    [-0.5, -15.2, '#38BDF8', '#FFFFFF'],
    [-9.0, -12.2, '#22C55E', '#FEF08A'],
    [-3.2, -12.5, '#A855F7', '#FDE047'],
  ];
  for (const [ex, ey, col, accent] of eggs) {
    ctx.fillStyle = col;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 4.2, 5.4, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Folk stripe & dot on each egg
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(ex - 0.5, ey - 1.0, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Fluffy white cotton tail peeking behind coattails (Zaječí pírko)
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-15.5, 11, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Stately Hare Hindlegs & Buttoned White Spats (Zadní běhy v bílých kamaších)
  const legHop = s.stride * 4.8;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.5 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.5 : 0;

  const drawHareLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 11.5 - liftY * 0.5;
    const fy = 24.5 - liftY;

    // Furred upper leg
    ctx.fillStyle = isBack ? '#92400E' : '#B45309';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.6, ky, 7.2, 7.5, 2.0);
    ctx.fill();
    ctx.stroke();

    // Dapper white spat (bílá kamaše / psí dečka s černými knoflíčky)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.8, ky + 5.5, 7.6, 6.8, 1.8);
    ctx.fill();
    ctx.stroke();

    // Buttons on spat side
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(kx + 1.8, ky + 7.5, 0.8, 0, Math.PI * 2);
    ctx.arc(kx + 1.8, ky + 10.0, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Long hare foot & toes
    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.ellipse(kx + 1.8, fy, 6.4, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawHareLeg(-7.5, legHop, leg1Lift, true);
  drawHareLeg(5.5, -legHop, leg2Lift, false);

  // 4. Gentleman's Hunter-Green Tweed Frock Coat & Ochre Waistcoat (Myslivecký frak a vesta)
  // Coattails behind legs
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(-19, 17);
  ctx.lineTo(-7, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main frock coat body (3-tier green tweed)
  ctx.fillStyle = '#14532D';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16.5, 18.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.ellipse(-0.8, -0.8, 14.8, 16.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ochre waistcoat (okrová sváteční vesta s kapsičkou)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-8.5, -8.5);
  ctx.lineTo(-12.2, 7.5);
  ctx.lineTo(12.2, 7.5);
  ctx.lineTo(8.5, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red piping along frock coat lapels
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8.5, -8.5);
  ctx.lineTo(-12.2, 7.5);
  ctx.moveTo(8.5, -8.5);
  ctx.lineTo(12.2, 7.5);
  ctx.stroke();

  // Leather backpack straps crossing chest
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-11, -10);
  ctx.lineTo(-9, 6);
  ctx.stroke();

  // Golden pocket watch chain across waistcoat
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(1.5, 1.5, 5.5, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Crisp white shirt collar & red polka-dot bow tie (Červený puntíkovaný motýlek)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(0, -5.5);
  ctx.lineTo(6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-6.8, -9.2);
  ctx.lineTo(6.8, -5.2);
  ctx.lineTo(6.8, -9.2);
  ctx.lineTo(-6.8, -5.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White polka dots & center knot on bow tie
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4.2, -7.2, 0.8, 0, Math.PI * 2);
  ctx.arc(4.2, -7.2, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath();
  ctx.arc(0, -7.2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Left Articulated Arm in Tweed Sleeve with 4-Fingered White Paw
  drawArticulatedArm2D(
    ctx,
    -12,
    -4,
    -18,
    2,
    -11,
    5,
    5.8,
    4.8,
    '#15803D',
    '#14532D',
    '#22C55E',
    '#FFFFFF'
  );
  drawGrippingHand2D(ctx, -11, 5, 0.25, '#FFFBEB', '#E7E5E4', 3.2);

  // 6. Expressive Hare Head, Wire Spectacles, Buck Teeth & Asymmetric Ears
  ctx.save();
  ctx.translate(0, -18.5);

  // Long expressive hare ears (Left ear comically bent, Right ear standing tall!)
  // Left ear (bent downward in folksy charm)
  ctx.save();
  ctx.translate(-5.2, -8.5);
  ctx.rotate(-0.32 + earTwitch);
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-8, -15, -13, -21);
  ctx.quadraticCurveTo(-18, -17, -14, -10);
  ctx.quadraticCurveTo(-9, -12, -5.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.ellipse(-6.5, -11.5, 2.2, 6.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right ear (standing tall and proud)
  ctx.save();
  ctx.translate(5.2, -8.5);
  ctx.rotate(0.14 - earTwitch);
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(3.5, -18, 4.8, -28.5);
  ctx.quadraticCurveTo(10.5, -18, 6.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.ellipse(4.0, -13.5, 2.4, 8.8, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3-Tier Velvet Brown Hare Head
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.arc(-0.5, -0.5, 10.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(-3, -4.5, 5.2, 3.4, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.48)';
  ctx.beginPath();
  ctx.arc(-6.8, 1.5, 2.8, 0, Math.PI * 2);
  ctx.arc(6.8, 1.5, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered expressive eyes behind brass spectacles
  const hareBrowTilt = s.isAttacking || s.isEnraged ? 0.25 : -0.08;
  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -3.2,
    3.2,
    3.2,
    '#FFFDF7',
    '#B45309',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#78350F',
    hareBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -3.2,
    3.2,
    3.2,
    '#FFFDF7',
    '#B45309',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#78350F',
    -hareBrowTilt,
    s.browLift
  );

  // Round brass wire spectacles with glass glint (Kulaté drátěné brejličky)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-4.2, -3.2, 4.3, 0, Math.PI * 2);
  ctx.arc(4.2, -3.2, 4.3, 0, Math.PI * 2);
  ctx.moveTo(-0.1, -3.2);
  ctx.lineTo(0.1, -3.2);
  ctx.stroke();

  // Fluffy double-lobed cream muzzle (Baňatý bílý čumáček)
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-2.6, 3.2, 4.2, 3.2, -0.1, 0, Math.PI * 2);
  ctx.ellipse(2.6, 3.2, 4.2, 3.2, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Two white hare buck teeth (Zaječí hlodáky)
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-2.4, 5.4, 2.3, 3.2);
  ctx.rect(0.1, 5.4, 2.3, 3.2);
  ctx.fill();
  ctx.stroke();

  // Pink triangular hare nose
  ctx.fillStyle = '#F43F5E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 1.2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Twitching whiskers
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(-4.5, 2.8);
  ctx.lineTo(-15.5, 0.8 + whiskerWiggle);
  ctx.moveTo(-4.5, 4.4);
  ctx.lineTo(-14.5, 6.2 - whiskerWiggle);
  ctx.moveTo(4.5, 2.8);
  ctx.lineTo(15.5, 0.8 - whiskerWiggle);
  ctx.moveTo(4.5, 4.4);
  ctx.lineTo(14.5, 6.2 + whiskerWiggle);
  ctx.stroke();

  ctx.restore();

  // 7. Right Articulated Arm & Carrot Walking Cane with Gold Pommel (Karotková hůlka)
  const caneSwing = s.isStrike
    ? 0.92 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.78 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.22
    : Math.sin(time * 2.8) * 0.05;

  ctx.save();
  ctx.translate(11.5, -3.5);
  ctx.rotate(caneSwing);

  const rElbowX = 5.5;
  const rElbowY = 4.5;
  const rWristX = 13.5;
  const rWristY = 0.5;

  // Articulated 2-jointed arm in green tweed sleeve with white cuff
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.8,
    4.8,
    '#15803D',
    '#14532D',
    '#22C55E',
    '#FFFFFF'
  );

  // Carrot walking stick held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Green carrot leaf tuft below golden pommel
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(-4.5, -10);
  ctx.lineTo(0, -8);
  ctx.lineTo(4.5, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tapering orange carrot shaft with horizontal root creases
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2.8, -3.5);
  ctx.lineTo(-1.0, 26.5);
  ctx.lineTo(1.5, 26.5);
  ctx.lineTo(2.8, -3.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.2;
  for (const cy of [3, 9, 15, 21]) {
    ctx.beginPath();
    ctx.moveTo(-1.8, cy);
    ctx.lineTo(1.6, cy);
    ctx.stroke();
  }

  // Golden spherical cane pommel
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(0, -5.8, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF9C3';
  ctx.beginPath();
  ctx.arc(-1.1, -6.9, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4-fingered white hare paw gripping the cane below the pommel at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#FFFBEB', '#E7E5E4', 3.3);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. MORANA, ŠPATNĚ VYNESENÁ SMRTKA (Komicky vzteklá slaměná Morana)
//    ADR 0054 & ADR 0055: Tající loužička s kapkami, slaměná suknice se stuhami,
//    režná košile na břevnu, náhrdelník z výdumků, 4-prstý úchop březového pometla.
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
  const dripWave = Math.sin(time * 5) * 2.5;
  const rageShudder = s.isAttacking || s.isEnraged ? Math.sin(time * 28) * 1.4 : 0;

  ctx.save();
  ctx.translate(x + rageShudder, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.1);
  } else if (s.isStrike) {
    ctx.rotate(0.07);
  } else if (s.isWindup) {
    ctx.rotate(-0.06);
  }

  // 1. Meltwater Puddle Under Dripping Straw Effigy (Loužička tajícího sněhu s ledem)
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 26, 27, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Floating white ice shards in puddle
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-9, 26, 4.2, 1.6, 0.1, 0, Math.PI * 2);
  ctx.ellipse(8, 25.5, 3.5, 1.4, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, -12, 16, 25, time, 1.35, 0.2, 2.0);
  drawRealisticDripCycle2D(ctx, 12, 16, 25, time, 1.35, 0.85, 2.0);
  ctx.restore();

  // 2. Straw Skirt & Folk Ribbons (Slaměná suknice se stuhami, v klidu stojí, při chůzi šustí)
  const skirtSway = s.isMoving ? time * 7.5 : time * 1.8;
  drawStrawBundle2D(ctx, s.stride * 2.0, 4, 28, 22, skirtSway);

  // Straw feet bundles peeking beneath skirt during walk or stance
  const foot1X = -6 + s.stride * 4.5;
  const foot2X = 6 - s.stride * 4.5;
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(foot1X, 25.2, 4.5, 2.0, 0, 0, Math.PI * 2);
  ctx.ellipse(foot2X, 25.2, 4.5, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Colorful folk ribbons hanging from straw waist
  const ribbons = ['#DC2626', '#2563EB', '#F59E0B', '#16A34A'];
  for (let r = 0; r < ribbons.length; r++) {
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 3.2;
    const rx = (r - 1.5) * 6;
    const rWave = Math.sin(time * (s.isMoving ? 8 : 4.5) + r) * (s.isMoving ? 4.5 : 2.2);
    ctx.beginPath();
    ctx.moveTo(rx, 10);
    ctx.quadraticCurveTo(rx + rWave, 18, rx + rWave * 1.3, 25.5);
    ctx.stroke();

    ctx.strokeStyle = ribbons[r];
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(rx, 10);
    ctx.quadraticCurveTo(rx + rWave, 18, rx + rWave * 1.3, 25.5);
    ctx.stroke();
  }

  // 3. Wooden Crossbar & Bleached Torn Linen Chemise (Režná košile na dřevěném břevnu)
  // Wooden crossbar ends protruding from shoulders with rope lashing
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeRoundRect(ctx, -23, -9.5, 9.5, 4.4, 1.2);
  safeRoundRect(ctx, 13.5, -9.5, 9.5, 4.4, 1.2);
  ctx.fill();
  ctx.stroke();

  // Bleached linen chemise body (3-tier gouache)
  ctx.fillStyle = '#D1D5DB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.9;
  ctx.beginPath();
  ctx.moveTo(-14.5, 8.5);
  ctx.lineTo(14.5, 8.5);
  ctx.lineTo(12.5, -10.5);
  ctx.lineTo(-12.5, -10.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F3F4F6';
  ctx.beginPath();
  ctx.moveTo(-12.0, 7.2);
  ctx.lineTo(12.0, 7.2);
  ctx.lineTo(10.5, -9.2);
  ctx.lineTo(-10.5, -9.2);
  ctx.closePath();
  ctx.fill();

  // Patched tear on chemise chest
  ctx.fillStyle = '#9CA3AF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, -8.5, 0.5, 5.5, 4.8, 1.0);
  ctx.fill();
  ctx.stroke();

  // 4. Folk Eggshell Necklace (Náhrdelník z vyfouklých vaječných skořápek - výdumků)
  const eggshells: Array<[number, number, string]> = [
    [-8.5, -7.2, '#FEF3C7'],
    [-4.5, -4.4, '#FEE2E2'],
    [0, -3.2, '#FEF3C7'],
    [4.5, -4.4, '#E0F2FE'],
    [8.5, -7.2, '#FEF3C7'],
  ];
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10.5, -8.5);
  ctx.quadraticCurveTo(0, 0.5, 10.5, -8.5);
  ctx.stroke();

  for (const [ex, ey, col] of eggshells) {
    ctx.fillStyle = col;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.2, 2.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Hollow blow-hole dot on each eggshell
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(ex, ey, 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Left Articulated Straw-and-Linen Arm with 4-Fingered Straw Hand
  drawArticulatedArm2D(
    ctx,
    -13.5,
    -7.0,
    -20.5,
    -1.0,
    -15.5,
    5.5,
    5.6,
    4.6,
    '#E5E7EB',
    '#9CA3AF',
    '#FFFFFF',
    '#EAB308'
  );
  drawGrippingHand2D(ctx, -15.5, 5.5, 0.3, '#FDE047', '#CA8A04', 3.3);

  // 6. Braided Straw Head with Rowan-Berry Wreath, Furious Icy Eyes & Frost Breath
  ctx.save();
  ctx.translate(0, -18.5);

  // Side straw plait tied with a red folk bow (Slaměný cop s mašlí)
  ctx.fillStyle = '#EAB308';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, -1);
  ctx.quadraticCurveTo(-18.5, 9 + dripWave * 0.3, -14.5, 19.5);
  ctx.quadraticCurveTo(-8.5, 13.5, -6.5, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-13.5, 15.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3-Tier Braided Straw Head
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-0.5, -0.5, 10.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.ellipse(-3, -4.5, 5.2, 3.4, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Rowan berry & green leaf wreath on head (Věneček z červených jeřabin)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -6.8, 9.8, Math.PI * 0.82, Math.PI * 2.18);
  ctx.stroke();

  // Green leaves in wreath
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  for (const lx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.ellipse(lx, -9.2 + Math.abs(lx) * 0.15, 3.0, 1.5, lx * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Bright red rowan berry clusters
  ctx.fillStyle = '#DC2626';
  ctx.lineWidth = 1.4;
  for (let b = -8; b <= 8; b += 4) {
    ctx.beginPath();
    ctx.arc(b, -7.8 + Math.abs(b) * 0.18, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Multi-layered icy-blue eyes with furious slanted V-brows
  const moranaBrowTilt = 0.32;
  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -2.2,
    3.2,
    3.0,
    '#E0F2FE',
    '#0284C7',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#78350F',
    moranaBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -2.2,
    3.2,
    3.0,
    '#E0F2FE',
    '#0284C7',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#78350F',
    -moranaBrowTilt,
    s.browLift
  );

  // Stitched straw nose & frosty blue cheeks
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.arc(-6.8, 1.5, 2.5, 0, Math.PI * 2);
  ctx.arc(6.8, 1.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -1.2);
  ctx.lineTo(-1.8, 1.8);
  ctx.lineTo(1.8, 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gaping shivering mouth with icicle teeth & frost breath
  const mouthOpen = s.isAttacking ? 3.8 : 2.8;
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(0, 4.8, 4.8, mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tiny icicle teeth
  ctx.fillStyle = '#BAE6FD';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-2.5, 4.8 - mouthOpen * 0.8);
  ctx.lineTo(-1.5, 4.8);
  ctx.lineTo(-0.5, 4.8 - mouthOpen * 0.8);
  ctx.moveTo(0.5, 4.8 - mouthOpen * 0.8);
  ctx.lineTo(1.5, 4.8);
  ctx.lineTo(2.5, 4.8 - mouthOpen * 0.8);
  ctx.fill();
  ctx.stroke();

  // Frost puffs billowing from mouth
  drawFuriantSteamPuffs(ctx, 0, -2, time, s.isAttacking || s.isEnraged ? 1.2 : 0.85);

  ctx.restore();

  // 7. Right Articulated Arm & Ice-Crusted Birch Broom (Omrzlé březové pometlo)
  const broomSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.8 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.22
    : Math.sin(time * 3.0) * 0.06;

  ctx.save();
  ctx.translate(14.5, -6.5);
  ctx.rotate(broomSwing);

  const rElbowX = 5.5;
  const rElbowY = 4.2;
  const rWristX = 12.5;
  const rWristY = 0.8;

  // Articulated straw-and-linen arm
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.6,
    4.6,
    '#E5E7EB',
    '#9CA3AF',
    '#FFFFFF',
    '#EAB308'
  );

  // Ice-crusted birch broom held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Wooden broom handle
  ctx.fillStyle = '#713F12';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  safeRoundRect(ctx, -2, -26, 4.2, 46, 1.5);
  ctx.fill();
  ctx.stroke();

  // Birch twigs brush head (Březové pometlo s červeným úvazkem a námrazou)
  ctx.fillStyle = '#78350F';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-4.5, -25);
  ctx.lineTo(4.5, -25);
  ctx.lineTo(9.5, -42);
  ctx.lineTo(-9.5, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Twig texture lines & frost crust on broom tips
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.3;
  for (let tx = -6; tx <= 6; tx += 3) {
    ctx.beginPath();
    ctx.moveTo(tx * 0.5, -26);
    ctx.lineTo(tx, -41);
    ctx.stroke();
  }

  // Red wicker binding around broom base
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, -4.8, -28, 9.6, 3.4, 1.2);
  ctx.fill();
  ctx.stroke();

  // Glistening ice crust & spraying water droplets from broom top
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.ellipse(0, -41.5, 8.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    drawWaterDroplet2D(ctx, -5 + i * 5, -45 - (i % 2) * 2.5, 1.8, 1.1, 0);
  }

  ctx.restore();

  // 4-fingered straw hand gripping the broom handle at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#FDE047', '#CA8A04', 3.4);

  ctx.restore();
  ctx.restore();
}


// ---------------------------------------------------------------------------
// 7. STARÁ JEŽIBABA Z MELECHU (Zlomyslná pohádková baba jaga s koštětem)
//    ADR 0054, ADR 0055 & ADR 0056: Mobilní postoj v pruhovaných punčochách a křivých
//    škorních, černý kocour v kapse zástěry, 2-kloubové paže s loketními záplatami,
//    4-prstý úchop březového koštěte a perníčku, plná okulární mimika a bradavice.
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
  const hunchBob = s.isMoving ? Math.sin(time * 9) * 2.2 : Math.sin(time * 2.8) * 0.8;
  const cackleJaw = s.isStrike ? 7.2 : s.isWindup ? 5.8 : s.isEnraged ? 6.0 : 3.2;

  ctx.save();
  ctx.translate(x, y - s.bob - hunchBob * 0.35);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  } else if (s.isStrike) {
    ctx.rotate(0.07);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Shadow on Forest Clearing
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 25, 7.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Striped Stockings & Crooked Upturned Witch Boots (Pruhované punčochy a křivé škorně)
  const wStride = s.stride * 4.8;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.6 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.6 : 0;

  const drawWitchLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 12 - liftY * 0.5;
    const fy = 24 - liftY;

    // Striped stocking
    ctx.fillStyle = isBack ? '#D1D5DB' : '#F3F4F6';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.2, ky, 6.4, 11.5, 1.8);
    ctx.fill();
    ctx.stroke();

    // Red horizontal stocking stripes
    ctx.fillStyle = '#DC2626';
    for (const sy of [2, 5.5, 9]) {
      ctx.fillRect(kx - 2.8, ky + sy, 5.6, 1.6);
    }

    // Crooked witch shoe with upturned pointed toe & brass buckle
    ctx.fillStyle = '#18181B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(kx - 4, fy);
    ctx.lineTo(kx + 5, fy);
    ctx.quadraticCurveTo(kx + 11, fy - 4.5, kx + 9.5, fy - 1.0);
    ctx.lineTo(kx + 4, fy + 2.2);
    ctx.lineTo(kx - 4, fy + 2.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(kx + 0.5, fy - 1.5, 2.8, 2.4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawWitchLeg(-6.5, wStride, leg1Lift, true);
  drawWitchLeg(4.5, -wStride, leg2Lift, false);

  // 3. Layered Folk Floral Skirt & Patched Brown Apron (Květovaná suknice a záplatovaná zástěra)
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.9;
  ctx.beginPath();
  ctx.moveTo(-14, 7.5);
  ctx.lineTo(14, 7.5);
  ctx.lineTo(18.5, 22);
  ctx.lineTo(-18.5, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-12, 8.5);
  ctx.lineTo(12, 8.5);
  ctx.lineTo(15.5, 20.8);
  ctx.lineTo(-15.5, 20.8);
  ctx.closePath();
  ctx.fill();

  // Folk flowers on skirt hem
  drawFolkFlower2D(ctx, -11, 16.5, 3.3, '#F43F5E', '#FBBF24');
  drawFolkFlower2D(ctx, 11, 16.5, 3.3, '#38BDF8', '#FBBF24');

  // Brown patched apron (3-tier gouache)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  safeRoundRect(ctx, -8.5, 6.8, 17, 14.2, 2.2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  safeRoundRect(ctx, -7.0, 8.0, 14, 11.8, 1.6);
  ctx.fill();

  // Cross-stitched ochre patch on apron
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, 1.2, 11.5, 5.2, 5.2, 1.0);
  ctx.fill();
  ctx.stroke();

  // Black cat ("Škubánek") peeking from apron pocket with glowing yellow eyes!
  ctx.fillStyle = '#09090B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-3.5, 8.5, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Cat ears
  ctx.beginPath();
  ctx.moveTo(-6.8, 7.2);
  ctx.lineTo(-7.8, 3.2);
  ctx.lineTo(-4.2, 5.8);
  ctx.moveTo(-2.5, 5.8);
  ctx.lineTo(0.8, 3.2);
  ctx.lineTo(-0.2, 7.2);
  ctx.fill();
  ctx.stroke();
  // Cat eyes & pupils
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-4.8, 8.2, 1.1, 0, Math.PI * 2);
  ctx.arc(-2.0, 8.2, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HOSPODA_INK;
  ctx.fillRect(-5.0, 7.6, 0.4, 1.2);
  ctx.fillRect(-2.2, 7.6, 0.4, 1.2);

  // 4. Hunched Wool Jacket & Fringed Folk Shawl (Shrbený kabátek a vlněný šál)
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.1;
  ctx.beginPath();
  ctx.ellipse(-1.5, -1.5, 16, 16.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(-2.2, -2.2, 13.8, 14.2, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Warm knitted shawl draped over hunched shoulders
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-14, -7);
  ctx.quadraticCurveTo(0, 4, 13, -7);
  ctx.quadraticCurveTo(6, -13, -12, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Left Articulated Arm Holding Gingerbread Heart Lure (Perníkové srdce z chaloupky)
  drawArticulatedArm2D(
    ctx,
    -12,
    -4,
    -19,
    2,
    -13,
    7,
    5.6,
    4.6,
    '#334155',
    '#1E293B',
    '#64748B',
    '#A16207'
  );
  // Gingerbread heart with white icing held in left hand
  ctx.save();
  ctx.translate(-13, 7);
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-2.2, -2.5, 2.8, 0, Math.PI * 2);
  ctx.arc(2.2, -2.5, 2.8, 0, Math.PI * 2);
  ctx.moveTo(-4.8, -1.5);
  ctx.lineTo(0, 4.5);
  ctx.lineTo(4.8, -1.5);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, -1.2, 2.2, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
  drawGrippingHand2D(ctx, -13, 7, 0.25, '#FDE047', '#CA8A04', 3.2, '#1C1917');

  // 6. Crooked Head, Red Polka-Dot Headscarf, Hooked Nose & Wart (Šátek s puntíky, skoba a bradavice)
  ctx.save();
  ctx.translate(1.5, -18);

  // Red polka-dot babushka headscarf tied under chin (Červený šátek s puntíky)
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12.5, -5.5);
  ctx.quadraticCurveTo(-14.5, -22.5, 0, -20.5);
  ctx.quadraticCurveTo(14.5, -22.5, 12.5, -5.5);
  ctx.quadraticCurveTo(0, 10.5, -12.5, -5.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(-10.8, -6.0);
  ctx.quadraticCurveTo(-12.5, -20.0, 0, -18.5);
  ctx.quadraticCurveTo(12.5, -20.0, 10.8, -6.0);
  ctx.quadraticCurveTo(0, 8.5, -10.8, -6.0);
  ctx.closePath();
  ctx.fill();

  // White polka dots on scarf
  ctx.fillStyle = '#FFFFFF';
  for (const [dx, dy] of [
    [-6.5, -14.5],
    [1.5, -16.2],
    [8.2, -12.5],
    [-8.5, -6.5],
    [7.2, -4.5],
  ]) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Knotted scarf tails sticking out under chin
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-2, 7.2);
  ctx.lineTo(-6.5, 12.5);
  ctx.lineTo(0, 9.2);
  ctx.moveTo(2, 7.2);
  ctx.lineTo(6.5, 12.5);
  ctx.lineTo(0, 9.2);
  ctx.fill();
  ctx.stroke();

  // 3-Tier Hag Face inside scarf
  ctx.fillStyle = '#EAB308';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.arc(0, -3.8, 9.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-0.4, -4.2, 8.0, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered sly squinting eyes with green irises & saccadic pupils
  const witchBrowTilt = s.isAttacking || s.isEnraged ? 0.3 : 0.18;
  drawLadaExpressiveEye2D(
    ctx,
    -3.2,
    -6.2,
    2.6,
    2.5,
    '#FFFDF7',
    '#15803D',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#3F3F46',
    witchBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    3.6,
    -6.2,
    2.6,
    2.5,
    '#FFFDF7',
    '#15803D',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#3F3F46',
    -witchBrowTilt,
    s.browLift
  );

  // Prominent hooked witch nose (Orlí skoba s chlupatou bradavicí)
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -7.5);
  ctx.quadraticCurveTo(10.5, -6.5, 12.2, -1.5);
  ctx.quadraticCurveTo(6.0, 1.2, 0, -1.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hairy black wart on nose bridge!
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(8.8, -3.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Toothless cackling mouth with single crooked bottom tooth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0.5, 1.8, 4.6, cackleJaw * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.rect(-0.5, 1.8, 2.2, 2.8);
  ctx.fill();
  ctx.stroke();

  if (s.isAttacking || s.isEnraged) {
    drawFuriantSteamPuffs(ctx, 0, -20, time, s.isEnraged ? 1.25 : 0.85);
  }

  ctx.restore();

  // 7. Right Articulated Arm with Elbow Patch & Birch Flying Broom (Koště v 4-prsté dlani)
  const witchBroomSwing = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.82 * s.windupProgress
    : s.isMoving
    ? Math.sin(time * 9) * 0.22
    : Math.sin(time * 3.0) * 0.06;

  ctx.save();
  ctx.translate(11.5, -4.5);
  ctx.rotate(witchBroomSwing);

  const rElbowX = 5.5;
  const rElbowY = 4.5;
  const rWristX = 13.5;
  const rWristY = 0.8;

  // Articulated jacket sleeve with brown elbow patch
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.8,
    4.8,
    '#334155',
    '#1E293B',
    '#64748B',
    '#A16207'
  );

  // Birch broom held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Gnarled wooden broom handle
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -2.0, -30, 4.4, 50, 1.6);
  ctx.fill();
  ctx.stroke();

  // Birch twig bundle on broom top (Svazek březového proutí)
  ctx.fillStyle = '#854D0E';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-5.0, -29);
  ctx.lineTo(5.0, -29);
  ctx.lineTo(10.5, -47);
  ctx.lineTo(-10.5, -47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.3;
  for (let tx = -7; tx <= 7; tx += 3.5) {
    ctx.beginPath();
    ctx.moveTo(tx * 0.45, -30);
    ctx.lineTo(tx, -46);
    ctx.stroke();
  }

  // Red cord binding broom twigs
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, -5.2, -32, 10.4, 3.2, 1.2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 4-fingered gnarled witch hand gripping the broomstick at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#FDE047', '#CA8A04', 3.4, '#1C1917');

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. POVIDLOVÝ ČERT S MĚCHAČKOU (Zlomyslný pekelník upatlaný od švestkových povidel)
//    ADR 0054, ADR 0055 & ADR 0056: Mobilní postoj na kopytech, švihající ocas s kapkou
//    povidel, 2-kloubové paže, 4-prstý úchop obří měchačky s kapajícími povidly a živé oči.
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
  const stirWave = s.isMoving ? Math.sin(time * 9) * 0.22 : Math.sin(time * 3.2) * 0.08;
  const tongueWobble = Math.sin(time * 10) * 1.8;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.1);
  } else if (s.isStrike) {
    ctx.rotate(0.07);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Dark Plum Jam Ground Puddle with Sticky Splatters (Povidlová louže)
  ctx.save();
  ctx.fillStyle = 'rgba(74, 4, 78, 0.38)';
  ctx.strokeStyle = '#581C87';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 25.5, 26.5, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3B0764';
  for (const [jx, jy, jr] of [
    [-14, 25, 2.3],
    [13, 26, 2.5],
    [0, 27.5, 1.9],
  ]) {
    ctx.beginPath();
    ctx.arc(jx, jy, jr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Swishing Devil Tail with Plum Jam Dollop & Shaggy Cloven Hooves
  const tailSway = Math.sin(time * (s.isMoving ? 8.5 : 4.5)) * (s.isMoving ? 10 : 5.5);
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 4.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-26, 13 + tailSway, -33, 6 + tailSway * 0.8);
  ctx.stroke();

  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-26, 13 + tailSway, -33, 6 + tailSway * 0.8);
  ctx.stroke();

  // Tail barb with plum jam dollop
  const tipX = -33;
  const tipY = 6 + tailSway * 0.8;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(tipX + 1, tipY - 5);
  ctx.lineTo(tipX - 6, tipY);
  ctx.lineTo(tipX + 1, tipY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4A044E';
  ctx.beginPath();
  ctx.arc(tipX - 6.5, tipY, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaggy legs & cloven hooves (Kopyta v klidu stojí, při chůzi dupou)
  const legHop = s.stride * 4.8;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.6 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.6 : 0;

  const drawDevilHoofLeg = (lx: number, stepX: number, liftY: number, isBack: boolean) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 11.5 - liftY * 0.5;
    const fy = 24 - liftY;

    ctx.fillStyle = isBack ? '#18181B' : '#27272A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.6, ky, 7.2, 12.5, 2.2);
    ctx.fill();
    ctx.stroke();

    // Split cloven hoof
    ctx.fillStyle = '#52525B';
    ctx.beginPath();
    ctx.moveTo(kx - 4.2, fy);
    ctx.lineTo(kx + 4.8, fy);
    ctx.lineTo(kx + 5.5, fy + 4.0);
    ctx.lineTo(kx + 1.2, fy + 4.0);
    ctx.lineTo(kx + 0.2, fy + 1.8);
    ctx.lineTo(kx - 0.8, fy + 4.0);
    ctx.lineTo(kx - 4.5, fy + 4.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawDevilHoofLeg(-7, legHop, leg1Lift, true);
  drawDevilHoofLeg(5.5, -legHop, leg2Lift, false);

  // 3. Jet-Black Sooty Fur Torso Stained with Glossy Purple Plum Jam (Povidla a zástěrka)
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18.2, 19.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#27272A';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 15.8, 17.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Checked kitchen waist apron splattered with povidla
  ctx.fillStyle = '#F5F5F4';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  safeRoundRect(ctx, -10.5, 2.5, 21, 12.5, 2.2);
  ctx.fill();
  ctx.stroke();

  // Large glossy purple plum jam splotches across belly & apron
  ctx.fillStyle = '#4A044E';
  ctx.strokeStyle = '#581C87';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-2.5, 3.5, 8.2, 9.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#701A75';
  ctx.beginPath();
  ctx.ellipse(-3.5, 2.2, 5.2, 6.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Specular jam highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-4.8, -0.2, 3.0, 1.1, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Red polka-dot neckerchief (Červený puntíkovaný šátek)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10.5, -9.5);
  ctx.lineTo(10.5, -9.5);
  ctx.lineTo(0, -2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4, -7.2, 0.9, 0, Math.PI * 2);
  ctx.arc(0, -5.8, 0.9, 0, Math.PI * 2);
  ctx.arc(4, -7.2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // 4. Left Articulated Furry Arm Holding Copper Plum-Butter Jar (Měděný rendlíček s povidly)
  drawArticulatedArm2D(
    ctx,
    -13,
    -4.5,
    -20,
    1.5,
    -13.5,
    7.0,
    5.8,
    4.8,
    '#27272A',
    '#09090B',
    '#52525B'
  );
  drawGrippingHand2D(ctx, -13.5, 7.0, 0.3, '#27272A', '#09090B', 3.4, '#DC2626');

  // 5. Devil Head, Ridged Horns, Multi-Layered Eyes & Jam-Licking Tongue
  ctx.save();
  ctx.translate(0, -18.5);

  // Curved golden-amber devil horns with ridges
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 4, -9);
    ctx.quadraticCurveTo(side * 14.5, -22.5, side * 8.5, -26.5);
    ctx.quadraticCurveTo(side * 4, -18.5, side * 1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3-Tier Sooty Fur Head
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 12.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#27272A';
  ctx.beginPath();
  ctx.arc(-0.6, -0.6, 10.6, 0, Math.PI * 2);
  ctx.fill();

  // Plum jam smudge across left cheek
  ctx.fillStyle = '#581C87';
  ctx.beginPath();
  ctx.ellipse(-5.5, 2.2, 4.0, 2.4, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered mischievous glowing eyes with orange irises & saccadic pupils
  const certBrowTilt = s.isAttacking || s.isEnraged ? 0.34 : 0.22;
  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -2.5,
    3.3,
    3.2,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#52525B',
    certBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -2.5,
    3.3,
    3.2,
    '#FEF08A',
    '#EA580C',
    s.pupilShiftX * 0.75,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#52525B',
    -certBrowTilt,
    s.browLift
  );

  // Red devil nose
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0.8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grinning devil mouth with white fangs & long pink tongue licking plum jam
  ctx.fillStyle = '#450A0A';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 3.2, 5.2, 0.08, Math.PI - 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-2.8, 3.8);
  ctx.quadraticCurveTo(-5.5, 8.5 + tongueWobble, 0, 11.5 + tongueWobble);
  ctx.quadraticCurveTo(4.2, 7.8 + tongueWobble, 2.8, 3.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Plum jam dollop on tongue tip!
  ctx.fillStyle = '#4A044E';
  ctx.beginPath();
  ctx.arc(0, 11.2 + tongueWobble, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (s.isAttacking || s.isEnraged) {
    drawFuriantSteamPuffs(ctx, 0, -21, time, s.isEnraged ? 1.3 : 0.9);
  }

  ctx.restore();

  // 6. Right Articulated Arm & Giant Wooden Plum-Jam Paddle (Obří měchačka v 4-prsté dlani)
  const paddleAngle = s.isStrike
    ? 0.95 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.85 * s.windupProgress
    : stirWave;

  ctx.save();
  ctx.translate(13.5, -3.5);
  ctx.rotate(paddleAngle);

  const rElbowX = 5.5;
  const rElbowY = 4.2;
  const rWristX = 13.0;
  const rWristY = 0.8;

  // Articulated furry right arm
  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.0,
    5.0,
    '#27272A',
    '#09090B',
    '#52525B'
  );

  // Giant wooden plum paddle held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);

  // Wooden shaft of the měchačka
  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -2.4, -32, 4.8, 50, 1.6);
  ctx.fill();
  ctx.stroke();

  // Wide slotted stirring blade at top
  ctx.fillStyle = '#CA8A04';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  safeRoundRect(ctx, -6.8, -38, 13.6, 18.5, 3.8);
  ctx.fill();
  ctx.stroke();

  // Thick glossy purple povidla coating paddle blade
  ctx.fillStyle = '#4A044E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  safeRoundRect(ctx, -5.8, -36.5, 11.6, 14.5, 3.0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-2.5, -32, 1.4, 3.8, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Realistic dripping cycle falling from paddle blade
  drawRealisticDripCycle2D(ctx, 0, -21, 16, time, 1.25, 0.25, 2.0);

  ctx.restore();

  // 4-fingered clawed devil hand gripping the paddle shaft at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0, '#27272A', '#09090B', 3.6, '#DC2626');

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. BAKCHUS S PIVNÍM SOUDKEM (Rozšafný patron hospodského veselí na sudu)
//    ADR 0054, ADR 0055 & ADR 0056: Pivní mechanika (dubový sud s pípou + pěnivý tuplák),
//    2-kloubové paže v rukávech kabátce, 4-prstý úchop tupláku a šňůry jitrnic, živé oči.
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
  const barrelRoll = s.isMoving ? Math.sin(time * 9) * 2.5 : Math.sin(time * 2.8) * 0.8;
  const beerSplash = Math.sin(time * 5.5) * 2;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isStrike) {
    ctx.rotate(0.06);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Foaming Tavern Ground Shadow & Golden Beer Puddle
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.30)';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 26, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Giant Oak Beer Barrel (Obří dubový pivní sud se železnými obručemi a pípou)
  ctx.save();
  ctx.translate(0, 14 + barrelRoll * 0.35);

  // Oak barrel belly (3-tier wood staves)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 25, 15.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal oak stave seams
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-26, -3);
  ctx.lineTo(26, -3);
  ctx.moveTo(-26, 3);
  ctx.lineTo(26, 3);
  ctx.stroke();

  // Dark riveted iron hoops (železné obruče na sudu)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, -6.5, 26, 6.2, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 6.5, 26, 6.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Brass tap spout & bung (mosazná pípa s kapajícím pivem)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  safeRoundRect(ctx, -3.2, -2.5, 6.4, 8.2, 1.5);
  ctx.fill();
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, 0, 6, 12, time * 1.4, 1.1, 0.25, 1.8);

  ctx.restore();

  // 3. Bakchus Boots Straddling the Barrel (Nohy v holínkách s mosaznými přezkami)
  const legKick = s.stride * 3.5;
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  safeRoundRect(ctx, -24.5, 9.5 + legKick * 0.4, 9.2, 14.5, 3.0);
  safeRoundRect(ctx, 15.3, 9.5 - legKick * 0.4, 9.2, 14.5, 3.0);
  ctx.fill();
  ctx.stroke();

  // Shiny brass buckles on boots
  ctx.fillStyle = '#FBBF24';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-22.2, 17.5 + legKick * 0.4, 5.0, 3.4);
  ctx.rect(17.2, 17.5 - legKick * 0.4, 5.0, 3.4);
  ctx.fill();
  ctx.stroke();

  // 4. Jolly Rotund Belly in Crimson Doublet & White Frilled Collar (Furiantský kabátec)
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 19.5, 16.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden folk vest panel & round brass buttons
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  safeRoundRect(ctx, -7, -10, 14, 21, 3.0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  for (let b = -6; b <= 7; b += 4.5) {
    ctx.beginPath();
    ctx.arc(0, b, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // White ruffled folk shirt collar (bílý volánový límec)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -10.5, 10.5, 4.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Left Articulated Arm & Hand Clutching Chain of Roast Sausages (Šňůra jitrnic v 4-prsté ruce)
  ctx.save();
  const sausageSway = Math.sin(time * (s.isMoving ? 8 : 4)) * 0.14;
  drawArticulatedArm2D(
    ctx,
    -15,
    -4,
    -23,
    0,
    -18,
    5,
    6.4,
    5.4,
    '#DC2626',
    '#991B1B',
    '#F87171',
    '#FFFFFF'
  );

  // Links of juicy roasted village sausages (šňůra jitrnic se špejlemi)
  ctx.save();
  ctx.translate(-18, 5);
  ctx.rotate(sausageSway);
  ctx.fillStyle = '#7F1D1D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (const [sx, sy, rot] of [
    [-2, 4, 0.18],
    [0, 11.5, -0.15],
    [-2, 19, 0.2],
  ]) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3.8, 6.2, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Specular highlight & wooden skewer end (špejle)
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.ellipse(sx - 1.2, sy - 1.5, 1.0, 2.8, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7F1D1D';
  }
  ctx.restore();

  drawGrippingHand2D(ctx, -18, 5, 0.2, '#FEF08A', '#EAB308', 3.6);
  ctx.restore();

  // 6. Jovial Triple-Chinned Face with Žatec Hop Wreath & Multi-Layered Eyes
  ctx.save();
  ctx.translate(0, -18.5);

  // Double and triple chins!
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 5.5, 8.5, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // 3-Tier Round Rosy Face
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 13.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-0.6, -0.6, 11.6, 0, Math.PI * 2);
  ctx.fill();

  // Big ruddy red tavern cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.58)';
  ctx.beginPath();
  ctx.arc(-7.5, 2.2, 4.0, 0, Math.PI * 2);
  ctx.arc(7.5, 2.2, 4.0, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered jolly Ladovské eyes with blue irises & saccadic pupils
  const bakchusBrowTilt = s.isAttacking || s.isEnraged ? 0.22 : -0.14;
  drawLadaExpressiveEye2D(
    ctx,
    -4.8,
    -2.8,
    3.4,
    3.1,
    '#FFFDF7',
    '#2563EB',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#78350F',
    bakchusBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.8,
    -2.8,
    3.4,
    3.1,
    '#FFFDF7',
    '#2563EB',
    s.pupilShiftX * 0.7,
    s.pupilShiftY * 0.6,
    s.eyeSquint,
    '#78350F',
    -bakchusBrowTilt,
    s.browLift
  );

  // Bulbous red drinker's nose with highlight
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0.4, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FDBA74';
  ctx.beginPath();
  ctx.arc(-1.1, -0.7, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Roaring laughing mouth with white teeth & pink tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 4.6, 6.4, 0.08, Math.PI - 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-4.2, 4.2, 8.4, 2.2);

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, 6.8, 3.2, 0, Math.PI);
  ctx.fill();

  // Wreath of Fresh Žatec Hops & Ivy on Head (Věnec z chmelových šištic)
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -9, 11.2, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  drawHopCone2D(ctx, -8.5, -12, 0.9, -0.3);
  drawHopCone2D(ctx, 0, -15, 1.0, 0);
  drawHopCone2D(ctx, 8.5, -12, 0.9, 0.3);

  ctx.restore();

  // 7. Right Articulated Arm Raising Foaming Ceramic Beer Stein Aloft (Pozdvižený tuplák)
  const mugSwing = s.isStrike
    ? 0.88 * (1 - s.strikeProgress * 0.35)
    : s.isWindup
    ? -0.68 * s.windupProgress
    : Math.sin(time * 4.5) * 0.16;

  ctx.save();
  ctx.translate(14.5, -6);
  ctx.rotate(mugSwing);

  const rElbowX = 6.5;
  const rElbowY = 2.5;
  const rWristX = 14.5;
  const rWristY = -2.5;

  drawArticulatedArm2D(
    ctx,
    0,
    0,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.6,
    5.6,
    '#DC2626',
    '#991B1B',
    '#F87171',
    '#FFFFFF'
  );

  // Foaming Stoneware Beer Stein (Tuplák) held at (rWristX, rWristY)
  drawFoamingBeerMug2D(ctx, rWristX + 6, rWristY - 2, 1.15, 0.12, time + beerSplash);

  // 4-fingered hand gripping the mug handle at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, -0.2, '#FEF08A', '#EAB308', 3.7);

  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. UMRLEC BASISTA (Furiantský hospodský muzikant s basou a cylindrem)
//     ADR 0054 & ADR 0055: Mobilní postoj u kontrabasu, smuteční frak s šosy,
//     2-kloubové paže s kostlivými prsty svírajícími krk basy a smyčec, lebka v cylindru.
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
  const bowSpeed = s.isAttacking ? 15 : s.isMoving ? 9.5 : 4.2;
  const bowingMotion = Math.sin(time * bowSpeed) * (s.isAttacking ? 14 : s.isMoving ? 10 : 4.5);
  const noteBob = (time * 2) % 3;

  ctx.save();
  ctx.translate(cx, cy - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isStrike) {
    ctx.rotate(0.06);
  } else if (s.isWindup) {
    ctx.rotate(-0.05);
  }

  // 1. Tavern Floor Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(24, 24, 27, 0.32)';
  ctx.beginPath();
  ctx.ellipse(2, 26, 29, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Giant Dark Wooden Double Bass (Hospodská kontrabasa se 4 strunami a f-otvory)
  ctx.save();
  ctx.translate(7.5, 4);
  ctx.rotate(-0.14);

  // Lower bass bout (3-tier wood gouache)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 10, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(-1, 9, 13.8, 12.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upper bass bout
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(0, -6, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(-2.5, -8, 6.5, 5.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // F-holes (houslové výřezy f) & wooden bridge (kobylka)
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.quadraticCurveTo(-9, 4, -5, 10);
  ctx.moveTo(6, -2);
  ctx.quadraticCurveTo(9, 4, 5, 10);
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  safeRoundRect(ctx, -4.5, 3.5, 9, 2.2, 0.8);
  ctx.fill();
  ctx.stroke();

  // Bass neck & scroll pegbox with tuning pegs (krk basy a kolíčky)
  ctx.fillStyle = '#271714';
  ctx.beginPath();
  safeRoundRect(ctx, -2.2, -27, 4.4, 25, 1.2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  safeRoundRect(ctx, -4.2, -34.5, 8.4, 8.8, 2.2);
  ctx.fill();
  ctx.stroke();

  // 4 gut strings
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.0;
  for (let str = -1.5; str <= 1.5; str += 1.0) {
    ctx.beginPath();
    ctx.moveTo(str, -30);
    ctx.lineTo(str * 1.5, 20);
    ctx.stroke();
  }

  // Endpin spike resting on floor
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.lineTo(0, 29.5);
  ctx.stroke();

  ctx.restore();

  // 3. Skeleton Legs in Black Trousers & Funeral Tailcoat (Smuteční frak s šosy)
  const legWalk = s.stride * 4.8;
  const leg1Lift = s.isMoving ? Math.max(0, -s.stride) * 2.5 : 0;
  const leg2Lift = s.isMoving ? Math.max(0, s.stride) * 2.5 : 0;

  const drawMusicianLeg = (lx: number, stepX: number, liftY: number) => {
    ctx.save();
    const kx = lx + stepX * 0.5;
    const ky = 12 - liftY * 0.5;
    const fy = 24 - liftY;
    ctx.fillStyle = '#18181B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.0, ky, 6.0, 12.5, 1.6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#09090B';
    ctx.beginPath();
    safeRoundRect(ctx, kx - 3.8, fy, 9.2, 4.2, 1.8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawMusicianLeg(-8, legWalk, leg1Lift);
  drawMusicianLeg(2, -legWalk, leg2Lift);

  // Fluttering tailcoat tails (šosy fraku)
  ctx.fillStyle = '#09090B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-12, 12);
  ctx.quadraticCurveTo(-17, 23, -21, 27.5);
  ctx.lineTo(-9.5, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Frock coat torso (3-tier charcoal/black)
  ctx.fillStyle = '#18181B';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-11.5, -8.5);
  ctx.lineTo(10.5, -8.5);
  ctx.lineTo(12.5, 14);
  ctx.lineTo(-13.0, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#27272A';
  ctx.beginPath();
  ctx.moveTo(-9.5, -7.5);
  ctx.lineTo(8.5, -7.5);
  ctx.lineTo(10.2, 12.5);
  ctx.lineTo(-10.8, 12.5);
  ctx.closePath();
  ctx.fill();

  // Crisp white shirt front (náprsenka), ribcage buttons & black bow tie
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-4.5, -8.5);
  ctx.lineTo(4.5, -8.5);
  ctx.lineTo(2.2, 3.5);
  ctx.lineTo(-2.2, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.ellipse(0, -6.5, 3.8, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Left Articulated Arm Gripping Double Bass Neck (4 kostlivé prsty na hmatníku)
  drawArticulatedArm2D(
    ctx,
    5,
    -6.5,
    9.5,
    -9.5,
    10.8,
    -15.5,
    5.2,
    4.4,
    '#18181B',
    '#09090B',
    '#3F3F46',
    '#F8FAFC'
  );
  drawGrippingHand2D(ctx, 10.8, -15.5, -0.35, '#F8FAFC', '#CBD5E1', 3.2);

  // 5. Smiling Skeleton Skull in Battered Top Hat with Lit Cigar (Lebka v cylindru)
  ctx.save();
  ctx.translate(0, -18.5);

  // 3-Tier Bleached Skull
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(-0.5, -0.6, 9.8, 0, Math.PI * 2);
  ctx.fill();

  // Deep eye sockets with multi-layered glowing green irises, saccadic pupils & bony brows
  const skullBrowTilt = s.isAttacking || s.isEnraged ? 0.28 : -0.12;
  drawLadaExpressiveEye2D(
    ctx,
    -4.0,
    -2.2,
    3.1,
    3.5,
    '#09090B',
    '#22C55E',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#CBD5E1',
    skullBrowTilt,
    s.browLift
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.0,
    -2.2,
    3.1,
    3.5,
    '#09090B',
    '#22C55E',
    s.pupilShiftX * 0.65,
    s.pupilShiftY * 0.55,
    s.eyeSquint,
    '#CBD5E1',
    -skullBrowTilt,
    s.browLift
  );

  // Inverted heart-shaped nasal cavity
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.moveTo(0, 0.8);
  ctx.lineTo(-1.8, 3.8);
  ctx.lineTo(1.8, 3.8);
  ctx.closePath();
  ctx.fill();

  // Broad grinning teeth (zubiska muzikanta)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  safeRoundRect(ctx, -6.2, 4.8, 12.4, 5.0, 1.4);
  ctx.fill();
  ctx.stroke();

  for (let t = -4; t <= 4; t += 2) {
    ctx.beginPath();
    ctx.moveTo(t, 4.8);
    ctx.lineTo(t, 9.8);
    ctx.stroke();
  }

  // Lit cigar clamped in teeth with glowing red ash & flat gouache smoke lobe
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  safeRoundRect(ctx, 4.0, 6.5, 8.5, 2.6, 0.8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(10.8, 6.7, 1.8, 2.2);
  drawFlatGouacheSmokeLobe(ctx, 16.0, 4.5, 3.2);

  // Battered Black Top Hat Tilted on Skull (Otlučený cylindr s červenou stuhou)
  ctx.save();
  ctx.translate(0, -9.2);
  ctx.rotate(0.12);

  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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
  ctx.beginPath();
  ctx.rect(-9.2, -4.2, 18.4, 3.8);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // Floating folk music notes rising into the tavern air!
  drawMusicNote2D(ctx, -16, -26 - noteBob * 6, 0, 0.9);
  drawMusicNote2D(ctx, 16, -30 - noteBob * 5, 1, 0.85);

  ctx.restore();

  // 6. Right Articulated Arm & Skeletal Hand Sawing the Horsehair Bass Bow (Smyčec)
  ctx.save();
  const rShoulderX = -9.5;
  const rShoulderY = -3.5;
  const rElbowX = -15.5 - bowingMotion * 0.35;
  const rElbowY = 2.5;
  const rWristX = -5.5 - bowingMotion * 0.65;
  const rWristY = 5.5;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.4,
    4.6,
    '#18181B',
    '#09090B',
    '#3F3F46',
    '#F8FAFC'
  );

  // Horsehair bass bow held directly at (rWristX, rWristY)
  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(0.18);

  // Wooden bow stick
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(28, 4);
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(28, 4);
  ctx.stroke();

  // White horsehair ribbon
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-1, 2.2);
  ctx.lineTo(27.5, 5.8);
  ctx.stroke();

  ctx.restore();

  // 4-fingered bony skeletal hand gripping the bow frog at (rWristX, rWristY)
  drawGrippingHand2D(ctx, rWristX, rWristY, 0.18, '#F8FAFC', '#CBD5E1', 3.3);

  ctx.restore();
  ctx.restore();
}

