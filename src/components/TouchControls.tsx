import React, { useState, useEffect, useRef, useCallback } from 'react';
const import_react = React;
import * as jsxRuntime from 'react/jsx-runtime';
const import_jsx_runtime = jsxRuntime;

var TouchControls = ({ enabled, active, onMove, onStop, onTriggerUltimate, ultCooldown }) => {
	const zoneRef = (0, import_react.useRef)(null);
	const baseRef = (0, import_react.useRef)(null);
	const knobRef = (0, import_react.useRef)(null);
	const pointerIdRef = (0, import_react.useRef)(null);
	const baseCenterRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const zone = zoneRef.current;
		const base = baseRef.current;
		const knob = knobRef.current;
		if (!zone || !base || !knob) return;
		const resetJoystick = () => {
			pointerIdRef.current = null;
			knob.style.transform = "translate(0px, 0px)";
			base.classList.remove("active");
			base.style.left = "";
			base.style.top = "";
			base.style.bottom = "";
			onStop();
		};
		const handlePointerDown = (e) => {
			if (pointerIdRef.current !== null) return;
			pointerIdRef.current = e.pointerId;
			try {
				zone.setPointerCapture(e.pointerId);
			} catch {}
			const rect = base.getBoundingClientRect();
			const currentCenterX = rect.left + rect.width / 2;
			const currentCenterY = rect.top + rect.height / 2;
			if (Math.hypot(e.clientX - currentCenterX, e.clientY - currentCenterY) <= rect.width * .85) baseCenterRef.current = {
				x: currentCenterX,
				y: currentCenterY
			};
			else {
				const radius = rect.width / 2;
				const clampedX = Math.max(radius + 8, Math.min(window.innerWidth - radius - 8, e.clientX));
				const clampedY = Math.max(radius + 8, Math.min(window.innerHeight - radius - 8, e.clientY));
				base.style.left = `${clampedX - radius}px`;
				base.style.top = `${clampedY - radius}px`;
				base.style.bottom = "auto";
				baseCenterRef.current = {
					x: clampedX,
					y: clampedY
				};
			}
			base.classList.add("active");
			updateKnob(e.clientX, e.clientY);
		};
		const updateKnob = (clientX, clientY) => {
			const dx = clientX - baseCenterRef.current.x;
			const dy = clientY - baseCenterRef.current.y;
			const dist = Math.hypot(dx, dy);
			if (dist > 5) {
				const maxDist = 52;
				const clampedDist = Math.min(dist, maxDist);
				const angle = Math.atan2(dy, dx);
				const kx = Math.cos(angle) * clampedDist;
				const ky = Math.sin(angle) * clampedDist;
				knob.style.transform = `translate(${kx}px, ${ky}px)`;
				onMove(kx / maxDist, ky / maxDist, clampedDist / maxDist);
			} else {
				knob.style.transform = "translate(0px, 0px)";
				onMove(0, 0, 0);
			}
		};
		const handlePointerMove = (e) => {
			if (e.pointerId !== pointerIdRef.current) return;
			updateKnob(e.clientX, e.clientY);
		};
		const handlePointerUp = (e) => {
			if (e.pointerId === pointerIdRef.current) {
				try {
					zone.releasePointerCapture(e.pointerId);
				} catch {}
				resetJoystick();
			}
		};
		zone.addEventListener("pointerdown", handlePointerDown);
		zone.addEventListener("pointermove", handlePointerMove);
		zone.addEventListener("pointerup", handlePointerUp);
		zone.addEventListener("pointercancel", handlePointerUp);
		return () => {
			zone.removeEventListener("pointerdown", handlePointerDown);
			zone.removeEventListener("pointermove", handlePointerMove);
			zone.removeEventListener("pointerup", handlePointerUp);
			zone.removeEventListener("pointercancel", handlePointerUp);
		};
	}, [
		enabled,
		onMove,
		onStop
	]);
	if (!enabled) return null;
	const isReady = ultCooldown <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "touch-controls-container",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: zoneRef,
			className: "joystick-touch-zone",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: baseRef,
				className: "joystick-base",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "joystick-mark joy-mark-n",
						children: "▲"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "joystick-mark joy-mark-s",
						children: "▼"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "joystick-mark joy-mark-w",
						children: "◀"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "joystick-mark joy-mark-e",
						children: "▶"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: knobRef,
						className: "joystick-knob",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "joystick-knob-core" })
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `touch-action-btn ${isReady ? "ready" : "recharging"}`,
			onClick: onTriggerUltimate,
			onTouchStart: (e) => {
				e.preventDefault();
				onTriggerUltimate();
			},
			title: "Speciální schopnost lovce (⚡)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "touch-ult-icon",
				children: "⚡"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "touch-ult-label",
				children: isReady ? "BLESK!" : `${Math.ceil(ultCooldown)} s`
			})]
		})]
	});
};

export { TouchControls };
