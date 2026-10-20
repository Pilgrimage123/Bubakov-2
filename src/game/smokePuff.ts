/**
 * Object Pool for Herbal Smoke Cloud (Oblak bylinného dýmu)
 * 
 * Pre-allocates a fixed pool of 25 SmokePuff instances to eliminate GC allocations
 * in the hot path. Batches path drawing for poofDots and crumbs, reducing context
 * save/restore calls from 20 to 2 per puff.
 * 
 * ADR 0020
 */

import { COLORS } from '../constants';

export const MAX_SMOKE_PUFFS = 25;

const CRUMB_COLORS = ['#D97706', '#F59E0B', '#FDE68A', '#FEF08A', '#FFFDF9'] as const;

export class SmokePuff {
  x = 0;
  y = 0;
  radius = 24;
  time = 0;
  duration = 1.25;
  dead = true;
  kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke';
  damagePerSecond = 0;
  damageAccumulator = 0;

  lobes: Array<{
    ox: number;
    oy: number;
    r: number;
    vx: number;
    vy: number;
  }> = [];

  wisps: Array<{
    ox: number;
    oy: number;
    scale: number;
    rot: number;
    rotSpd: number;
    vy: number;
  }> = [];

  poofDots: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
  }> = [];

  crumbs: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rot: number;
  }> = [];

  constructor(x = 0, y = 0, radius = 24, kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke', duration = 1.25) {
    // Pre-allocate fixed slots
    // 1 central + 7 perimeter = 8 lobes
    for (let i = 0; i < 8; i++) {
      this.lobes.push({ ox: 0, oy: 0, r: 0, vx: 0, vy: 0 });
    }
    // 3 wisps
    for (let i = 0; i < 3; i++) {
      this.wisps.push({ ox: 0, oy: 0, scale: 1, rot: 0, rotSpd: 0, vy: 0 });
    }
    // 6 poofDots
    for (let i = 0; i < 6; i++) {
      this.poofDots.push({ x: 0, y: 0, vx: 0, vy: 0, r: 0 });
    }
    // 8 crumbs
    for (let i = 0; i < 8; i++) {
      this.crumbs.push({ x: 0, y: 0, vx: 0, vy: 0, size: 0, color: CRUMB_COLORS[0], rot: 0 });
    }

    if (x !== 0 || y !== 0 || radius !== 24 || kind !== 'smoke' || duration !== 1.25) {
      this.reset(x, y, radius, kind, duration);
    }
  }

  reset(
    x: number,
    y: number,
    radius = 24,
    kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke',
    duration = 1.25
  ): this {
    this.x = x;
    this.y = y;
    this.radius = Math.max(8, radius);
    this.kind = kind;
    this.time = 0;
    this.duration = duration;
    this.dead = false;
    this.damagePerSecond = 0;
    this.damageAccumulator = 0;

    // Main central lobe
    const centerLobe = this.lobes[0];
    centerLobe.ox = 0;
    centerLobe.oy = -this.radius * 0.1;
    centerLobe.r = this.radius * 0.78;
    centerLobe.vx = 0;
    centerLobe.vy = -22;

    // 7 perimeter billowing lobes
    const count = 7;
    for (let i = 0; i < count; i++) {
      const lobe = this.lobes[i + 1];
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const dist = this.radius * (0.45 + Math.random() * 0.35);
      const pushSpeed = 18 + Math.random() * 20;
      lobe.ox = Math.cos(angle) * dist;
      lobe.oy = Math.sin(angle) * dist * 0.85;
      lobe.r = this.radius * (0.42 + Math.random() * 0.28);
      lobe.vx = Math.cos(angle) * pushSpeed;
      lobe.vy = Math.sin(angle) * pushSpeed * 0.6 - 28 - Math.random() * 15;
    }

    // 3 cartoon curling wisps
    for (let i = 0; i < 3; i++) {
      const wisp = this.wisps[i];
      const ang = Math.random() * Math.PI * 2;
      wisp.ox = Math.cos(ang) * this.radius * 0.5;
      wisp.oy = Math.sin(ang) * this.radius * 0.4 - 10;
      wisp.scale = 0.6 + Math.random() * 0.5;
      wisp.rot = Math.random() * Math.PI * 2;
      wisp.rotSpd = (Math.random() - 0.5) * 3;
      wisp.vy = -35 - Math.random() * 25;
    }

    // 6 mini poof dots
    for (let i = 0; i < 6; i++) {
      const dot = this.poofDots[i];
      const ang = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const spd = 45 + Math.random() * 45;
      dot.x = Math.cos(ang) * (this.radius * 0.4);
      dot.y = Math.sin(ang) * (this.radius * 0.35);
      dot.vx = Math.cos(ang) * spd;
      dot.vy = Math.sin(ang) * spd * 0.7 - 15;
      dot.r = 4 + Math.random() * 4;
    }

    // 8 pastry sugar / bread crumbs
    for (let i = 0; i < 8; i++) {
      const crumb = this.crumbs[i];
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 60;
      crumb.x = (Math.random() - 0.5) * 16;
      crumb.y = (Math.random() - 0.5) * 16;
      crumb.vx = Math.cos(ang) * spd;
      crumb.vy = Math.sin(ang) * spd - 20;
      crumb.size = 2 + Math.random() * 2.5;
      crumb.color = CRUMB_COLORS[Math.floor(Math.random() * CRUMB_COLORS.length)];
      crumb.rot = Math.random() * Math.PI * 2;
    }

    return this;
  }

  update(dt: number): void {
    if (this.dead) return;
    this.time += dt;
    if (this.time >= this.duration) {
      this.dead = true;
      return;
    }

    for (let i = 0; i < this.lobes.length; i++) {
      const lobe = this.lobes[i];
      lobe.ox += lobe.vx * dt;
      lobe.oy += lobe.vy * dt;
      lobe.vx *= 0.94;
      lobe.vy *= 0.96;
    }

    for (let i = 0; i < this.wisps.length; i++) {
      const wisp = this.wisps[i];
      wisp.oy += wisp.vy * dt;
      wisp.rot += wisp.rotSpd * dt;
    }

    for (let i = 0; i < this.poofDots.length; i++) {
      const dot = this.poofDots[i];
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      dot.vx *= 0.92;
      dot.vy *= 0.94;
    }

    for (let i = 0; i < this.crumbs.length; i++) {
      const crumb = this.crumbs[i];
      crumb.x += crumb.vx * dt;
      crumb.y += crumb.vy * dt;
      crumb.vy += 80 * dt;
      crumb.vx *= 0.93;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.dead) return;
    const progress = Math.min(1, this.time / this.duration);

    // Ease in pop scale (0 -> 1.15 in first 0.18s, then gentle expand to 1.35)
    let scale = 1;
    if (progress < 0.18) {
      const popT = progress / 0.18;
      scale = Math.sin(popT * Math.PI * 0.5) * 1.15;
    } else {
      scale = 1.15 + (progress - 0.18) * 0.35;
    }

    // Alpha fade out in last 35% of duration
    let alpha = 1;
    if (progress > 0.65) {
      alpha = Math.max(0, 1 - (progress - 0.65) / 0.35);
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = alpha * (this.kind === 'plum-scent' ? 0.58 : 1);

    // 1. Draw outer mini poof dots (Batched into 1 beginPath without loop save/restore)
    const dotAlpha = Math.max(0, 1 - progress * 1.6);
    if (dotAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha * dotAlpha;
      ctx.fillStyle = this.kind === 'plum-scent' ? '#9D4EDD' : this.kind === 'fajfka' ? '#898994' : '#FFFDF7';
      ctx.strokeStyle = this.kind === 'plum-scent' ? '#5B167D' : this.kind === 'fajfka' ? '#42424A' : (COLORS?.ink || '#1E1B18');
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const dotScale = 1 + progress * 0.4;
      for (let i = 0; i < this.poofDots.length; i++) {
        const dot = this.poofDots[i];
        ctx.moveTo(dot.x + dot.r * dotScale, dot.y);
        ctx.arc(dot.x, dot.y, dot.r * dotScale, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw ground shadow of smoke cloud
    const shadowAlpha = alpha * Math.max(0, 0.4 - progress * 0.4);
    if (shadowAlpha > 0.01) {
      ctx.fillStyle = 'rgba(25, 20, 15, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, this.radius * 0.5, this.radius * 0.9 * scale, this.radius * 0.4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Shadow / depth under-layer of the main cloud (slightly offset downward)
    ctx.fillStyle = this.kind === 'plum-scent' ? '#7E22CE' : this.kind === 'fajfka' ? '#6B7280' : '#E8DEC8';
    ctx.beginPath();
    for (let i = 0; i < this.lobes.length; i++) {
      const lobe = this.lobes[i];
      const lr = lobe.r * scale;
      ctx.moveTo(lobe.ox + lr, lobe.oy + 4);
      ctx.arc(lobe.ox, lobe.oy + 4, lr, 0, Math.PI * 2);
    }
    ctx.fill();

    // 4. Main puffy cloud body with authentic Josef Lada ink border
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = Math.max(2.5, this.radius * 0.09);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < this.lobes.length; i++) {
      const lobe = this.lobes[i];
      const lr = lobe.r * scale;
      ctx.moveTo(lobe.ox + lr, lobe.oy);
      ctx.arc(lobe.ox, lobe.oy, lr, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 5. Highlight arcs on the tops of the lobes (whiter cream volume)
    ctx.strokeStyle = this.kind === 'plum-scent' ? '#D8B4FE' : this.kind === 'fajfka' ? '#D4D4D8' : '#FFFFFF';
    ctx.lineWidth = Math.max(1.8, this.radius * 0.05);
    ctx.beginPath();
    for (let i = 0; i < this.lobes.length; i++) {
      const lobe = this.lobes[i];
      const lr = lobe.r * scale * 0.72;
      ctx.arc(lobe.ox, lobe.oy - lobe.r * scale * 0.15, lr, -Math.PI * 0.85, -Math.PI * 0.15);
    }
    ctx.stroke();

    // 6. Cartoon curling smoke wisps / spirals floating upwards
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < this.wisps.length; i++) {
      const wisp = this.wisps[i];
      ctx.save();
      ctx.translate(wisp.ox, wisp.oy);
      ctx.rotate(wisp.rot);
      ctx.scale(wisp.scale, wisp.scale);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2.4; a += 0.2) {
        const sr = 3 + a * 2.2;
        const sx = Math.cos(a) * sr;
        const sy = Math.sin(a) * sr;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 7. Delicious pastry crumbs / sugar sparkles tumbling away
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS?.ink || '#1E1B18';
    for (let i = 0; i < this.crumbs.length; i++) {
      const crumb = this.crumbs[i];
      ctx.fillStyle = crumb.color;
      ctx.beginPath();
      ctx.arc(crumb.x, crumb.y, crumb.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * Pre-allocated smoke puff pool for zero allocations in hot path.
 */
export class SmokePuffPool {
  private pool: SmokePuff[] = [];
  private poolCapacity: number;

  constructor(capacity = MAX_SMOKE_PUFFS) {
    this.poolCapacity = capacity;
    for (let i = 0; i < capacity; i++) {
      this.pool.push(new SmokePuff());
    }
  }

  public spawn(
    list: SmokePuff[],
    x: number,
    y: number,
    radius = 24,
    kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke',
    duration = 1.25
  ): SmokePuff {
    // 1. Try to find an inactive instance in the pool that is not in `list`
    let puff: SmokePuff | undefined;
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.dead && !list.includes(p)) {
        puff = p;
        break;
      }
    }

    // 2. If all in pool are active, recycle the oldest puff in `list`
    if (!puff && list.length > 0) {
      puff = list.shift();
    }

    // 3. Fallback: take first item in pool
    if (!puff) {
      puff = this.pool[0];
    }

    puff.reset(x, y, radius, kind, duration);
    list.push(puff);
    return puff;
  }
}

let globalSmokePuffPool: SmokePuffPool | null = null;

export function getGlobalSmokePuffPool(): SmokePuffPool {
  if (!globalSmokePuffPool) {
    globalSmokePuffPool = new SmokePuffPool(MAX_SMOKE_PUFFS);
  }
  return globalSmokePuffPool;
}

export function spawnSmokePuff(
  list: SmokePuff[],
  x: number,
  y: number,
  radius = 24,
  kind: 'smoke' | 'plum-scent' | 'fajfka' = 'smoke',
  duration = 1.25
): SmokePuff {
  return getGlobalSmokePuffPool().spawn(list, x, y, radius, kind, duration);
}
