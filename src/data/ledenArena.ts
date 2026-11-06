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

export type LedenPoiId = MarchThawPoiId;
export type LedenPoi = MarchThawPoi;

export const LEDEN_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const LEDEN_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const LEDEN_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const LEDEN_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Stavění sněhuláka na návsi
 * for Stage 21 (Day, levelId = 20).
 * Pressing [E] at the village fountain builds a defensive snowman:
 * emits a resonant icy shockwave in 220px, restores +30 Kuráž,
 * and knocks back fiends by 150px.
 */
export interface SnehulakNavesState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  snowmenBuilt: number;
  snowShieldTimer: number;
}

export function createInitialSnehulakNavesState(): SnehulakNavesState {
  return {
    x: 50,
    y: -75,
    radius: 180,
    interactRadius: 180,
    cooldown: 0,
    maxCooldown: 15,
    snowmenBuilt: 0,
    snowShieldTimer: 0,
  };
}

/**
 * Interactive Posvěcení dveří křídou K+M+B na faře
 * for Stage 22 (Night, levelId = 21).
 * Pressing [E] at the parsonage doors chalks the sacred K+M+B inscription:
 * triggers a holy ward that stuns all unholy demons in 250px for 3 s
 * and grants +40 Štěstí and freeze immunity for 15 s.
 */
export interface TrikralovaFaraState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  blessingsCount: number;
  holyAuraTimer: number;
}

export function createInitialTrikralovaFaraState(): TrikralovaFaraState {
  return {
    x: -800,
    y: -650,
    radius: 190,
    interactRadius: 190,
    cooldown: 0,
    maxCooldown: 15,
    blessingsCount: 0,
    holyAuraTimer: 0,
  };
}

export const LEDEN_POIS: Record<LedenPoiId, LedenPoi> = {
  fields: {
    id: 'fields',
    title: 'Zasněžená pole v hlubokých závějích',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'ZASNĚŽENÁ POLE: Hluboké bílé závěje tlumí hluk a kryjí před střelami (+20 % obrana).',
  },
  church: {
    id: 'church',
    title: 'Fara u sv. Mikuláše se svěcenou křídou K+M+B',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'FARA U KOSTELA [E]: Napiš K+M+B svěcenou křídou — posvátná moc omráčí běsy a zažene chlad!',
  },
  tavern: {
    id: 'tavern',
    title: 'Hostinec U Cikánů se svařeným vínem a kamny',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSTINEC U CIKÁNŮ [E]: Horký čaj s medem u kachlových kamen zhojí +45 Kuráže!',
  },
  village: {
    id: 'village',
    title: 'Zasněžená náves se sněhulákem u kašny',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES U KAŠNY [E]: Postav sněhuláka — rázová vlna odrazí běsy a vyléčí lovce (+30 Kuráže)!',
  },
  school: {
    id: 'school',
    title: 'Zasněžená škola s tříkrálovým průvodem',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLA S KOLEDNÍKY: Tříkrálová koleda rozveselí srdce a zrychlí krok o +20 %!',
  },
  pond: {
    id: 'pond',
    title: 'Zamrzlý rybník Brčálník s hladkým kluzištěm',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'ZAMRZLÝ LED: Pevný hladký led zrychluje pohyb (+25 % rychlost běhu bez zpomalení vodou)!',
  },
  mill: {
    id: 'mill',
    title: 'Zasněžený mlýn s rampouchy na vantrokách',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'MLÝNSKÉ ZÁVĚTŘÍ: Masivní dřevěná stavidla kryjí před vánicí (+20 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Hluboký hvozd v tichých sněhových závějích',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'ZIMNÍ HVOZD: Zasněžené smrčiny poskytují útočiště před noční Perchtou!',
  },
  shrine: {
    id: 'shrine',
    title: 'Zasypaná Boží muka s věčným světlem',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA: Svaté světlo lucerny chrání před mrazivými kouzly a posiluje štít!',
  },
};

export const LEDEN_NIGHT_POIS: Record<LedenPoiId, LedenPoi> = {
  ...LEDEN_POIS,
  church: {
    ...LEDEN_POIS.church,
    title: 'Ztichlá fara v mrazivé tříkrálové noci',
    hint: 'SVĚCENÁ KŘÍDA [E]: Posvěť dveře křídou K+M+B — odrazí Šerednou Perchtu a omráčí běsy!',
  },
};

export const LEDEN_POIS_LIST: LedenPoi[] = Object.values(LEDEN_POIS);
export const LEDEN_NIGHT_POIS_LIST: LedenPoi[] = Object.values(LEDEN_NIGHT_POIS);

export const LEDEN_DECOR = [
  { type: 'leden_border', x: 0, y: 0, scale: 1.25 },
  { type: 'leden_fields', x: LEDEN_POIS.fields.x, y: LEDEN_POIS.fields.y, scale: 1 },
  { type: 'leden_church', x: LEDEN_POIS.church.x, y: LEDEN_POIS.church.y, scale: 1 },
  { type: 'leden_village', x: LEDEN_POIS.village.x, y: LEDEN_POIS.village.y, scale: 1 },
  { type: 'leden_tavern', x: LEDEN_POIS.tavern.x, y: LEDEN_POIS.tavern.y, scale: 1 },
  { type: 'leden_pond', x: LEDEN_POIS.pond.x, y: LEDEN_POIS.pond.y, scale: 1 },
  { type: 'leden_mill', x: LEDEN_POIS.mill.x, y: LEDEN_POIS.mill.y, scale: 1 },
  { type: 'leden_forest', x: LEDEN_POIS.forest.x, y: LEDEN_POIS.forest.y, scale: 1 },
  { type: 'leden_shrine', x: LEDEN_POIS.shrine.x, y: LEDEN_POIS.shrine.y, scale: 1 },
  { type: 'leden_school', x: LEDEN_POIS.school.x, y: LEDEN_POIS.school.y, scale: 1 },
] as const;

export const LEDEN_NIGHT_DECOR = LEDEN_DECOR;

export const LEDEN_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'snehulak_naves', x: 50, y: -75, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'sane_sankari', x: 120, y: -40, shape: 'box', halfW: 52, halfH: 30, cornerRadius: 6, blocksSight: true },
  { id: 'fara_dvere', x: -800, y: -650, shape: 'box', halfW: 60, halfH: 60, cornerRadius: 10, blocksSight: true },
  { id: 'snop_slamy_zavej', x: -680, y: 160, shape: 'circle', radius: 36, blocksSight: true },
  { id: 'kolednicky_stojan', x: 30, y: -130, shape: 'circle', radius: 28, blocksSight: false },
];

export const LEDEN_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...LEDEN_SPECIAL_OBSTACLES,
];

export const LEDEN_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getLedenPois(isNightOrLevelId: boolean | number = false): Record<LedenPoiId, LedenPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 21 : isNightOrLevelId;
  return isNight ? LEDEN_NIGHT_POIS : LEDEN_POIS;
}

export function getLedenPoisList(isNightOrLevelId: boolean | number = false): LedenPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 21 : isNightOrLevelId;
  return isNight ? LEDEN_NIGHT_POIS_LIST : LEDEN_POIS_LIST;
}

export function isInsideLedenPoi(
  x: number,
  y: number,
  poiOrId: LedenPoi | LedenPoiId,
  isNightOrLevelId: boolean | number = false
): boolean {
  const poi = typeof poiOrId === 'string' ? getLedenPois(isNightOrLevelId)[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  return dx * dx + dy * dy <= poi.radius * poi.radius;
}

export function getLedenWaterEffect(x: number, y: number, _levelId: number = 20) {
  // January pond and stream are frozen solid ice: fast sliding, no water slow
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

export function resolveLedenObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (typeof allowFlyingBypass === 'boolean' && allowFlyingBypass && entity.isFlying) return false;
  const radius = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let hit = false;
  for (const obs of LEDEN_OBSTACLES) {
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
