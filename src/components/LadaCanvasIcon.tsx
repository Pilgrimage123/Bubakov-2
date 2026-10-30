import React, { useEffect, useRef } from 'react';

export interface LadaCanvasSvgProps extends React.HTMLAttributes<HTMLCanvasElement> {
  xmlns?: string;
  preserveAspectRatio?: string;
  viewBox?: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  muted?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

// ============================================================================
// 1. GLOBAL 60 FPS SHARED ANIMATION TICKER (Zero-overhead single rAF loop)
// ============================================================================
type TickCallback = (t: number) => void;
const activeSubscribers = new Set<TickCallback>();
let rafId: number | null = null;
let startTime = typeof performance !== 'undefined' ? performance.now() : 0;

function globalTick(now: number) {
  const t = (now - startTime) * 0.001;
  activeSubscribers.forEach((cb) => {
    try {
      cb(t);
    } catch {
      // Ignore individual icon render errors
    }
  });
  if (activeSubscribers.size > 0) {
    rafId = requestAnimationFrame(globalTick);
  } else {
    rafId = null;
  }
}

export function subscribeLadaCanvasTicker(cb: TickCallback): () => void {
  activeSubscribers.add(cb);
  if (rafId === null && typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
    startTime = performance.now();
    rafId = requestAnimationFrame(globalTick);
  }
  return () => {
    activeSubscribers.delete(cb);
    if (activeSubscribers.size === 0 && rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

// ============================================================================
// 2. BRIGHT CZECH VILLAGE GOUACHE COLOR PALETTE ENHANCER (Josef Lada Style)
// ============================================================================
const VILLAGE_GOUACHE_PALETTE: Record<string, string> = {
  // Bold Charcoal-Brown Ink Outlines
  '#1a1612': '#1C1610',
  '#1c1610': '#1C1610',
  '#090b12': '#1C1610',
  '#150f0d': '#1C1610',

  // Vibrant Poppy Vermilion & Festive Carmine Reds
  '#c83e31': '#E6392B',
  '#c53026': '#E6392B',
  '#b91c1c': '#DC2626',
  '#991b1b': '#B91C1C',
  '#dc2626': '#EF3B2D',
  '#d9463e': '#F04438',
  '#ba3852': '#E11D48',
  '#e63946': '#F43F5E',
  '#c83228': '#E6392B',

  // Sunny Buttercup Gold & Warm Honey Amber
  '#d9a036': '#FACC15',
  '#e5b224': '#FBBF24',
  '#e8b834': '#FACC15',
  '#f4c732': '#FDE047',
  '#f5c834': '#FACC15',
  '#fde047': '#FEF08A',
  '#facc15': '#FACC15',
  '#fbbf24': '#FBBF24',
  '#f59e0b': '#F59E0B',
  '#eab308': '#FACC15',
  '#d97706': '#F59E0B',
  '#b45309': '#D97706',

  // Fresh Meadow Lime & Orchard Emerald Greens
  '#4d7c0f': '#22C55E',
  '#65a30d': '#4ADE80',
  '#3d7843': '#16A34A',
  '#528850': '#22C55E',
  '#5b9557': '#4ADE80',
  '#5d9658': '#4ADE80',
  '#4d834b': '#16A34A',
  '#15803d': '#16A34A',
  '#16a34a': '#22C55E',
  '#22c55e': '#4ADE80',
  '#3a7d2c': '#22C55E',

  // Bright Cornflower Cobalt & Skybrook Cyan Blues
  '#3a76a8': '#2563EB',
  '#1d5ba6': '#2563EB',
  '#2b6cb0': '#3B82F6',
  '#2563eb': '#2563EB',
  '#3b82f6': '#3B82F6',
  '#38bdf8': '#38BDF8',
  '#60a5fa': '#38BDF8',
  '#e0f2fe': '#E0F2FE',

  // Warm Cinnamon Wood, Gingerbread & Terracotta Earth
  '#8c5a35': '#B45309',
  '#a66e40': '#D97706',
  '#a66a32': '#D97706',
  '#b97839': '#EA580C',
  '#c27d38': '#EA580C',
  '#5e3a21': '#7C2D12',
  '#2a170a': '#431407',
  '#451a03': '#5C1D08',
  '#783e24': '#9A3412',
  '#7c4d2b': '#9A3412',

  // Crisp Village Slate & Stone
  '#64748b': '#4F6D8A',
  '#475569': '#3B5978',
  '#334155': '#2C4259',
  '#71717a': '#64748B',

  // Sunlit Gouache Ivory & Warm Cream
  '#f3e9d2': '#FFF7D6',
  '#e8dcc2': '#FDE68A',
  '#faf5e8': '#FFFDF7',
  '#fffdf6': '#FFFDF9',
  '#fffdf7': '#FFFDF9',
  '#f4f1ea': '#FFFBEB',
};

export function brightenVillageColor(color: string | undefined): string {
  if (!color || color === 'none' || color === 'transparent') return 'none';
  const trimmed = color.trim();
  const lower = trimmed.toLowerCase();
  return VILLAGE_GOUACHE_PALETTE[lower] || trimmed;
}

// ============================================================================
// 3. SCENE GRAPH COMPILER FOR 2D CANVAS
// ============================================================================
interface GradientStop {
  offset: number;
  color: string;
  opacity: number;
}

interface GradientDef {
  id: string;
  type: 'linear' | 'radial';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  r: number;
  stops: GradientStop[];
}

interface InheritedStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: CanvasLineCap;
  strokeLinejoin?: CanvasLineJoin;
  opacity: number;
}

type NodeAnimKind =
  | 'none'
  | 'float'
  | 'rock'
  | 'pulse'
  | 'flicker'
  | 'shiver'
  | 'step'
  | 'cog'
  | 'steam1'
  | 'steam2'
  | 'glint1'
  | 'glint2'
  | 'halo'
  | 'wing1'
  | 'wing2'
  | 'splash1'
  | 'splash2'
  | 'ribbon'
  | 'foam'
  | 'dust'
  | 'bell'
  | 'clapper';

interface CompiledNode {
  tag: string;
  props: Record<string, any>;
  style: InheritedStyle;
  animKind: NodeAnimKind;
  transform?: string;
  path2d?: Path2D | null;
  points?: number[];
  textContent?: string;
  children: CompiledNode[];
}

interface CompiledScene {
  vbX: number;
  vbY: number;
  vbW: number;
  vbH: number;
  gradients: Map<string, GradientDef>;
  rootNodes: CompiledNode[];
  rootAnimKind: NodeAnimKind;
  phaseSeed: number;
}

function classifyAnimKind(className: string | undefined): NodeAnimKind {
  if (!className) return 'none';
  const c = className.toLowerCase();
  if (c.includes('steam-wisp-2') || c.includes('anim-steam-2') || c.includes('aroma-2') || c.includes('smoke-ring-2') || c.includes('smoke-2')) return 'steam2';
  if (c.includes('steam') || c.includes('aroma') || c.includes('smoke') || c.includes('wisp')) return 'steam1';
  if (c.includes('wing-2')) return 'wing2';
  if (c.includes('wing')) return 'wing1';
  if (c.includes('splash-2') || c.includes('drop-2')) return 'splash2';
  if (c.includes('splash') || c.includes('drop')) return 'splash1';
  if (c.includes('glint-2') || c.includes('sparkle-2') || c.includes('spark-2')) return 'glint2';
  if (c.includes('glint') || c.includes('sparkle') || c.includes('spark') || c.includes('shine')) return 'glint1';
  if (c.includes('halo') || c.includes('glow') || c.includes('aura')) return 'halo';
  if (c.includes('ribbon') || c.includes('pentle') || c.includes('bow')) return 'ribbon';
  if (c.includes('clapper')) return 'clapper';
  if (c.includes('bell')) return 'bell';
  if (c.includes('cog') || c.includes('wheel') || c.includes('mill')) return 'cog';
  if (c.includes('foam')) return 'foam';
  if (c.includes('dust')) return 'dust';
  if (c.includes('flicker') || c.includes('flame') || c.includes('fire')) return 'flicker';
  if (c.includes('shiver')) return 'shiver';
  if (c.includes('step')) return 'step';
  if (c.includes('pulse') || c.includes('heart')) return 'pulse';
  if (c.includes('rock') || c.includes('melee') || c.includes('swing') || c.includes('sway') || c.includes('treasure')) return 'rock';
  if (c.includes('float') || c.includes('food') || c.includes('bob')) return 'float';
  return 'none';
}

function parsePercentOrNumber(val: any, fallback: number): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.endsWith('%')) {
      return parseFloat(trimmed) / 100;
    }
    const n = parseFloat(trimmed);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function extractText(children: React.ReactNode): string {
  let out = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      out += String(child);
    } else if (React.isValidElement(child) && (child.props as any)?.children) {
      out += extractText((child.props as any).children);
    }
  });
  return out;
}

function collectDefsAndNodes(
  children: React.ReactNode,
  inherited: InheritedStyle,
  gradients: Map<string, GradientDef>,
  detectedClasses: string[]
): CompiledNode[] {
  const result: CompiledNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const rawType = child.type;
    if (typeof rawType !== 'string') return;
    const tag = rawType.toLowerCase();
    const props = (child.props || {}) as Record<string, any>;

    if (tag === 'style' || tag === 'title' || tag === 'desc' || tag === 'filter') {
      return;
    }

    if (tag === 'defs') {
      collectDefsAndNodes(props.children, inherited, gradients, detectedClasses);
      return;
    }

    if (tag === 'lineargradient' || tag === 'radialgradient') {
      const id = props.id;
      if (id) {
        const stops: GradientStop[] = [];
        React.Children.forEach(props.children, (stopChild) => {
          if (!React.isValidElement(stopChild)) return;
          const sp = (stopChild.props || {}) as Record<string, any>;
          const offset = Math.max(0, Math.min(1, parsePercentOrNumber(sp.offset, 0)));
          const color = brightenVillageColor(sp.stopColor || '#FACC15');
          const opacity = sp.stopOpacity !== undefined ? Number(sp.stopOpacity) : 1;
          stops.push({ offset, color, opacity });
        });
        gradients.set(id, {
          id,
          type: tag === 'lineargradient' ? 'linear' : 'radial',
          x1: parsePercentOrNumber(props.x1, 0),
          y1: parsePercentOrNumber(props.y1, 0),
          x2: parsePercentOrNumber(props.x2, 1),
          y2: parsePercentOrNumber(props.y2, 1),
          cx: parsePercentOrNumber(props.cx, 0.5),
          cy: parsePercentOrNumber(props.cy, 0.5),
          r: parsePercentOrNumber(props.r, 0.5),
          stops,
        });
      }
      return;
    }

    if (props.className && typeof props.className === 'string') {
      detectedClasses.push(props.className);
    }

    const elemOpacity =
      (props.opacity !== undefined ? Number(props.opacity) : 1) *
      (props.fillOpacity !== undefined ? Number(props.fillOpacity) : 1);

    const nextStyle: InheritedStyle = {
      fill: props.fill !== undefined ? props.fill : inherited.fill,
      stroke: props.stroke !== undefined ? props.stroke : inherited.stroke,
      strokeWidth:
        props.strokeWidth !== undefined ? Number(props.strokeWidth) : inherited.strokeWidth,
      strokeLinecap: (props.strokeLinecap as CanvasLineCap) || inherited.strokeLinecap,
      strokeLinejoin: (props.strokeLinejoin as CanvasLineJoin) || inherited.strokeLinejoin,
      opacity: inherited.opacity * (Number.isNaN(elemOpacity) ? 1 : elemOpacity),
    };

    const animKind = classifyAnimKind(props.className);

    let path2d: Path2D | null = null;
    if (tag === 'path' && typeof props.d === 'string' && typeof Path2D !== 'undefined') {
      try {
        path2d = new Path2D(props.d);
      } catch {
        path2d = null;
      }
    }

    let points: number[] | undefined;
    if ((tag === 'polygon' || tag === 'polyline') && typeof props.points === 'string') {
      points = props.points
        .trim()
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
    }

    const textContent = tag === 'text' ? extractText(props.children) : undefined;

    const childNodes =
      tag !== 'text' && props.children
        ? collectDefsAndNodes(props.children, nextStyle, gradients, detectedClasses)
        : [];

    result.push({
      tag,
      props,
      style: nextStyle,
      animKind,
      transform: typeof props.transform === 'string' ? props.transform : undefined,
      path2d,
      points,
      textContent,
      children: childNodes,
    });
  });

  return result;
}

function hashPhaseSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 628) / 100;
}

// ============================================================================
// 4. 2D CANVAS TRANSFORM & KINEMATICS ENGINE
// ============================================================================
const TRANSFORM_REGEX = /(translate|rotate|scale)\s*\(([^)]+)\)/g;

function applySvgTransformString(ctx: CanvasRenderingContext2D, transformStr: string) {
  TRANSFORM_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TRANSFORM_REGEX.exec(transformStr)) !== null) {
    const kind = match[1];
    const nums = match[2]
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    if (kind === 'translate') {
      ctx.translate(nums[0] || 0, nums[1] || 0);
    } else if (kind === 'rotate') {
      const rad = ((nums[0] || 0) * Math.PI) / 180;
      if (nums.length >= 3) {
        const cx = nums[1];
        const cy = nums[2];
        ctx.translate(cx, cy);
        ctx.rotate(rad);
        ctx.translate(-cx, -cy);
      } else {
        ctx.rotate(rad);
      }
    } else if (kind === 'scale') {
      const sx = nums[0] ?? 1;
      const sy = nums.length >= 2 ? nums[1] : sx;
      ctx.scale(sx, sy);
    }
  }
}

function applyNodeProceduralAnimation(
  ctx: CanvasRenderingContext2D,
  kind: NodeAnimKind,
  t: number,
  cx: number,
  cy: number,
  phase: number
) {
  if (kind === 'none') return;

  switch (kind) {
    case 'float': {
      const dy = Math.sin(t * 2.7 + phase) * 1.35;
      const rot = (Math.sin(t * 1.8 + phase) * 2.2 * Math.PI) / 180;
      const sc = 1 + Math.sin(t * 2.7 + phase) * 0.025;
      ctx.translate(cx, cy + dy);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'rock': {
      const rot = (Math.sin(t * 2.9 + phase) * 6.2 * Math.PI) / 180;
      const dy = Math.cos(t * 5.8 + phase) * 0.65;
      ctx.translate(cx, cy + dy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'pulse': {
      const sc = 1 + Math.sin(t * 3.4 + phase) * 0.068;
      const rot = (Math.sin(t * 1.7 + phase) * 2.4 * Math.PI) / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'flicker': {
      const sx = 1 + Math.sin(t * 9.5 + phase) * 0.065;
      const sy = 1 + Math.cos(t * 12.2 + phase) * 0.095;
      const rot = (Math.sin(t * 7.8 + phase) * 4.2 * Math.PI) / 180;
      ctx.translate(cx, cy + 4);
      ctx.rotate(rot);
      ctx.scale(sx, sy);
      ctx.translate(-cx, -(cy + 4));
      break;
    }
    case 'shiver': {
      const burst = Math.max(0, Math.sin(t * 2.4 + phase));
      const rot = (Math.sin(t * 18 + phase) * burst * 5.5 * Math.PI) / 180;
      const sc = 1 + burst * 0.04;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'step': {
      const dy = -Math.abs(Math.sin(t * 3.8 + phase)) * 2.1;
      const rot = (Math.sin(t * 3.8 + phase) * 4.8 * Math.PI) / 180;
      ctx.translate(cx, cy + dy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'cog': {
      const rot = t * 0.85 + phase;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'steam1':
    case 'steam2': {
      const offset = kind === 'steam2' ? 0.48 : 0;
      const cycle = (t * 0.55 + phase * 0.2 + offset) % 1;
      const dy = 1.5 - cycle * 6.2;
      const dx = Math.sin(cycle * Math.PI * 2 + phase) * 1.2;
      const sc = 0.88 + cycle * 0.26;
      const alpha = Math.sin(cycle * Math.PI);
      ctx.translate(dx, dy);
      ctx.translate(cx, cy * 0.45);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy * 0.45);
      ctx.globalAlpha *= Math.max(0.1, alpha);
      break;
    }
    case 'glint1':
    case 'glint2': {
      const offset = kind === 'glint2' ? 1.6 : 0;
      const wave = 0.5 + 0.5 * Math.sin(t * 4.2 + phase + offset);
      const sc = 0.65 + wave * 0.55;
      const rot = (Math.sin(t * 2.4 + offset) * 28 * Math.PI) / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha *= 0.45 + wave * 0.55;
      break;
    }
    case 'halo': {
      const wave = 0.5 + 0.5 * Math.sin(t * 3.2 + phase);
      const sc = 0.9 + wave * 0.22;
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha *= 0.45 + wave * 0.5;
      break;
    }
    case 'wing1':
    case 'wing2': {
      const dir = kind === 'wing2' ? -1 : 1;
      const rot = (Math.sin(t * 26 + phase) * 14 * dir * Math.PI) / 180;
      ctx.rotate(rot);
      break;
    }
    case 'splash1':
    case 'splash2': {
      const offset = kind === 'splash2' ? 0.5 : 0;
      const cycle = (t * 0.75 + offset + phase * 0.15) % 1;
      const dy = 1 - cycle * 4.5;
      const alpha = Math.sin(cycle * Math.PI);
      ctx.translate(0, dy);
      ctx.globalAlpha *= 0.25 + alpha * 0.75;
      break;
    }
    case 'ribbon': {
      const rot = (Math.sin(t * 3.8 + phase) * 7.5 * Math.PI) / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
      break;
    }
    case 'foam': {
      const sy = 1 + Math.sin(t * 3.5 + phase) * 0.06;
      const dy = Math.sin(t * 3.5 + phase) * 0.5;
      ctx.translate(0, dy);
      ctx.scale(1, sy);
      break;
    }
    case 'dust': {
      const wave = 0.5 + 0.5 * Math.sin(t * 3.8 + phase);
      ctx.globalAlpha *= 0.3 + wave * 0.7;
      break;
    }
    case 'bell': {
      const rot = (Math.sin(t * 3.4 + phase) * 8.5 * Math.PI) / 180;
      ctx.translate(cx, cy * 0.35);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy * 0.35);
      break;
    }
    case 'clapper': {
      const dx = Math.sin(t * 3.4 + phase - 0.35) * 1.8;
      ctx.translate(dx, 0);
      break;
    }
  }
}

function resolvePaintStyle(
  ctx: CanvasRenderingContext2D,
  rawPaint: string | undefined,
  gradients: Map<string, GradientDef>,
  vbW: number,
  vbH: number
): string | CanvasGradient {
  if (!rawPaint || rawPaint === 'none' || rawPaint === 'transparent') return 'none';
  const trimmed = rawPaint.trim();
  if (trimmed.startsWith('url(')) {
    const idMatch = trimmed.match(/#([^)\s"']+)/);
    if (idMatch && gradients.has(idMatch[1])) {
      const gDef = gradients.get(idMatch[1])!;
      let grad: CanvasGradient;
      if (gDef.type === 'linear') {
        const x1 = gDef.x1 <= 1 ? gDef.x1 * vbW : gDef.x1;
        const y1 = gDef.y1 <= 1 ? gDef.y1 * vbH : gDef.y1;
        const x2 = gDef.x2 <= 1 ? gDef.x2 * vbW : gDef.x2;
        const y2 = gDef.y2 <= 1 ? gDef.y2 * vbH : gDef.y2;
        grad = ctx.createLinearGradient(x1, y1, x2, y2);
      } else {
        const cx = gDef.cx <= 1 ? gDef.cx * vbW : gDef.cx;
        const cy = gDef.cy <= 1 ? gDef.cy * vbH : gDef.cy;
        const r = gDef.r <= 1 ? gDef.r * Math.max(vbW, vbH) : gDef.r;
        grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, r));
      }
      for (const stop of gDef.stops) {
        grad.addColorStop(stop.offset, stop.color);
      }
      return grad;
    }
    return '#FACC15';
  }
  return brightenVillageColor(trimmed);
}

function renderCompiledNode(
  ctx: CanvasRenderingContext2D,
  node: CompiledNode,
  scene: CompiledScene,
  t: number,
  hasAnimatedAncestor: boolean
) {
  ctx.save();

  const cx = scene.vbX + scene.vbW * 0.5;
  const cy = scene.vbY + scene.vbH * 0.5;

  const isAnimNode = node.animKind !== 'none';
  if (isAnimNode) {
    applyNodeProceduralAnimation(ctx, node.animKind, t, cx, cy, scene.phaseSeed);
  }

  if (node.transform) {
    applySvgTransformString(ctx, node.transform);
  }

  const p = node.props;
  const st = node.style;

  // Apply dash array if specified
  if (typeof p.strokeDasharray === 'string') {
    const dashes = p.strokeDasharray
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    if (dashes.length > 0) {
      ctx.setLineDash(dashes);
    }
  }

  ctx.lineCap = st.strokeLinecap || 'round';
  ctx.lineJoin = st.strokeLinejoin || 'round';

  const rawFill = st.fill !== undefined ? st.fill : node.tag === 'line' ? 'none' : '#1C1610';
  const fillStyle = resolvePaintStyle(ctx, rawFill, scene.gradients, scene.vbW, scene.vbH);
  const strokeStyle = resolvePaintStyle(ctx, st.stroke, scene.gradients, scene.vbW, scene.vbH);
  const strokeWidth = st.strokeWidth !== undefined ? st.strokeWidth : 1.5;

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * Math.max(0, Math.min(1, st.opacity));

  const commitShape = (pathObj?: Path2D | null) => {
    if (fillStyle !== 'none') {
      ctx.fillStyle = fillStyle;
      if (pathObj) {
        ctx.fill(pathObj);
      } else {
        ctx.fill();
      }
    }
    if (strokeStyle !== 'none' && strokeWidth > 0) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = strokeWidth;
      if (pathObj) {
        ctx.stroke(pathObj);
      } else {
        ctx.stroke();
      }
    }
  };

  switch (node.tag) {
    case 'g':
    case 'svg': {
      for (const child of node.children) {
        renderCompiledNode(ctx, child, scene, t, hasAnimatedAncestor || isAnimNode);
      }
      break;
    }
    case 'path': {
      if (node.path2d) {
        commitShape(node.path2d);
      }
      break;
    }
    case 'circle': {
      const x = Number(p.cx || 0);
      const y = Number(p.cy || 0);
      const r = Math.max(0, Number(p.r || 0));
      if (r > 0) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        commitShape();
      }
      break;
    }
    case 'ellipse': {
      const x = Number(p.cx || 0);
      const y = Number(p.cy || 0);
      const rx = Math.max(0, Number(p.rx || 0));
      const ry = Math.max(0, Number(p.ry || 0));
      if (rx > 0 && ry > 0) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        commitShape();
      }
      break;
    }
    case 'rect': {
      const x = Number(p.x || 0);
      const y = Number(p.y || 0);
      const w = Math.max(0, Number(p.width || 0));
      const h = Math.max(0, Number(p.height || 0));
      const rx = Math.max(0, Number(p.rx || p.ry || 0));
      if (w > 0 && h > 0) {
        ctx.beginPath();
        if (rx > 0 && typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, rx);
        } else {
          ctx.rect(x, y, w, h);
        }
        commitShape();
      }
      break;
    }
    case 'line': {
      const x1 = Number(p.x1 || 0);
      const y1 = Number(p.y1 || 0);
      const x2 = Number(p.x2 || 0);
      const y2 = Number(p.y2 || 0);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      commitShape();
      break;
    }
    case 'polygon':
    case 'polyline': {
      const pts = node.points;
      if (pts && pts.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          ctx.lineTo(pts[i], pts[i + 1]);
        }
        if (node.tag === 'polygon') {
          ctx.closePath();
        }
        commitShape();
      }
      break;
    }
    case 'text': {
      if (node.textContent) {
        const x = Number(p.x || 0);
        const y = Number(p.y || 0);
        const fontSize = parseFloat(String(p.fontSize || 8)) || 8;
        const fontWeight = p.fontWeight || 'bold';
        const fontFamily = p.fontFamily || "'Eczar', Georgia, serif";
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign =
          p.textAnchor === 'middle' ? 'center' : p.textAnchor === 'end' ? 'right' : 'left';
        if (strokeStyle !== 'none' && strokeWidth > 0) {
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = strokeWidth;
          ctx.strokeText(node.textContent, x, y);
        }
        if (fillStyle !== 'none') {
          ctx.fillStyle = fillStyle;
          ctx.fillText(node.textContent, x, y);
        }
      }
      break;
    }
  }

  ctx.restore();
}

function drawFourPointSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rot: number,
  fill: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  const inner = radius * 0.28;
  ctx.moveTo(0, -radius);
  ctx.lineTo(inner, -inner);
  ctx.lineTo(radius, 0);
  ctx.lineTo(inner, inner);
  ctx.lineTo(0, radius);
  ctx.lineTo(-inner, inner);
  ctx.lineTo(-radius, 0);
  ctx.lineTo(-inner, -inner);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#1C1610';
  ctx.lineWidth = Math.max(0.45, radius * 0.22);
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

export function renderSceneOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  scene: CompiledScene,
  t: number
) {
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.save();

  const scaleX = canvasW / scene.vbW;
  const scaleY = canvasH / scene.vbH;
  ctx.scale(scaleX, scaleY);
  ctx.translate(-scene.vbX, -scene.vbY);

  const cx = scene.vbX + scene.vbW * 0.5;
  const cy = scene.vbY + scene.vbH * 0.5;
  const rBase = Math.min(scene.vbW, scene.vbH) * 0.44;

  // 1. Subtle warm Czech village gouache sunlight wash behind every icon
  const auraPulse = 1 + Math.sin(t * 2.4 + scene.phaseSeed) * 0.06;
  const auraGrad = ctx.createRadialGradient(cx, cy, rBase * 0.1, cx, cy, rBase * auraPulse);
  auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.30)');
  auraGrad.addColorStop(0.65, 'rgba(253, 224, 71, 0.12)');
  auraGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, rBase * auraPulse, 0, Math.PI * 2);
  ctx.fill();

  // 2. Apply Root 2D Canvas Animation if child nodes don't already have an active root animation
  const hasTopLevelAnimatedGroup = scene.rootNodes.some((n) => n.animKind !== 'none');
  if (!hasTopLevelAnimatedGroup) {
    applyNodeProceduralAnimation(ctx, scene.rootAnimKind, t, cx, cy, scene.phaseSeed);
  } else {
    // Subtle secondary breathing so every icon feels cohesive in 2D Canvas
    const breath = 1 + Math.sin(t * 2.2 + scene.phaseSeed) * 0.018;
    ctx.translate(cx, cy);
    ctx.scale(breath, breath);
    ctx.translate(-cx, -cy);
  }

  // 3. Render all compiled vector/gouache nodes onto the 2D Canvas
  for (const node of scene.rootNodes) {
    renderCompiledNode(ctx, node, scene, t, false);
  }

  // 4. Playful Josef Lada village twinkling folk sparkle on top-right/top-left
  const twinkleWave = Math.max(0, Math.sin(t * 3.1 + scene.phaseSeed));
  if (twinkleWave > 0.15) {
    const spProgress = (twinkleWave - 0.15) / 0.85;
    const spRadius = Math.min(scene.vbW, scene.vbH) * 0.075 * Math.sin(spProgress * Math.PI);
    if (spRadius > 0.35) {
      const spX = scene.vbX + scene.vbW * 0.82;
      const spY = scene.vbY + scene.vbH * 0.2;
      drawFourPointSparkle(
        ctx,
        spX,
        spY,
        spRadius,
        t * 1.4 + scene.phaseSeed,
        '#FEF08A'
      );
    }
  }

  ctx.restore();
}

// ============================================================================
// 5. DROP-IN 2D CANVAS ICON COMPONENT (<LadaCanvasSvg>)
// ============================================================================
export const LadaCanvasSvg: React.FC<LadaCanvasSvgProps> = ({
  xmlns: _xmlns,
  preserveAspectRatio: _preserveAspectRatio,
  viewBox = '0 0 36 36',
  width,
  height,
  size,
  className = '',
  style = {},
  muted,
  children,
  ...restProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<CompiledScene | null>(null);

  // Parse viewBox
  const vbParts = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const vbX = vbParts[0] || 0;
  const vbY = vbParts[1] || 0;
  const vbW = vbParts[2] || 36;
  const vbH = vbParts[3] || 36;

  // Collect class names for SSR / test compatibility and compile scene
  const detectedClasses: string[] = [];
  const gradients = new Map<string, GradientDef>();
  const rootNodes = collectDefsAndNodes(
    children,
    { opacity: 1, strokeLinecap: 'round', strokeLinejoin: 'round' },
    gradients,
    detectedClasses
  );

  const labelStr = String(restProps['aria-label'] || className || 'lada-icon');
  const phaseSeed = hashPhaseSeed(labelStr);
  const rootAnimKind =
    detectedClasses.map(classifyAnimKind).find((k) => k !== 'none') || 'float';

  sceneRef.current = {
    vbX,
    vbY,
    vbW,
    vbH,
    gradients,
    rootNodes,
    rootAnimKind,
    phaseSeed,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = (t: number) => {
      if (!sceneRef.current) return;
      renderSceneOnCanvas(ctx, canvas.width, canvas.height, sceneRef.current, t);
    };

    // Draw initial frame immediately so icon is never blank
    renderFrame(typeof performance !== 'undefined' ? (performance.now() - startTime) * 0.001 : 0);

    // Subscribe to shared 60 FPS animation loop
    return subscribeLadaCanvasTicker(renderFrame);
  });

  const resolvedW = width ?? size ?? '1.2em';
  const resolvedH = height ?? size ?? '1.2em';

  // Crisp internal pixel resolution for 2D Canvas
  const numericSize =
    typeof resolvedW === 'number'
      ? resolvedW
      : typeof size === 'number'
      ? size
      : 36;
  const internalPxW = Math.max(64, Math.min(192, Math.round(numericSize * 2)));
  const internalPxH = Math.max(
    64,
    Math.min(192, Math.round(internalPxW * (vbH / Math.max(1, vbW))))
  );

  const combinedAnimClasses = Array.from(new Set(detectedClasses)).join(' ');
  const hasMuteSlash =
    Boolean(muted) ||
    rootNodes.some(
      (n) =>
        (n.tag === 'line' && n.props.stroke === '#C83E31') ||
        n.children.some((c) => c.tag === 'line' && c.props.stroke === '#C83E31')
    );

  return (
    <canvas
      ref={canvasRef}
      width={internalPxW}
      height={internalPxH}
      className={`${className} ${combinedAnimClasses}`.trim()}
      data-anim={combinedAnimClasses || undefined}
      {...(hasMuteSlash ? { stroke: '#C83E31' } : {})}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        width: typeof resolvedW === 'number' ? `${resolvedW}px` : resolvedW,
        height: typeof resolvedH === 'number' ? `${resolvedH}px` : resolvedH,
        ...style,
      }}
      {...restProps}
    />
  );
};
