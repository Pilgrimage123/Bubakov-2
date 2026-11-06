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
      ctx.globalAlpha = Math.min(0.72, thaw.beerPuddle.time / 1.2);
      ctx.fillStyle = '#D98B22';
      ctx.strokeStyle = '#6B3510';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 24, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#FFF1AE';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * 13, -3 + (i & 1) * 5, 4, 0, Math.PI * 2);
        ctx.stroke();
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
        const isGp = gamepadManager.activeDevice === 'gamepad';
        const interactHint = isGp ? '[X] / [E] Aktivovat' : '[E] / [X] Aktivovat';
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
        const isGp = gamepadManager.activeDevice === 'gamepad';
        const interactHint = isGp ? '[X] / [E] Aktivovat' : '[E] / [X] Aktivovat';
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
      const bannerText = engine.kvetenActivePoiPrompt || nearby?.hint;
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
      const bannerText = engine.cervenActivePoiPrompt || (nearby ? `${nearby.title}${herbsNote}` : null);
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
      const bannerText = engine.cervenecActivePoiPrompt || nearby?.title;
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
      const bannerText = engine.srpenActivePoiPrompt || nearby?.title;
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
      const bannerText = engine.zariActivePoiPrompt || nearby?.title;
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
      const bannerText = engine.rijenActivePoiPrompt || nearby?.title;
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
      ctx.globalAlpha = 0.75 * fadeAlpha;

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
      } else if (h.type === 'mud') {
        ctx.fillStyle = isWarning ? 'rgba(120, 67, 35, 0.35)' : '#5A3825';
        ctx.strokeStyle = isWarning ? '#F59E0B' : '#26150C';
        ctx.lineWidth = isWarning ? 3.0 : 2.5;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        if (h.kind === 'ground-shockwave' || h.kind === 'chain-shackle') {
          ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        } else {
          ctx.ellipse(0, 0, h.radius, h.radius * 0.65, 0.2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
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
          ctx.fillStyle = '#784323';
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
        ctx.strokeStyle = isWarning ? '#38BDF8' : justExploded ? '#FFFFFF' : '#0369A1';
        ctx.lineWidth = isWarning ? 3.0 : 2.2;
        if (isWarning) ctx.setLineDash([7, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
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
          : 'rgba(186, 230, 253, 0.22)';
        ctx.strokeStyle = isWarning ? '#38BDF8' : justExploded ? '#FFFFFF' : 'rgba(2, 132, 199, 0.65)';
        ctx.lineWidth = isWarning ? 3.0 : 1.8;
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
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, dira.radius, dira.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, dira.radius * 0.85, dira.radius * 0.55, Math.sin(engine.gameTime * 3) * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    const holdProgress = 1 - Math.max(0, dira.holdTimeRemaining / dira.totalHoldRequired);
    ctx.strokeStyle = dira.playerInside ? '#22C55E' : '#F59E0B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, dira.radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * holdProgress);
    ctx.stroke();

    ctx.fillStyle = dira.playerInside ? '#86EFAC' : '#FDE047';
    ctx.font = 'bold 12px "Cinzel", "Crimson Text", serif';
    ctx.textAlign = 'center';
    const label = dira.playerInside
      ? `PEČETĚNÍ... ${Math.ceil(dira.holdTimeRemaining)}s`
      : `ZAPEČEŤ DÍRU! (${Math.ceil(dira.timeRemaining)}s)`;
    ctx.fillText(label, 0, -dira.radius - 12);
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
