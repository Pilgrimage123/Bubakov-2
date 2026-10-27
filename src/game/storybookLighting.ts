/**
 * Storybook Illumination System - Headless Simulation Logic
 * Josef Lada fairytale dynamic lighting & shadow mechanics.
 * Adheres to GLOSSARY.md (Kuráž, Petrolejka, Kvašová záře, Stínová záštita) and ADR 0003.
 */

export type LightSourceType =
  | 'petrolejka'
  | 'hearth'
  | 'window'
  | 'holy'
  | 'osika'
  | 'garlic'
  | 'cert'
  | 'bozi_muka'
  | 'bludicka'
  | 'custom';

export interface DynamicLightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity?: number;
  duration?: number;
  maxDuration?: number;
  type?: LightSourceType;
  pulsing?: boolean;
}

export interface ShadowZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  offsetX?: number;
  offsetY?: number;
}

export interface LightOccluder {
  id: string;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  segments?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

export interface ShadowPolygon {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  e2: { x: number; y: number };
  e1: { x: number; y: number };
}

export interface NormalVector3D {
  x: number;
  y: number;
  z: number;
}

const EMPTY_SEGMENTS: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

/**
 * Computes boundary line segments for an occluder (cached to avoid per-ray allocations).
 */
export function computeOccluderSegments(occluder: LightOccluder): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  if (occluder.segments && occluder.segments.length > 0) {
    return occluder.segments;
  }
  const occ = occluder as any;
  if (occluder.width && occluder.height) {
    if (
      occ._cachedSegments &&
      occ._cachedX === occluder.x &&
      occ._cachedY === occluder.y &&
      occ._cachedW === occluder.width &&
      occ._cachedH === occluder.height
    ) {
      return occ._cachedSegments;
    }
    const hw = occluder.width * 0.5;
    const hh = occluder.height * 0.5;
    const x = occluder.x;
    const y = occluder.y;
    const segs = [
      { x1: x - hw, y1: y - hh, x2: x + hw, y2: y - hh },
      { x1: x + hw, y1: y - hh, x2: x + hw, y2: y + hh },
      { x1: x + hw, y1: y + hh, x2: x - hw, y2: y + hh },
      { x1: x - hw, y1: y + hh, x2: x - hw, y2: y - hh },
    ];
    occ._cachedX = x;
    occ._cachedY = y;
    occ._cachedW = occluder.width;
    occ._cachedH = occluder.height;
    occ._cachedSegments = segs;
    return segs;
  }
  if (occluder.radius && occluder.radius > 0) {
    if (
      occ._cachedSegments &&
      occ._cachedX === occluder.x &&
      occ._cachedY === occluder.y &&
      occ._cachedR === occluder.radius
    ) {
      return occ._cachedSegments;
    }
    const r = occluder.radius;
    const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a1 = (i / count) * Math.PI * 2;
      const a2 = ((i + 1) / count) * Math.PI * 2;
      segments.push({
        x1: occluder.x + Math.cos(a1) * r,
        y1: occluder.y + Math.sin(a1) * r,
        x2: occluder.x + Math.cos(a2) * r,
        y2: occluder.y + Math.sin(a2) * r,
      });
    }
    occ._cachedX = occluder.x;
    occ._cachedY = occluder.y;
    occ._cachedR = r;
    occ._cachedSegments = segments;
    return segments;
  }
  return EMPTY_SEGMENTS;
}

/**
 * Computes extruded 2D vector shadow volumes for an occluder relative to a light source.
 */
export function computeShadowVolume(
  lightX: number,
  lightY: number,
  lightRadius: number,
  occluder: LightOccluder
): ShadowPolygon[] {
  const segments = computeOccluderSegments(occluder);
  const result: ShadowPolygon[] = [];
  const extrudeDist = Math.max(lightRadius * 2.2, 500);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // Check if segment is facing the light source
    const nx = -(seg.y2 - seg.y1);
    const ny = seg.x2 - seg.x1;
    const mx = (seg.x1 + seg.x2) * 0.5 - lightX;
    const my = (seg.y1 + seg.y2) * 0.5 - lightY;

    if (nx * mx + ny * my > 0) {
      continue;
    }

    const d1x = seg.x1 - lightX;
    const d1y = seg.y1 - lightY;
    const len1 = Math.hypot(d1x, d1y) || 1;

    const d2x = seg.x2 - lightX;
    const d2y = seg.y2 - lightY;
    const len2 = Math.hypot(d2x, d2y) || 1;

    const e1 = {
      x: seg.x1 + (d1x / len1) * extrudeDist,
      y: seg.y1 + (d1y / len1) * extrudeDist,
    };
    const e2 = {
      x: seg.x2 + (d2x / len2) * extrudeDist,
      y: seg.y2 + (d2y / len2) * extrudeDist,
    };

    result.push({
      p1: { x: seg.x1, y: seg.y1 },
      p2: { x: seg.x2, y: seg.y2 },
      e2,
      e1,
    });
  }

  return result;
}

function checkSegmentIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const dx12 = x2 - x1;
  const dy12 = y2 - y1;
  const dx34 = x4 - x3;
  const dy34 = y4 - y3;

  const denom = dx12 * dy34 - dy12 * dx34;
  if (Math.abs(denom) < 1e-9) return false;

  const dx13 = x1 - x3;
  const dy13 = y1 - y3;

  const ua = (dx34 * dy13 - dy34 * dx13) / denom;
  const ub = (dx12 * dy13 - dy12 * dx13) / denom;

  return ua >= 0.02 && ua <= 0.98 && ub >= 0 && ub <= 1;
}

export function isRayBlockedByOccluders(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  occluders: LightOccluder[]
): boolean {
  if (!occluders || occluders.length === 0) return false;

  for (let i = 0; i < occluders.length; i++) {
    const occ = occluders[i];
    const occRad = occ.radius || (occ.width ? Math.max(occ.width, occ.height || 0) * 0.75 : 40);
    const midX = (x1 + x2) * 0.5;
    const midY = (y1 + y2) * 0.5;
    const halfRay = Math.hypot(x2 - x1, y2 - y1) * 0.5;
    if (Math.hypot(occ.x - midX, occ.y - midY) > halfRay + occRad) {
      continue;
    }

    const segments = computeOccluderSegments(occ);
    for (let j = 0; j < segments.length; j++) {
      const seg = segments[j];
      if (checkSegmentIntersection(x1, y1, x2, y2, seg.x1, seg.y1, seg.x2, seg.y2)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates the active radius of the player's Petrolejka based on Kuráž and day phase.
 * In daytime (noon, afternoon), the Petrolejka rests on the belt and emits 0 radius.
 * In low-visibility phases (dusk, night, midnight, dawn), radius scales with Kuráž.
 * At critical Kuráž (< 25%), the flame sputters and contracts into a tense vignette.
 */
export function getPetrolejkaRadius(
  currentKuraz: number,
  maxKuraz: number,
  dayPhaseId: string,
  time = 0
): number {
  if (dayPhaseId === 'noon' || dayPhaseId === 'afternoon') {
    return 0;
  }
  if (currentKuraz <= 0) {
    return 0;
  }

  const safeMax = Math.max(1, maxKuraz);
  const ratio = Math.max(0, Math.min(1, currentKuraz / safeMax));

  if (ratio < 0.25) {
    // Critical Kuráž: sputtering wick flicker (45px - 85px)
    const flicker = Math.sin(time * 18) * 8 + Math.sin(time * 33) * 6;
    return Math.max(45, Math.min(85, 65 + flicker));
  }

  // Steady warm glow scaling up to ~225px at full Kuráž
  const gentlePulse = Math.sin(time * 3.5) * 4;
  const baseRadius = 95 + ratio * 125;
  return Math.max(90, Math.min(235, baseRadius + gentlePulse));
}

/**
 * Checks whether a given world coordinate is illuminated.
 * In noon and afternoon, open ground is illuminated unless covered by a cast shadow.
 * In dusk, night, midnight, and dawn, positions are dark unless inside an active light source radius
 * with clear line-of-sight (unblocked by occluders).
 */
export function isPositionIlluminated(
  x: number,
  y: number,
  lightSources: DynamicLightSource[],
  dayPhaseId: string,
  shadowZones: ShadowZone[] = [],
  occluders: LightOccluder[] = []
): boolean {
  // Check direct light sources first (they always illuminate their circle, provided no occluder blocks the ray)
  for (let i = 0; i < lightSources.length; i++) {
    const src = lightSources[i];
    const reach = src.radius * (src.intensity ?? 1);
    if (reach <= 0) continue;
    const dx = x - src.x;
    const dy = y - src.y;
    if (dx * dx + dy * dy <= reach * reach) {
      if (occluders.length > 0 && isRayBlockedByOccluders(src.x, src.y, x, y, occluders)) {
        continue;
      }
      return true;
    }
  }

  // Daytime ambient sunlight
  if (dayPhaseId === 'noon' || dayPhaseId === 'afternoon') {
    // If inside any shadow zone (e.g. cottage eaves, trees), it is not directly illuminated
    for (let i = 0; i < shadowZones.length; i++) {
      const sz = shadowZones[i];
      const dx = x - sz.x;
      const dy = y - sz.y;
      if (dx * dx + dy * dy <= sz.radius * sz.radius) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Evaluates the Stínová záštita (Shadow Defense) for enemies in category "shadows".
 * In gloom/shadow: +35% move speed, 40% damage resistance.
 * In light: defense dissolves instantly, suffering 0.25s stagger and +25% vulnerability.
 */
export function evaluateShadowDefense(
  enemy: any,
  isIlluminated: boolean,
  dt: number,
  callbacks?: { onBreak?: (enemy: any) => void }
): void {
  if (enemy.category !== 'shadows') {
    return;
  }

  if (enemy.shadowVulnerabilityTimer > 0) {
    enemy.shadowVulnerabilityTimer = Math.max(0, enemy.shadowVulnerabilityTimer - dt);
  }

  if (!isIlluminated) {
    enemy.hasShadowDefense = true;
  } else {
    if (enemy.hasShadowDefense) {
      enemy.hasShadowDefense = false;
      enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.25);
      enemy.shadowVulnerabilityTimer = 2.5; // +25% vulnerability for 2.5 seconds
      if (typeof enemy.interruptAttack === 'function') {
        enemy.interruptAttack();
      }
      callbacks?.onBreak?.(enemy);
    }
  }
}

/**
 * Computes speed and damage multipliers from Stínová záštita.
 */
export function getShadowDefenseMultipliers(enemy: any): { speedMult: number; damageTakenMult: number } {
  if (enemy.category !== 'shadows') {
    return { speedMult: 1, damageTakenMult: 1 };
  }

  if (enemy.hasShadowDefense) {
    return { speedMult: 1.35, damageTakenMult: 0.60 }; // 40% resistance
  }

  if (enemy.shadowVulnerabilityTimer && enemy.shadowVulnerabilityTimer > 0) {
    return { speedMult: 1.0, damageTakenMult: 1.25 }; // +25% vulnerability
  }

  return { speedMult: 1, damageTakenMult: 1 };
}

/**
 * Updates dynamic light source lifespans and purges expired temporary emitters in-place.
 */
export function updateLightSources(sources: DynamicLightSource[], dt: number): DynamicLightSource[] {
  let write = 0;
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (typeof src.duration === 'number') {
      src.duration -= dt;
      if (src.duration <= 0) {
        continue;
      }
      if (src.maxDuration && src.maxDuration > 0) {
        src.intensity = Math.max(0, Math.min(1, src.duration / src.maxDuration));
      }
    }
    sources[write++] = src;
  }
  sources.length = write;
  return sources;
}

const _bludickaLightBuffer: DynamicLightSource[] = [];

/**
 * Evaluates Bludička močálová aura:
 * Pulls undead/swarm enemies closer to the player and grants them a +15% pursuit boost.
 */
export function evaluateBludickaAura(
  livingEnemies: any[],
  lightSources: DynamicLightSource[],
  player: any
): void {
  _bludickaLightBuffer.length = 0;
  if (player && lightSources.length > 0) {
    for (let i = 0; i < lightSources.length; i++) {
      const ls = lightSources[i];
      if (ls.type === 'bludicka') {
        _bludickaLightBuffer.push(ls);
      }
    }
  }

  if (_bludickaLightBuffer.length === 0 || !player) {
    for (let i = 0; i < livingEnemies.length; i++) {
      if (livingEnemies[i].bludickaAttracted) {
        livingEnemies[i].bludickaAttracted = false;
      }
    }
    return;
  }

  for (let i = 0; i < livingEnemies.length; i++) {
    const e = livingEnemies[i];
    if (e.id === 'bludicka' || e.isDefeated || e.dead) continue;
    if (e.category !== 'undead' && e.category !== 'swarms') {
      if (e.bludickaAttracted) e.bludickaAttracted = false;
      continue;
    }

    let inAura = false;
    for (let j = 0; j < _bludickaLightBuffer.length; j++) {
      const bLight = _bludickaLightBuffer[j];
      const dx = e.x - bLight.x;
      const dy = e.y - bLight.y;
      if (dx * dx + dy * dy <= bLight.radius * bLight.radius) {
        inAura = true;
        break;
      }
    }

    e.bludickaAttracted = inAura;
  }
}

/** Factory for Osikový prut sweep light burst */
export function createOsikovySlashLight(x: number, y: number): DynamicLightSource {
  return {
    id: `osika_${Date.now()}_${Math.random()}`,
    x,
    y,
    radius: 165,
    color: '#7DD3FC',
    duration: 0.4,
    maxDuration: 0.4,
    type: 'osika',
    intensity: 1,
  };
}

/** Factory for Holy cathedral light pillar / Svěcená items */
export function createHolyCathedralLight(x: number, y: number): DynamicLightSource {
  return {
    id: `holy_${Date.now()}_${Math.random()}`,
    x,
    y,
    radius: 220,
    color: '#FEF9C3',
    duration: 3.5,
    maxDuration: 3.5,
    type: 'holy',
    intensity: 1,
  };
}

/** Factory for Česneková topinka / Grandfather campfire spark */
export function createGarlicHearthSpark(x: number, y: number): DynamicLightSource {
  return {
    id: `garlic_${Date.now()}_${Math.random()}`,
    x,
    y,
    radius: 95,
    color: '#FDE68A',
    duration: 0.5,
    maxDuration: 0.5,
    type: 'garlic',
    intensity: 1,
  };
}

/** Factory for Čert sulfur & scarlet ember print */
export function createCertEmberLight(x: number, y: number): DynamicLightSource {
  return {
    id: `cert_${Date.now()}_${Math.random()}`,
    x,
    y,
    radius: 65,
    color: '#DC2626',
    duration: 2.2,
    maxDuration: 2.2,
    type: 'cert',
    intensity: 1,
  };
}

/**
 * Computes Lambertian diffuse illumination for 2D surface relief with virtual 3D light depth:
 * I = max(0, N · L) * distanceAttenuation * lightIntensity
 */
export function computeLambertianDiffuse(
  lightPos3D: { x: number; y: number; z: number },
  surfacePos2D: { x: number; y: number },
  normal: NormalVector3D,
  lightIntensity = 1.0,
  lightRadius = 220
): number {
  const dx = lightPos3D.x - surfacePos2D.x;
  const dy = lightPos3D.y - surfacePos2D.y;
  const dz = lightPos3D.z;
  const dist = Math.hypot(dx, dy, dz);
  if (dist <= 0.001 || dist >= lightRadius) return 0;

  const lx = dx / dist;
  const ly = dy / dist;
  const lz = dz / dist;

  const nDotL = normal.x * lx + normal.y * ly + normal.z * lz;
  if (nDotL <= 0) return 0;

  const att = Math.max(0, 1 - dist / lightRadius);
  const falloff = att * att;

  return nDotL * falloff * lightIntensity;
}

/**
 * Computes a unit 3D normal vector from surface tilts (-1 to +1).
 */
export function computeNormalFromAngles(tiltX: number, tiltY: number): NormalVector3D {
  const clampedX = Math.max(-1, Math.min(1, tiltX));
  const clampedY = Math.max(-1, Math.min(1, tiltY));
  const zSqr = Math.max(0, 1 - clampedX * clampedX - clampedY * clampedY);
  const nz = Math.sqrt(zSqr);
  return { x: clampedX, y: clampedY, z: nz };
}

/**
 * Generates procedural tangent-space normal map data (R: tiltX, G: tiltY, B: depthZ).
 */
export function generateProceduralNormalMap(
  width: number,
  height: number,
  shape: 'sphere' | 'cylinder' | 'bevelBox' | 'ridge' = 'sphere'
): ImageData | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const halfW = width * 0.5;
  const halfH = height * 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let nx = 0;
      let ny = 0;
      let nz = 1;

      if (shape === 'sphere') {
        const u = (x - halfW) / halfW;
        const v = (y - halfH) / halfH;
        const d2 = u * u + v * v;
        if (d2 <= 1) {
          nx = u;
          ny = v;
          nz = Math.sqrt(1 - d2);
        }
      } else if (shape === 'cylinder') {
        const u = (x - halfW) / halfW;
        if (Math.abs(u) <= 1) {
          nx = u;
          ny = 0;
          nz = Math.sqrt(1 - u * u);
        }
      } else if (shape === 'bevelBox') {
        const margin = 0.2;
        const u = x / width;
        const v = y / height;
        if (u < margin) nx = -1 + u / margin;
        else if (u > 1 - margin) nx = (u - (1 - margin)) / margin;
        if (v < margin) ny = -1 + v / margin;
        else if (v > 1 - margin) ny = (v - (1 - margin)) / margin;
        const zSqr = Math.max(0.1, 1 - nx * nx - ny * ny);
        nz = Math.sqrt(zSqr);
      } else {
        nx = Math.sin(x * 0.4) * 0.5;
        ny = Math.cos(y * 0.4) * 0.3;
        nz = Math.sqrt(Math.max(0.1, 1 - nx * nx - ny * ny));
      }

      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round(nz * 255);
      data[idx + 3] = 255;
    }
  }

  return imgData;
}

/**
 * Computes directional surface relief highlight info for an entity or prop
 * from active dynamic light sources.
 */
export function computeSurfaceReliefHighlight(
  surfaceX: number,
  surfaceY: number,
  surfaceRadius: number,
  lightSources: DynamicLightSource[],
  maxLights: number = lightSources.length
): { dominantDirAngle: number; intensity: number; color: string; normalDotLight: number } | null {
  if (!lightSources || lightSources.length === 0) return null;

  let totalWeight = 0;
  let weightedDirX = 0;
  let weightedDirY = 0;
  let maxIntensity = 0;
  let dominantColor = '#FEF08A';

  for (let i = 0, limit = Math.min(lightSources.length, maxLights); i < limit; i++) {
    const src = lightSources[i];
    const reach = src.radius * (src.intensity ?? 1);
    if (reach <= 0) continue;

    const dx = src.x - surfaceX;
    const dy = src.y - surfaceY;
    const dist = Math.hypot(dx, dy);

    if (dist < reach + surfaceRadius) {
      const zL = 35;
      const dist3D = Math.hypot(dx, dy, zL);
      const att = Math.max(0, 1 - dist3D / (reach + surfaceRadius));
      const weight = att * (src.intensity ?? 1);

      if (weight > 0.04) {
        totalWeight += weight;
        weightedDirX += (dx / (dist || 1)) * weight;
        weightedDirY += (dy / (dist || 1)) * weight;
        if (weight > maxIntensity) {
          maxIntensity = weight;
          dominantColor = src.color || '#FEF08A';
        }
      }
    }
  }

  if (totalWeight <= 0.04) return null;

  const dirAngle = Math.atan2(weightedDirY, weightedDirX);
  return {
    dominantDirAngle: dirAngle,
    intensity: Math.min(1.0, maxIntensity * 1.25),
    color: dominantColor,
    normalDotLight: Math.min(1.0, totalWeight),
  };
}

/**
 * Seeds dynamic architectural light sources, shadow zones, and occluders from decor items.
 */
export function seedLightingAndOccludersFromDecor(
  decorList: any[],
  lightSources: DynamicLightSource[],
  shadowZones: ShadowZone[],
  occluders: LightOccluder[]
): void {
  for (let i = 0; i < decorList.length; i++) {
    const d = decorList[i];
    if (d.type === 'cottage') {
      lightSources.push({
        id: `cottage_window_${i}`,
        x: d.x,
        y: d.y + 12,
        radius: 145,
        color: '#FEF08A',
        type: 'window',
      });
      shadowZones.push({
        id: `cottage_shadow_${i}`,
        x: d.x + 18,
        y: d.y + 25,
        radius: 80,
      });
      occluders.push({
        id: `cottage_occ_${i}`,
        x: d.x,
        y: d.y + 5,
        width: 120 * (d.scale || 1),
        height: 75 * (d.scale || 1),
      });
    } else if (d.type === 'bozi_muka') {
      lightSources.push({
        id: `bozi_muka_${i}`,
        x: d.x,
        y: d.y - 45,
        radius: 115,
        color: '#FEF08A',
        type: 'bozi_muka',
      });
      occluders.push({
        id: `bozi_muka_occ_${i}`,
        x: d.x,
        y: d.y - 20,
        radius: 16 * (d.scale || 1),
      });
    } else if (d.type === 'tree') {
      occluders.push({
        id: `tree_occ_${i}`,
        x: d.x,
        y: d.y - 15,
        radius: 20 * (d.scale || 1),
      });
    } else if (d.type === 'rock') {
      occluders.push({
        id: `rock_occ_${i}`,
        x: d.x,
        y: d.y,
        radius: 22 * (d.scale || 1),
      });
    } else if (d.type === 'granny_stove') {
      lightSources.push({
        id: `stove_flame_${i}`,
        x: d.x,
        y: d.y - 10,
        radius: 160,
        color: '#EA580C',
        type: 'hearth',
      });
      occluders.push({
        id: `stove_occ_${i}`,
        x: d.x,
        y: d.y,
        width: 60 * (d.scale || 1),
        height: 50 * (d.scale || 1),
      });
    } else if (d.type === 'march_church') {
      lightSources.push({
        id: `march_church_win_${i}`,
        x: d.x + 35,
        y: d.y - 76,
        radius: 155,
        color: '#FEF08A',
        type: 'window',
      });
      occluders.push({
        id: `march_church_occ_${i}`,
        x: d.x,
        y: d.y - 20,
        width: 140 * (d.scale || 1),
        height: 90 * (d.scale || 1),
      });
    } else if (d.type === 'march_village') {
      lightSources.push({
        id: `march_village_win_${i}`,
        x: d.x + 8,
        y: d.y - 14,
        radius: 145,
        color: '#FEF08A',
        type: 'window',
      });
      shadowZones.push({
        id: `march_village_shadow_${i}`,
        x: d.x + 20,
        y: d.y + 20,
        radius: 85,
      });
      occluders.push({
        id: `march_village_occ_${i}`,
        x: d.x,
        y: d.y,
        width: 130 * (d.scale || 1),
        height: 60 * (d.scale || 1),
      });
    } else if (d.type === 'march_shrine') {
      lightSources.push({
        id: `march_shrine_light_${i}`,
        x: d.x,
        y: d.y - 45,
        radius: 120,
        color: '#FEF08A',
        type: 'bozi_muka',
      });
      occluders.push({
        id: `march_shrine_occ_${i}`,
        x: d.x,
        y: d.y - 20,
        radius: 16 * (d.scale || 1),
      });
    } else if (d.type === 'march_mill') {
      lightSources.push({
        id: `march_mill_win_${i}`,
        x: d.x - 18,
        y: d.y - 17,
        radius: 130,
        color: '#FEF08A',
        type: 'window',
      });
      occluders.push({
        id: `march_mill_occ_${i}`,
        x: d.x,
        y: d.y,
        width: 100 * (d.scale || 1),
        height: 60 * (d.scale || 1),
      });
    } else if (d.type === 'march_forest') {
      occluders.push({
        id: `march_forest_occ_${i}`,
        x: d.x,
        y: d.y,
        radius: 60 * (d.scale || 1),
      });
    }
  }
}

