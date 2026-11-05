import { describe, it, expect, vi } from 'vitest';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_UNLOCKS, getLevelProgress } from '../src/data/levelUnlocks';
import { getCurrentDayPhase } from '../src/constants';
import { GameEngine } from '../src/game/engine';
import {
  SRPEN_POIS,
  SRPEN_SPECIAL_OBSTACLES,
  SRPEN_DECOR,
  resolveSrpenObstacles,
  createInitialChlebovaPecState,
  createInitialVavrineckaVatra,
} from '../src/data/srpenArena';
import { ENEMIES } from '../src/data/enemies';
import { TROPHIES } from '../src/data/trophies';
import { Lada } from '../src/render/ladaRenderer';
import { drawSrpenDecoration } from '../src/render/srpenSvgLandscape';

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

describe('Levels 11 & 12: Srpen v Hrusicích (Stages 11 & 12 Core Definition, Arena & Mechanics)', () => {
  it('defines Stage 11 (ID 10: Dožínková slavnost) with harvest theme, bosses, and schedule', () => {
    const lvl10 = GAME_LEVELS[10];
    expect(lvl10).toBeDefined();
    expect(lvl10.id).toBe(10);
    expect(lvl10.name).toContain('Dožínková slavnost');
    expect(lvl10.shortTitle).toBe('Dožínková slavnost');
    expect(lvl10.badge).toBe('11. Úroveň');
    expect(lvl10.season).toBe('summer');
    expect(lvl10.arena.id).toBe('srpnova_slavnost');

    expect(lvl10.miniBoss).toMatchObject({ id: 'kralovsky_cmelak', time: 85, kills: 100 });
    expect(lvl10.midBoss).toMatchObject({ id: 'zlatohlavek_zrout', time: 185, kills: 240 });
    expect(lvl10.finalBoss).toMatchObject({ id: 'dozinkovy_chasnik', time: 300, kills: 390 });

    expect(lvl10.spawnPools.noon).toContain('srpnove_cmelak');
    expect(lvl10.spawnPools.noon).toContain('polni_mysice');
    expect(lvl10.spawnPools.afternoon).toContain('zlatohlavek');
    expect(lvl10.spawnPools.dusk).toContain('zitna_baba');
  });

  it('defines Stage 12 (ID 11: Vavřinecká noc) with Perseid meteor shower, Netopýr ušatec, Noční můra, and Výr velký', () => {
    const lvl11 = GAME_LEVELS[11];
    expect(lvl11).toBeDefined();
    expect(lvl11.id).toBe(11);
    expect(lvl11.name).toContain('Vavřinecká noc');
    expect(lvl11.shortTitle).toBe('Vavřinecká noc');
    expect(lvl11.badge).toBe('12. Úroveň');
    expect(lvl11.arena.id).toBe('vavrinecka_noc');

    expect(lvl11.miniBoss).toMatchObject({ id: 'netopyr_usatec', time: 85, kills: 110 });
    expect(lvl11.midBoss).toMatchObject({ id: 'nocni_mura', time: 185, kills: 250 });
    expect(lvl11.finalBoss).toMatchObject({ id: 'vyr_velky', time: 300, kills: 410 });

    expect(lvl11.spawnPools.noon).toContain('nocni_mura');
    expect(lvl11.spawnPools.night).toContain('cerny_vlkodlak');
    expect(lvl11.spawnPools.midnight).toContain('cert_sekac');
    expect(lvl11.spawnPools.midnight).toContain('bezhlavy_rytir');
  });

  it('gates Stage 11 behind Stage 10 (Drak) and Stage 12 behind Stage 11 (Dožínkový chasník)', () => {
    expect(LEVEL_UNLOCKS[10]).toBeDefined();
    expect(LEVEL_UNLOCKS[11]).toBeDefined();

    expect(getLevelProgress(10, { completedLevels: {} }).isUnlocked).toBe(false);
    expect(getLevelProgress(10, { completedLevels: { 9: true } }).isUnlocked).toBe(true);

    expect(getLevelProgress(11, { completedLevels: { 9: true } }).isUnlocked).toBe(false);
    expect(getLevelProgress(11, { completedLevels: { 9: true, 10: true } }).isUnlocked).toBe(true);
  });

  it('includes trophies for completing Level 10 and Level 11', () => {
    const trophy10 = TROPHIES.find((t) => t.id === 'level10_completed');
    const trophy11 = TROPHIES.find((t) => t.id === 'level11_completed');

    expect(trophy10).toBeDefined();
    expect(trophy10?.title).toContain('srpnových dožínek');
    expect(trophy10?.isMet({ completedLevels: { 10: true } } as any)).toBe(true);
    expect(trophy10?.isMet({ completedLevels: {} } as any)).toBe(false);

    expect(trophy11).toBeDefined();
    expect(trophy11?.title).toContain('Výra velkého');
    expect(trophy11?.isMet({ completedLevels: { 11: true } } as any)).toBe(true);
    expect(trophy11?.isMet({ completedLevels: { 10: true } } as any)).toBe(false);
  });

  it('includes all August enemies and bosses in ENEMIES database with proper stats and lore', () => {
    const srpnoveCmelak = ENEMIES.srpnove_cmelak;
    const zlatohlavek = ENEMIES.zlatohlavek;
    const polniMysice = ENEMIES.polni_mysice;
    const kralovskyCmelak = ENEMIES.kralovsky_cmelak;
    const zlatohlavekZrout = ENEMIES.zlatohlavek_zrout;
    const dozinkovyChasnik = ENEMIES.dozinkovy_chasnik;
    const netopyrUsatec = ENEMIES.netopyr_usatec;
    const vyrVelky = ENEMIES.vyr_velky;

    expect(srpnoveCmelak).toBeDefined();
    expect(srpnoveCmelak.isFlying).toBe(true);
    expect(zlatohlavek).toBeDefined();
    expect(polniMysice).toBeDefined();
    expect(kralovskyCmelak).toBeDefined();
    expect(kralovskyCmelak.category).toBe('bosses');
    expect(zlatohlavekZrout).toBeDefined();
    expect(zlatohlavekZrout.category).toBe('bosses');
    expect(dozinkovyChasnik).toBeDefined();
    expect(dozinkovyChasnik.category).toBe('bosses');
    expect(netopyrUsatec).toBeDefined();
    expect(netopyrUsatec.category).toBe('bosses');
    expect(vyrVelky).toBeDefined();
    expect(vyrVelky.category).toBe('bosses');
  });

  it('provides solid obstacles in Srpen arena preventing walking into bread oven, wagon, or haystacks', () => {
    expect(SRPEN_SPECIAL_OBSTACLES.length).toBeGreaterThanOrEqual(6);
    expect(SRPEN_SPECIAL_OBSTACLES.some((o) => o.id === 'chlebova_pec_budka')).toBe(true);
    expect(SRPEN_SPECIAL_OBSTACLES.some((o) => o.id === 'dozinkovy_zebrinak')).toBe(true);
    expect(SRPEN_SPECIAL_OBSTACLES.some((o) => o.id === 'stoh_slamy_1')).toBe(true);

    const oven = SRPEN_SPECIAL_OBSTACLES.find((o) => o.id === 'chlebova_pec_budka')!;
    const entity = { x: oven.x, y: oven.y, radius: 18 };
    const collided = resolveSrpenObstacles(entity, false);
    expect(collided).toBe(true);
    expect(Math.hypot(entity.x - oven.x, entity.y - oven.y)).toBeGreaterThan(20);
  });

  it('renders all August enemies and landscape elements on canvas without throwing', () => {
    const ctx = createMockCanvasContext();

    expect(() => Lada.drawSrpnoveCmelak(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawZlatohlavek(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawPolniMysice(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawKralovskyCmelak(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawZlatohlavekZrout(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawDozinkovyChasnik(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawNetopyrUsatec(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawNocniMura(ctx, 0, 0, 1, 1, 0)).not.toThrow();
    expect(() => Lada.drawVyrVelky(ctx, 0, 0, 1, 1, 0)).not.toThrow();

    // Landscape decoration
    expect(() => drawSrpenDecoration(ctx, { type: 'srpen_border' }, 1.0, false)).not.toThrow();
    expect(() => drawSrpenDecoration(ctx, { type: 'srpen_border' }, 1.0, true)).not.toThrow();
  });

  it('initializes and updates bread oven state and St. Lawrence bonfire state', () => {
    const pec = createInitialChlebovaPecState();
    expect(pec.radius).toBeGreaterThan(100);
    expect(pec.cooldown).toBe(0);

    const vatra = createInitialVavrineckaVatra();
    expect(vatra.radius).toBeGreaterThan(100);
    expect(vatra.shootingStarTimer).toBeGreaterThan(0);
  });

  it('correctly reports day and night phases for Stage 11 and Stage 12', () => {
    const stage11Phase = getCurrentDayPhase(0, 10);
    expect(stage11Phase.id).toBe('noon');

    const stage12Phase = getCurrentDayPhase(0, 11);
    expect(stage12Phase.id).toBe('dusk');
  });

  it('handles Stage 11 Chlebová pec [E] interaction in GameEngine update loop', () => {
    const engine = new GameEngine();
    engine.initRun(10, 'wanderer');
    const player = engine.state.player!;

    // Position player inside village POI
    player.x = SRPEN_POIS.village.x;
    player.y = SRPEN_POIS.village.y;
    player.hp = 50;

    // Press [E]
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(engine.srpen.chlebovaPec.cooldown).toBeGreaterThan(15);
    expect(engine.srpen.chlebovaPec.buffTimer).toBeGreaterThan(15);
    expect(engine.srpen.chlebovaPec.breadsBaked).toBe(1);
    expect(player.hp).toBeGreaterThan(50);
  });

  it('handles Stage 12 Vavřinecká vatra [E] interaction and Perseid falling stars in GameEngine', () => {
    const engine = new GameEngine();
    engine.initRun(11, 'wanderer');
    const player = engine.state.player!;

    // Position player at Vavřinecká vatra
    player.x = engine.srpen.vatra.x;
    player.y = engine.srpen.vatra.y;

    // Press [E]
    engine.state.keys = { e: true };
    engine.update(0.1);

    expect(engine.srpen.vatra.cooldown).toBeGreaterThan(15);
    expect(engine.srpen.vatra.litTimer).toBeGreaterThan(15);
    expect(player.tempShield).toBeGreaterThan(0);

    // Fast-forward shootingStarTimer to trigger a star warning
    engine.state.keys = {};
    engine.srpen.vatra.shootingStarTimer = 0.05;
    engine.update(0.1);

    expect(engine.srpen.vatra.starWarning).toBeDefined();
    expect(engine.srpen.vatra.starWarning?.radius).toBeGreaterThan(0);
  });
});
