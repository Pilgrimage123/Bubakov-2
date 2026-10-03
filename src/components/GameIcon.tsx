import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { KrejcarIcon } from './KrejcarIcon';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';

function isBuchtaIcon(icon) {
	return icon === "czech_buchta" || icon === "🥟" || icon === "buns";
}
function isCoinIcon(icon) {
	return icon === "🪙" || icon === "coin" || icon === "krejcar" || icon === "coins";
}
export interface GameIconProps {
	icon: any;
	size?: string | number;
	className?: string;
	style?: any;
	[key: string]: any;
}

var GameIcon: React.FC<GameIconProps> = ({ icon, size = "1.2em", className = "", style = {} }) => {
	if (isBuchtaIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CzechBuchtaIcon, {
		size,
		className,
		style
	});
	if (isCoinIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KrejcarIcon, {
		size,
		className,
		style
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		style: {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			lineHeight: 1,
			fontSize: typeof size === "number" ? `${size}px` : size,
			...style
		},
		children: icon
	});
};

export { isBuchtaIcon, isCoinIcon, GameIcon };
