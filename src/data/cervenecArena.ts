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

export type CervenecPoiId = MarchThawPoiId;
export type CervenecPoi = MarchThawPoi;

export const CERVENEC_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const CERVENEC_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const CERVENEC_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const CERVENEC_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Poutní střelnice (Fairground Shooting Gallery) on the Hrusice village green.
 * In Stage 9 (Day, levelId = 8), pressing [E] fires a festive volley at tin targets & paper roses,
 * knocking back nearby enemies and granting "Pouťová muška" (+25% weapon recharge speed & +20% Luck for 18s).
 */
export interface PoutniStrelniceState {
  x: number;
  y: number;
  radius: number;
  cooldown: number;
  maxCooldown: number;
  shotsFired: number;
  buffTimer: number;
  rosesBurstTimer: number;
}

export function createInitialPoutniStrelnice(): PoutniStrelniceState {
  return {
    x: 65,
    y: -95,
    radius: 170,
    cooldown: 0,
    maxCooldown: 24,
    shotsFired: 0,
    buffTimer: 0,
    rosesBurstTimer: 0,
  };
}

export const createInitialPoutniStrelniceState = createInitialPoutniStrelnice;

/**
 * Interactive points of interest for Stage 9 (levelId = 8):
 * "9. Červenec v Hrusicích – Žně na sv. Markétu a poutní veselice"
 * („Na svatou Markétu hodila srp do žita“)
 */
export const CERVENEC_POIS: Record<CervenecPoiId, CervenecPoi> = {
  fields: {
    id: 'fields',
    title: 'Zlaté žitné lány na Markétu',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'ŽITNÉ LÁNY: Panáky obilí kryjí před střelami (+15 % obrana) a polní křečci tu syslí krejcary!',
  },
  church: {
    id: 'church',
    title: 'Hrusický kostel o pouti',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'POUTNÍ KOSTEL [E]: Svatý zvon zažene Žitnou bábu i polední běsy v okruhu 420 px a přidá +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Poutní hospoda pod lípou',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'POUTNÍ ŠENK [E]: Chladné pivo ze sklepa a poutní koláč zhojí rány a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Hrusická náves a Poutní střelnice',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'POUTNÍ STŘELNICE [E]: Tref cínové terče a papírové růže — Pouťová muška (+25 % nabíjení zbraní a +20 % Štěstí)!',
  },
  school: {
    id: 'school',
    title: 'Škola o letních prázdninách',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLA O PRÁZDNINÁCH: Stín pod lípou chladí úpal a zrychluje nabíjení zbraní (+20 %)!',
  },
  pond: {
    id: 'pond',
    title: 'Vyhřátý rybník a rákosí',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'RYBNÍK V ČERVENCI: Chladivá voda smyje žňový prach, ale u jezu číhají klepeta říčních raků!',
  },
  mill: {
    id: 'mill',
    title: 'Mlýn a mlaty s cepy',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'MLÝN O ŽNÍCH: Klapot cepů a čerstvě mleté žito oslepují bubáky moučným prachem (+15 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Malinový háj u lesa',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'MALINOVÝ HÁJ [E]: Sladké lesní maliny a ostružiny zhojí Kuráž a zrychlí krok o +22 %!',
  },
  shrine: {
    id: 'shrine',
    title: 'Kaplička sv. Markéty a Anny',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'KAPLIČKA SV. MARKÉTY [E]: Požehnání ženců přitáhne všechny krejcary i perníčky z lánů a dá svatý štít!',
  },
};

/**
 * Interactive points of interest for Stage 10 (levelId = 9):
 * "10. Červenec v Hrusicích – Bouře sv. Eliáše a Dračí sluj"
 */
export const CERVENEC_NIGHT_POIS: Record<CervenecPoiId, CervenecPoi> = {
  fields: {
    id: 'fields',
    title: 'Bouřkové strniště pod blesky',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'BOUŘKOVÉ STRNIŠTĚ: Panáky obilí chrání před vichrem (+15 % obrana), pozor na kulové blesky a údery sv. Eliáše!',
  },
  church: {
    id: 'church',
    title: 'Kostel a mrakozvon sv. Eliáše',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'MRAKOZVON V BOUŘI [E]: Zvonění proti mračnům rozptýlí kulové blesky, zažene přízraky a dá +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Noční hospoda v bouři',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSPODA V BOUŘI [E]: Horká kořalka a teplé světlo z oken zhojí Kuráž a přidají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Ztichlá náves pod blesky',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES V BOUŘI: Plachty poutní střelnice pleskají ve větru — teplá okna chalup hřejí (+16 % pohyb)!',
  },
  school: {
    id: 'school',
    title: 'Hradní hláska Bílé paní',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'HRADNÍ HLÁSKA: Chladný průvan zrychluje nabíjení zbraní (+20 %), v okolí se zjevuje Bílá paní se zbrojnošem!',
  },
  pond: {
    id: 'pond',
    title: 'Bouřkový rybník pod blesky',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'BOUŘKOVÝ RYBNÍK: Nad zčeřenou hladinou jiskří bludičky a kulové blesky!',
  },
  mill: {
    id: 'mill',
    title: 'Zlenické podhradí Bezhlavého rytíře',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'ZLENICKÉ PODHRADÍ: V bouři tu cválá Bezhlavý rytíř na vraníku — moučný prach u mlýna dává +15 % úhyb!',
  },
  forest: {
    id: 'forest',
    title: 'Melechovská dračí sluj',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'DRAČÍ SLUJ [E]: Pod Melechovskou skálou dřímá Tříhlavý Drak — lesní pramen zhojí Kuráž a dá +22 % rychlost!',
  },
  shrine: {
    id: 'shrine',
    title: 'Kaplička sv. Eliáše Hromovládce',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'KAPLIČKA SV. ELIÁŠE [E]: Svatá záře přitáhne kořist z celé mapy a ochrání lovce hromovým štítem!',
  },
};

export const CERVENEC_POIS_LIST: CervenecPoi[] = Object.values(CERVENEC_POIS);
export const CERVENEC_NIGHT_POIS_LIST: CervenecPoi[] = Object.values(CERVENEC_NIGHT_POIS);

export const CERVENEC_DECOR = [
  { type: 'cervenec_border', x: 0, y: 0, scale: 1.25 },
  { type: 'cervenec_fields', x: CERVENEC_POIS.fields.x, y: CERVENEC_POIS.fields.y, scale: 1 },
  { type: 'cervenec_church', x: CERVENEC_POIS.church.x, y: CERVENEC_POIS.church.y, scale: 1 },
  { type: 'cervenec_village', x: CERVENEC_POIS.village.x, y: CERVENEC_POIS.village.y, scale: 1 },
  { type: 'cervenec_tavern', x: CERVENEC_POIS.tavern.x, y: CERVENEC_POIS.tavern.y, scale: 1 },
  { type: 'cervenec_pond', x: CERVENEC_POIS.pond.x, y: CERVENEC_POIS.pond.y, scale: 1 },
  { type: 'cervenec_mill', x: CERVENEC_POIS.mill.x, y: CERVENEC_POIS.mill.y, scale: 1 },
  { type: 'cervenec_forest', x: CERVENEC_POIS.forest.x, y: CERVENEC_POIS.forest.y, scale: 1 },
  { type: 'cervenec_shrine', x: CERVENEC_POIS.shrine.x, y: CERVENEC_POIS.shrine.y, scale: 1 },
  { type: 'cervenec_school', x: CERVENEC_POIS.school.x, y: CERVENEC_POIS.school.y, scale: 1 },
] as const;

export const CERVENEC_NIGHT_DECOR = CERVENEC_DECOR;

/**
 * Tactical golden grain sheaves (Panáky a mandele žita) in the upper fields + Poutní střelnice booth on the green.
 */
export const CERVENEC_SHEAF_OBSTACLES: MarchObstacle[] = [
  { id: 'panak_zita_1', x: -190, y: -930, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'panak_zita_2', x: 95, y: -1060, shape: 'circle', radius: 46, blocksSight: true },
  { id: 'panak_zita_3', x: 390, y: -900, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'panak_zita_4', x: 640, y: -1020, shape: 'circle', radius: 42, blocksSight: true },
  { id: 'poutni_strelnice_budka', x: 65, y: -135, shape: 'box', halfW: 62, halfH: 34, cornerRadius: 12, blocksSight: false },
];

export const CERVENEC_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...CERVENEC_SHEAF_OBSTACLES,
];

export const CERVENEC_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getCervenecPois(isNight = false): Record<CervenecPoiId, CervenecPoi> {
  return isNight ? CERVENEC_NIGHT_POIS : CERVENEC_POIS;
}

export function getCervenecPoisList(isNight = false): CervenecPoi[] {
  return isNight ? CERVENEC_NIGHT_POIS_LIST : CERVENEC_POIS_LIST;
}

export function isInsideCervenecPoi(
  x: number,
  y: number,
  poiOrId: CervenecPoi | CervenecPoiId,
  extraRadius = 0
): boolean {
  const poi = typeof poiOrId === 'string' ? CERVENEC_POIS[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getActiveCervenecPoi(x: number, y: number, isNight = false): CervenecPoi | null {
  const list = isNight ? CERVENEC_NIGHT_POIS_LIST : CERVENEC_POIS_LIST;
  for (let i = 0; i < list.length; i++) {
    const poi = list[i];
    const dx = x - poi.x;
    const dy = y - poi.y;
    if (dx * dx + dy * dy <= poi.radius * poi.radius) {
      return poi;
    }
  }
  return null;
}

export function getCervenecWaterEffect(
  x: number,
  y: number,
  time = 0
): { inOpenWater: boolean; inFord: boolean; carryVx: number; carryVy: number } {
  const onBridge = isPointOnMarchBridge(x, y);
  if (onBridge) {
    return { inOpenWater: false, inFord: false, carryVx: 0, carryVy: 0 };
  }

  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    const currentSpeed = 20;
    return {
      inOpenWater: true,
      inFord: false,
      carryVx: (streamInfo.vx / 68) * currentSpeed,
      carryVy: (streamInfo.vy / 68) * currentSpeed,
    };
  }

  const inPond = isPointInMarchPondWater(x, y);
  if (inPond) {
    return {
      inOpenWater: true,
      inFord: false,
      carryVx: Math.sin(time * 0.7) * 3.5,
      carryVy: Math.cos(time * 0.7) * 3.5,
    };
  }

  return { inOpenWater: false, inFord: false, carryVx: 0, carryVy: 0 };
}

export function collideCircleWithCervenecObstacles(
  x: number,
  y: number,
  r = 18
): { hit: boolean; nx: number; ny: number; x: number; y: number; pushX: number; pushY: number; obstacleId?: string } {
  for (let i = 0; i < CERVENEC_OBSTACLES.length; i++) {
    const obs = CERVENEC_OBSTACLES[i];
    if (obs.shape === 'box') {
      const hw = obs.halfW || 40;
      const hh = obs.halfH || 40;
      const cr = Math.min(obs.cornerRadius ?? 0, hw - 2, hh - 2);
      if (cr > 0) {
        const coreW = hw - cr;
        const coreH = hh - cr;
        const dx = x - obs.x;
        const dy = y - obs.y;
        if (Math.abs(dx) >= hw + r || Math.abs(dy) >= hh + r) continue;
        const clampedX = Math.max(-coreW, Math.min(coreW, dx));
        const clampedY = Math.max(-coreH, Math.min(coreH, dy));
        const rx = dx - clampedX;
        const ry = dy - clampedY;
        const distSq = rx * rx + ry * ry;
        const reach = cr + r;
        if (distSq < reach * reach) {
          if (distSq > 1e-6) {
            const dist = Math.sqrt(distSq);
            const nx = rx / dist;
            const ny = ry / dist;
            const px = obs.x + clampedX + nx * (reach + 1.5);
            const py = obs.y + clampedY + ny * (reach + 1.5);
            return { hit: true, nx, ny, x: px, y: py, pushX: px, pushY: py, obstacleId: obs.id };
          }
          const dLeft = dx + hw;
          const dRight = hw - dx;
          const dTop = dy + hh;
          const dBottom = hh - dy;
          const minEdge = Math.min(dLeft, dRight, dTop, dBottom);
          if (minEdge === dLeft) {
            const px = obs.x - hw - r - 1.5;
            return { hit: true, nx: -1, ny: 0, x: px, y, pushX: px, pushY: y, obstacleId: obs.id };
          } else if (minEdge === dRight) {
            const px = obs.x + hw + r + 1.5;
            return { hit: true, nx: 1, ny: 0, x: px, y, pushX: px, pushY: y, obstacleId: obs.id };
          } else if (minEdge === dTop) {
            const py = obs.y - hh - r - 1.5;
            return { hit: true, nx: 0, ny: -1, x, y: py, pushX: x, pushY: py, obstacleId: obs.id };
          } else {
            const py = obs.y + hh + r + 1.5;
            return { hit: true, nx: 0, ny: 1, x, y: py, pushX: x, pushY: py, obstacleId: obs.id };
          }
        }
      } else {
        const minX = obs.x - hw;
        const maxX = obs.x + hw;
        const minY = obs.y - hh;
        const maxY = obs.y + hh;
        const closestX = Math.max(minX, Math.min(x, maxX));
        const closestY = Math.max(minY, Math.min(y, maxY));
        const dx = x - closestX;
        const dy = y - closestY;
        const distSq = dx * dx + dy * dy;
        if (distSq < r * r) {
          const dist = Math.sqrt(distSq) || 1;
          const nx = dist > 0.001 ? dx / dist : 0;
          const ny = dist > 0.001 ? dy / dist : 1;
          const px = closestX + nx * (r + 1.5);
          const py = closestY + ny * (r + 1.5);
          return { hit: true, nx, ny, x: px, y: py, pushX: px, pushY: py, obstacleId: obs.id };
        }
      }
    } else {
      const or = obs.radius || 30;
      const reach = or + r;
      const dx = x - obs.x;
      if (dx >= reach || dx <= -reach) continue;
      const dy = y - obs.y;
      if (dy >= reach || dy <= -reach) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq < reach * reach) {
        const dist = Math.sqrt(distSq) || 1;
        const nx = dist > 0.001 ? dx / dist : 1;
        const ny = dist > 0.001 ? dy / dist : 0;
        const px = obs.x + nx * (reach + 1.5);
        const py = obs.y + ny * (reach + 1.5);
        return { hit: true, nx, ny, x: px, y: py, pushX: px, pushY: py, obstacleId: obs.id };
      }
    }
  }
  return { hit: false, nx: 0, ny: 0, x, y, pushX: x, pushY: y };
}

export function resolveCervenecObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass = true
): boolean {
  if (allowFlyingBypass && entity.isFlying) return false;
  const r = entity.radius || 18;
  let anyHit = false;
  for (let pass = 0; pass < 2; pass++) {
    const col = collideCircleWithCervenecObstacles(entity.x, entity.y, r);
    if (!col.hit) break;
    entity.x = col.pushX;
    entity.y = col.pushY;
    anyHit = true;
  }
  return anyHit;
}
