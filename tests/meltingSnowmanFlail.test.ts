import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { Lada } from '../src/render/ladaRenderer';
import { renderProjectilesAndSlashes } from '../src/render/renderProjectiles';

function createMockCtx() {
  return {
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    arc() {},
    ellipse() {},
    rect() {},
    strokeRect() {},
    fillRect() {},
    stroke() {},
    fill() {},
    fillText() {},
    strokeText() {},
    measureText: () => ({ width: 20 }),
    setLineDash() {},
    lineCap: 'round',
    lineJoin: 'round',
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('melting snowman sprite and wooden flail combat VFX', () => {
  it('resolves the thaw-horde ID to the registered melting snowman', () => {
    const engine = new GameEngine();
    const enemy = engine.createHeadlessEnemy('tajici_snehulak', 10, 20);

    expect(enemy.id).toBe('tajici_snehulak');
    expect(enemy.hp).toBe(280);
    expect(enemy.method).toBe('drawMeltingSnowman');
    expect(typeof (Lada as any).drawMeltingSnowman).toBe('function');

    let depth = 0;
    let bezierCount = 0;
    let linearGradients = 0;
    const rotationsPhase0: number[] = [];
    const rotationsPhaseQuarter: number[] = [];
    const moveToPointsPhase0: Array<[number, number]> = [];
    const moveToPointsPhaseQuarter: Array<[number, number]> = [];

    const createTrackingCtx = (rotations: number[], movePoints: Array<[number, number]>) => ({
      ...createMockCtx(),
      save() { depth++; },
      restore() { depth--; },
      rotate(angle: number) { rotations.push(angle); },
      moveTo(x: number, y: number) { movePoints.push([x, y]); },
      bezierCurveTo() { bezierCount++; },
      createLinearGradient() {
        linearGradients++;
        return { addColorStop() {} };
      },
      createRadialGradient() {
        return { addColorStop() {} };
      },
    });

    (Lada as any).drawMeltingSnowman(createTrackingCtx(rotationsPhase0, moveToPointsPhase0), 100, 100, 0.0, 1, false, enemy);
    expect(depth).toBe(0);
    expect(bezierCount).toBeGreaterThan(80);
    expect(linearGradients).toBeGreaterThanOrEqual(8);

    (Lada as any).drawMeltingSnowman(createTrackingCtx(rotationsPhaseQuarter, moveToPointsPhaseQuarter), 100, 100, 0.13, 1, false, enemy);
    expect(depth).toBe(0);
    // Body waddle tilt, back leg swing, arm swing, scarf wave, head & hat wobble all change across the walk cycle
    expect(rotationsPhase0).not.toEqual(rotationsPhaseQuarter);
    // Front leg & puddle coordinates shift during the step
    expect(moveToPointsPhase0).not.toEqual(moveToPointsPhaseQuarter);
  });

  it('renders the flail sweep through the arena slash renderer', () => {
    const ctx = createMockCtx();
    const result = renderProjectilesAndSlashes(
      ctx,
      [],
      [{
        x: 100,
        y: 100,
        angle: 0,
        reach: 150,
        arc: Math.PI * 1.75,
        life: 0.24,
        maxLife: 0.36,
        time: 0.12,
        style: 'flail',
        weaponId: 'dreveny_cep',
        visualOnly: true,
        dead: false,
      }],
      { x: 0, y: 0, width: 200, height: 200, viewLeft: 0, viewTop: 0, viewRight: 200, viewBottom: 200 },
      1
    );

    expect(result.renderedSlashes).toBe(1);
  });

  it('only auto-targets after the stance is built and loses the stance on movement', () => {
    const engine = new GameEngine();
    engine.initRun({ selectedHunter: 'ponocny' });
    const player = engine.state.player;
    player.x = 500;
    player.y = 500;
    player.lastDx = 1;
    player.lastDy = 0;
    engine.upgradeWeapon('dreveny_cep');
    const flailWeapon = player.weapons.find((w: any) => w.id === 'dreveny_cep');
    engine.spawnMonster('drevorubec', 440, 500);

    let capturedImpact: any = null;
    const origSpawnArea = player.spawnAreaImpact.bind(player);
    player.spawnAreaImpact = (impact: any) => {
      capturedImpact = impact;
      return origSpawnArea(impact);
    };

    engine.state.keys = {};
    flailWeapon.cd = 0;
    engine.update(0.05);
    expect(capturedImpact.x).toBeGreaterThan(player.x);

    flailWeapon.cd = 10;
    player.flailStanceTimer = 1.5;
    engine.state.keys = { KeyD: true };
    engine.update(0.05);
    expect(player.flailStanceTimer).toBe(0);
  });

  it('grants dreveny_cep its stationary stance bonuses', () => {
    const engine = new GameEngine();
    engine.initRun({ selectedHunter: 'ponocny' });
    const player = engine.state.player;
    player.x = 500;
    player.y = 500;

    // Equip dreveny_cep at level 1
    engine.upgradeWeapon('dreveny_cep');
    const flailWeapon = player.weapons.find((w: any) => w.id === 'dreveny_cep');
    expect(flailWeapon).toBeDefined();

    // Stand still for 1.5s to build full Mlatcův postoj (flailStanceTimer)
    engine.state.keys = {};
    for (let i = 0; i < 15; i++) {
      // Prevent auto-fire during stance buildup so we can inspect the exact shot
      flailWeapon.cd = 10;
      engine.update(0.1);
    }
    expect(player.flailStanceTimer).toBeGreaterThanOrEqual(1.5);

    // Place an enemy behind the hunter (at x = 440, y = 500) while hunter last faced +X
    player.lastDx = 1;
    player.lastDy = 0;
    const enemy = engine.spawnMonster('drevorubec', 440, 500);
    enemy.hp = 500;
    enemy.maxHp = 500;
    const initialHp = enemy.hp;

    // Force 100% crit via high luck to verify critical damage & critical knockback against non-crit
    player.luck = 1000;
    player._firingWeapon = flailWeapon;
    let capturedImpact: any = null;
    const origSpawnArea = player.spawnAreaImpact.bind(player);
    player.spawnAreaImpact = (impact: any) => {
      capturedImpact = impact;
      return origSpawnArea(impact);
    };

    flailWeapon.cd = 0;
    engine.update(0.05);

    expect(capturedImpact).not.toBeNull();
    // Auto-targeted the enemy behind the hunter (x < 500) instead of blindly hitting +X
    expect(capturedImpact.x).toBeLessThan(player.x);
    expect(capturedImpact.stanceRatio).toBeCloseTo(1, 2);
    expect(capturedImpact.critChanceBonus).toBeCloseTo(0.20, 2);
    expect(capturedImpact.critDamageMult).toBeCloseTo(2.5, 2);
    expect(capturedImpact.critKnockbackMult).toBeCloseTo(2.2, 2);

    // Enemy took a critical hit and was knocked AWAY from the hunter (negative kbx).
    // Drevorubec's physical resistance remains part of this integration check.
    expect(enemy.hp).toBeLessThanOrEqual(initialHp - 40);
    expect(enemy.kbx).toBeLessThan(-400);
    // Stationary stance also shortened weapon cooldown below baseCd (1.45s)
    expect(flailWeapon.cd).toBeLessThan(1.35);
  });

  it('scales critical knockback and critical damage in enemy.takeDamage when crit options are provided', () => {
    const engine = new GameEngine();
    engine.initRun({ selectedHunter: 'tulak' });

    const normalTarget = engine.spawnMonster('hromotluk', 300, 300);
    const critTarget = engine.spawnMonster('hromotluk', 300, 400);
    normalTarget.hp = 2000;
    normalTarget.maxHp = 2000;
    critTarget.hp = 2000;
    critTarget.maxHp = 2000;

    engine.state.player.luck = 0;
    normalTarget.takeDamage(50, 'physical', 300, 0, {
      critChanceBonus: 0,
      critDamageMult: 3.0,
      critKnockbackMult: 2.8,
      source: 'dreveny_cep',
    });

    critTarget.takeDamage(50, 'physical', 300, 0, {
      isCrit: true,
      critDamageMult: 3.0,
      critKnockbackMult: 2.8,
      source: 'dreveny_cep',
    });

    const normalDmgDealt = 2000 - normalTarget.hp;
    const critDmgDealt = 2000 - critTarget.hp;
    expect(critDmgDealt).toBeGreaterThanOrEqual(normalDmgDealt * 2.8);
    expect(critTarget.kbx).toBeGreaterThan(normalTarget.kbx * 2.8);
  });
});

