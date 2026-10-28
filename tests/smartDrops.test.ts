import { describe, it, expect, beforeEach } from 'vitest';
import {
  performDropFusion,
  applyMagnetWave,
  registerKillAndCheckCombo,
  calculateUncollectedGingerbread,
  createDropInstance,
  canCollectDrop,
  resolveDynamicDrop,
  MAX_DROPS_LIMIT,
  HOT_GINGERBREAD_DURATION,
  FOOD_DROP_EXPIRATION,
  SOUL_DROP_EXPIRATION,
  MAX_ACTIVE_SOUL_DROPS,
  countActiveSoulDrops,
  spawnDropWithLimit,
  createPendingDropBank,
  releasePendingDrops,
  sweepCoinsIntoBigPouches,
  refundExpiredHotGingerbread,
  computeVulnerabilityScore,
  selectWeightedDropType,
  isHealingDrop,
} from '../src/game/drops';
import { GameEngine } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import type { GameDrop } from '../src/types';

describe('Smart Drops System (Chytrý drop systém)', () => {
  describe('healing drop pickup rules', () => {
    it('leaves potion, bread and pear on the map at full Courage', () => {
      expect(canCollectDrop('potion', 100, 100)).toBe(false);
      expect(canCollectDrop('bread', 100, 100)).toBe(false);
      expect(canCollectDrop('pear', 100, 100)).toBe(false);
    });

    it('allows healing drops when Courage is below maximum', () => {
      expect(canCollectDrop('potion', 99, 100)).toBe(true);
      expect(canCollectDrop('bread', 0, 100)).toBe(true);
      expect(canCollectDrop('pear', 50, 100)).toBe(true);
    });

    it('continues to allow non-healing pickups at full Courage', () => {
      expect(canCollectDrop('coin', 100, 100)).toBe(true);
      expect(canCollectDrop('gingerbread', 100, 100)).toBe(true);
      expect(canCollectDrop('soul', 100, 100)).toBe(true);
    });

    it('allows healing drops at full Courage if player has Bear Mask for overheal damage', () => {
      const bearPlayer = { bearMaskLevel: 1 };
      expect(canCollectDrop('potion', 100, 100, bearPlayer)).toBe(true);
      expect(canCollectDrop('bread', 100, 100, bearPlayer)).toBe(true);
      expect(canCollectDrop('pear', 100, 100, bearPlayer)).toBe(true);
    });
  });

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
      expect(alive[0].value).toBe(18); // 6 + 6 + 6: fusion preserves the exact input value.
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

  describe('resolveDynamicDrop (Chytré nahrazení léčiv při plné Kuráži)', () => {
    it('keeps healing drops intact when Courage is low or injured', () => {
      const potionDrop = resolveDynamicDrop('potion', 30, 100);
      expect(potionDrop.type).toBe('potion');

      const breadDrop = resolveDynamicDrop('bread', 50, 100);
      expect(breadDrop.type).toBe('bread');
    });

    it('significantly reduces healing drops when Courage is full, converting to coins, gingerbread, or souls', () => {
      let convertedCount = 0;
      let healingCount = 0;
      const totalRolls = 200;

      for (let i = 0; i < totalRolls; i++) {
        const resolved = resolveDynamicDrop('potion', 100, 100);
        if (resolved.type === 'potion') {
          healingCount++;
        } else {
          convertedCount++;
          expect(['coin', 'gingerbread', 'soul', 'horseshoe', 'cuckoo_clock']).toContain(resolved.type);
        }
      }

      // Over 70% should be converted away from healing items when Courage is full
      expect(convertedCount).toBeGreaterThan(140);
      expect(healingCount).toBeLessThan(60);
    });

    it('assigns FOOD_DROP_EXPIRATION (25s) to healing drops by default', () => {
      const drop = createDropInstance('bread', 0, 0);
      expect(drop.expiration).toBe(FOOD_DROP_EXPIRATION);
      expect(drop.expiration).toBe(25.0);

      const potion = createDropInstance('potion', 0, 0);
      expect(potion.expiration).toBe(25.0);

      const pear = createDropInstance('pear', 0, 0);
      expect(pear.expiration).toBe(25.0);

      // Coins do not expire by default
      const coin = createDropInstance('coin', 0, 0);
      expect(coin.expiration).toBeUndefined();
    });

    it('expires unconsumed food drops in GameEngine so they are not stuck on the meadow indefinitely', () => {
      const engine = new GameEngine();
      engine.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });
      const foodDrop = createDropInstance('bread', 100, 100, { expiration: 0.1 });
      engine.state.drops = [foodDrop];

      expect(engine.state.drops[0].dead).toBe(false);
      engine.update(0.15);
      expect(foodDrop.dead).toBe(true);
      expect(engine.state.drops.length).toBe(0);
    });

    it('fuses or prunes excess off-screen unconsumed food drops in performDropFusion', () => {
      const bounds = { left: 0, top: 0, right: 800, bottom: 600 };
      const offScreenFood1 = createDropInstance('bread', -500, -500);
      const offScreenFood2 = createDropInstance('pear', -520, -520);
      const onScreenCoin = createDropInstance('coin', 400, 300);
      const drops = [onScreenCoin, offScreenFood1, offScreenFood2];

      // Limit 1 forces fusion
      const fused = performDropFusion(drops, bounds, 1);
      expect(fused).toBeGreaterThan(0);
      expect(offScreenFood1.dead).toBe(true);
      expect(offScreenFood2.dead).toBe(true);
      expect(onScreenCoin.dead).toBe(false);
      const aliveStashes = drops.filter((d) => !d.dead && d.type === 'gingerbread_stash');
      expect(aliveStashes.length).toBe(1);
    });

    it('suppresses mercy healing drops and diverts them when mercyCooldownActive is true', () => {
      let divertedCount = 0;
      for (let i = 0; i < 50; i++) {
        const res = resolveDynamicDrop('potion', 20, 100, {
          pacingPhase: 'mercy',
          mercyCooldownActive: true,
        });
        if (res.type !== 'potion') {
          divertedCount++;
        }
      }
      expect(divertedCount).toBeGreaterThan(30);
    });

    it('assigns SOUL_DROP_EXPIRATION (16s) to soul jars by default so they do not stay in the arena forever', () => {
      const soulDrop = createDropInstance('soul', 50, 50);
      expect(soulDrop.expiration).toBe(SOUL_DROP_EXPIRATION);
      expect(soulDrop.expiration).toBe(16.0);

      const resolvedSoul = resolveDynamicDrop('soul', 80, 100, { activeSoulsCount: 0, soulBuffActive: false });
      expect(resolvedSoul.type).toBe('soul');
      expect(resolvedSoul.expiration).toBe(SOUL_DROP_EXPIRATION);
    });

    it('diverts excess soul jars into useful rewards when the arena already has MAX_ACTIVE_SOUL_DROPS or active soul buff', () => {
      const existingSouls = [
        createDropInstance('soul', 100, 100),
        createDropInstance('soul', 200, 200),
      ];
      expect(countActiveSoulDrops(existingSouls)).toBe(MAX_ACTIVE_SOUL_DROPS);

      // When arena is saturated with 2 soul jars, 100% of new soul drops are diverted
      for (let i = 0; i < 30; i++) {
        const res = resolveDynamicDrop('soul', 90, 100, {
          activeDrops: existingSouls,
        });
        expect(res.type).not.toBe('soul');
        expect(['coin', 'gingerbread', 'bread']).toContain(res.type);
      }

      // Diverted healing drops also never turn into soul jars when soul jars are already present
      for (let i = 0; i < 50; i++) {
        const res = resolveDynamicDrop('potion', 100, 100, {
          forceDivert: true,
          activeDrops: existingSouls,
        });
        expect(res.type).not.toBe('soul');
      }
    });

    it('caps active soul jars in spawnDropWithLimit and converts overflow into coins', () => {
      const drops: GameDrop[] = [];
      const bank = createPendingDropBank();

      spawnDropWithLimit(drops, createDropInstance('soul', 10, 10), bank);
      spawnDropWithLimit(drops, createDropInstance('soul', 20, 20), bank);
      expect(countActiveSoulDrops(drops)).toBe(2);

      // Third soul drop is automatically converted to a 6-krejcar coin
      const third = createDropInstance('soul', 30, 30);
      spawnDropWithLimit(drops, third, bank);
      expect(countActiveSoulDrops(drops)).toBe(2);
      expect(third.type).toBe('coin');
      expect(third.value).toBe(6);
    });

    it('fuses off-screen uncollected soul jars into a gold coin in performDropFusion when over limit', () => {
      const bounds = { left: 0, top: 0, right: 800, bottom: 600 };
      const offScreenSoul1 = createDropInstance('soul', -400, -400);
      const offScreenSoul2 = createDropInstance('soul', -450, -450);
      const onScreenCoin = createDropInstance('coin', 400, 300, { value: 5 });
      const drops = [onScreenCoin, offScreenSoul1, offScreenSoul2];

      const fused = performDropFusion(drops, bounds, 1);
      expect(fused).toBeGreaterThan(0);
      expect(offScreenSoul1.dead).toBe(true);
      expect(offScreenSoul2.dead).toBe(true);
      const fusedCoins = drops.filter((d) => !d.dead && d.type === 'coin' && d.value === 16);
      expect(fusedCoins.length).toBe(1);
    });

    it('preserves ~60% of healing drops at full Courage when hunter has Bear Mask (bearMaskLevel > 0)', () => {
      let healingCount = 0;
      const totalRolls = 200;

      for (let i = 0; i < totalRolls; i++) {
        const resolved = resolveDynamicDrop('potion', 100, 100, {
          bearMaskLevel: 2,
          pacingPhase: 'stress',
          vulnerabilityScore: 0.1,
        });
        if (resolved.type === 'potion') {
          healingCount++;
        }
      }

      // With Bear Mask, only 40% is diverted (~60% kept as healing), compared to 88% diverted without Bear Mask
      expect(healingCount).toBeGreaterThan(85);
    });

    it('computes Vulnerability Score V accurately from real weapon cooldowns (w.cd / lastMaxCd) and ultimate readiness', () => {
      const readyPlayer = {
        hp: 100,
        maxHp: 100,
        x: 0,
        y: 0,
        weapons: [
          { id: ' prak', cd: 0, lastMaxCd: 1.0 },
          { id: 'bic', cd: 0, lastMaxCd: 1.2 },
        ],
        ultCd: 0,
        ultMaxCd: 20,
      };
      const exhaustingPlayer = {
        hp: 100,
        maxHp: 100,
        x: 0,
        y: 0,
        weapons: [
          { id: 'prak', cd: 1.0, lastMaxCd: 1.0 },
          { id: 'bic', cd: 1.2, lastMaxCd: 1.2 },
        ],
        ultCd: 20,
        ultMaxCd: 20,
      };

      const vReady = computeVulnerabilityScore(readyPlayer, 0, 0);
      const vExhausted = computeVulnerabilityScore(exhaustingPlayer, 0, 0);

      // Exhausted weapons + ultimate on cooldown adds +0.15 (w3_resource = 0.15) to V
      expect(vExhausted).toBeCloseTo(vReady + 0.15, 2);
    });

    it('sweeps nearby coins within 60px into an active big_pouch', () => {
      const pouch = createDropInstance('big_pouch', 100, 100, { value: 30, radius: 16 });
      const nearCoin = createDropInstance('coin', 120, 100, { value: 5, radius: 8 });
      const farCoin = createDropInstance('coin', 300, 300, { value: 4, radius: 8 });
      const drops = [pouch, nearCoin, farCoin];

      // Step several frames so nearCoin is pulled into pouch and absorbed
      for (let i = 0; i < 10; i++) {
        sweepCoinsIntoBigPouches(drops, 0.05);
      }

      expect(nearCoin.dead).toBe(true);
      expect(pouch.value).toBe(35);
      expect(farCoin.dead).toBe(false);
    });

    it('refunds 50% of expired hot gingerbread value into PendingDropBank', () => {
      const bank = createPendingDropBank();
      const hotDrop = createDropInstance('gingerbread', 200, 200, {
        value: 10,
        isHot: true,
        expiration: 0,
      });

      const refunded = refundExpiredHotGingerbread(hotDrop, bank);
      expect(refunded).toBe(5);
      expect(bank.byKey.gingerbread?.totalValue).toBe(5);
    });

    it('cashes out PendingDropBank as big_pouch (>= 30 coins) and gingerbread_stash (>= 28 gingerbread) with +15% consolidation bonus', () => {
      const drops: GameDrop[] = [];
      const bank = createPendingDropBank();
      // Fill arena to 40 first so queued drops go into PendingDropBank
      for (let i = 0; i < MAX_DROPS_LIMIT; i++) {
        drops.push(createDropInstance('bread', i * 10, 0));
      }
      spawnDropWithLimit(drops, createDropInstance('coin', 150, 250, { value: 40 }), bank);
      spawnDropWithLimit(drops, createDropInstance('gingerbread', 160, 260, { value: 30 }), bank);

      // Clear two slots in the arena and release from PendingDropBank
      drops[0].dead = true;
      drops[1].dead = true;
      releasePendingDrops(drops, bank);

      const pouch = drops.find((d) => !d.dead && d.type === 'big_pouch');
      const stash = drops.find((d) => !d.dead && d.type === 'gingerbread_stash');

      expect(pouch).toBeDefined();
      expect(pouch?.value).toBe(Math.round(40 * 1.15)); // 46
      expect(stash).toBeDefined();
      expect(stash?.value).toBe(Math.round(30 * 1.15)); // 35
      expect(bank.byKey.coin).toBeUndefined();
      expect(bank.byKey.gingerbread).toBeUndefined();
    });

    it('biases selectWeightedDropType toward enemy category affinities and Bear Mask', () => {
      let soulOrFoodFromWater = 0;
      for (let i = 0; i < 150; i++) {
        const picked = selectWeightedDropType(0.55, 'flow', false, 0, false, {
          category: 'water',
          defeatedByFood: true,
        });
        if (picked.type === 'soul' || picked.type === 'potion' || picked.type === 'bread' || picked.type === 'pear') {
          soulOrFoodFromWater++;
        }
      }
      expect(soulOrFoodFromWater).toBeGreaterThan(35);
    });
  });
});


