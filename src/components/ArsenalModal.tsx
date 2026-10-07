import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { WEAPONS } from '../data/weapons';
import { GameIcon } from './GameIcon';
import { getWeaponProgress } from '../data/weaponUnlocks';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var ArsenalModal = ({ isOpen, onClose, meta, onInspectWeapon }) => {
	const [filter, setFilter] = (0, import_react.useState)("all");
	if (!isOpen) return null;
	const progresses = Object.keys(WEAPONS).map((key) => getWeaponProgress(key, meta));
	const unlockedCount = progresses.filter((p) => p.isUnlocked).length;
	const totalCount = progresses.length;
	const filtered = progresses.filter((p) => {
		if (filter === "unlocked") return p.isUnlocked;
		if (filter === "locked") return !p.isUnlocked;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 40 },
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "1020px",
				width: "95%",
				maxHeight: "88vh",
				display: "flex",
				flexDirection: "column"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: "0 0 4px 0",
							fontSize: "1.9rem",
							color: "#FEF3C7",
							textShadow: "2px 2px 0 var(--ink)"
						},
						children: "🗡️ Zbrojnice & Arzenál Bubákova"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontWeight: 800,
							margin: 0,
							color: "#FEF3C7",
							fontSize: "0.96rem"
						},
						children: "Zbraně se odemykají postupně jedna po druhé v kovářské dílně – nová zbraň se začne odemykat teprve po odemčení zbraně předchozí!"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "10px",
						margin: "14px 0 10px 0",
						background: "var(--parchmentDark)",
						padding: "8px 14px",
						borderRadius: "8px",
						border: "2px solid var(--ink)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontWeight: 900,
							fontSize: "0.95rem",
							color: "#111111"
						},
						children: [
							"📊 Stav zbrojnice: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									color: "#111111",
									fontWeight: 900
								},
								children: [
									unlockedCount,
									" / ",
									totalCount
								]
							}),
							" zbraní odemčeno (",
							Math.floor(unlockedCount / totalCount * 100),
							" %)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "6px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `tab-btn ${filter === "all" ? "active" : ""}`,
								style: {
									padding: "4px 10px",
									fontSize: "0.85rem"
								},
								onClick: () => {
									sound.coin();
									setFilter("all");
								},
								children: [
									"Všechny (",
									totalCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `tab-btn ${filter === "unlocked" ? "active" : ""}`,
								style: {
									padding: "4px 10px",
									fontSize: "0.85rem"
								},
								onClick: () => {
									sound.coin();
									setFilter("unlocked");
								},
								children: [
									"✅ Odemčené (",
									unlockedCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `tab-btn ${filter === "locked" ? "active" : ""}`,
								style: {
									padding: "4px 10px",
									fontSize: "0.85rem"
								},
								onClick: () => {
									sound.coin();
									setFilter("locked");
								},
								children: [
									"🔒 Uzamčené (",
									totalCount - unlockedCount,
									")"
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
						gap: "14px",
						overflowY: "auto",
						padding: "4px",
						flex: 1
					},
					children: filtered.map((prog) => {
						const isUnlocked = prog.isUnlocked;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `char-card ${isUnlocked ? "" : "char-card-locked"}`,
							style: {
								width: "auto",
								margin: 0,
								padding: "12px"
							},
							onClick: () => {
								sound.coin();
								onInspectWeapon(prog);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: isUnlocked ? "char-card-unlocked-badge" : "char-card-locked-badge",
									children: isUnlocked ? "✅ Odemčeno" : prog.isQueued ? "🔒 V pořadí (0 %)" : `🔒 ${prog.percent} %`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: "60px",
										height: "60px",
										borderRadius: "50%",
										background: isUnlocked ? "linear-gradient(135deg, var(--bone-white), #D4CBBA)" : prog.tier === 0 ? "#1A1410" : prog.tier === 1 ? "#3D2818" : prog.tier === 2 ? "#6B4E30" : "#C89434",
										border: "3px solid var(--ink)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: prog.tier === 0 ? "2rem" : "2.3rem",
										margin: "0 auto 8px auto",
										boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.3)",
										filter: prog.tier === 0 ? "grayscale(1) brightness(0.3)" : prog.tier === 1 ? "contrast(160%) brightness(0.5)" : "none"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameIcon, {
										icon: prog.tier === 0 ? "❓" : prog.realIcon,
										size: prog.id === "buns" ? 44 : "2.2rem"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										fontSize: "1.25rem",
										margin: "2px 0",
										minHeight: "32px",
										color: "#111111",
										fontWeight: 900
									},
									children: prog.spoiledName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `hunter-tier-stamp tier-stamp-${prog.tier}`,
									style: { fontSize: "0.72rem" },
									children: prog.clueTag
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: "4px 0",
										fontSize: "0.84rem",
										fontWeight: 700,
										lineHeight: 1.3,
										minHeight: "44px",
										color: "#111111"
									},
									children: prog.spoiledDesc
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hunter-clue-box",
									style: {
										fontSize: "0.75rem",
										fontWeight: 800
									},
									children: ["⚡ ", prog.spoiledStatsHint]
								}),
								!isUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hunter-progress-wrap",
									style: { marginTop: "6px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "hunter-progress-header",
											style: { fontSize: "0.74rem" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: prog.isQueued ? `Čeká na: ${prog.requiredWeaponName}` : "Výzva:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												prog.curCount,
												" / ",
												prog.maxCount,
												" (",
												prog.percent,
												" %)"
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "hunter-progress-bar-outer",
											style: { height: "10px" },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "hunter-progress-bar-fill",
												style: { width: `${prog.percent}%` }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "hunter-progress-ticks",
											style: { fontSize: "0.65rem" },
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: prog.percent >= 25 ? "hunter-tick reached" : "hunter-tick",
													children: "25%"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: prog.percent >= 50 ? "hunter-tick reached" : "hunter-tick",
													children: "50%"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: prog.percent >= 75 ? "hunter-tick reached" : "hunter-tick",
													children: "75%"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: prog.percent >= 100 ? "hunter-tick reached" : "hunter-tick",
													children: "100%"
												})
											]
										}),
										prog.enemiesBreakdown.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "hunter-enemy-pills",
											children: prog.enemiesBreakdown.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "hunter-enemy-pill",
												style: {
													fontSize: "0.68rem",
													padding: "1px 4px"
												},
												title: `${e.name}: ${e.count}`,
												children: [
													e.icon,
													" ",
													e.count
												]
											}, e.id))
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										marginTop: "auto",
										paddingTop: "6px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											width: "100%",
											fontSize: "0.82rem",
											padding: "5px 8px",
											background: isUnlocked ? "var(--mustard)" : "var(--wood-dark)",
											color: isUnlocked ? "var(--ink)" : "var(--parchment)"
										},
										onClick: (e) => {
											e.stopPropagation();
											sound.coin();
											onInspectWeapon(prog);
										},
										children: isUnlocked ? "📜 Podrobnosti zbraně" : prog.isQueued ? `🔒 Čeká na: ${prog.requiredWeaponName}` : `🔍 Prozkoumat stopu (${prog.percent} %)`
									})
								})
							]
						}, prog.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						justifyContent: "center",
						marginTop: "12px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: {
							padding: "8px 26px",
							fontSize: "1.05rem"
						},
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "Zpět"
					})
				})
			]
		})
	});
};

export { ArsenalModal };
