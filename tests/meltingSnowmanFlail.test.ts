import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { Lada } from '../src/render/ladaRenderer';
import { renderProjectilesAndSlashes } from '../src/render/renderProjectiles';

function createMockCtx() {
  return {
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    arc() {},
    ellipse() {},
    rect() {},
    strokeRect() {},
    fillRect() {},
    stroke() {},
    fill() {},
    fillText() {},
    strokeText() {},
    measureText: () => ({ width: 20 }),
    setLineDash() {},
    lineCap: 'round',
    lineJoin: 'round',
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('melting snowman sprite and wooden flail combat VFX', () => {
  it('resolves the thaw-horde ID to the registered melting snowman', () => {
    const engine = new GameEngine();
    const enemy = engine.createHeadlessEnemy('tajici_snehulak', 10, 20);

    expect(enemy.id).toBe('tajici_snehulak');
    expect(enemy.hp).toBe(280);
    expect(enemy.method).toBe('drawMeltingSnowman');
    expect(typeof (Lada as any).drawMeltingSnowman).toBe('function');
  });

  it('renders the flail sweep through the arena slash renderer', () => {
    const ctx = createMockCtx();
    const result = renderProjectilesAndSlashes(
      ctx,
      [],
      [{
        x: 100,
        y: 100,
        angle: 0,
        reach: 150,
        arc: Math.PI * 1.75,
        life: 0.24,
        maxLife: 0.36,
        time: 0.12,
        style: 'flail',
        weaponId: 'dreveny_cep',
        visualOnly: true,
        dead: false,
      }],
      { x: 0, y: 0, width: 200, height: 200, viewLeft: 0, viewTop: 0, viewRight: 200, viewBottom: 200 },
      1
    );

    expect(result.renderedSlashes).toBe(1);
  });
});
