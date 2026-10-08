import React from 'react';
export type { WeaponProgress } from '../types';

var LOCKED_WEAPONS_ORDER = [
	"pitchfork",
	"halberd",
	"flail",
	"herbs",
	"snowball",
	"kolac",
	"potato",
	"bees",
	"holywater",
	"valecnice",
	"cesnekova-topinka",
	"kysela-okurka"
];
function getPreviousWeapon(id) {
	const idx = LOCKED_WEAPONS_ORDER.indexOf(id);
	if (idx <= 0) return null;
	return LOCKED_WEAPONS_ORDER[idx - 1];
}
function isWeaponUnlocked(id, meta) {
	if (WEAPON_UNLOCKS[id]?.defaultUnlocked) return true;
	return !!meta.unlockedWeapons?.[id];
}
function canWeaponUnlock(id, meta) {
	if (WEAPON_UNLOCKS[id]?.defaultUnlocked) return true;
	const prev = getPreviousWeapon(id);
	return !prev || isWeaponUnlocked(prev, meta);
}
function getActiveUnlockingWeapon(meta) {
	for (let i = 0; i < LOCKED_WEAPONS_ORDER.length; i++) {
		const id = LOCKED_WEAPONS_ORDER[i];
		if (!isWeaponUnlocked(id, meta)) {
			if (canWeaponUnlock(id, meta)) return id;
			return null;
		}
	}
	return null;
}
var WEAPON_UNLOCKS = {
	buns: {
		id: "buns",
		realName: "Povidlové buchty",
		realIcon: "czech_buchta",
		realType: "food",
		defaultUnlocked: true,
		challengeTitle: "Výchozí venkovská výzbroj",
		challengeShortDesc: "Čerstvě upečené buchty sypané moučkovým cukrem v ranči od začátku.",
		challengeLongDesc: "Tradiční pečené kynuté buchty sypané moučkovým cukrem a plněné švestkovým povidlem. Dostupné pro každého lovce bez omezení.",
		targetEnemies: [],
		maxCount: 0,
		milestones: [{
			minPercent: 0,
			tierLevel: 4,
			spoiledName: "Povidlové buchty",
			spoiledTitle: "Zlatavé buchty sypané moučkovým cukrem",
			spoiledDesc: "Tradiční české kynuté buchty pečené v pekáči, bohatě poprášené moučkovým cukrem a plněné švestkovým povidlem. Obyčejní bubáci po nich mlsně lapají a v panice ustupují.",
			spoiledStatsHint: "Poškození: 22 • Typ: Jídlo • Sladké mlsání (1,8 s) • Postupné přidávání střel",
			clueTag: "✅ Výchozí zbraň"
		}]
	},
	cane: {
		id: "cane",
		realName: "Osikový prut",
		realIcon: "osikovy_prut",
		realType: "physical",
		defaultUnlocked: true,
		challengeTitle: "Výchozí venkovská výzbroj",
		challengeShortDesc: "Ohebný osikový prut dostupný od začátku (lze namočit na Mokrý prut).",
		challengeLongDesc: "Rychlý sečný prut z osiky u háje. Základní výbava každého hrusického poutníka, kterou lze proměnit na Mokrý prut.",
		targetEnemies: [],
		maxCount: 0,
		milestones: [{
			minPercent: 0,
			tierLevel: 4,
			spoiledName: "Osikový prut (Mokrý prut)",
			spoiledTitle: "Ohebný osikový prut z háje",
			spoiledDesc: "Ohebný osikový prut uříznutý v osikovém háji. Rychlý široký sečný oblouk odhání dotěrné skřítky a zloděje. S rybniční vodou získáte Mokrý prut.",
			spoiledStatsHint: "Poškození: 28 • Kadence: 0,65 s • Široký sečný oblouk • Vylepšení na Mokrý prut",
			clueTag: "✅ Výchozí zbraň"
		}]
	},
	hromnicka: {
		id: "hromnicka",
		realName: "Hromnička",
		realIcon: "🕯️",
		realType: "holy",
		defaultUnlocked: true,
		challengeTitle: "Výchozí posvěcená výzbroj",
		challengeShortDesc: "Posvěcená hromniční svíce chránící před bouřemi a nočními běsy.",
		challengeLongDesc: "Posvěcená vosková svíce z kostelíka sv. Jiří. Vytváří plápolající posvátnou auru mírného dosahu, která odtlačuje běsy a každé 2 s je zraňuje svatým světlem.",
		targetEnemies: [],
		maxCount: 0,
		milestones: [{
			minPercent: 0,
			tierLevel: 4,
			spoiledName: "Hromnička",
			spoiledTitle: "Posvěcená svíce proti bouřím a běsům",
			spoiledDesc: "Tradiční hromniční svíce posvěcená v kostelíku. Její plápolající světlo tvoří auru mírného dosahu, mírně odhání nepřátele a každé 2 s uděluje posvátné zranění (odolatelné Strachem). Nemrtví a pekelníci mají k němu silně sníženou odolnost a utrží podstatně vyšší zranění.",
			spoiledStatsHint: "Poškození: 10 každé 2 s • Typ: Svaté • Odtlačující plápolající aura mírného dosahu",
			clueTag: "✅ Výchozí zbraň"
		}]
	},
	pitchfork: {
		id: "pitchfork",
		realName: "Kovářské vidle",
		realIcon: "🔱",
		realType: "physical",
		defaultUnlocked: false,
		challengeTitle: "🔨 Kovářské kalení proti umrlcům",
		challengeShortDesc: "Zažeň celkem 50 kostlivců a hrobových umrlců.",
		challengeLongDesc: "Vesnický kovář ukove třízubé ocelové vidle teprve tehdy, když dokážeš zahnat 50 chrastících kostlivců a hrobových umrlců obcházejících hřbitov u svatého Jiří.",
		targetEnemies: [
			{
				id: "skeleton",
				name: "Kostlivec ze sv. Jiří",
				icon: "💀"
			},
			{
				id: "skeleton_scythe",
				name: "Kostlivec s kosou",
				icon: "🌾"
			},
			{
				id: "umrlec",
				name: "Rychtářův umrlec",
				icon: "⚰️"
			},
			{
				id: "hrobnik",
				name: "Ponocný kopáč",
				icon: "🪦"
			}
		],
		maxCount: 50,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Zahalené kovářské nářadí",
				spoiledDesc: "Ve staré kovárně chladne tajemný polotovar z tvrzeného železa. Kovář ho odmítá vydat nezkušeným poutníkům.",
				spoiledStatsHint: "Vlastnosti: Zahaleno v hustém dýmu z výhně",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % kostlivců pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "K _ _ _ _ _ k é   v _ _ _ e",
				spoiledTitle: "Trojzubý ocelový nástroj z výhně",
				spoiledDesc: "Kovář už vytvaroval tři dlouhé hroty. Říká se, že tato zbraň prorazí celou řadu přízraků v přímém směru.",
				spoiledStatsHint: "Nápověda: Fyzické bodnutí s dlouhým dosahem...",
				clueTag: "🔍 25 %: První stopa! Odhaleny kovářské hroty"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Ková...ské vidle",
				spoiledTitle: "Ostré kované vidle prorážející šiky",
				spoiledDesc: "Kovářské vidle jsou téměř zakalené! Mocné bodnutí přímo vpřed zasahuje všechny nepřátele v dráze a snadno odhazuje těžké stíny.",
				spoiledStatsHint: "Základní poškození: 24 • Dosah: 130 • Přímý průraz",
				clueTag: "🔎 50 %: Znáš tvar i bodnou sílu vidlí!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Kovářské vidle (Téměř ukováno!)",
				spoiledTitle: "Mistrovské třízubé vidle z kalené oceli",
				spoiledDesc: "Kovář už jen brousí hroty na vodním brusu! Ještě pár zahnadých kostlivců a vidle se stanou trvalou součástí výběru zbraní.",
				spoiledStatsHint: "Startovní síla: 24 dmg, +6 dmg za úroveň, zrychlené bodnutí",
				clueTag: "⚡ 75 %: Oheň dohasíná! Zbývá už jen kousek!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Kovářské vidle",
				spoiledTitle: "Třízubé vidle z vesnické kovárny",
				spoiledDesc: "Třízubé kované vidle z vesnické kovárny. Proráží řady strašidel mocným bodnutím přímo vpřed.",
				spoiledStatsHint: "Poškození: 24 • Bodný průraz před hráčem",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	halberd: {
		id: "halberd",
		realName: "Kovaná halapartna",
		realIcon: "🪓",
		realType: "physical",
		defaultUnlocked: false,
		challengeTitle: "📯 Panská stráž proti čertům a drábům",
		challengeShortDesc: "Zažeň celkem 35 pekelníků, drábů a kolosů.",
		challengeLongDesc: "Těžká panská halapartna s širokou sekerou vyžaduje obrovskou sílu paže. Zažeň 35 pekelných čertíků, drábů s karabáči a seníkových kolosů, abys prokázal svou hrdost!",
		targetEnemies: [
			{
				id: "certik",
				name: "Čertík s měchem",
				icon: "😈"
			},
			{
				id: "drab",
				name: "Pekelný dráb",
				icon: "⛓️"
			},
			{
				id: "hromotluk",
				name: "Hromotluk ze seníku",
				icon: "👹"
			},
			{
				id: "cert",
				name: "Pekelný Čert (Boss)",
				icon: "🔥"
			}
		],
		maxCount: 35,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Těžká zbraň ze zámecké strážnice",
				spoiledDesc: "V zamčené skříni ponocného odpočívá mohutné dřevcové ostří. Kdo nemá dostatek odvahy, ten ji ani neuzvedne.",
				spoiledStatsHint: "Vlastnosti: Neznámé – obrovská těžká zbraň",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % pekelníků pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "K _ _ _ _ á   h _ _ _ _ _ _ _ a",
				spoiledTitle: "Dlouhá tyčová zbraň s půlměsícem",
				spoiledDesc: "Na ostří se zaleskla kovaná čepel se špicí. Tato zbraň je určena k rozrážení celých houfů monster najednou.",
				spoiledStatsHint: "Nápověda: Obří sečný půlkruh s masivním poškozením...",
				clueTag: "🔍 25 %: První stopa! Znáš dlouhé ratiště i sekeru"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Kovaná hala...tna",
				spoiledTitle: "Drtivá zbraň nočních stráží a drábů",
				spoiledDesc: "To je legendární halapartna! Široký oblouk 1.7 radiánu a dosah 145 rozsekne i ty nejodolnější umrlce a čerty.",
				spoiledStatsHint: "Základní poškození: 32 • Dosah: 145 • Masivní sečný oblouk",
				clueTag: "🔎 50 %: Znáš obří oblouk i sílu halapartny!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Kovaná halapartna (Téměř okována!)",
				spoiledTitle: "Nejtěžší chlouba noční hlídky",
				spoiledDesc: "Ratiště je zpevněno železnými pásy a čepel je ostrá jako břitva! Poslední zahnadí pekelníci tě dělí od jejího vstupu do arény.",
				spoiledStatsHint: "Start: 32 dmg, +8 dmg za úroveň, zbraň ponocných",
				clueTag: "⚡ 75 %: Ostří se leskne! Už jen pár pekelníků!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Kovaná halapartna",
				spoiledTitle: "Těžká zbraň ponocných a panských drábů",
				spoiledDesc: "Těžká zbraň ponocných a panských drábů. Široký rázný švih, který zažene i celé houfy kostlivců.",
				spoiledStatsHint: "Poškození: 32 • Široký vydatný sečný oblouk",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	flail: {
		id: "flail",
		realName: "Dřevěný cep na obilí",
		realIcon: "🌾",
		realType: "physical",
		defaultUnlocked: false,
		challengeTitle: "🏚️ Výprask na mlatu ve stodole",
		challengeShortDesc: "Zažeň celkem 30 stodolních stínů a lesních kolosů.",
		challengeLongDesc: "Starý okovaný cep z dubového dřeva leží opřený o vrata stodoly. Zažeň 30 zákeřných stodolníků, nočních bubáků a lesních dřevorubců, abys ovládl drtivou rázovou sílu dopadu!",
		targetEnemies: [
			{
				id: "stodolnik",
				name: "Stodolní přízrak",
				icon: "🏚️"
			},
			{
				id: "bubak",
				name: "Noční Bubák",
				icon: "👤"
			},
			{
				id: "drevorubec",
				name: "Duch dřevorubce",
				icon: "🪓"
			},
			{
				id: "hromotluk",
				name: "Hromotluk ze seníku",
				icon: "👹"
			}
		],
		maxCount: 30,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Záhadné hospodářské nářadí z mlatu",
				spoiledDesc: "Na mlatu leží starý nástroj spojený koženým řemínkem. Působí obyčejně, ale v rukou zkušeného sedláka způsobí pohromu.",
				spoiledStatsHint: "Vlastnosti: Neznámé – obrovský plošný úder",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % stodolních stínů pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "D _ _ _ _ _ ý   c _ p   n a   o _ _ _ í",
				spoiledTitle: "Okovaný venkovský cep",
				spoiledDesc: "Dvě spojená dubová břevna okovaná železnými hřeby. Když dopadnou na zem, praská podlaha stodoly.",
				spoiledStatsHint: "Nápověda: Plošný dopad na zem s rázovou vlnou...",
				clueTag: "🔍 25 %: První stopa! Znáš okovaný cep ze stodoly"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Dřevěný cep... (Rázová vlna)",
				spoiledTitle: "Drtivý dopadový kolos",
				spoiledDesc: "Dřevěný cep přináší pořádný výprask! Dopad na zem zasáhne okruh o poloměru 65 a uštědří pořádnou ránu 45.",
				spoiledStatsHint: "Základní poškození: 45 • Plošný dopad: rádius 65",
				clueTag: "🔎 50 %: Znáš plošný dopad i rázovou vlnu cepu!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Dřevěný cep na obilí (Téměř okován!)",
				spoiledTitle: "Sedlákova nejtvrdší pěst",
				spoiledDesc: "Kožený řemínek je pevně promazaný a kovářské hřeby zatlučené! Už jen pár zahnadých stodolních bubáků do plného odemčení.",
				spoiledStatsHint: "Start: 45 dmg, +10 dmg za úroveň, plošný výbuch BUM!",
				clueTag: "⚡ 75 %: Řemen drží pevně! Zbývá pár stínů!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Dřevěný cep na obilí",
				spoiledTitle: "Okovaný venkovský cep na obilí",
				spoiledDesc: "Okovaný venkovský cep na mlácení žita. Drtivý dopad do země vyvolá rázovou vlnu a odhodí těžké nepřátele.",
				spoiledStatsHint: "Poškození: 45 • Plošný dopad a rázová vlna",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	herbs: {
		id: "herbs",
		realName: "Devatery kvítí",
		realIcon: "🌿",
		realType: "nature",
		defaultUnlocked: false,
		challengeTitle: "🌸 Svatojánské trhání bylin u tůní",
		challengeShortDesc: "Zažeň celkem 45 vodních a močálových strašidel.",
		challengeLongDesc: "Znalost devatera bylin trhaných za svatojánské noci chrání před všemi vodními kletbami. Zažeň 45 hastrmanů, topivců a bludiček, abys nasbíral všechny vonné květy!",
		targetEnemies: [
			{
				id: "hastrman",
				name: "Hastrman v šosu",
				icon: "🎩"
			},
			{
				id: "topivec",
				name: "Rákosový topivec",
				icon: "🌊"
			},
			{
				id: "vodnicek",
				name: "Bahenní vodníček",
				icon: "🐸"
			},
			{
				id: "blatouch",
				name: "Blatouchový skřítek",
				icon: "🌼"
			},
			{
				id: "bludicka",
				name: "Bludička močálová",
				icon: "✨"
			}
		],
		maxCount: 45,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Vonný svazek z noční louky",
				spoiledDesc: "V sušárně za pecí visí svazek uschlých bylin vonících po mateřídoušce a třezalce. Jejich ochranné kouzlo ještě spí.",
				spoiledStatsHint: "Vlastnosti: Neznámé – kruhová přírodní ochrana",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % vodníků pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "D _ _ _ _ _ _ y   k _ _ _ í",
				spoiledTitle: "Kouzelný věnec devíti bylin",
				spoiledDesc: "Devatero svatojánských bylin svázaných do kruhového věnce. Při vymetání rotují kolem těla a odrážejí dotírající bubáky.",
				spoiledStatsHint: "Nápověda: Kruhové vystřelování rotujících bylinných listů...",
				clueTag: "🔍 25 %: První stopa! Znáš svatojánský věnec"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Devatery kv...tí",
				spoiledTitle: "Kruhový štít z vonných listů",
				spoiledDesc: "Devatery kvítí vytváří rotující vějíř 3 a více listů rozlétajících se ve všech směrech a zahánějících nečisté síly.",
				spoiledStatsHint: "Základní síla zahnání: 15 • 3 střely ve všech směrech (360°)",
				clueTag: "🔎 50 %: Znáš kruhový vír i přírodní sílu!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Devatery kvítí (Téměř natrháno!)",
				spoiledTitle: "Posvátný svatojánský věnec",
				spoiledDesc: "Poslední kvítek třezalky byl přidán do věnce! Ještě několik zahnadých hastrmanů a bylinný kruh bude chránit tvé výpravy.",
				spoiledStatsHint: "Start: 15 dmg, +4 dmg za úroveň, roste počet listů",
				clueTag: "⚡ 75 %: Vůně bylin sílí! Zbývá už jen pár vodníků!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Devatery kvítí",
				spoiledTitle: "Voňavý ochranný věnec z bylin",
				spoiledDesc: "Voňavý ochranný věnec ze svatojánských bylin. Šíří se v kruhu, čistí vzduch a zahání dotírající nečisté síly.",
				spoiledStatsHint: "Síla zahnání: 15 • Všesměrový kruhový rozstřik listů",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	snowball: {
		id: "snowball",
		realName: "Sněhová koule",
		realIcon: "❄️",
		realType: "ice",
		defaultUnlocked: false,
		challengeTitle: "⛄ Zimní koulovaná v závějích",
		challengeShortDesc: "Zažeň celkem 40 zimních a větrných bytostí.",
		challengeLongDesc: "Tuhá koule z ledového firnu dokáže zastavit i rozběhnutou Meluzínu. Zažeň 40 mrazivých bytostí a meluzín, abys ovládl mrazivé ladovské kouzlo zimy!",
		targetEnemies: [
			{
				id: "meluzina",
				name: "Zimní Meluzína",
				icon: "💨"
			},
			{
				id: "mrazik",
				name: "Mrazík z komína",
				icon: "🥶"
			},
			{
				id: "zmrzlik",
				name: "Zmrzlík z okapu",
				icon: "🧊"
			},
			{
				id: "vanicka",
				name: "Sněhová vánička",
				icon: "❄️"
			},
			{
				id: "severak",
				name: "Severák z hor",
				icon: "🏔️"
			}
		],
		maxCount: 40,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Mrazivý projektil ze závějí",
				spoiledDesc: "V koutě pod střechou mrzne rampouchový sníh. Čeká na lovce, který se nebojí zimního kvílení meluzíny.",
				spoiledStatsHint: "Vlastnosti: Neznámé – mrazivé zpomalení",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % mrazivých bytostí pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "S _ _ _ _ v á   k _ _ _ e",
				spoiledTitle: "Tuhá koule ze zledovatělého sněhu",
				spoiledDesc: "Uválená sněhová koule s tvrdým ledovým jádrem. Po zásahu ochladí nepřítele a zpomalí jeho běh.",
				spoiledStatsHint: "Nápověda: Ledové poškození a zpomalení pohybu cílů...",
				clueTag: "🔍 25 %: První stopa! Znáš ledové jádro koule"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Sněho...á koule",
				spoiledTitle: "Mrazivý projektil s tuhým chladem",
				spoiledDesc: "Sněhová koule vyhledává nejbližší cíle a její chladivý dotek zpomaluje nepřátele o více než 50 % rychlosti!",
				spoiledStatsHint: "Základní poškození: 18 • Chladivý efekt zpomalení o 55 %",
				clueTag: "🔎 50 %: Znáš zaměřování i mrazivé zpomalení!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Sněhová koule (Téměř uváleno!)",
				spoiledTitle: "Pořádná ledová koule z Hrusic",
				spoiledDesc: "Koule má dokonalý tvar a hladký ledový povrch! Ještě pár zahnadých meluzín a bude připravena k vrhu.",
				spoiledStatsHint: "Start: 18 dmg, 2+ střely, mrazí a brzdí útočníky",
				clueTag: "⚡ 75 %: Mráz sílí! Zbývá už jen pár meluzín!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Sněhová koule",
				spoiledTitle: "Tuhá ledová koule ze sněhu",
				spoiledDesc: "Tuhá ledová koule uválená ze zledovatělého ladovského sněhu. Chlad zpomalí nohy každému strašidlu.",
				spoiledStatsHint: "Poškození: 18 • Ledové poškození a silné zpomalení",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	kolac: {
		id: "kolac",
		realName: "Kynutý koláč",
		realIcon: "kynuty_kolac",
		realType: "food",
		defaultUnlocked: false,
		challengeTitle: "🥧 Mlsná havěť ve spíži",
		challengeShortDesc: "Zažeň celkem 70 mlsných rarášků, myšáků a šotků.",
		challengeLongDesc: "Hospodyně upekla velký slavnostní kynutý koláč s tvarohem, povidly a mandlemi. Zažeň 70 nenasytných rarášků, půdních myšáků a šotků, kteří kradou mouku a máslo!",
		targetEnemies: [
			{
				id: "rarach",
				name: "Rarášek",
				icon: "😈"
			},
			{
				id: "mysak",
				name: "Půdní myšák",
				icon: "🐭"
			},
			{
				id: "sotek",
				name: "Šotek z almary",
				icon: "📦"
			},
			{
				id: "skodnik",
				name: "Lesní veverčák-škodík",
				icon: "🐿️"
			}
		],
		maxCount: 70,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Voňavé těsto kynoucí v ošatce",
				spoiledDesc: "Pod bílou utěrkou kyne bohaté těsto plné vajíček a vanilky. Bubáci z celé vsi už natahují nosy.",
				spoiledStatsHint: "Vlastnosti: Neznámé – těžké jídlo",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % škůdců pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "K _ _ _ _ ý   k _ _ _ č",
				spoiledTitle: "Velký kulatý kynutý koláč",
				spoiledDesc: "Zlatavý koláč upečený na velkém plechu. Po dopadu mezi strašidla nezmizí, ale divoce se odráží dál.",
				spoiledStatsHint: "Nápověda: Skákající jídlo s odrazy mezi nepřáteli...",
				clueTag: "🔍 25 %: První stopa! Znáš odskakující koláč"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Kynutý ko...áč",
				spoiledTitle: "Odskakující povidlová delikatesa",
				spoiledDesc: "Kynutý koláč s tvarohem a povidly má obrovskou sílu! Po zásahu se odrazí až 2x (a více s úrovněmi) k dalším cílům.",
				spoiledStatsHint: "Základní poškození: 28 • 2+ odrazy mezi nepřáteli",
				clueTag: "🔎 50 %: Znáš odrazy i vysoké poškození koláče!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Kynutý koláč (Téměř upečeno!)",
				spoiledTitle: "Chlouba posvícení",
				spoiledDesc: "Koláč už voní z trouby a okraje zlátnou! Ještě několik zahnaných mlsných škůdců a koláč poletí do boje.",
				spoiledStatsHint: "Start: 28 dmg, 2 odrazy, vysoká výdrž střely 3.5 s",
				clueTag: "⚡ 75 %: Vůně pečení láká! Už zbývá jen pár myšáků!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Kynutý koláč",
				spoiledTitle: "Tradiční kynutý chodský koláč s tvarohem a povidly",
				spoiledDesc: "Slavnostní kynutý koláč zdobený tvarohem, povidly a mandlemi. Po nárazu se odrazí k dalšímu lačnému bubákovi.",
				spoiledStatsHint: "Poškození: 28 • Odskakuje mezi více nepřáteli",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	potato: {
		id: "potato",
		realName: "Horký brambor z popela",
		realIcon: "🥔",
		realType: "fire",
		defaultUnlocked: false,
		challengeTitle: "🔥 Pečení brambor na strništi",
		challengeShortDesc: "Zažeň celkem 35 polních běsů a ohnivých rarášků.",
		challengeLongDesc: "Horký brambor vytažený z ohniště pálí prsty a po dopadu na zem zanechává hořící ohnisko. Zažeň 35 polednic, klekánic a ohnivých běsů!",
		targetEnemies: [
			{
				id: "polednice",
				name: "Polednice",
				icon: "☀️"
			},
			{
				id: "klekanice",
				name: "Klekánice",
				icon: "🌅"
			},
			{
				id: "divozenka",
				name: "Lesní divoženka",
				icon: "💃"
			},
			{
				id: "ohnivy_muz",
				name: "Ohnivý rarach",
				icon: "🔥"
			}
		],
		maxCount: 35,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Doutnající hrouda z popela",
				spoiledDesc: "V uhlících podzimního ohně na mezi leží černá slupka. Pod ní doutná žár schopný spálit lesní běsy.",
				spoiledStatsHint: "Vlastnosti: Neznámé – ohnivá stopa",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % polních běsů pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "H _ _ _ ý   b _ _ _ _ _ r",
				spoiledTitle: "Žhavý brambor vytažený z ohniště",
				spoiledDesc: "Brambor s křupavou černou kůrkou a žhoucím vnitřkem. Při dopadu zapaluje trávu a popálí vše v okolí.",
				spoiledStatsHint: "Nápověda: Ohnivý vrh zanechávající žhavé ohnisko...",
				clueTag: "🔍 25 %: První stopa! Znáš pečený brambor"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Horký bram...r z popela",
				spoiledTitle: "Ohnivá zbraň z podzimního ohně",
				spoiledDesc: "Horký brambor způsobuje ohnivé poškození a vytváří na zemi kouřící zónu, která zraňuje procházející nepřátele.",
				spoiledStatsHint: "Základní poškození: 22 • Typ: Oheň • Zanechává ohnisko",
				clueTag: "🔎 50 %: Znáš ohnivý žár i kouřící zónu!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Horký brambor z popela (Téměř upečeno!)",
				spoiledTitle: "Křupavý pekáč ze strniště",
				spoiledDesc: "Popel už praská a brambor je rozpálený do ruda! Poslední zahnadé polednice tě dělí od jeho zařazení do zbrojnice.",
				spoiledStatsHint: "Start: 22 dmg, +5 dmg za úroveň, trvalé ohnivé pole",
				clueTag: "⚡ 75 %: Popel žhne! Zbývá pár polních běsů!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Horký brambor z popela",
				spoiledTitle: "Brambor vytažený z žhavého popela",
				spoiledDesc: "Brambor vytažený přímo z žhavého popela. Způsobuje popáleniny a zanechává na zemi kouřící ohnisko.",
				spoiledStatsHint: "Poškození: 22 • Ohnivé plošné zranění a ohniště",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	bees: {
		id: "bees",
		realName: "Včelí roj z úlu",
		realIcon: "🐝",
		realType: "nature",
		defaultUnlocked: false,
		challengeTitle: "🍯 Klátový úl na lesní samotě",
		challengeShortDesc: "Zažeň celkem 50 lesních škůdců, divoženek a černých psů.",
		challengeLongDesc: "Starý špalkový úl s medem brání neúnavné hrusické včely. Zažeň 50 lesních škodíků, divoženek, blatouchů a černých psů, aby se včelí roj přidal k tvé obraně!",
		targetEnemies: [
			{
				id: "skodnik",
				name: "Lesní veverčák-škodík",
				icon: "🐿️"
			},
			{
				id: "divozenka",
				name: "Lesní divoženka",
				icon: "💃"
			},
			{
				id: "blatouch",
				name: "Blatouchový skřítek",
				icon: "🌼"
			},
			{
				id: "cerny_pes",
				name: "Černý pes",
				icon: "🐕"
			},
			{
				id: "zaba",
				name: "Rybniční žabka",
				icon: "🐸"
			}
		],
		maxCount: 50,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Bzučící hnízdo ze špalku",
				spoiledDesc: "Ve starém vyřezávaném kmeni stromu to tichounce hučí. Včelí královna zatím vyčkává v bezpečí.",
				spoiledStatsHint: "Vlastnosti: Neznámé – samonaváděné bodání",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % lesních běsů pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "V _ _ _ í   r _ j   z   ú _ u",
				spoiledTitle: "Vyřezávaný klát plný ostrých žihadel",
				spoiledDesc: "Celé hejno bzučících včelek létajících vzduchem. Neznají slitování a samy si najdou cíl, i když utíká.",
				spoiledStatsHint: "Nápověda: Samonaváděcí střely (homing) pronásledující nepřátele...",
				clueTag: "🔍 25 %: První stopa! Znáš samonaváděcí včelky"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Včelí r...oj z úlu",
				spoiledTitle: "Samonaváděcí bodavá letka",
				spoiledDesc: "Včelí roj vypouští 3 a více rychlých naváděných včel, které pronásledují nejbližší strašidla s neuvěřitelnou vytrvalostí.",
				spoiledStatsHint: "Základní poškození: 12 • 3+ naváděných včel • Trvání: 3.0 s",
				clueTag: "🔎 50 %: Znáš naváděcí let i žihadla roje!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Včelí roj z úlu (Téměř vyrojen!)",
				spoiledTitle: "Včelí královna připravena k letu",
				spoiledDesc: "Úl se chvěje a bzukot je slyšet přes celé údolí! Ještě pár zahnadých škůdců a včely vyletí do arény.",
				spoiledStatsHint: "Start: 12 dmg, 3+ včely, rychlost střelby 0.9 s, navádění",
				clueTag: "⚡ 75 %: Bzukot sílí! Zbývá už jen pár škůdců!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Včelí roj z úlu",
				spoiledTitle: "Bzučící venkovské včely ze špalku",
				spoiledDesc: "Bzučící venkovské včely ze starého špalkového úlu. Samy si nacházejí nejbližší strašidla a neúnavně je bodají.",
				spoiledStatsHint: "Poškození: 12 • Samonaváděné létající včely",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	},
	valecnice: {
		id:"valecnice", realName:"Válečnice", realIcon:"valecnice", realType:"valecnice", defaultUnlocked:true,
		challengeTitle:"Rázná venkovská hospodyně s bukovým válečkem", challengeShortDesc:"Válečnice obíhá lovce ve velkém kruhu a zpomaluje i drtí bubáky.",
		challengeLongDesc:"Statná venkovská paní (+40 % velikost) obíhající ve velkém patrolním kruhu (115 px). Bukovým válečkem zasahuje v dosahu 58 px (+60 %), uvrhne bubáky do 1,2s omráčení, odhazuje silou 520, proráží 20 % odolností a v zóně o 15 % větší než orbit zpomaluje nepřátele o 25 % (odolnost dle Vůle).",
		targetEnemies:[], maxCount:0, milestones:[{
			minPercent:0,tierLevel:4,
			spoiledName:"Válečnice s válečkem",
			spoiledTitle:"Statná rázná hospodyně (Velký kruh & Zpomalení)",
			spoiledDesc:"Zuřivá paní s bukovým válečkem obíhá lovce (+40 % velikost). Udílí 1,2s omráčení, odhození 520, má o 60 % větší dosah (58 px), ignoruje 20 % odolností a v kruhu o 15 % větším než orbit navíc zpomaluje nepřátele o 25 % (dle Vůle).",
			spoiledStatsHint:"💥 Dmg: 32 • ⏱️ Kadence: 0,75 s • 💫 Stun: 1,2 s • 🌪️ Zpomalení: 25 % (+15 % kruh) • 🛡️ Průraz: 20 % • 📏 Dosah: 58 px • 🔨 Odhoz: 520",
			clueTag:"✅ Plně odemčeno ve zbrojnici!"
		}]
	},
	"cesnekova-topinka": {
		id:"cesnekova-topinka", realName:"Česneková topinka", realIcon:"cesnekova_topinka", realType:"garlic", defaultUnlocked:true,
		challengeTitle:"Smradlavá obranná zóna", challengeShortDesc:"Česneková topinka je odemčena v arzenálu.",
		challengeLongDesc:"Permanentní aura z česnekové topinky zraňuje nepřátele (5 dmg / 0,35 s), odhazuje je a zpomaluje o 15 %.",
		targetEnemies:[], maxCount:0, milestones:[{minPercent:0,tierLevel:4,spoiledName:"Česneková topinka",spoiledTitle:"Smradlavá aura",spoiledDesc:"Smradlavá aura z česnekové topinky. Zraňuje dotírající nepřátele v okruhu 110 px, odhazuje je a zpomaluje o 15 %.",spoiledStatsHint:"Aura • Dmg: 5 každých 0,35 s • Odhození 300 • Zpomalení 15 %",clueTag:"✅ Plně odemčeno ve zbrojnici!"}]
	},
	"kysela-okurka": {
		id:"kysela-okurka", realName:"Kyselá okurka", realIcon:"kysela_okurka", realType:"pickle", defaultUnlocked:true,
		challengeTitle:"Nakládaný chaos", challengeShortDesc:"Kyselá okurka je odemčena v arzenálu.",
		challengeLongDesc:"Střílí kyselé okurky, které skládají až tři stacky Přejedení a zvyšují zranitelnost cíle.",
		targetEnemies:[], maxCount:0, milestones:[{minPercent:0,tierLevel:4,spoiledName:"Kyselá okurka",spoiledTitle:"Projektil s Přejedením",spoiledDesc:"Střílí kyselé okurky. Kdo se jich přejí, zezelená, zeslábne a začne dostávat větší rány.",spoiledStatsHint:"Projectile • stacky • Přejedení",clueTag:"✅ Plně odemčeno ve zbrojnici!"}]
	},
	holywater: {
		id: "holywater",
		realName: "Kropenka se svěcenou vodou",
		realIcon: "✨",
		realType: "holy",
		defaultUnlocked: false,
		challengeTitle: "⛪ Posvěcení u svatého Jiří",
		challengeShortDesc: "Zažeň celkem 45 hrobových umrlců a pekelníků.",
		challengeLongDesc: "Posvěcená voda z kamenné křtitelnice v kostelíku pálí hříšné stíny a démony dvojnásobným žárem. Zažeň 45 umrlců, kostlivců a čertů, abys získal požehnání!",
		targetEnemies: [
			{
				id: "skeleton",
				name: "Kostlivec ze sv. Jiří",
				icon: "💀"
			},
			{
				id: "umrlec",
				name: "Rychtářův umrlec",
				icon: "⚰️"
			},
			{
				id: "pisar",
				name: "Panský písař",
				icon: "📜"
			},
			{
				id: "certik",
				name: "Čertík s měchem",
				icon: "😈"
			},
			{
				id: "drab",
				name: "Pekelný dráb",
				icon: "⛓️"
			},
			{
				id: "cert",
				name: "Pekelný Čert (Boss)",
				icon: "🔥"
			}
		],
		maxCount: 45,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÁ ZBRAŇ]",
				spoiledTitle: "Stříbrná nádobka s posvátnou vodou",
				spoiledDesc: "V kostelní sakristii stojí těžká kropenka s kapkami vody. Čeká na hrdinu, který očistí noční vesnici od temných mocností.",
				spoiledStatsHint: "Vlastnosti: Neznámé – svatá záře a kropení",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % umrlců a čertů pro stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "K _ _ _ _ _ k a   s e   s _ _ _ _ _ u   v _ _ _ u",
				spoiledTitle: "Mosazná kropenka z kapličky",
				spoiledDesc: "Kropenka kropí široký vějíř posvěcených kapek. Kostlivci a čerti před ní kvapně prchají, protože jim způsobuje dvojnásobné škody.",
				spoiledStatsHint: "Nápověda: Vějíř svatých kapek (2x poškození proti umrlcům a čertům)...",
				clueTag: "🔍 25 %: První stopa! Znáš svatou kropenku"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "Kropenka se svě...nou vodou",
				spoiledTitle: "Svatá záře proti silám pekelným",
				spoiledDesc: "Kropenka metá vějíř 5 kapek s poškozením 30. Proti kostlivcům, umrlcům i pekelníkům uděluje zničující dvojnásobný zásah!",
				spoiledStatsHint: "Základní poškození: 30 (60 proti nemrtvým/démonům) • 5 kapek",
				clueTag: "🔎 50 %: Znáš svatý vějíř i dvojnásobný účinek!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "Kropenka se svěcenou vodou (Téměř posvěceno!)",
				spoiledTitle: "Posvátná relikvie z kostelíka",
				spoiledDesc: "Farář právě dokončuje svěcení vody! Už zbývá jen několik zahnadých umrlců k tomu, aby byla kropenka zařazena do tvého arzenálu.",
				spoiledStatsHint: "Start: 30 dmg, 5 kapek, 2x holy dmg, zvuk kostelního zvonku",
				clueTag: "⚡ 75 %: Zvony vyzvánějí! Poslední krok k posvěcení!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Kropenka se svěcenou vodou",
				spoiledTitle: "Svěcená voda z kapličky svatého Jiří",
				spoiledDesc: "Svěcená voda z kapličky svatého Jiří. Kropí široký vějíř kapek a způsobuje dvojnásobný účinek na umrlce a čerty.",
				spoiledStatsHint: "Poškození: 30 (60 vs nemrtví/čerti) • Široký svatý vějíř kapek",
				clueTag: "✅ Plně odemčeno ve zbrojnici!"
			}
		]
	}
};
/**
* Calculates current unlock progress and spoil details for a weapon based on meta-progression
*/
function getWeaponProgress(id, meta) {
	const def = WEAPON_UNLOCKS[id];
	if (!def) return {
		id,
		isUnlocked: true,
		canUnlock: true,
		isQueued: false,
		curCount: 0,
		maxCount: 0,
		percent: 100,
		tier: 4,
		spoiledName: id,
		spoiledTitle: "",
		spoiledDesc: "",
		spoiledStatsHint: "",
		clueTag: "Odemčeno",
		realIcon: "⚔️",
		realType: "physical",
		enemiesBreakdown: []
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
			spoiledName: m.spoiledName,
			spoiledTitle: m.spoiledTitle,
			spoiledDesc: m.spoiledDesc,
			spoiledStatsHint: m.spoiledStatsHint,
			clueTag: m.clueTag,
			realIcon: def.realIcon,
			realType: def.realType,
			enemiesBreakdown: []
		};
	}
	if (isWeaponUnlocked(id, meta)) {
		const lastMilestone = def.milestones[def.milestones.length - 1] || def.milestones[0];
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
			spoiledTitle: lastMilestone.spoiledTitle,
			spoiledDesc: lastMilestone.spoiledDesc,
			spoiledStatsHint: lastMilestone.spoiledStatsHint,
			clueTag: "✅ Plně odemčeno ve zbrojnici!",
			realIcon: def.realIcon,
			realType: def.realType,
			enemiesBreakdown: def.targetEnemies.map((e) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: meta.weaponKillCounts?.[id]?.[e.id] ?? def.maxCount
			}))
		};
	}
	const prevId = getPreviousWeapon(id);
	if (!canWeaponUnlock(id, meta) && prevId) {
		const m0 = def.milestones[0];
		return {
			id,
			isUnlocked: false,
			canUnlock: false,
			isQueued: true,
			requiredWeaponName: "Předchozí zbraň",
			curCount: 0,
			maxCount: def.maxCount,
			percent: 0,
			tier: 0,
			spoiledName: m0.spoiledName,
			spoiledTitle: m0.spoiledTitle,
			spoiledDesc: "Tato zbraň se začne odemykat teprve poté, co ukováte předchozí zbraň v pořadí.",
			spoiledStatsHint: m0.spoiledStatsHint,
			clueTag: "🔒 Čeká na odemčení předchozí zbraně",
			realIcon: def.realIcon,
			realType: def.realType,
			enemiesBreakdown: def.targetEnemies.map((e) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: 0
			}))
		};
	}
	const weaponKills = meta.weaponKillCounts?.[id] || (id === "pitchfork" ? meta.bestiaryKills || {} : {});
	let curCount = 0;
	const enemiesBreakdown = def.targetEnemies.map((e) => {
		const cnt = weaponKills[e.id] || 0;
		curCount += cnt;
		return {
			id: e.id,
			name: e.name,
			icon: e.icon,
			count: cnt
		};
	});
	const percent = Math.min(100, Math.floor(curCount / def.maxCount * 100));
	const isUnlocked = percent >= 100;
	let tier = 0;
	if (isUnlocked || percent >= 100) tier = 4;
	else if (percent >= 75) tier = 3;
	else if (percent >= 50) tier = 2;
	else if (percent >= 25) tier = 1;
	else tier = 0;
	const milestone = def.milestones.find((m) => m.tierLevel === tier) || def.milestones[0];
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
		spoiledTitle: milestone.spoiledTitle,
		spoiledDesc: milestone.spoiledDesc,
		spoiledStatsHint: milestone.spoiledStatsHint,
		clueTag: milestone.clueTag,
		realIcon: def.realIcon,
		realType: def.realType,
		enemiesBreakdown
	};
}

export { LOCKED_WEAPONS_ORDER, getPreviousWeapon, isWeaponUnlocked, canWeaponUnlock, getActiveUnlockingWeapon, WEAPON_UNLOCKS, getWeaponProgress };
