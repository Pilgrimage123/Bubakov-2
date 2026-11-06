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
});


