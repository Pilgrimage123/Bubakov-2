import { describe, it, expect, beforeEach } from 'vitest';
import { Lada, drawEnemyRenderer } from '../src/render/ladaRenderer';
import { getLadaArtSettings, setLadaArtSettings, DEFAULT_LADA_ART_SETTINGS } from '../src/game/ladaArtSettings';
import { COLORS } from '../src/constants';

function createMockCanvasContext() {
  const strokes: { strokeStyle: any; lineWidth: number; path: string }[] = [];
  return {
    strokes,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'round',
    lineJoin: 'round',
    save() {},
    restore() {},
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
    fill() {},
    stroke() {
      strokes.push({
        strokeStyle: this.strokeStyle,
        lineWidth: this.lineWidth,
        path: 'stroke',
      });
    },
    drawImage() {},
  } as any;
}

describe('ADR 0045: Two-Level Calligraphic Line Hierarchy (Dvouúrovňová linka)', () => {
  beforeEach(() => {
    setLadaArtSettings({ ...DEFAULT_LADA_ART_SETTINGS, hierarchicalOutlineEnabled: true });
    (Lada as any).currentRole = 'neutral';
    (Lada as any).isCrowded = false;
  });

  it('differentiates major silhouette outlines from inner details across roles', () => {
    // Hunter role
    (Lada as any).currentRole = 'hunter';
    expect((Lada as any).getOutlineWidth(4)).toBe(3.5);
    expect((Lada as any).getOutlineWidth(3)).toBe(3.5);
    expect((Lada as any).getOutlineWidth(1.2)).toBeCloseTo(1.15, 2);

    // Enemy role
    (Lada as any).currentRole = 'enemy';
    expect((Lada as any).getOutlineWidth(4)).toBe(2.75);
    expect((Lada as any).getOutlineWidth(3)).toBe(2.75);
    expect((Lada as any).getOutlineWidth(1.2)).toBeCloseTo(1.15, 2);

    // Enemy role in dense crowd (Anti-clumping)
    (Lada as any).isCrowded = true;
    expect((Lada as any).getOutlineWidth(4)).toBe(2.75); // silhouette remains crisp
    expect((Lada as any).getOutlineWidth(1.2)).toBe(0.85); // inner detail reduced to hairline

    // Boss role
    (Lada as any).isCrowded = false;
    (Lada as any).currentRole = 'boss';
    expect((Lada as any).getOutlineWidth(4)).toBe(4.0);
    expect((Lada as any).getOutlineWidth(1.2)).toBeCloseTo(1.15, 2);
  });

  it('applies hierarchical line width via setupPath for ink strokes', () => {
    const ctx = createMockCanvasContext();

    (Lada as any).currentRole = 'hunter';
    Lada.setupPath(ctx, '#FFF', COLORS.ink, 4);
    expect(ctx.lineWidth).toBe(3.5);

    (Lada as any).currentRole = 'enemy';
    Lada.setupPath(ctx, '#FFF', COLORS.ink, 4);
    expect(ctx.lineWidth).toBe(2.75);

    // Inner detail path
    (Lada as any).currentRole = 'enemy';
    (Lada as any).isCrowded = true;
    Lada.setupPath(ctx, '#FFF', COLORS.ink, 1.2, true);
    expect(ctx.lineWidth).toBe(0.85);
  });

  it('renders white/cream contrast underlay halo for hunter without crashing', () => {
    const ctx = createMockCanvasContext();
    expect(typeof (Lada as any).drawHunterContrastHalo).toBe('function');
    (Lada as any).drawHunterContrastHalo(ctx, 100, 100, 24, 0);
    expect(ctx.strokes.length).toBeGreaterThan(0);
    expect(ctx.strokeStyle).toContain('255, 253, 245');
  });

  it('sets and restores enemy role and crowdedness within drawEnemyRenderer', () => {
    const ctx = createMockCanvasContext();
    const mockEnemy = {
      id: 'rarach',
      radius: 20,
      isBoss: false,
      _isCrowded: true,
    };

    (Lada as any).currentRole = 'neutral';
    (Lada as any).isCrowded = false;

    // Draw enemy through renderer
    drawEnemyRenderer('drawRarach', ctx, 50, 50, 1.0, 1, false, mockEnemy);

    // Post-draw role and crowded flag must be properly restored to previous state
    expect((Lada as any).currentRole).toBe('neutral');
    expect((Lada as any).isCrowded).toBe(false);
  });

  it('respects hierarchicalOutlineEnabled toggle when disabled in settings', () => {
    setLadaArtSettings({ hierarchicalOutlineEnabled: false, outlineWidth: 4 });
    (Lada as any).currentRole = 'hunter';

    // When disabled, raw requestedWidth should be preserved
    expect((Lada as any).getOutlineWidth(4)).toBe(4);
    expect((Lada as any).getOutlineWidth(2.6)).toBeCloseTo(2.6, 2);
  });
});
