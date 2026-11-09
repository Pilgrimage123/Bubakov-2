/**
 * Arena Interactive Effects & Mobile Accessibility Helper
 *
 * Provides generous mobile-friendly interaction radiuses, contextual action prompts,
 * icons, and detection for all 24 game stages, Grandfather's Shop, and interactive drops.
 */

import { MARCH_THAW_POIS, isInsideMarchPoi } from '../data/marchThawArena';
import { DUBEN_POIS, isInsideDubenPoi } from '../data/dubnovyDenArena';
import { KVETEN_POIS, isInsideKvetenPoi } from '../data/kvetenArena';
import { getCervenPois, isInsideCervenPoi } from '../data/cervenArena';
import { getCervenecPois, isInsideCervenecPoi } from '../data/cervenecArena';
import { getSrpenPois, isInsideSrpenPoi } from '../data/srpenArena';
import { getZariPois, isInsideZariPoi } from '../data/zariArena';
import { getRijenPois, isInsideRijenPoi } from '../data/rijenArena';
import { getListopadPois, isInsideListopadPoi } from '../data/listopadArena';
import { getProsinecPois, isInsideProsinecPoi } from '../data/prosinecArena';
import { getLedenPois, isInsideLedenPoi } from '../data/ledenArena';
import { getUnorPois, isInsideUnorPoi } from '../data/unorArena';
import { isInteractiveArenaDrop } from '../render/renderDrops';

export interface ArenaInteractInfo {
  /** Whether an interactive arena effect or shop is currently available to trigger */
  canInteract: boolean;
  /** Human-readable prompt text (localized for desktop [E], gamepad [X], or touch [KLEPNI]) */
  prompt: string | null;
  /** Short action verb for the touch button (e.g. ZVONIT, SOUDEK, KAPLIČKA, OBCHOD, TRUHLA) */
  label: string;
  /** Contextual icon name compatible with GameIcon */
  icon: string;
  /** Category of the active interactive target */
  category: 'church' | 'tavern' | 'shrine' | 'village' | 'forest' | 'shop' | 'chest' | 'none';
  /** Approximate world coordinates of the interactive target */
  targetX?: number;
  targetY?: number;
}

/**
 * Returns the interaction padding radius.
 * On mobile/touch devices or with accessibility active, provides an expanded catchment buffer
 * (+45px to +85px) so players steering with virtual joysticks can easily trigger effects.
 */
export function getArenaInteractionPadding(isMobile: boolean, mobileAccessibilityLevel = 0): number {
  if (!isMobile) return 35;
  const safeLevel = Math.max(0, Math.min(10, Math.round(mobileAccessibilityLevel)));
  return 75 + safeLevel * 3.5;
}

/**
 * Replaces keyboard [E] / gamepad [X] hints with touch [KLEPNI] for mobile screens.
 */
export function formatInteractPrompt(text: string | null | undefined, isMobile: boolean, isGamepad = false): string | null {
  if (!text) return null;
  if (isMobile) {
    return text
      .replace(/\[E\]/g, '[KLEPNI]')
      .replace(/\[X\]/g, '[KLEPNI]')
      .replace(/\[RB \/ B\]/g, '')
      .replace(/\[MEZERNÍK\]/g, '')
      .replace(/\[A\]/g, '')
      .replace(/\[R\]/g, '')
      .replace(/\[P \/ Esc\]/g, '')
      .replace(/\[Start\]/g, '')
      .replace(/\[F11\]/g, '')
      .replace(/\[F\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const tag = isGamepad ? '[X]' : '[E]';
  return text.replace(/\[E\]/g, tag).replace(/\[X\]/g, tag);
}

/**
 * Evaluates whether an interactive arena element is currently ready to be triggered by the player.
 */
export function evaluateArenaInteraction(
  engine: any,
  isMobile: boolean,
  mobileAccessibilityLevel = 0
): ArenaInteractInfo {
  if (!engine || !engine.player) {
    return {
      canInteract: false,
      prompt: null,
      label: 'POUŽÍT',
      icon: 'hand',
      category: 'none',
    };
  }

  const p = engine.player;
  const pad = getArenaInteractionPadding(isMobile, mobileAccessibilityLevel);
  const isNightLevel = typeof engine.activeLevelId === 'number' && engine.activeLevelId % 2 === 1;

  // 1. Čertův dědeček (Grandfather's Shop)
  const grandfatherThreshold = isMobile ? 290 : 220;
  if (engine.grandfather && engine.grandfather.active) {
    const distG = Math.hypot(engine.grandfather.x - p.x, engine.grandfather.y - p.y);
    if (distG <= grandfatherThreshold) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Otevřít Čertův krámek' : '[E] Otevřít Čertův krámek',
        label: 'OBCHOD',
        icon: 'shop',
        category: 'shop',
        targetX: engine.grandfather.x,
        targetY: engine.grandfather.y,
      };
    }
  }

  // 2. Stage-Specific Interactive Points of Interest (POIs)
  const lvl = engine.activeLevelId ?? 0;

  // Stage 1 & 2: Předjaří v Hrusicích (March Thaw)
  if (lvl === 0 || lvl === 1) {
    const thaw = engine.marchThaw || {};
    if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.church, pad) && (thaw.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Rozeznít kostelní zvonici' : '[E] Rozeznít kostelní zvonici',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: MARCH_THAW_POIS.church.x,
        targetY: MARCH_THAW_POIS.church.y,
      };
    }
    if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.tavern, pad) && (thaw.kegCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Narazit hospodský soudek' : '[E] Narazit hospodský soudek',
        label: 'SOUDEK',
        icon: 'beer',
        category: 'tavern',
        targetX: MARCH_THAW_POIS.tavern.x,
        targetY: MARCH_THAW_POIS.tavern.y,
      };
    }
    if (isInsideMarchPoi(p.x, p.y, MARCH_THAW_POIS.shrine, pad) && (thaw.shrineCooldown || 0) <= 0 && (thaw.apparitionTimer || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Mariánská kaplička (Zjevení)' : '[E] Mariánská kaplička (Zjevení)',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: MARCH_THAW_POIS.shrine.x,
        targetY: MARCH_THAW_POIS.shrine.y,
      };
    }
  }

  // Stage 3 & 4: Dubnový den & Filipojakubská noc
  if (lvl === 2 || lvl === 3) {
    const duben = engine.dubenDen || {};
    if (isInsideDubenPoi(p.x, p.y, DUBEN_POIS.church, pad) && (duben.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile
          ? (isNightLevel ? '[KLEPNI] Filipojakubský zvon' : '[KLEPNI] Velikonoční zvon ze Říma')
          : (isNightLevel ? '[E] Filipojakubský zvon' : '[E] Velikonoční zvon ze Říma'),
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: DUBEN_POIS.church.x,
        targetY: DUBEN_POIS.church.y,
      };
    }
    if (isInsideDubenPoi(p.x, p.y, DUBEN_POIS.tavern, pad) && (duben.kegCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Kolednický džbánek' : '[E] Kolednický džbánek',
        label: 'DŽBÁNEK',
        icon: 'beer',
        category: 'tavern',
        targetX: DUBEN_POIS.tavern.x,
        targetY: DUBEN_POIS.tavern.y,
      };
    }
    if (isInsideDubenPoi(p.x, p.y, DUBEN_POIS.shrine, pad) && (duben.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Požehnání u Božích muk' : '[E] Požehnání u Božích muk',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: DUBEN_POIS.shrine.x,
        targetY: DUBEN_POIS.shrine.y,
      };
    }
  }

  // Stage 5 & 6: Květen v Hrusicích & Májová noc
  if (lvl === 4 || lvl === 5) {
    const kv = engine.kveten || {};
    if (isInsideKvetenPoi(p.x, p.y, KVETEN_POIS.church, pad) && (kv.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Rozeznít májový zvon' : '[E] Rozeznít májový zvon',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: KVETEN_POIS.church.x,
        targetY: KVETEN_POIS.church.y,
      };
    }
    if (isInsideKvetenPoi(p.x, p.y, KVETEN_POIS.tavern, pad) && (kv.kegCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Narazit májový soudek' : '[E] Narazit májový soudek',
        label: 'SOUDEK',
        icon: 'beer',
        category: 'tavern',
        targetX: KVETEN_POIS.tavern.x,
        targetY: KVETEN_POIS.tavern.y,
      };
    }
    if (isInsideKvetenPoi(p.x, p.y, KVETEN_POIS.shrine, pad) && (kv.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Požehnání sv. Jana Nepomuckého' : '[E] Požehnání sv. Jana Nepomuckého',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: KVETEN_POIS.shrine.x,
        targetY: KVETEN_POIS.shrine.y,
      };
    }
  }

  // Stage 7 & 8: Červnová senoseč & Svatojánská noc
  if (lvl === 6 || lvl === 7) {
    const cv = engine.cerven || {};
    const pois = getCervenPois(isNightLevel);

    if (isNightLevel && cv.poklad && cv.poklad.unlocked && !cv.poklad.opened) {
      const pokladThresh = isMobile ? 180 : 125;
      if (Math.hypot(p.x - cv.poklad.x, p.y - cv.poklad.y) <= pokladThresh) {
        return {
          canInteract: true,
          prompt: isMobile ? '[KLEPNI] Otevřít Svatojánský poklad' : '[E] Otevřít Svatojánský poklad',
          label: 'POKLAD',
          icon: 'chest',
          category: 'village',
          targetX: cv.poklad.x,
          targetY: cv.poklad.y,
        };
      }
    }
    if (isInsideCervenPoi(p.x, p.y, pois.shrine, pad) && (cv.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Poutní strom sv. Antonína' : '[E] Poutní strom sv. Antonína',
        label: 'POŽEHNÁNÍ',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
    if (isInsideCervenPoi(p.x, p.y, pois.church, pad) && (cv.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Hrusický mrakozvon' : '[E] Hrusický mrakozvon',
        label: 'MRAKOZVON',
        icon: 'bell',
        category: 'church',
        targetX: pois.church.x,
        targetY: pois.church.y,
      };
    }
    if (isInsideCervenPoi(p.x, p.y, pois.forest, pad) && (cv.forestCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Borůvkový háj' : '[E] Borůvkový háj',
        label: 'BORŮVKY',
        icon: 'herbs',
        category: 'forest',
        targetX: pois.forest.x,
        targetY: pois.forest.y,
      };
    }
    if (isInsideCervenPoi(p.x, p.y, pois.tavern, pad) && (cv.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Chladivé podmáslí' : '[E] Chladivé podmáslí',
        label: 'PODMÁSLÍ',
        icon: 'beer',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
  }

  // Stage 9 & 10: Červencová pouť & Bouře sv. Eliáše
  if (lvl === 8 || lvl === 9) {
    const cvc = engine.cervenec || {};
    const pois = getCervenecPois(isNightLevel);
    if (!isNightLevel && cvc.strelnice && (cvc.strelnice.cooldown || 0) <= 0 && isInsideCervenecPoi(p.x, p.y, pois.village, pad)) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Pouťová střelnice' : '[E] Pouťová střelnice',
        label: 'STŘELNICE',
        icon: 'target',
        category: 'village',
        targetX: pois.village.x,
        targetY: pois.village.y,
      };
    }
    if (isInsideCervenecPoi(p.x, p.y, pois.shrine, pad) && (cvc.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Požehnání u kapličky' : '[E] Požehnání u kapličky',
        label: 'POŽEHNÁNÍ',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
    if (isInsideCervenecPoi(p.x, p.y, pois.church, pad) && (cvc.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Poutní zvon sv. Václava' : '[E] Poutní zvon sv. Václava',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: pois.church.x,
        targetY: pois.church.y,
      };
    }
    if (isInsideCervenecPoi(p.x, p.y, pois.tavern, pad) && (cvc.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Poutní džbánek' : '[E] Poutní džbánek',
        label: 'DŽBÁNEK',
        icon: 'beer',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
    if (isInsideCervenecPoi(p.x, p.y, pois.forest, pad) && (cvc.forestCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Lesní maliny' : '[E] Lesní maliny',
        label: 'MALINY',
        icon: 'herbs',
        category: 'forest',
        targetX: pois.forest.x,
        targetY: pois.forest.y,
      };
    }
  }

  // Stage 11 & 12: Srpnové dožínky & Vavřinecká noc
  if (lvl === 10 || lvl === 11) {
    const sr = engine.srpen || {};
    const pois = getSrpenPois(isNightLevel);
    const pec = sr.chlebovaPec;
    const vatra = sr.vatra;

    if (!isNightLevel && pec && (pec.cooldown || 0) <= 0 && (isInsideSrpenPoi(p.x, p.y, pois.village, pad) || Math.hypot(p.x - (pec.x || 45), p.y - (pec.y || -95)) <= (pec.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Upect chléb v peci' : '[E] Upect chléb v peci',
        label: 'PECE',
        icon: 'bread',
        category: 'village',
        targetX: pec.x || pois.village.x,
        targetY: pec.y || pois.village.y,
      };
    }
    if (isNightLevel && vatra && (vatra.cooldown || 0) <= 0 && (isInsideSrpenPoi(p.x, p.y, pois.church, pad) || Math.hypot(p.x - vatra.x, p.y - vatra.y) <= (vatra.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Rozžehnout Vavřineckou vatru' : '[E] Rozžehnout Vavřineckou vatru',
        label: 'VATRA',
        icon: 'flame',
        category: 'village',
        targetX: vatra.x,
        targetY: vatra.y,
      };
    }
    if (isInsideSrpenPoi(p.x, p.y, pois.shrine, pad) && (sr.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Dožínkové požehnání' : '[E] Dožínkové požehnání',
        label: 'POŽEHNÁNÍ',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
    if (isInsideSrpenPoi(p.x, p.y, pois.church, pad) && (sr.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Kostel sv. Bartoloměje' : '[E] Kostel sv. Bartoloměje',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: pois.church.x,
        targetY: pois.church.y,
      };
    }
    if (isInsideSrpenPoi(p.x, p.y, pois.tavern, pad) && (sr.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Dožínkové pivo a koláče' : '[E] Dožínkové pivo a koláče',
        label: 'DŽBÁNEK',
        icon: 'beer',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
  }

  // Stage 13 & 14: Zářijové posvícení & Svatováclavská noc
  if (lvl === 12 || lvl === 13) {
    const zr = engine.zari || {};
    const pois = getZariPois(isNightLevel);
    const kotel = zr.kotel;
    const ohen = zr.ohen;

    if (!isNightLevel && kotel && (kotel.cooldown || 0) <= 0 && (isInsideZariPoi(p.x, p.y, pois.village, pad) || Math.hypot(p.x - (kotel.x || 45), p.y - (kotel.y || -95)) <= (kotel.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Zamíchat kotel povidel' : '[E] Zamíchat kotel povidel',
        label: 'KOTEL',
        icon: 'flame',
        category: 'village',
        targetX: kotel.x || pois.village.x,
        targetY: kotel.y || pois.village.y,
      };
    }
    if (isNightLevel && ohen && (ohen.cooldown || 0) <= 0 && (isInsideZariPoi(p.x, p.y, pois.church, pad) || Math.hypot(p.x - ohen.x, p.y - ohen.y) <= (ohen.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Svatováclavský oheň' : '[E] Svatováclavský oheň',
        label: 'OHEŇ',
        icon: 'flame',
        category: 'village',
        targetX: ohen.x,
        targetY: ohen.y,
      };
    }
    if (isInsideZariPoi(p.x, p.y, pois.shrine, pad) && (zr.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Posvícenské požehnání' : '[E] Posvícenské požehnání',
        label: 'POŽEHNÁNÍ',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
    if (isInsideZariPoi(p.x, p.y, pois.church, pad) && (zr.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Posvícenský zvon' : '[E] Posvícenský zvon',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: pois.church.x,
        targetY: pois.church.y,
      };
    }
    if (isInsideZariPoi(p.x, p.y, pois.tavern, pad) && (zr.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Posvícenské koláče' : '[E] Posvícenské koláče',
        label: 'KOLÁČE',
        icon: 'bread',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
  }

  // Stage 15 & 16: Říjnové brambory & Dušičková noc
  if (lvl === 14 || lvl === 15) {
    const rj = engine.rijen || {};
    const pois = getRijenPois(isNightLevel);
    const ohnicek = rj.ohnicek;
    const svice = rj.svice;

    if (!isNightLevel && ohnicek && (ohnicek.cooldown || 0) <= 0 && (isInsideRijenPoi(p.x, p.y, pois.village, pad) || Math.hypot(p.x - (ohnicek.x || 50), p.y - (ohnicek.y || -75)) <= (ohnicek.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Upéct pečenou bramboru' : '[E] Upéct pečenou bramboru',
        label: 'BRAMBORY',
        icon: 'flame',
        category: 'village',
        targetX: ohnicek.x || pois.village.x,
        targetY: ohnicek.y || pois.village.y,
      };
    }
    if (isNightLevel && svice && (svice.cooldown || 0) <= 0 && (isInsideRijenPoi(p.x, p.y, pois.shrine, pad) || Math.hypot(p.x - svice.x, p.y - svice.y) <= (svice.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Rozsvítit Dušičkovou svíci' : '[E] Rozsvítit Dušičkovou svíci',
        label: 'SVÍCE',
        icon: 'candle',
        category: 'shrine',
        targetX: svice.x,
        targetY: svice.y,
      };
    }
    if (!isNightLevel && isInsideRijenPoi(p.x, p.y, pois.shrine, pad) && (rj.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Požehnání u Božích muk' : '[E] Požehnání u Božích muk',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
    if (isInsideRijenPoi(p.x, p.y, pois.church, pad) && (rj.bellCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Zvon sv. Mikuláše' : '[E] Zvon sv. Mikuláše',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: pois.church.x,
        targetY: pois.church.y,
      };
    }
    if (isInsideRijenPoi(p.x, p.y, pois.tavern, pad) && (rj.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Horká polévka' : '[E] Horká polévka',
        label: 'POLÉVKA',
        icon: 'bread',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
  }

  // Stage 17 & 18: Listopadové posvícení
  if (lvl === 16 || lvl === 17) {
    const lp = engine.listopad || {};
    const pois = getListopadPois(isNightLevel);
    if (isInsideListopadPoi(p.x, p.y, pois.tavern, pad) && (lp.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Svatomartinská husa' : '[E] Svatomartinská husa',
        label: 'HUSA',
        icon: 'bread',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
    if (isInsideListopadPoi(p.x, p.y, pois.shrine, pad) && (lp.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Světlo v mlze' : '[E] Světlo v mlze',
        label: 'SVĚTLO',
        icon: 'candle',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
  }

  // Stage 19 & 20: Prosincový advent & Štědrý večer
  if (lvl === 18 || lvl === 19) {
    const pr = engine.prosinec || {};
    const pois = getProsinecPois(isNightLevel);
    const advent = pr.advent;
    const zvon = pr.zvon;

    if (!isNightLevel && advent && (advent.cooldown || 0) <= 0 && (isInsideProsinecPoi(p.x, p.y, pois.village, pad) || Math.hypot(p.x - advent.x, p.y - advent.y) <= (advent.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Rozžehnout adventní věnec' : '[E] Rozžehnout adventní věnec',
        label: 'ADVENT',
        icon: 'candle',
        category: 'village',
        targetX: advent.x,
        targetY: advent.y,
      };
    }
    if (isNightLevel && zvon && (zvon.cooldown || 0) <= 0 && (isInsideProsinecPoi(p.x, p.y, pois.church, pad) || Math.hypot(p.x - zvon.x, p.y - zvon.y) <= (zvon.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Štědrovečerní zvon' : '[E] Štědrovečerní zvon',
        label: 'ZVONICE',
        icon: 'bell',
        category: 'church',
        targetX: zvon.x,
        targetY: zvon.y,
      };
    }
    if (isInsideProsinecPoi(p.x, p.y, pois.tavern, pad) && (pr.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Horký vánoční punč' : '[E] Horký vánoční punč',
        label: 'PUNČ',
        icon: 'beer',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
    if (isInsideProsinecPoi(p.x, p.y, pois.shrine, pad) && (pr.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Světlo ve vánici' : '[E] Světlo ve vánici',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
  }

  // Stage 21 & 22: Lednové mrazy & Tři králové
  if (lvl === 20 || lvl === 21) {
    const ld = engine.leden || {};
    const pois = getLedenPois(isNightLevel);
    const snehulak = ld.snehulak;
    const fara = ld.fara;

    if (!isNightLevel && snehulak && (snehulak.cooldown || 0) <= 0 && (isInsideLedenPoi(p.x, p.y, pois.village, pad) || Math.hypot(p.x - snehulak.x, p.y - snehulak.y) <= (snehulak.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Postavit obřího sněhuláka' : '[E] Postavit obřího sněhuláka',
        label: 'SNĚHULÁK',
        icon: 'frost',
        category: 'village',
        targetX: snehulak.x,
        targetY: snehulak.y,
      };
    }
    if (isNightLevel && fara && (fara.cooldown || 0) <= 0 && (isInsideLedenPoi(p.x, p.y, pois.church, pad) || Math.hypot(p.x - fara.x, p.y - fara.y) <= (fara.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Posvětit faru K+M+B' : '[E] Posvětit faru K+M+B',
        label: 'K+M+B',
        icon: 'church',
        category: 'church',
        targetX: fara.x,
        targetY: fara.y,
      };
    }
    if (isInsideLedenPoi(p.x, p.y, pois.tavern, pad) && (ld.tavernCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Horký čaj s medem' : '[E] Horký čaj s medem',
        label: 'ČAJ',
        icon: 'beer',
        category: 'tavern',
        targetX: pois.tavern.x,
        targetY: pois.tavern.y,
      };
    }
    if (isInsideLedenPoi(p.x, p.y, pois.shrine, pad) && (ld.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Světlo v závěji' : '[E] Světlo v závěji',
        label: 'KAPLIČKA',
        icon: 'church',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
  }

  // Stage 23 & 24: Únorový masopust & Ostatky
  if (lvl === 22 || lvl === 23) {
    const un = engine.unor || {};
    const pois = getUnorPois(isNightLevel);
    const koblihy = un.koblihy;
    const basa = un.basa;

    if (!isNightLevel && koblihy && (koblihy.cooldown || 0) <= 0 && (isInsideUnorPoi(p.x, p.y, pois.tavern, pad) || Math.hypot(p.x - koblihy.x, p.y - koblihy.y) <= (koblihy.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Smažit masopustní koblihy' : '[E] Smažit masopustní koblihy',
        label: 'KOBLIHY',
        icon: 'bread',
        category: 'tavern',
        targetX: koblihy.x,
        targetY: koblihy.y,
      };
    }
    if (isNightLevel && basa && (basa.cooldown || 0) <= 0 && (isInsideUnorPoi(p.x, p.y, pois.church, pad) || Math.hypot(p.x - basa.x, p.y - basa.y) <= (basa.radius + pad))) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Pochovat basu v márnici' : '[E] Pochovat basu v márnici',
        label: 'BASA',
        icon: 'music',
        category: 'church',
        targetX: basa.x,
        targetY: basa.y,
      };
    }
    if (isInsideUnorPoi(p.x, p.y, pois.shrine, pad) && (un.shrineCooldown || 0) <= 0) {
      return {
        canInteract: true,
        prompt: isMobile ? '[KLEPNI] Posvěcené chvojí u Božích muk' : '[E] Posvěcené chvojí u Božích muk',
        label: 'CHVOJÍ',
        icon: 'herbs',
        category: 'shrine',
        targetX: pois.shrine.x,
        targetY: pois.shrine.y,
      };
    }
  }

  // 3. Interactive Drops (Chests)
  if (engine.drops && engine.drops.length > 0) {
    const dropRange = isMobile ? 240 : 165;
    const dropRangeSq = dropRange * dropRange;
    for (let i = 0; i < engine.drops.length; i++) {
      const d = engine.drops[i];
      if (!d || d.dead || !isInteractiveArenaDrop(d.type)) continue;
      const dx = d.x - p.x;
      const dy = d.y - p.y;
      if (dx * dx + dy * dy <= dropRangeSq) {
        return {
          canInteract: true,
          prompt: isMobile ? '[KLEPNI] Otevřít truhlu' : '[E] Otevřít truhlu',
          label: 'TRUHLA',
          icon: 'chest',
          category: 'chest',
          targetX: d.x,
          targetY: d.y,
        };
      }
    }
  }

  return {
    canInteract: false,
    prompt: null,
    label: 'POUŽÍT',
    icon: 'hand',
    category: 'none',
  };
}
