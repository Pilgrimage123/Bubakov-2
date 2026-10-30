import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { Lada } from '../src/render/ladaRenderer';
import { resolveDubenObstacles, DUBEN_OBSTACLES } from '../src/data/dubnovyDenArena';
import { createMockCanvasContext } from './helpers/mockCanvas';

describe('Ticket 05: Taktický nepřítel: Čarodějnice na koštěti', () => {
  it('registers carodejnice_koste in ENEMIES with isFlying: true and authentic Czech folklore lore', () => {
    const witch = ENEMIES.carodejnice_koste;
    expect(witch).toBeDefined();
    expect(witch.id).toBe('carodejnice_koste');
    expect(witch.name).toBe('Čarodějnice na koštěti');
    expect(witch.isFlying).toBe(true);
    expect(witch.method).toBe('drawBroomWitch');
    expect(witch.speed).toBeGreaterThanOrEqual(130);
    expect(witch.lore).toContain('Filipojakubská');
  });

  it('draws authentic Lada broom witch with kerchief, hooked profile, and ground drop shadow', () => {
    const mockCtx = createMockCanvasContext() as unknown as CanvasRenderingContext2D;
    expect(() => {
      Lada.drawBroomWitch(mockCtx, 150, 150, 1.0, 1, false);
    }).not.toThrow();

    expect(() => {
      Lada.drawBroomWitch(mockCtx, 150, 150, 1.0, -1, true, undefined, {
        flightAltitude: 30,
        vy: 40,
      });
    }).not.toThrow();
  });

  it('flies freely over obstacles and terrain without collision push-out', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const witch = engine.spawnMonster('carodejnice_koste', -650, -650);
    expect(witch.isFlying).toBe(true);

    // Place inside solid church nave obstacle
    const churchObstacle = DUBEN_OBSTACLES[0];
    witch.x = churchObstacle.x;
    witch.y = churchObstacle.y;

    // Obstacle resolution must ignore flying entities
    const collided = resolveDubenObstacles(witch, witch.isFlying);
    expect(collided).toBe(false);
    expect(witch.x).toBe(churchObstacle.x);
    expect(witch.y).toBe(churchObstacle.y);
  });

  it('alternates between dive-bomb strafes and hovering/hex states with banking flight altitude', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 0;
    player.y = 0;

    const witch = engine.spawnMonster('carodejnice_koste', 300, 0);
    expect(witch.witchState).toBe('dive');

    // Update forward: dive-bomb accelerates fast directly toward player
    witch.update(0.1, player);
    expect(witch.flightAltitude).toBeGreaterThan(0);
    expect(witch.vx).toBeLessThan(0); // swooping left toward player at 0, 0

    // Force transition to hover state
    witch.witchStateTimer = 0;
    witch.update(0.05, player);
    expect(witch.witchState).toBe('hover');
    expect(witch.witchStateTimer).toBeGreaterThan(2.0);
  });

  it('telegraphs ground hex circle (Uřknutí) and detonates into a curse burst', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 0;
    player.y = 0;
    player.hp = 100;
    player.maxHp = 100;
    player.hpRegen = 0;

    const witch = engine.spawnMonster('carodejnice_koste', 150, 0);
    witch.witchState = 'hover';
    witch.witchHexCooldown = 0.02; // ready to cast immediately

    witch.update(0.05, player);

    // Hazard must be spawned into director hazards
    const hazards = engine.director?.hazards || [];
    const hex = hazards.find((h: any) => h.kind === 'hex-circle' || h.type === 'curse');
    expect(hex).toBeDefined();
    expect(hex.warningTimer).toBeGreaterThan(0);
    expect(hex.damage).toBeGreaterThan(0);

    // Step while in warning window: player takes no damage yet
    engine.director?.update(0.5, engine);
    expect(player.hp).toBe(100);

    // Step beyond warning window: hex detonates and inflicts damage
    engine.director?.update(0.8, engine);
    expect(player.hp).toBeLessThan(100);
  });

  it('Maypole holy warding boundary nullifies Uřknutí curses', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 0;
    player.y = 0;
    player.hp = 100;
    player.maxHp = 100;
    player.hpRegen = 0;

    // Activate Maypole ward
    engine.state.dubenDen.maypoleWardActive = true;

    // Add a hex hazard directly on top of player with warningTimer expired
    engine.director?.hazards.push({
      id: 'hazard_test_curse',
      x: 0,
      y: 0,
      radius: 50,
      duration: 1.5,
      type: 'curse',
      kind: 'hex-circle',
      warningTimer: 0,
      damage: 30,
      oneShot: true,
      exploded: false,
    });

    // Step director: Maypole ward blocks curse damage completely!
    engine.director?.update(0.2, engine);
    expect(player.hp).toBe(100);
  });

  it('generates cinder and ember exhaust particles while flying', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    const witch = engine.spawnMonster('carodejnice_koste', 200, 200);

    const initialParticles = engine.state.particles?.length || 0;

    for (let i = 0; i < 20; i++) {
      witch.update(0.05, player);
    }

    const currentParticles = engine.state.particles || [];
    expect(currentParticles.length).toBeGreaterThan(initialParticles);

    const embers = currentParticles.filter(
      (p: any) => p.color === '#F97316' || p.color === '#FBBF24'
    );
    expect(embers.length).toBeGreaterThan(0);
  });
});
