import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

var ResetProgressModal = ({ isOpen, onClose, onConfirmReset }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overlay",
		style: {
			zIndex: 50,
			background: "rgba(25, 12, 8, 0.88)",
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
				maxWidth: "680px",
				width: "92%",
				background: "var(--wood-dark)",
				border: "5px solid #D1342B",
				boxShadow: "10px 10px 0px var(--ink), 0 0 35px rgba(209, 52, 43, 0.45)",
				padding: "24px 28px",
				textAlign: "left",
				color: "var(--parchment)",
				position: "relative"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaCardCorners, { variant: "callout" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "14px",
						marginBottom: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "2.5rem",
							lineHeight: 1
						},
						children: "⚠️"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: 0,
							color: "#F87171",
							fontSize: "1.85rem",
							letterSpacing: "1px",
							textShadow: "2px 2px 0px var(--ink)"
						},
						children: "VYMAZAT VEŠKERÝ POSTUP?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "4px 0 0 0",
							fontWeight: 800,
							fontSize: "0.96rem",
							color: "#FEF3C7"
						},
						children: "Tato akce vrátí celou hru zpět do výchozího stavu jako při prvním spuštění."
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "var(--parchment)",
						color: "var(--ink)",
						border: "3px solid var(--ink)",
						borderRadius: "8px",
						padding: "16px 20px",
						margin: "16px 0",
						boxShadow: "inset 0 0 10px rgba(0,0,0,0.08)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontWeight: 900,
							fontSize: "1.05rem",
							marginBottom: "10px",
							color: "#7F1D1D"
						},
						children: "Co všechno bude touto akcí uzamčeno a vynulováno:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						style: {
							margin: 0,
							paddingLeft: "22px",
							fontSize: "0.94rem",
							fontWeight: 700,
							lineHeight: 1.55
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Uzamčení hrdinů:" }), " Pasáček, Bába kořenářka, Ponocný, Pobožný kostelník i Babička budou znovu uzamčeni (postup 0 %). Zůstane pouze výchozí Poutník."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Uzamčení úrovní 2 až 6:" }), " Les u rybníka, Zimní Hrusice, Čertův mlýn, Zřícenina hradu i Dračí sluj se uzamknou. Bude přístupná pouze 1. úroveň."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Uzamčení 9 zbraní:" }), " Vidle, halapartna, cep, byliny, koule, koláč, brambor, včely i svěcená voda budou zamčeny. Zůstanou jen výchozí buchty, prut a hromnička."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vynulování vesnice & hospody:" }), " Všechny budovy (kamna, mlýn, strašák, hradby, pekárna, zvonice) a regenerace se vrátí na úroveň 0."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vynulování pokladny:" }), " Krejcary, zachráněné dušičky i zachránění chasníci budou vynulováni na nulu."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Bestiář a trofeje:" }), " Všechny záznamy o zahnadých příšerách a splněné trofeje se vymažou."] })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "rgba(239, 68, 68, 0.15)",
						border: "2px dashed #EF4444",
						borderRadius: "6px",
						padding: "10px 14px",
						color: "#FCA5A5",
						fontWeight: 800,
						fontSize: "0.88rem",
						marginBottom: "20px"
					},
					children: [
						"🛑 ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Upozornění:" }),
						" Tuto akci nelze vzít zpět! Všechny uložené herní milníky budou nenávratně ztraceny."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "12px",
						justifyContent: "flex-end",
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn btn-small",
						style: {
							background: "#4B5563",
							color: "#FFFFFF",
							border: "3px solid var(--ink)",
							margin: 0
						},
						onClick: () => {
							sound.coin();
							onClose();
						},
						children: "❌ Zrušit (Ponechat postup)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "lada-btn btn-small",
						style: {
							background: "#DC2626",
							color: "#FFFFFF",
							border: "3px solid var(--ink)",
							margin: 0,
							fontWeight: 900
						},
						onClick: () => {
							onConfirmReset();
						},
						children: "🗑️ Ano, vymazat veškerý postup"
					})]
				})
			]
		})
	});
};

export { ResetProgressModal };
