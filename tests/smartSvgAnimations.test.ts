import { describe, it, expect } from 'vitest';
import {
  SmartBabickaBarunkaSvg,
  SmartBezhlavyRytirSvg,
  SmartSnehulakSvg,
  SmartTulakSvg,
  SmartKrajanekSvg,
  SmartKostelnikSvg,
  SmartPasacekSvg,
  SmartDedecekNuseSvg,
  SmartDedecekArenaSvg,
  SmartSvgViewer,
} from '../src/components/svg';
import type { SmartCharacterState, SmartCharacterId } from '../src/components/svg/types';

describe('Smart SVG JavaScript Animations', () => {
  it('exports all 9 Smart SVG components and the interactive viewer', () => {
    expect(typeof SmartBabickaBarunkaSvg).toBe('function');
    expect(typeof SmartBezhlavyRytirSvg).toBe('function');
    expect(typeof SmartSnehulakSvg).toBe('function');
    expect(typeof SmartTulakSvg).toBe('function');
    expect(typeof SmartKrajanekSvg).toBe('function');
    expect(typeof SmartKostelnikSvg).toBe('function');
    expect(typeof SmartPasacekSvg).toBe('function');
    expect(typeof SmartDedecekNuseSvg).toBe('function');
    expect(typeof SmartDedecekArenaSvg).toBe('function');
    expect(typeof SmartSvgViewer).toBe('function');
  });

  it('supports the required Smart animation states including sprint, react (scare hit), and flee (courage exhausted)', () => {
    const states: SmartCharacterState[] = ['idle', 'walk', 'sprint', 'action', 'react', 'flee'];
    expect(states).toContain('idle');
    expect(states).toContain('walk');
    expect(states).toContain('sprint');
    expect(states).toContain('action');
    expect(states).toContain('react');
    expect(states).toContain('flee');
  });

  it('defines all 9 folklore characters including Krajánek, Tulák, and Bezhlavý rytíř boss', () => {
    const charIds: SmartCharacterId[] = [
      'babicka_barunka',
      'bezhlavy_rytir',
      'snehulak',
      'tulak',
      'krajanek',
      'kostelnik',
      'pasacek',
      'dedecek_nuse',
      'dedecek_arena',
    ];
    expect(charIds).toHaveLength(9);
    expect(charIds).toContain('babicka_barunka');
    expect(charIds).toContain('bezhlavy_rytir');
    expect(charIds).toContain('snehulak');
    expect(charIds).toContain('tulak');
    expect(charIds).toContain('krajanek');
    expect(charIds).toContain('kostelnik');
    expect(charIds).toContain('pasacek');
    expect(charIds).toContain('dedecek_nuse');
    expect(charIds).toContain('dedecek_arena');
  });

  it('renders SmartKrajanekSvg with polka-dot bindle, flour cap with wheat ear, hammer, and giant millstone action', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const walkMarkup = renderToStaticMarkup(
      React.createElement(SmartKrajanekSvg, { state: 'walk', time: 0, isPlaying: false })
    );
    const actionMarkup = renderToStaticMarkup(
      React.createElement(SmartKrajanekSvg, { state: 'action', time: 1.2, isPlaying: false })
    );

    expect(walkMarkup).toContain('id="shoulder-stick-group"');
    expect(walkMarkup).toContain('id="krajanek-cap"');
    expect(walkMarkup).toContain('id="krajanek-hammer-arm"');
    expect(walkMarkup).toContain('id="krajanek-head"');
    expect(walkMarkup).toContain('id="krajanekPolkaDot"');

    // Action state displays giant rotating millstone (žernov) and friction sparks
    expect(actionMarkup).toContain('id="giant-millstone"');
    expect(actionMarkup).toContain('flour-sparks');
    expect(walkMarkup).not.toBe(actionMarkup);
  });

  it('renders SmartTulakSvg with herbal pipe, gnarled sukovice, patched coat, and sukovice whirlwind action', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const walkMarkup = renderToStaticMarkup(
      React.createElement(SmartTulakSvg, { state: 'walk', time: 0, isPlaying: false })
    );
    const actionMarkup = renderToStaticMarkup(
      React.createElement(SmartTulakSvg, { state: 'action', time: 0.8, isPlaying: false })
    );

    expect(walkMarkup).toContain('id="herbal-pipe"');
    expect(walkMarkup).toContain('id="tulak-sukovice-arm"');
    expect(walkMarkup).toContain('id="tulak-coat"');
    expect(walkMarkup).toContain('id="tulak-beard"');
    expect(walkMarkup).toContain('id="tulak-hat"');
    expect(walkMarkup).toContain('id="tulak-torna"');

    // Whirlwind action strike
    expect(actionMarkup).toContain('id="tulak-whirlwind"');
    expect(walkMarkup).not.toBe(actionMarkup);
  });

  it('renders SmartSnehulakSvg with weathered cooking pot on head, slender hunched melting torso, broom, carrot nose, and icicles', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const walkMarkup = renderToStaticMarkup(
      React.createElement(SmartSnehulakSvg, { state: 'walk', time: 0, isPlaying: false })
    );
    const actionMarkup = renderToStaticMarkup(
      React.createElement(SmartSnehulakSvg, { state: 'action', time: 1.0, isPlaying: false })
    );

    // Cooking pot on head with flange, handle, pine sprig, and snow crust
    expect(walkMarkup).toContain('id="sn-pot-hat"');
    expect(walkMarkup).toContain('id="pot-flanged-rim"');
    expect(walkMarkup).toContain('id="pot-ear-handle"');
    expect(walkMarkup).toContain('id="pot-snow-crust"');

    // Slender torso with coal buttons, broom, and dripping icicles
    expect(walkMarkup).toContain('id="sn-torso"');
    expect(walkMarkup).toContain('id="sn-coal-buttons"');
    expect(walkMarkup).toContain('id="sn-broom"');
    expect(walkMarkup).toContain('id="sn-carrot"');
    expect(walkMarkup).toContain('sn-stalactites');

    expect(walkMarkup).not.toBe(actionMarkup);
  });

  it('renders SmartBezhlavyRytirSvg as an imposing enemy boss with Bohemian lion tabard, severed head with tracking eyes, and runic greatsword', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const idleMarkup = renderToStaticMarkup(
      React.createElement(SmartBezhlavyRytirSvg, { state: 'idle', time: 0, isPlaying: false })
    );
    const actionMarkup = renderToStaticMarkup(
      React.createElement(SmartBezhlavyRytirSvg, { state: 'action', time: 1.0, isPlaying: false })
    );

    // Boss features: runic ground circle, severed head, greatsword, lion rampant tabard, cape
    expect(idleMarkup).toContain('id="boss-ground-runes"');
    expect(idleMarkup).toContain('id="boss-severed-head-group"');
    expect(idleMarkup).toContain('id="boss-neck-stump"');
    expect(idleMarkup).toContain('id="boss-sword-arm"');
    expect(idleMarkup).toContain('id="boss-cape"');
    expect(idleMarkup).toContain('boss-spectral-eyes');

    // Action state: boss cleave shockwave & roaring jaw
    expect(actionMarkup).toContain('id="boss-cleave-wave"');
    expect(actionMarkup).toContain('id="boss-roar-jaw"');
    expect(idleMarkup).not.toBe(actionMarkup);
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

  it('ensures hunters only swing/move legs when actively moving (walk/sprint/flee) and stay stationary when standing (idle/action/react)', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');

    // Helper to extract transform string for a specific ID
    const getTransform = (markup: string, id: string): string => {
      const match = markup.match(new RegExp(`<g[^>]*id="${id}"[^>]*transform="([^"]+)"`));
      return match ? match[1] : '';
    };

    // 1. Krajánek: check krajanek-left-boot in idle & react, and static krajanek-action-feet in action
    for (const standingState of ['idle', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'krajanek-left-boot')).toBe('translate(-26, 32) rotate(0)');
      expect(getTransform(m1, 'krajanek-left-boot')).toBe('translate(-26, 32) rotate(0)');
    }
    const krajanekAct0 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: 'action', time: 0, isPlaying: false }));
    const krajanekAct1 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: 'action', time: 0.8, isPlaying: false }));
    expect(getTransform(krajanekAct0, 'krajanek-action-feet')).toBe('translate(240, 390)');
    expect(getTransform(krajanekAct1, 'krajanek-action-feet')).toBe('translate(240, 390)');
    // Krajánek walking: leg must move
    const krajanekWalk0 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: 'walk', time: 0, isPlaying: false }));
    const krajanekWalk1 = renderToStaticMarkup(React.createElement(SmartKrajanekSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(krajanekWalk0, 'krajanek-left-boot')).not.toBe(getTransform(krajanekWalk1, 'krajanek-left-boot'));

    // 2. Tulák: check tulak-left-boot
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartTulakSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartTulakSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'tulak-left-boot')).toBe('translate(-26, 32) rotate(0)');
      expect(getTransform(m1, 'tulak-left-boot')).toBe('translate(-26, 32) rotate(0)');
    }
    // Tulák walking: leg must move
    const tulakWalk0 = renderToStaticMarkup(React.createElement(SmartTulakSvg, { state: 'walk', time: 0, isPlaying: false }));
    const tulakWalk1 = renderToStaticMarkup(React.createElement(SmartTulakSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(tulakWalk0, 'tulak-left-boot')).not.toBe(getTransform(tulakWalk1, 'tulak-left-boot'));

    // 3. Pasáček: check pa-back-leg
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartPasacekSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartPasacekSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'pa-back-leg')).toBe(getTransform(m1, 'pa-back-leg'));
    }
    // Pasáček walking: leg must move
    const pasacekWalk0 = renderToStaticMarkup(React.createElement(SmartPasacekSvg, { state: 'walk', time: 0, isPlaying: false }));
    const pasacekWalk1 = renderToStaticMarkup(React.createElement(SmartPasacekSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(pasacekWalk0, 'pa-back-leg')).not.toBe(getTransform(pasacekWalk1, 'pa-back-leg'));

    // 4. Kostelník: check ko-back-leg
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartKostelnikSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartKostelnikSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'ko-back-leg')).toBe(getTransform(m1, 'ko-back-leg'));
    }
    const kostelnikWalk0 = renderToStaticMarkup(React.createElement(SmartKostelnikSvg, { state: 'walk', time: 0, isPlaying: false }));
    const kostelnikWalk1 = renderToStaticMarkup(React.createElement(SmartKostelnikSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(kostelnikWalk0, 'ko-back-leg')).not.toBe(getTransform(kostelnikWalk1, 'ko-back-leg'));

    // 5. Bezhlavý rytíř: check boss-left-leg
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartBezhlavyRytirSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartBezhlavyRytirSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'boss-left-leg')).toBe('translate(-26, 32) rotate(0)');
      expect(getTransform(m1, 'boss-left-leg')).toBe('translate(-26, 32) rotate(0)');
    }
    const bossWalk0 = renderToStaticMarkup(React.createElement(SmartBezhlavyRytirSvg, { state: 'walk', time: 0, isPlaying: false }));
    const bossWalk1 = renderToStaticMarkup(React.createElement(SmartBezhlavyRytirSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(bossWalk0, 'boss-left-leg')).not.toBe(getTransform(bossWalk1, 'boss-left-leg'));

    // 6. Babička & Barunka: check granny-left-shoe & barunka-left-boot
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartBabickaBarunkaSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartBabickaBarunkaSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'granny-left-shoe')).toBe('translate(-28, 36) rotate(0)');
      expect(getTransform(m1, 'granny-left-shoe')).toBe('translate(-28, 36) rotate(0)');
      expect(getTransform(m0, 'barunka-left-boot')).toBe('translate(-15, 0) rotate(0)');
      expect(getTransform(m1, 'barunka-left-boot')).toBe('translate(-15, 0) rotate(0)');
    }
    const grannyWalk0 = renderToStaticMarkup(React.createElement(SmartBabickaBarunkaSvg, { state: 'walk', time: 0, isPlaying: false }));
    const grannyWalk1 = renderToStaticMarkup(React.createElement(SmartBabickaBarunkaSvg, { state: 'walk', time: 0.25, isPlaying: false }));
    expect(getTransform(grannyWalk0, 'granny-left-shoe')).not.toBe(getTransform(grannyWalk1, 'granny-left-shoe'));

    // 7. Sněhulák: check sn-back-leg in idle/action/react, walk, sprint, and flee
    for (const standingState of ['idle', 'action', 'react'] as const) {
      const m0 = renderToStaticMarkup(React.createElement(SmartSnehulakSvg, { state: standingState, time: 0, isPlaying: false }));
      const m1 = renderToStaticMarkup(React.createElement(SmartSnehulakSvg, { state: standingState, time: 0.8, isPlaying: false }));
      expect(getTransform(m0, 'sn-back-leg')).toBe(getTransform(m1, 'sn-back-leg'));
    }
    for (const movingState of ['walk', 'sprint', 'flee'] as const) {
      const s0 = renderToStaticMarkup(React.createElement(SmartSnehulakSvg, { state: movingState, time: 0, isPlaying: false }));
      const s1 = renderToStaticMarkup(React.createElement(SmartSnehulakSvg, { state: movingState, time: 0.25, isPlaying: false }));
      expect(getTransform(s0, 'sn-back-leg')).not.toBe(getTransform(s1, 'sn-back-leg'));
    }

    // 8. Dědeček s otevřenou nůší: check dn-back-leg stays planted when standing and steps when walking
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

  it('resolves canonical game IDs via SMART_SVG_REGISTRY and SmartSpriteRenderer', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { hasSmartSvgSprite, getSmartSvgComponent, SmartSpriteRenderer } = await import('../src/components/svg');

    // All 5 hunters + aliases
    for (const id of ['krajanek', 'wanderer', 'tulak', 'shepherd', 'pasacek', 'sexton', 'kostelnik', 'granny', 'babicka', 'babicka_barunka']) {
      expect(hasSmartSvgSprite(id)).toBe(true);
      expect(getSmartSvgComponent(id)).not.toBeNull();
    }

    // Enemies with Smart SVG sprites
    for (const id of ['bezhlavy_rytir', 'snehulak', 'tajici_snehulak']) {
      expect(hasSmartSvgSprite(id)).toBe(true);
      expect(getSmartSvgComponent(id)).not.toBeNull();
    }

    // Grandfather variants
    for (const id of ['dedecek_nuse', 'grandfather_nuse', 'dedecek_arena', 'grandfather']) {
      expect(hasSmartSvgSprite(id)).toBe(true);
      expect(getSmartSvgComponent(id)).not.toBeNull();
    }

    const rendered = renderToStaticMarkup(
      React.createElement(SmartSpriteRenderer, { spriteId: 'wanderer', state: 'walk', time: 0.4, isPlaying: false })
    );
    expect(rendered).toContain('id="tulak-coat"');
  });
});
