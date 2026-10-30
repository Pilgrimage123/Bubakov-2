import {
  collideCircleWithDubenObstacles,
  hasDubenTerrainLineOfSight,
  hasDubenRoofsInView,
  isEntityBehindDubenRoof,
} from './dubnovyDenArena';

export type MarchThawPoiId =
  | 'fields'
  | 'church'
  | 'tavern'
  | 'village'
  | 'school'
  | 'pond'
  | 'mill'
  | 'forest'
  | 'shrine';

export interface MarchThawPoi {
  id: MarchThawPoiId;
  title: string;
  x: number;
  y: number;
  radius: number;
  hint: string;
}

/**
 * Playable arena bounds for Stage 1 ("BŘEZEN"), scaled +25% larger than the original map.
 * The ornate drawn border coincides with these bounds and acts as an impassable outer wall.
 */
export const MARCH_ARENA_BOUNDS = {
  minX: -1920,
  maxX: 1920,
  minY: -1675,
  maxY: 1675,
} as const;

/**
 * Four larger conifer forest zones ("LES") in the corners/edges of the map.
 * Enemies can spawn from all four forests, and entering any of them grants Forest Cover.
 */
export interface MarchForestZone {
  id: string;
  title: string;
  x: number;
  y: number;
  radius: number;
}

export const MARCH_FOREST_ZONES: readonly MarchForestZone[] = [
  { id: 'les_sz', title: 'Severozápadní les', x: -1225, y: -475, radius: 370 },
  { id: 'les_sv', title: 'Severovýchodní les', x: 1320, y: -980, radius: 380 },
  { id: 'les_jz', title: 'Jihozápadní les', x: -1380, y: 1020, radius: 360 },
  { id: 'les_v', title: 'Východní les', x: 1420, y: -380, radius: 320 },
] as const;

/**
 * Fixed, readable landmarks for level 0 ("Březnové tání"), scaled +25% larger.
 * Every named location on the map has a distinct tactical gameplay effect.
 */
export const MARCH_THAW_POIS: Record<MarchThawPoiId, MarchThawPoi> = {
  fields: {
    id: 'fields',
    title: 'Horní pole',
    x: 225,
    y: -975,
    radius: 340,
    hint: 'POLE: +15 % rychlost v brázdách a zlaté zrní, pozor na pluh!',
  },
  church: {
    id: 'church',
    title: 'Kostel na vrchu',
    x: -800,
    y: -650,
    radius: 320,
    hint: 'KOSTEL: Zvonice [E] — svatý otřes + léčení a +20 % zbroj',
  },
  tavern: {
    id: 'tavern',
    title: 'Hospoda',
    x: 440,
    y: -75,
    radius: 260,
    hint: 'HOSPODA: Pivní soudek [E] omráčí dav + kuráž (+18 % útok)',
  },
  village: {
    id: 'village',
    title: 'Vesnice a náves',
    x: 50,
    y: -75,
    radius: 360,
    hint: 'VESNICE: Čapí štěstí (+16 % pohyb a 2× rychlejší ultimátka)',
  },
  school: {
    id: 'school',
    title: 'Škola',
    x: 125,
    y: 550,
    radius: 240,
    hint: 'ŠKOLA: Školní rákoska zpomaluje bubáky + rychlejší útoky (+20 %)',
  },
  pond: {
    id: 'pond',
    title: 'Rybník',
    x: -725,
    y: 615,
    radius: 300,
    hint: 'RYBNÍK: Kry zrychlují (+20 %), hluboká voda silně zpomaluje a mrazí!',
  },
  mill: {
    id: 'mill',
    title: 'Mlýn a řeka',
    x: 650,
    y: 725,
    radius: 240,
    hint: 'MLÝN: Kolo drtí v náhonu + moučný prach oslepuje nepřátele',
  },
  forest: {
    id: 'forest',
    title: 'Hustý les',
    x: -1225,
    y: -475,
    radius: 370,
    hint: 'LES: Přepady ze všech 4 lesů, ale krytí stromů (+15 % obrana i útok)',
  },
  shrine: {
    id: 'shrine',
    title: 'Kaplička',
    x: -675,
    y: -38,
    radius: 165,
    hint: 'KAPLIČKA: Zjevení Panny Marie s Ježíškem rozhání bubáky + požehnání (+20 % kadence)',
  },
};

export const MARCH_THAW_DECOR = [
  { type: 'march_banner', x: 0, y: -1550, scale: 1.25 },
  { type: 'march_fields', x: MARCH_THAW_POIS.fields.x, y: MARCH_THAW_POIS.fields.y, scale: 1 },
  { type: 'march_church', x: MARCH_THAW_POIS.church.x, y: MARCH_THAW_POIS.church.y, scale: 1 },
  { type: 'march_village', x: MARCH_THAW_POIS.tavern.x, y: MARCH_THAW_POIS.tavern.y, scale: 1 },
  { type: 'march_pond', x: MARCH_THAW_POIS.pond.x, y: MARCH_THAW_POIS.pond.y, scale: 1 },
  { type: 'march_mill', x: MARCH_THAW_POIS.mill.x, y: MARCH_THAW_POIS.mill.y, scale: 1 },
  { type: 'march_forest', x: MARCH_THAW_POIS.forest.x, y: MARCH_THAW_POIS.forest.y, scale: 1 },
  { type: 'march_shrine', x: MARCH_THAW_POIS.shrine.x, y: MARCH_THAW_POIS.shrine.y, scale: 1 },
] as const;

export const MARCH_THAW_POIS_LIST: MarchThawPoi[] = Object.values(MARCH_THAW_POIS);

// The apparition is a meaningful sanctuary event, not a map-wide automatic attack.
// Its cooldown is shared by manual activation and the guarded automatic trigger.
export const MARCH_MARIAN_APPARITION_COOLDOWN = 30;

export function isInsideMarchPoi(x: number, y: number, poi: MarchThawPoi, padding = 0): boolean {
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + padding;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Checks if coordinates (x, y) are inside any of the 4 larger Stage 1 forests.
 */
export function getActiveMarchForestZone(
  x: number,
  y: number,
  padding = 0
): MarchForestZone | null {
  for (let i = 0; i < MARCH_FOREST_ZONES.length; i++) {
    const fz = MARCH_FOREST_ZONES[i];
    const dx = x - fz.x;
    const dy = y - fz.y;
    const r = fz.radius + padding;
    if (dx * dx + dy * dy <= r * r) {
      return fz;
    }
  }
  return null;
}

/**
 * Picks a spawn position inside one of the 4 larger Stage 1 forests.
 * Prefers a forest near the hunter (or cycles across all 4 forests using `seedIndex`).
 */
export function pickMarchForestSpawnPoint(
  playerX: number,
  playerY: number,
  seedIndex = 0
): { x: number; y: number; forest: MarchForestZone } {
  // Sort forests by distance to player, then pick among the closest two or by seedIndex
  let chosen = MARCH_FOREST_ZONES[Math.abs(seedIndex) % MARCH_FOREST_ZONES.length];
  let bestScore = Infinity;
  for (let i = 0; i < MARCH_FOREST_ZONES.length; i++) {
    const fz = MARCH_FOREST_ZONES[i];
    const dist = Math.hypot(fz.x - playerX, fz.y - playerY);
    // Slight rotation across forests so all 4 forests actively spawn enemies
    const jitter = ((i + seedIndex) % MARCH_FOREST_ZONES.length) * 180;
    if (dist + jitter < bestScore) {
      bestScore = dist + jitter;
      chosen = fz;
    }
  }

  const angle = Math.atan2(playerY - chosen.y, playerX - chosen.x) + (Math.sin(seedIndex * 2.1) * 0.65);
  const edgeDist = chosen.radius * 0.68;
  const sx = Math.max(
    MARCH_ARENA_BOUNDS.minX + 60,
    Math.min(MARCH_ARENA_BOUNDS.maxX - 60, chosen.x + Math.cos(angle) * edgeDist)
  );
  const sy = Math.max(
    MARCH_ARENA_BOUNDS.minY + 60,
    Math.min(MARCH_ARENA_BOUNDS.maxY - 60, chosen.y + Math.sin(angle) * edgeDist)
  );

  return { x: sx, y: sy, forest: chosen };
}

/**
 * Clamps any entity (hunter, enemy, or movable prop) strictly inside the drawn Stage 1 arena border.
 * Returns true if the entity was clamped against the outer boundary.
 */
export function clampToMarchArenaBounds(
  entity: {
    x: number;
    y: number;
    radius?: number;
  },
  margin?: number,
): boolean {
  if (!entity) return false;
  const r = margin ?? entity.radius ?? 18;
  const minX = MARCH_ARENA_BOUNDS.minX + r;
  const maxX = MARCH_ARENA_BOUNDS.maxX - r;
  const minY = MARCH_ARENA_BOUNDS.minY + r;
  const maxY = MARCH_ARENA_BOUNDS.maxY - r;

  let clamped = false;
  if (entity.x < minX) {
    entity.x = minX;
    clamped = true;
  } else if (entity.x > maxX) {
    entity.x = maxX;
    clamped = true;
  }

  if (entity.y < minY) {
    entity.y = minY;
    clamped = true;
  } else if (entity.y > maxY) {
    entity.y = maxY;
    clamped = true;
  }

  return clamped;
}

/**
 * Impassable architectural and terrain colliders in Stage 1 ("BŘEZEN"), scaled +25%.
 * Cottages (chalupy), church walls & nave (leaving the southern courtyard gate open),
 * school, watermill building, roadside shrine column, and dense forest perimeters
 * block ground movement organically.
 */
export interface MarchObstacle {
  id: string;
  kind: 'chalupa' | 'church' | 'wall' | 'school' | 'mill' | 'shrine' | 'forest' | 'prop';
  shape: 'circle' | 'box';
  x: number;
  y: number;
  radius?: number;
  halfW?: number;
  halfH?: number;
  cornerRadius?: number;
}

export const MARCH_THAW_OBSTACLES: readonly MarchObstacle[] = [
  // --- VESNICE A HOSPODA (Cottages / Chalupy around central village - ADR 0034) ---
  { id: 'chalupa_nw', kind: 'chalupa', shape: 'box', x: -350, y: -362, halfW: 125, halfH: 70, cornerRadius: 18 },
  { id: 'stork_pole', kind: 'prop', shape: 'circle', x: -88, y: -375, radius: 28 },
  { id: 'chalupa_n', kind: 'chalupa', shape: 'box', x: 100, y: -412, halfW: 130, halfH: 72, cornerRadius: 18 },
  { id: 'chalupa_ne', kind: 'chalupa', shape: 'box', x: 475, y: -375, halfW: 125, halfH: 70, cornerRadius: 18 },
  // HOSPODA (Main Tavern building on the eastern side of the village green)
  { id: 'hospoda_main', kind: 'chalupa', shape: 'box', x: 462, y: -75, halfW: 155, halfH: 82, cornerRadius: 20 },
  // Western village roubenka
  { id: 'chalupa_w', kind: 'chalupa', shape: 'box', x: -375, y: -75, halfW: 120, halfH: 68, cornerRadius: 18 },
  // Lower-left village cottage
  { id: 'chalupa_sw', kind: 'chalupa', shape: 'box', x: -275, y: 200, halfW: 125, halfH: 70, cornerRadius: 18 },
  // Lower-right village cottage
  { id: 'chalupa_se', kind: 'chalupa', shape: 'box', x: 400, y: 200, halfW: 125, halfH: 70, cornerRadius: 18 },

  // --- ŠKOLA (Schoolhouse south of the village green) ---
  { id: 'skola_main', kind: 'school', shape: 'box', x: 125, y: 550, halfW: 150, halfH: 78, cornerRadius: 20 },

  // --- KOSTEL NA VRCHU (Church nave + northern/lateral churchyard wall; southern gate is open for [E] bell) ---
  { id: 'kostel_nave', kind: 'church', shape: 'box', x: -800, y: -700, halfW: 120, halfH: 48, cornerRadius: 16 },
  { id: 'kostel_tower', kind: 'church', shape: 'circle', x: -710, y: -725, radius: 42 },
  { id: 'kostel_wall_nw', kind: 'wall', shape: 'circle', x: -970, y: -710, radius: 45 },
  { id: 'kostel_wall_ne', kind: 'wall', shape: 'circle', x: -630, y: -710, radius: 45 },

  // --- KAPLIČKA (Wayside village chapel at the crossroads) ---
  { id: 'kaplicka_main', kind: 'shrine', shape: 'circle', x: -675, y: -38, radius: 42 },

  // --- MLÝN (Watermill house; the adjacent flume/wheel zone stays accessible as a hazard) ---
  { id: 'mlyn_house', kind: 'mill', shape: 'box', x: 531, y: 706, halfW: 135, halfH: 78, cornerRadius: 20 },

  // --- HORNÍ POLE (Large straw haystack on the left edge of the fields) ---
  { id: 'field_haystack', kind: 'prop', shape: 'circle', x: -288, y: -1075, radius: 64 },

  // --- HUSTÝ LES (Impassable dense forest timberline clusters in the 4 corners) ---
  { id: 'forest_nw_1', kind: 'forest', shape: 'circle', x: -1620, y: -1240, radius: 190 },
  { id: 'forest_nw_2', kind: 'forest', shape: 'circle', x: -1320, y: -1340, radius: 180 },
  { id: 'forest_w_1', kind: 'forest', shape: 'circle', x: -1640, y: -540, radius: 180 },
  { id: 'forest_sw_1', kind: 'forest', shape: 'circle', x: -1600, y: 1180, radius: 195 },
  { id: 'forest_ne_1', kind: 'forest', shape: 'circle', x: 1460, y: -1240, radius: 195 },
  { id: 'forest_e_1', kind: 'forest', shape: 'circle', x: 1540, y: -420, radius: 180 },
] as const;

/**
 * Resolves collisions between an entity (player or ground enemy) and all impassable
 * Stage 1 obstacles (chalupy, church, school, mill, shrine, dense forest), plus clamps
 * the entity inside the outer Stage 1 arena border (`MARCH_ARENA_BOUNDS`).
 */
export function resolveMarchThawObstacles(
  entity: { x: number; y: number; radius?: number },
  isFlying = false
): boolean {
  if (!entity) return false;
  let collided = clampToMarchArenaBounds(entity);
  if (isFlying) return collided;

  const r = entity.radius ?? 18;

  for (let i = 0; i < MARCH_THAW_OBSTACLES.length; i++) {
    const obs = MARCH_THAW_OBSTACLES[i];
    if (obs.shape === 'circle') {
      const obsR = obs.radius ?? 30;
      const reach = r + obsR;
      const dx = entity.x - obs.x;
      if (dx >= reach || dx <= -reach) continue;
      const dy = entity.y - obs.y;
      if (dy >= reach || dy <= -reach) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq < reach * reach) {
        const dist = Math.sqrt(distSq);
        const nx = dist > 0.001 ? dx / dist : 0;
        const ny = dist > 0.001 ? dy / dist : 1;
        const overlap = reach - dist;
        entity.x += nx * overlap;
        entity.y += ny * overlap;
        collided = true;
      }
    } else {
      const hw = obs.halfW ?? 45;
      const hh = obs.halfH ?? 32;
      if (
        entity.x - obs.x >= hw + r ||
        obs.x - entity.x >= hw + r ||
        entity.y - obs.y >= hh + r ||
        obs.y - entity.y >= hh + r
      ) {
        continue;
      }
      const cr = Math.min(obs.cornerRadius ?? 16, Math.min(hw, hh) * 0.5);
      const coreW = hw - cr;
      const coreH = hh - cr;
      const clampedX = Math.max(obs.x - coreW, Math.min(obs.x + coreW, entity.x));
      const clampedY = Math.max(obs.y - coreH, Math.min(obs.y + coreH, entity.y));
      const dx = entity.x - clampedX;
      const dy = entity.y - clampedY;
      const reach = r + cr;
      const distSq = dx * dx + dy * dy;

      if (distSq < reach * reach) {
        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = reach - dist;
          entity.x += (dx / dist) * overlap;
          entity.y += (dy / dist) * overlap;
        } else {
          // Inside box center: push out along nearest axis
          const penLeft = Math.abs(entity.x - (obs.x - hw));
          const penRight = Math.abs(obs.x + hw - entity.x);
          const penTop = Math.abs(entity.y - (obs.y - hh));
          const penBottom = Math.abs(obs.y + hh - entity.y);
          const minPen = Math.min(penLeft, penRight, penTop, penBottom);
          if (minPen === penLeft) entity.x = obs.x - hw - r;
          else if (minPen === penRight) entity.x = obs.x + hw + r;
          else if (minPen === penTop) entity.y = obs.y - hh - r;
          else entity.y = obs.y + hh + r;
        }
        collided = true;
      }
    }
  }

  if (collided) {
    clampToMarchArenaBounds(entity);
  }

  return collided;
}

/**
 * Water bodies in Stage 1 ("BŘEZEN"), scaled +25%:
 * 1. RYBNÍK (Pond in the lower-left)
 * 2. ŘEKA / POTOK A NÁHON (Winding river flowing all the way from the northern arena edge
 *    at y = -1750, under the wooden bridge, through the watermill wheel, right to the southern
 *    arena edge at y = 1750)
 */
export const MARCH_POND_REGION = {
  x: MARCH_THAW_POIS.pond.x,
  y: MARCH_THAW_POIS.pond.y,
  rx: 280,
  ry: 165,
  angle: -0.08,
} as const;

export const MARCH_BRIDGE_BOUNDS = {
  x: 930,
  y: 120,
  halfW: 74,
  halfH: 58,
} as const;

export const MARCH_STREAM_WAYPOINTS: readonly { x: number; y: number; width: number }[] = [
  { x: 880, y: -1750, width: 78 }, // Enters at the northern arena border
  { x: 830, y: -1280, width: 82 },
  { x: 675, y: -840, width: 86 },
  { x: 630, y: -490, width: 92 },
  { x: 940, y: -170, width: 96 },
  { x: 930, y: 120, width: 98 },   // Crossed by wooden road bridge
  { x: 820, y: 390, width: 102 },
  { x: 655, y: 725, width: 110 },  // Millrace & waterwheel
  { x: 765, y: 1080, width: 116 },
  { x: 885, y: 1420, width: 122 },
  { x: 960, y: 1750, width: 126 }, // Exits at the southern arena border
] as const;

export interface MarchIceFloeState {
  id: number;
  zone: 'pond' | 'stream';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  angle: number;
}

interface MarchIceFloeSpec {
  id: number;
  zone: 'pond' | 'stream';
  orbitRadiusFactor: number;
  phaseOffset: number;
  angularSpeed: number;
  rx: number;
  ry: number;
}

export const MARCH_ICE_FLOE_SPECS: readonly MarchIceFloeSpec[] = [
  // 7 Pond ice floes circulating on natural eddy currents strictly inside the Rybník
  { id: 0, zone: 'pond', orbitRadiusFactor: 0.60, phaseOffset: 0.0, angularSpeed: 0.23, rx: 48, ry: 29 },
  { id: 1, zone: 'pond', orbitRadiusFactor: 0.64, phaseOffset: 1.15, angularSpeed: 0.21, rx: 44, ry: 27 },
  { id: 2, zone: 'pond', orbitRadiusFactor: 0.55, phaseOffset: 2.35, angularSpeed: 0.24, rx: 50, ry: 30 },
  { id: 3, zone: 'pond', orbitRadiusFactor: 0.66, phaseOffset: 3.5, angularSpeed: 0.20, rx: 42, ry: 26 },
  { id: 4, zone: 'pond', orbitRadiusFactor: 0.50, phaseOffset: 4.65, angularSpeed: 0.25, rx: 46, ry: 28 },
  { id: 5, zone: 'pond', orbitRadiusFactor: 0.30, phaseOffset: 1.8, angularSpeed: -0.19, rx: 40, ry: 24 },
  { id: 6, zone: 'pond', orbitRadiusFactor: 0.34, phaseOffset: 4.9, angularSpeed: -0.18, rx: 42, ry: 25 },

  // 10 Stream ice floes drifting downstream along the entire river from top border to bottom border
  { id: 7, zone: 'stream', orbitRadiusFactor: 0.0, phaseOffset: 0.03, angularSpeed: 0.025, rx: 38, ry: 23 },
  { id: 8, zone: 'stream', orbitRadiusFactor: 0.14, phaseOffset: 0.13, angularSpeed: 0.025, rx: 42, ry: 25 },
  { id: 9, zone: 'stream', orbitRadiusFactor: -0.12, phaseOffset: 0.23, angularSpeed: 0.025, rx: 36, ry: 22 },
  { id: 10, zone: 'stream', orbitRadiusFactor: 0.1, phaseOffset: 0.33, angularSpeed: 0.025, rx: 44, ry: 26 },
  { id: 11, zone: 'stream', orbitRadiusFactor: -0.08, phaseOffset: 0.43, angularSpeed: 0.025, rx: 40, ry: 24 },
  { id: 12, zone: 'stream', orbitRadiusFactor: 0.12, phaseOffset: 0.53, angularSpeed: 0.025, rx: 45, ry: 26 },
  { id: 13, zone: 'stream', orbitRadiusFactor: -0.06, phaseOffset: 0.63, angularSpeed: 0.025, rx: 39, ry: 23 },
  { id: 14, zone: 'stream', orbitRadiusFactor: 0.09, phaseOffset: 0.73, angularSpeed: 0.025, rx: 43, ry: 25 },
  { id: 15, zone: 'stream', orbitRadiusFactor: -0.11, phaseOffset: 0.83, angularSpeed: 0.025, rx: 37, ry: 22 },
  { id: 16, zone: 'stream', orbitRadiusFactor: 0.05, phaseOffset: 0.93, angularSpeed: 0.025, rx: 41, ry: 24 },
] as const;

/**
 * Evaluates a point along the winding river polyline for normalized parameter u in [0, 1].
 */
export function sampleMarchStreamPath(u: number): {
  x: number;
  y: number;
  tx: number;
  ty: number;
  width: number;
} {
  const pts = MARCH_STREAM_WAYPOINTS;
  const segCount = pts.length - 1;
  const clamped = ((u % 1) + 1) % 1;
  const scaled = clamped * segCount;
  const idx = Math.min(segCount - 1, Math.floor(scaled));
  const frac = scaled - idx;

  const p0 = pts[Math.max(0, idx - 1)];
  const p1 = pts[idx];
  const p2 = pts[idx + 1];
  const p3 = pts[Math.min(pts.length - 1, idx + 2)];

  const t2 = frac * frac;
  const t3 = t2 * frac;

  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * frac +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * frac +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

  const dx =
    0.5 *
    (-p0.x +
      p2.x +
      2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * frac +
      3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2);
  const dy =
    0.5 *
    (-p0.y +
      p2.y +
      2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * frac +
      3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2);

  const len = Math.hypot(dx, dy) || 1;
  const width = p1.width + (p2.width - p1.width) * frac;

  return {
    x,
    y,
    tx: dx / len,
    ty: dy / len,
    width,
  };
}

const POND_COS_TILT = Math.cos(MARCH_POND_REGION.angle);
const POND_SIN_TILT = Math.sin(MARCH_POND_REGION.angle);
const POND_COS_NEG_TILT = Math.cos(-MARCH_POND_REGION.angle);
const POND_SIN_NEG_TILT = Math.sin(-MARCH_POND_REGION.angle);

let _cachedFloeTime = Number.NaN;
const _cachedFloeStates: MarchIceFloeState[] = new Array(MARCH_ICE_FLOE_SPECS.length);
const _cachedFloeCosNeg: Float64Array = new Float64Array(MARCH_ICE_FLOE_SPECS.length);
const _cachedFloeSinNeg: Float64Array = new Float64Array(MARCH_ICE_FLOE_SPECS.length);

function computeMarchIceFloeStateAt(specIndex: number, time: number): MarchIceFloeState {
  const spec = MARCH_ICE_FLOE_SPECS[specIndex];

  if (spec.zone === 'pond') {
    const theta = spec.phaseOffset + time * spec.angularSpeed;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const orbitRx = (MARCH_POND_REGION.rx - spec.rx - 16) * spec.orbitRadiusFactor;
    const orbitRy = (MARCH_POND_REGION.ry - spec.ry - 14) * spec.orbitRadiusFactor;

    const lx = cosTheta * orbitRx;
    const ly = sinTheta * orbitRy;
    const dlx = -sinTheta * orbitRx * spec.angularSpeed;
    const dly = cosTheta * orbitRy * spec.angularSpeed;

    const x = MARCH_POND_REGION.x + lx * POND_COS_TILT - ly * POND_SIN_TILT;
    const y = MARCH_THAW_POIS.pond.y + lx * POND_SIN_TILT + ly * POND_COS_TILT;
    const vx = dlx * POND_COS_TILT - dly * POND_SIN_TILT;
    const vy = dlx * POND_SIN_TILT + dly * POND_COS_TILT;
    const angle = Math.sin(time * 0.6 + spec.id) * 0.14 + MARCH_POND_REGION.angle;

    return {
      id: spec.id,
      zone: 'pond',
      x,
      y,
      vx,
      vy,
      rx: spec.rx,
      ry: spec.ry,
      angle,
    };
  }

  // Stream ice floe: travels smoothly down the river from the top arena border to the bottom border
  const u = (spec.phaseOffset + time * spec.angularSpeed) % 1;
  const sample = sampleMarchStreamPath(u);
  const nx = -sample.ty;
  const ny = sample.tx;
  const lateralOffset = spec.orbitRadiusFactor * sample.width * 0.42;
  const streamSpeed = 88; // px/s downstream

  return {
    id: spec.id,
    zone: 'stream',
    x: sample.x + nx * lateralOffset,
    y: sample.y + ny * lateralOffset,
    vx: sample.tx * streamSpeed,
    vy: sample.ty * streamSpeed,
    rx: spec.rx,
    ry: spec.ry,
    angle: Math.atan2(sample.ty, sample.tx) - Math.PI / 2 + Math.sin(time * 0.9 + spec.id) * 0.1,
  };
}

function ensureMarchIceFloesForTime(time: number): void {
  if (_cachedFloeTime === time) return;
  _cachedFloeTime = time;
  for (let i = 0; i < MARCH_ICE_FLOE_SPECS.length; i++) {
    const state = computeMarchIceFloeStateAt(i, time);
    _cachedFloeStates[i] = state;
    _cachedFloeCosNeg[i] = Math.cos(-state.angle);
    _cachedFloeSinNeg[i] = Math.sin(-state.angle);
  }
}

/**
 * Computes the exact position and velocity of a Stage 1 ice floe at time `time` (seconds).
 * Guarantees that every ice floe stays strictly inside the pond or river channel.
 */
export function getMarchIceFloeState(index: number, time: number): MarchIceFloeState {
  ensureMarchIceFloesForTime(time);
  const len = MARCH_ICE_FLOE_SPECS.length;
  const normalizedIdx = ((index % len) + len) % len;
  return _cachedFloeStates[normalizedIdx];
}

export function isPointInMarchPondWater(x: number, y: number, margin = 0): boolean {
  const rx = Math.max(10, MARCH_POND_REGION.rx + margin);
  const dx = x - MARCH_POND_REGION.x;
  if (dx > rx || dx < -rx) return false;
  const dy = y - MARCH_POND_REGION.y;
  if (dy > rx || dy < -rx) return false;
  const ry = Math.max(10, MARCH_POND_REGION.ry + margin);
  const lx = dx * POND_COS_NEG_TILT - dy * POND_SIN_NEG_TILT;
  const ly = dx * POND_SIN_NEG_TILT + dy * POND_COS_NEG_TILT;
  return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
}

export function isPointOnMarchBridge(x: number, y: number): boolean {
  return (
    Math.abs(x - MARCH_BRIDGE_BOUNDS.x) <= MARCH_BRIDGE_BOUNDS.halfW &&
    Math.abs(y - MARCH_BRIDGE_BOUNDS.y) <= MARCH_BRIDGE_BOUNDS.halfH
  );
}

const STREAM_NONE_RESULT = { inStream: false, vx: 0, vy: 0 } as const;

export function isPointInMarchStreamWater(x: number, y: number): {
  inStream: boolean;
  vx: number;
  vy: number;
} {
  if (x < 530 || x > 1070 || y < -1820 || y > 1820) {
    return STREAM_NONE_RESULT;
  }
  if (isPointOnMarchBridge(x, y)) {
    return STREAM_NONE_RESULT;
  }
  const pts = MARCH_STREAM_WAYPOINTS;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const maxHalfW = (a.width >= b.width ? a.width : b.width) * 0.5;
    if (y < a.y - maxHalfW || y > b.y + maxHalfW) continue;
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * abx + (y - a.y) * aby) / lenSq));
    const px = a.x + abx * t;
    const py = a.y + aby * t;
    const halfWidth = (a.width + (b.width - a.width) * t) * 0.5;
    const distSq = (x - px) * (x - px) + (y - py) * (y - py);
    if (distSq <= halfWidth * halfWidth) {
      const len = Math.sqrt(lenSq) || 1;
      return {
        inStream: true,
        vx: (abx / len) * 68,
        vy: (aby / len) * 68,
      };
    }
  }
  return STREAM_NONE_RESULT;
}

/**
 * Checks whether an enemy is a water spirit / aquatic creature (vodnický)
 * that is immune to the heavy river wading slow.
 */
export function isAquaticEnemy(e: any): boolean {
  if (!e) return false;
  if (e.category === 'water') return true;
  const id = e.id || '';
  return (
    id === 'vodnicek' ||
    id === 'hastrman' ||
    id === 'kalny_hastrman' ||
    id === 'topivec' ||
    id === 'bludicka' ||
    id === 'zaba'
  );
}

export interface MarchWaterAndFloeEffect {
  onBridge: boolean;
  onFloe: boolean;
  floeId: number | null;
  inOpenWater: boolean;
  waterZone: 'pond' | 'stream' | null;
  carryVx: number;
  carryVy: number;
  speedMultiplier: number;
}

const DRY_LAND_EFFECT: MarchWaterAndFloeEffect = {
  onBridge: false,
  onFloe: false,
  floeId: null,
  inOpenWater: false,
  waterZone: null,
  carryVx: 0,
  carryVy: 0,
  speedMultiplier: 1.0,
};

const BRIDGE_EFFECT: MarchWaterAndFloeEffect = {
  onBridge: true,
  onFloe: false,
  floeId: null,
  inOpenWater: false,
  waterZone: null,
  carryVx: 0,
  carryVy: 0,
  speedMultiplier: 1.0,
};

/**
 * Evaluates how Stage 1 water and floating ice floes affect a unit at (x, y).
 * - Standing on an ice floe carries the unit with the floe, grants +20% sliding speed,
 *   and protects them from freezing water and river drag.
 * - Wading in open water (river or pond) off the floes VERY STRONGLY slows movement
 *   (speedMultiplier = 0.28, i.e. 72% slow for non-flying / non-aquatic units) and builds freezing exposure.
 */
export function getMarchWaterAndFloeEffect(
  x: number,
  y: number,
  time: number
): MarchWaterAndFloeEffect {
  const nearPond = x >= -1040 && x <= -410 && y >= 410 && y <= 820;
  const nearStream = x >= 530 && x <= 1070 && y >= -1820 && y <= 1820;

  if (!nearPond && !nearStream) {
    return DRY_LAND_EFFECT;
  }

  if (nearStream && isPointOnMarchBridge(x, y)) {
    return BRIDGE_EFFECT;
  }

  ensureMarchIceFloesForTime(time);

  // Check only the floe subset (0..6 for pond, 7..16 for stream) matching the unit's corridor
  const startIdx = nearPond ? 0 : 7;
  const endIdx = nearStream ? MARCH_ICE_FLOE_SPECS.length : 7;

  for (let i = startIdx; i < endIdx; i++) {
    const floe = _cachedFloeStates[i];
    const rx = floe.rx + 14;
    const dx = x - floe.x;
    if (dx > rx || dx < -rx) continue;
    const dy = y - floe.y;
    if (dy > rx || dy < -rx) continue;
    const ry = floe.ry + 12;
    const cosA = _cachedFloeCosNeg[i];
    const sinA = _cachedFloeSinNeg[i];
    const lx = dx * cosA - dy * sinA;
    const ly = dx * sinA + dy * cosA;
    if ((lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1) {
      return {
        onBridge: false,
        onFloe: true,
        floeId: floe.id,
        inOpenWater: false,
        waterZone: floe.zone,
        carryVx: floe.vx,
        carryVy: floe.vy,
        speedMultiplier: 1.2,
      };
    }
  }

  // Wading in open pond water off the ice floes: strong 68% slow
  if (nearPond && isPointInMarchPondWater(x, y, -6)) {
    return {
      onBridge: false,
      onFloe: false,
      floeId: null,
      inOpenWater: true,
      waterZone: 'pond',
      carryVx: Math.cos(time * 0.8) * 16,
      carryVy: Math.sin(time * 0.8) * 11,
      speedMultiplier: 0.32,
    };
  }

  // Wading in the river off the ice floes & bridge: VERY STRONG 72% slow (speedMultiplier = 0.28)
  if (nearStream) {
    const streamCheck = isPointInMarchStreamWater(x, y);
    if (streamCheck.inStream) {
      return {
        onBridge: false,
        onFloe: false,
        floeId: null,
        inOpenWater: true,
        waterZone: 'stream',
        carryVx: streamCheck.vx,
        carryVy: streamCheck.vy,
        speedMultiplier: 0.28,
      };
    }
  }

  return DRY_LAND_EFFECT;
}

export interface ObstacleCollisionResult {
  hit: boolean;
  nx: number;
  ny: number;
  x: number;
  y: number;
  pushX: number;
  pushY: number;
  obstacleId?: string;
}

const NON_BLOCKING_DECOR_TYPES = new Set([
  'pond',
  'stream',
  'ice_floe',
  'flower',
  'grass',
  'pebble',
  'mud',
  'reed',
  'lily',
  'bridge',
]);

export function isSolidDecorObstacle(dec: any): boolean {
  if (!dec || !dec.isObstacle) return false;
  if (NON_BLOCKING_DECOR_TYPES.has(dec.type)) return false;
  return true;
}

interface FilteredDecorCacheEntry {
  length: number;
  firstItem: any;
  lastItem: any;
  solidObstacles: any[];
  roofItems: Array<{ dec: any; index: number }>;
}

const _decorFilterCache = new WeakMap<any[], FilteredDecorCacheEntry>();

function getFilteredDecorCache(decor: any[]): FilteredDecorCacheEntry {
  const len = decor.length;
  const first = len > 0 ? decor[0] : undefined;
  const last = len > 0 ? decor[len - 1] : undefined;
  let entry = _decorFilterCache.get(decor);
  if (
    entry &&
    entry.length === len &&
    entry.firstItem === first &&
    entry.lastItem === last
  ) {
    return entry;
  }

  const solidObstacles: any[] = [];
  const roofItems: Array<{ dec: any; index: number }> = [];
  for (let i = 0; i < len; i++) {
    const dec = decor[i];
    if (!dec) continue;
    if (isSolidDecorObstacle(dec)) {
      solidObstacles.push(dec);
    }
    if (dec.type === 'chalupa' || dec.type === 'church') {
      roofItems.push({ dec, index: i });
    }
  }

  entry = {
    length: len,
    firstItem: first,
    lastItem: last,
    solidObstacles,
    roofItems,
  };
  _decorFilterCache.set(decor, entry);
  return entry;
}

/**
 * Tests a circle (projectile, orbiting companion, or entity) against solid impassable
 * obstacles (cottages, church, school, mill, stone walls, dense forests, haystacks,
 * and solid procedural decor obstacles; NEVER water/pond/stream).
 * Returns surface normal (nx, ny) and pushed-out position (x/y and pushX/pushY) on hit.
 */
export function collideCircleWithObstacles(
  x: number,
  y: number,
  radius: number,
  activeLevelId = 0,
  decor?: any[],
): ObstacleCollisionResult {
  const r = Math.max(2, radius || 8);

  if (activeLevelId === 2) {
    const dubenHit = collideCircleWithDubenObstacles(x, y, radius);
    if (dubenHit.hit) return dubenHit as ObstacleCollisionResult;
  }

  if (activeLevelId === 0 || activeLevelId === 1) {
    for (let i = 0; i < MARCH_THAW_OBSTACLES.length; i++) {
      const obs = MARCH_THAW_OBSTACLES[i];
      if (obs.shape === 'box') {
        const hw = obs.halfW || 40;
        const hh = obs.halfH || 40;
        if (
          x - obs.x >= hw + r ||
          obs.x - x >= hw + r ||
          y - obs.y >= hh + r ||
          obs.y - y >= hh + r
        ) {
          continue;
        }
        const minX = obs.x - hw;
        const maxX = obs.x + hw;
        const minY = obs.y - hh;
        const maxY = obs.y + hh;
        const cx = Math.max(minX, Math.min(maxX, x));
        const cy = Math.max(minY, Math.min(maxY, y));
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;

        if (distSq < r * r) {
          if (dx !== 0 || dy !== 0) {
            const dist = Math.sqrt(distSq) || 1;
            const nx = dx / dist;
            const ny = dy / dist;
            const px = cx + nx * (r + 1.5);
            const py = cy + ny * (r + 1.5);
            return {
              hit: true,
              nx,
              ny,
              x: px,
              y: py,
              pushX: px,
              pushY: py,
              obstacleId: obs.id,
            };
          } else {
            // Center is inside the rectangle: find nearest edge
            const dLeft = x - minX;
            const dRight = maxX - x;
            const dTop = y - minY;
            const dBottom = maxY - y;
            const minEdge = Math.min(dLeft, dRight, dTop, dBottom);
            if (minEdge === dLeft) {
              const px = minX - r - 1.5;
              return { hit: true, nx: -1, ny: 0, x: px, y, pushX: px, pushY: y, obstacleId: obs.id };
            } else if (minEdge === dRight) {
              const px = maxX + r + 1.5;
              return { hit: true, nx: 1, ny: 0, x: px, y, pushX: px, pushY: y, obstacleId: obs.id };
            } else if (minEdge === dTop) {
              const py = minY - r - 1.5;
              return { hit: true, nx: 0, ny: -1, x, y: py, pushX: x, pushY: py, obstacleId: obs.id };
            } else {
              const py = maxY + r + 1.5;
              return { hit: true, nx: 0, ny: 1, x, y: py, pushX: x, pushY: py, obstacleId: obs.id };
            }
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
          return {
            hit: true,
            nx,
            ny,
            x: px,
            y: py,
            pushX: px,
            pushY: py,
            obstacleId: obs.id,
          };
        }
      }
    }
  }

  if (decor && decor.length > 0) {
    const solidDecor = getFilteredDecorCache(decor).solidObstacles;
    for (let i = 0; i < solidDecor.length; i++) {
      const dec = solidDecor[i];
      const dr = Math.max(10, dec.radius || 24);
      const reach = dr + r;
      const dx = x - dec.x;
      if (dx >= reach || dx <= -reach) continue;
      const dy = y - dec.y;
      if (dy >= reach || dy <= -reach) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq < reach * reach) {
        const dist = Math.sqrt(distSq) || 1;
        const nx = dist > 0.001 ? dx / dist : 1;
        const ny = dist > 0.001 ? dy / dist : 0;
        const px = dec.x + nx * (reach + 1.5);
        const py = dec.y + ny * (reach + 1.5);
        return {
          hit: true,
          nx,
          ny,
          x: px,
          y: py,
          pushX: px,
          pushY: py,
          obstacleId: dec.type || 'decor',
        };
      }
    }
  }

  return { hit: false, nx: 0, ny: 0, x, y, pushX: x, pushY: y };
}

function segmentIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): boolean {
  // Fast AABB reject before Liang-Barsky division
  if (
    (x1 < minX && x2 < minX) ||
    (x1 > maxX && x2 > maxX) ||
    (y1 < minY && y2 < minY) ||
    (y1 > maxY && y2 > maxY)
  ) {
    return false;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;

  // Unrolled Liang-Barsky 4-edge check (zero array allocations)
  if (Math.abs(dx) < 1e-8) {
    if (x1 < minX || x1 > maxX) return false;
  } else {
    const invDx = 1 / dx;
    let tNear = (minX - x1) * invDx;
    let tFar = (maxX - x1) * invDx;
    if (tNear > tFar) {
      const tmp = tNear;
      tNear = tFar;
      tFar = tmp;
    }
    if (tNear > t0) t0 = tNear;
    if (tFar < t1) t1 = tFar;
    if (t0 > t1) return false;
  }

  if (Math.abs(dy) < 1e-8) {
    if (y1 < minY || y1 > maxY) return false;
  } else {
    const invDy = 1 / dy;
    let tNear = (minY - y1) * invDy;
    let tFar = (maxY - y1) * invDy;
    if (tNear > tFar) {
      const tmp = tNear;
      tNear = tFar;
      tFar = tmp;
    }
    if (tNear > t0) t0 = tNear;
    if (tFar < t1) t1 = tFar;
    if (t0 > t1) return false;
  }

  return t0 <= t1;
}

function segmentIntersectsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  if (
    (x1 <= cx - r && x2 <= cx - r) ||
    (x1 >= cx + r && x2 >= cx + r) ||
    (y1 <= cy - r && y2 <= cy - r) ||
    (y1 >= cy + r && y2 >= cy + r)
  ) {
    return false;
  }
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) {
    const ex = x1 - cx;
    const ey = y1 - cy;
    return ex * ex + ey * ey < r * r;
  }
  let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const px = x1 + t * dx - cx;
  const py = y1 + t * dy - cy;
  return px * px + py * py < r * r;
}

/**
 * Checks if a line of sight between (x1, y1) and (x2, y2) is unobstructed by
 * solid buildings, walls, and dense forests (water/rivers/ponds never block LoS).
 */
export function hasTerrainLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  activeLevelId = 0,
  decor?: any[],
): boolean {
  if (activeLevelId === 2) {
    if (!hasDubenTerrainLineOfSight(x1, y1, x2, y2)) return false;
  }

  if (activeLevelId === 0 || activeLevelId === 1) {
    for (let i = 0; i < MARCH_THAW_OBSTACLES.length; i++) {
      const obs = MARCH_THAW_OBSTACLES[i];
      if (obs.shape === 'box') {
        const hw = Math.max(8, (obs.halfW || 40) - 4);
        const hh = Math.max(8, (obs.halfH || 40) - 4);
        if (
          segmentIntersectsRect(
            x1,
            y1,
            x2,
            y2,
            obs.x - hw,
            obs.y - hh,
            obs.x + hw,
            obs.y + hh,
          )
        ) {
          return false;
        }
      } else {
        const r = Math.max(8, (obs.radius || 30) - 4);
        if (segmentIntersectsCircle(x1, y1, x2, y2, obs.x, obs.y, r)) {
          return false;
        }
      }
    }
  }

  if (decor && decor.length > 0) {
    const solidDecor = getFilteredDecorCache(decor).solidObstacles;
    for (let i = 0; i < solidDecor.length; i++) {
      const dec = solidDecor[i];
      const r = Math.max(8, (dec.radius || 24) - 4);
      if (segmentIntersectsCircle(x1, y1, x2, y2, dec.x, dec.y, r)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Walkable roof occlusion zones behind cottages, tavern, school, mill, and church in Stage 1.
 * Coordinates are in world space (already scaled by 1.25x to match MARCH_THAW_OBSTACLES).
 */
export interface MarchRoofZone {
  id: string;
  /** World center X of the building */
  cx: number;
  /** World center Y of the building foundation */
  cy: number;
  /** Unscaled cottage width in SVG landscape space */
  svgW: number;
  /** Unscaled cottage wall height in SVG landscape space */
  svgH: number;
  /** Unscaled cottage roof height in SVG landscape space */
  svgRoofH: number;
  /** World bounding box of the roof canopy where walking entities are occluded */
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const SVG_SCALE = 1.25;

function makeCottageRoofZone(
  id: string,
  svgX: number,
  svgY: number,
  svgW: number,
  svgH: number,
  svgRoofH: number,
): MarchRoofZone {
  const cx = svgX * SVG_SCALE;
  const cy = svgY * SVG_SCALE;
  const hw = (svgW / 2) * SVG_SCALE;
  const hh = (svgH / 2) * SVG_SCALE;
  const rH = svgRoofH * SVG_SCALE;
  return {
    id,
    cx,
    cy,
    svgW,
    svgH,
    svgRoofH,
    minX: cx - hw - 18,
    maxX: cx + hw + 18,
    // Roof ridge is at cy - hh - rH; eaves are at cy - hh + 4.
    // Entities whose feet are in [cy - hh - rH - 8, cy - hh + 24] have their body behind the roof!
    minY: cy - hh - rH - 8,
    maxY: cy - hh + 24,
  };
}

export const MARCH_THAW_ROOF_ZONES: MarchRoofZone[] = [
  makeCottageRoofZone('chalupa_nw', -280, -290, 200, 110, 90),
  makeCottageRoofZone('chalupa_n', 80, -330, 210, 115, 92),
  makeCottageRoofZone('chalupa_ne', 380, -300, 200, 110, 90),
  makeCottageRoofZone('chalupa_w', -300, -60, 190, 110, 88),
  makeCottageRoofZone('chalupa_sw', -220, 160, 200, 110, 90),
  makeCottageRoofZone('chalupa_se', 320, 160, 200, 110, 90),
  makeCottageRoofZone('hospoda_main', 370, -60, 250, 130, 100),
  makeCottageRoofZone('skola_main', 100, 440, 240, 125, 95),
  makeCottageRoofZone('mlyn_house', 425, 565, 215, 125, 95),
  // St. Peter & Paul Church nave & tower spire roof zone
  {
    id: 'kostel',
    cx: -800,
    cy: -650,
    svgW: 160,
    svgH: 90,
    svgRoofH: 95,
    minX: -885,
    maxX: -695,
    minY: -895,
    maxY: -715,
  },
];

export let ROOF_UNION_MIN_X = Infinity;
export let ROOF_UNION_MAX_X = -Infinity;
export let ROOF_UNION_MIN_Y = Infinity;
export let ROOF_UNION_MAX_Y = -Infinity;
for (let i = 0; i < MARCH_THAW_ROOF_ZONES.length; i++) {
  const z = MARCH_THAW_ROOF_ZONES[i];
  if (z.minX < ROOF_UNION_MIN_X) ROOF_UNION_MIN_X = z.minX;
  if (z.maxX > ROOF_UNION_MAX_X) ROOF_UNION_MAX_X = z.maxX;
  if (z.minY < ROOF_UNION_MIN_Y) ROOF_UNION_MIN_Y = z.minY;
  if (z.maxY > ROOF_UNION_MAX_Y) ROOF_UNION_MAX_Y = z.maxY;
}

/**
 * Fast viewport intersection check: determines if any March Thaw or decor building roofs
 * overlap the visible camera view, allowing the roof occlusion pass to early-exit in O(1).
 */
export function hasRoofsInView(
  activeLevelId = 0,
  decor: any[] | undefined,
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number
): boolean {
  if (activeLevelId === 2) {
    if (hasDubenRoofsInView(viewLeft, viewTop, viewRight, viewBottom)) return true;
  }
  if (
    (activeLevelId === 0 || activeLevelId === 1) &&
    viewRight >= ROOF_UNION_MIN_X &&
    viewLeft <= ROOF_UNION_MAX_X &&
    viewBottom >= ROOF_UNION_MIN_Y &&
    viewTop <= ROOF_UNION_MAX_Y
  ) {
    return true;
  }
  if (decor && decor.length > 0) {
    const roofItems = getFilteredDecorCache(decor).roofItems;
    for (let i = 0; i < roofItems.length; i++) {
      const dec = roofItems[i].dec;
      const sc = dec.scale || 1;
      const r = 120 * sc;
      if (
        dec.x + r >= viewLeft &&
        dec.x - r <= viewRight &&
        dec.y + r >= viewTop &&
        dec.y - r <= viewBottom
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns the roof occlusion zone if an entity at (x, y) is walking behind a building roof
 * and should be occluded by the roof with a semi-transparent silhouette, or null otherwise.
 */
export function isEntityBehindMarchRoof(
  x: number,
  y: number,
  activeLevelId = 0,
  decor?: any[],
  radius = 18,
): MarchRoofZone | null {
  if (activeLevelId === 2) {
    const dubenRoof = isEntityBehindDubenRoof(x, y);
    if (dubenRoof) return dubenRoof as unknown as MarchRoofZone;
  }
  if (activeLevelId === 0 || activeLevelId === 1) {
    const halfR = radius * 0.5;
    if (
      y >= ROOF_UNION_MIN_Y &&
      y <= ROOF_UNION_MAX_Y &&
      x + halfR >= ROOF_UNION_MIN_X &&
      x - halfR <= ROOF_UNION_MAX_X
    ) {
      for (let i = 0; i < MARCH_THAW_ROOF_ZONES.length; i++) {
        const z = MARCH_THAW_ROOF_ZONES[i];
        if (
          x + halfR >= z.minX &&
          x - halfR <= z.maxX &&
          y >= z.minY &&
          y <= z.maxY
        ) {
          return z;
        }
      }
    }
  }

  if (decor && decor.length > 0) {
    const roofItems = getFilteredDecorCache(decor).roofItems;
    for (let i = 0; i < roofItems.length; i++) {
      const { dec, index } = roofItems[i];
      const sc = dec.scale || 1;
      const roofHalfW = (dec.type === 'church' ? 68 : 56) * sc;
      const roofTopOffset = (dec.type === 'church' ? 115 : 88) * sc;
      const roofBottomOffset = (dec.type === 'church' ? 18 : 14) * sc;
      if (
        Math.abs(x - dec.x) <= roofHalfW &&
        y >= dec.y - roofTopOffset &&
        y <= dec.y - roofBottomOffset
      ) {
        return {
          id: `decor-roof-${index}`,
          cx: dec.x,
          cy: dec.y,
          svgW: 112 * sc,
          svgH: 56 * sc,
          svgRoofH: 74 * sc,
          minX: dec.x - roofHalfW,
          maxX: dec.x + roofHalfW,
          minY: dec.y - roofTopOffset,
          maxY: dec.y - roofBottomOffset,
        };
      }
    }
  }

  return null;
}

/**
 * Ensures any spawned entity (bubák, miniboss, boss, treasure, Chasník, Dědeček, Bubácká díra)
 * is strictly inside MARCH_ARENA_BOUNDS and pushed outside any solid obstacle.
 */
export function sanitizeArenaSpawnPoint(
  x: number,
  y: number,
  radius = 24,
  activeLevelId = 0,
  decor?: any[],
  margin = 48,
): { x: number; y: number } {
  const safeMargin = Math.max(24, margin) + Math.max(8, radius);
  const minX = MARCH_ARENA_BOUNDS.minX + safeMargin;
  const maxX = MARCH_ARENA_BOUNDS.maxX - safeMargin;
  const minY = MARCH_ARENA_BOUNDS.minY + safeMargin;
  const maxY = MARCH_ARENA_BOUNDS.maxY - safeMargin;

  const dummy = {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
    radius: Math.max(14, radius),
  };

  const solidDecor = decor && decor.length > 0 ? getFilteredDecorCache(decor).solidObstacles : null;

  for (let pass = 0; pass < 3; pass++) {
    if (activeLevelId === 0 || activeLevelId === 1) {
      resolveMarchThawObstacles(dummy, false);
    }
    if (solidDecor && solidDecor.length > 0) {
      for (let i = 0; i < solidDecor.length; i++) {
        const dec = solidDecor[i];
        const reach = (dec.radius || 24) + dummy.radius + 4;
        const dx = dummy.x - dec.x;
        if (dx >= reach || dx <= -reach) continue;
        const dy = dummy.y - dec.y;
        if (dy >= reach || dy <= -reach) continue;
        const distSq = dx * dx + dy * dy;
        if (distSq < reach * reach) {
          const dist = Math.sqrt(distSq) || 1;
          const nx = dist > 0.001 ? dx / dist : 1;
          const ny = dist > 0.001 ? dy / dist : 0;
          dummy.x = dec.x + nx * reach;
          dummy.y = dec.y + ny * reach;
        }
      }
    }
    dummy.x = Math.max(minX, Math.min(maxX, dummy.x));
    dummy.y = Math.max(minY, Math.min(maxY, dummy.y));
  }

  return { x: dummy.x, y: dummy.y };
}

