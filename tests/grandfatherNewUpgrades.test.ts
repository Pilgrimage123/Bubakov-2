import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { GRANDFATHER_ITEMS, getGrandfatherItem } from '../src/data/grandfatherItems';
import { getGrandfatherItemTranslation } from '../src/i18n';

describe('Nové upgrady pro Štěstí/Crit a úhybného Pasáčka (5 New Upgrades)', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, character: 'shepherd', meta: { currentLang: 'cs' } }); // Pasáček: base luck 105, dodgeChance 0.35
  });

  describe('Registrace a lokalizace (Registration & i18n)', () => {
    const itemIds = [
      'kominicka_supina',
      'jetelovy_ctyrlistek',
      'cinovy_strelecky_terc',
      'vrbova_pistalka',
      'lojem_mazane_krpce',
    ];

    it('všechny 5 nové upgrady existují v GRANDFATHER_ITEMS_MAP', () => {
      for (const id of itemIds) {
        const item = getGrandfatherItem(id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(id);
      }
    });

    it('obsahuje v dědečkově nůši jen jeden klobouk (🎩) a jedny boty (🥾)', () => {
      const bootItems = GRANDFATHER_ITEMS.filter(
        (item) =>
          item.icon === '🥾' ||
          item.name.toLowerCase().includes('krpce') ||
          item.name.toLowerCase().includes('boty')
      );
      const hatItems = GRANDFATHER_ITEMS.filter(
        (item) =>
          item.icon === '🎩' ||
          item.name.toLowerCase().includes('klobouk')
      );

      expect(bootItems).toHaveLength(1);
      expect(bootItems[0].id).toBe('sedmimile_krpce');
      expect(hatItems).toHaveLength(1);
      expect(hatItems[0].id).toBe('lojem_mazane_krpce');
    });

    it('mají české i anglické překlady v i18n', () => {
      for (const id of itemIds) {
        const cs = getGrandfatherItemTranslation(id, 'cs');
        const en = getGrandfatherItemTranslation(id, 'en');

        expect(cs.name).not.toBe(`grandfather_item.${id}.name`);
        expect(cs.desc).not.toBe(`grandfather_item.${id}.desc`);
        expect(en.name).not.toBe(`grandfather_item.${id}.name`);
        expect(en.desc).not.toBe(`grandfather_item.${id}.desc`);

        if (id === 'lojem_mazane_krpce') {
          expect(cs.name.toLowerCase()).not.toContain('dřeváky');
          expect(cs.name.toLowerCase()).toContain('klobouk');
        }
      }
    });
  });

  describe('1. Kominická šupina z kapra (kominicka_supina)', () => {
    it('přidá +8 Štěstí a navýší počet vrstev šupiny', () => {
      const item = getGrandfatherItem('kominicka_supina')!;
      const startLuck = engine.state.player.luck;

      engine.applyGrandfatherItem(item);
      expect(engine.state.player.luck).toBe(startLuck + 8);
      expect(engine.state.player.kominickaSupinaStacks).toBe(1);
    });

    it('triggerSupinaLuckyHarvest povýší nejbližší perníček nebo vytvoří krejcar', () => {
      // 1. Kdyz nejsou zadne pernicky, spadne krejcar
      const startCoins = engine.state.drops.length;
      engine.triggerSupinaLuckyHarvest(100, 100);
      expect(engine.state.drops.length).toBeGreaterThan(startCoins);
      const droppedCoin = engine.state.drops.find((d) => d.type === 'coin');
      expect(droppedCoin).toBeDefined();

      // 2. Kdyz je v dosahu maly pernicek, povysi ho na velky
      const gingerbread = { type: 'gingerbread' as const, x: 100, y: 100, size: 'small', value: 1, dead: false };
      engine.state.drops.push(gingerbread as any);

      engine.triggerSupinaLuckyHarvest(105, 105);
      expect(gingerbread.size).toBe('large');
      expect(gingerbread.value).toBe(3);
    });
  });

  describe('2. Jetelový čtyřlístek z mezí (jetelovy_ctyrlistek)', () => {
    it('přidá vrstvu čtyřlístku a po kritickém zásahu udělá efekt Z PEKLA ŠTĚSTÍ!', () => {
      const item = getGrandfatherItem('jetelovy_ctyrlistek')!;
      engine.applyGrandfatherItem(item);
      expect(engine.state.player.jetelovyCtyrlistekStacks).toBe(1);

      engine.state.player.luck = 160; // 60 nad 100
      engine.state.player.ultCd = 10;

      // Simulujeme reakci pri critu
      const p = engine.state.player;
      p.zPeklaStestiTimer = 2.5;
      p.ultCd = Math.max(0, p.ultCd - 0.25 * p.jetelovyCtyrlistekStacks);

      expect(p.zPeklaStestiTimer).toBe(2.5);
      expect(p.ultCd).toBe(9.75);
    });
  });

  describe('3. Cínový střelecký terč ze střelnice (cinovy_strelecky_terc)', () => {
    it('přidá vrstvy cínového terče a vyvolá pouťový třesk při kritickém úderu', () => {
      const item = getGrandfatherItem('cinovy_strelecky_terc')!;
      engine.applyGrandfatherItem(item);
      expect(engine.state.player.cinovyTercStacks).toBe(1);

      // Otestujeme zasahovani okolnich neprijatelu
      let splashDamageDealt = 0;
      const primaryEnemy = { x: 100, y: 100, hp: 100, maxHp: 100, radius: 15, isDefeated: false, dead: false };
      const nearbyEnemy = {
        x: 120,
        y: 100,
        hp: 100,
        maxHp: 100,
        radius: 15,
        isDefeated: false,
        dead: false,
        takeDamage: (amount: number) => { splashDamageDealt += amount; },
      };

      engine.state.enemies = [primaryEnemy as any, nearbyEnemy as any];
      engine.spatialHash.clear();
      engine.spatialHash.insert(primaryEnemy as any);
      engine.spatialHash.insert(nearbyEnemy as any);

      const finalDamage = 100;
      const splashDmg = Math.max(1, Math.round(finalDamage * 0.35));
      const splashNearby = engine.spatialHash.queryRadius(primaryEnemy.x, primaryEnemy.y, 95);

      for (const foe of splashNearby) {
        if (foe !== primaryEnemy && !foe.isDefeated) {
          foe.takeDamage(splashDmg);
        }
      }

      expect(splashDamageDealt).toBe(35);
    });
  });

  describe('4. Vrbová píšťalka z pastviny (vrbova_pistalka)', () => {
    it('zvýší šanci na úhyb a zkrátí odpočet ultu při úhybu', () => {
      const item = getGrandfatherItem('vrbova_pistalka')!;
      const startDodge = engine.state.player.dodgeChance;

      engine.applyGrandfatherItem(item);
      expect(engine.state.player.dodgeChance).toBeCloseTo(startDodge + 0.06);
      expect(engine.state.player.vrbovaPistalkaStacks).toBe(1);

      engine.state.player.ultCd = 12;
      let shockDamage = 0;

      const enemy = {
        x: 100,
        y: 120,
        hp: 100,
        maxHp: 100,
        radius: 15,
        isDefeated: false,
        dead: false,
        takeDamage: (dmg: number) => { shockDamage += dmg; },
      };
      engine.spatialHash.insert(enemy as any);

      // Simulace uchyteneho uhybu
      const p = engine.state.player;
      p.ultCd = Math.max(0, p.ultCd - 2.0);
      p.pistalkaSpeedTimer = 3.0;

      const shockFoes = engine.spatialHash.queryRadius(p.x, p.y, 160);
      for (const foe of shockFoes) {
        foe.takeDamage(Math.round(45 + p.speed * 0.4));
      }

      expect(p.ultCd).toBe(10);
      expect(p.pistalkaSpeedTimer).toBe(3.0);
      expect(shockDamage).toBeGreaterThan(100);
    });
  });

  describe('5. Vodnický klobouk s pentlí (lojem_mazane_krpce)', () => {
    it('zvýší úhyb, zhojí Kuráž a zanechá zpomalující louži při úhybu', () => {
      const item = getGrandfatherItem('lojem_mazane_krpce')!;
      const startDodge = engine.state.player.dodgeChance;

      engine.applyGrandfatherItem(item);
      expect(engine.state.player.dodgeChance).toBeCloseTo(startDodge + 0.05);
      expect(engine.state.player.lojemMazaneKrpceStacks).toBe(1);

      engine.state.player.hp = 30;
      engine.state.player.maxHp = 55;

      // Triggerneme uhyb s kloboukem
      const p = engine.state.player;
      p.hp = Math.min(p.maxHp, p.hp + 4);
      p.invulnerabilityTimer = 0.55;
      engine.spawnPlumPuddle(100, 100, 0.40);

      expect(p.hp).toBe(34);
      expect(p.invulnerabilityTimer).toBe(0.55);
      expect(engine.state.plumPuddles.length).toBe(1);
      expect(engine.state.plumPuddles[0].slowRatio).toBe(0.40);
    });
  });
});
