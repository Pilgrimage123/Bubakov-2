import type { GameLevelId, GameLevelDef, EnemyPrefixType } from '../types';
import { getCurrentDayPhase } from '../constants';
import { GAME_LEVELS } from '../data/levels';
import { selectRunRozmar, type RunRozmarDef } from '../data/runArchetypes';
import { ENEMIES } from '../data/enemies';
import { toCanonicalWeaponId } from './migration';
import {
  computeVulnerabilityScore,
  getDropPacingPhase,
  CampingDetector,
  sampleAnnulusPosition,
  type DropPacingPhase,
} from './directorDrops';

const LEVEL_ZERO_FORBIDDEN_REGULAR_SPAWNS = new Set<string>([
  'rarach',
  'krvavy_rarach',
  'certik',
  'cert',
  'sazovy_rarach',
  'drab',
  'jiskrivec',
  'ohnivy_muz',
  'ohnivy_pes',
  'plivnik',
  'vodnicek',
  'hastrman',
  'topivec',
  'kalny_hastrman',
  'zaba',
  'ropucha',
  'polednice',
]);

function isRegularSpawnAllowedForLevel(enemyId: string, levelId: GameLevelId): boolean {
  const enemy = ENEMIES[enemyId];
  if (!enemy || enemy.category === 'bosses') return false;
  if (levelId !== 0) return true;
  return enemy.category !== 'demons' && !LEVEL_ZERO_FORBIDDEN_REGULAR_SPAWNS.has(enemyId);
}

export const HORDE_CLEARING_WEAPONS = new Set<string>([
  'hromnicka',
  'cesnekova_topinka',
  'bylinkova_fajfka',
  'valecnice',
  'kovana_halapartna',
  'dreveny_cep',
  'svecena_kropenka',
  'snehova_koule',
]);

export function isHordeClearingArsenal(player: any): boolean {
  if (!player || !Array.isArray(player.weapons) || player.weapons.length === 0) {
    return false;
  }
  let hordeCount = 0;
  for (const w of player.weapons) {
    const rawId = typeof w === 'string' ? w : w?.id || w?.weaponId;
    if (rawId) {
      const canonical = toCanonicalWeaponId(rawId);
      if (HORDE_CLEARING_WEAPONS.has(canonical) || HORDE_CLEARING_WEAPONS.has(rawId)) {
        hordeCount++;
      }
    }
  }
  const ratio = hordeCount / player.weapons.length;
  return ratio >= 0.5 || hordeCount >= 2;
}

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
    subtitle: 'Nejklidnější tempo: žádné trestání úspěchu lovce (tlak se při dominanci nezvyšuje). Silná adaptivní pomoc při potížích.',
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
    subtitle: 'Nejvyšší výzva: při úspěchu a dominanci nastává šílené, nepřiměřené a brutální trestání úspěchu (téměř nehratelná záplava běsů a elit!). Pomoc při potížích zůstává aktivní.',
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
  killVelocity: number;
  panicBrakeActive: boolean;
  punitiveTwinCooldown: number;
  vulnerabilityScore?: number;
  dropPacingPhase?: DropPacingPhase;
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

  /**
   * Calculates a spawn position guaranteed to be strictly outside the player's
   * visible viewport, ensuring enemies never pop into existence on screen.
   */
  public static getOffscreenPosition(
    player: { x: number; y: number },
    angle: number,
    engine?: any,
    extraMargin: number = 160
  ): { x: number; y: number } {
    let viewW = 1920;
    let viewH = 1080;

    if (typeof window !== 'undefined' && window.innerWidth && window.innerHeight) {
      viewW = Math.max(1400, window.innerWidth);
      viewH = Math.max(800, window.innerHeight);
    }

    const state = engine?.state ?? engine;
    const canvas = engine?.canvas ?? state?.canvas;
    if (canvas && typeof canvas.width === 'number' && typeof canvas.height === 'number') {
      viewW = Math.max(viewW, canvas.width);
      viewH = Math.max(viewH, canvas.height);
    }

    const camera = engine?.camera ?? state?.camera;
    let camX = player.x - viewW / 2;
    let camY = player.y - viewH / 2;

    if (camera && typeof camera.x === 'number' && typeof camera.y === 'number') {
      camX = camera.x;
      camY = camera.y;
    }

    const halfW = viewW / 2 + extraMargin;
    const halfH = viewH / 2 + extraMargin;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = Math.abs(cos) > 0.0001 ? halfW / Math.abs(cos) : 99999;
    const dy = Math.abs(sin) > 0.0001 ? halfH / Math.abs(sin) : 99999;
    const edgeDist = Math.min(dx, dy);

    // Guaranteed minimum radial distance of 750px regardless of screen size
    const dist = Math.max(edgeDist, 750) + Math.random() * 80;
    let sx = player.x + cos * dist;
    let sy = player.y + sin * dist;

    // Strict boundary enforcement: verify (sx, sy) is outside [camX - pad, camY - pad, camX + viewW + pad, camY + viewH + pad]
    const pad = 80;
    const left = camX - pad;
    const right = camX + viewW + pad;
    const top = camY - pad;
    const bottom = camY + viewH + pad;

    if (sx >= left && sx <= right && sy >= top && sy <= bottom) {
      const push = Math.max(
        Math.abs(right - player.x),
        Math.abs(left - player.x),
        Math.abs(bottom - player.y),
        Math.abs(top - player.y)
      ) + extraMargin;
      sx = player.x + cos * push;
      sy = player.y + sin * push;
    }

    return { x: sx, y: sy };
  }

  public getOffscreenPosition(
    player: { x: number; y: number },
    angle: number,
    engine?: any,
    extraMargin: number = 160
  ): { x: number; y: number } {
    return RunDirector.getOffscreenPosition(player, angle, engine, extraMargin);
  }

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
  public activePunitiveMiniboss: any = null;
  public panicBrakeCooldown = 0;
  public panicBrakeActiveTimer = 0;
  public punitiveTwinCooldown = 0;
  public timeSinceLastCrowWave = 0;
  public timeSinceLastSnowmanHorde = 0;

  public vulnerabilityScore = 0.5;
  public vulnerabilityTimer = 0;
  public dropPacingPhase: DropPacingPhase = 'flow';
  public campingDetector: CampingDetector = new CampingDetector();
  public mercyPityCooldown = 0;
  public heavyAnchorCooldown = 20.0;

  /**
   * Computes the authoritative effective living enemy count.
   * Standard enemies count 1:1.
   * Virtual flock members (such as Stage 1 circular crow waves driven by a Virtual Leader)
   * count collectively as exactly 3 entities toward capacity and pacing limits.
   */
  public getEffectiveLivingCount(engine: any): number {
    const state = engine?.state ?? engine;
    const enemies: any[] = engine?.livingEnemies ?? state?.enemies ?? [];
    let standardCount = 0;
    let hasActiveCrowWave = false;
    let hasActiveSnowmanHorde = false;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.isDefeated) continue;
      if (e.isVirtualCrowMember) {
        if (e._crowWaveActive) {
          hasActiveCrowWave = true;
        }
      } else if (e.isVirtualSnowmanMember) {
        if (e._snowmanHordeActive) {
          hasActiveSnowmanHorde = true;
        }
      } else {
        standardCount++;
      }
    }

    if (!hasActiveCrowWave && (engine?.crowWave?.waveActive || state?.crowWave?.waveActive)) {
      hasActiveCrowWave = true;
    }
    if (!hasActiveSnowmanHorde && (engine?.snowmanHorde?.waveActive || state?.snowmanHorde?.waveActive)) {
      hasActiveSnowmanHorde = true;
    }

    return standardCount + (hasActiveCrowWave ? 3 : 0) + (hasActiveSnowmanHorde ? 4 : 0);
  }

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
  private lastRecordedPlayerHp: number | null = null;
  private hpLossWindowTimer = 0;
  private hpLossInWindow = 0;

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

  public getKillVelocity(windowSec = 3.0): number {
    const now = this.currentGameTime;
    const windowStart = now - windowSec;
    let count = 0;
    for (let i = this.recentKills.length - 1; i >= 0; i--) {
      if (this.recentKills[i].killedAt >= windowStart) {
        count++;
      } else {
        break;
      }
    }
    return windowSec > 0 ? count / windowSec : 0;
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
    const killVel = this.getKillVelocity(3.0);
    const velFactor = Math.max(0, Math.min(1, killVel / 3.0));

    return ttkFactor * 0.40 + hpFactor * 0.35 + velFactor * 0.25;
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

    const isCrowWaveActive = Boolean(
      engine.crowWave?.waveActive ||
      state.crowWave?.waveActive ||
      (engine.livingEnemies ?? state.enemies ?? []).some((e: any) => e.isVirtualCrowMember && e._crowWaveActive && !e.dead && !e.isDefeated)
    );
    if (isCrowWaveActive) {
      this.timeSinceLastCrowWave = 0;
    } else {
      this.timeSinceLastCrowWave += dt;
    }

    const isSnowmanHordeActive = Boolean(
      engine.snowmanHorde?.waveActive ||
      state.snowmanHorde?.waveActive ||
      (engine.livingEnemies ?? state.enemies ?? []).some((e: any) => e.isVirtualSnowmanMember && e._snowmanHordeActive && !e.dead && !e.isDefeated)
    );
    if (isSnowmanHordeActive) {
      this.timeSinceLastSnowmanHorde = 0;
    } else {
      this.timeSinceLastSnowmanHorde += dt;
    }

    const livingCount = this.getEffectiveLivingCount(engine);

    // Tick cooldowns
    this.punitiveTwinCooldown = Math.max(0, this.punitiveTwinCooldown - dt);
    this.panicBrakeCooldown = Math.max(0, this.panicBrakeCooldown - dt);
    this.panicBrakeActiveTimer = Math.max(0, this.panicBrakeActiveTimer - dt);
    this.mercyPityCooldown = Math.max(0, this.mercyPityCooldown - dt);
    this.heavyAnchorCooldown = Math.max(0, this.heavyAnchorCooldown - dt);

    // AI Director: Vulnerability Score (V) update at 0.5s cadence
    this.vulnerabilityTimer += dt;
    if (this.vulnerabilityTimer >= 0.5) {
      this.vulnerabilityTimer = 0;
      const density = this.computeLocalEnemyDensity(player, engine);
      this.vulnerabilityScore = computeVulnerabilityScore(player, this.hpLossInWindow, density);
      this.dropPacingPhase = getDropPacingPhase(this.vulnerabilityScore);
    }

    // Anti-camping detection & Heavy Anchor trigger
    const isCamping = this.campingDetector.update(dt, player.x, player.y);
    if (isCamping && this.heavyAnchorCooldown <= 0) {
      this.triggerCampingHeavyAnchor(player, engine);
    }

    // Track sudden burst damage for Panic Brake
    const maxHp = player.maxHp || 100;
    const currentHp = player.hp !== undefined ? player.hp : maxHp;
    if (this.lastRecordedPlayerHp !== null) {
      const hpDrop = this.lastRecordedPlayerHp - currentHp;
      if (hpDrop > 0) {
        this.hpLossInWindow += hpDrop;
      }
    }
    this.lastRecordedPlayerHp = currentHp;
    this.hpLossWindowTimer += dt;
    if (this.hpLossWindowTimer >= 1.5) {
      this.hpLossWindowTimer = 0;
      this.hpLossInWindow = 0;
    }

    const currentHpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
    const suddenBurstLoss = (this.hpLossInWindow / maxHp) >= 0.25;
    const criticalHp = currentHpRatio < 0.30;

    if ((suddenBurstLoss || criticalHp) && this.panicBrakeCooldown <= 0) {
      this.panicBrakeCooldown = 18.0;
      this.panicBrakeActiveTimer = 2.5;
      this.pressureMultiplier = Math.min(this.pressureMultiplier, 0.75);
      this.threatBudget = Math.max(0, this.threatBudget - 10);
      this.hpLossInWindow = 0;
    }

    // 1. Track player movement vector for Zrádný terén (anti-kiting)
    this.kitingHazardCooldown -= dt;
    this.trackPlayerMovement(dt, player);

    // 2. Estimate performance before accruing threat so current player state
    // affects this frame's pressure rather than lagging one update behind.
    const dominance = this.computeDominanceIndex(player);
    const hpRatio = Math.max(0, Math.min(1, (player.hp || 0) / (player.maxHp || 1)));
    const hpDistress = Math.max(0, 1 - hpRatio);
    const domDistress = Math.max(0, 1 - dominance);
    const distressIndex = hpDistress * 0.65 + domDistress * 0.35;
    this.assistanceActive = this.panicBrakeActiveTimer > 0 || distressIndex >= 0.28 || hpDistress >= 0.40 || domDistress >= 0.70;
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
    const punishIntervalFactor = this.pressureMultiplier > 1.2
      ? Math.max(0.25, 1.0 - (this.pressureMultiplier - 1.0) * 0.20)
      : 1.0;
    const spawnInterval = Math.max(0.08, ((0.6 - ((this.dynamicDifficulty - 2.0) / 2.0) * 0.22) * openingSpawnFactor) * punishIntervalFactor);
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
        const kitingCd = this.pressureMultiplier >= 2.0 ? 2.5 : 5.0 * openingTriggerFactor;
        if (this.playerHeadingDuration >= 3.5 * openingTriggerFactor && this.kitingHazardCooldown <= 0) {
          this.triggerZradnyTeren(player, currentAngle);
          this.playerHeadingDuration = 0;
          this.kitingHazardCooldown = kitingCd;
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

  public computeLocalEnemyDensity(player: any, engine: any, radius = 450): number {
    const enemies = engine.livingEnemies ?? engine.state?.enemies ?? [];
    let count = 0;
    const radiusSq = radius * radius;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.isDefeated) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      if (dx * dx + dy * dy <= radiusSq) {
        count++;
      }
    }
    return count;
  }

  public triggerCampingHeavyAnchor(player: any, engine: any): void {
    this.heavyAnchorCooldown = 25.0;
    const screenW = engine.camera?.width ?? 1280;
    const enemies = engine.livingEnemies ?? engine.state?.enemies ?? [];
    const drops = engine.drops ?? engine.state?.drops ?? [];

    // Guard: Prevent spawning too many heavy anchors or chests!
    // If an uncollected heavy anchor or chest is already waiting in the field, defer spawning.
    const activeAnchorsCount = drops.filter(
      (d: any) => !d.dead && (d.isHeavyAnchor || d.type === 'chest' || d.type === 'big_pouch' || d.type === 'gingerbread_stash')
    ).length;
    if (activeAnchorsCount >= 1) {
      this.heavyAnchorCooldown = 15.0;
      return;
    }

    const hasActiveChest = drops.some((d: any) => !d.dead && d.type === 'chest');
    const anchorType = this.dropPacingPhase === 'mercy'
      ? 'gingerbread_stash'
      : (hasActiveChest || Math.random() < 0.6 ? 'big_pouch' : 'chest');

    const pos = sampleAnnulusPosition(player.x, player.y, screenW, enemies, anchorType, undefined, drops);
    if (typeof engine.spawnDrop === 'function') {
      const val = anchorType === 'big_pouch' ? 35 : anchorType === 'gingerbread_stash' ? 25 : 1;
      engine.spawnDrop(anchorType, pos.x, pos.y, {
        value: val,
        isHeavyAnchor: true,
        isMercyDrop: anchorType === 'gingerbread_stash',
      });
      if (anchorType === 'gingerbread_stash') {
        this.mercyPityCooldown = 15.0;
      }
    }
  }

  private updateAdaptivePressure(dominance: number, hpRatio: number, dt: number): void {
    const normDiff = Math.max(0, Math.min(1, (this.dynamicDifficulty - 2.0) / 3.0));
    let target = 1.0;

    if (this.panicBrakeActiveTimer > 0) {
      target = 0.75;
    } else if (hpRatio < 0.35 && dominance < 0.45) {
      // 1. Helping struggling hunters (cushions players across all difficulties, strongest on low)
      target = 0.55 + normDiff * 0.17; // 0.55 at 2.0, 0.72 at 5.0
    } else if (hpRatio < 0.50 && dominance < 0.35) {
      target = 0.65 + normDiff * 0.17; // 0.65 at 2.0, 0.82 at 5.0
    } else if (hpRatio > 0.65 && dominance > 0.55 && this.recentKills.length >= 2) {
      // 2. Punishing success:
      // Lowest difficulty (2.0): lowest should not punish success at all (target = 1.0, clamp <= 1.0)
      // Highest difficulty (5.0): insane and disproportionate punishment of success (practically unplayable)!
      if (normDiff <= 0) {
        target = 1.0; // Exactly 0 punishment at 2.0!
      } else {
        const domExcess = Math.max(0, (dominance - 0.55) / 0.45);
        // Exponential / disproportionate escalation on high difficulties
        const punishmentFactor = Math.pow(normDiff, 1.35) * (1.2 + Math.pow(domExcess, 1.25) * 2.8);
        target = 1.0 + punishmentFactor; // Up to 5.0x at 5.0!
      }
    }

    // Asymmetric adaptation rate:
    // Faster relief / brake (1-2s): alphaRate ~ 1.0
    // Steady escalation for dominance (5-8s): alphaRate ~ 0.22 + normDiff * 0.18
    const isRelief = target < this.pressureMultiplier;
    const alphaRate = isRelief ? 1.0 : (0.22 + normDiff * 0.18);
    const alpha = Math.min(1, Math.max(0, dt) * alphaRate);
    this.pressureMultiplier += (target - this.pressureMultiplier) * alpha;

    // Strict clamping: on 2.0, strictly never exceed 1.0! On 5.0, up to 5.0!
    const maxAllowedPressure = 1.0 + normDiff * 4.0;
    this.pressureMultiplier = Math.max(0.55, Math.min(maxAllowedPressure, this.pressureMultiplier));
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

    // Pressure surge scales threat accrual and cap when dominating on higher difficulty
    const pressureSurge = this.pressureMultiplier > 1.0
      ? Math.pow(this.pressureMultiplier, 1.3)
      : this.pressureMultiplier;

    // Capacity and accrual scale with the selected baseline difficulty and adaptive pressure.
    this.budgetCap = Math.round(cap * this.rozmar.threatMultiplier * (0.5 + normalizedDiff * 0.8) * pressureSurge * openingCapFactor);

    let accrualMult = 0.35 + Math.pow(normalizedDiff, 1.42) * 0.75;

    // Assistance is equally effective at every preset; higher difficulty must
    // not weaken the director's response when the player is struggling.
    if (this.assistanceActive) {
      accrualMult *= 0.45;
    }

    const accrual = baseRate * this.rozmar.threatMultiplier * accrualMult * openingRateFactor * pressureSurge * dt;
    this.threatBudget = Math.min(this.budgetCap, this.threatBudget + accrual);
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
          this.valveTimer = this.assistanceActive ? 5.0 : 3.5; // Extended calm during assistance / distress
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
    if (engine?.state) {
      engine.state.directorTelegraphText = msg;
      engine.state.directorTelegraphTimer = duration;
    }
  }

  private getRegularSpawnFallbackId(): string {
    return this.levelId === 0 ? 'mrazovy_skritek' : 'rarach';
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
    if (!elite || !ENEMIES[elite]) return null;
    // A level-0 enemy must never become a devil or waterman through elite conversion.
    if (this.levelId === 0 && !isRegularSpawnAllowedForLevel(elite, 0)) return null;
    return elite;
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

    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    // Up to 65 budget spent on high difficulty
    const maxSpend = this.dynamicDifficulty >= 4.0 ? 65 : this.dynamicDifficulty >= 3.0 ? 50 : 40;
    const budgetToSpend = Math.min(maxSpend, Math.max(25, this.threatBudget));
    const pool = this.getWeightedPool(engine);

    const leaderCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let leaderId = leaderCandidate || pool[0] || this.getRegularSpawnFallbackId();
    {
      const elite = this.getEliteVariantForId(leaderId);
      if (elite) leaderId = elite;
    }

    const minionCandidate = pool[pool.length - 1];
    let minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || this.getRegularSpawnFallbackId();
    {
      const eliteMinion = this.getEliteVariantForId(minionId);
      if (eliteMinion) minionId = eliteMinion;
    }

    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    // Two opposite angles (Klešťové sevření) outside player visible field
    const angle1 = pAngle + Math.PI / 2 + (Math.random() * 0.4 - 0.2);
    const angle2 = angle1 + Math.PI;

    let spawnedCount = 0;
    // Leader 1 (spawned strictly outside visible field)
    if (spawnedCount < availableSlots) {
      const leaderPrefix1 = this.dynamicDifficulty >= 3.5 ? this.getThematicPrefix() : undefined;
      const pos1 = this.getOffscreenPosition(player, angle1, engine, 180);
      const leader1 = engine.spawnMonster(leaderId, pos1.x, pos1.y, 1.3, false, false, 'Přepadový strážmistr', leaderPrefix1);
      if (leader1) {
        leader1.name = 'Přepadový strážmistr';
        leader1.customBossTitle = 'Přepadový strážmistr';
        leader1.speed *= 1.20;
        leader1.drtivyBuffTimer = 3.5;
        this.recordEnemySpawn(leader1, engine.state.gameTime);
        spawnedCount++;
      }
    }

    // Leader 2 from opposite angle outside visible field
    if (spawnedCount < availableSlots) {
      const leaderPrefix2 = this.dynamicDifficulty >= 3.5 ? this.getThematicPrefix() : undefined;
      const pos2 = this.getOffscreenPosition(player, angle2, engine, 180);
      const leader2 = engine.spawnMonster(leaderId, pos2.x, pos2.y, 1.3, false, false, 'Přepadový strážmistr', leaderPrefix2);
      if (leader2) {
        leader2.name = 'Přepadový strážmistr';
        leader2.customBossTitle = 'Přepadový strážmistr';
        leader2.speed *= 1.20;
        leader2.drtivyBuffTimer = 3.5;
        this.recordEnemySpawn(leader2, engine.state.gameTime);
        spawnedCount++;
      }
    }

    // Flankers in an arc around both angles outside visible field
    const remainingForMinions = Math.max(0, availableSlots - spawnedCount);
    const targetMinionCount = Math.min(this.dynamicDifficulty >= 4.0 ? 10 : this.dynamicDifficulty >= 3.0 ? 7 : 5, Math.max(4, Math.floor(budgetToSpend / 5)));
    const minionCount = Math.min(targetMinionCount, remainingForMinions);
    for (let i = 0; i < minionCount; i++) {
      const useAngle = (i % 2 === 0) ? angle1 : angle2;
      const offset = ((Math.floor(i / 2) + 1) * 0.20) * (i % 4 < 2 ? 1 : -1);
      const mPos = this.getOffscreenPosition(player, useAngle + offset, engine, 160 + (i % 3) * 30);
      const minion = engine.spawnMonster(minionId, mPos.x, mPos.y, 1.0);
      if (minion) {
        minion.speed *= 1.20;
        minion.drtivyBuffTimer = 3.5;
        this.recordEnemySpawn(minion, engine.state.gameTime);
        spawnedCount++;
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - budgetToSpend);
  }

  private spendExcessBudgetOnElite(engine: any): void {
    if (this.threatBudget < 22 || this.eliteBudgetCooldown > 0) return;
    const enemies: any[] = engine.livingEnemies || [];
    if (enemies.length === 0) return;

    const eligible = enemies.filter((enemy: any) => !enemy.isBoss && !enemy.isOstryBes && !enemy.isVirtualCrowMember && !enemy.isVirtualSnowmanMember);
    const pool = eligible.length > 0 ? eligible : enemies.filter((enemy: any) => !enemy.isBoss && !enemy.isVirtualCrowMember && !enemy.isVirtualSnowmanMember);
    const target = pool[Math.floor(Math.random() * pool.length)];
    if (!target || target.isBoss) return;

    if (!target.isOstryBes) {
      target.isOstryBes = true;
    } else if (!target.prefix) {
      target.prefix = this.getThematicPrefix();
    }
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
    const isLevel0 = this.levelId === 0 || (engine.state?.activeLevelId ?? this.levelId) === 0;
    const isCrowWaveActive = Boolean(
      engine.crowWave?.waveActive ||
      engine.state?.crowWave?.waveActive ||
      (engine.livingEnemies ?? engine.state?.enemies ?? []).some((e: any) => e.isVirtualCrowMember && e._crowWaveActive && !e.dead && !e.isDefeated)
    );
    const isSnowmanHordeActive = Boolean(
      engine.snowmanHorde?.waveActive ||
      engine.state?.snowmanHorde?.waveActive ||
      (engine.livingEnemies ?? engine.state?.enemies ?? []).some((e: any) => e.isVirtualSnowmanMember && e._snowmanHordeActive && !e.dead && !e.isDefeated)
    );
    const reservesCrowSlots = isLevel0 && this.timeSinceLastCrowWave >= 18 && !isCrowWaveActive;
    const reservesSnowmanSlots = isLevel0 && this.timeSinceLastSnowmanHorde >= 18 && !isSnowmanHordeActive;
    const crowReservedSlots = reservesCrowSlots ? 3 : 0;
    const snowmanReservedSlots = reservesSnowmanSlots ? 4 : 0;
    const effectiveCapacityLimit = Math.max(0, this.maxLivingEnemies - crowReservedSlots - snowmanReservedSlots);

    if (livingCount >= effectiveCapacityLimit) return;

    // Dvojče Miniboss deployment:
    // Decoupled from difficulty slider (available on all presets >= 2.50x, strictly inactive on 2.00x).
    // Deployed primarily when player has high dominance (>= 0.70) AND has a horde-clearing arsenal
    // (auras, cleaves, piercing projectiles) which trivialize common swarms, or extreme dominance (>= 0.88).
    // Costs only 60% of original director budget (18 points instead of 30).
    const isHorde = isHordeClearingArsenal(player);
    const meetsDominance = (dominance >= 0.70 && isHorde) || dominance >= 0.88;
    if (
      this.dynamicDifficulty >= 2.5 &&
      !this.assistanceActive &&
      this.panicBrakeActiveTimer <= 0 &&
      this.punitiveTwinCooldown <= 0 &&
      this.threatBudget >= 18 &&
      meetsDominance &&
      (!this.activePunitiveMiniboss || this.activePunitiveMiniboss.dead || this.activePunitiveMiniboss.isDefeated)
    ) {
      const curLvl: GameLevelDef = GAME_LEVELS[this.levelId] || GAME_LEVELS[1];
      const targetMini = gameTime > 150 && curLvl.midBoss ? curLvl.midBoss : curLvl.miniBoss;
      if (targetMini) {
        const ang = Math.random() * Math.PI * 2;
        const pos = this.getOffscreenPosition(player, ang, engine, 180);
        const cleanName = targetMini.name.replace(/^[^a-zA-Z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+/, '').trim();
        const twin = engine.spawnMonster(
          targetMini.id,
          pos.x,
          pos.y,
          (targetMini.multiplier || 2.5) * 1.15,
          false,
          true,
          `👑 Dvojče: ${cleanName}`
        );
        if (twin) {
          twin.isPunitiveTwin = true;
          twin.isMiniboss = true;
          this.activePunitiveMiniboss = twin;
          this.punitiveTwinCooldown = 60.0;
          this.recordEnemySpawn(twin, gameTime);
          this.threatBudget = Math.max(0, this.threatBudget - 18);
          this.triggerTelegraph('👑 PÝCHA PŘEDCHÁZÍ PÁD: Přichází Dvojče minibosse!', 3.5, engine);
          if (engine.callbacks?.onSound) {
            engine.callbacks.onSound('boss');
          }
          return;
        }
      }
    }

    // Special Prefixes: when player kills common mobs too quickly (high dominance / low TTK)
    // and Director needs to deplete excess threat budget (costs 5x normal = 15 threat budget)
    const avgTTK = this.getAverageTTK();
    const isPerformanceCapped = this.maxLivingEnemies <= 35;
    const minThreatForPrefixed = isPerformanceCapped ? 10 : 15;
    const canSpawnPrefixed = !this.assistanceActive && (dominance >= (isPerformanceCapped ? 0.4 : 0.55) || (this.recentKills.length > 0 && avgTTK < (isPerformanceCapped ? 1.1 : 0.95)) || (isPerformanceCapped && this.threatBudget >= 12)) && this.threatBudget >= minThreatForPrefixed && this.prefixSpawnCooldown <= 0;
    if (canSpawnPrefixed) {
      const openingCooldownFactor = gameTime < 30 ? 1.8 : gameTime < 60 ? 1.5 : gameTime < 90 ? 1.25 : 1.0;
      const punishCdDiv = Math.max(1.0, this.pressureMultiplier * (this.maxLivingEnemies <= 35 ? 1.05 : 0.85));
      this.prefixSpawnCooldown = Math.max(0.8, (6.0 - ((this.dynamicDifficulty - 2.0) / 2.0) * 2.0) / punishCdDiv) * openingCooldownFactor;
      this.spawnPrefixedEnemy(engine, player, gameTime);
      return;
    }

    // High dominance OR high dynamicDifficulty: prefer heavy formations (Hammer & Anvil, Escort, Anti-Kite, Klešťové sevření)
    const allowHeavyFormation = !this.assistanceActive && this.threatBudget >= 16 && this.formationCooldown <= 0;
    if (allowHeavyFormation) {
      const punishCdDiv = Math.max(1.0, this.pressureMultiplier * 0.75);
      const baseCd = Math.max(0.9, (5.0 - ((this.dynamicDifficulty - 2.0) / 2.0) * 2.2) / punishCdDiv);
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
      this.formationCooldown = Math.max(2.5, 5.5 - ((this.dynamicDifficulty - 2.0) / 2.0) * 1.8);
      this.spawnArchitects(engine, player, gameTime);
      return;
    }

    // Holding slots for heavy formations:
    // When director has accumulated threat budget and formation cooldown is ready or nearly ready (<= 2.5s),
    // save remaining slots for the heavy formation (which requires ~6 slots) instead of bleeding them on cheap trickles.
    const isAccumulatingForFormation = this.threatBudget >= 12 && this.formationCooldown <= 2.5;
    if (isAccumulatingForFormation && (effectiveCapacityLimit - livingCount) < 6) {
      return;
    }

    // Standard tactical squad / burst spawn if budget allows.
    // Every preset uses the same phase-appropriate pool, including eligible
    // elite variants; difficulty controls pressure quantity and cadence.
    if (this.threatBudget >= 3) {
      const pool = this.getAllBubaksPool(engine);
      const maxBatchCost = this.dynamicDifficulty >= 4.5 && this.pressureMultiplier >= 1.6
        ? 36
        : this.dynamicDifficulty >= 3.4
        ? 18
        : this.dynamicDifficulty >= 2.8
        ? 14
        : (dominance > 0.7 ? 12 : 6);
      const availableBudget = Math.min(this.threatBudget, maxBatchCost);
      const maxCount = this.dynamicDifficulty >= 4.5 && this.pressureMultiplier >= 1.6
        ? 8
        : this.dynamicDifficulty >= 3.4
        ? 5
        : this.dynamicDifficulty >= 2.8
        ? 4
        : 3;
      const spawnLimit = Math.max(0, Math.min(maxCount, effectiveCapacityLimit - livingCount));
      const spawnPlan: string[] = [];
      let plannedCost = 0;

      for (let i = 0; i < spawnLimit; i++) {
        const remainingBudget = availableBudget - plannedCost;
        const affordable = pool.filter((id) => this.getBubakThreatCost(id) <= remainingBudget);
        if (affordable.length === 0) break;

        const mobId = affordable[Math.floor(Math.random() * affordable.length)] || this.getRegularSpawnFallbackId();
        spawnPlan.push(mobId);
        plannedCost += this.getBubakThreatCost(mobId);
      }

      if (spawnPlan.length > 0) {
        // Distribute spawns across distinct sectors outside the visible field
        const startCell = Math.floor(Math.random() * RunDirector.CELL_COUNT);
        const hpRatio = Math.max(0, Math.min(1, (player.hp || 0) / (player.maxHp || 1)));
        const hpDistress = Math.max(0, 1 - hpRatio);
        const domDistress = Math.max(0, 1 - dominance);
        const distressIndex = hpDistress * 0.65 + domDistress * 0.35;

        for (let i = 0; i < spawnPlan.length; i++) {
          const mobId = spawnPlan[i];
          const cell = (startCell + i) % RunDirector.CELL_COUNT;
          const angle = RunDirector.CELL_ANGLES[cell] + (Math.random() - 0.5) * 0.12;
          const pos = this.getOffscreenPosition(player, angle, engine, 160);
          const vycerpanyThreshold = this.panicBrakeActiveTimer > 0 ? 0.50 : Math.max(0.50, distressIndex);
          const isVycerpany = this.assistanceActive && Math.random() < vycerpanyThreshold;
          const prefixToApply = isVycerpany ? 'vycerpany' : undefined;

          const e = engine.spawnMonster(
            mobId,
            pos.x,
            pos.y,
            1.0,
            false,
            false,
            undefined,
            prefixToApply
          );
          if (e) {
            this.recordEnemySpawn(e, gameTime);
            this.threatBudget = Math.max(0, this.threatBudget - this.getBubakThreatCost(mobId));
          }
        }
      }
    }
  }

  /**
   * Selects a thematic combat prefix based on current level and rozmar archetype.
   * Every prefix retains at least 15% probability.
   */
  public getThematicPrefix(): EnemyPrefixType {
    const isLevel0 = this.levelId === 0;
    const isWinter = this.rozmar.weatherOverride === 'snow' || this.levelId === 3;
    const isCrimson = (this.rozmar as any)?.paletteBias === 'crimson' || this.levelId >= 4;
    const isNightCemetery = this.levelId === 2 || this.rozmar.formationBias === 'architects';

    let weights: Record<EnemyPrefixType, number>;
    if (isLevel0) {
      weights = { vichricovy: 40, kamenny: 35, hromovy: 25, pekelny: 0, vycerpany: 0 };
    } else if (isWinter) {
      weights = { vichricovy: 35, kamenny: 35, pekelny: 15, hromovy: 15, vycerpany: 0 };
    } else if (isCrimson) {
      weights = { pekelny: 40, hromovy: 30, kamenny: 15, vichricovy: 15, vycerpany: 0 };
    } else if (isNightCemetery) {
      weights = { kamenny: 35, hromovy: 30, pekelny: 20, vichricovy: 15, vycerpany: 0 };
    } else {
      weights = { vichricovy: 25, hromovy: 25, kamenny: 25, pekelny: 25, vycerpany: 0 };
    }

    const roll = Math.random() * 100;
    let accum = 0;
    const list: EnemyPrefixType[] = ['vichricovy', 'hromovy', 'kamenny', 'pekelny'];
    for (const p of list) {
      accum += weights[p];
      if (roll < accum) return p;
    }
    return 'vichricovy';
  }

  public spawnPrefixedEnemy(engine: any, player: any, gameTime: number, forcedPrefix?: EnemyPrefixType): any {
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return null;

    const pool = this.getWeightedPool(engine);
    const candidateId = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    const mobId = forcedPrefix ? (candidateId || pool[0] || this.getRegularSpawnFallbackId()) : (pool[Math.floor(Math.random() * pool.length)] || this.getRegularSpawnFallbackId());

    let prefix = forcedPrefix || this.getThematicPrefix();
    if (this.levelId === 0 && prefix === 'pekelny') {
      prefix = 'vichricovy';
    }

    const angle = Math.random() * Math.PI * 2;
    const pos = this.getOffscreenPosition(player, angle, engine, 170);

    const enemy = engine.spawnMonster(mobId, pos.x, pos.y, 1.0, false, false, undefined, prefix);
    if (enemy) {
      this.recordEnemySpawn(enemy, gameTime);
    }
    // Exactly 5x regular tactical mob budget cost (15 instead of 3)
    this.threatBudget = Math.max(0, this.threatBudget - 15);
    return enemy;
  }

  private spawnKlestoveSevreni(engine: any, player: any, gameTime: number): void {
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    const pool = this.getWeightedPool(engine);
    const heavyCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let heavyId = heavyCandidate || pool[0] || this.getRegularSpawnFallbackId();
    // Deploy elite heavy variant only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(heavyId);
      if (elite) heavyId = elite;
    }
    const fastCandidate = pool[pool.length - 1];
    let fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || this.getRegularSpawnFallbackId();
    if (this.threatBudget >= 32) {
      const eliteFast = this.getEliteVariantForId(fastId);
      if (eliteFast) fastId = eliteFast;
    }

    const leaderPrefix = this.dynamicDifficulty >= 3.5 ? this.getThematicPrefix() : undefined;
    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const baseAngle = pAngle + (Math.random() * 0.4 - 0.2);
    const oppositeAngle = baseAngle + Math.PI;

    let spawnedCount = 0;
    // Side 1 outside visible field
    for (let i = -1; i <= 1; i++) {
      if (spawnedCount >= availableSlots) break;
      const a = baseAngle + i * 0.18;
      const pos = this.getOffscreenPosition(player, a, engine, 170 + Math.abs(i) * 25);
      const e = engine.spawnMonster(i === 0 ? heavyId : fastId, pos.x, pos.y, 1.1, false, false, undefined, i === 0 ? leaderPrefix : undefined);
      if (e) {
        e.speed *= 1.1;
        this.recordEnemySpawn(e, gameTime);
        spawnedCount++;
      }
    }

    // Side 2 outside visible field
    for (let i = -1; i <= 1; i++) {
      if (spawnedCount >= availableSlots) break;
      const a = oppositeAngle + i * 0.18;
      const pos = this.getOffscreenPosition(player, a, engine, 170 + Math.abs(i) * 25);
      const e = engine.spawnMonster(i === 0 ? heavyId : fastId, pos.x, pos.y, 1.1);
      if (e) {
        e.speed *= 1.1;
        this.recordEnemySpawn(e, gameTime);
        spawnedCount++;
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 20);
  }

  private spawnHammerAndAnvil(engine: any, player: any, gameTime: number): void {
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    const pool = this.getWeightedPool(engine);
    const heavyCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let heavyId = heavyCandidate || pool[0] || this.getRegularSpawnFallbackId();
    // Deploy elite heavy variant only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(heavyId);
      if (elite) heavyId = elite;
    }
    const fastCandidate = pool[pool.length - 1];
    let fastId = (fastCandidate && ENEMIES[fastCandidate]) ? fastCandidate : pool[0] || this.getRegularSpawnFallbackId();
    if (this.threatBudget >= 32) {
      const eliteFast = this.getEliteVariantForId(fastId);
      if (eliteFast) fastId = eliteFast;
    }

    const leaderPrefix = this.dynamicDifficulty >= 3.5 ? this.getThematicPrefix() : undefined;
    const pAngle = Math.atan2(player.vy || 0, player.vx || 0);
    const frontAngle = pAngle + (Math.random() * 0.4 - 0.2);

    let spawnedCount = 0;
    // Frontal wall (anvil) outside visible field
    const wallCount = 4;
    for (let i = 0; i < wallCount; i++) {
      if (spawnedCount >= availableSlots) break;
      const spreadAngle = frontAngle + ((i - (wallCount - 1) / 2) * 0.14);
      const pos = this.getOffscreenPosition(player, spreadAngle, engine, 180 + Math.abs(i - 1.5) * 20);
      const e = engine.spawnMonster(heavyId, pos.x, pos.y, 1.15, false, false, undefined, (i === 1 && leaderPrefix) ? leaderPrefix : undefined);
      if (e) {
        this.recordEnemySpawn(e, gameTime);
        spawnedCount++;
      }
    }

    // Flankers (hammer) coming from sides outside visible field
    for (const sign of [-1, 1]) {
      if (spawnedCount >= availableSlots) break;
      const fAngle = frontAngle + (Math.PI / 2) * sign;
      const pos = this.getOffscreenPosition(player, fAngle, engine, 170);
      const f = engine.spawnMonster(fastId, pos.x, pos.y, 1.0);
      if (f) {
        f.speed *= 1.15;
        this.recordEnemySpawn(f, gameTime);
        spawnedCount++;
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 18);
  }

  private spawnEscortSwarms(engine: any, player: any, gameTime: number): void {
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    const pool = this.getWeightedPool(engine);
    const eliteCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[0]);
    let eliteId = eliteCandidate || pool[0] || this.getRegularSpawnFallbackId();
    // Deploy elite leader only into heavy tactical encounters
    if (this.threatBudget >= 26) {
      const elite = this.getEliteVariantForId(eliteId);
      if (elite) eliteId = elite;
    }
    const minionCandidate = pool[pool.length - 1];
    let minionId = (minionCandidate && ENEMIES[minionCandidate]) ? minionCandidate : pool[0] || this.getRegularSpawnFallbackId();
    if (this.threatBudget >= 32) {
      const eliteMinion = this.getEliteVariantForId(minionId);
      if (eliteMinion) minionId = eliteMinion;
    }

    const leaderPrefix = this.dynamicDifficulty >= 3.5 ? this.getThematicPrefix() : undefined;
    const angle = Math.random() * Math.PI * 2;
    const centerPos = this.getOffscreenPosition(player, angle, engine, 220);

    let spawnedCount = 0;
    if (spawnedCount < availableSlots) {
      const elite = engine.spawnMonster(eliteId, centerPos.x, centerPos.y, 1.35, false, false, 'Obrněný vůdce', leaderPrefix);
      if (elite) {
        elite.isEscortLeader = true;
        this.recordEnemySpawn(elite, gameTime);
        spawnedCount++;
      }
    }

    // 4 orbit minions around the leader
    for (let i = 0; i < 4; i++) {
      if (spawnedCount >= availableSlots) break;
      const ma = (i / 4) * Math.PI * 2;
      const mx = centerPos.x + Math.cos(ma) * 55;
      const my = centerPos.y + Math.sin(ma) * 55;
      const m = engine.spawnMonster(minionId, mx, my, 0.9);
      if (m) {
        m.isEscortMinion = true;
        this.recordEnemySpawn(m, gameTime);
        spawnedCount++;
      }
    }

    this.threatBudget = Math.max(0, this.threatBudget - 22);
  }

  private spawnArchitects(engine: any, player: any, gameTime: number): void {
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    const pool = this.getWeightedPool(engine);
    const archCandidate = pool.find((id) => id === this.rozmar.preferredEnemyIds[1]);
    const archId = archCandidate || pool[0] || this.getRegularSpawnFallbackId();

    const angle = Math.random() * Math.PI * 2;
    let spawnedCount = 0;
    for (let i = 0; i < 2; i++) {
      if (spawnedCount >= availableSlots) break;
      const a = angle + i * 0.35;
      const pos = this.getOffscreenPosition(player, a, engine, 180);
      const e = engine.spawnMonster(archId, pos.x, pos.y, 1.0);
      if (e) {
        e.isArchitect = true;
        this.recordEnemySpawn(e, gameTime);
        spawnedCount++;
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
    const availableSlots = Math.max(0, this.maxLivingEnemies - this.getEffectiveLivingCount(engine));
    if (availableSlots <= 0) return;

    const pool = this.getWeightedPool(engine);
    const mobId = pool[Math.floor(Math.random() * pool.length)] || this.getRegularSpawnFallbackId();

    const pSpeed = Math.hypot(player.vx || 0, player.vy || 0);
    const pAngle = pSpeed > 10 ? Math.atan2(player.vy || 0, player.vx || 0) : Math.random() * Math.PI * 2;

    let spawnedCount = 0;
    // Spawn 2 enemies directly in lead path outside visible field
    for (let i = -1; i <= 1; i += 2) {
      if (spawnedCount >= availableSlots) break;
      const leadAngle = pAngle + i * 0.20;
      const pos = this.getOffscreenPosition(player, leadAngle, engine, 180);
      const e = engine.spawnMonster(mobId, pos.x, pos.y, 1.05);
      if (e) {
        this.recordEnemySpawn(e, gameTime);
        spawnedCount++;
      }
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
    const bossId = bossCandidate || pool[0] || this.getRegularSpawnFallbackId();
    const furious = engine.spawnMonster(bossId, dira.x, dira.y, 1.45, false, true, '🧌 Procitlý noční hromotluk z díry');
    if (furious) {
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
    const isAllowed = (id: string) => isRegularSpawnAllowedForLevel(id, levelId);

    // Regular enemies must belong to the current phase; level 0 also excludes
    // devils and watermen even when they appear in legacy archetype data.
    const eligible = [...new Set(phasePool)].filter(isAllowed);

    // Keep a valid same-level fallback for incomplete level definitions.
    if (eligible.length === 0) {
      const fallback = [...new Set(curLvl?.spawnPools?.noon || [])].filter(isAllowed);
      if (fallback.length > 0) eligible.push(...fallback);
    }
    if (eligible.length === 0) {
      const preferred = this.rozmar.preferredEnemyIds.filter(isAllowed);
      if (preferred.length > 0) eligible.push(...preferred);
    }
    if (eligible.length === 0) {
      const fallbackId = levelId === 0 ? 'mrazovy_skritek' : 'rarach';
      if (isAllowed(fallbackId)) eligible.push(fallbackId);
    }

    // Elite variants must be valid for this level too, not merely linked to a
    // valid base enemy (e.g. mysak -> krvavy_rarach, blatouch -> kalny_hastrman).
    for (const baseId of [...eligible]) {
      const eliteId = this.getEliteVariantForId(baseId);
      if (eliteId && isAllowed(eliteId) && !eligible.includes(eliteId)) {
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
      killVelocity: Math.round(this.getKillVelocity(3.0) * 10) / 10,
      panicBrakeActive: this.panicBrakeActiveTimer > 0,
      punitiveTwinCooldown: Math.max(0, Math.round(this.punitiveTwinCooldown * 10) / 10),
      vulnerabilityScore: Math.round(this.vulnerabilityScore * 100) / 100,
      dropPacingPhase: this.dropPacingPhase,
    };
  }
}
