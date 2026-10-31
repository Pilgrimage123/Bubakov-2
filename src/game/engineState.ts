import type { GameLevelId, MilestoneChoice, GameDrop, MetaProgression } from '../types';
import { createGrandfatherRuntime, type GrandfatherRuntimeState } from './grandfatherRuntime';
import type { DynamicLightSource, ShadowZone, LightOccluder } from './storybookLighting';
import { createRareDropTracker, type RareDropTracker, createFolkloreDropTracker, type FolkloreDropTracker, createSwarmDropReservoir, type SwarmDropReservoir, createPendingDropBank, type PendingDropBank } from './drops';
import type { KrajanekCoastingStone, KrajanekFurrow } from './krajanekAbility';

export interface PendingMilestoneChoice {
  weaponId: string;
  rank: 3 | 5 | 8;
  choices: [MilestoneChoice, MilestoneChoice];
}

export interface EngineState {
  meta?: MetaProgression;
  player: any;
  enemies: any[];
  livingEnemies?: any[];
  /** Reused each frame for depth-sorted, visible world entities. */
  renderBuffer: any[];
  projectiles: any[];
  slashes: any[];
  drops: GameDrop[];
  /** Compact overflow bank for rewards waiting for a slot under the 40-drop hard cap. */
  pendingDropBank: PendingDropBank;
  decor: any[];
  particles: any[];
  texts: any[];
  smokePuffs: any[];
  camera: { x: number; y: number };
  keys: Record<string, boolean>;
  miniBossSpawned: boolean;
  flockTreasureDropped?: boolean;
  midBossSpawned: boolean;
  finalBossSpawned: boolean;
  levelVictoryTriggered: boolean;
  activeLevelId: GameLevelId;
  chasnikSpawned: boolean;
  pointsChest: number;
  pointsPotion: number;
  pointsBread: number;
  pointsCoin: number;
  pointsSoul: number;
  blessing: { x: number; y: number; t: number; dur: number } | null;
  cutscene: { type?: 'granny' | 'shepherd' | 'korenarka'; t: number; dur: number; applyAt: number; applied: boolean } | null;
  shepherdStampede: any;
  korenarkaSanctuary: any;
  sukovice: { x: number; y: number; t: number; dur: number; radius: number; outerRadius: number } | null;
  companion: any;
  lastTime: number;
  uiTime: number;
  fleeTimer: number;
  lightningTimer: number;
  lightningFlash: number;
  lightningStrike: { x: number; y: number; time: number } | null;
  nextBossMechanicAt: number;
  currentLang?: string;
  currentPhase?: any;
  gameTime: number;
  kills: number;
  coins: number;
  souls: number;
  chasniks: number;
  dawnVictoryTriggered: boolean;
  flourStormTimer: number;
  mlynarStoneTimer: number;
  mlynarWaveTimer: number;
  mlynarStormTimer: number;
  certMariashCd: number;
  certStompTimer: number;
  certChargeTimer: number;
  spawnTimer: number;
  hejkalHowlTimer: number;
  hejkalSmashTimer: number;
  obrBoulderTimer: number;
  obrQuakeTimer: number;
  rytirHeadTimer: number;
  rytirChargeTimer: number;
  drakBreathTimer: number;
  drakIcicleTimer: number;
  drakTailWhipTimer: number;
  drakWingGustTimer: number;
  drakSwoopTimer: number;
  drakSnoreTimer: number;
  lastStatsSync: number;
  gingerbread: number;
  grandfather: GrandfatherRuntimeState;
  pendingMilestone: PendingMilestoneChoice | null;
  pendingMilestones: PendingMilestoneChoice[];
  timeStopTimer: number;
  lastSpecialDropTime: number;
  swarmReservoir: SwarmDropReservoir;
  killTimestamps: number[];
  screenFlashTimer: number;
  screenFlashColor: string;
  uncollectedGingerbreadValue: number;
  coinFraction?: number;
  gingerbreadFraction?: number;
  dynamicDropLedger?: {
    stolenCoins?: number;
    stolenGingerbread?: number;
    stolenHeals?: number;
    stolenItemsCount?: number;
  };
  director?: any;
  activeRozmar?: any;
  activeHazards?: any[];
  bubackaDira?: any;
  directorAdaptability: number;
  dynamicDifficulty?: number;
  directorTelegraphText: string | null;
  directorTelegraphTimer: number;
  dropFusionTimer: number;
  rareDropTracker: RareDropTracker;
  folkloreDropTracker: FolkloreDropTracker;
  ponocnyFrostTimer: number;
  masopustShockwaveTimer: number;
  activeRareOverlay: { type: string; timer: number; title: string; subtitle: string } | null;
  slivoviceVapor: { x: number; y: number; dirAngle: number; life: number } | null;
  sootFootprints: Array<{ x: number; y: number; life: number; angle: number }>;
  cameraTremorTimer: number;
  cameraTremorIntensity?: number;
  hitstopTimer?: number;
  krajanekCoastingStones?: KrajanekCoastingStone[];
  krajanekFurrows?: KrajanekFurrow[];
  lightSources: DynamicLightSource[];
  petrolejkaLight?: DynamicLightSource | null;
  hromnickaLight?: DynamicLightSource | null;
  grandfatherLight?: DynamicLightSource | null;
  shadowZones: ShadowZone[];
  occluders: LightOccluder[];
  /** Runtime-only state for the fixed Březnové tání arena. */
  marchThaw: {
    bellCooldown: number;
    shrineCharge: number;
    shrineCooldown: number;
    apparitionTimer: number;
    apparitionPulseTimer: number;
    kegCooldown: number;
    floeExposure: number;
    beerPuddle: { x: number; y: number; time: number } | null;
    forestAmbushCooldown: number;
    /** Accumulates elapsed time for 4 Hz local terrain-enemy interactions. */
    terrainHazardTimer: number;
  };
  /** Runtime-only state for Dubnový den (3. úroveň). */
  dubenDen: {
    bellCooldown: number;
    bellWaveTimer: number;
    maypoleWardActive: boolean;
    pollenCloudTimer: number;
    orchardPetalTimer: number;
    weatherPetalTimer: number;
    terrainHazardTimer: number;
  };
  /** Runtime-only state for Květen v Hrusicích (5. úroveň). */
  kveten?: {
    bellCooldown: number;
    kegCooldown: number;
    shrineCooldown: number;
    beerPuddle: { x: number; y: number; time: number } | null;
    maypoleWardActive: boolean;
    weatherPetalTimer: number;
    terrainHazardTimer: number;
  };
  /** Runtime-only state for Červen v Hrusicích (7. úroveň). */
  cerven?: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    weatherHayTimer: number;
  };
  cervenActivePoiPrompt?: string | null;
  holyCircle: { x: number; y: number; radius: number; life: number; active: boolean } | null;
  plumPuddles?: Array<{ x: number; y: number; radius: number; life: number; maxLife: number; slowRatio: number; dead?: boolean }>;
  yolkPuddles?: Array<{ x: number; y: number; radius: number; life: number; maxLife: number; damageTimer: number; dead?: boolean }>;
  crowWave?: any;
  snowmanHorde?: any;
}

export function createInitialEngineState(): EngineState {
  return {
    player: null,
    enemies: [],
    renderBuffer: [],
    projectiles: [],
    slashes: [],
    drops: [],
    pendingDropBank: createPendingDropBank(),
    decor: [],
    particles: [],
    texts: [],
    smokePuffs: [],
    camera: {
      x: 0,
      y: 0
    },
    keys: {},
    miniBossSpawned: false,
    flockTreasureDropped: false,
    midBossSpawned: false,
    finalBossSpawned: false,
    levelVictoryTriggered: false,
    activeLevelId: 1,
    chasnikSpawned: false,
    pointsChest: 0,
    pointsPotion: 0,
    pointsBread: 0,
    pointsCoin: 0,
    pointsSoul: 0,
    blessing: null,
    cutscene: null,
    shepherdStampede: null,
    korenarkaSanctuary: null,
    sukovice: null,
    companion: null,
    lastTime: performance.now(),
    uiTime: 0,
    fleeTimer: 0,
    lightningTimer: 45,
    lightningFlash: 0,
    lightningStrike: null,
    nextBossMechanicAt: 0,
    currentPhase: null,
    gameTime: 0,
    kills: 0,
    coins: 0,
    souls: 0,
    chasniks: 0,
    dawnVictoryTriggered: false,
    flourStormTimer: 0,
    mlynarStoneTimer: 5,
    mlynarWaveTimer: 11,
    mlynarStormTimer: 16,
    certMariashCd: 12,
    certStompTimer: 5,
    certChargeTimer: 8,
    spawnTimer: 2.5,
    hejkalHowlTimer: 6,
    hejkalSmashTimer: 10,
    obrBoulderTimer: 5,
    obrQuakeTimer: 9,
    rytirHeadTimer: 5,
    rytirChargeTimer: 8,
    drakBreathTimer: 5,
    drakIcicleTimer: 8,
    drakTailWhipTimer: 6,
    drakWingGustTimer: 11,
    drakSwoopTimer: 14,
    drakSnoreTimer: 3,
    lastStatsSync: 0,
    gingerbread: 0,
    grandfather: createGrandfatherRuntime(),
    currentLang: 'cs',
    pendingMilestone: null,
    pendingMilestones: [],
    timeStopTimer: 0,
    lastSpecialDropTime: -999,
    swarmReservoir: createSwarmDropReservoir(),
    killTimestamps: [],
    screenFlashTimer: 0,
    screenFlashColor: '#FFFFFF',
    uncollectedGingerbreadValue: 0,
    coinFraction: 0,
    gingerbreadFraction: 0,
    director: null,
    activeRozmar: null,
    activeHazards: [],
    bubackaDira: null,
    directorAdaptability: 3.0,
    dynamicDifficulty: 3.0,
    directorTelegraphText: null,
    directorTelegraphTimer: 0,
    dropFusionTimer: 0,
    rareDropTracker: createRareDropTracker(),
    folkloreDropTracker: createFolkloreDropTracker(),
    ponocnyFrostTimer: 0,
    masopustShockwaveTimer: 0,
    activeRareOverlay: null,
    slivoviceVapor: null,
    sootFootprints: [],
    cameraTremorTimer: 0,
    cameraTremorIntensity: 10,
    hitstopTimer: 0,
    krajanekCoastingStones: [],
    krajanekFurrows: [],
    lightSources: [],
    petrolejkaLight: null,
    hromnickaLight: null,
    grandfatherLight: null,
    shadowZones: [],
    occluders: [],
    marchThaw: {
      bellCooldown: 0,
      shrineCharge: 0,
      shrineCooldown: 0,
      apparitionTimer: 0,
      apparitionPulseTimer: 0,
      kegCooldown: 0,
      floeExposure: 0,
      beerPuddle: null,
      forestAmbushCooldown: 0,
      terrainHazardTimer: 0,
    },
    dubenDen: {
      bellCooldown: 0,
      bellWaveTimer: 0,
      maypoleWardActive: false,
      pollenCloudTimer: 0,
      orchardPetalTimer: 0,
      weatherPetalTimer: 0,
      terrainHazardTimer: 0,
    },
    kveten: {
      bellCooldown: 0,
      kegCooldown: 0,
      shrineCooldown: 0,
      beerPuddle: null,
      maypoleWardActive: false,
      weatherPetalTimer: 0,
      terrainHazardTimer: 0,
    },
    holyCircle: null,
    plumPuddles: [],
    yolkPuddles: [],
  };
}
