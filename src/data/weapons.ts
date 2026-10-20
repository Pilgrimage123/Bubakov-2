import { sound } from '../audio';
import type { WeaponId } from '../types';
import { getRankedWeaponStats, type WeaponStats } from './weaponMilestones';

function getDistSqTo(player: any, target: any): number {
  if (typeof player.distSqTo === 'function') return player.distSqTo(target);
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  return dx * dx + dy * dy;
}

export function getWeaponStats(id: string, level: number, w?: any): WeaponStats {
  if (w && w._cachedStats) return w._cachedStats;
  const s = getRankedWeaponStats(id, level, w);
  if (w) w._cachedStats = s;
  return s;
}

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
  const kurazRatio = player && player.maxHp > 0 ? Math.max(0, Math.min(1, player.hp / player.maxHp)) : 1;
  const tavernLvl = (player?.tavernShieldLevel as number) || 0;
  const missingHpRatio = 1 - kurazRatio;
  const zoufalaMult = tavernLvl > 0 ? 1 + missingHpRatio * (tavernLvl * 0.25) : 1;
  return baseDamage * tulakMult * (player?.damageMultiplier || 1) * zoufalaMult;
}

var WEAPONS = {
	valecnice: {
		id: 'valecnice', name: 'Válečnice', type: 'valecnice', icon: 'valecnice', baseDmg: 32, baseCd: 0.75,
		desc: 'Rázná venkovská paní s bukovým válečkem (+40 % velikost). Obíhá lovce ve velkém kruhu (115 px), má dosah 58 px, udílí 1,2s omráčení, důrazné odhození (520) a ignoruje 20 % odolností. V zóně o 15 % větší než orbit navíc zpomaluje nepřátele o 25 % (odolnost dle Vůle).',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('valecnice', level, w);
			const count = Math.max(1, Math.round((1 + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const orbitRadius = 115 * stats.areaRadiusMult;
			player._valecniceSlowRadius = orbitRadius * 1.15;
			player._valecniceSlowRate = level >= 3 ? 0.40 : 0.25;
			const angleBase = player.valecniceAngle || 0;
			const dmg = getWeaponDamage(player, 32) * stats.damageMult;
			const kbForce = 520 * stats.knockbackMult;
			const stunDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 1.2;
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
					const distSq = dx * dx + dy * dy;
					if (distSq <= reach * reach) {
						const invDist = distSq > 0 ? 1 / Math.sqrt(distSq) : 1;
						e.takeDamage(dmg, 'physical', dx * invDist * kbForce, dy * invDist * kbForce, {
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
	cesnekova_topinka: {
		id: 'cesnekova_topinka', name: 'Česneková topinka', type: 'garlic', icon: 'cesnekova_topinka', baseDmg: 5, baseCd: 0.35,
		desc: 'Smradlavá a štiplavá aura z česnekové topinky. Zraňuje dotírající nepřátele v okruhu 110 px, odhazuje je a zpomaluje o 15 %.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('cesnekova_topinka', level, w);
			const radius = 110 * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 5) * stats.damageMult;
			const kbForce = 300 * stats.knockbackMult;
			const enemies = player.getNearbyEnemies(radius + 60);
			for (const e of enemies) {
				if (e.isDefeated) continue;
				const dx = e.x - player.x, dy = e.y - player.y, reach = radius + e.radius;
				const distSq = dx * dx + dy * dy;
				if (distSq <= reach * reach) {
					const invDist = distSq > 0 ? 1 / Math.sqrt(distSq) : 1;
					e.takeDamage(dmg, 'physical', dx * invDist * kbForce, dy * invDist * kbForce);
					if (typeof player.triggerWeaponMastery === 'function') player.triggerWeaponMastery('cesnekova_topinka', e, 'hit');
					e.garlicSlowTimer = Math.max(e.garlicSlowTimer || 0, stats.statusDurationSec > 0 ? stats.statusDurationSec : 1.0);
				}
			}
			return true;
		}
	},
	kysela_okurka: {
		id: 'kysela_okurka', name: 'Kyselá okurka', type: 'pickle', icon: 'kysela_okurka', baseDmg: 20, baseCd: 1.15, speed: 420,
		desc: 'Střílí kyselé okurky. Kdo se jich přejí, zezelená, zeslábne a začne dostávat větší rány.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('kysela_okurka', level, w);
			const count = Math.max(1, Math.round((1 + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(900) : player.getLivingEnemies();
			if (!enemies.length) return false;
			let target = enemies[0];
			let minDistSq = getDistSqTo(player, target);
			for (let i = 1; i < enemies.length; i++) {
				const dSq = getDistSqTo(player, enemies[i]);
				if (dSq < minDistSq) {
					minDistSq = dSq;
					target = enemies[i];
				}
			}
			const angle = Math.atan2(target.y - player.y, target.x - player.x);
			const dmg = getWeaponDamage(player, 20) * stats.damageMult;
			const radius = Math.round(13 * stats.areaRadiusMult);
			for (let i = 0; i < count; i++) {
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: angle + (count > 1 ? (i - (count - 1) / 2) * .10 : 0),
					speed: 420,
					dmg,
					radius,
					type: 'pickle',
					visual: 'pickle',
					life: 2.2,
					pickleDamageTakenMultiplier: level >= 5 ? 1.50 : 1.35,
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult
				});
			}
			return true;
		}
	},
	povidlove_buchty: {
		id: "povidlove_buchty",
		name: "Povidlové buchty",
		type: "food",
		icon: "czech_buchta",
		baseDmg: 22,
		baseCd: 1.25,
		speed: 460,
		desc: "Zlatavé kynuté buchty plněné povidly. Po zásahu vytvoří fialový oblak vůně o poloměru 140 px na 3,5 s; oblak způsobuje 20 % původního poškození buchty za sekundu (odolnost dle Hladu).",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('povidlove_buchty', level, w);
			const maxRange = 850 * stats.areaRadiusMult;
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(maxRange) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
			let target = enemies[0];
			const getBuchtyScore = (e: any) => {
				const dx = e.x - player.x;
				const dy = e.y - player.y;
				return Math.sqrt(dx * dx + dy * dy) + (e.hunger ?? e.foodResist ?? 0) * 400;
			};
			let bestDist = getBuchtyScore(target);
			for (let i = 1; i < enemies.length; i++) {
				const e = enemies[i];
				const d = getBuchtyScore(e);
				if (d < bestDist) {
					bestDist = d;
					target = e;
				}
			}
			const tdx = target.x - player.x;
			const tdy = target.y - player.y;
			if (tdx * tdx + tdy * tdy > maxRange * maxRange) return false;
			const angle = Math.atan2(tdy, tdx);
			const count = Math.max(1, Math.round((1 + Math.floor((level - 1) / 2) + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 22) * stats.damageMult;
			const radius = Math.round(12 * stats.areaRadiusMult);
			const snackDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 1.8;
			for (let i = 0; i < count; i++) {
				const spread = count > 1 ? (Math.random() - .5) * .45 : 0;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: angle + spread,
					speed: 460,
					dmg,
					radius,
					type: "food",
					visual: "bun",
					snackDuration,
					plumScent: true,
					plumScentRadius: 140 * (stats.specialMechanicFlag === 'plum_scent_plus' ? 1.4 : 1),
					plumScentDuration: 3.5 * (stats.specialMechanicFlag === 'plum_scent_plus' ? 1.4 : 1),
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					life: 2.2
				});
			}
			return true;
		}
	},
	osikovy_prut: {
		id: "osikovy_prut",
		name: "Osikový prut",
		type: "physical",
		icon: "osikovy_prut",
		baseDmg: 28,
		baseCd: .65,
		desc: "Ohebný osikový prut s pupeny uříznutý v osikovém háji. Rychlý široký sečný oblouk razantně odhání dotěrné skřítky a zloděje. S kapkou rybniční vody získáte Mokrý prut.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('osikovy_prut', level, w);
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = 115 * stats.areaRadiusMult;
			const arc = 2.0 + (level - 1) * .15;
			const dmg = getWeaponDamage(player, 28) * stats.damageMult;
			player._caneSwingAlt = !player._caneSwingAlt;
			player.spawnMeleeSlash({
				x: player.x,
				y: player.y,
				angle,
				reach,
				arc,
				dmg,
				knockbackMult: stats.knockbackMult,
				life: .28,
				maxLife: .28,
				type: "physical",
				soaked: !!player.hasSoakedCane,
				style: "cane",
				weaponId: "osikovy_prut",
				swingDir: player._caneSwingAlt ? 1 : -1,
				ignoreResist: stats.ignoreResist,
			});
			if (typeof (sound as any).caneWhip === 'function') {
				(sound as any).caneWhip(player.hasSoakedCane);
			} else {
				sound.slash();
			}
			return true;
		}
	},
	kovarske_vidle: {
		id: "kovarske_vidle",
		name: "Kovářské vidle",
		type: "physical",
		icon: "🔱",
		baseDmg: 24,
		baseCd: 1,
		desc: "Třízubé kované vidle z vesnické kovárny. Proráží řady strašidel mocným bodnutím přímo vpřed.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('kovarske_vidle', level, w);
			const count = Math.max(1, Math.round((1 + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = (130 + level * 16) * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 24) * stats.damageMult;
			for (let i = 0; i < count; i++) {
				const spreadAngle = count > 1 ? angle + (i - (count - 1) / 2) * 0.18 : angle;
				player.spawnMeleeSlash({
					x: player.x,
					y: player.y,
					angle: spreadAngle,
					reach,
					arc: .65,
					dmg,
					knockbackMult: stats.knockbackMult,
					life: .18,
					type: "physical",
					soaked: player.hasSoakedCane,
					style: "thrust",
					weaponId: "kovarske_vidle",
					ignoreResist: stats.ignoreResist,
				});
			}
			sound.slash();
			return true;
		}
	},
	kovana_halapartna: {
		id: "kovana_halapartna",
		name: "Kovaná halapartna",
		type: "physical",
		icon: "kovana_halapartna",
		baseDmg: 32,
		baseCd: 1.25,
		desc: "Těžká zbraň ponocných a panských drábů. Široký rázný švih, který spolehlivě zažene i celé houfy kostlivců.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('kovana_halapartna', level, w);
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = (145 + level * 15) * stats.areaRadiusMult;
			const arc = 1.7 + level * .15;
			const dmg = getWeaponDamage(player, 32) * stats.damageMult;
			player.spawnMeleeSlash({
				x: player.x,
				y: player.y,
				angle,
				reach,
				arc,
				dmg,
				knockbackMult: stats.knockbackMult,
				life: .24,
				type: "physical",
				soaked: player.hasSoakedCane,
				style: "halberd",
				weaponId: "kovana_halapartna",
				ignoreResist: stats.ignoreResist,
			});
			sound.slash();
			return true;
		}
	},
	dreveny_cep: {
		id: "dreveny_cep",
		name: "Dřevěný cep na obilí",
		type: "physical",
		icon: "🌾",
		baseDmg: 45,
		baseCd: 1.5,
		desc: "Okovaný venkovský cep na mlácení žita. Drtivý dopad do země vyvolá rázovou vlnu a odhodí těžké nepřátele.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('dreveny_cep', level, w);
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const dist = (90 + level * 10) * stats.areaRadiusMult;
			const targetX = player.x + Math.cos(angle) * dist;
			const targetY = player.y + Math.sin(angle) * dist;
			const radius = (65 + level * 10) * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 45) * stats.damageMult;
			player.spawnAreaImpact({
				x: targetX,
				y: targetY,
				radius,
				dmg,
				knockbackMult: stats.knockbackMult,
				stunDuration: stats.statusDurationSec,
				type: "physical",
				visual: "flail_smash",
				duration: .3,
				weaponId: "dreveny_cep"
			});
			sound.heavyHit();
			return true;
		}
	},
	devatero_kviti: {
		id: "devatero_kviti",
		name: "Devatero kvítí",
		type: "nature",
		icon: "🌿",
		baseDmg: 15,
		baseCd: 1.1,
		speed: 350,
		desc: "Devatero kvítí vystřeluje pět bylin v počátečním věnci, který zahání dotírající nečisté síly.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('devatero_kviti', level, w);
			const count = Math.max(5, Math.round((5 + Math.floor((level - 1) / 2) + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 15) * stats.damageMult;
			const radius = Math.round(14 * stats.areaRadiusMult);
			const baseOffset = player.animTime * 3.5 % (Math.PI * 2);
			for (let i = 0; i < count; i++) {
				const a = baseOffset + i / count * Math.PI * 2;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: a,
					speed: 350,
					dmg,
					radius,
					type: "nature",
					visual: "herb_leaf",
					herbVariant: i % 6,
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					life: 2
				});
			}
			sound.slash();
			return true;
		}
	},
	snehova_koule: {
		id: "snehova_koule",
		name: "Sněhová koule",
		type: "ice",
		icon: "❄️",
		baseDmg: 18,
		baseCd: 1,
		speed: 400,
		desc: "Tuhá ledová koule uválená ze zledovatělého ladovského sněhu. Chlad zpomalí nohy každému strašidlu.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('snehova_koule', level, w);
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850 * stats.areaRadiusMult) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
			let target = enemies[0];
			let minDistSq = getDistSqTo(player, target);
			for (let i = 1; i < enemies.length; i++) {
				const dSq = getDistSqTo(player, enemies[i]);
				if (dSq < minDistSq) {
					minDistSq = dSq;
					target = enemies[i];
				}
			}
			const angle = Math.atan2(target.y - player.y, target.x - player.x);
			const count = Math.max(1, Math.round((3 + Math.floor((level - 1) / 2) + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 18) * stats.damageMult;
			const radius = Math.round(15 * stats.areaRadiusMult);
			const chillDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 3.5;
			for (let i = 0; i < count; i++) {
				const spread = count > 1 ? (Math.random() - .5) * .35 : 0;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: angle + spread,
					speed: 400,
					dmg,
					radius,
					type: "ice",
					visual: "snowball",
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					chillDuration,
					life: 2.2
				});
			}
			sound.freeze();
			return true;
		}
	},
	kynuty_kolac: {
		id: "kynuty_kolac",
		name: "Kynutý koláč",
		type: "food",
		icon: "kynuty_kolac",
		baseDmg: 28,
		baseCd: 1.4,
		speed: 380,
		desc: "Tradiční slavnostní kynutý koláč s jemným tvarohem, povidlovým dekorem a věncem mandlí. Odrazí se k dalšímu bubákovi a přiměje ho na 4 s mlsat bez útočení a odhození s poznámkou „Ňam, ňam“. Vícero zásahů sčítá čas (odolnost dle Hladu).",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('kynuty_kolac', level, w);
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850 * stats.areaRadiusMult) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
			const count = Math.max(1, Math.round((1 + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 28) * stats.damageMult;
			const bounces = 2 + Math.min(4, level - 1);
			const snackDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 3;
			const radius = Math.round(16 * stats.areaRadiusMult);
			for (let i = 0; i < count; i++) {
				const target = enemies[Math.floor(Math.random() * Math.min(6, enemies.length))];
				const angle = Math.atan2(target.y - player.y, target.x - player.x) + (count > 1 ? (i - (count - 1) / 2) * 0.2 : 0);
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle,
					speed: 380,
					dmg,
					radius,
					type: "food",
					visual: "kolac",
					snackDuration,
					bounces,
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					life: 2.5
				});
			}
			sound.slash();
			return true;
		}
	},
	horky_brambor: {
		id: "horky_brambor",
		name: "Horký brambor z popela",
		type: "fire",
		icon: "🥔",
		baseDmg: 22,
		baseCd: 1.3,
		speed: 320,
		desc: "Brambor vytažený přímo z žhavého popela. Způsobuje popáleniny a zanechává na zemi kouřící ohnisko.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('horky_brambor', level, w);
			const count = Math.max(1, Math.round((1 + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 22) * stats.damageMult;
			const radius = Math.round(14 * stats.areaRadiusMult);
			const fireZoneRadius = Math.round(45 * stats.areaRadiusMult);
			const fireZoneDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 2.0;
			for (let i = 0; i < count; i++) {
				const spread = count > 1 ? (i - (count - 1) / 2) * 0.25 : (Math.random() - .5) * .4;
				const angle = Math.atan2(player.lastDy, player.lastDx) + spread;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle,
					speed: 340,
					dmg,
					radius,
					type: "fire",
					visual: "potato",
					leavesFireZone: true,
					fireZoneRadius,
					fireZoneDuration,
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					life: 2
				});
			}
			sound.slash();
			return true;
		}
	},
	vceli_roj: {
		id: "vceli_roj",
		name: "Včelí roj z úlu",
		type: "nature",
		icon: "🐝",
		baseDmg: 12,
		baseCd: .9,
		speed: 330,
		desc: "Bzučící venkovské včely ze starého špalkového úlu. Samy si nacházejí nejbližší strašidla a neúnavně je bodají.",
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('vceli_roj', level, w);
			const count = Math.max(1, Math.round((4 + Math.floor((level - 1) / 2) + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 12) * stats.damageMult;
			const radius = Math.round(9 * stats.areaRadiusMult);
			for (let i = 0; i < count; i++) {
				const a = Math.random() * Math.PI * 2;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: a,
					speed: 310 + Math.random() * 60,
					dmg,
					radius,
					type: "nature",
					visual: "bee",
					homing: true,
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
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
			const w = player._firingWeapon;
			const stats = getWeaponStats('hromnicka', level, w);
			const reach = (135 + level * 15) * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 10) * stats.damageMult;
			player.spawnHromnickaPulse(reach, dmg, level, stats.knockbackMult, stats.statusDurationSec);
			sound.candlePulse();
			return true;
		}
	},
	svecena_kropenka: {
		id: "svecena_kropenka",
		name: "Kropenka se svěcenou vodou",
		type: "holy",
		icon: "✨",
		baseDmg: 30,
		baseCd: 1.5,
		desc: "Svěcená voda z kapličky svatého Jiří. Kropí široký vějíř kapek a spolehlivě zklidní noční bubáky. Nemrtví a pekelníci mají proti ní silně sníženou odolnost a utrží až dvojnásobné poškození.",
		fire: (player, level) => {
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const w = player._firingWeapon;
			const stats = getWeaponStats('svecena_kropenka', level, w);
			const count = Math.max(1, Math.round((5 + Math.floor((level - 1) / 2) + stats.projectileCount) * (stats.projectileCountMult || 1)));
			const dmg = getWeaponDamage(player, 22) * stats.damageMult;
			const radius = Math.round(11 * stats.areaRadiusMult);
			for (let i = 0; i < count; i++) {
				const offsetAngle = angle + (i - (count - 1) / 2) * .16;
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle: offsetAngle,
					speed: 420 + Math.random() * 40,
					dmg,
					radius,
					type: "holy",
					visual: "holy_droplet",
					pierce: stats.pierce,
					knockbackMult: stats.knockbackMult,
					life: 1.4
				});
			}
			sound.bell();
			return true;
		}
	},
	bylinkova_fajfka: {
		id: 'bylinkova_fajfka',
		name: 'Bylinková fajfka',
		type: 'nature',
		icon: 'bylinkova_fajfka',
		baseDmg: 9,
		baseCd: 3.5,
		desc: 'Dědečkova hliněná fajfka s vonnými bylinkami. Vypouští oblak dýmu (110 px), který zraňuje nepřátele, zpomaluje jejich pohyb i útok o 35 % a léčí lovce.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('bylinkova_fajfka', level, w);
			const radius = 110 * stats.areaRadiusMult;
			const dmg = getWeaponDamage(player, 9) * stats.damageMult;
			const duration = 4 * (stats.statusDurationSec > 0 ? (1 + stats.statusDurationSec / 4) : 1);
			if (typeof player.spawnFajfkaCloud === 'function') {
				player.spawnFajfkaCloud(radius, dmg, duration, stats);
			}
			if (typeof sound.candlePulse === 'function') sound.candlePulse();
			return true;
		}
	},
	formansky_bic: {
		id: 'formansky_bic',
		name: 'Formanský bič',
		type: 'physical',
		icon: '🪢',
		baseDmg: 28,
		baseCd: 0.95,
		desc: 'Dlouhý kožený bič s jasanovým bičištěm. Švihá v úzké linii, přerušuje nápřah, ignoruje úhyb a přitahuje kořist v dráze švihu.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getWeaponStats('formansky_bic', level, w);
			const reach = (210 + level * 10) * stats.areaRadiusMult;
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(reach + 80) : (player.getLivingEnemies ? player.getLivingEnemies() : []);

			// Find enemy winding up first (isAttacking / windupTimer > 0 / aiState === 'windup'), or closest target
			let target = null;
			let minWindupDistSq = Infinity;
			for (let i = 0; i < enemies.length; i++) {
				const e = enemies[i];
				if (e.isDefeated || e.dead) continue;
				const dSq = getDistSqTo(player, e);
				if (e.isAttacking || (e.windupTimer && e.windupTimer > 0) || e.aiState === 'windup') {
					if (dSq < minWindupDistSq) {
						minWindupDistSq = dSq;
						target = e;
					}
				}
			}
			if (!target) {
				let minCloseDistSq = Infinity;
				for (let i = 0; i < enemies.length; i++) {
					const e = enemies[i];
					if (e.isDefeated || e.dead) continue;
					const dSq = getDistSqTo(player, e);
					if (dSq < minCloseDistSq) {
						minCloseDistSq = dSq;
						target = e;
					}
				}
			}

			const baseAngle = target
				? Math.atan2(target.y - player.y, target.x - player.x)
				: Math.atan2(player.lastDy || 0, player.lastDx || 1);

			const milestones = w?.milestones || [];
			const hasDoubleSwing = milestones.includes('whip_double_swing_3') || stats.projectileCount > 0;
			const hasSevenStraps = milestones.includes('whip_seven_straps_8');
			const arc = hasSevenStraps ? 1.35 : 0.38;
			const dmg = getWeaponDamage(player, 28) * stats.damageMult;
			const angles = hasDoubleSwing ? [baseAngle, baseAngle + Math.PI * 0.5] : [baseAngle];

			for (let i = 0; i < angles.length; i++) {
				const ang = angles[i];
				player.spawnMeleeSlash({
					x: player.x,
					y: player.y,
					angle: ang,
					reach,
					arc,
					dmg,
					knockbackMult: stats.knockbackMult,
					life: 0.28,
					maxLife: 0.28,
					type: 'physical',
					style: 'whip',
					weaponId: 'formansky_bic',
					ignoreResist: stats.ignoreResist,
					milestones,
					soaked: !!(player.hasSoakedCane || milestones.includes('whip_wet_strap_5')),
					pullLoot: true,
				});
			}

			if (typeof (sound as any).caneWhip === 'function') {
				(sound as any).caneWhip(player.hasSoakedCane || milestones.includes('whip_wet_strap_5'));
			} else {
				sound.slash();
			}
			return true;
		}
	},
	splaseny_houser: {
		id: 'splaseny_houser',
		name: 'Splašený houser',
		type: 'nature',
		icon: '🪿',
		baseDmg: 26,
		baseCd: 1.35,
		speed: 390,
		desc: 'Rozlícený bílý houser z hrusické návsi. S hlasitým syčením pronásleduje strašidla, štípe je do lýtek, přerušuje jim nápřah a občas z nich vytřese krejcar.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const stats = getRankedWeaponStats('splaseny_houser', level, w);
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(850 * stats.areaRadiusMult) : player.getLivingEnemies();
			if (!enemies || enemies.length === 0) return false;
			const count = Math.max(1, 1 + Math.floor((level - 1) / 3) + stats.projectileCount);
			const dmg = getWeaponDamage(player, 26) * stats.damageMult;
			const radius = Math.round(16 * stats.areaRadiusMult);
			const bounces = 2 + Math.floor(level / 2) + stats.pierce;
			const panicDuration = stats.statusDurationSec > 0 ? stats.statusDurationSec : 1.2;

			for (let i = 0; i < count; i++) {
				const target = enemies[Math.floor(Math.random() * Math.min(5, enemies.length))];
				const angle = Math.atan2(target.y - player.y, target.x - player.x) + (count > 1 ? (i - (count - 1) / 2) * 0.35 : 0);
				player.spawnProjectile({
					x: player.x,
					y: player.y,
					angle,
					speed: 390,
					dmg,
					radius,
					type: 'nature',
					visual: 'gander',
					homing: true,
					bounces,
					interruptsWindup: true,
					panicDuration,
					coinStealChance: stats.specialMechanicFlag === 'golden_feather' ? 0.25 : 0.10,
					knockbackMult: 1.35 * stats.knockbackMult,
					life: 3.2
				});
			}
			sound.slash();
			return true;
		}
	}
};

// Legacy fallbacky pro zachování zpětné kompatibility
export const WEAPON_LEGACY_ALIASES: Record<string, WeaponId> = {
	cane: 'osikovy_prut',
	'cesnekova-topinka': 'cesnekova_topinka',
	'kysela-okurka': 'kysela_okurka',
	kysele_okurky: 'kysela_okurka',
	buns: 'povidlove_buchty',
	pitchfork: 'kovarske_vidle',
	halberd: 'kovana_halapartna',
	flail: 'dreveny_cep',
	herbs: 'devatero_kviti',
	snowball: 'snehova_koule',
	kolac: 'kynuty_kolac',
	potato: 'horky_brambor',
	bees: 'vceli_roj',
	holywater: 'svecena_kropenka',
	wp_whip: 'formansky_bic',
	whip: 'formansky_bic',
	formansky_bic: 'formansky_bic',
	gander: 'splaseny_houser',
	houser: 'splaseny_houser',
	wp_splaseny_houser: 'splaseny_houser',
	splaseny_houser: 'splaseny_houser',
};

for (const [alias, canonical] of Object.entries(WEAPON_LEGACY_ALIASES)) {
	if ((WEAPONS as any)[canonical] && !(WEAPONS as any)[alias]) {
		(WEAPONS as any)[alias] = (WEAPONS as any)[canonical];
	}
}

export { WEAPONS };
