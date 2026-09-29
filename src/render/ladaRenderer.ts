import { COLORS } from '../constants';

export const Lada = {
  setupPath(ctx: CanvasRenderingContext2D, fill: string, stroke = COLORS.ink, lineWidth = 4) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  },

  drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.8, radius * 0.95, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawLimb(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
    extra?: (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) => void
  ) {
    // Outer outline
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = width + 4;
    ctx.stroke();

    // Inner fill
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    if (extra) extra(ctx, x1, y1, x2, y2, width);
  },

  // -------------------------------------------------------------
  // HEROES
  // -------------------------------------------------------------
  drawWanderer(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
    const bob = isMoving ? Math.abs(Math.sin(time * 15)) * 4 : Math.sin(time * 2) * 1;
    const legSwing = isMoving ? Math.sin(time * 15) * 15 : 0;
    const pipeBob = Math.sin(time * 3) * 1.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -20);
    }

    // Legs
    this.drawLimb(ctx, 0, 10, -legSwing, 32, COLORS.ink, 10);
    this.setupPath(ctx, COLORS.woodDark);
    ctx.beginPath();
    ctx.arc(-legSwing + 3, 32, 6, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    this.drawLimb(ctx, 0, 10, legSwing, 32, COLORS.ink, 10);
    this.setupPath(ctx, COLORS.woodDark);
    ctx.beginPath();
    ctx.arc(legSwing + 3, 32, 6, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.translate(0, -bob);

    // Coat tails
    this.setupPath(ctx, COLORS.woodLight);
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-30, 20, -15, 28);
    ctx.lineTo(10, 28);
    ctx.quadraticCurveTo(20, 15, 18, 0);
    ctx.fill();
    ctx.stroke();

    // Back arm
    this.drawLimb(ctx, -10, -5, -15 - legSwing * 0.6, 15, COLORS.woodLight, 10);

    // Body
    this.setupPath(ctx, COLORS.woodLight);
    ctx.beginPath();
    ctx.ellipse(0, pipeBob, 22, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Buttons
    ctx.fillStyle = COLORS.mustard;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(10, -5 + i * 6 + pipeBob, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Belt
    this.setupPath(ctx, COLORS.ink, COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-20, 8 + pipeBob);
    ctx.lineTo(20, 8 + pipeBob);
    ctx.stroke();
    ctx.fillStyle = COLORS.mustard;
    ctx.fillRect(5, 5 + pipeBob, 6, 6);
    ctx.strokeRect(5, 5 + pipeBob, 6, 6);

    ctx.translate(0, pipeBob);

    // Head
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -22, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beard
    this.setupPath(ctx, COLORS.ink);
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0.1, Math.PI - 0.1);
    ctx.quadraticCurveTo(5, 12, 18, -12);
    ctx.fill();

    // Pipe
    if (!fleeing) {
      this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2);
      ctx.beginPath();
      ctx.moveTo(10, -15);
      ctx.lineTo(25, -10);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(23, -14, 6, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(26 + Math.sin(time * 2) * 2, -20 - ((time * 10) % 15), 3 + ((time * 5) % 5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(6, -26, 2, 0, Math.PI * 2);
    ctx.fill();

    // Hat
    this.setupPath(ctx, COLORS.woodDark);
    ctx.beginPath();
    ctx.ellipse(0, -34, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-2, -40, 14, 12, 0, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Hat ribbon
    this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-16, -37);
    ctx.quadraticCurveTo(0, -34, 12, -37);
    ctx.stroke();

    // Front arm
    this.drawLimb(ctx, 10, -5, 15 + legSwing * 0.6, 15, COLORS.woodLight, 10);
    ctx.restore();
  },

  drawShepherd(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
    const bob = isMoving ? Math.abs(Math.sin(time * 20)) * 5 : Math.sin(time * 3) * 1;
    const legSwing = isMoving ? Math.sin(time * 20) * 18 : 0;
    const breathing = Math.sin(time * 4) * 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -15);
    }

    // Legs
    this.drawLimb(ctx, -4, 5, -legSwing, 28, COLORS.white, 7);
    this.drawLimb(ctx, 4, 5, legSwing, 28, COLORS.white, 7);

    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(-legSwing + 2, 28, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(legSwing + 2, 28, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.translate(0, -bob);
    ctx.translate(0, breathing);

    // Shepherd's crook
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 4);
    const crookTilt = isMoving ? Math.sin(time * 20) * 0.2 : Math.sin(time * 2) * 0.1;
    ctx.save();
    ctx.translate(-15, 5);
    ctx.rotate(crookTilt);
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, -30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -30, 5, Math.PI, 0);
    ctx.stroke();
    ctx.restore();

    // Body
    this.drawLimb(ctx, -8, -5, -15, 5, COLORS.white, 6);
    this.setupPath(ctx, COLORS.white);
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-16, 18);
    ctx.lineTo(16, 18);
    ctx.lineTo(12, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Yellow vest
    this.setupPath(ctx, COLORS.mustard);
    ctx.beginPath();
    ctx.arc(0, 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(209, 52, 43, 0.3)';
    ctx.beginPath();
    ctx.arc(4, -15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cap
    this.setupPath(ctx, COLORS.mustard);
    ctx.beginPath();
    ctx.arc(0, -22, 13, Math.PI, 0);
    ctx.quadraticCurveTo(-18, -8, -10, -18);
    ctx.quadraticCurveTo(18, -8, 10, -20);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(6, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(6.5, -21, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawKorenarka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
    const bob = isMoving ? Math.abs(Math.sin(time * 16)) * 4 : Math.sin(time * 2.5) * 1;
    const legSwing = isMoving ? Math.sin(time * 16) * 14 : 0;
    const headBob = Math.sin(time * 3) * 1.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -18);
    }

    // Legs
    this.drawLimb(ctx, -5, 12, -legSwing - 2, 28, COLORS.ink, 8);
    this.drawLimb(ctx, 5, 12, legSwing + 2, 28, COLORS.ink, 8);

    ctx.translate(0, -bob);

    // Basket on back (nůše)
    ctx.save();
    ctx.translate(-16, -6);
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(14, -16);
    ctx.lineTo(12, 14);
    ctx.lineTo(-2, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Herbs peaking out
    this.setupPath(ctx, COLORS.green, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(2, -20, 6, 0, Math.PI * 2);
    ctx.arc(10, -22, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.mustard;
    ctx.beginPath();
    ctx.arc(6, -24, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Skirt
    this.setupPath(ctx, '#2F4858', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-24, 18, -18, 26);
    ctx.lineTo(18, 26);
    ctx.quadraticCurveTo(24, 18, 18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White apron
    this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-11, 2);
    ctx.lineTo(-14, 25);
    ctx.lineTo(14, 25);
    ctx.lineTo(11, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head with red scarf
    ctx.translate(0, headBob);
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red polka dot scarf
    this.setupPath(ctx, COLORS.red, COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -22, 14, Math.PI * 0.85, Math.PI * 0.15);
    ctx.quadraticCurveTo(12, -7, 0, -6);
    ctx.quadraticCurveTo(-12, -7, -14, -14);
    ctx.fill();
    ctx.stroke();

    // White dots
    ctx.fillStyle = COLORS.white;
    [-7, 0, 7].forEach((dx, i) => {
      ctx.beginPath();
      ctx.arc(dx, -26 + (i % 2 === 0 ? 3 : 0), 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Spectacles
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(4, -20, 4.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(4, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawWatchman(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
    const bob = isMoving ? Math.abs(Math.sin(time * 16)) * 4 : Math.sin(time * 2.5) * 1;
    const legSwing = isMoving ? Math.sin(time * 16) * 14 : 0;
    const headBob = Math.sin(time * 3) * 1.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -20);
    }

    // Legs
    this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, '#1E252B', 9);
    this.drawLimb(ctx, 5, 10, legSwing + 2, 30, '#1E252B', 9);

    ctx.translate(0, -bob);

    // Dark watchman coat
    this.setupPath(ctx, '#263445', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.quadraticCurveTo(-26, 16, -20, 26);
    ctx.lineTo(20, 26);
    ctx.quadraticCurveTo(26, 16, 18, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Halberd in hand
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14 + legSwing * 0.3, 24);
    ctx.lineTo(20 + legSwing * 0.3, -38);
    ctx.stroke();
    this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(20 + legSwing * 0.3, -38);
    ctx.lineTo(20 + legSwing * 0.3, -50);
    ctx.lineTo(26 + legSwing * 0.3, -44);
    ctx.lineTo(32 + legSwing * 0.3, -44);
    ctx.lineTo(22 + legSwing * 0.3, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lantern
    const lanternX = -20 - legSwing * 0.4;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16 - legSwing * 0.4, 4);
    ctx.lineTo(lanternX, 0);
    ctx.stroke();

    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2);
    ctx.fillRect(lanternX - 6, 0, 12, 4);
    ctx.strokeRect(lanternX - 6, 0, 12, 4);
    ctx.fillStyle = COLORS.mustard;
    ctx.fillRect(lanternX - 6, 4, 12, 14);
    ctx.strokeRect(lanternX - 6, 4, 12, 14);
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(lanternX, 11, 2.5 + Math.sin(time * 10) * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.translate(0, headBob);
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -20, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White bushy beard
    this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0.2, Math.PI - 0.2);
    ctx.quadraticCurveTo(0, -4, 8, -12);
    ctx.quadraticCurveTo(-4, 0, 0, -4);
    ctx.fill();
    ctx.stroke();

    // Fur cap
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -26, 14, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(0, -26, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  // -------------------------------------------------------------
  // KOSTELNÍK, BABIČKA S BARUNKOU A ANIMACE JEJICH ULTIMÁTNÍCH SCHOPNOSTÍ
  // -------------------------------------------------------------

  drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.bezierCurveTo(x - size * 1.3, y - size * 0.2, x - size * 0.7, y - size * 1.1, x, y - size * 0.4);
    ctx.bezierCurveTo(x + size * 0.7, y - size * 1.1, x + size * 1.3, y - size * 0.2, x, y + size * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },

  // Pobožný kostelník: černý kabát, široký klobouk, svazek klíčů a ruční zvonek
  drawSexton(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
    const bob = isMoving ? Math.abs(Math.sin(time * 14)) * 4 : Math.sin(time * 2.2) * 1;
    const legSwing = isMoving ? Math.sin(time * 14) * 13 : 0;
    const headBob = Math.sin(time * 3) * 1.2;
    const bellSwing = Math.sin(time * (isMoving ? 14 : 2.6)) * (isMoving ? 0.55 : 0.18);
    const keySway = Math.sin(time * (isMoving ? 14 : 2)) * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -20);
    }

    // Nohy: černé kalhoty a těžké boty
    this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, '#1C1A1A', 9);
    this.drawLimb(ctx, 5, 10, legSwing + 2, 30, '#1C1A1A', 9);

    ctx.translate(0, -bob);

    // Dlouhý černý kostelnický kabát
    this.setupPath(ctx, '#2A2624', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.moveTo(-17, -4);
    ctx.quadraticCurveTo(-26, 16, -22, 28);
    ctx.lineTo(22, 28);
    ctx.quadraticCurveTo(26, 16, 17, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bílý plátěný límec
    this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(0, 8);
    ctx.lineTo(9, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mosazné knoflíky
    ctx.fillStyle = COLORS.mustard;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 13 + i * 5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Svazek klíčů od kostela na opasku
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-13 + keySway * 0.3, 15, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.mustard;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-13 + keySway * 0.3, 15, 4, 0, Math.PI * 2);
    ctx.stroke();
    this.setupPath(ctx, COLORS.mustard, COLORS.ink, 1.5);
    ctx.fillRect(-16 + keySway, 19, 3, 9);
    ctx.strokeRect(-16 + keySway, 19, 3, 9);
    ctx.fillRect(-11 + keySway, 19, 3, 7);
    ctx.strokeRect(-11 + keySway, 19, 3, 7);

    // Ruční zvonek v pravé ruce (houpe se při chůzi)
    ctx.save();
    ctx.translate(19, 2);
    ctx.rotate(bellSwing);
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 5);
    ctx.stroke();
    this.setupPath(ctx, COLORS.mustard, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-9, 21);
    ctx.quadraticCurveTo(-9, 6, 0, 4);
    ctx.quadraticCurveTo(9, 6, 9, 21);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(-bellSwing * 6, 23, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hlava
    ctx.translate(0, headBob);
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -20, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Šedivý knír
    this.setupPath(ctx, '#B9B4A6', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.moveTo(-9, -15);
    ctx.quadraticCurveTo(0, -9, 9, -15);
    ctx.quadraticCurveTo(0, -13, -9, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Oči
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(-4, -22, 1.6, 0, Math.PI * 2);
    ctx.arc(5, -22, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Široký černý klobouk s mosazným proužkem
    this.setupPath(ctx, '#1F1B1A', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(0, -29, 20, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-11, -29);
    ctx.lineTo(-9, -43);
    ctx.lineTo(9, -43);
    ctx.lineTo(11, -29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.mustard;
    ctx.fillRect(-10, -34, 20, 3);

    ctx.restore();
  },

  // Barunka: malá vnučka s copánky, červeným šátkem a bílou zástěrkou
  drawBarunka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, moving: boolean, scale = 1) {
    const bob = moving ? Math.abs(Math.sin(time * 15)) * 3 : Math.sin(time * 2.6) * 1;
    const leg = moving ? Math.sin(time * 15) * 9 : 0;
    const braid = Math.sin(time * (moving ? 15 : 2.2)) * (moving ? 5 : 1.5);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Nohy: bílé punčošky
    this.drawLimb(ctx, -3, 8, -leg - 1, 22, COLORS.white, 6);
    this.drawLimb(ctx, 3, 8, leg + 1, 22, COLORS.white, 6);

    ctx.translate(0, -bob);

    // Modrá sukně
    this.setupPath(ctx, '#3A5A8C', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.quadraticCurveTo(-17, 10, -13, 18);
    ctx.lineTo(13, 18);
    ctx.quadraticCurveTo(17, 10, 11, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bílá zástěrka
    this.setupPath(ctx, '#F8F4E8', COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(9, 18);
    ctx.lineTo(-9, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Košilka a červený šátek přes ramena
    this.setupPath(ctx, COLORS.parchment, COLORS.ink, 2.5);
    ctx.fillRect(-8, -9, 16, 10);
    ctx.strokeRect(-8, -9, 16, 10);
    this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-9, -9);
    ctx.lineTo(9, -9);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Copánky s červenými mašlemi
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -15);
    ctx.quadraticCurveTo(-13 - braid, -8, -11 - braid, 0);
    ctx.moveTo(8, -15);
    ctx.quadraticCurveTo(13 + braid, -8, 11 + braid, 0);
    ctx.stroke();
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(-11 - braid, 1, 2.6, 0, Math.PI * 2);
    ctx.arc(11 + braid, 1, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Hlava
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vlasy s pěšinkou
    this.setupPath(ctx, '#7A4B22', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -18, 9.3, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Oči a růžové tvářičky
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(-3, -15, 1.3, 0, Math.PI * 2);
    ctx.arc(3, -15, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(232, 106, 146, 0.55)';
    ctx.beginPath();
    ctx.arc(-6, -12, 2, 0, Math.PI * 2);
    ctx.arc(6, -12, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // Babička s Barunkou: babička v šátku a zástěře s košíkem chleba, vnučka jí kráčí po boku
  drawGranny(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1, withBarunka = true) {
    const dir = dx < 0 ? -1 : 1;
    const isMoving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;

    // Barunka jde vedle babičky (kreslí se první, aby stála za ní)
    if (withBarunka && !fleeing) {
      this.drawBarunka(ctx, x - 34 * dir * scale, y + 9 * scale, time + 0.7, isMoving, scale * 0.85);
    }

    const bob = isMoving ? Math.abs(Math.sin(time * 11)) * 3 : Math.sin(time * 2.2) * 1;
    const legSwing = isMoving ? Math.sin(time * 11) * 10 : 0;
    const headBob = Math.sin(time * 2.6) * 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * dir, scale);

    if (fleeing) {
      ctx.rotate(Math.PI / 2);
      ctx.translate(0, -20);
    }

    // Nohy: hnědé punčochy a pantofle
    this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, '#4A3A2E', 8);
    this.drawLimb(ctx, 5, 10, legSwing + 2, 30, '#4A3A2E', 8);

    ctx.translate(0, -bob);

    // Široká modrá kartounová sukně
    this.setupPath(ctx, '#3F5E85', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.quadraticCurveTo(-29, 14, -25, 28);
    ctx.lineTo(25, 28);
    ctx.quadraticCurveTo(29, 14, 16, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bílá zástěra s kapsou
    this.setupPath(ctx, '#F8F4E8', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.lineTo(10, 2);
    ctx.lineTo(15, 28);
    ctx.lineTo(-15, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-6, 14, 12, 8);

    // Hůlka v pravé ruce
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(19 + legSwing * 0.25, 28);
    ctx.lineTo(22, 0);
    ctx.stroke();

    // Košík s chlebem v levé ruce
    const basketX = -22 - legSwing * 0.3;
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2.5);
    ctx.fillRect(basketX - 9, 7, 18, 11);
    ctx.strokeRect(basketX - 9, 7, 18, 11);
    this.setupPath(ctx, '#C98A3B', COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(basketX, 6, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(basketX - 4, 3);
    ctx.lineTo(basketX - 1, 8);
    ctx.moveTo(basketX + 1, 3);
    ctx.lineTo(basketX + 4, 8);
    ctx.stroke();

    // Hlava
    ctx.translate(0, headBob);
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bílý šátek s červenými puntíky, uvázaný pod bradou
    this.setupPath(ctx, '#F8F9FA', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -23, 14, Math.PI * 0.95, Math.PI * 2.05);
    ctx.lineTo(13, -14);
    ctx.quadraticCurveTo(0, -8, -13, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-17, -2);
    ctx.lineTo(-7, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.red;
    [[-7, -31], [1, -33], [8, -28], [-2, -27], [-11, -24], [11, -22]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 1.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Očka, úsměv a rumělka na tvářích
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(-4, -20, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -20, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -15, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(224, 96, 96, 0.5)';
    ctx.beginPath();
    ctx.arc(-7, -16, 2.2, 0, Math.PI * 2);
    ctx.arc(7, -16, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // Farní požehnání: zvon, doznívající vlny a masivní sloup svatého světla (souřadnice světa)
  drawBlessingFx(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, duration: number) {
    const k = Math.min(1, t / duration);
    const fade = 1 - k * k;
    const R = 650;

    ctx.save();

    // Svatá půda: velký zářivý kruh světla
    const glowR = Math.max(30, R * Math.min(1, t / 0.5));
    const gg = ctx.createRadialGradient(x, y, 20, x, y, glowR);
    gg.addColorStop(0, `rgba(255, 250, 215, ${0.55 * fade})`);
    gg.addColorStop(0.7, `rgba(255, 236, 160, ${0.22 * fade})`);
    gg.addColorStop(1, 'rgba(255, 236, 160, 0)');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Sloup svatého světla (dopadne za čtvrt sekundy a pak se zvolna zužuje)
    const drop = Math.min(1, t / 0.25);
    const topY = y - 1200;
    const botY = topY + (y - topY) * drop;
    const pulse = 1 + Math.sin(t * 24) * 0.05;
    const widen = t < 0.25 ? 0.6 : 1;
    const shrink = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / (duration - 1.6)) : 1;
    const pw = 78 * pulse * widen * shrink;
    if (pw > 1) {
      const pg = ctx.createLinearGradient(x - pw, 0, x + pw, 0);
      pg.addColorStop(0, 'rgba(255, 240, 170, 0)');
      pg.addColorStop(0.25, 'rgba(255, 244, 190, 0.55)');
      pg.addColorStop(0.5, 'rgba(255, 255, 240, 0.95)');
      pg.addColorStop(0.75, 'rgba(255, 244, 190, 0.55)');
      pg.addColorStop(1, 'rgba(255, 240, 170, 0)');
      ctx.fillStyle = pg;
      ctx.fillRect(x - pw, topY, pw * 2, botY - topY);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * shrink})`;
      ctx.fillRect(x - pw * 0.22, topY, pw * 0.44, botY - topY);
    }

    // Doznívající vlny zvonu: tři údery, každý slabší než ten předchozí
    const pulses = [0, 0.95, 1.8];
    const amps = [1, 0.6, 0.35];
    for (let i = 0; i < pulses.length; i++) {
      const pt = t - pulses[i];
      if (pt <= 0) continue;
      const rr = pt * 560;
      const al = Math.max(0, 1 - rr / R) * amps[i];
      if (al <= 0) continue;
      ctx.strokeStyle = `rgba(255, 236, 150, ${al})`;
      ctx.lineWidth = 10 * amps[i] + 2;
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${al * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, rr * 0.96, rr * 0.62 * 0.96, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vznášející se jiskry svatosti
    for (let i = 0; i < 34; i++) {
      const a = i * 2.399;
      const rad = (((i * 53) % 100) / 100) * R * 0.9 * Math.min(1, t / 0.6);
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad * 0.62 - ((t * 60 + i * 13) % 160);
      const sz = 3 + (i % 3);
      ctx.fillStyle = `rgba(255, 246, 190, ${0.85 * fade})`;
      ctx.beginPath();
      ctx.moveTo(px, py - sz * 2);
      ctx.lineTo(px + sz * 0.8, py);
      ctx.lineTo(px, py + sz * 2);
      ctx.lineTo(px - sz * 0.8, py);
      ctx.closePath();
      ctx.fill();
    }

    // Zvon nad hlavou lovce: kýve se a doznívá
    if (t < 2.2) {
      const decay = Math.max(0, 1 - t / 2.2);
      const sw = Math.sin(t * 16) * 0.35 * decay;
      ctx.save();
      ctx.translate(x, y - 150);
      ctx.rotate(sw);
      ctx.globalAlpha = Math.min(1, t / 0.15) * Math.min(1, (2.2 - t) / 0.4);
      ctx.strokeStyle = COLORS.woodDark;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, -48);
      ctx.stroke();
      this.setupPath(ctx, COLORS.mustard, COLORS.ink, 4);
      ctx.beginPath();
      ctx.moveTo(-34, 30);
      ctx.quadraticCurveTo(-36, -14, -10, -30);
      ctx.lineTo(10, -30);
      ctx.quadraticCurveTo(36, -14, 34, 30);
      ctx.quadraticCurveTo(0, 38, -34, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(-sw * 40, 40, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nápis úderu zvonu
    if (t < 0.9) {
      const sc = 1 + (0.9 - t) * 0.6;
      ctx.save();
      ctx.translate(x, y - 240);
      ctx.scale(sc, sc);
      ctx.globalAlpha = Math.min(1, (0.9 - t) / 0.4);
      ctx.font = '900 46px Eczar, serif';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8;
      ctx.strokeStyle = COLORS.ink;
      ctx.strokeText('BÍÍM!', 0, 0);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('BÍÍM!', 0, 0);
      ctx.restore();
    }

    ctx.restore();
  },

  // Chléb se solí a vlídné slovo: scénka se zastaveným časem (souřadnice obrazovky)
  drawGrannyScene(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, duration: number, applyAt: number) {
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (v: number) => {
      const c = clamp01(v);
      return c * c * (3 - 2 * c);
    };
    const vis = Math.min(ease(t / 0.55), ease((duration - t) / 0.55));
    const t2 = Math.max(0, t - applyAt); // čas od rozlití aury laskavosti

    ctx.save();

    // 1) Zastavený čas: teplé sépiové ztlumení světa a vinětace
    ctx.fillStyle = `rgba(58, 38, 18, ${0.5 * vis})`;
    ctx.fillRect(0, 0, w, h);
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.18, w / 2, h / 2, Math.max(w, h) * 0.72);
    vg.addColorStop(0, `rgba(255, 220, 150, ${0.16 * vis})`);
    vg.addColorStop(1, `rgba(20, 10, 4, ${0.62 * vis})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // 2) Filmové pruhy nahoře a dole
    const bar = Math.round(h * 0.14 * vis);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, w, bar);
    ctx.fillRect(0, h - bar, w, bar);
    ctx.fillStyle = COLORS.mustard;
    ctx.fillRect(0, bar - 3, w, 3);
    ctx.fillRect(0, h - bar, w, 3);

    // 3) Zastavené hodiny s nápisem
    if (vis > 0.05) {
      const ks = Math.max(0.6, Math.min(1.1, h / 800));
      ctx.save();
      ctx.globalAlpha = vis;
      ctx.translate(w / 2, bar + 34 * ks);
      ctx.scale(ks, ks);
      this.setupPath(ctx, COLORS.parchment, COLORS.ink, 4);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 17, Math.sin(a) * 17);
        ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.stroke();
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -15);
      ctx.moveTo(0, 0);
      ctx.lineTo(9, -8);
      ctx.stroke();
      ctx.fillStyle = COLORS.red;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '900 17px Eczar, serif';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      ctx.strokeStyle = COLORS.ink;
      ctx.strokeText('ČAS SE ZASTAVIL', 0, 46);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('ČAS SE ZASTAVIL', 0, 46);
      ctx.restore();
    }

    // 4) Malovaná scénka uprostřed obrazovky
    const s = Math.max(0.55, Math.min(1.5, (w - 30) / 800, (h - 2 * bar - 120) / 360));
    const pw = 380;
    const ph = 165;
    ctx.save();
    ctx.translate(w / 2, h / 2 + 34 * s);
    ctx.scale(s, s);
    ctx.globalAlpha = vis;

    const panelPath = () => {
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(-pw + r, -ph);
      ctx.lineTo(pw - r, -ph);
      ctx.quadraticCurveTo(pw, -ph, pw, -ph + r);
      ctx.lineTo(pw, ph - r);
      ctx.quadraticCurveTo(pw, ph, pw - r, ph);
      ctx.lineTo(-pw + r, ph);
      ctx.quadraticCurveTo(-pw, ph, -pw, ph - r);
      ctx.lineTo(-pw, -ph + r);
      ctx.quadraticCurveTo(-pw, -ph, -pw + r, -ph);
      ctx.closePath();
    };

    ctx.save();
    panelPath();
    ctx.clip();

    // Nebe za soumraku a bledé slunce
    const sky = ctx.createLinearGradient(0, -ph, 0, ph);
    sky.addColorStop(0, '#F3D9A4');
    sky.addColorStop(0.55, '#F7E9C6');
    sky.addColorStop(1, '#CFE0A6');
    ctx.fillStyle = sky;
    ctx.fillRect(-pw, -ph, pw * 2, ph * 2);
    this.setupPath(ctx, '#FFF3C4', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(250, -95, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vzdálené pahorky
    this.setupPath(ctx, '#A9C58A', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-pw, 60);
    ctx.quadraticCurveTo(-200, -10, -60, 55);
    ctx.quadraticCurveTo(80, -20, 220, 50);
    ctx.quadraticCurveTo(320, 10, pw, 60);
    ctx.lineTo(pw, ph);
    ctx.lineTo(-pw, ph);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Chaloupka s doškovou střechou, rozsvíceným okénkem a kouřem z komína
    this.setupPath(ctx, '#F8F4E8', COLORS.ink, 4);
    ctx.fillRect(-350, 5, 130, 90);
    ctx.strokeRect(-350, 5, 130, 90);
    this.setupPath(ctx, '#B8893A', COLORS.ink, 4);
    ctx.beginPath();
    ctx.moveTo(-364, 9);
    ctx.lineTo(-285, -58);
    ctx.lineTo(-206, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    this.setupPath(ctx, '#F8F4E8', COLORS.ink, 3);
    ctx.fillRect(-244, -50, 16, 34);
    ctx.strokeRect(-244, -50, 16, 34);
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
    ctx.fillRect(-268, 42, 34, 53);
    ctx.strokeRect(-268, 42, 34, 53);
    this.setupPath(ctx, '#FFD86B', COLORS.ink, 3);
    ctx.fillRect(-338, 30, 34, 28);
    ctx.strokeRect(-338, 30, 34, 28);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-321, 30);
    ctx.lineTo(-321, 58);
    ctx.moveTo(-338, 44);
    ctx.lineTo(-304, 44);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120, 110, 100, 0.55)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      const sy = -56 - i * 22 - ((t * 20) % 22);
      ctx.beginPath();
      ctx.moveTo(-236 + Math.sin(t * 2 + i) * 4, sy);
      ctx.quadraticCurveTo(-226 + Math.sin(t * 2 + i) * 6, sy - 10, -236, sy - 20);
      ctx.stroke();
    }

    // Bříza vpravo
    this.setupPath(ctx, '#F3EFE4', COLORS.ink, 3);
    ctx.fillRect(292, -40, 16, 135);
    ctx.strokeRect(292, -40, 16, 135);
    ctx.fillStyle = COLORS.ink;
    [[295, -10], [301, 20], [296, 52]].forEach(([bx, by]) => ctx.fillRect(bx, by, 7, 3));
    this.setupPath(ctx, '#8FB56A', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(300, -62, 42, 0, Math.PI * 2);
    ctx.arc(272, -40, 28, 0, Math.PI * 2);
    ctx.arc(330, -38, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Louka s cestičkou
    this.setupPath(ctx, '#8FB56A', COLORS.ink, 4);
    ctx.fillRect(-pw, 95, pw * 2, ph - 95);
    ctx.strokeRect(-pw, 95, pw * 2, ph - 95);
    ctx.fillStyle = '#D9C48F';
    ctx.beginPath();
    ctx.moveTo(-300, 95);
    ctx.lineTo(60, 95);
    ctx.lineTo(120, ph);
    ctx.lineTo(-380, ph);
    ctx.closePath();
    ctx.fill();

    // Postavy: babička s Barunkou přicházejí ke kameře
    const moving = t > 0.45 && t < 1.95;
    const walkK = ease((t - 0.45) / 1.5);
    const gx = -300 + walkK * 220;
    const bx = gx - 112;
    this.drawBarunka(ctx, bx, 38, t + 0.6, moving, 2.6);
    this.drawGranny(ctx, gx, 5, t, moving ? 1 : 0, 0, false, 3, false);

    // Chléb se solí na vyšívaném rušníku
    if (t >= 1.9) {
      const offerK = ease((t - 1.9) / 0.6);
      ctx.save();
      ctx.globalAlpha = vis * offerK;
      ctx.translate(gx + 76 + offerK * 14, -10 + Math.sin(t * 3) * 1.5);
      this.setupPath(ctx, '#F8F4E8', COLORS.ink, 3);
      ctx.fillRect(-46, 6, 92, 14);
      ctx.strokeRect(-46, 6, 92, 14);
      ctx.fillStyle = COLORS.red;
      ctx.fillRect(-46, 9, 92, 3);
      ctx.fillRect(-46, 15, 92, 2);
      this.setupPath(ctx, '#C98A3B', COLORS.ink, 3);
      ctx.beginPath();
      ctx.ellipse(-12, -6, 27, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#8A5A22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-24, -12);
      ctx.lineTo(-18, 0);
      ctx.moveTo(-12, -14);
      ctx.lineTo(-6, -1);
      ctx.moveTo(0, -12);
      ctx.lineTo(6, 0);
      ctx.stroke();
      this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
      ctx.beginPath();
      ctx.arc(30, 4, 12, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.quadraticCurveTo(30, -10, 40, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Bubliny s replikami
    const bubble = (text: string, cx: number, cy: number, alpha: number, tailX: number, tailY: number) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = vis * alpha;
      ctx.font = '900 21px Eczar, serif';
      const bw = ctx.measureText(text).width + 34;
      const bh = 44;
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tailX - 12, cy + bh / 2 - 1);
      ctx.lineTo(tailX, tailY);
      ctx.lineTo(tailX + 14, cy + bh / 2 - 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(tailX - 10, cy + bh / 2 - 4, 22, 6);
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cx, cy + 1);
      ctx.restore();
    };
    bubble('Pojďte, chudinky, dám vám chleba se solí…', gx + 20, -135, ease((t - 1.15) / 0.3) * ease((3.3 - t) / 0.3), gx + 8, -102);
    bubble('…a k tomu vlídné slovo!', bx - 20, -62, ease((t - 2.15) / 0.3) * ease((3.4 - t) / 0.3), bx, -30);

    // Aura čisté babičkovské laskavosti: zlaté vlny, srdíčka a lístky
    if (t2 > 0) {
      const ax = gx + 60;
      const ay = -10;
      for (let i = 0; i < 3; i++) {
        const rr = (t2 - i * 0.22) * 520;
        if (rr <= 1) continue;
        const al = Math.max(0, 1 - rr / 900) * 0.6;
        const g = ctx.createRadialGradient(ax, ay, rr * 0.6, ax, ay, rr);
        g.addColorStop(0, 'rgba(255, 200, 220, 0)');
        g.addColorStop(0.85, `rgba(255, 224, 160, ${al})`);
        g.addColorStop(1, 'rgba(255, 240, 200, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ax, ay, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 26; i++) {
        const a = i * 2.399 + 0.5;
        const sp = 90 + (i % 7) * 42;
        const px = ax + Math.cos(a) * sp * t2 * 1.6;
        const py = ay + Math.sin(a) * sp * t2 * 1.1 - t2 * 40 - Math.sin(t2 * 4 + i) * 6;
        ctx.globalAlpha = vis * Math.max(0, 1 - t2 / 2);
        if (i % 3 === 0) {
          this.drawHeart(ctx, px, py, 7 + (i % 4), i % 2 ? '#E86A92' : '#F4A6BF');
        } else {
          ctx.fillStyle = i % 2 ? '#FFF3C4' : '#F8C6D4';
          ctx.strokeStyle = COLORS.ink;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(px, py, 6, 3.2, a + t2 * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = vis;
    }

    ctx.restore(); // konec ořezu scénky

    // Rám obrázku
    ctx.globalAlpha = vis;
    panelPath();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    panelPath();
    ctx.strokeStyle = COLORS.mustard;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Název scénky ve spodním pruhu
    if (vis > 0.05) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, vis * ease((t - 0.5) / 0.4));
      ctx.font = `900 ${Math.round(Math.max(20, Math.min(32, h / 24)))}px Eczar, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 6;
      ctx.strokeStyle = COLORS.ink;
      ctx.strokeText('Chléb se solí a vlídné slovo', w / 2, h - bar / 2);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('Chléb se solí a vlídné slovo', w / 2, h - bar / 2);
      ctx.restore();
    }

    // 5) Vlna aury přes celou obrazovku
    if (t2 > 0) {
      const Rr = t2 * Math.hypot(w, h) * 0.85;
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.max(0, Rr - 160), w / 2, h / 2, Rr + 40);
      g.addColorStop(0, 'rgba(255, 214, 150, 0)');
      g.addColorStop(0.7, `rgba(255, 226, 170, ${0.34 * Math.max(0, 1 - t2 / 2)})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  },

  // -------------------------------------------------------------
  // MONSTERS & BOSSES
  // -------------------------------------------------------------
  drawRarach(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bounce = Math.sin(time * (panicked ? 30 : 15)) * (panicked ? 12 : 8);
    const tailWave = Math.cos(time * (panicked ? 50 : 25)) * 15;

    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(dir, 1);
    if (panicked) ctx.rotate(Math.PI / 4);

    // Tail
    this.setupPath(ctx, '#333');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -tailWave, -30, -10);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Body
    this.setupPath(ctx, COLORS.red);
    ctx.beginPath();
    ctx.ellipse(0, 5, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, -6, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    this.setupPath(ctx, COLORS.bone);
    ctx.beginPath();
    ctx.moveTo(-6, -15);
    ctx.quadraticCurveTo(-12, -22, -18, -18);
    ctx.lineTo(-10, -12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, -15);
    ctx.quadraticCurveTo(12, -22, 18, -18);
    ctx.lineTo(10, -12);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = COLORS.mustard;
    ctx.beginPath();
    ctx.arc(5, -8, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const freq = panicked ? 25 : 10;
    const legSwing = Math.sin(time * freq) * (panicked ? 20 : 12);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    if (panicked) ctx.rotate(Math.PI / 6);

    // Legs
    this.drawLimb(ctx, -4, 5, -legSwing, 25, COLORS.bone, 4);
    this.drawLimb(ctx, 4, 5, legSwing, 25, COLORS.bone, 4);

    // Spine & Ribs
    this.drawLimb(ctx, 0, -15, 0, 5, COLORS.bone, 6);
    this.setupPath(ctx, 'transparent', COLORS.bone, 4);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -12 + i * 5);
      ctx.quadraticCurveTo(12, -14 + i * 5, 10, -5 + i * 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -12 + i * 5);
      ctx.quadraticCurveTo(-12, -14 + i * 5, -10, -5 + i * 5);
      ctx.stroke();
    }

    // Skull
    this.setupPath(ctx, COLORS.bone);
    ctx.beginPath();
    ctx.arc(0, -24, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-6, -16, 12, 6);
    ctx.fill();
    ctx.stroke();

    // Eye sockets
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(4, -26, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-3, -26, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawBubak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const bob = Math.sin(time * (panicked ? 15 : 5)) * (panicked ? 10 : 5);
    const tilt = Math.cos(time * 10) * (panicked ? 0.3 : 0.1);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);

    // Dark cloud body
    this.setupPath(ctx, COLORS.ink, 'transparent');
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * (panicked ? 3 : 1);
      const r = 28 + Math.sin(time * 6 + i * 2) * 6;
      ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, r, 0, Math.PI * 2);
    }
    ctx.fill();

    // Flowing coat tentacles
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const cx = Math.cos(time * (panicked ? 9 : 3) + i) * 20;
      const cy = 20 + Math.abs(Math.sin(time * (panicked ? 12 : 4) + i) * 15);
      ctx.beginPath();
      ctx.moveTo(i * 10 - 10, 10);
      ctx.quadraticCurveTo(cx, cy, i * 15 - 15, cy + 10);
      ctx.stroke();
    }

    // Glowing eyes
    ctx.fillStyle = panicked ? COLORS.red : COLORS.mustard;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    const lookX = vx < 0 ? -8 : 8;
    ctx.beginPath();
    ctx.ellipse(lookX - 8, -12, 5, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(lookX + 8, -12, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  drawHastrman(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const legSwing = Math.sin(time * (panicked ? 30 : 12)) * (panicked ? 20 : 12);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    if (panicked) ctx.rotate(Math.PI / 6);

    // Legs
    this.drawLimb(ctx, -5, 10, -legSwing - 5, 25, COLORS.green, 6);
    this.drawLimb(ctx, 5, 10, legSwing + 5, 25, COLORS.green, 6);

    // Green coat with drippy tail
    this.setupPath(ctx, COLORS.water);
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.lineTo(-25, 20);
    ctx.lineTo(-5, 20);
    ctx.lineTo(5, -5);
    ctx.fill();
    ctx.stroke();

    // Body
    this.setupPath(ctx, '#3A76A8');
    ctx.beginPath();
    ctx.ellipse(0, 5, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    this.setupPath(ctx, '#A3C4A3');
    ctx.beginPath();
    ctx.arc(0, -18, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top hat
    this.setupPath(ctx, COLORS.ink);
    ctx.beginPath();
    ctx.ellipse(0, -29, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-12, -45, 24, 18);
    ctx.strokeRect(-12, -45, 24, 18);
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(-12, -32, 24, 4);

    // Eye
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(7, -19, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawMeluzina(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bob = Math.sin(time * 8) * 8;
    const wave = Math.cos(time * 12) * 6;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir, 1);
    if (panicked) ctx.rotate(Math.PI / 4);

    // Swirling veil
    this.setupPath(ctx, '#E6EEF8', COLORS.water, 2.5);
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.quadraticCurveTo(-25, -20 + wave, -35, -5 + wave);
    ctx.quadraticCurveTo(-45, 10, -25, 20);
    ctx.quadraticCurveTo(-10, 25, 0, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face
    this.setupPath(ctx, '#D9E8F5', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wailing mouth
    ctx.fillStyle = COLORS.water;
    ctx.beginPath();
    ctx.ellipse(4, -6, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing frost eyes
    ctx.fillStyle = COLORS.water;
    ctx.shadowColor = COLORS.water;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(5, -14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  drawPolednice(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const legSwing = Math.sin(time * 18) * 14;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    if (panicked) ctx.rotate(Math.PI / 5);

    // White ragged sheet shroud
    this.setupPath(ctx, COLORS.white, COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-22, 28);
    ctx.lineTo(22, 28);
    ctx.lineTo(16, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scythe / Sickle in hand
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, 4);
    ctx.lineTo(24, -18);
    ctx.stroke();
    // Curved sickle blade
    this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(24, -18, 12, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();

    // Haggard face & scarf
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -22, 13, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Menacing eyes
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(4, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawKlekanice(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);

    // Jute sack over shoulder
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(-14, 4, 14, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dark shawl
    this.setupPath(ctx, '#3D312A', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-18, 25);
    ctx.lineTo(18, 25);
    ctx.lineTo(15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face in deep hood
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -18, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Yellow sinister eyes
    ctx.fillStyle = COLORS.mustard;
    ctx.beginPath();
    ctx.arc(3, -19, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawCert(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean, isBoss = false) {
    const dir = vx < 0 ? -1 : 1;
    const scale = isBoss ? 2.2 : 1.2;
    const bounce = Math.sin(time * 8) * 4;
    const legSwing = Math.sin(time * 12) * 12;

    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(dir * scale, scale);
    if (panicked) ctx.rotate(Math.PI / 5);

    if (isBoss) {
      ctx.shadowColor = COLORS.red;
      ctx.shadowBlur = 20;
    }

    // Tail with arrow tip
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    const tailY = Math.sin(time * 10) * 15;
    ctx.moveTo(-10, 5);
    ctx.quadraticCurveTo(-25, tailY, -30, -10 + tailY);
    ctx.stroke();

    this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-30, -15 + tailY);
    ctx.lineTo(-24, -8 + tailY);
    ctx.lineTo(-34, -5 + tailY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Legs with hooves
    this.drawLimb(ctx, -6, 8, -legSwing - 5, 24, COLORS.woodDark, 6);
    this.drawLimb(ctx, 6, 8, legSwing + 5, 24, COLORS.woodDark, 6);

    // Black fur coat
    this.setupPath(ctx, '#221A15', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red vest
    this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-14, 10);
    ctx.lineTo(14, 10);
    ctx.lineTo(10, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    this.setupPath(ctx, '#2A1E17', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -18, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horns
    this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-4, -28);
    ctx.quadraticCurveTo(-15, -42, -6, -46);
    ctx.quadraticCurveTo(-2, -38, 2, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(4, -28);
    ctx.quadraticCurveTo(16, -42, 8, -46);
    ctx.quadraticCurveTo(4, -38, 0, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boss pitchfork
    if (isBoss) {
      ctx.strokeStyle = COLORS.woodDark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 18);
      ctx.lineTo(26, -26);
      ctx.stroke();

      this.setupPath(ctx, COLORS.mustard, COLORS.ink, 2);
      ctx.beginPath();
      ctx.moveTo(20, -26);
      ctx.lineTo(32, -26);
      ctx.lineTo(32, -38);
      ctx.lineTo(26, -30);
      ctx.lineTo(20, -38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  },

  drawHejkal(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const scale = 2.4;
    const bob = Math.sin(time * 6) * 3;
    const legSwing = Math.sin(time * 8) * 10;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir * scale, scale);
    if (panicked) ctx.rotate(Math.PI / 6);

    ctx.shadowColor = COLORS.pineGreen;
    ctx.shadowBlur = 18;

    // Tree-trunk legs
    this.drawLimb(ctx, -8, 8, -legSwing - 4, 25, '#3D2A1D', 8);
    this.drawLimb(ctx, 8, 8, legSwing + 4, 25, '#3D2A1D', 8);

    // Mossy trunk body
    this.setupPath(ctx, '#2D4428', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bark club in hand
    ctx.strokeStyle = '#3D2210';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(14, 12);
    ctx.lineTo(28, -26);
    ctx.stroke();

    // Antlers / Branches
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-4, -32);
    ctx.lineTo(-12, -46);
    ctx.lineTo(-20, -42);
    ctx.moveTo(-12, -46);
    ctx.lineTo(-8, -52);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(4, -32);
    ctx.lineTo(12, -46);
    ctx.lineTo(20, -42);
    ctx.moveTo(12, -46);
    ctx.lineTo(8, -52);
    ctx.stroke();

    ctx.restore();
  },

  drawObr(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const scale = 2.8;
    const bob = Math.sin(time * 4) * 3;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir * scale, scale);
    if (panicked) ctx.rotate(Math.PI / 8);

    // Massive granite body
    this.setupPath(ctx, COLORS.grey, COLORS.ink, 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cracks in stone
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(4, 8);
    ctx.lineTo(-2, 16);
    ctx.stroke();

    // Moss on shoulders
    this.setupPath(ctx, COLORS.leafGreen, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(-14, -14, 8, 0, Math.PI * 2);
    ctx.arc(14, -14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    this.setupPath(ctx, COLORS.stoneGrey, COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -22, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing rune eyes
    ctx.fillStyle = COLORS.mustard;
    ctx.shadowColor = COLORS.mustard;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(5, -23, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  // Fallback shared archetype drawers
  drawPlivnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawSotek(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawZaba(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const hop = Math.abs(Math.sin(time * 10)) * 4;
    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(vx < 0 ? -1 : 1, 1);
    this.setupPath(ctx, COLORS.green, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-9, -8, 4, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(9, -8, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
  drawZmrzlik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawSkodnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawMysak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawZaba(ctx, x, y, time, vx, panicked);
  },
  drawSkeletonScythe(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawSkeleton(ctx, x, y, time, vx, panicked);
  },
  drawUmrlec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawSkeleton(ctx, x, y, time, vx, panicked);
  },
  drawPisar(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawSkeleton(ctx, x, y, time, vx, panicked);
  },
  drawHrobnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawSkeleton(ctx, x, y, time, vx, panicked);
  },
  drawHromotluk(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawBubak(ctx, x, y, time, vx, panicked);
  },
  drawStodolnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawBubak(ctx, x, y, time, vx, panicked);
  },
  drawCernyPes(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(vx < 0 ? -1 : 1, 1);
    this.setupPath(ctx, '#1A1817', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Glowing red eyes
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  drawVodnicek(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawHastrman(ctx, x, y, time, vx, panicked);
  },
  drawTopivec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawHastrman(ctx, x, y, time, vx, panicked);
  },
  drawBlatouch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawHastrman(ctx, x, y, time, vx, panicked);
  },
  drawMrazik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawMeluzina(ctx, x, y, time, vx, panicked);
  },
  drawSeverak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawMeluzina(ctx, x, y, time, vx, panicked);
  },
  drawVanicka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawMeluzina(ctx, x, y, time, vx, panicked);
  },
  drawDivozenka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawPolednice(ctx, x, y, time, vx, panicked);
  },
  drawBludicka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const bob = Math.sin(time * 6) * 6;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.shadowColor = COLORS.water;
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(217, 160, 54, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  },
  drawDrevorubec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawSkeleton(ctx, x, y, time, vx, panicked);
  },
  drawCertik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawCert(ctx, x, y, time, vx, panicked, false);
  },
  drawOhnivyMuz(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawDrab(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawCert(ctx, x, y, time, vx, panicked, false);
  },
  // Round 13 enemies reuse the established Ladovské silhouettes with distinct colour and scale.
  drawZbojnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawDrevorubec(ctx, x, y, time, vx, panicked); },
  drawJiskrivec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawOhnivyMuz(ctx, x, y, time, vx, panicked); },
  drawOhnivyPes(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawCernyPes(ctx, x, y, time, vx, panicked); },
  drawMlynar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    vx: number,
    panicked: boolean,
    isEnraged = false
  ) {
    const dir = vx < 0 ? -1 : 1;
    const scale = 2.4;
    const walkSpeed = panicked ? 24 : isEnraged ? 14 : 9;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * (panicked ? 5 : 3.5);
    const legSwing = Math.sin(time * walkSpeed) * (panicked ? 22 : 14);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * scale, scale);
    if (panicked) ctx.rotate(Math.PI / 10);

    // 1. Water foam & ripples around the miller's boots (millrace stream)
    ctx.save();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 26 + Math.sin(time * 6) * 3, 9 + Math.cos(time * 6) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Frothy water spray drops
    for (let i = 0; i < 4; i++) {
      const dropAng = time * 4 + (i * Math.PI) / 2;
      const dropR = 24 + Math.sin(time * 7 + i) * 6;
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.arc(Math.cos(dropAng) * dropR, 36 + Math.sin(dropAng) * 4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Large Cursed Mill Wheel (Velké mlýnské kolo ze starých hamrů)
    ctx.save();
    const wheelX = -18;
    const wheelY = -6;
    const wheelR = 30;
    const wheelAngle = time * (panicked ? -4.5 : isEnraged ? 6.0 : 2.8);

    if (isEnraged) {
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 14;
    }

    ctx.translate(wheelX, wheelY);
    ctx.rotate(wheelAngle);

    // Outer wooden rim
    this.setupPath(ctx, '#543318', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner rim recess
    ctx.fillStyle = isEnraged ? '#451A03' : '#3B2312';
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 6, 0, Math.PI * 2);
    ctx.fill();

    // 8 wooden spokes (paprsky kola)
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 8; i++) {
      const spAng = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(spAng) * wheelR, Math.sin(spAng) * wheelR);
      ctx.stroke();
    }

    // 8 outer wooden paddle blades (lopatky mlýnského kola)
    for (let i = 0; i < 8; i++) {
      const bAng = (i * Math.PI) / 4;
      ctx.save();
      ctx.rotate(bAng);
      ctx.translate(wheelR - 2, 0);
      this.setupPath(ctx, isEnraged ? '#9A3412' : '#78350F', COLORS.ink, 2);
      ctx.fillRect(0, -4, 9, 8);
      ctx.strokeRect(0, -4, 9, 8);

      // Water droplets slinging off paddle tips
      ctx.fillStyle = isEnraged ? '#FDBA74' : '#BAE6FD';
      ctx.beginPath();
      ctx.arc(10, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Central iron hub with rivets (litinový střed)
    this.setupPath(ctx, isEnraged ? '#DC2626' : '#1F2937', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isEnraged ? '#FEF08A' : '#9CA3AF';
    for (let i = 0; i < 4; i++) {
      const rAng = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(Math.cos(rAng) * 4.5, Math.sin(rAng) * 4.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Jute Flour Sack on back hip (Pytel mouky s vázáním)
    ctx.save();
    this.setupPath(ctx, '#C8AB83', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(-14, 12, 11, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Flour sack tie
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, -1);
    ctx.lineTo(-11, -1);
    ctx.stroke();
    // Stenciled grain ear / cross mark
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.lineTo(-14, 16);
    ctx.moveTo(-17, 10);
    ctx.lineTo(-11, 14);
    ctx.moveTo(-11, 10);
    ctx.lineTo(-17, 14);
    ctx.stroke();
    // Spilled flour dust on sack
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-13, 14, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Sturdy Miller Legs & Heavy Boots (Pomoučené holínky)
    this.drawLimb(ctx, -7, 18, -8 - legSwing * 0.45, 36, '#2D1B0F', 9);
    this.drawLimb(ctx, 7, 18, 8 + legSwing * 0.45, 36, '#2D1B0F', 9);
    // Flour dusting on boot tips
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-8 - legSwing * 0.45, 36, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(8 + legSwing * 0.45, 36, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Stout Peasant Torso & Patched Rustic Vest (Pořádné břicho a vesta)
    this.setupPath(ctx, '#5A3418', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.ellipse(0, 10, 18, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vest patch with folk stitch marks
    this.setupPath(ctx, '#3E5C38', COLORS.ink, 1.8);
    ctx.fillRect(-14, 4, 8, 8);
    ctx.strokeRect(-14, 4, 8, 8);
    ctx.strokeStyle = '#FEF3C7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.lineTo(-8, 10);
    ctx.moveTo(-8, 6);
    ctx.lineTo(-12, 10);
    ctx.stroke();

    // Leather belt with bronze buckle
    this.setupPath(ctx, '#26160C', COLORS.ink, 2);
    ctx.fillRect(-17, 14, 34, 6);
    ctx.strokeRect(-17, 14, 34, 6);
    this.setupPath(ctx, '#D97706', COLORS.ink, 2);
    ctx.fillRect(-5, 13, 10, 8);
    ctx.strokeRect(-5, 13, 10, 8);

    // 6. White Flour-Dusted Apron (Mlynářská bílá zástěra)
    this.setupPath(ctx, '#F7F2EA', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-11, 7);
    ctx.lineTo(11, 7);
    ctx.lineTo(13, 27);
    ctx.quadraticCurveTo(0, 31, -13, 27);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Apron folds and white flour smudges
    ctx.strokeStyle = 'rgba(120, 100, 80, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(-6, 26);
    ctx.moveTo(4, 10);
    ctx.lineTo(5, 26);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.ellipse(0, 19, 8, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Miller's Head & Expressive Folk Face
    this.setupPath(ctx, '#E5B191', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -11, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy peasant cheeks
    ctx.fillStyle = 'rgba(217, 70, 60, 0.55)';
    ctx.beginPath();
    ctx.arc(-7, -8, 4, 0, Math.PI * 2);
    ctx.arc(7, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    // White flour smudge on nose and cheek
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -10, 3, 0, Math.PI * 2);
    ctx.arc(-6, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Magnificent Bushy White Flour Mustache (Bílý zatočený knír)
    this.setupPath(ctx, '#FFFFFF', COLORS.ink, 2.4);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(-7, -9, -15, -4);
    ctx.quadraticCurveTo(-9, -2, 0, -5);
    ctx.quadraticCurveTo(9, -2, 15, -4);
    ctx.quadraticCurveTo(7, -9, 0, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Round nose
    this.setupPath(ctx, '#D98967', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.arc(0, -10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cursed Eyes
    if (panicked) {
      // Wide startled eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-5, -13, 3.5, 0, Math.PI * 2);
      ctx.arc(5, -13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(-5, -13, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -13, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isEnraged) {
      // Fiery cursed eyes
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(-5, -13, 3, 0, Math.PI * 2);
      ctx.arc(5, -13, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(-4.5, -13, 1.3, 0, Math.PI * 2);
      ctx.arc(5.5, -13, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Determined glowing amber eyes
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(-5, -13, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -13, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(-4.5, -13, 1.2, 0, Math.PI * 2);
      ctx.arc(5.5, -13, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // White bushy eyebrows
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-8, -17);
    ctx.lineTo(-2, -16);
    ctx.moveTo(2, -16);
    ctx.lineTo(8, -17);
    ctx.stroke();

    // 8. White Miller's Cap (Mlynářská čapka s bambulkou)
    this.setupPath(ctx, '#F5F5F4', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-13, -19);
    ctx.quadraticCurveTo(0, -25, 13, -19);
    ctx.quadraticCurveTo(16, -34, 4, -36);
    ctx.quadraticCurveTo(-8, -35, -13, -19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folded cap tail drooping backwards
    const capSway = Math.sin(time * walkSpeed) * 3;
    ctx.beginPath();
    ctx.moveTo(4, -36);
    ctx.quadraticCurveTo(-14 + capSway, -38, -20 + capSway, -26);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pom-pom (bambulka)
    this.setupPath(ctx, '#FFFFFF', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(-21 + capSway, -25, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 9. Massive Wooden Flour Shovel (Dřevěná mlynářská lopata)
    ctx.save();
    const shovelSway = Math.sin(time * walkSpeed * 0.8) * 0.15;
    ctx.translate(14, 5);
    ctx.rotate(shovelSway + 0.2);

    // Long wooden handle
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-4, 24);
    ctx.lineTo(12, -32);
    ctx.stroke();

    // Outline for handle
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, 24);
    ctx.lineTo(11, -32);
    ctx.moveTo(-3, 24);
    ctx.lineTo(13, -32);
    ctx.stroke();

    // Shovel head (sázecí dřevěná lopata)
    this.setupPath(ctx, '#D99B61', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(7, -32);
    ctx.lineTo(21, -38);
    ctx.lineTo(28, -24);
    ctx.lineTo(14, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Iron reinforcing band
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(9, -28);
    ctx.lineTo(25, -34);
    ctx.stroke();

    // Flour powder dusted over shovel blade
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(19, -29, 6, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Sturdy peasant fist holding the shovel
    this.setupPath(ctx, '#E5B191', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(3, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 10. Flour dust particles wafting off the miller
    for (let i = 0; i < 3; i++) {
      const flourX = Math.sin(time * 3 + i * 2) * 22;
      const flourY = -10 + ((time * 25 + i * 18) % 45) - 22;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(flourX, flourY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  drawMillstone(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 22, angle = 0) {
    this.drawShadow(ctx, x, y, radius);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Granite stone disc
    this.setupPath(ctx, '#9CA3AF', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Concentric inner grinding groove
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
    ctx.stroke();

    // Radial cut furrows (mlecí drážky na kámen)
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const gAng = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(gAng) * (radius * 0.4), Math.sin(gAng) * (radius * 0.4));
      ctx.lineTo(Math.cos(gAng + 0.2) * (radius * 0.92), Math.sin(gAng + 0.2) * (radius * 0.92));
      ctx.stroke();
    }

    // Square central axle hole (čtvercový otvor pro litinový čep)
    const eyeSize = radius * 0.44;
    this.setupPath(ctx, '#1E293B', COLORS.ink, 2.5);
    ctx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
    ctx.strokeRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);

    // Flour / stone dust highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawWaterWave(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 26, angle = 0, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Surging frothy wave crescent
    this.setupPath(ctx, '#0284C7', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI * 0.45, Math.PI * 0.45, false);
    ctx.quadraticCurveTo(-radius * 0.3, 0, 0, -radius * 0.85);
    ctx.fill();
    ctx.stroke();

    // Foaming white crest
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 1, -Math.PI * 0.4, Math.PI * 0.4, false);
    ctx.stroke();

    // Spray droplets
    ctx.fillStyle = '#E0F2FE';
    for (let i = 0; i < 5; i++) {
      const sAng = -Math.PI * 0.35 + (i * Math.PI * 0.7) / 4;
      const sR = radius + 5 + Math.sin(time * 12 + i) * 3;
      ctx.beginPath();
      ctx.arc(Math.cos(sAng) * sR, Math.sin(sAng) * sR, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
  drawBilaPani(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawBludicka(ctx, x, y, time, vx, panicked); },
  drawZbrojnos(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawSkeleton(ctx, x, y, time, vx, panicked); },
  drawBezhlavyRytir(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawCert(ctx, x, y, time, vx, panicked, true); },
  drawSnehulak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawHromotluk(ctx, x, y, time, vx, panicked); },
  drawNocniMura(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawBubak(ctx, x, y, time, vx, panicked); },
  drawDrak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) { this.drawHejkal(ctx, x, y, time, vx, panicked); },

  // -------------------------------------------------------------
  // DROPS & ITEMS
  // -------------------------------------------------------------
  drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, value: number) {
    const bob = Math.sin(time * 6) * 4;
    this.drawShadow(ctx, x, y, 9);

    if (value >= 15) {
      // Golden Tolar
      this.setupPath(ctx, COLORS.mustard, COLORS.ink, 3);
      ctx.beginPath();
      ctx.arc(x, y + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS.ink;
      ctx.font = '800 11px Eczar';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T', x, y + bob);
    } else if (value >= 5) {
      // Silver Stříbrňák
      this.setupPath(ctx, '#E2E8F0', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.arc(x, y + bob, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS.ink;
      ctx.font = '800 10px Eczar';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', x, y + bob);
    } else {
      // Copper Krejcar
      this.setupPath(ctx, '#D97706', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.arc(x, y + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS.ink;
      ctx.font = '800 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K', x, y + bob);
    }
  },

  drawPotion(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    const bob = Math.sin(time * 5) * 4;
    this.drawShadow(ctx, x, y, 12);
    ctx.save();
    ctx.translate(x, y + bob);

    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 10;

    // Bottle glass
    this.setupPath(ctx, '#E8F5E9', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-5, -12);
    ctx.lineTo(-5, -6);
    ctx.quadraticCurveTo(-14, 0, -12, 14);
    ctx.lineTo(12, 14);
    ctx.quadraticCurveTo(14, 0, 5, -6);
    ctx.lineTo(5, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Green healing fluid
    ctx.fillStyle = COLORS.leafGreen;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.lineTo(10, 12);
    ctx.quadraticCurveTo(11, 4, 0, 4);
    ctx.quadraticCurveTo(-11, 4, -10, 12);
    ctx.fill();

    // Cork
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
    ctx.fillRect(-4, -17, 8, 5);
    ctx.strokeRect(-4, -17, 8, 5);

    ctx.restore();
  },

  drawBreadRoll(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    const bob = Math.sin(time * 4) * 3;
    this.drawShadow(ctx, x, y, 10);
    ctx.save();
    ctx.translate(x, y + bob);

    this.setupPath(ctx, '#FDE68A', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cuts on pretzel/roll
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.lineTo(-2, 3);
    ctx.moveTo(2, -3);
    ctx.lineTo(6, 3);
    ctx.stroke();

    ctx.restore();
  },

  drawSoulJar(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = COLORS.water;
    ctx.shadowBlur = 12 + Math.sin(time * 4) * 6;

    this.setupPath(ctx, COLORS.white, COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-10, 12);
    ctx.quadraticCurveTo(0, 16, 10, 12);
    ctx.lineTo(12, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(12, 1, 5, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Ceramic ribbon
    ctx.strokeStyle = COLORS.water;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-4, -2, 0, 2);
    ctx.quadraticCurveTo(4, 6, 8, 2);
    ctx.stroke();

    // Lid
    this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, -11, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red ribbon on lid
    this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -15, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, shake = 0, glow = 0, scale = 1) {
    ctx.save();
    ctx.translate(x + (Math.random() - 0.5) * shake, y + (Math.random() - 0.5) * shake);
    if (scale !== 1) ctx.scale(scale, scale);

    if (glow > 0) {
      ctx.shadowColor = COLORS.mustard;
      ctx.shadowBlur = glow * 40;
    }

    // Base box
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 5);
    ctx.fillRect(-40, -10, 80, 40);
    ctx.strokeRect(-40, -10, 80, 40);

    // Domed lid
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 5);
    ctx.beginPath();
    ctx.arc(0, -10, 40, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Iron straps
    this.setupPath(ctx, COLORS.red, COLORS.ink, 4);
    ctx.fillRect(-25, -45, 10, 75);
    ctx.strokeRect(-25, -45, 10, 75);
    ctx.fillRect(15, -45, 10, 75);
    ctx.strokeRect(15, -45, 10, 75);

    // Golden lock
    this.setupPath(ctx, COLORS.mustard, COLORS.ink, 4);
    ctx.beginPath();
    ctx.arc(0, -5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(-3, -5, 6, 8);

    ctx.restore();
  },

  drawChasnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, panicked: boolean) {
    ctx.save();
    ctx.translate(x, y);

    this.drawLimb(ctx, -5, 8, -4, 22, '#2A4B7C', 7);
    this.drawLimb(ctx, 5, 8, 4, 22, '#2A4B7C', 7);

    // Blue trousers & white shirt
    this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vest
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
    ctx.fillRect(-10, -8, 20, 14);
    ctx.strokeRect(-10, -8, 20, 14);

    if (panicked) {
      const armSwing = Math.sin(time * 15) * 12;
      this.drawLimb(ctx, -8, -6, -20 + armSwing, -18, COLORS.white, 6);
      this.drawLimb(ctx, 8, -6, 20 - armSwing, -18, COLORS.white, 6);
    } else {
      this.drawLimb(ctx, -8, -6, -14, 8, COLORS.white, 6);
      this.drawLimb(ctx, 8, -6, 16, -6, COLORS.white, 6);
      ctx.fillStyle = COLORS.grey;
      ctx.beginPath();
      ctx.arc(16, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Head
    this.setupPath(ctx, COLORS.skin);
    ctx.beginPath();
    ctx.arc(0, -18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cap
    this.setupPath(ctx, COLORS.red, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -22, 11, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    if (panicked) {
      ctx.save();
      ctx.translate(14, -36);
      this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
      ctx.beginPath();
      ctx.ellipse(12, -4, 20, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLORS.red;
      ctx.font = '900 11px Eczar';
      ctx.textAlign = 'center';
      ctx.fillText('POMOC!', 12, 0);
      ctx.restore();
    }

    ctx.restore();
  },

  // -------------------------------------------------------------
  // VILLAGE VIGNETTE SCENES
  // -------------------------------------------------------------
  drawOvenScene(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    ctx.fillStyle = COLORS.bone;
    ctx.fillRect(0, 0, w, h);

    this.setupPath(ctx, COLORS.red, COLORS.ink, 3);
    ctx.fillRect(w / 2 - 60, h - 80, 120, 80);
    ctx.strokeRect(w / 2 - 60, h - 80, 120, 80);
    ctx.beginPath();
    ctx.arc(w / 2, h - 80, 60, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(w / 2, h - 30, 25, Math.PI, 0);
    ctx.lineTo(w / 2 + 25, h);
    ctx.lineTo(w / 2 - 25, h);
    ctx.fill();

    // Glowing fire
    ctx.fillStyle = COLORS.mustard;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 15, h);
    ctx.quadraticCurveTo(w / 2 - 10, h - 30 - Math.sin(time * 10) * 10, w / 2, h - 40 + Math.cos(time * 8) * 5);
    ctx.quadraticCurveTo(w / 2 + 10, h - 30 - Math.cos(time * 12) * 10, w / 2 + 15, h);
    ctx.fill();

    // Rarášek helper
    const rx = w / 4;
    const ry = h / 2 + Math.sin(time * 5) * 10;
    this.drawRarach(ctx, rx, ry, time, 1, false);
  },

  drawScarecrowScene(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    ctx.fillStyle = '#2C3540';
    ctx.fillRect(0, 0, w, h);

    // Moon
    ctx.fillStyle = COLORS.parchment;
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.3, 20, 0, Math.PI * 2);
    ctx.fill();

    // Wheat
    ctx.strokeStyle = COLORS.mustard;
    ctx.lineWidth = 3;
    for (let i = 0; i < w; i += 12) {
      const sway = Math.sin(time * 2 + i) * 10;
      ctx.beginPath();
      ctx.moveTo(i, h);
      ctx.quadraticCurveTo(i + sway / 2, h - 20, i + sway, h - 40);
      ctx.stroke();
    }

    // Cross pole
    this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
    ctx.fillRect(w / 2 - 5, h / 4, 10, h * 0.75);
    ctx.strokeRect(w / 2 - 5, h / 4, 10, h * 0.75);
    ctx.fillRect(w / 2 - 40, h / 2 - 10, 80, 10);
    ctx.strokeRect(w / 2 - 40, h / 2 - 10, 80, 10);

    // Bubák on pole
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.sin(time) * 0.1);
    ctx.translate(-w / 2, -h / 2);
    this.drawBubak(ctx, w / 2, h / 2 - 20, time, 0, false);
    ctx.restore();
  },

  drawMillScene(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    ctx.fillStyle = COLORS.bone;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = COLORS.water;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 30);
    for (let i = 0; i <= w; i += 20) {
      ctx.quadraticCurveTo(i + 10, h - 30 + Math.sin(time * 4 + i) * 5, i + 20, h - 30);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Wheel
    const mx = w / 2;
    const my = h / 2;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(-time);
    this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();
      ctx.fillRect(35, -10, 10, 20);
      ctx.strokeRect(35, -10, 10, 20);
    }
    ctx.restore();

    this.drawHastrman(ctx, w * 0.8, h / 2 - Math.sin(time * 5) * 5, time, -1, false);
  },

  drawWallScene(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    ctx.fillStyle = COLORS.bone;
    ctx.fillRect(0, 0, w, h);

    this.setupPath(ctx, COLORS.grey, COLORS.ink, 2);
    for (let row = 0; row < 4; row++) {
      const y = h - 20 - row * 20;
      const offset = row % 2 === 0 ? 0 : 15;
      for (let col = 0; col < 5; col++) {
        const x = col * 30 - offset;
        ctx.fillRect(x, y, 30, 20);
        ctx.strokeRect(x, y, 30, 20);
      }
    }

    this.drawSkeleton(ctx, w / 2 + 20, h - 30, time, -1, false);
  },
};
