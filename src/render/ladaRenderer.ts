import React from 'react';
import { FROSTLING_AURA_RADIUS } from '../game/frostAura';
import { COLORS } from '../constants';
import type { Enemy, EnemyAttackCadence, EnemyAttackInfo } from '../types';
import { CADENCE_ATTACK_DELAYS, CADENCE_RECOVERY_DURATIONS } from '../types';
import { drawGingerbreadHeartCanvas } from './pernicekCanvas';
import { drawGlyphText } from './glyphAtlas';
import { getGlobalBakedBubakAtlas } from './bakedBubakAtlas';

const ladaSpriteCache = new Map<string, HTMLCanvasElement>();

export function getCachedLadaSprite(
  key: string,
  width: number,
  height: number,
  renderFn: (ctx: CanvasRenderingContext2D, cx: number, cy: number) => void
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let canvas = ladaSpriteCache.get(key);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const cctx = canvas.getContext('2d');
    if (cctx) {
      renderFn(cctx, width * 0.5, height * 0.5);
    }
    ladaSpriteCache.set(key, canvas);
  }
  return canvas;
}

var Lada = {
	setupPath(ctx, fill, stroke = COLORS.ink, lineWidth = 4) {
		ctx.fillStyle = fill;
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
	},
	drawShadow(ctx, x, y, radius) {
		ctx.fillStyle = "rgba(0,0,0,0.16)";
		ctx.beginPath();
		ctx.ellipse(x, y + radius * .8, radius * .95, radius * .35, 0, 0, Math.PI * 2);
		ctx.fill();
	},
	drawLimb(ctx, x1, y1, x2, y2, color, width, extra) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = width + 4;
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.stroke();
		if (extra) extra(ctx, x1, y1, x2, y2, width);
	},
	drawBentLimb(ctx, x1, y1, kx, ky, x2, y2, color, width, extra) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(kx, ky);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = width + 4;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(kx, ky);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.stroke();
		if (extra) extra(ctx, x1, y1, kx, ky, x2, y2, width);
	},
	getRunLegCycle(phase, hipX, hipY, legLen) {
		const p = (phase % 1 + 1) % 1;
		let kx = hipX;
		let ky = hipY + legLen * .5;
		let fx = hipX;
		let fy = hipY + legLen;
		if (p < .25) {
			const t = p / .25;
			kx = hipX + legLen * (.35 - t * .15);
			ky = hipY + legLen * (.42 + t * .08);
			fx = hipX + legLen * (.68 - t * .25);
			fy = hipY + legLen * (.88 + t * .12);
		} else if (p < .5) {
			const t = (p - .25) / .25;
			kx = hipX + legLen * (.2 - t * .4);
			ky = hipY + legLen * (.5 - t * .05);
			fx = hipX + legLen * (.43 - t * .95);
			fy = hipY + legLen * (1 - t * .18);
		} else if (p < .75) {
			const t = (p - .5) / .25;
			kx = hipX + legLen * (-.2 + t * .7);
			ky = hipY + legLen * (.45 - t * .24);
			fx = hipX + legLen * (-.52 + t * .55);
			fy = hipY + legLen * (.82 - t * .35);
		} else {
			const t = (p - .75) / .25;
			kx = hipX + legLen * (.5 - t * .15);
			ky = hipY + legLen * (.21 + t * .21);
			fx = hipX + legLen * (.03 + t * .65);
			fy = hipY + legLen * (.47 + t * .41);
		}
		return {
			kx,
			ky,
			fx,
			fy
		};
	},
	drawPanicDrops(ctx, headX, headY, time) {
		ctx.save();
		for (let i = 0; i < 3; i++) {
			const dropT = (time * 4.2 + i * .33) % 1;
			const dx = headX - 12 - dropT * 22 - i * 4;
			const dy = headY - 4 - Math.sin(dropT * Math.PI) * 12 + i * 5;
			const r = (1 - dropT * .45) * 2.8;
			if (dropT > .08 && dropT < .92) {
				ctx.fillStyle = "#60A5FA";
				ctx.strokeStyle = COLORS.ink;
				ctx.lineWidth = 1.3;
				ctx.beginPath();
				ctx.arc(dx, dy, Math.max(1, r), 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}
		}
		ctx.restore();
	},
	drawRunDust(ctx, footX, groundY, time) {
		ctx.save();
		for (let i = 0; i < 2; i++) {
			const puffT = (time * 4.8 + i * .5) % 1;
			const px = footX - 8 - puffT * 20;
			const py = groundY - 2 - puffT * 5;
			const r = 2.5 + puffT * 7;
			const alpha = (1 - puffT) * .65;
			ctx.fillStyle = `rgba(224, 212, 188, ${alpha})`;
			ctx.strokeStyle = `rgba(45, 28, 14, ${alpha * .75})`;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.arc(px, py, Math.max(1, r), 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
	},
	drawKrajanek(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const moving = (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) && !fleeing;
		const bob = moving ? Math.abs(Math.sin(time * 13)) * 3.5 : Math.sin(time * 2.2);
		const leg = moving ? Math.sin(time * 13) * 10 : 0;
		ctx.save(); ctx.translate(x, y - bob); ctx.scale(scale * dir, scale);
		if (fleeing) { ctx.rotate(Math.PI / 2); ctx.translate(0, -15); }
		this.setupPath(ctx, "#E9B82E", COLORS.ink, 3);
		ctx.beginPath(); ctx.moveTo(-15, 2); ctx.quadraticCurveTo(-23, 18, -16 - leg * .25, 27); ctx.lineTo(-3, 28); ctx.lineTo(1, 13); ctx.quadraticCurveTo(9, 22, 14 + leg * .25, 28); ctx.lineTo(25, 27); ctx.quadraticCurveTo(28, 12, 14, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#B98167", COLORS.ink, 2); ctx.beginPath(); ctx.roundRect(-18, 13, 13, 12, 2); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#F7F5E9", COLORS.ink, 2); ctx.beginPath(); ctx.rect(-15, 26, 11, 18); ctx.rect(13, 26, 11, 18); ctx.fill(); ctx.stroke();
		ctx.strokeStyle = "#56A6D7"; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-15 + i * 3, 28); ctx.lineTo(-19 + i * 3, 43); ctx.moveTo(14 + i * 3, 28); ctx.lineTo(17 + i * 3, 43); ctx.stroke(); }
		this.setupPath(ctx, "#3B3129", COLORS.ink, 3); ctx.beginPath(); ctx.roundRect(-29, 42, 22, 10, 4); ctx.roundRect(12, 42, 22, 10, 4); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#F8F5EA", COLORS.ink, 3); ctx.beginPath(); ctx.ellipse(0, -7, 23, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-21, -8, 9, 12, -.5, 0, Math.PI * 2); ctx.ellipse(20, -7, 9, 12, .5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#155DAD", COLORS.ink, 3); ctx.beginPath(); ctx.moveTo(-15, -24); ctx.lineTo(-20, 5); ctx.quadraticCurveTo(-9, 8, -6, 3); ctx.lineTo(0, -14); ctx.lineTo(7, 3); ctx.quadraticCurveTo(14, 9, 21, 4); ctx.lineTo(14, -24); ctx.closePath(); ctx.fill(); ctx.stroke();
		for (let i = 0; i < 3; i++) { this.setupPath(ctx, "#FFD43B", COLORS.ink, 1.4); ctx.beginPath(); ctx.arc(-11, -13 + i * 9, 2.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(12, -13 + i * 9, 2.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
		this.setupPath(ctx, "#D91E24", COLORS.ink, 2.5); ctx.beginPath(); ctx.moveTo(-13, -20); ctx.quadraticCurveTo(0, -13, 15, -20); ctx.lineTo(11, -10); ctx.quadraticCurveTo(0, -3, -10, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#C98B49", COLORS.ink, 2.5); ctx.beginPath(); ctx.moveTo(16, -29); ctx.quadraticCurveTo(26, -35, 31, -21); ctx.lineTo(28, -6); ctx.quadraticCurveTo(23, -1, 15, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#9A612F", COLORS.ink, 3); ctx.beginPath(); ctx.moveTo(26, 10); ctx.lineTo(35, -32); ctx.quadraticCurveTo(38, -39, 43, -34); ctx.stroke();
		this.setupPath(ctx, "#F4B17C", COLORS.ink, 2.5); ctx.beginPath(); ctx.ellipse(0, -34, 18, 19, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#9A5728", COLORS.ink, 2.3); ctx.beginPath(); ctx.arc(-1, -35, 18, 3.3, 6.0); ctx.quadraticCurveTo(11, -44, 17, -34); ctx.quadraticCurveTo(10, -47, 7, -43); ctx.quadraticCurveTo(-8, -50, -17, -38); ctx.closePath(); ctx.fill(); ctx.stroke();
		ctx.fillStyle = "rgba(238,74,66,0.5)"; ctx.beginPath(); ctx.ellipse(-11, -32, 4, 3, 0, 0, Math.PI * 2); ctx.ellipse(10, -32, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
		ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.ellipse(-5, -38, 2, 3, 0, 0, Math.PI * 2); ctx.ellipse(6, -38, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
		this.setupPath(ctx, "#C94735", COLORS.ink, 1.6); ctx.beginPath(); ctx.ellipse(0, -29, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#6A9C47", COLORS.ink, 3); ctx.beginPath(); ctx.moveTo(-20, -41); ctx.quadraticCurveTo(-30, -58, -16, -67); ctx.quadraticCurveTo(0, -75, 17, -61); ctx.quadraticCurveTo(25, -54, 25, -43); ctx.closePath(); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#3D6C91", COLORS.ink, 2.5); ctx.beginPath(); ctx.moveTo(-23, -45); ctx.quadraticCurveTo(0, -40, 27, -45); ctx.lineTo(22, -51); ctx.quadraticCurveTo(0, -46, -20, -52); ctx.closePath(); ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#EAF7F8", COLORS.ink, 2); ctx.beginPath(); ctx.moveTo(3, -56); ctx.quadraticCurveTo(-8, -73, -1, -90); ctx.quadraticCurveTo(12, -83, 11, -62); ctx.closePath(); ctx.fill(); ctx.stroke();
		ctx.strokeStyle = "#315D2B"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(12, -49); ctx.lineTo(24, -78); ctx.moveTo(17, -62); ctx.lineTo(29, -70); ctx.stroke();
		ctx.fillStyle = "#B66CD2"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(22 + i * 2.3, -65 - i * 2.2, 2.3, 4, -.7, 0, Math.PI * 2); ctx.fill(); }
		ctx.restore();
	},
	drawKrajanekFlats(ctx, flats) {
		if (!flats || !flats.length) return;
		for (let i = 0; i < flats.length; i++) {
			const flat = flats[i]; ctx.save(); ctx.translate(flat.x, flat.y); ctx.rotate(flat.angle || 0); ctx.globalAlpha = Math.min(.72, flat.life / 2.5);
			ctx.fillStyle = "#4A3129"; ctx.beginPath(); ctx.ellipse(0, 4, 18 * flat.scale, 5.5 * flat.scale, 0, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = "#2E2927"; ctx.beginPath(); ctx.ellipse(-1, 0, 10 * flat.scale, 3.7 * flat.scale, -.08, 0, Math.PI * 2); ctx.ellipse(10 * flat.scale, -1, 4 * flat.scale, 3.2 * flat.scale, .15, 0, Math.PI * 2); ctx.fill();
			ctx.strokeStyle = "#C2A078"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 5, 21 * flat.scale, 7 * flat.scale, 0, .1, Math.PI - .1); ctx.stroke(); ctx.restore();
		}
	},
	drawKrajanekFurrows(ctx, furrows) {
		if (!furrows || !furrows.length) return;
		for (let i = 0; i < furrows.length; i++) {
			const f = furrows[i];
			ctx.save();
			ctx.translate(f.x, f.y);
			ctx.rotate(f.angle || 0);
			const alpha = Math.min(0.75, (f.life / (f.maxLife || 5)) * 0.75);
			ctx.globalAlpha = alpha;
			// Deep mud rut trench
			ctx.fillStyle = "#331E14";
			ctx.beginPath();
			ctx.ellipse(0, 0, (f.width || 38) * 0.55, 7, 0, 0, Math.PI * 2);
			ctx.fill();
			// Churned soil inner groove
			ctx.fillStyle = "#1E120B";
			ctx.beginPath();
			ctx.ellipse(0, 1, (f.width || 38) * 0.4, 3.8, 0, 0, Math.PI * 2);
			ctx.fill();
			// Scattered clods of plowed field mud
			ctx.fillStyle = "#4A2F21";
			for (let k = 0; k < 3; k++) {
				const offX = (k - 1) * ((f.width || 38) * 0.35);
				ctx.beginPath();
				ctx.ellipse(offX, -5, 3.5, 2.2, 0.2, 0, Math.PI * 2);
				ctx.ellipse(offX + 4, 5, 3, 2, -0.3, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
	},
	drawCoastingZernov(ctx, stone, time) {
		const spin = time * 7.5;
		const r = stone.radius || 48;
		const colossusScale = (stone.radius || 48) / 48;
		ctx.save();
		ctx.translate(stone.x, stone.y);
		ctx.scale(colossusScale, colossusScale);

		// Ground shadow
		ctx.fillStyle = "rgba(29,23,18,.35)";
		ctx.beginPath();
		ctx.ellipse(0, 24, r * 1.25, 20, 0, 0, Math.PI * 2);
		ctx.fill();

		// Rolling upright stone
		ctx.save();
		ctx.translate(0, 2);
		ctx.rotate(spin);
		this.setupPath(ctx, "#B0AEA5", COLORS.ink, 4);
		ctx.beginPath();
		ctx.arc(0, 0, 47, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Chiseled radial grooves
		ctx.strokeStyle = "#6B6E6A";
		ctx.lineWidth = 2.4;
		for (let i = 0; i < 14; i++) {
			const a = (i * Math.PI) / 7;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9);
			ctx.lineTo(Math.cos(a) * 40, Math.sin(a) * 40);
			ctx.stroke();
		}
		// Center hub
		this.setupPath(ctx, "#8C5E35", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, 0, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Speed lines and sparks behind runaway boulder
		ctx.strokeStyle = "#FDE047";
		ctx.lineWidth = 2;
		for (let k = 0; k < 4; k++) {
			const a = Math.PI + (k - 1.5) * 0.4;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * (r * 0.9), Math.sin(a) * (r * 0.9));
			ctx.lineTo(Math.cos(a) * (r * 1.45), Math.sin(a) * (r * 1.45));
			ctx.stroke();
		}
		ctx.restore();
	},
	drawKrajanekRide(ctx, x, y, time, dx, dy, scale = 1, tilt = 0, isDrifting = false, colossusScale = 1) {
		const phase = time * (isDrifting ? 7.5 : 5.5);
		const spin = time * 3.7;
		const finalScale = scale * (colossusScale || 1);
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(finalScale, finalScale);

		// Jízda po hraně: tilt/lean banking
		if (tilt !== 0) {
			ctx.rotate(tilt * 0.22);
		}

		// Ground shadow
		ctx.fillStyle = "rgba(29,23,18,.26)";
		ctx.beginPath();
		ctx.ellipse(0, 24, 61, 19, 0, 0, Math.PI * 2);
		ctx.fill();

		// Spinning millstone wheel
		ctx.save();
		ctx.translate(0, 2 + Math.sin(phase) * 2);
		ctx.rotate(spin);
		this.setupPath(ctx, "#A9A9A1", COLORS.ink, 4);
		ctx.beginPath();
		ctx.arc(0, 0, 47, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = "#777A77";
		ctx.lineWidth = 2;
		for (let i = 0; i < 12; i++) {
			const a = (i * Math.PI) / 6;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
			ctx.lineTo(Math.cos(a) * (39 - (i % 3) * 4), Math.sin(a) * (39 - (i % 3) * 4));
			ctx.stroke();
		}
		ctx.fillStyle = "#D4D1C5";
		for (let i = 0; i < 15; i++) {
			const a = i * 2.399;
			const rr = 12 + (i % 5) * 6;
			ctx.beginPath();
			ctx.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, 2.3, 1.4, a, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

		// Wooden axle eye
		this.setupPath(ctx, "#B77C3C", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 2, 15, 11, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#5C3822";
		ctx.beginPath();
		ctx.ellipse(0, 2, 5.5, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Krajánek balancing on top of the wheel (pedaling furiously with legs)
		this.drawKrajanek(ctx, 0, -39, time * (isDrifting ? 1.6 : 1.3), dx, dy, false, 0.78);

		// Krajánek's iron oškrt hammer swinging in hand
		ctx.save();
		ctx.translate(26, -77);
		ctx.rotate(-0.95 + Math.sin(phase) * 0.78);
		this.setupPath(ctx, "#A36A37", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-1, 7);
		ctx.lineTo(3, -28);
		ctx.stroke();
		this.setupPath(ctx, "#777A78", COLORS.ink, 3);
		ctx.beginPath();
		ctx.roundRect(-8, -36, 22, 12, 3);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Spark burst at rim
		if (Math.abs(Math.sin(phase * 0.5)) > 0.28) {
			ctx.strokeStyle = "#FFD22F";
			ctx.lineWidth = 2.2;
			ctx.lineCap = "round";
			for (let i = 0; i < 7; i++) {
				const a = (i * Math.PI * 2) / 7 + time * 0.9;
				const inner = 43 + (i % 3) * 3;
				const outer = inner + 8 + (i % 2) * 5;
				ctx.beginPath();
				ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
				ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
				ctx.stroke();
			}
			ctx.fillStyle = "#E5E7EB";
			for (let i = 0; i < 5; i++) {
				const a = i * 2.4 + time;
				ctx.beginPath();
				ctx.moveTo(Math.cos(a) * 54, Math.sin(a) * 54);
				ctx.lineTo(Math.cos(a + 0.2) * 61, Math.sin(a + 0.2) * 61);
				ctx.lineTo(Math.cos(a + 0.4) * 55, Math.sin(a + 0.4) * 55);
				ctx.closePath();
				ctx.fill();
			}
		}

		// Štěrkový smyk: extra friction quartz chips and mud spray on outer edge
		if (isDrifting) {
			ctx.save();
			const spraySide = (tilt || 1) > 0 ? -1 : 1;
			ctx.fillStyle = "#E2E8F0";
			for (let k = 0; k < 6; k++) {
				const a = Math.PI * 0.5 + spraySide * (0.6 + k * 0.15);
				const dist = 48 + k * 6;
				ctx.beginPath();
				ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist + 12, 2.2, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.fillStyle = "#5C3822";
			for (let k = 0; k < 5; k++) {
				const a = Math.PI * 0.5 + spraySide * (0.4 + k * 0.2);
				const dist = 46 + k * 7;
				ctx.beginPath();
				ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist + 16, 3, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}

		ctx.restore();
	},
	drawWanderer(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > .1 || Math.abs(dy) > .1) && !fleeing;
		const bob = isMoving ? Math.abs(Math.sin(time * 15)) * 4 : Math.sin(time * 2) * 1;
		const legSwing = isMoving ? Math.sin(time * 15) * 15 : 0;
		const pipeBob = Math.sin(time * 3) * 1.5;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -20);
		}
		this.drawLimb(ctx, 0, 10, -legSwing, 32, COLORS.ink, 10);
		this.setupPath(ctx, COLORS.woodDark);
		ctx.beginPath();
		ctx.arc(-legSwing + 3, 32, 6, 0, Math.PI);
		ctx.fill();
		ctx.stroke();
		this.drawLimb(ctx, 0, 10, legSwing, 32, COLORS.ink, 10);
		this.setupPath(ctx, COLORS.woodDark);
		ctx.beginPath();
		ctx.arc(legSwing + 3, 32, 6, 0, Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.translate(0, -bob);
		this.setupPath(ctx, COLORS.woodLight);
		ctx.beginPath();
		ctx.moveTo(-18, 0);
		ctx.quadraticCurveTo(-30, 20, -15, 28);
		ctx.lineTo(10, 28);
		ctx.quadraticCurveTo(20, 15, 18, 0);
		ctx.fill();
		ctx.stroke();
		this.drawLimb(ctx, -10, -5, -15 - legSwing * .6, 15, COLORS.woodLight, 10);
		this.setupPath(ctx, COLORS.woodLight);
		ctx.beginPath();
		ctx.ellipse(0, pipeBob, 22, 16, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.mustard;
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.arc(10, -5 + i * 6 + pipeBob, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		this.setupPath(ctx, COLORS.ink, COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-20, 8 + pipeBob);
		ctx.lineTo(20, 8 + pipeBob);
		ctx.stroke();
		ctx.fillStyle = COLORS.mustard;
		ctx.fillRect(5, 5 + pipeBob, 6, 6);
		ctx.strokeRect(5, 5 + pipeBob, 6, 6);
		ctx.translate(0, pipeBob);
		this.setupPath(ctx, COLORS.skin);
		ctx.beginPath();
		ctx.arc(0, -22, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.ink);
		ctx.beginPath();
		ctx.arc(0, -18, 16, .1, Math.PI - .1);
		ctx.quadraticCurveTo(5, 12, 18, -12);
		ctx.fill();
		if (!fleeing) {
			this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2);
			ctx.beginPath();
			ctx.moveTo(10, -15);
			ctx.lineTo(25, -10);
			ctx.stroke();
			ctx.beginPath();
			ctx.rect(23, -14, 6, 8);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "rgba(255,255,255,0.6)";
			ctx.beginPath();
			ctx.arc(26 + Math.sin(time * 2) * 2, -20 - time * 10 % 15, 3 + time * 5 % 5, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(6, -26, 2, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, COLORS.woodDark);
		ctx.beginPath();
		ctx.ellipse(0, -34, 22, 6, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(-2, -40, 14, 12, 0, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-16, -37);
		ctx.quadraticCurveTo(0, -34, 12, -37);
		ctx.stroke();
		this.drawLimb(ctx, 10, -5, 15 + legSwing * .6, 15, COLORS.woodLight, 10);
		ctx.restore();
	},
	drawShepherd(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > .1 || Math.abs(dy) > .1) && !fleeing;
		const bob = isMoving ? Math.abs(Math.sin(time * 20)) * 5 : Math.sin(time * 3) * 1;
		const legSwing = isMoving ? Math.sin(time * 20) * 18 : 0;
		const breathing = Math.sin(time * 4) * 1;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -15);
		}
		this.drawLimb(ctx, -4, 5, -legSwing, 28, COLORS.white, 7);
		this.drawLimb(ctx, 4, 5, legSwing, 28, COLORS.white, 7);
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-legSwing + 2, 28, 6, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(legSwing + 2, 28, 6, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.translate(0, -bob);
		ctx.translate(0, breathing);
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 4);
		const crookTilt = isMoving ? Math.sin(time * 20) * .2 : Math.sin(time * 2) * .1;
		ctx.save();
		ctx.translate(-15, 5);
		ctx.rotate(crookTilt);
		ctx.beginPath();
		ctx.moveTo(0, 20);
		ctx.lineTo(0, -30);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(5, -30, 5, Math.PI, 0);
		ctx.stroke();
		ctx.restore();
		this.drawLimb(ctx, -8, -5, -15, 5, COLORS.white, 6);
		this.setupPath(ctx, COLORS.white);
		ctx.beginPath();
		ctx.moveTo(-12, -10);
		ctx.lineTo(-16, 18);
		ctx.lineTo(16, 18);
		ctx.lineTo(12, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.mustard);
		ctx.beginPath();
		ctx.arc(0, 2, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.skin);
		ctx.beginPath();
		ctx.arc(0, -18, 12, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgba(209, 52, 43, 0.3)";
		ctx.beginPath();
		ctx.arc(4, -15, 3, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, COLORS.mustard);
		ctx.beginPath();
		ctx.arc(0, -22, 13, Math.PI, 0);
		ctx.quadraticCurveTo(-18, -8, -10, -18);
		ctx.quadraticCurveTo(18, -8, 10, -20);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(6, -20, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.white;
		ctx.beginPath();
		ctx.arc(6.5, -21, 1, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawKorenarka(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > .1 || Math.abs(dy) > .1) && !fleeing;
		const bob = isMoving ? Math.abs(Math.sin(time * 16)) * 4 : Math.sin(time * 2.5) * 1;
		const legSwing = isMoving ? Math.sin(time * 16) * 14 : 0;
		const headBob = Math.sin(time * 3) * 1.2;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -18);
		}
		this.drawLimb(ctx, -5, 12, -legSwing - 2, 28, COLORS.ink, 8);
		this.drawLimb(ctx, 5, 12, legSwing + 2, 28, COLORS.ink, 8);
		ctx.translate(0, -bob);
		ctx.save();
		ctx.translate(-16, -6);
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(0, -16);
		ctx.lineTo(14, -16);
		ctx.lineTo(12, 14);
		ctx.lineTo(-2, 14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.green, COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(2, -20, 6, 0, Math.PI * 2);
		ctx.arc(10, -22, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.mustard;
		ctx.beginPath();
		ctx.arc(6, -24, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		this.setupPath(ctx, "#2F4858", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-18, 0);
		ctx.quadraticCurveTo(-24, 18, -18, 26);
		ctx.lineTo(18, 26);
		ctx.quadraticCurveTo(24, 18, 18, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-11, 2);
		ctx.lineTo(-14, 25);
		ctx.lineTo(14, 25);
		ctx.lineTo(11, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.translate(0, headBob);
		this.setupPath(ctx, COLORS.red, COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -18, 14, Math.PI * .65, Math.PI * 1.85);
		ctx.quadraticCurveTo(8, -32, 13, -20);
		ctx.quadraticCurveTo(15, -12, 6, -5);
		ctx.quadraticCurveTo(-4, -4, -10, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(3, -6);
		ctx.lineTo(8, -1);
		ctx.lineTo(2, 2);
		ctx.lineTo(-1, -5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.white;
		[
			[-8, -25],
			[-2, -30],
			[-9, -17],
			[-4, -23],
			[-8, -10],
			[5, -31],
			[4, 0]
		].forEach(([px, py]) => {
			ctx.beginPath();
			ctx.arc(px, py, 1.8, 0, Math.PI * 2);
			ctx.fill();
		});
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(3, -17, 9.5, 11, .1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#9C968B", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(2, -22, 6.5, Math.PI * 1, Math.PI * 1.8);
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(5, -18, 4.5, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(5.5, -18, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.white;
		ctx.beginPath();
		ctx.arc(6.2, -18.7, .7, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(.5, -18);
		ctx.lineTo(9.5, -18);
		ctx.stroke();
		ctx.strokeStyle = "#5A5043";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.arc(5, -23, 3, Math.PI * 1.1, Math.PI * 1.8);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(7.5, -19);
		ctx.lineTo(10.5, -16);
		ctx.lineTo(8, -15);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(5, -12, 3.2, .2, Math.PI * .7);
		ctx.stroke();
		ctx.fillStyle = "rgba(224, 82, 82, 0.5)";
		ctx.beginPath();
		ctx.arc(4, -13, 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawWatchman(ctx: any, x: number, y: number, time: number, dx: number, dy: number, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) && !fleeing;
		const walkFreq = isMoving ? 14 : 2.5;
		const bob = isMoving ? Math.abs(Math.sin(time * walkFreq)) * 3.5 : Math.sin(time * 2.5) * 1.0;
		const legSwing = isMoving ? Math.sin(time * walkFreq) * 12 : 0;
		const headBob = Math.sin(time * 3) * 1.0;
		const lanternSwing = Math.sin(time * (isMoving ? 14 : 3)) * (isMoving ? 0.35 : 0.12);
		const coatFlutter = isMoving ? Math.sin(time * walkFreq - 0.6) * 4 : 0;

		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -20);
		}

		// 1. Ground contact shadow
		this.drawShadow(ctx, 0, 26, 16);

		// 2. Legs & Boots (Sturdy brown trousers + heavy black leather boots)
		// Back leg
		this.drawBentLimb(ctx, -5, 10, -legSwing * 0.7 - 6, 20, -legSwing - 5, 29, "#784A28", 8);
		// Back boot
		this.setupPath(ctx, "#18181B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-legSwing - 4, 30, 8, 4.5, -0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Front leg
		this.drawBentLimb(ctx, 5, 10, legSwing * 0.7 + 6, 20, legSwing + 5, 29, "#784A28", 8);
		// Front boot
		this.setupPath(ctx, "#18181B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(legSwing + 6, 30, 8.5, 5, 0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 3. Torso bobbing
		ctx.translate(0, -bob);

		// 4. Heavy Winter Overcoat (Ponocenský plášť - deep slate teal/navy #2A3B4C)
		// Rear coat flare
		this.setupPath(ctx, "#1E293B", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-18, 0);
		ctx.quadraticCurveTo(-26 - coatFlutter, 18, -20 - coatFlutter * 1.2, 28);
		ctx.lineTo(20, 28);
		ctx.quadraticCurveTo(24, 16, 16, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Main coat body
		this.setupPath(ctx, "#334155", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.moveTo(-17, -8);
		ctx.quadraticCurveTo(-22, 12, -18, 26);
		ctx.lineTo(19, 26);
		ctx.quadraticCurveTo(23, 12, 17, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Broad leather belt with brass buckle
		this.setupPath(ctx, "#5A3416", COLORS.ink, 2.5);
		ctx.fillRect(-17, 7, 35, 6);
		ctx.strokeRect(-17, 7, 35, 6);
		// Big rectangular brass buckle
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 2);
		ctx.fillRect(-4, 6, 9, 8);
		ctx.strokeRect(-4, 6, 9, 8);
		// Buckle prong
		ctx.fillStyle = COLORS.ink;
		ctx.fillRect(-1, 8.5, 4, 3);

		// Double-breasted brass buttons (2 columns of 3 buttons)
		for (let row = 0; row < 3; row++) {
			const by = -4 + row * 4;
			// Left column
			this.setupPath(ctx, "#FBBF24", "#78350F", 1.2);
			ctx.beginPath();
			ctx.arc(-7, by, 1.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			// Right column
			ctx.beginPath();
			ctx.arc(6, by, 1.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}

		// Lapel collar (v-collar)
		this.setupPath(ctx, "#475569", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-15, -8);
		ctx.lineTo(-4, -1);
		ctx.lineTo(0, -7);
		ctx.lineTo(4, -1);
		ctx.lineTo(15, -8);
		ctx.lineTo(9, -14);
		ctx.lineTo(-9, -14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Leather shoulder strap for lantern
		ctx.strokeStyle = "#5A3416";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(10, -10);
		ctx.lineTo(-14, 11);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1;
		ctx.stroke();

		// 5. Hanging Watchman Lantern (Lucerna ponocného)
		ctx.save();
		const lanternX = -17 - legSwing * 0.25;
		const lanternY = 12;
		ctx.translate(lanternX, lanternY);
		ctx.rotate(lanternSwing);

		// Strap attachment ring
		ctx.strokeStyle = "#F59E0B";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
		ctx.stroke();

		// Warm amber glow cast by candle
		const lanternGlow = ctx.createRadialGradient(0, 3, 2, 0, 3, 26);
		lanternGlow.addColorStop(0, "rgba(253, 224, 71, 0.45)");
		lanternGlow.addColorStop(0.5, "rgba(245, 158, 11, 0.2)");
		lanternGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
		ctx.fillStyle = lanternGlow;
		ctx.beginPath();
		ctx.arc(0, 3, 26, 0, Math.PI * 2);
		ctx.fill();

		// Lantern metal hood / cap
		this.setupPath(ctx, "#334155", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-7, -4);
		ctx.lineTo(7, -4);
		ctx.lineTo(5, -1);
		ctx.lineTo(-5, -1);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Glowing glass chamber with frame
		this.setupPath(ctx, "#FEF08A", COLORS.ink, 2);
		ctx.fillRect(-6, -1, 12, 13);
		ctx.strokeRect(-6, -1, 12, 13);

		// Candle flame inside
		ctx.fillStyle = "#EA580C";
		ctx.beginPath();
		ctx.ellipse(0, 6 + Math.sin(time * 12) * 0.8, 2.2, 4 + Math.sin(time * 14) * 0.7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(0, 7.5, 1.2, 0, Math.PI * 2);
		ctx.fill();

		// Lantern corner struts and crossbars
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(0, -1);
		ctx.lineTo(0, 12);
		ctx.moveTo(-6, 5);
		ctx.lineTo(6, 5);
		ctx.stroke();

		// Lantern bottom tray
		this.setupPath(ctx, "#1E293B", COLORS.ink, 2);
		ctx.fillRect(-7, 12, 14, 3);
		ctx.strokeRect(-7, 12, 14, 3);
		ctx.restore();

		// 6. Halberd carried in hand (Kovaná halapartna dle předlohy)
		// Shaft rests diagonally in arm / on shoulder
		ctx.save();
		const halberdAngle = -0.22 + Math.sin(time * walkFreq) * 0.05;
		ctx.rotate(halberdAngle);

		// Wooden shaft
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(11, 26);
		ctx.lineTo(19, -54);
		ctx.stroke();
		ctx.strokeStyle = "#8C582B";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(11, 26);
		ctx.lineTo(19, -54);
		ctx.stroke();
		// Shaft wood highlight
		ctx.strokeStyle = "#DFBA8A";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(11.5, 26);
		ctx.lineTo(18.5, -53);
		ctx.stroke();

		// Iron reinforcing collars on shaft
		this.setupPath(ctx, "#475569", COLORS.ink, 1.6);
		// Lower ring
		ctx.fillRect(11.5, 2, 4.5, 3.5);
		ctx.strokeRect(11.5, 2, 4.5, 3.5);
		// Upper socket ring
		ctx.fillRect(15.5, -34, 5, 4);
		ctx.strokeRect(15.5, -34, 5, 4);

		// Halberd Head (Forged iron spear + crescent axe with clover cutout + rear beak)
		ctx.save();
		ctx.translate(19, -54);
		ctx.rotate(0.18);

		// Steel blade silhouette
		this.setupPath(ctx, "#64748B", COLORS.ink, 2.2);
		ctx.beginPath();
		// Spear point tip
		ctx.moveTo(0, 0);
		ctx.lineTo(3, -22); // Sharp spear tip
		ctx.lineTo(1, -7);
		// Crescent axe blade
		ctx.quadraticCurveTo(8, -12, 15, -14); // Upper horn
		ctx.bezierCurveTo(14, -6, 12, 3, 6, 9); // Crescent cutting arc to lower horn
		ctx.quadraticCurveTo(2, 6, 0, 0);
		// Rear beak pick
		ctx.lineTo(-6, -1);
		ctx.lineTo(-8, -4);
		ctx.quadraticCurveTo(-4, -6, 0, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Blade cutting glint highlight
		ctx.strokeStyle = "#F1F5F9";
		ctx.lineWidth = 1.5;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(3, -21);
		ctx.lineTo(1, -7);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(14.5, -13);
		ctx.quadraticCurveTo(12, -2, 6, 8.5);
		ctx.stroke();

		// Four-leaf clover cutout (čtyřlístkový otvor) in the axe blade
		ctx.fillStyle = "#1E293B";
		ctx.beginPath();
		ctx.arc(8, -3, 1.3, 0, Math.PI * 2);
		ctx.arc(8, 0, 1.3, 0, Math.PI * 2);
		ctx.arc(6.5, -1.5, 1.3, 0, Math.PI * 2);
		ctx.arc(9.5, -1.5, 1.3, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
		ctx.restore();

		// 7. Arms and Hand gripping halberd
		this.drawBentLimb(ctx, 12, -6, 15, 6, 14, 10, "#334155", 7.5);
		// Hand mitten/glove
		this.setupPath(ctx, "#784A28", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(14, 10, 4.2, 4.2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 8. Head, Face & Features (flushed face, bushy mustache, determined eye)
		ctx.save();
		ctx.translate(0, -20 + headBob);

		// Head base (ruddy peasant skin)
		this.setupPath(ctx, "#FED7AA", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, 0, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Rosy flushed cheek
		ctx.fillStyle = "rgba(244, 63, 94, 0.45)";
		ctx.beginPath();
		ctx.arc(4, 2, 4.5, 0, Math.PI * 2);
		ctx.fill();

		// Cold red round nose
		this.setupPath(ctx, "#FB7185", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(7, 0, 3.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Bushy grey mustache (pořádný ponocenský knír dle Lada předlohy)
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(5, 2);
		ctx.quadraticCurveTo(11, 4, 15, 9);
		ctx.quadraticCurveTo(8, 9, 4, 5);
		ctx.quadraticCurveTo(0, 9, -7, 8);
		ctx.quadraticCurveTo(-3, 4, 5, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Determined eye & thick grey eyebrow
		// Eyebrow
		ctx.strokeStyle = "#64748B";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(3, -5);
		ctx.lineTo(8, -4);
		ctx.stroke();
		// Eye
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(5.5, -2, 1.8, 0, Math.PI * 2);
		ctx.fill();
		// Catchlight
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(6.2, -2.5, 0.6, 0, Math.PI * 2);
		ctx.fill();

		// Grey sideburn hair curling out
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(-8, 1, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 9. Black Felt Watchman Hat (Klobouk ponocného s mosazným odznakem)
		// Hat brim (široká krempa)
		this.setupPath(ctx, "#1E2229", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, -9, 18, 5.5, 0.05, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Hat crown (kulatá koruna klobouku)
		ctx.beginPath();
		ctx.moveTo(-11, -9);
		ctx.quadraticCurveTo(-12, -22, 0, -23);
		ctx.quadraticCurveTo(12, -22, 11, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Hat band
		ctx.strokeStyle = "#334155";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(-11, -11);
		ctx.quadraticCurveTo(0, -13, 11, -11);
		ctx.stroke();

		// Brass cockade badge on hat (Mosazný odznak ponocného)
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.arc(4, -13, 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FEF08A";
		ctx.beginPath();
		ctx.arc(3.5, -13.5, 0.9, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
		ctx.restore();
	},
	drawHeart(ctx, x, y, size, color) {
		ctx.save();
		ctx.fillStyle = color;
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		ctx.lineJoin = "round";
		ctx.beginPath();
		ctx.moveTo(x, y + size * .55);
		ctx.bezierCurveTo(x - size * 1.3, y - size * .2, x - size * .7, y - size * 1.1, x, y - size * .4);
		ctx.bezierCurveTo(x + size * .7, y - size * 1.1, x + size * 1.3, y - size * .2, x, y + size * .55);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	drawSexton(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > .1 || Math.abs(dy) > .1) && !fleeing;
		const bob = isMoving ? Math.abs(Math.sin(time * 14)) * 4 : Math.sin(time * 2.2) * 1;
		const legSwing = isMoving ? Math.sin(time * 14) * 13 : 0;
		const headBob = Math.sin(time * 3) * 1.2;
		const bellSwing = Math.sin(time * (isMoving ? 14 : 2.6)) * (isMoving ? .55 : .18);
		const keySway = Math.sin(time * (isMoving ? 14 : 2)) * 2;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -20);
		}
		this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, "#1C1A1A", 9);
		this.drawLimb(ctx, 5, 10, legSwing + 2, 30, "#1C1A1A", 9);
		ctx.translate(0, -bob);
		this.setupPath(ctx, "#2A2624", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-17, -4);
		ctx.quadraticCurveTo(-26, 16, -22, 28);
		ctx.lineTo(22, 28);
		ctx.quadraticCurveTo(26, 16, 17, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-9, -6);
		ctx.lineTo(0, 8);
		ctx.lineTo(9, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.mustard;
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.arc(0, 13 + i * 5, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(-13 + keySway * .3, 15, 4, 0, Math.PI * 2);
		ctx.stroke();
		ctx.strokeStyle = COLORS.mustard;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(-13 + keySway * .3, 15, 4, 0, Math.PI * 2);
		ctx.stroke();
		this.setupPath(ctx, COLORS.mustard, COLORS.ink, 1.5);
		ctx.fillRect(-16 + keySway, 19, 3, 9);
		ctx.strokeRect(-16 + keySway, 19, 3, 9);
		ctx.fillRect(-11 + keySway, 19, 3, 7);
		ctx.strokeRect(-11 + keySway, 19, 3, 7);
		ctx.save();
		ctx.translate(19, 2);
		ctx.rotate(bellSwing);
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, -4);
		ctx.lineTo(0, 5);
		ctx.stroke();
		this.setupPath(ctx, COLORS.mustard, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-9, 21);
		ctx.quadraticCurveTo(-9, 6, 0, 4);
		ctx.quadraticCurveTo(9, 6, 9, 21);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(-bellSwing * 6, 23, 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		ctx.translate(0, headBob);
		this.setupPath(ctx, COLORS.skin);
		ctx.beginPath();
		ctx.arc(0, -20, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#B9B4A6", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-9, -15);
		ctx.quadraticCurveTo(0, -9, 9, -15);
		ctx.quadraticCurveTo(0, -13, -9, -15);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(-4, -22, 1.6, 0, Math.PI * 2);
		ctx.arc(5, -22, 1.6, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#1F1B1A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, -29, 20, 5.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-11, -29);
		ctx.lineTo(-9, -43);
		ctx.lineTo(9, -43);
		ctx.lineTo(11, -29);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.mustard;
		ctx.fillRect(-10, -34, 20, 3);
		ctx.restore();
	},
	drawBarunka(ctx, x, y, time, moving, scale = 1) {
		const bob = moving ? Math.abs(Math.sin(time * 15)) * 3 : Math.sin(time * 2.6) * 1;
		const leg = moving ? Math.sin(time * 15) * 9 : 0;
		const braid = Math.sin(time * (moving ? 15 : 2.2)) * (moving ? 5 : 1.5);
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale, scale);
		this.drawLimb(ctx, -3, 8, -leg - 1, 22, COLORS.white, 6);
		this.drawLimb(ctx, 3, 8, leg + 1, 22, COLORS.white, 6);
		ctx.translate(0, -bob);
		this.setupPath(ctx, "#3A5A8C", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-11, -2);
		ctx.quadraticCurveTo(-17, 10, -13, 18);
		ctx.lineTo(13, 18);
		ctx.quadraticCurveTo(17, 10, 11, -2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F8F4E8", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-6, 0);
		ctx.lineTo(6, 0);
		ctx.lineTo(9, 18);
		ctx.lineTo(-9, 18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.parchment, COLORS.ink, 2.5);
		ctx.fillRect(-8, -9, 16, 10);
		ctx.strokeRect(-8, -9, 16, 10);
		this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-9, -9);
		ctx.lineTo(9, -9);
		ctx.lineTo(0, 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(-8, -15);
		ctx.quadraticCurveTo(-13 - braid, -8, -11 - braid, 0);
		ctx.moveTo(8, -15);
		ctx.quadraticCurveTo(13 + braid, -8, 11 + braid, 0);
		ctx.stroke();
		ctx.fillStyle = COLORS.red;
		ctx.beginPath();
		ctx.arc(-11 - braid, 1, 2.6, 0, Math.PI * 2);
		ctx.arc(11 + braid, 1, 2.6, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -16, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#7A4B22", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -18, 9.3, Math.PI * 1.05, Math.PI * 1.95);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(-3, -15, 1.3, 0, Math.PI * 2);
		ctx.arc(3, -15, 1.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(232, 106, 146, 0.55)";
		ctx.beginPath();
		ctx.arc(-6, -12, 2, 0, Math.PI * 2);
		ctx.arc(6, -12, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawGranny(ctx, x, y, time, dx, dy, fleeing = false, scale = 1, withBarunka = true) {
		const dir = dx < 0 ? -1 : 1;
		const isMoving = (Math.abs(dx) > .1 || Math.abs(dy) > .1) && !fleeing;
		if (withBarunka && !fleeing) this.drawBarunka(ctx, x - 34 * dir * scale, y + 9 * scale, time + .7, isMoving, scale * .85);
		const bob = isMoving ? Math.abs(Math.sin(time * 11)) * 3 : Math.sin(time * 2.2) * 1;
		const legSwing = isMoving ? Math.sin(time * 11) * 10 : 0;
		const headBob = Math.sin(time * 2.6) * 1;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);
		if (fleeing) {
			ctx.rotate(Math.PI / 2);
			ctx.translate(0, -20);
		}
		this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, "#4A3A2E", 8);
		this.drawLimb(ctx, 5, 10, legSwing + 2, 30, "#4A3A2E", 8);
		ctx.translate(0, -bob);
		this.setupPath(ctx, "#3F5E85", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-16, -4);
		ctx.quadraticCurveTo(-29, 14, -25, 28);
		ctx.lineTo(25, 28);
		ctx.quadraticCurveTo(29, 14, 16, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F8F4E8", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-10, 2);
		ctx.lineTo(10, 2);
		ctx.lineTo(15, 28);
		ctx.lineTo(-15, 28);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.red;
		ctx.lineWidth = 1.6;
		ctx.strokeRect(-6, 14, 12, 8);
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(19 + legSwing * .25, 28);
		ctx.lineTo(22, 0);
		ctx.stroke();
		const basketX = -22 - legSwing * .3;
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2.5);
		ctx.fillRect(basketX - 9, 7, 18, 11);
		ctx.strokeRect(basketX - 9, 7, 18, 11);
		this.setupPath(ctx, "#C98A3B", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(basketX, 6, 9, 5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(basketX - 4, 3);
		ctx.lineTo(basketX - 1, 8);
		ctx.moveTo(basketX + 1, 3);
		ctx.lineTo(basketX + 4, 8);
		ctx.stroke();
		ctx.translate(0, headBob);
		this.setupPath(ctx, "#F8F9FA", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -20, 15, Math.PI * .6, Math.PI * 1.85);
		ctx.quadraticCurveTo(9, -34, 13, -22);
		ctx.quadraticCurveTo(15, -13, 6, -7);
		ctx.quadraticCurveTo(-3, -5, -9, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F8F9FA", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(3, -7);
		ctx.lineTo(8, -2);
		ctx.lineTo(1, 2);
		ctx.lineTo(-2, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.red;
		[
			[-9, -26],
			[-3, -31],
			[-9, -18],
			[-4, -24],
			[-9, -11],
			[3, -33],
			[7, -29],
			[4, -1]
		].forEach(([px, py]) => {
			ctx.beginPath();
			ctx.arc(px, py, 1.7, 0, Math.PI * 2);
			ctx.fill();
		});
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(3, -19, 10, 11.5, .08, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#C8C4BD", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(2, -24, 7.5, Math.PI * 1.05, Math.PI * 1.85);
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(1.5, -20, 1.6, 0, Math.PI * 2);
		ctx.arc(7.5, -20, 1.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.white;
		ctx.beginPath();
		ctx.arc(2.1, -20.6, .7, 0, Math.PI * 2);
		ctx.arc(8.1, -20.6, .7, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#8C6F54";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(9.5, -20);
		ctx.lineTo(12, -21);
		ctx.moveTo(9.5, -19);
		ctx.lineTo(11.5, -18);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(6, -21);
		ctx.lineTo(9.5, -18);
		ctx.lineTo(7, -17);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(4.5, -14, 4.2, .15, Math.PI * .85);
		ctx.stroke();
		ctx.fillStyle = "rgba(230, 90, 90, 0.52)";
		ctx.beginPath();
		ctx.arc(1, -15, 2.8, 0, Math.PI * 2);
		ctx.arc(9, -15, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawBlessingFx(ctx, x, y, t, duration) {
		const k = Math.min(1, t / duration);
		const fade = 1 - k * k;
		const R = 650;
		ctx.save();
		const glowR = Math.max(30, R * Math.min(1, t / .5));
		const gg = ctx.createRadialGradient(x, y, 20, x, y, glowR);
		gg.addColorStop(0, `rgba(255, 250, 215, ${.28 * fade})`);
		gg.addColorStop(.7, `rgba(255, 236, 160, ${.12 * fade})`);
		gg.addColorStop(1, "rgba(255, 236, 160, 0)");
		ctx.fillStyle = gg;
		ctx.beginPath();
		ctx.arc(x, y, glowR, 0, Math.PI * 2);
		ctx.fill();
		const drop = Math.min(1, t / .25);
		const topY = y - 1200;
		const botY = topY + (y - topY) * drop;
		const pulse = 1 + Math.sin(t * 24) * .05;
		const widen = t < .25 ? .6 : 1;
		const shrink = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / (duration - 1.6)) : 1;
		const pw = 78 * pulse * widen * shrink;
		if (pw > 1) {
			const pg = ctx.createLinearGradient(x - pw, 0, x + pw, 0);
			pg.addColorStop(0, "rgba(255, 240, 170, 0)");
			pg.addColorStop(.25, "rgba(255, 244, 190, 0.28)");
			pg.addColorStop(.5, "rgba(255, 255, 240, 0.48)");
			pg.addColorStop(.75, "rgba(255, 244, 190, 0.28)");
			pg.addColorStop(1, "rgba(255, 240, 170, 0)");
			ctx.fillStyle = pg;
			ctx.fillRect(x - pw, topY, pw * 2, botY - topY);
			ctx.fillStyle = `rgba(255, 255, 255, ${.42 * shrink})`;
			ctx.fillRect(x - pw * .22, topY, pw * .44, botY - topY);
		}
		const pulses = [
			0,
			.95,
			1.8
		];
		const amps = [
			1,
			.6,
			.35
		];
		for (let i = 0; i < pulses.length; i++) {
			const pt = t - pulses[i];
			if (pt <= 0) continue;
			const rr = pt * 560;
			const al = Math.max(0, 1 - rr / R) * amps[i];
			if (al <= 0) continue;
			ctx.strokeStyle = `rgba(255, 236, 150, ${al})`;
			ctx.lineWidth = 10 * amps[i] + 2;
			ctx.beginPath();
			ctx.ellipse(x, y, rr, rr * .62, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeStyle = `rgba(255, 255, 255, ${al * .8})`;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.ellipse(x, y, rr * .96, rr * .62 * .96, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		for (let i = 0; i < 34; i++) {
			const a = i * 2.399;
			const rad = i * 53 % 100 / 100 * R * .9 * Math.min(1, t / .6);
			const px = x + Math.cos(a) * rad;
			const py = y + Math.sin(a) * rad * .62 - (t * 60 + i * 13) % 160;
			const sz = 3 + i % 3;
			ctx.fillStyle = `rgba(255, 246, 190, ${.85 * fade})`;
			ctx.beginPath();
			ctx.moveTo(px, py - sz * 2);
			ctx.lineTo(px + sz * .8, py);
			ctx.lineTo(px, py + sz * 2);
			ctx.lineTo(px - sz * .8, py);
			ctx.closePath();
			ctx.fill();
		}
		if (t < 2.2) {
			const decay = Math.max(0, 1 - t / 2.2);
			const sw = Math.sin(t * 16) * .35 * decay;
			ctx.save();
			ctx.translate(x, y - 150);
			ctx.rotate(sw);
			ctx.globalAlpha = Math.min(1, t / .15) * Math.min(1, (2.2 - t) / .4);
			ctx.strokeStyle = COLORS.woodDark;
			ctx.lineWidth = 6;
			ctx.beginPath();
			ctx.moveTo(0, -30);
			ctx.lineTo(0, -48);
			ctx.stroke();
			this.setupPath(ctx, COLORS.mustard, COLORS.ink, 4);
			ctx.beginPath();
			ctx.moveTo(-34, 30);
			ctx.quadraticCurveTo(-36, -14, -10, -30);
			ctx.lineTo(10, -30);
			ctx.quadraticCurveTo(36, -14, 34, 30);
			ctx.quadraticCurveTo(0, 38, -34, 30);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(-sw * 40, 40, 7, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		if (t < .9) {
			const sc = 1 + (.9 - t) * .6;
			ctx.save();
			ctx.translate(x, y - 240);
			ctx.scale(sc, sc);
			ctx.globalAlpha = Math.min(1, (.9 - t) / .4);
			ctx.font = "900 46px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 8;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("BÍÍM!", 0, 0);
			ctx.fillStyle = "#FDE047";
			ctx.fillText("BÍÍM!", 0, 0);
			ctx.restore();
		}
		ctx.restore();
	},
	drawGrannyScene(ctx, w, h, t, duration, applyAt) {
		const clamp01 = (v) => Math.max(0, Math.min(1, v));
		const ease = (v) => {
			const c = clamp01(v);
			return c * c * (3 - 2 * c);
		};
		const vis = Math.min(ease(t / .55), ease((duration - t) / .55));
		const t2 = Math.max(0, t - applyAt);
		ctx.save();
		ctx.fillStyle = `rgba(58, 38, 18, ${.5 * vis})`;
		ctx.fillRect(0, 0, w, h);
		const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .18, w / 2, h / 2, Math.max(w, h) * .72);
		vg.addColorStop(0, `rgba(255, 220, 150, ${.16 * vis})`);
		vg.addColorStop(1, `rgba(20, 10, 4, ${.62 * vis})`);
		ctx.fillStyle = vg;
		ctx.fillRect(0, 0, w, h);
		const bar = Math.round(h * .14 * vis);
		ctx.fillStyle = "#111111";
		ctx.fillRect(0, 0, w, bar);
		ctx.fillRect(0, h - bar, w, bar);
		ctx.fillStyle = COLORS.mustard;
		ctx.fillRect(0, bar - 3, w, 3);
		ctx.fillRect(0, h - bar, w, 3);
		if (vis > .05) {
			const ks = Math.max(.6, Math.min(1.1, h / 800));
			ctx.save();
			ctx.globalAlpha = vis;
			ctx.translate(w / 2, bar + 34 * ks);
			ctx.scale(ks, ks);
			this.setupPath(ctx, COLORS.parchment, COLORS.ink, 4);
			ctx.beginPath();
			ctx.arc(0, 0, 22, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2;
			for (let i = 0; i < 12; i++) {
				const a = i / 12 * Math.PI * 2;
				ctx.beginPath();
				ctx.moveTo(Math.cos(a) * 17, Math.sin(a) * 17);
				ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
				ctx.stroke();
			}
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, -15);
			ctx.moveTo(0, 0);
			ctx.lineTo(9, -8);
			ctx.stroke();
			ctx.fillStyle = COLORS.red;
			ctx.beginPath();
			ctx.arc(0, 0, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.font = "900 17px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 5;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("ČAS SE ZASTAVIL", 0, 46);
			ctx.fillStyle = "#FDE047";
			ctx.fillText("ČAS SE ZASTAVIL", 0, 46);
			ctx.restore();
		}
		const s = Math.max(.55, Math.min(1.5, (w - 30) / 800, (h - 2 * bar - 120) / 360));
		const pw = 380;
		const ph = 165;
		ctx.save();
		ctx.translate(w / 2, h / 2 + 34 * s);
		ctx.scale(s, s);
		ctx.globalAlpha = vis;
		const panelPath = () => {
			ctx.beginPath();
			ctx.moveTo(-364, -165);
			ctx.lineTo(364, -165);
			ctx.quadraticCurveTo(pw, -165, pw, -149);
			ctx.lineTo(pw, 149);
			ctx.quadraticCurveTo(pw, ph, 364, ph);
			ctx.lineTo(-364, ph);
			ctx.quadraticCurveTo(-380, ph, -380, 149);
			ctx.lineTo(-380, -149);
			ctx.quadraticCurveTo(-380, -165, -364, -165);
			ctx.closePath();
		};
		ctx.save();
		panelPath();
		ctx.clip();
		const sky = ctx.createLinearGradient(0, -165, 0, ph);
		sky.addColorStop(0, "#F3D9A4");
		sky.addColorStop(.55, "#F7E9C6");
		sky.addColorStop(1, "#CFE0A6");
		ctx.fillStyle = sky;
		ctx.fillRect(-380, -165, pw * 2, 330);
		this.setupPath(ctx, "#FFF3C4", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(250, -95, 32, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#A9C58A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-380, 60);
		ctx.quadraticCurveTo(-200, -10, -60, 55);
		ctx.quadraticCurveTo(80, -20, 220, 50);
		ctx.quadraticCurveTo(320, 10, pw, 60);
		ctx.lineTo(pw, ph);
		ctx.lineTo(-380, ph);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F8F4E8", COLORS.ink, 4);
		ctx.fillRect(-350, 5, 130, 90);
		ctx.strokeRect(-350, 5, 130, 90);
		this.setupPath(ctx, "#B8893A", COLORS.ink, 4);
		ctx.beginPath();
		ctx.moveTo(-364, 9);
		ctx.lineTo(-285, -58);
		ctx.lineTo(-206, 9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F8F4E8", COLORS.ink, 3);
		ctx.fillRect(-244, -50, 16, 34);
		ctx.strokeRect(-244, -50, 16, 34);
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
		ctx.fillRect(-268, 42, 34, 53);
		ctx.strokeRect(-268, 42, 34, 53);
		this.setupPath(ctx, "#FFD86B", COLORS.ink, 3);
		ctx.fillRect(-338, 30, 34, 28);
		ctx.strokeRect(-338, 30, 34, 28);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-321, 30);
		ctx.lineTo(-321, 58);
		ctx.moveTo(-338, 44);
		ctx.lineTo(-304, 44);
		ctx.stroke();
		ctx.strokeStyle = "rgba(120, 110, 100, 0.55)";
		ctx.lineWidth = 6;
		for (let i = 0; i < 3; i++) {
			const sy = -56 - i * 22 - t * 20 % 22;
			ctx.beginPath();
			ctx.moveTo(-236 + Math.sin(t * 2 + i) * 4, sy);
			ctx.quadraticCurveTo(-226 + Math.sin(t * 2 + i) * 6, sy - 10, -236, sy - 20);
			ctx.stroke();
		}
		this.setupPath(ctx, "#F3EFE4", COLORS.ink, 3);
		ctx.fillRect(292, -40, 16, 135);
		ctx.strokeRect(292, -40, 16, 135);
		ctx.fillStyle = COLORS.ink;
		[
			[295, -10],
			[301, 20],
			[296, 52]
		].forEach(([bx, by]) => ctx.fillRect(bx, by, 7, 3));
		this.setupPath(ctx, "#8FB56A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(300, -62, 42, 0, Math.PI * 2);
		ctx.arc(272, -40, 28, 0, Math.PI * 2);
		ctx.arc(330, -38, 28, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#8FB56A", COLORS.ink, 4);
		ctx.fillRect(-380, 95, pw * 2, 70);
		ctx.strokeRect(-380, 95, pw * 2, 70);
		ctx.fillStyle = "#D9C48F";
		ctx.beginPath();
		ctx.moveTo(-300, 95);
		ctx.lineTo(60, 95);
		ctx.lineTo(120, ph);
		ctx.lineTo(-380, ph);
		ctx.closePath();
		ctx.fill();
		const moving = t > .45 && t < 1.95;
		const gx = -300 + ease((t - .45) / 1.5) * 220;
		const bx = gx - 112;
		this.drawBarunka(ctx, bx, 38, t + .6, moving, 2.6);
		this.drawGranny(ctx, gx, 5, t, moving ? 1 : 0, 0, false, 3, false);
		if (t >= 1.9) {
			const offerK = ease((t - 1.9) / .6);
			ctx.save();
			ctx.globalAlpha = vis * offerK;
			ctx.translate(gx + 76 + offerK * 14, -10 + Math.sin(t * 3) * 1.5);
			this.setupPath(ctx, "#F8F4E8", COLORS.ink, 3);
			ctx.fillRect(-46, 6, 92, 14);
			ctx.strokeRect(-46, 6, 92, 14);
			ctx.fillStyle = COLORS.red;
			ctx.fillRect(-46, 9, 92, 3);
			ctx.fillRect(-46, 15, 92, 2);
			this.setupPath(ctx, "#C98A3B", COLORS.ink, 3);
			ctx.beginPath();
			ctx.ellipse(-12, -6, 27, 15, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = "#8A5A22";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(-24, -12);
			ctx.lineTo(-18, 0);
			ctx.moveTo(-12, -14);
			ctx.lineTo(-6, -1);
			ctx.moveTo(0, -12);
			ctx.lineTo(6, 0);
			ctx.stroke();
			this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
			ctx.beginPath();
			ctx.arc(30, 4, 12, 0, Math.PI);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(20, 4);
			ctx.quadraticCurveTo(30, -10, 40, 4);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		const bubble = (text, cx, cy, alpha, tailX, tailY) => {
			if (alpha <= .01) return;
			ctx.save();
			ctx.globalAlpha = vis * alpha;
			ctx.font = "900 21px Eczar, serif";
			const bw = ctx.measureText(text).width + 34;
			const bh = 44;
			ctx.fillStyle = "#FFFDF8";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 4;
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(tailX - 12, cy + bh / 2 - 1);
			ctx.lineTo(tailX, tailY);
			ctx.lineTo(tailX + 14, cy + bh / 2 - 1);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#FFFDF8";
			ctx.fillRect(tailX - 10, cy + bh / 2 - 4, 22, 6);
			ctx.fillStyle = COLORS.ink;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, cx, cy + 1);
			ctx.restore();
		};
		bubble("Pojďte, chudinky, dám vám chleba se solí…", gx + 20, -135, ease((t - 1.15) / .3) * ease((3.3 - t) / .3), gx + 8, -102);
		bubble("…a k tomu vlídné slovo!", bx - 20, -62, ease((t - 2.15) / .3) * ease((3.4 - t) / .3), bx, -30);
		if (t2 > 0) {
			const ax = gx + 60;
			const ay = -10;
			for (let i = 0; i < 3; i++) {
				const rr = (t2 - i * .22) * 520;
				if (rr <= 1) continue;
				const al = Math.max(0, 1 - rr / 900) * .6;
				const g = ctx.createRadialGradient(ax, ay, rr * .6, ax, ay, rr);
				g.addColorStop(0, "rgba(255, 200, 220, 0)");
				g.addColorStop(.85, `rgba(255, 224, 160, ${al})`);
				g.addColorStop(1, "rgba(255, 240, 200, 0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(ax, ay, rr, 0, Math.PI * 2);
				ctx.fill();
			}
			for (let i = 0; i < 26; i++) {
				const a = i * 2.399 + .5;
				const sp = 90 + i % 7 * 42;
				const px = ax + Math.cos(a) * sp * t2 * 1.6;
				const py = ay + Math.sin(a) * sp * t2 * 1.1 - t2 * 40 - Math.sin(t2 * 4 + i) * 6;
				ctx.globalAlpha = vis * Math.max(0, 1 - t2 / 2);
				if (i % 3 === 0) this.drawHeart(ctx, px, py, 7 + i % 4, i % 2 ? "#E86A92" : "#F4A6BF");
				else {
					ctx.fillStyle = i % 2 ? "#FFF3C4" : "#F8C6D4";
					ctx.strokeStyle = COLORS.ink;
					ctx.lineWidth = 1.2;
					ctx.beginPath();
					ctx.ellipse(px, py, 6, 3.2, a + t2 * 2, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				}
			}
			ctx.globalAlpha = vis;
		}
		ctx.restore();
		ctx.globalAlpha = vis;
		panelPath();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.stroke();
		panelPath();
		ctx.strokeStyle = COLORS.mustard;
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
		if (vis > .05) {
			ctx.save();
			ctx.globalAlpha = Math.min(1, vis * ease((t - .5) / .4));
			ctx.font = `900 ${Math.round(Math.max(20, Math.min(32, h / 24)))}px Eczar, serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineJoin = "round";
			ctx.lineWidth = 6;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("Chléb se solí a vlídné slovo", w / 2, h - bar / 2);
			ctx.fillStyle = "#FDE047";
			ctx.fillText("Chléb se solí a vlídné slovo", w / 2, h - bar / 2);
			ctx.restore();
		}
		if (t2 > 0) {
			const Rr = t2 * Math.hypot(w, h) * .85;
			const g = ctx.createRadialGradient(w / 2, h / 2, Math.max(0, Rr - 160), w / 2, h / 2, Rr + 40);
			g.addColorStop(0, "rgba(255, 214, 150, 0)");
			g.addColorStop(.7, `rgba(255, 226, 170, ${.34 * Math.max(0, 1 - t2 / 2)})`);
			g.addColorStop(1, "rgba(255, 255, 255, 0)");
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}
		ctx.restore();
	},
	drawFourLeafClover(ctx, x, y, size, angle = 0, color = "#3A7D34") {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.fillStyle = color;
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = Math.max(1, size * .15);
		ctx.lineJoin = "round";
		for (let i = 0; i < 4; i++) {
			ctx.save();
			ctx.rotate(i * Math.PI / 2);
			ctx.beginPath();
			const ps = size * .7;
			ctx.moveTo(0, 0);
			ctx.bezierCurveTo(-ps * .9, -ps * .4, -ps * .8, -ps * 1.2, 0, -ps * .8);
			ctx.bezierCurveTo(ps * .8, -ps * 1.2, ps * .9, -ps * .4, 0, 0);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(size * .3, size * .6, size * .4, size * 1.1);
		ctx.strokeStyle = "#233E2B";
		ctx.lineWidth = Math.max(1.2, size * .18);
		ctx.stroke();
		ctx.restore();
	},
	drawChamomile(ctx, x, y, size, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		const petals = 10;
		ctx.fillStyle = "#FFFDF8";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = Math.max(1, size * .12);
		ctx.lineJoin = "round";
		for (let i = 0; i < petals; i++) {
			const a = i / petals * Math.PI * 2;
			ctx.save();
			ctx.rotate(a);
			ctx.beginPath();
			ctx.ellipse(0, -size * .8, size * .22, size * .45, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
		this.setupPath(ctx, "#FBBF24", COLORS.ink, Math.max(1.5, size * .15));
		ctx.beginPath();
		ctx.arc(0, 0, size * .45, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#D97706";
		for (let i = 0; i < 5; i++) {
			const a = i * 1.25;
			const r = size * .22;
			ctx.beginPath();
			ctx.arc(Math.cos(a) * r, Math.sin(a) * r, size * .08, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawRosehip(ctx, x, y, size, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		this.setupPath(ctx, "#DC2626", COLORS.ink, Math.max(1.5, size * .16));
		ctx.beginPath();
		ctx.ellipse(0, 0, size * .55, size * .8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
		ctx.beginPath();
		ctx.ellipse(-size * .18, -size * .25, size * .14, size * .28, -.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#166534";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		for (let i = -2; i <= 2; i++) {
			ctx.beginPath();
			ctx.moveTo(0, -size * .75);
			ctx.lineTo(i * size * .22, -size * 1.25);
			ctx.lineTo(i * size * .1, -size * .75);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
	},
	drawDustPuff(ctx, x, y, radius, alpha = .7) {
		if (radius <= 2 || alpha <= .02) return;
		ctx.save();
		ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
		ctx.fillStyle = "#F3E9D2";
		ctx.strokeStyle = "rgba(40, 30, 20, 0.55)";
		ctx.lineWidth = Math.max(1.5, radius * .12);
		ctx.beginPath();
		ctx.arc(x, y, radius * .7, 0, Math.PI * 2);
		ctx.arc(x - radius * .4, y + radius * .1, radius * .5, 0, Math.PI * 2);
		ctx.arc(x + radius * .4, y + radius * .1, radius * .5, 0, Math.PI * 2);
		ctx.arc(x, y - radius * .35, radius * .5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	drawLadaSheep(ctx, x, y, time, legSwing, scale = 1, isRam = false, hasBell = true, colorVariant = 0, facing = 1) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * facing, scale);
		const woolColor = colorVariant === 1 ? "#F4EDE0" : colorVariant === 2 ? "#EBE4D5" : "#FFFDF7";
		const darkSkin = colorVariant === 2 ? "#3E342B" : "#231E1B";
		const tailWag = Math.sin(time * 24 + legSwing) * .4;
		ctx.save();
		ctx.translate(-22, 2);
		ctx.rotate(tailWag);
		this.setupPath(ctx, woolColor, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-6, 2, 7, 5, -.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		const l1 = Math.sin(time * 24 + legSwing) * 12;
		const l2 = Math.sin(time * 24 + legSwing + 1.6) * 12;
		const l3 = Math.sin(time * 24 + legSwing + 3.1) * 12;
		const l4 = Math.sin(time * 24 + legSwing + 4.7) * 12;
		this.drawLimb(ctx, -14, 10, -14 - l1, 24, darkSkin, 4.5);
		this.drawLimb(ctx, -6, 10, -6 + l2, 24, darkSkin, 4.5);
		this.drawLimb(ctx, 8, 10, 8 - l3, 24, darkSkin, 4.5);
		this.drawLimb(ctx, 16, 10, 16 + l4, 24, darkSkin, 4.5);
		ctx.fillStyle = COLORS.ink;
		[
			[-14 - l1, 24],
			[-6 + l2, 24],
			[8 - l3, 24],
			[16 + l4, 24]
		].forEach(([hx, hy]) => {
			ctx.fillRect(hx - 2.5, hy - 1, 5, 3.5);
		});
		this.setupPath(ctx, woolColor, COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(-13, 0, 14, 0, Math.PI * 2);
		ctx.arc(0, -6, 16, 0, Math.PI * 2);
		ctx.arc(14, -2, 14, 0, Math.PI * 2);
		ctx.arc(10, 8, 13, 0, Math.PI * 2);
		ctx.arc(-8, 9, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "rgba(120, 110, 95, 0.45)";
		ctx.lineWidth = 2;
		[
			[-7, -2],
			[5, -5],
			[-3, 6],
			[10, 4]
		].forEach(([cx, cy]) => {
			ctx.beginPath();
			ctx.arc(cx, cy, 4, .2, Math.PI * 1.2);
			ctx.stroke();
		});
		if (hasBell) {
			ctx.strokeStyle = "#D1342B";
			ctx.lineWidth = 3.5;
			ctx.beginPath();
			ctx.arc(15, 2, 7, 0, Math.PI);
			ctx.stroke();
			const bellAngle = Math.sin(time * 20 + legSwing) * .45;
			ctx.save();
			ctx.translate(15, 8);
			ctx.rotate(bellAngle);
			this.setupPath(ctx, "#FDE047", COLORS.ink, 2);
			ctx.beginPath();
			ctx.moveTo(-4, 0);
			ctx.lineTo(4, 0);
			ctx.lineTo(5, 7);
			ctx.lineTo(-5, 7);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(0, 8, 1.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		this.setupPath(ctx, darkSkin, COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(22, -6, 9, 12, .25, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#3E342B", COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.ellipse(27, -4, 4, 5, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(22, -9, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(23, -9, 1.5, 0, Math.PI * 2);
		ctx.fill();
		const earBounce = Math.sin(time * 24 + legSwing) * .35;
		ctx.save();
		ctx.translate(17, -12);
		ctx.rotate(earBounce);
		this.setupPath(ctx, darkSkin, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-6, 2, 8, 3.5, -.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		if (isRam) {
			this.setupPath(ctx, "#B8893A", COLORS.ink, 3.2);
			ctx.beginPath();
			ctx.arc(14, -14, 12, .5, Math.PI * 1.55, true);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(6, -20, 6, 0, Math.PI);
			ctx.stroke();
		}
		ctx.restore();
	},
	drawLadaDog(ctx, x, y, time, barking, scale = 1, facing = 1) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * facing, scale);
		const wag = Math.sin(time * 30) * .5;
		const bounce = Math.abs(Math.sin(time * 16)) * 4;
		ctx.translate(0, -bounce);
		ctx.save();
		ctx.translate(-18, -4);
		ctx.rotate(wag);
		this.setupPath(ctx, "#E6BA7E", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(-4, -10, 8, .4, Math.PI * 1.7);
		ctx.stroke();
		ctx.restore();
		this.drawLimb(ctx, -12, 10, -14, 24, "#E6BA7E", 5);
		this.drawLimb(ctx, -4, 10, -6, 24, "#8C5A35", 5);
		this.setupPath(ctx, "#F3E5C8", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-2, -2, 9, 6, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.drawLimb(ctx, 10, 6, 18, barking ? -2 : 8, "#F3E5C8", 5);
		this.drawLimb(ctx, 6, 8, 14, barking ? 2 : 12, "#8C5A35", 5);
		ctx.strokeStyle = "#D1342B";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(14, -4, 5, 0, Math.PI);
		ctx.stroke();
		this.setupPath(ctx, "#F3E5C8", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(18, -12, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#8C5A35";
		ctx.beginPath();
		ctx.arc(20, -14, 4.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(20, -14, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(21, -14, 1.4, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#F3E5C8", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(25, -9, 5, 4, .1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(28, -10, 2, 0, Math.PI * 2);
		ctx.fill();
		if (barking) {
			ctx.fillStyle = "#F472B6";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.ellipse(27, -5, 3, 5, .4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		const earFlap = Math.sin(time * 20) * .3;
		ctx.save();
		ctx.translate(13, -18);
		ctx.rotate(earFlap);
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-2, 6, 5, 9, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		ctx.restore();
	},
	drawShepherdScene(ctx, w, h, t, duration, applyAt) {
		const clamp01 = (v) => Math.max(0, Math.min(1, v));
		const ease = (v) => {
			const c = clamp01(v);
			return c * c * (3 - 2 * c);
		};
		const vis = Math.min(ease(t / .5), ease((duration - t) / .55));
		const t2 = Math.max(0, t - applyAt);
		ctx.save();
		ctx.fillStyle = `rgba(45, 55, 25, ${.45 * vis})`;
		ctx.fillRect(0, 0, w, h);
		const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .75);
		vg.addColorStop(0, `rgba(255, 235, 170, ${.18 * vis})`);
		vg.addColorStop(1, `rgba(25, 35, 15, ${.65 * vis})`);
		ctx.fillStyle = vg;
		ctx.fillRect(0, 0, w, h);
		const bar = Math.round(h * .14 * vis);
		ctx.fillStyle = "#181C14";
		ctx.fillRect(0, 0, w, bar);
		ctx.fillRect(0, h - bar, w, bar);
		ctx.fillStyle = COLORS.mustard;
		ctx.fillRect(0, bar - 3, w, 3);
		ctx.fillRect(0, h - bar, w, 3);
		if (vis > .05) {
			const ks = Math.max(.6, Math.min(1.1, h / 800));
			ctx.save();
			ctx.globalAlpha = vis;
			ctx.translate(w / 2, bar + 32 * ks);
			ctx.scale(ks, ks);
			const bellSway = Math.sin(t * 14) * .25;
			ctx.save();
			ctx.rotate(bellSway);
			this.setupPath(ctx, "#FDE047", COLORS.ink, 3);
			ctx.beginPath();
			ctx.moveTo(-16, 12);
			ctx.quadraticCurveTo(-18, -10, -6, -18);
			ctx.lineTo(6, -18);
			ctx.quadraticCurveTo(18, -10, 16, 12);
			ctx.quadraticCurveTo(0, 16, -16, 12);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(0, 16, 3.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
			ctx.font = "900 16px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 5;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("PASTÝŘSKÁ PÍŠŤALKA A DUSOT STÁDA", 0, 42);
			ctx.fillStyle = "#FEF08A";
			ctx.fillText("PASTÝŘSKÁ PÍŠŤALKA A DUSOT STÁDA", 0, 42);
			ctx.restore();
		}
		const s = Math.max(.55, Math.min(1.5, (w - 30) / 800, (h - 2 * bar - 110) / 360));
		const pw = 380;
		const ph = 165;
		ctx.save();
		ctx.translate(w / 2, h / 2 + 30 * s);
		ctx.scale(s, s);
		ctx.globalAlpha = vis;
		const panelPath = () => {
			ctx.beginPath();
			ctx.moveTo(-364, -165);
			ctx.lineTo(364, -165);
			ctx.quadraticCurveTo(pw, -165, pw, -149);
			ctx.lineTo(pw, 149);
			ctx.quadraticCurveTo(pw, ph, 364, ph);
			ctx.lineTo(-364, ph);
			ctx.quadraticCurveTo(-380, ph, -380, 149);
			ctx.lineTo(-380, -149);
			ctx.quadraticCurveTo(-380, -165, -364, -165);
			ctx.closePath();
		};
		ctx.save();
		panelPath();
		ctx.clip();
		const sky = ctx.createLinearGradient(0, -165, 0, ph);
		sky.addColorStop(0, "#BEE3F8");
		sky.addColorStop(.6, "#EBF8FF");
		sky.addColorStop(1, "#D9E8B5");
		ctx.fillStyle = sky;
		ctx.fillRect(-380, -165, pw * 2, 330);
		this.setupPath(ctx, "#FDE047", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(280, -90, 32, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		const drawCloud = (cx, cy, cscale) => {
			ctx.save();
			ctx.translate(cx, cy);
			ctx.scale(cscale, cscale);
			this.setupPath(ctx, "#FFFFFF", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(-22, 0, 16, 0, Math.PI * 2);
			ctx.arc(0, -8, 20, 0, Math.PI * 2);
			ctx.arc(24, 0, 17, 0, Math.PI * 2);
			ctx.arc(10, 10, 15, 0, Math.PI * 2);
			ctx.arc(-12, 10, 15, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		};
		drawCloud(-220 + Math.sin(t * .5) * 8, -95, .9);
		drawCloud(60 + Math.cos(t * .5) * 8, -105, .75);
		this.setupPath(ctx, "#8FB56A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-380, 45);
		ctx.quadraticCurveTo(-220, -15, -70, 40);
		ctx.quadraticCurveTo(80, -30, 240, 35);
		ctx.quadraticCurveTo(320, 15, pw, 45);
		ctx.lineTo(pw, ph);
		ctx.lineTo(-380, ph);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D9A036", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(-140, 25, 26, 32, 0, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(-140, -12);
		ctx.lineTo(-140, 25);
		ctx.stroke();
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 2.5);
		[
			-280,
			-180,
			-80,
			40,
			160,
			260
		].forEach((fx) => {
			ctx.fillRect(fx, 40, 7, 35);
			ctx.strokeRect(fx, 40, 7, 35);
		});
		ctx.beginPath();
		ctx.moveTo(-380, 52);
		ctx.lineTo(pw, 52);
		ctx.moveTo(-380, 66);
		ctx.lineTo(pw, 66);
		ctx.strokeStyle = "#5E3A21";
		ctx.lineWidth = 3.5;
		ctx.stroke();
		this.setupPath(ctx, "#4A633B", COLORS.ink, 4);
		ctx.fillRect(-380, 85, pw * 2, 80);
		ctx.strokeRect(-380, 85, pw * 2, 80);
		for (let i = 0; i < 9; i++) {
			const fx = -320 + i * 78 + i * 19 % 25;
			const fy = 100 + i % 3 * 18;
			if (i % 2 === 0) this.drawFourLeafClover(ctx, fx, fy, 8, i * .7);
			else this.drawChamomile(ctx, fx, fy, 7, i * .5);
		}
		this.drawShepherd(ctx, -240, 35, t, 1, 0, false, 2.4);
		this.drawLadaDog(ctx, -168, 59, t * 1.5, true, 1.8, 1);
		for (let i = 0; i < 4; i++) {
			const ntime = (t * 2.5 + i * .8) % 3;
			const nx = -216 + ntime * 30 + Math.sin(ntime * 3) * 8;
			const ny = -15 - ntime * 28;
			const nAlpha = Math.max(0, 1 - ntime / 2.8);
			ctx.save();
			ctx.globalAlpha = vis * nAlpha;
			drawGlyphText(ctx, "♫", nx, ny, { size: 18, color: "#FEF08A" });
			ctx.restore();
		}
		const flockMove = ease((t - .4) / 1.7);
		[
			{
				bx: -80,
				by: 42,
				isRam: true,
				hasBell: true,
				s: 2.2,
				v: 0
			},
			{
				bx: -10,
				by: 82,
				isRam: false,
				hasBell: true,
				s: 2,
				v: 1
			},
			{
				bx: 60,
				by: 32,
				isRam: false,
				hasBell: false,
				s: 1.8,
				v: 0
			},
			{
				bx: 130,
				by: 74,
				isRam: true,
				hasBell: true,
				s: 2.4,
				v: 2
			},
			{
				bx: 200,
				by: 48,
				isRam: false,
				hasBell: true,
				s: 1.9,
				v: 1
			}
		].forEach((sc, idx) => {
			const sx = sc.bx + flockMove * 120 + Math.sin(t * 6 + idx) * 10;
			const sy = sc.by + Math.abs(Math.sin(t * 18 + idx * 1.5)) * 8;
			this.drawLadaSheep(ctx, sx, sy, t * 1.3, idx * 1.2, sc.s, sc.isRam, sc.hasBell, sc.v, 1);
			this.drawDustPuff(ctx, sx - 25, sy + 30, 9 + idx % 3 * 3, .65);
		});
		const bubble = (text, cx, cy, alpha, tailX, tailY) => {
			if (alpha <= .01) return;
			ctx.save();
			ctx.globalAlpha = vis * alpha;
			ctx.font = "900 20px Eczar, serif";
			const bw = ctx.measureText(text).width + 30;
			const bh = 42;
			ctx.fillStyle = "#FFFDF8";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 4;
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(tailX - 10, cy + bh / 2 - 1);
			ctx.lineTo(tailX, tailY);
			ctx.lineTo(tailX + 12, cy + bh / 2 - 1);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#FFFDF8";
			ctx.fillRect(tailX - 8, cy + bh / 2 - 3, 18, 5);
			ctx.fillStyle = COLORS.ink;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, cx, cy + 1);
			ctx.restore();
		};
		bubble("Húúú-tůůů! Běžte, beránci, zažeňte ty mátohy!", -170, -110, ease((t - .7) / .3) * ease((3.2 - t) / .3), -230, -70);
		bubble("BÉÉÉ! DUSOT STÁDA!", 130, -75, ease((t - 1.4) / .3) * ease((3.3 - t) / .3), 110, 0);
		if (t2 > 0) {
			const ax = 80;
			const ay = 40;
			for (let i = 0; i < 3; i++) {
				const rr = (t2 - i * .22) * 580;
				if (rr <= 1) continue;
				const al = Math.max(0, 1 - rr / 950) * .65;
				const g = ctx.createRadialGradient(ax, ay, rr * .5, ax, ay, rr);
				g.addColorStop(0, "rgba(254, 240, 138, 0)");
				g.addColorStop(.85, `rgba(234, 179, 8, ${al})`);
				g.addColorStop(1, "rgba(254, 240, 138, 0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(ax, ay, rr, 0, Math.PI * 2);
				ctx.fill();
			}
			for (let i = 0; i < 30; i++) {
				const a = i * 2.399 + .4;
				const sp = 110 + i % 7 * 45;
				const px = ax + Math.cos(a) * sp * t2 * 1.5;
				const py = ay + Math.sin(a) * sp * t2 * 1.1 - t2 * 35;
				ctx.globalAlpha = vis * Math.max(0, 1 - t2 / 1.8);
				if (i % 3 === 0) this.drawFourLeafClover(ctx, px, py, 9 + i % 4, a + t2 * 3);
				else if (i % 3 === 1) this.drawChamomile(ctx, px, py, 8 + i % 3, a - t2 * 2);
				else {
					ctx.save();
					ctx.translate(px, py);
					ctx.rotate(Math.sin(t2 * 16 + i) * .5);
					this.setupPath(ctx, "#FDE047", COLORS.ink, 1.8);
					ctx.beginPath();
					ctx.moveTo(-5, 4);
					ctx.lineTo(5, 4);
					ctx.lineTo(4, -5);
					ctx.lineTo(-4, -5);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}
			}
			ctx.globalAlpha = vis;
		}
		ctx.restore();
		ctx.globalAlpha = vis;
		panelPath();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.stroke();
		panelPath();
		ctx.strokeStyle = COLORS.mustard;
		ctx.lineWidth = 2.5;
		ctx.stroke();
		ctx.restore();
		if (vis > .05) {
			ctx.save();
			ctx.globalAlpha = Math.min(1, vis * ease((t - .4) / .4));
			ctx.font = `900 ${Math.round(Math.max(20, Math.min(32, h / 24)))}px Eczar, serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineJoin = "round";
			ctx.lineWidth = 6;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("Dusot pastýřského stáda", w / 2, h - bar / 2);
			ctx.fillStyle = "#FEF08A";
			ctx.fillText("Dusot pastýřského stáda", w / 2, h - bar / 2);
			ctx.restore();
		}
		if (t2 > 0) {
			const Rr = t2 * Math.hypot(w, h) * .85;
			const g = ctx.createRadialGradient(w / 2, h / 2, Math.max(0, Rr - 180), w / 2, h / 2, Rr + 40);
			g.addColorStop(0, "rgba(254, 240, 138, 0)");
			g.addColorStop(.7, `rgba(234, 179, 8, ${.32 * Math.max(0, 1 - t2 / 1.8)})`);
			g.addColorStop(1, "rgba(255, 255, 255, 0)");
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}
		ctx.restore();
	},
	drawShepherdStampedeFx(ctx, stampede, dt, playerX, playerY) {
		if (!stampede) return;
		const t = stampede.t;
		const dur = stampede.dur;
		const fade = Math.max(0, 1 - t / dur);
		const dir = stampede.dirX >= 0 ? 1 : -1;
		ctx.save();
		const waveR = Math.min(580, t * 450);
		ctx.strokeStyle = `rgba(234, 179, 8, ${.45 * fade})`;
		ctx.lineWidth = 8;
		ctx.beginPath();
		ctx.ellipse(stampede.x, stampede.y, waveR, waveR * .6, 0, 0, Math.PI * 2);
		ctx.stroke();
		if (stampede.sheep && stampede.sheep.length > 0) stampede.sheep.forEach((sh, i) => {
			const prog = t * sh.speed + i * 45;
			const sx = stampede.x + dir * (prog - 280 + sh.offsetX * .4);
			const sy = stampede.y + sh.offsetY + Math.sin(t * 12 + i) * 20;
			this.drawDustPuff(ctx, sx - dir * 18, sy + 18, 12 * sh.scale, .55 * fade);
			this.drawLadaSheep(ctx, sx, sy, t + sh.bobPhase, i, sh.scale, sh.isRam, sh.hasBell, sh.colorVariant, dir);
			if (i % 4 === 0) {
				const ltx = sx - dir * 30 + Math.sin(t * 8 + i) * 15;
				const lty = sy - 15 - t * 40 % 60;
				this.drawFourLeafClover(ctx, ltx, lty, 9 * sh.scale, t * 5 + i);
			}
		});
		if (t < 2) {
			const bellFade = Math.max(0, 1 - t / 2);
			const sw = Math.sin(t * 22) * .4 * bellFade;
			ctx.save();
			ctx.translate(playerX, playerY - 110);
			ctx.rotate(sw);
			ctx.globalAlpha = bellFade;
			this.setupPath(ctx, "#FDE047", COLORS.ink, 4);
			ctx.beginPath();
			ctx.moveTo(-24, 20);
			ctx.quadraticCurveTo(-26, -14, -8, -24);
			ctx.lineTo(8, -24);
			ctx.quadraticCurveTo(26, -14, 24, 20);
			ctx.quadraticCurveTo(0, 26, -24, 20);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(0, 26, 4.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		if (t < .9) {
			const sc = 1 + (.9 - t) * .5;
			ctx.save();
			ctx.translate(playerX, playerY - 170);
			ctx.scale(sc, sc);
			ctx.globalAlpha = Math.min(1, (.9 - t) / .4);
			ctx.font = "900 38px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 7;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("CINKY-CINK! DUP!", 0, 0);
			ctx.fillStyle = "#FEF08A";
			ctx.fillText("CINKY-CINK! DUP!", 0, 0);
			ctx.restore();
		}
		ctx.restore();
	},
	drawSukoviceFx(ctx, sukovice, playerX, playerY) {
		if (!sukovice) return;
		const t = sukovice.t;
		const dur = sukovice.dur || 0.85;
		const k = Math.min(1, t / dur);
		const fade = Math.max(0, 1 - k * k);
		const sx = playerX ?? sukovice.x;
		const sy = playerY ?? sukovice.y;

		ctx.save();

		// 1. Vystrašení a děs ve větší vzdálenosti (široká zóna strachu)
		const outerR = Math.min(sukovice.outerRadius || 600, t * 1150);
		if (outerR > 15) {
			const outerFade = Math.max(0, 1 - t / dur);
			const fg = ctx.createRadialGradient(sx, sy, 40, sx, sy, outerR);
			fg.addColorStop(0, `rgba(245, 158, 11, ${0.16 * outerFade})`);
			fg.addColorStop(0.65, `rgba(217, 119, 6, ${0.07 * outerFade})`);
			fg.addColorStop(1, 'rgba(217, 119, 6, 0)');
			ctx.fillStyle = fg;
			ctx.beginPath();
			ctx.arc(sx, sy, outerR, 0, Math.PI * 2);
			ctx.fill();

			// Zvlněná okrajová vlna děsu a prachu
			ctx.strokeStyle = `rgba(217, 119, 6, ${0.6 * outerFade})`;
			ctx.lineWidth = 3.5;
			ctx.setLineDash([16, 12]);
			ctx.beginPath();
			ctx.ellipse(sx, sy, outerR, outerR * 0.65, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// 2. Vnitřní drtivý dopad a rázová vlna sukovice (odhození a poškození)
		const innerR = Math.min(sukovice.radius || 260, t * 680);
		ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 * fade})`;
		ctx.lineWidth = 7;
		ctx.beginPath();
		ctx.ellipse(sx, sy, innerR, innerR * 0.62, 0, 0, Math.PI * 2);
		ctx.stroke();

		ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * fade})`;
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.ellipse(sx, sy, innerR * 0.94, innerR * 0.62 * 0.94, 0, 0, Math.PI * 2);
		ctx.stroke();

		// 3. Větrné víry a rychlé šmouhy roztočené hole
		const totalRotations = 3.8;
		const currentAngle = k * Math.PI * 2 * totalRotations;

		for (let a = 0; a < 3; a++) {
			const arcAng = currentAngle - a * 0.52;
			const arcR = 115 + a * 26;
			ctx.strokeStyle = `rgba(253, 230, 138, ${0.68 * fade * (1 - a * 0.25)})`;
			ctx.lineWidth = 13 - a * 3;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(sx, sy, arcR, arcAng - 1.15, arcAng);
			ctx.stroke();

			ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * fade * (1 - a * 0.25)})`;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(sx, sy, arcR, arcAng - 0.85, arcAng);
			ctx.stroke();
		}

		// 4. Samotná Pověstná sukovice – poctivá dubová sukovitá hůl s velkými suky a okováním
		const ghostOffsets = [0.42, 0.2, 0];
		const ghostAlphas = [0.28 * fade, 0.55 * fade, 1 * fade];

		ghostOffsets.forEach((offset, idx) => {
			const ang = currentAngle - offset;
			const alpha = ghostAlphas[idx];
			if (alpha <= 0.01) return;

			ctx.save();
			ctx.translate(sx, sy);
			ctx.rotate(ang);
			ctx.globalAlpha = alpha;

			// Rukojeť omotaná kůží
			this.setupPath(ctx, '#A16207', COLORS.ink, 3.5);
			ctx.beginPath();
			ctx.rect(14, -5, 28, 10);
			ctx.fill();
			ctx.stroke();

			// Sukovité masivní tělo hole z tvrdého dubu s vyčnívajícími suky
			this.setupPath(ctx, '#78350F', COLORS.ink, 4);
			ctx.beginPath();
			ctx.moveTo(38, -5);
			// Suk 1 nahoře
			ctx.lineTo(62, -6);
			ctx.quadraticCurveTo(70, -14, 78, -7);
			// Suk 2 nahoře
			ctx.lineTo(96, -8);
			ctx.quadraticCurveTo(106, -17, 114, -9);
			// Hlava sukovice – těžká hrubá palice se suky
			ctx.lineTo(126, -13);
			ctx.quadraticCurveTo(140, -21, 152, -15);
			ctx.quadraticCurveTo(164, -7, 162, 4);
			ctx.quadraticCurveTo(160, 17, 146, 19);
			ctx.quadraticCurveTo(135, 19, 127, 11);
			// Suk 3 dole
			ctx.lineTo(108, 9);
			ctx.quadraticCurveTo(100, 17, 92, 8);
			// Suk 4 dole
			ctx.lineTo(70, 7);
			ctx.quadraticCurveTo(62, 14, 54, 6);
			ctx.lineTo(38, 5);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Kresba dřeva a kůry
			ctx.strokeStyle = '#B45309';
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(44, -1);
			ctx.lineTo(88, -2);
			ctx.moveTo(100, -1);
			ctx.lineTo(124, -2);
			ctx.stroke();

			// Suková očka (letokruhy v sucích)
			ctx.strokeStyle = COLORS.ink;
			ctx.fillStyle = '#451A03';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.ellipse(143, 0, 7, 5, 0.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(106, -8, 4, 3, 0.4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Kované hřeby a obruče na hlavě sukovice
			ctx.fillStyle = '#E5E7EB';
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1.5;
			[ [134, -15], [150, -17], [160, -3], [154, 13], [138, 14] ].forEach(([studX, studY]) => {
				ctx.beginPath();
				ctx.arc(studX, studY, 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			});

			ctx.restore();
		});

		// 5. Odlétající dubové třísky a obláčky prachu od mocného švihu
		for (let p = 0; p < 8; p++) {
			const pa = (currentAngle + p * (Math.PI / 4)) % (Math.PI * 2);
			const pr = 100 + ((p * 41) % 135);
			const px = sx + Math.cos(pa) * pr;
			const py = sy + Math.sin(pa) * (pr * 0.65);
			if (p % 2 === 0) {
				this.drawDustPuff(ctx, px, py, 14, 0.65 * fade);
			} else {
				ctx.save();
				ctx.translate(px, py);
				ctx.rotate(currentAngle * 2.2 + p);
				this.setupPath(ctx, '#92400E', COLORS.ink, 2);
				ctx.beginPath();
				ctx.moveTo(-6, -2);
				ctx.lineTo(8, -1);
				ctx.lineTo(3, 4);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			}
		}

		ctx.restore();
	},
	drawKorenarkaScene(ctx, w, h, t, duration, applyAt) {
		const clamp01 = (v) => Math.max(0, Math.min(1, v));
		const ease = (v) => {
			const c = clamp01(v);
			return c * c * (3 - 2 * c);
		};
		const vis = Math.min(ease(t / .5), ease((duration - t) / .55));
		const t2 = Math.max(0, t - applyAt);
		ctx.save();
		ctx.fillStyle = `rgba(18, 42, 22, ${.48 * vis})`;
		ctx.fillRect(0, 0, w, h);
		const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .18, w / 2, h / 2, Math.max(w, h) * .72);
		vg.addColorStop(0, `rgba(167, 243, 208, ${.2 * vis})`);
		vg.addColorStop(1, `rgba(10, 28, 14, ${.68 * vis})`);
		ctx.fillStyle = vg;
		ctx.fillRect(0, 0, w, h);
		const bar = Math.round(h * .14 * vis);
		ctx.fillStyle = "#0F1F12";
		ctx.fillRect(0, 0, w, bar);
		ctx.fillRect(0, h - bar, w, bar);
		ctx.fillStyle = "#4ADE80";
		ctx.fillRect(0, bar - 3, w, 3);
		ctx.fillRect(0, h - bar, w, 3);
		if (vis > .05) {
			const ks = Math.max(.6, Math.min(1.1, h / 800));
			ctx.save();
			ctx.globalAlpha = vis;
			ctx.translate(w / 2, bar + 32 * ks);
			ctx.scale(ks, ks);
			this.setupPath(ctx, "#27272A", COLORS.ink, 3);
			ctx.beginPath();
			ctx.arc(0, 4, 18, 0, Math.PI);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = "rgba(74, 222, 128, 0.75)";
			ctx.lineWidth = 3;
			for (let i = -1; i <= 1; i++) {
				const sy = -12 - (t * 25 + i * 8) % 20;
				ctx.beginPath();
				ctx.moveTo(i * 7, -2);
				ctx.quadraticCurveTo(i * 10 + Math.sin(t * 3 + i) * 6, sy, i * 6, sy - 10);
				ctx.stroke();
			}
			ctx.font = "900 16px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 5;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("OČISTNÉ KADIDLO Z DEVATERA BYLIN", 0, 42);
			ctx.fillStyle = "#86EFAC";
			ctx.fillText("OČISTNÉ KADIDLO Z DEVATERA BYLIN", 0, 42);
			ctx.restore();
		}
		const s = Math.max(.55, Math.min(1.5, (w - 30) / 800, (h - 2 * bar - 110) / 360));
		const pw = 380;
		const ph = 165;
		ctx.save();
		ctx.translate(w / 2, h / 2 + 30 * s);
		ctx.scale(s, s);
		ctx.globalAlpha = vis;
		const panelPath = () => {
			ctx.beginPath();
			ctx.moveTo(-364, -165);
			ctx.lineTo(364, -165);
			ctx.quadraticCurveTo(pw, -165, pw, -149);
			ctx.lineTo(pw, 149);
			ctx.quadraticCurveTo(pw, ph, 364, ph);
			ctx.lineTo(-364, ph);
			ctx.quadraticCurveTo(-380, ph, -380, 149);
			ctx.lineTo(-380, -149);
			ctx.quadraticCurveTo(-380, -165, -364, -165);
			ctx.closePath();
		};
		ctx.save();
		panelPath();
		ctx.clip();
		const sky = ctx.createLinearGradient(0, -165, 0, ph);
		sky.addColorStop(0, "#D1FAE5");
		sky.addColorStop(.55, "#E6F4EA");
		sky.addColorStop(1, "#A7D7A0");
		ctx.fillStyle = sky;
		ctx.fillRect(-380, -165, pw * 2, 330);
		const drawSpruce = (tx, ty, tscale) => {
			ctx.save();
			ctx.translate(tx, ty);
			ctx.scale(tscale, tscale);
			this.setupPath(ctx, "#14532D", COLORS.ink, 3);
			for (let i = 0; i < 4; i++) {
				ctx.beginPath();
				ctx.moveTo(0, -90 + i * 22);
				ctx.lineTo(-35 - i * 8, -50 + i * 26);
				ctx.lineTo(35 + i * 8, -50 + i * 26);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
			ctx.restore();
		};
		drawSpruce(220, 20, .9);
		drawSpruce(290, 10, .8);
		drawSpruce(340, 25, .95);
		this.setupPath(ctx, "#EAE0D0", COLORS.ink, 4);
		ctx.fillRect(-350, 0, 150, 95);
		ctx.strokeRect(-350, 0, 150, 95);
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 4);
		ctx.beginPath();
		ctx.moveTo(-365, 5);
		ctx.lineTo(-275, -65);
		ctx.lineTo(-185, 5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#5E3A21", COLORS.ink, 3);
		ctx.fillRect(-340, 20, 130, 8);
		ctx.strokeRect(-340, 20, 130, 8);
		[
			-320,
			-290,
			-260,
			-230
		].forEach((bx, idx) => {
			ctx.strokeStyle = "#3D2210";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(bx, 28);
			ctx.lineTo(bx, 36);
			ctx.stroke();
			if (idx === 0) this.drawChamomile(ctx, bx, 44, 10, .4);
			else if (idx === 1) this.drawFourLeafClover(ctx, bx, 44, 11, .2);
			else if (idx === 2) this.drawRosehip(ctx, bx, 46, 9, .1);
			else this.drawChamomile(ctx, bx, 44, 9, -.3);
		});
		this.setupPath(ctx, "#2E5A27", COLORS.ink, 4);
		ctx.fillRect(-380, 85, pw * 2, 80);
		ctx.strokeRect(-380, 85, pw * 2, 80);
		ctx.save();
		ctx.translate(160, 70);
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 3);
		ctx.fillRect(-18, 0, 36, 30);
		ctx.strokeRect(-18, 0, 36, 30);
		this.setupPath(ctx, "#18181B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, -8, 14, 10, 0, 0, Math.PI * 2);
		ctx.arc(8, -18, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(4, -24);
		ctx.lineTo(7, -32);
		ctx.lineTo(10, -24);
		ctx.moveTo(11, -24);
		ctx.lineTo(14, -31);
		ctx.lineTo(16, -23);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FACC15";
		ctx.beginPath();
		ctx.arc(9, -19, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		const kx = -30;
		const ky = 70;
		this.setupPath(ctx, "#F97316", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(-40, 84, 8 + Math.sin(t * 12) * 2, 0, Math.PI * 2);
		ctx.arc(-20, 84, 9 + Math.cos(t * 14) * 2, 0, Math.PI * 2);
		ctx.arc(kx, 80, 11 + Math.sin(t * 16) * 3, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#18181B", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(kx, ky, 24, 0, Math.PI);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#27272A", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(kx, ky, 26, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#4ADE80";
		ctx.beginPath();
		ctx.ellipse(kx, ky, 22, 5, 0, 0, Math.PI * 2);
		ctx.fill();
		this.drawKorenarka(ctx, -120, 35, t, 1, 0, false, 2.4);
		ctx.save();
		ctx.translate(-85, 43);
		this.setupPath(ctx, "#8C5A35", COLORS.ink, 2);
		ctx.fillRect(-4, -14, 8, 22);
		ctx.strokeRect(-4, -14, 8, 22);
		ctx.fillStyle = "#DC2626";
		ctx.beginPath();
		ctx.arc(0, -14, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		for (let i = 0; i < 6; i++) {
			const smt = (t * 1.5 + i * .6) % 2.5;
			const smx = kx + Math.sin(smt * 4 + i) * 20 + i * 6;
			const smy = 60 - smt * 45;
			const smr = 10 + smt * 16;
			const smAlpha = Math.max(0, 1 - smt / 2.3) * .6;
			ctx.save();
			ctx.globalAlpha = vis * smAlpha;
			ctx.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.7)" : "rgba(253, 224, 71, 0.65)";
			ctx.beginPath();
			ctx.arc(smx, smy, smr, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		const bubble = (text, cx, cy, alpha, tailX, tailY) => {
			if (alpha <= .01) return;
			ctx.save();
			ctx.globalAlpha = vis * alpha;
			ctx.font = "900 20px Eczar, serif";
			const bw = ctx.measureText(text).width + 30;
			const bh = 42;
			ctx.fillStyle = "#FFFDF8";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 4;
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.rect(cx - bw / 2, cy - bh / 2, bw, bh);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(tailX - 10, cy + bh / 2 - 1);
			ctx.lineTo(tailX, tailY);
			ctx.lineTo(tailX + 12, cy + bh / 2 - 1);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#FFFDF8";
			ctx.fillRect(tailX - 8, cy + bh / 2 - 3, 18, 5);
			ctx.fillStyle = COLORS.ink;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, cx, cy + 1);
			ctx.restore();
		};
		bubble("Devatero bylin z hvozdu vyžene všechno zlé!", -30, -110, ease((t - .7) / .3) * ease((3.2 - t) / .3), -100, -70);
		bubble("KLOK-KLOK! OČISTNÝ DÝM!", 50, -65, ease((t - 1.4) / .3) * ease((3.3 - t) / .3), kx, 20);
		if (t2 > 0) {
			const ax = kx;
			const ay = 60;
			for (let i = 0; i < 3; i++) {
				const rr = (t2 - i * .22) * 560;
				if (rr <= 1) continue;
				const al = Math.max(0, 1 - rr / 920) * .65;
				const g = ctx.createRadialGradient(ax, ay, rr * .5, ax, ay, rr);
				g.addColorStop(0, "rgba(167, 243, 208, 0)");
				g.addColorStop(.85, `rgba(74, 222, 128, ${al})`);
				g.addColorStop(1, "rgba(167, 243, 208, 0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(ax, ay, rr, 0, Math.PI * 2);
				ctx.fill();
			}
			for (let i = 0; i < 32; i++) {
				const a = i * 2.399 + .5;
				const sp = 95 + i % 7 * 44;
				const px = ax + Math.cos(a) * sp * t2 * 1.5;
				const py = ay + Math.sin(a) * sp * t2 * 1.1 - t2 * 35;
				ctx.globalAlpha = vis * Math.max(0, 1 - t2 / 1.8);
				if (i % 4 === 0) this.drawChamomile(ctx, px, py, 9 + i % 3, a + t2 * 2);
				else if (i % 4 === 1) this.drawFourLeafClover(ctx, px, py, 9 + i % 4, a - t2 * 3);
				else if (i % 4 === 2) this.drawRosehip(ctx, px, py, 8 + i % 3, a);
				else {
					ctx.save();
					ctx.translate(px, py);
					ctx.rotate(a + t2 * 4);
					this.setupPath(ctx, "#16A34A", COLORS.ink, 1.5);
					ctx.beginPath();
					ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}
			}
			ctx.globalAlpha = vis;
		}
		ctx.restore();
		ctx.globalAlpha = vis;
		panelPath();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.stroke();
		panelPath();
		ctx.strokeStyle = "#4ADE80";
		ctx.lineWidth = 2.5;
		ctx.stroke();
		ctx.restore();
		if (vis > .05) {
			ctx.save();
			ctx.globalAlpha = Math.min(1, vis * ease((t - .4) / .4));
			ctx.font = `900 ${Math.round(Math.max(20, Math.min(32, h / 24)))}px Eczar, serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineJoin = "round";
			ctx.lineWidth = 6;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("Očistné kadidlo z devatera bylin", w / 2, h - bar / 2);
			ctx.fillStyle = "#86EFAC";
			ctx.fillText("Očistné kadidlo z devatera bylin", w / 2, h - bar / 2);
			ctx.restore();
		}
		if (t2 > 0) {
			const Rr = t2 * Math.hypot(w, h) * .85;
			const g = ctx.createRadialGradient(w / 2, h / 2, Math.max(0, Rr - 180), w / 2, h / 2, Rr + 40);
			g.addColorStop(0, "rgba(167, 243, 208, 0)");
			g.addColorStop(.7, `rgba(74, 222, 128, ${.32 * Math.max(0, 1 - t2 / 1.8)})`);
			g.addColorStop(1, "rgba(255, 255, 255, 0)");
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}
		ctx.restore();
	},
	drawKorenarkaSanctuaryFx(ctx, sanctuary, dt, playerX, playerY) {
		if (!sanctuary) return;
		const t = sanctuary.t;
		const dur = sanctuary.dur;
		const fade = Math.max(0, 1 - t / dur);
		const R = 420;
		ctx.save();
		const curR = R * (1 + Math.sin(t * 8) * .04);
		const bgGlow = ctx.createRadialGradient(sanctuary.x, sanctuary.y, 20, sanctuary.x, sanctuary.y, curR);
		bgGlow.addColorStop(0, `rgba(167, 243, 208, ${.24 * fade})`);
		bgGlow.addColorStop(.7, `rgba(74, 222, 128, ${.11 * fade})`);
		bgGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
		ctx.fillStyle = bgGlow;
		ctx.beginPath();
		ctx.arc(sanctuary.x, sanctuary.y, curR, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = `rgba(34, 197, 94, ${.65 * fade})`;
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(sanctuary.x, sanctuary.y, curR * .95, 0, Math.PI * 2);
		ctx.stroke();
		const leafCount = 14;
		for (let i = 0; i < leafCount; i++) {
			const a = i / leafCount * Math.PI * 2 + t * .8;
			const lx = sanctuary.x + Math.cos(a) * curR * .95;
			const ly = sanctuary.y + Math.sin(a) * curR * .95;
			if (i % 2 === 0) this.drawFourLeafClover(ctx, lx, ly, 10, a + Math.PI / 2);
			else this.drawChamomile(ctx, lx, ly, 9, a);
		}
		this.setupPath(ctx, "#18181B", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(sanctuary.x, sanctuary.y, 16, 0, Math.PI);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#4ADE80";
		ctx.beginPath();
		ctx.ellipse(sanctuary.x, sanctuary.y, 14, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		for (let i = 0; i < 7; i++) {
			const spAng = t * 2.2 + i * Math.PI * 2 / 7;
			const spDist = 30 + (t * 80 + i * 50) % (R * .85);
			const spx = sanctuary.x + Math.cos(spAng) * spDist;
			const spy = sanctuary.y + Math.sin(spAng) * spDist * .75;
			const spr = 14 + spDist / R * 26;
			const spAl = Math.max(0, 1 - spDist / R) * .28 * fade;
			ctx.save();
			ctx.globalAlpha = spAl;
			ctx.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.65)" : "rgba(253, 224, 71, 0.6)";
			ctx.beginPath();
			ctx.arc(spx, spy, spr, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		for (let i = 0; i < 24; i++) {
			const a = i * 2.399 + t * .6;
			const dist = i * 41 % 100 / 100 * curR * .85;
			const fx = sanctuary.x + Math.cos(a) * dist;
			const fy = sanctuary.y + Math.sin(a) * dist * .75 - (t * 40 + i * 15) % 80;
			ctx.save();
			ctx.globalAlpha = .85 * fade;
			if (i % 3 === 0) this.drawChamomile(ctx, fx, fy, 8, a);
			else if (i % 3 === 1) this.drawFourLeafClover(ctx, fx, fy, 8, a);
			else this.drawRosehip(ctx, fx, fy, 7, a);
			ctx.restore();
		}
		if (t < .9) {
			const sc = 1 + (.9 - t) * .5;
			ctx.save();
			ctx.translate(sanctuary.x, sanctuary.y - 80);
			ctx.scale(sc, sc);
			ctx.globalAlpha = Math.min(1, (.9 - t) / .4);
			drawGlyphText(ctx, "OČISTNÉ KADIDLO! 🌿", 0, 0, { size: 26, color: "#86EFAC" });
			ctx.restore();
		}
		ctx.restore();
	},
	drawRarach(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const bounce = Math.sin(time * (panicked ? 24 : 12)) * (panicked ? 5 : 4);
		const tailWave = Math.cos(time * (panicked ? 40 : 20)) * (panicked ? 20 : 12);
		ctx.save();
		ctx.translate(x, y + bounce);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 22, time);
			this.drawPanicDrops(ctx, 0, -12, time);
		}
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -4, 8, 16);
			const leg2 = this.getRunLegCycle(legPhase + .5, 4, 8, 16);
			this.drawBentLimb(ctx, -4, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#B91C1C", 3.5);
			this.drawBentLimb(ctx, 4, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#B91C1C", 3.5);
			ctx.fillStyle = COLORS.ink;
			ctx.fillRect(leg1.fx - 2, leg1.fy - 1, 4, 3);
			ctx.fillRect(leg2.fx - 2, leg2.fy - 1, 4, 3);
		} else {
			const legSwing = Math.sin(time * 12) * 8;
			this.drawLimb(ctx, -4, 8, -4 - legSwing, 22, "#B91C1C", 3.5);
			this.drawLimb(ctx, 4, 8, 4 + legSwing, 22, "#B91C1C", 3.5);
		}
		this.setupPath(ctx, "#333");
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(-18, -tailWave, -28, -6 + (panicked ? Math.sin(time * 25) * 8 : -4));
		ctx.lineTo(-10, 5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.red);
		ctx.beginPath();
		ctx.ellipse(0, 5, 8, 12, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			const armWave1 = Math.sin(time * 28) * 8;
			const armWave2 = Math.cos(time * 28) * 8;
			this.drawLimb(ctx, -5, 2, -12, -14 + armWave1, "#B91C1C", 3);
			this.drawLimb(ctx, 5, 2, 10, -15 + armWave2, "#B91C1C", 3);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Claws cocked back near ears, ready to snap
				this.drawBentLimb(ctx, -5, 2, -12, -8, -16, -16, "#B91C1C", 3.2);
				this.drawBentLimb(ctx, 5, 2, 12, -8, 16, -16, "#B91C1C", 3.2);
			} else {
				// Furious forward claw strike
				this.drawBentLimb(ctx, -5, 2, 6, 2, 18, 4, "#B91C1C", 3.5);
				this.drawBentLimb(ctx, 5, 2, 10, -2, 22, -1, "#B91C1C", 3.5);
			}
		} else {
			this.drawLimb(ctx, -5, 4, -9, 10, "#B91C1C", 3);
			this.drawLimb(ctx, 5, 4, 9, 10, "#B91C1C", 3);
		}
		ctx.beginPath();
		ctx.arc(0, -6, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.bone);
		ctx.beginPath();
		ctx.moveTo(-6, -15);
		ctx.quadraticCurveTo(-12, -22, -18, -18);
		ctx.lineTo(-10, -12);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(6, -15);
		ctx.quadraticCurveTo(12, -22, 18, -18);
		ctx.lineTo(10, -12);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		const eyeX = glanceBack ? -4 : 5;
		ctx.fillStyle = COLORS.mustard;
		ctx.beginPath();
		ctx.arc(eyeX, -8, panicked ? 4 : 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(eyeX + (glanceBack ? -1 : 1), -8, 1.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawSkeleton(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = panicked ? Math.abs(Math.sin(time * 22)) * 3 : Math.sin(time * 10) * 1.5;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 25, time);
			this.drawPanicDrops(ctx, 0, -28, time);
		}
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -4, 5, 21);
			const leg2 = this.getRunLegCycle(legPhase + .5, 4, 5, 21);
			this.drawBentLimb(ctx, -4, 5, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.bone, 4);
			this.drawBentLimb(ctx, 4, 5, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.bone, 4);
		} else {
			const legSwing = Math.sin(time * 10) * 12;
			this.drawLimb(ctx, -4, 5, -legSwing, 25, COLORS.bone, 4);
			this.drawLimb(ctx, 4, 5, legSwing, 25, COLORS.bone, 4);
		}
		this.drawLimb(ctx, 0, -15, 0, 5, COLORS.bone, 6);
		this.setupPath(ctx, "transparent", COLORS.bone, 4);
		for (let i = 0; i < 4; i++) {
			ctx.beginPath();
			ctx.moveTo(0, -12 + i * 5);
			ctx.quadraticCurveTo(12, -14 + i * 5, 10, -5 + i * 5);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, -12 + i * 5);
			ctx.quadraticCurveTo(-12, -14 + i * 5, -10, -5 + i * 5);
			ctx.stroke();
		}
		if (panicked) {
			const boneShudder = Math.sin(time * 30) * 4;
			this.drawBentLimb(ctx, -6, -12, -12, -22 + boneShudder, -16, -32 + boneShudder, COLORS.bone, 3.5);
			this.drawBentLimb(ctx, 6, -12, 12, -24 - boneShudder, 14, -34 - boneShudder, COLORS.bone, 3.5);
		} else {
			const armSwing = Math.sin(time * 10) * 8;
			this.drawLimb(ctx, -6, -12, -10 - armSwing, 2, COLORS.bone, 3.5);
			this.drawLimb(ctx, 6, -12, 10 + armSwing, 2, COLORS.bone, 3.5);
		}
		this.setupPath(ctx, COLORS.bone);
		ctx.beginPath();
		ctx.arc(0, -24, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		const jawY = panicked ? -14 : -16;
		ctx.rect(-6, jawY, 12, panicked ? 8 : 6);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 4, -26, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(glanceBack ? -9 : -3, -26, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawBubak(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const bob = Math.sin(time * (panicked ? 18 : 5)) * (panicked ? 6 : 5);
		const tilt = panicked ? .12 + Math.sin(time * 14) * .05 : Math.cos(time * 10) * .1;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(tilt);
		if (panicked) {
			this.drawRunDust(ctx, -12, 26, time);
			this.drawPanicDrops(ctx, 0, -24, time);
		}
		this.setupPath(ctx, COLORS.ink, "transparent");
		ctx.beginPath();
		for (let i = 0; i < 8; i++) {
			const a = i / 8 * Math.PI * 2 + time * (panicked ? 4 : 1);
			const r = 28 + Math.sin(time * 6 + i * 2) * 6;
			const stretchX = panicked ? Math.cos(a) * 16 - (Math.cos(a) < 0 ? 10 : 0) : Math.cos(a) * 12;
			ctx.arc(stretchX, Math.sin(a) * 12, r, 0, Math.PI * 2);
		}
		ctx.fill();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 8;
		ctx.lineCap = "round";
		for (let i = 0; i < 4; i++) {
			const cx = panicked ? -20 - i * 8 + Math.sin(time * 24 + i) * 6 : Math.cos(time * 3 + i) * 20;
			const cy = panicked ? 15 + Math.sin(time * 24 + i * 1.5) * 12 : 20 + Math.abs(Math.sin(time * 4 + i) * 15);
			ctx.beginPath();
			ctx.moveTo(i * 8 - 12, 10);
			ctx.quadraticCurveTo(cx, cy, cx - 10, cy + (panicked ? -4 : 10));
			ctx.stroke();
		}
		const eyeColor = (attackInfo && attackInfo.isActive) ? "#EF4444" : (panicked ? "#FDE047" : COLORS.mustard);
		const lookX = panicked ? -10 : vx < 0 ? -8 : 8;
		const ew = panicked ? 6 : 5;
		const eh = panicked ? 9 : 8;
		// Soft glow behind eyes instead of costly shadowBlur
		ctx.fillStyle = (attackInfo && attackInfo.isActive) ? "rgba(239, 68, 68, 0.40)" : (panicked ? "rgba(253, 224, 71, 0.40)" : "rgba(245, 158, 11, 0.35)");
		ctx.beginPath();
		ctx.ellipse(lookX - 6, -12, ew + 3, eh + 3, 0, 0, Math.PI * 2);
		ctx.ellipse(lookX + 6, -12, ew + 3, eh + 3, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = eyeColor;
		ctx.beginPath();
		ctx.ellipse(lookX - 6, -12, ew, eh, 0, 0, Math.PI * 2);
		ctx.ellipse(lookX + 6, -12, ew, eh, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(lookX - 7, -12, 2, 0, Math.PI * 2);
		ctx.arc(lookX + 5, -12, 2, 0, Math.PI * 2);
		ctx.fill();
		if (attackInfo && attackInfo.isActive && attackInfo.isStrike) {
			// Jagged shadow mouth on strike impact
			ctx.fillStyle = "#FEF08A";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(lookX - 9, 3);
			ctx.lineTo(lookX - 5, 8);
			ctx.lineTo(lookX - 1, 3);
			ctx.lineTo(lookX + 3, 8);
			ctx.lineTo(lookX + 7, 3);
			ctx.lineTo(lookX + 3, 11);
			ctx.lineTo(lookX - 3, 11);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
	},
	drawHastrman(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const bob = panicked ? Math.abs(Math.sin(time * 22)) * 4 : Math.sin(time * 12) * 2;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 25, time);
			this.drawPanicDrops(ctx, 4, -40, time);
		}
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -5, 8, 20);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 8, 20);
			this.drawBentLimb(ctx, -5, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.green, 6);
			this.drawBentLimb(ctx, 5, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.green, 6);
			this.setupPath(ctx, "#DC2626");
			ctx.beginPath();
			ctx.arc(leg1.fx, leg1.fy, 4.5, 0, Math.PI * 2);
			ctx.arc(leg2.fx, leg2.fy, 4.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		} else {
			const legSwing = Math.sin(time * 12) * 12;
			this.drawLimb(ctx, -5, 10, -legSwing - 5, 25, COLORS.green, 6);
			this.drawLimb(ctx, 5, 10, legSwing + 5, 25, COLORS.green, 6);
		}
		this.setupPath(ctx, COLORS.water);
		ctx.beginPath();
		ctx.moveTo(-15, -5);
		const tailFlap = panicked ? Math.sin(time * 26) * 10 : 0;
		ctx.lineTo(panicked ? -34 : -25, 16 + tailFlap);
		ctx.lineTo(-5, 20);
		ctx.lineTo(5, -5);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#3A76A8");
		ctx.beginPath();
		ctx.ellipse(0, 5, 12, 16, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			this.drawBentLimb(ctx, -8, -4, -14, -20, -6, -34, "#3A76A8", 5);
			const armWave = Math.sin(time * 26) * 10;
			this.drawLimb(ctx, 8, -4, -16, 12 + armWave, "#3A76A8", 5);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Willow whip cocked high behind hat with water droplets
				this.drawBentLimb(ctx, -8, -4, -14, -8, -16, -18, "#3A76A8", 5);
				this.drawBentLimb(ctx, 8, -4, 16, -16, 22, -30, "#3A76A8", 5);
				ctx.strokeStyle = "#166534";
				ctx.lineWidth = 3.2;
				ctx.beginPath();
				ctx.moveTo(22, -30);
				ctx.quadraticCurveTo(34, -40, 36, -20);
				ctx.stroke();
				ctx.fillStyle = "#38BDF8";
				ctx.beginPath();
				ctx.arc(36, -18, 2.8, 0, Math.PI * 2);
				ctx.arc(30, -28, 2, 0, Math.PI * 2);
				ctx.fill();
			} else {
				// Furious willow whip lash forward with water splashes
				this.drawBentLimb(ctx, -8, -4, -12, 8, "#3A76A8", 5);
				this.drawBentLimb(ctx, 8, -4, 20, 2, 28, 8, "#3A76A8", 5);
				ctx.strokeStyle = "#166534";
				ctx.lineWidth = 3.5;
				ctx.beginPath();
				ctx.moveTo(28, 8);
				ctx.quadraticCurveTo(42, 4, 48, 18);
				ctx.stroke();
				ctx.fillStyle = "#38BDF8";
				ctx.beginPath();
				ctx.arc(48, 20, 3.2, 0, Math.PI * 2);
				ctx.arc(42, 12, 2.2, 0, Math.PI * 2);
				ctx.fill();
			}
		} else {
			this.drawLimb(ctx, -8, -4, -12, 10, "#3A76A8", 5);
			this.drawLimb(ctx, 8, -4, 12, 10, "#3A76A8", 5);
		}
		this.setupPath(ctx, "#A3C4A3");
		ctx.beginPath();
		ctx.arc(0, -18, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.save();
		if (panicked) ctx.rotate(Math.sin(time * 20) * .08);
		this.setupPath(ctx, COLORS.ink);
		ctx.beginPath();
		ctx.ellipse(0, -29, 20, 5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillRect(-12, -45, 24, 18);
		ctx.strokeRect(-12, -45, 24, 18);
		ctx.fillStyle = COLORS.red;
		ctx.fillRect(-12, -32, 24, 4);
		ctx.restore();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -5 : 7, -19, panicked ? 3.5 : 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawMeluzina(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = Math.sin(time * (panicked ? 16 : 8)) * 8;
		const wave = Math.cos(time * (panicked ? 24 : 12)) * (panicked ? 12 : 6);
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.14);
			this.drawPanicDrops(ctx, -4, -20, time);
			ctx.fillStyle = "rgba(190, 227, 248, 0.4)";
			for (let i = 0; i < 3; i++) {
				const pt = (time * 4 + i * .33) % 1;
				ctx.beginPath();
				ctx.arc(-24 - pt * 28, 5 + Math.sin(pt * 5) * 10, 2.5 + pt * 3, 0, Math.PI * 2);
				ctx.fill();
			}
		}
		this.setupPath(ctx, "#E6EEF8", COLORS.water, 2.5);
		ctx.beginPath();
		ctx.moveTo(0, -15);
		const veilReach = panicked ? -55 : -35;
		ctx.quadraticCurveTo(-25, -20 + wave, veilReach, -5 + wave);
		ctx.quadraticCurveTo(panicked ? -65 : -45, 10, -25, 20);
		ctx.quadraticCurveTo(-10, 25, 0, 15);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D9E8F5", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -10, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			this.drawLimb(ctx, -8, 2, -12, -8, "#D9E8F5", 3.5);
			this.drawLimb(ctx, 8, 2, 10, -8, "#D9E8F5", 3.5);
		}
		ctx.fillStyle = COLORS.water;
		ctx.beginPath();
		ctx.ellipse(panicked ? -2 : 4, -6, panicked ? 5 : 4, panicked ? 9 : 7, 0, 0, Math.PI * 2);
		ctx.fill();
		const hx = panicked ? -4 : 5;
		const hy = -14;
		const hr = panicked ? 3.5 : 3;
		ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
		ctx.beginPath();
		ctx.arc(hx, hy, hr + 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.water;
		ctx.beginPath();
		ctx.arc(hx, hy, hr, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawPolednice(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 24 : 14;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 4;
		const legSwing = Math.sin(time * walkSpeed) * 16;
		const windFlutter = Math.sin(time * (panicked ? 24 : 16)) * (panicked ? 10 : 6);
		const sickleSwing = panicked ? -.7 : Math.sin(time * walkSpeed) * .45;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 28, time);
			this.drawPanicDrops(ctx, 4, -26, time);
		}
		ctx.save();
		for (let i = 0; i < 3; i++) {
			const wavePhase = time * 5 + i * 2;
			const wy = -36 - i * 8 + Math.sin(wavePhase) * 3;
			ctx.strokeStyle = `rgba(245, 158, 11, ${.28 - i * .08})`;
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			ctx.moveTo(-18, wy);
			ctx.bezierCurveTo(-6, wy - 4, 6, wy + 4, 18, wy);
			ctx.stroke();
		}
		for (let i = 0; i < 4; i++) {
			const spAng = time * 3 + i * Math.PI / 2;
			const spDist = 28 + Math.sin(time * 6 + i) * 6;
			ctx.fillStyle = "rgba(253, 224, 71, 0.45)";
			ctx.beginPath();
			ctx.arc(Math.cos(spAng) * spDist, -10 + Math.sin(spAng) * 12, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -5, 12, 19);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 12, 19);
			this.drawBentLimb(ctx, -5, 12, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#E2D4C3", 3.5);
			this.drawBentLimb(ctx, 5, 12, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#E2D4C3", 3.5);
		} else {
			this.drawLimb(ctx, -5, 12, -legSwing, 22, "#E2D4C3", 3.5);
			this.drawLimb(ctx, 5, 12, legSwing, 22, "#E2D4C3", 3.5);
		}
		this.setupPath(ctx, "#F8FAFC", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-12, -8);
		ctx.quadraticCurveTo(-18 + windFlutter * .5, 10, -22 + windFlutter, 30);
		ctx.lineTo(-14 + windFlutter * .6, 26);
		ctx.lineTo(-6, 32);
		ctx.lineTo(2 + windFlutter * .3, 27);
		ctx.lineTo(12, 33);
		ctx.lineTo(20, 28);
		ctx.quadraticCurveTo(16, 8, 12, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-6, -2);
		ctx.quadraticCurveTo(-10 + windFlutter * .3, 14, -12 + windFlutter * .6, 26);
		ctx.moveTo(4, 0);
		ctx.quadraticCurveTo(6, 15, 8, 28);
		ctx.stroke();
		ctx.strokeStyle = COLORS.mustard;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(2, 6);
		ctx.lineTo(14, 18);
		ctx.stroke();
		this.setupPath(ctx, "#E7D5C4", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(2, -26);
		ctx.lineTo(11, -21);
		ctx.lineTo(5, -17);
		ctx.lineTo(9, -13);
		ctx.lineTo(0, -10);
		ctx.lineTo(-8, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F1F5F9", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(-2, -22, 13, Math.PI * .7, Math.PI * 2.1);
		ctx.lineTo(0, -9);
		ctx.lineTo(-8, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-12, -18);
		ctx.quadraticCurveTo(-24 - windFlutter, -22, -30 - windFlutter * 1.5, -14);
		ctx.lineTo(-26 - windFlutter, -10);
		ctx.quadraticCurveTo(-18, -12, -10, -15);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#94A3B8";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(2, -25);
		ctx.quadraticCurveTo(-2, -30, -8, -28);
		ctx.moveTo(5, -19);
		ctx.lineTo(0, -16);
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#DC2626";
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 5, -20, 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FBBF24";
		ctx.beginPath();
		ctx.arc((glanceBack ? -4 : 5) + .5, -20.5, 1, 0, Math.PI * 2);
		ctx.fill();
		ctx.save();
		ctx.translate(6, -4);
		ctx.rotate(sickleSwing);
		ctx.strokeStyle = "#D6C3B0";
		ctx.lineWidth = 3.5;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(12, -4);
		ctx.lineTo(20, -12);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(17, -8);
		ctx.lineTo(25, -18);
		ctx.stroke();
		ctx.fillStyle = "#E2E8F0";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(25, -18);
		ctx.quadraticCurveTo(38, -32, 28, -44);
		ctx.quadraticCurveTo(24, -30, 22, -16);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(27, -42);
		ctx.quadraticCurveTo(34, -32, 25, -20);
		ctx.stroke();
		ctx.restore();
		ctx.restore();
	},
	drawMorana(ctx, x, y, time, vx, panicked, attackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.9;
		const bob = Math.sin(time * (panicked ? 16 : 7)) * (panicked ? 5 : 2);
		const sway = Math.sin(time * 3.2) * (panicked ? 12 : 7);
		const gust = Math.sin(time * 8) * 7;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);

		// Straw legs and tied ankles.
		this.drawLimb(ctx, -8, 15, -12, 34, '#8B6B36', 7);
		this.drawLimb(ctx, 8, 15, 12, 34, '#8B6B36', 7);
		ctx.strokeStyle = '#D6B66B';
		ctx.lineWidth = 2;
		for (let i = 0; i < 5; i++) {
			const yy = 23 + i * 2;
			ctx.beginPath();
			ctx.moveTo(-15, yy);
			ctx.lineTo(-7, yy + 2);
			ctx.moveTo(7, yy + 2);
			ctx.lineTo(15, yy);
			ctx.stroke();
		}

		// Ragged dark winter skirt and embroidered apron.
		this.setupPath(ctx, '#29252C', COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-13, -3);
		ctx.lineTo(12, -3);
		ctx.quadraticCurveTo(20, 15, 31 + sway * .25, 28);
		ctx.lineTo(16, 35);
		ctx.lineTo(4, 29);
		ctx.lineTo(-3, 36);
		ctx.lineTo(-17, 29);
		ctx.quadraticCurveTo(-29, 15, -13, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, '#E8DDC5', COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-7, 3);
		ctx.lineTo(7, 3);
		ctx.lineTo(16, 27);
		ctx.lineTo(0, 32);
		ctx.lineTo(-15, 26);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		const flowers = ['#E87855', '#7CA5A5', '#E6B94D'];
		for (let i = 0; i < 6; i++) {
			const fx = -9 + (i % 3) * 8;
			const fy = 12 + Math.floor(i / 3) * 8;
			ctx.fillStyle = flowers[i % flowers.length];
			ctx.beginPath();
			ctx.arc(fx, fy, 2.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = .8;
			ctx.stroke();
		}

		// Straw torso, arms and splayed fingers.
		this.setupPath(ctx, '#7C6845', COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-16, -24);
		ctx.lineTo(-12, 1);
		ctx.lineTo(12, 1);
		ctx.lineTo(16, -24);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#BDA06A';
		ctx.lineWidth = 10;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(-9, -18);
		ctx.lineTo(-40 - sway * .2, -22 + gust * .12);
		ctx.moveTo(9, -18);
		ctx.lineTo(40 + sway * .2, -22 - gust * .12);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-9, -18);
		ctx.lineTo(-40 - sway * .2, -22 + gust * .12);
		ctx.moveTo(9, -18);
		ctx.lineTo(40 + sway * .2, -22 - gust * .12);
		ctx.stroke();
		ctx.strokeStyle = '#94723F';
		ctx.lineWidth = 2.4;
		for (let i = 0; i < 5; i++) {
			const yy = -29 + i * 4;
			ctx.beginPath();
			ctx.moveTo(-34, yy);
			ctx.lineTo(-47 - (i % 2) * 4, yy - 7 + gust * .15);
			ctx.moveTo(34, yy);
			ctx.lineTo(47 + (i % 2) * 4, yy - 7 - gust * .15);
			ctx.stroke();
		}

		// Frozen sleeves and cord ties.
		ctx.strokeStyle = '#D8E0E5';
		ctx.lineWidth = 7;
		ctx.beginPath();
		ctx.moveTo(-19, -20);
		ctx.lineTo(-25, -21);
		ctx.moveTo(19, -20);
		ctx.lineTo(25, -21);
		ctx.stroke();
		ctx.strokeStyle = '#A75B4A';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(-25, -25);
		ctx.lineTo(-24, -15);
		ctx.moveTo(25, -25);
		ctx.lineTo(24, -15);
		ctx.stroke();

		// Speckled hood and a grim sack-mask face.
		this.setupPath(ctx, '#302831', COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-19, -23);
		ctx.quadraticCurveTo(-18, -42, -1, -47);
		ctx.quadraticCurveTo(16, -47, 20, -29);
		ctx.lineTo(16, -11);
		ctx.quadraticCurveTo(0, -2, -15, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#6D604E';
		ctx.beginPath();
		ctx.ellipse(1, -25, 13, 16, -.08, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		for (let i = 0; i < 24; i++) {
			const hx = -15 + ((i * 7) % 29);
			const hy = -44 + ((i * 11) % 28);
			ctx.fillStyle = i % 3 === 0 ? '#C88762' : i % 3 === 1 ? '#D1B577' : '#7CA5A5';
			ctx.beginPath();
			ctx.arc(hx, hy, i % 4 === 0 ? 1.5 : 1, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-8, -30);
		ctx.lineTo(-3, -26);
		ctx.moveTo(4, -26);
		ctx.lineTo(9, -30);
		ctx.stroke();
		ctx.fillStyle = '#111827';
		ctx.beginPath();
		ctx.ellipse(-6, -29, 2.8, 3.5, -.2, 0, Math.PI * 2);
		ctx.ellipse(7, -29, 2.8, 3.5, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#E5E7EB';
		ctx.beginPath();
		ctx.moveTo(0, -25);
		ctx.lineTo(-3.5, -18);
		ctx.lineTo(3.5, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#1F2937';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-8, -16);
		ctx.lineTo(-5, -12);
		ctx.lineTo(-2, -15);
		ctx.lineTo(1, -11);
		ctx.lineTo(4, -15);
		ctx.lineTo(8, -12);
		ctx.stroke();

		// Bone-white scarf flaps like a pennant in the winter gust.
		this.setupPath(ctx, '#E5EDF2', COLORS.water, 2.2);
		ctx.beginPath();
		ctx.moveTo(-13, -39);
		ctx.quadraticCurveTo(-27 - gust, -43, -35 - gust * 1.4, -33);
		ctx.quadraticCurveTo(-24 - gust, -27, -12, -32);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Pale blue wind spirals and sparkling snow around the effigy.
		ctx.save();
		ctx.strokeStyle = 'rgba(191, 219, 254, 0.52)';
		ctx.lineWidth = 1.8;
		for (let i = 0; i < 3; i++) {
			const radius = 28 + i * 7;
			const start = time * (panicked ? 2.8 : 1.6) + i * 2.1;
			ctx.beginPath();
			ctx.ellipse(Math.sin(start) * 3, 0, radius, 14 + i * 3, start * .3, start, start + Math.PI * 1.45);
			ctx.stroke();
		}
		for (let i = 0; i < 6; i++) {
			const angle = time * 1.8 + i * Math.PI / 3;
			const sx = Math.cos(angle) * 43;
			const sy = -18 + Math.sin(angle) * 32;
			ctx.strokeStyle = '#DBF4FF';
			ctx.beginPath();
			ctx.moveTo(sx - 3, sy);
			ctx.lineTo(sx + 3, sy);
			ctx.moveTo(sx, sy - 3);
			ctx.lineTo(sx, sy + 3);
			ctx.stroke();
		}
		ctx.restore();
		ctx.restore();
	},
	drawKlekanice(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = Math.abs(Math.sin(time * (panicked ? 22 : 10))) * 3.5;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 28, time);
			this.drawPanicDrops(ctx, 4, -26, time);
		}
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -5, 14, 16);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 14, 16);
			this.drawBentLimb(ctx, -5, 14, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#3F3F46", 3.5);
			this.drawBentLimb(ctx, 5, 14, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#3F3F46", 3.5);
		}
		ctx.save();
		// Soft twilight dusk ground aura instead of heavy Gaussian shadowBlur
		ctx.fillStyle = "rgba(76, 29, 149, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 24, 20, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#5C4033", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(-16, 2, 14, 18, .25, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#D97706";
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-18, -12);
		ctx.lineTo(-12, -4);
		ctx.stroke();
		this.setupPath(ctx, "#262626", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-12, -12);
		ctx.quadraticCurveTo(-18, 10, -18, 28);
		ctx.lineTo(-8, 25);
		ctx.lineTo(0, 29);
		ctx.lineTo(10, 24);
		ctx.lineTo(16, 27);
		ctx.quadraticCurveTo(14, 8, 10, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#171717", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -19, 13, Math.PI * .6, Math.PI * 2.2);
		ctx.lineTo(2, -7);
		ctx.lineTo(-10, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D4D4D8", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(2, -18, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 5, -19, 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.save();
		ctx.translate(8, 6);
		ctx.rotate(Math.sin(time * (panicked ? 26 : 6)) * (panicked ? .7 : .35));
		this.setupPath(ctx, "#B45309", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-4, -6);
		ctx.lineTo(4, -6);
		ctx.lineTo(6, 4);
		ctx.lineTo(-6, 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		ctx.restore();
		ctx.restore();
	},
	drawCert(ctx, x, y, time, vx, panicked, isBoss = false, isCharging = false, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = isBoss ? 2.3 : 1.25;
		const charging = isCharging || Math.abs(vx) > 330;
		const bounce = Math.sin(time * (panicked ? 22 : charging ? 26 : 9)) * (isBoss ? 5 : 3.5);
		const legSwing = Math.sin(time * (panicked ? 22 : charging ? 28 : 11)) * (isBoss ? 16 : 10);
		const tailWhip = Math.sin(time * (panicked ? 28 : charging ? 32 : 12)) * (panicked ? 24 : 18);
		ctx.save();
		ctx.translate(x, y + bounce);
		ctx.scale(dir * scale, scale);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -10, 30, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		} else if (charging) {
			ctx.rotate(0.24);
			this.drawRunDust(ctx, -16, 26, time);
		}
		if (isBoss || charging) {
			ctx.save();
			ctx.fillStyle = charging ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.22)";
			ctx.beginPath();
			ctx.ellipse(charging ? -6 : 0, 24, charging ? 28 : 22, 7, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = charging ? "rgba(220, 38, 38, 0.22)" : "rgba(220, 38, 38, 0.12)";
			ctx.beginPath();
			ctx.ellipse(charging ? -6 : 0, 24, charging ? 38 : 30, 10, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		ctx.strokeStyle = "#18181B";
		ctx.lineWidth = isBoss ? 4.5 : 3.2;
		ctx.beginPath();
		const barbY = panicked ? -26 + Math.sin(time * 28) * 6 : charging ? -6 + Math.sin(time * 24) * 4 : -12 + tailWhip * .8;
		const tailX = charging ? -40 : -32;
		ctx.moveTo(-8, 4);
		ctx.quadraticCurveTo(charging ? -30 : -26, tailWhip, tailX, barbY);
		ctx.stroke();
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2);
		ctx.beginPath();
		const tipX = tailX;
		const tipY = barbY;
		ctx.moveTo(tipX, tipY - 8);
		ctx.lineTo(tipX + 6, tipY + 4);
		ctx.lineTo(tipX - 7, tipY + 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if (panicked || charging) {
			const legPhase = time * (charging ? 4.5 : 3.6);
			const leg1 = this.getRunLegCycle(legPhase, -7, 8, 20);
			const leg2 = this.getRunLegCycle(legPhase + .5, 7, 8, 20);
			this.drawBentLimb(ctx, -7, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#27272A", isBoss ? 7 : 5);
			this.drawBentLimb(ctx, 7, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#27272A", isBoss ? 7 : 5);
			this.setupPath(ctx, "#71717A", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.rect(leg1.fx - 4, leg1.fy - 2, 7, 4);
			ctx.rect(leg2.fx - 4, leg2.fy - 2, 7, 4);
			ctx.fill();
			ctx.stroke();
		} else {
			this.drawLimb(ctx, -7, 8, -legSwing, 23, "#27272A", isBoss ? 7 : 5);
			this.drawLimb(ctx, 7, 8, legSwing, 23, "#27272A", isBoss ? 7 : 5);
			this.setupPath(ctx, "#71717A", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.rect(-10, 28 - legSwing * .2, 7, 4);
			ctx.rect(4, 28 + legSwing * .2, 7, 4);
			ctx.fill();
			ctx.stroke();
		}
		this.setupPath(ctx, "#18181B", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-11, -9);
		ctx.lineTo(-15, 9);
		ctx.lineTo(15, 9);
		ctx.lineTo(11, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(0, -4, 2, 0, Math.PI * 2);
		ctx.arc(0, 1, 2, 0, Math.PI * 2);
		ctx.arc(0, 6, 2, 0, Math.PI * 2);
		ctx.fill();
		if (panicked) {
			const armShudder = Math.sin(time * 30) * 5;
			this.drawBentLimb(ctx, -10, -5, -16, -18 + armShudder, -20, -28 + armShudder, "#27272A", 4.5);
			this.drawBentLimb(ctx, 10, -5, 16, -18 - armShudder, 20, -28 - armShudder, "#27272A", 4.5);
		}
		this.setupPath(ctx, "#27272A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -19, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.save();
		ctx.fillStyle = "#EF4444";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		const tongueWobble = Math.sin(time * (panicked ? 24 : 14)) * (panicked ? 5 : 3);
		ctx.moveTo(6, -15);
		ctx.quadraticCurveTo(14, -13 + tongueWobble, 18, -8 + tongueWobble);
		ctx.quadraticCurveTo(15, -6 + tongueWobble, 6, -11);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		this.setupPath(ctx, "#FEF08A", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-4, -29);
		ctx.quadraticCurveTo(-18, -44, -7, -48);
		ctx.quadraticCurveTo(-2, -40, 2, -29);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(4, -29);
		ctx.quadraticCurveTo(18, -44, 9, -48);
		ctx.quadraticCurveTo(3, -40, 0, -29);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#EF4444";
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 4, -21, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FEF08A";
		ctx.beginPath();
		ctx.arc((glanceBack ? -4 : 4) + .5, -21.5, 1.2, 0, Math.PI * 2);
		ctx.fill();
		if ((isBoss || charging || (attackInfo && attackInfo.isActive)) && !panicked) {
			ctx.save();
			if (charging || (attackInfo && attackInfo.isActive && attackInfo.isStrike)) {
				// THRUSTING PITCHFORK STRAIGHT FORWARD IN FULL CHARGE / STRIKE ATTACK
				ctx.strokeStyle = COLORS.woodDark;
				ctx.lineWidth = 4.5;
				ctx.beginPath();
				ctx.moveTo(6, 6);
				ctx.lineTo(44, -2);
				ctx.stroke();
				this.setupPath(ctx, "#3F3F46", COLORS.ink, 2.5);
				ctx.beginPath();
				ctx.moveTo(40, -8);
				ctx.lineTo(48, -2);
				ctx.lineTo(40, 4);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.strokeStyle = "#F97316";
				ctx.lineWidth = 3.5;
				ctx.beginPath();
				ctx.moveTo(46, -6); ctx.lineTo(60, -8);
				ctx.moveTo(48, -2); ctx.lineTo(64, -2);
				ctx.moveTo(46, 2); ctx.lineTo(60, 4);
				ctx.stroke();
				for (let i = 0; i < 5; i++) {
					const emberAng = time * 12 + i * 1.5;
					ctx.fillStyle = i % 2 === 0 ? "#EF4444" : "#FBBF24";
					ctx.beginPath();
					ctx.arc(58 + Math.cos(emberAng) * 12, -2 + Math.sin(emberAng) * 8, 2.2, 0, Math.PI * 2);
					ctx.fill();
				}
			} else if (attackInfo && attackInfo.isActive && attackInfo.isWindup) {
				// PITCHFORK COCKED BACK MENACINGLY WITH EMBER SPARK CLOUD
				ctx.strokeStyle = COLORS.woodDark;
				ctx.lineWidth = 4.2;
				ctx.beginPath();
				ctx.moveTo(6, 12);
				ctx.lineTo(-20, -28);
				ctx.stroke();
				this.setupPath(ctx, "#3F3F46", COLORS.ink, 2.5);
				ctx.beginPath();
				ctx.moveTo(-26, -30);
				ctx.lineTo(-20, -38);
				ctx.lineTo(-14, -30);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				for (let i = 0; i < 4; i++) {
					const emberAng = time * 14 + i * 1.5;
					ctx.fillStyle = i % 2 === 0 ? "#EF4444" : "#FBBF24";
					ctx.beginPath();
					ctx.arc(-20 + Math.cos(emberAng) * 9, -34 + Math.sin(emberAng) * 7, 2.2, 0, Math.PI * 2);
					ctx.fill();
				}
			} else {
				ctx.strokeStyle = COLORS.woodDark;
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.moveTo(14, 20);
				ctx.lineTo(26, -26);
				ctx.stroke();
				this.setupPath(ctx, "#3F3F46", COLORS.ink, 2.5);
				ctx.beginPath();
				ctx.moveTo(20, -26);
				ctx.lineTo(32, -26);
				ctx.lineTo(26, -30);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.strokeStyle = "#F97316";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(26, -30);
				ctx.lineTo(28, -44);
				ctx.moveTo(21, -26);
				ctx.lineTo(19, -40);
				ctx.moveTo(31, -26);
				ctx.lineTo(35, -40);
				ctx.stroke();
				for (let i = 0; i < 3; i++) {
					const emberAng = time * 8 + i * 2;
					ctx.fillStyle = "#EF4444";
					ctx.beginPath();
					ctx.arc(26 + Math.cos(emberAng) * 8, -38 + Math.sin(emberAng) * 6, 1.5, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.restore();
		}
		ctx.restore();
	},
	drawHejkal(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 2.5;
		const bob = Math.sin(time * (panicked ? 18 : 6)) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * (panicked ? 20 : 7)) * 12;
		const rustle = Math.sin(time * (panicked ? 20 : 10)) * 6;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir * scale, scale);
		if (panicked) {
			ctx.rotate(.1);
			this.drawRunDust(ctx, -12, 32, time);
			this.drawPanicDrops(ctx, 4, -30, time);
		}
		ctx.save();
		// Soft moss ground aura instead of heavy Gaussian shadowBlur
		ctx.fillStyle = "rgba(21, 128, 61, 0.22)";
		ctx.beginPath();
		ctx.ellipse(0, 24, 24, 8, 0, 0, Math.PI * 2);
		ctx.fill();
		if (panicked) {
			const legPhase = time * 3.2;
			const leg1 = this.getRunLegCycle(legPhase, -9, 8, 22);
			const leg2 = this.getRunLegCycle(legPhase + .5, 9, 8, 22);
			this.drawBentLimb(ctx, -9, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#3E2723", 8.5);
			this.drawBentLimb(ctx, 9, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#3E2723", 8.5);
		} else {
			this.drawLimb(ctx, -9, 8, -legSwing, 26, "#3E2723", 8.5);
			this.drawLimb(ctx, 9, 8, legSwing, 26, "#3E2723", 8.5);
		}
		this.setupPath(ctx, "#2E4C23", COLORS.ink, 3.8);
		ctx.beginPath();
		ctx.ellipse(0, 0, 20, 23, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#1E1B18";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-10, -10);
		ctx.lineTo(-6, 8);
		ctx.moveTo(4, -8);
		ctx.lineTo(8, 12);
		ctx.moveTo(-2, -14);
		ctx.lineTo(2, 6);
		ctx.stroke();
		this.setupPath(ctx, "#4D7C0F", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-12, -8);
		ctx.quadraticCurveTo(-16, 12, -8 + rustle, 20);
		ctx.lineTo(0, 16);
		ctx.quadraticCurveTo(8 + rustle, 18, 12, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.save();
		ctx.strokeStyle = "#422006";
		ctx.lineWidth = 5.5;
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(10, 10);
			ctx.lineTo(-24, -30);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Club cocked high back behind head
				ctx.moveTo(6, 10);
				ctx.lineTo(-18, -36);
			} else {
				// Smashed forward down into earth
				ctx.moveTo(14, 14);
				ctx.lineTo(36, 4);
			}
		} else {
			ctx.moveTo(14, 14);
			ctx.lineTo(30, -28);
		}
		ctx.stroke();
		ctx.fillStyle = "#71717A";
		ctx.beginPath();
		if (panicked) {
			ctx.arc(-22, -28, 2.2, 0, Math.PI * 2);
			ctx.arc(-18, -22, 2.2, 0, Math.PI * 2);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				ctx.arc(-16, -34, 2.4, 0, Math.PI * 2);
				ctx.arc(-14, -28, 2.4, 0, Math.PI * 2);
			} else {
				ctx.arc(34, 4, 2.6, 0, Math.PI * 2);
				ctx.arc(30, 8, 2.6, 0, Math.PI * 2);
			}
		} else {
			ctx.arc(28, -26, 2.2, 0, Math.PI * 2);
			ctx.arc(25, -20, 2.2, 0, Math.PI * 2);
		}
		ctx.fill();
		ctx.restore();
		this.setupPath(ctx, "#3E2723", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.arc(0, -20, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#14532D";
		ctx.beginPath();
		ctx.ellipse(5, -16, panicked ? 6 : 5, panicked ? 6 : 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#27170E", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-5, -32);
		ctx.lineTo(-14, -46);
		ctx.lineTo(-24, -43);
		ctx.moveTo(-14, -46);
		ctx.lineTo(-11, -54);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(5, -32);
		ctx.lineTo(14, -46);
		ctx.lineTo(24, -43);
		ctx.moveTo(14, -46);
		ctx.lineTo(11, -54);
		ctx.stroke();
		ctx.fillStyle = "#EAB308";
		ctx.beginPath();
		ctx.ellipse(-22, -43, 4, 2.5, .4, 0, Math.PI * 2);
		ctx.ellipse(22, -43, 4, 2.5, -.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#16A34A";
		ctx.beginPath();
		ctx.ellipse(-10, -54, 4, 2.5, .2, 0, Math.PI * 2);
		ctx.ellipse(10, -54, 4, 2.5, -.2, 0, Math.PI * 2);
		ctx.fill();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#4ADE80";
		ctx.beginPath();
		ctx.arc(glanceBack ? -5 : 5, -22, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		ctx.restore();
	},
	drawObr(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 2.9;
		const bob = Math.sin(time * (panicked ? 16 : 4)) * (panicked ? 4 : 3);
		const legSwing = Math.sin(time * (panicked ? 16 : 5)) * 8;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir * scale, scale);
		if (panicked) {
			ctx.rotate(.08);
			this.drawRunDust(ctx, -14, 34, time);
			this.drawPanicDrops(ctx, 6, -34, time);
		}
		ctx.save();
		// Soft mountain ground aura instead of heavy Gaussian shadowBlur
		ctx.fillStyle = "rgba(217, 119, 6, 0.20)";
		ctx.beginPath();
		ctx.ellipse(0, 26, 26, 9, 0, 0, Math.PI * 2);
		ctx.fill();
		if (panicked) {
			const legPhase = time * 2.8;
			const leg1 = this.getRunLegCycle(legPhase, -10, 8, 24);
			const leg2 = this.getRunLegCycle(legPhase + .5, 10, 8, 24);
			this.drawBentLimb(ctx, -10, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#52525B", 10);
			this.drawBentLimb(ctx, 10, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#52525B", 10);
		} else {
			this.drawLimb(ctx, -10, 8, -legSwing, 28, "#52525B", 10);
			this.drawLimb(ctx, 10, 8, legSwing, 28, "#52525B", 10);
		}
		this.setupPath(ctx, "#71717A", COLORS.ink, 4);
		ctx.beginPath();
		ctx.ellipse(0, 0, 24, 26, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			const armWave = Math.sin(time * 20) * 6;
			this.drawBentLimb(ctx, -18, -4, -26, -20 + armWave, -28, -36 + armWave, "#52525B", 8);
			this.drawBentLimb(ctx, 18, -4, 26, -20 - armWave, 28, -36 - armWave, "#52525B", 8);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Obr hoists massive pine club overhead with both hands!
				this.drawBentLimb(ctx, -18, -4, -24, -26, -10, -42, "#52525B", 8);
				this.drawBentLimb(ctx, 18, -4, 24, -26, 12, -42, "#52525B", 8);
				ctx.strokeStyle = "#422006";
				ctx.lineWidth = 7.5;
				ctx.beginPath();
				ctx.moveTo(-34, -46);
				ctx.lineTo(38, -42);
				ctx.stroke();
				ctx.fillStyle = "#713F12";
				ctx.beginPath();
				ctx.arc(28, -42, 6, 0, Math.PI * 2);
				ctx.arc(-24, -46, 5, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = COLORS.ink;
				ctx.lineWidth = 2.2;
				ctx.stroke();
			} else {
				// Obr slams giant pine club straight down into ground!
				this.drawBentLimb(ctx, -18, -4, -20, 6, -8, 24, "#52525B", 8);
				this.drawBentLimb(ctx, 18, -4, 20, 6, 14, 24, "#52525B", 8);
				ctx.strokeStyle = "#422006";
				ctx.lineWidth = 7.5;
				ctx.beginPath();
				ctx.moveTo(2, -4);
				ctx.lineTo(34, 28);
				ctx.stroke();
				ctx.fillStyle = "#713F12";
				ctx.beginPath();
				ctx.arc(28, 24, 6.5, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = COLORS.ink;
				ctx.lineWidth = 2.2;
				ctx.stroke();
			}
		}
		ctx.strokeStyle = "#F59E0B";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-8, -4);
		ctx.lineTo(0, 4);
		ctx.lineTo(8, -4);
		ctx.moveTo(0, 4);
		ctx.lineTo(0, 14);
		ctx.stroke();
		this.setupPath(ctx, "#15803D", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(-16, -14, 8, 0, Math.PI * 2);
		ctx.arc(16, -14, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#166534";
		ctx.beginPath();
		ctx.moveTo(-16, -26);
		ctx.lineTo(-20, -18);
		ctx.lineTo(-12, -18);
		ctx.closePath();
		ctx.fill();
		this.setupPath(ctx, "#52525B", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(0, -23, 15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-12, -26);
		ctx.lineTo(12, -26);
		ctx.stroke();
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(6, -23, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		ctx.restore();
	},
	drawPlivnik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const hop = Math.abs(Math.sin(time * (panicked ? 24 : 14))) * (panicked ? 7 : 4);
		const dir = vx < 0 ? -1 : 1;
		ctx.save();
		ctx.translate(x, y - hop);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -8, 14, time);
			this.drawPanicDrops(ctx, 4, -14, time);
		}
		// Bounding chick legs with sharp spurs & talons
		if (panicked) {
			const legPhase = time * 4.2;
			const leg1 = this.getRunLegCycle(legPhase, -4, 4, 12);
			const leg2 = this.getRunLegCycle(legPhase + 0.5, 4, 4, 12);
			this.drawBentLimb(ctx, -4, 4, leg1.kx, leg1.ky, leg1.fx, leg1.fy, '#18181B', 2.8);
			this.drawBentLimb(ctx, 4, 4, leg2.kx, leg2.ky, leg2.fx, leg2.fy, '#18181B', 2.8);
		} else {
			const legSwing = Math.sin(time * 14) * 8;
			this.drawLimb(ctx, -4, 4, -4 - legSwing, 16, '#18181B', 2.8);
			this.drawLimb(ctx, 4, 4, 4 + legSwing, 16, '#18181B', 2.8);
		}
		// Chicken spurs
		ctx.strokeStyle = '#F59E0B';
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(-5, 12); ctx.lineTo(-9, 10);
		ctx.moveTo(3, 12); ctx.lineTo(-1, 10);
		ctx.stroke();

		// Teardrop black downy chick body
		this.setupPath(ctx, '#18181B', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, 11, 9, 0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Tail feathers tipped with fire
		ctx.beginPath();
		ctx.moveTo(-8, -2);
		ctx.quadraticCurveTo(-16, -8, -18, -14 + Math.sin(time * 16) * 3);
		ctx.lineTo(-12, -4);
		ctx.closePath();
		this.setupPath(ctx, '#DC2626', COLORS.ink, 1.8);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(-7, 1);
		ctx.quadraticCurveTo(-14, 2, -16, -4 + Math.cos(time * 16) * 3);
		ctx.lineTo(-10, 3);
		ctx.closePath();
		this.setupPath(ctx, '#F97316', COLORS.ink, 1.5);
		ctx.fill();
		ctx.stroke();

		// Flapping chick wings
		const wingFlap = Math.sin(time * (panicked ? 28 : 16)) * 6;
		this.setupPath(ctx, '#27272A', COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-2, -1, 7, 5, 0.2 + wingFlap * 0.05, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Round chick head
		this.setupPath(ctx, '#18181B', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.arc(6, -7, 7, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Fiery comb (hřebínek) flickering on top of head
		const combFlicker = Math.sin(time * 20) * 1.5;
		this.setupPath(ctx, '#DC2626', COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(3, -12);
		ctx.lineTo(4, -18 + combFlicker);
		ctx.lineTo(7, -13);
		ctx.lineTo(8, -19 - combFlicker);
		ctx.lineTo(10, -13);
		ctx.lineTo(11, -17);
		ctx.lineTo(11, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Red wattle (lalůček) under beak
		this.setupPath(ctx, '#DC2626', COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.ellipse(9, -2, 2.2, 3, 0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Sharp golden beak
		this.setupPath(ctx, '#F59E0B', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(11, -8);
		ctx.lineTo(18, -6);
		ctx.lineTo(11, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Golden glowing eye
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#FDE047';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(glanceBack ? 3 : 8, -8, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? 2.5 : 8.5, -8, 1.1, 0, Math.PI * 2);
		ctx.fill();

		// Fire sparks around comb & tail
		ctx.fillStyle = '#FBBF24';
		for (let i = 0; i < 2; i++) {
			const spT = (time * 6 + i * 0.5) % 1;
			const sx = -10 - spT * 12;
			const sy = -8 - spT * 10 + i * 4;
			ctx.beginPath();
			ctx.arc(sx, sy, Math.max(0.6, (1 - spT) * 2), 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawSotek(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const waddle = Math.sin(time * (panicked ? 22 : 11)) * (panicked ? 4 : 2.5);
		ctx.save();
		ctx.translate(x, y + waddle);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -6, 20, time);
			this.drawPanicDrops(ctx, 4, -18, time);
		}
		// Stubby legs with patched soft leather shoes
		const legSwing = Math.sin(time * (panicked ? 22 : 11)) * 9;
		this.drawLimb(ctx, -5, 8, -5 - legSwing, 20, '#78350F', 3.5);
		this.drawLimb(ctx, 5, 8, 5 + legSwing, 20, '#78350F', 3.5);
		this.setupPath(ctx, '#92400E', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-8 - legSwing * 0.1, 18, 6, 4);
		ctx.rect(3 + legSwing * 0.1, 18, 6, 4);
		ctx.fill();
		ctx.stroke();

		// Chubby body in coarse linen smock
		this.setupPath(ctx, '#E2D5BA', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, 4, 11, 13, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Flour patches and pocket on smock
		this.setupPath(ctx, '#B45309', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.rect(-5, 5, 4, 5);
		ctx.fill();
		ctx.stroke();

		// White flour smudges on belly
		ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
		ctx.beginPath();
		ctx.arc(2, 6, 3.5, 0, Math.PI * 2);
		ctx.arc(-2, 2, 2.5, 0, Math.PI * 2);
		ctx.fill();

		// Impish arms holding a wooden spoon
		const armBob = Math.sin(time * 12) * 3;
		this.drawBentLimb(ctx, -6, 2, -12, 6, -8, 12, '#E2D5BA', 3.2);
		this.drawBentLimb(ctx, 6, 2, 12, 4 + armBob, 16, -2 + armBob, '#E2D5BA', 3.2);

		// Stolen rustic wooden spoon in hand
		ctx.save();
		ctx.translate(14, -2 + armBob);
		ctx.rotate(-0.35 + (panicked ? Math.sin(time * 20) * 0.4 : 0));
		ctx.strokeStyle = '#8C5A35';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(-3, 10);
		ctx.lineTo(8, -8);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.stroke();
		this.setupPath(ctx, '#A16207', COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.ellipse(9, -9, 4, 6, 0.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Plum jam smear on spoon
		ctx.fillStyle = '#581C87';
		ctx.beginPath();
		ctx.arc(9.5, -9, 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// Round head with rosy cheeks
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.arc(0, -9, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Pointed elf ears dusted with flour
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-7, -10); ctx.lineTo(-14, -14); ctx.lineTo(-8, -6); ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(7, -10); ctx.lineTo(14, -14); ctx.lineTo(8, -6); ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.beginPath();
		ctx.arc(-11, -12, 1.8, 0, Math.PI * 2);
		ctx.arc(11, -12, 1.8, 0, Math.PI * 2);
		ctx.fill();

		// Long floppy pointed nightcap drooping behind
		const capSway = Math.sin(time * 8) * 3;
		this.setupPath(ctx, '#9A3412', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-8, -12);
		ctx.lineTo(8, -12);
		ctx.quadraticCurveTo(12, -22, -6, -24);
		ctx.quadraticCurveTo(-18, -26 + capSway, -22, -16 + capSway);
		ctx.lineTo(-18, -14 + capSway);
		ctx.quadraticCurveTo(-14, -20, -8, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Cap pompom / tassel
		this.setupPath(ctx, '#FAF5FF', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.arc(-22, -15 + capSway, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Face: Rosy cheeks, mischievous grin, twinkling eye
		ctx.fillStyle = '#F87171';
		ctx.beginPath();
		ctx.arc(-4, -6, 2.2, 0, Math.PI * 2);
		ctx.arc(4, -6, 2.2, 0, Math.PI * 2);
		ctx.fill();

		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 3, -10, panicked ? 2.5 : 1.8, 0, Math.PI * 2);
		ctx.fill();

		// Cheeky grin
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.arc(glanceBack ? -2 : 3, -6, 4, 0.2, Math.PI * 0.85);
		ctx.stroke();

		ctx.restore();
	},
	drawZaba(ctx, x, y, time, vx, panicked) {
		const hop = Math.abs(Math.sin(time * (panicked ? 20 : 10))) * (panicked ? 9 : 4);
		const dir = vx < 0 ? -1 : 1;
		ctx.save();
		ctx.translate(x, y - hop);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.14);
			this.drawRunDust(ctx, -8, 12, time);
			this.drawPanicDrops(ctx, 4, -10, time);
		}
		if (panicked) {
			const legPhase = time * 3.5;
			const leg1 = this.getRunLegCycle(legPhase, -4, 4, 14);
			const leg2 = this.getRunLegCycle(legPhase + .4, 4, 4, 14);
			this.drawBentLimb(ctx, -4, 4, leg1.kx - 4, leg1.ky - 2, leg1.fx, leg1.fy, COLORS.green, 3);
			this.drawBentLimb(ctx, 4, 4, leg2.kx - 4, leg2.ky - 2, leg2.fx, leg2.fy, COLORS.green, 3);
		} else {
			this.drawBentLimb(ctx, -6, 2, -10, 8, -6, 12, COLORS.green, 3);
			this.drawBentLimb(ctx, 6, 2, 2, 8, 6, 12, COLORS.green, 3);
		}
		this.setupPath(ctx, COLORS.green, COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(0, 2, 12, 8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(-8, -7, 4, 4, 0, 0, Math.PI * 2);
		ctx.ellipse(8, -7, 4, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.arc(glanceBack ? -10 : -7, -7, panicked ? 1.5 : 2, 0, Math.PI * 2);
		ctx.arc(glanceBack ? 6 : 9, -7, panicked ? 1.5 : 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawZmrzlik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const shiver = Math.sin(time * 28) * 1.5;
		const bounce = Math.sin(time * (panicked ? 22 : 12)) * (panicked ? 5 : 3.5);
		ctx.save();
		ctx.translate(x, y + bounce + shiver);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -8, 20, time);
			this.drawPanicDrops(ctx, 4, -18, time);
		}

		// Frosty little legs with ice boot cuffs
		const legSwing = Math.sin(time * (panicked ? 22 : 12)) * 10;
		this.drawLimb(ctx, -4, 6, -4 - legSwing, 22, '#7DD3FC', 3.5);
		this.drawLimb(ctx, 4, 6, 4 + legSwing, 22, '#7DD3FC', 3.5);
		this.setupPath(ctx, '#0284C7', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(-4 - legSwing, 22, 3.5, 0, Math.PI * 2);
		ctx.arc(4 + legSwing, 22, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Round translucent pale-blue frosted body
		this.setupPath(ctx, '#BAE6FD', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, 4, 10, 12, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Frost crystal patterns on belly
		ctx.strokeStyle = '#FFFFFF';
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(0, 0); ctx.lineTo(0, 8);
		ctx.moveTo(-3, 2); ctx.lineTo(3, 6);
		ctx.moveTo(3, 2); ctx.lineTo(-3, 6);
		ctx.stroke();

		// Fluffy sheepskin winter fleece collar
		this.setupPath(ctx, '#F8FAFC', COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(0, -6, 12, 4.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Frosty arms ending in sharp ice claws
		const armWave = Math.sin(time * 14) * 4;
		this.drawBentLimb(ctx, -6, -4, -12, 2, -10, 8 + armWave, '#BAE6FD', 3);
		this.drawBentLimb(ctx, 6, -4, 12, 0 - armWave, 14, 6 - armWave, '#BAE6FD', 3);

		// Frosty head
		this.setupPath(ctx, '#BAE6FD', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -14, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Pointed icicle ears / horns
		this.setupPath(ctx, '#E0F2FE', COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-5, -20);
		ctx.lineTo(-14, -28);
		ctx.lineTo(-9, -17);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(5, -20);
		ctx.lineTo(14, -28);
		ctx.lineTo(9, -17);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// SIGNATURE ICICLE NOSE (dlouhý ostrý rampouchovitý nos)
		this.setupPath(ctx, '#E0F2FE', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(4, -16);
		ctx.lineTo(24, -13);
		ctx.lineTo(4, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Glistening frost drop at the tip of the icicle nose
		ctx.fillStyle = '#38BDF8';
		ctx.beginPath();
		ctx.arc(24, -13, 1.8, 0, Math.PI * 2);
		ctx.fill();

		// Chilly glowing cyan eyes
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#38BDF8';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 2, -16, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -3.5 : 2.5, -16, 1.2, 0, Math.PI * 2);
		ctx.fill();

		// Exhaling frost breath puffs
		ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
		for (let i = 0; i < 2; i++) {
			const pt = (time * 3 + i * 0.5) % 1;
			const bx = 16 + pt * 14;
			const by = -10 - Math.sin(pt * Math.PI) * 5;
			ctx.beginPath();
			ctx.arc(bx, by, 1.5 + pt * 3, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawSkodnik(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = Math.abs(Math.sin(time * (panicked ? 26 : 16))) * 4;
		const tailSway = Math.sin(time * 20) * (panicked ? 14 : 8);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -10, 16, time);
			this.drawPanicDrops(ctx, 4, -16, time);
		}
		if (panicked) {
			const pPhase = time * 4.2;
			const leg1 = this.getRunLegCycle(pPhase, -4, 6, 10);
			const leg2 = this.getRunLegCycle(pPhase + .5, 4, 6, 10);
			this.drawBentLimb(ctx, -4, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#C2410C", 2.5);
			this.drawBentLimb(ctx, 4, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#C2410C", 2.5);
		}
		this.setupPath(ctx, "#C2410C", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-8, 2);
		const tailEndX = panicked ? -26 : -14;
		const tailEndY = panicked ? -10 + tailSway : -26 + tailSway;
		ctx.quadraticCurveTo(-22, -12 + tailSway, tailEndX, tailEndY);
		ctx.quadraticCurveTo(-8, -20, -6, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FFEDD5";
		ctx.beginPath();
		ctx.ellipse(3, 2, 5, 8, 0, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#C2410C", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(6, -12, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(panicked ? 2 : 5, -18);
		ctx.lineTo(panicked ? 4 : 8, -25);
		ctx.lineTo(panicked ? 8 : 11, -17);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if (!panicked) {
			this.setupPath(ctx, "#78350F", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.ellipse(12, -4, 4, 6, .4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? 2 : 8, -13, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawMysak(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = Math.abs(Math.sin(time * (panicked ? 28 : 16))) * 3;
		const tailWiggle = Math.sin(time * 25) * (panicked ? 12 : 8);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 12, time);
			this.drawPanicDrops(ctx, 4, -10, time);
		}
		if (panicked) {
			const pPhase = time * 4.5;
			const leg1 = this.getRunLegCycle(pPhase, -4, 4, 8);
			const leg2 = this.getRunLegCycle(pPhase + .5, 4, 4, 8);
			this.drawBentLimb(ctx, -4, 4, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#F472B6", 2);
			this.drawBentLimb(ctx, 4, 4, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#F472B6", 2);
		}
		ctx.strokeStyle = "#F472B6";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-10, 4);
		ctx.quadraticCurveTo(-18, tailWiggle, panicked ? -30 : -24, -2 + tailWiggle);
		ctx.stroke();
		this.setupPath(ctx, "#94A3B8", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(0, 0, 13, 9, -.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(8, -4, 8, 6, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#F472B6", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(panicked ? 2 : 4, -11, 4.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? 4 : 10, -5, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#F472B6";
		ctx.beginPath();
		ctx.arc(15, -4, 1.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawSkeletonScythe(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 22 : 11;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 25, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -5, 6, 20);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 6, 20);
			this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, COLORS.bone, 4);
			this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, COLORS.bone, 4);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 14;
			this.drawLimb(ctx, -5, 6, -legSwing, 24, COLORS.bone, 4);
			this.drawLimb(ctx, 5, 6, legSwing, 24, COLORS.bone, 4);
		}
		this.setupPath(ctx, "#334155", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-10, -12);
		ctx.lineTo(-15, 18);
		ctx.lineTo(15, 18);
		ctx.lineTo(10, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.moveTo(-6, -6 + i * 5);
			ctx.lineTo(6, -6 + i * 5);
			ctx.stroke();
		}
		if (panicked) {
			const armShudder = Math.sin(time * 30) * 4;
			this.drawBentLimb(ctx, -6, -10, -14, -22 + armShudder, -18, -32 + armShudder, COLORS.bone, 3.5);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				this.drawBentLimb(ctx, -6, -10, -12, -22, -14, -30, COLORS.bone, 3.5);
				this.drawBentLimb(ctx, 6, -10, 0, -20, -10, -28, COLORS.bone, 3.5);
			} else {
				this.drawBentLimb(ctx, -6, -10, 10, -4, 24, -2, COLORS.bone, 3.5);
				this.drawBentLimb(ctx, 6, -10, 16, -6, 28, -4, COLORS.bone, 3.5);
			}
		}
		this.setupPath(ctx, COLORS.bone, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -22, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.rect(-5, panicked ? -12 : -14, 10, panicked ? 7 : 5);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 3, -23, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(8, 4);
			ctx.lineTo(-24, 22);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Scythe shaft hoisted way back high behind skull
				ctx.moveTo(6, 12);
				ctx.lineTo(-16, -34);
			} else {
				// Sweeping across in front
				ctx.moveTo(8, 12);
				ctx.lineTo(36, -6);
			}
		} else {
			ctx.moveTo(10, 16);
			ctx.lineTo(18, -28);
		}
		ctx.stroke();
		this.setupPath(ctx, "#94A3B8", COLORS.ink, 2.2);
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(-24, 22);
			ctx.quadraticCurveTo(-40, 26, -38, 14);
			ctx.quadraticCurveTo(-30, 20, -24, 22);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				ctx.moveTo(-16, -34);
				ctx.quadraticCurveTo(-34, -44, -32, -56);
				ctx.quadraticCurveTo(-22, -44, -16, -34);
			} else {
				ctx.moveTo(36, -6);
				ctx.quadraticCurveTo(52, -18, 50, -32);
				ctx.quadraticCurveTo(42, -16, 36, -6);
			}
		} else {
			ctx.moveTo(18, -28);
			ctx.quadraticCurveTo(34, -36, 32, -48);
			ctx.quadraticCurveTo(24, -36, 18, -28);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	drawUmrlec(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 20 : 8;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 2.5;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.25, 1.25);
		if (panicked) {
			ctx.rotate(.1);
			this.drawRunDust(ctx, -10, 26, time);
			this.drawPanicDrops(ctx, 4, -26, time);
		}
		if (panicked) {
			const legPhase = time * 3.4;
			const leg1 = this.getRunLegCycle(legPhase, -6, 6, 19);
			const leg2 = this.getRunLegCycle(legPhase + .5, 6, 6, 19);
			this.drawBentLimb(ctx, -6, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#CBD5E1", 5);
			this.drawBentLimb(ctx, 6, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#CBD5E1", 5);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 8;
			this.drawLimb(ctx, -6, 6, -legSwing, 22, "#CBD5E1", 5);
			this.drawLimb(ctx, 6, 6, legSwing, 22, "#CBD5E1", 5);
		}
		this.setupPath(ctx, "#E2E8F0", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.ellipse(0, 2, 17, 22, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			const armWave = Math.sin(time * 24) * 6;
			this.drawBentLimb(ctx, -10, -4, -18, -18 + armWave, -22, -28 + armWave, "#CBD5E1", 5);
			this.drawBentLimb(ctx, 10, -4, 18, -18 - armWave, 22, -28 - armWave, "#CBD5E1", 5);
		}
		ctx.strokeStyle = "#94A3B8";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-14, -6);
		ctx.lineTo(panicked ? -26 : 14, 2);
		ctx.moveTo(-15, 6);
		ctx.lineTo(panicked ? -28 : 13, 14);
		ctx.stroke();
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -20, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 4, -21, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();
	},
	drawPisar(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 24 : 12;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.1, 1.1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 25, time);
			this.drawPanicDrops(ctx, 4, -30, time);
		}
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -5, 6, 18);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 6, 18);
			this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#0F172A", 4);
			this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#0F172A", 4);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 12;
			this.drawLimb(ctx, -5, 6, -legSwing, 22, "#0F172A", 4);
			this.drawLimb(ctx, 5, 6, legSwing, 22, "#0F172A", 4);
		}
		this.setupPath(ctx, "#1E293B", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-11, -8);
		ctx.lineTo(panicked ? -22 : -14, 18);
		ctx.lineTo(14, 18);
		ctx.lineTo(11, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#0F172A";
		ctx.fillRect(8, 6, 6, 8);
		if (panicked) {
			ctx.fillStyle = "#0F172A";
			ctx.beginPath();
			ctx.arc(12 + Math.sin(time * 20) * 4, 18 + time * 15 % 10, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		if (panicked) {
			this.drawBentLimb(ctx, -8, -6, -14, -20, -4, -32, "#1E293B", 4);
			const quillSwing = Math.sin(time * 28) * 8;
			this.drawLimb(ctx, 8, -6, 18, 10 + quillSwing, "#1E293B", 4);
		}
		this.setupPath(ctx, "#F1F5F9", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.arc(-2, -23, 11, Math.PI * .7, Math.PI * 2.3);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(2, -20, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (!panicked) {
			ctx.save();
			ctx.translate(10, 2);
			ctx.rotate(Math.sin(time * 8) * .4);
			ctx.strokeStyle = "#FFFFFF";
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(14, -14);
			ctx.stroke();
			ctx.restore();
		}
		ctx.restore();
	},
	drawHrobnik(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 22 : 10;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.2, 1.2);
		if (panicked) {
			ctx.rotate(.11);
			this.drawRunDust(ctx, -8, 25, time);
			this.drawPanicDrops(ctx, 4, -30, time);
		}
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -6, 6, 18);
			const leg2 = this.getRunLegCycle(legPhase + .5, 6, 6, 18);
			this.drawBentLimb(ctx, -6, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#451A03", 5.5);
			this.drawBentLimb(ctx, 6, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#451A03", 5.5);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 10;
			this.drawLimb(ctx, -6, 6, -legSwing, 22, "#451A03", 5.5);
			this.drawLimb(ctx, 6, 6, legSwing, 22, "#451A03", 5.5);
		}
		this.setupPath(ctx, "#78350F", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-12, -8);
		ctx.lineTo(panicked ? -22 : -16, 18);
		ctx.lineTo(14, 18);
		ctx.lineTo(10, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			this.drawBentLimb(ctx, -8, -6, -14, -20, -4, -30, "#78350F", 5);
			this.drawLimb(ctx, 8, -6, -16, 12, "#78350F", 5);
		}
		this.setupPath(ctx, "#D6C7B2", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -18, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#1C1917", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.rect(-10, -28, 20, 4);
		ctx.rect(-6, -38, 12, 10);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(4, 4);
			ctx.lineTo(-24, -18);
		} else {
			ctx.moveTo(8, 16);
			ctx.lineTo(20, -20);
		}
		ctx.stroke();
		this.setupPath(ctx, "#71717A", COLORS.ink, 2);
		ctx.beginPath();
		if (panicked) ctx.rect(-30, -24, 12, 10);
		else ctx.rect(14, -28, 12, 10);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	drawHromotluk(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.48;
		const heavyBob = Math.sin(time * (panicked ? 16 : 8)) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * (panicked ? 16 : 8)) * 12;

		this.drawShadow(ctx, x, y, 28 * scale);
		ctx.save();
		ctx.translate(x, y + heavyBob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -14, 28, time);
			this.drawPanicDrops(ctx, 4, -30, time);
		}

		// Heavy shaggy legs
		this.drawLimb(ctx, -9, 10, -9 - legSwing, 28, '#3D2210', 7);
		this.drawLimb(ctx, 9, 10, 9 + legSwing, 28, '#3D2210', 7);

		// Massive bulky shaggy hay-barn body
		this.setupPath(ctx, '#3D2210', COLORS.ink, 3.8);
		ctx.beginPath();
		ctx.ellipse(0, 4, 22, 22, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Strands of golden yellow dried straw and hay stalks sticking out
		ctx.strokeStyle = '#FACC15';
		ctx.lineWidth = 2.2;
		const strawOffsets = [
			[-16, -4, -26, -10], [-14, 12, -24, 18], [-8, 20, -14, 28],
			[14, -8, 24, -14], [16, 8, 26, 12], [8, 18, 14, 26],
			[-10, -18, -16, -26], [6, -18, 12, -26]
		];
		ctx.beginPath();
		strawOffsets.forEach(([x1, y1, x2, y2]) => {
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
		});
		ctx.stroke();

		// Thick arms holding a massive barn timber beam club
		const isAttacking = attackInfo && attackInfo.isActive;
		ctx.save();
		if (isAttacking) {
			if (attackInfo.isWindup) {
				// Reared high overhead
				this.drawBentLimb(ctx, -12, -4, -20, -22, -14, -38, '#3D2210', 6);
				this.drawBentLimb(ctx, 12, -4, 4, -24, 6, -36, '#3D2210', 6);
				ctx.save();
				ctx.translate(-14, -38);
				ctx.rotate(-0.6);
				// Barn beam club
				this.setupPath(ctx, '#5E3A21', COLORS.ink, 3);
				ctx.beginPath();
				ctx.rect(-6, -34, 12, 40);
				ctx.fill(); ctx.stroke();
				// Iron band and spike
				ctx.fillStyle = '#71717A';
				ctx.fillRect(-7, -26, 14, 6);
				ctx.fillRect(-7, -12, 14, 6);
				ctx.strokeRect(-7, -26, 14, 6);
				ctx.strokeRect(-7, -12, 14, 6);
				ctx.restore();
			} else {
				// Slammed down forward
				this.drawBentLimb(ctx, -12, -4, 0, 6, 18, 14, '#3D2210', 6);
				this.drawBentLimb(ctx, 12, -4, 18, 8, 28, 16, '#3D2210', 6);
				ctx.save();
				ctx.translate(28, 16);
				ctx.rotate(0.5);
				this.setupPath(ctx, '#5E3A21', COLORS.ink, 3);
				ctx.beginPath();
				ctx.rect(-6, -10, 12, 38);
				ctx.fill(); ctx.stroke();
				ctx.fillStyle = '#71717A';
				ctx.fillRect(-7, 4, 14, 6);
				ctx.strokeRect(-7, 4, 14, 6);
				ctx.restore();
			}
		} else {
			// Resting club slung over shoulder
			this.drawBentLimb(ctx, -12, -2, -18, 8, -12, 16, '#3D2210', 6);
			this.drawBentLimb(ctx, 12, -2, 16, 4, 18, 14, '#3D2210', 6);
			ctx.save();
			ctx.translate(16, 4);
			ctx.rotate(-0.35);
			this.setupPath(ctx, '#5E3A21', COLORS.ink, 3);
			ctx.beginPath();
			ctx.rect(-5, -28, 10, 36);
			ctx.fill(); ctx.stroke();
			ctx.fillStyle = '#71717A';
			ctx.fillRect(-6, -22, 12, 5);
			ctx.strokeRect(-6, -22, 12, 5);
			ctx.restore();
		}
		ctx.restore();

		// Heavy shaggy head with battered rustic straw hat
		this.setupPath(ctx, '#291206', COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -16, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Straw hat brim & cone
		this.setupPath(ctx, '#CA8A04', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, -22, 22, 6, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-12, -22);
		ctx.lineTo(0, -38);
		ctx.lineTo(12, -22);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Hemp rope hatband
		ctx.strokeStyle = '#78350F';
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-11, -23); ctx.lineTo(11, -23);
		ctx.stroke();

		// Glowing amber eyes under the heavy straw brim
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		const ex1 = glanceBack ? -5 : 4;
		const ex2 = glanceBack ? 2 : 11;
		ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
		ctx.beginPath();
		ctx.arc(ex1, -16, 5.2, 0, Math.PI * 2);
		ctx.arc(ex2, -16, 5.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#F59E0B';
		ctx.beginPath();
		ctx.arc(ex1, -16, 3.2, 0, Math.PI * 2);
		ctx.arc(ex2, -16, 3.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4.5 : 4.5, -16, 1.4, 0, Math.PI * 2);
		ctx.arc(glanceBack ? 2.5 : 11.5, -16, 1.4, 0, Math.PI * 2);
		ctx.fill();

		// Jagged barn beast mouth
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(glanceBack ? -6 : 1, -8);
		ctx.lineTo(glanceBack ? -2 : 5, -5);
		ctx.lineTo(glanceBack ? 2 : 9, -8);
		ctx.stroke();

		ctx.restore();
	},
	drawStodolnik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.35;
		const sway = Math.sin(time * (panicked ? 14 : 5)) * (panicked ? 7 : 4);
		const floatY = Math.sin(time * 6) * 5;

		this.drawShadow(ctx, x, y, 20 * scale);
		ctx.save();
		ctx.translate(x, y + floatY);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -10, 24, time);
			this.drawPanicDrops(ctx, 4, -32, time);
		}

		// Spindly weathered timber legs / root-like branches
		const legSwing = Math.sin(time * 8) * 8;
		this.drawLimb(ctx, -5, 12, -8 - legSwing, 30, '#451A03', 4);
		this.drawLimb(ctx, 5, 12, 6 + legSwing, 30, '#451A03', 4);

		// Layered tattered rye thatch coat (doškový plášť)
		this.setupPath(ctx, '#A16207', COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(0, -18);
		ctx.lineTo(16, 14);
		ctx.lineTo(12, 22);
		ctx.lineTo(0, 26);
		ctx.lineTo(-12, 22);
		ctx.lineTo(-16, 14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Thatch straw fringe ridges
		ctx.strokeStyle = '#EAB308';
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let i = -14; i <= 14; i += 4) {
			ctx.moveTo(i, 8);
			ctx.lineTo(i + (Math.sin(time * 8 + i) * 2), 24);
		}
		ctx.stroke();

		// Spindly branch arms
		const armSway = Math.sin(time * 7) * 4;
		this.drawBentLimb(ctx, -10, -10, -20, -2 + armSway, -24, 12 + armSway, '#451A03', 3.5);
		this.drawBentLimb(ctx, 10, -10, 18, -4 - armSway, 22, 10 - armSway, '#451A03', 3.5);

		// Hanging rustic iron stable lantern in left hand
		ctx.save();
		const lanternSwing = Math.sin(time * 5) * 0.2;
		ctx.translate(22, 10 - armSway);
		ctx.rotate(lanternSwing);
		ctx.strokeStyle = '#18181B';
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(0, 0); ctx.lineTo(0, 8);
		ctx.stroke();
		// Lantern frame
		this.setupPath(ctx, '#FDE047', '#18181B', 1.8);
		ctx.beginPath();
		ctx.rect(-5, 8, 10, 14);
		ctx.fill();
		ctx.stroke();
		// Lantern roof cone
		this.setupPath(ctx, '#3F3F46', '#18181B', 1.5);
		ctx.beginPath();
		ctx.moveTo(-7, 8); ctx.lineTo(0, 4); ctx.lineTo(7, 8); ctx.closePath();
		ctx.fill(); ctx.stroke();
		// Lantern light glow
		ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
		ctx.beginPath();
		ctx.arc(0, 15, 12, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// Weathered barn timber face mask & thatch cowl
		this.setupPath(ctx, '#CA8A04', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(0, -36);
		ctx.lineTo(12, -18);
		ctx.lineTo(-12, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Dark wood plank face
		this.setupPath(ctx, '#271911', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.rect(-8, -26, 16, 14);
		ctx.fill();
		ctx.stroke();

		// Hollow glowing spectral pale-green / amber eyes
		ctx.fillStyle = "rgba(132, 204, 22, 0.35)";
		ctx.beginPath();
		ctx.ellipse(-3, -20, 4.2, 5.5, 0, 0, Math.PI * 2);
		ctx.ellipse(3, -20, 4.2, 5.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#84CC16';
		ctx.beginPath();
		ctx.ellipse(-3, -20, 2.2, 3.5, 0, 0, Math.PI * 2);
		ctx.ellipse(3, -20, 2.2, 3.5, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawCernyPes(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const runSpeed = panicked ? 28 : 18;
		const bob = Math.abs(Math.sin(time * runSpeed)) * 4;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.25, 1.25);
		if (panicked) {
			ctx.rotate(.1);
			this.drawRunDust(ctx, -14, 20, time);
			this.drawPanicDrops(ctx, 10, -18, time);
		}
		if (panicked) {
			const pPhase = time * 4.2;
			const leg1 = this.getRunLegCycle(pPhase, -9, 4, 15);
			const leg2 = this.getRunLegCycle(pPhase + .45, 9, 4, 15);
			this.drawBentLimb(ctx, -9, 4, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#18181B", 4.5);
			this.drawBentLimb(ctx, 9, 4, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#18181B", 4.5);
		} else {
			const legSwing = Math.sin(time * runSpeed) * 15;
			this.drawLimb(ctx, -9, 4, -legSwing, 18, "#18181B", 4.5);
			this.drawLimb(ctx, 9, 4, legSwing, 18, "#18181B", 4.5);
		}
		this.setupPath(ctx, "#18181B", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 12, -.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#18181B";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-16, -2);
		if (panicked) {
			const tailWag = Math.sin(time * 26) * 5;
			ctx.quadraticCurveTo(-28, -6 + tailWag, -32, -2 + tailWag);
		} else ctx.quadraticCurveTo(-26, -14, -20, -20);
		ctx.stroke();
		this.setupPath(ctx, "#18181B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(12, -6, 10, 7, .2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(panicked ? 4 : 8, -12);
		ctx.lineTo(panicked ? 7 : 11, panicked ? -16 : -21);
		ctx.lineTo(panicked ? 12 : 15, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#EF4444";
		ctx.beginPath();
		ctx.arc(glanceBack ? 6 : 14, -7, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(18, -3);
		ctx.lineTo(21, 0);
		ctx.lineTo(19, 0);
		ctx.closePath();
		ctx.fill();
		if (panicked) {
			ctx.fillStyle = "#F472B6";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.ellipse(18, 3, 3, 5, .3, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
	},
	drawVodnicek(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 22 : 12;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.05, 1.05);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -8, 24, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -5, 6, 17);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 6, 17);
			this.drawBentLimb(ctx, -5, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#DC2626", 4);
			this.drawBentLimb(ctx, 5, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#DC2626", 4);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 11;
			this.drawLimb(ctx, -5, 6, -legSwing, 20, "#DC2626", 4);
			this.drawLimb(ctx, 5, 6, legSwing, 20, "#DC2626", 4);
		}
		this.setupPath(ctx, "#16A34A", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-10, -6);
		ctx.lineTo(panicked ? -22 : -14, 16);
		ctx.lineTo(14, 16);
		ctx.lineTo(10, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if (panicked) this.drawBentLimb(ctx, -6, -4, -12, -18, -2, -26, "#16A34A", 3.5);
		ctx.fillStyle = "#38BDF8";
		ctx.beginPath();
		ctx.arc(-10, 20 + Math.sin(time * 8) * 3, 2, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#86EFAC", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -16, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -21, 9, Math.PI, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 3, -16, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawTopivec(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.25;
		const wade = Math.sin(time * (panicked ? 20 : 9)) * (panicked ? 5 : 3);
		const legSwing = Math.sin(time * (panicked ? 20 : 9)) * 10;

		this.drawShadow(ctx, x, y, 22 * scale);
		ctx.save();
		ctx.translate(x, y + wade);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -8, 22, time);
			this.drawPanicDrops(ctx, 4, -26, time);
		}

		// Slimy webbed muddy legs
		this.drawLimb(ctx, -6, 6, -6 - legSwing, 24, '#14532D', 5);
		this.drawLimb(ctx, 6, 6, 6 + legSwing, 24, '#14532D', 5);
		this.setupPath(ctx, '#166534', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(-6 - legSwing, 24, 4.5, 0, Math.PI);
		ctx.arc(6 + legSwing, 24, 4.5, 0, Math.PI);
		ctx.fill();
		ctx.stroke();

		// Muddy dark-green algae torso
		this.setupPath(ctx, '#1E3A2F', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(0, 3, 14, 16, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Tangled cattails (orobince / doutníky) and reed blades on back
		ctx.save();
		// Cattail 1
		ctx.strokeStyle = '#15803D';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-14, -14, -18, -26);
		ctx.stroke();
		this.setupPath(ctx, '#78350F', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.ellipse(-16, -24, 3, 8, -0.4, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		// Cattail 2
		ctx.strokeStyle = '#15803D';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(2, -2); ctx.quadraticCurveTo(-4, -18, -6, -32);
		ctx.stroke();
		this.setupPath(ctx, '#78350F', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.ellipse(-6, -28, 3, 8, -0.1, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// Dripping green pond weed algae ribbons hanging from shoulders
		ctx.strokeStyle = '#22C55E';
		ctx.lineWidth = 2;
		ctx.beginPath();
		const weedWag = Math.sin(time * 12) * 3;
		ctx.moveTo(-10, 6); ctx.quadraticCurveTo(-16, 16, -12 + weedWag, 26);
		ctx.moveTo(10, 6); ctx.quadraticCurveTo(16, 16, 14 - weedWag, 26);
		ctx.stroke();

		// Webbed claw arms
		const armReach = Math.sin(time * 10) * 4;
		this.drawBentLimb(ctx, -10, 0, -18, 6, -14, 14 + armReach, '#14532D', 4.5);
		this.drawBentLimb(ctx, 10, 0, 18, 4, 16, 12 - armReach, '#14532D', 4.5);

		// Muddy amphibious head
		this.setupPath(ctx, '#14532D', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, -12, 12, 10, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Big green water-lily pad (leknínový list) as a cowl over head
		this.setupPath(ctx, '#15803D', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.ellipse(-2, -20, 14, 6, -0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Yellow water lily flower
		this.setupPath(ctx, '#FBBF24', COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.arc(6, -22, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Murky amber-green glowing eyes with horizontal pupils
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#FACC15';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.ellipse(glanceBack ? -5 : 4, -13, 3, 2.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Horizontal slit pupil
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(glanceBack ? -7 : 2, -13);
		ctx.lineTo(glanceBack ? -3 : 6, -13);
		ctx.stroke();

		// Dripping swamp water drops
		ctx.fillStyle = '#38BDF8';
		for (let i = 0; i < 2; i++) {
			const dt = (time * 4 + i * 0.5) % 1;
			ctx.beginPath();
			ctx.arc(-8 + i * 16, 18 + dt * 10, 1.5 * (1 - dt * 0.5), 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawBlatouch(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const bob = Math.sin(time * (panicked ? 20 : 8)) * (panicked ? 5 : 4);
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -6, 20, time);
			this.drawPanicDrops(ctx, 4, -18, time);
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -4, 8, 12);
			const leg2 = this.getRunLegCycle(legPhase + .5, 4, 8, 12);
			this.drawBentLimb(ctx, -4, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#65A30D", 3);
			this.drawBentLimb(ctx, 4, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#65A30D", 3);
		}
		this.setupPath(ctx, "#65A30D", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, 4, 11, 14, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -10, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#FBBF24", COLORS.ink, 2.2);
		for (let i = 0; i < 5; i++) {
			const pAng = i / 5 * Math.PI - Math.PI;
			const petalWobble = panicked ? Math.sin(time * 24 + i) * 2 : 0;
			ctx.beginPath();
			ctx.ellipse(Math.cos(pAng) * 7, -18 + Math.sin(pAng) * 5 + petalWobble, 5, 7, pAng, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 3, -10, panicked ? 2.5 : 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawMrazik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const waddle = Math.sin(time * (panicked ? 20 : 9)) * (panicked ? 4 : 2.5);
		const legSwing = Math.sin(time * (panicked ? 20 : 9)) * 9;
		ctx.save();
		ctx.translate(x, y + waddle);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -6, 22, time);
			this.drawPanicDrops(ctx, 4, -20, time);
		}

		// Felt boots (valenky)
		this.drawLimb(ctx, -5, 8, -5 - legSwing, 22, '#475569', 5);
		this.drawLimb(ctx, 5, 8, 5 + legSwing, 22, '#475569', 5);
		this.setupPath(ctx, '#334155', COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-8 - legSwing * 0.1, 20, 7, 5);
		ctx.rect(2 + legSwing * 0.1, 20, 7, 5);
		ctx.fill(); ctx.stroke();

		// Thick brown sheepskin winter coat (beránčí kožich)
		this.setupPath(ctx, '#5C3821', COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 4, 13, 14, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// White sheepskin fleece hem and collar
		this.setupPath(ctx, '#F8FAFC', COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(0, 15, 14, 4, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(0, -6, 12, 5, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Mittened arms holding pipe
		const pipeWave = Math.sin(time * 8) * 2;
		this.drawBentLimb(ctx, -7, 0, -14, 4, -10, 10, '#5C3821', 4);
		this.drawBentLimb(ctx, 7, 0, 14, -2 + pipeWave, 10, -6 + pipeWave, '#5C3821', 4);

		// Peasant carved wooden smoking pipe
		ctx.save();
		ctx.translate(10, -6 + pipeWave);
		ctx.strokeStyle = '#3D2210';
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-4, 0); ctx.lineTo(6, -2); ctx.lineTo(6, -7);
		ctx.stroke();
		this.setupPath(ctx, '#78350F', COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.ellipse(6, -7, 3, 4, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		// Whirling frost crystal flakes puffing from pipe
		ctx.fillStyle = '#BAE6FD';
		for (let i = 0; i < 2; i++) {
			const pt = (time * 3 + i * 0.5) % 1;
			ctx.beginPath();
			ctx.arc(8 + pt * 10, -10 - pt * 8, Math.max(0.8, 1.8 * (1 - pt)), 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

		// Round frosted head with rosy cheeks
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -10, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Bushy snowy white beard reaching down over coat
		this.setupPath(ctx, '#FFFFFF', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-8, -8);
		ctx.quadraticCurveTo(-12, 6, 0, 14);
		ctx.quadraticCurveTo(12, 6, 8, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Warm fur hat (beranice) with earflaps
		this.setupPath(ctx, '#78350F', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-10, -12);
		ctx.quadraticCurveTo(0, -22, 10, -12);
		ctx.lineTo(8, -8);
		ctx.lineTo(-8, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Earflap hanging
		this.setupPath(ctx, '#F8FAFC', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(-9, -8, 3, 5, 0.2, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Frosty red potato nose & rosy cheeks
		this.setupPath(ctx, '#DC2626', COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.arc(2, -10, 2.8, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Twinkling ice-blue eyes under white snowy brows
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#38BDF8';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 2, -13, 1.8, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// White snowy eyebrows
		ctx.strokeStyle = '#FFFFFF';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-5, -16); ctx.lineTo(-1, -15);
		ctx.moveTo(1, -15); ctx.lineTo(5, -16);
		ctx.stroke();

		ctx.restore();
	},
	drawSeverak(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.45;
		const hover = Math.sin(time * (panicked ? 14 : 6)) * (panicked ? 7 : 5);
		const galeWave = Math.sin(time * 12) * 5;

		this.drawShadow(ctx, x, y, 26 * scale);
		ctx.save();
		ctx.translate(x, y + hover);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawPanicDrops(ctx, 4, -28, time);
		}

		// Raging cyclone whirlwind lower body (indigo & icy cyan spirals)
		this.setupPath(ctx, '#1E3A8A', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-14, 4);
		ctx.quadraticCurveTo(-22, 16, -10 + galeWave, 28);
		ctx.quadraticCurveTo(0, 32, 12 - galeWave, 26);
		ctx.quadraticCurveTo(20, 16, 14, 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Swirling wind spirals on cyclone
		ctx.strokeStyle = '#93C5FD';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.arc(0, 16, 10, 0.4, Math.PI * 1.6);
		ctx.stroke();
		ctx.strokeStyle = '#E0F2FE';
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(0, 22, 6, 0.2, Math.PI * 1.5);
		ctx.stroke();

		// Heavy mountain bear fur pelt over broad shoulders
		this.setupPath(ctx, '#334155', COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Frosty arms conjuring mountain blizzard
		const armFlurry = Math.sin(time * 10) * 4;
		this.drawBentLimb(ctx, -12, -4, -22, -2 + armFlurry, -20, 12 + armFlurry, '#64748B', 5);
		this.drawBentLimb(ctx, 12, -4, 20, -6 - armFlurry, 24, 8 - armFlurry, '#64748B', 5);

		// Icy crag mountain face with wild frosted beard
		this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.arc(0, -16, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Flowing frozen wind beard
		this.setupPath(ctx, '#E2E8F0', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-10, -12);
		ctx.quadraticCurveTo(-16, 2, -4 + galeWave, 8);
		ctx.quadraticCurveTo(8, 6, 10, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Crown of glacial ice horns / mountain stalactites
		this.setupPath(ctx, '#93C5FD', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-8, -26);
		ctx.lineTo(-14, -40);
		ctx.lineTo(-3, -28);
		ctx.lineTo(0, -42);
		ctx.lineTo(4, -28);
		ctx.lineTo(14, -38);
		ctx.lineTo(8, -26);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Piercing bright white blizzard eyes
		ctx.fillStyle = 'rgba(96, 165, 250, 0.40)';
		ctx.beginPath();
		ctx.arc(-4, -17, 4.8, 0, Math.PI * 2);
		ctx.arc(4, -17, 4.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.arc(-4, -17, 2.8, 0, Math.PI * 2);
		ctx.arc(4, -17, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#1E3A8A';
		ctx.beginPath();
		ctx.arc(-3.5, -17, 1.2, 0, Math.PI * 2);
		ctx.arc(4.5, -17, 1.2, 0, Math.PI * 2);
		ctx.fill();

		// Swirling sharp ice crystal shards
		ctx.fillStyle = '#E0F2FE';
		for (let i = 0; i < 3; i++) {
			const it = (time * 4 + i * 0.33) % 1;
			const ix = -16 + Math.cos(it * Math.PI * 2) * 20;
			const iy = 6 + Math.sin(it * Math.PI * 2) * 12;
			ctx.beginPath();
			ctx.arc(ix, iy, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawVanicka(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const flutter = Math.sin(time * (panicked ? 24 : 14)) * 5;
		const spin = time * (panicked ? 8 : 4);
		ctx.save();
		ctx.translate(x, y + flutter);
		ctx.scale(dir, 1);
		if (panicked) {
			ctx.rotate(0.14);
			this.drawPanicDrops(ctx, 4, -20, time);
		}

		// Swirling soft snow flurry funnel cloud
		this.setupPath(ctx, '#F8FAFC', COLORS.water, 2.2);
		ctx.beginPath();
		ctx.moveTo(0, -18);
		ctx.quadraticCurveTo(18, -4, 12, 14);
		ctx.quadraticCurveTo(0, 24, -12, 14);
		ctx.quadraticCurveTo(-18, -4, 0, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Delicate fairy face peeking out
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(0, -8, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Flowing wind-wisp snow hair
		ctx.strokeStyle = '#BAE6FD';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-6, -14); ctx.quadraticCurveTo(-16, -12, -22, -6 + Math.sin(time * 12) * 3);
		ctx.moveTo(6, -14); ctx.quadraticCurveTo(16, -12, 22, -6 - Math.sin(time * 12) * 3);
		ctx.stroke();

		// Cute frosty cheeks & sparkling eyes
		ctx.fillStyle = '#F472B6';
		ctx.beginPath();
		ctx.arc(-3, -6, 1.8, 0, Math.PI * 2);
		ctx.arc(3, -6, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#0284C7';
		ctx.beginPath();
		ctx.arc(-2.5, -9, 1.5, 0, Math.PI * 2);
		ctx.arc(2.5, -9, 1.5, 0, Math.PI * 2);
		ctx.fill();

		// Smiling little mouth
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(0, -6, 2.5, 0.2, Math.PI - 0.2);
		ctx.stroke();

		// 3 geometric 6-pointed ice snowflakes orbiting her core
		ctx.save();
		for (let i = 0; i < 3; i++) {
			const ang = spin + (i * Math.PI * 2) / 3;
			const dist = 14 + (i % 2) * 4;
			const sx = Math.cos(ang) * dist;
			const sy = 4 + Math.sin(ang) * (dist * 0.6);
			ctx.save();
			ctx.translate(sx, sy);
			ctx.rotate(spin * 2 + i);
			ctx.strokeStyle = '#38BDF8';
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			for (let a = 0; a < 3; a++) {
				const r = (a * Math.PI) / 3;
				ctx.moveTo(-Math.cos(r) * 4, -Math.sin(r) * 4);
				ctx.lineTo(Math.cos(r) * 4, Math.sin(r) * 4);
			}
			ctx.stroke();
			ctx.fillStyle = '#FFFFFF';
			ctx.beginPath();
			ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		ctx.restore();

		ctx.restore();
	},
	drawDivozenka(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const danceSpeed = panicked ? 24 : 12;
		const bob = Math.abs(Math.sin(time * danceSpeed)) * 6;
		const spinTilt = panicked ? .12 : Math.sin(time * 6) * .12;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir, 1);
		ctx.rotate(spinTilt);
		if (panicked) {
			this.drawRunDust(ctx, -8, 24, time);
			this.drawPanicDrops(ctx, 4, -26, time);
		}
		ctx.save();
		for (let i = 0; i < 4; i++) {
			const pAng = time * 4 + i * Math.PI / 2;
			const pDist = 20 + Math.sin(time * 5 + i) * 6;
			ctx.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.6)" : "rgba(250, 204, 21, 0.5)";
			ctx.beginPath();
			ctx.arc(Math.cos(pAng) * pDist, Math.sin(pAng) * 15, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		if (panicked) {
			const legPhase = time * 3.8;
			const leg1 = this.getRunLegCycle(legPhase, -5, 8, 18);
			const leg2 = this.getRunLegCycle(legPhase + .5, 5, 8, 18);
			this.drawBentLimb(ctx, -5, 8, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#F5D0C5", 3.5);
			this.drawBentLimb(ctx, 5, 8, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#F5D0C5", 3.5);
		} else {
			const legSwing = Math.sin(time * danceSpeed) * 14;
			this.drawLimb(ctx, -5, 8, -legSwing, 20, "#F5D0C5", 3.5);
			this.drawLimb(ctx, 5, 8, legSwing, 20, "#F5D0C5", 3.5);
		}
		this.setupPath(ctx, "#2E6930", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-10, -6);
		ctx.quadraticCurveTo(-18, 8, -18 + Math.sin(time * 10) * 5, 24);
		ctx.lineTo(-6, 21);
		ctx.lineTo(0, 25);
		ctx.lineTo(8, 20);
		ctx.quadraticCurveTo(18 + Math.sin(time * 10) * 5, 12, 10, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#86EFAC";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-6, -2);
		ctx.lineTo(6, 12);
		ctx.moveTo(4, -2);
		ctx.lineTo(-4, 14);
		ctx.stroke();
		if (panicked) {
			const armWave = Math.sin(time * 26) * 6;
			this.drawBentLimb(ctx, -8, -6, -14, -18 + armWave, -18, -28 + armWave, "#FCE7D6", 3);
			this.drawBentLimb(ctx, 8, -6, 14, -18 - armWave, 18, -28 - armWave, "#FCE7D6", 3);
		}
		this.setupPath(ctx, "#FCE7D6", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -18, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#78350F", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -20, 11, Math.PI * .8, Math.PI * 2.2);
		ctx.quadraticCurveTo(-14, -8, -16 + Math.sin(time * 8) * 4, 4);
		ctx.lineTo(-10, 0);
		ctx.quadraticCurveTo(-6, -10, 0, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#38BDF8";
		ctx.beginPath();
		ctx.arc(-4, -26, 2.5, 0, Math.PI * 2);
		ctx.arc(4, -26, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#EF4444";
		ctx.beginPath();
		ctx.arc(0, -28, 2.2, 0, Math.PI * 2);
		ctx.fill();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = "#15803D";
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 3, -18, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawStageCrow(ctx, x, y, time, vx, panicked) {
		const flap = Math.sin(time * (panicked ? 19 : 13)) * 8;
		const bob = Math.sin(time * 7) * 2, dir = vx < 0 ? -1 : 1;
		ctx.save(); ctx.translate(x, y + bob); ctx.scale(dir, 1);
		ctx.fillStyle = "#171923"; ctx.strokeStyle = "#090B12"; ctx.lineWidth = 2;
		ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, -0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-17, -flap, -21, -5); ctx.quadraticCurveTo(-12, 1, -4, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(2, 1); ctx.quadraticCurveTo(15, flap, 19, -3); ctx.quadraticCurveTo(11, 5, 4, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.arc(7, -5, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		ctx.fillStyle = "#F59E0B"; ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(17, -3); ctx.lineTo(10, -1); ctx.closePath(); ctx.fill();
		ctx.fillStyle = "#F8FAFC"; ctx.beginPath(); ctx.arc(8, -6, 1.5, 0, Math.PI * 2); ctx.fill();
		ctx.strokeStyle = "#171923"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, 5); ctx.lineTo(-4, 10); ctx.moveTo(3, 5); ctx.lineTo(4, 10); ctx.stroke(); ctx.restore();
	},
	drawStageCrowGround(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
		// Ground pose is available for the future crow loot-collection state.
		const dir = vx < 0 ? -1 : 1;
		ctx.save(); ctx.translate(x, y + Math.sin(time * 5) * 0.6); ctx.scale(dir, 1);
		ctx.fillStyle = "#171923"; ctx.strokeStyle = "#090B12"; ctx.lineWidth = 2;
		ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-14, 2, -17, -1); ctx.lineTo(-9, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
		ctx.beginPath(); ctx.arc(7, -5, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		ctx.fillStyle = "#F59E0B"; ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(17, -3); ctx.lineTo(10, -1); ctx.closePath(); ctx.fill();
		ctx.fillStyle = "#F8FAFC"; ctx.beginPath(); ctx.arc(8, -6, 1.5, 0, Math.PI * 2); ctx.fill();
		ctx.strokeStyle = "#D6A33B"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, 5); ctx.lineTo(-3, 9); ctx.moveTo(3, 5); ctx.lineTo(4, 9); ctx.stroke();
		ctx.restore();
	},
	drawFrostJezinka(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean, infoOrEnemy?: any, maybeEnemy?: any) {
		const dir = vx < 0 ? -1 : 1;
		const enemy = (infoOrEnemy && (typeof infoOrEnemy.hp === 'number' || infoOrEnemy.id === 'jezinka_mraziva'))
			? infoOrEnemy
			: (maybeEnemy && (typeof maybeEnemy.hp === 'number' || maybeEnemy.id === 'jezinka_mraziva'))
			? maybeEnemy
			: null;
		const isSemiVisible = enemy
			? (typeof enemy.semiVisible === 'boolean' ? enemy.semiVisible : typeof enemy.isSemiVisible === 'boolean' ? enemy.isSemiVisible : true)
			: true;
		const attack = !!(infoOrEnemy && (
			infoOrEnemy.isStrike || infoOrEnemy.hasSlashArc || infoOrEnemy.hasShockwave ||
			infoOrEnemy.phase === 3 || infoOrEnemy.phase === 4
		));
		const walkRate = panicked ? 15 : 5.2;
		const stride = Math.sin(time * walkRate);
		const bob = Math.abs(stride) * (panicked ? 3.2 : 1.6);
		const clawSway = Math.sin(time * (panicked ? 18 : 6.4)) * (panicked ? 6 : 3.2) + (attack ? 7 : 0);
		const hairWave = Math.sin(time * (panicked ? 16 : 4.2)) * (panicked ? 7 : 3.8);
		const dripPulse = (Math.sin(time * 3.1) + 1) * 0.5;
		// 70% larger than the previous 0.6 scale (0.6 * 1.7 = 1.02) on a full-proportioned witch frame
		const scale = 0.6 * 1.7;

		ctx.save();
		ctx.globalAlpha = isSemiVisible ? 0.62 + Math.sin(time * 2.1) * 0.06 : 0.96;
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);

		// 1. Ground frost aura & shadow under clawed feet
		ctx.save();
		ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
		ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.ellipse(2, 33, 30 + dripPulse * 2.5, 6.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// 2. Flowing wet straw-blonde/white hair locks behind back & shoulders
		this.setupPath(ctx, '#E7DFC6', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-8, -28);
		ctx.bezierCurveTo(-24, -30, -35 - hairWave * 0.6, -20, -40 - hairWave, -8);
		ctx.quadraticCurveTo(-30 - hairWave * 0.5, -10, -24, -14);
		ctx.bezierCurveTo(-33 - hairWave * 0.7, -4, -38 - hairWave, 8, -32 - hairWave * 0.6, 18);
		ctx.quadraticCurveTo(-24, 9, -18, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Lower trailing hair strands behind skirt
		this.setupPath(ctx, '#D6CEB4', COLORS.ink, 1.9);
		ctx.beginPath();
		ctx.moveTo(-14, -6);
		ctx.bezierCurveTo(-26, 4, -32 - hairWave * 0.5, 16, -26 - hairWave * 0.8, 26);
		ctx.quadraticCurveTo(-19, 18, -12, 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 3. Trailing back leg & 5-clawed hag foot
		const backFootX = -10 - stride * 5;
		const backFootY = 27 + Math.max(0, -stride) * 2;
		this.setupPath(ctx, '#F2BE86', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-4, 5);
		ctx.quadraticCurveTo(-13, 14, backFootX - 2, backFootY - 4);
		ctx.lineTo(backFootX - 8, backFootY + 1);
		ctx.lineTo(backFootX + 10, backFootY + 4);
		ctx.lineTo(backFootX + 5, backFootY - 3);
		ctx.quadraticCurveTo(-4, 13, 3, 5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Back foot dark talons
		this.setupPath(ctx, '#1E293B', COLORS.ink, 1.4);
		for (let c = 0; c < 4; c++) {
			const cx = backFootX + 3 + c * 2.6;
			const cy = backFootY + 1.5 + c * 0.5;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + 4.5, cy + 2.8);
			ctx.lineTo(cx + 1.2, cy + 3.2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// 4. Outstretched reaching arm (front-right in direction of travel) with tattered icicle sleeve
		ctx.save();
		ctx.translate(10, -14);
		ctx.rotate((attack ? -0.28 : 0.06) + stride * 0.08);
		// Hanging jagged icicle sleeve drape under outstretched arm
		this.setupPath(ctx, '#93C5FD', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(0, 2);
		ctx.lineTo(2, 22);
		ctx.lineTo(6, 13);
		ctx.lineTo(9, 27);
		ctx.lineTo(13, 14);
		ctx.lineTo(17, 23);
		ctx.lineTo(20, 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Bony forearm & wrist
		this.setupPath(ctx, '#F6C992', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-2, -3);
		ctx.quadraticCurveTo(10, -8, 22 + clawSway * 0.4, -10);
		ctx.lineTo(24 + clawSway * 0.4, -4);
		ctx.quadraticCurveTo(11, -2, 0, 3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Splayed gnarled fingers & curved black witch talons
		const handX = 24 + clawSway * 0.4;
		const handY = -7;
		const fingerOffsets = [
			{ fx: 6, fy: -8, tx: 12, ty: -11 },
			{ fx: 9, fy: -3, tx: 16, ty: -4 },
			{ fx: 8, fy: 2, tx: 15, ty: 4 },
			{ fx: 4, fy: 6, tx: 9, ty: 11 },
			{ fx: -2, fy: 5, tx: 1, ty: 11 },
		];
		for (let f = 0; f < fingerOffsets.length; f++) {
			const fo = fingerOffsets[f];
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 4.2;
			ctx.beginPath();
			ctx.moveTo(handX, handY);
			ctx.lineTo(handX + fo.fx, handY + fo.fy);
			ctx.stroke();
			ctx.strokeStyle = '#F6C992';
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.moveTo(handX, handY);
			ctx.lineTo(handX + fo.fx, handY + fo.fy);
			ctx.stroke();
			this.setupPath(ctx, '#0F172A', COLORS.ink, 1.3);
			ctx.beginPath();
			ctx.moveTo(handX + fo.fx, handY + fo.fy - 1.2);
			ctx.quadraticCurveTo(handX + fo.tx, handY + fo.ty - 1, handX + fo.tx + 1.5, handY + fo.ty + 1.5);
			ctx.lineTo(handX + fo.fx - 0.8, handY + fo.fy + 1.4);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();

		// 5. Tattered frost-encrusted blue gown & jagged icicle skirt
		this.setupPath(ctx, '#60A5FA', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-12, -20);
		ctx.quadraticCurveTo(-18, -4, -15, 8);
		ctx.lineTo(-26, 26);
		ctx.lineTo(-19, 20);
		ctx.lineTo(-15, 29);
		ctx.lineTo(-8, 17);
		// High jagged skirt slit revealing the stalking front leg
		ctx.lineTo(0, 4);
		ctx.lineTo(8, 15);
		ctx.lineTo(12, 27);
		ctx.lineTo(17, 19);
		ctx.lineTo(24, 30);
		ctx.lineTo(27, 18);
		ctx.quadraticCurveTo(18, 4, 11, -6);
		ctx.quadraticCurveTo(14, -15, 8, -22);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Deep glacial folds and white snow-crust highlights on gown
		ctx.strokeStyle = '#1E3A8A';
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-9, -12); ctx.lineTo(-16, 18);
		ctx.moveTo(4, -10); ctx.lineTo(14, 17);
		ctx.stroke();

		this.setupPath(ctx, '#EFF6FF', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-14, 7);
		ctx.lineTo(-9, 15);
		ctx.lineTo(-5, 8);
		ctx.lineTo(1, 13);
		ctx.lineTo(5, 6);
		ctx.lineTo(11, 14);
		ctx.lineTo(15, 7);
		ctx.quadraticCurveTo(2, 1, -14, 7);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 6. Sinewy bent front leg & large foreground 5-clawed foot stepping out of skirt slit
		const frontFootX = 8 + stride * 6;
		const frontFootY = 31 + Math.max(0, stride) * 2;
		this.setupPath(ctx, '#FAD29E', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-2, 4);
		// Raised bony knee
		ctx.quadraticCurveTo(11, 6, 13, 13);
		// Sinewy shin down to ankle
		ctx.quadraticCurveTo(9, 22, frontFootX + 2, frontFootY - 4);
		// Splayed foreground foot
		ctx.lineTo(frontFootX + 16, frontFootY + 2);
		ctx.lineTo(frontFootX - 3, frontFootY + 5);
		ctx.lineTo(frontFootX - 5, frontFootY - 2);
		ctx.quadraticCurveTo(3, 19, 4, 13);
		ctx.quadraticCurveTo(0, 10, -4, 7);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Rosy bony knee highlight & shin tendon line
		ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
		ctx.beginPath();
		ctx.arc(10, 11, 3.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = '#D97706';
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(8, 14);
		ctx.lineTo(frontFootX + 1, frontFootY - 2);
		ctx.stroke();

		// 5 sharp curved black talons on the foreground foot
		this.setupPath(ctx, '#0F172A', COLORS.ink, 1.5);
		for (let c = 0; c < 5; c++) {
			const tx = frontFootX - 1 + c * 3.6;
			const ty = frontFootY + 3.5 - c * 0.3;
			ctx.beginPath();
			ctx.moveTo(tx, ty - 1.5);
			ctx.quadraticCurveTo(tx + 4.5, ty + 1, tx + 5.2, ty + 4.2);
			ctx.lineTo(tx - 0.8, ty + 2.2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// 7. Frosted shoulder cap & rear/side crooked claw hand with tattered sleeve
		this.setupPath(ctx, '#F8FAFC', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-14, -22);
		ctx.quadraticCurveTo(-4, -26, 8, -21);
		ctx.lineTo(5, -11);
		ctx.lineTo(1, -17);
		ctx.lineTo(-3, -9);
		ctx.lineTo(-8, -16);
		ctx.lineTo(-13, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Side crooked arm & ragged icy cuff
		ctx.save();
		ctx.translate(-10, -14);
		ctx.rotate(-0.12 - stride * 0.08 + (attack ? 0.25 : 0));
		this.setupPath(ctx, '#BFDBFE', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-4, 0);
		ctx.lineTo(-18, 10);
		ctx.lineTo(-22, 26);
		ctx.lineTo(-15, 17);
		ctx.lineTo(-12, 28);
		ctx.lineTo(-7, 15);
		ctx.lineTo(-2, 8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, '#F6C992', COLORS.ink, 2.3);
		ctx.beginPath();
		ctx.moveTo(0, -3);
		ctx.lineTo(-14, 4);
		ctx.lineTo(-10, 12);
		ctx.lineTo(2, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Side hand claws
		this.setupPath(ctx, '#0F172A', COLORS.ink, 1.3);
		for (let k = 0; k < 4; k++) {
			const cx = -14 + k * 2.8;
			const cy = 9 + (k % 2) * 2;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx - 3.5, cy + 6.5);
			ctx.lineTo(cx + 1.4, cy + 4.5);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();

		// 8. Hunched Witch Head, Long Pointed Ear, Hooked Red Nose, Wicked Yellow-Toothed Grin & Green Eyes
		ctx.save();
		ctx.translate(3, -30);

		// Long pointed elfin/witch ear jutting back-upward
		this.setupPath(ctx, '#FDBA74', COLORS.ink, 2.3);
		ctx.beginPath();
		ctx.moveTo(-7, -3);
		ctx.quadraticCurveTo(-20, -14, -27, -18);
		ctx.quadraticCurveTo(-22, -5, -9, 3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#EF4444';
		ctx.beginPath();
		ctx.moveTo(-16, -10);
		ctx.lineTo(-25, -16);
		ctx.lineTo(-19, -6);
		ctx.closePath();
		ctx.fill();

		// Witch head & gaunt cheek/chin silhouette
		this.setupPath(ctx, '#FCD39B', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-11, -11);
		ctx.quadraticCurveTo(0, -17, 12, -10);
		ctx.quadraticCurveTo(16, -1, 12, 8);
		// Pointed witch chin jutting down
		ctx.quadraticCurveTo(9, 16, 3, 16);
		ctx.quadraticCurveTo(-4, 15, -9, 8);
		ctx.quadraticCurveTo(-14, 0, -11, -11);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Rosy-red cheek flush
		ctx.fillStyle = 'rgba(239, 68, 68, 0.42)';
		ctx.beginPath();
		ctx.arc(-3, 2, 4.2, 0, Math.PI * 2);
		ctx.arc(9, 1, 3.5, 0, Math.PI * 2);
		ctx.fill();

		// Wide cackling open grin with dark crimson mouth interior & crooked yellow teeth
		this.setupPath(ctx, '#450A0A', COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.moveTo(-4, 4);
		ctx.quadraticCurveTo(4, 2, 10, 4);
		ctx.quadraticCurveTo(9, 13, 2, 13);
		ctx.quadraticCurveTo(-4, 11, -4, 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Crooked yellow witch teeth (top & bottom rows)
		this.setupPath(ctx, '#FACC15', COLORS.ink, 1.1);
		for (let t = 0; t < 4; t++) {
			const tx = -2.2 + t * 2.8;
			ctx.beginPath();
			ctx.moveTo(tx, 4);
			ctx.lineTo(tx + 1.2, 7.6);
			ctx.lineTo(tx + 2.3, 4);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(tx + 0.3, 12);
			ctx.lineTo(tx + 1.3, 8.8);
			ctx.lineTo(tx + 2.3, 12);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// Glowing lime-green eyes with pinpoint black pupils
		this.setupPath(ctx, '#ECFCCB', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(-2, -4, 4.2, 3.6, -0.12, 0, Math.PI * 2);
		ctx.ellipse(7.5, -4.2, 3.8, 3.4, 0.12, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#84CC16';
		ctx.beginPath();
		ctx.arc(-1.8, -4, 2.5, 0, Math.PI * 2);
		ctx.arc(7.5, -4.2, 2.3, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#090D16';
		ctx.beginPath();
		ctx.arc(-1.5, -4, 1.1, 0, Math.PI * 2);
		ctx.arc(7.8, -4.2, 1.1, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.arc(-2.3, -4.8, 0.7, 0, Math.PI * 2);
		ctx.arc(7.0, -5.0, 0.7, 0, Math.PI * 2);
		ctx.fill();

		// Fierce scowling dark eyebrows
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.6;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(-7, -8.5);
		ctx.lineTo(1, -6.2);
		ctx.moveTo(4, -6.2);
		ctx.lineTo(12, -9.2);
		ctx.stroke();

		// Prominent hooked, bulbous reddish-orange witch nose curving down
		this.setupPath(ctx, '#EA580C', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(2, -5);
		ctx.bezierCurveTo(12, -5, 19, 1, 15, 7);
		ctx.quadraticCurveTo(11, 9, 8, 4);
		ctx.quadraticCurveTo(4, 2, 1, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#FDBA74';
		ctx.beginPath();
		ctx.ellipse(9, -1, 3.2, 1.4, 0.35, 0, Math.PI * 2);
		ctx.fill();

		// Wet blonde-white hair strands framing the face
		this.setupPath(ctx, '#FEF3C7', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-11, -10);
		ctx.quadraticCurveTo(-18, 2, -14, 18);
		ctx.quadraticCurveTo(-10, 8, -9, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 9. Tall Multi-Peaked Crown of Icicles & Snow (Koruna z rampouchů)
		this.setupPath(ctx, '#DBEAFE', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-18, -9);
		ctx.lineTo(-15, -22);
		ctx.lineTo(-10, -16);
		ctx.lineTo(-7, -30);
		ctx.lineTo(-3, -20);
		// Central tall glacial spire
		ctx.lineTo(1, -37);
		ctx.lineTo(6, -21);
		ctx.lineTo(10, -31);
		ctx.lineTo(13, -17);
		ctx.lineTo(17, -23);
		ctx.lineTo(19, -9);
		// Brow brim with hanging icicle teeth
		ctx.lineTo(15, -3);
		ctx.lineTo(12, -9);
		ctx.lineTo(8, -2);
		ctx.lineTo(4, -9);
		ctx.lineTo(0, -3);
		ctx.lineTo(-5, -10);
		ctx.lineTo(-9, -2);
		ctx.lineTo(-13, -9);
		ctx.lineTo(-16, -2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Inner crystalline blue facets & snow highlights on crown
		ctx.fillStyle = '#60A5FA';
		ctx.beginPath();
		ctx.moveTo(-6, -12);
		ctx.lineTo(1, -33);
		ctx.lineTo(4, -13);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.moveTo(-2, -13);
		ctx.lineTo(1, -34);
		ctx.lineTo(2, -13);
		ctx.closePath();
		ctx.fill();

		ctx.restore(); // end head group

		// 10. Animated melting water droplets falling from crown, claws, hair & icicle hems
		this.setupPath(ctx, '#38BDF8', COLORS.ink, 1.2);
		const dropAnchors = [
			{ x: -13, y: -28 },
			{ x: 18, y: -29 },
			{ x: 31 + clawSway * 0.4, y: -12 },
			{ x: 36 + clawSway * 0.4, y: -8 },
			{ x: -24, y: 12 },
			{ x: 19, y: 14 },
		];
		for (let i = 0; i < dropAnchors.length; i++) {
			const phase = (time * (1.35 + i * 0.16) + i * 0.27) % 1;
			const dx = dropAnchors[i].x;
			const dy = dropAnchors[i].y + phase * 11;
			const r = 1.4 + (1 - phase) * 1.3;
			ctx.beginPath();
			ctx.moveTo(dx, dy - r * 1.4);
			ctx.quadraticCurveTo(dx + r * 1.3, dy + r * 0.4, dx, dy + r * 1.6);
			ctx.quadraticCurveTo(dx - r * 1.3, dy + r * 0.4, dx, dy - r * 1.4);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.restore();
	},
	drawFrostGiant(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean) {
		ctx.save(); ctx.translate(x, y); ctx.scale(2.4, 2.4); ctx.translate(-x, -y);
		this.drawFrostling(ctx, x, y, time * 0.45, vx, panicked, true); ctx.restore();
	},
	drawMeltingSnowman(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, vx: number, panicked: boolean, infoOrEnemy?: any, maybeEnemy?: any) {
		// Custom Lada-style sprite matched to the supplied melting snowman illustration.
		const dir = vx < 0 ? -1 : 1;
		const enemy = (infoOrEnemy && typeof infoOrEnemy.hp === 'number')
			? infoOrEnemy
			: (maybeEnemy && typeof maybeEnemy.hp === 'number')
			? maybeEnemy
			: null;
		const hpRatio = enemy && typeof enemy.maxHp === 'number' && enemy.maxHp > 0
			? Math.max(0.12, Math.min(1, enemy.hp / enemy.maxHp))
			: (typeof enemy?.meltHpRatio === 'number' ? enemy.meltHpRatio : 1);
		const squashX = (enemy?.meltSquashX ?? (1 + (1 - hpRatio) * 0.18)) * (enemy?.wobbleScaleX ?? 1);
		const squashY = (enemy?.meltSquashY ?? (0.88 + 0.12 * hpRatio)) * (enemy?.wobbleScaleY ?? 1);
		const walk = Math.sin(time * (panicked ? 17 : 7));
		const bob = Math.abs(walk) * (panicked ? 3.5 : 1.8);
		const scarfWave = Math.sin(time * (panicked ? 22 : 5.5)) * (panicked ? 10 : 5);
		const broomSwing = Math.sin(time * (panicked ? 19 : 7)) * (panicked ? 0.48 : 0.24);
		const attack = !!(infoOrEnemy && (
			infoOrEnemy.isStrike || infoOrEnemy.hasSlashArc || infoOrEnemy.hasShockwave ||
			infoOrEnemy.phase === 3 || infoOrEnemy.phase === 4
		));
		const meltPulse = (Math.sin(time * 3.2) + 1) * 0.5;

		this.drawShadow(ctx, x, y + 2, 31);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * squashX, squashY);

		// Thin icy puddle and water ripples underneath the melted lower body.
		ctx.save();
		ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
		ctx.strokeStyle = '#1678A6';
		ctx.lineWidth = 1.7;
		ctx.beginPath();
		ctx.ellipse(0, 22, 29 + meltPulse * 2.8, 5.8 + meltPulse, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.ellipse(-3, 22, 15 + meltPulse * 3, 2.2, 0, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();

		// Trailing, red striped scarf with a rough, wet fringe.
		ctx.save();
		ctx.translate(-10, -31);
		ctx.rotate(-0.1 + scarfWave * 0.012);
		this.setupPath(ctx, '#C62828', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(4, -2);
		ctx.quadraticCurveTo(-12, -13, -35, -9 + scarfWave * 0.22);
		ctx.lineTo(-29, 3);
		ctx.quadraticCurveTo(-15, 0, 3, 5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#F97316';
		ctx.lineWidth = 3.4;
		ctx.beginPath();
		ctx.moveTo(-5, -5); ctx.lineTo(-11, 2);
		ctx.moveTo(-16, -7); ctx.lineTo(-22, 1);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		for (let i = 0; i < 5; i++) {
			const fringeX = -30 + i * 4.2;
			ctx.beginPath();
			ctx.moveTo(fringeX, 0);
			ctx.lineTo(fringeX - 2, 6 + (i % 2) * 2);
			ctx.stroke();
		}
		ctx.restore();

		// A lumpy, sagging body of slushy snow.
		this.setupPath(ctx, '#D9EFFB', COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-26, 17);
		ctx.bezierCurveTo(-34, 14, -32, 4, -25, 0);
		ctx.bezierCurveTo(-24, -10, -11, -14, -2, -8);
		ctx.bezierCurveTo(9, -17, 23, -9, 22, 2);
		ctx.bezierCurveTo(32, 4, 32, 15, 23, 18);
		ctx.bezierCurveTo(13, 22, 8, 18, 2, 21);
		ctx.bezierCurveTo(-7, 23, -13, 19, -20, 21);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#FFFFFF';
		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(-22, 2); ctx.quadraticCurveTo(-12, -7, -4, -3);
		ctx.moveTo(5, -7); ctx.quadraticCurveTo(17, -10, 21, 1);
		ctx.moveTo(-18, 12); ctx.quadraticCurveTo(-8, 15, -3, 12);
		ctx.stroke();
		ctx.strokeStyle = '#9BD5F4';
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(-25, 7); ctx.quadraticCurveTo(-19, 13, -22, 18);
		ctx.moveTo(19, 8); ctx.quadraticCurveTo(23, 12, 21, 17);
		ctx.stroke();

		// Melting arms, rounded drips and tiny twig fingers.
		ctx.save();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		this.setupPath(ctx, '#EAF7FD', COLORS.ink, 4.2);
		ctx.beginPath();
		ctx.moveTo(-10, -17);
		ctx.quadraticCurveTo(-18, -24, -22, -35);
		ctx.quadraticCurveTo(-28, -41, -30, -32);
		ctx.lineTo(-33, -21);
		ctx.moveTo(17, -14);
		ctx.quadraticCurveTo(25, -20, 26, -31);
		ctx.quadraticCurveTo(32, -37, 35, -28);
		ctx.lineTo(34, -14);
		ctx.stroke();
		ctx.strokeStyle = '#4A2B18';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-30, -21); ctx.lineTo(-35, -26);
		ctx.moveTo(-30, -21); ctx.lineTo(-35, -19);
		ctx.moveTo(34, -14); ctx.lineTo(39, -18);
		ctx.moveTo(34, -14); ctx.lineTo(39, -11);
		ctx.stroke();
		ctx.restore();

		// Three dark, uneven coal buttons down the slushy torso.
		ctx.fillStyle = '#252B2C';
		ctx.strokeStyle = '#111827';
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(1, 1, 3.1, 0, Math.PI * 2);
		ctx.arc(5, 8, 3.3, 0, Math.PI * 2);
		ctx.arc(2, 15, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#5B6260';
		ctx.beginPath();
		ctx.arc(0, 0.1, 0.8, 0, Math.PI * 2);
		ctx.arc(4, 7.2, 0.8, 0, Math.PI * 2);
		ctx.fill();

		// Large head, narrowed angry eyes and a wicked grin.
		this.setupPath(ctx, '#F7FCFF', COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-15, -31);
		ctx.bezierCurveTo(-20, -44, -11, -57, 1, -56);
		ctx.bezierCurveTo(13, -58, 22, -47, 20, -36);
		ctx.bezierCurveTo(19, -28, 10, -24, 1, -26);
		ctx.bezierCurveTo(-7, -24, -13, -26, -15, -31);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 3;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(-11, -43); ctx.lineTo(-3, -40);
		ctx.moveTo(5, -40); ctx.lineTo(14, -45);
		ctx.stroke();
		ctx.fillStyle = '#111827';
		ctx.beginPath();
		ctx.arc(-7, -41, 2.8, 0, Math.PI * 2);
		ctx.arc(9, -42, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.arc(-7.8, -42, 0.8, 0, Math.PI * 2);
		ctx.arc(8.2, -43, 0.8, 0, Math.PI * 2);
		ctx.fill();

		// Segmented orange carrot nose.
		this.setupPath(ctx, '#F97316', COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(1, -37);
		ctx.quadraticCurveTo(12, -40, 27, -33);
		ctx.lineTo(10, -29);
		ctx.lineTo(2, -32);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#9A3412';
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(8, -36); ctx.lineTo(9, -32);
		ctx.moveTo(14, -35); ctx.lineTo(15, -31);
		ctx.moveTo(20, -34); ctx.lineTo(21, -32);
		ctx.stroke();
		ctx.fillStyle = '#1B1714';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.7;
		ctx.beginPath();
		ctx.moveTo(-8, -31);
		ctx.quadraticCurveTo(0, -25, 11, -31);
		ctx.lineTo(7, -24);
		ctx.quadraticCurveTo(-1, -21, -6, -26);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#FFF1C7';
		ctx.beginPath();
		ctx.moveTo(-5, -29); ctx.lineTo(-2, -28); ctx.lineTo(-3, -25);
		ctx.moveTo(0, -27); ctx.lineTo(3, -28); ctx.lineTo(3, -24);
		ctx.moveTo(5, -29); ctx.lineTo(7, -30); ctx.lineTo(6, -26);
		ctx.fill();

		// Battered moss-green hat with a ragged cap of fresh snow and rusty patch.
		ctx.save();
		ctx.translate(0, -53);
		ctx.rotate(-0.1 + Math.sin(time * 2.8) * 0.035);
		this.setupPath(ctx, '#3F5140', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-17, 2);
		ctx.lineTo(-13, -13);
		ctx.quadraticCurveTo(-5, -20, 7, -16);
		ctx.lineTo(15, -9);
		ctx.lineTo(17, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#65765B';
		ctx.lineWidth = 2.3;
		ctx.beginPath();
		ctx.moveTo(-10, -10); ctx.lineTo(8, -13);
		ctx.moveTo(-7, -3); ctx.lineTo(12, -6);
		ctx.stroke();
		this.setupPath(ctx, '#B45309', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.moveTo(-11, -12); ctx.lineTo(-5, -17); ctx.lineTo(0, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, '#F8FCFF', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-19, -12);
		ctx.quadraticCurveTo(-17, -23, -6, -20);
		ctx.quadraticCurveTo(1, -25, 8, -18);
		ctx.quadraticCurveTo(17, -22, 18, -12);
		ctx.quadraticCurveTo(13, -8, 6, -11);
		ctx.quadraticCurveTo(-2, -8, -9, -11);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Long broom with a fan of straw, wrapped with dark twine; it sweeps on attack.
		ctx.save();
		ctx.translate(19, -7);
		ctx.rotate(broomSwing + (attack ? -0.72 : panicked ? -0.38 : 0.12));
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 5.8;
		ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(10, -44); ctx.stroke();
		ctx.strokeStyle = '#A66A32';
		ctx.lineWidth = 3.6;
		ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(10, -44); ctx.stroke();
		ctx.strokeStyle = '#E5B76B';
		ctx.lineWidth = 1;
		ctx.beginPath(); ctx.moveTo(1, 7); ctx.lineTo(9, -39); ctx.stroke();
		this.setupPath(ctx, '#C98524', COLORS.ink, 1.9);
		ctx.beginPath();
		ctx.moveTo(7, -42); ctx.lineTo(-1, -58); ctx.lineTo(4, -54);
		ctx.lineTo(5, -66); ctx.lineTo(10, -55); ctx.lineTo(15, -66);
		ctx.lineTo(14, -54); ctx.lineTo(23, -60); ctx.lineTo(18, -47);
		ctx.lineTo(13, -42); ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = '#5B3418';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(6, -48); ctx.lineTo(17, -48);
		ctx.moveTo(7, -45); ctx.lineTo(16, -45);
		ctx.stroke();
		ctx.restore();

		// Animated water droplets run off the hat brim, cheeks, arms and melted hem.
		ctx.fillStyle = '#7DD3FC';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		for (let i = 0; i < 5; i++) {
			const phase = (time * (1.15 + i * 0.14) + i * 0.23) % 1;
			const dropX = [-15, -7, 9, 20, 29][i];
			const anchorY = [-18, -6, -17, -9, -13][i];
			const dropY = anchorY + phase * (7 + 5 * meltPulse);
			const radius = 1.1 + (1 - phase) * 1.35;
			ctx.beginPath();
			ctx.moveTo(dropX, dropY - radius);
			ctx.quadraticCurveTo(dropX + radius * 1.5, dropY, dropX, dropY + radius * 1.8);
			ctx.quadraticCurveTo(dropX - radius * 1.2, dropY, dropX, dropY - radius);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		if (panicked) {
			ctx.strokeStyle = '#38BDF8';
			ctx.lineWidth = 1.8;
			ctx.beginPath();
			ctx.moveTo(-28, -18); ctx.lineTo(-35, -23);
			ctx.moveTo(-30, -11); ctx.lineTo(-39, -12);
			ctx.stroke();
		}
		ctx.restore();
	},
	drawFrostlingAura(ctx: any, x: number, y: number, time: number, overlapCount = 1) {
		ctx.save();
		ctx.translate(x, y);

		const safeOverlap = Math.max(1, overlapCount);
		const fillAtten = 1 / Math.max(1, safeOverlap * 0.9);
		const ringAtten = 1 / Math.max(1, Math.sqrt(safeOverlap));

		const frostAuraPulse = Math.sin(time * 3.5) * 3.5;
		// Soft translucent double-concentric aura with overlap attenuation so packs at night never white out
		ctx.fillStyle = `rgba(147, 229, 255, ${(0.045 * fillAtten).toFixed(3)})`;
		ctx.beginPath();
		ctx.arc(0, 0, FROSTLING_AURA_RADIUS + frostAuraPulse + 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = `rgba(125, 211, 252, ${(0.028 * fillAtten).toFixed(3)})`;
		ctx.beginPath();
		ctx.arc(0, 0, FROSTLING_AURA_RADIUS + frostAuraPulse, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = `rgba(186, 230, 253, ${(0.36 * ringAtten).toFixed(3)})`;
		ctx.lineWidth = 1.3;
		ctx.setLineDash([6, 8]);
		ctx.beginPath();
		ctx.arc(0, 0, FROSTLING_AURA_RADIUS - 3 + frostAuraPulse, 0, Math.PI * 2);
		ctx.stroke();
		ctx.setLineDash([]);

		const numCrystals = 6;
		ctx.fillStyle = `rgba(224, 242, 254, ${(0.5 * ringAtten).toFixed(3)})`;
		for (let c = 0; c < numCrystals; c++) {
			const cAngle = (c / numCrystals) * Math.PI * 2 + time * 0.6;
			const cDist = FROSTLING_AURA_RADIUS * 0.78 + Math.sin(time * 3 + c) * 4;
			const cx = Math.cos(cAngle) * cDist;
			const cy = Math.sin(cAngle) * cDist;
			ctx.beginPath();
			ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawFrostling(ctx: any, x: number, y: number, time: number, vx: number, panicked: boolean, skipAura = false) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 16 : 8;
		const bob = Math.sin(time * walkSpeed) * (panicked ? 3.5 : 2.0);
		const legSwing = Math.sin(time * walkSpeed) * (panicked ? 10 : 6);
		const shiver = Math.sin(time * 26) * 0.7;
		const sniffleCycle = (time * 1.5) % 4;
		const handkerchiefDab = sniffleCycle < 1.4 ? Math.sin((sniffleCycle / 1.4) * Math.PI) * 2.5 : 0;

		// -----------------------------------------------------------------
		// 1. FROST AURA (Jinovatková aura dle herního dosahu)
		// -----------------------------------------------------------------
		if (!skipAura) {
			this.drawFrostlingAura(ctx, x, y, time, 1);
		}

		// -----------------------------------------------------------------
		// 2. THE ZIMNÍ SKŘÍTEK CHARACTER BODY (Předloha dle ilustrace)
		// -----------------------------------------------------------------
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir * 1.15, 1.15);

		this.drawShadow(ctx, 0, 16, 12);

		// 2a. Boots & Legs (Teplé kožíškové botky se sněhem a záplatované kalhoty)
		this.drawBentLimb(ctx, -5, 4, -legSwing - 3, 11, -legSwing - 3, 17, "#5B4433", 6);
		this.setupPath(ctx, "#543C28", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(-legSwing - 3, 17, 5.5, 3.8, -0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#F8FAFC";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.ellipse(-legSwing - 3, 13.5, 4, 1.8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.ellipse(-legSwing - 5, 16, 2.5, 1.4, -0.2, 0, Math.PI * 2);
		ctx.fill();

		this.drawBentLimb(ctx, 4, 4, legSwing + 3, 11, legSwing + 3, 17, "#5B4433", 6);
		ctx.fillStyle = "#C2410C";
		ctx.fillRect(legSwing + 1, 9, 3.5, 3);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 0.8;
		ctx.strokeRect(legSwing + 1, 9, 3.5, 3);

		this.setupPath(ctx, "#543C28", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(legSwing + 4, 17, 6, 4, 0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#F8FAFC";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.ellipse(legSwing + 4, 13.5, 4, 1.8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.ellipse(legSwing + 6.5, 16, 2.8, 1.5, 0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#E0F2FE";
		ctx.strokeStyle = "#0891B2";
		ctx.lineWidth = 0.8;
		ctx.beginPath();
		ctx.moveTo(legSwing + 2, 17);
		ctx.lineTo(legSwing + 2.5, 21);
		ctx.lineTo(legSwing + 3.2, 17);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 2b. Coat with fleece hem & rope belt
		this.setupPath(ctx, "#6E5540", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-11, -5);
		ctx.quadraticCurveTo(-14, 2, -12, 8);
		ctx.lineTo(12, 8);
		ctx.quadraticCurveTo(14, 2, 11, -5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#F1F5F9", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(-12, 7);
		for (let s = -12; s <= 12; s += 3.5) {
			ctx.quadraticCurveTo(s + 1.75, 10.5, s + 3.5, 7);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#D97706";
		ctx.fillRect(-7, 2, 3.5, 3.5);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 0.8;
		ctx.strokeRect(-7, 2, 3.5, 3.5);

		ctx.strokeStyle = "#FDE68A";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-11, 2);
		ctx.quadraticCurveTo(0, 3.5, 11, 2);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 0.8;
		ctx.stroke();
		ctx.fillStyle = "#FDE68A";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(1, 3.5, 1.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(1, 4.5);
		ctx.lineTo(2.5, 9);
		ctx.moveTo(0.5, 4.5);
		ctx.lineTo(-0.5, 8.5);
		ctx.stroke();

		// 2c. Knitted Red Scarf
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.ellipse(0, -6, 11.5, 4.5, 0.05, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		const scarfWave = Math.sin(time * walkSpeed * 0.7) * 2;
		this.setupPath(ctx, "#DC2626", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(5, -4);
		ctx.quadraticCurveTo(11, 0, 12 + scarfWave, 6);
		ctx.lineTo(14 + scarfWave, 14);
		ctx.lineTo(9 + scarfWave, 14);
		ctx.quadraticCurveTo(8, 6, 2, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#991B1B";
		ctx.lineWidth = 1.2;
		for (let f = 9; f <= 14; f += 1.5) {
			ctx.beginPath();
			ctx.moveTo(f + scarfWave, 14);
			ctx.lineTo(f + scarfWave, 16.5);
			ctx.stroke();
		}
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(8, 2, 0.9, 0, Math.PI * 2);
		ctx.arc(11 + scarfWave, 8, 1.0, 0, Math.PI * 2);
		ctx.arc(3, -6, 0.8, 0, Math.PI * 2);
		ctx.fill();

		// 2d. Head & Face
		ctx.save();
		ctx.translate(shiver, -13);

		// Fluffy snowy beard
		this.setupPath(ctx, "#F1F5F9", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-11, -3);
		ctx.quadraticCurveTo(-14, 2, -10, 6);
		ctx.quadraticCurveTo(-12, 10, -6, 11);
		ctx.quadraticCurveTo(-2, 13, 2, 11);
		ctx.quadraticCurveTo(8, 12, 11, 8);
		ctx.quadraticCurveTo(14, 3, 11, -2);
		ctx.quadraticCurveTo(7, -1, 3, 2);
		ctx.quadraticCurveTo(-5, 2, -11, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "rgba(186, 230, 253, 0.5)";
		ctx.beginPath();
		ctx.arc(-5, 7, 3, 0, Math.PI * 2);
		ctx.arc(2, 8, 3.5, 0, Math.PI * 2);
		ctx.fill();

		// Elf ear
		this.setupPath(ctx, "#FED7AA", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-8, -4);
		ctx.quadraticCurveTo(-15, -7, -17, -5);
		ctx.quadraticCurveTo(-13, -2, -8, -1);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FB7185";
		ctx.beginPath();
		ctx.ellipse(-12, -4, 2.5, 1.2, -0.4, 0, Math.PI * 2);
		ctx.fill();

		// Face base
		this.setupPath(ctx, "#FED7AA", COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.arc(0, -5, 8.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Rosy cheeks
		ctx.fillStyle = "rgba(244, 63, 94, 0.45)";
		ctx.beginPath();
		ctx.arc(-4, -3, 3, 0, Math.PI * 2);
		ctx.arc(4, -3, 3, 0, Math.PI * 2);
		ctx.fill();

		// Cold red nose
		this.setupPath(ctx, "#EF4444", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(2, -4, 3.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
		ctx.beginPath();
		ctx.arc(1.2, -5.2, 0.9, 0, Math.PI * 2);
		ctx.fill();

		// Eyes
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.ellipse(-2.5, -6.5, 1.6, 2.0, -0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(-2.9, -7.2, 0.7, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.ellipse(4.2, -6.5, 1.5, 1.9, 0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(4.6, -7.2, 0.6, 0, Math.PI * 2);
		ctx.fill();

		// Eyebrows
		ctx.strokeStyle = "#475569";
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(-4.5, -9.5);
		ctx.quadraticCurveTo(-2.5, -10.5, -0.5, -9);
		ctx.moveTo(2.5, -9.5);
		ctx.quadraticCurveTo(4.5, -10.5, 6.5, -9);
		ctx.stroke();

		// Handkerchief
		ctx.save();
		ctx.translate(6, -3 - handkerchiefDab);
		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.moveTo(-2, -3);
		ctx.lineTo(4, -5);
		ctx.lineTo(7, 2);
		ctx.lineTo(2, 6);
		ctx.lineTo(-3, 3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#3B82F6";
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		ctx.moveTo(3, -4);
		ctx.lineTo(6, 1.5);
		ctx.lineTo(1.5, 5);
		ctx.stroke();

		// Mitten
		this.setupPath(ctx, "#4B6B82", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.arc(4, 1, 3.0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Floppy hat
		this.setupPath(ctx, "#6E5540", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-13, -8);
		ctx.quadraticCurveTo(-6, -11, 4, -9);
		ctx.quadraticCurveTo(12, -8, 14, -6);
		ctx.lineTo(11, -3);
		ctx.quadraticCurveTo(0, -6, -11, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#5B4433", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-10, -9);
		ctx.quadraticCurveTo(-14, -18, -9, -24);
		ctx.quadraticCurveTo(-4, -28, 2, -22);
		ctx.quadraticCurveTo(8, -17, 10, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#C2410C";
		ctx.fillRect(-6, -19, 4, 3.5);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 0.8;
		ctx.strokeRect(-6, -19, 4, 3.5);

		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(-11, -19);
		ctx.quadraticCurveTo(-9, -26, -4, -26);
		ctx.quadraticCurveTo(1, -26, 3, -20);
		ctx.quadraticCurveTo(0, -21, -5, -20);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#FFFFFF";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.ellipse(-2, -9.5, 9, 2.2, 0.05, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		const icicleXs = [-10, -6, -2, 2, 7, 11];
		const icicleLens = [5, 7, 4, 6, 8, 4.5];
		for (let i = 0; i < icicleXs.length; i++) {
			const ix = icicleXs[i];
			const ilen = icicleLens[i] + Math.sin(time * 3 + i) * 0.5;
			this.setupPath(ctx, "#E0F2FE", "#0891B2", 1.0);
			ctx.beginPath();
			ctx.moveTo(ix - 1.2, -6);
			ctx.lineTo(ix, -6 + ilen);
			ctx.lineTo(ix + 1.2, -6);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = "#FFFFFF";
			ctx.lineWidth = 0.6;
			ctx.beginPath();
			ctx.moveTo(ix - 0.4, -5);
			ctx.lineTo(ix, -6 + ilen * 0.7);
			ctx.stroke();
		}

		ctx.restore();

		// -----------------------------------------------------------------
		// 3. MAGICAL FROST CROOK STAFF (Mrazivá berla s ledovým vírem)
		// -----------------------------------------------------------------
		ctx.save();
		const staffSway = Math.sin(time * walkSpeed * 0.5) * 0.08;
		ctx.translate(-15, -4);
		ctx.rotate(staffSway);

		this.setupPath(ctx, "#4B6B82", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(0, 3, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 4.5;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(0, 20);
		ctx.quadraticCurveTo(-1.5, 5, 0, -10);
		ctx.quadraticCurveTo(1.5, -20, -2, -28);
		ctx.stroke();
		ctx.strokeStyle = "#8C582B";
		ctx.lineWidth = 2.8;
		ctx.stroke();

		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 4.5;
		ctx.beginPath();
		ctx.moveTo(-2, -28);
		ctx.bezierCurveTo(-5, -34, 4, -40, 8, -34);
		ctx.bezierCurveTo(10, -30, 8, -24, 3, -26);
		ctx.stroke();
		ctx.strokeStyle = "#8C582B";
		ctx.lineWidth = 2.8;
		ctx.stroke();

		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.3);
		ctx.beginPath();
		ctx.moveTo(-4, -32);
		ctx.quadraticCurveTo(3, -41, 9, -35);
		ctx.quadraticCurveTo(5, -36, -2, -31);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		const staffIcicles = [
			{ x: -2, len: 6 },
			{ x: 3, len: 8 },
			{ x: 7, len: 5 }
		];
		for (const si of staffIcicles) {
			this.setupPath(ctx, "#E0F2FE", "#0891B2", 0.9);
			ctx.beginPath();
			ctx.moveTo(si.x - 1, -29);
			ctx.lineTo(si.x, -29 + si.len);
			ctx.lineTo(si.x + 1, -29);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.save();
		ctx.translate(3.5, -31);
		const magicRot = time * 2.5;
		const magicPulse = 1 + Math.sin(time * 5) * 0.15;
		ctx.scale(magicPulse, magicPulse);

		const staffGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
		staffGlow.addColorStop(0, "rgba(224, 242, 254, 0.95)");
		staffGlow.addColorStop(0.4, "rgba(56, 189, 248, 0.65)");
		staffGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
		ctx.fillStyle = staffGlow;
		ctx.beginPath();
		ctx.arc(0, 0, 14, 0, Math.PI * 2);
		ctx.fill();

		for (let sIdx = 0; sIdx < 2; sIdx++) {
			ctx.save();
			ctx.rotate(magicRot * (sIdx === 0 ? 1 : -1.2) + sIdx * 0.8);
			const starRadius = 5.5 - sIdx * 1.5;
			ctx.fillStyle = sIdx === 0 ? "#FFFFFF" : "#BAE6FD";
			ctx.beginPath();
			ctx.moveTo(0, -starRadius);
			ctx.quadraticCurveTo(0.8, -0.8, starRadius, 0);
			ctx.quadraticCurveTo(0.8, 0.8, 0, starRadius);
			ctx.quadraticCurveTo(-0.8, 0.8, -starRadius, 0);
			ctx.quadraticCurveTo(-0.8, -0.8, 0, -starRadius);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}

		for (let p = 0; p < 4; p++) {
			const pAngle = (p / 4) * Math.PI * 2 + time * 3;
			const pDist = 8 + Math.sin(time * 4 + p) * 3;
			const px = Math.cos(pAngle) * pDist;
			const py = Math.sin(pAngle) * pDist;
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc(px, py, 1.1, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		ctx.restore();

		ctx.restore();
	},
	drawBludicka(ctx, x, y, time, vx, panicked) {
		const bob = Math.sin(time * (panicked ? 14 : 6)) * (panicked ? 8 : 6);
		ctx.save();
		ctx.translate(x, y + bob);
		const glowColor = panicked ? "rgba(249, 115, 22, 0.35)" : "rgba(103, 232, 249, 0.35)";
		const r = panicked ? 9 : 7;
		// Soft halo without costly shadowBlur
		ctx.fillStyle = glowColor;
		ctx.beginPath();
		ctx.arc(0, 0, r + 7, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = panicked ? "rgba(239, 68, 68, 0.95)" : "rgba(217, 160, 54, 0.9)";
		ctx.beginPath();
		ctx.arc(0, 0, r, 0, Math.PI * 2);
		ctx.fill();
		if (panicked) for (let i = 0; i < 3; i++) {
			const pt = (time * 5 + i * .33) % 1;
			ctx.fillStyle = "#FDE047";
			ctx.beginPath();
			ctx.arc(-12 - pt * 20, Math.sin(time * 10 + i) * 6, 2 - pt, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawDrevorubec(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const walkSpeed = panicked ? 22 : 10;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.3, 1.3);
		if (panicked) {
			ctx.rotate(.11);
			this.drawRunDust(ctx, -8, 26, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -7, 6, 20);
			const leg2 = this.getRunLegCycle(legPhase + .5, 7, 6, 20);
			this.drawBentLimb(ctx, -7, 6, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#3E2723", 6);
			this.drawBentLimb(ctx, 7, 6, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#3E2723", 6);
		} else {
			const legSwing = Math.sin(time * walkSpeed) * 11;
			this.drawLimb(ctx, -7, 6, -legSwing, 23, "#3E2723", 6);
			this.drawLimb(ctx, 7, 6, legSwing, 23, "#3E2723", 6);
		}
		this.setupPath(ctx, "#B91C1C", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 2, 16, 18, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D97706", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -20, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(8, 8);
			ctx.lineTo(-20, -24);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				// Cocked axe high behind head
				ctx.moveTo(4, 10);
				ctx.lineTo(-24, -30);
			} else {
				// Chopping downward forward into target
				ctx.moveTo(6, 12);
				ctx.lineTo(36, 16);
			}
		} else {
			ctx.moveTo(12, 12);
			ctx.lineTo(24, -26);
		}
		ctx.stroke();
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2);
		ctx.beginPath();
		if (panicked) {
			ctx.moveTo(-18, -26);
			ctx.lineTo(-30, -32);
			ctx.lineTo(-30, -18);
		} else if (attackInfo && attackInfo.isActive) {
			if (attackInfo.isWindup) {
				ctx.moveTo(-22, -32);
				ctx.lineTo(-36, -36);
				ctx.lineTo(-34, -22);
			} else {
				ctx.moveTo(34, 14);
				ctx.lineTo(46, 8);
				ctx.lineTo(46, 24);
			}
		} else {
			ctx.moveTo(22, -28);
			ctx.lineTo(34, -34);
			ctx.lineTo(34, -20);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const glanceBack = panicked && Math.sin(time * 3.5) > .6;
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 4, -21, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawCertik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.08;
		const bounce = Math.abs(Math.sin(time * (panicked ? 24 : 14))) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * (panicked ? 24 : 14)) * 10;
		const tailWag = Math.sin(time * 18) * 12;

		this.drawShadow(ctx, x, y, 18 * scale);
		ctx.save();
		ctx.translate(x, y - bounce);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -8, 20, time);
			this.drawPanicDrops(ctx, 4, -24, time);
		}

		// Devil tail with spade barb
		ctx.strokeStyle = '#18181B';
		ctx.lineWidth = 2.8;
		ctx.beginPath();
		ctx.moveTo(-6, 4);
		ctx.quadraticCurveTo(-18, 0 + tailWag, -22, -10 + tailWag);
		ctx.stroke();
		this.setupPath(ctx, '#DC2626', COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(-22, -10 + tailWag);
		ctx.lineTo(-28, -14 + tailWag);
		ctx.lineTo(-25, -7 + tailWag);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Cloven-hoofed legs in striped red & black breeches
		this.drawLimb(ctx, -5, 6, -5 - legSwing, 22, '#DC2626', 4);
		this.drawLimb(ctx, 5, 6, 5 + legSwing, 22, '#DC2626', 4);
		// Hooves
		this.setupPath(ctx, '#18181B', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-7 - legSwing, 20, 5, 4);
		ctx.rect(3 + legSwing, 20, 5, 4);
		ctx.fill(); ctx.stroke();

		// Soot-blackened imp body in leather smith apron
		this.setupPath(ctx, '#27272A', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(0, 2, 11, 13, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Smith apron
		this.setupPath(ctx, '#78350F', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-6, -2, 12, 12);
		ctx.fill(); ctx.stroke();

		// Arms holding authentic blacksmith's hand bellows (kovářský měch)
		const bellowsPump = Math.sin(time * 12) * 3;
		this.drawBentLimb(ctx, -6, 0, -12, 4, -8, 12, '#27272A', 3.5);
		this.drawBentLimb(ctx, 6, 0, 14, 2 + bellowsPump, 18, 10 + bellowsPump, '#27272A', 3.5);

		// BLACKSMITH BELLOWS (kovářský měch)
		ctx.save();
		ctx.translate(14, 8 + bellowsPump * 0.5);
		// Bellows wooden handles & ribbed chamber
		this.setupPath(ctx, '#B45309', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-6, -4 - bellowsPump * 0.4);
		ctx.lineTo(8, -1);
		ctx.lineTo(8, 5);
		ctx.lineTo(-6, 8 + bellowsPump * 0.4);
		ctx.closePath();
		ctx.fill(); ctx.stroke();
		// Wooden ribs
		ctx.strokeStyle = '#78350F';
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(-2, -2); ctx.lineTo(-2, 6);
		ctx.moveTo(3, -1); ctx.lineTo(3, 5);
		ctx.stroke();
		// Brass nozzle (foukací hubice)
		this.setupPath(ctx, '#F59E0B', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.rect(8, 0, 7, 4);
		ctx.fill(); ctx.stroke();

		// Puffing soot clouds and bright fiery sparks from the nozzle
		ctx.fillStyle = 'rgba(39, 39, 42, 0.7)';
		for (let i = 0; i < 2; i++) {
			const pt = (time * 5 + i * 0.5) % 1;
			ctx.beginPath();
			ctx.arc(17 + pt * 10, 2 - pt * 4, 1.5 + pt * 3, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.fillStyle = '#F97316';
		const spT = (time * 8) % 1;
		ctx.beginPath();
		ctx.arc(18 + spT * 8, 1 - spT * 3, 1.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// Head with cute tuft of hair & ram horns
		this.setupPath(ctx, '#27272A', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.arc(0, -11, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Amber curved ram horns
		this.setupPath(ctx, '#D97706', COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-4, -18);
		ctx.quadraticCurveTo(-12, -26, -15, -19);
		ctx.quadraticCurveTo(-10, -16, -6, -14);
		ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(4, -18);
		ctx.quadraticCurveTo(12, -26, 15, -19);
		ctx.quadraticCurveTo(10, -16, 6, -14);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Black hair tuft
		this.setupPath(ctx, COLORS.ink, COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.moveTo(-2, -19); ctx.lineTo(0, -25); ctx.lineTo(2, -19); ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Mischievous glowing yellow eyes with sharp pupils
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#FBBF24';
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 2, -12, 2.6, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(glanceBack ? -3.5 : 2.5, -12, 1.2, 0, Math.PI * 2);
		ctx.fill();

		// Rosy soot cheek & impish devil grin
		ctx.fillStyle = '#EF4444';
		ctx.beginPath();
		ctx.arc(glanceBack ? -2 : 5, -8, 2, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.arc(glanceBack ? -2 : 3, -7, 3.5, 0.2, Math.PI * 0.85);
		ctx.stroke();

		ctx.restore();
	},
	drawOhnivyMuz(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.32;
		const bob = Math.sin(time * 10) * 3.5;
		const flameWave = Math.sin(time * 16) * 3;

		this.drawShadow(ctx, x, y, 22 * scale);
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -8, 24, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}

		// Burning charcoal legs with orange cracks
		const legSwing = Math.sin(time * 12) * 9;
		this.drawLimb(ctx, -6, 8, -6 - legSwing, 24, '#EA580C', 5);
		this.drawLimb(ctx, 6, 8, 6 + legSwing, 24, '#EA580C', 5);

		// Outer flame aura (layered in red, orange, and golden yellow)
		this.setupPath(ctx, '#DC2626', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(0, -22);
		ctx.quadraticCurveTo(16, -12, 14, 6);
		ctx.quadraticCurveTo(16, 20, 0, 22);
		ctx.quadraticCurveTo(-16, 20, -14, 6);
		ctx.quadraticCurveTo(-16, -12, 0, -22);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Inner blazing orange-yellow core with molten fissures
		this.setupPath(ctx, '#F97316', '#7C2D12', 1.8);
		ctx.beginPath();
		ctx.ellipse(0, 3, 9, 13, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		this.setupPath(ctx, '#FEF08A', 'transparent');
		ctx.beginPath();
		ctx.ellipse(0, 2, 5, 8, 0, 0, Math.PI * 2);
		ctx.fill();

		// Left arm & Right arm holding a blazing pine torch (smolná louč)
		const armBob = Math.sin(time * 12) * 3;
		this.drawBentLimb(ctx, -8, -2, -16, 6, -12, 14, '#EA580C', 4);
		this.drawBentLimb(ctx, 8, -2, 16, 2 + armBob, 20, -8 + armBob, '#EA580C', 4);

		// BLAZING PINE TORCH (smolná louč s plamenem)
		ctx.save();
		ctx.translate(18, -6 + armBob);
		ctx.rotate(-0.35 + (panicked ? Math.sin(time * 20) * 0.3 : 0));
		// Torch shaft
		this.setupPath(ctx, '#451A03', COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-3, -12, 6, 28);
		ctx.fill(); ctx.stroke();
		// Birch bark wrapping
		ctx.strokeStyle = '#D4CEB8';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(-3, -6); ctx.lineTo(3, -4);
		ctx.moveTo(-3, 2); ctx.lineTo(3, 4);
		ctx.stroke();
		// Blazing flame top
		this.setupPath(ctx, '#FBBF24', '#DC2626', 1.8);
		ctx.beginPath();
		ctx.moveTo(-5, -12);
		ctx.quadraticCurveTo(-8, -24, 0, -32 + Math.sin(time * 22) * 3);
		ctx.quadraticCurveTo(8, -24, 5, -12);
		ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// Blazing fire head with flame hair
		this.setupPath(ctx, '#EA580C', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.arc(0, -14, 10, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Flickering fire crown hair
		this.setupPath(ctx, '#FBBF24', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-6, -20);
		ctx.lineTo(-10, -32 + flameWave);
		ctx.lineTo(-2, -22);
		ctx.lineTo(2, -36 - flameWave);
		ctx.lineTo(6, -22);
		ctx.lineTo(11, -30 + flameWave);
		ctx.lineTo(7, -19);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Incandescent eyes glowing white-hot
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		const ox = glanceBack ? -4 : 2;
		ctx.fillStyle = "rgba(251, 191, 36, 0.40)";
		ctx.beginPath();
		ctx.arc(ox, -14, 4.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.arc(ox, -14, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#7C2D12';
		ctx.beginPath();
		ctx.arc(glanceBack ? -3.5 : 2.5, -14, 1.1, 0, Math.PI * 2);
		ctx.fill();

		// Dancing fire sparks around him
		ctx.fillStyle = '#F59E0B';
		for (let i = 0; i < 3; i++) {
			const st = (time * 5 + i * 0.33) % 1;
			const sx = -12 + (i * 12) + Math.sin(st * 6) * 4;
			const sy = -14 - st * 22;
			ctx.beginPath();
			ctx.arc(sx, sy, Math.max(0.6, 2 * (1 - st)), 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawDrab(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.45;
		const bounce = Math.sin(time * (panicked ? 22 : 9)) * 3.5;
		const legSwing = Math.sin(time * (panicked ? 22 : 11)) * 12;

		this.drawShadow(ctx, x, y, 26 * scale);
		ctx.save();
		ctx.translate(x, y + bounce);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -10, 30, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}

		// Dark iron chain tail with spikes
		ctx.strokeStyle = "#27272A";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-8, 4);
		ctx.quadraticCurveTo(-22, 10, -28, -8);
		ctx.stroke();

		// Hoofed legs
		this.drawLimb(ctx, -7, 8, -legSwing, 24, "#27272A", 6);
		this.drawLimb(ctx, 7, 8, legSwing, 24, "#27272A", 6);
		this.setupPath(ctx, "#71717A", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-10, 28 - legSwing * 0.2, 7, 4);
		ctx.rect(4, 28 + legSwing * 0.2, 7, 4);
		ctx.fill();
		ctx.stroke();

		// Torso in blackened iron-studded vest
		this.setupPath(ctx, "#18181B", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Heavy iron chains wrapped diagonally across chest (Pekelné řetězy)
		ctx.strokeStyle = "#94A3B8";
		ctx.lineWidth = 3.2;
		ctx.beginPath();
		ctx.moveTo(-12, -10); ctx.lineTo(12, 10);
		ctx.moveTo(12, -10); ctx.lineTo(-12, 10);
		ctx.stroke();
		ctx.fillStyle = "#E2E8F0";
		[[-6, -5], [0, 0], [6, 5], [6, -5], [-6, 5]].forEach(([lx, ly]) => {
			ctx.beginPath();
			ctx.arc(lx, ly, 1.8, 0, Math.PI * 2);
			ctx.fill();
		});

		// Spiked Chain Whip / Karabáč in right arm
		ctx.save();
		const whipWave = Math.sin(time * (panicked ? 24 : 10)) * 0.3;
		ctx.translate(14, -4);
		ctx.rotate(whipWave + 0.3);
		this.drawLimb(ctx, 0, 0, 8, 12, "#27272A", 5);
		this.setupPath(ctx, "#78350F", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(6, 10, 4, 12);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#451A03";
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(8, 22);
		ctx.quadraticCurveTo(18, 28, 24, 18);
		ctx.stroke();
		this.setupPath(ctx, "#94A3B8", COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.moveTo(24, 18); ctx.lineTo(28, 20); ctx.lineTo(26, 16); ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// Head with warden's horned cap & burning yellow eyes
		this.setupPath(ctx, "#27272A", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -19, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Horns
		this.setupPath(ctx, "#D97706", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-4, -29); ctx.quadraticCurveTo(-14, -42, -6, -45); ctx.lineTo(2, -29); ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(4, -29); ctx.quadraticCurveTo(14, -42, 6, -45); ctx.lineTo(0, -29); ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Fierce yellow eyes
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(4, -20, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#18181B";
		ctx.beginPath();
		ctx.arc(4.5, -20, 1.2, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawZbojnik(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.35;
		const swagger = Math.sin(time * (panicked ? 22 : 11)) * (panicked ? 4 : 2.5);
		const legSwing = Math.sin(time * (panicked ? 22 : 11)) * 12;

		this.drawShadow(ctx, x, y, 22 * scale);
		ctx.save();
		ctx.translate(x, y + swagger);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -10, 26, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}

		// Mountain wool breeches & boots
		this.drawLimb(ctx, -6, 8, -6 - legSwing, 25, '#E5E7EB', 5.5);
		this.drawLimb(ctx, 6, 8, 6 + legSwing, 25, '#E5E7EB', 5.5);
		// Dark leather boots with brass studs
		this.setupPath(ctx, '#451A03', COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-8 - legSwing * 0.1, 23, 7, 5);
		ctx.rect(2 + legSwing * 0.1, 23, 7, 5);
		ctx.fill(); ctx.stroke();

		// Torso in loose white linen shirt with RED EMBROIDERED VEST (lajblík)
		this.setupPath(ctx, '#F3E9D2', COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Red waistcoat (červený lajblík)
		this.setupPath(ctx, '#DC2626', COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-12, -10);
		ctx.lineTo(-4, 8);
		ctx.lineTo(4, 8);
		ctx.lineTo(12, -10);
		ctx.lineTo(8, -12);
		ctx.lineTo(0, -6);
		ctx.lineTo(-8, -12);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Gold embroidery buttons on vest
		ctx.fillStyle = '#F59E0B';
		[[-2, -2], [2, -2], [-2, 3], [2, 3]].forEach(([bx, by]) => {
			ctx.beginPath();
			ctx.arc(bx, by, 1.4, 0, Math.PI * 2);
			ctx.fill();
		});

		// WIDE LEATHER BRIGAND BELT (široký opasek s mosaznými přezkami)
		this.setupPath(ctx, '#78350F', COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-10, 6, 20, 8);
		ctx.fill(); ctx.stroke();
		// 3 brass buckles
		ctx.strokeStyle = '#F59E0B';
		ctx.lineWidth = 1.6;
		[-6, 0, 6].forEach((bx) => {
			ctx.strokeRect(bx - 2, 7, 4, 6);
		});

		// Arms wielding the VALAŠKA
		const isAttacking = attackInfo && attackInfo.isActive;
		ctx.save();
		if (isAttacking) {
			if (attackInfo.isWindup) {
				// Raised high ready to chop
				this.drawBentLimb(ctx, -8, -4, -16, -18, -12, -32, '#F3E9D2', 4);
				this.drawBentLimb(ctx, 8, -4, 4, -18, 6, -30, '#F3E9D2', 4);
				ctx.save();
				ctx.translate(-12, -32);
				ctx.rotate(-0.5);
				// Valaška shaft & brass axehead
				ctx.strokeStyle = '#B45309';
				ctx.lineWidth = 3.2;
				ctx.beginPath();
				ctx.moveTo(0, 36); ctx.lineTo(0, -14);
				ctx.stroke();
				this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2);
				ctx.beginPath();
				ctx.moveTo(-8, -14); ctx.lineTo(6, -14); ctx.lineTo(4, -8); ctx.lineTo(-6, -8); ctx.closePath();
				ctx.fill(); ctx.stroke();
				ctx.restore();
			} else {
				// Chopping down forward
				this.drawBentLimb(ctx, -8, -4, 4, 2, 18, 8, '#F3E9D2', 4);
				this.drawBentLimb(ctx, 8, -4, 14, 4, 24, 12, '#F3E9D2', 4);
				ctx.save();
				ctx.translate(24, 12);
				ctx.rotate(0.4);
				ctx.strokeStyle = '#B45309';
				ctx.lineWidth = 3.2;
				ctx.beginPath();
				ctx.moveTo(-16, 20); ctx.lineTo(18, -18);
				ctx.stroke();
				this.setupPath(ctx, '#CBD5E1', COLORS.ink, 2);
				ctx.beginPath();
				ctx.moveTo(14, -18); ctx.lineTo(26, -14); ctx.lineTo(22, -8); ctx.lineTo(12, -12); ctx.closePath();
				ctx.fill(); ctx.stroke();
				ctx.restore();
			}
		} else {
			// Walking holding valaška upright
			this.drawBentLimb(ctx, -8, -4, -14, 6, -10, 14, '#F3E9D2', 4);
			this.drawBentLimb(ctx, 8, -4, 14, 2, 14, 12, '#F3E9D2', 4);
			ctx.save();
			ctx.translate(14, 4);
			ctx.strokeStyle = '#B45309';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(0, 24); ctx.lineTo(0, -28);
			ctx.stroke();
			// Brass-sheathed axehead
			this.setupPath(ctx, '#CBD5E1', COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.moveTo(-2, -28); ctx.lineTo(10, -26); ctx.lineTo(8, -20); ctx.lineTo(-2, -22); ctx.closePath();
			ctx.fill(); ctx.stroke();
			// Brass collar
			ctx.fillStyle = '#F59E0B';
			ctx.fillRect(-2, -20, 5, 4);
			ctx.restore();
		}
		ctx.restore();

		// Head with fearless eyes, spirited black mustache
		this.setupPath(ctx, COLORS.skin, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -14, 10, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Black dashing mustache
		ctx.strokeStyle = '#18181B';
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-5, -10);
		ctx.quadraticCurveTo(0, -9, 5, -10);
		ctx.quadraticCurveTo(8, -8, 10, -11);
		ctx.stroke();

		// Traditional black valašský klobouk with upturned brim
		this.setupPath(ctx, '#1F2937', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(0, -19, 18, 5, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-10, -19);
		ctx.quadraticCurveTo(0, -30, 10, -19);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Shells / brass coins hat ribbon
		ctx.strokeStyle = '#F59E0B';
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-9, -20); ctx.lineTo(9, -20);
		ctx.stroke();

		// White falcon / hawk feather tilted proudly
		this.setupPath(ctx, '#F9FAFB', COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.moveTo(4, -21);
		ctx.quadraticCurveTo(12, -32, 10, -42);
		ctx.quadraticCurveTo(4, -30, 3, -21);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Keen fearless eyes
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#18181B';
		ctx.beginPath();
		ctx.arc(glanceBack ? -4 : 3, -15, 1.8, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawJiskrivec(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const jitter = Math.sin(time * 36) * (panicked ? 3 : 1.8);
		const hop = Math.abs(Math.sin(time * 20)) * 4;

		this.drawShadow(ctx, x, y, 16);
		ctx.save();
		ctx.translate(x + jitter, y - hop);
		ctx.scale(dir, 1);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -6, 18, time);
			this.drawPanicDrops(ctx, 4, -20, time);
		}

		// Nimble sparking little legs
		const legSwing = Math.sin(time * 22) * 8;
		this.drawLimb(ctx, -4, 6, -4 - legSwing, 18, '#F59E0B', 3);
		this.drawLimb(ctx, 4, 6, 4 + legSwing, 18, '#F59E0B', 3);

		// Radiant golden-yellow spark body
		this.setupPath(ctx, '#FDE047', COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(0, 3, 10, 11, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Stoker leather apron with burn holes
		this.setupPath(ctx, '#78350F', COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.rect(-5, 0, 10, 10);
		ctx.fill(); ctx.stroke();
		// Singe mark
		ctx.fillStyle = '#18181B';
		ctx.beginPath();
		ctx.arc(2, 6, 1.5, 0, Math.PI * 2);
		ctx.fill();

		// Arms holding flint & steel (ocílka a pazourek)
		const strikeWave = Math.sin(time * 24) * 3;
		this.drawBentLimb(ctx, -6, 0, -12, strikeWave, -6, 8 + strikeWave, '#F59E0B', 3);
		this.drawBentLimb(ctx, 6, 0, 12, -strikeWave, 6, 8 - strikeWave, '#F59E0B', 3);

		// Black flint nodule in left hand
		this.setupPath(ctx, '#18181B', '#475569', 1.4);
		ctx.beginPath();
		ctx.ellipse(-6, 8 + strikeWave, 3, 4, 0.4, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Curved iron strike-a-light (ocílka / křesadlo) in right hand
		ctx.strokeStyle = '#64748B';
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.arc(6, 8 - strikeWave, 4, -0.6, Math.PI * 1.2);
		ctx.stroke();

		// Radiant starburst head
		this.setupPath(ctx, '#FEF08A', COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.arc(0, -10, 8, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Bright gold eyes filled with sparks
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		ctx.fillStyle = '#EA580C';
		ctx.beginPath();
		ctx.arc(glanceBack ? -3 : 3, -10, 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#FFFFFF';
		ctx.beginPath();
		ctx.arc(glanceBack ? -2.5 : 3.5, -10, 0.8, 0, Math.PI * 2);
		ctx.fill();

		// HALO OF 5 CRACKLING 4-POINTED SPARKS ORBITING
		ctx.fillStyle = '#F59E0B';
		for (let i = 0; i < 5; i++) {
			const ang = (time * 6 + (i * Math.PI * 2) / 5) % (Math.PI * 2);
			const dist = 14 + (i % 2) * 5;
			const sx = Math.cos(ang) * dist;
			const sy = -10 + Math.sin(ang) * (dist * 0.7);
			ctx.save();
			ctx.translate(sx, sy);
			ctx.rotate(time * 8 + i);
			ctx.fillStyle = i % 2 === 0 ? '#FBBF24' : '#EF4444';
			ctx.beginPath();
			ctx.moveTo(0, -3.5);
			ctx.lineTo(1, -1);
			ctx.lineTo(3.5, 0);
			ctx.lineTo(1, 1);
			ctx.lineTo(0, 3.5);
			ctx.lineTo(-1, 1);
			ctx.lineTo(-3.5, 0);
			ctx.lineTo(-1, -1);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}

		ctx.restore();
	},
	drawOhnivyPes(ctx, x, y, time, vx, panicked, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const runSpeed = panicked ? 28 : 18;
		const bob = Math.abs(Math.sin(time * runSpeed)) * 4.5;
		const flameWave = Math.sin(time * 22) * 2;

		this.drawShadow(ctx, x, y, 26);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * 1.3, 1.3);

		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -14, 20, time);
			this.drawPanicDrops(ctx, 10, -18, time);
		}

		// Fiery legs
		const legSwing = Math.sin(time * runSpeed) * 15;
		this.drawLimb(ctx, -9, 4, -legSwing, 18, '#DC2626', 4.5);
		this.drawLimb(ctx, 9, 4, legSwing, 18, '#DC2626', 4.5);

		// Scorched hot paws leaving glowing red marks
		ctx.fillStyle = '#F59E0B';
		ctx.beginPath();
		ctx.arc(-legSwing, 18, 3, 0, Math.PI * 2);
		ctx.arc(legSwing, 18, 3, 0, Math.PI * 2);
		ctx.fill();

		// Rich fiery crimson/russet hound torso
		this.setupPath(ctx, '#991B1B', COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 12, -0.15, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// ROARING FLAME MANE along the spine
		this.setupPath(ctx, '#F97316', '#DC2626', 1.8);
		ctx.beginPath();
		ctx.moveTo(-12, -8);
		ctx.lineTo(-14, -16 + flameWave);
		ctx.lineTo(-7, -10);
		ctx.lineTo(-5, -20 - flameWave);
		ctx.lineTo(0, -11);
		ctx.lineTo(4, -22 + flameWave);
		ctx.lineTo(8, -12);
		ctx.lineTo(12, -18 - flameWave);
		ctx.lineTo(10, -7);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// FLAMING TORCH TAIL
		ctx.strokeStyle = '#991B1B';
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-16, -2);
		ctx.quadraticCurveTo(-26, -14, -22, -22);
		ctx.stroke();
		// Flaming tail tip
		this.setupPath(ctx, '#FBBF24', '#DC2626', 1.6);
		ctx.beginPath();
		ctx.moveTo(-22, -20);
		ctx.quadraticCurveTo(-32, -26, -26, -34 + flameWave);
		ctx.quadraticCurveTo(-18, -28, -22, -20);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Hound head with bared fiery jaws
		this.setupPath(ctx, '#991B1B', COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(12, -6, 10, 7, 0.2, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Hound ears pinned back / upright
		ctx.beginPath();
		ctx.moveTo(panicked ? 4 : 8, -12);
		ctx.lineTo(panicked ? 7 : 11, -21);
		ctx.lineTo(15, -12);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Bared teeth with licking flames
		this.setupPath(ctx, '#FEF08A', '#DC2626', 1.2);
		ctx.beginPath();
		ctx.moveTo(18, -4);
		ctx.lineTo(24, -2);
		ctx.lineTo(19, 0);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Blazing sulfur-yellow eye with glowing aura
		const glanceBack = panicked && Math.sin(time * 3.5) > 0.6;
		const px = glanceBack ? 8 : 15;
		ctx.fillStyle = "rgba(245, 158, 11, 0.40)";
		ctx.beginPath();
		ctx.arc(px, -8, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#FEF08A';
		ctx.beginPath();
		ctx.arc(px, -8, 2.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#7F1D1D';
		ctx.beginPath();
		ctx.arc(glanceBack ? 7.5 : 15.5, -8, 1.2, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawMlynar(ctx, x, y, time, vx, panicked, isEnraged = false) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 2.4;
		const walkSpeed = panicked ? 24 : isEnraged ? 14 : 9;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * walkSpeed) * (panicked ? 22 : 14);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -14, 38, time);
			this.drawPanicDrops(ctx, 6, -34, time);
		}
		ctx.save();
		ctx.strokeStyle = "#38BDF8";
		ctx.lineWidth = 1.8;
		ctx.fillStyle = "rgba(224, 242, 254, 0.45)";
		ctx.beginPath();
		ctx.ellipse(0, 36, 26 + Math.sin(time * 6) * 3, 9 + Math.cos(time * 6) * 2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		for (let i = 0; i < 4; i++) {
			const dropAng = time * 4 + i * Math.PI / 2;
			const dropR = 24 + Math.sin(time * 7 + i) * 6;
			ctx.fillStyle = "#E0F2FE";
			ctx.beginPath();
			ctx.arc(Math.cos(dropAng) * dropR, 36 + Math.sin(dropAng) * 4, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		ctx.save();
		const wheelX = -18;
		const wheelY = -6;
		const wheelR = 30;
		const wheelAngle = time * (panicked ? -4.5 : isEnraged ? 6 : 2.8);
		if (isEnraged) {
			ctx.fillStyle = "rgba(249, 115, 22, 0.28)";
			ctx.beginPath();
			ctx.arc(wheelX, wheelY, wheelR + 8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.translate(wheelX, wheelY);
		ctx.rotate(wheelAngle);
		this.setupPath(ctx, "#543318", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = isEnraged ? "#451A03" : "#3B2312";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 3.5;
		for (let i = 0; i < 8; i++) {
			const spAng = i * Math.PI / 4;
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(Math.cos(spAng) * wheelR, Math.sin(spAng) * wheelR);
			ctx.stroke();
		}
		for (let i = 0; i < 8; i++) {
			const bAng = i * Math.PI / 4;
			ctx.save();
			ctx.rotate(bAng);
			ctx.translate(28, 0);
			this.setupPath(ctx, isEnraged ? "#9A3412" : "#78350F", COLORS.ink, 2);
			ctx.fillRect(0, -4, 9, 8);
			ctx.strokeRect(0, -4, 9, 8);
			ctx.fillStyle = isEnraged ? "#FDBA74" : "#BAE6FD";
			ctx.beginPath();
			ctx.arc(10, 0, 1.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		this.setupPath(ctx, isEnraged ? "#DC2626" : "#1F2937", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, 0, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = isEnraged ? "#FEF08A" : "#9CA3AF";
		for (let i = 0; i < 4; i++) {
			const rAng = i * Math.PI / 2;
			ctx.beginPath();
			ctx.arc(Math.cos(rAng) * 4.5, Math.sin(rAng) * 4.5, 1.3, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		ctx.save();
		this.setupPath(ctx, "#C8AB83", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-14, 12, 11, 15, -.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-16, -1);
		ctx.lineTo(-11, -1);
		ctx.stroke();
		ctx.strokeStyle = "#451A03";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-14, 8);
		ctx.lineTo(-14, 16);
		ctx.moveTo(-17, 10);
		ctx.lineTo(-11, 14);
		ctx.moveTo(-11, 10);
		ctx.lineTo(-17, 14);
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
		ctx.beginPath();
		ctx.ellipse(-13, 14, 6, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		if (panicked) {
			const legPhase = time * 3.4;
			const leg1 = this.getRunLegCycle(legPhase, -7, 18, 20);
			const leg2 = this.getRunLegCycle(legPhase + .5, 7, 18, 20);
			this.drawBentLimb(ctx, -7, 18, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#2D1B0F", 9);
			this.drawBentLimb(ctx, 7, 18, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#2D1B0F", 9);
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.ellipse(leg1.fx, leg1.fy, 5, 3, 0, 0, Math.PI * 2);
			ctx.ellipse(leg2.fx, leg2.fy, 5, 3, 0, 0, Math.PI * 2);
			ctx.fill();
		} else {
			this.drawLimb(ctx, -7, 18, -8 - legSwing * .45, 36, "#2D1B0F", 9);
			this.drawLimb(ctx, 7, 18, 8 + legSwing * .45, 36, "#2D1B0F", 9);
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.ellipse(-8 - legSwing * .45, 36, 5, 3, 0, 0, Math.PI * 2);
			ctx.ellipse(8 + legSwing * .45, 36, 5, 3, 0, 0, Math.PI * 2);
			ctx.fill();
		}
		this.setupPath(ctx, "#5A3418", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.ellipse(0, 10, 18, 19, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#3E5C38", COLORS.ink, 1.8);
		ctx.fillRect(-14, 4, 8, 8);
		ctx.strokeRect(-14, 4, 8, 8);
		ctx.strokeStyle = "#FEF3C7";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(-12, 6);
		ctx.lineTo(-8, 10);
		ctx.moveTo(-8, 6);
		ctx.lineTo(-12, 10);
		ctx.stroke();
		this.setupPath(ctx, "#26160C", COLORS.ink, 2);
		ctx.fillRect(-17, 14, 34, 6);
		ctx.strokeRect(-17, 14, 34, 6);
		this.setupPath(ctx, "#D97706", COLORS.ink, 2);
		ctx.fillRect(-5, 13, 10, 8);
		ctx.strokeRect(-5, 13, 10, 8);
		this.setupPath(ctx, "#F7F2EA", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-11, 7);
		ctx.lineTo(11, 7);
		ctx.lineTo(13, 27);
		ctx.quadraticCurveTo(0, 31, -13, 27);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "rgba(120, 100, 80, 0.4)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(-4, 10);
		ctx.lineTo(-6, 26);
		ctx.moveTo(4, 10);
		ctx.lineTo(5, 26);
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
		ctx.beginPath();
		ctx.ellipse(0, 19, 8, 7, .2, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#E5B191", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -11, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgba(217, 70, 60, 0.55)";
		ctx.beginPath();
		ctx.arc(-7, -8, 4, 0, Math.PI * 2);
		ctx.arc(7, -8, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
		ctx.beginPath();
		ctx.arc(0, -10, 3, 0, Math.PI * 2);
		ctx.arc(-6, -6, 2.5, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(0, -6);
		ctx.quadraticCurveTo(-7, -9, -15, -4);
		ctx.quadraticCurveTo(-9, -2, 0, -5);
		ctx.quadraticCurveTo(9, -2, 15, -4);
		ctx.quadraticCurveTo(7, -9, 0, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D98967", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(0, -10, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			const glanceBack = Math.sin(time * 3.5) > .6;
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc(glanceBack ? -7 : -3, -13, 4, 0, Math.PI * 2);
			ctx.arc(glanceBack ? 3 : 7, -13, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(glanceBack ? -8 : -2, -13, 1.8, 0, Math.PI * 2);
			ctx.arc(glanceBack ? 2 : 8, -13, 1.8, 0, Math.PI * 2);
			ctx.fill();
		} else if (isEnraged) {
			ctx.fillStyle = "rgba(239, 68, 68, 0.40)";
			ctx.beginPath();
			ctx.arc(-5, -13, 5, 0, Math.PI * 2);
			ctx.arc(5, -13, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#EF4444";
			ctx.beginPath();
			ctx.arc(-5, -13, 3, 0, Math.PI * 2);
			ctx.arc(5, -13, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(-4.5, -13, 1.3, 0, Math.PI * 2);
			ctx.arc(5.5, -13, 1.3, 0, Math.PI * 2);
			ctx.fill();
		} else {
			ctx.fillStyle = "#D97706";
			ctx.beginPath();
			ctx.arc(-5, -13, 2.5, 0, Math.PI * 2);
			ctx.arc(5, -13, 2.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(-4.5, -13, 1.2, 0, Math.PI * 2);
			ctx.arc(5.5, -13, 1.2, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-8, -17);
		ctx.lineTo(-2, -16);
		ctx.moveTo(2, -16);
		ctx.lineTo(8, -17);
		ctx.stroke();
		this.setupPath(ctx, "#F5F5F4", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-13, -19);
		ctx.quadraticCurveTo(0, -25, 13, -19);
		ctx.quadraticCurveTo(16, -34, 4, -36);
		ctx.quadraticCurveTo(-8, -35, -13, -19);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const capSway = Math.sin(time * walkSpeed) * 3;
		ctx.beginPath();
		ctx.moveTo(4, -36);
		ctx.quadraticCurveTo(-14 + capSway, -38, -20 + capSway, -26);
		ctx.lineWidth = 3;
		ctx.stroke();
		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(-21 + capSway, -25, 4.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			this.drawBentLimb(ctx, -10, 4, -18, -14, -10, -26, "#5A3418", 6);
			this.setupPath(ctx, "#E5B191", COLORS.ink, 2);
			ctx.beginPath();
			ctx.arc(-10, -26, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		ctx.save();
		const shovelSway = Math.sin(time * walkSpeed * .8) * .15;
		ctx.translate(14, 5);
		ctx.rotate(shovelSway + .2);
		ctx.strokeStyle = "#78350F";
		ctx.lineWidth = 4.5;
		ctx.beginPath();
		ctx.moveTo(-4, 24);
		ctx.lineTo(12, -32);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(-5, 24);
		ctx.lineTo(11, -32);
		ctx.moveTo(-3, 24);
		ctx.lineTo(13, -32);
		ctx.stroke();
		this.setupPath(ctx, "#D99B61", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(7, -32);
		ctx.lineTo(21, -38);
		ctx.lineTo(28, -24);
		ctx.lineTo(14, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#334155";
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(9, -28);
		ctx.lineTo(25, -34);
		ctx.stroke();
		ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
		ctx.beginPath();
		ctx.ellipse(19, -29, 6, 4, .5, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#E5B191", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(3, -5, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		for (let i = 0; i < 3; i++) {
			const flourX = Math.sin(time * 3 + i * 2) * 22;
			const flourY = -10 + (time * 25 + i * 18) % 45 - 22;
			ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
			ctx.beginPath();
			ctx.arc(flourX, flourY, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawMillstone(ctx, x, y, radius = 22, angle = 0) {
		this.drawShadow(ctx, x, y, radius);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		this.setupPath(ctx, "#9CA3AF", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#6B7280";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, radius * .62, 0, Math.PI * 2);
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		for (let i = 0; i < 8; i++) {
			const gAng = i * Math.PI / 4;
			ctx.beginPath();
			ctx.moveTo(Math.cos(gAng) * (radius * .4), Math.sin(gAng) * (radius * .4));
			ctx.lineTo(Math.cos(gAng + .2) * (radius * .92), Math.sin(gAng + .2) * (radius * .92));
			ctx.stroke();
		}
		const eyeSize = radius * .44;
		this.setupPath(ctx, "#1E293B", COLORS.ink, 2.5);
		ctx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
		ctx.strokeRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize);
		ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
		ctx.beginPath();
		ctx.arc(-radius * .35, -radius * .35, radius * .25, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawWaterWave(ctx, x, y, radius = 26, angle = 0, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		this.setupPath(ctx, "#0284C7", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, 0, radius, -Math.PI * .45, Math.PI * .45, false);
		ctx.quadraticCurveTo(-radius * .3, 0, 0, -radius * .85);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(0, 0, radius + 1, -Math.PI * .4, Math.PI * .4, false);
		ctx.stroke();
		ctx.fillStyle = "#E0F2FE";
		for (let i = 0; i < 5; i++) {
			const sAng = -Math.PI * .35 + i * Math.PI * .7 / 4;
			const sR = radius + 5 + Math.sin(time * 12 + i) * 3;
			ctx.beginPath();
			ctx.arc(Math.cos(sAng) * sR, Math.sin(sAng) * sR, 2.2, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawRollingBoulder(ctx, x, y, radius = 24, angle = 0) {
		this.drawShadow(ctx, x, y, radius);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		this.setupPath(ctx, "#71717A", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#27272A";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-radius * .6, -radius * .2);
		ctx.lineTo(0, radius * .3);
		ctx.lineTo(radius * .7, -radius * .1);
		ctx.moveTo(0, radius * .3);
		ctx.lineTo(-radius * .2, radius * .7);
		ctx.stroke();
		ctx.fillStyle = "#15803D";
		ctx.beginPath();
		ctx.arc(-radius * .35, -radius * .35, radius * .3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
		ctx.beginPath();
		ctx.arc(radius * .25, -radius * .35, radius * .25, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawHellSpark(ctx, x, y, radius = 10, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
		ctx.beginPath();
		ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#FBBF24", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(0, 0, radius * .5, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 2;
		for (let i = 0; i < 4; i++) {
			const fAng = time * 8 + i * Math.PI / 2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(fAng) * radius * .8, Math.sin(fAng) * radius * .8);
			ctx.lineTo(Math.cos(fAng) * (radius + 5), Math.sin(fAng) * (radius + 5));
			ctx.stroke();
		}
		ctx.restore();
	},
	drawWoodShard(ctx, x, y, radius = 12, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		this.setupPath(ctx, "#78350F", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, radius * 1.3, radius * .7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#15803D";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-radius * .5, -radius * .5);
		ctx.lineTo(-radius * .8, -radius * 1.1);
		ctx.moveTo(radius * .2, -radius * .4);
		ctx.lineTo(radius * .1, -radius * 1);
		ctx.moveTo(radius * .4, radius * .4);
		ctx.lineTo(radius * .7, radius * .9);
		ctx.stroke();
		ctx.restore();
	},
	drawBilaPani(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.35;
		const floatBob = Math.sin(time * 3.5) * 5;
		const veilSway = Math.sin(time * 2.8) * 6;
		const hemSway = Math.sin(time * 4) * 4;

		// Soft ethereal lunar glow under ghost
		ctx.save();
		ctx.fillStyle = "rgba(224, 242, 254, 0.30)";
		ctx.beginPath();
		ctx.ellipse(x, y + 26, 20 * scale, 7 * scale, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(186, 230, 253, 0.15)";
		ctx.beginPath();
		ctx.ellipse(x, y + 26, 28 * scale, 11 * scale, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		ctx.save();
		ctx.translate(x, y + floatBob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawPanicDrops(ctx, 4, -32, time);
		}

		// 1. FLOWING WHITE VEIL (Vlající rouška z vysokého čepce)
		this.setupPath(ctx, "rgba(248, 250, 252, 0.85)", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(-4, -36);
		ctx.quadraticCurveTo(-18 + veilSway, -20, -22 + veilSway, 8);
		ctx.quadraticCurveTo(-14, -8, -6, -24);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 2. LONG FLOWING MEDIEVAL GOWN (Dlouhé bílé splývavé šaty)
		const dressGrad = ctx.createLinearGradient(0, -20, 0, 28);
		dressGrad.addColorStop(0, "#FFFFFF");
		dressGrad.addColorStop(0.7, "#F8FAFC");
		dressGrad.addColorStop(1, "rgba(224, 242, 254, 0.5)");
		this.setupPath(ctx, dressGrad, COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(-8, -14);
		ctx.lineTo(-14, 24);
		// Trailing ethereal hem ripples
		ctx.quadraticCurveTo(-8 + hemSway, 28, 0, 25);
		ctx.quadraticCurveTo(8 + hemSway, 28, 14, 24);
		ctx.lineTo(8, -14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Dress folds
		ctx.strokeStyle = "#CBD5E1";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-4, -8); ctx.lineTo(-6, 20);
		ctx.moveTo(3, -8); ctx.lineTo(5, 20);
		ctx.stroke();

		// 3. CASTLE KEY RING AT WAIST (Hradní klíče u pasu)
		ctx.save();
		const keySwing = Math.sin(time * 3.5) * 0.25;
		ctx.translate(8, 2);
		ctx.rotate(keySwing);
		ctx.strokeStyle = "#334155";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, 4, 0, Math.PI * 2);
		ctx.stroke();
		this.setupPath(ctx, "#475569", COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.moveTo(-2, 4); ctx.lineTo(-2, 14); ctx.lineTo(1, 14); ctx.lineTo(1, 11); ctx.lineTo(-1, 11); ctx.lineTo(-1, 4);
		ctx.fill(); ctx.stroke();
		this.setupPath(ctx, "#D97706", COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.moveTo(2, 4); ctx.lineTo(2, 16); ctx.lineTo(5, 16); ctx.lineTo(5, 13); ctx.lineTo(3, 13); ctx.lineTo(3, 4);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// 4. ANGEL SLEEVES & ARMS (Dlouhé rukávy)
		this.setupPath(ctx, "#F1F5F9", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-8, -12);
		ctx.quadraticCurveTo(-14, -2, -8, 6);
		ctx.quadraticCurveTo(0, 8, 4, -2);
		ctx.lineTo(8, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Pale delicate hands
		this.setupPath(ctx, "#F8FAFC", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(2, -2, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 5. PALE HEAD & MEDIEVAL HENNIN (Bledá tvář a vysoký čepec)
		this.setupPath(ctx, "#FFFFFF", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-7, -26);
		ctx.lineTo(0, -42);
		ctx.lineTo(7, -26);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#F8FAFC", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.arc(0, -22, 8.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#1E293B";
		ctx.beginPath();
		ctx.arc(-2.5, -22, 1.8, 0, Math.PI * 2);
		ctx.arc(3.5, -22, 1.8, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "#38BDF8";
		ctx.beginPath();
		ctx.arc(3.5, -18, 1.2, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(244, 114, 182, 0.4)";
		ctx.beginPath();
		ctx.arc(-4, -20, 2, 0, Math.PI * 2);
		ctx.arc(5, -20, 2, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawZbrojnos(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.3;
		const walkSpeed = panicked ? 22 : 9;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * 3;
		const legSwing = Math.sin(time * walkSpeed) * 12;

		this.drawShadow(ctx, x, y, 24 * scale);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -10, 26, time);
			this.drawPanicDrops(ctx, 4, -30, time);
		}

		// 1. LEGS (Nohy v železných botách)
		this.drawLimb(ctx, -6, 6, -legSwing * 0.8, 22, "#334155", 6);
		this.drawLimb(ctx, 6, 6, legSwing * 0.8, 22, "#334155", 6);
		this.setupPath(ctx, "#1E293B", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-10 - legSwing * 0.2, 20, 8, 4);
		ctx.rect(2 + legSwing * 0.2, 20, 8, 4);
		ctx.fill();
		ctx.stroke();

		// 2. HALBERD / POLEAXE IN REAR HAND
		ctx.save();
		ctx.translate(-12, -8);
		ctx.strokeStyle = "#78350F";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(-4, 24);
		ctx.lineTo(16, -42);
		ctx.stroke();
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(14, -42);
		ctx.lineTo(26, -48);
		ctx.lineTo(22, -34);
		ctx.lineTo(12, -36);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(15, -42);
		ctx.lineTo(20, -56);
		ctx.lineTo(17, -42);
		ctx.stroke();
		ctx.restore();

		// 3. TORSO (Prošívanice a kroužková košile s koženým kabátcem)
		this.setupPath(ctx, "#475569", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.rect(-12, -10, 24, 18);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#78350F", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-10, 4, 20, 4);
		ctx.fill();
		ctx.stroke();

		// 4. LARGE PAINTED BOHEMIAN KITE SHIELD (Těžký pavézový štít se znakem)
		ctx.save();
		const shieldBob = Math.sin(time * walkSpeed) * 2;
		ctx.translate(6, -2 + shieldBob);
		this.setupPath(ctx, "#B91C1C", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-10, -18);
		ctx.lineTo(14, -18);
		ctx.lineTo(14, 2);
		ctx.quadraticCurveTo(12, 18, 2, 26);
		ctx.quadraticCurveTo(-8, 18, -10, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = "#F1F5F9";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-8, -16);
		ctx.lineTo(12, 18);
		ctx.stroke();

		ctx.fillStyle = "#E2E8F0";
		[[-8, -16], [12, -16], [12, 0], [2, 22], [-8, 0]].forEach(([rx, ry]) => {
			ctx.beginPath();
			ctx.arc(rx, ry, 1.4, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.restore();

		// 5. HEAD & IRON KETTLE HAT HELMET (Hlava v železném klobouku / šalíři)
		this.setupPath(ctx, "#E2E8F0", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -18, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(-2, -18, 1.8, 0, Math.PI * 2);
		ctx.arc(4, -18, 1.8, 0, Math.PI * 2);
		ctx.fill();

		this.setupPath(ctx, "#64748B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -22, 9, Math.PI, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(0, -21, 15, 3.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	},
	drawBezhlavyRytir(ctx, x, y, time, vx, panicked, isEnraged = false, attackInfo?: EnemyAttackInfo) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 2.45;
		const walkSpeed = panicked ? 24 : isEnraged ? 14 : 8.5;
		const bob = Math.abs(Math.sin(time * walkSpeed)) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * walkSpeed) * (panicked ? 18 : 12);
		const capeFlutter = Math.sin(time * (isEnraged ? 10 : 5)) * 8;

		this.drawShadow(ctx, x, y, 36 * scale);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.1);
			this.drawRunDust(ctx, -14, 38, time);
			this.drawPanicDrops(ctx, 4, -40, time);
		}

		if (isEnraged) {
			ctx.save();
			ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
			ctx.beginPath();
			ctx.ellipse(0, 16, 26, 8, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
			ctx.beginPath();
			ctx.ellipse(0, 16, 36, 12, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		// 1. BILLOWING TATTERED CAPE
		ctx.save();
		this.setupPath(ctx, isEnraged ? "#7F1D1D" : "#1E1B4B", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-10, -18);
		ctx.quadraticCurveTo(-26 + capeFlutter * 0.5, 0, -32 + capeFlutter, 24);
		ctx.lineTo(-24 + capeFlutter, 27);
		ctx.lineTo(-18 + capeFlutter * 0.8, 20);
		ctx.lineTo(-10 + capeFlutter * 0.6, 26);
		ctx.quadraticCurveTo(-14, 6, -6, -16);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// 2. ARMORED GREAVES & SABATONS
		if (panicked) {
			const legPhase = time * 3.6;
			const leg1 = this.getRunLegCycle(legPhase, -7, 10, 22);
			const leg2 = this.getRunLegCycle(legPhase + 0.5, 7, 10, 22);
			this.drawBentLimb(ctx, -7, 10, leg1.kx, leg1.ky, leg1.fx, leg1.fy, "#334155", 7.5);
			this.drawBentLimb(ctx, 7, 10, leg2.kx, leg2.ky, leg2.fx, leg2.fy, "#334155", 7.5);
			this.setupPath(ctx, "#1E293B", COLORS.ink, 2);
			ctx.beginPath();
			ctx.rect(leg1.fx - 4, leg1.fy - 2, 9, 5);
			ctx.rect(leg2.fx - 4, leg2.fy - 2, 9, 5);
			ctx.fill();
			ctx.stroke();
		} else {
			this.drawLimb(ctx, -7, 10, -legSwing * 0.8, 28, "#334155", 7.5);
			this.drawLimb(ctx, 7, 10, legSwing * 0.8, 28, "#334155", 7.5);
			this.setupPath(ctx, "#1E293B", COLORS.ink, 2);
			ctx.beginPath();
			ctx.rect(-11 - legSwing * 0.2, 26, 9, 5);
			ctx.rect(3 + legSwing * 0.2, 26, 9, 5);
			ctx.fill();
			ctx.stroke();
		}

		// 3. BLACKENED STEEL CUIRASS & HERALDIC TABARD
		this.setupPath(ctx, "#1E293B", COLORS.ink, 3.6);
		ctx.beginPath();
		ctx.ellipse(0, 0, 16, 18, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, isEnraged ? "#DC2626" : "#2563EB", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-10, -14);
		ctx.lineTo(-13, 14);
		ctx.lineTo(13, 14);
		ctx.lineTo(10, -14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = "#F8FAFC";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(0, -8); ctx.lineTo(0, 8);
		ctx.moveTo(-7, -2); ctx.lineTo(7, -2);
		ctx.stroke();

		this.setupPath(ctx, "#0F172A", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-12, 10, 24, 5);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#F59E0B";
		ctx.fillRect(-2, 10, 4, 5);

		this.setupPath(ctx, "#475569", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(-14, -14, 6, 7, -0.3, 0, Math.PI * 2);
		ctx.ellipse(14, -14, 6, 7, 0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 4. SEVERED NECK COLLAR & SPECTRAL PHANTOM FLAME
		this.setupPath(ctx, "#0F172A", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, -18, 9, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		const flameFlicker = Math.sin(time * 16) * 2;
		const fGrad = ctx.createLinearGradient(0, -18, 0, -38);
		fGrad.addColorStop(0, isEnraged ? "#DC2626" : "#38BDF8");
		fGrad.addColorStop(0.6, isEnraged ? "#F97316" : "#0284C7");
		fGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
		ctx.fillStyle = fGrad;
		ctx.beginPath();
		ctx.moveTo(-7, -18);
		ctx.quadraticCurveTo(-10 + flameFlicker, -28, 0, -38 + Math.sin(time * 10) * 3);
		ctx.quadraticCurveTo(10 + flameFlicker, -28, 7, -18);
		ctx.closePath();
		ctx.fill();

		for (let i = 0; i < 3; i++) {
			const sPhase = (time * 3 + i * 0.33) % 1;
			ctx.fillStyle = isEnraged ? "#F87171" : "#BAE6FD";
			ctx.beginPath();
			ctx.arc(-4 + i * 4 + Math.sin(time * 8 + i) * 3, -22 - sPhase * 18, 1.6 * (1 - sPhase * 0.5), 0, Math.PI * 2);
			ctx.fill();
		}

		// 5. RIGHT ARM WIELDING HEAVY KNIGHTLY BROADSWORD
		ctx.save();
		const swordSway = Math.sin(time * walkSpeed * 0.8) * 0.15;
		let swordRot = swordSway + 0.3;
		if (attackInfo && attackInfo.isActive && !panicked) {
			swordRot = attackInfo.isWindup ? (-0.85 + Math.sin(time * 30) * 0.08) : 1.25;
		}
		ctx.translate(14, -8);
		ctx.rotate(swordRot);
		this.drawBentLimb(ctx, 0, 0, 10, 6, 16, 2, "#334155", 6);
		this.setupPath(ctx, "#B45309", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(14, -4, 4, 12);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#D97706", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(11, -12, 10, 4);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(14, -12);
		ctx.lineTo(14, -54);
		ctx.lineTo(16, -60);
		ctx.lineTo(18, -54);
		ctx.lineTo(18, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#64748B";
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(16, -14);
		ctx.lineTo(16, -50);
		ctx.stroke();
		ctx.restore();

		// 6. LEFT ARM HOLDING SEVERED HEAD
		ctx.save();
		ctx.translate(-14, -6);
		this.drawBentLimb(ctx, 0, 0, -8, 8, -2, 14, "#334155", 6.5);

		// The Severed Head clutched under arm
		ctx.save();
		ctx.translate(-8, 6);
		ctx.rotate(-0.15 + Math.sin(time * 3) * 0.05);

		this.setupPath(ctx, "#475569", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.arc(0, 0, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(2, 0, 7, -Math.PI * 0.45, Math.PI * 0.45);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = isEnraged ? "#EF4444" : "#38BDF8";
		ctx.beginPath();
		ctx.arc(3, -2, 2.2, 0, Math.PI * 2);
		ctx.arc(3, 3, 2.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(3.5, -2, 0.9, 0, Math.PI * 2);
		ctx.arc(3.5, 3, 0.9, 0, Math.PI * 2);
		ctx.fill();

		this.setupPath(ctx, isEnraged ? "#DC2626" : "#F59E0B", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-10, -6);
		ctx.quadraticCurveTo(-14, -14, -7, -16);
		ctx.lineTo(-4, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.restore();
		ctx.restore();

		ctx.restore();
	},
	drawSnehulak(ctx, x, y, time, vx, panicked, isCharging = false) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.45;
		const walkSpeed = panicked ? 24 : isCharging ? 28 : 10;
		const rollAngle = isCharging ? time * (dir * 9) : Math.sin(time * walkSpeed) * 0.12;
		const bob = isCharging ? Math.abs(Math.sin(time * 20)) * 4 : Math.abs(Math.sin(time * walkSpeed)) * 4;
		const broomSwing = Math.sin(time * (panicked ? 26 : 10)) * (panicked ? 24 : 14);

		this.drawShadow(ctx, x, y, 32 * scale);
		ctx.save();
		ctx.translate(x, y - bob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -14, 28, time);
			this.drawPanicDrops(ctx, 4, -45, time);
		}

		if (isCharging) {
			// CHARGING / AVALANCHE ROLLING BOULDER MODE
			ctx.save();
			ctx.rotate(rollAngle);
			
			const grad = ctx.createRadialGradient(-6, -6, 8, 0, 0, 32);
			grad.addColorStop(0, "#FFFFFF");
			grad.addColorStop(0.7, "#F0F9FF");
			grad.addColorStop(1, "#BAE6FD");
			this.setupPath(ctx, grad, COLORS.ink, 3.6);
			ctx.beginPath();
			ctx.arc(0, 0, 30, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			ctx.strokeStyle = "#93C5FD";
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.arc(0, 0, 20, 0.4, Math.PI * 1.2);
			ctx.stroke();

			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(14, -8, 3.5, 0, Math.PI * 2);
			ctx.arc(-10, 14, 3, 0, Math.PI * 2);
			ctx.arc(-16, -12, 3.5, 0, Math.PI * 2);
			ctx.fill();

			this.setupPath(ctx, "#EA580C", COLORS.ink, 2);
			ctx.beginPath();
			ctx.moveTo(22, 0);
			ctx.lineTo(38, 4);
			ctx.lineTo(24, 7);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.save();
			ctx.translate(0, -30);
			ctx.rotate(0.2);
			this.setupPath(ctx, "#27272A", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.rect(-10, -12, 20, 12);
			ctx.rect(-14, 0, 28, 4);
			ctx.fill();
			ctx.stroke();
			ctx.restore();

			ctx.restore();

			for (let i = 0; i < 3; i++) {
				const pt = (time * 6 + i * 0.33) % 1;
				ctx.fillStyle = "#E0F2FE";
				ctx.beginPath();
				ctx.arc(-26 - pt * 22, 14 - pt * 10, 3 * (1 - pt), 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
			return;
		}

		// --- REGULAR MENACING WADDLE MODE ---
		// 1. Base Snowball (Spodní koule)
		const baseGrad = ctx.createRadialGradient(-6, 12, 6, 0, 14, 28);
		baseGrad.addColorStop(0, "#FFFFFF");
		baseGrad.addColorStop(0.75, "#F0F9FF");
		baseGrad.addColorStop(1, "#BAE6FD");
		this.setupPath(ctx, baseGrad, COLORS.ink, 3.6);
		ctx.beginPath();
		ctx.arc(0, 14, 24, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.strokeStyle = "#93C5FD";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.arc(0, 14, 18, Math.PI * 0.3, Math.PI * 0.85);
		ctx.stroke();

		// 2. Far Twig Arm holding birch broom
		ctx.save();
		ctx.translate(-14, -8);
		ctx.rotate(broomSwing * 0.03 - 0.2);
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-20, -10 + (panicked ? -16 : 0));
		ctx.stroke();
		ctx.strokeStyle = "#78350F";
		ctx.lineWidth = 4.5;
		ctx.beginPath();
		ctx.moveTo(-16, 26);
		ctx.lineTo(-24, -36);
		ctx.stroke();
		this.setupPath(ctx, "#B45309", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-24, -36);
		ctx.lineTo(-34, -54);
		ctx.lineTo(-20, -56);
		ctx.lineTo(-14, -36);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-22, -40);
		ctx.lineTo(-16, -39);
		ctx.stroke();
		ctx.restore();

		// 3. Middle Snowball (Prostřední koule)
		const midGrad = ctx.createRadialGradient(-4, -6, 5, 0, -6, 20);
		midGrad.addColorStop(0, "#FFFFFF");
		midGrad.addColorStop(0.8, "#F0F9FF");
		midGrad.addColorStop(1, "#BAE6FD");
		this.setupPath(ctx, midGrad, COLORS.ink, 3.4);
		ctx.beginPath();
		ctx.arc(0, -6, 18, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = COLORS.ink;
		[[-1, -12], [2, -6], [0, 0]].forEach(([cx, cy]) => {
			ctx.beginPath();
			ctx.arc(cx, cy, 3, 0, Math.PI * 2);
			ctx.fill();
		});

		// 4. Near Twig Arm (Gnarled twig fingers)
		ctx.save();
		ctx.translate(14, -8);
		const armWave = Math.sin(time * walkSpeed) * 0.2;
		ctx.rotate(armWave + (panicked ? -0.8 : 0.2));
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(16, 4);
		ctx.lineTo(26, -2);
		ctx.moveTo(26, -2);
		ctx.lineTo(33, -7);
		ctx.moveTo(26, -2);
		ctx.lineTo(34, 1);
		ctx.moveTo(26, -2);
		ctx.lineTo(30, 8);
		ctx.stroke();
		ctx.restore();

		// 5. Head Snowball (Zlomyslná hlava s hrncem)
		ctx.save();
		const headTilt = Math.sin(time * walkSpeed * 0.8) * 0.08;
		ctx.translate(2, -28);
		ctx.rotate(headTilt);

		const headGrad = ctx.createRadialGradient(-3, -2, 4, 0, 0, 15);
		headGrad.addColorStop(0, "#FFFFFF");
		headGrad.addColorStop(0.75, "#F0F9FF");
		headGrad.addColorStop(1, "#BAE6FD");
		this.setupPath(ctx, headGrad, COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.arc(0, 0, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		if (panicked) {
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc(-4, -4, 4, 0, Math.PI * 2);
			ctx.arc(4, -4, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(-4, -4, 2, 0, Math.PI * 2);
			ctx.arc(4, -4, 2, 0, Math.PI * 2);
			ctx.fill();
		} else {
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.moveTo(-7, -7); ctx.lineTo(-2, -5); ctx.lineTo(-4, -2); ctx.closePath();
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(3, -5); ctx.lineTo(8, -7); ctx.lineTo(6, -2); ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#38BDF8";
			ctx.beginPath();
			ctx.arc(-4, -4.5, 1.3, 0, Math.PI * 2);
			ctx.arc(5, -4.5, 1.3, 0, Math.PI * 2);
			ctx.fill();

			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.moveTo(-8, -8); ctx.lineTo(-2, -6);
			ctx.moveTo(2, -6); ctx.lineTo(8, -8);
			ctx.stroke();
		}

		// Crooked carrot nose
		this.setupPath(ctx, "#EA580C", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(1, -2);
		ctx.quadraticCurveTo(8, -4, 18, -1);
		ctx.lineTo(2, 3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#9A3412";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(6, -2); ctx.lineTo(6, 1);
		ctx.moveTo(11, -2); ctx.lineTo(11, 0);
		ctx.stroke();

		// Wicked toothy coal grin
		if (panicked) {
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(0, 5, 4, 0, Math.PI * 2);
			ctx.fill();
		} else {
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.arc(1, 4, 7, 0.2, Math.PI - 0.2);
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			[[-4, 4], [-1, 6], [2, 6], [5, 4]].forEach(([tx, ty]) => {
				ctx.beginPath();
				ctx.rect(tx - 1, ty - 1, 2.2, 2.5);
				ctx.fill();
			});
		}

		// Old rusted cooking pot hat
		ctx.save();
		const hatHop = panicked ? Math.sin(time * 20) * 5 - 4 : 0;
		ctx.translate(1, -12 + hatHop);
		ctx.rotate(-0.15);
		this.setupPath(ctx, "#27272A", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-8, 0);
		ctx.lineTo(-10, -14);
		ctx.lineTo(10, -14);
		ctx.lineTo(8, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.rect(-12, 0, 24, 3.5);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#9A3412";
		ctx.fillRect(-4, -10, 6, 5);
		ctx.strokeStyle = "#71717A";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(10, -7, 4.5, -Math.PI * 0.5, Math.PI * 0.5);
		ctx.stroke();
		this.setupPath(ctx, "#F8FAFC", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(0, -14, 9, 3, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		if (!panicked) {
			for (let i = 0; i < 2; i++) {
				const vPhase = (time * 2.5 + i * 0.5) % 1;
				ctx.fillStyle = "rgba(224, 242, 254, 0.65)";
				ctx.beginPath();
				ctx.arc(8 + vPhase * 14, 5 + Math.sin(time * 6 + i) * 3, 2 * (1 - vPhase * 0.5), 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.restore();
		ctx.restore();
	},
	drawNocniMura(ctx, x, y, time, vx, panicked) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 1.35;
		const gallop = Math.sin(time * (panicked ? 24 : 14)) * 4;
		const legCycle = time * (panicked ? 5.5 : 3.5);

		this.drawShadow(ctx, x, y, 26 * scale);
		ctx.save();
		ctx.translate(x, y - Math.abs(gallop));
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.12);
			this.drawRunDust(ctx, -14, 20, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}

		ctx.save();
		ctx.fillStyle = "rgba(129, 140, 248, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "rgba(49, 46, 129, 0.18)";
		ctx.beginPath();
		ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// 1. STREAMING STARRY NIGHT MARE TAIL
		ctx.strokeStyle = "#4338CA";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.moveTo(-14, 2);
		const tailWhip = Math.sin(time * 16) * 8;
		ctx.quadraticCurveTo(-26, -6 + tailWhip, -36, 6 + tailWhip);
		ctx.stroke();

		// 2. LEGS
		const l1 = Math.sin(legCycle) * 12;
		const l2 = Math.sin(legCycle + Math.PI) * 12;
		this.drawLimb(ctx, -10, 8, -14 - l1, 20, "#1E1B4B", 4.5);
		this.drawLimb(ctx, 10, 8, 14 + l1, 20, "#1E1B4B", 4.5);
		this.drawLimb(ctx, -4, 8, -6 - l2, 20, "#312E81", 4);
		this.drawLimb(ctx, 4, 8, 6 + l2, 20, "#312E81", 4);

		// 3. SHADOW BEAST TORSO
		this.setupPath(ctx, "#0F172A", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 12, -0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 4. BAT-WINGED SHADOW CREST
		ctx.save();
		const wingFlap = Math.sin(time * 16) * 0.3;
		ctx.translate(-4, -8);
		ctx.rotate(wingFlap);
		this.setupPath(ctx, "#312E81", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-12, -18);
		ctx.lineTo(-6, -16);
		ctx.lineTo(-2, -22);
		ctx.lineTo(4, -14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// 5. SNOUT & GLOWING VIOLET EYES
		this.setupPath(ctx, "#0F172A", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(12, -8, 10, 7, 0.25, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#1E1B4B", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(8, -14);
		ctx.lineTo(9, -23);
		ctx.lineTo(13, -13);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#A855F7";
		ctx.beginPath();
		ctx.ellipse(14, -8, 3, 2, 0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#F3E8FF";
		ctx.beginPath();
		ctx.arc(14.5, -8, 1, 0, Math.PI * 2);
		ctx.fill();

		for (let i = 0; i < 3; i++) {
			const sPhase = (time * 4 + i * 0.33) % 1;
			ctx.fillStyle = i % 2 === 0 ? "#C084FC" : "#818CF8";
			ctx.beginPath();
			ctx.arc(-18 - sPhase * 16, -2 + Math.sin(time * 8 + i) * 5, 1.8 * (1 - sPhase), 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawIcicle(ctx, x, y, radius = 14, angle = Math.PI / 2) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		const r = radius * 1.25;
		const grad = ctx.createLinearGradient(-r * 0.8, 0, r * 1.5, 0);
		grad.addColorStop(0, "#F0F9FF");
		grad.addColorStop(0.3, "#BAE6FD");
		grad.addColorStop(0.7, "#38BDF8");
		grad.addColorStop(1, "#0284C7");

		this.setupPath(ctx, grad, COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-r * 0.8, -r * 0.45);
		ctx.lineTo(r * 1.6, 0);
		ctx.lineTo(-r * 0.8, r * 0.45);
		ctx.lineTo(-r * 0.6, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Crystalline frost gleam on facet
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(-r * 0.7, -r * 0.2);
		ctx.lineTo(r * 1.2, -r * 0.05);
		ctx.stroke();

		// Glint star near tip
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(r * 0.9, -1, 1.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawDragonFireball(ctx, x, y, radius = 16, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
		ctx.beginPath();
		ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
		ctx.fill();

		// Blazing flame core
		const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.2);
		grad.addColorStop(0, "#FFFBEB");
		grad.addColorStop(0.3, "#FBBF24");
		grad.addColorStop(0.7, "#F97316");
		grad.addColorStop(1, "#DC2626");

		this.setupPath(ctx, grad, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Outer swirling fire tongues
		ctx.strokeStyle = "#EA580C";
		ctx.lineWidth = 2.4;
		for (let i = 0; i < 4; i++) {
			const a = time * 7 + (i * Math.PI) / 2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * radius * 0.7, Math.sin(a) * radius * 0.7);
			ctx.quadraticCurveTo(
				Math.cos(a + 0.4) * (radius * 1.3),
				Math.sin(a + 0.4) * (radius * 1.3),
				Math.cos(a + 0.7) * (radius * 1.5),
				Math.sin(a + 0.7) * (radius * 1.5)
			);
			ctx.stroke();
		}

		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.35, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawDragonFrostball(ctx, x, y, radius = 16, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
		ctx.beginPath();
		ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
		ctx.fill();

		// Icy crystal core
		const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.2);
		grad.addColorStop(0, "#FFFFFF");
		grad.addColorStop(0.4, "#E0F2FE");
		grad.addColorStop(0.7, "#38BDF8");
		grad.addColorStop(1, "#0284C7");

		this.setupPath(ctx, grad, COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Protruding frost crystal spikes
		this.setupPath(ctx, "#BAE6FD", COLORS.ink, 2);
		for (let i = 0; i < 6; i++) {
			const a = time * 5 + (i * Math.PI) / 3;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a - 0.2) * (radius * 0.8), Math.sin(a - 0.2) * (radius * 0.8));
			ctx.lineTo(Math.cos(a) * (radius * 1.5), Math.sin(a) * (radius * 1.5));
			ctx.lineTo(Math.cos(a + 0.2) * (radius * 0.8), Math.sin(a + 0.2) * (radius * 0.8));
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawDragonWind(ctx, x, y, radius = 22, angle = 0, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		// Sweeping crescent wind wave
		ctx.fillStyle = "rgba(224, 242, 254, 0.45)";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.arc(0, 0, radius * 1.2, -Math.PI * 0.4, Math.PI * 0.4);
		ctx.quadraticCurveTo(radius * 0.4, 0, 0, -radius * 1.2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Wind vortex curls
		ctx.strokeStyle = "#38BDF8";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(radius * 0.6, -radius * 0.4, radius * 0.25, 0, Math.PI * 1.5);
		ctx.arc(radius * 0.6, radius * 0.4, radius * 0.25, -Math.PI * 0.5, Math.PI);
		ctx.stroke();
		ctx.restore();
	},
	drawDrak(ctx, x, y, time, vx, panicked, isEnraged = false, headAttacks = undefined) {
		const dir = vx < 0 ? -1 : 1;
		const scale = 2.45;
		const walkSpeed = panicked ? 18 : isEnraged ? 8 : 4.5;
		const bob = Math.sin(time * walkSpeed) * (panicked ? 5 : 3.5);
		const legSwing = Math.sin(time * walkSpeed) * (panicked ? 16 : 9);
		const breathBob = Math.sin(time * 3) * 2;
		const tailWag = Math.sin(time * (isEnraged ? 7 : 3.5)) * 10;
		const wingFlap = Math.sin(time * (panicked ? 14 : isEnraged ? 7.5 : 4)) * 0.35;

		const isFiring = (headAttacks && headAttacks.fire && headAttacks.fire > 0) || false;
		const isIcing = (headAttacks && headAttacks.ice && headAttacks.ice > 0) || false;
		const isRoaring = (headAttacks && headAttacks.roar && headAttacks.roar > 0) || false;

		ctx.save();
		ctx.translate(x, y + bob);
		ctx.scale(dir * scale, scale);

		if (panicked) {
			ctx.rotate(0.08);
			this.drawRunDust(ctx, -24, 32, time);
			this.drawPanicDrops(ctx, 0, -48, time);
		}

		// Enraged Dragon Elemental Glow
		if (isEnraged) {
			ctx.save();
			ctx.fillStyle = Math.sin(time * 8) > 0 ? "rgba(239, 68, 68, 0.22)" : "rgba(56, 189, 248, 0.22)";
			ctx.beginPath();
			ctx.ellipse(0, 10, 48, 28, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		// 1. FAR WING (Back wing)
		ctx.save();
		ctx.translate(-8, -14);
		ctx.rotate(wingFlap + 0.15);
		this.setupPath(ctx, isEnraged ? "#1C3E20" : "#1B3B1F", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(-14, -30, -30, -56);
		ctx.lineTo(-24, -58);
		ctx.quadraticCurveTo(-45, -42, -54, -28);
		ctx.quadraticCurveTo(-40, -22, -44, -10);
		ctx.quadraticCurveTo(-30, -10, -18, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Wing finger struts
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-30, -56);
		ctx.quadraticCurveTo(-15, -28, 0, 0);
		ctx.moveTo(-54, -28);
		ctx.quadraticCurveTo(-26, -18, 0, 0);
		ctx.moveTo(-44, -10);
		ctx.quadraticCurveTo(-20, -6, 0, 0);
		ctx.stroke();
		ctx.restore();

		// 2. FAR HIND LEG & FAR FORELEG
		const farLegWalk = -legSwing;
		this.drawLimb(ctx, -18, 14, -26 - farLegWalk * 0.7, 32, "#234D27", 8.5);
		this.drawLimb(ctx, 12, 14, 8 + farLegWalk * 0.7, 32, "#234D27", 7.5);
		ctx.fillStyle = COLORS.ink;
		ctx.fillRect(-30 - farLegWalk * 0.7, 30, 9, 4);
		ctx.fillRect(4 + farLegWalk * 0.7, 30, 8, 4);

		// 3. TAIL (Sinuous dragon tail with dorsal spines & arrowhead spade)
		ctx.save();
		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3.8);
		ctx.beginPath();
		ctx.moveTo(-22, 10);
		ctx.bezierCurveTo(
			-45 + tailWag * 0.3, 14 - tailWag * 0.2,
			-65 + tailWag * 0.7, -4 - tailWag * 0.5,
			-78 + tailWag, -18 - tailWag * 0.7
		);
		ctx.bezierCurveTo(
			-62 + tailWag * 0.6, -14 - tailWag * 0.4,
			-40 + tailWag * 0.2, 0,
			-20, 2
		);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Spines along tail
		for (let i = 0; i < 4; i++) {
			const st = (i + 1) / 5;
			const sx = -22 + (-78 + tailWag - (-22)) * st;
			const sy = 6 + (-18 - tailWag * 0.7 - 6) * st;
			this.setupPath(ctx, isEnraged ? "#EF4444" : "#DC2626", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(sx - 4, sy - 8);
			ctx.lineTo(sx + 3, sy - 3);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// Spiked tail arrowhead spade (Dračí ocasní hrot)
		ctx.save();
		ctx.translate(-78 + tailWag, -18 - tailWag * 0.7);
		ctx.rotate(-0.4 - tailWag * 0.04);
		this.setupPath(ctx, isEnraged ? "#DC2626" : "#B91C1C", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-8, -12);
		ctx.lineTo(-20, -5);
		ctx.lineTo(-24, 0);
		ctx.lineTo(-20, 5);
		ctx.lineTo(-8, 12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
		ctx.restore();

		// 4. MAIN DRAGON TORSO & ROTUND FOLK BELLY
		this.setupPath(ctx, "#2F6A38", COLORS.ink, 4);
		ctx.beginPath();
		ctx.ellipse(0, 2 + breathBob * 0.5, 33, 26, -0.12, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Folk scale textures
		ctx.strokeStyle = "#224E28";
		ctx.lineWidth = 2.2;
		[[-12, -4], [-4, -8], [6, -6], [-8, 8], [4, 6], [-16, 2]].forEach(([sx, sy]) => {
			ctx.beginPath();
			ctx.arc(sx, sy + breathBob * 0.4, 4.5, 0.2, Math.PI - 0.2);
			ctx.stroke();
		});

		// Dorsal Back Spines
		[[-18, -16], [-10, -22], [-1, -24], [8, -21], [17, -14]].forEach(([spX, spY], idx) => {
			this.setupPath(ctx, isEnraged ? (idx % 2 === 0 ? "#F97316" : "#EF4444") : "#DC2626", COLORS.ink, 2.2);
			ctx.beginPath();
			ctx.moveTo(spX - 4, spY + 4);
			ctx.lineTo(spX, spY - 9);
			ctx.lineTo(spX + 4, spY + 3);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		});

		// Creamy Yellow Folk Belly Plates
		this.setupPath(ctx, "#E5E7A3", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-10, -10 + breathBob);
		ctx.quadraticCurveTo(12, -12 + breathBob, 20, 0);
		ctx.quadraticCurveTo(24, 16, 12, 25);
		ctx.quadraticCurveTo(-4, 27, -14, 18);
		ctx.quadraticCurveTo(-18, 4, -10, -10 + breathBob);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Belly segment ribs (ink striping)
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.4;
		for (let i = -1; i <= 4; i++) {
			const by = -6 + i * 6 + breathBob * 0.6;
			ctx.beginPath();
			ctx.moveTo(-11 + Math.abs(i) * 1.5, by);
			ctx.quadraticCurveTo(4, by + 2, 18 - Math.abs(i - 2) * 1.8, by);
			ctx.stroke();
		}

		// 5. NEAR LEGS & TALONS
		this.drawLimb(ctx, -14, 14, -18 + legSwing * 0.8, 33, "#2F6A38", 9.5);
		this.drawLimb(ctx, 16, 14, 20 - legSwing * 0.8, 33, "#2F6A38", 9.5);
		[[-18 + legSwing * 0.8, 33], [20 - legSwing * 0.8, 33]].forEach(([fx, fy]) => {
			this.setupPath(ctx, "#FFFBEB", COLORS.ink, 2);
			for (let c = -1; c <= 1; c++) {
				ctx.beginPath();
				ctx.moveTo(fx + c * 4, fy);
				ctx.lineTo(fx + c * 5 + 4, fy + 4);
				ctx.lineTo(fx + c * 4 - 1, fy + 4);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		});

		// 6. NEAR WING (Front wing - large, prominent, flapping)
		ctx.save();
		ctx.translate(6, -10);
		ctx.rotate(wingFlap);
		this.setupPath(ctx, isEnraged ? "#2E5C33" : "#2A562F", COLORS.ink, 3.6);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(8, -26, 4, -62);
		ctx.lineTo(10, -64);
		ctx.quadraticCurveTo(-14, -48, -28, -34);
		ctx.quadraticCurveTo(-16, -26, -20, -12);
		ctx.quadraticCurveTo(-10, -12, 0, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Wing struts
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.8;
		ctx.beginPath();
		ctx.moveTo(4, -62);
		ctx.quadraticCurveTo(4, -30, 0, 0);
		ctx.moveTo(-28, -34);
		ctx.quadraticCurveTo(-10, -22, 0, 0);
		ctx.moveTo(-20, -12);
		ctx.quadraticCurveTo(-8, -6, 0, 0);
		ctx.stroke();

		// Thumb claw on wing elbow
		this.setupPath(ctx, "#FFFBEB", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(4, -62);
		ctx.lineTo(8, -68);
		ctx.lineTo(11, -63);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// 7. THE THREE DRAGON NECKS & HEADS - INDEPENDENT ANIMATIONS & ATTACKS
		// Distinct frequencies, phases, and kinematic curves for each of the 3 heads
		const headBob1 = Math.sin(time * 2.2 + 1.2) * (isIcing ? 4.5 : isEnraged ? 3.5 : 2.0);
		const headSway1 = Math.cos(time * 1.8) * (isIcing ? 5 : isEnraged ? 3.5 : 1.5);

		const headBob2 = isRoaring ? -12 + Math.sin(time * 14) * 2.5 : Math.sin(time * 2.9) * 3.0;
		const headSway2 = isRoaring ? Math.sin(time * 16) * 1.5 : Math.sin(time * 2.1) * 2.5;

		const headBob3 = isFiring ? 4 + Math.sin(time * 16) * 3.0 : Math.sin(time * 4.2 + 0.8) * 3.0;
		const headSway3 = isFiring ? 6 + Math.cos(time * 14) * 2.5 : Math.cos(time * 3.6) * 4.0;

		// =========================================================================
		// --- HEAD 1: LEFT HEAD (LÍNÁ / SPÍCÍ HLAVA -> MRAZIVÁ HLAVA V FÁZI 2) ---
		// =========================================================================
		ctx.save();
		this.setupPath(ctx, "#2A5B32", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.moveTo(-16, -12);
		ctx.quadraticCurveTo(-34 + headSway1 * 0.5, -20, -32 + headSway1, -36 + headBob1);
		ctx.lineTo(-24 + headSway1, -38 + headBob1);
		ctx.quadraticCurveTo(-24 + headSway1 * 0.4, -20, -8, -16);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Small neck spines
		this.setupPath(ctx, isEnraged || isIcing ? "#38BDF8" : "#DC2626", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(-32 + headSway1, -26 + headBob1);
		ctx.lineTo(-39 + headSway1, -28 + headBob1);
		ctx.lineTo(-30 + headSway1, -32 + headBob1);
		ctx.fill();
		ctx.stroke();

		// Skull / Snout (-30, -38)
		ctx.save();
		ctx.translate(-30 + headSway1, -38 + headBob1);
		const head1Angle = isIcing ? -0.38 + Math.sin(time * 12) * 0.08 : (isEnraged ? -0.25 + Math.sin(time * 6) * 0.12 : -0.22 + Math.sin(time * 2) * 0.05);
		ctx.rotate(head1Angle);

		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3);
		ctx.beginPath();
		ctx.ellipse(0, 0, 11, 8, -0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, "#2A5B32", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(-7, 2, 6, 4.5, -0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Swept horn
		this.setupPath(ctx, isEnraged || isIcing ? "#93C5FD" : "#D97706", COLORS.ink, 2);
		ctx.beginPath();
		ctx.moveTo(3, -6);
		ctx.quadraticCurveTo(8, -14, 16, -16);
		ctx.quadraticCurveTo(9, -8, 5, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		if (!isEnraged && !panicked && !isIcing) {
			// SLEEPING STATE: Closed curved eye slit
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.arc(-2, -2, 3.2, 0.15, Math.PI - 0.15);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(-6, 3, 3, 0.2, Math.PI * 0.85);
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.arc(-10, 1, 1.2, 0, Math.PI * 2);
			ctx.fill();

			// Snot / snore dream bubble
			const bubblePulse = 2.5 + Math.sin(time * 3.5) * 1.5;
			ctx.fillStyle = "rgba(186, 230, 253, 0.75)";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.arc(-14, 0, bubblePulse, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Floating "Zzz" drifting upward
			const zPhase = (time * 1.2) % 1;
			const zX = -8 - zPhase * 16 + Math.sin(time * 4) * 4;
			const zY = -12 - zPhase * 26;
			ctx.font = "900 12px Eczar, serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.5;
			ctx.strokeText("Z", zX, zY);
			ctx.fillStyle = "#FEF08A";
			ctx.fillText("Z", zX, zY);

			const z2Phase = (time * 1.2 + 0.5) % 1;
			const z2X = -12 - z2Phase * 18 + Math.cos(time * 4) * 3;
			const z2Y = -14 - z2Phase * 28;
			ctx.font = "900 9px Eczar, serif";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2;
			ctx.strokeText("z", z2X, z2Y);
			ctx.fillStyle = "#E0F2FE";
			ctx.fillText("z", z2X, z2Y);
		} else {
			// AWAKENED / ENRAGED / ICING STATE: Wide furious icy eye, snarling maw, frost breath!
			ctx.fillStyle = "#E0F2FE";
			ctx.beginPath();
			ctx.arc(-2, -2, 3.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#0284C7";
			ctx.beginPath();
			ctx.arc(-3, -2, 2.2, 0, Math.PI * 2);
			ctx.fill();

			// Wide open snarling maw when breathing ice
			const jawDrop = isIcing ? 7 : 0;
			this.setupPath(ctx, isIcing ? "#0C4A6E" : "#1E293B", COLORS.ink, 2);
			ctx.beginPath();
			ctx.moveTo(-4, 2);
			ctx.lineTo(-14, 5 + jawDrop);
			ctx.lineTo(-5, 6 + jawDrop);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Sharp crystalline fangs
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(-6, 2); ctx.lineTo(-7, 4.5); ctx.lineTo(-8, 2);
			ctx.moveTo(-10, 2); ctx.lineTo(-11, 4.5); ctx.lineTo(-12, 2);
			if (isIcing) {
				ctx.moveTo(-6, 6 + jawDrop); ctx.lineTo(-7, 4 + jawDrop); ctx.lineTo(-8, 6 + jawDrop);
				ctx.moveTo(-10, 6 + jawDrop); ctx.lineTo(-11, 4 + jawDrop); ctx.lineTo(-12, 6 + jawDrop);
			}
			ctx.fill();

			// Glowing icy core inside throat when breathing
			if (isIcing) {
				ctx.fillStyle = "#38BDF8";
				ctx.beginPath();
				ctx.arc(-6, 4 + jawDrop * 0.5, 3.5, 0, Math.PI * 2);
				ctx.fill();
			}

			// Frost vapor drifting from snout
			const vaporPuffs = isIcing ? 6 : 3;
			for (let i = 0; i < vaporPuffs; i++) {
				const fT = (time * (isIcing ? 7 : 4) + i * (1 / vaporPuffs)) % 1;
				ctx.fillStyle = i % 2 === 0 ? "#67E8F9" : "#E0F2FE";
				ctx.beginPath();
				ctx.arc(-14 - fT * (isIcing ? 28 : 14), 2 + Math.sin(time * 8 + i) * 4, (isIcing ? 3.2 : 1.8) * (1 - fT * 0.4), 0, Math.PI * 2);
				ctx.fill();
			}
		}
		ctx.restore();
		ctx.restore();

		// =========================================================================
		// --- HEAD 2: CENTER HEAD (HLÍDACÍ / MAJESTÁTNÍ HLAVA S KORUNOU ROHŮ) ---
		// =========================================================================
		ctx.save();
		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3.6);
		ctx.beginPath();
		ctx.moveTo(-8, -16);
		ctx.quadraticCurveTo(-4 + headSway2 * 0.4, -36, -6 + headSway2, -50 + headBob2);
		ctx.lineTo(6 + headSway2, -50 + headBob2);
		ctx.quadraticCurveTo(6 + headSway2 * 0.4, -36, 10, -16);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		for (let i = 0; i < 3; i++) {
			const nsy = -24 - i * 9 + headBob2 * 0.6;
			this.setupPath(ctx, isEnraged ? "#EF4444" : "#DC2626", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.moveTo(-7 + headSway2 * 0.6, nsy);
			ctx.lineTo(-13 + headSway2 * 0.6, nsy - 4);
			ctx.lineTo(-5 + headSway2 * 0.6, nsy - 7);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.save();
		ctx.translate(headSway2, -52 + headBob2);
		// When roaring into ceiling: tilt head sharply upward
		const head2Angle = isRoaring ? -0.42 + Math.sin(time * 18) * 0.05 : Math.sin(time * 2.2) * 0.07;
		ctx.rotate(head2Angle);

		// Majestic crown horns
		this.setupPath(ctx, isEnraged ? "#F59E0B" : "#D97706", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-4, -6);
		ctx.quadraticCurveTo(-10, -18, -16, -26);
		ctx.quadraticCurveTo(-8, -16, -1, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(2, -6);
		ctx.quadraticCurveTo(8, -20, 14, -28);
		ctx.quadraticCurveTo(7, -16, 5, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, isEnraged ? "#EF4444" : "#EA580C", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-1, -8);
		ctx.lineTo(0, -23);
		ctx.lineTo(3, -8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Head base
		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Snout & Chin beard tuft
		this.setupPath(ctx, "#25562C", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(6, 2, 7, 5, 0.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		const beardSway = Math.sin(time * 4) * 2;
		this.setupPath(ctx, "#B45309", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(3, 7);
		ctx.lineTo(6 + beardSway, 13);
		ctx.lineTo(8, 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Watchful golden dragon eyes (with intelligent blinking)
		const isBlinking = !isRoaring && Math.sin(time * 1.5) > 0.94;
		if (isBlinking) {
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.moveTo(0, -2);
			ctx.lineTo(7, -2);
			ctx.stroke();
		} else {
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(3, -2, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.beginPath();
			ctx.ellipse(4.5, -2, 1.6, 2.8, 0, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.beginPath();
		ctx.arc(10, 1, 1.4, 0, Math.PI * 2);
		ctx.fill();

		// Mouth / Jaws of Center Head
		if (isRoaring) {
			// Roaring wide to summon icicles or gale
			this.setupPath(ctx, "#450A0A", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.moveTo(2, 2);
			ctx.lineTo(15, -4);
			ctx.lineTo(14, 12);
			ctx.lineTo(3, 8);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Glowing magic rune / beam upwards
			const roarGrad = ctx.createLinearGradient(6, 0, 14, -20);
			roarGrad.addColorStop(0, "#FEF08A");
			roarGrad.addColorStop(1, "rgba(56, 189, 248, 0.85)");
			ctx.fillStyle = roarGrad;
			ctx.beginPath();
			ctx.moveTo(8, -2);
			ctx.lineTo(12, -22);
			ctx.lineTo(16, -20);
			ctx.lineTo(12, 4);
			ctx.closePath();
			ctx.fill();

			// Roar fangs
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(4, 1); ctx.lineTo(6, -2); ctx.lineTo(7, 1);
			ctx.moveTo(9, 0); ctx.lineTo(11, -3); ctx.lineTo(12, 0);
			ctx.moveTo(4, 8); ctx.lineTo(6, 5); ctx.lineTo(7, 8);
			ctx.moveTo(9, 9); ctx.lineTo(11, 6); ctx.lineTo(12, 9);
			ctx.fill();
		} else if (isEnraged) {
			this.setupPath(ctx, "#991B1B", COLORS.ink, 2.2);
			ctx.beginPath();
			ctx.moveTo(3, 3);
			ctx.lineTo(13, 7);
			ctx.lineTo(5, 7);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.strokeStyle = "#DC2626";
			ctx.lineWidth = 2.4;
			ctx.beginPath();
			ctx.moveTo(5, 5);
			ctx.lineTo(16, 7);
			ctx.lineTo(21, 5);
			ctx.moveTo(16, 7);
			ctx.lineTo(20, 10);
			ctx.stroke();

			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(5, 3); ctx.lineTo(6, 5.5); ctx.lineTo(7, 3);
			ctx.moveTo(9, 3); ctx.lineTo(10, 5.5); ctx.lineTo(11, 3);
			ctx.fill();
		} else {
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.2;
			ctx.beginPath();
			ctx.arc(5, 3, 5, 0.2, Math.PI * 0.65);
			ctx.stroke();
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(6, 4); ctx.lineTo(7, 6.5); ctx.lineTo(8, 4);
			ctx.fill();
		}
		ctx.restore();
		ctx.restore();

		// =========================================================================
		// --- HEAD 3: RIGHT HEAD (OHNIVÁ HLAVA - FIRE HEAD) ---
		// =========================================================================
		ctx.save();
		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3.4);
		ctx.beginPath();
		ctx.moveTo(12, -14);
		ctx.quadraticCurveTo(24 + headSway3 * 0.5, -20, 32 + headSway3, -26 + headBob3);
		ctx.lineTo(26 + headSway3, -34 + headBob3);
		ctx.quadraticCurveTo(14 + headSway3 * 0.4, -26, 4, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		for (let i = 0; i < 3; i++) {
			const fsx = 10 + i * 8 + headSway3 * 0.5;
			const fsy = -19 - i * 4 + headBob3 * 0.5;
			this.setupPath(ctx, "#EA580C", COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.moveTo(fsx, fsy);
			ctx.lineTo(fsx + 2, fsy - 7);
			ctx.lineTo(fsx + 5, fsy - 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		ctx.save();
		ctx.translate(34 + headSway3, -28 + headBob3);
		const head3Angle = isFiring ? 0.28 + Math.sin(time * 16) * 0.08 : 0.18 + Math.sin(time * 5) * 0.08;
		ctx.rotate(head3Angle);

		this.setupPath(ctx, "#DC2626", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-3, -5);
		ctx.quadraticCurveTo(-10, -16, -18, -20);
		ctx.quadraticCurveTo(-8, -12, 0, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#2F6A38", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.ellipse(0, 0, 12, 8, 0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Burning flame eye
		ctx.fillStyle = "#EF4444";
		ctx.beginPath();
		ctx.arc(2, -2, 3.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = isFiring ? "#FFFFFF" : "#FEF08A";
		ctx.beginPath();
		ctx.ellipse(3, -2, isFiring ? 1.5 : 1, 2.6, 0, 0, Math.PI * 2);
		ctx.fill();

		// Jaws & Flame Breath of Head 3
		const fireJawDrop = isFiring ? 8 : 0;
		const fireGrad = ctx.createLinearGradient(4, 2, 20, 4);
		fireGrad.addColorStop(0, "#FEF08A");
		fireGrad.addColorStop(0.5, "#F97316");
		fireGrad.addColorStop(1, "#DC2626");

		this.setupPath(ctx, fireGrad, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(2, 2);
		ctx.lineTo(16 + (isFiring ? 4 : 0), -2 - fireJawDrop * 0.4);
		ctx.lineTo(14 + (isFiring ? 3 : 0), 7 + fireJawDrop);
		ctx.lineTo(2, 6 + fireJawDrop * 0.5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(4, 1); ctx.lineTo(5, 3.5); ctx.lineTo(6, 1);
		ctx.moveTo(9, 0); ctx.lineTo(10, 3); ctx.lineTo(11, 0);
		ctx.moveTo(4, 6 + fireJawDrop * 0.5); ctx.lineTo(5, 3.8 + fireJawDrop * 0.3); ctx.lineTo(6, 6 + fireJawDrop * 0.5);
		ctx.moveTo(9, 6 + fireJawDrop * 0.5); ctx.lineTo(10, 4 + fireJawDrop * 0.3); ctx.lineTo(11, 6 + fireJawDrop * 0.5);
		ctx.fill();

		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(12, -2, 1.5, 0, Math.PI * 2);
		ctx.fill();

		// Glowing flame tongue when firing
		if (isFiring) {
			const tongueWave = Math.sin(time * 24) * 4;
			this.setupPath(ctx, "#FEF08A", "#EA580C", 1.8);
			ctx.beginPath();
			ctx.moveTo(12, 3);
			ctx.quadraticCurveTo(22, 1 + tongueWave, 28, 4);
			ctx.quadraticCurveTo(20, 7 + tongueWave, 12, 5);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// Flying sparks and embers from the fire maw
		const sparkCount = isFiring ? 12 : (isEnraged ? 6 : 4);
		for (let i = 0; i < sparkCount; i++) {
			const sPhase = (time * (isFiring ? 8.5 : isEnraged ? 5.5 : 3.5) + i * (1 / sparkCount)) % 1;
			const sx = 14 + sPhase * (isFiring ? 42 : isEnraged ? 24 : 16);
			const sy = 2 + Math.sin(time * 10 + i) * (isFiring ? 8 : 6) - sPhase * (isFiring ? 8 : 4);
			ctx.fillStyle = i % 3 === 0 ? "#FEF08A" : i % 3 === 1 ? "#F59E0B" : "#DC2626";
			ctx.beginPath();
			ctx.arc(sx, sy, (1 - sPhase * 0.5) * (isFiring ? 3.2 : 2.2), 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
		ctx.restore();

		ctx.restore();
	},
	_drawCoinVector(ctx: CanvasRenderingContext2D, cx: number, cy: number, value: number) {
		if (value >= 15) {
			this.setupPath(ctx, COLORS.mustard, COLORS.ink, 3);
			ctx.beginPath();
			ctx.arc(cx, cy, 12, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 11px Eczar";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("T", cx, cy);
		} else if (value >= 5) {
			this.setupPath(ctx, "#E2E8F0", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(cx, cy, 10, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 10px Eczar";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("S", cx, cy);
		} else {
			this.setupPath(ctx, "#D97706", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(cx, cy, 8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 9px Arial";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("K", cx, cy);
		}
	},
	drawCoin(ctx, x, y, time, value) {
		const bob = Math.sin(time * 6) * 4;
		this.drawShadow(ctx, x, y, 9);
		const coinKey = value >= 15 ? 'coin_tolar' : value >= 5 ? 'coin_stribrnak' : 'coin_krejcar';
		const sprite = getCachedLadaSprite(coinKey, 32, 32, (sCtx, cx, cy) => {
			this._drawCoinVector(sCtx, cx, cy, value);
		});
		if (!sprite) {
			this._drawCoinVector(ctx, x, y + bob, value);
			return;
		}
		ctx.drawImage(sprite, x - 16, y + bob - 16);
	},
	drawGingerbread(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, size: string = 'small', isHot: boolean = false) {
		const bob = Math.sin(time * 3.5) * 2.5;
		const rot = Math.sin(time * 1.8) * 0.08;

		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(rot);

		// Přízemní stín
		ctx.save();
		ctx.fillStyle = "rgba(42, 23, 11, 0.22)";
		const shadowR = size === 'giant' ? 18 : (size === 'large' ? 13 : 9);
		ctx.beginPath();
		ctx.ellipse(0, shadowR * 0.85, shadowR, shadowR * 0.36, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		if (isHot) {
			// Horký perníček čerstvě z pece – zářivá aura bez drahého shadowBlur (ADR 0029)
			ctx.save();
			const hotRadius = (size === 'giant' ? 22 : (size === 'large' ? 16 : 12));
			ctx.strokeStyle = 'rgba(245, 158, 11, 0.32)';
			ctx.lineWidth = 5.5;
			ctx.beginPath();
			ctx.arc(0, 0, hotRadius + 1, 0, Math.PI * 2);
			ctx.stroke();

			ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
			ctx.lineWidth = 2.0;
			ctx.beginPath();
			ctx.arc(0, 0, hotRadius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		if (size === 'giant') {
			// NEJVĚTŠÍ DENOMINACE: ČERTOVSKÁ HLAVA S RŮŽKY (LADOVSKÝ ČERTÍK)
			const s = 1.35;
			ctx.scale(s, s);

			// Perníkový korpus hlavy čerta (horned devil head)
			ctx.fillStyle = '#6E2E0A';
			ctx.strokeStyle = '#321404';
			ctx.lineWidth = 2.2;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.moveTo(0, -7);
			// Pravý roh nahoru a ven
			ctx.bezierCurveTo(4, -8, 8, -13, 11, -19);
			ctx.bezierCurveTo(13, -19, 14, -15, 12, -9);
			// Pravé špičaté ouško
			ctx.lineTo(16, -6);
			ctx.lineTo(13, -2);
			// Pravá tvář k bradě
			ctx.bezierCurveTo(15, 6, 9, 14, 0, 16);
			// Levá brada k levé tváři
			ctx.bezierCurveTo(-9, 14, -15, 6, -13, -2);
			// Levé ouško
			ctx.lineTo(-16, -6);
			ctx.lineTo(-12, -9);
			// Levý roh nahoru
			ctx.bezierCurveTo(-14, -15, -13, -19, -11, -19);
			// Vnitřní hrana levého rohu zpět ke středu
			ctx.bezierCurveTo(-8, -13, -4, -8, 0, -7);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Teplý pečený kvašový lesk uprostřed tváře
			ctx.fillStyle = '#8C4215';
			ctx.beginPath();
			ctx.ellipse(0, 3, 7.5, 6.5, 0, 0, Math.PI * 2);
			ctx.fill();

			// Cukrová poleva – bílé zdobení rohů
			ctx.strokeStyle = '#FFFDF5';
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			ctx.moveTo(3, -9); ctx.lineTo(10, -17);
			ctx.moveTo(6, -11); ctx.lineTo(10, -11);
			ctx.moveTo(-3, -9); ctx.lineTo(-10, -17);
			ctx.moveTo(-6, -11); ctx.lineTo(-10, -11);
			ctx.stroke();

			// Cukrové obloučky na tvářích
			ctx.strokeStyle = '#FFFDF5';
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			ctx.arc(-8, 3, 2, 0, Math.PI);
			ctx.arc(8, 3, 2, 0, Math.PI);
			ctx.stroke();

			// Oči z rubínových cukrových perliček
			ctx.fillStyle = '#DC2626';
			ctx.beginPath();
			ctx.arc(-4.5, 0, 2, 0, Math.PI * 2);
			ctx.arc(4.5, 0, 2, 0, Math.PI * 2);
			ctx.fill();

			// Jiskřičky v očích
			ctx.fillStyle = '#FFFFFF';
			ctx.beginPath();
			ctx.arc(-4, -0.6, 0.7, 0, Math.PI * 2);
			ctx.arc(5, -0.6, 0.7, 0, Math.PI * 2);
			ctx.fill();

			// Lišácký úsměv
			ctx.strokeStyle = '#321404';
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.arc(0, 6, 5, 0.15 * Math.PI, 0.85 * Math.PI);
			ctx.stroke();

			// Červený cukrový jazyk
			ctx.fillStyle = '#EF4444';
			ctx.beginPath();
			ctx.arc(0, 8, 2.2, 0, Math.PI);
			ctx.fill();

			// Bílý cukrový zoubek
			ctx.fillStyle = '#FFFDF5';
			ctx.beginPath();
			ctx.moveTo(-2, 7.5); ctx.lineTo(-1, 9.5); ctx.lineTo(0, 7.5);
			ctx.fill();

			// Zlatá cukrová perlička na čele
			ctx.fillStyle = '#F59E0B';
			ctx.beginPath();
			ctx.arc(0, -4, 1.3, 0, Math.PI * 2);
			ctx.fill();

		} else if (size === 'large') {
			// VELKÝ PERNÍČEK: LADOVSKÝ ČESKÝ PERNÍKOVÝ PANÁČEK
			const s = 1.15;
			ctx.scale(s, s);

			ctx.fillStyle = '#78350F';
			ctx.strokeStyle = '#2B1204';
			ctx.lineWidth = 2.0;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';

			// Ladovská silueta perníkového panáčka (hlava, rozpažené ruce, kabátek a nožky)
			ctx.beginPath();
			// Hlava panáčka nahoře
			ctx.arc(0, -11, 5.5, 0.75 * Math.PI, 0.25 * Math.PI, false);
			// Pravé rameno k paži
			ctx.lineTo(3.5, -6.5);
			// Pravá rozpažená ruka ven
			ctx.lineTo(12, -4);
			// Pravá ručka (kulatý okraj)
			ctx.arc(12.5, -2, 2.2, -0.4 * Math.PI, 0.5 * Math.PI, false);
			// Spodní hrana pravé paže k pasu
			ctx.lineTo(4.5, 0.5);
			// Pas k pravému boku
			ctx.lineTo(5, 4);
			// Pravá noha dolů
			ctx.lineTo(6.5, 12);
			// Pravá botka / patička
			ctx.arc(4.5, 13, 2.2, 0, Math.PI, false);
			// Vnitřní šev mezi nožkami k rozkroku
			ctx.lineTo(2.5, 12);
			ctx.lineTo(0, 5);
			// Levá noha vnitřní šev dolů
			ctx.lineTo(-2.5, 12);
			// Levá botka
			ctx.arc(-4.5, 13, 2.2, 0, Math.PI, false);
			// Levá noha vnější šev nahoru
			ctx.lineTo(-6.5, 12);
			// Levý bok k pasu
			ctx.lineTo(-5, 4);
			ctx.lineTo(-4.5, 0.5);
			// Spodní hrana levé paže ven
			ctx.lineTo(-12.5, -2);
			// Levá ručka (kulatý okraj)
			ctx.arc(-12.5, -2, 2.2, 0.5 * Math.PI, 1.4 * Math.PI, false);
			// Horní hrana levé paže k rameni
			ctx.lineTo(-3.5, -6.5);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Teplý pečený kvašový lesk tváře a bříška
			ctx.fillStyle = '#92400E';
			ctx.beginPath();
			ctx.arc(0, -11, 3.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(0, 2, 3.5, 4.5, 0, 0, Math.PI * 2);
			ctx.fill();

			// Bílé cukrové oči
			ctx.fillStyle = '#FFFDF5';
			ctx.beginPath();
			ctx.arc(-2, -12, 1.1, 0, Math.PI * 2);
			ctx.arc(2, -12, 1.1, 0, Math.PI * 2);
			ctx.fill();
			// Černé zorničky
			ctx.fillStyle = '#2B1204';
			ctx.beginPath();
			ctx.arc(-2, -12, 0.5, 0, Math.PI * 2);
			ctx.arc(2, -12, 0.5, 0, Math.PI * 2);
			ctx.fill();

			// Ladovský usměvavý oblouček pusy
			ctx.strokeStyle = '#FFFDF5';
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			ctx.arc(0, -10.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI);
			ctx.stroke();

			// Červené cukrové tvářičky
			ctx.fillStyle = '#EF4444';
			ctx.beginPath();
			ctx.arc(-3.5, -9.8, 0.9, 0, Math.PI * 2);
			ctx.arc(3.5, -9.8, 0.9, 0, Math.PI * 2);
			ctx.fill();

			// Cukrová linka límečku / mašličky
			ctx.strokeStyle = '#FFFDF5';
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.moveTo(-3, -6.5); ctx.lineTo(0, -5.2); ctx.lineTo(3, -6.5);
			ctx.stroke();
			// Rubínový uzlík mašličky
			ctx.fillStyle = '#DC2626';
			ctx.beginPath();
			ctx.arc(0, -5.5, 1.2, 0, Math.PI * 2);
			ctx.fill();

			// 3 bílé cukrové knoflíčky na vestě
			ctx.fillStyle = '#FFFDF5';
			ctx.beginPath();
			ctx.arc(0, -2, 1.3, 0, Math.PI * 2);
			ctx.arc(0, 1.5, 1.3, 0, Math.PI * 2);
			ctx.arc(0, 5, 1.3, 0, Math.PI * 2);
			ctx.fill();

			// Cukrové manžetky na zápěstích
			ctx.strokeStyle = '#FFFDF5';
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			ctx.moveTo(-9.5, -4.5); ctx.lineTo(-9, -0.5);
			ctx.moveTo(9.5, -4.5); ctx.lineTo(9, -0.5);
			ctx.stroke();

			// Cukrové manžetky na botkách
			ctx.beginPath();
			ctx.moveTo(-6, 9.5); ctx.lineTo(-2.5, 9.5);
			ctx.moveTo(2.5, 9.5); ctx.lineTo(6, 9.5);
			ctx.stroke();

			// Cukrová vlnovka na čepičce
			ctx.beginPath();
			ctx.arc(0, -14.5, 2.5, 0.8 * Math.PI, 0.2 * Math.PI);
			ctx.stroke();

		} else {
			// ZÁKLADNÍ DENOMINACE: MALÉ JEDNODUŠE BÍLE ZDOBENÉ PERNÍKOVÉ SRDÍČKO
			drawGingerbreadHeartCanvas(ctx, 0, 0, 22);
		}

		ctx.restore();
	},
	_drawJitrniceVector(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.scale(scale, scale);

		// Ground shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 14, 22, 6, 0, 0, Math.PI * 2);
		ctx.fill();

		// Wooden skewers (špejle) - authentic rustic wooden pegs piercing the casing
		// Left skewer
		ctx.strokeStyle = "#22140A";
		ctx.lineWidth = 4.2;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(-24, -4);
		ctx.lineTo(-17, 18);
		ctx.stroke();

		ctx.strokeStyle = "#5C3D24";
		ctx.lineWidth = 2.6;
		ctx.beginPath();
		ctx.moveTo(-24, -4);
		ctx.lineTo(-17, 18);
		ctx.stroke();

		ctx.strokeStyle = "#8A623F";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(-24, -4);
		ctx.lineTo(-21, 6);
		ctx.stroke();

		// Right skewer
		ctx.strokeStyle = "#22140A";
		ctx.lineWidth = 4.2;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(24, -4);
		ctx.lineTo(17, 18);
		ctx.stroke();

		ctx.strokeStyle = "#5C3D24";
		ctx.lineWidth = 2.6;
		ctx.beginPath();
		ctx.moveTo(24, -4);
		ctx.lineTo(17, 18);
		ctx.stroke();

		ctx.strokeStyle = "#8A623F";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(24, -4);
		ctx.lineTo(21, 6);
		ctx.stroke();

		// Curved sausage body (classic crescent jitrnice arching upward in center)
		const casingGrad = ctx.createLinearGradient(0, -14, 0, 14);
		casingGrad.addColorStop(0, "#F2EADA");
		casingGrad.addColorStop(0.3, "#E4D7BE");
		casingGrad.addColorStop(0.7, "#C7B79B");
		casingGrad.addColorStop(1, "#99876C");

		this.setupPath(ctx, casingGrad, COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-20, 6);
		ctx.bezierCurveTo(-16, -6, -8, -13, 0, -13);
		ctx.bezierCurveTo(8, -13, 16, -6, 20, 6);
		ctx.bezierCurveTo(22, 11, 18, 14, 14, 13);
		ctx.bezierCurveTo(8, 7, 3, 2, 0, 2);
		ctx.bezierCurveTo(-3, 2, -8, 7, -14, 13);
		ctx.bezierCurveTo(-18, 14, -22, 11, -20, 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Pinched casing knots at ends
		// Left knot
		this.setupPath(ctx, "#D3C2A3", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-20, 8, 3.5, 4.5, -0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Right knot
		this.setupPath(ctx, "#D3C2A3", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(20, 8, 3.5, 4.5, 0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Visible filling specks under translucent skin (pork meat, majoránka, barley)
		ctx.fillStyle = "rgba(74, 58, 40, 0.65)";
		const specks = [
			[-14, 3, 1.2], [-11, -3, 1.4], [-7, -8, 1.2], [-4, -1, 1.5],
			[0, -7, 1.6], [4, -1, 1.4], [7, -8, 1.3], [11, -3, 1.4],
			[14, 3, 1.2], [-3, -6, 1.1], [3, -5, 1.2]
		];
		for (const [sx, sy, sr] of specks) {
			ctx.beginPath();
			ctx.arc(sx, sy, sr, 0, Math.PI * 2);
			ctx.fill();
		}

		// Marjoram flecks (greenish herb touches)
		ctx.fillStyle = "rgba(68, 84, 49, 0.75)";
		for (const [mx, my] of [[-9, -1], [-2, -8], [2, -2], [9, -4]]) {
			ctx.beginPath();
			ctx.ellipse(mx, my, 1.5, 0.8, 0.5, 0, Math.PI * 2);
			ctx.fill();
		}

		// Glistening wet sheen reflection along top spine (boiled pork natural skin sheen)
		ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
		ctx.lineWidth = 2.2;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(-13, -2);
		ctx.bezierCurveTo(-8, -9, -3, -11, 0, -11);
		ctx.bezierCurveTo(3, -11, 8, -9, 13, -2);
		ctx.stroke();

		// Extra bright apex shine
		ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(-4, -11);
		ctx.lineTo(4, -11);
		ctx.stroke();

		ctx.restore();
	},
	drawJitrnice(ctx, x, y, scale = 1, angle = 0) {
		const sprite = getCachedLadaSprite('czech_jitrnice', 64, 52, (sCtx, cx, cy) => {
			this._drawJitrniceVector(sCtx, cx, cy, 1, 0);
		});
		if (!sprite) {
			this._drawJitrniceVector(ctx, x, y, scale, angle);
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		if (scale !== 1) ctx.scale(scale, scale);
		ctx.drawImage(sprite, -32, -26);
		ctx.restore();
	},
	drawPotion(ctx, x, y, time) {
		const bob = Math.sin(time * 5) * 3.5;
		this.drawJitrnice(ctx, x, y + bob, 1.15, Math.sin(time * 2.5) * 0.06);
	},
	_drawCzechBuchtaVector(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.scale(scale, scale);
		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 10, 15, 6, 0, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#FDE8B5", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-16, -2);
		ctx.bezierCurveTo(-18, 5, -14, 11, -8, 12);
		ctx.bezierCurveTo(4, 13, 12, 10, 16, 6);
		ctx.bezierCurveTo(18, 0, 16, -6, 12, -9);
		ctx.bezierCurveTo(4, -11, -6, -9, -16, -2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const crustGrad = ctx.createLinearGradient(-10, -12, 12, 8);
		crustGrad.addColorStop(0, "#A64812");
		crustGrad.addColorStop(.3, "#7E340A");
		crustGrad.addColorStop(.7, "#C56A1F");
		crustGrad.addColorStop(1, "#DB872D");
		ctx.fillStyle = crustGrad;
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-14, -1);
		ctx.bezierCurveTo(-11, -11, 2, -12, 12, -8);
		ctx.bezierCurveTo(17, -4, 17, 3, 13, 6);
		ctx.bezierCurveTo(4, 8, -4, 6, -11, 3);
		ctx.bezierCurveTo(-14, 2, -14, 0, -14, -1);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FFF8E7";
		ctx.beginPath();
		ctx.moveTo(-15, 0);
		ctx.bezierCurveTo(-17, 5, -13, 10, -8, 11);
		ctx.bezierCurveTo(-5, 9, -5, 4, -10, 2);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = "#54162B";
		ctx.beginPath();
		ctx.ellipse(-10, 6, 3, 2, -.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#FFFFFF";
		for (const [sx, sy, sr] of [
			[
				-6,
				-6,
				.9
			],
			[
				-4,
				-8,
				1.1
			],
			[
				-1,
				-7,
				1.2
			],
			[
				2,
				-8,
				1.3
			],
			[
				5,
				-7,
				1.1
			],
			[
				8,
				-5,
				1
			],
			[
				-8,
				-4,
				.8
			],
			[
				-5,
				-4,
				1
			],
			[
				-2,
				-5,
				1.2
			],
			[
				1,
				-5,
				1.1
			],
			[
				4,
				-4,
				1.2
			],
			[
				7,
				-3,
				.9
			],
			[
				10,
				-2,
				.8
			],
			[
				-10,
				-2,
				.7
			],
			[
				-7,
				-2,
				.9
			],
			[
				-3,
				-2,
				1
			],
			[
				0,
				-2,
				1.1
			],
			[
				3,
				-2,
				1
			],
			[
				6,
				-1,
				.9
			],
			[
				9,
				0,
				.7
			],
			[
				-4,
				0,
				.8
			],
			[
				-1,
				0,
				1
			],
			[
				2,
				1,
				.9
			],
			[
				5,
				2,
				.8
			],
			[
				-5,
				-7,
				.7
			],
			[
				0,
				-9,
				.8
			],
			[
				4,
				-8,
				.7
			],
			[
				7,
				-6,
				.8
			],
			[
				-2,
				-7,
				.9
			],
			[
				3,
				-6,
				1
			]
		]) {
			ctx.beginPath();
			ctx.arc(sx, sy, sr, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();
	},
	drawCzechBuchta(ctx, x, y, scale = 1, angle = 0) {
		const sprite = getCachedLadaSprite('czech_buchta', 52, 48, (sCtx, cx, cy) => {
			this._drawCzechBuchtaVector(sCtx, cx, cy, 1, 0);
		});
		if (!sprite) {
			this._drawCzechBuchtaVector(ctx, x, y, scale, angle);
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		if (scale !== 1) ctx.scale(scale, scale);
		ctx.drawImage(sprite, -26, -24);
		ctx.restore();
	},
	_drawHruskaVector(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.scale(scale, scale);

		// Ground shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 15, 13, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Pear curved stem (stopka)
		this.setupPath(ctx, "#5C3A21", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(0, -9);
		ctx.quadraticCurveTo(-2, -16, -5, -20);
		ctx.quadraticCurveTo(-3, -21, -1, -19);
		ctx.quadraticCurveTo(2, -15, 2, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Fresh green leaf (lístek)
		this.setupPath(ctx, "#65A30D", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(-1, -15);
		ctx.quadraticCurveTo(7, -21, 13, -17);
		ctx.quadraticCurveTo(8, -10, -1, -15);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Leaf vein
		ctx.strokeStyle = "#365314";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(-1, -15);
		ctx.quadraticCurveTo(6, -16, 12, -17);
		ctx.stroke();

		// Pear body gradient
		const pearGrad = ctx.createLinearGradient(-10, -12, 10, 16);
		pearGrad.addColorStop(0, "#D9F99D");
		pearGrad.addColorStop(0.3, "#FACC15");
		pearGrad.addColorStop(0.7, "#EAB308");
		pearGrad.addColorStop(1, "#EA580C");

		this.setupPath(ctx, pearGrad, COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.moveTo(0, -9);
		ctx.bezierCurveTo(-5, -9, -7, -3, -6, 2);
		ctx.bezierCurveTo(-14, 5, -15, 14, -8, 18);
		ctx.bezierCurveTo(-3, 20, 3, 20, 8, 18);
		ctx.bezierCurveTo(15, 14, 14, 5, 6, 2);
		ctx.bezierCurveTo(7, -3, 5, -9, 0, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Bottom calyx (bubák)
		ctx.fillStyle = "#3D1D08";
		ctx.beginPath();
		ctx.ellipse(0, 19, 1.8, 1.2, 0, 0, Math.PI * 2);
		ctx.fill();

		// Pear skin freckles / rustic flecks
		ctx.fillStyle = "#78350F";
		for (const [fx, fy, fr] of [
			[2, 7, 0.7],
			[5, 11, 0.8],
			[-2, 12, 0.6],
			[-5, 9, 0.7],
			[6, 14, 0.6],
			[-4, 15, 0.6],
			[1, 16, 0.7]
		]) {
			ctx.beginPath();
			ctx.arc(fx, fy, fr, 0, Math.PI * 2);
			ctx.fill();
		}

		// Folk highlight sheen on left flank
		ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
		ctx.lineWidth = 2.4;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(-4, -1);
		ctx.quadraticCurveTo(-9, 4, -9, 11);
		ctx.stroke();

		ctx.restore();
	},
	drawHruska(ctx, x, y, scale = 1, angle = 0) {
		const sprite = getCachedLadaSprite('czech_hruska', 48, 56, (sCtx, cx, cy) => {
			this._drawHruskaVector(sCtx, cx, cy, 1, 0);
		});
		if (!sprite) {
			this._drawHruskaVector(ctx, x, y, scale, angle);
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		if (scale !== 1) ctx.scale(scale, scale);
		ctx.drawImage(sprite, -24, -28);
		ctx.restore();
	},
	_drawKynutyKolacVector(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.scale(scale, scale);

		// Ground shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 3, 17, 16, 0, 0, Math.PI * 2);
		ctx.fill();

		// Baked yeast crust (outer ring)
		const crustGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
		crustGrad.addColorStop(0, "#FCD34D");
		crustGrad.addColorStop(0.5, "#F59E0B");
		crustGrad.addColorStop(0.75, "#D97706");
		crustGrad.addColorStop(0.9, "#9A3412");
		crustGrad.addColorStop(1, "#451A03");

		this.setupPath(ctx, crustGrad, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, 0, 16, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Roasted crust edge spots
		ctx.fillStyle = "rgba(107, 40, 10, 0.5)";
		ctx.beginPath();
		ctx.arc(9, -9, 4, 0, Math.PI * 2);
		ctx.arc(-11, 7, 3.5, 0, Math.PI * 2);
		ctx.fill();

		// Creamy white Tvaroh filling
		const tvarohGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 13);
		tvarohGrad.addColorStop(0, "#FFFFFF");
		tvarohGrad.addColorStop(0.7, "#FFFDF5");
		tvarohGrad.addColorStop(1, "#F0E7D3");

		this.setupPath(ctx, tvarohGrad, COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.arc(0, 0, 12.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 8 Radial dark plum povidla spokes
		ctx.strokeStyle = "#240D07";
		ctx.lineWidth = 1.6;
		ctx.lineCap = "round";
		for (let i = 0; i < 8; i++) {
			const a = (i * Math.PI) / 4;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * 2.8, Math.sin(a) * 2.8);
			ctx.lineTo(Math.cos(a) * 12.2, Math.sin(a) * 12.2);
			ctx.stroke();
		}

		// Scalloped wavy garland between spokes (radius ~10.5)
		ctx.lineWidth = 1.3;
		for (let i = 0; i < 8; i++) {
			const a1 = (i * Math.PI) / 4;
			const a2 = ((i + 1) * Math.PI) / 4;
			const amid = (a1 + a2) / 2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a1) * 10.8, Math.sin(a1) * 10.8);
			ctx.quadraticCurveTo(Math.cos(amid) * 12.6, Math.sin(amid) * 12.6, Math.cos(a2) * 10.8, Math.sin(a2) * 10.8);
			ctx.stroke();
		}

		// Raisin dots ring (radius ~11.8)
		ctx.fillStyle = "#1E0A04";
		for (let i = 0; i < 16; i++) {
			const a = (i * Math.PI) / 8 + 0.2;
			ctx.beginPath();
			ctx.arc(Math.cos(a) * 11.6, Math.sin(a) * 11.6, 0.7, 0, Math.PI * 2);
			ctx.fill();
		}

		// Mid-sector povidla dashes (radius ~7)
		ctx.lineWidth = 1.2;
		for (let i = 0; i < 8; i++) {
			const a = (i * Math.PI) / 4 + Math.PI / 8;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * 5.5, Math.sin(a) * 5.5);
			ctx.lineTo(Math.cos(a) * 8.2, Math.sin(a) * 8.2);
			ctx.stroke();
		}

		// 8 Peeled almonds in center rosette
		this.setupPath(ctx, "#FFFBF5", COLORS.ink, 0.8);
		for (let i = 0; i < 8; i++) {
			const a = (i * Math.PI) / 4 + Math.PI / 8;
			ctx.save();
			ctx.rotate(a);
			ctx.beginPath();
			ctx.ellipse(0, -3.4, 0.9, 2.2, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}

		// Center raisin
		ctx.fillStyle = "#1A0903";
		ctx.beginPath();
		ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawKynutyKolac(ctx, x, y, scale = 1, angle = 0) {
		const sprite = getCachedLadaSprite('kynuty_kolac', 48, 48, (sCtx, cx, cy) => {
			this._drawKynutyKolacVector(sCtx, cx, cy, 1, 0);
		});
		if (!sprite) {
			this._drawKynutyKolacVector(ctx, x, y, scale, angle);
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		if (scale !== 1) ctx.scale(scale, scale);
		ctx.drawImage(sprite, -24, -24);
		ctx.restore();
	},
	drawBreadRoll(ctx, x, y, time) {
		const bob = Math.sin(time * 4) * 3;
		const tilt = Math.sin(time * 2.5) * 0.08;
		this.drawHruska(ctx, x, y + bob, 1.15, tilt);
	},
	drawPear(ctx, x, y, time) {
		const bob = Math.sin(time * 4) * 3;
		const tilt = Math.sin(time * 2.5) * 0.08;
		this.drawHruska(ctx, x, y + bob, 1.15, tilt);
	},
	_drawPickleVector(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
		this.setupPath(ctx, '#5E9F3B', '#193B18', 2.5);
		ctx.beginPath();
		ctx.ellipse(cx, cy, 15, 8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = '#A8D96D';
		for (let i = -1; i <= 1; i++) {
			ctx.beginPath();
			ctx.arc(cx + i * 6, cy - 2 + (i % 2) * 3, 1.4, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
		ctx.beginPath();
		ctx.ellipse(cx - 5, cy - 3, 3, 1.5, -0.3, 0, Math.PI * 2);
		ctx.fill();
	},
	drawPickle(ctx: CanvasRenderingContext2D, x: number, y: number, angle = 0) {
		const sprite = getCachedLadaSprite('pickle_proj', 38, 26, (sCtx, cx, cy) => {
			this._drawPickleVector(sCtx, cx, cy);
		});
		if (!sprite) {
			ctx.save();
			ctx.translate(x, y);
			if (angle !== 0) ctx.rotate(angle);
			this._drawPickleVector(ctx, 0, 0);
			ctx.restore();
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.drawImage(sprite, -19, -13);
		ctx.restore();
	},
	drawBee(ctx: CanvasRenderingContext2D, x: number, y: number, angle = 0) {
		const sprite = getCachedLadaSprite('bee_proj', 26, 20, (sCtx, cx, cy) => {
			this.setupPath(sCtx, COLORS.mustard, COLORS.ink, 2);
			sCtx.beginPath();
			sCtx.ellipse(cx, cy, 8, 5, 0, 0, Math.PI * 2);
			sCtx.fill();
			sCtx.stroke();
			sCtx.fillStyle = COLORS.ink;
			sCtx.fillRect(cx - 2, cy - 4.5, 2, 9);
			sCtx.fillRect(cx + 2, cy - 4.5, 2, 9);
		});
		if (!sprite) {
			ctx.save();
			ctx.translate(x, y);
			if (angle !== 0) ctx.rotate(angle);
			this.setupPath(ctx, COLORS.mustard, COLORS.ink, 2);
			ctx.beginPath();
			ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
			return;
		}
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.drawImage(sprite, -13, -10);
		ctx.restore();
	},
	drawSnowball(ctx: CanvasRenderingContext2D, x: number, y: number, rad = 12) {
		const isSmall = rad <= 8;
		const r = isSmall ? 7 : 12;
		const dim = (r + 3) * 2;
		const key = isSmall ? 'snowball_small' : 'snowball_large';
		const sprite = getCachedLadaSprite(key, dim, dim, (sCtx, cx, cy) => {
			this.setupPath(sCtx, '#F8FAFC', COLORS.ink, 2.5);
			sCtx.beginPath();
			sCtx.arc(cx, cy, r, 0, Math.PI * 2);
			sCtx.fill();
			sCtx.stroke();
		});
		if (!sprite) {
			this.setupPath(ctx, '#F8FAFC', COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			return;
		}
		ctx.drawImage(sprite, x - dim * 0.5, y - dim * 0.5);
	},
	drawHolyDroplet(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const sprite = getCachedLadaSprite('holy_droplet_proj', 22, 22, (sCtx, cx, cy) => {
			this.setupPath(sCtx, COLORS.ice, COLORS.ink, 2);
			sCtx.beginPath();
			sCtx.arc(cx, cy, 7, 0, Math.PI * 2);
			sCtx.fill();
			sCtx.stroke();
		});
		if (!sprite) {
			this.setupPath(ctx, COLORS.ice, COLORS.ink, 2);
			ctx.beginPath();
			ctx.arc(x, y, 7, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			return;
		}
		ctx.drawImage(sprite, x - 11, y - 11);
	},
	drawSoulJar(ctx, x, y, time) {
		ctx.save();
		ctx.translate(x, y);
		const auraPulse = Math.sin(time * 4) * 3;
		ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 0, 16 + auraPulse, 18 + auraPulse, 0, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, COLORS.white, COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-12, -10);
		ctx.lineTo(-10, 12);
		ctx.quadraticCurveTo(0, 16, 10, 12);
		ctx.lineTo(12, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(12, 1, 5, -Math.PI / 2, Math.PI / 2);
		ctx.stroke();
		ctx.strokeStyle = COLORS.water;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-8, 2);
		ctx.quadraticCurveTo(-4, -2, 0, 2);
		ctx.quadraticCurveTo(4, 6, 8, 2);
		ctx.stroke();
		this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, -11, 14, 4, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.red, COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -15, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	drawChest(ctx, x, y, shake = 0, glow = 0, scale = 1) {
		ctx.save();
		ctx.translate(x + (Math.random() - .5) * shake, y + (Math.random() - .5) * shake);
		if (scale !== 1) ctx.scale(scale, scale);
		if (glow > 0) {
			ctx.fillStyle = `rgba(245, 158, 11, ${Math.min(0.5, glow * 0.4)})`;
			ctx.beginPath();
			ctx.arc(0, 5, 52 + glow * 10, 0, Math.PI * 2);
			ctx.fill();
		}
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 5);
		ctx.fillRect(-40, -10, 80, 40);
		ctx.strokeRect(-40, -10, 80, 40);
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 5);
		ctx.beginPath();
		ctx.arc(0, -10, 40, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.red, COLORS.ink, 4);
		ctx.fillRect(-25, -45, 10, 75);
		ctx.strokeRect(-25, -45, 10, 75);
		ctx.fillRect(15, -45, 10, 75);
		ctx.strokeRect(15, -45, 10, 75);
		this.setupPath(ctx, COLORS.mustard, COLORS.ink, 4);
		ctx.beginPath();
		ctx.arc(0, -5, 12, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.fillRect(-3, -5, 6, 8);
		ctx.restore();
	},
	drawPonocnyHorn(ctx, x, y, time) {
		const bob = Math.sin(time * 5) * 4;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(Math.sin(time * 2.5) * 0.12);

		// Ground shadow & frosty halo
		ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 16, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Horn body - curving cow horn
		const hornGrad = ctx.createLinearGradient(-16, -10, 18, 12);
		hornGrad.addColorStop(0, "#F5E6C8"); // Bone / ivory tip
		hornGrad.addColorStop(0.35, "#B8860B"); // Warm honey horn
		hornGrad.addColorStop(0.75, "#4A2F13"); // Dark steer horn
		hornGrad.addColorStop(1, "#261507");

		this.setupPath(ctx, hornGrad, COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-16, -4);
		ctx.bezierCurveTo(-14, -14, 4, -16, 14, -6);
		ctx.bezierCurveTo(18, -2, 20, 6, 16, 12);
		ctx.bezierCurveTo(12, 14, 6, 12, 8, 6);
		ctx.bezierCurveTo(6, -2, -4, -4, -12, 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Brass bell rim (wide horn end)
		this.setupPath(ctx, "#FBBF24", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(15, 10, 4.5, 3.2, 0.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Wrapped twine / hemp cord around midsection
		ctx.strokeStyle = "#D97706";
		ctx.lineWidth = 2.2;
		for (let i = -2; i <= 3; i++) {
			ctx.beginPath();
			ctx.moveTo(-2 + i * 2, -12 + i * 1.5);
			ctx.lineTo(2 + i * 2, -4 + i * 1.5);
			ctx.stroke();
		}

		// Frost sparkle flakes
		ctx.fillStyle = "#E0F2FE";
		for (let i = 0; i < 3; i++) {
			const fa = time * 3 + i * 2;
			const fx = Math.cos(fa) * 16;
			const fy = Math.sin(fa) * 12;
			ctx.fillRect(fx - 1, fy - 1, 2.5, 2.5);
		}

		ctx.restore();
	},
	drawMasopustRattle(ctx, x, y, time) {
		const bob = Math.sin(time * 5.5) * 3.5;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(Math.sin(time * 3) * 0.15);

		// Shadow & festive aura
		ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 15, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Wooden handle
		this.setupPath(ctx, "#92400E", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.roundRect(-3, 6, 6, 14, 2);
		ctx.fill();
		ctx.stroke();

		// Central notched wooden gear cog
		this.setupPath(ctx, "#D97706", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, 4, 6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Giant painted rattle frame (crimson & forest green)
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.roundRect(-14, -12, 28, 16, 4);
		ctx.fill();
		ctx.stroke();

		// Green center tongue / slat
		this.setupPath(ctx, "#16A34A", COLORS.ink, 2);
		ctx.beginPath();
		ctx.roundRect(-11, -9, 22, 10, 2);
		ctx.fill();
		ctx.stroke();

		// Rooster feathers crown on top
		this.setupPath(ctx, "#DC2626", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-6, -12);
		ctx.quadraticCurveTo(-12, -22, -4, -20);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.setupPath(ctx, "#15803D", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(0, -12);
		ctx.quadraticCurveTo(0, -24, 6, -19);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Fluttering carnival ribbons
		ctx.strokeStyle = "#F59E0B";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-10, -4);
		ctx.quadraticCurveTo(-18 + Math.sin(time * 6) * 4, -2, -16, 8);
		ctx.stroke();

		ctx.strokeStyle = "#EC4899";
		ctx.beginPath();
		ctx.moveTo(10, -4);
		ctx.quadraticCurveTo(18 + Math.cos(time * 6) * 4, -2, 16, 8);
		ctx.stroke();

		ctx.restore();
	},
	drawBabickaApron(ctx, x, y, time) {
		const bob = Math.sin(time * 4.5) * 3.5;
		ctx.save();
		ctx.translate(x, y + bob);
		const sway = Math.sin(time * 3) * 0.12;
		ctx.rotate(sway);

		// Shadow & breezy gale swirl
		ctx.fillStyle = "rgba(96, 165, 250, 0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 16, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Apron waistband
		this.setupPath(ctx, "#1E3A8A", COLORS.ink, 2);
		ctx.fillRect(-12, -14, 24, 4);
		ctx.strokeRect(-12, -14, 24, 4);

		// Blue linen apron skirt with folk billow
		const waveX = Math.sin(time * 4) * 3;
		this.setupPath(ctx, "#1D4ED8", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-10, -10);
		ctx.bezierCurveTo(-15, 0, -16 + waveX, 10, -13, 14);
		ctx.bezierCurveTo(-6, 16, 6, 16, 13, 14);
		ctx.bezierCurveTo(16 - waveX, 10, 15, 0, 10, -10);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Red scalloped folk embroidery hem
		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-12, 12);
		for (let i = -10; i <= 12; i += 4) {
			ctx.quadraticCurveTo(i - 2, 14.5, i, 12);
		}
		ctx.stroke();

		// Crisp white polka dots
		ctx.fillStyle = "#FFFFFF";
		const dots = [
			[-7, -5], [0, -6], [7, -5],
			[-9, 0], [-2, 0], [5, 1],
			[-7, 6], [1, 6], [8, 7],
			[-3, 10], [4, 11]
		];
		for (const [dx, dy] of dots) {
			ctx.beginPath();
			ctx.arc(dx, dy, 1.4, 0, Math.PI * 2);
			ctx.fill();
		}

		// Apron bow & ribbons fluttering in autumn gale
		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-10, -13);
		ctx.quadraticCurveTo(-18, -16 + Math.sin(time * 5) * 3, -15, -6);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(10, -13);
		ctx.quadraticCurveTo(18, -16 + Math.cos(time * 5) * 3, 15, -6);
		ctx.stroke();

		ctx.restore();
	},
	drawSlivoviceJug(ctx, x, y, time) {
		const bob = Math.sin(time * 5) * 3.5;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(Math.sin(time * 2) * 0.08);

		// Shadow & purple-blue aura
		ctx.fillStyle = "rgba(168, 85, 247, 0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 14, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Jug body - glazed cobalt ceramic with bulbous belly
		const jugGrad = ctx.createLinearGradient(-12, -14, 12, 14);
		jugGrad.addColorStop(0, "#3B82F6");
		jugGrad.addColorStop(0.5, "#1D4ED8");
		jugGrad.addColorStop(1, "#1E3A8A");

		this.setupPath(ctx, jugGrad, COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(-5, -14);
		ctx.lineTo(5, -14);
		ctx.bezierCurveTo(7, -8, 14, -2, 14, 6);
		ctx.bezierCurveTo(14, 14, -14, 14, -14, 6);
		ctx.bezierCurveTo(-14, -2, -7, -8, -5, -14);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Jug neck & rim
		this.setupPath(ctx, "#60A5FA", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(0, -14, 6, 2.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Ceramic loop handle on left
		this.setupPath(ctx, "#1E3A8A", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.arc(-11, -2, 6, -Math.PI / 2, Math.PI / 2, true);
		ctx.stroke();

		// Painted Damson purple plum & folk yellow sun on belly
		ctx.fillStyle = "#FBBF24";
		ctx.beginPath();
		ctx.arc(0, 2, 4.5, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "#7E22CE";
		ctx.beginPath();
		ctx.ellipse(-2, 5, 3.2, 4.2, -0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(2, 5, 3.2, 4.2, 0.3, 0, Math.PI * 2);
		ctx.fill();

		// Ceramic gloss highlight
		ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(7, -2);
		ctx.quadraticCurveTo(11, 3, 9, 8);
		ctx.stroke();

		ctx.restore();
	},
	drawSvandaBagpipes(ctx, x, y, time) {
		const bob = Math.sin(time * 5.2) * 3.5;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(Math.sin(time * 3) * 0.12);

		// Shadow & chaos polka aura
		ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 15, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Tanned goat-skin reservoir bag
		const bagGrad = ctx.createLinearGradient(-12, -6, 12, 10);
		bagGrad.addColorStop(0, "#D97706");
		bagGrad.addColorStop(0.5, "#B45309");
		bagGrad.addColorStop(1, "#78350F");

		this.setupPath(ctx, bagGrad, COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.ellipse(0, 4, 14, 10, 0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Goat fur trim tufts
		ctx.fillStyle = "#FEF3C7";
		for (let i = -10; i <= 8; i += 4) {
			ctx.beginPath();
			ctx.arc(i, 11, 2.5, 0, Math.PI);
			ctx.fill();
		}

		// Carved wooden goat head stock on left top
		this.setupPath(ctx, "#92400E", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-10, -6, 5, 4, -0.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Wooden horns
		ctx.strokeStyle = "#451A03";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(-11, -8);
		ctx.quadraticCurveTo(-16, -16, -12, -18);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-8, -8);
		ctx.quadraticCurveTo(-4, -16, -6, -18);
		ctx.stroke();

		// Twin wooden chanter pipes reaching down-right
		this.setupPath(ctx, "#451A03", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(4, 6, 3, 14);
		ctx.rect(9, 5, 3, 14);
		ctx.fill();
		ctx.stroke();

		// Brass ferrule rings
		ctx.fillStyle = "#FBBF24";
		ctx.fillRect(3.5, 9, 4, 2);
		ctx.fillRect(8.5, 8, 4, 2);

		ctx.restore();
	},
	drawKominikButton(ctx, x, y, time) {
		const bob = Math.sin(time * 5) * 3.5;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(time * 1.2);

		// Shadow & lucky gold-soot aura
		ctx.fillStyle = "rgba(253, 224, 71, 0.25)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(38, 23, 14, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 14, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Bone button crusted in coal soot
		const btnGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
		btnGrad.addColorStop(0, "#D6D3D1"); // Center bone
		btnGrad.addColorStop(0.5, "#44403C");
		btnGrad.addColorStop(1, "#1C1917"); // Sooty rim

		this.setupPath(ctx, btnGrad, COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.arc(0, 0, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Inner recessed groove rim
		ctx.strokeStyle = "rgba(0,0,0,0.75)";
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(0, 0, 9, 0, Math.PI * 2);
		ctx.stroke();

		// Four button holes
		ctx.fillStyle = "#1C1917";
		const holes = [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]];
		for (const [hx, hy] of holes) {
			ctx.beginPath();
			ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}

		// Frayed red hemp thread crossing holes
		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 2.4;
		ctx.beginPath();
		ctx.moveTo(-3.5, -3.5);
		ctx.lineTo(3.5, 3.5);
		ctx.moveTo(3.5, -3.5);
		ctx.lineTo(-3.5, 3.5);
		ctx.stroke();

		// Frayed hemp thread tail trailing outward
		ctx.strokeStyle = "#EF4444";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(8, 12, 16 + Math.sin(time * 6) * 3, 14);
		ctx.stroke();

		// Drifting velvety soot specks
		ctx.fillStyle = "#292524";
		for (let i = 0; i < 4; i++) {
			const sa = time * 2.5 + i * 1.5;
			const sx = Math.cos(sa) * 15;
			const sy = Math.sin(sa) * 15;
			ctx.beginPath();
			ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawHorseshoe(ctx, x, y, time) {
		const bob = Math.sin(time * 4) * 3;
		ctx.save();
		ctx.translate(x, y + bob);

		// Golden luck magnetic glow
		ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
		ctx.beginPath();
		ctx.arc(0, 0, 22, 0, Math.PI * 2);
		ctx.fill();

		// Soft shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.25)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 12, 4, 0, 0, Math.PI * 2);
		ctx.fill();

		// Forged iron horseshoe in traditional lucky 'U' posture
		const ironGrad = ctx.createLinearGradient(-10, -12, 10, 12);
		ironGrad.addColorStop(0, "#F59E0B");
		ironGrad.addColorStop(0.5, "#D97706");
		ironGrad.addColorStop(1, "#92400E");

		ctx.strokeStyle = ironGrad;
		ctx.lineWidth = 6.5;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.arc(0, 2, 10, Math.PI * 0.15, Math.PI * 0.85, true);
		ctx.stroke();

		// Inky outer and inner contour
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(0, 2, 13.5, Math.PI * 0.15, Math.PI * 0.85, true);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 2, 6.5, Math.PI * 0.15, Math.PI * 0.85, true);
		ctx.stroke();

		// Punched rectangular nail holes (6 holes: 3 on each side)
		ctx.fillStyle = "#1C1917";
		const holes = [
			[-9, -4], [-10, 2], [-8, 7],
			[9, -4], [10, 2], [8, 7]
		];
		for (const [hx, hy] of holes) {
			ctx.fillRect(hx - 1.2, hy - 1.2, 2.4, 2.4);
		}

		// Magnetic pulse arcs
		const pulse = (time * 2) % 1;
		ctx.strokeStyle = `rgba(234, 179, 8, ${0.7 * (1 - pulse)})`;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(0, 0, 14 + pulse * 12, 0, Math.PI * 2);
		ctx.stroke();

		ctx.restore();
	},
	drawRooster(ctx, x, y, time) {
		const bob = Math.sin(time * 4.5) * 3;
		const tilt = Math.sin(time * 2.2) * 0.08;
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.rotate(tilt);

		// Dawn sunlight aura
		ctx.fillStyle = "rgba(254, 240, 138, 0.28)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		// Soft shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.25)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob, 14, 5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Folk painted clay rooster body (Hliněný malovaný kohoutek)
		this.setupPath(ctx, "#FFFBEB", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(-2, 3, 11, 8, -0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Tail feathers: ornate curving arches painted in folk red and green
		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(-10, 3);
		ctx.quadraticCurveTo(-18, -4, -14, -14);
		ctx.stroke();

		ctx.strokeStyle = "#16A34A";
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(-8, 4);
		ctx.quadraticCurveTo(-15, -2, -10, -12);
		ctx.stroke();

		// Head & neck
		this.setupPath(ctx, "#FFFBEB", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(7, -6, 6.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Bright red cock's comb (hřebínek)
		this.setupPath(ctx, "#EF4444", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(5, -13, 3, 0, Math.PI * 2);
		ctx.arc(8, -14, 3.2, 0, Math.PI * 2);
		ctx.arc(11, -12, 2.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Yellow beak
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.moveTo(13, -7);
		ctx.lineTo(19, -5);
		ctx.lineTo(13, -3);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Inky eye
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(9, -7, 1.4, 0, Math.PI * 2);
		ctx.fill();

		// Folk floral dots on wing
		ctx.fillStyle = "#DC2626";
		ctx.beginPath();
		ctx.arc(0, 2, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#2563EB";
		ctx.beginPath();
		ctx.arc(-4, 4, 1.6, 0, Math.PI * 2);
		ctx.arc(4, 3, 1.6, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawCuckooClock(ctx, x, y, time) {
		const bob = Math.sin(time * 3.5) * 2.5;
		ctx.save();
		ctx.translate(x, y + bob);

		// Time distortion aura
		ctx.fillStyle = "rgba(192, 132, 252, 0.2)";
		ctx.beginPath();
		ctx.arc(0, 0, 23, 0, Math.PI * 2);
		ctx.fill();

		// Shadow
		ctx.fillStyle = "rgba(38, 23, 14, 0.25)";
		ctx.beginPath();
		ctx.ellipse(0, 18 - bob, 13, 4, 0, 0, Math.PI * 2);
		ctx.fill();

		// Chalet wooden roof
		this.setupPath(ctx, "#78350F", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(0, -18);
		ctx.lineTo(15, -7);
		ctx.lineTo(12, -5);
		ctx.lineTo(0, -14);
		ctx.lineTo(-12, -5);
		ctx.lineTo(-15, -7);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Clock house body
		this.setupPath(ctx, "#B45309", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.roundRect(-10, -7, 20, 19, 2);
		ctx.fill();
		ctx.stroke();

		// Upper door with peeking painted wooden cuckoo bird
		ctx.fillStyle = "#451A03";
		ctx.fillRect(-4, -6, 8, 5);
		ctx.fillStyle = "#38BDF8";
		ctx.beginPath();
		ctx.arc(0, -3.5, 2.5, 0, Math.PI * 2);
		ctx.fill();

		// Clock face
		this.setupPath(ctx, "#FEF3C7", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(0, 4, 6.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Clock hands frozen at midnight / noon
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(0, 4);
		ctx.lineTo(0, 0);
		ctx.moveTo(0, 4);
		ctx.lineTo(3.5, 4);
		ctx.stroke();

		// Swaying pendulum
		const pendAngle = Math.sin(time * 6) * 0.35;
		ctx.save();
		ctx.translate(0, 12);
		ctx.rotate(pendAngle);
		ctx.strokeStyle = "#D97706";
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 9);
		ctx.stroke();
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(0, 9, 2.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		ctx.restore();
	},
	drawAnanas(ctx, x, y, time) {
		const bob = Math.sin(time * 4) * 3;
		ctx.save();
		ctx.translate(x, y + bob);

		// Imperial honey-gold aura
		ctx.fillStyle = "rgba(251, 191, 36, 0.26)";
		ctx.beginPath();
		ctx.arc(0, 0, 24, 0, Math.PI * 2);
		ctx.fill();

		// Ground shadow
		ctx.fillStyle = "rgba(45, 22, 9, 0.35)";
		ctx.beginPath();
		ctx.ellipse(0, 16 - bob * 0.5, 12, 4.5, 0, 0, Math.PI * 2);
		ctx.fill();

		// Pineapple fruit body (oval pine)
		ctx.fillStyle = "#F59E0B";
		ctx.strokeStyle = "#2D1609";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.ellipse(0, 2, 10.5, 14, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Diamond crosshatch texture with little amber centers
		ctx.save();
		ctx.beginPath();
		ctx.ellipse(0, 2, 10, 13.5, 0, 0, Math.PI * 2);
		ctx.clip();

		ctx.strokeStyle = "#B45309";
		ctx.lineWidth = 1.2;
		for (let d = -16; d <= 16; d += 6) {
			ctx.beginPath();
			ctx.moveTo(d - 12, -14);
			ctx.lineTo(d + 12, 18);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(d + 12, -14);
			ctx.lineTo(d - 12, 18);
			ctx.stroke();
		}

		// Amber scale dots
		ctx.fillStyle = "#78350F";
		for (let row = -10; row <= 12; row += 6) {
			for (let col = -7; col <= 7; col += 6) {
				ctx.beginPath();
				ctx.arc(col, row + 2, 1.2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
		ctx.restore();

		// Imperial Crown of Palm/Pineapple leaves (radiating emerald spires)
		const leafAngles = [-0.65, -0.38, -0.15, 0.15, 0.38, 0.65];
		const leafLengths = [12, 16, 19, 19, 16, 12];
		for (let l = 0; l < leafAngles.length; l++) {
			const la = leafAngles[l];
			const len = leafLengths[l];
			ctx.save();
			ctx.translate(0, -11);
			ctx.rotate(la);

			ctx.fillStyle = l % 2 === 0 ? "#15803D" : "#16A34A";
			ctx.strokeStyle = "#14532D";
			ctx.lineWidth = 1.5;

			ctx.beginPath();
			ctx.moveTo(-2.5, 0);
			ctx.quadraticCurveTo(-1.5, -len * 0.6, 0, -len);
			ctx.quadraticCurveTo(1.5, -len * 0.6, 2.5, 0);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.restore();
		}

		// Little imperial golden crown band at the leaf base
		ctx.fillStyle = "#FDE047";
		ctx.strokeStyle = "#854D0E";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.roundRect(-5, -12, 10, 3.5, 1.5);
		ctx.fill();
		ctx.stroke();

		// Drifting royal sparkle stars
		for (let s = 0; s < 3; s++) {
			const sa = time * 3.5 + s * 2.1;
			const sx = Math.cos(sa) * 16;
			const sy = Math.sin(sa) * 16;
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	},
	drawFrostBorder(ctx, width, height, alpha = 1) {
		if (alpha <= 0) return;
		ctx.save();
		ctx.globalAlpha = Math.min(1, alpha);

		// Outer winter ice vignette gradient
		const gradT = ctx.createLinearGradient(0, 0, 0, 70);
		gradT.addColorStop(0, "rgba(224, 242, 254, 0.85)");
		gradT.addColorStop(1, "rgba(224, 242, 254, 0)");
		ctx.fillStyle = gradT;
		ctx.fillRect(0, 0, width, 70);

		const gradB = ctx.createLinearGradient(0, height, 0, height - 70);
		gradB.addColorStop(0, "rgba(224, 242, 254, 0.85)");
		gradB.addColorStop(1, "rgba(224, 242, 254, 0)");
		ctx.fillStyle = gradB;
		ctx.fillRect(0, height - 70, width, 70);

		const gradL = ctx.createLinearGradient(0, 0, 70, 0);
		gradL.addColorStop(0, "rgba(224, 242, 254, 0.85)");
		gradL.addColorStop(1, "rgba(224, 242, 254, 0)");
		ctx.fillStyle = gradL;
		ctx.fillRect(0, 0, 70, height);

		const gradR = ctx.createLinearGradient(width, 0, width - 70, 0);
		gradR.addColorStop(0, "rgba(224, 242, 254, 0.85)");
		gradR.addColorStop(1, "rgba(224, 242, 254, 0)");
		ctx.fillStyle = gradR;
		ctx.fillRect(width - 70, 0, 70, height);

		// Delicate crystalline frost spikes along corners
		ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
		ctx.lineWidth = 2.4;
		const corners = [
			[0, 0, 1, 1],
			[width, 0, -1, 1],
			[0, height, 1, -1],
			[width, height, -1, -1]
		];
		for (const [cx, cy, sx, sy] of corners) {
			for (let i = 0; i < 7; i++) {
				const len = 35 + (i % 3) * 18;
				const ang = (i / 6) * (Math.PI / 2);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + Math.cos(ang) * len * sx, cy + Math.sin(ang) * len * sy);
				ctx.stroke();
			}
		}

		ctx.restore();
	},
	drawPonocnyNightOverlay(ctx, width, height, progress = 1) {
		ctx.save();
		const alpha = Math.min(1, progress);
		ctx.globalAlpha = alpha;

		const midX = width / 2;
		const midY = Math.min(120, height * 0.18);

		// Heavy inky folk cartouche background
		ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
		ctx.strokeStyle = "#38BDF8";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.roundRect(midX - 180, midY - 60, 360, 95, 14);
		ctx.fill();
		ctx.stroke();

		// Stylized heavy-inked silhouette of the village night watchman
		ctx.save();
		ctx.translate(midX - 120, midY - 10);
		// Felt cap
		this.setupPath(ctx, "#1E293B", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -14, 12, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		// Face with puffed rosy cheeks
		this.setupPath(ctx, "#FDE68A", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -5, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Puffed rosy cheek
		ctx.fillStyle = "#F87171";
		ctx.beginPath();
		ctx.arc(6, -4, 5, 0, Math.PI * 2);
		ctx.fill();
		// Cow horn blown forward
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.moveTo(8, -5);
		ctx.quadraticCurveTo(18, -12, 28, -6);
		ctx.lineTo(30, -2);
		ctx.quadraticCurveTo(18, -8, 8, -2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Title & Chant Banner
		ctx.fillStyle = "#E0F2FE";
		ctx.font = "900 17px Eczar, serif";
		ctx.textAlign = "left";
		ctx.fillText("TROUBA OBECNÍHO PONOCNÉHO", midX - 70, midY - 22);

		ctx.fillStyle = "#38BDF8";
		ctx.font = "bold 13px 'Cinzel', serif";
		ctx.fillText("„Chval každý duch Hospodina!“", midX - 70, midY - 2);

		ctx.fillStyle = "#BAE6FD";
		ctx.font = "italic 11px Arial, sans-serif";
		ctx.fillText("Čas zastaven na 5 sekund • Mrazivé zimní ticho", midX - 70, midY + 18);

		ctx.restore();
	},
	drawKominikOverlay(ctx, width, height, progress = 1) {
		ctx.save();
		const alpha = Math.min(1, progress);
		ctx.globalAlpha = alpha;

		const midX = width / 2;
		const midY = Math.min(120, height * 0.18);

		ctx.fillStyle = "rgba(24, 24, 27, 0.9)";
		ctx.strokeStyle = "#FDE047";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.roundRect(midX - 180, midY - 60, 360, 95, 14);
		ctx.fill();
		ctx.stroke();

		// Cheeky sweep silhouette tipping top hat
		ctx.save();
		ctx.translate(midX - 120, midY - 10);
		// Sooty face
		this.setupPath(ctx, "#44403C", COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -4, 11, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Cheerful white smile & wink
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(0, -2, 5, 0.2, Math.PI - 0.2);
		ctx.stroke();
		// Tipped top hat
		this.setupPath(ctx, "#18181B", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.roundRect(-4, -28, 16, 15, 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillRect(-10, -15, 26, 4);
		ctx.strokeRect(-10, -15, 26, 4);
		// Wire brush over shoulder
		ctx.strokeStyle = "#A1A1AA";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-12, 10);
		ctx.lineTo(-20, -16);
		ctx.stroke();
		ctx.restore();

		ctx.fillStyle = "#FEF08A";
		ctx.font = "900 17px Eczar, serif";
		ctx.textAlign = "left";
		ctx.fillText("KOMINICKÝ KNOFLÍK PRO ŠTĚSTÍ", midX - 70, midY - 22);

		ctx.fillStyle = "#FDE047";
		ctx.font = "bold 13px 'Cinzel', serif";
		ctx.fillText("„Štěstí v kapse, saze v očích!“", midX - 70, midY - 2);

		ctx.fillStyle = "#E4E4E7";
		ctx.font = "italic 11px Arial, sans-serif";
		ctx.fillText("Nehmotnost & maximální kritické zásahy na 7 s", midX - 70, midY + 18);

		ctx.restore();
	},
	drawSlivoviceVapor(ctx, x, y, dirAngle = 0, life = 1) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(dirAngle);
		ctx.globalAlpha = Math.min(0.42, life * 0.48);

		const vaporGrad = ctx.createRadialGradient(40, 0, 10, 80, 0, 95);
		vaporGrad.addColorStop(0, "rgba(59, 130, 246, 0.35)");
		vaporGrad.addColorStop(0.6, "rgba(147, 51, 234, 0.22)");
		vaporGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

		ctx.fillStyle = vaporGrad;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, 140, -Math.PI / 2, Math.PI / 2);
		ctx.closePath();
		ctx.fill();

		// Flickering blue flames in the spirit vapor
		ctx.strokeStyle = "rgba(96, 165, 250, 0.65)";
		ctx.lineWidth = 2.0;
		for (let i = -3; i <= 3; i++) {
			const fa = (i / 4) * (Math.PI / 2.5);
			const dist = 50 + Math.abs(i) * 15;
			ctx.beginPath();
			ctx.moveTo(Math.cos(fa) * dist, Math.sin(fa) * dist);
			ctx.quadraticCurveTo(Math.cos(fa) * (dist + 15), Math.sin(fa) * (dist + 15) - 6, Math.cos(fa) * (dist + 25), Math.sin(fa) * (dist + 25));
			ctx.stroke();
		}

		ctx.restore();
	},
	drawSvandaBrawlCloud(ctx, x, y, time) {
		ctx.save();
		ctx.translate(x, y);
		const shake = Math.sin(time * 25) * 3;

		// Comic tangled dust cloud
		ctx.fillStyle = "rgba(241, 245, 249, 0.85)";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2.4;

		const puffs = [
			[-16, -10, 14], [0, -18, 16], [16, -10, 14],
			[-18, 6, 15], [0, 14, 16], [18, 6, 15],
			[-8, -2, 17], [8, -2, 17]
		];
		for (const [px, py, pr] of puffs) {
			ctx.beginPath();
			ctx.arc(px + shake, py + shake, pr, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}

		// Pitchfork poking out
		ctx.strokeStyle = "#475569";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.moveTo(12, -12);
		ctx.lineTo(26, -24);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(22, -26);
		ctx.lineTo(28, -20);
		ctx.stroke();

		// Boot kicking out
		ctx.fillStyle = "#1E293B";
		ctx.strokeStyle = COLORS.ink;
		ctx.beginPath();
		ctx.roundRect(-26, 4, 12, 6, 2);
		ctx.fill();
		ctx.stroke();

		// Comic impact star
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(0, -6, 6, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	},
	drawSootFootprint(ctx, x, y, angle = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.fillStyle = "rgba(24, 24, 27, 0.72)";
		// Boot heel & sole
		ctx.beginPath();
		ctx.ellipse(0, 5, 4, 3, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(0, -3, 5, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawMasopustShockwave(ctx, x, y, radius, time) {
		ctx.save();
		ctx.translate(x, y);

		// Lingering shockwave deflection barrier
		const pulse = Math.sin(time * 10) * 4;
		ctx.strokeStyle = "#EF4444";
		ctx.lineWidth = 3.5;
		ctx.beginPath();
		ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
		ctx.stroke();

		ctx.strokeStyle = "#10B981";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, radius + pulse - 6, 0, Math.PI * 2);
		ctx.stroke();

		// Festive deflection sparklets
		for (let i = 0; i < 8; i++) {
			const ang = (i / 8) * Math.PI * 2 + time * 3;
			const sx = Math.cos(ang) * radius;
			const sy = Math.sin(ang) * radius;
			ctx.fillStyle = i % 2 === 0 ? "#F59E0B" : "#EC4899";
			ctx.fillRect(sx - 2, sy - 2, 4, 4);
		}

		ctx.restore();
	},
	drawChasnik(ctx, x, y, time, panicked) {
		ctx.save();
		ctx.translate(x, y);
		this.drawLimb(ctx, -5, 8, -4, 22, "#2A4B7C", 7);
		this.drawLimb(ctx, 5, 8, 4, 22, "#2A4B7C", 7);
		this.setupPath(ctx, COLORS.white, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
		ctx.fillRect(-10, -8, 20, 14);
		ctx.strokeRect(-10, -8, 20, 14);
		if (panicked) {
			const armSwing = Math.sin(time * 15) * 12;
			this.drawLimb(ctx, -8, -6, -20 + armSwing, -18, COLORS.white, 6);
			this.drawLimb(ctx, 8, -6, 20 - armSwing, -18, COLORS.white, 6);
		} else {
			this.drawLimb(ctx, -8, -6, -14, 8, COLORS.white, 6);
			this.drawLimb(ctx, 8, -6, 16, -6, COLORS.white, 6);
			ctx.fillStyle = COLORS.grey;
			ctx.beginPath();
			ctx.arc(16, -6, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}
		this.setupPath(ctx, COLORS.skin);
		ctx.beginPath();
		ctx.arc(0, -18, 10, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.red, COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.arc(0, -22, 11, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			ctx.save();
			ctx.translate(14, -36);
			this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
			ctx.beginPath();
			ctx.ellipse(12, -4, 20, 11, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.red;
			ctx.font = "900 11px Eczar";
			ctx.textAlign = "center";
			ctx.fillText("POMOC!", 12, 0);
			ctx.restore();
		}
		ctx.restore();
	},
	drawGrandfather(ctx, x, y, time, vx = 0, isMoving = false, facingDir = 1, isInteracting = false, scale = 1.15) {
		const dir = facingDir < 0 ? -1 : 1;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale * dir, scale);

		// 1. Limp & gait mechanics
		const walkFreq = isMoving ? 8.2 : 2.4;
		const phase = time * walkFreq;
		// Asymmetrical limp: sharp stomp on the cloven hoof (right), softer rolling step on the boot (left)
		const hoofStomp = isMoving ? Math.max(0, Math.sin(phase)) : 0;
		const bootStep = isMoving ? Math.max(0, -Math.sin(phase)) : 0;
		const limpBob = isMoving ? (hoofStomp * 6.5 - bootStep * 3.2) : Math.sin(time * 2.2) * 1.8;
		const limpTilt = isMoving ? Math.sin(phase) * 0.12 : Math.sin(time * 1.8) * 0.035;
		const hoofSwing = isMoving ? Math.sin(phase) * 15 : 0;
		const bootSwing = isMoving ? -Math.sin(phase) * 18 : 0;

		// 2. Ground shadow with limp squash
		const shadowRx = 32 + (isMoving ? hoofStomp * 4 : 0);
		const shadowRy = 11 + (isMoving ? hoofStomp * 2 : 0);
		ctx.fillStyle = "rgba(24, 14, 8, 0.28)";
		ctx.beginPath();
		ctx.ellipse(0, 35, shadowRx, shadowRy, 0, 0, Math.PI * 2);
		ctx.fill();

		// Footstep dust puffs when the heavy hoof hits ground during walk
		if (isMoving && hoofStomp > 0.75) {
			this.drawRunDust(ctx, 10, 36, time);
		}

		// Subtle golden warm aura when idle or interacting
		if (isInteracting) {
			ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
			ctx.beginPath();
			ctx.arc(0, 0, 58 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
			ctx.fill();
		}

		// 3. Tail: Sinuous devil tail with black bushy tuft
		const tailPhase = time * 3.4;
		const tailSwing = Math.sin(tailPhase) * 12 + (isMoving ? Math.sin(phase) * 7 : 0);
		const tailStartX = -16;
		const tailStartY = 14 + limpBob * 0.5;
		const tailMidX = -38 + Math.cos(tailPhase) * 4;
		const tailMidY = 18 + tailSwing * 0.6;
		const tailTipX = -48 + Math.sin(tailPhase) * 6;
		const tailTipY = -2 + tailSwing;

		ctx.save();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(tailStartX, tailStartY);
		ctx.quadraticCurveTo(tailMidX, tailMidY, tailTipX, tailTipY);
		ctx.stroke();

		ctx.strokeStyle = "#DC2626";
		ctx.lineWidth = 3.8;
		ctx.beginPath();
		ctx.moveTo(tailStartX, tailStartY);
		ctx.quadraticCurveTo(tailMidX, tailMidY, tailTipX, tailTipY);
		ctx.stroke();

		// Bushy tuft at tip of tail
		ctx.fillStyle = "#1C1917";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.ellipse(tailTipX, tailTipY, 9, 6, Math.PI / 4 + tailSwing * 0.05, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Tufts
		for (let ti = 0; ti < 4; ti++) {
			const ta = (ti / 4) * Math.PI - 0.4;
			ctx.beginPath();
			ctx.moveTo(tailTipX, tailTipY);
			ctx.lineTo(tailTipX - Math.cos(ta) * 9, tailTipY - Math.sin(ta) * 9);
			ctx.stroke();
		}
		ctx.restore();

		// 4. Back Wicker Basket ("Kramářská nůše plná pokladů")
		ctx.save();
		const basketSway = -limpTilt * 22 + Math.sin(time * 2.6) * 1.5;
		const bx = -22;
		const by = -14 + limpBob;
		ctx.translate(bx, by);
		ctx.rotate(basketSway * 0.035);

		// Straps over back
		this.setupPath(ctx, "#451A03", COLORS.ink, 3);
		ctx.strokeRect(-18, -32, 38, 48);

		// Basket Body (woven wicker)
		const bGrad = ctx.createLinearGradient(-22, -32, 22, 32);
		bGrad.addColorStop(0, "#D97706");
		bGrad.addColorStop(0.5, "#B45309");
		bGrad.addColorStop(1, "#78350F");
		this.setupPath(ctx, bGrad, COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-20, -32);
		ctx.lineTo(24, -34);
		ctx.quadraticCurveTo(28, 2, 18, 30);
		ctx.lineTo(-14, 28);
		ctx.quadraticCurveTo(-24, 2, -20, -32);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Wicker cross-hatch weaving texture
		ctx.strokeStyle = "rgba(92, 40, 10, 0.65)";
		ctx.lineWidth = 1.6;
		for (let row = -24; row < 24; row += 7) {
			ctx.beginPath();
			ctx.moveTo(-18, row);
			ctx.lineTo(22, row);
			ctx.stroke();
		}
		for (let col = -14; col < 20; col += 7) {
			ctx.beginPath();
			ctx.moveTo(col, -30);
			ctx.lineTo(col - 3, 26);
			ctx.stroke();
		}

		// Braided basket top rim
		this.setupPath(ctx, "#92400E", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(2, -33, 23, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Wares inside the basket:
		// A. Malovaná dřevěná truhlička (painted chest)
		this.setupPath(ctx, "#78350F", COLORS.ink, 2.5);
		ctx.fillRect(-14, -54, 22, 22);
		ctx.strokeRect(-14, -54, 22, 22);
		// Iron corner brackets and lock
		ctx.fillStyle = "#292524";
		ctx.fillRect(-15, -55, 5, 5);
		ctx.fillRect(4, -55, 5, 5);
		ctx.fillStyle = "#F59E0B";
		ctx.fillRect(-4, -46, 5, 6);
		// Painted red folk flower on chest
		ctx.fillStyle = "#DC2626";
		ctx.beginPath();
		ctx.arc(-2, -49, 2.6, 0, Math.PI * 2);
		ctx.fill();

		// B. Svinutý koberec / peřinka (rolled striped blanket)
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(12, -45, 9, 13, 0.35, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Gold folk stripes on blanket
		ctx.strokeStyle = "#FBBF24";
		ctx.lineWidth = 2.2;
		ctx.beginPath();
		ctx.arc(11, -45, 6, -1.2, 1.2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(13, -45, 6, -1.2, 1.2);
		ctx.stroke();

		// C. Pytel se semínky / kořením (burlap grain sack)
		this.setupPath(ctx, "#D6C7A1", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.ellipse(-2, -38, 11, 8, -0.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = "#78350F";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(-4, -44);
		ctx.lineTo(0, -44);
		ctx.stroke();

		// D. Malá zvědavá myška (cute field mouse peeking out)
		const mouseTwitch = Math.sin(time * 6.5) > 0.82 ? 1.8 : 0;
		ctx.fillStyle = "#78716C";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.ellipse(-8, -43 + mouseTwitch * 0.3, 5, 4.2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Ears
		ctx.fillStyle = "#FDA4AF";
		ctx.beginPath();
		ctx.arc(-11, -47 + mouseTwitch, 2.4, 0, Math.PI * 2);
		ctx.arc(-6, -47 - mouseTwitch, 2.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Eyes & Nose
		ctx.fillStyle = "#111";
		ctx.beginPath();
		ctx.arc(-9, -43, 1, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#F43F5E";
		ctx.beginPath();
		ctx.arc(-11.5, -42, 1, 0, Math.PI * 2);
		ctx.fill();

		// E. Plechová konvička (tin mug / can dangling from basket)
		ctx.save();
		const canSway = Math.sin(time * (isMoving ? 8.2 : 2.5) + 1.2) * 0.25;
		ctx.translate(22, 12);
		ctx.rotate(canSway);
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(0, -8);
		ctx.lineTo(0, 0);
		ctx.stroke();
		this.setupPath(ctx, "#94A3B8", COLORS.ink, 1.8);
		ctx.fillRect(-3, 0, 7, 10);
		ctx.strokeRect(-3, 0, 7, 10);
		// Handle
		ctx.beginPath();
		ctx.arc(4, 5, 3, -Math.PI / 2, Math.PI / 2);
		ctx.stroke();
		ctx.restore();

		// F. Plechová svítící lucerna (lantern hanging on side of basket)
		ctx.save();
		const lanternSway = Math.sin(time * (isMoving ? 8.2 : 2.5) + 0.5) * 0.28;
		ctx.translate(-19, 6);
		ctx.rotate(lanternSway);
		// Chain / cord
		ctx.strokeStyle = "#475569";
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(0, -10);
		ctx.lineTo(0, 0);
		ctx.stroke();
		// Lantern cap
		this.setupPath(ctx, "#334155", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(-5, 0);
		ctx.lineTo(5, 0);
		ctx.lineTo(0, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Glass with warm candlelight
		this.setupPath(ctx, "#FEF08A", COLORS.ink, 1.8);
		ctx.fillRect(-4, 0, 8, 11);
		ctx.strokeRect(-4, 0, 8, 11);
		// Flame inside
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.ellipse(0, 6, 2, 3.5, 0, 0, Math.PI * 2);
		ctx.fill();
		// Candle glow
		ctx.fillStyle = "rgba(253, 224, 71, 0.25)";
		ctx.beginPath();
		ctx.arc(0, 6, 12 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		ctx.restore(); // End Basket

		// 5. Legs & Asymmetrical Feet (Hoof vs Boot)
		// Right leg: The Cloven Hoof (Kopyto)
		ctx.save();
		const hx = 6 + hoofSwing;
		const hy = 24 + limpBob * 0.3;
		// Red breeches upper leg
		this.drawBentLimb(ctx, 4, 12 + limpBob, 6 + hoofSwing * 0.4, 22, hx, hy, "#991B1B", 9);
		// Shaggy fetlock fur (dark reddish-black wool above hoof)
		this.setupPath(ctx, "#2A1810", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(hx, hy + 2, 8, 5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Red fur tufts around ankle
		ctx.fillStyle = "#7F1D1D";
		ctx.beginPath();
		ctx.arc(hx - 4, hy + 1, 3, 0, Math.PI * 2);
		ctx.arc(hx + 4, hy + 1, 3, 0, Math.PI * 2);
		ctx.fill();
		// Heavy Cloven Hoof (Dark horn with central cleft)
		const hoofGroundY = 34;
		this.setupPath(ctx, "#1C1410", COLORS.ink, 2.6);
		ctx.beginPath();
		ctx.moveTo(hx - 8, hy + 4);
		ctx.quadraticCurveTo(hx - 9, hoofGroundY, hx - 5, hoofGroundY);
		ctx.lineTo(hx - 1, hoofGroundY);
		ctx.lineTo(hx - 1, hy + 7);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(hx + 1, hy + 7);
		ctx.lineTo(hx + 1, hoofGroundY);
		ctx.lineTo(hx + 7, hoofGroundY);
		ctx.quadraticCurveTo(hx + 9, hoofGroundY, hx + 8, hy + 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Horn highlight gleam
		ctx.fillStyle = "rgba(180, 140, 110, 0.45)";
		ctx.fillRect(hx - 7, hy + 6, 2.5, 4);
		ctx.fillRect(hx + 4, hy + 6, 2.5, 4);
		ctx.restore();

		// Left leg: The Laced Peddler's Leather Boot (Bota / Krpec)
		ctx.save();
		const bxLeg = -8 + bootSwing;
		const byLeg = 24 + limpBob * 0.3;
		// Red breeches
		this.drawBentLimb(ctx, -6, 12 + limpBob, -8 + bootSwing * 0.4, 22, bxLeg, byLeg, "#991B1B", 8);
		// Laced Leather Boot
		const bootGroundY = 34;
		this.setupPath(ctx, "#5C3A21", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(bxLeg - 6, byLeg);
		ctx.lineTo(bxLeg - 7, bootGroundY);
		ctx.lineTo(bxLeg + 9, bootGroundY);
		ctx.quadraticCurveTo(bxLeg + 10, bootGroundY - 4, bxLeg + 5, byLeg + 4);
		ctx.lineTo(bxLeg + 4, byLeg);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Thick dark sole
		ctx.fillStyle = "#261810";
		ctx.fillRect(bxLeg - 7.5, bootGroundY - 2.5, 17, 3);
		// Laces on boot
		ctx.strokeStyle = "#D97706";
		ctx.lineWidth = 1.4;
		ctx.beginPath();
		ctx.moveTo(bxLeg - 4, byLeg + 2);
		ctx.lineTo(bxLeg + 2, byLeg + 5);
		ctx.moveTo(bxLeg + 2, byLeg + 2);
		ctx.lineTo(bxLeg - 4, byLeg + 5);
		ctx.moveTo(bxLeg - 3, byLeg + 6);
		ctx.lineTo(bxLeg + 3, byLeg + 8);
		ctx.stroke();
		// Brass buckle
		ctx.fillStyle = "#F59E0B";
		ctx.fillRect(bxLeg - 6, byLeg + 4, 3, 3);
		ctx.restore();

		// 6. Torso & Patchwork Sheepskin Coat (Kožich)
		ctx.save();
		ctx.translate(0, limpBob);
		ctx.rotate(limpTilt);

		// Main coat shape (stout, round belly)
		const coatGrad = ctx.createLinearGradient(-24, -20, 24, 20);
		coatGrad.addColorStop(0, "#8C5E37");
		coatGrad.addColorStop(1, "#5E3A21");
		this.setupPath(ctx, coatGrad, COLORS.ink, 3.8);
		ctx.beginPath();
		ctx.moveTo(-18, -18);
		ctx.quadraticCurveTo(-26, 0, -22, 18);
		ctx.lineTo(20, 18);
		ctx.quadraticCurveTo(24, 0, 16, -18);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Colorful patches on the coat:
		// Patch 1: Folk crimson red patch with crosses (back sleeve/shoulder)
		this.setupPath(ctx, "#B91C1C", COLORS.ink, 1.8);
		ctx.fillRect(-17, -4, 11, 10);
		ctx.strokeRect(-17, -4, 11, 10);
		ctx.strokeStyle = "#1C1917";
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(-15, -2); ctx.lineTo(-13, 0); ctx.moveTo(-13, -2); ctx.lineTo(-15, 0);
		ctx.moveTo(-10, 2); ctx.lineTo(-8, 4); ctx.moveTo(-8, 2); ctx.lineTo(-10, 4);
		ctx.stroke();

		// Patch 2: Forest olive green patch (front lower)
		this.setupPath(ctx, "#4D7C0F", COLORS.ink, 1.8);
		ctx.fillRect(6, 4, 10, 9);
		ctx.strokeRect(6, 4, 10, 9);
		ctx.strokeStyle = "#FBBF24";
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		ctx.moveTo(8, 6); ctx.lineTo(10, 8); ctx.moveTo(10, 6); ctx.lineTo(8, 8);
		ctx.stroke();

		// Patch 3: Amber ochre patch
		this.setupPath(ctx, "#D97706", COLORS.ink, 1.8);
		ctx.fillRect(-6, 6, 9, 8);
		ctx.strokeRect(-6, 6, 9, 8);

		// Fluffy sheepskin shearling trim around bottom hem
		this.setupPath(ctx, "#FAF7EE", COLORS.ink, 3);
		ctx.beginPath();
		ctx.moveTo(-24, 18);
		for (let hx = -24; hx <= 20; hx += 7) {
			ctx.quadraticCurveTo(hx + 3.5, 23, hx + 7, 18);
		}
		ctx.quadraticCurveTo(24, 18, 20, 15);
		ctx.lineTo(-24, 15);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// Sheep wool curl details
		ctx.strokeStyle = "#D1C7B7";
		ctx.lineWidth = 1.2;
		for (let ci = -18; ci < 18; ci += 8) {
			ctx.beginPath();
			ctx.arc(ci, 18, 2.5, 0, Math.PI);
			ctx.stroke();
		}

		// Diagonal leather satchel strap across chest
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(-14, -18);
		ctx.lineTo(16, 12);
		ctx.stroke();
		ctx.strokeStyle = "#451A03";
		ctx.lineWidth = 3.6;
		ctx.beginPath();
		ctx.moveTo(-14, -18);
		ctx.lineTo(16, 12);
		ctx.stroke();
		// Brass satchel buckle
		ctx.fillStyle = "#F59E0B";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.fillRect(2, -2, 6, 6);
		ctx.strokeRect(2, -2, 6, 6);

		// Leather hip satchel (brašna)
		this.setupPath(ctx, "#5C3317", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.roundRect(10, 6, 14, 14, 3);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.roundRect(11, 7, 12, 7, 2);
		ctx.stroke();
		ctx.fillStyle = "#F59E0B";
		ctx.fillRect(15, 11, 3, 4);

		// Back arm resting on basket strap
		ctx.save();
		this.drawBentLimb(ctx, -14, -10, -22, -2, -12, 4, "#784D2B", 10);
		// Fluffy cuff
		this.setupPath(ctx, "#FAF7EE", COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(-14, 2, 5, 3.5, 0.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Red clawed hand holding strap
		this.setupPath(ctx, "#D34538", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.arc(-11, 4, 3.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Claws
		ctx.fillStyle = "#111";
		ctx.beginPath();
		ctx.arc(-10, 7, 1.2, 0, Math.PI * 2);
		ctx.arc(-8, 5, 1.2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
		ctx.restore(); // End Torso

		// 7. Head, Face, Beard, Horns & Hat
		ctx.save();
		const headBob = Math.sin(time * (isMoving ? 14 : 2.4)) * 1.6;
		ctx.translate(2, -28 + headBob);
		ctx.rotate(limpTilt * 0.4);

		// Big curved ram/devil horns (behind ears/hat)
		ctx.save();
		for (let hornSide of [-1, 1]) {
			ctx.save();
			ctx.scale(hornSide, 1);
			// Horn curve
			const hGrad = ctx.createLinearGradient(8, -12, 28, -38);
			hGrad.addColorStop(0, "#451A03");
			hGrad.addColorStop(0.6, "#2E180E");
			hGrad.addColorStop(1, "#180C07");
			this.setupPath(ctx, hGrad, COLORS.ink, 3.4);
			ctx.beginPath();
			ctx.moveTo(8, -12);
			ctx.bezierCurveTo(22, -22, 34, -18, 30, -38);
			ctx.bezierCurveTo(20, -32, 14, -22, 4, -14);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			// Ridges along the horn
			ctx.strokeStyle = "#8D5B32";
			ctx.lineWidth = 1.8;
			for (let ri = 0; ri < 5; ri++) {
				const rt = 0.2 + ri * 0.15;
				ctx.beginPath();
				const rx1 = 8 + rt * 18;
				const ry1 = -13 - rt * 18;
				ctx.moveTo(rx1, ry1);
				ctx.lineTo(rx1 - 4, ry1 + 3);
				ctx.stroke();
			}
			ctx.restore();
		}
		ctx.restore();

		// Devil Head base (red skin)
		this.setupPath(ctx, "#D34538", COLORS.ink, 3.2);
		ctx.beginPath();
		ctx.ellipse(0, -6, 17, 15, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Pointed devil ears
		for (let earSide of [-1, 1]) {
			this.setupPath(ctx, "#D34538", COLORS.ink, 2);
			ctx.beginPath();
			ctx.moveTo(earSide * 14, -8);
			ctx.lineTo(earSide * 25, -16);
			ctx.lineTo(earSide * 16, -2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			// Inner ear pink
			ctx.fillStyle = "#F87171";
			ctx.beginPath();
			ctx.moveTo(earSide * 15, -7);
			ctx.lineTo(earSide * 21, -13);
			ctx.lineTo(earSide * 16, -3);
			ctx.closePath();
			ctx.fill();
		}

		// Beranice (fur cap) crown
		this.setupPath(ctx, "#4A2E1B", COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -14, 18, Math.PI, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Fluffy sheepskin hat brim across forehead
		this.setupPath(ctx, "#FAF7EE", COLORS.ink, 2.8);
		ctx.beginPath();
		ctx.ellipse(0, -13, 20, 6, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Fluffy curls on hat brim
		ctx.strokeStyle = "#CFC4AF";
		ctx.lineWidth = 1.4;
		for (let bi = -14; bi < 16; bi += 6) {
			ctx.beginPath();
			ctx.arc(bi, -13, 2.2, 0, Math.PI);
			ctx.stroke();
		}

		// Expressive large cartoon eyes
		for (let eyeSide of [-1, 1]) {
			const eyeX = eyeSide * 7.5;
			const eyeY = -7;
			// White of eye
			this.setupPath(ctx, "#FFFDF7", COLORS.ink, 2);
			ctx.beginPath();
			ctx.arc(eyeX, eyeY, 5.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			// Pupil looking slightly toward camera/viewer
			ctx.fillStyle = "#111111";
			ctx.beginPath();
			ctx.arc(eyeX + 0.8, eyeY, 3, 0, Math.PI * 2);
			ctx.fill();
			// Specular sparkle
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.arc(eyeX + 1.8, eyeY - 1.2, 1.2, 0, Math.PI * 2);
			ctx.fill();

			// Bushy white eyebrow
			ctx.fillStyle = "#F5F3ED";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 1.4;
			ctx.beginPath();
			ctx.ellipse(eyeX, eyeY - 6.5, 5, 2.2, eyeSide * 0.15, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Wire spectacles (round golden rims)
			ctx.strokeStyle = "#D97706";
			ctx.lineWidth = 1.8;
			ctx.beginPath();
			ctx.arc(eyeX, eyeY, 6.8, 0, Math.PI * 2);
			ctx.stroke();
			// Lens glint
			ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			ctx.beginPath();
			ctx.arc(eyeX - 1.5, eyeY - 2, 2.5, 0, Math.PI * 2);
			ctx.fill();
		}
		// Spectacles bridge over nose
		ctx.strokeStyle = "#D97706";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, -7, 4, Math.PI, 0);
		ctx.stroke();

		// Long bulbous red nose
		this.setupPath(ctx, "#E53935", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(0, -3, 5.5, 7.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FF8A80";
		ctx.beginPath();
		ctx.arc(1.5, -4.5, 2, 0, Math.PI * 2);
		ctx.fill();

		// Flowing, thick curly white-silver beard and mustache
		const beardSway = Math.sin(time * 3.6) * 3;
		this.setupPath(ctx, "#F5F3ED", COLORS.ink, 3.4);
		ctx.beginPath();
		ctx.moveTo(-16, -2);
		// Mustache lobes
		ctx.quadraticCurveTo(-10, 4, 0, 2);
		ctx.quadraticCurveTo(10, 4, 16, -2);
		// Cascading flowing beard lobes
		ctx.quadraticCurveTo(24, 14, 18 + beardSway, 28);
		ctx.quadraticCurveTo(8 + beardSway * 0.8, 38, 0 + beardSway * 0.5, 36);
		ctx.quadraticCurveTo(-10, 36, -18, 26);
		ctx.quadraticCurveTo(-24, 12, -16, -2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Inner layered curl lines on beard
		ctx.strokeStyle = "#D1D5DB";
		ctx.lineWidth = 1.8;
		for (let bCurl of [-8, 0, 8]) {
			ctx.beginPath();
			ctx.arc(bCurl + beardSway * 0.3, 14, 5, 0.2, Math.PI - 0.2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(bCurl * 0.6 + beardSway * 0.4, 24, 5.5, 0.2, Math.PI - 0.2);
			ctx.stroke();
		}

		// 8. The Smoking Pipe (Dýmka / Fajfka) & Puffing Smoke!
		const pipeBob = Math.sin(time * 2.8) * 0.8;
		const pipeStemX = 6;
		const pipeStemY = 3;
		const bowlX = 22;
		const bowlY = 0 + pipeBob;

		// Wooden curved pipe stem
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 4.2;
		ctx.beginPath();
		ctx.moveTo(pipeStemX, pipeStemY);
		ctx.quadraticCurveTo(12, 10, bowlX - 2, bowlY + 4);
		ctx.stroke();

		ctx.strokeStyle = "#5C2E14";
		ctx.lineWidth = 2.6;
		ctx.beginPath();
		ctx.moveTo(pipeStemX, pipeStemY);
		ctx.quadraticCurveTo(12, 10, bowlX - 2, bowlY + 4);
		ctx.stroke();

		// Briar Pipe Bowl
		this.setupPath(ctx, "#451A03", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.ellipse(bowlX, bowlY, 5.5, 7.5, 0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Brass band
		ctx.fillStyle = "#F59E0B";
		ctx.fillRect(bowlX - 4, bowlY + 2, 7, 2);

		// Glowing Ember inside pipe bowl with rhythmic puffing cycle!
		// Puff cycle: 0 -> 0.9s: draw puff (ember flares!), 0.9 -> 2.8s: smoke billows!
		const puffCycle = (time * 0.9) % 2.8;
		const isDrawing = puffCycle < 0.9;
		const emberGlow = isDrawing ? (1 + Math.sin(time * 16) * 0.25) : 0.6;

		ctx.fillStyle = isDrawing ? "#F97316" : "#DC2626";
		ctx.beginPath();
		ctx.ellipse(bowlX, bowlY - 5, 3.8 * emberGlow, 2.4, 0, 0, Math.PI * 2);
		ctx.fill();
		if (isDrawing) {
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(bowlX, bowlY - 5, 1.8, 0, Math.PI * 2);
			ctx.fill();
		}

		// Animated Billowing Smoke Puffs ("puffing the pipe", "smoking")
		ctx.save();
		const puffBaseTime = time * 1.5;
		for (let pi = 0; pi < 5; pi++) {
			const pAge = (puffBaseTime + pi * 0.55) % 2.4;
			if (pAge > 0.05) {
				const pFrac = pAge / 2.4;
				const pRad = 3.5 + pFrac * 11;
				const pAlpha = Math.max(0, 0.72 - pFrac * 0.75);
				const px = bowlX + pFrac * 18 + Math.sin(pAge * 3.5 + pi) * 6;
				const py = bowlY - 8 - pFrac * 36 - Math.pow(pFrac, 1.4) * 12;

				ctx.fillStyle = `rgba(241, 245, 249, ${pAlpha})`;
				ctx.strokeStyle = `rgba(148, 163, 184, ${pAlpha * 0.8})`;
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.arc(px, py, pRad, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();

				// Soft secondary puff lobe for authentic cloud volume
				if (pFrac > 0.3) {
					ctx.beginPath();
					ctx.arc(px + pRad * 0.5, py - pRad * 0.2, pRad * 0.65, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}
		ctx.restore();

		ctx.restore(); // End Head

		// 9. Front Arm: Gesticulating towards Camera / Player ("gesticulating towards camera")
		ctx.save();
		ctx.translate(0, limpBob);
		ctx.rotate(limpTilt);

		const gestLift = Math.sin(time * 3.0) * 6 + (isInteracting ? -12 : -3);
		const gestWave = Math.sin(time * 3.4) * 0.22 + (isInteracting ? 0.38 : 0.18);
		const shoulderX = 14;
		const shoulderY = -12;
		const elbowX = 26;
		const elbowY = -2 + gestLift * 0.5;
		const wristX = 30;
		const wristY = 8 + gestLift;

		// Patchwork sleeve
		this.drawBentLimb(ctx, shoulderX, shoulderY, elbowX, elbowY, wristX, wristY, "#784D2B", 11);
		// Fluffy sheepskin sleeve cuff
		this.setupPath(ctx, "#FAF7EE", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.ellipse(wristX, wristY, 6, 4.5, gestWave, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Red demon hand reached forward towards viewer in perspective
		ctx.save();
		ctx.translate(wristX, wristY);
		ctx.rotate(gestWave);

		this.setupPath(ctx, "#D34538", COLORS.ink, 2.2);
		ctx.beginPath();
		ctx.ellipse(3, 4, 6.5, 5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 4 Articulated fingers curling and beckoning rhythmically
		ctx.fillStyle = "#D34538";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		for (let fi = 0; fi < 4; fi++) {
			const fAngle = 0.2 + fi * 0.38;
			const curlWave = Math.sin(time * 3.8 + fi * 0.45) * 2.5;
			const fx1 = 5 + Math.cos(fAngle) * 5;
			const fy1 = 4 + Math.sin(fAngle) * 5;
			const fx2 = fx1 + Math.cos(fAngle) * (5 + curlWave);
			const fy2 = fy1 + Math.sin(fAngle) * (5 + curlWave);

			ctx.beginPath();
			ctx.moveTo(fx1, fy1);
			ctx.lineTo(fx2, fy2);
			ctx.stroke();

			// Black claws on fingertips
			ctx.fillStyle = "#18181B";
			ctx.beginPath();
			ctx.arc(fx2, fy2, 1.4, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

		ctx.restore(); // End Front Arm

		ctx.restore(); // End Grandfather
	},
	drawOvenScene(ctx, w, h, time) {
		ctx.fillStyle = COLORS.bone;
		ctx.fillRect(0, 0, w, h);
		this.setupPath(ctx, COLORS.red, COLORS.ink, 3);
		ctx.fillRect(w / 2 - 60, h - 80, 120, 80);
		ctx.strokeRect(w / 2 - 60, h - 80, 120, 80);
		ctx.beginPath();
		ctx.arc(w / 2, h - 80, 60, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(w / 2, h - 30, 25, Math.PI, 0);
		ctx.lineTo(w / 2 + 25, h);
		ctx.lineTo(w / 2 - 25, h);
		ctx.fill();
		ctx.fillStyle = COLORS.mustard;
		ctx.beginPath();
		ctx.moveTo(w / 2 - 15, h);
		ctx.quadraticCurveTo(w / 2 - 10, h - 30 - Math.sin(time * 10) * 10, w / 2, h - 40 + Math.cos(time * 8) * 5);
		ctx.quadraticCurveTo(w / 2 + 10, h - 30 - Math.cos(time * 12) * 10, w / 2 + 15, h);
		ctx.fill();
		this.setupPath(ctx, "#8C5329", COLORS.ink, 2);
		ctx.fillRect(w / 2 + 35, h - 32, 40, 7);
		this.drawCzechBuchta(ctx, w / 2 + 45, h - 38, .72, -.04);
		this.drawCzechBuchta(ctx, w / 2 + 60, h - 39, .68, .04);
		const rx = w / 4;
		const ry = h / 2 + Math.sin(time * 5) * 10;
		this.drawRarach(ctx, rx, ry, time, 1, false);
	},
	drawScarecrowScene(ctx, w, h, time) {
		ctx.fillStyle = "#2C3540";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = COLORS.parchment;
		ctx.beginPath();
		ctx.arc(w * .8, h * .3, 20, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.mustard;
		ctx.lineWidth = 3;
		for (let i = 0; i < w; i += 12) {
			const sway = Math.sin(time * 2 + i) * 10;
			ctx.beginPath();
			ctx.moveTo(i, h);
			ctx.quadraticCurveTo(i + sway / 2, h - 20, i + sway, h - 40);
			ctx.stroke();
		}
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
		ctx.fillRect(w / 2 - 5, h / 4, 10, h * .75);
		ctx.strokeRect(w / 2 - 5, h / 4, 10, h * .75);
		ctx.fillRect(w / 2 - 40, h / 2 - 10, 80, 10);
		ctx.strokeRect(w / 2 - 40, h / 2 - 10, 80, 10);
		ctx.save();
		ctx.translate(w / 2, h / 2);
		ctx.rotate(Math.sin(time) * .1);
		ctx.translate(-w / 2, -h / 2);
		this.drawBubak(ctx, w / 2, h / 2 - 20, time, 0, false);
		ctx.restore();
	},
	drawMillScene(ctx, w, h, time) {
		ctx.fillStyle = COLORS.bone;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = COLORS.water;
		ctx.beginPath();
		ctx.moveTo(0, h);
		ctx.lineTo(0, h - 30);
		for (let i = 0; i <= w; i += 20) ctx.quadraticCurveTo(i + 10, h - 30 + Math.sin(time * 4 + i) * 5, i + 20, h - 30);
		ctx.lineTo(w, h);
		ctx.fill();
		const mx = w / 2;
		const my = h / 2;
		ctx.save();
		ctx.translate(mx, my);
		ctx.rotate(-time);
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, 0, 40, 0, Math.PI * 2);
		ctx.stroke();
		for (let i = 0; i < 8; i++) {
			ctx.rotate(Math.PI / 4);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(40, 0);
			ctx.stroke();
			ctx.fillRect(35, -10, 10, 20);
			ctx.strokeRect(35, -10, 10, 20);
		}
		ctx.restore();
		this.drawHastrman(ctx, w * .8, h / 2 - Math.sin(time * 5) * 5, time, -1, false);
	},
	drawWallScene(ctx, w, h, time) {
		ctx.fillStyle = COLORS.bone;
		ctx.fillRect(0, 0, w, h);
		this.setupPath(ctx, COLORS.grey, COLORS.ink, 2);
		for (let row = 0; row < 4; row++) {
			const y = h - 20 - row * 20;
			const offset = row % 2 === 0 ? 0 : 15;
			for (let col = 0; col < 5; col++) {
				const x = col * 30 - offset;
				ctx.fillRect(x, y, 30, 20);
				ctx.strokeRect(x, y, 30, 20);
			}
		}
		this.drawSkeleton(ctx, w / 2 + 20, h - 30, time, -1, false);
	},
	drawHromnickaAura(ctx, x, y, reach, time, pulseTimer = 0) {
		ctx.save();
		const flicker = Math.sin(time * 12) * 3.5 + Math.sin(time * 23) * 2;
		const r = Math.max(30, reach + flicker);
		const grad = ctx.createRadialGradient(x, y, 16, x, y, r);
		grad.addColorStop(0, "rgba(254, 240, 138, 0.16)");
		grad.addColorStop(.45, "rgba(251, 191, 36, 0.09)");
		grad.addColorStop(.82, "rgba(217, 119, 6, 0.04)");
		grad.addColorStop(1, "rgba(217, 119, 6, 0)");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.save();
		ctx.strokeStyle = "rgba(245, 158, 11, 0.34)";
		ctx.lineWidth = 1.6;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
		if (pulseTimer > 0) {
			const progress = 1 - pulseTimer / .4;
			const waveR = reach * (.32 + progress * .68);
			const alpha = Math.max(0, (1 - progress) * .6);
			ctx.save();
			ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
			ctx.lineWidth = 3.2 * (1 - progress * .5);
			ctx.beginPath();
			ctx.arc(x, y, waveR, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeStyle = `rgba(253, 224, 71, ${Math.max(0, (1 - progress) * .38)})`;
			ctx.lineWidth = 2.0;
			const bInner = reach * .38;
			const bOuter = reach * .82;
			ctx.beginPath();
			ctx.moveTo(x - bOuter, y);
			ctx.lineTo(x - bInner, y);
			ctx.moveTo(x + bInner, y);
			ctx.lineTo(x + bOuter, y);
			ctx.moveTo(x, y - bOuter);
			ctx.lineTo(x, y - bInner);
			ctx.moveTo(x, y + bInner);
			ctx.lineTo(x, y + bOuter);
			ctx.stroke();
			ctx.restore();
		}
		ctx.restore();
	},
	drawBlessedCandle(ctx, x, y, scale = 1, time = 0) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale, scale);
		this.setupPath(ctx, "#FFFBEB", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-3.5, -4, 7, 16);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FEF3C7";
		ctx.beginPath();
		ctx.ellipse(-3.5, 2, 1.5, 3, 0, 0, Math.PI * 2);
		ctx.ellipse(3.5, 4, 1.5, 3.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(0, -4);
		ctx.lineTo(0, -8);
		ctx.stroke();
		const flameSway = Math.sin(time * 16) * 1.5;
		ctx.fillStyle = "rgba(251, 191, 36, 0.45)";
		ctx.beginPath();
		ctx.arc(flameSway * .5, -14, 8, 0, Math.PI * 2);
		ctx.fill();
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.5);
		ctx.beginPath();
		ctx.moveTo(0, -8);
		ctx.quadraticCurveTo(-4, -13, flameSway, -19);
		ctx.quadraticCurveTo(4, -13, 0, -8);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#FEF08A";
		ctx.beginPath();
		ctx.moveTo(0, -8);
		ctx.quadraticCurveTo(-2.5, -12, flameSway * .7, -16);
		ctx.quadraticCurveTo(2.5, -12, 0, -8);
		ctx.fill();
		ctx.fillStyle = "#60A5FA";
		ctx.beginPath();
		ctx.arc(0, -8, 1.8, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	drawPetrolejka(ctx: any, x: number, y: number, scale = 1, time = 0, kurazRatio = 1) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale, scale);

		// Wire handle
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.arc(0, -18, 9, Math.PI, 0);
		ctx.stroke();

		// Brass cap
		this.setupPath(ctx, "#D97706", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.rect(-6, -18, 12, 5);
		ctx.fill();
		ctx.stroke();

		// Glass chimney cylinder
		ctx.fillStyle = "rgba(254, 240, 138, 0.28)";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.ellipse(0, -9, 7.5, 9.5, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Inner kerosene flame
		const isCritical = kurazRatio < 0.25;
		const flicker = isCritical
			? (Math.sin(time * 26) * 1.5 + Math.sin(time * 42)) * 0.8
			: Math.sin(time * 12) * 1.2;
		const flameH = isCritical ? 5 + flicker : 9 + flicker;

		// Soft flame warm aura
		ctx.fillStyle = isCritical ? "rgba(239, 68, 68, 0.35)" : "rgba(251, 191, 36, 0.45)";
		ctx.beginPath();
		ctx.arc(0, -9, isCritical ? 8 : 14, 0, Math.PI * 2);
		ctx.fill();

		// Flame teardrop
		ctx.fillStyle = isCritical ? "#F97316" : "#F59E0B";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(-2.5, -6);
		ctx.quadraticCurveTo(-3.5, -6 - flameH * 0.5, flicker * 0.4, -6 - flameH);
		ctx.quadraticCurveTo(3.5, -6 - flameH * 0.5, 2.5, -6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Bright white-yellow inner wick core
		ctx.fillStyle = "#FEF08A";
		ctx.beginPath();
		ctx.arc(0, -6 - flameH * 0.4, 2, 0, Math.PI * 2);
		ctx.fill();

		// Brass oil font / tank base
		this.setupPath(ctx, "#B45309", COLORS.ink, 2);
		ctx.beginPath();
		ctx.rect(-8, 0, 16, 7);
		ctx.fill();
		ctx.stroke();

		// Bottom brass rim
		ctx.fillStyle = "#92400E";
		ctx.beginPath();
		ctx.rect(-9.5, 6, 19, 3);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	},
	drawOsikovyPrutSlash(ctx: any, s: any) {
		const maxLife = s.maxLife || 0.30;
		const progress = Math.max(0, Math.min(1, 1 - (s.life / maxLife)));
		const fade = Math.max(0, 1 - Math.pow(progress, 2.5));
		if (fade <= 0.001) return;

		const reach = s.reach || 88;
		const arc = s.arc || 1.35;
		const dir = s.swingDir || 1;
		const soaked = !!s.soaked;

		// Hand grip starting radius from player center
		const handRadius = 14;

		// Angular bounds
		const halfArc = arc * 0.55;
		const startAngle = s.angle - dir * halfArc;
		const endAngle = s.angle + dir * halfArc;

		// Whip motion easing: rapid acceleration, high-speed sweep, elastic snap follow-through
		const getSwingP = (p: number) => {
			if (p < 0.12) {
				const u = p / 0.12;
				return -0.04 * Math.sin(u * Math.PI); // subtle windup
			} else if (p < 0.70) {
				const u = (p - 0.12) / 0.58;
				return 1 - Math.pow(1 - u, 3.2); // whip sweep
			} else {
				const u = (p - 0.70) / 0.30;
				return 1.0 + Math.sin(u * Math.PI) * 0.05 * (1 - u); // elastic recoil
			}
		};

		// Angle along the flexible stem at fraction f (0=base/grip, 1=tip)
		const getSpineAngle = (p: number, f: number) => {
			const sweepP = getSwingP(p);
			let flex = 0;
			if (p < 0.48) {
				// Base leads, stem bows backward (inertial drag)
				const lagAmount = Math.sin((p / 0.48) * Math.PI);
				flex = -dir * 0.36 * Math.pow(f, 1.4) * lagAmount;
			} else if (p < 0.78) {
				// Apex snap! Slender tip whips violently forward past the base
				const snapAmount = Math.sin(((p - 0.48) / 0.30) * Math.PI);
				flex = dir * 0.28 * Math.pow(f, 1.5) * snapAmount;
			} else {
				// Settle vibration
				const recoilAmount = Math.sin(((p - 0.78) / 0.22) * Math.PI * 2) * (1 - (p - 0.78) / 0.22);
				flex = -dir * 0.07 * f * recoilAmount;
			}
			return startAngle + (endAngle - startAngle) * sweepP + flex;
		};

		// Calculate spine points for a given normalized time p
		const computeSpine = (p: number, numPoints = 8) => {
			const pts: { x: number; y: number; angle: number; r: number }[] = [];
			for (let i = 0; i <= numPoints; i++) {
				const f = i / numPoints;
				const ang = getSpineAngle(p, f);
				// Slight radial bow shortening when bent
				const bowShortening = 1 - 0.05 * Math.sin(p * Math.PI) * f;
				const r = (handRadius + f * (reach - handRadius)) * bowShortening;
				pts.push({
					x: Math.cos(ang) * r,
					y: Math.sin(ang) * r,
					angle: ang,
					r
				});
			}
			return pts;
		};

		const currentSpine = computeSpine(progress);
		const tip = currentSpine[currentSpine.length - 1];

		// -----------------------------------------------------------------
		// 1. SWEEPING MOTION ARC / SWOOSH (Vějíř sečného větru)
		// -----------------------------------------------------------------
		const sweepAlpha = Math.min(1, Math.sin(progress * Math.PI)) * fade;
		if (sweepAlpha > 0.05) {
			ctx.save();

			// Swept angular range from start of swing to current tip angle
			const currentTipAng = tip.angle;
			const trailSpan = Math.min(arc * 0.85, Math.abs(currentTipAng - startAngle));
			const trailStartAng = currentTipAng - dir * trailSpan;

			// Soft gradient wind fan
			const minAngle = Math.min(trailStartAng, currentTipAng);
			const maxAngle = Math.max(trailStartAng, currentTipAng);

			if (maxAngle - minAngle > 0.02) {
				// Radial gradient for wind trail
				const grad = ctx.createRadialGradient(0, 0, reach * 0.25, 0, 0, reach * 1.05);
				if (soaked) {
					// Water splash arc
					grad.addColorStop(0, `rgba(59, 130, 246, 0)`);
					grad.addColorStop(0.5, `rgba(147, 197, 253, ${0.35 * sweepAlpha})`);
					grad.addColorStop(0.88, `rgba(186, 230, 253, ${0.65 * sweepAlpha})`);
					grad.addColorStop(1, `rgba(255, 255, 255, ${0.45 * sweepAlpha})`);
				} else {
					// Traditional spring wind swoosh (parchment & golden aura with fresh green tint)
					grad.addColorStop(0, `rgba(245, 158, 11, 0)`);
					grad.addColorStop(0.55, `rgba(254, 240, 138, ${0.30 * sweepAlpha})`);
					grad.addColorStop(0.85, `rgba(253, 230, 138, ${0.55 * sweepAlpha})`);
					grad.addColorStop(1, `rgba(255, 255, 255, ${0.40 * sweepAlpha})`);
				}

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.98, minAngle, maxAngle, false);
				ctx.arc(0, 0, reach * 0.35, maxAngle, minAngle, true);
				ctx.closePath();
				ctx.fill();

				// Lada Ink Speedlines (pohybové čáry)
				// Outer crisp cutting blade line
				ctx.strokeStyle = soaked ? `rgba(2, 132, 199, ${0.85 * sweepAlpha})` : `rgba(43, 24, 16, ${0.85 * sweepAlpha})`;
				ctx.lineWidth = 3.5;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.96, minAngle, maxAngle);
				ctx.stroke();

				// Inner dashed whistling air current
				ctx.strokeStyle = soaked ? `rgba(56, 189, 248, ${0.7 * sweepAlpha})` : `rgba(43, 24, 16, ${0.65 * sweepAlpha})`;
				ctx.lineWidth = 2.0;
				ctx.setLineDash([16, 10]);
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.76, minAngle + (maxAngle - minAngle) * 0.15, maxAngle);
				ctx.stroke();
				ctx.setLineDash([]);

				// Brilliant white cutting glint along apex edge
				ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * sweepAlpha})`;
				ctx.lineWidth = 2.2;
				ctx.beginPath();
				const glintStart = dir > 0 ? maxAngle - (maxAngle - minAngle) * 0.6 : minAngle;
				const glintEnd = dir > 0 ? maxAngle : minAngle + (maxAngle - minAngle) * 0.6;
				ctx.arc(0, 0, reach * 0.94, glintStart, glintEnd);
				ctx.stroke();
			}

			ctx.restore();
		}

		// -----------------------------------------------------------------
		// 2. MOTION GHOSTING / SMEAR FRAMES (Rychlostní stíny prutu)
		// -----------------------------------------------------------------
		if (progress > 0.15 && progress < 0.75) {
			const ghostOffsets = [0.06, 0.03];
			const ghostAlphas = [0.18 * fade, 0.38 * fade];

			for (let g = 0; g < ghostOffsets.length; g++) {
				const gp = progress - ghostOffsets[g];
				if (gp < 0.08) continue;
				const ghostSpine = computeSpine(gp, 6);
				const gAlpha = ghostAlphas[g];

				ctx.save();
				ctx.globalAlpha = gAlpha;
				ctx.strokeStyle = soaked ? '#60A5FA' : '#854D0E';
				ctx.lineWidth = 3.0;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.moveTo(ghostSpine[0].x, ghostSpine[0].y);
				for (let k = 1; k < ghostSpine.length; k++) {
					ctx.lineTo(ghostSpine[k].x, ghostSpine[k].y);
				}
				ctx.stroke();
				ctx.restore();
			}
		}

		// -----------------------------------------------------------------
		// 3. THE OSIKOVÝ PRUT (Authentic Josef Lada wooden aspen rod)
		// -----------------------------------------------------------------
		ctx.save();
		ctx.globalAlpha = fade;

		// 3a. Draw base handle cut (čerstvý seříznutý konec prutu)
		const basePt = currentSpine[0];
		const baseTangAng = Math.atan2(currentSpine[1].y - basePt.y, currentSpine[1].x - basePt.x);
		ctx.save();
		ctx.translate(basePt.x, basePt.y);
		ctx.rotate(baseTangAng);
		// Cut oval: dark outer bark contour, light cream sapwood interior
		this.setupPath(ctx, '#F5EBD8', COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.ellipse(0, 0, 3.2, 5.0, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		// Inner wood pith dot
		ctx.fillStyle = '#8C795E';
		ctx.beginPath();
		ctx.arc(0, 0, 1.0, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// 3b. Outline pass of the flexible tapering stem
		// We stroke along the spine with tapering width (5.2px down to 1.8px)
		// Outer Lada black ink stroke
		ctx.strokeStyle = COLORS.ink;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		for (let k = 0; k < currentSpine.length - 1; k++) {
			const p1 = currentSpine[k];
			const p2 = currentSpine[k + 1];
			const f = k / (currentSpine.length - 1);
			const width = (5.2 - f * 3.4) + 3.2; // ink outline width
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
		}

		// Inner natural aspen bark fill pass
		for (let k = 0; k < currentSpine.length - 1; k++) {
			const p1 = currentSpine[k];
			const p2 = currentSpine[k + 1];
			const f = k / (currentSpine.length - 1);
			const width = Math.max(1.4, 5.0 - f * 3.4);
			ctx.strokeStyle = '#6E6455'; // warm grey-brown aspen bark
			ctx.lineWidth = width;
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
		}

		// Sunlight highlight edge streak along the convex side
		ctx.strokeStyle = '#D5CBB9'; // bright sunlit bark highlight
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		for (let k = 0; k < currentSpine.length; k++) {
			const p = currentSpine[k];
			const f = k / (currentSpine.length - 1);
			const normAng = p.angle + (dir > 0 ? -Math.PI / 2 : Math.PI / 2);
			const hOffset = Math.max(0.6, 2.0 - f * 1.4);
			const hx = p.x + Math.cos(normAng) * hOffset;
			const hy = p.y + Math.sin(normAng) * hOffset;
			if (k === 0) ctx.moveTo(hx, hy);
			else ctx.lineTo(hx, hy);
		}
		ctx.stroke();

		// 3c. Botanical Nodes and Aspen Buds (Pupeny s lístky)
		// Alternating buds at specific node intervals
		const nodeIndices = [1, 2, 4, 5, 7];
		for (let b = 0; b < nodeIndices.length; b++) {
			const idx = nodeIndices[b];
			if (idx >= currentSpine.length) continue;
			const nodePt = currentSpine[idx];
			const nextPt = currentSpine[Math.min(currentSpine.length - 1, idx + 1)];
			const tangAng = Math.atan2(nextPt.y - nodePt.y, nextPt.x - nodePt.x);
			// Alternating side (+1 or -1)
			const side = (b % 2 === 0 ? 1 : -1) * (dir > 0 ? 1 : -1);
			const budAngle = tangAng + side * (Math.PI * 0.32);

			ctx.save();
			ctx.translate(nodePt.x, nodePt.y);
			ctx.rotate(budAngle);

			// Brown woody bud base
			this.setupPath(ctx, '#825C3E', COLORS.ink, 1.8);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.quadraticCurveTo(2, -2, 4.5, 0);
			ctx.quadraticCurveTo(2, 2, 0, 0);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Fresh spring green bud apex (jarní zelený pupen)
			ctx.fillStyle = '#84CC16';
			ctx.beginPath();
			ctx.arc(4.2, 0, 1.2, 0, Math.PI * 2);
			ctx.fill();

			// Glistening water droplet on node if soaked
			if (soaked) {
				ctx.fillStyle = '#93C5FD';
				ctx.strokeStyle = '#1D4ED8';
				ctx.lineWidth = 1.0;
				ctx.beginPath();
				ctx.arc(1.5, side * 2.2, 1.8, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
				// Tiny white glint
				ctx.fillStyle = '#FFFFFF';
				ctx.beginPath();
				ctx.arc(1.1, side * 2.2 - 0.5, 0.6, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.restore();
		}

		// 3d. Terminal tip bud cluster at the very end
		ctx.save();
		const tipPrev = currentSpine[currentSpine.length - 2];
		const tipAng = Math.atan2(tip.y - tipPrev.y, tip.x - tipPrev.x);
		ctx.translate(tip.x, tip.y);
		ctx.rotate(tipAng);

		// Slender terminal bud
		this.setupPath(ctx, '#65A30D', COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.moveTo(0, -1);
		ctx.lineTo(5.5, 0);
		ctx.lineTo(0, 1.2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Tiny delicate spring leaflet
		ctx.fillStyle = '#84CC16';
		ctx.beginPath();
		ctx.ellipse(3, -2.5, 2.5, 1.3, -0.4, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();

		// -----------------------------------------------------------------
		// 4. WHIP-CRACK SPARK & DRIFTING LEAFLETS AT APEX (Prásknutí a lístky)
		// -----------------------------------------------------------------
		if (progress >= 0.35 && progress <= 0.78) {
			const apexProgress = (progress - 0.35) / 0.43;
			const sparkAlpha = Math.sin(apexProgress * Math.PI) * fade;

			ctx.save();
			ctx.translate(tip.x, tip.y);
			ctx.globalAlpha = sparkAlpha;

			// Starburst ink crack lines at tip
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2.4;
			ctx.lineCap = 'round';
			const numSpikes = 6;
			const spikeLen = 8 + 6 * Math.sin(apexProgress * Math.PI);
			for (let i = 0; i < numSpikes; i++) {
				const ang = (i / numSpikes) * Math.PI * 2 + apexProgress * 2;
				ctx.beginPath();
				ctx.moveTo(Math.cos(ang) * 3, Math.sin(ang) * 3);
				ctx.lineTo(Math.cos(ang) * spikeLen, Math.sin(ang) * spikeLen);
				ctx.stroke();
			}

			// Golden/white core pop
			ctx.fillStyle = soaked ? '#BAE6FD' : '#FEF08A';
			ctx.beginPath();
			ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();

			// Flying spring bud flakes / water spray droplets drifting off
			ctx.save();
			for (let pIdx = 0; pIdx < 4; pIdx++) {
				const pProgress = (apexProgress * 1.5 + pIdx * 0.25) % 1;
				const driftDist = pProgress * (18 + pIdx * 7);
				const driftAng = tipAng + (dir * 0.5) + (pIdx - 1.5) * 0.45;
				const px = tip.x + Math.cos(driftAng) * driftDist;
				const py = tip.y + Math.sin(driftAng) * driftDist;
				const pAlpha = (1 - pProgress) * sparkAlpha;

				if (soaked) {
					// Water droplet bead
					ctx.fillStyle = `rgba(147, 197, 253, ${pAlpha})`;
					ctx.strokeStyle = `rgba(30, 64, 175, ${pAlpha * 0.8})`;
					ctx.lineWidth = 1.0;
					ctx.beginPath();
					ctx.arc(px, py, Math.max(1, 2.5 * (1 - pProgress * 0.4)), 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				} else {
					// Tiny green aspen leaflet / bud scale
					ctx.fillStyle = `rgba(132, 204, 22, ${pAlpha})`;
					ctx.strokeStyle = `rgba(43, 24, 16, ${pAlpha * 0.9})`;
					ctx.lineWidth = 1.0;
					ctx.beginPath();
					ctx.ellipse(px, py, 2.6, 1.4, driftAng, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				}
			}
			ctx.restore();
		}

		ctx.restore();
	},
	drawHalapartnaSlash(ctx: any, s: any) {
		const maxLife = s.maxLife || 0.24;
		const progress = Math.max(0, Math.min(1, 1 - (s.life / maxLife)));
		const fade = Math.max(0, 1 - Math.pow(progress, 2.2));
		if (fade <= 0.001) return;

		const reach = s.reach || 145;
		const arc = s.arc || 1.7;
		const dir = s.swingDir || 1;
		const handRadius = 16;

		// Angular bounds of the sweeping cleave
		const halfArc = arc * 0.52;
		const startAngle = s.angle - dir * halfArc;
		const endAngle = s.angle + dir * halfArc;

		// Heavy polearm sweep easing: brief tension -> explosive wide sweep -> heavy follow-through
		const getSwingP = (p: number) => {
			if (p < 0.10) {
				const u = p / 0.10;
				return -0.05 * Math.sin(u * Math.PI); // heavy windup pull-back
			} else if (p < 0.65) {
				const u = (p - 0.10) / 0.55;
				return 1 - Math.pow(1 - u, 2.8); // explosive cleave
			} else {
				const u = (p - 0.65) / 0.35;
				return 1.0 + Math.sin(u * Math.PI) * 0.03 * (1 - u); // heavy follow-through
			}
		};

		const sweepP = getSwingP(progress);
		const currentBladeAngle = startAngle + (endAngle - startAngle) * sweepP;

		// -----------------------------------------------------------------
		// 1. DYNAMIC WIND & DUST SWEEP FAN (Vějíř sečného větru a prachu dle předlohy)
		// -----------------------------------------------------------------
		const sweepAlpha = Math.min(1, Math.sin(progress * Math.PI)) * fade;
		if (sweepAlpha > 0.04) {
			ctx.save();
			const trailSpan = Math.min(arc * 0.92, Math.abs(currentBladeAngle - startAngle));
			const trailStartAng = currentBladeAngle - dir * trailSpan;
			const minAngle = Math.min(trailStartAng, currentBladeAngle);
			const maxAngle = Math.max(trailStartAng, currentBladeAngle);

			if (maxAngle - minAngle > 0.03) {
				// Multi-layered radial wash for the sweeping dust and wind
				const dustGrad = ctx.createRadialGradient(0, 0, reach * 0.25, 0, 0, reach * 1.06);
				dustGrad.addColorStop(0, "rgba(224, 212, 188, 0)");
				dustGrad.addColorStop(0.35, `rgba(214, 196, 168, ${0.28 * sweepAlpha})`);
				dustGrad.addColorStop(0.65, `rgba(180, 140, 100, ${0.40 * sweepAlpha})`);
				dustGrad.addColorStop(0.85, `rgba(100, 116, 139, ${0.48 * sweepAlpha})`);
				dustGrad.addColorStop(1, `rgba(255, 255, 255, ${0.60 * sweepAlpha})`);

				ctx.fillStyle = dustGrad;
				ctx.beginPath();
				ctx.arc(0, 0, reach * 1.04, minAngle, maxAngle, false);
				ctx.arc(0, 0, reach * 0.28, maxAngle, minAngle, true);
				ctx.closePath();
				ctx.fill();

				// Concentric dynamic Lada ink speedlines (Pohybové linky jako v ilustraci)
				ctx.strokeStyle = `rgba(31, 24, 16, ${0.85 * sweepAlpha})`;
				ctx.lineWidth = 3.8;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.98, minAngle, maxAngle);
				ctx.stroke();

				// Inner whistling air speedline
				ctx.strokeStyle = `rgba(60, 40, 25, ${0.65 * sweepAlpha})`;
				ctx.lineWidth = 2.4;
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.78, minAngle + (maxAngle - minAngle) * 0.2, maxAngle);
				ctx.stroke();

				// Intermediate dashed air current
				ctx.strokeStyle = `rgba(100, 116, 139, ${0.55 * sweepAlpha})`;
				ctx.lineWidth = 1.8;
				ctx.setLineDash([18, 12]);
				ctx.beginPath();
				ctx.arc(0, 0, reach * 0.88, minAngle + (maxAngle - minAngle) * 0.1, maxAngle);
				ctx.stroke();
				ctx.setLineDash([]);

				// Brilliant razor-sharp white cutting glint on the outer blade path
				ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * sweepAlpha})`;
				ctx.lineWidth = 2.8;
				ctx.beginPath();
				const glintStart = dir > 0 ? maxAngle - (maxAngle - minAngle) * 0.65 : minAngle;
				const glintEnd = dir > 0 ? maxAngle : minAngle + (maxAngle - minAngle) * 0.65;
				ctx.arc(0, 0, reach * 1.01, glintStart, glintEnd);
				ctx.stroke();
			}
			ctx.restore();
		}

		// -----------------------------------------------------------------
		// 2. FLYING DIRT CLODS, DUST SPECKS & SPLINTERS (Hroudy hlíny a prach)
		// -----------------------------------------------------------------
		if (progress >= 0.18 && progress <= 0.88) {
			const debrisProgress = (progress - 0.18) / 0.70;
			const debrisAlpha = Math.sin(debrisProgress * Math.PI) * fade;

			ctx.save();
			ctx.globalAlpha = debrisAlpha;

			// Scatter of authentic ink debris trailing the heavy swing (as in Image 2)
			const debrisCount = 9;
			for (let d = 0; d < debrisCount; d++) {
				const dLag = (d / debrisCount) * 0.45;
				const dAngle = currentBladeAngle - dir * (0.2 + dLag * 0.8);
				const dRadius = reach * (0.45 + (d % 4) * 0.16) + debrisProgress * 22;
				const dx = Math.cos(dAngle) * dRadius;
				const dy = Math.sin(dAngle) * dRadius;
				const dSize = 2.0 + (d % 3) * 1.5;

				// Dark earth clod with ink outline
				ctx.fillStyle = d % 2 === 0 ? "#451A03" : "#78350F";
				ctx.strokeStyle = COLORS.ink;
				ctx.lineWidth = 1.0;
				ctx.beginPath();
				ctx.ellipse(dx, dy, dSize, dSize * 0.75, dAngle, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}

			// Soft dust cloud puffs
			for (let p = 0; p < 4; p++) {
				const pAng = currentBladeAngle - dir * (0.3 + p * 0.25);
				const pRad = reach * (0.55 + p * 0.12);
				const px = Math.cos(pAng) * pRad;
				const py = Math.sin(pAng) * pRad;
				ctx.fillStyle = `rgba(214, 196, 168, ${0.45 * debrisAlpha})`;
				ctx.beginPath();
				ctx.arc(px, py, 6 + p * 3, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}

		// -----------------------------------------------------------------
		// 3. MOTION GHOSTS / SMEAR TRAILS (Pohybové stíny těžkého ratiště)
		// -----------------------------------------------------------------
		if (progress > 0.14 && progress < 0.78) {
			const ghosts = [0.07, 0.035];
			const ghostAlphas = [0.22 * fade, 0.45 * fade];

			for (let g = 0; g < ghosts.length; g++) {
				const gp = progress - ghosts[g];
				if (gp < 0.08) continue;
				const gSwingP = getSwingP(gp);
				const gAng = startAngle + (endAngle - startAngle) * gSwingP;

				ctx.save();
				ctx.globalAlpha = ghostAlphas[g];
				ctx.rotate(gAng);

				// Smear of wooden shaft
				ctx.strokeStyle = "#8C582B";
				ctx.lineWidth = 5.0;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(handRadius, 0);
				ctx.lineTo(reach * 0.82, 0);
				ctx.stroke();

				// Smear of blade silhouette
				ctx.fillStyle = "#64748B";
				ctx.beginPath();
				ctx.arc(reach * 0.88, 0, 16, -0.6, 0.6);
				ctx.fill();
				ctx.restore();
			}
		}

		// -----------------------------------------------------------------
		// 4. THE FORGED HALBERD (Kovaná halapartna dle předlohy na špici švihu)
		// -----------------------------------------------------------------
		ctx.save();
		ctx.globalAlpha = fade;
		ctx.rotate(currentBladeAngle);

		// 4a. Wooden Ash/Oak Shaft (Ratiště z jasanu s léty dřeva a objímkami)
		// Shaft outline
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 6.2;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(handRadius, 0);
		ctx.lineTo(reach * 0.82, 0);
		ctx.stroke();

		// Shaft warm wood core
		ctx.strokeStyle = "#8C582B";
		ctx.lineWidth = 4.2;
		ctx.beginPath();
		ctx.moveTo(handRadius, 0);
		ctx.lineTo(reach * 0.82, 0);
		ctx.stroke();

		// Shaft wood highlight
		ctx.strokeStyle = "#DFBA8A";
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.moveTo(handRadius, -0.9);
		ctx.lineTo(reach * 0.82, -0.9);
		ctx.stroke();

		// Iron reinforcing collars with rivets along the shaft
		const collarDistances = [reach * 0.32, reach * 0.58, reach * 0.80];
		for (const cd of collarDistances) {
			this.setupPath(ctx, "#475569", COLORS.ink, 1.8);
			ctx.fillRect(cd - 3, -4.5, 6, 9);
			ctx.strokeRect(cd - 3, -4.5, 6, 9);
			// Rivet dot
			ctx.fillStyle = "#E2E8F0";
			ctx.beginPath();
			ctx.arc(cd, -1.8, 1.1, 0, Math.PI * 2);
			ctx.arc(cd, 1.8, 1.1, 0, Math.PI * 2);
			ctx.fill();
		}

		// 4b. Forged Steel Halberd Head (Hlava halapartny s širokou sekerou a čtyřlístkem)
		ctx.save();
		ctx.translate(reach * 0.82, 0);

		// Main forged steel blade:
		// Forward thrusting spear spike, wide crescent axe blade on cutting side, rear beak on trailing side
		this.setupPath(ctx, "#64748B", COLORS.ink, 2.5);
		ctx.beginPath();
		// Socket base
		ctx.moveTo(0, -3.5);
		// Thrusting spear base & central point extending forward
		ctx.lineTo(12, -2.5);
		ctx.lineTo(reach * 0.18, 0); // needle-sharp spear tip
		ctx.lineTo(12, 2.5);
		// Crescent axe blade extending on cutting side (dir)
		ctx.quadraticCurveTo(18, dir * 14, 24, dir * 26); // upper horn
		ctx.bezierCurveTo(16, dir * 16, 6, dir * 6, -4, dir * 22); // crescent cutting arc to lower horn
		ctx.quadraticCurveTo(-1, dir * 6, 0, 3.5);
		// Rear beak pick extending on trailing side (-dir)
		ctx.lineTo(-4, -dir * 3);
		ctx.lineTo(-12, -dir * 14); // sharp hooked rear pick
		ctx.lineTo(-7, -dir * 11);
		ctx.quadraticCurveTo(-2, -dir * 6, 0, -3.5);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Aged rust and forged iron patina wash
		ctx.fillStyle = "rgba(120, 53, 15, 0.35)";
		ctx.beginPath();
		ctx.moveTo(4, 0);
		ctx.quadraticCurveTo(14, dir * 12, 18, dir * 20);
		ctx.quadraticCurveTo(4, dir * 12, -1, dir * 15);
		ctx.closePath();
		ctx.fill();

		// Razor-sharp cutting blade edge glint (Leštěné ostří sekery)
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 2.2;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(23.5, dir * 25.5);
		ctx.bezierCurveTo(16, dir * 16, 6, dir * 6, -3.5, dir * 21.5);
		ctx.stroke();

		// Central reinforcing spear ridge
		ctx.strokeStyle = "#1E293B";
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(reach * 0.17, 0);
		ctx.stroke();
		ctx.strokeStyle = "#CBD5E1";
		ctx.lineWidth = 1.0;
		ctx.beginPath();
		ctx.moveTo(2, -0.6);
		ctx.lineTo(reach * 0.16, 0);
		ctx.stroke();

		// Four-leaf clover cutout (Čtyřlístkový otvor v sekeře halapartny dle Image 1)
		ctx.save();
		ctx.translate(10, dir * 13);
		ctx.fillStyle = "#1E1810";
		const cloverR = 1.8;
		ctx.beginPath();
		ctx.arc(0, -cloverR * 1.4, cloverR, 0, Math.PI * 2);
		ctx.arc(0, cloverR * 1.4, cloverR, 0, Math.PI * 2);
		ctx.arc(-cloverR * 1.4, 0, cloverR, 0, Math.PI * 2);
		ctx.arc(cloverR * 1.4, 0, cloverR, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(0, 0, cloverR * 1.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		ctx.restore();
		ctx.restore();
	},
	drawHerbProjectile(ctx: any, x: number, y: number, variant: number = 0, time: number = 0, scale: number = 1) {
		const v = Math.abs(Math.floor(variant)) % 6;
		const flutter = Math.sin(time * 12 + x * 0.05 + y * 0.05) * 0.12;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(flutter);
		ctx.scale(scale, scale);

		// 1. Swirling sky-blue breeze wake (Větrné linky a vánek dle předlohy)
		ctx.save();
		ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
		ctx.lineWidth = 1.6;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.arc(0, 0, 16, Math.PI * 0.7, Math.PI * 1.6);
		ctx.stroke();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
		ctx.lineWidth = 1.0;
		ctx.beginPath();
		ctx.arc(2, -1, 12, Math.PI * 0.8, Math.PI * 1.5);
		ctx.stroke();
		ctx.restore();

		// 2. Specific Herb Variant (Předloha dle ilustrace)
		if (v === 0) {
			// VARIANT 0: HEŘMÁNEK (Chamomile Bouquet with golden centers & white petals)
			this.setupPath(ctx, "transparent", "#15803D", 1.8);
			ctx.beginPath();
			ctx.moveTo(-10, 8);
			ctx.quadraticCurveTo(-4, 2, 4, -4);
			ctx.moveTo(-6, 4);
			ctx.quadraticCurveTo(0, 6, 8, 4);
			ctx.moveTo(-3, 0);
			ctx.quadraticCurveTo(-1, -6, -4, -10);
			ctx.stroke();

			ctx.strokeStyle = "#16A34A";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(-5, 5); ctx.lineTo(-8, 3);
			ctx.moveTo(-2, 3); ctx.lineTo(-1, 0);
			ctx.moveTo(1, 4); ctx.lineTo(3, 8);
			ctx.stroke();

			this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.2);
			const petals1 = 8;
			for (let p = 0; p < petals1; p++) {
				const pa = (p / petals1) * Math.PI * 2;
				ctx.beginPath();
				ctx.ellipse(4 + Math.cos(pa) * 4.5, -4 + Math.sin(pa) * 4.5, 3.2, 1.5, pa, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}
			this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.3);
			ctx.beginPath();
			ctx.arc(4, -4, 3.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(3.2, -4.8, 1.1, 0, Math.PI * 2);
			ctx.fill();

			for (let p = 0; p < 7; p++) {
				const pa = (p / 7) * Math.PI * 2;
				this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.1);
				ctx.beginPath();
				ctx.ellipse(8 + Math.cos(pa) * 3.5, 4 + Math.sin(pa) * 3.5, 2.5, 1.2, pa, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}
			this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.2);
			ctx.beginPath();
			ctx.arc(8, 4, 2.4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			this.setupPath(ctx, "#FFFFFF", COLORS.ink, 1.0);
			ctx.beginPath();
			ctx.ellipse(-4, -10, 3.5, 2.5, 0.4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = "#F59E0B";
			ctx.beginPath();
			ctx.arc(-4, -10, 1.6, 0, Math.PI * 2);
			ctx.fill();

			const wakeWave = Math.sin(time * 8) * 2;
			this.setupPath(ctx, "#FFFFFF", COLORS.ink, 0.9);
			ctx.beginPath();
			ctx.ellipse(-14, 2 + wakeWave, 2.8, 1.3, -0.4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

		} else if (v === 1) {
			// VARIANT 1: SVÁZANÁ ŠALVĚJ (Sage bundle tied with rustic twine)
			const leafDefs = [
				{ x: 3, y: -8, ang: -0.6, len: 12, w: 4.8 },
				{ x: 7, y: -4, ang: -0.2, len: 14, w: 5.2 },
				{ x: 8, y: 3, ang: 0.25, len: 13, w: 5.0 },
				{ x: 4, y: 8, ang: 0.7, len: 11, w: 4.5 },
				{ x: 5, y: -0.5, ang: 0.05, len: 15, w: 5.5 },
			];

			for (const lf of leafDefs) {
				ctx.save();
				ctx.translate(lf.x * 0.5, lf.y * 0.5);
				ctx.rotate(lf.ang);
				this.setupPath(ctx, "#658A63", COLORS.ink, 1.4);
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.quadraticCurveTo(-lf.w, lf.len * 0.4, 0, lf.len);
				ctx.quadraticCurveTo(lf.w, lf.len * 0.4, 0, 0);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				ctx.strokeStyle = "#A3C4A1";
				ctx.lineWidth = 1.0;
				ctx.beginPath();
				ctx.moveTo(0, 1);
				ctx.lineTo(0, lf.len * 0.85);
				ctx.stroke();
				ctx.restore();
			}

			ctx.strokeStyle = "#385E36";
			ctx.lineWidth = 2.0;
			ctx.beginPath();
			ctx.moveTo(0, 0); ctx.lineTo(-8, -2);
			ctx.moveTo(0, 2); ctx.lineTo(-9, 1);
			ctx.moveTo(-1, 4); ctx.lineTo(-8, 5);
			ctx.stroke();

			this.setupPath(ctx, "#D97706", COLORS.ink, 1.2);
			ctx.fillRect(-4, -1, 4.5, 6);
			ctx.strokeRect(-4, -1, 4.5, 6);
			ctx.strokeStyle = "#B45309";
			ctx.lineWidth = 1.3;
			ctx.beginPath();
			ctx.moveTo(-3, 5); ctx.lineTo(-5, 9);
			ctx.moveTo(-1.5, 5); ctx.lineTo(-1, 8.5);
			ctx.stroke();

			ctx.save();
			ctx.translate(-14, 4);
			ctx.rotate(-0.5);
			this.setupPath(ctx, "#7E9F7C", COLORS.ink, 0.9);
			ctx.beginPath();
			ctx.ellipse(0, 0, 3.8, 1.8, 0, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();
			ctx.restore();

		} else if (v === 2) {
			// VARIANT 2: KVETOUCÍ MATEŘÍDOUŠKA (Flowering wild thyme with purple florets)
			this.setupPath(ctx, "transparent", "#78350F", 1.8);
			ctx.beginPath();
			ctx.moveTo(-9, 6);
			ctx.quadraticCurveTo(-2, 1, 4, -4);
			ctx.moveTo(-2, 2);
			ctx.quadraticCurveTo(3, 4, 9, 3);
			ctx.moveTo(1, -1);
			ctx.quadraticCurveTo(0, -7, -2, -10);
			ctx.stroke();

			this.setupPath(ctx, "#22C55E", COLORS.ink, 0.9);
			const thymeLeaves = [
				{ x: -5, y: 5 }, { x: -3, y: 2 }, { x: 1, y: 3 }, { x: 5, y: 4 }, { x: 1, y: -4 }
			];
			for (const tl of thymeLeaves) {
				ctx.beginPath();
				ctx.ellipse(tl.x, tl.y, 2.0, 1.1, 0.4, 0, Math.PI * 2);
				ctx.fill(); ctx.stroke();
			}

			const floretClusters = [
				{ cx: 4, cy: -5, count: 6 },
				{ cx: 9, cy: 3, count: 5 },
				{ cx: -2, cy: -10, count: 4 },
				{ cx: 1, cy: -1, count: 4 },
			];

			const purpleHues = ["#C084FC", "#A855F7", "#E879F9", "#DDD6FE"];
			for (const fc of floretClusters) {
				for (let f = 0; f < fc.count; f++) {
					const fa = (f / fc.count) * Math.PI * 2 + f * 0.3;
					const fdist = 1.2 + (f % 2) * 2.2;
					const fx = fc.cx + Math.cos(fa) * fdist;
					const fy = fc.cy + Math.sin(fa) * fdist;
					this.setupPath(ctx, purpleHues[f % purpleHues.length], COLORS.ink, 0.9);
					ctx.beginPath();
					ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
				}
			}

			this.setupPath(ctx, "#C084FC", COLORS.ink, 0.8);
			ctx.beginPath();
			ctx.arc(-12, 1, 1.5, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();
			ctx.beginPath();
			ctx.arc(-14, 6, 1.2, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();

		} else if (v === 3) {
			// VARIANT 3: SVATOJÁNSKÁ TŘEZALKA (St. John's Wort with golden 5-pointed star flowers)
			this.setupPath(ctx, "transparent", "#15803D", 1.8);
			ctx.beginPath();
			ctx.moveTo(-10, 7);
			ctx.quadraticCurveTo(-3, 1, 4, -4);
			ctx.moveTo(-3, 3);
			ctx.quadraticCurveTo(3, 4, 8, 5);
			ctx.stroke();

			this.setupPath(ctx, "#4ADE80", COLORS.ink, 1.0);
			const trezalkaLeaves = [
				{ x: -7, y: 5, a: -0.5 }, { x: -5, y: 7, a: 0.6 },
				{ x: -1, y: 1, a: -0.6 }, { x: 0, y: 4, a: 0.5 },
				{ x: 5, y: 4, a: 0.3 }
			];
			for (const tl of trezalkaLeaves) {
				ctx.beginPath();
				ctx.ellipse(tl.x, tl.y, 2.8, 1.4, tl.a, 0, Math.PI * 2);
				ctx.fill(); ctx.stroke();
			}

			const flowerCenters = [
				{ x: 5, y: -4, r: 6.5 },
				{ x: 9, y: 5, r: 5.0 },
				{ x: 0, y: -9, r: 4.5 }
			];

			for (const fc of flowerCenters) {
				ctx.save();
				ctx.translate(fc.x, fc.y);
				for (let p = 0; p < 5; p++) {
					const pa = (p / 5) * Math.PI * 2 - Math.PI / 2;
					this.setupPath(ctx, "#FACC15", COLORS.ink, 1.1);
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(Math.cos(pa - 0.25) * (fc.r * 0.6), Math.sin(pa - 0.25) * (fc.r * 0.6));
					ctx.lineTo(Math.cos(pa) * fc.r, Math.sin(pa) * fc.r);
					ctx.lineTo(Math.cos(pa + 0.25) * (fc.r * 0.6), Math.sin(pa + 0.25) * (fc.r * 0.6));
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
				}
				ctx.fillStyle = "#EA580C";
				ctx.beginPath();
				ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}

			this.setupPath(ctx, "#FACC15", COLORS.ink, 0.8);
			ctx.beginPath();
			ctx.ellipse(-13, 0, 2.5, 1.2, 0.3, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();

		} else if (v === 4) {
			// VARIANT 4: SVĚŽÍ MÁTA / MEDUŇKA (Serrated fresh green mint leaves)
			this.setupPath(ctx, "transparent", "#166534", 1.8);
			ctx.beginPath();
			ctx.moveTo(-9, 5);
			ctx.lineTo(0, 0);
			ctx.stroke();

			const mintLeaves = [
				{ a: -0.8, s: 1.0 },
				{ a: -0.2, s: 1.15 },
				{ a: 0.5, s: 1.05 },
				{ a: 1.1, s: 0.85 },
			];

			for (const ml of mintLeaves) {
				ctx.save();
				ctx.rotate(ml.a);
				const mlLen = 12 * ml.s;
				const mlW = 5.5 * ml.s;
				this.setupPath(ctx, "#22C55E", COLORS.ink, 1.3);
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(-mlW * 0.6, mlLen * 0.25);
				ctx.lineTo(-mlW * 0.5, mlLen * 0.35);
				ctx.lineTo(-mlW * 0.9, mlLen * 0.6);
				ctx.lineTo(-mlW * 0.6, mlLen * 0.7);
				ctx.lineTo(0, mlLen);
				ctx.lineTo(mlW * 0.6, mlLen * 0.7);
				ctx.lineTo(mlW * 0.9, mlLen * 0.6);
				ctx.lineTo(mlW * 0.5, mlLen * 0.35);
				ctx.lineTo(mlW * 0.6, mlLen * 0.25);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

				ctx.strokeStyle = "#15803D";
				ctx.lineWidth = 1.0;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(0, mlLen * 0.85);
				ctx.stroke();
				ctx.restore();
			}

			ctx.fillStyle = "#86EFAC";
			ctx.beginPath();
			ctx.arc(2, -8, 1.2, 0, Math.PI * 2);
			ctx.arc(8, -2, 1.0, 0, Math.PI * 2);
			ctx.fill();

		} else {
			// VARIANT 5: SNÍTKA LESNÍHO TYMIÁNU (Woody thyme bundle tied with hemp)
			this.setupPath(ctx, "transparent", "#78350F", 1.8);
			ctx.beginPath();
			ctx.moveTo(-10, 0); ctx.lineTo(10, -5);
			ctx.moveTo(-10, 0); ctx.lineTo(12, 0);
			ctx.moveTo(-10, 0); ctx.lineTo(10, 5);
			ctx.moveTo(-10, 0); ctx.lineTo(7, -8);
			ctx.moveTo(-10, 0); ctx.lineTo(8, 8);
			ctx.stroke();

			this.setupPath(ctx, "#166534", COLORS.ink, 0.9);
			for (let i = 0; i < 14; i++) {
				const tx = -2 + (i % 6) * 2.3;
				const ty = -7 + (i * 1.2) % 15;
				ctx.beginPath();
				ctx.ellipse(tx, ty, 2.2, 0.9, (i * 0.4), 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
			}

			this.setupPath(ctx, "#D97706", COLORS.ink, 1.2);
			ctx.beginPath();
			ctx.ellipse(-4, 0, 3.0, 4.5, 0.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = "#92400E";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(-4, 3); ctx.lineTo(-6, 7);
			ctx.moveTo(-3, 3); ctx.lineTo(-2, 6.5);
			ctx.stroke();
		}

		ctx.restore();
	},
	drawFajfka(ctx: any, x: number, y: number, scale: number = 1, angle: number = 0, puffProgress: number = 0) {
		ctx.save();
		ctx.translate(x, y);
		if (angle !== 0) ctx.rotate(angle);
		ctx.scale(scale, scale);

		this.drawShadow(ctx, 4, 20, 18);

		// 1. Curved dark horn stem & mouthpiece (Troubel a náústek)
		this.setupPath(ctx, "#1E232A", COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.moveTo(18, 5);
		ctx.bezierCurveTo(24, -3, 30, -15, 41, -19);
		ctx.lineTo(42, -16);
		ctx.bezierCurveTo(32, -12, 26, 0, 22, 9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Stem highlight
		ctx.strokeStyle = "#64748B";
		ctx.lineWidth = 1.0;
		ctx.beginPath();
		ctx.moveTo(19, 4);
		ctx.bezierCurveTo(25, -4, 31, -15, 40, -18);
		ctx.stroke();

		// Brass ferrule tip at mouthpiece
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.ellipse(42, -17.5, 2.0, 3.2, 0.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Brass ring connecting stem to lower collar
		this.setupPath(ctx, "#F59E0B", COLORS.ink, 1.4);
		ctx.beginPath();
		ctx.ellipse(19, 6, 2.5, 4.0, -0.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 2. Embossed silver mid collar with scallops
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 1.6);
		ctx.beginPath();
		ctx.ellipse(14, 11, 3.5, 5.5, -0.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 3. Wood / clay bowl & neck (Hlavička dýmky a krk dle předlohy)
		this.setupPath(ctx, "#B46A36", COLORS.ink, 2.4);
		ctx.beginPath();
		ctx.moveTo(-16, -4);
		ctx.quadraticCurveTo(-18, 14, -7, 23);
		ctx.quadraticCurveTo(4, 25, 12, 16);
		ctx.quadraticCurveTo(15, 12, 14, 9);
		ctx.quadraticCurveTo(4, 11, -1, 3);
		ctx.quadraticCurveTo(-4, -2, -5, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Wood highlight along the bowl belly
		ctx.strokeStyle = "#FDBA74";
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.moveTo(-14, -1);
		ctx.quadraticCurveTo(-16, 12, -7, 20);
		ctx.stroke();

		// Delicate wood grain pores / specks
		ctx.strokeStyle = "#431407";
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		ctx.moveTo(-13, 5); ctx.lineTo(-12.5, 8);
		ctx.moveTo(-11, 13); ctx.lineTo(-10.5, 16);
		ctx.moveTo(-5, 18); ctx.lineTo(-4, 20);
		ctx.moveTo(3, 17); ctx.lineTo(4, 15);
		ctx.moveTo(-6, 8); ctx.lineTo(-5.5, 11);
		ctx.stroke();

		// 4. Scalloped embossed silver rim band with rivets
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.0);
		ctx.beginPath();
		ctx.moveTo(-17, -4);
		ctx.lineTo(-4, -1);
		ctx.lineTo(-3, 6);
		ctx.quadraticCurveTo(-6, 8, -9, 6.5);
		ctx.quadraticCurveTo(-12, 8, -15, 6.5);
		ctx.quadraticCurveTo(-17, 7, -17.5, 4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Rivet studs on rim band
		ctx.fillStyle = "#F1F5F9";
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 0.8;
		for (const rx of [-14, -10, -6]) {
			ctx.beginPath();
			ctx.arc(rx, 1.5, 1.0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}

		// Leaf charm / hinge flap on side of bowl
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 1.2);
		ctx.beginPath();
		ctx.ellipse(-2.5, 3.5, 1.8, 3.2, 0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 5. Bowl interior & burning aromatic herbal embers
		this.setupPath(ctx, "#E5D5B8", COLORS.ink, 1.8);
		ctx.beginPath();
		ctx.ellipse(-10.5, -4, 6.5, 3.5, 0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Burning herb embers
		ctx.fillStyle = "#451A03";
		ctx.beginPath();
		ctx.ellipse(-10.5, -4, 5.0, 2.5, 0.15, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#F59E0B";
		ctx.beginPath();
		ctx.arc(-11.5, -4, 1.2, 0, Math.PI * 2);
		ctx.arc(-9, -4.5, 0.9, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#EA580C";
		ctx.beginPath();
		ctx.arc(-10, -3.2, 0.8, 0, Math.PI * 2);
		ctx.fill();

		// 6. Fragrant curling smoke wafting from the pipe
		if (puffProgress >= 0) {
			ctx.save();
			ctx.strokeStyle = "rgba(241, 245, 249, 0.85)";
			ctx.lineWidth = 1.8;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(-10, -7);
			ctx.bezierCurveTo(-12, -14, -8, -19, -11, -26);
			ctx.stroke();
			ctx.strokeStyle = "rgba(203, 213, 225, 0.6)";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(-8, -8);
			ctx.bezierCurveTo(-6, -13, -10, -17, -7, -23);
			ctx.stroke();
			ctx.restore();
		}

		ctx.restore();
	}
};
for (const key of Object.keys(Lada)) {
	const val = Lada[key];
	if (typeof val === "function") Lada[key] = val.bind(Lada);
}

export function getEnemyAttackAnimationState(enemy: any, time: number): EnemyAttackInfo {
  const cadence: EnemyAttackCadence = enemy.attackCadence || 'normal';
  const windupTimer = enemy.windupTimer || 0;
  const strikeTimer = enemy.strikeTimer || 0;
  
  // Total interval and timing split
  const totalInterval = enemy.attackInterval || (cadence === 'fast' ? 0.6 : cadence === 'slow' ? 1.8 : 1.2);
  const strikeMax = enemy.strikeMaxTimer || (cadence === 'slow' ? 0.65 : cadence === 'fast' ? 0.22 : 0.42);
  const attackDelay = enemy.attackDelay || Math.max(0.2, totalInterval - strikeMax);

  const isStrike = strikeTimer > 0;
  const isWindup = !isStrike && windupTimer > 0;
  const isActive = (isStrike || isWindup || Boolean(enemy.isAttacking)) && !enemy.isDefeated && !enemy.dead;

  const attackAngle = typeof enemy.attackAngle === 'number'
    ? enemy.attackAngle
    : (typeof enemy.vx === 'number' && enemy.vx < 0 ? Math.PI : 0);
  const facingDir = Math.cos(attackAngle) >= 0 ? 1 : -1;

  if (!isActive) {
    return {
      isActive: false,
      isWindup: false,
      isStrike: false,
      cadence,
      sequenceProgress: 0,
      windupProgress: 0,
      strikeProgress: 0,
      currentFrame: 0,
      totalFrames: cadence === 'slow' ? 5 : cadence === 'normal' ? 4 : 3,
      frameName: 'idle',
      lungeX: 0,
      lungeY: 0,
      squashX: 1,
      squashY: 1,
      leanAngle: 0,
      shakeX: 0,
      shakeY: 0,
      angle: attackAngle,
      facingDir,
      hasShockwave: false,
      shockwaveProgress: 0,
      hasDustPuff: false,
      hasSlashArc: false,
      slashArcProgress: 0,
      hasWeaponGleam: false,
      gleamProgress: 0,
    };
  }

  const windupProgress = Math.min(1, Math.max(0, windupTimer / attackDelay));
  const strikeProgress = isStrike ? Math.min(1, Math.max(0, 1 - (strikeTimer / strikeMax))) : 0;
  const sequenceProgress = isStrike
    ? (attackDelay + strikeProgress * strikeMax) / (attackDelay + strikeMax)
    : (windupProgress * attackDelay) / (attackDelay + strikeMax);

  let currentFrame = 0;
  let totalFrames = 3;
  let frameName = 'windup';
  let lungeDist = 0;
  let squashX = 1;
  let squashY = 1;
  let leanAngle = 0;
  let shakeX = 0;
  let shakeY = 0;
  let hasShockwave = false;
  let shockwaveProgress = 0;
  let hasDustPuff = false;
  let hasSlashArc = false;
  let slashArcProgress = 0;
  let hasWeaponGleam = false;
  let gleamProgress = 0;

  if (cadence === 'fast') {
    // 3 FAST FRAMES: 0 = crouch_coil (windup), 1 = lightning_strike (early strike), 2 = snap_recovery (late strike)
    totalFrames = 3;
    if (isWindup || (!isStrike && windupProgress > 0)) {
      currentFrame = 0;
      frameName = 'crouch_coil';
      const wp = windupProgress;
      squashX = 1.0 + 0.12 * wp;
      squashY = 1.0 - 0.14 * wp;
      lungeDist = -6 * wp;
      leanAngle = -0.16 * wp;
      if (wp > 0.65) {
        shakeX = Math.sin(time * 36) * 1.5;
        shakeY = Math.cos(time * 36) * 1.5;
      }
    } else {
      if (strikeProgress < 0.45) {
        currentFrame = 1;
        frameName = 'lightning_strike';
        const sp = strikeProgress / 0.45;
        lungeDist = 18 * (1 - sp * 0.35);
        squashX = 1.18 - sp * 0.08;
        squashY = 0.88 + sp * 0.08;
        leanAngle = 0.24 * (1 - sp * 0.4);
        hasSlashArc = true;
        slashArcProgress = sp;
      } else {
        currentFrame = 2;
        frameName = 'snap_recovery';
        const rp = (strikeProgress - 0.45) / 0.55;
        const bounce = Math.sin(rp * Math.PI) * 3;
        lungeDist = (1 - rp) * 6 + bounce;
        squashX = 1.0 + Math.sin(rp * Math.PI * 2) * 0.05;
        squashY = 1.0 - Math.sin(rp * Math.PI * 2) * 0.05;
        leanAngle = 0.12 * (1 - rp);
      }
    }
  } else if (cadence === 'normal') {
    // 4 NORMAL FRAMES: 0 = alert_raise, 1 = apex_tension, 2 = power_slash, 3 = balance_recovery
    totalFrames = 4;
    if (isWindup || (!isStrike && windupProgress > 0)) {
      if (windupProgress < 0.50) {
        currentFrame = 0;
        frameName = 'alert_raise';
        const p = windupProgress / 0.50;
        lungeDist = -8 * p;
        leanAngle = -0.18 * p;
        squashX = 0.96;
        squashY = 1.05;
      } else {
        currentFrame = 1;
        frameName = 'apex_tension';
        const p = (windupProgress - 0.50) / 0.50;
        lungeDist = -8 - 4 * p;
        leanAngle = -0.18 - 0.14 * p;
        squashX = 0.92;
        squashY = 1.10;
        shakeX = Math.sin(time * 26) * (1.2 + 0.8 * p);
        shakeY = Math.cos(time * 26) * (1.2 + 0.8 * p);
        hasWeaponGleam = p > 0.4;
        gleamProgress = p;
      }
    } else {
      if (strikeProgress < 0.42) {
        currentFrame = 2;
        frameName = 'power_slash';
        const sp = strikeProgress / 0.42;
        lungeDist = 24 * (1 - sp * 0.35);
        leanAngle = 0.32 * (1 - sp * 0.35);
        squashX = 1.16;
        squashY = 0.86;
        hasSlashArc = true;
        slashArcProgress = sp;
        hasDustPuff = sp < 0.35;
      } else {
        currentFrame = 3;
        frameName = 'balance_recovery';
        const rp = (strikeProgress - 0.42) / 0.58;
        lungeDist = 12 * (1 - rp);
        leanAngle = 0.18 * (1 - rp);
        squashX = 1.0 + (1 - rp) * 0.06;
        squashY = 1.0 - (1 - rp) * 0.06;
      }
    }
  } else {
    // 5 SLOW FRAMES: 0 = heavy_brace, 1 = overhead_hoist, 2 = trembling_apex, 3 = earth_smash, 4 = heavy_dislodge
    totalFrames = 5;
    if (isWindup || (!isStrike && windupProgress > 0)) {
      if (windupProgress < 0.35) {
        currentFrame = 0;
        frameName = 'heavy_brace';
        const p = windupProgress / 0.35;
        squashX = 1.0 + 0.20 * p;
        squashY = 1.0 - 0.18 * p;
        lungeDist = 0;
        leanAngle = 0;
        hasDustPuff = p > 0.35;
      } else if (windupProgress < 0.70) {
        currentFrame = 1;
        frameName = 'overhead_hoist';
        const p = (windupProgress - 0.35) / 0.35;
        squashX = 1.20 - 0.32 * p;
        squashY = 0.82 + 0.40 * p;
        lungeDist = -10 * p;
        leanAngle = -0.38 * p;
      } else {
        currentFrame = 2;
        frameName = 'trembling_apex';
        const p = (windupProgress - 0.70) / 0.30;
        squashX = 0.88;
        squashY = 1.22;
        lungeDist = -10 - 2 * p;
        leanAngle = -0.38 - 0.06 * p;
        shakeX = Math.sin(time * 42) * (2.2 + 1.2 * p);
        shakeY = Math.cos(time * 42) * (2.2 + 1.2 * p);
        hasWeaponGleam = true;
        gleamProgress = p;
      }
    } else {
      if (strikeProgress < 0.38) {
        currentFrame = 3;
        frameName = 'earth_smash';
        const sp = strikeProgress / 0.38;
        lungeDist = 36 * (1 - sp * 0.3);
        leanAngle = 0.42 * (1 - sp * 0.35);
        squashX = 1.28;
        squashY = 0.76;
        hasShockwave = true;
        shockwaveProgress = sp;
        hasSlashArc = true;
        slashArcProgress = sp;
        hasDustPuff = true;
      } else {
        currentFrame = 4;
        frameName = 'heavy_dislodge';
        const rp = (strikeProgress - 0.38) / 0.62;
        const heaveWobble = Math.sin(rp * 14) * (2.2 * (1 - rp));
        lungeDist = 20 * (1 - rp) + heaveWobble;
        leanAngle = 0.22 * (1 - rp);
        squashX = 1.0 + (1 - rp) * 0.14;
        squashY = 1.0 - (1 - rp) * 0.14;
        shakeX = heaveWobble * 0.8;
      }
    }
  }

  const lungeX = Math.cos(attackAngle) * lungeDist;
  const lungeY = Math.sin(attackAngle) * lungeDist;

  return {
    isActive: true,
    isWindup,
    isStrike,
    cadence,
    sequenceProgress,
    windupProgress,
    strikeProgress,
    currentFrame,
    totalFrames,
    frameName,
    lungeX,
    lungeY,
    squashX,
    squashY,
    leanAngle,
    shakeX,
    shakeY,
    angle: attackAngle,
    facingDir,
    hasShockwave,
    shockwaveProgress,
    hasDustPuff,
    hasSlashArc,
    slashArcProgress,
    hasWeaponGleam,
    gleamProgress,
  };
}

export function drawEnemyAttackEffectsPre(ctx: CanvasRenderingContext2D, enemy: any, info: EnemyAttackInfo) {
  if (!info.isActive) return;

  // 1. Heavy impact ground shockwave (for slow cadence)
  if (info.hasShockwave) {
    const sp = info.shockwaveProgress;
    const alpha = Math.max(0, 1 - sp * 1.1);
    const radiusX = (enemy.radius * 0.9) + sp * (enemy.radius * 2.2);
    const radiusY = radiusX * 0.42;
    const shockX = enemy.x + Math.cos(info.angle) * 12;
    const shockY = enemy.y + enemy.radius * 0.65 + Math.sin(info.angle) * 6;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(shockX, shockY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(28, 19, 14, ${alpha * 0.85})`;
    ctx.lineWidth = 3.2 * (1 - sp * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(shockX, shockY, radiusX * 0.82, radiusY * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.65})`;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Earth debris / flying pebble specks
    ctx.fillStyle = `rgba(120, 53, 15, ${alpha})`;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const dist = radiusX * (0.6 + sp * 0.5);
      const px = shockX + Math.cos(a) * dist;
      const py = shockY + Math.sin(a) * (dist * 0.42) - sp * 10;
      ctx.beginPath();
      ctx.arc(px, py, 2.2 * (1 - sp * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Foot dust clouds (Ladovské obláčky)
  if (info.hasDustPuff) {
    const dustAlpha = info.isStrike ? (1 - info.strikeProgress) : (info.windupProgress);
    const footY = enemy.y + enemy.radius * 0.75;
    ctx.save();
    ctx.globalAlpha = Math.min(0.85, Math.max(0.1, dustAlpha * 0.8));
    ctx.fillStyle = "#E2D9C8";
    ctx.strokeStyle = "#1C130E";
    ctx.lineWidth = 1.6;

    // Left dust puff
    ctx.beginPath();
    ctx.arc(enemy.x - enemy.radius * 0.6, footY, 5.5, 0, Math.PI * 2);
    ctx.arc(enemy.x - enemy.radius * 0.85, footY + 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right dust puff
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.radius * 0.6, footY, 5.5, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.radius * 0.85, footY + 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

export function drawEnemyAttackEffectsPost(ctx: CanvasRenderingContext2D, enemy: any, info: EnemyAttackInfo) {
  if (!info.isActive) return;

  const ang = info.angle;
  const dir = info.facingDir;

  // 1. Weapon Gleam / Warning Star at Apex Tension
  if (info.hasWeaponGleam) {
    const p = info.gleamProgress;
    const gleamScale = 0.6 + p * 0.8 + Math.sin(p * Math.PI * 4) * 0.2;
    const starX = enemy.x + (dir * enemy.radius * 0.6) - Math.cos(ang) * 4;
    const starY = enemy.y - enemy.radius * 0.95;

    ctx.save();
    ctx.translate(starX, starY);
    ctx.scale(gleamScale, gleamScale);

    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(2.4, -2.4);
    ctx.lineTo(9, 0);
    ctx.lineTo(2.4, 2.4);
    ctx.lineTo(0, 9);
    ctx.lineTo(-2.4, 2.4);
    ctx.lineTo(-9, 0);
    ctx.lineTo(-2.4, -2.4);
    ctx.closePath();
    ctx.fillStyle = info.cadence === 'slow' ? '#EF4444' : '#FBBF24';
    ctx.strokeStyle = '#1C130E';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 2. Dynamic Slash Arcs and Claw Streaks
  if (info.hasSlashArc) {
    const sp = info.slashArcProgress;
    const alpha = Math.max(0, 1 - sp * 1.15);

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(ang);

    if (info.cadence === 'fast') {
      ctx.strokeStyle = `rgba(28, 19, 14, ${alpha})`;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      const reach = enemy.radius * 1.45 + sp * 8;
      for (let i = -1; i <= 1; i++) {
        const oy = i * 7;
        ctx.beginPath();
        ctx.moveTo(enemy.radius * 0.4, oy - i * 3);
        ctx.lineTo(reach, oy + i * 4);
        ctx.stroke();

        ctx.fillStyle = i === 0 ? '#FBBF24' : '#EF4444';
        ctx.beginPath();
        ctx.arc(reach + 2, oy + i * 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (info.cadence === 'normal') {
      const arcRadius = enemy.radius * 1.4 + sp * 6;
      const startAngle = -Math.PI * 0.35 + sp * 0.2;
      const endAngle = Math.PI * 0.35 - sp * 0.1;

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.65})`;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = `rgba(28, 19, 14, ${alpha * 0.95})`;
      ctx.lineWidth = 2.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius - 6, startAngle + 0.15, endAngle - 0.15);
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.8})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else {
      const arcRadius = enemy.radius * 1.7 + sp * 10;
      const startAngle = -Math.PI * 0.48 + sp * 0.15;
      const endAngle = Math.PI * 0.48 - sp * 0.1;

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.75})`;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.9})`;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius + 4, startAngle, endAngle);
      ctx.strokeStyle = `rgba(28, 19, 14, ${alpha})`;
      ctx.lineWidth = 3.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius - 4, startAngle, endAngle);
      ctx.strokeStyle = `rgba(28, 19, 14, ${alpha})`;
      ctx.lineWidth = 2.4;
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        const sparkT = startAngle + (i / 4) * (endAngle - startAngle);
        const sx = Math.cos(sparkT) * (arcRadius + (i % 2 === 0 ? 8 : -6));
        const sy = Math.sin(sparkT) * (arcRadius + (i % 2 === 0 ? 8 : -6));
        ctx.fillStyle = i % 2 === 0 ? '#FBBF24' : '#EF4444';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 * (1 - sp * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export interface KinematicsParams {
  cadence: EnemyAttackCadence;
  isAttacking: boolean;
  windupTimer: number;
  recoveryTimer: number;
  attackDelay?: number;
  recoveryDuration?: number;
  attackAngle?: number;
  facingDir?: number;
  time?: number;
}

export interface EnemyKinematicsResult {
  lungeX: number;
  lungeY: number;
  scaleX: number;
  scaleY: number;
  leanAngle: number;
  shakeX: number;
  shakeY: number;
  phase: number;
  hasShockwave: boolean;
  hasSlashingArc: boolean;
  hasClawSparks: boolean;
  hasGroundDust: boolean;
  showWarningFlare: boolean;
  flareColor: 'red' | 'gold';
  flareX: number;
  flareY: number;
}

function computeEnemyKinematics(params: KinematicsParams): EnemyKinematicsResult {
  const cadence: EnemyAttackCadence = params.cadence || 'normal';
  const isAttacking = !!params.isAttacking;
  const windupTimer = params.windupTimer || 0;
  const recoveryTimer = params.recoveryTimer || 0;
  const attackDelay =
    typeof params.attackDelay === 'number'
      ? params.attackDelay
      : CADENCE_ATTACK_DELAYS[cadence] ?? 1.2;
  const recoveryDuration =
    typeof params.recoveryDuration === 'number'
      ? params.recoveryDuration
      : CADENCE_RECOVERY_DURATIONS[cadence] ?? 0.2;
  const attackAngle = params.attackAngle || 0;
  const facingDir = params.facingDir || 1;
  const time = params.time || 0;

  const result: EnemyKinematicsResult = {
    lungeX: 0,
    lungeY: 0,
    scaleX: 1,
    scaleY: 1,
    leanAngle: 0,
    shakeX: 0,
    shakeY: 0,
    phase: 0,
    hasShockwave: false,
    hasSlashingArc: false,
    hasClawSparks: false,
    hasGroundDust: false,
    showWarningFlare: false,
    flareColor: 'gold',
    flareX: 0,
    flareY: 0,
  };

  if (!isAttacking && recoveryTimer <= 0) {
    return result;
  }

  if (cadence === 'slow') {
    if (isAttacking) {
      const progress = Math.min(1, windupTimer / attackDelay);
      if (progress <= 0.28) {
        // Phase 1: Heavy crouch & brace
        result.phase = 1;
        const p1 = Math.max(0.2, progress / 0.28);
        result.scaleY = 1.0 - 0.12 * p1;
        result.scaleX = 1.0 + 0.12 * p1;
        result.hasGroundDust = true;
      } else if (progress <= 0.67) {
        // Phase 2: Monumental lift & stretch
        result.phase = 2;
        const p2 = (progress - 0.28) / 0.39;
        result.scaleY = 0.92 + 0.26 * p2;
        result.scaleX = 1.08 - 0.16 * p2;
        result.leanAngle = -0.16 * Math.max(0.2, p2) * facingDir;
        result.lungeX = -6 * Math.cos(attackAngle) * p2;
        result.lungeY = -6 * Math.sin(attackAngle) * p2;
      } else {
        // Phase 3: Apex tension & high frequency shake
        result.phase = 3;
        const p3 = (progress - 0.67) / 0.33;
        result.scaleY = 1.18;
        result.scaleX = 0.92;
        result.shakeX = Math.sin(time * 50) * (2.2 * Math.max(0.3, p3));
        result.shakeY = Math.cos(time * 45) * (1.6 * Math.max(0.3, p3));
        result.leanAngle = -0.16 * facingDir;
        result.lungeX = -6 * Math.cos(attackAngle);
        result.lungeY = -6 * Math.sin(attackAngle);
        result.showWarningFlare = true;
        result.flareColor = 'red';
      }
    } else if (recoveryTimer > 0) {
      const recProgress = 1 - recoveryTimer / recoveryDuration;
      if (recProgress < 0.35) {
        // Phase 4: Massive forward lunge (36px) & impact
        result.phase = 4;
        result.lungeX = Math.cos(attackAngle) * 36;
        result.lungeY = Math.sin(attackAngle) * 36;
        result.scaleY = 0.82;
        result.scaleX = 1.18;
        result.leanAngle = 0.22 * facingDir;
        result.hasSlashingArc = true;
        result.hasShockwave = true;
      } else {
        // Phase 5: Weapon dislodgement & recovery
        result.phase = 5;
        const p5 = (recProgress - 0.35) / 0.65;
        const ease = 1 - p5;
        result.lungeX = Math.cos(attackAngle) * 36 * ease;
        result.lungeY = Math.sin(attackAngle) * 36 * ease;
        result.scaleY = 0.82 + 0.18 * p5;
        result.scaleX = 1.18 - 0.18 * p5;
        result.leanAngle = 0.22 * ease * facingDir;
      }
    }
  } else if (cadence === 'normal') {
    if (isAttacking) {
      const progress = Math.min(1, windupTimer / attackDelay);
      if (progress <= 0.375) {
        // Phase 1: Anticipation step back & lift
        result.phase = 1;
        const p1 = Math.max(0.2, progress / 0.375);
        result.lungeX = -8 * Math.cos(attackAngle) * p1;
        result.lungeY = -8 * Math.sin(attackAngle) * p1;
        result.scaleY = 1.0 + 0.08 * p1;
        result.scaleX = 1.0 - 0.05 * p1;
        result.leanAngle = -0.12 * p1 * facingDir;
      } else {
        // Phase 2: Curve with shake & golden star flare
        result.phase = 2;
        const p2 = (progress - 0.375) / 0.625;
        result.scaleY = 1.08;
        result.scaleX = 0.95;
        result.shakeX = Math.sin(time * 45) * (1.6 * p2);
        result.shakeY = Math.cos(time * 40) * (1.2 * p2);
        result.leanAngle = -0.12 * facingDir;
        result.lungeX = -8 * Math.cos(attackAngle);
        result.lungeY = -8 * Math.sin(attackAngle);
        result.showWarningFlare = true;
        result.flareColor = 'gold';
      }
    } else if (recoveryTimer > 0) {
      const recProgress = 1 - recoveryTimer / recoveryDuration;
      if (recProgress < 0.35) {
        // Phase 3: Spring lunge (24px)
        result.phase = 3;
        result.lungeX = Math.cos(attackAngle) * 24;
        result.lungeY = Math.sin(attackAngle) * 24;
        result.scaleY = 0.88;
        result.scaleX = 1.12;
        result.leanAngle = 0.16 * facingDir;
        result.hasSlashingArc = true;
        result.hasGroundDust = true;
      } else {
        // Phase 4: Smooth balance settling
        result.phase = 4;
        const p4 = (recProgress - 0.35) / 0.65;
        const ease = 1 - p4;
        result.lungeX = Math.cos(attackAngle) * 24 * ease;
        result.lungeY = Math.sin(attackAngle) * 24 * ease;
        result.scaleY = 0.88 + 0.12 * p4;
        result.scaleX = 1.12 - 0.12 * p4;
        result.leanAngle = 0.16 * ease * facingDir;
      }
    }
  } else {
    // Fast cadence
    if (isAttacking) {
      const progress = Math.min(1, windupTimer / attackDelay);
      if (progress <= 0.67) {
        // Phase 1: Spring compression
        result.phase = 1;
        const p1 = Math.max(0.3, progress / 0.67);
        result.scaleY = 1.0 - 0.22 * p1;
        result.scaleX = 1.0 + 0.22 * p1;
        result.leanAngle = 0.05 * p1 * facingDir;
        result.shakeX = Math.sin(time * 60) * (0.8 * p1);
        result.hasGroundDust = true;
      } else {
        result.phase = 1;
        result.scaleY = 0.78;
        result.scaleX = 1.22;
        result.shakeX = Math.sin(time * 70) * 1.5;
        result.shakeY = Math.cos(time * 65) * 1.0;
        result.leanAngle = 0.05 * facingDir;
      }
    } else if (recoveryTimer > 0) {
      const recProgress = 1 - recoveryTimer / recoveryDuration;
      if (recProgress < 0.4) {
        // Phase 2: Rapid lunge & 3 claw sparks
        result.phase = 2;
        result.lungeX = Math.cos(attackAngle) * 20;
        result.lungeY = Math.sin(attackAngle) * 20;
        result.scaleY = 1.16;
        result.scaleX = 0.86;
        result.leanAngle = 0.18 * facingDir;
        result.hasClawSparks = true;
      } else {
        // Phase 3: Instant bounce back to neutral
        result.phase = 3;
        const p3 = (recProgress - 0.4) / 0.6;
        const ease = 1 - p3;
        result.lungeX = Math.cos(attackAngle) * 20 * ease;
        result.lungeY = Math.sin(attackAngle) * 20 * ease;
        result.scaleY = 1.16 - 0.16 * p3;
        result.scaleX = 0.86 + 0.14 * p3;
        result.leanAngle = 0.18 * ease * facingDir;
      }
    }
  }

  return result;
}

function drawFourPointedStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  fill: string,
  stroke: string = COLORS.ink
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGroundVfx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  k: EnemyKinematicsResult,
  radius: number
) {
  const groundY = y + radius * 0.82;
  if (k.hasGroundDust) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * (radius * 0.45);
      const puffR = radius * 0.22 * (1 - i * 0.15);
      ctx.beginPath();
      ctx.ellipse(x + offsetX, groundY + 2, Math.max(1, puffR), Math.max(1, puffR * 0.45), 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 180, 130, 0.45)';
      ctx.strokeStyle = 'rgba(42, 23, 10, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  if (k.hasShockwave) {
    ctx.save();
    // Inner amber flash
    ctx.beginPath();
    ctx.ellipse(x + k.lungeX * 0.6, groundY, radius * 1.3, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Outer dark ink shockwave line
    ctx.beginPath();
    ctx.ellipse(x + k.lungeX * 0.6, groundY, radius * 1.7, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#2A170A';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.restore();
  }
}

function drawOverlayVfx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  k: EnemyKinematicsResult,
  radius: number,
  enemy: any,
  facingDir: number,
  time: number,
  attackAngle: number
) {
  const charX = x + k.lungeX + k.shakeX;
  const charY = y + k.lungeY + k.shakeY;

  // 1. Dynamic ink slashing arc
  if (k.hasSlashingArc) {
    ctx.save();
    const arcRadius = radius * 1.35;
    const arcSpan = k.phase === 4 ? (160 * Math.PI) / 180 : (135 * Math.PI) / 180;
    const startAngle = attackAngle - arcSpan / 2;
    const endAngle = attackAngle + arcSpan / 2;

    // Ink stroke
    ctx.beginPath();
    ctx.arc(charX, charY, arcRadius, startAngle, endAngle);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner amber/red core
    ctx.beginPath();
    ctx.arc(charX, charY, Math.max(1, arcRadius - 1.5), startAngle + 0.1, endAngle - 0.1);
    ctx.strokeStyle = k.phase === 4 ? '#EF4444' : '#F59E0B';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // 2. Three sharp claw sparks (for fast cadence)
  if (k.hasClawSparks) {
    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(attackAngle);
    const slashDist = radius * 0.9;
    for (let i = -1; i <= 1; i++) {
      const cy = i * 9;
      ctx.beginPath();
      ctx.moveTo(slashDist - 12, cy - 4);
      ctx.lineTo(slashDist + 16, cy + 3);
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(slashDist - 10, cy - 3);
      ctx.lineTo(slashDist + 14, cy + 2);
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Spark dot
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(slashDist + 18, cy + 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Four-pointed warning star (apex windup) positioned at weapon tip / raised strike arm
  if (k.showWarningFlare) {
    const enemyId = enemy?.id || '';
    const method = enemy?.method || '';
    let tipOffsetX = facingDir * (radius * 0.65);
    let tipOffsetY = -radius * 0.75;

    if (enemyId === 'obr' || method === 'drawObr') {
      tipOffsetX = facingDir * 10;
      tipOffsetY = -radius * 1.45;
    } else if (enemyId === 'drevorubec' || enemyId === 'zbojnik' || method === 'drawDrevorubec' || method === 'drawZbojnik') {
      tipOffsetX = facingDir * (radius * 0.8);
      tipOffsetY = -radius * 0.95;
    } else if (enemyId === 'kostlivec' || method === 'drawKostlivec') {
      tipOffsetX = facingDir * (radius * 0.9);
      tipOffsetY = -radius * 1.1;
    } else if (enemyId === 'cert' || enemyId === 'certik' || method === 'drawCert' || method === 'drawCertik') {
      tipOffsetX = facingDir * (radius * 1.05);
      tipOffsetY = -radius * 0.45;
    }

    const starX = charX + tipOffsetX;
    const starY = charY + tipOffsetY;
    const fillColor = k.flareColor === 'red' ? '#DC2626' : '#F59E0B';
    drawFourPointedStar(ctx, starX, starY, 11, 4, fillColor, COLORS.ink);
  }

  // 4. Archetype weapon silhouettes:
  const enemyId = enemy?.id || '';
  const method = enemy?.method || '';

  // Obr: Pine tree trunk (borovice)
  if (enemyId === 'obr' || method === 'drawObr') {
    ctx.save();
    ctx.translate(charX, charY);
    ctx.scale(facingDir, 1);
    if (k.phase === 1 || k.phase === 2 || k.phase === 3) {
      ctx.save();
      ctx.rotate(-0.45);
      Lada.setupPath(ctx, '#5E3A21', COLORS.ink, 3.5);
      ctx.beginPath();
      ctx.moveTo(-6, -26);
      ctx.lineTo(-4, -76);
      ctx.lineTo(4, -74);
      ctx.lineTo(6, -28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#3D2210';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-3, -34);
      ctx.lineTo(-2, -72);
      ctx.moveTo(2, -32);
      ctx.lineTo(3, -70);
      ctx.stroke();

      Lada.setupPath(ctx, '#233E2B', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.moveTo(-14, -76);
      ctx.lineTo(0, -96);
      ctx.lineTo(15, -74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (k.phase === 4 || k.phase === 5) {
      ctx.save();
      ctx.rotate(0.35);
      Lada.setupPath(ctx, '#5E3A21', COLORS.ink, 3.5);
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(44, 26);
      ctx.lineTo(34, 34);
      ctx.lineTo(2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Dřevorubec & Zbojník: Two-handed axe
  else if (
    enemyId === 'drevorubec' ||
    enemyId === 'zbojnik' ||
    enemyId === 'obrneny_zbojnik' ||
    method === 'drawDrevorubec' ||
    method === 'drawZbojnik'
  ) {
    ctx.save();
    ctx.translate(charX, charY);
    ctx.scale(facingDir, 1);
    if (k.phase === 1 || k.phase === 2) {
      ctx.save();
      ctx.rotate(-0.55);
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(-24, -48);
      ctx.stroke();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.moveTo(-24, -46);
      ctx.lineTo(-42, -56);
      ctx.quadraticCurveTo(-46, -42, -40, -32);
      ctx.lineTo(-22, -38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (k.phase === 3 || k.phase === 4) {
      ctx.save();
      ctx.rotate(0.4);
      ctx.strokeStyle = '#8C5A35';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(4, -12);
      ctx.lineTo(26, 22);
      ctx.stroke();
      Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.5);
      ctx.beginPath();
      ctx.moveTo(24, 18);
      ctx.lineTo(40, 14);
      ctx.quadraticCurveTo(44, 26, 38, 36);
      ctx.lineTo(22, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Kostlivec s kosou: Scythe over skull
  else if (enemyId === 'skeleton_scythe' || method === 'drawSkeletonScythe') {
    ctx.save();
    ctx.translate(charX, charY);
    ctx.scale(facingDir, 1);
    if (k.phase === 1 || k.phase === 2 || k.phase === 3) {
      ctx.save();
      ctx.rotate(-0.5);
      ctx.strokeStyle = COLORS.woodDark;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-6, -54);
      ctx.stroke();

      Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.4);
      ctx.beginPath();
      ctx.moveTo(-6, -54);
      ctx.quadraticCurveTo(-28, -62, -44, -50);
      ctx.lineTo(-40, -46);
      ctx.quadraticCurveTo(-26, -54, -6, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (k.phase === 4 || k.phase === 5) {
      ctx.save();
      ctx.rotate(0.25);
      ctx.strokeStyle = COLORS.woodDark;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(24, 18);
      ctx.stroke();
      Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.4);
      ctx.beginPath();
      ctx.moveTo(24, 18);
      ctx.quadraticCurveTo(46, 12, 54, 28);
      ctx.lineTo(48, 30);
      ctx.quadraticCurveTo(42, 18, 22, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Čert & Čertík: Wrought pitchfork
  else if (
    enemyId === 'cert' ||
    enemyId === 'certik' ||
    method === 'drawCert' ||
    method === 'drawCertik'
  ) {
    ctx.save();
    ctx.translate(charX, charY);
    ctx.scale(facingDir, 1);
    if (k.phase === 1 || k.phase === 2) {
      ctx.save();
      ctx.rotate(-0.4);
      ctx.strokeStyle = '#3D2210';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-14, 12);
      ctx.lineTo(-24, -40);
      ctx.stroke();

      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-30, -38);
      ctx.lineTo(-18, -42);
      ctx.moveTo(-29, -38);
      ctx.lineTo(-35, -58);
      ctx.moveTo(-24, -40);
      ctx.lineTo(-24, -62);
      ctx.moveTo(-19, -42);
      ctx.lineTo(-13, -58);
      ctx.stroke();

      for (const [tx, ty] of [[-35, -58], [-24, -62], [-13, -58]]) {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(tx, ty + (Math.sin(time * 30) > 0 ? -3 : 2), 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (k.phase === 3 || k.phase === 4) {
      ctx.save();
      ctx.rotate(0.2);
      ctx.strokeStyle = '#3D2210';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(28, -2);
      ctx.stroke();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(28, -9);
      ctx.lineTo(28, 5);
      ctx.moveTo(28, -8);
      ctx.lineTo(46, -12);
      ctx.moveTo(28, -2);
      ctx.lineTo(50, -2);
      ctx.moveTo(28, 4);
      ctx.lineTo(46, 8);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawThematicEnemyDetails(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  enemy: any,
  facingDir: number,
  time: number,
  radius: number,
  panicked: boolean
) {
  const enemyId = enemy?.id || '';
  const palette = enemy?.palette || '';
  if (!palette && !enemyId) return;

  ctx.save();

  // 1. SAZOVÝ RARÁŠEK (Chimney-sweep sprite with wire brush, soot puffs & glowing coal eyes)
  if (enemyId === 'sazovy_rarach' || (palette === 'soot' && (enemyId === 'rarach' || enemy?.method === 'drawRarach'))) {
    // Chimney sweep wire brush (kominická štětka) strapped across back
    ctx.save();
    ctx.translate(x - 4 * facingDir, y - 2);
    ctx.rotate(facingDir * -0.45);
    // Wooden pole
    ctx.strokeStyle = '#8C5A35';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 16); ctx.lineTo(0, -22);
    ctx.stroke();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Round black wire brush head
    Lada.setupPath(ctx, '#18181B', COLORS.ink, 1.5);
    ctx.beginPath();
    ctx.arc(0, -22, 5.5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Brass binding ring
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-2, -18, 4, 3);
    ctx.restore();

    // Curling chimney soot puffs from horns
    ctx.fillStyle = 'rgba(75, 85, 99, 0.65)';
    for (let i = 0; i < 3; i++) {
      const pt = (time * 2.5 + i * 0.33) % 1;
      const sx = x - 6 * facingDir + Math.sin(pt * 4 + i) * 6;
      const sy = y - radius * 0.9 - pt * 16;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + pt * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing orange coal eyes
    ctx.fillStyle = 'rgba(249, 115, 22, 0.40)';
    ctx.beginPath();
    ctx.arc(x + 4 * facingDir, y - radius * 0.45, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(x + 4 * facingDir, y - radius * 0.45, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(x + 4.5 * facingDir, y - radius * 0.45, 1, 0, Math.PI * 2);
    ctx.fill();

    // White soot smudges around muzzle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x + 2 * facingDir, y - radius * 0.15, 1.8, 0, Math.PI * 2);
    ctx.arc(x - 2 * facingDir, y - radius * 0.25, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. KRVAVÝ RARÁŠEK (Barbed tail, horn rings, razor claws & crimson fury)
  else if (enemyId === 'krvavy_rarach' || (palette === 'crimson' && (enemyId === 'rarach' || enemy?.method === 'drawRarach'))) {
    // Barbed bone spikes along the devil tail ending in crimson barb
    ctx.save();
    ctx.translate(x - 12 * facingDir, y - 6);
    ctx.scale(facingDir, 1);
    Lada.setupPath(ctx, '#EF4444', COLORS.ink, 1.6);
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(-12, -8); ctx.lineTo(-8, 2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Twin jagged tail spikes
    ctx.beginPath();
    ctx.moveTo(-1, 4); ctx.lineTo(-6, 8); ctx.lineTo(-2, 8); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Barbed brass rings on horns
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x - 6 * facingDir, y - radius * 0.85, 3.2, 0, Math.PI * 2);
    ctx.arc(x + 6 * facingDir, y - radius * 0.85, 3.2, 0, Math.PI * 2);
    ctx.stroke();

    // Blood-red glowing eyes
    ctx.fillStyle = 'rgba(220, 38, 38, 0.40)';
    ctx.beginPath();
    ctx.arc(x + 3 * facingDir, y - radius * 0.45, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x + 3 * facingDir, y - radius * 0.45, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Dripping crimson fury sparks
    ctx.fillStyle = '#DC2626';
    for (let i = 0; i < 2; i++) {
      const st = (time * 4 + i * 0.5) % 1;
      ctx.beginPath();
      ctx.arc(x + (6 + i * 4) * facingDir, y + radius * 0.2 + st * 12, 1.4 * (1 - st * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. ČERVENÝ KOSTLIVEC (Blood-red heraldic battle surcoat, executioner broad axe & iron skull circlet)
  else if (enemyId === 'krvavy_kostlivec' || (palette === 'crimson' && (enemyId === 'skeleton' || enemy?.method === 'drawSkeleton'))) {
    // Tattered blood-red heraldic tabard/surcoat over ribs
    Lada.setupPath(ctx, '#B91C1C', COLORS.ink, 2.2);
    ctx.beginPath();
    ctx.moveTo(x - 8 * facingDir, y - 6);
    ctx.lineTo(x + 8 * facingDir, y - 6);
    ctx.lineTo(x + 10 * facingDir, y + 14);
    ctx.lineTo(x + 4 * facingDir, y + 18);
    ctx.lineTo(x, y + 14);
    ctx.lineTo(x - 4 * facingDir, y + 18);
    ctx.lineTo(x - 10 * facingDir, y + 14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Aged white bone heraldic cross on chest
    ctx.strokeStyle = '#F3E9D2';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, y - 2); ctx.lineTo(x, y + 10);
    ctx.moveTo(x - 5 * facingDir, y + 3); ctx.lineTo(x + 5 * facingDir, y + 3);
    ctx.stroke();

    // Notched executioner's broad axe (katovská širočina) in hand
    ctx.save();
    ctx.translate(x + 16 * facingDir, y + 2);
    ctx.scale(facingDir, 1);
    ctx.rotate(0.3);
    // Shaft
    ctx.strokeStyle = '#5E3A21';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-4, 22); ctx.lineTo(8, -26);
    ctx.stroke();
    // Chipped broad axe blade
    Lada.setupPath(ctx, '#475569', COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(8, -24);
    ctx.lineTo(24, -28);
    ctx.lineTo(26, -14);
    // Chipped notch
    ctx.lineTo(20, -12);
    ctx.lineTo(25, -6);
    ctx.lineTo(6, -12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Riveted iron circlet around the skull brow
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(x, y - radius * 0.7, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing red eye sockets
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(x - 3 * facingDir, y - radius * 0.65, 3.8, 0, Math.PI * 2);
    ctx.arc(x + 4 * facingDir, y - radius * 0.65, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x - 3 * facingDir, y - radius * 0.65, 2, 0, Math.PI * 2);
    ctx.arc(x + 4 * facingDir, y - radius * 0.65, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. MOČÁLOVÁ ROPUCHA (Toxic yellow pustules, duckweed clumps, pulsing throat sac & toad slit eyes)
  else if (enemyId === 'ropucha' || (palette === 'bog' && (enemyId === 'zaba' || enemy?.method === 'drawZaba'))) {
    // Toxic yellow-orange warts on back
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.2;
    [
      [-6 * facingDir, -2],
      [-10 * facingDir, 2],
      [0, -4],
      [4 * facingDir, 0],
      [-2 * facingDir, 5]
    ].forEach(([wx, wy]) => {
      ctx.beginPath();
      ctx.arc(x + wx, y + wy, 2.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    });

    // Duckweed clumps (žabinec) stuck on head
    Lada.setupPath(ctx, '#16A34A', COLORS.ink, 1.2);
    ctx.beginPath();
    ctx.ellipse(x - 5 * facingDir, y - 8, 3, 2, 0.3, 0, Math.PI * 2);
    ctx.ellipse(x + 2 * facingDir, y - 9, 3.5, 2.2, -0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Bloated pulsing throat sac
    const throatPulse = Math.sin(time * 6) * 3;
    Lada.setupPath(ctx, '#FEF08A', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.ellipse(x + 5 * facingDir, y + 4, 6 + throatPulse, 5 + throatPulse * 0.6, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Horizontal slit toad pupils
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 6 * facingDir, y - 7); ctx.lineTo(x + 11 * facingDir, y - 7);
    ctx.stroke();
  }

  // 5. OBRNĚNÝ HEJTMAN LAPKŮ (Riveted steel cuirass, kettle hat with nose guard & spiked war club)
  else if (enemyId === 'obrneny_zbojnik' || (palette === 'steel' && (enemyId === 'zbojnik' || enemy?.method === 'drawZbojnik'))) {
    // Heavy forged iron cuirass (plátový kyrys)
    Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.6);
    ctx.beginPath();
    ctx.moveTo(x - 10 * facingDir, y - 8);
    ctx.lineTo(x + 10 * facingDir, y - 8);
    ctx.lineTo(x + 12 * facingDir, y + 8);
    ctx.lineTo(x, y + 14);
    ctx.lineTo(x - 12 * facingDir, y + 8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Cuirass center ridge and rivets
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 13);
    ctx.stroke();
    ctx.fillStyle = '#E2E8F0';
    [
      [-7 * facingDir, -4], [7 * facingDir, -4],
      [-8 * facingDir, 4], [8 * facingDir, 4]
    ].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(x + rx, y + ry, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Steel kettle hat helmet with nose guard (šalíř s nánosníkem)
    Lada.setupPath(ctx, '#94A3B8', COLORS.ink, 2.5);
    ctx.beginPath();
    ctx.ellipse(x, y - radius * 0.72, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 10 * facingDir, y - radius * 0.72);
    ctx.quadraticCurveTo(x, y - radius * 1.15, x + 10 * facingDir, y - radius * 0.72);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Nose guard
    Lada.setupPath(ctx, '#64748B', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.rect(x + 2 * facingDir, y - radius * 0.72, 3, 9);
    ctx.fill(); ctx.stroke();

    // Spiked iron war club (okovaný cepín s hroty)
    ctx.save();
    ctx.translate(x + 18 * facingDir, y + 4);
    ctx.scale(facingDir, 1);
    ctx.rotate(0.2);
    // Shaft
    ctx.strokeStyle = '#3D2210';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-4, 20); ctx.lineTo(6, -26);
    ctx.stroke();
    // Iron spiked mace head
    Lada.setupPath(ctx, '#475569', COLORS.ink, 2);
    ctx.beginPath();
    ctx.ellipse(6, -24, 7, 8, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Spikes
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, -32); ctx.lineTo(6, -37);
    ctx.moveTo(13, -24); ctx.lineTo(18, -24);
    ctx.moveTo(-1, -24); ctx.lineTo(-6, -24);
    ctx.stroke();
    ctx.restore();
  }

  // 6. KALNÝ HASTRMAN (Muddy frayed tails dripping black silt, clam-shell hat, driftwood cattail cane)
  else if (enemyId === 'kalny_hastrman' || (palette === 'bog' && (enemyId === 'hastrman' || enemy?.method === 'drawHastrman'))) {
    // Dripping muddy slime strands falling from coat tails
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 22 * facingDir, y + 12);
    ctx.quadraticCurveTo(x - 28 * facingDir, y + 24, x - 26 * facingDir, y + 32);
    ctx.stroke();

    // Mud drops
    ctx.fillStyle = '#292524';
    for (let i = 0; i < 3; i++) {
      const dt = (time * 3 + i * 0.33) % 1;
      ctx.beginPath();
      ctx.arc(x - 26 * facingDir, y + 18 + dt * 14, 1.8 * (1 - dt * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // River clam shells & brass fishhooks on hat
    Lada.setupPath(ctx, '#E2E8F0', COLORS.ink, 1.4);
    ctx.beginPath();
    ctx.ellipse(x + 4 * facingDir, y - radius * 0.95, 3.5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x - 4 * facingDir, y - radius * 0.9, 2.8, 0.2, Math.PI * 1.4);
    ctx.stroke();

    // Gnarled driftwood walking stick topped with cattails
    ctx.save();
    ctx.translate(x + 16 * facingDir, y + 4);
    ctx.strokeStyle = '#5E3A21';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, 24); ctx.quadraticCurveTo(3 * facingDir, 0, 0, -28);
    ctx.stroke();
    Lada.setupPath(ctx, '#78350F', COLORS.ink, 1.5);
    ctx.beginPath();
    ctx.ellipse(0, -28, 3, 7, 0.1, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Tangled fishnet draped across chest
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 8 * facingDir, y - 8); ctx.lineTo(x + 8 * facingDir, y + 12);
    ctx.moveTo(x - 4 * facingDir, y - 10); ctx.lineTo(x + 12 * facingDir, y + 10);
    ctx.moveTo(x - 6 * facingDir, y + 8); ctx.lineTo(x + 6 * facingDir, y - 8);
    ctx.stroke();
  }

  // 7. ČERNÝ VLKODLAK (Torn peasant linen shirt rags, bristling wolf mane, razor claws & bared fangs)
  else if (enemyId === 'cerny_vlkodlak' || (palette === 'soot' && (enemyId === 'cerny_pes' || enemy?.method === 'drawCernyPes'))) {
    // Torn ragged peasant linen shirt rags clinging around neck & chest
    Lada.setupPath(ctx, '#E2D5BA', COLORS.ink, 2);
    ctx.beginPath();
    ctx.moveTo(x - 4 * facingDir, y - 8);
    ctx.lineTo(x + 8 * facingDir, y - 6);
    ctx.lineTo(x + 6 * facingDir, y + 4);
    ctx.lineTo(x + 2 * facingDir, y + 1);
    ctx.lineTo(x - 2 * facingDir, y + 6);
    ctx.lineTo(x - 6 * facingDir, y - 2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Thick bristling werewolf shoulder mane standing on end
    Lada.setupPath(ctx, '#27272A', COLORS.ink, 1.8);
    ctx.beginPath();
    ctx.moveTo(x - 12 * facingDir, y - 10);
    ctx.lineTo(x - 18 * facingDir, y - 18);
    ctx.lineTo(x - 8 * facingDir, y - 14);
    ctx.lineTo(x - 12 * facingDir, y - 24);
    ctx.lineTo(x - 2 * facingDir, y - 14);
    ctx.lineTo(x - 4 * facingDir, y - 22);
    ctx.lineTo(x + 4 * facingDir, y - 12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Bared menacing long werewolf fangs dripping foam
    Lada.setupPath(ctx, '#FEF08A', COLORS.ink, 1.4);
    ctx.beginPath();
    ctx.moveTo(x + 16 * facingDir, y - 6);
    ctx.lineTo(x + 21 * facingDir, y + 2);
    ctx.lineTo(x + 18 * facingDir, y - 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Predatory amber wolf eyes
    ctx.fillStyle = 'rgba(245, 158, 11, 0.40)';
    ctx.beginPath();
    ctx.arc(x + 14 * facingDir, y - 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x + 14 * facingDir, y - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(x + 14.5 * facingDir, y - 8, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fallback for any other palette
  else if (palette) {
    if (palette === 'crimson') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x + 3 * facingDir, y - radius * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (palette === 'soot') {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(x + 4 * facingDir, y - radius * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (palette === 'steel') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x, y - radius * 0.2, radius * 0.45, -0.4, 0.4);
      ctx.stroke();
    } else if (palette === 'bog') {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(x - 5 * facingDir, y + radius * 0.4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawEnemyRenderer(
  method: string,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked: boolean,
  enemy?: any,
  extraArgs: any[] = []
) {
  const drawer = (Lada as any)[method];
  if (typeof drawer !== 'function') return;

  const radius = enemy?.radius || 24;
  const cadence: EnemyAttackCadence = enemy?.attackCadence || enemy?.cadence || 'normal';
  const isAttacking =
    !!enemy?.isAttacking ||
    !!enemy?.isWindup ||
    enemy?.aiState === 'windup' ||
    ((enemy?.windupTimer || 0) > 0 && (enemy?.strikeTimer || 0) <= 0);
  const windupTimer = enemy?.windupTimer || 0;
  const recoveryTimer =
    typeof enemy?.recoveryTimer === 'number'
      ? enemy.recoveryTimer
      : typeof enemy?.strikeTimer === 'number'
      ? enemy.strikeTimer
      : 0;
  const recoveryDuration =
    typeof enemy?.recoveryDuration === 'number'
      ? enemy.recoveryDuration
      : typeof enemy?.strikeMaxTimer === 'number'
      ? enemy.strikeMaxTimer
      : CADENCE_RECOVERY_DURATIONS[cadence] ?? 0.2;
  const attackDelay =
    typeof enemy?.attackDelay === 'number'
      ? enemy.attackDelay
      : CADENCE_ATTACK_DELAYS[cadence] ?? 1.2;

  const facingDir =
    (isAttacking || recoveryTimer > 0) && typeof enemy?.attackAngle === 'number'
      ? (Math.cos(enemy.attackAngle) < 0 ? -1 : 1)
      : (vx < 0 ? -1 : 1);
  const effectiveVx = (isAttacking || recoveryTimer > 0) ? (facingDir < 0 ? -1 : 1) : vx;

  const attackAngle =
    typeof enemy?.attackAngle === 'number'
      ? enemy.attackAngle
      : facingDir < 0
      ? Math.PI
      : 0;

  const k = computeEnemyKinematics({
    cadence,
    isAttacking,
    windupTimer,
    recoveryTimer,
    attackDelay,
    recoveryDuration,
    attackAngle,
    facingDir,
    time,
  });

  // 1. Underlay Ground VFX (under feet)
  if (k.phase > 0) {
    drawGroundVfx(ctx, x, y, k, radius);
  }

  // 2. Kinematically Transformed Character Body
  let staggerAngle = 0;
  let staggerY = 0;
  if (enemy?.prefix === 'vycerpany' && !enemy?.dead && !enemy?.isDefeated) {
    // Potácení: unavené vrávorání ze strany na stranu a pokles v kolenou
    staggerAngle = Math.sin(time * 3.2) * 0.16;
    staggerY = Math.abs(Math.sin(time * 3.2)) * 3.5;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.translate(k.lungeX + k.shakeX, k.lungeY + k.shakeY + staggerY);
  ctx.rotate(k.leanAngle + staggerAngle);
  ctx.scale(k.scaleX, k.scaleY);
  ctx.translate(-x, -y);

  const palette = enemy?.palette;
  if (palette) {
    if (palette === 'crimson') ctx.filter = 'sepia(0.85) saturate(4.5) hue-rotate(320deg) brightness(0.92)';
    else if (palette === 'soot') ctx.filter = 'brightness(0.48) contrast(1.4) drop-shadow(0 0 2px #EA580C)';
    else if (palette === 'bog') ctx.filter = 'sepia(0.8) hue-rotate(65deg) saturate(2.4) brightness(0.85)';
    else if (palette === 'steel') ctx.filter = 'grayscale(0.85) contrast(1.3) brightness(1.1)';
  }

  const attackInfo = enemy && (enemy.isActive !== undefined || enemy.isWindup !== undefined)
    ? enemy
    : getEnemyAttackAnimationState(enemy || {}, time);

  const methodToMobId: Record<string, string> = {
    drawRarach: 'rarach',
    drawMysak: 'mysak',
    drawBludicka: 'bludicka',
    drawHejkal: 'hejkal',
    drawDivozenka: 'divozenka',
    drawCertik: 'certik',
    drawSkeleton: 'skeleton',
    drawStageCrow: 'vrana',
    drawVrana: 'vrana',
    drawZmrzlik: 'zmrzlik',
    drawMeltingSnowman: 'tajici_snehulak',
    drawVodnicek: 'vodnicek',
    drawSkodnik: 'skodnik',
    drawTopivec: 'topivec',
  };

  const bakedMobId = methodToMobId[method];
  const canUseAtlas = bakedMobId && !isAttacking && !(recoveryTimer > 0) && (!extraArgs || extraArgs.length === 0);
  let drawnViaAtlas = false;
  if (canUseAtlas) {
    drawnViaAtlas = getGlobalBakedBubakAtlas().draw(ctx, bakedMobId, x, y, time, effectiveVx, panicked);
  }

  if (!drawnViaAtlas) {
    if (method === 'drawFrostling' && enemy?._auraDrawnInGroundPass) {
      drawer.call(Lada, ctx, x, y, time, effectiveVx, panicked, true);
    } else if (extraArgs && extraArgs.length > 0) {
      drawer.call(Lada, ctx, x, y, time, effectiveVx, panicked, ...extraArgs);
    } else {
      drawer.call(Lada, ctx, x, y, time, effectiveVx, panicked, attackInfo, enemy);
    }
  }

  ctx.restore();

  // Palette accent overlay details (Ladovske detaily spritu bez cheatovani)
  if (!enemy?.dead && !enemy?.isDefeated) {
    drawThematicEnemyDetails(ctx, x, y, enemy, facingDir, time, radius, panicked);
  }

  // 3. Overlay VFX (weapon silhouettes, star flares, slashing arcs)
  if (k.phase > 0) {
    drawOverlayVfx(ctx, x, y, k, radius, enemy, facingDir, time, attackAngle);
  }
}

export function drawEnemyWarningSign(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  cameraOffset: { x: number; y: number } = { x: 0, y: 0 }
) {
  if (!enemy.windupTimer || enemy.windupTimer <= 0 || !enemy.attackDelay) return;
  if ((enemy.strikeTimer || 0) > 0) return;

  const offX = cameraOffset ? cameraOffset.x : 0;
  const offY = cameraOffset ? cameraOffset.y : 0;
  const screenX = enemy.x - offX;
  const screenY = enemy.y - offY - enemy.radius - 14;

  const progress = Math.min(1, enemy.windupTimer / enemy.attackDelay);
  const scale = 1 + progress * 0.35 + (progress > 0.8 ? Math.sin(Date.now() * 0.03) * 0.15 : 0);

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.scale(scale, scale);

  // Podkladový kruh s ladovskou černou konturou
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = progress > 0.75 ? "#c82a1e" : "#f1a834"; // Změna barvy z oranžové na rudou
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#1a120b";
  ctx.stroke();

  // Inkoustový vykřičník
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", 0, 0.5);

  ctx.restore();
}

(Lada as any).drawEnemyWarningSign = drawEnemyWarningSign;

/**
 * Ladovské točící se hvězdičky omráčení nad hlavou bubáka
 */
export function drawStunStars(ctx: CanvasRenderingContext2D, enemy: any, time: number) {
  const headY = enemy.y - (enemy.radius || 20) - 14;
  const headX = enemy.x;
  const numStars = 3;
  ctx.save();
  for (let i = 0; i < numStars; i++) {
    const starAngle = time * 5 + (i * Math.PI * 2) / numStars;
    const sx = headX + Math.cos(starAngle) * 16;
    const sy = headY + Math.sin(starAngle) * 6;
    const rot = starAngle * 1.5;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);

    // 4-cípá ladovská komiksová hvězdička s černou konturou
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(1.8, -1.8);
    ctx.lineTo(6, 0);
    ctx.lineTo(1.8, 1.8);
    ctx.lineTo(0, 6);
    ctx.lineTo(-1.8, 1.8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-1.8, -1.8);
    ctx.closePath();
    ctx.fillStyle = i === 0 ? '#FBBF24' : i === 1 ? '#F59E0B' : '#FEF08A';
    ctx.strokeStyle = '#1C130E';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

/**
 * Plnohodnotná animovaná Válečnice obíhající ve velkém kruhu
 */
export function drawValecniceCompanion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  orbitAngle: number,
  index: number,
  uiTime: number,
  scale: number = 1.71,
  isStriking: boolean = false
) {
  // Tangenciální směr oběhu: po směru hodinových ručiček
  const dirX = -Math.sin(orbitAngle);
  const facing = dirX >= 0 ? 1 : -1;

  const runPhase = uiTime * 14 + index * 2.3;
  const bobY = Math.abs(Math.sin(runPhase)) * 3.5;
  const legSwing = Math.sin(runPhase) * 14;
  const skirtSway = Math.sin(runPhase) * 3;
  const ribbonFlutter = Math.sin(uiTime * 16 + index * 1.7) * 4;
  const swingPhase = uiTime * 9 + index * 2.1;
  const rollingPinSwing = Math.sin(swingPhase) * 0.35 + (isStriking ? 0.8 : 0);

  ctx.save();
  ctx.translate(x, y - bobY);
  ctx.scale(scale * facing, scale);
  // Lehký náklon vpřed při divokém sprintu
  ctx.rotate(0.08);

  // 1. Stín pod nohama
  ctx.fillStyle = 'rgba(28, 19, 14, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 24 + bobY, 19, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Zadní mávající šňůrky zástěry
  ctx.save();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.quadraticCurveTo(-18, 6 + ribbonFlutter, -25, 10 + ribbonFlutter * 1.2);
  ctx.moveTo(-9, 11);
  ctx.quadraticCurveTo(-16, 12 - ribbonFlutter, -23, 17 - ribbonFlutter);
  ctx.stroke();
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 3. Zadní vlající cípy červeného šátku
  ctx.save();
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.quadraticCurveTo(-18, -17 + ribbonFlutter, -23, -13 + ribbonFlutter);
  ctx.quadraticCurveTo(-17, -9, -7, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-7, -9);
  ctx.quadraticCurveTo(-16, -7 - ribbonFlutter, -21, -3 - ribbonFlutter);
  ctx.quadraticCurveTo(-14, -4, -6, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Běhající nohy v černých šněrovacích botkách
  // Levá noha (zadní)
  ctx.save();
  ctx.translate(-4, 15);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2, 7);
  ctx.stroke();
  ctx.strokeStyle = '#F3E8D2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2, 7);
  ctx.stroke();
  // Bota
  ctx.fillStyle = '#2B1A12';
  ctx.strokeStyle = '#1C130E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 7);
  ctx.lineTo(-8, 12);
  ctx.lineTo(-3, 14);
  ctx.lineTo(2, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Pravá noha (přední)
  ctx.save();
  ctx.translate(5, 15);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(2, 7);
  ctx.stroke();
  ctx.strokeStyle = '#F3E8D2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(2, 7);
  ctx.stroke();
  // Bota
  ctx.fillStyle = '#2B1A12';
  ctx.strokeStyle = '#1C130E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1, 7);
  ctx.lineTo(8, 11);
  ctx.lineTo(4, 14);
  ctx.lineTo(-2, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Tradiční červená lidová sukně se stylizovanou výšivkou
  ctx.save();
  ctx.fillStyle = '#B91C1C';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, 4);
  ctx.quadraticCurveTo(-18 + skirtSway, 14, -16 + skirtSway, 21);
  ctx.quadraticCurveTo(0, 24, 17 + skirtSway, 20);
  ctx.quadraticCurveTo(17 + skirtSway, 13, 11, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lidová výšivka na spodním lemu sukně
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(-14 + skirtSway, 18);
  ctx.quadraticCurveTo(0, 21, 15 + skirtSway, 17);
  ctx.stroke();
  ctx.setLineDash([]);

  // Zelené ornamentální lístky
  ctx.fillStyle = '#16A34A';
  for (let li = -10; li <= 10; li += 5) {
    ctx.beginPath();
    ctx.arc(li + skirtSway * 0.7, 19, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Bílá lněná zástěra s vyšitou kapsičkou
  ctx.save();
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-7, 4);
  ctx.quadraticCurveTo(-10 + skirtSway * 0.5, 14, -8 + skirtSway * 0.5, 20);
  ctx.quadraticCurveTo(2, 22, 11 + skirtSway * 0.5, 18);
  ctx.quadraticCurveTo(10, 11, 7, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kapsička na zástěře s modrým lemem a červenou kytičkou
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(1, 9, 6, 7);
  ctx.fill();
  ctx.stroke();
  // Červená kytička v kapsičce
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(4, 12, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 7. Zelená šněrovačka / kordulka a nabírané bílé rukávy
  // Zadní/levá ruka zatatá v pěst
  ctx.save();
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-8, -1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Ruka
  ctx.fillStyle = '#FED7AA';
  ctx.beginPath();
  ctx.arc(-11, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Zelený živůtek / kordulka
  ctx.save();
  ctx.fillStyle = '#1B5E20';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.lineTo(-6, 5);
  ctx.lineTo(6, 5);
  ctx.lineTo(8, -4);
  ctx.quadraticCurveTo(0, -2, -8, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Zlaté knoflíčky živůtku
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(0, -1, 0.9, 0, Math.PI * 2);
  ctx.arc(0, 2, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Červená mašlička u krku
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.lineTo(2, -4);
  ctx.lineTo(0, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 8. Hlava v červeném puntíkovaném šátku s bojovým výrazem
  ctx.save();
  // Obličej
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(1, -12, 8, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Červené tváře (rosy cheeks)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
  ctx.beginPath();
  ctx.arc(-3.5, -10.5, 2.2, 0, Math.PI * 2);
  ctx.arc(5.5, -10.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Červený šátek na hlavě
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(1, -15, 8.5, Math.PI * 0.8, Math.PI * 2.2);
  ctx.quadraticCurveTo(9, -7, 2, -5);
  ctx.quadraticCurveTo(-5, -6, -8, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bílé puntíky na šátku
  ctx.fillStyle = '#FFFDF7';
  const dots = [[-2, -18], [3, -19], [6, -15], [0, -15], [-4, -13], [5, -11]];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kudrlinky vykukující ze šátku
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-4, -12, 1.5, 0, Math.PI);
  ctx.stroke();

  // Nos
  ctx.fillStyle = '#FB7185';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(1, -11.5, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Zuřivé obočí
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -14.5);
  ctx.lineTo(-0.5, -13);
  ctx.moveTo(6, -14.5);
  ctx.lineTo(2.5, -13);
  ctx.stroke();

  // Odhodlané oči
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(-2, -12.5, 1.1, 0, Math.PI * 2);
  ctx.arc(4, -12.5, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Křičící pusa s viditelnými zuby
  ctx.fillStyle = '#7F1D1D';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(1, -8, 2.5, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-0.5, -8.3, 3, 1.1);
  ctx.restore();

  // 9. Pravá ruka s mohutným kuchyňským dřevěným válečkem
  ctx.save();
  ctx.translate(6, -3);
  // Animovaný nápřah a švih válečkem
  ctx.rotate(-0.35 + rollingPinSwing);

  // Nabíraný bílý rukáv
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Předloktí a pěst držící rukojeť
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(4, -7);
  ctx.stroke();
  ctx.strokeStyle = '#FED7AA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(4, -7);
  ctx.stroke();

  // Pěst
  ctx.fillStyle = '#FED7AA';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(4, -7, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mohutný dřevěný váleček na těsto
  ctx.translate(4, -7);
  ctx.rotate(-0.4);

  // Vzdušný vír / šmouha při švihu válečkem
  if (Math.abs(rollingPinSwing) > 0.2 || isStriking) {
    ctx.save();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -12, 14, -Math.PI * 0.4, Math.PI * 0.35);
    ctx.stroke();
    ctx.restore();
  }

  // Spodní rukojeť
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, 7);
  ctx.stroke();
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, 7);
  ctx.stroke();

  // Hlavní válec válečku (bukové dřevo s ladovskou linkou)
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-4, -18, 8, 20);
  ctx.fill();
  ctx.stroke();

  // Dřevěná kresba / odlesk na válečku
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1.5, -15);
  ctx.lineTo(-1.5, 0);
  ctx.stroke();

  // Horní rukojeť
  ctx.strokeStyle = '#26150C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, -23);
  ctx.stroke();
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, -23);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

export function drawPrefixAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  prefix: string,
  time: number
): void {
  ctx.save();
  const auraR = radius * 1.35;

  if (prefix === 'vichricovy') {
    // Vichřicový: Světle azurovo-bílá rotující spirála větru s vzdušnými víry
    const pulse = Math.sin(time * 5.0) * 3;
    const effR = auraR + pulse;

    // Ground wind swirl ellipse
    const grad = ctx.createRadialGradient(x, y + radius * 0.4, radius * 0.2, x, y + radius * 0.4, effR);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    grad.addColorStop(0.7, 'rgba(186, 230, 253, 0.12)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.5, effR, effR * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3 spinning wind gusts / swirls around the mob
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const startAng = time * 4.2 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(x, y, effR * 0.85, startAng, startAng + 0.95);
      ctx.stroke();
    }

    // Outer breezy dash ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.50)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.5, effR * 1.1, effR * 0.48, time * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

  } else if (prefix === 'hromovy') {
    // Hromový: Zlato-modré elektrické bleskové záblesky a pulzující hromový kruh
    const pulse = Math.sin(time * 8.0) * 4;
    const effR = auraR + pulse;

    const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, effR);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
    grad.addColorStop(0.7, 'rgba(96, 165, 250, 0.14)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, effR, 0, Math.PI * 2);
    ctx.fill();

    // Crackling jagged lightning sparks around perimeter
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    const numSparks = 4;
    for (let i = 0; i < numSparks; i++) {
      const ang = (time * 6.0) + (i * Math.PI * 2) / numSparks;
      const r1 = effR * 0.7;
      const r2 = effR * 1.15;
      const midAng = ang + 0.25;
      const sx = x + Math.cos(ang) * r1;
      const sy = y + Math.sin(ang) * r1;
      const mx = x + Math.cos(midAng) * (r1 + (r2 - r1) * 0.5 + Math.sin(time * 15 + i) * 6);
      const my = y + Math.sin(midAng) * (r1 + (r2 - r1) * 0.5);
      const ex = x + Math.cos(ang + 0.5) * r2;
      const ey = y + Math.sin(ang + 0.5) * r2;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(mx, my);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Concentric electric ring
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, effR * 0.9, 0, Math.PI * 2);
    ctx.stroke();

  } else if (prefix === 'kamenny') {
    // Kamenný: Zemitá šedo-hnědá puklinová aura s kamennými úlomky
    const effR = auraR + Math.sin(time * 2.5) * 2;

    const grad = ctx.createRadialGradient(x, y + radius * 0.5, radius * 0.2, x, y + radius * 0.5, effR);
    grad.addColorStop(0, 'rgba(120, 53, 15, 0.25)');
    grad.addColorStop(0.7, 'rgba(168, 162, 158, 0.15)');
    grad.addColorStop(1, 'rgba(120, 53, 15, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.5, effR, effR * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone crust fissure lines
    ctx.strokeStyle = '#44403C';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const ang = (i * Math.PI * 2) / 5 + 0.2;
      const fx = x + Math.cos(ang) * (radius * 0.5);
      const fy = y + radius * 0.5 + Math.sin(ang) * (radius * 0.22);
      const tx = x + Math.cos(ang) * (effR * 0.95);
      const ty = y + radius * 0.5 + Math.sin(ang) * (effR * 0.40);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    // 4 floating stone shards rotating slowly
    for (let i = 0; i < 4; i++) {
      const sAng = time * 0.9 + (i * Math.PI * 2) / 4;
      const sx = x + Math.cos(sAng) * (effR * 0.85);
      const sy = y + radius * 0.5 + Math.sin(sAng) * (effR * 0.38);
      ctx.fillStyle = '#78716C';
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(sx - 3, sy - 3, 6, 6);
      ctx.fill();
      ctx.stroke();
    }

  } else if (prefix === 'pekelny') {
    // Pekelný: Sálavá rudozlatá plamenná aura s malými stoupajícími plamínky a uhlíky
    const pulse = Math.sin(time * 6.5) * 3.5;
    const effR = auraR + pulse;

    const grad = ctx.createRadialGradient(x, y + radius * 0.3, radius * 0.2, x, y + radius * 0.3, effR);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.26)');
    grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.16)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.2, effR, 0, Math.PI * 2);
    ctx.fill();

    // Dancing fire tongues / flames on ground
    for (let i = 0; i < 5; i++) {
      const fAng = time * 2.2 + (i * Math.PI * 2) / 5;
      const fx = x + Math.cos(fAng) * (effR * 0.65);
      const fy = y + radius * 0.4 + Math.sin(fAng) * (effR * 0.25);
      const fHeight = 8 + Math.sin(time * 12 + i) * 4;

      ctx.fillStyle = i % 2 === 0 ? '#F97316' : '#EF4444';
      ctx.beginPath();
      ctx.moveTo(fx - 4, fy);
      ctx.quadraticCurveTo(fx, fy - fHeight, fx + 4, fy);
      ctx.closePath();
      ctx.fill();
    }

    // Outer flame ember ring
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.55)';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(x, y, effR * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (prefix === 'vycerpany') {
    // Vyčerpaný: Tlumená šedo-prachová unavená aura s potácivým oválem a vznášejícími se ospalými částicemi
    const pulse = Math.sin(time * 2.8) * 3;
    const effR = auraR + pulse;

    const grad = ctx.createRadialGradient(x + Math.sin(time * 3.2) * 4, y + radius * 0.45, radius * 0.1, x, y + radius * 0.45, effR);
    grad.addColorStop(0, 'rgba(120, 113, 108, 0.24)');
    grad.addColorStop(0.65, 'rgba(168, 162, 158, 0.12)');
    grad.addColorStop(1, 'rgba(120, 113, 108, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(time * 3.2) * 4, y + radius * 0.45, effR * 0.95, effR * 0.38, Math.sin(time * 3.2) * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Lazy drowsy dashed ring
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(x, y + radius * 0.45, effR * 0.88, effR * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Drowsy floating 'z' particles drifting upward
    ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
    ctx.font = 'bold 11px serif';
    for (let i = 0; i < 2; i++) {
      const zOffset = (time * 1.2 + i * 1.5) % 3.0;
      const zAlpha = Math.max(0, 1 - zOffset / 3.0);
      const zX = x + Math.sin(time * 2.0 + i) * 12 + 10;
      const zY = y - radius * 0.6 - zOffset * 14;
      ctx.save();
      ctx.globalAlpha = zAlpha;
      if (typeof ctx.fillText === 'function') {
        ctx.fillText('z', zX, zY);
      }
      ctx.restore();
    }
  }

  ctx.restore();
}

export function drawGander(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 16,
  angle = 0,
  time = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const scale = radius / 16;
  ctx.scale(scale, scale);

  const wingFlap = Math.sin(time * 24) * 0.45;
  const neckStretch = Math.sin(time * 18) * 2;

  // Shadow under gander
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Trailing webbed orange feet
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 1.8;
  const legCycle = Math.sin(time * 22) * 5;
  // Left foot
  ctx.beginPath();
  ctx.ellipse(-14, 4 + legCycle, 5, 2.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(-14, -4 - legCycle, 5, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Plump white goose body
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Little pointed tail feathers
  ctx.beginPath();
  ctx.moveTo(-15, -2);
  ctx.lineTo(-21, -6);
  ctx.lineTo(-17, 1);
  ctx.lineTo(-20, 4);
  ctx.lineTo(-14, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom wing (back)
  ctx.save();
  ctx.translate(-2, 4);
  ctx.rotate(-wingFlap);
  ctx.beginPath();
  ctx.ellipse(0, 6, 10, 4.5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Long outstretched neck leaning forward
  ctx.beginPath();
  ctx.moveTo(8, -4);
  ctx.quadraticCurveTo(14 + neckStretch, -3, 20 + neckStretch, -1);
  ctx.quadraticCurveTo(22 + neckStretch, 0, 20 + neckStretch, 2);
  ctx.quadraticCurveTo(14 + neckStretch, 4, 8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Aggressive goose head
  const headX = 20 + neckStretch;
  ctx.beginPath();
  ctx.ellipse(headX, 0, 6, 4.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Open angry orange beak (hissing!)
  ctx.fillStyle = '#F97316';
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 1.6;
  // Upper beak
  ctx.beginPath();
  ctx.moveTo(headX + 4, -2.5);
  ctx.lineTo(headX + 13, -1);
  ctx.lineTo(headX + 4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Lower beak (open gap for hiss)
  ctx.beginPath();
  ctx.moveTo(headX + 4, 0.8);
  ctx.lineTo(headX + 11, 3);
  ctx.lineTo(headX + 4, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Tongue/pink inside hiss
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(headX + 6, 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Angry beady black eye with white rim
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(headX, -2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(headX + 0.6, -2, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Fierce angled eyebrow
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(headX - 2.5, -4.5);
  ctx.lineTo(headX + 2.5, -3.2);
  ctx.stroke();

  // Top wing (front, flapping furiously)
  ctx.save();
  ctx.translate(-1, -3);
  ctx.rotate(wingFlap);
  ctx.fillStyle = '#FAFAFA';
  ctx.strokeStyle = '#29180E';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -6, 11, 5, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Feather lines
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-4, -5); ctx.lineTo(-8, -8);
  ctx.moveTo(0, -6); ctx.lineTo(-2, -10);
  ctx.moveTo(4, -6); ctx.lineTo(3, -9);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function drawPlumPuddle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius = 28,
  time = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(time * 3 + x * 0.1) * 1.5;
  const rx = radius + pulse;
  const ry = (radius * 0.58) + (pulse * 0.5);

  // Outer gooey dark plum edge
  ctx.fillStyle = 'rgba(76, 29, 149, 0.72)';
  ctx.strokeStyle = '#2E1065';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rich thick indigo-purple jam center
  ctx.fillStyle = 'rgba(109, 40, 217, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 1, rx * 0.75, ry * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glossy reflection arc
  ctx.strokeStyle = 'rgba(233, 213, 255, 0.75)';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-rx * 0.25, -ry * 0.3, rx * 0.35, -Math.PI * 0.8, -Math.PI * 0.15);
  ctx.stroke();

  // Small glossy drop on side
  ctx.fillStyle = 'rgba(147, 51, 234, 0.9)';
  ctx.strokeStyle = '#2E1065';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(rx * 0.65, ry * 0.35, 4, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(rx * 0.65 - 1, ry * 0.35 - 1, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

(Lada as any).drawPrefixAura = drawPrefixAura;
(Lada as any).drawGander = drawGander;
(Lada as any).drawPlumPuddle = drawPlumPuddle;
(Lada as any).drawGingerbreadHeart = drawGingerbreadHeartCanvas;

export {
  Lada,
  drawEnemyRenderer,
  computeEnemyKinematics,
  drawGingerbreadHeartCanvas,
  type EnemyAttackInfo,
};
