/**
 * Vykreslení autentického českého perníkového srdíčka na Canvas 2D
 * Malé jednoduše bíle zdobené perníkové srdíčko (Ladovský styl)
 * Používá se pro plovoucí indikátor sebrání perníčku a herní renderer.
 */
export function drawGingerbreadHeartCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size = 18
): void {
  ctx.save();
  // Posun na střed ikony (střed tvaru srdce je mírně posunut vůči počátku)
  const s = size / 22;
  ctx.translate(cx, cy - 1.5 * s);
  ctx.scale(s, s);

  // Vnější perníkový podklad (teplá pečená medová barva s tmavým konturováním)
  ctx.fillStyle = '#853D12';
  ctx.strokeStyle = '#2B1204';
  ctx.lineWidth = 1.9;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Obrys malého perníkového srdíčka
  ctx.beginPath();
  ctx.moveTo(0, -4.5);
  ctx.bezierCurveTo(2.8, -10.5, 10.5, -8.5, 10.5, -1.8);
  ctx.bezierCurveTo(10.5, 3.8, 5, 8.2, 0, 12);
  ctx.bezierCurveTo(-5, 8.2, -10.5, 3.8, -10.5, -1.8);
  ctx.bezierCurveTo(-10.5, -8.5, -2.8, -10.5, 0, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Vnitřní medový lesk
  ctx.fillStyle = '#9C4617';
  ctx.beginPath();
  ctx.moveTo(0, -3.2);
  ctx.bezierCurveTo(2.2, -8.5, 8.5, -6.8, 8.5, -1.8);
  ctx.bezierCurveTo(8.5, 2.8, 4, 6.5, 0, 9.8);
  ctx.bezierCurveTo(-4, 6.5, -8.5, 2.8, -8.5, -1.8);
  ctx.bezierCurveTo(-8.5, -6.8, -2.2, -8.5, 0, -3.2);
  ctx.closePath();
  ctx.fill();

  // Vnitřní bílá cukrová linka
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(0, -2.2);
  ctx.bezierCurveTo(2, -6.8, 7.2, -5.2, 7.2, -1.2);
  ctx.bezierCurveTo(7.2, 2.5, 3.5, 5.8, 0, 8.8);
  ctx.bezierCurveTo(-3.5, 5.8, -7.2, 2.5, -7.2, -1.2);
  ctx.bezierCurveTo(-7.2, -5.2, -2, -6.8, 0, -2.2);
  ctx.stroke();

  // Bílé cukrové tečky na lalocích
  ctx.fillStyle = '#FFFDF5';
  ctx.beginPath();
  ctx.arc(-4.5, -4.8, 0.7, 0, Math.PI * 2);
  ctx.arc(-2.5, -6, 0.7, 0, Math.PI * 2);
  ctx.arc(2.5, -6, 0.7, 0, Math.PI * 2);
  ctx.arc(4.5, -4.8, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Středový cukrový motiv (spirálka / kvítek)
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(0, 0.8, 2, -0.2 * Math.PI, 1.4 * Math.PI);
  ctx.stroke();

  // Centrální bílé cukrové perličky
  ctx.fillStyle = '#FFFDF5';
  ctx.beginPath();
  ctx.arc(0, 0.8, 0.9, 0, Math.PI * 2);
  ctx.arc(0, 4.2, 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
