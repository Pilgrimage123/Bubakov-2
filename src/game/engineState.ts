import type { GameLevelId } from '../types';

export interface EngineState {
  player: any;
  enemies: any[];
  livingEnemies?: any[];
  renderBuffer?: any[];
  projectiles: any[];
  slashes: any[];
  drops: any[];
  decor: any[];
  particles: any[];
  texts: any[];
  smokePuffs: any[];
  camera: { x: number; y: number };
  keys: Record<string, boolean>;
  miniBossSpawned: boolean;
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
  lastStatsSync: number;
}

export function createInitialEngineState(): EngineState {
  return {
    player: null,
    enemies: [],
    projectiles: [],
    slashes: [],
    drops: [],
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
    lastStatsSync: 0
  };
}
