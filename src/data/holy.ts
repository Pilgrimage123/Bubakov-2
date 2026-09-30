/**
 * Holy & Fear Mechanics (Posvátné a strachové herní mechaniky)
 *
 * Rules:
 * 1. Base holy / fear resistance corresponds to enemy's willpower (0 to 1).
 * 2. Undead and devil/demon type enemies have their resistance to holy/fear
 *    very significantly lowered (by -1.0), making their resistance negative.
 * 3. General rule: Very low resistance actually makes damage higher!
 *    multiplier = 1.0 - effectiveResistance
 *    - e.g. resist = -1.0 => 2.0x holy damage (100% bonus damage)
 *    - e.g. resist = -0.7 => 1.7x holy damage
 *    - e.g. resist = 0.0 => 1.0x holy damage
 *    - e.g. resist = 0.8 => 0.2x holy damage
 * 4. Fear-based pushback (from Hromnička candle aura, holy water droplets, etc.)
 *    is also resisted by Fear resistance (willpower) and enemy poise:
 *    Undead and devil types panic and are shoved away up to 2x as far!
 */

export interface HolyTargetEnemy {
  id?: string;
  category?: string;
  willpower?: number;
  poiseResist?: number;
}

/**
 * Checks whether an enemy is considered undead or devil/demon type.
 */
export function isUnholyEnemy(e: HolyTargetEnemy | null | undefined): boolean {
  if (!e) return false;
  return (
    e.category === 'undead' ||
    e.category === 'demons' ||
    e.id === 'cert' ||
    e.id === 'bezhlavy_rytir' ||
    e.id === 'rarach' ||
    e.id === 'plivnik' ||
    e.id === 'sazovy_rarach' ||
    e.id === 'krvavy_kostlivec'
  );
}

/**
 * Computes the enemy's effective resistance to Holy / Fear effects.
 * Base resistance comes from willpower (0 to 1).
 * Undead and devil/demon type enemies have their resistance very significantly lowered (-1.0),
 * meaning their effective resistance becomes strongly negative (e.g. -1.0 to -0.1).
 */
export function getEnemyHolyResistance(e: HolyTargetEnemy | null | undefined): number {
  if (!e) return 0;
  const baseWill = typeof e.willpower === 'number' ? e.willpower : 0;
  if (isUnholyEnemy(e)) {
    return baseWill - 1.0;
  }
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
export function getHolyDamageMultiplier(e: HolyTargetEnemy | null | undefined): number {
  const resist = getEnemyHolyResistance(e);
  return Math.max(0.1, 1.0 - resist);
}

/**
 * Fear resistance affects both holy damage and pushback away from holy sources.
 * Undead and devil enemies flee / are pushed back significantly farther due to negative resistance.
 */
export function getHolyPushMultiplier(e: HolyTargetEnemy | null | undefined): number {
  const resist = getEnemyHolyResistance(e);
  const fearFactor = Math.max(0.1, 1.0 - resist);
  const poiseFactor = Math.max(0.05, 1.0 - ((e && e.poiseResist) ?? 0));
  return fearFactor * poiseFactor;
}
