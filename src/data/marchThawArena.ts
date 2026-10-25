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
    radius: 240,
    hint: 'KOSTEL: Zvonice [E] — svatý otřes + léčení a +20 % zbroj',
  },
  tavern: {
    id: 'tavern',
    title: 'Hospoda',
    x: 345,
    y: -120,
    radius: 195,
    hint: 'HOSPODA: Pivní soudek [E] omráčí dav + kuráž (+18 % útok)',
  },
  village: {
    id: 'village',
    title: 'Vesnice a náves',
    x: 55,
    y: -125,
    radius: 210,
    hint: 'VESNICE: Čapí štěstí (+16 % pohyb a 2× rychlejší ultimátka)',
  },
  school: {
    id: 'school',
    title: 'Škola',
    x: 138,
    y: 388,
    radius: 175,
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
export function clampToMarchArenaBounds(entity: {
  x: number;
  y: number;
  radius?: number;
}): boolean {
  if (!entity) return false;
  const r = entity.radius ?? 18;
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
}

export const MARCH_THAW_OBSTACLES: readonly MarchObstacle[] = [
  // --- VESNICE A HOSPODA (Cottages / Chalupy around central village, scaled 1.25x) ---
  { id: 'chalupa_nw', kind: 'chalupa', shape: 'box', x: -169, y: -294, halfW: 64, halfH: 42 },
  { id: 'stork_pole', kind: 'prop', shape: 'circle', x: -44, y: -262, radius: 22 },
  { id: 'chalupa_n', kind: 'chalupa', shape: 'box', x: 94, y: -319, halfW: 68, halfH: 44 },
  { id: 'chalupa_ne', kind: 'chalupa', shape: 'box', x: 319, y: -288, halfW: 66, halfH: 43 },
  // HOSPODA (Main Tavern building on the eastern side of the village green)
  { id: 'hospoda_main', kind: 'chalupa', shape: 'box', x: 356, y: -119, halfW: 82, halfH: 50 },
  // Western village roubenka
  { id: 'chalupa_w', kind: 'chalupa', shape: 'box', x: -206, y: -94, halfW: 62, halfH: 42 },
  // Lower-left village cottage
  { id: 'chalupa_sw', kind: 'chalupa', shape: 'box', x: -94, y: 94, halfW: 64, halfH: 42 },
  // Lower-right village cottage
  { id: 'chalupa_se', kind: 'chalupa', shape: 'box', x: 269, y: 81, halfW: 66, halfH: 43 },

  // --- ŠKOLA (Schoolhouse south of the village green) ---
  { id: 'skola_main', kind: 'school', shape: 'box', x: 138, y: 388, halfW: 80, halfH: 48 },

  // --- KOSTEL NA VRCHU (Church nave + northern/lateral churchyard wall; southern gate is open for [E] bell) ---
  { id: 'kostel_nave', kind: 'church', shape: 'box', x: -800, y: -706, halfW: 72, halfH: 46 },
  { id: 'kostel_tower', kind: 'church', shape: 'circle', x: -731, y: -731, radius: 34 },
  { id: 'kostel_wall_nw', kind: 'wall', shape: 'circle', x: -931, y: -700, radius: 32 },
  { id: 'kostel_wall_ne', kind: 'wall', shape: 'circle', x: -669, y: -700, radius: 32 },

  // --- KAPLIČKA (Wayside village chapel at the crossroads) ---
  { id: 'kaplicka_main', kind: 'shrine', shape: 'circle', x: -675, y: -38, radius: 34 },

  // --- MLÝN (Watermill house; the adjacent flume/wheel zone stays accessible as a hazard) ---
  { id: 'mlyn_house', kind: 'mill', shape: 'box', x: 531, y: 706, halfW: 74, halfH: 46 },

  // --- HORNÍ POLE (Large straw haystack on the left edge of the fields) ---
  { id: 'field_haystack', kind: 'prop', shape: 'circle', x: -288, y: -1075, radius: 52 },

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
      const dx = entity.x - obs.x;
      const dy = entity.y - obs.y;
      const reach = r + obsR;
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
      const clampedX = Math.max(obs.x - hw, Math.min(obs.x + hw, entity.x));
      const clampedY = Math.max(obs.y - hh, Math.min(obs.y + hh, entity.y));
      const dx = entity.x - clampedX;
      const dy = entity.y - clampedY;
      const distSq = dx * dx + dy * dy;

      if (distSq < r * r) {
        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = r - dist;
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

/**
 * Computes the exact position and velocity of a Stage 1 ice floe at time `time` (seconds).
 * Guarantees that every ice floe stays strictly inside the pond or river channel.
 */
export function getMarchIceFloeState(index: number, time: number): MarchIceFloeState {
  const spec =
    MARCH_ICE_FLOE_SPECS[
      ((index % MARCH_ICE_FLOE_SPECS.length) + MARCH_ICE_FLOE_SPECS.length) %
        MARCH_ICE_FLOE_SPECS.length
    ];

  if (spec.zone === 'pond') {
    const theta = spec.phaseOffset + time * spec.angularSpeed;
    const cosTilt = Math.cos(MARCH_POND_REGION.angle);
    const sinTilt = Math.sin(MARCH_POND_REGION.angle);

    const orbitRx = (MARCH_POND_REGION.rx - spec.rx - 16) * spec.orbitRadiusFactor;
    const orbitRy = (MARCH_POND_REGION.ry - spec.ry - 14) * spec.orbitRadiusFactor;

    const lx = Math.cos(theta) * orbitRx;
    const ly = Math.sin(theta) * orbitRy;
    const dlx = -Math.sin(theta) * orbitRx * spec.angularSpeed;
    const dly = Math.cos(theta) * orbitRy * spec.angularSpeed;

    const x = MARCH_POND_REGION.x + lx * cosTilt - ly * sinTilt;
    const y = MARCH_THAW_POIS.pond.y + lx * sinTilt + ly * cosTilt;
    const vx = dlx * cosTilt - dly * sinTilt;
    const vy = dlx * sinTilt + dly * cosTilt;
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

export function isPointInMarchPondWater(x: number, y: number, margin = 0): boolean {
  const dx = x - MARCH_POND_REGION.x;
  const dy = y - MARCH_POND_REGION.y;
  const cosA = Math.cos(-MARCH_POND_REGION.angle);
  const sinA = Math.sin(-MARCH_POND_REGION.angle);
  const lx = dx * cosA - dy * sinA;
  const ly = dx * sinA + dy * cosA;
  const rx = Math.max(10, MARCH_POND_REGION.rx + margin);
  const ry = Math.max(10, MARCH_POND_REGION.ry + margin);
  return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
}

export function isPointOnMarchBridge(x: number, y: number): boolean {
  return (
    Math.abs(x - MARCH_BRIDGE_BOUNDS.x) <= MARCH_BRIDGE_BOUNDS.halfW &&
    Math.abs(y - MARCH_BRIDGE_BOUNDS.y) <= MARCH_BRIDGE_BOUNDS.halfH
  );
}

export function isPointInMarchStreamWater(x: number, y: number): {
  inStream: boolean;
  vx: number;
  vy: number;
} {
  if (isPointOnMarchBridge(x, y)) {
    return { inStream: false, vx: 0, vy: 0 };
  }
  const pts = MARCH_STREAM_WAYPOINTS;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
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
  return { inStream: false, vx: 0, vy: 0 };
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
  if (isPointOnMarchBridge(x, y)) {
    return {
      onBridge: true,
      onFloe: false,
      floeId: null,
      inOpenWater: false,
      waterZone: null,
      carryVx: 0,
      carryVy: 0,
      speedMultiplier: 1.0,
    };
  }

  // First check if the unit is standing on any of the 17 floating ice floes
  for (let i = 0; i < MARCH_ICE_FLOE_SPECS.length; i++) {
    const floe = getMarchIceFloeState(i, time);
    const dx = x - floe.x;
    const dy = y - floe.y;
    const cosA = Math.cos(-floe.angle);
    const sinA = Math.sin(-floe.angle);
    const lx = dx * cosA - dy * sinA;
    const ly = dx * sinA + dy * cosA;
    const rx = floe.rx + 14;
    const ry = floe.ry + 12;
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
  if (isPointInMarchPondWater(x, y, -6)) {
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

  return {
    onBridge: false,
    onFloe: false,
    floeId: null,
    inOpenWater: false,
    waterZone: null,
    carryVx: 0,
    carryVy: 0,
    speedMultiplier: 1.0,
  };
}
