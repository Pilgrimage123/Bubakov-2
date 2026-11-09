import {
  MARCH_ARENA_BOUNDS,
  MARCH_THAW_OBSTACLES,
  MARCH_THAW_POIS,
  MARCH_FOREST_ZONES,
  MARCH_THAW_ROOF_ZONES,
  MARCH_POND_REGION,
  MARCH_STREAM_WAYPOINTS,
  isPointInMarchPondWater,
  isPointOnMarchBridge,
  isPointInMarchStreamWater,
  type MarchThawPoi,
  type MarchThawPoiId,
  type MarchObstacle,
  type MarchForestZone,
  type MarchRoofZone,
} from './marchThawArena';

export type UnorPoiId = MarchThawPoiId;
export type UnorPoi = MarchThawPoi;

export const UNOR_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const UNOR_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const UNOR_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const UNOR_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Smažení masopustních koblih v Hostinci U Cikánů
 * for Stage 23 (Day, levelId = 22).
 * Pressing [E] at the tavern kitchen fries fresh carnival doughnuts:
 * restores +45 Kuráž, gives +25% move speed boost for 10 s,
 * and emits a warm aromatic cloud that lures and calms nearby beasts.
 */
export interface MasopustniKoblihyState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  koblihyCooked: number;
  speedBoostTimer: number;
}

export function createInitialMasopustniKoblihyState(): MasopustniKoblihyState {
  return {
    x: 440,
    y: -75,
    radius: 190,
    interactRadius: 190,
    cooldown: 0,
    maxCooldown: 15,
    koblihyCooked: 0,
    speedBoostTimer: 0,
  };
}

/**
 * Interactive Pochovávání basy a rozsvícení loučí ve Staré márnici
 * for Stage 24 (Night, levelId = 23).
 * Pressing [E] at the mortuary drapes the black funeral shroud over the double bass:
 * emits a thunderous sacred shockwave in 260px, stunning all fiends for 3 s,
 * knocks back nearby demons by 200px, and grants +40 Štěstí and freeze immunity for 15 s.
 */
export interface PochovavaniBasyState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  basasBuried: number;
  shockwaveTimer: number;
}

export function createInitialPochovavaniBasyState(): PochovavaniBasyState {
  return {
    x: -800,
    y: -650,
    radius: 200,
    interactRadius: 200,
    cooldown: 0,
    maxCooldown: 15,
    basasBuried: 0,
    shockwaveTimer: 0,
  };
}

export const UNOR_POIS: Record<UnorPoiId, UnorPoi> = {
  fields: {
    id: 'fields',
    title: 'Zasněžená pole s masopustním průvodem',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'ZASNĚŽENÁ POLE: Masopustní veselí a hluboké brázdy zrychlují únik před maškarami (+15 % rychlost).',
  },
  church: {
    id: 'church',
    title: 'Stará márnice a kostel sv. Mikuláše',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'STARÁ MÁRNICE [E]: Pochovej basu — posvátný pohřební ráz omráčí noční běsy a zažene chlad!',
  },
  tavern: {
    id: 'tavern',
    title: 'Hostinec U Cikánů se smaženými koblihami',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSTINEC U CIKÁNŮ [E]: Usmaž horké masopustní koblihy — zhojí +45 Kuráže a zrychlí krok!',
  },
  village: {
    id: 'village',
    title: 'Masopustní náves plná reje a maškar',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'MASOPUSTNÍ NÁVES: Bujará muzika Laufra a Rychtáře dodává odvahu a násobí kritické zásahy (+20 % šance)!',
  },
  school: {
    id: 'school',
    title: 'Škola s dětskou koledou a dřevěnými šavlemi',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLNÍ DVŮR: Šavlový tanec chasníků chrání před útoky ze zálohy (+20 % obrana).',
  },
  pond: {
    id: 'pond',
    title: 'Zamrzlý rybník Brčálník s klouzajícími maškarami',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'ZAMRZLÝ LED: Hladký led zrychluje pohyb (+25 % rychlost bez zpomalení vodou)!',
  },
  mill: {
    id: 'mill',
    title: 'Mlýn s masopustním věncem na vantrokách',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'MLÝNSKÁ HRÁZ: Masivní stavidla kryjí před divokými nápory Bakcha a krasojezdců!',
  },
  forest: {
    id: 'forest',
    title: 'Zimní hvozd s divočáky a medvědáři',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'ZASNĚŽENÝ HVOZD: Husté smrčiny poskytují úkryt před nočním Smrťákem!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka ozdobená masopustním chvojím',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA: Posvěcené chvojí chrání před černou magií a posiluje štít (+80 Štít)!',
  },
};

export const UNOR_NIGHT_POIS: Record<UnorPoiId, UnorPoi> = {
  ...UNOR_POIS,
  church: {
    ...UNOR_POIS.church,
    title: 'Ztichlá márnice před Popeleční středou',
    hint: 'POCHOVÁNÍ BASY [E]: Zahaj smuteční obřad — posvátný hlahol rozmetá noční rej a zastaví Bakcha!',
  },
  tavern: {
    ...UNOR_POIS.tavern,
    title: 'Hospoda s nočním Bakchovým rejem',
    hint: 'HOSTINEC U CIKÁNŮ [E]: Poslední doušek masopustního moku zhojí +45 Kuráže!',
  },
};

export const UNOR_POIS_LIST: UnorPoi[] = Object.values(UNOR_POIS);
export const UNOR_NIGHT_POIS_LIST: UnorPoi[] = Object.values(UNOR_NIGHT_POIS);

export const UNOR_DECOR = [
  { type: 'unor_border', x: 0, y: 0, scale: 1.25 },
  { type: 'unor_fields', x: UNOR_POIS.fields.x, y: UNOR_POIS.fields.y, scale: 1 },
  { type: 'unor_church', x: UNOR_POIS.church.x, y: UNOR_POIS.church.y, scale: 1 },
  { type: 'unor_village', x: UNOR_POIS.village.x, y: UNOR_POIS.village.y, scale: 1 },
  { type: 'unor_tavern', x: UNOR_POIS.tavern.x, y: UNOR_POIS.tavern.y, scale: 1 },
  { type: 'unor_pond', x: UNOR_POIS.pond.x, y: UNOR_POIS.pond.y, scale: 1 },
  { type: 'unor_mill', x: UNOR_POIS.mill.x, y: UNOR_POIS.mill.y, scale: 1 },
  { type: 'unor_forest', x: UNOR_POIS.forest.x, y: UNOR_POIS.forest.y, scale: 1 },
  { type: 'unor_shrine', x: UNOR_POIS.shrine.x, y: UNOR_POIS.shrine.y, scale: 1 },
  { type: 'unor_school', x: UNOR_POIS.school.x, y: UNOR_POIS.school.y, scale: 1 },
] as const;

export const UNOR_NIGHT_DECOR = UNOR_DECOR;

export const UNOR_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'masopustni_kotel_koblih', x: 440, y: -75, shape: 'circle', radius: 46, blocksSight: true },
  { id: 'masopustni_basa_stul', x: -800, y: -650, shape: 'box', halfW: 64, halfH: 44, cornerRadius: 8, blocksSight: true },
  { id: 'masopustni_pivni_sud', x: 480, y: -30, shape: 'circle', radius: 38, blocksSight: true },
  { id: 'masopustni_slama_vuz', x: 80, y: -40, shape: 'box', halfW: 58, halfH: 34, cornerRadius: 6, blocksSight: true },
  { id: 'masopustni_stojan_masek', x: 20, y: -120, shape: 'circle', radius: 28, blocksSight: false },
];

export const UNOR_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...UNOR_SPECIAL_OBSTACLES,
];

export const UNOR_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getUnorPois(isNightOrLevelId: boolean | number = false): Record<UnorPoiId, UnorPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 23 : isNightOrLevelId;
  return isNight ? UNOR_NIGHT_POIS : UNOR_POIS;
}

export function getUnorPoisList(isNightOrLevelId: boolean | number = false): UnorPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 23 : isNightOrLevelId;
  return isNight ? UNOR_NIGHT_POIS_LIST : UNOR_POIS_LIST;
}

export function isInsideUnorPoi(
  x: number,
  y: number,
  poiOrId: UnorPoi | UnorPoiId,
  extraRadiusOrNight: number | boolean = 0,
  isNightOrLevelId: boolean | number = false
): boolean {
  const extraRadius = typeof extraRadiusOrNight === 'number' ? extraRadiusOrNight : 0;
  const isNight = typeof extraRadiusOrNight === 'boolean'
    ? extraRadiusOrNight
    : (typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 23 : Boolean(isNightOrLevelId));
  const poi = typeof poiOrId === 'string' ? getUnorPois(isNight)[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getUnorWaterEffect(x: number, y: number, _levelId: number = 22) {
  // February pond and stream are frozen solid ice under winter carnival: fast sliding, no water slow
  if (isPointOnMarchBridge(x, y)) {
    return { inWater: false, inOpenWater: false, onIce: false, speedMult: 1.0 };
  }
  if (isPointInMarchPondWater(x, y)) {
    return { inWater: false, inOpenWater: false, onIce: true, speedMult: 1.15 };
  }
  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    return { inWater: false, inOpenWater: false, onIce: true, speedMult: 1.10 };
  }
  return { inWater: false, inOpenWater: false, onIce: false, speedMult: 1.0 };
}

export function resolveUnorObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (typeof allowFlyingBypass === 'boolean' && allowFlyingBypass && entity.isFlying) return false;
  const radius = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let hit = false;
  for (const obs of UNOR_OBSTACLES) {
    if (obs.shape === 'circle') {
      const dx = entity.x - obs.x;
      const dy = entity.y - obs.y;
      const minDist = obs.radius + radius;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDist * minDist) {
        hit = true;
        const dist = Math.sqrt(distSq) || 0.001;
        const push = minDist - dist;
        entity.x += (dx / dist) * push;
        entity.y += (dy / dist) * push;
      }
    } else if (obs.shape === 'box') {
      const hw = obs.halfW + radius;
      const hh = obs.halfH + radius;
      const dx = entity.x - obs.x;
      const dy = entity.y - obs.y;
      if (Math.abs(dx) < hw && Math.abs(dy) < hh) {
        hit = true;
        const ox = hw - Math.abs(dx);
        const oy = hh - Math.abs(dy);
        if (ox < oy) {
          entity.x += (dx > 0 ? ox : -ox);
        } else {
          entity.y += (dy > 0 ? oy : -oy);
        }
      }
    }
  }
  return hit;
}
