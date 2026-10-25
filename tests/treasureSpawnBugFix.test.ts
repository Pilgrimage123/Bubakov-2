import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { sampleAnnulusPosition } from '../src/game/directorDrops';
import { RunDirector } from '../src/game/director';
import {
  createDropInstance,
  createPendingDropBank,
  spawnDropWithLimit,
  releasePendingDrops,
  countActiveDrops,
  MAX_DROPS_LIMIT,
} from '../src/game/drops';
import type { GameDrop } from '../src/types';

describe('Treasure and Chest Spawning Defenses', () => {
  it('ensures sampleAnnulusPosition penalizes positions near existing drops to prevent stacking in one place', () => {
    const playerX = 0;
    const playerY = 0;
    const screenW = 1280;
    const enemies: any[] = [];

    // First placement without existing drops
    const firstPos = sampleAnnulusPosition(playerX, playerY, screenW, enemies, 'chest');
    expect(firstPos).toBeDefined();

    // Simulate an existing active chest at firstPos
    const existingDrops: any[] = [
      { x: firstPos.x, y: firstPos.y, dead: false, type: 'chest', isHeavyAnchor: true },
    ];

    // Second placement must avoid the exact same position
    const secondPos = sampleAnnulusPosition(
      playerX,
      playerY,
      screenW,
      enemies,
      'chest',
      undefined,
      existingDrops
    );

    const distBetween = Math.hypot(secondPos.x - firstPos.x, secondPos.y - firstPos.y);
    expect(distBetween).toBeGreaterThan(200);
  });

  it('ensures triggerCampingHeavyAnchor does not spawn a new heavy anchor or duplicate chest if one is already active', () => {
    const director = new RunDirector(1, { minX: -2200, maxX: 2200, minY: -2200, maxY: 2200 });
    director.heavyAnchorCooldown = 0;

    let spawnedDrop: any = null;
    const mockEngine = {
      camera: { width: 1280 },
      livingEnemies: [],
      drops: [
        { x: 1500, y: 0, dead: false, type: 'chest', isHeavyAnchor: true },
      ],
      spawnDrop: (type: string, x: number, y: number, opts: any) => {
        spawnedDrop = { type, x, y, opts };
      },
    };

    const mockPlayer = { x: 0, y: 0, hp: 100, maxHp: 100 };

    director.triggerCampingHeavyAnchor(mockPlayer, mockEngine);
    // Should NOT spawn another heavy anchor or chest because one is already waiting in the field
    expect(spawnedDrop).toBeNull();
    expect(director.heavyAnchorCooldown).toBeGreaterThan(0);
  });

  it('ensures spawnDropWithLimit caps active + pending chests at 2', () => {
    const drops: GameDrop[] = [
      createDropInstance('chest', 100, 100),
      createDropInstance('chest', 200, 200),
    ];
    const pendingBank = createPendingDropBank();

    const thirdChest = createDropInstance('chest', 300, 300);
    const result = spawnDropWithLimit(drops, thirdChest, pendingBank);

    expect(result).toBe(false);
    expect(thirdChest.dead).toBe(true);
    expect(pendingBank.byKey['chest']?.count ?? 0).toBe(0);
  });

  it('ensures releasePendingDrops disperses consecutive non-merge drops so they never stack in one place', () => {
    const drops: GameDrop[] = [];
    const pendingBank = createPendingDropBank();

    // Fill drops to capacity
    for (let i = 0; i < MAX_DROPS_LIMIT; i++) {
      spawnDropWithLimit(
        drops,
        createDropInstance('coin', i * 20, 0, { value: 1 }),
        pendingBank
      );
    }

    // Queue 2 potions at the exact same location (500, 500)
    const potion1 = createDropInstance('potion', 500, 500);
    const potion2 = createDropInstance('potion', 500, 500);
    spawnDropWithLimit(drops, potion1, pendingBank);
    spawnDropWithLimit(drops, potion2, pendingBank);

    expect(pendingBank.byKey['potion']?.count).toBe(2);

    // Free 2 slots in the arena
    drops[0].dead = true;
    drops[1].dead = true;

    const releasedCount = releasePendingDrops(drops, pendingBank);
    expect(releasedCount).toBe(2);

    const releasedPotions = drops.filter((d) => !d.dead && d.type === 'potion');
    expect(releasedPotions).toHaveLength(2);

    // Both potions must not be at the identical (500, 500) coordinate
    const dx = releasedPotions[0].x - releasedPotions[1].x;
    const dy = releasedPotions[0].y - releasedPotions[1].y;
    const dist = Math.hypot(dx, dy);
    expect(dist).toBeGreaterThan(10);
  });

  it('verifies App.tsx ensures non-boss mobs with >= 1000 hp do not trigger shouldDropTreasure', () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf-8');

    // shouldDropTreasure must check Boolean(this.isBoss), not the wide isBoss that includes maxHp >= 1000
    expect(appSource).toMatch(
      /const shouldDropTreasure = this\.isMiniboss\s*\?\s*\(!isFlockMember \|\| \(isFlockDefeated && !eng\.flockTreasureDropped\)\)\s*:\s*Boolean\(this\.isBoss\);/
    );

    // Also ensures threshold chest check caps at < 2 active chests
    expect(appSource).toMatch(/activeChests < 2/);
  });
});
