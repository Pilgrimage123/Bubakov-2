import { describe, it, expect } from 'vitest';
import { ALL_GRANDFATHER_UPGRADES, ALL_WEAPON_KEYS } from '../src/components/TestModeModal';
import { GRANDFATHER_ITEMS, getGrandfatherItem } from '../src/data/grandfatherItems';
import { SYNERGISTIC_UPGRADES, getSynergisticUpgrade } from '../src/data/synergisticUpgrades';

describe('Sandbox Grandfather Upgrades (0-X)', () => {
  it('contains all grandfather non-weapon upgrades from GRANDFATHER_ITEMS', () => {
    const nonWeaponItems = GRANDFATHER_ITEMS.filter((item) => !item.isWeapon);
    expect(nonWeaponItems.length).toBeGreaterThan(0);

    for (const item of nonWeaponItems) {
      const sandboxEntry = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === item.id);
      expect(sandboxEntry, `Expected grandfather item ${item.id} (${item.name}) to exist in sandbox upgrades`).toBeDefined();
      expect(sandboxEntry?.name).toBe(item.name);
      expect(sandboxEntry?.maxLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it('contains all synergistic upgrades from SYNERGISTIC_UPGRADES', () => {
    const synKeys = Object.keys(SYNERGISTIC_UPGRADES);
    expect(synKeys.length).toBeGreaterThan(0);

    for (const synKey of synKeys) {
      const synDef = SYNERGISTIC_UPGRADES[synKey];
      const sandboxEntry = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === synDef.id);
      expect(sandboxEntry, `Expected synergistic upgrade ${synDef.id} (${synDef.name}) to exist in sandbox`).toBeDefined();
      expect(sandboxEntry?.category).toBe('synergy');
      expect(sandboxEntry?.maxLevel).toBe(1);
    }
  });

  it('provides valid level bounds 0 to maxLevel for every upgrade', () => {
    for (const upgrade of ALL_GRANDFATHER_UPGRADES) {
      expect(upgrade.maxLevel).toBeGreaterThanOrEqual(1);
      expect(upgrade.maxLevel).toBeLessThanOrEqual(10);
      expect(typeof upgrade.name).toBe('string');
      expect(upgrade.name.length).toBeGreaterThan(0);
      expect(typeof upgrade.description).toBe('string');
      expect(upgrade.description.length).toBeGreaterThan(0);
      expect(['passive', 'folklore', 'treasure', 'consumable', 'synergy']).toContain(upgrade.category);
    }
  });

  it('includes key folklore items such as Tříkrálová křída, Uleželý syreček, and Arcivzácný ananas', () => {
    const krida = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === 'trikralova_krida');
    expect(krida).toBeDefined();
    expect(krida?.maxLevel).toBe(3);

    const syrecek = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === 'ulezely_syrecek');
    expect(syrecek).toBeDefined();
    expect(syrecek?.maxLevel).toBe(3);

    const ananas = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === 'arcivzacny_ananas');
    expect(ananas).toBeDefined();
    expect(ananas?.maxLevel).toBe(2);

    const fusekle = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === 'babicciny_kousave_fusekle');
    expect(fusekle).toBeDefined();
    expect(fusekle?.maxLevel).toBe(4);
  });

  it('includes all weapons including splaseny_houser and formansky_bic in ALL_WEAPON_KEYS', () => {
    expect(ALL_WEAPON_KEYS).toContain('splaseny_houser');
    expect(ALL_WEAPON_KEYS).toContain('formansky_bic');
    expect(ALL_WEAPON_KEYS.length).toBeGreaterThanOrEqual(17);
  });
});
