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
  safeRoundRect,
} from './hospodaBossHelpers';

/**
 * 1. HASTRMAN (Vodník) - Flagship Tavern Trio
 * Rozšafný a bodrý vodník s červenou čapkou s bambulí a blatouchy, smaragdovým frakem
 * s červeným lemováním a kapajícím šosem, žlutou vestičkou, fajfkou a vrbovým prutem.
 */
export function drawHospodaHastrman(
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
  const hairWave = Math.sin(time * 2.8) * 1.8;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  }

  // 1. Water puddle under feet with expanding ripple rings
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const ripPhase = Math.max(0.1, ((time * 12) % 18 + 18) % 18);
  ctx.strokeStyle = `rgba(186, 230, 253, ${Math.max(0, 0.8 - ripPhase / 18)})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-6, 24, ripPhase, Math.max(0.05, ripPhase * 0.28), 0, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Legs & Boots (Indigo breeches, red cuffs, red/white striped stockings, brown laced boots)
  const legSwing = s.stride * 12;
  const leftLegX = -6 - legSwing;
  const rightLegX = 6 + legSwing;

  for (let i = 0; i < 2; i++) {
    const lx = i === 0 ? leftLegX : rightLegX;
    // Blue breeches
    ctx.fillStyle = '#1D4ED8';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.rect(lx - 4, 6, 8, 10);
    ctx.fill();
    ctx.stroke();

    // Red cuff
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(lx - 4.5, 14, 9, 3);
    ctx.strokeRect(lx - 4.5, 14, 9, 3);

    // Striped stocking
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(lx - 3.5, 17, 7, 7);
    ctx.strokeRect(lx - 3.5, 17, 7, 7);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(lx - 3.5, 19, 7, 2);
    ctx.fillRect(lx - 3.5, 22, 7, 1.5);

    // Brown boot with shiny bulbous toe & yellow laces
    ctx.fillStyle = '#9A3412';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lx - 4, 22);
    ctx.lineTo(lx + 4, 22);
    ctx.lineTo(lx + 9, 25);
    ctx.quadraticCurveTo(lx + 13, 25, lx + 12, 28);
    ctx.lineTo(lx - 4, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Amber highlight on boot toe
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(lx + 8, 25, 2.5, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow laces
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(lx - 1, 23); ctx.lineTo(lx + 3, 23);
    ctx.moveTo(lx, 25); ctx.lineTo(lx + 4, 25);
    ctx.stroke();
  }

  // Droplet dripping from front boot
  drawWaterDroplet2D(ctx, rightLegX + 11, 27, 2.0);

  // 3. Emerald Frock Coat with Red Piping & Dripping Swallowtails
  const tailFlap = s.isPanicked ? Math.sin(time * 24) * 8 : Math.sin(time * 8) * 3;
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(-24 + tailFlap, 14);
  ctx.lineTo(-18 + tailFlap, 16);
  ctx.lineTo(-26 + tailFlap, 22);
  ctx.lineTo(-14, 18);
  ctx.lineTo(-8, 8);
  ctx.lineTo(12, 8);
  ctx.lineTo(14, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bold red piping along swallowtail scallops
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.lineTo(-24 + tailFlap, 14);
  ctx.lineTo(-18 + tailFlap, 16);
  ctx.lineTo(-26 + tailFlap, 22);
  ctx.lineTo(-14, 18);
  ctx.stroke();

  // Water droplets dripping realistically from swallowtails
  drawRealisticDripCycle2D(ctx, -24 + tailFlap, 16, 24, time, 1.4, 0.0, 2.2);
  drawRealisticDripCycle2D(ctx, -26 + tailFlap, 22, 24, time, 1.4, 0.6, 2.2);

  // 4. Waistcoat & Plump Torso
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden waistcoat buttons
  ctx.fillStyle = '#FEF08A';
  for (let b = -1; b <= 1; b++) {
    ctx.beginPath();
    ctx.arc(0, b * 4.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // White shirt collar & red neckerchief bow
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-5, -11);
  ctx.lineTo(5, -11);
  ctx.lineTo(0, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(-4, -9, 3.5, 2.0, 0.2, 0, Math.PI * 2);
  ctx.ellipse(4, -9, 3.5, 2.0, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -9, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Arms & Props (Left hand: Ornate Pipe with brass lid; Right hand: Willow whip or pipe)
  // Left arm cradling pipe
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.quadraticCurveTo(-18, -2, -15, 6);
  ctx.lineTo(-9, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Curved pipe stem & terracotta bowl with golden fish & brass lid
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(3, -13);
  ctx.quadraticCurveTo(-8, -10, -14, 3);
  ctx.stroke();

  ctx.fillStyle = '#C2410C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  safeRoundRect(ctx, -19, 0, 7, 7, 2);
  ctx.fill();
  ctx.stroke();

  // Golden fish emblem on pipe
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(-15.5, 3.5, 2.0, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brass pipe wind-cap
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-15.5, 0, 3.2, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Puff of fragrant smoke from pipe
  ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
  ctx.beginPath();
  ctx.arc(-16 + Math.sin(time * 4) * 2, -5, 3.2, 0, Math.PI * 2);
  ctx.arc(-18 + Math.cos(time * 3) * 2, -10, 4.4, 0, Math.PI * 2);
  ctx.fill();

  // Green 4-fingered hand holding pipe bowl
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-14, 4, 3.0, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Arm: Willow whip (Vrbový prut) in combat
  ctx.save();
  if (s.isAttacking) {
    if (s.isWindup) {
      // Cocked high behind head
      ctx.fillStyle = '#15803D';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(9, -6);
      ctx.quadraticCurveTo(18, -18, 22, -28);
      ctx.lineTo(16, -26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Green hand
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.ellipse(20, -28, 3.2, 2.4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Whipping willow switch arcing back
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(20, -28);
      ctx.quadraticCurveTo(34, -42, 38, -22);
      ctx.stroke();

      // Flying water droplets from willow switch
      drawWaterDroplet2D(ctx, 38, -20, 2.4);
      drawWaterDroplet2D(ctx, 32, -36, 1.8);
    } else {
      // Lashing forward with splash
      ctx.fillStyle = '#15803D';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(9, -6);
      ctx.quadraticCurveTo(20, -2, 26, 4);
      ctx.lineTo(22, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.ellipse(26, 5, 3.2, 2.4, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(26, 5);
      ctx.quadraticCurveTo(42, 0, 50, 16);
      ctx.stroke();

      // Big water splashes
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(50, 18, 3.5, 0, Math.PI * 2);
      ctx.arc(44, 8, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Resting naturally forward
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.quadraticCurveTo(14, 0, 14, 8);
    ctx.lineTo(9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#84CC16';
    ctx.beginPath();
    ctx.ellipse(13, 9, 3.0, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 6. Long Wavy Emerald Hair Locks
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-6, -16);
  ctx.bezierCurveTo(-18, -10, -22 + hairWave, 6, -16 + hairWave, 16);
  ctx.bezierCurveTo(-12, 10, -10, 0, -4, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, -16 + hairWave, 16, 24, time, 1.5, 0.3, 2.0);

  // 7. Expressive Lime-Green Face & Shaved Stubble
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaved chin stubble dots
  ctx.fillStyle = '#14532D';
  const stubble = [
    [-3, -11], [0, -10], [3, -11],
    [-2, -8.5], [1, -8.5],
  ];
  for (const [sx, sy] of stubble) {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rosy cheeks with white shine dashes
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-5, -16, 3.8, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, -16, 3.8, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-6, -17); ctx.lineTo(-4, -18);
  ctx.moveTo(4, -18); ctx.lineTo(6, -17);
  ctx.stroke();

  // Slyly winking / glancing eyes
  // Left eye: sly crescent wink or wide eye
  if (s.eyeSquint > 0.45) {
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-4, -20, 3.4, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(-4, -20, 3.4, 4.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(-4 + s.pupilShiftX * 0.4, -20 + s.pupilShiftY * 0.4, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(-4.6, -20.6, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Right eye: sly glancing eye
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(4, -20, 3.4, 4.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(4 + s.pupilShiftX * 0.5, -20 + s.pupilShiftY * 0.4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(3.4, -20.6, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Bushy arched eyebrows
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-8, -25 - s.browLift * 0.5);
  ctx.quadraticCurveTo(-4, -28 - s.browLift, -1, -25);
  ctx.moveTo(1, -25);
  ctx.quadraticCurveTo(5, -28 - s.browLift, 8, -25 - s.browLift * 0.5);
  ctx.stroke();

  // Bulbous shiny Ladovský lime-green nose
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(3, -16, 4.8, 3.2, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ECFCCB';
  ctx.beginPath();
  ctx.ellipse(4, -17, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sly grin holding pipe stem
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-5, -13);
  ctx.quadraticCurveTo(0, -11 + s.jawOpen * 2, 5, -13);
  ctx.stroke();

  // 8. Slouchy Red Knitted Cap with Fluffy Pom-Pom & Marigolds
  // Cattails & green reeds sticking out behind cap
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -26);
  ctx.lineTo(-18, -36);
  ctx.stroke();
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.save();
  ctx.translate(-15, -33);
  ctx.rotate(-0.8);
  safeRoundRect(ctx, -2, -5, 4, 10, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Red cap dome
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-12, -26);
  ctx.quadraticCurveTo(-14, -42, 6, -38);
  ctx.quadraticCurveTo(12, -32, 12, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ribbed red brim
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  safeRoundRect(ctx, -14, -28, 28, 5, 2.5);
  ctx.fill();
  ctx.stroke();

  // Big fluffy pom-pom
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(-2, -43, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow marsh marigolds (blatouchy)
  drawFolkFlower2D(ctx, 8, -26, 3.4, '#FACC15', '#EA580C');

  ctx.restore();
}

/**
 * 2. RUSALKA - Flagship Tavern Trio
 * Rozšafná a líbezná vodní víla s leknínovou korunou, dlouhými vlnitými zlatými vlasy,
 * orobincem, sun-kissed pletí, hlubokým blankytným okem a akvamarínovou řízou.
 */
export function drawHospodaRusalka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number = 0,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo,
  enemy?: any
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo, enemy);
  const hairSway = Math.sin(time * 2.4) * 2.4;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  // 1. Shimmering floor puddle with ripples
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Cascading Golden-Blonde Wavy Hair & Green Pond Reeds
  ctx.fillStyle = '#4D7C0F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.bezierCurveTo(24, -8, 18 + hairSway, 8, 24 + hairSway, 22);
  ctx.lineTo(14, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(2, -26);
  ctx.bezierCurveTo(20, -22, 24 + hairSway, -4, 20 + hairSway, 12);
  ctx.bezierCurveTo(24 + hairSway, 24, 16 + hairSway, 32, 18 + hairSway, 42);
  ctx.lineTo(6, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(-2, -28);
  ctx.bezierCurveTo(16, -24, 20 + hairSway * 0.7, -10, 15 + hairSway * 0.8, 6);
  ctx.bezierCurveTo(22 + hairSway, 18, 14 + hairSway, 28, 17 + hairSway, 36);
  ctx.lineTo(6, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Water drips from hair
  drawRealisticDripCycle2D(ctx, 18 + hairSway, 38, 24, time, 1.6, 0.2, 2.2);

  // 3. Graceful Bare Leg & Foot Stepping into Puddle
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.quadraticCurveTo(-6, 16, -3, 23);
  ctx.lineTo(-12, 24);
  ctx.quadraticCurveTo(-8, 21, -6, 18);
  ctx.quadraticCurveTo(-7, 10, -6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Wet Ice-Blue & Seafoam-Aqua Gown with Side Slit & Dripping Hem
  ctx.fillStyle = '#A7F3D0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.bezierCurveTo(14, 4, 16, 18, 18, 24);
  ctx.lineTo(8, 24);
  ctx.lineTo(0, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.quadraticCurveTo(-6, -2, -8, 6);
  ctx.quadraticCurveTo(-12, 16, -14, 24);
  ctx.lineTo(-6, 22);
  ctx.quadraticCurveTo(0, 18, 6, 24);
  ctx.lineTo(10, 22);
  ctx.bezierCurveTo(12, 10, 12, -2, 6, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Green pond-moss waist sash
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.quadraticCurveTo(0, 6, 8, 2);
  ctx.lineTo(6, 6);
  ctx.quadraticCurveTo(0, 9, -7, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Bare Peach Shoulder & Arms in Alluring Water Gesture
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-7, -18);
  ctx.quadraticCurveTo(-9, -14, -8, -10);
  ctx.quadraticCurveTo(0, -8, 6, -10);
  ctx.quadraticCurveTo(6, -16, 2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Arm with floating water orb in combat
  ctx.save();
  const armAngle = s.isStrike ? 0.45 : s.isWindup ? -0.4 : Math.sin(time * 3.5) * 0.15;
  ctx.translate(6, -12);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  safeRoundRect(ctx, 0, -2.5, 14, 5, 2);
  ctx.fill();
  ctx.stroke();

  // Floating glowing water orb
  const orbR = s.isWindup ? 7.5 : s.isStrike ? 9.0 : 5.0 + Math.sin(time * 6) * 1.0;
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(18, 0, orbR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.arc(16, -2, orbR * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Head, Three-Quarter Profile & Water-Lily Crown (Leknínová koruna)
  // Two brown cattails (doutníky) rising from back of crown
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(8, -22);
  ctx.lineTo(14, -36);
  ctx.stroke();
  ctx.fillStyle = '#9A3412';
  ctx.beginPath();
  ctx.save();
  ctx.translate(12, -32);
  ctx.rotate(0.35);
  safeRoundRect(ctx, -2, -5, 4, 10, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Peach face profile
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-2, -26);
  ctx.quadraticCurveTo(-10, -24, -10, -18);
  ctx.quadraticCurveTo(-14, -16, -13, -14); // button nose
  ctx.quadraticCurveTo(-11, -12, -9, -9);
  ctx.quadraticCurveTo(-3, -7, 4, -12);
  ctx.quadraticCurveTo(5, -20, -2, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rosy blush with white dashes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-5, -14, 3.6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-6, -15); ctx.lineTo(-4, -16);
  ctx.stroke();

  // Smiling / singing mouth
  ctx.fillStyle = '#BE123C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-8, -12, s.isAttacking ? 2.5 : 1.8, s.isAttacking ? 2.0 : 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Large ocean-blue eye with sweeping black eyelashes
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-5, -18, 3.8, 4.4, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(-6 + s.pupilShiftX * 0.4, -18, 2.2, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(-6.4 + s.pupilShiftX * 0.4, -18, 1.2, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-5.5, -19.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Sweeping lashes & brow
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-5, -18, 4.2, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2, -21); ctx.lineTo(0, -23);
  ctx.moveTo(-1, -19); ctx.lineTo(1.5, -20.5);
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-8, -23); ctx.quadraticCurveTo(-4, -26, 0, -23);
  ctx.stroke();

  // Water-lily crown (green pads + 3 blooming water-lilies)
  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.ellipse(-6, -26, 5.5, 3.0, -0.3, 0, Math.PI * 2);
  ctx.ellipse(3, -27, 6.0, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawWaterLilyBlossom2D(ctx, -7, -27, 4.5, -0.2);
  drawWaterLilyBlossom2D(ctx, 4, -27, 6.0, 0.2);
  drawWaterLilyBlossom2D(ctx, 10, -20, 4.5, 0.5);

  ctx.restore();
}

/**
 * 3. KOLEDUJÍCÍ BUBÁK - Easter Tavern Spook
 * Rozšafný velikonoční šibal adaptovaný přímo z Tavern Bubáka: břichatý skřítek
 * s červenými kšandami, záplatovanými kraťasy, proutěným košíkem s malovanými kraslicemi,
 * spletenou pomlázkou s vlajícími stuhami a širokým kloboukem.
 */
export function drawHospodaKoledujiciBubak(
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
  const whipSwing = s.isAttacking ? Math.sin(time * 24) * 0.45 + 0.6 : Math.sin(time * 6) * 0.15;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  // 1. Bare 4-Toed Lime-Green Troll Feet with Yellowish Nails
  ctx.fillStyle = 'rgba(28, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const dirSign of [-1, 1]) {
    const fx = dirSign * 8 + (dirSign > 0 ? s.stride * 4 : -s.stride * 4);
    ctx.fillStyle = '#84CC16';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(fx, 23, 7.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let t = 0; t < 4; t++) {
      const tx = fx - 3 + t * 2.2;
      ctx.fillStyle = '#A3E635';
      ctx.beginPath();
      ctx.arc(tx, 24, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(tx, 24.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Tattered Brown Burlap Shorts with Patches
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-12, 8, 24, 12);
  ctx.fill();
  ctx.stroke();

  // Blue patch on left leg & red patch on right leg
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(-10, 11, 6, 6);
  ctx.strokeRect(-10, 11, 6, 6);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(4, 13, 6, 6);
  ctx.strokeRect(4, 13, 6, 6);

  // Golden waist button
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(0, 10, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Plump Lime-Green Pot-Belly & Red Suspenders
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute spiral navel
  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(1, 4, 1.6, 0, Math.PI * 1.6);
  ctx.stroke();

  // Red suspenders with silver buckles
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.fillRect(-9, -11, 3.5, 19);
  ctx.strokeRect(-9, -11, 3.5, 19);
  ctx.fillRect(5.5, -11, 3.5, 19);
  ctx.strokeRect(5.5, -11, 3.5, 19);

  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(-10, 1, 5.5, 4);
  ctx.strokeRect(-10, 1, 5.5, 4);
  ctx.fillRect(4.5, 1, 5.5, 4);
  ctx.strokeRect(4.5, 1, 5.5, 4);

  // 4. Blue Polka-Dot Bandana around Neck
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -10, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  for (let d = -2; d <= 2; d++) {
    ctx.beginPath();
    ctx.arc(d * 3.5, -10, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Left Arm with Wicker Basket of Painted Easter Eggs
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(-18, 0);
  ctx.stroke();

  // Woven wicker basket
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-18, 5, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Painted kraslice
  const eggCols = ['#EF4444', '#FBBF24', '#38BDF8'];
  for (let e = 0; e < 3; e++) {
    ctx.fillStyle = eggCols[e];
    ctx.beginPath();
    ctx.ellipse(-20 + e * 3.2, 3, 2.5, 3.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 6. Right Arm with Braided Pomlázka (Willow Switch)
  ctx.save();
  ctx.translate(12, -4);
  ctx.rotate(whipSwing);

  // Bent arm & green hand
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-2, -3, 10, 5);
  ctx.fill();
  ctx.stroke();

  // Braided willow switch (pomlázka)
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(8, -1);
  ctx.quadraticCurveTo(24, -14, 34, -28);
  ctx.stroke();

  // Braid chevron pattern
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 1.2;
  for (let p = 0; p < 5; p++) {
    const px = 10 + p * 4.5;
    const py = -3 - p * 4.5;
    ctx.beginPath();
    ctx.moveTo(px - 2, py + 2); ctx.lineTo(px + 2, py - 2);
    ctx.stroke();
  }

  // Fluttering ribbons on pomlázka tip
  const ribbonCols = ['#EF4444', '#3B82F6', '#EAB308', '#10B981'];
  for (let r = 0; r < ribbonCols.length; r++) {
    const wave = Math.sin(time * 12 + r) * 5;
    ctx.strokeStyle = ribbonCols[r];
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(34, -28);
    ctx.quadraticCurveTo(40 + wave, -36, 44 + wave * 1.5, -44);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Wild Spiky Hair Mane & Big Jug Ears
  // Jug ears
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-14, -20, 5, 7, -0.3, 0, Math.PI * 2);
  ctx.ellipse(14, -20, 5, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(-14, -20, 3, 4.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(14, -20, 3, 4.5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 8. Goblin Head & Expressive Tavern Face
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -20, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bulging golden-yellow eyes with tracking pupils
  for (const side of [-1, 1]) {
    const ex = side * 4.5;
    ctx.fillStyle = '#FDE047';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(ex, -22, 3.8, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.4, -22 + s.pupilShiftY * 0.3, 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.4, -22 + s.pupilShiftY * 0.3, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex - 0.8, -22.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bushy eyebrows
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-8, -27 - s.browLift * 0.5);
  ctx.quadraticCurveTo(-4, -30 - s.browLift, -1, -27);
  ctx.moveTo(1, -27);
  ctx.quadraticCurveTo(5, -30 - s.browLift, 8, -27 - s.browLift * 0.5);
  ctx.stroke();

  // Bulbous freckled red nose
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -18, 5.0, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  ctx.arc(-1.5, -18, 0.6, 0, Math.PI * 2);
  ctx.arc(1.5, -18, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Ear-to-ear open grin with yellowish blocky teeth & wagging red tongue
  ctx.fillStyle = '#3B0707';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -14, 7, 0.1, Math.PI - 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow teeth
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-4, -14, 2.5, 2.5);
  ctx.strokeRect(-4, -14, 2.5, 2.5);
  ctx.fillRect(1.5, -14, 2.5, 2.5);
  ctx.strokeRect(1.5, -14, 2.5, 2.5);

  // Wagging red tongue
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.ellipse(0, -11, 3.5, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // 9. Broad-Brimmed Easter Black Hat with Colorful Ribbons
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -30, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  safeRoundRect(ctx, -10, -42, 20, 13, 2);
  ctx.fill();
  ctx.stroke();

  // Ribbons hanging from hat
  for (let i = 0; i < ribbonCols.length; i++) {
    const rx = -6 + i * 4;
    const wave = Math.sin(time * 8 + i) * 5;
    ctx.strokeStyle = ribbonCols[i];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rx, -30);
    ctx.quadraticCurveTo(rx + wave, -20, rx + wave * 1.5, -8);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 4. OBR (Skalní obr) - Flagship Furiant Boss
 * Komicky vzteklý a furiantský obr: mohutné svalnaté kamenné tělo, ovčí vesta se švy
 * a rohovinovými knoflíky, funící pára z uší, obří borovicový kyj a rozhněvaný vousatý obličej.
 */
export function drawHospodaObr(
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
  const scale = 2.9;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Heavy Mountain Ground Shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Muscular Stone-Grey Legs & Patched Leather Boots
  const legSwing = s.stride * 8;
  for (const side of [-1, 1]) {
    const lx = side * 8 + (side === 1 ? legSwing : -legSwing);
    ctx.fillStyle = '#52525B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.rect(lx - 5, 8, 10, 18);
    ctx.fill();
    ctx.stroke();

    // Heavy mountain boot
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.rect(lx - 6, 24, 13, 6);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Massive Stone-Grey Torso with Sheepskin Vest & Cross-Stitches
  ctx.fillStyle = '#71717A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Patched woollen vest
  ctx.fillStyle = '#3F3F46';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-16, -14);
  ctx.lineTo(-12, 18);
  ctx.lineTo(12, 18);
  ctx.lineTo(16, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red flannel lining peeking out & yellow cross-stitches
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-4, -14); ctx.lineTo(-4, 18);
  ctx.moveTo(4, -14); ctx.lineTo(4, 18);
  ctx.stroke();

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, 0); ctx.lineTo(-6, 4);
  ctx.moveTo(-6, 0); ctx.lineTo(-10, 4);
  ctx.moveTo(6, 6); ctx.lineTo(10, 10);
  ctx.moveTo(10, 6); ctx.lineTo(6, 10);
  ctx.stroke();

  // 4. Arms & Giant Pine Club (Borovicový kyj) in Combat
  ctx.save();
  if (s.isAttacking) {
    if (s.isWindup) {
      // Hoisting giant club overhead with both hands!
      ctx.fillStyle = '#52525B';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.rect(-22, -26, 8, 20);
      ctx.rect(14, -26, 8, 20);
      ctx.fill();
      ctx.stroke();

      // Giant pine log with branches
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(-34, -46);
      ctx.lineTo(38, -42);
      ctx.stroke();

      ctx.fillStyle = '#713F12';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(28, -42, 6, 0, Math.PI * 2);
      ctx.arc(-24, -46, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Smashing club straight down into ground!
      ctx.fillStyle = '#52525B';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.rect(-18, 0, 8, 18);
      ctx.rect(10, 0, 8, 18);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(2, -4);
      ctx.lineTo(34, 28);
      ctx.stroke();

      ctx.fillStyle = '#713F12';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(28, 24, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // Normal hulking arms swinging
    ctx.fillStyle = '#52525B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.rect(-24, -4, 8, 18);
    ctx.rect(16, -4, 8, 18);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 5. Head, Shaggy Beard & Furiantský Expressive Face
  ctx.fillStyle = '#52525B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, -22, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaggy black hair and beard
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.lineTo(-12, -8);
  ctx.lineTo(0, -4);
  ctx.lineTo(12, -8);
  ctx.lineTo(14, -20);
  ctx.lineTo(12, -34);
  ctx.lineTo(-12, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Evergreen spruce twigs tucked into hair
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8, -32); ctx.lineTo(16, -40);
  ctx.moveTo(11, -37); ctx.lineTo(8, -40);
  ctx.stroke();

  // Comic steam puffs rising from ears when furious
  drawFuriantSteamPuffs(ctx, 0, -26, time, s.isEnraged || s.isAttacking ? 1.4 : 0.7);

  // Heavy V-shaped furrowed monobrow
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-10, -24);
  ctx.lineTo(0, -20);
  ctx.lineTo(10, -24);
  ctx.stroke();

  // Popping furious amber eyes
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(-5, -19, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -19, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.arc(-5, -19, 1.2, 0, Math.PI * 2);
  ctx.arc(5, -19, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Bulbous red nose
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -16, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Roaring open mouth with yellow fangs
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -11, 4.5, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-3, -11, 2, 2.5);
  ctx.fillRect(1, -11, 2, 2.5);

  ctx.restore();
}

/**
 * 5. ČERT (Mariášový čert) - Iconic Czech Devil
 * Komicky vzteklý čert: huňatá uhelná srst, beranní rohy s rýhami, červená vesta
 * se zlatými knoflíky, kopyta, švihající ocas s bodcem a kovářské vidle / mariášové karty.
 */
export function drawHospodaCert(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  isBoss: boolean = false,
  isCharging: boolean = false,
  attackInfo?: EnemyAttackInfo
): void {
  const s = resolveBossState(time, vx, panicked, attackInfo);
  const scale = isBoss ? 2.3 : 1.25;
  const charging = isCharging || s.isMoving;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  } else if (charging) {
    ctx.rotate(0.15);
  }

  // 1. Fiery ground glow aura
  ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Barbed Devil Tail (Švihající ocas s trojúhelníkovým hrotem)
  const tailWhip = Math.sin(time * 16) * 16;
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = isBoss ? 4.5 : 3.2;
  ctx.beginPath();
  ctx.moveTo(-8, 4);
  ctx.quadraticCurveTo(-26, tailWhip, -34, -10 + tailWhip * 0.7);
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-34, -18 + tailWhip * 0.7);
  ctx.lineTo(-28, -6 + tailWhip * 0.7);
  ctx.lineTo(-40, -4 + tailWhip * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Legs & Cloven Hooves (Kopyta)
  const legSwing = s.stride * 12;
  for (const side of [-1, 1]) {
    const lx = side * 7 + (side === 1 ? legSwing : -legSwing);
    ctx.fillStyle = '#27272A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.rect(lx - 3.5, 8, 7, 14);
    ctx.fill();
    ctx.stroke();

    // Grey hooves
    ctx.fillStyle = '#71717A';
    ctx.beginPath();
    ctx.rect(lx - 4, 22, 8, 5);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Rotund Soot-Black Body & Red Festive Waistcoat
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red waistcoat
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-11, -9);
  ctx.lineTo(-14, 9);
  ctx.lineTo(14, 9);
  ctx.lineTo(11, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden waistcoat buttons
  ctx.fillStyle = '#F59E0B';
  for (let b = -1; b <= 1; b++) {
    ctx.beginPath();
    ctx.arc(0, b * 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Arms & Iron Trident / Pitchfork in Combat
  ctx.save();
  if (charging || s.isStrike) {
    // Thrusting pitchfork straight forward!
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(44, -2);
    ctx.stroke();

    ctx.fillStyle = '#3F3F46';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(40, -8);
    ctx.lineTo(48, -2);
    ctx.lineTo(40, 4);
    ctx.stroke();
  } else if (s.isWindup) {
    // Pitchfork cocked back menacingly
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(-32, -18);
    ctx.stroke();
  } else {
    // Casual devil swing holding a Mariáš playing card (Červené eso / Žaludy)
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    safeRoundRect(ctx, 12, 0, 8, 11, 1);
    ctx.fill();
    ctx.stroke();

    // Red heart symbol
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(15, 4, 1.4, 0, Math.PI * 2);
    ctx.arc(17, 4, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Devil Head, Arched Horns & Roaring Grin
  ctx.fillStyle = '#27272A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, -19, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Arched yellow horns with ridges
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(side * 4, -29);
    ctx.quadraticCurveTo(side * 18, -44, side * 8, -48);
    ctx.quadraticCurveTo(side * 2, -40, 0, -29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Furry ears
  ctx.fillStyle = '#27272A';
  ctx.beginPath();
  ctx.ellipse(-14, -18, 4, 3, -0.4, 0, Math.PI * 2);
  ctx.ellipse(14, -18, 4, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing red eyes with yellow slit pupils
  for (const side of [-1, 1]) {
    const ex = side * 4.5;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(ex, -20, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(ex + 0.4, -20.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tongue sticking out & laughing devil mouth
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const tongueWobble = Math.sin(time * 16) * 4;
  ctx.moveTo(4, -14);
  ctx.quadraticCurveTo(14, -12 + tongueWobble, 18, -8 + tongueWobble);
  ctx.quadraticCurveTo(14, -6 + tongueWobble, 4, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * 6. BARBUCHA - Strachem nacpaný kouřový bubák (ADR 0050)
 * Zlomyslný a potměšilý kouřový bubák s procedurálními plochými kvašovými laloky (ZERO ALLOCATION),
 * rozježenou černou kšticí, mrkvovým nosem, velkýma očima a ostrými černými drápy.
 */
export function drawHospodaBarbucha(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  vx: number = 0,
  _panicked: boolean = false,
  attackInfo?: any,
  enemy?: any
): void {
  const target = enemy || attackInfo || {};
  const s = resolveBossState(time, vx, false, attackInfo, enemy);
  const tailSway = Math.sin(time * 4.2) * 5;
  const attackLift = s.isAttacking ? 6 : 0;
  // Deterministic micro-tremble without Math.random()!
  const tremble = s.isAttacking ? Math.sin(time * 38) * 1.5 : 0;

  // 1. Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy + s.bob - attackLift + tremble);
  ctx.scale(s.dir, 1);

  // 2. Swirling Smoke Tail
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.quadraticCurveTo(-18 + tailSway, 26, -12 + tailSway * 1.2, 36);
  ctx.quadraticCurveTo(-6 + tailSway, 44, -14 + tailSway, 48);
  ctx.quadraticCurveTo(-20 + tailSway, 44, -16 + tailSway * 0.8, 38);
  ctx.quadraticCurveTo(-24 + tailSway * 0.5, 28, -6, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Smoke Cloud Body & Head (Layered Flat Gouache Lobes - ZERO ALLOCATION!)
  drawFlatGouacheSmokeLobe(ctx, -12, 6, 15);
  drawFlatGouacheSmokeLobe(ctx, 10, 8, 14);
  drawFlatGouacheSmokeLobe(ctx, -2, 10, 16);
  drawFlatGouacheSmokeLobe(ctx, 0, -2, 18);
  drawFlatGouacheSmokeLobe(ctx, -6, -18, 15);
  drawFlatGouacheSmokeLobe(ctx, 8, -16, 15);
  drawFlatGouacheSmokeLobe(ctx, 0, -22, 17);

  // 4. Wild Spiky Black Tuft of Hair on Top
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  const hairSpikes = [
    [-18, -26, -26, -34, -14, -28],
    [-12, -30, -18, -42, -8, -32],
    [-6, -34, -8, -48, -1, -34],
    [-2, -35, 4, -49, 5, -34],
    [4, -34, 12, -44, 9, -31],
    [9, -30, 18, -38, 14, -26],
  ];
  for (let i = 0; i < hairSpikes.length; i++) {
    const [x1, y1, x2, y2, x3, y3] = hairSpikes[i];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 5. Cloud Arms & Sharp Black Claws
  for (const isLeft of [true, false]) {
    ctx.save();
    const side = isLeft ? -1 : 1;
    const ax = side * 14;
    const ay = s.isAttacking ? -16 : -6;
    const armAngle = s.isAttacking ? side * 0.4 : side * 0.15;

    ctx.translate(ax, ay);
    ctx.rotate(armAngle);

    drawFlatGouacheSmokeLobe(ctx, side * 6, -2, 8);
    drawFlatGouacheSmokeLobe(ctx, side * 14, -4, 7);

    // Claws
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    const clawAngles = [-0.4, 0, 0.4];
    for (const ca of clawAngles) {
      ctx.save();
      ctx.translate(side * 18, -4);
      ctx.rotate(side * ca);
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(side * 8, -2, side * 12, 0);
      ctx.quadraticCurveTo(side * 6, 2, 0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // 6. Expressive Face: Rosy Cheeks, Popping Eyes & Carrot Nose
  ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
  ctx.beginPath();
  ctx.ellipse(-10, -8, 5, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -7, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // White glint dashes on cheeks
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-11, -9); ctx.lineTo(-9, -10);
  ctx.moveTo(9, -10); ctx.lineTo(11, -9);
  ctx.stroke();

  // Wide popping round eyes
  for (const side of [-1, 1]) {
    const ex = side * 6;
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(ex, -17, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.4, -17, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.5, -17, 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex - 1.2, -18.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Furrowed sharp black eyebrows
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-11, -22); ctx.lineTo(-2, -20);
  ctx.moveTo(13, -21); ctx.lineTo(4, -19);
  ctx.stroke();

  // Pointy carrot-like orange-red nose
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.quadraticCurveTo(8, -13, 13, -11);
  ctx.quadraticCurveTo(6, -8, 1, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gaping roaring mouth with square white cartoon teeth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-7, -6);
  ctx.quadraticCurveTo(0, -9, 7, -6);
  ctx.quadraticCurveTo(6, 4, 0, 5);
  ctx.quadraticCurveTo(-6, 4, -7, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pink tongue
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, 3, 3.5, Math.PI, Math.PI * 2);
  ctx.fill();

  // Two square cartoon teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  ctx.fillRect(-4, -7, 3.5, 4);
  ctx.strokeRect(-4, -7, 3.5, 4);
  ctx.fillRect(0.5, -7, 3.5, 4);
  ctx.strokeRect(0.5, -7, 3.5, 4);

  ctx.restore();
}
