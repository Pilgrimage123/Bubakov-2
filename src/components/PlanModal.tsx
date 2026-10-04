import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { ENEMY_POINTS } from '../constants';
import { sound } from '../audio';
import { WEAPONS } from '../data/weapons';
import { ENEMIES } from '../data/enemies';
import { ControlsModal } from './ControlsModal';
import { LEVEL_ORDER } from '../data/levelUnlocks';

var PlanModal = ({ isOpen, onClose, defaultTab = "plan" }) => {
	const [activeTab, setActiveTab] = (0, import_react.useState)(defaultTab);
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: { zIndex: 35 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				maxWidth: "880px",
				width: "95%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "📜 Plán změn a kronika Bubákova" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontWeight: 700,
						fontSize: "1rem",
						marginTop: "-6px",
						marginBottom: "14px",
						color: "var(--parchment)"
					},
					children: "Přehled všech provedených změn, kol vývoje a zápisků v kronice Bubákova."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-tabs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `tab-btn ${activeTab === "plan" ? "active" : ""}`,
						onClick: () => {
							setActiveTab("plan");
							sound.coin();
						},
						children: "🗺️ Plán kol změn (1.–16. kolo)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `tab-btn ${activeTab === "changelog" ? "active" : ""}`,
						onClick: () => {
							setActiveTab("changelog");
							sound.coin();
						},
						children: "📜 Zápisky z kroniky (Historie verzí)"
					})]
				}),
				activeTab === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						maxHeight: "450px",
						overflowY: "auto"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #15803D",
								color: "#000000",
								background: "#F0FDF4"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "16. KOLO ZMĚN (v16.0.0 – Samostatná obrazovka výběru výpravy předcházející výběru lovce)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#15803D",
										color: "#FFFFFF"
									},
									children: "Dokončeno & Aktivní"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										"🗺️ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vlastní obrazovka výběru výpravy (Krok 1):" }),
										" Výběr kraje/výpravy byl oddělen na samostatnou přehlednou obrazovku. Hráč vidí všech 6 úrovní s jejich atmosférou, monstry, ročním obdobím, bossem i výzvami k odhalení cesty. Zvolená výprava je přehledně potvrzena v dolním pruhu tlačítkem ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Pokračovat k výběru lovce ➔" }),
										"."
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										"🏹 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vyhrazená obrazovka výběru lovce (Krok 2):" }),
										" Po zvolení výpravy hráč přechází na čistou obrazovku výběru jednoho ze 6 lovců s živými animovanými ladovskými medailony a výbavou pro daný kraj. V záhlaví je neustále vidět zvolená výprava s možností vrátit se tlačítkem ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "⬅️ Zpět k výběru výpravy" }),
										"."
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #7C3AED",
								color: "#000000",
								background: "#F5F3FF"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "15. KOLO ZMĚN (v15.0.0 – Testovací mód Sandbox & Tlačítko Vymazat postup)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#7C3AED",
										color: "#FFFFFF"
									},
									children: "Dokončeno & Aktivní"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										"🧪 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Testovací mód (Sandbox):" }),
										" Možnost vybrat jakéhokoliv ze 6 lidových hrdinů (Poutník, Pasáček, Bába kořenářka, Ponocný, Kostelník, Babička a Barunka) na libovolné ze 6 úrovní bez nutnosti jejich odemykání. Navíc lze libovolně navolit libovolné startovní zbraně (včetně více zbraní najednou) a nastavit jejich úrovně od 1 až do 10 s rychlými předvolbami arzenálu!"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										"🗑️ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tlačítko Vymazat postup s potvrzovacím dialogem:" }),
										" Přímo v hlavní nabídce i v hospodě je přidáno tlačítko pro bezpečné vymazání postupu. Po potvrzení uzamkne všechny odemykatelné hrdiny, úrovně i zbraně a vrátí veškeré upgrady vesnice, pokladnu, dušičky i bestiář zpět na nulu."
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #1D4ED8",
								color: "#000000",
								background: "#EFF6FF"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "14. KOLO ZMĚN (v14.0.0 – Pauza klávesou P, tlačítko Ovládání hry & detailní průvodce venkovského lovce)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#1D4ED8",
										color: "#FFFFFF"
									},
									children: "Dokončeno & Aktivní"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⏸️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pauza klávesou P i Esc:" }),
											" Možnost kdykoliv během hraní stiskem klávesy ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "P" }),
											" (nebo ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Esc" }),
											") okamžitě pozastavit hru a bezpečně si odpočinout. V pauze se zobrazuje kompletní arzenál se statistikami poškození, čas přežití a možnost sečíst skóre do hospody. Opětovný stisk klávesy ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "P" }),
											" vrací lovce do boje."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🎮 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tlačítko Ovládání hry v hlavním menu i hospodě:" }),
											" Přímo v hlavní nabídce i v hospodě U Černého kocoura je nově umístěno výrazné modré tlačítko ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "🎮 Ovládání hry" }),
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📜 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Komplexní ilustrovaný průvodce ovládáním a cílem hry (ControlsModal):" }),
											"Detailní rozpis kláves (WASD, šipky, P, Mezerník), vysvětlení automatických útoků v ladovském survivors stylu, popis dotykového joysticku, přehled všech 5 fází noci až do ranního kuropění kohouta (300 s), tipy na přežití a návod k rozvoji vesnice a hospody."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #166534",
								color: "#000000",
								background: "#F0FDF4"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "13. KOLO ZMĚN (v13.0.0 – Úrovně 4–6, 10 nových monster, odemykání krajin & bossí mechaniky)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#166534",
										color: "#FFFFFF"
									},
									children: "Dokončeno & Aktivní ve hře"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🗺️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tři zbrusu nové ladovské úrovně (Úrovně 4–6):" }),
											" Rozšíření ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "GameLevelId" }),
											" z 1–3 na 1–6. Úroveň 4: Staré hamry a Čertův mlýn; Úroveň 5: Pustá Hláska a Zlenické podhradí; Úroveň 6: Dračí sluj pod Melechovskou skálou. Každá s vlastním ladovským motivem, počasím, atmosférou i dekorem."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"👹 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Velký Bestiář rozšířen na 42 druhů strašidel:" }),
											" Doplněno 10 nových lidových monster včetně kompletních Ladovských kreseb, statistik, slabin, předností, folklorního lore a nebezpečnosti: Zbojník z hamrů, Jiskřivec, Ohnivý pes, Bílá paní, Zbrojnoš, Prokletý Sněhulák, Noční můra a 3 titánští bossové."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⚔️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Unikátní interaktivní bossí útoky a mechaniky:" }),
											" Prokletý Mlynář vrhá rotující žulové mlýnské kameny, valí dravou povodňovou vlnu a oslepuje moučným oblakem; Bezhlavý rytíř metá svou odraženou hlavu jako bumerang; Tříhlavý líný Drak chrlí kužely plamene a způsobuje pád ostrých rampouchů ze stropu sluje."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🔐 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sekvenční odemykání všech 6 úrovní & Královská zkratka:" }),
											" Rozšířen ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "LEVEL_ORDER" }),
											" na [1, 2, 3, 4, 5, 6]. Postupné odhalování stop v mlze (0 %, 25 %, 50 %, 75 %, 100 %) nebo okamžité odemčení skolením bosse předchozí úrovně."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🎯 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vybalancovaný bodový systém dropů:" }),
											" Doplněny hodnoty ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "ENEMY_POINTS" }),
											" pro všech 10 nových monster (Zbojník 135, Jiskřivec 95, Ohnivý pes 175, Bílá paní 185, Zbrojnoš 290, Sněhulák 220, Noční můra 110, Prokletý Mlynář 5500, Bezhlavý rytíř 6800 a Tříhlavý drak 9900)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"👥 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nová družina hrdinů (Hrobník & Babička s Barunkou):" }),
											" Rozšíření sekvenční řady hrdinů o Hrobníka se svatou lucernou a lopatou a Babičku s Barunkou z Ratibořic přinášející vánkem vlídnosti záchranu celé vesnici."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #1D4ED8",
								color: "#000000",
								background: "#EFF6FF"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "12. KOLO ZMĚN (v12.0.0 – 100% kompletní offline hra i plná upravitelnost pro AI/Claude & Původní zdrojáky)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#1D4ED8",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📄 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Garance stoprocentně kompletního a soběstačného souboru:" }),
											"Stahovaný soubor hry (ať už jako ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".html" }),
											" nebo jako ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".txt" }),
											") obsahuje naprosto kompletní, 100% samostatnou hru připravenou nejen k okamžitému offline hraní, ale i k plnohodnotným úpravám libovolným vývojářem nebo AI modelem (Claude, GPT)!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🤖 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Čistý neminifikovaný kód & Příručka pro Claude:" }),
											"Kód v souboru již není nečitelný minifikovaný shluk. Všechny funkce, proměnné i datové struktury (",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "WEAPONS" }),
											", ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "ENEMY_TYPES" }),
											", ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "updateGame" }),
											") mají plná jména a na začátku souboru je podrobný návod pro Claude a programátory, jak do hry přidat nové monstrum, zbraň či upravit ladovský canvas renderer."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📦 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Všechny původní zdrojové kódy přímo v souboru (Embedded Source Tree):" }),
											"Soubor obsahuje kompletní strom 27 původních zdrojových souborů projektu (TypeScript, React, CSS) a utilitu ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "window.BUBAKOV.exportSources()" }),
											" pro okamžitý export celého projektu z konzole prohlížeče."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🎮 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Spuštění pouhým přejmenováním:" }),
											"Soubor ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "bubakov_hra_ladovska_edice.txt" }),
											" stačí přejmenovat na ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".html" }),
											" a otevřít v jakémkoliv prohlížeči zcela bez internetu a serveru."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #166534",
								color: "#000000",
								background: "#F0FDF4"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "11. KOLO ZMĚN (v11.0.0 – Vysoký kontrast písma, zásady designu & +80 % útok i zdraví nepřátel)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#166534",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"👁️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Zásada bezvadné viditelnosti a vysokého kontrastu písma:" }),
											"Do zásad designu hry (`DESIGN_PRINCIPLES.md`) bylo zakotveno neměnné pravidlo: Na vysokou viditelnost a bezvadný kontrast písma je vždy třeba dbát. Veškeré texty, štítky, čísla a popisy v celé aplikaci (v HUDu, panelech, Zbrojnici, Bestiáři, postupu lovců, úrovní i hospodě) mají zaručen ostrý kontrast: tmavý sytý inkoust na světlém pergamenu a jasné písmo se stínem na tmavém dřevě."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📜 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pergamenové destičky a orámování HUDu:" }),
											"Ukazatele času, fází dne, mincí, dušiček a počtu zahnadých nepřátel v horní liště HUDu dostaly samostatnou parchmentovou desku s tmavým inkoustovým orámováním, aby byl text bezchybně čitelný za všech fází dne (od jasného poledne až po temnou noc)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⚔️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Zvýšení útoku a zdraví všech nepřátel o 80 %:" }),
											"Všech 35 druhů ladovských běsů, vodníků, čertů, hejkalů i skalních obrů má trvale zvýšeno maximální zdraví (HP) i sílu útoku (damage) o plných 80 % pro náročnější a napínavější taktickou hratelnost!"
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #78350F",
								color: "#000000",
								background: "#FEF3C7"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "10. KOLO ZMĚN (v10.0.0 – Postupné odhalování strašidel v Bestiáři jako u lovců a úrovní)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#78350F",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📖 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pětistupňové odhalování strašidel (0 %, 25 %, 50 %, 75 %, 100 %):" }),
											"Všechna lidová strašidla a diblíci jsou v Bestiáři zpočátku zahaleni hustou mlhou s otazníkem (???). Postupným zaháněním v herních výpravách se odkrývají stopy v kronice: silueta a původ (25 %), slabiny a odměny v mincích (50 %), přednosti a rychlost pohybu (75 %) a při 100 % kompletní folklorní zápis s plnobarevnou Ladovskou ilustrací!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🎨 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vizuální fáze v kruhovém medailonu (Canvas filtry):" }),
											"Stejně jako u lovců se ilustrace strašidla vizuálně proměňuje z tajemného černého stínu s otazníkem (0 %), přes uhelnou siluetu (25 %), sépiový náčrt (50 %) a mystický závoj (75 %) až po plně oživenou animaci (100 %)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📊 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ukazatel výzkumu a přehled kroniky:" }),
											"Každé strašidlo má vlastní interaktivní teploměr výzkumu s milníky (0 %, 25 %, 50 %, 75 %, 100 %) a počítadlem zahnání. Horní lišta Bestiáře nově ukazuje celkový počet spatřených i zcela probádaných tvorů ze všech 32 druhů."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #065F46",
								color: "#000000",
								background: "#ECFDF5"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "9. KOLO ZMĚN (v9.0.0 – Postupné odhalování úrovní jako u lovců)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#065F46",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🕵️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Postupné odhalování nových úrovní (25 %, 50 %, 75 % a 100 %):" }),
											"Nové úrovně jsou na počátku zahaleny do neproniknutelné mlhy a tajemství (???). Postupným průzkumem se při 25 % odhalí první stopa, počasí a obrys krajiny, při 50 % zřetelná stezka, přední příšery a mini-bossové, při 75 % téměř celá mapa s odhalením hlavního bosse a při 100 % se brána úrovně trvale otevře!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⛓️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sekvenční řád průzkumu:" }),
											"Úroveň 3 (Ladovská zima na Melechově) čeká v pořadí, dokud není plně probádána a otevřena Úroveň 2 (Starý hřbitov a Hrusický hvozd)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"👑 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dvojí cesta k otevření (Královská zkratka vs. Průzkum):" }),
											"Každou úroveň lze otevřít buď postupným zaháněním stanoveného počtu potvor z předchozí úrovně, NEBO okamžitě skolením hlavního bosse (Pekelný Čert otevře 2. úroveň, Půlnoční Hejkal otevře 3. úroveň)!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📜 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Interaktivní pergamenový detail úrovně (Kronika průzkumu):" }),
											"Klepnutím na kartu zamčené či odemykané úrovně se zobrazí pergamenová kronika s ukazatelem zahnadých potvor, nápovědami k počasí, bossovi a přehledem milníků."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #1E3A8A",
								color: "#000000",
								background: "#EFF6FF"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "8. KOLO ZMĚN (v8.0.0 – Pauza hry s inventářem, blesk sv. Eliáše & mistrovské trofeje)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#1E3A8A",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⏸️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Pauza hry s přehledem výbavy („Odpočinek u milníku“):" }),
											" Kdykoliv během výpravy stiskněte klávesu ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Esc" }),
											" nebo ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "P" }),
											", či klepněte na tlačítko ⏸️ v horním rohu obrazovky. Zobrazí se pergamenové okno s kompletní inventurou nesených zbraní, jejich úrovněmi a popisem, statistikami přežití i možností bezpečně ustoupit do hospody."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⚡ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Bouřkový blesk svatého Eliáše:" }),
											" V nočních hodinách a při soumraku může do arény s burácivým hromem sjet posvátný blesk! Spálí shluk dotírajících strašidel a na okamžik ozáří temná ladovská pole."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🏆 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Mistrovské trofeje v Síni slávy:" }),
											" Získejte štědré odměny za odemčení 5 zbraní v kovářské dílně, shromáždění všech 4 hrdinů družiny, pokoření Skalního obra a přežití úderu blesku!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🔊 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Zvukový syntezátor pro hrom, pauzu a návrat do boje:" }),
											" Nové autentické procedurální zvukové efekty Web Audio API pro atmosférický hromobití a přechody stavu."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid #E06D29",
								color: "#000000",
								background: "#FFF7ED"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "7. KOLO ZMĚN (v7.0.0 – Postupné odemykání zbraní & Zbrojnice)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "#E06D29",
										color: "#FFFFFF"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⛓️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Přísné sekvenční odemykání zbraní i lovců:" }),
											" Nový lovec se nikdy nezačne odemykat, dokud není plně odemčen lovec před ním (Poutník ➔ Pasáček ➔ Bába kořenářka ➔ Ponocný). Stejné pravidlo platí pro zamčené zbraně v kovářské dílně (Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"⚔️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Uzamčení zbraní kromě Osikového prutu a Povidlových buchet:" }),
											" Všech 9 ostatních zbraní je na začátku uzamčeno a postupně se odemyká plněním tematických výzev kováře. Kovář začne pracovat na nové zbrani teprve po ukování předchozí."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🕵️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Třístupňové odhalování identity zbraní (25 %, 50 %, 75 %):" }),
											"Zbraně začínají jako tajemné siluety v kouři (???). Při 25 % se odhalí první stopa a část názvu, při 50 % detailní skica s poškozením a mechanikou, při 75 % téměř ukovaná zbraň a při 100 % se trvale zařadí do výběru vylepšení na nové úrovni!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🗡️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nová interaktivní Zbrojnice a Arzenál Bubákova:" }),
											" Přehledné okno zbrojnice s filtry (všechny, odemčené, uzamčené), živými počítadly zahnadých cílových potvor pro každou zbraň a pergamenovým detailem odhalování."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid var(--mustard)",
								color: "#000000",
								background: "#FFFBEB"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "6. KOLO ZMĚN (v6.0.0 – Postupné odemykání lovců & stopy)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									style: {
										background: "var(--mustard)",
										color: "var(--ink)"
									},
									children: "Dokončeno"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🔒 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Uzamčení lovců kromě Poutníka:" }),
											" Poutník je výchozím hrdinou. Pasáček, Bába kořenářka i Ponocný jsou zpočátku zahaleni tajemstvím a odemykají se splněním náročných tematických výzev (zahánění vybraných nepřátel z pastvin, rybníků a nočních stodol)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🕵️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Postupné odhalování identity (25 %, 50 % a 75 %):" }),
											"Identity lovců jsou na začátku skryty jako neprostupné stínové siluety (???). Při 25 % se odhalí první stopa a obrys postavy, při 50 % detailní uhelná kresba s odhalenou zbraní a při 75 % téměř plné barvy s odhalením jména a speciální schopnosti!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📊 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Interaktivní sledování postupu a cílových monster:" }),
											" Každá karta v nabídce zobrazuje ukazatel postupu s milníky 25 %, 50 %, 75 %, 100 % a přesný počet zahnadých cílových potvor. Kliknutím na zamčenou kartu se otevře pergamenová kronika s podrobnostmi výzvy."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "4px solid var(--leaf-green)",
								color: "#000000"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "5. KOLO ZMĚN (v5.0.0 – Dokončeno & aktivní)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									children: "Aktivní ve hře"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🗺️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Fáze 1 – Datově řízený arzenál a 32 lidových strašidel:"
											}),
											" Kompletní ladovský arzenál zbraní (Kynuté makové koláče, Horké brambory z popela, Včelí roj z úlu, Dřevěný cep na obilí, Kropenka se svěcenou vodou) a 32 strašidel rozčleněných do 8 folklorních kategorií."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"☀️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Fáze 2 – Cyklus Poledne až Půlnoc & Kuropění:"
											}),
											" Výslovné fáze dne v horním HUDu (Poledne, Odpoledne, Klekání & Soumrak, Hluboká noc, Půlnoční hodina, Kuropění). Atmosférické tónování oblohy. Přežijte 6 minut až do zakokrhání kohouta!"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🌭 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Fáze 3 – Jitrnice a čistá ekonomika mincí:"
											}),
											" Poctivé vesnické jitrnice (+30 HP) a pečené koláče (+15 HP) padající z nepřátel. Nominální mince: Krejcar (1 kr.), Stříbrňák (5 kr.), Tolar (15 kr.)."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📖 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Fáze 4 – Velký Bestiář a Síň slávy:"
											}),
											" Plně filtrovatelný bestiář se všemi 32 strašidly a rozšířená Síň slávy o nové venkovské trofeje s odměnami do trvalé pokladny."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🏘️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Fáze 5 – Bubákov jako místo (Rostoucí vesnice):"
											}),
											" Interaktivní vesnice s animovanými vinětami cechů, kde ochočená strašidla pomáhají péct chleba, strašit na polích, točit mlýnem a zpevňovat hradby."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "3px solid var(--wood-dark)",
								color: "#000000"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "4. KOLO ZMĚN (v4.4.0 – Dokončeno)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									children: "Aktivní ve hře"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"📯 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Postava Ponocný:"
											}),
											" Svatá záře lucerny nepřetržitě zraňuje blízká strašidla."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🐕 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Schopnost Noční roh & Voříšek:"
											}),
											" Zvuk rohu zažene strašidla v panice a věrný pes Voříšek kouše nepřátele."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🌲 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Boss Půlnoční Hejkal:"
											}),
											" Obří lesní titán obrostlý mechem s vlastním ukazatelem zdraví."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🏆 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Síň slávy a trofeje v hospodě:"
											}),
											" Stálé odměny za hrdinské činy."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🪓 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Kovaná halapartna:"
											}),
											" Drtivý sečný oblouk s vysokým odhozením."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "3px solid var(--wood-dark)",
								color: "#000000"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "3. KOLO ZMĚN (v4.3.0 – Dokončeno)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									children: "Aktivní ve hře"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"❄️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Zimní ladovská edice:"
											}),
											" Přepínač na zasněženou krajinu, chaloupky a sněhuláky."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"☃️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Sněhová koule:"
											}),
											" Mrazivá zbraň zpomalující nepřátele ledovým chladem."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🌪️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Zimní Meluzína:"
											}),
											" Rychlý větrný duch kroužící ve vánici."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🌾 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Záchrana chasníka Kuby:"
											}),
											" Spojenec s prakem v aréně."
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "plan-card",
							style: {
								border: "3px solid var(--wood-dark)",
								color: "#000000"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "plan-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: { color: "#000000" },
									children: "1. & 2. KOLO ZMĚN (v4.1.0 & v4.2.0 – Dokončeno)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-badge-done",
									children: "Aktivní ve hře"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "plan-items",
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🕹️ ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Virtuální dotykový joystick:"
											}),
											" Plovoucí dotykové ovládání pro mobily a tablety."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🌿 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Bába kořenářka:"
											}),
											" Léčivý bylinný dým a věnec Devatery kvítí."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"👹 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Boss Pekelný Čert:"
											}),
											" Vstup velkého čerta do arény."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										style: { color: "#000000" },
										children: [
											"🏺 ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#000000" },
												children: "Vodníkovy hrníčky dušiček:"
											}),
											" Osvobození duší přináší požehnání rychlosti."
										]
									})
								]
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "changelog-list",
					style: {
						maxHeight: "450px",
						overflowY: "auto",
						color: "#000000"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v16.0.0 – 16. kolo: Audit bestiáře a sjednocení počtu zbraní"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Audit bestiáře:"
									}),
									" Datový registr ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "ENEMIES" }),
									" obsahuje 49 položek. Rozdíl proti dřívějšímu údaji 42 není automaticky interpretován jako sedm nových základních druhů; zahrnuje také variantní/posílené nepřátele, např. Obrněného zbojníka a Červeného kostlivce."
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Sjednocení Zbrojnice:"
									}),
									" Celkový počet zbraní v UI se nově odvozuje přímo z registru ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "WEAPONS" }),
									". Aktuálně je registrováno 12 zbraní, takže počítadlo už nemůže zůstat na pevné hodnotě 11."
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v15.0.0 – 15. kolo: Testovací mód Sandbox & Tlačítko Vymazat postup"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#000000" },
									children: "Testovací mód (Sandbox):"
								}), " Nový dedikovaný režim s volným přístupem ke všem 6 lidovým hrdinům i všem 6 úrovním. Umožňuje libovolný výběr zbraní ze všech 12 typů s volitelným nastavením jejich úrovní od 1 až do 10 a rychlými předvolbami arzenálu."]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#000000" },
									children: "Tlačítko Vymazat postup s potvrzením:"
								}), " Možnost vymazat uložená data v prohlížeči, čímž se zamkne veškerý odemykatelný obsah (hrdinové, zbraně, úrovně) a všechny upgrady vesnice se vrátí na úroveň 0."]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v13.0.0 – 13. kolo: Úrovně 4–6, 10 nových lidových monster, odemykání krajin & unikátní mechaniky bossů"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Tři zbrusu nové ladovské úrovně (Úrovně 4–6):"
									}), " Přidána Úroveň 4: Staré hamry a Čertův mlýn (horké výhně, náhon, točící se mlýnské lopatky a padající moučný prach), Úroveň 5: Pustá Hláska a Zlenické podhradí (chmurná gotická zřícenina, kamenné hradby a noční stíny) a Úroveň 6: Dračí sluj pod Melechovskou skálou (mrazivá ledová jeskyně, sněhová vánice a spící drak)."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "10 nových lidových monster (Bestiář má 42 druhů):"
									}), " Do hry vstoupili Zbojník z hamrů, Jiskřivec z kovadliny, Ohnivý pes, Bílá paní z hlásky, Zbrojnoš s těžkým štítem, Prokletý Sněhulák, Noční můra a trojice velkých bossů – Prokletý Mlynář, Bezhlavý rytíř a Tříhlavý líný Drak, včetně kompletních Ladovských kreseb, slabin, statistik i lore."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Unikátní bossí útoky a mechaniky v enginu:"
									}), " Prokletý Mlynář vrhá valící se žulové mlýnské kameny, vyvolává dravé povodňové vlny a oslepující moučné mraky; Bezhlavý rytíř vrhá svou odraženou hlavu jako bumerang; Tříhlavý líný Drak chrlí ohnivé kužely a shazuje z klenby jeskyně ostré ledové rampouchy."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Sekvenční odemykání 6 úrovní & Královská zkratka:"
									}), " Každá nová úroveň má vlastní zadání výzvy, procentuální postup (0 %, 25 %, 50 %, 75 %, 100 %) i možnost okamžitého odemčení skolením bosse předchozí úrovně."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "Bodový systém dropů pro nová monstra:"
										}),
										" Přesně vyladěné hodnoty ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "ENEMY_POINTS" }),
										" pro dropy truhel, jitrnic, koláčů, mincí a dušiček pro všech 10 nových monster."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Nová družina hrdinů (Hrobník & Babička s Barunkou):"
									}), " Doplnění Hrobníka (lopata a posvátná lucerna) a Babičky s Barunkou z Ratibořic (vlídné slovo a chléb se solí) do sekvenčního odemykacího řádu hrdinů."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v12.0.0 – 12. kolo: 100% kompletní offline hra i plná upravitelnost pro AI (Claude) a programátory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "Garance celistvosti pro hraní i úpravy (Claude & vývojáři):"
										}),
										" Závazně zakotveno v ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "DESIGN_PRINCIPLES.md" }),
										" i v kódu. Soubory ke stažení (HTML i TXT) obsahují kompletní offline hru a veškeré náležitosti pro snadné rozšiřování novým obsahem."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Neminifikovaný čistý kód & Vývojářská příručka:"
									}), " Běhový kód v souboru již není nečitelný spletenec. Všechny proměnné a funkce mají plná jména a v záhlaví souboru je podrobný návod pro Claude a programátory, kde najít a jak přidat zbraň, monstrum, bosse či upravit ladovský canvas renderer."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "Plné původní zdrojové kódy přímo v souboru (Embedded Source Tree):"
										}),
										" Uvnitř souboru je zabaleno všech 27 původních TypeScript/React souborů v JSON bloku ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "bubakov-source-tree" }),
										" s konzolovou exportní utilitou ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "window.BUBAKOV.exportSources()" }),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "Snadné offline hraní:"
										}),
										" Stažený ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".txt" }),
										" soubor stačí přejmenovat na ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: ".html" }),
										" a spustit v libovolném internetovém prohlížeči kdekoliv bez sítě."
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v11.0.0 – 11. kolo: Zásady designu, dokonalý kontrast písma & +80 % útok i zdraví nepřátel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Zásada bezvadné viditelnosti textu:"
									}), " Formálně zapsáno do zásad designu: „Na vysokou viditelnost a bezvadný kontrast písma je vždy třeba dbát!“ Přísný zákaz slabého kontrastu a vybledlých textů v jakémkoliv stavu."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Kontrastní pergamenové podložky a orámování HUDu:"
									}), " Všechny texty v HUDu, lištách a panelech mají zajištěn stoprocentní kontrast i při přechodu z denního světla do půlnoční tmy."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "+80 % zdraví a útok všech nepřátel:"
										}),
										" Všech 35 monster v souboru ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "enemies.ts" }),
										" bylo posíleno o 80 % (HP i útočné číslo damage) pro náročnější výpravy."
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v10.0.0 – 10. kolo: Postupné odhalování strašidel v Bestiáři jako u lovců a úrovní"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Postupné zkoumání 32 lidových strašidel (0 %, 25 %, 50 %, 75 %, 100 %):"
									}), " Strašidla, která hráč dosud neporazil, jsou v bestiáři zahalena rouškou tajemství (???). Postupnými zářezy se v kronice odhalují jejich slabiny, přednosti, odměny a přesné statistiky."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Postupná vizualizace v kresbě:"
									}), " Obrazovka kreslí strašidlo podle fáze průzkumu – od stínu s otazníkem (0 %), přes uhelnou kresbu (25 %) a sépiový náčrt (50 %) až po plnobarevný Ladovský medailon."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Počítadla výzkumu:"
									}), " Zobrazení celkového počtu spatřených a 100% probádaných tvorů přímo v záhlaví Bestiáře."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v9.0.0 – 9. kolo: Postupné odhalování úrovní jako u lovců"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Progresivní odhalování mapy (25 %, 50 %, 75 %, 100 %):"
									}), " Úrovně 2 a 3 jsou zpočátku zahaleny mlhou a tajemstvím. Splněním tematických milníků (nebo poražením bosse) se odhalují názvy, indicie, počasí, přední příšery i hlavní bossové."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Královská zkratka i postupné zářezy:"
									}), " Porážka Pekelného Čerta v 1. úrovni okamžitě na 100 % zpřístupní Starý hřbitov; porážka Půlnočního Hejkala ve 2. úrovni okamžitě zpřístupní Ladovskou zimu na Melechově. Pro nováčky se mapa otevírá postupným zaháněním potvor!"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Interaktivní okno Kroniky úrovní:"
									}), " Klepnutím na kartu úrovně se otevře pergamen s postupem, cílovými potvorami a milníky."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v8.0.0 – 8. kolo: Pauza hry, blesky sv. Eliáše, mistrovské trofeje a nové zvuky"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#000000" },
											children: "Pauza s inventářem výbavy („Odpočinek u milníku“):"
										}),
										" Stisknutím ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Esc" }),
										" / ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "P" }),
										" nebo klepnutím na tlačítko ⏸️ lze hru kdykoliv pozastavit, prohlédnout aktuální zbraně, jejich úrovně, poškození a statistiky, nebo bezpečně ukončit výpravu a sečíst skóre."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Bouřkový blesk svatého Eliáše:"
									}), " Příležitostný posvátný blesk za doprovodu burácivého hromu udeří do bojiště a sežehne zástupy bubáků."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Nové mistrovské trofeje:"
									}), " Síň slávy byla rozšířena o 4 nové výzvy: Mistr vesnické zbrojnice, Slavná vesnická družina, Pokořitel sázavského obra a Blesk svatého Eliáše."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Procedurální Web Audio efekty:"
									}), " Realistické ladění hromu, pozastavení a pokračování hry."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v7.0.0 – 7. kolo: Postupné odemykání zbraní a kovářská Zbrojnice"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Sekvenční odemykání zbraní:"
									}), " Zbraně (kromě Povidlových buchet a Osikového prutu) jsou na začátku uzamčeny a kovář na nich pracuje přísně postupně podle řady (Vidle ➔ Halapartna ➔ Cep ➔ Byliny ➔ Sněhová koule ➔ Koláč ➔ Brambor ➔ Včely ➔ Svěcená voda)."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Třístupňové odhalování identity:"
									}), " Milníky 25 %, 50 % a 75 % odhalují jméno, nákres zbraně i bojové statistiky."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Interaktivní Zbrojnice (Arzenál):"
									}), " Nové modální okno s filtry, přehlednými kartami a živými počítadly."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v6.0.0 – 6. kolo: Postupné sekvenční odemykání lovců a stopy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Sekvenční odemykání hrdinů:"
									}), " Poutník je výchozí, Pasáček se odemyká zaháněním vodníků a polednic, Bába kořenářka po Pasáčkovi a Ponocný jako vrcholný strážce noci."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Stínové siluety a uhelné kresby:"
									}), " Postupné odhalování podoby lovců v nabídce podle procentuálního postupu."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Pergamenový detail lovce:"
									}), " Možnost prohlédnout si cílové nepřátele a indicie pro každého zamčeného hrdinu."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v5.0.0 – 5. kolo: Velké rozšíření arzenálu, cyklus Poledne až Půlnoc a vesnice Bubákov"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Nový arzenál zbraní:"
									}), " Makový koláč, horký brambor, včelí roj, dřevěný cep a kropenka."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "32 lidových strašidel:"
									}), " Polednice, Klekánice, Divoženka, Skalní obr, Plivník, Šotek a další."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Cyklus dne a noci:"
									}), " Plynulý přechod od Poledne až po ranní Kuropění (6 minut přežití)."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Jitrnice a hrušky:"
									}), " Vzácné předměty na zemi obnovující zdraví."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Živá vesnice:"
									}), " Prohlížejte a rozšiřujte vesnici Bubákov přímo v hospodě."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Export hry (HTML i TXT):"
									}), " Možnost stažení kompletního HTML kódu hry do offline souboru .html i do textového formátu .txt pro snadné kopírování a zálohování."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v4.4.0 – Ponocný, Půlnoční Hejkal a Síň slávy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Ponocný s lucernou:"
									}), " Posvátná záře odhánějící a pálící noční havěť."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Troubení na roh & Voříšek:"
									}), " Zvuk rohu způsobí paniku a věrný pes Voříšek kouše nepřátele."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Půlnoční Hejkal:"
									}), " Lesní gigant s vlastním ukazatelem zdraví v aréně."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Síň slávy:"
									}), " Trvalé trofeje s odměnami v hospodské pokladně."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v4.3.0 – Zimní ladovská edice a záchrana chasníka"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Zimní krajina:"
									}), " Zasněžené chaloupky, ploty, sněhuláci a padající vločky."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Mrazivá sněhová koule:"
									}), " Zpomalování nepřátel v mrazu."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Zimní Meluzína:"
									}), " Rychlý větrný duch kroužící po bojišti."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Pomocník chasník Kuba:"
									}), " Bojuje prakem po vašem boku po osvobození."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v4.2.0 – Bába kořenářka a hrníčky dušiček"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Bába kořenářka:"
									}), " Léčivý bylinný dým, nůše na zádech a očistné kadidlo."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Devatery kvítí:"
									}), " Ochranný věnec bylin rotující kolem lovce."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									style: { color: "#000000" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#000000" },
										children: "Hrníčky dušiček:"
									}), " Osvobozování polapených duší s rychlostním bonusem."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: { color: "#000000" },
							children: "v4.1.0 – Dotykový joystick pro mobilní zařízení"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							style: { color: "#000000" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#000000" },
									children: "Virtuální joystick:"
								}), " Ergonomické 360° ovládání pro mobily i tablety."]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								style: { color: "#000000" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#000000" },
									children: "Dotyková tlačítka:"
								}), " Samostatné spouštění ultimátní schopnosti jedním klepnutím."]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { marginTop: "16px" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn",
						onClick: onClose,
						children: "Zavřít"
					})
				})
			]
		})
	});
};

export { PlanModal };
