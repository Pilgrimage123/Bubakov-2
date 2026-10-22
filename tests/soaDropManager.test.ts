import { describe, it, expect, beforeEach } from 'vitest';
import {
  SoADropManager,
  DropBank,
  MAX_ACTIVE_DROPS,
  HEAVY_ANCHOR_MAGNET_MOBILITY,
  POUCH_SWEEP_RADIUS,
  CONSOLIDATION_BONUS,
} from '../src/game/soaDropManager';
import {
  computeVulnerabilityScore,
  getDropPacingPhase,
  CampingDetector,
  sampleAnnulusPosition,
} from '../src/game/directorDrops';
import { OffScreenIndicatorController } from '../src/render/offScreenIndicators';

describe('SoADropManager (Struct-of-Arrays High-Performance Drop System)', () => {
  let manager: SoADropManager;

  beforeEach(() => {
    manager = new SoADropManager();
  });

  it('enforces a strict hard cap of MAX_ACTIVE_DROPS (40) and banks overflow into DropBank', () => {
    expect(MAX_ACTIVE_DROPS).toBe(40);

    for (let i = 0; i < 40; i++) {
      const drop = manager.spawn({
        type: 'coin',
        x: i * 200, // spread across different cells
        y: 0,
        value: 1,
      });
      expect(drop).not.toBeNull();
      expect(drop?.dead).toBe(false);
    }

    expect(manager.count).toBe(40);
    expect(manager.dropBank.coins).toBe(0);

    // 41st drop should NOT be spawned into loose world; it must accumulate into DropBank
    const overflowDrop = manager.spawn({
      type: 'coin',
      x: 9999,
      y: 9999,
      value: 5,
    });
    expect(overflowDrop).toBeNull();
    expect(manager.count).toBe(40);
    expect(manager.dropBank.coins).toBe(5);
  });

  it('performs O(1) swap-back removal while keeping flyweight references synchronized', () => {
    manager.spawn({ type: 'coin', x: 100, y: 100, value: 1 });
    manager.spawn({ type: 'gingerbread', x: 300, y: 300, value: 6, size: 'large' });
    manager.spawn({ type: 'potion', x: 500, y: 500, value: 30 });

    expect(manager.count).toBe(3);
    expect(manager.flyweights[0].type).toBe('coin');
    expect(manager.flyweights[1].type).toBe('gingerbread');
    expect(manager.flyweights[2].type).toBe('potion');

    // Remove middle drop (index 1) via swap-back: slot 2 (potion) moves to slot 1
    manager.removeAt(1);

    expect(manager.count).toBe(2);
    expect(manager.flyweights[0].type).toBe('coin');
    expect(manager.flyweights[1].type).toBe('potion');
    expect(manager.flyweights[1].x).toBe(500);
    expect(manager.flyweights[2].dead).toBe(true);
  });

  it('consolidates three existing minor drops and consumes the incoming drop', () => {
    manager.spawn({ type: 'gingerbread', x: 20, y: 20, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 40, y: 40, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 60, y: 60, value: 2 });

    const incoming = manager.spawn({ type: 'gingerbread', x: 80, y: 80, value: 2 });

    expect(incoming).toBeNull();
    expect(manager.count).toBe(1);
    expect(manager.values[0]).toBe(7);
    expect(manager.flyweights[0].size).toBe('large');
    expect(manager.flyweights[1].dead).toBe(true);
  });

  it('retains the consolidated drop when the retained record is last and companions precede it', () => {
    manager.spawn({ type: 'coin', x: 400, y: 400, value: 1 });
    manager.spawn({ type: 'gingerbread', x: 20, y: 20, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 40, y: 40, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 60, y: 60, value: 2 });

    const incoming = manager.spawn({ type: 'gingerbread', x: 80, y: 80, value: 2 });

    expect(incoming).toBeNull();
    expect(manager.count).toBe(2);
    const combinedIndex = manager.itemTypes[0] === 2 && manager.values[0] === 7 ? 0 : 1;
    expect(manager.itemTypes[combinedIndex]).toBe(2);
    expect(manager.values[combinedIndex]).toBe(7);
    expect(manager.flyweights[combinedIndex].size).toBe('large');
    expect(manager.itemTypes[1 - combinedIndex]).toBe(1);
    expect(manager.values[1 - combinedIndex]).toBe(1);
  });

  it('keeps the consolidated drop when one of the selected records is the last slot', () => {
    manager.spawn({ type: 'coin', x: 400, y: 400, value: 1 });
    manager.spawn({ type: 'gingerbread', x: 20, y: 20, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 40, y: 40, value: 2 });
    manager.spawn({ type: 'gingerbread', x: 60, y: 60, value: 2 });

    const incoming = manager.spawn({ type: 'gingerbread', x: 80, y: 80, value: 2 });

    expect(incoming).toBeNull();
    expect(manager.count).toBe(2);
    const combinedIndex = manager.itemTypes[0] === 2 && manager.values[0] === 7 ? 0 : 1;
    expect(manager.itemTypes[combinedIndex]).toBe(2);
    expect(manager.values[combinedIndex]).toBe(7);
    expect(manager.flyweights[combinedIndex].size).toBe('large');
    expect(manager.itemTypes[1 - combinedIndex]).toBe(1);
    expect(manager.values[1 - combinedIndex]).toBe(1);
  });

  it('enforces branchless 5% magnet mobility for Heavy Anchors vs standard drops', () => {
    manager.spawn({ type: 'coin', x: 100, y: 0, value: 1 });
    manager.spawn({ type: 'big_pouch', x: 100, y: 0, value: 35, isHeavyAnchor: true });

    expect(manager.magnetMobility[0]).toBe(1.0);
    expect(manager.magnetMobility[1]).toBeCloseTo(HEAVY_ANCHOR_MAGNET_MOBILITY, 4);
    expect(manager.magnetMobility[1]).toBeCloseTo(0.05, 4);

    // Step with player at (0, 0) and pickupRadius = 200
    const mockPlayer = { x: 0, y: 0, hp: 100, maxHp: 100, radius: 16, pickupRadius: 200 };
    manager.step(0.016, mockPlayer);

    // Normal coin should have pulled much closer towards player than the heavy anchor
    const coinDistMoved = 100 - manager.posX[0];
    const pouchDistMoved = 100 - manager.posX[1];

    expect(coinDistMoved).toBeGreaterThan(pouchDistMoved * 10);
  });

  it('absorbs minor coins within 60px gravitational sweeping radius of a Big Krejcary Pouch', () => {
    // Spawn a Big Krejcary Pouch at (200, 200) with value 35
    manager.spawn({ type: 'big_pouch', x: 200, y: 200, value: 35, isHeavyAnchor: true });
    // Spawn two minor coins within 60px
    manager.spawn({ type: 'coin', x: 215, y: 210, value: 2 });
    manager.spawn({ type: 'coin', x: 190, y: 220, value: 3 });
    // Spawn one distant coin outside sweeping radius
    manager.spawn({ type: 'coin', x: 450, y: 450, value: 5 });

    expect(manager.count).toBe(4);

    // Step simulation
    manager.step(0.016, null);

    // The pouch should have absorbed the 2 nearby coins (2 + 3 = 5 added value)
    expect(manager.count).toBe(2); // Pouch and distant coin remain
    const pouchIndex = manager.itemTypes[0] === 19 ? 0 : 1;
    expect(manager.values[pouchIndex]).toBe(40); // 35 + 2 + 3 = 40
  });

  it('refunds 50% of stress drop value into DropBank upon expiration', () => {
    // Spawn a volatile stress drop with 0.5s expiration and stress refund flag
    manager.spawn({
      type: 'gingerbread',
      x: 100,
      y: 100,
      value: 10,
      expiration: 0.5,
      isHot: true,
      stressPhaseRefund: true,
    });

    expect(manager.count).toBe(1);
    expect(manager.dropBank.gingerbread).toBe(0);

    // Step 0.6 seconds to trigger expiration
    manager.step(0.6, null);

    // Expired drop should be removed, and 50% (5) refunded into drop bank
    expect(manager.count).toBe(0);
    expect(manager.dropBank.gingerbread).toBe(5);
    expect(manager.dropBank.stressRefunds).toBe(5);
  });

  it('cashes out accumulated Drop Bank into Big Krejcary Pouch or Gingerbread Stash', () => {
    manager.dropBank.accumulate('coin', 40);
    manager.dropBank.accumulate('potion', 30);

    expect(manager.dropBank.coins).toBe(40);
    expect(manager.dropBank.mercyHeals).toBe(30);

    // Cash out coins as heavy anchor
    const cashedCoin = manager.cashOutDropBank(500, 500, true);
    expect(cashedCoin).toBe(true);
    expect(manager.dropBank.coins).toBe(0);
    expect(manager.flyweights[0].type).toBe('big_pouch');
    expect(manager.flyweights[0].value).toBe(40);

    // Cash out mercy heals as gingerbread stash
    const cashedHeal = manager.cashOutDropBank(600, 600, true);
    expect(cashedHeal).toBe(true);
    expect(manager.dropBank.mercyHeals).toBe(0);
    expect(manager.flyweights[1].type).toBe('gingerbread_stash');
    expect(manager.flyweights[1].value).toBe(30);
  });
});

describe('AI Director Drop Pacing & Annulus Spawner', () => {
  it('correctly computes normalized Vulnerability Score V and pacing phases', () => {
    // Dominating player: 100% Courage, 0 damage, ready weapons, low density
    const dominatingPlayer = {
      hp: 100,
      maxHp: 100,
      weapons: [{ cooldownTimer: 0, baseCooldown: 2 }],
    };
    const vDom = computeVulnerabilityScore(dominatingPlayer, 0, 2, 30);
    expect(vDom).toBeLessThan(0.35);
    expect(getDropPacingPhase(vDom)).toBe('stress');

    // Balanced / Flow player: 50% Courage, modest damage
    const flowPlayer = {
      hp: 50,
      maxHp: 100,
      weapons: [{ cooldownTimer: 1, baseCooldown: 2 }],
    };
    const vFlow = computeVulnerabilityScore(flowPlayer, 20, 10, 30);
    expect(vFlow).toBeGreaterThanOrEqual(0.35);
    expect(vFlow).toBeLessThanOrEqual(0.70);
    expect(getDropPacingPhase(vFlow)).toBe('flow');

    // Critical danger player: 20% Courage, heavy recent burst damage, surrounded
    const dyingPlayer = {
      hp: 15,
      maxHp: 100,
      weapons: [{ cooldownTimer: 2, baseCooldown: 2 }],
    };
    const vMercy = computeVulnerabilityScore(dyingPlayer, 40, 25, 30);
    expect(vMercy).toBeGreaterThan(0.70);
    expect(getDropPacingPhase(vMercy)).toBe('mercy');
  });

  it('detects camping player when net displacement over 5s is < 200px', () => {
    const detector = new CampingDetector();
    detector.reset(0, 0);

    // Stay near (0, 0) for 5 seconds
    detector.update(1.0, 10, 5);
    detector.update(1.0, 15, 10);
    detector.update(1.0, 5, 20);
    detector.update(1.0, 0, 10);
    const isCamping = detector.update(1.0, 20, 15);

    expect(isCamping).toBe(true);

    // Fast moving player (moving 100px every second)
    const movingDetector = new CampingDetector();
    movingDetector.reset(0, 0);
    movingDetector.update(1.0, 100, 0);
    movingDetector.update(1.0, 200, 0);
    movingDetector.update(1.0, 300, 0);
    movingDetector.update(1.0, 400, 0);
    const isMovingCamping = movingDetector.update(1.0, 500, 0);

    expect(isMovingCamping).toBe(false);
  });

  it('scores annulus placement cells: danger-seeking for Měšec vs safe corridor for Košík', () => {
    const playerX = 0;
    const playerY = 0;
    const screenW = 1280;

    // Cluster of enemies at angle 0 (east, around x = 2500, y = 0)
    const enemies = [
      { x: 2500, y: 10, dead: false },
      { x: 2520, y: -20, dead: false },
      { x: 2480, y: 15, dead: false },
      { x: 2510, y: 0, dead: false },
    ];

    // Big Pouch scores highest near enemies (luring through danger)
    const pouchPos = sampleAnnulusPosition(playerX, playerY, screenW, enemies, 'big_pouch');
    // East angle (0) should have highest score due to density bonus
    expect(pouchPos.x).toBeGreaterThan(1500);

    // Gingerbread Stash penalizes enemy density (guiding toward open corridor)
    const stashPos = sampleAnnulusPosition(playerX, playerY, screenW, enemies, 'gingerbread_stash');
    // Safe stash should avoid the dense cluster at x > 2000
    expect(stashPos.x).not.toBe(pouchPos.x);
  });
});

describe('OffScreenIndicatorController (Elliptical Viewport Projection)', () => {
  it('correctly projects off-screen targets onto elliptical border clamp with 48px margin', () => {
    const camera = {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      viewLeft: 0,
      viewTop: 0,
      viewRight: 1280,
      viewBottom: 720,
    };

    // Target far to the right at (3000, 360)
    const projRight = OffScreenIndicatorController.projectToViewportEllipse(3000, 360, camera, 48);
    expect(projRight.isOffScreen).toBe(true);
    expect(projRight.screenX).toBeCloseTo(1280 - 48, 1);
    expect(projRight.screenY).toBeCloseTo(360, 1);

    // Target on-screen at (640, 360)
    const projOnScreen = OffScreenIndicatorController.projectToViewportEllipse(640, 360, camera, 48);
    expect(projOnScreen.isOffScreen).toBe(false);
  });

  it('lerps indicator scale between 0.75x and 1.15x and pulses Košík on low Kuráž', () => {
    const controller = new OffScreenIndicatorController();
    const camera = {
      x: 0,
      y: 0,
      width: 1280,
      height: 720,
      viewLeft: 0,
      viewTop: 0,
      viewRight: 1280,
      viewBottom: 720,
    };

    const heavyDrops = [
      { type: 'big_pouch' as const, x: 2800, y: 360, dead: false },
      { type: 'gingerbread_stash' as const, x: 1400, y: 360, dead: false },
    ];

    controller.update(heavyDrops, camera, 0.016, 0.20); // 20% Kuráž

    const farPouch = controller.pool[0];
    const nearStash = controller.pool[1];

    expect(farPouch.active).toBe(true);
    expect(nearStash.active).toBe(true);

    // Far drop should scale closer to 0.75x
    expect(farPouch.scale).toBeLessThan(1.0);

    // Near drop with low Kuráž should pulse higher than 1.0x
    expect(nearStash.scale).toBeGreaterThan(0.9);
  });
});
