import { describe, it, expect } from 'vitest';
import {
  getArenaInteractionPadding,
  formatInteractPrompt,
  evaluateArenaInteraction,
} from '../src/game/arenaInteractions';
import { MARCH_THAW_POIS } from '../src/data/marchThawArena';
import { DUBEN_POIS } from '../src/data/dubnovyDenArena';
import { KVETEN_POIS } from '../src/data/kvetenArena';
import { getCervenPois } from '../src/data/cervenArena';
import { getSrpenPois } from '../src/data/srpenArena';
import { getProsinecPois } from '../src/data/prosinecArena';
import { getLedenPois } from '../src/data/ledenArena';
import { getUnorPois } from '../src/data/unorArena';

describe('Arena Interactions & Mobile Accessibility', () => {
  describe('getArenaInteractionPadding', () => {
    it('returns default desktop padding of 35px when not on mobile', () => {
      expect(getArenaInteractionPadding(false, 0)).toBe(35);
      expect(getArenaInteractionPadding(false, 5)).toBe(35);
    });

    it('returns generous expanded catchment zone on mobile screens', () => {
      // Base level 0 gives 75px
      expect(getArenaInteractionPadding(true, 0)).toBe(75);
      // Level 5 gives 75 + 5 * 3.5 = 92.5px
      expect(getArenaInteractionPadding(true, 5)).toBe(92.5);
      // Level 10 gives 75 + 10 * 3.5 = 110px
      expect(getArenaInteractionPadding(true, 10)).toBe(110);
    });

    it('clamps accessibility level within [0, 10]', () => {
      expect(getArenaInteractionPadding(true, -5)).toBe(75);
      expect(getArenaInteractionPadding(true, 99)).toBe(110);
    });
  });

  describe('formatInteractPrompt', () => {
    it('returns null for empty strings', () => {
      expect(formatInteractPrompt(null, false)).toBeNull();
      expect(formatInteractPrompt(undefined, false)).toBeNull();
      expect(formatInteractPrompt('', false)).toBeNull();
    });

    it('formats [E] and [X] to [KLEPNI] on mobile/touch screens', () => {
      expect(formatInteractPrompt('[E] Rozeznít zvon', true)).toBe('[KLEPNI] Rozeznít zvon');
      expect(formatInteractPrompt('[X] / [E] Aktivovat', true)).toBe('[KLEPNI] / [KLEPNI] Aktivovat');
      expect(formatInteractPrompt('[E] Narazit soudek', true, false)).toBe('[KLEPNI] Narazit soudek');
    });

    it('formats prompts for gamepad controls', () => {
      expect(formatInteractPrompt('[E] Rozeznít zvon', false, true)).toBe('[X] Rozeznít zvon');
    });

    it('retains [E] for desktop keyboard players', () => {
      expect(formatInteractPrompt('[E] Rozeznít zvon', false, false)).toBe('[E] Rozeznít zvon');
    });
  });

  describe('evaluateArenaInteraction', () => {
    it('returns cannot interact when engine or player is missing', () => {
      const res = evaluateArenaInteraction(null, false);
      expect(res.canInteract).toBe(false);
      expect(res.category).toBe('none');
    });

    it('detects Grandfather shop within generous mobile catchment (290px vs desktop 220px)', () => {
      const engine = {
        player: { x: 0, y: 0 },
        grandfather: { active: true, x: 260, y: 0 },
      };

      // Desktop: 260px is outside desktop threshold (220px)
      const desktopRes = evaluateArenaInteraction(engine, false);
      expect(desktopRes.canInteract).toBe(false);

      // Mobile: 260px is within mobile threshold (290px)
      const mobileRes = evaluateArenaInteraction(engine, true);
      expect(mobileRes.canInteract).toBe(true);
      expect(mobileRes.category).toBe('shop');
      expect(mobileRes.label).toBe('OBCHOD');
      expect(mobileRes.prompt).toContain('[KLEPNI]');
    });

    it('detects March church bell with mobile buffer', () => {
      const churchPoi = MARCH_THAW_POIS.church;
      // Distance from church center: church.radius + 60px
      // Desktop padding (35px): outside
      // Mobile padding (75px+): inside
      const playerX = churchPoi.x + churchPoi.radius + 60;
      const playerY = churchPoi.y;
      const engine = {
        activeLevelId: 0,
        player: { x: playerX, y: playerY },
        grandfather: { active: false },
        marchThaw: { bellCooldown: 0 },
      };

      const desktopRes = evaluateArenaInteraction(engine, false);
      expect(desktopRes.canInteract).toBe(false);

      const mobileRes = evaluateArenaInteraction(engine, true, 5);
      expect(mobileRes.canInteract).toBe(true);
      expect(mobileRes.label).toBe('ZVONICE');
      expect(mobileRes.icon).toBe('bell');
      expect(mobileRes.category).toBe('church');
      expect(mobileRes.prompt).toContain('[KLEPNI]');
    });

    it('detects April Easter / Walpurgis church bell in Dubnový den', () => {
      const churchPoi = DUBEN_POIS.church;
      const engine = {
        activeLevelId: 2,
        player: { x: churchPoi.x + 20, y: churchPoi.y + 20 },
        grandfather: { active: false },
        dubenDen: { bellCooldown: 0 },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('ZVONICE');
      expect(res.prompt).toContain('Velikonoční zvon ze Říma');
    });

    it('detects Maypole keg in Květen', () => {
      const tavernPoi = KVETEN_POIS.tavern;
      const engine = {
        activeLevelId: 4,
        player: { x: tavernPoi.x + 10, y: tavernPoi.y + 10 },
        grandfather: { active: false },
        kveten: { kegCooldown: 0 },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('SOUDEK');
      expect(res.icon).toBe('beer');
    });

    it('detects Svatojánský poklad in Červnová noc with expanded mobile catchment', () => {
      const engine = {
        activeLevelId: 7, // night
        player: { x: 100, y: 100 },
        grandfather: { active: false },
        cerven: {
          poklad: { x: 260, y: 100, unlocked: true, opened: false }, // 160px away
          bellCooldown: 0,
        },
      };

      // Desktop threshold is 125px -> outside
      const deskRes = evaluateArenaInteraction(engine, false);
      expect(deskRes.canInteract).toBe(false);

      // Mobile threshold is 180px -> inside
      const mobRes = evaluateArenaInteraction(engine, true);
      expect(mobRes.canInteract).toBe(true);
      expect(mobRes.label).toBe('POKLAD');
      expect(mobRes.icon).toBe('chest');
    });

    it('detects Srpen chlebová pec in daytime village green', () => {
      const srpenPois = getSrpenPois(false);
      const engine = {
        activeLevelId: 10,
        player: { x: srpenPois.village.x, y: srpenPois.village.y },
        grandfather: { active: false },
        srpen: {
          chlebovaPec: { x: srpenPois.village.x, y: srpenPois.village.y, radius: 45, cooldown: 0 },
        },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('PECE');
      expect(res.icon).toBe('bread');
    });

    it('detects Prosinec advent wreath in daytime village green', () => {
      const prosinecPois = getProsinecPois(false);
      const engine = {
        activeLevelId: 18,
        player: { x: prosinecPois.village.x, y: prosinecPois.village.y },
        grandfather: { active: false },
        prosinec: {
          advent: { x: prosinecPois.village.x, y: prosinecPois.village.y, radius: 45, cooldown: 0 },
        },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('ADVENT');
      expect(res.icon).toBe('candle');
    });

    it('detects Leden snowman building in Level 20', () => {
      const ledenPois = getLedenPois(false);
      const engine = {
        activeLevelId: 20,
        player: { x: ledenPois.village.x, y: ledenPois.village.y },
        grandfather: { active: false },
        leden: {
          snehulak: { x: ledenPois.village.x, y: ledenPois.village.y, radius: 45, cooldown: 0 },
        },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('SNĚHULÁK');
    });

    it('detects Unor koblihy frying in Level 22', () => {
      const unorPois = getUnorPois(false);
      const engine = {
        activeLevelId: 22,
        player: { x: unorPois.tavern.x, y: unorPois.tavern.y },
        grandfather: { active: false },
        unor: {
          koblihy: { x: unorPois.tavern.x, y: unorPois.tavern.y, radius: 45, cooldown: 0 },
        },
      };

      const res = evaluateArenaInteraction(engine, true);
      expect(res.canInteract).toBe(true);
      expect(res.label).toBe('KOBLIHY');
    });

    it('detects interactive chests with expanded mobile catchment (240px)', () => {
      const engine = {
        activeLevelId: 0,
        player: { x: 0, y: 0 },
        grandfather: { active: false },
        drops: [
          { x: 210, y: 0, type: 'chest', dead: false },
        ],
      };

      // Desktop: 210px is outside desktop 165px threshold
      const deskRes = evaluateArenaInteraction(engine, false);
      expect(deskRes.canInteract).toBe(false);

      // Mobile: 210px is within mobile 240px threshold
      const mobRes = evaluateArenaInteraction(engine, true);
      expect(mobRes.canInteract).toBe(true);
      expect(mobRes.label).toBe('TRUHLA');
      expect(mobRes.icon).toBe('chest');
      expect(mobRes.prompt).toContain('[KLEPNI]');
    });
  });
});
