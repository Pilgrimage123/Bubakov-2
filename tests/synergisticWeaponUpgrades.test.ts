import { describe, it, expect } from 'vitest';
import { getRankedWeaponStats } from '../src/data/weaponMilestones';
import {
  SYNERGISTIC_UPGRADES,
  getSynergisticUpgradesForWeapon,
  getSynergisticUpgrade,
} from '../src/data/synergisticUpgrades';
import { GameEngine } from '../src/game/engine';

describe('Synergistic Weapon Upgrades (Ticket 01)', () => {
  describe('Definition registry', () => {
    it('provides distinct synergistic upgrade variants for Kyselá okurka', () => {
      const upgrades = getSynergisticUpgradesForWeapon('kysela_okurka');
      expect(upgrades.length).toBeGreaterThanOrEqual(2);

      const swarm = upgrades.find((u) => u.archetype === 'swarm');
      const burst = upgrades.find((u) => u.archetype === 'burst');

      expect(swarm).toBeDefined();
      expect(burst).toBeDefined();
      expect(swarm!.id).not.toBe(burst!.id);

      // Swarm variant has massive projectile increase with damage penalty
      expect(swarm!.statModifiers.projectileCountMult).toBeCloseTo(2.3, 2); // +130% projectiles
      expect(swarm!.statModifiers.baseDamageMult).toBeCloseTo(0.70, 2); // -30% damage

      // Burst variant has damage boost and cooldown reduction
      expect(burst!.statModifiers.baseDamageMult).toBeCloseTo(1.55, 2); // +55% damage
      expect(burst!.statModifiers.cooldownMult).toBeCloseTo(0.90, 2); // -10% cooldown
    });

    it('can retrieve an upgrade by ID', () => {
      const upgrade = getSynergisticUpgrade('pickle_flood');
      expect(upgrade).toBeDefined();
      expect(upgrade?.weaponId).toBe('kysela_okurka');
    });
  });

  describe('Combat stats calculation (getRankedWeaponStats)', () => {
    it('applies swarm projectile trade-off correctly to weapon stats', () => {
      const baseStats = getRankedWeaponStats('kysela_okurka', 2);
      const withSwarm = getRankedWeaponStats('kysela_okurka', 2, {
        synergisticUpgrades: ['pickle_flood'],
      });

      // Baseline rank 2 damageMult = 1.12, projectileCountMult = 1
      expect(baseStats.damageMult).toBeCloseTo(1.12, 4);
      expect(baseStats.projectileCountMult).toBe(1);

      // With swarm: projectileCountMult = 2.3, damageMult = 1.12 * 0.70
      expect(withSwarm.projectileCountMult).toBeCloseTo(2.3, 4);
      expect(withSwarm.damageMult).toBeCloseTo(1.12 * 0.70, 4);
    });

    it('applies burst damage and cooldown trade-off correctly to weapon stats', () => {
      const withBurst = getRankedWeaponStats('kysela_okurka', 2, {
        synergisticUpgrades: ['pickle_crunch'],
      });

      // With burst: damageMult = 1.12 * 1.55, cooldownMult = 0.90
      expect(withBurst.damageMult).toBeCloseTo(1.12 * 1.55, 4);
      expect(withBurst.cooldownMult).toBeCloseTo(0.90, 4);
    });

    it('stacks multiple synergistic upgrades cleanly without breaking milestones', () => {
      const withBothAndMilestone = getRankedWeaponStats('kysela_okurka', 3, {
        synergisticUpgrades: ['pickle_flood'],
        milestones: ['pickle_burst_3'], // baseDamageMult: 1.16, cooldownMult: 0.97
      });

      // Rank 3 base damage = 1.24.
      // Modifiers: milestone (1.16), swarm (0.70)
      const expectedDamage = 1.24 * 1.16 * 0.70;
      expect(withBothAndMilestone.damageMult).toBeCloseTo(expectedDamage, 4);
      expect(withBothAndMilestone.projectileCountMult).toBeCloseTo(2.3, 4);
      expect(withBothAndMilestone.cooldownMult).toBeCloseTo(0.97, 4);
    });
  });

  describe('GameEngine integration', () => {
    it('records and applies synergistic upgrade when upgrading weapon', () => {
      const engine = new GameEngine();
      engine.initRun({ selectedHunter: 'poutnik' });

      // Add weapon
      engine.upgradeWeapon('kysela_okurka');
      const weapon1 = engine.state.player.weapons.find((w: any) => w.id === 'kysela_okurka');
      expect(weapon1.level).toBe(1);
      expect(weapon1.synergisticUpgrades).toEqual([]);

      // Upgrade to rank 2 with a synergistic choice
      const res = engine.upgradeWeapon('kysela_okurka', 'pickle_flood');
      expect(res.weapon.level).toBe(2);
      expect(res.weapon.synergisticUpgrades).toContain('pickle_flood');

      // Rank 2 should NOT trigger milestone
      expect(res.pendingMilestone).toBeNull();
    });

    it('allows applySynergisticUpgrade method on engine directly', () => {
      const engine = new GameEngine();
      engine.initRun({ selectedHunter: 'poutnik' });
      engine.upgradeWeapon('kysela_okurka');

      engine.applySynergisticUpgrade('kysela_okurka', 'pickle_crunch');
      const weapon = engine.state.player.weapons.find((w: any) => w.id === 'kysela_okurka');
      expect(weapon.synergisticUpgrades).toContain('pickle_crunch');
    });

    it('maintains backwards compatibility for weapons without synergisticUpgrades field', () => {
      const legacyWeapon = {
        id: 'kysela_okurka',
        level: 2,
        cd: 0,
        milestones: [],
      };
      const stats = getRankedWeaponStats('kysela_okurka', 2, legacyWeapon);
      expect(stats.damageMult).toBeCloseTo(1.12, 4);
      expect(stats.projectileCountMult).toBe(1);
    });
  });
});
