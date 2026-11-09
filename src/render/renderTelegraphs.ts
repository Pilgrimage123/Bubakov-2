/**
 * Enemy Telegraphs & Status Indicators Renderer (Vykreslování výstrah a indikátorů stavu)
 * 
 * Renders enemy windup warning indicators, stun stars, slow rings, and brawl fight clouds
 * with frustum culling.
 * 
 * ADR 0017, ADR 0020
 */

import { drawEnemyWarningSign, drawStunStars, Lada } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';

export interface TelegraphRenderOptions {
  warningIndicatorsEnabled?: boolean;
  statusIndicatorsEnabled?: boolean;
}

export function renderEnemyTelegraphs(
  ctx: CanvasRenderingContext2D,
  enemies: any[],
  camera: CameraViewport,
  options?: TelegraphRenderOptions,
  uiTime = 0
): number {
  if (!enemies || enemies.length === 0) return 0;

  const warningEnabled = options?.warningIndicatorsEnabled ?? true;
  const statusEnabled = options?.statusIndicatorsEnabled ?? true;
  let rendered = 0;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e || e.isDefeated || e.dead) continue;
    const radius = (e.radius || 20) + 40;
    if (!isInView(e.x, e.y, radius, camera)) continue;

    rendered++;

    // 1. Výstražný symbol nápřahu a křídový nápřah útoků (ADR 0046, Ticket 05)
    if (warningEnabled && (e.windupTimer || 0) > 0 && (e.strikeTimer || 0) <= 0) {
      const effectiveDelay = e.attackDelay || e.attackInterval || 1.2;
      const progress = Math.min(1, e.windupTimer / effectiveDelay);
      drawChalkTelegraphZone(ctx, e, progress);
      drawEnemyWarningSign(ctx, e);
    }

    // 2. Hvězdičky omráčení (Stun Stars)
    if (statusEnabled && (e.stunTimer || 0) > 0) {
      drawStunStars(ctx, e, uiTime);
    }

    // 3. Válečnice slow visual
    if (e.valecniceSlowed) {
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + e.radius * 0.75, e.radius * 0.85, e.radius * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Švanda brawl cloud (Svanda Brawl Cloud)
    if (e.brawlTimer && e.brawlTimer > 0) {
      Lada.drawSvandaBrawlCloud(ctx, e.x, e.y, uiTime);
    }

    // 5. Boss Phase 2 Enrage Aura (50% HP threshold)
    if (e.enraged && (e.isBoss || e.isMiniboss)) {
      ctx.save();
      const pulse = 1 + Math.sin(uiTime * 8) * 0.08;
      const r = (e.radius || 32) * 1.35 * pulse;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.16)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + (e.radius || 32) * 0.55, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 6. Coordinated Minion-to-Boss Synergy Tether & Ward Ring
    if (e._tetheredBoss && !e._tetheredBoss.dead && !e._tetheredBoss.isDefeated) {
      const boss = e._tetheredBoss;
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(boss.x, boss.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if ((e._synergyMinionCount || 0) > 0 && (e.isBoss || e.isMiniboss)) {
      ctx.save();
      const r = (e.radius || 34) * 1.15;
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  return rendered;
}

/**
 * Křídový nápřah útoků (ADR 0046).
 * Vykresluje zónu úderu křídovým obrysem s tužkovým šrafováním
 * a postupně nátékající tenkou akvarelovou rumělkou (#E62A19).
 */
export function drawChalkTelegraphZone(
  ctx: CanvasRenderingContext2D,
  enemy: any,
  progress: number
) {
  const radius = enemy.radius || 20;
  const reach = radius * (enemy.isBoss ? 2.5 : 1.75);
  const facingDir = (enemy.lastDx ?? (enemy.vx !== undefined && enemy.vx < 0 ? -1 : 1)) >= 0 ? 1 : -1;
  const attackAngle = typeof enemy.attackAngle === 'number'
    ? enemy.attackAngle
    : (facingDir < 0 ? Math.PI : 0);

  const forwardOffset = reach * 0.45;
  const centerX = enemy.x + Math.cos(attackAngle) * forwardOffset;
  const centerY = enemy.y + Math.sin(attackAngle) * forwardOffset * 0.55;
  const radiusX = reach;
  const radiusY = reach * 0.52;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

  // Postupně nátékající akvarelová rumělka
  const fillAlpha = Math.min(0.32, 0.08 + progress * 0.22);
  ctx.fillStyle = `rgba(230, 42, 25, ${fillAlpha})`;
  ctx.fill();

  // Křídový obrys
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = progress > 0.70 ? '#FEF08A' : 'rgba(255, 251, 235, 0.85)';
  ctx.stroke();

  // Tužkové šrafování
  ctx.clip();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(45, 22, 9, 0.22)';
  ctx.lineWidth = 1.0;
  const startX = centerX - radiusX - 10;
  const endX = centerX + radiusX + 10;
  for (let hx = startX; hx < endX; hx += 8) {
    ctx.moveTo(hx, centerY - radiusY - 10);
    ctx.lineTo(hx + radiusY * 2, centerY + radiusY + 10);
  }
  ctx.stroke();

  ctx.restore();
}
