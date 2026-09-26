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
