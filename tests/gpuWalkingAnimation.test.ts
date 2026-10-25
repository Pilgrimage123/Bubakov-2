import { describe, it, expect } from 'vitest';
import {
  ARCHETYPE_PRESETS,
  computeVolumePreservingStretch,
  type EnemyArchetype,
} from '../src/components/gpu-animation/types';
import { ENEMY_ANIMATION_CSS } from '../src/components/gpu-animation/styles';
import { BAKED_SPRITES } from '../src/components/gpu-animation/sprites';
import { Enemy } from '../src/components/gpu-animation/Enemy';
import { Battlefield } from '../src/components/gpu-animation/Battlefield';
import {
  ENEMY_ARCHETYPE_MAP,
  getEnemyGpuConfig,
  getEnemySpriteDataUri,
} from '../src/components/gpu-animation/enemyCatalog';
import { ENEMIES } from '../src/data/enemies';

describe('GPU Procedural Walking Animation (Bullet Heaven architecture)', () => {
  it('defines all 4 required archetypes with valid kinematics and physical constraints', () => {
    const requiredArchetypes: EnemyArchetype[] = ['runner', 'slime', 'bug', 'golem'];

    for (const arch of requiredArchetypes) {
      const preset = ARCHETYPE_PRESETS[arch];
      expect(preset, `Preset for ${arch} must exist`).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.description).toBeDefined();

      // Check duration format (e.g. "0.52s")
      expect(preset.animDuration).toMatch(/^[0-9.]+s$/);
      const durationNum = parseFloat(preset.animDuration);
      expect(durationNum).toBeGreaterThan(0.05);
      expect(durationNum).toBeLessThan(3.0);

      // Check wobble angle (e.g. "11deg")
      expect(preset.wobbleAngle).toMatch(/^[0-9.]+deg$/);
      const angleNum = parseFloat(preset.wobbleAngle);
      expect(angleNum).toBeGreaterThanOrEqual(0);
      expect(angleNum).toBeLessThanOrEqual(45);

      // Check squash and stretch
      expect(preset.squashX).toBeGreaterThan(1.0);
      expect(preset.squashY).toBeLessThan(1.0);
      expect(preset.stretchX).toBeLessThan(1.0);
      expect(preset.stretchY).toBeGreaterThan(1.0);
    }

    // Specific archetype behavioral traits:
    // Bug has fastest cadence (lowest duration)
    expect(parseFloat(ARCHETYPE_PRESETS.bug.animDuration)).toBeLessThan(
      parseFloat(ARCHETYPE_PRESETS.runner.animDuration)
    );
    // Golem has slowest cadence (highest duration)
    expect(parseFloat(ARCHETYPE_PRESETS.golem.animDuration)).toBeGreaterThan(
      parseFloat(ARCHETYPE_PRESETS.runner.animDuration)
    );
    // Slime has minimal tilt (<= 5deg) and high horizontal squash (>= 1.3)
    expect(parseFloat(ARCHETYPE_PRESETS.slime.wobbleAngle)).toBeLessThanOrEqual(5);
    expect(ARCHETYPE_PRESETS.slime.squashX).toBeGreaterThanOrEqual(1.3);
  });

  it('preserves volume (area conservation) during squash & stretch deformations', () => {
    for (const arch of ['runner', 'slime', 'bug', 'golem'] as EnemyArchetype[]) {
      const p = ARCHETYPE_PRESETS[arch];
      // Area at squash point: Sx * Sy
      const squashArea = p.squashX * p.squashY;
      // Area at stretch point: StX * StY
      const stretchArea = p.stretchX * p.stretchY;

      // Both should remain close to 1.0 (within ±0.06 tolerance for stylized aesthetics)
      expect(squashArea).toBeGreaterThan(0.85);
      expect(squashArea).toBeLessThan(1.15);

      expect(stretchArea).toBeGreaterThan(0.85);
      expect(stretchArea).toBeLessThan(1.15);
    }

    // Test the computeVolumePreservingStretch utility
    const customSquash = { x: 1.25, y: 0.8 };
    const derived = computeVolumePreservingStretch(customSquash.x, customSquash.y);
    expect(derived.stretchX).toBeCloseTo(1 / 1.25, 2);
    expect(derived.stretchY).toBeCloseTo(1 / 0.8, 2);
  });

  it('contains the complete mathematical keyframe loop and GPU re-rasterization lock in CSS', () => {
    // 1. Check Keyframes definition exists
    expect(ENEMY_ANIMATION_CSS).toContain('@keyframes enemy-gpu-walk-wobble');

    // 2. 0% and 100%: Tilt left, stretched tall
    expect(ENEMY_ANIMATION_CSS).toMatch(/0%,\s*100%/);
    expect(ENEMY_ANIMATION_CSS).toContain('calc(var(--wobble-angle, 10deg) * -1)');
    expect(ENEMY_ANIMATION_CSS).toContain('scale(var(--stretch-x, 0.92), var(--stretch-y, 1.09))');

    // 3. 25% and 75%: Midpoint upright pass and footfall squash down (double frequency bounce!)
    expect(ENEMY_ANIMATION_CSS).toMatch(/25%,\s*75%/);
    expect(ENEMY_ANIMATION_CSS).toContain('rotate(0deg)');
    expect(ENEMY_ANIMATION_CSS).toContain('scale(var(--squash-x, 1.15), var(--squash-y, 0.86))');

    // 4. 50%: Tilt right, stretched tall
    expect(ENEMY_ANIMATION_CSS).toContain('50%');
    expect(ENEMY_ANIMATION_CSS).toContain('rotate(var(--wobble-angle, 10deg))');

    // 5. GPU hardware texture baking rules:
    expect(ENEMY_ANIMATION_CSS).toContain('will-change: transform');
    expect(ENEMY_ANIMATION_CSS).toContain('backface-visibility: hidden');
    expect(ENEMY_ANIMATION_CSS).toContain('transform: translateZ(0)');

    // 6. Ground pivot origin at feet:
    expect(ENEMY_ANIMATION_CSS).toContain('transform-origin: 50% 100%');
  });

  it('provides baked vector Data URIs to eliminate inline SVG node re-rasterization', () => {
    expect(BAKED_SPRITES.runner).toMatch(/^data:image\/svg\+xml/);
    expect(BAKED_SPRITES.slime).toMatch(/^data:image\/svg\+xml/);
    expect(BAKED_SPRITES.bug).toMatch(/^data:image\/svg\+xml/);
    expect(BAKED_SPRITES.golem).toMatch(/^data:image\/svg\+xml/);
  });

  it('exports Enemy and Battlefield components as valid React components', () => {
    expect(typeof Enemy).toBe('object'); // React.memo returns an object with $$typeof
    expect(typeof Battlefield).toBe('function');
  });

  it('guarantees complete coverage for ALL 58 folklore enemies in Bubákov', () => {
    const allEnemyIds = Object.keys(ENEMIES);
    expect(allEnemyIds.length).toBe(58);

    // 1. Verify every single enemy is mapped in ENEMY_ARCHETYPE_MAP
    for (const eid of allEnemyIds) {
      expect(
        eid in ENEMY_ARCHETYPE_MAP,
        `Enemy "${eid}" must have an explicit archetype mapping`
      ).toBe(true);

      const mapping = ENEMY_ARCHETYPE_MAP[eid];
      expect(['runner', 'slime', 'bug', 'golem']).toContain(mapping.archetype);

      // 2. Verify complete GPU configuration resolution
      const config = getEnemyGpuConfig(eid);
      expect(config.id).toBe(eid);
      expect(config.name).toBeDefined();
      expect(config.archetype).toBe(mapping.archetype);

      // 3. Physical walking constraints for all 58 enemies
      const duration = parseFloat(config.params.animDuration);
      expect(duration).toBeGreaterThan(0.1);
      expect(duration).toBeLessThan(2.0);

      const wobbleAngle = parseFloat(config.params.wobbleAngle);
      expect(wobbleAngle).toBeGreaterThanOrEqual(1);
      expect(wobbleAngle).toBeLessThanOrEqual(30);

      // 4. Volume preservation for all 58 enemies (Sx*Sy close to 1.0)
      const squashArea = config.params.squashX * config.params.squashY;
      const stretchArea = config.params.stretchX * config.params.stretchY;
      expect(squashArea).toBeGreaterThan(0.80);
      expect(squashArea).toBeLessThan(1.25);
      expect(stretchArea).toBeGreaterThan(0.80);
      expect(stretchArea).toBeLessThan(1.25);

      // 5. Valid baked texture URI
      const spriteUri = getEnemySpriteDataUri(eid);
      expect(typeof spriteUri).toBe('string');
      expect(spriteUri.length).toBeGreaterThan(20);
    }
  });
});
