import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ensureWeaponMilestones } from '../src/data/weaponMilestones';

describe('Weapon Milestones GameEngine Seam', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({
      levelId: 1,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
  });

  describe('Vertical Slice 1: Non-milestone upgrade', () => {
    it('upgrades weapon from rank 1 to rank 2 without creating pending milestone', () => {
      const weapon = engine.state.player.weapons.find((w: any) => w.id === 'osikovy_prut');
      expect(weapon).toBeDefined();
      expect(weapon.level).toBe(1);

      const result = engine.upgradeWeapon('osikovy_prut');

      expect(weapon.level).toBe(2);
      expect(result.weapon.level).toBe(2);
      expect(result.pendingMilestone).toBeNull();
      expect(engine.state.pendingMilestone).toBeNull();
    });
  });

  describe('Vertical Slice 2: Upgrading to milestone rank (Rank 3)', () => {
    it('sets pendingMilestone with rank 3 and exactly 2 choices when upgraded from rank 2 to 3', () => {
      engine.upgradeWeapon('osikovy_prut'); // Rank 1 -> 2
      expect(engine.state.pendingMilestone).toBeNull();

      const result = engine.upgradeWeapon('osikovy_prut'); // Rank 2 -> 3

      expect(result.weapon.level).toBe(3);
      expect(result.pendingMilestone).not.toBeNull();
      expect(result.pendingMilestone?.weaponId).toBe('osikovy_prut');
      expect(result.pendingMilestone?.rank).toBe(3);
      expect(result.pendingMilestone?.choices).toHaveLength(2);

      const [c1, c2] = result.pendingMilestone!.choices;
      expect(c1.id).toBe('cane_crowd_3');
      expect(c2.id).toBe('cane_burst_3');
      expect(engine.state.pendingMilestone).toEqual(result.pendingMilestone);
    });
  });

  describe('Vertical Slice 3: Choosing a milestone branch via chooseWeaponMilestone', () => {
    it('records chosen branch into weapon.milestones, clears pendingMilestone, and recalculates combat stats', () => {
      engine.upgradeWeapon('osikovy_prut'); // 1 -> 2
      engine.upgradeWeapon('osikovy_prut'); // 2 -> 3
      expect(engine.state.pendingMilestone).not.toBeNull();

      const weapon = engine.state.player.weapons.find((w: any) => w.id === 'osikovy_prut');
      expect(weapon.milestones).toEqual([]);

      const updatedStats = engine.chooseWeaponMilestone('osikovy_prut', 'cane_burst_3');

      // 1. Weapon milestones updated
      expect(weapon.milestones).toContain('cane_burst_3');
      // 2. Pending milestone cleared
      expect(engine.state.pendingMilestone).toBeNull();
      // 3. Stats immediately reflect cane_burst_3
      // Baseline level 3 damage is 1 + 2 * 0.12 = 1.24. With cane_burst_3 (* 1.18) = 1.4632
      expect(updatedStats).toBeDefined();
      expect(updatedStats.damageMult).toBeCloseTo(1.24 * 1.18, 4);
      expect(updatedStats.cooldownMult).toBeCloseTo(0.97, 4);
    });

    it('produces distinct stats when choosing burst branch vs crowd branch', () => {
      // Instance A chooses crowd
      const engineCrowd = new GameEngine();
      engineCrowd.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });
      engineCrowd.upgradeWeapon('osikovy_prut');
      engineCrowd.upgradeWeapon('osikovy_prut');
      const statsCrowd = engineCrowd.chooseWeaponMilestone('osikovy_prut', 'cane_crowd_3');

      // Instance B chooses burst
      const engineBurst = new GameEngine();
      engineBurst.initRun({ levelId: 1, hunterType: 'wanderer', spawnInitialWave: false });
      engineBurst.upgradeWeapon('osikovy_prut');
      engineBurst.upgradeWeapon('osikovy_prut');
      const statsBurst = engineBurst.chooseWeaponMilestone('osikovy_prut', 'cane_burst_3');

      expect(statsBurst.damageMult).toBeGreaterThan(statsCrowd.damageMult);
      expect(statsCrowd.areaRadiusMult).toBeGreaterThan(statsBurst.areaRadiusMult);
      expect(statsCrowd.knockbackMult).toBeGreaterThan(statsBurst.knockbackMult);
    });
  });

  describe('Vertical Slice 4: Simulation pausing during pendingMilestone', () => {
    it('pauses simulation loop (gameTime, movement) while pendingMilestone is active and resumes after resolution', () => {
      const enemy = engine.spawnMonster('rarach', 300, 0);
      const enemyStartX = enemy.x;
      const initialGameTime = engine.state.gameTime;

      // Upgrade to rank 3 -> triggers pending milestone
      engine.upgradeWeapon('osikovy_prut'); // 1 -> 2
      engine.upgradeWeapon('osikovy_prut'); // 2 -> 3
      expect(engine.state.pendingMilestone).not.toBeNull();

      // Attempt simulation step
      engine.state.keys['KeyD'] = true;
      engine.update(0.1);

      // Simulation must be paused
      expect(engine.state.gameTime).toBe(initialGameTime);
      expect(enemy.x).toBe(enemyStartX);
      expect(engine.state.player.x).toBe(0);

      // Hunter chooses milestone branch
      engine.chooseWeaponMilestone('osikovy_prut', 'cane_burst_3');
      expect(engine.state.pendingMilestone).toBeNull();

      // Simulation resumes
      engine.update(0.1);
      expect(engine.state.gameTime).toBeGreaterThan(initialGameTime);
      expect(engine.state.player.x).toBeGreaterThan(0);
    });
  });

  describe('Vertical Slice 5: Subsequent milestones (Rank 5 and 8) and progression capping', () => {
    it('prompts at rank 5 and rank 8, stacks all 3 milestone choices, and caps at rank 8', () => {
      // 1 -> 2
      engine.upgradeWeapon('osikovy_prut');
      // 2 -> 3 (Milestone 1)
      engine.upgradeWeapon('osikovy_prut');
      expect(engine.state.pendingMilestone?.rank).toBe(3);
      engine.chooseWeaponMilestone('osikovy_prut', 'cane_burst_3');
      expect(engine.state.pendingMilestone).toBeNull();

      // 3 -> 4 (Normal)
      const res4 = engine.upgradeWeapon('osikovy_prut');
      expect(res4.weapon.level).toBe(4);
      expect(res4.pendingMilestone).toBeNull();
      expect(engine.state.pendingMilestone).toBeNull();

      // 4 -> 5 (Milestone 2)
      const res5 = engine.upgradeWeapon('osikovy_prut');
      expect(res5.weapon.level).toBe(5);
      expect(res5.pendingMilestone?.rank).toBe(5);
      expect(res5.pendingMilestone?.choices).toHaveLength(2);
      expect(res5.pendingMilestone?.choices.map((c) => c.id)).toEqual(['cane_crowd_5', 'cane_burst_5']);
      engine.chooseWeaponMilestone('osikovy_prut', 'cane_burst_5');
      expect(engine.state.pendingMilestone).toBeNull();

      // 5 -> 6 (Normal)
      engine.upgradeWeapon('osikovy_prut');
      // 6 -> 7 (Normal)
      engine.upgradeWeapon('osikovy_prut');
      expect(engine.state.pendingMilestone).toBeNull();

      // 7 -> 8 (Milestone 3 - Peak)
      const res8 = engine.upgradeWeapon('osikovy_prut');
      expect(res8.weapon.level).toBe(8);
      expect(res8.pendingMilestone?.rank).toBe(8);
      expect(res8.pendingMilestone?.choices).toHaveLength(2);
      expect(res8.pendingMilestone?.choices.map((c) => c.id)).toEqual(['cane_crowd_8', 'cane_burst_8']);
      const finalStats = engine.chooseWeaponMilestone('osikovy_prut', 'cane_burst_8');

      // Verify all 3 milestones recorded
      const weapon = engine.state.player.weapons.find((w: any) => w.id === 'osikovy_prut');
      expect(weapon.milestones).toEqual(['cane_burst_3', 'cane_burst_5', 'cane_burst_8']);
      expect(finalStats.pierce).toBeGreaterThanOrEqual(2); // cane_burst_5 and cane_burst_8 grant pierceDelta

      // Attempting to upgrade beyond rank 8 stays at rank 8 and does not prompt
      const beyondRes = engine.upgradeWeapon('osikovy_prut');
      expect(beyondRes.weapon.level).toBe(8);
      expect(beyondRes.pendingMilestone).toBeNull();
      expect(engine.state.pendingMilestone).toBeNull();
    });
  });

  describe('Vertical Slice 6: Backward compatibility & safe migration', () => {
    it('does not re-prompt milestone if already chosen in custom/saved weapon', () => {
      const customEngine = new GameEngine();
      customEngine.initRun({
        levelId: 1,
        hunterType: 'wanderer',
        spawnInitialWave: false,
        customWeapons: [
          {
            id: 'osikovy_prut',
            level: 3,
            milestones: ['cane_burst_3'],
          } as any,
        ],
      });

      expect(customEngine.state.pendingMilestone).toBeNull();

      // Upgrading to 4 should not prompt for rank 3
      const res4 = customEngine.upgradeWeapon('osikovy_prut');
      expect(res4.weapon.level).toBe(4);
      expect(res4.pendingMilestone).toBeNull();
      expect(customEngine.state.pendingMilestone).toBeNull();

      // Weapon still has cane_burst_3
      expect(res4.weapon.milestones).toContain('cane_burst_3');
    });

    it('safely migrates older saves without milestones via ensureWeaponMilestones without overwriting custom picks', () => {
      const legacyWeapon = {
        id: 'valecnice',
        level: 5,
        milestones: ['valecnice_burst_3'], // User picked burst for rank 3 in the past
      };

      // Calling ensureWeaponMilestones on legacy data
      expect(() => ensureWeaponMilestones(legacyWeapon)).not.toThrow();

      // Rank 3 choice was preserved!
      expect(legacyWeapon.milestones).toContain('valecnice_burst_3');
      expect(legacyWeapon.milestones).not.toContain('valecnice_crowd_3');

      // Rank 5 was missing, so default crowd was filled in
      expect(legacyWeapon.milestones).toContain('valecnice_crowd_5');
    });

    it('directly affects combat loop projectiles and damage when fired during simulation', () => {
      const shepherdEngine = new GameEngine();
      shepherdEngine.initRun({
        levelId: 1,
        hunterType: 'shepherd',
        spawnInitialWave: false,
      });

      // Shepherd starts with povidlove_buchty at level 1
      shepherdEngine.spawnMonster('rarach', 100, 0);

      // Upgrade to rank 3
      shepherdEngine.upgradeWeapon('povidlove_buchty'); // 1 -> 2
      shepherdEngine.upgradeWeapon('povidlove_buchty'); // 2 -> 3

      // Choose crowd branch: +1 projectile count
      shepherdEngine.chooseWeaponMilestone('povidlove_buchty', 'buns_crowd_3');

      // Ready weapon cooldown
      shepherdEngine.state.player.weapons[0].cd = 0;

      // Update simulation step to fire weapon
      shepherdEngine.update(0.016);

      // Level 3 (base 2) + crowd milestone (+1) = 3 projectiles spawned!
      expect(shepherdEngine.state.projectiles.length).toBe(3);
    });
  });
});
