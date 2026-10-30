/**
 * Dubnový den Arena Geometry, POIs, Obstacles & Environmental Rules (3. úroveň)
 *
 * Implements the spring village arena for Stage 3 ("3. Duben v Hrusicích – Dubnový den"):
 * - Asymmetric POIs adapted for April: Rozkvetlé meze, Kostel sv. Jiří, Kolednická náves s májkou,
 *   Rozkvetlý ovocný sad, Vyhřátý rybník Brčálník (roztátý, bez ker), Jarní mlýn, Boží muka s kočičkami.
 * - Solid obstacle collision & Line-of-Sight checking for village buildings, stone walls and church.
 * - Outer folk-border clamping (matching standard 3840x3350 playable canvas area).
 * - Interactive Easter Bell peal [E] purging curses, and Maypole warding aura against uřknutí.
 * - Thawed water and mud shallows (slowing non-aquatic ground mobs, empowering frogs).
 */

export type DubenPoiId =
  | 'fields'
  | 'church'
  | 'tavern'
  | 'village'
  | 'orchard'
  | 'pond'
  | 'mill'
  | 'forest'
  | 'shrine';

export interface DubenPoi {
  id: DubenPoiId;
  title: string;
  x: number;
  y: number;
  radius: number;
  hint: string;
}

/**
 * Playable arena bounds for Stage 3 ("DUBEN").
 * Matches the drawn ornate outer boundary and prevents entity escapes.
 */
export const DUBEN_ARENA_BOUNDS = {
  minX: -1920,
  maxX: 1920,
  minY: -1675,
  maxY: 1675,
} as const;

export interface DubenForestZone {
  id: string;
  title: string;
  x: number;
  y: number;
  radius: number;
}

/**
 * 4 sprouting birch and mixed forest groves around the outskirts of Hrusice in April.
 */
export const DUBEN_FOREST_ZONES: readonly DubenForestZone[] = [
  { id: 'les_sz', title: 'Severozápadní březina', x: -1225, y: -475, radius: 370 },
  { id: 'les_sv', title: 'Severovýchodní háj', x: 1320, y: -980, radius: 380 },
  { id: 'les_jz', title: 'Jihozápadní lesík', x: -1380, y: 1020, radius: 360 },
  { id: 'les_v', title: 'Východní mladina', x: 1420, y: -380, radius: 320 },
] as const;

/**
 * April Landmarks & Tactical POIs for Stage 3 ("Dubnový den").
 */
export const DUBEN_POIS: Record<DubenPoiId, DubenPoi> = {
  fields: {
    id: 'fields',
    title: 'Rozkvetlé meze a pole',
    x: 225,
    y: -975,
    radius: 340,
    hint: 'ROZKVETLÉ MEZE: +15 % rychlost v brázdách a oblaka pampeliškového pylu matoucí havěť!',
  },
  church: {
    id: 'church',
    title: 'Kostel sv. Jiří',
    x: -800,
    y: -650,
    radius: 320,
    hint: 'KOSTEL SV. JIŘÍ: Velikonoční zvonice [E] — návrat zvonů z Říma snímá uřknutí a posvěcuje okolí!',
  },
  tavern: {
    id: 'tavern',
    title: 'Kolednická hospoda',
    x: 440,
    y: -75,
    radius: 260,
    hint: 'KOLEDNICKÁ HOSPODA: Velikonoční jidáše a pivo [E] — kuráž (+20 % útok a regenerace)!',
  },
  village: {
    id: 'village',
    title: 'Kolednická náves a májka',
    x: 50,
    y: -75,
    radius: 360,
    hint: 'NÁVES A MÁJKA: Ochranná aura májky štítí před kletbami a uřknutím (+20 % obrana)!',
  },
  orchard: {
    id: 'orchard',
    title: 'Rozkvetlý ovocný sad',
    x: 125,
    y: 550,
    radius: 250,
    hint: 'OVOCNÝ SAD: Kvetoucí třešně a včely — víření okvětních lístků zpomaluje vzdušné nálety!',
  },
  pond: {
    id: 'pond',
    title: 'Vyhřátý rybník Brčálník',
    x: -725,
    y: 615,
    radius: 300,
    hint: 'RYBNÍK BRČÁLNÍK: Jarní tůň bez ledu — mělké bahno zpomaluje pozemní potvory, žabkám svědčí!',
  },
  mill: {
    id: 'mill',
    title: 'Jarní mlýn a řeka',
    x: 650,
    y: 725,
    radius: 240,
    hint: 'JARNÍ MLÝN: Prudká voda v náhonu drtí nepřátele a vodní pěna zrychluje útoky!',
  },
  forest: {
    id: 'forest',
    title: 'Mladý březový háj',
    x: -1225,
    y: -475,
    radius: 370,
    hint: 'BŘEZOVÝ HÁJ: Mladé břízky — krytí (+15 % obrana), ale pozor na čarodějnice sbírající proutí!',
  },
  shrine: {
    id: 'shrine',
    title: 'Boží muka s kočičkami',
    x: -675,
    y: -38,
    radius: 165,
    hint: 'BOŽÍ MUKA: Větvičky jívy s kočičkami žehnají lovci (+20 % kadence útoků)!',
  },
};

export const DUBEN_POIS_LIST: DubenPoi[] = Object.values(DUBEN_POIS);

export const DUBEN_BELL_COOLDOWN = 25;

export function isInsideDubenPoi(x: number, y: number, poi: DubenPoi, padding = 0): boolean {
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + padding;
  return dx * dx + dy * dy <= r * r;
}

export function getActiveDubenForestZone(x: number, y: number, padding = 0): DubenForestZone | null {
  for (let i = 0; i < DUBEN_FOREST_ZONES.length; i++) {
    const fz = DUBEN_FOREST_ZONES[i];
    const dx = x - fz.x;
    const dy = y - fz.y;
    const r = fz.radius + padding;
    if (dx * dx + dy * dy <= r * r) {
      return fz;
    }
  }
  return null;
}

export function pickDubenForestSpawnPoint(
  playerX: number,
  playerY: number,
  seedIndex = 0
): { x: number; y: number; forest: DubenForestZone } {
  let chosen = DUBEN_FOREST_ZONES[Math.abs(seedIndex) % DUBEN_FOREST_ZONES.length];
  let bestScore = Infinity;
  for (let i = 0; i < DUBEN_FOREST_ZONES.length; i++) {
    const fz = DUBEN_FOREST_ZONES[i];
    const dist = Math.hypot(fz.x - playerX, fz.y - playerY);
    const jitter = ((i + seedIndex) % DUBEN_FOREST_ZONES.length) * 180;
    if (dist + jitter < bestScore) {
      bestScore = dist + jitter;
      chosen = fz;
    }
  }

  const angle = Math.atan2(playerY - chosen.y, playerX - chosen.x) + Math.sin(seedIndex * 2.1) * 0.65;
  const edgeDist = chosen.radius * 0.68;
  const sx = Math.max(
    DUBEN_ARENA_BOUNDS.minX + 60,
    Math.min(DUBEN_ARENA_BOUNDS.maxX - 60, chosen.x + Math.cos(angle) * edgeDist)
  );
  const sy = Math.max(
    DUBEN_ARENA_BOUNDS.minY + 60,
    Math.min(DUBEN_ARENA_BOUNDS.maxY - 60, chosen.y + Math.sin(angle) * edgeDist)
  );

  return { x: sx, y: sy, forest: chosen };
}

export function clampToDubenArenaBounds(
  entity: { x: number; y: number; radius?: number },
  padding = 34
): boolean {
  const r = Math.max(8, (entity.radius || 18) + padding);
  let clamped = false;

  if (entity.x < DUBEN_ARENA_BOUNDS.minX + r) {
    entity.x = DUBEN_ARENA_BOUNDS.minX + r;
    clamped = true;
  } else if (entity.x > DUBEN_ARENA_BOUNDS.maxX - r) {
    entity.x = DUBEN_ARENA_BOUNDS.maxX - r;
    clamped = true;
  }

  if (entity.y < DUBEN_ARENA_BOUNDS.minY + r) {
    entity.y = DUBEN_ARENA_BOUNDS.minY + r;
    clamped = true;
  } else if (entity.y > DUBEN_ARENA_BOUNDS.maxY - r) {
    entity.y = DUBEN_ARENA_BOUNDS.maxY - r;
    clamped = true;
  }

  return clamped;
}

export interface DubenObstacle {
  id: string;
  shape: 'box' | 'circle';
  x: number;
  y: number;
  halfW?: number;
  halfH?: number;
  radius?: number;
}

/**
 * Solid village structures in Dubnový den (St. George church, cottages, tavern, mill, orchard stone wall).
 */
export const DUBEN_OBSTACLES: readonly DubenObstacle[] = [
  // Kostel sv. Jiří — chrámová loď, věž a presbytář
  { id: 'church_main', shape: 'box', x: -800, y: -650, halfW: 105, halfH: 68 },
  { id: 'church_tower', shape: 'box', x: -890, y: -650, halfW: 48, halfH: 48 },
  { id: 'church_apse', shape: 'circle', x: -705, y: -650, radius: 46 },

  // Kolednická hospoda — hlavní roubenka a stáj
  { id: 'tavern_main', shape: 'box', x: 440, y: -75, halfW: 98, halfH: 65 },
  { id: 'tavern_stable', shape: 'box', x: 535, y: -75, halfW: 46, halfH: 44 },

  // Návesní roubenka a farní sýpka
  { id: 'village_cottage', shape: 'box', x: -65, y: -230, halfW: 82, halfH: 56 },
  { id: 'village_granary', shape: 'box', x: 165, y: -250, halfW: 68, halfH: 48 },

  // Jarní mlýn a mlýnský dům
  { id: 'mill_house', shape: 'box', x: 650, y: 725, halfW: 84, halfH: 60 },
  { id: 'mill_wheel_housing', shape: 'box', x: 730, y: 725, halfW: 36, halfH: 48 },

  // Rozkvetlý sad — včelín a zídka
  { id: 'orchard_apiary', shape: 'box', x: 125, y: 490, halfW: 42, halfH: 34 },
  { id: 'orchard_wall', shape: 'box', x: 125, y: 640, halfW: 85, halfH: 14 },

  // Kamenná zídka hřbitova u sv. Jiří s prostorným dvorem
  { id: 'church_wall_n', shape: 'box', x: -800, y: -800, halfW: 180, halfH: 14 },
  { id: 'church_wall_s', shape: 'box', x: -800, y: -500, halfW: 180, halfH: 14 },
] as const;

export interface DubenObstacleCollisionResult {
  hit: boolean;
  x: number;
  y: number;
  nx: number;
  ny: number;
  pushX: number;
  pushY: number;
  obstacleId?: string;
}

export function collideCircleWithDubenObstacles(
  x: number,
  y: number,
  radius: number
): DubenObstacleCollisionResult {
  const r = Math.max(2, radius || 8);

  for (let i = 0; i < DUBEN_OBSTACLES.length; i++) {
    const obs = DUBEN_OBSTACLES[i];
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
        const dist = Math.sqrt(distSq);
        let nx = 0;
        let ny = -1;
        let pushDist = r;

        if (dist > 0.0001) {
          nx = dx / dist;
          ny = dy / dist;
          pushDist = r - dist;
        } else {
          const dl = Math.abs(x - minX);
          const dr = Math.abs(maxX - x);
          const dt = Math.abs(y - minY);
          const db = Math.abs(maxY - y);
          const m = Math.min(dl, dr, dt, db);
          if (m === dl) {
            nx = -1;
            ny = 0;
            pushDist = r + dl;
          } else if (m === dr) {
            nx = 1;
            ny = 0;
            pushDist = r + dr;
          } else if (m === dt) {
            nx = 0;
            ny = -1;
            pushDist = r + dt;
          } else {
            nx = 0;
            ny = 1;
            pushDist = r + db;
          }
        }

        return {
          hit: true,
          x: x + nx * pushDist,
          y: y + ny * pushDist,
          nx,
          ny,
          pushX: nx * pushDist,
          pushY: ny * pushDist,
          obstacleId: obs.id,
        };
      }
    } else {
      const circleR = obs.radius || 30;
      const totalR = r + circleR;
      const dx = x - obs.x;
      const dy = y - obs.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < totalR * totalR) {
        const dist = Math.sqrt(distSq) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushDist = totalR - dist;
        return {
          hit: true,
          x: obs.x + nx * totalR,
          y: obs.y + ny * totalR,
          nx,
          ny,
          pushX: nx * pushDist,
          pushY: ny * pushDist,
          obstacleId: obs.id,
        };
      }
    }
  }

  return { hit: false, x, y, nx: 0, ny: 0, pushX: 0, pushY: 0 };
}

export function resolveDubenObstacles(entity: { x: number; y: number; radius?: number }, isFlying = false): boolean {
  if (isFlying || !entity) return false;
  let anyHit = false;
  for (let pass = 0; pass < 3; pass++) {
    const col = collideCircleWithDubenObstacles(entity.x, entity.y, entity.radius || 18);
    if (col.hit) {
      entity.x = col.x;
      entity.y = col.y;
      anyHit = true;
    } else {
      break;
    }
  }
  return anyHit;
}

function segmentIntersectsRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): boolean {
  if (
    (x1 < minX && x2 < minX) ||
    (x1 > maxX && x2 > maxX) ||
    (y1 < minY && y2 < minY) ||
    (y1 > maxY && y2 > maxY)
  ) {
    return false;
  }
  if (
    (x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
    (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)
  ) {
    return true;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - minX, maxX - x1, y1 - minY, maxY - y1];
  let u1 = 0;
  let u2 = 1;

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > u2) return false;
        if (t > u1) u1 = t;
      } else {
        if (t < u1) return false;
        if (t < u2) u2 = t;
      }
    }
  }

  return u1 <= u2;
}

function segmentIntersectsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const ddx = x1 - cx;
    const ddy = y1 - cy;
    return ddx * ddx + ddy * ddy <= r * r;
  }
  const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const distSq = (cx - projX) * (cx - projX) + (cy - projY) * (cy - projY);
  return distSq <= r * r;
}

export function hasDubenTerrainLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
  for (let i = 0; i < DUBEN_OBSTACLES.length; i++) {
    const obs = DUBEN_OBSTACLES[i];
    if (obs.shape === 'box') {
      const hw = Math.max(8, (obs.halfW || 40) - 4);
      const hh = Math.max(8, (obs.halfH || 40) - 4);
      if (segmentIntersectsRect(x1, y1, x2, y2, obs.x - hw, obs.y - hh, obs.x + hw, obs.y + hh)) {
        return false;
      }
    } else {
      const r = Math.max(8, (obs.radius || 30) - 4);
      if (segmentIntersectsCircle(x1, y1, x2, y2, obs.x, obs.y, r)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Thawed pond area in April (without ice floes).
 */
export const DUBEN_POND_REGION = {
  cx: -725,
  cy: 615,
  rx: 280,
  ry: 185,
} as const;

export function isPointInDubenPondWater(x: number, y: number, margin = 0): boolean {
  const dx = (x - DUBEN_POND_REGION.cx) / (DUBEN_POND_REGION.rx + margin);
  const dy = (y - DUBEN_POND_REGION.cy) / (DUBEN_POND_REGION.ry + margin);
  return dx * dx + dy * dy <= 1.0;
}

export interface DubenWaterEffect {
  inWater: boolean;
  inShallows: boolean;
  inDeepWater: boolean;
  slowRatio: number;
}

export function getDubenWaterEffect(x: number, y: number, isAquatic = false): DubenWaterEffect {
  const dx = (x - DUBEN_POND_REGION.cx) / DUBEN_POND_REGION.rx;
  const dy = (y - DUBEN_POND_REGION.cy) / DUBEN_POND_REGION.ry;
  const distSq = dx * dx + dy * dy;

  if (distSq > 1.0) {
    return { inWater: false, inShallows: false, inDeepWater: false, slowRatio: 1.0 };
  }

  // Shallows are the outer 30% of the pond perimeter
  const inShallows = distSq > 0.49;
  const inDeepWater = !inShallows;

  if (isAquatic) {
    // Aquatic monsters (frogs, water goblins) are fast and agile in warm water
    return { inWater: true, inShallows, inDeepWater, slowRatio: 1.15 };
  }

  // Non-aquatic creatures get slowed in muddy water
  const slowRatio = inDeepWater ? 0.65 : 0.85;
  return { inWater: true, inShallows, inDeepWater, slowRatio };
}

export interface DubenRoofZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  roofBaselineY: number;
}

export const DUBEN_ROOF_ZONES: readonly DubenRoofZone[] = [
  { id: 'church_roof', x: -800, y: -680, width: 220, height: 130, roofBaselineY: -610 },
  { id: 'tavern_roof', x: 440, y: -105, width: 200, height: 120, roofBaselineY: -45 },
  { id: 'cottage_roof', x: -65, y: -260, width: 170, height: 110, roofBaselineY: -200 },
  { id: 'mill_roof', x: 650, y: 695, width: 180, height: 110, roofBaselineY: 755 },
] as const;

export function hasDubenRoofsInView(
  viewLeft: number,
  viewTop: number,
  viewRight: number,
  viewBottom: number
): boolean {
  for (let i = 0; i < DUBEN_ROOF_ZONES.length; i++) {
    const z = DUBEN_ROOF_ZONES[i];
    const halfW = z.width * 0.5;
    const halfH = z.height * 0.5;
    if (
      z.x + halfW >= viewLeft &&
      z.x - halfW <= viewRight &&
      z.y + halfH >= viewTop &&
      z.y - halfH <= viewBottom
    ) {
      return true;
    }
  }
  return false;
}

export function isEntityBehindDubenRoof(x: number, y: number): DubenRoofZone | null {
  for (let i = 0; i < DUBEN_ROOF_ZONES.length; i++) {
    const z = DUBEN_ROOF_ZONES[i];
    const halfW = z.width * 0.5;
    const halfH = z.height * 0.5;
    if (
      x >= z.x - halfW &&
      x <= z.x + halfW &&
      y >= z.y - halfH &&
      y <= z.roofBaselineY
    ) {
      return z;
    }
  }
  return null;
}

export function sanitizeDubenSpawnPoint(
  x: number,
  y: number,
  radius = 28
): { x: number; y: number } {
  let sx = Math.max(DUBEN_ARENA_BOUNDS.minX + 60, Math.min(DUBEN_ARENA_BOUNDS.maxX - 60, x));
  let sy = Math.max(DUBEN_ARENA_BOUNDS.minY + 60, Math.min(DUBEN_ARENA_BOUNDS.maxY - 60, y));

  const col = collideCircleWithDubenObstacles(sx, sy, radius);
  if (col.hit) {
    sx = col.x;
    sy = col.y;
  }

  return { x: sx, y: sy };
}
