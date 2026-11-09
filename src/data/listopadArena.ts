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

export type ListopadPoiId = MarchThawPoiId;
export type ListopadPoi = MarchThawPoi;

export const LISTOPAD_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const LISTOPAD_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const LISTOPAD_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const LISTOPAD_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Svatomartinská pečená husa v hospodě U Sejků
 * for Stage 17 (Day, levelId = 16).
 * Pressing [E] at the tavern offers a taste of hot roast goose with red cabbage:
 * grants +45 Kuráž, +25 % útok, +20 % dobíjení and scattered garlic heat waves
 * that damage surrounding enemies in 380px for 18 s.
 */
export interface SvatomartinskaHusaPekacState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  feastsEaten: number;
  feastsServed?: number;
  heatBurstTimer: number;
  roastTimer?: number;
}

export function createInitialSvatomartinskaHusaPekacState(): SvatomartinskaHusaPekacState {
  return {
    x: 440,
    y: -75,
    radius: 180,
    interactRadius: 180,
    cooldown: 0,
    maxCooldown: 20,
    feastsEaten: 0,
    feastsServed: 0,
    heatBurstTimer: 0,
    roastTimer: 0,
  };
}

/**
 * Interactive Uhlířský milíř v hlubokém hvozdu
 * for Stage 18 (Night, levelId = 17).
 * Pressing [E] at the forest kiln feeds seasoned beechwood into the fire:
 * releases thick aromatic smoke and scatters glowing charcoal embers in 440px
 * that burns and blinds nocturnal beasts, while granting +90 Štít, +25 % zbroj and +30 % rychlost.
 */
export interface UhliarskyMilirState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  woodFed: number;
  smokeTimer: number;
  burnTimer?: number;
  smokesActive?: number;
  embersTimer: number;
}

export function createInitialUhliarskyMilirState(): UhliarskyMilirState {
  return {
    x: 650,
    y: 725,
    radius: 185,
    interactRadius: 185,
    cooldown: 0,
    maxCooldown: 20,
    woodFed: 0,
    smokeTimer: 0,
    burnTimer: 0,
    smokesActive: 0,
    embersTimer: 0,
  };
}

export const LISTOPAD_POIS: Record<ListopadPoiId, ListopadPoi> = {
  fields: {
    id: 'fields',
    title: 'Sychravá polní strniště a řepné brázdy',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'POLNÍ LÁNY: Zmrzlé řepné brázdy zpomalují běžce, krytí za kupkami natě (+18 % obrana).',
  },
  church: {
    id: 'church',
    title: 'Kostel sv. Mikuláše s holými lipami',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'KOSTEL SV. MIKULÁŠE [E]: Zazvonění na zvon plaší hejna a propůjčí +75 svatý štít!',
  },
  tavern: {
    id: 'tavern',
    title: 'Hospoda U Sejků se svatomartinskou husou',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'ŠENK U SEJKŮ [E]: Ochutnej pečenou husu — posilující žár (+45 HP, +25 % útok, +20 % dobíjení)!',
  },
  village: {
    id: 'village',
    title: 'Náves s ranní jinovatkou a louží',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES: Kluzká ranní jinovatka kolem lípy, pozor na splašené husy ze dvora!',
  },
  school: {
    id: 'school',
    title: 'Obecní škola s dýmajícím komínem',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLNÍ SAD [E]: Teplý bylinkový čaj zhojí +30 Kuráže a zrychlí krok (+20 % rychlost)!',
  },
  pond: {
    id: 'pond',
    title: 'Zamrzající rybník Brčálník s prvním ledem',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'BRČÁLNÍK: První tenký led křupe pod nohama, z rákosí syčí chladná voda!',
  },
  mill: {
    id: 'mill',
    title: 'Vodní mlýn s ranní mlhou na náhonu',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'HRUSICKÝ MLÝN: Dubové lávky chrání před chladným proudem (+18 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Listopadový hvozd s uhlířským milířem',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'HVOZD [E]: Uhlířský milíř hřeje prokřehlé lovce a dýmem odhání lesní běsy!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka v podzimní jinovatce',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Modlitba za poutníky přitáhne mince z okolí a dodá +85 štít!',
  },
};

export const LISTOPAD_NIGHT_POIS: Record<ListopadPoiId, ListopadPoi> = {
  ...LISTOPAD_POIS,
  tavern: {
    ...LISTOPAD_POIS.tavern,
    title: 'Vyhřátý šenk uprostřed listopadové tmy',
    hint: 'ŠENK U SEJKŮ [E]: Džbánek teplé medoviny zhojí +45 Kuráže a dodá +25 % útok!',
  },
  forest: {
    ...LISTOPAD_POIS.forest,
    title: 'Tmavý hvozd s plápolajícím milířem',
    hint: 'UHLÍŘSKÝ MILÍŘ [E]: Přilož do milíře — žhavé uhlíky spálí běsy a rozeženou noční mlhu!',
  },
};

export const LISTOPAD_POIS_LIST: ListopadPoi[] = Object.values(LISTOPAD_POIS);
export const LISTOPAD_NIGHT_POIS_LIST: ListopadPoi[] = Object.values(LISTOPAD_NIGHT_POIS);

export const LISTOPAD_DECOR = [
  { type: 'listopad_border', x: 0, y: 0, scale: 1.25 },
  { type: 'listopad_fields', x: LISTOPAD_POIS.fields.x, y: LISTOPAD_POIS.fields.y, scale: 1 },
  { type: 'listopad_church', x: LISTOPAD_POIS.church.x, y: LISTOPAD_POIS.church.y, scale: 1 },
  { type: 'listopad_village', x: LISTOPAD_POIS.village.x, y: LISTOPAD_POIS.village.y, scale: 1 },
  { type: 'listopad_tavern', x: LISTOPAD_POIS.tavern.x, y: LISTOPAD_POIS.tavern.y, scale: 1 },
  { type: 'listopad_pond', x: LISTOPAD_POIS.pond.x, y: LISTOPAD_POIS.pond.y, scale: 1 },
  { type: 'listopad_mill', x: LISTOPAD_POIS.mill.x, y: LISTOPAD_POIS.mill.y, scale: 1 },
  { type: 'listopad_forest', x: LISTOPAD_POIS.forest.x, y: LISTOPAD_POIS.forest.y, scale: 1 },
  { type: 'listopad_shrine', x: LISTOPAD_POIS.shrine.x, y: LISTOPAD_POIS.shrine.y, scale: 1 },
  { type: 'listopad_school', x: LISTOPAD_POIS.school.x, y: LISTOPAD_POIS.school.y, scale: 1 },
] as const;

export const LISTOPAD_NIGHT_DECOR = LISTOPAD_DECOR;

export const LISTOPAD_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'svatomartinsky_pekac', x: 440, y: -75, shape: 'circle', radius: 40, blocksSight: false },
  { id: 'sud_mladeho_vina', x: 400, y: -120, shape: 'box', halfW: 50, halfH: 34, cornerRadius: 6, blocksSight: true },
  { id: 'uhliarsky_milir', x: 650, y: 725, shape: 'circle', radius: 48, blocksSight: true },
  { id: 'myslivecky_posed', x: 680, y: 640, shape: 'box', halfW: 44, halfH: 44, cornerRadius: 8, blocksSight: true },
  { id: 'lesni_krmelec', x: 720, y: 800, shape: 'box', halfW: 60, halfH: 36, cornerRadius: 8, blocksSight: true },
];

export const LISTOPAD_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...LISTOPAD_SPECIAL_OBSTACLES,
];

export const LISTOPAD_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getListopadPois(isNightOrLevelId: boolean | number = false): Record<ListopadPoiId, ListopadPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 17 : isNightOrLevelId;
  return isNight ? LISTOPAD_NIGHT_POIS : LISTOPAD_POIS;
}

export function getListopadPoisList(isNightOrLevelId: boolean | number = false): ListopadPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 17 : isNightOrLevelId;
  return isNight ? LISTOPAD_NIGHT_POIS_LIST : LISTOPAD_POIS_LIST;
}

export function isInsideListopadPoi(
  x: number,
  y: number,
  poiOrId: ListopadPoi | ListopadPoiId,
  extraRadiusOrNight: number | boolean = 0,
  isNightOrLevelId: boolean | number = false
): boolean {
  const extraRadius = typeof extraRadiusOrNight === 'number' ? extraRadiusOrNight : 0;
  const isNight = typeof extraRadiusOrNight === 'boolean'
    ? extraRadiusOrNight
    : (typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 17 : Boolean(isNightOrLevelId));
  const poi = typeof poiOrId === 'string' ? getListopadPois(isNight)[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getListopadWaterEffect(x: number, y: number, _levelId: number = 16) {
  if (isPointOnMarchBridge(x, y)) {
    return { inWater: false, inOpenWater: false, onIce: false, speedMult: 1.0 };
  }
  if (isPointInMarchPondWater(x, y)) {
    return { inWater: true, inOpenWater: true, onIce: false, speedMult: 0.72 };
  }
  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    return { inWater: true, inOpenWater: true, onIce: false, speedMult: 0.80 };
  }
  return { inWater: false, inOpenWater: false, onIce: false, speedMult: 1.0 };
}

export function resolveListopadObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (typeof allowFlyingBypass === 'boolean' && allowFlyingBypass && entity.isFlying) return false;
  const radius = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let hit = false;
  for (const obs of LISTOPAD_OBSTACLES) {
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
