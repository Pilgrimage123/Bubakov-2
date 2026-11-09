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

export type RijenPoiId = MarchThawPoiId;
export type RijenPoi = MarchThawPoi;

export const RIJEN_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const RIJEN_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;
export const RIJEN_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;
export const RIJEN_POND_REGION = MARCH_POND_REGION;

/**
 * Interactive Ohníček z bramborové natě (Smoking Potato-Foliage Fire) on the Hrusice village green.
 * In Stage 15 (Day, levelId = 14), pressing [E] roasts a hot potato in the embers,
 * creating a burst of hot fragrant smoke and scattering burning sparks that damage/knock back
 * surrounding enemies in 380px, while granting "Horká pečená brambora"
 * (+40 Kuráž, +25 % útok, +20 % nabíjení zbraní, +15 % rychlost pohybu na 18 s).
 */
export interface OhnicekBramborState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  potatoesRoasted: number;
  smokeBurstTimer: number;
  sparksTimer: number;
}

export function createInitialOhnicekBramborState(): OhnicekBramborState {
  return {
    x: 50,
    y: -75,
    radius: 180,
    interactRadius: 180,
    cooldown: 0,
    maxCooldown: 20,
    potatoesRoasted: 0,
    smokeBurstTimer: 0,
    sparksTimer: 0,
  };
}

export const createInitialOhnicekBrambor = createInitialOhnicekBramborState;

/**
 * Interactive Dušičková svíce u Božích muk (All Souls Day Candle at Wayside Shrine)
 * for Stage 16 (Night, levelId = 15).
 * Pressing [E] kindles the holy candleflame, releasing a warm radiant ring
 * of sacred light in 440px that panics and burns nocturnal spooks & undead,
 * while granting +100 Štít, +30 % zbroj and +35 % rychlost nabíjení na 18 s.
 */
export interface DusickovaSviceState {
  x: number;
  y: number;
  radius: number;
  interactRadius: number;
  cooldown: number;
  maxCooldown: number;
  candleActiveTimer: number;
  candlesLit: number;
  windGustTimer: number;
  windWarning: { x: number; y: number; radius: number; timer: number; maxTimer: number } | null;
}

export function createInitialDusickovaSviceState(): DusickovaSviceState {
  return {
    x: 820,
    y: -620,
    radius: 185,
    interactRadius: 185,
    cooldown: 0,
    maxCooldown: 20,
    candleActiveTimer: 0,
    candlesLit: 0,
    windGustTimer: 7.0,
    windWarning: null,
  };
}

export const createInitialDusickovaSvice = createInitialDusickovaSviceState;

/**
 * Interactive points of interest for Stage 15 (levelId = 14):
 * "15. Říjen v Hrusicích – Bramborová nať a drakiáda"
 */
export const RIJEN_POIS: Record<RijenPoiId, RijenPoi> = {
  fields: {
    id: 'fields',
    title: 'Brambořiště a dračí strniště',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'BRAMBOŘIŠTĚ: Doutnající řádky bramborové natě kryjí před střelami (+18 % obrana), pozor na havrany!',
  },
  church: {
    id: 'church',
    title: 'Kostel sv. Mikuláše s podzimním listím',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'KOSTEL SV. MIKULÁŠE [E]: Zazvoň na podzimní zvon — zažene ptactvo i běsy a přidá +70 štít!',
  },
  tavern: {
    id: 'tavern',
    title: 'Hospoda U Sejků s pečenými bramborami',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'ŠENK U SEJKŮ [E]: Horké brambory z popela a máz piva zhojí +45 Kuráže a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Náves s ohníčkem z bramborové natě',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'OHNÍČEK NA NÁVSI [E]: Upeč bramboru v popelu — Horká svačinka (+40 HP, +25 % útok, +20 % dobíjení)!',
  },
  school: {
    id: 'school',
    title: 'Obecní škola s dílnou na papírové draky',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'ŠKOLNÍ DVŮR [E]: Dračí šňůra a stužky zrychlí krok (+30 Kuráž a +20 % rychlost pohybu)!',
  },
  pond: {
    id: 'pond',
    title: 'Rybník Brčálník s káděmi na výlov',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'VÝLOV RYBNÍKA: Dřevěné kádě a bláto zpomalují pohyb, z rákosí vykukuje podzimní hastrman!',
  },
  mill: {
    id: 'mill',
    title: 'Starý mlýn s pytli brambor a obilí',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'PODZIMNÍ MLÝN: Pytle s bramborami a moukou poskytují pevné krytí (+18 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Zlatý bukový hvozd se spadaným listím',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'BUKOVÝ HVOZD [E]: Šelest spadaného listí zhojí +30 Kuráže a zrychlí krok o +22 %!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka u rozcestí s jeřabinami',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Podzimní požehnání přitáhne krejcary z okolí a udělí svatý štít (+85)!',
  },
};

/**
 * Interactive points of interest for Stage 16 (levelId = 15):
 * "16. Říjen v Hrusicích – Dušičková noc a výlov rybníka"
 */
export const RIJEN_NIGHT_POIS: Record<RijenPoiId, RijenPoi> = {
  fields: {
    id: 'fields',
    title: 'Noční strniště a tajemní strašáci',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'NOČNÍ STRNIŠTĚ: Sychravý vítr hýbe slaměnými strašáky (+18 % obrana), pozor na hejna můr!',
  },
  church: {
    id: 'church',
    title: 'Kostelní hřbitov se svícemi na Dušičky',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'HŘBITOV U KOSTELA: Mihotavé plaménky svíček odhánějí chlad noci (+20 % nabíjení)!',
  },
  tavern: {
    id: 'tavern',
    title: 'Vyhřátý šenk v podzimní tmě',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSPODA V NOCI [E]: Horký bramborový guláš zhojí +45 Kuráže a dodá +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Náves s doutnajícími uhlíky v chladné noci',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES V NOCI: Kolem teplých uhlíků se stahují noční stíny a bludičky!',
  },
  school: {
    id: 'school',
    title: 'Tichá škola pod podzimním nebem',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'NOČNÍ ŠKOLA: Závětří za školní zdí chrání před poryvy větru (+15 % obrana)!',
  },
  pond: {
    id: 'pond',
    title: 'Vypuštěný Brčálník s bahnem a bludičkami',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'VYPUŠTĚNÝ RYBNÍK: Ze zbytků tůně vystupuje Pekelný čert rybníkář a obří Veleštika!',
  },
  mill: {
    id: 'mill',
    title: 'Temný mlýn se zastaveným kolem',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'ZASTAVENÝ MLÝN: Z černého náhonu se šíří chlad, z hlubin zní bublání ryb!',
  },
  forest: {
    id: 'forest',
    title: 'Šumící noční hvozd ve větru',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'NOČNÍ HVOZD [E]: Lesní studánka zhojí +30 Kuráže a propůjčí tichý krok (+22 % rychlost)!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka s plápolající dušičkovou svící',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Zažehni dušičkovou svíci — posvátný plamen spálí přízraky a udělí +100 štít & +30 % zbroj!',
  },
};

export const RIJEN_POIS_LIST: RijenPoi[] = Object.values(RIJEN_POIS);
export const RIJEN_NIGHT_POIS_LIST: RijenPoi[] = Object.values(RIJEN_NIGHT_POIS);

export const RIJEN_DECOR = [
  { type: 'rijen_border', x: 0, y: 0, scale: 1.25 },
  { type: 'rijen_fields', x: RIJEN_POIS.fields.x, y: RIJEN_POIS.fields.y, scale: 1 },
  { type: 'rijen_church', x: RIJEN_POIS.church.x, y: RIJEN_POIS.church.y, scale: 1 },
  { type: 'rijen_village', x: RIJEN_POIS.village.x, y: RIJEN_POIS.village.y, scale: 1 },
  { type: 'rijen_tavern', x: RIJEN_POIS.tavern.x, y: RIJEN_POIS.tavern.y, scale: 1 },
  { type: 'rijen_pond', x: RIJEN_POIS.pond.x, y: RIJEN_POIS.pond.y, scale: 1 },
  { type: 'rijen_mill', x: RIJEN_POIS.mill.x, y: RIJEN_POIS.mill.y, scale: 1 },
  { type: 'rijen_forest', x: RIJEN_POIS.forest.x, y: RIJEN_POIS.forest.y, scale: 1 },
  { type: 'rijen_shrine', x: RIJEN_POIS.shrine.x, y: RIJEN_POIS.shrine.y, scale: 1 },
  { type: 'rijen_school', x: RIJEN_POIS.school.x, y: RIJEN_POIS.school.y, scale: 1 },
] as const;

export const RIJEN_NIGHT_DECOR = RIJEN_DECOR;

/**
 * Tactical October obstacles:
 * - Ohníček z bramborové natě na návsi (circle r: 42)
 * - Žebřiňák s bramborami u hospody (box)
 * - 4 dřevěné kádě na výlov a sudy u rybníka Brčálníku
 */
export const RIJEN_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'ohnicek_brambor', x: 50, y: -75, shape: 'circle', radius: 42, blocksSight: false },
  { id: 'vuz_brambory', x: 450, y: -130, shape: 'box', halfW: 64, halfH: 36, cornerRadius: 8, blocksSight: true },
  { id: 'kad_vylov_1', x: -680, y: 550, shape: 'circle', radius: 44, blocksSight: true },
  { id: 'kad_vylov_2', x: -760, y: 580, shape: 'circle', radius: 46, blocksSight: true },
  { id: 'kad_vylov_3', x: -650, y: 680, shape: 'circle', radius: 42, blocksSight: true },
  { id: 'kad_vylov_4', x: -780, y: 690, shape: 'circle', radius: 42, blocksSight: true },
];

export const RIJEN_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...RIJEN_SPECIAL_OBSTACLES,
];

export const RIJEN_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getRijenPois(isNightOrLevelId: boolean | number = false): Record<RijenPoiId, RijenPoi> {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 15 : isNightOrLevelId;
  return isNight ? RIJEN_NIGHT_POIS : RIJEN_POIS;
}

export function getRijenPoisList(isNightOrLevelId: boolean | number = false): RijenPoi[] {
  const isNight = typeof isNightOrLevelId === 'number' ? isNightOrLevelId === 15 : isNightOrLevelId;
  return isNight ? RIJEN_NIGHT_POIS_LIST : RIJEN_POIS_LIST;
}

export function isInsideRijenPoi(
  x: number,
  y: number,
  poiOrId: RijenPoi | RijenPoiId,
  extraRadius = 0
): boolean {
  const poi = typeof poiOrId === 'string' ? RIJEN_POIS[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getActiveRijenPoi(x: number, y: number, isNight = false): RijenPoi | null {
  const list = isNight ? RIJEN_NIGHT_POIS_LIST : RIJEN_POIS_LIST;
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

export function getRijenWaterEffect(
  x: number,
  y: number,
  time = 0,
  isNight = false
): { inOpenWater: boolean; inFord: boolean; inMudPond: boolean; carryVx: number; carryVy: number; speedMult: number } {
  const onBridge = isPointOnMarchBridge(x, y);
  if (onBridge) {
    return { inOpenWater: false, inFord: false, inMudPond: false, carryVx: 0, carryVy: 0, speedMult: 1 };
  }

  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    const currentSpeed = isNight ? 26 : 22;
    return {
      inOpenWater: true,
      inFord: false,
      inMudPond: false,
      carryVx: (streamInfo.vx / 68) * currentSpeed,
      carryVy: (streamInfo.vy / 68) * currentSpeed,
      speedMult: isNight ? 0.62 : 0.66,
    };
  }

  const inPond = isPointInMarchPondWater(x, y);
  if (inPond) {
    // October pond is drained / muddy during harvest: stronger drag, muddy current
    return {
      inOpenWater: true,
      inFord: false,
      inMudPond: true,
      carryVx: Math.sin(time * 0.6) * (isNight ? 4.0 : 3.0),
      carryVy: Math.cos(time * 0.6) * (isNight ? 4.0 : 3.0),
      speedMult: isNight ? 0.50 : 0.54,
    };
  }

  return { inOpenWater: false, inFord: false, inMudPond: false, carryVx: 0, carryVy: 0, speedMult: 1 };
}

export function collideCircleWithRijenObstacles(
  x: number,
  y: number,
  r = 18
): { hit: boolean; nx: number; ny: number; x: number; y: number; pushX: number; pushY: number; obstacleId?: string } {
  for (let i = 0; i < RIJEN_OBSTACLES.length; i++) {
    const obs = RIJEN_OBSTACLES[i];
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

export function resolveRijenObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass: boolean | number = true
): boolean {
  if (allowFlyingBypass !== false && entity.isFlying) return false;
  const r = typeof allowFlyingBypass === 'number' ? allowFlyingBypass : entity.radius || 18;
  let anyHit = false;
  for (let pass = 0; pass < 2; pass++) {
    const col = collideCircleWithRijenObstacles(entity.x, entity.y, r);
    if (!col.hit) break;
    entity.x = col.pushX;
    entity.y = col.pushY;
    anyHit = true;
  }
  return anyHit;
}
