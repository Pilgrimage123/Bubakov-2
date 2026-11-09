import { describe, it, expect } from 'vitest';
import {
  drawDrawnEnemyStatusEffects,
  drawHunterDesperateKurazFx,
} from '../src/render/ladaRenderer';
import { renderStorybookLightingComposite } from '../src/render/storybookLightingRenderer';

describe('Kreslené stavové efekty a knižní viněta Kuráže (ADR 0047, Ticket 06)', () => {
  describe('drawDrawnEnemyStatusEffects (bez RGB tintu)', () => {
    it('renders physical hanging icicles for frozen enemies', () => {
      const mockEnemy: any = {
        isFrozen: true,
        dead: false,
        isDefeated: false,
      };

      const fillStyles: string[] = [];
      const strokeStyles: string[] = [];
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        set fillStyle(v: string) { fillStyles.push(v); },
        get fillStyle() { return fillStyles[fillStyles.length - 1] || ''; },
        set strokeStyle(v: string) { strokeStyles.push(v); },
        get strokeStyle() { return strokeStyles[strokeStyles.length - 1] || ''; },
        set lineWidth(_v: number) {},
      };

      drawDrawnEnemyStatusEffects(mockCtx, 100, 100, mockEnemy, 1, 0, 24);

      // Light sky blue icicles
      expect(fillStyles.some(f => f === '#BAE6FD')).toBe(true);
      // Dark calligraphic ink stroke
      expect(strokeStyles.some(s => s === '#26150C')).toBe(true);
    });

    it('renders rising embers and soot hatching for burning enemies', () => {
      const mockEnemy: any = {
        isBurning: true,
        dead: false,
        isDefeated: false,
      };

      const fillStyles: string[] = [];
      const strokeStyles: string[] = [];
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        set fillStyle(v: string) { fillStyles.push(v); },
        get fillStyle() { return fillStyles[fillStyles.length - 1] || ''; },
        set strokeStyle(v: string) { strokeStyles.push(v); },
        get strokeStyle() { return strokeStyles[strokeStyles.length - 1] || ''; },
        set lineWidth(_v: number) {},
      };

      drawDrawnEnemyStatusEffects(mockCtx, 100, 100, mockEnemy, 1, 0, 24);

      // Embers in pekelná rumělka and sulfur yellow
      expect(fillStyles.some(f => f === '#E62A19')).toBe(true);
      expect(fillStyles.some(f => f === '#FEF08A')).toBe(true);
      // Soot hatching
      expect(strokeStyles.some(s => s.includes('30, 27, 24'))).toBe(true);
    });

    it('renders mud and beer foam drops for slowed enemies', () => {
      const mockEnemy: any = {
        slowTimer: 1.5,
        dead: false,
        isDefeated: false,
      };

      const fillStyles: string[] = [];
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        set fillStyle(v: string) { fillStyles.push(v); },
        get fillStyle() { return fillStyles[fillStyles.length - 1] || ''; },
        set strokeStyle(_v: string) {},
        set lineWidth(_v: number) {},
      };

      drawDrawnEnemyStatusEffects(mockCtx, 100, 100, mockEnemy, 1, 0, 24);

      // Beer foam (#FEF08A) or mud ochre (#78350F)
      expect(fillStyles.some(f => f === '#FEF08A' || f === '#78350F')).toBe(true);
    });
  });

  describe('drawHunterDesperateKurazFx (Zoufalá kuráž <35%)', () => {
    it('renders sweat drops and pipe smoke puff when kurazRatio < 0.35', () => {
      const fillStyles: string[] = [];
      let arcsDrawn = 0;
      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => { arcsDrawn++; },
        moveTo: () => {},
        lineTo: () => {},
        fill: () => {},
        stroke: () => {},
        set fillStyle(v: string) { fillStyles.push(v); },
        get fillStyle() { return fillStyles[fillStyles.length - 1] || ''; },
        set strokeStyle(_v: string) {},
        set lineWidth(_v: number) {},
        set globalAlpha(_v: number) {},
      };

      drawHunterDesperateKurazFx(mockCtx, 200, 200, 1, 0, 0.20);

      expect(arcsDrawn).toBeGreaterThan(3);
      // Cyan sweat drops
      expect(fillStyles.some(f => f === '#67E8F9')).toBe(true);
      // Light pipe smoke
      expect(fillStyles.some(f => f === '#F1F5F9')).toBe(true);
    });

    it('does not render when kurazRatio >= 0.35', () => {
      let drawn = false;
      const mockCtx: any = {
        save: () => { drawn = true; },
      };

      drawHunterDesperateKurazFx(mockCtx, 200, 200, 1, 0, 0.50);
      expect(drawn).toBe(false);
    });
  });

  describe('Knižní viněta staré vazby v Storybook lighting (<35% Kuráže)', () => {
    it('renders corner bookbinding pencil hatching and sepia vignette under 35% Kuráž', () => {
      let cornerLinesDrawn = 0;
      let gradFillDrawn = false;
      const strokeStyles: string[] = [];

      const mockGrad = {
        addColorStop: () => {},
      };

      const mockCtx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => { cornerLinesDrawn++; },
        lineTo: () => {},
        stroke: () => {},
        fillRect: () => { gradFillDrawn = true; },
        createRadialGradient: () => mockGrad,
        drawImage: () => {},
        set strokeStyle(v: string) { strokeStyles.push(v); },
        get strokeStyle() { return strokeStyles[strokeStyles.length - 1] || ''; },
        set lineWidth(_v: number) {},
        set fillStyle(_v: any) {},
        set globalCompositeOperation(_v: string) {},
        set imageSmoothingEnabled(_v: boolean) {},
      };

      const camera = { x: 0, y: 0, width: 800, height: 600, viewLeft: 0, viewRight: 800, viewTop: 0, viewBottom: 600 };

      renderStorybookLightingComposite(
        mockCtx,
        800,
        600,
        camera,
        [],
        'noon',
        0.30, // 30% Kuráž (< 35%)
        false
      );

      expect(cornerLinesDrawn).toBeGreaterThan(10); // Corner hatching lines in 4 corners
      expect(gradFillDrawn).toBe(true); // Sepia parchment vignette fill
    });
  });
});
