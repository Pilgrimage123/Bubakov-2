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
  drawFoamingBeerMug2D,
  safeRoundRect,
  clamp01,
} from './hospodaBossHelpers';

/**
 * ============================================================================
 * 1. HASTRMAN (Vodník) - Flagship Tavern Masterwork
 * ============================================================================
 * Plná parita s drawHastrman2D z Hospody U Černého kocoura:
 * - Ocular mimicry: nearEyeWink, farEyeSquint, pupilDartX/Y, crow's-feet laugh lines,
 *   bílé odlesky, vlnící se obočí a živé mrkání navázané na bojové stavy.
 * - Vícevrstvý smaragdový frak s červeným lemováním, kapajícími šosy a kapsami.
 * - Žlutá vestička s knoflíky, bílý límec, červená vázanka s mašlí.
 * - Pruhované punčochy, okované hnědé boty s lesklou baňatou špičkou a tkaničkami.
 * - Hliněná fajfka se zlatou rybičkou, zlatým odklápěcím víčkem a stoupajícím kouřem.
 * - Červená čapka s blatouchy, orobincem a kapajícími zelenými kadeřemi.
 * - Pod nohama vodní kaluž s expandujícími eliptickými vlnami a realistickými kapkami.
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
  const hairWave = Math.sin(time * 2.8) * 2.0;

  // Sly eye-winking & mischievous squint calculation from LadaCoverScene
  const periodicWinkWave = Math.sin(time * 3.4) * Math.sin(time * 1.7);
  const microWink = periodicWinkWave > 0.62 ? (periodicWinkWave - 0.62) / 0.38 : 0;
  const baseWink = s.isPanicked ? 0 : s.isStrike ? 0.85 : s.isWindup ? 0 : microWink * 0.95;
  const nearEyeWink = clamp01(baseWink);
  const farEyeSquint = clamp01(nearEyeWink * 0.65 + (s.isWindup ? 0 : 0.15 * Math.sin(time * 4.2)));
  const pupilDartX = s.isWindup ? 1.5 : (s.pupilShiftX + Math.sin(time * 2.9) * 0.6);
  const pupilDartY = s.isStrike ? -1.0 : (s.pupilShiftY + Math.cos(time * 2.3) * 0.45);
  const browWiggleY = s.isWindup ? -3.0 : s.isStrike ? 2.5 : (nearEyeWink * 1.8 + Math.sin(time * 5.0) * 0.6);

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  if (s.isPanicked) {
    ctx.rotate(0.12);
  }

  // 1. Shimmering water puddle under feet with expanding concentric ripples
  ctx.fillStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 24, 30, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expanding realistic ripples under dripping swallowtails and boots
  const ripPhase1 = Math.max(0.1, (((time * 15) % 18) + 18) % 18);
  const rippleR1 = 3 + ripPhase1;
  const rippleAlpha1 = Math.max(0, 1 - rippleR1 / 21);
  ctx.strokeStyle = `rgba(56, 189, 248, ${rippleAlpha1 * 0.75})`;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(-10, 24, rippleR1, Math.max(0.1, rippleR1 * 0.28), 0, 0, Math.PI * 2);
  ctx.stroke();

  const ripPhase2 = Math.max(0.1, ((((time * 15) + 8) % 18) + 18) % 18);
  const rippleR2 = 2.5 + ripPhase2;
  const rippleAlpha2 = Math.max(0, 1 - rippleR2 / 21);
  ctx.strokeStyle = `rgba(186, 230, 253, ${rippleAlpha2 * 0.7})`;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(8, 24, rippleR2, Math.max(0.1, rippleR2 * 0.27), 0, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Legs & Boots (Indigo-blue breeches, red cuffs, red/white striped stockings, brown laced boots)
  const legSwing = s.stride * 10;
  const leftLegX = -7 - legSwing;
  const rightLegX = 7 + legSwing;

  for (let i = 0; i < 2; i++) {
    const lx = i === 0 ? leftLegX : rightLegX;
    const isForward = (i === 1 && s.dir > 0) || (i === 0 && s.dir < 0);

    // Blue breeches with fabric crease lines
    ctx.fillStyle = '#1D4ED8';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.rect(lx - 5, 4, 10, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx - 3, 6);
    ctx.lineTo(lx + 2, 12);
    ctx.stroke();

    // Red cuff
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.fillRect(lx - 5.5, 13, 11, 3);
    ctx.strokeRect(lx - 5.5, 13, 11, 3);

    // Striped stocking
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.rect(lx - 4, 16, 8, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.fillRect(lx - 4, 18, 8, 2.2);
    ctx.fillRect(lx - 4, 21.5, 8, 1.8);

    // Sturdy brown boot with shiny bulbous toe & yellow laces
    ctx.fillStyle = '#9A3412';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lx - 4.5, 23);
    ctx.lineTo(lx + 4.5, 23);
    ctx.lineTo(lx + 7, 26);
    ctx.quadraticCurveTo(lx + 13, 25, lx + 12, 29);
    ctx.lineTo(lx - 4.5, 29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Amber highlight on boot toe
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(lx + 8, 26.5, 3.2, 1.8, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Yellow laces
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(lx - 1, 24); ctx.lineTo(lx + 3, 23);
    ctx.moveTo(lx, 26); ctx.lineTo(lx + 4, 25);
    ctx.stroke();

    // Water droplet from leading boot toe
    if (isForward) {
      drawWaterDroplet2D(ctx, lx + 12, 29.5, 1.6);
    }
  }

  // 3. Swallowtail Frock Coat Back & Scallops (Dark emerald with red piping)
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  const tailFlap = Math.sin(time * 8) * (s.isMoving ? 4 : 1.5);
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.quadraticCurveTo(-16, 6, -20 + tailFlap, 14);
  ctx.quadraticCurveTo(-14 + tailFlap, 18, -12 + tailFlap, 21);
  ctx.quadraticCurveTo(-8, 14, 0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red piping on swallowtail edge
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.quadraticCurveTo(-20 + tailFlap, 14, -12 + tailFlap, 21);
  ctx.stroke();

  // Water droplets dripping realistically from swallowtail tips into puddle
  drawRealisticDripCycle2D(ctx, -18 + tailFlap, 14, 24, time, 1.4, 0.0, 2.0);
  drawRealisticDripCycle2D(ctx, -12 + tailFlap, 21, 24, time, 1.2, 0.5, 1.8);

  // 4. Waistcoat, Collar, Buttons & Festive Neckerchief Bow
  // Golden-ochre waistcoat
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(8, -10);
  ctx.lineTo(9, 6);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Small golden buttons
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.0;
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.arc(0, -6 + b * 4.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Crisp white shirt collar
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(6, -12);
  ctx.lineTo(4, -8);
  ctx.lineTo(-6, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Festive red neckerchief bow
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-3, -11, 4.5, 2.4, 0.3, 0, Math.PI * 2);
  ctx.ellipse(4, -10, 4.8, 2.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center knot of red bow
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -10.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hanging bow ribbons
  ctx.beginPath();
  ctx.moveTo(-1, -9);
  ctx.lineTo(-3, 0);
  ctx.lineTo(1, -2);
  ctx.lineTo(3, 0);
  ctx.lineTo(1, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Front of Emerald Frock Coat with Side Pocket Flap & Golden Button
  ctx.fillStyle = '#16803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -11);
  ctx.lineTo(-13, 4);
  ctx.lineTo(-4, 6);
  ctx.lineTo(-2, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pocket flap
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.rect(-12, -1, 7, 3.5);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-12, -1, 7, 3.5);

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-8.5, 0.7, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 6. Right Arm (Back side) / Left Arm holding Pipe with Brass Lid
  // Arm holding clay pipe
  const pipeArmLift = s.isWindup ? -6 : s.isStrike ? 4 : 0;
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(6, -8);
  ctx.quadraticCurveTo(16, -4 + pipeArmLift, 18, 2 + pipeArmLift);
  ctx.lineTo(13, 4 + pipeArmLift);
  ctx.quadraticCurveTo(10, -2 + pipeArmLift, 5, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red sleeve cuff & white shirt cuff
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(13, 1 + pipeArmLift, 5, 2.5);
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(14, 3.5 + pipeArmLift, 4, 2);

  // Lime-green hand gripping pipe stem
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(16, 6 + pipeArmLift, 3.2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curved pipe stem from mouth (8, -18) to bowl (22, -6 + pipeArmLift)
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.quadraticCurveTo(14, -14, 20, -7 + pipeArmLift);
  ctx.stroke();

  // Golden ferrule band
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(17, -10 + pipeArmLift);
  ctx.lineTo(19, -8 + pipeArmLift);
  ctx.stroke();

  // Ornate terracotta-red pipe bowl with Golden Fish relief emblem
  ctx.fillStyle = '#C2410C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(19, -9 + pipeArmLift);
  ctx.quadraticCurveTo(19, -2 + pipeArmLift, 25, -2 + pipeArmLift);
  ctx.quadraticCurveTo(28, -2 + pipeArmLift, 28, -11 + pipeArmLift);
  ctx.lineTo(21, -11 + pipeArmLift);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden fish relief emblem on pipe bowl
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(24, -6 + pipeArmLift, 2.4, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing orange tobacco ember & brass lid
  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.ellipse(24.5, -11.5 + pipeArmLift, 3.5, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brass hinged wind-cap with finial knob
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(24.5, -12 + pipeArmLift, 4.5, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(24.5, -16.5 + pipeArmLift, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curling blue-white smoke wisps rising from pipe
  ctx.save();
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  const smokeX = 24.5 + Math.sin(time * 3.5) * 2;
  const smokeY = -18 + pipeArmLift - ((time * 8) % 12);
  ctx.beginPath();
  ctx.arc(smokeX, smokeY, 3.2, 0, Math.PI * 2);
  ctx.arc(smokeX + 3, smokeY - 5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 7. Long Wavy Two-Tone Green Hair Locks
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, -28);
  ctx.bezierCurveTo(-18, -24, -22 + hairWave, -14, -26 + hairWave, -4);
  ctx.bezierCurveTo(-20 + hairWave, 0, -14, -8, -6, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.bezierCurveTo(-12, -26, -14 + hairWave * 0.7, -16, -18 + hairWave, -2);
  ctx.bezierCurveTo(-10 + hairWave * 0.5, -4, -6, -16, 2, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Water droplets dripping from green hair locks
  drawRealisticDripCycle2D(ctx, -24 + hairWave, -4, 24, time, 1.5, 0.2, 2.0);
  drawRealisticDripCycle2D(ctx, -17 + hairWave, -2, 24, time, 1.7, 0.7, 1.8);

  // 8. Head, Shaved Stubble, Bulbous Ladovský Nose & Rosy Cheek Blush
  // Ear
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-6, -22, 3.5, 4.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Main lime-green head and rounded chin
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(2, -36);
  ctx.quadraticCurveTo(14, -36, 16, -26);
  ctx.quadraticCurveTo(18, -18, 16, -13);
  ctx.quadraticCurveTo(15, -7, 6, -7);
  ctx.quadraticCurveTo(-6, -7, -6, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shaved chin stubble dots
  ctx.fillStyle = '#14532D';
  const stubble = [
    [0, -12], [3, -10], [6, -9], [9, -10], [12, -12],
    [2, -9], [5, -8], [8, -8], [11, -9]
  ];
  for (const [sx, sy] of stubble) {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rosy red-orange cheek blush with white glint dashes
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.ellipse(4, -19, 4.2, 3.0, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(2, -20); ctx.lineTo(4, -21);
  ctx.moveTo(4, -19); ctx.lineTo(6, -20);
  ctx.stroke();

  // 9. Ocular Mimicry System (Sly winking, saccades, double lid creases & laugh lines)
  // Far (right) eye peeking slyly over nose bridge
  const farOpenY = Math.max(0.1, 1 - farEyeSquint * 0.65);
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(13, -26, 2.5, 3.5 * farOpenY, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (farEyeSquint < 0.75) {
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(13.5 + pupilDartX * 0.4, -26 + pupilDartY, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Near (left) main eye
  if (nearEyeWink > 0.52) {
    // Joyful sly crescent wink with crow's-feet laugh lines
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(6, -25, 4.0, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Crow's-feet laugh lines
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(1.5, -27); ctx.lineTo(-1.5, -28.5);
    ctx.moveTo(1.2, -25.5); ctx.lineTo(-2.0, -25.5);
    ctx.moveTo(1.8, -24.0); ctx.lineTo(-1.0, -22.5);
    ctx.stroke();
  } else {
    // Large bright sly eye with pupil, specular shine, and lower laugh lid
    const openY = Math.max(0.1, 1 - nearEyeWink * 0.65);
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(6, -26, 4.0, 4.8 * openY, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bold pupil darting slyly
    const px = 7.0 + pupilDartX * 0.65;
    const py = -26 + pupilDartY;
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.ellipse(px, py, 2.2, 2.7 * openY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white specular catchlight wedge
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(px - 0.9, py - 0.9 * openY, 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Lower laugh lid fold curving up
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(2, -23);
    ctx.quadraticCurveTo(6, -24.5 - nearEyeWink * 1.2, 10, -23);
    ctx.stroke();
  }

  // Thick dark-green/black arched eyebrow
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, -30 - browWiggleY * 0.5);
  ctx.quadraticCurveTo(5, -34 - browWiggleY, 11, -31 - browWiggleY * 0.4);
  ctx.stroke();

  // Bulbous round Ladovský nose with shiny pale-lime highlight & freckles
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(11, -26);
  ctx.bezierCurveTo(22, -30, 24, -18, 14, -17);
  ctx.quadraticCurveTo(11, -17, 10, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pale lime highlight on nose tip
  ctx.fillStyle = '#ECFCCB';
  ctx.beginPath();
  ctx.ellipse(17, -22, 2.8, 1.8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Freckle dots across nose bridge
  ctx.fillStyle = '#3F6212';
  ctx.beginPath();
  ctx.arc(12, -23, 0.5, 0, Math.PI * 2);
  ctx.arc(14, -24, 0.5, 0, Math.PI * 2);
  ctx.arc(13, -21.5, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Sly smile with dimple gripping pipe stem
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(3, -16);
  ctx.quadraticCurveTo(8, -13, 14, -14);
  ctx.stroke();

  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(2.5, -16, 1.8, Math.PI * 0.65, Math.PI * 1.45);
  ctx.stroke();

  // 10. Bright Red Knitted Cap with Fluffy Pom-Pom, Blatouchy & Cattails
  // Two brown Cattails (orobinec) sticking out of cap
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-2, -36);
  ctx.lineTo(-14, -46);
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(-12, -44, 3.2, 5.5, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Green reed blades with hanging water droplet
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-1, -36);
  ctx.quadraticCurveTo(-8, -42, -18, -42);
  ctx.quadraticCurveTo(-10, -40, -1, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawWaterDroplet2D(ctx, -18, -40, 1.5);

  // Red cap body with turn-up brim
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.quadraticCurveTo(4, -39, 14, -33);
  ctx.quadraticCurveTo(8, -48, -4, -48);
  ctx.quadraticCurveTo(-14, -46, -8, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow brim band
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(3, -34, 12, 3.2, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fluffy red pom-pom at cap apex
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(-5, -49, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow marsh marigold blossom (blatouch) tucked behind brim
  drawFolkFlower2D(ctx, 4, -38, 4.0, '#FACC15', '#EA580C', 0);

  ctx.restore();
}

/**
 * ============================================================================
 * 2. RUSALKA - Flagship Tavern Masterwork
 * ============================================================================
 * Plná parita s drawRusalka2D z Hospody U Černého kocoura:
 * - Vlnící se zlaté kadeře (tři odstíny CA8A04, FACC15, FEF08A) protkané orobincem a blatouchy.
 * - Jemná okulární mimika líbezné víly: mhouření modrých očí, dlouhé řasy, růžový ruměnec.
 * - Leknínová koruna (drawWaterLilyBlossom2D) s poupětem a orobincem.
 * - Akvamarínová splývavá říza s krajkovým lemem a průsvitnou pěnou.
 * - Ladné bosé čtyřprsté nožky vířící v kaluži s odkapávajícími perlami vody.
 * - V rukou nese orobincovou hůlku s vodním květem nebo víří vodní kouli.
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
  const hairSway = Math.sin(time * 2.4) * 2.5;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Shimmering floor puddle with concentric aquatic ripples
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const ripR = 3 + ((((time * 14) % 16) + 16) % 16);
  const ripA = Math.max(0, 1 - ripR / 20);
  ctx.strokeStyle = `rgba(186, 230, 253, ${ripA * 0.75})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(-4, 24, ripR, Math.max(0.1, ripR * 0.28), 0, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Cascading Golden-Blonde Wavy Hair & Trailing Emerald Reed Ribbons
  // Trailing emerald eelgrass ribbons
  ctx.fillStyle = '#4D7C0F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.bezierCurveTo(26, -8, 20 + hairSway, 8, 28 + hairSway, 22);
  ctx.bezierCurveTo(22 + hairSway, 10, 16, -4, 8, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Deep honey-gold under-layer of wavy hair
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(2, -28);
  ctx.bezierCurveTo(22, -22, 26 + hairSway, -4, 22 + hairSway, 12);
  ctx.bezierCurveTo(28 + hairSway, 24, 18 + hairSway, 34, 22 + hairSway, 44);
  ctx.bezierCurveTo(12 + hairSway, 38, 8, 24, 4, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main cascading sun-gold hair waves
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2, -30);
  ctx.bezierCurveTo(16, -26, 20 + hairSway * 0.7, -10, 15 + hairSway * 0.8, 4);
  ctx.bezierCurveTo(23 + hairSway, 16, 14 + hairSway, 28, 19 + hairSway, 38);
  ctx.bezierCurveTo(10 + hairSway, 32, 12, 18, 5, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright sun-gold accent curls
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.moveTo(4, -22);
  ctx.bezierCurveTo(14, -12, 9 + hairSway * 0.5, 2, 17 + hairSway * 0.8, 14);
  ctx.bezierCurveTo(12 + hairSway * 0.6, 24, 18 + hairSway, 32, 14 + hairSway, 40);
  ctx.bezierCurveTo(8 + hairSway * 0.5, 28, 10, 16, 5, 4);
  ctx.closePath();
  ctx.fill();

  // Amber hair wave contour lines
  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(8, -16);
  ctx.bezierCurveTo(17, -6, 12 + hairSway * 0.6, 6, 18 + hairSway * 0.8, 20);
  ctx.stroke();

  // 3. Graceful Bare Legs & Feet Stepping in the Puddle
  const legSwing = s.stride * 8;
  const backLegX = -4 - legSwing;
  const frontLegX = 4 + legSwing;

  for (let i = 0; i < 2; i++) {
    const lx = i === 0 ? backLegX : frontLegX;
    const isFront = i === 1;

    // Graceful peach calf & ankle
    ctx.fillStyle = isFront ? '#F7C59F' : '#E59866';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(lx - 2.5, 10);
    ctx.quadraticCurveTo(lx - 4, 18, lx - 3, 25);
    ctx.lineTo(lx + 5, 25);
    ctx.quadraticCurveTo(lx + 4, 18, lx + 2.5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bare 4-toed foot
    ctx.beginPath();
    ctx.ellipse(lx + 2, 26, 4.5, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Four delicate toes
    for (let t = 0; t < 4; t++) {
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.arc(lx - 1.5 + t * 1.8, 26.5, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Water droplet from stepping foot
    if (isFront) {
      drawWaterDroplet2D(ctx, lx + 7, 27, 1.4);
    }
  }

  // 4. Flowing Aquamarine Gown with Foam Ruffles
  // Pale aquamarine skirt body with rich ripple folds
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  const skirtSway = Math.sin(time * 4) * 3;
  ctx.beginPath();
  ctx.moveTo(-7, -4);
  ctx.quadraticCurveTo(-14, 6, -15 + skirtSway, 16);
  ctx.quadraticCurveTo(0, 18, 14 + skirtSway, 15);
  ctx.quadraticCurveTo(11, 6, 7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White foam ruffles on skirt hem
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  for (let r = 0; r < 5; r++) {
    const rx = -12 + r * 6 + skirtSway * 0.8;
    ctx.beginPath();
    ctx.arc(rx, 16, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Fitted bodice
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(6, -14);
  ctx.lineTo(7, -4);
  ctx.lineTo(-6, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White scalloped neckline lace
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.ellipse(0, -14, 5.5, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Delicate Arms, Cattail Wand / Water Lily Blossom
  const armAngle = s.isWindup ? -0.8 : s.isStrike ? 0.6 : Math.sin(time * 3) * 0.15;
  ctx.save();
  ctx.translate(6, -12);
  ctx.rotate(armAngle);

  // Arm & forearm
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(14, -4);
  ctx.lineTo(15, 2);
  ctx.lineTo(0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Slender four-fingered hand holding orobinec wand / water lily
  ctx.beginPath();
  ctx.ellipse(16, -1, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Freshwater Cattail (orobinec) wand
  ctx.strokeStyle = '#4D7C0F';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(16, 12);
  ctx.lineTo(18, -18);
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  safeRoundRect(ctx, 16, -17, 4.5, 12, 2);
  ctx.fill();
  ctx.stroke();

  // Glowing water lily blossom on wand tip
  drawWaterLilyBlossom2D(ctx, 18, -20, 0.9, 1.0);
  ctx.restore();

  // 6. Expressive Head, Sun-Kissed Face & Ocular Mimicry
  // Face contour
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-3, -26);
  ctx.quadraticCurveTo(-11, -24, -11, -17);
  ctx.quadraticCurveTo(-14, -15, -13, -13); // delicate button nose
  ctx.quadraticCurveTo(-11, -11, -9, -8);
  ctx.quadraticCurveTo(-2, -6, 5, -11);
  ctx.quadraticCurveTo(6, -20, -3, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rosy cheek blush with white shine dashes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-5, -13, 3.8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-6, -14); ctx.lineTo(-4, -15);
  ctx.stroke();

  // Sweet singing/smiling mouth with rose-pink lower lip
  const mouthOpen = s.isAttacking ? 2.8 : 1.4;
  ctx.fillStyle = '#BE123C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-8, -10.5, 2.2, mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ocular mimicry: Large aquatic-blue eye with sweeping lashes & specular catchlight
  const eyeSquint = s.isStrike ? 0.75 : s.isWindup ? 0 : Math.sin(time * 3) > 0.85 ? 0.6 : 0.1;
  const openEyeY = 1 - eyeSquint * 0.65;

  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-5, -17, 3.8, 4.4 * openEyeY, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ocean-blue iris
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(-5.5 + s.pupilShiftX * 0.35, -17, 2.2, 3.0 * openEyeY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark pupil
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(-5.8 + s.pupilShiftX * 0.35, -17, 1.2, 1.8 * openEyeY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular catchlight
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-5.0, -18.5 * openEyeY - 0.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Sweeping black eyelashes
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-8, -19); ctx.lineTo(-10.5, -21);
  ctx.moveTo(-6, -20.5); ctx.lineTo(-7.5, -23);
  ctx.moveTo(-3, -20.5); ctx.lineTo(-3.5, -23);
  ctx.stroke();

  // Delicate arched eyebrow
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(-8, -23);
  ctx.quadraticCurveTo(-4, -26, 0, -23);
  ctx.stroke();

  // 7. Water-Lily Blossom Crown (Leknínová koruna) with Cattails
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(6, -26);
  ctx.lineTo(12, -40);
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  safeRoundRect(ctx, 10, -38, 4, 10, 2);
  ctx.fill();
  ctx.stroke();

  // Crown blossom
  drawWaterLilyBlossom2D(ctx, 0, -32, 1.15, 1.0);

  ctx.restore();
}

/**
 * ============================================================================
 * 3. KOLEDUJÍCÍ / HOSPODSKÝ BUBÁK - Flagship Tavern Masterwork
 * ============================================================================
 * Plná parita s drawTavernBubak2D z Hospody U Černého kocoura:
 * - Velká bosá limetková chodidla se 4 prsty a žlutavými drápky.
 * - Baculatý pupík se spirálou a červené kšandy se stříbrnými přezkami.
 * - Záplatované pytlovinové kalhoty s modrou a červenou křížkovou záplatou a dírou na koleni.
 * - Zavalitý zelený krk s modrým puntíkovaným šátkem (polka-dot bandana s mašlí).
 * - Obrovské odstávající uši s terakotovou conchou, divoká dvoubarevná spiková hříva.
 * - Široká řvoucí/řehtající se tlama s nažloutlými tesáky, růžovým jazykem a pivní pěnou.
 * - Ruka opřená v bok s černými chlupy na lokti, v druhé pěnící tuplák / mosazná petrolejka.
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
  const jawOpen = s.isAttacking ? 1.0 : 0.65 + 0.15 * Math.sin(time * 4.8);
  const eyeSquint = s.isStrike ? 0.75 : s.isWindup ? 0 : Math.sin(time * 3.7) > 0.85 ? 0.55 : 0.15;
  const earWiggle = Math.sin(time * 6.5) * 0.08 + (s.isAttacking ? 0.15 : 0);
  const tongueWagX = Math.sin(time * 7.2) * 1.8;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir, 1);

  if (s.isPanicked) {
    ctx.rotate(0.1);
  }

  // 1. Ground Shadow & Big Bare Troll Feet with 4 Toes & Yellowish Nails
  ctx.fillStyle = 'rgba(28, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 25, 26, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legSwing = s.stride * 8;
  const feet = [
    { lx: -9 - legSwing, dir: -1 },
    { lx: 9 + legSwing, dir: 1 }
  ];

  for (const f of feet) {
    // Green ankle shaft
    ctx.fillStyle = '#84CC16';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.rect(f.lx - 4, 12, 8, 12);
    ctx.fill();
    ctx.stroke();

    // Foot base
    ctx.beginPath();
    ctx.ellipse(f.lx + f.dir * 1.5, 24, 8.5, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4 plump toes with yellowish nails
    for (let toe = 0; toe < 4; toe++) {
      const tx = f.lx - 3.5 + toe * 2.6 + (f.dir > 0 ? 1 : -0.5);
      const ty = 24.5;
      ctx.fillStyle = '#A3E635';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 2.0, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Yellowish-amber toenail
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(tx + f.dir * 0.3, ty + 0.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Plump Lime-Green Torso & Red Suspenders
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, -12);
  ctx.quadraticCurveTo(-16, 0, -14, 12);
  ctx.quadraticCurveTo(0, 16, 14, 12);
  ctx.quadraticCurveTo(16, 0, 12, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lime pot-belly highlight & spiral navel (pupík)
  ctx.fillStyle = '#A3E635';
  ctx.beginPath();
  ctx.ellipse(1, 2, 8.5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(2, 5, 1.4, 0, Math.PI * 1.65);
  ctx.stroke();

  // Red Suspenders with Silver Buckles
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  // Left suspender
  ctx.beginPath();
  ctx.rect(-10, -12, 4.2, 22);
  ctx.fill();
  ctx.stroke();
  // Right suspender
  ctx.beginPath();
  ctx.rect(6, -12, 4.2, 22);
  ctx.fill();
  ctx.stroke();

  // Silver buckles
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  ctx.strokeRect(-11, -3, 6, 4.5);
  ctx.strokeRect(5, -3, 6, 4.5);

  // 3. Tattered Brown Burlap Shorts with Patches
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-15, 10);
  ctx.lineTo(15, 10);
  ctx.lineTo(14, 18);
  ctx.lineTo(2, 17);
  ctx.lineTo(0, 13);
  ctx.lineTo(-2, 17);
  ctx.lineTo(-14, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Burlap weave lines
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-6, 11); ctx.lineTo(-6, 17);
  ctx.moveTo(6, 11); ctx.lineTo(6, 17);
  ctx.stroke();

  // Golden waist button
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 11.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue patch on left leg & red patch on right leg
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(-12, 12, 5.5, 5);
  ctx.strokeRect(-12, 12, 5.5, 5);
  // Torn hole showing green knee
  ctx.fillStyle = '#84CC16';
  ctx.fillRect(-10, 18, 3, 2);

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(7, 12, 5.5, 5);
  ctx.strokeRect(7, 12, 5.5, 5);

  // 4. Arms & Props (Arm on hip / Arm holding Foaming Beer Mug or Brass Lantern)
  // Left arm akimbo on hip with bristly elbow hairs
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 7.0;
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-11, 8);
  ctx.stroke();

  ctx.strokeStyle = '#84CC16';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-11, 8);
  ctx.stroke();

  // Bristly black hairs on elbow
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-20, -3); ctx.lineTo(-24, -5);
  ctx.moveTo(-22, 1); ctx.lineTo(-26, 1);
  ctx.stroke();

  // Plump green fist on hip
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-10, 8, 3.8, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right arm holding foaming beer mug
  const mugArmAngle = s.isWindup ? -0.5 : s.isStrike ? 0.4 : Math.sin(time * 3) * 0.1;
  ctx.save();
  ctx.translate(11, -6);
  ctx.rotate(mugArmAngle);

  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 7.0;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(12, 6); ctx.lineTo(16, 2);
  ctx.stroke();
  ctx.strokeStyle = '#84CC16';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(12, 6); ctx.lineTo(16, 2);
  ctx.stroke();

  // Foaming stoneware beer mug
  drawFoamingBeerMug2D(ctx, 20, 2, 0.9, -0.15, time);

  // Four curled green fingers gripping mug handle
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.3;
  for (let f = 0; f < 3; f++) {
    ctx.beginPath();
    ctx.ellipse(15.5, -1 + f * 2.4, 2.0, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 5. Goblin Neck & Blue Polka-Dot Bandana with Fabric Collar Folds
  // Neck
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -12);
  ctx.lineTo(-8, -20);
  ctx.lineTo(8, -20);
  ctx.lineTo(9, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Blue Polka-Dot Bandana
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11, -16);
  ctx.quadraticCurveTo(0, -11, 11, -16);
  ctx.quadraticCurveTo(12, -9, 9, -8);
  ctx.quadraticCurveTo(0, -6, -9, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Knotted center bow with jagged ribbon tails
  ctx.beginPath();
  ctx.ellipse(0, -8, 3.2, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-1, -7); ctx.lineTo(-4, 0); ctx.lineTo(-1, -2); ctx.lineTo(2, 0); ctx.lineTo(1, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crisp white polka dots
  ctx.fillStyle = '#FFFDF7';
  const dots = [[-7, -13], [-2, -12], [3, -12], [7, -13], [-2, -2], [2, -2]];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Head, Huge Jug Ears & Wild Spiky Two-Tone Hair
  ctx.save();
  ctx.translate(0, -22);

  // Wild spiky hair mane (spikes 451A03, D97706, F59E0B)
  const hairSpikes = [
    { a: -3.2, len: 18, col: '#451A03' },
    { a: -2.7, len: 22, col: '#D97706' },
    { a: -2.2, len: 24, col: '#F59E0B' },
    { a: -1.7, len: 25, col: '#451A03' },
    { a: -1.2, len: 23, col: '#D97706' },
    { a: -0.7, len: 20, col: '#F59E0B' },
    { a: -0.2, len: 17, col: '#451A03' },
  ];
  for (const sp of hairSpikes) {
    const tipX = Math.cos(sp.a) * sp.len;
    const tipY = Math.sin(sp.a) * sp.len;
    ctx.fillStyle = sp.col;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(tipX * 0.2 - 3, tipY * 0.2);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX * 0.2 + 3, tipY * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Huge Wiggling Jug Ears
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 11, -3);
    ctx.rotate(side * earWiggle);

    ctx.fillStyle = '#84CC16';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(side * 3, 0, 5.5, 7.5, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Terracotta inner ear concha
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.ellipse(side * 3, 0.5, 3.2, 4.8, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Green goblin head
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -3, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wide Laughing Mouth with Yellowed Fangs & Wagging Tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 2, 7.0 * jawOpen, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wagging pink tongue
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(tongueWagX, 4 + jawOpen * 2, 3.5, Math.PI, Math.PI * 2);
  ctx.fill();

  // Crooked yellowed goblin fangs
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.0;
  ctx.fillRect(-5, 1, 2.2, 3);
  ctx.strokeRect(-5, 1, 2.2, 3);
  ctx.fillRect(3, 1, 2.2, 3);
  ctx.strokeRect(3, 1, 2.2, 3);

  // Beer foam mustache dots over mouth!
  ctx.fillStyle = '#FFFFFF';
  for (let m = -4; m <= 4; m += 2) {
    ctx.beginPath();
    ctx.arc(m, 0.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Round bulbous nose
  ctx.fillStyle = '#A3E635';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Popping Expressive Eyes with Pupil Saccades & Specular Shine
  for (const side of [-1, 1]) {
    const ex = side * 5.0;
    const ey = -8;
    const openY = 1 - eyeSquint * 0.7;

    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.4, 4.2 * openY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dark pupil
    const px = ex + s.pupilShiftX * 0.5;
    const py = ey + s.pupilShiftY * 0.5;
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.ellipse(px, py, 1.8, 2.2 * openY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlight
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(px - 0.7, py - 0.7 * openY, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Bushy eyebrow
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(ex - side * 3, ey - 5 * openY - s.browLift * 0.5);
    ctx.lineTo(ex + side * 3, ey - 6 * openY - s.browLift);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * ============================================================================
 * 4. SKALNÍ OBR (Kovářský štamgast) - Mountain Blacksmith Masterwork
 * ============================================================================
 * Plný hospodský figurální kánon (ADR 0054/0055):
 * - Masivní furiantský hromotluk s koženou kovářskou zástěrou (Kovářská zástěra)
 *   s nýty a opaskem, pod níž vykukuje lidová vesta s červeným lemováním a křížky.
 * - Těžké okované horské škorně se šněrováním a dopadovým stínováním.
 * - Huňaté srostlé obočí do V, vyceněné nažloutlé stoličky, červený baňatý nos s póry.
 * - Z uší a nozder odfrkující kvašové obláčky páry při vzteku (drawFuriantSteamPuffs).
 * - V rukách drží pěnící kamenný tuplák piva a obří borovicový kyj s kůrou a suky.
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

  // 1. Heavy Mountain Ground Shadow with Impact Rims
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Muscular Stone-Grey Legs & Heavy Hobnailed Mountain Boots
  const legSwing = s.stride * 8;
  for (const side of [-1, 1]) {
    const lx = side * 8 + (side === 1 ? legSwing : -legSwing);

    // Muscular stone-grey leg shaft
    ctx.fillStyle = '#52525B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.rect(lx - 5, 8, 10, 16);
    ctx.fill();
    ctx.stroke();

    // Heavy mountain boot with iron toe cap & yellow laces
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.rect(lx - 6, 22, 14, 7);
    ctx.fill();
    ctx.stroke();

    // Iron sole rim & hobnails
    ctx.fillStyle = '#27272A';
    ctx.fillRect(lx - 6, 27, 14, 2.5);

    // Boot lacing
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(lx - 3, 23); ctx.lineTo(lx + 2, 25);
    ctx.moveTo(lx - 3, 25); ctx.lineTo(lx + 2, 27);
    ctx.stroke();
  }

  // 3. Massive Stone-Grey Torso with Granite Highlights
  ctx.fillStyle = '#71717A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Granite highlight streak
  ctx.fillStyle = '#A1A1AA';
  ctx.beginPath();
  ctx.ellipse(-6, -4, 12, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 4. Folkloric Waistcoat with Red Piping & Yellow Cross-Stitches
  ctx.fillStyle = '#27272A';
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

  // Red piping on waistcoat lapel
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-4, -14); ctx.lineTo(-4, 18);
  ctx.moveTo(4, -14); ctx.lineTo(4, 18);
  ctx.stroke();

  // Yellow embroidered cross-stitches
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, -2); ctx.lineTo(-6, 2);
  ctx.moveTo(-6, -2); ctx.lineTo(-10, 2);
  ctx.moveTo(6, 4); ctx.lineTo(10, 8);
  ctx.moveTo(10, 4); ctx.lineTo(6, 8);
  ctx.stroke();

  // 5. Authentic Leather Blacksmith Apron (Kovářská zástěra) with Rivets
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.lineTo(11, 16);
  ctx.lineTo(-11, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Apron leather belt & brass buckle
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-12, 4, 24, 3.5);
  ctx.strokeRect(-12, 4, 24, 3.5);

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-3, 3.5, 6, 4.5);

  // Forged brass rivets along apron edges
  const rivets = [[-8, -6], [8, -6], [-9, 13], [9, 13]];
  for (const [rx, ry] of rivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 6. Arms & Props: Foaming Stone Tankard & Knotted Pine Log Club
  // Left arm holding Foaming Tankard
  ctx.save();
  ctx.fillStyle = '#52525B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.rect(-24, -4, 8, 18);
  ctx.fill();
  ctx.stroke();
  drawFoamingBeerMug2D(ctx, -26, 12, 0.8, 0.2, time);
  ctx.restore();

  // Right arm wielding Giant Knotted Pine Log Club (Borovicový kyj)
  ctx.save();
  if (s.isAttacking) {
    if (s.isWindup) {
      // Overhead windup hoist
      ctx.fillStyle = '#52525B';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.rect(14, -26, 8, 20);
      ctx.fill();
      ctx.stroke();

      // Giant pine log with bark, knots and iron bands
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 8.5;
      ctx.beginPath();
      ctx.moveTo(-18, -48);
      ctx.lineTo(38, -40);
      ctx.stroke();

      // Knots & iron bands
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(22, -43); ctx.lineTo(24, -39);
      ctx.moveTo(10, -45); ctx.lineTo(12, -41);
      ctx.stroke();

      ctx.fillStyle = '#713F12';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(32, -40, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Smashing club straight down into ground!
      ctx.fillStyle = '#52525B';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.rect(12, 0, 8, 18);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 8.5;
      ctx.beginPath();
      ctx.moveTo(4, -4);
      ctx.lineTo(36, 28);
      ctx.stroke();

      ctx.fillStyle = '#713F12';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(30, 24, 7.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // Resting carry
    ctx.fillStyle = '#52525B';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.rect(16, -4, 8, 18);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 7.0;
    ctx.beginPath();
    ctx.moveTo(20, 2);
    ctx.lineTo(28, 22);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Head, Shaggy Charcoal Beard & Furiantský Expressive Face
  ctx.fillStyle = '#52525B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, -22, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaggy black hair and beard with braided knots
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.lineTo(-12, -7);
  ctx.lineTo(0, -3);
  ctx.lineTo(12, -7);
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
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-10, -24);
  ctx.lineTo(0, -20);
  ctx.lineTo(10, -24);
  ctx.stroke();

  // Furious popping amber eyes with pupils
  for (const side of [-1, 1]) {
    const ex = side * 5.0;
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ex, -19, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(ex, -19, 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.4, -19, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bulbous red schnoz with pores & shine
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -16, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FECACA';
  ctx.beginPath();
  ctx.arc(-1, -17, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Roaring open mouth with yellow fangs & tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -11, 4.8, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, -8, 2.5, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-3, -11, 2, 2.5);
  ctx.fillRect(1, -11, 2, 2.5);

  ctx.restore();
}

/**
 * ============================================================================
 * 5. MARIÁŠOVÝ ČERT - Iconic Czech Devil Cardshark
 * ============================================================================
 * Plný hospodský figurální kánon (ADR 0054/0055):
 * - Huňatá uhelná kozí stehna, okovaná kopyta s jiskrami a švihající ocas s bodcem.
 * - Červený slavnostní frak s černými sametovými výložkami a zlatými knoflíky.
 * - Beranní rohy s rýhami, špičaté uši se zlatou náušnicí a potměšilý škleb.
 * - Vějíř autentických mariášových karet (Srdcové eso a Zelený spodek) v pařátu.
 * - Hliněná fajfka se žhavým uhlíkem síry a stoupajícími purpurovými obláčky kouře.
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

  // 1. Fiery Ground Scorch Aura & Embers
  ctx.fillStyle = 'rgba(239, 68, 68, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Barbed Devil Tail (Švihající ocas s trojúhelníkovým hrotem a mašlí)
  const tailWhip = Math.sin(time * 16) * 16;
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = isBoss ? 4.5 : 3.2;
  ctx.beginPath();
  ctx.moveTo(-8, 4);
  ctx.quadraticCurveTo(-26, tailWhip, -34, -10 + tailWhip * 0.7);
  ctx.stroke();

  // Crimson spade tip
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-34, -18 + tailWhip * 0.7);
  ctx.lineTo(-44, -10 + tailWhip * 0.7);
  ctx.lineTo(-34, -2 + tailWhip * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Festive red ribbon tied on tail
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(-26, tailWhip, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Shaggy Goat Legs & Polished Cloven Hooves with Sparks
  const legSwing = s.stride * 10;
  for (const side of [-1, 1]) {
    const lx = side * 6 + (side === 1 ? legSwing : -legSwing);

    // Shaggy charcoal fur on thighs
    ctx.fillStyle = '#27272A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(lx, 10, 6, 9, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cloven hoof
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.rect(lx - 4.5, 18, 9, 6.5);
    ctx.fill();
    ctx.stroke();

    // Horseshoe rim & cloven notch
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(lx - 4.5, 23, 9, 1.8);
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx, 18); ctx.lineTo(lx, 25);
    ctx.stroke();

    // Yellow spark from stomping hoof
    if (s.isMoving && Math.sin(time * 12) > 0.7) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(lx + side * 5, 24, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Red Tailcoat (Červený slavnostní frak) with Black Velvet Lapels & Gold Buttons
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(10, -10);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Swallowtail flaps behind
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.lineTo(-18, 22);
  ctx.lineTo(-8, 16);
  ctx.lineTo(-4, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Black velvet lapels
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(-8, -10); ctx.lineTo(-2, 4); ctx.lineTo(-7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -10); ctx.lineTo(2, 4); ctx.lineTo(7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden waistcoat buttons
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.2;
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.arc(0, -6 + b * 4.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 5. Arms, Fan of Mariáš Cards & Clay Sulfur Pipe
  // Left arm holding fan of Mariáš cards
  ctx.save();
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 6.0;
  ctx.beginPath();
  ctx.moveTo(-10, -6); ctx.lineTo(-20, -2); ctx.lineTo(-14, 6);
  ctx.stroke();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-10, -6); ctx.lineTo(-20, -2); ctx.lineTo(-14, 6);
  ctx.stroke();

  // Fan of Mariáš Cards: Srdcové eso (Hearts Ace) & Zelený spodek (Leaves Unter)
  const cardAng = [-0.3, 0.1];
  for (let c = 0; c < 2; c++) {
    ctx.save();
    ctx.translate(-22 + c * 5, 2 - c * 3);
    ctx.rotate(cardAng[c]);

    // White card body with black border
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    safeRoundRect(ctx, -5, -8, 10, 16, 1.5);
    ctx.fill();
    ctx.stroke();

    if (c === 0) {
      // Srdcové eso (Heart Ace)
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(-2, -3, 2, Math.PI, 0);
      ctx.arc(2, -3, 2, Math.PI, 0);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Zelený spodek (Leaf Unter)
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();

  // Right arm holding smouldering clay sulfur pipe
  ctx.save();
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 6.0;
  ctx.beginPath();
  ctx.moveTo(10, -6); ctx.lineTo(18, 0); ctx.lineTo(14, 8);
  ctx.stroke();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(10, -6); ctx.lineTo(18, 0); ctx.lineTo(14, 8);
  ctx.stroke();

  // Clay pipe stem & smouldering bowl with sulfur smoke
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8, -14); ctx.lineTo(20, -4);
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(20, -4, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing sulfur ember & purple smoke
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(20, -5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E9D5FF';
  ctx.beginPath();
  ctx.arc(21, -11, 3.2, 0, Math.PI * 2);
  ctx.arc(23, -17, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Head, Ribbed Ram Horns, Pointed Goblin Ears & Sly Grin
  // Black curls and head contour
  ctx.fillStyle = '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -20, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ribbed ram horns with ridge lines
  for (const side of [-1, 1]) {
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 5.2;
    ctx.beginPath();
    ctx.moveTo(side * 5, -28);
    ctx.quadraticCurveTo(side * 18, -36, side * 14, -22);
    ctx.stroke();

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(side * 5, -28);
    ctx.quadraticCurveTo(side * 18, -36, side * 14, -22);
    ctx.stroke();

    // Horn ridges
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(side * (9 + r * 3), -30 + r * 3, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pointed goblin ear with gold hoop
    ctx.fillStyle = '#27272A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(side * 8, -20);
    ctx.lineTo(side * 16, -22);
    ctx.lineTo(side * 10, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (side === -1) {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-13, -18, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Sly yellow eyes with vertical slit pupils
  for (const side of [-1, 1]) {
    const ex = side * 4.5;
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, -21, 3.2, 4.0, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vertical slit pupil
    ctx.fillStyle = HOSPODA_INK;
    ctx.beginPath();
    ctx.ellipse(ex + s.pupilShiftX * 0.3, -21, 0.9, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red hooked nose with dark wart
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.quadraticCurveTo(5, -19, 3, -15);
  ctx.quadraticCurveTo(0, -16, -2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(3.5, -17, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Crooked sly grin with canine fangs & forked pink tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -13, 5.0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(-1, -11); ctx.lineTo(-2, -7); ctx.lineTo(0, -9); ctx.lineTo(2, -7); ctx.lineTo(1, -11);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(-4, -13, 1.8, 2.5);
  ctx.fillRect(2, -13, 1.8, 2.5);

  ctx.restore();
}

/**
 * ============================================================================
 * 6. STRACHEM NACPANÝ BARBUCHA - Sazový démon z pece (Lada Canon)
 * ============================================================================
 * PŘÍSNĚ PODLE PŮVODNÍHO KÁNONU JOSEFA LADY (Bubáci a hastrmani):
 * - ŽÁDNÉ kominické proprietity, ŽÁDNÝ sněhulák, ŽÁDNÝ mrkvový nos!
 * - Mohutný rotující vír sazí, uhelného dýmu a strachu (vícevrstvé laloky #1C1610, #26201A, #374151).
 * - Divoká uhelná spiková kštice tyčící se na vrcholku hlavy.
 * - Hrozivé zářící bílo-rudé oči se štěrbinovými zorničkami v temných očnicích.
 * - Široká zubatá tlama s křivými tesáky a kouřovými plameny.
 * - ČERNÁ ŽIHADLA: Dlouhé, tenké, rovné, jehlově špičaté černé drápy vystřelující
 *   z dýmových vírů těla a pařátů směrem k lovci!
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
  const s = resolveBossState(time, vx, false, attackInfo, enemy);
  const tailSway = Math.sin(time * 4.2) * 5.5;
  const attackLift = s.isAttacking ? 6 : 0;
  const tremble = s.isAttacking ? Math.sin(time * 38) * 1.5 : 0;
  const stingerExtend = s.isStrike ? 18 : s.isWindup ? 10 : 0;

  // 1. Swirling Soot Shadow on Floor
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 26, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy + s.bob - attackLift + tremble);
  ctx.scale(s.dir, 1);

  // 2. Swirling Soot & Smoke Vortex Tail (Funnel twisting from furnace chimney)
  ctx.fillStyle = '#1C1610';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.quadraticCurveTo(-22 + tailSway, 26, -14 + tailSway * 1.2, 38);
  ctx.quadraticCurveTo(-6 + tailSway, 46, -16 + tailSway, 50);
  ctx.quadraticCurveTo(-24 + tailSway, 44, -18 + tailSway * 0.8, 38);
  ctx.quadraticCurveTo(-26 + tailSway * 0.5, 26, -6, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Swirling ash eddy inside the tail
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.quadraticCurveTo(-18 + tailSway * 0.8, 32, -12 + tailSway, 44);
  ctx.stroke();

  // 3. Multi-Layered Flat Gouache Soot Lobes Body & Head
  // Outer furnace soot lobes
  drawFlatGouacheSmokeLobe(ctx, -14, 6, 16, '#26201A', HOSPODA_INK);
  drawFlatGouacheSmokeLobe(ctx, 12, 8, 15, '#26201A', HOSPODA_INK);
  drawFlatGouacheSmokeLobe(ctx, -3, 11, 18, '#18130E', HOSPODA_INK);
  drawFlatGouacheSmokeLobe(ctx, 0, -2, 20, '#1C1610', HOSPODA_INK);

  // Upper torso and head lobes
  drawFlatGouacheSmokeLobe(ctx, -8, -18, 17, '#26201A', HOSPODA_INK);
  drawFlatGouacheSmokeLobe(ctx, 9, -16, 17, '#18130E', HOSPODA_INK);
  drawFlatGouacheSmokeLobe(ctx, 0, -22, 19, '#1C1610', HOSPODA_INK);

  // Pale ash-grey contour lobes for dimension
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(-10, -24, 7, 0, Math.PI * 2);
  ctx.arc(8, -22, 6.5, 0, Math.PI * 2);
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // 4. Wild Towering Spiky Black Hair/Crest (Divoká uhelná kštice)
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  const hairSpikes = [
    [-20, -28, -30, -38, -16, -30],
    [-14, -32, -22, -48, -8, -34],
    [-7, -36, -9, -54, -2, -36],
    [-2, -37, 5, -55, 6, -36],
    [5, -36, 14, -50, 10, -33],
    [10, -32, 20, -42, 15, -28],
    [16, -26, 26, -34, 18, -22],
  ];
  for (let i = 0; i < hairSpikes.length; i++) {
    const [x1, y1, x2, y2, x3, y3] = hairSpikes[i];
    const wave = Math.sin(time * 6 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 + wave, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 5. Smoke Arms with ČERNÁ ŽIHADLA (Straight, Thin, Needle-Sharp Black Stingers)
  for (const isLeft of [true, false]) {
    ctx.save();
    const side = isLeft ? -1 : 1;
    const ax = side * 15;
    const ay = s.isAttacking ? -16 : -5;
    const armAngle = s.isAttacking ? side * 0.45 : side * 0.15;

    ctx.translate(ax, ay);
    ctx.rotate(armAngle);

    // Smoke arm segments
    drawFlatGouacheSmokeLobe(ctx, side * 7, -2, 9, '#26201A', HOSPODA_INK);
    drawFlatGouacheSmokeLobe(ctx, side * 16, -4, 8, '#18130E', HOSPODA_INK);

    // ČERNÁ ŽIHADLA: Dlouhé, tenké, rovné, jehlově špičaté černé drápy
    const stingers = [
      { ang: -0.3, len: 22 + stingerExtend },
      { ang: 0.0, len: 26 + stingerExtend * 1.2 },
      { ang: 0.3, len: 22 + stingerExtend },
    ];

    for (const st of stingers) {
      ctx.save();
      ctx.translate(side * 20, -4);
      ctx.rotate(side * st.ang);

      // Long needle-sharp black stinger
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.lineTo(side * st.len, 0); // straight needle tip
      ctx.lineTo(0, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp white glint along top needle edge
      ctx.strokeStyle = '#FFFDF7';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -1.2);
      ctx.lineTo(side * (st.len * 0.85), 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Additional Torso Černá Žihadla bristling from swirling body
  const bodyStingers = [
    { x: -16, y: 10, ang: -2.3, len: 16 + stingerExtend * 0.6 },
    { x: 16, y: 12, ang: -0.8, len: 16 + stingerExtend * 0.6 },
    { x: -12, y: -8, ang: -2.7, len: 14 + stingerExtend * 0.5 },
  ];
  for (const bs of bodyStingers) {
    ctx.save();
    ctx.translate(bs.x, bs.y);
    ctx.rotate(bs.ang);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -1.4);
    ctx.lineTo(bs.len, 0);
    ctx.lineTo(0, 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 6. Terrifying Expressive Face: Piercing Eyes & Cavernous Fanged Jaws
  // Menacing V-shaped soot brow ridges
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-14, -24);
  ctx.lineTo(0, -20);
  ctx.lineTo(14, -24);
  ctx.stroke();

  // Piercing glowing eyes: Stark white/pale-yellow with crimson slit pupils
  for (const side of [-1, 1]) {
    const ex = side * 6.5;
    const ey = -17;

    // Stark glaring eye
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 5.0, 6.2, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crimson iris ring
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(ex + s.pupilShiftX * 0.4, ey, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Piercing vertical black slit pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(ex + s.pupilShiftX * 0.4, ey, 1.0, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular catchlight
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex - 1.2, ey - 1.6, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cavernous, Ragged Soot Jaws with Menacing Fangs
  ctx.fillStyle = '#18130E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.quadraticCurveTo(0, -10, 10, -7);
  ctx.quadraticCurveTo(9, 6, 0, 7);
  ctx.quadraticCurveTo(-9, 6, -10, -7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Deep furnace red throat glow
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp, jagged, crooked fangs along upper and lower jaw
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.1;
  // Upper fangs
  const upperFangs = [-7, -3, 1, 5];
  for (const fx of upperFangs) {
    ctx.beginPath();
    ctx.moveTo(fx, -8);
    ctx.lineTo(fx + 1.2, -3);
    ctx.lineTo(fx + 2.4, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Lower fangs
  const lowerFangs = [-5, -1, 3];
  for (const fx of lowerFangs) {
    ctx.beginPath();
    ctx.moveTo(fx, 6);
    ctx.lineTo(fx + 1.2, 1.5);
    ctx.lineTo(fx + 2.4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
