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

  drawBentLimb(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    kx: number,
    ky: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
    extra?: (ctx: CanvasRenderingContext2D, x1: number, y1: number, kx: number, ky: number, x2: number, y2: number, width: number) => void
  ) {
    // Outer outline
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(kx, ky);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = width + 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner fill
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(kx, ky);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    if (extra) extra(ctx, x1, y1, kx, ky, x2, y2, width);
  },

  // Calculate lively multi-frame comic run cycle with the distinct high-knee lift & tuck frame
  getRunLegCycle(phase: number, hipX: number, hipY: number, legLen: number) {
    const p = ((phase % 1) + 1) % 1;
    let kx = hipX;
    let ky = hipY + legLen * 0.5;
    let fx = hipX;
    let fy = hipY + legLen;

    if (p < 0.25) {
      // Frame 1: Contact & Heel Plant forward
      const t = p / 0.25;
      kx = hipX + legLen * (0.35 - t * 0.15);
      ky = hipY + legLen * (0.42 + t * 0.08);
      fx = hipX + legLen * (0.68 - t * 0.25);
      fy = hipY + legLen * (0.88 + t * 0.12);
    } else if (p < 0.50) {
      // Frame 2: Push-off & Drive backward
      const t = (p - 0.25) / 0.25;
      kx = hipX + legLen * (0.20 - t * 0.40);
      ky = hipY + legLen * (0.50 - t * 0.05);
      fx = hipX + legLen * (0.43 - t * 0.95);
      fy = hipY + legLen * (1.00 - t * 0.18);
    } else if (p < 0.75) {
      // Frame 3: HIGH KNEE LIFT & TUCK (THE EXTRA RUNNING FRAME!)
      const t = (p - 0.50) / 0.25;
      kx = hipX + legLen * (-0.20 + t * 0.70);
      ky = hipY + legLen * (0.45 - t * 0.24); // knee pulled high!
      fx = hipX + legLen * (-0.52 + t * 0.55); // foot tucked up under hip/body!
      fy = hipY + legLen * (0.82 - t * 0.35); // foot lifted off ground!
    } else {
      // Frame 4: Extension & Strike Re-reach
      const t = (p - 0.75) / 0.25;
      kx = hipX + legLen * (0.50 - t * 0.15);
      ky = hipY + legLen * (0.21 + t * 0.21);
      fx = hipX + legLen * (0.03 + t * 0.65);
      fy = hipY + legLen * (0.47 + t * 0.41);
    }

    return { kx, ky, fx, fy };
  },

  // Comic panic sweat droplets flying backward in terror
  drawPanicDrops(ctx: CanvasRenderingContext2D, headX: number, headY: number, time: number) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const dropT = (time * 4.2 + i * 0.33) % 1;
      const dx = headX - 12 - dropT * 22 - i * 4;
      const dy = headY - 4 - Math.sin(dropT * Math.PI) * 12 + i * 5;
      const r = (1 - dropT * 0.45) * 2.8;
      if (dropT > 0.08 && dropT < 0.92) {
        ctx.fillStyle = '#60A5FA';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(dx, dy, Math.max(1, r), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  // Comic scramble dust puffs at feet
  drawRunDust(ctx: CanvasRenderingContext2D, footX: number, groundY: number, time: number) {
    ctx.save();
    for (let i = 0; i < 2; i++) {
      const puffT = (time * 4.8 + i * 0.5) % 1;
      const px = footX - 8 - puffT * 20;
      const py = groundY - 2 - puffT * 5;
      const r = 2.5 + puffT * 7;
      const alpha = (1 - puffT) * 0.65;
      ctx.fillStyle = `rgba(224, 212, 188, ${alpha})`;
      ctx.strokeStyle = `rgba(45, 28, 14, ${alpha * 0.75})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
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

    // Hlava a červený puntíkovaný šátek (obličej orámovaný, zřetelně viditelný)
    ctx.translate(0, headBob);

    // 1) Červený šátek - temeno, zátylek a podvázání
    this.setupPath(ctx, COLORS.red, COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -18, 14, Math.PI * 0.65, Math.PI * 1.85); // temeno a zátylek
    ctx.quadraticCurveTo(8, -32, 13, -20); // shora dopředu k čelu
    ctx.quadraticCurveTo(15, -12, 6, -5);  // podél lícní kosti pod bradu
    ctx.quadraticCurveTo(-4, -4, -10, -8); // pod bradou
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cípy a uzel šátku pod bradou
    ctx.beginPath();
    ctx.moveTo(3, -6);
    ctx.lineTo(8, -1);
    ctx.lineTo(2, 2);
    ctx.lineTo(-1, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bílé puntíky na červeném šátku (pouze na látce, ne přes obličej)
    ctx.fillStyle = COLORS.white;
    [[-8, -25], [-2, -30], [-9, -17], [-4, -23], [-8, -10], [5, -31], [4, 0]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2) Obličej (odhalená kůže orámovaná šátkem)
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(3, -17, 9.5, 11, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Stříbrné vlasy s pěšinkou pod okrajem šátku
    this.setupPath(ctx, '#9C968B', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.arc(2, -22, 6.5, Math.PI * 1.0, Math.PI * 1.8);
    ctx.stroke();

    // 3) Rysy obličeje: brýle na nose, laskavé oko, nos a úsměv
    // Drátěné kulaté brýle
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(5, -18, 4.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // Očko za brýlemi s odleskem
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(5.5, -18, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(6.2, -18.7, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Stranice brýlí k uchu
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0.5, -18);
    ctx.lineTo(9.5, -18);
    ctx.stroke();

    // Obočí
    ctx.strokeStyle = '#5A5043';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(5, -23, 3, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();

    // Nosík kořenářky
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(7.5, -19);
    ctx.lineTo(10.5, -16);
    ctx.lineTo(8, -15);
    ctx.stroke();

    // Vlídný úsměv
    ctx.beginPath();
    ctx.arc(5, -12, 3.2, 0.2, Math.PI * 0.7);
    ctx.stroke();

    // Rumělka na tváři (Ladovské červené líčko)
    ctx.fillStyle = 'rgba(224, 82, 82, 0.5)';
    ctx.beginPath();
    ctx.arc(4, -13, 2.6, 0, Math.PI * 2);
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

    // 1) Bílý šátek s červenými puntíky - kapuce obepínající temeno a zátylek
    this.setupPath(ctx, '#F8F9FA', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -20, 15, Math.PI * 0.6, Math.PI * 1.85); // temeno a zátylek
    ctx.quadraticCurveTo(9, -34, 13, -22); // shora dopředu k čelu
    ctx.quadraticCurveTo(15, -13, 6, -7);  // dolů podél tváře pod bradu
    ctx.quadraticCurveTo(-3, -5, -9, -9);  // pod bradou k zátylku
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cípy šátku uvázané pod bradou
    this.setupPath(ctx, '#F8F9FA', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(3, -7);
    ctx.lineTo(8, -2);
    ctx.lineTo(1, 2);
    ctx.lineTo(-2, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Červené puntíky na bílém šátku (pouze na látce, ne přes obličej)
    ctx.fillStyle = COLORS.red;
    [[-9, -26], [-3, -31], [-9, -18], [-4, -24], [-9, -11], [3, -33], [7, -29], [4, -1]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 1.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2) Odhalený laskavý obličej babičky (kůže)
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(3, -19, 10, 11.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Šedivé vlnité vlasy vykukující pod okrajem šátku
    this.setupPath(ctx, '#C8C4BD', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.arc(2, -24, 7.5, Math.PI * 1.05, Math.PI * 1.85);
    ctx.stroke();

    // 3) Rysy babiččina obličeje: laskavé jiskřivé oči, vrásky úsměvu, nosík a ruměná líčka
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(1.5, -20, 1.6, 0, Math.PI * 2);
    ctx.arc(7.5, -20, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Bělostné jiskřičky v očích
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(2.1, -20.6, 0.7, 0, Math.PI * 2);
    ctx.arc(8.1, -20.6, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Laskavé vějířkovité vrásky u očí
    ctx.strokeStyle = '#8C6F54';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9.5, -20);
    ctx.lineTo(12, -21);
    ctx.moveTo(9.5, -19);
    ctx.lineTo(11.5, -18);
    ctx.stroke();

    // Babiččin nosík
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(6, -21);
    ctx.lineTo(9.5, -18);
    ctx.lineTo(7, -17);
    ctx.stroke();

    // Široký hřejivý úsměv
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(4.5, -14, 4.2, 0.15, Math.PI * 0.85);
    ctx.stroke();

    // Ruměná líčka (Ladovská růžová jablíčka)
    ctx.fillStyle = 'rgba(230, 90, 90, 0.52)';
    ctx.beginPath();
    ctx.arc(1, -15, 2.8, 0, Math.PI * 2);
    ctx.arc(9, -15, 2.8, 0, Math.PI * 2);
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
    const runSpeed = panicked ? 24 : 12;
    const bounce = Math.sin(time * runSpeed) * (panicked ? 5 : 4);
    const tailWave = Math.cos(time * (panicked ? 40 : 20)) * (panicked ? 20 : 12);

    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 22, time);
      this.drawPanicDrops(ctx, 0, -12, time);
    }

    // Animated legs with multi-frame run cycle (high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -4, 8, 16);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 4, 8, 16);
      this.drawBentLimb(ctx, -4, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#B91C1C', 3.5);
      this.drawBentLimb(ctx, 4, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#B91C1C', 3.5);
      // Cloven little hooves
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(leg1.fx - 2, leg1.fy - 1, 4, 3);
      ctx.fillRect(leg2.fx - 2, leg2.fy - 1, 4, 3);
    } else {
      const legSwing = Math.sin(time * 12) * 8;
      this.drawLimb(ctx, -4, 8, -4 - legSwing, 22, '#B91C1C', 3.5);
      this.drawLimb(ctx, 4, 8, 4 + legSwing, 22, '#B91C1C', 3.5);
    }

    // Tail (wagging frantically when running)
    this.setupPath(ctx, '#333');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-18, -tailWave, -28, -6 + (panicked ? Math.sin(time * 25) * 8 : -4));
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

    // Little claws / arms
    if (panicked) {
      // Waving frantically overhead in comical terror
      const armWave1 = Math.sin(time * 28) * 8;
      const armWave2 = Math.cos(time * 28) * 8;
      this.drawLimb(ctx, -5, 2, -12, -14 + armWave1, '#B91C1C', 3);
      this.drawLimb(ctx, 5, 2, 10, -15 + armWave2, '#B91C1C', 3);
    } else {
      this.drawLimb(ctx, -5, 4, -9, 10, '#B91C1C', 3);
      this.drawLimb(ctx, 5, 4, 9, 10, '#B91C1C', 3);
    }

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

    // Eye (looks back over shoulder periodically when panicked)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    const eyeX = glanceBack ? -4 : 5;
    ctx.fillStyle = COLORS.mustard;
    ctx.beginPath();
    ctx.arc(eyeX, -8, panicked ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(eyeX + (glanceBack ? -1 : 1), -8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bob = panicked ? Math.abs(Math.sin(time * 22)) * 3 : Math.sin(time * 10) * 1.5;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 25, time);
      this.drawPanicDrops(ctx, 0, -28, time);
    }

    // Legs with multi-frame running cycle (high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -4, 5, 21);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 4, 5, 21);
      this.drawBentLimb(ctx, -4, 5, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.bone, 4);
      this.drawBentLimb(ctx, 4, 5, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.bone, 4);
    } else {
      const legSwing = Math.sin(time * 10) * 12;
      this.drawLimb(ctx, -4, 5, -legSwing, 25, COLORS.bone, 4);
      this.drawLimb(ctx, 4, 5, legSwing, 25, COLORS.bone, 4);
    }

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

    // Skeletal arms - clattering in panic overhead or walking
    if (panicked) {
      const boneShudder = Math.sin(time * 30) * 4;
      this.drawBentLimb(ctx, -6, -12, -12, -22 + boneShudder, -16, -32 + boneShudder, COLORS.bone, 3.5);
      this.drawBentLimb(ctx, 6, -12, 12, -24 - boneShudder, 14, -34 - boneShudder, COLORS.bone, 3.5);
    } else {
      const armSwing = Math.sin(time * 10) * 8;
      this.drawLimb(ctx, -6, -12, -10 - armSwing, 2, COLORS.bone, 3.5);
      this.drawLimb(ctx, 6, -12, 10 + armSwing, 2, COLORS.bone, 3.5);
    }

    // Skull
    this.setupPath(ctx, COLORS.bone);
    ctx.beginPath();
    ctx.arc(0, -24, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Jaw (drops open in terror when panicked!)
    ctx.beginPath();
    const jawY = panicked ? -14 : -16;
    ctx.rect(-6, jawY, 12, panicked ? 8 : 6);
    ctx.fill();
    ctx.stroke();

    // Eye sockets (glance back in terror)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -4 : 4, -26, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(glanceBack ? -9 : -3, -26, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawBubak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const bob = Math.sin(time * (panicked ? 18 : 5)) * (panicked ? 6 : 5);
    const tilt = panicked ? 0.12 + Math.sin(time * 14) * 0.05 : Math.cos(time * 10) * 0.1;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);
    if (panicked) {
      this.drawRunDust(ctx, -12, 26, time);
      this.drawPanicDrops(ctx, 0, -24, time);
    }

    // Dark cloud body - streams backward in comic speed when panicked
    this.setupPath(ctx, COLORS.ink, 'transparent');
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * (panicked ? 4 : 1);
      const r = 28 + Math.sin(time * 6 + i * 2) * 6;
      const stretchX = panicked ? Math.cos(a) * 16 - (Math.cos(a) < 0 ? 10 : 0) : Math.cos(a) * 12;
      ctx.arc(stretchX, Math.sin(a) * 12, r, 0, Math.PI * 2);
    }
    ctx.fill();

    // Flowing coat tentacles streaming backward in multi-frame flutter
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const cx = panicked ? -20 - i * 8 + Math.sin(time * 24 + i) * 6 : Math.cos(time * 3 + i) * 20;
      const cy = panicked ? 15 + Math.sin(time * 24 + i * 1.5) * 12 : 20 + Math.abs(Math.sin(time * 4 + i) * 15);
      ctx.beginPath();
      ctx.moveTo(i * 8 - 12, 10);
      ctx.quadraticCurveTo(cx, cy, cx - 10, cy + (panicked ? -4 : 10));
      ctx.stroke();
    }

    // Glowing terrified eyes looking backward when running
    ctx.fillStyle = panicked ? '#FDE047' : COLORS.mustard;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    const lookX = panicked ? -10 : (vx < 0 ? -8 : 8);
    ctx.beginPath();
    ctx.ellipse(lookX - 6, -12, panicked ? 6 : 5, panicked ? 9 : 8, 0, 0, Math.PI * 2);
    ctx.ellipse(lookX + 6, -12, panicked ? 6 : 5, panicked ? 9 : 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils dilating in shock
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(lookX - 7, -12, 2, 0, Math.PI * 2);
    ctx.arc(lookX + 5, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  drawHastrman(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bob = panicked ? Math.abs(Math.sin(time * 22)) * 4 : Math.sin(time * 12) * 2;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 25, time);
      this.drawPanicDrops(ctx, 4, -40, time);
    }

    // Running legs with the high-knee lift & tuck frame
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -5, 8, 20);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 8, 20);
      this.drawBentLimb(ctx, -5, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.green, 6);
      this.drawBentLimb(ctx, 5, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.green, 6);
      // Red boots
      this.setupPath(ctx, '#DC2626');
      ctx.beginPath();
      ctx.arc(leg1.fx, leg1.fy, 4.5, 0, Math.PI * 2);
      ctx.arc(leg2.fx, leg2.fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const legSwing = Math.sin(time * 12) * 12;
      this.drawLimb(ctx, -5, 10, -legSwing - 5, 25, COLORS.green, 6);
      this.drawLimb(ctx, 5, 10, legSwing + 5, 25, COLORS.green, 6);
    }

    // Green coat with coattails flapping behind
    this.setupPath(ctx, COLORS.water);
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    const tailFlap = panicked ? Math.sin(time * 26) * 10 : 0;
    ctx.lineTo(panicked ? -34 : -25, 16 + tailFlap);
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

    // Arms: clutching his top hat brim in panic so it doesn't fly off!
    if (panicked) {
      // Hand holding top hat brim
      this.drawBentLimb(ctx, -8, -4, -14, -20, -6, -34, '#3A76A8', 5);
      // Other arm flailing behind
      const armWave = Math.sin(time * 26) * 10;
      this.drawLimb(ctx, 8, -4, -16, 12 + armWave, '#3A76A8', 5);
    } else {
      this.drawLimb(ctx, -8, -4, -12, 10, '#3A76A8', 5);
      this.drawLimb(ctx, 8, -4, 12, 10, '#3A76A8', 5);
    }

    // Head
    this.setupPath(ctx, '#A3C4A3');
    ctx.beginPath();
    ctx.arc(0, -18, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top hat (wobbling in panic)
    ctx.save();
    if (panicked) ctx.rotate(Math.sin(time * 20) * 0.08);
    this.setupPath(ctx, COLORS.ink);
    ctx.beginPath();
    ctx.ellipse(0, -29, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-12, -45, 24, 18);
    ctx.strokeRect(-12, -45, 24, 18);
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(-12, -32, 24, 4);
    ctx.restore();

    // Eye
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -5 : 7, -19, panicked ? 3.5 : 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawMeluzina(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bob = Math.sin(time * (panicked ? 16 : 8)) * 8;
    const wave = Math.cos(time * (panicked ? 24 : 12)) * (panicked ? 12 : 6);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.14);
      this.drawPanicDrops(ctx, -4, -20, time);
      // Frost trail
      ctx.fillStyle = 'rgba(190, 227, 248, 0.4)';
      for (let i = 0; i < 3; i++) {
        const pt = (time * 4 + i * 0.33) % 1;
        ctx.beginPath();
        ctx.arc(-24 - pt * 28, 5 + Math.sin(pt * 5) * 10, 2.5 + pt * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Swirling veil streaming out behind
    this.setupPath(ctx, '#E6EEF8', COLORS.water, 2.5);
    ctx.beginPath();
    ctx.moveTo(0, -15);
    const veilReach = panicked ? -55 : -35;
    ctx.quadraticCurveTo(-25, -20 + wave, veilReach, -5 + wave);
    ctx.quadraticCurveTo(panicked ? -65 : -45, 10, -25, 20);
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

    // Arms: in panic, clutching her face in horror ("The Scream")!
    if (panicked) {
      this.drawLimb(ctx, -8, 2, -12, -8, '#D9E8F5', 3.5);
      this.drawLimb(ctx, 8, 2, 10, -8, '#D9E8F5', 3.5);
    }

    // Wailing mouth (wide open in scream when panicked)
    ctx.fillStyle = COLORS.water;
    ctx.beginPath();
    ctx.ellipse(panicked ? -2 : 4, -6, panicked ? 5 : 4, panicked ? 9 : 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing frost eyes
    ctx.fillStyle = COLORS.water;
    ctx.shadowColor = COLORS.water;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(panicked ? -4 : 5, -14, panicked ? 3.5 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  },

  drawPolednice(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 24 : 14;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 4;
    const legSwing = Math.sin(time * walkSpeed) * 16;
    const windFlutter = Math.sin(time * (panicked ? 24 : 16)) * (panicked ? 10 : 6);
    const sickleSwing = panicked ? -0.7 : Math.sin(time * walkSpeed) * 0.45;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 28, time);
      this.drawPanicDrops(ctx, 4, -26, time);
    }

    // 1. Shimmering midday solar mirage & heat haze waves
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const wavePhase = time * 5 + i * 2;
      const wy = -36 - i * 8 + Math.sin(wavePhase) * 3;
      ctx.strokeStyle = `rgba(245, 158, 11, ${0.28 - i * 0.08})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-18, wy);
      ctx.bezierCurveTo(-6, wy - 4, 6, wy + 4, 18, wy);
      ctx.stroke();
    }
    // Sun-ray sparkle motes
    for (let i = 0; i < 4; i++) {
      const spAng = time * 3 + (i * Math.PI) / 2;
      const spDist = 28 + Math.sin(time * 6 + i) * 6;
      ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.beginPath();
      ctx.arc(Math.cos(spAng) * spDist, -10 + Math.sin(spAng) * 12, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Bare bony legs stepping through dry wheat stubble (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -5, 12, 19);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 12, 19);
      this.drawBentLimb(ctx, -5, 12, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#E2D4C3', 3.5);
      this.drawBentLimb(ctx, 5, 12, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#E2D4C3', 3.5);
    } else {
      this.drawLimb(ctx, -5, 12, -legSwing, 22, '#E2D4C3', 3.5);
      this.drawLimb(ctx, 5, 12, legSwing, 22, '#E2D4C3', 3.5);
    }

    // 3. Flowing torn white linen shroud / dress (rozedraná bílá plachta)
    this.setupPath(ctx, '#F8FAFC', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    // Left waist and fluttering hem
    ctx.quadraticCurveTo(-18 + windFlutter * 0.5, 10, -22 + windFlutter, 30);
    // Jagged torn hem folds
    ctx.lineTo(-14 + windFlutter * 0.6, 26);
    ctx.lineTo(-6, 32);
    ctx.lineTo(2 + windFlutter * 0.3, 27);
    ctx.lineTo(12, 33);
    ctx.lineTo(20, 28);
    // Right side back up
    ctx.quadraticCurveTo(16, 8, 12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fabric fold lines (Ladovské záhyby látky)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.quadraticCurveTo(-10 + windFlutter * 0.3, 14, -12 + windFlutter * 0.6, 26);
    ctx.moveTo(4, 0);
    ctx.quadraticCurveTo(6, 15, 8, 28);
    ctx.stroke();

    // Straw stalk stuck in the belt
    ctx.strokeStyle = COLORS.mustard;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(14, 18);
    ctx.stroke();

    // 4. Gaunt neck & witchy head with peasant kerchief (loktuše / šátek)
    this.setupPath(ctx, '#E7D5C4', COLORS.ink, 2.5);
    // Wizened face profile
    ctx.beginPath();
    ctx.moveTo(2, -26);
    ctx.lineTo(11, -21); // Hooked witch nose (orlí nos)
    ctx.lineTo(5, -17);
    ctx.lineTo(9, -13); // Sharp chin (špičatá brada)
    ctx.lineTo(0, -10); // Jawline
    ctx.lineTo(-8, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Peasant headscarf wrapping the head and tied under chin
    this.setupPath(ctx, '#F1F5F9', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(-2, -22, 13, Math.PI * 0.7, Math.PI * 2.1);
    ctx.lineTo(0, -9);
    ctx.lineTo(-8, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trailing fluttering ends of the headscarf in the hot wind
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.quadraticCurveTo(-24 - windFlutter, -22, -30 - windFlutter * 1.5, -14);
    ctx.lineTo(-26 - windFlutter, -10);
    ctx.quadraticCurveTo(-18, -12, -10, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Strands of wild gray straw hair escaping the kerchief
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, -25);
    ctx.quadraticCurveTo(-2, -30, -8, -28);
    ctx.moveTo(5, -19);
    ctx.lineTo(0, -16);
    ctx.stroke();

    // Piercing burning noon-sun eye (zlaté planoucí oko)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(glanceBack ? -4 : 5, -20, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc((glanceBack ? -4 : 5) + 0.5, -20.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 5. Right arm wielding the sharp curved iron sickle (ostrý zahnutý srp)
    ctx.save();
    ctx.translate(6, -4);
    ctx.rotate(sickleSwing);

    // Bony arm
    ctx.strokeStyle = '#D6C3B0';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(12, -4);
    ctx.lineTo(20, -12);
    ctx.stroke();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Wooden sickle handle (dřevěná rukojeť)
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(17, -8);
    ctx.lineTo(25, -18);
    ctx.stroke();

    // Curved razor-sharp iron blade with gleaming edge
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(25, -18);
    // Outer crescent
    ctx.quadraticCurveTo(38, -32, 28, -44);
    // Inner razor crescent
    ctx.quadraticCurveTo(24, -30, 22, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Steel highlight on sickle tip (lesk ostří)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(27, -42);
    ctx.quadraticCurveTo(34, -32, 25, -20);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  },

  drawKlekanice(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 22 : 10;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3.5;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 28, time);
      this.drawPanicDrops(ctx, 4, -26, time);
    }

    // Scramble legs beneath the frayed cloak with high knee tuck & kick
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -5, 14, 16);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 14, 16);
      this.drawBentLimb(ctx, -5, 14, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#3F3F46', 3.5);
      this.drawBentLimb(ctx, 5, 14, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#3F3F46', 3.5);
    }

    // Dark twilight shadow aura
    ctx.save();
    ctx.shadowColor = 'rgba(76, 29, 149, 0.45)';
    ctx.shadowBlur = 14;

    // Dark wrinkled burlap sack over hunched back (pytel na zlobivé děti)
    this.setupPath(ctx, '#5C4033', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(-16, 2, 14, 18, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hemp tying rope on sack
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-12, -4);
    ctx.stroke();

    // Shrouded dark cloak with frayed bottom
    this.setupPath(ctx, '#262626', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.quadraticCurveTo(-18, 10, -18, 28);
    ctx.lineTo(-8, 25);
    ctx.lineTo(0, 29);
    ctx.lineTo(10, 24);
    ctx.lineTo(16, 27);
    ctx.quadraticCurveTo(14, 8, 10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deep shadowy cowl / hood
    this.setupPath(ctx, '#171717', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -19, 13, Math.PI * 0.6, Math.PI * 2.2);
    ctx.lineTo(2, -7);
    ctx.lineTo(-10, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gaunt pale face in hood shadow
    this.setupPath(ctx, '#D4D4D8', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(2, -18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing sinister twilight-amber eyes
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(glanceBack ? -3 : 5, -19, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Swinging wooden church bell at belt (clattering furiously in panic)
    ctx.save();
    ctx.translate(8, 6);
    ctx.rotate(Math.sin(time * (panicked ? 26 : 6)) * (panicked ? 0.7 : 0.35));
    this.setupPath(ctx, '#B45309', COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.lineTo(6, 4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
    ctx.restore();
  },

  drawCert(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean, isBoss = false) {
    const dir = vx < 0 ? -1 : 1;
    const scale = isBoss ? 2.3 : 1.25;
    const bounce = Math.sin(time * (panicked ? 22 : 9)) * (isBoss ? 5 : 3.5);
    const legSwing = Math.sin(time * (panicked ? 22 : 11)) * (isBoss ? 16 : 10);
    const tailWhip = Math.sin(time * (panicked ? 28 : 12)) * (panicked ? 24 : 18);

    ctx.save();
    ctx.translate(x, y + bounce);
    ctx.scale(dir * scale, scale);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -10, 30, time);
      this.drawPanicDrops(ctx, 4, -28, time);
    }

    // Boss demonic aura & ember glow
    if (isBoss) {
      ctx.save();
      ctx.shadowColor = '#DC2626';
      ctx.shadowBlur = 22;
      // Brimstone smoke puff beneath hooves
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 24, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Long curled devil's tail with arrow barb (čertovský ocas s ostnem)
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = isBoss ? 4.5 : 3.2;
    ctx.beginPath();
    const barbY = panicked ? -26 + Math.sin(time * 28) * 6 : -12 + tailWhip * 0.8;
    ctx.moveTo(-8, 4);
    ctx.quadraticCurveTo(-26, tailWhip, -32, barbY);
    ctx.stroke();

    // Red spade tail tip
    this.setupPath(ctx, '#DC2626', COLORS.ink, 2);
    ctx.beginPath();
    const tipX = -32;
    const tipY = barbY;
    ctx.moveTo(tipX, tipY - 8);
    ctx.lineTo(tipX + 6, tipY + 4);
    ctx.lineTo(tipX - 7, tipY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Legs with cloven hooves (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -7, 8, 20);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 7, 8, 20);
      this.drawBentLimb(ctx, -7, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#27272A', isBoss ? 7 : 5);
      this.drawBentLimb(ctx, 7, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#27272A', isBoss ? 7 : 5);
      this.setupPath(ctx, '#71717A', COLORS.ink, 1.8);
      ctx.beginPath();
      ctx.rect(leg1.fx - 4, leg1.fy - 2, 7, 4);
      ctx.rect(leg2.fx - 4, leg2.fy - 2, 7, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      this.drawLimb(ctx, -7, 8, -legSwing, 23, '#27272A', isBoss ? 7 : 5);
      this.drawLimb(ctx, 7, 8, legSwing, 23, '#27272A', isBoss ? 7 : 5);
      this.setupPath(ctx, '#71717A', COLORS.ink, 1.8);
      ctx.beginPath();
      ctx.rect(-10, 28 - legSwing * 0.2, 7, 4);
      ctx.rect(4, 28 + legSwing * 0.2, 7, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Shaggy black sheepskin fur body (huňatý kožich)
    this.setupPath(ctx, '#18181B', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Embroidered scarlet village vest with brass buttons (červená vestička s knoflíky)
    this.setupPath(ctx, '#DC2626', COLORS.ink, 2.4);
    ctx.beginPath();
    ctx.moveTo(-11, -9);
    ctx.lineTo(-15, 9);
    ctx.lineTo(15, 9);
    ctx.lineTo(11, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brass buttons on vest
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -4, 2, 0, Math.PI * 2);
    ctx.arc(0, 1, 2, 0, Math.PI * 2);
    ctx.arc(0, 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Devil arms waving overhead in panic
    if (panicked) {
      const armShudder = Math.sin(time * 30) * 5;
      this.drawBentLimb(ctx, -10, -5, -16, -18 + armShudder, -20, -28 + armShudder, '#27272A', 4.5);
      this.drawBentLimb(ctx, 10, -5, 16, -18 - armShudder, 20, -28 - armShudder, '#27272A', 4.5);
    }

    // Devil's head with scruffy muzzle
    this.setupPath(ctx, '#27272A', COLORS.ink, 3);
    ctx.beginPath();
    ctx.arc(0, -19, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Long curling red tongue sticking out cheekily (mlsounský čertovský jazyk)
    ctx.save();
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const tongueWobble = Math.sin(time * (panicked ? 24 : 14)) * (panicked ? 5 : 3);
    ctx.moveTo(6, -15);
    ctx.quadraticCurveTo(14, -13 + tongueWobble, 18, -8 + tongueWobble);
    ctx.quadraticCurveTo(15, -6 + tongueWobble, 6, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Ridged curved ram horns (zakroucené rohy s vroubky)
    this.setupPath(ctx, '#FEF08A', COLORS.ink, 2.5);
    // Left horn
    ctx.beginPath();
    ctx.moveTo(-4, -29);
    ctx.quadraticCurveTo(-18, -44, -7, -48);
    ctx.quadraticCurveTo(-2, -40, 2, -29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(4, -29);
    ctx.quadraticCurveTo(18, -44, 9, -48);
    ctx.quadraticCurveTo(3, -40, 0, -29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fiery glowing eyes (looks back in terror)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(glanceBack ? -4 : 4, -21, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc((glanceBack ? -4 : 4) + 0.5, -21.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Boss Blacksmith Pitchfork (kované vidle s planoucími hroty)
    if (isBoss && !panicked) {
      ctx.save();
      // Wooden shaft
      ctx.strokeStyle = COLORS.woodDark;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(14, 20);
      ctx.lineTo(26, -26);
      ctx.stroke();

      // Forged iron base
      this.setupPath(ctx, '#3F3F46', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.moveTo(20, -26);
      ctx.lineTo(32, -26);
      ctx.lineTo(26, -30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3 Glowing hot iron tines (žhavé hroty)
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Center tine
      ctx.moveTo(26, -30);
      ctx.lineTo(28, -44);
      // Left tine
      ctx.moveTo(21, -26);
      ctx.lineTo(19, -40);
      // Right tine
      ctx.moveTo(31, -26);
      ctx.lineTo(35, -40);
      ctx.stroke();

      // Embers floating off the fork tines
      for (let i = 0; i < 3; i++) {
        const emberAng = time * 8 + i * 2;
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(26 + Math.cos(emberAng) * 8, -38 + Math.sin(emberAng) * 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
  },

  drawHejkal(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const scale = 2.5;
    const runSpeed = panicked ? 18 : 6;
    const bob = Math.sin(time * runSpeed) * (panicked ? 5 : 3.5);
    const legSwing = Math.sin(time * (panicked ? 20 : 7)) * 12;
    const rustle = Math.sin(time * (panicked ? 20 : 10)) * 6;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir * scale, scale);
    if (panicked) {
      ctx.rotate(0.10);
      this.drawRunDust(ctx, -12, 32, time);
      this.drawPanicDrops(ctx, 4, -30, time);
    }

    // Deep forest ambient moss-green shadow
    ctx.save();
    ctx.shadowColor = '#15803D';
    ctx.shadowBlur = 24;

    // Gnarly tree-trunk root legs (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.2;
      const leg1 = this.getRunLegCycle(legPhase, -9, 8, 22);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 9, 8, 22);
      this.drawBentLimb(ctx, -9, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#3E2723', 8.5);
      this.drawBentLimb(ctx, 9, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#3E2723', 8.5);
    } else {
      this.drawLimb(ctx, -9, 8, -legSwing, 26, '#3E2723', 8.5);
      this.drawLimb(ctx, 9, 8, legSwing, 26, '#3E2723', 8.5);
    }

    // Massive mossy oak trunk torso with deep bark fissures
    this.setupPath(ctx, '#2E4C23', COLORS.ink, 3.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bark crevices & texture lines (vrásčitá kůra)
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-6, 8);
    ctx.moveTo(4, -8);
    ctx.lineTo(8, 12);
    ctx.moveTo(-2, -14);
    ctx.lineTo(2, 6);
    ctx.stroke();

    // Hanging Spanish moss & lichen beard (plnovous z lišejníku)
    this.setupPath(ctx, '#4D7C0F', COLORS.ink, 2.2);
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.quadraticCurveTo(-16, 12, -8 + rustle, 20);
    ctx.lineTo(0, 16);
    ctx.quadraticCurveTo(8 + rustle, 18, 12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Massive knobby wooden club (carried over back in retreat when panicked)
    ctx.save();
    ctx.strokeStyle = '#422006';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(10, 10);
      ctx.lineTo(-24, -30);
    } else {
      ctx.moveTo(14, 14);
      ctx.lineTo(30, -28);
    }
    ctx.stroke();
    // Iron spike studs on club
    ctx.fillStyle = '#71717A';
    ctx.beginPath();
    if (panicked) {
      ctx.arc(-22, -28, 2.2, 0, Math.PI * 2);
      ctx.arc(-18, -22, 2.2, 0, Math.PI * 2);
    } else {
      ctx.arc(28, -26, 2.2, 0, Math.PI * 2);
      ctx.arc(25, -20, 2.2, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    // Ancient wooden head with wide roaring maw
    this.setupPath(ctx, '#3E2723', COLORS.ink, 3.2);
    ctx.beginPath();
    ctx.arc(0, -20, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Open roaring mouth emitting acoustic tremor rings (zahejkání)
    ctx.fillStyle = '#14532D';
    ctx.beginPath();
    ctx.ellipse(5, -16, panicked ? 6 : 5, panicked ? 6 : 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Branching oak antlers with rustling autumn leaves (dubové paroží s listím)
    this.setupPath(ctx, '#27170E', COLORS.ink, 2.8);
    // Left branch
    ctx.beginPath();
    ctx.moveTo(-5, -32);
    ctx.lineTo(-14, -46);
    ctx.lineTo(-24, -43);
    ctx.moveTo(-14, -46);
    ctx.lineTo(-11, -54);
    ctx.stroke();
    // Right branch
    ctx.beginPath();
    ctx.moveTo(5, -32);
    ctx.lineTo(14, -46);
    ctx.lineTo(24, -43);
    ctx.moveTo(14, -46);
    ctx.lineTo(11, -54);
    ctx.stroke();

    // Sprouting green and golden oak leaves on branches
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.ellipse(-22, -43, 4, 2.5, 0.4, 0, Math.PI * 2);
    ctx.ellipse(22, -43, 4, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.ellipse(-10, -54, 4, 2.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(10, -54, 4, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Glowing ancient timberland eyes
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(glanceBack ? -5 : 5, -22, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  },

  drawObr(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const scale = 2.9;
    const runSpeed = panicked ? 16 : 4;
    const bob = Math.sin(time * runSpeed) * (panicked ? 4 : 3);
    const legSwing = Math.sin(time * (panicked ? 16 : 5)) * 8;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir * scale, scale);
    if (panicked) {
      ctx.rotate(0.08);
      this.drawRunDust(ctx, -14, 34, time);
      this.drawPanicDrops(ctx, 6, -34, time);
    }

    // Heavy earth tremor shadow
    ctx.save();
    ctx.shadowColor = '#D97706';
    ctx.shadowBlur = 20;

    // Colossal stone pillar legs (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 2.8;
      const leg1 = this.getRunLegCycle(legPhase, -10, 8, 24);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 10, 8, 24);
      this.drawBentLimb(ctx, -10, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#52525B', 10);
      this.drawBentLimb(ctx, 10, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#52525B', 10);
    } else {
      this.drawLimb(ctx, -10, 8, -legSwing, 28, '#52525B', 10);
      this.drawLimb(ctx, 10, 8, legSwing, 28, '#52525B', 10);
    }

    // Massive granite river-boulder torso
    this.setupPath(ctx, '#71717A', COLORS.ink, 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Giant stone toddler arms flailing overhead in terror
    if (panicked) {
      const armWave = Math.sin(time * 20) * 6;
      this.drawBentLimb(ctx, -18, -4, -26, -20 + armWave, -28, -36 + armWave, '#52525B', 8);
      this.drawBentLimb(ctx, 18, -4, 26, -20 - armWave, 28, -36 - armWave, '#52525B', 8);
    }

    // Chiseled Slavic earth runes on chest (svítící prastaré runy)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(0, 4);
    ctx.lineTo(8, -4);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // Alpine pine seedling and river moss on broad shoulders
    this.setupPath(ctx, '#15803D', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(-16, -14, 8, 0, Math.PI * 2);
    ctx.arc(16, -14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Little spruce tree on left shoulder
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(-16, -26);
    ctx.lineTo(-20, -18);
    ctx.lineTo(-12, -18);
    ctx.closePath();
    ctx.fill();

    // Giant carved stone head with boulder brow
    this.setupPath(ctx, '#52525B', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.arc(0, -23, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Heavy craggy stone brow ridge
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-12, -26);
    ctx.lineTo(12, -26);
    ctx.stroke();

    // Glowing amber crystal rune eye
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(6, -23, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
    const hop = Math.abs(Math.sin(time * (panicked ? 20 : 10))) * (panicked ? 9 : 4);
    const dir = vx < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.14);
      this.drawRunDust(ctx, -8, 12, time);
      this.drawPanicDrops(ctx, 4, -10, time);
    }

    // Frog legs kicking and tucking with multi-frame cycle
    if (panicked) {
      const legPhase = time * 3.5;
      const leg1 = this.getRunLegCycle(legPhase, -4, 4, 14);
      const leg2 = this.getRunLegCycle(legPhase + 0.4, 4, 4, 14);
      this.drawBentLimb(ctx, -4, 4, leg1.kx - 4, leg1.ky - 2, leg1.fx, leg1.fy, COLORS.green, 3);
      this.drawBentLimb(ctx, 4, 4, leg2.kx - 4, leg2.ky - 2, leg2.fx, leg2.fy, COLORS.green, 3);
    } else {
      this.drawBentLimb(ctx, -6, 2, -10, 8, -6, 12, COLORS.green, 3);
      this.drawBentLimb(ctx, 6, 2, 2, 8, 6, 12, COLORS.green, 3);
    }

    this.setupPath(ctx, COLORS.green, COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes with terror pupils when panicked
    ctx.beginPath();
    ctx.ellipse(-8, -7, 4, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -7, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.arc(glanceBack ? -10 : -7, -7, panicked ? 1.5 : 2, 0, Math.PI * 2);
    ctx.arc(glanceBack ? 6 : 9, -7, panicked ? 1.5 : 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
  drawZmrzlik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawRarach(ctx, x, y, time, vx, panicked);
  },
  drawSkodnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const runSpeed = panicked ? 26 : 16;
    const bob = Math.abs(Math.sin(time * runSpeed)) * 4;
    const tailSway = Math.sin(time * 20) * (panicked ? 14 : 8);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -10, 16, time);
      this.drawPanicDrops(ctx, 4, -16, time);
    }

    // Running little paws
    if (panicked) {
      const pPhase = time * 4.2;
      const leg1 = this.getRunLegCycle(pPhase, -4, 6, 10);
      const leg2 = this.getRunLegCycle(pPhase + 0.5, 4, 6, 10);
      this.drawBentLimb(ctx, -4, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#C2410C', 2.5);
      this.drawBentLimb(ctx, 4, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#C2410C', 2.5);
    }

    // Fluffy squirrel tail streaming behind in speed
    this.setupPath(ctx, '#C2410C', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    const tailEndX = panicked ? -26 : -14;
    const tailEndY = panicked ? -10 + tailSway : -26 + tailSway;
    ctx.quadraticCurveTo(-22, -12 + tailSway, tailEndX, tailEndY);
    ctx.quadraticCurveTo(-8, -20, -6, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red-brown squirrel body
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White belly
    ctx.fillStyle = '#FFEDD5';
    ctx.beginPath();
    ctx.ellipse(3, 2, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head with pointed tufted ears
    this.setupPath(ctx, '#C2410C', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(6, -12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Ear tufts (pinned back when running)
    ctx.beginPath();
    ctx.moveTo(panicked ? 2 : 5, -18);
    ctx.lineTo(panicked ? 4 : 8, -25);
    ctx.lineTo(panicked ? 8 : 11, -17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dropping or clutching spruce cone
    if (!panicked) {
      this.setupPath(ctx, '#78350F', COLORS.ink, 1.8);
      ctx.beginPath();
      ctx.ellipse(12, -4, 4, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Shiny black bead eye (looks back in terror)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? 2 : 8, -13, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawMysak(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const runSpeed = panicked ? 28 : 16;
    const bob = Math.abs(Math.sin(time * runSpeed)) * 3;
    const tailWiggle = Math.sin(time * 25) * (panicked ? 12 : 8);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 12, time);
      this.drawPanicDrops(ctx, 4, -10, time);
    }

    // Running little mouse feet
    if (panicked) {
      const pPhase = time * 4.5;
      const leg1 = this.getRunLegCycle(pPhase, -4, 4, 8);
      const leg2 = this.getRunLegCycle(pPhase + 0.5, 4, 4, 8);
      this.drawBentLimb(ctx, -4, 4, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#F472B6', 2);
      this.drawBentLimb(ctx, 4, 4, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#F472B6', 2);
    }

    // Long pink curved mouse tail streaming behind
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.quadraticCurveTo(-18, tailWiggle, panicked ? -30 : -24, -2 + tailWiggle);
    ctx.stroke();

    // Plump grey mouse body
    this.setupPath(ctx, '#94A3B8', COLORS.ink, 2.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Snout and head
    ctx.beginPath();
    ctx.ellipse(8, -4, 8, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Round ears with pink inside (pinned back in sprint)
    this.setupPath(ctx, '#F472B6', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(panicked ? 2 : 4, -11, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beady black eye & pink nose (looks back in terror)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? 4 : 10, -5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(15, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawSkeletonScythe(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 22 : 11;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 25, time);
      this.drawPanicDrops(ctx, 4, -28, time);
    }

    // Bare skeletal legs (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -5, 6, 20);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 6, 20);
      this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.bone, 4);
      this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.bone, 4);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 14;
      this.drawLimb(ctx, -5, 6, -legSwing, 24, COLORS.bone, 4);
      this.drawLimb(ctx, 5, 6, legSwing, 24, COLORS.bone, 4);
    }

    // Ragged dark burlap shroud (potrhaný rubáš)
    this.setupPath(ctx, '#334155', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(-15, 18);
    ctx.lineTo(15, 18);
    ctx.lineTo(10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Visible ribcage through tears
    this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-6, -6 + i * 5);
      ctx.lineTo(6, -6 + i * 5);
      ctx.stroke();
    }

    // Skeletal arms: in panic, one arm waves frantically overhead, other drags scythe behind
    if (panicked) {
      const armShudder = Math.sin(time * 30) * 4;
      this.drawBentLimb(ctx, -6, -10, -14, -22 + armShudder, -18, -32 + armShudder, COLORS.bone, 3.5);
    }

    // Skull with dark eye sockets
    this.setupPath(ctx, COLORS.bone, COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -22, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Dropping jaw when panicked
    ctx.beginPath();
    ctx.rect(-5, panicked ? -12 : -14, 10, panicked ? 7 : 5);
    ctx.fill();
    ctx.stroke();

    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -3 : 3, -23, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Scythe: carried menacingly or dragged behind on ground in panic retreat
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(8, 4);
      ctx.lineTo(-24, 22);
    } else {
      ctx.moveTo(10, 16);
      ctx.lineTo(18, -28);
    }
    ctx.stroke();

    // Curved scythe blade
    this.setupPath(ctx, '#94A3B8', COLORS.ink, 2.2);
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(-24, 22);
      ctx.quadraticCurveTo(-40, 26, -38, 14);
      ctx.quadraticCurveTo(-30, 20, -24, 22);
    } else {
      ctx.moveTo(18, -28);
      ctx.quadraticCurveTo(34, -36, 32, -48);
      ctx.quadraticCurveTo(24, -36, 18, -28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },

  drawUmrlec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 20 : 8;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 2.5;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.25, 1.25);
    if (panicked) {
      ctx.rotate(0.10);
      this.drawRunDust(ctx, -10, 26, time);
      this.drawPanicDrops(ctx, 4, -26, time);
    }

    // Heavy dragging legs (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.4;
      const leg1 = this.getRunLegCycle(legPhase, -6, 6, 19);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 6, 6, 19);
      this.drawBentLimb(ctx, -6, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#CBD5E1', 5);
      this.drawBentLimb(ctx, 6, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#CBD5E1', 5);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 8;
      this.drawLimb(ctx, -6, 6, -legSwing, 22, '#CBD5E1', 5);
      this.drawLimb(ctx, 6, 6, legSwing, 22, '#CBD5E1', 5);
    }

    // Burial shroud wrapped around heavy corpse (hrobový rubáš)
    this.setupPath(ctx, '#E2E8F0', COLORS.ink, 3.2);
    ctx.beginPath();
    ctx.ellipse(0, 2, 17, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flailing swollen wrapped arms in panic
    if (panicked) {
      const armWave = Math.sin(time * 24) * 6;
      this.drawBentLimb(ctx, -10, -4, -18, -18 + armWave, -22, -28 + armWave, '#CBD5E1', 5);
      this.drawBentLimb(ctx, 10, -4, 18, -18 - armWave, 22, -28 - armWave, '#CBD5E1', 5);
    }

    // Binding funerary ribbons (obvazy a stuhy streaming behind)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(panicked ? -26 : 14, 2);
    ctx.moveTo(-15, 6);
    ctx.lineTo(panicked ? -28 : 13, 14);
    ctx.stroke();

    // Bloated head with blank dead eyes
    this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -20, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hollow milky eyes (looks back in panic)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(glanceBack ? -4 : 4, -21, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  },

  drawPisar(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 24 : 12;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.1, 1.1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 25, time);
      this.drawPanicDrops(ctx, 4, -30, time);
    }

    // Legs in black stockings (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -5, 6, 18);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 6, 18);
      this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#0F172A', 4);
      this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#0F172A', 4);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 12;
      this.drawLimb(ctx, -5, 6, -legSwing, 22, '#0F172A', 4);
      this.drawLimb(ctx, 5, 6, legSwing, 22, '#0F172A', 4);
    }

    // Ink-stained scribe coat (písařský frak se skvrnami od inkoustu)
    this.setupPath(ctx, '#1E293B', COLORS.ink, 2.8);
    ctx.beginPath();
    ctx.moveTo(-11, -8);
    ctx.lineTo(panicked ? -22 : -14, 18);
    ctx.lineTo(14, 18);
    ctx.lineTo(11, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ink bottle at belt (dripping ink when running)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(8, 6, 6, 8);
    if (panicked) {
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(12 + Math.sin(time * 20) * 4, 18 + ((time * 15) % 10), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arms: clutching powdered wig so it doesn't fly off!
    if (panicked) {
      this.drawBentLimb(ctx, -8, -6, -14, -20, -4, -32, '#1E293B', 4);
      // Other arm flailing with quill pen
      const quillSwing = Math.sin(time * 28) * 8;
      this.drawLimb(ctx, 8, -6, 18, 10 + quillSwing, '#1E293B', 4);
    }

    // Skeletal head with powdered wig (pudrovaná paruka)
    this.setupPath(ctx, '#F1F5F9', COLORS.ink, 2.2);
    ctx.beginPath();
    ctx.arc(-2, -23, 11, Math.PI * 0.7, Math.PI * 2.3);
    ctx.fill();
    ctx.stroke();

    // Skull face
    this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(2, -20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Quill pen in hand (husí brko k psaní)
    if (!panicked) {
      ctx.save();
      ctx.translate(10, 2);
      ctx.rotate(Math.sin(time * 8) * 0.4);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, -14);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },

  drawHrobnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 22 : 10;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.2, 1.2);
    if (panicked) {
      ctx.rotate(0.11);
      this.drawRunDust(ctx, -8, 25, time);
      this.drawPanicDrops(ctx, 4, -30, time);
    }

    // Mud-caked boots (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -6, 6, 18);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 6, 6, 18);
      this.drawBentLimb(ctx, -6, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#451A03', 5.5);
      this.drawBentLimb(ctx, 6, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#451A03', 5.5);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 10;
      this.drawLimb(ctx, -6, 6, -legSwing, 22, '#451A03', 5.5);
      this.drawLimb(ctx, 6, 6, legSwing, 22, '#451A03', 5.5);
    }

    // Hunched mud-stained topcoat
    this.setupPath(ctx, '#78350F', COLORS.ink, 3);
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(panicked ? -22 : -16, 18);
    ctx.lineTo(14, 18);
    ctx.lineTo(10, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arms: holding hat brim and carrying shovel in retreat
    if (panicked) {
      this.drawBentLimb(ctx, -8, -6, -14, -20, -4, -30, '#78350F', 5);
      this.drawLimb(ctx, 8, -6, -16, 12, '#78350F', 5);
    }

    // Weathered head with clay streaks
    this.setupPath(ctx, '#D6C7B2', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Battered gravedigger's cylinder hat (otlučený cylindr)
    this.setupPath(ctx, '#1C1917', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.rect(-10, -28, 20, 4); // Brim
    ctx.rect(-6, -38, 12, 10); // Crown
    ctx.fill();
    ctx.stroke();

    // Iron spade / shovel (carried over back in panic retreat)
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(4, 4);
      ctx.lineTo(-24, -18);
    } else {
      ctx.moveTo(8, 16);
      ctx.lineTo(20, -20);
    }
    ctx.stroke();
    // Iron spade blade
    this.setupPath(ctx, '#71717A', COLORS.ink, 2);
    ctx.beginPath();
    if (panicked) {
      ctx.rect(-30, -24, 12, 10);
    } else {
      ctx.rect(14, -28, 12, 10);
    }
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  },
  drawHromotluk(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawBubak(ctx, x, y, time, vx, panicked);
  },
  drawStodolnik(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawBubak(ctx, x, y, time, vx, panicked);
  },
  drawCernyPes(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const runSpeed = panicked ? 28 : 18;
    const bob = Math.abs(Math.sin(time * runSpeed)) * 4;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.25, 1.25);
    if (panicked) {
      ctx.rotate(0.10);
      this.drawRunDust(ctx, -14, 20, time);
      this.drawPanicDrops(ctx, 10, -18, time);
    }

    // Black dog legs running fast (multi-frame high knee tuck & kick)
    if (panicked) {
      const pPhase = time * 4.2;
      const leg1 = this.getRunLegCycle(pPhase, -9, 4, 15);
      const leg2 = this.getRunLegCycle(pPhase + 0.45, 9, 4, 15);
      this.drawBentLimb(ctx, -9, 4, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#18181B', 4.5);
      this.drawBentLimb(ctx, 9, 4, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#18181B', 4.5);
    } else {
      const legSwing = Math.sin(time * runSpeed) * 15;
      this.drawLimb(ctx, -9, 4, -legSwing, 18, '#18181B', 4.5);
      this.drawLimb(ctx, 9, 4, legSwing, 18, '#18181B', 4.5);
    }

    // Sleek black body with raised hackles
    this.setupPath(ctx, '#18181B', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black bushy tail (streaming straight behind in high-speed panic)
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    if (panicked) {
      const tailWag = Math.sin(time * 26) * 5;
      ctx.quadraticCurveTo(-28, -6 + tailWag, -32, -2 + tailWag);
    } else {
      ctx.quadraticCurveTo(-26, -14, -20, -20);
    }
    ctx.stroke();

    // Snarling wolf/dog head
    this.setupPath(ctx, '#18181B', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(12, -6, 10, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pointed ears (pinned back in sprint)
    ctx.beginPath();
    ctx.moveTo(panicked ? 4 : 8, -12);
    ctx.lineTo(panicked ? 7 : 11, panicked ? -16 : -21);
    ctx.lineTo(panicked ? 12 : 15, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fiery glowing red eyes (looks back in terror)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(glanceBack ? 6 : 14, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // White fangs & lolling tongue when running
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(18, -3);
    ctx.lineTo(21, 0);
    ctx.lineTo(19, 0);
    ctx.closePath();
    ctx.fill();

    if (panicked) {
      // Lolling pink tongue in exhaustion/panic
      ctx.fillStyle = '#F472B6';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(18, 3, 3, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  },
  drawVodnicek(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 22 : 12;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.05, 1.05);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -8, 24, time);
      this.drawPanicDrops(ctx, 4, -28, time);
    }

    // Red water-boots (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -5, 6, 17);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 6, 17);
      this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#DC2626', 4);
      this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#DC2626', 4);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 11;
      this.drawLimb(ctx, -5, 6, -legSwing, 20, '#DC2626', 4);
      this.drawLimb(ctx, 5, 6, legSwing, 20, '#DC2626', 4);
    }

    // Green hastrman coat with dripping coattails
    this.setupPath(ctx, '#16A34A', COLORS.ink, 2.6);
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(panicked ? -22 : -14, 16);
    ctx.lineTo(14, 16);
    ctx.lineTo(10, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arms: holding hat in place so wind doesn't blow it away
    if (panicked) {
      this.drawBentLimb(ctx, -6, -4, -12, -18, -2, -26, '#16A34A', 3.5);
    }

    // Dripping water droplets from coat
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-10, 20 + Math.sin(time * 8) * 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Green skin boy face & red cap
    this.setupPath(ctx, '#86EFAC', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Little red hat (červená čepička s pentlí)
    this.setupPath(ctx, '#DC2626', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -21, 9, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye looking back in panic
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -3 : 3, -16, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
  drawTopivec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    this.drawHastrman(ctx, x, y, time, vx, panicked);
  },
  drawBlatouch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const bob = Math.sin(time * (panicked ? 20 : 8)) * (panicked ? 5 : 4);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(dir, 1);
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -6, 20, time);
      this.drawPanicDrops(ctx, 4, -18, time);
      // Little leafy scamper legs
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -4, 8, 12);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 4, 8, 12);
      this.drawBentLimb(ctx, -4, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#65A30D', 3);
      this.drawBentLimb(ctx, 4, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#65A30D', 3);
    }

    // Green leaf coat
    this.setupPath(ctx, '#65A30D', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 4, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Round sprite face
    this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden marsh-marigold blossom cap (zlatý květ blatouchu)
    this.setupPath(ctx, '#FBBF24', COLORS.ink, 2.2);
    for (let i = 0; i < 5; i++) {
      const pAng = (i / 5) * Math.PI - Math.PI;
      const petalWobble = panicked ? Math.sin(time * 24 + i) * 2 : 0;
      ctx.beginPath();
      ctx.ellipse(Math.cos(pAng) * 7, -18 + Math.sin(pAng) * 5 + petalWobble, 5, 7, pAng, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Eye looking back in terror
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -3 : 3, -10, panicked ? 2.5 : 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
    const dir = vx < 0 ? -1 : 1;
    const danceSpeed = panicked ? 24 : 12;
    const bob = Math.abs(Math.sin(time * danceSpeed)) * 6;
    const spinTilt = panicked ? 0.12 : Math.sin(time * 6) * 0.12;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir, 1);
    ctx.rotate(spinTilt);
    if (panicked) {
      this.drawRunDust(ctx, -8, 24, time);
      this.drawPanicDrops(ctx, 4, -26, time);
    }

    // Forest motes & swirling green leaf pollen
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const pAng = time * 4 + (i * Math.PI) / 2;
      const pDist = 20 + Math.sin(time * 5 + i) * 6;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(250, 204, 21, 0.5)';
      ctx.beginPath();
      ctx.arc(Math.cos(pAng) * pDist, Math.sin(pAng) * 15, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Bare running feet (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.8;
      const leg1 = this.getRunLegCycle(legPhase, -5, 8, 18);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 5, 8, 18);
      this.drawBentLimb(ctx, -5, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#F5D0C5', 3.5);
      this.drawBentLimb(ctx, 5, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#F5D0C5', 3.5);
    } else {
      const legSwing = Math.sin(time * danceSpeed) * 14;
      this.drawLimb(ctx, -5, 8, -legSwing, 20, '#F5D0C5', 3.5);
      this.drawLimb(ctx, 5, 8, legSwing, 20, '#F5D0C5', 3.5);
    }

    // Moss-green swirling fairy dress
    this.setupPath(ctx, '#2E6930', COLORS.ink, 2.8);
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.quadraticCurveTo(-18, 8, -18 + Math.sin(time * 10) * 5, 24);
    ctx.lineTo(-6, 21);
    ctx.lineTo(0, 25);
    ctx.lineTo(8, 20);
    ctx.quadraticCurveTo(18 + Math.sin(time * 10) * 5, 12, 10, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fern apron / floral ribbon
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(6, 12);
    ctx.moveTo(4, -2);
    ctx.lineTo(-4, 14);
    ctx.stroke();

    // Arms waving overhead in panic
    if (panicked) {
      const armWave = Math.sin(time * 26) * 6;
      this.drawBentLimb(ctx, -8, -6, -14, -18 + armWave, -18, -28 + armWave, '#FCE7D6', 3);
      this.drawBentLimb(ctx, 8, -6, 14, -18 - armWave, 18, -28 - armWave, '#FCE7D6', 3);
    }

    // Head and sweet yet eerie face
    this.setupPath(ctx, '#FCE7D6', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flowing wild chestnut hair
    this.setupPath(ctx, '#78350F', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, -20, 11, Math.PI * 0.8, Math.PI * 2.2);
    ctx.quadraticCurveTo(-14, -8, -16 + Math.sin(time * 8) * 4, 4);
    ctx.lineTo(-10, 0);
    ctx.quadraticCurveTo(-6, -10, 0, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flower & fern wreath on head (věnec z lučního kvítí a kapradí)
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-4, -26, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -26, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, -28, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Emerald captivating eyes (looks back in panic)
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(glanceBack ? -3 : 3, -18, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
  drawBludicka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const bob = Math.sin(time * (panicked ? 14 : 6)) * (panicked ? 8 : 6);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.shadowColor = panicked ? '#F97316' : COLORS.water;
    ctx.shadowBlur = panicked ? 22 : 15;
    ctx.fillStyle = panicked ? 'rgba(239, 68, 68, 0.95)' : 'rgba(217, 160, 54, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, panicked ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();

    // Trailing panic spark motes
    if (panicked) {
      for (let i = 0; i < 3; i++) {
        const pt = (time * 5 + i * 0.33) % 1;
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(-12 - pt * 20, Math.sin(time * 10 + i) * 6, 2 - pt, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },
  drawDrevorubec(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
    const dir = vx < 0 ? -1 : 1;
    const walkSpeed = panicked ? 22 : 10;
    const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(dir * 1.3, 1.3);
    if (panicked) {
      ctx.rotate(0.11);
      this.drawRunDust(ctx, -8, 26, time);
      this.drawPanicDrops(ctx, 4, -28, time);
    }

    // Sturdy work boots (multi-frame high knee tuck & kick)
    if (panicked) {
      const legPhase = time * 3.6;
      const leg1 = this.getRunLegCycle(legPhase, -7, 6, 20);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 7, 6, 20);
      this.drawBentLimb(ctx, -7, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#3E2723', 6);
      this.drawBentLimb(ctx, 7, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#3E2723', 6);
    } else {
      const legSwing = Math.sin(time * walkSpeed) * 11;
      this.drawLimb(ctx, -7, 6, -legSwing, 23, '#3E2723', 6);
      this.drawLimb(ctx, 7, 6, legSwing, 23, '#3E2723', 6);
    }

    // Rustic flannel shirt & vest
    this.setupPath(ctx, '#B91C1C', COLORS.ink, 3);
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head with bushy beard and woodsman cap
    this.setupPath(ctx, '#D97706', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.arc(0, -20, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Woodsman's broadaxe (carried back in panic retreat)
    ctx.strokeStyle = COLORS.woodDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(8, 8);
      ctx.lineTo(-20, -24);
    } else {
      ctx.moveTo(12, 12);
      ctx.lineTo(24, -26);
    }
    ctx.stroke();
    // Broadaxe head
    this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2);
    ctx.beginPath();
    if (panicked) {
      ctx.moveTo(-18, -26);
      ctx.lineTo(-30, -32);
      ctx.lineTo(-30, -18);
    } else {
      ctx.moveTo(22, -28);
      ctx.lineTo(34, -34);
      ctx.lineTo(34, -20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye looking back in terror
    const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath();
    ctx.arc(glanceBack ? -4 : 4, -21, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
    if (panicked) {
      ctx.rotate(0.12);
      this.drawRunDust(ctx, -14, 38, time);
      this.drawPanicDrops(ctx, 6, -34, time);
    }

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

    // 4. Sturdy Miller Legs & Heavy Boots (Pomoučené holínky s vícefázovým během)
    if (panicked) {
      const legPhase = time * 3.4;
      const leg1 = this.getRunLegCycle(legPhase, -7, 18, 20);
      const leg2 = this.getRunLegCycle(legPhase + 0.5, 7, 18, 20);
      this.drawBentLimb(ctx, -7, 18, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#2D1B0F', 9);
      this.drawBentLimb(ctx, 7, 18, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#2D1B0F', 9);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(leg1.fx, leg1.fy, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(leg2.fx, leg2.fy, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.drawLimb(ctx, -7, 18, -8 - legSwing * 0.45, 36, '#2D1B0F', 9);
      this.drawLimb(ctx, 7, 18, 8 + legSwing * 0.45, 36, '#2D1B0F', 9);
      // Flour dusting on boot tips
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-8 - legSwing * 0.45, 36, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(8 + legSwing * 0.45, 36, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

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
      // Wide startled eyes glancing backward in panic
      const glanceBack = Math.sin(time * 3.5) > 0.6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(glanceBack ? -7 : -3, -13, 4, 0, Math.PI * 2);
      ctx.arc(glanceBack ? 3 : 7, -13, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(glanceBack ? -8 : -2, -13, 1.8, 0, Math.PI * 2);
      ctx.arc(glanceBack ? 2 : 8, -13, 1.8, 0, Math.PI * 2);
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

    // In panic: arm clutching cap so it doesn't fly off in the rush
    if (panicked) {
      this.drawBentLimb(ctx, -10, 4, -18, -14, -10, -26, '#5A3418', 6);
      this.setupPath(ctx, '#E5B191', COLORS.ink, 2);
      ctx.beginPath();
      ctx.arc(-10, -26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

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

  drawRollingBoulder(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 24, angle = 0) {
    this.drawShadow(ctx, x, y, radius);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Granite river boulder with rough chiseled shape
    this.setupPath(ctx, '#71717A', COLORS.ink, 3.5);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cracks & fissures
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.6, -radius * 0.2);
    ctx.lineTo(0, radius * 0.3);
    ctx.lineTo(radius * 0.7, -radius * 0.1);
    ctx.moveTo(0, radius * 0.3);
    ctx.lineTo(-radius * 0.2, radius * 0.7);
    ctx.stroke();

    // Moss patch on boulder
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stone highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(radius * 0.25, -radius * 0.35, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  drawHellSpark(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 10, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 12;

    // Glowing core
    this.setupPath(ctx, '#FBBF24', COLORS.ink, 2);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner bright hot center
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Fire tongues radiating
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const fAng = time * 8 + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(fAng) * radius * 0.8, Math.sin(fAng) * radius * 0.8);
      ctx.lineTo(Math.cos(fAng) * (radius + 5), Math.sin(fAng) * (radius + 5));
      ctx.stroke();
    }

    ctx.restore();
  },

  drawWoodShard(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 12, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Jagged flying oak branch / pinecone
    this.setupPath(ctx, '#78350F', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.3, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pine needles / sharp bark splinters
    ctx.strokeStyle = '#15803D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.5, -radius * 0.5);
    ctx.lineTo(-radius * 0.8, -radius * 1.1);
    ctx.moveTo(radius * 0.2, -radius * 0.4);
    ctx.lineTo(radius * 0.1, -radius * 1.0);
    ctx.moveTo(radius * 0.4, radius * 0.4);
    ctx.lineTo(radius * 0.7, radius * 0.9);
    ctx.stroke();

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

  drawCzechBuchta(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (angle !== 0) ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Warm soft shadow underneath
    ctx.fillStyle = 'rgba(38, 23, 14, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tender dough base / crumb (pale golden yellow dough)
    this.setupPath(ctx, '#FDE8B5', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.bezierCurveTo(-18, 5, -14, 11, -8, 12);
    ctx.bezierCurveTo(4, 13, 12, 10, 16, 6);
    ctx.bezierCurveTo(18, 0, 16, -6, 12, -9);
    ctx.bezierCurveTo(4, -11, -6, -9, -16, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden-brown roasted top crust (rich amber dome)
    const crustGrad = ctx.createLinearGradient(-10, -12, 12, 8);
    crustGrad.addColorStop(0, '#A64812');
    crustGrad.addColorStop(0.3, '#7E340A');
    crustGrad.addColorStop(0.7, '#C56A1F');
    crustGrad.addColorStop(1, '#DB872D');

    ctx.fillStyle = crustGrad;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-14, -1);
    ctx.bezierCurveTo(-11, -11, 2, -12, 12, -8);
    ctx.bezierCurveTo(17, -4, 17, 3, 13, 6);
    ctx.bezierCurveTo(4, 8, -4, 6, -11, 3);
    ctx.bezierCurveTo(-14, 2, -14, 0, -14, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Soft torn crumb on left edge (fluffy bread interior where bun was separated)
    ctx.fillStyle = '#FFF8E7';
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.bezierCurveTo(-17, 5, -13, 10, -8, 11);
    ctx.bezierCurveTo(-5, 9, -5, 4, -10, 2);
    ctx.closePath();
    ctx.fill();

    // Dark plum povidla filling peek inside the torn crumb
    ctx.fillStyle = '#54162B';
    ctx.beginPath();
    ctx.ellipse(-10, 6, 3, 2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Powdered sugar (moučkový cukr) - fine white dusting particles on the golden top crust
    ctx.fillStyle = '#FFFFFF';
    const sugarGranules: [number, number, number][] = [
      [-6, -6, 0.9], [-4, -8, 1.1], [-1, -7, 1.2], [2, -8, 1.3], [5, -7, 1.1], [8, -5, 1.0],
      [-8, -4, 0.8], [-5, -4, 1.0], [-2, -5, 1.2], [1, -5, 1.1], [4, -4, 1.2], [7, -3, 0.9], [10, -2, 0.8],
      [-10, -2, 0.7], [-7, -2, 0.9], [-3, -2, 1.0], [0, -2, 1.1], [3, -2, 1.0], [6, -1, 0.9], [9, 0, 0.7],
      [-4, 0, 0.8], [-1, 0, 1.0], [2, 1, 0.9], [5, 2, 0.8],
      [-5, -7, 0.7], [0, -9, 0.8], [4, -8, 0.7], [7, -6, 0.8], [-2, -7, 0.9], [3, -6, 1.0]
    ];
    for (const [sx, sy, sr] of sugarGranules) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  drawBreadRoll(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    const bob = Math.sin(time * 4) * 3;
    this.drawCzechBuchta(ctx, x, y + bob, 1.0, 0);
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

    // Fresh tray of powdered Czech buchty on wooden baker's peel next to the oven
    this.setupPath(ctx, '#8C5329', COLORS.ink, 2);
    ctx.fillRect(w / 2 + 35, h - 32, 40, 7);
    this.drawCzechBuchta(ctx, w / 2 + 45, h - 38, 0.72, -0.04);
    this.drawCzechBuchta(ctx, w / 2 + 60, h - 39, 0.68, 0.04);

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

  drawHromnickaAura(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    reach: number,
    time: number,
    pulseTimer = 0
  ) {
    ctx.save();
    // Organic flickering of candle light
    const flicker = Math.sin(time * 12) * 3.5 + Math.sin(time * 23) * 2;
    const r = Math.max(30, reach + flicker);

    // Warm sacred candlelight radial glow
    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.30)');
    grad.addColorStop(0.45, 'rgba(251, 191, 36, 0.16)');
    grad.addColorStop(0.82, 'rgba(217, 119, 6, 0.06)');
    grad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Subtle folk dashed aura ring
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Sacred pulse wave if firing every 2s
    if (pulseTimer > 0) {
      const progress = 1 - pulseTimer / 0.4; // 0 to 1
      const waveR = reach * (0.3 + progress * 0.7);
      const alpha = Math.max(0, (1 - progress) * 0.75);

      ctx.save();
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.lineWidth = 4 * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.arc(x, y, waveR, 0, Math.PI * 2);
      ctx.stroke();

      // Golden cross beams radiating on holy pulse
      const crossAlpha = Math.max(0, (1 - progress) * 0.5);
      ctx.strokeStyle = `rgba(253, 224, 71, ${crossAlpha})`;
      ctx.lineWidth = 2.5;
      const bLen = reach * 0.8;
      ctx.beginPath();
      ctx.moveTo(x - bLen, y);
      ctx.lineTo(x + bLen, y);
      ctx.moveTo(x, y - bLen);
      ctx.lineTo(x, y + bLen);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },

  drawBlessedCandle(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Candle body (white wax with slight folk warmth)
    this.setupPath(ctx, '#FFFBEB', COLORS.ink, 2);
    ctx.beginPath();
    ctx.rect(-3.5, -4, 7, 16);
    ctx.fill();
    ctx.stroke();

    // Wax drips
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(-3.5, 2, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(3.5, 4, 1.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black wick
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, -8);
    ctx.stroke();

    // Flickering candle flame
    const flameSway = Math.sin(time * 16) * 1.5;
    // Outer flame glow
    ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.beginPath();
    ctx.arc(flameSway * 0.5, -14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Outer flame (warm amber)
    this.setupPath(ctx, '#F59E0B', COLORS.ink, 1.5);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-4, -13, flameSway, -19);
    ctx.quadraticCurveTo(4, -13, 0, -8);
    ctx.fill();
    ctx.stroke();

    // Inner bright yellow flame
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(-2.5, -12, flameSway * 0.7, -16);
    ctx.quadraticCurveTo(2.5, -12, 0, -8);
    ctx.fill();

    // Blue flame base
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(0, -8, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
};


/** Renderer methods accepted by enemy data definitions. */
export type EnemyRendererMethod = Extract<keyof typeof Lada, `draw${string}`>;

export type EnemyDrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked: boolean,
) => void;

export function drawEnemyRenderer(
  method: EnemyRendererMethod,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked: boolean,
): void {
  const drawer = Lada[method] as unknown as EnemyDrawFn;
  drawer(ctx, x, y, time, vx, panicked);
}
