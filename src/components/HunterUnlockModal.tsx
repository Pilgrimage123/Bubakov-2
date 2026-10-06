import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { HUNTER_UNLOCKS } from '../data/hunterUnlocks';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var HunterUnlockModal = ({ progress, onClose, onStartIfUnlocked }) => {
	if (!progress) return null;
	const def = HUNTER_UNLOCKS[progress.id];
	const milestonesList = [
		{
			pct: 25,
			tier: 1,
			title: "25 % – První stopa z lidových pověstí",
			desc: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledLore || "",
			weapon: def?.milestones.find((m) => m.tierLevel === 1)?.spoiledWeaponHint || "",
			reached: progress.percent >= 25
		},
		{
			pct: 50,
			tier: 2,
			title: "50 % – Zřetelná kresba a odhalení zbraně",
			desc: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledLore || "",
			weapon: def?.milestones.find((m) => m.tierLevel === 2)?.spoiledWeaponHint || "",
			reached: progress.percent >= 50
		},
		{
			pct: 75,
			tier: 3,
			title: "75 % – Téměř plné barvy a speciální schopnost",
			desc: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledLore || "",
			weapon: def?.milestones.find((m) => m.tierLevel === 3)?.spoiledAbilityHint || "",
			reached: progress.percent >= 75
		},
		{
			pct: 100,
			tier: 4,
			title: "100 % – Plné odemčení a vstup do party",
			desc: `Lovec ${def?.realName || ""} se trvale přidá k tvé družině a bude kdykoliv k dispozici pro novou výpravu!`,
			weapon: def?.milestones.find((m) => m.tierLevel === 4)?.spoiledWeaponHint || "",
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
				maxWidth: "680px",
				width: "95%",
				textAlign: "left"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaCardCorners, { variant: "callout" }),
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: "4px 0 2px 0",
								fontSize: "1.9rem",
								color: "#FEF3C7",
								textShadow: "2px 2px 0 var(--ink)"
							},
							children: progress.spoiledName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontWeight: 900,
								color: "#FEF3C7",
								fontSize: "1.05rem"
							},
							children: progress.spoiledTitle
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
							children: "Výzva k odemčení je zatím uzamčena!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "0.88rem",
								fontWeight: 700,
								color: "#78350F",
								marginTop: "2px"
							},
							children: [
								"Nový lovec se nikdy nezačne odemykat, dokud není plně odemčen lovec před ním. Nejprve musíte splnit výzvu a odemknout lovce: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: progress.requiredHunterName }),
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
							children: "📜 Pořadí odemykání: Poutník ➔ Pasáček ➔ Bába kořenářka ➔ Ponocný"
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
									fontSize: "1.25rem",
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
								children: progress.isUnlocked ? "✅ SPLNĚNO" : progress.isQueued ? `🔒 ČEKÁ NA: ${progress.requiredHunterName?.toUpperCase()}` : `${progress.curCount} / ${progress.maxCount} (${progress.percent} %)`
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
								children: "Zahnáni vybraní nepřátelé:"
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
					children: "🕵️ Postupné odhalování identity (25 %, 50 % a 75 %):"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						maxHeight: "240px",
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
								children: m.reached ? m.desc : "Tato stopa a část identity se odhalí po splnění tohoto milníku."
							}),
							m.reached && m.weapon && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "0.82rem",
									fontWeight: 900,
									color: "#2A170A",
									marginTop: "2px"
								},
								children: ["💡 ", m.weapon]
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
					children: [progress.isUnlocked && onStartIfUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: {
							background: "var(--leaf-green)",
							color: "#FFFFFF",
							padding: "10px 24px"
						},
						onClick: () => {
							onClose();
							onStartIfUnlocked(progress.id);
						},
						children: "Zvolit tohoto lovce a hrát ⚔️"
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

export { HunterUnlockModal };
