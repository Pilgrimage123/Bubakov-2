import type { GameLevelDef, GameLevelId } from '../types';
export type { GameLevelDef } from '../types';

var GAME_LEVELS: Record<GameLevelId, GameLevelDef> = {
	0: {
		id: 0,
		name: "1. Předjaří v Hrusicích – Denní tání",
		shortTitle: "Denní tání",
		subtitle: "Březnové slunce, tající kry a probouzející se havěť",
		theme: "spring_river",
		season: "spring",
		icon: "🌱",
		badge: "1. Úroveň",
		description: "Březnové tání probouzí Hrusice do slunného dne: nahoře se orá, na návsi je rušno a rybník praská. Zažeňte dotírající havěť a hejno mrazivých vran!",
		lore: "Březen, za kamna vlezem – ale za dne už hřeje jarní slunko! Pomozte sedlákům připravit pole, odežeňte skřítky od tajících vod a vykažte z kraje hejno mrazivých vran.",
		unlockRequirementText: "Výchozí začátečnická úroveň – ideální pro první krůčky",
		skyColor: "#D6EAF8",
		nightSkyColor: "#D6EAF8",
		groundColor: "#D0D3D4",
		ambientTint: "rgba(244, 208, 63, 0.05)",
		weatherEffect: "ice_drift",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"ice_floe",
			"granny_stove",
			"kaca"
		],
		arena: {
			id: "breznove_tani",
			name: "Březnové tání",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "blatouch",
			name: "🌼 Blatouchový skřítek",
			warning: "🌼 POZOR: Z ROZVODNĚNÉ MEZE VYBÍHÁ BLATOUCHOVÝ SKŘÍTEK!",
			time: 85,
			kills: 45,
			multiplier: 5.79
		},
		midBoss: {
			id: "vodnicek",
			name: "💧 Jarní Vodníček",
			warning: "💧 POZOR: Z TAJÍCÍCH KER VYSTUPUJE JARNÍ VODNÍČEK!",
			time: 185,
			kills: 120,
			multiplier: 5.49
		},
		finalBoss: {
			id: "vrana",
			name: "🐦‍⬛ Hejno mrazivých vran",
			warning: "🐦‍⬛ NEBE ZTEMNĚLO! NAD POLEMI KROUŽÍ HEJNO MRAZIVÝCH VRAN! 🐦‍⬛",
			time: 300,
			kills: 220,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"mrazovy_skritek",
				"mysak",
				"sotek",
				"blatouch",
				"tajici_snehulak",
				"jezinka_mraziva",
				"vrana"
			],
			afternoon: [
				"blatouch",
				"sotek",
				"jezinka_mraziva",
				"mysak",
				"tajici_snehulak",
				"vrana"
			]
		},
		keyEnemies: [
			{
				id: "blatouch",
				name: "Blatouchový skřítek",
				icon: "🌼",
				role: "Rychlý jarní skřítek z mokřin a mezí"
			},
			{
				id: "vodnicek",
				name: "Jarní Vodníček",
				icon: "💧",
				role: "Zákeřný vodní tvor číhající v tajícím rybníku"
			},
			{
				id: "vrana",
				name: "Hejno mrazivých vran",
				icon: "🐦‍⬛",
				role: "Rychlá kroužící formace vran bránící jarnímu tání"
			}
		],
		bossMechanic: {
			label: "🐦‍⬛ Vzdušný nálet",
			description: "Hejno mrazivých vran krouží v sevřené formaci vysokou rychlostí a podniká střemhlavé útoky na lovce.",
			cadenceSeconds: 5
		}
	},
	1: {
		id: 1,
		name: "2. Předjaří v Hrusicích – Noční mrazy",
		shortTitle: "Noční mrazy",
		subtitle: "Mrazivá noc, tající sněhuláci a ledový dech Morany",
		theme: "spring_river",
		season: "spring",
		icon: "❄️",
		badge: "2. Úroveň",
		isNightLevel: true,
		description: "Se západem slunce udeřil do Hrusic krutý mráz. Závěje ožívají tajícími sněhuláky a z mrazivé mlhy přichází samotná Morana.",
		lore: "Noc v předjaří bývá zrádná – sotva sníh roztaje, mráz zpevní zemi v kámen. Zažeňte noční běsy a pošlete Moranu tam, kam patří!",
		unlockRequirementText: "Odemkne se pokořením Hejna mrazivých vran v 1. úrovni",
		skyColor: "#283446",
		nightSkyColor: "#171D28",
		groundColor: "#BAC3C9",
		ambientTint: "rgba(30, 45, 75, 0.4)",
		weatherEffect: "snow",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"ice_floe",
			"granny_stove",
			"kaca"
		],
		arena: {
			id: "breznove_tani",
			name: "Březnové tání",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "tajici_snehulak",
			name: "⛄ Horda tajících sněhuláků",
			warning: "⛄ POZOR: ZE ZÁVĚJÍ SE VALÍ HORDA TAJÍCÍCH SNĚHULÁKŮ!",
			time: 85,
			kills: 50,
			multiplier: 2.64
		},
		midBoss: {
			id: "mrazivy_obr",
			name: "❄️ Mrazivý obr",
			warning: "❄️ POZOR: ZE ZAMRZLÝCH POLÍ VYSTUPUJE MRAZIVÝ OBR!",
			time: 185,
			kills: 130,
			multiplier: 1.17
		},
		finalBoss: {
			id: "morana",
			name: "❄️ Morana — špatně vynesená smrtka",
			warning: "❄️ ZIMU NELZE VYNÉST! MORANA SE VRACÍ Z MRÁZŮ! ❄️",
			time: 300,
			kills: 240,
			multiplier: 1.31
		},
		spawnPools: {
			dusk: [
				"mrazovy_skritek",
				"tajici_snehulak",
				"jezinka_mraziva",
				"blatouch",
				"vrana"
			],
			night: [
				"mrazovy_skritek",
				"tajici_snehulak",
				"jezinka_mraziva",
				"bludicka",
				"mrazivy_obr",
				"kostlivec",
				"umrlec",
				"bubak",
				"hejkal",
				"ohnivy_muz",
				"ohniva_kobyla",
				"vrana"
			],
			midnight: [
				"mrazovy_skritek",
				"bludicka",
				"jezinka_mraziva",
				"vrana"
			],
			dawn: [
				"mrazovy_skritek",
				"bludicka",
				"jezinka_mraziva",
				"tajici_snehulak",
				"mrazivy_obr",
				"ohnivy_muz",
				"ohniva_kobyla",
				"vrana"
			]
		},
		keyEnemies: [
			{
				id: "jezinka_mraziva",
				name: "Mrazivá jezinka",
				icon: "🧙‍♀️",
				role: "Pomalá, silná a poloprůhledná ledová lovkyně"
			},
			{
				id: "tajici_snehulak",
				name: "Tající sněhulák",
				icon: "⛄",
				role: "Horda 40 tajících sněhuláků zanechávajících louže"
			},
			{
				id: "mrazivy_obr",
				name: "Mrazivý obr",
				icon: "❄️",
				role: "Obrovský ledový kolos z mrazivých polí"
			},
			{
				id: "morana",
				name: "Morana, špatně vynesená smrtka",
				icon: "❄️",
				role: "Vrcholný boss kraje"
			}
		],
		bossMechanic: {
			label: "❄️ Moraniny větrné čepele",
			description: "Morana z dálky žene na lovce větrné čepele plné ledu. Při polovině zdraví přivolá vánici a vypouští hustší salvy.",
			cadenceSeconds: 6
		}
	},
	2: {
		id: 2,
		name: "3. Duben v Hrusicích – Dubnový den",
		shortTitle: "Dubnový den",
		subtitle: "Aprílové slunce, rozkvetlé meze a veselé jarní rejdy",
		theme: "spring_village",
		season: "spring",
		icon: "🌸",
		badge: "3. Úroveň",
		description: "Aprílové slunce prohřívá hrusické meze a zahrady. Z rozkvetlých luk vylézají jarní diblíci, koledníci spěchají s pomlázkami a vzduchem krouží první čarodějnice!",
		lore: "Březen, za kamna vlezem; duben, ještě tam budem – ale venku už voní kvetoucí stromy a peče se velikonoční beránek! Udržte pořádek na návsi, zažeňte zlomyslné aprílové skřítky a vykažte z kraje hrusické čarodějnice.",
		unlockRequirementText: "Odemkne se pokořením Morany ve 2. úrovni (Noční mrazy)",
		skyColor: "#BEE3F8",
		nightSkyColor: "#2A3D54",
		groundColor: "#A8D08D",
		ambientTint: "rgba(255, 235, 150, 0.06)",
		weatherEffect: "petals",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"kaca"
		],
		arena: {
			id: "dubnova_naves",
			name: "Dubnová náves",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "orchard", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "beranek",
			name: "🐑 Obří kolednický beránek",
			warning: "🐑 POZOR: Z ROZPÁLENÉ PECE VYSKOČIL OBŘÍ KOLEDNICKÝ BERÁNEK! 🐑",
			time: 85,
			kills: 50,
			multiplier: 1.35
		},
		midBoss: {
			id: "carodejnice_stara",
			name: "🧹 Stará ježibaba z Melechu",
			warning: "🧹 POZOR: ZE STRNIŠTĚ VZLÉTLI ČARODĚJNICKÉ VÍRY SE STAROU JEŽIBABOU! 🧹",
			time: 185,
			kills: 130,
			multiplier: 1.33
		},
		finalBoss: {
			id: "vrchni_carodejnice",
			name: "🧹 Vrchní Filipojakubská Čarodějnice",
			warning: "🧹 NEBE ZAPLÁLO! NAD HRUSICEMI KROUŽÍ VRCHNÍ FILIPOJAKUBSKÁ ČARODĚJNICE! 🧹",
			time: 300,
			kills: 240,
			multiplier: 1.31
		},
		spawnPools: {
			noon: [
				"blatouch",
				"zaba",
				"zkazena_kraslice",
				"rehtackar",
				"mysak",
				"sotek",
				"rarach",
				"drab",
				"carodejnice_koste"
			],
			afternoon: [
				"blatouch",
				"zaba",
				"zkazena_kraslice",
				"carodejnice_koste",
				"rehtackar",
				"divozenka",
				"ropucha",
				"jiskrivec",
				"rarach",
				"drab"
			]
		},
		keyEnemies: [
			{
				id: "zkazena_kraslice",
				name: "Zkažená kraslice",
				icon: "🥚",
				role: "Výbušné velikonoční vejce působící řetězové exploze"
			},
			{
				id: "carodejnice_koste",
				name: "Čarodějnice na koštěti",
				icon: "🧹",
				role: "Rychlá létající útočnice se střemhlavými nálety a uřknutím"
			},
			{
				id: "rehtackar",
				name: "Koledník s řehtačkou",
				icon: "🪓",
				role: "Podpůrný rychlík povzbuzující havěť klapáním"
			},
			{
				id: "vrchni_carodejnice",
				name: "Vrchní Filipojakubská Čarodějnice",
				icon: "🧙‍♀️",
				role: "Vrcholný boss kraje vládnoucí vichřici a ohňům"
			}
		],
		bossMechanic: {
			label: "🧹 Filipojakubská vichřice a ohnivé koště",
			description: "Vrchní Čarodějnice krouží nad návsí, metá hořící smolné věnce a vyvolává větrné víry rozmetající zkažené kraslice.",
			cadenceSeconds: 6
		}
	},
	3: {
		id: 3,
		name: "4. Duben v Hrusicích – Dubnová noc",
		shortTitle: "Dubnová noc",
		subtitle: "Filipojakubská noc, plápolající hranice, svítící čerti a reje čarodějnic",
		theme: "spring_village",
		season: "spring",
		icon: "🔥",
		badge: "4. Úroveň",
		isNightLevel: true,
		description: "Lidé se zamkli v chalupách a na hrusické návsi vzplála filipojakubská vatra. Ve tmě září oči kostlivců, smečky černých psů i celí čerti a nad březovým hájem krouží noční sabat!",
		lore: "Na Filipa a Jakuba čarodějnice létat troufá! Udržte ochranný oheň u májky, odrážejte hejna bludiček a vykažte z návsi Filipojakubský sabat.",
		unlockRequirementText: "Odemkne se pokořením Vrchní Filipojakubské Čarodějnice ve 3. úrovni",
		skyColor: "#241E30",
		nightSkyColor: "#14111D",
		groundColor: "#2E352B",
		ambientTint: "rgba(38, 28, 48, 0.45)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "dubnova_naves",
			name: "Dubnová náves v noci",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "orchard", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "klekanice",
			name: "🔔 Večerní Klekánice",
			warning: "🔔 POZOR: ZVONÍ KLEKÁNÍ A PŘICHÁZÍ DĚSIVÁ KLEKÁNICE! 🔔",
			time: 85,
			kills: 55,
			multiplier: 2.21
		},
		midBoss: {
			id: "drab",
			name: "⛓️ Pekelný dráb s karabáčem",
			warning: "⛓️ POZOR: PŘICHÁZÍ OBŘÍ PEKELNÝ DRÁB S ŘETĚZY! ⛓️",
			time: 185,
			kills: 125,
			multiplier: 2.51
		},
		finalBoss: {
			id: "vrchni_carodejnice",
			name: "🧹 Filipojakubský sabat čarodějnic",
			warning: "🧹 VATRA VZPLÁLA! NAD NÁVSÍ KROUŽÍ FILIPOJAKUBSKÝ SABAT ČARODĚJNIC! 🧹",
			time: 300,
			kills: 230,
			multiplier: 1.48
		},
		spawnPools: {
			noon: [
				"skeleton",
				"cerny_pes",
				"carodejnice_koste",
				"rarach",
				"certik",
				"drab"
			],
			afternoon: [
				"hrobnik",
				"pisar",
				"skeleton_scythe",
				"cerny_pes",
				"carodejnice_koste",
				"sazovy_rarach",
				"drab"
			],
			dusk: [
				"carodejnice_koste",
				"skeleton",
				"skeleton_scythe",
				"cerny_pes",
				"umrlec",
				"rarach",
				"certik",
				"klekanice",
				"ohnivy_muz"
			],
			night: [
				"carodejnice_koste",
				"bubak",
				"krvavy_kostlivec",
				"umrlec",
				"cerny_pes",
				"sazovy_rarach",
				"certik",
				"bludicka",
				"jiskrivec",
				"ohnivy_muz",
				"ohniva_kobyla"
			],
			midnight: [
				"carodejnice_koste",
				"bubak",
				"krvavy_kostlivec",
				"skeleton_scythe",
				"cerny_pes",
				"pisar",
				"sazovy_rarach",
				"bludicka",
				"jiskrivec",
				"hejkal",
				"ohnivy_muz",
				"ohniva_kobyla"
			],
			dawn: [
				"carodejnice_koste",
				"bubak",
				"krvavy_kostlivec",
				"skeleton_scythe",
				"cerny_pes",
				"sazovy_rarach",
				"bludicka",
				"jiskrivec",
				"certik",
				"ohnivy_muz",
				"ohniva_kobyla"
			]
		},
		keyEnemies: [
			{
				id: "carodejnice_koste",
				name: "Čarodějnice na koštěti",
				icon: "🧹",
				role: "Noční nálety nad filipojakubskou vatrou"
			},
			{
				id: "ohniva_kobyla",
				name: "Ohnivá kobyla a Ohnivý muž",
				icon: "🐎",
				role: "Pekelný trysk zanechávající sirné plameny pálící lovce i bubáky"
			},
			{
				id: "cerny_pes",
				name: "Smečka černých psů",
				icon: "🐕",
				role: "Rychlá noční smečka se žhnoucíma očima"
			},
			{
				id: "certik",
				name: "Svítící čertík a rarášek",
				icon: "😈",
				role: "Pekelná cháska zářící ve tmě"
			},
			{
				id: "vrchni_carodejnice",
				name: "Filipojakubský sabat čarodějnic",
				icon: "🧙‍♀️",
				role: "Hlavní boss filipojakubské půlnoci"
			}
		],
		bossMechanic: {
			label: "🔥 Filipojakubský sabat a ohnivé věnce",
			description: "Vrchní čarodějnice vede půlnoční sabat nad vatrou, metá smolné ohnivé věnce a přivolává smečky černých psů i čertíky.",
			cadenceSeconds: 6
		}
	},
	4: {
		id: 4,
		name: "5. Květen v Hrusicích – Májová slavnost",
		shortTitle: "Májová slavnost",
		subtitle: "Rozkvetlé meze, májový deštík a Ledoví muži",
		theme: "spring_village",
		season: "spring",
		icon: "🌸",
		badge: "5. Úroveň",
		description: "Májová náves s vysokou májkou ožívá tancem a zpěvem. V potoce se koupou chlapci, na lukách znějí pastýřské píšťaly a vzduchem bzučí hejna chroustů. Do kraje však míří nečekaný chlad Ledových mužů!",
		lore: "V máji nemá pastýřovi oschnout hůl a do svatého Ducha nesvlíkej kožucha! Užijte si kvetoucí stromy a chraňte jarní květy před námrazou a hrozbou tří Ledových mužů.",
		unlockRequirementText: "Odemkne se po přežití Dubnové noci ve 4. úrovni",
		skyColor: "#CBE8FA",
		nightSkyColor: "#2A405A",
		groundColor: "#A3D48B",
		ambientTint: "rgba(255, 230, 160, 0.08)",
		weatherEffect: "petals",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"kaca"
		],
		arena: {
			id: "kvetnova_naves",
			name: "Májové Hrusice",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "carodejnice_zaspalka",
			name: "🧹 Čarodějnice Zaspalka",
			warning: "🧹 POZOR: ZAPOMENUTÁ FILIPOJAKUBSKÁ ČARODĚJNICE ZASPALKA VYRÁŽÍ DO NÁLETU! 🧹",
			time: 85,
			kills: 50,
			multiplier: 0.92
		},
		midBoss: {
			id: "hastrman",
			name: "💧 Bahenní hastrman z Brčálníku",
			warning: "💧 POZOR: Z VYHŘÁTÉHO RYBNÍKA VYSTUPUJE BAHENNÍ HASTRMAN S HRNEČKY! 💧",
			time: 185,
			kills: 130,
			multiplier: 6.10
		},
		finalBoss: {
			id: "ledovi_muzi",
			name: "🧊 Ledoví Muži (Pankrác, Servác a Bonifác)",
			warning: "🧊 POZOR: KVĚTNOVÝ MRÁZ! NA NÁVES PŘICHÁZEJÍ LEDOVÍ MUŽI V KOŽUŠÍCH! 🧊",
			time: 300,
			kills: 250,
			multiplier: 0.84
		},
		spawnPools: {
			noon: [
				"chroust",
				"pampeliska_chmyri",
				"zaba",
				"blatouch",
				"mysak",
				"sotek",
				"vodnicek",
				"drevorubec"
			],
			afternoon: [
				"chroust",
				"pampeliska_chmyri",
				"vodnicek",
				"hastrman",
				"ropucha",
				"topivec",
				"blatouch"
			]
		},
		keyEnemies: [
			{
				id: "chroust",
				name: "Chroust obecný",
				icon: "🪲",
				role: "Bzučící hmyzí nepřítel ve vestičce se sinusovým letem"
			},
			{
				id: "pampeliska_chmyri",
				name: "Pampeliškové chmýří",
				icon: "🌼",
				role: "Usměvavé chmýří unášené větrem, které se při zásahu štěpí"
			},
			{
				id: "hastrman",
				name: "Bahenní hastrman",
				icon: "💧",
				role: "Záludný vládce rybníka Brčálníku vrhající leknínové bahno"
			},
			{
				id: "carodejnice_zaspalka",
				name: "Čarodějnice Zaspalka",
				icon: "🧹",
				role: "Nevyspalá čarodějnice na oštípaném březovém koštěti"
			},
			{
				id: "ledovi_muzi",
				name: "Ledoví muži",
				icon: "🧊",
				role: "Trio vousatých dědků v těžkých kožiších přinášejících náhlý květnový mráz"
			}
		],
		bossMechanic: {
			label: "🧊 Květnový mráz a trio Ledových mužů",
			description: "Trio obíhá lovce a pokrývá jarní zem ledovou jinovatkou. Pankrác vrhá rampouchy, Servác krupobití a Bonifác zmrazuje drahokamy.",
			cadenceSeconds: 6
		}
	},
	5: {
		id: 5,
		name: "6. Květen v Hrusicích – Májová noc",
		shortTitle: "Májová noc",
		subtitle: "Svatojánské mušky u Nepomuckého, ztichlá májka a Půlnoční Hejkal v hvozdu",
		theme: "spring_village",
		season: "spring",
		icon: "🌲",
		badge: "6. Úroveň",
		isNightLevel: true,
		description: "Na májové Hrusice padla voňavá hvězdnatá noc. Pastýř i tanečníci zalezli do chalup, u sochy sv. Jana Nepomuckého tančí svatojánské mušky, ale z mlýnského náhonu a tmavého hvozdu se plíží noční běsi a Půlnoční Hejkal!",
		lore: "Když utichne májová muzika a rozsvítí se okna chalup, probouzí se lesní říše. Nepřibližujte se k lesu bez světla, zažeňte Prokletého Mlynáře od stavidel a utkejte se s Půlnočním Hejkalem!",
		unlockRequirementText: "Odemkne se po poražení Ledových mužů v 5. úrovni",
		skyColor: "#1E2F38",
		nightSkyColor: "#0F1A22",
		groundColor: "#253B2C",
		ambientTint: "rgba(20, 42, 38, 0.45)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "kvetnova_naves",
			name: "Májové Hrusice v noci",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "zbojnik",
			name: "🗡️ Zbojník z hamrů a smečka",
			warning: "🗡️ ZE STÍNŮ LESA VYRÁŽÍ OBÁVANÝ HEJTMAN ZBOJNÍK SE SMEČKOU!",
			time: 85,
			kills: 80,
			multiplier: 3.54
		},
		midBoss: {
			id: "mlynar",
			name: "🌊 Prokletý Mlynář z nočního náhonu",
			warning: "🌊 POZOR: PROKLETÝ MLYNÁŘ OTEVÍRÁ NOČNÍ STAVIDLA!",
			time: 185,
			kills: 170,
			multiplier: 0.48
		},
		finalBoss: {
			id: "hejkal",
			name: "🌲 Půlnoční Hejkal z hvozdů",
			warning: "🌲 HVOZD ZAŘVAL! Z TEMNÉHO LESA VYCHÁZÍ PŮLNOČNÍ HEJKAL! 🌲",
			time: 300,
			kills: 300,
			multiplier: 0.65
		},
		spawnPools: {
			noon: [
				"zbojnik",
				"jiskrivec",
				"sazovy_rarach",
				"divozenka",
				"mysak",
				"drevorubec",
				"chroust"
			],
			afternoon: [
				"zbojnik",
				"jiskrivec",
				"ohnivy_pes",
				"drevorubec",
				"mysak",
				"chroust"
			],
			dusk: [
				"drevorubec",
				"divozenka",
				"skodnik",
				"cerny_pes",
				"kostlivec",
				"bubak",
				"certik",
				"zbojnik",
				"ohnivy_muz",
				"chroust"
			],
			night: [
				"hejkal",
				"drevorubec",
				"stodolnik",
				"nocni_mura",
				"cerny_pes",
				"umrlec",
				"bludicka",
				"jiskrivec",
				"ohnivy_muz",
				"ohnivy_pes",
				"ohniva_kobyla",
				"chroust"
			],
			midnight: [
				"hejkal",
				"nocni_mura",
				"stodolnik",
				"umrlec",
				"krvavy_kostlivec",
				"cerny_pes",
				"ohnivy_muz",
				"ohniva_kobyla",
				"sazovy_rarach",
				"bludicka",
				"jiskrivec",
				"mysak",
				"chroust"
			],
			dawn: [
				"hejkal",
				"nocni_mura",
				"stodolnik",
				"umrlec",
				"cerny_pes",
				"ohnivy_muz",
				"ohniva_kobyla",
				"bludicka",
				"jiskrivec",
				"zbojnik",
				"mysak",
				"chroust"
			]
		},
		keyEnemies: [
			{
				id: "hejkal",
				name: "Půlnoční Hejkal",
				icon: "🌲",
				role: "Hlavní boss májového hvozdu s hromovým zahejkáním"
			},
			{
				id: "mlynar",
				name: "Prokletý Mlynář",
				icon: "🌊",
				role: "Mezi-boss z nočního mlýnského náhonu"
			},
			{
				id: "ohniva_kobyla",
				name: "Ohnivá kobyla",
				icon: "🐎",
				role: "Bleskový trysk se sirnými plameny pálícími lovce i bubáky"
			},
			{
				id: "bludicka",
				name: "Rej bludiček a jiskřivců",
				icon: "✨",
				role: "Barevná kroužící hejna světýlek ve tmě"
			},
			{
				id: "nocni_mura",
				name: "Noční můra a Stodolník",
				icon: "🦇",
				role: "Temné přízraky se svítícíma očima"
			}
		],
		bossMechanic: {
			label: "🌲 Hromové zahejkání a noční stavidla",
			description: "Půlnoční Hejkal otřásá májovým hvozdem, vrhá salvy větví a přivolává lesní smečky, zatímco od mlýna hrozí noční přívaly.",
			cadenceSeconds: 10
		}
	},
	6: {
		id: 6,
		name: "7. Červen v Hrusicích – Senoseč a pekelný žár",
		shortTitle: "Letní senoseč",
		subtitle: "Zlaté louky, vůně sena, tůně na racích a polední žár",
		theme: "summer_harvest",
		season: "summer",
		icon: "🌾",
		badge: "7. Úroveň",
		description: "Červnové slunce zalévá hrusické louky zlatým žárem. Sedláci svážejí voňavé seno na žebřiňáky a v tůních pod vrbami se loví raci. S poledním úžehem však přicházejí rohatí pekelníci a Královská Polednice!",
		lore: "Na svatého Antonína kvete žito i malina, ale v pekelném poledním žáru seče trávu i duše rohatý pekelník s planoucí kosou. Chraňte žence a vykažte z lánů sluneční běsy!",
		unlockRequirementText: "Odemkne se po poražení Půlnočního Hejkala a Prokletého Mlynáře v 6. úrovni",
		skyColor: "#FDEBD0",
		nightSkyColor: "#1B2631",
		groundColor: "#E59866",
		ambientTint: "rgba(243, 156, 18, 0.08)",
		weatherEffect: "petals",
		decorTypes: [
			"cottage",
			"tree",
			"haystack",
			"rock",
			"kaca"
		],
		arena: {
			id: "cervnova_senosec",
			name: "Červnové Hrusice",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "kralovsky_vele_rak",
			name: "🦞 Královský Vele-rak z tůně",
			warning: "🦞 POZOR: Z HLUBOKÉ TŮNĚ VYSTUPUJE OBRNĚNÝ KRÁLOVSKÝ VELE-RAK!",
			time: 85,
			kills: 90,
			multiplier: 0.92
		},
		midBoss: {
			id: "cert_sekac",
			name: "😈 Pekelný čert sekáč",
			warning: "😈 POZOR: Z HOŘÍCÍHO STRNIŠTĚ VYCHÁZÍ PEKELNÝ ČERT S PLANOUCÍ KOSOU!",
			time: 185,
			kills: 210,
			multiplier: 0.97
		},
		finalBoss: {
			id: "kralovska_polednice",
			name: "👑 Královská Polednice z rozpálených lánů",
			warning: "👑 NEBE VZPLANULO ŽÁREM! PŘICHÁZÍ KRÁLOVSKÁ POLEDNICE S POLNÍ BOUŘÍ! 👑",
			time: 300,
			kills: 350,
			multiplier: 1.01
		},
		spawnPools: {
			noon: [
				"mysak",
				"roj_polnich_mysaku",
				"rak_ricni",
				"boruvkovy_diblik",
				"certik",
				"rarach",
				"cert_sekac",
				"srpnove_cmelak"
			],
			afternoon: [
				"roj_polnich_mysaku",
				"pekelny_roj_sazovniku",
				"rak_ricni",
				"polednice",
				"cert_sekac",
				"pekelny_cert",
				"boruvkovy_diblik"
			],
			dusk: [
				"pekelny_roj_sazovniku",
				"drab",
				"pekelny_drab",
				"polednice",
				"cert_sekac",
				"cerny_pes"
			],
			night: [
				"pekelny_roj_sazovniku",
				"drab",
				"cert_sekac",
				"polednice",
				"cerny_vlkodlak"
			],
			midnight: [
				"cert_sekac",
				"drab",
				"pekelny_roj_sazovniku",
				"cerny_vlkodlak",
				"cerny_pes"
			],
			dawn: [
				"mysak",
				"roj_polnich_mysaku",
				"rak_ricni",
				"boruvkovy_diblik",
				"certik",
				"rarach",
				"cert_sekac",
				"srpnove_cmelak"
			]
		},
		keyEnemies: [
			{
				id: "rak_ricni",
				name: "Říční rak klepetáč",
				icon: "🦞",
				role: "Obrněný korýš z tůně"
			},
			{
				id: "roj_polnich_mysaku",
				name: "Roj polních myšáků",
				icon: "🐁",
				role: "Bleskové polní hejno"
			},
			{
				id: "pekelny_roj_sazovniku",
				name: "Pekelný roj sazovníků",
				icon: "🔥",
				role: "Jiskřící pekelné hejno"
			},
			{
				id: "cert_sekac",
				name: "Pekelný čert sekáč",
				icon: "😈",
				role: "Pekelný sekáč s kosou"
			},
			{
				id: "kralovska_polednice",
				name: "Královská Polednice",
				icon: "👑",
				role: "Vládkyně poledního úžehu"
			}
		],
		bossMechanic: {
			label: "Sluneční úžeh a planoucí strniště",
			description: "Spalující žár poledního slunce střídají výšlehy plamenů z posekaného sena a letní hromy.",
			cadenceSeconds: 8
		}
	},
	7: {
		id: 7,
		name: "8. Červen v Hrusicích – Červnová noc",
		shortTitle: "Červnová noc",
		subtitle: "Svatojánská noc, zlaté kapradí, bludičky v rákosí a poklad v zemi",
		theme: "summer_harvest",
		season: "summer",
		icon: "🌿",
		badge: "8. Úroveň",
		isNightLevel: true,
		description: "Na vyhřáté hrusické louky padla čarovná Svatojánská noc! V rákosí u rybníka tančí bludičky, mezemi bloudí Ohnivý sudlička a kdo nasbírá devatero svatojánských bylin, tomu v hvozdu rozkvete Zlaté kapradí a otevře Poklad v zemi!",
		lore: "Jen jednou v roce, o svatojánské půlnoci, se otevírají skály a poklady v zemi. Nasbírej po loukách a u tůní devatero čarovných bylin, nedej se svést zpěvem Rusalky a přemož Svatojánského Vládce Hvozdu!",
		unlockRequirementText: "Odemkne se po poražení Královské Polednice v 7. úrovni",
		skyColor: "#1E293B",
		nightSkyColor: "#0B1120",
		groundColor: "#2C4230",
		ambientTint: "rgba(30, 58, 138, 0.42)",
		weatherEffect: "fireflies",
		decorTypes: [
			"cottage",
			"tree",
			"haystack",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "cervnova_senosec",
			name: "Červnové Hrusice v noci",
			layout: "asymmetric_poi",
			poiOrder: [
				"fields",
				"church",
				"tavern",
				"village",
				"school",
				"pond",
				"mill",
				"forest",
				"shrine"
			]
		},
		miniBoss: {
			id: "rusalka",
			name: "🌊 Rusalka z hluboké tůně",
			warning: "🌊 POZOR: Z MĚSÍČNÍ TŮNĚ VYSTUPUJE VÁBIVÁ RUSALKA!",
			time: 85,
			kills: 90,
			multiplier: 1.05
		},
		midBoss: {
			id: "ohnivy_sudlicka",
			name: "🔥 Ohnivý sudlička z mezí",
			warning: "🔥 POZOR: PO NOČNÍCH MEZÍCH SE ŽENE OHNIVÝ SUDLIČKA SE ŽHAVOU SUDLICÍ!",
			time: 185,
			kills: 210,
			multiplier: 1.12
		},
		finalBoss: {
			id: "svatojansky_vladce",
			name: "🌿 Svatojánský Vládce Hvozdu s Pokladem",
			warning: "🌿 ZLATÉ KAPRADÍ ROZKVETLO! PŘICHÁZÍ SVATOJÁNSKÝ VLÁDCE HVOZDU S POKLADEM! 🌿",
			time: 300,
			kills: 350,
			multiplier: 1.18
		},
		spawnPools: {
			noon: [
				"bludicka",
				"rak_ricni",
				"boruvkovy_diblik",
				"roj_polnich_mysaku",
				"divozenka",
				"cert_sekac",
				"pekelny_roj_sazovniku"
			],
			afternoon: [
				"bludicka",
				"divozenka",
				"jiskrivec",
				"kalny_hastrman",
				"certik",
				"cert_sekac",
				"pekelny_roj_sazovniku"
			],
			dusk: [
				"bludicka",
				"divozenka",
				"jiskrivec",
				"rak_ricni",
				"boruvkovy_diblik",
				"certik",
				"ohnivy_muz",
				"cert_sekac",
				"pekelny_roj_sazovniku"
			],
			night: [
				"bludicka",
				"divozenka",
				"rusalka",
				"ohnivy_sudlicka",
				"ohnivy_muz",
				"ohniva_kobyla",
				"pekelny_roj_sazovniku",
				"kalny_hastrman",
				"nocni_mura",
				"cerny_vlkodlak",
				"hejkal"
			],
			midnight: [
				"ohnivy_sudlicka",
				"rusalka",
				"ohnivy_muz",
				"ohniva_kobyla",
				"pekelny_roj_sazovniku",
				"cert_sekac",
				"nocni_mura",
				"cerny_vlkodlak",
				"hejkal",
				"klekanice",
				"bludicka"
			],
			dawn: [
				"ohnivy_sudlicka",
				"rusalka",
				"ohnivy_muz",
				"ohniva_kobyla",
				"pekelny_roj_sazovniku",
				"cert_sekac",
				"nocni_mura",
				"cerny_vlkodlak",
				"bludicka"
			]
		},
		keyEnemies: [
			{
				id: "rusalka",
				name: "Rusalka z tůně",
				icon: "🌊",
				role: "Vábivá vodní víla"
			},
			{
				id: "ohnivy_sudlicka",
				name: "Ohnivý sudlička",
				icon: "🔥",
				role: "Planoucí přízrak z mezí"
			},
			{
				id: "svatojansky_vladce",
				name: "Svatojánský Vládce Hvozdu",
				icon: "🌿",
				role: "Strážce zlatého kapradí a pokladu"
			}
		],
		bossMechanic: {
			label: "Svatojánské byliny a Zlaté kapradí",
			description: "Sbírej po aréně devatero svatojánských bylin, odemkni Poklad v zemi u hvozdu a získej Svatojánskou záři!",
			cadenceSeconds: 9
		}
	},
	8: {
		id: 8,
		name: "9. Červenec v Hrusicích – Žně na sv. Markétu a poutní veselice",
		shortTitle: "Červencové žně",
		subtitle: "Zlaté lány žita, panáci ze snopů, ženci se srpy a poutní střelnice na návsi",
		theme: "summer_harvest",
		season: "summer",
		icon: "🌾",
		badge: "9. Úroveň",
		description: "Na svatou Markétu hodila srp do žita! Hrusická pole zlátla pod červencovým sluncem, sedláci stavějí panáky ze snopů a na návsi vyhrává poutní střelnice s papírovými růžemi. Z obilí však vylézají polní křečci, Žitné báby a Pouťový Hromotluk!",
		lore: "O červencových žních praská země horkem a každá ruka se ohání srpem. Zastřílej si na poutní střelnici pro ostrou mušku, kryj se za panáky žita a vyžeň ze strniště Krále křečků Obilníka, Žitnou matku i Pouťového Hromotluka!",
		unlockRequirementText: "Odemkne se po poražení Svatojánského Vládce Hvozdu v 8. úrovni",
		skyColor: "#FEF3C7",
		nightSkyColor: "#1E293B",
		groundColor: "#D97706",
		ambientTint: "rgba(245, 158, 11, 0.09)",
		weatherEffect: "petals",
		decorTypes: [
			"cottage",
			"tree",
			"haystack",
			"rock",
			"kaca"
		],
		arena: {
			id: "cervencove_zne",
			name: "Červencové žně",
			layout: "asymmetric_poi",
			poiOrder: [
				"fields",
				"church",
				"tavern",
				"village",
				"school",
				"pond",
				"mill",
				"forest",
				"shrine"
			]
		},
		miniBoss: {
			id: "krecek_obilnik",
			name: "🐹 Král polních křečků Obilník",
			warning: "🐹 POZOR: Z OBILNÉ NORY VYLÉZÁ KRÁL POLNÍCH KŘEČKŮ OBILNÍK!",
			time: 85,
			kills: 95,
			multiplier: 1.0
		},
		midBoss: {
			id: "zitna_matka",
			name: "🌾 Žitná matka se zlatým srpem",
			warning: "🌾 POZOR: ZE ZRALÉHO ŽITA POVSTÁVÁ ŽITNÁ MATKA SE ZLATÝM SRPEM!",
			time: 185,
			kills: 225,
			multiplier: 1.0
		},
		finalBoss: {
			id: "hromotluk_marketa",
			name: "🎯 Pouťový Hromotluk od sv. Markéty",
			warning: "🎯 POUŤ SE ZVRHLA! PŘICHÁZÍ HŘMOTNÝ POUŤOVÝ HROMOTLUK S CEPEM A TERČI! 🎯",
			time: 300,
			kills: 375,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"polni_krecek",
				"roj_polnich_mysaku",
				"zitna_baba",
				"boruvkovy_diblik",
				"rak_ricni",
				"sotek",
				"cert_sekac",
				"srpnove_cmelak"
			],
			afternoon: [
				"polni_krecek",
				"zitna_baba",
				"polednice",
				"roj_polnich_mysaku",
				"cert_sekac",
				"pekelny_roj_sazovniku"
			],
			dusk: [
				"zitna_baba",
				"polni_krecek",
				"polednice",
				"cert_sekac",
				"drab",
				"zbojnik",
				"polni_mysice",
				"srpnove_cmelak"
			],
			night: [
				"zitna_baba",
				"cert_sekac",
				"drab",
				"polednice",
				"zbojnik",
				"polni_mysice",
				"srpnove_cmelak"
			],
			midnight: [
				"zitna_baba",
				"cert_sekac",
				"drab",
				"zbojnik",
				"polni_mysice",
				"srpnove_cmelak"
			],
			dawn: [
				"polni_krecek",
				"roj_polnich_mysaku",
				"zitna_baba",
				"boruvkovy_diblik",
				"rak_ricni",
				"cert_sekac",
				"srpnove_cmelak"
			]
		},
		keyEnemies: [
			{
				id: "polni_krecek",
				name: "Polní křeček",
				icon: "🐹",
				role: "Zlodějíček klasů a grošů"
			},
			{
				id: "zitna_baba",
				name: "Žitná bába (Srpanda)",
				icon: "🌾",
				role: "Polední strašidlo se zlatým srpem"
			},
			{
				id: "krecek_obilnik",
				name: "Král křečků Obilník",
				icon: "👑",
				role: "Mini-boss polních nor"
			},
			{
				id: "zitna_matka",
				name: "Žitná matka",
				icon: "☀️",
				role: "Mezi-boss zralých lánů"
			},
			{
				id: "hromotluk_marketa",
				name: "Pouťový Hromotluk",
				icon: "🎯",
				role: "Vrcholný boss pouti sv. Markéty"
			}
		],
		bossMechanic: {
			label: "Poutní střelnice a Panáci žita",
			description: "Trefuj terče na poutní střelnici na návsi pro Pouťovou mušku (+25 % nabíjení zbraní, +20 % štěstí) a využívej panáky žita jako kryt!",
			cadenceSeconds: 8
		}
	},
	9: {
		id: 9,
		name: "10. Červenec v Hrusicích – Bouře sv. Eliáše a Dračí sluj",
		shortTitle: "Červencová noc",
		subtitle: "Hromobití sv. Eliáše, kulové blesky, Bezhlavý rytíř a Tříhlavý Drak",
		theme: "summer_harvest",
		season: "summer",
		icon: "⚡",
		badge: "10. Úroveň",
		isNightLevel: true,
		description: "Po parném červencovém dni se nad Hrusicemi strhla hromová bouře svatého Eliáše! Mezi chalupami poskakují kulové blesky, z podhradí vyjíždí Bezhlavý rytíř se zbrojnoši a ve skalní sluji se probouzí Tříhlavý líný Drak!",
		lore: "Svatý Eliáš jezdí po nebi na ohnivém voze a metá blesky do strniště. Přežij údery Eliášova hromu, odraz útok Bílé paní a Bezhlavého rytíře a pokoř Tříhlavého melechovského Draka!",
		unlockRequirementText: "Odemkne se po poražení Pouťového Hromotluka v 9. úrovni",
		skyColor: "#1E1B4B",
		nightSkyColor: "#0F172A",
		groundColor: "#1E293B",
		ambientTint: "rgba(56, 189, 248, 0.36)",
		weatherEffect: "rain",
		decorTypes: [
			"cottage",
			"tree",
			"haystack",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "cervencove_zne",
			name: "Červencová bouře v noci",
			layout: "asymmetric_poi",
			poiOrder: [
				"fields",
				"church",
				"tavern",
				"village",
				"school",
				"pond",
				"mill",
				"forest",
				"shrine"
			]
		},
		miniBoss: {
			id: "bila_pani",
			name: "👻 Bílá paní a rytířský zbrojnoš",
			warning: "👻 POZOR: ZBOŘENÝMI HRADBAMI PROCHÁZÍ BÍLÁ PANÍ SE ZBROJNOŠEM!",
			time: 85,
			kills: 100,
			multiplier: 10.5
		},
		midBoss: {
			id: "bezhlavy_rytir",
			name: "🗡️ Bezhlavý rytíř ze Zlenic",
			warning: "🗡️ HROM UDEŘIL! Z PODHRADÍ VYJÍŽDÍ BEZHLAVÝ RYTÍŘ!",
			time: 185,
			kills: 240,
			multiplier: 0.72
		},
		finalBoss: {
			id: "drak",
			name: "🐉 Tříhlavý líný Drak pod Melechovem",
			warning: "🐉 SKÁLA PUKLA BLESKEM! ZE SLUJE VYLÉZÁ TŘÍHLAVÝ LÍNÝ DRAK! 🐉",
			time: 300,
			kills: 400,
			multiplier: 0.78
		},
		spawnPools: {
			noon: [
				"kulovy_blesk",
				"plivnik",
				"jiskrivec",
				"bludicka",
				"zbrojnos"
			],
			afternoon: [
				"kulovy_blesk",
				"plivnik",
				"zbrojnos",
				"bila_pani",
				"ohnivy_sudlicka"
			],
			dusk: [
				"kulovy_blesk",
				"plivnik",
				"zbrojnos",
				"bila_pani",
				"ohnivy_muz",
				"cerny_pes"
			],
			night: [
				"kulovy_blesk",
				"plivnik",
				"zbrojnos",
				"bila_pani",
				"ohnivy_sudlicka",
				"ohniva_kobyla",
				"cerny_vlkodlak",
				"nocni_mura",
				"krvavy_kostlivec"
			],
			midnight: [
				"kulovy_blesk",
				"plivnik",
				"zbrojnos",
				"bila_pani",
				"ohnivy_sudlicka",
				"ohniva_kobyla",
				"cerny_vlkodlak",
				"cert_sekac",
				"krvavy_kostlivec",
				"bezhlavy_rytir"
			],
			dawn: [
				"kulovy_blesk",
				"plivnik",
				"zbrojnos",
				"bila_pani",
				"ohnivy_sudlicka",
				"ohniva_kobyla"
			]
		},
		keyEnemies: [
			{
				id: "kulovy_blesk",
				name: "Kulový blesk",
				icon: "⚡",
				role: "Jiskřící posel bouře sv. Eliáše"
			},
			{
				id: "plivnik",
				name: "Ohnivý Plivník",
				icon: "🔥",
				role: "Domácí ohnivýarášek ze stavení"
			},
			{
				id: "bila_pani",
				name: "Bílá paní a Zbrojnoš",
				icon: "👻",
				role: "Noční přízrak a obrněný strážce"
			},
			{
				id: "bezhlavy_rytir",
				name: "Bezhlavý rytíř",
				icon: "🗡️",
				role: "Mezi-boss z podhradí"
			},
			{
				id: "drak",
				name: "Tříhlavý líný Drak",
				icon: "🐉",
				role: "Vrcholný boss červencové bouře"
			}
		],
		bossMechanic: {
			label: "Blesky svatého Eliáše a Dračí dech",
			description: "Bouřkové blesky sv. Eliáše bijí do návsi a strniště – nalákej do nich bubáky a přežij výboj pro trofej Blesk svatého Eliáše!",
			cadenceSeconds: 9
		}
	},
	10: {
		id: 10,
		name: "11. Srpen v Hrusicích – Dožínková slavnost a pečení chleba",
		shortTitle: "Dožínková slavnost",
		subtitle: "Svátek svatého Bartoloměje, dožínkový věnec, horký chléb a srpnové vosy",
		theme: "august_harvest",
		season: "summer",
		icon: "🌾",
		badge: "11. Úroveň",
		description: "Konec žní a začátek dožínkové veselice! Na návsi voní čerstvě pečený chléb z kamenné pece, hraje muzika a pole křižují čmeláci, zlatohlávci a rozjařený Dožínkový chasník s věncem.",
		lore: "Na svatého Bartoloměje sedlák žita dožije. V Hrusicích vyhrává muzika, hospodyně pečou křupavý chléb v návesní peci a dožínkový chasník vyzývá k tanci celou ves.",
		unlockRequirementText: "Odemkne se po poražení Tříhlavého Draka v 10. úrovni (Červencová noc)",
		skyColor: "#FDE68A",
		nightSkyColor: "#FDE68A",
		groundColor: "#FEF08A",
		ambientTint: "rgba(245, 158, 11, 0.08)",
		weatherEffect: "sunflower_bloom",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"sunflower",
			"bread_oven",
			"harvest_wagon"
		],
		arena: {
			id: "srpnova_slavnost",
			name: "Srpnová dožínková náves",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "kralovsky_cmelak",
			name: "🐝 Královský čmelák",
			warning: "🐝 POZOR: ZE SLUNEČNIC VYLETĚL OBŘÍ KRÁLOVSKÝ ČMELÁK!",
			time: 85,
			kills: 100,
			multiplier: 3.2
		},
		midBoss: {
			id: "zlatohlavek_zrout",
			name: "🪲 Zlatohlávek Žrout ze sadu",
			warning: "🪲 POZOR: ZE SADU SE VALÍ SMARAGDOVÝ ZLATOHLÁVEK ŽROUT!",
			time: 185,
			kills: 240,
			multiplier: 1.85
		},
		finalBoss: {
			id: "dozinkovy_chasnik",
			name: "🌾 Dožínkový chasník s věncem",
			warning: "🌾 DOŽÍNKY VRCHOLÍ! DOŽÍNKOVÝ CHASNÍK ROZTÁČÍ OBŘÍ VĚNEC! 🌾",
			time: 300,
			kills: 390,
			multiplier: 0.95
		},
		spawnPools: {
			noon: [
				"srpnove_cmelak",
				"polni_mysice",
				"zlatohlavek",
				"mysak",
				"sotek",
				"cert_sekac"
			],
			afternoon: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"zitna_baba",
				"cert_sekac"
			],
			dusk: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"zitna_baba",
				"klekanice",
				"chroust"
			],
			night: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"klekanice",
				"divozenka",
				"plivnik"
			],
			midnight: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"klekanice",
				"cert",
				"divozenka"
			],
			dawn: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"zitna_baba",
				"polni_krecek",
				"cert_sekac"
			]
		},
		keyEnemies: [
			{
				id: "srpnove_cmelak",
				name: "Srpnový čmelák",
				icon: "🐝",
				role: "Bzučící letec ze slunečnic"
			},
			{
				id: "zlatohlavek",
				name: "Zlatohlávek skvostný",
				icon: "🪲",
				role: "Obrněný brouk odrážející střely"
			},
			{
				id: "polni_mysice",
				name: "Polní myšice",
				icon: "🐭",
				role: "Rychlá zlodějka ze strniště"
			},
			{
				id: "kralovsky_cmelak",
				name: "Královský čmelák",
				icon: "👑",
				role: "První mini-boss úrovně"
			},
			{
				id: "zlatohlavek_zrout",
				name: "Zlatohlávek Žrout",
				icon: "🪲",
				role: "Těžký valící se mezi-boss"
			},
			{
				id: "dozinkovy_chasnik",
				name: "Dožínkový chasník",
				icon: "🌾",
				role: "Vrcholný boss dožínek"
			}
		],
		bossMechanic: {
			label: "Chlebová pec a Sázecí lopata",
			description: "Přistup k návesní peci na chléb a stiskni [E] pro horký pecen – posílí útok tupých zbraní a léčení ze svačinek!",
			cadenceSeconds: 22
		}
	},
	11: {
		id: 11,
		name: "12. Srpen v Hrusicích – Vavřinecká noc padajících hvězd a Výr velký",
		shortTitle: "Vavřinecká noc",
		subtitle: "Slzy svatého Vavřince, signální vatry a král nočního nebe Výr velký",
		theme: "laurence_night",
		season: "summer",
		icon: "🌠",
		badge: "12. Úroveň",
		isNightLevel: true,
		description: "Černá srpnová obloha plná padajících hvězd! Na vrších vzplanou dožínkové vatry zahánějící Noční můry a ze zlenických skal slétá obávaný Výr velký.",
		lore: "Kolem svatého Vavřince padají z nebe ohnivé slzy. Kdo v noci zažehne posvátnou vatru u kostela, zažene můří přízraky a získá sílu čelit Výru velkému.",
		unlockRequirementText: "Odemkne se po poražení Dožínkového chasníka v 11. úrovni (Dožínková slavnost)",
		skyColor: "#0F172A",
		nightSkyColor: "#020617",
		groundColor: "#1E293B",
		ambientTint: "rgba(99, 102, 241, 0.15)",
		weatherEffect: "shooting_stars",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"bonfire",
			"ruin_wall",
			"owl_perch"
		],
		arena: {
			id: "vavrinecka_noc",
			name: "Vavřinecká noční aréna",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "netopyr_usatec",
			name: "🦇 Netopýr Ušatec",
			warning: "🦇 POZOR: ZE ZLENICKÉ VĚŽE SLÉTÁ NETOPÝR UŠATEC S OCHROMUJÍCÍM PÍSKOTEM!",
			time: 85,
			kills: 110,
			multiplier: 3.1
		},
		midBoss: {
			id: "nocni_mura",
			name: "🦋 Noční můra ze skal",
			warning: "🦋 POZOR: ZE STÍNŮ VYSTUPUJE PŘÍZRAČNÁ NOČNÍ MŮRA SE SPÁNKOTVORNÝM PRACHEM!",
			time: 185,
			kills: 250,
			multiplier: 1.8
		},
		finalBoss: {
			id: "vyr_velky",
			name: "🦉 Výr velký ze Zlenic",
			warning: "🦉 NOCÍ ZAHOUKAL VÝR VELKÝ! KRÁL NOČNÍCH LOVCŮ KROUŽÍ NAD HRUSICEMI! 🦉",
			time: 300,
			kills: 410,
			multiplier: 0.72
		},
		spawnPools: {
			noon: [
				"nocni_mura",
				"kulovy_blesk",
				"plivnik",
				"bludicka",
				"polni_mysice",
				"zbrojnos"
			],
			afternoon: [
				"nocni_mura",
				"kulovy_blesk",
				"zbrojnos",
				"cerny_pes",
				"srpnove_cmelak"
			],
			dusk: [
				"nocni_mura",
				"cerny_pes",
				"zbrojnos",
				"bila_pani",
				"ohnivy_sudlicka",
				"polni_mysice",
				"kulovy_blesk"
			],
			night: [
				"nocni_mura",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"bila_pani",
				"ohniva_kobyla",
				"ohnivy_sudlicka",
				"polni_mysice",
				"kulovy_blesk"
			],
			midnight: [
				"nocni_mura",
				"cerny_vlkodlak",
				"cert_sekac",
				"krvavy_kostlivec",
				"bezhlavy_rytir",
				"ohniva_kobyla",
				"polni_mysice",
				"kulovy_blesk"
			],
			dawn: [
				"nocni_mura",
				"cerny_pes",
				"kulovy_blesk",
				"bila_pani",
				"zbrojnos",
				"polni_mysice"
			]
		},
		keyEnemies: [
			{
				id: "nocni_mura",
				name: "Noční můra",
				icon: "🦋",
				role: "Přízrak uspávající lovce"
			},
			{
				id: "netopyr_usatec",
				name: "Netopýr Ušatec",
				icon: "🦇",
				role: "Rychlý letec z hradní věže"
			},
			{
				id: "vyr_velky",
				name: "Výr velký ze Zlenic",
				icon: "🦉",
				role: "Vrcholný dravý boss noci"
			},
			{
				id: "kulovy_blesk",
				name: "Kulový blesk",
				icon: "⚡",
				role: "Zbloudilý výboj z bouří"
			},
			{
				id: "cerny_vlkodlak",
				name: "Černý vlkodlak",
				icon: "🐺",
				role: "Dravý noční lovec ze skal"
			}
		],
		bossMechanic: {
			label: "Vavřinecká vatra a Perseidy",
			description: "Zapal svatou vatru u kostela [E] a chytej padající hvězdy – zaženou Noční můry a okamžitě dobijí ultimátku!",
			cadenceSeconds: 16
		}
	},
	12: {
		id: 12,
		name: "13. Září v Hrusicích – Posvícení a sklizeň švestek",
		shortTitle: "Zářijové posvícení",
		subtitle: "Babí léto, modrající se švestkové sady, kotel na povidla a posvícenské koláče",
		theme: "september_feast",
		season: "autumn",
		icon: "🍯",
		badge: "13. Úroveň",
		description: "Kraj zalévá zlatavé slunce babího léta, v sadech dozrávají modré švestky a na hrusické návsi bublá v měděném kotli hustá povidlová várka. Zamíchej kotlem na povidla [E] pro opaření bubáků a posvícenskou kuráž!",
		lore: "Když v září zavoní po vsi vařená švestková povidla a posvícenské koláče, slétají se ze sadů vykrmení sršni, zpod kotle vykukuje Povidlový čert a náves brání rozjařený Posvícenský Hospodář!",
		unlockRequirementText: "Odemkne se po poražení Výra velkého ve 12. úrovni (Vavřinecká noc)",
		skyColor: "#FDE68A",
		nightSkyColor: "#FDE68A",
		groundColor: "#D9A05B",
		ambientTint: "rgba(217, 119, 6, 0.08)",
		weatherEffect: "falling_leaves",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"plum_tree",
			"povidla_cauldron"
		],
		arena: {
			id: "zarijove_posviceni",
			name: "Zářijová posvícenská náves",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "kralovsky_srsen",
			name: "🐝 Královský sršeň ze sadu",
			warning: "🐝 POZOR: ZE ŠVESTKOVÉHO SADU VYLETĚL OBŘÍ KRÁLOVSKÝ SRŠEŇ!",
			time: 85,
			kills: 110,
			multiplier: 1.0
		},
		midBoss: {
			id: "povidlovy_cert",
			name: "🍯 Povidlový čert s měchačkou",
			warning: "🍯 POZOR: ZPOD KOTLE VYSKOČIL POVIDLOVÝ ČERT S OBŘÍ MĚCHAČKOU!",
			time: 185,
			kills: 255,
			multiplier: 1.0
		},
		finalBoss: {
			id: "posvicensky_hospodar",
			name: "🥧 Posvícenský Hospodář",
			warning: "🥧 POSVÍCENÍ VRCHOLÍ! PŘICHÁZÍ HROMOTLUCKÝ POSVÍCENSKÝ HOSPODÁŘ! 🥧",
			time: 300,
			kills: 410,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"mysak",
				"sotek",
				"cert_sekac"
			],
			afternoon: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"srpnove_cmelak",
				"cert_sekac"
			],
			dusk: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"sotek",
				"srpnove_cmelak",
				"cert_sekac"
			],
			night: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"sotek",
				"cert_sekac"
			],
			midnight: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"srpnove_cmelak",
				"cert_sekac"
			],
			dawn: [
				"svestkovy_srsen",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"mysak",
				"cert_sekac"
			]
		},
		keyEnemies: [
			{
				id: "svestkovy_srsen",
				name: "Švestkový sršeň",
				icon: "🐝",
				role: "Dravý podzimní letec ze švestkového sadu"
			},
			{
				id: "zlatohlavek",
				name: "Zlatohlávek skvostný",
				icon: "🪲",
				role: "Obrněný brouk mlsající spadané švestky"
			},
			{
				id: "kralovsky_srsen",
				name: "Královský sršeň ze sadu",
				icon: "👑",
				role: "První mini-boss úrovně"
			},
			{
				id: "povidlovy_cert",
				name: "Povidlový čert s měchačkou",
				icon: "🍯",
				role: "Mezi-boss rozstřikující vařící povidla"
			},
			{
				id: "posvicensky_hospodar",
				name: "Posvícenský Hospodář",
				icon: "🥧",
				role: "Vrcholný boss zářijového posvícení"
			}
		],
		bossMechanic: {
			label: "Kotel na povidla a Měchačka",
			description: "Přistup k měděnému kotli na návsi a stiskni [E] pro zamíchání vroucích povidel – opaříš okolní bubáky a získáš Sladkou posvícenskou kuráž!",
			cadenceSeconds: 20
		}
	},
	13: {
		id: 13,
		name: "14. Září v Hrusicích – Svatováclavská noc a mlhy u rybníka",
		shortTitle: "Svatováclavská noc",
		subtitle: "Husté podzimní mlhy nad rybníkem, svatý oheň u kostela a Kvílící Meluzína",
		theme: "wenceslas_night",
		season: "autumn",
		icon: "🌫️",
		badge: "14. Úroveň",
		isNightLevel: true,
		description: "S příchodem svatováclavské noci zahalila Hrusice hustá stříbřitá mlha od rybníka a v komínech naříká větrná Meluzína. Zažehni Svatováclavský svatý oheň u kostela [E] a odraz nápor nočních přízraků!",
		lore: "Na svatého Václava bývá mlha lepkavá a z rybníků vylézají vodníci s bludičkami. Kdo u kostela rozdmýchá Svatováclavský oheň, toho nezlomí ani mrazivý nářek Kvílící Meluzíny.",
		unlockRequirementText: "Odemkne se po poražení Posvícenského Hospodáře ve 13. úrovni (Zářijové posvícení)",
		skyColor: "#0F172A",
		nightSkyColor: "#090F1C",
		groundColor: "#1E293B",
		ambientTint: "rgba(148, 163, 184, 0.22)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"wenceslas_fire",
			"pond_mist"
		],
		arena: {
			id: "svatovaclavska_noc",
			name: "Svatováclavská mlžná aréna",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "bila_pani",
			name: "👻 Bílá paní ve svatováclavské mlze",
			warning: "👻 POZOR: Z HUSTÉ MLHY U KOSTELA VYSTUPUJE BÍLÁ PANÍ!",
			time: 85,
			kills: 115,
			multiplier: 11.2
		},
		midBoss: {
			id: "mlynar",
			name: "🌊 Mlžný Mlynář od splavu",
			warning: "🌊 POZOR: OD ZAMLŽENÉHO NÁHONU PŘICHÁZÍ PROKLETÝ MLYNÁŘ!",
			time: 185,
			kills: 265,
			multiplier: 0.85
		},
		finalBoss: {
			id: "kvilici_meluzina",
			name: "🌬️ Kvílící Meluzína",
			warning: "🌬️ KOMÍNY KVIČÍ VICHŘICÍ! Z MLHY SLÉTÁ KVÍLÍCÍ MELUZÍNA! 🌬️",
			time: 300,
			kills: 425,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"bludicka",
				"topivec",
				"nocni_mura",
				"cerny_pes",
				"bubak",
				"svestkovy_srsen"
			],
			afternoon: [
				"bludicka",
				"topivec",
				"nocni_mura",
				"zbrojnos",
				"cerny_pes",
				"svestkovy_srsen"
			],
			dusk: [
				"bludicka",
				"topivec",
				"nocni_mura",
				"zbrojnos",
				"cerny_pes",
				"bubak",
				"svestkovy_srsen"
			],
			night: [
				"topivec",
				"bludicka",
				"nocni_mura",
				"zbrojnos",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"hejkal",
				"svestkovy_srsen"
			],
			midnight: [
				"topivec",
				"bludicka",
				"nocni_mura",
				"zbrojnos",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"ohniva_kobyla",
				"hejkal",
				"svestkovy_srsen"
			],
			dawn: [
				"bludicka",
				"topivec",
				"nocni_mura",
				"cerny_pes",
				"zbrojnos",
				"svestkovy_srsen"
			]
		},
		keyEnemies: [
			{
				id: "topivec",
				name: "Rybniční topivec",
				icon: "💧",
				role: "Zákeřný vodník číhající v mlze u rybníka"
			},
			{
				id: "bludicka",
				name: "Mlžná bludička",
				icon: "✨",
				role: "Lákavé světýlko nad podzimní tůní"
			},
			{
				id: "bila_pani",
				name: "Bílá paní v mlze",
				icon: "👻",
				role: "První přízračný mini-boss"
			},
			{
				id: "mlynar",
				name: "Mlžný Mlynář",
				icon: "🌊",
				role: "Mezi-boss od mlýnského splavu"
			},
			{
				id: "kvilici_meluzina",
				name: "Kvílící Meluzína",
				icon: "🌬️",
				role: "Vrcholný větrný boss svatováclavské noci"
			}
		],
		bossMechanic: {
			label: "Svatováclavský svatý oheň a Mlžný vichr",
			description: "Zažehni svatý oheň u kostela sv. Václava [E] pro posvátný štít a záštitu proti přízrakům, a využívej poryvy svatováclavského vichru!",
			cadenceSeconds: 20
		}
	},
	14: {
		id: 14,
		name: "15. Říjen v Hrusicích – Bramborová nať a drakiáda",
		shortTitle: "Říjnová drakiáda",
		subtitle: "Vonící dým z bramborové natě, draci na větru a pečené brambory v popelu",
		theme: "october_harvest",
		season: "autumn",
		icon: "🥔",
		badge: "15. Úroveň",
		description: "Kraj provoněl kouř z doutnající bramborové natě, na podzimním nebi krouží pestrobarevní draci a ve žhavém popelu na návsi se pečou křupavé brambory. Upeč si horkou bramboru [E] pro posilující svačinku a zažeň hladové běsy!",
		lore: "Když se v říjnu zvedne sychravý podzimní vítr a na polích se pálí bramborová nať, pouštějí kluci z Hrusic papírové draky. Nad strništi však krouží hejna havranů a ze starého novinového papíru ožívá samotný drak Větrník!",
		unlockRequirementText: "Odemkne se po poražení Kvílící Meluzíny ve 14. úrovni (Svatováclavská noc)",
		skyColor: "#FDE68A",
		nightSkyColor: "#FDE68A",
		groundColor: "#B45309",
		ambientTint: "rgba(217, 119, 6, 0.08)",
		weatherEffect: "falling_leaves",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"potato_fire",
			"kite"
		],
		arena: {
			id: "rijnova_drakiada",
			name: "Říjnová náves a brambořiště",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "kralovsky_havran",
			name: "🦅 Královský havran ze strniště",
			warning: "🦅 POZOR: ZE STRNIŠTĚ VYLETĚL OBŘÍ ČERNÝ HAVRAN!",
			time: 85,
			kills: 120,
			multiplier: 1.0
		},
		midBoss: {
			id: "hastrman_podzimni",
			name: "🐸 Podzimní hastrman z rákosí",
			warning: "🐸 POZOR: Z KALNÉHO RYBNÍKA VYSTUPUJE HASTRMAN SE SÍTÍ!",
			time: 185,
			kills: 280,
			multiplier: 1.0
		},
		finalBoss: {
			id: "drak_vetrnik",
			name: "🪁 Hrusický drak Větrník",
			warning: "🪁 NEBE TEMNÍ! NAD HRUSICEMI KROUŽÍ OBŘÍ PAPÍROVÝ DRAK VĚTRNÍK! 🪁",
			time: 300,
			kills: 440,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"bramborova_mandelinka",
				"polni_mysice",
				"podzimni_strasak",
				"svestkovy_srsen",
				"skodnik",
				"boruvkovy_diblik"
			],
			afternoon: [
				"bramborova_mandelinka",
				"podzimni_strasak",
				"polni_krecek",
				"svestkovy_srsen",
				"srpnove_cmelak",
				"boruvkovy_diblik"
			],
			dusk: [
				"bramborova_mandelinka",
				"podzimni_strasak",
				"polni_mysice",
				"svestkovy_srsen",
				"drab",
				"boruvkovy_diblik"
			],
			night: [
				"bramborova_mandelinka",
				"podzimni_strasak",
				"polni_krecek",
				"svestkovy_srsen",
				"boruvkovy_diblik"
			],
			midnight: [
				"bramborova_mandelinka",
				"podzimni_strasak",
				"polni_mysice",
				"svestkovy_srsen",
				"boruvkovy_diblik"
			],
			dawn: [
				"bramborova_mandelinka",
				"podzimni_strasak",
				"polni_mysice",
				"skodnik",
				"svestkovy_srsen",
				"boruvkovy_diblik"
			]
		},
		keyEnemies: [
			{
				id: "bramborova_mandelinka",
				name: "Bramborová mandelinka",
				icon: "🪲",
				role: "Pruhovaný hmyzí škůdce z bramborových lánů"
			},
			{
				id: "podzimni_strasak",
				name: "Podzimní polní strašák",
				icon: "🌾",
				role: "Obrněný slaměný běs se zahradnickými hráběmi"
			},
			{
				id: "kralovsky_havran",
				name: "Královský havran ze strniště",
				icon: "🦅",
				role: "Rychlý letec a první mini-boss úrovně"
			},
			{
				id: "hastrman_podzimni",
				name: "Podzimní hastrman z rákosí",
				icon: "🐸",
				role: "Mezi-boss z Brčálníku vrhající rybářskou síť"
			},
			{
				id: "drak_vetrnik",
				name: "Hrusický drak Větrník",
				icon: "🪁",
				role: "Vele-boss říjnového nebe a vládce sychravého větru"
			}
		],
		bossMechanic: {
			label: "Ohníček z bramborové natě",
			description: "Přistup k ohništi na návsi a stiskni [E] pro upečení horké brambory – popálíš běsy v okolí a získáš posilující svačinku!",
			cadenceSeconds: 20
		}
	},
	15: {
		id: 15,
		name: "16. Říjen v Hrusicích – Dušičková noc a výlov rybníka",
		shortTitle: "Dušičková noc",
		subtitle: "Svíce na hřbitově, vypuštěný rybník plný kaprů a děsuplný Čert rybníkář",
		theme: "all_souls_night",
		season: "autumn",
		icon: "🕯️",
		badge: "16. Úroveň",
		isNightLevel: true,
		description: "Na Hrusice padla tichá dušičková noc. U Božích muk a na hřbitově plápolají hřejivé svíce, z vypuštěného rybníka Brčálníku stoupá pach bahna a z kalné tůně vylézá Pekelný čert rybníkář s obří Veleštikou. Zažehni dušičkovou svíci [E] pro posvátnou záštitu!",
		lore: "Na Dušičky vzpomínají v Hrusicích na všechny předky a rozsvěcejí svíčky ve skleněných lucernách. V rybníce Brčálníku vrcholí noční výlov kaprů, do kterého se míchají noční bludičky, čerti od kádí a zubaté obludy z nejhlubší tůně.",
		unlockRequirementText: "Odemkne se po poražení draka Větrníka v 15. úrovni (Říjnová drakiáda)",
		skyColor: "#0D1322",
		nightSkyColor: "#070B14",
		groundColor: "#1B2232",
		ambientTint: "rgba(120, 140, 180, 0.25)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"graveyard_candle",
			"carp_tub"
		],
		arena: {
			id: "dusickova_noc",
			name: "Dušičková noční aréna",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "dusickova_bludicka",
			name: "🕯️ Dušičková bludička z hřbitova",
			warning: "🕯️ POZOR: Z HŘBITOVA U KOSTELA VYSTUPUJE DUŠIČKOVÁ BLUDIČKA!",
			time: 85,
			kills: 125,
			multiplier: 1.0
		},
		midBoss: {
			id: "cert_rybnikar",
			name: "🐟 Pekelný čert rybníkář",
			warning: "🐟 POZOR: Z VYPUŠTĚNÉHO RYBNÍKA VYSTUPUJE PEKELNÝ ČERT RYBNÍKÁŘ S NEVODEM!",
			time: 185,
			kills: 290,
			multiplier: 1.0
		},
		finalBoss: {
			id: "vele_stika",
			name: "🐟 Hrusická Veleštika ze dna Brčálníku",
			warning: "🐟 HLUBINY SE VZBOURUJÍ! Z BAHNA RYBNÍKA VYPLOUVÁ OBŘÍ VELEŠTIKA! 🐟",
			time: 300,
			kills: 450,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"zaba",
				"kalny_hastrman",
				"topivec",
				"nocni_mura",
				"cerny_pes",
				"bubak",
				"carodejnice_koste"
			],
			afternoon: [
				"zaba",
				"kalny_hastrman",
				"topivec",
				"nocni_mura",
				"zbrojnos",
				"cerny_pes",
				"carodejnice_koste"
			],
			dusk: [
				"zaba",
				"kalny_hastrman",
				"topivec",
				"nocni_mura",
				"zbrojnos",
				"cerny_pes",
				"bubak",
				"carodejnice_koste"
			],
			night: [
				"zaba",
				"topivec",
				"kalny_hastrman",
				"nocni_mura",
				"zbrojnos",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"hejkal",
				"carodejnice_koste"
			],
			midnight: [
				"zaba",
				"topivec",
				"kalny_hastrman",
				"nocni_mura",
				"zbrojnos",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"hrobnik",
				"hejkal",
				"carodejnice_koste"
			],
			dawn: [
				"zaba",
				"kalny_hastrman",
				"topivec",
				"nocni_mura",
				"cerny_pes",
				"zbrojnos",
				"carodejnice_koste"
			]
		},
		keyEnemies: [
			{
				id: "topivec",
				name: "Rybniční topivec",
				icon: "💧",
				role: "Vodní běs číhající v bahně u vypuštěného rybníka"
			},
			{
				id: "kalny_hastrman",
				name: "Kalný hastrman z výlovu",
				icon: "💧",
				role: "Záludný vodník v bahně vypuštěného rybníka Brčálníku"
			},
			{
				id: "dusickova_bludicka",
				name: "Dušičková bludička",
				icon: "🕯️",
				role: "Záhrobní mini-boss z kostelního hřbitova"
			},
			{
				id: "cert_rybnikar",
				name: "Pekelný čert rybníkář",
				icon: "🐟",
				role: "Mezi-boss z výlovu kradoucí kapry s okovanými vidlemi"
			},
			{
				id: "vele_stika",
				name: "Hrusická Veleštika",
				icon: "🐟",
				role: "Legendární obludná zubatice z nejhlubšího bahna Brčálníku"
			}
		],
		bossMechanic: {
			label: "Dušičková svíce a ochranný plamen",
			description: "Přistup k Božím mukám a stiskni [E] pro zažehnutí dušičkové svíce – posvátný plamen spálí okolní noční přízraky a dodá hřejivou kuráž!",
			cadenceSeconds: 20
		}
	},
	16: {
		id: 16,
		name: "17. Listopad v Hrusicích – Svatomartinská slavnost a husí hody",
		shortTitle: "Svatomartinská slavnost",
		subtitle: "Svatomartinská husa v pekáči, mladé víno U Sejků a příjezd jezdce na bílém koni",
		theme: "st_martin_feast",
		season: "autumn",
		icon: "🪿",
		badge: "17. Úroveň",
		isNightLevel: false,
		description: "Na svatého Martina kouří se z komínů a u Sejků voní dozlatova upečená husa s červeným zelím. Po polích běhají splašené husy ze statku, z lesa se tlačí divočáci a od Zlenic přijíždí tajemný Martinský jezdec na bílém koni. Přistup k hospodě a ochutnej husu [E] pro posílení!",
		lore: "Svatomartinské posvícení je v Hrusicích svátkem hojnosti a dobrého jídla před příchodem zimy. Hospodyně pečou svatomartinské rohlíčky a husy, ale studený vítr přináší první mrazíky a divokou zvěř z hlubokých panských hvozdů.",
		unlockRequirementText: "Odemkne se po poražení Veleštiky v 16. úrovni (Dušičková noc)",
		skyColor: "#E2E8F0",
		groundColor: "#8D6E63",
		ambientTint: "rgba(180, 160, 140, 0.12)",
		weatherEffect: "falling_leaves",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"roast_goose",
			"wine_barrel"
		],
		arena: {
			id: "listopad_naves",
			name: "Listopadová náves a svatomartinské polnosti",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "kralovska_husa",
			name: "🪿 Královská svatomartinská husa",
			warning: "🪿 POZOR: ZE STATKU VYLETĚLA OBŘÍ KRÁLOVSKÁ HUSA S ROZTAŽENÝMI KŘÍDLY!",
			time: 85,
			kills: 130,
			multiplier: 1.0
		},
		midBoss: {
			id: "martinsky_jezdec",
			name: "⚔️ Martinský jezdec na bílém koni",
			warning: "⚔️ POZOR: Z MLHY VYJÍŽDÍ MARTINSKÝ JEZDEC NA BÍLÉM KONI!",
			time: 185,
			kills: 300,
			multiplier: 1.0
		},
		finalBoss: {
			id: "listopadovy_mrazivec",
			name: "❄️ Listopadový Mrazivec",
			warning: "❄️ MRAZIVÝ VÍTR DUJE Z HOR! PŘICHÁZÍ VLÁDCE PRVNÍHO MRÁZU LISTOPADOVÝ MRAZIVEC! ❄️",
			time: 300,
			kills: 460,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana"
			],
			afternoon: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana",
				"drab"
			],
			dusk: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana",
				"drab",
				"drevorubec"
			],
			night: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana",
				"drab"
			],
			midnight: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana",
				"drab"
			],
			dawn: [
				"polni_mysice",
				"svatomartinska_husa",
				"divoky_kanec",
				"lesni_pytlak",
				"vrana"
			]
		},
		keyEnemies: [
			{
				id: "svatomartinska_husa",
				name: "Svatomartinská husa",
				icon: "🪿",
				role: "Bleskový a kousavý běžec ze selského dvora"
			},
			{
				id: "divoky_kanec",
				name: "Divoký kanec",
				icon: "🐗",
				role: "Obrněný štětináč prorážející houfy zbraní"
			},
			{
				id: "lesni_pytlak",
				name: "Lesní pytlák s prakem",
				icon: "🏹",
				role: "Záludný střelec z křovisek a mlází"
			},
			{
				id: "kralovska_husa",
				name: "Královská husa",
				icon: "👑",
				role: "Rychlý mini-boss s mohutnými křídly"
			},
			{
				id: "martinsky_jezdec",
				name: "Martinský jezdec",
				icon: "⚔️",
				role: "Rytířský mezi-boss přinášející sněhovou vánici"
			},
			{
				id: "listopadovy_mrazivec",
				name: "Listopadový Mrazivec",
				icon: "❄️",
				role: "Vele-boss chladu zlenických skal a prvních námraz"
			}
		],
		bossMechanic: {
			label: "Svatomartinská pečená husa",
			description: "Přistup k hospodě U Sejků a stiskni [E] pro ochutnání pečené husy – získáš posilující žár, rychlost a vypudíš mráz z těla!",
			cadenceSeconds: 20
		}
	},
	17: {
		id: 17,
		name: "18. Listopad v Hrusicích – Listopadové mlhy a noční hon",
		shortTitle: "Listopadový noční hon",
		subtitle: "Sychravé mlhy nad hvozdem, zapálený milíř a běsnící divočák Kňour",
		theme: "november_fog_hunt",
		season: "autumn",
		icon: "🐗",
		badge: "18. Úroveň",
		isNightLevel: true,
		description: "Temná listopadová noc zahalila hrusické lesy do neprostupné bílé mlhy. V hloubi hvozdu plápolá uhlířský milíř, kolem krouží Černý myslivec se smečkou ohařů a zem duní pod kopyty bájného kance Kňoura. Přistup k milíři a stiskni [E] pro zažehnutí uhlíků a rozehnání mlhy!",
		lore: "V pozdním listopadu se panstvo a lesníci vydávali na velký noční hon na černou zvěř. Jenže v hrusických lesích nečíhají jen kanci, ale i temné stíny, zapomenutí pytláci a přízraky, které se bojí jen žáru dřevěného uhlí.",
		unlockRequirementText: "Odemkne se po poražení Listopadového Mrazivce v 17. úrovni",
		skyColor: "#0F172A",
		nightSkyColor: "#050A14",
		groundColor: "#1A2228",
		ambientTint: "rgba(100, 116, 139, 0.35)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"charcoal_kiln",
			"hunting_stand"
		],
		arena: {
			id: "listopad_naves",
			name: "Listopadový noční hvozd",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "mlzny_prizrak",
			name: "🌫️ Mlžný přízrak z rašeliniště",
			warning: "🌫️ POZOR: Z HUSTÉ MLHY VYSTUPUJE CHLADNÝ MLŽNÝ PŘÍZRAK!",
			time: 85,
			kills: 135,
			multiplier: 1.0
		},
		midBoss: {
			id: "cerny_myslivec",
			name: "🏹 Černý myslivec z hvozdu",
			warning: "🏹 POZOR: ZE SKAL SE OZÝVÁ ZLOVĚSTNÝ ROH ČERNÉHO MYSLIVCE!",
			time: 185,
			kills: 310,
			multiplier: 1.0
		},
		finalBoss: {
			id: "kanec_knour",
			name: "🐗 Obří divočák Kňour",
			warning: "🐗 ZEMĚ SE TŘESE! Z HVOZDU VYBÍHÁ OBŘÍ DIVOČÁK KŇOUR! 🐗",
			time: 300,
			kills: 470,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"mlzny_prizrak",
				"carodejnice_koste"
			],
			afternoon: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"cerny_vlkodlak",
				"carodejnice_koste"
			],
			dusk: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"cerny_vlkodlak",
				"carodejnice_koste",
				"hejkal"
			],
			night: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"cerny_vlkodlak",
				"umrlec",
				"hejkal",
				"carodejnice_koste"
			],
			midnight: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"cerny_vlkodlak",
				"umrlec",
				"hrobnik",
				"hejkal",
				"carodejnice_koste"
			],
			dawn: [
				"polni_mysice",
				"divoky_kanec",
				"lesni_pytlak",
				"cerny_vlkodlak",
				"carodejnice_koste"
			]
		},
		keyEnemies: [
			{
				id: "divoky_kanec",
				name: "Divoký kanec",
				icon: "🐗",
				role: "Zuřivý lesní běžec s kly"
			},
			{
				id: "cerny_vlkodlak",
				name: "Černý vlkodlak",
				icon: "🐺",
				role: "Rychlý noční lovec z hvozdu"
			},
			{
				id: "mlzny_prizrak",
				name: "Mlžný přízrak",
				icon: "🌫️",
				role: "Beztvarý vznášející se mini-boss"
			},
			{
				id: "cerny_myslivec",
				name: "Černý myslivec",
				icon: "🏹",
				role: "Prokletý lovec s černou kuší"
			},
			{
				id: "kanec_knour",
				name: "Divočák Kňour",
				icon: "🐗",
				role: "Nezastavitelný vládce černé zvěře"
			}
		],
		bossMechanic: {
			label: "Uhlířský milíř",
			description: "Přistup k milíři v hvozdu a stiskni [E] pro přiložení dříví – rozžhavené uhlíky spálí okolní běsy a kouř rozežene nepřátelské hejno!",
			cadenceSeconds: 20
		}
	},
	18: {
		id: 18,
		name: "19. Prosinec v Hrusicích – Mikulášská obchůzka a sněhové závěje",
		shortTitle: "Mikulášská obchůzka",
		subtitle: "Koledníci na zasněžené návsi, adventní věnec a hrozivý Čert Richter s řetězem",
		theme: "st_nicholas_procession",
		season: "winter",
		icon: "🎅",
		badge: "19. Úroveň",
		isNightLevel: false,
		description: "Na Hrusice napadl čistý bílý ladovský sníh! Po návsi chodí Mikuláš s andělem a koledníky, ale z pekelných děr vylézá rozpustilý Čert s pytlem a obří Čert Richter s řetězy. Přistup k lípě na návsi a zažehni adventní svíci [E] pro posvátnou ochranu před pekelníky!",
		lore: "V předvečer svatého Mikuláše obchází hrusická chasa v maskách chalupy. Děti přednášejí básničky a dostávají křížaly a perníčky. Jenže když se setmí, praví pekelní čerti se vmísí mezi maškary a začnou trestat všechny hříšníky.",
		unlockRequirementText: "Odemkne se po poražení divočáka Kňoura v 18. úrovni",
		skyColor: "#F1F5F9",
		groundColor: "#E2E8F0",
		ambientTint: "rgba(226, 232, 240, 0.15)",
		weatherEffect: "snow",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"snowman",
			"advent_wreath"
		],
		arena: {
			id: "prosinec_zima",
			name: "Zasněžená prosincová náves",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "cert_s_pytlem",
			name: "👹 Pekelný čert s pytlem",
			warning: "👹 POZOR: ZE ZÁVĚJE VYSKOČIL ČERT S PYTLEM NA NEPOSLUŠNÉ KOLEDNÍKY!",
			time: 85,
			kills: 140,
			multiplier: 1.0
		},
		midBoss: {
			id: "maskarni_kozel",
			name: "🐐 Kolednický maškarní kozel",
			warning: "🐐 POZOR: PO ZASNĚŽENÉ NÁVSI TRKÁ ROZDIVOČELÝ MAŠKARNÍ KOZEL!",
			time: 185,
			kills: 320,
			multiplier: 1.0
		},
		finalBoss: {
			id: "mikulassky_cert",
			name: "🔥 Mikulášský čert Richter",
			warning: "🔥 PEKLO SE OTEVŘELO! NA ZASNĚŽENOU NÁVES VLÍTNUL ČERT RICHTER S ROZPÁLENÝM ŘETĚZEM! 🔥",
			time: 300,
			kills: 480,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"tajici_snehulak",
				"drab",
				"vrana"
			],
			afternoon: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"sazovy_rarach",
				"drab",
				"vrana"
			],
			dusk: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"sazovy_rarach",
				"pekelny_cert",
				"drab",
				"vrana"
			],
			night: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"sazovy_rarach",
				"pekelny_cert",
				"drab",
				"vrana"
			],
			midnight: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"sazovy_rarach",
				"pekelny_cert",
				"drab",
				"vrana"
			],
			dawn: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"certik",
				"tajici_snehulak",
				"drab",
				"vrana"
			]
		},
		keyEnemies: [
			{
				id: "ledovy_rampousik",
				name: "Ledový rampouch",
				icon: "❄️",
				role: "Drobné skákající ledové střepy"
			},
			{
				id: "snehova_jezinka",
				name: "Sněhová jezinka",
				icon: "❄️",
				role: "Zimní přízrak tančící v závějích"
			},
			{
				id: "cert_s_pytlem",
				name: "Čert s pytlem",
				icon: "👹",
				role: "Hbitý mini-boss s pytlem na zlobivé koledníky"
			},
			{
				id: "maskarni_kozel",
				name: "Maškarní kozel",
				icon: "🐐",
				role: "Trkající masopustní mezi-boss"
			},
			{
				id: "mikulassky_cert",
				name: "Čert Richter",
				icon: "🔥",
				role: "Obří chlupatý vládce pekelných maškar"
			}
		],
		bossMechanic: {
			label: "Adventní věnec na návsi",
			description: "Přistup k návesní lípě a stiskni [E] pro zažehnutí adventní svíce – zlaté posvátné světlo zažene čerty a dodá posilu!",
			cadenceSeconds: 20
		}
	},
	19: {
		id: 19,
		name: "20. Prosinec v Hrusicích – Štědrovečerní noc a Král Mrazík",
		shortTitle: "Štědrovečerní noc",
		subtitle: "Zvonění hrusického kostela, tichá vánice a finální souboj s Králem Mrazíkem",
		theme: "christmas_eve_miracle",
		season: "winter",
		icon: "⭐",
		badge: "20. Úroveň",
		isNightLevel: true,
		description: "Štědrovečerní tichá noc nad Hrusicemi. Okna chalup svítí zlatým světlem, z kostela sv. Mikuláše se nese slavnostní zvonění, ale nad zasněženým krajem se vzpíná obří vánice a sestupuje sám Vládce zimní noci Král Mrazík! Přistup ke kostelu a rozezvuč zvon [E] k omráčení všech běsů!",
		lore: "Na Štědrý večer drží všichni půst, aby spatřili zlaté prasátko. Po večeři jdou všichni Hrusičtí na půlnoční mši do kostela sv. Mikuláše. V tuto posvátnou noc však zima ukazuje svou největší moc a lovec musí obhájit vesnici před samotným vládcem mrazu.",
		unlockRequirementText: "Odemkne se po poražení čerta Richtera v 19. úrovni",
		skyColor: "#0B132B",
		nightSkyColor: "#030712",
		groundColor: "#CBD5E1",
		ambientTint: "rgba(147, 197, 253, 0.35)",
		weatherEffect: "blizzard",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"christmas_tree",
			"church_bell"
		],
		arena: {
			id: "prosinec_zima",
			name: "Štědrovečerní zasněžená aréna",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "mraziva_sova",
			name: "🦉 Noční mrazivá sova",
			warning: "🦉 POZOR: Z KOSTELNÍ VĚŽE SE SNÁŠÍ OBŘÍ BÍLÁ MRAZIVÁ SOVA!",
			time: 85,
			kills: 145,
			multiplier: 1.0
		},
		midBoss: {
			id: "jezdec_meluziny",
			name: "🌪️ Zimní jezdec Meluzíny",
			warning: "🌪️ POZOR: Z VÁNICE VYJÍŽDÍ LEDOVÝ JEZDEC MELUZÍNY!",
			time: 185,
			kills: 330,
			multiplier: 1.0
		},
		finalBoss: {
			id: "kral_mrazik",
			name: "👑 Vládce zimní noci Král Mrazík",
			warning: "👑 NEBE ZMRAZILA POLÁRNÍ ZÁŘE! PŘICHÁZÍ SAMOTNÝ VLÁDCE ZIMNÍ NOCI KRÁL MRAZÍK! 👑",
			time: 300,
			kills: 500,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"meluzina"
			],
			afternoon: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"meluzina"
			],
			dusk: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"kostlivec_kosa",
				"meluzina"
			],
			night: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"kostlivec_kosa",
				"nocni_mura",
				"meluzina"
			],
			midnight: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"kostlivec_kosa",
				"nocni_mura",
				"hrobnik",
				"meluzina"
			],
			dawn: [
				"ledovy_rampousik",
				"snehova_jezinka",
				"mrazik",
				"severak",
				"mrazivy_obr",
				"meluzina"
			]
		},
		keyEnemies: [
			{
				id: "ledovy_rampousik",
				name: "Ledový rampouch",
				icon: "❄️",
				role: "Rychlé hejno ledových krystalků"
			},
			{
				id: "snehova_jezinka",
				name: "Sněhová jezinka",
				icon: "❄️",
				role: "Zimní víla ve sněhových závějích"
			},
			{
				id: "mraziva_sova",
				name: "Mrazivá sova",
				icon: "🦉",
				role: "Tichý noční letec a první mini-boss"
			},
			{
				id: "jezdec_meluziny",
				name: "Jezdec Meluzíny",
				icon: "🌪️",
				role: "Bouřlivý větrný mezi-boss ve vánici"
			},
			{
				id: "kral_mrazik",
				name: "Král Mrazík",
				icon: "👑",
				role: "Vele-boss celého roku a vládce ledového království"
			}
		],
		bossMechanic: {
			label: "Štědrovečerní zvon sv. Mikuláše",
			description: "Přistup ke kostelu sv. Mikuláše a stiskni [E] pro rozeznění štědrovečerního zvonu – mohutná rázová vlna omráčí všechny běsy a rozzáří nebe!",
			cadenceSeconds: 20
		}
	},
	20: {
		id: 20,
		name: "21. Leden v Hrusicích – Tříkrálová koleda a sníh",
		shortTitle: "Tříkrálová koleda",
		subtitle: "Tříkrálový průvod na návsi, stavění sněhuláků a vládce lednových vánic",
		theme: "january_frost",
		season: "winter",
		icon: "⛄",
		badge: "21. Úroveň",
		isNightLevel: false,
		description: "Na hrusickou náves napadly poctivé lednové závěje. Děti staví obří sněhuláky a po chalupách obchází tříkrálový průvod. Ale z mrazivých polí se valí divoká vánice!",
		lore: "V lednu mrzne, až praští. Hospodáři sedí u kamen a venku se prohání splašení sáňkaři i zimní běsi pod velením Vládce chumelenice.",
		unlockRequirementText: "Odemkne se po přečkání štědrovečerní noci ve 20. úrovni",
		skyColor: "#E2E8F0",
		nightSkyColor: "#94A3B8",
		groundColor: "#F8FAFC",
		ambientTint: "rgba(226, 232, 240, 0.25)",
		weatherEffect: "snow",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"haystack",
			"wooden_cart"
		],
		arena: {
			id: "lednova_zavej",
			name: "Lednová zasněžená náves a rybník",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "obri_snehulak",
			name: "⛄ Obří sněhulák z návsi",
			warning: "⛄ POZOR: ZE SNĚHOVÝCH ZÁVĚJÍ POVSTAL OBŘÍ SNĚHULÁK S HRNCEM NA HLAVĚ!",
			time: 85,
			kills: 140,
			multiplier: 1.0
		},
		midBoss: {
			id: "trikralovy_jezdec",
			name: "👑 Tříkrálový jezdec",
			warning: "👑 POZOR: SNĚHEM CVÁLÁ TŘÍKRÁLOVÝ JEZDEC SE ZÁŘÍCÍ HVĚZDOU!",
			time: 185,
			kills: 320,
			multiplier: 1.0
		},
		finalBoss: {
			id: "vladce_chumelenice",
			name: "❄️ Vládce chumelenice",
			warning: "❄️ NEBE ZAHALILA BÍLÁ TMA! SESTUPUJE VLÁDCE LEDNOVÝCH CHUMELENIC! ❄️",
			time: 300,
			kills: 480,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			],
			afternoon: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			],
			dusk: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			],
			night: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			],
			midnight: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			],
			dawn: [
				"zimni_vrabec",
				"kluk_na_sankach",
				"ledovy_skritek",
				"trikralovy_kolednik",
				"chumelenice"
			]
		},
		keyEnemies: [
			{
				id: "zimni_vrabec",
				name: "Zimní vrabčák",
				icon: "🐦",
				role: "Rychlý lehký letec v hejnech"
			},
			{
				id: "kluk_na_sankach",
				name: "Kluk na saních",
				icon: "🛷",
				role: "Splašený těžký sáňkař řítící se sněhem"
			},
			{
				id: "obri_snehulak",
				name: "Obří sněhulák",
				icon: "⛄",
				role: "První mohutný mini-boss"
			},
			{
				id: "trikralovy_jezdec",
				name: "Tříkrálový jezdec",
				icon: "👑",
				role: "Jezdecký mezi-boss se zlatou hvězdou"
			},
			{
				id: "vladce_chumelenice",
				name: "Vládce chumelenice",
				icon: "❄️",
				role: "Vele-boss lednových mrazů a bílé tmy"
			}
		],
		bossMechanic: {
			label: "⛄ Postavení obranného sněhuláka na návsi",
			description: "Přistup ke středu návsi a stiskni [E] pro postavení sněhuláka – rázová vlna odrazí běsy a vyléčí lovce!",
			cadenceSeconds: 15
		}
	},
	21: {
		id: 21,
		name: "22. Leden v Hrusicích – Tříkrálová noc a perchta",
		shortTitle: "Tříkrálová noc",
		subtitle: "Ztichlá lednová fara, svěcená křída K+M+B a šeredná Perchta s nožem",
		theme: "january_frost",
		season: "winter",
		icon: "🗡️",
		badge: "22. Úroveň",
		isNightLevel: true,
		description: "Tříkrálová noc přikryla Hrusice třeskutým mrazem. Po staveních obchází noční děs – strašlivá Perchta v bílé roušce s ostrým nožem, která páře břicha všem, kdo porušili půst!",
		lore: "Za hluboké lednové noci se nikdo neodváží ven bez svěcené křídy K+M+B. Odemkněte ochranu fary a čelte noční můře v podobě Šeredné Perchty s nožem!",
		unlockRequirementText: "Odemkne se po poražení Vládce chumelenice ve 21. úrovni",
		skyColor: "#0F172A",
		nightSkyColor: "#020617",
		groundColor: "#1E293B",
		ambientTint: "rgba(15, 23, 42, 0.65)",
		weatherEffect: "blizzard",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "lednova_zavej",
			name: "Lednová noční vánice u fary",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "ledova_klekanice",
			name: "🔔 Ledová klekánice",
			warning: "🔔 POZOR: Z NOČNÍ MLHY SE OZÝVÁ LEDOVÝ ZVON ŠEDIVÉ KLEKÁNICE!",
			time: 85,
			kills: 150,
			multiplier: 1.0
		},
		midBoss: {
			id: "kostlivec_s_kosou",
			name: "💀 Mrazivý kostlivec s kosou",
			warning: "💀 POZOR: Z HŘBITOVNÍ ZÁVĚJE VYSTUPUJE ZIMNÍ SMRTKA S KOSOU!",
			time: 185,
			kills: 340,
			multiplier: 1.0
		},
		finalBoss: {
			id: "perchta_s_nozem",
			name: "🔪 Šeredná Perchta s nožem",
			warning: "🔪 PŮLNOČNÍ ZVON ODTIKL! PŘICHÁZÍ DĚSIVÁ ŠEREDNÁ PERCHTA S NOŽEM A NŮŽKAMI! 🔪",
			time: 300,
			kills: 520,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			],
			afternoon: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			],
			dusk: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			],
			night: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			],
			midnight: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			],
			dawn: [
				"zimni_vrabec",
				"nocni_zavejnik",
				"mrazivy_havran",
				"chumelenice",
				"ledovy_skritek"
			]
		},
		keyEnemies: [
			{
				id: "mrazivy_havran",
				name: "Mrazivý havran",
				icon: "🦅",
				role: "Rychlý dravý letec s nálety"
			},
			{
				id: "nocni_zavejnik",
				name: "Noční závějník",
				icon: "❄️",
				role: "Těžký sněhový běs s mrazivým krokem"
			},
			{
				id: "ledova_klekanice",
				name: "Ledová klekánice",
				icon: "🔔",
				role: "Noční mini-boss s mrazivým zvonem"
			},
			{
				id: "kostlivec_s_kosou",
				name: "Kostlivec s kosou",
				icon: "💀",
				role: "Zimní mezi-boss se sečnou kosou"
			},
			{
				id: "perchta_s_nozem",
				name: "Perchta s nožem",
				icon: "🔪",
				role: "Kultovní vele-boss tříkrálové noci s obřím tesákem"
			}
		],
		bossMechanic: {
			label: "✍️ Posvěcení dveří křídou K+M+B",
			description: "Přistup ke dveřím fary a stiskni [E] pro posvěcení křídou K+M+B – posvátná aura zažene chlad a omráčí všechna nečistá strašidla!",
			cadenceSeconds: 15
		}
	},
	22: {
		id: 22,
		name: "23. Únor v Hrusicích – Masopustní průvod a koblihy",
		shortTitle: "Masopustní průvod",
		subtitle: "Veselý masopustní rej na návsi, smažení koblih v hospodě a Rychtář maškar",
		theme: "carnival_feast",
		season: "winter",
		icon: "🎭",
		badge: "23. Úroveň",
		isNightLevel: false,
		description: "Na zasněžené hrusické návsi vrcholí masopustní veselí! Průvod pestrých masek v čele s laufrem a bábou s nůší obchází stavení. U hospody voní čerstvé sádlové koblihy a celému reji velí přísný Rychtář maškar.",
		lore: "Masopust držíme, nic se nebojíme! Hráč se zapojí do tance maškar, smaží v hostinci horké koblihy pro posilnění a čelí bujarému náporu masopustních figur.",
		unlockRequirementText: "Odemkne se po poražení Šeredné Perchty s nožem ve 22. úrovni",
		skyColor: "#E2E8F0",
		nightSkyColor: "#94A3B8",
		groundColor: "#F1F5F9",
		ambientTint: "rgba(255, 248, 220, 0.15)",
		weatherEffect: "snow",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"snowman",
			"fence"
		],
		arena: {
			id: "unorova_naves",
			name: "Masopustní zasněžená náves",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "masopustni_medved",
			name: "🐻 Masopustní medvěd",
			warning: "🐻 POZOR: Z HOSPODY VYBÍHÁ HUŇATÝ MASOPUSTNÍ MEDVĚD!",
			time: 85,
			kills: 150,
			multiplier: 1.0
		},
		midBoss: {
			id: "slamennik_obr",
			name: "🌾 Obří slaměník",
			warning: "🌾 POZOR: ZE STODOLY SE ŘÍTÍ OBŘÍ SLAMĚNÍK S CEPEM!",
			time: 185,
			kills: 340,
			multiplier: 1.0
		},
		finalBoss: {
			id: "rychtar_masek",
			name: "👑 Rychtář maškar",
			warning: "👑 MASOPUST VRCHOLÍ! NA NÁVES VSTOUPIL RYCHTÁŘ MAŠKAR S FERULÍ A PRÁVEM! 👑",
			time: 300,
			kills: 520,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			],
			afternoon: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			],
			dusk: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			],
			night: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			],
			midnight: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			],
			dawn: [
				"masopustni_kominik",
				"baba_s_nusi",
				"masopustni_krasojezdec",
				"masopustni_laufr",
				"koblihovy_rarach"
			]
		},
		keyEnemies: [
			{
				id: "masopustni_laufr",
				name: "Masopustní Laufr",
				icon: "🏃",
				role: "Rychlý běžec s bičíkem"
			},
			{
				id: "baba_s_nusi",
				name: "Bába s nůší",
				icon: "👵",
				role: "Těžká tancující maškara s nůší"
			},
			{
				id: "masopustni_medved",
				name: "Masopustní medvěd",
				icon: "🐻",
				role: "Hromotluk s medvědářem jako mini-boss"
			},
			{
				id: "slamennik_obr",
				name: "Obří slaměník",
				icon: "🌾",
				role: "Slaměný mezi-boss rozmetající stébla"
			},
			{
				id: "rychtar_masek",
				name: "Rychtář maškar",
				icon: "👑",
				role: "Vele-boss s masopustním glejtem a právem"
			}
		],
		bossMechanic: {
			label: "🍩 Smažení masopustních koblih v hostinci",
			description: "Přistup k hostinci U Cikánů a stiskni [E] pro usmažení čerstvých koblih – vyléčí kuráž a udělí rychlostní bonus!",
			cadenceSeconds: 15
		}
	},
	23: {
		id: 23,
		name: "24. Únor v Hrusicích – Masopustní rej a pochovávání basy",
		shortTitle: "Masopustní rej a basa",
		subtitle: "Půlnoční smuteční průvod, pochovávání basy u márnice a samotný Bakchus",
		theme: "carnival_night",
		season: "winter",
		icon: "🎻",
		badge: "24. Úroveň",
		isNightLevel: true,
		description: "Úderem půlnoci utichá veselí a nastává obřad pochovávání basy. Z potemnělých koutů vystupují smuteční maškary, kostlivci a sám Bakchus s pivním soudkem, který se odmítá vzdát vlády před nadcházejícím půstem!",
		lore: "Konec masopustu, muzika musí ztichnout! U márnice zapalte smolné louče, vykonejte symbolický pohřeb basy a přemozte Bakcha pro završení celoročního putování.",
		unlockRequirementText: "Odemkne se po poražení Rychtáře maškar ve 23. úrovni",
		skyColor: "#0F172A",
		nightSkyColor: "#020617",
		groundColor: "#1E293B",
		ambientTint: "rgba(15, 23, 42, 0.70)",
		weatherEffect: "snow",
		decorTypes: [
			"cottage",
			"tree",
			"rock",
			"will_o_wisp",
			"kaca"
		],
		arena: {
			id: "unorova_naves",
			name: "Noční smuteční náves u márnice",
			layout: "asymmetric_poi",
			poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "nocni_kobold",
			name: "👺 Noční kobold",
			warning: "👺 POZOR: ZE SKLEPA VYRÁŽÍ NOČNÍ KOBOLD A KRADE VÝSLUŽKU!",
			time: 85,
			kills: 160,
			multiplier: 1.0
		},
		midBoss: {
			id: "umrlec_basista",
			name: "☠️ Umrlec basista",
			warning: "☠️ POZOR: ZE STARÉ MÁRNICE VYCHÁZÍ UMRLEC BASISTA S ROZVRZANOU BASOU!",
			time: 185,
			kills: 360,
			multiplier: 1.0
		},
		finalBoss: {
			id: "bakchus_s_pivnim_soudkem",
			name: "🍺 Bakchus s pivním soudkem",
			warning: "🍺 PŮLNOC ODBILA! NA PIVNÍM SUDU PŘIJÍŽDÍ ROZPUSTILÝ I DĚSIVÝ BAKCHUS! 🍺",
			time: 300,
			kills: 550,
			multiplier: 1.0
		},
		spawnPools: {
			noon: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			],
			afternoon: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			],
			dusk: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			],
			night: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			],
			midnight: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			],
			dawn: [
				"plivnik_uhlik",
				"masopustni_basa",
				"smutecni_maskara",
				"nocni_smrtak",
				"mrazivy_havran"
			]
		},
		keyEnemies: [
			{
				id: "nocni_smrtak",
				name: "Noční Smrťák",
				icon: "💀",
				role: "Smuteční maškara s dřevěnou kosou"
			},
			{
				id: "masopustni_basa",
				name: "Pochovaná basa",
				icon: "🎻",
				role: "Těžká oživlá basa s dunivým tónem"
			},
			{
				id: "nocni_kobold",
				name: "Noční kobold",
				icon: "👺",
				role: "Noční mini-boss ze sklepů"
			},
			{
				id: "umrlec_basista",
				name: "Umrlec basista",
				icon: "☠️",
				role: "Kostlivý mezi-boss se smyčcem"
			},
			{
				id: "bakchus_s_pivnim_soudkem",
				name: "Bakchus s pivním soudkem",
				icon: "🍺",
				role: "Vrcholný vele-boss celého roku sedící na pivním sudu"
			}
		],
		bossMechanic: {
			label: "🎻 Pochování basy a zapálení loučí",
			description: "Přistup k márnici a stiskni [E] pro zapálení loučí a symbolický pohřeb basy – mocná rázová vlna ochromí a zažene noční běsy!",
			cadenceSeconds: 15
		}
	}
};
function isLevelUnlocked(levelId: number, meta: any) {
  if (levelId === 0) return true;
  if ((meta?.highestLevelUnlocked ?? 0) >= levelId) return true;
  if (meta?.completedLevels && meta.completedLevels[levelId]) return true;
  return false;
}

export { GAME_LEVELS, isLevelUnlocked };
