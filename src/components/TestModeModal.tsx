import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { GAME_LEVELS } from '../data/levels';
import { sound } from '../audio';
import { WEAPONS } from '../data/weapons';
import { Lada } from '../render/ladaRenderer';
import { GameIcon } from './GameIcon';
import { HUNTER_UNLOCKS } from '../data/hunterUnlocks';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var HUNTER_KEYS = [
	"wanderer",
	"shepherd",
	"korenarka",
	"watchman",
	"sexton",
	"granny"
];
var ALL_WEAPON_KEYS = [
	"buns",
	"cane",
	"pitchfork",
	"halberd",
	"flail",
	"herbs",
	"snowball",
	"kolac",
	"potato",
	"bees",
	"hromnicka",
	"holywater",
	"cesnekova-topinka",
	"valecnice",
	"kysela-okurka"
];
var DEFAULT_HERO_WEAPONS = {
	wanderer: [{
		id: "cane",
		level: 1
	}],
	shepherd: [{
		id: "buns",
		level: 1
	}],
	korenarka: [{
		id: "herbs",
		level: 1
	}],
	watchman: [{
		id: "halberd",
		level: 1
	}],
	sexton: [{
		id: "holywater",
		level: 1
	}],
	granny: [{
		id: "kolac",
		level: 1
	}]
};
var HUNTER_DRAW_MAP = {
	wanderer: Lada.drawWanderer,
	shepherd: Lada.drawShepherd,
	korenarka: Lada.drawKorenarka,
	watchman: Lada.drawWatchman,
	sexton: Lada.drawSexton,
	granny: Lada.drawGranny
};
var HUNTER_STATS_INFO = {
	wanderer: {
		hp: 200,
		speed: 165,
		pickup: 75,
		ability: "Pověstná sukovice (21 s)",
		role: "Všestranný vytrvalec s vysokou kuráží (200), osikovým prutem a tuláckým instinktem (+35 % poškození)"
	},
	shepherd: {
		hp: 110,
		speed: 220,
		pickup: 160,
		ability: "Dusot stáda (30 s)",
		role: "Bleskový běžec s velkým dosahem sběru mincí a buchet, přivolává běžící stádo beranů"
	},
	korenarka: {
		hp: 125,
		speed: 180,
		pickup: 105,
		ability: "Očistné kadidlo (30 s)",
		role: "Ranhojička s léčivými bylinkami, pasivní regenerací kuráže (+2/4 s) a hojivým sanctuariem"
	},
	watchman: {
		hp: 140,
		speed: 175,
		pickup: 115,
		ability: "Noční roh a poplach (30 s)",
		role: "Obrněný strážce noci s kovanou halapartnou a posvěcenou lucernou (stálá svatá aura)"
	},
	sexton: {
		hp: 135,
		speed: 170,
		pickup: 110,
		ability: "Farní požehnání (35 s)",
		role: "Pobožný služebník se svěcenou vodou a plošným vymýcením démonů a nemrtvých"
	},
	granny: {
		hp: 130,
		speed: 165,
		pickup: 125,
		ability: "Chléb se solí a vlídné slovo (45 s)",
		role: "Laskavá babička s vnučkou Barunkou, kynutým koláčem a zastavením času s nasycením bubáků"
	}
};
var WEAPON_TYPE_LABELS = {
	food: {
		label: "Jídlo",
		bg: "#D97706",
		color: "#FFFFFF"
	},
	physical: {
		label: "Fyzické",
		bg: "#4B5563",
		color: "#FFFFFF"
	},
	nature: {
		label: "Přírodní",
		bg: "#15803D",
		color: "#FFFFFF"
	},
	ice: {
		label: "Mrazivé",
		bg: "#0284C7",
		color: "#FFFFFF"
	},
	holy: {
		label: "Svaté",
		bg: "#CA8A04",
		color: "#FFFFFF"
	},
	fire: {
		label: "Ohnivé",
		bg: "#DC2626",
		color: "#FFFFFF"
	},
	magic: {
		label: "Kouzelné",
		bg: "#9333EA",
		color: "#FFFFFF"
	},
	valecnice: {
		label: "Válečnice",
		bg: "#9A3412",
		color: "#FFFFFF"
	},
	garlic: {
		label: "Česnek / Aura",
		bg: "#B45309",
		color: "#FFFFFF"
	},
	pickle: {
		label: "Kyselé",
		bg: "#15803D",
		color: "#FFFFFF"
	}
};
var TestModeModal = ({ isOpen, onClose, onStartTestRun, initialLevelId = 1, onOpenGrandfatherShop }: { isOpen: boolean; onClose: () => void; onStartTestRun: (hero: any, levelId: any, weapons: any[]) => void; initialLevelId?: number; onOpenGrandfatherShop?: () => void }) => {
	const [selectedHero, setSelectedHero] = (0, import_react.useState)("wanderer");
	const [selectedLevel, setSelectedLevel] = (0, import_react.useState)(initialLevelId);
	const [activeTab, setActiveTab] = (0, import_react.useState)("hero");
	const [weaponConfig, setWeaponConfig] = (0, import_react.useState)(() => {
		const init = {};
		ALL_WEAPON_KEYS.forEach((key) => {
			init[key] = {
				selected: false,
				level: 0
			};
		});
		DEFAULT_HERO_WEAPONS.wanderer.forEach((w) => {
			init[w.id] = {
				selected: true,
				level: w.level
			};
		});
		return init;
	});
	const canvasRefs = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		let animId;
		const start = performance.now();
		const loop = (now) => {
			const elapsed = (now - start) / 1e3;
			HUNTER_KEYS.forEach((hKey) => {
				const cvs = canvasRefs.current[hKey];
				if (cvs) {
					const ctx = cvs.getContext("2d");
					if (ctx) {
						ctx.clearRect(0, 0, cvs.width, cvs.height);
						const drawFn = HUNTER_DRAW_MAP[hKey];
						if (drawFn) drawFn.call(Lada, ctx, cvs.width / 2, cvs.height * .72, elapsed, 0, 0, false, .95);
					}
				}
			});
			animId = requestAnimationFrame(loop);
		};
		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, [isOpen]);
	if (!isOpen) return null;
	const applyHeroDefaultWeapons = (heroType) => {
		const nextConfig = {};
		ALL_WEAPON_KEYS.forEach((key) => {
			nextConfig[key] = {
				selected: false,
				level: 0
			};
		});
		(DEFAULT_HERO_WEAPONS[heroType] || [{
			id: "buns",
			level: 1
		}]).forEach((w) => {
			nextConfig[w.id] = {
				selected: true,
				level: w.level
			};
		});
		setWeaponConfig(nextConfig);
		sound.coin();
	};
	const applyAllWeaponsLevel = (level) => {
		const nextConfig = {};
		ALL_WEAPON_KEYS.forEach((key) => {
			nextConfig[key] = {
				selected: level > 0,
				level
			};
		});
		setWeaponConfig(nextConfig);
		sound.coin();
	};
	const clearAllWeapons = () => {
		const nextConfig = {};
		ALL_WEAPON_KEYS.forEach((key) => {
			nextConfig[key] = {
				selected: false,
				level: 0
			};
		});
		setWeaponConfig(nextConfig);
		sound.coin();
	};
	const toggleWeapon = (id) => {
		setWeaponConfig((cur) => {
			const prev = cur[id] || { selected: false, level: 0 };
			const nextSel = !prev.selected;
			return {
				...cur,
				[id]: {
					selected: nextSel,
					level: nextSel ? (prev.level > 0 ? prev.level : 1) : 0
				}
			};
		});
		sound.coin();
	};
	const changeWeaponLevel = (id, delta) => {
		setWeaponConfig((cur) => {
			const currentLevel = cur[id]?.level ?? (cur[id]?.selected ? 1 : 0);
			const nextLevel = Math.max(0, Math.min(10, currentLevel + delta));
			return {
				...cur,
				[id]: {
					selected: nextLevel > 0,
					level: nextLevel
				}
			};
		});
		sound.coin();
	};
	const setWeaponToZero = (id) => {
		setWeaponConfig((cur) => ({
			...cur,
			[id]: {
				selected: false,
				level: 0
			}
		}));
		sound.coin();
	};
	const selectedWeaponsList = ALL_WEAPON_KEYS
		.filter((k) => weaponConfig[k]?.selected && (weaponConfig[k]?.level ?? 0) > 0)
		.map((k) => ({
			id: k,
			level: weaponConfig[k]?.level || 1
		}));
	const handleStart = () => {
		if (selectedWeaponsList.length === 0) {
			sound.hit();
			return;
		}
		sound.cheer();
		onStartTestRun(selectedHero, selectedLevel, selectedWeaponsList);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: {
			zIndex: 45,
			background: "rgba(20, 15, 10, 0.92)",
			backdropFilter: "blur(3px)"
		},
		onClick: (e) => {
			if (e.target === e.currentTarget) {
				sound.coin();
				onClose();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "960px",
				width: "95%",
				maxHeight: "92vh",
				display: "flex",
				flexDirection: "column",
				padding: "20px 24px",
				background: "var(--wood-light)",
				border: "4px solid var(--ink)",
				position: "relative"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { fontSize: "2rem" },
							children: "🧪"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: 0,
								fontSize: "1.9rem",
								color: "#FDE047",
								letterSpacing: "1px",
								textShadow: "2px 2px 0px var(--ink)"
							},
							children: "TESTOVACÍ MÓD (SANDBOX)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "2px 0 0 0",
							fontWeight: 800,
							fontSize: "0.94rem",
							color: "#FEF3C7"
						},
						children: "Vyzkoušejte libovolného hrdinu na kterémkoliv stage s libovolnými zbraněmi a jejich levely bez jakéhokoliv omezení!"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							sound.coin();
							onClose();
						},
						style: {
							background: "#D1342B",
							color: "#FFFFFF",
							border: "2px solid var(--ink)",
							borderRadius: "8px",
							padding: "6px 12px",
							fontSize: "1.1rem",
							fontWeight: 900,
							cursor: "pointer",
							boxShadow: "2px 2px 0 var(--ink)"
						},
						title: "Zavřít",
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px",
						margin: "8px 0 14px 0",
						borderBottom: "3px solid var(--ink)",
						paddingBottom: "8px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: `tab-btn ${activeTab === "hero" ? "active" : ""}`,
							onClick: () => {
								sound.coin();
								setActiveTab("hero");
							},
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontWeight: 900,
								fontSize: "0.96rem"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👤 1. Hrdina:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: HUNTER_UNLOCKS[selectedHero]?.realName || "Poutník" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: `tab-btn ${activeTab === "level" ? "active" : ""}`,
							onClick: () => {
								sound.coin();
								setActiveTab("level");
							},
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontWeight: 900,
								fontSize: "0.96rem"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🗺️ 2. Úroveň:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								"Úr. ",
								selectedLevel,
								" (",
								GAME_LEVELS[selectedLevel]?.shortTitle,
								")"
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: `tab-btn ${activeTab === "weapons" ? "active" : ""}`,
							onClick: () => {
								sound.coin();
								setActiveTab("weapons");
							},
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontWeight: 900,
								fontSize: "0.96rem"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🗡️ 3. Startovní zbraně:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selectedWeaponsList.length, " vybráno"] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						overflowY: "auto",
						paddingRight: "6px",
						minHeight: "280px"
					},
					children: [
						activeTab === "hero" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontWeight: 900,
									fontSize: "1.05rem",
									color: "#FEF3C7"
								},
								children: "Zvolte si hrdinu pro testování (odemčeni jsou všichni):"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "lada-btn btn-small",
								style: {
									margin: 0,
									fontSize: "0.82rem",
									padding: "4px 10px",
									background: "#15803D",
									color: "#FFFFFF"
								},
								onClick: () => applyHeroDefaultWeapons(selectedHero),
								title: "Nastaví startovní zbraně podle zvoleného hrdiny",
								children: "🎯 Nastavit výchozí zbraně hrdiny"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
								gap: "12px"
							},
							children: HUNTER_KEYS.map((hKey) => {
								const isSelected = selectedHero === hKey;
								const hunterDef = HUNTER_UNLOCKS[hKey];
								const stats = HUNTER_STATS_INFO[hKey];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onClick: () => {
										sound.coin();
										setSelectedHero(hKey);
									},
									style: {
										background: isSelected ? "#FEF3C7" : "var(--parchment)",
										border: isSelected ? "4px solid #16A34A" : "3px solid var(--ink)",
										borderRadius: "10px",
										padding: "12px",
										cursor: "pointer",
										color: "var(--ink)",
										boxShadow: isSelected ? "0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)" : "4px 4px 0px var(--ink)",
										transform: isSelected ? "scale(1.02)" : "none",
										transition: "all 0.15s ease",
										position: "relative",
										textAlign: "left"
									},
									children: [
										isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												position: "absolute",
												top: "8px",
												right: "8px",
												background: "#16A34A",
												color: "#FFFFFF",
												border: "2px solid var(--ink)",
												borderRadius: "6px",
												padding: "2px 7px",
												fontSize: "0.75rem",
												fontWeight: 900
											},
											children: "✓ ZVOLENO"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												gap: "10px",
												alignItems: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													width: "90px",
													height: "90px",
													borderRadius: "50%",
													background: "#EAE3D1",
													border: "3px solid var(--ink)",
													overflow: "hidden",
													flexShrink: 0
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
													ref: (el) => {
														canvasRefs.current[hKey] = el;
													},
													width: 90,
													height: 90
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: { flex: 1 },
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
														style: {
															margin: 0,
															fontSize: "1.25rem",
															color: "#111111",
															fontWeight: 900
														},
														children: hunterDef.realName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "0.8rem",
															color: "#78350F",
															fontWeight: 800,
															marginBottom: "4px"
														},
														children: hunterDef.realTitle
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															fontSize: "0.82rem",
															fontWeight: 800,
															color: "#111111",
															display: "flex",
															gap: "8px",
															flexWrap: "wrap"
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
																"🦁 ",
																stats.hp,
																" Kuráž"
															] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["👟 ", stats.speed] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["🧲 ", stats.pickup] })
														]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "8px",
												background: "rgba(0,0,0,0.05)",
												borderRadius: "6px",
												padding: "6px 8px",
												fontSize: "0.8rem",
												fontWeight: 700,
												lineHeight: 1.3
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontWeight: 900,
													color: "#B45309"
												},
												children: ["⚡ ", stats.ability]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													marginTop: "2px",
													color: "#374151"
												},
												children: stats.role
											})]
										})
									]
								}, hKey);
							})
						})] }),
						activeTab === "level" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								marginBottom: "10px",
								fontWeight: 900,
								fontSize: "1.05rem",
								color: "#FEF3C7"
							},
							children: "Zvolte si stage pro testování (přístupných je všech 6 úrovní včetně bossů):"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
								gap: "12px"
							},
							children: [
								1,
								2,
								3,
								4,
								5,
								6
							].map((lvlId) => {
								const lvl = GAME_LEVELS[lvlId];
								const isSelected = selectedLevel === lvlId;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onClick: () => {
										sound.coin();
										setSelectedLevel(lvlId);
									},
									style: {
										background: isSelected ? "#FEF3C7" : "var(--parchment)",
										border: isSelected ? "4px solid #16A34A" : "3px solid var(--ink)",
										borderRadius: "10px",
										padding: "12px",
										cursor: "pointer",
										color: "var(--ink)",
										boxShadow: isSelected ? "0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)" : "4px 4px 0px var(--ink)",
										transform: isSelected ? "scale(1.02)" : "none",
										transition: "all 0.15s ease",
										position: "relative",
										textAlign: "left"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													background: isSelected ? "#16A34A" : "var(--wood-dark)",
													color: "#FFFFFF",
													borderRadius: "6px",
													padding: "2px 8px",
													fontSize: "0.78rem",
													fontWeight: 900
												},
												children: isSelected ? "✓ ZVOLENO" : `Úroveň ${lvlId}`
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { fontSize: "1.25rem" },
												children: lvl.icon
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											style: {
												margin: "0 0 2px 0",
												fontSize: "1.18rem",
												fontWeight: 900,
												color: "#111111"
											},
											children: lvl.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "0.82rem",
												fontWeight: 800,
												color: "#78350F",
												marginBottom: "6px"
											},
											children: lvl.subtitle
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												margin: "0 0 8px 0",
												fontSize: "0.8rem",
												lineHeight: 1.3,
												fontWeight: 700,
												color: "#1F2937"
											},
											children: lvl.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												background: "rgba(209, 52, 43, 0.12)",
												border: "1.5px solid #D1342B",
												borderRadius: "6px",
												padding: "4px 8px",
												fontSize: "0.8rem",
												fontWeight: 800,
												color: "#991B1B"
											},
											children: ["👑 Velký boss: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: lvl.finalBoss.name })]
										})
									]
								}, lvlId);
							})
						})] }),
						activeTab === "weapons" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "10px 14px",
								marginBottom: "14px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "8px",
								flexWrap: "wrap"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontWeight: 900,
									fontSize: "0.94rem",
									color: "#111111"
								},
								children: "⚡ Rychlé předvolby arzenálu:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px",
									flexWrap: "wrap"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											margin: 0,
											padding: "4px 8px",
											fontSize: "0.78rem",
											background: "#3D2210",
											color: "#FEF3C7"
										},
										onClick: () => applyHeroDefaultWeapons(selectedHero),
										title: "Nastaví výchozí startovní zbraně podle vybraného hrdiny",
										children: "🎯 Dle hrdiny"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											margin: 0,
											padding: "4px 8px",
											fontSize: "0.78rem",
											background: "#2563EB",
											color: "#FFFFFF"
										},
										onClick: () => applyAllWeaponsLevel(1),
										children: "⚔️ Všechny (Úr. 1)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											margin: 0,
											padding: "4px 8px",
											fontSize: "0.78rem",
											background: "#EA580C",
											color: "#FFFFFF"
										},
										onClick: () => applyAllWeaponsLevel(5),
										children: "🔥 Všechny (Úr. 5 – MAX)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											margin: 0,
											padding: "4px 8px",
											fontSize: "0.78rem",
											background: "#7C3AED",
											color: "#FFFFFF"
										},
										onClick: () => applyAllWeaponsLevel(10),
										children: "👑 Božský arzenál (Úr. 10)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "lada-btn btn-small",
										style: {
											margin: 0,
											padding: "4px 8px",
											fontSize: "0.78rem",
											background: "#6B7280",
											color: "#FFFFFF"
										},
										onClick: clearAllWeapons,
										title: "Vynuluje všechny zbraně na úroveň 0 (pro čistý výběr)",
										children: "🧹 Vynulovat vše"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
								gap: "10px"
							},
							children: ALL_WEAPON_KEYS.map((wId) => {
								const wDef = WEAPONS[wId];
								if (!wDef) return null;
								const cfg = weaponConfig[wId] || {
									selected: false,
									level: 0
								};
								const isSel = (cfg.level > 0) && cfg.selected;
								const typeTag = WEAPON_TYPE_LABELS[wDef.type] || {
									label: wDef.type,
									bg: "#4B5563",
									color: "#FFFFFF"
								};
								const estDmg = cfg.level > 0 ? Math.round(wDef.baseDmg + (cfg.level - 1) * 5) : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: isSel ? "#FEF3C7" : "#EFE7D5",
										border: isSel ? "3px solid #16A34A" : "2px solid #5C3D28",
										borderRadius: "8px",
										padding: "10px 12px",
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
										gap: "6px",
										color: "var(--ink)",
										boxShadow: isSel ? "0 0 10px rgba(22, 163, 74, 0.25), 3px 3px 0 var(--ink)" : "2px 2px 0 var(--ink)",
										textAlign: "left",
										opacity: cfg.level === 0 ? 0.78 : 1,
										transition: "all 0.1s ease"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px",
												cursor: "pointer",
												flex: 1
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: isSel,
													onChange: () => toggleWeapon(wId),
													style: {
														width: "18px",
														height: "18px",
														cursor: "pointer",
														accentColor: "#16A34A"
													}
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "1.25rem",
														lineHeight: 1
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameIcon, {
														icon: wDef.icon,
														size: 22
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														fontWeight: 900,
														fontSize: "0.98rem",
														color: cfg.level === 0 ? "#4B5563" : "#111111",
														lineHeight: 1.2
													},
													children: wDef.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														display: "inline-block",
														background: typeTag.bg,
														color: typeTag.color,
														padding: "1px 6px",
														borderRadius: "4px",
														fontSize: "0.68rem",
														fontWeight: 800,
														marginTop: "2px"
													},
													children: typeTag.label
												})] })
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "3px",
												background: isSel ? "#FFFFFF" : "rgba(255,255,255,0.7)",
												border: "2px solid var(--ink)",
												borderRadius: "6px",
												padding: "2px 4px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setWeaponToZero(wId),
													disabled: cfg.level <= 0,
													style: {
														width: "22px",
														height: "24px",
														background: cfg.level <= 0 ? "#E5E7EB" : "#FEE2E2",
														color: cfg.level <= 0 ? "#9CA3AF" : "#DC2626",
														border: "1.5px solid var(--ink)",
														borderRadius: "4px",
														fontWeight: 900,
														cursor: cfg.level <= 0 ? "not-allowed" : "pointer",
														lineHeight: 1,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "0.76rem"
													},
													title: "Vynulovat na úroveň 0 (lovec se zbraní nezačne)",
													children: "0"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => changeWeaponLevel(wId, -1),
													disabled: cfg.level <= 0,
													style: {
														width: "24px",
														height: "24px",
														background: cfg.level <= 0 ? "#E5E7EB" : "#D1342B",
														color: cfg.level <= 0 ? "#9CA3AF" : "#FFFFFF",
														border: "1.5px solid var(--ink)",
														borderRadius: "4px",
														fontWeight: 900,
														cursor: cfg.level <= 0 ? "not-allowed" : "pointer",
														lineHeight: 1,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "0.9rem"
													},
													title: "Snížit úroveň zbraně (až na 0 = zbraň neaktivní)",
													children: "-"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														fontWeight: 900,
														fontSize: "0.85rem",
														minWidth: "48px",
														textAlign: "center",
														color: cfg.level > 0 ? (isSel ? "#111111" : "#4B5563") : "#DC2626"
													},
													children: [cfg.level === 0 ? "Úr. 0" : `Úr. ${cfg.level}`]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => changeWeaponLevel(wId, 1),
													disabled: cfg.level >= 10,
													style: {
														width: "24px",
														height: "24px",
														background: cfg.level >= 10 ? "#E5E7EB" : "#16A34A",
														color: cfg.level >= 10 ? "#9CA3AF" : "#FFFFFF",
														border: "1.5px solid var(--ink)",
														borderRadius: "4px",
														fontWeight: 900,
														cursor: cfg.level >= 10 ? "not-allowed" : "pointer",
														lineHeight: 1,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontSize: "0.9rem"
													},
													title: "Zvýšit úroveň zbraně (až na úroveň 10)",
													children: "+"
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "0.76rem",
											color: cfg.level === 0 ? "#DC2626" : "#4B5563",
											fontWeight: 700,
											lineHeight: 1.25
										},
										children: [
											cfg.level === 0
												? "💤 Úroveň 0 – lovec s touto zbraní nezačíná"
												: `💥 Zásah: ~${estDmg} | ⏱️ Kadence: ${wDef.baseCd} s`,
											wDef.desc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "0.71rem",
													color: "#5C3D28",
													fontStyle: "italic",
													marginTop: "2px",
													lineHeight: 1.2
												},
												children: wDef.desc
											})
										]
									})]
								}, wId);
							})
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						borderTop: "3px solid var(--ink)",
						paddingTop: "12px",
						marginTop: "10px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							textAlign: "left",
							fontSize: "0.92rem",
							fontWeight: 800,
							color: "#FEF3C7"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Vybráno: " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#FDE047" },
								children: HUNTER_UNLOCKS[selectedHero]?.realName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " na " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#FDE047" },
								children: GAME_LEVELS[selectedLevel]?.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " s " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: { color: selectedWeaponsList.length > 0 ? "#86EFAC" : "#F87171" },
								children: [
									selectedWeaponsList.length > 0
										? `${selectedWeaponsList.length} zbraněmi`
										: "0 zbraněmi"
								]
							}),
							selectedWeaponsList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "#F87171",
									marginLeft: "6px",
									fontWeight: 900
								},
								children: "(Pro zahájení výpravy vyberte alespoň 1 zbraň s úrovní 1 nebo vyšší!)"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px"
						},
						children: [
							onOpenGrandfatherShop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "lada-btn btn-small",
								style: {
									margin: 0,
									background: "#B45309",
									color: "#FFFFFF",
									fontWeight: 900,
									boxShadow: "3px 3px 0 var(--ink)",
									cursor: "pointer"
								},
								onClick: () => {
									sound.coin();
									onOpenGrandfatherShop();
								},
								children: "🧺 Dědečkův obchod (Nůše)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "lada-btn btn-small",
							style: {
								margin: 0,
								background: "#4B5563",
								color: "#FFFFFF"
							},
							onClick: () => {
								sound.coin();
								onClose();
							},
							children: "Zrušit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "lada-btn btn-small",
							disabled: selectedWeaponsList.length === 0,
							style: {
								margin: 0,
								background: selectedWeaponsList.length > 0 ? "#16A34A" : "#9CA3AF",
								color: "#FFFFFF",
								fontWeight: 900,
								cursor: selectedWeaponsList.length > 0 ? "pointer" : "not-allowed",
								boxShadow: selectedWeaponsList.length > 0 ? "4px 4px 0 var(--ink)" : "none"
							},
							onClick: handleStart,
							children: "⚔️ Spustit testovací výpravu"
						})]
					})]
				})
			]
		})
	});
};

export { HUNTER_KEYS, ALL_WEAPON_KEYS, DEFAULT_HERO_WEAPONS, HUNTER_DRAW_MAP, HUNTER_STATS_INFO, WEAPON_TYPE_LABELS, TestModeModal };
