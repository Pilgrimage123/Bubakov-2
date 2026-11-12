/**
 * CANONICAL HOSPODA BOSS SHOWCASE (BATCH 1 — FIRST 6 BOSSES)
 *
 * Implements the 6 iconic Czech folk bosses in authentic Josef Lada gouache & India-ink style
 * per ADR-0047 (Boss Outline Hierarchy), ADR-0050 (Strachem nacpaný Barbucha),
 * ADR-0054 (Hospodský figurální kánon bossů), and ADR-0055 (Parita ukázkových bossů):
 *
 *   CORE ARENA RULE (ADR-0054 & ADR-0055):
 *   Enemies and bosses in the battle arena naturally NEVER sit on chairs/stools (štokrle)
 *   and NEVER drink beer from mugs unless specifically called for by their combat mechanics!
 *   All 6 bosses stand, walk, and fight in natural mobile combat postures using their hands:
 *
 *   1. Hastrman (Vodník — stojí a kráčí v pruhovaných punčochách a botách nad kaluží, v levé ruce fajfka se zlatou rybičkou a víčkem, v pravé ruce švihá vrbovým proutkem)
 *   2. Rusalka (Vodní víla — tančí bosýma nohama v čeřící se loužičce, leknínová koruna s orobincem, zlaté vlasy, rukama splétá vodní vír s rákosím)
 *   3. Koledující Bubák (Zelený bubák — kráčí na 4-prstých bosých tlapách, záplatované kraťasy na kšandách, puntíkovaný šátek, v jedné ruce lucerna, v druhé pletená pomlázka)
 *   4. Skalní Obr (Horský obr — okované škorně, ovčí kožich, skalní ramena s mechem, oběma rukama přirozeně svírá sukovitý dubový kyj, bez rušivých šipek)
 *   5. Mariášový Čert (Pekelný karbaník — levá lidská noha v pruhované punčoše a botě, pravá kozlí s kopytem, mariášové karty za pasem, přirozený obouruční útok pekelným trojzubcem)
 *   6. Strachem nacpaný Barbucha (Modrobílý dýmový duch dle ADR-0050 — divoké černé vlasy, vykulené oči, červené tváře, mrkvový nos, zubatá tlama a dýmové paže s rukama, jejichž prsty přecházejí v dlouhé černé drápy/žihadla vystřelující při útoku jako letící ostny)
 *
 * Strict performance & architectural guarantees:
 *   - 0 CanvasGradient allocations (createLinearGradient / createRadialGradient = 0)
 *   - shadowBlur = 0
 *   - Balanced ctx.save() / ctx.restore() stack depth
 *   - Horizontal orientation via ctx.scale(dir * scale, scale) where sy > 0 always
 */

const INK = '#1C1610';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function resolveShowcaseMotion(
  time: number,
  vx: number,
  attackInfo?: any,
  enemy?: any
) {
  const t = time > 10000 ? time * 0.001 : time;
  const rawVx = typeof enemy?.vx === 'number' ? enemy.vx : vx;
  const isWalking = Math.abs(rawVx) > 0.05;
  const isWindup = Boolean(
    attackInfo?.isWindup ||
      enemy?.isWindup ||
      (typeof attackInfo?.windupProgress === 'number' &&
        attackInfo.windupProgress > 0 &&
        !attackInfo?.isStrike) ||
      (typeof enemy?.windupTimer === 'number' && enemy.windupTimer > 0)
  );
  const isStrike = Boolean(
    attackInfo?.isStrike ||
      enemy?.isStrike ||
      (typeof attackInfo?.strikeProgress === 'number' && attackInfo.strikeProgress > 0) ||
      (typeof enemy?.strikeTimer === 'number' && enemy.strikeTimer > 0)
  );
  const isEnraged = Boolean(
    enemy?.enraged ||
      enemy?.isEnraged ||
      (typeof enemy?.hp === 'number' &&
        typeof enemy?.maxHp === 'number' &&
        enemy.maxHp > 0 &&
        enemy.hp <= enemy.maxHp * 0.5)
  );
  const attackProgress = clamp01(
    Number(
      attackInfo?.progress ??
        (isStrike ? attackInfo?.strikeProgress : attackInfo?.windupProgress) ??
        (isStrike || isWindup ? 0.75 : 0)
    )
  );
  return { t, isWalking, isWindup, isStrike, isEnraged, attackProgress };
}

/**
 * Helper to draw a 5-petal folk flower in Josef Lada gouache style (from LadaCoverScene.tsx).
 */
function drawFolkFlower2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  petalRadius: number,
  petalColor: string,
  centerColor: string,
  rotationRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationRad);
  ctx.fillStyle = petalColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    const px = Math.cos(ang) * (petalRadius * 0.68);
    const py = Math.sin(ang) * (petalRadius * 0.68);
    ctx.beginPath();
    ctx.arc(px, py, petalRadius * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, petalRadius * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a glistening crystal-blue teardrop water droplet with India ink outline,
 * vertical elongation support, surface tension stem, and specular highlights (from LadaCoverScene.tsx).
 */
function drawWaterDroplet2D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 2.6,
  stretch: number = 1.0,
  stemLength: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);

  if (stemLength > 0.4) {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = Math.max(0.9, size * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.45 * stretch);
    ctx.lineTo(0, -size * 1.45 * stretch - stemLength);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 1.45 * stretch);
    ctx.lineTo(-size * 0.1, -size * 1.45 * stretch - stemLength);
    ctx.moveTo(size * 0.25, -size * 1.45 * stretch);
    ctx.lineTo(size * 0.1, -size * 1.45 * stretch - stemLength);
    ctx.stroke();
  }

  ctx.fillStyle = '#38BDF8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.45 * stretch);
  ctx.quadraticCurveTo(size * 1.15, 0, 0, size * stretch);
  ctx.quadraticCurveTo(-size * 1.15, 0, 0, -size * 1.45 * stretch);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.38 * stretch, size * 0.62, size * 0.32 * stretch, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(-size * 0.26, -size * 0.18 * stretch, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.arc(size * 0.2, size * 0.48 * stretch, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders a physically realistic gravity-accelerated falling water drop (from LadaCoverScene.tsx).
 */
function drawRealisticDripCycle2D(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  groundY: number,
  timeVal: number,
  cycleDuration: number = 1.6,
  timeOffset: number = 0,
  dropScale: number = 2.4
): void {
  const rawT = ((timeVal + timeOffset) % cycleDuration + cycleDuration) % cycleDuration;
  const progress = rawT / cycleDuration;
  const fallDistance = groundY - originY;

  if (progress < 0.26) {
    const swell = progress / 0.26;
    const curSize = dropScale * (0.5 + 0.5 * swell);
    const hangY = originY + swell * 2.2;
    drawWaterDroplet2D(ctx, originX, hangY, curSize, 1.0 + swell * 0.25, swell * 1.8);
  } else if (progress < 0.82) {
    const fallT = (progress - 0.26) / (0.82 - 0.26);
    const fallEase = Math.pow(fallT, 1.75);
    const curY = originY + 2.2 + (fallDistance - 2.2) * fallEase;
    const speedStretch = 1.0 + fallT * 0.75;
    drawWaterDroplet2D(ctx, originX, curY, dropScale, speedStretch, 0);
  } else {
    const splashT = (progress - 0.82) / (1.0 - 0.82);
    const ringR = 2.5 + splashT * 12.0;
    const ringAlpha = Math.max(0, 1.0 - splashT);

    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha * 0.85})`;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.ellipse(originX, groundY, ringR, ringR * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (splashT > 0.15) {
      const innerT = (splashT - 0.15) / 0.85;
      const innerR = 1.5 + innerT * 7.5;
      const innerAlpha = Math.max(0, (1.0 - innerT) * 0.65);
      ctx.strokeStyle = `rgba(186, 230, 253, ${innerAlpha})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(originX, groundY, innerR, innerR * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (splashT < 0.55) {
      const bounce = Math.sin((splashT / 0.55) * Math.PI) * 3.6;
      ctx.fillStyle = '#38BDF8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(originX - 3.0, groundY - bounce * 0.8, 1.0, 0, Math.PI * 2);
      ctx.arc(originX + 2.8, groundY - bounce * 0.9, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Draws a multi-petal blooming white water-lily (leknín) with pointed snow-white petals
 * and a glowing golden-yellow stamen crown (from LadaCoverScene.tsx).
 */
function drawWaterLilyBlossom2D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  tiltRad: number = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);

  const backAngles = [-2.4, -1.85, -1.3, -0.75, -0.2];
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.35;
  for (const ang of backAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.32, 0);
    ctx.quadraticCurveTo(-radius * 0.42, -radius * 0.75, 0, -radius * 1.18);
    ctx.quadraticCurveTo(radius * 0.42, -radius * 0.75, radius * 0.32, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  const frontAngles = [-2.65, -2.1, -1.57, -1.05, -0.5, 0.05];
  ctx.fillStyle = '#FFFDF7';
  for (const ang of frontAngles) {
    ctx.save();
    ctx.rotate(ang + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.3, 0.5);
    ctx.quadraticCurveTo(-radius * 0.38, -radius * 0.6, 0, -radius * 1.0);
    ctx.quadraticCurveTo(radius * 0.38, -radius * 0.6, radius * 0.3, 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, -radius * 0.12, radius * 0.42, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EA580C';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * radius * 0.14, -radius * 0.18 - (1 - Math.abs(i) * 0.3) * 1.2, 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// 1. HASTRMAN (STOJÍCÍ A KRÁČEJÍCÍ VODNÍK V BOJOVÉ ARÉNĚ — BEZ ŠTOKRLETE)
// ============================================================================
export function drawHospodaHastrman(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  attackInfo?: any,
  enemy?: any
): void {
  const { t, isWalking, isWindup, isStrike, isEnraged, attackProgress } = resolveShowcaseMotion(
    time,
    vx,
    attackInfo,
    enemy
  );
  const enemyId = String(enemy?.id || enemy?.type || 'hastrman');
  const isBog = enemyId === 'kalny_hastrman';
  const isAutumn = enemyId === 'hastrman_podzimni';

  // Color palette variants (canonical emerald Hastrman vs bog/autumn variants)
  const coatFill = isBog ? '#365314' : isAutumn ? '#9A3412' : '#15803D';
  const coatDark = isBog ? '#1A2E05' : isAutumn ? '#7C2D12' : '#166534';
  const skinLight = isBog ? '#84CC16' : '#A3E635';
  const skinMid = isBog ? '#65A30D' : '#84CC16';
  const capMain = isAutumn ? '#D97706' : '#EF4444';
  const capBrim = isAutumn ? '#B45309' : '#DC2626';

  const dir = vx < 0 ? -1 : 1;
  const baseScale = (enemy?.sizeScale || 1) * 0.74;

  // Dynamic standing/striding kinematics (NO stool in battle arena!)
  const strideBobY = isWalking
    ? Math.abs(Math.sin(t * 9.0)) * -3.2
    : isStrike
      ? -3.5 * Math.sin(attackProgress * Math.PI)
      : Math.sin(t * 3.6) * 1.4;
  const hairWave = Math.sin(t * (isEnraged || isStrike ? 6.5 : 2.5)) * (isStrike ? 3.5 : 1.6);
  const pipeEmberGlow = isStrike
    ? 1.0
    : isWindup
      ? 0.65 + 0.35 * attackProgress
      : 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.4));
  const puffCheek = isWindup ? 0.85 : isStrike ? 1.0 : Math.max(0, Math.sin(t * 2.4)) * 0.65;

  // Sly eye-winking & mischievous squint calculation (from LadaCoverScene.tsx)
  const periodicWinkWave = Math.sin(t * 3.4) * Math.sin(t * 1.7);
  const microWink = periodicWinkWave > 0.62 ? (periodicWinkWave - 0.62) / 0.38 : 0;
  const nearEyeWink = panicked
    ? 0
    : isStrike
      ? 0.25
      : clamp01(Math.max(isWindup ? 0.75 : 0, microWink * 0.95));
  const farEyeSquint = panicked
    ? 0
    : clamp01(nearEyeWink * 0.65 + (isEnraged ? 0.45 : 0.15 * Math.sin(t * 4.2)));
  const pupilDartX = (isStrike ? 1.8 : 0.6) + Math.sin(t * 2.9) * 0.6;
  const pupilDartY = Math.cos(t * 2.3) * 0.45;
  const browWiggleY = (isEnraged ? -2.0 : nearEyeWink * 1.8) + Math.sin(t * 5.0) * 0.6;

  ctx.save();
  ctx.translate(x, y + strideBobY);
  ctx.scale(dir * baseScale, baseScale);
  // Center the Hastrman coordinate space at (0, 0)
  ctx.translate(-74, -68);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --------------------------------------------------------------------------
  // 1. SHIMMERING WATER PUDDLE BENEATH HIS STANDING BOOTS & DRIPPING COAT-TAIL
  // --------------------------------------------------------------------------
  ctx.fillStyle = isBog ? 'rgba(101, 163, 13, 0.34)' : 'rgba(56, 189, 248, 0.34)';
  ctx.strokeStyle = isBog ? '#3F6212' : '#0284C7';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(68, 142, isStrike ? 54 : 46, 6.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const rippleR1 = 3 + ((t * 15) % 18);
  const rippleAlpha1 = Math.max(0, 1 - rippleR1 / 20);
  ctx.strokeStyle = `rgba(56, 189, 248, ${rippleAlpha1 * 0.75})`;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(42, 142, rippleR1, rippleR1 * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();

  const rippleR2 = 2.5 + (((t * 15) + 8) % 18);
  const rippleAlpha2 = Math.max(0, 1 - rippleR2 / 20);
  ctx.strokeStyle = `rgba(186, 230, 253, ${rippleAlpha2 * 0.7})`;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.ellipse(86, 142, rippleR2, rippleR2 * 0.27, 0, 0, Math.PI * 2);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 2. TWO STANDING & STRIDING LEGS (BLUE BREECHES, RED CUFFS, STRIPED STOCKINGS & BOOTS)
  // --------------------------------------------------------------------------
  const legs = [
    { baseX: 60, phase: Math.PI, isBack: true },
    { baseX: 80, phase: 0, isBack: false },
  ];

  for (const leg of legs) {
    const stepSwingX = isWalking ? Math.cos(t * 9.0 + leg.phase) * 7.5 : 0;
    const stepLiftY = isWalking ? Math.max(0, Math.sin(t * 9.0 + leg.phase)) * -6.0 : 0;

    ctx.save();
    ctx.translate(stepSwingX, stepLiftY);

    // Royal-blue knee breeches (modré kalhoty pod kolena)
    ctx.fillStyle = leg.isBack ? '#1E40AF' : '#2563EB';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(leg.baseX - 8, 86);
    ctx.lineTo(leg.baseX + 9, 86);
    ctx.lineTo(leg.baseX + 8, 113);
    ctx.lineTo(leg.baseX - 6, 114);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red knee cuff (červená manžeta s knoflíkem)
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.rect(leg.baseX - 7, 111, 16, 4.5);
    ctx.fill();
    ctx.stroke();

    // Red-and-white horizontally striped stocking (červenobíle pruhovaná punčocha)
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.rect(leg.baseX - 5, 115.5, 11, 14.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.fillRect(leg.baseX - 4, 118.0, 9, 3.0);
    ctx.fillRect(leg.baseX - 4, 123.5, 9, 3.0);

    // Polished brown leather boot with upturned Ladovská toe & golden shine
    ctx.fillStyle = leg.isBack ? '#7C2D12' : '#9A3412';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(leg.baseX - 6, 128);
    ctx.lineTo(leg.baseX + 7, 127);
    ctx.lineTo(leg.baseX + 12, 134);
    ctx.quadraticCurveTo(leg.baseX + 26, 131, leg.baseX + 27, 139);
    ctx.quadraticCurveTo(leg.baseX + 26, 143, leg.baseX + 12, 142);
    ctx.lineTo(leg.baseX - 6, 142);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(leg.baseX + 20, 136, 4.0, 2.3, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Boot laces
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leg.baseX + 4, 129);
    ctx.lineTo(leg.baseX + 9, 127);
    ctx.moveTo(leg.baseX + 6, 132);
    ctx.lineTo(leg.baseX + 11, 130);
    ctx.stroke();

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 3. GOLDEN WAISTCOAT, WHITE COLLAR & BIG RED NECKERCHIEF BOW
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(64, 46);
  ctx.lineTo(84, 48);
  ctx.lineTo(86, 88);
  ctx.lineTo(62, 88);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  for (let b = 0; b < 4; b++) {
    ctx.beginPath();
    ctx.arc(78, 57 + b * 7.0, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(62, 40);
  ctx.lineTo(77, 45);
  ctx.lineTo(72, 50);
  ctx.lineTo(60, 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(73, 46, 5.2, 2.8, 0.35, 0, Math.PI * 2);
  ctx.ellipse(84, 49, 5.8, 3.0, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(77, 47);
  ctx.lineTo(75, 60);
  ctx.lineTo(81, 57);
  ctx.lineTo(79, 47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(78, 47, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. DARK EMERALD FROCK COAT WITH RED PIPING, POCKET FLAP & DRIPPING SWALLOWTAIL
  // --------------------------------------------------------------------------
  const tailSway = Math.sin(t * 4.2) * 2.5;
  ctx.fillStyle = coatFill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(56, 44);
  ctx.quadraticCurveTo(46, 68, 36 + tailSway * 0.5, 88);
  ctx.quadraticCurveTo(26 + tailSway, 104, 22 + tailSway, 118);
  ctx.quadraticCurveTo(30 + tailSway, 108, 34 + tailSway, 110);
  ctx.quadraticCurveTo(30 + tailSway, 122, 29 + tailSway, 132);
  ctx.quadraticCurveTo(39 + tailSway * 0.6, 118, 44, 116);
  ctx.quadraticCurveTo(54, 104, 62, 90);
  ctx.quadraticCurveTo(70, 74, 74, 58);
  ctx.lineTo(68, 44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(23 + tailSway, 117);
  ctx.quadraticCurveTo(30 + tailSway, 107, 34 + tailSway, 109);
  ctx.quadraticCurveTo(30 + tailSway, 121, 29 + tailSway, 131);
  ctx.quadraticCurveTo(39 + tailSway * 0.6, 117, 44, 115);
  ctx.quadraticCurveTo(54, 103, 61, 89);
  ctx.quadraticCurveTo(69, 73, 73, 58);
  ctx.lineTo(64, 54);
  ctx.lineTo(68, 45);
  ctx.stroke();

  ctx.fillStyle = coatDark;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(39, 83);
  ctx.lineTo(54, 86);
  ctx.lineTo(51, 95);
  ctx.lineTo(36, 91);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(37, 90);
  ctx.lineTo(50, 94);
  ctx.lineTo(53, 86);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  const coatButtons: [number, number][] = [
    [45, 89],
    [68, 63],
    [61, 84],
  ];
  for (const [bx, by] of coatButtons) {
    ctx.beginPath();
    ctx.arc(bx, by, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Water droplets dripping from swallowtail tips into floor puddle
  drawRealisticDripCycle2D(ctx, 22 + tailSway, 118, 142, t, 1.4, 0.0, 2.3);
  drawRealisticDripCycle2D(ctx, 29 + tailSway, 132, 142, t, 1.2, 0.5, 2.4);
  drawRealisticDripCycle2D(ctx, 43, 116, 142, t, 1.6, 0.9, 2.2);

  // --------------------------------------------------------------------------
  // 5. RIGHT ARM, 4-FINGERED WEBBED HAND & WILLOW SWITCH (VRBOVÝ PROUTEK)
  // --------------------------------------------------------------------------
  const whipAngle = isStrike
    ? 0.55
    : isWindup
      ? -0.85 * attackProgress - 0.25
      : Math.sin(t * 3.6) * 0.12;

  ctx.save();
  ctx.translate(58, 54);
  ctx.rotate(whipAngle);

  // Coat sleeve with red-piped cuff & brass button
  ctx.fillStyle = coatFill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.quadraticCurveTo(-8, 12, 4, 24);
  ctx.lineTo(14, 18);
  ctx.quadraticCurveTo(6, 8, 6, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(3, 22);
  ctx.lineTo(13, 16);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(7, 17, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Supple knotted willow switch (vrbový proutek s lístky a pentlí)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.quadraticCurveTo(28, 28, 48, 16);
  ctx.stroke();

  ctx.strokeStyle = '#65A30D';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(10, 22);
  ctx.quadraticCurveTo(28, 28, 48, 16);
  ctx.stroke();

  // Willow leaves & red folk ribbon at tip of switch
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  for (const [lx, ly, la] of [[28, 24, -0.4], [38, 21, 0.3], [48, 16, -0.2]]) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(la);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Red ribbon on willow switch
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(45, 17);
  ctx.quadraticCurveTo(52, 24, 49, 30);
  ctx.stroke();

  // 4-fingered lime-green hand gripping the willow switch
  ctx.fillStyle = skinMid;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(10, 22, 5.0, 3.6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skinLight;
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(12.5 + f * 0.6, 19.5 + f * 1.8, 3.0, 1.25, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // --------------------------------------------------------------------------
  // 6. LEFT FOREGROUND ARM, 4-FINGERED HAND & ORNATE PIPE WITH BRASS LID
  // --------------------------------------------------------------------------
  ctx.fillStyle = coatFill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(77, 47);
  ctx.quadraticCurveTo(88, 52, 98, 48);
  ctx.lineTo(103, 59);
  ctx.quadraticCurveTo(91, 66, 80, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(96, 48);
  ctx.lineTo(101, 59);
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(97, 48);
  ctx.lineTo(104, 46);
  ctx.lineTo(107, 57);
  ctx.lineTo(100, 59);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Curved brown pipe stem from mouth corner (88, 32) to bowl (105, 46)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(88, 32);
  ctx.quadraticCurveTo(98, 34, 105, 46);
  ctx.stroke();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(88, 32);
  ctx.quadraticCurveTo(98, 34, 105, 46);
  ctx.stroke();

  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(98, 37);
  ctx.lineTo(101, 35);
  ctx.stroke();

  // Ornate terracotta-red pipe bowl (hlavička fajfky)
  ctx.fillStyle = '#C2410C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(103, 45);
  ctx.quadraticCurveTo(103, 54, 110, 54);
  ctx.quadraticCurveTo(118, 54, 118, 39);
  ctx.lineTo(104, 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Fish relief emblem (zlatá rybička) on pipe bowl side
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.ellipse(111, 45.5, 3.6, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(107.5, 45.5);
  ctx.lineTo(105.5, 44);
  ctx.lineTo(105.5, 47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (pipeEmberGlow > 0.05) {
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.ellipse(111, 38.6, 5.2, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Domed hinged golden brass wind-cap (zlaté víčko fajfky)
  ctx.save();
  ctx.translate(104, 38.5);
  ctx.rotate(-pipeEmberGlow * 0.16);
  ctx.translate(-104, -38.5);
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(111, 39, 6.8, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillRect(103.5, 37.5, 15, 2.5);
  ctx.strokeRect(103.5, 37.5, 15, 2.5);
  ctx.beginPath();
  ctx.arc(111, 31.2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Curling blue-white smoke wisp & expanding smoke ring
  ctx.save();
  ctx.globalAlpha = 0.72 + pipeEmberGlow * 0.25;
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(110 + Math.sin(t * 4) * 1.5, 25, 4.2, 0, Math.PI * 2);
  ctx.arc(113 + Math.cos(t * 3.5) * 2, 18, 6.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isStrike || isWindup || pipeEmberGlow > 0.45) {
    const ringCycle = (t * 1.4) % 1;
    const rx = 116 + ringCycle * 18;
    const ry = 12 - ringCycle * 16;
    ctx.globalAlpha = Math.max(0.15, (1 - ringCycle) * 0.85);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 5 + ringCycle * 6, 2.5 + ringCycle * 3, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#F0FDF4';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 5 + ringCycle * 6, 2.5 + ringCycle * 3, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Hastrman's lime-green left hand with upright thumb & 4 fingers cradling pipe bowl
  ctx.fillStyle = skinMid;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(99, 52);
  ctx.quadraticCurveTo(98, 43, 101, 41);
  ctx.quadraticCurveTo(104, 41, 104, 47);
  ctx.lineTo(109, 49);
  ctx.lineTo(107, 58);
  ctx.lineTo(100, 57);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skinLight;
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(110.5 - f * 0.7, 49.5 + f * 2.4, 4.0, 1.45, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 7. LONG WAVY TWO-TONE GREEN HAIR LOCKS WITH DRIPPING WATER DROPLETS
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#16A34A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(52, 18);
  ctx.bezierCurveTo(36, 26, 28 + hairWave, 38, 18 + hairWave, 46);
  ctx.bezierCurveTo(28 + hairWave, 48, 36, 40, 46, 34);
  ctx.bezierCurveTo(32, 48, 26 + hairWave, 64, 21 + hairWave, 76);
  ctx.bezierCurveTo(32 + hairWave, 70, 42, 56, 54, 42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skinMid;
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.bezierCurveTo(48, 22, 42 + hairWave * 0.6, 42, 31 + hairWave, 58);
  ctx.bezierCurveTo(42 + hairWave * 0.5, 52, 48, 38, 58, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.moveTo(68, 14);
  ctx.bezierCurveTo(60, 28, 52, 46, 54, 60);
  ctx.bezierCurveTo(60, 50, 64, 34, 71, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, 21 + hairWave, 64, 115, t, 1.5, 0.2, 2.2);
  drawRealisticDripCycle2D(ctx, 22 + hairWave, 83, 142, t, 1.7, 0.7, 2.4);
  drawRealisticDripCycle2D(ctx, 32 + hairWave * 0.7, 68, 120, t, 1.6, 1.1, 2.0);
  drawRealisticDripCycle2D(ctx, 55, 65, 96, t, 1.8, 0.4, 2.1);

  // --------------------------------------------------------------------------
  // 8. EXPRESSIVE FACE, SHAVED STUBBLE, BULBOUS NOSE & SLYLY WINKING EYES
  // --------------------------------------------------------------------------
  ctx.fillStyle = skinLight;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(59, 28, 4.2, 5.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skinLight;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(68, 8);
  ctx.quadraticCurveTo(84, 6, 87, 18);
  ctx.quadraticCurveTo(91, 26, 90, 33);
  ctx.quadraticCurveTo(90, 41, 80, 41);
  ctx.quadraticCurveTo(66, 41, 64, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 10 shaved chin & jaw stubble dots
  ctx.fillStyle = '#14532D';
  const stubbleDots: [number, number][] = [
    [71, 33], [74, 35], [77, 37], [81, 38], [85, 37],
    [69, 36], [73, 38], [78, 39.5], [83, 39.5], [87, 35],
  ];
  for (const [sx, sy] of stubbleDots) {
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm rosy cheek blush with two crisp white shine dashes
  const cheekR = 4.6 + puffCheek * 1.4;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
  ctx.beginPath();
  ctx.ellipse(75, 25.5, cheekR, cheekR * 0.72, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(72.5, 24.5);
  ctx.lineTo(74.2, 23.8);
  ctx.moveTo(75.0, 24.8);
  ctx.lineTo(76.5, 24.2);
  ctx.stroke();

  // Far (right) eye peeking slyly over nose bridge
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(85.5, 15.5, 3.2, 4.2 * (1 - farEyeSquint * 0.65), 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (farEyeSquint < 0.75) {
    ctx.fillStyle = isEnraged ? '#DC2626' : INK;
    ctx.beginPath();
    ctx.arc(86.2 + pupilDartX * 0.5, 15.8 + pupilDartY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main near (left) eye with expressive sly wink & mischievous side-glance
  if (nearEyeWink > 0.52) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(78.5, 18.0, 4.6, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(78.5, 19.5, 3.8, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(73.5, 15.5);
    ctx.lineTo(70.5, 14.0);
    ctx.moveTo(73.2, 17.2);
    ctx.lineTo(70.0, 17.0);
    ctx.moveTo(73.8, 18.8);
    ctx.lineTo(71.0, 20.0);
    ctx.stroke();
  } else {
    const openScaleY = panicked ? 1.2 : 1 - nearEyeWink * 0.65;
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(78.5, 16.2, 4.6, 5.4 * openScaleY, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const px = 79.6 + pupilDartX * 0.75;
    const py = 16.5 + pupilDartY;
    ctx.fillStyle = isEnraged ? '#DC2626' : INK;
    ctx.beginPath();
    ctx.ellipse(px, py, panicked ? 1.8 : 2.5, (panicked ? 2.0 : 3.1) * openScaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(px - 1.0, py - 1.0 * openScaleY, 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(73.8, 19.5);
    ctx.quadraticCurveTo(78.5, 18.0 - nearEyeWink * 1.5, 82.8, 19.8);
    ctx.stroke();
  }

  // Thick arched eyebrow
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(71.5, 11.5 - browWiggleY * 0.5);
  ctx.quadraticCurveTo(77.5, 7.2 - browWiggleY, 83.0, 11.0 - browWiggleY * 0.4);
  ctx.stroke();

  // Prominent bulbous Ladovský lime-green nose with shiny tip & 3 freckle dots
  ctx.fillStyle = skinLight;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(84, 18);
  ctx.bezierCurveTo(99, 13, 103, 27, 90, 27);
  ctx.quadraticCurveTo(85, 27, 83, 24);
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = '#ECFCCB';
  ctx.beginPath();
  ctx.ellipse(94.5, 20.5, 3.2, 2.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3F6212';
  ctx.beginPath();
  ctx.arc(86.5, 20.5, 0.6, 0, Math.PI * 2);
  ctx.arc(88.5, 19.8, 0.6, 0, Math.PI * 2);
  ctx.arc(87.8, 21.8, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // High sly smile with deep laugh-dimple gripping pipe stem
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(74.5, 28.0);
  ctx.quadraticCurveTo(81.5, isStrike ? 34.5 : 32.5, 89.5, 31.8);
  ctx.stroke();

  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.arc(74.2, 27.8, 2.4, Math.PI * 0.65, Math.PI * 1.45);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 9. BRIGHT RED KNITTED CAP WITH FLUFFY POM-POM, MARIGOLDS & CATTAILS
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(52, 14);
  ctx.quadraticCurveTo(34, 14, 24, 25);
  ctx.quadraticCurveTo(36, 19, 52, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawRealisticDripCycle2D(ctx, 23, 27, 60, t, 1.8, 0.4, 2.2);

  // Cattail 1 (lower-left)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(52, 13);
  ctx.lineTo(29, -1);
  ctx.stroke();
  ctx.fillStyle = '#B45309';
  ctx.save();
  ctx.translate(36, 3.5);
  ctx.rotate(-2.55);
  ctx.beginPath();
  ctx.roundRect(-2.4, -6, 4.8, 12, 2.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Cattail 2 (upper-left)
  ctx.beginPath();
  ctx.moveTo(54, 10);
  ctx.lineTo(39, -9);
  ctx.stroke();
  ctx.fillStyle = '#9A3412';
  ctx.save();
  ctx.translate(45, -1.5);
  ctx.rotate(-2.25);
  ctx.beginPath();
  ctx.roundRect(-2.2, -5.5, 4.4, 11, 2.0);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Slouchy bright-red knitted cap dome
  ctx.fillStyle = capMain;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(49, 20);
  ctx.bezierCurveTo(44, 4, 62, -7, 79, -1);
  ctx.quadraticCurveTo(85, 2, 85, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(56, 14);
  ctx.quadraticCurveTo(58, 3, 66, -1);
  ctx.moveTo(65, 10);
  ctx.quadraticCurveTo(68, 1, 74, -1);
  ctx.stroke();

  // Rolled ribbed red brim
  ctx.fillStyle = capBrim;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(47, 22);
  ctx.quadraticCurveTo(64, 6, 86, 6);
  ctx.quadraticCurveTo(89, 10, 85, 12);
  ctx.quadraticCurveTo(66, 11, 51, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 6; r++) {
    const rx = 53 + r * 5.5;
    const ry = 21 - r * 2.3;
    ctx.beginPath();
    ctx.moveTo(rx, ry - 2);
    ctx.lineTo(rx + 1.5, ry + 2);
    ctx.stroke();
  }

  // Big fluffy red pom-pom
  ctx.fillStyle = capMain;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(59, -5, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(56, -7);
  ctx.lineTo(58, -5);
  ctx.moveTo(60, -8);
  ctx.lineTo(62, -6);
  ctx.moveTo(57, -3);
  ctx.lineTo(60, -3);
  ctx.stroke();

  // Two yellow marsh marigold flowers (žluté blatouchy) tucked into cap brim
  drawFolkFlower2D(ctx, 56, 12, 3.8, '#FACC15', '#EA580C', t * 0.4);
  drawFolkFlower2D(ctx, 61, 7, 3.4, '#FACC15', '#EA580C', -t * 0.4);

  ctx.restore();
}

// ============================================================================
// 2. RUSALKA (TANČÍCÍ VODNÍ VÍLA V ARÉNĚ — BEZ PIVNÍHO KORBELE)
// ============================================================================
export function drawHospodaRusalka(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  attackInfo?: any,
  enemy?: any
): void {
  const { t, isWalking, isWindup, isStrike, isEnraged, attackProgress } = resolveShowcaseMotion(
    time,
    vx,
    attackInfo,
    enemy
  );

  const dir = vx < 0 ? -1 : 1;
  const baseScale = (enemy?.sizeScale || 1) * 0.82;

  const swayY = isWalking
    ? Math.abs(Math.sin(t * 8.0)) * -2.6
    : Math.sin(t * 3.2) * 1.5;
  const hairSway = Math.sin(t * (isStrike || isEnraged ? 5.5 : 2.4)) * (isStrike ? 4.2 : 2.2);
  const songIntensity = isStrike ? 0.85 : isWindup ? 0.45 : 0;
  const headTiltRad = isStrike
    ? 0.14
    : isWindup
      ? -0.14 * attackProgress
      : Math.sin(t * 2.2) * 0.06;

  ctx.save();
  ctx.translate(x, y + swayY);
  ctx.scale(dir * baseScale, baseScale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --------------------------------------------------------------------------
  // 1. MULTI-LAYERED SHIMMERING WATER PUDDLE BENEATH HER BARE FEET
  // --------------------------------------------------------------------------
  const puddlePulse = Math.sin(t * 3.8) * 2.2;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.38)';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, 68, (isStrike ? 42 : 34) + puddlePulse, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.ellipse(3, 68, 22 + puddlePulse * 0.5, 4.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-4, 68.8, 14, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const rip1 = (t * 14) % 18;
  const ripAlpha1 = Math.max(0, 1 - rip1 / 20);
  ctx.strokeStyle = `rgba(56, 189, 248, ${ripAlpha1 * 0.75})`;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(8, 68, rip1, rip1 * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();

  const rip2 = ((t * 14) + 9) % 18;
  const ripAlpha2 = Math.max(0, 1 - rip2 / 20);
  ctx.strokeStyle = `rgba(186, 230, 253, ${ripAlpha2 * 0.7})`;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(-9, 68, rip2, rip2 * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#7DD3FC';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(33, 70.0, 5.5, 2.0, 0, 0, Math.PI * 2);
  ctx.ellipse(-31, 69.2, 6.5, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(18, 72.5, 3.8, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 2. BACK CASCADE OF LUSH WAVY GOLDEN-BLONDE HAIR & GREEN POND REEDS
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#4D7C0F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-16, -24);
  ctx.bezierCurveTo(-34, -14, -24 - hairSway, 6, -36 - hairSway, 20);
  ctx.bezierCurveTo(-30 - hairSway, 8, -24, -8, -13, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.moveTo(-18, -10);
  ctx.bezierCurveTo(-38 - hairSway, 4, -28 - hairSway, 28, -38 - hairSway * 1.2, 45);
  ctx.bezierCurveTo(-26 - hairSway, 30, -28, 8, -15, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Deep honey-gold under-layer of voluminous wavy hair
  ctx.fillStyle = '#CA8A04';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-2, -36);
  ctx.bezierCurveTo(-26, -30, -32 - hairSway, -6, -26 - hairSway, 14);
  ctx.bezierCurveTo(-35 - hairSway, 30, -24 - hairSway, 50, -29 - hairSway, 63);
  ctx.bezierCurveTo(-18 - hairSway, 56, -12, 38, -6, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main cascading S-curved golden-blonde hair waves
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(2, -38);
  ctx.bezierCurveTo(-20, -34, -26 - hairSway * 0.7, -14, -19 - hairSway * 0.8, 4);
  ctx.bezierCurveTo(-29 - hairSway, 18, -18 - hairSway, 36, -25 - hairSway, 54);
  ctx.bezierCurveTo(-14 - hairSway, 46, -16, 26, -8, 12);
  ctx.bezierCurveTo(-4, -4, -4, -20, 2, -38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Secondary bright sun-gold hair lock with curled tip
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-5, -28);
  ctx.bezierCurveTo(-18, -16, -11 - hairSway * 0.5, 2, -21 - hairSway * 0.8, 18);
  ctx.bezierCurveTo(-15 - hairSway * 0.6, 30, -22 - hairSway, 42, -17 - hairSway, 52);
  ctx.bezierCurveTo(-11 - hairSway * 0.5, 38, -13, 22, -7, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-12, -22);
  ctx.bezierCurveTo(-21, -10, -14 - hairSway * 0.6, 6, -22 - hairSway * 0.8, 22);
  ctx.moveTo(-16, -6);
  ctx.bezierCurveTo(-25 - hairSway * 0.5, 10, -17 - hairSway * 0.8, 28, -24 - hairSway, 44);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. GRACEFUL BARE LEGS & FEET STEPPING IN THE PUDDLE
  // --------------------------------------------------------------------------
  const legStep = isWalking ? Math.sin(t * 8.0) * 3.8 : 0;

  // Back leg (warm shaded peach)
  ctx.fillStyle = '#E59866';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(1, 32);
  ctx.quadraticCurveTo(2 - legStep * 0.4, 50, -1 - legStep, 65);
  ctx.lineTo(9 - legStep, 68);
  ctx.quadraticCurveTo(5 - legStep, 63, 4 - legStep * 0.5, 58);
  ctx.quadraticCurveTo(6, 44, 5, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front bare leg & dainty bare foot with toes (revealed through dress slit)
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(6, 26);
  ctx.quadraticCurveTo(9 + legStep * 0.4, 46, 4 + legStep, 64);
  ctx.quadraticCurveTo(2 + legStep, 68, 5 + legStep, 69);
  ctx.lineTo(17 + legStep, 69);
  ctx.quadraticCurveTo(20 + legStep, 67, 15 + legStep, 65);
  ctx.quadraticCurveTo(10 + legStep, 62, 10 + legStep * 0.5, 56);
  ctx.quadraticCurveTo(12, 42, 10, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(16 + legStep, 67.5);
  ctx.lineTo(13.5 + legStep, 67.2);
  ctx.moveTo(15 + legStep, 68.5);
  ctx.lineTo(12.5 + legStep, 68.2);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3B. RUSALKA'S FAR ARM & DELICATE HAND ON HIP
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#A7F3D0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(-9, -6, 6.0, 3.4, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 7.4;
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.quadraticCurveTo(-22, 4, -13, 14);
  ctx.stroke();

  ctx.strokeStyle = '#F7C59F';
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.quadraticCurveTo(-22, 4, -13, 14);
  ctx.stroke();

  drawRealisticDripCycle2D(ctx, -20, 9, 68, t, 1.6, 0.4, 2.0);

  // Back flowing skirt train in seafoam-aqua
  ctx.fillStyle = '#A7F3D0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.bezierCurveTo(-19, 14, -20, 42, -24, 67);
  ctx.lineTo(-14, 69);
  ctx.lineTo(-11, 58);
  ctx.lineTo(-6, 68);
  ctx.lineTo(0, 65);
  ctx.quadraticCurveTo(-3, 40, 2, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main fitted bodice & draped wet ice-blue skirt with side slit over front leg
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(11, -10);
  ctx.quadraticCurveTo(9, 0, 11, 10);
  ctx.quadraticCurveTo(16, 28, 18, 52);
  ctx.lineTo(14, 46);
  ctx.lineTo(12, 57);
  ctx.quadraticCurveTo(9, 38, 6, 22);
  ctx.quadraticCurveTo(4, 42, 1, 61);
  ctx.lineTo(-4, 52);
  ctx.lineTo(-8, 67);
  ctx.lineTo(-15, 66);
  ctx.bezierCurveTo(-16, 42, -18, 18, -8, 4);
  ctx.quadraticCurveTo(-6, -4, -6, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hand on hip with thumb & 4 slender peach fingers
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-12.5, 14.5, 3.8, 2.8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-13.5, 11.8, 2.1, 1.0, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(-9.4 - f * 0.4, 13.0 + f * 1.45, 2.6, 0.95, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Soft sky-blue wet fabric fold highlights & vertical drapery lines
  ctx.fillStyle = '#BAE6FD';
  ctx.beginPath();
  ctx.moveTo(4, 12);
  ctx.quadraticCurveTo(-4, 28, -6, 56);
  ctx.lineTo(-11, 62);
  ctx.quadraticCurveTo(-11, 32, -3, 10);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(7, 6);
  ctx.quadraticCurveTo(11, 24, 13, 44);
  ctx.moveTo(-1, 8);
  ctx.quadraticCurveTo(-6, 28, -7, 52);
  ctx.stroke();

  // Organic green pond-moss waist sash
  ctx.fillStyle = '#84CC16';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(10, 7);
  ctx.quadraticCurveTo(1, 12, -8, 22);
  ctx.lineTo(-5, 27);
  ctx.quadraticCurveTo(2, 17, 11, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm sun-kissed peach upper chest, neck & bare shoulder
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(9, -18);
  ctx.quadraticCurveTo(12, -13, 11, -8);
  ctx.quadraticCurveTo(4, -5, -4, -8);
  ctx.quadraticCurveTo(-5, -14, -1, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(2, -10, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Sweetheart ruffled wet neckline trim
  ctx.fillStyle = '#F0FDFA';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(12, -9);
  ctx.quadraticCurveTo(6, -5, -4, -8);
  ctx.lineTo(-3, -4);
  ctx.quadraticCurveTo(6, -2, 12, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. FOREGROUND ARM, ARTICULATED 4-FINGERED HAND & SWIRLING WATER-REED VORTEX
  //    (No beer mug in battle arena!)
  // --------------------------------------------------------------------------
  const shoulderX = 4;
  const shoulderY = -6;
  const handX = isStrike
    ? 32
    : isWindup
      ? 14 - 4 * attackProgress
      : 22 + Math.sin(t * 2.8) * 2.5;
  const handY = isStrike
    ? -10
    : isWindup
      ? -18 * attackProgress - 4
      : -4 + Math.cos(t * 2.8) * 2.5;
  const elbowX = (shoulderX + handX) * 0.5 + 2;
  const elbowY = Math.max(shoulderY + 12, handY + 9);

  // Foreground arm outline & warm peach skin fill
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8.0;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(elbowX, elbowY, handX, handY);
  ctx.stroke();

  ctx.strokeStyle = '#F7C59F';
  ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(elbowX, elbowY, handX, handY);
  ctx.stroke();

  // Translucent wet aqua off-shoulder sleeve ruffle
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(shoulderX + 7, shoulderY - 2);
  ctx.quadraticCurveTo(shoulderX, shoulderY - 6, shoulderX - 7, shoulderY - 1);
  ctx.lineTo(shoulderX - 5, shoulderY + 7);
  ctx.lineTo(shoulderX - 1, shoulderY + 4);
  ctx.lineTo(shoulderX + 2, shoulderY + 9);
  ctx.lineTo(shoulderX + 6, shoulderY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Swirling aquatic reed ribbon & water-vortex woven by her foreground hand
  const ribbonWave = Math.sin(t * 5.0) * 4.5;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(handX + 2, handY);
  ctx.bezierCurveTo(
    handX + 14,
    handY - 10 + ribbonWave,
    handX + 22,
    handY + 12 - ribbonWave,
    handX + (isStrike ? 38 : 26),
    handY + (isStrike ? -4 : 18)
  );
  ctx.stroke();

  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(handX + 2, handY);
  ctx.bezierCurveTo(
    handX + 14,
    handY - 10 + ribbonWave,
    handX + 22,
    handY + 12 - ribbonWave,
    handX + (isStrike ? 38 : 26),
    handY + (isStrike ? -4 : 18)
  );
  ctx.stroke();

  // Glistening water droplets orbiting her spellcasting hand
  drawWaterDroplet2D(ctx, handX + 14, handY - 6 + ribbonWave * 0.5, 2.3);
  drawWaterDroplet2D(ctx, handX + (isStrike ? 34 : 22), handY + 6 - ribbonWave * 0.5, 2.5);
  drawRealisticDripCycle2D(ctx, handX, handY + 4, 68, t, 1.5, 0.4, 2.2);

  // Delicate peach hand with thumb and 4 slender fingers weaving the water stream
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.ellipse(handX, handY, 4.2, 3.0, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Thumb
  ctx.beginPath();
  ctx.ellipse(handX + 1.2, handY - 3.0, 2.2, 1.0, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4 graceful fingers
  for (let f = 0; f < 4; f++) {
    const fAng = -0.35 + f * 0.22;
    const fx = handX + Math.cos(fAng) * 4.5;
    const fy = handY + Math.sin(fAng) * 4.5;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 2.6, 0.95, fAng, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 5. HEAD, CHARMING SIDE/THREE-QUARTER PROFILE & WATER-LILY CROWN
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -29);
  ctx.rotate(headTiltRad);

  // 5A. Two iconic brown Cattail Reeds (Orobinec / Doutníky) rising from back of crown
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-9, -12);
  ctx.quadraticCurveTo(-13, -24, -14, -36);
  ctx.stroke();
  ctx.fillStyle = '#9A3412';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-16.3, -33, 4.8, 12, 2.4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.quadraticCurveTo(-18, -20, -20, -30);
  ctx.stroke();
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.roundRect(-22.0, -27, 4.5, 10.5, 2.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5B. Warm Sun-Kissed Peach Face Profile
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(4, -14);
  ctx.quadraticCurveTo(13, -12, 13, -4);
  ctx.quadraticCurveTo(17.5, -2.5, 16.5, 0.5);
  ctx.quadraticCurveTo(15, 1.8, 13.5, 2.0);
  ctx.quadraticCurveTo(15, 4.5, 13.5, 7.5);
  ctx.quadraticCurveTo(12.5, 11.5, 6, 11.5);
  ctx.quadraticCurveTo(-3, 11.5, -6, 4);
  ctx.quadraticCurveTo(-8, -6, 4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#9A3412';
  ctx.beginPath();
  ctx.arc(14.5, 0.3, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Rosy coral-pink cheek blush with white highlight dashes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(7.5, 3.8, 4.2, 2.8, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(8.5, 2.5);
  ctx.lineTo(7.2, 2.0);
  ctx.moveTo(6.5, 2.8);
  ctx.lineTo(5.3, 2.3);
  ctx.stroke();

  if (songIntensity > 0.3 || panicked) {
    ctx.fillStyle = '#BE123C';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(11.5, 5.8, 2.8, 2.6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(14.2, 4.6);
    ctx.quadraticCurveTo(10.5, 6.2, 8.2, 3.8);
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(7.8, 3.6, 1.4, Math.PI - 1.1, Math.PI + 0.6);
    ctx.stroke();
  }

  // 5C. Large Enchanting Side-Profile Eye with 3 Sweeping Black Eyelashes
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(7.2, -3.2, 4.4, panicked ? 5.6 : 5.0, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isEnraged ? '#DC2626' : '#0284C7';
  ctx.beginPath();
  ctx.ellipse(8.6, -3.0, 2.7, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(9.0, -3.0, 1.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(7.8, -4.6, 1.15, 0, Math.PI * 2);
  ctx.arc(9.5, -1.6, 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(7.2, -3.2, 4.6, Math.PI * 1.05, Math.PI * 1.9);
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(4.0, -6.8);
  ctx.quadraticCurveTo(1.2, -8.8, 0.5, -7.5);
  ctx.moveTo(2.8, -4.8);
  ctx.quadraticCurveTo(-0.2, -6.0, -0.6, -4.5);
  ctx.moveTo(10.8, -6.2);
  ctx.quadraticCurveTo(12.5, -8.0, 11.5, -8.8);
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(11.5, -9.2);
  ctx.quadraticCurveTo(7.0, -12.2, 2.5, -8.8);
  ctx.stroke();

  // 5D. Golden Front Hair Wave Framing Forehead & Delicate Ear
  ctx.fillStyle = '#F7C59F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(-3.5, 2.5, 3.2, 2.4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(8, -14);
  ctx.quadraticCurveTo(-2, -16, -4, -5);
  ctx.quadraticCurveTo(-6, 1, -1, 5);
  ctx.quadraticCurveTo(-9, 4, -11, -3);
  ctx.quadraticCurveTo(-12, -13, 0, -16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5E. Notched Green Water-Lily Pads & 3 Blooming White Water-Lilies (Leknínová koruna)
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(9, -15, 6.5, 3.8, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.ellipse(1, -18, 7.5, 4.8, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.ellipse(-15, -6, 7.2, 4.8, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawWaterLilyBlossom2D(ctx, 9, -17, 4.8, 0.35);
  drawWaterLilyBlossom2D(ctx, -5, -16, 7.2, -0.18);
  drawWaterLilyBlossom2D(ctx, -12, -7, 5.4, -0.55);

  ctx.restore(); // end head transform

  // --------------------------------------------------------------------------
  // 6. GLISTENING CRYSTAL-BLUE WATER DROPLETS DRIPPING FROM HAIR & HEM
  // --------------------------------------------------------------------------
  drawRealisticDripCycle2D(ctx, -11, -12, 36, t, 1.4, 0.0, 2.2);
  drawRealisticDripCycle2D(ctx, -18 - hairSway * 0.5, 8, 68, t, 1.6, 0.5, 2.5);
  drawRealisticDripCycle2D(ctx, -13 - hairSway * 0.4, 28, 68, t, 1.5, 0.9, 2.1);
  drawRealisticDripCycle2D(ctx, -27 - hairSway, 52, 68, t, 1.3, 0.3, 2.3);
  drawRealisticDripCycle2D(ctx, 15, 54, 68, t, 1.7, 0.7, 2.2);
  drawRealisticDripCycle2D(ctx, -8, 65, 68, t, 1.2, 0.2, 2.4);

  ctx.restore();
}

// ============================================================================
// 3. KOLEDUJÍCÍ BUBÁK (KRÁČEJÍCÍ BUBÁK V ARÉNĚ — BEZ KORBELE A PIVNÍ PĚNY)
// ============================================================================
export function drawHospodaKoledujiciBubak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  attackInfo?: any,
  enemy?: any
): void {
  const { t, isWalking, isWindup, isStrike, isEnraged, attackProgress } = resolveShowcaseMotion(
    time,
    vx,
    attackInfo,
    enemy
  );
  const enemyId = String(enemy?.id || enemy?.type || 'koledujici_bubak');
  const hasBasket = enemyId === 'bubak_v_kosi';
  const isKominik = enemyId === 'kominik';

  const skinBase = isKominik ? '#65A30D' : '#84CC16';
  const skinBright = isKominik ? '#84CC16' : '#A3E635';

  const dir = vx < 0 ? -1 : 1;
  const baseScale = (enemy?.sizeScale || 1) * 0.82;

  const strideBobY = isWalking
    ? Math.abs(Math.sin(t * 9.0)) * -3.0
    : Math.sin(t * 3.6) * 1.4;

  // Smart facial animation drivers synchronized with combat states
  let jawOpen = 0.65 + 0.15 * Math.sin(t * 4.8);
  if (isStrike || isEnraged) {
    jawOpen = 1.0;
  } else if (isWindup) {
    jawOpen = 0.78 + 0.2 * Math.sin(t * 8.0);
  }
  const blinkPulse = (t % 3.7) > 3.54 ? Math.sin((((t % 3.7) - 3.54) / 0.16) * Math.PI) : 0;
  const eyeSquint = panicked ? 0 : isStrike ? 0.18 : blinkPulse * 0.85;
  const pupilShiftX = isStrike ? 1.8 : isWindup ? 1.6 : 1.1 + Math.sin(t * 2.2) * 0.7;
  const pupilShiftY = isStrike ? -1.4 : Math.cos(t * 2.6) * 0.6;
  const earWiggle = Math.sin(t * 6.5) * 0.07 + (isStrike ? 0.16 : 0);
  const browLift = (isStrike ? 2.6 : isWindup ? 1.8 : 0.8) + Math.sin(t * 5.2) * 0.7;
  const noseTwitchY = Math.sin(t * 8.5) * 0.6 - (isStrike ? 0.8 : 0);
  const tongueWagX = Math.sin(t * 7.2) * 2.0;
  const tongueCurlY = Math.cos(t * 5.6) * 1.2;
  const headTiltRad = isStrike
    ? 0.16
    : isWindup
      ? -0.14 * attackProgress
      : Math.sin(t * 2.4) * 0.05;

  ctx.save();
  ctx.translate(x, y + strideBobY);
  ctx.scale(dir * baseScale, baseScale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Optional wicker basket on back for 'bubak_v_kosi' variant
  if (hasBasket) {
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-28, -22, 18, 32, 4);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.3;
    for (let r = -16; r <= 4; r += 6) {
      ctx.beginPath();
      ctx.moveTo(-27, r);
      ctx.lineTo(-11, r);
      ctx.stroke();
    }
  }

  // --------------------------------------------------------------------------
  // 1. BIG BARE LIME-GREEN TROLL FEET WITH 4 TOES & YELLOWISH TOENAILS
  // --------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(28, 22, 16, 0.20)';
  ctx.beginPath();
  ctx.ellipse(2, 71, 26, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();

  const feetConfigs = [
    { legX: -10, footX: -12, fDir: -1, phase: 0 },
    { legX: 9, footX: 11, fDir: 1, phase: Math.PI },
  ];
  for (const fc of feetConfigs) {
    const stepLift = isWalking ? Math.max(0, Math.sin(t * 9.0 + fc.phase)) * -4.5 : 0;
    const stepShift = isWalking ? Math.cos(t * 9.0 + fc.phase) * 4.0 : 0;

    ctx.save();
    ctx.translate(stepShift, stepLift);

    ctx.fillStyle = skinBase;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(fc.legX - 4, 46);
    ctx.lineTo(fc.legX - 5, 65);
    ctx.lineTo(fc.legX + 5, 65);
    ctx.lineTo(fc.legX + 4, 46);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.ellipse(fc.footX + fc.fDir * 2, 67, 11.5, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let toe = 0; toe < 4; toe++) {
      const tx = fc.footX - 4 + toe * 3.8 + (fc.fDir > 0 ? 2 : -1);
      const ty = 67.5 + (toe === 1 || toe === 2 ? 0.8 : 0);
      ctx.fillStyle = skinBright;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 2.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(tx + fc.fDir * 0.4, ty + 0.6, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 2. PLUMP LIME-GREEN TORSO, POT-BELLY & RED SUSPENDERS
  // --------------------------------------------------------------------------
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-13, -11);
  ctx.quadraticCurveTo(-17, 4, -15, 18);
  ctx.quadraticCurveTo(2, 23, 17, 17);
  ctx.quadraticCurveTo(19, 3, 11, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = skinBright;
  ctx.beginPath();
  ctx.ellipse(3, 7, 9.5, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3F6212';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(4, 5, 5.5, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(5, 11, 1.6, 0, Math.PI * 1.65);
  ctx.stroke();

  // Red Suspenders (červené kšandy) with 4 silver metal buckles
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(-11, -10);
  ctx.lineTo(-6, -10);
  ctx.lineTo(-2, 18);
  ctx.lineTo(-7, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.lineTo(11, -10);
  ctx.lineTo(15, 17);
  ctx.lineTo(10, 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-8.5, -1, 6.2, 4.5);
  ctx.rect(-7.5, 12, 5.8, 6.5);
  ctx.rect(9.5, 2, 5.8, 4.5);
  ctx.rect(10.2, 11, 5.5, 6.2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. TATTERED BROWN BURLAP SHORTS WITH BLUE & RED STITCHED PATCHES
  // --------------------------------------------------------------------------
  ctx.fillStyle = isKominik ? '#334155' : '#B45309';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-17, 16);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-6, 17);
  ctx.lineTo(1, 14);
  ctx.lineTo(8, 17);
  ctx.lineTo(14, 14);
  ctx.lineTo(19, 17);
  ctx.quadraticCurveTo(21, 34, 18, 52);
  ctx.lineTo(14, 47);
  ctx.lineTo(11, 53);
  ctx.lineTo(7, 47);
  ctx.lineTo(3, 52);
  ctx.lineTo(1, 36);
  ctx.lineTo(-3, 53);
  ctx.lineTo(-7, 47);
  ctx.lineTo(-11, 54);
  ctx.lineTo(-15, 48);
  ctx.lineTo(-20, 52);
  ctx.quadraticCurveTo(-21, 34, -17, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, 18);
  ctx.lineTo(-6, 44);
  ctx.moveTo(4, 21);
  ctx.lineTo(6, 44);
  ctx.moveTo(13, 19);
  ctx.lineTo(14, 32);
  ctx.stroke();

  // Golden oval waist button
  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(5, 19, 3.0, 2.0, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blue cross-stitched fabric patch on left leg + torn green knee hole
  ctx.fillStyle = '#3B82F6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(-15, 24, 9.5, 9.5);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-17, 26);
  ctx.lineTo(-13, 26);
  ctx.moveTo(-17, 31);
  ctx.lineTo(-13, 31);
  ctx.moveTo(-7, 26);
  ctx.lineTo(-4, 26);
  ctx.moveTo(-7, 31);
  ctx.lineTo(-4, 31);
  ctx.stroke();

  ctx.fillStyle = skinBright;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-14, 39);
  ctx.lineTo(-9, 38);
  ctx.lineTo(-10, 43);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red cross-stitched fabric patch on right leg
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(6, 33, 9.5, 9.5);
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(4, 35);
  ctx.lineTo(8, 35);
  ctx.moveTo(4, 40);
  ctx.lineTo(8, 40);
  ctx.moveTo(14, 35);
  ctx.lineTo(17, 35);
  ctx.moveTo(14, 40);
  ctx.lineTo(17, 40);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. LEFT / BACK ARM HOLDING SWINGING BRASS LANTERN (MOSAZNÁ LUCERNA)
  // --------------------------------------------------------------------------
  ctx.strokeStyle = INK;
  ctx.lineWidth = 9.2;
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.lineTo(-27, 4);
  ctx.lineTo(-18, 14);
  ctx.stroke();

  ctx.strokeStyle = skinBase;
  ctx.lineWidth = 5.6;
  ctx.beginPath();
  ctx.moveTo(-13, -7);
  ctx.lineTo(-27, 4);
  ctx.lineTo(-18, 14);
  ctx.stroke();

  // Swinging brass lantern hanging from left hand
  const lanternSwing = Math.sin(t * 4.5) * 0.14;
  ctx.save();
  ctx.translate(-19, 15);
  ctx.rotate(lanternSwing);

  // Iron ring & lantern cap
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 2, 3.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.lineTo(6, 5);
  ctx.lineTo(8, 9);
  ctx.lineTo(-8, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing warm yellow lantern glass
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.rect(-6, 9, 12, 11);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.ellipse(0, 14.5, 2.6, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brass lantern base
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.rect(-7, 20, 14, 3.5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Left hand gripping lantern ring
  ctx.fillStyle = skinBright;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(-18, 14, 4.8, 3.8, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4B. FOREGROUND RIGHT ARM & BRAIDED WILLOW POMLÁZKA WITH RIBBONS (NO BEER MUG!)
  // --------------------------------------------------------------------------
  const whipRot = isStrike
    ? 0.55
    : isWindup
      ? -0.75 * attackProgress - 0.25
      : Math.sin(t * 3.4) * 0.08;
  const bubakShoulderX = 11;
  const bubakShoulderY = -5;
  const bubakHandX = isStrike ? 28 : isWindup ? 16 : 24;
  const bubakHandY = isStrike ? 2 : isWindup ? -14 : -4 + Math.sin(t * 3.4) * 2.0;
  const bubakElbowX = (bubakShoulderX + bubakHandX) * 0.5 + 4;
  const bubakElbowY = Math.max(bubakShoulderY + 12, bubakHandY + 9);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 9.0;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY, bubakHandX, bubakHandY);
  ctx.stroke();

  ctx.strokeStyle = skinBase;
  ctx.lineWidth = 5.6;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY, bubakHandX, bubakHandY);
  ctx.stroke();

  ctx.strokeStyle = skinBright;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(bubakShoulderX, bubakShoulderY - 1);
  ctx.quadraticCurveTo(bubakElbowX, bubakElbowY - 1, bubakHandX, bubakHandY - 1);
  ctx.stroke();

  // Bristly goblin arm hairs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  for (let h = 1; h <= 3; h++) {
    const u = h * 0.25;
    const hx = (1 - u) * (1 - u) * bubakShoulderX + 2 * (1 - u) * u * bubakElbowX + u * u * bubakHandX;
    const hy = (1 - u) * (1 - u) * bubakShoulderY + 2 * (1 - u) * u * bubakElbowY + u * u * bubakHandY;
    ctx.beginPath();
    ctx.moveTo(hx + 1, hy + 3);
    ctx.lineTo(hx + 4, hy + 7);
    ctx.stroke();
  }

  // Braided willow Easter switch (pletená vrbová pomlázka s barevnými pentlemi)
  ctx.save();
  ctx.translate(bubakHandX, bubakHandY);
  ctx.rotate(whipRot);

  // Braided willow rod
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.quadraticCurveTo(8, -14, 22, -32);
  ctx.stroke();

  ctx.strokeStyle = '#A16207';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.quadraticCurveTo(8, -14, 22, -32);
  ctx.stroke();

  // Crisscross willow braid lines
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  for (let b = 1; b <= 5; b++) {
    const bx = b * 3.8;
    const by = -b * 5.6;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by);
    ctx.lineTo(bx + 2, by - 2);
    ctx.stroke();
  }

  // Fluttering folk ribbons (červená, modrá, žlutá pentle) at tip of pomlázka
  const ribWave = Math.sin(t * 7.0) * 3.5;
  const ribbons: [string, number, number][] = [
    ['#EF4444', 10, -2],
    ['#3B82F6', 12, 4],
    ['#FACC15', 9, 9],
  ];
  for (const [rCol, rx, ry] of ribbons) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(22, -32);
    ctx.quadraticCurveTo(22 + rx * 0.5, -32 + ry + ribWave * 0.5, 22 + rx, -32 + ry + ribWave);
    ctx.stroke();

    ctx.strokeStyle = rCol;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(22, -32);
    ctx.quadraticCurveTo(22 + rx * 0.5, -32 + ry + ribWave * 0.5, 22 + rx, -32 + ry + ribWave);
    ctx.stroke();
  }

  ctx.restore();

  // Articulated 4-fingered green goblin hand gripping pomlázka handle
  ctx.fillStyle = skinBright;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(bubakHandX, bubakHandY, 4.8, 3.8, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(bubakHandX + 2.5, bubakHandY - 2.4 + f * 1.6, 2.2, 1.1, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 5. PLUMP LIME-GREEN GOBLIN NECK, COLLAR FOLDS & POLKA-DOT BANDANA
  // --------------------------------------------------------------------------
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, -9);
  ctx.quadraticCurveTo(-14, -18, -10, -26);
  ctx.quadraticCurveTo(0, -27, 10, -25);
  ctx.quadraticCurveTo(13, -17, 11, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#65A30D';
  ctx.beginPath();
  ctx.moveTo(-12, -9);
  ctx.quadraticCurveTo(-14, -18, -10, -26);
  ctx.lineTo(-5, -26);
  ctx.quadraticCurveTo(-7, -17, -7, -9);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(11, -9);
  ctx.quadraticCurveTo(13, -17, 10, -25);
  ctx.lineTo(6, -25);
  ctx.quadraticCurveTo(8, -17, 7, -9);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = skinBright;
  ctx.beginPath();
  ctx.ellipse(0, -17, 4.5, 6.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4D7C0F';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -21, 6.2, 0.25 * Math.PI, 0.75 * Math.PI);
  ctx.arc(0, -14, 7.8, 0.22 * Math.PI, 0.78 * Math.PI);
  ctx.stroke();

  // Blue Polka-Dot Bandana (puntíkovaný šátek)
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.quadraticCurveTo(0, -7, 13, -13);
  ctx.quadraticCurveTo(15, -6, 12, -4);
  ctx.quadraticCurveTo(0, 0, -13, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-12, -11);
  ctx.quadraticCurveTo(0, -5, 11, -10);
  ctx.stroke();

  ctx.strokeStyle = '#075985';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-9, -12);
  ctx.lineTo(-7, -7);
  ctx.moveTo(-4, -10);
  ctx.lineTo(-2, -5);
  ctx.moveTo(5, -10);
  ctx.lineTo(3, -5);
  ctx.moveTo(9, -11);
  ctx.lineTo(8, -7);
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(2, -5, 3.8, 3.0, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(2, -5, 2.0, -0.4, Math.PI * 0.8);
  ctx.stroke();

  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(-4, 0, -5, 6);
  ctx.lineTo(-1, 3);
  ctx.lineTo(2, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(3, -4);
  ctx.quadraticCurveTo(7, 1, 10, 6);
  ctx.lineTo(7, 2);
  ctx.lineTo(3, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFDF7';
  const bandanaDots: [number, number][] = [
    [-10, -11.5], [-5, -9.5], [0, -8.5], [5, -9.0], [9, -10.5],
    [-9, -7.5], [-4, -6.0], [5, -6.0], [9, -7.0],
    [-3, 2.0], [7, 2.5],
  ];
  for (const [dx, dy] of bandanaDots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // --------------------------------------------------------------------------
  // 6. SMARTLY ANIMATED HEAD, WILD SPIKY HAIR & EXPRESSIVE GOBLIN FACE
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -29);
  ctx.rotate(headTiltRad);

  // 6A. Wild Spiky Two-Tone Dark-Brown & Golden-Tan Hair Mane
  const hairSpikes = [
    { ang: -3.45, len: 24, col: '#451A03' },
    { ang: -3.15, len: 27, col: '#D97706' },
    { ang: -2.85, len: 29, col: '#451A03' },
    { ang: -2.55, len: 28, col: '#F59E0B' },
    { ang: -2.25, len: 30, col: '#451A03' },
    { ang: -1.95, len: 28, col: '#D97706' },
    { ang: -1.65, len: 29, col: '#451A03' },
    { ang: -1.35, len: 26, col: '#F59E0B' },
    { ang: -1.05, len: 25, col: '#451A03' },
    { ang: -0.75, len: 22, col: '#D97706' },
    { ang: -0.45, len: 19, col: '#451A03' },
  ];
  for (let i = 0; i < hairSpikes.length; i++) {
    const sp = hairSpikes[i];
    const flutter = Math.sin(t * 7.5 + i * 1.1) * (isStrike ? 0.08 : 0.03);
    const a = sp.ang + flutter;
    const tipX = Math.cos(a) * sp.len;
    const tipY = -4 + Math.sin(a) * sp.len;
    const perpX = -Math.sin(a) * 4.5;
    const perpY = Math.cos(a) * 4.5;

    ctx.fillStyle = sp.col;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(perpX, -4 + perpY);
    ctx.quadraticCurveTo(
      tipX * 0.55 + perpX * 0.6,
      -4 + (tipY + 4) * 0.55 - 3,
      tipX,
      tipY
    );
    ctx.quadraticCurveTo(
      tipX * 0.55 - perpX * 0.4,
      -4 + (tipY + 4) * 0.55 + 2,
      -perpX,
      -4 - perpY
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 6B. Huge Wiggling Jug Ears
  ctx.save();
  ctx.translate(14, -4);
  ctx.rotate(-earWiggle);
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(4, 0, 6.5, 9.0, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(4, 0.5, 4.0, 6.0, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(-15, -1);
  ctx.rotate(earWiggle);
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-5, 0, 7.8, 10.2, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.ellipse(-4.8, 0.5, 5.0, 7.0, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-4.5, 1, 2.8, 0.5, Math.PI * 1.4);
  ctx.stroke();
  ctx.restore();

  // 6C. Lime-Green Goblin Head Contour
  const jawDropPx = jawOpen * 3.8;
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-11, 8 + jawDropPx * 0.4);
  ctx.quadraticCurveTo(-10, 19, -5, 23);
  ctx.quadraticCurveTo(2, 25, 8, 21);
  ctx.quadraticCurveTo(14, 16, 12, 7 + jawDropPx * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#4D7C0F';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(1, 17 + jawDropPx * 0.6, 5.0, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = skinBase;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-13, -12);
  ctx.quadraticCurveTo(0, -18, 12, -12);
  ctx.quadraticCurveTo(18, -2, 16, 7 + jawDropPx * 0.6);
  ctx.quadraticCurveTo(3, 16 + jawDropPx, -12, 10 + jawDropPx * 0.5);
  ctx.quadraticCurveTo(-18, 1, -13, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6D. Smartly Animated Mouth, Crooked Yellowish Teeth & Wagging Red Tongue
  const mouthBotY = 10.5 + jawDropPx;
  ctx.fillStyle = '#F87171';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-11, -0.5);
  ctx.quadraticCurveTo(2, 2.5, 14, -1.0);
  ctx.quadraticCurveTo(16, mouthBotY, 2, mouthBotY + 2.5);
  ctx.quadraticCurveTo(-12, mouthBotY, -11, -0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#2A0808';
  ctx.beginPath();
  ctx.moveTo(-9.5, 0.5);
  ctx.quadraticCurveTo(2, 3.2, 12.5, 0.2);
  ctx.quadraticCurveTo(14, mouthBotY - 1, 2, mouthBotY + 1.0);
  ctx.quadraticCurveTo(-10.5, mouthBotY - 1, -9.5, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-5, mouthBotY - 1);
  ctx.quadraticCurveTo(
    -2 + tongueWagX,
    3.5 + tongueCurlY,
    5 + tongueWagX * 0.7,
    5.5 + tongueCurlY
  );
  ctx.quadraticCurveTo(9, mouthBotY - 0.5, 3, mouthBotY + 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-1 + tongueWagX * 0.5, 5.2 + tongueCurlY);
  ctx.quadraticCurveTo(2 + tongueWagX * 0.5, 7.5, 2, mouthBotY - 0.8);
  ctx.stroke();

  // Upper row of 5 blocky crooked yellowish goblin teeth
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  const topTeethX = [-8.5, -4.2, 0.2, 4.8, 9.0];
  for (let i = 0; i < topTeethX.length; i++) {
    const tx = topTeethX[i];
    const ty = i === 0 || i === 4 ? 0.2 : 1.2;
    const tw = 3.3;
    const th = (i === 1 || i === 2 ? 3.8 : 3.2) * (0.75 + jawOpen * 0.25);
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 0.8);
    ctx.fill();
    ctx.stroke();
  }

  // Lower row of 4 blocky crooked yellowish teeth moving with jaw
  const botTeethX = [-7.0, -2.2, 3.2, 7.8];
  for (let i = 0; i < botTeethX.length; i++) {
    const tx = botTeethX[i];
    const th = (i === 1 || i === 2 ? 3.5 : 2.9) * (0.75 + jawOpen * 0.25);
    const ty = mouthBotY - th + (i === 0 || i === 3 ? -0.8 : 0.4);
    ctx.beginPath();
    ctx.roundRect(tx, ty, 3.2, th, 0.8);
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-10.5, -1, 2.8, Math.PI * 0.65, Math.PI * 1.45);
  ctx.stroke();

  // 6E. Big Bulging Golden-Yellow Eyes with Smart Pupil Tracking & Eyelids
  const eyeCenters = [
    { cx: -2.2, cy: -6.8, rx: 5.0, ry: 5.4 },
    { cx: 6.8, cy: -7.6, rx: 4.5, ry: 4.9 },
  ];
  for (const ec of eyeCenters) {
    ctx.fillStyle = '#FDE047';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(ec.cx, ec.cy, ec.rx, ec.ry * (1 - eyeSquint * 0.65), -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (eyeSquint < 0.7) {
      ctx.fillStyle = isEnraged ? '#DC2626' : '#F59E0B';
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX, ec.cy + pupilShiftY, 2.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX, ec.cy + pupilShiftY, panicked ? 1.1 : 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFDF7';
      ctx.beginPath();
      ctx.arc(ec.cx + pupilShiftX - 0.7, ec.cy + pupilShiftY - 0.8, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Thick Bushy Black Eyebrows
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-8.5, -11.5 - browLift);
  ctx.quadraticCurveTo(-3.0, -15.5 - browLift, 1.5, -12.0 - browLift * 0.7);
  ctx.moveTo(2.5, -12.5 - browLift * 0.8);
  ctx.quadraticCurveTo(7.2, -16.0 - browLift, 11.5, -12.2 - browLift * 0.6);
  ctx.stroke();

  // 6F. Big Bulbous Freckled Red-Orange Nose
  const ny = -2.2 + noseTwitchY;
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(7.5, ny, 6.4, 4.4, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.ellipse(7.2, ny - 1.2, 4.2, 2.0, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  ctx.arc(5.5, ny - 0.5, 0.65, 0, Math.PI * 2);
  ctx.arc(8.2, ny - 1.2, 0.65, 0, Math.PI * 2);
  ctx.arc(10.0, ny + 0.2, 0.65, 0, Math.PI * 2);
  ctx.arc(7.0, ny + 0.8, 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // end head transform
  ctx.restore(); // end Bubák transform
}

// ============================================================================
// 4. SKALNÍ OBR (HORSKÝ OBR S DUBOVÝM KYJEM V RUKOU — BEZ ČERNÉ ŠIPKY)
// ============================================================================
export function drawHospodaObr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  attackInfo?: any,
  enemy?: any
): void {
  const { t, isWalking, isWindup, isStrike, isEnraged, attackProgress } = resolveShowcaseMotion(
    time,
    vx,
    attackInfo,
    enemy
  );

  const dir = vx < 0 ? -1 : 1;
  const baseScale = (enemy?.sizeScale || 1) * 0.92;

  const stompBobY = isWalking
    ? Math.abs(Math.sin(t * 7.2)) * -4.2
    : isStrike
      ? 3.5
      : Math.sin(t * 2.8) * 1.6;
  const bodyLean = isStrike
    ? 0.14
    : isWindup
      ? -0.11 * attackProgress
      : isWalking
        ? 0.05
        : 0;

  ctx.save();
  ctx.translate(x, y + stompBobY);
  ctx.scale(dir * baseScale, baseScale);
  ctx.rotate(bodyLean);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --------------------------------------------------------------------------
  // 1. GROUND SHADOW & FLYING GRANITE PEBBLES ON STRIKE
  // --------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(28, 22, 16, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 62, isStrike ? 46 : 36, 7.0, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isStrike) {
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    for (const [px, py, pr] of [[32, 48, 3.2], [44, 52, 2.6], [26, 44, 2.2]]) {
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // --------------------------------------------------------------------------
  // 2. PATCHED SLATE TROUSERS & HEAVY HOBNAILED BOOTS (OKOVANÉ ŠKORNĚ)
  // --------------------------------------------------------------------------
  const legs = [
    { lx: -13, phase: 0 },
    { lx: 12, phase: Math.PI },
  ];
  for (const leg of legs) {
    const strideX = isWalking ? Math.cos(t * 7.2 + leg.phase) * 5.0 : 0;
    const strideY = isWalking ? Math.max(0, Math.sin(t * 7.2 + leg.phase)) * -4.5 : 0;

    ctx.save();
    ctx.translate(strideX, strideY);

    // Thick slate-grey trousers
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(leg.lx - 8, 18, 16, 26, 4);
    ctx.fill();
    ctx.stroke();

    // Cross-stitched knee patch on front leg
    if (leg.lx > 0) {
      ctx.fillStyle = '#92400E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.rect(leg.lx - 4, 24, 9, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Heavy iron-shod hobnailed boot (okovaná škorně)
    ctx.fillStyle = '#451A03';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(leg.lx - 9, 40);
    ctx.lineTo(leg.lx + 8, 40);
    ctx.lineTo(leg.lx + 11, 52);
    ctx.quadraticCurveTo(leg.lx + 21, 51, leg.lx + 20, 59);
    ctx.lineTo(leg.lx - 10, 59);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Forged iron toe-cap & hobnail studs
    ctx.fillStyle = '#94A3B8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(leg.lx + 14, 55, 4.5, -Math.PI * 0.6, Math.PI * 0.4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    for (let s = 0; s < 3; s++) {
      ctx.beginPath();
      ctx.arc(leg.lx - 5 + s * 6, 57, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 3. LEFT SUPPORTING ARM (BEHIND TORSO)
  // --------------------------------------------------------------------------
  const clubAngle = isStrike
    ? 0.85
    : isWindup
      ? -1.05 * attackProgress - 0.35
      : -0.35 + Math.sin(t * 2.8) * 0.08;
  const clubPivotX = 20;
  const clubPivotY = -6;

  // Back arm reaching across to support the heavy oak club
  ctx.strokeStyle = INK;
  ctx.lineWidth = 11.5;
  ctx.beginPath();
  ctx.moveTo(-22, -12);
  ctx.quadraticCurveTo(-16, 6, clubPivotX - 4, clubPivotY + 4);
  ctx.stroke();

  ctx.strokeStyle = '#F5CBA7';
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(-22, -12);
  ctx.quadraticCurveTo(-16, 6, clubPivotX - 4, clubPivotY + 4);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. MASSIVE BARREL TORSO IN SHEEPSKIN VEST (KOŽICH) & GRANITE SHOULDERS
  // --------------------------------------------------------------------------
  // Coarse linen undershirt sleeves
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(-24, -10, 9.5, 13, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Barrel torso in rough brown sheepskin vest (ovčí kožich)
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-25, -24);
  ctx.quadraticCurveTo(-30, 0, -24, 22);
  ctx.quadraticCurveTo(0, 28, 25, 22);
  ctx.quadraticCurveTo(31, 0, 25, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fluffy cream sheepskin wool lining along front vest edges & hem
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  for (let wy = -18; wy <= 16; wy += 7) {
    ctx.beginPath();
    ctx.arc(2 + Math.sin(wy) * 1.5, wy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Craggy granite boulder plates on shoulders with lush green forest moss
  const boulders = [
    { bx: -22, by: -22, rx: 12, ry: 9, rot: -0.2 },
    { bx: 21, by: -22, rx: 12, ry: 9, rot: 0.2 },
  ];
  for (const b of boulders) {
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(b.bx, b.by, b.rx, b.ry, b.rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Granite facet highlight
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.ellipse(b.bx - 2, b.by - 2, b.rx * 0.55, b.ry * 0.45, b.rot, 0, Math.PI * 2);
    ctx.fill();

    // Green forest moss tuft growing on shoulder rock
    ctx.fillStyle = '#65A30D';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(b.bx - 3, b.by - 6, 4.2, Math.PI, 0);
    ctx.arc(b.bx + 3, b.by - 6, 3.8, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Wide studded leather giant's belt with heavy forged brass buckle
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(-25, 11, 50, 10, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-7, 9, 15, 14, 2.5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.rect(-3, 12.5, 7, 7);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 5. EXPRESSIVE WEATHERED GIANT HEAD, BUSHY BEARD & BULBOUS NOSE
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -36);

  // Huge jug ears
  ctx.fillStyle = '#E59866';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(-18, -2, 5.2, 7.5, -0.2, 0, Math.PI * 2);
  ctx.ellipse(18, -2, 5.2, 7.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Broad craggy giant head
  ctx.fillStyle = '#F5CBA7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-16, -18, 32, 30, 10);
  ctx.fill();
  ctx.stroke();

  // Unruly dark-brown & slate-grey shaggy beard covering lower jaw
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, -1);
  ctx.quadraticCurveTo(-20, 14, -10, 20);
  ctx.quadraticCurveTo(0, 25, 11, 20);
  ctx.quadraticCurveTo(20, 14, 16, -1);
  ctx.quadraticCurveTo(8, 5, 0, 5);
  ctx.quadraticCurveTo(-8, 5, -16, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Beard texture bristles
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-6, 17);
  ctx.moveTo(0, 11);
  ctx.lineTo(0, 19);
  ctx.moveTo(8, 10);
  ctx.lineTo(6, 17);
  ctx.stroke();

  // Roaring / grinning giant mouth with blocky crooked teeth
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(1, 7, isStrike || isEnraged ? 8.5 : 6.5, isStrike || isEnraged ? 5.2 : 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FEF9C3';
  ctx.lineWidth = 1.3;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.rect(i * 2.8 - 0.5, 3.8, 2.4, 2.8);
    ctx.fill();
    ctx.stroke();
  }

  // Squinting/glancing giant eyes with amber irises & white catchlights
  const eyeOpen = panicked ? 1.25 : isStrike ? 0.85 : 1.0;
  for (const ex of [-6.0, 6.5]) {
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(ex, -6.5, 4.0, 3.6 * eyeOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isEnraged ? '#DC2626' : '#D97706';
    ctx.beginPath();
    ctx.arc(ex + 0.8, -6.5, 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(ex + 0.8, -6.5, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex + 0.2, -7.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heavy furrowed bushy eyebrows
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-12, -11.5);
  ctx.lineTo(-2, isEnraged || isStrike ? -9.0 : -11.0);
  ctx.moveTo(12, -11.5);
  ctx.lineTo(2, isEnraged || isStrike ? -9.0 : -11.0);
  ctx.stroke();

  // Huge bulbous Ladovský nose with highlight
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(1.5, -1.0, 5.8, 4.6, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.ellipse(1.0, -2.2, 3.2, 1.8, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // --------------------------------------------------------------------------
  // 6. FOREGROUND ARM, ARTICULATED HANDS & KNOTTED OAK CLUB (DUBOVÝ KYJ)
  //    (Clean iron bands & round rivets — no strange black arrow triangles!)
  // --------------------------------------------------------------------------
  // Right coarse linen shoulder sleeve
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(21, -12, 8.5, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Muscular right forearm connecting shoulder (21, -12) to club grip (clubPivotX, clubPivotY)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 12.0;
  ctx.beginPath();
  ctx.moveTo(21, -12);
  ctx.quadraticCurveTo(25, -4, clubPivotX, clubPivotY);
  ctx.stroke();

  ctx.strokeStyle = '#F5CBA7';
  ctx.lineWidth = 8.0;
  ctx.beginPath();
  ctx.moveTo(21, -12);
  ctx.quadraticCurveTo(25, -4, clubPivotX, clubPivotY);
  ctx.stroke();

  ctx.save();
  ctx.translate(clubPivotX, clubPivotY);
  ctx.rotate(clubAngle);

  // Knotted oak club shaft widening toward heavy rounded head
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-3.5, 14);
  ctx.lineTo(-9.5, -44);
  ctx.quadraticCurveTo(-11.5, -58, 0, -60);
  ctx.quadraticCurveTo(11.5, -58, 9.5, -44);
  ctx.lineTo(3.5, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Warm oak highlight stripe & growth knot
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(-2.5, -34, 3.2, 18, 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(2.5, -30, 3.0, 4.2, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Forged iron bands & rounded iron rivets around club head (no arrow shapes!)
  ctx.fillStyle = '#64748B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.roundRect(-10, -48, 20, 5.5, 2);
  ctx.roundRect(-8.5, -34, 17, 5.0, 2);
  ctx.fill();
  ctx.stroke();

  // Rounded iron rivets on the bands
  ctx.fillStyle = '#E2E8F0';
  ctx.lineWidth = 1.4;
  for (const ry of [-45.2, -31.5]) {
    for (const rx of [-6, 0, 6]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Sprouting green oak leaf at top of club
  ctx.fillStyle = '#65A30D';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-6, -57, 4.5, 2.4, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Both giant hands (left lower grip + right upper grip) with articulated fingers wrapped around club handle
  ctx.fillStyle = '#E59866';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(-1, 7, 6.2, 4.6, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F5CBA7';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(1, -1, 6.8, 5.0, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4 articulated giant fingers wrapping across the handle
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(4.2, -4.2 + f * 2.4, 2.8, 1.35, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// ============================================================================
// 5. MARIÁŠOVÝ ČERT (PŘIROZENÝ OBOURUČNÍ ÚTOK PEKELNÝM TROJZUBCEM)
// ============================================================================
export function drawHospodaCert(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  arg7?: any,
  arg8?: any,
  arg9?: any,
  arg10?: any
): void {
  const isLegacySignature = typeof arg7 === 'boolean' || typeof arg8 === 'boolean';
  const isCharging = isLegacySignature ? Boolean(arg8) : false;
  const attackInfo = isLegacySignature ? arg9 : arg7;
  const enemy = isLegacySignature ? arg10 : arg8;

  const motion = resolveShowcaseMotion(time, vx, attackInfo, enemy);
  const t = motion.t;
  const isWalking = motion.isWalking || isCharging;
  const isWindup = motion.isWindup;
  const isStrike = motion.isStrike || isCharging;
  const isEnraged = motion.isEnraged;
  const attackProgress = motion.attackProgress;
  const enemyId = String(enemy?.id || enemy?.type || 'cert');
  const hasSack = enemyId === 'cert_s_pytlem';

  const dir = vx < 0 ? -1 : 1;
  const baseScale = (enemy?.sizeScale || 1) * 0.84;

  const hopBobY = isWalking
    ? Math.abs(Math.sin(t * 9.5)) * -3.5
    : Math.sin(t * 3.8) * 1.5;
  const tailWag = Math.sin(t * (isStrike || isEnraged ? 9.0 : 4.5)) * 6.0;
  const tongueWag = Math.sin(t * 7.5) * 2.5;

  // Natural two-handed trident kinematics:
  // - Idle/Walk: carried diagonally across chest (angle = -0.52 rad from horizontal +x, pointing forward-upward)
  // - Windup: drawn back (-12px) and leveled horizontally (angle = -0.12 rad) to coil for a lunge
  // - Strike: thrust powerfully forward (+24px) at a low lunge angle (angle = 0.04 rad)
  const tridentAngle = isStrike
    ? 0.04
    : isWindup
      ? -0.52 + 0.40 * attackProgress
      : -0.52 + Math.sin(t * 3.6) * 0.06;
  const tridentThrustX = isStrike
    ? 22
    : isWindup
      ? -11 * attackProgress
      : Math.sin(t * 3.6) * 1.5;
  const tridentThrustY = isStrike
    ? -2
    : isWindup
      ? 2 * attackProgress
      : Math.cos(t * 3.6) * 1.2;

  const uX = Math.cos(tridentAngle);
  const uY = Math.sin(tridentAngle);
  const pX = -uY;
  const pY = uX;

  // Center of trident grip relative to Čert's body
  const gripCenterX = 6 + tridentThrustX;
  const gripCenterY = 2 + tridentThrustY;

  // Rear hand (left hand) grips behind gripCenter; Front hand (right hand) grips ahead of gripCenter
  const rearGripX = gripCenterX - uX * 14;
  const rearGripY = gripCenterY - uY * 14;
  const frontGripX = gripCenterX + uX * 11;
  const frontGripY = gripCenterY + uY * 11;

  ctx.save();
  ctx.translate(x, y + hopBobY);
  ctx.scale(dir * baseScale, baseScale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Ground shadow
  ctx.fillStyle = 'rgba(28, 22, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 62, 28, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Optional burlap sack on back for 'cert_s_pytlem'
  if (hasSack) {
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(-20, -4, 14, 20, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 1. S-CURVED DEVIL TAIL WITH SPIKY BLACK TASSEL (OHÁŇKA S CHOMÁČEM)
  // --------------------------------------------------------------------------
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.bezierCurveTo(-28, 12 + tailWag, -34, -8 + tailWag, -24, -18 + tailWag * 0.6);
  ctx.stroke();

  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.bezierCurveTo(-28, 12 + tailWag, -34, -8 + tailWag, -24, -18 + tailWag * 0.6);
  ctx.stroke();

  // Tufted tail tassel
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-24, -18 + tailWag * 0.6);
  ctx.lineTo(-31, -24 + tailWag * 0.6);
  ctx.lineTo(-23, -27 + tailWag * 0.6);
  ctx.lineTo(-19, -20 + tailWag * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 2. CANONICAL ASYMMETRIC LEGS (ADR 0055):
  //    - LEFT LEG: Human leg in red-and-white striped stocking & patched boot
  //    - RIGHT LEG: Shaggy soot-black goat leg ending in a cloven hoof (kopyto)
  // --------------------------------------------------------------------------
  const leftWalk = isWalking ? Math.sin(t * 9.5) * 4.5 : 0;
  const rightWalk = isWalking ? -Math.sin(t * 9.5) * 4.5 : 0;

  // 2A. LEFT HUMAN LEG (Red-and-white striped stocking + patched tavern boot)
  ctx.save();
  ctx.translate(leftWalk, 0);
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.rect(-15, 24, 10, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#DC2626';
  for (let sy = 27; sy <= 41; sy += 6) {
    ctx.fillRect(-14, sy, 8, 3.0);
  }

  // Patched brown leather tavern boot on left leg
  ctx.fillStyle = '#78350F';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-16, 45);
  ctx.lineTo(-4, 45);
  ctx.lineTo(-1, 53);
  ctx.quadraticCurveTo(8, 52, 7, 59);
  ctx.lineTo(-16, 59);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stitched patch on boot
  ctx.fillStyle = '#D97706';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.rect(-13, 48, 6, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2B. RIGHT SHAGGY GOAT LEG WITH CLOVEN HOOF (Chlupatá kozlí noha s kopytem)
  ctx.save();
  ctx.translate(rightWalk, 0);
  ctx.fillStyle = '#1E1B18';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(4, 22);
  ctx.quadraticCurveTo(18, 30, 6, 40);
  ctx.lineTo(15, 50);
  ctx.lineTo(7, 51);
  ctx.quadraticCurveTo(-2, 39, 4, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy cloven goat hoof (rozdvojené kopyto)
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(6, 50);
  ctx.lineTo(16, 50);
  ctx.lineTo(20, 59);
  ctx.lineTo(13, 59);
  ctx.lineTo(12, 54);
  ctx.lineTo(10, 59);
  ctx.lineTo(5, 59);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --------------------------------------------------------------------------
  // 2C. REAR (LEFT) ARM CONNECTING SHOULDER (-13, -8) TO REAR TRIDENT GRIP
  // --------------------------------------------------------------------------
  const rearShoulderX = -13;
  const rearShoulderY = -8;
  const rearElbowX = (rearShoulderX + rearGripX) * 0.5 - 5;
  const rearElbowY = Math.max(rearShoulderY + 12, rearGripY + 8);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 8.4;
  ctx.beginPath();
  ctx.moveTo(rearShoulderX, rearShoulderY);
  ctx.quadraticCurveTo(rearElbowX, rearElbowY, rearGripX, rearGripY);
  ctx.stroke();

  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.moveTo(rearShoulderX, rearShoulderY);
  ctx.quadraticCurveTo(rearElbowX, rearElbowY, rearGripX, rearGripY);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 3. SHAGGY FURRED TORSO, PATCHED TAVERN VEST, MARIÁŠ CARDS & CHAIN BELT
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-17, 12, 34, 15, 3);
  ctx.fill();
  ctx.stroke();

  // Patched rustic crimson-ochre vest (záplatovaná vesta)
  ctx.fillStyle = '#991B1B';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, -18);
  ctx.quadraticCurveTo(-19, 0, -17, 15);
  ctx.lineTo(17, 15);
  ctx.quadraticCurveTo(19, 0, 15, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shaggy black fur chest V-patch & ochre vest patch
  ctx.fillStyle = '#1E1B18';
  ctx.beginPath();
  ctx.moveTo(-6, -17);
  ctx.lineTo(6, -17);
  ctx.lineTo(1, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(-14, -4, 8, 8);
  ctx.fill();
  ctx.stroke();

  // Fan of 3 authentic Mariáš cards tucked into his belt/vest pocket
  const cardAngles = [-0.32, -0.05, 0.22];
  const cardColors = ['#DC2626', '#F59E0B', '#16A34A'];
  for (let c = 0; c < 3; c++) {
    ctx.save();
    ctx.translate(-9 + c * 2.5, 10);
    ctx.rotate(cardAngles[c]);
    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-3.5, -10, 7, 10, 1.2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = cardColors[c];
    ctx.beginPath();
    ctx.arc(0, -5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rattling forged iron chain belt (řetěz kolem pasu) with links & padlock
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.fillStyle = '#94A3B8';
  for (let cx = -14; cx <= 14; cx += 7) {
    ctx.beginPath();
    ctx.ellipse(cx, 13, 4.2, 2.6, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.roundRect(2, 15, 6, 7, 1.5);
  ctx.fill();
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. EXPRESSIVE DEVIL HEAD, CURVED RAM HORNS & LONG WAGGING RED TONGUE
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(0, -29);

  // Shaggy soot-black head with cheek fur ruff
  ctx.fillStyle = '#1E1B18';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-13, -12);
  ctx.quadraticCurveTo(0, -17, 13, -12);
  ctx.lineTo(18, -3);
  ctx.lineTo(14, 2);
  ctx.quadraticCurveTo(12, 13, 0, 14);
  ctx.quadraticCurveTo(-12, 13, -14, 2);
  ctx.lineTo(-18, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Curved ridged ram/goat horns (zatočené rohy)
  const horns = [
    { hx: -8, dirX: -1 },
    { hx: 8, dirX: 1 },
  ];
  for (const h of horns) {
    ctx.fillStyle = '#D97706';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(h.hx, -13);
    ctx.quadraticCurveTo(h.hx + h.dirX * 14, -28, h.hx + h.dirX * 20, -14);
    ctx.quadraticCurveTo(h.hx + h.dirX * 13, -18, h.hx + h.dirX * 3, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(h.hx + h.dirX * 4, -15);
    ctx.lineTo(h.hx + h.dirX * 6, -19);
    ctx.moveTo(h.hx + h.dirX * 9, -17);
    ctx.lineTo(h.hx + h.dirX * 11, -21);
    ctx.stroke();
  }

  // Glowing yellow-red mischievous eyes with darting slit pupils
  for (const ex of [-5.2, 5.8]) {
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(ex, -5.5, 4.2, panicked ? 5.0 : 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(ex + 0.8, -5.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(ex + 0.8, -5.5, 0.9, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex + 0.2, -6.4, 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wide grinning devil mouth, sharp white fangs & long curling crimson tongue
  ctx.fillStyle = '#450A0A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-9, 2);
  ctx.quadraticCurveTo(1, 5, 11, 2);
  ctx.quadraticCurveTo(9, 11, 1, 11);
  ctx.quadraticCurveTo(-8, 11, -9, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Long wagging crimson tongue (dlouhý vyplazený červený jazyk)
  ctx.fillStyle = '#EF4444';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-2, 6);
  ctx.quadraticCurveTo(3 + tongueWag, 14, 9 + tongueWag, 18 + (isStrike ? 4 : 0));
  ctx.quadraticCurveTo(13 + tongueWag, 13, 5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sharp white upper fangs
  ctx.fillStyle = '#FFFDF7';
  ctx.lineWidth = 1.3;
  for (const fx of [-6, 6]) {
    ctx.beginPath();
    ctx.moveTo(fx - 1.8, 2.5);
    ctx.lineTo(fx, 6.8);
    ctx.lineTo(fx + 1.8, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Bulbous red-tipped snout
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(1.5, -0.5, 4.2, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // --------------------------------------------------------------------------
  // 5. TWO-HANDED WROUGHT-IRON DEVIL'S TRIDENT (PEKELNÝ TROJZUBEC / VIDLE)
  //    WITH BOTH HANDS & ARTICULATED FINGERS GRIPPING THE SHAFT NATURALLY
  // --------------------------------------------------------------------------
  // Rear (left) hand palm & fingers gripping rear shaft
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(rearGripX, rearGripY, 4.6, 3.8, tridentAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ash-wood trident shaft running from butt (-32) through both hands to fork base (+34)
  const buttX = gripCenterX - uX * 32;
  const buttY = gripCenterY - uY * 32;
  const forkBaseX = gripCenterX + uX * 32;
  const forkBaseY = gripCenterY + uY * 32;

  ctx.strokeStyle = INK;
  ctx.lineWidth = 6.2;
  ctx.beginPath();
  ctx.moveTo(buttX, buttY);
  ctx.lineTo(forkBaseX, forkBaseY);
  ctx.stroke();

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(buttX, buttY);
  ctx.lineTo(forkBaseX, forkBaseY);
  ctx.stroke();

  // Forged iron socket & 3 barbed trident prongs (trojzubé pekelné vidle)
  ctx.save();
  ctx.translate(forkBaseX, forkBaseY);
  ctx.rotate(tridentAngle);

  // Iron collar socket
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.roundRect(-4, -3.2, 6, 6.4, 1.5);
  ctx.fill();
  ctx.stroke();

  // Curved iron cross-guard bar of the trident fork
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  ctx.moveTo(1, -11);
  ctx.quadraticCurveTo(5, 0, 1, 11);
  ctx.stroke();

  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(1, -11);
  ctx.quadraticCurveTo(5, 0, 1, 11);
  ctx.stroke();

  // Three sharp wrought-iron trident prongs with barbed tips
  const prongs = [
    { py: -10.5, tipY: -12.0, len: 22 },
    { py: 0, tipY: 0, len: 26 },
    { py: 10.5, tipY: 12.0, len: 22 },
  ];
  for (const pr of prongs) {
    ctx.fillStyle = isStrike || isWindup ? '#EA580C' : '#94A3B8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(2, pr.py - 1.8);
    ctx.lineTo(pr.len - 5, pr.tipY - 1.4);
    ctx.lineTo(pr.len - 6, pr.tipY - 3.6);
    ctx.lineTo(pr.len + 2, pr.tipY);
    ctx.lineTo(pr.len - 6, pr.tipY + 3.6);
    ctx.lineTo(pr.len - 5, pr.tipY + 1.4);
    ctx.lineTo(2, pr.py + 1.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing hellfire spark at prong tip during windup/strike
    if (isWindup || isStrike) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(pr.len + 1, pr.tipY, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Rear hand's 4 fingers wrapping over the shaft
  ctx.fillStyle = '#3F3F46';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  for (let f = -1.5; f <= 1.5; f += 1.0) {
    const fx = rearGripX + uX * (f * 2.1) - pX * 1.2;
    const fy = rearGripY + uY * (f * 2.1) - pY * 1.2;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 2.2, 1.2, tridentAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Front (right) arm connecting shoulder (13, -7) through elbow to front trident grip
  const frontShoulderX = 13;
  const frontShoulderY = -7;
  const frontElbowX = (frontShoulderX + frontGripX) * 0.5 - 3;
  const frontElbowY = Math.max(frontShoulderY + 13, frontGripY + 10);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 8.6;
  ctx.beginPath();
  ctx.moveTo(frontShoulderX, frontShoulderY);
  ctx.quadraticCurveTo(frontElbowX, frontElbowY, frontGripX, frontGripY);
  ctx.stroke();

  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  ctx.moveTo(frontShoulderX, frontShoulderY);
  ctx.quadraticCurveTo(frontElbowX, frontElbowY, frontGripX, frontGripY);
  ctx.stroke();

  // Front hand palm, thumb & 4 articulated clawed fingers gripping the forward shaft
  ctx.fillStyle = '#292524';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(frontGripX, frontGripY, 4.8, 3.8, tridentAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3F3F46';
  ctx.lineWidth = 1.5;
  for (let f = -1.5; f <= 1.5; f += 1.0) {
    const fx = frontGripX + uX * (f * 2.2) - pX * 1.4;
    const fy = frontGripY + uY * (f * 2.2) - pY * 1.4;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 2.4, 1.25, tridentAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// 6. STRACHEM NACPANÝ BARBUCHA (ADR 0050 — DLOUHÉ ČERNÉ DRÁPY JAKO SOUČÁST RUKOU,
//    KTERÉ PŘI ÚTOKU VYSTŘELUJÍ JAKO LETÍCÍ OSTNY / ŽIHADLA)
// ============================================================================
export function drawHospodaBarbucha(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  vx: number,
  panicked = false,
  attackInfo?: any,
  enemy?: any
): void {
  const { t, isWindup, isStrike, isEnraged, attackProgress } = resolveShowcaseMotion(
    time,
    vx,
    attackInfo,
    enemy
  );

  const dir = vx < 0 ? -1 : 1;
  // ADR 0050: Dynamic inflation when stuffed with fear (scaled by sizeScale)
  const fearScale = Number(enemy?.sizeScale ?? 1.0);
  const breathPulse = 1.0 + Math.sin(t * 3.6) * 0.045 + (isWindup ? 0.12 * attackProgress : 0);
  const baseScale = fearScale * breathPulse * 0.88;

  const hoverY = Math.sin(t * 3.2) * 3.5;

  ctx.save();
  ctx.translate(x, y + hoverY);
  ctx.scale(dir * baseScale, baseScale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --------------------------------------------------------------------------
  // 1. ETHEREAL BLUE-WHITE SMOKE SHADOW & SWIRLING VAPOR RINGS
  // --------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 56, 36, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling blue-white smoke puffs & rising soot motes around the base
  for (let p = 0; p < 4; p++) {
    const pAngle = t * 2.4 + p * (Math.PI * 0.5);
    const px = Math.cos(pAngle) * 28;
    const py = 45 + Math.sin(pAngle) * 5;
    ctx.fillStyle = p % 2 === 0 ? '#E2E8F0' : '#CBD5E1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 2. FAR (LEFT) BILLOWING SMOKY ARM, HAND & LONG BLACK FINGER-CLAWS
  // --------------------------------------------------------------------------
  const farHandX = isStrike
    ? 28
    : isWindup
      ? -28 - 6 * attackProgress
      : -24 + Math.sin(t * 3.4) * 2.5;
  const farHandY = isStrike
    ? 4
    : isWindup
      ? -10 - 6 * attackProgress
      : 6 + Math.cos(t * 3.4) * 2.5;

  // Far smoky arm connecting left shoulder (-18, -8) to farHand
  ctx.strokeStyle = INK;
  ctx.lineWidth = 12.0;
  ctx.beginPath();
  ctx.moveTo(-18, -8);
  ctx.quadraticCurveTo(-32, 0, farHandX, farHandY);
  ctx.stroke();

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 8.0;
  ctx.beginPath();
  ctx.moveTo(-18, -8);
  ctx.quadraticCurveTo(-32, 0, farHandX, farHandY);
  ctx.stroke();

  // Far hand smoky palm & 4 fingers that extend directly into long razor-sharp black claws
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(farHandX, farHandY, 6.5, 5.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (let f = 0; f < 4; f++) {
    const spread = isWindup ? 0.28 : isStrike ? 0.22 : 0.18;
    const baseAng = (isStrike ? -0.25 : 2.35) + (f - 1.5) * spread + Math.sin(t * 4.5 + f) * 0.05;
    const knuckleX = farHandX + Math.cos(baseAng) * 5.2;
    const knuckleY = farHandY + Math.sin(baseAng) * 5.2;
    const clawLen = isStrike ? 11 : isWindup ? 23 : 19;
    const tipX = knuckleX + Math.cos(baseAng) * clawLen;
    const tipY = knuckleY + Math.sin(baseAng) * clawLen;
    const nx = -Math.sin(baseAng) * 2.3;
    const ny = Math.cos(baseAng) * 2.3;

    // Smoky finger base segment
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(farHandX, farHandY);
    ctx.lineTo(knuckleX, knuckleY);
    ctx.stroke();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(farHandX, farHandY);
    ctx.lineTo(knuckleX, knuckleY);
    ctx.stroke();

    // Long razor-sharp black claw growing directly from the finger (černý dráp / žihadlo)
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(knuckleX - nx, knuckleY - ny);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(knuckleX + nx, knuckleY + ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 3. AMORPHOUS BLUE-WHITE SMOKE & PILLOW-DOWN GHOST BODY WITH WAVY LOWER HEM
  //    (ADR 0050: Modrobílý dýmový duch s vlnícím se spodním lemem)
  // --------------------------------------------------------------------------
  const hemWave = Math.sin(t * 5.0) * 4.2;

  // Deep slate-blue outer smoke lobes for rich volumetric silhouette
  ctx.fillStyle = '#94A3B8';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.arc(-26, 2, 16, 0, Math.PI * 2);
  ctx.arc(25, 4, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Main billowing blue-slate smoke body
  ctx.fillStyle = '#CBD5E1';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-25, -23);
  ctx.bezierCurveTo(-42, -6, -44, 22, -33, 44);
  // Classic 4-scallop ghostly wavy lower skirt hem
  ctx.quadraticCurveTo(-22, 55 + hemWave, -11, 43 - hemWave * 0.5);
  ctx.quadraticCurveTo(0, 56 - hemWave, 11, 43 + hemWave * 0.5);
  ctx.quadraticCurveTo(22, 55 + hemWave, 33, 44);
  ctx.bezierCurveTo(44, 22, 42, -6, 25, -23);
  ctx.quadraticCurveTo(0, -35, -25, -23);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mid-tone ice-blue smoke layer (#E0F2FE)
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.ellipse(0, 5, 29, 27, 0, 0, Math.PI * 2);
  ctx.fill();

  // Luminous snow-white pillow-down core (#F8FAFC)
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(-4, -2, 22, 20, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Internal Ladovský smoke curl lines & pillow creases (zero gradients!)
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(-15, 14, 8.5, 0.2 * Math.PI, 1.15 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(14, 18, 9.5, -0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-2, 28, 11, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // --------------------------------------------------------------------------
  // 4. WILD SPIKY PITCH-BLACK HAIR CROWN (DIVOKÉ ČERNÉ VLASY — ADR 0050)
  // --------------------------------------------------------------------------
  const blackSpikes = [
    { ang: -2.85, len: 22 },
    { ang: -2.55, len: 27 },
    { ang: -2.25, len: 32 },
    { ang: -1.95, len: 36 },
    { ang: -1.65, len: 38 },
    { ang: -1.35, len: 36 },
    { ang: -1.05, len: 33 },
    { ang: -0.75, len: 28 },
    { ang: -0.45, len: 23 },
  ];
  for (let i = 0; i < blackSpikes.length; i++) {
    const sp = blackSpikes[i];
    const jitter = Math.sin(t * 8.0 + i * 1.3) * (isStrike || isEnraged ? 0.09 : 0.04);
    const a = sp.ang + jitter;
    const baseR = 16;
    const bx = Math.cos(a) * baseR;
    const by = -20 + Math.sin(a) * baseR;
    const tx = Math.cos(a) * (baseR + sp.len * 0.58);
    const ty = -20 + Math.sin(a) * (baseR + sp.len * 0.58);
    const px = -Math.sin(a) * 5.2;
    const py = Math.cos(a) * 5.2;

    ctx.fillStyle = i % 2 === 0 ? '#0F172A' : '#1E293B';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(bx - px, by - py);
    ctx.quadraticCurveTo((bx + tx) * 0.5 + px * 0.5, (by + ty) * 0.5 - 3, tx, ty);
    ctx.quadraticCurveTo((bx + tx) * 0.5 - px * 0.5, (by + ty) * 0.5 + 2, bx + px, by + py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 5. BULGING EYES, ROSY RED CHEEKS, CARROT NOSE & TOOTHY MAW (ADR 0050)
  // --------------------------------------------------------------------------
  // Bright rosy red cheeks (červené tváře) with crisp white shine dashes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.72)';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-16, -2, 6.5, 4.6, -0.1, 0, Math.PI * 2);
  ctx.ellipse(17, -2, 6.5, 4.6, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-18, -3.2);
  ctx.lineTo(-15.5, -3.8);
  ctx.moveTo(15.5, -3.8);
  ctx.lineTo(18, -3.2);
  ctx.stroke();

  // Deep charcoal eye sockets framing huge bulging eyes (vykulené oči — ADR 0050)
  const eyeScale = panicked || isStrike ? 1.18 : 1.0;
  for (const [ex, ey] of [[-8.5, -13], [8.5, -13]]) {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(ex, ey, 8.0 * eyeScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(ex, ey, 6.8 * eyeScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Electric sky-blue / amber iris ring
    ctx.fillStyle = isEnraged || isStrike ? '#FACC15' : '#38BDF8';
    ctx.beginPath();
    ctx.arc(ex + 1.0, ey, 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Dilating dark pupil
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(ex + 1.2, ey, panicked ? 1.5 : 2.1, 0, Math.PI * 2);
    ctx.fill();

    // Specular white catchlight
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(ex - 0.5, ey - 1.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Furrowed smoky brow ridges above bulging eyes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(-15, -19);
  ctx.quadraticCurveTo(-8, -22, -2, -17);
  ctx.moveTo(15, -19);
  ctx.quadraticCurveTo(8, -22, 2, -17);
  ctx.stroke();

  // Prominent pointed orange CARROT NOSE (mrkvový nos — ADR 0050)
  ctx.fillStyle = '#EA580C';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-1, -10);
  ctx.quadraticCurveTo(13, -9, 25, -4);
  ctx.quadraticCurveTo(12, -1, -1, -2);
  ctx.quadraticCurveTo(-4, -6, -1, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright orange highlight & root rings across the carrot nose
  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.ellipse(9, -6.8, 7.0, 1.6, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#9A3412';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(4, -8.5);
  ctx.lineTo(3.5, -4.0);
  ctx.moveTo(10, -7.5);
  ctx.lineTo(9.5, -3.8);
  ctx.moveTo(16, -6.2);
  ctx.lineTo(15.5, -3.5);
  ctx.stroke();

  // Cavernous toothy maw (zubatá tlama) that opens wide on windup/strike
  const mawH = isStrike ? 13.5 : isWindup ? 10.5 : 7.8 + Math.sin(t * 5.0) * 1.5;
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(1, 9, 14.5, mawH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Jagged upper & lower white teeth lining the maw
  ctx.fillStyle = '#FFFDF7';
  ctx.lineWidth = 1.4;
  for (let ti = -3; ti <= 3; ti++) {
    const tx = 1 + ti * 3.4;
    // Upper tooth
    ctx.beginPath();
    ctx.moveTo(tx - 1.5, 9 - mawH * 0.78);
    ctx.lineTo(tx, 9 - mawH * 0.24);
    ctx.lineTo(tx + 1.5, 9 - mawH * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lower tooth
    ctx.beginPath();
    ctx.moveTo(tx - 1.4, 9 + mawH * 0.78);
    ctx.lineTo(tx, 9 + mawH * 0.28);
    ctx.lineTo(tx + 1.4, 9 + mawH * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 6. FOREGROUND (RIGHT) SMOKY ARM, ARTICULATED HAND & LONG BLACK FINGER-CLAWS
  //    THAT SHOOT OFF LIKE FLYING SPIKES ON STRIKE!
  // --------------------------------------------------------------------------
  const nearShoulderX = 18;
  const nearShoulderY = 2;
  const nearHandX = isStrike
    ? 34
    : isWindup
      ? 12 - 8 * attackProgress
      : 25 + Math.sin(t * 3.8) * 3.0;
  const nearHandY = isStrike
    ? 10
    : isWindup
      ? 16 - 4 * attackProgress
      : 14 + Math.cos(t * 3.8) * 2.5;
  const nearElbowX = (nearShoulderX + nearHandX) * 0.5 - 4;
  const nearElbowY = Math.max(nearShoulderY + 12, nearHandY + 8);

  // Billowing smoky foreground arm connecting shoulder to hand
  ctx.strokeStyle = INK;
  ctx.lineWidth = 13.0;
  ctx.beginPath();
  ctx.moveTo(nearShoulderX, nearShoulderY);
  ctx.quadraticCurveTo(nearElbowX, nearElbowY, nearHandX, nearHandY);
  ctx.stroke();

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 8.6;
  ctx.beginPath();
  ctx.moveTo(nearShoulderX, nearShoulderY);
  ctx.quadraticCurveTo(nearElbowX, nearElbowY, nearHandX, nearHandY);
  ctx.stroke();

  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 4.0;
  ctx.beginPath();
  ctx.moveTo(nearShoulderX, nearShoulderY - 1);
  ctx.quadraticCurveTo(nearElbowX, nearElbowY - 1, nearHandX, nearHandY - 1);
  ctx.stroke();

  // Smoky palm of foreground hand
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(nearHandX, nearHandY, 7.2, 5.8, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Thumb + 4 articulated smoky fingers whose tips ARE long razor-sharp black claws (žihadla)
  const fingerAngles = [-0.62, -0.30, 0.0, 0.30, 0.60];
  for (let f = 0; f < fingerAngles.length; f++) {
    const isThumb = f === 0;
    const spreadMult = isWindup ? 1.35 : isStrike ? 1.25 : 1.0;
    const fWag = Math.sin(t * 5.0 + f * 0.7) * 0.06;
    const ang = fingerAngles[f] * spreadMult + fWag;

    const fingerLen = isThumb ? 5.2 : 6.4;
    const knuckleX = nearHandX + Math.cos(ang) * fingerLen;
    const knuckleY = nearHandY + Math.sin(ang) * fingerLen;

    // Smoky finger phalanx
    ctx.strokeStyle = INK;
    ctx.lineWidth = isThumb ? 4.4 : 4.8;
    ctx.beginPath();
    ctx.moveTo(nearHandX + Math.cos(ang) * 2, nearHandY + Math.sin(ang) * 2);
    ctx.lineTo(knuckleX, knuckleY);
    ctx.stroke();

    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = isThumb ? 2.2 : 2.6;
    ctx.beginPath();
    ctx.moveTo(nearHandX + Math.cos(ang) * 2, nearHandY + Math.sin(ang) * 2);
    ctx.lineTo(knuckleX, knuckleY);
    ctx.stroke();

    // Long pitch-black needle claw growing directly out of the finger!
    // When isStrike is active, the full-length claw shoots forward as a flying spike (drawn below),
    // leaving a sharp regenerating claw base on the fingertip!
    const attachedClawLen = isStrike
      ? (isThumb ? 9 : 11)
      : isWindup
        ? (isThumb ? 18 : 26)
        : (isThumb ? 15 : 22);
    const tipX = knuckleX + Math.cos(ang) * attachedClawLen;
    const tipY = knuckleY + Math.sin(ang) * attachedClawLen;
    const nx = -Math.sin(ang) * (isThumb ? 2.0 : 2.5);
    const ny = Math.cos(ang) * (isThumb ? 2.0 : 2.5);

    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(knuckleX - nx, knuckleY - ny);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(knuckleX + nx, knuckleY + ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metallic slate glint along upper edge of the finger-claw
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(knuckleX - nx * 0.4 + Math.cos(ang) * 2, knuckleY - ny * 0.4 + Math.sin(ang) * 2);
    ctx.lineTo(tipX - Math.cos(ang) * 3, tipY - Math.sin(ang) * 3);
    ctx.stroke();

    // When striking (or at peak windup release), the long claws shoot off from his fingertips like flying spikes!
    if (isStrike) {
      const flightDist = 18 + ((t * 65 + f * 9) % 34);
      const spikeBaseX = knuckleX + Math.cos(ang) * flightDist;
      const spikeBaseY = knuckleY + Math.sin(ang) * flightDist;
      const spikeTipX = spikeBaseX + Math.cos(ang) * 22;
      const spikeTipY = spikeBaseY + Math.sin(ang) * 22;

      // Speed trail line from fingertip to flying claw-spike
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(spikeBaseX, spikeBaseY);
      ctx.stroke();

      // Flying pitch-black claw spike (vystřelené černé žihadlo)
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(spikeBaseX - nx, spikeBaseY - ny);
      ctx.lineTo(spikeTipX, spikeTipY);
      ctx.lineTo(spikeBaseX + nx, spikeBaseY + ny);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(spikeBaseX + Math.cos(ang) * 3, spikeBaseY + Math.sin(ang) * 3);
      ctx.lineTo(spikeTipX - Math.cos(ang) * 3, spikeTipY - Math.sin(ang) * 3);
      ctx.stroke();
    }
  }

  ctx.restore();
}
