import type { GameLevelId, GameLevelDef, EnemyPrefixType } from '../types';
import { getCurrentDayPhase } from '../constants';
import { GAME_LEVELS } from '../data/levels';
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
  kind?: 'magma-trail' | 'predictive-fissure' | string;
  damage?: number;
  damageInterval?: number;
  damageTimer?: number;
  warningTimer?: number;
  oneShot?: boolean;
  exploded?: boolean;
  sourceEnemyId?: string;
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

export interface DifficultyPreset {
  value: number;
  badge: string;
  shortLabel: string;
  name: string;
  subtitle: string;
  color: string;
}

export const DYNAMIC_DIFFICULTY_PRESETS: DifficultyPreset[] = [
  {
    value: 2.0,
    badge: '2.00× Poklid za pecí',
    shortLabel: '2.00× Poklid',
    name: 'Poklid za pecí',
    subtitle: 'Nejklidnější tempo: pomalejší přísun hrozeb, menší rozpočet a delší prodlevy. Všechny typy nepřátel a střetnutí zůstávají dostupné.',
    color: '#16A34A',
  },
  {
    value: 2.5,
    badge: '2.50× Šramot za humny',
    shortLabel: '2.50× Šramot',
    name: 'Šramot za humny',
    subtitle: 'Lehce svižnější tempo a větší rozpočet hrozeb. Stejné nepřátele, formace i speciální mechaniky jako na ostatních obtížnostech.',
    color: '#0284C7',
  },
  {
    value: 3.0,
    badge: '3.00× Zlověstná noc (Výchozí)',
    shortLabel: '3.00× Zlověstná noc',
    name: 'Zlověstná noc (Bubácká polízanice)',
    subtitle: 'Vyvážené výchozí tempo a rozpočet hrozeb. Obtížnost mění četnost a velikost tlakových vln, ne dostupné herní mechaniky.',
    color: '#D97706',
  },
  {
    value: 3.5,
    badge: '3.50× Čertovské posvícení',
    shortLabel: '3.50× Posvícení',
    name: 'Čertovské posvícení',
    subtitle: 'Vyšší tempo, větší rozpočet a kratší prodlevy mezi střetnutími. Žádná formace ani speciální mechanika není vyhrazena této obtížnosti.',
    color: '#EA580C',
  },
  {
    value: 4.0,
    badge: '4.00× Divoká tancovačka',
    shortLabel: '4.00× Tancovačka',
    name: 'Divoká noční tancovačka',
    subtitle: 'Výrazně hustší tlakové vlny, větší rozpočet na jednu vlnu a kratší cooldowny. Všechny herní systémy jsou dostupné i na nižších stupních.',
    color: '#DC2626',
  },
  {
    value: 4.5,
    badge: '4.50× Hrusická šlamastyka',
    shortLabel: '4.50× Šlamastyka',
    name: 'Velká hrusická šlamastyka',
    subtitle: 'Velmi vysoká četnost střetnutí a velkorysý rozpočet hrozeb. Adaptivní pomoc zůstává stejně účinná bez ohledu na zvolený stupeň.',
    color: '#B91C1C',
  },
  {
    value: 5.0,
    badge: '5.00× Pekelné boží dopuštění (5× Max)',
    shortLabel: '5.00× Boží dopuštění',
    name: 'Pekelné boží dopuštění (5,0× Maximální výzva)',
    subtitle: 'Nejrychlejší tempo, největší rozpočet a nejkratší prodlevy. Obtížnost nepřidává exkluzivní mechaniky ani nezakazuje žádné mechaniky nižším stupňům.',
    color: '#7F1D1D',
  },
];

export function getDifficultyPreset(val: number = 3.0): DifficultyPreset {
  let closest = DYNAMIC_DIFFICULTY_PRESETS[2]; // default 3.0
  let minDiff = 999;
  for (const preset of DYNAMIC_DIFFICULTY_PRESETS) {
    const diff = Math.abs(preset.value - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = preset;
    }
  }
  return closest;
}

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
  pressureMultiplier: number;
}

export interface DirectorConfig {
  adaptability?: number; // legacy alias
  dynamicDifficulty?: number; // 2.0 (Poklid) to 5.0 (Pekelné boží dopuštění - default 3.0 Zlověstná noc)
  maxLivingEnemies?: number; // default 75
}

export interface EnemyKillRecord {
  spawnedAt: number;
  killedAt: number;
  duration: number;
}

export class RunDirector {
  public static readonly CELL_COUNT = 8;
  public static readonly CELL_ANGLES = Array.from(
    { length: 8 },
    (_, index) => (index * Math.PI * 2) / 8
  );

  public rozmar: RunRozmarDef;
  public threatBudget = 10;
  public budgetCap = 35;
  public valvePhase: PacingValvePhase = 'buildup';
  public valveTimer = 0;
  public adaptability = 3.0;
  public dynamicDifficulty = 3.0;
  public maxLivingEnemies = 75;

  public hazards: ArenaHazard[] = [];
  public bubackaDira: BubackaDiraState | null = null;
  public bubackaDiraSpawned = false;

  public telegraphMessage: string | null = null;
  public telegraphTimer = 0;

  public assistanceActive = false;
  /** Runtime pressure adjustment; the selected difficulty remains the baseline. */
  public pressureMultiplier = 1.0;

  private recentKills: EnemyKillRecord[] = [];
  private spawnTimeByEnemy = new WeakMap<any, number>();
  private lastSpawnCheck = 0;
  private formationCooldown = 4.0;
  private nextHazardCooldown = 3.0;
  private prefixSpawnCooldown = 3.5;
  private eliteBudgetCooldown = 0;

  private currentGameTime = 0;
  private playerHeadingDuration = 0;
  private lastPlayerAngle: number | null = null;
  private kitingHazardCooldown = 0;
  private buildupDuration = 0;
  private peakDuration = 0;

  constructor(public levelId: GameLevelId, seed?: number, config?: Partial<DirectorConfig>) {
    this.rozmar = selectRunRozmar(levelId, seed);
    const diff = config?.dynamicDifficulty ?? config?.adaptability ?? 3.0;
    this.dynamicDifficulty = Math.max(2.0, Math.min(5.0, diff));
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
    // Keep the legacy fallback for pacing calculations, but never treat it as
    // measured evidence that the player is dominating.
    if (this.recentKills.length === 0) return 1.2;
    const sum = this.recentKills.reduce((acc, k) => acc + k.duration, 0);
    return sum / this.recentKills.length;
  }

  public computeDominanceIndex(player: any): number {
    if (!player) return 0.5;
    const ttk = this.getAverageTTK();
    // No recorded kills means performance is unknown, not excellent.
    // Neutral evidence avoids classifying a fresh run as dominant at full HP.
    const ttkFactor = this.recentKills.length === 0
      ? 0.25
      : Math.max(0, Math.min(1, (1.8 - ttk) / 1.3));
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
    this.currentGameTime = gameTime;
    const livingCount = engine.livingEnemies?.length ?? state.enemies?.length ?? 0;

    // 1. Track player movement vector for Zrádný terén (anti-kiting)
    this.kitingHazardCooldown -= dt;
    this.trackPlayerMovement(dt, player);

    // 2. Estimate performance before accruing threat so current player state
    // affects this frame's pressure rather than lagging one update behind.
    const dominance = this.computeDominanceIndex(player);
    const hpRatio = Math.max(0, Math.min(1, (player.hp || 0) / (player.maxHp || 1)));
    this.assistanceActive = dominance < 0.35 && hpRatio < 0.5;
    this.updateAdaptivePressure(dominance, hpRatio, dt);

    // 3. Update threat budget. The opening 90 seconds use a gentler ramp on
    // every preset; difficulty changes pressure quantity/timing, never access
    // to encounter mechanics.
    this.updateBudgetMetrics(gameTime, dt);

    // At the living-enemy cap, do not convert surplus threat into stronger elites
    // while the player is in an active struggling state.
    this.eliteBudgetCooldown = Math.max(0, this.eliteBudgetCooldown - dt);
    if (livingCount >= this.maxLivingEnemies && !this.assistanceActive) {
      this.spendExcessBudgetOnElite(engine);
    }

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
    this.prefixSpawnCooldown -= dt;
    this.lastSpawnCheck += dt;

    const openingSpawnFactor = gameTime < 30 ? 1.85 : gameTime < 60 ? 1.55 : gameTime < 90 ? 1.25 : 1.0;
    const spawnInterval = Math.max(0.24, (0.6 - ((this.dynamicDifficulty - 2.0) / 2.0) * 0.22) * openingSpawnFactor);
    if (this.lastSpawnCheck >= spawnInterval) {
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
        const gameTime = this.currentGameTime;
        const openingTriggerFactor = gameTime < 30 ? 2.0 : gameTime < 60 ? 1.7 : gameTime < 90 ? 1.3 : 1.0;
        if (this.playerHeadingDuration >= 3.5 * openingTriggerFactor && this.kitingHazardCooldown <= 0) {
          this.triggerZradnyTeren(player, currentAngle);
          this.playerHeadingDuration = 0;
          this.kitingHazardCooldown = 5.0 * openingTriggerFactor;
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

  private updateAdaptivePressure(dominance: number, hpRatio: number, dt: number): void {
    // React to sustained performance, not a single hit/kill. Recovery and
    // escalation are deliberately bounded around the chosen difficulty preset.
    let target = 1.0;
    if (hpRatio < 0.35 && dominance < 0.45) {
      target = 0.72;
    } else if (hpRatio < 0.5 && dominance < 0.35) {
      target = 0.82;
    } else if (hpRatio > 0.75 && dominance > 0.68 && this.recentKills.length >= 3) {
      target = 1.12;
    }

    // Exponential-style smoothing with a maximum 25% response per second.
    const alpha = Math.min(1, Math.max(0, dt) * 0.25);
    this.pressureMultiplier += (target - this.pressureMultiplier) * alpha;
    this.pressureMultiplier = Math.max(0.72, Math.min(1.12, this.pressureMultiplier));
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

    // Difficulty affects only pressure quantity and cadence. Encounter types,
    // enemy families, and special mechanics are available on every preset.
    const normalizedDiff = 1.0 + ((this.dynamicDifficulty - 2.0) / 3.0) * 1.5;

    // Strongly soften the opening 90 seconds on every preset. The rate ramps
    // up in stages; the budget cap is also temporarily lower to prevent an
    // early bank of threat from being dumped all at once.
    const openingRateFactor = gameTime < 30 ? 0.35 : gameTime < 60 ? 0.50 : gameTime < 90 ? 0.70 : 1.0;
    const openingCapFactor = gameTime < 30 ? 0.55 : gameTime < 60 ? 0.65 : gameTime < 90 ? 0.80 : 1.0;

    // Capacity and accrual scale with the selected baseline difficulty.
    this.budgetCap = Math.round(cap * this.rozmar.threatMultiplier * (0.5 + normalizedDiff * 0.8) * this.pressureMultiplier * openingCapFactor);

    let accrualMult = 0.35 + Math.pow(normalizedDiff, 1.42) * 0.75;

    // Assistance is equally effective at every preset; higher difficulty must
    // not weaken the director's response when the player is struggling.
    if (this.assistanceActive) {
      accrualMult *= 0.50;
    }

    const accrual = baseRate * this.rozmar.threatMultiplier * accrualMult * openingRateFactor * this.pressureMultiplier * dt;
    this.threatBudget = Math.min(this.budgetCap, this.threatBudget + accrual);    this.threatBudget = Math.min(this.budgetCap, this.threatBudget + accrual);
  }

  private updatePacingValves(dt: number, engine: any, livingCount: number): void {
    switch (this.valvePhase) {
      case 'buildup': {
        this.buildupDuration += dt;
        // Pacing deadlock fix:
        // Transition to peak when:
        // 1) Threat budget depleted (<= 6 at every preset) AND either high livingCount (>= 18) OR at least 6 mobs after 12s
        // 2) OR timer threshold reached, with the opening phase deliberately extended on every preset.
        const gameTime = engine.state?.gameTime || 0;
        const openingPhaseFactor = gameTime < 30 ? 1.8 : gameTime < 60 ? 1.5 : gameTime < 90 ? 1.25 : 1.0;
        const maxBuildupTime = Math.max(18, 48 - ((this.dynamicDifficulty - 2.0) / 2.0) * 24) * openingPhaseFactor;
        const budgetThreshold = 6;
        const mobsMet = livingCount >= 18 || (livingCount >= 6 && this.buildupDuration >= 12);
        if ((this.threatBudget <= budgetThreshold && mobsMet) || this.buildupDuration >= maxBuildupTime) {
          this.valvePhase = 'peak';
          this.valveTimer = 0;
          this.buildupDuration = 0;
          this.peakDuration = 0;
        }
        break;
      }

      case 'peak': {
        this.peakDuration += dt;
        // Wait for player to suppress enemies to trigger the lull (Oddych) OR max peak duration (8s on 5.0x, 16s on 2.0x)
        const gameTime = engine.state?.gameTime || 0;
        const openingPhaseFactor = gameTime < 30 ? 1.8 : gameTime < 60 ? 1.5 : gameTime < 90 ? 1.25 : 1.0;
        const maxPeakTime = Math.max(8, 16 - ((this.dynamicDifficulty - 2.0) / 2.0) * 5.3) * openingPhaseFactor;
        if (livingCount <= 4 || this.peakDuration >= maxPeakTime) {
          this.valvePhase = 'lull';
          this.valveTimer = 3.5; // 3.5s of calm
          this.peakDuration = 0;
        }
        break;
      }

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

  public getEliteVariantForId(baseId: string): string | null {
    const eliteMap: Record<string, string> = {
      // Swarms & imps -> Ohnivý rarášek / Sazový rarášek / Jiskřivec
      rarach: 'krvavy_rarach',
      plivnik: 'sazovy_rarach',
      sotek: 'krvavy_rarach',
      sazovy_rarach: 'krvavy_rarach',
      mysak: 'krvavy_rarach',
      skodnik: 'sazovy_rarach',
      zmrzlik: 'mrazik',

      // Undead & skeletons -> Červený kostlivec / Zbrojnoš
      skeleton: 'krvavy_kostlivec',
      skeleton_scythe: 'krvavy_kostlivec',
      umrlec: 'krvavy_kostlivec',
      pisar: 'krvavy_kostlivec',
      hrobnik: 'zbrojnos',
      zbrojnos: 'obrneny_zbojnik',

      // Water creatures -> Kalný hastrman / Močálová ropucha
      hastrman: 'kalny_hastrman',
      vodnicek: 'kalny_hastrman',
      topivec: 'kalny_hastrman',
      zaba: 'ropucha',
      blatouch: 'kalny_hastrman',
      ropucha: 'kalny_hastrman',

      // Beasts & shadows -> Černý vlk z polesí / Ohnivý pes / Noční můra
      cerny_pes: 'cerny_vlkodlak',
      ohnivy_pes: 'cerny_vlkodlak',
      nocni_mura: 'cerny_vlkodlak',
      bubak: 'hromotluk',
      hromotluk: 'obrneny_zbojnik',
      stodolnik: 'drevorubec',
      bila_pani: 'nocni_mura',

      // Forest & field spirits -> Polednice / Divoženka / Klekánice / Bludička
      divozenka: 'polednice',
      klekanice: 'polednice',
      bludicka: 'polednice',
      polednice: 'drevorubec',

      // Cold & winter spirits -> Severák / Sněhulák / Meluzína
      mrazik: 'snehulak',
      severak: 'snehulak',
      vanicka: 'snehulak',
      meluzina: 'snehulak',

      // Rogues & humanoids -> Obrněný zbojník
      zbojnik: 'obrneny_zbojnik',
      drevorubec: 'obrneny_zbojnik',
      obrneny_zbojnik: 'drab',

      // Demons & fire spirits -> Pekelný dráb / Ohnivý muž / Čert
      certik: 'drab',
      drab: 'cert',
      jiskrivec: 'ohnivy_muz',
      ohnivy_muz: 'drab',
    };
    const elite = eliteMap[baseId];
    return (elite && ENEMIES[elite]) ? elite : null;
  }

  /**
   * Returns only enemies appropriate to the current level and phase.
   * High difficulty may add elite variants of eligible enemies, but never
   * unrelated enemies from other phases or the global bestiary.
   */
  public getAllBubaksPool(engine: any): string[] {
    return this.getWeightedPool(engine);
  }

  /** Regular tactical mobs cost 3; named elite variants cost 8 threat. */
  public getBubakThreatCost(enemyId: string): number {
    const isEliteVariant = Object.keys(ENEMIES).some(
      (baseId) => this.getEliteVariantForId(baseId) === enemyId
    );
    return isEliteVariant ? 8 : 3;
  }

  private executeDrtivyPrepad(engine: any): void {
    const player = engine.state.player;
    if (!player) return;

    // Up to 65 budget spent on high difficulty
    const maxSpend = this.dynamicDifficulty >= 4.0 ? 65 : this.dynamicDifficulty >= 3.0 ? 50 : 40;
    const budgetToSpend = Math.min(maxSpend, Math.max(25, this.threatBudget));
    const pool = this.getWeightedPool(engine);

    const leaderCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let leaderId = leaderCandidate || pool[0] || 'rarach';
    {
      const elite = this.getEliteVariantForId(leaderId);
      if (elite) leaderId = elite;
    }

    const minionCandidate = pool[pool.length - 1];
    let minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || 'rarach';
    {
      const eliteMinion = this.getEliteVariantForId(minionId);
      if (eliteMinion) minionId = eliteMinion;
    }

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    // Two opposite angles (Klešťové sevření)
    const angle1 = pAngle + Math.PI / 2 + (Math.random() * 0.4 - 0.2);
    const angle2 = angle1 + Math.PI;

    // Leader 1 (closer spawn for punchier ambush: 490px)
    const l1x = player.x + Math.cos(angle1) * 490;
    const l1y = player.y + Math.sin(angle1) * 490;
    const leader1 = engine.spawnMonster(leaderId, l1x, l1y, 1.3, false, false, 'Přepadový strážmistr');
    if (leader1) {
      leader1.name = 'Přepadový strážmistr';
      leader1.customBossTitle = 'Přepadový strážmistr';
      leader1.speed *= 1.20;
      leader1.poiseResist = Math.min(0.85, (leader1.poiseResist || 0) + 0.35);
      leader1.drtivyBuffTimer = 3.5;
      this.recordEnemySpawn(leader1, engine.state.gameTime);
    }

    // Leader 2 from opposite angle
    const l2x = player.x + Math.cos(angle2) * 490;
    const l2y = player.y + Math.sin(angle2) * 490;
    const leader2 = engine.spawnMonster(leaderId, l2x, l2y, 1.3, false, false, 'Přepadový strážmistr');
    if (leader2) {
      leader2.name = 'Přepadový strážmistr';
      leader2.customBossTitle = 'Přepadový strážmistr';
      leader2.speed *= 1.20;
      leader2.poiseResist = Math.min(0.85, (leader2.poiseResist || 0) + 0.35);
      leader2.drtivyBuffTimer = 3.5;
      this.recordEnemySpawn(leader2, engine.state.gameTime);
    }

    // Flankers in an arc around both angles
    const minionCount = Math.min(this.dynamicDifficulty >= 4.0 ? 10 : this.dynamicDifficulty >= 3.0 ? 7 : 5, Math.max(4, Math.floor(budgetToSpend / 5)));
    for (let i = 0; i < minionCount; i++) {
      const useAngle = (i % 2 === 0) ? angle1 : angle2;
      const offset = ((Math.floor(i / 2) + 1) * 0.25) * (i % 4 < 2 ? 1 : -1);
      const mx = player.x + Math.cos(useAngle + offset) * 510;
      const my = player.y + Math.sin(useAngle + offset) * 510;
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

  private spendExcessBudgetOnElite(engine: any): void {
    if (this.threatBudget < 22 || this.eliteBudgetCooldown > 0) return;
    const enemies: any[] = engine.livingEnemies || [];
    if (enemies.length === 0) return;

    const eligible = enemies.filter((enemy: any) => !enemy.isBoss && !enemy.isOstryBes);
    const pool = eligible.length > 0 ? eligible : enemies.filter((enemy: any) => !enemy.isBoss);
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (!target || target.isBoss) return;

    target.speed = Math.min((target.speed || 0) * 1.15, 155);
    target.poiseResist = Math.min(0.9, (target.poiseResist || 0) + 0.40);
    target.isOstryBes = true;
    this.threatBudget = Math.max(0, this.threatBudget - 10);
    this.eliteBudgetCooldown = 1.0;
  }

  private executeTacticalSpawns(
    engine: any,
    player: any,
    dominance: number,
    livingCount: number,
    gameTime: number
  ): void {
    if (livingCount >= this.maxLivingEnemies) return;

    // Special Prefixes: when player kills common mobs too quickly (high dominance / low TTK)
    // and Director needs to deplete excess threat budget (costs 5x normal = 15 threat budget)
    const avgTTK = this.getAverageTTK();
    const canSpawnPrefixed = !this.assistanceActive && (dominance >= 0.60 || (this.recentKills.length > 0 && avgTTK < 0.85)) && this.threatBudget >= 15 && this.prefixSpawnCooldown <= 0;
    if (canSpawnPrefixed) {
      const openingCooldownFactor = gameTime < 30 ? 1.8 : gameTime < 60 ? 1.5 : gameTime < 90 ? 1.25 : 1.0;
      this.prefixSpawnCooldown = Math.max(3.0, 6.0 - ((this.dynamicDifficulty - 2.0) / 2.0) * 2.0) * openingCooldownFactor;
      this.spawnPrefixedEnemy(engine, player, gameTime);
      return;
    }

    // High dominance OR high dynamicDifficulty: prefer heavy formations (Hammer & Anvil, Escort, Anti-Kite, Klešťové sevření)
    const allowHeavyFormation = !this.assistanceActive && this.threatBudget >= 16 && this.formationCooldown <= 0;
    if (allowHeavyFormation) {
      const baseCd = Math.max(2.2, 5.0 - ((this.dynamicDifficulty - 2.0) / 2.0) * 2.2);
      const openingCooldownFactor = gameTime < 30 ? 1.8 : gameTime < 60 ? 1.5 : gameTime < 90 ? 1.25 : 1.0;
      const assistDelay = this.assistanceActive ? 2.0 : 0;
      this.formationCooldown = baseCd * openingCooldownFactor + assistDelay;

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

    // Architects are also a heavy formation, so assistance must suppress
    // this path rather than allowing it to bypass the heavy-formation gate.
    if (!this.assistanceActive && this.rozmar.formationBias === 'architects' && this.threatBudget >= 16 && this.formationCooldown <= 0) {
      this.formationCooldown = Math.max(3.0, 5.5 - ((this.dynamicDifficulty - 2.0) / 2.0) * 1.8);
      this.spawnArchitects(engine, player, gameTime);
      return;
    }

    // Standard tactical squad / burst spawn if budget allows.
    // Every preset uses the same phase-appropriate pool, including eligible
    // elite variants; difficulty controls pressure quantity and cadence.
    if (this.threatBudget >= 3) {
      const pool = this.getAllBubaksPool(engine);
      const maxBatchCost = this.dynamicDifficulty >= 3.4 ? 18 : this.dynamicDifficulty >= 2.8 ? 14 : (dominance > 0.7 ? 12 : 6);
      const availableBudget = Math.min(this.threatBudget, maxBatchCost);
      const maxCount = this.dynamicDifficulty >= 3.4 ? 5 : this.dynamicDifficulty >= 2.8 ? 4 : 3;
      const spawnLimit = Math.max(0, Math.min(maxCount, this.maxLivingEnemies - livingCount));
      const spawnPlan: string[] = [];
      let plannedCost = 0;

      for (let i = 0; i < spawnLimit; i++) {
        const remainingBudget = availableBudget - plannedCost;
        const affordable = pool.filter((id) => this.getBubakThreatCost(id) <= remainingBudget);
        if (affordable.length === 0) break;

        const mobId = affordable[Math.floor(Math.random() * affordable.length)] || 'rarach';
        spawnPlan.push(mobId);
        plannedCost += this.getBubakThreatCost(mobId);
      }

      if (spawnPlan.length > 0) {
        // Distribute spawns across distinct sectors instead of clustering all
        // reinforcements around one random angle.
        const startCell = Math.floor(Math.random() * RunDirector.CELL_COUNT);
        for (let i = 0; i < spawnPlan.length; i++) {
          const mobId = spawnPlan[i];
          const cell = (startCell + i) % RunDirector.CELL_COUNT;
          const angle = RunDirector.CELL_ANGLES[cell] + (Math.random() - 0.5) * 0.12;
          const dist = 500 + Math.random() * 80;
          const e = engine.spawnMonster(
            mobId,
            player.x + Math.cos(angle) * dist,
            player.y + Math.sin(angle) * dist,
            1.0
          );
          if (e) {
            this.recordEnemySpawn(e, gameTime);
            this.threatBudget = Math.max(0, this.threatBudget - this.getBubakThreatCost(mobId));
          }
        }
      }
    }
  }

  public spawnPrefixedEnemy(engine: any, player: any, gameTime: number, forcedPrefix?: EnemyPrefixType): any {
    const pool = this.getWeightedPool(engine);
    const candidateId = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    const mobId = candidateId || pool[0] || 'rarach';

    const prefixes: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    const prefix = forcedPrefix || prefixes[Math.floor(Math.random() * prefixes.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist = 480 + Math.random() * 60;
    const sx = player.x + Math.cos(angle) * dist;
    const sy = player.y + Math.sin(angle) * dist;

    const enemy = engine.spawnMonster(mobId, sx, sy, 1.0, false, false, undefined, prefix);
    if (enemy) {
      this.recordEnemySpawn(enemy, gameTime);
    }
    // Exactly 5x regular tactical mob budget cost (15 instead of 3)
    this.threatBudget = Math.max(0, this.threatBudget - 15);
    return enemy;
  }

  private spawnKlestoveSevreni(engine: any, player: any, gameTime: number): void {
    const pool = this.getWeightedPool(engine);
    const heavyCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let heavyId = heavyCandidate || pool[0] || 'rarach';
    // Deploy elite heavy variant only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(heavyId);
      if (elite) heavyId = elite;
    }
    const fastCandidate = pool[pool.length - 1];
    let fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || 'rarach';
    if (this.threatBudget >= 32) {
      const eliteFast = this.getEliteVariantForId(fastId);
      if (eliteFast) fastId = eliteFast;
    }

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const baseAngle = pAngle + (Math.random() * 0.4 - 0.2);
    const oppositeAngle = baseAngle + Math.PI;

    // Side 1 (closer engagement 500 px)
    for (let i = -1; i <= 1; i++) {
      const a = baseAngle + i * 0.22;
      const x = player.x + Math.cos(a) * 500;
      const y = player.y + Math.sin(a) * 500;
      const e = engine.spawnMonster(i === 0 ? heavyId : fastId, x, y, 1.1);
      if (e) {
        e.speed *= 1.1;
        this.recordEnemySpawn(e, gameTime);
      }
    }

    // Side 2 (opposite 500 px)
    for (let i = -1; i <= 1; i++) {
      const a = oppositeAngle + i * 0.22;
      const x = player.x + Math.cos(a) * 500;
      const y = player.y + Math.sin(a) * 500;
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
    const heavyCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let heavyId = heavyCandidate || pool[0] || 'rarach';
    // Deploy elite heavy variant only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(heavyId);
      if (elite) heavyId = elite;
    }
    const fastCandidate = pool[pool.length - 1];
    let fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || 'rarach';
    if (this.threatBudget >= 32) {
      const eliteFast = this.getEliteVariantForId(fastId);
      if (eliteFast) fastId = eliteFast;
    }

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const frontAngle = pAngle + (Math.random() * 0.4 - 0.2);

    // Frontal wall (anvil)
    const wallDist = 510;
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
    const flankDist = 470;
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
    const eliteCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let eliteId = eliteCandidate || pool[0] || 'rarach';
    // Deploy elite leader only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(eliteId);
      if (elite) eliteId = elite;
    }
    const minionCandidate = pool[pool.length - 1];
    let minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || 'rarach';
    if (this.threatBudget >= 32) {
      const eliteMinion = this.getEliteVariantForId(minionId);
      if (eliteMinion) minionId = eliteMinion;
    }

    const angle = Math.random() * Math.PI * 2;
    const dist = 520;
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
    const archCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[1]);
    const archId = archCandidate || pool[0] || 'rarach';

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
      if (typeof h.warningTimer === 'number') {
        h.warningTimer = Math.max(0, h.warningTimer - dt);
      }
      if (h.duration <= 0) {
        this.hazards.splice(i, 1);
        continue;
      }

      // Telegraph hazards are inert until their warning window ends.
      if (typeof h.warningTimer === 'number' && h.warningTimer > 0) continue;

      const dist = Math.hypot(player.x - h.x, player.y - h.y);
      if (dist > h.radius) {
        if (typeof h.damageTimer === 'number') h.damageTimer = Math.max(0, h.damageTimer - dt);
        continue;
      }

      if (h.type === 'mud' || h.type === 'frost') {
        player.hazardSlowTimer = 0.25;
        player.hazardSlowFactor = h.slowFactor;
        continue;
      }

      if (h.type !== 'fire' || !(h.damage && h.damage > 0)) continue;

      if (h.oneShot) {
        if (!h.exploded) {
          if (typeof player.takeDamage === 'function') {
            player.takeDamage(h.damage, 'fire', null, false);
          } else {
            player.hp = Math.max(0, (player.hp || 0) - h.damage);
          }
          h.exploded = true;
          // Keep the eruption visible briefly, without applying its damage again.
          h.duration = Math.min(h.duration, 0.25);
        }
      } else {
        h.damageTimer = Math.max(0, (h.damageTimer || 0) - dt);
        if (h.damageTimer <= 0) {
          if (typeof player.takeDamage === 'function') {
            player.takeDamage(h.damage, 'fire', null, false);
          } else {
            player.hp = Math.max(0, (player.hp || 0) - h.damage);
          }
          h.damageTimer = h.damageInterval ?? 0.6;
        }
      }
    }
  }

  private updateBubackaDira(dt: number, engine: any, player: any, gameTime: number): void {
    // 1. Spawning condition: within anomaly window, not already spawned, no active boss present
    if (!this.bubackaDira && !this.bubackaDiraSpawned) {
      const [startSec, endSec] = this.rozmar.anomalyWindow;
      const activeBossPresent = Boolean(
        engine.state?.enemies?.some((e: any) => (e.isBoss || e.isMiniboss) && !e.dead && !e.isDefeated)
      );
      if (gameTime >= startSec && gameTime <= endSec && !activeBossPresent) {
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
      this.triggerTelegraph('⚠️ Čas vypršel! Z Bubácké díry se vyvalil velký rozmrzelý bubák!', 3.0, engine);
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
    const pool = this.getWeightedPool(engine);
    const bossCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    const bossId = bossCandidate || pool[0] || 'rarach';
    const furious = engine.spawnMonster(bossId, dira.x, dira.y, 1.45, false, true, '🧌 Procitlý noční hromotluk z díry');
    if (furious) {
      furious.speed *= 1.2;
      this.recordEnemySpawn(furious, engine.state.gameTime);
    }
  }

  private getWeightedPool(engine: any): string[] {
    const state = engine.state ?? engine;
    const levelId: GameLevelId = state.activeLevelId ?? this.levelId;
    const curLvl: GameLevelDef | undefined = GAME_LEVELS[levelId];
    const phaseKey = getCurrentDayPhase(state.gameTime || 0).id;
    const phasePool: string[] = (curLvl?.spawnPools && curLvl.spawnPools[phaseKey])
      ? curLvl.spawnPools[phaseKey]
      : (curLvl?.spawnPools?.noon || []);

    // Never mix enemies from other phases into the current phase.
    const eligible = [...new Set(phasePool)]
      .filter((id) => Boolean(ENEMIES[id]) && ENEMIES[id].category !== 'bosses');

    // Keep a valid fallback for incomplete level definitions.
    if (eligible.length === 0) {
      const fallback = [...new Set(curLvl?.spawnPools?.noon || [])]
        .filter((id) => Boolean(ENEMIES[id]) && ENEMIES[id].category !== 'bosses');
      if (fallback.length > 0) eligible.push(...fallback);
    }
    if (eligible.length === 0) {
      const preferred = this.rozmar.preferredEnemyIds
        .filter((id) => Boolean(ENEMIES[id]) && ENEMIES[id].category !== 'bosses');
      if (preferred.length > 0) eligible.push(...preferred);
    }
    if (eligible.length === 0 && ENEMIES['rarach']) {
      eligible.push('rarach');
    }

    // Elite variants are available on every difficulty. The slider controls
    // pressure quantity/cadence, not access to enemy families or mechanics.
    for (const baseId of [...eligible]) {
      const eliteId = this.getEliteVariantForId(baseId);
      if (eliteId && ENEMIES[eliteId] && !eligible.includes(eliteId)) {
        eligible.push(eliteId);
      }
    }

    return eligible;
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
      pressureMultiplier: Math.round(this.pressureMultiplier * 100) / 100,
    };
  }
}
