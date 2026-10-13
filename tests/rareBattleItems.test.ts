import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyRareItemEffect,
  applyAnanasUpgrade,
  createRareDropTracker,
  canSpawnRareBattleDrop,
  rollRareBattleDrop,
  getRareDropAnnouncement,
  RARE_BATTLE_ITEMS,
} from '../src/game/drops';
import { GameEngine } from '../src/game/engine';
import { createInitialEngineState } from '../src/game/engineState';
import { getGrandfatherItem } from '../src/data/grandfatherItems';

describe('Vzácné folklórní pomocné předměty (Rare Folklore Battle Items)', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({ levelId: 1, character: 'wanderer', meta: { currentLang: 'cs' } });
  });

  describe('Trouba obecního ponocného (ponocny_horn)', () => {
    it('sets timeStopTimer and ponocnyFrostTimer to 5.0s and displays banner', () => {
      let soundPlayed = '';
      applyRareItemEffect(engine.state, engine.state.player, 'ponocny_horn', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('ponocnyHorn');
      expect(engine.state.timeStopTimer).toBe(5.0);
      expect(engine.state.ponocnyFrostTimer).toBe(5.0);
      expect(engine.state.activeRareOverlay).toBeDefined();
      expect(engine.state.activeRareOverlay?.type).toBe('ponocny_horn');
    });

    it('freezes enemies from moving or attacking during time stop', () => {
      let enemyUpdated = false;
      const foe = {
        id: 'rarach',
        x: 100,
        y: 100,
        hp: 50,
        update() { enemyUpdated = true; },
      };
      engine.state.enemies = [foe as any];

      applyRareItemEffect(engine.state, engine.state.player, 'ponocny_horn');
      engine.update(0.016);

      expect(enemyUpdated).toBe(false);
      expect(engine.state.timeStopTimer).toBeCloseTo(4.984, 2);
    });
  });

  describe('Masopustní řehtačka (masopust_rattle)', () => {
    it('defeats regular enemies and takes 35% maxHp from bosses while activating shockwave', () => {
      let soundPlayed = '';
      const regular = {
        id: 'rarach',
        hp: 40,
        dead: false,
        isDefeated: false,
        takeDamage(dmg: number) {
          this.hp -= dmg;
          if (this.hp <= 0) this.dead = true;
        },
      };
      const boss = {
        id: 'cert',
        hp: 2000,
        maxHp: 2000,
        isBoss: true,
        x: 0,
        y: 0,
        takeDamage(dmg: number) {
          this.hp -= dmg;
        },
      };
      engine.state.enemies = [regular as any, boss as any];

      applyRareItemEffect(engine.state, engine.state.player, 'masopust_rattle', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('masopustRattle');
      expect(engine.state.masopustShockwaveTimer).toBe(2.0);
      expect(regular.dead).toBe(true);
      expect(boss.hp).toBe(1300); // 2000 - 35% (700) = 1300
    });
  });

  describe('Babiččina kropenatá zástěra (babicka_apron)', () => {
    it('acts as map-wide suction magnet pulling all drops to player', () => {
      let soundPlayed = '';
      const farDrop = {
        type: 'gingerbread',
        x: 800,
        y: 800,
        vx: 0,
        vy: 0,
        time: 0,
      };
      engine.state.drops = [farDrop as any];

      applyRareItemEffect(engine.state, engine.state.player, 'babicka_apron', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('grandmothersApron');
      // Velocity should be pulled toward player (0, 0)
      expect(farDrop.vx).toBeLessThan(0);
      expect(farDrop.vy).toBeLessThan(0);
    });
  });

  describe('Hlt slivovice z modrého džbánku (slivovice_splash)', () => {
    it('purges debuffs, stuns enemies in front, and deploys spirit vapor', () => {
      let soundPlayed = '';
      const player = engine.state.player;
      player.slowTimer = 3.0;
      player.waterSoakedTimer = 4.0;
      player.facingAngle = 0; // facing right (+x)

      const frontFoe = {
        id: 'certik',
        x: player.x + 100,
        y: player.y,
        hp: 60,
        stunTimer: 0,
        drunkenStaggerTimer: 0,
      };
      engine.state.enemies = [frontFoe as any];

      applyRareItemEffect(engine.state, player, 'slivovice_splash', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('slivoviceSplash');
      expect(player.slowTimer).toBe(0);
      expect(player.waterSoakedTimer).toBe(0);
      expect(frontFoe.stunTimer).toBe(4.5);
      expect(frontFoe.drunkenStaggerTimer).toBe(4.5);
      expect(engine.state.slivoviceVapor).toBeDefined();
      expect(engine.state.slivoviceVapor?.life).toBe(4.0);
    });
  });

  describe('Dudácká čertovská skočná (svanda_bagpipes)', () => {
    it('forces enemies into 6s brawl and marks friendly fire kills', () => {
      let soundPlayed = '';
      const foe1 = {
        id: 'rarach',
        x: 50,
        y: 50,
        hp: 40,
        brawlTimer: 0,
      };
      const foe2 = {
        id: 'cert',
        x: 60,
        y: 60,
        hp: 100,
        brawlTimer: 0,
      };
      engine.state.enemies = [foe1 as any, foe2 as any];

      applyRareItemEffect(engine.state, engine.state.player, 'svanda_bagpipes', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('svandaBagpipes');
      expect(foe1.brawlTimer).toBe(6.0);
      expect(foe2.brawlTimer).toBe(6.0);
    });
  });

  describe('Kominický knoflík pro štěstí (kominik_button)', () => {
    it('grants 7s intangibility and guaranteed maximum critical hits (2.2x damage)', () => {
      let soundPlayed = '';
      const player = engine.state.player;

      applyRareItemEffect(engine.state, player, 'kominik_button', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('kominikButton');
      expect(player.intangibleTimer).toBe(7.0);
      expect(player.guaranteedCritTimer).toBe(7.0);
      expect(engine.state.activeRareOverlay?.type).toBe('kominik_button');

      // Player takes no damage while intangible
      const initialHp = player.hp;
      player.takeDamage(50, 'physical');
      expect(player.hp).toBe(initialHp);

      // Enemy takes 2.2x damage from guaranteed crits
      const foe = engine.spawnMonster('rarach', 100, 100, 1.0)!;
      const initialFoeHp = foe.hp;
      foe.takeDamage(10, 'physical');
      // 10 * 2.2 = 22 damage
      expect(initialFoeHp - foe.hp).toBe(22);
    });
  });

  describe('Arcivzácný ananas (arcivzacny_ananas)', () => {
    it('boosts maxHp by 30%, speed by 30%, restores full courage, and gives 10s invulnerability', () => {
      let soundPlayed = '';
      const player = engine.state.player;
      player.hp = 50; // injured
      const baseMaxHp = player.maxHp;
      const baseSpeed = player.speed;

      applyAnanasUpgrade(player, {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('ananasPickup');
      expect(player.maxHp).toBe(Math.round(baseMaxHp * 1.30));
      expect(player.hp).toBe(player.maxHp);
      expect(player.speed).toBe(Math.round(baseSpeed * 1.30));
      expect(player.invulnerabilityTimer).toBe(10.0);
    });
  });

  describe('Rare battle drop tracking and scheduling', () => {
    it('schedules 2 to 4 rare drops per run within balanced time windows', () => {
      const tracker = createRareDropTracker(3);
      expect(tracker.targetRareDrops).toBe(3);
      expect(tracker.scheduledWindows.length).toBe(3);
      expect(tracker.rareDropsSpawned).toBe(0);

      // Early game: cannot spawn
      expect(canSpawnRareBattleDrop(tracker, 30)).toBe(false);

      // Window 1 reached: can spawn
      expect(canSpawnRareBattleDrop(tracker, 115)).toBe(true);

      const drop1 = rollRareBattleDrop(tracker, 115);
      expect(RARE_BATTLE_ITEMS).toContain(drop1);
      expect(tracker.rareDropsSpawned).toBe(1);

      // Pity cooldown: cannot spawn within 60s
      expect(canSpawnRareBattleDrop(tracker, 140)).toBe(false);

      // Window 2 reached
      expect(canSpawnRareBattleDrop(tracker, 300)).toBe(true);
      rollRareBattleDrop(tracker, 300);

      // Window 3 reached
      expect(canSpawnRareBattleDrop(tracker, 500)).toBe(true);
      rollRareBattleDrop(tracker, 500);

      // Cap reached (3/3): no more rare battle drops
      expect(canSpawnRareBattleDrop(tracker, 600)).toBe(false);
    });

    it('returns Czech announcements for all rare battle items', () => {
      for (const item of RARE_BATTLE_ITEMS) {
        const ann = getRareDropAnnouncement(item);
        expect(ann.text).toBeTruthy();
        expect(ann.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe('Grandfather Shop Integration', () => {
    it('defines all 9 instant items and ananas in GRANDFATHER_ITEMS', () => {
      const ids = [
        'ponocny_horn',
        'masopust_rattle',
        'babicka_apron',
        'slivovice_splash',
        'svanda_bagpipes',
        'kominik_button',
        'kovarska_podkova',
        'hlineny_kohoutek',
        'vyrezavane_kukacky',
        'arcivzacny_ananas',
      ];
      for (const id of ids) {
        const item = getGrandfatherItem(id);
        expect(item).toBeDefined();
        expect(item?.name).toBeTruthy();
        expect(item?.description).toBeTruthy();
      }
    });

    it('translates all grandfather instant and treasure items in cs and en', async () => {
      const { getGrandfatherItemTranslation } = await import('../src/i18n');
      const ids = [
        'ponocny_horn',
        'masopust_rattle',
        'babicka_apron',
        'slivovice_splash',
        'svanda_bagpipes',
        'kominik_button',
        'kovarska_podkova',
        'hlineny_kohoutek',
        'vyrezavane_kukacky',
        'arcivzacny_ananas',
        'tepla_cikorka',
        'zejdlik_piva',
        'panak_koralky',
        'pekeln_poklad_drobny',
        'pekeln_poklad_stribrny',
        'pekeln_poklad_zlaty',
      ];
      for (const id of ids) {
        const cs = getGrandfatherItemTranslation(id, 'cs');
        const en = getGrandfatherItemTranslation(id, 'en');
        expect(cs.name).not.toBe(`grandfather_item.${id}.name`);
        expect(cs.desc).not.toBe(`grandfather_item.${id}.desc`);
        expect(en.name).not.toBe(`grandfather_item.${id}.name`);
        expect(en.desc).not.toBe(`grandfather_item.${id}.desc`);
      }
    });
  });

  describe('Folklore Item Trio via applyRareItemEffect', () => {
    it('applies horseshoe effect via applyRareItemEffect', () => {
      let soundPlayed = '';
      const farDrop = { type: 'gingerbread', x: 500, y: 500, vx: 0, vy: 0 };
      engine.state.drops = [farDrop as any];

      applyRareItemEffect(engine.state, engine.state.player, 'horseshoe', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('horseshoe');
      expect(farDrop.vx).toBeLessThan(0);
      expect(farDrop.vy).toBeLessThan(0);
    });

    it('applies rooster board-clear effect via applyRareItemEffect', () => {
      let soundPlayed = '';
      const regular = { hp: 30, dead: false, takeDamage(d: number) { this.hp -= d; if (this.hp <= 0) this.dead = true; } };
      const boss = { hp: 1000, maxHp: 1000, isBoss: true, takeDamage(d: number) { this.hp -= d; } };
      engine.state.enemies = [regular as any, boss as any];

      applyRareItemEffect(engine.state, engine.state.player, 'rooster', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('rooster');
      expect(regular.dead).toBe(true);
      expect(boss.hp).toBe(350); // 1000 - 650
      expect(engine.state.screenFlashTimer).toBeGreaterThan(0);
    });

    it('applies cuckoo clock time-stop effect via applyRareItemEffect', () => {
      let soundPlayed = '';
      applyRareItemEffect(engine.state, engine.state.player, 'cuckoo_clock', {
        onSound: (s) => { soundPlayed = s; },
      });

      expect(soundPlayed).toBe('cuckooClock');
      expect(engine.state.timeStopTimer).toBe(4.0);
    });
  });

  describe('evaluateFolkloreDrop (ADR 0006 Pity and Accumulation)', async () => {
    const { createFolkloreDropTracker, evaluateFolkloreDrop } = await import('../src/game/drops');

    it('guarantees horseshoe when uncollected gingerbread exceeds 120 for 20 seconds', () => {
      const tracker = createFolkloreDropTracker();
      const drops = [
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
        { type: 'gingerbread', value: 20, dead: false },
      ] as any[];

      // Time < 20s
      expect(evaluateFolkloreDrop(tracker, drops, 50, 10, false)).toBeNull();
      // Time reaches 20s
      expect(evaluateFolkloreDrop(tracker, drops, 60, 10, false)).toBe('horseshoe');
      // Cooldown in effect
      expect(evaluateFolkloreDrop(tracker, drops, 70, 10, false)).toBeNull();
    });
  });
});

