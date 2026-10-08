import React from 'react';
import { sound } from '../audio';
import { getRankedWeaponStats, type WeaponStats } from './weaponMilestones';

/* Legacy mastery state retained only for backwards save compatibility. */
export type WeaponMasteryState = {
  picked: string[];
  hitCounter: number;
  cooldownUntil: number;
  procCount: number;
  projectileRemainder: number;
};
export const createWeaponMasteryState = (): WeaponMasteryState => ({
  picked: [], hitCounter: 0, cooldownUntil: 0, procCount: 0, projectileRemainder: 0
});

/* Deprecated mastery API retained so old saves/imports remain load-safe. */
export type MasteryOption = { id: string; name: string; desc: string; kind: 'effect'; value: number };
export const MASTERY_OPTIONS: Record<string, MasteryOption[]> = {};
export function getMasteryOptions(_weaponId: string) { return []; }
export function applyMasteryOption(w: any, o: MasteryOption) {
  if (!w.mastery) w.mastery = createWeaponMasteryState();
  if (!w.mastery.picked.includes(o.id)) w.mastery.picked.push(o.id);
}
export function getProjectileCount(baseCount: number, _w?: any) { return Math.max(1, Math.floor(baseCount)); }
export function getWeaponDamage(player: any, baseDamage: number) {
  const tulakMult = player?.tulakDamageBonus ? 1 + (player.tulakDamageBonus / 100) : 1;
  return baseDamage * tulakMult * (player?.damageMultiplier || 1);
}

var WEAPONS = {
	valecnice: {
		id: 'valecnice', name: 'Válečnice', type: 'valecnice', icon: 'valecnice', baseDmg: 52, baseCd: 0.48,
		desc: 'Rázná venkovská paní s bukovým válečkem (+40 % velikost). Obíhá lovce ve velkém kruhu (115 px), má o 60 % větší dosah (58 px), udílí těžké 3s omráčení, odhození (760) a ignoruje 20 % odolností. V zóně o 15 % větší než orbit navíc zpomaluje nepřátele o 40 % (odolnost dle Vůle).',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('valecnice', level, w);
			const count = Math.max(1, 1 + stats.projectileCount);
			const orbitRadius = 115 * stats.areaRadiusMult;
			player._valecniceSlowRadius = orbitRadius * 1.15;
			const angleBase = player.valecniceAngle || 0;
			const dmg = getWeaponDamage(player, 52) * stats.damageMult;
			const kbForce = 760 * stats.knockbackMult;
			const stunDuration = 3.0 * (stats.statusDurationSec > 0 ? stats.statusDurationSec : 1);
			const reachBase = 58 * stats.areaRadiusMult;
			const enemies = player.getNearbyEnemies(orbitRadius + reachBase + 50);
			let hitAny = false;
			for (let i = 0; i < count; i++) {
				const a = angleBase + i * Math.PI * 2 / count;
				const ox = player.x + Math.cos(a) * orbitRadius;
				const oy = player.y + Math.sin(a) * orbitRadius;
				for (const e of enemies) {
					if (e.isDefeated) continue;
					const dx = e.x - ox, dy = e.y - oy, reach = reachBase + e.radius;
					if (dx * dx + dy * dy <= reach * reach) {
						const dist = Math.hypot(dx, dy) || 1;
						e.takeDamage(dmg, 'physical', (dx / dist) * kbForce, (dy / dist) * kbForce, {
							ignoreResist: 0.20,
							stunDuration,
							source: 'valecnice'
						});
						hitAny = true;
						if (typeof player.triggerWeaponMastery === 'function') player.triggerWeaponMastery('valecnice', e, 'hit');
					}
				}
			}
			if (hitAny) {
				player._valecnicePulse = true;
				if (typeof sound.valecWhack === 'function') {
					sound.valecWhack();
				} else {
					sound.heavyHit();
				}
			}
			return true;
		}
	},
	'cesnekova-topinka': {
		id: 'cesnekova-topinka', name: 'Česneková topinka', type: 'garlic', icon: 'cesnekova_topinka', baseDmg: 1, baseCd: 0.35,
		desc: 'Smradlavá aura z česnekové topinky. Skoro neškodí, ale nepřátele brutálně odhazuje.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('cesnekova_topinka', level, w);
			const radius = 110 * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 1) * stats.damageMult;
			const kbForce = 320 * stats.knockbackMult;
			const enemies = player.getNearbyEnemies(radius + 60);
			for (const e of enemies) {
				if (e.isDefeated) continue;
				const dx = e.x - player.x, dy = e.y - player.y, reach = radius + e.radius;
				if (dx * dx + dy * dy <= reach * reach) {
					const dist = Math.hypot(dx, dy) || 1;
					e.takeDamage(dmg, 'physical', dx / dist * kbForce, dy / dist * kbForce);
					if (typeof player.triggerWeaponMastery === 'function') player.triggerWeaponMastery('cesnekova-topinka', e, 'hit');
					if (stats.statusDurationSec > 0) e.garlicSlowTimer = Math.max(e.garlicSlowTimer || 0, stats.statusDurationSec);
				}
			}
			return true;
		}
	},
	'kysela-okurka': {
		id: 'kysela-okurka', name: 'Kyselá okurka', type: 'pickle', icon: 'kysela_okurka', baseDmg: 20, baseCd: 1.15, speed: 420,
		desc: 'Střílí kyselé okurky. Kdo se jich přejí, zezelená, zeslábne a začne dostávat větší rány.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('kysele_okurky', level, w);
			const count = Math.max(1, 1 + stats.projectileCount);
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(900) : player.getLivingEnemies();
			if (!enemies.length) return false;
			let target = enemies[0], minDist = player.distTo(target);
			for (let i=1;i<enemies.length;i++){const d=player.distTo(enemies[i]);if(d<minDist){minDist=d;target=enemies[i];}}
			const angle = Math.atan2(target.y-player.y,target.x-player.x);
			const dmg = getWeaponDamage(player, 20) * stats.damageMult;
			for(let i=0;i<count;i++) player.spawnProjectile({x:player.x,y:player.y,angle:angle+(count>1?(i-(count-1)/2)*.10:0),speed:420,dmg,radius:13,type:'pickle',visual:'pickle',life:2.2,pickleDamageTakenMultiplier: level >= 5 ? 1.50 : 1.35, pierce: stats.pierce});
			return true;
		}
	},
	buns: {
		id: "buns",
		name: "Povidlové buchty",
		type: "food",
		icon: "czech_buchta",
		baseDmg: 20,
		baseCd: 1.2,
		speed: 460,
		desc: "Zlatavé kynuté české buchty pečené v pekáči, sypané jemným cukrem a plněné povidly. Nezpůsobují odhození ani grafický zásah, ale bubáci se na 3 s zastaví a mlsají s poznámkou „Ňam, ňam“. Vícero buchet čas sčítá (odolnost dle Hladu).",
		fire: (player, level) => {
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
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
			const w = player._firingWeapon;
			const count = 3 + Math.floor((level - 1) / 2);
			const dmg = getWeaponDamage(player, 20 + (level - 1) * 4);
			for (let i = 0; i < count; i++) {
				const spread = count > 1 ? (Math.random() - .5) * .45 : 0;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: angle + spread,
					speed: 460,
					dmg,
					radius: 12,
					type: "food",
					visual: "bun",
					snackDuration: 3,
					life: 2.2
				});
			}
			return true;
		}
	},
	cane: {
		id: "cane",
		name: "Osikový prut",
		type: "physical",
		icon: "osikovy_prut",
		baseDmg: 18,
		baseCd: .8,
		desc: "Ohebný osikový prut s pupeny uříznutý v osikovém háji. Rychlý sečný oblouk odhání dotěrné skřítky a zloděje. S kapkou rybniční vody získáte Mokrý prut.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('osikovy_prut', level, w);
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = 88 * stats.areaRadiusMult;
			const arc = 1.35 + level * .2;
			const dmg = getWeaponDamage(player, 18) * stats.damageMult;
			player._caneSwingAlt = !player._caneSwingAlt;
			player.spawnMeleeSlash({
				x: player.x,
				y: player.y,
				angle,
				reach,
				arc,
				dmg,
				life: .30,
				maxLife: .30,
				type: "physical",
				soaked: !!player.hasSoakedCane,
				style: "cane",
				weaponId: "cane",
				swingDir: player._caneSwingAlt ? 1 : -1
			});
			if (typeof (sound as any).caneWhip === 'function') {
				(sound as any).caneWhip(player.hasSoakedCane);
			} else {
				sound.slash();
			}
			return true;
		}
	},
	pitchfork: {
		id: "pitchfork",
		name: "Kovářské vidle",
		type: "physical",
		icon: "🔱",
		baseDmg: 24,
		baseCd: 1,
		desc: "Třízubé kované vidle z vesnické kovárny. Proráží řady strašidel mocným bodnutím přímo vpřed.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = 130 + level * 16;
			const dmg = getWeaponDamage(player, 24 + (level - 1) * 5);
			player.spawnMeleeSlash({
				x: player.x,
				y: player.y,
				angle,
				reach,
				arc: .65,
				dmg,
				life: .18,
				type: "physical",
				soaked: player.hasSoakedCane,
				style: "thrust"
			});
			sound.slash();
			return true;
		}
	},
	halberd: {
		id: "halberd",
		name: "Kovaná halapartna",
		type: "physical",
		icon: "🪓",
		baseDmg: 32,
		baseCd: 1.25,
		desc: "Těžká zbraň ponocných a panských drábů. Široký rázný švih, který spolehlivě zažene i celé houfy kostlivců.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = 145 + level * 15;
			const arc = 1.7 + level * .15;
			const dmg = getWeaponDamage(player, 32 + (level - 1) * 6);
			player.spawnMeleeSlash({
				x: player.x,
				y: player.y,
				angle,
				reach,
				arc,
				dmg,
				life: .24,
				type: "physical",
				soaked: player.hasSoakedCane,
				style: "halberd"
			});
			sound.slash();
			return true;
		}
	},
	flail: {
		id: "flail",
		name: "Dřevěný cep na obilí",
		type: "physical",
		icon: "🌾",
		baseDmg: 45,
		baseCd: 1.5,
		desc: "Okovaný venkovský cep na mlácení žita. Drtivý dopad do země vyvolá rázovou vlnu a odhodí těžké nepřátele.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const dist = 90 + level * 10;
			const targetX = player.x + Math.cos(angle) * dist;
			const targetY = player.y + Math.sin(angle) * dist;
			const radius = 65 + level * 10;
			const dmg = getWeaponDamage(player, 45 + (level - 1) * 8);
			player.spawnAreaImpact({
				x: targetX,
				y: targetY,
				radius,
				dmg,
				type: "physical",
				visual: "flail_smash",
				duration: .3
			});
			sound.heavyHit();
			return true;
		}
	},
	herbs: {
		id: "herbs",
		name: "Devatery kvítí",
		type: "nature",
		icon: "🌿",
		baseDmg: 15,
		baseCd: 1.1,
		speed: 350,
		desc: "Voňavý ochranný věnec z bylin natrhaných o svatojánské noci. Šíří se v kruhu, čistí vzduch a zahání dotírající nečisté síly.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const count = 3 + Math.floor((level - 1) / 2);
			const dmg = getWeaponDamage(player, 15 + (level - 1) * 3.5);
			const baseOffset = player.animTime * 3.5 % (Math.PI * 2);
			for (let i = 0; i < count; i++) {
				const a = baseOffset + i / count * Math.PI * 2;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: a,
					speed: 350,
					dmg,
					radius: 14,
					type: "nature",
					visual: "herb_leaf",
					life: 2
				});
			}
			sound.slash();
			return true;
		}
	},
	snowball: {
		id: "snowball",
		name: "Sněhová koule",
		type: "ice",
		icon: "❄️",
		baseDmg: 18,
		baseCd: 1,
		speed: 400,
		desc: "Tuhá ledová koule uválená ze zledovatělého ladovského sněhu. Chlad zpomalí nohy každému strašidlu.",
		fire: (player, level) => {
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
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
			const w = player._firingWeapon;
			const count = 3 + Math.floor((level - 1) / 2);
			const dmg = getWeaponDamage(player, 18 + (level - 1) * 4);
			for (let i = 0; i < count; i++) {
				const spread = count > 1 ? (Math.random() - .5) * .35 : 0;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: angle + spread,
					speed: 400,
					dmg,
					radius: 15,
					type: "ice",
					visual: "snowball",
					life: 2.2
				});
			}
			sound.freeze();
			return true;
		}
	},
	kolac: {
		id: "kolac",
		name: "Kynutý koláč",
		type: "food",
		icon: "kynuty_kolac",
		baseDmg: 28,
		baseCd: 1.4,
		speed: 380,
		desc: "Tradiční slavnostní kynutý koláč s jemným tvarohem, povidlovým dekorem a věncem mandlí. Odrazí se k dalšímu bubákovi a přiměje ho na 4 s mlsat bez útočení a odhození s poznámkou „Ňam, ňam“. Vícero zásahů sčítá čas (odolnost dle Hladu).",
		fire: (player, level) => {
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
			const target = enemies[Math.floor(Math.random() * Math.min(6, enemies.length))];
			const angle = Math.atan2(target.y - player.y, target.x - player.x);
			const bounces = 2 + Math.min(4, level - 1);
			const dmg = getWeaponDamage(player, 28 + (level - 1) * 5);
			player.spawnProjectile({
				x: player.x,
				y: player.y,
				angle,
				speed: 380,
				dmg,
				radius: 16,
				type: "food",
				visual: "kolac",
				snackDuration: 3,
				bounces,
				life: 2.5
			});
			sound.slash();
			return true;
		}
	},
	potato: {
		id: "potato",
		name: "Horký brambor z popela",
		type: "fire",
		icon: "🥔",
		baseDmg: 22,
		baseCd: 1.3,
		speed: 320,
		desc: "Brambor vytažený přímo z žhavého popela. Způsobuje popáleniny a zanechává na zemi kouřící ohnisko.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx) + (Math.random() - .5) * .4;
			const dmg = getWeaponDamage(player, 22 + (level - 1) * 5);
			player.spawnProjectile({
				x: player.x,
				y: player.y,
				angle,
				speed: 340,
				dmg,
				radius: 14,
				type: "fire",
				visual: "potato",
				leavesFireZone: true,
				life: 2
			});
			sound.slash();
			return true;
		}
	},
	bees: {
		id: "bees",
		name: "Včelí roj z úlu",
		type: "nature",
		icon: "🐝",
		baseDmg: 12,
		baseCd: .9,
		speed: 330,
		desc: "Bzučící venkovské včely ze starého špalkového úlu. Samy si nacházejí nejbližší strašidla a neúnavně je bodají.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const count = 4 + Math.floor((level - 1) / 2);
			const dmg = getWeaponDamage(player, 12 + (level - 1) * 2.5);
			for (let i = 0; i < count; i++) {
				const a = Math.random() * Math.PI * 2;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: a,
					speed: 310 + Math.random() * 60,
					dmg,
					radius: 9,
					type: "nature",
					visual: "bee",
					homing: true,
					life: 3
				});
			}
			sound.slash();
			return true;
		}
	},
	hromnicka: {
		id: "hromnicka",
		name: "Hromnička",
		type: "holy",
		icon: "🕯️",
		baseDmg: 10,
		baseCd: 2,
		desc: "Posvěcená hromniční svíce z kostela. Plápolající záře mírného dosahu jemně odtlačuje nepřátele a každé 2 s způsobuje posvátné zranění (obojí ovlivněno odolností proti Strachu). Nemrtví a pekelníci mají k ní silně sníženou odolnost a utrží podstatně vyšší zranění.",
		fire: (player, level) => {
			const reach = 135 + level * 15;
			const dmg = getWeaponDamage(player, 10 + (level - 1) * 2.5);
			player.spawnHromnickaPulse(reach, dmg, level);
			sound.candlePulse();
			return true;
		}
	},
	holywater: {
		id: "holywater",
		name: "Kropenka se svěcenou vodou",
		type: "holy",
		icon: "✨",
		baseDmg: 30,
		baseCd: 1.5,
		desc: "Svěcená voda z kapličky svatého Jiří. Kropí široký vějíř kapek a spolehlivě zklidní noční bubáky. Nemrtví a pekelníci mají proti ní silně sníženou odolnost a utrží až dvojnásobné poškození.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const w = player._firingWeapon;
			const count = 5 + Math.floor((level - 1) / 2);
			const dmg = getWeaponDamage(player, 22 + (level - 1) * 4);
			for (let i = 0; i < count; i++) {
				const offsetAngle = angle + (i - (count - 1) / 2) * .16;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: offsetAngle,
					speed: 420 + Math.random() * 40,
					dmg,
					radius: 11,
					type: "holy",
					visual: "holy_droplet",
					life: 1.4
				});
			}
			sound.bell();
			return true;
		}
	}
};

export { WEAPONS };
