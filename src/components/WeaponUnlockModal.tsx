import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { GameIcon } from './GameIcon';
import { WEAPON_UNLOCKS } from '../data/weaponUnlocks';

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
							})
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
