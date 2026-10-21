import { describe, it, expect } from 'vitest';
import { WEAPONS, WEAPON_LEGACY_ALIASES } from '../src/data/weapons';
import { WEAPON_UNLOCKS, getWeaponProgress } from '../src/data/weaponUnlocks';
import { WEAPONS_WITH_MILESTONES } from '../src/data/weaponMilestones';
import { migrateMetaProgression } from '../src/game/migration';
import { t } from '../src/i18n';
import { HUNTER_DETAILS } from '../src/data/hunterDetails';

describe('Weapon and Cleanliness Canonization (ADR 0026)', () => {
  it('WEAPONS exports strictly 18 canonical weapons via Object.keys', () => {
    const keys = Object.keys(WEAPONS);
    expect(keys.length).toBe(18);
    for (const id of WEAPONS_WITH_MILESTONES) {
      expect(keys).toContain(id);
    }
  });

  it('WEAPONS allows seamless lookup via legacy aliases without polluting keys', () => {
    expect(WEAPONS['buns']).toBe(WEAPONS['povidlove_buchty']);
    expect(WEAPONS['cane']).toBe(WEAPONS['osikovy_prut']);
    expect(WEAPONS['pitchfork']).toBe(WEAPONS['kovarske_vidle']);
    expect(WEAPONS['halberd']).toBe(WEAPONS['kovana_halapartna']);
    expect(WEAPONS['flail']).toBe(WEAPONS['dreveny_cep']);
    expect(WEAPONS['herbs']).toBe(WEAPONS['devatero_kviti']);
    expect(WEAPONS['snowball']).toBe(WEAPONS['snehova_koule']);
    expect(WEAPONS['kolac']).toBe(WEAPONS['kynuty_kolac']);
    expect(WEAPONS['potato']).toBe(WEAPONS['horky_brambor']);
    expect(WEAPONS['bees']).toBe(WEAPONS['vceli_roj']);
    expect(WEAPONS['holywater']).toBe(WEAPONS['svecena_kropenka']);

    // Object.keys remains strictly 18
    expect(Object.keys(WEAPONS).length).toBe(18);
    expect(Object.keys(WEAPONS)).not.toContain('buns');
    expect(Object.keys(WEAPONS)).not.toContain('pitchfork');
  });

  it('WEAPON_UNLOCKS exports strictly 18 canonical weapons via Object.keys', () => {
    const keys = Object.keys(WEAPON_UNLOCKS);
    expect(keys.length).toBe(18);
    for (const id of WEAPONS_WITH_MILESTONES) {
      expect(keys).toContain(id);
    }
    // Verify each definition has canonical id matching its key
    for (const [key, def] of Object.entries(WEAPON_UNLOCKS)) {
      expect(def.id).toBe(key);
    }
  });

  it('WEAPON_UNLOCKS allows legacy alias lookups via Proxy', () => {
    expect(WEAPON_UNLOCKS['buns']).toBe(WEAPON_UNLOCKS['povidlove_buchty']);
    expect(WEAPON_UNLOCKS['pitchfork']).toBe(WEAPON_UNLOCKS['kovarske_vidle']);
    expect(WEAPON_UNLOCKS['holywater']).toBe(WEAPON_UNLOCKS['svecena_kropenka']);
    expect('buns' in WEAPON_UNLOCKS).toBe(true);
    expect('pitchfork' in WEAPON_UNLOCKS).toBe(true);
  });

  it('getWeaponProgress works identically for canonical IDs and aliases', () => {
    const meta = {
      unlockedWeapons: { kovarske_vidle: true },
      weaponKillCounts: { kovarske_vidle: { skeleton: 50 } },
    };
    const progCanonical = getWeaponProgress('kovarske_vidle', meta);
    const progLegacy = getWeaponProgress('pitchfork', meta);

    expect(progCanonical.isUnlocked).toBe(true);
    expect(progLegacy.isUnlocked).toBe(true);
    expect(progLegacy.id).toBe('kovarske_vidle');
    expect(progLegacy.spoiledName).toBe(progCanonical.spoiledName);
  });

  it('migrateMetaProgression safely migrates legacy keys and preserves nested kill breakdown objects', () => {
    const legacySave = {
      unlockedWeapons: {
        buns: true,
        pitchfork: true,
      },
      weaponKillCounts: {
        pitchfork: { skeleton: 25, umrlec: 10 },
        cane: 15,
      },
      currentLang: 'cs',
    };

    const migrated = migrateMetaProgression(legacySave);

    // Canonical keys unlocked
    expect(migrated.unlockedWeapons['kovarske_vidle']).toBe(true);
    expect(migrated.unlockedWeapons['povidlove_buchty']).toBe(true);
    expect(migrated.unlockedWeapons['osikovy_prut']).toBe(true);

    // Breakdown object preserved under canonical key
    expect(migrated.weaponKillCounts?.['kovarske_vidle']).toEqual({ skeleton: 25, umrlec: 10 });
    // Scalar counts converted properly
    expect(migrated.weaponKillCounts?.['osikovy_prut']).toBe(15);
  });

  it('verifies hunter strings in locales match runtime hunter starting gear', () => {
    // Shepherd
    expect(t('hunter.shepherd.bio', 'cs')).toContain('Povidlovými buchtami');
    expect(t('hunter.shepherd.bio', 'cs')).toContain('Dusot stáda');
    expect(t('hunter.shepherd.bio', 'en')).toContain('Plum Jam Buns');
    expect(t('hunter.shepherd.bio', 'en')).toContain('Herd Stampede');

    // Sexton
    expect(t('hunter.sexton.bio', 'cs')).toContain('Svěcenou kropenkou');
    expect(t('hunter.sexton.bio', 'cs')).toContain('Farní požehnání');
    expect(t('hunter.sexton.bio', 'en')).toContain('Holy Water Aspergillum');
    expect(t('hunter.sexton.bio', 'en')).toContain('Parish Blessing');

    // Single source of truth check with HUNTER_DETAILS
    expect(HUNTER_DETAILS.shepherd.weapon).toContain('Povidlové buchty');
    expect(HUNTER_DETAILS.shepherd.ability).toContain('Dusot stáda');
    expect(HUNTER_DETAILS.sexton.weapon).toContain('Svěcená kropenka');
    expect(HUNTER_DETAILS.sexton.ability).toContain('Farní požehnání');
  });

  it('verifies bestiary devil canonical naming in cs', () => {
    expect(t('bestiary.cert.name', 'cs')).toBe('Pekelný Čert');
    expect(t('bestiary.cert.name', 'en')).toBe('Horned Devil');
  });
});
