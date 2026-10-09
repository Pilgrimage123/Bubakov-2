import { describe, it, expect, beforeEach } from 'vitest';
import {
  performDropFusion,
  applyMagnetWave,
  registerKillAndCheckCombo,
  calculateUncollectedGingerbread,
  createDropInstance,
  MAX_DROPS_LIMIT,
  HOT_GINGERBREAD_DURATION,
} from '../src/game/drops';
import { GameEngine } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import type { GameDrop } from '../src/types';

describe('Smart Drops System (Chytrý drop systém)', () => {
  describe('performDropFusion (Slévání kořisti)', () => {
    it('does not fuse drops when count is below limit', () => {
      const drops: GameDrop[] = [
        createDropInstance('gingerbread', 0, 0, { value: 2, size: 'small' }),
        createDropInstance('gingerbread', 10, 10, { value: 2, size: 'small' }),
      ];
      const fused = performDropFusion(drops, undefined, 10);
      expect(fused).toBe(0);
      expect(drops.filter((d) => !d.dead).length).toBe(2);
    });

    it('fuses 3 small gingerbreads into 1 large gingerbread when limit is exceeded', () => {
      const drops: GameDrop[] = [
        createDropInstance('gingerbread', 0, 0, { value: 2, size: 'small' }),
        createDropInstance('gingerbread', 5, 5, { value: 2, size: 'small' }),
        createDropInstance('gingerbread', 10, 10, { value: 2, size: 'small' }),
      ];
      // Limit 1 will force fusion of the 3 small drops into 1 large drop
      const fused = performDropFusion(drops, undefined, 1);
      expect(fused).toBeGreaterThan(0);
      const alive = drops.filter((d) => !d.dead);
      expect(alive.length).toBe(1);
      expect(alive[0].size).toBe('large');
      expect(alive[0].value).toBe(6);
    });

    it('fuses 3 large gingerbreads into 1 giant gingerbread', () => {
      const drops: GameDrop[] = [
        createDropInstance('gingerbread', 0, 0, { value: 6, size: 'large' }),
        createDropInstance('gingerbread', 5, 5, { value: 6, size: 'large' }),
        createDropInstance('gingerbread', 10, 10, { value: 6, size: 'large' }),
      ];
      const fused = performDropFusion(drops, undefined, 1);
      expect(fused).toBeGreaterThan(0);
      const alive = drops.filter((d) => !d.dead);
      expect(alive.length).toBe(1);
      expect(alive[0].size).toBe('giant');
      expect(alive[0].value).toBe(20);
    });

    it('fuses small coins into a accumulated value coin', () => {
      const drops: GameDrop[] = [
        createDropInstance('coin', 0, 0, { value: 1 }),
        createDropInstance('coin', 1, 1, { value: 1 }),
        createDropInstance('coin', 2, 2, { value: 1 }),
        createDropInstance('coin', 3, 3, { value: 2 }),
        createDropInstance('coin', 4, 4, { value: 1 }),
      ];
      const fused = performDropFusion(drops, undefined, 1);
      expect(fused).toBeGreaterThan(0);
      const alive = drops.filter((d) => !d.dead);
      expect(alive.length).toBe(1);
      expect(alive[0].type).toBe('coin');
      expect(alive[0].value).toBe(6); // 1 + 1 + 1 + 2 + 1
    });

    it('fuses off-screen drops first when view bounds are provided', () => {
      const bounds = { left: 0, top: 0, right: 800, bottom: 600 };
      const onScreenSmall = createDropInstance('gingerbread', 400, 300, { value: 2, size: 'small' });
      const offScreenDrops = [
        createDropInstance('gingerbread', -500, -500, { value: 2, size: 'small' }),
        createDropInstance('gingerbread', -510, -510, { value: 2, size: 'small' }),
        createDropInstance('gingerbread', -520, -520, { value: 2, size: 'small' }),
      ];
      const drops = [onScreenSmall, ...offScreenDrops];

      performDropFusion(drops, bounds, 2);
      // onScreenSmall must NOT be dead
      expect(onScreenSmall.dead).toBe(false);
      // Offscreen drops were fused into 1 large drop
      expect(offScreenDrops[0].dead).toBe(true);
      expect(offScreenDrops[1].dead).toBe(true);
      expect(offScreenDrops[2].dead).toBe(true);
    });
  });

  describe('applyMagnetWave (Magnetická rázová vlna)', () => {
    it('pulls drops within radius towards target position', () => {
      const dropInside = createDropInstance('gingerbread', 100, 100, { speed: 0 });
      const dropOutside = createDropInstance('gingerbread', 1000, 1000, { speed: 0 });
      const drops = [dropInside, dropOutside];

      const pulled = applyMagnetWave(drops, 0, 0, 300, false);
      expect(pulled).toBe(1);
      expect(dropInside.vx).toBeLessThan(0);
      expect(Math.abs(dropOutside.vx)).toBe(0);
      expect(Math.abs(dropOutside.vy)).toBe(0);
    });

    it('fullScreen magnet wave pulls all active drops regardless of distance', () => {
      const drop1 = createDropInstance('coin', 1000, 1000);
      const drop2 = createDropInstance('potion', -2000, 500);
      const drops = [drop1, drop2];

      const pulled = applyMagnetWave(drops, 0, 0, 200, true);
      expect(pulled).toBe(2);
      expect(drop1.vx).toBeLessThan(0);
      expect(drop2.vx).toBeGreaterThan(0);
    });
  });

  describe('registerKillAndCheckCombo (Kombo pulzy)', () => {
    it('returns false when kill count is below 30', () => {
      const state = createInitialEngineState();
      for (let i = 0; i < 29; i++) {
        expect(registerKillAndCheckCombo(state, 1.0)).toBe(false);
      }
    });

    it('triggers combo on 30th kill within 1.2s window', () => {
      const state = createInitialEngineState();
      for (let i = 0; i < 29; i++) {
        registerKillAndCheckCombo(state, 1.0 + i * 0.02);
      }
      const triggered = registerKillAndCheckCombo(state, 1.0 + 29 * 0.02);
      expect(triggered).toBe(true);
      // Resets after triggering
      expect(state.killTimestamps.length).toBe(0);
    });

    it('ignores kills that occurred older than 1.2s', () => {
      const state = createInitialEngineState();
      for (let i = 0; i < 25; i++) {
        registerKillAndCheckCombo(state, 0.5);
      }
      // Jump 5 seconds later
      for (let i = 0; i < 5; i++) {
        registerKillAndCheckCombo(state, 5.5);
      }
      expect(state.killTimestamps.length).toBe(5);
    });
  });

  describe('calculateUncollectedGingerbread', () => {
    it('calculates sum and accounts for hot 2x gingerbread', () => {
      const drops: GameDrop[] = [
        createDropInstance('gingerbread', 0, 0, { value: 6 }),
        createDropInstance('gingerbread', 0, 0, { value: 2, isHot: true }),
        createDropInstance('coin', 0, 0, { value: 15 }),
      ];
      // 6 + (2 * 2) = 10
      expect(calculateUncollectedGingerbread(drops)).toBe(10);
    });
  });

  describe('GameEngine Integration with Smart Drops & Folklore Items', () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine();
      engine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
      });
    });

    it('Kovářská podkova pickup triggers full-map magnet wave', () => {
      const farDrop = createDropInstance('gingerbread', 800, 800, { value: 20 });
      const horseshoe = createDropInstance('horseshoe', engine.state.player.x, engine.state.player.y);
      engine.state.drops = [farDrop, horseshoe];

      engine.update(0.016);
      expect(horseshoe.dead).toBe(true);
      // farDrop should be accelerating towards player
      expect(farDrop.vx).toBeLessThan(0);
      expect(farDrop.vy).toBeLessThan(0);
    });

    it('Hliněný kohoutek pickup clears regular enemies and damages bosses', () => {
      const regularEnemy = {
        id: 'rarach',
        x: 100,
        y: 100,
        hp: 40,
        maxHp: 40,
        isBoss: false,
        isMiniboss: false,
        takeDamage(dmg: number) {
          this.hp -= dmg;
          if (this.hp <= 0) this.dead = true;
        },
      };
      const bossEnemy = {
        id: 'cert',
        x: 200,
        y: 200,
        hp: 2000,
        maxHp: 2000,
        isBoss: true,
        takeDamage(dmg: number) {
          this.hp -= dmg;
        },
      };
      engine.state.enemies = [regularEnemy as any, bossEnemy as any];
      const rooster = createDropInstance('rooster', engine.state.player.x, engine.state.player.y);
      engine.state.drops = [rooster];

      engine.update(0.016);
      expect(rooster.dead).toBe(true);
      expect(regularEnemy.dead).toBe(true);
      expect(bossEnemy.hp).toBe(1350); // 2000 - 650
      expect(engine.state.screenFlashTimer).toBeGreaterThan(0);
    });

    it('Vyřezávané kukačky pickup freezes enemies via timeStopTimer', () => {
      let enemyUpdated = false;
      const testEnemy = {
        id: 'skeleton',
        x: 100,
        y: 100,
        hp: 50,
        update() {
          enemyUpdated = true;
        },
      };
      engine.state.enemies = [testEnemy as any];
      const cuckoo = createDropInstance('cuckoo_clock', engine.state.player.x, engine.state.player.y);
      engine.state.drops = [cuckoo];

      engine.update(0.016);
      expect(cuckoo.dead).toBe(true);
      expect(engine.state.timeStopTimer).toBe(4.0);

      // In next frame, enemy update must be skipped while timeStopTimer is active
      enemyUpdated = false;
      engine.update(0.016);
      expect(enemyUpdated).toBe(false);
      expect(engine.state.timeStopTimer).toBeCloseTo(3.984, 2);
    });

    it('Hot gingerbread gives double value when collected before cooling down', () => {
      const initialGingerbread = engine.state.gingerbread;
      const hotDrop = createDropInstance('gingerbread', engine.state.player.x, engine.state.player.y, {
        value: 6,
        isHot: true,
        goldenRushTimer: 3.0,
      });
      engine.state.drops = [hotDrop];

      engine.update(0.016);
      expect(hotDrop.dead).toBe(true);
      // Double value: 6 * 2 = 12
      expect(engine.state.gingerbread).toBe(initialGingerbread + 12);
    });

    it('Hot gingerbread timer cools down when time expires', () => {
      const hotDrop = createDropInstance('gingerbread', 5000, 5000, {
        value: 6,
        isHot: true,
        goldenRushTimer: 0.05,
      });
      engine.state.drops = [hotDrop];

      engine.update(0.1);
      expect(hotDrop.isHot).toBe(false);
    });

    it('Overkill flag is set when damage exceeds 3x monster max HP', () => {
      const enemy = engine.spawnMonster('rarach', 100, 100, 1.0);
      expect(enemy).toBeDefined();
      if (!enemy) return;

      // 40 max HP * 3 = 120 damage needed for overkill
      enemy.takeDamage(200, 'physical');
      expect(enemy.overkill).toBe(true);
      expect(enemy.isDefeated).toBe(true);
    });
  });
});
