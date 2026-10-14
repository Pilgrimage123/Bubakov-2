import { describe, it, expect, beforeEach } from 'vitest';
import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../src/data/grandfatherItems';
import { WEAPONS } from '../src/data/weapons';
import { WEAPON_RANK_DEFS, getMilestoneChoices } from '../src/data/weaponMilestones';
import { GameEngine } from '../src/game/engine';
import { pullWhipLoot } from '../src/game/drops';
import { isUnholyEnemy } from '../src/data/holy';
import { createDefaultMetaProgression } from '../src/game/migration';
import type { DropItem } from '../src/types';

describe('New Grandfather Items Integration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun(0, 'wanderer', {
      ...createDefaultMetaProgression(),
      unlockedWeapons: {
        buns: true,
        cane: true,
        formansky_bic: true,
      },
    });
  });

  describe('1. Formanský bič (wp_whip / formansky_bic)', () => {
    it('has valid definition in GRANDFATHER_ITEMS', () => {
      const whipItem = GRANDFATHER_ITEMS.find((it) => it.id === 'wp_whip');
      expect(whipItem).toBeDefined();
      expect(whipItem?.name).toBe('Formanský bič');
      expect(whipItem?.icon).toBe('🪢');
      expect(whipItem?.baseCost).toBe(55);
      expect(whipItem?.maxStacks).toBe(8);
      expect(whipItem?.luckWeight).toBe(0.95);
      expect(whipItem?.isWeapon).toBe(true);
      expect(whipItem?.weaponId).toBe('formansky_bic');
      expect(whipItem?.effect).toEqual({ type: 'weapon', weaponId: 'formansky_bic' });
    });

    it('has valid weapon definition in WEAPONS', () => {
      const weaponDef = WEAPONS['formansky_bic'];
      expect(weaponDef).toBeDefined();
      expect(weaponDef.id).toBe('formansky_bic');
      expect(weaponDef.type).toBe('physical');
      expect(weaponDef.baseDmg).toBeGreaterThan(0);
      expect(weaponDef.baseCd).toBeGreaterThan(0);
    });

    it('has 8 milestone ranks with 2 distinct choices at ranks 3, 5, 8', () => {
      const rankDefs = WEAPON_RANK_DEFS['formansky_bic'];
      expect(rankDefs).toBeDefined();
      expect(rankDefs).toHaveLength(8);

      const r3Choices = getMilestoneChoices('formansky_bic', 3);
      expect(r3Choices).toHaveLength(2);
      expect(r3Choices?.map((c) => c.id)).toEqual(['whip_double_swing_3', 'whip_lead_knot_3']);

      const r5Choices = getMilestoneChoices('formansky_bic', 5);
      expect(r5Choices).toHaveLength(2);
      expect(r5Choices?.map((c) => c.id)).toEqual(['whip_tar_tip_5', 'whip_wet_strap_5']);

      const r8Choices = getMilestoneChoices('formansky_bic', 8);
      expect(r8Choices).toHaveLength(2);
      expect(r8Choices?.map((c) => c.id)).toEqual(['whip_thunder_crack_8', 'whip_seven_straps_8']);
    });

    it('prioritizes winding up enemies over closer idle enemies when firing', () => {
      const whipItem = GRANDFATHER_ITEMS.find((it) => it.id === 'wp_whip')!;
      engine.applyGrandfatherItem(whipItem);

      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;

      // Close idle enemy at (50, 0)
      const closeIdleEnemy = engine.spawnMonster('rarach', 50, 0);
      closeIdleEnemy.isAttacking = false;
      closeIdleEnemy.windupTimer = 0;

      // Farther winding-up enemy at (0, 120)
      const windingUpEnemy = engine.spawnMonster('hejkal', 0, 120);
      windingUpEnemy.isAttacking = true;
      windingUpEnemy.windupTimer = 0.5;

      state.slashes = [];
      const weaponDef = WEAPONS['formansky_bic'];
      weaponDef.fire(player, 1);

      expect(state.slashes.length).toBeGreaterThanOrEqual(1);
      const slash = state.slashes[0];
      // Angle should be towards (0, 120), i.e. Math.PI / 2
      expect(slash.angle).toBeCloseTo(Math.PI / 2, 2);
    });

    it('interrupts attack and bypasses dodge when whip slash hits', () => {
      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;

      const enemy = engine.spawnMonster('divozenka', 100, 0);
      enemy.prefix = 'vichricovy';
      enemy.dodgeChance = 1.0; // 100% dodge if not bypassed
      enemy.isAttacking = true;
      enemy.windupTimer = 0.4;
      enemy.aiState = 'windup';

      state.slashes.push({
        x: player.x,
        y: player.y,
        angle: 0,
        arc: 0.35,
        reach: 180,
        dmg: 30,
        type: 'physical',
        style: 'whip',
        weaponId: 'formansky_bic',
        milestones: [],
        life: 0.15,
        hitList: [],
      });

      engine.update(0.05);

      // Enemy should have been interrupted
      expect(enemy.isAttacking).toBe(false);
      expect(enemy.windupTimer).toBe(0);
      expect(enemy.aiState).toBe('idle');

      // Dodge was ignored because it cannot be dodged
      expect(enemy.hp).toBeLessThan(enemy.maxHp);
    });

    it('pullWhipLoot pulls coins and gingerbread lying in slash trajectory towards player', () => {
      const drops: DropItem[] = [
        // Drop in front of whip (angle 0, distance 90) -> within reach 180 and corridor width 65
        { id: 1, type: 'coin', x: 90, y: 10, radius: 12, value: 5, time: 0, dead: false },
        // Gingerbread in front of whip (angle 0, distance 140)
        { id: 2, type: 'gingerbread', x: 140, y: -10, radius: 14, value: 2, time: 0, dead: false },
        // Drop behind whip (angle 0, distance -80) -> should NOT be pulled
        { id: 3, type: 'coin', x: -80, y: 0, radius: 12, value: 1, time: 0, dead: false },
        // Drop far to the side (x: 90, y: 120) -> outside corridor width
        { id: 4, type: 'gingerbread', x: 90, y: 120, radius: 14, value: 2, time: 0, dead: false },
      ];

      pullWhipLoot(drops, 0, 0, 0, 180, 65);

      // In-corridor drops should have velocity pointing toward origin (0,0), i.e. negative vx
      expect((drops[0] as any).vx).toBeLessThan(-100);
      expect((drops[1] as any).vx).toBeLessThan(-100);

      // Drops outside corridor should have undefined or 0 velocity
      expect((drops[2] as any).vx).toBeUndefined();
      expect((drops[3] as any).vx).toBeUndefined();
    });

    it('applies lead knot milestone for 25% extra tip dmg and armor break', () => {
      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;

      // Enemy positioned at tip (140px away, reach is 180px -> 140 >= 180 * 0.65 = 117)
      const tipEnemy = engine.spawnMonster('zbrojnos', 140, 0);
      const hpBefore = tipEnemy.hp;

      state.slashes.push({
        x: player.x,
        y: player.y,
        angle: 0,
        arc: 0.35,
        reach: 180,
        dmg: 40,
        type: 'physical',
        style: 'whip',
        weaponId: 'formansky_bic',
        milestones: ['whip_lead_knot_3'],
        life: 0.15,
        hitList: [],
      });

      engine.update(0.05);

      const damageDealt = hpBefore - tipEnemy.hp;
      // 40 * 1.25 = 50 damage dealt ignoring poise/resist
      expect(damageDealt).toBeGreaterThanOrEqual(45);
    });

    it('applies thunder crack milestone to fear surrounding mob on tip explosion', () => {
      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;

      const tipEnemy = engine.spawnMonster('divozenka', 140, 0);
      const bystander = engine.spawnMonster('mysak', 160, 20);

      state.slashes.push({
        x: player.x,
        y: player.y,
        angle: 0,
        arc: 0.35,
        reach: 180,
        dmg: 30,
        type: 'physical',
        style: 'whip',
        weaponId: 'formansky_bic',
        milestones: ['whip_thunder_crack_8'],
        life: 0.15,
        hitList: [],
      });

      engine.update(0.05);

      expect(tipEnemy.panicked).toBe(true);
      expect(tipEnemy.panicTimer).toBeGreaterThan(1.0);
      expect(bystander.panicked).toBe(true);
      expect(bystander.panicTimer).toBeGreaterThan(1.0);
    });
  });

  describe('2. Posvěcená tříkrálová křída (trikralova_krida)', () => {
    it('has valid definition in GRANDFATHER_ITEMS', () => {
      const krida = GRANDFATHER_ITEMS.find((it) => it.id === 'trikralova_krida');
      expect(krida).toBeDefined();
      expect(krida?.name).toBe('Posvěcená tříkrálová křída');
      expect(krida?.icon).toBe('🖍️');
      expect(krida?.baseCost).toBe(50);
      expect(krida?.maxStacks).toBe(3);
      expect(krida?.luckWeight).toBe(0.85);
      expect(krida?.effect).toEqual({ type: 'holy_circle', damageReduction: 0.20 });
    });

    it('creates holy circle after standing still for >= 0.6s and repels unholy enemies', () => {
      const krida = GRANDFATHER_ITEMS.find((it) => it.id === 'trikralova_krida')!;
      engine.applyGrandfatherItem(krida);

      const state = engine.state;
      const player = state.player!;
      player.x = 200;
      player.y = 200;
      player.stillTimer = 0;

      // Standing still for 0.3s -> not yet 0.6s
      engine.update(0.3);
      expect(state.holyCircle).toBeNull();

      // Standing still for another 0.4s (total 0.7s) -> circle forms
      engine.update(0.4);
      expect(state.holyCircle).not.toBeNull();
      expect(state.holyCircle?.active).toBe(true);
      expect(state.holyCircle?.radius).toBe(120);

      // Spawn unholy enemy (zbrojnos) inside circle
      const unholy = engine.spawnMonster('zbrojnos', 220, 200);
      expect(isUnholyEnemy(unholy)).toBe(true);
      const hpBefore = unholy.hp;

      engine.update(0.1);

      // Unholy enemy should take holy damage and be pushed away
      expect(unholy.hp).toBeLessThan(hpBefore);
      expect(unholy.kbx).toBeGreaterThan(0);
    });

    it('gives player 20% damage reduction per stack while inside circle', () => {
      const krida = GRANDFATHER_ITEMS.find((it) => it.id === 'trikralova_krida')!;
      engine.applyGrandfatherItem(krida); // Stack 1 (20%)
      engine.applyGrandfatherItem(krida); // Stack 2 (40%)

      const state = engine.state;
      const player = state.player!;
      player.x = 100;
      player.y = 100;
      player.stillTimer = 1.0;

      engine.update(0.1);
      expect(state.holyCircle).not.toBeNull();

      // When player is inside circle (distance <= radius), damage is reduced by 40%
      player.hp = 100;
      player.maxHp = 100;
      player.takeDamage(50, 'physical');

      // 50 * (1 - 0.40) = 30 dmg taken, remaining hp = 70
      expect(player.hp).toBe(70);
    });

    it('circle lingers for 1.5s after player starts moving', () => {
      const krida = GRANDFATHER_ITEMS.find((it) => it.id === 'trikralova_krida')!;
      engine.applyGrandfatherItem(krida);

      const state = engine.state;
      const player = state.player!;
      player.stillTimer = 1.0;

      // Update to create active circle
      engine.update(0.1);
      expect(state.holyCircle).not.toBeNull();

      // Simulate moving (update with non-zero movement simulated by setting movement key)
      state.keys['KeyD'] = true;
      engine.update(0.5); // 1.0s remaining
      expect(state.holyCircle).not.toBeNull();

      engine.update(1.1); // life <= 0
      expect(state.holyCircle).toBeNull();
      delete state.keys['KeyD'];
    });
  });

  describe('3. Strouhaný křen v ubrousku (strouhany_kren)', () => {
    it('has valid definition in GRANDFATHER_ITEMS', () => {
      const kren = GRANDFATHER_ITEMS.find((it) => it.id === 'strouhany_kren');
      expect(kren).toBeDefined();
      expect(kren?.name).toBe('Strouhaný křen v ubrousku');
      expect(kren?.icon).toBe('🫚');
      expect(kren?.baseCost).toBe(45);
      expect(kren?.maxStacks).toBe(4);
      expect(kren?.luckWeight).toBe(0.9);
      expect(kren?.effect).toEqual({ type: 'kren_spice', foodResistReduction: 0.25, snackBonusDmg: 0.15 });
    });

    it('reduces foodResist so food weapons hurt previously immune or highly resistant enemies', () => {
      const state = engine.state;
      const player = state.player!;

      // Kostlivec has base foodResist / hunger = 0.95 (nearly immune)
      const zbrojnos = engine.spawnMonster('zbrojnos', 100, 0);
      zbrojnos.foodResist = 0.95;
      zbrojnos.hunger = 0.95;

      // Apply 2 stacks of Strouhaný křen (-50% food resist)
      const kren = GRANDFATHER_ITEMS.find((it) => it.id === 'strouhany_kren')!;
      engine.applyGrandfatherItem(kren);
      engine.applyGrandfatherItem(kren);

      expect(player.foodResistReduction).toBe(0.50);

      // Fire food projectile
      state.projectiles.push({
        x: 95,
        y: 0,
        vx: 100,
        vy: 0,
        radius: 15,
        dmg: 40,
        type: 'food',
        life: 1.0,
        hitList: [],
        dead: false,
      });

      const hpBefore = zbrojnos.hp;
      engine.update(0.1);

      // Resistance reduced from 0.95 to 0.95 * (1 - 0.50) = 0.475
      // Damage dealt: 40 * (1 - 0.475) = 21
      expect(zbrojnos.hp).toBeLessThan(hpBefore);
      expect(zbrojnos.snackTimer).toBeGreaterThan(0);
    });

    it('deals +15% more damage from non-food weapons to snacking or pickled enemies', () => {
      const state = engine.state;
      const player = state.player!;

      const kren = GRANDFATHER_ITEMS.find((it) => it.id === 'strouhany_kren')!;
      engine.applyGrandfatherItem(kren);
      expect(player.snackBonusDmg).toBe(0.15);

      const normalEnemy = engine.spawnMonster('rarach', 100, 0);
      const normalHpBefore = normalEnemy.hp;
      normalEnemy.takeDamage(20, 'physical', 0, 0);
      const normalDmgTaken = normalHpBefore - normalEnemy.hp;

      const snackingEnemy = engine.spawnMonster('rarach', 200, 0);
      snackingEnemy.snackTimer = 3.0; // Currently snacking!
      const snackingHpBefore = snackingEnemy.hp;
      snackingEnemy.takeDamage(20, 'physical', 0, 0);
      const snackingDmgTaken = snackingHpBefore - snackingEnemy.hp;

      // Snacking enemy takes +15% damage
      expect(snackingDmgTaken).toBeGreaterThan(normalDmgTaken);
      expect(snackingDmgTaken).toBeCloseTo(normalDmgTaken * 1.15, 0);
    });
  });

  describe('4. Pouťové perníkové srdce (poutove_srdce)', () => {
    it('has valid definition in GRANDFATHER_ITEMS', () => {
      const srdce = GRANDFATHER_ITEMS.find((it) => it.id === 'poutove_srdce');
      expect(srdce).toBeDefined();
      expect(srdce?.name).toBe('Pouťové perníkové srdce');
      expect(srdce?.icon).toBe('💝');
      expect(srdce?.baseCost).toBe(50);
      expect(srdce?.maxStacks).toBe(4);
      expect(srdce?.luckWeight).toBe(0.85);
      expect(srdce?.effect).toEqual({ type: 'gingerbread_heart', cdReductionMult: 1.0, giantHeal: 8 });
    });

    it('reduces ability cooldown on small gingerbread pickup', () => {
      const srdce = GRANDFATHER_ITEMS.find((it) => it.id === 'poutove_srdce')!;
      engine.applyGrandfatherItem(srdce);

      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;
      player.ultCd = 10.0;
      player.pickupRadius = 150;

      // Spawn small gingerbread right at player
      state.drops.push({
        id: 1,
        type: 'gingerbread',
        size: 'small',
        value: 2,
        x: 0,
        y: 0,
        radius: 12,
        time: 0,
        dead: false,
      });

      engine.update(0.05);

      // Ult CD should decrease by -0.2s (+ dt decrement)
      expect(player.ultCd).toBeLessThanOrEqual(9.8);
    });

    it('reduces ability cooldown and gives speed buff on large gingerbread pickup', () => {
      const srdce = GRANDFATHER_ITEMS.find((it) => it.id === 'poutove_srdce')!;
      engine.applyGrandfatherItem(srdce);

      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;
      player.ultCd = 10.0;
      player.pickupRadius = 150;

      // Spawn large gingerbread
      state.drops.push({
        id: 2,
        type: 'gingerbread',
        size: 'large',
        value: 6,
        x: 0,
        y: 0,
        radius: 15,
        time: 0,
        dead: false,
      });

      engine.update(0.05);

      // Ult CD decreased by -0.6s
      expect(player.ultCd).toBeLessThanOrEqual(9.4);
      // Speed timer active
      expect(player.gingerbreadSpeedTimer).toBeGreaterThan(1.5);
    });

    it('reduces cooldown and heals 8 Kuráže per stack on giant gingerbread pickup', () => {
      const srdce = GRANDFATHER_ITEMS.find((it) => it.id === 'poutove_srdce')!;
      engine.applyGrandfatherItem(srdce); // Stack 1
      engine.applyGrandfatherItem(srdce); // Stack 2 (heal = 16)

      const state = engine.state;
      const player = state.player!;
      player.x = 0;
      player.y = 0;
      player.maxHp = 100;
      player.hp = 50;
      player.ultCd = 10.0;
      player.pickupRadius = 150;

      // Spawn giant gingerbread
      state.drops.push({
        id: 3,
        type: 'gingerbread',
        size: 'giant',
        value: 20,
        x: 0,
        y: 0,
        radius: 20,
        time: 0,
        dead: false,
      });

      engine.update(0.05);

      // Ult CD decreased by -2.0s
      expect(player.ultCd).toBeLessThanOrEqual(8.0);
      // Healed by 16 Kuráže (50 -> 66)
      expect(player.hp).toBe(66);
    });
  });
});
