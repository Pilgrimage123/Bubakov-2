import React from 'react';

/**
* Checks whether an enemy is considered undead or devil/demon type.
*/
function isUnholyEnemy(e) {
	if (!e) return false;
	return e.category === "undead" || e.category === "demons" || e.id === "cert" || e.id === "bezhlavy_rytir" || e.id === "rarach" || e.id === "plivnik" || e.id === "sazovy_rarach" || e.id === "krvavy_kostlivec";
}
/**
* Computes the enemy's effective resistance to Holy / Fear effects.
* Base resistance comes from willpower (0 to 1).
* Undead and devil/demon type enemies have their resistance very significantly lowered (-1.0),
* meaning their effective resistance becomes strongly negative (e.g. -1.0 to -0.1).
*/
function getEnemyHolyResistance(e) {
	if (!e) return 0;
	const baseWill = typeof e.willpower === "number" ? e.willpower : 0;
	if (isUnholyEnemy(e)) return baseWill - 1;
	return baseWill;
}
/**
* General rule: Very low resistance actually makes damage higher.
* Damage multiplier = 1 - effectiveResistance.
* - Negative resistance (-1.0) => 2.0x damage (100% bonus damage)
* - Negative resistance (-0.7) => 1.7x damage
* - Zero resistance (0.0) => 1.0x damage
* - High resistance (0.8) => 0.2x damage
*/
function getHolyDamageMultiplier(e) {
	const resist = getEnemyHolyResistance(e);
	return Math.max(.1, 1 - resist);
}
/**
* Fear resistance affects both holy damage and pushback away from holy sources.
* Undead and devil enemies flee / are pushed back significantly farther due to negative resistance.
*/
function getHolyPushMultiplier(e) {
	const resist = getEnemyHolyResistance(e);
	return Math.max(.1, 1 - resist) * Math.max(.05, 1 - ((e && e.poiseResist) ?? 0));
}

export { isUnholyEnemy, getEnemyHolyResistance, getHolyDamageMultiplier, getHolyPushMultiplier };
