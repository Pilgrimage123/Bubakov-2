import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  renderArena,
  renderArenaEntities,
  isInView,
  ArenaRenderer,
  type CameraViewport,
  type ArenaRenderOptions,
} from '../src/render/arenaRenderer';
import { Lada } from '../src/render/ladaRenderer';
import { createInitialEngineState } from '../src/game/engineState';
import type { EngineState } from '../src/game/engineState';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Arena Renderer Seam & Performance Pipeline (Ticket #28)', () => {
  let ctx: CanvasRenderingContext2D;
  let engine: EngineState;
  let camera: CameraViewport;

  beforeEach(() => {
    ctx = createMockCanvasContext();
    engine = createInitialEngineState();
    camera = {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      viewLeft: -640,
      viewTop: -360,
      viewRight: 640,
      viewBottom: 360,
    };
  });

  it('renders arena without throwing errors on default engine state', () => {
    const metrics = renderArena(ctx, engine, camera);
    expect(metrics).toBeDefined();
    expect(metrics.renderedEntities).toBe(0);
    expect(metrics.timings.totalMs).toBeGreaterThanOrEqual(0);
  });

  it('implements frustum culling: only entities within camera viewport are rendered', () => {
    const drawInside = vi.fn();
    const drawOutside = vi.fn();

    engine.enemies = [
      { id: 'inside_1', x: 0, y: 0, radius: 20, isDefeated: false, dead: false, draw: drawInside } as any,
      { id: 'inside_2', x: 200, y: 150, radius: 25, isDefeated: false, dead: false, draw: drawInside } as any,
      { id: 'outside_1', x: 2000, y: 3000, radius: 20, isDefeated: false, dead: false, draw: drawOutside } as any,
      { id: 'outside_2', x: -1500, y: 0, radius: 20, isDefeated: false, dead: false, draw: drawOutside } as any,
    ];

    const metrics = renderArena(ctx, engine, camera);

    expect(drawInside).toHaveBeenCalledTimes(2);
    expect(drawOutside).not.toHaveBeenCalled();
    expect(metrics.renderedEntities).toBe(2);
  });

  it('implements frustum culling for decor items', () => {
    const drawDecorInside = vi.fn();
    const drawDecorOutside = vi.fn();

    engine.decor = [
      { x: 50, y: 50, scale: 1, type: 'tree', draw: drawDecorInside } as any,
      { x: 1000, y: 1000, scale: 1, type: 'tree', draw: drawDecorOutside } as any,
    ];

    const metrics = renderArena(ctx, engine, camera);

    expect(drawDecorInside).toHaveBeenCalled();
    expect(drawDecorOutside).not.toHaveBeenCalled();
    expect(metrics.renderedDecor).toBe(1);
  });

  it('measures timing metrics across rendering phases', () => {
    const metrics = renderArena(ctx, engine, camera);

    expect(metrics.timings).toBeDefined();
    expect(typeof metrics.timings.backdropMs).toBe('number');
    expect(typeof metrics.timings.staticDecorMs).toBe('number');
    expect(typeof metrics.timings.entitiesMs).toBe('number');
    expect(typeof metrics.timings.lightingMs).toBe('number');
    expect(typeof metrics.timings.combatTextsMs).toBe('number');
    expect(typeof metrics.timings.totalMs).toBe('number');
  });

  it('supports passing CameraViewport directly to isInView', () => {
    expect(isInView(0, 0, 20, camera)).toBe(true);
    expect(isInView(2000, 2000, 20, camera)).toBe(false);
  });

  it('respects optional toggle flags to skip passes (lighting, VFX, combat texts)', () => {
    const drawText = vi.fn();
    engine.texts = [
      { x: 10, y: 10, size: 18, category: 'enemyDamage', text: '50', draw: drawText } as any,
    ];

    const options: ArenaRenderOptions = {
      lightingEnabled: false,
      combatTextsEnabled: false,
    };

    const metrics = renderArena(ctx, engine, camera, options);

    expect(drawText).not.toHaveBeenCalled();
    expect(metrics.timings.lightingMs).toBe(0);
    expect(metrics.timings.combatTextsMs).toBe(0);
  });

  it('exposes the entity pass for incremental callers while retaining depth order and post-draw ornaments', () => {
    const drawOrder: string[] = [];
    const ornamentOrder: string[] = [];
    engine.enemies = [
      { id: 'late', x: 0, y: 80, radius: 20, draw: () => drawOrder.push('late') } as any,
      { id: 'early', x: 0, y: -20, radius: 20, draw: () => drawOrder.push('early') } as any,
    ];

    const count = renderArenaEntities(ctx, engine, camera, {
      afterEntitiesDrawn: (entity) => ornamentOrder.push(entity.id),
    });

    expect(count).toBe(2);
    expect(drawOrder).toEqual(['early', 'late']);
    expect(ornamentOrder).toEqual(['early', 'late']);
  });

  it('provides instance-isolated preallocated buffers to prevent cross-canvas collisions (Plan Section 2)', () => {
    const rendererA = new ArenaRenderer();
    const rendererB = new ArenaRenderer();

    expect(rendererA.preallocatedDrawables).not.toBe(rendererB.preallocatedDrawables);
    expect(rendererA.preallocatedDrawables.length).toBe(2048);
    expect(rendererB.preallocatedDrawables.length).toBe(2048);
  });

  it('renders extended arena passes (drops, projectiles, particles, telegraphs) in single seam', () => {
    engine.drops = [
      { x: 10, y: 10, type: 'coin', value: 5, time: 0, dead: false },
      { x: 2000, y: 2000, type: 'coin', value: 5, time: 0, dead: false }, // culled
    ];
    engine.projectiles = [
      { x: 5, y: 5, radius: 10, visual: 'potato', dead: false },
      { x: 3000, y: 3000, radius: 10, visual: 'potato', dead: false }, // culled
    ];
    engine.particles = [
      { x: 0, y: 0, life: 0.5, size: 4, color: '#F59E0B' },
      { x: 5000, y: 5000, life: 0.5, size: 4, color: '#F59E0B' }, // culled
    ];

    const metrics = renderArena(ctx, engine, camera);

    expect(metrics.renderedDrops).toBe(1);
    expect(metrics.renderedProjectiles).toBe(1);
    expect(metrics.renderedParticles).toBe(1);
    expect(metrics.timings.dropsMs).toBeDefined();
    expect(metrics.timings.projectilesMs).toBeDefined();
    expect(metrics.timings.particlesMs).toBeDefined();
  });

  it('continues rendering defeated enemies during their flee / food-defeat fade animation until dead', () => {
    const drawFleeing = vi.fn();
    const drawDead = vi.fn();

    engine.enemies = [
      { id: 'fleeing', x: 0, y: 0, radius: 20, isDefeated: true, dead: false, fleeTimer: 0.3, draw: drawFleeing } as any,
      { id: 'dead', x: 10, y: 10, radius: 20, isDefeated: true, dead: true, fleeTimer: 0.85, draw: drawDead } as any,
    ];

    const metrics = renderArena(ctx, engine, camera);
    expect(drawFleeing).toHaveBeenCalledTimes(1);
    expect(drawDead).not.toHaveBeenCalled();
    expect(metrics.renderedEntities).toBe(1);
  });

  it('renders herb_leaf projectiles and kovana_halapartna slashes with dedicated Lada procedures', () => {
    const spyHerb = vi.spyOn(Lada, 'drawHerbProjectile');
    const spyHalberd = vi.spyOn(Lada, 'drawHalapartnaSlash');

    engine.projectiles = [
      { x: 0, y: 0, radius: 14, angle: 0.5, visual: 'herb_leaf', herbVariant: 2, dead: false },
    ];
    engine.slashes = [
      { x: 0, y: 0, reach: 90, angle: 0, arc: 1.2, style: 'halberd', weaponId: 'kovana_halapartna', dead: false },
    ];

    renderArena(ctx, engine, camera);

    expect(spyHerb).toHaveBeenCalledTimes(1);
    expect(spyHalberd).toHaveBeenCalledTimes(1);

    spyHerb.mockRestore();
    spyHalberd.mockRestore();
  });

  it('draws ground footprints before entities and over-entity combat VFX (sukovice) after entities', () => {
    const order: string[] = [];
    const spyFootprint = vi.spyOn(Lada, 'drawSootFootprint').mockImplementation(() => order.push('footprint'));
    const spySukovice = vi.spyOn(Lada, 'drawSukoviceFx').mockImplementation(() => order.push('sukovice'));

    engine.player = { x: 0, y: 0, hp: 100, maxHp: 100, weapons: [], draw: () => order.push('player') } as any;
    (engine as any).sootFootprints = [{ x: 0, y: 0, angle: 0 }];
    (engine as any).sukovice = { t: 0.2, dur: 1.0 };

    renderArena(ctx, engine, camera);

    expect(order).toEqual(['footprint', 'player', 'sukovice']);

    spyFootprint.mockRestore();
    spySukovice.mockRestore();
  });

  it('always renders smokePuffs (plum-scent, fajfka, smoke) underneath hunter and enemies even when puff.y > entity.y', () => {
    const order: string[] = [];

    engine.player = { x: 0, y: -50, hp: 100, maxHp: 100, weapons: [], draw: () => order.push('player') } as any;
    engine.enemies = [
      { id: 'bubak', x: 10, y: 0, radius: 20, isDefeated: false, dead: false, draw: () => order.push('enemy') } as any,
    ];
    engine.smokePuffs = [
      { x: 0, y: 120, radius: 140, kind: 'plum-scent', dead: false, draw: () => order.push('plum-scent') } as any,
      { x: 0, y: 80, radius: 110, kind: 'fajfka', dead: false, draw: () => order.push('fajfka') } as any,
    ];

    renderArena(ctx, engine, camera);

    expect(order).toEqual(['plum-scent', 'fajfka', 'player', 'enemy']);
  });

  it('renders overlapping mrazovy_skritek frost auras on the ground layer before entities with overlap attenuation', () => {
    const order: string[] = [];
    const spyFrostAura = vi.spyOn(Lada, 'drawFrostlingAura').mockImplementation((_ctx, _x, _y, _t, overlapCount) => {
      order.push(`frost-aura:${overlapCount}`);
    });

    engine.player = { x: 0, y: -30, hp: 100, maxHp: 100, weapons: [], draw: () => order.push('player') } as any;
    engine.enemies = [
      { id: 'mrazovy_skritek', method: 'drawFrostling', x: 0, y: 10, radius: 14, isDefeated: false, dead: false, draw: () => order.push('frostling-1') } as any,
      { id: 'mrazovy_skritek', method: 'drawFrostling', x: 25, y: 20, radius: 14, isDefeated: false, dead: false, draw: () => order.push('frostling-2') } as any,
      { id: 'mrazovy_skritek', method: 'drawFrostling', x: -15, y: 30, radius: 14, isDefeated: false, dead: false, draw: () => order.push('frostling-3') } as any,
    ];

    renderArena(ctx, engine, camera);

    expect(order).toEqual([
      'frost-aura:3',
      'frost-aura:3',
      'frost-aura:3',
      'player',
      'frostling-1',
      'frostling-2',
      'frostling-3',
    ]);

    spyFrostAura.mockRestore();
  });

  it('resets projectile and slashes metrics when projectile pass is skipped on subsequent frames', () => {
    const renderer = new ArenaRenderer();
    engine.slashes = [
      { x: 0, y: 0, reach: 90, angle: 0, arc: 1.2, style: 'halberd', weaponId: 'kovana_halapartna', dead: false },
    ];

    const metrics1 = renderer.renderArena(ctx, engine, camera);
    expect(metrics1.renderedSlashes).toBe(1);

    // Frame 2: combatVfxEnabled is false (skipped projectile pass)
    const metrics2 = renderer.renderArena(ctx, engine, camera, { combatVfxEnabled: false });
    expect(metrics2.renderedSlashes).toBe(0);
    expect(metrics2.renderedProjectiles).toBe(0);

    // Frame 3: slashes and projectiles are empty (skipped projectile pass)
    engine.slashes = [];
    engine.projectiles = [];
    const metrics3 = renderer.renderArena(ctx, engine, camera);
    expect(metrics3.renderedSlashes).toBe(0);
    expect(metrics3.renderedProjectiles).toBe(0);
  });

  it('grows drawable buffer before entity loop based on candidate requirements', () => {
    const renderer = new ArenaRenderer();
    expect(renderer.drawableCapacity).toBe(2048);

    // Provide 2500 enemies
    engine.enemies = [];
    for (let i = 0; i < 2500; i++) {
      engine.enemies.push({
        id: `mob_${i}`,
        x: 0,
        y: 0,
        radius: 10,
        isDefeated: false,
        dead: false,
        draw: () => {},
      } as any);
    }

    renderer.renderEntities(ctx, engine, camera);
    // Capacity grew upfront before the loop
    expect(renderer.drawableCapacity).toBeGreaterThanOrEqual(2501);
  });

  it('renders Stage 1 foreground sun overlay after all entities, roofs, projectiles, and floating combat texts so nothing covers the sun', () => {
    const order: string[] = [];
    engine.activeLevelId = 0;
    engine.gameTime = 150;
    engine.player = {
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      weapons: [],
      draw: () => order.push('player'),
    } as any;
    engine.texts = [
      {
        x: 0,
        y: -20,
        size: 18,
        category: 'enemyDamage',
        text: 'CRIT!',
        draw: () => order.push('floating-text'),
      } as any,
    ];

    const origDrawImage = ctx.drawImage;
    (ctx as any).drawImage = vi.fn((...args: any[]) => {
      order.push('sun-drawImage');
      return (origDrawImage as any).apply(ctx, args);
    });

    renderArena(ctx, engine, camera, {
      curLvl: { id: 0, season: 'spring', theme: 'village' },
      combatTextsEnabled: true,
    });

    const playerIdx = order.indexOf('player');
    const textIdx = order.indexOf('floating-text');
    const firstSunIdx = order.indexOf('sun-drawImage');

    expect(playerIdx).toBeGreaterThanOrEqual(0);
    expect(textIdx).toBeGreaterThan(playerIdx);
    expect(firstSunIdx).toBeGreaterThan(textIdx);
  });
});
