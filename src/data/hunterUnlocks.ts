import React from 'react';
export type { HunterProgress } from '../types';

var HUNTER_ORDER = [
	"wanderer",
	"shepherd",
	"korenarka",
	"watchman",
	"sexton",
	"granny"
];
function getPreviousHunter(type) {
	const idx = HUNTER_ORDER.indexOf(type);
	if (idx <= 0) return null;
	return HUNTER_ORDER[idx - 1];
}
function isHunterUnlocked(type, meta) {
	if (type === "wanderer") return true;
	return !!meta.unlockedHunters?.[type];
}
function canHunterUnlock(type, meta) {
	if (type === "wanderer") return true;
	const prev = getPreviousHunter(type);
	return !prev || isHunterUnlocked(prev, meta);
}
function getActiveUnlockingHunter(meta) {
	for (let i = 0; i < HUNTER_ORDER.length; i++) {
		const id = HUNTER_ORDER[i];
		if (!isHunterUnlocked(id, meta)) {
			if (canHunterUnlock(id, meta)) return id;
			return null;
		}
	}
	return null;
}
var HUNTER_UNLOCKS = {
	wanderer: {
		id: "wanderer",
		realName: "Poutník",
		realTitle: "Vesnický poutník z Hrusic",
		defaultUnlocked: true,
		challengeTitle: "Výchozí venkovský hrdina",
		challengeShortDesc: "Připraven k cestě od samého počátku.",
		challengeLongDesc: "Poutník s osikovým prutem a tuláckým instinktem (+35 % poškození) je odemčen ihned.",
		targetEnemies: [],
		maxCount: 0,
		milestones: [{
			minPercent: 0,
			tierLevel: 4,
			spoiledName: "Poutník (Tulák)",
			spoiledTitle: "Vesnický poutník z Hrusic",
			spoiledLore: "Vysoká kuráž (200) a dobrá nálada (+35 % poškození zbraní). Osikový prut. Schopnost: Pověstná sukovice (-30 % cooldown).",
			spoiledWeaponHint: "Osikový prut (+35 % poškození)",
			spoiledAbilityHint: "Pověstná sukovice (otočka sukovitou holí zažene a silně odhodí okolní bubáky, vzdálenější vyděsí na 4 s – cooldown 21 s)",
			clueTag: "✅ Připraven k boji"
		}]
	},
	shepherd: {
		id: "shepherd",
		realName: "Pasáček",
		realTitle: "Hbitý chlapec z pastvin",
		defaultUnlocked: false,
		challengeTitle: "🌾 Ochránce obecních pastvin",
		challengeShortDesc: "Zažeň celkem 120 polních a lučních škůdců z pastvin.",
		challengeLongDesc: "Pastviny pod Hůrkou jsou zamořeny nezbednými rarášky, sýpkovými myšáky, almarovými šotky a lesními veverčáky. Zažeň 120 těchto potvůrek, aby se mladý ochránce stád mohl bezpečně vydat na výpravu!",
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
		maxCount: 120,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÝ LOVEC]",
				spoiledTitle: "Neznámá silueta z luk",
				spoiledLore: "O této postavě zatím kolují jen mlhavé zvěsti. Vesničané v dálce na mezích vídají hbitý stín, který prý bleskově utíká před hejny rarášků.",
				spoiledWeaponHint: "Výzbroj: Zahaleno hustou mlhou",
				spoiledAbilityHint: "Schopnost: Neznámá (???)",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % škůdců pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "P _ _ _ _ _ k",
				spoiledTitle: "Rychlonožka z obecních lad",
				spoiledLore: "Z luk je o poledni slyšet pískání na vrbovou píšťalku. Podle stop v trávě jde o mladého hocha s plstěným kloboučkem, co běhá rychleji než zajíc.",
				spoiledWeaponHint: "Nápověda: Pečené buchty a toulavé nohy...",
				spoiledAbilityHint: "Nápověda: Zvuk pasteveckých zvonců...",
				clueTag: "🔍 25 %: První stopa! Odhalena silueta a původ z luk"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "P a s _ _ _ k",
				spoiledTitle: "Kamarád beranů a rychlý sběrač krejcarů",
				spoiledLore: "Sousedé už mají jasno – je to šikovný hoch ze sousedního gruntu! Vyniká mimořádnou rychlostí (220) a obřím magnetickým dosahem na krejcary.",
				spoiledWeaponHint: "Zbraň: Horké buchty z pece a velký magnet na krejcary",
				spoiledAbilityHint: "Schopnost: Dusot stáda (přivolá běžící berany)",
				clueTag: "🔎 50 %: Znáš jeho tvář, rychlost i schopnost beranů!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "P a s á č _ k",
				spoiledTitle: "Nejrychlejší hoch ze starých Hrusic",
				spoiledLore: "Mladý dobrodruh už má sbalenou mošnu, berani stojí v řadě a mává z vršku kopce! Zažeň posledních několik škůdců a přidá se do tvé družiny!",
				spoiledWeaponHint: "Start: Povidlové buchty, Rychlost 220, Dosah sběru 160",
				spoiledAbilityHint: "⚡ Speciál: Dusot stáda (140 plošného poškození a silné odhození berany)",
				clueTag: "⚡ 75 %: Téměř odemčeno! Zbývá už jen krůček k odemčení!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Pasáček",
				spoiledTitle: "Rychlý pasáček z obecních lad",
				spoiledLore: "Rychlý, snadno sbírá krejcary. Schopnost: Dusot stáda.",
				spoiledWeaponHint: "Povidlové buchty & obří dosah sběru",
				spoiledAbilityHint: "Dusot stáda (22 beranů smete nepřátele za 140 poškození)",
				clueTag: "✅ Plně odemčeno!"
			}
		]
	},
	korenarka: {
		id: "korenarka",
		realName: "Bába kořenářka",
		realTitle: "Moudrá ranhojička z lesní chaloupky",
		defaultUnlocked: false,
		challengeTitle: "🐸 Vymítač vodních tůní a blat",
		challengeShortDesc: "Zažeň celkem 60 vodních a bažinných příšer z rybníků.",
		challengeLongDesc: "Vodníci, topivci a zákeřné bludičky topí pocestné a schovávají dušičky v hrnkách pod vrbami. Zažeň 60 těchto vodních bytostí, aby se k tobě přidala moudrá bylinkářka a ranhojička!",
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
		maxCount: 60,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÝ LOVEC]",
				spoiledTitle: "Záhadná postava z močálů",
				spoiledLore: "Kdesi za rákosím u rybníka Brčálníku kdosi za úplňku sbírá svítící byliny. Tvář má zahalenou v hustém oparu a hastrmani se bojí jejího dýmu.",
				spoiledWeaponHint: "Výzbroj: Zahaleno hustou mlhou",
				spoiledAbilityHint: "Schopnost: Neznámá (???)",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % vodních běsů pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "B _ _ _   k _ _ _ _ _ _ _ a",
				spoiledTitle: "Bylinkářka z lesní samoty",
				spoiledLore: "Rybáři našli na břehu rozsypané kvítí a kelímek s hojivou mastí. Jde o zkušenou stařenku v červeném šátku, která nosí na zádech plný proutěný košík.",
				spoiledWeaponHint: "Nápověda: Hojivé byliny a devatero kvítí...",
				spoiledAbilityHint: "Nápověda: Voňavý očistný dým...",
				clueTag: "🔍 25 %: První bylina odhalena! Znáš její šátek i košík"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "B á _ _   k o ř _ _ _ _ _ a",
				spoiledTitle: "Vesnická bylinkářka pro klidnou mysl",
				spoiledLore: "To je přece naše zkušená bylinkářka! Její voňavé bylinky uklidní i v tom nejstrašidelnějším reji. Sama od sebe doplňuje +2 kuráže každé 4 sekundy a zahání bubáky ostrými lístky.",
				spoiledWeaponHint: "Zbraň: Devatery bylinky (odhánějí a kropí dotírající bubáky)",
				spoiledAbilityHint: "Schopnost: Očistné kadidlo (+55 kuráže, +30 štít a zahnání strašidel)",
				clueTag: "🔎 50 %: Znáš její bylinky i očistné kadidlo!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "B á b a   k o ř e n á _ _ a",
				spoiledTitle: "Strážkyně dobré mysli a čistých tůní",
				spoiledLore: "Moudrá stařenka už v chaloupce míchá voňavé bylinky na kuráž a bere hůl! Ještě několik zahnaných vodníků a vyrazí povzbuzovat celou vesnici.",
				spoiledWeaponHint: "Start: Devatery kvítí, Uklidnění mysli (+2 kuráž/4s)",
				spoiledAbilityHint: "⚡ Speciál: Očistné kadidlo (+55 kuráže, +30 štít & 120 plošné nature poškození)",
				clueTag: "⚡ 75 %: Bylinný dým stoupá! Zbývá už jen pár vodních běsů!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Bába kořenářka",
				spoiledTitle: "Bylinkářka s Devaterem kvítím",
				spoiledLore: "Voňavé byliny na kuráž, Devatery kvítí. Schopnost: Očistné kadidlo.",
				spoiledWeaponHint: "Devatery kvítí & stálé doplňování kuráže",
				spoiledAbilityHint: "Očistné kadidlo (+55 kuráže, +30 štít, 120 nature dmg)",
				clueTag: "✅ Plně odemčeno!"
			}
		]
	},
	watchman: {
		id: "watchman",
		realName: "Ponocný",
		realTitle: "Legendární strážce noci s Voříškem",
		defaultUnlocked: false,
		challengeTitle: "🌙 Pán hluboké noci a stodol",
		challengeShortDesc: "Zažeň celkem 40 těžkých nočních stínů a nezbedů.",
		challengeLongDesc: "Za hluboké noci a o půlnoci vylézají ze stodol Bubáci, Hromotluci a noční nezbedové. Zažeň 40 těchto nočních bubáků poctivým výpraskem nebo buchtou a povolej zkušeného nočního strážce!",
		targetEnemies: [
			{
				id: "bubak",
				name: "Noční Bubák",
				icon: "👤"
			},
			{
				id: "hromotluk",
				name: "Hromotluk ze seníku",
				icon: "👹"
			},
			{
				id: "stodolnik",
				name: "Stodolní přízrak",
				icon: "🏚️"
			},
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
				id: "cerny_pes",
				name: "Černý pes s planoucíma očima",
				icon: "🐕"
			}
		],
		maxCount: 40,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÝ LOVEC]",
				spoiledTitle: "Tajemný strážce půlnoci",
				spoiledLore: "O půlnoci se vesnicí nese hluboké volání a temný stín v těžkém kožichu obchází ploty. Zlovolné stíny před ním prchají, ale jeho totožnost je skryta v temnotě.",
				spoiledWeaponHint: "Výzbroj: Zahaleno hustou mlhou",
				spoiledAbilityHint: "Schopnost: Neznámá (???)",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % nočních monster pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "P _ _ _ _ _ ý",
				spoiledTitle: "Obránce spící vsi s lucernou",
				spoiledLore: "V temných uličkách se zaleskla okovaná čepel a zaznělo hluboké troubení na volský roh. Tento mohutný muž v beranici nespí, když ostatní leží v peřinách.",
				spoiledWeaponHint: "Nápověda: Kovaná halapartna a svaté světlo...",
				spoiledAbilityHint: "Nápověda: Troubení na poplach a čtyřnohý spojenec...",
				clueTag: "🔍 25 %: Světlo lucerny prosvítá! Znáš beranici i troubení"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "P o _ _ _ n ý",
				spoiledTitle: "Vesnický ponocný v kožichu s věrným Voříškem",
				spoiledLore: "Statný obránce v těžkém kožichu! Světlo jeho lucerny pálí okolní strašidla svatou září (16 poškození/s) a jeho troubení na volský roh zažene do paniky i ty největší běsy.",
				spoiledWeaponHint: "Zbraň: Halapartna & Svatá záře lucerny (aura poškození)",
				spoiledAbilityHint: "Schopnost: Noční roh & Voříšek (poplach zažene noční nezbedy)",
				clueTag: "🔎 50 %: Znáš jeho roh, psa Voříška i svatou lucernu!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "P o n o c _ ý",
				spoiledTitle: "Vesnický ochránce s rozsvícenou lucernou",
				spoiledLore: "Noční hlídač už si leští ostrou čepel a Voříšek netrpělivě vrtí ocasem před vraty! Ještě pár zahnadých nočních stínů a rozezní svůj roh v aréně!",
				spoiledWeaponHint: "Start: Kovaná halapartna, Pasivní svatá aura lucerny",
				spoiledAbilityHint: "⚡ Speciál: Noční roh & Voříšek (panika na 5 s a 110 fyzického poškození)",
				clueTag: "⚡ 75 %: Voříšek už štěká! Poslední noční stíny tě dělí od odemčení!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Ponocný",
				spoiledTitle: "Noční strážce v beranici s halapartnou",
				spoiledLore: "Halapartna, svatá záře lucerny. Schopnost: Noční roh & Voříšek.",
				spoiledWeaponHint: "Halapartna & Svatá záře lucerny",
				spoiledAbilityHint: "Noční roh & poplach (panika na 5 s a 110 poškození)",
				clueTag: "✅ Plně odemčeno!"
			}
		]
	},
	sexton: {
		id: "sexton",
		realName: "Pobožný kostelník",
		realTitle: "Zvoník a správce farního kostela",
		defaultUnlocked: false,
		challengeTitle: "⛪ Očista hřbitova i pekla",
		challengeShortDesc: "Zažeň celkem 60 nemrtvých a pekelníků.",
		challengeLongDesc: "Kolem hřbitova se potulují kostlivci, písaři z hrobů, umrlci a rozpustilí čertíci. Zažeň 60 nemrtvých a pekelných potvor, aby se správce farního kostela odvážil rozezvonit zvon a přidal se k výpravě!",
		targetEnemies: [
			{
				id: "skeleton",
				name: "Kostlivec ze svatého Jiří",
				icon: "💀"
			},
			{
				id: "skeleton_scythe",
				name: "Kostlivec s rezavou kosou",
				icon: "🌾"
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
				id: "hrobnik",
				name: "Ponocný kopáč",
				icon: "⚱️"
			},
			{
				id: "certik",
				name: "Čertík s měchem",
				icon: "😈"
			},
			{
				id: "ohnivy_muz",
				name: "Ohnivý rarach",
				icon: "🔥"
			},
			{
				id: "drab",
				name: "Pekelný dráb",
				icon: "👺"
			}
		],
		maxCount: 60,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÝ LOVEC]",
				spoiledTitle: "Stín u zvonice",
				spoiledLore: "Ve věži farního kostela se v noci samo rozezní zvon. Kdosi tam nahoře drží klíče od všeho svatého, ale jeho tvář nikdo neviděl.",
				spoiledWeaponHint: "Výzbroj: Zahaleno hustou mlhou",
				spoiledAbilityHint: "Schopnost: Neznámá (???)",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % nemrtvých a pekelníků pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "K _ _ _ _ _ _ _ k",
				spoiledTitle: "Správce farního kostela s klíči",
				spoiledLore: "Slyšíš cinkot klíčů a hluboký hlas farního zvonu. Ten, kdo ho rozhoupává, se nebojí ani hrobů.",
				spoiledWeaponHint: "Nápověda: Svěcená voda a kropenka...",
				spoiledAbilityHint: "Nápověda: Úder zvonu a sloup svatého světla...",
				clueTag: "🔍 25 %: Slyšíš klíče a zvon! Zažeň další nemrtvé"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "K o s _ _ _ n í k",
				spoiledTitle: "Zbožný muž se zvonem a kropenkou",
				spoiledLore: "Zbožný muž v černém kabátě! Svěcená voda z jeho kropenky pálí čerty a umrlce dvojnásobně a jeho zvon rozezní celou náves.",
				spoiledWeaponHint: "Zbraň: Kropenka se svěcenou vodou (dvojnásobný účinek na strašidla)",
				spoiledAbilityHint: "Schopnost: Farní požehnání (zvon a sloup světla)",
				clueTag: "🔎 50 %: Znáš zvon, klíče i svěcenou vodu!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "K o s t e _ n í k",
				spoiledTitle: "Poctivý kostelník s klíči od kostela",
				spoiledLore: "Kostelník už nahoře ve zvonici uvazuje provaz! Ještě pár zahnaných umrlců a rozezní farní zvon přímo v aréně!",
				spoiledWeaponHint: "Start: Kropenka se svěcenou vodou",
				spoiledAbilityHint: "⚡ Speciál: Farní požehnání (očistí nemrtvé a démony v okruhu 650 px, 25 % max. kuráže bossů)",
				clueTag: "⚡ 75 %: Zvon se už rozhoupává! Poslední nemrtví tě dělí od odemčení!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Pobožný kostelník",
				spoiledTitle: "Zvoník a správce farního kostela",
				spoiledLore: "Kropenka se svěcenou vodou a farní zvon. Schopnost: Farní požehnání.",
				spoiledWeaponHint: "Kropenka se svěcenou vodou",
				spoiledAbilityHint: "Farní požehnání (očištění nemrtvých a 25 % poškození bossů)",
				clueTag: "✅ Plně odemčeno!"
			}
		]
	},
	granny: {
		id: "granny",
		realName: "Babička a Barunka",
		realTitle: "Vlídná babička z Ratibořic a její vnučka",
		defaultUnlocked: false,
		challengeTitle: "🥖 Vlídné slovo pro zabloudilé duše",
		challengeShortDesc: "Zažeň celkem 80 polních a lesních běsů.",
		challengeLongDesc: "Na mezích a v lesích se to hemží polednicemi, klekanicemi, divoženkami, bludičkami i dřevorubci-strašidly. Zažeň 80 těchto polních a lesních běsů, aby se mohla vydat na cestu babička s vnučkou Barunkou, které mají vždycky po ruce chleba se solí!",
		targetEnemies: [
			{
				id: "polednice",
				name: "Polednice",
				icon: "🌾"
			},
			{
				id: "klekanice",
				name: "Klekánice",
				icon: "🧙‍♀️"
			},
			{
				id: "divozenka",
				name: "Lesní divoženka",
				icon: "🌲"
			},
			{
				id: "bludicka",
				name: "Bludička močálová",
				icon: "🔥"
			},
			{
				id: "drevorubec",
				name: "Duch starého dřevorubce",
				icon: "🪓"
			},
			{
				id: "plivnik",
				name: "Plivník",
				icon: "💦"
			},
			{
				id: "zaba",
				name: "Rybniční žabka",
				icon: "🐸"
			}
		],
		maxCount: 80,
		milestones: [
			{
				minPercent: 0,
				tierLevel: 0,
				spoiledName: "??? [ZAMČENÝ LOVEC]",
				spoiledTitle: "Světýlko v okně chaloupky",
				spoiledLore: "V okně chaloupky za vsí se stále svítí a voní tam čerstvý chleba. Kdo tam zaklepe, dostane hřejivé slovo, ať je to člověk, nebo strašidlo.",
				spoiledWeaponHint: "Výzbroj: Zahaleno hustou mlhou",
				spoiledAbilityHint: "Schopnost: Neznámá (???)",
				clueTag: "🔒 0 %: Zcela utajeno – zažeň 25 % polních běsů pro první stopu"
			},
			{
				minPercent: 25,
				tierLevel: 1,
				spoiledName: "B _ _ _ _ _ a & B _ _ _ _ _ a",
				spoiledTitle: "Dvě postavy s košíkem a copánky",
				spoiledLore: "Slyšíš šoupání pantoflí a dětský smích. Starší žena s košíkem a malá holčička s copánky obcházejí ves.",
				spoiledWeaponHint: "Nápověda: Něco sladkého sypaného mákem...",
				spoiledAbilityHint: "Nápověda: Chleba, sůl a hezké slovo...",
				clueTag: "🔍 25 %: Vidíš košík a copánky! Zažeň další běsy"
			},
			{
				minPercent: 50,
				tierLevel: 2,
				spoiledName: "B a b _ _ k a & B a r _ _ k a",
				spoiledTitle: "Laskavá babička s vnučkou",
				spoiledLore: "Babička nosí v košíku chleba a sůl, vnučka jí pomáhá a zpívá. Dokázaly by uklidnit i největšího zuřivce jediným vlídným slovem!",
				spoiledWeaponHint: "Zbraň: Kynutý koláč s mákem (odrazí se k dalšímu)",
				spoiledAbilityHint: "Schopnost: Zastavený čas a vlídné slovo (uklidní hordu)",
				clueTag: "🔎 50 %: Znáš chleba, sůl i Barunčiny copánky!"
			},
			{
				minPercent: 75,
				tierLevel: 3,
				spoiledName: "B a b i č _ a & B a r u n _ a",
				spoiledTitle: "Hrdinky ze staročeské vsi s čerstvým chlebem",
				spoiledLore: "Babička už zabalila chleba do ubrousku a Barunka si zavazuje copánky! Ještě pár zahnaných polních běsů a vyrazí do arény!",
				spoiledWeaponHint: "Start: Kynutý koláč s mákem, Barunka po boku",
				spoiledAbilityHint: "⚡ Speciál: Chléb se solí a vlídné slovo (čas se zastaví, Food nebo Holy dle nižšího resistu bubáka)",
				clueTag: "⚡ 75 %: Chleba už voní! Poslední běsi tě dělí od odemčení!"
			},
			{
				minPercent: 100,
				tierLevel: 4,
				spoiledName: "Babička a Barunka",
				spoiledTitle: "Vlídná babička z Ratibořic a její vnučka",
				spoiledLore: "Kynutý koláč s mákem a Barunka po boku. Schopnost: Chléb se solí a vlídné slovo (bere se jako Food nebo Holy podle toho, co má bubák slabší).",
				spoiledWeaponHint: "Kynutý koláč s mákem",
				spoiledAbilityHint: "Chléb se solí a vlídné slovo (Food/Holy dle menší odolnosti bubáka)",
				clueTag: "✅ Plně odemčeno!"
			}
		]
	}
};
/**
* Calculates current unlock progress and spoil details for a hunter based on meta-progression
*/
function getHunterProgress(type, meta) {
	const def = HUNTER_UNLOCKS[type];
	if (!def) return {
		id: type,
		isUnlocked: true,
		canUnlock: true,
		isQueued: false,
		curCount: 0,
		maxCount: 0,
		percent: 100,
		tier: 4,
		spoiledName: type,
		spoiledTitle: "",
		spoiledLore: "",
		spoiledWeaponHint: "",
		spoiledAbilityHint: "",
		clueTag: "Odemčeno",
		enemiesBreakdown: []
	};
	if (def.defaultUnlocked) {
		const m = def.milestones[0];
		return {
			id: type,
			isUnlocked: true,
			canUnlock: true,
			isQueued: false,
			curCount: 0,
			maxCount: 0,
			percent: 100,
			tier: 4,
			spoiledName: m.spoiledName,
			spoiledTitle: m.spoiledTitle,
			spoiledLore: m.spoiledLore,
			spoiledWeaponHint: m.spoiledWeaponHint,
			spoiledAbilityHint: m.spoiledAbilityHint,
			clueTag: m.clueTag,
			enemiesBreakdown: []
		};
	}
	if (isHunterUnlocked(type, meta)) {
		const lastMilestone = def.milestones[def.milestones.length - 1] || def.milestones[0];
		return {
			id: type,
			isUnlocked: true,
			canUnlock: true,
			isQueued: false,
			curCount: def.maxCount,
			maxCount: def.maxCount,
			percent: 100,
			tier: 4,
			spoiledName: def.realName,
			spoiledTitle: def.realTitle,
			spoiledLore: lastMilestone.spoiledLore,
			spoiledWeaponHint: lastMilestone.spoiledWeaponHint,
			spoiledAbilityHint: lastMilestone.spoiledAbilityHint,
			clueTag: "✅ Plně odemčeno!",
			enemiesBreakdown: def.targetEnemies.map((e) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: meta.hunterKillCounts?.[type]?.[e.id] ?? def.maxCount
			}))
		};
	}
	const prevId = getPreviousHunter(type);
	if (!canHunterUnlock(type, meta) && prevId) {
		const m0 = def.milestones[0];
		return {
			id: type,
			isUnlocked: false,
			canUnlock: false,
			isQueued: true,
			requiredHunterName: "Předchozí lovec",
			curCount: 0,
			maxCount: def.maxCount,
			percent: 0,
			tier: 0,
			spoiledName: m0.spoiledName,
			spoiledTitle: m0.spoiledTitle,
			spoiledLore: "Tento lovec se začne odemykat teprve poté, co odemknete předchozího hrdinu v pořadí.",
			spoiledWeaponHint: m0.spoiledWeaponHint,
			spoiledAbilityHint: m0.spoiledAbilityHint,
			clueTag: "🔒 Čeká na odemčení předchozího lovce",
			enemiesBreakdown: def.targetEnemies.map((e) => ({
				id: e.id,
				name: e.name,
				icon: e.icon,
				count: 0
			}))
		};
	}
	const hunterKills = meta.hunterKillCounts?.[type] || (type === "shepherd" ? meta.bestiaryKills || {} : {});
	let curCount = 0;
	const enemiesBreakdown = def.targetEnemies.map((e) => {
		const cnt = hunterKills[e.id] || 0;
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
		id: type,
		isUnlocked,
		canUnlock: true,
		isQueued: false,
		curCount: Math.min(def.maxCount, curCount),
		maxCount: def.maxCount,
		percent,
		tier,
		spoiledName: milestone.spoiledName,
		spoiledTitle: milestone.spoiledTitle,
		spoiledLore: milestone.spoiledLore,
		spoiledWeaponHint: milestone.spoiledWeaponHint,
		spoiledAbilityHint: milestone.spoiledAbilityHint,
		clueTag: milestone.clueTag,
		enemiesBreakdown
	};
}

export { HUNTER_ORDER, getPreviousHunter, isHunterUnlocked, canHunterUnlock, getActiveUnlockingHunter, HUNTER_UNLOCKS, getHunterProgress };
