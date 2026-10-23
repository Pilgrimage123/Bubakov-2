import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine, type WeaponAction } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import { createDefaultMetaProgression } from '../src/game/migration';
import { ENEMIES } from '../src/data/enemies';

describe('GameEngine Headless Simulation', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('Instantiation and Run Initialization', () => {
    it('instantiates cleanly with default state and spatial hash', () => {
      expect(engine.state).toBeDefined();
      expect(engine.spatialHash).toBeDefined();
      expect(engine.state.gameTime).toBe(0);
      expect(engine.state.enemies).toEqual([]);
      expect(engine.livingEnemies).toEqual([]);
    });

    it('can be instantiated with a custom EngineState', () => {
      const customState = createInitialEngineState();
      customState.gameTime = 42;
      customState.activeLevelId = 3;
      const customEngine = new GameEngine(customState);
      expect(customEngine.state.gameTime).toBe(42);
      expect(customEngine.state.activeLevelId).toBe(3);
    });

    it('initializes a run with specific level, hunter, and meta progression', () => {
      const meta = createDefaultMetaProgression();
      meta.wallLevel = 2; // +40 hp bonus
      engine.initRun(1, 'wanderer', meta);

      expect(engine.state.activeLevelId).toBe(1);
      expect(engine.state.player).toBeDefined();
      expect(engine.state.player.type).toBe('wanderer');
      // Wanderer base 230 hp + 20% wall bonus (46) = 276 hp
      expect(engine.state.player.maxHp).toBe(276);
      expect(engine.state.player.weapons.length).toBe(1);
      expect(engine.state.player.weapons[0].id).toBe('bylinkova_fajfka');
    });

    it('initializes wanderer specifically with bylinkova_fajfka only', () => {
      const p = engine.createPlayer('wanderer');
      expect(p.weapons).toHaveLength(1);
      expect(p.weapons[0].id).toBe('bylinkova_fajfka');
    });

    it('initializes krajanek specifically with osikovy_prut', () => {
      const p = engine.createPlayer('krajanek');
      expect(p.weapons).toHaveLength(1);
      expect(p.weapons[0].id).toBe('osikovy_prut');
    });

    it('initializes a run using options object with shepherd on level 2', () => {
      engine.initRun({
        levelId: 2,
        hunterType: 'shepherd',
        spawnInitialWave: false,
      });

      expect(engine.state.activeLevelId).toBe(2);
      expect(engine.state.player.type).toBe('shepherd');
      expect(engine.state.player.weapons[0].id).toBe('povidlove_buchty');
      expect(engine.state.enemies.length).toBe(0);
    });
  });

  describe('Hunter base stats', () => {
    it('sets Tulák base courage to 230 and luck to 70', () => {
      const wanderer = engine.createPlayer('wanderer');
      expect(wanderer.maxHp).toBe(230);
      expect(wanderer.hp).toBe(230);
      expect(wanderer.luck).toBe(70);
    });
  });

  describe('Stepping Simulation via update(dt)', () => {
    beforeEach(() => {
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('advances gameTime and uiTime deterministically', () => {
      engine.update(0.016);
      expect(engine.state.gameTime).toBeCloseTo(0.016, 5);
      expect(engine.state.uiTime).toBeCloseTo(0.016, 5);

      engine.update(0.034);
      expect(engine.state.gameTime).toBeCloseTo(0.05, 5);
    });

    it('updates player coordinates given key inputs', () => {
      const startX = engine.state.player.x;
      const startY = engine.state.player.y;
      const speed = engine.state.player.speed;

      // Move Right (KeyD)
      engine.state.keys['KeyD'] = true;
      engine.update(0.1);
      expect(engine.state.player.x).toBeGreaterThan(startX);
      expect(engine.state.player.x).toBeCloseTo(startX + speed * 0.1, 1);
      expect(engine.state.player.y).toBe(startY);
      delete engine.state.keys['KeyD'];

      // Move Down (KeyS)
      engine.state.keys['KeyS'] = true;
      engine.update(0.1);
      expect(engine.state.player.y).toBeGreaterThan(startY);
      delete engine.state.keys['KeyS'];

      // Move Left (KeyA)
      engine.state.keys['KeyA'] = true;
      engine.update(0.1);
      delete engine.state.keys['KeyA'];

      // Move Up (KeyW)
      engine.state.keys['KeyW'] = true;
      engine.update(0.1);
      delete engine.state.keys['KeyW'];
    });

    it('decrements player ability cooldowns and status timers during stepping', () => {
      engine.state.player.ultCd = 10.0;
      engine.state.player.invulnerabilityTimer = 2.0;
      engine.state.player.waterSoakedTimer = 1.5;

      engine.update(0.5);

      expect(engine.state.player.ultCd).toBeLessThan(10.0);
      expect(engine.state.player.invulnerabilityTimer).toBeCloseTo(1.5, 4);
      expect(engine.state.player.waterSoakedTimer).toBeCloseTo(1.0, 4);
    });
  });

  describe('Spatial Hashing and Entity Registration', () => {
    beforeEach(() => {
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('registers spawned monsters into spatialHash and livingEnemies', () => {
      const monster = engine.spawnMonster('rarach', 150, 200);

      expect(monster).toBeDefined();
      expect(monster.id).toBe('rarach');
      expect(monster.x).toBe(150);
      expect(monster.y).toBe(200);

      expect(engine.state.enemies).toContain(monster);
      expect(engine.livingEnemies).toContain(monster);

      const queried = engine.queryRadius(150, 200, 50);
      expect(queried).toContain(monster);

      const farQueried = engine.queryRadius(1000, 1000, 50);
      expect(farQueried).not.toContain(monster);
    });

    it('updates spatialHash positions after simulation update', () => {
      // Spawn outside weapon reach (osikovy prut reach ~140)
      const monster = engine.spawnMonster('rarach', 300, 0);
      // Monster will walk towards player at (0, 0)
      engine.update(0.5);

      expect(monster.x).toBeLessThan(300);

      // Query near new position should find the monster
      const near = engine.queryCircle(monster.x, monster.y, 20);
      expect(near).toContain(monster);
    });

    it('finds nearest entity via queryNearest', () => {
      const m1 = engine.spawnMonster('rarach', 100, 0);
      const m2 = engine.spawnMonster('rarach', 300, 0);

      const nearest = engine.queryNearest(0, 0, 500);
      expect(nearest).toBe(m1);
    });
  });

  describe('Querying Visible Entities', () => {
    beforeEach(() => {
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('returns depth-sorted visible entities within viewport bounds', () => {
      engine.state.player.x = 0;
      engine.state.player.y = 50;

      const insideEnemy1 = engine.spawnMonster('rarach', 20, 10);
      const insideEnemy2 = engine.spawnMonster('rarach', 30, 100);
      const outsideEnemy = engine.spawnMonster('rarach', 1000, 1000);

      // Viewport: left -200, top -200, right 200, bottom 200
      const visible = engine.getVisibleEntities(-200, -200, 200, 200);

      expect(visible).toContain(insideEnemy1);
      expect(visible).toContain(insideEnemy2);
      expect(visible).toContain(engine.state.player);
      expect(visible).not.toContain(outsideEnemy);

      // Verify isometric depth sort: y values ascending
      for (let i = 0; i < visible.length - 1; i++) {
        expect(visible[i].y).toBeLessThanOrEqual(visible[i + 1].y);
      }
    });

    it('returns all active entities sorted by Y when no viewport bounds are specified', () => {
      engine.state.player.y = 100;
      const e1 = engine.spawnMonster('rarach', 0, 200);
      const e2 = engine.spawnMonster('rarach', 0, 50);

      const all = engine.getVisibleEntities();
      expect(all.length).toBe(3);
      expect(all[0]).toBe(e2); // y = 50
      expect(all[1]).toBe(engine.state.player); // y = 100
      expect(all[2]).toBe(e1); // y = 200
    });
  });

  describe('Weapon Actions and Projectile/Slash Dispatch', () => {
    beforeEach(() => {
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('dispatches and updates projectiles via applyWeaponAction', () => {
      const enemy = engine.spawnMonster('rarach', 100, 0);
      const initialHp = enemy.hp;

      // Fire projectile to the right toward the enemy
      const action: WeaponAction = {
        type: 'projectile',
        proj: {
          x: 0,
          y: 0,
          angle: 0,
          speed: 400,
          dmg: 25,
          radius: 15,
          life: 2.0,
        },
      };

      const proj = engine.applyWeaponAction(action);
      expect(engine.state.projectiles).toContain(proj);

      // Step until projectile reaches enemy at x = 100 (approx 0.25s)
      for (let i = 0; i < 20; i++) {
        engine.update(0.016);
      }

      // Enemy should have taken damage
      expect(enemy.hp).toBeLessThan(initialHp);
    });

    it('dispatches melee slashes and damages enemies in arc', () => {
      const enemy = engine.spawnMonster('rarach', 40, 0);
      const initialHp = enemy.hp;

      const slashAction: WeaponAction = {
        type: 'slash',
        slash: {
          x: 0,
          y: 0,
          angle: 0,
          reach: 80,
          arc: Math.PI,
          dmg: 30,
          life: 0.2,
        },
      };

      const slash = engine.applyWeaponAction(slashAction);
      expect(engine.state.slashes).toContain(slash);

      engine.update(0.05);

      expect(enemy.hp).toBeLessThan(initialHp);
    });

    it('dispatches area impacts and damages enemies within radius', () => {
      const enemy1 = engine.spawnMonster('rarach', 30, 20);
      const enemy2 = engine.spawnMonster('rarach', 500, 500);
      const initHp1 = enemy1.hp;
      const initHp2 = enemy2.hp;

      engine.applyWeaponAction({
        type: 'areaImpact',
        impact: {
          x: 0,
          y: 0,
          radius: 80,
          dmg: 40,
        },
      });

      expect(enemy1.hp).toBeLessThan(initHp1);
      expect(enemy2.hp).toBe(initHp2);
    });
  });


  describe('Hunter contact repulse and hit invulnerability', () => {
    beforeEach(() => {
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('repulses on physical contact before an enemy attack lands', () => {
      const hunter = engine.state.player;
      const enemy = engine.spawnMonster('rarach', hunter.x + hunter.radius + 1, hunter.y);
      enemy.x = hunter.x + hunter.radius + enemy.radius - 1;
      const repulseSpy = vi.spyOn(hunter, 'counterMeleeAttacker');

      // Directly exercise the same collision gate used by GameEngine.update.
      hunter.counterMeleeAttacker(enemy);

      expect(repulseSpy).toHaveBeenCalledWith(enemy);
      expect(enemy.hp).toBeLessThan(ENEMIES.rarach.hp); // contact counter dealt damage
      expect(hunter.repulseCooldown).toBeCloseTo(1.2, 5);
    });

    it('gives the hunter 0.3 seconds of invulnerability after taking damage', () => {
      const hunter = engine.state.player;
      hunter.takeDamage(10, 'physical');
      expect(hunter.hp).toBeLessThan(hunter.maxHp);
      expect(hunter.invulnerabilityTimer).toBeCloseTo(0.3, 5);

      const hpAfterFirstHit = hunter.hp;
      hunter.takeDamage(10, 'physical');
      expect(hunter.hp).toBe(hpAfterFirstHit);

      engine.update(0.1);
      expect(hunter.invulnerabilityTimer).toBeCloseTo(0.2, 5);
    });

    it('sets the shepherd base courage to half of its previous value', () => {
      const shepherd = engine.createPlayer('shepherd');
      expect(shepherd.maxHp).toBe(55);
      expect(shepherd.hp).toBe(55);
    });

    it('gives the shepherd a 35 percent dodge chance', () => {
      const shepherd = engine.createPlayer('shepherd');
      expect(shepherd.dodgeChance).toBe(0.35);
    });

    it('doubles the shepherd melee-hit invulnerability window only', () => {
      engine.initRun({ levelId: 1, hunterType: 'shepherd', spawnInitialWave: false });
      const shepherd = engine.state.player;
      const enemy = engine.spawnMonster('rarach', shepherd.x + 100, shepherd.y);
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(1);
      try {
        shepherd.takeDamage(10, 'physical', enemy, true);
        expect(shepherd.invulnerabilityTimer).toBeCloseTo(0.6, 5);
      } finally {
        randomSpy.mockRestore();
      }
    });

    it('scales repulse damage, knockback and stun with max courage', () => {
      const hunter = engine.state.player;
      const enemy = engine.spawnMonster('rarach', 100, 0);
      hunter.maxHp = 300;
      hunter.x = 0;
      hunter.y = 0;
      enemy.x = 100;
      enemy.y = 0;

      const initialHp = enemy.hp;
      const expectedForce = 1080 * (hunter.maxHp / 200);
      const takeDamageSpy = vi.spyOn(enemy, 'takeDamage');
      hunter.counterMeleeAttacker(enemy);

      expect(enemy.hp).toBe(0); // The scaled counter damage defeats this 48-HP enemy.
      expect(takeDamageSpy).toHaveBeenCalledWith(
        90,
        'physical',
        expectedForce,
        0,
        expect.objectContaining({ stunDuration: 0.875 * (hunter.maxHp / 200) })
      );
    });
  });

  describe('Deterministic Headless Execution Outside DOM', () => {
    it('executes identically across two distinct instances with identical inputs', () => {
      const engine1 = new GameEngine();
      const engine2 = new GameEngine();

      engine1.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });
      engine2.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });

      engine1.spawnMonster('rarach', 200, 150);
      engine2.spawnMonster('rarach', 200, 150);

      // Identical inputs
      engine1.state.keys['KeyD'] = true;
      engine2.state.keys['KeyD'] = true;

      for (let step = 0; step < 60; step++) {
        engine1.update(1 / 60);
        engine2.update(1 / 60);
      }

      expect(engine1.state.player.x).toBe(engine2.state.player.x);
      expect(engine1.state.player.y).toBe(engine2.state.player.y);
      expect(engine1.state.enemies[0].x).toBe(engine2.state.enemies[0].x);
      expect(engine1.state.enemies[0].y).toBe(engine2.state.enemies[0].y);
      expect(engine1.state.gameTime).toBe(engine2.state.gameTime);
    });

    it('handles enemy defeat and drop collection purely headlessly', () => {
      engine.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });
      const enemy = engine.spawnMonster('rarach', 30, 0);

      // Deal lethal damage to enemy
      enemy.takeDamage(1000, 'physical', 0, 0);
      expect(enemy.isDefeated).toBe(true);

      // Spawn a coin drop at player position
      engine.state.drops.push({
        type: 'coin',
        value: 10,
        x: 0,
        y: 0,
        radius: 12,
        time: 0,
        dead: false,
      });

      const initialCoins = engine.state.coins;
      engine.update(0.1);

      // Drop should be collected and coins incremented
      expect(engine.state.coins).toBe(initialCoins + 10);
      expect(engine.state.drops.filter((d) => !d.dead).length).toBe(0);
    });
  });
});
