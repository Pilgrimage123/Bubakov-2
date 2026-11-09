import { describe, it, expect, vi } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';

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

  it('Stage 2 (Level 1): Tající sněhulák miniboss rolls snowball projectile & spawns slush puddle hazard', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer');

    const boss = engine.spawnMonster('tajici_snehulak', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.snowballCooldown = 0;
    boss.slushPuddleCooldown = 0;
    engine.update(0.1);

    const snowballs = engine.state.projectiles.filter((p: any) => p.visual === 'snowball');
    expect(snowballs.length).toBeGreaterThan(0);

    const slush = engine.director?.hazards.filter((h: any) => h.kind === 'slush-puddle');
    expect(slush.length).toBeGreaterThan(0);
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

  it('Stage 3 (Level 2): Koledující bubák s pomlázkou midboss executes whip lash, painted egg volley & yolk puddles', () => {
    const engine = new GameEngine();
    engine.initRun(2, 'wanderer');

    const boss = engine.spawnMonster('koledujici_bubak', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.pomlazkaCooldown = 0;
    boss.krasliceCooldown = 0;
    boss.carolHopCooldown = 0;
    engine.update(0.1);

    const eggs = engine.state.projectiles.filter((p: any) => p.visual === 'painted_egg');
    expect(eggs.length).toBe(3);

    const yolks = engine.director?.hazards.filter((h: any) => h.kind === 'yolk-puddle');
    expect(yolks.length).toBeGreaterThan(0);
    expect(boss.hopSpeedTimer).toBeGreaterThan(0);
  });

  it('Stage 3 (Level 2): Pan Zajíc z březového háje final boss executes rabbit stomp, egg basket & pollen dash', () => {
    const engine = new GameEngine();
    engine.initRun(2, 'wanderer');

    const boss = engine.spawnMonster('pan_zajic', 120, 120, 1.0, true, false);
    expect(boss).toBeDefined();

    boss.leapCooldown = 0;
    boss.eggBasketCooldown = 0;
    boss.sprintCooldown = 0;
    engine.update(0.1);

    const stomps = engine.director?.hazards.filter((h: any) => h.kind === 'rabbit-stomp');
    expect(stomps.length).toBeGreaterThan(0);

    const eggs = engine.state.projectiles.filter((p: any) => p.visual === 'painted_egg');
    expect(eggs.length).toBe(3);

    expect(boss.sprintTimer).toBeGreaterThan(0);
  });

  it('Stage 4 (Level 3): Stará ježibaba z Melechu midboss fires poison eggs, broom gust hazard & sweep pass', () => {
    const engine = new GameEngine();
    engine.initRun(3, 'wanderer');

    const boss = engine.spawnMonster('carodejnice_stara', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.emberTimer = 0;
    boss.gustCooldown = 0;
    boss.broomSweepCooldown = 0;
    engine.update(0.1);

    const venomProjs = engine.state.projectiles.filter((p: any) => p.visual === 'witch_venom');
    expect(venomProjs.length).toBe(3);

    const gusts = engine.director?.hazards.filter((h: any) => h.kind === 'witch-gust');
    expect(gusts.length).toBeGreaterThan(0);
    expect(boss.broomSweepTimer).toBeGreaterThan(0);
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

  it('Stage 5 (Level 4): Čarodějnice Zaspalka miniboss executes swoop pass, ink smoke trail & sleepy hex', () => {
    const engine = new GameEngine();
    engine.initRun(4, 'wanderer');

    const boss = engine.spawnMonster('carodejnice_zaspalka', 200, 200, 1.0, false, true);
    expect(boss).toBeDefined();

    // Trigger swoop & reposition with sleepy hex
    boss.zaspalkaState = 'reposition';
    boss.sleepyHexCooldown = 0;
    engine.update(0.1);

    const hex = engine.state.projectiles.filter((p: any) => p.statusText?.includes('OSPALÉ UŘKNUTÍ'));
    expect(hex.length).toBeGreaterThan(0);

    boss.zaspalkaState = 'swoop';
    boss.smokeCooldown = 0;
    engine.update(0.1);

    const smoke = engine.director?.hazards.filter((h: any) => h.kind === 'ink-smoke');
    expect(smoke.length).toBeGreaterThan(0);
  });

  it('Stage 6 (Level 5): Skalní obr ze Sázavy midboss executes rolling boulder, rock stomp & rock shower', () => {
    const engine = new GameEngine();
    engine.initRun(5, 'wanderer');

    const boss = engine.spawnMonster('obr', 100, 100, 1.0, false, true);
    expect(boss).toBeDefined();

    boss.boulderCooldown = 0;
    boss.stompCooldown = 0;
    boss.rockThrowCooldown = 0;
    engine.update(0.1);

    const boulders = engine.state.projectiles.filter((p: any) => p.visual === 'boulder');
    expect(boulders.length).toBe(4); // 1 giant rolling boulder + 3-way rock shower

    const stomps = engine.director?.hazards.filter((h: any) => h.kind === 'rock-stomp');
    expect(stomps.length).toBeGreaterThan(0);
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

  it('Every big stage boss (Stages 1 to 8) executes at least 3 distinct, graphically & tactically impressive attacks/maneuvers', () => {
    // 1. Stage 1 Final Boss: Hejno mrazivých vran (vrana boss flock)
    {
      const engine = new GameEngine();
      engine.initRun(0, 'wanderer');
      engine.state.player!.weapons = [];
      const vranaBoss = engine.spawnMonster('vrana', 120, 120, 1.0, true, false);
      vranaBoss.crowDiveCooldown = 0;
      vranaBoss.featherVolleyCooldown = 0;
      vranaBoss.vortexCooldown = 0;
      engine.update(0.1);
      expect(vranaBoss.crowDiveTimer).toBeGreaterThan(0); // Attack 1: Dive pass
      expect(engine.state.projectiles.some((p: any) => p.visual === 'crow_feather')).toBe(true); // Attack 2: 3-way icy feathers
      expect(engine.director?.hazards.some((h: any) => h.kind === 'crow-vortex')).toBe(true); // Attack 3: Crow vortex cyclone
    }

    // 2. Stage 2 Final Boss: Smrtka Morana
    {
      const engine = new GameEngine();
      engine.initRun(1, 'wanderer');
      engine.state.player!.weapons = [];
      const morana = engine.spawnMonster('morana', 120, 120, 1.0, true, false);
      morana.windBladeCooldown = 0;
      morana.blizzardCooldown = 0;
      morana.effigyCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true); // Attack 1: Frost wind blades
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true); // Attack 2: Blizzard AoE
      expect(engine.state.projectiles.some((p: any) => p.visual === 'straw_doll')).toBe(true); // Attack 3: Straw effigy burst + herald summon
    }

    // 3. Stage 3 & 4 Final Boss: Vrchní čarodějnice
    {
      const engine = new GameEngine();
      engine.initRun(3, 'wanderer');
      engine.state.player!.weapons = [];
      const witch = engine.spawnMonster('vrchni_carodejnice', 120, 120, 1.0, true, false);
      witch.fireVortexTimer = 0;
      witch.pitchWreathCooldown = 0;
      witch.sabatDashCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true); // Attack 1: Witch fireball spread
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true); // Attack 2: Blazing pitch wreaths + pitch-wreath hazard
      expect(engine.director?.hazards.some((h: any) => h.kind === 'pitch-wreath')).toBe(true);
      expect(witch.sabatDashTimer).toBeGreaterThan(0); // Attack 3: Jet-broom dash + hex-circle + summon
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hex-circle')).toBe(true);
    }

    // 4. Stage 5 Final Boss: Ledoví muži (Pankrác, Servác a Bonifác)
    {
      const engine = new GameEngine();
      engine.initRun(4, 'wanderer');
      engine.state.player!.weapons = [];
      const saint = engine.spawnMonster('ledovi_muzi', 120, 120, 1.0, true, false);
      saint.icicleCooldown = 0;
      saint.hailCooldown = 0;
      saint.freezePulseCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true); // Attack 1: 5-way icicle fan
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true); // Attack 2: Hailstorm circles
      expect(saint.triadDashTimer).toBeGreaterThan(0); // Attack 3: Freeze pulse + Triad convergence dash + triad-blizzard
      expect(engine.director?.hazards.some((h: any) => h.kind === 'triad-blizzard')).toBe(true);
    }

    // 5. Stage 6 Final Boss: Lesní Hejkal
    {
      const engine = new GameEngine();
      engine.initRun(5, 'wanderer');
      engine.state.player!.weapons = [];
      const hejkal = engine.spawnMonster('hejkal', 120, 120, 1.0, true, false);
      hejkal.howlCooldown = 0;
      hejkal.logTossCooldown = 0;
      hejkal.rootSnareCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hejkal-roar')).toBe(true); // Attack 1: Thunder howl roar ring
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true); // Attack 2: 3-way log toss
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true); // Attack 3: Root snare traps + woodland leap
      expect(hejkal.hejkalLeapTimer).toBeGreaterThan(0);
    }

    // 6. Stage 7 Final Boss: Královská Polednice
    {
      const engine = new GameEngine();
      engine.initRun(6, 'wanderer');
      engine.state.player!.weapons = [];
      const polednice = engine.spawnMonster('kralovska_polednice', 120, 120, 1.0, true, false);
      polednice.heatPulseCooldown = 0;
      polednice.sickleCooldown = 0;
      polednice.lightningCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'heat-ring')).toBe(true); // Attack 1: Solar heat ring
      expect(engine.state.projectiles.some((p: any) => p.visual === 'solar_sickle')).toBe(true); // Attack 2: Spinning golden sickles
      expect(engine.director?.hazards.some((h: any) => h.kind === 'lightning-strike')).toBe(true); // Attack 3: Noon lightning strikes
    }

    // 7. Stage 8 Final Boss: Svatojánský Vládce Hvozdu s Pokladem
    {
      const engine = new GameEngine();
      engine.initRun(7, 'wanderer');
      engine.state.player!.weapons = [];
      const vladce = engine.spawnMonster('svatojansky_vladce', 120, 120, 1.0, true, false);
      vladce.treasurePulseCooldown = 0;
      vladce.fernBarrageCooldown = 0;
      vladce.midsummerBoltCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'heat-ring')).toBe(true); // Attack 1: Golden fern bloom ring
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fern_blossom')).toBe(true); // Attack 2: 5-way Fern Blossom barrage + root-snare
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'lightning-strike')).toBe(true); // Attack 3: Midsummer thunderbolt
    }
  });

  it('triggers Boss Phase 2 Enrage at <= 50% HP, Interactive Hazard Counterplay, and Minion-to-Boss Synergy Tether backlash', () => {
    const engine = new GameEngine();
    engine.initRun(5, 'wanderer');
    const player = engine.state.player!;
    player.weapons = [];

    // Spawn Hejkal boss and a nearby minion within 280px
    const hejkal = engine.spawnMonster('hejkal', 100, 100, 1.0, true, false);
    const baseSpeed = hejkal.speed;
    hejkal.hp = Math.floor(hejkal.maxHp * 0.45);
    hejkal.rootSnareCooldown = 0;

    const minion = engine.spawnMonster('cerny_pes', 140, 100, 1.0, false, false);
    engine.update(0.1);

    // 1. Boss Enrage triggered at <= 50% HP
    expect(hejkal.enraged).toBe(true);
    expect(hejkal.speed).toBeGreaterThan(baseSpeed);

    // 2. Minion-to-Boss Synergy Tether established
    expect(minion._tetheredBoss).toBe(hejkal);
    expect(hejkal._synergyMinionCount).toBeGreaterThanOrEqual(1);

    // 3. Interactive Hazard Counterplay: Fire/Holy attack destroys Hejkal's root-snare trap and deals backlash damage to Hejkal
    const rootSnare = engine.director?.hazards.find((h: any) => h.kind === 'root-snare');
    expect(rootSnare).toBeDefined();
    const hpBeforeTrapBreak = hejkal.hp;
    const cleared = engine.interactWithEnemyHazards(rootSnare!.x, rootSnare!.y, 60, 'fire');
    expect(cleared).toBeGreaterThanOrEqual(1);
    expect(hejkal.hp).toBeLessThan(hpBeforeTrapBreak);

    // 4. Killing the tethered minion triggers Tether Backlash on the boss
    const hpBeforeMinionDeath = hejkal.hp;
    minion.takeDamage(99999, 'physical');
    expect(minion.isDefeated).toBe(true);
    expect(hejkal.hp).toBeLessThan(hpBeforeMinionDeath);
  });

  it('Stage 2 (Level 1) Morana overhaul: spawns straw effigies, triggers backlash when effigy is cleansed, and enrages below 50% HP', () => {
    const engine = new GameEngine();
    engine.initRun(1, 'wanderer');
    engine.state.player!.weapons = [];

    const morana = engine.spawnMonster('morana', 150, 150, 1.0, true, false);
    const baseSpeed = morana.speed;

    // Trigger Morana's Attack 3 (effigy & totem ritual)
    morana.effigyCooldown = 0;
    engine.update(0.1);

    // 1. Spawns 6 straw dolls
    const strawDolls = engine.state.projectiles.filter((p: any) => p.visual === 'straw_doll');
    expect(strawDolls.length).toBe(6);

    // 2. Spawns 3 straw effigies in triangle
    const effigies = engine.director?.hazards.filter((h: any) => h.kind === 'straw-effigy');
    expect(effigies.length).toBe(3);

    // 3. Counterplay: destroying straw effigy with holy/fire inflicts backlash damage on Morana
    const hpBeforeEffigyBreak = morana.hp;
    const targetEffigy = effigies[0];
    const cleared = engine.interactWithEnemyHazards(targetEffigy.x, targetEffigy.y, 40, 'holy');
    expect(cleared).toBeGreaterThanOrEqual(1);
    expect(morana.hp).toBeLessThan(hpBeforeEffigyBreak);

    // 4. Phase 2 Enrage at <= 50% HP
    morana.hp = Math.floor(morana.maxHp * 0.48);
    morana.stunTimer = 0;
    engine.update(0.1);
    expect(morana.enraged).toBe(true);
    expect(morana.speed).toBeGreaterThan(baseSpeed);
  });

  it('Winter Half bosses (Stages 17 to 24 / Levels 16 to 23) execute at least 2 distinct tactical attacks with hazards and projectiles', () => {
    // 1. Stage 17 (Level 16): Listopadový mrazivec & Královská husa
    {
      const engine = new GameEngine();
      engine.initRun(16, 'wanderer');
      engine.state.player!.weapons = [];

      const mrazivec = engine.spawnMonster('listopadovy_mrazivec', 120, 120, 1.0, true, false);
      mrazivec.mrazivecBreathCooldown = 0;
      mrazivec.mrazivecHoarfrostCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true);

      const husa = engine.spawnMonster('kralovska_husa', 140, 140, 1.0, false, true);
      husa.husaHonkCooldown = 0;
      husa.husaDiveCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(husa.husaDiveTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'pollen')).toBe(true);
    }

    // 2. Stage 18 (Level 17): Jezdec Meluzíny & Černý myslivec
    {
      const engine = new GameEngine();
      engine.initRun(17, 'wanderer');
      engine.state.player!.weapons = [];

      const meluzina = engine.spawnMonster('jezdec_meluziny', 120, 120, 1.0, true, false);
      meluzina.meluzinaGaleCooldown = 0;
      meluzina.meluzinaLogCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);

      const myslivec = engine.spawnMonster('cerny_myslivec', 140, 140, 1.0, false, true);
      myslivec.spearCooldown = 0;
      myslivec.boarTrapCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);
    }

    // 3. Stage 19 & 20 (Levels 18 & 19): Král Mrázík & Čert s pytlem
    {
      const engine = new GameEngine();
      engine.initRun(18, 'wanderer');
      engine.state.player!.weapons = [];

      const mrazik = engine.spawnMonster('kral_mrazik', 120, 120, 1.0, true, false);
      mrazik.mrazikCrownCooldown = 0;
      mrazik.mrazikHailCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);

      const cert = engine.spawnMonster('cert_s_pytlem', 140, 140, 1.0, false, true);
      cert.sootBagCooldown = 0;
      cert.chainWhipCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'soot-cloud')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
    }

    // 4. Stage 21 (Level 20): Vládce chumelenice & Obří sněhulák
    {
      const engine = new GameEngine();
      engine.initRun(20, 'wanderer');
      engine.state.player!.weapons = [];

      const vladce = engine.spawnMonster('vladce_chumelenice', 120, 120, 1.0, true, false);
      vladce.whiteoutCooldown = 0;
      vladce.avalancheCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'triad-blizzard')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_blast')).toBe(true);

      const snehulak = engine.spawnMonster('obri_snehulak', 140, 140, 1.0, false, true);
      snehulak.snowballDashCooldown = 0;
      snehulak.freezingPuddleCooldown = 0;
      engine.update(0.1);
      expect(snehulak.snowballDashTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true);
    }

    // 5. Stage 22 (Level 21): Šeredná Perchta s nožem & Kostlivec s kosou
    {
      const engine = new GameEngine();
      engine.initRun(21, 'wanderer');
      engine.state.player!.weapons = [];

      const perchta = engine.spawnMonster('perchta_s_nozem', 120, 120, 1.0, true, false);
      perchta.perchtaHexCooldown = 0;
      perchta.perchtaNeedlesCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hex-circle')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);

      const kostlivec = engine.spawnMonster('kostlivec_s_kosou', 140, 140, 1.0, true, false);
      kostlivec.scytheCleaveCooldown = 0;
      kostlivec.boneVolleyCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
    }

    // 6. Stage 23 (Level 22): Rychtář maškar & Masopustní medvěd
    {
      const engine = new GameEngine();
      engine.initRun(22, 'wanderer');
      engine.state.player!.weapons = [];

      const rychtar = engine.spawnMonster('rychtar_masek', 120, 120, 1.0, true, false);
      rychtar.feruleStrikeCooldown = 0;
      rychtar.confettiBurstCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'straw_doll')).toBe(true);

      const medved = engine.spawnMonster('masopustni_medved', 140, 140, 1.0, false, true);
      medved.bearRoarCooldown = 0;
      medved.bearChargeCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(medved.bearChargeTimer).toBeGreaterThan(0);
    }

    // 7. Stage 24 (Level 23): Bakchus s pivním soudkem & Umrlec basista
    {
      const engine = new GameEngine();
      engine.initRun(23, 'wanderer');
      engine.state.player!.weapons = [];

      const bakchus = engine.spawnMonster('bakchus_s_pivnim_soudkem', 120, 120, 1.0, true, false);
      bakchus.kegRollCooldown = 0;
      bakchus.foamSplashCooldown = 0;
      bakchus.bacchicBurstCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'bubble')).toBe(true);

      const basista = engine.spawnMonster('umrlec_basista', 140, 140, 1.0, true, false);
      basista.bassScreechCooldown = 0;
      basista.bowSlashCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
    }
  });

  describe('Etapa 2 (Léto: Úrovně 6–11) Tactical Hierarchy & Season Canon Audit', () => {
    it('Level 6 (Červen Den): Vele-rak (2 attacks), Čert sekáč (3 attacks), Královská Polednice (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(6, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: kralovsky_vele_rak (2 attacks)
      const rak = engine.spawnMonster('kralovsky_vele_rak', 100, 100, 1.0, false, true);
      rak.chargeCooldown = 0;
      rak.waterJetCooldown = 0;
      engine.update(0.1);
      expect(rak.speedBurstTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_drop')).toBe(true);

      // Midboss: cert_sekac (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const sekac = engine.spawnMonster('cert_sekac', 105, 105, 1.0, true, false);
      sekac.scytheCleaveCooldown = 0;
      sekac.fireTrailCooldown = 0;
      sekac.pitchforkVolleyCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'fire-patch')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(sekac.hellDashTimer).toBeGreaterThan(0);

      // Finalboss: kralovska_polednice (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const polednice = engine.spawnMonster('kralovska_polednice', 120, 120, 1.0, true, false);
      polednice.heatPulseCooldown = 0;
      polednice.sickleCooldown = 0;
      polednice.lightningCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'heat-ring')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'lightning-strike')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'solar_sickle')).toBe(true);

      // Enrage: drops below 50% HP
      polednice.hp = polednice.maxHp * 0.4;
      engine.update(0.1);
      expect(polednice.enraged).toBe(true);
    });

    it('Level 7 (Červen Noc): Rusalka (2 attacks), Ohnivý sudlička (3 attacks), Svatojánský Vládce (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(7, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: rusalka (2 attacks)
      const rusalka = engine.spawnMonster('rusalka', 100, 100, 1.0, false, true);
      rusalka.waterSongCooldown = 0;
      rusalka.drownLungeCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'whirlpool')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'water-jar-trap')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_wave')).toBe(true);

      // Midboss: ohnivy_sudlicka (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const sudlicka = engine.spawnMonster('ohnivy_sudlicka', 110, 110, 1.0, true, false);
      sudlicka.sudliceDashCooldown = 0;
      sudlicka.emberFanCooldown = 0;
      sudlicka.sudliceBurstCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'fire-patch')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'hell_spark')).toBe(true);
      expect(sudlicka.sudliceDashTimer).toBeGreaterThan(0);

      // Finalboss: svatojansky_vladce (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const vladce = engine.spawnMonster('svatojansky_vladce', 130, 130, 1.0, true, false);
      vladce.treasurePulseCooldown = 0;
      vladce.fernBarrageCooldown = 0;
      vladce.midsummerBoltCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'heat-ring')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'lightning-strike')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fern_blossom')).toBe(true);

      // Enrage
      vladce.hp = vladce.maxHp * 0.45;
      engine.update(0.1);
      expect(vladce.enraged).toBe(true);
    });

    it('Level 8 (Červenec Den): Křeček Obilník (2 attacks), Žitná matka (3 attacks), Pouťový Hromotluk (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(8, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: krecek_obilnik (2 attacks)
      const krecek = engine.spawnMonster('krecek_obilnik', 100, 100, 1.0, false, true);
      krecek.burrowDashCooldown = 0;
      krecek.grainVolleyCooldown = 0;
      engine.update(0.1);
      expect(krecek.burrowDashTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'pollen')).toBe(true);

      // Midboss: zitna_matka (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const matka = engine.spawnMonster('zitna_matka', 110, 110, 1.0, true, false);
      matka.sickleFanCooldown = 0;
      matka.chaffWhirlCooldown = 0;
      matka.snopGaleCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'solar_sickle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'heat-ring')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'pollen')).toBe(true);

      // Finalboss: hromotluk_marketa (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const hromotluk = engine.spawnMonster('hromotluk_marketa', 130, 130, 1.0, true, false);
      hromotluk.targetSalvoCooldown = 0;
      hromotluk.malletQuakeCooldown = 0;
      hromotluk.fairChargeCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(hromotluk.fairChargeTimer).toBeGreaterThan(0);

      // Enrage
      hromotluk.hp = hromotluk.maxHp * 0.45;
      engine.update(0.1);
      expect(hromotluk.enraged).toBe(true);
    });

    it('Level 9 (Červenec Noc): Bílá paní (2 attacks), Bezhlavý rytíř (3 attacks), Drak (3 attacks + Enrage) & Hromotluk in pool', () => {
      const engine = new GameEngine();
      engine.initRun(9, 'wanderer');
      engine.state.player!.weapons = [];

      // Verify hromotluk integrated in Level 9 spawn pools
      const lvl9 = GAME_LEVELS[9];
      expect(lvl9?.spawnPools?.night).toContain('hromotluk');
      expect(lvl9?.spawnPools?.midnight).toContain('hromotluk');

      // Miniboss: bila_pani (2 attacks)
      const bilaPani = engine.spawnMonster('bila_pani', 100, 100, 1.0, false, true);
      bilaPani.wailCooldown = 0;
      bilaPani.bilaMistCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);

      // Midboss: bezhlavy_rytir (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const rytir = engine.spawnMonster('bezhlavy_rytir', 110, 110, 1.0, true, false);
      rytir.knightChargeCooldown = 0;
      rytir.headTossCooldown = 0;
      engine.update(0.1);
      expect(rytir.knightChargeTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hex-circle')).toBe(true);

      // Finalboss: drak (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const drak = engine.spawnMonster('drak', 130, 130, 1.0, true, false);
      drak.dragonFireCooldown = 0;
      drak.dragonFrostCooldown = 0;
      drak.dragonGaleCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);

      // Enrage
      drak.hp = drak.maxHp * 0.45;
      engine.update(0.1);
      expect(drak.enraged).toBe(true);
    });

    it('Level 10 (Srpen Den): Královský čmelák (2 attacks), Zlatohlávek Žrout (3 attacks), Dožínkový chasník (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(10, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: kralovsky_cmelak (2 attacks)
      const cmelak = engine.spawnMonster('kralovsky_cmelak', 100, 100, 1.0, false, true);
      cmelak.cmelakDiveCooldown = 0;
      cmelak.cmelakPollenCooldown = 0;
      engine.update(0.1);
      expect(cmelak.cmelakDiveTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);

      // Midboss: zlatohlavek_zrout (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const zrout = engine.spawnMonster('zlatohlavek_zrout', 110, 110, 1.0, true, false);
      zrout.zroutChargeCooldown = 0;
      zrout.zroutSplatCooldown = 0;
      zrout.zroutCiderCooldown = 0;
      engine.update(0.1);
      expect(zrout.zroutChargeTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);

      // Finalboss: dozinkovy_chasnik (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const chasnik = engine.spawnMonster('dozinkovy_chasnik', 130, 130, 1.0, true, false);
      chasnik.chasnikWreathCooldown = 0;
      chasnik.chasnikFlailCooldown = 0;
      chasnik.chasnikSprintCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);
      expect(chasnik.chasnikSprintTimer).toBeGreaterThan(0);

      // Enrage
      chasnik.hp = chasnik.maxHp * 0.45;
      engine.update(0.1);
      expect(chasnik.enraged).toBe(true);
    });

    it('Level 11 (Srpen Noc): Netopýr Ušatec (2 attacks), Noční můra (3 attacks), Výr velký (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(11, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: netopyr_usatec (2 attacks)
      const bat = engine.spawnMonster('netopyr_usatec', 100, 100, 1.0, false, true);
      bat.screechCooldown = 0;
      engine.update(0.1);
      expect(bat.batSwoopTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);

      // Midboss: nocni_mura (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const mura = engine.spawnMonster('nocni_mura', 110, 110, 1.0, true, false);
      mura.muraDustCooldown = 0;
      mura.muraBoltCooldown = 0;
      mura.muraFlutterCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true);
      expect(mura.muraFlutterTimer).toBeGreaterThan(0);

      // Finalboss: vyr_velky (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const vyr = engine.spawnMonster('vyr_velky', 130, 130, 1.0, true, false);
      vyr.vyrVortexCooldown = 0;
      vyr.vyrHootCooldown = 0;
      vyr.vyrSwoopCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);
      expect(vyr.vyrSwoopTimer).toBeGreaterThan(0);

      // Enrage
      vyr.hp = vyr.maxHp * 0.45;
      engine.update(0.1);
      expect(vyr.enraged).toBe(true);
    });

    it('Level 12 (Září Den): Královský sršeň (2 attacks), Povidlový čert (3 attacks), Posvícenský hospodář (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(12, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: kralovsky_srsen (2 attacks)
      const srsen = engine.spawnMonster('kralovsky_srsen', 100, 100, 1.0, false, true);
      srsen.srsenDiveCooldown = 0;
      srsen.srsenPlumCooldown = 0;
      engine.update(0.1);
      expect(srsen.srsenDiveTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);

      // Midboss: povidlovy_cert (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const cert = engine.spawnMonster('povidlovy_cert', 110, 110, 1.0, true, false);
      cert.povidlaSplashCooldown = 0;
      cert.mechackaSlamCooldown = 0;
      cert.certSootRushCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(cert.mechackaRushTimer > 0 || cert.certSootRushTimer > 0).toBe(true);

      // Finalboss: posvicensky_hospodar (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const hosp = engine.spawnMonster('posvicensky_hospodar', 130, 130, 1.0, true, false);
      hosp.kolacVolleyCooldown = 0;
      hosp.hospodarSlamCooldown = 0;
      hosp.hospodarSprintCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(hosp.hospodarSprintTimer).toBeGreaterThan(0);

      // Enrage
      hosp.hp = hosp.maxHp * 0.45;
      engine.update(0.1);
      expect(hosp.enraged).toBe(true);
    });

    it('Level 13 (Září Noc): Svatováclavský strážce (2 attacks), Chmelový skřítek (3 attacks), Kvílící Meluzína (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(13, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: svatovaclavsky_strazce (2 attacks)
      const strazce = engine.spawnMonster('svatovaclavsky_strazce', 100, 100, 1.0, false, true);
      strazce.strazceSwordCooldown = 0;
      strazce.strazceBannerCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'witch_fireball')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);

      // Midboss: chmelovy_skritek (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const chmel = engine.spawnMonster('chmelovy_skritek', 110, 110, 1.0, true, false);
      chmel.chmelPollenCooldown = 0;
      chmel.chmelSnareCooldown = 0;
      chmel.chmelLeapCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'pollen')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);
      expect(chmel.chmelLeapTimer).toBeGreaterThan(0);

      // Finalboss: kvilici_meluzina (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const meluzina = engine.spawnMonster('kvilici_meluzina', 130, 130, 1.0, true, false);
      meluzina.meluzinaBladeCooldown = 0;
      meluzina.meluzinaVortexCooldown = 0;
      meluzina.meluzinaGustCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'crow-vortex')).toBe(true);
      expect(meluzina.meluzinaGustTimer).toBeGreaterThan(0);

      // Enrage
      meluzina.hp = meluzina.maxHp * 0.45;
      engine.update(0.1);
      expect(meluzina.enraged).toBe(true);
    });

    it('Level 14 (Říjen Den): Královský havran (2 attacks), Hastrman podzimní (3 attacks), Drak Větrník (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(14, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: kralovsky_havran (2 attacks)
      const havran = engine.spawnMonster('kralovsky_havran', 100, 100, 1.0, false, true);
      havran.havranFeatherCooldown = 0;
      havran.havranDiveCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'crow_feather')).toBe(true);
      expect(havran.havranDiveTimer).toBeGreaterThan(0);

      // Midboss: hastrman_podzimni (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const hast = engine.spawnMonster('hastrman_podzimni', 110, 110, 1.0, true, false);
      hast.hastrmanMudCooldown = 0;
      hast.hastrmanWhirlCooldown = 0;
      hast.hastrmanReedCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'mud_ball')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(hast.hastrmanReedTimer).toBeGreaterThan(0);

      // Finalboss: drak_vetrnik (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const drak = engine.spawnMonster('drak_vetrnik', 130, 130, 1.0, true, false);
      drak.drakStreamerCooldown = 0;
      drak.drakWhirlCooldown = 0;
      drak.drakSwoopCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'crow-vortex')).toBe(true);
      expect(drak.drakSwoopTimer).toBeGreaterThan(0);

      // Enrage
      drak.hp = drak.maxHp * 0.45;
      engine.update(0.1);
      expect(drak.enraged).toBe(true);
    });

    it('Level 15 (Říjen Noc): Dušičková bludička (2 attacks), Čert rybníkář (3 attacks), Veleštika (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(15, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: dusickova_bludicka (2 attacks)
      const bludicka = engine.spawnMonster('dusickova_bludicka', 100, 100, 1.0, false, true);
      bludicka.bludickaOrbCooldown = 0;
      bludicka.bludickaFlickerCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'will_o_wisp')).toBe(true);
      expect(bludicka.bludickaFlickerTimer).toBeGreaterThan(0);

      // Midboss: cert_rybnikar (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const rybnikar = engine.spawnMonster('cert_rybnikar', 110, 110, 1.0, true, false);
      rybnikar.certCoalCooldown = 0;
      rybnikar.certNetCooldown = 0;
      rybnikar.certTridentCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'coal')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);

      // Finalboss: vele_stika (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const stika = engine.spawnMonster('vele_stika', 130, 130, 1.0, true, false);
      stika.stikaWaveCooldown = 0;
      stika.stikaWhirlCooldown = 0;
      stika.stikaSurgeCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_blast')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(stika.stikaSurgeTimer).toBeGreaterThan(0);

      // Enrage
      stika.hp = stika.maxHp * 0.45;
      engine.update(0.1);
      expect(stika.enraged).toBe(true);
    });

    it('Level 16 (Listopad Den): Královská husa (2 attacks), Martinský jezdec (3 attacks), Listopadový mrazivec (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(16, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: kralovska_husa (2 attacks)
      const husa = engine.spawnMonster('kralovska_husa', 100, 100, 1.0, false, true);
      husa.husaHonkCooldown = 0;
      husa.husaDiveCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(husa.husaDiveTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'pollen')).toBe(true);

      // Midboss: martinsky_jezdec (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const jezdec = engine.spawnMonster('martinsky_jezdec', 110, 110, 1.0, true, false);
      jezdec.jezdecLanceCooldown = 0;
      jezdec.jezdecHoofCooldown = 0;
      jezdec.jezdecFlurryCooldown = 0;
      engine.update(0.1);
      expect(jezdec.jezdecLanceTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);

      // Finalboss: listopadovy_mrazivec (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const mrazivec = engine.spawnMonster('listopadovy_mrazivec', 130, 130, 1.0, true, false);
      mrazivec.mrazivecBreathCooldown = 0;
      mrazivec.mrazivecHoarfrostCooldown = 0;
      mrazivec.mrazivecGaleCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true);
      expect(mrazivec.mrazivecGaleTimer).toBeGreaterThan(0);

      // Enrage
      mrazivec.hp = mrazivec.maxHp * 0.45;
      engine.update(0.1);
      expect(mrazivec.enraged).toBe(true);
    });

    it('Level 17 (Listopad Noc): Mlžný přízrak (2 attacks), Černý myslivec (3 attacks), Zuřivý kanec Kňour (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(17, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: mlzny_prizrak (2 attacks)
      const prizrak = engine.spawnMonster('mlzny_prizrak', 100, 100, 1.0, false, true);
      prizrak.prizrakFogCooldown = 0;
      prizrak.prizrakPhaseCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'will_o_wisp')).toBe(true);
      expect(prizrak.prizrakPhaseTimer).toBeGreaterThan(0);

      // Midboss: cerny_myslivec (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const myslivec = engine.spawnMonster('cerny_myslivec', 110, 110, 1.0, true, false);
      myslivec.spearCooldown = 0;
      myslivec.boarTrapCooldown = 0;
      myslivec.myslivecHornCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);

      // Finalboss: kanec_knour (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const knour = engine.spawnMonster('kanec_knour', 130, 130, 1.0, true, false);
      knour.knourChargeCooldown = 0;
      knour.knourStompCooldown = 0;
      knour.knourTuskFlingCooldown = 0;
      engine.update(0.1);
      expect(knour.knourChargeTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);

      // Enrage
      knour.hp = knour.maxHp * 0.45;
      engine.update(0.1);
      expect(knour.enraged).toBe(true);
    });
  });

  describe('Etapa 4 (Zima: Úrovně 18–23) Tactical Hierarchy & Season Canon Audit', () => {
    it('Level 18 (Prosinec Den): Čert s pytlem (2 attacks), Maškarní kozel (3 attacks), Mikulášský čert Richter (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(18, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: cert_s_pytlem (2 attacks)
      const cert = engine.spawnMonster('cert_s_pytlem', 100, 100, 1.0, false, true);
      cert.sootBagCooldown = 0;
      cert.chainWhipCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'soot-cloud')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);

      // Midboss: maskarni_kozel (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const kozel = engine.spawnMonster('maskarni_kozel', 110, 110, 1.0, true, false);
      kozel.kozelChargeCooldown = 0;
      kozel.kozelBellCooldown = 0;
      kozel.kozelBuckCooldown = 0;
      engine.update(0.1);
      expect(kozel.kozelChargeTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'horseshoe')).toBe(true);

      // Finalboss: mikulassky_cert (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const richter = engine.spawnMonster('mikulassky_cert', 130, 130, 1.0, true, false);
      richter.richterChainCooldown = 0;
      richter.richterFissureCooldown = 0;
      richter.richterRushCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'fire_wreath')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(richter.richterRushTimer).toBeGreaterThan(0);

      // Enrage
      richter.hp = richter.maxHp * 0.45;
      engine.update(0.1);
      expect(richter.enraged).toBe(true);
    });

    it('Level 19 (Prosinec Noc): Mrazivá sova (2 attacks), Jezdec Meluzíny (3 attacks), Král Mrázík (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(19, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: mraziva_sova (2 attacks)
      const sova = engine.spawnMonster('mraziva_sova', 100, 100, 1.0, false, true);
      sova.sovaFeatherCooldown = 0;
      sova.sovaSwoopCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'crow_feather')).toBe(true);
      expect(sova.sovaSwoopTimer).toBeGreaterThan(0);

      // Midboss: jezdec_meluziny (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const meluzina = engine.spawnMonster('jezdec_meluziny', 110, 110, 1.0, true, false);
      meluzina.meluzinaGaleCooldown = 0;
      meluzina.meluzinaLogCooldown = 0;
      meluzina.meluzinaVortexCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'crow-vortex')).toBe(true);

      // Finalboss: kral_mrazik (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const mrazik = engine.spawnMonster('kral_mrazik', 130, 130, 1.0, true, false);
      mrazik.mrazikCrownCooldown = 0;
      mrazik.mrazikHailCooldown = 0;
      mrazik.mrazikSceptreCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hail-circle')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_blast')).toBe(true);

      // Enrage
      mrazik.hp = mrazik.maxHp * 0.45;
      engine.update(0.1);
      expect(mrazik.enraged).toBe(true);
    });

    it('Level 20 (Leden Den): Obří sněhulák (2 attacks), Tříkrálový jezdec (3 attacks), Vládce chumelenice (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(20, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: obri_snehulak (2 attacks)
      const snehulak = engine.spawnMonster('obri_snehulak', 100, 100, 1.0, false, true);
      snehulak.snowballDashCooldown = 0;
      snehulak.freezingPuddleCooldown = 0;
      engine.update(0.1);
      expect(snehulak.snowballDashTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true);

      // Midboss: trikralovy_jezdec (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const jezdec = engine.spawnMonster('trikralovy_jezdec', 110, 110, 1.0, true, false);
      jezdec.jezdecStarCooldown = 0;
      jezdec.jezdecIncenseCooldown = 0;
      jezdec.jezdecChargeCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'will_o_wisp')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'soot-cloud')).toBe(true);
      expect(jezdec.jezdecChargeTimer).toBeGreaterThan(0);

      // Finalboss: vladce_chumelenice (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const vladce = engine.spawnMonster('vladce_chumelenice', 130, 130, 1.0, true, false);
      vladce.whiteoutCooldown = 0;
      vladce.avalancheCooldown = 0;
      vladce.chumelGaleCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'triad-blizzard')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'water_blast')).toBe(true);
      expect(vladce.chumelGaleTimer).toBeGreaterThan(0);

      // Enrage
      vladce.hp = vladce.maxHp * 0.45;
      engine.update(0.1);
      expect(vladce.enraged).toBe(true);
    });

    it('Level 21 (Leden Noc): Ledová klekánice (2 attacks), Kostlivec s kosou (3 attacks), Perchta s nožem (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(21, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: ledova_klekanice (2 attacks)
      const klekanice = engine.spawnMonster('ledova_klekanice', 100, 100, 1.0, false, true);
      klekanice.klekaniceBellCooldown = 0;
      klekanice.klekaniceFadeCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(klekanice.klekaniceFadeTimer).toBeGreaterThan(0);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'will_o_wisp')).toBe(true);

      // Midboss: kostlivec_s_kosou (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const kostlivec = engine.spawnMonster('kostlivec_s_kosou', 110, 110, 1.0, true, false);
      kostlivec.scytheCleaveCooldown = 0;
      kostlivec.boneVolleyCooldown = 0;
      kostlivec.graveFrostCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'blizzard-zone')).toBe(true);

      // Finalboss: perchta_s_nozem (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const perchta = engine.spawnMonster('perchta_s_nozem', 130, 130, 1.0, true, false);
      perchta.perchtaLungeCooldown = 0;
      perchta.perchtaHexCooldown = 0;
      perchta.perchtaNeedlesCooldown = 0;
      engine.update(0.1);
      expect(perchta.perchtaLungeTimer).toBeGreaterThan(0);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'hex-circle')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'icicle')).toBe(true);

      // Enrage
      perchta.hp = perchta.maxHp * 0.45;
      engine.update(0.1);
      expect(perchta.enraged).toBe(true);
    });

    it('Level 22 (Únor Den): Masopustní medvěd (2 attacks), Obří slaměník (3 attacks), Rychtář maškar (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(22, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: masopustni_medved (2 attacks)
      const medved = engine.spawnMonster('masopustni_medved', 100, 100, 1.0, false, true);
      medved.bearRoarCooldown = 0;
      medved.bearChargeCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(medved.bearChargeTimer).toBeGreaterThan(0);

      // Midboss: slamennik_obr (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const slamennik = engine.spawnMonster('slamennik_obr', 110, 110, 1.0, true, false);
      slamennik.slamennikFlailCooldown = 0;
      slamennik.slamennikChaffCooldown = 0;
      slamennik.slamennikStompCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);

      // Finalboss: rychtar_masek (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const rychtar = engine.spawnMonster('rychtar_masek', 130, 130, 1.0, true, false);
      rychtar.feruleStrikeCooldown = 0;
      rychtar.confettiBurstCooldown = 0;
      rychtar.rychtarWaltzCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'straw_doll')).toBe(true);
      expect(rychtar.rychtarWaltzTimer).toBeGreaterThan(0);

      // Enrage
      rychtar.hp = rychtar.maxHp * 0.45;
      engine.update(0.1);
      expect(rychtar.enraged).toBe(true);
    });

    it('Level 23 (Únor Noc): Noční kobold (2 attacks), Umrlec basista (3 attacks), Bakchus s pivním soudkem (3 attacks + Enrage)', () => {
      const engine = new GameEngine();
      engine.initRun(23, 'wanderer');
      engine.state.player!.weapons = [];

      // Miniboss: nocni_kobold (2 attacks)
      const kobold = engine.spawnMonster('nocni_kobold', 100, 100, 1.0, false, true);
      kobold.koboldSackCooldown = 0;
      kobold.koboldSneakCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(kobold.koboldSneakTimer).toBeGreaterThan(0);

      // Midboss: umrlec_basista (3 attacks)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const basista = engine.spawnMonster('umrlec_basista', 110, 110, 1.0, true, false);
      basista.bassScreechCooldown = 0;
      basista.bowSlashCooldown = 0;
      basista.bassStringSnareCooldown = 0;
      engine.update(0.1);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'ground-shockwave')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'wind_blade')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'root-snare')).toBe(true);

      // Finalboss: bakchus_s_pivnim_soudkem (3 attacks + Enrage)
      engine.state.projectiles = [];
      if (engine.director) engine.director.hazards = [];
      const bakchus = engine.spawnMonster('bakchus_s_pivnim_soudkem', 130, 130, 1.0, true, false);
      bakchus.kegRollCooldown = 0;
      bakchus.foamSplashCooldown = 0;
      bakchus.bacchicBurstCooldown = 0;
      engine.update(0.1);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'log')).toBe(true);
      expect(engine.director?.hazards.some((h: any) => h.kind === 'mud-patch')).toBe(true);
      expect(engine.state.projectiles.some((p: any) => p.visual === 'bubble')).toBe(true);

      // Enrage
      bakchus.hp = bakchus.maxHp * 0.45;
      engine.update(0.1);
      expect(bakchus.enraged).toBe(true);
    });
  });
});


