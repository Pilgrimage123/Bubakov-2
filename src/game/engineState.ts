import type { GameLevelId, MilestoneChoice, GameDrop, MetaProgression } from '../types';
import { createGrandfatherRuntime, type GrandfatherRuntimeState } from './grandfatherRuntime';
import type { DynamicLightSource, ShadowZone, LightOccluder } from './storybookLighting';
import { createRareDropTracker, type RareDropTracker, createFolkloreDropTracker, type FolkloreDropTracker, createSwarmDropReservoir, type SwarmDropReservoir, createPendingDropBank, type PendingDropBank } from './drops';
import type { KrajanekCoastingStone, KrajanekFurrow } from './krajanekAbility';
import {
  createInitialSvatojanskeByliny,
  createInitialSvatojanskyPoklad,
  type SvatojanskaBylinaState,
  type SvatojanskyPokladState,
} from '../data/cervenArena';
import {
  createInitialPoutniStrelnice,
  type PoutniStrelniceState,
} from '../data/cervenecArena';
import {
  createInitialChlebovaPec,
  createInitialVavrineckaVatra,
  type ChlebovaPecState,
  type VavrineckaVatraState,
} from '../data/srpenArena';
import {
  createInitialKotelNaPovidlaState,
  createInitialSvatovaclavskyOhenState,
  type KotelNaPovidlaState,
  type SvatovaclavskyOhenState,
} from '../data/zariArena';
import {
  createInitialOhnicekBramborState,
  createInitialDusickovaSviceState,
  type OhnicekBramborState,
  type DusickovaSviceState,
} from '../data/rijenArena';
import {
  createInitialSvatomartinskaHusaPekacState,
  createInitialUhliarskyMilirState,
  type SvatomartinskaHusaPekacState,
  type UhliarskyMilirState,
} from '../data/listopadArena';
import {
  createInitialAdventniVenecState,
  createInitialStedrovecerniZvonState,
  type AdventniVenecState,
  type StedrovecerniZvonState,
} from '../data/prosinecArena';
import {
  createInitialSnehulakNavesState,
  createInitialTrikralovaFaraState,
  type SnehulakNavesState,
  type TrikralovaFaraState,
} from '../data/ledenArena';
import {
  createInitialMasopustniKoblihyState,
  createInitialPochovavaniBasyState,
  type MasopustniKoblihyState,
  type PochovavaniBasyState,
} from '../data/unorArena';

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
  certovaBabickaArena?: { x: number; y: number; radius: number; active: boolean; bushAngle?: number } | null;
  certovaBabickaGraceTimer?: number;
  zakletaPrinceznaArena?: {
    x: number;
    y: number;
    radius: number;
    active: boolean;
    nightStage: number;
    timer: number;
  } | null;
  zakletaPrinceznaGraceTimer?: number;
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
  kvetenActivePoiPrompt?: string | null;
  /** Runtime-only state for Červen v Hrusicích (7. a 8. úroveň). */
  cerven?: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    weatherHayTimer: number;
    herbs?: SvatojanskaBylinaState[];
    herbsCollected?: number;
    herbsTarget?: number;
    poklad?: SvatojanskyPokladState;
    svatojanskaZareTimer?: number;
  };
  cervenActivePoiPrompt?: string | null;
  /** Runtime-only state for Červenec v Hrusicích (9. a 10. úroveň). */
  cervenec: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    strelnice: PoutniStrelniceState;
    stormBoltTimer: number;
    stormWarning?: { x: number; y: number; radius: number; timer: number; maxTimer?: number } | null;
    weatherChaffTimer?: number;
  };
  cervenecActivePoiPrompt?: string | null;
  /** Runtime-only state for Srpen v Hrusicích (11. a 12. úroveň). */
  srpen: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    chlebovaPec: ChlebovaPecState;
    vatra: VavrineckaVatraState;
    perseidsShowerTimer?: number;
    activePerseids?: Array<{ x: number; y: number; radius: number; timer: number; maxTimer: number }>;
  };
  srpenActivePoiPrompt?: string | null;
  /** Runtime-only state for Září v Hrusicích (13. a 14. úroveň). */
  zari: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    kotel: KotelNaPovidlaState;
    ohen: SvatovaclavskyOhenState;
  };
  zariActivePoiPrompt?: string | null;
  /** Runtime-only state for Říjen v Hrusicích (15. a 16. úroveň). */
  rijen: {
    bellCooldown: number;
    shrineCooldown: number;
    tavernCooldown: number;
    forestCooldown: number;
    ohnicek: OhnicekBramborState;
    svice: DusickovaSviceState;
  };
  rijenActivePoiPrompt?: string | null;
  /** Runtime-only state for Listopad v Hrusicích (17. a 18. úroveň). */
  listopad: {
    tavernCooldown: number;
    shrineCooldown: number;
    schoolCooldown: number;
    forestCooldown: number;
    bellCooldown?: number;
    husaPekac: SvatomartinskaHusaPekacState;
    milir: UhliarskyMilirState;
  };
  listopadActivePoiPrompt?: string | null;
  /** Runtime-only state for Prosinec v Hrusicích (19. a 20. úroveň). */
  prosinec: {
    bellCooldown: number;
    churchCooldown?: number;
    shrineCooldown: number;
    tavernCooldown: number;
    schoolCooldown: number;
    forestCooldown?: number;
    advent: AdventniVenecState;
    zvon: StedrovecerniZvonState;
  };
  prosinecActivePoiPrompt?: string | null;
  /** Runtime-only state for Leden v Hrusicích (21. a 22. úroveň). */
  leden: {
    bellCooldown: number;
    churchCooldown?: number;
    shrineCooldown: number;
    tavernCooldown: number;
    schoolCooldown: number;
    forestCooldown?: number;
    snehulak: SnehulakNavesState;
    fara: TrikralovaFaraState;
  };
  ledenActivePoiPrompt?: string | null;
  /** Runtime-only state for Únor v Hrusicích (23. a 24. úroveň). */
  unor: {
    tavernCooldown: number;
    mortuaryCooldown?: number;
    shrineCooldown: number;
    koblihy: MasopustniKoblihyState;
    basa: PochovavaniBasyState;
  };
  unorActivePoiPrompt?: string | null;
  marchThawActivePoiPrompt?: string | null;
  dubenActivePoiPrompt?: string | null;
  holyCircle: { x: number; y: number; radius: number; life: number; active: boolean } | null;
  plumPuddles?: Array<{ x: number; y: number; radius: number; life: number; maxLife: number; slowRatio: number; dead?: boolean }>;
  plumPuddlesHead?: number;
  yolkPuddles?: Array<{ x: number; y: number; radius: number; life: number; maxLife: number; damageTimer: number; dead?: boolean }>;
  yolkPuddlesHead?: number;
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
    certovaBabickaArena: null,
    certovaBabickaGraceTimer: 0,
    zakletaPrinceznaArena: null,
    zakletaPrinceznaGraceTimer: 0,
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
    cerven: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      weatherHayTimer: 0,
      herbs: createInitialSvatojanskeByliny(),
      herbsCollected: 0,
      herbsTarget: 9,
      poklad: createInitialSvatojanskyPoklad(),
      svatojanskaZareTimer: 0,
    },
    cervenec: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      strelnice: createInitialPoutniStrelnice(),
      stormBoltTimer: 16,
    },
    srpen: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      chlebovaPec: createInitialChlebovaPec(),
      vatra: createInitialVavrineckaVatra(),
      perseidsShowerTimer: 7.5,
      activePerseids: [],
    },
    zari: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      kotel: createInitialKotelNaPovidlaState(),
      ohen: createInitialSvatovaclavskyOhenState(),
    },
    rijen: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      forestCooldown: 0,
      ohnicek: createInitialOhnicekBramborState(),
      svice: createInitialDusickovaSviceState(),
    },
    listopad: {
      tavernCooldown: 0,
      shrineCooldown: 0,
      schoolCooldown: 0,
      forestCooldown: 0,
      husaPekac: createInitialSvatomartinskaHusaPekacState(),
      milir: createInitialUhliarskyMilirState(),
    },
    prosinec: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      schoolCooldown: 0,
      advent: createInitialAdventniVenecState(),
      zvon: createInitialStedrovecerniZvonState(),
    },
    leden: {
      bellCooldown: 0,
      shrineCooldown: 0,
      tavernCooldown: 0,
      schoolCooldown: 0,
      snehulak: createInitialSnehulakNavesState(),
      fara: createInitialTrikralovaFaraState(),
    },
    unor: {
      tavernCooldown: 0,
      mortuaryCooldown: 0,
      shrineCooldown: 0,
      koblihy: createInitialMasopustniKoblihyState(),
      basa: createInitialPochovavaniBasyState(),
    },
    holyCircle: null,
    marchThawActivePoiPrompt: null,
    dubenActivePoiPrompt: null,
    kvetenActivePoiPrompt: null,
    cervenActivePoiPrompt: null,
    cervenecActivePoiPrompt: null,
    srpenActivePoiPrompt: null,
    zariActivePoiPrompt: null,
    rijenActivePoiPrompt: null,
    listopadActivePoiPrompt: null,
    prosinecActivePoiPrompt: null,
    ledenActivePoiPrompt: null,
    unorActivePoiPrompt: null,
    plumPuddles: [],
    plumPuddlesHead: 0,
    yolkPuddles: [],
    yolkPuddlesHead: 0,
  };
}
