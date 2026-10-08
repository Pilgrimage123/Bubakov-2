import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { OsikovyPrutIcon } from './OsikovyPrutIcon';
import { Lada, drawValecniceCompanion } from '../render/ladaRenderer';
import { GameIcon } from './GameIcon';
import { WEAPON_UNLOCKS } from '../data/weaponUnlocks';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var ValecnicePreview = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [isWhacking, setIsWhacking] = useState(false);
	const [, setWhackCount] = useState(0);

	const triggerWhack = useCallback(() => {
		setIsWhacking(true);
		setWhackCount((c) => c + 1);
		if (typeof (sound as any).valecWhack === 'function') {
			(sound as any).valecWhack();
		} else {
			sound.heavyHit();
		}
		setTimeout(() => setIsWhacking(false), 380);
	}, []);

	useEffect(() => {
		let animId: number;
		let startTime = performance.now();

		const loop = (now: number) => {
			const elapsed = (now - startTime) / 1000;
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					// Soft decorative background parchment circle
					ctx.save();
					ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
					ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
					ctx.lineWidth = 1.5;
					ctx.setLineDash([4, 4]);
					ctx.beginPath();
					ctx.arc(canvas.width / 2, canvas.height / 2 + 10, 52, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
					ctx.restore();

					// Draw Válečnice in center
					ctx.save();
					drawValecniceCompanion(
						ctx,
						canvas.width / 2,
						canvas.height / 2 + 6,
						elapsed * 2.4,
						0,
						elapsed,
						1.71,
						isWhacking
					);
					ctx.restore();
				}
			}
			animId = requestAnimationFrame(loop);
		};

		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, [isWhacking]);

	return (
		<div
			style={{
				background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
				border: '3px solid var(--ink)',
				borderRadius: '12px',
				padding: '14px 16px',
				margin: '12px 0',
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
				boxShadow: '3px 3px 0 var(--ink)',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
					<div
						style={{
							width: '100px',
							height: '92px',
							borderRadius: '12px',
							background: '#FFFFFF',
							border: '2.5px solid var(--ink)',
							overflow: 'hidden',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.1)',
							flexShrink: 0,
						}}
					>
						<canvas ref={canvasRef} width={130} height={120} style={{ width: '100%', height: '100%' }} />
					</div>
					<div>
						<div style={{ fontWeight: 900, color: '#92400E', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
							<span>👵 Rázná Válečnice s bukovým válečkem</span>
							<span style={{ fontSize: '0.78rem', background: '#DC2626', color: '#FFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--ink)' }}>+40 % sprite</span>
						</div>
						<div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#78350F', marginTop: '3px', lineHeight: 1.35 }}>
							Statná vesnická hospodyně obíhající ve velkém okruhu. V zóně o 15 % větší než orbit zpomaluje nepřátele o 25 % (odolnost dle Vůle), rozdává 1,2s omráčení a ignoruje 20 % odolností.
						</div>
					</div>
				</div>
				<div style={{ flexShrink: 0 }}>
					<button
						type="button"
						className="hud-btn"
						style={{
							padding: '8px 16px',
							fontSize: '0.92rem',
							fontWeight: 900,
							background: '#EA580C',
							borderColor: 'var(--ink)',
							color: '#FFFFFF',
							boxShadow: '2px 2px 0 var(--ink)',
							cursor: 'pointer',
						}}
						onClick={triggerWhack}
					>
						🪵 Bácnout válečkem!
					</button>
				</div>
			</div>

			{/* Podrobný výpis statistik Válečnice */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
					gap: '8px',
					background: 'rgba(255, 255, 255, 0.75)',
					border: '2px solid var(--ink)',
					borderRadius: '8px',
					padding: '10px 12px',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>💥 Poškození</span>
					<strong style={{ fontSize: '0.98rem', color: '#991B1B' }}>32 (fyzické)</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>⏱️ Kadence úderů</span>
					<strong style={{ fontSize: '0.98rem', color: '#1E293B' }}>0,75 s</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>💫 Omráčení (Stun)</span>
					<strong style={{ fontSize: '0.98rem', color: '#D97706' }}>1,2 s</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>🌪️ Zpomalení (Zóna +15 %)</span>
					<strong style={{ fontSize: '0.98rem', color: '#EA580C' }}>25 % (dle Vůle)</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>🛡️ Ignorace resistu</span>
					<strong style={{ fontSize: '0.98rem', color: '#15803D' }}>20 %</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>📏 Dosah zásahu</span>
					<strong style={{ fontSize: '0.98rem', color: '#0369A1' }}>58 px (+60 %)</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>🔨 Odhození</span>
					<strong style={{ fontSize: '0.98rem', color: '#B45309' }}>520 (důrazné)</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>⭕ Poloměr hlídky</span>
					<strong style={{ fontSize: '0.98rem', color: '#7C3AED' }}>115 px (kruh)</strong>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350F' }}>👵 Měřítko postavy</span>
					<strong style={{ fontSize: '0.98rem', color: '#DC2626' }}>+40 % (scale 1,71)</strong>
				</div>
			</div>
		</div>
	);
};

var CaneWhipPreview = ({ soaked = false }: { soaked?: boolean }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const slashRef = useRef<any>({
		reach: 82,
		arc: 1.45,
		angle: 0,
		life: 0,
		maxLife: 0.32,
		swingDir: 1,
		soaked
	});
	const [activeSoaked, setActiveSoaked] = useState(soaked);
	const [whipCount, setWhipCount] = useState(0);

	const triggerWhip = useCallback(() => {
		slashRef.current = {
			reach: 82,
			arc: 1.45,
			angle: 0,
			life: 0.32,
			maxLife: 0.32,
			swingDir: slashRef.current.swingDir === 1 ? -1 : 1,
			soaked: activeSoaked
		};
		setWhipCount((c) => c + 1);
		if (typeof (sound as any).caneWhip === 'function') {
			(sound as any).caneWhip(activeSoaked);
		} else {
			sound.slash();
		}
	}, [activeSoaked]);

	useEffect(() => {
		let animId: number;
		let lastT = performance.now();

		const loop = (now: number) => {
			const dt = Math.min(0.05, (now - lastT) / 1000);
			lastT = now;

			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					// Soft decorative background parchment circle
					ctx.save();
					ctx.fillStyle = 'rgba(239, 230, 213, 0.4)';
					ctx.strokeStyle = 'rgba(43, 24, 16, 0.2)';
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();
					ctx.restore();

					const s = slashRef.current;
					s.soaked = activeSoaked;
					if (s.life > 0) {
						s.life -= dt;
						ctx.save();
						ctx.translate(canvas.width / 2 - 25, canvas.height / 2);
						Lada.drawOsikovyPrutSlash(ctx, s);
						ctx.restore();
					} else {
						// Subtle idle display
						ctx.save();
						ctx.translate(canvas.width / 2 - 25, canvas.height / 2);
						const idleS = {
							reach: 82,
							arc: 1.45,
							angle: 0,
							life: 0.18,
							maxLife: 0.32,
							swingDir: 1,
							soaked: activeSoaked
						};
						ctx.globalAlpha = 0.88;
						Lada.drawOsikovyPrutSlash(ctx, idleS);
						ctx.restore();
					}
				}
			}
			animId = requestAnimationFrame(loop);
		};

		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, [activeSoaked]);

	return (
		<div style={{
			background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
			border: '3px solid var(--ink)',
			borderRadius: '12px',
			padding: '12px 16px',
			margin: '12px 0',
			display: 'flex',
			flexDirection: 'column',
			gap: '10px',
			boxShadow: '3px 3px 0 var(--ink)'
		}}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div style={{
						width: '74px',
						height: '74px',
						borderRadius: '10px',
						background: '#FFFFFF',
						border: '2px solid var(--ink)',
						overflow: 'hidden',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.1)'
					}}>
						<canvas ref={canvasRef} width={150} height={120} style={{ width: '100%', height: '100%' }} />
					</div>
					<div>
						<div style={{ fontWeight: 900, color: '#78350F', fontSize: '1.08rem' }}>
							Ohebný osikový prut s pupeny
						</div>
						<div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#92400E', marginTop: '2px', lineHeight: 1.35 }}>
							Pružný sečný švih s dynamickým prohnutím dřeva, vějířem větru, inkoustovými čárami a prásknutím špičky!
						</div>
					</div>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
					<button
						type="button"
						className="hud-btn"
						style={{
							padding: '8px 14px',
							fontSize: '0.88rem',
							fontWeight: 900,
							background: '#22C55E',
							borderColor: 'var(--ink)',
							color: '#FFFFFF',
							boxShadow: '2px 2px 0 var(--ink)',
							cursor: 'pointer'
						}}
						onClick={triggerWhip}
					>
						🎋 Švihnout prutem!
					</button>
					<button
						type="button"
						style={{
							padding: '4px 8px',
							fontSize: '0.78rem',
							fontWeight: 800,
							background: activeSoaked ? '#0284C7' : '#E2E8F0',
							color: activeSoaked ? '#FFFFFF' : '#1E293B',
							border: '1.5px solid var(--ink)',
							borderRadius: '6px',
							cursor: 'pointer'
						}}
						onClick={() => setActiveSoaked(!activeSoaked)}
					>
						{activeSoaked ? '💧 Mokrý prut (aktivní)' : '🪣 Namočit prut'}
					</button>
				</div>
			</div>
		</div>
	);
};

var WeaponUnlockModal = ({ progress, onClose }) => {
	if (!progress) return null;
	const def = WEAPON_UNLOCKS[progress.id];
	const milestonesList = [
		{
			pct: 25,
			tier: 1,
			title: "25 % – První stopa a tvar zbraně",
			desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledDesc || "",
			stats: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledStatsHint || "",
			reached: progress.percent >= 25
		},
		{
			pct: 50,
			tier: 2,
			title: "50 % – Skica a odhalení mechaniky útoku",
			desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledDesc || "",
			stats: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledStatsHint || "",
			reached: progress.percent >= 50
		},
		{
			pct: 75,
			tier: 3,
			title: "75 % – Téměř ukováno a přesná síla",
			desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledDesc || "",
			stats: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledStatsHint || "",
			reached: progress.percent >= 75
		},
		{
			pct: 100,
			tier: 4,
			title: "100 % – Plné odemčení do arzenálu",
			desc: `Zbraň ${def?.realName || ""} se trvale přidá k výběru vylepšení při postupu na novou úroveň!`,
			stats: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledStatsHint || "",
			reached: progress.isUnlocked || progress.percent >= 100
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 50 },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "660px",
				width: "95%",
				textAlign: "left",
				position: "relative"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "14px",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "68px",
								height: "68px",
								borderRadius: "50%",
								background: progress.isUnlocked ? "var(--mustard)" : progress.tier === 0 ? "#1A1510" : progress.tier === 1 ? "#3A2818" : progress.tier === 2 ? "#785A35" : "#D9A036",
								border: "3px solid var(--ink)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: progress.tier === 0 ? "2.2rem" : "2.4rem",
								boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.3), 3px 3px 0 var(--ink)",
								filter: progress.tier === 0 ? "grayscale(1) brightness(0.4)" : progress.tier === 1 ? "contrast(150%) brightness(0.6)" : "none"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameIcon, {
								icon: progress.tier === 0 ? "❓" : progress.realIcon,
								size: progress.id === "buns" ? 52 : "2.4rem"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `hunter-tier-stamp tier-stamp-${progress.tier}`,
								style: { fontSize: "0.8rem" },
								children: progress.clueTag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								style: {
									margin: "2px 0 1px 0",
									fontSize: "1.75rem",
									color: "#FEF3C7",
									textShadow: "2px 2px 0 var(--ink)"
								},
								children: progress.spoiledName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 900,
									color: "#FEF3C7",
									fontSize: "0.98rem"
								},
								children: progress.spoiledTitle
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 16 })
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "tab-btn",
						style: {
							padding: "6px 12px",
							fontSize: "1.2rem",
							minWidth: "auto"
						},
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "✕"
					})]
				}),
				progress.isQueued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#FFFBEB",
						border: "3px solid #D97706",
						borderRadius: "10px",
						padding: "12px 16px",
						margin: "12px 0",
						display: "flex",
						alignItems: "center",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { fontSize: "2rem" },
						children: "🔒"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 900,
								color: "#92400E",
								fontSize: "1.05rem"
							},
							children: "Výzva k ukování je zatím uzamčena!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "0.88rem",
								fontWeight: 700,
								color: "#78350F",
								marginTop: "2px"
							},
							children: [
								"Nová zbraň se nikdy nezačne odemykat, dokud není odemčena zbraň před ní. Kovář začne tuto zbraň kalit teprve po odemčení zbraně: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.requiredWeaponName }),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "0.8rem",
								fontWeight: 800,
								color: "#B45309",
								marginTop: "4px"
							},
							children: "🔨 Pořadí kovářské dílny: Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda"
						})
					] })]
				}),
				progress.id === "buns" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#FFFBEB",
						border: "3px solid #B45309",
						borderRadius: "10px",
						padding: "12px 16px",
						margin: "12px 0",
						display: "flex",
						alignItems: "center",
						gap: "16px",
						boxShadow: "3px 3px 0 var(--ink)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							flexShrink: 0,
							width: "96px",
							height: "72px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CzechBuchtaIcon, { size: 84 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontWeight: 900,
							color: "#78350F",
							fontSize: "1.08rem"
						},
						children: "Tradiční česká pečená buchta s povidly"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "0.88rem",
							fontWeight: 700,
							color: "#92400E",
							marginTop: "2px",
							lineHeight: 1.35
						},
						children: "Zlatavá kynutá buchta upečená v pekáči do křupava, poprášená jemným moučkovým cukrem a plněná lahodným švestkovým povidlem."
					})] })]
				}),
				progress.id === "cane" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaneWhipPreview, {}),
				progress.id === "valecnice" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ValecnicePreview, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "var(--parchmentDark)",
						border: "3px solid var(--ink)",
						borderRadius: "10px",
						padding: "12px 16px",
						margin: "14px 0"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: 0,
									fontSize: "1.2rem",
									color: "#111111"
								},
								children: def?.challengeTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									background: progress.isUnlocked ? "var(--leaf-green)" : progress.isQueued ? "var(--wood-dark)" : "#2A170A",
									color: "#FFFFFF",
									fontWeight: 900,
									fontSize: "0.82rem",
									padding: "3px 8px",
									borderRadius: "6px",
									border: "1.5px solid var(--ink)"
								},
								children: progress.isUnlocked ? "✅ ODEMČENO" : progress.isQueued ? `🔒 ČEKÁ NA: ${progress.requiredWeaponName?.toUpperCase()}` : `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "6px 0 10px 0",
								fontSize: "0.92rem",
								fontWeight: 700,
								lineHeight: 1.35,
								color: "#111111"
							},
							children: def?.challengeLongDesc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hunter-progress-bar-outer",
							style: { height: "16px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hunter-progress-bar-fill",
								style: {
									width: `${progress.percent}%`,
									background: progress.isUnlocked ? "linear-gradient(90deg, #10B981, #059669)" : void 0
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hunter-progress-ticks",
							style: {
								fontSize: "0.75rem",
								marginTop: "4px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `hunter-tick ${progress.percent >= 0 ? "reached" : ""}`,
									children: "0%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `hunter-tick ${progress.percent >= 25 ? "reached" : ""}`,
									children: [progress.percent >= 25 ? "✓" : "🔒", " 25%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `hunter-tick ${progress.percent >= 50 ? "reached" : ""}`,
									children: [progress.percent >= 50 ? "✓" : "🔒", " 50%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `hunter-tick ${progress.percent >= 75 ? "reached" : ""}`,
									children: [progress.percent >= 75 ? "✓" : "🔒", " 75%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `hunter-tick ${progress.percent >= 100 ? "reached" : ""}`,
									children: [progress.percent >= 100 ? "✓" : "🔒", " 100%"]
								})
							]
						}),
						progress.enemiesBreakdown.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginTop: "10px" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 900,
									color: "#111111",
									marginBottom: "4px"
								},
								children: "Zahnáni vybraní nepřátelé pro tuto zbraň:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hunter-enemy-pills",
								children: progress.enemiesBreakdown.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hunter-enemy-pill",
									style: { padding: "3px 7px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.icon }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [e.name, ":"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#111111" },
											children: e.count
										})
									]
								}, e.id))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					style: {
						margin: "12px 0 6px 0",
						fontSize: "1.1rem",
						color: "#FEF3C7"
					},
					children: "🕵️ Postupné odhalování zbraně (25 %, 50 % a 75 %):"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						maxHeight: "220px",
						overflowY: "auto"
					},
					children: milestonesList.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: m.reached ? "#FAF5E8" : "#EDE4D1",
							border: m.reached ? "2.5px solid var(--leaf-green)" : "2px solid #3D2210",
							borderRadius: "8px",
							padding: "8px 12px",
							color: "#111111"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "0.88rem",
										color: m.reached ? "#065F46" : "#2A170A"
									},
									children: [
										m.reached ? "✅" : "🔒",
										" ",
										m.title
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "0.75rem",
										fontWeight: 900,
										color: m.reached ? "#065F46" : "#78350F"
									},
									children: m.reached ? "ODHALENO" : `Vyžaduje ${m.pct} %`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "4px 0 2px 0",
									fontSize: "0.85rem",
									lineHeight: 1.3,
									color: "#111111",
									fontWeight: 600
								},
								children: m.reached ? m.desc : "Tato stopa a vlastnost se odhalí po dosažení tohoto milníku."
							}),
							m.reached && m.stats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 900,
									color: "#2A170A",
									marginTop: "2px"
								},
								children: ["⚡ ", m.stats]
							})
						]
					}, m.pct))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
						marginTop: "16px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: { padding: "8px 22px" },
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "Zavřít"
					})
				})
			]
		})
	});
};

export { WeaponUnlockModal };
