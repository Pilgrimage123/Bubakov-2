import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES, UNHOLY_IDS } from '../src/data/enemies';
import { ENEMY_POINTS, getCurrentDayPhase } from '../src/constants';
import { ENEMY_ARCHETYPE_MAP } from '../src/components/gpu-animation/enemyCatalog';
import { isRegularSpawnAllowedForLevel, STAGE_THREAT_MULTIPLIERS } from '../src/game/director';
import {
  LEDEN_POIS,
  LEDEN_NIGHT_POIS,
  getLedenPois,
  getLedenPoisList,
  isInsideLedenPoi,
  LEDEN_DECOR,
  getLedenWaterEffect,
  resolveLedenObstacles,
  createInitialSnehulakNavesState,
  createInitialTrikralovaFaraState,
} from '../src/data/ledenArena';
import { drawLedenDecoration } from '../src/render/ledenSvgLandscape';
import { Lada } from '../src/render/ladaRenderer';
import { MOB_CONFIGS } from '../src/render/bakedBubakAtlas';
import { LEVEL_UNLOCKS, isLevelFullyUnlocked } from '../src/data/levelUnlocks';
import { TROPHIES } from '../src/data/trophies';
import { isCrowWaveNightLevel } from '../src/game/virtualLeaderCrowWave';
import { GameEngine } from '../src/game/engine';

function createMockCtx() {
  let saveDepth = 0;
  return {
    save: () => {
      saveDepth++;
    },
    restore: () => {
      saveDepth--;
    },
    getSaveDepth: () => saveDepth,
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    rect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    roundRect: () => {},
    arc: () => {},
    ellipse: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    fillText: () => {},
    strokeText: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    setLineDash: () => {},
    strokeDasharray: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D & { getSaveDepth: () => number };
}

describe('Stages 21 & 22: Leden v Hrusicích (Tříkrálová koleda & Tříkrálová noc s Perchtou s nožem)', () => {
  it('defines Stages 21 and 22 (ids: 20..21) with authentic themes, seasons, and triad bosses', () => {
    const stage21 = GAME_LEVELS[20];
    const stage22 = GAME_LEVELS[21];

    expect(stage21).toBeDefined();
    expect(stage21.id).toBe(20);
    expect(stage21.season).toBe('winter');
    expect(stage21.theme).toBe('january_frost');
    expect(stage21.weatherEffect).toBe('snow');
    expect(stage21.isNightLevel).toBeFalsy();
    expect(stage21.miniBoss.id).toBe('obri_snehulak');
    expect(stage21.midBoss.id).toBe('trikralovy_jezdec');
    expect(stage21.finalBoss.id).toBe('vladce_chumelenice');

    expect(stage22).toBeDefined();
    expect(stage22.id).toBe(21);
    expect(stage22.season).toBe('winter');
    expect(stage22.theme).toBe('january_frost');
    expect(stage22.weatherEffect).toBe('blizzard');
    expect(stage22.isNightLevel).toBe(true);
    expect(stage22.miniBoss.id).toBe('ledova_klekanice');
    expect(stage22.midBoss.id).toBe('kostlivec_s_kosou');
    expect(stage22.finalBoss.id).toBe('perchta_s_nozem');
  });

  it('verifies Perchta s nožem (perchta_s_nozem) folklore boss mechanics and integration', () => {
    const perchta = ENEMIES['perchta_s_nozem'];
    expect(perchta, 'Perchta s nožem must be defined in ENEMIES').toBeDefined();
    expect(perchta.name).toBe('Šeredná Perchta s nožem');
    expect(perchta.hp).toBe(26000);
    expect(perchta.radius).toBe(52);
    expect(perchta.category).toBe('bosses');
    expect((perchta as any).isUnholy).toBe(true);
    expect(UNUnholySetContains('perchta_s_nozem')).toBe(true);
    expect(perchta.poiseResist).toBeGreaterThanOrEqual(0.95);
    expect(perchta.willpower).toBeGreaterThanOrEqual(0.98);
    expect(ENEMY_POINTS['perchta_s_nozem']).toBe(15500);
    expect(ENEMY_ARCHETYPE_MAP['perchta_s_nozem']?.archetype).toBe('golem');
    expect(MOB_CONFIGS['perchta_s_nozem']).toBeDefined();
    expect(typeof (Lada as any).drawPerchtaSNozem).toBe('function');
  });

  function UNUnholySetContains(id: string): boolean {
    return (UNHOLY_IDS as any).has ? (UNHOLY_IDS as any).has(id) : (UNHOLY_IDS as readonly string[]).includes(id);
  }

  it('verifies all 13 new January enemies and bosses have complete definitions and rendering routines', () => {
    const januaryEnemyIds = [
      'zimni_vrabec',
      'kluk_na_sankach',
      'ledovy_skritek',
      'trikralovy_kolednik',
      'chumelenice',
      'nocni_zavejnik',
      'mrazivy_havran',
      'obri_snehulak',
      'trikralovy_jezdec',
      'vladce_chumelenice',
      'ledova_klekanice',
      'kostlivec_s_kosou',
      'perchta_s_nozem',
    ];

    for (const id of januaryEnemyIds) {
      const def = ENEMIES[id];
      expect(def, `Enemy ${id} must exist in ENEMIES`).toBeDefined();
      expect(def.hp, `Enemy ${id} HP`).toBeGreaterThan(0);
      expect(def.damage, `Enemy ${id} damage`).toBeGreaterThan(0);
      expect(ENEMY_POINTS[id], `Enemy ${id} points in ENEMY_POINTS`).toBeGreaterThan(0);
      expect(ENEMY_ARCHETYPE_MAP[id], `Enemy ${id} in ENEMY_ARCHETYPE_MAP`).toBeDefined();
      expect(MOB_CONFIGS[id as keyof typeof MOB_CONFIGS], `Enemy ${id} in MOB_CONFIGS`).toBeDefined();

      // Verify Lada method exists
      const methodName = `draw${id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
      expect(typeof (Lada as any)[methodName], `Lada.${methodName} function`).toBe('function');

      // Test canvas execution and stack balance
      const ctx = createMockCtx();
      expect(() => {
        (Lada as any)[methodName](ctx, 100, 100, 1, false, false, 0, 1);
      }).not.toThrow();
      expect(ctx.getSaveDepth(), `Lada.${methodName} save/restore depth balance`).toBe(0);
    }
  });

  it('verifies January arena POIs and interactable initial states', () => {
    const dayPois = getLedenPois(false);
    const nightPois = getLedenPois(true);

    expect(dayPois.village.title).toContain('kašny');
    expect(nightPois.church.title).toContain('fara');

    const dayList = getLedenPoisList(false);
    const nightList = getLedenPoisList(true);
    expect(dayList.length).toBeGreaterThanOrEqual(9);
    expect(nightList.length).toBeGreaterThanOrEqual(9);

    const snehulak = createInitialSnehulakNavesState();
    expect(snehulak.cooldown).toBe(0);
    expect(snehulak.snowmenBuilt).toBe(0);

    const fara = createInitialTrikralovaFaraState();
    expect(fara.cooldown).toBe(0);
    expect(fara.blessingsCount).toBe(0);
  });

  it('verifies ice water physics and sliding bonus in January arena', () => {
    // Pond is frozen solid ice
    const pondWater = getLedenWaterEffect(-725, 615, 20);
    expect(pondWater.onIce).toBe(true);
    expect(pondWater.inOpenWater).toBe(false);
    expect(pondWater.speedMult).toBe(1.15);

    // Bridge has normal traction
    const bridgeWater = getLedenWaterEffect(475, 420, 20);
    expect(bridgeWater.onIce).toBe(false);
    expect(bridgeWater.speedMult).toBe(1.0);
  });

  it('verifies obstacle resolution for January arena entities', () => {
    const entity = { x: -350, y: -200, radius: 20, isFlying: false };
    const hit = resolveLedenObstacles(entity, false);
    expect(typeof hit).toBe('boolean');
  });

  it('verifies Leden landscape decorations render without canvas stack imbalance', () => {
    for (const d of LEDEN_DECOR) {
      const ctxDay = createMockCtx();
      expect(() => drawLedenDecoration(ctxDay, d, 2.0, false)).not.toThrow();
      expect(ctxDay.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawLedenDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies progressive level unlocks and trophies for Stage 21 & 22', () => {
    const unlock20 = LEVEL_UNLOCKS[20];
    const unlock21 = LEVEL_UNLOCKS[21];

    expect(unlock20).toBeDefined();
    expect(unlock20.id).toBe(20);
    expect(unlock20.targetEnemies.length).toBeGreaterThan(0);

    expect(unlock21).toBeDefined();
    expect(unlock21.id).toBe(21);
    expect(unlock21.targetEnemies.length).toBeGreaterThan(0);

    const trophy20 = TROPHIES.find(t => t.id === 'level20_completed');
    const trophy21 = TROPHIES.find(t => t.id === 'level21_completed');
    expect(trophy20).toBeDefined();
    expect(trophy21).toBeDefined();
    expect(trophy20?.reward).toBeGreaterThan(0);
    expect(trophy21?.reward).toBeGreaterThan(0);
    expect(typeof trophy20?.isMet).toBe('function');
    expect(typeof trophy21?.isMet).toBe('function');
  });

  it('verifies virtual crow waves are active on night level 21', () => {
    expect(isCrowWaveNightLevel(20)).toBe(false);
    expect(isCrowWaveNightLevel(21)).toBe(true);
  });

  it('verifies GameEngine initializes and handles January state correctly', () => {
    const engine = new GameEngine();
    engine.initRun(20, 'wanderer');
    expect(engine.activeLevelId).toBe(20);
    expect(engine.leden).toBeDefined();
    expect(engine.ledenActivePoiPrompt).toBeNull();
  });
});
