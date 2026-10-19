import { describe, it, expect, vi } from 'vitest';
import { Lada, drawGingerbreadHeartCanvas } from '../src/render/ladaRenderer';
import { isPernicekIcon } from '../src/components/GameIcon';
import { DamageText } from '../src/game/engine';

describe('Perníčky Denominations & Gingerbread Icon', () => {
  it('correctly identifies perníček icon identifiers', () => {
    expect(isPernicekIcon('gingerbread')).toBe(true);
    expect(isPernicekIcon('pernicek')).toBe(true);
    expect(isPernicekIcon('perníček')).toBe(true);
    expect(isPernicekIcon('pernicky')).toBe(true);
    expect(isPernicekIcon('perníčky')).toBe(true);
    expect(isPernicekIcon('🍪')).toBe(true);
    expect(isPernicekIcon('coin')).toBe(false);
    expect(isPernicekIcon('poutove_srdce')).toBe(false);
  });

  const createMockContext = () => {
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
      bezierCurveTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      strokeText: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 20 }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineJoin: '',
      lineCap: '',
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
      font: '',
      textAlign: 'left',
    } as unknown as CanvasRenderingContext2D;
  };

  it('draws all three denominations in Lada.drawGingerbread without error', () => {
    const mockCtx = createMockContext();

    // Obří perníček: čertovská hlava
    expect(() => {
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'giant', false);
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'giant', true);
    }).not.toThrow();

    // Velký perníček: Ladovský český perníkový panáček
    expect(() => {
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'large', false);
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'large', true);
    }).not.toThrow();

    // Základní perníček: malé jednoduše bíle zdobené perníkové srdíčko
    expect(() => {
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'small', false);
      Lada.drawGingerbread(mockCtx, 100, 100, 1.5, 'small', true);
    }).not.toThrow();
  });

  it('drawGingerbreadHeartCanvas renders the authentic Czech gingerbread heart with icing', () => {
    const mockCtx = createMockContext();
    drawGingerbreadHeartCanvas(mockCtx, 50, 60, 20);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.bezierCurveTo).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
  });

  it('DamageText sanitizes 🍪 and renders gingerbread heart icon on pickup', () => {
    // 1. Explicitní vytvoření s icon: 'gingerbread'
    const dtPickup = new DamageText(100, 100, '+1', '#B45309', true, 'lootResources', 'gingerbread');
    expect(dtPickup.icon).toBe('gingerbread');
    expect(dtPickup.text).toBe('+1');
    expect(dtPickup.category).toBe('lootResources');

    const mockCtx = createMockContext();
    dtPickup.draw(mockCtx);
    expect(mockCtx.measureText).toHaveBeenCalledWith('+1');
    expect(mockCtx.strokeText).toHaveBeenCalledWith('+1', expect.any(Number), expect.any(Number));
    expect(mockCtx.fillText).toHaveBeenCalledWith('+1', expect.any(Number), expect.any(Number));
    // Srdíčko vykresleno pomocí bezier křivek
    expect(mockCtx.bezierCurveTo).toHaveBeenCalled();

    // 2. Automatické zachycení a odstranění emoji 🍪
    const dtLegacy = new DamageText(100, 100, '+6 🍪', '#B45309', true);
    expect(dtLegacy.icon).toBe('gingerbread');
    expect(dtLegacy.text).toBe('+6');
    expect(dtLegacy.text).not.toContain('🍪');
    expect(dtLegacy.category).toBe('lootResources');

    const dtBossDrop = new DamageText(100, 100, '+20 🍪 Obří perník!', '#F59E0B', true);
    expect(dtBossDrop.icon).toBe('gingerbread');
    expect(dtBossDrop.text).toBe('+20 Obří perník!');
    expect(dtBossDrop.text).not.toContain('🍪');
  });
});
