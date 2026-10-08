import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { sound } from '../audio';
import { Lada } from '../render/ladaRenderer';
import { KrejcarIcon } from './KrejcarIcon';
import { VILLAGE_BUILDINGS } from '../data/village';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { t } from '../i18n';

var VillageView = ({ meta, onUpgrade, onClose }) => {
	const lang = meta?.currentLang || 'cs';
	const canvasRefs = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		let animId;
		let startTime = performance.now();
		const loop = (now) => {
			const elapsed = (now - startTime) / 1e3;
			VILLAGE_BUILDINGS.forEach((b) => {
				const c = canvasRefs.current[b.id];
				if (c) {
					const ctx = c.getContext("2d");
					if (ctx) {
						ctx.clearRect(0, 0, c.width, c.height);
						const drawer = Lada[b.canvasDrawer];
						if (typeof drawer === "function") drawer.call(Lada, ctx, c.width, c.height, elapsed);
					}
				}
			});
			animId = requestAnimationFrame(loop);
		};
		animId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(animId);
	}, []);
	const regenCost = 50 * ((meta.regenLevel || 0) + 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { marginTop: "10px" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "var(--parchment)",
					color: "var(--ink)",
					border: "4px solid var(--ink)",
					padding: "14px 20px",
					borderRadius: "8px",
					marginBottom: "16px",
					textAlign: "left",
					boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
					position: "relative"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaCardCorners, { variant: "callout" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						style: {
							margin: "0 0 8px 0",
							fontSize: "1.45rem",
							display: "flex",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "10px",
							color: "#111111"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "4px"
							},
							children: [
								"Hospodská pokladna:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#78350F" },
									children: meta.krejcary
								}),
								" ",
								"krejcarů ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KrejcarIcon, { size: 18 })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"🏺 Osvobozeno dušiček:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#1E40AF" },
								children: meta.totalSoulsSaved || 0
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontWeight: 700,
							fontSize: "0.95rem",
							color: "#111111"
						},
						children: "Každé vylepšení cechu rozšiřuje naši vesnici a trvale posílí vašeho lovce do všech nočních výprav!"
					})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaBotanicalFlourish, { height: 20 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "vignettes-grid",
				style: { gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))" },
				children: VILLAGE_BUILDINGS.map((b) => {
					const lvl = meta[b.levelKey] || 0;
					const cost = b.cost(lvl);
					const canAfford = meta.krejcary >= cost;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "vignette-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LadaCardCorners, { variant: "default", showBottomCorners: true }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: (el) => {
									canvasRefs.current[b.id] = el;
								},
								className: "vig-canvas",
								width: 300,
								height: 140
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 900,
									fontSize: "1.25rem",
									marginBottom: "4px",
									color: "#2A170A"
								},
								children: t(`building.${b.id}.name`, lang) || b.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "0.88rem",
									fontWeight: 900,
									color: "#78350F",
									marginBottom: "6px"
								},
								children: [t('village.helpers_label', lang) || "🤝 Pomocníci: ", t(`building.${b.id}.helpers`, lang) || b.helpers]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "0.92rem",
									fontWeight: 700,
									lineHeight: 1.25,
									minHeight: "44px",
									color: "#111111"
								},
								children: t(`building.${b.id}.story`, lang) || b.story
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "vignette-craft-action",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "vignette-level-badge",
									children: [
										"(Úr. ",
										lvl,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "vignette-bonus-desc",
									children: b.bonusDesc(lvl)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "vignette-buy-btn",
									disabled: !canAfford,
									onClick: () => {
										onUpgrade(b.levelKey, cost);
										sound.coin();
										sound.levelUp();
									},
									children: [
										`${t('ui.upgrade', lang)} (`,
										cost,
										")"
									]
								})]
							})
						]
					}, b.id);
				})
			})
		]
	});
};

export { VillageView };
