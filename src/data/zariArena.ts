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

export type ZariPoiId = MarchThawPoiId;
export type ZariPoi = MarchThawPoi;

export const ZARI_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const ZARI_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const ZARI_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const ZARI_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Kotel na povidla (Copper Plum-Jam Cauldron) on the Hrusice village green.
 * In Stage 13 (Day, levelId = 12), pressing [E] stirs the boiling plum jam,
 * splashing sticky hot jam in 380px and granting "Sladká posvícenská kuráž"
 * (+35 Kuráž, +25% damage, +20% weapon recharge, +15% move speed for 18s).
 */
export interface KotelNaPovidlaState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  batchesCooked: number;
  stirActiveTimer: number;
  splashBurstTimer: number;
}

export function createInitialKotelNaPovidlaState(): KotelNaPovidlaState {
  return {
    x: 45,
    y: -95,
    radius: 175,
    interactRadius: 175,
    cooldown: 0,
    maxCooldown: 20,
    batchesCooked: 0,
    stirActiveTimer: 0,
    splashBurstTimer: 0,
  };
}

export const createInitialKotelNaPovidla = createInitialKotelNaPovidlaState;

/**
 * Interactive Svatováclavský svatý oheň (St. Wenceslas Sacred Fire) for Stage 14 (Night, levelId = 13).
 * Pressing [E] stokes the sacred flame by the church, dealing holy damage and panicking night spooks
 * in 440px while granting +95 Shield, +25% Armor and +35% Ultimate/Weapon recharge for 18s.
 */
export interface SvatovaclavskyOhenState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  blessingActiveTimer: number;
  firesKindled: number;
  mistGustTimer: number;
  mistWarning: { x: number; y: number; radius: number; timer: number; maxTimer: number } | null;
}

export function createInitialSvatovaclavskyOhenState(): SvatovaclavskyOhenState {
  return {
    x: -800,
    y: -650,
    radius: 180,
    interactRadius: 180,
    cooldown: 0,
    maxCooldown: 20,
    blessingActiveTimer: 0,
    firesKindled: 0,
    mistGustTimer: 7.5,
    mistWarning: null,
  };
}

export const createInitialSvatovaclavskyOhen = createInitialSvatovaclavskyOhenState;

/**
 * Interactive points of interest for Stage 13 (levelId = 12):
 * "13. Září v Hrusicích – Posvícení a sklizeň švestek"
 */
export const ZARI_POIS: Record<ZariPoiId, ZariPoi> = {
  fields: {
    id: 'fields',
    title: 'Švestkový sad a zorané strniště',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'ŠVESTKOVÝ SAD: Doutnající ohníčky z bramborové natě kryjí před střelami (+18 % obrana), pozor na švestkové sršně!',
  },
  church: {
    id: 'church',
    title: 'Kostel sv. Václava s posvícenským věncem',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'KOSTEL SV. VÁCLAVA [E]: Zazvoň na posvícenský zvon — zaplaší sršně i čerty a přidá +65 štít!',
  },
  tavern: {
    id: 'tavern',
    title: 'Hospoda U Sejků s posvícenskou tabulí',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'POSVÍCENSKÝ ŠENK [E]: Koláče s tvarohem a povidly zhojí +45 Kuráže a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Náves s měděným kotlem na povidla',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'KOTEL NA POVIDLA [E]: Zamíchej dřevěnou měchačkou — Sladká posvícenská kuráž (+35 HP, +25 % útok, +20 % dobíjení)!',
  },
  school: {
    id: 'school',
    title: 'Obecní škola na začátku školního roku',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLNÍ ZAHRADA [E]: Košík modrých švestek osvěží krok (+30 Kuráž a +18 % rychlost)!',
  },
  pond: {
    id: 'pond',
    title: 'Zářijový rybník se zlatavým rákosím',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'RYBNÍK V ZÁŘÍ: První podzimní listí plave na hladině, chladná voda zpomaluje krok!',
  },
  mill: {
    id: 'mill',
    title: 'Starý mlýn s pytli nové mouky',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'MLÝN NA KOLÁČE: Moučný prach z čerstvě semletého obilí kryje před útoky (+15 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Bukový hvozd s hříbky a babím létem',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'BUKOVÝ LES [E]: Lesní studánka pod zlatým listím zhojí +28 Kuráže a zrychlí krok o +22 %!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka s jeřabinami a šípky',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Posvícenské požehnání přitáhne krejcary z okolí a udělí svatý štít (+80)!',
  },
};

/**
 * Interactive points of interest for Stage 14 (levelId = 13):
 * "14. Září v Hrusicích – Svatováclavská noc a mlhy u rybníka"
 */
export const ZARI_NIGHT_POIS: Record<ZariPoiId, ZariPoi> = {
  fields: {
    id: 'fields',
    title: 'Zamlžené strniště a švestkový sad',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'MLŽNÉ STRNIŠTĚ: Svatováclavská mlha kryje před střelami (+18 % obrana), pozor na větrné poryvy!',
  },
  church: {
    id: 'church',
    title: 'Svatováclavský svatý oheň u kostela',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'SVATOVÁCLAVSKÝ OHEŇ [E]: Rozdmychej svatý plamen — zažene noční přízraky a dá +95 štít & +25 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Zářící šenk v podzimní mlze',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSPODA V MLZE [E]: Horká medovina a posvícenské koláče zhojí +45 Kuráže a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Zšeřelá náves s dožhavujícím kotlem',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES V NOCI: V komínech kvílí Meluzína a kolem teplého kotle se plíží noční stíny!',
  },
  school: {
    id: 'school',
    title: 'Tichá škola v podzimní mlze',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'NOČNÍ ŠKOLA: Šumění podzimního listí zrychluje nabíjení zbraní (+20 %)!',
  },
  pond: {
    id: 'pond',
    title: 'Rybník zahalený svatováclavskou mlhou',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'MLŽNÝ RYBNÍK: Z mléčné mlhy nad hladinou vystupují topivci a bludičky!',
  },
  mill: {
    id: 'mill',
    title: 'Mlžný mlýn a splav u náhonu',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'SPLAV U MLÝNA: Od černého náhonu přichází Mlžný Mlynář — pozor na vodní proud!',
  },
  forest: {
    id: 'forest',
    title: 'Svatováclavský hvozd ve vichru',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'NOČNÍ HVOZD [E]: Lesní pramen zhojí +28 Kuráže a propůjčí tichý krok (+22 % rychlost)!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka se svatováclavskou lucernou',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Svatováclavská záštita přitáhne krejcary a udělí svatý štít (+80)!',
  },
};

export const ZARI_POIS_LIST: ZariPoi[] = Object.values(ZARI_POIS);
export const ZARI_NIGHT_POIS_LIST: ZariPoi[] = Object.values(ZARI_NIGHT_POIS);

export const ZARI_DECOR = [
  { type: 'zari_border', x: 0, y: 0, scale: 1.25 },
  { type: 'zari_fields', x: ZARI_POIS.fields.x, y: ZARI_POIS.fields.y, scale: 1 },
  { type: 'zari_church', x: ZARI_POIS.church.x, y: ZARI_POIS.church.y, scale: 1 },
  { type: 'zari_village', x: ZARI_POIS.village.x, y: ZARI_POIS.village.y, scale: 1 },
  { type: 'zari_tavern', x: ZARI_POIS.tavern.x, y: ZARI_POIS.tavern.y, scale: 1 },
  { type: 'zari_pond', x: ZARI_POIS.pond.x, y: ZARI_POIS.pond.y, scale: 1 },
  { type: 'zari_mill', x: ZARI_POIS.mill.x, y: ZARI_POIS.mill.y, scale: 1 },
  { type: 'zari_forest', x: ZARI_POIS.forest.x, y: ZARI_POIS.forest.y, scale: 1 },
  { type: 'zari_shrine', x: ZARI_POIS.shrine.x, y: ZARI_POIS.shrine.y, scale: 1 },
  { type: 'zari_school', x: ZARI_POIS.school.x, y: ZARI_POIS.school.y, scale: 1 },
] as const;

export const ZARI_NIGHT_DECOR = ZARI_DECOR;

/**
 * Tactical September obstacles:
 * - Měděný kotel na povidla na návsi
 * - Posvícenský vůz se švestkami u hospody
 * - 4 švestkové kádě a kupky bramborové natě v polích
 */
export const ZARI_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'kotel_na_povidla', x: 45, y: -95, shape: 'circle', radius: 42, blocksSight: false },
  { id: 'posvicensky_vuz', x: 460, y: -140, shape: 'box', halfW: 66, halfH: 38, cornerRadius: 8, blocksSight: true },
  { id: 'kad_svestek_1', x: -210, y: -940, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'kad_svestek_2', x: 110, y: -1080, shape: 'circle', radius: 46, blocksSight: true },
  { id: 'kad_svestek_3', x: 410, y: -920, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'kad_svestek_4', x: 660, y: -1040, shape: 'circle', radius: 42, blocksSight: true },
];

export const ZARI_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...ZARI_SPECIAL_OBSTACLES,
];

export const ZARI_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getZariPois(isNightOrLevelId: boolean | number = false): Record<ZariPoiId, ZariPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 13 : isNightOrLevelId;
  return isNight ? ZARI_NIGHT_POIS : ZARI_POIS;
}

export function getZariPoisList(isNightOrLevelId: boolean | number = false): ZariPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 13 : isNightOrLevelId;
  return isNight ? ZARI_NIGHT_POIS_LIST : ZARI_POIS_LIST;
}

export function isInsideZariPoi(
  x: number,
  y: number,
  poiOrId: ZariPoi | ZariPoiId,
  extraRadius = 0
): boolean {
  const poi = typeof poiOrId === 'string' ? ZARI_POIS[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getActiveZariPoi(x: number, y: number, isNight = false): ZariPoi | null {
  const list = isNight ? ZARI_NIGHT_POIS_LIST : ZARI_POIS_LIST;
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

export function getZariWaterEffect(
  x: number,
  y: number,
  time = 0,
  isNight = false
): { inOpenWater: boolean; inFord: boolean; carryVx: number; carryVy: number; speedMult: number } {
  const onBridge = isPointOnMarchBridge(x, y);
  if (onBridge) {
    return { inOpenWater: false, inFord: false, carryVx: 0, carryVy: 0, speedMult: 1 };
  }

  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    const currentSpeed = isNight ? 24 : 20;
    return {
      inOpenWater: true,
      inFord: false,
      carryVx: (streamInfo.vx / 68) * currentSpeed,
      carryVy: (streamInfo.vy / 68) * currentSpeed,
      speedMult: isNight ? 0.64 : 0.68,
    };
  }

  const inPond = isPointInMarchPondWater(x, y);
  if (inPond) {
    return {
      inOpenWater: true,
      inFord: false,
      carryVx: Math.sin(time * 0.7) * (isNight ? 4.5 : 3.5),
      carryVy: Math.cos(time * 0.7) * (isNight ? 4.5 : 3.5),
      speedMult: isNight ? 0.54 : 0.58,
    };
  }

  return { inOpenWater: false, inFord: false, carryVx: 0, carryVy: 0, speedMult: 1 };
}

export function collideCircleWithZariObstacles(
  x: number,
  y: number,
  r = 18
): { hit: boolean; nx: number; ny: number; x: number; y: number; pushX: number; pushY: number; obstacleId?: string } {
  for (let i = 0; i < ZARI_OBSTACLES.length; i++) {
    const obs = ZARI_OBSTACLES[i];
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

export function resolveZariObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (typeof allowFlyingBypass === 'boolean' && allowFlyingBypass && entity.isFlying) return false;
  const r = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let anyHit = false;
  for (let pass = 0; pass < 2; pass++) {
    const col = collideCircleWithZariObstacles(entity.x, entity.y, r);
    if (!col.hit) break;
    entity.x = col.pushX;
    entity.y = col.pushY;
    anyHit = true;
  }
  return anyHit;
}
