import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { GAME_LEVELS } from '../src/data/levels';
import { GameEngine } from '../src/game/engine';

describe('Level 5 Miniboss: Čarodějnice Zaspalka (Overslept Witch)', () => {
  it('is scheduled as the 85-second miniboss for Stage 5 (Květen v Hrusicích)', () => {
    const lvl4 = GAME_LEVELS[4];
    expect(lvl4).toBeDefined();
    expect(lvl4.miniBoss).toBeDefined();
    expect(lvl4.miniBoss.id).toBe('carodejnice_zaspalka');
    expect(lvl4.miniBoss.time).toBe(85);
    expect(lvl4.miniBoss.name.toLowerCase()).toContain('zaspalka');
    expect(lvl4.miniBoss.warning.toLowerCase()).toContain('zaspalka');
  });

  it('registers carodejnice_zaspalka in ENEMIES and ENEMY_POINTS with boss stats', () => {
    const zaspalka = ENEMIES.carodejnice_zaspalka;
    expect(zaspalka).toBeDefined();
    expect(zaspalka.id).toBe('carodejnice_zaspalka');
    expect(zaspalka.category).toBe('bosses');
    expect(zaspalka.isFlying).toBe(true);
    expect(zaspalka.method).toBe('drawBroomWitchZaspalka');
    expect(zaspalka.hp).toBeGreaterThanOrEqual(1000);
    expect(zaspalka.speed).toBeGreaterThanOrEqual(180);
    expect(ENEMY_POINTS.carodejnice_zaspalka).toBeGreaterThan(500);
  });

  it('executes swoop strafing kinematics and emits ink smoke hazards behind flight path', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const zaspalka = engine.spawnMonster('carodejnice_zaspalka', 250, 200, 1.0, false, true);
    expect(zaspalka).toBeDefined();
    expect(zaspalka.isMiniboss).toBe(true);

    // Initial state setup
    engine.update(0.1);
    expect(zaspalka.zaspalkaState).toBe('swoop');
    expect(zaspalka.swoopAngle).toBeDefined();
    expect(Math.hypot(zaspalka.vx, zaspalka.vy)).toBeGreaterThan(200);

    // Advance multiple frames to trigger ink smoke hazard puff
    for (let i = 0; i < 5; i++) {
      engine.update(0.1);
    }

    const smokeHazards = engine.director?.hazards.filter(
      (h: any) => h.sourceEnemyId === 'carodejnice_zaspalka' || h.kind === 'ink-smoke'
    );
    expect(smokeHazards.length).toBeGreaterThan(0);
    expect(smokeHazards[0].slowFactor).toBeLessThan(1.0);
  });

  it('transitions from swoop to reposition banking phase after timeout', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const zaspalka = engine.spawnMonster('carodejnice_zaspalka', 250, 200, 1.0, false, true);

    // Update for 2.6 seconds (26 steps of 0.1s)
    for (let i = 0; i < 26; i++) {
      engine.update(0.1);
    }

    expect(zaspalka.zaspalkaState).toBe('reposition');
    expect(zaspalka.flightAltitude).toBeGreaterThan(0);
  });

  it('drops high-tier reward chest and clears ink smoke hazards upon defeat', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const zaspalka = engine.spawnMonster('carodejnice_zaspalka', 250, 200, 1.0, false, true);

    // Generate smoke hazard
    for (let i = 0; i < 5; i++) {
      engine.update(0.1);
    }

    const smokeBefore = engine.director?.hazards.filter((h: any) => h.kind === 'ink-smoke');
    expect(smokeBefore.length).toBeGreaterThan(0);

    // Defeat Zaspalka
    zaspalka.takeDamage(10000, 'holy');
    expect(zaspalka.isDefeated).toBe(true);

    // Verify all ink smoke hazards cleared
    const smokeAfter = engine.director?.hazards.filter((h: any) => h.kind === 'ink-smoke');
    expect(smokeAfter.length).toBe(0);

    // Verify reward chest dropped
    const chests = engine.state.drops.filter((d: any) => d.type === 'chest');
    expect(chests.length).toBeGreaterThan(0);
  });
});
