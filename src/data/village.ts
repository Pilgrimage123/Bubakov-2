import type { VillageBuilding, MetaProgression } from '../types';

export const VILLAGE_TAX_RATE = 0.20;

/**
 * Returns total number of upgrade levels purchased across all village buildings.
 */
export function getVillageTotalLevels(meta: Partial<MetaProgression>): number {
	return VILLAGE_BUILDINGS.reduce((sum, b) => sum + ((meta[b.levelKey] as number) || 0), 0);
}

/**
 * Calculates current price for a building upgrade based on its base cost
 * and the total number of village upgrade levels purchased so far (Obecní přirážka).
 * Adds 20% of the base price per total village upgrade level.
 */
export function getVillageBuildingCost(baseCost: number, totalVillageLevels: number): number {
	return Math.round((baseCost * (100 + totalVillageLevels * 20)) / 100);
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

export function getWallDamageReduction(level: number): number {
	if (level <= 0) return 0;
	return 0.40 * (1 - 1 / (1 + 0.08 * level));
}

export function getForestDebuffReduction(level: number): number {
	if (level <= 0) return 0;
	return 0.85 * (1 - 1 / (1 + 0.25 * level));
}

export function getMillSpeedMultiplier(level: number): number {
	if (level <= 0) return 0;
	return Math.min(0.50, level * 0.03);
}

export function getScarecrowPickupMultiplier(level: number): number {
	if (level <= 0) return 0;
	return Math.min(1.50, level * 0.15);
}

export function getWallHpMultiplier(level: number): number {
	return Math.max(0, level * 0.10);
}

export function getBoziMukaLuckMultiplier(level: number): number {
	return Math.max(0, level * 0.05);
}

export function getUndeadTolarChance(level: number): number {
	return Math.min(0.25, Math.max(0, level * 0.01));
}

export function getChurchWaveDamage(level: number): number {
	return Math.max(0, level * 75);
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
		bonusDesc: (lvl) => `Pozorná aura: +${lvl * 15}% k základnímu dosahu sběru krejcarů a perníčků (až +150 %)`,
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
		bonusDesc: (lvl) => `Vodní proud: +${lvl * 3}% k základní rychlosti chůze lovce (až +50 %)`,
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
		bonusDesc: (lvl) => `Zvyk na mokřad: o ${Math.round(getForestDebuffReduction(lvl) * 100)}% kratší trvání promočení a zpomalení`,
		cost: (_lvl, total) => getVillageBuildingCost(30, total ?? _lvl),
		canvasDrawer: "drawScarecrowScene"
	},
	{
		id: "wall",
		name: "Kamenné hradby a bašta",
		levelKey: "wallLevel",
		role: "Obrana vesnice a zdi gruntů",
		baseCost: 75,
		helpers: "Kostliví zedníci se zednickými lžícemi",
		story: "Kostliví pomocníci vyměnili své nářadí za zednické lžíce a maltu. Celou noc pilně rovnají žulové kvádry a zalévají spáry, takže zdi vesnice vydrží i nápor nejdivočejších nezbedů.",
		bonusDesc: (lvl) => `Kamenné zdi: +${lvl * 10}% základní max Kuráže & +${Math.round(getWallDamageReduction(lvl) * 100)}% odolnost proti poškození`,
		cost: (_lvl, total) => getVillageBuildingCost(75, total ?? _lvl),
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
		bonusDesc: (lvl) => `Poklady starých časů: +${lvl * 10}% k hodnotě Krejcarů & +${lvl * 1}% šance na tolar (až 25 %)`,
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
		baseCost: 50,
		helpers: "Divoženky a bába kořenářka sušící mateřídoušku",
		story: "Na prosluněné mezi za chalupou pomáhají lesní divoženky sbírat mateřídoušku, třezalku a heřmánek. Voňavé masti a horké odvary dodávají lovci klidnou mysl a vracejí ztracenou Kuráž v průběhu celé noci.",
		bonusDesc: (lvl) => `Voňavé býlí: +${lvl * 4} Kuráže doplňováno každých 5 sekund`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawOvenScene"
	},
	{
		id: "tavernShield",
		name: "Šenkýřova kuráž",
		levelKey: "tavernShieldLevel",
		role: "Hospodská rvačka a zoufalá odvaha",
		baseCost: 50,
		helpers: "Zkrocení diblíci a permoníci leštící korbele",
		story: "V hospodě U Černého kocoura se diblíci naučili čepovat chladné ležáky a pobízet chasníky k odvaze. Když jde do tuhého a lovci docházejí síly, vzpomene si na hospodskou rvačku a zasadí drtivý úder!",
		bonusDesc: (lvl) => `Zoufalá kuráž: až +${lvl * 25}% k poškození zbraní úměrně chybějící Kuráži`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
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
		role: "Svatá vlna a posvěcená výzbroj",
		baseCost: 30,
		helpers: "Kající se bludičky leštící posvěcený zvon",
		story: "Bludičky přilétly z močálů do kaple a omývají svěcenou vodou oltář. Kdykoliv lovec rozbije hliněný hrneček a osvobodí zbloudilou dušičku, posvěcený zvon vyšle kolem lovce mocnou rázovou vlnu, která smete okolní bubáky.",
		bonusDesc: (lvl) => `Svatá vlna: +${lvl * 8}% svaté poškození & ${lvl * 75} posvátného poškození při osvobození dušičky`,
		cost: (_lvl, total) => getVillageBuildingCost(30, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	},
	{
		id: "boziMuka",
		name: "Boží muka u polní cesty",
		levelKey: "boziMukaLevel",
		role: "Přízeň osudu a posvěcená ochrana",
		baseCost: 50,
		helpers: "Svatojánští broučci střežící věčné světlo",
		story: "Drobná kamenná boží muka na rozcestí se zapálenou svící chrání pocestné a zahánějí zlé moci. Kdo u nich v tichosti postojí, toho provází štěstěna na každém kroku.",
		bonusDesc: (lvl) => `Přízeň osudu: +${lvl * 5}% k základnímu Štěstí lovce na výpravě`,
		cost: (_lvl, total) => getVillageBuildingCost(50, total ?? _lvl),
		canvasDrawer: "drawWallScene"
	}
];
