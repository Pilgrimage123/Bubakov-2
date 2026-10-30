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
  getActiveMarchForestZone,
  isInsideMarchPoi,
} from '../data/marchThawArena';
import {
  drawMarianApparition,
  getMarianApparitionVisualState,
} from './marchThawSvgLandscape';
import { getRankedWeaponStats } from '../data/weaponMilestones';
import { isGameEffectEnabled } from '../game/effectSettings';
import { tryEmitParticle } from '../game/particles';
import { gamepadManager } from '../game/gamepad';

const MARCH_POI_LIST = Object.values(MARCH_THAW_POIS);

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

  // 1. Level 0: March Thaw Arena (Beer puddle, Kaplička Marian Apparition & POI hints)
  if (engine.activeLevelId === 0 && engine.marchThaw) {
    const thaw = engine.marchThaw;
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
    const shrinePoi = MARCH_THAW_POIS.shrine;
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
      let nearbyPoi: (typeof MARCH_POI_LIST)[number] | undefined;
      for (let i = 0; i < MARCH_POI_LIST.length; i++) {
        if (isInsideMarchPoi(player.x, player.y, MARCH_POI_LIST[i], 30)) {
          nearbyPoi = MARCH_POI_LIST[i];
          break;
        }
      }
      const activeForest = !nearbyPoi ? getActiveMarchForestZone(player.x, player.y, 30) : null;
      const nearby = nearbyPoi || (activeForest ? MARCH_THAW_POIS.forest : undefined);
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

      if (h.type === 'mud') {
        ctx.fillStyle = '#5A3825';
        ctx.strokeStyle = '#26150C';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, h.radius, h.radius * 0.65, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#784323';
        ctx.beginPath();
        ctx.arc(-h.radius * 0.3, -h.radius * 0.1, 4, 0, Math.PI * 2);
        ctx.arc(h.radius * 0.2, h.radius * 0.15, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'frost') {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        const isFissure = h.kind === 'predictive-fissure';
        const isHexCircle = h.kind === 'hex-circle' || h.type === 'curse';
        const isWarning = (isFissure || isHexCircle) && (h.warningTimer || 0) > 0 && (options?.warningIndicatorsEnabled !== false);
        const justExploded = (isFissure || isHexCircle) && h.exploded;

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

  // 3b. Povidlové a kloboukové zpomalující louže (plumPuddles)
  if (engine.plumPuddles && engine.plumPuddles.length > 0) {
    for (let i = 0; i < engine.plumPuddles.length; i++) {
      const pud = engine.plumPuddles[i];
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

  // 3c. Zkažená kraslice: louže páchnoucího žloutku (yolkPuddles)
  const yolkPuddles = (engine.yolkPuddles || engine.state?.yolkPuddles) as any[];
  if (yolkPuddles && yolkPuddles.length > 0) {
    for (let i = 0; i < yolkPuddles.length; i++) {
      const pud = yolkPuddles[i];
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
