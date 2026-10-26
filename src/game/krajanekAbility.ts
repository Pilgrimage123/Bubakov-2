export const KRAJANEK_RIDE_DURATION = 14;
export const KRAJANEK_ABILITY_COOLDOWN = 30;
export const KRAJANEK_RIDE_SPEED_MULTIPLIER = 2;
export const KRAJANEK_RIDE_TICK_SECONDS = 0.5;
export const KRAJANEK_CRUSH_DAMAGE = 180;
export const KRAJANEK_SPARK_DAMAGE = 75;
export const KRAJANEK_SPARK_RADIUS = 85;
export const KRAJANEK_BASE_BLOCK_HP = 400;
export const KRAJANEK_FLAT_DECAL_LIFETIME = 18;
export const KRAJANEK_STONE_RADIUS = 48; // Physical stone collision radius matching visual 47px radius
export const KRAJANEK_COAST_DURATION = 1.5; // Inertia coasting duration after dismount
export const KRAJANEK_DISMOUNT_INVULNERABILITY = 0.4; // Somersault leap invulnerability
const MAX_FLAT_DECALS = 80;
const MAX_FURROWS = 60;

export interface KrajanekFurrow {
  x: number;
  y: number;
  angle: number;
  width: number;
  life: number;
  maxLife: number;
}

export interface KrajanekCoastingStone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  life: number;
  maxLife: number;
  damageScale: number;
  colossusStacks?: number;
  isFlatSlam?: boolean;
}

export function getKrajanekUpgradeScale(upgradeCount: number): number {
  return 1 + Math.max(0, Math.floor(Number.isFinite(upgradeCount) ? upgradeCount : 0)) * 0.2;
}

export function getKrajanekBlockingHp(upgradeCount: number): number {
  return KRAJANEK_BASE_BLOCK_HP * getKrajanekUpgradeScale(upgradeCount);
}

export function getKrajanekStoneRadius(player: any): number {
  const stacks = Number(player?.krajanekColossusStacks) || 0;
  return KRAJANEK_STONE_RADIUS * (1 + stacks * 0.05);
}

export function normalizeAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Calculates current dynamic ride speed multiplier based on the 4-phase momentum curve:
 * Phase 1 (0.0 - 0.3s): 1.0 (unpack & shockwave impact)
 * Phase 2 (0.3 - 1.2s): Smooth acceleration from +30% (1.30) to +100% (2.0)
 * Phase 3 (1.2 - 14.0s): Full 2.0x speed (+5% per stack of Rozjetý kolos)
 * Oškrt impulse: +25% burst for 0.15s
 * Gravel drift: -30% speed penalty (drops to 70%) while drifting
 */
export function getKrajanekMomentumMultiplier(player: any): number {
  if (!player || player.type !== 'krajanek' || !(player.krajanekRideTimer > 0)) {
    return 1;
  }
  const elapsed = Math.max(0, KRAJANEK_RIDE_DURATION - player.krajanekRideTimer);
  let baseMult = 2.0;

  if (elapsed < 0.3) {
    // Phase 1: Unpack and slam impact
    baseMult = 1.0;
  } else if (elapsed < 1.2) {
    // Phase 2: Heavy rollout smoothly ramping 1.30 -> 2.00
    const progress = (elapsed - 0.3) / 0.9;
    baseMult = 1.30 + 0.70 * Math.max(0, Math.min(1, progress));
  } else {
    // Phase 3: Unbridled momentum
    baseMult = 2.0;
  }

  // Rozjetý kolos: +5% speed per stack
  const colossusBonus = 1 + (Number(player.krajanekColossusStacks) || 0) * 0.05;
  baseMult *= colossusBonus;

  // Oškrt hammer micro-impulse: +25% speed during burst
  if ((player.krajanekImpulseTimer || 0) > 0) {
    baseMult *= 1.25;
  }

  // Gravel drift speed penalty: down to 70%
  if ((player.krajanekDriftTimer || 0) > 0) {
    baseMult *= 0.70;
  }

  return baseMult;
}

/**
 * Calculates steering with Turn Rate Cap, gravel drifting (>60 deg input change),
 * and oškrt turn rate boosting. Touch displays receive higher maneuverability (7.2+ rad/s)
 * and smooth touch joystick assistance for effortless control.
 */
export function computeKrajanekSteering(
  player: any,
  inputDx: number,
  inputDy: number,
  dt: number,
  callbacks?: any,
): { vxRatio: number; vyRatio: number; headingAngle: number; isDrifting: boolean; tilt: number } {
  const elapsed = Math.max(0, KRAJANEK_RIDE_DURATION - (player.krajanekRideTimer || 0));
  let currentAngle = typeof player.krajanekHeadingAngle === 'number'
    ? player.krajanekHeadingAngle
    : Math.atan2(player.lastDy || 0, player.lastDx || 1);

  const isTouch = Boolean(
    callbacks?.isTouchInput ||
    player?.isTouchInput ||
    player?.isTouchDevice ||
    (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
  );

  // Turn rate cap based on phase:
  // Phase 2 (Heavy rollout): agile turning (~9.0–11.0 rad/s)
  // Phase 3 (Rolling press): 4.8 rad/s base, boosted to 7.2 rad/s on touchscreen for effortless steering
  let turnRate = isTouch ? (elapsed < 1.2 ? 11.0 : 7.2) : (elapsed < 1.2 ? 9.0 : 4.8);

  // Chisel hammer correction: doubles turn rate for 0.10s after hammer strike
  if ((player.krajanekTurnBoostTimer || 0) > 0) {
    turnRate *= 2.0;
  }

  const hasInput = Math.hypot(inputDx, inputDy) > 0.01;
  let isDrifting = false;
  let tilt = 0;

  if (hasInput) {
    const targetAngle = Math.atan2(inputDy, inputDx);
    const diff = normalizeAngle(targetAngle - currentAngle);

    // Drift mechanic: change of direction > threshold (Math.PI / 3 or PI * 0.42 on touch) triggers Gravel Drift
    const driftThreshold = isTouch ? Math.PI * 0.42 : Math.PI / 3;
    if (Math.abs(diff) > driftThreshold) {
      isDrifting = true;
      player.krajanekIsDrifting = true;
      player.krajanekDriftTimer = 0.22;
      player.krajanekDriftSign = Math.sign(diff);
      callbacks?.onSound?.('zernovDrift');

      // Spray quartz debris and mud outwards
      if (callbacks?.onDriftSpray) {
        callbacks.onDriftSpray(player, currentAngle, Math.sign(diff));
      }
    }

    const maxTurn = turnRate * dt;
    if (Math.abs(diff) <= maxTurn) {
      currentAngle = targetAngle;
    } else {
      currentAngle += Math.sign(diff) * maxTurn;
    }

    tilt = Math.max(-1, Math.min(1, diff / (Math.PI / 3)));
  } else {
    // Retain forward inertia when no direction is pressed
    player.krajanekIsDrifting = false;
  }

  currentAngle = normalizeAngle(currentAngle);
  player.krajanekHeadingAngle = currentAngle;
  player.krajanekTilt = tilt;

  return {
    vxRatio: Math.cos(currentAngle),
    vyRatio: Math.sin(currentAngle),
    headingAngle: currentAngle,
    isDrifting,
    tilt,
  };
}

/**
 * Returns true when an enemy is currently airborne (e.g. flying crows that have
 * not landed on the ground to forage). The millstone rolls underneath airborne
 * enemies without crushing or bouncing off them, while Oškrt sparks still hit them.
 */
export function isAirborneFlyingEnemy(enemy: any): boolean {
  if (!enemy) return false;
  return Boolean(
    (enemy.isFlying ||
      enemy.id === 'vrana' ||
      enemy.isVirtualCrowMember ||
      enemy.isMinibossFlockMember) &&
      !enemy.isGroundedForLoot,
  );
}

/**
 * Advances Krajánek's ride and handles all 4 momentum phases:
 * Phase 1: Unpack & initial ground slam shockwave
 * Phase 2: Heavy rollout acceleration with high maneuverability
 * Phase 3: Full momentum rolling press, oškrt micro-impulses, gravel drift shrapnel,
 *          weight-category physics (swarm flattening, elite & Jezinka hitstop/fling, boss pinball ricochet)
 * Phase 4: Katapultáž a dojezd (runaway coasting stone after dismount, somersault 0.4s invulnerability)
 */
export function stepKrajanekRide(
  player: any,
  dt: number,
  enemies: any[] | (() => any[]),
  candidateCount?: number,
  callbacks?: any,
): boolean {
  const flats: Array<{ x: number; y: number; angle: number; scale: number; life: number }> =
    player.krajanekFlats || (player.krajanekFlats = []);

  // Update existing flat decals
  let write = 0;
  for (let i = 0; i < flats.length; i++) {
    const decal = flats[i];
    decal.life -= dt;
    if (decal.life > 0) flats[write++] = decal;
  }
  flats.length = write;

  // Update mud furrow decals
  const furrows: KrajanekFurrow[] =
    player.krajanekFurrows || (player.krajanekFurrows = []);
  let furrowWrite = 0;
  for (let i = 0; i < furrows.length; i++) {
    const f = furrows[i];
    f.life -= dt;
    if (f.life > 0) furrows[furrowWrite++] = f;
  }
  furrows.length = furrowWrite;

  if (player.type !== 'krajanek' || !(player.krajanekRideTimer > 0)) {
    return false;
  }

  // Decrement drift and impulse timers
  if (player.krajanekDriftTimer > 0) {
    player.krajanekDriftTimer = Math.max(0, player.krajanekDriftTimer - dt);
  }
  if (player.krajanekImpulseTimer > 0) {
    player.krajanekImpulseTimer = Math.max(0, player.krajanekImpulseTimer - dt);
  }
  if (player.krajanekTurnBoostTimer > 0) {
    player.krajanekTurnBoostTimer = Math.max(0, player.krajanekTurnBoostTimer - dt);
  }

  const elapsed = Math.max(0, KRAJANEK_RIDE_DURATION - player.krajanekRideTimer);
  const upgradeScale = getKrajanekUpgradeScale(player.krajanekUpgradeCount || 0);
  const damageScale = upgradeScale * (player.damageMultiplier || 1);
  const blockHp = getKrajanekBlockingHp(player.krajanekUpgradeCount || 0);
  const radius = getKrajanekStoneRadius(player);
  const nearby = typeof enemies === 'function' ? enemies() : enemies;
  const count = Math.min(nearby.length, candidateCount ?? nearby.length);

  // 1. PHASE 1: Vybalení a zadunění (0.0 - 0.3s)
  if (elapsed <= 0.3 && !player.krajanekPhase1Fired && callbacks) {
    player.krajanekPhase1Fired = true;
    callbacks.onCameraShake?.(0.45, 14);
    callbacks.onSound?.('zernovSlam');

    // Primary shockwave pushes surrounding ground enemies to clear rollout runway
    for (let i = 0; i < count; i++) {
      const enemy = nearby[i];
      if (!enemy || enemy.isDefeated || enemy.dead || isAirborneFlyingEnemy(enemy)) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      const enemyRadius = Math.max(0, enemy.radius || 0);
      const touching = dist <= radius + enemyRadius;
      if (!touching && dist <= 140) {
        const nx = dx / dist;
        const ny = dy / dist;
        enemy.x += nx * 50;
        enemy.y += ny * 50;
        if (typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(KRAJANEK_CRUSH_DAMAGE * 0.8 * damageScale, 'physical', 0, 0, { ignoreDodge: true });
        }
      }
    }
  }

  // 2. PHASE 3: Mud furrows trail
  if (elapsed >= 1.2 && player.krajanekRideTimer > 0) {
    player.krajanekFurrowSpawnTimer = (player.krajanekFurrowSpawnTimer || 0) - dt;
    if (player.krajanekFurrowSpawnTimer <= 0) {
      player.krajanekFurrowSpawnTimer = 0.08;
      const heading = player.krajanekHeadingAngle ?? Math.atan2(player.lastDy || 0, player.lastDx || 1);
      furrows.push({
        x: player.x - Math.cos(heading) * (radius * 0.7),
        y: player.y - Math.sin(heading) * (radius * 0.7),
        angle: heading,
        width: radius * 0.85,
        life: 5.0,
        maxLife: 5.0,
      });
      if (furrows.length > MAX_FURROWS) {
        furrows.splice(0, furrows.length - MAX_FURROWS);
      }
    }
  }

  // 3. Weight-based collision physics (millstone rolls underneath airborne flying enemies):
  for (let i = 0; i < count; i++) {
    const enemy = nearby[i];
    if (!enemy || enemy.isDefeated || enemy.dead || isAirborneFlyingEnemy(enemy)) continue;

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

    const isBoss = Boolean(enemy.isBoss || enemy.isMiniboss || enemy.category === 'bosses');
    const isJezinka = enemy.id === 'jezinka_mraziva';
    const isElite = Boolean(enemy.isElite || enemy.category === 'elite');

    // A. BOSSOVÉ: Kulečníkový odraz (Pinball ricochet)
    if (isBoss) {
      if (enemy.krajanekRideHitCooldown <= 0) {
        const curSpeed = player.krajanekCurrentSpeed || 360;
        const bounceDmg = KRAJANEK_CRUSH_DAMAGE * 1.8 * Math.max(0.8, curSpeed / 360) * damageScale;
        if (typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(bounceDmg, 'physical', 0, 0, { ignoreDodge: true });
        }
        enemy.krajanekRideHitCooldown = 0.5;

        callbacks?.onSound?.('zernovBounce');
        callbacks?.onCameraShake?.(0.35, 12);
        callbacks?.onPinballSparks?.(player.x, player.y);
        callbacks?.onDamageText?.({
          x: player.x,
          y: player.y - 45,
          text: `KULEČNÍKOVÝ ODRAZ! 🎱 -${Math.round(bounceDmg)}`,
          color: '#FDE047',
        });

        // Reflect heading angle against collision normal
        const nx = dx / (distance || 1);
        const ny = dy / (distance || 1);
        const curHeading = player.krajanekHeadingAngle ?? Math.atan2(player.lastDy || 0, player.lastDx || 1);
        const vx = Math.cos(curHeading);
        const vy = Math.sin(curHeading);
        const dot = vx * nx + vy * ny;

        // If approaching the boss, bounce back
        if (dot > 0) {
          const rx = vx - 2 * dot * nx;
          const ry = vy - 2 * dot * ny;
          const newHeading = Math.atan2(ry, rx);
          player.krajanekHeadingAngle = newHeading;
          player.lastDx = rx;
          player.lastDy = ry;
        }

        // Push player outside boss radius so they do not stick
        player.x = enemy.x - nx * (radius + enemyRadius + 8);
        player.y = enemy.y - ny * (radius + enemyRadius + 8);
      }
      continue;
    }

    // B. ELITY & STŘEDNÍ VÁHA (včetně Mrazivé jezinky): Mikro-zadrhnutí (Hitstop) + Odmrštění stranou
    const isHeavyBlocker = enemyMaxHp > blockHp;
    if (isJezinka || isElite || isHeavyBlocker) {
      if (enemy.krajanekRideHitCooldown <= 0) {
        // Hitstop for 3 frames (0.05s)
        callbacks?.onHitstop?.(0.05);
        callbacks?.onSound?.('zernovCrack');

        const crushDmg = isJezinka ? KRAJANEK_CRUSH_DAMAGE * damageScale * 1.4 : KRAJANEK_CRUSH_DAMAGE * damageScale;
        if (typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(crushDmg, 'physical', 0, 0, { ignoreDodge: true });
        }
        enemy.krajanekRideHitCooldown = 0.35;

        // Violent fling / knockback to the side (never blocks player motion)
        const nx = dx / (distance || 1);
        const ny = dy / (distance || 1);
        enemy.x += nx * 40;
        enemy.y += ny * 40;
        if (typeof enemy.pushVx === 'number') {
          enemy.pushVx = nx * 340;
          enemy.pushVy = ny * 340;
        }

        if (isJezinka) {
          callbacks?.onSound?.('freeze');
          callbacks?.onFrostBurst?.(enemy.x, enemy.y);
          callbacks?.onDamageText?.({
            x: enemy.x,
            y: enemy.y - 30,
            text: 'ROZBITÝ MRÁZ! ❄️',
            color: '#67E8F9',
          });
        } else {
          callbacks?.onDamageText?.({
            x: enemy.x,
            y: enemy.y - 30,
            text: 'ODMRŠTĚNÍ! 💥',
            color: '#F59E0B',
          });
        }
      }
      continue;
    }

    // C. BĚŽNÁ MONSTRA (Swarm): Nulový odpor (Valivý lis) & Rozjetý kolos
    if (!enemy.krajanekFlattened && typeof enemy.takeDamage === 'function') {
      enemy.krajanekFlattened = true;
      flats.push({
        x: enemy.x,
        y: enemy.y + enemyRadius * 0.32,
        angle: Math.atan2(player.lastDy || 0, player.lastDx || 1) * 0.16,
        scale: Math.max(0.65, Math.min(2.4, enemyRadius / 16)),
        life: KRAJANEK_FLAT_DECAL_LIFETIME,
      });
      if (flats.length > MAX_FLAT_DECALS) flats.splice(0, flats.length - MAX_FLAT_DECALS);

      // Rozjetý kolos progression (+5% speed & width per 20 crushed enemies)
      player.krajanekCrushedCount = (player.krajanekCrushedCount || 0) + 1;
      const nextStacks = Math.floor(player.krajanekCrushedCount / 20);
      if (nextStacks > (player.krajanekColossusStacks || 0)) {
        player.krajanekColossusStacks = nextStacks;
        callbacks?.onDamageText?.({
          x: player.x,
          y: player.y - 45,
          text: `ROZJETÝ KOLOS! 🪨 +${nextStacks * 5}%`,
          color: '#FDE047',
        });
        callbacks?.onSound?.('levelUp');
      }

      // Oversized damage crushes swarm instantly
      enemy.takeDamage(Math.max(1, enemyMaxHp, enemy.hp || 0) * 100, 'physical', 0, 0, {
        ignoreDodge: true,
      });
    }
  }

  // 4. OŠKRT (Chisel hammer) beats & rhythm:
  // Every strike gives +25% speed impulse for 0.15s, camera twitch, and doubles steering for 0.10s
  const tickRemaining = (Number(player.krajanekRideTickTimer) || 0) - dt;
  let firedSparkBeat = false;

  if (tickRemaining <= 0) {
    const attackSpeed = Number(player.attackSpeedMultiplier) || 1;
    player.krajanekRideTickTimer = KRAJANEK_RIDE_TICK_SECONDS / attackSpeed;
    firedSparkBeat = true;

    player.krajanekImpulseTimer = 0.15; // +25% speed burst
    player.krajanekTurnBoostTimer = 0.10; // 2x turn rate boost
    callbacks?.onCameraShake?.(0.08, 6);
    callbacks?.onSound?.('zernovHammer');

    // Sparks reach ground monsters outside the stone's direct path AND airborne flying enemies (even directly above the stone)
    for (let i = 0; i < count; i++) {
      const enemy = nearby[i];
      if (!enemy || enemy.isDefeated || enemy.dead) continue;

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const enemyRadius = Math.max(0, enemy.radius || 0);
      const touchingStone = distance <= radius + enemyRadius;
      const isFlying = isAirborneFlyingEnemy(enemy);
      if ((!isFlying && touchingStone) || distance > KRAJANEK_SPARK_RADIUS + enemyRadius) continue;
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

  // 5. Advance ride duration and handle PHASE 4 Katapultáž a dojezd
  const prevRideTimer = player.krajanekRideTimer || 0;
  player.krajanekRideTimer = Math.max(0, player.krajanekRideTimer - dt);

  if (player.krajanekRideTimer > 0) {
    player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, player.krajanekRideTimer);
    player.meltingPuddleSlowTimer = 0;
  } else if (prevRideTimer > 0) {
    // PHASE 4: Katapultáž a dojezd!
    // Krajánek leaps off with somersault (at least 1.2s safe landing grace window)
    player.invulnerabilityTimer = Math.max(player.invulnerabilityTimer || 0, Math.max(1.2, KRAJANEK_DISMOUNT_INVULNERABILITY));
    player.meltingPuddleSlowTimer = 0;
    callbacks?.onDamageText?.({
      x: player.x,
      y: player.y - 40,
      text: 'KATAPULTÁŽ! 🤸',
      color: '#FDE047',
    });

    // Runaway millstone flies forward as an unguided projectile for 1.5s
    const heading = player.krajanekHeadingAngle ?? Math.atan2(player.lastDy || 0, player.lastDx || 1);
    const coastSpeed = 360 * (1 + (player.krajanekColossusStacks || 0) * 0.05);
    const coastingStone: KrajanekCoastingStone = {
      x: player.x,
      y: player.y,
      vx: Math.cos(heading) * coastSpeed,
      vy: Math.sin(heading) * coastSpeed,
      angle: heading,
      radius: radius,
      life: KRAJANEK_COAST_DURATION,
      maxLife: KRAJANEK_COAST_DURATION,
      damageScale: damageScale,
      colossusStacks: player.krajanekColossusStacks || 0,
      isFlatSlam: false,
    };

    if (typeof callbacks?.onSpawnCoastingStone === 'function') {
      callbacks.onSpawnCoastingStone(coastingStone);
    } else if (callbacks?.engine?.krajanekCoastingStones) {
      callbacks.engine.krajanekCoastingStones.push(coastingStone);
    } else if (player.krajanekCoastingStones) {
      player.krajanekCoastingStones.push(coastingStone);
    }

    // Reset ride ephemeral stats
    player.krajanekColossusStacks = 0;
    player.krajanekCrushedCount = 0;
    player.krajanekPhase1Fired = false;
    player.krajanekDriftTimer = 0;
    player.krajanekImpulseTimer = 0;
    player.krajanekTurnBoostTimer = 0;
  }

  return firedSparkBeat;
}

/**
 * Updates unguided coasting millstones (Phase 4), crushing enemies in their path
 * and slamming flat onto the ground upon expiration with an AOE shockwave.
 */
export function stepKrajanekCoastingStones(
  stones: KrajanekCoastingStone[],
  dt: number,
  enemies: any[],
  callbacks?: any,
): void {
  if (!stones || !stones.length) return;

  for (let i = stones.length - 1; i >= 0; i--) {
    const stone = stones[i];
    stone.x += stone.vx * dt;
    stone.y += stone.vy * dt;
    stone.life -= dt;

    // Crush ground enemies in path (rolls underneath airborne flying crows)
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (!e || e.isDefeated || e.dead || isAirborneFlyingEnemy(e)) continue;
      const dx = e.x - stone.x;
      const dy = e.y - stone.y;
      const dist = Math.hypot(dx, dy);
      const reach = stone.radius + (e.radius || 15);
      if (dist <= reach && typeof e.takeDamage === 'function') {
        e.takeDamage(KRAJANEK_CRUSH_DAMAGE * 1.2 * stone.damageScale, 'physical', 0, 0, { ignoreDodge: true });
      }
    }

    // Final flat slam
    if (stone.life <= 0) {
      callbacks?.onSound?.('zernovSlam');
      callbacks?.onCameraShake?.(0.45, 14);

      // Massive AOE crush around landing site (ground enemies only)
      const slamRadius = 110;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (!e || e.isDefeated || e.dead || isAirborneFlyingEnemy(e)) continue;
        const dx = e.x - stone.x;
        const dy = e.y - stone.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= slamRadius + (e.radius || 15) && typeof e.takeDamage === 'function') {
          e.takeDamage(KRAJANEK_CRUSH_DAMAGE * 1.5 * stone.damageScale, 'physical', 0, 0, { ignoreDodge: true });
        }
      }

      callbacks?.onDamageText?.({
        x: stone.x,
        y: stone.y - 35,
        text: 'PLÁCNUTÍ ŽERNOVU! 💥',
        color: '#FDE047',
      });

      stones.splice(i, 1);
    }
  }
}

/**
 * Helper to check whether any hunter ultimate or active ability state is currently active.
 * Ability cooldowns must NOT tick down while an ability is active.
 */
export function isPlayerAbilityActive(player: any, engineOrState?: any): boolean {
  if (!player) return false;

  // Krajánek — Jízda na žernovu
  if (player.type === 'krajanek' && (player.krajanekRideTimer || 0) > 0) {
    return true;
  }

  // Active cutscene (e.g. Babička time stop, Pastýř stampede, Kořenářka incense)
  const state = engineOrState?.state || engineOrState;
  if (state?.cutscene || engineOrState?.cutscene) {
    return true;
  }

  // Sexton / Kostelník — Farní požehnání
  const blessing = state?.blessing || engineOrState?.blessing;
  if (blessing && typeof blessing.t === 'number' && typeof blessing.dur === 'number' && blessing.t < blessing.dur) {
    return true;
  }

  // Wanderer / Toulavý hrdina — Pověstná sukovice
  const sukovice = state?.sukovice || engineOrState?.sukovice;
  if (sukovice && typeof sukovice.t === 'number' && typeof sukovice.dur === 'number' && sukovice.t < sukovice.dur) {
    return true;
  }

  // Time stop active
  if ((state?.timeStopTimer || 0) > 0 || (engineOrState?.timeStopTimer || 0) > 0) {
    return true;
  }

  return false;
}

