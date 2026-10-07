import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { KrejcarIcon } from './KrejcarIcon';
import { HruskaIcon } from './HruskaIcon';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

interface ControlsModalProps {
	isOpen: boolean;
	onClose: () => void;
	defaultTab?: string;
	performanceMode?: boolean;
	onTogglePerformanceMode?: (enabled: boolean) => void;
	showPerfOverlay?: boolean;
	onToggleShowPerfOverlay?: (enabled: boolean) => void;
}

var ControlsModal = ({
	isOpen,
	onClose,
	defaultTab = "controls",
	performanceMode = false,
	onTogglePerformanceMode,
	showPerfOverlay = false,
	onToggleShowPerfOverlay
}: ControlsModalProps) => {
	const [activeTab, setActiveTab] = (0, import_react.useState)(defaultTab);
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 45 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "920px",
				width: "95%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "🎮 OVLÁDÁNÍ A CÍL HRY" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 18 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontWeight: 800,
						fontSize: "1.08rem",
						marginTop: "-6px",
						marginBottom: "14px",
						color: "#FEF3C7"
					},
					children: "Průvodce po české vesnici – jak zklidnit nezbedné bubáky výpraskem i voňavou buchtou a dočkat se ranního kuropění!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-tabs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `tab-btn ${activeTab === "controls" ? "active" : ""}`,
							onClick: () => {
								setActiveTab("controls");
								sound.coin();
							},
							children: "🕹️ Ovládání & Klávesnice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `tab-btn ${activeTab === "objective" ? "active" : ""}`,
							onClick: () => {
								setActiveTab("objective");
								sound.coin();
							},
							children: "🎯 Cíl hry & Fáze noci"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `tab-btn ${activeTab === "tips" ? "active" : ""}`,
							onClick: () => {
								setActiveTab("tips");
								sound.coin();
							},
							children: "💡 Výzbroj & Tipy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `tab-btn ${activeTab === "perf" ? "active" : ""}`,
							onClick: () => {
								setActiveTab("perf");
								sound.coin();
							},
							children: "⚡ Plynulost & Výkon"
						})
					]
				}),
				activeTab === "controls" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						maxHeight: "490px",
						overflowY: "auto",
						textAlign: "left",
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#FEF3C7",
								border: "3px solid #B45309",
								borderRadius: "8px",
								padding: "12px 16px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									flexWrap: "wrap",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "1.25rem",
										fontWeight: 900,
										color: "#92400E"
									},
									children: "⏸️ Pauza a odpočinek kdykoliv během hry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap keycap-accent",
											children: "P"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												alignSelf: "center",
												fontWeight: 900,
												color: "#78350F"
											},
											children: "nebo"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "Esc"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: "6px 0 0 0",
									fontWeight: 700,
									fontSize: "0.94rem",
									lineHeight: 1.35
								},
								children: [
									"Stisknutím klávesy ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "P" }),
									" (nebo ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Esc" }),
									") okamžitě ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "pozastavíte celou hru" }),
									". Při pauze si můžete v klidu prohlédnout svůj arzenál, úroveň a poškození zbraní, zbývající životy, počet zklidněných bubáků, nebo výpravu bezpečně ukončit a uložit získané krejcary do hospody. Opětovným stiskem ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "P" }),
									" se vrátíte přímo do boje!"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "12px 16px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									flexWrap: "wrap",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "1.2rem",
										fontWeight: 900,
										color: "#1E3A8A"
									},
									children: "🏃 Pohyb hrdiny po venkovské krajině"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "4px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "W"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "A"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "S"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "D"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												alignSelf: "center",
												fontWeight: 900,
												color: "#333",
												margin: "0 4px"
											},
											children: "nebo"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "↑"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "←"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "↓"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "keycap",
											children: "→"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "6px 0 0 0",
									fontWeight: 700,
									fontSize: "0.94rem",
									lineHeight: 1.35
								},
								children: "Pohybujte se po ladovských loukách, zasněžených cestách i hřbitovech. Vyhýbejte se přímému střetu se strašidly a udržujte si manévrovací prostor."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "12px 16px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										flexWrap: "wrap",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "1.2rem",
											fontWeight: 900,
											color: "#B91C1C"
										},
										children: "⚡ Zvláštní hrdinská schopnost (Ultimate)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "keycap keycap-wide",
										children: "Mezerník (Space)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: "6px 0 0 0",
										fontWeight: 700,
										fontSize: "0.94rem",
										lineHeight: 1.35
									},
									children: "Každý hrdina má jedinečnou mocnou schopnost, která se postupně nabíjí (při nabití se rozzáří ikona vpravo dole):"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									style: {
										margin: "6px 0 0 16px",
										padding: 0,
										fontWeight: 700,
										fontSize: "0.88rem",
										lineHeight: 1.4
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Poutník (Tulák):" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Pověstná sukovice" }),
											" – zatočí kolem sebe sukovitou holí, zraní a silně odhodí okolní bubáky a nepřátele ve větší vzdálenosti vystraší na 4 s (o 30 % nižší cooldown 21 s)."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pasáček:" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Prásknutí bičem" }),
											" – bleskový výpad s vysokým zásahem."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Bába kořenářka:" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Bylinkové uklidnění mysli" }),
											" – okamžitě zažene strach, zvedne náladu a doplní kuráž lovce."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ponocný:" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Záře svaté lucerny" }),
											" – oslepí noční stíny a udělí plošné poškození."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kostelník:" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Hlahol farního zvonu" }),
											" – posvátný zvuk zažene pekelníky i kostlivce."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Babička a Barunka:" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Chléb se solí a vlídné slovo" }),
											" – zmrazí čas; působí buď jako ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Food" }),
											" (chléb nasytí) nebo ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Holy" }),
											" (vlídné slovo zažene démony) podle toho, proti čemu má daný bubák menší resist!"
										] })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "12px 16px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "1.2rem",
									fontWeight: 900,
									color: "#166534"
								},
								children: "🗡️ Automatický boj a zbraně (Survivors styl)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: "6px 0 0 0",
									fontWeight: 700,
									fontSize: "0.94rem",
									lineHeight: 1.35
								},
								children: [
									"Všechny vaše zbraně (povidlové buchty, osikový prut, česnek, svěcená voda, máselnice, koňský bič, ...)",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: " útočí na nepřátele zcela automaticky" }),
									"! Nemusíte mířit myší – vaším úkolem je taktický pohyb, sbírání krejcarů a správný výběr vylepšení při postupu na novou úroveň."
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "12px 16px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "1.2rem",
									fontWeight: 900,
									color: "#6D28D9"
								},
								children: "📱 Dotykové ovládání (Mobily a tablety)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: "6px 0 0 0",
									fontWeight: 700,
									fontSize: "0.94rem",
									lineHeight: 1.35
								},
								children: [
									"Na dotykových zařízeních se automaticky zobrazuje ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "virtuální joystick" }),
									" v levém dolním rohu pro plynulý pohyb a tlačítko pro spuštění schopnosti ⚡ vpravo dole. Pauzu vyvoláte kdykoliv horním tlačítkem ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "⏸️ Pauza" }),
									". Joystick můžete kdykoliv zapnout nebo vypnout tlačítkem v nabídce."
								]
							})]
						})
					]
				}),
				activeTab === "objective" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						maxHeight: "490px",
						overflowY: "auto",
						textAlign: "left",
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#FEF3C7",
								border: "3px solid #B45309",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: "0 0 6px 0",
									fontSize: "1.35rem",
									color: "#78350F"
								},
								children: "🐓 Hlavní cíl: Přežít noc až do ranního kuropění (5 minut)!"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: 0,
									fontWeight: 700,
									fontSize: "0.96rem",
									lineHeight: 1.4
								},
								children: [
									"Každá úroveň v Bubákově trvá přesně ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "5 minut (300 sekund)" }),
									" reálného času. Pokud vydržíte naživu, v 300. sekundě třikrát hlasitě ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "zakokrhá vesnický kohout" }),
									". S prvním ranním paprskem všechna strašidla ztratí svou moc, propadnou panice a rozutečou se! Úroveň je tím slavnostně vyhrána."
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: "0 0 8px 0",
									fontSize: "1.25rem",
									color: "#1E3A8A"
								},
								children: "⏳ Fáze noci – jak se stupňuje nebezpečí:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
									gap: "10px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#FFFDF5",
											border: "2px solid var(--ink)",
											borderRadius: "6px",
											padding: "8px 10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 900,
												color: "#C2410C"
											},
											children: "🌅 Podvečer (0:00 - 0:45)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "0.86rem",
												fontWeight: 700
											},
											children: "Začátek výpravy. Slabší strašidýlka (šotci, rarachové). Ideální čas na nasbírání prvních krejcarů a vylepšení."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#FFFDF5",
											border: "2px solid var(--ink)",
											borderRadius: "6px",
											padding: "8px 10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 900,
												color: "#7C2D12"
											},
											children: "🌇 Soumrak (0:45 - 1:30)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "0.86rem",
												fontWeight: 700
											},
											children: "Nastupují divoženky a kostlivci. Na zemi se začínají objevovat malované truhly a vyděšení chasníci."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#FFFDF5",
											border: "2px solid var(--ink)",
											borderRadius: "6px",
											padding: "8px 10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 900,
												color: "#312E81"
											},
											children: "🌑 Půlnoc (1:30 - 3:00)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "0.86rem",
												fontWeight: 700
											},
											children: "Husté šero, noční můry a stíny. Kolem 2. minuty zaútočí první nebezpečný Mini-boss dané krajiny!"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#FFFDF5",
											border: "2px solid var(--ink)",
											borderRadius: "6px",
											padding: "8px 10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontWeight: 900,
												color: "#991B1B"
											},
											children: "👹 Černá hodinka & Boss (3:00 - 4:45)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "0.86rem",
												fontWeight: 700
											},
											children: "Přichází hlavní vládce úrovně s unikátními útoky (mlýnské kameny, balvany, plameny, bumerang hlavy)."
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: "0 0 6px 0",
										fontSize: "1.25rem",
										color: "#166534"
									},
									children: "👑 Porážka velkých bossů & Záchrana dušiček"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: "0 0 8px 0",
										fontWeight: 700,
										fontSize: "0.94rem",
										lineHeight: 1.35
									},
									children: "V každé z 6 úrovní na vás čeká velký venkovský boss (Čert z Hrusického mlýna, Lesní Hejkal, Zkamenělý Obr, Prokletý Mlynář, Bezhlavý rytíř a Tříhlavý drak)."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontWeight: 800,
										fontSize: "0.9rem",
										color: "#78350F"
									},
									children: [
										"⭐ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Královská zkratka:" }),
										" Skolíte-li bosse úrovně, nejenže osvobodíte cenné lidské dušičky 🏺, ale rovnou se vám okamžitě odemkne další úroveň bez nutnosti plnit dílčí stopy v mlze!"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "var(--parchment)",
								border: "3px solid var(--ink)",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: "0 0 8px 0",
									fontSize: "1.25rem",
									color: "#2A170A"
								},
								children: "🧺 Co sbírat na venkovských loukách a cestách:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
									gap: "8px",
									fontSize: "0.88rem",
									fontWeight: 700
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KrejcarIcon, { size: "1.25em" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Krejcary:" }),
											" Trvalé mince pro rozvoj vesnice v hospodě."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HruskaIcon, { size: "1.25em" }),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Šťavnaté hrušky:" }),
											" Okamžitě zvednou náladu a doplní kuráž lovce (+15 až +25 kuráže)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"✨ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Zkušenostní jiskry:" }),
										" Plní ukazatel pro získání nové úrovně."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"🏺 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Hrnce s dušičkami:" }),
										" Osvobozují zakleté lidské duše."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"📦 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Malované truhly:" }),
										" Trojitý výběr zbraní a velká kupa krejcarů."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"🌾 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Chasníci v nesnázích:" }),
										" Zachraňte je pro štědrý krejcarový bonus."
									] })
								]
							})]
						})
					]
				}),
				activeTab === "tips" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						maxHeight: "490px",
						overflowY: "auto",
						textAlign: "left",
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#FEF3C7",
							border: "3px solid #B45309",
							borderRadius: "8px",
							padding: "14px 18px",
							color: "#111111",
							boxShadow: "3px 3px 0 var(--ink)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: "0 0 6px 0",
									fontSize: "1.35rem",
									color: "#78350F"
								},
								children: "🏘️ Hospoda U Černého kocoura – trvalý rozvoj vesnice Bubákov"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "0 0 8px 0",
									fontWeight: 700,
									fontSize: "0.94rem",
									lineHeight: 1.35
								},
								children: "Žádný sesbíraný krejcar nepřijde nazmar! Po každé výpravě navštivte hospodu a investujte do vesnických řemesel:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								style: {
									margin: "0 0 0 16px",
									padding: 0,
									fontWeight: 700,
									fontSize: "0.88rem",
									lineHeight: 1.4
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"⚒️ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kovárna mistra kováře:" }),
										" Zvyšuje trvalé poškození všech zbraní (+10 % za každou úroveň)."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"🥖 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pekárna babičky:" }),
										" Zvyšuje maximální počet životů vašeho lovce."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"🔔 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kostelní zvonice:" }),
										" Rozšiřuje dosah přitahování krejcarů a koláčů na dálku."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"🌿 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Bylinkářství báby kořenářky:" }),
										" Zrychluje běh a hbitost lovce."
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										"🍺 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pivovarská tekutá kuráž:" }),
										" Zajišťuje stálé posilování mysli a doplňování kuráže (+1 kuráž každých 5 sekund)!"
									] })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "var(--parchment)",
							border: "3px solid var(--ink)",
							borderRadius: "8px",
							padding: "14px 18px",
							color: "#111111",
							boxShadow: "3px 3px 0 var(--ink)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 8px 0",
								fontSize: "1.25rem",
								color: "#166534"
							},
							children: "🧠 Zlaté rady pro přežití nejtemnější noci:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								fontWeight: 700,
								fontSize: "0.9rem",
								lineHeight: 1.35
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"🔄 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nikdy nezůstávejte stát na místě:" }),
									" Pohybujte se v širokých elipsách kolem shluků bubáků. Zabráníte tím obklíčení rychlými šotky či divoženkami."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"🧄 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Kombinujte zbraně na dálku i na blízko:" }),
									" Česnekový věnec nebo máselnice vytvoří ochranný kruh kolem lovce, zatímco buchty, prak a osikový prut kosí vzdálené nepřátele."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"⏸️ ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nebojte se využívat pauzu [P]:" }),
									" Když je na obrazovce příliš mnoho projektilů nebo strašidel, stiskněte ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "P" }),
									". Zjistíte, kolik vám zbývá kuráže, kde se nachází cíl a naplánujete další manévr."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"🏆 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Plňte Syslovské výzvy v Síni slávy:" }),
									" Za splnění úkolů rychtáře (např. zahnání 100 vodníků nebo dosažení 3. minuty) získáte stovky extra krejcarů do pokladny."
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"👥 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Zkoušejte různé lovce:" }),
									" Pasáček je velmi rychlý, Kořenářka zvedá náladu bylinkami a Babička s Barunkou dokáží vlídným slovem zastavit čas!"
								] })
							]
						})]
					})]
				}),
				activeTab === "perf" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						maxHeight: "490px",
						overflowY: "auto",
						textAlign: "left",
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#FEF3C7",
								border: "3px solid #B45309",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										flexWrap: "wrap",
										gap: "12px",
										marginBottom: "8px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													style: {
														margin: 0,
														fontSize: "1.22rem",
														fontWeight: 900,
														color: "#92400E"
													},
													children: "⚡ Režim vysokého výkonu (Plynulý chod 60 FPS)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													style: {
														margin: "4px 0 0 0",
														fontSize: "0.92rem",
														fontWeight: 700,
														color: "#451A03"
													},
													children: "Optimální pro slabší počítače, starší notebooky nebo telefony. Snižuje strop nepřátel o ~40 % a omezuje částice, aby hra nikdy neztrácela rychlost."
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "lada-btn",
											style: {
												background: performanceMode ? "#16A34A" : "#78350F",
												color: "#FFFFFF",
												padding: "8px 20px",
												fontSize: "1rem"
											},
											onClick: () => {
												sound.coin();
												onTogglePerformanceMode?.(!performanceMode);
											},
											children: performanceMode ? "✅ ZAPNUTO (Plynulý)" : "⚪ VYPNUTO (Plný)"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#FEF3C7",
								border: "3px solid #B45309",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#111111",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										flexWrap: "wrap",
										gap: "12px",
										marginBottom: "8px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													style: {
														margin: 0,
														fontSize: "1.22rem",
														fontWeight: 900,
														color: "#92400E"
													},
													children: "📊 Ukazatel FPS a statistik na obrazovce"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													style: {
														margin: "4px 0 0 0",
														fontSize: "0.92rem",
														fontWeight: 700,
														color: "#451A03"
													},
													children: "Zobrazuje v levém horním rohu aktuální snímkovou frekvenci, čas vykreslení (ms), počet aktivních nepřátel, střel a částic."
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "lada-btn",
											style: {
												background: showPerfOverlay ? "#16A34A" : "#78350F",
												color: "#FFFFFF",
												padding: "8px 20px",
												fontSize: "1rem"
											},
											onClick: () => {
												sound.coin();
												onToggleShowPerfOverlay?.(!showPerfOverlay);
											},
											children: showPerfOverlay ? "✅ ZAPNUTO" : "⚪ VYPNUTO"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "rgba(40, 25, 15, 0.95)",
								border: "3px solid #D9A036",
								borderRadius: "8px",
								padding: "14px 18px",
								color: "#F3E9D2",
								boxShadow: "3px 3px 0 var(--ink)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: "0 0 8px 0",
										fontSize: "1.18rem",
										fontWeight: 900,
										color: "#FDE047"
									},
									children: "⚙️ Implementovaná technologická vylepšení motoru hry:"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									style: {
										margin: 0,
										paddingLeft: "20px",
										fontSize: "0.92rem",
										lineHeight: 1.5,
										fontWeight: 700,
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Blesková prostorová mřížka (Spatial Hash O(1)):" }),
												" Zásahy střel, švihy zbraní i aury hromničky a ponocného používají bezztrátový 32bitový číselný index bez alokací řetězců."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Hardware-akcelerovaný render barevných variant:" }),
												" Místo pomalých filtrů prohlížeče (ctx.filter) se sazoví rarášci, krvaví kostlivci a obrnění zbojníci tónují přímým GPU kompozitingem."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Okamžitý úklid poražených strašidel:" }),
												" Uprchlí nebo zklidnění bubáci po 2 sekundách či opuštění obrazovky uvolňují paměť a nezpomalují další vlny."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cirkulace vzdálených nepřátel:" }),
												" Zbloudilí nepřátelé v temnotě se automaticky přemisťují k okraji zorného pole, takže se neplýtvá výpočetním časem na prázdné kilometry."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tlumení záplavy číselných textů poškození:" }),
												" Rychlé plošné aury sjednocují mikropoškození, aby se netvořily stovky textů za sekundu."
											]
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "16px",
						display: "flex",
						justifyContent: "center",
						gap: "12px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						style: {
							padding: "10px 32px",
							fontSize: "1.15rem",
							background: "var(--blood-red)"
						},
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "Rozumím a vím, jak na to! ⚔️"
					})
				})
			]
		})
	});
};

export { ControlsModal };
