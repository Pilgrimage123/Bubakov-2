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

export function renderDrops(
  ctx: CanvasRenderingContext2D,
  drops: any[],
  camera: CameraViewport
): number {
  if (!drops || drops.length === 0) return 0;

  let rendered = 0;
  for (let i = 0; i < drops.length; i++) {
    const d = drops[i];
    if (!d || d.dead) continue;
    const radius = (d.radius || 14) + 24;
    if (!isInView(d.x, d.y, radius, camera)) continue;

    rendered++;
    if (d.type === 'coin') {
      Lada.drawCoin(ctx, d.x, d.y, d.time, d.value || 1);
    } else if (d.type === 'gingerbread') {
      const bob = Math.sin(d.time * 3) * 2;
      Lada.drawGingerbread(ctx, d.x, d.y + bob, (d.size as any) || 'small', Math.sin(d.time * 1.7) * 0.08);
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
    }
  }

  return rendered;
}
