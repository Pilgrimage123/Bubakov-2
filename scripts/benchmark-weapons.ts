import { WEAPONS } from '../src/data/weapons';
import { ENEMIES } from '../src/data/enemies';
import { getRankedWeaponStats, getWeaponRankDef, getEffectiveWeaponCooldown } from '../src/data/weaponMilestones';

interface SimEnemy {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  hunger: number;
  foodResist: number;
  poiseResist: number;
  willpower: number;
  isDefeated: boolean;
  dead: boolean;
  snackTimer: number;
  stunTimer: number;
  chillTimer: number;
  garlicSlowTimer: number;
  chilled: boolean;
  soaked: boolean;
  kbx: number;
  kby: number;
  isAttacking: boolean;
  windupTimer: number;
  attackRange: number;
  attackDelay: number;
  statusEffects: Record<string, any>;
  takeDamage: (amount: number, type?: string, kbx?: number, kby?: number, options?: any) => void;
  soak: () => void;
  chill: (sec: number) => void;
  applyStatusEffect: (name: string, data: any) => void;
  getStatusEffect: (name: string) => any;
}

interface SimProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  dmg: number;
  radius: number;
  type: string;
  life: number;
  dead: boolean;
  snackDuration?: number;
  pierce?: number;
  hitList: SimEnemy[];
  bounces?: number;
  homing?: boolean;
}

interface SimSlash {
  x: number;
  y: number;
  angle: number;
  reach: number;
  arc: number;
  dmg: number;
  life: number;
  dead: boolean;
  hitList: SimEnemy[];
  style?: string;
  weaponId?: string;
}

interface BenchmarkResult {
  weaponId: string;
  weaponName: string;
  variant: 'CURRENT' | 'PROPOSED';
  scenario: string;
  ttk: number | null; // null if failed to kill before time limit or player died
  playerBreached: boolean;
  minDist: number;
  damageDealt: number;
  effectiveDps: number;
  ccTimeTotal: number;
}

function createEnemy(id: string, x: number, y: number): SimEnemy {
  const stats = ENEMIES[id] || {
    hp: 48,
    speed: 100,
    radius: 15,
    foodResist: 0,
    poiseResist: 0,
    willpower: 0,
    name: id,
  };
  const enemy: SimEnemy = {
    id,
    name: stats.name || id,
    x,
    y,
    radius: stats.radius || 15,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    hunger: stats.foodResist || 0,
    foodResist: stats.foodResist || 0,
    poiseResist: stats.poiseResist || 0,
    willpower: stats.willpower || 0,
    isDefeated: false,
    dead: false,
    snackTimer: 0,
    stunTimer: 0,
    chillTimer: 0,
    garlicSlowTimer: 0,
    chilled: false,
    soaked: false,
    kbx: 0,
    kby: 0,
    isAttacking: false,
    windupTimer: 0,
    attackRange: (stats.radius || 15) + 25,
    attackDelay: 0.5,
    statusEffects: {},
    takeDamage(amount: number, _type = 'physical', kbx = 0, kby = 0, options?: any) {
      if (this.isDefeated) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.isDefeated = true;
        this.dead = true;
      }
      if (options?.stunDuration) {
        this.stunTimer = Math.max(this.stunTimer, options.stunDuration);
      }
      this.kbx = kbx;
      this.kby = kby;
    },
    soak() {
      this.soaked = true;
    },
    chill(sec: number) {
      this.chilled = true;
      this.chillTimer = sec;
    },
    applyStatusEffect(name: string, data: any) {
      this.statusEffects[name] = data;
    },
    getStatusEffect(name: string) {
      return this.statusEffects[name];
    },
  };
  return enemy;
}

function runSimulation(
  weaponDef: any,
  scenarioName: string,
  spawnEnemies: () => SimEnemy[],
  maxSeconds = 15,
  variant: 'CURRENT' | 'PROPOSED' = 'CURRENT',
  level = 1,
  milestones: string[] = []
): BenchmarkResult {
  let totalDmgDone = 0;
  const rawEnemies = spawnEnemies();
  const enemies: SimEnemy[] = rawEnemies.map((e) => ({
    ...e,
    takeDamage(amount: number, type = 'physical', kbx = 0, kby = 0, options?: any) {
      if (this.isDefeated) return;
      this.hp -= amount;
      totalDmgDone += amount;
      if (this.hp <= 0) {
        this.isDefeated = true;
        this.dead = true;
      }
      if (options?.stunDuration) {
        this.stunTimer = Math.max(this.stunTimer, options.stunDuration);
      }
      this.kbx = kbx;
      this.kby = kby;
    },
  }));
  const projectiles: SimProjectile[] = [];
  const slashes: SimSlash[] = [];

  const player = {
    x: 0,
    y: 0,
    lastDx: 1,
    lastDy: 0,
    animTime: 0,
    valecniceAngle: 0,
    hasSoakedCane: false,
    cooldownBonus: 0,
    cooldownMultiplier: 1,
    damageMultiplier: 1,
    tulakDamageBonus: 0,
    _firingWeapon: { id: weaponDef.id, level, milestones, mastery: { picked: [] } },
    getNearbyEnemies(radius: number) {
      return enemies.filter((e) => !e.dead && Math.hypot(e.x - this.x, e.y - this.y) <= radius);
    },
    getLivingEnemies() {
      return enemies.filter((e) => !e.dead);
    },
    distTo(target: SimEnemy) {
      return Math.hypot(target.x - this.x, target.y - this.y);
    },
    spawnProjectile(proj: any) {
      projectiles.push({
        x: proj.x,
        y: proj.y,
        vx: Math.cos(proj.angle) * proj.speed,
        vy: Math.sin(proj.angle) * proj.speed,
        speed: proj.speed,
        dmg: proj.dmg,
        radius: proj.radius || 12,
        type: proj.type || 'physical',
        life: proj.life || 2,
        dead: false,
        snackDuration: proj.snackDuration,
        pierce: proj.pierce || 0,
        hitList: [],
        bounces: proj.bounces || 0,
        homing: proj.homing || false,
      });
    },
    spawnMeleeSlash(slash: any) {
      slashes.push({
        x: slash.x,
        y: slash.y,
        angle: slash.angle,
        reach: slash.reach,
        arc: slash.arc,
        dmg: slash.dmg,
        life: slash.life || 0.3,
        dead: false,
        hitList: [],
        style: slash.style,
        weaponId: slash.weaponId,
      });
    },
    spawnAreaImpact(impact: any) {
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - impact.x, e.y - impact.y);
        if (d <= impact.radius + e.radius) {
          e.takeDamage(impact.dmg, impact.type, 300, 0, impact.stunDuration ? { stunDuration: impact.stunDuration } : undefined);
        }
      }
    },
    spawnHromnickaPulse(reach: number, dmg: number, lvl: number, knockbackMult = 1, stunDuration = 0) {
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - this.x, e.y - this.y);
        if (d <= reach + e.radius) {
          e.takeDamage(dmg, 'holy', (e.x / (d || 1)) * 200 * knockbackMult, (e.y / (d || 1)) * 200 * knockbackMult, stunDuration ? { stunDuration } : undefined);
        }
      }
    },
  };

  const dt = 1 / 60;
  let time = 0;
  let weaponCd = 0;
  let playerBreached = false;
  let minDist = Infinity;
  let totalCCTime = 0;

  while (time < maxSeconds) {
    time += dt;

    // Orbit angle for Válečnice
    const orbitSpeed = level >= 3 ? 2.5 : 2.2;
    player.valecniceAngle = (player.valecniceAngle + dt * orbitSpeed) % (Math.PI * 2);

    // Fire weapon
    weaponCd -= dt;
    if (weaponCd <= 0) {
      const fired = weaponDef.fire(player, level);
      const rankDef = getWeaponRankDef(weaponDef.id, level);
      const weaponCooldownBonus = rankDef?.cooldownReductionBonus ?? Math.max(0, (level - 1) * 0.08);
      const formulaCd = getEffectiveWeaponCooldown(weaponDef.baseCd, 0, weaponCooldownBonus);
      const stats = getRankedWeaponStats(weaponDef.id, level, player._firingWeapon);
      const localCd = Math.max(weaponDef.baseCd * 0.50, formulaCd * stats.cooldownMult);
      weaponCd = fired ? localCd : 0.1;
    }

    // Update projectiles
    for (const p of projectiles) {
      if (p.dead) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.dead = true;
        continue;
      }

      if (p.homing) {
        const alive = enemies.filter((e) => !e.dead);
        if (alive.length > 0) {
          const t = alive[0];
          const ang = Math.atan2(t.y - p.y, t.x - p.x);
          p.vx += Math.cos(ang) * 400 * dt;
          p.vy += Math.sin(ang) * 400 * dt;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(p.x - e.x, p.y - e.y);
        if (!p.hitList.includes(e) && d <= p.radius + e.radius) {
          p.hitList.push(e);
          const resist = p.type === 'food' ? e.foodResist : 0;
          let effDmg = p.dmg * (1 - resist);

          if (p.type === 'food') {
            const snack = (p.snackDuration ?? 3.0) * (1 - e.foodResist);
            e.snackTimer += snack;
            totalCCTime += snack;
          }

          e.takeDamage(effDmg, p.type, p.vx * 0.3, p.vy * 0.3);

          if (p.bounces && p.bounces > 0) {
            p.bounces--;
            const next = enemies.find((cand) => cand !== e && !cand.dead);
            if (next) {
              const bAng = Math.atan2(next.y - p.y, next.x - p.x);
              p.vx = Math.cos(bAng) * p.speed;
              p.vy = Math.sin(bAng) * p.speed;
              p.hitList = [];
              break;
            }
          }

          if (p.pierce && p.pierce > 0) {
            p.pierce--;
          } else {
            p.dead = true;
            break;
          }
        }
      }
    }

    // Update slashes
    for (const s of slashes) {
      if (s.dead) continue;
      s.life -= dt;
      if (s.life <= 0) {
        s.dead = true;
        continue;
      }
      for (const e of enemies) {
        if (e.dead || s.hitList.includes(e)) continue;
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d <= s.reach + e.radius) {
          const ang = Math.atan2(e.y - player.y, e.x - player.x);
          let diff = Math.abs(ang - s.angle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          if (diff <= s.arc / 2) {
            s.hitList.push(e);
            // cane flinch or knockback
            const kbForce = s.weaponId === 'cane' ? (variant === 'PROPOSED' ? 480 : 260) : 260;
            e.takeDamage(s.dmg, 'physical', Math.cos(s.angle) * kbForce, Math.sin(s.angle) * kbForce);
            if (variant === 'PROPOSED' && s.weaponId === 'cane') {
              // Micro flinch (0.2s)
              e.stunTimer = Math.max(e.stunTimer, 0.2);
              totalCCTime += 0.2;
            }
          }
        }
      }
    }

    // Update enemies
    let anyAlive = false;
    for (const e of enemies) {
      if (e.dead) continue;
      anyAlive = true;

      const dToP = Math.hypot(player.x - e.x, player.y - e.y);
      if (dToP < minDist) minDist = dToP;
      if (dToP <= 35) {
        playerBreached = true;
      }

      // CC checks
      if ((e as any).valecniceHitCd && (e as any).valecniceHitCd > 0) {
        (e as any).valecniceHitCd -= dt;
      }
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        e.kbx *= 0.88;
        e.kby *= 0.88;
        e.x += e.kbx * dt;
        e.y += e.kby * dt;
        continue;
      }
      if (e.snackTimer > 0) {
        e.snackTimer -= dt;
        e.kbx *= 0.85;
        e.kby *= 0.85;
        e.x += e.kbx * dt;
        e.y += e.kby * dt;
        continue;
      }

      // Knockback decay
      e.kbx *= 0.9;
      e.kby *= 0.9;

      let spd = e.speed;
      if (e.chilled) spd *= 0.5;
      if (e.garlicSlowTimer > 0) {
        e.garlicSlowTimer -= dt;
        spd *= 0.85;
      }
      if ((player as any)._valecniceSlowRadius) {
        if (dToP <= (player as any)._valecniceSlowRadius + e.radius) {
          spd *= 0.65;
        }
      }

      const angToP = Math.atan2(player.y - e.y, player.x - e.x);
      const vx = Math.cos(angToP) * spd;
      const vy = Math.sin(angToP) * spd;

      e.x += (vx + e.kbx) * dt;
      e.y += (vy + e.kby) * dt;
    }

    if (!anyAlive) {
      return {
        weaponId: weaponDef.id,
        weaponName: weaponDef.name,
        variant,
        scenario: scenarioName,
        ttk: parseFloat(time.toFixed(2)),
        playerBreached,
        minDist: Math.round(minDist),
        damageDealt: Math.round(totalDmgDone),
        effectiveDps: parseFloat((totalDmgDone / time).toFixed(1)),
        ccTimeTotal: parseFloat(totalCCTime.toFixed(2)),
      };
    }
  }

  return {
    weaponId: weaponDef.id,
    weaponName: weaponDef.name,
    variant,
    scenario: scenarioName,
    ttk: null, // failed
    playerBreached,
    minDist: Math.round(minDist),
    damageDealt: Math.round(totalDmgDone),
    effectiveDps: parseFloat((totalDmgDone / maxSeconds).toFixed(1)),
    ccTimeTotal: parseFloat(totalCCTime.toFixed(2)),
  };
}

// PROPOSED REBALANCED DEFINITIONS FOR TESTING
const PROPOSED_WEAPONS: Record<string, any> = {
  'cane-A': {
    id: 'cane',
    name: 'Prut (28 dmg, 0.65s, 115 reach)',
    baseDmg: 28,
    baseCd: 0.65,
    fire: (player: any, level: number) => {
      const angle = Math.atan2(player.lastDy, player.lastDx);
      const reach = 115; // increased from 88
      const arc = 2.0; // increased from 1.55 (~115 deg)
      const dmg = 28; // increased from 18
      player.spawnMeleeSlash({
        x: player.x,
        y: player.y,
        angle,
        reach,
        arc,
        dmg,
        life: 0.25,
        type: 'physical',
        weaponId: 'cane',
      });
      return true;
    },
  },
  'buns-proposed': {
    id: 'buns',
    name: 'Buchty (1ks, 22 dmg, 1.8s snack)',
    baseDmg: 22,
    baseCd: 1.25,
    fire: (player: any, level: number) => {
      const enemies = player.getNearbyEnemies(850);
      if (!enemies || enemies.length === 0) return false;
      const target = enemies[0];
      const angle = Math.atan2(target.y - player.y, target.x - player.x);
      player.spawnProjectile({
        x: player.x,
        y: player.y,
        angle,
        speed: 460,
        dmg: 22,
        radius: 12,
        type: 'food',
        snackDuration: 1.8,
        life: 2.2,
      });
      return true;
    },
  },
  'topinka-proposed': {
    id: 'cesnekova-topinka',
    name: 'Topinka (5 dmg, 0.35s, 320 kb)',
    baseDmg: 5,
    baseCd: 0.35,
    fire: (player: any) => {
      const radius = 110;
      const dmg = 5;
      const kbForce = 320;
      const enemies = player.getNearbyEnemies(radius + 60);
      for (const e of enemies) {
        if (e.dead) continue;
        const dx = e.x - player.x, dy = e.y - player.y, reach = radius + e.radius;
        if (dx * dx + dy * dy <= reach * reach) {
          const dist = Math.hypot(dx, dy) || 1;
          e.takeDamage(dmg, 'physical', (dx / dist) * kbForce, (dy / dist) * kbForce);
          e.garlicSlowTimer = 1.0;
        }
      }
      return true;
    },
  },
  'valecnice-continuous': {
    id: 'valecnice',
    name: 'Válečnice (26 dmg, orbit hit, 1.0s stun)',
    baseDmg: 26,
    baseCd: 0.1, // continuous tick
    fire: (player: any) => {
      const orbitRadius = 115;
      player._valecniceSlowRadius = orbitRadius * 1.15;
      const a = player.valecniceAngle || 0;
      const dmg = 26;
      const kbForce = 460;
      const stunDuration = 1.0;
      const reachBase = 58;
      const enemies = player.getNearbyEnemies(orbitRadius + reachBase + 50);
      const ox = player.x + Math.cos(a) * orbitRadius;
      const oy = player.y + Math.sin(a) * orbitRadius;
      for (const e of enemies) {
        if (e.dead) continue;
        if ((e as any).valecniceHitCd && (e as any).valecniceHitCd > 0) continue;
        const dx = e.x - ox, dy = e.y - oy, reach = reachBase + e.radius;
        if (dx * dx + dy * dy <= reach * reach) {
          const dist = Math.hypot(dx, dy) || 1;
          e.takeDamage(dmg, 'physical', (dx / dist) * kbForce, (dy / dist) * kbForce, {
            ignoreResist: 0.20,
            stunDuration,
            source: 'valecnice',
          });
          (e as any).valecniceHitCd = 0.6; // cooldown per enemy
        }
      }
      return true;
    },
  },
};

// RUN BENCHMARK SUITE
console.log('========================================================================');
console.log('   BUBÁKOV WEAPON BALANCE BENCHMARK (LEVEL 1 STARTING WEAPONS)          ');
console.log('========================================================================\n');

const scenarios = [
  {
    name: '1. Swarm 1v1 (Rarášek 48 HP, spd 102)',
    spawn: () => [createEnemy('rarach', 250, 0)],
  },
  {
    name: '2. Swarm Pack 4x (4x Rarášek)',
    spawn: () => [
      createEnemy('rarach', 240, 0),
      createEnemy('rarach', 280, 20),
      createEnemy('rarach', 280, -20),
      createEnemy('rarach', 320, 0),
    ],
  },
  {
    name: '3. Heavy Bruiser (Bubák 180 HP, spd 70)',
    spawn: () => [createEnemy('bubak', 260, 0)],
  },
];

const testWeapons = [
  { id: 'cane', def: WEAPONS.cane, variant: 'CURRENT' },
  { id: 'cane', def: PROPOSED_WEAPONS['cane-A'], variant: 'PROPOSED' },
  { id: 'buns', def: WEAPONS.buns, variant: 'CURRENT' },
  { id: 'buns', def: PROPOSED_WEAPONS['buns-proposed'], variant: 'PROPOSED' },
  { id: 'cesnekova-topinka', def: WEAPONS['cesnekova-topinka'], variant: 'CURRENT' },
  { id: 'cesnekova-topinka', def: PROPOSED_WEAPONS['topinka-proposed'], variant: 'PROPOSED' },
  { id: 'valecnice', def: WEAPONS.valecnice, variant: 'CURRENT' },
  { id: 'valecnice', def: PROPOSED_WEAPONS['valecnice-continuous'], variant: 'PROPOSED' },
  { id: 'halberd', def: WEAPONS.halberd, variant: 'CURRENT' },
  { id: 'kolac', def: WEAPONS.kolac, variant: 'CURRENT' },
];

for (const sc of scenarios) {
  console.log(`\n>>> SCENARIO: ${sc.name}`);
  console.log('-------------------------------------------------------------------------------------------------');
  console.log(
    `| ${'Weapon'.padEnd(26)} | ${'Variant'.padEnd(9)} | ${'TTK (s)'.padEnd(8)} | ${'Breached?'.padEnd(10)} | ${'Min Dist'.padEnd(9)} | ${'Eff DPS'.padEnd(8)} | ${'CC Time'.padEnd(8)} |`
  );
  console.log('-------------------------------------------------------------------------------------------------');

  for (const w of testWeapons) {
    const res = runSimulation(w.def, sc.name, sc.spawn, 12, w.variant as any);
    const ttkStr = res.ttk !== null ? `${res.ttk}s`.padEnd(8) : 'FAIL (12s+)';
    const breachStr = res.playerBreached ? '⚠️ YES (HIT)' : '✅ SAFE';
    const minDistStr = `${res.minDist} px`.padEnd(9);
    const dpsStr = `${res.effectiveDps}`.padEnd(8);
    const ccStr = `${res.ccTimeTotal}s`.padEnd(8);
    console.log(
      `| ${(res.weaponName.slice(0, 26)).padEnd(26)} | ${res.variant.padEnd(9)} | ${ttkStr} | ${breachStr.padEnd(10)} | ${minDistStr} | ${dpsStr} | ${ccStr} |`
    );
  }
}

console.log('\n========================================================================');
console.log('   BUBÁKOV WEAPON MILESTONE BENCHMARK (RANK 3 MILESTONES)               ');
console.log('========================================================================\n');

const milestoneWeapons = [
  { id: 'osikovy_prut', def: WEAPONS.osikovy_prut, name: 'Prut R3 (Rázný bác)', level: 3, milestones: ['cane_burst_3'] },
  { id: 'osikovy_prut', def: WEAPONS.osikovy_prut, name: 'Prut R3 (Široký švih)', level: 3, milestones: ['cane_crowd_3'] },
  { id: 'povidlove_buchty', def: WEAPONS.povidlove_buchty, name: 'Buchty R3 (Nadílka)', level: 3, milestones: ['buns_crowd_3'] },
  { id: 'povidlove_buchty', def: WEAPONS.povidlove_buchty, name: 'Buchty R3 (Cukr)', level: 3, milestones: ['buns_burst_3'] },
  { id: 'cesnekova_topinka', def: WEAPONS.cesnekova_topinka, name: 'Topinka R3 (Smrádek)', level: 3, milestones: ['garlic_crowd_3'] },
  { id: 'valecnice', def: WEAPONS.valecnice, name: 'Válečnice R3 (Bác)', level: 3, milestones: ['valecnice_burst_3'] },
  { id: 'valecnice', def: WEAPONS.valecnice, name: 'Válečnice R3 (Kolo)', level: 3, milestones: ['valecnice_crowd_3'] },
  { id: 'kovana_halapartna', def: WEAPONS.kovana_halapartna, name: 'Halapartna R3 (Zásek)', level: 3, milestones: ['halberd_burst_3'] },
  { id: 'kynuty_kolac', def: WEAPONS.kynuty_kolac, name: 'Koláč R3 (Výslužka)', level: 3, milestones: ['kolac_crowd_3'] },
  { id: 'snehova_koule', def: WEAPONS.snehova_koule, name: 'Sníh R3 (Tříšť)', level: 3, milestones: ['snowball_crowd_3'] },
  { id: 'vceli_roj', def: WEAPONS.vceli_roj, name: 'Včely R3 (Bzukot)', level: 3, milestones: ['bees_crowd_3'] },
  { id: 'kysela_okurka', def: WEAPONS.kysela_okurka, name: 'Okurka R3 (Porce)', level: 3, milestones: ['pickle_crowd_3'] },
  { id: 'dreveny_cep', def: WEAPONS.dreveny_cep, name: 'Cep R3 (Dvojmlat)', level: 3, milestones: ['flail_crowd_3'] },
  { id: 'devatero_kviti', def: WEAPONS.devatero_kviti, name: 'Kvítí R3 (Věnec)', level: 3, milestones: ['herbs_crowd_3'] },
  { id: 'kovarske_vidle', def: WEAPONS.kovarske_vidle, name: 'Vidle R3 (Hroty)', level: 3, milestones: ['pitchfork_crowd_3'] },
  { id: 'horky_brambor', def: WEAPONS.horky_brambor, name: 'Brambor R3 (Popel)', level: 3, milestones: ['potato_crowd_3'] },
  { id: 'hromnicka', def: WEAPONS.hromnicka, name: 'Hromnička R3 (Záře)', level: 3, milestones: ['candle_crowd_3'] },
  { id: 'svecena_kropenka', def: WEAPONS.svecena_kropenka, name: 'Kropenka R3 (Vějíř)', level: 3, milestones: ['holy_crowd_3'] },
];

for (const sc of scenarios) {
  console.log(`\n>>> MILESTONE SCENARIO: ${sc.name}`);
  console.log('-------------------------------------------------------------------------------------------------');
  console.log(
    `| ${'Weapon'.padEnd(26)} | ${'Rank'.padEnd(9)} | ${'TTK (s)'.padEnd(8)} | ${'Breached?'.padEnd(10)} | ${'Min Dist'.padEnd(9)} | ${'Eff DPS'.padEnd(8)} | ${'CC Time'.padEnd(8)} |`
  );
  console.log('-------------------------------------------------------------------------------------------------');

  for (const w of milestoneWeapons) {
    const res = runSimulation(w.def, sc.name, sc.spawn, 12, 'PROPOSED', w.level, w.milestones);
    const ttkStr = res.ttk !== null ? `${res.ttk}s`.padEnd(8) : 'FAIL (12s+)';
    const breachStr = res.playerBreached ? '⚠️ YES (HIT)' : '✅ SAFE';
    const minDistStr = `${res.minDist} px`.padEnd(9);
    const dpsStr = `${res.effectiveDps}`.padEnd(8);
    const ccStr = `${res.ccTimeTotal}s`.padEnd(8);
    console.log(
      `| ${(w.name.slice(0, 26)).padEnd(26)} | ${('Rank ' + w.level).padEnd(9)} | ${ttkStr} | ${breachStr.padEnd(10)} | ${minDistStr} | ${dpsStr} | ${ccStr} |`
    );
  }
}
