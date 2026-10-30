import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';
import { Lada } from '../src/render/ladaRenderer';

describe('Ticket 06: Podpůrný Koledník s řehtačkou a dubnové vlny', () => {
  it('registers rehtackar in ENEMIES with authentic Czech Easter folklore attributes', () => {
    const r = ENEMIES.rehtackar;
    expect(r).toBeDefined();
    expect(r.id).toBe('rehtackar');
    expect(r.name).toBe('Koledník s řehtačkou');
    expect(r.category).toBe('fields');
    expect(r.method).toBe('drawRehtackar');
    expect(r.hp).toBeGreaterThanOrEqual(70);
    expect(r.speed).toBeGreaterThanOrEqual(90);
    expect(r.lore).toContain('řehtačk');
  });

  it('draws authentic Lada Easter caroller with wooden ratchet, ribbons, and clattering soundwaves', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      lineJoin: 'round',
      lineCap: 'round',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    // Normal draw
    expect(() => {
      Lada.drawRehtackar(mockCtx, 100, 100, 1.0, 50, false);
    }).not.toThrow();

    // Clattering state with soundwaves active
    expect(() => {
      Lada.drawRehtackar(mockCtx, 100, 100, 1.0, 50, false, undefined, { clatterTimer: 0.4 });
    }).not.toThrow();
  });

  it('pulses soundwave aura and buffs nearby ally monsters with speed multiplier', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player!;
    player.x = 0;
    player.y = 500;

    // Spawn rehtackar at (100, 100)
    const caroller = engine.spawnMonster('rehtackar', 100, 100);
    expect(caroller).toBeDefined();
    expect(caroller.rehtackarPulseTimer).toBeGreaterThan(0);

    // Spawn ally 1 near caroller (within 160 px aura)
    const allyNear = engine.spawnMonster('rarach', 150, 100);
    // Spawn ally 2 far away (outside 160 px aura)
    const allyFar = engine.spawnMonster('rarach', 400, 100);

    const initialSpeedNear = allyNear.speed;
    expect(allyNear.rehtackarBuffTimer).toBe(0);

    // Force pulse trigger
    caroller.rehtackarPulseTimer = 0.01;
    caroller.update(0.02, player);

    // Nearby ally received the ratchet buff
    expect(allyNear.rehtackarBuffTimer).toBeGreaterThan(0);
    // Far ally did not receive the buff
    expect(allyFar.rehtackarBuffTimer).toBe(0);

    // Check effective speed calculation during update
    allyNear.update(0.01, player);
    // Ally with rehtackarBuffTimer moves faster (vx/vy proportional to spd * 1.30)
    const nearDistMoved = Math.hypot(allyNear.vx, allyNear.vy);
    allyFar.update(0.01, player);
    const farDistMoved = Math.hypot(allyFar.vx, allyFar.vy);

    expect(nearDistMoved).toBeGreaterThan(farDistMoved * 1.25);
  });

  it('populates Stage 3 spawn pools in levels.ts with proper April daylight mobs', () => {
    const stage3 = GAME_LEVELS[2];
    expect(stage3).toBeDefined();
    expect(stage3.spawnPools).toBeDefined();

    const noonPool = stage3.spawnPools.noon;
    expect(noonPool).toContain('zkazena_kraslice');
    expect(noonPool).toContain('rehtackar');
    expect(noonPool).toContain('blatouch');
    expect(noonPool).toContain('zaba');

    const afternoonPool = stage3.spawnPools.afternoon;
    expect(afternoonPool).toContain('zkazena_kraslice');
    expect(afternoonPool).toContain('carodejnice_koste');
    expect(afternoonPool).toContain('rehtackar');
    expect(afternoonPool).toContain('divozenka');
    expect(afternoonPool).toContain('ropucha');
  });

  it('strictly excludes winter, autumn graveyard, and hell mobs from Stage 3 daylight encounters', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const director = engine.director!;
    const pool = (director as any).getWeightedPool(engine);

    // Stage 3 pool must not contain out-of-season mobs
    const outOfSeason = [
      'snehulak',
      'tajici_snehulak',
      'mrazik',
      'zmrzlik',
      'severak',
      'mrazovy_skritek',
      'mrazivy_obr',
      'jezinka_mraziva',
      'morana',
      'kostlivec',
      'kostlivec_kosa',
      'krvavy_kostlivec',
      'umrlec',
      'cert',
      'drab',
    ];

    for (const forbidden of outOfSeason) {
      expect(pool).not.toContain(forbidden);
    }

    // Every enemy in the active pool must be valid and non-boss
    for (const mobId of pool) {
      const e = ENEMIES[mobId];
      expect(e).toBeDefined();
      expect(e.category).not.toBe('frost');
      expect(e.category).not.toBe('undead');
      expect(e.category).not.toBe('bosses');
    }
  });
});
