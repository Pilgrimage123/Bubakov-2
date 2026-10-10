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
 * In dusk, night, midnight, and dawn, positions are dark unless inside an active light source radius.
 */
export function isPositionIlluminated(
  x: number,
  y: number,
  lightSources: DynamicLightSource[],
  dayPhaseId: string,
  shadowZones: ShadowZone[] = []
): boolean {
  // Check direct light sources first (they always illuminate their circle, even in shadows)
  for (let i = 0; i < lightSources.length; i++) {
    const src = lightSources[i];
    const reach = src.radius * (src.intensity ?? 1);
    if (reach <= 0) continue;
    const dx = x - src.x;
    const dy = y - src.y;
    if (dx * dx + dy * dy <= reach * reach) {
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
 * Updates dynamic light source lifespans and purges expired temporary emitters.
 */
export function updateLightSources(sources: DynamicLightSource[], dt: number): DynamicLightSource[] {
  const result: DynamicLightSource[] = [];
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
    result.push(src);
  }
  return result;
}

/**
 * Evaluates Bludička močálová aura:
 * Pulls undead/swarm enemies closer to the player and grants them a +15% pursuit boost.
 */
export function evaluateBludickaAura(
  livingEnemies: any[],
  lightSources: DynamicLightSource[],
  player: any
): void {
  const bludickaLights = lightSources.filter((ls) => ls.type === 'bludicka');
  if (bludickaLights.length === 0 || !player) {
    for (let i = 0; i < livingEnemies.length; i++) {
      livingEnemies[i].bludickaAttracted = false;
    }
    return;
  }

  for (let i = 0; i < livingEnemies.length; i++) {
    const e = livingEnemies[i];
    if (e.id === 'bludicka' || e.isDefeated || e.dead) continue;
    if (e.category !== 'undead' && e.category !== 'swarms') {
      e.bludickaAttracted = false;
      continue;
    }

    let inAura = false;
    for (let j = 0; j < bludickaLights.length; j++) {
      const bLight = bludickaLights[j];
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
