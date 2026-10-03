import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;

export interface KrejcarIconProps {
	size?: string | number;
	className?: string;
	style?: any;
	[key: string]: any;
}

var KrejcarIcon: React.FC<KrejcarIconProps> = ({ size = "1.15em", className = "", style = {} }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 36 36",
		width: size,
		height: size,
		className,
		style: {
			display: "inline-block",
			verticalAlign: "middle",
			flexShrink: 0,
			...style
		},
		"aria-label": "Krejcar (česká venkovská mince)",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
					id: "kcIconShadow",
					cx: "50%",
					cy: "50%",
					r: "50%",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#26170E",
						stopOpacity: "0.35"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#26170E",
						stopOpacity: "0"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "kcIconBevel",
					x1: "15%",
					y1: "15%",
					x2: "85%",
					y2: "85%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#FEF08A"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "35%",
							stopColor: "#F59E0B"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "70%",
							stopColor: "#D97706"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#78350F"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "kcIconFace",
					x1: "20%",
					y1: "15%",
					x2: "80%",
					y2: "85%",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#FFFBEB"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "25%",
							stopColor: "#FDE68A"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "60%",
							stopColor: "#F59E0B"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#B45309"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "kcIconLetter",
					x1: "0%",
					y1: "0%",
					x2: "100%",
					y2: "100%",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#78350F"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#451A03"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "18",
				cy: "32",
				rx: "14",
				ry: "3.5",
				fill: "url(#kcIconShadow)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "17",
				r: "14",
				fill: "url(#kcIconBevel)",
				stroke: "#1C140D",
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "17",
				r: "11.2",
				fill: "url(#kcIconFace)",
				stroke: "#92400E",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "17",
				r: "9.6",
				fill: "none",
				stroke: "#FDE68A",
				strokeWidth: "0.9",
				strokeDasharray: "1.2 1.6",
				opacity: "0.9"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 9 13 C 11 9, 16 7, 21 8 C 17 8.5, 12 11, 10 15 Z",
				fill: "#FFFFFF",
				opacity: "0.55"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 14.5 10.5 L 14.5 24.5 M 14.5 17.5 L 22.5 10.5 M 17 15.5 L 23 24.5",
				fill: "none",
				stroke: "#FEF08A",
				strokeWidth: "2.6",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				transform: "translate(0.6, 0.6)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 14.5 10.5 L 14.5 24.5 M 14.5 17.5 L 22.5 10.5 M 17 15.5 L 23 24.5",
				fill: "none",
				stroke: "url(#kcIconLetter)",
				strokeWidth: "2.5",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "9.5",
				cy: "10.5",
				r: "1.2",
				fill: "#FFFFFF",
				opacity: "0.9"
			})
		]
	});
};

export { KrejcarIcon };
