/**
 * Projectiles and Melee Slashes Renderer (Vykreslování střel a seknutí)
 * 
 * Renders all flying projectiles and weapon slashes with Josef Lada fairy tale
 * art styling and camera frustum culling.
 * 
 * ADR 0017, ADR 0020
 */

import { COLORS } from '../constants';
import { Lada, getCachedLadaSprite } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';

export interface ProjectileRenderMetrics {
  renderedProjectiles: number;
  renderedSlashes: number;
}

export function renderProjectilesAndSlashes(
  ctx: CanvasRenderingContext2D,
  projectiles: any[],
  slashes: any[],
  camera: CameraViewport,
  uiTime = 0,
  outMetrics?: ProjectileRenderMetrics
): ProjectileRenderMetrics {
  if (outMetrics) {
    outMetrics.renderedProjectiles = 0;
    outMetrics.renderedSlashes = 0;
  }
  let renderedProjectiles = 0;
  let renderedSlashes = 0;

  // 1. Draw Flying Projectiles
  if (projectiles && projectiles.length > 0) {
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      if (!p || p.dead) continue;
      if (!isInView(p.x, p.y, p.radius || 12, camera)) continue;

      renderedProjectiles++;

      // Fast path for radially symmetric cached projectiles (no outer save/translate/rotate needed)
      if (p.visual === 'snowball' || p.visual === 'snowball_small') {
        Lada.drawSnowball(ctx, p.x, p.y, p.visual === 'snowball' ? 12 : 7);
        continue;
      }
      if (p.visual === 'holy_droplet') {
        Lada.drawHolyDroplet(ctx, p.x, p.y);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle || 0);

      if (p.visual === 'bun') {
        // ADR 0034: Harmonized projectile scale (28x26 px) to match collision radius 13
        Lada.drawCzechBuchta(ctx, 0, 0, 0.58);
      } else if (p.visual === 'herb_leaf') {
        const hVariant = typeof p.herbVariant === 'number' ? p.herbVariant : Math.abs(Math.round((p.angle || 0) * 3)) % 6;
        Lada.drawHerbProjectile(ctx, 0, 0, hVariant, uiTime, (p.radius ? p.radius / 14 : 1) * 0.85);
      } else if (p.visual === 'kolac') {
        // ADR 0034: Harmonized projectile scale (29x29 px) to match collision radius 12
        Lada.drawKynutyKolac(ctx, 0, 0, 0.60, 0);
      } else if (p.visual === 'pickle') {
        const rot = Math.sin(uiTime * 8 + p.x * 0.01) * 0.08;
        ctx.scale(0.85, 0.85);
        Lada.drawPickle(ctx, 0, 0, rot);
      } else if (p.visual === 'potato') {
        const sprite = getCachedLadaSprite('potato_proj', 32, 24, (sCtx, cx, cy) => {
          Lada.setupPath(sCtx, '#78350F', COLORS.ink, 2.5);
          sCtx.beginPath();
          sCtx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.stroke();
        });
        if (sprite && typeof ctx.drawImage === 'function') {
          ctx.drawImage(sprite, -16, -12);
        } else {
          Lada.setupPath(ctx, '#78350F', COLORS.ink, 2.5);
          ctx.beginPath();
          ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else if (p.visual === 'bee') {
        Lada.drawBee(ctx, 0, 0);
      } else if (p.visual === 'millstone') {
        Lada.drawMillstone(ctx, 0, 0, p.radius || 20, p.rotation || 0);
      } else if (p.visual === 'water_wave') {
        Lada.drawWaterWave(ctx, 0, 0, p.radius || 26, 0, uiTime);
      } else if (p.visual === 'ink_bottle') {
        const sprite = getCachedLadaSprite('ink_bottle_proj', 24, 34, (sCtx, cx, cy) => {
          sCtx.save();
          sCtx.translate(cx, cy + 2);
          Lada.setupPath(sCtx, '#1E293B', COLORS.ink, 2.5);
          sCtx.beginPath();
          sCtx.rect(-8, -10, 16, 20);
          sCtx.fill();
          sCtx.stroke();
          Lada.setupPath(sCtx, '#D9A036', COLORS.ink, 2);
          sCtx.fillRect(-4, -15, 8, 5);
          sCtx.strokeRect(-4, -15, 8, 5);
          sCtx.fillStyle = '#F3E9D2';
          sCtx.fillRect(-5, -5, 10, 10);
          sCtx.fillStyle = '#0F172A';
          sCtx.beginPath();
          sCtx.arc(0, 0, 3, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.restore();
        });
        if (sprite && typeof ctx.drawImage === 'function') {
          ctx.drawImage(sprite, -12, -19);
        } else {
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
        }
      } else if (p.visual === 'dirt_clod') {
        const sprite = getCachedLadaSprite('dirt_clod_proj', 32, 28, (sCtx, cx, cy) => {
          Lada.setupPath(sCtx, '#5C4033', COLORS.ink, 2.5);
          sCtx.beginPath();
          sCtx.ellipse(cx, cy, 12, 10, 0, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.stroke();
          sCtx.fillStyle = '#3D2210';
          sCtx.beginPath();
          sCtx.arc(cx - 4, cy - 2, 2.5, 0, Math.PI * 2);
          sCtx.arc(cx + 3, cy + 3, 2, 0, Math.PI * 2);
          sCtx.fill();
        });
        if (sprite && typeof ctx.drawImage === 'function') {
          ctx.drawImage(sprite, -16, -14);
        } else {
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
        }
      } else if (p.visual === 'mud_ball') {
        const sprite = getCachedLadaSprite('mud_ball_proj', 30, 26, (sCtx, cx, cy) => {
          Lada.setupPath(sCtx, '#365314', COLORS.ink, 2);
          sCtx.beginPath();
          sCtx.ellipse(cx, cy, 11, 9, 0, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.stroke();
          sCtx.fillStyle = '#65A30D';
          sCtx.beginPath();
          sCtx.arc(cx - 2, cy - 1, 3.5, 0, Math.PI * 2);
          sCtx.fill();
        });
        if (sprite && typeof ctx.drawImage === 'function') {
          ctx.drawImage(sprite, -15, -13);
        } else {
          Lada.setupPath(ctx, '#365314', COLORS.ink, 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#65A30D';
          ctx.beginPath();
          ctx.arc(-2, -1, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
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
        const sprite = getCachedLadaSprite('head_proj', 40, 40, (sCtx, cx, cy) => {
          Lada.setupPath(sCtx, '#475569', COLORS.ink, 3);
          sCtx.beginPath();
          sCtx.arc(cx, cy, 16, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.stroke();
          sCtx.fillStyle = '#FDE047';
          sCtx.fillRect(cx - 8, cy - 3, 16, 5);
          sCtx.strokeRect(cx - 8, cy - 3, 16, 5);
        });
        if (sprite && typeof ctx.drawImage === 'function') {
          ctx.drawImage(sprite, -20, -20);
        } else {
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
        }
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
      } else if (s.style === 'flail' || s.weaponId === 'dreveny_cep') {
        const life = s.maxLife || 0.36;
        const progress = Math.max(0, Math.min(1, 1 - (s.life / life)));
        const direction = s.swingDir || 1;
        const swing = -1.18 + progress * Math.PI * 1.85 * direction;
        const reach = s.reach || 112;
        const shaftLength = Math.min(80, reach * 0.72);
        const headLength = Math.min(32, reach * 0.29);
        const headAngle = Math.sin(progress * Math.PI) * 0.95 - 0.22;

        ctx.save();
        ctx.rotate(s.angle - 0.48 + swing * 0.18);

        // Sweeping hand-drawn trails emphasise the circular swing.
        const trailAlpha = Math.max(0, 0.72 * (1 - progress * 0.82));
        ctx.strokeStyle = `rgba(236, 190, 123, ${trailAlpha})`;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, shaftLength * 0.80, -1.08, 0.58 + progress * 0.48);
        ctx.stroke();
        ctx.strokeStyle = `rgba(35, 24, 16, ${trailAlpha * 0.72})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, shaftLength * 0.92, -1.04, 0.52 + progress * 0.48);
        ctx.stroke();

        // Long, hand-carved handle with thick dark outline and wood grain.
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(9, 4);
        ctx.quadraticCurveTo(shaftLength * 0.43, -10, shaftLength, -2);
        ctx.stroke();
        ctx.strokeStyle = '#A66A32';
        ctx.lineWidth = 5.6;
        ctx.beginPath();
        ctx.moveTo(9, 4);
        ctx.quadraticCurveTo(shaftLength * 0.43, -10, shaftLength, -2);
        ctx.stroke();
        ctx.strokeStyle = '#E8BD79';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(15, 1);
        ctx.quadraticCurveTo(shaftLength * 0.43, -7, shaftLength - 3, -1);
        ctx.stroke();

        // Dark leather wraps around the grip.
        ctx.strokeStyle = '#3B2114';
        ctx.lineWidth = 4.2;
        for (let i = 0; i < 3; i++) {
          const wx = 12 + i * 5;
          ctx.beginPath();
          ctx.moveTo(wx - 2, 1 - i);
          ctx.lineTo(wx + 1, -5 - i);
          ctx.stroke();
        }

        // Flexible loop and heavy wooden striker, pivoting at the head.
        ctx.strokeStyle = '#2D1B12';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(shaftLength - 1, -2);
        ctx.quadraticCurveTo(shaftLength + 10, -18 + headAngle * 4, shaftLength + 15, -5);
        ctx.quadraticCurveTo(shaftLength + 20, 8 + headAngle * 3, shaftLength + 7, 5);
        ctx.stroke();

        ctx.save();
        ctx.translate(shaftLength + 12, 4);
        ctx.rotate(headAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.moveTo(-headLength * 0.48, 0);
        ctx.lineTo(headLength * 0.48, 0);
        ctx.stroke();
        ctx.strokeStyle = '#B97839';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(-headLength * 0.48, 0);
        ctx.lineTo(headLength * 0.48, 0);
        ctx.stroke();
        ctx.strokeStyle = '#E9BD7A';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-headLength * 0.32, -1.5);
        ctx.lineTo(headLength * 0.31, -1.5);
        ctx.stroke();

        // Twine binding at the striker joint.
        ctx.strokeStyle = '#3B2114';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-headLength * 0.42, -5);
        ctx.lineTo(-headLength * 0.35, 5);
        ctx.moveTo(-headLength * 0.27, -5);
        ctx.lineTo(-headLength * 0.20, 5);
        ctx.stroke();
        ctx.restore();

        if (progress > 0.43 && progress < 0.86) {
          const spark = Math.sin((progress - 0.43) / 0.43 * Math.PI);
          ctx.strokeStyle = `rgba(255, 238, 181, ${spark * 0.88})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(shaftLength + headLength * 0.55, -8);
          ctx.lineTo(shaftLength + headLength * 0.78, -16);
          ctx.moveTo(shaftLength + headLength * 0.75, -2);
          ctx.lineTo(shaftLength + headLength * 0.98, -5);
          ctx.stroke();
        }
        ctx.restore();
      } else if (s.style === 'halberd' || s.weaponId === 'kovana_halapartna') {
        Lada.drawHalapartnaSlash(ctx, s);
      } else if (s.style === 'cane' || ((!s.style || s.style === 'arc') && s.weaponId !== 'halberd')) {
        Lada.drawOsikovyPrutSlash(ctx, s);
      } else {
        Lada.setupPath(ctx, 'transparent', COLORS.white, 8);
        ctx.beginPath();
        ctx.arc(0, 0, s.reach * 0.8, s.angle - s.arc / 2, s.angle + s.arc / 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  if (outMetrics) {
    outMetrics.renderedProjectiles = renderedProjectiles;
    outMetrics.renderedSlashes = renderedSlashes;
    return outMetrics;
  }

  return { renderedProjectiles, renderedSlashes };
}
