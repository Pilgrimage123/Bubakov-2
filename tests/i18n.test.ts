import { describe, it, expect } from 'vitest';
import { t, type SupportedLang, dictionaries } from '../src/i18n';
import { WEAPONS } from '../src/data/weapons';
import { VILLAGE_BUILDINGS } from '../src/data/village';
import { ENEMIES } from '../src/data/enemies';
import { migrateMetaProgression, createDefaultMetaProgression } from '../src/game/migration';

describe('i18n localization module', () => {
  it('translates simple keys in both cs and en', () => {
    expect(t('ui.play', 'cs')).toBe('Hrát');
    expect(t('ui.play', 'en')).toBe('Play');
  });

  it('falls back to cs when key is missing in en', () => {
    // Temporarily add a key only to cs dictionary
    (dictionaries.cs as any)['test.only_in_cs'] = 'Pouze v češtině';
    delete (dictionaries.en as any)['test.only_in_cs'];

    expect(t('test.only_in_cs', 'en')).toBe('Pouze v češtině');
    delete (dictionaries.cs as any)['test.only_in_cs'];
  });

  it('returns key itself when key is missing in both dictionaries', () => {
    expect(t('nonexistent.key.123', 'en')).toBe('nonexistent.key.123');
    expect(t('nonexistent.key.123', 'cs')).toBe('nonexistent.key.123');
  });

  it('translates all 15 weapons in both cs and en', () => {
    const weaponIds = [
      'osikovy_prut',
      'valecnice',
      'cesnekova_topinka',
      'kysela_okurka',
      'povidlove_buchty',
      'kovarske_vidle',
      'kovana_halapartna',
      'dreveny_cep',
      'devatero_kviti',
      'snehova_koule',
      'kynuty_kolac',
      'horky_brambor',
      'vceli_roj',
      'hromnicka',
      'svecena_kropenka',
    ];

    expect(weaponIds.length).toBe(15);

    for (const id of weaponIds) {
      const nameCs = t(`weapon.${id}.name`, 'cs');
      const nameEn = t(`weapon.${id}.name`, 'en');
      const descCs = t(`weapon.${id}.desc`, 'cs');
      const descEn = t(`weapon.${id}.desc`, 'en');

      expect(nameCs).not.toBe(`weapon.${id}.name`);
      expect(nameEn).not.toBe(`weapon.${id}.name`);
      expect(descCs).not.toBe(`weapon.${id}.desc`);
      expect(descEn).not.toBe(`weapon.${id}.desc`);

      expect(nameCs.length).toBeGreaterThan(0);
      expect(nameEn.length).toBeGreaterThan(0);
      expect(descCs.length).toBeGreaterThan(0);
      expect(descEn.length).toBeGreaterThan(0);
    }
  });

  it('translates all village buildings in both cs and en', () => {
    const buildingIds = VILLAGE_BUILDINGS.map(b => b.id);
    expect(buildingIds.length).toBe(12);

    for (const id of buildingIds) {
      const nameCs = t(`building.${id}.name`, 'cs');
      const nameEn = t(`building.${id}.name`, 'en');
      const storyCs = t(`building.${id}.story`, 'cs');
      const storyEn = t(`building.${id}.story`, 'en');

      expect(nameCs).not.toBe(`building.${id}.name`);
      expect(nameEn).not.toBe(`building.${id}.name`);
      expect(storyCs).not.toBe(`building.${id}.story`);
      expect(storyEn).not.toBe(`building.${id}.story`);

      expect(nameCs.length).toBeGreaterThan(0);
      expect(nameEn.length).toBeGreaterThan(0);
      expect(storyCs.length).toBeGreaterThan(0);
      expect(storyEn.length).toBeGreaterThan(0);
    }
  });

  it('translates all bestiary entries in both cs and en', () => {
    const enemyIds = Object.keys(ENEMIES);
    expect(enemyIds.length).toBeGreaterThanOrEqual(40);

    for (const id of enemyIds) {
      const nameCs = t(`bestiary.${id}.name`, 'cs');
      const nameEn = t(`bestiary.${id}.name`, 'en');
      const titleCs = t(`bestiary.${id}.title`, 'cs');
      const titleEn = t(`bestiary.${id}.title`, 'en');

      expect(nameCs).not.toBe(`bestiary.${id}.name`);
      expect(nameEn).not.toBe(`bestiary.${id}.name`);
      expect(titleCs).not.toBe(`bestiary.${id}.title`);
      expect(titleEn).not.toBe(`bestiary.${id}.title`);

      expect(nameCs.length).toBeGreaterThan(0);
      expect(nameEn.length).toBeGreaterThan(0);
      expect(titleCs.length).toBeGreaterThan(0);
      expect(titleEn.length).toBeGreaterThan(0);
    }
  });

  it('supports parameter substitution in translation strings', () => {
    (dictionaries.cs as any)['test.params'] = 'Máš {count} krejcarů a {level} úroveň';
    expect(t('test.params', 'cs', { count: 42, level: 3 })).toBe('Máš 42 krejcarů a 3 úroveň');
    delete (dictionaries.cs as any)['test.params'];
  });

  it('provides helper functions for typed entity translation', () => {
    const weapon = t('weapon.osikovy_prut.name', 'en');
    expect(weapon).toBe('Aspen Rod');

    const building = t('building.oven.name', 'en');
    expect(building).toBe('Bakery with Blazing Oven');

    const enemy = t('bestiary.cert.name', 'en');
    expect(enemy).toBe('Horned Devil');
  });

  describe('MetaProgression language state & migration', () => {
    it('sets currentLang default to cs in createDefaultMetaProgression', () => {
      const def = createDefaultMetaProgression();
      expect(def.currentLang).toBe('cs');
    });

    it('persists currentLang when migrated from saved state', () => {
      const migrated = migrateMetaProgression({ currentLang: 'en' });
      expect(migrated.currentLang).toBe('en');

      const migratedCs = migrateMetaProgression({ currentLang: 'cs' });
      expect(migratedCs.currentLang).toBe('cs');
    });

    it('falls back to cs if currentLang is unknown or missing in saved state', () => {
      const migratedEmpty = migrateMetaProgression({});
      expect(migratedEmpty.currentLang).toBe('cs');

      const migratedInvalid = migrateMetaProgression({ currentLang: 'de' });
      expect(migratedInvalid.currentLang).toBe('cs');
    });

    it('verifies language switching updates UI texts without impacting weapon base stats or engine keys', () => {
      const meta = createDefaultMetaProgression();
      expect(meta.currentLang).toBe('cs');

      // Check weapon definitions remain untouched
      expect(WEAPONS.osikovy_prut.id).toBe('osikovy_prut');
      expect(WEAPONS.osikovy_prut.baseDmg).toBe(28);

      // Switching lang toggles translated UI text immediately
      let lang: 'cs' | 'en' = meta.currentLang!;
      expect(t('ui.play', lang)).toBe('Hrát');

      lang = 'en';
      expect(t('ui.play', lang)).toBe('Play');
      expect(t('weapon.osikovy_prut.name', lang)).toBe('Aspen Rod');

      // Weapon logic and IDs are completely identical and intact
      expect(WEAPONS.osikovy_prut.id).toBe('osikovy_prut');
      expect(WEAPONS.osikovy_prut.baseDmg).toBe(28);
    });
  });
});
