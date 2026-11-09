/**
 * World Hazards, Anomalies & Encounters Renderer (Vykreslování terénu, anomálií a setkání)
 * 
 * Renders tactical terrain hazards (Zrádný terén: bláto, námraza, magmatické trhliny),
 * melting snowman puddles, Bubácká díra anomalies, holy chalk circles,
 * grandfather encounters, companions, and player ground weapon auras.
 * 
 * ADR 0017, ADR 0020, ADR 0029
 */

import { COLORS } from '../constants';
import { Lada, drawValecniceCompanion } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';
import {
  MARCH_THAW_POIS,
  getMarchPois,
  getMarchPoisList,
  getActiveMarchForestZone,
  isInsideMarchPoi,
} from '../data/marchThawArena';
import {
  DUBEN_POIS,
  DUBEN_POIS_LIST,
  getDubenPois,
  getDubenPoisList,
  getActiveDubenForestZone,
  isInsideDubenPoi,
} from '../data/dubnovyDenArena';
import {
  KVETEN_POIS,
  getKvetenPois,
  getKvetenPoisList,
  isInsideKvetenPoi,
} from '../data/kvetenArena';
import {
  getCervenPois,
  getCervenPoisList,
  isInsideCervenPoi,
} from '../data/cervenArena';
import {
  getCervenecPois,
  getCervenecPoisList,
  isInsideCervenecPoi,
} from '../data/cervenecArena';
import {
  getSrpenPois,
  getSrpenPoisList,
  isInsideSrpenPoi,
} from '../data/srpenArena';
import {
  getZariPois,
  getZariPoisList,
  isInsideZariPoi,
} from '../data/zariArena';
import {
  getRijenPois,
  getRijenPoisList,
  isInsideRijenPoi,
} from '../data/rijenArena';
import {
  getListopadPois,
  getListopadPoisList,
  isInsideListopadPoi,
} from '../data/listopadArena';
import {
  getProsinecPois,
  getProsinecPoisList,
  isInsideProsinecPoi,
} from '../data/prosinecArena';
import {
  getLedenPois,
  getLedenPoisList,
  isInsideLedenPoi,
} from '../data/ledenArena';
import {
  getUnorPois,
  getUnorPoisList,
  isInsideUnorPoi,
} from '../data/unorArena';
import {
  drawSvatojanskaBylina,
  drawSvatojanskyPoklad,
} from './cervenSvgLandscape';
import {
  drawMarianApparition,
  getMarianApparitionVisualState,
} from './marchThawSvgLandscape';
import { getRankedWeaponStats } from '../data/weaponMilestones';
import { isGameEffectEnabled } from '../game/effectSettings';
import { tryEmitParticle } from '../game/particles';
import { gamepadManager } from '../game/gamepad';
import { formatInteractPrompt } from '../game/arenaInteractions';

function getLocalizedBannerText(text: string | null | undefined, engine: any): string | null {
  if (!text) return null;
  const isTouch = Boolean(engine.touchEnabled || engine.isMobile);
  const isGamepad = Boolean(engine.isGamepad || gamepadManager.activeDevice === 'gamepad');
  return formatInteractPrompt(text, isTouch, isGamepad);
}

export interface WorldHazardsRenderOptions {
  warningIndicatorsEnabled?: boolean;
  statusIndicatorsEnabled?: boolean;
  combatVfxEnabled?: boolean;
  snowmanHorde?: any;
  isPaused?: boolean;
  deferCombatVfxToOverlayPass?: boolean;
}

export function renderWorldHazardsAndEncounters(
  ctx: CanvasRenderingContext2D,
  engine: any,
  camera: CameraViewport,
  options?: WorldHazardsRenderOptions
): void {
  const { viewLeft, viewTop, viewRight, viewBottom } = camera;
  const player = engine.player;
  const uiTime = engine.uiTime || 0;

  // 1. Level 0 & 1: March Thaw Arena (Beer puddle, Kaplička Marian Apparition & Day/Night POI hints)
  if ((engine.activeLevelId === 0 || engine.activeLevelId === 1) && engine.marchThaw) {
    const thaw = engine.marchThaw;
    const isMarchNight = engine.activeLevelId === 1;
    const marchPois = getMarchPois(isMarchNight);
    const marchPoiList = getMarchPoisList(isMarchNight);

    if (thaw.beerPuddle && isInView(thaw.beerPuddle.x, thaw.beerPuddle.y, 60, camera)) {
      ctx.save();
      ctx.translate(thaw.beerPuddle.x, thaw.beerPuddle.y);
      // ADR 0045: Calm 60% floor rule - watercolor beer wash capped at max 0.35 opacity without dark stroke
      ctx.globalAlpha = Math.min(0.35, thaw.beerPuddle.time / 1.2);
      ctx.fillStyle = 'rgba(217, 139, 34, 0.85)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 24, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, -2, 38, 16, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * 13, -3 + (i & 1) * 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Brief Marian Apparition at Kaplička: appears small, grows larger while scattering bubáci, then vanishes
    const shrinePoi = marchPois.shrine;
    const appTimer = thaw.apparitionTimer || 0;
    const marianVisual = getMarianApparitionVisualState(appTimer, thaw.shrineCharge || 0);
    if (marianVisual.visible && isInView(shrinePoi.x, shrinePoi.y - 120, 580, camera)) {
      ctx.save();
      ctx.translate(shrinePoi.x, shrinePoi.y);

      if (appTimer > 0) {
        // Expanding golden Marian grace rings scaled by the growing apparition
        for (let rIdx = 0; rIdx < 2; rIdx++) {
          const waveFrac = ((uiTime * 0.95 + rIdx * 0.5) % 1);
          const waveRadius = 45 + waveFrac * marianVisual.auraRadius;
          ctx.strokeStyle = `rgba(250, 204, 21, ${(1 - waveFrac) * 0.65 * marianVisual.alpha})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, -40, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      drawMarianApparition(ctx, uiTime, marianVisual, false);
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof marchPoiList)[number] | undefined;
      for (let i = 0; i < marchPoiList.length; i++) {
        if (isInsideMarchPoi(player.x, player.y, marchPoiList[i], 30)) {
          nearbyPoi = marchPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? marchPois.forest : undefined);
      if (nearby) {
        const isTouch = Boolean(engine.touchEnabled || engine.isMobile);
        const isGp = gamepadManager.activeDevice === 'gamepad';
        const interactHint = isTouch ? '[KLEPNI] Aktivovat' : (isGp ? '[X] / [E] Aktivovat' : '[E] / [X] Aktivovat');
        let detail = nearby.hint;
        let canInteractPoi = false;
        if (nearby.id === 'church') {
          if (thaw.bellCooldown > 0) {
            detail = `Zvonice se rozezní za ${Math.ceil(thaw.bellCooldown)} s (+20 % zbroj a léčení)`;
          } else {
            detail = `${interactHint}: Kostelní zvonice (Svatý otřes)`;
            canInteractPoi = true;
          }
        }
        if (nearby.id === 'tavern') {
          if (thaw.kegCooldown > 0) {
            detail = `Soudek dovalí za ${Math.ceil(thaw.kegCooldown)} s (+18 % útok)`;
          } else {
            detail = `${interactHint}: Hospodský soudek (+18 % útok)`;
            canInteractPoi = true;
          }
        }
        if (nearby.id === 'shrine') {
          if ((thaw.apparitionTimer || 0) > 0) {
            detail = `✦ Zjevení Panny Marie s Ježíškem rozhání bubáky (${Math.ceil(thaw.apparitionTimer)} s)!`;
          } else if (thaw.shrineCooldown > 0) {
            detail = `Kaplička: Panna Maria se znovu zjeví za ${Math.ceil(thaw.shrineCooldown)} s (+20 % kadence)`;
          } else {
            detail = `${interactHint}: Kaplička — Zjevení Panny Marie`;
            canInteractPoi = true;
          }
        }
        ctx.save();
        ctx.fillStyle = canInteractPoi ? 'rgba(254, 243, 199, .96)' : 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = canInteractPoi ? 2.5 : 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 175, player.y - 88, 350, 31, 8);
        } else {
          ctx.rect(player.x - 175, player.y - 88, 350, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = canInteractPoi ? '#5B2118' : '#472A16';
        ctx.font = '900 12.5px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(detail, player.x, player.y - 72);

        if (canInteractPoi && isInView(nearby.x, nearby.y, 140, camera)) {
          ctx.fillStyle = '#FEF08A';
          ctx.strokeStyle = '#1C1917';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(nearby.x - 86, nearby.y - 98, 172, 26, 8);
          } else {
            ctx.rect(nearby.x - 86, nearby.y - 98, 172, 26);
          }
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#78350F';
          ctx.font = '900 12.5px Eczar, serif';
          ctx.fillText(interactHint, nearby.x, nearby.y - 85);
        }
        ctx.restore();
      }
    }
  }

  // 1b. Level 2 & 3 (Stage 3: Dubnový den & Stage 4: Filipojakubská noc): Maypole/bonfire ward ring, bell shockwave & POI hints
  if ((engine.activeLevelId === 2 || engine.activeLevelId === 3) && engine.dubenDen) {
    const duben = engine.dubenDen;
    const isDubenNight = engine.activeLevelId === 3;
    const dubenPois = getDubenPois(isDubenNight);
    const dubenPoiList = getDubenPoisList(isDubenNight);

    // Protective Maypole / Filipojakubská vatra aura ring on village green when active
    if (duben.maypoleWardActive && isInView(dubenPois.village.x, dubenPois.village.y, dubenPois.village.radius + 40, camera)) {
      ctx.save();
      ctx.strokeStyle = isDubenNight ? 'rgba(251, 146, 60, 0.68)' : 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(dubenPois.village.x, dubenPois.village.y, dubenPois.village.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Expanding Easter / Walpurgis bell holy wave ring at Kostel sv. Jiří
    if ((duben.bellWaveTimer || 0) > 0 && isInView(dubenPois.church.x, dubenPois.church.y, 580, camera)) {
      ctx.save();
      const prog = 1 - Math.min(1, duben.bellWaveTimer / 3.5);
      const radius = 80 + prog * 460;
      ctx.strokeStyle = `rgba(254, 240, 138, ${Math.max(0.15, (1 - prog) * 0.85)})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(dubenPois.church.x, dubenPois.church.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof dubenPoiList)[number] | undefined;
      for (let i = 0; i < dubenPoiList.length; i++) {
        if (isInsideDubenPoi(player.x, player.y, dubenPoiList[i], 30)) {
          nearbyPoi = dubenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveDubenForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? dubenPois.forest : undefined);
      if (nearby) {
        const isTouch = Boolean(engine.touchEnabled || engine.isMobile);
        const isGp = gamepadManager.activeDevice === 'gamepad';
        const interactHint = isTouch ? '[KLEPNI] Aktivovat' : (isGp ? '[X] / [E] Aktivovat' : '[E] / [X] Aktivovat');
        let detail = nearby.hint;
        let canInteractPoi = false;
        if (nearby.id === 'church') {
          if ((duben.bellCooldown || 0) > 0) {
            detail = `Zvon sv. Jiří se rozezní za ${Math.ceil(duben.bellCooldown)} s (+20 % zbroj a léčení)`;
          } else {
            detail = isDubenNight
              ? `${interactHint}: Půlnoční zvon sv. Jiří (Svatý otřes proti sabatu)`
              : `${interactHint}: Velikonoční zvon ze Říma (Svatý otřes)`;
            canInteractPoi = true;
          }
        }
        ctx.save();
        ctx.fillStyle = canInteractPoi ? 'rgba(254, 243, 199, .96)' : 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = canInteractPoi ? 2.5 : 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 195, player.y - 88, 390, 31, 8);
        } else {
          ctx.rect(player.x - 195, player.y - 88, 390, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = canInteractPoi ? '#5B2118' : '#472A16';
        ctx.font = '900 12.5px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(detail, player.x, player.y - 72);

        if (canInteractPoi && isInView(nearby.x, nearby.y, 140, camera)) {
          ctx.fillStyle = '#FEF08A';
          ctx.strokeStyle = '#1C1917';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(nearby.x - 86, nearby.y - 98, 172, 26, 8);
          } else {
            ctx.rect(nearby.x - 86, nearby.y - 98, 172, 26);
          }
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#78350F';
          ctx.font = '900 12.5px Eczar, serif';
          ctx.fillText(interactHint, nearby.x, nearby.y - 85);
        }
        ctx.restore();
      }
    }
  }

  // 1c. Level 4 & 5 (Stage 5: Májová slavnost & Stage 6: Májová noc): POI hints & Nepomucký shrine aura
  if (engine.activeLevelId === 4 || engine.activeLevelId === 5) {
    const isKvetenNight = engine.activeLevelId === 5;
    const kvetenPois = getKvetenPois(isKvetenNight);
    const kvetenPoiList = getKvetenPoisList(isKvetenNight);

    if (player) {
      let nearbyPoi: (typeof kvetenPoiList)[number] | undefined;
      for (let i = 0; i < kvetenPoiList.length; i++) {
        if (isInsideKvetenPoi(player.x, player.y, kvetenPoiList[i], 30)) {
          nearbyPoi = kvetenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? kvetenPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.kvetenActivePoiPrompt || nearby?.hint, engine);
      if (nearby && bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 205, player.y - 88, 410, 31, 8);
        } else {
          ctx.rect(player.x - 205, player.y - 88, 410, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12.5px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1d. Level 6 & 7 (Stage 7: Letní senoseč & Stage 8: Červnová noc): POI hints & Svatojánské byliny / Poklad v zemi
  if (engine.activeLevelId === 6 || engine.activeLevelId === 7) {
    const isCervenNight = engine.activeLevelId === 7;
    const cervenPois = getCervenPois(isCervenNight);
    const cervenPoiList = getCervenPoisList(isCervenNight);

    // Stage 8 (Červnová noc): Render uncollected St. John's herbs, buried Earth Treasure, and firefly compass
    if (isCervenNight && engine.cerven) {
      const uiTime = engine.uiTime || 0;
      const herbs = engine.cerven.herbs;
      let nearestHerb: any = null;
      let nearestHerbDistSq = Infinity;

      if (Array.isArray(herbs)) {
        for (let i = 0; i < herbs.length; i++) {
          const herb = herbs[i];
          if (herb.collected) continue;
          if (player) {
            const dx = herb.x - player.x;
            const dy = herb.y - player.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < nearestHerbDistSq) {
              nearestHerbDistSq = dSq;
              nearestHerb = herb;
            }
          }
          if (!isInView(herb.x, herb.y, 48, camera)) continue;
          drawSvatojanskaBylina(ctx, herb.x, herb.y, herb.flowerColor, herb.glowColor, uiTime);
          if (player) {
            const pdx = herb.x - player.x;
            const pdy = herb.y - player.y;
            if (pdx * pdx + pdy * pdy <= 340 * 340) {
              ctx.save();
              ctx.fillStyle = herb.glowColor || '#FEF08A';
              ctx.strokeStyle = '#1C1917';
              ctx.lineWidth = 2.5;
              ctx.font = '800 11px Eczar, Georgia, serif';
              ctx.textAlign = 'center';
              ctx.strokeText(`🌿 ${herb.name}`, herb.x, herb.y - 26);
              ctx.fillText(`🌿 ${herb.name}`, herb.x, herb.y - 26);
              ctx.restore();
            }
          }
        }
      }

      const poklad = engine.cerven.poklad;
      if (poklad && isInView(poklad.x, poklad.y, 65, camera)) {
        drawSvatojanskyPoklad(ctx, poklad.x, poklad.y, Boolean(poklad.unlocked), Boolean(poklad.opened), uiTime);
        if (poklad.unlocked && !poklad.opened) {
          ctx.save();
          ctx.fillStyle = '#FEF08A';
          ctx.strokeStyle = '#1C1917';
          ctx.lineWidth = 2.5;
          ctx.font = '900 12px Eczar, Georgia, serif';
          ctx.textAlign = 'center';
          ctx.strokeText('🌿 POKLAD V ZEMI OTEVŘEN! [VSTUP NEBO E]', poklad.x, poklad.y - 44);
          ctx.fillText('🌿 POKLAD V ZEMI OTEVŘEN! [VSTUP NEBO E]', poklad.x, poklad.y - 44);
          ctx.restore();
        }
      }

      // Svatojánská muška compass around the hunter guiding to the nearest uncollected herb or unlocked Poklad
      if (player) {
        const targetObj = poklad && poklad.unlocked && !poklad.opened ? poklad : nearestHerb;
        if (targetObj) {
          const tdx = targetObj.x - player.x;
          const tdy = targetObj.y - player.y;
          const tDist = Math.hypot(tdx, tdy);
          if (tDist > 95) {
            const ang = Math.atan2(tdy, tdx);
            const compassR = 76;
            const cx = player.x + Math.cos(ang) * compassR;
            const cy = player.y + Math.sin(ang) * compassR;
            const isPokladTarget = targetObj === poklad;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = isPokladTarget ? 'rgba(250, 204, 21, 0.35)' : 'rgba(163, 230, 53, 0.32)';
            ctx.beginPath();
            ctx.arc(0, 0, 12 + Math.sin(uiTime * 6) * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.rotate(ang);
            ctx.fillStyle = isPokladTarget ? '#FACC15' : '#A3E635';
            ctx.strokeStyle = '#1C1917';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(9, 0);
            ctx.lineTo(-6, -6);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-6, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    if (player) {
      let nearbyPoi: (typeof cervenPoiList)[number] | undefined;
      for (let i = 0; i < cervenPoiList.length; i++) {
        if (isInsideCervenPoi(player.x, player.y, cervenPoiList[i], 30)) {
          nearbyPoi = cervenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? cervenPois.forest : undefined);
      const herbsNote =
        isCervenNight && engine.cerven && Array.isArray(engine.cerven.herbs)
          ? ` [🌿 Byliny: ${engine.cerven.herbsCollected || 0}/${engine.cerven.herbsTarget || 9}]`
          : '';
      const bannerText = getLocalizedBannerText(engine.cervenActivePoiPrompt || (nearby ? `${nearby.title}${herbsNote}` : null), engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 220, player.y - 88, 440, 31, 8);
        } else {
          ctx.rect(player.x - 220, player.y - 88, 440, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1e. Level 8 & 9 (Stage 9: Červencové žně & Stage 10: Bouře sv. Eliáše): POI hints & St. Elias lightning warning
  if (engine.activeLevelId === 8 || engine.activeLevelId === 9) {
    const isCervenecNight = engine.activeLevelId === 9;
    const cervenecPois = getCervenecPois(isCervenecNight);
    const cervenecPoiList = getCervenecPoisList(isCervenecNight);

    // Stage 10: St. Elias lightning strike ground telegraph
    const strikeWarn = engine.cervenec?.stormWarning;
    if (isCervenecNight && strikeWarn && strikeWarn.timer > 0 && isInView(strikeWarn.x, strikeWarn.y, strikeWarn.radius + 30, camera)) {
      const progress = 1 - Math.max(0, Math.min(1, strikeWarn.timer / (strikeWarn.maxTimer || 1.65)));
      ctx.save();
      ctx.translate(strikeWarn.x, strikeWarn.y);
      ctx.fillStyle = `rgba(96, 165, 250, ${0.18 + progress * 0.28})`;
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, strikeWarn.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(6, strikeWarn.radius * (1 - progress)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof cervenecPoiList)[number] | undefined;
      for (let i = 0; i < cervenecPoiList.length; i++) {
        if (isInsideCervenecPoi(player.x, player.y, cervenecPoiList[i], 30)) {
          nearbyPoi = cervenecPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? cervenecPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.cervenecActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1f. Level 10 & 11 (Stage 11: Dožínková slavnost & Stage 12: Vavřinecká noc): POI hints & Perseid star warning
  if (engine.activeLevelId === 10 || engine.activeLevelId === 11) {
    const isSrpenNight = engine.activeLevelId === 11;
    const srpenPois = getSrpenPois(isSrpenNight);
    const srpenPoiList = getSrpenPoisList(isSrpenNight);

    // Stage 12: Perseid falling star ground telegraph
    const starWarn = engine.srpen?.vatra?.starWarning;
    if (isSrpenNight && starWarn && starWarn.timer > 0 && isInView(starWarn.x, starWarn.y, starWarn.radius + 30, camera)) {
      const progress = 1 - Math.max(0, Math.min(1, starWarn.timer / (starWarn.maxTimer || 2.2)));
      ctx.save();
      ctx.translate(starWarn.x, starWarn.y);
      ctx.fillStyle = `rgba(253, 224, 71, ${0.16 + progress * 0.32})`;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, starWarn.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(6, starWarn.radius * (1 - progress)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof srpenPoiList)[number] | undefined;
      for (let i = 0; i < srpenPoiList.length; i++) {
        if (isInsideSrpenPoi(player.x, player.y, srpenPoiList[i], 30)) {
          nearbyPoi = srpenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? srpenPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.srpenActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1g. Level 12 & 13 (Stage 13: Zářijové posvícení & Stage 14: Svatováclavská noc): POI hints, Kotel na povidla splash & Svatováclavský vichr telegraph
  if (engine.activeLevelId === 12 || engine.activeLevelId === 13) {
    const isZariNight = engine.activeLevelId === 13;
    const zariPois = getZariPois(isZariNight);
    const zariPoiList = getZariPoisList(isZariNight);

    // Stage 13: Kotel na povidla warm plum-butter splash ring when stirred
    const kotel = engine.zari?.kotel;
    if (!isZariNight && kotel && kotel.stirActiveTimer > 0 && isInView(kotel.x, kotel.y, kotel.radius + 220, camera)) {
      ctx.save();
      ctx.translate(kotel.x, kotel.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 6);
      ctx.fillStyle = `rgba(107, 33, 168, ${0.14 + pulse * 0.12})`;
      ctx.strokeStyle = '#C084FC';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 380, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Stage 14: Svatováclavský svatý oheň warm protective ring & Svatováclavský vichr ground telegraph
    const ohen = engine.zari?.ohen;
    if (isZariNight && ohen && ohen.blessingActiveTimer > 0 && isInView(ohen.x, ohen.y, ohen.radius + 260, camera)) {
      ctx.save();
      ctx.translate(ohen.x, ohen.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 5);
      ctx.fillStyle = `rgba(251, 191, 36, ${0.12 + pulse * 0.1})`;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.8;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 440, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    const mistWarn = ohen?.mistWarning;
    if (isZariNight && mistWarn && mistWarn.timer > 0 && isInView(mistWarn.x, mistWarn.y, mistWarn.radius + 30, camera)) {
      const progress = 1 - Math.max(0, Math.min(1, mistWarn.timer / (mistWarn.maxTimer || 2.3)));
      ctx.save();
      ctx.translate(mistWarn.x, mistWarn.y);
      ctx.fillStyle = `rgba(125, 211, 252, ${0.16 + progress * 0.30})`;
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, mistWarn.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(6, mistWarn.radius * (1 - progress)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof zariPoiList)[number] | undefined;
      for (let i = 0; i < zariPoiList.length; i++) {
        if (isInsideZariPoi(player.x, player.y, zariPoiList[i], 30)) {
          nearbyPoi = zariPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? zariPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.zariActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1h. Level 14 & 15 (Stage 15: Říjnová drakiáda & Stage 16: Dušičková noc): POI hints, Ohníček z natě burst & Dušičková svíce aura
  if (engine.activeLevelId === 14 || engine.activeLevelId === 15) {
    const isRijenNight = engine.activeLevelId === 15;
    const rijenPois = getRijenPois(isRijenNight);
    const rijenPoiList = getRijenPoisList(isRijenNight);

    // Stage 15: Ohníček z bramborové natě warm fragrant smoke & ember burst ring
    const ohnicek = engine.rijen?.ohnicek;
    if (!isRijenNight && ohnicek && ohnicek.smokeBurstTimer > 0 && isInView(ohnicek.x, ohnicek.y, ohnicek.radius + 220, camera)) {
      ctx.save();
      ctx.translate(ohnicek.x, ohnicek.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 6);
      ctx.fillStyle = `rgba(234, 88, 12, ${0.14 + pulse * 0.12})`;
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 380, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Stage 16: Dušičková svíce warm radiant sacred circle
    const svice = engine.rijen?.svice;
    if (isRijenNight && svice && svice.candleActiveTimer > 0 && isInView(svice.x, svice.y, svice.radius + 260, camera)) {
      ctx.save();
      ctx.translate(svice.x, svice.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 5);
      ctx.fillStyle = `rgba(253, 224, 71, ${0.14 + pulse * 0.12})`;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 440, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    const windWarn = svice?.windWarning;
    if (isRijenNight && windWarn && windWarn.timer > 0 && isInView(windWarn.x, windWarn.y, windWarn.radius + 30, camera)) {
      const progress = 1 - Math.max(0, Math.min(1, windWarn.timer / (windWarn.maxTimer || 2.3)));
      ctx.save();
      ctx.translate(windWarn.x, windWarn.y);
      ctx.fillStyle = `rgba(56, 189, 248, ${0.16 + progress * 0.30})`;
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, windWarn.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(6, windWarn.radius * (1 - progress)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof rijenPoiList)[number] | undefined;
      for (let i = 0; i < rijenPoiList.length; i++) {
        if (isInsideRijenPoi(player.x, player.y, rijenPoiList[i], 30)) {
          nearbyPoi = rijenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? rijenPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.rijenActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1i. Level 16 & 17 (Stage 17: Posvícenská husa & Stage 18: Mlhavá noc): POI hints & visual rings
  if (engine.activeLevelId === 16 || engine.activeLevelId === 17) {
    const isListopadNight = engine.activeLevelId === 17;
    const listopadPois = getListopadPois(isListopadNight);
    const listopadPoiList = getListopadPoisList(isListopadNight);

    if (player) {
      let nearbyPoi: (typeof listopadPoiList)[number] | undefined;
      for (let i = 0; i < listopadPoiList.length; i++) {
        if (isInsideListopadPoi(player.x, player.y, listopadPoiList[i], 30)) {
          nearbyPoi = listopadPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? listopadPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.listopadActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1j. Level 18 & 19 (Stage 19: Adventní čas & Stage 20: Štědrovečerní noc): POI hints & visual rings
  if (engine.activeLevelId === 18 || engine.activeLevelId === 19) {
    const isProsinecNight = engine.activeLevelId === 19;
    const prosinecPois = getProsinecPois(isProsinecNight);
    const prosinecPoiList = getProsinecPoisList(isProsinecNight);

    // Stage 19: Adventní věnec warm candle aura
    const advent = engine.prosinec?.advent;
    if (!isProsinecNight && advent && advent.lightTimer > 0 && isInView(advent.x, advent.y, advent.radius + 220, camera)) {
      ctx.save();
      ctx.translate(advent.x, advent.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 5);
      ctx.fillStyle = `rgba(253, 224, 71, ${0.16 + pulse * 0.12})`;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 420, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Stage 20: Štědrovečerní zvon chime ripple
    const zvon = engine.prosinec?.zvon;
    if (isProsinecNight && zvon && zvon.chimeTimer > 0 && isInView(zvon.x, zvon.y, zvon.radius + 250, camera)) {
      ctx.save();
      ctx.translate(zvon.x, zvon.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 4);
      ctx.fillStyle = `rgba(186, 230, 253, ${0.18 + pulse * 0.14})`;
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 500, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof prosinecPoiList)[number] | undefined;
      for (let i = 0; i < prosinecPoiList.length; i++) {
        if (isInsideProsinecPoi(player.x, player.y, prosinecPoiList[i], 30)) {
          nearbyPoi = prosinecPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? prosinecPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.prosinecActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1k. Level 20 & 21 (Stage 21: Tříkrálová koleda & Stage 22: Tříkrálová noc a perchta): POI hints & visual rings
  if (engine.activeLevelId === 20 || engine.activeLevelId === 21) {
    const isLedenNight = engine.activeLevelId === 21;
    const ledenPois = getLedenPois(isLedenNight);
    const ledenPoiList = getLedenPoisList(isLedenNight);

    // Stage 21: Sněhulák snow shield aura
    const snehulak = engine.leden?.snehulak;
    if (!isLedenNight && snehulak && snehulak.snowShieldTimer > 0 && isInView(snehulak.x, snehulak.y, snehulak.radius + 220, camera)) {
      ctx.save();
      ctx.translate(snehulak.x, snehulak.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 5);
      ctx.fillStyle = `rgba(186, 230, 253, ${0.16 + pulse * 0.12})`;
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 420, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Stage 22: Tříkrálová fara holy aura
    const fara = engine.leden?.fara;
    if (isLedenNight && fara && fara.holyAuraTimer > 0 && isInView(fara.x, fara.y, fara.radius + 250, camera)) {
      ctx.save();
      ctx.translate(fara.x, fara.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 4);
      ctx.fillStyle = `rgba(254, 240, 138, ${0.18 + pulse * 0.14})`;
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 500, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof ledenPoiList)[number] | undefined;
      for (let i = 0; i < ledenPoiList.length; i++) {
        if (isInsideLedenPoi(player.x, player.y, ledenPoiList[i], 30)) {
          nearbyPoi = ledenPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? ledenPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.ledenActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 1l. Level 22 & 23 (Stage 23: Masopustní průvod & Stage 24: Masopustní rej a pochovávání basy): POI hints & visual rings
  if (engine.activeLevelId === 22 || engine.activeLevelId === 23) {
    const isUnorNight = engine.activeLevelId === 23;
    const unorPois = getUnorPois(isUnorNight);
    const unorPoiList = getUnorPoisList(isUnorNight);

    // Stage 23: Koblihy frying aura
    const koblihy = engine.unor?.koblihy;
    if (!isUnorNight && koblihy && koblihy.speedBoostTimer > 0 && isInView(koblihy.x, koblihy.y, koblihy.radius + 220, camera)) {
      ctx.save();
      ctx.translate(koblihy.x, koblihy.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 5);
      ctx.fillStyle = `rgba(245, 158, 11, ${0.16 + pulse * 0.12})`;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 420, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Stage 24: Pochovávání basy holy shockwave aura
    const basa = engine.unor?.basa;
    if (isUnorNight && basa && basa.shockwaveTimer > 0 && isInView(basa.x, basa.y, basa.radius + 260, camera)) {
      ctx.save();
      ctx.translate(basa.x, basa.y);
      const pulse = 0.5 + 0.5 * Math.sin(uiTime * 4);
      ctx.fillStyle = `rgba(254, 240, 138, ${0.18 + pulse * 0.14})`;
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 520, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (player) {
      let nearbyPoi: (typeof unorPoiList)[number] | undefined;
      for (let i = 0; i < unorPoiList.length; i++) {
        if (isInsideUnorPoi(player.x, player.y, unorPoiList[i], 30)) {
          nearbyPoi = unorPoiList[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? unorPois.forest : undefined);
      const bannerText = getLocalizedBannerText(engine.unorActivePoiPrompt || nearby?.title, engine);
      if (bannerText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(player.x - 240, player.y - 88, 480, 31, 8);
        } else {
          ctx.rect(player.x - 240, player.y - 88, 480, 31);
        }
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 12px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bannerText, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 2. Active Hazards from RunDirector (Bláto, Námraza, Magmatické trhliny)
  const hazards = engine.activeHazards || engine.hazards;
  if (hazards && hazards.length > 0) {
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      if (!isInView(h.x, h.y, (h.radius || 30) + 20, camera)) continue;

      ctx.save();
      ctx.translate(h.x, h.y);
      const fadeAlpha = Math.min(1, (h.duration ?? 1) / 1.0);
      // ADR 0045: Puddles and ground hazards capped at max 0.35 opacity to preserve 60% calm floor
      ctx.globalAlpha = Math.min(0.35, 0.35 * fadeAlpha);

      const isWarning = (h.warningTimer || 0) > 0 && (options?.warningIndicatorsEnabled !== false);
      const justExploded = Boolean(h.exploded);

      if (h.kind === 'root-snare') {
        ctx.fillStyle = isWarning ? 'rgba(74, 222, 128, 0.25)' : 'rgba(63, 98, 18, 0.55)';
        ctx.strokeStyle = isWarning ? '#4ADE80' : '#365314';
        ctx.lineWidth = isWarning ? 3.0 : 2.6;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        // Tangled thorny woodland roots
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 3.2;
        for (let r = 0; r < 4; r++) {
          const ra = (r / 4) * Math.PI;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ra) * -h.radius * 0.78, Math.sin(ra) * -h.radius * 0.78);
          ctx.quadraticCurveTo(0, (r % 2 === 0 ? 1 : -1) * h.radius * 0.35, Math.cos(ra) * h.radius * 0.78, Math.sin(ra) * h.radius * 0.78);
          ctx.stroke();
        }
      } else if (h.kind === 'water-jar-trap') {
        ctx.fillStyle = isWarning ? 'rgba(56, 189, 248, 0.26)' : 'rgba(14, 165, 233, 0.48)';
        ctx.strokeStyle = isWarning ? '#38BDF8' : '#0369A1';
        ctx.lineWidth = isWarning ? 3.0 : 2.4;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        // Hastrman's painted soul jar in center
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 2, h.radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-h.radius * 0.24, -h.radius * 0.28, h.radius * 0.48, h.radius * 0.16);
        ctx.strokeRect(-h.radius * 0.24, -h.radius * 0.28, h.radius * 0.48, h.radius * 0.16);
      } else if (h.kind === 'hejkal-roar') {
        ctx.fillStyle = isWarning ? 'rgba(74, 222, 128, 0.22)' : 'rgba(22, 163, 74, 0.35)';
        ctx.strokeStyle = '#4ADE80';
        ctx.lineWidth = 3.0;
        if (isWarning) ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      } else if (h.kind === 'yolk-puddle') {
        // Authentic Easter egg yolk splatter - soft sunny gouache
        ctx.fillStyle = isWarning ? 'rgba(254, 240, 138, 0.35)' : 'rgba(250, 204, 21, 0.82)';
        ctx.beginPath();
        ctx.ellipse(0, 0, h.radius, h.radius * 0.72, 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Inner rich yolk core
        ctx.fillStyle = isWarning ? 'rgba(234, 179, 8, 0.45)' : 'rgba(217, 119, 6, 0.90)';
        ctx.beginPath();
        ctx.arc(-h.radius * 0.1, -h.radius * 0.05, h.radius * 0.38, 0, Math.PI * 2);
        ctx.fill();
        if (isWarning) {
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (h.kind === 'slush-puddle') {
        // Melty slush puddle in early spring
        ctx.fillStyle = isWarning ? 'rgba(186, 230, 253, 0.30)' : 'rgba(147, 197, 253, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, 0, h.radius, h.radius * 0.68, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.beginPath();
        ctx.arc(h.radius * 0.2, h.radius * 0.1, h.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        if (isWarning) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (h.type === 'mud') {
        // ADR 0045: Calm 60% floor rule - soft watercolor mud wash without dark ink outline
        ctx.fillStyle = isWarning ? 'rgba(120, 67, 35, 0.35)' : 'rgba(90, 56, 37, 0.85)';
        ctx.beginPath();
        if (h.kind === 'ground-shockwave' || h.kind === 'chain-shackle' || h.kind === 'rabbit-stomp' || h.kind === 'rock-stomp') {
          ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        } else {
          ctx.ellipse(0, 0, h.radius, h.radius * 0.65, 0.2, 0, Math.PI * 2);
        }
        ctx.fill();

        if (isWarning) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([7, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (h.kind === 'chain-shackle') {
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-h.radius * 0.65, -h.radius * 0.65);
          ctx.lineTo(h.radius * 0.65, h.radius * 0.65);
          ctx.moveTo(h.radius * 0.65, -h.radius * 0.65);
          ctx.lineTo(-h.radius * 0.65, h.radius * 0.65);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(120, 67, 35, 0.6)';
          ctx.beginPath();
          ctx.arc(-h.radius * 0.3, -h.radius * 0.1, 4, 0, Math.PI * 2);
          ctx.arc(h.radius * 0.2, h.radius * 0.15, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (h.type === 'water' || h.kind === 'water-geyser' || h.kind === 'mill-surge' || h.kind === 'whirlpool') {
        ctx.fillStyle = isWarning
          ? 'rgba(56, 189, 248, 0.28)'
          : justExploded
          ? 'rgba(186, 230, 253, 0.85)'
          : 'rgba(14, 165, 233, 0.45)';
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isWarning) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([7, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Swirling water ripple ring
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius * 0.55, 0.3, Math.PI * 1.65);
        ctx.stroke();
      } else if (h.kind === 'crow-vortex' || h.kind === 'triad-blizzard') {
        ctx.fillStyle = isWarning ? 'rgba(56, 189, 248, 0.26)' : 'rgba(14, 116, 144, 0.42)';
        ctx.strokeStyle = isWarning ? '#7DD3FC' : '#BAE6FD';
        ctx.lineWidth = isWarning ? 3.0 : 2.4;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        // Swirling cyclone arcs
        const spin = uiTime * 5;
        ctx.strokeStyle = h.kind === 'crow-vortex' ? '#1E293B' : '#E0F2FE';
        ctx.lineWidth = 2.2;
        for (let s = 0; s < 3; s++) {
          const sa = spin + (s / 3) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(0, 0, h.radius * 0.62, sa, sa + 1.15);
          ctx.stroke();
        }
      } else if (h.type === 'frost' && h.kind !== 'hail-circle') {
        ctx.fillStyle = isWarning
          ? 'rgba(186, 230, 253, 0.32)'
          : justExploded
          ? 'rgba(224, 242, 254, 0.82)'
          : 'rgba(186, 230, 253, 0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isWarning) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([7, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (h.kind === 'hail-circle') {
        ctx.fillStyle = isWarning
          ? 'rgba(186, 230, 253, 0.32)'
          : justExploded
          ? 'rgba(224, 242, 254, 0.85)'
          : 'rgba(147, 197, 253, 0.45)';
        ctx.strokeStyle = isWarning ? '#38BDF8' : justExploded ? '#FFFFFF' : '#0284C7';
        ctx.lineWidth = isWarning ? 3.0 : 2.2;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.4;
        for (const [hx, hy, hr] of [[-8, -6, 5], [10, -4, 6], [2, 8, 5.5], [-10, 10, 4.5]]) {
          ctx.beginPath();
          ctx.arc(hx, hy, hr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else if (h.type === 'soot' || h.kind === 'ink-smoke') {
        ctx.fillStyle = 'rgba(24, 24, 27, 0.78)';
        ctx.strokeStyle = 'rgba(9, 9, 11, 0.9)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(39, 39, 42, 0.65)';
        ctx.beginPath();
        ctx.arc(-h.radius * 0.25, -h.radius * 0.2, h.radius * 0.55, 0, Math.PI * 2);
        ctx.arc(h.radius * 0.3, h.radius * 0.15, h.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.kind === 'sulfur-flame' || h.kind === 'pitch-wreath') {
        const flicker = Math.sin((h.duration ?? 1) * 14 + h.x * 0.07 + h.y * 0.05) * 0.12 + 0.88;
        // Outer scorched sulfur/pitch pool with bold ink ring
        ctx.fillStyle = isWarning ? 'rgba(249, 115, 22, 0.28)' : 'rgba(234, 88, 12, 0.52)';
        ctx.strokeStyle = isWarning ? '#F97316' : COLORS.ink;
        ctx.lineWidth = isWarning ? 3.0 : 2.2;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Bright burning sulfur-yellow core
        ctx.fillStyle = 'rgba(250, 204, 21, 0.78)';
        ctx.beginPath();
        ctx.arc(0, 0, h.radius * 0.68 * flicker, 0, Math.PI * 2);
        ctx.fill();

        // Flickering flame tongues
        ctx.fillStyle = '#FEF08A';
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const flameR = h.radius * 0.52 * flicker;
        ctx.moveTo(-flameR * 0.7, flameR * 0.3);
        ctx.lineTo(-flameR * 0.35, -flameR * 0.95);
        ctx.lineTo(0, -flameR * 0.25);
        ctx.lineTo(flameR * 0.35, -flameR * 1.05);
        ctx.lineTo(flameR * 0.7, flameR * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (h.kind === 'straw-effigy') {
        // Authentic Czech Folklore Straw Effigy Totem (Slaměná modla zimy)
        ctx.fillStyle = isWarning ? 'rgba(253, 224, 71, 0.28)' : 'rgba(217, 119, 6, 0.45)';
        ctx.strokeStyle = isWarning ? '#FDE047' : '#B45309';
        ctx.lineWidth = isWarning ? 3.0 : 2.4;
        if (isWarning) ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Central straw effigy with wooden cross & red ribbons
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(0, -h.radius * 0.7);
        ctx.lineTo(0, h.radius * 0.7);
        ctx.moveTo(-h.radius * 0.5, -h.radius * 0.2);
        ctx.lineTo(h.radius * 0.5, -h.radius * 0.2);
        ctx.stroke();

        // Straw bundle body
        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#A16207';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 2, h.radius * 0.28, h.radius * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Little red fluttering ribbon
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, -h.radius * 0.2);
        ctx.quadraticCurveTo(-h.radius * 0.35, -h.radius * 0.1, -h.radius * 0.45, -h.radius * 0.35);
        ctx.stroke();
      } else if (h.kind === 'lightning-strike') {
        ctx.fillStyle = isWarning
          ? 'rgba(250, 204, 21, 0.32)'
          : justExploded
          ? 'rgba(254, 249, 195, 0.9)'
          : 'rgba(234, 179, 8, 0.5)';
        ctx.strokeStyle = isWarning ? '#FACC15' : '#FFFFFF';
        ctx.lineWidth = isWarning ? 3.2 : 2.4;
        if (isWarning) ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        // Jagged lightning bolt icon in center
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(4, -h.radius * 0.55);
        ctx.lineTo(-5, 0);
        ctx.lineTo(3, 0);
        ctx.lineTo(-4, h.radius * 0.55);
        ctx.stroke();
      } else {
        const isFissure = h.kind === 'predictive-fissure';
        const isHexCircle = h.kind === 'hex-circle' || h.type === 'curse' || h.kind === 'witch-gust';

        if (isHexCircle) {
          ctx.fillStyle = isWarning
            ? 'rgba(168, 85, 247, 0.28)'
            : justExploded
              ? 'rgba(216, 180, 254, 0.85)'
              : 'rgba(147, 51, 234, 0.45)';
          ctx.strokeStyle = isWarning ? '#C084FC' : justExploded ? '#F3E8FF' : '#7E22CE';
          ctx.lineWidth = isWarning ? 3.2 : 2.2;
          if (isWarning) ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);

          // Inner magical hex runes
          ctx.beginPath();
          ctx.arc(0, 0, h.radius * 0.6, 0, Math.PI * 2);
          ctx.moveTo(-h.radius * 0.4, 0);
          ctx.lineTo(h.radius * 0.4, 0);
          ctx.moveTo(0, -h.radius * 0.4);
          ctx.lineTo(0, h.radius * 0.4);
          ctx.stroke();
        } else {
          ctx.fillStyle = isWarning
            ? 'rgba(251, 146, 60, 0.28)'
            : justExploded
              ? 'rgba(254, 240, 138, 0.8)'
              : 'rgba(239, 68, 68, 0.45)';
          ctx.strokeStyle = isWarning ? '#FBBF24' : justExploded ? '#FEF08A' : '#991B1B';
          ctx.lineWidth = isWarning ? 3 : 2;
          if (isWarning) ctx.setLineDash([7, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          if (isFissure) {
            ctx.beginPath();
            ctx.moveTo(-h.radius * 0.75, -h.radius * 0.15);
            ctx.lineTo(-h.radius * 0.2, h.radius * 0.18);
            ctx.lineTo(h.radius * 0.15, -h.radius * 0.28);
            ctx.lineTo(h.radius * 0.72, h.radius * 0.12);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
  }

  // 3. Melting Snowmen Water Puddles
  const snowmanHorde = options?.snowmanHorde || engine.snowmanHorde;
  if (snowmanHorde && typeof snowmanHorde.renderPuddles === 'function') {
    snowmanHorde.renderPuddles(ctx, viewLeft, viewTop, viewRight, viewBottom, uiTime);
  }

  // 3b. Povidlové a kloboukové zpomalující louže (plumPuddles - Ring Buffer)
  if (engine.plumPuddles && engine.plumPuddles.length > 0) {
    for (let i = 0; i < engine.plumPuddles.length; i++) {
      const pud = engine.plumPuddles[i];
      if (pud.dead || (pud.life ?? 0) <= 0) continue;
      const rad = pud.radius || 44;
      if (!isInView(pud.x, pud.y, rad + 16, camera)) continue;
      ctx.save();
      ctx.translate(pud.x, pud.y);
      const fadeAlpha = Math.min(1, (pud.life ?? 1) / 1.2);
      ctx.globalAlpha = 0.78 * fadeAlpha;
      ctx.fillStyle = '#4C1D95';
      ctx.strokeStyle = '#2E1065';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 0.68, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7C3AED';
      ctx.beginPath();
      ctx.ellipse(-rad * 0.22, -rad * 0.12, rad * 0.28, rad * 0.16, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 3c. Zkažená kraslice: louže páchnoucího žloutku (yolkPuddles - Ring Buffer)
  const yolkPuddles = (engine.yolkPuddles || engine.state?.yolkPuddles) as any[];
  if (yolkPuddles && yolkPuddles.length > 0) {
    for (let i = 0; i < yolkPuddles.length; i++) {
      const pud = yolkPuddles[i];
      if (pud.dead || (pud.life ?? 0) <= 0) continue;
      const rad = pud.radius || 48;
      if (!isInView(pud.x, pud.y, rad + 16, camera)) continue;
      ctx.save();
      ctx.translate(pud.x, pud.y);
      const fadeAlpha = Math.min(1, (pud.life ?? 1) / 1.0);
      ctx.globalAlpha = 0.82 * fadeAlpha;

      // Outer noxious sulfur ring
      ctx.fillStyle = '#CA8A04';
      ctx.strokeStyle = '#231409';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 0.65, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner pungent egg yolk pool
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.ellipse(-rad * 0.15, -rad * 0.08, rad * 0.6, rad * 0.4, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Moldy sulfur-green bubbles
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.arc(rad * 0.25, rad * 0.15, rad * 0.18, 0, Math.PI * 2);
      ctx.arc(-rad * 0.28, rad * 0.12, rad * 0.14, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 4. Bubácká díra (anomálie Režiséra výpravy)
  const dira = engine.bubackaDira;
  if (dira && !dira.isCompleted && !dira.isFailed && isInView(dira.x, dira.y, (dira.radius || 40) + 30, camera)) {
    ctx.save();
    ctx.translate(dira.x, dira.y);

    // Deep pit abyss
    ctx.fillStyle = '#090D16';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, dira.radius, dira.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Swirling vortex strands drawing inward
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, dira.radius * 0.94, dira.radius * 0.64, 0, 0, Math.PI * 2);
    ctx.clip();

    const vortexSpeed = dira.playerInside ? 4.5 : 2.2;
    const vortexRot = (engine.gameTime || 0) * vortexSpeed;
    for (let i = 0; i < 4; i++) {
      const strandAng = vortexRot + (i * Math.PI) / 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(139, 92, 246, 0.38)';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let r = dira.radius * 0.88; r > 8; r -= 10) {
        const a = strandAng + (1 - r / dira.radius) * 2.4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * (r * 0.65);
        if (r === dira.radius * 0.88) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Emerging Barbucha telegraph inside the hole
    const emergence = typeof dira.emergence === 'number'
      ? dira.emergence
      : (1 - Math.max(0, dira.timeRemaining / 15.0));

    if (emergence > 0.12) {
      const emergeY = (1 - emergence) * 35 - 5;
      const eyeJitter = Math.sin((engine.gameTime || 0) * 14) * 1.5;

      // Glowing white/blue smoke puff rising
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.arc(0, emergeY + 12, 18 * emergence, 0, Math.PI * 2);
      ctx.fill();

      // Barbucha spiky black hair tuft peeking out
      if (emergence > 0.35) {
        ctx.fillStyle = '#111827';
        for (let sp = -3; sp <= 3; sp++) {
          ctx.beginPath();
          ctx.moveTo(sp * 5, emergeY - 8);
          ctx.lineTo(sp * 7 + eyeJitter, emergeY - 18 - Math.abs(sp) * 2);
          ctx.lineTo(sp * 5 + 3, emergeY - 6);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Barbucha terrified wide eyes peering out from the abyss
      const eyeR = Math.min(6.5, 3 + emergence * 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-7, emergeY - 2, eyeR, 0, Math.PI * 2);
      ctx.arc(7, emergeY - 2, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Irises & pupils
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(-7 + eyeJitter * 0.4, emergeY - 2, eyeR * 0.6, 0, Math.PI * 2);
      ctx.arc(7 + eyeJitter * 0.4, emergeY - 2, eyeR * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-7 + eyeJitter * 0.5, emergeY - 2, eyeR * 0.35, 0, Math.PI * 2);
      ctx.arc(7 + eyeJitter * 0.5, emergeY - 2, eyeR * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Orange carrot nose
      if (emergence > 0.45) {
        ctx.fillStyle = '#EA580C';
        ctx.beginPath();
        ctx.moveTo(0, emergeY + 1);
        ctx.lineTo(9 + eyeJitter, emergeY + 4);
        ctx.lineTo(1, emergeY + 5);
        ctx.closePath();
        ctx.fill();
      }

      // Reaching black claws grasping the rim
      if (emergence > 0.6) {
        const clawReachY = -dira.radius * 0.45 + (1 - emergence) * 15;
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.2;
        // Left claws grasping
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-dira.radius * 0.55 + c * 5, clawReachY);
          ctx.lineTo(-dira.radius * 0.58 + c * 5, clawReachY - 9);
          ctx.lineTo(-dira.radius * 0.52 + c * 5, clawReachY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        // Right claws grasping
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(dira.radius * 0.45 + c * 5, clawReachY);
          ctx.lineTo(dira.radius * 0.48 + c * 5, clawReachY - 9);
          ctx.lineTo(dira.radius * 0.52 + c * 5, clawReachY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Purple pulsating ring
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, dira.radius * 0.88, dira.radius * 0.58, Math.sin(engine.gameTime * 3) * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Circular sealing hold progress arc
    const holdProgress = 1 - Math.max(0, dira.holdTimeRemaining / dira.totalHoldRequired);
    ctx.strokeStyle = dira.playerInside ? '#22C55E' : '#F59E0B';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, dira.radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * holdProgress);
    ctx.stroke();

    // Label with warning and timer
    ctx.fillStyle = dira.playerInside ? '#86EFAC' : '#FDE047';
    ctx.font = 'bold 12px "Cinzel", "Crimson Text", serif';
    ctx.textAlign = 'center';
    const label = dira.playerInside
      ? `PEČETĚNÍ... ${Math.ceil(dira.holdTimeRemaining)}s (DRŽ POZICI!)`
      : `⚠️ ZAPEČEŤ DÍRU! (${Math.ceil(dira.timeRemaining)}s) - VYVĚRÁ BARBUCHA!`;
    ctx.fillText(label, 0, -dira.radius - 12);
    ctx.restore();
  }

  // 4b. ADR 0051: Ohrada z mouky a hořícího uhlí (Čertova babička)
  const cArena = engine.state?.certovaBabickaArena || engine.certovaBabickaArena;
  if (cArena && cArena.active && isInView(cArena.x, cArena.y, cArena.radius + 60, camera)) {
    ctx.save();
    ctx.translate(cArena.x, cArena.y);
    const time = engine.gameTime || 0;

    // Glowing inner heat vignette
    const heatGrad = ctx.createRadialGradient(0, 0, cArena.radius * 0.7, 0, 0, cArena.radius);
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    heatGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.08)');
    heatGrad.addColorStop(1, 'rgba(239, 68, 68, 0.22)');
    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(0, 0, cArena.radius, 0, Math.PI * 2);
    ctx.fill();

    // Spilled flour outer boundary ring
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 14;
    ctx.setLineDash([28, 14, 18, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, cArena.radius - 6, 0, Math.PI * 2);
    ctx.stroke();

    // Burning glowing coals on the outer rim
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 5;
    ctx.setLineDash([8, 16, 12, 14]);
    ctx.lineDashOffset = -time * 25;
    ctx.beginPath();
    ctx.arc(0, 0, cArena.radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 20]);
    ctx.lineDashOffset = time * 35;
    ctx.beginPath();
    ctx.arc(0, 0, cArena.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label: OHRADA Z MOUKY A UHLÍ
    ctx.fillStyle = '#FED7AA';
    ctx.font = 'bold 12px "Cinzel", "Crimson Text", serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 OHRADA Z MOUKY A HOŘÍCÍHO UHLÍ 🔥', 0, -cArena.radius - 14);
    ctx.restore();
  }

  // 4c. ADR 0052: Hřbitovní plot se svícemi (Zakletá princezna)
  const pArena = engine.state?.zakletaPrinceznaArena || engine.zakletaPrinceznaArena;
  if (pArena && pArena.active && isInView(pArena.x, pArena.y, pArena.radius + 60, camera)) {
    ctx.save();
    ctx.translate(pArena.x, pArena.y);
    const time = engine.gameTime || 0;

    // Glowing graveyard violet/cold vignette
    const coldGrad = ctx.createRadialGradient(0, 0, pArena.radius * 0.65, 0, 0, pArena.radius);
    coldGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    coldGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.08)');
    coldGrad.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
    ctx.fillStyle = coldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, pArena.radius, 0, Math.PI * 2);
    ctx.fill();

    // Wrought-iron rusted cemetery fence boundary
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, pArena.radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Picket spikes and fence bars
    const picketCount = 36;
    for (let pi = 0; pi < picketCount; pi++) {
      const ang = (pi / picketCount) * Math.PI * 2;
      const px = Math.cos(ang) * (pArena.radius - 4);
      const py = Math.sin(ang) * (pArena.radius - 4);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-2, -10, 4, 20);
      ctx.strokeRect(-2, -10, 4, 20);

      // Flickering cemetery candles every 3rd picket
      if (pi % 3 === 0) {
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(-3, -16, 6, 8);
        const flameFlicker = Math.sin(time * 8 + pi) * 1.5;
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(0, -18 + flameFlicker, 2.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.ellipse(0, -18 + flameFlicker, 1.2, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Label: HŘBITOVNÍ PLOT SE SVÍCEMI
    const night = pArena.nightStage || 1;
    ctx.fillStyle = '#BAE6FD';
    ctx.font = 'bold 12px "Cinzel", "Crimson Text", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🕯️ HŘBITOVNÍ PLOT SE SVÍCEMI 🕯️ (NOC ${night}/3)`, 0, -pArena.radius - 14);
    ctx.restore();
  }

  // 5. Posvěcená tříkrálová křída (Holy Chalk Circle)
  const hc = engine.holyCircle;
  if (hc && hc.active && isInView(hc.x, hc.y, hc.radius + 30, camera)) {
    ctx.save();
    ctx.translate(hc.x, hc.y);
    const fade = Math.min(1, (hc.life ?? 1) / 0.5);
    ctx.globalAlpha = 0.85 * fade;

    const grad = ctx.createRadialGradient(0, 0, hc.radius * 0.2, 0, 0, hc.radius);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    grad.addColorStop(0.7, 'rgba(253, 224, 71, 0.12)');
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, hc.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FEF9C3';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, hc.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, hc.radius - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 13px "Eczar", "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✝ K + M + B ✝', 0, -hc.radius + 16);
    ctx.fillText('✝ K + M + B ✝', 0, hc.radius - 16);
    ctx.restore();
  }

  // 6. Dědeček Encounter in World
  const g = engine.grandfather;
  if (g && g.active && isInView(g.x, g.y, 140, camera)) {
    const dist = player ? Math.hypot(g.x - player.x, g.y - player.y) : 999;
    const isInteracting = dist < 220;

    Lada.drawGrandfather(
      ctx,
      g.x,
      g.y,
      g.animTime || uiTime,
      g.vx || 0,
      !!g.isMoving,
      g.facingDir || 1,
      isInteracting,
      1.2
    );

    if (isInteracting) {
      const isGp = gamepadManager.activeDevice === 'gamepad';
      const promptText = isGp ? '[X] / [E] Aktivovat nůši' : '[E] / [X] Aktivovat nůši';
      ctx.save();
      ctx.fillStyle = '#FFF7DF';
      ctx.strokeStyle = '#2D1609';
      ctx.lineWidth = 2;
      ctx.font = '900 14.5px Eczar, serif';
      ctx.textAlign = 'center';
      ctx.beginPath();
      ctx.roundRect(g.x - 116, g.y - 92, 232, 32, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5B2118';
      ctx.fillText(promptText, g.x, g.y - 71);
      ctx.restore();
    }
  }

  // 7. Companion (Chásník)
  if (engine.companion && isInView(engine.companion.x, engine.companion.y, 80, camera)) {
    Lada.drawChasnik(ctx, engine.companion.x, engine.companion.y, engine.companion.animTime || uiTime, false);
  }

  // 8. Ground Persistent Weapon Auras Under Player
  if (player) {
    // Hromnička holy light aura
    const hromnickaWp = (player as any)._hromnickaWeapon;
    if (hromnickaWp) {
      const reach = 135 + (hromnickaWp.level || 1) * 15;
      Lada.drawHromnickaAura(ctx, player.x, player.y, reach, uiTime, player.hromnickaPulseTimer || 0);
    }

    // Česneková topinka garlic stink aura
    const garlicWp =
      (player as any)._garlicWeapon !== undefined
        ? (player as any)._garlicWeapon
        : player.weapons?.find((w: any) => w.id === 'cesnekova-topinka' || w.id === 'cesnekova_topinka');
    if (garlicWp) {
      const auraRadius = 110 * ((garlicWp.level || 1) >= 2 ? 1.2 : 1) * ((garlicWp.level || 1) >= 5 ? 1.15 : 1);
      ctx.save();
      const pulse = 1 + Math.sin(uiTime * 2.6) * 0.045;
      const grad = ctx.createRadialGradient(player.x, player.y, auraRadius * 0.12, player.x, player.y, auraRadius * pulse);
      grad.addColorStop(0, 'rgba(190, 230, 110, 0.05)');
      grad.addColorStop(0.62, 'rgba(132, 180, 55, 0.12)');
      grad.addColorStop(1, 'rgba(101, 145, 35, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(player.x, player.y, auraRadius * pulse, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const a = uiTime * (0.28 + i * 0.01) + i * Math.PI / 4;
        const rr = auraRadius * (0.35 + ((uiTime * 0.12 + i * 0.17) % 0.65));
        const x = player.x + Math.cos(a) * rr;
        const y = player.y + Math.sin(a) * rr;
        ctx.globalAlpha = 0.28 * (1 - rr / auraRadius);
        ctx.fillStyle = i % 2 ? '#A3E635' : '#D9F99D';
        ctx.beginPath();
        ctx.arc(x, y, 7 + Math.sin(uiTime * 2 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = 'rgba(101, 145, 35, .32)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, auraRadius * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Válečnice patrol circle & companions
    const valecniceWp = (player as any)._valecniceWeapon;
    if (valecniceWp) {
      const stats = getRankedWeaponStats('valecnice', valecniceWp.level, valecniceWp);
      const count = Math.max(1, 1 + stats.projectileCount);
      const orbitRadius = 115 * stats.areaRadiusMult;
      const slowRadius = orbitRadius * 1.15;

      ctx.save();
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, slowRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.32)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      for (let i = 0; i < count; i++) {
        const a = (player.valecniceAngle || 0) + i * Math.PI * 2 / count;
        const x = player.x + Math.cos(a) * orbitRadius;
        const y = player.y + Math.sin(a) * orbitRadius;

        if (
          !options?.isPaused &&
          options?.combatVfxEnabled !== false &&
          Math.random() < 0.14 &&
          engine.particles &&
          engine.particles.length < 120
        ) {
          const dustAngle = a + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
          tryEmitParticle(
            engine.particles,
            () => ({
              x: x - Math.cos(dustAngle) * 10,
              y: y - Math.sin(dustAngle) * 10 + 16,
              vx: -Math.cos(dustAngle) * 22 + (Math.random() - 0.5) * 12,
              vy: -Math.random() * 12,
              life: 0.28,
              color: '#E2D5BC',
              size: 3,
            }),
            engine.meta?.performanceProfile
          );
        }

        drawValecniceCompanion(ctx, x, y, a, i, uiTime, 1.71, player._valecnicePulse);
      }
    }
  }

  // 9. Ground-level Hero & Battle Item FX (Footprints & Herbal Sanctuary Circle)
  if (options?.combatVfxEnabled !== false) {
    // In-world bylinné sanctuarium a očistné kadidlo Kořenářky (ground circle)
    if (engine.korenarkaSanctuary && player) {
      Lada.drawKorenarkaSanctuaryFx(ctx, engine.korenarkaSanctuary, 0.016, player.x, player.y);
    }
    // Kominické stopy sazí
    if (engine.sootFootprints && engine.sootFootprints.length > 0) {
      for (let i = 0; i < engine.sootFootprints.length; i++) {
        const sf = engine.sootFootprints[i];
        if (isInView(sf.x, sf.y, 20, camera)) {
          Lada.drawSootFootprint(ctx, sf.x, sf.y, sf.angle);
        }
      }
    }
  }

  if (!options?.deferCombatVfxToOverlayPass) {
    renderWorldCombatVfx(ctx, engine, camera, options);
  }
}

/**
 * Renders over-entity world combat VFX (lightning strikes, blessing bell, stampede,
 * spinning sukovice, slivovice vapor, masopust shockwave shield).
 */
export function renderWorldCombatVfx(
  ctx: CanvasRenderingContext2D,
  engine: any,
  camera: CameraViewport,
  options?: WorldHazardsRenderOptions
): void {
  if (options?.combatVfxEnabled === false) return;
  const player = engine.player;
  const uiTime = engine.uiTime || 0;

  // Lightning strike (rendered without GPU-stalling shadowBlur)
  if (engine.lightningStrike) {
    const ls = engine.lightningStrike;
    ctx.save();
    ctx.beginPath();
    let curX = ls.x + (Math.random() - 0.5) * 40;
    const curY = camera.y - 120;
    ctx.moveTo(curX, curY);
    const steps = 7;
    for (let s = 1; s <= steps; s++) {
      const targetY = (camera.y - 120) + (ls.y - (camera.y - 120)) * (s / steps);
      const targetX = s === steps ? ls.x : ls.x + (Math.random() - 0.5) * 55;
      ctx.lineTo(targetX, targetY);
    }
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.beginPath();
    ctx.arc(ls.x, ls.y, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Farní požehnání: zvon a sloup svatého světla
  if (engine.blessing) {
    Lada.drawBlessingFx(ctx, engine.blessing.x, engine.blessing.y, engine.blessing.t, engine.blessing.dur);
  }
  // In-world pastevecké stádo a částicové efekty Pasáčka
  if (engine.shepherdStampede && player) {
    Lada.drawShepherdStampedeFx(ctx, engine.shepherdStampede, 0.016, player.x, player.y);
  }
  // Pověstná sukovice
  if (engine.sukovice && player) {
    Lada.drawSukoviceFx(ctx, engine.sukovice, player.x, player.y);
  }
  // Hlt slivovice
  if (engine.slivoviceVapor) {
    Lada.drawSlivoviceVapor(ctx, engine.slivoviceVapor.x, engine.slivoviceVapor.y, engine.slivoviceVapor.dirAngle, engine.slivoviceVapor.life);
  }
  // Masopustní řehtačka
  if (engine.masopustShockwaveTimer > 0 && player) {
    Lada.drawMasopustShockwave(ctx, player.x, player.y, 140, uiTime);
  }
}
