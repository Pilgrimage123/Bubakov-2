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

    // 1. Výstražný symbol nápřahu (Windup Warning Indicator)
    if (warningEnabled && (e.windupTimer || 0) > 0 && (e.strikeTimer || 0) <= 0) {
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
  }

  return rendered;
}
