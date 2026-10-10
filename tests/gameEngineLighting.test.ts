import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../src/game/engine';

describe('GameEngine Storybook Lighting Integration', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.initRun({
      levelId: 1,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });
  });

  it('initializes with empty lightSources and shadowZones in state', () => {
    expect(engine.state.lightSources).toBeDefined();
    expect(engine.state.shadowZones).toBeDefined();
  });

  it('manages player Petrolejka based on day phase and Kuráž', () => {
    const player = engine.state.player;
    expect(player).toBeDefined();

    // At gameTime = 0 (Poledne / Noon): Petrolejka should not be active (0 radius)
    engine.update(0.1);
    const noonLight = engine.state.lightSources.find((ls) => ls.id === 'player_petrolejka');
    expect(!noonLight || noonLight.radius === 0).toBe(true);

    // Fast-forward to Night phase (gameTime = 200s, Hluboká noc)
    engine.state.gameTime = 200;
    engine.update(0.1);

    const nightLight = engine.state.lightSources.find((ls) => ls.id === 'player_petrolejka');
    expect(nightLight).toBeDefined();
    expect(nightLight!.radius).toBeGreaterThan(150);

    // Drop Kuráž to critical (< 25%)
    player.hp = player.maxHp * 0.15;
    engine.update(0.1);

    const criticalLight = engine.state.lightSources.find((ls) => ls.id === 'player_petrolejka');
    expect(criticalLight!.radius).toBeLessThanOrEqual(85);
    expect(criticalLight!.radius).toBeGreaterThan(40);
  });

  it('applies Stínová záštita to Bubák in darkness and dissolves it upon entering Petrolejka light', () => {
    const player = engine.state.player;
    player.x = 0;
    player.y = 0;
    player.hp = player.maxHp;

    // Set to night phase (gameTime = 200s) so darkness is active
    engine.state.gameTime = 200;
    engine.update(0.016); // Updates Petrolejka at (0, 0) with radius ~220

    // Spawn Bubák far in the dark at (600, 600)
    const bubak = engine.createHeadlessEnemy('bubak', 600, 600);
    engine.state.enemies.push(bubak);

    // First update: Bubák is in gloom, so it gains Stínová záštita
    engine.update(0.016);
    expect(bubak.hasShadowDefense).toBe(true);

    // Take damage in darkness: 40% reduction applied
    const hpBefore = bubak.hp;
    bubak.takeDamage(100, 'physical');
    const damageTakenInDark = hpBefore - bubak.hp;

    // Move Bubák directly next to player into Petrolejka light
    bubak.x = 20;
    bubak.y = 20;

    // Next update: Bubák enters light -> Stínová záštita dissolves!
    engine.update(0.016);
    expect(bubak.hasShadowDefense).toBe(false);
    expect(bubak.stunTimer).toBeGreaterThan(0); // Staggered!
    expect(bubak.shadowVulnerabilityTimer).toBeGreaterThan(0); // Vulnerable!

    // Take damage in light with vulnerability: should take +25% damage
    const hpBeforeLightHit = bubak.hp;
    bubak.takeDamage(100, 'physical');
    const damageTakenInLight = hpBeforeLightHit - bubak.hp;
    expect(damageTakenInLight).toBeGreaterThan(damageTakenInDark);
  });

  it('spawns a dynamic light burst on melee slash action', () => {
    const countBefore = engine.state.lightSources.length;
    engine.applyWeaponAction({
      type: 'slash',
      slash: {
        x: 100,
        y: 100,
        reach: 80,
        dmg: 25,
      },
    });

    expect(engine.state.lightSources.length).toBeGreaterThan(countBefore);
    const slashLight = engine.state.lightSources.find((ls) => ls.type === 'osika');
    expect(slashLight).toBeDefined();
    expect(slashLight!.color).toBe('#7DD3FC');
  });

  it('creates Bludička ethereal shimmer light source and evaluates spirit attraction', () => {
    const bludicka = engine.createHeadlessEnemy('bludicka', 300, 300);
    const skeleton = engine.createHeadlessEnemy('skeleton', 320, 320); // nearby undead
    engine.state.enemies.push(bludicka, skeleton);

    engine.update(0.016);

    const bLight = engine.state.lightSources.find((ls) => ls.type === 'bludicka');
    expect(bLight).toBeDefined();
    expect(bLight!.x).toBe(bludicka.x);
    expect(bLight!.y).toBe(bludicka.y);

    // Skeleton is inside the Bludička aura
    expect(skeleton.bludickaAttracted).toBe(true);
  });
});
