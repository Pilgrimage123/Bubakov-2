/**
 * Ground Overlays Renderer (Vykreslování přízemních ploch a stop)
 * 
 * Renders ground effects: March thaw beer puddles, director hazards (mud, frost, fissures),
 * Bubácká díra sealing zone, holy chalk circle (✝ K + M + B ✝), and soot footprints.
 * 
 * ADR 0017, ADR 0020
 */

import { COLORS } from '../constants';
import { Lada } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';
import { MARCH_THAW_POIS_LIST, isInsideMarchPoi } from '../data/marchThawArena';

export interface GroundOverlayRenderOptions {
  warningIndicatorsEnabled?: boolean;
}

export function renderGroundOverlays(
  ctx: CanvasRenderingContext2D,
  engine: any,
  camera: CameraViewport,
  options?: GroundOverlayRenderOptions
): void {
  const isWarningEnabled = options?.warningIndicatorsEnabled ?? true;

  // 1. Level 0 March Thaw Beer Puddle and Landmark Hint Boxes
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

    if (engine.player) {
      const player = engine.player;
      const nearby = MARCH_THAW_POIS_LIST.find((poi) => isInsideMarchPoi(player.x, player.y, poi, 30));
      if (nearby) {
        let detail = nearby.hint;
        if (nearby.id === 'church' && thaw.bellCooldown > 0) detail = `Zvonice se rozezní za ${Math.ceil(thaw.bellCooldown)} s`;
        if (nearby.id === 'tavern' && thaw.kegCooldown > 0) detail = `Soudek dovalí za ${Math.ceil(thaw.kegCooldown)} s`;
        if (nearby.id === 'shrine' && thaw.shrineCooldown > 0) detail = `Světlo svatyně sílí za ${Math.ceil(thaw.shrineCooldown)} s`;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 248, 222, .94)';
        ctx.strokeStyle = COLORS?.ink || '#1E1B18';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(player.x - 134, player.y - 88, 268, 31, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#472A16';
        ctx.font = '900 13px Eczar, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(detail, player.x, player.y - 72);
        ctx.restore();
      }
    }
  }

  // 2. Director Arena Hazards (Bláto, Oheň, Mráz)
  const hazards = engine.activeHazards || [];
  if (hazards.length > 0) {
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      if (!isInView(h.x, h.y, h.radius + 20, camera)) continue;
      ctx.save();
      ctx.translate(h.x, h.y);
      const fadeAlpha = Math.min(1, h.duration / 1.0);
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
        ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        const isFissure = h.kind === 'predictive-fissure';
        const isWarning = isFissure && (h.warningTimer || 0) > 0 && isWarningEnabled;
        const justExploded = isFissure && h.exploded;

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
      ctx.restore();
    }
  }

  // 3. Bubácká díra (anomálie Režiséra výpravy)
  const dira = engine.bubackaDira;
  if (dira && !dira.isCompleted && !dira.isFailed && isInView(dira.x, dira.y, dira.radius + 30, camera)) {
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
    ctx.ellipse(0, 0, dira.radius * 0.85, dira.radius * 0.55, Math.sin((engine.gameTime || 0) * 3) * 0.1, 0, Math.PI * 2);
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

  // 4. Posvěcená tříkrálová křída (Holy Chalk Circle)
  const hc = engine.holyCircle;
  if (hc && hc.active && isInView(hc.x, hc.y, hc.radius + 30, camera)) {
    ctx.save();
    ctx.translate(hc.x, hc.y);
    const fade = Math.min(1, hc.life / 0.5);
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

  // 5. Kominické stopy sazí
  const footprints = engine.sootFootprints;
  if (footprints && footprints.length > 0) {
    for (let i = 0; i < footprints.length; i++) {
      const sf = footprints[i];
      if (isInView(sf.x, sf.y, 16, camera)) {
        Lada.drawSootFootprint(ctx, sf.x, sf.y, sf.angle);
      }
    }
  }
}
