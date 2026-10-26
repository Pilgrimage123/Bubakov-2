import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { WEAPONS } from '../src/data/weapons';

describe('Bylinková fajfka Courage Scaling with Damage Upgrades', () => {
  it('scales courage restoration proportionally with rank and damage multipliers', () => {
    const engine = new GameEngine({ levelId: 1, hunterType: 'wanderer' });
    const player = engine.state.player;
    player.maxHp = 200;
    player.damageMultiplier = 1.0;
    player.tulakDamageBonus = 0;

    // Test 1: Base Rank 1 (damageMult = 1.0)
    player.hp = 100;
    const initialHp = player.hp;
    WEAPONS.bylinkova_fajfka.fire(player, 1);
    const healBase = player.hp - initialHp;
    expect(healBase).toBeCloseTo(16, 1); // 0.08 * 200 = 16

    // Test 2: Rank 5 with damageMult = 1.5
    player.hp = 100;
    player.weapons[0].level = 5;
    player.weapons[0]._cachedStats = null; // force refresh
    WEAPONS.bylinkova_fajfka.fire(player, 5);
    const healRank5 = player.hp - 100;
    expect(healRank5).toBeGreaterThan(healBase * 1.3);

    // Test 3: Global damage upgrade (player.damageMultiplier = 1.5)
    player.hp = 100;
    player.damageMultiplier = 1.5;
    player.weapons[0].level = 1;
    player.weapons[0]._cachedStats = null;
    WEAPONS.bylinkova_fajfka.fire(player, 1);
    const healGlobalDamageMult = player.hp - 100;
    // With 1.5x damage, courage restoration should be 1.5x base heal (24 instead of 16)
    expect(healGlobalDamageMult).toBeCloseTo(healBase * 1.5, 1);
  });
});
