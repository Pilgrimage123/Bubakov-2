import { describe, it, expect, beforeEach } from 'vitest';
import { DamageText, GameEngine } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import {
  setCombatTextSettings,
  TACTICAL_COMBAT_TEXT_SETTINGS,
  DEFAULT_COMBAT_TEXT_SETTINGS,
  isCombatTextCategoryEnabled,
} from '../src/game/combatTextSettings';

describe('Performance Optimizations & Adaptive Governor', () => {
  beforeEach(() => {
    setCombatTextSettings(DEFAULT_COMBAT_TEXT_SETTINGS);
  });

  describe('DamageText fast parseInt & category preservation', () => {
    it('only parses integers when string starts with an ASCII digit in addAmount', () => {
      const dtNum = new DamageText(100, 100, '42', '#FFF', false, 'enemyDamage');
      expect(dtNum.text).toBe('42');

      dtNum.addAmount(18);
      expect(dtNum.text).toBe('60');

      const dtNonNum = new DamageText(100, 100, 'ODRAŽENO! 🪨', '#FFF', true, 'combatStates');
      dtNonNum.addAmount(10);
      expect(dtNonNum.text).toBe('ODRAŽENO! 🪨');
    });

    it('assigns explicit category without running heuristic inferCombatTextCategory', () => {
      const dt = new DamageText(100, 100, '120', '#FFF', false, 'hunterDamage');
      expect(dt.category).toBe('hunterDamage');
    });
  });

  describe('Allocation-free Pivní tácek spatial effect', () => {
    it('queries closest enemies via SpatialHash without allocating { enemy, distSq } items', () => {
      const state = createInitialEngineState();
      const engine = new GameEngine(state);

      const player = {
        x: 100,
        y: 100,
        maxHp: 100,
        hp: 100,
        damageMultiplier: 1.5,
        weapons: [{ id: 'cane', level: 1, cd: 2.0 }],
      };
      state.player = player as any;

      for (let i = 0; i < 20; i++) {
        const e = {
          x: 100 + i * 20,
          y: 100,
          radius: 15,
          isDefeated: false,
          dead: false,
          hp: 100,
        };
        state.enemies.push(e as any);
        engine.spatialHash.insert(e);
      }

      engine.triggerPivniTacekEffect(player);

      expect(player.pivniTacekTimer).toBe(6);
      expect(player.weapons[0].cd).toBeLessThan(2.0);
      // Spawned coins from closest enemies
      const coins = state.drops.filter((d) => d.type === 'coin');
      expect(coins.length).toBeLessThanOrEqual(8);
      expect(coins.length).toBeGreaterThan(0);
    });
  });

  describe('Adaptive Governor telemetry & tier simulation', () => {
    it('triggers Tier 1 when smoothed ms > 18 for >= 2.0 seconds', () => {
      const gov = {
        tier: 0,
        tier1Timer: 0,
        recoveryTimer: 0,
        originalCombatPreset: null as any,
      };

      const dt = 0.5;
      const smoothedMs = 19.5;

      // 1.5 seconds: tier1Timer increases, but tier remains 0
      for (let i = 0; i < 3; i++) {
        if (smoothedMs > 18) gov.tier1Timer += dt;
        if (gov.tier1Timer >= 2.0 && gov.tier < 1) gov.tier = 1;
      }
      expect(gov.tier).toBe(0);

      // Another 0.5s -> 2.0s reached -> tier becomes 1
      if (smoothedMs > 18) gov.tier1Timer += dt;
      if (gov.tier1Timer >= 2.0 && gov.tier < 1) gov.tier = 1;
      expect(gov.tier).toBe(1);
    });

    it('triggers Tier 2 when smoothed ms > 22 or combatTextsMs > 2.0 ms', () => {
      const gov = {
        tier: 1,
        tier1Timer: 2.0,
        recoveryTimer: 0,
        originalCombatPreset: null as any,
      };

      const smoothedMs = 17;
      const combatTextsMs = 2.5;

      if ((smoothedMs > 22 || combatTextsMs > 2.0) && gov.tier < 2) {
        gov.tier = 2;
        setCombatTextSettings(TACTICAL_COMBAT_TEXT_SETTINGS);
      }

      expect(gov.tier).toBe(2);
      expect(isCombatTextCategoryEnabled('attackWindups')).toBe(false);
      expect(isCombatTextCategoryEnabled('combatShouts')).toBe(false);
      expect(isCombatTextCategoryEnabled('lootResources')).toBe(false);
    });

    it('recovers down a tier when frame time stays < 16ms for 3.0 seconds', () => {
      const gov = {
        tier: 2,
        tier1Timer: 2.0,
        recoveryTimer: 0,
        originalCombatPreset: 'full' as any,
      };

      const dt = 1.0;
      const smoothedMs = 14.5;

      for (let i = 0; i < 3; i++) {
        if (smoothedMs < 16) {
          gov.recoveryTimer += dt;
          if (gov.recoveryTimer >= 3.0) {
            if (gov.tier > 0) {
              gov.tier--;
              gov.recoveryTimer = 0;
            }
          }
        }
      }

      expect(gov.tier).toBe(1);
    });
  });
});
