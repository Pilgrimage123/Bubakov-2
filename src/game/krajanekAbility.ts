export const KRAJANEK_RIDE_DURATION = 9;
export const KRAJANEK_ABILITY_COOLDOWN = 30;
export const KRAJANEK_RIDE_SPEED_MULTIPLIER = 2;
export const KRAJANEK_RIDE_TICK_SECONDS = 0.5;
export const KRAJANEK_CRUSH_DAMAGE = 180;
export const KRAJANEK_SPARK_DAMAGE = 75;
export const KRAJANEK_SPARK_RADIUS = 85;
export const KRAJANEK_BASE_BLOCK_HP = 400;
export const KRAJANEK_FLAT_DECAL_LIFETIME = 18;
const MAX_FLAT_DECALS = 80;

export function getKrajanekUpgradeScale(upgradeCount: number): number {
  return 1 + Math.max(0, Math.floor(Number.isFinite(upgradeCount) ? upgradeCount : 0)) * 0.2;
}

export function getKrajanekBlockingHp(upgradeCount: number): number {
  return KRAJANEK_BASE_BLOCK_HP * getKrajanekUpgradeScale(upgradeCount);
}

/**
 * Advances Krajánek's ride and its 0.5 s damage beats.
 * The enemy lookup can be supplied lazily so callers can reuse spatial indexes.
 * Returns true on a hammer-spark beat so the renderer can emit a particle burst.
 */
export function stepKrajanekRide(
  player: any,
  dt: number,
  enemies: any[] | (() => any[]),
  candidateCount?: number,
): boolean {
  const flats: Array<{ x: number; y: number; angle: number; scale: number; life: number }> =
    player.krajanekFlats || (player.krajanekFlats = []);

  let write = 0;
  for (let i = 0; i < flats.length; i++) {
    const decal = flats[i];
    decal.life -= dt;
    if (decal.life > 0) flats[write++] = decal;
  }
  flats.length = write;

  if (player.type !== 'krajanek' || !(player.krajanekRideTimer > 0)) return false;

  const upgradeScale = getKrajanekUpgradeScale(player.krajanekUpgradeCount || 0);
  const damageScale = upgradeScale * (player.damageMultiplier || 1);
  const blockHp = getKrajanekBlockingHp(player.krajanekUpgradeCount || 0);
  const radius = Math.max(1, player.radius || 20);
  const nearby = typeof enemies === 'function' ? enemies() : enemies;
  const count = Math.min(nearby.length, candidateCount ?? nearby.length);

  // Check direct contact every frame so fast movement cannot skip small enemies.
  for (let i = 0; i < count; i++) {
    const enemy = nearby[i];
    if (!enemy || enemy.isDefeated || enemy.dead) continue;

    enemy.krajanekRideHitCooldown = Math.max(
      0,
      (Number(enemy.krajanekRideHitCooldown) || 0) - dt,
    );

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.hypot(dx, dy);
    const enemyRadius = Math.max(0, enemy.radius || 0);
    const touchingStone = distance <= radius + enemyRadius;
    const enemyMaxHp = Number(enemy.maxHp ?? enemy.hp ?? 0);

    if (!touchingStone) continue;

    if (enemyMaxHp > blockHp) {
      if (enemy.krajanekRideHitCooldown <= 0 && typeof enemy.takeDamage === 'function') {
        enemy.takeDamage(
          KRAJANEK_CRUSH_DAMAGE * damageScale,
          'physical',
          0,
          0,
          { ignoreDodge: true },
        );
        enemy.krajanekRideHitCooldown = KRAJANEK_RIDE_TICK_SECONDS;
      }
    } else if (!enemy.krajanekFlattened && typeof enemy.takeDamage === 'function') {
      enemy.krajanekFlattened = true;
      flats.push({
        x: enemy.x,
        y: enemy.y + enemyRadius * 0.32,
        angle: Math.atan2(player.lastDy || 0, player.lastDx || 1) * 0.16,
        scale: Math.max(0.65, Math.min(2.4, enemyRadius / 16)),
        life: KRAJANEK_FLAT_DECAL_LIFETIME,
      });
      if (flats.length > MAX_FLAT_DECALS) flats.splice(0, flats.length - MAX_FLAT_DECALS);

      // Oversized input also handles stone-prefix resistances consistently.
      enemy.takeDamage(Math.max(1, enemyMaxHp, enemy.hp || 0) * 100, 'physical', 0, 0, {
        ignoreDodge: true,
      });
    }
  }

  const tickRemaining = (Number(player.krajanekRideTickTimer) || 0) - dt;
  let firedSparkBeat = false;
  if (tickRemaining <= 0) {
    player.krajanekRideTickTimer = KRAJANEK_RIDE_TICK_SECONDS;
    firedSparkBeat = true;

    // Sparks reach monsters outside the stone's direct path.
    for (let i = 0; i < count; i++) {
      const enemy = nearby[i];
      if (!enemy || enemy.isDefeated || enemy.dead) continue;

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const enemyRadius = Math.max(0, enemy.radius || 0);
      const touchingStone = distance <= radius + enemyRadius;
      if (touchingStone || distance > KRAJANEK_SPARK_RADIUS + enemyRadius) continue;
      if (Number(enemy.maxHp ?? enemy.hp ?? 0) > blockHp) continue;
      if (typeof enemy.takeDamage === 'function') {
        enemy.takeDamage(KRAJANEK_SPARK_DAMAGE * damageScale, 'willpower', 0, 0, {
          ignoreDodge: true,
        });
      }
    }
  } else {
    player.krajanekRideTickTimer = tickRemaining;
  }

  player.krajanekRideTimer = Math.max(0, player.krajanekRideTimer - dt);
  return firedSparkBeat;
}
