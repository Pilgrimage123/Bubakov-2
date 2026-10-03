import React from 'react';

/** Small allocation-free helpers for the frame loop. */
function distanceSq(ax, ay, bx, by) {
	const dx = ax - bx;
	const dy = ay - by;
	return dx * dx + dy * dy;
}
function isInView(x, y, radius, left, top, right, bottom) {
	return x + radius >= left && x - radius <= right && y + radius >= top && y - radius <= bottom;
}

export { distanceSq, isInView };
