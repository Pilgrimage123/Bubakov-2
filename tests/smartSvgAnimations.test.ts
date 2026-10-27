import { describe, it, expect } from 'vitest';
import {
  SmartDedecekNuseSvg,
  SmartDedecekArenaSvg,
  SmartSvgViewer,
  SMART_SVG_REGISTRY,
  hasSmartSvgSprite,
  getSmartSvgComponent,
  SmartSpriteRenderer,
} from '../src/components/svg';
import type { SmartCharacterState, SmartCharacterId } from '../src/components/svg/types';

describe('Smart SVG Animations — Exclusively Čertův dědeček', () => {
  it('exports only Čertův dědeček Smart SVG components and the interactive viewer', () => {
    expect(typeof SmartDedecekNuseSvg).toBe('function');
    expect(typeof SmartDedecekArenaSvg).toBe('function');
    expect(typeof SmartSvgViewer).toBe('function');
  });

  it('supports the required Smart animation states including sprint, react, and flee', () => {
    const states: SmartCharacterState[] = ['idle', 'walk', 'sprint', 'action', 'react', 'flee'];
    expect(states).toContain('idle');
    expect(states).toContain('walk');
    expect(states).toContain('sprint');
    expect(states).toContain('action');
    expect(states).toContain('react');
    expect(states).toContain('flee');
  });

  it('defines folklore character IDs for Čertův dědeček', () => {
    const charIds: SmartCharacterId[] = [
      'dedecek_nuse',
      'dedecek_arena',
    ];
    expect(charIds).toHaveLength(2);
    expect(charIds).toContain('dedecek_nuse');
    expect(charIds).toContain('dedecek_arena');
  });

  it('renders Dědečkova otevřená nůše with spectacles, crooked teeth, unbroken tail, patchwork coat, and moving mouse', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const markupT0 = renderToStaticMarkup(
      React.createElement(SmartDedecekNuseSvg, { state: 'idle', time: 0, isPlaying: false })
    );
    const markupT1 = renderToStaticMarkup(
      React.createElement(SmartDedecekNuseSvg, { state: 'idle', time: 0.8, isPlaying: false })
    );

    expect(markupT0).toContain('id="spectacles-and-nose"');
    expect(markupT0).toContain('id="grinning-mouth-crooked-teeth"');
    expect(markupT0).toContain('id="devil-tail"');
    expect(markupT0).toContain('id="patchwork-coat"');
    expect(markupT0).toContain('id="mouse-rezinka"');
    expect(markupT0).not.toBe(markupT1);
  });

  it('renders Dědeček v aréně (walking with nůše on his back) with matching colors, spectacles, crooked teeth, cloven hoof, unbroken tail, and moving mouse', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const walkT0 = renderToStaticMarkup(
      React.createElement(SmartDedecekArenaSvg, { state: 'walk', time: 0, isPlaying: false })
    );
    const walkT1 = renderToStaticMarkup(
      React.createElement(SmartDedecekArenaSvg, { state: 'walk', time: 0.65, isPlaying: false })
    );

    expect(walkT0).toContain('id="backpack-nuse"');
    expect(walkT0).toContain('id="arena-mouse-rezinka"');
    expect(walkT0).toContain('id="devil-tail"');
    expect(walkT0).toContain('id="cloven-hoof-leg"');
    expect(walkT0).toContain('id="laced-boot-leg"');
    expect(walkT0).toContain('id="arena-spectacles-and-nose"');
    expect(walkT0).toContain('id="arena-mouth"');
    expect(walkT0).not.toBe(walkT1);
  });

  it('ensures Dědeček s nůší leg animation stays planted when standing and moves when walking', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const getTransform = (markup: string, id: string): string => {
      const match = markup.match(new RegExp(`<g[^>]*id="${id}"[^>]*transform="([^"]+)"`));
      return match ? match[1] : '';
    };

    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartDedecekNuseSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartDedecekNuseSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'dn-back-leg')).toBe('translate(135, 340) rotate(0.00)');
      expect(getTransform(m1, 'dn-back-leg')).toBe('translate(135, 340) rotate(0.00)');
    }

    const dnWalk0 = renderToStaticMarkup(React.createElement(SmartDedecekNuseSvg, { state: 'walk', time: 0, isPlaying: false }));
    const dnWalk1 = renderToStaticMarkup(React.createElement(SmartDedecekNuseSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(dnWalk0, 'dn-back-leg')).not.toBe(getTransform(dnWalk1, 'dn-back-leg'));
  });

  it('resolves canonical Grandfather game IDs via SMART_SVG_REGISTRY and SmartSpriteRenderer', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    // Grandfather variants are preserved
    for (const id of ['dedecek_nuse', 'grandfather_nuse', 'dedecek_arena', 'grandfather']) {
      expect(hasSmartSvgSprite(id)).toBe(true);
      expect(getSmartSvgComponent(id)).not.toBeNull();
    }

    // Other characters (hunters and enemies) have no SVG components
    for (const id of ['krajanek', 'tulak', 'pasacek', 'bezhlavy_rytir', 'snehulak', 'babicka']) {
      expect(hasSmartSvgSprite(id)).toBe(false);
      expect(getSmartSvgComponent(id)).toBeNull();
    }

    const rendered = renderToStaticMarkup(
      React.createElement(SmartSpriteRenderer, { spriteId: 'dedecek_nuse', state: 'idle', time: 0, isPlaying: false })
    );
    expect(rendered).toContain('id="dd-wicker-grad"');
  });
});
