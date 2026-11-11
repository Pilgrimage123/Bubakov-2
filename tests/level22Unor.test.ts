import { describe, it, expect } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { ENEMIES, UNHOLY_IDS } from '../src/data/enemies';
import { ENEMY_POINTS } from '../src/constants';
import { ENEMY_ARCHETYPE_MAP } from '../src/components/gpu-animation/enemyCatalog';
import {
  UNOR_POIS,
  UNOR_NIGHT_POIS,
  getUnorPois,
  getUnorPoisList,
  isInsideUnorPoi,
  UNOR_DECOR,
  getUnorWaterEffect,
  resolveUnorObstacles,
  createInitialMasopustniKoblihyState,
  createInitialPochovavaniBasyState,
} from '../src/data/unorArena';
import { drawUnorDecoration } from '../src/render/unorSvgLandscape';
import { Lada } from '../src/render/ladaRenderer';
import { MOB_CONFIGS } from '../src/render/bakedBubakAtlas';
import { LEVEL_UNLOCKS } from '../src/data/levelUnlocks';
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

describe('Stages 23 & 24: Únor v Hrusicích (Masopustní průvod a koblihy & Masopustní rej a pochovávání basy)', () => {
  it('defines Stages 23 and 24 (ids: 22..23) with authentic carnival themes, winter season, and triad bosses', () => {
    const stage23 = GAME_LEVELS[22];
    const stage24 = GAME_LEVELS[23];

    expect(stage23).toBeDefined();
    expect(stage23.id).toBe(22);
    expect(stage23.season).toBe('winter');
    expect(stage23.theme).toBe('carnival_feast');
    expect(stage23.isNightLevel).toBeFalsy();
    expect(stage23.miniBoss.id).toBe('masopustni_medved');
    expect(stage23.midBoss.id).toBe('slamennik_obr');
    expect(stage23.finalBoss.id).toBe('rychtar_masek');

    expect(stage24).toBeDefined();
    expect(stage24.id).toBe(23);
    expect(stage24.season).toBe('winter');
    expect(stage24.theme).toBe('carnival_night');
    expect(stage24.isNightLevel).toBe(true);
    expect(['masopustni_laufr', 'nocni_kobold']).toContain(stage24.miniBoss.id);
    expect(stage24.midBoss.id).toBe('umrlec_basista');
    expect(stage24.finalBoss.id).toBe('bakchus_s_pivnim_soudkem');
  });

  it('verifies Bakchus s pivním soudkem (bakchus_s_pivnim_soudkem) folklore boss mechanics and integration', () => {
    const bakchus = ENEMIES['bakchus_s_pivnim_soudkem'];
    expect(bakchus, 'Bakchus s pivním soudkem must be defined in ENEMIES').toBeDefined();
    expect(bakchus.name).toBe('Bakchus s pivním soudkem');
    expect(bakchus.hp).toBe(30000);
    expect(bakchus.radius).toBe(54);
    expect(bakchus.category).toBe('bosses');
    expect(bakchus.poiseResist).toBeGreaterThanOrEqual(0.95);
    expect(bakchus.willpower).toBeGreaterThanOrEqual(0.98);
    expect(ENEMY_POINTS['bakchus_s_pivnim_soudkem']).toBe(16800);
    expect(ENEMY_ARCHETYPE_MAP['bakchus_s_pivnim_soudkem']?.archetype).toBe('golem');
    expect(MOB_CONFIGS['bakchus_s_pivnim_soudkem']).toBeDefined();
    expect(typeof (Lada as any).drawBakchusSPivnimSoudkem).toBe('function');
  });

  function UNUnholySetContains(id: string): boolean {
    return (UNHOLY_IDS as any).has ? (UNHOLY_IDS as any).has(id) : (UNHOLY_IDS as readonly string[]).includes(id);
  }

  it('verifies night unholy IDs for February', () => {
    expect(UNUnholySetContains('nocni_smrtak')).toBe(true);
    expect(UNUnholySetContains('umrlec_basista')).toBe(true);
    expect(UNUnholySetContains('masopustni_basa')).toBe(true);
    expect(UNUnholySetContains('nocni_kobold')).toBe(true);
    expect(UNUnholySetContains('plivnik_uhlik')).toBe(true);
  });

  it('verifies all 15 new February enemies and bosses have complete definitions and rendering routines', () => {
    const februaryEnemyIds = [
      'masopustni_laufr',
      'baba_s_nusi',
      'masopustni_kominik',
      'koblihovy_rarach',
      'masopustni_krasojezdec',
      'masopustni_medved',
      'slamennik_obr',
      'rychtar_masek',
      'nocni_smrtak',
      'smutecni_maskara',
      'masopustni_basa',
      'plivnik_uhlik',
      'nocni_kobold',
      'umrlec_basista',
      'bakchus_s_pivnim_soudkem',
    ];

    for (const id of februaryEnemyIds) {
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

  it('verifies February arena POIs and interactable initial states', () => {
    const dayPois = getUnorPois(false);
    const nightPois = getUnorPois(true);

    expect(dayPois.tavern.title).toContain('koblih');
    expect(nightPois.church.title).toContain('márnice');

    const dayList = getUnorPoisList(false);
    const nightList = getUnorPoisList(true);
    expect(dayList.length).toBeGreaterThanOrEqual(9);
    expect(nightList.length).toBeGreaterThanOrEqual(9);

    const koblihy = createInitialMasopustniKoblihyState();
    expect(koblihy.cooldown).toBe(0);
    expect(koblihy.koblihyCooked).toBe(0);
    expect(koblihy.speedBoostTimer).toBe(0);

    const basa = createInitialPochovavaniBasyState();
    expect(basa.cooldown).toBe(0);
    expect(basa.basasBuried).toBe(0);
    expect(basa.shockwaveTimer).toBe(0);
  });

  it('verifies ice water physics and sliding bonus in February arena', () => {
    // Pond is frozen solid ice
    const pondWater = getUnorWaterEffect(-725, 615, 22);
    expect(pondWater.onIce).toBe(true);
    expect(pondWater.inOpenWater).toBe(false);
    expect(pondWater.speedMult).toBe(1.15);

    // Bridge has normal traction
    const bridgeWater = getUnorWaterEffect(475, 420, 22);
    expect(bridgeWater.onIce).toBe(false);
    expect(bridgeWater.speedMult).toBe(1.0);
  });

  it('verifies obstacle resolution for February arena entities', () => {
    const entity = { x: 440, y: -75, radius: 20, isFlying: false };
    const hit = resolveUnorObstacles(entity, false);
    expect(typeof hit).toBe('boolean');
  });

  it('verifies Unor landscape decorations render without canvas stack imbalance', () => {
    for (const d of UNOR_DECOR) {
      const ctxDay = createMockCtx();
      expect(() => drawUnorDecoration(ctxDay, d, 2.0, false)).not.toThrow();
      expect(ctxDay.getSaveDepth(), `Stack balance for ${d.type} (day)`).toBe(0);

      const ctxNight = createMockCtx();
      expect(() => drawUnorDecoration(ctxNight, d, 2.0, true)).not.toThrow();
      expect(ctxNight.getSaveDepth(), `Stack balance for ${d.type} (night)`).toBe(0);
    }
  });

  it('verifies progressive level unlocks and trophies for Stage 23 & 24', () => {
    const unlock22 = LEVEL_UNLOCKS[22];
    const unlock23 = LEVEL_UNLOCKS[23];

    expect(unlock22).toBeDefined();
    expect(unlock22.id).toBe(22);
    expect(unlock22.targetEnemies.length).toBeGreaterThan(0);

    expect(unlock23).toBeDefined();
    expect(unlock23.id).toBe(23);
    expect(unlock23.targetEnemies.length).toBeGreaterThan(0);

    const trophy22 = TROPHIES.find(t => t.id === 'level22_completed');
    const trophy23 = TROPHIES.find(t => t.id === 'level23_completed');
    expect(trophy22).toBeDefined();
    expect(trophy23).toBeDefined();
    expect(trophy22?.reward).toBeGreaterThan(0);
    expect(trophy23?.reward).toBeGreaterThan(0);
    expect(typeof trophy22?.isMet).toBe('function');
    expect(typeof trophy23?.isMet).toBe('function');
  });

  it('verifies virtual crow waves are active on night level 23', () => {
    expect(isCrowWaveNightLevel(22)).toBe(false);
    expect(isCrowWaveNightLevel(23)).toBe(true);
  });

  it('verifies GameEngine initializes and handles February state correctly', () => {
    const engine = new GameEngine();
    engine.initRun(22, 'wanderer');
    expect(engine.activeLevelId).toBe(22);
    expect(engine.unor).toBeDefined();
    expect(engine.unorActivePoiPrompt).toBeNull();
  });
});
