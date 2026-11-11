import type { EnemyAttackInfo } from '../../types';
import {
  HOSPODA_INK,
  resolveBossState,
  drawFolkFlower2D,
  drawWaterDroplet2D,
  drawHopCone2D,
  drawFuriantSteamPuffs,
  drawFlatGouacheSmokeLobe,
  drawMusicNote2D,
  safeRoundRect,
} from './hospodaBossHelpers';

// ===========================================================================
// HOSPODSKÝ FIGURÁLNÍ KÁNON: DÁVKA 5 – PODZIM A DUŠIČKY (Úrovně L12–L17)
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. KRÁLOVSKÝ SRŠEŇ (KralovskySrsen, L12 Mini-boss)
// Archetyp: Komicky vzteklý žluto-hnědý sadařský sršeň s žihadlem a švestkami
// ---------------------------------------------------------------------------
export function drawHospodaKralovskySrsen(
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
    ctx.rotate(-0.08);
  }

  // 1. Aerial Buzzing Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. High-Frequency Whirring Wings (Kmitající křídla)
  const wingWhir = Math.sin(time * 28) * 10;
  ctx.fillStyle = 'rgba(254, 243, 199, 0.65)';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.4;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * 8, -14 + wingWhir * side, 14, 5.5, side * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Striped Hornet Abdomen with Sharp Stinger (Pruhovaný zadeček s žihadlem)
  ctx.fillStyle = '#78350F'; // Burnt hornet brown
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-6, 2, 14, 11, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow warning stripes
  ctx.fillStyle = '#FBBF24';
  for (const sx of [-14, -8, -2]) {
    ctx.beginPath();
    ctx.rect(sx, -6, 4, 16);
    ctx.fill();
  }

  // Curved sharp black stinger (Ostré žihadlo)
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-18, 2);
  ctx.quadraticCurveTo(-26, 4, -28, 8);
  ctx.quadraticCurveTo(-22, 6, -18, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Velvet Vest & Hornet Head with Bulbous Eyes
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(8, -8, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big angry hornet eyes with white glints
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(10, -9, 3.8, 4.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(11.2, -10.5, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Jointed antennae
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(8, -16);
  ctx.lineTo(12, -22);
  ctx.lineTo(18, -20);
  ctx.stroke();

  // Basket of ripe blue plums in front paws (Košík švestek)
  ctx.fillStyle = '#1E1B4B'; // Dark blue plums
  for (let p = 0; p < 3; p++) {
    ctx.beginPath();
    ctx.arc(8 + p * 3, 6 + (p % 2) * 2, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. POSVÍCENSKÝ HOSPODÁŘ (PosvicenskyHospodar, L12 Vele-boss)
// Archetyp: Rozšafný a bodrý buclatý hospodář v modrém kabátku s pekáčem buchet
// ---------------------------------------------------------------------------
export function drawHospodaPosvicenskyHospodar(
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

  // 2. Plump Belly in Royal Blue Sunday Coat (Modrý sváteční kabát)
  ctx.fillStyle = '#1D4ED8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Brass buttons
  ctx.fillStyle = '#F59E0B';
  for (const by of [-4, 0, 4, 8]) {
    ctx.beginPath();
    ctx.arc(-2, by, 1.4, 0, Math.PI * 2);
    ctx.arc(2, by, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red piping on collar
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-10, -8); ctx.lineTo(0, -2); ctx.lineTo(10, -8);
  ctx.stroke();

  // Polished black boots
  ctx.fillStyle = '#0F172A';
  for (const side of [-1, 1]) {
    const lx = side * 8;
    ctx.beginPath();
    ctx.rect(lx - 4, 12, 8, 12);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Cheerful Jolly Face with Rosy Cheeks & Grey Moustache
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.beginPath();
  ctx.arc(-5, -12, 2.8, 0, Math.PI * 2);
  ctx.arc(5, -12, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Thick grey/brown moustache
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(-8, -9, -13, -12);
  ctx.quadraticCurveTo(-7, -7, 0, -8.5);
  ctx.quadraticCurveTo(7, -7, 13, -12);
  ctx.quadraticCurveTo(8, -9, 0, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Blue eyes with crow's feet
  for (const side of [-1, 1]) {
    const ex = side * 3.8;
    const ey = -15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(ex, ey, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.6, ey - 0.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sunday felt hat with peacock feather
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -22, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -23, 8, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // 4. Giant Baking Pan Full of Golden Buns (Černý pekáč s buchtami)
  ctx.save();
  ctx.translate(0, 4);

  // Black cast-iron pan
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-16, -2, 32, 12);
  ctx.fill();
  ctx.stroke();

  // Golden baked buchty with white powdered sugar
  for (let bx = -12; bx <= 12; bx += 8) {
    ctx.fillStyle = '#F59E0B'; // Golden crust
    ctx.beginPath();
    ctx.ellipse(bx, 2, 3.5, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();
    // Powdered sugar dusting
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bx, 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 3. SVATOVÁCLAVSKÝ STRÁŽCE (SvatovaclavskyStrazce, L13 Mini-boss)
// Archetyp: Furiantský rytířský strážce v kroužkové zbroji se štítem a kopím
// ---------------------------------------------------------------------------
export function drawHospodaSvatovaclavskyStrazce(
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
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Chainmail Hauberk & Crimson Tunic with St. Wenceslas Eagle
  ctx.fillStyle = '#94A3B8'; // Chainmail
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-10, -6, 20, 22);
  ctx.fill();
  ctx.stroke();

  // Red surcoat
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.rect(-8, -4, 16, 18);
  ctx.fill();
  ctx.stroke();

  // White Eagle motif on tunic
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -1); ctx.lineTo(-4, 4); ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();

  // Iron greaves
  ctx.fillStyle = '#64748B';
  for (const side of [-1, 1]) {
    ctx.fillRect(side * 7 - 3, 16, 6, 8);
  }

  // 3. St. Wenceslas Conical Helmet with Nasal Guard (Přilba s nánosníkem)
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9, -16);
  ctx.lineTo(9, -16);
  ctx.lineTo(0, -32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nasal guard
  ctx.fillStyle = '#64748B';
  ctx.fillRect(-1.5, -16, 3, 8);

  // Stern vigilant eyes under helmet
  for (const side of [-1, 1]) {
    const ex = side * 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, -12, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex, -12, 1.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Spear with Flapping Pennon (Kopí s korouhví)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(14, 20); ctx.lineTo(14, -32);
  ctx.stroke();

  // Steel spearhead
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(14, -42); ctx.lineTo(17, -32); ctx.lineTo(11, -32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red and white pennon
  const pennonWave = Math.sin(time * 8) * 3;
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(14, -30);
  ctx.lineTo(26, -26 + pennonWave);
  ctx.lineTo(14, -22);
  ctx.closePath();
  ctx.fill();

  // 5. Kite Shield with Eagle on left arm
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(-20, -8);
  ctx.lineTo(-15, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. CHMELOVÝ SKŘÍTEK (ChmelovySkritek, L13 Mezi-boss)
// Archetyp: Rozšafný a potměšilý žatecký skřítek ze zelených chmelových šištic
// ---------------------------------------------------------------------------
export function drawHospodaChmelovySkritek(
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

  // 1. Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(21, 52, 38, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 18, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Plump Hop-Cone Body (Tělo z chmelových šupin)
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hop cone scales (šupiny chmele)
  drawHopCone2D(ctx, 0, 0, 1.1);

  // Tiny bare green legs
  ctx.fillStyle = '#4ADE80';
  for (const side of [-1, 1]) {
    const lx = side * 6;
    ctx.beginPath();
    ctx.rect(lx - 2, 10, 4, 8);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Cheerful Face with Hop-Cone Hat (Klobouk z chmelové šištice)
  ctx.fillStyle = '#86EFAC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -12, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big hop hat on head
  drawHopCone2D(ctx, 0, -22, 1.0);

  // Mischievous eyes & rosy cheeks
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex, -13, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.arc(ex, -13, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clay pipe puffing hop-scented smoke
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(3, -9); ctx.lineTo(9, -7); ctx.lineTo(11, -11);
  ctx.stroke();
  drawFlatGouacheSmokeLobe(ctx, 12, -14, 3);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. KVÍLÍCÍ MELUZÍNA (KviliciMeluzina, L13 Vele-boss)
// Archetyp: Potměšilá a vzteklá větrná babice v roztrhaných závojích
// ---------------------------------------------------------------------------
export function drawHospodaKviliciMeluzina(
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
    ctx.rotate(0.12);
  }

  // 1. Swirling Wind Vortex Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(100, 116, 139, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Tattered Grey Autumn Storm Rags (Potrhané větrné šaty)
  const gale = Math.sin(time * 12) * 8;
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.quadraticCurveTo(18, 4, 22 + gale, 24);
  ctx.lineTo(8 + gale, 20);
  ctx.lineTo(0 + gale, 24);
  ctx.lineTo(-8 + gale, 18);
  ctx.lineTo(-16 + gale, 24);
  ctx.quadraticCurveTo(-14, 4, -10, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Swirling autumn leaves in her gale
  const leafColors = ['#EA580C', '#EAB308', '#B45309'];
  for (let l = 0; l < 4; l++) {
    const lx = -18 + l * 10 + Math.sin(time * 8 + l) * 6;
    const ly = 12 + Math.cos(time * 8 + l) * 6;
    ctx.fillStyle = leafColors[l % 3];
    ctx.beginPath();
    ctx.ellipse(lx, ly, 3, 1.8, time * 4 + l, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Shrewd Wind Witch Head with Disheveled Streaming Hair
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Streaming grey wind-blown hair
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 3, -18);
    ctx.quadraticCurveTo(-16 + i * 4, -28 + gale * 0.4, -26 + i * 4, -22 + gale * 0.5);
    ctx.stroke();
  }

  // Hooked nose & howling open mouth ("Húúúú!")
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(2, -9, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Whistling wind puffs from mouth
  drawFuriantSteamPuffs(ctx, 8, -9, time, 1);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. KRÁLOVSKÝ HAVRAN ZE STRNIŠTĚ (KralovskyHavran, L14 Mini-boss)
// Archetyp: Moudrý a furiantský havran v korunce s lesklým černomodrým peřím
// ---------------------------------------------------------------------------
export function drawHospodaKralovskyHavran(
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
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Powerful Claws & Raven Legs
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  for (const side of [-1, 1]) {
    const lx = side * 7;
    ctx.beginPath();
    ctx.rect(lx - 2.5, 10, 5, 11);
    ctx.fill();
    ctx.stroke();
    // Claws
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(lx + c * 2, 21);
      ctx.lineTo(lx + c * 3 + 2, 24);
      ctx.stroke();
    }
  }

  // 3. Shaggy Black-Blue Raven Plumage Body & Wings
  ctx.fillStyle = '#1E1B4B'; // Deep midnight blue-black
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red knitted scarf
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -6, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Raven Head with Crown & Massive Beak with Gold Coin
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden Stubble-King Crown on head
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, -21);
  ctx.lineTo(-7, -27);
  ctx.lineTo(-2, -24);
  ctx.lineTo(0, -29);
  ctx.lineTo(2, -24);
  ctx.lineTo(7, -27);
  ctx.lineTo(6, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Piercing eye with white sclera
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(3, -15, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(3.5, -15, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(3.8, -15, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Massive black beak holding golden ducat
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(6, -16);
  ctx.quadraticCurveTo(18, -15, 24, -12);
  ctx.lineTo(6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shiny gold coin in beak
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(16, -12, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. PODZIMNÍ HASTRMAN (HastrmanPodzimni, L14 Mezi-boss)
// Archetyp: Rozšafný vodník v rákosovém kabátku se zlatou fajfkou
// ---------------------------------------------------------------------------
export function drawHospodaHastrmanPodzimni(
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
    ctx.rotate(-0.08);
  }

  // 1. Autumn Reed Pond Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(41, 37, 36, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Reed-Brown Frock Coat with Red Trimming & Dripping Coattails
  ctx.fillStyle = '#78350F'; // Autumn dry reed brown
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.lineTo(10, -4);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Flapping coattails with water drips
  const tailFlap = Math.sin(time * 10) * 3;
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(-9, 10);
  ctx.quadraticCurveTo(-14, 16 + tailFlap, -16, 22 + tailFlap);
  ctx.lineTo(-11, 23 + tailFlap);
  ctx.lineTo(-7, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawWaterDroplet2D(ctx, -14, 25 + tailFlap, 2.2, 1.0);

  // 3. Green Frog Face with Hat of Autumn Leaves & Reed Pipe
  ctx.fillStyle = '#22C55E';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -12, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Brown felt top hat with dry reed stalk
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.ellipse(0, -18, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.rect(-6, -26, 12, 8);
  ctx.fill();
  ctx.stroke();

  // Golden pipe with smoke puffs
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(3, -9); ctx.lineTo(12, -7); ctx.lineTo(14, -12);
  ctx.stroke();

  drawFlatGouacheSmokeLobe(ctx, 15, -16, 3.5);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. HRUSICKÝ DRAK VĚTRNÍK (DrakVetrnik, L14 Vele-boss)
// Archetyp: Rozšafný hrusický papírový drak se šindeli, mašlemi a obličejem
// ---------------------------------------------------------------------------
export function drawHospodaDrakVetrnik(
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
    ctx.rotate(0.12);
  }

  // 1. Diamond Paper Kite Body (Kosočtvercový drak)
  ctx.fillStyle = '#EF4444'; // Bright red paper
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, -26); // Top
  ctx.lineTo(20, 0);   // Right
  ctx.lineTo(0, 22);   // Bottom
  ctx.lineTo(-20, 0);  // Left
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow triangular segments
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(20, 0); ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 22); ctx.lineTo(-20, 0); ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Crossed wooden struts
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -26); ctx.lineTo(0, 22);
  ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
  ctx.stroke();

  // 2. Playful Ladovské Devilish Kite Face
  // Big painted googly eyes
  for (const side of [-1, 1]) {
    const ex = side * 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ex, -8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(ex + 1, -8, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Giant zigzag painted dragon grin
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.lineTo(-6, 12); ctx.lineTo(-2, 6); ctx.lineTo(2, 12); ctx.lineTo(6, 6); ctx.lineTo(10, 12);
  ctx.stroke();

  // 3. Waving Tail with Colorful Crepe Paper Bows (Ocas s krepovými mašlemi)
  const tailWave = Math.sin(time * 8) * 8;
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.quadraticCurveTo(tailWave * 1.5, 34, -tailWave, 46);
  ctx.stroke();

  const bowColors = ['#3B82F6', '#22C55E', '#EC4899', '#F97316'];
  for (let b = 0; b < 4; b++) {
    const by = 26 + b * 6;
    const bx = Math.sin(time * 8 + b) * 6;
    ctx.fillStyle = bowColors[b];
    ctx.beginPath();
    ctx.ellipse(bx - 3, by, 3, 2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(bx + 3, by, 3, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. DUŠIČKOVÁ BLUDIČKA (DusickovaBludicka, L15 Mini-boss)
// Archetyp: Potměšilá noční hřbitovní bludička s červenou lucerničkou
// ---------------------------------------------------------------------------
export function drawHospodaDusickovaBludicka(
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

  // 1. Ghostly Blue Mist Shroud
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Flowing Ethereal Robes (Přízračné mlžné roucho)
  const drift = Math.sin(time * 7) * 4;
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(8, -6);
  ctx.quadraticCurveTo(14, 6, 14 + drift, 20);
  ctx.lineTo(-14 + drift, 20);
  ctx.quadraticCurveTo(-14, 6, -8, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Pale Spirit Face with Big Curious Eyes
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -12, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big blue glowing eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(ex, -13, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex + 0.6, -13.6, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Red Cemetery Glass Candle Lantern in Hand (Hřbitovní svíce)
  const lanternSway = Math.sin(time * 9) * 3;
  ctx.save();
  ctx.translate(12, 2 + lanternSway);

  // Red glass candle jar
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-4, -4, 8, 10);
  ctx.fill();
  ctx.stroke();

  // Brass lid
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -5, 4.5, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // Flickering yellow flame inside
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. PEKELNÝ ČERT RYBNÍKÁŘ (CertRybnikar, L15 Mezi-boss)
// Archetyp: Zlomyslný čert v rybářských broďácích s okovanými vidlemi na kapry
// ---------------------------------------------------------------------------
export function drawHospodaCertRybnikar(
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

  // 1. Muddy Pond Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. High Fisher Waders (Vysoké rybářské holínky / broďáky)
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1]) {
    const lx = side * 7;
    ctx.beginPath();
    ctx.rect(lx - 4.5, 4, 9, 20);
    ctx.fill();
    ctx.stroke();
  }

  // Suspender straps on waders
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, 4); ctx.lineTo(-4, -6);
  ctx.moveTo(6, 4); ctx.lineTo(4, -6);
  ctx.stroke();

  // 3. Black Imp Torso & Red Neckerchief
  ctx.fillStyle = '#1C1917';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -4, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red polka-dot neckerchief
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(0, -8, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Impish Face with Horns & Fisher Cap
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(0, -14, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Devil horns
  ctx.fillStyle = '#78350F';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 4, -20);
    ctx.lineTo(side * 8, -27);
    ctx.lineTo(side * 2, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Yellow sly eyes
  for (const side of [-1, 1]) {
    const ex = side * 3.5;
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(ex, -15, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(ex, -15, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Fish Pitchfork with Impaled Squirming Carp (Vidle s kaprem)
  const forkLift = s.isStrike ? 10 : s.isWindup ? -6 : 0;
  ctx.save();
  ctx.translate(14, -2 + forkLift);

  // Shaft
  ctx.strokeStyle = '#854D0E';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, 22); ctx.lineTo(0, -28);
  ctx.stroke();

  // Iron pitchfork head
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  for (const px of [-4, 0, 4]) {
    ctx.beginPath();
    ctx.moveTo(px, -28); ctx.lineTo(px, -38);
    ctx.stroke();
  }

  // Squirming silver carp (Stříbrný kapřík na vidlích)
  const fishWiggle = Math.sin(time * 16) * 3;
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, -33 + fishWiggle, 7, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 11. HRUSICKÁ VELEŠTIKA (VeleStika, L15 Vele-boss)
// Archetyp: Furiantská obří dravá štika ze dna rybníka se zubisky
// ---------------------------------------------------------------------------
export function drawHospodaVeleStika(
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

  // 1. Water Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(21, 52, 38, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Streamlined Pike Body with Spotted Scales (Štikové tělo se skvrnami)
  const tailSwim = Math.sin(time * 10) * 6;
  ctx.fillStyle = '#166534'; // Deep pike green
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;

  // Main torpedo body
  ctx.beginPath();
  ctx.moveTo(24, 0); // Snout
  ctx.quadraticCurveTo(12, -12, -10, -10);
  ctx.quadraticCurveTo(-22, -6 + tailSwim, -30, 0 + tailSwim); // Tail base
  ctx.quadraticCurveTo(-22, 6 + tailSwim, -10, 10);
  ctx.quadraticCurveTo(12, 12, 24, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden yellow belly and mottled spots
  ctx.fillStyle = '#FEF08A';
  for (const [sx, sy] of [[-16, -2], [-8, 2], [0, -3], [8, 1], [-2, 3]]) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3, 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tail fin (Ocasní ploutev)
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.moveTo(-30, 0 + tailSwim);
  ctx.lineTo(-42, -12 + tailSwim);
  ctx.lineTo(-38, 0 + tailSwim);
  ctx.lineTo(-42, 12 + tailSwim);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Predatory Pike Jaws with Razor Teeth (Dravá štiková tlama s tesáky)
  ctx.fillStyle = '#881337'; // Red mouth interior
  const jawGape = s.isAttacking ? 6 : 2;
  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.lineTo(26, -4 - jawGape);
  ctx.lineTo(24, 4 + jawGape);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Razor teeth
  ctx.fillStyle = '#FFFFFF';
  for (let t = 14; t <= 24; t += 3) {
    ctx.beginPath();
    ctx.moveTo(t, -3 - jawGape); ctx.lineTo(t + 1, 0); ctx.lineTo(t + 2, -3 - jawGape);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(t, 3 + jawGape); ctx.lineTo(t + 1, 0); ctx.lineTo(t + 2, 3 + jawGape);
    ctx.fill();
  }

  // Fierce golden eye
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(8, -6, 4.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(8, -6, 2.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(9.2, -7.2, 1.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 12. KRÁLOVSKÁ SVATOMARTINSKÁ HUSA (KralovskaHusa, L16 Mini-boss)
// Archetyp: Rozšafná a pyšná bílá husa s mašlí a svatomartinským rohlíčkem
// ---------------------------------------------------------------------------
export function drawHospodaKralovskaHusa(
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
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Orange Webbed Feet
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  const waddle = Math.sin(time * 10) * 4;
  for (const side of [-1, 1]) {
    const lx = side * 7 + (side === -1 ? waddle : -waddle);
    ctx.beginPath();
    ctx.rect(lx - 2, 10, 4, 10);
    ctx.fill();
    ctx.stroke();
    // Webbed foot
    ctx.beginPath();
    ctx.moveTo(lx - 5, 20); ctx.lineTo(lx + 6, 20); ctx.lineTo(lx, 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Plump Snow-White Goose Body with Flapping Wings (Bílé husí tělo)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red Silk Neck Ribbon with Golden Bell
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(8, -8, 6, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Proud Goose Neck & Head with Orange Beak
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(14, -20);
  ctx.lineTo(8, -20);
  ctx.lineTo(2, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(12, -22, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(13, -23, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(13.6, -23.6, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Broad orange goose bill holding St. Martin's crescent pastry (rohlíček)
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(17, -23);
  ctx.lineTo(25, -22);
  ctx.lineTo(17, -19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden crescent pastry in bill
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(22, -20, 3, Math.PI * 0.2, Math.PI * 1.5);
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 13. MARTINSKÝ JEZDEC (MartinskyJezdec, L16 Mezi-boss)
// Archetyp: Vznešený rytíř v bílém plášti na grošovaném koni se sněhovou vločkou
// ---------------------------------------------------------------------------
export function drawHospodaMartinskyJezdec(
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

  // 1. Gallop Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. White Dappled Horse Body (Bílý grošovaný koník)
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Grey dapples on horse (Groše)
  ctx.fillStyle = '#E2E8F0';
  for (const [gx, gy] of [[-8, 6], [2, 12], [8, 6], [-2, 14]]) {
    ctx.beginPath();
    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Galloping horse legs
  const gallop = Math.sin(time * 11) * 5;
  for (const side of [-1, 1]) {
    const hx = side * 12 + (side === -1 ? gallop : -gallop);
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.rect(hx - 2.5, 18, 5, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(hx - 3, 24, 6, 2.5);
  }

  // Red horse harness with golden bells
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-16, 8); ctx.lineTo(16, 8);
  ctx.stroke();

  // 3. St. Martin Rider in White Cloak & Silver Sword (Rytíř v bílém plášti)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  const cloakFlap = Math.sin(time * 9) * 4;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(8, -4);
  ctx.lineTo(12 + cloakFlap, 14);
  ctx.lineTo(-12 + cloakFlap, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Knight head in bascinet helmet with white feather
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(0, -10, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White feather plume
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -17); ctx.lineTo(-6, -26);
  ctx.stroke();

  // Silver sword held high (Stříbrný meč)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(8, -6); ctx.lineTo(16, -28);
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 14. LISTOPADOVÝ MRAZIVEC (ListopadovyMrazivec, L16 Vele-boss)
// Archetyp: Komicky vzteklý stařec v ovčím kožichu se šedivým rampouchovým vousem
// ---------------------------------------------------------------------------
export function drawHospodaListopadovyMrazivec(
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

  // 1. Frost Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Thick Sheepskin Fur Coat with Patches (Huňatý ovčí kožich)
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-14, -6);
  ctx.lineTo(14, -6);
  ctx.lineTo(16, 22);
  ctx.lineTo(-16, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White wool trim
  ctx.fillStyle = '#F8FAFC';
  for (const bx of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.arc(bx, 20, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Old Frost Face with Huge Icicle Beard
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Great frosty icicle beard down to belly
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(8, -10);
  ctx.lineTo(6, 18);
  ctx.lineTo(0, 24);
  ctx.lineTo(-6, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bushy eyebrows & fierce eyes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-7, -18); ctx.lineTo(-1, -16); ctx.lineTo(5, -18);
  ctx.stroke();

  // Winter staff frosted in white rime
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(16, 22); ctx.lineTo(18, -26);
  ctx.stroke();

  drawFuriantSteamPuffs(ctx, 0, -10, time, 1);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 15. MLŽNÝ PŘÍZRAK Z RAŠELINIŠTĚ (MlznyPrizrak, L17 Mini-boss)
// Archetyp: Potměšilý vznášející se duch rašeliniště ve vlhkých cárech
// ---------------------------------------------------------------------------
export function drawHospodaMlznyPrizrak(
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

  // Floating mist shroud
  const wave = Math.sin(time * 7) * 4;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(16, -10, 14 + wave, 18);
  ctx.lineTo(0 + wave, 22);
  ctx.lineTo(-14 + wave, 18);
  ctx.quadraticCurveTo(-16, -10, 0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eerie yellow spirit eyes
  for (const side of [-1, 1]) {
    const ex = side * 4;
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(ex, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 16. ČERNÝ MYSLIVEC Z HVOZDU (CernyMyslivec, L17 Mezi-boss)
// Archetyp: Tajemný a furiantský lesník v kamizole s kloboukem s kančí štětkou
// ---------------------------------------------------------------------------
export function drawHospodaCernyMyslivec(
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

  // 1. Forest Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(20, 83, 45, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Dark Green Forester's Jerkin & Leather Boots
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.rect(-11, -6, 22, 18);
  ctx.fill();
  ctx.stroke();

  // Leather belt with hunting pouch
  ctx.fillStyle = '#78350F';
  ctx.fillRect(-12, 4, 24, 5);

  // Boots
  ctx.fillStyle = '#1C1917';
  for (const side of [-1, 1]) {
    ctx.fillRect(side * 7 - 4, 12, 8, 12);
  }

  // 3. Stern Weathered Face with Black Moustache & Forester Hat
  ctx.fillStyle = '#F5C6A5';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, -14, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black moustache
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(-8, -13);
  ctx.lineTo(0, -9.5);
  ctx.lineTo(8, -13);
  ctx.closePath();
  ctx.fill();

  // Forester's hat with wild boar brush (kančí štětka)
  ctx.fillStyle = '#14532D';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -21, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.rect(-6, -27, 12, 7);
  ctx.fill();
  ctx.stroke();

  // Boar bristle brush on hat
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(5, -27); ctx.lineTo(10, -34);
  ctx.stroke();

  // Flintlock hunting musket slung over shoulder (Ládovačka)
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-16, 18); ctx.lineTo(14, -28);
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 17. OBŘÍ DIVOČÁK KŇOUR (KanecKnour, L17 Vele-boss)
// Archetyp: Komicky vzteklý obří kňour se zahnutými kly v záplatované vestě
// ---------------------------------------------------------------------------
export function drawHospodaKanecKnour(
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

  // 1. Heavy Boar Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Powerful Bristly Dark Brown Boar Body (Hřmotné tělo kňoura)
  ctx.fillStyle = '#291104'; // Bristly boar brown
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 2, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Spiky bristles along spine (Štětiny na hřbetě)
  ctx.fillStyle = '#1C1917';
  for (let sp = -14; sp <= 10; sp += 4) {
    ctx.beginPath();
    ctx.moveTo(sp, -14); ctx.lineTo(sp + 2, -20); ctx.lineTo(sp + 4, -14);
    ctx.closePath();
    ctx.fill();
  }

  // Four thick trotter legs with cloven hooves
  for (const side of [-1, 1]) {
    const lx = side * 11;
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(lx - 4, 14, 8, 10);
  }

  // 3. Massive Boar Head with Enormous Curved Tusks & Steaming Snout
  ctx.fillStyle = '#3E1C07';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.lineTo(24, 2);
  ctx.lineTo(12, 10);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pink snout disc
  ctx.fillStyle = '#F472B6';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(24, 2, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Massive upward curved white tusks (Mocné kly)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(20, 3);
  ctx.quadraticCurveTo(26, -4, 24, -10);
  ctx.quadraticCurveTo(22, -4, 18, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Angry red beady eye under bristly brow
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(10, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(10.5, -4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Hot steam puffs chugging from snout
  drawFuriantSteamPuffs(ctx, 27, 2, time, 1);

  ctx.restore();
}
