import { describe, it, expect } from 'vitest';
import { renderProjectilesAndSlashes } from '../src/render/renderProjectiles';
import { Lada } from '../src/render/ladaRenderer';

function createMockCtx() {
  const commands: { type: string; args?: any[]; strokeStyle?: any; fillStyle?: any; lineWidth?: number }[] = [];
  return {
    commands,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    save() {
      commands.push({ type: 'save' });
    },
    restore() {
      commands.push({ type: 'restore' });
    },
    translate(x: number, y: number) {
      commands.push({ type: 'translate', args: [x, y] });
    },
    rotate(a: number) {
      commands.push({ type: 'rotate', args: [a] });
    },
    scale(sx: number, sy: number) {
      commands.push({ type: 'scale', args: [sx, sy] });
    },
    beginPath() {
      commands.push({ type: 'beginPath' });
    },
    closePath() {
      commands.push({ type: 'closePath' });
    },
    moveTo(x: number, y: number) {
      commands.push({ type: 'moveTo', args: [x, y] });
    },
    lineTo(x: number, y: number) {
      commands.push({ type: 'lineTo', args: [x, y] });
    },
    arc(x: number, y: number, r: number) {
      commands.push({ type: 'arc', args: [x, y, r] });
    },
    ellipse(x: number, y: number, rx: number, ry: number) {
      commands.push({ type: 'ellipse', args: [x, y, rx, ry] });
    },
    rect(x: number, y: number, w: number, h: number) {
      commands.push({ type: 'rect', args: [x, y, w, h] });
    },
    stroke() {
      commands.push({ type: 'stroke', strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
    },
    fill() {
      commands.push({ type: 'fill', fillStyle: this.fillStyle });
    },
    drawImage() {},
  } as any;
}

const mockCamera = {
  x: 0,
  y: 0,
  width: 1200,
  height: 900,
  zoom: 1,
  viewLeft: 0,
  viewRight: 1200,
  viewTop: 0,
  viewBottom: 900,
};

describe('ADR 0045 & ADR 0046: Projectile Polarity and Morphology (Oblé vs. Špičaté střely)', () => {
  it('renders enemy projectiles with sharp pointed geometry and cinnabar threat palette', () => {
    const ctx = createMockCtx();
    const enemyProj = [
      {
        x: 100,
        y: 100,
        radius: 10,
        angle: 0.5,
        isEnemy: true,
        dead: false,
      },
    ];

    renderProjectilesAndSlashes(ctx, enemyProj, [], mockCamera, 0);

    // Look for sharp lineTo calls (triangular dart) and cinnabar #E62A19 threat color
    const fills = ctx.commands.filter((c: any) => c.type === 'fill');
    const lineTos = ctx.commands.filter((c: any) => c.type === 'lineTo');

    expect(lineTos.length).toBeGreaterThan(0);
    const hasCinnabarThreat = fills.some((f: any) => f.fillStyle === '#E62A19');
    expect(hasCinnabarThreat).toBe(true);

    // Must NOT use reward gold (#FFD23F or #FBBF24)
    const hasRewardGold = fills.some((f: any) => f.fillStyle === '#FFD23F' || f.fillStyle === '#FBBF24');
    expect(hasRewardGold).toBe(false);
  });

  it('renders player projectiles with rounded organic geometry in cobalt/green/white palette', () => {
    const ctx = createMockCtx();
    const playerProj = [
      {
        x: 100,
        y: 100,
        radius: 10,
        angle: 0.2,
        isEnemy: false,
        dead: false,
      },
    ];

    renderProjectilesAndSlashes(ctx, playerProj, [], mockCamera, 0);

    const ellipses = ctx.commands.filter((c: any) => c.type === 'ellipse');
    const fills = ctx.commands.filter((c: any) => c.type === 'fill');

    expect(ellipses.length).toBeGreaterThan(0);
    const hasCobalt = fills.some((f: any) => f.fillStyle === '#1E56A0');
    expect(hasCobalt).toBe(true);
  });

  it('renders drawHellSpark as a sharp aggressive 4-point star with cinnabar outline', () => {
    const ctx = createMockCtx();
    (Lada as any).drawHellSpark(ctx, 50, 50, 10, 1.2);

    const lineTos = ctx.commands.filter((c: any) => c.type === 'lineTo');
    const fills = ctx.commands.filter((c: any) => c.type === 'fill');

    // Sharp 8-point perimeter (4 sharp tips + 4 inner valleys)
    expect(lineTos.length).toBeGreaterThanOrEqual(7);
    const hasCinnabar = fills.some((f: any) => f.fillStyle === '#E62A19');
    expect(hasCinnabar).toBe(true);
  });

  it('renders drawWoodShard with sharp jagged splinter tip and danger accent', () => {
    const ctx = createMockCtx();
    (Lada as any).drawWoodShard(ctx, 50, 50, 12, 0);

    const lineTos = ctx.commands.filter((c: any) => c.type === 'lineTo');
    const strokes = ctx.commands.filter((c: any) => c.type === 'stroke');

    expect(lineTos.length).toBeGreaterThanOrEqual(4);
    const hasDangerAccent = strokes.some((s: any) => s.strokeStyle === '#E62A19');
    expect(hasDangerAccent).toBe(true);
  });
});
