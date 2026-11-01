import { describe, it, expect, vi } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';

describe('Miniboss & Boss Tactical Complexity Audit (At least 2 attacks per encounter)', () => {
  it('Stage 1 (Level 0): Blatouchový skřítek miniboss fires pollen spray & spawns vine mud patch', () => {
    const engine = new GameEngine();
    engine.initRun(0, 'wanderer');

    const boss = engine.spawnMonster('blatouch', 100, 100, 1.0, true, true);
    expect(boss).toBeDefined();

    // Force attack cooldowns
    boss.pollenCooldown = 0;
    boss.vineCooldown = 0;
    engine.update(0.1);

    const pollenProjs = engine.state.projectiles.filter((p: any) => p.visual === 'pollen');
    expect(pollenProjs.length).toBe(3);

    const mudHazards = engine.director?.hazards.filter((h: any) => h.kind === 'mud-patch');
    expect(mudHazards.length).toBeGreaterThan(0);
  });

  it('Stage 1 (Level 0): Jarní Vodníček midboss spawns water geyser & fires bubble stream', () => {
    const engine = new GameEngine();
    engine.initRun(0, 'wanderer');

    const boss = engine.spawnMonster('vodnicek', 120, 120, 1.0, true, false);
    expect(boss).toBeDefined();

    boss.geyserCooldown = 0;
    boss.bubbleCooldown = 0;
    engine.update(0.1);

    const geysers = engine.director?.hazards.filter((h: any) => h.kind === 'water-geyser');
    expect(geysers.length).toBeGreaterThan(0);

    const bubbles = engine.state.projectiles.filter((p: any) => p.visual === 'bubble');
    expect(bubbles.length).toBe(3);
  });

  it('Stage 2 (Level 1): Mrazivý obr midboss executes frost ground stomp & icicle volley', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer');

    const boss = engine.spawnMonster('mrazivy_obr', 100, 100, 1.0, true, false);
    expect(boss).toBeDefined();

    boss.stompCooldown = 0;
    boss.icicleCooldown = 0;
    engine.update(0.1);

    const stomps = engine.director?.hazards.filter((h: any) => h.kind === 'frost-stomp');
    expect(stomps.length).toBeGreaterThan(0);

    const icicles = engine.state.projectiles.filter((p: any) => p.visual === 'icicle');
    expect(icicles.length).toBe(3);
  });

  it('Stage 2 (Level 1): Morana final boss fires wind blades & spawns blizzard AoE zone', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer');

    const boss = engine.spawnMonster('morana', 150, 150, 1.0, true, false);
    expect(boss).toBeDefined();

    boss.windBladeCooldown = 0;
    boss.blizzardCooldown = 0;
    engine.update(0.1);

    const blades = engine.state.projectiles.filter((p: any) => p.visual === 'wind_blade');
    expect(blades.length).toBe(3);

    const blizzards = engine.director?.hazards.filter((h: any) => h.kind === 'blizzard-zone');
    expect(blizzards.length).toBeGreaterThan(0);
  });

  it('Stage 3 (Level 2): Obří kolednický beránek miniboss executes ramming push & ground slam shockwave', () => {
    const engine = new GameEngine();
    engine.initRun(2, 'wanderer');

    const boss = engine.spawnMonster('beranek', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    const initialPlayerX = engine.state.player!.x;
    boss.woolBurstTimer = 0;
    boss.slamCooldown = 0;
    engine.update(0.1);

    expect(engine.state.player!.x).not.toBe(initialPlayerX);

    const shockwaves = engine.director?.hazards.filter((h: any) => h.kind === 'ground-shockwave');
    expect(shockwaves.length).toBeGreaterThan(0);
  });

  it('Stage 3 (Level 2): Stará ježibaba z Melechu midboss fires poison eggs & spawns broom gust hazard', () => {
    const engine = new GameEngine();
    engine.initRun(2, 'wanderer');

    const boss = engine.spawnMonster('carodejnice_stara', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.emberTimer = 0;
    boss.gustCooldown = 0;
    engine.update(0.1);

    const venomProjs = engine.state.projectiles.filter((p: any) => p.visual === 'witch_venom');
    expect(venomProjs.length).toBe(3);

    const gusts = engine.director?.hazards.filter((h: any) => h.kind === 'witch-gust');
    expect(gusts.length).toBeGreaterThan(0);
  });

  it('Stage 4 (Level 3): Večerní Klekánice miniboss executes bell toll shockwave & night shadow dash', () => {
    const engine = new GameEngine();
    engine.initRun(3, 'wanderer');

    const boss = engine.spawnMonster('klekanice', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    const initialHp = engine.state.player!.hp;
    boss.bellTollCooldown = 0;
    boss.dashCooldown = 0;
    engine.update(0.1);

    expect(engine.state.player!.hp).toBeLessThan(initialHp);
    expect(boss.speedBurstTimer).toBeGreaterThan(0);
  });

  it('Stage 4 (Level 3): Pekelný dráb midboss executes whip cleave & chain shackles hazard', () => {
    const engine = new GameEngine();
    engine.initRun(3, 'wanderer');

    const boss = engine.spawnMonster('drab', 80, 0, 1.0, false, true);
    expect(boss).toBeDefined();

    const initialHp = engine.state.player!.hp;
    boss.whipCleaveCooldown = 0;
    boss.shackleCooldown = 0;
    engine.update(0.1);

    expect(engine.state.player!.hp).toBeLessThan(initialHp);

    const shackles = engine.director?.hazards.filter((h: any) => h.kind === 'chain-shackle');
    expect(shackles.length).toBeGreaterThan(0);
  });

  it('Stage 5 (Level 4): Čarodějnice Zaspalka miniboss executes swoop pass & ink smoke trail', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const boss = engine.spawnMonster('carodejnice_zaspalka', 200, 200, 1.0, false, true);
    expect(boss).toBeDefined();

    for (let i = 0; i < 5; i++) {
      engine.update(0.1);
    }

    expect(boss.zaspalkaState).toBe('swoop');
    const smoke = engine.director?.hazards.filter((h: any) => h.kind === 'ink-smoke');
    expect(smoke.length).toBeGreaterThan(0);
  });

  it('Stage 5 (Level 4): Bahenní hastrman midboss fires water spray & spawns water jar traps', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const boss = engine.spawnMonster('hastrman', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.sprayCooldown = 0;
    boss.jarCooldown = 0;
    engine.update(0.1);

    const sprays = engine.state.projectiles.filter((p: any) => p.visual === 'water_drop');
    expect(sprays.length).toBe(3);

    const jars = engine.director?.hazards.filter((h: any) => h.kind === 'water-jar-trap');
    expect(jars.length).toBeGreaterThan(0);
  });

  it('Stage 5 (Level 4): Ledoví muži final boss triad execute 3 role-specific attacks', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    engine.spawnMonster('ledovi_muzi', 200, 200, 1.0, true);

    const pankrac = engine.state.enemies.find((e: any) => e.trioRole === 'pankrac');
    const servac = engine.state.enemies.find((e: any) => e.trioRole === 'servac');
    const bonifac = engine.state.enemies.find((e: any) => e.trioRole === 'bonifac');

    pankrac.icicleCooldown = 0;
    servac.hailCooldown = 0;
    bonifac.freezePulseCooldown = 0;

    engine.update(0.1);

    const icicles = engine.state.projectiles.filter((p: any) => p.visual === 'icicle');
    expect(icicles.length).toBe(5);

    const hail = engine.director?.hazards.filter((h: any) => h.kind === 'hail-circle');
    expect(hail.length).toBeGreaterThan(0);
  });

  it('Stage 6 (Level 5): Hejtman Zbojník miniboss executes saber charge & summons bandit minion pack', () => {
    const engine = new GameEngine();
    engine.initRun(5, 'wanderer');

    const boss = engine.spawnMonster('zbojnik', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.saberDashCooldown = 0;
    boss.whistleCooldown = 0;
    const initialEnemies = engine.state.enemies.length;
    engine.update(0.1);

    expect(boss.speedBurstTimer).toBeGreaterThan(0);
    expect(engine.state.enemies.length).toBeGreaterThan(initialEnemies);
  });

  it('Stage 6 (Level 5): Prokletý Mlynář midboss spawns water surge & flour dust cloud', () => {
    const engine = new GameEngine();
    engine.initRun(5, 'wanderer');

    const boss = engine.spawnMonster('mlynar', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.surgeCooldown = 0;
    boss.flourCloudCooldown = 0;
    engine.update(0.1);

    const surges = engine.director?.hazards.filter((h: any) => h.kind === 'mill-surge');
    expect(surges.length).toBeGreaterThan(0);

    const flour = engine.director?.hazards.filter((h: any) => h.kind === 'flour-cloud');
    expect(flour.length).toBeGreaterThan(0);
  });

  it('Stage 6 (Level 5): Půlnoční Hejkal final boss executes thunder howl roar & timber log toss', () => {
    const engine = new GameEngine();
    engine.initRun(5, 'wanderer');

    const boss = engine.spawnMonster('hejkal', 100, 100, 1.0, true, false);
    expect(boss).toBeDefined();

    const initialHp = engine.state.player!.hp;
    boss.howlCooldown = 0;
    boss.logTossCooldown = 0;
    engine.update(0.1);

    expect(engine.state.player!.hp).toBeLessThan(initialHp);

    const logs = engine.state.projectiles.filter((p: any) => p.visual === 'log');
    expect(logs.length).toBe(3);
  });

  it('Stage 7 (Level 6): Královský Vele-rak, Pekelný Čert Sekáč, Královská Polednice execute multi-attack routines', () => {
    const engine = new GameEngine();
    engine.initRun(6, 'wanderer');

    // Miniboss
    const rak = engine.spawnMonster('kralovsky_vele_rak', 100, 100, 1.0, false, true);
    rak.chargeCooldown = 0;
    rak.waterJetCooldown = 0;
    engine.update(0.1);
    expect(rak.speedBurstTimer).toBeGreaterThan(0);
    const mudJets = engine.state.projectiles.filter((p: any) => p.type === 'water');
    expect(mudJets.length).toBeGreaterThan(0);

    // Midboss
    const cert = engine.spawnMonster('cert_sekac', 100, 100, 1.0, false, true);
    cert.scytheCleaveCooldown = 0;
    cert.fireTrailCooldown = 0;
    engine.update(0.1);
    const firePatches = engine.director?.hazards.filter((h: any) => h.kind === 'fire-patch');
    expect(firePatches.length).toBeGreaterThan(0);

    // Final Boss
    const polednice = engine.spawnMonster('kralovska_polednice', 100, 100, 1.0, true, false);
    polednice.hp = 1000; // Phase 2 trigger (< 60% HP)
    polednice.heatPulseCooldown = 0;
    polednice.lightningCooldown = 0;
    engine.update(0.1);
    const heatRings = engine.director?.hazards.filter((h: any) => h.kind === 'heat-ring');
    expect(heatRings.length).toBeGreaterThan(0);
    const lightnings = engine.director?.hazards.filter((h: any) => h.kind === 'lightning-strike');
    expect(lightnings.length).toBeGreaterThan(0);
  });

  it('applies both slow and damage on water-geyser and mud hazards after warningTimer expires', () => {
    const engine = new GameEngine();
    engine.initRun(0, 'wanderer');
    const player = engine.state.player!;
    player.weapons = [];
    player.x = 0;
    player.y = 0;

    // Spawn Vodníček and trigger water-geyser at player's position
    const vodnicek = engine.spawnMonster('vodnicek', 220, 220, 1.0, true, false);
    vodnicek.geyserCooldown = 0;
    engine.update(0.05);

    const geyser = engine.director?.hazards.find((h: any) => h.kind === 'water-geyser');
    expect(geyser).toBeDefined();
    expect(geyser!.warningTimer).toBeGreaterThan(0);

    // Advance past warningTimer while keeping player inside the geyser radius
    const hpBeforeGeyser = player.hp;
    for (let i = 0; i < 12; i++) {
      player.x = geyser!.x;
      player.y = geyser!.y;
      player.invuln = 0;
      engine.update(0.1);
    }

    expect(player.hp).toBeLessThan(hpBeforeGeyser);
    expect(player.hazardSlowTimer).toBeGreaterThan(0);
    expect(player.hazardSlowFactor).toBeLessThan(1);
  });
});

