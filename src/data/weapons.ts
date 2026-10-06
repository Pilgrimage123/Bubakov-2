import React from 'react';
import { sound } from '../audio';
/* Weapon mastery state and specialization options.
 *
 * Mastery is intentionally a unique combat effect, not another generic
 * damage/cooldown/projectile stat. Generic multipliers belong to weapon
 * levels and global passives; mastery creates memorable combat moments.
 */
export type WeaponMasteryState = {
  picked: string[];
  hitCounter: number;
  cooldownUntil: number;
  procCount: number;
  projectileRemainder: number;
};

export const createWeaponMasteryState = (): WeaponMasteryState => ({
  picked: [],
  hitCounter: 0,
  cooldownUntil: 0,
  procCount: 0,
  projectileRemainder: 0,
});

export type MasteryOption = {
  id: string;
  name: string;
  desc: string;
  kind: 'effect';
  value: number;
};

/** Two deliberately spectacular, weapon-specific effects per weapon. */
export const MASTERY_OPTIONS: Record<string, MasteryOption[]> = {
  valecnice: [
    { id: 'blood_whirl', name: 'Krvavý vír', desc: 'Každý 8. zásah vyšle krvavou rázovou vlnu kolem Válečnice.', kind: 'effect', value: 8 },
    { id: 'blood_moon', name: 'Krvavý měsíc', desc: 'Po 24 zásazích Válečnice na chvíli zrychlí svůj orbit a seká všechny nepřátele v širokém kruhu.', kind: 'effect', value: 24 },
  ],
  'cesnekova-topinka': [
    { id: 'garlic_burst', name: 'Česneková nálož', desc: 'Každý 10. zásah aury vyvolá obří smradlavý výbuch.', kind: 'effect', value: 10 },
    { id: 'garlic_storm', name: 'Smradlavá bouře', desc: 'Každý 24. zásah aury spustí krátkou sérii tří ničivých pulzů.', kind: 'effect', value: 24 },
  ],
  'kysela-okurka': [
    { id: 'pickle_collapse', name: 'Okurkový kolaps', desc: 'Třetí stupeň Přejedení má šanci explodovat a nakazit okolní bubáky.', kind: 'effect', value: 0.22 },
    { id: 'pickle_frenzy', name: 'Kyselý běs', desc: 'Každý 7. zásah vystřelí dvě žíravé okurky do stran.', kind: 'effect', value: 7 },
  ],
  buns: [
    { id: 'bakery_burst', name: 'Pekárna smrti', desc: 'Každý 6. zásah vyrobí tři menší buchty, které se rozkutálí do okolí.', kind: 'effect', value: 6 },
    { id: 'jam_storm', name: 'Povidlová smršť', desc: 'Každý 18. zásah vyšle kolem cíle kruh povidlových buchet.', kind: 'effect', value: 18 },
  ],
  cane: [
    { id: 'whiplash', name: 'Osikový blesk', desc: 'Každý 6. zásah vyšle dlouhý elektrizující švih skrz řadu nepřátel.', kind: 'effect', value: 6 },
    { id: 'thorn_revenge', name: 'Pomsta osiky', desc: 'Každý 15. zásah vyvolá kolem hráče kruh trnů.', kind: 'effect', value: 15 },
  ],
  pitchfork: [
    { id: 'fork_wave', name: 'Třízubý hrom', desc: 'Každý 5. zásah vyšle tři průrazné rázové hroty.', kind: 'effect', value: 5 },
    { id: 'fork_execution', name: 'Vidlácká exekuce', desc: 'Nepřátelé pod 15 % HP mají šanci padnout jediným úderem vidlí.', kind: 'effect', value: 0.22 },
  ],
  halberd: [
    { id: 'halberd_execution', name: 'Exekuce', desc: 'Nepřátelé pod 12 % HP mohou být okamžitě popraveni.', kind: 'effect', value: 0.25 },
    { id: 'halberd_cleave', name: 'Panský sek', desc: 'Každý 7. zásah vyšle druhý široký sek za zasaženého nepřítele.', kind: 'effect', value: 7 },
  ],
  flail: [
    { id: 'flail_quake', name: 'Zemětřesení', desc: 'Každý 6. zásah vyvolá druhou rázovou vlnu.', kind: 'effect', value: 6 },
    { id: 'flail_berserk', name: 'Cepový běs', desc: 'Každý 18. zásah spustí na 3 sekundy ničivý berserk.', kind: 'effect', value: 18 },
  ],
  herbs: [
    { id: 'death_bloom', name: 'Rozkvetlá smrt', desc: 'Každý 8. zásah zasadí pod cílem smrtící květ, který exploduje.', kind: 'effect', value: 8 },
    { id: 'herb_storm', name: 'Svatojánská bouře', desc: 'Každý 20. zásah vyšle druhý kruh listů.', kind: 'effect', value: 20 },
  ],
  snowball: [
    { id: 'avalanche', name: 'Lavina', desc: 'Každý 7. zásah vytvoří pět odrazových sněhových koulí.', kind: 'effect', value: 7 },
    { id: 'blizzard', name: 'Sněhová vánice', desc: 'Každý 20. zásah spustí kolem cíle ledovou vánici.', kind: 'effect', value: 20 },
  ],
  kolac: [
    { id: 'feast_chain', name: 'Hostina', desc: 'Každý 5. zásah vytvoří další řetěz tří povidlových koláčů.', kind: 'effect', value: 5 },
    { id: 'royal_feast', name: 'Královská hostina', desc: 'Každý 16. zásah zasype okolí těžkými koláči.', kind: 'effect', value: 16 },
  ],
  potato: [
    { id: 'firestorm', name: 'Bramborová bouře', desc: 'Každý 6. zásah vyvolá kolem cíle osm žhavých uhlíků.', kind: 'effect', value: 6 },
    { id: 'inferno', name: 'Pekelný popel', desc: 'Každý 18. zásah vytvoří velkou ohnivou explozi.', kind: 'effect', value: 18 },
  ],
  bees: [
    { id: 'queen_bee', name: 'Královna', desc: 'Každý 12. zásah přivolá obří včelu, která prorazí až 12 nepřátel.', kind: 'effect', value: 12 },
    { id: 'hive_frenzy', name: 'Šílený úl', desc: 'Každý 24. zásah vyšle rozzlobený roj osmi včel.', kind: 'effect', value: 24 },
  ],
  hromnicka: [
    { id: 'thunder_candle', name: 'Hromový plamen', desc: 'Každý 4. pulz vyšle zasaženým nepřátelům bleskový řetěz.', kind: 'effect', value: 4 },
    { id: 'holy_dawn', name: 'Poslední svítání', desc: 'Každý 12. pulz vyvolá obrovský svatý výbuch.', kind: 'effect', value: 12 },
  ],
  holywater: [
    { id: 'baptism', name: 'Křest ohněm', desc: 'Každý 8. zásah vytvoří kolem cíle posvěcený vodní výbuch.', kind: 'effect', value: 8 },
    { id: 'flood_of_saints', name: 'Příval svatých', desc: 'Každý 20. zásah vyšle proud svěcené vody do všech stran.', kind: 'effect', value: 20 },
  ],
};

export function getMasteryOptions(weaponId: string) {
  return MASTERY_OPTIONS[weaponId] || [];
}

/**
 * Mastery no longer modifies generic stats. This function intentionally only
 * records the selected effect; combat execution happens in App.tsx.
 */
export function applyMasteryOption(w: any, o: MasteryOption) {
  if (!w.mastery) w.mastery = createWeaponMasteryState();
  if (!w.mastery.picked.includes(o.id)) w.mastery.picked.push(o.id);
}

export function getProjectileCount(baseCount: number, _w?: any) {
  return Math.max(1, Math.floor(baseCount));
}

/** Weapon-local base damage. Tulák/Poutník's +30 is multiplied by all damage layers. */
export function getWeaponDamage(player: any, baseDamage: number) {
  const tulakBonus = player?.tulakDamageBonus || 0;
  return (baseDamage + tulakBonus) * (player?.damageMultiplier || 1);
}


var WEAPONS = {
	valecnice: {
		id: 'valecnice', name: 'Válečnice', type: 'valecnice', icon: 'valecnice', baseDmg: 34, baseCd: 0.55,
		desc: 'Rázná paní s válečkem obíhající kolem hráče.',
		fire: (player, level) => {
			const w = player._firingWeapon;
			const count = level >= 2 ? 2 : 1;
			const orbitRadius = (55 + (level >= 5 ? 16 : 0));
			const angleBase = player.valecniceAngle || 0;
			const dmg = getWeaponDamage(player, 34 * (1 + Math.max(0, level - 1) * 0.12));
			const kbForce = 300 * (level >= 4 ? 1.15 : 1);
			const enemies = player.getNearbyEnemies(orbitRadius + 70);
			for (let i = 0; i < count; i++) {
				const a = angleBase + i * Math.PI * 2 / count;
				const ox = player.x + Math.cos(a) * orbitRadius;
				const oy = player.y + Math.sin(a) * orbitRadius;
				for (const e of enemies) {
					if (e.isDefeated) continue;
					const dx = e.x - ox, dy = e.y - oy, reach = 24 + e.radius;
					if (dx * dx + dy * dy <= reach * reach) {
						const dist = Math.hypot(dx, dy) || 1;
						e.takeDamage(dmg, 'physical', dx / dist * kbForce, dy / dist * kbForce);
						if (typeof player.triggerWeaponMastery === 'function') player.triggerWeaponMastery('valecnice', e, 'hit');
					}
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
			const radius = 110 * (level >= 2 ? 1.2 : 1) * (level >= 5 ? 1.15 : 1);
			const dmg = getWeaponDamage(player, 1 * (level >= 4 ? 1.25 : 1));
			const kbForce = 320 * (level >= 3 ? 1.25 : 1) * (level >= 5 ? 1.25 : 1);
			const enemies = player.getNearbyEnemies(radius + 60);
			for (const e of enemies) {
				if (e.isDefeated) continue;
				const dx = e.x - player.x, dy = e.y - player.y, reach = radius + e.radius;
				if (dx * dx + dy * dy <= reach * reach) {
					const dist = Math.hypot(dx, dy) || 1;
					e.takeDamage(dmg, 'physical', dx / dist * kbForce, dy / dist * kbForce);
					if (typeof player.triggerWeaponMastery === 'function') player.triggerWeaponMastery('cesnekova-topinka', e, 'hit');
					if (level >= 6) e.garlicSlowTimer = Math.max(e.garlicSlowTimer || 0, 1.0);
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
			const count = 1 + (level >= 2 ? 1 : 0) + (level >= 6 ? 1 : 0);
			const enemies = typeof player.getNearbyEnemies === 'function' ? player.getNearbyEnemies(900) : player.getLivingEnemies();
			if (!enemies.length) return false;
			let target = enemies[0], minDist = player.distTo(target);
			for (let i=1;i<enemies.length;i++){const d=player.distTo(enemies[i]);if(d<minDist){minDist=d;target=enemies[i];}}
			const angle = Math.atan2(target.y-player.y,target.x-player.x);
			const dmg = getWeaponDamage(player, 20 * (level >= 3 ? 1.25 : 1));
			for(let i=0;i<count;i++) player.spawnProjectile({x:player.x,y:player.y,angle:angle+(count>1?(i-(count-1)/2)*.10:0),speed:420,dmg,radius:13,type:'pickle',visual:'pickle',life:2.2,pickleDamageTakenMultiplier: level >= 5 ? 1.50 : 1.35});
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
			const angle = Math.atan2(player.lastDy, player.lastDx);
			const reach = 88 + level * 14;
			const arc = 1.35 + level * .2;
			const dmg = getWeaponDamage(player, 18 + (level - 1) * 3.5);
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
			const dmg = 10 + (level - 1) * 2.5;
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
