import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMBAT_TEXT_CATEGORIES,
  DEFAULT_COMBAT_TEXT_SETTINGS,
  TACTICAL_COMBAT_TEXT_SETTINGS,
  PERFORMANCE_COMBAT_TEXT_SETTINGS,
  getCombatTextPreset,
  getSettingsForPreset,
  inferCombatTextCategory,
  shouldDrawCombatText,
  isCombatTextCategoryEnabled,
  isBossWarningBanner,
  shouldShowWarningBanner,
  setCombatTextSettings,
  CombatTextCategory,
} from '../src/game/combatTextSettings';
import { DamageText, GameEngine } from '../src/game/engine';
import { createDefaultMetaProgression, migrateMetaProgression } from '../src/game/migration';

describe('Bojové plovoucí texty a varování (ADR 0016)', () => {
  beforeEach(() => {
    setCombatTextSettings(DEFAULT_COMBAT_TEXT_SETTINGS);
  });

  describe('Taxonomie a kategorie', () => {
    it('obsahuje přesně 12 kanonických kategorií textu a varování', () => {
      expect(COMBAT_TEXT_CATEGORIES).toHaveLength(12);
      const keys = COMBAT_TEXT_CATEGORIES.map((c) => c.key);
      expect(keys).toEqual([
        'enemyDamage',
        'hunterDamage',
        'healing',
        'combatStates',
        'attackWindups',
        'combatShouts',
        'lootResources',
        'unlocksMilestones',
        'bossAnnouncements',
        'bossWarningBanners',
        'directorWarningBanners',
        'visualTelegraphCues',
      ]);
    });

    it('každá kategorie má český název, popis i ikonu', () => {
      for (const cat of COMBAT_TEXT_CATEGORIES) {
        expect(cat.label).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.icon).toBeTruthy();
      }
    });
  });

  describe('Rychlé předvolby (Presety)', () => {
    it('správně rozezná Plnou atmosféru (full)', () => {
      expect(getCombatTextPreset(DEFAULT_COMBAT_TEXT_SETTINGS)).toBe('full');
      for (const key of Object.keys(DEFAULT_COMBAT_TEXT_SETTINGS) as CombatTextCategory[]) {
        expect(DEFAULT_COMBAT_TEXT_SETTINGS[key]).toBe(true);
      }
    });

    it('správně rozezná Taktický režim (tactical)', () => {
      expect(getCombatTextPreset(TACTICAL_COMBAT_TEXT_SETTINGS)).toBe('tactical');
      // V taktickém režimu jsou nápřahy, hlášky a suroviny vypnuty
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.attackWindups).toBe(false);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.combatShouts).toBe(false);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.lootResources).toBe(false);
      // Klíčová čísla, stavy a varování jsou zapnuty
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.enemyDamage).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.hunterDamage).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.healing).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.combatStates).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.unlocksMilestones).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.bossAnnouncements).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.bossWarningBanners).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.directorWarningBanners).toBe(true);
      expect(TACTICAL_COMBAT_TEXT_SETTINGS.visualTelegraphCues).toBe(true);
    });

    it('správně rozezná Čistý výkon (performance)', () => {
      expect(getCombatTextPreset(PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe('performance');
      for (const key of Object.keys(PERFORMANCE_COMBAT_TEXT_SETTINGS) as CombatTextCategory[]) {
        expect(PERFORMANCE_COMBAT_TEXT_SETTINGS[key]).toBe(false);
      }
    });

    it('při libovolné změně přepne na Vlastní (custom)', () => {
      const custom = { ...DEFAULT_COMBAT_TEXT_SETTINGS, combatShouts: false };
      expect(getCombatTextPreset(custom)).toBe('custom');
    });

    it('getSettingsForPreset vrací korektní konfigurace', () => {
      expect(getSettingsForPreset('full')).toEqual(DEFAULT_COMBAT_TEXT_SETTINGS);
      expect(getSettingsForPreset('tactical')).toEqual(TACTICAL_COMBAT_TEXT_SETTINGS);
      expect(getSettingsForPreset('performance')).toEqual(PERFORMANCE_COMBAT_TEXT_SETTINGS);
    });
  });

  describe('inferCombatTextCategory (Klasifikace textů bez zadané kategorie)', () => {
    it('správně odvodí zranění nepřátel', () => {
      expect(inferCombatTextCategory('15')).toBe('enemyDamage');
      expect(inferCombatTextCategory('120 💥')).toBe('enemyDamage');
      expect(inferCombatTextCategory('35 ⚡')).toBe('enemyDamage');
    });

    it('správně odvodí zranění Kuráže lovce', () => {
      expect(inferCombatTextCategory('-12')).toBe('hunterDamage');
      expect(inferCombatTextCategory('BLESKOVÝ ODRAZ! -8 ⚡')).toBe('hunterDamage');
      expect(inferCombatTextCategory('DRTIVÝ NÁRAZ VIDLEMI! -25 💥')).toBe('hunterDamage');
    });

    it('správně odvodí léčení a obnovu Kuráže', () => {
      expect(inferCombatTextCategory('+15 Kuráž 🥐')).toBe('healing');
      expect(inferCombatTextCategory('+50 Kuráž! 💖')).toBe('healing');
      expect(inferCombatTextCategory('+6 Kuráž')).toBe('healing');
      expect(inferCombatTextCategory('+20 ❤️')).toBe('healing');
    });

    it('správně odvodí bojové stavy a reakce', () => {
      expect(inferCombatTextCategory('DODGE!')).toBe('combatStates');
      expect(inferCombatTextCategory('MINUL! 💨')).toBe('combatStates');
      expect(inferCombatTextCategory('ŠTÍT POHLTIL! 🛡️')).toBe('combatStates');
      expect(inferCombatTextCategory('IMUNNÍ! 🪨')).toBe('combatStates');
      expect(inferCombatTextCategory('VYČERPÁN! 💫')).toBe('combatStates');
      expect(inferCombatTextCategory('Usmířen! 🕊️')).toBe('combatStates');
      expect(inferCombatTextCategory('POSVÁTNÝ ODRAZ! 🛡️')).toBe('combatStates');
      expect(inferCombatTextCategory('VYRUŠENÍ! 💥')).toBe('combatStates');
    });

    it('správně odvodí nápřahy a útoky', () => {
      expect(inferCombatTextCategory('VÝPAD ČEPELÍ! ⚔️')).toBe('attackWindups');
      expect(inferCombatTextCategory('DUSOT KOPYT! 🐎')).toBe('attackWindups');
      expect(inferCombatTextCategory('DRAČÍ PLAMEN! 🔥')).toBe('attackWindups');
      expect(inferCombatTextCategory('SEKNUTÍ KOSOU! ⚔️')).toBe('attackWindups');
      expect(inferCombatTextCategory('SOPEČNÁ TRHLINA! 🌋')).toBe('attackWindups');
      expect(inferCombatTextCategory('BUM!')).toBe('attackWindups');
      expect(inferCombatTextCategory('PRÁSK! ⚡')).toBe('attackWindups');
    });

    it('správně odvodí bojové pokřiky a atmosféru', () => {
      expect(inferCombatTextCategory('"TENHLE ÚČET ZAPLATÍ BUBÁCI! 🍺"')).toBe('combatShouts');
      expect(inferCombatTextCategory('ROZOHNĚNÍ: +35 % RYCHLEJŠÍ NABÍJENÍ! ⚡')).toBe('combatShouts');
    });

    it('správně odvodí kořist a suroviny', () => {
      expect(inferCombatTextCategory('+1 🍪')).toBe('lootResources');
      expect(inferCombatTextCategory('+25 kr. (Groš)')).toBe('lootResources');
      expect(inferCombatTextCategory('+25 KREJCARŮ! 🪙')).toBe('lootResources');
      expect(inferCombatTextCategory('CINK! 🪙')).toBe('lootResources');
      expect(inferCombatTextCategory('CUKROVÝ SPĚCH! ⚡')).toBe('lootResources');
      expect(inferCombatTextCategory('DUŠIČKA OSVOBOZENA! +25 kr.')).toBe('lootResources');
    });

    it('správně odvodí odemčení a milníky', () => {
      expect(inferCombatTextCategory('🎉 MATĚJ ODEMČEN!')).toBe('unlocksMilestones');
      expect(inferCombatTextCategory('🎉 ZBRAŇ: KOSA ODEMČENA!')).toBe('unlocksMilestones');
      expect(inferCombatTextCategory('🎉 PŘEDJAŘÍ ODEMČENA!')).toBe('unlocksMilestones');
      expect(inferCombatTextCategory('Milník zbraně')).toBe('unlocksMilestones');
    });

    it('správně odvodí globální oznámení a unikátní chvaty bossů', () => {
      expect(inferCombatTextCategory('👑 PEKELNÝ ČERT')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('🎁 POKLAD VLÁDCE BUBÁKŮ!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('🎉 ČERT ZKLIDNĚN!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('🔥 PEKELNÉ MLETÍ!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('❄️ SMRTÍCÍ MRAZ!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('POVODEŇ ZE STAVIDEL! 🌊')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('MOUČNÝ MRAK!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('🗡️ PROKLETÍ HLÁSKY!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('🐉 PROBUZENÍ VŠECH TŘÍ HLAV!')).toBe('bossAnnouncements');
      expect(inferCombatTextCategory('MRAZIVÝ ŘEV DO STROPU! 🧊🔊')).toBe('bossAnnouncements');
    });
  });

  describe('isBossWarningBanner a shouldShowWarningBanner (Filtrace varování)', () => {
    it('spolehlivě rozezná varovné bannery bossů oproti varováním výpravy', () => {
      expect(isBossWarningBanner('⚠️ BLÍŽÍ SE ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️')).toBe(true);
      expect(isBossWarningBanner('☀️ POZOR: PŘICHÁZÍ MOCNÁ KOSNÁ POLEDNICE!')).toBe(true);
      expect(isBossWarningBanner('❄️ MORANA SE ROZHNĚVALA! PŘICHÁZÍ SNĚŽNÁ VÁNICE!')).toBe(true);
      expect(isBossWarningBanner('🔥 PEKELNÉ MLETÍ! ČERTŮV MLÝN SE ROZTÁČÍ!')).toBe(true);
      expect(isBossWarningBanner('🌊 STAVIDLA OTEVŘENA – POVODŇOVÁ VLNA!')).toBe(true);
      expect(isBossWarningBanner('💨 MOUČNÝ OBLAK – BÍLÁ TMA!')).toBe(true);
      expect(isBossWarningBanner('🐉 VŠECHNY TŘI HLAVY PROBUZENY! OHEŇ, MRÁZ A VICHR KŘÍDEL!')).toBe(true);
      expect(isBossWarningBanner('🏆 PEKELNÝ ČERT POKOŘEN – VÍTĚZSTVÍ!')).toBe(true);

      // Režisér výpravy a přepadení
      expect(isBossWarningBanner('⚠️ Kradmé kroky za humny... Pozor na přepadení a drtivý přepad!')).toBe(false);
      expect(isBossWarningBanner('⚠️ ELITNÍ BUBÁK: Vichřicový (Hejkal)!')).toBe(false);
      expect(isBossWarningBanner('🌑 Země puká: Objevila se Bubácká díra! Udrž rituál pro poklad!')).toBe(false);
      expect(isBossWarningBanner('⚠️ Čas vypršel! Z Bubácké díry se vyvalil velký rozmrzelý bubák!')).toBe(false);
    });

    it('vypnutí bossWarningBanners spolehlivě skryje varování bossů, ale zachová varování výpravy', () => {
      const customSettings = {
        ...DEFAULT_COMBAT_TEXT_SETTINGS,
        bossWarningBanners: false,
        directorWarningBanners: true,
      };

      expect(shouldShowWarningBanner('⚠️ BLÍŽÍ SE ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️', customSettings)).toBe(false);
      expect(shouldShowWarningBanner('❄️ MORANA SE ROZHNĚVALA! PŘICHÁZÍ SNĚŽNÁ VÁNICE!', customSettings)).toBe(false);
      expect(shouldShowWarningBanner('⚠️ Kradmé kroky za humny... Pozor na přepadení!', customSettings)).toBe(true);
      expect(shouldShowWarningBanner('⚠️ ELITNÍ BUBÁK: Vichřicový!', customSettings)).toBe(true);
    });

    it('vypnutí directorWarningBanners skryje přepady a elitní hordy, ale zachová bossy', () => {
      const customSettings = {
        ...DEFAULT_COMBAT_TEXT_SETTINGS,
        bossWarningBanners: true,
        directorWarningBanners: false,
      };

      expect(shouldShowWarningBanner('⚠️ BLÍŽÍ SE ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️', customSettings)).toBe(true);
      expect(shouldShowWarningBanner('⚠️ Kradmé kroky za humny... Pozor na přepadení!', customSettings)).toBe(false);
      expect(shouldShowWarningBanner('⚠️ ELITNÍ BUBÁK: Vichřicový!', customSettings)).toBe(false);
    });

    it('v režimu Čistý výkon (performance) jsou vypnuty všechny bannery bez výjimky', () => {
      expect(shouldShowWarningBanner('⚠️ BLÍŽÍ SE ŠÉF ÚROVNĚ: PEKELNÝ ČERT! ⚠️', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
      expect(shouldShowWarningBanner('❄️ MORANA SE ROZHNĚVALA!', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
      expect(shouldShowWarningBanner('🔥 PEKELNÉ MLETÍ!', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
      expect(shouldShowWarningBanner('⚠️ Kradmé kroky za humny...', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
      expect(shouldShowWarningBanner('⚠️ ELITNÍ BUBÁK: Vichřicový!', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
      expect(shouldShowWarningBanner('🌑 Země puká: Objevila se Bubácká díra!', PERFORMANCE_COMBAT_TEXT_SETTINGS)).toBe(false);
    });
  });

  describe('shouldDrawCombatText a filtrace', () => {
    it('respektuje vypnuté kategorie', () => {
      setCombatTextSettings({
        ...DEFAULT_COMBAT_TEXT_SETTINGS,
        combatShouts: false,
        attackWindups: false,
      });

      expect(shouldDrawCombatText('enemyDamage', '15')).toBe(true);
      expect(shouldDrawCombatText('combatShouts', '"TENHLE ÚČET ZAPLATÍ BUBÁCI!"')).toBe(false);
      expect(shouldDrawCombatText('attackWindups', 'VÝPAD ČEPELÍ!')).toBe(false);
    });

    it('v režimu výkonu blokuje veškeré kategorie', () => {
      setCombatTextSettings(PERFORMANCE_COMBAT_TEXT_SETTINGS);

      for (const cat of COMBAT_TEXT_CATEGORIES) {
        expect(shouldDrawCombatText(cat.key)).toBe(false);
      }
    });
  });

  describe('DamageText třída a sčítání multi-hitů', () => {
    it('přiřadí předanou kategorii nebo ji odvodí', () => {
      const dt1 = new DamageText(10, 20, '15', '#FFF', false, 'enemyDamage');
      expect(dt1.category).toBe('enemyDamage');

      const dt2 = new DamageText(10, 20, '+15 Kuráž 🥐');
      expect(dt2.category).toBe('healing');
    });

    it('addAmount správně sčítá číselné hodnoty poškození', () => {
      const dt = new DamageText(10, 20, '15', '#FFF', false, 'enemyDamage');
      dt.addAmount(10);
      expect(dt.text).toBe('25');

      const dtCrit = new DamageText(10, 20, '30 💥', '#FFF', false, 'enemyDamage');
      dtCrit.addAmount(20);
      expect(dtCrit.text).toBe('50 💥');
    });
  });

  describe('GameEngine.addDamageText integrace', () => {
    it('přidá text, pokud je kategorie povolená', () => {
      const engine = new GameEngine();
      const dt = engine.addDamageText(50, 50, '100', '#FFF', false, 'enemyDamage');
      expect(dt).not.toBeNull();
      expect(engine.state.texts).toContain(dt);
    });

    it('nepřidá text a vrátí null, pokud je kategorie zakázaná', () => {
      setCombatTextSettings({
        ...DEFAULT_COMBAT_TEXT_SETTINGS,
        enemyDamage: false,
      });
      const engine = new GameEngine();
      const dt = engine.addDamageText(50, 50, '100', '#FFF', false, 'enemyDamage');
      expect(dt).toBeNull();
      expect(engine.state.texts).toHaveLength(0);
    });
  });

  describe('Migrace a perzistence', () => {
    it('createDefaultMetaProgression obsahuje výchozí nastavení všech 12 kategorií', () => {
      const meta = createDefaultMetaProgression();
      expect(meta.combatTextSettings).toBeDefined();
      expect(meta.combatTextSettings).toEqual(DEFAULT_COMBAT_TEXT_SETTINGS);
      expect(Object.keys(meta.combatTextSettings || {})).toHaveLength(12);
    });

    it('migrateMetaProgression zachovává existující nastavení a bezpečně doplňuje výchozí', () => {
      const partialSaved = {
        krejcary: 100,
        combatTextSettings: {
          attackWindups: false,
        },
      };
      const migrated = migrateMetaProgression(partialSaved);
      expect(migrated.combatTextSettings?.attackWindups).toBe(false);
      expect(migrated.combatTextSettings?.enemyDamage).toBe(true);
      expect(migrated.combatTextSettings?.bossWarningBanners).toBe(true);
      expect(migrated.combatTextSettings?.directorWarningBanners).toBe(true);
      expect(migrated.combatTextSettings?.visualTelegraphCues).toBe(true);
    });
  });
});
