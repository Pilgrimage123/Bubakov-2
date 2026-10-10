import type { GameLevelId, GameLevelDef } from '../types';
import { selectRunRozmar, type RunRozmarDef } from '../data/runArchetypes';
import { ENEMIES } from '../data/enemies';

export interface ArenaHazard {
  id: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  type: 'mud' | 'fire' | 'frost';
  slowFactor: number;
}

export interface BubackaDiraState {
  x: number;
  y: number;
  radius: number;
  timeRemaining: number;
  holdTimeRemaining: number;
  totalHoldRequired: number;
  isCompleted: boolean;
  isFailed: boolean;
  playerInside: boolean;
}

export type PacingValvePhase = 'buildup' | 'peak' | 'lull' | 'telegraph' | 'ambush';

export interface DirectorTelemetry {
  threatBudget: number;
  budgetCap: number;
  dominanceIndex: number;
  avgTTK: number;
  killCountLast10: number;
  valvePhase: PacingValvePhase;
  livingEnemyCount: number;
  activeHazardsCount: number;
  bubackaDiraActive: boolean;
  assistanceActive: boolean;
  dynamicDifficulty: number;
}

export interface DirectorConfig {
  adaptability?: number; // legacy alias
  dynamicDifficulty?: number; // 1.0 (Běžná) to 2.0 (Pekelná štvanice - default)
  maxLivingEnemies?: number; // default 75
}

export interface EnemyKillRecord {
  spawnedAt: number;
  killedAt: number;
  duration: number;
}

export class RunDirector {
  public rozmar: RunRozmarDef;
  public threatBudget = 10;
  public budgetCap = 35;
  public valvePhase: PacingValvePhase = 'buildup';
  public valveTimer = 0;
  public adaptability = 2.0;
  public dynamicDifficulty = 2.0;
  public maxLivingEnemies = 75;

  public hazards: ArenaHazard[] = [];
  public bubackaDira: BubackaDiraState | null = null;
  public bubackaDiraSpawned = false;

  public telegraphMessage: string | null = null;
  public telegraphTimer = 0;

  public assistanceActive = false;

  private recentKills: EnemyKillRecord[] = [];
  private spawnTimeByEnemy = new WeakMap<any, number>();
  private lastSpawnCheck = 0;
  private formationCooldown = 4.0;
  private nextHazardCooldown = 3.0;

  private playerHeadingDuration = 0;
  private lastPlayerAngle: number | null = null;
  private kitingHazardCooldown = 0;

  constructor(public levelId: GameLevelId, seed?: number, config?: Partial<DirectorConfig>) {
    this.rozmar = selectRunRozmar(levelId, seed);
    const diff = config?.dynamicDifficulty ?? config?.adaptability ?? 2.0;
    this.dynamicDifficulty = Math.max(1.0, Math.min(2.0, diff));
    this.adaptability = this.dynamicDifficulty;
    if (config?.maxLivingEnemies !== undefined) {
      this.maxLivingEnemies = config.maxLivingEnemies;
    }
  }

  public recordEnemySpawn(enemy: any, gameTime: number): void {
    if (enemy && typeof enemy === 'object') {
      this.spawnTimeByEnemy.set(enemy, gameTime);
    }
  }

  public recordEnemyDeath(enemy: any, gameTime: number): void {
    if (!enemy || typeof enemy !== 'object') return;
    const spawnTime = this.spawnTimeByEnemy.get(enemy);
    if (spawnTime !== undefined) {
      const duration = Math.max(0.1, gameTime - spawnTime);
      this.recentKills.push({ spawnedAt: spawnTime, killedAt: gameTime, duration });
      if (this.recentKills.length > 12) {
        this.recentKills.shift();
      }
    }
  }

  public getAverageTTK(): number {
    if (this.recentKills.length === 0) return 1.2;
    const sum = this.recentKills.reduce((acc, k) => acc + k.duration, 0);
    return sum / this.recentKills.length;
  }

  public computeDominanceIndex(player: any): number {
    if (!player) return 0.5;
    const ttk = this.getAverageTTK();
    // Fast kill (< 0.7s) gives high dominance factor (up to 1.0)
    const ttkFactor = Math.max(0, Math.min(1, (1.8 - ttk) / 1.3));
    // High player courage gives high courage factor
    const maxHp = player.maxHp || 100;
    const hpFactor = Math.max(0, Math.min(1, (player.hp || 1) / maxHp));
    return ttkFactor * 0.6 + hpFactor * 0.4;
  }

  public step(dt: number, engine: any): void {
    this.update(dt, engine);
  }

  public update(dt: number, engine: any): void {
    const state = engine.state ?? engine;
    const player = state.player;
    if (!player || state.dawnVictoryTriggered) return;

    const gameTime = state.gameTime || 0;
    const livingCount = engine.livingEnemies?.length ?? state.enemies?.length ?? 0;

    // 1. Track player movement vector for Zrádný terén (anti-kiting)
    this.kitingHazardCooldown -= dt;
    this.trackPlayerMovement(dt, player);

    // 2. Update threat budget capacity and accrual based on daytime & dynamicDifficulty
    this.updateBudgetMetrics(gameTime, dt);

    // 3. Track dominance and assistance need
    const dominance = this.computeDominanceIndex(player);
    this.assistanceActive = dominance < 0.35 && (player.hp / (player.maxHp || 1)) < 0.5;

    // 4. Update Pacing Valves (Oddych a Drtivý přepad)
    this.updatePacingValves(dt, engine, livingCount);

    // 5. Update Hazards (decay)
    this.updateHazards(dt, player);

    // 6. Update Bubácká díra
    this.updateBubackaDira(dt, engine, player, gameTime);

    // 7. Update Telegraph text display
    if (this.telegraphTimer > 0) {
      this.telegraphTimer -= dt;
      if (this.telegraphTimer <= 0) {
        this.telegraphMessage = null;
      }
    }

    // 8. Tactical Spawning if in buildup or peak
    this.formationCooldown -= dt;
    this.nextHazardCooldown -= dt;
    this.lastSpawnCheck += dt;

    if (this.lastSpawnCheck >= 0.6) {
      this.lastSpawnCheck = 0;
      if (this.valvePhase === 'buildup' || this.valvePhase === 'peak') {
        this.executeTacticalSpawns(engine, player, dominance, livingCount, gameTime);
      }
    }
  }

  private trackPlayerMovement(dt: number, player: any): void {
    if (!player) return;
    const speed = Math.hypot(player.vx || 0, player.vy || 0);
    if (speed < 20) {
      this.playerHeadingDuration = Math.max(0, this.playerHeadingDuration - dt * 1.5);
      return;
    }

    const currentAngle = Math.atan2(player.vy || 0, player.vx || 0);
    if (this.lastPlayerAngle !== null) {
      let diff = Math.abs(currentAngle - this.lastPlayerAngle);
      while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
      // Within +/- 35 degrees (0.61 rad)
      if (diff <= 0.61) {
        this.playerHeadingDuration += dt;
        if (this.playerHeadingDuration >= 3.5 && this.kitingHazardCooldown <= 0) {
          this.triggerZradnyTeren(player, currentAngle);
          this.playerHeadingDuration = 0;
          this.kitingHazardCooldown = 5.0;
        }
      } else {
        this.playerHeadingDuration = Math.max(0, this.playerHeadingDuration - dt * 2.0);
      }
    }
    this.lastPlayerAngle = currentAngle;
  }

  private triggerZradnyTeren(player: any, angle: number): void {
    if (this.hazards.length >= 8) return;
    const dist = 250;
    const hx = player.x + Math.cos(angle) * dist;
    const hy = player.y + Math.sin(angle) * dist;
    this.hazards.push({
      id: `hazard_zradny_${Date.now()}_${Math.random()}`,
      x: hx,
      y: hy,
      radius: 70,
      duration: 4.0,
      maxDuration: 4.0,
      type: this.rozmar.weatherOverride === 'snow' ? 'frost' : 'mud',
      slowFactor: 0.75, // -25% rychlost
    });
  }

  private updateBudgetMetrics(gameTime: number, dt: number): void {
    let baseRate = 4.0;
    let cap = 35;

    if (gameTime < 75) {
      baseRate = 4.0;
      cap = 35;
    } else if (gameTime < 150) {
      baseRate = 6.0;
      cap = 60;
    } else if (gameTime < 225) {
      baseRate = 8.0;
      cap = 85;
    } else if (gameTime < 300) {
      baseRate = 10.0;
      cap = 110;
    } else {
      baseRate = 12.0;
      cap = 135;
    }

    // Capacity scales with dynamicDifficulty
    this.budgetCap = Math.round(cap * this.rozmar.threatMultiplier * (0.8 + this.dynamicDifficulty * 0.3));

    // Base accrual factor scales with dynamicDifficulty (1.0 at diff 1.0, 1.5 at diff 2.0)
    let accrualMult = 0.5 + this.dynamicDifficulty * 0.5;

    // Scaled assistance:
    // When courage < 50% and slow TTK:
    // On 1.0 diff: 50% slow (accrualMult *= 0.50)
    // On 2.0 diff: 25% slow (accrualMult *= 0.75)
    if (this.assistanceActive) {
      const penalty = 0.50 + ((this.dynamicDifficulty - 1.0) / 1.0) * 0.25;
      accrualMult *= penalty;
    }

    const accrual = baseRate * this.rozmar.threatMultiplier * accrualMult * dt;
    this.threatBudget = Math.min(this.budgetCap, this.threatBudget + accrual);
  }

  private updatePacingValves(dt: number, engine: any, livingCount: number): void {
    switch (this.valvePhase) {
      case 'buildup':
        if (this.threatBudget <= 4 && livingCount >= 18) {
          this.valvePhase = 'peak';
          this.valveTimer = 0;
        }
        break;

      case 'peak':
        // Wait for player to suppress enemies to trigger the lull (Oddych)
        if (livingCount <= 4) {
          this.valvePhase = 'lull';
          this.valveTimer = 3.5; // 3.5s of calm
        }
        break;

      case 'lull':
        this.valveTimer -= dt;
        if (this.valveTimer <= 0) {
          this.valvePhase = 'telegraph';
          this.valveTimer = 1.0;
          this.triggerTelegraph('⚠️ Kradmé kroky za humny... Pozor na přepadení a drtivý přepad!', 2.2, engine);
          if (engine.callbacks?.onSound) {
            engine.callbacks.onSound('howl');
          }
        }
        break;

      case 'telegraph':
        this.valveTimer -= dt;
        if (this.valveTimer <= 0) {
          this.valvePhase = 'ambush';
          this.executeDrtivyPrepad(engine);
          this.valvePhase = 'buildup';
        }
        break;

      case 'ambush':
        this.valvePhase = 'buildup';
        break;
    }
  }

  private triggerTelegraph(msg: string, duration = 2.5, engine?: any): void {
    this.telegraphMessage = msg;
    this.telegraphTimer = duration;
    if (engine?.callbacks?.onDamageText && engine.state?.player) {
      engine.callbacks.onDamageText({
        x: engine.state.player.x,
        y: engine.state.player.y - 70,
        text: msg,
        color: '#F59E0B',
        scale: 1.25,
        life: duration,
      });
    }
  }

  private executeDrtivyPrepad(engine: any): void {
    const player = engine.state.player;
    if (!player) return;

    // Up to 40 budget spent
    const budgetToSpend = Math.min(40, Math.max(25, this.threatBudget));
    const pool = this.getWeightedPool(engine);

    const leaderCandidate = this.rozmar.preferredEnemyIds[0];
    const leaderId = (leaderCandidate && ENEMIES[leaderCandidate]) ? leaderCandidate : pool[0] || 'rarach';
    const minionCandidate = pool[pool.length - 1];
    const minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || 'rarach';

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    // Two opposite angles (Klešťové sevření)
    const angle1 = pAngle + Math.PI / 2 + (Math.random() * 0.4 - 0.2);
    const angle2 = angle1 + Math.PI;

    // Leader 1
    const l1x = player.x + Math.cos(angle1) * 560;
    const l1y = player.y + Math.sin(angle1) * 560;
    const leader1 = engine.spawnMonster(leaderId, l1x, l1y, 1.3, false, false, 'Přepadový velitel');
    if (leader1) {
      leader1.name = 'Přepadový velitel';
      leader1.customBossTitle = 'Přepadový velitel';
      leader1.speed *= 1.20;
      leader1.poiseResist = Math.min(0.85, (leader1.poiseResist || 0) + 0.35);
      leader1.drtivyBuffTimer = 3.5;
      this.recordEnemySpawn(leader1, engine.state.gameTime);
    }

    // Leader 2 from opposite angle
    const l2x = player.x + Math.cos(angle2) * 560;
    const l2y = player.y + Math.sin(angle2) * 560;
    const leader2 = engine.spawnMonster(leaderId, l2x, l2y, 1.3, false, false, 'Přepadový velitel');
    if (leader2) {
      leader2.name = 'Přepadový velitel';
      leader2.customBossTitle = 'Přepadový velitel';
      leader2.speed *= 1.20;
      leader2.poiseResist = Math.min(0.85, (leader2.poiseResist || 0) + 0.35);
      leader2.drtivyBuffTimer = 3.5;
      this.recordEnemySpawn(leader2, engine.state.gameTime);
    }

    // Flankers in an arc around both angles
    const minionCount = Math.min(6, Math.max(4, Math.floor(budgetToSpend / 6)));
    for (let i = 0; i < minionCount; i++) {
      const useAngle = (i % 2 === 0) ? angle1 : angle2;
      const offset = ((Math.floor(i / 2) + 1) * 0.25) * (i % 4 < 2 ? 1 : -1);
      const mx = player.x + Math.cos(useAngle + offset) * 580;
      const my = player.y + Math.sin(useAngle + offset) * 580;
      const minion = engine.spawnMonster(minionId, mx, my, 1.0);
      if (minion) {
        minion.speed *= 1.20;
        minion.poiseResist = Math.min(0.70, (minion.poiseResist || 0) + 0.25);
        minion.drtivyBuffTimer = 3.5;
        this.recordEnemySpawn(minion, engine.state.gameTime);
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - budgetToSpend);
  }

  private executeTacticalSpawns(
    engine: any,
    player: any,
    dominance: number,
    livingCount: number,
    gameTime: number
  ): void {
    if (livingCount >= this.maxLivingEnemies) {
      // FPS Guard & Ostřílení běsi: buff existing mobs with excess threat budget (>= 18) to preserve 60 FPS
      if (this.threatBudget >= 18 && engine.livingEnemies?.length > 0) {
        const eligible = engine.livingEnemies.filter((m: any) => !m.isBoss && !m.isOstryBes);
        const pool = eligible.length > 0 ? eligible : engine.livingEnemies;
        const randMob = pool[Math.floor(Math.random() * pool.length)];
        if (randMob && !randMob.isBoss) {
          randMob.speed = Math.min(randMob.speed * 1.15, 155);
          randMob.poiseResist = Math.min(0.9, (randMob.poiseResist || 0) + 0.40);
          randMob.isOstryBes = true;
          this.threatBudget -= 10;
        }
      }
      return;
    }

    // High dominance or high dynamicDifficulty: prefer heavy formations (Hammer & Anvil, Escort, Anti-Kite, Klešťové sevření)
    if (dominance > 0.65 && this.threatBudget >= 18 && this.formationCooldown <= 0) {
      const baseCd = 5.0 - (this.dynamicDifficulty - 1.0) * 1.5;
      const assistDelay = this.assistanceActive ? (this.dynamicDifficulty >= 2.0 ? 1.0 : 2.0) : 0;
      this.formationCooldown = baseCd + assistDelay;

      const pick = Math.random();
      if (pick < 0.25) {
        this.spawnHammerAndAnvil(engine, player, gameTime);
      } else if (pick < 0.50) {
        this.spawnEscortSwarms(engine, player, gameTime);
      } else if (pick < 0.75) {
        this.spawnAntiKiteInterception(engine, player, gameTime);
      } else {
        this.spawnKlestoveSevreni(engine, player, gameTime);
      }
      return;
    }

    // Architects formation if rozmar prefers or budget allows
    if (this.rozmar.formationBias === 'architects' && this.threatBudget >= 16 && this.formationCooldown <= 0) {
      this.formationCooldown = 5.5;
      this.spawnArchitects(engine, player, gameTime);
      return;
    }

    // Standard tactical squad / single spawn if budget allows
    if (this.threatBudget >= 5) {
      const pool = this.getWeightedPool(engine);
      const cost = Math.min(this.threatBudget, dominance > 0.7 ? 12 : 6);
      const count = Math.min(3, Math.floor(cost / 3), this.maxLivingEnemies - livingCount);

      const angle = Math.random() * Math.PI * 2;
      const dist = 580 + Math.random() * 120;

      for (let i = 0; i < count; i++) {
        const mobId = pool[Math.floor(Math.random() * pool.length)] || 'rarach';
        const offAngle = angle + (i - (count - 1) / 2) * 0.18;
        const e = engine.spawnMonster(
          mobId,
          player.x + Math.cos(offAngle) * dist,
          player.y + Math.sin(offAngle) * dist,
          1.0
        );
        if (e) this.recordEnemySpawn(e, gameTime);
        this.threatBudget -= 3;
      }
    }
  }

  private spawnKlestoveSevreni(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const heavyCandidate = this.rozmar.preferredEnemyIds[0];
    const heavyId = (heavyCandidate && ENEMIES[heavyCandidate]) ? heavyCandidate : pool[0] || 'rarach';
    const fastCandidate = pool[pool.length - 1];
    const fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || 'rarach';

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const baseAngle = pAngle + (Math.random() * 0.4 - 0.2);
    const oppositeAngle = baseAngle + Math.PI;

    // Side 1
    for (let i = -1; i <= 1; i++) {
      const a = baseAngle + i * 0.22;
      const x = player.x + Math.cos(a) * 570;
      const y = player.y + Math.sin(a) * 570;
      const e = engine.spawnMonster(i === 0 ? heavyId : fastId, x, y, 1.1);
      if (e) {
        e.speed *= 1.1;
        this.recordEnemySpawn(e, gameTime);
      }
    }

    // Side 2 (opposite)
    for (let i = -1; i <= 1; i++) {
      const a = oppositeAngle + i * 0.22;
      const x = player.x + Math.cos(a) * 570;
      const y = player.y + Math.sin(a) * 570;
      const e = engine.spawnMonster(i === 0 ? heavyId : fastId, x, y, 1.1);
      if (e) {
        e.speed *= 1.1;
        this.recordEnemySpawn(e, gameTime);
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 20);
  }

  private spawnHammerAndAnvil(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const heavyCandidate = this.rozmar.preferredEnemyIds[0];
    const heavyId = (heavyCandidate && ENEMIES[heavyCandidate]) ? heavyCandidate : pool[0] || 'rarach';
    const fastCandidate = pool[pool.length - 1];
    const fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || 'rarach';

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const frontAngle = pAngle + (Math.random() * 0.4 - 0.2);

    // Frontal wall (anvil)
    const wallDist = 580;
    const wallCount = 4;
    for (let i = 0; i < wallCount; i++) {
      const spread = (i - (wallCount - 1) / 2) * 55;
      const wx = player.x + Math.cos(frontAngle) * wallDist + Math.sin(frontAngle) * spread;
      const wy = player.y + Math.sin(frontAngle) * wallDist - Math.cos(frontAngle) * spread;
      const e = engine.spawnMonster(heavyId, wx, wy, 1.15);
      if (e) {
        e.poiseResist = Math.min(0.85, (e.poiseResist || 0) + 0.25);
        this.recordEnemySpawn(e, gameTime);
      }
    }

    // Flankers (hammer) coming from sides
    const flankDist = 520;
    for (const sign of [-1, 1]) {
      const fAngle = frontAngle + (Math.PI / 2) * sign;
      const fx = player.x + Math.cos(fAngle) * flankDist;
      const fy = player.y + Math.sin(fAngle) * flankDist;
      const f = engine.spawnMonster(fastId, fx, fy, 1.0);
      if (f) {
        f.speed *= 1.15;
        this.recordEnemySpawn(f, gameTime);
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 18);
  }

  private spawnEscortSwarms(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const eliteCandidate = this.rozmar.preferredEnemyIds[0];
    const eliteId = (eliteCandidate && ENEMIES[eliteCandidate]) ? eliteCandidate : pool[0] || 'rarach';
    const minionCandidate = pool[pool.length - 1];
    const minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || 'rarach';

    const angle = Math.random() * Math.PI * 2;
    const dist = 600;
    const cx = player.x + Math.cos(angle) * dist;
    const cy = player.y + Math.sin(angle) * dist;

    const elite = engine.spawnMonster(eliteId, cx, cy, 1.35, false, false, 'Obrněný vůdce');
    if (elite) {
      elite.isEscortLeader = true;
      this.recordEnemySpawn(elite, gameTime);
    }

    // 4 orbit minions
    for (let i = 0; i < 4; i++) {
      const ma = (i / 4) * Math.PI * 2;
      const mx = cx + Math.cos(ma) * 55;
      const my = cy + Math.sin(ma) * 55;
      const m = engine.spawnMonster(minionId, mx, my, 0.9);
      if (m) {
        m.isEscortMinion = true;
        this.recordEnemySpawn(m, gameTime);
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 22);
  }

  private spawnArchitects(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const archCandidate = this.rozmar.preferredEnemyIds[1];
    const archId = (archCandidate && ENEMIES[archCandidate]) ? archCandidate : pool[0] || 'rarach';

    const angle = Math.random() * Math.PI * 2;
    const dist = 550;
    for (let i = 0; i < 2; i++) {
      const ax = player.x + Math.cos(angle + i * 0.4) * dist;
      const ay = player.y + Math.sin(angle + i * 0.4) * dist;
      const e = engine.spawnMonster(archId, ax, ay, 1.0);
      if (e) {
        e.isArchitect = true;
        this.recordEnemySpawn(e, gameTime);
      }
    }

    // Place an organic hazard on the ground
    if (this.hazards.length < 6) {
      this.hazards.push({
        id: `hazard_${Date.now()}_${Math.random()}`,
        x: player.x + (Math.random() * 200 - 100),
        y: player.y + (Math.random() * 200 - 100),
        radius: 65,
        duration: 4.5,
        maxDuration: 4.5,
        type: this.rozmar.weatherOverride === 'snow' ? 'frost' : 'mud',
        slowFactor: 0.7,
      });
    }

    this.threatBudget = Math.max(0, this.threatBudget - 16);
  }

  private spawnAntiKiteInterception(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const mobId = pool[Math.floor(Math.random() * pool.length)] || 'rarach';

    const pSpeed = Math.hypot(player.vx || 0, player.vy || 0);
    const pAngle = pSpeed > 10 ? Math.atan2(player.vy || 0, player.vx || 0) : Math.random() * Math.PI * 2;

    // Spawn 2 enemies directly in lead path
    for (let i = -1; i <= 1; i += 2) {
      const leadAngle = pAngle + i * 0.22;
      const dist = 540;
      const ix = player.x + Math.cos(leadAngle) * dist;
      const iy = player.y + Math.sin(leadAngle) * dist;
      const e = engine.spawnMonster(mobId, ix, iy, 1.05);
      if (e) this.recordEnemySpawn(e, gameTime);
    }

    this.threatBudget = Math.max(0, this.threatBudget - 14);
  }

  private updateHazards(dt: number, player: any): void {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.duration -= dt;
      if (h.duration <= 0) {
        this.hazards.splice(i, 1);
        continue;
      }

      // Check collision with player
      const dist = Math.hypot(player.x - h.x, player.y - h.y);
      if (dist <= h.radius) {
        player.hazardSlowTimer = 0.25;
        player.hazardSlowFactor = h.slowFactor;
      }
    }
  }

  private updateBubackaDira(dt: number, engine: any, player: any, gameTime: number): void {
    // 1. Spawning condition: within anomaly window, not already spawned, no boss present
    if (!this.bubackaDira && !this.bubackaDiraSpawned) {
      const [startSec, endSec] = this.rozmar.anomalyWindow;
      if (gameTime >= startSec && gameTime <= endSec && !engine.state.miniBossSpawned) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 360 + Math.random() * 80;
        this.bubackaDira = {
          x: player.x + Math.cos(ang) * dist,
          y: player.y + Math.sin(ang) * dist,
          radius: 130,
          timeRemaining: 15.0,
          holdTimeRemaining: 4.0,
          totalHoldRequired: 4.0,
          isCompleted: false,
          isFailed: false,
          playerInside: false,
        };
        this.bubackaDiraSpawned = true;
        this.triggerTelegraph('🌑 Země puká: Objevila se Bubácká díra! Udrž rituál pro poklad!', 3.5, engine);
      }
    }

    if (!this.bubackaDira || this.bubackaDira.isCompleted || this.bubackaDira.isFailed) return;

    const dira = this.bubackaDira;
    dira.timeRemaining -= dt;

    const dist = Math.hypot(player.x - dira.x, player.y - dira.y);
    dira.playerInside = dist <= dira.radius;

    if (dira.playerInside) {
      dira.holdTimeRemaining -= dt;
      if (dira.holdTimeRemaining <= 0) {
        // Success!
        dira.isCompleted = true;
        this.triggerTelegraph('✨ Rituál dokončen! Bubácká díra zapečetěna!', 3.0, engine);
        this.resolveBubackaDiraSuccess(engine, dira);
        return;
      }
    }

    if (dira.timeRemaining <= 0 && dira.holdTimeRemaining > 0) {
      // Failed!
      dira.isFailed = true;
      this.triggerTelegraph('⚠️ Čas vypršel! Z Bubácké díry se sápe Zuřivý Miniboss!', 3.0, engine);
      this.resolveBubackaDiraFailure(engine, dira);
    }
  }

  private resolveBubackaDiraSuccess(engine: any, dira: BubackaDiraState): void {
    // Repel nearby enemies
    if (engine.livingEnemies) {
      for (const enemy of engine.livingEnemies) {
        const d = Math.hypot(enemy.x - dira.x, enemy.y - dira.y);
        if (d < dira.radius + 180) {
          const a = Math.atan2(enemy.y - dira.y, enemy.x - dira.x);
          enemy.x += Math.cos(a) * 160;
          enemy.y += Math.sin(a) * 160;
          enemy.stunTimer = Math.max(enemy.stunTimer || 0, 1.8);
        }
      }
    }

    // Drop big treasure chest + bonus gingerbread
    if (engine.spawnScatterDrop) {
      engine.spawnScatterDrop('chest', { x: dira.x, y: dira.y, text: 'POKLAD Z DÍRY!' });
      for (let i = 0; i < 4; i++) {
        engine.spawnScatterDrop('gingerbread', {
          x: dira.x + (Math.random() * 40 - 20),
          y: dira.y + (Math.random() * 40 - 20),
          size: 'giant',
          value: 20,
        });
      }
    }
  }

  private resolveBubackaDiraFailure(engine: any, dira: BubackaDiraState): void {
    const bossCandidate = this.rozmar.preferredEnemyIds[0];
    const bossId = (bossCandidate && ENEMIES[bossCandidate]) ? bossCandidate : 'cerny_pes';
    const furious = engine.spawnMonster(bossId, dira.x, dira.y, 1.45, false, true, '👹 Zuřivý netvor z díry');
    if (furious) {
      furious.speed *= 1.2;
      this.recordEnemySpawn(furious, engine.state.gameTime);
    }
  }

  private getWeightedPool(engine: any): string[] {
    const curLvl: GameLevelDef | undefined = engine.activeLevelDef;
    const phaseKey = engine.currentPhase?.id || engine.activePhase?.id || 'noon';
    const dayPool: string[] = (curLvl?.spawnPools && curLvl.spawnPools[phaseKey as keyof typeof curLvl.spawnPools])
      ? curLvl.spawnPools[phaseKey as keyof typeof curLvl.spawnPools]
      : (curLvl?.spawnPools?.noon || []);

    const combined = [...new Set([...dayPool, ...this.rozmar.preferredEnemyIds])].filter((id) => !!ENEMIES[id]);
    if (combined.length === 0) {
      combined.push('rarach');
    }
    return combined;
  }

  public getTelemetry(): DirectorTelemetry {
    return {
      threatBudget: Math.round(this.threatBudget * 10) / 10,
      budgetCap: this.budgetCap,
      dominanceIndex: Math.round(this.computeDominanceIndex(null) * 100) / 100,
      avgTTK: Math.round(this.getAverageTTK() * 10) / 10,
      killCountLast10: this.recentKills.length,
      valvePhase: this.valvePhase,
      livingEnemyCount: 0,
      activeHazardsCount: this.hazards.length,
      bubackaDiraActive: !!(this.bubackaDira && !this.bubackaDira.isCompleted && !this.bubackaDira.isFailed),
      assistanceActive: this.assistanceActive,
      dynamicDifficulty: this.dynamicDifficulty,
    };
  }
}
