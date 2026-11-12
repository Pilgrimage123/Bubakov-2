import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  drawFolkFlower2D,
  drawWaterLilyBlossom2D,
  drawWaterDroplet2D,
  drawRealisticDripCycle2D,
  drawFlatGouacheSmokeLobe,
  drawFuriantSteamPuffs,
  drawMusicNote2D,
  drawArticulatedArm2D,
  drawGrippingHand2D,
  drawLadaExpressiveEye2D,
  safeRoundRect,
} from './hospodaBossHelpers';

// ===========================================================================
// HOSPODSKÝ FIGURÁLNÍ KÁNON: DÁVKA 3 – PŘEDJAŘÍ A JARO (Úrovně L0–L5)
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. BLATOUCH (Blatouchový skřítek, L0 Mini-boss)
// Archetyp: Rozšafný a šibalský luční skřítek se zářivým blatouchovým kloboukem
// ---------------------------------------------------------------------------
export function drawHospodaBlatouch(
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
  const scale = 2.05;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.07 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.11 * s.strikeProgress);
  }

  // 1. Meadow Ground Shadow with Golden Pollen Specks
  ctx.save();
  ctx.fillStyle = 'rgba(34, 85, 34, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 18.5, 16.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Bare Little Legs (Čiperné bosé nožky se 4 prstíky, respektující klidový postoj vx === 0)
  const legL = s.stride * 4.5;
  const legR = -legL;

  for (const side of [-1, 1]) {
    const shift = side === -1 ? legL : legR;
    const baseX = side * 4.5;

    ctx.fillStyle = '#E8BE9B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(baseX - 1.8, 8);
    ctx.lineTo(baseX - 2.3 + shift, 18);
    ctx.lineTo(baseX + 2.3 + shift, 18);
    ctx.lineTo(baseX + 1.8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner leg shadow
    ctx.fillStyle = '#D9A07A';
    ctx.fillRect(baseX - 1.5 + shift * 0.5, 10, 1.3, 6.5);

    // 4 tiny toes
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#E8BE9B';
      ctx.beginPath();
      ctx.arc(baseX - 2.2 + shift + i * 1.45, 18.2, 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // 3. 3-Tier Gouache Patched Green Peasant Breeches & Suspenders (Záplatované kraťásky)
  ctx.fillStyle = '#3E6B27';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-9.5, 3.5);
  ctx.lineTo(9.5, 3.5);
  ctx.lineTo(8.5, 11.2);
  ctx.lineTo(1.2, 10);
  ctx.lineTo(0, 11.2);
  ctx.lineTo(-1.2, 10);
  ctx.lineTo(-8.5, 11.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Breeches shadow & highlight
  ctx.fillStyle = '#2B4C1B';
  ctx.fillRect(-8, 8.2, 16, 2.2);
  ctx.fillStyle = '#538D34';
  ctx.fillRect(-7.5, 4.3, 6, 1.8);

  // Bright yellow patch on shorts with cross-stitching
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-6.5, 5.5, 4.5, 3.8);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-7.0, 6.2);
  ctx.lineTo(-5.8, 6.2);
  ctx.moveTo(-7.0, 8.2);
  ctx.lineTo(-5.8, 8.2);
  ctx.moveTo(-2.6, 6.2);
  ctx.lineTo(-1.4, 6.2);
  ctx.moveTo(-2.6, 8.2);
  ctx.lineTo(-1.4, 8.2);
  ctx.stroke();

  // 4. White Linen Peasant Shirt Torso (Košulka s kšandami a mosaznými knoflíky)
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#FAF7EE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -0.2, 8.6, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shirt shadow fold
  ctx.fillStyle = '#E5DEC9';
  ctx.beginPath();
  ctx.ellipse(-2.5, 1.2, 4.5, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Leather suspenders & brass buttons
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-5.2, 4.0);
  ctx.lineTo(-4.2, -4.5);
  ctx.moveTo(5.2, 4.0);
  ctx.lineTo(4.2, -4.5);
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-5.1, 3.6, 1.3, 0, Math.PI * 2);
  ctx.arc(5.1, 3.6, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red neckerchief with white dots
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -3.8, 6.6, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-3, -3.8, 0.7, 0, Math.PI * 2);
  ctx.arc(0, -3.6, 0.7, 0, Math.PI * 2);
  ctx.arc(3, -3.8, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // 5. Left 2-Jointed Articulated Arm (Volná ruka pro rovnováhu)
  const armWave = s.isMoving ? s.stride * 3.5 : Math.sin(time * 2.5) * 0.8;
  const lShoulderX = -7.2;
  const lShoulderY = -2.2;
  const lElbowX = -11.5;
  const lElbowY = 0.5 + armWave * 0.5;
  const lWristX = -14.2;
  const lWristY = -1.5 + armWave;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    4.6,
    3.8,
    '#FAF7EE',
    '#E5DEC9',
    '#FFFFFF',
    '#DC2626'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, -0.5, '#F6CBB2', '#D9A07A', 2.5);

  // 6. Expressive Round Face (Okulární mimika s pihami a červenými tvářemi)
  ctx.fillStyle = '#F6CBB2';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -9.2, 8.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks with white highlights
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5.2, -7.6, 2.5, 0, Math.PI * 2);
  ctx.arc(5.2, -7.6, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4.7, -8.5, 0.85, 0, Math.PI * 2);
  ctx.arc(5.7, -8.5, 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered Lada expressive eyes
  const pupilShiftX = s.isStrike ? 0.9 : s.isWindup ? -0.4 : 0.45;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.18 : 0;
  const browTilt = s.isAttacking || s.isEnraged ? 1.4 : -0.6;

  drawLadaExpressiveEye2D(
    ctx,
    -3.5,
    -11.0,
    2.5,
    2.7,
    '#FFFFFF',
    s.isEnraged ? '#EA580C' : '#2563EB',
    pupilShiftX,
    0,
    eyeSquint,
    '#78350F',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    3.5,
    -11.0,
    2.5,
    2.7,
    '#FFFFFF',
    s.isEnraged ? '#EA580C' : '#2563EB',
    pupilShiftX,
    0,
    eyeSquint,
    '#78350F',
    -browTilt,
    0
  );

  // Bulbous button nose & freckles
  ctx.fillStyle = '#EB9A7E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -8.6, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#854D0E';
  ctx.fillRect(-3.2, -6.6, 0.8, 0.8);
  ctx.fillRect(-2.1, -5.9, 0.8, 0.8);
  ctx.fillRect(2.1, -6.6, 0.8, 0.8);
  ctx.fillRect(3.2, -5.9, 0.8, 0.8);

  // Broad smiling mouth with tongue
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (s.isAttacking || s.isEnraged) {
    ctx.ellipse(0, -4.6, 3.6, 2.8, 0, 0, Math.PI);
  } else {
    ctx.arc(0, -5.6, 4.0, 0.18, Math.PI - 0.18);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.arc(0, -4.3, 1.8, 0, Math.PI);
  ctx.fill();

  // 7. Giant Yellow Marsh Marigold (Blatouch) Flower Hat
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-1, -21);
  ctx.quadraticCurveTo(2, -26, 4.2, -28.2);
  ctx.lineTo(2.5, -28.8);
  ctx.quadraticCurveTo(0.5, -26, -2.2, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawWaterDroplet2D(ctx, 4.2, -26.5, 1.6, 0.9);

  const petalColors = ['#FBBF24', '#F59E0B', '#FCD34D', '#F59E0B', '#FBBF24'];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i - 2) * 0.55;
    const px = Math.cos(angle) * 11;
    const py = -16.2 + Math.sin(angle) * 6;
    ctx.fillStyle = petalColors[i];
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(px, py, 6.5, 5.0, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(0, -16.6, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 0, -24, time, 1.0);
  }

  // 8. Right 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Marsh Marigold Reed Staff
  const rShoulderX = 7.2;
  const rShoulderY = -2.0;
  const rElbowX = s.isWindup ? 9.5 - s.windupProgress * 2.5 : s.isStrike ? 11.8 + s.strikeProgress * 2.5 : 10.5;
  const rElbowY = s.isWindup ? 1.5 - s.windupProgress * 3.0 : s.isStrike ? -0.5 + s.strikeProgress * 1.5 : 1.5 - armWave * 0.4;
  const rWristX = s.isWindup ? 11.0 - s.windupProgress * 3.0 : s.isStrike ? 15.8 + s.strikeProgress * 4.5 : 13.5;
  const rWristY = s.isWindup ? -4.0 - s.windupProgress * 4.5 : s.isStrike ? -2.0 + s.strikeProgress * 3.0 : -1.0 - armWave * 0.8;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    4.6,
    3.8,
    '#FAF7EE',
    '#E5DEC9',
    '#FFFFFF',
    '#DC2626'
  );

  // Botanical Marsh Marigold Reed Staff (Blatouchový stvol s květem pevně sevřený v dlani)
  const staffAngle = s.isWindup
    ? -0.45 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.35 + s.strikeProgress * 0.55
    : -0.2 + Math.sin(time * 3) * 0.06;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(staffAngle);

  // Reed shaft passing directly through palm (y = 0)
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-1.2, -17, 2.4, 24);
  ctx.fill();
  ctx.stroke();

  // Side leaf on reed
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(3.2, -7.5, 3.5, 1.6, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden Marsh Marigold flower at tip
  drawFolkFlower2D(ctx, 0, -18, 5.2, '#F59E0B', '#FEF08A');

  if (s.isAttacking || s.isEnraged) {
    drawWaterDroplet2D(ctx, 5.5, -20, 2.4, 1.0);
    drawWaterDroplet2D(ctx, -4.5, -22, 2.0, 0.95);
  }
  ctx.restore();

  // 4-fingered hand closed over the reed shaft
  drawGrippingHand2D(ctx, rWristX, rWristY, staffAngle, '#F6CBB2', '#D9A07A', 2.6);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. BAHENNÍ VODNÍČEK (Vodníček, L0 Mezi-boss)
// Archetyp: Zlomyslný a potměšilý zelený vodníček s kapajícími šosy a pentlemi
// ---------------------------------------------------------------------------
export function drawHospodaVodnicek(
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
  const scale = 2.2;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(-0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.12 * s.strikeProgress);
  }

  // 1. Muddy Pond Shadow with Ripple Rings
  ctx.save();
  ctx.fillStyle = 'rgba(21, 52, 38, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1.3;
  const ripple = (time * 1.8) % 1;
  ctx.beginPath();
  ctx.ellipse(0, 20, 15 + ripple * 8, 4.2 + ripple * 2.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Webbed Green Feet with 4 Toes (respektující klidový postoj vx === 0 vs. chůzi vx !== 0)
  const legShift = s.stride * 4.8;
  for (const side of [-1, 1]) {
    const lx = side * 5.8 + (side === -1 ? legShift : -legShift);
    ctx.fillStyle = '#22C55E';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(lx - 2.2, 8);
    ctx.lineTo(lx - 4.2, 19);
    ctx.lineTo(lx + 5.8, 19);
    ctx.lineTo(lx + 2.2, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Leg shadow
    ctx.fillStyle = '#15803D';
    ctx.fillRect(lx - 2.0, 9.5, 1.8, 8.0);

    // 4 webbed frog toes
    ctx.fillStyle = '#4ADE80';
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.arc(lx - 3.2 + t * 2.7, 19.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // 3. Characteristic Ladovské Coattails (Kapající šosy zeleného fráčku)
  const flap = (s.isMoving ? s.stride * 2.5 : 0) + Math.sin(time * 4.5) * 1.4;
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8.5, 8.5);
  ctx.quadraticCurveTo(-14.5, 14.5 + flap, -16.5, 20.5 + flap);
  ctx.lineTo(-10.5, 21.5 + flap);
  ctx.lineTo(-5.5, 9.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red piping on coattail tip
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-13.5, 20.8 + flap, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Realistic dripping water cycle from the coattails to pond ground (groundY = 23)
  drawRealisticDripCycle2D(ctx, -13.5, 21.0 + flap, 23.0, time, 1.3, 0.15, 2.0);
  drawRealisticDripCycle2D(ctx, -10.5, 20.0 + flap, 23.0, time, 1.3, 0.65, 1.7);

  // 4. 3-Tier Gouache Green Frock Coat with Red Trimming & Brass Buttons
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9.8, -4.2);
  ctx.lineTo(9.8, -4.2);
  ctx.lineTo(11.8, 10.2);
  ctx.lineTo(-11.8, 10.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coat shadow & highlight
  ctx.fillStyle = '#14532D';
  ctx.fillRect(-10.2, 6.2, 20.4, 3.2);
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(-7.5, -2.8, 4.2, 7.5);

  // Red piping on collar & bottom hem
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11.5, 10.0);
  ctx.lineTo(11.5, 10.0);
  ctx.moveTo(-7.2, -4.0);
  ctx.lineTo(0, 4.2);
  ctx.lineTo(7.2, -4.0);
  ctx.stroke();

  // Brass buttons down front
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  for (const by of [2.5, 5.5, 8.2]) {
    ctx.beginPath();
    ctx.arc(0, by, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Red Polka-dot Neckerchief
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -4.5, 8.5, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  for (const dx of [-4.2, 0, 4.2]) {
    ctx.beginPath();
    ctx.arc(dx, -4.5, 1.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Left 2-Jointed Articulated Arm & 4-Fingered Webbed Green Hand
  const armSwing = s.isMoving ? s.stride * 3.2 : Math.sin(time * 2.4) * 0.7;
  const lShoulderX = -8.8;
  const lShoulderY = -2.2;
  const lElbowX = -13.2;
  const lElbowY = 1.5 + armSwing * 0.5;
  const lWristX = -15.5;
  const lWristY = 4.2 + armSwing;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    5.0,
    4.2,
    '#15803D',
    '#14532D',
    '#22C55E',
    '#DC2626'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, 0.4, '#4ADE80', '#16A34A', 2.7);

  // 6. Green Bog Frog-Face with Big Cheeks & Expressive Ocular Mimicry
  ctx.fillStyle = '#4ADE80';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12.0, 9.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bog warts on cheeks
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.arc(-6.2, -9.2, 1.35, 0, Math.PI * 2);
  ctx.arc(-7.6, -11.2, 0.95, 0, Math.PI * 2);
  ctx.arc(6.8, -9.2, 1.25, 0, Math.PI * 2);
  ctx.fill();

  // Multi-layered Lada expressive frog eyes
  const pupilX = s.isStrike ? 1.0 : s.isWindup ? -0.5 : 0.5;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.24 : 0.08;
  const browTilt = s.isAttacking || s.isEnraged ? 1.6 : 0.7;

  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -14.5,
    3.0,
    2.9,
    '#FEF08A',
    s.isEnraged ? '#DC2626' : '#065F46',
    pupilX,
    0,
    eyeSquint,
    '#064E3B',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -14.5,
    3.0,
    2.9,
    '#FEF08A',
    s.isEnraged ? '#DC2626' : '#065F46',
    pupilX,
    0,
    eyeSquint,
    '#064E3B',
    -browTilt,
    0
  );

  // Hooked Ladovský frog-nose
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -11.0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crooked sly grin showing single yellow snaggle-tooth & pink tongue
  ctx.fillStyle = '#7F1D1D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -7.6, 5.0, 0.08, Math.PI * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.rect(1.0, -8.0, 2.0, 2.7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(-1.5, -5.8, 2.0, 0, Math.PI);
  ctx.fill();

  // 7. Tall Waterlily Top Hat with Blooming Water-Lily & Red Pheasant Feather
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  // Brim
  ctx.beginPath();
  ctx.ellipse(0, -19.2, 13.2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crown
  ctx.beginPath();
  ctx.moveTo(-7.2, -19.2);
  ctx.lineTo(-5.6, -28.5);
  ctx.lineTo(5.6, -28.5);
  ctx.lineTo(7.2, -19.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red hatband
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.rect(-6.9, -21.8, 13.8, 2.6);
  ctx.fill();
  ctx.stroke();

  // Blooming water-lily blossom tucked in hatband (proper radius 3.8px)
  drawWaterLilyBlossom2D(ctx, -5.8, -22.5, 3.8, -0.2);

  // Red pheasant feather
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(4.2, -22.0);
  ctx.quadraticCurveTo(11.0, -28.0, 14.2, -34.0);
  ctx.stroke();

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 0, -30, time, 1.0);
  }

  // 8. Right 2-Jointed Articulated Arm & 4-Fingered Webbed Hand Gripping Willow Wand
  const rShoulderX = 8.6;
  const rShoulderY = -2.0;
  const rElbowX = s.isWindup ? 10.5 - s.windupProgress * 2.5 : s.isStrike ? 13.5 + s.strikeProgress * 3.0 : 12.2;
  const rElbowY = s.isWindup ? 1.0 - s.windupProgress * 3.0 : s.isStrike ? -0.5 + s.strikeProgress * 1.5 : 1.8 - armSwing * 0.4;
  const rWristX = s.isWindup ? 12.2 - s.windupProgress * 3.5 : s.isStrike ? 18.0 + s.strikeProgress * 5.0 : 15.5;
  const rWristY = s.isWindup ? -4.5 - s.windupProgress * 5.0 : s.isStrike ? -1.5 + s.strikeProgress * 3.5 : 0.2 - armSwing * 0.7;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.0,
    4.2,
    '#15803D',
    '#14532D',
    '#22C55E',
    '#DC2626'
  );

  // Willow Wand with Ribbon Streamers (Vrbový proutek s pentlemi pevně sevřený v dlani)
  const wandAngle = s.isWindup
    ? -0.55 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.45 + s.strikeProgress * 0.65
    : -0.15 + Math.sin(time * 3.5) * 0.08;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(wandAngle);

  // Flexible willow shaft passing through hand origin (0, 0)
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(-1.0, 5.5);
  ctx.quadraticCurveTo(2.5, -8.0, 6.5, -21.0);
  ctx.stroke();

  // Floating ribbons (3 barevné pentle na špičce proutku)
  const ribColors = ['#EF4444', '#3B82F6', '#EAB308'];
  for (let r = 0; r < 3; r++) {
    ctx.strokeStyle = ribColors[r];
    ctx.lineWidth = 1.7;
    const rx = 6.2 - r * 0.5;
    const ry = -20.5 + r * 2.6;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(
      rx + 5.5,
      ry + Math.sin(time * 9 + r * 1.3) * 3.8,
      rx + 11.5,
      ry + 1.8 + Math.cos(time * 8 + r) * 2.2
    );
    ctx.stroke();
  }

  if (s.isAttacking) {
    drawWaterDroplet2D(ctx, 9.5, -22.0, 2.2, 0.95);
  }
  ctx.restore();

  // 4-fingered webbed green hand closed over the willow wand
  drawGrippingHand2D(ctx, rWristX, rWristY, wandAngle, '#4ADE80', '#16A34A', 2.8);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. MRAZIVÁ VRÁNA (Stage Crow, L0 Vele-boss)
// Archetyp: Komicky vzteklá a furiantská vrána v pletené šále, záplatované vestě a dřevácích
// ---------------------------------------------------------------------------
export function drawHospodaStageCrow(
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
  const scale = 2.4;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  } else if (s.isWindup) {
    ctx.rotate(-0.09 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.14 * s.strikeProgress);
  }

  // 1. Frosty Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.30)';
  ctx.beginPath();
  ctx.ellipse(0, 22.5, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Clawed Crow Legs in Striped Woolen Socks & Wooden Clogs (respektující vx === 0 vs. vx !== 0)
  const legStep = s.stride * 4.5;
  for (const side of [-1, 1]) {
    const shift = side === -1 ? legStep : -legStep;
    const lx = side * 6.8 + shift;

    // Striped warm woolen sock
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(lx - 2.6, 9.5, 5.2, 8.8);
    ctx.fill();
    ctx.stroke();

    // Red folk stripes on socks
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(lx - 2.5, 12.2);
    ctx.lineTo(lx + 2.5, 12.2);
    ctx.moveTo(lx - 2.5, 15.2);
    ctx.lineTo(lx + 2.5, 15.2);
    ctx.stroke();

    // Wooden peasant clog (okovaný dřevák)
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(lx - 4.2, 18.0);
    ctx.lineTo(lx + 7.2, 18.0);
    ctx.lineTo(lx + 6.2, 22.2);
    ctx.lineTo(lx - 5.2, 22.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Clog highlight & brass stud
    ctx.fillStyle = '#B45309';
    ctx.fillRect(lx - 2.5, 18.6, 6.5, 1.5);
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(lx + 3.5, 20.0, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Back Articulated Feathered Wing-Arm (Levé křídlo)
  const wingBeat = s.isAttacking
    ? Math.sin(time * 16) * 8
    : s.isMoving
    ? s.stride * 5.5
    : Math.sin(time * 2.6) * 1.1;

  drawArticulatedArm2D(
    ctx,
    -8.5,
    -2.5,
    -15.5,
    -5.0 + wingBeat * 0.5,
    -21.5,
    0.5 + wingBeat,
    5.6,
    4.6,
    '#0F172A',
    '#020617',
    '#334155',
    '#475569'
  );
  drawGrippingHand2D(ctx, -21.5, 0.5 + wingBeat, 2.5, '#1E293B', '#0F172A', 3.0, '#FBBF24');

  // 4. 3-Tier Gouache Shaggy Crow Plumage Torso & Patched Folk Vest
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 2.0, 14.2, 15.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Plumage shadow & highlight
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(-4.5, 5.5, 8.5, 9.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(4.0, -1.5, 6.5, 8.0, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Layered breast feather scales (Ladovský kvašový rastr)
  const feathers: Array<[number, number, string]> = [
    [-5.5, -3.5, '#334155'],
    [0.5, -2.5, '#475569'],
    [6.0, -3.5, '#334155'],
    [-4.5, 4.0, '#334155'],
    [1.0, 5.0, '#475569'],
    [5.5, 4.0, '#334155'],
  ];
  for (const [fx, fy, col] of feathers) {
    ctx.fillStyle = col;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 4.0, 2.9, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Cross-stitched ochre cloth patch on belly
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-6.8, 7.2, 5.2, 4.2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-7.2, 8.0);
  ctx.lineTo(-6.0, 8.0);
  ctx.moveTo(-7.2, 10.4);
  ctx.lineTo(-6.0, 10.4);
  ctx.moveTo(-2.2, 8.0);
  ctx.lineTo(-1.0, 8.0);
  ctx.stroke();

  // 5. Red Woolen Knit Scarf with Yellow Tassels
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -6.2, 12.2, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White knitted stitch pattern on scarf
  ctx.strokeStyle = '#FEE2E2';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-8, -6.2);
  ctx.lineTo(8, -6.2);
  ctx.stroke();

  const scarfWave = (s.isMoving ? s.stride * 3.0 : 0) + Math.sin(time * 5.5) * 1.8;
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-4.5, -3.2);
  ctx.quadraticCurveTo(-12.5, 4.0 + scarfWave, -16.5, 13.8 + scarfWave);
  ctx.lineTo(-11.2, 14.8 + scarfWave);
  ctx.lineTo(-2.0, -3.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.7;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-16.2 + i * 1.5, 13.8 + scarfWave);
    ctx.lineTo(-17.2 + i * 1.5, 17.5 + scarfWave);
    ctx.stroke();
  }

  // 6. Huge Crow Head with Multi-Layered Expressive Eyes & Giant Yellow Beak
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -14.2, 11.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Patched winter ear-flap cap on top of head
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(-1.0, -19.5, 8.2, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.ellipse(-1.0, -19.5, 8.6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Multi-layered Lada expressive eyes (left & right)
  const pupilX = s.isStrike ? 1.1 : s.isWindup ? -0.5 : 0.6;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.25 : 0.08;
  const browTilt = s.isAttacking || s.isEnraged ? 1.8 : 0.9;

  drawLadaExpressiveEye2D(
    ctx,
    -2.2,
    -15.8,
    3.1,
    3.2,
    '#FFFFFF',
    s.isEnraged ? '#EF4444' : '#F59E0B',
    pupilX,
    0,
    eyeSquint,
    '#FEF08A',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -15.8,
    3.6,
    3.7,
    '#FFFFFF',
    s.isEnraged ? '#EF4444' : '#F59E0B',
    pupilX,
    0,
    eyeSquint,
    '#FEF08A',
    -browTilt,
    0
  );

  // Giant sharp yellow beak with nostrils
  const beakOpen = s.isAttacking || s.isEnraged ? 4.8 : 1.0;
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  // Upper beak
  ctx.beginPath();
  ctx.moveTo(7.8, -17.2);
  ctx.quadraticCurveTo(18.0, -16.2, 25.0, -13.0);
  ctx.quadraticCurveTo(18.0, -11.2, 8.8, -13.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower beak
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.moveTo(8.8, -13.0);
  ctx.quadraticCurveTo(17.0, -10.0 + beakOpen, 22.8, -11.0 + beakOpen);
  ctx.lineTo(7.8, -9.2 + beakOpen);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril & red tongue
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.ellipse(12.5, -14.8, 1.1, 0.6, -0.2, 0, Math.PI * 2);
  ctx.fill();

  if (s.isAttacking || s.isEnraged) {
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(13.0, -12.0 + beakOpen * 0.45, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Steam puffs shooting from beak in winter frost
  drawFuriantSteamPuffs(ctx, 25.5, -13.0, time, 1);

  // 7. Right 2-Jointed Articulated Wing-Arm & 4-Fingered Claw Hand Gripping Frost-Twig Sceptre
  const rShoulderX = 8.2;
  const rShoulderY = -2.0;
  const rElbowX = s.isWindup ? 10.5 - s.windupProgress * 3.0 : s.isStrike ? 14.5 + s.strikeProgress * 3.5 : 12.8;
  const rElbowY = s.isWindup ? 0.5 - s.windupProgress * 3.5 : s.isStrike ? -1.0 + s.strikeProgress * 1.5 : 1.5 - wingBeat * 0.3;
  const rWristX = s.isWindup ? 12.5 - s.windupProgress * 3.5 : s.isStrike ? 19.5 + s.strikeProgress * 5.0 : 16.5;
  const rWristY = s.isWindup ? -4.5 - s.windupProgress * 5.0 : s.isStrike ? -1.5 + s.strikeProgress * 3.0 : -0.5 - wingBeat * 0.6;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.6,
    4.6,
    '#1E293B',
    '#0F172A',
    '#475569',
    '#DC2626'
  );

  // Frosted thorny branch sceptre with dangling icicle (pevně sevřená v pařátu)
  const twigAngle = s.isWindup
    ? -0.5 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.45 + s.strikeProgress * 0.6
    : -0.15;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(twigAngle);

  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-1.4, -18.0, 2.8, 25.0);
  ctx.fill();
  ctx.stroke();

  // Sharp icicle shard at tip
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.moveTo(-2.8, -17.5);
  ctx.lineTo(2.8, -17.5);
  ctx.lineTo(0, -26.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, twigAngle, '#334155', '#0F172A', 3.0, '#FBBF24');

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. TAJÍCÍ SNĚHULÁK (Melting Snowman, L1 Mini-boss)
// Archetyp: Rozšafný tající sněhulák s otlučeným hrncem, koštětem v rukavicích a louží
// ---------------------------------------------------------------------------
export function drawHospodaMeltingSnowman(
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
  const scale = 2.3;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.09);
  } else if (s.isWindup) {
    ctx.rotate(-0.07 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.11 * s.strikeProgress);
  }

  // 1. Sprawling Muddy Thaw Puddle & Properly Grounded Water Drips
  ctx.save();
  ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
  ctx.beginPath();
  const puddlePulse = (s.isMoving ? Math.abs(s.stride) * 2.5 : 0) + Math.sin(time * 2.5) * 1.0;
  ctx.ellipse(0, 22.5, 25.5 + puddlePulse, 7.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Melting water drips with explicit groundY = 23.0
  drawRealisticDripCycle2D(ctx, -12.5, 14.0, 23.0, time, 1.25, 0.1, 2.0);
  drawRealisticDripCycle2D(ctx, 13.5, 13.5, 23.0, time, 1.25, 0.6, 1.9);
  ctx.restore();

  // 2. Bottom Snowball & Coal-Booted Feet (respektující klidový postoj vx === 0 vs. chůzi vx !== 0)
  const waddleStep = s.stride * 4.0;
  for (const side of [-1, 1]) {
    const shift = side === -1 ? waddleStep : -waddleStep;
    const fx = side * 8.5 + shift;
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(fx, 21.2, 5.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3-tier gouache bottom snowball
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(waddleStep * 0.2, 12.0, 18.8, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snowball shadow & highlight
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.ellipse(-4.5, 15.0, 12.5, 6.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(5.5, 8.5, 7.5, 4.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Mud splatters & cross-stitched burlap patch on bottom snowball
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.arc(-8.5, 17.2, 2.3, 0, Math.PI * 2);
  ctx.arc(7.2, 18.0, 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-11.5, 8.5, 5.5, 4.5);
  ctx.fill();
  ctx.stroke();

  // Coal buttons
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  for (const by of [9.0, 14.2]) {
    ctx.beginPath();
    ctx.arc(0, by, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Left 2-Jointed Articulated Birch-Branch Arm & Red Woolen Mitten
  const armSway = s.isMoving ? s.stride * 3.2 : Math.sin(time * 2.3) * 0.7;
  const lShoulderX = -13.0;
  const lShoulderY = -1.5;
  const lElbowX = -18.2;
  const lElbowY = 1.5 + armSway * 0.5;
  const lWristX = -21.5;
  const lWristY = -1.0 + armSway;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    4.2,
    3.5,
    '#78350F',
    '#451A03',
    '#A16207',
    '#E2E8F0'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, -0.4, '#DC2626', '#991B1B', 2.8);

  // 4. Middle Snowball & Striped Woolen Scarf
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14.8, 10.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.ellipse(-4.0, 2.5, 8.5, 5.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Coal button on belly
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(0, 1.2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Striped Woolen Scarf (Pruhovaná teplá šála)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -9.0, 13.8, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(-9.0, -11.0, 3.4, 4.2);
  ctx.rect(0, -11.0, 3.4, 4.2);
  ctx.rect(7.8, -11.0, 3.4, 4.2);
  ctx.fill();

  const scarfWave = (s.isMoving ? s.stride * 2.5 : 0) + Math.sin(time * 5.0) * 1.6;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(8.0, -8.0);
  ctx.quadraticCurveTo(17.5, -4.0 + scarfWave, 21.0, 5.5 + scarfWave);
  ctx.lineTo(17.0, 6.8 + scarfWave);
  ctx.lineTo(5.8, -6.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Head Snowball with Multi-Layered Expressive Coal Eyes & Carrot Nose
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -17.0, 11.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expressive Lada coal-rimmed eyes
  const pupilX = s.isStrike ? 0.95 : s.isWindup ? -0.45 : 0.45;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.22 : 0.05;
  const browTilt = s.isAttacking || s.isEnraged ? 1.5 : -0.5;

  drawLadaExpressiveEye2D(
    ctx,
    -4.2,
    -19.2,
    2.6,
    2.7,
    '#F8FAFC',
    s.isEnraged ? '#DC2626' : '#0F172A',
    pupilX,
    0,
    eyeSquint,
    '#1E293B',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    4.2,
    -19.2,
    2.6,
    2.7,
    '#F8FAFC',
    s.isEnraged ? '#DC2626' : '#0F172A',
    pupilX,
    0,
    eyeSquint,
    '#1E293B',
    -browTilt,
    0
  );

  // Giant Grooved Carrot Nose
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(1.0, -17.2);
  ctx.lineTo(16.8, -15.0);
  ctx.lineTo(1.0, -13.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(6.0, -16.5);
  ctx.lineTo(6.0, -13.6);
  ctx.moveTo(11.0, -16.0);
  ctx.lineTo(11.0, -14.1);
  ctx.stroke();

  // Coal smile pebbles
  ctx.fillStyle = '#1E293B';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * 2.8, -11.8 + (i === 0 ? 1.4 : 0), 1.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Old Battered Enamel Cooking Pot as Hat (Otlučený hrnec s uchem)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9.2, -24.0);
  ctx.lineTo(-7.2, -34.2);
  ctx.lineTo(7.2, -34.2);
  ctx.lineTo(9.2, -24.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(0, -24.0, 10.2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-8.2, -29.0, 3.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(2.2, -29.2, 2.4, 0, Math.PI * 2);
  ctx.fill();

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 0, -35.5, time, 1);
  }

  // 7. Right 2-Jointed Articulated Arm & 4-Fingered Mitten Hand Gripping Birch Broom
  const rShoulderX = 12.5;
  const rShoulderY = -1.5;
  const rElbowX = s.isWindup ? 14.5 - s.windupProgress * 2.5 : s.isStrike ? 17.5 + s.strikeProgress * 3.0 : 16.2;
  const rElbowY = s.isWindup ? 1.0 - s.windupProgress * 3.0 : s.isStrike ? -0.5 + s.strikeProgress * 1.5 : 2.0 - armSway * 0.4;
  const rWristX = s.isWindup ? 16.0 - s.windupProgress * 3.5 : s.isStrike ? 22.0 + s.strikeProgress * 4.5 : 19.5;
  const rWristY = s.isWindup ? -4.5 - s.windupProgress * 4.5 : s.isStrike ? -1.0 + s.strikeProgress * 3.5 : -0.5 - armSway * 0.7;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    4.2,
    3.5,
    '#78350F',
    '#451A03',
    '#A16207',
    '#E2E8F0'
  );

  // Birch Broom (Březové koště pevně sevřené v rukavici)
  const broomAngle = s.isWindup
    ? -0.45 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.4 + s.strikeProgress * 0.6
    : -0.15 + Math.sin(time * 3) * 0.06;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(broomAngle);

  // Wooden broom shaft passing through hand (0, 0)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-1.4, -18.0, 2.8, 30.0);
  ctx.fill();
  ctx.stroke();

  // Birch twigs bundle at top
  ctx.fillStyle = '#A16207';
  ctx.beginPath();
  ctx.moveTo(-3.5, -17.5);
  ctx.lineTo(-9.5, -31.0);
  ctx.lineTo(9.5, -31.0);
  ctx.lineTo(3.5, -17.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red binding twine on twigs
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-5.2, -21.0);
  ctx.lineTo(5.2, -21.0);
  ctx.stroke();
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, broomAngle, '#DC2626', '#991B1B', 2.9);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. MRAZIVÝ OBR (Frost Giant, L1 Mezi-boss)
// Archetyp: Komicky vzteklý a furiantský horský obr s rampouchovým vousem a kmenem jedle
// ---------------------------------------------------------------------------
export function drawHospodaFrostGiant(
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
  const scale = 2.6;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.13 * s.strikeProgress);
  }

  // 1. Ice-Cracking Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Colossal Stone Legs & Fur-Lined Boots (respektující vx === 0 vs. vx !== 0)
  const strideShift = s.stride * 5.2;
  for (const side of [-1, 1]) {
    const lx = side * 9.8 + (side === -1 ? strideShift : -strideShift);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lx - 5.0, 8.0);
    ctx.lineTo(lx - 7.0, 24.0);
    ctx.lineTo(lx + 7.0, 24.0);
    ctx.lineTo(lx + 5.0, 8.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sheepskin trim on boots
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(lx, 21.0, 7.6, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Heavy iron studded sole
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(lx - 7.0, 24.0, 14.0, 3.0);
  }

  // 3. Left 2-Jointed Articulated Frost-Stone Arm & 4-Fingered Fist
  const armSwing = s.isMoving ? s.stride * 3.5 : Math.sin(time * 2.2) * 0.8;
  const lShoulderX = -17.5;
  const lShoulderY = -6.5;
  const lElbowX = -23.5;
  const lElbowY = 0.5 + armSwing * 0.5;
  const lWristX = -26.0;
  const lWristY = 6.5 + armSwing;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    6.8,
    5.6,
    '#94A3B8',
    '#475569',
    '#CBD5E1',
    '#78350F'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, 0.5, '#94A3B8', '#475569', 3.6);

  // 4. Massive 3-Tier Gouache Torso in Patched Sheepskin Vest & Rope Belt
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 21.5, 17.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sheepskin vest over shoulders with 3-tier shading
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(-18.0, -14.0);
  ctx.lineTo(18.0, -14.0);
  ctx.lineTo(16.2, 6.2);
  ctx.lineTo(6.0, 4.2);
  ctx.lineTo(0, 7.2);
  ctx.lineTo(-6.0, 4.2);
  ctx.lineTo(-16.2, 6.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#451A03';
  ctx.fillRect(-15.0, 1.5, 10.0, 3.5);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(4.5, -11.5, 8.5, 6.5);

  // Cross-stitched patch on vest
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(-12.5, -7.5, 6.5, 5.2);
  ctx.fill();
  ctx.stroke();

  // Heavy braided rope belt with wooden buckle
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-19.0, 7.2);
  ctx.lineTo(19.0, 7.2);
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-5.0, 4.5, 10.0, 6.0);
  ctx.fill();
  ctx.stroke();

  // 5. Huge Stone-Hewn Head with Icicle Beard & Multi-Layered Expressive Eyes
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -16.0, 13.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Magnificent Icicle Beard (Hustý rampouchový plnovous)
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  const iciclePoints: Array<[number, number, number, number]> = [
    [-10, -10, -11, 4],
    [-6, -9, -7, 9],
    [-2, -8, -3, 13],
    [2, -8, 2, 14],
    [6, -9, 6, 8],
    [10, -10, 9, 3],
  ];
  for (const [bx, by, tx, ty] of iciclePoints) {
    ctx.beginPath();
    ctx.moveTo(bx - 2.5, by);
    ctx.lineTo(bx + 2.5, by);
    ctx.lineTo(tx, ty);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Multi-layered Lada expressive giant eyes
  const pupilX = s.isStrike ? 1.1 : s.isWindup ? -0.5 : 0.55;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.25 : 0.08;
  const browTilt = s.isAttacking || s.isEnraged ? 2.0 : 1.1;

  drawLadaExpressiveEye2D(
    ctx,
    -5.0,
    -18.0,
    3.4,
    3.2,
    '#FFFFFF',
    s.isEnraged ? '#EF4444' : '#0284C7',
    pupilX,
    0,
    eyeSquint,
    '#F1F5F9',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    5.0,
    -18.0,
    3.4,
    3.2,
    '#FFFFFF',
    s.isEnraged ? '#EF4444' : '#0284C7',
    pupilX,
    0,
    eyeSquint,
    '#F1F5F9',
    -browTilt,
    0
  );

  // Broad bulbous frostbitten nose with bluish blush & warts
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -14.5, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bared angry teeth
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-6.0, -10.0, 12.0, 4.0);
  ctx.fill();
  ctx.stroke();
  for (let t = -4; t <= 4; t += 2) {
    ctx.beginPath();
    ctx.moveTo(t, -10.0);
    ctx.lineTo(t, -6.0);
    ctx.stroke();
  }

  // Steam chugging from nostrils
  drawFuriantSteamPuffs(ctx, 0, -12.0, time, 1);

  // 6. Right 2-Jointed Articulated Frost-Stone Arm & 4-Fingered Hand Gripping Giant Fir Tree Trunk Club
  const rShoulderX = 16.5;
  const rShoulderY = -6.0;
  const rElbowX = s.isWindup ? 18.0 - s.windupProgress * 3.0 : s.isStrike ? 22.0 + s.strikeProgress * 3.5 : 20.5;
  const rElbowY = s.isWindup ? -2.0 - s.windupProgress * 4.5 : s.isStrike ? 0.5 + s.strikeProgress * 2.0 : 0.5 - armSwing * 0.4;
  const rWristX = s.isWindup ? 19.5 - s.windupProgress * 4.0 : s.isStrike ? 26.5 + s.strikeProgress * 5.0 : 23.5;
  const rWristY = s.isWindup ? -9.5 - s.windupProgress * 6.0 : s.isStrike ? -1.5 + s.strikeProgress * 4.5 : -2.5 - armSwing * 0.7;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    6.8,
    5.6,
    '#94A3B8',
    '#475569',
    '#CBD5E1',
    '#78350F'
  );

  // Giant Uprooted Fir Tree Trunk Club (Celý kmen zasněžené jedle pevně sevřený v dlani)
  const clubAngle = s.isWindup
    ? -0.45 - s.windupProgress * 0.5
    : s.isStrike
    ? 0.4 + s.strikeProgress * 0.65
    : -0.15;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(clubAngle);

  // Trunk passing directly through giant's hand at (0, 0)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-3.8, 16.0);
  ctx.lineTo(3.8, 16.0);
  ctx.lineTo(6.5, -28.0);
  ctx.lineTo(-6.5, -28.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fir needle crown on club top
  ctx.fillStyle = '#14532D';
  ctx.beginPath();
  ctx.moveTo(0, -37.0);
  ctx.lineTo(11.5, -25.0);
  ctx.lineTo(5.0, -25.0);
  ctx.lineTo(13.5, -15.0);
  ctx.lineTo(-13.5, -15.0);
  ctx.lineTo(-5.0, -25.0);
  ctx.lineTo(-11.5, -25.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snow cap on fir crown
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -35.0, 4.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, clubAngle, '#94A3B8', '#475569', 3.8);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. OBŘÍ KOLEDNICKÝ BERÁNEK (Beránek, L2 Mini-boss)
// Archetyp: Rozšafný a rozverný upečený velikonoční beránek se zlatým zvoncem a korouhvičkou
// ---------------------------------------------------------------------------
export function drawHospodaBeranek(
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
  const scale = 2.2;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.14 * s.strikeProgress);
  }

  // 1. Festive Easter Meadow Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(22, 101, 52, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 20.5, 22, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Four Articulated Baked Trotters in Buckled Slippers (respektující vx === 0 vs. vx !== 0)
  const gallop = s.stride * 4.5;
  const legPositions: Array<[number, number, string]> = [
    [-12.5, -gallop * 0.8, '#B45309'],
    [-7.5, gallop, '#D97706'],
    [6.5, -gallop, '#B45309'],
    [11.5, gallop * 0.8, '#D97706'],
  ];

  for (const [baseX, shift, col] of legPositions) {
    const hx = baseX + shift;
    ctx.fillStyle = col;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(hx - 2.6, 9.5);
    ctx.lineTo(hx - 2.8, 19.5);
    ctx.lineTo(hx + 2.8, 19.5);
    ctx.lineTo(hx + 2.6, 9.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little black hoof tip with brass buckle
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(hx - 3.2, 17.8, 6.4, 2.8);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(hx - 1.2, 18.2, 2.4, 1.4);
  }

  // 3. 3-Tier Golden-Baked Biscuit Pastry Body with Fluffy Sugar Wool Texture
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#FDE68A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 3.8, 18.2, 13.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden baked crust shadow & highlight
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(-3.5, 9.2, 13.5, 5.5, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.ellipse(3.0, -1.5, 10.5, 4.8, -0.08, 0, Math.PI * 2);
  ctx.fill();

  // Confectioner's White Sugar Wool Puffs (Cukrová poleva s vlnkami)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  const woolPuffs: Array<[number, number, number]> = [
    [-12, 0, 5.0],
    [-6, -4, 6.0],
    [2, -5, 6.0],
    [10, -2, 5.0],
    [-10, 6, 5.0],
    [-3, 6, 6.0],
    [6, 6, 5.5],
    [12, 4, 4.5],
  ];
  for (const [wx, wy, wr] of woolPuffs) {
    ctx.beginPath();
    ctx.arc(wx, wy, wr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Festive Easter Sugar-Cross Banner tucked into wool back
  ctx.save();
  ctx.translate(-4.0, -5.0);
  ctx.rotate(-0.15 + (s.isMoving ? s.stride * 0.08 : 0));
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, -18);
  ctx.stroke();

  // Red & white folk pennant flag
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -17.5);
  ctx.lineTo(-12.5, -14.0);
  ctx.lineTo(-9.5, -11.0);
  ctx.lineTo(-12.5, -8.0);
  ctx.lineTo(0, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2, -13.0);
  ctx.lineTo(-8, -13.0);
  ctx.moveTo(-5, -15.5);
  ctx.lineTo(-5, -10.5);
  ctx.stroke();
  ctx.restore();

  // Fluffy little tail with pink ribbon
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-18.2, 2.0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.ellipse(-19.0, 1.0, 3.0, 2.0, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red Silk Neck Ribbon with Golden Brass Bell (Červená pentle se zvonkem)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(7.2, -6.0, 7.6, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const bellSwing = (s.isMoving ? s.stride * 3.0 : 0) + Math.sin(time * 5.0) * 1.2;
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(9.2 + bellSwing * 0.35, -1.0, 3.5, Math.PI, 0);
  ctx.lineTo(13.6 + bellSwing * 0.35, 3.0);
  ctx.lineTo(4.6 + bellSwing * 0.35, 3.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(9.2 + bellSwing * 0.35, 4.0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  if (s.isMoving || s.isAttacking) {
    drawMusicNote2D(ctx, 15.5, -4.0, 0, 0.8);
  }

  // 4. Baked Lamb Head with Curly Horns & Multi-Layered Expressive Eye
  const headTilt = s.isStrike ? 0.22 * s.strikeProgress : s.isWindup ? -0.15 * s.windupProgress : -0.18;
  ctx.save();
  ctx.translate(12.0, -14.0);
  ctx.rotate(headTilt);

  ctx.fillStyle = '#FDE68A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9.2, 8.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White sugar curl on forehead
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2.0, -4.2, 4.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden curly butter horns
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(-4.5, -5.0, 4.6, Math.PI * 0.75, Math.PI * 2.2);
  ctx.stroke();
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(3.0, -5.8, 4.6, Math.PI * 0.7, Math.PI * 2.1);
  ctx.stroke();

  // Soft long droopy lamb ear
  ctx.fillStyle = '#FBCFE8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-7.8, 1.0, 5.8, 2.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Multi-layered Lada expressive eye
  const pupilX = s.isStrike ? 0.9 : s.isWindup ? -0.4 : 0.45;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.2 : 0;
  const browTilt = s.isAttacking || s.isEnraged ? 1.4 : -0.5;

  drawLadaExpressiveEye2D(
    ctx,
    1.5,
    -1.2,
    3.3,
    3.5,
    '#FFFFFF',
    s.isEnraged ? '#DC2626' : '#78350F',
    pupilX,
    0,
    eyeSquint,
    '#78350F',
    -browTilt,
    0
  );

  // Rosy cheek & freckles
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.arc(-1.0, 2.8, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Pink snout & chewing mouth with spring clover
  ctx.fillStyle = '#F472B6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(7.0, 1.8, 2.5, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(7.0, 2.8);
  ctx.quadraticCurveTo(12.0, 3.8, 15.0, 6.8);
  ctx.stroke();

  drawFolkFlower2D(ctx, 16.0, 6.8, 3.2, '#22C55E', '#166534');

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 9.5, -2.0, time, 1);
  }
  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. KLEKÁNICE (Klekanice, L3 Mini-boss)
// Archetyp: Zlomyslná a potměšilá večerní babice s mosazným zvonem, holí a proutěnou nůší
// ---------------------------------------------------------------------------
export function drawHospodaKlekanice(
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
  const scale = 2.3;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(-0.09);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.13 * s.strikeProgress);
  }

  // 1. Creeping Evening Dusk Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(30, 27, 75, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 22.5, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Wicker Basket on Back (Proutěná nůše na neposlušné děti)
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-15.5, -16.0);
  ctx.lineTo(-5.5, -16.0);
  ctx.lineTo(-7.0, 5.0);
  ctx.lineTo(-14.0, 5.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wicker weave cross-lines on basket
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  for (const wy of [-12, -7, -2]) {
    ctx.beginPath();
    ctx.moveTo(-15.0, wy);
    ctx.lineTo(-6.2, wy);
    ctx.stroke();
  }

  // 3. Heavy Studded Boots (respektující klidový postoj vx === 0 vs. chůzi vx !== 0)
  const legStep = s.stride * 4.2;
  for (const side of [-1, 1]) {
    const bx = side * 5.2 + (side === -1 ? legStep : -legStep);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(bx - 3.0, 18.2, 6.2, 4.2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. 3-Tier Gouache Peasant Wool Skirt & Patched Apron (Tmavomodrá sukně a zástěra)
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#1E1B4B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-11.0, -2.0);
  ctx.lineTo(11.0, -2.0);
  ctx.lineTo(14.2, 19.5);
  ctx.lineTo(-14.2, 19.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Skirt shadow & folk hem border
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-13.0, 15.5, 26.0, 3.2);
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-13.5, 17.5);
  ctx.lineTo(13.5, 17.5);
  ctx.stroke();

  // Ochre patched apron with pocket & poppy heads (makovice)
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-7.2, 0);
  ctx.lineTo(7.2, 0);
  ctx.lineTo(8.2, 16.8);
  ctx.lineTo(-8.2, 16.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.rect(-5.0, 6.0, 10.0, 7.8);
  ctx.fill();
  ctx.stroke();

  // Cross-stitched patch on apron
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.rect(1.5, 11.2, 4.2, 3.6);
  ctx.fill();
  ctx.stroke();

  // Poppy heads in pocket
  ctx.fillStyle = '#4B5563';
  ctx.beginPath();
  ctx.arc(-2.0, 5.0, 2.2, 0, Math.PI * 2);
  ctx.arc(2.0, 4.5, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Hunched Shoulders in Polka-Dot Shawl
  ctx.fillStyle = '#7C2D12';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -5.0, 12.2, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF3C7';
  for (const [px, py] of [
    [-7, -5],
    [-3, -7],
    [3, -7],
    [7, -5],
    [0, -3],
  ]) {
    ctx.beginPath();
    ctx.arc(px, py, 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Left 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Crooked Cane
  const armSway = s.isMoving ? s.stride * 3.0 : Math.sin(time * 2.5) * 0.7;
  const lShoulderX = -9.5;
  const lShoulderY = -4.2;
  const lElbowX = -14.2;
  const lElbowY = 0.5 + armSway * 0.4;
  const lWristX = -16.2;
  const lWristY = 5.0 + armSway * 0.8;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    4.6,
    3.8,
    '#7C2D12',
    '#451A03',
    '#9A3412',
    '#FEF3C7'
  );

  // Crooked wooden cane (sukovice) held in left hand
  ctx.save();
  ctx.translate(lWristX, lWristY);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -4.0);
  ctx.lineTo(-1.5, 16.5);
  ctx.stroke();
  ctx.restore();

  drawGrippingHand2D(ctx, lWristX, lWristY, 0.2, '#F2CCB6', '#D9A07A', 2.6);

  // 7. Shrewd Old Witch Face with Hooked Nose, Wart & Multi-Layered Expressive Eyes
  ctx.fillStyle = '#F2CCB6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -14.0, 9.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue kerchief tied tight over head & knot under chin
  ctx.fillStyle = '#0369A1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -16.0, 11.0, Math.PI * 0.8, Math.PI * 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(0, -6.4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Multi-layered Lada expressive cat-yellow eyes
  const pupilX = s.isStrike ? 0.95 : s.isWindup ? -0.45 : 0.45;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.24 : 0.1;
  const browTilt = s.isAttacking || s.isEnraged ? 1.6 : 0.8;

  drawLadaExpressiveEye2D(
    ctx,
    -3.5,
    -15.8,
    2.7,
    2.5,
    '#FEF08A',
    s.isEnraged ? '#DC2626' : '#0F172A',
    pupilX,
    0,
    eyeSquint,
    '#451A03',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    3.5,
    -15.8,
    2.7,
    2.5,
    '#FEF08A',
    s.isEnraged ? '#DC2626' : '#0F172A',
    pupilX,
    0,
    eyeSquint,
    '#451A03',
    -browTilt,
    0
  );

  // Prominent hooked Ladovský nose with wart & bristle hair
  ctx.fillStyle = '#E59B7D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -15.8);
  ctx.quadraticCurveTo(8.0, -14.0, 8.0, -10.0);
  ctx.quadraticCurveTo(2.0, -9.0, 0, -12.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(5.8, -11.0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Toothless cackling mouth with single crooked tooth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, -9.5, 3.5, 2.5, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-1.0, -10.5, 1.8, 2.2);

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 0, -24.5, time, 1);
  }

  // 8. Right 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Brass Curfew Bell
  const rShoulderX = 9.2;
  const rShoulderY = -4.0;
  const rElbowX = s.isWindup ? 11.2 - s.windupProgress * 2.5 : s.isStrike ? 14.5 + s.strikeProgress * 3.0 : 12.8;
  const rElbowY = s.isWindup ? -0.5 - s.windupProgress * 3.0 : s.isStrike ? 0.5 + s.strikeProgress * 1.5 : 1.5 - armSway * 0.4;
  const rWristX = s.isWindup ? 13.0 - s.windupProgress * 3.0 : s.isStrike ? 18.5 + s.strikeProgress * 4.5 : 15.8;
  const rWristY = s.isWindup ? -5.0 - s.windupProgress * 4.5 : s.isStrike ? 0.5 + s.strikeProgress * 3.5 : 2.5 - armSway * 0.8;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    4.6,
    3.8,
    '#7C2D12',
    '#451A03',
    '#9A3412',
    '#FEF3C7'
  );

  // Heavy Brass Curfew Bell (Těžký mosazný klekániční zvon pevně sevřený za rukojeť)
  const bellAngle = s.isWindup
    ? -0.5 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.55 + s.strikeProgress * 0.6
    : Math.sin(time * 6) * 0.14;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(bellAngle);

  // Wooden bell handle passing through hand (0, 0)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-1.5, -4.5, 3.0, 8.5);
  ctx.fill();
  ctx.stroke();

  // Brass bell dome below handle
  ctx.fillStyle = '#F59E0B';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 5.5, 5.2, Math.PI, 0);
  ctx.quadraticCurveTo(7.2, 11.5, 8.8, 16.0);
  ctx.lineTo(-8.8, 16.0);
  ctx.quadraticCurveTo(-7.2, 11.5, -5.2, 5.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bell clapper
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, 17.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (s.isAttacking || s.isEnraged) {
    drawMusicNote2D(ctx, 11.5, 6.0, 0, 0.95);
    drawMusicNote2D(ctx, 8.5, -3.5, 1, 1.05);
  }
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, bellAngle, '#F2CCB6', '#D9A07A', 2.7);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. ČARODĚJNICE ZASPALKA (BroomWitchZaspalka, L4 Mini-boss)
// Archetyp: Rozšafná / potměšilá rozespalá ježibaba na starém koštěti s lucernou
// ---------------------------------------------------------------------------
export function drawHospodaBroomWitchZaspalka(
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
  const scale = 2.3;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.14 * s.strikeProgress);
  }

  // 1. Midnight Aerial Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24.0, 22, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flying Birch Broom (Staré březové koště s uzlem a větvičkami)
  const broomTilt = (s.isMoving ? s.stride * 1.8 : 0) + Math.sin(time * 4.5) * 1.2;
  ctx.save();
  ctx.rotate(0.08 + (s.isStrike ? 0.22 * s.strikeProgress : 0));

  // Ash broomstick handle
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-28.0, 2.2 + broomTilt, 52.0, 3.2);
  ctx.fill();
  ctx.stroke();

  // Birch twigs bundle at back with red twine binding
  ctx.fillStyle = '#92400E';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-22.0, 3.8 + broomTilt);
  ctx.lineTo(-35.0, -4.2 + broomTilt);
  ctx.lineTo(-38.5, 11.8 + broomTilt);
  ctx.lineTo(-23.5, 7.8 + broomTilt);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-25.0, 0.5 + broomTilt);
  ctx.lineTo(-25.0, 8.5 + broomTilt);
  ctx.stroke();

  // Dangling Brass Lantern on Broom Front
  const lanternSwing = (s.isMoving ? s.stride * 3.5 : 0) + Math.sin(time * 6.5) * 2.0;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(22.0, 3.5 + broomTilt);
  ctx.lineTo(22.0 + lanternSwing * 0.3, 10.2 + broomTilt);
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(18.0 + lanternSwing * 0.3, 10.2 + broomTilt, 8.0, 9.8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.arc(22.0 + lanternSwing * 0.3, 15.0 + broomTilt, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 3. Striped Woolen Socks & Slippers (respektující klidový postoj vx === 0 vs. let vx !== 0)
  const legKick = s.stride * 3.8;
  for (const side of [-1, 1]) {
    const sx = side * 4.8 + (side === -1 ? legKick : -legKick);
    ctx.fillStyle = '#F1F5F9';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.rect(sx - 2.1, 12.8, 4.2, 7.2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sx - 2.0, 15.3);
    ctx.lineTo(sx + 2.0, 15.3);
    ctx.moveTo(sx - 2.0, 17.8);
    ctx.lineTo(sx + 2.0, 17.8);
    ctx.stroke();

    // Felt bedroom slipper with pompom
    ctx.fillStyle = '#7C2D12';
    ctx.beginPath();
    ctx.ellipse(sx + 1.0, 20.2, 3.4, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. 3-Tier Gouache Flower-Patched Nightgown (Květovaná a záplatovaná noční košile)
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#DDD6FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9.2, -4.2);
  ctx.lineTo(9.2, -4.2);
  ctx.lineTo(13.2, 14.0);
  ctx.lineTo(-13.2, 14.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nightgown shadow & highlight
  ctx.fillStyle = '#C4B5FD';
  ctx.fillRect(-11.5, 10.2, 23.0, 3.0);
  ctx.fillStyle = '#EDE9FE';
  ctx.fillRect(-6.5, -2.5, 5.5, 8.0);

  // Cross-stitched patch & folk flowers on nightgown
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-8.5, 6.2, 4.5, 3.6);
  ctx.fill();
  ctx.stroke();

  drawFolkFlower2D(ctx, -4.5, 1.5, 2.5, '#EC4899', '#FDF2F8');
  drawFolkFlower2D(ctx, 4.5, 7.0, 2.5, '#3B82F6', '#EFF6FF');

  // 5. Left & Right 2-Jointed Articulated Arms & 4-Fingered Hands Gripping Broomstick & Pillow
  const lShoulderX = -7.8;
  const lShoulderY = -2.2;
  const lElbowX = -11.5;
  const lElbowY = 1.2 + broomTilt * 0.4;
  const lWristX = -9.5;
  const lWristY = 4.2 + broomTilt;

  drawArticulatedArm2D(
    ctx,
    lShoulderX,
    lShoulderY,
    lElbowX,
    lElbowY,
    lWristX,
    lWristY,
    4.4,
    3.6,
    '#DDD6FE',
    '#C4B5FD',
    '#EDE9FE',
    '#EC4899'
  );
  drawGrippingHand2D(ctx, lWristX, lWristY, 1.3, '#FBCFE8', '#F472B6', 2.6);

  // 6. Sleepy Shrewd Face with Multi-Layered Expressive Drowsy Eyes & Yawning Mouth
  ctx.fillStyle = '#FBCFE8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12.2, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Disheveled grey hair strands sticking out
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.0;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-8.0 + i * 4.0, -18.0);
    ctx.lineTo(-10.5 + i * 4.8, -23.5 + Math.sin(time * 4 + i) * 1.5);
    ctx.stroke();
  }

  // Sleepy half-closed Lada expressive eyes (snapping wide open during strike/enraged!)
  const pupilX = s.isStrike ? 0.9 : 0.35;
  const eyeSquint = s.isStrike || s.isEnraged ? 0.08 : 0.42;
  const browTilt = s.isStrike || s.isEnraged ? 1.5 : -0.6;

  drawLadaExpressiveEye2D(
    ctx,
    -3.8,
    -14.0,
    2.7,
    2.4,
    '#FFFFFF',
    s.isEnraged ? '#DC2626' : '#4338CA',
    pupilX,
    0,
    eyeSquint,
    '#64748B',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    3.8,
    -14.0,
    2.7,
    2.4,
    '#FFFFFF',
    s.isEnraged ? '#DC2626' : '#4338CA',
    pupilX,
    0,
    eyeSquint,
    '#64748B',
    -browTilt,
    0
  );

  // Hooked nose with freckles
  ctx.fillStyle = '#F472B6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(1.0, -11.0, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yawning open mouth with pink tongue
  ctx.fillStyle = '#831843';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(1.0, -7.4, 3.4, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(1.0, -6.5, 1.9, 0, Math.PI);
  ctx.fill();

  // 7. Polka-dot Nightcap with Pompom (Noční čepec s bambulí)
  const capWave = (s.isMoving ? s.stride * 2.5 : 0) + Math.sin(time * 5.0) * 2.0;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10.0, -16.0);
  ctx.quadraticCurveTo(-6.0, -28.0, 4.0, -30.0);
  ctx.quadraticCurveTo(14.0, -26.0 + capWave, 16.0, -18.0 + capWave);
  ctx.lineTo(8.0, -17.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2.0, -22.0, 1.1, 0, Math.PI * 2);
  ctx.arc(4.0, -25.0, 1.1, 0, Math.PI * 2);
  ctx.arc(16.0, -18.0 + capWave, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (s.isEnraged || s.isStrike) {
    drawFuriantSteamPuffs(ctx, 0, -29.0, time, 1);
  }

  // Right 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Front of Broomstick
  const rShoulderX = 7.8;
  const rShoulderY = -2.0;
  const rElbowX = s.isStrike ? 13.5 : 11.2;
  const rElbowY = 0.8 + broomTilt * 0.5;
  const rWristX = s.isStrike ? 15.5 : 12.5;
  const rWristY = 3.8 + broomTilt;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    4.4,
    3.6,
    '#DDD6FE',
    '#C4B5FD',
    '#EDE9FE',
    '#EC4899'
  );
  drawGrippingHand2D(ctx, rWristX, rWristY, 1.4, '#FBCFE8', '#F472B6', 2.7);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. LEDOVÍ MUŽI (LedoviMuzi, L4 Vele-boss)
// Archetyp: Komicky vzteklí a furiantští tři mraziví bratři (Pankrác, Servác, Bonifác)
// ---------------------------------------------------------------------------
export function drawHospodaLedoviMuzi(
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
  const scale = 2.5;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.07 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.12 * s.strikeProgress);
  }

  // 1. Vast Freezing Aura Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(12, 74, 110, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Four Heavy Studded Boots (respektující klidový postoj vx === 0 vs. chůzi vx !== 0)
  const bootStride = s.stride * 4.2;
  const bootOffsets: Array<[number, number]> = [
    [-16, bootStride],
    [-6, -bootStride],
    [6, bootStride],
    [16, -bootStride],
  ];
  for (const [bx, shift] of bootOffsets) {
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(bx - 3.2 + shift, 18.5, 6.4, 5.2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Left 2-Jointed Articulated Coat Arm & 4-Fingered Hand (Servác's Arm)
  const armSway = s.isMoving ? s.stride * 3.2 : Math.sin(time * 2.4) * 0.7;
  drawArticulatedArm2D(
    ctx,
    -20.5,
    -3.5,
    -25.5,
    1.5 + armSway * 0.5,
    -27.5,
    6.5 + armSway,
    5.4,
    4.5,
    '#0369A1',
    '#0C4A6E',
    '#0284C7',
    '#F0F9FF'
  );
  drawGrippingHand2D(ctx, -27.5, 6.5 + armSway, 0.4, '#38BDF8', '#0284C7', 3.0);

  // 4. Heavy 3-Tier Sheepskin Coat (Trojitý mohutný kožich s beránčím lemem a záplatou)
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#0369A1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-22.0, -6.0);
  ctx.lineTo(22.0, -6.0);
  ctx.lineTo(24.0, 18.5);
  ctx.lineTo(-24.0, 18.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coat shadow & highlight
  ctx.fillStyle = '#0C4A6E';
  ctx.fillRect(-22.0, 12.5, 44.0, 4.5);
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(-16.0, -4.0, 12.0, 10.0);

  // White wool lining on coat bottom
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (const bx of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.ellipse(bx, 17.5, 7.2, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --- LEFT BROTHER: SERVÁC (Vzteklý v beranici) ---
  ctx.save();
  ctx.translate(-14, -14);
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, -5, 9, Math.PI, 0);
  ctx.rect(-9, -5, 18, 4);
  ctx.fill();
  ctx.stroke();

  drawLadaExpressiveEye2D(ctx, -2.6, 0.5, 2.1, 2.1, '#FFFFFF', '#0369A1', 0.4, 0, 0.15, '#FFFFFF', 1.4, 0);
  drawLadaExpressiveEye2D(ctx, 2.6, 0.5, 2.1, 2.1, '#FFFFFF', '#0369A1', 0.4, 0, 0.15, '#FFFFFF', -1.4, 0);

  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.lineTo(6, 5);
  ctx.lineTo(0, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- RIGHT BROTHER: BONIFÁC (Bafající z hliněné fajfky) ---
  ctx.save();
  ctx.translate(14, -14);
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(8, -4);
  ctx.lineTo(4, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawLadaExpressiveEye2D(ctx, -2.6, 0.5, 2.1, 2.1, '#FFFFFF', '#1D4ED8', 0.4, 0, 0.05, '#FFFFFF', -0.6, 0);
  drawLadaExpressiveEye2D(ctx, 2.6, 0.5, 2.1, 2.1, '#FFFFFF', '#1D4ED8', 0.4, 0, 0.05, '#FFFFFF', 0.6, 0);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(3, 4);
  ctx.lineTo(9, 7);
  ctx.lineTo(12, 3);
  ctx.stroke();

  drawFlatGouacheSmokeLobe(ctx, 13, 0, 3.5);

  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.lineTo(6, 5);
  ctx.lineTo(2, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- CENTER BROTHER: PANKRÁC (Nejstarší vládce s mrazivou korunou) ---
  ctx.save();
  ctx.translate(0, -20);
  ctx.fillStyle = '#BAE6FD';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-4, -10);
  ctx.lineTo(0, -22);
  ctx.lineTo(4, -10);
  ctx.lineTo(8, -18);
  ctx.lineTo(11, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawLadaExpressiveEye2D(ctx, -4.0, -0.5, 2.6, 2.6, '#FFFFFF', '#0369A1', 0.5, 0, 0.15, '#FFFFFF', 1.5, 0);
  drawLadaExpressiveEye2D(ctx, 4.0, -0.5, 2.6, 2.6, '#FFFFFF', '#0369A1', 0.5, 0, 0.15, '#FFFFFF', -1.5, 0);

  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9, 5);
  ctx.lineTo(9, 5);
  ctx.lineTo(7, 24);
  ctx.lineTo(0, 30);
  ctx.lineTo(-7, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Right 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Ice Pitchfork
  const rShoulderX = 20.5;
  const rShoulderY = -3.0;
  const rElbowX = s.isWindup ? 22.0 - s.windupProgress * 2.5 : s.isStrike ? 25.0 + s.strikeProgress * 3.0 : 23.8;
  const rElbowY = s.isWindup ? 0.5 - s.windupProgress * 3.0 : s.isStrike ? -0.5 + s.strikeProgress * 1.5 : 1.5 - armSway * 0.4;
  const rWristX = s.isWindup ? 23.5 - s.windupProgress * 3.0 : s.isStrike ? 28.5 + s.strikeProgress * 4.5 : 26.2;
  const rWristY = s.isWindup ? -4.5 - s.windupProgress * 4.5 : s.isStrike ? -1.0 + s.strikeProgress * 3.5 : 0.5 - armSway * 0.7;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.4,
    4.5,
    '#0369A1',
    '#0C4A6E',
    '#0284C7',
    '#F0F9FF'
  );

  const forkAngle = s.isWindup
    ? -0.45 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.4 + s.strikeProgress * 0.55
    : -0.1;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(forkAngle);

  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-1.4, -22.0, 2.8, 30.0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38BDF8';
  for (const px of [-3.5, 0, 3.5]) {
    ctx.beginPath();
    ctx.moveTo(px - 1.0, -21.5);
    ctx.lineTo(px + 1.0, -21.5);
    ctx.lineTo(px, -32.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, forkAngle, '#38BDF8', '#0284C7', 3.1);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. ZBOJNÍK Z HAMRŮ (Zbojník, L5 Mini-boss)
// Archetyp: Furiantský a bodrý horský zbojník s valaškou v pěsti, opaskem a knírem
// ---------------------------------------------------------------------------
export function drawHospodaZbojnik(
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
  const scale = 2.4;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  } else if (s.isWindup) {
    ctx.rotate(-0.08 * s.windupProgress);
  } else if (s.isStrike) {
    ctx.rotate(0.13 * s.strikeProgress);
  }

  // 1. Forest Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Leather Krpce & Woolen Trousers (respektující klidový postoj vx === 0 vs. chůzi vx !== 0)
  const legSwing = s.stride * 4.5;
  for (const side of [-1, 1]) {
    const lx = side * 6.8 + (side === -1 ? legSwing : -legSwing);
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(lx - 3.8, 8.0);
    ctx.lineTo(lx - 4.0, 19.5);
    ctx.lineTo(lx + 4.0, 19.5);
    ctx.lineTo(lx + 3.8, 8.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, 8.5);
    ctx.lineTo(lx, 19.0);
    ctx.stroke();

    // Krpce moccasins
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(lx - 5.0, 19.0);
    ctx.lineTo(lx + 6.0, 19.0);
    ctx.lineTo(lx + 5.0, 23.0);
    ctx.lineTo(lx - 6.0, 23.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Left 2-Jointed Articulated Linen-Sleeved Arm & 4-Fingered Fist on Hip
  const armSway = s.isMoving ? s.stride * 3.2 : Math.sin(time * 2.5) * 0.7;
  drawArticulatedArm2D(
    ctx,
    -11.0,
    -3.5,
    -16.2,
    0.5 + armSway * 0.4,
    -13.5,
    5.5 + armSway * 0.6,
    5.0,
    4.2,
    '#FAF5FF',
    '#E2E8F0',
    '#FFFFFF',
    '#DC2626'
  );
  drawGrippingHand2D(ctx, -13.5, 5.5 + armSway * 0.6, 0.8, '#F5C6A5', '#D9A07A', 2.8);

  // 4. Embroidered White Shirt, Red Folkish Vest & 3-Buckle Zbojník Belt
  ctx.fillStyle = s.isHurt ? '#FCA5A5' : '#FAF5FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13.0, 10.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11.0, -6.0);
  ctx.lineTo(11.0, -6.0);
  ctx.lineTo(12.0, 6.0);
  ctx.lineTo(4.0, 5.0);
  ctx.lineTo(0, 7.0);
  ctx.lineTo(-4.0, 5.0);
  ctx.lineTo(-12.0, 6.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  for (const by of [-3, 0, 3]) {
    ctx.beginPath();
    ctx.arc(-2.2, by, 1.2, 0, Math.PI * 2);
    ctx.arc(2.2, by, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-12.0, 5.0, 24.0, 7.0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.lineWidth = 1.4;
  for (const bx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.rect(bx - 2.5, 6.0, 5.0, 5.0);
    ctx.fill();
    ctx.stroke();
  }

  // 5. Expressive Handsome Face with Multi-Layered Eyes & Mighty Black Moustache
  ctx.fillStyle = '#F5C6A5';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12.0, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5.5, -10.5, 2.5, 0, Math.PI * 2);
  ctx.arc(5.5, -10.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  const pupilX = s.isStrike ? 0.95 : s.isWindup ? -0.4 : 0.45;
  const eyeSquint = s.isAttacking || s.isEnraged ? 0.2 : 0.05;
  const browTilt = s.isAttacking || s.isEnraged ? 1.5 : 0.6;

  drawLadaExpressiveEye2D(
    ctx,
    -3.8,
    -14.5,
    2.7,
    2.6,
    '#FFFFFF',
    s.isEnraged ? '#DC2626' : '#451A03',
    pupilX,
    0,
    eyeSquint,
    '#1C1917',
    browTilt,
    0
  );
  drawLadaExpressiveEye2D(
    ctx,
    3.8,
    -14.5,
    2.7,
    2.6,
    '#FFFFFF',
    s.isEnraged ? '#DC2626' : '#451A03',
    pupilX,
    0,
    eyeSquint,
    '#1C1917',
    -browTilt,
    0
  );

  ctx.fillStyle = '#E59B7D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -12.0, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -9.5);
  ctx.quadraticCurveTo(-6, -9.0, -11, -12);
  ctx.quadraticCurveTo(-6, -7.5, 0, -8.0);
  ctx.quadraticCurveTo(6, -7.5, 11, -12);
  ctx.quadraticCurveTo(6, -9.0, 0, -9.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -7.0, 3.2, 0.2, Math.PI - 0.2);
  ctx.fill();

  // 6. Broad Felt Hat with Peacock Feather & Red Ribbon
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -19.0, 17.0, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -21.0, 9.0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.rect(-8.5, -22.0, 17.0, 2.5);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(5.0, -22.0);
  ctx.quadraticCurveTo(14.0, -28.0, 18.0, -36.0);
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(18.0, -36.0, 3.5, 2.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(18.0, -36.0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 7. Right 2-Jointed Articulated Arm & 4-Fingered Hand Gripping Shepherd's Axe (Valaška)
  const rShoulderX = 11.0;
  const rShoulderY = -3.0;
  const rElbowX = s.isWindup ? 12.5 - s.windupProgress * 2.5 : s.isStrike ? 16.0 + s.strikeProgress * 3.0 : 14.5;
  const rElbowY = s.isWindup ? -0.5 - s.windupProgress * 3.5 : s.isStrike ? 0.5 + s.strikeProgress * 1.5 : 1.5 - armSway * 0.4;
  const rWristX = s.isWindup ? 14.0 - s.windupProgress * 3.5 : s.isStrike ? 20.5 + s.strikeProgress * 5.0 : 17.5;
  const rWristY = s.isWindup ? -5.5 - s.windupProgress * 5.0 : s.isStrike ? -1.0 + s.strikeProgress * 4.0 : -0.5 - armSway * 0.7;

  drawArticulatedArm2D(
    ctx,
    rShoulderX,
    rShoulderY,
    rElbowX,
    rElbowY,
    rWristX,
    rWristY,
    5.0,
    4.2,
    '#FAF5FF',
    '#E2E8F0',
    '#FFFFFF',
    '#DC2626'
  );

  const valaskaAngle = s.isWindup
    ? -0.55 - s.windupProgress * 0.45
    : s.isStrike
    ? 0.45 + s.strikeProgress * 0.65
    : 0.08;

  ctx.save();
  ctx.translate(rWristX, rWristY);
  ctx.rotate(valaskaAngle);

  // Ash wood shaft passing directly through Zbojník's hand at (0, 0)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-1.4, -24.0, 2.8, 34.0);
  ctx.fill();
  ctx.stroke();

  // Steel axe blade with back spike
  ctx.fillStyle = '#CBD5E1';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-1.0, -24.0);
  ctx.lineTo(10.5, -24.0);
  ctx.quadraticCurveTo(12.5, -19.0, 9.5, -14.0);
  ctx.lineTo(-1.0, -16.0);
  ctx.lineTo(-6.5, -19.0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  drawGrippingHand2D(ctx, rWristX, rWristY, valaskaAngle, '#F5C6A5', '#D9A07A', 2.9);

  ctx.restore();
}

