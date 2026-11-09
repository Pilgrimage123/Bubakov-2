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

export type ProsinecPoiId = MarchThawPoiId;
export type ProsinecPoi = MarchThawPoi;

export const PROSINEC_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const PROSINEC_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const PROSINEC_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const PROSINEC_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Adventní věnec na návsi u lípy
 * for Stage 19 (Day, levelId = 18).
 * Pressing [E] at the village tree lights the holy Advent candle:
 * emits a radiant golden warmth in 420px that burns demons and devils,
 * clears negative debuffs, and grants +50 Kuráž, +25 % útok and +30 % zbroj for 18 s.
 */
export interface AdventniVenecState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  candlesLit: number;
  lightAuraTimer: number;
  lightTimer?: number;
}

export function createInitialAdventniVenecState(): AdventniVenecState {
  return {
    x: 50,
    y: -75,
    radius: 180,
    interactRadius: 180,
    cooldown: 0,
    maxCooldown: 20,
    candlesLit: 0,
    lightAuraTimer: 0,
    lightTimer: 0,
  };
}

/**
 * Interactive Štědrovečerní zvon v kostele sv. Mikuláše
 * for Stage 20 (Night, levelId = 19).
 * Pressing [E] at the church tolls the sacred Christmas bell:
 * sends an arena-wide resonant shockwave (radius 600px) that stuns and damages
 * all winter fiends, while granting +120 Svatý štít, +35 % dobíjení and total freeze immunity for 18 s.
 */
export interface StedrovecerniZvonState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  bellsTolled: number;
  timesRung?: number;
  bellWaveTimer: number;
  chimeTimer?: number;
}

export function createInitialStedrovecerniZvonState(): StedrovecerniZvonState {
  return {
    x: -800,
    y: -650,
    radius: 190,
    interactRadius: 190,
    cooldown: 0,
    maxCooldown: 20,
    bellsTolled: 0,
    timesRung: 0,
    bellWaveTimer: 0,
    chimeTimer: 0,
  };
}

export const PROSINEC_POIS: Record<ProsinecPoiId, ProsinecPoi> = {
  fields: {
    id: 'fields',
    title: 'Zasněžená pole a závěje',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'ZASNĚŽENÁ POLE: Hluboké bílé závěje tlumí hluk a kryjí před střelami (+20 % obrana).',
  },
  church: {
    id: 'church',
    title: 'Kostel sv. Mikuláše s vánočním zvonem',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'KOSTEL SV. MIKULÁŠE [E]: Zvonění plaší čerty, láme mráz a udělí +120 svatý štít!',
  },
  tavern: {
    id: 'tavern',
    title: 'Vyhřátý šenk U Sejků se svařeným vínem',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'ŠENK U SEJKŮ [E]: Horký punč a vánočka u kachlových kamen zhojí +50 Kuráže!',
  },
  village: {
    id: 'village',
    title: 'Zasněžená náves s adventním věncem',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'ADVENTNÍ LÍPA [E]: Zapal adventní svíci — posvátné světlo spálí čerty (+50 HP, +25 % útok)!',
  },
  school: {
    id: 'school',
    title: 'Zasněžená škola s vánočním betlémem',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'BETLÉM U ŠKOLY [E]: Koledy dodají klid mysli a zrychlí krok o +22 %!',
  },
  pond: {
    id: 'pond',
    title: 'Zcela zamrzlý rybník Brčálník s hladkým ledem',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'ZAMRZLÝ LED: Pevný hladký led zrychluje pohyb (+25 % rychlost běhu bez zpomalení vodou)!',
  },
  mill: {
    id: 'mill',
    title: 'Zamrzlý mlýn s rampouchy na kole',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'ZAMRZLÝ MLÝN: Závětří za náhonem chrání před mrazivým vichrem (+20 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Hluboký hvozd v tichém sněhu',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'ZIMNÍ HVOZD: Zasněžené smrčiny poskytují útočiště před vánicí!',
  },
  shrine: {
    id: 'shrine',
    title: 'Zasněžená Boží muka se svíčkou v lucerně',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Štědrovečerní požehnání přitáhne vánoční dárky a propůjčí +95 štít!',
  },
};

export const PROSINEC_NIGHT_POIS: Record<ProsinecPoiId, ProsinecPoi> = {
  ...PROSINEC_POIS,
  church: {
    ...PROSINEC_POIS.church,
    title: 'Zasněžený kostel o půlnoční mši',
    hint: 'ŠTĚDROVEČERNÍ ZVON [E]: Rozezvuč velký zvon — mocná vlna omráčí běsy a udělí +120 štít & nezranitelnost!',
  },
};

export const PROSINEC_POIS_LIST: ProsinecPoi[] = Object.values(PROSINEC_POIS);
export const PROSINEC_NIGHT_POIS_LIST: ProsinecPoi[] = Object.values(PROSINEC_NIGHT_POIS);

export const PROSINEC_DECOR = [
  { type: 'prosinec_border', x: 0, y: 0, scale: 1.25 },
  { type: 'prosinec_fields', x: PROSINEC_POIS.fields.x, y: PROSINEC_POIS.fields.y, scale: 1 },
  { type: 'prosinec_church', x: PROSINEC_POIS.church.x, y: PROSINEC_POIS.church.y, scale: 1 },
  { type: 'prosinec_village', x: PROSINEC_POIS.village.x, y: PROSINEC_POIS.village.y, scale: 1 },
  { type: 'prosinec_tavern', x: PROSINEC_POIS.tavern.x, y: PROSINEC_POIS.tavern.y, scale: 1 },
  { type: 'prosinec_pond', x: PROSINEC_POIS.pond.x, y: PROSINEC_POIS.pond.y, scale: 1 },
  { type: 'prosinec_mill', x: PROSINEC_POIS.mill.x, y: PROSINEC_POIS.mill.y, scale: 1 },
  { type: 'prosinec_forest', x: PROSINEC_POIS.forest.x, y: PROSINEC_POIS.forest.y, scale: 1 },
  { type: 'prosinec_shrine', x: PROSINEC_POIS.shrine.x, y: PROSINEC_POIS.shrine.y, scale: 1 },
  { type: 'prosinec_school', x: PROSINEC_POIS.school.x, y: PROSINEC_POIS.school.y, scale: 1 },
] as const;

export const PROSINEC_NIGHT_DECOR = PROSINEC_DECOR;

export const PROSINEC_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'adventni_venec', x: 50, y: -75, shape: 'circle', radius: 42, blocksSight: false },
  { id: 'snehulak_naves', x: 110, y: -50, shape: 'circle', radius: 38, blocksSight: true },
  { id: 'betlem_pristresek', x: 20, y: -130, shape: 'box', halfW: 54, halfH: 38, cornerRadius: 8, blocksSight: true },
  { id: 'sane_se_drevem', x: -700, y: 150, shape: 'box', halfW: 58, halfH: 32, cornerRadius: 6, blocksSight: true },
  { id: 'zvonice_kostel', x: -800, y: -650, shape: 'box', halfW: 60, halfH: 60, cornerRadius: 10, blocksSight: true },
];

export const PROSINEC_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...PROSINEC_SPECIAL_OBSTACLES,
];

export const PROSINEC_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getProsinecPois(isNightOrLevelId: boolean | number = false): Record<ProsinecPoiId, ProsinecPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 19 : isNightOrLevelId;
  return isNight ? PROSINEC_NIGHT_POIS : PROSINEC_POIS;
}

export function getProsinecPoisList(isNightOrLevelId: boolean | number = false): ProsinecPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 19 : isNightOrLevelId;
  return isNight ? PROSINEC_NIGHT_POIS_LIST : PROSINEC_POIS_LIST;
}

export function isInsideProsinecPoi(
  x: number,
  y: number,
  poiOrId: ProsinecPoi | ProsinecPoiId,
  extraRadiusOrNight: number | boolean = 0,
  isNightOrLevelId: boolean | number = false
): boolean {
  const extraRadius = typeof extraRadiusOrNight === 'number' ? extraRadiusOrNight : 0;
  const isNight = typeof extraRadiusOrNight === 'boolean'
    ? extraRadiusOrNight
    : (typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 19 : Boolean(isNightOrLevelId));
  const poi = typeof poiOrId === 'string' ? getProsinecPois(isNight)[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getProsinecWaterEffect(x: number, y: number, _levelId: number = 18) {
  // December pond and stream are frozen solid ice: fast sliding, no water slow
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

export function resolveProsinecObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (typeof allowFlyingBypass === 'boolean' && allowFlyingBypass && entity.isFlying) return false;
  const radius = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let hit = false;
  for (const obs of PROSINEC_OBSTACLES) {
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
