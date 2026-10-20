import { describe, it, expect } from 'vitest';

export function calculateCanvasDimensions(
  windowWidth: number,
  windowHeight: number,
  profile: 'performance' | 'balanced' | 'fidelity'
): { width: number; height: number; scale: number } {
  const scale = profile === 'performance' ? 0.75 : 1.0;
  return {
    width: Math.round(windowWidth * scale),
    height: Math.round(windowHeight * scale),
    scale,
  };
}

export function mapPointerEventToCanvasCoordinates(
  clientX: number,
  clientY: number,
  canvasRect: { left: number; top: number; width: number; height: number },
  canvasInternalWidth: number,
  canvasInternalHeight: number
): { x: number; y: number } {
  const x = (clientX - canvasRect.left) * (canvasInternalWidth / canvasRect.width);
  const y = (clientY - canvasRect.top) * (canvasInternalHeight / canvasRect.height);
  return { x, y };
}

describe('Úsporný profil obrazu & Canvas geometrie (Plan Section 5)', () => {
  it('applies 0.75x internal downscaling in performance mode and 1.0x in balanced/fidelity', () => {
    const desktopPerf = calculateCanvasDimensions(1920, 1080, 'performance');
    expect(desktopPerf.width).toBe(1440);
    expect(desktopPerf.height).toBe(810);
    expect(desktopPerf.scale).toBe(0.75);

    const desktopBalanced = calculateCanvasDimensions(1920, 1080, 'balanced');
    expect(desktopBalanced.width).toBe(1920);
    expect(desktopBalanced.height).toBe(1080);
    expect(desktopBalanced.scale).toBe(1.0);

    const desktopFidelity = calculateCanvasDimensions(1920, 1080, 'fidelity');
    expect(desktopFidelity.width).toBe(1920);
    expect(desktopFidelity.height).toBe(1080);
    expect(desktopFidelity.scale).toBe(1.0);
  });

  it('correctly maps pointer coordinates on mobile and 4K displays regardless of scale', () => {
    // 1. Mobile screen (e.g. 390x844 physical CSS pixels)
    const mobileRect = { left: 0, top: 0, width: 390, height: 844 };
    const mobileCanvas = calculateCanvasDimensions(390, 844, 'performance');
    // Click at center (195, 422)
    const mobileCoords = mapPointerEventToCanvasCoordinates(
      195,
      422,
      mobileRect,
      mobileCanvas.width,
      mobileCanvas.height
    );
    expect(mobileCoords.x).toBeCloseTo(mobileCanvas.width / 2, 1);
    expect(mobileCoords.y).toBeCloseTo(mobileCanvas.height / 2, 1);

    // 2. 4K screen (3840x2160)
    const uhdRect = { left: 0, top: 0, width: 3840, height: 2160 };
    const uhdCanvas = calculateCanvasDimensions(3840, 2160, 'performance');
    expect(uhdCanvas.width).toBe(2880);
    expect(uhdCanvas.height).toBe(1620);
    // Click at corner (3840, 2160)
    const uhdCoords = mapPointerEventToCanvasCoordinates(
      3840,
      2160,
      uhdRect,
      uhdCanvas.width,
      uhdCanvas.height
    );
    expect(uhdCoords.x).toBe(2880);
    expect(uhdCoords.y).toBe(1620);
  });
});
