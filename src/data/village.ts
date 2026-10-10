import type { VillageBuilding, MetaProgression } from '../types';

export const VILLAGE_TAX_RATE = 0.15;

/**
 * Returns total number of upgrade levels purchased across all village buildings.
 */
export function getVillageTotalLevels(meta: Partial<MetaProgression>): number {
	return VILLAGE_BUILDINGS.reduce((sum, b) => sum + ((meta[b.levelKey] as number) || 0), 0);
}

/**
 * Calculates current price for a building upgrade based on its base cost
 * and the total number of village upgrade levels purchased so far (Obecní přirážka).
 */
export function getVillageBuildingCost(baseCost: number, totalVillageLevels: number): number {
	return Math.round((baseCost * (100 + totalVillageLevels * 15)) / 100);
}

/**
 * Deterministically simulates the purchase sequence to calculate the exact
 * 100% fair refund amount for all current village upgrades.
 * Upgrades are simulated from lowest baseCost to highest to reconstruct the shopping basket.
 */
export function calculateTotalVillageInvested(meta: Partial<MetaProgression>): number {
	const purchasedBaseCosts: number[] = [];
	for (const b of VILLAGE_BUILDINGS) {
		const lvl = (meta[b.levelKey] as number) || 0;
		for (let i = 0; i < lvl; i++) {
			purchasedBaseCosts.push(b.baseCost);
		}
	}
	purchasedBaseCosts.sort((a, b) => a - b);

	let totalCost = 0;
	for (let step = 0; step < purchasedBaseCosts.length; step++) {
		totalCost += getVillageBuildingCost(purchasedBaseCosts[step], step);
	}
	return totalCost;
}

export const VILLAGE_BUILDINGS: VillageBuilding[] = [
	{
		id: "scarecrow",
		name: "Pšeničné lano a polní mez",
		levelKey: "scarecrowLevel",
		role: "Ochrana úrody a polí",
		baseCost: 30,
		helpers: "Zpacifikovaní bubáci v šosatých kabátech",
		story: "Rychtář oblékl přemožené bubáky do starých šosatých kabátů a postavil je doprostřed pole. Žádný havran ani cizí diblík se teď neodváží přiblížit a krejcary se k lovci samy kutálejí!",
		bonusDesc: (lvl) => `Pozorná aura: +${lvl * 25} k dosahu sběru krejcarů a perníčků`,
		cost: (_lvl, total) => getVillageBuildingCost(30, total ?? _lvl),
		canvasDrawer: "drawScarecrowScene"
	},
	{
		id: "mill",
		name: "Vodní mlýn na náhonu",
		levelKey: "millLevel",
		role: "Mletí mouky a pohon struhy",
		baseCost: 30,
		helpers: "Hastrmani roztáčející mlýnské kolo",
		story: "Mlynář slíbil hastrmanům, že jim nechá celý rákosový rybníček pod splavem pro jejich dušičky, pokud pomohou točit těžkým mlýnským kolem. Hastrmani nadšeně stříkají vodu a proud žene lovce kupředu!",
		bonusDesc: (lvl) => `Vodní proud: +${lvl * 10} k rychlosti chůze lovce`,
		cost: (_lvl, total) => getVillageBuildingCost(30, total ?? _lvl),
		canvasDrawer: "drawMillScene"
	},
	{
		id: "forest",
		name: "Hustý borový les",
		levelKey: "forestLevel",
		role: "Zvyk na mokřady a odolnost terénu",
		baseCost: 30,
		helpers: "Lesní mužíci vysekávající suché stezky",
		story: "Starý borový les za vsí skrývá nebezpečná rašeliniště a hluboké louže. Kdo se však naučí lesním stezkám s lesními mužíky, nezapadne do bahna a promočení z něj spadne mnohem rychleji.",
		bonusDesc: (lvl) => `Zvyk na mokřad: o ${Math.min(80, lvl * 20)}% kratší trvání promočení a zpomalení`,
		cost: (_lvl, total) => getVillageBuildingCost(30, total ?? _lvl),
		canvasDrawer: "drawScarecrowScene"
	},
	{
		id: "wall",
		name: "Kamenné hradby a bašta",
		levelKey: "wallLevel",
		role: "Obrana vesnice a zdi gruntů",
		baseCost: 50,
		helpers: "Kostliví zedníci se zednickými lžícemi",
		story: "Kostliví pomocníci vyměnili své nářadí za zednické lžíce a maltu. Celou noc pilně rovnají žulové kvádry a zalévají spáry, takže zdi vesnice vydrží i nápor nejdivočejších nezbedů.",
		bonusDesc: (lvl) => `Kamenné zdi: +${lvl * 25} max Kuráž & +${Math.min(50, lvl * 4)}% odolnost proti poškození`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "forge",
		name: "Kovářská výheň",
		levelKey: "forgeLevel",
		role: "Plošné posílení poškození",
		baseCost: 50,
		helpers: "Ohniví mužíci a diblíci dmoucí měchy",
		story: "Kovář se spřátelil s ohnivými mužíky, kteří mu neúnavně dmýchají rozžhavené uhlí v kovářské výhni. Každá zbraň ukovaná v tomto plameni má trvalou a spolehlivou váhu.",
		bonusDesc: (lvl) => `Výheň: +${lvl * 2} přímé poškození ke každému zásahu`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "oven",
		name: "Pekárna u rozpálené pece",
		levelKey: "ovenLevel",
		role: "Pekařství a vůně perníků",
		baseCost: 50,
		helpers: "Ochočení rarášci s lopatami a povidly",
		story: "Pekař Jan zjistil, že když raráškům nabídne misku švestkových povidel, neúnavně sázejí bochníky a perníčky do pece. Voňavé perníkové kouzlo posiluje hodnotu všech perníčků posbíraných na výpravě!",
		bonusDesc: (lvl) => `Perníková vůně: +${lvl * 10}% k hodnotě všech sebraných Perníčků`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "undead",
		name: "Hřbitovní brána",
		levelKey: "undeadLevel",
		role: "Krocení hrobových běsů a staré poklady",
		baseCost: 50,
		helpers: "Zkrocení bezhlaví furianti rovnající náhrobky",
		story: "Kovaná brána se železným křížem drží neklidné umrlce na posvěcené půdě. Zkrocení strašidelní furianti pomáhají hrobníkům a občas vyhrabou ze starých hrobů cenné stříbrné tolary a měšce krejcarů.",
		bonusDesc: (lvl) => `Poklady starých časů: +${lvl * 10}% k hodnotě Krejcarů & +${lvl * 1}% šance na tolar z nepřítele`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "bell",
		name: "Zvonice",
		levelKey: "bellLevel",
		role: "Urychlení speciální schopnosti",
		baseCost: 50,
		helpers: "Klekánice a noční ptáci tahající za provaz",
		story: "Klekánice se usadily pod šindelovou střechou zvonice a tahají za těžký zvonový provaz. Každý úder zvonu probouzí v lovci ráznost a urychluje návrat jeho mocné schopnosti.",
		bonusDesc: (lvl) => `Hlahol zvonu: +${lvl * 8}% k rychlosti dobíjení schopnosti`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "regen",
		name: "Bylinková zahrádka",
		levelKey: "regenLevel",
		role: "Léčivé bylinky a trvalá regenerace",
		baseCost: 75,
		helpers: "Divoženky a bába kořenářka sušící mateřídoušku",
		story: "Na prosluněné mezi za chalupou pomáhají lesní divoženky sbírat mateřídoušku, třezalku a heřmánek. Voňavé masti a horké odvary dodávají lovci klidnou mysl a vracejí ztracenou Kuráž v průběhu celé noci.",
		bonusDesc: (lvl) => `Voňavé býlí: +${lvl * 2} Kuráže doplňováno každých 5 sekund`,
		cost: (_lvl, total) => getVillageBuildingCost(75, total ?? _lvl),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "tavernShield",
		name: "Šenkýřova kuráž",
		levelKey: "tavernShieldLevel",
		role: "Hospodská rvačka a zoufalá odvaha",
		baseCost: 75,
		helpers: "Zkrocení diblíci a permoníci leštící korbele",
		story: "V hospodě U Černého kocoura se diblíci naučili čepovat chladné ležáky a pobízet chasníky k odvaze. Když jde do tuhého a lovci docházejí síly, vzpomene si na hospodskou rvačku a zasadí drtivý úder!",
		bonusDesc: (lvl) => `Zoufalá kuráž: +${lvl * 15}% k poškození zbraní při poklesu Kuráže pod 35%`,
		cost: (_lvl, total) => getVillageBuildingCost(75, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "water",
		name: "Návesní studánka",
		levelKey: "waterLevel",
		role: "Pramenitá voda a posílení lektvarů",
		baseCost: 75,
		helpers: "Vodní víly střežící čistý křišťálový pramen",
		story: "Uprostřed návsi vyvěrá křišťálový pramen, který nikdy nezamrzá. Vodní víly v něm omývají měsíční kameny. Napije-li se z něj lovec, zahojí se mu rány a získá okamžitou nezranitelnost.",
		bonusDesc: (lvl) => `Pramenitá voda: +${lvl * 20}% k účinku lektvarů & ${lvl > 0 ? Math.min(5, 1 + lvl * 0.5).toFixed(1) : '0'} s nezranitelnosti po vypití`,
		cost: (_lvl, total) => getVillageBuildingCost(75, total ?? _lvl),
		canvasDrawer: "drawMillScene"
	},
	{
		id: "church",
		name: "Kaple svaté vlny",
		levelKey: "churchLevel",
		role: "Svatá vlna při nákupu u Dědečka",
		baseCost: 75,
		helpers: "Kající se bludičky leštící posvěcený zvon",
		story: "Bludičky přilétly z močálů do kaple a omývají svěcenou vodou oltář. Při každém nákupu v Dědečkově nůši vyšle posvěcený zvon kolem lovce mocnou rázovou vlnu, která smete okolní bubáky.",
		bonusDesc: (lvl) => `Svatá vlna: ${lvl * 100} posvátného poškození a silný odhoz v okruhu 400 px při nákupu u Dědečka`,
		cost: (_lvl, total) => getVillageBuildingCost(75, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	}
];
