import { describe, expect, it, vi } from 'vitest';
import {
  KRAJANEK_ABILITY_COOLDOWN,
  KRAJANEK_BASE_BLOCK_HP,
  KRAJANEK_CRUSH_DAMAGE,
  KRAJANEK_RIDE_DURATION,
  KRAJANEK_RIDE_SPEED_MULTIPLIER,
  KRAJANEK_SPARK_DAMAGE,
  KRAJANEK_SPARK_RADIUS,
  getKrajanekBlockingHp,
  getKrajanekUpgradeScale,
  stepKrajanekRide,
} from '../src/game/krajanekAbility';

function createEnemy(x: number, y: number, maxHp: number, radius = 10) {
  return {
    x,
    y,
    maxHp,
    hp: maxHp,
    radius,
    dead: false,
    isDefeated: false,
    takeDamage: vi.fn(function (this: any, amount: number) {
      this.hp = Math.max(0, this.hp - amount);
      if (this.hp <= 0) this.isDefeated = true;
    }),
  };
}

describe('Krajánek — Jízda na žernovu', () => {
  it('uses a 9-second ride, a 30-second cooldown, and double movement speed', () => {
    expect(KRAJANEK_RIDE_DURATION).toBe(9);
    expect(KRAJANEK_ABILITY_COOLDOWN).toBe(30);
    expect(KRAJANEK_RIDE_SPEED_MULTIPLIER).toBe(2);
  });

  it('scales damage and the blocking threshold by 20% per counted shop upgrade', () => {
    expect(getKrajanekUpgradeScale(0)).toBe(1);
    expect(getKrajanekUpgradeScale(1)).toBeCloseTo(1.2);
    expect(getKrajanekUpgradeScale(3)).toBeCloseTo(1.6);
    expect(getKrajanekBlockingHp(0)).toBe(KRAJANEK_BASE_BLOCK_HP);
    expect(getKrajanekBlockingHp(2)).toBeCloseTo(640);
  });

  it('flattens small enemies, damages heavy blockers, and sparks monsters outside the path', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      lastDx: 1,
      lastDy: 0,
      damageMultiplier: 1,
      krajanekUpgradeCount: 0,
      krajanekRideTimer: 9,
      krajanekRideTickTimer: 0,
      krajanekFlats: [],
    };
    const small = createEnemy(18, 0, 100);
    const heavy = createEnemy(20, 0, 600);
    const offPath = createEnemy(0, 70, 100);

    const sparked = stepKrajanekRide(player, 1 / 60, [small, heavy, offPath]);

    expect(sparked).toBe(true);
    expect(small.krajanekFlattened).toBe(true);
    expect(small.isDefeated).toBe(true);
    expect(player.krajanekFlats).toHaveLength(1);
    expect(heavy.takeDamage).toHaveBeenCalledWith(
      KRAJANEK_CRUSH_DAMAGE,
      'physical',
      0,
      0,
      { ignoreDodge: true },
    );
    expect(heavy.isDefeated).toBe(false);
    expect(offPath.takeDamage).toHaveBeenCalledWith(
      KRAJANEK_SPARK_DAMAGE,
      'willpower',
      0,
      0,
      { ignoreDodge: true },
    );
    expect(KRAJANEK_SPARK_RADIUS).toBe(85);
  });

  it('raises the crush ceiling after upgrades and advances the ride timer', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      damageMultiplier: 1,
      krajanekUpgradeCount: 2,
      krajanekRideTimer: 1,
      krajanekRideTickTimer: 0.2,
      krajanekFlats: [],
    };
    const heavy = createEnemy(20, 0, 600);
    const lighter = createEnemy(20, 0, 550);

    stepKrajanekRide(player, 0.1, [heavy, lighter]);

    expect(heavy.takeDamage).toHaveBeenCalled();
    expect(lighter.krajanekFlattened).toBe(true);
    expect(player.krajanekRideTimer).toBeCloseTo(0.9);
  });
});
