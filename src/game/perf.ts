/** Small allocation-free helpers for the frame loop. */
export function distanceSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function isInView(
  x: number,
  y: number,
  radius: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  return x + radius >= left && x - radius <= right &&
    y + radius >= top && y - radius <= bottom;
}
