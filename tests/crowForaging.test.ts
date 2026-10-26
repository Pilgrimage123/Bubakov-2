import { describe, expect, it, vi } from 'vitest';
import {
  stepCrowForaging,
  restoreStolenBundleDrops,
  CROW_FORAGE_PICKUP_DELAY,
  CROW_FORAGE_PULL_RADIUS,
} from '../src/game/crowForaging';
import { createPendingDropBank, createSwarmDropReservoir } from '../src/game/drops';
import { stepKrajanekRide, stepKrajanekCoastingStones } from '../src/game/krajanekAbility';

describe('stage-one crow foraging, bundle escape & flying rules', () => {
  it('prefers the nearest larger pile of items, lands for 1.5s, pulls items within 65px into a bundle, and deducts them from the dynamic drop system on escape', () => {
    // Isolated single coin very close (25px) vs a 3-item pile at 95px
    const loneCoin: any = { type: 'coin', value: 1, x: 25, y: 0, radius: 5, dead: false };
    const pileCoin1: any = { type: 'coin', value: 2, x: 95, y: 0, radius: 5, dead: false };
    const pileGingerbread: any = { type: 'gingerbread', value: 6, size: 'large', x: 120, y: 12, radius: 10, dead: false };
    const pileBread: any = { type: 'bread', value: 1, x: 145, y: -10, radius: 8, dead: false };
    // Item outside 65px pull radius of the landed crow (at x = 95 + 80 = 175)
    const farCoin: any = { type: 'coin', value: 1, x: 185, y: 0, radius: 5, dead: false };

    const drops = [loneCoin, pileCoin1, pileGingerbread, pileBread, farCoin];
    const crow: any = { id: 'vrana', x: 0, y: 0, radius: 13, crowForageCooldown: 0, isFlying: true };

    // 1. Crow selects the larger pile at x=95 rather than the lone coin at x=25
    const approach = stepCrowForaging(crow, drops, 1 / 60, 100);
    expect(approach.active).toBe(true);
    expect(approach.grounded).toBe(false);
    expect(crow.crowForageTarget).toBe(pileCoin1);
    expect(approach.vx).toBeGreaterThan(0);

    // 2. Crow arrives at the pile and lands on the ground (sprite switches via isGroundedForLoot)
    crow.x = 95;
    crow.y = 0;
    const landed = stepCrowForaging(crow, drops, 0.8, 100);
    expect(landed.grounded).toBe(true);
    expect(crow.isGroundedForLoot).toBe(true);
    expect(crow.isFlying).toBe(false);
    // After only 0.8s (< 1.5s), items are being tugged closer but not yet packed into the bundle
    expect(pileCoin1.dead).toBe(false);
    expect(pileGingerbread.x).toBeLessThan(120);

    // 3. Complete the 1.5s ground duration -> pulls all items within 65px into uzlíček bundle!
    const pendingBank = createPendingDropBank();
    pendingBank.coins = 5;
    pendingBank.gingerbread = 10;
    const reservoir = createSwarmDropReservoir();
    reservoir.coins = 2;
    const ledger = { stolenCoins: 0, stolenGingerbread: 0, stolenHeals: 0, stolenItemsCount: 0 };

    const player = { x: 0, y: 0 };
    const packed = stepCrowForaging(crow, drops, CROW_FORAGE_PICKUP_DELAY - 0.75, 100, {
      player,
      pendingDropBank: pendingBank,
      swarmReservoir: reservoir,
      dynamicDropLedger: ledger,
    });
    expect(packed.carryingBundle).toBe(true);
    expect(crow.isGroundedForLoot).toBe(false);
    expect(crow.isFlying).toBe(true);
    expect(crow.isCarryingLootBundle).toBe(true);
    expect(crow.carryingLootBundle).toHaveLength(3);
    expect(pileCoin1.dead).toBe(true);
    expect(pileGingerbread.dead).toBe(true);
    expect(pileBread.dead).toBe(true);
    expect(farCoin.dead).toBe(false); // 90px away > 65px pull radius

    // 4. Crow flies rapidly away off-screen with the bundle; once off-screen, player loses items permanently
    crow.x = 600;
    const escaped = stepCrowForaging(crow, drops, 0.1, 100, {
      player,
      pendingDropBank: pendingBank,
      swarmReservoir: reservoir,
      dynamicDropLedger: ledger,
    });
    expect(escaped.escaped).toBe(true);
    expect(crow.dead).toBe(true);
    expect(crow.escapedWithLoot).toBe(true);
    expect(escaped.deducted?.totalItems).toBe(3);
    expect(escaped.deducted?.coins).toBe(2);
    expect(escaped.deducted?.gingerbread).toBe(6);
    expect(escaped.deducted?.heals).toBe(1);
    expect(pendingBank.coins).toBe(3);
    expect(pendingBank.gingerbread).toBe(4);
    expect(ledger.stolenItemsCount).toBe(3);
  });

  it('restores stolen bundle items to the ground if the crow is defeated before escaping', () => {
    const loot: any = { type: 'gingerbread', value: 6, size: 'large', x: 20, y: 0, radius: 10, dead: false };
    const drops: any[] = [loot];
    const crow: any = { id: 'vrana', x: 20, y: 0, radius: 13, crowForageCooldown: 0 };

    stepCrowForaging(crow, drops, 1.55, 100);
    expect(crow.isCarryingLootBundle).toBe(true);
    expect(loot.dead).toBe(true);

    const activeDrops: any[] = [];
    const restoredCount = restoreStolenBundleDrops(crow, activeDrops);
    expect(restoredCount).toBe(1);
    expect(activeDrops).toHaveLength(1);
    expect(activeDrops[0].type).toBe('gingerbread');
    expect(activeDrops[0].value).toBe(6);
    expect(crow.isCarryingLootBundle).toBe(false);
  });

  it('ignores non-loot drops and does not allow flock crows to ground for loot', () => {
    const crow: any = { id: 'vrana', x: 0, y: 0, radius: 13, crowForageCooldown: 0 };
    const result = stepCrowForaging(crow, [{ type: 'chest', x: 1, y: 0, dead: false }], 1 / 60, 100);
    expect(result.active).toBe(false);
    expect(result.grounded).toBe(false);

    const flockCrow: any = {
      id: 'vrana',
      x: 0,
      y: 0,
      radius: 13,
      isMinibossFlockMember: true,
      crowForageCooldown: 0,
    };
    const flockResult = stepCrowForaging(flockCrow, [{ type: 'coin', x: 5, y: 0, dead: false }], 1 / 60, 100);
    expect(flockResult.active).toBe(false);
    expect(flockCrow.isGroundedForLoot).toBe(false);
  });

  it('rolls the millstone underneath airborne crows without crushing them while Oskrt sparks still hurt them', () => {
    const player: any = {
      type: 'krajanek',
      x: 100,
      y: 100,
      krajanekRideTimer: 2.5,
      krajanekRideTickTimer: 0.01,
      krajanekUpgradeCount: 0,
      damageMultiplier: 1,
      attackSpeedMultiplier: 1,
      lastDx: 1,
      lastDy: 0,
    };
    const flyingCrow: any = {
      id: 'vrana',
      isFlying: true,
      isGroundedForLoot: false,
      x: 100, // Directly on top of the millstone!
      y: 100,
      radius: 14,
      hp: 100,
      maxHp: 100,
      takeDamage: vi.fn((dmg: number) => {
        flyingCrow.hp = Math.max(0, flyingCrow.hp - dmg);
      }),
    };

    const firedSpark = stepKrajanekRide(player, 0.05, [flyingCrow], 1);
    expect(firedSpark).toBe(true);
    // Millstone did NOT flatten or crush the airborne crow
    expect(flyingCrow.krajanekFlattened).toBeFalsy();
    // But Oškrt sparks DID damage the airborne crow (75 willpower damage, not 100*maxHp physical crush)!
    expect(flyingCrow.takeDamage).toHaveBeenCalledTimes(1);
    expect(flyingCrow.takeDamage).toHaveBeenCalledWith(75, 'willpower', 0, 0, { ignoreDodge: true });
    expect(flyingCrow.hp).toBe(25);

    // Coasting stone also rolls under the airborne crow without crushing it
    const hpBeforeCoast = flyingCrow.hp;
    stepKrajanekCoastingStones(
      [{ x: 100, y: 100, vx: 0, vy: 0, angle: 0, radius: 44, life: 0.01, maxLife: 1.5, damageScale: 1, colossusStacks: 0, isFlatSlam: false }],
      0.05,
      [flyingCrow],
    );
    expect(flyingCrow.hp).toBe(hpBeforeCoast);
  });
});

