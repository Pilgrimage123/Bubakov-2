/**
 * Projectiles and Melee Slashes Renderer (Vykreslování střel a seknutí)
 * 
 * Renders all flying projectiles and weapon slashes with Josef Lada fairy tale
 * art styling and camera frustum culling.
 * 
 * ADR 0017, ADR 0020
 */

import { COLORS } from '../constants';
import { Lada } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';

export function renderProjectilesAndSlashes(
  ctx: CanvasRenderingContext2D,
  projectiles: any[],
  slashes: any[],
  camera: CameraViewport,
  uiTime = 0
): { renderedProjectiles: number; renderedSlashes: number } {
  let renderedProjectiles = 0;
  let renderedSlashes = 0;

  // 1. Draw Flying Projectiles
  if (projectiles && projectiles.length > 0) {
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      if (!p || p.dead) continue;
      if (!isInView(p.x, p.y, p.radius || 12, camera)) continue;

      renderedProjectiles++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle || 0);

      if (p.visual === 'bun') {
        Lada.drawCzechBuchta(ctx, 0, 0, 1.15);
      } else if (p.visual === 'herb_leaf') {
        Lada.setupPath(ctx, COLORS.green, COLORS.ink, 2.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.visual === 'snowball' || p.visual === 'snowball_small') {
        Lada.drawSnowball(ctx, 0, 0, p.visual === 'snowball' ? 12 : 7);
      } else if (p.visual === 'kolac') {
        Lada.drawKynutyKolac(ctx, 0, 0, 1.25, 0);
      } else if (p.visual === 'pickle') {
        const rot = Math.sin(uiTime * 8 + p.x * 0.01) * 0.08;
        Lada.drawPickle(ctx, 0, 0, rot);
      } else if (p.visual === 'potato') {
        Lada.setupPath(ctx, '#78350F', COLORS.ink, 2.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.visual === 'bee') {
        Lada.drawBee(ctx, 0, 0);
      } else if (p.visual === 'holy_droplet') {
        Lada.drawHolyDroplet(ctx, 0, 0);
      } else if (p.visual === 'millstone') {
        Lada.drawMillstone(ctx, 0, 0, p.radius || 20, p.rotation || 0);
      } else if (p.visual === 'water_wave') {
        Lada.drawWaterWave(ctx, 0, 0, p.radius || 26, 0, uiTime);
      } else if (p.visual === 'ink_bottle') {
        Lada.setupPath(ctx, '#1E293B', COLORS.ink, 2.5);
        ctx.beginPath();
        ctx.rect(-8, -10, 16, 20);
        ctx.fill();
        ctx.stroke();
        Lada.setupPath(ctx, '#D9A036', COLORS.ink, 2);
        ctx.fillRect(-4, -15, 8, 5);
        ctx.strokeRect(-4, -15, 8, 5);
        ctx.fillStyle = '#F3E9D2';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.visual === 'dirt_clod') {
        Lada.setupPath(ctx, '#5C4033', COLORS.ink, 2.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#3D2210';
        ctx.beginPath();
        ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
        ctx.arc(3, 3, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.visual === 'mud_ball') {
        Lada.setupPath(ctx, '#365314', COLORS.ink, 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#65A30D';
        ctx.beginPath();
        ctx.arc(-2, -1, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.visual === 'scythe_wave') {
        ctx.save();
        ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, -Math.PI / 3, Math.PI / 3, false);
        ctx.arc(-6, 0, 18, Math.PI / 3, -Math.PI / 3, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (p.visual === 'water_puddle') {
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const ripple = (Math.sin(uiTime * 3) + 1) * 0.5 * 14;
        ctx.ellipse(0, 0, ripple + 4, (ripple + 4) * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (p.visual === 'magma_trail') {
        ctx.save();
        const r = p.radius || 20;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.40)';
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const pulse = (Math.sin(uiTime * 5 + p.x) + 1) * 0.5;
        ctx.fillStyle = pulse > 0.45 ? '#F59E0B' : '#DC2626';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.55, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(Math.sin(uiTime * 6) * 5, Math.cos(uiTime * 6) * 3, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.visual === 'volcanic_fissure') {
        ctx.save();
        const lifeRatio = Math.max(0, p.life / 1.25);
        const expandRatio = 1 - lifeRatio;
        const r = p.radius || 36;
        const warnAlpha = 0.35 + Math.sin(uiTime * 14) * 0.22;

        ctx.strokeStyle = `rgba(239, 68, 68, ${warnAlpha + 0.35})`;
        ctx.lineWidth = 2.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgba(220, 38, 38, ${warnAlpha * 0.65})`;
        ctx.beginPath();
        ctx.arc(0, 0, r * expandRatio, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -2);
        ctx.lineTo(-r * 0.1, 4);
        ctx.lineTo(r * 0.2, -6);
        ctx.lineTo(r * 0.45, 3);
        ctx.stroke();
        ctx.restore();
      } else if (p.visual === 'head_projectile') {
        ctx.save();
        Lada.setupPath(ctx, '#475569', COLORS.ink, 3);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FDE047';
        ctx.fillRect(-8, -3, 16, 5);
        ctx.strokeRect(-8, -3, 16, 5);
        ctx.restore();
      } else if (p.visual === 'boulder') {
        Lada.drawRollingBoulder(ctx, 0, 0, p.radius || 22, p.angle || 0);
      } else if (p.visual === 'hell_spark') {
        Lada.drawHellSpark(ctx, 0, 0, p.radius || 10, uiTime);
      } else if (p.visual === 'wood_shard') {
        Lada.drawWoodShard(ctx, 0, 0, p.radius || 12, p.angle || 0);
      } else if (p.visual === 'icicle') {
        Lada.drawIcicle(ctx, 0, 0, p.radius || 14, p.angle || Math.PI / 2);
      } else if (p.visual === 'dragon_fireball') {
        Lada.drawDragonFireball(ctx, 0, 0, p.radius || 16, uiTime);
      } else if (p.visual === 'dragon_frostball') {
        Lada.drawDragonFrostball(ctx, 0, 0, p.radius || 16, uiTime);
      } else if (p.visual === 'dragon_wind') {
        Lada.drawDragonWind(ctx, 0, 0, p.radius || 22, p.angle || 0, uiTime);
      } else if (p.visual === 'gander') {
        (Lada as any).drawGander?.(ctx, 0, 0, p.radius || 16, 0, uiTime);
      } else {
        Lada.setupPath(ctx, COLORS.grey, COLORS.ink, 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // 2. Draw Melee Slashes
  if (slashes && slashes.length > 0) {
    for (let i = 0; i < slashes.length; i++) {
      const s = slashes[i];
      if (!s || s.dead) continue;
      if (!isInView(s.x, s.y, s.reach || 80, camera)) continue;

      renderedSlashes++;
      ctx.save();
      ctx.translate(s.x, s.y);

      if (s.style === 'thrust') {
        ctx.rotate(s.angle);
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(s.reach, 0);
        ctx.moveTo(15, -12);
        ctx.lineTo(s.reach * 0.9, -12);
        ctx.moveTo(15, 12);
        ctx.lineTo(s.reach * 0.9, 12);
        ctx.stroke();
      } else if (s.style === 'whip' || s.weaponId === 'formansky_bic') {
        ctx.rotate(s.angle);
        const reach = s.reach;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        const wave = Math.sin((s.time || 0) * 25) * 12 * (1 - Math.min(1, (s.time || 0) / 0.15));
        ctx.quadraticCurveTo(reach * 0.5, wave, reach * 0.85, -wave * 0.5);
        ctx.lineTo(reach, 0);
        ctx.stroke();

        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.quadraticCurveTo(reach * 0.5, wave, reach * 0.85, -wave * 0.5);
        ctx.stroke();

        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(reach, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EA580C';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (s.style === 'cane' || ((!s.style || s.style === 'arc') && s.weaponId !== 'halberd')) {
        Lada.drawOsikovyPrutSlash(ctx, s);
      } else {
        Lada.setupPath(ctx, 'transparent', s.style === 'halberd' ? '#94A3B8' : COLORS.white, 8);
        ctx.beginPath();
        ctx.arc(0, 0, s.reach * 0.8, s.angle - s.arc / 2, s.angle + s.arc / 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  return { renderedProjectiles, renderedSlashes };
}
