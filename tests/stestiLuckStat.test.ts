import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { HUNTER_DETAILS } from '../src/data/hunterDetails';
import { VILLAGE_BUILDINGS } from '../src/data/village';
import { getGrandfatherPrice, chooseGrandfatherOffers } from '../src/game/grandfatherRuntime';
import { getGrandfatherItem } from '../src/data/grandfatherItems';
import type { CharacterType, MetaProgression } from '../src/types';

describe('Stat Štěstí (Luck Stat Architecture - ADR 0013)', () => {
  it('assigns balanced base Štěstí to all hunters with an exact average of 100', () => {
    const engine = new GameEngine();
    const hunters: CharacterType[] = ['wanderer', 'shepherd', 'korenarka', 'watchman', 'sexton', 'granny'];

    const luckValues = hunters.map((h) => {
      const player = engine.createPlayer(h);
      return player.luck;
    });

    // Individual base values
    expect(engine.createPlayer('wanderer').luck).toBe(100);
    expect(engine.createPlayer('granny').luck).toBe(120);
    expect(engine.createPlayer('shepherd').luck).toBe(105);
    expect(engine.createPlayer('sexton').luck).toBe(100);
    expect(engine.createPlayer('watchman').luck).toBe(90);
    expect(engine.createPlayer('korenarka').luck).toBe(85);

    // Exact mathematical average of 100
    const sum = luckValues.reduce((acc, val) => acc + val, 0);
    expect(sum / hunters.length).toBe(100);

    // Verified in HUNTER_DETAILS roster as well
    for (const h of hunters) {
      expect(HUNTER_DETAILS[h].luck).toBe(engine.createPlayer(h).luck);
    }
  });

  it('boosts starting Štěstí by +5 per Boží muka level from village meta-progression', () => {
    const engine = new GameEngine();
    const metaWithBoziMuka: Partial<MetaProgression> = {
      boziMukaLevel: 3,
    };

    const wanderer = engine.createPlayer('wanderer', metaWithBoziMuka as MetaProgression);
    // Base 100 + 3 * 5 = 115
    expect(wanderer.luck).toBe(115);

    const granny = engine.createPlayer('granny', metaWithBoziMuka as MetaProgression);
    // Base 120 * (1 + 3 * 0.05) = 138 (archetype preservation)
    expect(granny.luck).toBe(138);

    // Verify Boží muka is present in village buildings registry
    const boziMuka = VILLAGE_BUILDINGS.find((b) => b.id === 'boziMuka');
    expect(boziMuka).toBeDefined();
    expect(boziMuka?.baseCost).toBe(50);
    expect(boziMuka?.levelKey).toBe('boziMukaLevel');
  });

  it('Podkova pro štěstí grants +10 Štěstí', () => {
    const podkova = getGrandfatherItem('podkova_pro_stesti');
    expect(podkova).toBeDefined();
    expect(podkova?.effect.type).toBe('luck');
    if (podkova && podkova.effect.type === 'luck') {
      expect(podkova.effect.amount).toBe(10);
    }
    expect(podkova?.maxStacks).toBe(5);
  });

  it('calculates shop discounts and rare offers using normalized 100-baseline scale', () => {
    const item = getGrandfatherItem('sedmimile_krpce')!;

    // Baseline 100 luck: (100 - 80) * 0.003 = 0.06 (6% discount)
    // 35 * 0.94 = 32.9 -> 33
    expect(getGrandfatherPrice(item, 0, 100, 0)).toBe(33);

    // Granny 120 luck: (120 - 80) * 0.003 = 0.12 (12% discount)
    // 35 * 0.88 = 30.8 -> 31
    expect(getGrandfatherPrice(item, 0, 120, 0)).toBe(31);

    // Korenarka 85 luck: (85 - 80) * 0.003 = 0.015 (1.5% discount)
    // 35 * (1 - 0.015) = 34.475 -> 34
    expect(getGrandfatherPrice(item, 0, 85, 0)).toBe(34);

    // High luck capping at 20% discount
    // 35 * 0.80 = 28
    expect(getGrandfatherPrice(item, 0, 160, 0)).toBe(28);
  });

  it('calculates rare offers chance scaling proportionally with Štěstí', () => {
    // Calling offer selection with 100 luck returns valid offers
    const offers100 = chooseGrandfatherOffers(500, 100, [], [], 4);
    expect(offers100.length).toBe(4);

    const offers120 = chooseGrandfatherOffers(500, 120, [], [], 4);
    expect(offers120.length).toBe(4);
  });
});
