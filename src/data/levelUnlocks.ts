export type { LevelProgress } from '../types';
import { GAME_LEVELS } from './levels';

var LEVEL_ORDER = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	22,
	23
];
function getPreviousLevel(id: number) {
	const idx = LEVEL_ORDER.indexOf(id);
	if (idx <= 0) return null;
	return LEVEL_ORDER[idx - 1];
}
function isLevelFullyUnlocked(id: number, meta: any) {
	if (id === 0) return true;
	if ((meta?.highestLevelUnlocked || 0) >= id) return true;
	if (meta?.completedLevels && meta.completedLevels[id]) return true;
	if (id === 1 && ((meta?.bestiaryKills?.vrana || 0) >= 1 || !!meta?.completedLevels?.[0])) return true;
	if (id === 2 && ((meta?.bestiaryKills?.morana || 0) >= 1 || !!meta?.completedLevels?.[1])) return true;
	if (id === 3 && ((meta?.bestiaryKills?.vrchni_carodejnice || 0) >= 1 || !!meta?.completedLevels?.[2])) return true;
	if (id === 4 && ((meta?.bestiaryKills?.vrchni_carodejnice || 0) >= 1 || (meta?.bestiaryKills?.hejkal || 0) >= 1 || !!meta?.completedLevels?.[3])) return true;
	if (id === 5 && ((meta?.bestiaryKills?.ledovi_muzi || 0) >= 1 || (meta?.bestiaryKills?.pankrac || 0) >= 1 || !!meta?.completedLevels?.[4])) return true;
	if (id === 6 && ((meta?.bestiaryKills?.hejkal || 0) >= 1 || (meta?.bestiaryKills?.mlynar || 0) >= 1 || !!meta?.completedLevels?.[5])) return true;
	if (id === 7 && ((meta?.bestiaryKills?.kralovska_polednice || 0) >= 1 || !!meta?.completedLevels?.[6])) return true;
	if (id === 8 && ((meta?.bestiaryKills?.svatojansky_vladce || 0) >= 1 || !!meta?.completedLevels?.[7])) return true;
	if (id === 9 && ((meta?.bestiaryKills?.hromotluk_marketa || 0) >= 1 || !!meta?.completedLevels?.[8])) return true;
	if (id === 10 && ((meta?.bestiaryKills?.drak || 0) >= 1 || !!meta?.completedLevels?.[9])) return true;
	if (id === 11 && ((meta?.bestiaryKills?.dozinkovy_chasnik || 0) >= 1 || !!meta?.completedLevels?.[10])) return true;
	if (id === 12 && ((meta?.bestiaryKills?.vyr_velky || 0) >= 1 || !!meta?.completedLevels?.[11])) return true;
	if (id === 13 && ((meta?.bestiaryKills?.posvicensky_hospodar || 0) >= 1 || !!meta?.completedLevels?.[12])) return true;
	if (id === 14 && ((meta?.bestiaryKills?.kvilici_meluzina || 0) >= 1 || !!meta?.completedLevels?.[13])) return true;
	if (id === 15 && ((meta?.bestiaryKills?.drak_vetrnik || 0) >= 1 || !!meta?.completedLevels?.[14])) return true;
	if (id === 16 && ((meta?.bestiaryKills?.vele_stika || 0) >= 1 || !!meta?.completedLevels?.[15])) return true;
	if (id === 17 && ((meta?.bestiaryKills?.listopadovy_mrazivec || 0) >= 1 || !!meta?.completedLevels?.[16])) return true;
	if (id === 18 && ((meta?.bestiaryKills?.kanec_knour || 0) >= 1 || !!meta?.completedLevels?.[17])) return true;
	if (id === 19 && ((meta?.bestiaryKills?.mikulassky_cert || 0) >= 1 || !!meta?.completedLevels?.[18])) return true;
	if (id === 20 && ((meta?.bestiaryKills?.kral_mrazik || 0) >= 1 || !!meta?.completedLevels?.[19])) return true;
	if (id === 21 && ((meta?.bestiaryKills?.vladce_chumelenice || 0) >= 1 || !!meta?.completedLevels?.[20])) return true;
	if (id === 22 && ((meta?.bestiaryKills?.perchta_s_nozem || 0) >= 1 || !!meta?.completedLevels?.[21])) return true;
	if (id === 23 && ((meta?.bestiaryKills?.rychtar_masek || 0) >= 1 || !!meta?.completedLevels?.[22])) return true;
	return false;
}
function canLevelUnlock(id: number, meta: any) {
	if (id === 0) return true;
	const prev = getPreviousLevel(id);
	return prev === null || isLevelFullyUnlocked(prev, meta);
}
function getActiveUnlockingLevel(meta: any) {
	for (let i = 0; i < LEVEL_ORDER.length; i++) {
		const id = LEVEL_ORDER[i];
		if (!isLevelFullyUnlocked(id, meta)) {
			if (canLevelUnlock(id, meta)) return id;
			return null;
		}
	}
	return null;
}
function makeSequentialUnlock(id: number, targetEnemies: any[]) {
	const level = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
	const previous = GAME_LEVELS[(id - 1) as keyof typeof GAME_LEVELS];
	const locked = (percent: number, tierLevel: number) => ({
		minPercent: percent,
		tierLevel,
		spoiledName: percent === 100 ? level.name : `${id + 1}. ??? [ZAMČENÁ VÝPRAVA]`,
		spoiledShortTitle: percent === 100 ? level.shortTitle : "Neznámá končina",
		spoiledSubtitle: percent >= 50 ? level.subtitle : "Zatím jen útržky pověstí a vzdálené výkřiky",
		spoiledDesc: percent >= 50 ? level.description : `Cesta se odhalí po průzkumu oblasti ${previous.shortTitle}.`,
		spoiledLore: percent >= 75 ? (level.lore || "") : "Kronikář zatím sbírá jen kusé zprávy.",
		spoiledBossHint: percent >= 75 ? `👑 Hlavní boss: ${level.finalBoss.name}` : "👑 Hlavní boss: ???",
		spoiledWeatherHint: percent >= 50 ? `Počasí: ${level.subtitle}` : "Počasí: neznámé",
		spoiledEnemiesHint: percent >= 50 ? targetEnemies.map((enemy) => enemy.name).join(", ") : "Nepřátelé: skryto",
		spoiledIcon: percent >= 50 ? (level.icon || "map") : "map",
		spoiledBadge: percent === 100 ? (level.badge || `${id + 1}. Úroveň`) : `${id + 1}. úroveň (${percent} %)`,
		clueTag: percent === 100 ? "✅ Plně odemčeno!" : `${percent} %: pokračuj v předchozí výpravě`
	});
	return {
		id,
		realName: level.name,
		realShortTitle: level.shortTitle,
		realSubtitle: level.subtitle,
		realIcon: level.icon,
		realBadge: level.badge,
		defaultUnlocked: false,
		challengeTitle: `Průzkum: ${level.shortTitle}`,
		challengeShortDesc: `Poražte ${previous.finalBoss.name} nebo zažeňte potvory z předchozí výpravy.`,
		challengeLongDesc: `Dokončete výpravu „${previous.shortTitle}“. Vítězství nad jejím hlavním bossem otevře cestu do oblasti „${level.shortTitle}“.`,
		bossDefeatRequirement: `Porazit ${previous.finalBoss.name}`,
		targetEnemies,
		maxCount: 100,
		milestones: [
			locked(0, 0),
			locked(25, 1),
			locked(50, 2),
			locked(75, 3),
			locked(100, 4)
		]
	};
}

var LEVEL_UNLOCKS: Record<number, any> = {
	0: {
		id: 0,
		realName: "1. Předjaří v Hrusicích – Denní tání",
		realShortTitle: "Denní tání",
		realSubtitle: "Březnové slunce, tající kry a probouzející se havěť",
		realIcon: "🌱",
		realBadge: "1. Úroveň",
		defaultUnlocked: true,
		challengeTitle: "Výchozí začátečnická výprava",
		challengeShortDesc: "Klidný úvod do hry – seznámení s pohybem, zbraněmi a jarní havětí.",
		challengeLongDesc: "Pomozte sedlákům připravit pole po zimě a zažeňte hejno mrazivých vran!",
		bossDefeatRequirement: "Žádné – výchozí úroveň",
		targetEnemies: [],
		maxCount: 0,
		milestones: [{
			minPercent: 0,
			tierLevel: 4,
			spoiledName: "1. Předjaří v Hrusicích – Denní tání",
			spoiledShortTitle: "Denní tání",
			spoiledSubtitle: "Březnové slunce, tající kry a probouzející se havěť",
			spoiledDesc: "Sníh pomalu taje a řeka je plná březnových ker tajícího ledu. Příroda se probouzí a s ní i vyhladovělá havěť.",
			spoiledLore: "Březen, za kamna vlezem – ale za dne už hřeje jarní slunko! Pomozte sedlákům připravit pole a vykažte z kraje hejno mrazivých vran.",
			spoiledBossHint: "👑 Hlavní boss: Hejno mrazivých vran (300 s)",
			spoiledWeatherHint: "Počasí: Tání ker a jarní slunce",
			spoiledEnemiesHint: "Hejno mrazivých vran, Jarní Vodníček, Mrazivý skřítek, Blatouchový skřítek, Myšák",
			spoiledIcon: "🌱",
			spoiledBadge: "1. Úroveň",
			clueTag: "✅ Připraveno k výpravě"
		}]
	},
	1: makeSequentialUnlock(1, [
		{ id: "vrana", name: "Hejno mrazivých vran", icon: "🐦‍⬛" },
		{ id: "vodnicek", name: "Jarní Vodníček", icon: "💧" },
		{ id: "blatouch", name: "Blatouchový skřítek", icon: "🌼" }
	]),
	2: makeSequentialUnlock(2, [
		{ id: "morana", name: "Morana — špatně vynesená smrtka", icon: "❄️" },
		{ id: "mrazivy_obr", name: "Mrazivý obr", icon: "🧊" },
		{ id: "tajici_snehulak", name: "Tající sněhulák", icon: "⛄" },
		{ id: "jezinka_mraziva", name: "Mrazivá jezinka", icon: "🧙‍♀️" }
	]),
	3: makeSequentialUnlock(3, [
		{ id: "vrchni_carodejnice", name: "Vrchní Filipojakubská Čarodějnice", icon: "🧹" },
		{ id: "carodejnice_stara", name: "Stará ježibaba z Melechu", icon: "🧙‍♀️" },
		{ id: "beranek", name: "Obří kolednický beránek", icon: "🐑" },
		{ id: "carodejnice_koste", name: "Čarodějnice na koštěti", icon: "🧹" },
		{ id: "zkazena_kraslice", name: "Zkažená kraslice", icon: "🥚" },
		{ id: "rehtackar", name: "Koledník s řehtačkou", icon: "🪓" }
	]),
	4: makeSequentialUnlock(4, [
		{ id: "vrchni_carodejnice", name: "Filipojakubský sabat čarodějnic", icon: "🧹" },
		{ id: "drab", name: "Pekelný dráb", icon: "⛓️" },
		{ id: "klekanice", name: "Večerní Klekánice", icon: "🔔" },
		{ id: "cerny_pes", name: "Černý pes", icon: "🐕" },
		{ id: "skeleton", name: "Kostlivec", icon: "💀" }
	]),
	5: makeSequentialUnlock(5, [
		{ id: "ledovi_muzi", name: "Ledoví muži", icon: "🧊" },
		{ id: "carodejnice_zaspalka", name: "Čarodějnice Zaspalka", icon: "🧹" },
		{ id: "hastrman", name: "Bahenní hastrman", icon: "💧" },
		{ id: "chroust", name: "Chroust obecný", icon: "🪲" }
	]),
	6: makeSequentialUnlock(6, [
		{ id: "hejkal", name: "Půlnoční Hejkal", icon: "🌲" },
		{ id: "mlynar", name: "Prokletý Mlynář", icon: "🌊" },
		{ id: "zbojnik", name: "Zbojník", icon: "🗡️" },
		{ id: "jiskrivec", name: "Jiskřivec", icon: "✨" }
	]),
	7: makeSequentialUnlock(7, [
		{ id: "kralovska_polednice", name: "Královská Polednice", icon: "👑" },
		{ id: "cert_sekac", name: "Pekelný čert sekáč", icon: "😈" },
		{ id: "polednice", name: "Polednice z lánů", icon: "🌾" },
		{ id: "rak_ricni", name: "Říční rak z tůně", icon: "🦞" }
	]),
	8: makeSequentialUnlock(8, [
		{ id: "svatojansky_vladce", name: "Svatojánský Vládce Hvozdu", icon: "🌿" },
		{ id: "ohnivy_sudlicka", name: "Ohnivý sudlička", icon: "🔥" },
		{ id: "rusalka", name: "Rusalka z tůně", icon: "🌊" },
		{ id: "bludicka", name: "Bludička", icon: "✨" }
	]),
	9: makeSequentialUnlock(9, [
		{ id: "hromotluk_marketa", name: "Pouťový Hromotluk", icon: "🎯" },
		{ id: "zitna_matka", name: "Žitná matka", icon: "🌾" },
		{ id: "krecek_obilnik", name: "Král polních křečků Obilník", icon: "🐹" },
		{ id: "zitna_baba", name: "Žitná bába (Srpanda)", icon: "☀️" },
		{ id: "polni_krecek", name: "Polní křeček", icon: "🐹" }
	]),
	10: makeSequentialUnlock(10, [
		{ id: "drak", name: "Tříhlavý líný Drak", icon: "🐉" },
		{ id: "bezhlavy_rytir", name: "Bezhlavý rytíř", icon: "🗡️" },
		{ id: "bila_pani", name: "Bílá paní", icon: "👻" },
		{ id: "kulovy_blesk", name: "Kulový blesk", icon: "⚡" }
	]),
	11: makeSequentialUnlock(11, [
		{ id: "dozinkovy_chasnik", name: "Dožínkový chasník s věncem", icon: "🌾" },
		{ id: "zlatohlavek_zrout", name: "Zlatohlávek Žrout ze sadu", icon: "🪲" },
		{ id: "kralovsky_cmelak", name: "Královský čmelák", icon: "🐝" },
		{ id: "srpnove_cmelak", name: "Srpnový čmelák", icon: "🐝" },
		{ id: "zlatohlavek", name: "Zlatohlávek skvostný", icon: "🪲" }
	]),
	12: makeSequentialUnlock(12, [
		{ id: "vyr_velky", name: "Výr velký ze Zlenic", icon: "🦉" },
		{ id: "netopyr_usatec", name: "Netopýr Ušatec", icon: "🦇" },
		{ id: "nocni_mura", name: "Noční můra", icon: "🦋" },
		{ id: "cerny_vlkodlak", name: "Černý vlkodlak", icon: "🐺" }
	]),
	13: makeSequentialUnlock(13, [
		{ id: "posvicensky_hospodar", name: "Posvícenský Hospodář", icon: "🥧" },
		{ id: "povidlovy_cert", name: "Povidlový čert s měchačkou", icon: "🍯" },
		{ id: "kralovsky_srsen", name: "Královský sršeň ze sadu", icon: "🐝" },
		{ id: "svestkovy_srsen", name: "Švestkový sršeň", icon: "🐝" }
	]),
	14: makeSequentialUnlock(14, [
		{ id: "kvilici_meluzina", name: "Kvílící Meluzína", icon: "🌬️" },
		{ id: "bila_pani", name: "Bílá paní", icon: "👻" },
		{ id: "mlynar", name: "Prokletý mlynář", icon: "🌊" },
		{ id: "topivec", name: "Rybniční topivec", icon: "💧" }
	]),
	15: makeSequentialUnlock(15, [
		{ id: "drak_vetrnik", name: "Hrusický drak Větrník", icon: "🪁" },
		{ id: "hastrman_podzimni", name: "Podzimní hastrman z rákosí", icon: "🐸" },
		{ id: "kralovsky_havran", name: "Královský havran ze strniště", icon: "🦅" },
		{ id: "podzimni_strasak", name: "Podzimní polní strašák", icon: "🌾" }
	]),
	16: makeSequentialUnlock(16, [
		{ id: "vele_stika", name: "Hrusická Veleštika", icon: "🐟" },
		{ id: "cert_rybnikar", name: "Pekelný čert rybníkář", icon: "🐟" },
		{ id: "dusickova_bludicka", name: "Dušičková bludička", icon: "🕯️" }
	]),
	17: makeSequentialUnlock(17, [
		{ id: "listopadovy_mrazivec", name: "Listopadový Mrazivec", icon: "❄️" },
		{ id: "martinsky_jezdec", name: "Martinský jezdec na bílém koni", icon: "⚔️" },
		{ id: "kralovska_husa", name: "Královská svatomartinská husa", icon: "🪿" },
		{ id: "svatomartinska_husa", name: "Svatomartinská husa", icon: "🪿" }
	]),
	18: makeSequentialUnlock(18, [
		{ id: "kanec_knour", name: "Obří divočák Kňour", icon: "🐗" },
		{ id: "cerny_myslivec", name: "Černý myslivec z hvozdu", icon: "🏹" },
		{ id: "mlzny_prizrak", name: "Mlžný přízrak z rašeliniště", icon: "🌫️" },
		{ id: "divoky_kanec", name: "Divoký kanec", icon: "🐗" }
	]),
	19: makeSequentialUnlock(19, [
		{ id: "mikulassky_cert", name: "Mikulášský čert Richter", icon: "🔥" },
		{ id: "maskarni_kozel", name: "Kolednický maškarní kozel", icon: "🐐" },
		{ id: "cert_s_pytlem", name: "Pekelný čert s pytlem", icon: "👹" }
	]),
	20: makeSequentialUnlock(20, [
		{ id: "kral_mrazik", name: "Král Mrazík", icon: "👑" },
		{ id: "mraziva_sova", name: "Noční mrazivá sova", icon: "🦉" },
		{ id: "jezdec_meluziny", name: "Zimní jezdec Meluzíny", icon: "🌪️" }
	]),
	21: makeSequentialUnlock(21, [
		{ id: "vladce_chumelenice", name: "Vládce chumelenice", icon: "❄️" },
		{ id: "trikralovy_jezdec", name: "Tříkrálový jezdec", icon: "👑" },
		{ id: "obri_snehulak", name: "Obří sněhulák", icon: "⛄" }
	]),
	22: makeSequentialUnlock(22, [
		{ id: "perchta_s_nozem", name: "Šeredná Perchta s nožem", icon: "🔪" },
		{ id: "kostlivec_s_kosou", name: "Kostlivec s kosou", icon: "💀" },
		{ id: "ledova_klekanice", name: "Ledová klekánice", icon: "🔔" }
	]),
	23: makeSequentialUnlock(23, [
		{ id: "rychtar_masek", name: "Rychtář maškar", icon: "👑" },
		{ id: "slamennik_obr", name: "Obří slaměník", icon: "🌾" },
		{ id: "masopustni_medved", name: "Masopustní medvěd", icon: "🐻" }
	])
};

const LEVEL_PROGRESS_CACHE = new WeakMap<object, Map<any, any>>();

/**
* Calculates progressive reveal information and unlock status for a game level
*/
function computeLevelProgress(id: any, meta: any) {
	const def = LEVEL_UNLOCKS[id];
	const lvlOriginal = GAME_LEVELS[id as keyof typeof GAME_LEVELS];
	if (!def || !lvlOriginal) return {
		id,
		isUnlocked: true,
		canUnlock: true,
		isQueued: false,
		curCount: 0,
		maxCount: 0,
		percent: 100,
		tier: 4,
		spoiledName: `Úroveň ${id + 1}`,
		spoiledShortTitle: `Úroveň ${id + 1}`,
		spoiledSubtitle: "",
		spoiledDesc: "",
		spoiledLore: "",
		spoiledBossHint: "",
		spoiledWeatherHint: "",
		spoiledEnemiesHint: "",
		spoiledIcon: "🗺️",
		spoiledBadge: `${id + 1}. Úroveň`,
		clueTag: "✅ Odemčeno",
		enemiesBreakdown: [],
		bossDefeated: true
	};
	if (def.defaultUnlocked) {
		const m = def.milestones[0];
		return {
			id,
			isUnlocked: true,
			canUnlock: true,
			isQueued: false,
			curCount: 0,
			maxCount: 0,
			percent: 100,
			tier: 4,
			spoiledName: def.realName,
			spoiledShortTitle: def.realShortTitle,
			spoiledSubtitle: def.realSubtitle,
			spoiledDesc: lvlOriginal.description,
			spoiledLore: lvlOriginal.lore,
			spoiledBossHint: m.spoiledBossHint,
			spoiledWeatherHint: m.spoiledWeatherHint,
			spoiledEnemiesHint: m.spoiledEnemiesHint,
			spoiledIcon: def.realIcon,
			spoiledBadge: def.realBadge,
			clueTag: m.clueTag,
			enemiesBreakdown: [],
			bossDefeated: true
		};
	}
	if (isLevelFullyUnlocked(id, meta)) {
		const lastMilestone = def.milestones[def.milestones.length - 1];
		return {
			id,
			isUnlocked: true,
			canUnlock: true,
			isQueued: false,
			curCount: def.maxCount,
			maxCount: def.maxCount,
			percent: 100,
			tier: 4,
			spoiledName: def.realName,
			spoiledShortTitle: def.realShortTitle,
			spoiledSubtitle: def.realSubtitle,
			spoiledDesc: lvlOriginal.description,
			spoiledLore: lvlOriginal.lore,
			spoiledBossHint: `👑 Hlavní boss: ${lvlOriginal.finalBoss.name}`,
			spoiledWeatherHint: lastMilestone.spoiledWeatherHint,
			spoiledEnemiesHint: lastMilestone.spoiledEnemiesHint,
			spoiledIcon: def.realIcon,
			spoiledBadge: def.realBadge,
			clueTag: "✅ Plně odemčeno!",
			enemiesBreakdown: def.targetEnemies.map((e: any) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: meta?.levelKillCounts?.[id]?.[e.id] ?? meta?.bestiaryKills?.[e.id] ?? def.maxCount
			})),
			bossDefeated: true
		};
	}
	const prevId = getPreviousLevel(id);
	if (!canLevelUnlock(id, meta) && prevId !== null) {
		const m0 = def.milestones[0];
		const prevLvl = GAME_LEVELS[prevId as keyof typeof GAME_LEVELS];
		return {
			id,
			isUnlocked: false,
			canUnlock: false,
			isQueued: true,
			requiredLevelName: prevLvl ? prevLvl.shortTitle : "Předchozí úroveň",
			curCount: 0,
			maxCount: def.maxCount,
			percent: 0,
			tier: 0,
			spoiledName: m0.spoiledName,
			spoiledShortTitle: m0.spoiledShortTitle,
			spoiledSubtitle: m0.spoiledSubtitle,
			spoiledDesc: "Tato úroveň se začne odhalovat teprve poté, co prozkoumáte a pokoříte předchozí úroveň v pořadí.",
			spoiledLore: m0.spoiledLore,
			spoiledBossHint: m0.spoiledBossHint,
			spoiledWeatherHint: m0.spoiledWeatherHint,
			spoiledEnemiesHint: m0.spoiledEnemiesHint,
			spoiledIcon: m0.spoiledIcon,
			spoiledBadge: m0.spoiledBadge,
			clueTag: "Čeká na odemčení předchozí úrovně",
			enemiesBreakdown: def.targetEnemies.map((e: any) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: 0
			})),
			bossDefeated: false
		};
	}
	const enemyAliasMap: Record<string, string> = {
		skeleton: "kostlivec",
		kostlivec: "skeleton",
		skeleton_scythe: "kostlivec_kosa",
		kostlivec_kosa: "skeleton_scythe",
	};
	const levelKills = meta?.levelKillCounts?.[id] || meta?.bestiaryKills || {};
	let curCount = 0;
	const enemiesBreakdown = def.targetEnemies.map((e: any) => {
		const cnt = levelKills[e.id] || (enemyAliasMap[e.id] ? levelKills[enemyAliasMap[e.id]] : 0) || 0;
		curCount += cnt;
		return {
			id: e.id,
			name: e.name,
			icon: e.icon,
			count: cnt
		};
	});
	const prevLevel = GAME_LEVELS[(id - 1) as keyof typeof GAME_LEVELS];
	const bossId = prevLevel?.finalBoss?.id || "";
	const bossDefeated = bossId
		? (meta?.bestiaryKills?.[bossId] || 0) >= 1 ||
		  (id === 4 && (meta?.bestiaryKills?.hejkal || 0) >= 1) ||
		  (id === 5 && (meta?.bestiaryKills?.pankrac || 0) >= 1) ||
		  (id === 6 && (meta?.bestiaryKills?.mlynar || 0) >= 1) ||
		  !!meta?.completedLevels?.[id - 1]
		: false;
	let percent = 0;
	if (bossDefeated) {
		curCount = def.maxCount;
		percent = 100;
	} else percent = Math.min(100, Math.floor(curCount / def.maxCount * 100));
	const isUnlocked = percent >= 100;
	let tier = 0;
	if (isUnlocked || percent >= 100) tier = 4;
	else if (percent >= 75) tier = 3;
	else if (percent >= 50) tier = 2;
	else if (percent >= 25) tier = 1;
	else tier = 0;
	const milestone = def.milestones.find((m: any) => m.tierLevel === tier) || def.milestones[0];
	return {
		id,
		isUnlocked,
		canUnlock: true,
		isQueued: false,
		curCount: Math.min(def.maxCount, curCount),
		maxCount: def.maxCount,
		percent,
		tier,
		spoiledName: milestone.spoiledName,
		spoiledShortTitle: milestone.spoiledShortTitle,
		spoiledSubtitle: milestone.spoiledSubtitle,
		spoiledDesc: milestone.spoiledDesc,
		spoiledLore: milestone.spoiledLore,
		spoiledBossHint: milestone.spoiledBossHint,
		spoiledWeatherHint: milestone.spoiledWeatherHint,
		spoiledEnemiesHint: milestone.spoiledEnemiesHint,
		spoiledIcon: milestone.spoiledIcon,
		spoiledBadge: milestone.spoiledBadge,
		clueTag: milestone.clueTag,
		enemiesBreakdown,
		bossDefeated
	};
}

function getLevelProgress(id: any, meta: any) {
	if (!meta || typeof meta !== 'object') {
		return computeLevelProgress(id, meta);
	}
	let metaCache = LEVEL_PROGRESS_CACHE.get(meta);
	if (!metaCache) {
		metaCache = new Map();
		LEVEL_PROGRESS_CACHE.set(meta, metaCache);
	}
	const cached = metaCache.get(id);
	if (cached) return cached;
	const res = computeLevelProgress(id, meta);
	metaCache.set(id, res);
	return res;
}

export { LEVEL_ORDER, getPreviousLevel, isLevelFullyUnlocked, canLevelUnlock, getActiveUnlockingLevel, makeSequentialUnlock, LEVEL_UNLOCKS, getLevelProgress, computeLevelProgress };
