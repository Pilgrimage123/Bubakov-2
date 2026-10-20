/**
 * Batched Particles Renderer (Dávkové vykreslování částic)
 * 
 * Draws combat particles in a single optimized pass with frustum culling
 * and without per-particle canvas state save/restore overhead.
 * 
 * ADR 0017, ADR 0020
 */

import { COLORS } from '../constants';
import { isInView, type CameraViewport } from './arenaRenderer';

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: any[],
  camera: CameraViewport
): number {
  if (!particles || particles.length === 0) return 0;

  let rendered = 0;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p || (p.life ?? 0) <= 0) continue;
    if (!isInView(p.x, p.y, p.size || 6, camera)) continue;

    rendered++;
    ctx.globalAlpha = Math.max(0, Math.min(1, (p.life || 0) * 2.5));
    ctx.fillStyle = p.color || COLORS.white;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  return rendered;
}
