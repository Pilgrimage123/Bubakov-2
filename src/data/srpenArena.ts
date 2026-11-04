import {
  MARCH_ARENA_BOUNDS,
  MARCH_THAW_OBSTACLES,
  MARCH_THAW_POIS,
  MARCH_FOREST_ZONES,
  MARCH_THAW_ROOF_ZONES,
  getMarchWaterAndFloeEffect,
  type MarchThawPoi,
  type MarchThawPoiId,
  type MarchObstacle,
  type MarchForestZone,
  type MarchRoofZone,
} from './marchThawArena';

export type SrpenPoiId = MarchThawPoiId;
export type SrpenPoi = MarchThawPoi;

export const SRPEN_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const SRPEN_FOREST_ZONES: readonly MarchForestZone[] = MARCH_FOREST_ZONES;

/**
 * Interactive Chlebová pec (Village Bread Oven) on the Hrusice village green.
 * In Stage 11 (Day, levelId = 10), pressing [E] clears hot ashes and draws a fresh loaf,
 * knocking back nearby enemies in a cloud of hot flour/sparks and granting "Čerstvě upečený pecen"
 * (+25% snack healing, +20% blunt/baking weapon dmg, +15% move speed for 18s).
 */
export interface ChlebovaPecState {
  x: number;
  y: number;
  radius: number;
  cooldown: number;
  maxCooldown: number;
  breadsBaked: number;
  buffTimer: number;
  flourBurstTimer: number;
}

export function createInitialChlebovaPec(): ChlebovaPecState {
  return {
    x: 45,
    y: -95,
    radius: 175,
    cooldown: 0,
    maxCooldown: 22,
    breadsBaked: 0,
    buffTimer: 0,
    flourBurstTimer: 0,
  };
}

export const createInitialChlebovaPecState = createInitialChlebovaPec;

/**
 * Interactive Vavřinecká vatra (St. Lawrence Hilltop Bonfire) for Stage 12 (Night, levelId = 11).
 * Pressing [E] stokes the sacred bonfire, repelling Night Horrors (Noční můra) in 440px
 * and granting +20% Armor and 1.5x Ultimate recharge for 18s.
 */
export interface VavrineckaVatraState {
  x: number;
  y: number;
  radius: number;
  cooldown: number;
  maxCooldown: number;
  litTimer: number;
  starsWitnessed: number;
  shootingStarTimer: number;
  starWarning: { x: number; y: number; radius: number; timer: number; maxTimer: number } | null;
}

export function createInitialVavrineckaVatra(): VavrineckaVatraState {
  return {
    x: -800,
    y: -650,
    radius: 180,
    cooldown: 0,
    maxCooldown: 20,
    litTimer: 0,
    starsWitnessed: 0,
    shootingStarTimer: 5.5,
    starWarning: null,
  };
}

/**
 * Interactive points of interest for Stage 11 (levelId = 10):
 * "11. Srpen v Hrusicích – Dožínková slavnost a pečení chleba"
 */
export const SRPEN_POIS: Record<SrpenPoiId, SrpenPoi> = {
  fields: {
    id: 'fields',
    title: 'Dožatá pšeničná pole a slunečnice',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'DOŽATÁ POLE: Slunečnicové trsy kryjí před střelami (+15 % obrana), polní myšice tu sbírají vypadaná zrnka!',
  },
  church: {
    id: 'church',
    title: 'Kostel s dožínkovým požehnáním',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'KOSTEL SV. BARTOLOMĚJE [E]: Poděkování za úrodu zažene Zlatohlávky i hmyzí roje a přidá +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Dožínková hospoda s kapelou',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'DOŽÍNKOVÝ ŠENK [E]: Čerstvé dožínkové pivo a tvarohové buchty zhojí rány a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Náves s pecí a dožínkovým vozem',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'CHLEBOVÁ PEC [E]: Vytáhni horký křupavý bochník — Čerstvě upečený pecen (+25 % léčení a +20 % útok)!',
  },
  school: {
    id: 'school',
    title: 'Škola pod dozrávajícími jabloněmi',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'JABLOŇOVÝ SAD U ŠKOLY: Spadaná zralá jablka osvěží krok (+18 % rychlost a +20 % kadence)!',
  },
  pond: {
    id: 'pond',
    title: 'Srpnový rybník s kvetoucím rákosím',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'RYBNÍK V SRPNU: Hladinu křižují vážky a zlatohlávci, chladná voda zhojí úpal!',
  },
  mill: {
    id: 'mill',
    title: 'Mlýn s novou moukou z letošní sklizně',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'DOŽÍNKOVÝ MLÝN: Moučný prach z čerstvé pšenice oslepuje nepřátele (+15 % úhyb)!',
  },
  forest: {
    id: 'forest',
    title: 'Ostružinový a houbový hvozd',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'HOUBOVÝ HÁJ [E]: Zralé ostružiny a srpnové hříbky zhojí Kuráž a zrychlí krok o +22 %!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka sv. Bartoloměje',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'BOŽÍ MUKA [E]: Svatý věnec z klasů přitáhne všechny krejcary i buchty a udělí svatý štít!',
  },
};

/**
 * Interactive points of interest for Stage 12 (levelId = 11):
 * "12. Srpen v Hrusicích – Vavřinecká noc padajících hvězd a Výr velký"
 */
export const SRPEN_NIGHT_POIS: Record<SrpenPoiId, SrpenPoi> = {
  fields: {
    id: 'fields',
    title: 'Noční strniště pod Perseidami',
    x: MARCH_THAW_POIS.fields.x,
    y: MARCH_THAW_POIS.fields.y,
    radius: MARCH_THAW_POIS.fields.radius,
    hint: 'STRNIŠTĚ POD HVĚZDAMI: Padající hvězdy sv. Vavřince dopadají na zem – seber jejich jiskry!',
  },
  church: {
    id: 'church',
    title: 'Vavřinecká vatra u kostela',
    x: MARCH_THAW_POIS.church.x,
    y: MARCH_THAW_POIS.church.y,
    radius: MARCH_THAW_POIS.church.radius,
    hint: 'VAVŘINECKÁ VATRA [E]: Přilož do ohně na vrchu — svaté světlo zažene Noční můry a dá +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Ztichlá hospoda pod hvězdným nebem',
    x: MARCH_THAW_POIS.tavern.x,
    y: MARCH_THAW_POIS.tavern.y,
    radius: MARCH_THAW_POIS.tavern.radius,
    hint: 'HOSPODA V NOCI [E]: Horká medovina a světlo z luceren zhojí Kuráž a dodají +25 % k útoku!',
  },
  village: {
    id: 'village',
    title: 'Noční náves pod hnízdem Výra',
    x: MARCH_THAW_POIS.village.x,
    y: MARCH_THAW_POIS.village.y,
    radius: MARCH_THAW_POIS.village.radius,
    hint: 'NÁVES V NOCI: Ze střech chalup slétají Noční můry, pozor na stíny z komínů!',
  },
  school: {
    id: 'school',
    title: 'Opuštěná školní zahrada',
    x: MARCH_THAW_POIS.school.x,
    y: MARCH_THAW_POIS.school.y,
    radius: MARCH_THAW_POIS.school.radius,
    hint: 'NOČNÍ ZAHRADA: Šumění stromů zrychluje nabíjení zbraní (+20 %), v korunách sedí netopýři!',
  },
  pond: {
    id: 'pond',
    title: 'Zrcadlící rybník s odlesky hvězd',
    x: MARCH_THAW_POIS.pond.x,
    y: MARCH_THAW_POIS.pond.y,
    radius: MARCH_THAW_POIS.pond.radius,
    hint: 'RYBNÍK POD HVĚZDAMI: Na hladině se třpytí odrazy padajících hvězd a bludičky!',
  },
  mill: {
    id: 'mill',
    title: 'Zlenické skály a útočiště Výra velkého',
    x: MARCH_THAW_POIS.mill.x,
    y: MARCH_THAW_POIS.mill.y,
    radius: MARCH_THAW_POIS.mill.radius,
    hint: 'SKÁLA VÝRA VELKÉHO: Zde hnízdí král nočního nebe Výr velký — vzdušné poryvy drtí nepřátele!',
  },
  forest: {
    id: 'forest',
    title: 'Temný srpnový hvozd plný sov',
    x: MARCH_THAW_POIS.forest.x,
    y: MARCH_THAW_POIS.forest.y,
    radius: MARCH_THAW_POIS.forest.radius,
    hint: 'NOČNÍ HVOZD [E]: Lesní pramen zhojí Kuráž a propůjčí tichý krok (+22 % rychlost)!',
  },
  shrine: {
    id: 'shrine',
    title: 'Kaplička sv. Vavřince s věčným plamenem',
    x: MARCH_THAW_POIS.shrine.x,
    y: MARCH_THAW_POIS.shrine.y,
    radius: MARCH_THAW_POIS.shrine.radius,
    hint: 'KAPLIČKA SV. VAVŘINCE [E]: Svatý plamen přitáhne všechny padlé hvězdy i krejcary z mapy!',
  },
};

export const SRPEN_POIS_LIST: SrpenPoi[] = Object.values(SRPEN_POIS);
export const SRPEN_NIGHT_POIS_LIST: SrpenPoi[] = Object.values(SRPEN_NIGHT_POIS);

export const SRPEN_DECOR = [
  { type: 'srpen_border', x: 0, y: 0, scale: 1.25 },
  { type: 'srpen_fields', x: SRPEN_POIS.fields.x, y: SRPEN_POIS.fields.y, scale: 1 },
  { type: 'srpen_church', x: SRPEN_POIS.church.x, y: SRPEN_POIS.church.y, scale: 1 },
  { type: 'srpen_village', x: SRPEN_POIS.tavern.x, y: SRPEN_POIS.tavern.y, scale: 1 },
  { type: 'srpen_pond', x: SRPEN_POIS.pond.x, y: SRPEN_POIS.pond.y, scale: 1 },
  { type: 'srpen_mill', x: SRPEN_POIS.mill.x, y: SRPEN_POIS.mill.y, scale: 1 },
  { type: 'srpen_forest', x: SRPEN_POIS.forest.x, y: SRPEN_POIS.forest.y, scale: 1 },
  { type: 'srpen_shrine', x: SRPEN_POIS.shrine.x, y: SRPEN_POIS.shrine.y, scale: 1 },
  { type: 'srpen_school', x: SRPEN_POIS.school.x, y: SRPEN_POIS.school.y, scale: 1 },
] as const;

export const SRPEN_NIGHT_DECOR = SRPEN_DECOR;

/**
 * Tactical August obstacles:
 * - Chlebová pec budka na návsi
 * - Dožínkový žebřiňák u hospody
 * - 4 pevné stohy slámy a slunečnicové trsy v polích
 */
export const SRPEN_SPECIAL_OBSTACLES: MarchObstacle[] = [
  { id: 'chlebova_pec_budka', x: 45, y: -135, shape: 'box', halfW: 58, halfH: 36, cornerRadius: 10, blocksSight: false },
  { id: 'dozinkovy_zebrinak', x: 460, y: -140, shape: 'box', halfW: 68, halfH: 38, cornerRadius: 8, blocksSight: true },
  { id: 'stoh_slamy_1', x: -210, y: -940, shape: 'circle', radius: 46, blocksSight: true },
  { id: 'stoh_slamy_2', x: 110, y: -1080, shape: 'circle', radius: 48, blocksSight: true },
  { id: 'stoh_slamy_3', x: 410, y: -920, shape: 'circle', radius: 45, blocksSight: true },
  { id: 'stoh_slamy_4', x: 660, y: -1040, shape: 'circle', radius: 44, blocksSight: true },
];

export const SRPEN_OBSTACLES: MarchObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...SRPEN_SPECIAL_OBSTACLES,
];

export const SRPEN_ROOF_ZONES: MarchRoofZone[] = MARCH_THAW_ROOF_ZONES;

export function getSrpenPois(isNight = false): Record<SrpenPoiId, SrpenPoi> {
  return isNight ? SRPEN_NIGHT_POIS : SRPEN_POIS;
}

export function getSrpenPoisList(isNight = false): SrpenPoi[] {
  return isNight ? SRPEN_NIGHT_POIS_LIST : SRPEN_POIS_LIST;
}

export function isInsideSrpenPoi(
  x: number,
  y: number,
  poiOrId: SrpenPoi | SrpenPoiId,
  extraRadius = 0
): boolean {
  const poi = typeof poiOrId === 'string' ? SRPEN_POIS[poiOrId] : poiOrId;
  if (!poi) return false;
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + extraRadius;
  return dx * dx + dy * dy <= r * r;
}

export function getActiveSrpenPoi(x: number, y: number, isNight = false): SrpenPoi | null {
  const list = isNight ? SRPEN_NIGHT_POIS_LIST : SRPEN_POIS_LIST;
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

export function getSrpenWaterEffect(
  x: number,
  y: number,
  time = 0
): { inOpenWater: boolean; inFord: boolean; carryVx: number; carryVy: number } {
  const eff = getMarchWaterAndFloeEffect(x, y, time);
  return {
    inOpenWater: eff.inOpenWater,
    inFord: Boolean((eff as any).inFord),
    carryVx: eff.carryVx,
    carryVy: eff.carryVy,
  };
}

export function collideCircleWithSrpenObstacles(
  x: number,
  y: number,
  r = 18
): { hit: boolean; nx: number; ny: number; x: number; y: number; pushX: number; pushY: number; obstacleId?: string } {
  for (let i = 0; i < SRPEN_OBSTACLES.length; i++) {
    const obs = SRPEN_OBSTACLES[i];
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

export function resolveSrpenObstacles(
  entity: { x: number; y: number; radius?: number; isFlying?: boolean },
  allowFlyingBypass = true
): boolean {
  if (allowFlyingBypass && entity.isFlying) return false;
  const r = entity.radius || 18;
  let anyHit = false;
  for (let pass = 0; pass < 2; pass++) {
    const col = collideCircleWithSrpenObstacles(entity.x, entity.y, r);
    if (!col.hit) break;
    entity.x = col.pushX;
    entity.y = col.pushY;
    anyHit = true;
  }
  return anyHit;
}
