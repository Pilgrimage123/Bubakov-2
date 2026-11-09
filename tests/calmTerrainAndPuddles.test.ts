import { describe, it, expect } from 'vitest';
import { renderWorldHazardsAndEncounters } from '../src/render/renderWorldHazards';
import { VirtualLeaderSnowmanHorde } from '../src/game/virtualLeaderSnowmanHorde';

function createMockCtx() {
  const commands: { type: string; strokeStyle?: any; fillStyle?: any; globalAlpha?: number; lineWidth?: number }[] = [];
  let currentAlpha = 1;

  return {
    commands,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    get globalAlpha() {
      return currentAlpha;
    },
    set globalAlpha(v: number) {
      currentAlpha = v;
      commands.push({ type: 'setAlpha', globalAlpha: v });
    },
    save() {
      commands.push({ type: 'save' });
    },
    restore() {
      commands.push({ type: 'restore' });
    },
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    ellipse() {},
    rect() {},
    fill() {
      commands.push({ type: 'fill', fillStyle: this.fillStyle, globalAlpha: currentAlpha });
    },
    stroke() {
      commands.push({ type: 'stroke', strokeStyle: this.strokeStyle, globalAlpha: currentAlpha });
    },
    setLineDash() {},
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

describe('ADR 0045: Calm 60% Floor Rule - Translucent Watercolor Ground Decals and Puddles', () => {
  it('renders thaw.beerPuddle as translucent watercolor wash capped at max 0.35 opacity with no dark stroke', () => {
    const ctx = createMockCtx();
    const mockEngine: any = {
      activeLevelId: 0,
      uiTime: 1.5,
      marchThaw: {
        beerPuddle: { x: 200, y: 200, time: 2.0 },
      },
    };

    renderWorldHazardsAndEncounters(ctx, mockEngine, mockCamera);

    const alphaSets = ctx.commands.filter((c: any) => c.type === 'setAlpha');
    expect(alphaSets.length).toBeGreaterThan(0);
    // All puddle alpha sets must be <= 0.35
    for (const a of alphaSets) {
      expect(a.globalAlpha).toBeLessThanOrEqual(0.35);
    }

    // Must NOT have dark stroke
    const strokes = ctx.commands.filter((c: any) => c.type === 'stroke');
    const hasDarkStroke = strokes.some((s: any) => s.strokeStyle === '#6B3510' || s.strokeStyle === '#000000');
    expect(hasDarkStroke).toBe(false);
  });

  it('renders mud hazards with opacity <= 0.35 and no dark ink outline on settled puddle', () => {
    const ctx = createMockCtx();
    const mockEngine: any = {
      uiTime: 1.0,
      activeHazards: [
        {
          x: 300,
          y: 300,
          radius: 25,
          type: 'mud',
          duration: 2.0,
          warningTimer: 0, // settled puddle
        },
      ],
    };

    renderWorldHazardsAndEncounters(ctx, mockEngine, mockCamera);

    const alphaSets = ctx.commands.filter((c: any) => c.type === 'setAlpha');
    expect(alphaSets.length).toBeGreaterThan(0);
    for (const a of alphaSets) {
      expect(a.globalAlpha).toBeLessThanOrEqual(0.35);
    }

    // When warningTimer is 0, settled mud puddle should NOT have dark #26150C stroke
    const strokes = ctx.commands.filter((c: any) => c.type === 'stroke');
    const hasDarkStroke = strokes.some((s: any) => s.strokeStyle === '#26150C' || s.strokeStyle === '#000000');
    expect(hasDarkStroke).toBe(false);
  });

  it('renders snowman horde melting puddles capped at max 0.35 opacity without harsh dark stroke', () => {
    const ctx = createMockCtx();
    const horde = new VirtualLeaderSnowmanHorde(20);
    (horde as any).spawnPuddle(250, 250);

    horde.renderPuddles(ctx, 0, 0, 1200, 900, 1.0);

    const alphaSets = ctx.commands.filter((c: any) => c.type === 'setAlpha');
    expect(alphaSets.length).toBeGreaterThan(0);
    for (const a of alphaSets) {
      expect(a.globalAlpha).toBeLessThanOrEqual(0.35);
    }
  });
});
