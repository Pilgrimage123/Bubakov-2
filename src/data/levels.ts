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
			poiOrder: ["fields", "church", "tavern", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "blatouch",
			name: "🌼 Blatouchový skřítek",
			warning: "🌼 POZOR: Z ROZVODNĚNÉ MEZE VYBÍHÁ BLATOUCHOVÝ SKŘÍTEK!",
			time: 85,
			kills: 45,
			multiplier: 3.5
		},
		midBoss: {
			id: "vodnicek",
			name: "💧 Jarní Vodníček",
			warning: "💧 POZOR: Z TAJÍCÍCH KER VYSTUPUJE JARNÍ VODNÍČEK!",
			time: 185,
			kills: 120,
			multiplier: 1.6
		},
		finalBoss: {
			id: "vrana",
			name: "🐦‍⬛ Hejno mrazivých vran",
			warning: "🐦‍⬛ NEBE ZTEMNĚLO! NAD POLEMI KROUŽÍ HEJNO MRAZIVÝCH VRAN! 🐦‍⬛",
			time: 300,
			kills: 220,
			multiplier: 1.1
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
			poiOrder: ["fields", "church", "tavern", "pond", "mill", "forest", "shrine"]
		},
		miniBoss: {
			id: "tajici_snehulak",
			name: "⛄ Horda tajících sněhuláků",
			warning: "⛄ POZOR: ZE ZÁVĚJÍ SE VALÍ HORDA TAJÍCÍCH SNĚHULÁKŮ!",
			time: 85,
			kills: 50,
			multiplier: 3.0
		},
		midBoss: {
			id: "mrazivy_obr",
			name: "❄️ Mrazivý obr",
			warning: "❄️ POZOR: ZE ZAMRZLÝCH POLÍ VYSTUPUJE MRAZIVÝ OBR!",
			time: 185,
			kills: 130,
			multiplier: 1.6
		},
		finalBoss: {
			id: "morana",
			name: "❄️ Morana — špatně vynesená smrtka",
			warning: "❄️ ZIMU NELZE VYNÉST! MORANA SE VRACÍ Z MRÁZŮ! ❄️",
			time: 300,
			kills: 240,
			multiplier: 1.05
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
				"mrazivy_obr"
			],
			midnight: [
				"mrazovy_skritek",
				"bludicka",
				"jezinka_mraziva"
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
			multiplier: 3.2
		},
		midBoss: {
			id: "carodejnice_stara",
			name: "🧹 Stará ježibaba z Melechu",
			warning: "🧹 POZOR: ZE STRNIŠTĚ VZLÉTLI ČARODĚJNICKÉ VÍRY SE STAROU JEŽIBABOU! 🧹",
			time: 185,
			kills: 130,
			multiplier: 1.6
		},
		finalBoss: {
			id: "vrchni_carodejnice",
			name: "🧹 Vrchní Filipojakubská Čarodějnice",
			warning: "🧹 NEBE ZAPLÁLO! NAD HRUSICEMI KROUŽÍ VRCHNÍ FILIPOJAKUBSKÁ ČARODĚJNICE! 🧹",
			time: 300,
			kills: 240,
			multiplier: 1.1
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
		subtitle: "Filipojakubská noc, plápolající hranice a reje čarodějnic",
		theme: "spring_village",
		season: "spring",
		icon: "🔥",
		badge: "4. Úroveň",
		description: "S příchodem noci vzplály na kopcích filipojakubské ohně. Vzduchem sviští čarodějnická košťata a z mezí vylézá noční jarní havěť.",
		lore: "Na Filipa a Jakuba čarodějnice létat troufá! Zapalte smolné hranice, udržte oheň na návsi a vykažte z kraje noční čarodějnický sabat.",
		unlockRequirementText: "Odemkne se pokořením Vrchní Filipojakubské Čarodějnice ve 3. úrovni",
		skyColor: "#6B584E",
		nightSkyColor: "#1A1822",
		groundColor: "#36382E",
		ambientTint: "rgba(38, 28, 48, 0.45)",
		weatherEffect: "fog",
		decorTypes: [
			"tombstone",
			"cross",
			"tree",
			"will_o_wisp",
			"cottage"
		],
		miniBoss: {
			id: "klekanice",
			name: "🔔 Večerní Klekánice",
			warning: "🔔 POZOR: ZVONÍ KLEKÁNÍ A PŘICHÁZÍ DĚSIVÁ KLEKÁNICE! 🔔",
			time: 45,
			kills: 55,
			multiplier: 3.8
		},
		midBoss: {
			id: "drab",
			name: "⛓️ Pekelný dráb s karabáčem",
			warning: "⛓️ POZOR: PŘICHÁZÍ OBŘÍ PEKELNÝ DRÁB S ŘETĚZY! ⛓️",
			time: 95,
			kills: 125,
			multiplier: 3.6
		},
		finalBoss: {
			id: "hejkal",
			name: "🌲 Půlnoční Hejkal z hvozdů",
			warning: "🌲 PŘICHÁZÍ ŠÉF ÚROVNĚ: PŮLNOČNÍ HEJKAL! 🌲",
			time: 165,
			kills: 230,
			multiplier: 1.55
		},
		spawnPools: {
			noon: [
				"skeleton",
				"cerny_pes",
				"hrobnik",
				"umrlec"
			],
			afternoon: [
				"hrobnik",
				"pisar",
				"skeleton_scythe",
				"cerny_pes",
				"drevorubec"
			],
			dusk: [
				"krvavy_kostlivec",
				"skeleton_scythe",
				"hrobnik",
				"cerny_pes",
				"umrlec"
			],
			night: [
				"bubak",
				"krvavy_kostlivec",
				"stodolnik",
				"drevorubec",
				"drab"
			],
			midnight: [
				"hromotluk",
				"drab",
				"bubak",
				"krvavy_kostlivec",
				"cerny_pes"
			]
		},
		keyEnemies: [
			{
				id: "skeleton",
				name: "Kostlivec",
				icon: "💀",
				role: "Hřbitovní cháska"
			},
			{
				id: "cerny_pes",
				name: "Černý pes",
				icon: "🐕",
				role: "Noční stín"
			},
			{
				id: "bubak",
				name: "Bubák ze stodoly",
				icon: "👻",
				role: "Noční strašidlo"
			},
			{
				id: "klekanice",
				name: "Klekánice",
				icon: "🔔",
				role: "Večerní přízrak"
			},
			{
				id: "hejkal",
				name: "Půlnoční Hejkal",
				icon: "🌲",
				role: "Hlavní boss"
			}
		],
		bossMechanic: {
			label: "Hromové zahejkání a padající větve",
			description: "Mocný řev otřese hvozdem, vrhne salvu větví a přivolá lesní potvory.",
			cadenceSeconds: 12
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
			multiplier: 3.2
		},
		midBoss: {
			id: "hastrman",
			name: "💧 Bahenní hastrman z Brčálníku",
			warning: "💧 POZOR: Z VYHŘÁTÉHO RYBNÍKA VYSTUPUJE BAHENNÍ HASTRMAN S HRNEČKY! 💧",
			time: 185,
			kills: 130,
			multiplier: 1.6
		},
		finalBoss: {
			id: "ledovi_muzi",
			name: "🧊 Ledoví Muži (Pankrác, Servác a Bonifác)",
			warning: "🧊 POZOR: KVĚTNOVÝ MRÁZ! NA NÁVES PŘICHÁZEJÍ LEDOVÍ MUŽI V KOŽUŠÍCH! 🧊",
			time: 300,
			kills: 250,
			multiplier: 1.15
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
		name: "6. Staré hamry a Čertův mlýn",
		shortTitle: "Hamry a Čertův mlýn",
		subtitle: "Žhavé výhně, moučný prach a zrádná povodeň",
		theme: "mill_forge",
		season: "autumn",
		icon: "⚙️",
		badge: "6. Úroveň",
		description: "Pod zčernalými hamry se otáčí prokletý mlýn. Jiskry létají z kovadlin a mlynářova voda bere vše, co jí stojí v cestě.",
		lore: "Zastavte zbojníky, jiskřivce a mlynářovy služebníky dřív, než se Čertův mlýn roztočí naplno.",
		unlockRequirementText: "Odemkne se po poražení Ledových mužů v 5. úrovni",
		skyColor: "#8B5E3C",
		nightSkyColor: "#21150F",
		groundColor: "#514237",
		ambientTint: "rgba(255, 125, 30, 0.16)",
		weatherEffect: "fog",
		decorTypes: [
			"cottage",
			"tree",
			"will_o_wisp"
		],
		miniBoss: {
			id: "zbojnik",
			name: "🗡️ Zbojník z hamrů",
			warning: "🗡️ ZE SOUTĚSKY VYRÁŽÍ OBÁVANÝ HEJTMAN ZBOJNÍK!",
			time: 45,
			kills: 80,
			multiplier: 5.6
		},
		midBoss: {
			id: "ohnivy_pes",
			name: "🔥 Ohnivý pes z výhně",
			warning: "🔥 VÝHEŇ VYPUSTILA MOCNÉHO OHNIVÉHO PSA!",
			time: 100,
			kills: 170,
			multiplier: 5.0
		},
		finalBoss: {
			id: "mlynar",
			name: "🌊 Prokletý Mlynář",
			warning: "🌊 ŠÉF ÚROVNĚ: MLYNÁŘ OTEVÍRÁ STAVIDLA!",
			time: 175,
			kills: 300,
			multiplier: 2.05
		},
		spawnPools: {
			noon: [
				"zbojnik",
				"jiskrivec",
				"sazovy_rarach",
				"sotek"
			],
			afternoon: [
				"zbojnik",
				"jiskrivec",
				"ohnivy_pes",
				"ropucha"
			],
			dusk: [
				"ohnivy_pes",
				"obrneny_zbojnik",
				"zbojnik",
				"drab"
			],
			night: [
				"ohnivy_pes",
				"obrneny_zbojnik",
				"drab",
				"jiskrivec"
			],
			midnight: [
				"obrneny_zbojnik",
				"ohnivy_pes",
				"drab",
				"sazovy_rarach"
			]
		},
		keyEnemies: [
			{
				id: "zbojnik",
				name: "Zbojník",
				icon: "🗡️",
				role: "Hamerský lapka"
			},
			{
				id: "jiskrivec",
				name: "Jiskřivec",
				icon: "✨",
				role: "Žhavý skřítek"
			},
			{
				id: "ohnivy_pes",
				name: "Ohnivý pes",
				icon: "🔥",
				role: "Strážce výhně"
			},
			{
				id: "mlynar",
				name: "Mlynář",
				icon: "🌊",
				role: "Hlavní boss"
			}
		],
		bossMechanic: {
			label: "Povodňová vlna a moučný mrak",
			description: "Pravidelné vlny tlačí lovce; moučný mrak na chvíli zhoršuje výhled.",
			cadenceSeconds: 14
		}
	},
	6: {
		id: 6,
		name: "7. Pustá Hláska a Zlenické podhradí",
		shortTitle: "Hláska a podhradí",
		subtitle: "Bílé paní, zbrojnoši a bezhlavý jezdec",
		theme: "ruined_castle",
		season: "autumn",
		icon: "🏰",
		badge: "7. Úroveň",
		description: "Rozbitými zdmi podhradí táhne ledový vítr. Přízraky hlídají cestu k věži, kde čeká rytíř bez hlavy.",
		lore: "Přelstěte hradní stráž a vyhněte se odražené hlavě, která se vrací k pánovi jako střela.",
		unlockRequirementText: "Odemkne se po poražení Prokletého Mlynáře v 6. úrovni",
		skyColor: "#77808C",
		nightSkyColor: "#121520",
		groundColor: "#55545B",
		ambientTint: "rgba(191, 219, 254, 0.15)",
		weatherEffect: "fog",
		decorTypes: [
			"tombstone",
			"cross",
			"tree"
		],
		miniBoss: {
			id: "bila_pani",
			name: "👻 Bílá paní z věže",
			warning: "👻 VĚŽ OPOUŠTÍ MOCNÝ PŘÍZRAK BÍLÉ PANÍ!",
			time: 45,
			kills: 90,
			multiplier: 6.2
		},
		midBoss: {
			id: "zbrojnos",
			name: "🛡️ Zbrojnoš z podhradí",
			warning: "🛡️ BRÁNU DRŽÍ TĚŽKÝ OBRNĚNÝ ZBROJNOŠ!",
			time: 105,
			kills: 190,
			multiplier: 5.2
		},
		finalBoss: {
			id: "bezhlavy_rytir",
			name: "🗡️ Bezhlavý rytíř",
			warning: "🗡️ ŠÉF ÚROVNĚ: BEZHLAVÝ RYTÍŘ VYJÍŽDÍ!",
			time: 180,
			kills: 330,
			multiplier: 2.25
		},
		spawnPools: {
			noon: [
				"bila_pani",
				"zbrojnos",
				"skeleton",
				"krvavy_kostlivec"
			],
			afternoon: [
				"bila_pani",
				"zbrojnos",
				"cerny_pes",
				"krvavy_kostlivec"
			],
			dusk: [
				"zbrojnos",
				"krvavy_kostlivec",
				"obrneny_zbojnik",
				"skeleton_scythe"
			],
			night: [
				"bila_pani",
				"zbrojnos",
				"bubak",
				"obrneny_zbojnik"
			],
			midnight: [
				"zbrojnos",
				"bubak",
				"drab",
				"obrneny_zbojnik",
				"cerny_pes"
			]
		},
		keyEnemies: [
			{
				id: "bila_pani",
				name: "Bílá paní",
				icon: "👻",
				role: "Hradní přízrak"
			},
			{
				id: "zbrojnos",
				name: "Zbrojnoš",
				icon: "🛡️",
				role: "Těžká stráž"
			},
			{
				id: "bezhlavy_rytir",
				name: "Bezhlavý rytíř",
				icon: "🗡️",
				role: "Hlavní boss"
			}
		],
		bossMechanic: {
			label: "Odražená hlava",
			description: "Rytířův odražený útok se vrací po bojišti a nutí měnit směr.",
			cadenceSeconds: 12
		}
	},
	7: {
		id: 7,
		name: "8. Dračí sluj pod Melechovskou skálou",
		shortTitle: "Dračí sluj",
		subtitle: "Rampouchy, noční můry a líný tříhlavý drak",
		theme: "dragon_cave",
		season: "winter",
		icon: "🐉",
		badge: "8. Úroveň",
		description: "V nejhlubší sluji pod skálou se střídá ledový dech s ohněm. Každý krok může spustit rampouch.",
		lore: "Poslední výprava vede k tříhlavému drakovi: jedna hlava spí, druhá chrlí oheň a třetí hlídá kořist.",
		unlockRequirementText: "Odemkne se po poražení Bezhlavého rytíře v 7. úrovni",
		skyColor: "#334155",
		nightSkyColor: "#080B15",
		groundColor: "#25313D",
		ambientTint: "rgba(96, 165, 250, 0.18)",
		weatherEffect: "snow",
		decorTypes: [
			"tree",
			"cross",
			"snowman"
		],
		miniBoss: {
			id: "snehulak",
			name: "☃️ Zlomyslný sněhulák",
			warning: "☃️ ZE SLUJE SE KUTÁLÍ ZLOMYSLNÝ SNĚHULÁK!",
			time: 45,
			kills: 100,
			multiplier: 6.8
		},
		midBoss: {
			id: "nocni_mura",
			name: "🌑 Noční můra",
			warning: "🌑 TEMNOTOU SE ŽENE DĚSIVÁ NOČNÍ MŮRA!",
			time: 105,
			kills: 210,
			multiplier: 9.6
		},
		finalBoss: {
			id: "drak",
			name: "🐉 Tříhlavý líný Drak",
			warning: "🐉 ŠÉF ÚROVNĚ: PROBUDIL SE TŘÍHLAVÝ DRAK!",
			time: 185,
			kills: 360,
			multiplier: 2.5
		},
		spawnPools: {
			noon: [
				"snehulak",
				"nocni_mura",
				"severak",
				"sazovy_rarach"
			],
			afternoon: [
				"snehulak",
				"nocni_mura",
				"ohnivy_pes",
				"mrazik"
			],
			dusk: [
				"nocni_mura",
				"snehulak",
				"ohnivy_pes",
				"krvavy_kostlivec"
			],
			night: [
				"nocni_mura",
				"snehulak",
				"severak",
				"obrneny_zbojnik"
			],
			midnight: [
				"snehulak",
				"nocni_mura",
				"ohnivy_pes",
				"hromotluk",
				"drab"
			]
		},
		keyEnemies: [
			{
				id: "snehulak",
				name: "Sněhulák",
				icon: "☃️",
				role: "Ledový bijec"
			},
			{
				id: "nocni_mura",
				name: "Noční můra",
				icon: "🌑",
				role: "Stínový lovec"
			},
			{
				id: "drak",
				name: "Drak",
				icon: "🐉",
				role: "Hlavní boss"
			}
		],
		bossMechanic: {
			label: "Rampouchy a tři dračí hlavy",
			description: "Rampouchy padají ze stropu; drak střídá spící, ohnivou a hlídající hlavu.",
			cadenceSeconds: 10
		}
	}
};
function isLevelUnlocked(levelId, meta) { return (meta?.highestLevelUnlocked ?? 0) >= levelId; }

export { GAME_LEVELS, isLevelUnlocked };
