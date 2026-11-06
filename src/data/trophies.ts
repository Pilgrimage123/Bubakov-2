import { VILLAGE_BUILDINGS } from './village';

export function getTotalBestiaryKills(meta: any): number {
	if (!meta) return 0;
	if (typeof meta.totalBestiaryKills === 'number') return meta.totalBestiaryKills;
	const kills = meta.bestiaryKills;
	if (!kills) return 0;
	let total = 0;
	for (const k in kills) {
		if (k === 'skeleton' && kills['kostlivec'] !== undefined) continue;
		if (k === 'skeleton_scythe' && kills['kostlivec_kosa'] !== undefined) continue;
		if (k === 'kostlivec_koste' && kills['kostlivec_kosa'] !== undefined) continue;
		total += Number(kills[k]) || 0;
	}
	return total;
}

var TROPHIES = [
	{
		id: "souls_5",
		title: "🏺 Spasitel dušiček",
		desc: "Osvoboď celkem alespoň 5 uvězněných dušiček z hastrmanských hrníčků.",
		reward: 60,
		isMet: (meta) => (meta.totalSoulsSaved || 0) >= 5,
		getProgress: (meta) => ({
			cur: Math.min(5, meta.totalSoulsSaved || 0),
			max: 5
		})
	},
	{
		id: "souls_20",
		title: "✨ Ochránce rybničních tůní",
		desc: "Osvoboď celkem alespoň 20 dušiček z hrníčků vodníků a topivců.",
		reward: 120,
		isMet: (meta) => (meta.totalSoulsSaved || 0) >= 20,
		getProgress: (meta) => ({
			cur: Math.min(20, meta.totalSoulsSaved || 0),
			max: 20
		})
	},
	{
		id: "cert_slain",
		title: "👹 Krotitel pekelníků",
		desc: "Přemož alespoň jednou obávaného bosse Pekelného Čerta.",
		reward: 100,
		isMet: (meta) => (meta.bestiaryKills.cert || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.cert || 0),
			max: 1
		})
	},
	{
		id: "hejkal_slain",
		title: "🌲 Vládce půlnočního hvozdu",
		desc: "Postav se obřímu Půlnočnímu Hejkalovi a pokoř ho v boji.",
		reward: 160,
		isMet: (meta) => (meta.bestiaryKills.hejkal || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.hejkal || 0),
			max: 1
		})
	},
	{
		id: "chasnik_rescued",
		title: "🌾 Věrný vesnický soused",
		desc: "Zachraň alespoň jednou v aréně obklíčeného vesnického chasníka Kubu.",
		reward: 50,
		isMet: (meta) => (meta.totalChasnikSaved || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.totalChasnikSaved || 0),
			max: 1
		})
	},
	{
		id: "chasnik_5",
		title: "🤝 Rychtářův pravý přítel",
		desc: "Zachraň celkem alespoň 5 vesnických chasníků.",
		reward: 100,
		isMet: (meta) => (meta.totalChasnikSaved || 0) >= 5,
		getProgress: (meta) => ({
			cur: Math.min(5, meta.totalChasnikSaved || 0),
			max: 5
		})
	},
	{
		id: "survive_dawn",
		title: "🐓 Kohoutí vítěz (Přežití noci)",
		desc: "Přežij všech 6 minut noci až do ranního kuropění a svítání!",
		reward: 200,
		isMet: (meta) => (meta.highestSurviveTime || 0) >= 360,
		getProgress: (meta) => ({
			cur: Math.min(360, Math.floor(meta.highestSurviveTime || 0)),
			max: 360
		})
	},
	{
		id: "polednice_slain",
		title: "☀️ Stín srpového žáru",
		desc: "Přemož alespoň 3 zákeřné Polednice v pravé poledne.",
		reward: 80,
		isMet: (meta) => (meta.bestiaryKills.polednice || 0) >= 3,
		getProgress: (meta) => ({
			cur: Math.min(3, meta.bestiaryKills.polednice || 0),
			max: 3
		})
	},
	{
		id: "kills_100",
		title: "⚔️ Postrach nočních bubáků",
		desc: "Přemož v bojích celkem alespoň 100 venkovských strašidel.",
		reward: 80,
		isMet: (meta: any) => getTotalBestiaryKills(meta) >= 100,
		getProgress: (meta: any) => {
			const sum = getTotalBestiaryKills(meta);
			return {
				cur: Math.min(100, sum),
				max: 100
			};
		}
	},
	{
		id: "kills_300",
		title: "🏰 Legendární venkovský hrdina",
		desc: "Přemož v bojích celkem alespoň 300 venkovských strašidel.",
		reward: 200,
		isMet: (meta: any) => getTotalBestiaryKills(meta) >= 300,
		getProgress: (meta: any) => {
			const sum = getTotalBestiaryKills(meta);
			return {
				cur: Math.min(300, sum),
				max: 300
			};
		}
	},
	{
		id: "winter_walker",
		title: "❄️ Kráčející vánicí",
		desc: "Přemož v ladovském mrazu alespoň 5 zimních Meluzín.",
		reward: 60,
		isMet: (meta) => (meta.bestiaryKills.meluzina || 0) >= 5,
		getProgress: (meta) => ({
			cur: Math.min(5, meta.bestiaryKills.meluzina || 0),
			max: 5
		})
	},
	{
		id: "village_patron",
		title: "🍺 Vesnický mecenáš",
		desc: "Vylepši alespoň jedno vesnické stavení či řemeslo na 3. nebo vyšší úroveň.",
		reward: 80,
		isMet: (meta) => VILLAGE_BUILDINGS.some((b) => ((meta[b.levelKey] as number) || 0) >= 3),
		getProgress: (meta) => {
			const max = Math.max(0, ...VILLAGE_BUILDINGS.map((b) => ((meta[b.levelKey] as number) || 0)));
			return {
				cur: Math.min(3, max),
				max: 3
			};
		}
	},
	{
		id: "blacksmith_master",
		title: "🗡️ Mistr vesnické zbrojnice",
		desc: "Odemkni v kovářském arzenálu celkem alespoň 5 různých zbraní.",
		reward: 120,
		isMet: (meta) => {
			return Object.keys(meta.unlockedWeapons || {}).filter((k) => meta.unlockedWeapons?.[k]).length >= 5;
		},
		getProgress: (meta) => {
			const unlockedCount = Object.keys(meta.unlockedWeapons || {}).filter((k) => meta.unlockedWeapons?.[k]).length;
			return {
				cur: Math.min(5, unlockedCount),
				max: 5
			};
		}
	},
	{
		id: "fellowship_hunters",
		title: "📯 Slavná vesnická družina",
		desc: "Odemkni všech 6 lidových hrdinů a shromáždi celou slavnou družinu.",
		reward: 150,
		isMet: (meta) => {
			const uh = meta.unlockedHunters || {
				wanderer: true,
				shepherd: false,
				korenarka: false,
				watchman: false,
				sexton: false,
				granny: false
			};
			return Boolean(
				(uh.wanderer || uh.tulak) &&
				(uh.shepherd || uh.pasacek) &&
				uh.korenarka &&
				(uh.watchman || uh.ponocny) &&
				(uh.sexton || uh.kostelnik) &&
				(uh.granny || uh.babicka)
			);
		},
		getProgress: (meta) => {
			const uh = meta.unlockedHunters || {
				wanderer: true,
				shepherd: false,
				korenarka: false,
				watchman: false,
				sexton: false,
				granny: false
			};
			return {
				cur:
					((uh.wanderer || uh.tulak) ? 1 : 0) +
					((uh.shepherd || uh.pasacek) ? 1 : 0) +
					(uh.korenarka ? 1 : 0) +
					((uh.watchman || uh.ponocny) ? 1 : 0) +
					((uh.sexton || uh.kostelnik) ? 1 : 0) +
					((uh.granny || uh.babicka) ? 1 : 0),
				max: 6
			};
		}
	},
	{
		id: "obr_slain",
		title: "🗿 Pokořitel sázavského obra",
		desc: "Postav se mohutnému Skalnímu obrovi ze Sázavy a přemož ho v boji.",
		reward: 180,
		isMet: (meta) => (meta.bestiaryKills.obr || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.obr || 0),
			max: 1
		})
	},
	{
		id: "lightning_strike",
		title: "⚡ Blesk svatého Eliáše",
		desc: "Přežij v noční bouři mocný úder blesku svatého Eliáše.",
		reward: 50,
		isMet: (meta) => meta.lightningWitnessed === true,
		getProgress: (meta) => ({
			cur: meta.lightningWitnessed ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level0_completed",
		title: "🌱 Denní tání v Předjaří",
		desc: "Dokonči 1. úroveň: zažeň Hejno mrazivých vran za jasného denního svitu.",
		reward: 80,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[0]) || (meta.bestiaryKills?.vrana || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[0]) || (meta.bestiaryKills?.vrana || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level1_completed",
		title: "❄️ Noční mrazy v Předjaří",
		desc: "Dokonči 2. úroveň: zažeň Moranu, špatně vynesenou smrtku, a přežij mrazivou noc.",
		reward: 100,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[1]) || (meta.bestiaryKills?.morana || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[1]) || (meta.bestiaryKills?.morana || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level2_completed",
		title: "🧹 Dubnový přemožitel",
		desc: "Dokonči 3. úroveň: zažeň Vrchní Filipojakubskou Čarodějnici a ochraň jarní náves.",
		reward: 120,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[2]) || (meta.bestiaryKills?.vrchni_carodejnice || 0) >= 1 || (meta.bestiaryKills?.cert || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[2]) || (meta.bestiaryKills?.vrchni_carodejnice || 0) >= 1 || (meta.bestiaryKills?.cert || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level3_completed",
		title: "🧹 Filipojakubský přemožitel",
		desc: "Dokonči 4. úroveň: zažeň Filipojakubský sabat čarodějnic a ochraň noční náves.",
		reward: 180,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[3]) || (meta.bestiaryKills?.vrchni_carodejnice || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[3]) || (meta.bestiaryKills?.vrchni_carodejnice || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level4_completed",
		title: "🌸 Májová slavnost v Hrusicích",
		desc: "Dokonči 5. úroveň: zažeň nečekaný květnový mráz, přemož trio Ledových mužů a ochraň jarní květy!",
		reward: 250,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[4]) || (meta.bestiaryKills?.ledovi_muzi || 0) >= 1 || (meta.bestiaryKills?.pankrac || 0) >= 1 || (meta.bestiaryKills?.obr || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[4]) || (meta.bestiaryKills?.ledovi_muzi || 0) >= 1 || (meta.bestiaryKills?.pankrac || 0) >= 1 || (meta.bestiaryKills?.obr || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "mlynar_slain",
		title: "🌊 Pokořitel Čertova mlýna",
		desc: "Zastav divoká stavidla a přemož Prokletého Mlynáře v hamrech.",
		reward: 220,
		isMet: (meta) => (meta.bestiaryKills.mlynar || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.mlynar || 0),
			max: 1
		})
	},
	{
		id: "bezhlavy_rytir_slain",
		title: "🗡️ Rytířský soudce",
		desc: "Odraz útok ztracené hlavy a poraz Bezhlavého rytíře v podhradí.",
		reward: 260,
		isMet: (meta) => (meta.bestiaryKills.bezhlavy_rytir || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.bezhlavy_rytir || 0),
			max: 1
		})
	},
	{
		id: "drak_slain",
		title: "🐉 Krotitel melechovského draka",
		desc: "Probuď a pokoř tříhlavého líného draka v ledové sluji pod skálou.",
		reward: 350,
		isMet: (meta) => (meta.bestiaryKills.drak || 0) >= 1,
		getProgress: (meta) => ({
			cur: Math.min(1, meta.bestiaryKills.drak || 0),
			max: 1
		})
	},
	{
		id: "level5_completed",
		title: "🌲 Přemožitel půlnočního hvozdu",
		desc: "Dokonči 6. úroveň: přemož Půlnočního Hejkala a otevři stavidla z nočního hamru.",
		reward: 220,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[5]) || (meta.bestiaryKills.hejkal || 0) >= 1 || (meta.bestiaryKills.mlynar || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[5]) || (meta.bestiaryKills.hejkal || 0) >= 1 || (meta.bestiaryKills.mlynar || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level6_completed",
		title: "🌾 Pokořitel poledního žáru",
		desc: "Dokonči 7. úroveň: přemož Královskou Polednici a letní sluneční běsy.",
		reward: 260,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[6]) || (meta.bestiaryKills.kralovska_polednice || 0) >= 1 || (meta.bestiaryKills.polednice || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[6]) || (meta.bestiaryKills.kralovska_polednice || 0) >= 1 || (meta.bestiaryKills.polednice || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level7_completed",
		title: "🌿 Pán svatojánské noci",
		desc: "Dokonči 8. úroveň: získej zlaté kapradí a přemož Svatojánského Vládce Hvozdu!",
		reward: 350,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[7]) || (meta.bestiaryKills.svatojansky_vladce || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[7]) || (meta.bestiaryKills.svatojansky_vladce || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level8_completed",
		title: "🌾 Hospodář červencových žní",
		desc: "Dokonči 9. úroveň: zastřílej si na pouti sv. Markéty a přemož Pouťového Hromotluka!",
		reward: 380,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[8]) || (meta.bestiaryKills?.hromotluk_marketa || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[8]) || (meta.bestiaryKills?.hromotluk_marketa || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level9_completed",
		title: "🐉 Pán bouře svatého Eliáše",
		desc: "Dokonči 10. úroveň: přežij bouři sv. Eliáše, odraz Bezhlavého rytíře a pokoř Tříhlavého Draka!",
		reward: 420,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[9]) || (meta.bestiaryKills?.drak || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[9]) || (meta.bestiaryKills?.drak || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level10_completed",
		title: "🌾 Vládce srpnových dožínek",
		desc: "Dokonči 11. úroveň: upeč si křupavý chléb v návesní peci a pokoř Dožínkového chasníka!",
		reward: 450,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[10]) || (meta.bestiaryKills?.dozinkovy_chasnik || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[10]) || (meta.bestiaryKills?.dozinkovy_chasnik || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level11_completed",
		title: "🦉 Pokořitel Výra velkého",
		desc: "Dokonči 12. úroveň: rozdmýchej Vavřineckou vatru, chytej Perseidy a přemož Výra velkého!",
		reward: 500,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[11]) || (meta.bestiaryKills?.vyr_velky || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[11]) || (meta.bestiaryKills?.vyr_velky || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level12_completed",
		title: "🍯 Mistr zářijového posvícení",
		desc: "Dokonči 13. úroveň: uhlídej měděný kotel švestkových povidel na návsi a přemož Posvícenského Hospodáře!",
		reward: 550,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[12]) || (meta.bestiaryKills?.posvicensky_hospodar || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[12]) || (meta.bestiaryKills?.posvicensky_hospodar || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level13_completed",
		title: "🌫️ Strážce svatováclavské noci",
		desc: "Dokonči 14. úroveň: zažehni Svatováclavský svatý oheň u kostela a v podzimní mlze utiš Kvílící Meluzínu!",
		reward: 600,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[13]) || (meta.bestiaryKills?.kvilici_meluzina || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[13]) || (meta.bestiaryKills?.kvilici_meluzina || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level14_completed",
		title: "🪁 Vládce říjnové drakiády",
		desc: "Dokonči 15. úroveň: upeč křupavou bramboru v popelu na návsi a sraz k zemi obřího papírového draka Větrníka!",
		reward: 650,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[14]) || (meta.bestiaryKills?.drak_vetrnik || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[14]) || (meta.bestiaryKills?.drak_vetrnik || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level15_completed",
		title: "🕯️ Pokořitel hlubin a Dušiček",
		desc: "Dokonči 16. úroveň: zažehni dušičkovou svíci u Božích muk a přemož obří Hrusickou Veleštiku z bahna Brčálníku!",
		reward: 700,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[15]) || (meta.bestiaryKills?.vele_stika || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[15]) || (meta.bestiaryKills?.vele_stika || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level16_completed",
		title: "🪿 Svatomartinský hodovník",
		desc: "Dokonči 17. úroveň: ochutnej pečenou husu U Sejků a poraz Listopadového Mrazivce!",
		reward: 750,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[16]) || (meta.bestiaryKills?.listopadovy_mrazivec || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[16]) || (meta.bestiaryKills?.listopadovy_mrazivec || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level17_completed",
		title: "🐗 Pán mlžného nočního honu",
		desc: "Dokonči 18. úroveň: přilož do uhlířského milíře a udolej divočáka Kňoura!",
		reward: 800,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[17]) || (meta.bestiaryKills?.kanec_knour || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[17]) || (meta.bestiaryKills?.kanec_knour || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level18_completed",
		title: "🎅 Přemožitel čerta Richtera",
		desc: "Dokonči 19. úroveň: zažehni adventní svíci na návsi a vyžeň z Hrusic Čerta Richtera!",
		reward: 850,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[18]) || (meta.bestiaryKills?.mikulassky_cert || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[18]) || (meta.bestiaryKills?.mikulassky_cert || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level19_completed",
		title: "⭐ Hrdina štědrovečerních Hrusic",
		desc: "Dokonči 20. úroveň: rozezvuč štědrovečerní zvon v kostele sv. Mikuláše a zlom vládu Krále Mrazíka!",
		reward: 1000,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[19]) || (meta.bestiaryKills?.kral_mrazik || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[19]) || (meta.bestiaryKills?.kral_mrazik || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level20_completed",
		title: "⛄ Stavitel sněhuláků",
		desc: "Dokonči 21. úroveň: postav sněhuláka na návsi a zažeň Vládce chumelenice!",
		reward: 1050,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[20]) || (meta.bestiaryKills?.vladce_chumelenice || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[20]) || (meta.bestiaryKills?.vladce_chumelenice || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level21_completed",
		title: "🗡️ Krotitel Perchty s nožem",
		desc: "Dokonči 22. úroveň: posvěť faru křídou K+M+B a přemož Šerednou Perchtu s nožem v tříkrálové noci!",
		reward: 1200,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[21]) || (meta.bestiaryKills?.perchta_s_nozem || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[21]) || (meta.bestiaryKills?.perchta_s_nozem || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level22_completed",
		title: "🎭 Král masopustního průvodu",
		desc: "Dokonči 23. úroveň: usmaž masopustní koblihy u hostince a pokoř Rychtáře maškar!",
		reward: 1350,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[22]) || (meta.bestiaryKills?.rychtar_masek || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[22]) || (meta.bestiaryKills?.rychtar_masek || 0) >= 1 ? 1 : 0,
			max: 1
		})
	},
	{
		id: "level23_completed",
		title: "🎻 Pán celého roku a krotitel Bakcha",
		desc: "Dokonči 24. úroveň: pochovej basu u márnice, zažehni louče a přemož samotného Bakcha!",
		reward: 1500,
		isMet: (meta) => !!(meta.completedLevels && meta.completedLevels[23]) || (meta.bestiaryKills?.bakchus_s_pivnim_soudkem || 0) >= 1,
		getProgress: (meta) => ({
			cur: (meta.completedLevels && meta.completedLevels[23]) || (meta.bestiaryKills?.bakchus_s_pivnim_soudkem || 0) >= 1 ? 1 : 0,
			max: 1
		})
	}
];

export { TROPHIES };
