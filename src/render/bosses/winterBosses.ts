import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  safeRoundRect,
} from './hospodaBossHelpers';

// ---------------------------------------------------------------------------
// HOSPODSKÝ FIGURÁLNÍ KÁNON: DÁVKA 6 – ZIMA, MASOPUST A SPECIÁLNÍ BOSSOVÉ
// ---------------------------------------------------------------------------
// 1. Čert s pytlem (L18 Mini-boss)
// 2. Kolednický maškarní kozel (L18 Mezi-boss)
// 3. Mikulášský čert Richter (L18 Vele-boss)
// 4. Noční mrazivá sova (L19 Mini-boss)
// 5. Zimní jezdec Meluzíny (L19 Mezi-boss)
// 6. Král Mrazík (L19 Vele-boss)
// 7. Obří sněhulák (L20 Mini-boss)
// 8. Tříkrálový jezdec (L20 Mezi-boss)
// 9. Vládce chumelenice (L20 Vele-boss)
// 10. Ledová klekánice (L21 Mini-boss)
// 11. Mrazivý kostlivec s kosou (L21 Mezi-boss)
// 12. Šeredná Perchta s nožem (L21 Vele-boss)
// 13. Masopustní medvěd (L22 Mini-boss)
// 14. Obří slaměník (L22 Mezi-boss)
// 15. Rychtář maškar (L22 Vele-boss)
// 16. Noční kobold (L24 doplňkový miniboss)
// 17. Masopustní Laufr (L24 kanonický miniboss dle ADR 0054)
// 18. Čertova babička (Speciální boss)
// 19. Zakletá princezna (Speciální boss)
// ---------------------------------------------------------------------------

/**
 * 1. Čert s pytlem (Stage 18 Mini-boss)
 * Hrusice soot-black demon with coarse fur, curled ram horns, red tongue, and burlap sack of coal/bad children.
 */
export function drawHospodaCertSPytlem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.3;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Cloven goat hooves & hairy legs
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  // Left leg
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.lineTo(-14 + stride * 4, 32);
  ctx.lineTo(-6 + stride * 4, 32);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left hoof
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(-16 + stride * 4, 32);
  ctx.lineTo(-4 + stride * 4, 32);
  ctx.lineTo(-5 + stride * 4, 36);
  ctx.lineTo(-15 + stride * 4, 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(8 - stride * 4, 32);
  ctx.lineTo(16 - stride * 4, 32);
  ctx.lineTo(14, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right hoof
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(6 - stride * 4, 32);
  ctx.lineTo(18 - stride * 4, 32);
  ctx.lineTo(17 - stride * 4, 36);
  ctx.lineTo(7 - stride * 4, 36);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail with tuft
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.quadraticCurveTo(-28, 4 + Math.sin(time * 8) * 6, -26, -10 + Math.sin(time * 8) * 8);
  ctx.stroke();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-26, -10 + Math.sin(time * 8) * 8, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Burlap sack on back (pytel na zlobivé děti)
  ctx.save();
  ctx.translate(-16 - windup * 8, -4 + strike * 10);
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-10, 6, 22, 28, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Sack patch & rope tie
  ctx.fillStyle = '#78350F';
  safeRoundRect(ctx, -18, -4, 12, 10, 2);
  ctx.fill();
  ctx.stroke();
  // Bulging coal chunk out of top
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-8, -22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Demon Torso (soot black pelt)
  ctx.fillStyle = isEnraged ? '#450A0A' : '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shaggy chest fur tufts
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.6;
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, -6);
    ctx.lineTo(i + 2, 4);
    ctx.stroke();
  }

  // Head with horns and snout
  ctx.save();
  ctx.translate(4, -20);

  // Ram Horns (curved amber-brown)
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  // Left horn
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.quadraticCurveTo(-22, -26, -14, -36);
  ctx.quadraticCurveTo(-8, -32, -4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(8, -12);
  ctx.quadraticCurveTo(22, -26, 14, -36);
  ctx.quadraticCurveTo(8, -32, 4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head base
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pointed goat ears
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.moveTo(-14, -4);
  ctx.lineTo(-24, -10);
  ctx.lineTo(-14, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -4);
  ctx.lineTo(24, -10);
  ctx.lineTo(14, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Expressive Eyes (yellow sclera with fiery red pupils)
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.ellipse(-6, -4, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -4, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupils
  ctx.fillStyle = isPanicked ? '#DC2626' : '#0F172A';
  ctx.beginPath();
  ctx.arc(-5 + (isPanicked ? 0 : 1.5), -4, isPanicked ? 1.8 : 2.5, 0, Math.PI * 2);
  ctx.arc(7 + (isPanicked ? 0 : 1.5), -4, isPanicked ? 1.8 : 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Red Grinning Snout & Fangs
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, 4, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fangs & long tongue
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-3, 9 + jawOpen * 4);
  ctx.lineTo(-1, 5);
  ctx.moveTo(2, 5);
  ctx.lineTo(4, 9 + jawOpen * 4);
  ctx.lineTo(6, 5);
  ctx.fill();
  ctx.stroke();

  // Protruding red fork tongue
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(-2, 14 + Math.sin(time * 12) * 2);
  ctx.lineTo(0, 16);
  ctx.lineTo(2, 14 + Math.sin(time * 12) * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Right Hand holding Birch twig whip (metla)
  ctx.save();
  ctx.translate(14 + strike * 12, -4 + strike * 8);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, -14 - windup * 10 + strike * 18);
  ctx.stroke();
  // Birch twigs
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.4;
  for (let i = -6; i <= 6; i += 3) {
    ctx.beginPath();
    ctx.moveTo(16, -14 - windup * 10 + strike * 18);
    ctx.lineTo(26 + i, -22 - windup * 14 + strike * 24 + i * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 2. Kolednický maškarní kozel (Stage 18 Mezi-boss)
 * Carnival goat disguise with wooden clattering jaw, brass bells, ribbons, and sheepskin fleece.
 */
export function drawHospodaMaskarniKozel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.35;
  ctx.scale(dir * s, s);

  const charge = isStrike ? strikeProgress * 16 : 0;
  const windup = isWindup ? windupProgress * 12 : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(charge - windup, bob);

  // Human boots under costume
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  safeRoundRect(ctx, -14 + stride * 4, 26, 10, 12, 3);
  ctx.fill();
  ctx.stroke();
  safeRoundRect(ctx, 4 - stride * 4, 26, 10, 12, 3);
  ctx.fill();
  ctx.stroke();

  // Sheepskin Fleece Body (kožešina)
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 4, 26, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wool tufts scallops
  ctx.fillStyle = '#FDE68A';
  for (let a = 0; a < Math.PI * 2; a += 0.5) {
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 24, 4 + Math.sin(a) * 22, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Colorful carnival ribbons hanging
  const ribbonCols = ['#DC2626', '#2563EB', '#FACC15', '#16A34A'];
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = ribbonCols[i];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12 + i * 8, 12);
    ctx.quadraticCurveTo(-14 + i * 8 + Math.sin(time * 6 + i) * 6, 24, -10 + i * 8 + Math.sin(time * 6 + i) * 8, 32);
    ctx.stroke();
  }

  // Neck collar with jingling brass bells (mosazné rolničky)
  ctx.fillStyle = '#B45309';
  safeRoundRect(ctx, -14, -16, 28, 7, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  for (let i = -10; i <= 10; i += 7) {
    ctx.beginPath();
    ctx.arc(i, -12, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Carved wooden goat head
  ctx.save();
  ctx.translate(14, -20 - windup * 0.4 + charge * 0.3);

  // Large goat horns
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.quadraticCurveTo(-16, -28, -26, -34);
  ctx.quadraticCurveTo(-14, -24, 4, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -8);
  ctx.quadraticCurveTo(0, -32, -8, -40);
  ctx.quadraticCurveTo(8, -26, 12, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head base (wooden snout)
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(6, 0, 14, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Straw beard under chin
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.moveTo(2, 8);
  ctx.lineTo(6 + Math.sin(time * 8) * 4, 22);
  ctx.lineTo(12, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wooden clatter lower jaw (klapačka)
  const jawDrop = (isStrike ? 8 : jawOpen * 6) + Math.abs(Math.sin(time * 9)) * 4;
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(8, 6);
  ctx.lineTo(20, 6 + jawDrop);
  ctx.lineTo(14, 12 + jawDrop);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Round painted goat eye
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.arc(8, -4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Rectangular goat pupil
  ctx.fillStyle = '#0F172A';
  safeRoundRect(ctx, 6, -5, 4.5, 2.2, 1);
  ctx.fill();

  ctx.restore(); // end head

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 3. Mikulášský čert Richter (Stage 18 Vele-boss)
 * The grand menacing St. Nicholas night devil: huge horns, glowing coal eyes, heavy rattling chains, iron rod.
 */
export function drawHospodaMikulasskyCert(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.45;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 40, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Black sheepskin inverted coat with shaggy fur
  ctx.fillStyle = isEnraged ? '#3B0764' : '#18181B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;

  // Legs with massive boots
  ctx.beginPath();
  ctx.moveTo(-16, 14);
  ctx.lineTo(-18 + stride * 5, 36);
  ctx.lineTo(-6 + stride * 5, 36);
  ctx.lineTo(-8, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, 14);
  ctx.lineTo(8 - stride * 5, 36);
  ctx.lineTo(20 - stride * 5, 36);
  ctx.lineTo(18, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy Torso
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Heavy Rattling Iron Chains across torso
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-20, -14);
  ctx.lineTo(18, 14);
  ctx.moveTo(-18, 14);
  ctx.lineTo(20, -14);
  ctx.stroke();

  // Iron chain links
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (let i = -14; i <= 14; i += 7) {
    ctx.beginPath();
    ctx.arc(i, i * 0.7, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Burning charcoal pouch at belt
  ctx.fillStyle = '#78350F';
  safeRoundRect(ctx, -18, 12, 14, 14, 3);
  ctx.fill();
  ctx.stroke();
  // Glowing coals
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-11, 19, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Colossal Head
  ctx.save();
  ctx.translate(4, -28);

  // Towering Twisted Ram Horns with rings
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  // Left horn
  ctx.beginPath();
  ctx.moveTo(-12, -14);
  ctx.quadraticCurveTo(-34, -34, -22, -48);
  ctx.quadraticCurveTo(-10, -42, -4, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(12, -14);
  ctx.quadraticCurveTo(34, -34, 22, -48);
  ctx.quadraticCurveTo(10, -42, 4, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head base
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.ellipse(0, 0, 19, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fiery Eyes
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.ellipse(-7, -4, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -4, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Slit red pupils
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(-6, -4, 2.2, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -4, 2.2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout & Jagged Fangs
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.ellipse(0, 5, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fangs
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.lineTo(-4, 12 + jawOpen * 5);
  ctx.lineTo(-2, 6);
  ctx.moveTo(2, 6);
  ctx.lineTo(4, 12 + jawOpen * 5);
  ctx.lineTo(6, 6);
  ctx.fill();
  ctx.stroke();

  // Tongue licking teeth
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(-2, 8);
  ctx.quadraticCurveTo(4 + Math.sin(time * 10) * 4, 16, 2, 20);
  ctx.stroke();

  ctx.restore(); // end head

  // Iron Rod / Chain whip in hand
  ctx.save();
  ctx.translate(22 + strike * 16, -6 + strike * 10);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(24, -20 - windup * 16 + strike * 24);
  ctx.stroke();

  // Dangling chain links swinging at tip
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(24, -20 - windup * 16 + strike * 24);
  ctx.quadraticCurveTo(
    36 + Math.sin(time * 12) * 12,
    -10 + Math.cos(time * 12) * 10,
    30 + Math.sin(time * 12) * 16,
    14 + strike * 20
  );
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 4. Noční mrazivá sova (Stage 19 Mini-boss)
 * Boreal winter owl with frosted feathers, glowing amber eyes, and sharp talons.
 */
export function drawHospodaMrazivaSova(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.35;
  ctx.scale(dir * s, s);

  const wingFlap = Math.sin(time * 8) * 18;
  const dive = isStrike ? strikeProgress * 18 : 0;
  const windup = isWindup ? windupProgress * 12 : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob + dive - windup);

  // Soft winter tail feathers
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, 18);
  ctx.lineTo(0, 34);
  ctx.lineTo(10, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left Wing
  ctx.save();
  ctx.translate(-14, -4);
  ctx.rotate((-wingFlap * Math.PI) / 180);
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-18, 0, 22, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Frosted feather tips
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(-34, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right Wing
  ctx.save();
  ctx.translate(14, -4);
  ctx.rotate((wingFlap * Math.PI) / 180);
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(18, 0, 22, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Frosted feather tips
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.arc(34, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Round Owl Body (frosted blue-gray)
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 2, 20, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Breast feather scallops
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.6;
  for (let r = -6; r <= 6; r += 4) {
    ctx.beginPath();
    ctx.arc(r, 6, 4, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r + 2, 12, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Owl Head with Feathered Ear Tufts
  ctx.save();
  ctx.translate(0, -18);

  // Ear tufts (chvostky)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(-20, -22);
  ctx.lineTo(-8, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, -8);
  ctx.lineTo(20, -22);
  ctx.lineTo(8, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head base
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Facial disc rings
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(-7, 0, 8, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(7, 0, 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Enormous Golden Eyes
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(-7, 0, 6, 0, Math.PI * 2);
  ctx.arc(7, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black pupils
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-7, 0, isPanicked ? 2.2 : 3.8, 0, Math.PI * 2);
  ctx.arc(7, 0, isPanicked ? 2.2 : 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Curved dark beak
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(-2, 1);
  ctx.lineTo(0, 8 + jawOpen * 3);
  ctx.lineTo(2, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Sharp Yellow Talons
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.lineTo(-14, 28);
  ctx.lineTo(-6, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 20);
  ctx.lineTo(6, 28);
  ctx.lineTo(14, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 5. Zimní jezdec Meluzíny (Stage 19 Mezi-boss)
 * Spectral wind phantom wrapped in frosted scarves and riding a howling blizzard cyclone.
 */
export function drawHospodaJezdecMeluziny(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.4;
  ctx.scale(dir * s, s);

  const gust = Math.sin(time * 7) * 8;
  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Swirling Blizzard Whirlwind Base (instead of feet)
  ctx.save();
  ctx.translate(0, 24);
  ctx.fillStyle = '#BAE6FD';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  for (let layer = 0; layer < 3; layer++) {
    const w = 32 - layer * 8;
    const h = 8;
    const ox = Math.sin(time * 10 + layer * 2) * (6 + layer * 3);
    ctx.beginPath();
    ctx.ellipse(ox, layer * 6, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(0, bob);

  // Ghostly Tattered Winter Robes
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.quadraticCurveTo(-28 + gust, 10, -20, 24);
  ctx.lineTo(20, 24);
  ctx.quadraticCurveTo(28 - gust, 10, 16, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Long Whipping Frosted Blue Scarf
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.quadraticCurveTo(-34 - windup * 14, -8 + gust, -44 - strike * 18, 12 + gust * 2);
  ctx.lineTo(-38 - strike * 18, 18 + gust * 2);
  ctx.quadraticCurveTo(-28, 0, -6, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Spectral Pale Face
  ctx.save();
  ctx.translate(2, -24);

  // Streaming Icy Hair
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.quadraticCurveTo(-26 + gust, -20, -32 + gust * 1.5, -4);
  ctx.quadraticCurveTo(-18, -4, -6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Face base
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hollow wailing eyes
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(-5, -3, 4, 0, Math.PI * 2);
  ctx.arc(5, -3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Howling oval mouth
  ctx.fillStyle = '#0C4A6E';
  ctx.beginPath();
  ctx.ellipse(0, 6, 4, 6 + jawOpen * 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end face

  // Hand holding Rime Frost Sickle / Wind Horn
  ctx.save();
  ctx.translate(16 + strike * 12, -10 + strike * 8);
  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(8, -12 - windup * 8 + strike * 14, 12, 0.5 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 6. Král Mrazík (Stage 19 Vele-boss)
 * Ancient sovereign ruler of December blizzards: flowing icicle beard, royal ermine mantle, glacial sceptre.
 */
export function drawHospodaKralMrazik(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.48;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Heavy Royal Blue Winter Mantle
  ctx.fillStyle = isEnraged ? '#1E1B4B' : '#1E3A8A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;

  // Boots
  ctx.beginPath();
  ctx.moveTo(-16, 18);
  ctx.lineTo(-18 + stride * 4, 38);
  ctx.lineTo(-6 + stride * 4, 38);
  ctx.lineTo(-8, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(8 - stride * 4, 38);
  ctx.lineTo(20 - stride * 4, 38);
  ctx.lineTo(18, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Robe body
  ctx.beginPath();
  ctx.moveTo(-22, -14);
  ctx.lineTo(-28, 32);
  ctx.lineTo(28, 32);
  ctx.lineTo(22, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White Ermine Fur Hem with black tails
  ctx.fillStyle = '#F8FAFC';
  safeRoundRect(ctx, -30, 28, 60, 10, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  for (let i = -24; i <= 24; i += 10) {
    ctx.beginPath();
    ctx.arc(i, 33, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fur collar across shoulders
  ctx.fillStyle = '#F8FAFC';
  safeRoundRect(ctx, -24, -18, 48, 12, 5);
  ctx.fill();
  ctx.stroke();

  // Head with glacial crown and beard
  ctx.save();
  ctx.translate(0, -28);

  // Flowing Icicle Beard (massive white/blue gouache beard with icicle stalactites)
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.lineTo(-22, 24);
  ctx.lineTo(-14, 34);
  ctx.lineTo(0, 42 + Math.sin(time * 6) * 4);
  ctx.lineTo(14, 34);
  ctx.lineTo(22, 24);
  ctx.lineTo(16, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Icicle details inside beard
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1.8;
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, 10);
    ctx.lineTo(i + (i < 0 ? -2 : 2), 26);
    ctx.stroke();
  }

  // Frosty Face Base
  ctx.fillStyle = '#BAE6FD';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Frosty White Bushy Eyebrows
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(-7, -8, 6, 3, -0.2, 0, Math.PI * 2);
  ctx.ellipse(7, -8, 6, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Piercing Sapphire Eyes
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(-7, -4, 4, 0, Math.PI * 2);
  ctx.arc(7, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-6, -5, 1.5, 0, Math.PI * 2);
  ctx.arc(8, -5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Crown of Carved Glacial Ice Spikes
  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-18, -12);
  ctx.lineTo(-14, -28);
  ctx.lineTo(-8, -16);
  ctx.lineTo(0, -36);
  ctx.lineTo(8, -16);
  ctx.lineTo(14, -28);
  ctx.lineTo(18, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Glacial Ice Sceptre (Ledová berla)
  ctx.save();
  ctx.translate(22 + strike * 14, -8 + strike * 12);
  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(0, -32 - windup * 14 + strike * 22);
  ctx.stroke();

  // Snowflake star topping sceptre
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -32 - windup * 14 + strike * 22, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 7. Obří sněhulák (Stage 20 Mini-boss)
 * Village snowman with pot hat, striped woolen scarf, carrot nose, and birch broom.
 */
export function drawHospodaObriSnehulak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.38;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 38, 38, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Bottom Snowball Sphere
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 16, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Middle Snowball Sphere
  ctx.beginPath();
  ctx.arc(0, -8, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Coal buttons on chest
  ctx.fillStyle = '#1E293B';
  for (let yPos of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.arc(0, yPos, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Striped Woolen Scarf (red & yellow)
  ctx.fillStyle = '#DC2626';
  safeRoundRect(ctx, -14, -22, 28, 8, 3);
  ctx.fill();
  ctx.stroke();
  // Hanging scarf tail flapping in wind
  ctx.beginPath();
  ctx.moveTo(8, -18);
  ctx.quadraticCurveTo(18 + Math.sin(time * 6) * 6, -6, 14 + Math.sin(time * 6) * 8, 8);
  ctx.lineTo(8 + Math.sin(time * 6) * 8, 8);
  ctx.lineTo(2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top Snowball Sphere (Head)
  ctx.beginPath();
  ctx.arc(0, -28, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Coal eyes
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(-5, -31, 2.8, 0, Math.PI * 2);
  ctx.arc(5, -31, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Knobby Carrot Nose (orange gouache cone)
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(16 + (isPanicked ? 3 : 0), -26);
  ctx.lineTo(0, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Coal smile / grimace
  ctx.fillStyle = '#1E293B';
  for (let i = -4; i <= 4; i += 2) {
    ctx.beginPath();
    ctx.arc(i, -20 + Math.abs(i) * 0.8, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dented Cooking Pot / Top Hat on Head
  ctx.save();
  ctx.translate(2, -42);
  ctx.rotate(0.12);
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-12, -10, 24, 12);
  ctx.fill();
  ctx.stroke();
  // Pot rim / handle
  safeRoundRect(ctx, -15, 0, 30, 4, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Twig Arms & Birch Broom (koště)
  ctx.save();
  ctx.translate(16 + strike * 14, -10 + strike * 10);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(12, -26 - windup * 16 + strike * 22);
  ctx.stroke();

  // Birch broom head
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(12, -26 - windup * 16 + strike * 22);
  ctx.lineTo(4, -48 - windup * 16 + strike * 22);
  ctx.lineTo(20, -48 - windup * 16 + strike * 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 8. Tříkrálový jezdec (Stage 20 Mezi-boss)
 * Epiphany King on a white draft horse holding the Star of Bethlehem on a gilded pole.
 */
export function drawHospodaTrikralovyJezdec(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.42;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;
  const canter = Math.sin(time * 8) * 4;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 46, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob + canter);

  // White Draft Horse Body (Bělouš)
  ctx.fillStyle = '#F1F5F9';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;

  // Horse legs with black hooves
  ctx.beginPath();
  ctx.moveTo(-20, 10);
  ctx.lineTo(-24 + stride * 5, 38);
  ctx.lineTo(-16 + stride * 5, 38);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(16, 10);
  ctx.lineTo(12 - stride * 5, 38);
  ctx.lineTo(22 - stride * 5, 38);
  ctx.lineTo(24, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horse torso
  ctx.beginPath();
  ctx.ellipse(0, 10, 32, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Horse neck & head
  ctx.beginPath();
  ctx.moveTo(18, 4);
  ctx.lineTo(28, -14);
  ctx.lineTo(38, -6);
  ctx.lineTo(34, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Horse bridle & harness (red leather)
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(28, -14);
  ctx.lineTo(38, -6);
  ctx.stroke();

  // Royal Epiphany King Rider (Karel / Melichar / Baltazar)
  ctx.save();
  ctx.translate(-4, -12);

  // Red and gold royal cape
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.quadraticCurveTo(-26 - windup * 8, 4, -22, 18);
  ctx.lineTo(6, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // King Head with Golden Star Crown
  ctx.save();
  ctx.translate(0, -18);

  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beard
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.lineTo(0, 14);
  ctx.lineTo(6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crown with points
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-4, -10);
  ctx.lineTo(0, -22);
  ctx.lineTo(4, -10);
  ctx.lineTo(8, -18);
  ctx.lineTo(10, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end king head
  ctx.restore(); // end king rider

  // Star of Bethlehem on Gilded Pole (Tříkrálová kometa)
  ctx.save();
  ctx.translate(14 + strike * 12, -18 + strike * 8);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(0, -32 - windup * 12 + strike * 18);
  ctx.stroke();

  // 8-pointed golden star
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  const starY = -32 - windup * 12 + strike * 18;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = i % 2 === 0 ? 12 : 5;
    const px = Math.cos(a) * r;
    const py = starY + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 9. Vládce chumelenice (Stage 20 Vele-boss)
 * Primordial snowstorm titan: swirling tempest clouds, frozen glacial shoulders, and blizzard club.
 */
export function drawHospodaVladceChumelenice(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.5;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;
  const vortexSway = Math.sin(time * 6) * 10;

  // Swirling Blizzard Ground Vortex
  ctx.save();
  ctx.translate(0, 28);
  ctx.fillStyle = '#93C5FD';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 4; i++) {
    const r = 40 - i * 8;
    const ox = Math.sin(time * 8 + i * 1.5) * (8 + i * 2);
    ctx.beginPath();
    ctx.ellipse(ox, i * 6, r, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(0, bob);

  // Massive Glacial Ice Torso
  ctx.fillStyle = isEnraged ? '#1E3A8A' : '#60A5FA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-28, -14);
  ctx.lineTo(-20, 24);
  ctx.lineTo(20, 24);
  ctx.lineTo(28, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Jagged Glacial Shoulder Spikes
  ctx.fillStyle = '#93C5FD';
  ctx.beginPath();
  ctx.moveTo(-26, -14);
  ctx.lineTo(-44, -28);
  ctx.lineTo(-24, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(26, -14);
  ctx.lineTo(44, -28);
  ctx.lineTo(24, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Colossal Blizzard Face
  ctx.save();
  ctx.translate(0, -28);

  ctx.fillStyle = '#DBEAFE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Swirling Snow Beard
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-16, 6);
  ctx.quadraticCurveTo(-24 + vortexSway, 26, 0, 36);
  ctx.quadraticCurveTo(24 - vortexSway, 26, 16, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Azure Eyes
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(-8, -4, 5, 0, Math.PI * 2);
  ctx.arc(8, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ice Horns / Spikes on Crown
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.moveTo(-16, -14);
  ctx.lineTo(-12, -32);
  ctx.lineTo(-4, -16);
  ctx.lineTo(0, -38);
  ctx.lineTo(4, -16);
  ctx.lineTo(12, -32);
  ctx.lineTo(16, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Glacial Ice Club in Hand
  ctx.save();
  ctx.translate(26 + strike * 18, -10 + strike * 14);
  ctx.fillStyle = '#93C5FD';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(12, -36 - windup * 18 + strike * 26);
  ctx.lineTo(26, -32 - windup * 18 + strike * 26);
  ctx.lineTo(14, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 10. Ledová klekánice (Stage 21 Mini-boss)
 * Winter twilight crone with brass church bell, frostbite sack, and hooked nose.
 */
export function drawHospodaLedovaKlekanice(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.35;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Hunched Gray Wool Shawls
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Skirt & Feet
  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-20 + stride * 4, 34);
  ctx.lineTo(16 - stride * 4, 34);
  ctx.lineTo(14, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Torso & Shawl
  ctx.beginPath();
  ctx.ellipse(-2, 2, 18, 22, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Headscarf covering head
  ctx.save();
  ctx.translate(4, -18);

  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pale wrinkled crone face
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.ellipse(4, 2, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crooked hooked nose with wart
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.moveTo(8, -1);
  ctx.lineTo(16, 4);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing eerie violet eye
  ctx.fillStyle = '#C084FC';
  ctx.beginPath();
  ctx.arc(6, 0, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Antique Brass Church Bell (Klekací zvon) in hand
  ctx.save();
  ctx.translate(16 + strike * 14, -4 + strike * 8);
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  // Wooden handle
  ctx.strokeStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(8, -14 - windup * 10 + strike * 14);
  ctx.stroke();

  // Bell flare
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.moveTo(4, -10 - windup * 10 + strike * 14);
  ctx.lineTo(18, -16 - windup * 10 + strike * 14);
  ctx.lineTo(12, -2 - windup * 10 + strike * 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 11. Mrazivý kostlivec s kosou (Stage 21 Mezi-boss)
 * The folkloric personification of Death (Smrtka): bleached skull, frost cowl, peasant scythe.
 */
export function drawHospodaKostlivecSKosou(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.42;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 38, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Black Tattered Hooded Cowl
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Bony legs under shroud
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.lineTo(-12 + stride * 4, 36);
  ctx.moveTo(8, 14);
  ctx.lineTo(10 - stride * 4, 36);
  ctx.stroke();

  // Torso Shroud
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(-20, 26);
  ctx.lineTo(20, 26);
  ctx.lineTo(16, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Exposed Ribcage
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 2.2;
  for (let r = -6; r <= 8; r += 4) {
    ctx.beginPath();
    ctx.moveTo(-8, r);
    ctx.lineTo(8, r);
    ctx.stroke();
  }

  // Bleached Ivory Skull
  ctx.save();
  ctx.translate(2, -22);

  // Shroud Hood
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Skull Cranium
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(0, -2, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye Sockets (deep dark voids glowing blue)
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(-4, -2, 3.2, 0, Math.PI * 2);
  ctx.arc(4, -2, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Nasal cavity
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.lineTo(-2, 4);
  ctx.lineTo(2, 4);
  ctx.closePath();
  ctx.fill();

  // Clacking Mandible / Teeth
  ctx.fillStyle = '#F8FAFC';
  safeRoundRect(ctx, -5, 6 + jawOpen * 4, 10, 5, 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end skull

  // Peasant Scythe (Kosa s ocelovou čepelí)
  ctx.save();
  ctx.translate(14 + strike * 14, -6 + strike * 10);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.2;
  // Wooden shaft
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(12, -34 - windup * 16 + strike * 24);
  ctx.stroke();

  // Honed Steel Curved Scythe Blade
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const bladeX = 12;
  const bladeY = -34 - windup * 16 + strike * 24;
  ctx.moveTo(bladeX, bladeY);
  ctx.quadraticCurveTo(bladeX - 38, bladeY - 14, bladeX - 44, bladeY + 14);
  ctx.quadraticCurveTo(bladeX - 28, bladeY - 6, bladeX, bladeY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 12. Šeredná Perchta s nožem (Stage 21 Vele-boss)
 * Twelfth Night crone: grotesque beak mask, blood-red apron, carving cleaver knife.
 */
export function drawHospodaPerchtaSNozem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.46;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 40, 42, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Dark Linen Skirt & Clunky Boots
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  ctx.beginPath();
  ctx.moveTo(-18, 14);
  ctx.lineTo(-24 + stride * 5, 36);
  ctx.lineTo(20 - stride * 5, 36);
  ctx.lineTo(16, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Blood-Red Peasant Apron
  ctx.fillStyle = isEnraged ? '#7F1D1D' : '#DC2626';
  safeRoundRect(ctx, -14, -6, 28, 36, 4);
  ctx.fill();
  ctx.stroke();

  // Head with Perchta Beak Mask
  ctx.save();
  ctx.translate(4, -24);

  // Matted sheep wool hair
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(-8, -4, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head base
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wooden Carved Beak Nose
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(8, -4);
  ctx.lineTo(26, 4);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Furious Red Rimmed Eyes
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(6, -4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(6, -4, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end head

  // Carving Cleaver Knife in hand
  ctx.save();
  ctx.translate(18 + strike * 16, -6 + strike * 12);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, -18 - windup * 16 + strike * 22);
  ctx.stroke();

  // Heavy steel blade
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const kx = 14;
  const ky = -18 - windup * 16 + strike * 22;
  ctx.rect(kx - 4, ky - 18, 12, 22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 13. Masopustní medvěd (Stage 22 Mini-boss)
 * Traditional carnival bear with straw & fur suit, paper flowers, and festive collar.
 */
export function drawHospodaMasopustniMedved(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.4;
  ctx.scale(dir * s, s);

  const bearDance = Math.sin(time * 6) * 6;
  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 40, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob + bearDance);

  // Heavy Fur Legs
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;

  ctx.beginPath();
  ctx.moveTo(-18, 12);
  ctx.lineTo(-20 + stride * 4, 36);
  ctx.lineTo(-6 + stride * 4, 36);
  ctx.lineTo(-6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 12);
  ctx.lineTo(6 - stride * 4, 36);
  ctx.lineTo(20 - stride * 4, 36);
  ctx.lineTo(18, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Colossal Bear Fur Body
  ctx.fillStyle = isEnraged ? '#3B0764' : '#78350F';
  ctx.beginPath();
  ctx.ellipse(0, 2, 28, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Carnival Paper Flowers pinned to chest
  const flowerCols = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = flowerCols[i];
    ctx.beginPath();
    ctx.arc(-12 + i * 8, -2 + (i % 2) * 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Head with Round Bear Ears
  ctx.save();
  ctx.translate(2, -26);

  // Ears
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-14, -12, 7, 0, Math.PI * 2);
  ctx.arc(14, -12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head base
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wide Muzzle
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(0, 6, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Nose
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(0, 3, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-6, -4, 3.5, 0, Math.PI * 2);
  ctx.arc(6, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-6, -4, 2, 0, Math.PI * 2);
  ctx.arc(6, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end head

  // Paws swatting
  ctx.save();
  ctx.translate(22 + strike * 14, -4 + strike * 12);
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -windup * 14 + strike * 18, 8, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 14. Obří slaměník (Stage 22 Mezi-boss)
 * Towering Shrovetide straw man: braided rye straw sheaves, conical hat with rooster feathers, pitchfork.
 */
export function drawHospodaSlamennikObr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.45;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Braided Straw Legs
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-20 + stride * 4, 38);
  ctx.lineTo(-6 + stride * 4, 38);
  ctx.lineTo(-6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 12);
  ctx.lineTo(6 - stride * 4, 38);
  ctx.lineTo(20 - stride * 4, 38);
  ctx.lineTo(16, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Massive Straw Sheaf Torso
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.ellipse(0, 2, 26, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Straw ropes binding torso
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-24, -6);
  ctx.lineTo(24, -6);
  ctx.moveTo(-22, 10);
  ctx.lineTo(22, 10);
  ctx.stroke();

  // Head with Conical Straw Hat
  ctx.save();
  ctx.translate(2, -28);

  // Straw head base
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Amber glowing eyes
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(-6, -2, 4, 0, Math.PI * 2);
  ctx.arc(6, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tall Conical Straw Hat with Ribbons
  ctx.fillStyle = '#CA8A04';
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(0, -38);
  ctx.lineTo(16, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rooster feathers at hat tip
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.quadraticCurveTo(-14, -50, -4, -54);
  ctx.quadraticCurveTo(4, -46, 0, -38);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Wooden Pitchfork (Dřevěné vidle)
  ctx.save();
  ctx.translate(20 + strike * 16, -8 + strike * 12);
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(10, -32 - windup * 16 + strike * 22);
  ctx.stroke();

  // Fork tines
  ctx.lineWidth = 2.4;
  const fy = -32 - windup * 16 + strike * 22;
  ctx.beginPath();
  ctx.moveTo(4, fy);
  ctx.lineTo(2, fy - 18);
  ctx.moveTo(10, fy);
  ctx.lineTo(10, fy - 22);
  ctx.moveTo(16, fy);
  ctx.lineTo(18, fy - 18);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 15. Rychtář maškar (Stage 22 Vele-boss)
 * Supreme carnival magistrate: red festive coat, tall beaver hat with cockade, ceremonial Masopust guild scepter.
 */
export function drawHospodaRychtarMasek(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.48;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 42, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Red Festive Frock Coat & Polished Boots
  ctx.fillStyle = isEnraged ? '#991B1B' : '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;

  // Legs with tall boots
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(-16, 16);
  ctx.lineTo(-18 + stride * 4, 38);
  ctx.lineTo(-6 + stride * 4, 38);
  ctx.lineTo(-6, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 16);
  ctx.lineTo(6 - stride * 4, 38);
  ctx.lineTo(18 - stride * 4, 38);
  ctx.lineTo(16, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Frock Coat Torso
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden buttons & sash
  ctx.fillStyle = '#FACC15';
  for (let yPos of [-10, -2, 6, 14]) {
    ctx.beginPath();
    ctx.arc(0, yPos, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Head with Tall Hat & Mustache
  ctx.save();
  ctx.translate(2, -26);

  // Face base with rosy cheeks
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.arc(-8, 3, 4, 0, Math.PI * 2);
  ctx.arc(8, 3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Curled dark mustache
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.moveTo(-12, 6);
  ctx.quadraticCurveTo(0, 2, 12, 6);
  ctx.quadraticCurveTo(0, 12 + jawOpen * 4, -12, 6);
  ctx.fill();
  ctx.stroke();

  // Merry eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-6, -3, 3, 0, Math.PI * 2);
  ctx.arc(6, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tall Beaver Hat with Cockade
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.rect(-14, -28, 28, 20);
  ctx.fill();
  ctx.stroke();
  safeRoundRect(ctx, -18, -10, 36, 4, 2);
  ctx.fill();
  ctx.stroke();

  // Tricolor cockade & rooster feathers
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-10, -20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Ceremonial Masopust Scepter (Masopustní právo / ferule)
  ctx.save();
  ctx.translate(22 + strike * 16, -6 + strike * 12);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(0, -32 - windup * 16 + strike * 22);
  ctx.stroke();

  // Carved wooden hand at top
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  safeRoundRect(ctx, -6, -42 - windup * 16 + strike * 22, 12, 12, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 16. Noční kobold (Stage 24 Supplementary Mini-boss)
 * Mischievous cellar gnome with pointed red cap, brass lantern, and sturdy pickaxe.
 */
export function drawHospodaNocniKobold(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.25;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 32, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Stout Tunic & Leather Apron
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.moveTo(-12, 8);
  ctx.lineTo(-14 + stride * 4, 28);
  ctx.lineTo(14 - stride * 4, 28);
  ctx.lineTo(12, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  safeRoundRect(ctx, -10, 0, 20, 22, 3);
  ctx.fill();
  ctx.stroke();

  // Head with Pointed Red Gnome Cap
  ctx.save();
  ctx.translate(0, -16);

  // Shaggy Beard
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(0, 18);
  ctx.lineTo(10, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Face base
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bulbous nose
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pointed Red Cap
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.lineTo(6, -26);
  ctx.lineTo(12, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Brass Lantern in left hand
  ctx.save();
  ctx.translate(-16, 2);
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  safeRoundRect(ctx, -5, 0, 10, 14, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Pickaxe in right hand
  ctx.save();
  ctx.translate(14 + strike * 12, -2 + strike * 8);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(6, -18 - windup * 12 + strike * 20);
  ctx.stroke();

  // Iron pick head
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  const py = -18 - windup * 12 + strike * 20;
  ctx.moveTo(-4, py);
  ctx.lineTo(16, py);
  ctx.lineTo(12, py + 4);
  ctx.lineTo(-2, py + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 17. Masopustní Laufr (Stage 24 Canonical Mini-boss per ADR 0054)
 * The swift runner of carnival procession: multicolored diamond patched suit, pointed hat, bells, cracking whip.
 */
export function drawHospodaMasopustniLaufr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.3;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Athletic Legs with Diamond Patches
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  // Left leg
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(-10, 10);
  ctx.lineTo(-14 + stride * 6, 32);
  ctx.lineTo(-4 + stride * 6, 32);
  ctx.lineTo(-4, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.lineTo(4 - stride * 6, 32);
  ctx.lineTo(14 - stride * 6, 32);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Torso with Colorful Diamond Patches
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Diamond patch patterns
  const patchCols = ['#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = patchCols[i];
    ctx.beginPath();
    ctx.moveTo(0, -10 + i * 6);
    ctx.lineTo(6, -6 + i * 6);
    ctx.lineTo(0, -2 + i * 6);
    ctx.lineTo(-6, -6 + i * 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Jester Collar with Brass Bells
  ctx.fillStyle = '#F8FAFC';
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, -12);
    ctx.lineTo(i + 2.5, -6);
    ctx.lineTo(i + 5, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Head with Tall Conical Laufr Hat
  ctx.save();
  ctx.translate(2, -22);

  // Youthful smiling face
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = '#F87171';
  ctx.beginPath();
  ctx.arc(-6, 2, 3, 0, Math.PI * 2);
  ctx.arc(6, 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // High Conical Laufr Hat with Tassels
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(0, -38);
  ctx.lineTo(12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mirror & ribbon pompom at tip
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.arc(0, -38, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end head

  // Cracking Bullwhip (Koňský bič) in Hand
  ctx.save();
  ctx.translate(14 + strike * 14, -2 + strike * 8);
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, -14 - windup * 14 + strike * 18);
  ctx.stroke();

  // Long whip lash curve
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  const wx = 10;
  const wy = -14 - windup * 14 + strike * 18;
  ctx.moveTo(wx, wy);
  ctx.quadraticCurveTo(
    wx + 24 - windup * 12,
    wy - 18 + Math.sin(time * 12) * 8,
    wx + 36 + strike * 28,
    wy + 12 + strike * 16
  );
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 18. Čertova babička (Special Boss)
 * Ancient underworld matriarch: sooty red wrinkled skin, small horns under floral babushka, clay pipe.
 */
export function drawHospodaCertovaBabicka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.36;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 36, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Dark Woolen Skirt & Checked Apron
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  ctx.beginPath();
  ctx.moveTo(-16, 12);
  ctx.lineTo(-20 + stride * 4, 34);
  ctx.lineTo(20 - stride * 4, 34);
  ctx.lineTo(16, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Checked Red/Black Apron
  ctx.fillStyle = '#991B1B';
  safeRoundRect(ctx, -12, 0, 24, 30, 3);
  ctx.fill();
  ctx.stroke();

  // Head with Floral Babushka & Small Curled Horns
  ctx.save();
  ctx.translate(2, -20);

  // Babushka headscarf
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Small Curled Horns peeking out
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.quadraticCurveTo(-20, -18, -14, -22);
  ctx.quadraticCurveTo(-8, -18, -6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, -8);
  ctx.quadraticCurveTo(20, -18, 14, -22);
  ctx.quadraticCurveTo(8, -18, 6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wrinkled Sooty Red Face
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wicked yellow eyes
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-5, 0, 3, 0, Math.PI * 2);
  ctx.arc(5, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Smoking Antique Clay Pipe (Fajfka)
  ctx.save();
  ctx.translate(6, 6);
  ctx.strokeStyle = '#FFFBEB';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, 4);
  ctx.stroke();

  // Pipe bowl with smoke puffs
  ctx.fillStyle = '#78350F';
  safeRoundRect(ctx, 10, 0, 6, 8, 2);
  ctx.fill();
  ctx.stroke();

  // Sulfur smoke puffs
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(13 + Math.sin(time * 6) * 3, -4 - Math.abs(Math.sin(time * 6)) * 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end head

  // Hearth shovel with glowing embers in hand
  ctx.save();
  ctx.translate(16 + strike * 14, -2 + strike * 8);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(8, -18 - windup * 12 + strike * 18);
  ctx.stroke();

  // Shovel head with coals
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  safeRoundRect(ctx, 4, -26 - windup * 12 + strike * 18, 12, 10, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(10, -21 - windup * 12 + strike * 18, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}

/**
 * 19. Zakletá princezna (Special Boss)
 * Enchanted fairy tale princess: royal velvet gown in azure & rose, silver tiara, golden apple sceptre.
 */
export function drawHospodaZakletaPrincezna(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): void {
  const { dir, isWindup, isStrike, isEnraged, isPanicked, windupProgress, strikeProgress, bob, stride, jawOpen } =
    resolveBossState(time, vx, panicked, attackInfo, enemy);

  ctx.save();
  ctx.translate(x, y);
  const s = 1.38;
  ctx.scale(dir * s, s);

  const strike = isStrike ? strikeProgress : 0;
  const windup = isWindup ? windupProgress : 0;

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 38, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // Royal Velvet Gown in Azure & Rose
  ctx.fillStyle = isEnraged ? '#4C0519' : '#1E3A8A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Flowing Dress Skirt
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.quadraticCurveTo(-26, 20, -22, 34);
  ctx.lineTo(22, 34);
  ctx.quadraticCurveTo(26, 20, 14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rose Silk Front Panel
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(-8, 4);
  ctx.lineTo(-12, 34);
  ctx.lineTo(12, 34);
  ctx.lineTo(8, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Filigree Embroidery
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 32);
  ctx.stroke();

  // Head with Golden Braids & Silver Tiara
  ctx.save();
  ctx.translate(0, -22);

  // Long Golden Braids
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-16, 24);
  ctx.lineTo(-10, 24);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(16, 24);
  ctx.lineTo(10, 24);
  ctx.lineTo(6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Noble Face
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.arc(-5, 3, 2.5, 0, Math.PI * 2);
  ctx.arc(5, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Blue sorrowful eyes
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(-4, -1, 2.5, 0, Math.PI * 2);
  ctx.arc(4, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Silver Princess Tiara
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-6, -16);
  ctx.lineTo(0, -20);
  ctx.lineTo(6, -16);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiara ruby gem
  ctx.fillStyle = '#E11D48';
  ctx.beginPath();
  ctx.arc(0, -14, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end head

  // Enchanted Golden Apple Sceptre in Hand
  ctx.save();
  ctx.translate(14 + strike * 12, -4 + strike * 8);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(6, -14 - windup * 10 + strike * 16);
  ctx.stroke();

  // Golden Apple
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(6, -18 - windup * 10 + strike * 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // end bob
  ctx.restore(); // end root
}
