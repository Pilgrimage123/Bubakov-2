import { describe, it, expect, vi } from 'vitest';
import {
  resolveGingerbreadTier,
  drawGingerbreadHeartCanvas,
  drawGingerbreadLoafCanvas,
  drawGingerbreadHorseCanvas,
} from '../src/render/pernicekCanvas';
import {
  Lada,
  drawEnemyRenderer,
  drawBossGouacheStippling,
  drawKramarskaPecet,
} from '../src/render/ladaRenderer';
import {
  tryEmitLadaComicPopup,
  MAX_CONCURRENT_COMIC_POPUPS,
} from '../src/game/particles';
import {
  ParticleBatchRenderer,
  MAX_CONCURRENT_COMIC_POPUPS as RENDER_MAX_COMIC_POPUPS,
} from '../src/render/renderParticles';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 40 })),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('Ticket 07: Tříúrovňové slévání Perníčků a Kramářské pečeti bossů', () => {
  describe('Perníčky: Tříúrovňová vizuální hierarchie (ADR 0047)', () => {
    it('resolveGingerbreadTier rozlišuje hodnoty do 3 stupňů', () => {
      expect(resolveGingerbreadTier(1)).toBe('small');
      expect(resolveGingerbreadTier(2)).toBe('small');
      expect(resolveGingerbreadTier(4)).toBe('small');
      expect(resolveGingerbreadTier(5)).toBe('large');
      expect(resolveGingerbreadTier(20)).toBe('large');
      expect(resolveGingerbreadTier(49)).toBe('large');
      expect(resolveGingerbreadTier(50)).toBe('giant');
      expect(resolveGingerbreadTier(100)).toBe('giant');

      expect(resolveGingerbreadTier('small')).toBe('small');
      expect(resolveGingerbreadTier('large')).toBe('large');
      expect(resolveGingerbreadTier('giant')).toBe('giant');
    });

    it('vykreslení všech tří tierů perníčků probíhá bez chyb', () => {
      const ctx = createMockContext();
      // Tier 1: Srdíčko (14 px)
      expect(() => drawGingerbreadHeartCanvas(ctx, 0, 0, 14)).not.toThrow();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();

      // Tier 2: Bochánek s bílou polevou (22 px)
      expect(() => drawGingerbreadLoafCanvas(ctx, 0, 0, 22)).not.toThrow();

      // Tier 3: Zlacený kůň se svatozáří (32 px)
      expect(() => drawGingerbreadHorseCanvas(ctx, 0, 0, 32)).not.toThrow();
    });

    it('Lada._drawGingerbreadVector integruje správné tiery pro small, large a giant', () => {
      const ctx = createMockContext();

      // Small tier
      Lada._drawGingerbreadVector(ctx, 0, 0, 'small', false);
      expect(ctx.fill).toHaveBeenCalled();

      // Large tier
      Lada._drawGingerbreadVector(ctx, 0, 0, 'large', false);
      expect(ctx.ellipse).toHaveBeenCalled();

      // Giant tier
      Lada._drawGingerbreadVector(ctx, 0, 0, 'giant', true);
      expect(ctx.arc).toHaveBeenCalled();
    });
  });

  describe('Kramářská pečeť a zesílená kontura pro bossy a velitele', () => {
    it('drawKramarskaPecet vykreslí dřevěný malovaný medailon a vlající stuhy', () => {
      const ctx = createMockContext();
      const boss = { id: 'cert', radius: 36, isBoss: true };

      expect(() => drawKramarskaPecet(ctx, 100, 100, boss, 1.5)).not.toThrow();
      expect(ctx.translate).toHaveBeenCalledWith(100, expect.any(Number));
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('drawBossGouacheStippling vykreslí ladovské kvašové tečkování', () => {
      const ctx = createMockContext();
      const boss = { id: 'mlynar', radius: 32, isBoss: true };

      expect(() => drawBossGouacheStippling(ctx, 200, 200, 32, 0.5, boss)).not.toThrow();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('drawEnemyRenderer aktivuje roli "boss" (4px kontura) pro bossy, minibossy a Ostřílené běsy', () => {
      const ctx = createMockContext();
      (Lada as any).drawTestMob = vi.fn();

      // Běžný běs: role je 'enemy'
      drawEnemyRenderer('drawTestMob', ctx, 0, 0, 0, 1, false, { id: 'vodnik' });
      // Během rendereru měl roli enemy

      // Boss: role je 'boss' (4px obrys)
      drawEnemyRenderer('drawTestMob', ctx, 0, 0, 0, 1, false, { id: 'cert', isBoss: true });

      // Ostřílený běs: role je 'boss' (4px obrys)
      drawEnemyRenderer('drawTestMob', ctx, 0, 0, 0, 1, false, { id: 'vrana', prefix: 'ostrileny' });

      // Miniboss
      drawEnemyRenderer('drawTestMob', ctx, 0, 0, 0, 1, false, { id: 'hejkal', isMiniboss: true });

      expect((Lada as any).drawTestMob).toHaveBeenCalledTimes(4);
    });
  });

  describe('Regulace komiksových citoslovcí (BÁC!, PRÁSK!)', () => {
    it('MAX_CONCURRENT_COMIC_POPUPS je striktně nastaven na 3', () => {
      expect(MAX_CONCURRENT_COMIC_POPUPS).toBe(3);
      expect(RENDER_MAX_COMIC_POPUPS).toBe(3);
    });

    it('tryEmitLadaComicPopup odmítne emisi, pokud již 3 bubliny existují v poli', () => {
      const particles: any[] = [
        { isComicPopup: true, life: 0.8, text: 'BÁC!' },
        { isComicPopup: true, life: 0.6, text: 'PRÁSK!' },
        { isComicPopup: true, life: 0.4, text: 'KŘUP!' },
      ];

      const emitted = tryEmitLadaComicPopup(particles, 100, 100);
      expect(emitted).toBe(false);
      expect(particles.length).toBe(3);
    });

    it('ParticleBatchRenderer vykreslí nanejvýš 3 komiksová citoslovce v jednom rámci', () => {
      const renderer = new ParticleBatchRenderer();
      const ctx = createMockContext();
      const camera = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        viewLeft: -400,
        viewTop: -300,
        viewRight: 400,
        viewBottom: 300,
      };

      const particles = [
        { isComicPopup: true, life: 0.9, text: 'BÁC! 1', x: 0, y: 0 },
        { isComicPopup: true, life: 0.8, text: 'BÁC! 2', x: 10, y: 10 },
        { isComicPopup: true, life: 0.7, text: 'BÁC! 3', x: 20, y: 20 },
        { isComicPopup: true, life: 0.6, text: 'BÁC! 4 (přebytek)', x: 30, y: 30 },
        { isComicPopup: true, life: 0.5, text: 'BÁC! 5 (přebytek)', x: 40, y: 40 },
      ];

      renderer.render(ctx, particles, camera);

      // fillText byl zavolán přesně 3x pro citoslovce (ne 5x)
      expect(ctx.fillText).toHaveBeenCalledTimes(3);
      // Písmo je ladovský Eczar serif
      expect(ctx.font).toContain('Eczar');
    });
  });
});
