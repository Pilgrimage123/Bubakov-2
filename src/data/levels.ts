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
				"blatouch"
			],
			afternoon: [
				"blatouch",
				"sotek",
				"jezinka_mraziva",
				"mysak"
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
				"blatouch"
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
				"ohniva_kobyla"
			],
			midnight: [
				"mrazovy_skritek",
				"bludicka",
				"jezinka_mraziva"
			],
			dawn: [
				"mrazovy_skritek",
				"bludicka",
				"jezinka_mraziva",
				"tajici_snehulak",
				"mrazivy_obr",
				"ohnivy_muz",
				"ohniva_kobyla"
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
				"rarach"
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
				"rarach"
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
				"certik"
			],
			afternoon: [
				"hrobnik",
				"pisar",
				"skeleton_scythe",
				"cerny_pes",
				"carodejnice_koste",
				"sazovy_rarach"
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
				"vodnicek"
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
				"divozenka"
			],
			afternoon: [
				"zbojnik",
				"jiskrivec",
				"ohnivy_pes",
				"drevorubec"
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
				"ohnivy_muz"
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
				"ohniva_kobyla"
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
				"jiskrivec"
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
				"zbojnik"
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
				"rarach"
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
				"rarach"
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
				"divozenka"
			],
			afternoon: [
				"bludicka",
				"divozenka",
				"jiskrivec",
				"kalny_hastrman",
				"certik"
			],
			dusk: [
				"bludicka",
				"divozenka",
				"jiskrivec",
				"rak_ricni",
				"boruvkovy_diblik",
				"certik",
				"ohnivy_muz"
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
				"sotek"
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
				"zbojnik"
			],
			night: [
				"zitna_baba",
				"cert_sekac",
				"drab",
				"polednice",
				"zbojnik"
			],
			midnight: [
				"zitna_baba",
				"cert_sekac",
				"drab",
				"zbojnik"
			],
			dawn: [
				"polni_krecek",
				"roj_polnich_mysaku",
				"zitna_baba",
				"boruvkovy_diblik",
				"rak_ricni"
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
		unlockRequirementText: "Poražte Tříhlavého Draka v 10. úrovni (Červencová noc)",
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
				"sotek"
			],
			afternoon: [
				"srpnove_cmelak",
				"zlatohlavek",
				"polni_mysice",
				"polni_krecek",
				"zitna_baba"
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
				"polni_krecek"
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
		description: "Černá srpnová obloha plná padajících hvězd! Na vrších vzplanou dožínkové vatry zahánějící Noční můry a ze zlenických skal slétá obávaný Výr velký.",
		lore: "Kolem svatého Vavřince padají z nebe ohnivé slzy. Kdo v noci zažehne posvátnou vatru u kostela, zažene můří přízraky a získá sílu čelit Výru velkému.",
		unlockRequirementText: "Poražte Dožínkového chasníka v 11. úrovni (Dožínková slavnost)",
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
				"polni_mysice"
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
				"ohnivy_sudlicka"
			],
			night: [
				"nocni_mura",
				"cerny_vlkodlak",
				"krvavy_kostlivec",
				"bila_pani",
				"ohniva_kobyla",
				"ohnivy_sudlicka"
			],
			midnight: [
				"nocni_mura",
				"cerny_vlkodlak",
				"cert_sekac",
				"krvavy_kostlivec",
				"bezhlavy_rytir",
				"ohniva_kobyla"
			],
			dawn: [
				"nocni_mura",
				"cerny_pes",
				"kulovy_blesk",
				"bila_pani",
				"zbrojnos"
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
	}
};
function isLevelUnlocked(levelId, meta) { return (meta?.highestLevelUnlocked ?? 0) >= levelId; }

export { GAME_LEVELS, isLevelUnlocked };
