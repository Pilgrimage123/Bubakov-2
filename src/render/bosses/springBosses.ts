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
  const scale = 2.0;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Meadow Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(34, 85, 34, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Bare Little Legs (Čiperné bosé nožky se 4 prstíky)
  ctx.fillStyle = '#E8BE9B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;

  const legL = Math.sin(time * 10) * 4;
  const legR = -legL;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.lineTo(-7 + legL, 18);
  ctx.lineTo(-2 + legL, 18);
  ctx.lineTo(-3, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(3, 8);
  ctx.lineTo(2 + legR, 18);
  ctx.lineTo(7 + legR, 18);
  ctx.lineTo(6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny toes
  ctx.fillStyle = '#D9A07A';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-7 + legL + i * 2, 18, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3 + legR + i * 2, 18, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Patched Green Peasant Breeches & Suspenders (Záplatované kraťásky)
  ctx.fillStyle = '#3E6B27';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-9, 4);
  ctx.lineTo(9, 4);
  ctx.lineTo(8, 11);
  ctx.lineTo(1, 10);
  ctx.lineTo(0, 11);
  ctx.lineTo(-1, 10);
  ctx.lineTo(-8, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright yellow patch on shorts
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.rect(-6, 6, 4, 3.5);
  ctx.fill();
  ctx.stroke();
  // Patch stitches
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-6.5, 5.5); ctx.lineTo(-1.5, 10);
  ctx.moveTo(-1.5, 5.5); ctx.lineTo(-6.5, 10);
  ctx.stroke();

  // Suspenders
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, 4); ctx.lineTo(-4, -4);
  ctx.moveTo(5, 4); ctx.lineTo(4, -4);
  ctx.stroke();

  // 4. White Peasant Shirt Torso
  ctx.fillStyle = '#FAF7EE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red neck scarf
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -3.5, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Expressive Round Face
  ctx.fillStyle = '#F6CBB2';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -9, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks with white highlights
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5, -7.5, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -7.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4.5, -8.5, 0.9, 0, Math.PI * 2);
  ctx.arc(5.5, -8.5, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Bulbous button nose with freckles
  ctx.fillStyle = '#EB9A7E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -8.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Freckles
  ctx.fillStyle = '#854D0E';
  ctx.fillRect(-3, -6.5, 0.8, 0.8);
  ctx.fillRect(-2, -5.8, 0.8, 0.8);
  ctx.fillRect(2, -6.5, 0.8, 0.8);
  ctx.fillRect(3, -5.8, 0.8, 0.8);

  // Mischievous eyes with whites, blue irises and catchlights
  for (const side of [-1, 1]) {
    const eyeX = side * 3.5;
    const eyeY = -11;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 2.6, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iris
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(eyeX + (s.isAttacking ? side * 0.8 : 0.4), eyeY, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(eyeX + (s.isAttacking ? side * 0.8 : 0.4), eyeY, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 0.8, eyeY - 0.9, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Playful bushy eyebrow
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const browTilt = s.isAttacking ? side * 1.5 : -side * 0.8;
    ctx.moveTo(eyeX - 2.5, eyeY - 3.8 + browTilt);
    ctx.quadraticCurveTo(eyeX, eyeY - 5.0, eyeX + 2.5, eyeY - 3.8 - browTilt);
    ctx.stroke();
  }

  // Broad smiling mouth with tongue
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (s.isAttacking) {
    // Open joyful yell
    ctx.ellipse(0, -4.5, 3.5, 3.0, 0, 0, Math.PI);
  } else {
    // Wide cheeky smile
    ctx.arc(0, -5.5, 4.0, 0.2, Math.PI - 0.2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pink tongue
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.arc(0, -4.2, 1.8, 0, Math.PI);
  ctx.fill();

  // 6. Giant Yellow Marsh Marigold (Blatouch) Flower Hat
  // Green stem sticking out
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-1, -21);
  ctx.quadraticCurveTo(2, -26, 4, -28);
  ctx.lineTo(2.5, -28.5);
  ctx.quadraticCurveTo(0.5, -26, -2.2, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dew drop on stem
  ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
  ctx.beginPath();
  ctx.arc(3.5, -27, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Large five-lobed bright gouache marigold blossom
  const petalColors = ['#FBBF24', '#F59E0B', '#FCD34D', '#F59E0B', '#FBBF24'];
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i - 2) * 0.55;
    const px = Math.cos(angle) * 11;
    const py = -16 + Math.sin(angle) * 6;
    ctx.fillStyle = petalColors[i];
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(px, py, 6.5, 5.0, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Golden stamen center
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(0, -16.5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. Arms and Botanical Prop (Marsh Willow Reed)
  const armSwing = Math.sin(time * 8) * 4;
  // Left arm holding blossom reed
  ctx.fillStyle = '#E8BE9B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;

  ctx.beginPath();
  ctx.moveTo(-7, -2);
  ctx.lineTo(-12, 1 + armSwing);
  ctx.lineTo(-14, -1 + armSwing);
  ctx.lineTo(-7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // The reed with golden bud
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-13, 0 + armSwing);
  ctx.lineTo(-19, -14 + armSwing + (s.isStrike ? -4 : 0));
  ctx.stroke();

  drawFolkFlower2D(ctx, -19, -15 + armSwing + (s.isStrike ? -4 : 0), 4.5, '#F59E0B', '#FEF08A');

  // Droplets splashing from the reed
  if (s.isAttacking) {
    drawWaterDroplet2D(ctx, -23, -16, 2.5, 1.0);
    drawWaterDroplet2D(ctx, -20, -22, 2.0, 1.0);
  }

  // Right arm swinging cheerfully
  ctx.beginPath();
  ctx.moveTo(7, -2);
  ctx.lineTo(13, 2 - armSwing);
  ctx.lineTo(14, 0 - armSwing);
  ctx.lineTo(7, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

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
  }

  // 1. Muddy Pond Shadow with Ripple Rings
  ctx.save();
  ctx.fillStyle = 'rgba(21, 52, 38, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.2;
  const ripple = (time * 2) % 1;
  ctx.beginPath();
  ctx.ellipse(0, 20, 16 + ripple * 8, 4.5 + ripple * 2.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Webbed Green Feet with 4 Toes
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;

  const legShift = Math.sin(time * 9) * 4.5;
  for (const side of [-1, 1]) {
    const lx = side * 6 + (side === -1 ? legShift : -legShift);
    ctx.beginPath();
    ctx.moveTo(lx - 2, 8);
    ctx.lineTo(lx - 4, 19);
    ctx.lineTo(lx + 6, 19);
    ctx.lineTo(lx + 2, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4 webbed frog toes
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.arc(lx - 3 + t * 2.8, 19, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // 3. Green Frock Coat with Red Trimming & Coattails Dripping Water
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  // Torso coat
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.lineTo(10, -4);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red piping on collar & hems
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-12, 10); ctx.lineTo(12, 10);
  ctx.moveTo(-7, -4); ctx.lineTo(0, 4); ctx.lineTo(7, -4);
  ctx.stroke();

  // Characteristic Ladovské Coattails (šosy) flapping behind
  ctx.fillStyle = '#166534';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  const flap = Math.sin(time * 12) * 3;
  ctx.beginPath();
  ctx.moveTo(-9, 10);
  ctx.quadraticCurveTo(-14, 16 + flap, -16, 22 + flap);
  ctx.lineTo(-11, 23 + flap);
  ctx.lineTo(-7, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red lining on the coattail tip
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-13.5, 22.5 + flap, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Water actively dripping from the coattail!
  drawRealisticDripCycle2D(ctx, -14, 24 + flap, time, 1.2);
  drawRealisticDripCycle2D(ctx, 10, 12, time + 0.6, 1.0);

  // Red Polka-dot Scarf
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -4.5, 8.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White polka dots
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-4, -4.5, 1.1, 0, Math.PI * 2);
  ctx.arc(0, -4.5, 1.1, 0, Math.PI * 2);
  ctx.arc(4, -4.5, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // 4. Green Bog Frog-Face with Big Cheeks
  ctx.fillStyle = '#4ADE80';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12, 10.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bog warts on cheek
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.arc(-6, -9, 1.4, 0, Math.PI * 2);
  ctx.arc(-7.5, -11, 1.0, 0, Math.PI * 2);
  ctx.arc(7, -9, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Hooked Ladovský frog-nose
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -11, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sly squinting eyes with golden-green irises
  for (const side of [-1, 1]) {
    const ex = side * 4.2;
    const ey = -14.5;
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.2, 3.0, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iris & slitted frog pupil
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.ellipse(ex + side * 0.5, ey, 1.6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#022C22';
    ctx.beginPath();
    ctx.rect(ex + side * 0.5 - 0.5, ey - 1.8, 1.0, 3.6);
    ctx.fill();

    // Specular glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.0, ey - 1.0, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Shrewd arched eyebrow
    ctx.strokeStyle = '#064E3B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - 2.8, ey - 4.2);
    ctx.quadraticCurveTo(ex, ey - 5.5, ex + 2.8, ey - 3.8);
    ctx.stroke();
  }

  // Crooked sly grin showing single yellow tooth
  ctx.fillStyle = '#7F1D1D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -7.5, 5.0, 0.1, Math.PI * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow snaggle-tooth
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.rect(1.0, -8.0, 2.0, 2.8);
  ctx.fill();
  ctx.stroke();

  // Pink frog tongue sticking out playfully
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(-1.5, -5.8, 2.0, 0, Math.PI);
  ctx.fill();

  // 5. Tall Waterlily Top Hat with Fishing Hook & Red Feather
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  // Brim
  ctx.beginPath();
  ctx.ellipse(0, -19, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crown
  ctx.beginPath();
  ctx.moveTo(-7, -19);
  ctx.lineTo(-5.5, -28);
  ctx.lineTo(5.5, -28);
  ctx.lineTo(7, -19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red hatband
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.rect(-6.8, -21.5, 13.6, 2.5);
  ctx.fill();
  ctx.stroke();

  // Water lily blossom tucked in hatband
  drawWaterLilyBlossom2D(ctx, -6, -23, 0.7);

  // Red pheasant feather
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(4, -22);
  ctx.quadraticCurveTo(11, -28, 14, -34);
  ctx.stroke();

  // 6. Willow Wand with Ribbon Streamers in Hand
  const wandBob = Math.sin(time * 7) * 3;
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(11, 4);
  ctx.quadraticCurveTo(18, -4 + wandBob, 22, -18 + wandBob + (s.isStrike ? 8 : 0));
  ctx.stroke();

  // Floating ribbons (pentle)
  const ribColors = ['#EF4444', '#3B82F6', '#EAB308'];
  for (let r = 0; r < 3; r++) {
    ctx.strokeStyle = ribColors[r];
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const rx = 22;
    const ry = -18 + wandBob + r * 2.5;
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + 6, ry + Math.sin(time * 10 + r) * 4, rx + 12, ry + 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. MRAZIVÁ VRÁNA (Stage Crow, L0 Vele-boss)
// Archetyp: Komicky vzteklá a furiantská vrána v pletené šále a teplých škorních
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
  }

  // 1. Shadow Below
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Powerful Clawed Crow Legs in Woolen Socks & Wooden Clogs
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;

  const legWobble = Math.sin(time * 8) * 3;
  for (const side of [-1, 1]) {
    const lx = side * 7;
    // Striped warm sock
    ctx.beginPath();
    ctx.rect(lx - 2.5, 10, 5, 8);
    ctx.fill();
    ctx.stroke();

    // Stripes on socks
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx - 2.5, 12.5); ctx.lineTo(lx + 2.5, 12.5);
    ctx.moveTo(lx - 2.5, 15.5); ctx.lineTo(lx + 2.5, 15.5);
    ctx.stroke();

    // Wooden peasant clog (dřevák)
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(lx - 4, 18);
    ctx.lineTo(lx + 7, 18);
    ctx.lineTo(lx + 6, 22);
    ctx.lineTo(lx - 5, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Shaggy Black & Blue-Grey Crow Plumage Torso
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Layered feather highlights (Ladovský kvašový rastr)
  const feathers = [
    [-6, -4, '#334155'], [0, -3, '#475569'], [6, -4, '#334155'],
    [-5, 4, '#334155'], [0, 5, '#475569'], [5, 4, '#334155']
  ];
  for (const [fx, fy, col] of feathers) {
    ctx.fillStyle = col as string;
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(fx as number, fy as number, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Flapping Wings
  const wingFlap = Math.sin(time * 12) * (s.isAttacking ? 18 : 10);
  // Back wing
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.quadraticCurveTo(-22, -10 + wingFlap, -30, 2 + wingFlap);
  ctx.lineTo(-24, 8 + wingFlap);
  ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front wing
  ctx.beginPath();
  ctx.moveTo(8, -2);
  ctx.quadraticCurveTo(22, -10 - wingFlap, 30, 2 - wingFlap);
  ctx.lineTo(24, 8 - wingFlap);
  ctx.lineTo(10, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Red Woolen Knit Scarf with Tassels
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -6, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dangling scarf tail flapping in frost wind
  const scarfWave = Math.sin(time * 9) * 4;
  ctx.beginPath();
  ctx.moveTo(-4, -3);
  ctx.quadraticCurveTo(-12, 4 + scarfWave, -16, 14 + scarfWave);
  ctx.lineTo(-11, 15 + scarfWave);
  ctx.lineTo(-2, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Scarf fringe/tassels
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-16 + i * 1.5, 14 + scarfWave);
    ctx.lineTo(-17 + i * 1.5, 18 + scarfWave);
    ctx.stroke();
  }

  // 5. Huge Crow Head with Fiery Expressive Eyes & Giant Yellow Beak
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Angry bushy Ladovské V-eyebrows
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-7, -21 + (s.isAttacking ? 2 : 0));
  ctx.lineTo(-1, -18);
  ctx.lineTo(5, -21 + (s.isAttacking ? 2 : 0));
  ctx.stroke();

  // Large bulging eye with white sclera and red-amber iris
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(3, -16, 4.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fiery iris
  ctx.fillStyle = s.isEnraged ? '#EF4444' : '#F59E0B';
  ctx.beginPath();
  ctx.arc(3.5, -16, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Deep black pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(3.8, -16, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Bright specular glint
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(4.6, -17.2, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Giant sharp yellow beak
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  const beakOpen = s.isAttacking ? 5 : 1;

  // Upper beak
  ctx.beginPath();
  ctx.moveTo(8, -17);
  ctx.quadraticCurveTo(18, -16, 25, -13);
  ctx.quadraticCurveTo(18, -11, 9, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower beak
  ctx.beginPath();
  ctx.moveTo(9, -13);
  ctx.quadraticCurveTo(17, -10 + beakOpen, 23, -11 + beakOpen);
  ctx.lineTo(8, -9 + beakOpen);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red tongue inside yelling beak
  if (s.isAttacking) {
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(13, -12 + beakOpen * 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Steam puffs shooting from beak in winter frost
  drawFuriantSteamPuffs(ctx, 26, -13, time, 1);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. TAJÍCÍ SNĚHULÁK (Melting Snowman, L1 Mini-boss)
// Archetyp: Rozšafný tající sněhulák s otlučeným hrncem, koštětem a louží
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
  }

  // 1. Sprawling Muddy Thaw Puddle
  ctx.save();
  ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
  ctx.beginPath();
  const puddlePulse = Math.sin(time * 3) * 2;
  ctx.ellipse(0, 22, 26 + puddlePulse, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Melting water drips
  drawRealisticDripCycle2D(ctx, -12, 23, time, 1.2);
  drawRealisticDripCycle2D(ctx, 14, 23, time + 0.5, 1.0);
  ctx.restore();

  // 2. Bottom Snowball (Tající spodní koule s usazeným popelem a blátem)
  ctx.fillStyle = '#F1F5F9';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  // Flattened base
  ctx.ellipse(0, 12, 19, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mud splatters on bottom
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.arc(-8, 17, 2.5, 0, Math.PI * 2);
  ctx.arc(7, 18, 3.0, 0, Math.PI * 2);
  ctx.arc(0, 19, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Coal buttons
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  for (const by of [9, 14]) {
    ctx.beginPath();
    ctx.arc(0, by, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Middle Snowball
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Coal button on belly
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(0, 1, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Striped Woolen Scarf (Pruhovaná teplá šála)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -9, 14, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White stripes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.rect(-9, -11, 3.5, 4.5);
  ctx.rect(0, -11, 3.5, 4.5);
  ctx.rect(8, -11, 3.5, 4.5);
  ctx.fill();

  // Scarf tails fluttering
  const scarfWave = Math.sin(time * 7) * 3;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.quadraticCurveTo(18, -4 + scarfWave, 22, 6 + scarfWave);
  ctx.lineTo(18, 7 + scarfWave);
  ctx.lineTo(6, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Head Snowball with Expressive Face
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -17, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Smiling coal eyes with bright white glints
  for (const side of [-1, 1]) {
    const cx = side * 4.2;
    const cy = -19;
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + 0.8, cy - 0.9, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Cheerful coal eyebrow
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy - 4.5, 2.8, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
  }

  // Giant Grooved Carrot Nose
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(1, -17);
  ctx.lineTo(17, -15);
  ctx.lineTo(1, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Carrot rings
  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(6, -16.5); ctx.lineTo(6, -13.5);
  ctx.moveTo(11, -16.0); ctx.lineTo(11, -14.0);
  ctx.stroke();

  // Green carrot greens
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(1, -17); ctx.lineTo(-2, -19);
  ctx.moveTo(1, -15); ctx.lineTo(-3, -15);
  ctx.stroke();

  // Coal smile
  ctx.fillStyle = '#1E293B';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * 2.8, -12 + (i === 0 ? 1.5 : 0), 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Old Battered Enamel Cooking Pot as Hat (Otlučený hrnec s uchem)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  // Tilted pot on head
  ctx.moveTo(-9, -24);
  ctx.lineTo(-7, -34);
  ctx.lineTo(7, -34);
  ctx.lineTo(9, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pot rim
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(0, -24, 10, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pot handle (ucho)
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(-8, -29, 3.5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  // White enamel chip patch
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(2, -29, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 6. Birch Broom Prop in Hand (Březové koště)
  const broomSwing = Math.sin(time * 6) * 4;
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-20, -18 + broomSwing + (s.isStrike ? 10 : 0));
  ctx.stroke();

  // Birch twigs bundle
  ctx.fillStyle = '#A16207';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  const bx = -20;
  const by = -18 + broomSwing + (s.isStrike ? 10 : 0);
  ctx.moveTo(bx - 3, by);
  ctx.lineTo(bx - 12, by - 14);
  ctx.lineTo(bx + 4, by - 14);
  ctx.lineTo(bx + 3, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Twig tie string
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(bx - 5, by - 4);
  ctx.lineTo(bx + 5, by - 4);
  ctx.stroke();

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
  }

  // 1. Ice-Cracking Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Colossal Stone Legs & Fur-Lined Boots
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  const stride = Math.sin(time * 6) * 5;
  for (const side of [-1, 1]) {
    const lx = side * 10 + (side === -1 ? stride : -stride);
    ctx.beginPath();
    ctx.moveTo(lx - 5, 8);
    ctx.lineTo(lx - 7, 24);
    ctx.lineTo(lx + 7, 24);
    ctx.lineTo(lx + 5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sheepskin trim on boots
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(lx, 21, 7.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Heavy iron studded sole
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(lx - 7, 24, 14, 3);
  }

  // 3. Massive Torso in Sheepskin Vest & Rope Belt
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sheepskin vest over shoulders
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(-18, -14);
  ctx.lineTo(18, -14);
  ctx.lineTo(16, 6);
  ctx.lineTo(6, 4);
  ctx.lineTo(0, 7);
  ctx.lineTo(-6, 4);
  ctx.lineTo(-16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy braided rope belt with wooden buckle
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-19, 7); ctx.lineTo(19, 7);
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.rect(-5, 4.5, 10, 6);
  ctx.fill();
  ctx.stroke();

  // 4. Huge Stone-Hewn Head with Icicle Beard & Bushy Eyebrows
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -16, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Magnificent Icicle Beard (Hustý rampouchový plnovous)
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  const iciclePoints = [
    [-10, -10, -11, 4],
    [-6, -9, -7, 9],
    [-2, -8, -3, 13],
    [2, -8, 2, 14],
    [6, -9, 6, 8],
    [10, -10, 9, 3]
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

  // Furiant V-shaped bushy frost eyebrows
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-10, -23);
  ctx.lineTo(-1, -19);
  ctx.lineTo(9, -23);
  ctx.stroke();

  // Fiery blue giant eyes
  for (const side of [-1, 1]) {
    const ex = side * 5.0;
    const ey = -18;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex, ey, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.0, ey - 1.0, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Broad bulbous frostbitten nose with bluish blush
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -14.5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bared angry teeth
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-6, -10, 12, 4);
  ctx.fill();
  ctx.stroke();
  for (let t = -4; t <= 4; t += 2) {
    ctx.beginPath();
    ctx.moveTo(t, -10); ctx.lineTo(t, -6);
    ctx.stroke();
  }

  // Steam chugging from nostrils
  drawFuriantSteamPuffs(ctx, 0, -12, time, 1);

  // 5. Giant Fir Tree Trunk Club (Celý kmen zasněžené jedle)
  const clubLift = s.isWindup ? -18 : s.isStrike ? 12 : 0;
  ctx.save();
  ctx.translate(18, -4 + clubLift);
  ctx.rotate(s.isStrike ? 0.4 : -0.2);

  // Trunk
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-4, 18);
  ctx.lineTo(4, 18);
  ctx.lineTo(7, -30);
  ctx.lineTo(-7, -30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fir needle tufts on club top
  ctx.fillStyle = '#14532D';
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(12, -26);
  ctx.lineTo(5, -26);
  ctx.lineTo(14, -16);
  ctx.lineTo(-14, -16);
  ctx.lineTo(-5, -26);
  ctx.lineTo(-12, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snow cap on fir
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -36, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. OBŘÍ KOLEDNICKÝ BERÁNEK (Beránek, L2 Mini-boss)
// Archetyp: Rozšafný a rozverný upečený velikonoční beránek se zlatým zvoncem
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
  }

  // 1. Festive Easter Meadow Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(22, 101, 52, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Golden-Baked Biscuit Pastry Body with Fluffy Sugar Wool Texture
  ctx.fillStyle = '#FDE68A'; // Golden sponge cake
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  // Trotters / hooves in little leather buckled slippers
  const gallop = Math.sin(time * 11) * 4;
  for (const side of [-1, 1]) {
    const hx = side * 11 + (side === -1 ? gallop : -gallop);
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(hx - 3, 10);
    ctx.lineTo(hx - 3, 20);
    ctx.lineTo(hx + 3, 20);
    ctx.lineTo(hx + 3, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little black hoof tip
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(hx - 3.5, 18, 7, 3);
  }

  // Plump baked body
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Confectioner's White Sugar Wool Puffs (Cukrová poleva s vlnkami)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  const woolPuffs = [
    [-12, 0, 5], [-6, -4, 6], [2, -5, 6], [10, -2, 5],
    [-10, 6, 5], [-3, 6, 6], [6, 6, 5.5], [12, 4, 4.5]
  ];
  for (const [wx, wy, wr] of woolPuffs) {
    ctx.beginPath();
    ctx.arc(wx, wy, wr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Fluffy little tail with pink ribbon
  ctx.beginPath();
  ctx.arc(-18, 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.ellipse(-19, 1, 3, 2, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Red Silk Neck Ribbon with Golden Brass Bell (Červená pentle se zvonkem)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(7, -6, 7.5, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden Bell with Clapper
  const bellSwing = Math.sin(time * 12) * 3;
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(9 + bellSwing * 0.4, -1, 3.5, Math.PI, 0);
  ctx.lineTo(13.5 + bellSwing * 0.4, 3);
  ctx.lineTo(4.5 + bellSwing * 0.4, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bell clapper
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(9 + bellSwing * 0.4, 4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Little musical ding ring
  drawMusicNote2D(ctx, 15, -4, 0, 0.8);

  // 3. Cute Baked Lamb Head with Curly Horns & Rosy Cheeks
  ctx.fillStyle = '#FDE68A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(12, -14, 9, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White sugar curl on forehead
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(10, -18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden curly butter horns
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  // Left horn
  ctx.beginPath();
  ctx.arc(7, -19, 4.5, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.arc(15, -20, 4.5, Math.PI * 0.7, Math.PI * 2.1);
  ctx.stroke();

  // Soft long droopy lamb ears
  ctx.fillStyle = '#FBCFE8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(4, -13, 6, 2.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big gentle Ladovské sheep eye with lush eyelashes
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(13, -15, 3.8, 4.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(14, -15, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.ellipse(14.2, -15, 1.8, 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Catchlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(14.8, -16.2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Eyelashes
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(11, -18.5); ctx.lineTo(10, -20.5);
  ctx.moveTo(14, -19); ctx.lineTo(14, -21.5);
  ctx.moveTo(16, -18.5); ctx.lineTo(17, -20.5);
  ctx.stroke();

  // Pink snout & chewing mouth with spring clover
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.ellipse(19, -12, 2.5, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Green clover stem in mouth
  ctx.strokeStyle = '#15803D';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(19, -11);
  ctx.quadraticCurveTo(24, -10, 27, -7);
  ctx.stroke();

  // 3-leaf clover
  drawFolkFlower2D(ctx, 28, -7, 3.2, '#22C55E', '#166534');

  // Rosy cheek
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.arc(11, -11, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. KLEKÁNICE (Klekanice, L3 Mini-boss)
// Archetyp: Zlomyslná a potměšilá večerní babice s mosazným zvonem a nůší
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
  }

  // 1. Creeping Evening Dusk Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(30, 27, 75, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Heavy Peasant Wool Skirt & Patched Apron (Tmavomodrá sukně a zástěra)
  ctx.fillStyle = '#1E1B4B'; // Midnight blue skirt
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-11, -2);
  ctx.lineTo(11, -2);
  ctx.lineTo(14, 20);
  ctx.lineTo(-14, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy studded boots peaking from skirt
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.rect(-8, 19, 6, 3.5);
  ctx.rect(3, 19, 6, 3.5);
  ctx.fill();
  ctx.stroke();

  // Ochre patched apron (Záplatovaná zástěra s kapsou)
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(7, 0);
  ctx.lineTo(8, 17);
  ctx.lineTo(-8, 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Deep apron pocket with poppy heads (makovice) peaking out
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.rect(-5, 6, 10, 8);
  ctx.fill();
  ctx.stroke();

  // Poppy heads in pocket
  ctx.fillStyle = '#4B5563';
  ctx.beginPath();
  ctx.arc(-2, 5, 2.2, 0, Math.PI * 2);
  ctx.arc(2, 4.5, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Hunched Shoulders in Shawl (Puntíkovaný vlněný šátek přes ramena)
  ctx.fillStyle = '#7C2D12';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -5, 12, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White polka dots
  ctx.fillStyle = '#FEF3C7';
  for (const [px, py] of [[-7, -5], [-3, -7], [3, -7], [7, -5], [0, -3]]) {
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Shrewd Old Witch Face with Hooked Nose & Wart
  ctx.fillStyle = '#F2CCB6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -14, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Prominent hooked Ladovský nose with hair/wart
  ctx.fillStyle = '#E59B7D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.quadraticCurveTo(8, -14, 8, -10);
  ctx.quadraticCurveTo(2, -9, 0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wart with dark hair
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(6, -11, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(6, -11); ctx.lineTo(8, -12.5);
  ctx.stroke();

  // Shrewd yellow cat-like eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    const ey = -16;
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.8, 2.5, -side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex + (s.isAttacking ? side * 0.8 : 0.4), ey, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.8, ey - 0.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Knitted bushy brow
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ex - 2.5, ey - 3.5);
    ctx.lineTo(ex + 2.5, ey - 2.5);
    ctx.stroke();
  }

  // Toothless cackling mouth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, -9.5, 3.5, 2.5, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Single crooked tooth
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(-1.0, -10.5, 1.8, 2.2);

  // Kerchief tied tight over head (Šátek uvázaný pod bradou)
  ctx.fillStyle = '#0369A1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -16, 11, Math.PI * 0.8, Math.PI * 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kerchief knot under chin
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(0, -6.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Heavy Brass Curfew Bell (Těžký mosazný zvon s provazem)
  const bellSwing = Math.sin(time * 9) * 5;
  ctx.save();
  ctx.translate(-14, 4 + bellSwing);
  ctx.rotate(bellSwing * 0.05);

  // Bell body
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -8, 6, Math.PI, 0);
  ctx.quadraticCurveTo(8, 0, 10, 6);
  ctx.lineTo(-10, 6);
  ctx.quadraticCurveTo(-8, 0, 0, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Clapper swinging out
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sound rings
  if (s.isAttacking) {
    drawMusicNote2D(ctx, -12, -4, 0, 1.0);
    drawMusicNote2D(ctx, -8, -12, 1, 1.2);
  }

  ctx.restore();

  // Long spindly 4-fingered claw hand gripping bell rope
  ctx.fillStyle = '#F2CCB6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-10, 2, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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
  }

  // 1. Midnight Aerial Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flying Birch Broom (Staré březové koště s uzlem a větvičkami)
  const broomTilt = Math.sin(time * 6) * 3;
  ctx.save();
  ctx.rotate(0.1 + (s.isStrike ? 0.25 : 0));

  // Broomstick handle
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-28, 4 + broomTilt);
  ctx.lineTo(24, 2 + broomTilt);
  ctx.stroke();

  // Birch twigs bundle at back
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-22, 4 + broomTilt);
  ctx.lineTo(-34, -4 + broomTilt);
  ctx.lineTo(-38, 12 + broomTilt);
  ctx.lineTo(-24, 8 + broomTilt);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dangling Brass Lantern on Broom Front
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.8;
  const lanternSwing = Math.sin(time * 8) * 4;
  ctx.beginPath();
  ctx.moveTo(22, 2 + broomTilt);
  ctx.lineTo(22 + lanternSwing * 0.3, 10 + broomTilt);
  ctx.stroke();

  // Glowing lantern body
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(18 + lanternSwing * 0.3, 10 + broomTilt, 8, 10);
  ctx.fill();
  ctx.stroke();

  // Flame inside lantern
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.arc(22 + lanternSwing * 0.3, 15 + broomTilt, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 3. Flower-Patched Nightgown (Květovaná noční košile)
  ctx.fillStyle = '#DDD6FE'; // Light lilac nightshirt
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(9, -4);
  ctx.lineTo(13, 14);
  ctx.lineTo(-13, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Small flower prints on nightgown
  drawFolkFlower2D(ctx, -5, 2, 2.5, '#EC4899', '#FDF2F8');
  drawFolkFlower2D(ctx, 4, 7, 2.5, '#3B82F6', '#EFF6FF');

  // Striped woolen socks dangling as she rides
  for (const side of [-1, 1]) {
    const sx = side * 5;
    ctx.fillStyle = '#F1F5F9';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.rect(sx - 2, 13, 4, 7);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sx - 2, 15.5); ctx.lineTo(sx + 2, 15.5);
    ctx.moveTo(sx - 2, 18.0); ctx.lineTo(sx + 2, 18.0);
    ctx.stroke();
  }

  // 4. Sleepy Shrewd Face with Yawning / Smirking Mouth
  ctx.fillStyle = '#FBCFE8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Disheveled grey hair sticking out
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.0;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-8 + i * 4, -18);
    ctx.lineTo(-11 + i * 5, -24 + Math.sin(time * 5 + i) * 2);
    ctx.stroke();
  }

  // Hooked nose with freckles
  ctx.fillStyle = '#F472B6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(1, -11, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sleepy squinting eyes (ospalá mhouřící víčka)
  for (const side of [-1, 1]) {
    const ex = side * 3.8;
    const ey = -14;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.8, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4338CA';
    ctx.beginPath();
    ctx.arc(ex + 0.4, ey, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy drowsy eyelids
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.ellipse(ex, ey - 0.8, 3.0, 1.4, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }

  // Yawning open mouth with pink tongue
  ctx.fillStyle = '#831843';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(1, -7.5, 3.5, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(1, -6.5, 2.0, 0, Math.PI);
  ctx.fill();

  // 5. Polka-dot Nightcap with Pompom (Noční čepec s bambulí)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  const capWave = Math.sin(time * 7) * 4;
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.quadraticCurveTo(-6, -28, 4, -30);
  ctx.quadraticCurveTo(14, -26 + capWave, 16, -18 + capWave);
  ctx.lineTo(8, -17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White pompom on cap tip
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(16, -18 + capWave, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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
  }

  // 1. Vast Freezing Aura Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(12, 74, 110, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Heavy Sheepskin Coats & Boots (Trojitý mohutný kožich)
  ctx.fillStyle = '#0369A1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Broad joint body
  ctx.beginPath();
  ctx.moveTo(-22, -6);
  ctx.lineTo(22, -6);
  ctx.lineTo(24, 18);
  ctx.lineTo(-24, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White wool lining on coat borders
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (const bx of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.ellipse(bx, 17, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3 Heavy studded boots
  ctx.fillStyle = '#0F172A';
  for (const bx of [-16, -6, 6, 16]) {
    ctx.fillRect(bx - 3, 20, 6, 4);
  }

  // 3. Three Distinct Folk Frost Brothers:

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

  // Brown sheepskin ushanka/beranice
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(0, -5, 9, Math.PI, 0);
  ctx.rect(-9, -5, 18, 4);
  ctx.fill();
  ctx.stroke();

  // Flappy earflaps
  ctx.fillRect(-10, -3, 4, 8);
  ctx.fillRect(6, -3, 4, 8);

  // Angry eyes & V-brow
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-5, -3); ctx.lineTo(-1, -1); ctx.lineTo(3, -3);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2.5, 1, 2.0, 0, Math.PI * 2);
  ctx.arc(2.5, 1, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-2.5, 1, 1.0, 0, Math.PI * 2);
  ctx.arc(2.5, 1, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Icicle beard
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.moveTo(-6, 5); ctx.lineTo(6, 5); ctx.lineTo(0, 14);
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

  // Blue pointed nightcap with icicle
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(8, -4);
  ctx.lineTo(4, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cheerful eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2.5, 1, 2.0, 0, Math.PI * 2);
  ctx.arc(2.5, 1, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-2.5, 1, 1.0, 0, Math.PI * 2);
  ctx.arc(2.5, 1, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Clay pipe puffing smoke (Hliněná dýmka)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(3, 4); ctx.lineTo(9, 7); ctx.lineTo(12, 3);
  ctx.stroke();

  drawFlatGouacheSmokeLobe(ctx, 13, 0, 3.5);

  // Icicle beard
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.moveTo(-6, 5); ctx.lineTo(6, 5); ctx.lineTo(2, 14);
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

  // Majestic Icicle Crown (Rampouchová koruna)
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

  // Thick frost eyebrows
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-7, -4); ctx.lineTo(0, -2); ctx.lineTo(7, -4);
  ctx.stroke();

  // Fierce eyes with catchlight
  for (const side of [-1, 1]) {
    const ex = side * 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ex, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.arc(ex, 0, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.6, -0.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mighty Icicle Beard reaching down chest
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

  // 4. Frost Sceptre & Ice Pitchfork in Hands
  const weaponLift = s.isStrike ? 8 : -4;
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(24, 6);
  ctx.lineTo(26, -22 + weaponLift);
  ctx.stroke();

  // 3-prong pitchfork head
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  for (const px of [-3, 0, 3]) {
    ctx.beginPath();
    ctx.moveTo(26 + px, -22 + weaponLift);
    ctx.lineTo(26 + px, -32 + weaponLift);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. ZBOJNÍK Z HAMRŮ (Zbojník, L5 Mini-boss)
// Archetyp: Furiantský a bodrý horský zbojník s valaškou, opaskem a knírem
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
  }

  // 1. Forest Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Leather Krpce (Tradiční zbojnické krpce ovázané řemínky)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;

  const legSwing = Math.sin(time * 9) * 4;
  for (const side of [-1, 1]) {
    const lx = side * 7 + (side === -1 ? legSwing : -legSwing);
    // White woolen trousers (soukenné nohavice)
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(lx - 4, 8);
    ctx.lineTo(lx - 4, 20);
    ctx.lineTo(lx + 4, 20);
    ctx.lineTo(lx + 4, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red braided wool cord on pants
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, 8); ctx.lineTo(lx, 19);
    ctx.stroke();

    // Krpce moccasins
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(lx - 5, 19);
    ctx.lineTo(lx + 6, 19);
    ctx.lineTo(lx + 5, 23);
    ctx.lineTo(lx - 6, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Embroidered White Shirt & Red Folkish Vest (Lidová vyšívaná vestička)
  ctx.fillStyle = '#FAF5FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red vest (lajblík) with brass buttons
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11, -6);
  ctx.lineTo(11, -6);
  ctx.lineTo(12, 6);
  ctx.lineTo(4, 5);
  ctx.lineTo(0, 7);
  ctx.lineTo(-4, 5);
  ctx.lineTo(-12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brass buttons
  ctx.fillStyle = '#F59E0B';
  for (const by of [-3, 0, 3]) {
    ctx.beginPath();
    ctx.arc(-2, by, 1.2, 0, Math.PI * 2);
    ctx.arc(2, by, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Broad Zbojník Leather Belt with 3 Big Brass Buckles (Zbojnický opasek se 3 přezkami)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-12, 5, 24, 7);
  ctx.fill();
  ctx.stroke();

  // 3 Brass buckles
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  for (const bx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.rect(bx - 2.5, 6, 5, 5);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Expressive Handsome Face with Mighty Black Moustache & Rosy Cheeks
  ctx.fillStyle = '#F5C6A5';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5.5, -10.5, 2.5, 0, Math.PI * 2);
  ctx.arc(5.5, -10.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Prominent Ladovský straight nose
  ctx.fillStyle = '#E59B7D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -12, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bold eyes with white sclera and dark irises
  for (const side of [-1, 1]) {
    const ex = side * 3.8;
    const ey = -14.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.8, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(ex + (s.isAttacking ? side * 0.7 : 0.4), ey, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.8, ey - 0.9, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Bold arched black eyebrow
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(ex - 2.8, ey - 3.8);
    ctx.quadraticCurveTo(ex, ey - 5.0, ex + 2.8, ey - 3.8);
    ctx.stroke();
  }

  // Famous curling black zbojník moustache! (Kroucený černý knír)
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

  // White teeth showing in broad furiant grin
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -7.0, 3.2, 0.2, Math.PI - 0.2);
  ctx.fill();

  // 5. Broad Felt Hat with Peacock Feather & Red Ribbons (Širák s pavím perem)
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  // Wide brim
  ctx.beginPath();
  ctx.ellipse(0, -19, 17, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Round crown
  ctx.beginPath();
  ctx.arc(0, -21, 9, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red hat ribbon
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.rect(-8.5, -22, 17, 2.5);
  ctx.fill();
  ctx.stroke();

  // Peacock feather sticking out with blue-green eye
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(5, -22);
  ctx.quadraticCurveTo(14, -28, 18, -36);
  ctx.stroke();

  // Peacock eye
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(18, -36, 3.5, 2.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(18, -36, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 6. Shepherd's Axe / Valaška in Strong Hand (Ostrá valaška)
  const valaskaTilt = s.isWindup ? -0.8 : s.isStrike ? 0.6 : 0.1;
  ctx.save();
  ctx.translate(12, 2);
  ctx.rotate(valaskaTilt);

  // Ash wood shaft
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, -26);
  ctx.stroke();

  // Steel axe blade with spike
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-1, -26);
  ctx.lineTo(10, -26);
  ctx.quadraticCurveTo(12, -21, 9, -16);
  ctx.lineTo(-1, -18);
  ctx.lineTo(-6, -21); // back spike
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}
