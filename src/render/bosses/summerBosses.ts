import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  drawFolkFlower2D,
  drawWaterDroplet2D,
  drawFoamingBeerMug2D,
  drawMusicNote2D,
  safeRoundRect,
} from './hospodaBossHelpers';

// ===========================================================================
// HOSPODSKÝ FIGURÁLNÍ KÁNON: DÁVKA 4 – LÉTO A ŽNĚ (Úrovně L6–L11)
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. KRÁLOVSKÝ VELE-RAK (KralovskyVeleRak, L6 Mini-boss)
// Archetyp: Komicky vzteklý říční vele-rak v rybářském kloboučku s klepety
// ---------------------------------------------------------------------------
export function drawHospodaKralovskyVeleRak(
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
    ctx.rotate(-0.08);
  }

  // 1. Riverbed Water Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Multiple Skittering Crayfish Legs
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 4; i++) {
    const lx = -12 + i * 8;
    const legWiggle = Math.sin(time * 12 + i * 1.5) * 4;
    ctx.beginPath();
    ctx.moveTo(lx, 6);
    ctx.lineTo(lx - 4, 14 + legWiggle * 0.4);
    ctx.lineTo(lx + 2, 20 + legWiggle * 0.3);
    ctx.stroke();
  }

  // 3. Segmented Crimson Carapace (Červený kvašový krunýř s články)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  // Segmented tail fan behind
  for (let seg = 3; seg >= 0; seg--) {
    const sy = 4 + seg * 4;
    const sw = 16 - seg * 2.5;
    ctx.beginPath();
    ctx.ellipse(-6, sy, sw, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Main carapace chest
  ctx.beginPath();
  ctx.ellipse(0, -2, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shell ridges
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -4, 11, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 4. Stalk Eyes with Whites, Black Pupils & Long Waving Whiskers
  for (const side of [-1, 1]) {
    const ex = side * 6;
    const ey = -14;
    // Eye stalk
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(side * 3, -10);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Eye bulb
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex + (s.isAttacking ? side * 0.8 : 0.4), ey, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.0, ey - 1.0, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Long feeling whiskers (antény)
    const whiskerWave = Math.sin(time * 6 + side) * 5;
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex, ey - 3);
    ctx.quadraticCurveTo(ex + side * 14, ey - 18 + whiskerWave, ex + side * 22, ey - 26 + whiskerWave);
    ctx.stroke();
  }

  // Small fisherman's straw hat perched between eyes
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -18, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -19, 5, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // Water lily bud in hat
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(-3, -20, 2, 0, Math.PI * 2);
  ctx.fill();

  // 5. Giant Powerful Claws (Mocná klepeta)
  const clawSnap = s.isStrike ? 0.35 : s.isWindup ? -0.2 : 0;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 18, -4);
    ctx.rotate(side * (0.3 + clawSnap));

    // Arm joint
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-side * 6, 6);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Big claw body
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -8, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pincer split
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, -20);
    ctx.stroke();

    // Sharp pincer teeth
    ctx.fillStyle = '#FEF08A';
    for (let t = -16; t <= -6; t += 3) {
      ctx.beginPath();
      ctx.arc(-1.5, t, 1.2, 0, Math.PI * 2);
      ctx.arc(1.5, t, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dripping river water from claws
    if (s.isAttacking) {
      drawWaterDroplet2D(ctx, 0, -22, 2.2, 1.0);
    }

    ctx.restore();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. ČERT SEKÁČ (CertSekac, L6 Mezi-boss)
// Archetyp: Zlomyslný pekelný čert v žňovém oblečení s nabroušenou kosou
// ---------------------------------------------------------------------------
export function drawHospodaCertSekac(
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
    ctx.rotate(0.09);
  }

  // 1. Sulfur Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(69, 10, 10, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Furry Goat Legs & Clattering Cloven Hooves (Kozlí nohy a kopýtka)
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  const legSwing = Math.sin(time * 9) * 4;
  for (const side of [-1, 1]) {
    const lx = side * 7 + (side === -1 ? legSwing : -legSwing);
    ctx.beginPath();
    ctx.moveTo(lx - 4, 8);
    ctx.lineTo(lx - 3, 20);
    ctx.lineTo(lx + 4, 20);
    ctx.lineTo(lx + 3, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cloven hoof
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.rect(lx - 4, 20, 8, 3.5);
    ctx.fill();
    ctx.stroke();
    // Hoof split
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx, 20); ctx.lineTo(lx, 23.5);
    ctx.stroke();
  }

  // Waving Devil's Tail with Arrow Tip (Čertovský ocas s vidlicí)
  const tailWave = Math.sin(time * 8) * 6;
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-6, 8);
  ctx.quadraticCurveTo(-16, 4 + tailWave, -22, 12 + tailWave);
  ctx.stroke();
  // Arrow spade on tail
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-22, 12 + tailWave);
  ctx.lineTo(-26, 8 + tailWave);
  ctx.lineTo(-28, 14 + tailWave);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Peasant Reaper Breeches & Suspenders (Záplatované žňové kalhoty)
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-10, 2, 20, 9);
  ctx.fill();
  ctx.stroke();

  // Bright red polka-dot neckerchief
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -6, 8.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Black Furry Imp Face with Goat Horns & Crooked Smirk
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curving Black Goat Horns (Špičaté čertovské růžky)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 5, -21);
    ctx.quadraticCurveTo(side * 10, -28, side * 12, -32);
    ctx.quadraticCurveTo(side * 6, -26, side * 2, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Furry tufted ears
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#3F3F46';
    ctx.beginPath();
    ctx.ellipse(side * 10, -14, 4, 2.5, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Glowing wicked yellow eyes
  for (const side of [-1, 1]) {
    const ex = side * 4.0;
    const ey = -15;
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.2, 2.8, -side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red slit pupil
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.rect(ex + (s.isAttacking ? side * 0.6 : 0) - 0.6, ey - 2.0, 1.2, 4.0);
    ctx.fill();

    // Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.0, ey - 1.0, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smirking mouth with fangs & pink tongue
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -9, 4.5, 0.2, Math.PI - 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White sharp fangs
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-3, -9); ctx.lineTo(-2, -6.5); ctx.lineTo(-1, -9);
  ctx.moveTo(1, -9); ctx.lineTo(2, -6.5); ctx.lineTo(3, -9);
  ctx.fill();

  // Pink tongue sticking out playfully
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.arc(0, -7.5, 2.0, 0, Math.PI);
  ctx.fill();

  // 5. Huge Razor-Sharp Scythe (Žňová kosa s kosištěm)
  const scytheSwing = s.isWindup ? -0.8 : s.isStrike ? 0.7 : 0.1;
  ctx.save();
  ctx.translate(12, 0);
  ctx.rotate(scytheSwing);

  // Ash-wood snaith (kosiště)
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(2, -28);
  ctx.stroke();

  // Handle grips
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.rect(-3, -2, 6, 3);
  ctx.rect(-3, 10, 6, 3);
  ctx.fill();

  // Gleaming curved steel scythe blade
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(2, -28);
  ctx.quadraticCurveTo(18, -34, 30, -32);
  ctx.quadraticCurveTo(16, -26, 2, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Blue steel glint edge
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(4, -27);
  ctx.quadraticCurveTo(18, -33, 28, -31.5);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. KRÁLOVSKÁ POLEDNICE (KralovskaPolednice, L6 Vele-boss)
// Archetyp: Furiantská a hrozivá letní vládkyně lánů v bílém rouchu se srpem
// ---------------------------------------------------------------------------
export function drawHospodaKralovskaPolednice(
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

  // 1. Shimmering Sun Heat Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(202, 138, 4, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flowing Ghostly White Summer Gown (Vlající bílé roucho s lidovým lemováním)
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  const robeWind = Math.sin(time * 8) * 5;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.quadraticCurveTo(16, 8, 20 + robeWind, 24);
  ctx.lineTo(-18 + robeWind, 24);
  ctx.quadraticCurveTo(-14, 8, -10, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden wheat embroidery along robe bottom
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-18 + robeWind, 21);
  ctx.lineTo(20 + robeWind, 21);
  ctx.stroke();

  for (let i = -14; i <= 14; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i + robeWind, 21);
    ctx.lineTo(i + 2 + robeWind, 16);
    ctx.stroke();
  }

  // 3. Billowing White Sun Scarf over Head (Velký bílý vlající šátek)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  const scarfFlap = Math.sin(time * 10) * 6;
  ctx.beginPath();
  ctx.moveTo(-12, -22);
  ctx.quadraticCurveTo(0, -32, 12, -22);
  ctx.quadraticCurveTo(24, -14 + scarfFlap, 26, -4 + scarfFlap);
  ctx.lineTo(14, -6 + scarfFlap);
  ctx.lineTo(8, -12);
  ctx.lineTo(-8, -12);
  ctx.lineTo(-14, -6 + scarfFlap);
  ctx.lineTo(-24, -14 + scarfFlap);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Fierce Solar Lady Face with Golden Eyes
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -16, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Severe arched golden eyebrows
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-7, -20); ctx.lineTo(-1, -17); ctx.lineTo(5, -20);
  ctx.stroke();

  // Piercing golden-amber solar eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.8;
    const ey = -16.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.0, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Solar golden iris
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(ex, ey, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.8, ey - 0.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Straight dignified nose & stern red lips
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -14, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-3, -11); ctx.lineTo(3, -11);
  ctx.stroke();

  // 5. Golden Sickle & Sheaf of Ripe Wheat with Cornflowers (Zlatý srp a snop)
  const sickleSwing = s.isStrike ? 0.6 : s.isWindup ? -0.5 : 0;
  ctx.save();
  ctx.translate(14, -6);
  ctx.rotate(sickleSwing);

  // Golden sickle (srp)
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -8, 10, Math.PI * 0.2, Math.PI * 1.3);
  ctx.lineTo(0, -18);
  ctx.stroke();

  // Wooden handle
  ctx.fillStyle = '#78350F';
  ctx.fillRect(-2, 0, 4, 8);
  ctx.strokeRect(-2, 0, 4, 8);
  ctx.restore();

  // Left arm holding wheat sheaf & red poppy
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.lineTo(-24, -14);
  ctx.stroke();

  drawFolkFlower2D(ctx, -24, -16, 3.5, '#EF4444', '#7F1D1D');

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. OHNIVÝ SUDLIČKA (OhnivySudlicka, L7 Mezi-boss)
// Archetyp: Zlomyslný bludný plamenný rytíř se sudlicí a plamennou helmou
// ---------------------------------------------------------------------------
export function drawHospodaOhnivySudlicka(
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
    ctx.rotate(-0.08);
  }

  // 1. Burning Charcoal Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(154, 52, 18, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Iron Greaves & Sabatons (Okované rytířské škorně)
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  const legMarch = Math.sin(time * 8) * 4;
  for (const side of [-1, 1]) {
    const lx = side * 7 + (side === -1 ? legMarch : -legMarch);
    ctx.beginPath();
    ctx.rect(lx - 4, 8, 8, 14);
    ctx.fill();
    ctx.stroke();
    // Iron knee guard
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(lx, 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Burning Iron Cuirass (Očazený kyrys s plameny v puklinách)
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, -2, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing embers through armor cracks
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, -4); ctx.lineTo(-2, 2); ctx.lineTo(4, -2);
  ctx.stroke();

  // 4. Burning Greathelm with Fire Crest (Hrnec helmy s plamenem místo chocholu)
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-8, -24, 16, 16);
  ctx.fill();
  ctx.stroke();

  // Slitted visor with burning red eyes
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-7, -18, 14, 4);

  // Burning fire eyes in slit
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(-3, -16, 1.8, 0, Math.PI * 2);
  ctx.arc(3, -16, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-3, -16, 0.9, 0, Math.PI * 2);
  ctx.arc(3, -16, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Blazing Blue-Orange Fire Plume on Helmet
  const flameWobble = Math.sin(time * 12) * 3;
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-4, -24);
  ctx.quadraticCurveTo(-8 + flameWobble, -34, 0 + flameWobble, -38);
  ctx.quadraticCurveTo(8 + flameWobble, -34, 4, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(0 + flameWobble, -32, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Heavy Polearm / Sudlice (Dlouhá kovaná sudlice)
  const weaponThrust = s.isStrike ? 14 : s.isWindup ? -8 : 0;
  ctx.save();
  ctx.translate(12, -2 + weaponThrust);

  // Ash-wood shaft
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.lineTo(2, -32);
  ctx.stroke();

  // Iron spearhead with side cleaver hook (sudlice)
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(2, -32);
  ctx.lineTo(4, -46);
  ctx.lineTo(0, -46);
  ctx.lineTo(-2, -32);
  ctx.lineTo(-8, -36); // hook
  ctx.lineTo(-6, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. SVATOJÁNSKÝ VLÁDCE HVOZDU (SvatojanskyVladce, L7 Vele-boss)
// Archetyp: Rozšafný a vznešený lesní král se zlatým kapradím a zvonečky
// ---------------------------------------------------------------------------
export function drawHospodaSvatojanskyVladce(
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

  // 1. Forest Moss Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Oak-Bark Robes & Root Boots
  ctx.fillStyle = '#14532D'; // Deep evergreen robe
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.lineTo(12, -6);
  ctx.lineTo(16, 22);
  ctx.lineTo(-16, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gilded oak leaf embroidery along mantle
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.0;
  for (const bx of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.arc(bx, 19, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Majestic Stag Antlers with Golden Bells (Jelení paroží se zvonky)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 6, -20);
    ctx.quadraticCurveTo(side * 14, -28, side * 18, -36);
    ctx.stroke();
    // Prongs
    ctx.beginPath();
    ctx.moveTo(side * 12, -26); ctx.lineTo(side * 8, -34);
    ctx.moveTo(side * 15, -31); ctx.lineTo(side * 22, -35);
    ctx.stroke();

    // Little golden bells hanging from antler tips
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(side * 18, -36, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Noble Forest King Face with Lichen Beard
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grand Sage Beard of Lichen and Moss
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(8, -10);
  ctx.quadraticCurveTo(12, 8, 0, 18);
  ctx.quadraticCurveTo(-12, 8, -8, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kind wise eyes with green irises
  for (const side of [-1, 1]) {
    const ex = side * 4.0;
    const ey = -15;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ex, ey, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.6, ey - 0.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Staff with Glowing Golden St. John's Fern (Zlaté kapradí)
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(16, 22);
  ctx.lineTo(18, -26);
  ctx.stroke();

  // Brilliant golden fern blossom on staff top
  drawFolkFlower2D(ctx, 18, -28, 5.5, '#F59E0B', '#FEF08A');

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. KRÁL POLNÍCH KŘEČKŮ OBILNÍK (KrecekObilnik, L8 Mini-boss)
// Archetyp: Rozšafný a furiantský tlustý křeček s nadmutými tvářemi v korunce
// ---------------------------------------------------------------------------
export function drawHospodaKrecekObilnik(
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

  // 1. Meadow Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(30, 41, 59, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Plump Hamster Body with Striped Fur & White Belly (Tlusté tělo)
  ctx.fillStyle = '#B45309'; // Rich hamster ochre
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 4, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White chest & belly patch
  ctx.fillStyle = '#FAF7EE';
  ctx.beginPath();
  ctx.ellipse(0, 6, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Little black paws in buckled moccasins
  for (const side of [-1, 1]) {
    const px = side * 8;
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(px, 18, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Gigantic Puffed Hamster Cheeks Full of Grain! (Obří nadmuté tváře)
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  const puff = s.isAttacking ? 2.5 : 0;
  ctx.beginPath();
  ctx.arc(-8 - puff, -4, 9 + puff, 0, Math.PI * 2);
  ctx.arc(8 + puff, -4, 9 + puff, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Center head
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy blush on the gigantic cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.beginPath();
  ctx.arc(-8 - puff, -4, 4, 0, Math.PI * 2);
  ctx.arc(8 + puff, -4, 4, 0, Math.PI * 2);
  ctx.fill();

  // Rounded little ears with pink inside
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#FBCFE8';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(side * 8, -19, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Little Golden Straw Crown on Top (Slámová korunka)
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-5, -18);
  ctx.lineTo(-6, -24);
  ctx.lineTo(-2, -21);
  ctx.lineTo(0, -26);
  ctx.lineTo(2, -21);
  ctx.lineTo(6, -24);
  ctx.lineTo(5, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inquisitive beady black eyes with white glints
  for (const side of [-1, 1]) {
    const ex = side * 4.0;
    const ey = -12;
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.8, ey - 0.8, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snout with twitching whiskers
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.arc(0, -7.5, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 2, -7.5); ctx.lineTo(side * 14, -8.5);
    ctx.moveTo(side * 2, -6.5); ctx.lineTo(side * 13, -5.0);
    ctx.stroke();
  }

  // 4. Wheat Sheaf held in front paws (Otýpka pšeničných klasů)
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(4, -8);
  ctx.stroke();

  // Wheat grains
  for (let g = 0; g < 4; g++) {
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(4 + (g % 2 === 0 ? -2 : 2), -10 - g * 3, 2, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. ŽITNÁ MATKA (ZitnaMatka, L8 Mezi-boss)
// Archetyp: Rozšafná a bodrá kyprá hospodyně polí se zlatým srpem a chlebem
// ---------------------------------------------------------------------------
export function drawHospodaZitnaMatka(
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

  // 1. Golden Field Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(161, 98, 7, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Peasant Skirt & Flowered Apron (Lidová sukně a zástěra)
  ctx.fillStyle = '#EAB308'; // Ripe rye yellow
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-11, -4);
  ctx.lineTo(11, -4);
  ctx.lineTo(15, 20);
  ctx.lineTo(-15, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Embroidered blue cornflower apron
  ctx.fillStyle = '#FAF7EE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-8, -2, 16, 21);
  ctx.fill();
  ctx.stroke();

  drawFolkFlower2D(ctx, -3, 6, 3, '#2563EB', '#EFF6FF');
  drawFolkFlower2D(ctx, 3, 14, 3, '#2563EB', '#EFF6FF');

  // 3. Motherly Plump Face with Red Kerchief & Freckles
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red polka-dot kerchief tied under chin
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -14, 11, Math.PI * 0.8, Math.PI * 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cheerful motherly rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5, -10, 2.8, 0, Math.PI * 2);
  ctx.arc(5, -10, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Warm blue eyes with crinkles
  for (const side of [-1, 1]) {
    const ex = side * 3.8;
    const ey = -14;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.6, ey - 0.6, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wide loving smile with white teeth
  ctx.fillStyle = '#881337';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -8, 4.0, 0.1, Math.PI - 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Golden Sickle in right hand, Fresh Rye Bread Loaf in left hand
  // Left hand: Loaf of peasant bread (Pecen chleba s bílým křížkem)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-14, 2, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White flour dusting / cross on bread
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-16, 2); ctx.lineTo(-12, 2);
  ctx.moveTo(-14, 0); ctx.lineTo(-14, 4);
  ctx.stroke();

  // Right hand: Golden sickle (Zlatý srp)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(14, 0, 8, Math.PI * 0.3, Math.PI * 1.4);
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. POUŤOVÝ HROMOTLUK MARKÉTA (HromotlukMarketa, L8 Vele-boss)
// Archetyp: Komicky vzteklý pouťový silák v pruhovaném trikotu s obří činkou
// ---------------------------------------------------------------------------
export function drawHospodaHromotlukMarketa(
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

  // 1. Heavy Strongman Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Massive Striped Trikot (Červeno-bílý pruhovaný trikot)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White stripes
  ctx.fillStyle = '#FFFFFF';
  for (const sy of [-8, -2, 4, 10]) {
    ctx.beginPath();
    ctx.rect(-16, sy, 32, 3);
    ctx.fill();
  }

  // Thick strongman weightlifting belt with brass buckle
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-16, 6, 32, 6);
  ctx.fill();
  ctx.stroke();

  // Brass medal from St. Margaret Fair
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, 9, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Short thick legs in black wrestling boots
  for (const side of [-1, 1]) {
    const lx = side * 8;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.rect(lx - 4, 14, 8, 9);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Huge Bald Head with Curling Black Moustache
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -14, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mighty curling black moustache (Kroucený silácký knír)
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.quadraticCurveTo(-8, -10, -15, -14);
  ctx.quadraticCurveTo(-8, -8, 0, -9);
  ctx.quadraticCurveTo(8, -8, 15, -14);
  ctx.quadraticCurveTo(8, -10, 0, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fierce eyes under thick unibrow
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-8, -18); ctx.lineTo(0, -16); ctx.lineTo(8, -18);
  ctx.stroke();

  for (const side of [-1, 1]) {
    const ex = side * 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, -15, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex, -15, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Giant 500-lb Iron Barbell held Overhead (Obří litinová činka)
  const barbellLift = s.isWindup ? -14 : s.isStrike ? 10 : 0;
  ctx.save();
  ctx.translate(0, -26 + barbellLift);

  // Steel bar
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-32, 0); ctx.lineTo(32, 0);
  ctx.stroke();

  // Heavy spherical iron globes on ends ("500 kg")
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-32, 0, 10, 0, Math.PI * 2);
  ctx.arc(32, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Specular glint on iron
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.arc(-34, -3, 3, 0, Math.PI * 2);
  ctx.arc(30, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. BÍLÁ PANÍ (BilaPani, L9 Mini-boss)
// Archetyp: Rozšafná i potměšilá hradní paní v henninu s klíči
// ---------------------------------------------------------------------------
export function drawHospodaBilaPani(
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
    ctx.rotate(0.08);
  }

  // 1. Ghostly Night Glow Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(147, 197, 253, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flowing White Damask Gown (Vznášející se bílá sukně)
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  const floatWave = Math.sin(time * 7) * 4;
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.lineTo(9, -4);
  ctx.quadraticCurveTo(14, 8, 16 + floatWave, 22);
  ctx.lineTo(-16 + floatWave, 22);
  ctx.quadraticCurveTo(-14, 8, -9, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Tall Medieval Hennin Hat with Long Flowing Veil (Vysoký kuželovitý klobouk se závojem)
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-6, -20);
  ctx.lineTo(6, -20);
  ctx.lineTo(1, -38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Flowing translucent veil fluttering from hennin tip
  const veilWave = Math.sin(time * 9) * 5;
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(1, -38);
  ctx.quadraticCurveTo(-16, -30 + veilWave, -24, -10 + veilWave);
  ctx.stroke();

  // 4. Pale Noble Face with Delicate Cheeks & Mystical Eyes
  ctx.fillStyle = '#FFF1F2';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -14, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gentle blush
  ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
  ctx.beginPath();
  ctx.arc(-4, -12, 2.2, 0, Math.PI * 2);
  ctx.arc(4, -12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Shrewd eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    const ey = -15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Bunch of Ancient Castle Keys on Ring in Hand (Svazek hradních klíčů)
  const keyJingle = Math.sin(time * 11) * 3;
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(12, 2, 4, 0, Math.PI * 2); // ring
  ctx.stroke();

  // Dangling keys
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(12 + k * 2, 6);
    ctx.lineTo(12 + k * 2, 14 + keyJingle * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. KRÁLOVSKÝ ČMELÁK (KralovskyCmelak, L10 Mini-boss)
// Archetyp: Rozšafný huňatý čmelák v sametové vestičce s pylem
// ---------------------------------------------------------------------------
export function drawHospodaKralovskyCmelak(
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

  // 1. Aerial Buzzing Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. High-Speed Whirring Wings (Kmitající křídla)
  const wingPhase = Math.sin(time * 26) * 8;
  ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 8, -14 + wingPhase * side, 12, 6, side * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Shaggy Striped Fur Body (Huňaté žluto-černé tělo čmeláka)
  ctx.fillStyle = '#1C1917'; // Black fur
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Broad yellow fuzzy bands
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.rect(-15, -6, 30, 5);
  ctx.rect(-14, 4, 28, 4);
  ctx.fill();

  // White tail puff
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-14, 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Cheerful Face with Feathery Antennae
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(8, -8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big cute cartoon eyes with whites & catchlight
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(10, -9, 3.5, 4.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(11, -9, 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(11.8, -10.2, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Feathery antennae
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(8, -15);
  ctx.quadraticCurveTo(12, -22, 16, -24);
  ctx.stroke();

  // Wicker basket with pollen in front legs
  ctx.fillStyle = '#FBBF24'; // Golden pollen
  ctx.beginPath();
  ctx.arc(8, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 11. ZLATOHLÁVEK ŽROUT (ZlatohlavekZrout, L10 Mezi-boss)
// Archetyp: Potměšilý smaragdově zelený brouk v sadařské zástěře s hruškou
// ---------------------------------------------------------------------------
export function drawHospodaZlatohlavekZrout(
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

  // 1. Garden Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Emerald Green Metallic Wing Elytra (Smaragdový krunýř)
  ctx.fillStyle = '#059669'; // Emerald gouache
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden metallic wing suture
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -14); ctx.lineTo(0, 14);
  ctx.stroke();

  // 3. Orchard Keeper's Patched Leather Apron
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-8, 2, 16, 12);
  ctx.fill();
  ctx.stroke();

  // 4. Shrewd Beetle Head with Clubbed Antennae
  ctx.fillStyle = '#047857';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big shiny black beetle eyes
  for (const side of [-1, 1]) {
    const ex = side * 4;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex, -15, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.0, -16, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Antenna with fan club
    ctx.strokeStyle = '#065F46';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex, -18); ctx.lineTo(side * 8, -26);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(side * 8, -26, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Half-Eaten Juicy Pear in Hand (Nakousnutá sladká hruška)
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(14, 4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pear bite mark
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(16, 3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 12. DOŽÍNKOVÝ CHASNÍK (DozinkovyChasnik, L10 Vele-boss)
// Archetyp: Furiantský a bodrý vůdce dožínek s pleteným věncem a korbelem
// ---------------------------------------------------------------------------
export function drawHospodaDozinkovyChasnik(
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

  // 1. Feast Ground Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Folk Peasant Trousers & Polished Black Riding Boots
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1]) {
    const lx = side * 7;
    ctx.beginPath();
    ctx.rect(lx - 4, 10, 8, 14);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Embroidered Festive Shirt & Vest (Slavnostní vyšívaná košile a vesta)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue embroidered vest
  ctx.fillStyle = '#1D4ED8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.lineTo(13, 8);
  ctx.lineTo(-13, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red neck ribbons
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -6, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Handsome Joyful Face & Felt Hat with Rowan Berries
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5, -12, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -12, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Wide singing smile with white teeth
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.arc(0, -9, 4.0, 0.2, Math.PI - 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -8.5, 2.5, 0.2, Math.PI - 0.2);
  ctx.fill();

  // Felt hat with red rowan berries and wheat stalk
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -20, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -21, 8, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // Rowan berries (jeřabiny)
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(5, -22, 1.8, 0, Math.PI * 2);
  ctx.arc(8, -21, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // 5. Giant Woven Harvest Wreath on Shoulders (Obří dožínkový věnec)
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -24, 18, Math.PI * 0.7, Math.PI * 2.3);
  ctx.stroke();

  // Colorful ribbons hanging from wreath
  for (let r = 0; r < 4; r++) {
    const rx = -12 + r * 8;
    ctx.strokeStyle = r % 2 === 0 ? '#DC2626' : '#2563EB';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(rx, -10);
    ctx.quadraticCurveTo(rx + 4, 4, rx, 18);
    ctx.stroke();
  }

  // 6. Foaming Beer Mug in Hand (Pěnící korbel piva)
  drawFoamingBeerMug2D(ctx, 16, 2, 1.1, time);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 13. NETOPÝR UŠATEC (NetopyrUsatec, L11 Mini-boss)
// Archetyp: Zlomyslný a šibalský noční letec s obříma ušima a vampýřím šátkem
// ---------------------------------------------------------------------------
export function drawHospodaNetopyrUsatec(
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

  // 1. Midnight Air Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Leather Wing Flaps (Kožovitá netopýří křídla)
  const wingFlap = Math.sin(time * 14) * 12;
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 6, -2);
    ctx.quadraticCurveTo(side * 20, -18 + wingFlap, side * 30, -4 + wingFlap);
    ctx.lineTo(side * 24, 8 + wingFlap);
    ctx.lineTo(side * 14, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wing finger struts
    ctx.beginPath();
    ctx.moveTo(side * 6, -2);
    ctx.lineTo(side * 24, 8 + wingFlap);
    ctx.stroke();
  }

  // 3. Furry Brown Body & Red Ribbon Tie
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red velvet neck ribbon
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -6, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Giant Funnel Ears with Pink Insides (Obrovské uši)
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(side * 3, -16);
    ctx.quadraticCurveTo(side * 14, -34, side * 10, -36);
    ctx.quadraticCurveTo(side * 2, -26, 0, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pink ear inner
    ctx.fillStyle = '#FBCFE8';
    ctx.beginPath();
    ctx.moveTo(side * 4, -18);
    ctx.quadraticCurveTo(side * 12, -32, side * 9, -34);
    ctx.quadraticCurveTo(side * 3, -25, side * 2, -18);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Inquisitive Face with Sharp White Fangs
  ctx.fillStyle = '#573016';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -12, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big curious cartoon eyes with glints
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    const ey = -14;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex + 0.4, ey, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.9, ey - 0.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Little pug nose & two sharp fangs
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.arc(0, -9, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Two white vampire teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-2.5, -7, 1.5, 2.5);
  ctx.fillRect(1.0, -7, 1.5, 2.5);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 14. NOČNÍ MŮRA (NocniMura, L11 Mezi-boss)
// Archetyp: Potměšilý a tajuplný noční hmyzí duch se sametovými křídly
// ---------------------------------------------------------------------------
export function drawHospodaNocniMura(
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

  // 1. Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(46, 16, 101, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Broad Moth Wings with "Peacock Eye" Spots (Křídla s pavími oky)
  const wingSlow = Math.sin(time * 6) * 6;
  ctx.fillStyle = '#4A044E'; // Deep purple-black velvet
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(side * 18, -26 + wingSlow, side * 32, -12 + wingSlow);
    ctx.quadraticCurveTo(side * 28, 12, 0, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye spots on wings to frighten predators
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(side * 18, -6 + wingSlow * 0.5, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(side * 18, -6 + wingSlow * 0.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Furry Moth Torso with Feathered Antennae
  ctx.fillStyle = '#2E1065';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Feathery antennae (Hřebínková tykadla)
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#D8B4FE';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(side * 3, -14);
    ctx.lineTo(side * 14, -28);
    ctx.stroke();
  }

  // Glowing mystical yellow eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(ex, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 15. VÝR VELKÝ (VyrVelky, L11 Vele-boss)
// Archetyp: Furiantský a moudrý král noci s peřovými oušky a drápy
// ---------------------------------------------------------------------------
export function drawHospodaVyrVelky(
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
  const scale = 2.7;

  ctx.save();
  ctx.translate(x, y - s.bob);
  ctx.scale(s.dir * scale, scale);

  if (s.isPanicked) {
    ctx.rotate(0.08);
  }

  // 1. Forest Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Powerful Feathered Claws gripping Oak Branch
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  // Oak branch
  ctx.beginPath();
  ctx.moveTo(-22, 20); ctx.lineTo(22, 20);
  ctx.stroke();

  // Sharp talon claws
  ctx.fillStyle = '#0F172A';
  for (const side of [-1, 1]) {
    const cx = side * 8;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(cx + c * 3, 20, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Massive Plump Brown Owl Body with Mottled Plumage (Kropenaté bříško)
  ctx.fillStyle = '#451A03';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ochre chest with mottled V-feather markings
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(0, 5, 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.6;
  for (const [vx, vy] of [[-6, 0], [0, 2], [6, 0], [-4, 8], [4, 8]]) {
    ctx.beginPath();
    ctx.moveTo(vx - 2.5, vy - 2); ctx.lineTo(vx, vy + 2); ctx.lineTo(vx + 2.5, vy - 2);
    ctx.stroke();
  }

  // Wings folded on sides with flapping secondary motion
  const wingLift = Math.sin(time * 8) * (s.isAttacking ? 12 : 4);
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#291104';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(side * 14, -6);
    ctx.quadraticCurveTo(side * 26, 4 + wingLift, side * 18, 18 + wingLift);
    ctx.lineTo(side * 10, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 4. Large Owl Head with Feathery Ear Tufts (Péřová ouška)
  ctx.fillStyle = '#573016';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Feathery ear tufts
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#291104';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(side * 6, -22);
    ctx.lineTo(side * 14, -34);
    ctx.lineTo(side * 11, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 5. Giant Glowing Orange Eyes with Black Pupils & Sharp Beak
  for (const side of [-1, 1]) {
    const ex = side * 5.5;
    const ey = -12;
    // Eye ring
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex, ey, 5.0, 0, Math.PI * 2);
    ctx.fill();

    // Brilliant orange-amber iris
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(ex, ey, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Black pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(ex + (s.isAttacking ? side * 0.6 : 0), ey, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // White specular glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 1.2, ey - 1.2, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sharp hooked predatory beak
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(2.5, -4);
  ctx.lineTo(0, -1);
  ctx.lineTo(-2.5, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
