import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { ENEMIES } from '../data/enemies';
import { Lada } from '../render/ladaRenderer';
import { getEnemyProgress } from '../data/enemyUnlocks';
import { KrejcarIcon } from './KrejcarIcon';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var CATEGORIES = [
	{
		id: "all",
		label: "Všechna strašidla"
	},
	{
		id: "swarms",
		label: "🐭 Šotci a havěť"
	},
	{
		id: "undead",
		label: "💀 Hroboví umrlci"
	},
	{
		id: "shadows",
		label: "👤 Noční stíny"
	},
	{
		id: "water",
		label: "💧 Vodní cháska"
	},
	{
		id: "frost",
		label: "❄️ Větrné a zimní"
	},
	{
		id: "fields",
		label: "🌾 Polní a lesní"
	},
	{
		id: "demons",
		label: "🔥 Pekelníci"
	},
	{
		id: "bosses",
		label: "👑 Velcí bossové"
	}
];
var BestiaryModal = ({ isOpen, onClose, bestiaryKills }) => {
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)("all");
	const [selectedId, setSelectedId] = (0, import_react.useState)("rarach");
	const previewCanvasRef = (0, import_react.useRef)(null);
	const monsterList = Object.values(ENEMIES).filter((m) => selectedCategory === "all" || m.category === selectedCategory);
	const currentMonster = ENEMIES[selectedId] || monsterList[0] || ENEMIES.rarach;
	const currentKills = bestiaryKills[currentMonster.id] || 0;
	const enemyProg = getEnemyProgress(currentMonster.id, currentKills);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		let animId;
		const canvas = previewCanvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let startTime = performance.now();
		const render = (now) => {
			const elapsed = (now - startTime) / 1e3;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const m = currentMonster;
			const cx = canvas.width / 2;
			const cy = canvas.height * .65;
			const tier = enemyProg.tier;
			const palette = m.palette;
			if (palette && tier >= 2) {
				ctx.save();
				if (palette === "soot") ctx.filter = "brightness(0.52) contrast(1.4) drop-shadow(0 0 3px #EA580C)";
				else if (palette === "crimson") ctx.filter = "sepia(1) saturate(5) hue-rotate(320deg) brightness(0.9)";
				else if (palette === "bog") ctx.filter = "sepia(0.85) hue-rotate(65deg) saturate(2.5) brightness(0.85)";
				else if (palette === "steel") ctx.filter = "grayscale(0.85) contrast(1.35) brightness(1.15)";
			}
			if (m.id === "cert") Lada.drawCert(ctx, cx, cy + 5, elapsed, 0, false, true);
			else if (m.id === "hejkal") Lada.drawHejkal(ctx, cx, cy + 5, elapsed, 0, false);
			else if (m.id === "obr") Lada.drawObr(ctx, cx, cy + 10, elapsed, 0, false);
			else if (m.id === "meluzina") Lada.drawMeluzina(ctx, cx, cy - 15, elapsed, 0, false);
			else if (m.id === "polednice") Lada.drawPolednice(ctx, cx, cy - 5, elapsed, 0, false);
			else if (m.id === "klekanice") Lada.drawKlekanice(ctx, cx, cy - 5, elapsed, 0, false);
			else if (m.id === "drak") Lada.drawDrak(ctx, cx, cy + 12, elapsed, 0, false, false);
			else {
				const drawer = Lada[m.method];
				if (typeof drawer === "function") drawer.call(Lada, ctx, cx, cy, elapsed, 0, false);
				else Lada.drawRarach(ctx, cx, cy, elapsed, 0, false);
			}
			if (palette && tier >= 2) {
				ctx.restore();
				if (palette === "soot") {
					ctx.fillStyle = "#F59E0B";
					ctx.beginPath();
					ctx.arc(cx + 4, cy - 12, 2.5, 0, Math.PI * 2);
					ctx.fill();
				} else if (palette === "crimson") {
					ctx.fillStyle = "#DC2626";
					ctx.beginPath();
					ctx.arc(cx + 3, cy - 14, 2.5, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			if (tier === 4) {} else if (tier === 3) {
				ctx.save();
				ctx.fillStyle = "rgba(243, 233, 210, 0.22)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.strokeStyle = "#D9A036";
				ctx.lineWidth = 3;
				ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
				ctx.restore();
			} else if (tier === 2) {
				ctx.save();
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillStyle = "rgba(92, 72, 50, 0.76)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalCompositeOperation = "source-over";
				ctx.fillStyle = "rgba(235, 222, 198, 0.28)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
			} else if (tier === 1) {
				ctx.save();
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillStyle = "#241E18";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalCompositeOperation = "source-over";
				ctx.fillStyle = "rgba(25, 20, 15, 0.35)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
			} else {
				ctx.save();
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillStyle = "#111111";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalCompositeOperation = "source-over";
				const grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, 80);
				grad.addColorStop(0, "rgba(35, 28, 20, 0.7)");
				grad.addColorStop(1, "rgba(12, 10, 8, 0.96)");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = "#D9A036";
				ctx.font = "900 48px Eczar, serif";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText("?", cx, cy - 8);
				ctx.restore();
			}
			animId = requestAnimationFrame(render);
		};
		animId = requestAnimationFrame(render);
		return () => cancelAnimationFrame(animId);
	}, [
		isOpen,
		selectedId,
		currentMonster,
		enemyProg.tier
	]);
	if (!isOpen) return null;
	const totalMonsters = Object.keys(ENEMIES).length;
	const discoveredCount = Object.keys(ENEMIES).filter((id) => (bestiaryKills[id] || 0) > 0).length;
	const fullyMasteredCount = Object.keys(ENEMIES).filter((id) => {
		return getEnemyProgress(id, bestiaryKills[id] || 0).isUnlocked;
	}).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 30 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "960px",
				width: "95%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: { margin: "0 0 2px 0" },
						children: "📖 Bestiář noční české vesnice"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontWeight: 700,
							margin: "0 0 8px 0",
							fontSize: "0.94rem"
						},
						children: [
							"Encyklopedie ",
							totalMonsters,
							" lidových strašidel, bubáků a diblíků. Zkoumejte, jak je zklidnit poctivým výpraskem nebo usmířit voňavou buchtou."
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "tab-btn",
						style: {
							padding: "4px 10px",
							fontSize: "1.1rem",
							minWidth: "auto"
						},
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "var(--parchmentDark)",
						border: "2px solid var(--ink)",
						borderRadius: "8px",
						padding: "6px 14px",
						marginBottom: "10px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						fontSize: "0.88rem",
						fontWeight: 900,
						color: "#111111"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["🔍 Spatřeno strašidel: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
							discoveredCount,
							" / ",
							totalMonsters
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["🏆 Zcela probádáno (100 %): ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
							fullyMasteredCount,
							" / ",
							totalMonsters
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								color: "#2A170A",
								fontWeight: 900
							},
							children: "📜 Úrovně odhalení: 0 % ➔ 25 % ➔ 50 % ➔ 75 % ➔ 100 %"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "5px",
						flexWrap: "wrap",
						justifyContent: "center",
						marginBottom: "12px"
					},
					children: CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `btn-small lada-btn ${selectedCategory === cat.id ? "active" : ""}`,
						style: {
							margin: "2px",
							padding: "4px 9px",
							fontSize: "0.82rem",
							backgroundColor: selectedCategory === cat.id ? "var(--mustard)" : "var(--wood-dark)",
							color: selectedCategory === cat.id ? "var(--ink)" : "var(--parchment)"
						},
						onClick: () => {
							setSelectedCategory(cat.id);
							sound.coin();
						},
						children: cat.label
					}, cat.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bestiary-container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bestiary-list",
						children: monsterList.map((m) => {
							const k = bestiaryKills[m.id] || 0;
							const prog = getEnemyProgress(m.id, k);
							const isSelected = m.id === currentMonster.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `bestiary-item-btn ${isSelected ? "active" : ""}`,
								style: {
									background: isSelected ? "var(--mustard)" : prog.tier === 4 ? "#ECFDF5" : prog.tier === 0 ? "#F3F4F6" : void 0,
									color: "#111111"
								},
								onClick: () => {
									setSelectedId(m.id);
									sound.slash();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { fontSize: "1.1rem" },
										children: prog.icon
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontWeight: 800,
											fontSize: "0.94rem",
											color: "#111111"
										},
										children: prog.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										alignItems: "flex-end"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "0.78rem",
											fontWeight: 900,
											color: prog.tier === 4 ? "#065F46" : "#2A170A"
										},
										children: prog.tier === 4 ? "✅ 100 %" : prog.tier === 0 ? "🔒 0 %" : `${prog.percent} %`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "0.74rem",
											fontWeight: 700,
											color: "#111111"
										},
										children: [
											"💀 ",
											k,
											"×"
										]
									})]
								})]
							}, m.id);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bestiary-detail-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `hunter-tier-stamp tier-stamp-${enemyProg.tier}`,
										style: {
											fontSize: "0.8rem",
											marginBottom: "4px",
											display: "inline-block"
										},
										children: enemyProg.clueTag
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										style: {
											margin: "2px 0 2px 0",
											fontSize: "1.85rem",
											color: "#2A170A"
										},
										children: enemyProg.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontWeight: 900,
											fontSize: "1.02rem",
											color: "#78350F",
											marginBottom: "8px"
										},
										children: enemyProg.title
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										background: enemyProg.isUnlocked ? "var(--leaf-green)" : "var(--wood-dark)",
										color: "#FFFFFF",
										fontWeight: 900,
										fontSize: "0.85rem",
										padding: "3px 10px",
										borderRadius: "6px",
										border: "2px solid var(--ink)",
										textAlign: "right"
									},
									children: enemyProg.isUnlocked ? "✅ ZCELA PROBÁDÁNO" : `VÝZKUM: ${enemyProg.kills} / ${enemyProg.maxKills} (${enemyProg.percent} %)`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bestiary-canvas-wrap",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
									ref: previewCanvasRef,
									width: 180,
									height: 180,
									className: "bestiary-canvas"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hunter-progress-wrap",
								style: { margin: "10px 0 14px 0" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "hunter-progress-header",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Postup terénního výzkumu a zápisů v kronice:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											enemyProg.kills,
											" / ",
											enemyProg.maxKills,
											" zahnáno (",
											enemyProg.percent,
											" %)"
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hunter-progress-bar-outer",
										style: { height: "14px" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "hunter-progress-bar-fill",
											style: {
												width: `${enemyProg.percent}%`,
												background: enemyProg.isUnlocked ? "linear-gradient(90deg, #10B981, #059669)" : void 0
											}
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "hunter-progress-ticks",
										style: {
											fontSize: "0.75rem",
											marginTop: "3px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `hunter-tick ${enemyProg.percent >= 0 ? "reached" : ""}`,
												children: "0%"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `hunter-tick ${enemyProg.percent >= 25 ? "reached" : ""}`,
												children: [enemyProg.percent >= 25 ? "✓" : "🔒", " 25%"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `hunter-tick ${enemyProg.percent >= 50 ? "reached" : ""}`,
												children: [enemyProg.percent >= 50 ? "✓" : "🔒", " 50%"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `hunter-tick ${enemyProg.percent >= 75 ? "reached" : ""}`,
												children: [enemyProg.percent >= 75 ? "✓" : "🔒", " 75%"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `hunter-tick ${enemyProg.percent >= 100 ? "reached" : ""}`,
												children: [enemyProg.percent >= 100 ? "✓" : "🔒", " 100%"]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bestiary-tags",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge tag-weak",
										children: ["Nebezpečnost: ", enemyProg.spoiledStats.danger]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge tag-neutral",
										children: [
											"💀 Přemoženo: ",
											enemyProg.kills,
											"×"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge",
										style: {
											background: "#E2E8F0",
											color: "var(--ink)"
										},
										children: ["❤️ ", enemyProg.spoiledStats.hp]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge",
										style: {
											background: "#FEF3C7",
											color: "var(--ink)",
											display: "inline-flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KrejcarIcon, { size: 16 }),
											" ",
											enemyProg.spoiledStats.coinValue
										]
									}),
									enemyProg.tier >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge",
										style: {
											background: "#FEF9C3",
											color: "#854D0E"
										},
										children: [
											"🥐 Hlad: ",
											Math.round((1 - (currentMonster.hunger ?? currentMonster.foodResist ?? 0)) * 100),
											" %"
										]
									}),
									enemyProg.tier >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tag-badge",
										style: {
											background: "#E0E7FF",
											color: "var(--ink)"
										},
										children: ["⚡ Rychlost: ", enemyProg.spoiledStats.speed]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									fontWeight: 700,
									lineHeight: 1.35,
									margin: "10px 0"
								},
								children: enemyProg.spoiledLore
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "rgba(0,0,0,0.04)",
									borderLeft: "4px solid var(--mustard)",
									padding: "8px 12px",
									margin: "10px 0",
									fontStyle: "italic",
									fontWeight: 600,
									fontSize: "0.92rem"
								},
								children: [
									"📜 „Z kroniky Ladova kraje: ",
									enemyProg.tier >= 2 ? "Kdo chce přemoci tohoto tvora, musí znát jeho zvyky a nenechat se překvapit nočním přepadem." : "Kronikáři zatím shromažďují zkazky o tomto tajemném nočním úkazu.",
									"“"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									borderTop: "2px dashed #bbb",
									paddingTop: "10px",
									marginTop: "10px",
									fontSize: "0.92rem"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#166534" },
										children: "🌿 Slabiny:"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: enemyProg.tier >= 2 ? "#166534" : "#6B7280",
											fontWeight: 700
										},
										children: enemyProg.spoiledWeakness
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "4px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#991b1b" },
											children: "⚠️ Přednosti a záludnosti:"
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: enemyProg.tier >= 3 ? "#991b1b" : "#6B7280",
												fontWeight: 700
											},
											children: enemyProg.spoiledStrength
										})
									]
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: "16px" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						onClick: onClose,
						children: "Zavřít bestiář"
					})
				})
			]
		})
	});
};

export { CATEGORIES, BestiaryModal };
