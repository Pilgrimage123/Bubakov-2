import type { EnemyAttackInfo } from '../../types';

export const HOSPODA_INK = '#1C1610';

export function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Safe roundRect helper that works in both browser HTMLCanvasElement and headless mock contexts.
 */
export function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export interface ResolvedBossState {
  dir: 1 | -1;
  isMoving: boolean;
  isPanicked: boolean;
  isAttacking: boolean;
  isWindup: boolean;
  isStrike: boolean;
  isEnraged: boolean;
  windupProgress: number;
  strikeProgress: number;
  bob: number;
  stride: number;
  jawOpen: number;
  eyeSquint: number;
  pupilShiftX: number;
  pupilShiftY: number;
  browLift: number;
  earWiggle: number;
}

/**
 * Normalizes boss animation and combat state across all caller conventions
 * (arena dispatcher, Bestiary preview, and unit tests).
 * Explicitly prevents upside-down flipping when vx < 0!
 */
export function resolveBossState(
  time: number,
  vxOrDir: number | boolean = 1,
  panicked: boolean = false,
  attackInfo?: EnemyAttackInfo | any,
  enemy?: any
): ResolvedBossState {
  const numVx = typeof vxOrDir === 'number' ? vxOrDir : 1;
  const dir: 1 | -1 = numVx < 0 ? -1 : 1;
  const isMoving = Math.abs(numVx) > 0.05;
  const isPanicked = Boolean(panicked);

  const target = enemy || attackInfo || {};
  const isWindup = Boolean(
    attackInfo?.isWindup ||
      target?.isWindup ||
      (typeof attackInfo?.windupProgress === 'number' &&
        attackInfo.windupProgress > 0 &&
        !attackInfo?.isStrike) ||
      (typeof target?.windupTimer === 'number' && target.windupTimer > 0)
  );
  const isStrike = Boolean(
    attackInfo?.isStrike ||
      target?.isStrike ||
      (typeof attackInfo?.strikeProgress === 'number' && attackInfo.strikeProgress > 0)
  );
  const isAttacking = Boolean(
    isWindup ||
      isStrike ||
      attackInfo?.isActive ||
      attackInfo?.isAttacking ||
      target?.isAttacking
  );

  const isEnraged = Boolean(
    target?.enraged ||
      target?.isEnraged ||
      (typeof target?.hp === 'number' &&
        typeof target?.maxHp === 'number' &&
        target.maxHp > 0 &&
        target.hp <= target.maxHp * 0.5)
  );

  const windupProgress = clamp01(attackInfo?.windupProgress ?? (isWindup ? 0.75 : 0));
  const strikeProgress = clamp01(attackInfo?.strikeProgress ?? (isStrike ? 0.5 : 0));

  const walkFreq = isPanicked ? 18 : isEnraged ? 13 : 9;
  const bob = Math.sin(time * walkFreq) * (isPanicked ? 3.5 : 2.2);
  const stride = isMoving ? Math.sin(time * walkFreq) : Math.sin(time * 3.5) * 0.25;

  let jawOpen = 0.55 + 0.15 * Math.sin(time * 4.8);
  if (isStrike) {
    jawOpen = 1.0;
  } else if (isWindup) {
    jawOpen = 0.8 + 0.18 * Math.sin(time * 10);
  } else if (isEnraged) {
    jawOpen = 0.85 + 0.15 * Math.sin(time * 8);
  }

  const tMod = ((time % 3.7) + 3.7) % 3.7;
  const blinkWave = tMod > 3.54 ? Math.sin(((tMod - 3.54) / 0.16) * Math.PI) : 0;
  const eyeSquint = isStrike ? 0.22 : isWindup ? 0.35 : blinkWave * 0.85;

  const pupilShiftX = isStrike ? 1.8 : isWindup ? 1.5 : 1.0 + Math.sin(time * 2.4) * 0.65;
  const pupilShiftY = isStrike ? -0.8 : isWindup ? -1.2 : Math.cos(time * 2.7) * 0.5;
  const browLift = (isStrike ? 2.6 : isWindup ? 1.8 : 0.8) + Math.sin(time * 5.2) * 0.6;
  const earWiggle = Math.sin(time * 6.5) * 0.08 + (isAttacking ? 0.14 : 0);

  return {
    dir,
    isMoving,
    isPanicked,
    isAttacking,
    isWindup,
    isStrike,
    isEnraged,
    windupProgress,
    strikeProgress,
    bob,
    stride,
    jawOpen,
    eyeSquint,
    pupilShiftX,
    pupilShiftY,
    browLift,
    earWiggle,
  };
}

/**
 * Draws a traditional 5-petal Czech folk flower (lidový kvítek / blatouch)
 * with bold India ink outlines and flat gouache fills.
 */
export function drawFolkFlower2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  petalRadius: number,
  petalColor: string,
  centerColor: string,
  rotationRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationRad);
  ctx.fillStyle = petalColor;
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    const px = Math.cos(ang) * (petalRadius * 0.68);
    const py = Math.sin(ang) * (petalRadius * 0.68);
    ctx.beginPath();
    ctx.arc(px, py, petalRadius * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, petalRadius * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a multi-petal blooming white water-lily (leknín) with pointed snow-white petals
 * and a glowing golden-yellow stamen crown, transplanted from LadaCoverScene.tsx.
 */
export function drawWaterLilyBlossom2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  tiltRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);

  const backAngles = [-2.4, -1.85, -1.3, -0.75, -0.2];
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.35;
  for (const ang of backAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.32, 0);
    ctx.quadraticCurveTo(-radius * 0.42, -radius * 0.75, 0, -radius * 1.18);
    ctx.quadraticCurveTo(radius * 0.42, -radius * 0.75, radius * 0.32, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  const frontAngles = [-2.65, -2.1, -1.57, -1.05, -0.5, 0.05];
  ctx.fillStyle = '#FFFDF7';
  for (const ang of frontAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.3, 0.5);
    ctx.quadraticCurveTo(-radius * 0.38, -radius * 0.6, 0, -radius * 1.0);
    ctx.quadraticCurveTo(radius * 0.38, -radius * 0.6, radius * 0.3, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, -radius * 0.12, radius * 0.42, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EA580C';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * radius * 0.14, -radius * 0.18 - (1 - Math.abs(i) * 0.3) * 1.2, 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws a glistening crystal-blue teardrop water droplet with India ink outline,
 * vertical elongation support, surface tension stem, and specular highlights.
 */
export function drawWaterDroplet2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 2.6,
  stretch: number = 1.0,
  stemLength: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  if (stemLength > 0.4) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = Math.max(0.9, size * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.45 * stretch);
    ctx.lineTo(0, -size * 1.45 * stretch - stemLength);
    ctx.stroke();

    ctx.strokeStyle = HOSPODA_INK;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 1.45 * stretch);
    ctx.lineTo(-size * 0.1, -size * 1.45 * stretch - stemLength);
    ctx.moveTo(size * 0.25, -size * 1.45 * stretch);
    ctx.lineTo(size * 0.1, -size * 1.45 * stretch - stemLength);
    ctx.stroke();
  }

  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.45 * stretch);
  ctx.quadraticCurveTo(size * 1.15, 0, 0, size * stretch);
  ctx.quadraticCurveTo(-size * 1.15, 0, 0, -size * 1.45 * stretch);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.38 * stretch, size * 0.62, size * 0.32 * stretch, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-size * 0.26, -size * 0.18 * stretch, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.arc(size * 0.2, size * 0.48 * stretch, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders a physically realistic gravity-accelerated falling water drop cycle.
 */
export function drawRealisticDripCycle2D(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  groundY: number,
  timeVal: number,
  cycleDuration: number = 1.6,
  timeOffset: number = 0,
  dropScale: number = 2.2
): void {
  const rawT = ((timeVal + timeOffset) % cycleDuration + cycleDuration) % cycleDuration;
  const progress = rawT / cycleDuration;
  const fallDistance = groundY - originY;

  if (progress < 0.26) {
    const swell = progress / 0.26;
    const curSize = dropScale * (0.5 + 0.5 * swell);
    const hangY = originY + swell * 2.2;
    drawWaterDroplet2D(ctx, originX, hangY, curSize, 1.0 + swell * 0.25, swell * 1.8);
  } else if (progress < 0.82) {
    const fallT = (progress - 0.26) / (0.82 - 0.26);
    const fallEase = Math.pow(fallT, 1.75);
    const curY = originY + 2.2 + (fallDistance - 2.2) * fallEase;
    const speedStretch = 1.0 + fallT * 0.75;
    drawWaterDroplet2D(ctx, originX, curY, dropScale, speedStretch, 0);
  } else {
    const splashT = (progress - 0.82) / (1.0 - 0.82);
    const ringR = 2.5 + splashT * 10.0;
    const ringAlpha = Math.max(0, 1.0 - splashT);

    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha * 0.85})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(originX, groundY, ringR, ringR * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draws a multi-layered flat gouache cloud/smoke lobe without allocating any CanvasGradient!
 * Replaces per-frame createRadialGradient calls with crisp Ladovské layered gouache ellipses.
 */
export function drawFlatGouacheSmokeLobe(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  r: number,
  baseColor: string = '#E0F2FE',
  midColor: string = '#F0F9FF',
  highlightColor: string = '#FFFDF7',
  lineWidth: number = 2.4
): void {
  const safeR = Math.max(0, r);
  if (safeR <= 0) return;
  // 1. Base shaded gouache circle with India ink outline
  ctx.fillStyle = baseColor;
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(lx, ly, safeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Mid-tone inner puff
  ctx.fillStyle = midColor;
  ctx.beginPath();
  ctx.arc(lx - safeR * 0.1, ly - safeR * 0.12, Math.max(0, safeR * 0.78), 0, Math.PI * 2);
  ctx.fill();

  // 3. Crisp upper-left gouache highlight
  ctx.fillStyle = highlightColor;
  ctx.beginPath();
  ctx.ellipse(lx - safeR * 0.26, ly - safeR * 0.28, Math.max(0, safeR * 0.44), Math.max(0, safeR * 0.3), -0.35, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws comic angry steam puffs rising from ears or head for furiantští bosses (Obr, Čert).
 */
export function drawFuriantSteamPuffs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  intensity: number = 1.0
): void {
  if (intensity <= 0.05) return;
  ctx.save();
  for (let i = 0; i < 2; i++) {
    const phase = ((time * 3.2 + i * 0.5) % 1 + 1) % 1;
    const side = i === 0 ? -1 : 1;
    const px = x + side * (12 + phase * 14);
    const py = y - phase * 16;
    const r = (2.5 + phase * 4.0) * intensity;
    const alpha = (1 - phase) * 0.85;
    if (alpha > 0.08) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFDF7';
      ctx.strokeStyle = HOSPODA_INK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.arc(px + side * r * 0.6, py - r * 0.3, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Draws a traditional Czech salt-glazed stoneware or ceramic beer stein (kameninový tuplák)
 * with a billowing frothy head of beer foam and arched ear handle.
 */
export function drawFoamingBeerMug2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 1.0,
  tilt: number = 0,
  foamWave: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  if (tilt !== 0) ctx.rotate(tilt);
  ctx.scale(size, size);

  // 1. Stoneware Mug Body
  ctx.fillStyle = '#E5E7EB';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  safeRoundRect(ctx, -10, -4, 20, 24, 2.5);
  ctx.fill();
  ctx.stroke();

  // Cobalt blue folk stripe & tavern seal on stoneware
  ctx.fillStyle = '#2563EB';
  ctx.beginPath();
  ctx.rect(-9, 4, 18, 5);
  ctx.fill();

  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.arc(0, 6.5, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(0, 6.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic Mug Ear Handle
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(12, 8, 7.5, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 2. Foaming White Beer Head (Nadýchaná čepice piva)
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 2.0;

  // Multiple fluffy overlapping foam lobes
  const lobes = [
    [-9, -5 + Math.sin(foamWave * 3) * 1.2, 5.5],
    [-3, -8 + Math.cos(foamWave * 3) * 1.5, 6.5],
    [4, -7 + Math.sin(foamWave * 3 + 1) * 1.4, 6.0],
    [9, -4 + Math.cos(foamWave * 3 + 1) * 1.1, 5.0],
    [0, -11 + Math.sin(foamWave * 4) * 1.6, 7.0],
  ];

  for (const [lx, ly, lr] of lobes) {
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Creamy foam dollop dripping down mug front
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.quadraticCurveTo(-4, 7 + Math.sin(foamWave * 2) * 2, -2, 7 + Math.sin(foamWave * 2) * 2);
  ctx.quadraticCurveTo(0, 7 + Math.sin(foamWave * 2) * 2, 0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a stylized green hop cone (chmelová šištice) for wreaths and tavern decorations.
 */
export function drawHopCone2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 1.0,
  angle: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  if (angle !== 0) ctx.rotate(angle);
  ctx.scale(size, size);

  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;

  // Tiered green hop bract scales
  const tiers = [
    [-6, -4, '#65A30D'],
    [0, -7, '#84CC16'],
    [6, -4, '#65A30D'],
    [-5, 1, '#4D7C0F'],
    [0, -1, '#65A30D'],
    [5, 1, '#4D7C0F'],
    [-3, 6, '#3F6212'],
    [3, 6, '#3F6212'],
    [0, 10, '#365314'],
  ];

  for (const [bx, by, col] of tiers) {
    ctx.fillStyle = col as string;
    ctx.beginPath();
    ctx.arc(bx as number, by as number, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Small hop stem
  ctx.strokeStyle = '#365314';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(0, -12);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a flying folk music note floating up from village pub musicians.
 */
export function drawMusicNote2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  noteType: 0 | 1 = 0,
  size: number = 1.0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);

  ctx.fillStyle = HOSPODA_INK;
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;

  if (noteType === 0) {
    // Single eighth note (osminová nota)
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5, 2.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2.5, 0);
    ctx.lineTo(2.5, -12);
    ctx.quadraticCurveTo(5, -10, 8, -6);
    ctx.stroke();
  } else {
    // Double beamed eighth note (dvě spojené noty)
    ctx.beginPath();
    ctx.ellipse(-5, 0, 3.0, 2.2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(5, -1, 3.0, 2.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-3, -12);
    ctx.moveTo(7, -1);
    ctx.lineTo(7, -13);
    ctx.moveTo(-3.5, -12);
    ctx.lineTo(7.5, -13);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a rustic straw bundle (snop slámy) with binding ribbon for Morana.
 */
export function drawStrawBundle2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  wave: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  // Straw stalks
  ctx.strokeStyle = '#EAB308';
  ctx.lineWidth = 2.4;
  for (let i = -w * 0.45; i <= w * 0.45; i += 3.5) {
    const sw = Math.sin(wave + i * 0.2) * 2.5;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + sw, h);
    ctx.stroke();
  }

  // Darker golden under-straw
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 1.4;
  for (let i = -w * 0.4; i <= w * 0.4; i += 4.0) {
    const sw = Math.cos(wave + i * 0.3) * 2.0;
    ctx.beginPath();
    ctx.moveTo(i + 1, 0);
    ctx.lineTo(i + sw + 1, h);
    ctx.stroke();
  }

  // Red folk ribbon binding the bundle
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = HOSPODA_INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  safeRoundRect(ctx, -w * 0.5, h * 0.35, w, 5.5, 2.0);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
