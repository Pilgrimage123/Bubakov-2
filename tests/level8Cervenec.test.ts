import { describe, it, expect, vi } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getLevelTranslation } from '../src/i18n';
import { getCurrentDayPhase } from '../src/constants';
import { GameEngine } from '../src/game/engine';
import {
  CERVENEC_POIS,
  CERVENEC_SHEAF_OBSTACLES,
  CERVENEC_DECOR,
  resolveCervenecObstacles,
} from '../src/data/cervenecArena';
import { ENEMIES } from '../src/data/enemies';
import { TROPHIES } from '../src/data/trophies';
import { Lada } from '../src/render/ladaRenderer';
import { drawCervenecDecoration } from '../src/render/cervenecSvgLandscape';

function createMockCanvasContext() {
  let saveDepth = 0;
  const ctx: any = {
    save: vi.fn(() => {
      saveDepth += 1;
    }),
    restore: vi.fn(() => {
      saveDepth -= 1;
    }),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    setLineDash: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    getSaveDepth: () => saveDepth,
  };
  return ctx;
}

describe('Levels 9 & 10: Červenec v Hrusicích (Stages 9 & 10 Core Definition, Arena & Mechanics)', () => {
  it('defines Stage 9 (ID 8: Červencové žně) with St. Margaret harvest theme, bosses, and 5-minute daytime schedule', () => {
    const lvl8 = GAME_LEVELS[8];
    expect(lvl8).toBeDefined();
    expect(lvl8.id).toBe(8);
    expect(lvl8.name).toBe('9. Červenec v Hrusicích – Žně na sv. Markétu a poutní veselice');
    expect(lvl8.shortTitle).toBe('Červencové žně');
    expect(lvl8.badge).toBe('9. Úroveň');
    expect(lvl8.season).toBe('summer');
    expect(lvl8.arena.id).toBe('cervencove_zne');

    expect(lvl8.miniBoss).toMatchObject({ id: 'krecek_obilnik', time: 85, kills: 95 });
    expect(lvl8.midBoss).toMatchObject({ id: 'zitna_matka', time: 185, kills: 225 });
    expect(lvl8.finalBoss).toMatchObject({ id: 'hromotluk_marketa', time: 300, kills: 375 });

    expect(lvl8.spawnPools.noon).toContain('polni_krecek');
    expect(lvl8.spawnPools.noon).toContain('zitna_baba');
    expect(lvl8.spawnPools.afternoon).toContain('polednice');
    expect(lvl8.spawnPools.dusk).toContain('cert_sekac');
  });

  it('defines Stage 10 (ID 9: Červencová noc) with night storm theme, Bílá paní, Bezhlavý rytíř, and Tříhlavý Drak', () => {
    const lvl9 = GAME_LEVELS[9];
    expect(lvl9).toBeDefined();
    expect(lvl9.id).toBe(9);
    expect(lvl9.name).toBe('10. Červenec v Hrusicích – Bouře sv. Eliáše a Dračí sluj');
    expect(lvl9.shortTitle).toBe('Červencová noc');
    expect(lvl9.badge).toBe('10. Úroveň');
    expect(lvl9.isNightLevel).toBe(true);
    expect(lvl9.arena.id).toBe('cervencove_zne');

    expect(lvl9.miniBoss).toMatchObject({ id: 'bila_pani', time: 85, kills: 100 });
    expect(lvl9.midBoss).toMatchObject({ id: 'bezhlavy_rytir', time: 185, kills: 240 });
    expect(lvl9.finalBoss).toMatchObject({ id: 'drak', time: 300, kills: 400 });

    expect(lvl9.spawnPools.dusk).toContain('kulovy_blesk');
    expect(lvl9.spawnPools.dusk).toContain('plivnik');
    expect(lvl9.spawnPools.night).toContain('bila_pani');
    expect(lvl9.spawnPools.night).toContain('zbrojnos');
    expect(lvl9.spawnPools.midnight).toContain('bezhlavy_rytir');
  });

  it('gates Stage 9 behind Stage 8 (Svatojánský Vládce) and Stage 10 behind Stage 9 (Pouťový Hromotluk)', () => {
    expect(LEVEL_UNLOCKS[8]).toBeDefined();
    expect(LEVEL_UNLOCKS[9]).toBeDefined();

    expect(getLevelProgress(8, {}).isUnlocked).toBe(false);
    expect(getLevelProgress(8, { completedLevels: { 7: true } }).isUnlocked).toBe(true);
    expect(getLevelProgress(8, { bestiaryKills: { svatojansky_vladce: 1 } }).isUnlocked).toBe(true);

    expect(getLevelProgress(9, { completedLevels: { 7: true } }).isUnlocked).toBe(false);
    expect(getLevelProgress(9, { completedLevels: { 8: true } }).isUnlocked).toBe(true);
    expect(getLevelProgress(9, { bestiaryKills: { hromotluk_marketa: 1 } }).isUnlocked).toBe(true);
  });

  it('maps day phases for Stage 9 (daytime) and Stage 10 (nighttime) across 300 seconds', () => {
    expect(getCurrentDayPhase(0, 8).id).toBe('noon');
    expect(getCurrentDayPhase(130, 8).id).toBe('afternoon');
    expect(getCurrentDayPhase(240, 8).id).toBe('dusk');
    expect(getCurrentDayPhase(300, 8).id).toBe('dawn');

    expect(getCurrentDayPhase(0, 9).id).toBe('dusk');
    expect(getCurrentDayPhase(120, 9).id).toBe('night');
    expect(getCurrentDayPhase(240, 9).id).toBe('midnight');
    expect(getCurrentDayPhase(300, 9).id).toBe('dawn');
  });

  it('defines trophies and localizations for Stages 9 and 10', () => {
    const t8 = TROPHIES.find((t) => t.id === 'level8_completed');
    const t9 = TROPHIES.find((t) => t.id === 'level9_completed');
    expect(t8).toBeDefined();
    expect(t9).toBeDefined();
    expect(t8?.isMet({ completedLevels: { 8: true }, bestiaryKills: {} } as any)).toBe(true);
    expect(t9?.isMet({ completedLevels: { 9: true }, bestiaryKills: {} } as any)).toBe(true);

    const cs8 = getLevelTranslation(8, 'cs');
    const en8 = getLevelTranslation(8, 'en');
    expect(cs8.shortTitle).toBe('Červencové žně');
    expect(en8.shortTitle).toBe('July Harvest');

    const cs9 = getLevelTranslation(9, 'cs');
    const en9 = getLevelTranslation(9, 'en');
    expect(cs9.shortTitle).toBe('Červencová noc');
    expect(en9.shortTitle).toBe('July Night');
  });

  it('executes Poutní střelnice [E] interaction in Stage 9 and grain sheaf collision', () => {
    const engine = new GameEngine();
    engine.initRun(8, 'wanderer');
    const player = engine.state.player!;

    // Move player to village green (Poutní střelnice)
    player.x = CERVENEC_POIS.village.x;
    player.y = CERVENEC_POIS.village.y;
    player.hp = 50;

    // Trigger [E]
    engine.state.keys = { KeyE: true };
    engine.update(0.1);

    expect(engine.cervenec.strelnice.shotsFired).toBe(1);
    expect(engine.cervenec.strelnice.buffTimer).toBeGreaterThan(15);
    expect(player.luck).toBeGreaterThanOrEqual(20);

    // Verify 4 grain sheaves (panáky žita) + 1 booth act as solid obstacles for ground entities
    const circleSheaves = CERVENEC_SHEAF_OBSTACLES.filter((o) => o.shape === 'circle');
    expect(circleSheaves).toHaveLength(4);
    const sheaf = circleSheaves[0];
    const entity = { x: sheaf.x + 5, y: sheaf.y, radius: 18 };
    resolveCervenecObstacles(entity, false);
    expect(Math.hypot(entity.x - sheaf.x, entity.y - sheaf.y)).toBeGreaterThanOrEqual((sheaf.radius || 44) + entity.radius - 1);
  });

  it('executes St. Elias lightning strike in Stage 10 and records meta.lightningWitnessed = true for trophy', () => {
    const engine = new GameEngine();
    engine.initRun(9, 'wanderer');
    const player = engine.state.player!;

    // Set an imminent lightning strike near the player
    engine.cervenec.stormWarning = {
      x: player.x + 10,
      y: player.y + 10,
      radius: 95,
      timer: 0.05,
      maxTimer: 1.2,
    };

    const stormEnemy = engine.spawnMonster('plivnik', player.x + 20, player.y + 15, 1.0);
    const initialEnemyHp = stormEnemy.hp;

    engine.update(0.1);

    expect(engine.cervenec.stormWarning).toBeNull();
    expect((engine.state as any).meta.lightningWitnessed).toBe(true);
    expect(stormEnemy.hp).toBeLessThan(initialEnemyHp);
  });

  it('draws all new July enemies, bosses, and landscape decorations with balanced ctx.save / ctx.restore', () => {
    const newMobIds = [
      'polni_krecek',
      'zitna_baba',
      'kulovy_blesk',
      'krecek_obilnik',
      'zitna_matka',
      'hromotluk_marketa',
    ];

    for (const id of newMobIds) {
      const def = ENEMIES[id];
      expect(def, `Enemy ${id} must exist`).toBeDefined();
      const drawFn = (Lada as any)[def.method];
      expect(typeof drawFn, `Lada.${def.method} must be a function`).toBe('function');

      const ctx = createMockCanvasContext();
      drawFn.call(Lada, ctx, 0, 0, def.radius, 1.25, 1, false);
      expect(ctx.getSaveDepth(), `Save/restore balance for ${def.method}`).toBe(0);
    }

    for (const decor of CERVENEC_DECOR) {
      const ctx = createMockCanvasContext();
      drawCervenecDecoration(ctx, decor, 2.5, false);
      expect(ctx.getSaveDepth(), `Save/restore balance for ${decor.type} (day)`).toBe(0);
      drawCervenecDecoration(ctx, decor, 2.5, true);
      expect(ctx.getSaveDepth(), `Save/restore balance for ${decor.type} (night)`).toBe(0);
    }
  });
});
