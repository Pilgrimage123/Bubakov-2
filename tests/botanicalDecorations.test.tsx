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
import {
  BubakovCoverTitle,
  computeBubakCrowChoreography,
  drawBubakAndCrowCoverCanvas,
  computeCertTailFireChoreography,
  drawCertCoverCanvas,
} from '../src/components/BubakovCoverTitle';
import {
  LadaCoverScene,
  computeTavernSceneChoreography,
  drawTavernCoverCanvas,
} from '../src/components/LadaCoverScene';
import {
  LadaStorybookSpread,
  evaluatePaperTurnCurve,
  computePageTurnGeometry,
  computeSingleSheetTurnGeometry,
} from '../src/components/LadaStorybookSpread';
import { ControlsModal } from '../src/components/ControlsModal';
import { BestiaryModal } from '../src/components/BestiaryModal';
import { ArsenalModal } from '../src/components/ArsenalModal';
import type { MetaProgression } from '../src/types';

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

  it('vykresluje BubakovCoverTitle s 2D canvas animací strašáka Bubáka i čertíka vedle hlavního nápisu bez ořezu na mobilu i desktopu', () => {
    const html = renderToStaticMarkup(<BubakovCoverTitle showCharacters={true} />);
    expect(html).toContain('id="lada-cover-strasak"');
    expect(html).toContain('data-testid="bubak-crow-canvas"');
    expect(html).toContain('Strašák Bubák a strakatá vrána šedivka');
    expect(html).toContain('id="lada-cover-cert"');
    expect(html).toContain('data-testid="cert-tail-fire-canvas"');
    expect(html).toContain('Čertík s hořícím ocasem');
    expect(html).toContain('id="bubakov-sub-ornament"');
    expect(html).toContain('viewBox="-20 -48 900 252"');
    expect(html).toContain('aspect-[900/252]');
    expect(html).toContain('left:0%;top:0%;width:25%;height:100%');
    expect(html).toContain('left:75%;top:0%;width:25%;height:100%');
  });

  it('plynule animuje choreografii černobílé vrány (obtěžování, přistání na hlavě, posmívání a rozzuřený křik Bubáka) bez ořezu a bez alokací gradientů', () => {
    const patrol = computeBubakCrowChoreography(0.5);
    expect(patrol.phase).toBe('patrol_approach');
    expect(patrol.isCrowOnHead).toBe(false);

    const pestering = computeBubakCrowChoreography(2.2);
    expect(pestering.phase).toBe('pestering');
    expect(pestering.annoyanceLevel).toBeGreaterThan(0.2);

    const landing = computeBubakCrowChoreography(3.6);
    expect(landing.phase).toBe('landing_on_head');
    expect(landing.crowLegReach).toBeGreaterThan(0.5);

    const taunting = computeBubakCrowChoreography(4.9);
    expect(taunting.phase).toBe('taunting_on_head');
    expect(taunting.isCrowOnHead).toBe(true);
    expect(taunting.annoyanceLevel).toBeGreaterThan(0.75);
    expect(taunting.bubakRageFlush).toBeGreaterThan(0.4);
    // Crow is perched directly on Bubák's head crown
    expect(Math.abs(taunting.crowX - taunting.bubakHeadCrownX)).toBeLessThan(8);

    const scream = computeBubakCrowChoreography(6.5);
    expect(scream.phase).toBe('angry_scream');
    expect(scream.screamLevel).toBeGreaterThan(0.8);
    expect(scream.bubakMouthOpen).toBeGreaterThan(0.8);
    expect(scream.crowStartledLevel).toBeGreaterThan(0.4);
    expect(scream.isCrowOnHead).toBe(false);

    // Verify that across the entire 9.6s cycle, the crow (including 22px wing/tail span) never clips outside the 225x252 canvas bounds (localX in [-32..193], localY in [-52..200])
    for (let t = 0; t <= 9.6; t += 0.05) {
      const s = computeBubakCrowChoreography(t);
      expect(s.crowX - 22).toBeGreaterThanOrEqual(-30);
      expect(s.crowX + 22).toBeLessThanOrEqual(190);
      expect(s.crowY - 22).toBeGreaterThanOrEqual(-48);
      expect(s.crowY + 18).toBeLessThanOrEqual(195);
    }

    // Verify 2D canvas drawing executes cleanly across all phases with zero per-frame gradient allocations
    const calls: string[] = [];
    let gradientAllocations = 0;
    const mockCtx = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
            return () => {
              gradientAllocations++;
              return { addColorStop: () => {} };
            };
          }
          return (..._args: unknown[]) => {
            calls.push(String(prop));
          };
        },
        set() {
          return true;
        },
      }
    ) as unknown as CanvasRenderingContext2D;

    for (const sampleTime of [0.5, 2.2, 3.6, 4.9, 6.5, 8.5]) {
      drawBubakAndCrowCoverCanvas(mockCtx, 225, 252, sampleTime);
    }
    expect(calls.length).toBeGreaterThan(100);
    expect(calls).toContain('fillText');
    expect(gradientAllocations).toBe(0);
  });

  it('plynule animuje 2D canvas scénu čertíka (koulení velkýma očima, náhlé vzplanutí ocasu, vyděšené honění a sfoukávání ocasu) bez ořezu a bez alokací gradientů', () => {
    const eyeRoll = computeCertTailFireChoreography(1.0);
    expect(eyeRoll.phase).toBe('mischievous_eye_roll');
    expect(eyeRoll.eyeScaleX).toBeGreaterThanOrEqual(1.15);
    expect(eyeRoll.tongueLength).toBeGreaterThan(0.5);

    const flareUp = computeCertTailFireChoreography(2.4);
    expect(flareUp.phase).toBe('tail_flare_up');
    expect(flareUp.flameIntensity).toBeGreaterThan(1.8);
    expect(flareUp.eyeScaleX).toBeGreaterThan(1.3);

    const panic = computeCertTailFireChoreography(3.2);
    expect(panic.phase).toBe('startled_panic');
    expect(panic.flameIntensity).toBeGreaterThan(2.5);
    expect(panic.eyeScaleY).toBeGreaterThan(1.4);
    expect(panic.jumpY).toBeLessThan(-6);
    expect(panic.folkCallout).toBe('JÉMINÁČKU!');

    const blowing = computeCertTailFireChoreography(5.0);
    expect(blowing.phase).toBe('chasing_and_blowing');
    expect(blowing.windBlowPower).toBeGreaterThan(0.6);
    expect(blowing.cheekPuff).toBeGreaterThan(0.6);
    expect(blowing.mouthMode).toBe('blowing');
    expect(blowing.folkCallout).toBe('FÚÚÚ!');

    const extinguish = computeCertTailFireChoreography(6.6);
    expect(extinguish.phase).toBe('sizzling_extinguish');
    expect(extinguish.smokePuffIntensity).toBeGreaterThan(0.5);
    expect(extinguish.folkCallout).toBe('UF!');

    const recovery = computeCertTailFireChoreography(7.9);
    expect(recovery.phase).toBe('cheeky_recovery');
    expect(recovery.tongueLength).toBeGreaterThan(0.2);

    // Verify that across the entire 8.4s cycle, Čertík's tail tip (including roaring flame radius) never clips outside the 225x252 canvas bounds (localX in [-45..180], localY in [-52..200])
    for (let t = 0; t <= 8.4; t += 0.05) {
      const s = computeCertTailFireChoreography(t);
      const flameRadius = 14 * Math.min(2.2, s.flameIntensity);
      expect(s.tailTipX - flameRadius).toBeGreaterThanOrEqual(-42);
      expect(s.tailTipX + flameRadius).toBeLessThanOrEqual(176);
      expect(s.tailTipY - flameRadius).toBeGreaterThanOrEqual(-48);
      expect(s.tailTipY + flameRadius).toBeLessThanOrEqual(195);
    }

    // Verify 2D canvas drawing executes cleanly across all phases with zero per-frame gradient allocations
    const calls: string[] = [];
    let gradientAllocations = 0;
    const mockCtx = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
            return () => {
              gradientAllocations++;
              return { addColorStop: () => {} };
            };
          }
          return (..._args: unknown[]) => {
            calls.push(String(prop));
          };
        },
        set() {
          return true;
        },
      }
    ) as unknown as CanvasRenderingContext2D;

    for (const sampleTime of [1.0, 2.4, 3.2, 5.0, 6.6, 7.9]) {
      drawCertCoverCanvas(mockCtx, 225, 252, sampleTime);
    }
    expect(calls.length).toBeGreaterThan(150);
    expect(calls).toContain('fillText');
    expect(gradientAllocations).toBe(0);
  });

  it('vykresluje a plynule animuje scénu v Hospodě U Černého kocoura (Hastrman popotahující z fajfky s kroužky dýmu, Český bubák a krásná rusalka ťukající pěnivými korbely a pijící na ex)', () => {
    const tavernHtml = renderToStaticMarkup(<LadaCoverScene height={180} />);
    expect(tavernHtml).toContain('id="lada-tavern-cover-scene"');
    expect(tavernHtml).toContain('data-testid="tavern-cover-canvas"');
    expect(tavernHtml).toContain('Hastrman šibalsky popotahuje z fajfky');

    const puff = computeTavernSceneChoreography(0.8);
    expect(puff.phase).toBe('pipe_puff_and_sway');
    expect(puff.pipeEmberGlow).toBeGreaterThan(0.6);
    expect(puff.hastrmanWink).toBeGreaterThan(0.5);
    expect(puff.smokeRings.length).toBe(4);

    const windup = computeTavernSceneChoreography(2.2);
    expect(windup.phase).toBe('smoke_rings_and_windup');

    const clink = computeTavernSceneChoreography(3.3);
    expect(clink.phase).toBe('hearty_clink');
    expect(clink.clinkImpact).toBeGreaterThan(0.5);
    expect(clink.foamHeadScale).toBeGreaterThan(1.25);
    expect(clink.folkCallout).toBe('CINK! NA ZDRAVÍ!');
    // Mugs touch near the center above the table
    expect(Math.abs(clink.rusalkaMugX - clink.bubakMugX)).toBeLessThan(38);

    const gulp = computeTavernSceneChoreography(5.2);
    expect(gulp.phase).toBe('synchronized_gulp');
    expect(gulp.gulpIntensity).toBeGreaterThan(0.8);
    expect(gulp.bubakHeadTiltRad).toBeLessThan(-0.2);
    expect(gulp.rusalkaHeadTiltRad).toBeGreaterThan(0.2);
    expect(gulp.folkCallout).toBe('GLUG! GLUG!');

    const satisfied = computeTavernSceneChoreography(6.5);
    expect(satisfied.phase).toBe('satisfied_ah');
    expect(satisfied.foamMustacheAlpha).toBeGreaterThan(0.5);
    expect(satisfied.folkCallout).toBe('ÁÁCH!');

    // Verify all smoke rings and mugs remain strictly inside the 560x230 canvas stage across the entire 7.6s loop
    for (let t = 0; t <= 7.6; t += 0.05) {
      const s = computeTavernSceneChoreography(t);
      for (const ring of s.smokeRings) {
        expect(ring.x - ring.rx).toBeGreaterThanOrEqual(20);
        expect(ring.x + ring.rx).toBeLessThanOrEqual(540);
        expect(ring.y - ring.ry).toBeGreaterThanOrEqual(15);
        expect(ring.y + ring.ry).toBeLessThanOrEqual(215);
      }
      expect(s.bubakMugX).toBeGreaterThanOrEqual(280);
      expect(s.rusalkaMugX).toBeLessThanOrEqual(480);
      expect(s.bubakMugY).toBeGreaterThanOrEqual(65);
      expect(s.rusalkaMugY).toBeGreaterThanOrEqual(65);
    }

    // Verify 2D canvas drawing executes cleanly with zero per-frame gradient allocations
    const calls: string[] = [];
    let gradientAllocations = 0;
    const mockCtx = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
            return () => {
              gradientAllocations++;
              return { addColorStop: () => {} };
            };
          }
          return (..._args: unknown[]) => {
            calls.push(String(prop));
          };
        },
        set() {
          return true;
        },
      }
    ) as unknown as CanvasRenderingContext2D;

    for (const sampleTime of [0.8, 2.2, 3.3, 5.2, 6.5]) {
      drawTavernCoverCanvas(mockCtx, 560, 230, sampleTime);
    }
    expect(calls.length).toBeGreaterThan(200);
    expect(calls).toContain('fillText');
    expect(gradientAllocations).toBe(0);
  });

  it('vypočítává fyzikální geometrii otáčení stránky (150g dřevitý papír, průsvit tisku 6 %, skewY -3.5° při 40 % a putující stíny)', () => {
    expect(evaluatePaperTurnCurve(0)).toBe(0);
    expect(evaluatePaperTurnCurve(1)).toBeCloseTo(1, 5);
    // Air-cushion deceleration at 95% before settling flat at 100%
    expect(evaluatePaperTurnCurve(0.95)).toBeLessThan(1.0);
    expect(evaluatePaperTurnCurve(0.95)).toBeGreaterThan(0.96);

    // Verify 100% monotonic curve (never reverses or jitters backward during the turn)
    let prevVal = 0;
    for (let t = 0; t <= 1.0; t += 0.01) {
      const v = evaluatePaperTurnCurve(t);
      expect(v).toBeGreaterThanOrEqual(prevVal - 1e-9);
      prevVal = v;
    }

    // At 40% turn: skewY peaks near -3.5deg, ink show-through is active (>=4%, peaking at 6% at 50%), right lift shadow is cast
    const geom40 = computePageTurnGeometry(0.4, 'forward');
    expect(geom40.archSkewYDeg).toBeCloseTo(-3.5, 1);
    expect(geom40.inkShowThroughOpacity).toBeGreaterThanOrEqual(0.04);
    expect(computePageTurnGeometry(0.5, 'forward').inkShowThroughOpacity).toBeCloseTo(0.06, 3);
    expect(geom40.rightLiftShadowOpacity).toBeGreaterThan(0.15);
    expect(geom40.rectoClipPath).toContain('polygon(');
    expect(geom40.versoClipPath).toContain('polygon(');
    // Verify 1:1 crease locking between recto (foldTopX/foldBotX) and verso (creaseTopSpreadX/creaseBotSpreadX)
    expect(geom40.creaseTopSpreadX).toBeCloseTo(50 + geom40.foldTopX * 0.5, 4);
    expect(geom40.creaseBotSpreadX).toBeCloseTo(50 + geom40.foldBotX * 0.5, 4);
    // Leading edge of verso is always to the left of the crease line
    expect(geom40.leadBotSpreadX).toBeLessThan(geom40.creaseBotSpreadX);
    expect(geom40.leadTopSpreadX).toBeLessThan(geom40.creaseTopSpreadX);

    // At 75% turn: page crosses spine, left landing shadow is cast onto the left page
    const geom75 = computePageTurnGeometry(0.75, 'forward');
    expect(geom75.leftLandingShadowOpacity).toBeGreaterThan(0.1);
    expect(geom75.rightLiftShadowOpacity).toBe(0);

    // Backward turn (left -> right unroll from spine): foldBotX grows from 0% toward 100%
    const backStart = computePageTurnGeometry(0.1, 'backward');
    const backLate = computePageTurnGeometry(0.8, 'backward');
    expect(backLate.foldBotX).toBeGreaterThan(backStart.foldBotX);

    const mockMeta: MetaProgression = {
      krejcary: 42,
      upgrades: {},
      unlockedCharacters: ['krajanek'],
      unlockedLevels: [0],
      bestiaryKills: { vodnik: 7, rarach: 12 },
      discoveredLandmarks: [],
      unlockedWeapons: ['buchty', 'prut'],
    };

    // Render LadaStorybookSpread and verify book structure, dog-eared corners, and margin controls
    const bookMarkup = renderToStaticMarkup(
      <LadaStorybookSpread
        meta={mockMeta}
        selectedLevelId={0}
        levelProgress={{ 0: { isUnlocked: true, spoiledName: 'Předjaří' } }}
        onSelectLevel={() => {}}
        onInspectLockedLevel={() => {}}
        onProceedToHunters={() => {}}
        onQuickStartWithHunter={() => {}}
        onOpenTavern={() => {}}
        onOpenArsenal={() => {}}
        onOpenBestiary={() => {}}
        onOpenControls={() => {}}
        unlockedWeaponsCount={4}
        totalWeaponsCount={12}
      />
    );
    expect(bookMarkup).toContain('lada-book-hardcover');
    expect(bookMarkup).toContain('lada-book-deckled-stack-wrap');
    expect(bookMarkup).toContain('lada-dog-ear-next');
    expect(bookMarkup).toContain('lada-dog-ear-prev');
    expect(bookMarkup).toContain('Plynulý list (Loutkový krok)');
    expect(bookMarkup).toContain('Šelest stránek');
    expect(bookMarkup).not.toContain('Selected Signpost');
    expect(bookMarkup).not.toContain('Wayfarer');

    // Verify single-sheet geometry stays within 0..100% bounds
    const sheetStart = computeSingleSheetTurnGeometry(0, 'forward');
    const sheetMid = computeSingleSheetTurnGeometry(0.5, 'forward');
    const sheetEnd = computeSingleSheetTurnGeometry(1, 'forward');
    expect(sheetStart.foldBotX).toBeCloseTo(100, 1);
    expect(sheetMid.foldBotX).toBeLessThan(sheetMid.foldTopX);
    expect(sheetMid.foldBotX).toBeGreaterThan(20);
    expect(sheetEnd.foldBotX).toBeCloseTo(0, 1);
  });

  it('vykresluje sekci Jak hrát (ControlsModal) a další modály v knížkovém stylu SNDK s iniciálami, plátěnými záložkami a oslíma ušima', () => {
    const controlsMarkup = renderToStaticMarkup(
      <ControlsModal isOpen={true} onClose={() => {}} />
    );
    expect(controlsMarkup).toContain('RADY STARÉHO HOSPODÁŘE');
    expect(controlsMarkup).toContain('lada-storybook-modal');
    expect(controlsMarkup).toContain('lada-page-running-header');
    expect(controlsMarkup).toContain('lada-controls-bookmark-bar');
    expect(controlsMarkup).toContain('lada-bookmark-ribbon');
    expect(controlsMarkup).toContain('lada-drop-cap');
    expect(controlsMarkup).toContain('lada-controls-sheet-footer');
    expect(controlsMarkup).toContain('lada-dog-ear-next');
    expect(controlsMarkup).not.toContain('JOYSTICK');

    const bestiaryMarkup = renderToStaticMarkup(
      <BestiaryModal
        isOpen={true}
        bestiaryKills={{ rarach: 5, vodnik: 5 }}
        onClose={() => {}}
      />
    );
    expect(bestiaryMarkup).toContain('lada-storybook-modal');
    expect(bestiaryMarkup).toContain('Kapitola III · Bestiář českého venkova');
    expect(bestiaryMarkup).toContain('lada-drop-cap');

    const arsenalMarkup = renderToStaticMarkup(
      <ArsenalModal
        isOpen={true}
        meta={{
          krejcary: 10,
          upgrades: {},
          unlockedCharacters: ['krajanek'],
          unlockedLevels: [0],
          bestiaryKills: {},
          discoveredLandmarks: [],
          unlockedWeapons: ['buchty'],
        }}
        onInspectWeapon={() => {}}
        onClose={() => {}}
      />
    );
    expect(arsenalMarkup).toContain('lada-storybook-modal');
    expect(arsenalMarkup).toContain('Kapitola II · Zbraně a řemeslný fortel');
    expect(arsenalMarkup).toContain('lada-bookmark-ribbon');
  });
});

