import { describe, it, expect, beforeEach } from 'vitest';
import { computeEntityIllumination, type DynamicLightSource } from '../src/game/storybookLighting';
import { Lada } from '../src/render/ladaRenderer';
import { ArenaRenderer } from '../src/render/arenaRenderer';
import { COLORS } from '../src/constants';

describe('Noční konturová inverze (ADR 0046, Ticket 04)', () => {
  beforeEach(() => {
    Lada.currentRole = 'neutral';
    Lada.nightInversionRatio = 0;
    Lada.isCrowded = false;
  });

  describe('computeEntityIllumination', () => {
    const petrolejka: DynamicLightSource = {
      id: 'player_petrolejka',
      x: 100,
      y: 100,
      radius: 100,
      intensity: 1,
      color: '#FEF08A',
    };

    it('returns 1.0 in noon daylight without shadow zones', () => {
      expect(computeEntityIllumination(500, 500, [], 'noon')).toBe(1.0);
    });

    it('returns 0.0 in deep darkness at night outside any light source', () => {
      expect(computeEntityIllumination(500, 500, [petrolejka], 'night')).toBe(0.0);
    });

    it('returns 1.0 inside inner reach (<= 70% radius) of petrolejka at night', () => {
      // 50px away from (100, 100), reach is 100px -> 50% <= 70%
      expect(computeEntityIllumination(150, 100, [petrolejka], 'night')).toBe(1.0);
    });

    it('provides a smooth continuous transition between inner reach and edge of light at night', () => {
      // 85px away (between 70px and 100px)
      const factor = computeEntityIllumination(185, 100, [petrolejka], 'night');
      expect(factor).toBeGreaterThan(0.0);
      expect(factor).toBeLessThan(1.0);
      expect(factor).toBeCloseTo((100 - 85) / (100 - 70), 2); // 15 / 30 = 0.5
    });
  });

  describe('Lada Chalk Contour Inversion (1.5px chalk-white linka)', () => {
    it('uses standard black ink and 2.75px width when fully illuminated (ratio = 0)', () => {
      Lada.currentRole = 'enemy';
      Lada.nightInversionRatio = 0;

      const stroke = Lada.getContourStroke(COLORS.ink);
      const width = Lada.getContourWidth(4, false);

      expect(stroke).toBe(COLORS.ink);
      expect(width).toBeCloseTo(2.75, 2);
    });

    it('inverts to chalk cream and 1.5px width in deep darkness (ratio = 1)', () => {
      Lada.currentRole = 'enemy';
      Lada.nightInversionRatio = 1.0;

      const stroke = Lada.getContourStroke(COLORS.ink);
      const width = Lada.getContourWidth(4, false);

      // Final step in CHALK_CONTOUR_COLORS is rgb(255,251,235)
      expect(stroke).toBe('rgb(255,251,235)');
      expect(width).toBeCloseTo(1.5, 2);
    });

    it('smoothly interpolates contour stroke and width at boundary (ratio = 0.5)', () => {
      Lada.currentRole = 'enemy';
      Lada.nightInversionRatio = 0.5;

      const stroke = Lada.getContourStroke(COLORS.ink);
      const width = Lada.getContourWidth(4, false);

      // Width between 2.75 and 1.5 is 2.125
      expect(width).toBeCloseTo(2.125, 2);
      expect(stroke).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
      expect(stroke).not.toBe(COLORS.ink);
      expect(stroke).not.toBe('rgb(255,251,235)');
    });

    it('scales inner detail line to 0.85px in deep darkness', () => {
      Lada.currentRole = 'enemy';
      Lada.nightInversionRatio = 1.0;

      const detailWidth = Lada.getContourWidth(1, true);
      expect(detailWidth).toBeCloseTo(0.85, 2);
    });

    it('sets strokeStyle and lineWidth in setupPath according to night inversion', () => {
      Lada.currentRole = 'enemy';
      Lada.nightInversionRatio = 1.0;

      const mockCtx: any = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineJoin: '',
        lineCap: '',
      };

      Lada.setupPath(mockCtx, '#FFF', COLORS.ink, 4, false);

      expect(mockCtx.strokeStyle).toBe('rgb(255,251,235)');
      expect(mockCtx.lineWidth).toBeCloseTo(1.5, 2);
    });
  });

  describe('ArenaRenderer night inversion assignment', () => {
    it('assigns _illumination and _nightInversionRatio to visible enemies in night phase', () => {
      const renderer = new ArenaRenderer();
      const mockEnemy: any = {
        id: 'certik',
        x: 600,
        y: 400,
        radius: 20,
        dead: false,
        draw: () => {},
      };
      const mockEngine: any = {
        player: { x: 100, y: 100, radius: 24, draw: () => {} },
        enemies: [mockEnemy],
        lightSources: [
          { id: 'petrolejka', x: 100, y: 100, radius: 80, intensity: 1 },
        ],
        shadowZones: [],
        occluders: [],
        currentLevel: { id: 2, season: 'winter' },
        dayPhase: { id: 'night', name: 'Noc' },
      };
      const mockCamera = {
        x: 0,
        y: 0,
        width: 1200,
        height: 900,
        viewLeft: 0,
        viewRight: 1200,
        viewTop: 0,
        viewBottom: 900,
      };
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        drawImage: () => {},
        beginPath: () => {},
        stroke: () => {},
        fill: () => {},
        clearRect: () => {},
        fillRect: () => {},
      };

      renderer.renderArena(mockCtx, mockEngine, mockCamera, { lightingEnabled: false, combatVfxEnabled: false });

      // Certik at (600, 400) is far from light at (100, 100) -> in deep darkness
      expect(mockEnemy._illumination).toBe(0.0);
      expect(mockEnemy._nightInversionRatio).toBe(1.0);
    });
  });
});
