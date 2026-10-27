/**
 * Drops Renderer (Vykreslování kořisti v aréně)
 * 
 * Renders all collectible drops (gingerbread, coins, potions, chests, rare items)
 * with frustum culling.
 * 
 * ADR 0017, ADR 0020
 */

import { Lada } from './ladaRenderer';
import { isInView, type CameraViewport } from './arenaRenderer';
import { gamepadManager } from '../game/gamepad';

const INTERACTIVE_DROP_TYPES = new Set([
  'chest',
  'chasnik',
  'horseshoe',
  'rooster',
  'cuckoo_clock',
  'ponocny_horn',
  'masopust_rattle',
  'babicka_apron',
  'slivovice_splash',
  'svanda_bagpipes',
  'kominik_button',
  'arcivzacny_ananas',
  'big_pouch',
  'gingerbread_stash',
]);

export function isInteractiveArenaDrop(type: string): boolean {
  return INTERACTIVE_DROP_TYPES.has(type);
}

export function renderDrops(
  ctx: CanvasRenderingContext2D,
  drops: any[],
  camera: CameraViewport,
  player?: { x: number; y: number } | null
): number {
  if (!drops || drops.length === 0) return 0;

  let rendered = 0;
  let nearestInteractDrop: any = null;
  let nearestInteractDistSq = 165 * 165;

  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d || d.dead) continue;
    const radius = (d.radius || 14) + 24;
    if (!isInView(d.x, d.y, radius, camera)) continue;

    if (player && isInteractiveArenaDrop(d.type)) {
      const dx = d.x - player.x;
      const dy = d.y - player.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= nearestInteractDistSq) {
        nearestInteractDistSq = distSq;
        nearestInteractDrop = d;
      }
    }

    rendered++;
    const isExpiring = typeof d.expiration === 'number' && d.expiration > 0 && d.expiration <= 5.0;
    if (isExpiring && Math.floor(d.expiration * 6) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }
    if (d.type === 'coin') {
      Lada.drawCoin(ctx, d.x, d.y, d.time, d.value || 1);
    } else if (d.type === 'gingerbread') {
      Lada.drawGingerbread(ctx, d.x, d.y, d.time, d.size || 'small', !!d.isHot);
    } else if (d.type === 'potion') {
      Lada.drawPotion(ctx, d.x, d.y, d.time);
    } else if (d.type === 'bread' || d.type === 'pear') {
      Lada.drawPear(ctx, d.x, d.y, d.time);
    } else if (d.type === 'soul') {
      Lada.drawSoulJar(ctx, d.x, d.y, d.time);
    } else if (d.type === 'chest') {
      Lada.drawChest(ctx, d.x, d.y, 0, Math.abs(Math.sin(d.time * 2)), 0.65);
    } else if (d.type === 'chasnik') {
      Lada.drawChasnik(ctx, d.x, d.y, d.time, true);
    } else if (d.type === 'horseshoe') {
      Lada.drawHorseshoe(ctx, d.x, d.y, d.time);
    } else if (d.type === 'rooster') {
      Lada.drawRooster(ctx, d.x, d.y, d.time);
    } else if (d.type === 'cuckoo_clock') {
      Lada.drawCuckooClock(ctx, d.x, d.y, d.time);
    } else if (d.type === 'ponocny_horn') {
      Lada.drawPonocnyHorn(ctx, d.x, d.y, d.time);
    } else if (d.type === 'masopust_rattle') {
      Lada.drawMasopustRattle(ctx, d.x, d.y, d.time);
    } else if (d.type === 'babicka_apron') {
      Lada.drawBabickaApron(ctx, d.x, d.y, d.time);
    } else if (d.type === 'slivovice_splash') {
      Lada.drawSlivoviceJug(ctx, d.x, d.y, d.time);
    } else if (d.type === 'svanda_bagpipes') {
      Lada.drawSvandaBagpipes(ctx, d.x, d.y, d.time);
    } else if (d.type === 'kominik_button') {
      Lada.drawKominikButton(ctx, d.x, d.y, d.time);
    } else if (d.type === 'arcivzacny_ananas') {
      Lada.drawAnanas(ctx, d.x, d.y, d.time);
    } else if (d.type === 'big_pouch') {
      drawBigPouch(ctx, d.x, d.y, d.time, d.value || 30);
    } else if (d.type === 'gingerbread_stash') {
      drawGingerbreadStash(ctx, d.x, d.y, d.time);
    }
    if (isExpiring) {
      ctx.globalAlpha = 1.0;
    }
  }

  if (nearestInteractDrop) {
    const isGp = gamepadManager.activeDevice === 'gamepad';
    const label =
      nearestInteractDrop.type === 'chest'
        ? isGp
          ? '[X] / [E] Otevřít truhlu'
          : '[E] / [X] Otevřít truhlu'
        : isGp
          ? '[X] / [E] Aktivovat'
          : '[E] / [X] Aktivovat';
    const boxW = nearestInteractDrop.type === 'chest' ? 168 : 144;
    const py = nearestInteractDrop.y - 38;
    ctx.save();
    ctx.fillStyle = '#FFF7DF';
    ctx.strokeStyle = '#1C1610';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(nearestInteractDrop.x - boxW / 2, py - 14, boxW, 25, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5B2118';
    ctx.font = '900 12px Eczar, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, nearestInteractDrop.x, py - 1);
    ctx.restore();
  }

  return rendered;
}

/**
 * Velký měšec krejcarů (Ladovský kožený měšec s mosaznou šňůrkou)
 */
function drawBigPouch(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, value: number): void {
  const bob = Math.sin(time * 3.0) * 3;
  ctx.save();
  ctx.translate(x, y + bob);

  // Soft shadow
  ctx.fillStyle = 'rgba(28, 25, 23, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 16 - bob * 0.5, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Leather Pouch Body (warm ochre/amber)
  ctx.fillStyle = '#B45309';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-14, -6);
  ctx.bezierCurveTo(-22, 4, -18, 16, 0, 16);
  ctx.bezierCurveTo(18, 16, 22, 4, 14, -6);
  ctx.bezierCurveTo(10, -12, -10, -12, -14, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crimped pouch top collar
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.lineTo(-15, -14);
  ctx.lineTo(-6, -11);
  ctx.lineTo(0, -15);
  ctx.lineTo(6, -11);
  ctx.lineTo(15, -14);
  ctx.lineTo(12, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brass drawstring
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, -6, 11, 3, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Gold emblem in center
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('kr', 0, 5);

  ctx.restore();
}

/**
 * Košík perníku (Proutěný košík s perníčky a červenou stuhou)
 */
function drawGingerbreadStash(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const bob = Math.sin(time * 2.8) * 3;
  ctx.save();
  ctx.translate(x, y + bob);

  // Soft shadow
  ctx.fillStyle = 'rgba(28, 25, 23, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 16 - bob * 0.5, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Amber ambient underlay glow stamp instead of shadowBlur (ADR 0029)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Woven Wicker Basket Body
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.lineTo(-12, 14);
  ctx.lineTo(12, 14);
  ctx.lineTo(16, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wicker weave lines
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-14, 3); ctx.lineTo(14, 3);
  ctx.moveTo(-13, 8); ctx.lineTo(13, 8);
  ctx.moveTo(-5, -2); ctx.lineTo(-4, 14);
  ctx.moveTo(5, -2); ctx.lineTo(4, 14);
  ctx.stroke();

  // Red Folk Ribbon / Rim
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -3, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gingerbread hearts peeking out
  ctx.fillStyle = '#854D0E';
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-6, -8, 5, 0, Math.PI * 2);
  ctx.arc(6, -8, 5, 0, Math.PI * 2);
  ctx.arc(0, -11, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
