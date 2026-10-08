import type { VillageBuilding } from '../types';

export const VILLAGE_BUILDINGS: VillageBuilding[] = [
	{
		id: "oven",
		name: "Pekárna u rozpálené pece",
		levelKey: "ovenLevel",
		role: "Pekařství a kovářská výheň",
		helpers: "Ochočení rarášci s lopatami",
		story: "Pekař Jan zjistil, že když raráškům nabídne misku švestkových povidel, přestanou dělat neplechu a naopak neúnavně přikládají dubová polena do pece. Buchty z této pece pečou tak žhavé, že popálí každého bubáka!",
		bonusDesc: (lvl) => `Pekelný žár: +${lvl * 10}% k poškození všech zbraní lovce`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "scarecrow",
		name: "Pšeničné lano a polní mez",
		levelKey: "scarecrowLevel",
		role: "Ochrana úrody a polí",
		helpers: "Zpacifikovaní bubáci jako strašáci",
		story: "Rychtář oblékl přemožené bubáky do starých šosatých kabátů a postavil je doprostřed pšeničného pole. Žádný havran ani cizí diblík se teď neodváží přiblížit a mince se k lovci samy kutálejí!",
		bonusDesc: (lvl) => `Pozorná aura: +${lvl * 25} k dosahu sběru krejcarů a předmětů`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawScarecrowScene"
	},
	{
		id: "mill",
		name: "Vodní mlýn na náhonu",
		levelKey: "millLevel",
		role: "Mletí mouky a pohon struhy",
		helpers: "Hastrmani roztáčející mlýnské kolo",
		story: "Mlynář slíbil hastrmanům, že jim nechá celý rákosový rybníček pod splavem pro jejich dušičky, pokud pomohou točit těžkým mlýnským kolem. Hastrmani nadšeně stříkají vodu a proud žene celou vesnici kupředu!",
		bonusDesc: (lvl) => `Vodní proud: +${lvl * 15} k rychlosti chůze lovce`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawMillScene"
	},
	{
		id: "wall",
		name: "Kamenné hradby a bašta",
		levelKey: "wallLevel",
		role: "Obrana vesnice a zdi gruntů",
		helpers: "Kostliví zedníci se zednickými lžícemi",
		story: "Kostliví pomocníci vyměnili své nářadí za zednické lžíce a maltu. Celou noc pilně rovnají žulové kvádry a zalévají spáry, takže zdi vesnice vydrží i nápor nejdivočejších nezbedů.",
		bonusDesc: (lvl) => `Kamenné zdi: +${lvl * 25} max kuráž & +${lvl * 5}% odolnost proti vylekání`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "tavernShield",
		name: "Šenkýřův ochranný štít",
		levelKey: "tavernShieldLevel",
		role: "Dočasná ochrana lovce",
		helpers: "Šenkýři zpevňující kožené štíty",
		story: "Šenkýř nalije lovci na kuráž a připraví ho na první leknutí a bubácké schválnosti.",
		bonusDesc: (lvl) => `Obrněná mysl (štít): ${lvl > 0 ? 40 + lvl * 20 : 0} bodů kuráže na začátku výpravy`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "bell",
		name: "Zvonice",
		levelKey: "bellLevel",
		role: "Urychlení speciální schopnosti",
		helpers: "Zvoníci svolávající pomoc",
		story: "Každý úder zvonu připomíná lovci, že další speciální schopnost je zase o něco blíž.",
		bonusDesc: (lvl) => `Zrychlení ultimátu: +${lvl * 8}% k rychlosti odpočtu cooldownu`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "forge",
		name: "Kovářská výheň",
		levelKey: "forgeLevel",
		role: "Plošné posílení poškození",
		helpers: "Kováři kalící každý úder",
		story: "Kovář přidává do každého zásahu pevnou porci síly, takže i malé údery mají spolehlivou váhu.",
		bonusDesc: (lvl) => `Výheň: +${lvl * 2} flat damage ke každému zásahu`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "church",
		name: "Kaple svaté vlny",
		levelKey: "churchLevel",
		role: "Svatá vlna při nákupu u Dědečka",
		helpers: "Kostelníci připravující posvěcený zvon",
		story: "Při každém nákupu v dědečkově nůši vyšle kaple kolem lovce posvěcenou tlakovou vlnu.",
		bonusDesc: (lvl) => `Svatá vlna: ${lvl * 100} posvátného poškození + silný odhoz v okruhu 400 px při nákupu u Dědečka`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "water",
		name: "Návesní studánka",
		levelKey: "waterLevel",
		role: "Pramenitá voda a posílení lektvarů",
		helpers: "Vodní víly střežící čistý pramen",
		story: "Uprostřed návsi vyvěrá křišťálový pramen, který nikdy nezamrzá. Napijí-li se z něj lovec, zahojí se mu i hluboké rány a na chvíli získá posvátný klid a odolnost vůči všemu zlu.",
		bonusDesc: (lvl) => `Pramenitá voda: +${lvl * 20}% k účinku lektvarů & +${lvl * 2} s nezranitelnosti po vypití`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawMillScene"
	},
	{
		id: "forest",
		name: "Hustý borový les",
		levelKey: "forestLevel",
		role: "Zvyk na mokřady a odolnost terénu",
		helpers: "Lesní mužíci vysekávající suché stezky",
		story: "Starý borový les za vsí skrývá nebezpečná rašeliniště a hluboké louže. Kdo se však naučí lesním stezkám, nezapadne do bahna a promočení z něj spadne dvakrát rychleji.",
		bonusDesc: (lvl) => `Zvyk na mokřad: o ${Math.min(100, lvl * 40)}% kratší trvání promočení a zpomalení`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawScarecrowScene"
	},
	{
		id: "undead",
		name: "Hřbitovní brána",
		levelKey: "undeadLevel",
		role: "Krocení hrobových běsů a zlevnění truhel",
		helpers: "Hrobníci s posvěceným vápnem",
		story: "Kovaná brána se železným křížem drží neklidné umrlce na posvěcené půdě. Když hrobníci bránu řádně zažehnají, poklady starých časů vyplují na povrch mnohem dříve.",
		bonusDesc: (lvl) => `Zažehnané hroby: o ${lvl * 20} méně poražených strašidel nutných pro objevení truhly`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "regen",
		name: "Bylinková zahrádka",
		levelKey: "regenLevel",
		role: "Léčivé bylinky a trvalá regenerace",
		helpers: "Bába kořenářka sušící mateřídoušku",
		story: "Na prosluněné mezi za chalupou voní mateřídouška, třezalka a heřmánek. Voňavé masti a horké čaje dodávají lovci klidnou mysl a vrací ztracenou Kuráž každou chvíli.",
		bonusDesc: (lvl) => `Léčivé bylinky: +${lvl * 3} Kuráže doplňováno každých 5 sekund`,
		cost: (lvl) => 35 * (lvl + 1),
		canvasDrawer: "drawOvenScene"
	}
];
