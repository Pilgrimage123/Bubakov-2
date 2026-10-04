import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { KrejcarIcon } from './KrejcarIcon';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { JitrniceIcon } from './JitrniceIcon';
import { OsikovyPrutIcon } from './OsikovyPrutIcon';
import { HruskaIcon } from './HruskaIcon';
import { KynutyKolacIcon } from './KynutyKolacIcon';

function isBuchtaIcon(icon: any) {
	return icon === "czech_buchta" || icon === "🥟" || icon === "buns";
}
function isKolacIcon(icon: any) {
	return icon === "kynuty_kolac" || icon === "kolac" || icon === "kynuty_kolac_s_makem" || icon === "chodsky_kolac";
}
function isHruskaIcon(icon: any) {
	return icon === "hruska" || icon === "pear" || icon === "🍐" || icon === "hruška";
}
function isCoinIcon(icon: any) {
	return icon === "🪙" || icon === "coin" || icon === "krejcar" || icon === "coins";
}
function isJitrniceIcon(icon: any) {
	return icon === "jitrnice" || icon === "🌭" || icon === "sausage" || icon === "jaternice" || icon === "balzam";
}
function isOsikovyPrutIcon(icon: any) {
	return icon === "osikovy_prut" || icon === "cane" || icon === "🎋" || icon === "prut" || icon === "osika" || icon === "soaked_cane";
}
export interface GameIconProps {
	icon: any;
	size?: string | number;
	className?: string;
	style?: any;
	[key: string]: any;
}

var GameIcon: React.FC<GameIconProps> = ({ icon, size = "1.2em", className = "", style = {} }) => {
	if (isKolacIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KynutyKolacIcon, {
		size,
		className,
		style
	});
	if (isHruskaIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HruskaIcon, {
		size,
		className,
		style
	});
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
	if (isJitrniceIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JitrniceIcon, {
		size,
		className,
		style
	});
	if (isOsikovyPrutIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsikovyPrutIcon, {
		size,
		className,
		style,
		soaked: icon === "soaked_cane"
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

export { isBuchtaIcon, isKolacIcon, isHruskaIcon, isCoinIcon, isJitrniceIcon, isOsikovyPrutIcon, OsikovyPrutIcon, HruskaIcon, KynutyKolacIcon, GameIcon };
