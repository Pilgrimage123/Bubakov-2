import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { LEVEL_UNLOCKS } from '../data/levelUnlocks';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var LevelUnlockModal = ({ progress, onClose, onSelectIfUnlocked }) => {
	if (!progress) return null;
	const def = LEVEL_UNLOCKS[progress.id];
	const milestonesList = [
		{
			pct: 25,
			tier: 1,
			title: "25 % – První stopa, mlha a obrysy krajiny",
			desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledDesc || "",
			boss: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledBossHint || "",
			weather: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledWeatherHint || "",
			reached: progress.percent >= 25
		},
		{
			pct: 50,
			tier: 2,
			title: "50 % – Zřetelná stezka, počasí a první běsi",
			desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledDesc || "",
			boss: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledBossHint || "",
			weather: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledWeatherHint || "",
			reached: progress.percent >= 50
		},
		{
			pct: 75,
			tier: 3,
			title: "75 % – Téměř plné barvy a odhalení hlavního bosse",
			desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledDesc || "",
			boss: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledBossHint || "",
			weather: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledWeatherHint || "",
			reached: progress.percent >= 75
		},
		{
			pct: 100,
			tier: 4,
			title: "100 % – Otevřená brána a neomezený přístup",
			desc: `Cesta do ${def?.realName || ""} je plně probádána a přístupna pro všechny vaše hrdiny a výpravy!`,
			boss: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledBossHint || "",
			weather: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledWeatherHint || "",
			reached: progress.isUnlocked || progress.percent >= 100
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 45 },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "700px",
				width: "95%",
				textAlign: "left"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `hunter-tier-stamp tier-stamp-${progress.tier}`,
							style: { fontSize: "0.85rem" },
							children: progress.clueTag
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								marginTop: "4px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { fontSize: "2.2rem" },
								children: progress.spoiledIcon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								style: {
									margin: "0",
									fontSize: "1.85rem",
									color: "#FEF3C7",
									textShadow: "2px 2px 0 var(--ink)"
								},
								children: progress.spoiledName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 900,
								color: "#FEF3C7",
								fontSize: "1.05rem",
								marginTop: "2px"
							},
							children: progress.spoiledSubtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 16 })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
							children: "Výprava do této úrovně je zatím uzamčena!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "0.88rem",
								fontWeight: 700,
								color: "#78350F",
								marginTop: "2px"
							},
							children: [
								"Nová úroveň se nikdy nezačne odemykat, dokud není pokořena předchozí úroveň. Nejprve musíte zvládnout úroveň: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.requiredLevelName }),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "0.82rem",
								fontWeight: 800,
								color: "#B45309",
								marginTop: "4px"
							},
							children: "📜 Pořadí odemykání úrovní: 1. Náves a rybník ➔ 2. Starý hřbitov a hvozd ➔ 3. Ladovská zima na Melechově"
						})
					] })]
				}),
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
									fontSize: "1.22rem",
									color: "#111111"
								},
								children: def?.challengeTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									background: progress.isUnlocked ? "var(--leaf-green)" : progress.isQueued ? "var(--wood-dark)" : "#2A170A",
									color: "#FFFFFF",
									fontWeight: 900,
									fontSize: "0.85rem",
									padding: "3px 8px",
									borderRadius: "6px",
									border: "1.5px solid var(--ink)"
								},
								children: progress.isUnlocked ? "✅ OTEVŘENO" : progress.isQueued ? `🔒 ČEKÁ NA PŘEDCHOZÍ ÚROVEŇ` : `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "6px 0 10px 0",
								fontSize: "0.94rem",
								fontWeight: 700,
								lineHeight: 1.35,
								color: "#111111"
							},
							children: def?.challengeLongDesc
						}),
						!progress.isUnlocked && def?.bossDefeatRequirement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "rgba(217, 119, 6, 0.15)",
								border: "1.5px dashed #D97706",
								borderRadius: "6px",
								padding: "5px 10px",
								fontSize: "0.84rem",
								fontWeight: 800,
								color: "#78350F",
								marginBottom: "10px"
							},
							children: [
								"⚡ ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Královská zkratka:" }),
								" ",
								def.bossDefeatRequirement,
								" odemkne tuto úroveň okamžitě na 100 %!"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hunter-progress-bar-outer",
							style: { height: "18px" },
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
								fontSize: "0.78rem",
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
							style: { marginTop: "12px" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 900,
									color: "#111111",
									marginBottom: "4px"
								},
								children: "Zahnáno přízraků na stezce k této úrovni:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hunter-enemy-pills",
								children: progress.enemiesBreakdown.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hunter-enemy-pill",
									style: { padding: "3px 8px" },
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
						margin: "14px 0 8px 0",
						fontSize: "1.15rem",
						color: "#FEF3C7"
					},
					children: "🗺️ Postupné odhalování tajemství krajiny (25 %, 50 % a 75 %):"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						maxHeight: "230px",
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
										fontSize: "0.9rem",
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
									fontSize: "0.86rem",
									lineHeight: 1.3,
									color: "#111111",
									fontWeight: 600
								},
								children: m.reached ? m.desc : "Podrobnosti o krajině a počasí se odhalí po splnění tohoto milníku."
							}),
							m.reached && m.boss && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 900,
									color: "#7F1D1D",
									marginTop: "2px"
								},
								children: m.boss
							}),
							m.reached && m.weather && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 800,
									color: "#1E40AF",
									marginTop: "1px"
								},
								children: m.weather
							})
						]
					}, m.pct))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
						marginTop: "16px"
					},
					children: [progress.isUnlocked && onSelectIfUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: {
							background: "var(--leaf-green)",
							color: "#FFFFFF",
							padding: "10px 24px"
						},
						onClick: () => {
							onClose();
							onSelectIfUnlocked(progress.id);
						},
						children: "Zvolit tuto úroveň a vyrazit 🗺️"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: { padding: "10px 20px" },
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "Zavřít"
					})]
				})
			]
		})
	});
};

export { LevelUnlockModal };
