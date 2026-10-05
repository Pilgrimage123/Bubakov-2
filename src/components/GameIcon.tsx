import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;
import { KrejcarIcon } from './KrejcarIcon';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { JitrniceIcon } from './JitrniceIcon';
import { OsikovyPrutIcon } from './OsikovyPrutIcon';
import { HruskaIcon } from './HruskaIcon';
import { KynutyKolacIcon } from './KynutyKolacIcon';
import { OpravdovaKurazIcon } from './OpravdovaKurazIcon';
import { MedvediMastIcon } from './MedvediMastIcon';
import { OpravdovaKavaIcon } from './OpravdovaKavaIcon';
import { KrvaveJelitoIcon } from './KrvaveJelitoIcon';

function isKurazIcon(icon: any) {
	return icon === "medvedi_mast" || icon === "medvedimast" || icon === "mast" || icon === "opravdova_kuraz" || icon === "kuraz" || icon === "courage" || icon === "fist" || icon === "opravdovakuraz" || icon === "hrosi_kuze" || icon === "🥩";
}
function isKavaIcon(icon: any) {
	return icon === "opravdova_kava" || icon === "kava" || icon === "coffee" || icon === "cerna_kava" || icon === "☕";
}
function isJelitoIcon(icon: any) {
	return icon === "krvave_jelito" || icon === "jelito" || icon === "blood_sausage" || icon === "krvavejelito";
}
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
	if (isKurazIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedvediMastIcon, {
		size,
		className,
		style
	});
	if (isKavaIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpravdovaKavaIcon, {
		size,
		className,
		style
	});
	if (isJelitoIcon(icon)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KrvaveJelitoIcon, {
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

export { isBuchtaIcon, isKolacIcon, isHruskaIcon, isCoinIcon, isJitrniceIcon, isOsikovyPrutIcon, isKurazIcon, isKavaIcon, isJelitoIcon, OsikovyPrutIcon, HruskaIcon, KynutyKolacIcon, OpravdovaKurazIcon, MedvediMastIcon, OpravdovaKavaIcon, KrvaveJelitoIcon, GameIcon };
