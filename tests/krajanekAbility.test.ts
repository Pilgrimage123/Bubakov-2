import { describe, expect, it, vi } from 'vitest';
import {
  KRAJANEK_ABILITY_COOLDOWN,
  KRAJANEK_BASE_BLOCK_HP,
  KRAJANEK_CRUSH_DAMAGE,
  KRAJANEK_RIDE_DURATION,
  KRAJANEK_RIDE_SPEED_MULTIPLIER,
  KRAJANEK_SPARK_DAMAGE,
  KRAJANEK_SPARK_RADIUS,
  KRAJANEK_STONE_RADIUS,
  KRAJANEK_COAST_DURATION,
  getKrajanekBlockingHp,
  getKrajanekUpgradeScale,
  getKrajanekMomentumMultiplier,
  getKrajanekStoneRadius,
  computeKrajanekSteering,
  stepKrajanekRide,
  stepKrajanekCoastingStones,
  isPlayerAbilityActive,
} from '../src/game/krajanekAbility';

function createEnemy(x: number, y: number, maxHp: number, radius = 10) {
  return {
    x,
    y,
    maxHp,
    hp: maxHp,
    radius,
    dead: false,
    isDefeated: false,
    takeDamage: vi.fn(function (this: any, amount: number) {
      this.hp = Math.max(0, this.hp - amount);
      if (this.hp <= 0) this.isDefeated = true;
    }),
  };
}

describe('Krajánek — Jízda na žernovu', () => {
  it('uses a 14-second ride, a 30-second cooldown, and double movement speed', () => {
    expect(KRAJANEK_RIDE_DURATION).toBe(14);
    expect(KRAJANEK_ABILITY_COOLDOWN).toBe(30);
    expect(KRAJANEK_RIDE_SPEED_MULTIPLIER).toBe(2);
  });

  it('scales damage and the blocking threshold by 20% per counted shop upgrade', () => {
    expect(getKrajanekUpgradeScale(0)).toBe(1);
    expect(getKrajanekUpgradeScale(1)).toBeCloseTo(1.2);
    expect(getKrajanekUpgradeScale(3)).toBeCloseTo(1.6);
    expect(getKrajanekBlockingHp(0)).toBe(KRAJANEK_BASE_BLOCK_HP);
    expect(getKrajanekBlockingHp(2)).toBeCloseTo(560);
  });

  it('flattens small enemies, damages heavy blockers, and sparks monsters outside the path', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      lastDx: 1,
      lastDy: 0,
      damageMultiplier: 1,
      krajanekUpgradeCount: 0,
      krajanekRideTimer: 9,
      krajanekRideTickTimer: 0,
      krajanekFlats: [],
    };
    const small = createEnemy(18, 0, 100);
    const heavy = createEnemy(20, 0, 600);
    const offPath = createEnemy(0, 70, 100);

    const sparked = stepKrajanekRide(player, 1 / 60, [small, heavy, offPath]);

    expect(sparked).toBe(true);
    expect(small.krajanekFlattened).toBe(true);
    expect(small.isDefeated).toBe(true);
    expect(player.krajanekFlats).toHaveLength(1);
    expect(heavy.takeDamage).toHaveBeenCalledWith(
      KRAJANEK_CRUSH_DAMAGE,
      'physical',
      0,
      0,
      { ignoreDodge: true },
    );
    expect(heavy.isDefeated).toBe(false);
    expect(offPath.takeDamage).toHaveBeenCalledWith(
      KRAJANEK_SPARK_DAMAGE,
      'willpower',
      0,
      0,
      { ignoreDodge: true },
    );
    expect(KRAJANEK_SPARK_RADIUS).toBe(85);
  });

  it('raises the crush ceiling after upgrades and advances the ride timer', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      damageMultiplier: 1,
      krajanekUpgradeCount: 2,
      krajanekRideTimer: 1,
      krajanekRideTickTimer: 0.2,
      krajanekFlats: [],
    };
    const heavy = createEnemy(20, 0, 600);
    const lighter = createEnemy(20, 0, 550);

    stepKrajanekRide(player, 0.1, [heavy, lighter]);

    expect(heavy.takeDamage).toHaveBeenCalled();
    expect(lighter.krajanekFlattened).toBe(true);
    expect(player.krajanekRideTimer).toBeCloseTo(0.9);
  });

  it('keeps invulnerabilityTimer synchronized and clears meltingPuddleSlowTimer during ride', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      krajanekRideTimer: 5.0,
      invulnerabilityTimer: 1.0,
      meltingPuddleSlowTimer: 0.15,
      krajanekFlats: [],
    };

    stepKrajanekRide(player, 0.5, []);

    expect(player.krajanekRideTimer).toBeCloseTo(4.5);
    expect(player.invulnerabilityTimer).toBeCloseTo(4.5);
    expect(player.meltingPuddleSlowTimer).toBe(0);
  });

  it('grants a post-ride safety grace period and clears puddle slow when ride timer expires', () => {
    const player: any = {
      type: 'krajanek',
      x: 0,
      y: 0,
      radius: 20,
      krajanekRideTimer: 0.1,
      invulnerabilityTimer: 0.1,
      meltingPuddleSlowTimer: 0.15,
      krajanekFlats: [],
    };

    stepKrajanekRide(player, 0.2, []);

    expect(player.krajanekRideTimer).toBe(0);
    expect(player.invulnerabilityTimer).toBeGreaterThanOrEqual(1.2);
    expect(player.meltingPuddleSlowTimer).toBe(0);
  });

  describe('Fyzika hybnosti a momentum curve', () => {
    it('accurately ramps speed across the 4 momentum phases', () => {
      const player: any = {
        type: 'krajanek',
        krajanekRideTimer: 13.9, // elapsed = 0.1s -> Phase 1
        krajanekColossusStacks: 0,
      };
      expect(getKrajanekMomentumMultiplier(player)).toBe(1.0);

      // Phase 2: midpoint (elapsed = 0.75s, progress = 0.5)
      player.krajanekRideTimer = 13.25;
      expect(getKrajanekMomentumMultiplier(player)).toBeCloseTo(1.65, 2);

      // Phase 3: full speed (elapsed = 2.0s)
      player.krajanekRideTimer = 12.0;
      expect(getKrajanekMomentumMultiplier(player)).toBe(2.0);

      // Rozjetý kolos stacks (+5% each)
      player.krajanekColossusStacks = 2; // +10%
      expect(getKrajanekMomentumMultiplier(player)).toBeCloseTo(2.2, 2);

      // Hammer micro-impulse adds +25%
      player.krajanekImpulseTimer = 0.15;
      expect(getKrajanekMomentumMultiplier(player)).toBeCloseTo(2.75, 2);
      player.krajanekImpulseTimer = 0;

      // Gravel drift drops forward speed to 70%
      player.krajanekDriftTimer = 0.2;
      expect(getKrajanekMomentumMultiplier(player)).toBeCloseTo(1.54, 2);
    });

    it('enforces turn rate cap and triggers gravel drift on sharp turns > 60 degrees', () => {
      const player: any = {
        type: 'krajanek',
        krajanekRideTimer: 7.0, // Phase 3 (stiffer inertia)
        krajanekHeadingAngle: 0, // facing right
        lastDx: 1,
        lastDy: 0,
      };
      const soundCalls: string[] = [];
      let driftSprayed = false;
      const callbacks = {
        onSound: (s: string) => soundCalls.push(s),
        onDriftSpray: () => { driftSprayed = true; },
      };

      // Sharp 90-degree turn down (> 60 deg threshold)
      const steer = computeKrajanekSteering(player, 0, 1, 0.05, callbacks);

      expect(steer.isDrifting).toBe(true);
      expect(player.krajanekIsDrifting).toBe(true);
      expect(soundCalls).toContain('zernovDrift');
      expect(driftSprayed).toBe(true);
      expect(steer.tilt).toBeGreaterThan(0);
      // Turn rate cap in Phase 3 is 4.8 rad/s base, so after 0.05s angle turns at most 0.24 rad
      expect(player.krajanekHeadingAngle).toBeCloseTo(0.24, 2);
    });

    it('grants enhanced turn rate maneuverability (7.2 rad/s) for touch controls', () => {
      const touchPlayer: any = {
        type: 'krajanek',
        krajanekRideTimer: 7.0,
        krajanekHeadingAngle: 0,
        isTouchInput: true,
      };
      computeKrajanekSteering(touchPlayer, 0, 1, 0.05, { isTouchInput: true });
      // Touch turn rate in Phase 3 is 7.2 rad/s, so after 0.05s angle turns 0.36 rad
      expect(touchPlayer.krajanekHeadingAngle).toBeCloseTo(0.36, 2);
    });

    it('doubles steering capability during oškrt turn rate boost', () => {
      const normalPlayer: any = {
        type: 'krajanek',
        krajanekRideTimer: 7.0,
        krajanekHeadingAngle: 0,
      };
      const boostedPlayer: any = {
        type: 'krajanek',
        krajanekRideTimer: 7.0,
        krajanekHeadingAngle: 0,
        krajanekTurnBoostTimer: 0.10, // hammer boost active
      };

      computeKrajanekSteering(normalPlayer, 0, 1, 0.05);
      computeKrajanekSteering(boostedPlayer, 0, 1, 0.05);

      expect(boostedPlayer.krajanekHeadingAngle).toBeCloseTo(normalPlayer.krajanekHeadingAngle * 2, 2);
    });
  });

  describe('Váhové kategorie kolizí: Swarm, Elity (Jezinka), Bossové', () => {
    it('correctly uses the true millstone collision radius (48px base)', () => {
      const player: any = {
        type: 'krajanek',
        krajanekColossusStacks: 0,
      };
      expect(KRAJANEK_STONE_RADIUS).toBe(48);
      expect(getKrajanekStoneRadius(player)).toBe(48);

      player.krajanekColossusStacks = 2; // +10% width
      expect(getKrajanekStoneRadius(player)).toBeCloseTo(52.8, 1);
    });

    it('builds Rozjetý kolos stacks from crushing swarms without slowing down', () => {
      const player: any = {
        type: 'krajanek',
        x: 0,
        y: 0,
        radius: 20,
        damageMultiplier: 1,
        krajanekRideTimer: 7.0,
        krajanekFlats: [],
        krajanekCrushedCount: 19,
        krajanekColossusStacks: 0,
      };
      const swarmEnemy = createEnemy(20, 0, 50, 10);
      const texts: any[] = [];
      stepKrajanekRide(player, 1 / 60, [swarmEnemy], undefined, {
        onDamageText: (t: any) => texts.push(t),
      });

      expect(swarmEnemy.krajanekFlattened).toBe(true);
      expect(player.krajanekCrushedCount).toBe(20);
      expect(player.krajanekColossusStacks).toBe(1);
      expect(texts.some(t => t.text.includes('ROZJETÝ KOLOS'))).toBe(true);
    });

    it('interacts correctly with Mrazivá jezinka: triggers hitstop, crack sound, frost burst and violent fling', () => {
      const player: any = {
        type: 'krajanek',
        x: 0,
        y: 0,
        radius: 20,
        damageMultiplier: 1,
        krajanekRideTimer: 7.0,
        krajanekFlats: [],
      };
      // Mrazivá jezinka has 520 HP (> 400 base blocking threshold)
      const jezinka: any = {
        id: 'jezinka_mraziva',
        x: 30,
        y: 0,
        maxHp: 520,
        hp: 520,
        radius: 20,
        dead: false,
        isDefeated: false,
        takeDamage: vi.fn(),
        pushVx: 0,
        pushVy: 0,
      };

      let hitstopTriggered = false;
      let frostBurstTriggered = false;
      const soundCalls: string[] = [];
      const texts: any[] = [];

      const callbacks = {
        onHitstop: (time: number) => { hitstopTriggered = time === 0.05; },
        onSound: (s: string) => soundCalls.push(s),
        onFrostBurst: () => { frostBurstTriggered = true; },
        onDamageText: (t: any) => texts.push(t),
      };

      stepKrajanekRide(player, 1 / 60, [jezinka], undefined, callbacks);

      expect(hitstopTriggered).toBe(true);
      expect(soundCalls).toContain('zernovCrack');
      expect(soundCalls).toContain('freeze');
      expect(frostBurstTriggered).toBe(true);
      expect(jezinka.takeDamage).toHaveBeenCalled();
      // Fling pushes Jezinka outward
      expect(jezinka.x).toBeGreaterThan(30);
      expect(jezinka.pushVx).toBeGreaterThan(0);
      expect(texts.some(t => t.text.includes('ROZBITÝ MRÁZ'))).toBe(true);
    });

    it('triggers pinball ricochet when slamming into a Boss', () => {
      const player: any = {
        type: 'krajanek',
        x: 0,
        y: 0,
        radius: 20,
        damageMultiplier: 1,
        krajanekRideTimer: 7.0,
        krajanekHeadingAngle: 0, // moving right towards boss
        krajanekCurrentSpeed: 360,
        krajanekFlats: [],
      };
      const boss: any = {
        id: 'cert_boss',
        isBoss: true,
        x: 40,
        y: 0,
        maxHp: 5000,
        hp: 5000,
        radius: 40,
        dead: false,
        isDefeated: false,
        takeDamage: vi.fn(),
      };

      let pinballSparks = false;
      let cameraShake = false;
      const soundCalls: string[] = [];
      const texts: any[] = [];

      const callbacks = {
        onSound: (s: string) => soundCalls.push(s),
        onCameraShake: () => { cameraShake = true; },
        onPinballSparks: () => { pinballSparks = true; },
        onDamageText: (t: any) => texts.push(t),
      };

      stepKrajanekRide(player, 1 / 60, [boss], undefined, callbacks);

      expect(boss.takeDamage).toHaveBeenCalled();
      expect(soundCalls).toContain('zernovBounce');
      expect(pinballSparks).toBe(true);
      expect(cameraShake).toBe(true);
      expect(texts.some(t => t.text.includes('KULEČNÍKOVÝ ODRAZ'))).toBe(true);
      // The bounce reflects the heading angle away from the boss
      expect(Math.cos(player.krajanekHeadingAngle)).toBeLessThan(0);
    });
  });

  describe('Phase 4: Katapultáž a neřízený žernov', () => {
    it('spawns a coasting stone entity upon ride expiration', () => {
      const player: any = {
        type: 'krajanek',
        x: 100,
        y: 200,
        radius: 20,
        damageMultiplier: 1,
        krajanekRideTimer: 0.05, // will expire on next step
        krajanekHeadingAngle: 0,
        krajanekFlats: [],
        krajanekCoastingStones: [],
      };

      let spawnedStone: any = null;
      stepKrajanekRide(player, 0.1, [], undefined, {
        onSpawnCoastingStone: (s: any) => { spawnedStone = s; },
      });

      expect(player.krajanekRideTimer).toBe(0);
      expect(spawnedStone).not.toBeNull();
      expect(spawnedStone.life).toBe(KRAJANEK_COAST_DURATION);
      expect(spawnedStone.vx).toBeGreaterThan(0);
      expect(spawnedStone.radius).toBe(KRAJANEK_STONE_RADIUS);
    });

    it('advances coasting stone and executes massive flat slam on expiration', () => {
      const stone: any = {
        x: 100,
        y: 100,
        vx: 300,
        vy: 0,
        radius: 48,
        life: 0.05,
        maxLife: 1.5,
        damageScale: 1,
        colossusStacks: 0,
      };
      const crowdMob = createEnemy(120, 100, 200, 15);
      const soundCalls: string[] = [];
      let cameraShaken = false;
      const texts: any[] = [];

      const callbacks = {
        onSound: (s: string) => soundCalls.push(s),
        onCameraShake: () => { cameraShaken = true; },
        onDamageText: (t: any) => texts.push(t),
      };

      const stones = [stone];
      stepKrajanekCoastingStones(stones, 0.1, [crowdMob], callbacks);

      expect(stones).toHaveLength(0); // removed upon expiration
      expect(soundCalls).toContain('zernovSlam');
      expect(cameraShaken).toBe(true);
      expect(crowdMob.takeDamage).toHaveBeenCalled();
      expect(texts.some(t => t.text.includes('PLÁCNUTÍ ŽERNOVU'))).toBe(true);
    });
  });

  describe('Cooldown Pause during Active Abilities', () => {
    it('detects active ability state correctly via isPlayerAbilityActive', () => {
      const krajanekPlayer = { type: 'krajanek', krajanekRideTimer: 5.0 };
      expect(isPlayerAbilityActive(krajanekPlayer)).toBe(true);

      const finishedPlayer = { type: 'krajanek', krajanekRideTimer: 0 };
      expect(isPlayerAbilityActive(finishedPlayer)).toBe(false);

      const cutsceneState = { cutscene: { type: 'granny' } };
      expect(isPlayerAbilityActive({ type: 'granny' }, cutsceneState)).toBe(true);
    });
  });
});

