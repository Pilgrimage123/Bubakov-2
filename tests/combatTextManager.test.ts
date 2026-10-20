import { describe, it, expect, beforeEach } from 'vitest';
import { addCombatText, DamageText, MAX_COMBAT_TEXTS } from '../src/game/combatTextManager';
import { createInitialEngineState } from '../src/game/engineState';
import { setCombatTextSettings, DEFAULT_COMBAT_TEXT_SETTINGS } from '../src/game/combatTextSettings';

describe('CombatTextManager (ADR 0002, ADR 0016, ADR 0020)', () => {
  let engine: ReturnType<typeof createInitialEngineState>;

  beforeEach(() => {
    engine = createInitialEngineState();
    setCombatTextSettings({ ...DEFAULT_COMBAT_TEXT_SETTINGS });
  });

  it('respects isCombatTextCategoryEnabled and returns null for disabled categories without allocating', () => {
    setCombatTextSettings({
      ...DEFAULT_COMBAT_TEXT_SETTINGS,
      enemyDamage: false,
    });

    const result = addCombatText(engine, 100, 200, '45', '#FFFFFF', false, 'enemyDamage');
    expect(result).toBeNull();
    expect(engine.texts.length).toBe(0);
  });

  it('adds combat text when category is enabled', () => {
    const result = addCombatText(engine, 100, 200, '45', '#FFFFFF', false, 'enemyDamage');
    expect(result).toBeInstanceOf(DamageText);
    expect(result?.text).toBe('45');
    expect(engine.texts.length).toBe(1);
  });

  it('cumulatively merges consecutive damage on the same target enemy', () => {
    const enemy = { x: 150, y: 250 };

    const first = addCombatText(engine, enemy.x, enemy.y, '30', '#FFFFFF', false, 'enemyDamage', enemy);
    expect(first).toBeDefined();
    expect(first?.text).toBe('30');
    expect(engine.texts.length).toBe(1);

    const second = addCombatText(engine, enemy.x, enemy.y, '25', '#FFFFFF', false, 'enemyDamage', enemy);
    expect(second).toBe(first);
    expect(first?.text).toBe('55');
    expect(engine.texts.length).toBe(1);
  });

  it('bounds array to MAX_COMBAT_TEXTS and recycles entries in-place without splice', () => {
    for (let i = 0; i < MAX_COMBAT_TEXTS + 10; i++) {
      addCombatText(engine, 100 + i, 200, `${i * 10}`, '#FFFFFF', false, 'enemyDamage');
    }

    expect(engine.texts.length).toBe(MAX_COMBAT_TEXTS);
  });
});
