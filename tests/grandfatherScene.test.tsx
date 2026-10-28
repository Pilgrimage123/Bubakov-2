import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GrandfatherScene } from '../src/components/GrandfatherScene';
import { LadaGrandfatherCanvasPreview } from '../src/components/LadaGrandfatherCanvasPreview';

describe('Grandfather Scene & Canvas Preview Stability', () => {
  it('renders LadaGrandfatherCanvasPreview as an HTML5 canvas element with correct dimensions', () => {
    const html = renderToStaticMarkup(
      <LadaGrandfatherCanvasPreview size={100} isInteracting={true} />
    );
    expect(html).toContain('<canvas');
    expect(html).toContain('width="100"');
    expect(html).toContain('height="100"');
  });

  it('renders GrandfatherScene cleanly across all interaction states without SVG relics', () => {
    const states = ['idle', 'reaching', 'pulling', 'rerolling', 'purchasing'] as const;

    for (const state of states) {
      const htmlDesktop = renderToStaticMarkup(
        <GrandfatherScene mode="desktop" state={state} />
      );
      expect(htmlDesktop).toContain('<canvas');
      expect(htmlDesktop).toContain('width="380"');
      expect(htmlDesktop).toContain('height="330"');
      expect(htmlDesktop).toContain('Rézinka hlídá perníčky');
      // Must not contain any legacy Smart SVG element or namespace
      expect(htmlDesktop).not.toContain('<svg class="smart-character');
      expect(htmlDesktop).not.toContain('SmartDedecek');

      const htmlMobile = renderToStaticMarkup(
        <GrandfatherScene mode="mobile" state={state} />
      );
      expect(htmlMobile).toContain('<canvas');
      expect(htmlMobile).toContain('width="320"');
      expect(htmlMobile).toContain('height="280"');
    }
  });

  it('renders active item banner when activeItemName and activeItemIcon are supplied', () => {
    const html = renderToStaticMarkup(
      <GrandfatherScene
        state="idle"
        activeItemName="Čerstvý perníček"
        activeItemIcon="pernicek"
      />
    );
    expect(html).toContain('Čerstvý perníček');
  });
});
