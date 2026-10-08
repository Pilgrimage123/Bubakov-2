import React from 'react';
import { ENEMIES } from './enemies';

function getEnemyMaxKills(enemy) {
	if (enemy.category === "bosses") return 3;
	if (enemy.category === "demons" || enemy.hp >= 300) return 10;
	if (enemy.category === "undead" || enemy.category === "shadows" || enemy.category === "frost" || enemy.category === "fields" || enemy.category === "water") return 15;
	return 20;
}
function getObscuredName(name, tier) {
	if (tier >= 4) return name;
	if (tier === 3) return name.split(" ").map((p) => {
		if (p.length <= 2) return p;
		if (p.length <= 4) return p[0] + ".." + p[p.length - 1];
		const half = Math.floor(p.length * .6);
		return p.slice(0, half) + "..." + p.slice(-1);
	}).join(" ");
	if (tier === 2) return name.split(" ").map((p) => {
		if (p.length <= 3) return p[0] + "..";
		return p[0] + ".." + p[p.length - 1];
	}).join(" ");
	if (tier === 1) return name.split(" ").map((p) => p.length > 0 ? p[0] + " _ _ _" : "").join(" ");
	return "??? [Neznámé strašidlo]";
}
function getObscuredTitle(title, category, tier) {
	if (tier >= 3) return title;
	if (tier === 2) return `Tajemná bytost (${title.slice(0, 15)}...)`;
	if (tier === 1) switch (category) {
		case "bosses": return "Pověst o obávaném vládci kraje";
		case "demons": return "Rozpustilý pekelník z pohádek";
		case "water": return "Mokrý přízrak od rybníka či potoka";
		case "frost": return "Mrazivý noční vítr a rampouchy";
		case "undead": return "Bílý kostlivec od starého kostela";
		case "shadows": return "Temný stín z podkroví a stodol";
		case "fields": return "Polní strašidlo z poledního žáru či mezí";
		default: return "Rychlý diblík a noční škůdce";
	}
	return "Dosud nespatřený tvor z nočních bájí";
}
function getEnemyProgress(enemyId, kills) {
	const enemy = ENEMIES[enemyId] || ENEMIES.rarach;
	const maxKills = getEnemyMaxKills(enemy);
	const curKills = Math.max(0, kills || 0);
	let percent = 0;
	let tier = 0;
	if (curKills === 0) {
		percent = 0;
		tier = 0;
	} else if (curKills >= maxKills) {
		percent = 100;
		tier = 4;
	} else {
		const rawPct = Math.floor(curKills / maxKills * 100);
		percent = Math.min(99, Math.max(15, rawPct));
		if (percent >= 75) tier = 3;
		else if (percent >= 50) tier = 2;
		else tier = 1;
	}
	const isUnlocked = tier === 4;
	const isDiscovered = curKills > 0;
	let clueTag = "🔒 0 %: Zcela neprobádáno";
	if (tier === 4) clueTag = "✅ 100 %: Zcela probádané strašidlo";
	else if (tier === 3) clueTag = `⚡ ${percent} %: Téměř kompletní zápis v kronice`;
	else if (tier === 2) clueTag = `🔎 ${percent} %: Známy slabiny a obrysy chování`;
	else if (tier === 1) clueTag = `🔍 ${percent} %: První letmé spatření`;
	let spoiledLore = "O tomto strašidle v kronice zatím není ani řádka. Vydejte se na výpravu do venkovských končin a poražte jej, abyste zaznamenali první poznatky!";
	if (tier === 1) spoiledLore = `Byl spatřen v šeru venkovské noci! Poutníci hlásí podivné zvuky a siluetu. K podrobnějšímu prozkoumání jeho slabin je třeba dalších střetnutí (${curKills} / ${maxKills} zahnáno).`;
	else if (tier === 2) spoiledLore = `${enemy.lore.slice(0, Math.floor(enemy.lore.length * .55))}... [Zbylá část záznamu čeká na důkladnější pozorování].`;
	else if (tier >= 3) spoiledLore = enemy.lore;
	let spoiledWeakness = "??? [Neznámá slabina – zažeňte více těchto tvorů]";
	let spoiledStrength = "??? [Neznámé nebezpečí]";
	if (tier >= 2) spoiledWeakness = enemy.weakness;
	else if (tier === 1) spoiledWeakness = "Skryto v mlze (vyžaduje 50 % pozorování)";
	if (tier >= 3) spoiledStrength = enemy.strength;
	else if (tier === 2) spoiledStrength = "Částečně odhaleno (vyžaduje 75 % pozorování)";
	const spoiledStats = {
		hp: tier >= 3 ? `${enemy.hp} Kuráž` : tier >= 1 ? `cca ${Math.round(enemy.hp / 10) * 10} Kuráž` : "??? Kuráž",
		danger: tier >= 2 ? enemy.danger : tier >= 1 ? "Nebezpečný" : "???",
		coinValue: tier >= 2 ? `${enemy.coinValue} kr.` : "??? kr.",
		speed: tier >= 3 ? `${enemy.speed}` : "???",
		attackCadence: tier >= 2
			? (enemy.attackCadence === "fast" ? "⚡ Rychlý (0,6 s)" : enemy.attackCadence === "slow" ? "🔨 Pomalý (1,8 s)" : "⚔️ Normální (1,2 s)")
			: "???",
		attackInterval: tier >= 2 ? `${enemy.attackInterval || 1.2} s` : "???"
	};
	let icon = "❓";
	if (tier >= 1) switch (enemy.category) {
		case "bosses":
			icon = "👑";
			break;
		case "demons":
			icon = "🔥";
			break;
		case "water":
			icon = "💧";
			break;
		case "frost":
			icon = "❄️";
			break;
		case "undead":
			icon = "💀";
			break;
		case "shadows":
			icon = "👤";
			break;
		case "fields":
			icon = "🌾";
			break;
		default: icon = "🐭";
	}
	return {
		id: enemy.id,
		name: getObscuredName(enemy.name, tier),
		title: getObscuredTitle(enemy.title, enemy.category, tier),
		category: enemy.category,
		kills: curKills,
		maxKills,
		percent,
		tier,
		isUnlocked,
		isDiscovered,
		clueTag,
		spoiledLore,
		spoiledWeakness,
		spoiledStrength,
		spoiledStats,
		icon,
		realEnemy: enemy
	};
}

export { getEnemyMaxKills, getObscuredName, getObscuredTitle, getEnemyProgress };
