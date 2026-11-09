export function resolveGingerbreadTier(
  sizeOrValue: string | number | undefined
): 'small' | 'large' | 'giant' {
  if (typeof sizeOrValue === 'number') {
    if (sizeOrValue >= 50) return 'giant';
    if (sizeOrValue >= 5) return 'large';
    return 'small';
  }
  if (sizeOrValue === 'giant') return 'giant';
  if (sizeOrValue === 'large') return 'large';
  return 'small';
}

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

/**
 * Tier 2: Slitý mandlový perníkový bochánek s bílou polevou (5–10 hodnot, 22 px, ADR 0047)
 */
export function drawGingerbreadLoafCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size = 22
): void {
  ctx.save();
  const s = size / 22;
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Vnější perníkový korpus bochánku
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = '#2B1204';
  ctx.lineWidth = 1.9;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pečený lesk kůrky
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(0, -1, 8.5, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Zvlněná bílá cukrová poleva po obvodu
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.8, 5.8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Mandlový plátek uprostřed (pražená mandle)
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.2, 2.2, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cukrové perličky po stranách
  ctx.fillStyle = '#FFFDF5';
  ctx.beginPath();
  ctx.arc(-6.5, 0, 0.8, 0, Math.PI * 2);
  ctx.arc(6.5, 0, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Tier 3: Královský marcipánový kůň se zlacením a jemnou svatozáří (50+ hodnot, 32 px, ADR 0047)
 */
export function drawGingerbreadHorseCanvas(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size = 32
): void {
  ctx.save();
  const s = size / 32;
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Jemná teplá svatozář zlaceného koníka
  ctx.save();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Perníkový korpus koníka (Ladovská lidová silueta koně)
  ctx.fillStyle = '#853D12';
  ctx.strokeStyle = '#2B1204';
  ctx.lineWidth = 2.2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Čumák koníka vpravo
  ctx.moveTo(11, -8);
  ctx.lineTo(14, -6);
  ctx.lineTo(13, -3);
  // Spodní čelist ke krku
  ctx.lineTo(8, -1);
  // Hruď a přední noha
  ctx.lineTo(7, 3);
  ctx.lineTo(7.5, 12);
  ctx.lineTo(4.5, 12);
  ctx.lineTo(4, 5);
  // Břicho
  ctx.lineTo(-3, 5);
  // Zadní noha
  ctx.lineTo(-3.5, 12);
  ctx.lineTo(-6.5, 12);
  ctx.lineTo(-6, 3);
  // Zadek a zvednutý ocas
  ctx.lineTo(-9, 1);
  ctx.lineTo(-13, -3);
  ctx.lineTo(-11, -5);
  ctx.lineTo(-7, -2);
  // Hřbet k sedlu
  ctx.lineTo(-2, -2);
  // Hříva a krk
  ctx.lineTo(2, -9);
  // Ucho
  ctx.lineTo(3, -12);
  ctx.lineTo(5, -9);
  // Čelo k čumáku
  ctx.lineTo(11, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pečený lesk
  ctx.fillStyle = '#9C4617';
  ctx.beginPath();
  ctx.ellipse(0, 1, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Zlacené marcipánové sedlo (gilded folk saddle)
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#2B1204';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.rect(-3.5, -2.5, 6.5, 5);
  ctx.fill();
  ctx.stroke();

  // Bílá cukrová ohlávka a postroj
  ctx.strokeStyle = '#FFFDF5';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(11, -7); ctx.lineTo(13, -3); // Ohlávka
  ctx.moveTo(3, -9); ctx.lineTo(7, -1);   // Hřídel
  ctx.moveTo(-3.5, 0); ctx.lineTo(-7, -1);// Podocasník
  ctx.stroke();

  // Cukrové tečky na hřívě
  ctx.fillStyle = '#FFFDF5';
  ctx.beginPath();
  ctx.arc(3.5, -7.5, 0.8, 0, Math.PI * 2);
  ctx.arc(1.5, -5.5, 0.8, 0, Math.PI * 2);
  ctx.arc(0, -3.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
