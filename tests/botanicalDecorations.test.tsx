import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LadaFolkFlower,
  LadaHudBotanicalDecor,
  LadaFloralGarland,
} from '../src/components/LadaHudBotanicalDecor';
import { LadaBotanicalFlourish } from '../src/components/LadaBotanicalFlourish';
import { LadaCardCorners } from '../src/components/LadaCardCorners';
import { LadaCartouche } from '../src/components/LadaCartouche';
import { LadaFrieze } from '../src/components/LadaFrieze';

describe('Ladovské botanické dekorace a animované květy v menu a HUDu', () => {
  it('vykresluje LadaFolkFlower ve všech 5 autentických ladovských barvách (blatouch, mák, chrpa, karmín, kopretina)', () => {
    // 1. Buttercup (blatouch žlutý)
    const buttercup = renderToStaticMarkup(<LadaFolkFlower variant="buttercup" size={20} spin />);
    expect(buttercup).toContain('fill="#FACC15"'); // petal
    expect(buttercup).toContain('fill="#EA580C"'); // core
    expect(buttercup).toContain('lada-hud-blossom');

    // 2. Poppy (vlčí mák červený)
    const poppy = renderToStaticMarkup(<LadaFolkFlower variant="poppy" size={20} spin="reverse" />);
    expect(poppy).toContain('fill="#E6392B"');
    expect(poppy).toContain('lada-hud-blossom-rev');

    // 3. Cornflower (modrá chrpa)
    const cornflower = renderToStaticMarkup(<LadaFolkFlower variant="cornflower" size={18} />);
    expect(cornflower).toContain('fill="#38BDF8"');
    expect(cornflower).toContain('lada-hud-bloom');

    // 4. Carmine (karmínová růžička)
    const carmine = renderToStaticMarkup(<LadaFolkFlower variant="carmine" size={16} withLeaves={false} />);
    expect(carmine).toContain('fill="#E11D48"');
    expect(carmine).not.toContain('<g class="lada-hud-leaf">');

    // 5. Daisy (bílá kopretina)
    const daisy = renderToStaticMarkup(<LadaFolkFlower variant="daisy" size={22} spin />);
    expect(daisy).toContain('fill="#FFFDF7"');
    expect(daisy).toContain('lada-hud-blossom');
  });

  it('obsahuje transform-box: fill-box a transform-origin: center pro hladkou rotaci a dýchání bez trhání', () => {
    const markup = renderToStaticMarkup(<LadaFolkFlower variant="buttercup" size={20} spin />);
    expect(markup).toContain('transform-box: fill-box');
    expect(markup).toContain('transform-origin: center');
    expect(markup).toContain('ladaHudBlossomSpin');
    expect(markup).toContain('ladaHudBlossomBloom');
    expect(markup).toContain('ladaHudLeafBreathe');
    expect(markup).toContain('prefers-reduced-motion');
  });

  it('vykresluje LadaHudBotanicalDecor s levým i pravým úponkem a kvetoucími kvítky', () => {
    const hudMarkup = renderToStaticMarkup(<LadaHudBotanicalDecor />);
    expect(hudMarkup).toContain('lada-hud-vine-l');
    expect(hudMarkup).toContain('lada-hud-vine-r');
    expect(hudMarkup).toContain('lada-hud-blossom');
    expect(hudMarkup).toContain('lada-hud-leaf');
    expect(hudMarkup).toContain('fill="#38BDF8"'); // forget-me-not blue
    expect(hudMarkup).toContain('fill="#FACC15"'); // buttercup gold
    expect(hudMarkup).toContain('fill="#E11D48"'); // carmine rose
  });

  it('vykresluje LadaFloralGarland s vlnícími se stonky a střídajícími se kvítky', () => {
    const garland = renderToStaticMarkup(<LadaFloralGarland repeatCount={7} height={24} />);
    expect(garland).toContain('lada-floral-garland');
    expect(garland).toContain('lada-garland-item');
    expect(garland).toContain('lada-hud-blossom');
    expect(garland).toContain('lada-hud-blossom-rev');
  });

  it('vykresluje LadaBotanicalFlourish s kvetoucími poupaty a transform-box pravidly', () => {
    const flourish = renderToStaticMarkup(<LadaBotanicalFlourish height={20} />);
    expect(flourish).toContain('lada-botanical-flourish');
    expect(flourish).toContain('lada-fl-branch-l');
    expect(flourish).toContain('lada-fl-branch-r');
    expect(flourish).toContain('lada-fl-bud');
    expect(flourish).toContain('lada-fl-center');
    expect(flourish).toContain('transform-box: fill-box');
  });

  it('vykresluje LadaCardCorners se 4 animovanými rohy a variantami (default, selected, locked, callout)', () => {
    const cornersDefault = renderToStaticMarkup(<LadaCardCorners variant="default" showBottomCorners={true} />);
    expect(cornersDefault).toContain('lada-corner-flower-tl');
    expect(cornersDefault).toContain('lada-corner-flower-tr');
    expect(cornersDefault).toContain('lada-corner-rose-bl');
    expect(cornersDefault).toContain('lada-corner-rose-br');
    expect(cornersDefault).toContain('transform-box: fill-box');

    const cornersSelected = renderToStaticMarkup(<LadaCardCorners variant="selected" showBottomCorners={true} />);
    expect(cornersSelected).toContain('#FEF08A'); // brighter yellow when selected

    const cornersLocked = renderToStaticMarkup(<LadaCardCorners variant="locked" showBottomCorners={true} />);
    expect(cornersLocked).toContain('#E2C872'); // muted ochre when locked
  });

  it('vykresluje LadaCartouche s oboustranně animovanými kvítky', () => {
    const cartouche = renderToStaticMarkup(
      <LadaCartouche variant="green" size="md">
        <span>TEST NÁPIS</span>
      </LadaCartouche>
    );
    expect(cartouche).toContain('lada-cartouche-flower-l');
    expect(cartouche).toContain('lada-cartouche-flower-r');
    expect(cartouche).toContain('transform-box: fill-box');
    expect(cartouche).toContain('TEST NÁPIS');
  });

  it('vykresluje LadaFrieze s kvetoucími kvítky a obloučkovým vlysem', () => {
    const frieze = renderToStaticMarkup(<LadaFrieze repeatCount={12} height={20} />);
    expect(frieze).toContain('lada-frieze-wrap');
    expect(frieze).toContain('lada-scallop-anim');
    expect(frieze).toContain('lada-frieze-flower');
    expect(frieze).toContain('transform-box: fill-box');
  });
});
