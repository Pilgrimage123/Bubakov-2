export interface TacticalAiContext {
  dt: number;
  gameTime: number;
  activeLevelId: number;
  player: any;
  spd: number;
  dist: number;
  dir: number;
  windupMult: number;
  specialCdMult: number;
  projectiles: any[];
  addHazard: (hazard: any) => boolean;
  emitText: (x: number, y: number, text: string, color: string, isCrit?: boolean) => void;
  playSound: (kind: string) => void;
  emitParticle?: (
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number
  ) => void;
  decrementTimers?: boolean;
}

export const TACTICAL_REGULAR_ENEMY_IDS: ReadonlySet<string> = new Set([
  'skodnik',
  'rak_ricni',
  'boruvkovy_diblik',
  'divozenka',
  'mrazik',
  'severak',
  'cerny_vlkodlak',
  'podzimni_strasak',
  'divoky_kanec',
  'lesni_pytlak',
  'kluk_na_sankach',
  'masopustni_laufr',
  'masopustni_krasojezdec',
  'smutecni_maskara',
  'plivnik_uhlik',
]);

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function beginWindup(enemy: any, duration: number, aimAngle: number): void {
  enemy.aiState = 'windup';
  enemy.aiTimer = duration;
  enemy.aiWindupDuration = Math.max(0.15, duration);
  enemy.chargeDirX = aimAngle;
  enemy.attackAngle = aimAngle;
  enemy.vx = 0;
  enemy.vy = 0;
}

function finishWindupToIdle(enemy: any, strikeDur: number, aimAngle: number): void {
  enemy.aiState = 'idle';
  enemy.strikeTimer = strikeDur;
  enemy.strikeMaxTimer = strikeDur;
  enemy.attackAngle = aimAngle;
}

function spawnEnemyProjectile(
  projectiles: any[],
  x: number,
  y: number,
  angle: number,
  speed: number,
  dmg: number,
  radius: number,
  type: string,
  visual: string,
  color: string,
  life: number,
  options?: {
    pushback?: number;
    slowPlayer?: boolean;
    soakPlayer?: boolean;
    statusText?: string;
    statusColor?: string;
  }
): void {
  if (!Array.isArray(projectiles)) return;
  projectiles.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle,
    speed,
    dmg,
    damage: dmg,
    radius,
    type,
    visual,
    color,
    life,
    maxLife: life,
    isEnemy: true,
    pushback: options?.pushback || 0,
    slowPlayer: Boolean(options?.slowPlayer),
    soakPlayer: Boolean(options?.soakPlayer),
    statusText: options?.statusText,
    statusColor: options?.statusColor,
    dead: false,
  });
}

function makeHazardId(prefix: string, gameTime: number): string {
  return `${prefix}_${Math.round((gameTime || 0) * 1000)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Shared tactical regular-enemy AI used by both live gameplay (App.tsx) and headless simulation (GameEngine).
 * Returns true if the enemy's movement/AI was handled by a tactical behavior.
 */
export function stepTacticalRegularAi(enemy: any, ctx: TacticalAiContext): boolean {
  const id = enemy?.id;
  if (!id || !TACTICAL_REGULAR_ENEMY_IDS.has(id)) return false;

  const {
    dt,
    gameTime,
    player,
    spd,
    dist,
    dir,
    windupMult,
    specialCdMult,
    projectiles,
    addHazard,
    emitText,
    playSound,
    emitParticle,
    decrementTimers,
  } = ctx;

  if (typeof enemy.aiTimer !== 'number') enemy.aiTimer = 0;
  if (typeof enemy.specialCd !== 'number') enemy.specialCd = 0.8 + Math.random() * 0.8;
  if (typeof enemy.orbitDir !== 'number' || enemy.orbitDir === 0) {
    enemy.orbitDir = Math.random() < 0.5 ? -1 : 1;
  }
  if (decrementTimers) {
    enemy.aiTimer -= dt;
    enemy.specialCd -= dt;
  }
  if (typeof enemy.dodgeCd === 'number' && enemy.dodgeCd > 0) {
    enemy.dodgeCd = Math.max(0, enemy.dodgeCd - dt);
  }

  if (enemy.panicked) {
    if (enemy.aiState === 'windup') enemy.aiState = 'idle';
    enemy.vx = Math.cos(dir + Math.PI) * spd;
    enemy.vy = Math.sin(dir + Math.PI) * spd;
    return true;
  }

  // 1. Lesní veverčák-škodík (skodnik) — Skittish mid-range skirmisher throwing spruce pinecones
  if (id === 'skodnik') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const throwAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const projDmg = Math.max(8, Math.round((enemy.damage || 20) * 0.7));
        spawnEnemyProjectile(
          projectiles,
          enemy.x + Math.cos(throwAng) * 16,
          enemy.y + Math.sin(throwAng) * 16,
          throwAng,
          255,
          projDmg,
          9,
          'physical',
          'wood_shard',
          '#92400E',
          1.7,
          { pushback: 18, statusText: 'SMRKOVÁ ŠIŠKA! 🌲', statusColor: '#D97706' }
        );
        playSound('swish');
        finishWindupToIdle(enemy, 0.22, throwAng);
        enemy.aiState = 'evade';
        enemy.aiTimer = 0.42;
        enemy.orbitDir = -enemy.orbitDir;
        enemy.chargeDirX = dir + Math.PI + enemy.orbitDir * 0.65;
        enemy.specialCd = (2.3 + Math.random() * 0.7) * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'evade') {
      const evadeAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir + Math.PI;
      enemy.vx = Math.cos(evadeAng) * spd * 1.35;
      enemy.vy = Math.sin(evadeAng) * spd * 1.35;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }
    if (dist < 95) {
      // Skittish retreat if hunter rushes in
      const fleeAng = dir + Math.PI + enemy.orbitDir * 0.55;
      enemy.vx = Math.cos(fleeAng) * spd * 1.25;
      enemy.vy = Math.sin(fleeAng) * spd * 1.25;
      return true;
    }
    if (dist >= 110 && dist <= 290 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.36 * windupMult, dir);
      return true;
    }
    // Agile lateral squirrel darting
    const weave = dist > 230 ? enemy.orbitDir * 0.35 : enemy.orbitDir * 1.05;
    enemy.vx = Math.cos(dir + weave) * spd;
    enemy.vy = Math.sin(dir + weave) * spd;
    return true;
  }

  // 2. Říční rak klepetáč (rak_ricni) — Armored lateral crab scuttle & telegraphed pincer snap
  if (id === 'rak_ricni') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'charge';
        enemy.aiTimer = 0.28;
        playSound('slash');
        emitText(enemy.x, enemy.y - 26, 'CHŇAP! 🦞', '#EA580C', false);
      }
      return true;
    }
    if (enemy.aiState === 'charge') {
      const snapAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
      enemy.vx = Math.cos(snapAng) * spd * 2.35;
      enemy.vy = Math.sin(snapAng) * spd * 2.35;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'cooldown';
        enemy.aiTimer = 0.48;
        enemy.specialCd = 2.5 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'cooldown') {
      // Exposed rear/flank recovery after snapping claws
      enemy.vx = Math.cos(dir) * spd * 0.32;
      enemy.vy = Math.sin(dir) * spd * 0.32;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }
    if (dist <= 145 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.42 * windupMult, dir);
      return true;
    }
    enemy.strafeTimer = (typeof enemy.strafeTimer === 'number' ? enemy.strafeTimer : 1.4) - dt;
    if (enemy.strafeTimer <= 0) {
      enemy.strafeTimer = 1.2 + Math.random() * 0.8;
      enemy.orbitDir = -enemy.orbitDir;
    }
    const scuttleAng = dir + enemy.orbitDir * 0.58;
    enemy.vx = Math.cos(scuttleAng) * spd;
    enemy.vy = Math.sin(scuttleAng) * spd;
    return true;
  }

  // 3. Borůvkový diblík (boruvkovy_diblik) — Kiting berry bomber leaving sticky slowing puddles
  if (id === 'boruvkovy_diblik') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const throwAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const projDmg = Math.max(8, Math.round((enemy.damage || 18) * 0.75));
        spawnEnemyProjectile(
          projectiles,
          enemy.x,
          enemy.y,
          throwAng,
          225,
          projDmg,
          10,
          'poison',
          'mud_ball',
          '#4338CA',
          1.9,
          { slowPlayer: true, statusText: 'BORŮVKOVÁ ŠŤÁVA! 🫐', statusColor: '#818CF8' }
        );
        addHazard({
          id: makeHazardId('hazard_berry', gameTime),
          x: player.x,
          y: player.y,
          radius: 38,
          duration: 4.5,
          maxDuration: 4.5,
          type: 'mud',
          slowFactor: 0.62,
          kind: 'berry-puddle',
          warningTimer: 0.55,
          damage: 0,
          sourceEnemyId: enemy.id,
        });
        playSound('splash');
        finishWindupToIdle(enemy, 0.22, throwAng);
        enemy.specialCd = 3.0 * specialCdMult;
        enemy.orbitDir = -enemy.orbitDir;
      }
      return true;
    }
    if (dist <= 310 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.42 * windupMult, dir);
      return true;
    }
    if (dist < 125) {
      const kiteAng = dir + Math.PI + enemy.orbitDir * 0.45;
      enemy.vx = Math.cos(kiteAng) * spd * 1.1;
      enemy.vy = Math.sin(kiteAng) * spd * 1.1;
    } else if (dist <= 245) {
      const strafeAng = dir + enemy.orbitDir * 1.25;
      enemy.vx = Math.cos(strafeAng) * spd * 0.9;
      enemy.vy = Math.sin(strafeAng) * spd * 0.9;
    } else {
      enemy.vx = Math.cos(dir) * spd;
      enemy.vy = Math.sin(dir) * spd;
    }
    return true;
  }

  // 4. Lesní divoženka (divozenka) — Hypnotic figure-8 dancer with reactive projectile evasion
  if (id === 'divozenka') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const baseAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const petalDmg = Math.max(8, Math.round((enemy.damage || 35) * 0.42));
        for (let k = -1; k <= 1; k++) {
          spawnEnemyProjectile(
            projectiles,
            enemy.x,
            enemy.y,
            baseAng + k * 0.42,
            175,
            petalDmg,
            9,
            'magic',
            'pollen',
            '#A3E635',
            1.15,
            { slowPlayer: true, statusText: 'OMAMNÝ TANEC! 🌸', statusColor: '#BEF264' }
          );
        }
        playSound('swish');
        finishWindupToIdle(enemy, 0.32, baseAng);
        enemy.specialCd = 3.3 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'evade') {
      const evadeAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir + Math.PI / 2;
      enemy.vx = Math.cos(evadeAng) * spd * 2.25;
      enemy.vy = Math.sin(evadeAng) * spd * 2.25;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }

    // Reactive sidestep pirouette when a player projectile approaches within 110px
    if ((enemy.dodgeCd || 0) <= 0 && Array.isArray(projectiles) && projectiles.length > 0) {
      const scanLimit = Math.min(projectiles.length, 48);
      for (let i = 0; i < scanLimit; i++) {
        const p = projectiles[i];
        if (!p || p.dead || p.isEnemy) continue;
        const dx = enemy.x - p.x;
        const dy = enemy.y - p.y;
        const dSq = dx * dx + dy * dy;
        if (dSq > 110 * 110) continue;
        const pvx = p.vx || 0;
        const pvy = p.vy || 0;
        if (dx * pvx + dy * pvy > 0) {
          const projAng = Math.atan2(pvy, pvx);
          enemy.orbitDir = -enemy.orbitDir;
          enemy.aiState = 'evade';
          enemy.aiTimer = 0.28;
          enemy.dodgeCd = 1.55;
          enemy.chargeDirX = projAng + (enemy.orbitDir >= 0 ? Math.PI / 2 : -Math.PI / 2);
          enemy.vx = Math.cos(enemy.chargeDirX) * spd * 2.25;
          enemy.vy = Math.sin(enemy.chargeDirX) * spd * 2.25;
          emitText(enemy.x, enemy.y - 26, 'ÚHYB! 💃', '#BEF264', false);
          if (emitParticle) {
            emitParticle(enemy.x, enemy.y, (Math.random() - 0.5) * 60, -25, '#BEF264', 3.5, 0.35);
          }
          return true;
        }
      }
    }

    if (dist <= 185 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.42 * windupMult, dir);
      return true;
    }

    const danceWeave = Math.sin((enemy.animTime || 0) * 3.8) * 0.65;
    enemy.vx = Math.cos(dir + danceWeave) * spd;
    enemy.vy = Math.sin(dir + danceWeave) * spd;
    return true;
  }

  // 5. Mrazík z komína (mrazik) — Chilling breath cone skirmisher
  if (id === 'mrazik') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const aimAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const breathDmg = Math.max(8, Math.round((enemy.damage || 35) * 0.45));
        for (let k = -1; k <= 1; k++) {
          spawnEnemyProjectile(
            projectiles,
            enemy.x + Math.cos(aimAng) * 14,
            enemy.y + Math.sin(aimAng) * 14,
            aimAng + k * 0.26,
            205,
            breathDmg,
            8,
            'ice',
            'snowball_small',
            '#BAE6FD',
            1.45,
            { slowPlayer: true, statusText: 'MRAZIVÝ DECH! ❄️', statusColor: '#7DD3FC' }
          );
        }
        playSound('freeze');
        finishWindupToIdle(enemy, 0.32, aimAng);
        enemy.specialCd = 3.0 * specialCdMult;
      }
      return true;
    }
    if (dist <= 275 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.46 * windupMult, dir);
      return true;
    }
    if (dist < 130) {
      const backAng = dir + Math.PI + enemy.orbitDir * 0.4;
      enemy.vx = Math.cos(backAng) * spd * 0.9;
      enemy.vy = Math.sin(backAng) * spd * 0.9;
    } else if (dist <= 220) {
      const strafeAng = dir + enemy.orbitDir * 1.15;
      enemy.vx = Math.cos(strafeAng) * spd * 0.85;
      enemy.vy = Math.sin(strafeAng) * spd * 0.85;
    } else {
      enemy.vx = Math.cos(dir) * spd;
      enemy.vy = Math.sin(dir) * spd;
    }
    return true;
  }

  // 6. Severák z hor (severak) — North wind gust that deflects player projectiles and fires wind blades
  if (id === 'severak') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const aimAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        // Counter-wind pulse deflects nearby player projectiles laterally
        if (Array.isArray(projectiles)) {
          const deflectR2 = 135 * 135;
          for (let i = 0; i < projectiles.length; i++) {
            const p = projectiles[i];
            if (!p || p.dead || p.isEnemy || p._deflectedBySeverak) continue;
            const pdx = p.x - enemy.x;
            const pdy = p.y - enemy.y;
            if (pdx * pdx + pdy * pdy <= deflectR2) {
              p._deflectedBySeverak = true;
              const pAng = Math.atan2(p.vy || 0, p.vx || 1) + enemy.orbitDir * 0.58;
              const pSpd = p.speed || Math.hypot(p.vx || 0, p.vy || 0) || 260;
              p.vx = Math.cos(pAng) * pSpd;
              p.vy = Math.sin(pAng) * pSpd;
              p.angle = pAng;
            }
          }
        }
        const gustDmg = Math.max(12, Math.round((enemy.damage || 60) * 0.45));
        for (let k = -1; k <= 1; k += 2) {
          spawnEnemyProjectile(
            projectiles,
            enemy.x,
            enemy.y,
            aimAng + k * 0.16,
            260,
            gustDmg,
            11,
            'ice',
            'wind_blade',
            '#7DD3FC',
            1.75,
            { pushback: 26, statusText: 'PROTIVÍTR! 🌬️', statusColor: '#BAE6FD' }
          );
        }
        playSound('swish');
        emitText(enemy.x, enemy.y - 34, 'PROTIVĚTRNÝ PORYV! 🌬️', '#7DD3FC', false);
        finishWindupToIdle(enemy, 0.35, aimAng);
        enemy.specialCd = 3.4 * specialCdMult;
        enemy.orbitDir = -enemy.orbitDir;
      }
      return true;
    }
    if (dist <= 320 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.45 * windupMult, dir);
      return true;
    }
    const sweepOffset = Math.sin((enemy.animTime || 0) * 2.2) * 0.68;
    enemy.vx = Math.cos(dir + sweepOffset) * spd;
    enemy.vy = Math.sin(dir + sweepOffset) * spd;
    return true;
  }

  // 7. Černý vlk z panského polesí (cerny_vlkodlak) — Pincer flanking & lightning lunge
  if (id === 'cerny_vlkodlak') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'charge';
        enemy.aiTimer = 0.34;
        playSound('roar');
      }
      return true;
    }
    if (enemy.aiState === 'charge') {
      const lungeAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
      enemy.vx = Math.cos(lungeAng) * spd * 2.65;
      enemy.vy = Math.sin(lungeAng) * spd * 2.65;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'cooldown';
        enemy.aiTimer = 0.36;
        enemy.specialCd = 2.6 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'cooldown') {
      enemy.vx = Math.cos(dir) * spd * 0.45;
      enemy.vy = Math.sin(dir) * spd * 0.45;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }
    if (dist >= 85 && dist <= 235 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.38 * windupMult, dir);
      return true;
    }
    // Pack pincer flanking when approaching from mid-range
    const flankOffset = dist > 135 ? enemy.orbitDir * 0.62 : 0;
    enemy.vx = Math.cos(dir + flankOffset) * spd;
    enemy.vy = Math.sin(dir + flankOffset) * spd;
    return true;
  }

  // 8. Podzimní polní strašák (podzimni_strasak) — Telegraphed wooden rake sweep
  if (id === 'podzimni_strasak') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const rakeAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const rakeDmg = Math.max(10, Math.round((enemy.damage || 45) * 0.55));
        for (let k = -1; k <= 1; k++) {
          spawnEnemyProjectile(
            projectiles,
            enemy.x + Math.cos(rakeAng) * 20,
            enemy.y + Math.sin(rakeAng) * 20,
            rakeAng + k * 0.34,
            210,
            rakeDmg,
            11,
            'physical',
            'wood_shard',
            '#B45309',
            0.62,
            { pushback: 24, statusText: 'ŠVIH HRÁBĚMI! 🍂', statusColor: '#F59E0B' }
          );
        }
        playSound('slash');
        finishWindupToIdle(enemy, 0.38, rakeAng);
        enemy.aiState = 'charge';
        enemy.aiTimer = 0.18;
        enemy.specialCd = 2.8 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'charge') {
      const stepAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
      enemy.vx = Math.cos(stepAng) * spd * 1.55;
      enemy.vy = Math.sin(stepAng) * spd * 1.55;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }
    if (dist <= 125 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.54 * windupMult, dir);
      return true;
    }
    enemy.vx = Math.cos(dir) * spd;
    enemy.vy = Math.sin(dir) * spd;
    return true;
  }

  // 9. Divoký kanec z doubravy (divoky_kanec) — Matador telegraphed tusk bull-rush with panting recovery
  if (id === 'divoky_kanec') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'charge';
        enemy.aiTimer = 0.72;
        playSound('roar');
      }
      return true;
    }
    if (enemy.aiState === 'charge') {
      const rushAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
      enemy.vx = Math.cos(rushAng) * spd * 2.7;
      enemy.vy = Math.sin(rushAng) * spd * 2.7;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'cooldown';
        enemy.aiTimer = 0.65;
        enemy.specialCd = 3.2 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'cooldown') {
      // Panting recovery after missing a bull-rush
      enemy.vx = Math.cos(dir) * spd * 0.25;
      enemy.vy = Math.sin(dir) * spd * 0.25;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'idle';
      }
      return true;
    }
    if (dist >= 100 && dist <= 340 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.60 * windupMult, dir);
      emitText(enemy.x, enemy.y - 30, 'CHROCHT! 🐗', '#F59E0B', false);
      return true;
    }
    enemy.vx = Math.cos(dir) * spd;
    enemy.vy = Math.sin(dir) * spd;
    return true;
  }

  // 10. Lesní pytlák s prakem (lesni_pytlak) — Kiting marksman with predictive sling lead
  if (id === 'lesni_pytlak') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const leadX = player.x + (player.vx || 0) * 0.26;
        const leadY = player.y + (player.vy || 0) * 0.26;
        const shotAng = Math.atan2(leadY - enemy.y, leadX - enemy.x);
        const shotDmg = Math.max(10, Math.round((enemy.damage || 26) * 0.78));
        spawnEnemyProjectile(
          projectiles,
          enemy.x + Math.cos(shotAng) * 16,
          enemy.y + Math.sin(shotAng) * 16,
          shotAng,
          315,
          shotDmg,
          8,
          'physical',
          'dirt_clod',
          '#78350F',
          1.75,
          { pushback: 20, statusText: 'KŘEMENNÝ OBLÁZEK! 🪨', statusColor: '#D6D3D1' }
        );
        playSound('swish');
        finishWindupToIdle(enemy, 0.28, shotAng);
        enemy.specialCd = 2.6 * specialCdMult;
        enemy.orbitDir = -enemy.orbitDir;
      }
      return true;
    }
    if (dist <= 360 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.48 * windupMult, dir);
      return true;
    }
    if (dist < 150) {
      const kiteAng = dir + Math.PI + enemy.orbitDir * 0.45;
      enemy.vx = Math.cos(kiteAng) * spd * 1.08;
      enemy.vy = Math.sin(kiteAng) * spd * 1.08;
    } else if (dist <= 285) {
      const strafeAng = dir + enemy.orbitDir * 1.2;
      enemy.vx = Math.cos(strafeAng) * spd * 0.92;
      enemy.vy = Math.sin(strafeAng) * spd * 0.92;
    } else {
      enemy.vx = Math.cos(dir) * spd;
      enemy.vy = Math.sin(dir) * spd;
    }
    return true;
  }

  // 11. Kluk na saních (kluk_na_sankach) — Unstoppable sled momentum & wide drift turns
  if (id === 'kluk_na_sankach') {
    if (!Number.isFinite(enemy.sledHeading)) {
      enemy.sledHeading = dir;
      enemy.sledSpeed = spd * 1.35;
    }
    const diff = normalizeAngleDiff(dir, enemy.sledHeading);
    const maxTurn = 1.75 * dt;
    if (Math.abs(diff) <= maxTurn) {
      enemy.sledHeading = dir;
    } else {
      enemy.sledHeading += Math.sign(diff) * maxTurn;
    }
    // Accelerate on straight runs, shed speed slightly during sharp carves
    const targetSpeed = Math.abs(diff) > 0.7 ? spd * 1.15 : spd * 1.65;
    enemy.sledSpeed = (enemy.sledSpeed || spd) + (targetSpeed - (enemy.sledSpeed || spd)) * Math.min(1, dt * 2.5);
    enemy.vx = Math.cos(enemy.sledHeading) * enemy.sledSpeed;
    enemy.vy = Math.sin(enemy.sledHeading) * enemy.sledSpeed;
    return true;
  }

  // 12. Masopustní Laufr (masopustni_laufr) — Fast zig-zag scout with whip-crack spark
  if (id === 'masopustni_laufr') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const crackAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const crackDmg = Math.max(10, Math.round((enemy.damage || 32) * 0.65));
        spawnEnemyProjectile(
          projectiles,
          enemy.x + Math.cos(crackAng) * 18,
          enemy.y + Math.sin(crackAng) * 18,
          crackAng,
          290,
          crackDmg,
          9,
          'physical',
          'hell_spark',
          '#F59E0B',
          0.78,
          { pushback: 22, statusText: 'PRÁSKNUTÍ BIČEM! 🎭', statusColor: '#FDE047' }
        );
        playSound('slash');
        finishWindupToIdle(enemy, 0.22, crackAng);
        enemy.aiState = 'evade';
        enemy.aiTimer = 0.35;
        enemy.orbitDir = -enemy.orbitDir;
        enemy.chargeDirX = dir + enemy.orbitDir * 1.25;
        enemy.specialCd = 2.7 * specialCdMult;
      }
      return true;
    }
    if (enemy.aiState === 'evade') {
      const dashAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir + Math.PI / 2;
      enemy.vx = Math.cos(dashAng) * spd * 1.35;
      enemy.vy = Math.sin(dashAng) * spd * 1.35;
      if (enemy.aiTimer <= 0) enemy.aiState = 'idle';
      return true;
    }
    if (dist <= 220 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.34 * windupMult, dir);
      return true;
    }
    const zig = Math.sin((enemy.animTime || 0) * 5.2) * 0.6;
    enemy.vx = Math.cos(dir + zig) * spd;
    enemy.vy = Math.sin(dir + zig) * spd;
    return true;
  }

  // 13. Krasojezdec na koníku (masopustni_krasojezdec) — Cavalry arc trot & gallop lance charge
  if (id === 'masopustni_krasojezdec') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'charge';
        enemy.aiTimer = 0.62;
        playSound('roar');
      }
      return true;
    }
    if (enemy.aiState === 'charge') {
      const gallopAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
      enemy.vx = Math.cos(gallopAng) * spd * 2.35;
      enemy.vy = Math.sin(gallopAng) * spd * 2.35;
      if (enemy.aiTimer <= 0) {
        enemy.aiState = 'cooldown';
        enemy.aiTimer = 0.45;
        enemy.specialCd = 3.2 * specialCdMult;
        enemy.orbitDir = -enemy.orbitDir;
      }
      return true;
    }
    if (enemy.aiState === 'cooldown') {
      enemy.vx = Math.cos(dir) * spd * 0.4;
      enemy.vy = Math.sin(dir) * spd * 0.4;
      if (enemy.aiTimer <= 0) enemy.aiState = 'idle';
      return true;
    }
    if (dist >= 100 && dist <= 320 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.48 * windupMult, dir);
      return true;
    }
    const trotAng = dir + (dist > 140 ? enemy.orbitDir * 0.48 : 0);
    enemy.vx = Math.cos(trotAng) * spd;
    enemy.vy = Math.sin(trotAng) * spd;
    return true;
  }

  // 14. Smuteční maškara (smutecni_maskara) — Paralyzing lament pulse
  if (id === 'smutecni_maskara') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const wailAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const wailDmg = Math.max(10, Math.round((enemy.damage || 42) * 0.5));
        for (let k = -1; k <= 1; k++) {
          spawnEnemyProjectile(
            projectiles,
            enemy.x,
            enemy.y,
            wailAng + k * 0.35,
            165,
            wailDmg,
            11,
            'magic',
            'water_wave',
            '#94A3B8',
            1.35,
            { slowPlayer: true, statusText: 'OCHROMUJÍCÍ KVÍLENÍ! 🖤', statusColor: '#CBD5E1' }
          );
        }
        playSound('curse');
        finishWindupToIdle(enemy, 0.32, wailAng);
        enemy.specialCd = 3.3 * specialCdMult;
      }
      return true;
    }
    if (dist <= 220 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.50 * windupMult, dir);
      return true;
    }
    enemy.vx = Math.cos(dir) * spd;
    enemy.vy = Math.sin(dir) * spd;
    return true;
  }

  // 15. Plivník uhlík (plivnik_uhlik) — Agile ember hopper spitting hot sparks
  if (id === 'plivnik_uhlik') {
    if (enemy.aiState === 'windup') {
      enemy.vx = 0;
      enemy.vy = 0;
      if (enemy.aiTimer <= 0) {
        const spitAng = Number.isFinite(enemy.chargeDirX) ? enemy.chargeDirX : dir;
        const spitDmg = Math.max(10, Math.round((enemy.damage || 34) * 0.65));
        spawnEnemyProjectile(
          projectiles,
          enemy.x + Math.cos(spitAng) * 14,
          enemy.y + Math.sin(spitAng) * 14,
          spitAng,
          255,
          spitDmg,
          9,
          'fire',
          'hell_spark',
          '#F97316',
          1.55,
          { statusText: 'ŽHAVÝ PLIVANEC! 🔥', statusColor: '#FB923C' }
        );
        playSound('hit');
        finishWindupToIdle(enemy, 0.22, spitAng);
        enemy.specialCd = 2.6 * specialCdMult;
      }
      return true;
    }
    if (dist <= 265 && enemy.specialCd <= 0) {
      beginWindup(enemy, 0.36 * windupMult, dir);
      return true;
    }
    enemy.hopPhase = (enemy.hopPhase || 0) + dt * 5.2;
    const hopBoost = Math.sin(enemy.hopPhase) > 0 ? 1.35 : 0.72;
    const hopWeave = Math.sin(enemy.hopPhase * 0.5) * 0.42;
    enemy.vx = Math.cos(dir + hopWeave) * spd * hopBoost;
    enemy.vy = Math.sin(dir + hopWeave) * spd * hopBoost;
    return true;
  }

  return false;
}
