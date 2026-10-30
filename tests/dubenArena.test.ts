import { describe, it, expect } from 'vitest';
import {
  DUBEN_ARENA_BOUNDS,
  DUBEN_POIS,
  DUBEN_POIS_LIST,
  DUBEN_FOREST_ZONES,
  DUBEN_OBSTACLES,
  DUBEN_BELL_COOLDOWN,
  isInsideDubenPoi,
  clampToDubenArenaBounds,
  collideCircleWithDubenObstacles,
  resolveDubenObstacles,
  hasDubenTerrainLineOfSight,
  getDubenWaterEffect,
  getActiveDubenForestZone,
  pickDubenForestSpawnPoint,
  sanitizeDubenSpawnPoint,
  hasDubenRoofsInView,
  isEntityBehindDubenRoof,
} from '../src/data/dubnovyDenArena';
import { GameEngine } from '../src/game/engine';

describe('Dubnový den Arena (Stage 3 Geometry, POIs & Tactics)', () => {
  it('registers all 9 canonical April POIs with valid geometry and hints', () => {
    expect(DUBEN_POIS_LIST).toHaveLength(9);
    const poiKeys = Object.keys(DUBEN_POIS);
    expect(poiKeys).toEqual(expect.arrayContaining([
      'fields', 'church', 'tavern', 'village', 'orchard', 'pond', 'mill', 'forest', 'shrine',
    ]));

    for (const poi of DUBEN_POIS_LIST) {
      expect(poi.title).toBeTruthy();
      expect(poi.radius).toBeGreaterThan(100);
      expect(poi.hint).toBeTruthy();
      expect(isInsideDubenPoi(poi.x, poi.y, poi)).toBe(true);
      expect(isInsideDubenPoi(poi.x + poi.radius + 10, poi.y, poi)).toBe(false);
    }
  });

  it('clamps entities strictly within outer folk border bounds', () => {
    const outsideHunter = { x: 3000, y: -2500, radius: 20 };
    const clamped = clampToDubenArenaBounds(outsideHunter);
    expect(clamped).toBe(true);
    expect(outsideHunter.x).toBeLessThanOrEqual(DUBEN_ARENA_BOUNDS.maxX);
    expect(outsideHunter.y).toBeGreaterThanOrEqual(DUBEN_ARENA_BOUNDS.minY);

    const insideHunter = { x: 0, y: 0, radius: 20 };
    const notClamped = clampToDubenArenaBounds(insideHunter);
    expect(notClamped).toBe(false);
    expect(insideHunter.x).toBe(0);
    expect(insideHunter.y).toBe(0);
  });

  it('detects collisions and resolves solid obstacles for church and tavern buildings', () => {
    expect(DUBEN_OBSTACLES.length).toBeGreaterThan(5);

    // Point inside St. George church nave (-800, -650)
    const hitChurch = collideCircleWithDubenObstacles(-800, -650, 18);
    expect(hitChurch.hit).toBe(true);
    expect(hitChurch.obstacleId).toBe('church_main');

    // Resolving obstacle pushes entity outside
    const entity = { x: -800, y: -650, radius: 18 };
    const resolved = resolveDubenObstacles(entity, false);
    expect(resolved).toBe(true);
    const postCol = collideCircleWithDubenObstacles(entity.x, entity.y, 18);
    expect(postCol.hit).toBe(false);

    // Flying entities ignore solid ground obstacles
    const flyingEntity = { x: -800, y: -650, radius: 18 };
    const flyingResolved = resolveDubenObstacles(flyingEntity, true);
    expect(flyingResolved).toBe(false);
    expect(flyingEntity.x).toBe(-800);
  });

  it('blocks Line-of-Sight across church buildings and allows LoS across open fields', () => {
    // Ray crossing right through church nave (-800, -650)
    const losThroughChurch = hasDubenTerrainLineOfSight(-950, -650, -650, -650);
    expect(losThroughChurch).toBe(false);

    // Ray across open fields
    const losAcrossFields = hasDubenTerrainLineOfSight(200, -900, 300, -900);
    expect(losAcrossFields).toBe(true);
  });

  it('simulates thawed pond: empowers aquatic creatures and slows non-aquatic deep swimmers', () => {
    const pondCenter = DUBEN_POIS.pond;

    // Aquatic frog in pond center
    const frogWater = getDubenWaterEffect(pondCenter.x, pondCenter.y, true);
    expect(frogWater.inWater).toBe(true);
    expect(frogWater.inDeepWater).toBe(true);
    expect(frogWater.slowRatio).toBeGreaterThan(1.0); // +15% agile boost

    // Ground monster in deep pond center
    const groundWater = getDubenWaterEffect(pondCenter.x, pondCenter.y, false);
    expect(groundWater.inWater).toBe(true);
    expect(groundWater.inDeepWater).toBe(true);
    expect(groundWater.slowRatio).toBeLessThan(0.8); // heavy mud drag

    // Shallows at pond edge
    const shallowWater = getDubenWaterEffect(pondCenter.x + 220, pondCenter.y, false);
    expect(shallowWater.inWater).toBe(true);
    expect(shallowWater.inShallows).toBe(true);
  });

  it('supports 4 April forest zones and picks spawn points within cover', () => {
    expect(DUBEN_FOREST_ZONES).toHaveLength(4);
    const fz = DUBEN_FOREST_ZONES[0];
    const detected = getActiveDubenForestZone(fz.x, fz.y);
    expect(detected).toBeDefined();
    expect(detected?.id).toBe(fz.id);

    const spawn = pickDubenForestSpawnPoint(0, 0, 1);
    expect(spawn.x).toBeGreaterThan(DUBEN_ARENA_BOUNDS.minX);
    expect(spawn.x).toBeLessThan(DUBEN_ARENA_BOUNDS.maxX);
    expect(spawn.forest).toBeDefined();
  });

  it('detects roof occlusion zones for village church and cottages', () => {
    expect(hasDubenRoofsInView(-1000, -800, -600, -500)).toBe(true);
    expect(hasDubenRoofsInView(1500, 1500, 1800, 1800)).toBe(false);

    const behindChurchRoof = isEntityBehindDubenRoof(-800, -680);
    expect(behindChurchRoof).toBeDefined();
    expect(behindChurchRoof?.id).toBe('church_roof');
  });

  it('executes Easter Bell peal at church and activates Maypole warding aura in engine', () => {
    const engine = new GameEngine();
    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
    });

    const player = engine.state.player;
    expect(player).toBeDefined();

    // 1. Maypole ward in village green
    player.x = DUBEN_POIS.village.x;
    player.y = DUBEN_POIS.village.y;
    engine.update(0.1);
    expect(engine.state.dubenDen.maypoleWardActive).toBe(true);

    // Leaving village green deactivates ward
    player.x = 1000;
    player.y = 1000;
    engine.update(0.1);
    expect(engine.state.dubenDen.maypoleWardActive).toBe(false);

    // 2. Easter Bell at church
    player.x = DUBEN_POIS.church.x;
    player.y = DUBEN_POIS.church.y;
    player.hp = player.maxHp * 0.5;

    // Spawn an enemy near church
    const bubak = engine.spawnMonster('rarach', DUBEN_POIS.church.x + 80, DUBEN_POIS.church.y + 80);
    const bubakHpBefore = bubak.hp;

    // Trigger [E] interaction
    engine.state.keys['e'] = true;
    engine.update(0.1);

    expect(engine.state.dubenDen.bellCooldown).toBeGreaterThan(0);
    expect(player.hp).toBeGreaterThan(player.maxHp * 0.5); // Healed +20 HP
    expect(bubak.hp).toBeLessThan(bubakHpBefore); // Dealt holy damage
    expect(bubak.panicked).toBe(true); // Terrified by the sacred bell
  });
});
