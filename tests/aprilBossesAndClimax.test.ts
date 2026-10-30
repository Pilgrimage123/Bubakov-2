import { describe, it, expect, vi } from 'vitest';
import { GameEngine } from '../src/game/engine';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';
import { TROPHIES } from '../src/data/trophies';
import { Lada } from '../src/render/ladaRenderer';

describe('Ticket 07: Dubnoví bossové, hierarchie a trofej', () => {
  it('registers all three April stage bosses in ENEMIES with authentic lore and stats', () => {
    // 1. Miniboss: beranek
    const beranek = ENEMIES.beranek;
    expect(beranek).toBeDefined();
    expect(beranek.name).toBe('Obří kolednický beránek');
    expect(beranek.category).toBe('bosses');
    expect(beranek.method).toBe('drawBeranek');
    expect(beranek.hp).toBeGreaterThanOrEqual(500);
    expect(beranek.lore).toContain('pečený beránek');

    // 2. Midboss: carodejnice_stara
    const stara = ENEMIES.carodejnice_stara;
    expect(stara).toBeDefined();
    expect(stara.name).toBe('Stará ježibaba z Melechu');
    expect(stara.category).toBe('bosses');
    expect(stara.isFlying).toBe(true);
    expect(stara.method).toBe('drawOldWitch');
    expect(stara.hp).toBeGreaterThanOrEqual(1000);

    // 3. Final boss: vrchni_carodejnice
    const vrchni = ENEMIES.vrchni_carodejnice;
    expect(vrchni).toBeDefined();
    expect(vrchni.name).toBe('Vrchní Filipojakubská Čarodějnice');
    expect(vrchni.category).toBe('bosses');
    expect(vrchni.isFlying).toBe(true);
    expect(vrchni.method).toBe('drawSupremeWitch');
    expect(vrchni.hp).toBeGreaterThanOrEqual(2000);
  });

  it('configures 5-minute boss schedule in GAME_LEVELS[2] for Stage 3', () => {
    const lvl2 = GAME_LEVELS[2];
    expect(lvl2).toBeDefined();

    // Miniboss at 85 s (~50 kills)
    expect(lvl2.miniBoss).toMatchObject({
      id: 'beranek',
      time: 85,
      kills: 50,
    });
    expect(lvl2.miniBoss.warning).toContain('BERÁNEK');

    // Midboss at 185 s (~130 kills)
    expect(lvl2.midBoss).toMatchObject({
      id: 'carodejnice_stara',
      time: 185,
      kills: 130,
    });
    expect(lvl2.midBoss.warning).toContain('STAROU JEŽIBABOU');

    // Final boss at 300 s (~240 kills)
    expect(lvl2.finalBoss).toMatchObject({
      id: 'vrchni_carodejnice',
      time: 300,
      kills: 240,
    });
    expect(lvl2.finalBoss.warning).toContain('VRCHNÍ FILIPOJAKUBSKÁ ČARODĚJNICE');
  });

  it('renders all three bosses with authentic Lada illustrations and elevation shadows', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      rect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      roundRect: () => {},
      lineJoin: 'round',
      lineCap: 'round',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    expect(() => {
      Lada.drawBeranek(mockCtx, 100, 100, 1.0, 50, false);
      Lada.drawOldWitch(mockCtx, 100, 100, 1.0, 50, false, undefined, { flightAltitude: 30 });
      Lada.drawSupremeWitch(mockCtx, 100, 100, 1.0, 50, false, undefined, { flightAltitude: 45 });
    }).not.toThrow();
  });

  it('defeating Vrchní Filipojakubská Čarodějnice triggers victory and unlocks Stage 4', () => {
    const engine = new GameEngine();
    const onVictorySpy = vi.fn();

    engine.initRun({
      levelId: 2,
      hunterType: 'wanderer',
      spawnInitialWave: false,
      meta: { completedLevels: {}, highestLevelUnlocked: 1, bestiaryKills: {} } as any,
    });
    engine.callbacks = { onVictory: onVictorySpy };

    expect(engine.state.levelVictoryTriggered).toBe(false);
    expect(engine.state.meta.completedLevels?.[2]).toBeFalsy();

    // Spawn Vrchní Čarodějnice as the final level boss
    const supremeWitch = engine.spawnMonster('vrchni_carodejnice', 200, 200, 1.0, true);
    expect(supremeWitch).toBeDefined();
    expect(supremeWitch.isBoss).toBe(true);

    // Defeat the boss with decisive lethal damage
    supremeWitch.takeDamage(50000, 'physical');

    expect(supremeWitch.isDefeated).toBe(true);
    expect(engine.state.levelVictoryTriggered).toBe(true);
    expect(onVictorySpy).toHaveBeenCalledWith(2, 'boss');

    // Progression verification: Level 2 marked completed, Stage 4 (id: 3) unlocked
    expect(engine.state.meta.completedLevels?.[2]).toBe(true);
    expect(engine.state.meta.highestLevelUnlocked).toBeGreaterThanOrEqual(3);
    expect(engine.state.meta.bestiaryKills?.vrchni_carodejnice).toBe(1);
  });

  it('awards and satisfies level2_completed trophy upon April victory', () => {
    const trophy = TROPHIES.find((t) => t.id === 'level2_completed');
    expect(trophy).toBeDefined();
    expect(trophy?.title).toContain('Dubnový přemožitel');
    expect(trophy?.desc).toContain('Vrchní Filipojakubskou Čarodějnici');

    // Prior to victory
    const mockMetaUnfinished = {
      completedLevels: {},
      bestiaryKills: {},
    };
    expect(trophy?.isMet(mockMetaUnfinished as any)).toBe(false);
    expect(trophy?.getProgress(mockMetaUnfinished as any).cur).toBe(0);

    // After defeating Vrchní Čarodějnice
    const mockMetaFinished = {
      completedLevels: { 2: true },
      bestiaryKills: { vrchni_carodejnice: 1 },
    };
    expect(trophy?.isMet(mockMetaFinished as any)).toBe(true);
    expect(trophy?.getProgress(mockMetaFinished as any).cur).toBe(1);
  });
});
