import React from 'react';
import { COLORS } from '../constants';

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
	drawWatchman(ctx, x, y, time, dx, dy, fleeing = false, scale = 1) {
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
			ctx.translate(0, -20);
		}
		this.drawLimb(ctx, -5, 10, -legSwing - 2, 30, "#1E252B", 9);
		this.drawLimb(ctx, 5, 10, legSwing + 2, 30, "#1E252B", 9);
		ctx.translate(0, -bob);
		this.setupPath(ctx, "#263445", COLORS.ink, 3.5);
		ctx.beginPath();
		ctx.moveTo(-18, -4);
		ctx.quadraticCurveTo(-26, 16, -20, 26);
		ctx.lineTo(20, 26);
		ctx.quadraticCurveTo(26, 16, 18, -4);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = COLORS.woodDark;
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(14 + legSwing * .3, 24);
		ctx.lineTo(20 + legSwing * .3, -38);
		ctx.stroke();
		this.setupPath(ctx, "#CBD5E1", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(20 + legSwing * .3, -38);
		ctx.lineTo(20 + legSwing * .3, -50);
		ctx.lineTo(26 + legSwing * .3, -44);
		ctx.lineTo(32 + legSwing * .3, -44);
		ctx.lineTo(22 + legSwing * .3, -34);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		const lanternX = -20 - legSwing * .4;
		ctx.strokeStyle = COLORS.ink;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-16 - legSwing * .4, 4);
		ctx.lineTo(lanternX, 0);
		ctx.stroke();
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 2);
		ctx.fillRect(lanternX - 6, 0, 12, 4);
		ctx.strokeRect(lanternX - 6, 0, 12, 4);
		ctx.fillStyle = COLORS.mustard;
		ctx.fillRect(lanternX - 6, 4, 12, 14);
		ctx.strokeRect(lanternX - 6, 4, 12, 14);
		ctx.fillStyle = COLORS.red;
		ctx.beginPath();
		ctx.arc(lanternX, 11, 2.5 + Math.sin(time * 10) * .8, 0, Math.PI * 2);
		ctx.fill();
		ctx.translate(0, headBob);
		this.setupPath(ctx, COLORS.skin);
		ctx.beginPath();
		ctx.arc(0, -20, 13, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.white, COLORS.ink, 2);
		ctx.beginPath();
		ctx.arc(0, -18, 12, .2, Math.PI - .2);
		ctx.quadraticCurveTo(0, -4, 8, -12);
		ctx.quadraticCurveTo(-4, 0, 0, -4);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.woodDark, COLORS.ink, 3);
		ctx.beginPath();
		ctx.arc(0, -26, 14, Math.PI, 0);
		ctx.fill();
		ctx.stroke();
		this.setupPath(ctx, COLORS.bone, COLORS.ink, 2);
		ctx.beginPath();
		ctx.ellipse(0, -26, 16, 6, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
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
		gg.addColorStop(0, `rgba(255, 250, 215, ${.55 * fade})`);
		gg.addColorStop(.7, `rgba(255, 236, 160, ${.22 * fade})`);
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
			pg.addColorStop(.25, "rgba(255, 244, 190, 0.55)");
			pg.addColorStop(.5, "rgba(255, 255, 240, 0.95)");
			pg.addColorStop(.75, "rgba(255, 244, 190, 0.55)");
			pg.addColorStop(1, "rgba(255, 240, 170, 0)");
			ctx.fillStyle = pg;
			ctx.fillRect(x - pw, topY, pw * 2, botY - topY);
			ctx.fillStyle = `rgba(255, 255, 255, ${.9 * shrink})`;
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
			ctx.fillStyle = "#FEF08A";
			ctx.strokeStyle = COLORS.ink;
			ctx.lineWidth = 2;
			ctx.font = "900 18px Eczar, serif";
			ctx.fillText("♫", nx, ny);
			ctx.strokeText("♫", nx, ny);
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
		bubble("KLOK-KLOK! ✨ OČISTNÝ DÝM!", 50, -65, ease((t - 1.4) / .3) * ease((3.3 - t) / .3), kx, 20);
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
		bgGlow.addColorStop(0, `rgba(167, 243, 208, ${.45 * fade})`);
		bgGlow.addColorStop(.7, `rgba(74, 222, 128, ${.2 * fade})`);
		bgGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
		ctx.fillStyle = bgGlow;
		ctx.beginPath();
		ctx.arc(sanctuary.x, sanctuary.y, curR, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = `rgba(34, 197, 94, ${.7 * fade})`;
		ctx.lineWidth = 4;
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
			const spAl = Math.max(0, 1 - spDist / R) * .55 * fade;
			ctx.save();
			ctx.globalAlpha = spAl;
			ctx.fillStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.75)" : "rgba(253, 224, 71, 0.7)";
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
			ctx.font = "900 36px Eczar, serif";
			ctx.textAlign = "center";
			ctx.lineJoin = "round";
			ctx.lineWidth = 7;
			ctx.strokeStyle = COLORS.ink;
			ctx.strokeText("OČISTNÉ KADIDLO! 🌿", 0, 0);
			ctx.fillStyle = "#86EFAC";
			ctx.fillText("OČISTNÉ KADIDLO! 🌿", 0, 0);
			ctx.restore();
		}
		ctx.restore();
	},
	drawRarach(ctx, x, y, time, vx, panicked) {
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
	drawBubak(ctx, x, y, time, vx, panicked) {
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
		ctx.fillStyle = panicked ? "#FDE047" : COLORS.mustard;
		ctx.shadowColor = ctx.fillStyle;
		ctx.shadowBlur = 10;
		const lookX = panicked ? -10 : vx < 0 ? -8 : 8;
		ctx.beginPath();
		ctx.ellipse(lookX - 6, -12, panicked ? 6 : 5, panicked ? 9 : 8, 0, 0, Math.PI * 2);
		ctx.ellipse(lookX + 6, -12, panicked ? 6 : 5, panicked ? 9 : 8, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = COLORS.ink;
		ctx.beginPath();
		ctx.arc(lookX - 7, -12, 2, 0, Math.PI * 2);
		ctx.arc(lookX + 5, -12, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
		ctx.restore();
	},
	drawHastrman(ctx, x, y, time, vx, panicked) {
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
		ctx.stroke();
		ctx.fillStyle = COLORS.water;
		ctx.shadowColor = COLORS.water;
		ctx.shadowBlur = 8;
		ctx.beginPath();
		ctx.arc(panicked ? -4 : 5, -14, panicked ? 3.5 : 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
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
		ctx.shadowColor = "rgba(76, 29, 149, 0.45)";
		ctx.shadowBlur = 14;
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
	drawCert(ctx, x, y, time, vx, panicked, isBoss = false) {
		const dir = vx < 0 ? -1 : 1;
		const scale = isBoss ? 2.3 : 1.25;
		const bounce = Math.sin(time * (panicked ? 22 : 9)) * (isBoss ? 5 : 3.5);
		const legSwing = Math.sin(time * (panicked ? 22 : 11)) * (isBoss ? 16 : 10);
		const tailWhip = Math.sin(time * (panicked ? 28 : 12)) * (panicked ? 24 : 18);
		ctx.save();
		ctx.translate(x, y + bounce);
		ctx.scale(dir * scale, scale);
		if (panicked) {
			ctx.rotate(.12);
			this.drawRunDust(ctx, -10, 30, time);
			this.drawPanicDrops(ctx, 4, -28, time);
		}
		if (isBoss) {
			ctx.save();
			ctx.shadowColor = "#DC2626";
			ctx.shadowBlur = 22;
			ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
			ctx.beginPath();
			ctx.ellipse(0, 24, 22, 7, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
		ctx.strokeStyle = "#18181B";
		ctx.lineWidth = isBoss ? 4.5 : 3.2;
		ctx.beginPath();
		const barbY = panicked ? -26 + Math.sin(time * 28) * 6 : -12 + tailWhip * .8;
		ctx.moveTo(-8, 4);
		ctx.quadraticCurveTo(-26, tailWhip, -32, barbY);
		ctx.stroke();
		this.setupPath(ctx, "#DC2626", COLORS.ink, 2);
		ctx.beginPath();
		const tipX = -32;
		const tipY = barbY;
		ctx.moveTo(tipX, tipY - 8);
		ctx.lineTo(-26, tipY + 4);
		ctx.lineTo(-39, tipY + 6);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		if (panicked) {
			const legPhase = time * 3.6;
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
		if (isBoss && !panicked) {
			ctx.save();
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
			ctx.restore();
		}
		ctx.restore();
	},
	drawHejkal(ctx, x, y, time, vx, panicked) {
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
		ctx.shadowColor = "#15803D";
		ctx.shadowBlur = 24;
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
	drawObr(ctx, x, y, time, vx, panicked) {
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
		ctx.shadowColor = "#D97706";
		ctx.shadowBlur = 20;
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
	drawPlivnik(ctx, x, y, time, vx, panicked) {
		this.drawRarach(ctx, x, y, time, vx, panicked);
	},
	drawSotek(ctx, x, y, time, vx, panicked) {
		this.drawRarach(ctx, x, y, time, vx, panicked);
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
	drawZmrzlik(ctx, x, y, time, vx, panicked) {
		this.drawRarach(ctx, x, y, time, vx, panicked);
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
	drawSkeletonScythe(ctx, x, y, time, vx, panicked) {
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
	drawHromotluk(ctx, x, y, time, vx, panicked) {
		this.drawBubak(ctx, x, y, time, vx, panicked);
	},
	drawStodolnik(ctx, x, y, time, vx, panicked) {
		this.drawBubak(ctx, x, y, time, vx, panicked);
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
	drawTopivec(ctx, x, y, time, vx, panicked) {
		this.drawHastrman(ctx, x, y, time, vx, panicked);
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
	drawMrazik(ctx, x, y, time, vx, panicked) {
		this.drawMeluzina(ctx, x, y, time, vx, panicked);
	},
	drawSeverak(ctx, x, y, time, vx, panicked) {
		this.drawMeluzina(ctx, x, y, time, vx, panicked);
	},
	drawVanicka(ctx, x, y, time, vx, panicked) {
		this.drawMeluzina(ctx, x, y, time, vx, panicked);
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
	drawBludicka(ctx, x, y, time, vx, panicked) {
		const bob = Math.sin(time * (panicked ? 14 : 6)) * (panicked ? 8 : 6);
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.shadowColor = panicked ? "#F97316" : COLORS.water;
		ctx.shadowBlur = panicked ? 22 : 15;
		ctx.fillStyle = panicked ? "rgba(239, 68, 68, 0.95)" : "rgba(217, 160, 54, 0.9)";
		ctx.beginPath();
		ctx.arc(0, 0, panicked ? 9 : 7, 0, Math.PI * 2);
		ctx.fill();
		if (panicked) for (let i = 0; i < 3; i++) {
			const pt = (time * 5 + i * .33) % 1;
			ctx.fillStyle = "#FDE047";
			ctx.beginPath();
			ctx.arc(-12 - pt * 20, Math.sin(time * 10 + i) * 6, 2 - pt, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.shadowBlur = 0;
		ctx.restore();
	},
	drawDrevorubec(ctx, x, y, time, vx, panicked) {
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
	drawCertik(ctx, x, y, time, vx, panicked) {
		this.drawCert(ctx, x, y, time, vx, panicked, false);
	},
	drawOhnivyMuz(ctx, x, y, time, vx, panicked) {
		this.drawRarach(ctx, x, y, time, vx, panicked);
	},
	drawDrab(ctx, x, y, time, vx, panicked) {
		this.drawCert(ctx, x, y, time, vx, panicked, false);
	},
	drawZbojnik(ctx, x, y, time, vx, panicked) {
		this.drawDrevorubec(ctx, x, y, time, vx, panicked);
	},
	drawJiskrivec(ctx, x, y, time, vx, panicked) {
		this.drawOhnivyMuz(ctx, x, y, time, vx, panicked);
	},
	drawOhnivyPes(ctx, x, y, time, vx, panicked) {
		this.drawCernyPes(ctx, x, y, time, vx, panicked);
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
			ctx.shadowColor = "#F97316";
			ctx.shadowBlur = 14;
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
			ctx.fillStyle = "#EF4444";
			ctx.shadowColor = "#EF4444";
			ctx.shadowBlur = 8;
			ctx.beginPath();
			ctx.arc(-5, -13, 3, 0, Math.PI * 2);
			ctx.arc(5, -13, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#FEF08A";
			ctx.beginPath();
			ctx.arc(-4.5, -13, 1.3, 0, Math.PI * 2);
			ctx.arc(5.5, -13, 1.3, 0, Math.PI * 2);
			ctx.fill();
			ctx.shadowBlur = 0;
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
		ctx.shadowColor = "#EF4444";
		ctx.shadowBlur = 12;
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
		this.drawBludicka(ctx, x, y, time, vx, panicked);
	},
	drawZbrojnos(ctx, x, y, time, vx, panicked) {
		this.drawSkeleton(ctx, x, y, time, vx, panicked);
	},
	drawBezhlavyRytir(ctx, x, y, time, vx, panicked) {
		this.drawCert(ctx, x, y, time, vx, panicked, true);
	},
	drawSnehulak(ctx, x, y, time, vx, panicked) {
		this.drawHromotluk(ctx, x, y, time, vx, panicked);
	},
	drawNocniMura(ctx, x, y, time, vx, panicked) {
		this.drawBubak(ctx, x, y, time, vx, panicked);
	},
	drawDrak(ctx, x, y, time, vx, panicked) {
		this.drawHejkal(ctx, x, y, time, vx, panicked);
	},
	drawCoin(ctx, x, y, time, value) {
		const bob = Math.sin(time * 6) * 4;
		this.drawShadow(ctx, x, y, 9);
		if (value >= 15) {
			this.setupPath(ctx, COLORS.mustard, COLORS.ink, 3);
			ctx.beginPath();
			ctx.arc(x, y + bob, 12, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 11px Eczar";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("T", x, y + bob);
		} else if (value >= 5) {
			this.setupPath(ctx, "#E2E8F0", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(x, y + bob, 10, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 10px Eczar";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("S", x, y + bob);
		} else {
			this.setupPath(ctx, "#D97706", COLORS.ink, 2.5);
			ctx.beginPath();
			ctx.arc(x, y + bob, 8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = COLORS.ink;
			ctx.font = "800 9px Arial";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("K", x, y + bob);
		}
	},
	drawPotion(ctx, x, y, time) {
		const bob = Math.sin(time * 5) * 4;
		this.drawShadow(ctx, x, y, 12);
		ctx.save();
		ctx.translate(x, y + bob);
		ctx.shadowColor = COLORS.green;
		ctx.shadowBlur = 10;
		this.setupPath(ctx, "#E8F5E9", COLORS.ink, 2.5);
		ctx.beginPath();
		ctx.moveTo(-5, -12);
		ctx.lineTo(-5, -6);
		ctx.quadraticCurveTo(-14, 0, -12, 14);
		ctx.lineTo(12, 14);
		ctx.quadraticCurveTo(14, 0, 5, -6);
		ctx.lineTo(5, -12);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = COLORS.leafGreen;
		ctx.beginPath();
		ctx.moveTo(-10, 12);
		ctx.lineTo(10, 12);
		ctx.quadraticCurveTo(11, 4, 0, 4);
		ctx.quadraticCurveTo(-11, 4, -10, 12);
		ctx.fill();
		this.setupPath(ctx, COLORS.woodLight, COLORS.ink, 2);
		ctx.fillRect(-4, -17, 8, 5);
		ctx.strokeRect(-4, -17, 8, 5);
		ctx.restore();
	},
	drawCzechBuchta(ctx, x, y, scale = 1, angle = 0) {
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
	drawBreadRoll(ctx, x, y, time) {
		const bob = Math.sin(time * 4) * 3;
		this.drawCzechBuchta(ctx, x, y + bob, 1, 0);
	},
	drawSoulJar(ctx, x, y, time) {
		ctx.save();
		ctx.translate(x, y);
		ctx.shadowColor = COLORS.water;
		ctx.shadowBlur = 12 + Math.sin(time * 4) * 6;
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
			ctx.shadowColor = COLORS.mustard;
			ctx.shadowBlur = glow * 40;
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
		const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
		grad.addColorStop(0, "rgba(254, 240, 138, 0.30)");
		grad.addColorStop(.45, "rgba(251, 191, 36, 0.16)");
		grad.addColorStop(.82, "rgba(217, 119, 6, 0.06)");
		grad.addColorStop(1, "rgba(217, 119, 6, 0)");
		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
		ctx.save();
		ctx.strokeStyle = "rgba(245, 158, 11, 0.38)";
		ctx.lineWidth = 1.6;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
		if (pulseTimer > 0) {
			const progress = 1 - pulseTimer / .4;
			const waveR = reach * (.3 + progress * .7);
			const alpha = Math.max(0, (1 - progress) * .75);
			ctx.save();
			ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
			ctx.lineWidth = 4 * (1 - progress * .5);
			ctx.beginPath();
			ctx.arc(x, y, waveR, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeStyle = `rgba(253, 224, 71, ${Math.max(0, (1 - progress) * .5)})`;
			ctx.lineWidth = 2.5;
			const bLen = reach * .8;
			ctx.beginPath();
			ctx.moveTo(x - bLen, y);
			ctx.lineTo(x + bLen, y);
			ctx.moveTo(x, y - bLen);
			ctx.lineTo(x, y + bLen);
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
	}
};
for (const key of Object.keys(Lada)) {
	const val = Lada[key];
	if (typeof val === "function") Lada[key] = val.bind(Lada);
}
function drawEnemyRenderer(method, ctx, x, y, time, vx, panicked) {
	const drawer = Lada[method];
	if (typeof drawer === "function") drawer.call(Lada, ctx, x, y, time, vx, panicked);
}

export { Lada, drawEnemyRenderer };
