/**
 * Procedural Fairytale Weather & Sky Animation Renderer (Ladovské počasí a živá obloha)
 *
 * Implements a zero-allocation, multi-plane 3D parallax weather and sky animation pipeline
 * across all 24 stages (12 months × Day/Night) and RunDirector Rozmary overrides:
 *
 * Supported Weather Effects (`WeatherEffectId`):
 * - `ice_drift`       (Stage 1 Předjaří): Thawing ice-crystal glints, frost motes & sunlit spring mist ribbons
 * - `snow`            (Stages 2, 19, 21, 23, 24): 3-plane parallax snowfall with rotating 6-pointed Ladovské snowflakes & bokeh
 * - `blizzard`        (Stages 20, 22 & Rozmar): Howling diagonal snow squalls, wind streaks, snow eddies & frost vignette
 * - `petals`          (Stages 3, 5, 7, 9): Tumbling cherry/lilac/poppy blossoms & pendulum-swaying dandelion pappus seeds (`chmýří`)
 * - `fog`             (Stages 4, 6, 14, 16, 18): 3-layer undulating marsh & graveyard mist banks + floating night wisps
 * - `fireflies`       (Stage 8 Červnová noc): Lissajous figure-8 glowing St. John's fireflies (`Svatojánské mušky`) & fern spores
 * - `rain`            (Stage 10 Bouře sv. Eliáše): 2-plane slanted storm rain, expanding puddle splash rings & sheet-lightning glow
 * - `sunflower_bloom` (Stage 11 Dožínky): Golden harvest sun-motes, wheat chaff & drifting cornflower/sunflower petals
 * - `shooting_stars`  (Stage 12 Vavřinecká noc): Twinkling starry sky canopy & streaking Perseid meteors with comet tails
 * - `falling_leaves`  (Stages 13, 15, 17, alias `leaves`): 3D-fluttering golden oak, crimson maple & amber plum leaves in wind gusts
 *
 * Performance Architecture:
 * - All detailed Ladovské weather sprites (snowflakes, petals, dandelion seeds, autumn leaves, fireflies,
 *   twinkling stars, night clouds, fog banks, wind curls, rain ripples) are pre-rendered once into offscreen canvases.
 * - The 60+ FPS render loop executes zero heap allocations and zero `createRadialGradient` calls.
 */

export type WeatherEffectId =
  | 'ice_drift'
  | 'snow'
  | 'blizzard'
  | 'petals'
  | 'fog'
  | 'fireflies'
  | 'rain'
  | 'sunflower_bloom'
  | 'shooting_stars'
  | 'falling_leaves'
  | 'leaves';

export interface WeatherWindState {
  /** Base horizontal wind speed in px/s */
  baseWindVx: number;
  /** Instantaneous gust surge factor (0..1) */
  gustIntensity: number;
  /** Combined effective horizontal wind velocity in px/s */
  effectiveWindVx: number;
  /** Vertical thermal updraft / downdraft velocity in px/s */
  verticalDraftVy: number;
  /** Slant angle in radians for rain, blizzard, and wind ribbons */
  slantAngleRad: number;
}

export interface WeatherSkyFrameState {
  activeWeather: WeatherEffectId;
  isNight: boolean;
  wind: WeatherWindState;
  renderedLayerCount: number;
  renderedParticleCount: number;
  sheetLightningAlpha: number;
  activeShootingStars: number;
}

export function createReusableWeatherSkyState(): WeatherSkyFrameState {
  return {
    activeWeather: 'snow',
    isNight: false,
    wind: {
      baseWindVx: 36,
      gustIntensity: 0,
      effectiveWindVx: 36,
      verticalDraftVy: 0,
      slantAngleRad: 0.18,
    },
    renderedLayerCount: 0,
    renderedParticleCount: 0,
    sheetLightningAlpha: 0,
    activeShootingStars: 0,
  };
}

export interface CachedWeatherSkyCanvases {
  snowflakeCrispCanvas: HTMLCanvasElement;
  snowflakeSoftCanvas: HTMLCanvasElement;
  snowBokehCanvas: HTMLCanvasElement;
  iceCrystalCanvas: HTMLCanvasElement;
  petalPinkCanvas: HTMLCanvasElement;
  petalLilacCanvas: HTMLCanvasElement;
  petalGoldCanvas: HTMLCanvasElement;
  dandelionPappusCanvas: HTMLCanvasElement;
  leafGoldOakCanvas: HTMLCanvasElement;
  leafCrimsonMapleCanvas: HTMLCanvasElement;
  leafAmberPlumCanvas: HTMLCanvasElement;
  fireflyEmeraldCanvas: HTMLCanvasElement;
  fireflyGoldCanvas: HTMLCanvasElement;
  wispCyanCanvas: HTMLCanvasElement;
  fogBankCoolCanvas: HTMLCanvasElement;
  fogBankWarmCanvas: HTMLCanvasElement;
  nightCloudCanvas: HTMLCanvasElement;
  starGlintCanvas: HTMLCanvasElement;
  rainSplashRippleCanvas: HTMLCanvasElement;
  windCurlCanvas: HTMLCanvasElement;
}

let cachedWeatherCanvases: CachedWeatherSkyCanvases | null = null;

function createOffscreen(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
} {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }
  return {
    canvas: { width, height } as HTMLCanvasElement,
    ctx: null,
  };
}

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

function wrapSpan(value: number, span: number): number {
  if (span <= 0.001) return 0;
  return ((value % span) + span) % span;
}

function bakeSixPointedSnowflake(size: number, hasInkContour: boolean): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;

  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.4;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Soft icy halo
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 1.15);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.55, 'rgba(186, 230, 253, 0.45)');
  grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();

  const drawBranches = () => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      ctx.moveTo(0, 0);
      ctx.lineTo(cos * r, sin * r);

      // Chevron barbs along each branch
      const bDist = r * 0.58;
      const bx = cos * bDist;
      const by = sin * bDist;
      const barbLen = r * 0.34;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ang - 0.55) * barbLen, by + Math.sin(ang - 0.55) * barbLen);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(ang + 0.55) * barbLen, by + Math.sin(ang + 0.55) * barbLen);
    }
  };

  if (hasInkContour) {
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.72)';
    ctx.lineWidth = 4.2;
    drawBranches();
    ctx.stroke();
  }

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = hasInkContour ? 2.4 : 2.0;
  drawBranches();
  ctx.stroke();

  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return canvas;
}

function bakeSoftBokehDisc(size: number, innerColor: string, midColor: string): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const r = size * 0.5;
  const grad = ctx.createRadialGradient(r, r, 1, r, r, r);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.55, midColor);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function bakeIceCrystalDiamond(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.42;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.92)';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 0.35, -r * 0.35, r * 0.72, 0);
  ctx.quadraticCurveTo(r * 0.35, r * 0.35, 0, r);
  ctx.quadraticCurveTo(-r * 0.35, r * 0.35, -r * 0.72, 0);
  ctx.quadraticCurveTo(-r * 0.35, -r * 0.35, 0, -r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return canvas;
}

function bakeBlossomPetal(size: number, fillHex: string, highlightHex: string): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.38;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = fillHex;
  ctx.strokeStyle = '#231409';
  ctx.lineWidth = 1.8;

  // Heart-notched blossom petal shape
  ctx.beginPath();
  ctx.moveTo(0, r);
  ctx.bezierCurveTo(-r * 1.15, r * 0.35, -r * 1.05, -r * 0.85, -r * 0.25, -r * 0.95);
  ctx.lineTo(0, -r * 0.58);
  ctx.lineTo(r * 0.25, -r * 0.95);
  ctx.bezierCurveTo(r * 1.05, -r * 0.85, r * 1.15, r * 0.35, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = highlightHex;
  ctx.beginPath();
  ctx.ellipse(-r * 0.24, -r * 0.15, r * 0.25, r * 0.42, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return canvas;
}

function bakeDandelionPappusSeed(size: number): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = 'round';

  // Soft white fluffy parachute halo at top
  const halo = ctx.createRadialGradient(0, -8, 1, 0, -8, 12);
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  halo.addColorStop(0.6, 'rgba(254, 249, 195, 0.45)');
  halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, -8, 12, 0, Math.PI * 2);
  ctx.fill();

  // Delicate pappus filaments fanning upward
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = 1.3;
  const angles = [-0.95, -0.58, -0.22, 0.22, 0.58, 0.95];
  for (let i = 0; i < angles.length; i++) {
    const a = angles[i] - Math.PI * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(Math.cos(a) * 11, -2 + Math.sin(a) * 11);
    ctx.stroke();
  }

  // Slender stem & tiny brown achene seed at bottom
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, 9);
  ctx.stroke();

  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.ellipse(0, 10.5, 1.8, 3.0, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return canvas;
}

function bakeAutumnLeaf(
  size: number,
  bodyColor: string,
  veinColor: string,
  variant: 'oak' | 'maple' | 'plum'
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.38;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#231409';
  ctx.lineWidth = 1.9;

  ctx.beginPath();
  if (variant === 'oak') {
    // Lobed Ladovský oak leaf
    ctx.moveTo(0, r);
    ctx.bezierCurveTo(-r * 0.85, r * 0.65, -r * 1.05, r * 0.1, -r * 0.55, 0);
    ctx.bezierCurveTo(-r * 1.1, -r * 0.35, -r * 0.65, -r * 0.9, 0, -r);
    ctx.bezierCurveTo(r * 0.65, -r * 0.9, r * 1.1, -r * 0.35, r * 0.55, 0);
    ctx.bezierCurveTo(r * 1.05, r * 0.1, r * 0.85, r * 0.65, 0, r);
  } else if (variant === 'maple') {
    // Pointed crimson maple leaf
    ctx.moveTo(0, r * 0.9);
    ctx.lineTo(-r * 0.85, r * 0.35);
    ctx.lineTo(-r * 0.45, 0);
    ctx.lineTo(-r * 0.95, -r * 0.45);
    ctx.lineTo(-r * 0.28, -r * 0.48);
    ctx.lineTo(0, -r);
    ctx.lineTo(r * 0.28, -r * 0.48);
    ctx.lineTo(r * 0.95, -r * 0.45);
    ctx.lineTo(r * 0.45, 0);
    ctx.lineTo(r * 0.85, r * 0.35);
  } else {
    // Tapered plum / orchard leaf
    ctx.moveTo(0, r);
    ctx.quadraticCurveTo(-r * 0.9, 0, 0, -r);
    ctx.quadraticCurveTo(r * 0.9, 0, 0, r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central midrib & side veins
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(0, r * 1.18);
  ctx.lineTo(0, -r * 0.72);
  ctx.moveTo(0, r * 0.25);
  ctx.lineTo(-r * 0.42, -r * 0.1);
  ctx.moveTo(0, -r * 0.05);
  ctx.lineTo(r * 0.42, -r * 0.38);
  ctx.stroke();

  ctx.restore();
  return canvas;
}

function bakeGlowingOrbStamp(
  size: number,
  coreHex: string,
  midRgba: string,
  outerRgba: string
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const r = size * 0.5;
  const grad = ctx.createRadialGradient(r, r, 1, r, r, r);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.22, coreHex);
  grad.addColorStop(0.58, midRgba);
  grad.addColorStop(1, outerRgba);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function bakeRollingFogBank(
  width: number,
  height: number,
  innerRgba: string,
  midRgba: string
): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(width, height);
  if (!ctx) return canvas;

  const cx = width * 0.5;
  const cy = height * 0.5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, height / width);
  const r = width * 0.48;
  const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
  grad.addColorStop(0, innerRgba);
  grad.addColorStop(0.55, midRgba);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return canvas;
}

function bakeNightCloudSprite(width = 340, height = 148): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(width, height);
  if (!ctx) return canvas;

  const cx = width * 0.5;
  const cy = height * 0.58;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const bodyGrad = ctx.createLinearGradient(0, -height * 0.42, 0, height * 0.3);
  bodyGrad.addColorStop(0, 'rgba(51, 65, 85, 0.82)');
  bodyGrad.addColorStop(0.55, 'rgba(30, 41, 59, 0.78)');
  bodyGrad.addColorStop(1, 'rgba(15, 23, 42, 0.68)');

  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(-112, 22);
    ctx.bezierCurveTo(-140, 20, -144, -12, -112, -20);
    ctx.bezierCurveTo(-106, -50, -68, -62, -40, -44);
    ctx.bezierCurveTo(-18, -76, 34, -78, 52, -42);
    ctx.bezierCurveTo(86, -56, 126, -34, 118, -4);
    ctx.bezierCurveTo(142, 4, 138, 26, 106, 26);
    ctx.bezierCurveTo(42, 32, -42, 32, -112, 22);
    ctx.closePath();
  };

  trace();
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Silvery-blue moonlight crest along top puffs
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.arc(4, -34, 34, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();

  trace();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.lineWidth = 3.2;
  ctx.stroke();

  ctx.restore();
  return canvas;
}

function bakeStarGlintSprite(size = 48): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(size, size);
  if (!ctx) return canvas;
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.44;

  ctx.save();
  ctx.translate(cx, cy);

  const halo = ctx.createRadialGradient(0, 0, 1, 0, 0, r);
  halo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  halo.addColorStop(0.35, 'rgba(254, 240, 138, 0.55)');
  halo.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // 4-pointed fairytale star rays
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(2.2, -2.2, r, 0);
  ctx.quadraticCurveTo(2.2, 2.2, 0, r);
  ctx.quadraticCurveTo(-2.2, 2.2, -r, 0);
  ctx.quadraticCurveTo(-2.2, -2.2, 0, -r);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  return canvas;
}

function bakeRainSplashRippleSprite(width = 72, height = 32): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(width, height);
  if (!ctx) return canvas;
  const cx = width * 0.5;
  const cy = height * 0.55;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.82)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.44, height * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, width * 0.24, height * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  return canvas;
}

function bakeWindCurlRibbonSprite(width = 220, height = 64): HTMLCanvasElement {
  const { canvas, ctx } = createOffscreen(width, height);
  if (!ctx) return canvas;

  ctx.save();
  ctx.lineCap = 'round';
  const grad = ctx.createLinearGradient(10, 0, width - 10, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.35, 'rgba(255, 251, 235, 0.42)');
  grad.addColorStop(0.75, 'rgba(254, 243, 199, 0.52)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(12, height * 0.62);
  ctx.bezierCurveTo(
    width * 0.32,
    height * 0.32,
    width * 0.58,
    height * 0.78,
    width * 0.84,
    height * 0.42
  );
  // Characteristic Ladovský spiral curl at the leading tip
  ctx.bezierCurveTo(
    width * 0.94,
    height * 0.24,
    width * 0.86,
    height * 0.12,
    width * 0.78,
    height * 0.26
  );
  ctx.stroke();
  ctx.restore();
  return canvas;
}

export function getWeatherSkyOffscreenCanvases(): CachedWeatherSkyCanvases {
  if (cachedWeatherCanvases) {
    return cachedWeatherCanvases;
  }

  cachedWeatherCanvases = {
    snowflakeCrispCanvas: bakeSixPointedSnowflake(40, true),
    snowflakeSoftCanvas: bakeSixPointedSnowflake(32, false),
    snowBokehCanvas: bakeSoftBokehDisc(56, 'rgba(255, 255, 255, 0.85)', 'rgba(224, 242, 254, 0.38)'),
    iceCrystalCanvas: bakeIceCrystalDiamond(28),
    petalPinkCanvas: bakeBlossomPetal(28, '#F9A8D4', '#FDF2F8'),
    petalLilacCanvas: bakeBlossomPetal(28, '#D8B4FE', '#F3E8FF'),
    petalGoldCanvas: bakeBlossomPetal(28, '#FACC15', '#FEF9C3'),
    dandelionPappusCanvas: bakeDandelionPappusSeed(34),
    leafGoldOakCanvas: bakeAutumnLeaf(34, '#F59E0B', '#FEF08A', 'oak'),
    leafCrimsonMapleCanvas: bakeAutumnLeaf(34, '#DC2626', '#FCA5A5', 'maple'),
    leafAmberPlumCanvas: bakeAutumnLeaf(32, '#D97706', '#FDE68A', 'plum'),
    fireflyEmeraldCanvas: bakeGlowingOrbStamp(
      44,
      '#A3E635',
      'rgba(163, 230, 53, 0.42)',
      'rgba(163, 230, 53, 0)'
    ),
    fireflyGoldCanvas: bakeGlowingOrbStamp(
      44,
      '#FDE047',
      'rgba(250, 204, 21, 0.45)',
      'rgba(250, 204, 21, 0)'
    ),
    wispCyanCanvas: bakeGlowingOrbStamp(
      48,
      '#38BDF8',
      'rgba(56, 189, 248, 0.38)',
      'rgba(56, 189, 248, 0)'
    ),
    fogBankCoolCanvas: bakeRollingFogBank(
      360,
      140,
      'rgba(186, 210, 235, 0.22)',
      'rgba(148, 175, 205, 0.11)'
    ),
    fogBankWarmCanvas: bakeRollingFogBank(
      360,
      140,
      'rgba(254, 243, 199, 0.18)',
      'rgba(214, 211, 209, 0.09)'
    ),
    nightCloudCanvas: bakeNightCloudSprite(340, 148),
    starGlintCanvas: bakeStarGlintSprite(44),
    rainSplashRippleCanvas: bakeRainSplashRippleSprite(72, 32),
    windCurlCanvas: bakeWindCurlRibbonSprite(220, 64),
  };

  return cachedWeatherCanvases;
}

/**
 * Normalizes any level `weatherEffect` or `weatherOverride` string to a canonical `WeatherEffectId`.
 */
export function resolveWeatherEffectId(
  rawWeather?: string | null,
  levelId?: number,
  season?: string
): WeatherEffectId {
  if (rawWeather) {
    if (rawWeather === 'leaves') return 'falling_leaves';
    if (
      rawWeather === 'ice_drift' ||
      rawWeather === 'snow' ||
      rawWeather === 'blizzard' ||
      rawWeather === 'petals' ||
      rawWeather === 'fog' ||
      rawWeather === 'fireflies' ||
      rawWeather === 'rain' ||
      rawWeather === 'sunflower_bloom' ||
      rawWeather === 'shooting_stars' ||
      rawWeather === 'falling_leaves'
    ) {
      return rawWeather;
    }
  }
  if (levelId === 0) return 'ice_drift';
  if (levelId === 7) return 'fireflies';
  if (levelId === 9) return 'rain';
  if (levelId === 10) return 'sunflower_bloom';
  if (levelId === 11) return 'shooting_stars';
  if (season === 'winter') return 'snow';
  if (season === 'autumn') return 'falling_leaves';
  return 'petals';
}

/**
 * Computes the continuous wind-gust envelope for the current weather and time.
 */
export function computeWeatherWindState(
  timeSeconds: number,
  weather: WeatherEffectId,
  outWind: WeatherWindState
): WeatherWindState {
  const t = timeSeconds || 0;
  // Smooth compound wave producing periodic wind swells every ~6-9 seconds
  const rawWave =
    0.5 +
    0.32 * Math.sin(t * 0.72) +
    0.18 * Math.sin(t * 1.55 + 1.1);
  const gustIntensity = clamp(rawWave, 0, 1);

  let baseVx = 42;
  let gustBoostVx = 48;
  let draftVy = Math.sin(t * 1.15) * 8;
  let slant = 0.16;

  if (weather === 'blizzard') {
    baseVx = -185;
    gustBoostVx = -140;
    draftVy = 32;
    slant = -0.58 - gustIntensity * 0.18;
  } else if (weather === 'rain') {
    baseVx = -95;
    gustBoostVx = -65;
    draftVy = 45;
    slant = -0.26 - gustIntensity * 0.12;
  } else if (weather === 'falling_leaves' || weather === 'leaves') {
    baseVx = 62;
    gustBoostVx = 95;
    draftVy = Math.sin(t * 1.8) * 18;
    slant = 0.28 + gustIntensity * 0.22;
  } else if (weather === 'petals' || weather === 'sunflower_bloom') {
    baseVx = 38;
    gustBoostVx = 56;
    draftVy = Math.sin(t * 1.4) * 14;
    slant = 0.2 + gustIntensity * 0.15;
  } else if (weather === 'snow') {
    baseVx = 28;
    gustBoostVx = 46;
    draftVy = Math.sin(t * 0.9) * 10;
    slant = 0.14 + gustIntensity * 0.14;
  } else if (weather === 'fog' || weather === 'fireflies') {
    baseVx = 18;
    gustBoostVx = 22;
    draftVy = Math.sin(t * 0.7) * 6;
    slant = 0.08;
  }

  outWind.baseWindVx = baseVx;
  outWind.gustIntensity = gustIntensity;
  outWind.effectiveWindVx = baseVx + gustBoostVx * gustIntensity;
  outWind.verticalDraftVy = draftVy;
  outWind.slantAngleRad = slant;
  return outWind;
}

export interface WeatherSkyRenderOptions {
  levelId?: number;
  season?: string;
  weatherEffect?: string | null;
  weatherOverride?: string | null;
  dayPhaseId?: string;
  performanceProfile?: 'performance' | 'balanced' | 'fidelity';
}

/**
 * Renders the animated multi-plane weather and sky overlay onto the target canvas.
 * Strictly zero-allocation and 60+ FPS friendly via cached offscreen stamps.
 */
export function renderWeatherAndSkyOverlay(
  ctx: CanvasRenderingContext2D,
  screenWidth: number,
  screenHeight: number,
  cameraX: number,
  cameraY: number,
  timeSeconds: number,
  options?: WeatherSkyRenderOptions,
  outState?: WeatherSkyFrameState
): WeatherSkyFrameState {
  const state = outState || createReusableWeatherSkyState();
  const stamps = getWeatherSkyOffscreenCanvases();

  const levelId = options?.levelId ?? 0;
  const rawWeather = options?.weatherOverride || options?.weatherEffect;
  const weather = resolveWeatherEffectId(rawWeather, levelId, options?.season);
  const phaseId = options?.dayPhaseId || 'noon';
  const isNight =
    levelId % 2 === 1 ||
    phaseId === 'dusk' ||
    phaseId === 'night' ||
    phaseId === 'midnight';

  const densityMult =
    options?.performanceProfile === 'performance'
      ? 0.55
      : options?.performanceProfile === 'fidelity'
        ? 1.25
        : 1.0;

  state.activeWeather = weather;
  state.isNight = isNight;
  state.renderedLayerCount = 0;
  state.renderedParticleCount = 0;
  state.sheetLightningAlpha = 0;
  state.activeShootingStars = 0;

  const wind = computeWeatherWindState(timeSeconds, weather, state.wind);
  const t = timeSeconds || 0;

  ctx.save();

  // ============================================================================
  // 1. NIGHT SKY HORIZON CANOPY: Twinkling Stars, Night Clouds & Shooting Stars
  // ============================================================================
  if (isNight) {
    state.renderedLayerCount++;
    const starCount = Math.max(8, Math.round((weather === 'shooting_stars' ? 24 : 14) * densityMult));
    const skyBandH = Math.min(280, screenHeight * 0.34);

    for (let i = 0; i < starCount; i++) {
      // 0.14x deep sky parallax
      const rawX = i * 197.3 - cameraX * 0.14 + t * 1.2;
      const rawY = i * 83.7 - cameraY * 0.08;
      const sx = wrapSpan(rawX, screenWidth + 80) - 40;
      const sy = 18 + wrapSpan(rawY, skyBandH);

      const twinkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * (2.1 + (i % 5) * 0.55) + i * 1.9), 2);
      const starSize = (14 + (i % 4) * 5) * (0.85 + twinkle * 0.3);

      ctx.globalAlpha = twinkle * (weather === 'fog' || weather === 'blizzard' ? 0.42 : 0.78);
      ctx.drawImage(
        stamps.starGlintCanvas,
        sx - starSize * 0.5,
        sy - starSize * 0.5,
        starSize,
        starSize
      );
      state.renderedParticleCount++;
    }

    // Moonlit drifting night clouds along the upper sky (0.32x parallax + gentle bobbing)
    const nightCloudCount = 2;
    for (let c = 0; c < nightCloudCount; c++) {
      const cDriftX = c * (screenWidth * 0.55) - cameraX * 0.32 + t * (9 + c * 3);
      const cx = wrapSpan(cDriftX, screenWidth + 420) - 210;
      const cy = 64 + c * 44 + Math.sin(t * 0.85 + c * 2.1) * 7 - wrapSpan(cameraY * 0.16, 48);
      const cw = Math.round((290 + c * 35) * (1 + Math.sin(t * 1.1 + c) * 0.035));
      const ch = Math.round((126 + c * 14) * (1 - Math.sin(t * 1.1 + c) * 0.025));

      ctx.globalAlpha = weather === 'rain' || weather === 'blizzard' ? 0.52 : 0.38;
      ctx.drawImage(stamps.nightCloudCanvas, cx - cw * 0.5, cy - ch * 0.5, cw, ch);
      state.renderedParticleCount++;
    }

    // Perseid Shooting Stars ("Slzy svatého Vavřince") — frequent in 'shooting_stars', occasional in clear night stages
    const meteorSlots = weather === 'shooting_stars' ? 3 : weather === 'fireflies' || weather === 'snow' ? 1 : 0;
    for (let m = 0; m < meteorSlots; m++) {
      const period = weather === 'shooting_stars' ? 3.2 : 7.5;
      const cyclePos = ((t + m * 1.37) % period) / period;
      if (cyclePos < 0.38) {
        const p = cyclePos / 0.38; // 0..1 active streak
        const seed = Math.floor((t + m * 1.37) / period) * 131 + m * 53;
        const startX = 180 + (seed % Math.max(200, screenWidth - 260));
        const startY = 28 + ((seed * 37) % Math.max(80, Math.floor(screenHeight * 0.25)));
        const travelX = -260 * p;
        const travelY = 155 * p;
        const headX = startX + travelX;
        const headY = startY + travelY;
        const tailLen = 95 * Math.sin(p * Math.PI);
        const alpha = Math.sin(p * Math.PI) * 0.92;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX + tailLen * 0.85, headY - tailLen * 0.52);
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX + tailLen * 0.42, headY - tailLen * 0.26);
        ctx.stroke();

        const sparkSize = 24 + Math.sin(p * Math.PI) * 10;
        ctx.drawImage(
          stamps.starGlintCanvas,
          headX - sparkSize * 0.5,
          headY - sparkSize * 0.5,
          sparkSize,
          sparkSize
        );
        ctx.restore();

        state.activeShootingStars++;
        state.renderedParticleCount++;
      }
    }
  }

  // ============================================================================
  // 2. SEASONAL WEATHER LAYERS (Multi-Plane 3D Parallax & Organic Kinematics)
  // ============================================================================
  if (weather === 'snow' || weather === 'blizzard') {
    state.renderedLayerCount += 3;
    const isBlizzard = weather === 'blizzard';
    const farCount = Math.round((isBlizzard ? 42 : 26) * densityMult);
    const midCount = Math.round((isBlizzard ? 34 : 22) * densityMult);
    const nearCount = Math.round((isBlizzard ? 12 : 7) * densityMult);

    // Plane A (0.45x Parallax): Distant crisp snow motes (batched path)
    ctx.fillStyle = isBlizzard ? 'rgba(224, 242, 254, 0.78)' : 'rgba(255, 255, 255, 0.72)';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i < farCount; i++) {
      const speedY = isBlizzard ? 155 + (i % 5) * 22 : 52 + (i % 5) * 10;
      const swayX = Math.sin(t * 1.8 + i * 0.9) * (isBlizzard ? 26 : 16);
      const sx = wrapSpan(
        i * 137.5 + t * wind.effectiveWindVx * 0.55 + swayX - cameraX * 0.45,
        screenWidth + 40
      ) - 20;
      const sy = wrapSpan(
        i * 89.3 + t * speedY - cameraY * 0.45,
        screenHeight + 40
      ) - 20;
      const r = 1.6 + (i % 3) * 0.65;
      ctx.moveTo(sx + r, sy);
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      state.renderedParticleCount++;
    }
    ctx.fill();

    // Plane B (0.92x Parallax): Mid-plane rotating 6-pointed Ladovské snowflakes
    for (let i = 0; i < midCount; i++) {
      const speedY = isBlizzard ? 230 + (i % 6) * 28 : 82 + (i % 6) * 14;
      const swayAmp = isBlizzard ? 34 : 24;
      const swayX = Math.sin(t * (1.5 + (i % 4) * 0.3) + i * 1.3) * swayXFactor(i, swayAmp);
      const sx = wrapSpan(
        i * 173.1 + t * wind.effectiveWindVx + swayX - cameraX * 0.92,
        screenWidth + 80
      ) - 40;
      const sy = wrapSpan(
        i * 113.7 + t * speedY - cameraY * 0.92,
        screenHeight + 80
      ) - 40;
      const size = 15 + (i % 4) * 4.5;
      const rot = t * (0.9 + (i % 3) * 0.45) * (i % 2 === 0 ? 1 : -1) + i;
      const stamp = i % 3 === 0 ? stamps.snowflakeCrispCanvas : stamps.snowflakeSoftCanvas;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rot);
      ctx.globalAlpha = isBlizzard ? 0.88 : 0.82;
      ctx.drawImage(stamp, -size * 0.5, -size * 0.5, size, size);
      ctx.restore();
      state.renderedParticleCount++;
    }

    // Plane C (1.42x Parallax): Foreground out-of-focus bokeh snow puffs passing close to camera lens
    for (let i = 0; i < nearCount; i++) {
      const speedY = isBlizzard ? 340 + (i % 4) * 40 : 128 + (i % 4) * 20;
      const sx = wrapSpan(
        i * 263.7 + t * wind.effectiveWindVx * 1.45 + Math.sin(t * 1.2 + i) * 32 - cameraX * 1.42,
        screenWidth + 120
      ) - 60;
      const sy = wrapSpan(
        i * 197.3 + t * speedY - cameraY * 1.42,
        screenHeight + 120
      ) - 60;
      const bokehSize = 30 + (i % 3) * 10;
      ctx.globalAlpha = isBlizzard ? 0.42 : 0.3;
      ctx.drawImage(
        stamps.snowBokehCanvas,
        sx - bokehSize * 0.5,
        sy - bokehSize * 0.5,
        bokehSize,
        bokehSize
      );
      state.renderedParticleCount++;
    }

    // Blizzard howling diagonal wind streaks
    if (isBlizzard) {
      const streakCount = Math.round(14 * densityMult);
      ctx.save();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.34)';
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let s = 0; s < streakCount; s++) {
        const sx = wrapSpan(
          s * 211 - t * 620 - cameraX * 1.1,
          screenWidth + 240
        ) - 120;
        const sy = wrapSpan(
          s * 139 + t * 290 - cameraY * 1.1,
          screenHeight + 160
        ) - 80;
        const len = 75 + (s % 4) * 25;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - len, sy + len * 0.45);
        state.renderedParticleCount++;
      }
      ctx.stroke();
      ctx.restore();
    }
  } else if (weather === 'ice_drift') {
    // Stage 1 Předjaří: Thawing ice-crystal glints, drifting spring mist ribbons & sunlit water motes
    state.renderedLayerCount += 2;
    const crystalCount = Math.round(22 * densityMult);
    for (let i = 0; i < crystalCount; i++) {
      const sx = wrapSpan(
        i * 167.3 + t * (28 + (i % 4) * 7) + Math.sin(t * 1.6 + i) * 22 - cameraX * 0.78,
        screenWidth + 60
      ) - 30;
      const sy = wrapSpan(
        i * 109.1 + t * (26 + (i % 3) * 8) + Math.cos(t * 1.3 + i) * 12 - cameraY * 0.78,
        screenHeight + 60
      ) - 30;
      const shimmer = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.8 + i * 1.4));
      const size = (12 + (i % 3) * 4) * (0.85 + shimmer * 0.25);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.8 + i);
      ctx.globalAlpha = shimmer * 0.78;
      ctx.drawImage(stamps.iceCrystalCanvas, -size * 0.5, -size * 0.5, size, size);
      ctx.restore();
      state.renderedParticleCount++;
    }

    // Subtle rising thaw mist along lower arena
    for (let m = 0; m < 5; m++) {
      const mx = wrapSpan(m * 340 + t * 20 - cameraX * 0.55, screenWidth + 360) - 180;
      const my = screenHeight * 0.65 + (m % 2) * 90 + Math.sin(t * 0.9 + m) * 18;
      ctx.globalAlpha = 0.28 + 0.1 * Math.sin(t * 1.1 + m);
      ctx.drawImage(stamps.fogBankWarmCanvas, mx - 180, my - 70, 360, 140);
      state.renderedParticleCount++;
    }
  } else if (weather === 'petals' || weather === 'sunflower_bloom') {
    // Spring & Summer Blossoms + Pendulum-Swaying Dandelion Pappus Seeds
    state.renderedLayerCount += 2;
    const count = Math.round(28 * densityMult);
    const isHarvest = weather === 'sunflower_bloom';

    for (let i = 0; i < count; i++) {
      const depth = i % 3 === 0 ? 1.22 : 0.85;
      const isDandelionSeed = !isHarvest && i % 4 === 0;
      const swayPhase = t * (1.7 + (i % 4) * 0.35) + i * 1.5;
      const flutterSwayX = Math.sin(swayPhase) * 28;
      // Updraft bobbing so dandelion seeds and petals momentarily float upward in spring thermals
      const thermalLiftY = Math.cos(swayPhase * 0.8) * 14;

      const sx = wrapSpan(
        i * 157.9 + t * wind.effectiveWindVx * depth + flutterSwayX - cameraX * depth,
        screenWidth + 80
      ) - 40;
      const sy = wrapSpan(
        i * 103.3 + t * (34 + (i % 5) * 7) * depth + thermalLiftY - cameraY * depth,
        screenHeight + 80
      ) - 40;

      ctx.save();
      ctx.translate(sx, sy);

      if (isDandelionSeed) {
        // Dandelion pappus rocks like a gentle parachute pendulum
        const pendulumTilt = Math.sin(swayPhase) * 0.38 + wind.slantAngleRad * 0.5;
        ctx.rotate(pendulumTilt);
        const sz = 24 * depth;
        ctx.globalAlpha = 0.88;
        ctx.drawImage(stamps.dandelionPappusCanvas, -sz * 0.5, -sz * 0.5, sz, sz);
      } else {
        // 3D tumbling blossom petal (rotates and oscillates horizontal scale to mimic flipping in the breeze)
        const tumbleRot = t * (1.4 + (i % 3) * 0.5) * (i % 2 === 0 ? 1 : -1) + i;
        const flipScaleX = 0.45 + 0.55 * Math.abs(Math.cos(t * 2.6 + i));
        ctx.rotate(tumbleRot);
        ctx.scale(flipScaleX, 1);

        const stamp = isHarvest
          ? stamps.petalGoldCanvas
          : levelId === 4
            ? i % 2 === 0
              ? stamps.petalLilacCanvas
              : stamps.petalPinkCanvas
            : i % 3 === 0
              ? stamps.petalGoldCanvas
              : stamps.petalPinkCanvas;
        const sz = (17 + (i % 3) * 3) * depth;
        ctx.globalAlpha = 0.86;
        ctx.drawImage(stamp, -sz * 0.5, -sz * 0.5, sz, sz);
      }
      ctx.restore();
      state.renderedParticleCount++;
    }
  } else if (weather === 'falling_leaves') {
    // Autumn Foliage: Tumbling golden oak, crimson maple & amber plum leaves riding wind gusts
    state.renderedLayerCount += 2;
    const leafCount = Math.round(30 * densityMult);

    for (let i = 0; i < leafCount; i++) {
      const depth = i % 4 === 0 ? 1.28 : 0.88;
      const swayPhase = t * (1.8 + (i % 5) * 0.3) + i * 1.7;
      // Sweeping figure-S arc as leaves catch wind gusts
      const arcX = Math.sin(swayPhase) * 36 + Math.cos(swayPhase * 0.5) * 18 * wind.gustIntensity;
      const liftY = -Math.abs(Math.sin(swayPhase)) * 14;

      const sx = wrapSpan(
        i * 163.7 + t * wind.effectiveWindVx * depth + arcX - cameraX * depth,
        screenWidth + 90
      ) - 45;
      const sy = wrapSpan(
        i * 97.1 + t * (46 + (i % 5) * 9) * depth + liftY - cameraY * depth,
        screenHeight + 90
      ) - 45;

      const rot = t * (1.6 + (i % 4) * 0.4) * (i % 2 === 0 ? 1 : -1) + Math.sin(swayPhase) * 0.5;
      const flutterScaleY = 0.52 + 0.48 * Math.abs(Math.sin(t * 2.9 + i));
      const sz = (20 + (i % 3) * 4) * depth;
      const stamp =
        i % 3 === 0
          ? stamps.leafGoldOakCanvas
          : i % 3 === 1
            ? stamps.leafCrimsonMapleCanvas
            : stamps.leafAmberPlumCanvas;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rot);
      ctx.scale(1, flutterScaleY);
      ctx.globalAlpha = 0.88;
      ctx.drawImage(stamp, -sz * 0.5, -sz * 0.5, sz, sz);
      ctx.restore();
      state.renderedParticleCount++;
    }
  } else if (weather === 'rain') {
    // Stage 10 Bouře sv. Eliáše: 2-Plane Wind-Slanted Rain + Ground Splash Ripples + Sheet Lightning
    state.renderedLayerCount += 3;
    const farDrops = Math.round(38 * densityMult);
    const nearDrops = Math.round(26 * densityMult);
    const splashCount = Math.round(14 * densityMult);

    const slantDx = Math.sin(wind.slantAngleRad) * 34;
    const slantDy = Math.cos(wind.slantAngleRad) * 34;

    // Far rain plane
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.46)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < farDrops; i++) {
      const sx = wrapSpan(
        i * 129.3 + t * wind.effectiveWindVx * 2.2 - cameraX * 0.65,
        screenWidth + 80
      ) - 40;
      const sy = wrapSpan(
        i * 83.9 + t * 540 - cameraY * 0.65,
        screenHeight + 80
      ) - 40;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + slantDx * 0.75, sy + slantDy * 0.75);
      state.renderedParticleCount++;
    }
    ctx.stroke();

    // Near rain plane
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    for (let i = 0; i < nearDrops; i++) {
      const sx = wrapSpan(
        i * 181.7 + t * wind.effectiveWindVx * 3.1 - cameraX * 1.15,
        screenWidth + 100
      ) - 50;
      const sy = wrapSpan(
        i * 119.3 + t * 760 - cameraY * 1.15,
        screenHeight + 100
      ) - 50;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + slantDx * 1.15, sy + slantDy * 1.15);
      state.renderedParticleCount++;
    }
    ctx.stroke();

    // Expanding elliptical puddle splash rings across the arena ground
    for (let s = 0; s < splashCount; s++) {
      const cycleDur = 0.75 + (s % 4) * 0.15;
      const phase = ((t + s * 0.23) % cycleDur) / cycleDur;
      const seed = Math.floor((t + s * 0.23) / cycleDur) * 73 + s * 139;
      const rx = wrapSpan(seed * 97 - cameraX, screenWidth - 40) + 20;
      const ry = wrapSpan(seed * 61 - cameraY, screenHeight - 40) + 20;
      const scale = 0.35 + phase * 0.85;
      const alpha = (1 - phase) * 0.68;

      ctx.globalAlpha = alpha;
      const w = 54 * scale;
      const h = 24 * scale;
      ctx.drawImage(stamps.rainSplashRippleCanvas, rx - w * 0.5, ry - h * 0.5, w, h);
      state.renderedParticleCount++;
    }

    // Periodic upper-sky sheet lightning illumination pulse
    const sheetWave = Math.sin(t * 1.9) * Math.sin(t * 4.7);
    if (sheetWave > 0.78) {
      const flashAlpha = ((sheetWave - 0.78) / 0.22) * 0.16;
      state.sheetLightningAlpha = flashAlpha;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(186, 230, 253, ${flashAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, screenWidth, screenHeight);
    }
  } else if (weather === 'fog') {
    // 3-Layer Parallax Rolling Marsh & Graveyard Mist + Floating Spectral Wisps
    state.renderedLayerCount += 3;
    const fogCount = Math.round(18 * densityMult);

    for (let i = 0; i < fogCount; i++) {
      const layer = i % 3; // 0 = far, 1 = mid, 2 = near
      const parallax = layer === 0 ? 0.42 : layer === 1 ? 0.78 : 1.18;
      const speedX = (14 + layer * 9) * (i % 2 === 0 ? 1 : -0.75);
      const sx = wrapSpan(
        i * 210 + t * speedX - cameraX * parallax,
        screenWidth + 420
      ) - 210;
      const sy = wrapSpan(
        i * 71 + Math.sin(t * 0.65 + i * 1.3) * 34 - cameraY * parallax,
        screenHeight + 160
      ) - 80;

      const breathe = 1 + Math.sin(t * 0.9 + i) * 0.12;
      const fw = (320 + layer * 65) * breathe;
      const fh = (130 + layer * 24) * (2 - breathe);
      const pulseAlpha = (0.38 + 0.22 * Math.sin(t * 0.8 + i * 1.7)) * (layer === 2 ? 0.72 : 0.92);

      ctx.globalAlpha = pulseAlpha;
      const stamp = i % 3 === 0 ? stamps.fogBankWarmCanvas : stamps.fogBankCoolCanvas;
      ctx.drawImage(stamp, sx - fw * 0.5, sy - fh * 0.5, fw, fh);
      state.renderedParticleCount++;
    }

    // Floating spectral marsh wisps (`bludičky` motes) weaving through the fog
    const wispCount = Math.round(10 * densityMult);
    for (let w = 0; w < wispCount; w++) {
      const wx = wrapSpan(
        w * 193 + Math.sin(t * 1.1 + w * 2.1) * 55 - cameraX * 0.88,
        screenWidth + 60
      ) - 30;
      const wy = wrapSpan(
        w * 127 + Math.cos(t * 0.95 + w * 1.4) * 42 - cameraY * 0.88,
        screenHeight + 60
      ) - 30;
      const glowPulse = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.6 + w * 1.8), 2);
      const sz = 22 + glowPulse * 14;
      ctx.globalAlpha = glowPulse * 0.75;
      ctx.drawImage(stamps.wispCyanCanvas, wx - sz * 0.5, wy - sz * 0.5, sz, sz);
      state.renderedParticleCount++;
    }
  } else if (weather === 'fireflies') {
    // Stage 8 Červnová noc: Enchanted St. John's Fireflies (Svatojánské mušky) weaving in Lissajous figure-8s
    state.renderedLayerCount += 2;
    const fireflyCount = Math.round(24 * densityMult);

    for (let i = 0; i < fireflyCount; i++) {
      const depth = i % 3 === 0 ? 1.18 : 0.82;
      const phase = t * (0.95 + (i % 4) * 0.22) + i * 2.3;
      // Lissajous figure-eight path around drifting anchor
      const fig8X = Math.sin(phase) * 48;
      const fig8Y = Math.sin(phase * 2) * 26;

      const fx = wrapSpan(
        i * 149.7 + t * 14 * depth + fig8X - cameraX * depth,
        screenWidth + 80
      ) - 40;
      const fy = wrapSpan(
        i * 107.3 - t * 10 * depth + fig8Y - cameraY * depth,
        screenHeight + 80
      ) - 40;

      const biolumPulse = 0.2 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(t * (3.1 + (i % 3) * 0.6) + i * 1.7), 2);
      const orbSize = (18 + (i % 3) * 6) * depth * (0.75 + biolumPulse * 0.45);
      const stamp = i % 2 === 0 ? stamps.fireflyEmeraldCanvas : stamps.fireflyGoldCanvas;

      ctx.globalAlpha = biolumPulse * 0.92;
      ctx.drawImage(stamp, fx - orbSize * 0.5, fy - orbSize * 0.5, orbSize, orbSize);
      state.renderedParticleCount++;
    }
  } else if (weather === 'shooting_stars') {
    // Stage 12 Vavřinecká noc: Rising golden bonfire sparks + starry canopy (already drawn above)
    state.renderedLayerCount += 1;
    const emberCount = Math.round(18 * densityMult);
    for (let i = 0; i < emberCount; i++) {
      const sx = wrapSpan(
        i * 163.1 + t * 22 + Math.sin(t * 2.2 + i) * 28 - cameraX * 0.9,
        screenWidth + 60
      ) - 30;
      const sy = wrapSpan(
        i * 113.9 - t * (48 + (i % 4) * 12) - cameraY * 0.9,
        screenHeight + 60
      ) - 30;
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 3.8 + i));
      const sz = 14 + pulse * 10;
      ctx.globalAlpha = pulse * 0.82;
      ctx.drawImage(stamps.fireflyGoldCanvas, sx - sz * 0.5, sy - sz * 0.5, sz, sz);
      state.renderedParticleCount++;
    }
  }

  // ============================================================================
  // 3. LADOVSKÉ WIND-CURL RIBBONS ("VĚTRNÉ KUDRLINKY") DURING BREEZE / GUST PEAKS
  // ============================================================================
  if (
    wind.gustIntensity > 0.52 &&
    weather !== 'fog' &&
    weather !== 'fireflies'
  ) {
    const gustAlpha = ((wind.gustIntensity - 0.52) / 0.48) * 0.45;
    const ribbonCount = weather === 'blizzard' || weather === 'falling_leaves' ? 3 : 2;
    const dirSign = wind.effectiveWindVx >= 0 ? 1 : -1;

    for (let r = 0; r < ribbonCount; r++) {
      const cycleDur = 2.6;
      const prog = ((t + r * 0.85) % cycleDur) / cycleDur;
      const rx = wrapSpan(
        r * 480 + prog * screenWidth * 0.85 * dirSign - cameraX * 0.7,
        screenWidth + 240
      ) - 120;
      const ry = 130 + r * (screenHeight * 0.28) + Math.sin(prog * Math.PI * 2 + r) * 24;
      const fade = Math.sin(prog * Math.PI);

      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(dirSign, 1);
      ctx.rotate(wind.slantAngleRad * 0.25);
      ctx.globalAlpha = gustAlpha * fade;
      ctx.drawImage(stamps.windCurlCanvas, -110, -32, 220, 64);
      ctx.restore();
      state.renderedParticleCount++;
    }
  }

  ctx.restore();
  return state;
}

function swayXFactor(index: number, baseAmp: number): number {
  return baseAmp * (0.75 + (index % 3) * 0.22);
}
