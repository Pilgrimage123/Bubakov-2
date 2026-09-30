import { WeaponDef } from '../types';
import { sound } from '../audio';

export const WEAPONS: Record<string, WeaponDef> = {
  buns: {
    id: 'buns',
    name: 'Povidlové buchty',
    type: 'food',
    icon: 'czech_buchta',
    baseDmg: 20,
    baseCd: 1.2,
    speed: 460,
    desc: 'Zlatavé kynuté české buchty pečené v pekáči, sypané jemným cukrem a plněné povidly. Nezpůsobují odhození ani grafický zásah, ale bubáci se na 4 s zastaví a mlsají s poznámkou „Ňam, ňam“. Vícero buchet čas sčítá (odolnost dle Hladu).',
    fire: (player, level) => {
      const enemies = player.getLivingEnemies();
      if (enemies.length === 0) return false;

      // Smart targeting: pick closest non-immune
      let target = enemies[0];
      let bestDist = player.distTo(target) + (target.hunger ?? target.foodResist ?? 0) * 400;

      for (let i = 1; i < enemies.length; i++) {
        const e = enemies[i];
        const d = player.distTo(e) + (e.hunger ?? e.foodResist ?? 0) * 400;
        if (d < bestDist) {
          bestDist = d;
          target = e;
        }
      }

      if (player.distTo(target) > 850) return false;

      const angle = Math.atan2(target.y - player.y, target.x - player.x);
      const count = 2 + level;
      const dmg = (20 + level * 5) * (player.damageMultiplier || 1);

      for (let i = 0; i < count; i++) {
        const spread = count > 1 ? (Math.random() - 0.5) * 0.45 : 0;
        player.spawnProjectile({
          x: player.x,
          y: player.y,
          angle: angle + spread,
          speed: 460,
          dmg,
          radius: 12,
          type: 'food',
          visual: 'bun',
          snackDuration: 4.0,
          life: 2.2,
        });
      }
      return true;
    },
  },

  cane: {
    id: 'cane',
    name: 'Vrbový prut',
    type: 'physical',
    icon: '🎋',
    baseDmg: 16,
    baseCd: 0.8,
    desc: 'Ohebný vrbový prut uříznutý u potoka. Rychlý sečný oblouk odhání dotěrné skřítky a zloděje. S kapkou rybniční vody získáte Mokrý prut.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const reach = 85 + level * 12;
      const arc = 1.3 + level * 0.2;
      const dmg = (16 + level * 5) * (player.damageMultiplier || 1);

      player.spawnMeleeSlash({
        x: player.x,
        y: player.y,
        angle,
        reach,
        arc,
        dmg,
        life: 0.2,
        type: 'physical',
        soaked: player.hasSoakedCane,
        style: 'arc',
      });
      sound.slash();
      return true;
    },
  },

  pitchfork: {
    id: 'pitchfork',
    name: 'Kovářské vidle',
    type: 'physical',
    icon: '🔱',
    baseDmg: 24,
    baseCd: 1.0,
    desc: 'Třízubé kované vidle z vesnické kovárny. Proráží řady strašidel mocným bodnutím přímo vpřed.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const reach = 130 + level * 16;
      const dmg = (24 + level * 6) * (player.damageMultiplier || 1);

      player.spawnMeleeSlash({
        x: player.x,
        y: player.y,
        angle,
        reach,
        arc: 0.65,
        dmg,
        life: 0.18,
        type: 'physical',
        soaked: player.hasSoakedCane,
        style: 'thrust',
      });
      sound.slash();
      return true;
    },
  },

  halberd: {
    id: 'halberd',
    name: 'Kovaná halapartna',
    type: 'physical',
    icon: '🪓',
    baseDmg: 32,
    baseCd: 1.25,
    desc: 'Těžká zbraň ponocných a panských drábů. Široký smrtonosný švih, který rozrazí i celé houfy kostlivců.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const reach = 145 + level * 15;
      const arc = 1.7 + level * 0.15;
      const dmg = (32 + level * 8) * (player.damageMultiplier || 1);

      player.spawnMeleeSlash({
        x: player.x,
        y: player.y,
        angle,
        reach,
        arc,
        dmg,
        life: 0.24,
        type: 'physical',
        soaked: player.hasSoakedCane,
        style: 'halberd',
      });
      sound.slash();
      return true;
    },
  },

  flail: {
    id: 'flail',
    name: 'Dřevěný cep na obilí',
    type: 'physical',
    icon: '🌾',
    baseDmg: 45,
    baseCd: 1.5,
    desc: 'Okovaný venkovský cep na mlácení žita. Drtivý dopad do země vyvolá rázovou vlnu a odhodí těžké nepřátele.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const dist = 90 + level * 10;
      const targetX = player.x + Math.cos(angle) * dist;
      const targetY = player.y + Math.sin(angle) * dist;
      const radius = 65 + level * 10;
      const dmg = (45 + level * 10) * (player.damageMultiplier || 1);

      player.spawnAreaImpact({
        x: targetX,
        y: targetY,
        radius,
        dmg,
        type: 'physical',
        visual: 'flail_smash',
        duration: 0.3,
      });
      sound.heavyHit();
      return true;
    },
  },

  herbs: {
    id: 'herbs',
    name: 'Devatery kvítí',
    type: 'nature',
    icon: '🌿',
    baseDmg: 15,
    baseCd: 1.1,
    speed: 350,
    desc: 'Voňavý ochranný věnec z léčivých bylin natrhaných o svatojánské noci. Šíří se v kruhu a zahání nečisté síly.',
    fire: (player, level) => {
      const count = 3 + level;
      const dmg = (15 + level * 4) * (player.damageMultiplier || 1);
      const baseOffset = (player.animTime * 3.5) % (Math.PI * 2);

      for (let i = 0; i < count; i++) {
        const a = baseOffset + (i / count) * Math.PI * 2;
        player.spawnProjectile({
          x: player.x,
          y: player.y,
          angle: a,
          speed: 350,
          dmg,
          radius: 14,
          type: 'nature',
          visual: 'herb_leaf',
          life: 2.0,
        });
      }
      sound.slash();
      return true;
    },
  },

  snowball: {
    id: 'snowball',
    name: 'Sněhová koule',
    type: 'ice',
    icon: '❄️',
    baseDmg: 18,
    baseCd: 1.0,
    speed: 400,
    desc: 'Tuhá ledová koule uválená ze zledovatělého ladovského sněhu. Chlad zpomalí nohy každému strašidlu.',
    fire: (player, level) => {
      const enemies = player.getLivingEnemies();
      if (enemies.length === 0) return false;

      let target = enemies[0];
      let minDist = player.distTo(target);
      for (let i = 1; i < enemies.length; i++) {
        const d = player.distTo(enemies[i]);
        if (d < minDist) {
          minDist = d;
          target = enemies[i];
        }
      }

      const angle = Math.atan2(target.y - player.y, target.x - player.x);
      const count = 2 + level;
      const dmg = (18 + level * 5) * (player.damageMultiplier || 1);

      for (let i = 0; i < count; i++) {
        const spread = count > 1 ? (Math.random() - 0.5) * 0.35 : 0;
        player.spawnProjectile({
          x: player.x,
          y: player.y,
          angle: angle + spread,
          speed: 400,
          dmg,
          radius: 15,
          type: 'ice',
          visual: 'snowball',
          life: 2.2,
        });
      }
      sound.freeze();
      return true;
    },
  },

  kolac: {
    id: 'kolac',
    name: 'Kynutý koláč s mákem',
    type: 'food',
    icon: '🥧',
    baseDmg: 28,
    baseCd: 1.4,
    speed: 380,
    desc: 'Velký kulatý koláč sypaný máslovou drobenkou. Odrazí se k dalšímu bubákovi a přiměje ho na 4 s mlsat bez útočení a odhození s poznámkou „Ňam, ňam“. Vícero zásahů sčítá čas (odolnost dle Hladu).',
    fire: (player, level) => {
      const enemies = player.getLivingEnemies();
      if (enemies.length === 0) return false;

      const target = enemies[Math.floor(Math.random() * Math.min(6, enemies.length))];
      const angle = Math.atan2(target.y - player.y, target.x - player.x);
      const bounces = 2 + level;
      const dmg = (28 + level * 6) * (player.damageMultiplier || 1);

      player.spawnProjectile({
        x: player.x,
        y: player.y,
        angle,
        speed: 380,
        dmg,
        radius: 16,
        type: 'food',
        visual: 'kolac',
        snackDuration: 4.0,
        bounces,
        life: 3.5,
      });
      sound.slash();
      return true;
    },
  },

  potato: {
    id: 'potato',
    name: 'Horký brambor z popela',
    type: 'fire',
    icon: '🥔',
    baseDmg: 22,
    baseCd: 1.3,
    speed: 320,
    desc: 'Brambor vytažený přímo z žhavého popela. Způsobuje popáleniny a zanechává na zemi kouřící ohnisko.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx) + (Math.random() - 0.5) * 0.4;
      const dmg = (22 + level * 5) * (player.damageMultiplier || 1);

      player.spawnProjectile({
        x: player.x,
        y: player.y,
        angle,
        speed: 340,
        dmg,
        radius: 14,
        type: 'fire',
        visual: 'potato',
        leavesFireZone: true,
        life: 1.6,
      });
      sound.slash();
      return true;
    },
  },

  bees: {
    id: 'bees',
    name: 'Včelí roj z úlu',
    type: 'nature',
    icon: '🐝',
    baseDmg: 12,
    baseCd: 0.9,
    speed: 330,
    desc: 'Bzučící venkovské včely ze starého špalkového úlu. Samy si nacházejí nejbližší strašidla a neúnavně je bodají.',
    fire: (player, level) => {
      const count = 3 + level;
      const dmg = (12 + level * 3) * (player.damageMultiplier || 1);

      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        player.spawnProjectile({
          x: player.x,
          y: player.y,
          angle: a,
          speed: 310 + Math.random() * 60,
          dmg,
          radius: 9,
          type: 'nature',
          visual: 'bee',
          homing: true,
          life: 3.0,
        });
      }
      sound.slash();
      return true;
    },
  },

  hromnicka: {
    id: 'hromnicka',
    name: 'Hromnička',
    type: 'holy',
    icon: '🕯️',
    baseDmg: 10,
    baseCd: 2.0,
    desc: 'Posvěcená hromniční svíce z kostela. Plápolající záře mírného dosahu jemně odtlačuje nepřátele a každé 2 s způsobuje posvátné zranění (obojí ovlivněno odolností proti Strachu). Nemrtví a pekelníci mají k ní silně sníženou odolnost a utrží podstatně vyšší zranění.',
    fire: (player, level) => {
      const reach = 135 + level * 15;
      const dmg = 10 + level * 3;
      player.spawnHromnickaPulse(reach, dmg, level);
      sound.candlePulse();
      return true;
    },
  },

  holywater: {
    id: 'holywater',
    name: 'Kropenka se svěcenou vodou',
    type: 'holy',
    icon: '✨',
    baseDmg: 30,
    baseCd: 1.5,
    desc: 'Svěcená voda z kapličky svatého Jiří. Kropí široký vějíř kapek a způsobuje zkázu silám temna. Nemrtví a pekelníci mají proti ní silně sníženou odolnost vůči Strachu a utrží až dvojnásobné poškození.',
    fire: (player, level) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const count = 5 + level;
      const dmg = (26 + level * 7) * (player.damageMultiplier || 1);

      for (let i = 0; i < count; i++) {
        const offsetAngle = angle + ((i - (count - 1) / 2) * 0.16);
        player.spawnProjectile({
          x: player.x,
          y: player.y,
          angle: offsetAngle,
          speed: 420 + Math.random() * 40,
          dmg,
          radius: 11,
          type: 'holy',
          visual: 'holy_droplet',
          life: 1.4,
        });
      }
      sound.bell();
      return true;
    },
  },
};
