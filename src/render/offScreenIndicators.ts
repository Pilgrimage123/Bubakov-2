import type { CameraViewport } from './arenaRenderer';
import type { GameDrop } from '../types';

export interface IndicatorItem {
  active: boolean;
  type: 'big_pouch' | 'gingerbread_stash' | 'chest';
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  angle: number;
  scale: number;
  distance: number;
  pulseTimer: number;
}

export class OffScreenIndicatorController {
  public static readonly MAX_INDICATORS = 6;
  public static readonly MARGIN = 48; // 48px margin inside viewport

  public readonly pool: IndicatorItem[] = [];

  constructor() {
    for (let i = 0; i < OffScreenIndicatorController.MAX_INDICATORS; i++) {
      this.pool.push({
        active: false,
        type: 'chest',
        worldX: 0,
        worldY: 0,
        screenX: 0,
        screenY: 0,
        angle: 0,
        scale: 1,
        distance: 0,
        pulseTimer: 0,
      });
    }
  }

  /**
   * Projects a world position onto an elliptical viewport border clamp.
   */
  public static projectToViewportEllipse(
    worldX: number,
    worldY: number,
    camera: CameraViewport,
    margin = OffScreenIndicatorController.MARGIN
  ): { screenX: number; screenY: number; angle: number; isOffScreen: boolean; distance: number } {
    const viewW = camera.width;
    const viewH = camera.height;
    const camCenterX = camera.x + viewW * 0.5;
    const camCenterY = camera.y + viewH * 0.5;

    // Check if within visible bounds (with inner padding)
    const isOffScreen =
      worldX < camera.x ||
      worldX > camera.x + viewW ||
      worldY < camera.y ||
      worldY > camera.y + viewH;

    const dx = worldX - camCenterX;
    const dy = worldY - camCenterY;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    // Ellipse semi-axes
    const a = Math.max(30, viewW * 0.5 - margin);
    const b = Math.max(30, viewH * 0.5 - margin);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const denom = Math.sqrt((b * cos) * (b * cos) + (a * sin) * (a * sin)) || 1;
    const r = (a * b) / denom;

    const screenX = viewW * 0.5 + cos * r;
    const screenY = viewH * 0.5 + sin * r;

    return {
      screenX,
      screenY,
      angle,
      isOffScreen,
      distance: dist,
    };
  }

  /**
   * Updates indicator pool based on current heavy anchor drops on map.
   */
  public update(
    drops: readonly GameDrop[] | null | undefined,
    camera: CameraViewport,
    dt: number,
    playerHpPct = 1.0
  ): number {
    // Reset pool
    for (let i = 0; i < OffScreenIndicatorController.MAX_INDICATORS; i++) {
      this.pool[i].active = false;
    }
    if (!drops || drops.length === 0) return 0;

    let activeCount = 0;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      if (!d || d.dead) continue;
      const isAnchor =
        d.type === 'big_pouch' ||
        d.type === 'gingerbread_stash' ||
        d.type === 'chest' ||
        d.isHeavyAnchor;

      if (!isAnchor) continue;

      const proj = OffScreenIndicatorController.projectToViewportEllipse(d.x, d.y, camera);
      if (!proj.isOffScreen) continue;

      if (activeCount >= OffScreenIndicatorController.MAX_INDICATORS) break;

      const ind = this.pool[activeCount];
      ind.active = true;
      ind.type = (d.type as any) || 'chest';
      ind.worldX = d.x;
      ind.worldY = d.y;
      ind.screenX = proj.screenX;
      ind.screenY = proj.screenY;
      ind.angle = proj.angle;
      ind.distance = proj.distance;
      ind.pulseTimer += dt;

      // Distance lerp: 0.75x (far >= 2500px) to 1.15x (near edge)
      const distFactor = Math.max(0, Math.min(1, (proj.distance - 600) / 2000));
      let baseScale = 1.15 - distFactor * 0.40;

      // Pulse Košík arrow in sync with low-HP warning when HP < 30%
      if (ind.type === 'gingerbread_stash' && playerHpPct < 0.30) {
        baseScale *= 1.0 + Math.sin(ind.pulseTimer * 8.0) * 0.22;
      }

      ind.scale = baseScale;
      activeCount++;
    }

    return activeCount;
  }

  /**
   * Renders the indicators onto the Canvas2D camera/HUD overlay.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < OffScreenIndicatorController.MAX_INDICATORS; i++) {
      const ind = this.pool[i];
      if (!ind.active) continue;

      ctx.save();
      ctx.translate(ind.screenX, ind.screenY);
      ctx.rotate(ind.angle);
      ctx.scale(ind.scale, ind.scale);

      // Distinct styling per Heavy Anchor type
      let badgeColor = '#F59E0B'; // Gold Pouch
      let badgeGlow = 'rgba(245, 158, 11, 0.45)';
      let iconSymbol = '🪙';
      let label = 'MĚŠEC';

      if (ind.type === 'gingerbread_stash') {
        badgeColor = '#D97706'; // Amber Košík
        badgeGlow = 'rgba(234, 88, 12, 0.55)';
        iconSymbol = '🧺';
        label = 'KOŠÍK';
      } else if (ind.type === 'chest') {
        badgeColor = '#8B5CF6'; // Ornate Chest
        badgeGlow = 'rgba(139, 92, 246, 0.50)';
        iconSymbol = '👑';
        label = 'TRUHLA';
      }

      // Outer glow underlay stamp instead of shadowBlur (ADR 0029)
      ctx.fillStyle = badgeGlow;
      ctx.beginPath();
      ctx.arc(-22, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Pointer Arrow (pointing right since rotate(angle) aligns right with direction)
      ctx.fillStyle = badgeColor;
      ctx.strokeStyle = '#1E1B18';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(2, -12);
      ctx.lineTo(6, -4);
      ctx.lineTo(-14, -4);
      ctx.lineTo(-14, 4);
      ctx.lineTo(6, 4);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rounded Badge behind arrow
      ctx.fillStyle = '#261F1A';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-22, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon Symbol (un-rotated for readability)
      ctx.save();
      ctx.translate(-22, 0);
      ctx.rotate(-ind.angle);
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconSymbol, 0, 1);
      ctx.restore();

      ctx.restore();
    }
  }
}
