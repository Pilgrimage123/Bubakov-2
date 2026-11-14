import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { TACTICAL_REGULAR_ENEMY_IDS } from '../src/game/enemyAi';

function setupCleanEngine(levelId = 4): GameEngine {
  const engine = new GameEngine();
  engine.initRun({
    levelId,
    hunterType: 'wanderer',
    spawnInitialWave: false,
  });
  engine.state.decor = [];
  engine.state.player!.x = 0;
  engine.state.player!.y = 0;
  engine.state.player!.vx = 0;
  engine.state.player!.vy = 0;
  engine.state.player!.hp = 2000;
  engine.state.player!.maxHp = 2000;
  engine.state.player!.repulseCooldown = 999;
  engine.state.player!.weapons = [];
  return engine;
}

function stepEngine(engine: GameEngine, steps: number, dt = 0.05) {
  for (let i = 0; i < steps; i++) {
    engine.update(dt);
  }
}

describe('Tactical Regular Enemy AI (Taktičtí běžní bubáci)', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = setupCleanEngine(4);
  });

  it('registers all 15 tactical regular enemies in TACTICAL_REGULAR_ENEMY_IDS', () => {
    expect(TACTICAL_REGULAR_ENEMY_IDS.size).toBe(15);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('skodnik')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('rak_ricni')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('boruvkovy_diblik')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('divozenka')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('mrazik')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('severak')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('cerny_vlkodlak')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('podzimni_strasak')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('divoky_kanec')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('lesni_pytlak')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('kluk_na_sankach')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('masopustni_laufr')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('masopustni_krasojezdec')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('smutecni_maskara')).toBe(true);
    expect(TACTICAL_REGULAR_ENEMY_IDS.has('plivnik_uhlik')).toBe(true);
  });

  it('skodnik retreats when hunter rushes close (< 95px), winds up at mid-range, throws wood_shard, then evades', () => {
    const closeSq = engine.spawnMonster('skodnik', 60, 0);
    closeSq.specialCd = 2.0;
    engine.update(0.05);
    // Retreats away from (0,0), so vx > 0
    expect(closeSq.vx).toBeGreaterThan(0);

    const midSq = engine.spawnMonster('skodnik', 180, 0);
    midSq.specialCd = 0;
    engine.update(0.05);
    expect(midSq.aiState).toBe('windup');
    expect(midSq.vx).toBe(0);

    stepEngine(engine, 10, 0.05);
    const cones = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'wood_shard');
    expect(cones.length).toBeGreaterThanOrEqual(1);
    expect(midSq.aiState).toBe('evade');
  });

  it('rak_ricni scuttles diagonally, executes telegraphed pincer snap, enters exposed cooldown, and blocks only frontal hits', () => {
    const crab = engine.spawnMonster('rak_ricni', 120, 0);
    crab.specialCd = 5.0;
    crab.orbitDir = 1;
    engine.update(0.05);
    // Diagonal crab scuttle has significant lateral vy
    expect(Math.abs(crab.vy)).toBeGreaterThan(Math.abs(crab.vx) * 0.4);

    // Trigger windup -> charge -> cooldown
    crab.specialCd = 0;
    engine.update(0.05);
    expect(crab.aiState).toBe('windup');

    stepEngine(engine, 12, 0.05);
    expect(['charge', 'cooldown']).toContain(crab.aiState);

    stepEngine(engine, 10, 0.05);
    expect(crab.aiState).toBe('cooldown');

    // Frontal vs rear shell check on rak_ricni
    const crabFront = engine.spawnMonster('rak_ricni', 200, 0);
    crabFront.vx = -60; // facing left toward player at x=0
    const hpBeforeFront = crabFront.hp;
    // Projectile moving rightward (+x) strikes the left (front) face of the crab -> kbx > 0
    crabFront.takeDamage(100, 'physical', 100, 0);
    const frontDmg = hpBeforeFront - crabFront.hp;

    const crabBack = engine.spawnMonster('rak_ricni', 200, 40);
    crabBack.vx = -60; // facing left
    const hpBeforeBack = crabBack.hp;
    // Flanking strike from behind pushes crab left -> kbx < 0
    crabBack.takeDamage(100, 'physical', -100, 0);
    const backDmg = hpBeforeBack - crabBack.hp;

    expect(frontDmg).toBeLessThan(backDmg * 0.4);
  });

  it('boruvkovy_diblik kites at range, lobs mud_ball and spawns sticky berry-puddle hazard', () => {
    const diblik = engine.spawnMonster('boruvkovy_diblik', 190, 0);
    diblik.specialCd = 0;
    engine.update(0.05);
    expect(diblik.aiState).toBe('windup');

    stepEngine(engine, 12, 0.05);
    const berries = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'mud_ball');
    expect(berries.length).toBeGreaterThanOrEqual(1);
    expect(berries[0].slowPlayer).toBe(true);

    const puddles = engine.director?.hazards.filter((h: any) => h.kind === 'berry-puddle');
    expect(puddles.length).toBeGreaterThanOrEqual(1);
    expect(puddles[0].slowFactor).toBeCloseTo(0.62, 2);
  });

  it('divozenka reactively sidesteps incoming player projectiles with a pirouette and casts 3-petal pollen dance', () => {
    const fairy = engine.spawnMonster('divozenka', 150, 0);
    fairy.specialCd = 5.0;
    fairy.dodgeCd = 0;
    // Spawn a player projectile approaching from (80, 0) heading +x toward fairy at (150, 0)
    engine.state.projectiles.push({
      x: 80,
      y: 0,
      vx: 300,
      vy: 0,
      angle: 0,
      speed: 300,
      dmg: 20,
      radius: 8,
      life: 1.5,
      isEnemy: false,
      hitList: [],
      dead: false,
    } as any);

    engine.update(0.05);
    expect(fairy.aiState).toBe('evade');
    expect(Math.abs(fairy.vy)).toBeGreaterThan(50);

    // Clear dodgeCd/evade and test 3-petal pollen dance
    fairy.aiState = 'idle';
    fairy.aiTimer = 0;
    fairy.specialCd = 0;
    engine.state.projectiles = [];
    engine.update(0.05);
    expect(fairy.aiState).toBe('windup');

    stepEngine(engine, 12, 0.05);
    const petals = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'pollen');
    expect(petals.length).toBe(3);
  });

  it('mrazik fires a 3-flake chilling breath cone with slowPlayer', () => {
    const frost = engine.spawnMonster('mrazik', 180, 0);
    frost.specialCd = 0;
    engine.update(0.05);
    expect(frost.aiState).toBe('windup');

    stepEngine(engine, 13, 0.05);
    const flakes = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'snowball_small');
    expect(flakes.length).toBe(3);
    expect(flakes.every((f: any) => f.slowPlayer === true)).toBe(true);
  });

  it('severak deflects nearby player projectiles laterally and fires wind_blade gusts', () => {
    const northWind = engine.spawnMonster('severak', 200, 0);
    northWind.specialCd = 0;
    northWind.orbitDir = 1;
    engine.update(0.05);
    expect(northWind.aiState).toBe('windup');

    // Place a player projectile passing near Severak so it is inside 135px when windup completes
    const playerBolt: any = {
      x: 150,
      y: 70,
      vx: 110,
      vy: 0,
      angle: 0,
      speed: 110,
      dmg: 20,
      radius: 8,
      life: 2.0,
      isEnemy: false,
      hitList: [],
      dead: false,
    };
    engine.state.projectiles.push(playerBolt);

    stepEngine(engine, 13, 0.05);
    expect(playerBolt._deflectedBySeverak).toBe(true);
    expect(Math.abs(playerBolt.vy)).toBeGreaterThan(30);

    const blades = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'wind_blade');
    expect(blades.length).toBe(2);
  });

  it('cerny_vlkodlak flanks from opposite pincer angles and lunges after windup', () => {
    const wolfA = engine.spawnMonster('cerny_vlkodlak', 260, 0);
    const wolfB = engine.spawnMonster('cerny_vlkodlak', 260, 0);
    wolfA.orbitDir = 1;
    wolfB.orbitDir = -1;
    wolfA.specialCd = 5.0;
    wolfB.specialCd = 5.0;

    engine.update(0.05);
    expect(wolfA.vy * wolfB.vy).toBeLessThan(0);

    wolfA.x = 160;
    wolfA.specialCd = 0;
    engine.update(0.05);
    expect(wolfA.aiState).toBe('windup');
    stepEngine(engine, 11, 0.05);
    expect(wolfA.aiState).toBe('charge');
    expect(Math.hypot(wolfA.vx, wolfA.vy)).toBeGreaterThan(wolfA.speed * 1.9);
  });

  it('divoky_kanec telegraphs a locked bull-rush, overshoots sidesteps, and enters panting cooldown', () => {
    const boar = engine.spawnMonster('divoky_kanec', 200, 0);
    boar.specialCd = 0;
    engine.update(0.05);
    expect(boar.aiState).toBe('windup');
    const lockedAngle = boar.chargeDirX;

    // Player sidesteps perpendicular during windup
    engine.state.player!.y = 140;
    stepEngine(engine, 17, 0.05);
    expect(boar.aiState).toBe('charge');
    // Charge stays locked on initial horizontal direction toward (0,0), not chasing y=140
    expect(boar.chargeDirX).toBeCloseTo(lockedAngle, 3);
    expect(Math.abs(boar.vy)).toBeLessThan(Math.abs(boar.vx) * 0.25);

    stepEngine(engine, 16, 0.05);
    expect(boar.aiState).toBe('cooldown');
    expect(Math.hypot(boar.vx, boar.vy)).toBeLessThan(boar.speed * 0.4);
  });

  it('lesni_pytlak backs away from close range and fires predictive lead sling shots', () => {
    const closePoacher = engine.spawnMonster('lesni_pytlak', 90, 0);
    closePoacher.specialCd = 5.0;
    engine.update(0.05);
    expect(closePoacher.vx).toBeGreaterThan(0);

    const sniper = engine.spawnMonster('lesni_pytlak', 220, 0);
    sniper.specialCd = 0;
    engine.state.keys.KeyS = true; // Player moving downward (+y)
    engine.update(0.05);
    expect(sniper.aiState).toBe('windup');

    stepEngine(engine, 14, 0.05);
    engine.state.keys.KeyS = false;
    const stones = engine.state.projectiles.filter((p: any) => p.isEnemy && p.visual === 'dirt_clod');
    expect(stones.length).toBeGreaterThanOrEqual(1);
    // Predictive lead aims downward (+y) to intercept moving hunter
    expect(stones[0].vy).toBeGreaterThan(15);
  });

  it('kluk_na_sankach carries sled momentum with bounded turn rate and drifts past sudden sidesteps', () => {
    const sled = engine.spawnMonster('kluk_na_sankach', 180, 0);
    engine.update(0.05);
    expect(sled.vx).toBeLessThan(0);

    // Player teleports sharply perpendicular
    engine.state.player!.x = 180;
    engine.state.player!.y = 180;
    engine.update(0.05);
    // Still carries substantial leftward x momentum instead of snapping 90 degrees instantaneously
    expect(sled.vx).toBeLessThan(-30);
  });

  it('podzimni_strasak, masopustni_laufr, masopustni_krasojezdec, smutecni_maskara, and plivnik_uhlik execute tactical windups & attacks', () => {
    const strasak = engine.spawnMonster('podzimni_strasak', 95, 0);
    strasak.specialCd = 0;
    const laufr = engine.spawnMonster('masopustni_laufr', 160, 0);
    laufr.specialCd = 0;
    const jezdec = engine.spawnMonster('masopustni_krasojezdec', 190, 0);
    jezdec.specialCd = 0;
    const maskara = engine.spawnMonster('smutecni_maskara', 170, 0);
    maskara.specialCd = 0;
    const plivnik = engine.spawnMonster('plivnik_uhlik', 185, 0);
    plivnik.specialCd = 0;

    engine.update(0.05);
    expect(strasak.aiState).toBe('windup');
    expect(laufr.aiState).toBe('windup');
    expect(jezdec.aiState).toBe('windup');
    expect(maskara.aiState).toBe('windup');
    expect(plivnik.aiState).toBe('windup');

    stepEngine(engine, 16, 0.05);
    expect(engine.state.projectiles.some((p: any) => p.isEnemy && p.visual === 'wood_shard')).toBe(true);
    expect(engine.state.projectiles.some((p: any) => p.isEnemy && p.visual === 'hell_spark')).toBe(true);
    expect(engine.state.projectiles.some((p: any) => p.isEnemy && p.visual === 'water_wave')).toBe(true);
    expect(jezdec.aiState).toBe('charge');
  });

  it('stunning a tactical enemy during windup cleanly interrupts its windup back to idle', () => {
    const boar = engine.spawnMonster('divoky_kanec', 180, 0);
    boar.specialCd = 0;
    engine.update(0.05);
    expect(boar.aiState).toBe('windup');

    boar.takeDamage(25, 'physical', 0, 0, { stunDuration: 0.6 });
    expect(boar.aiState).toBe('idle');
    expect(boar.stunTimer).toBeGreaterThan(0);
  });
});
