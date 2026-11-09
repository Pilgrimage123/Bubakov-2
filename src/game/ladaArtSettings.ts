/**
 * Lada Art Director Settings & Visual Hierarchy Inspector
 * 
 * Manages global outline settings, shape language overlays, Lada comic popups,
 * and 60-30-10 palette budget inspection tools.
 */

export interface LadaArtSettings {
  /** Line width for Lada perokresba calligraphic ink outlines (0..6px, default 4) */
  outlineWidth: number;
  /** Whether to show shape language classification rings (Circles=Allies, Triangles=Speeders, Squares=Tanks) */
  showShapeOverlays: boolean;
  /** Whether to show real-time 60-30-10 color distribution HUD overlay */
  showPaletteAnalyzer: boolean;
  /** Whether Lada comic popups ("BÁC!", "PRÁSK!", "KŘUP!") trigger on heavy impacts */
  comicSoundPopupsEnabled: boolean;
  /** Floor contrast adaptability mode: 'adaptable' | 'strict_paper_wash' | 'low_contrast' */
  floorContrastMode: 'adaptable' | 'strict_paper_wash' | 'low_contrast';
  /** Two-level calligraphic outline hierarchy (ADR 0045): Hunter 3.5px, Enemies 2.75px, Details 1.0px, Bosses 4.0px */
  hierarchicalOutlineEnabled?: boolean;
}

export const DEFAULT_LADA_ART_SETTINGS: LadaArtSettings = {
  outlineWidth: 4,
  showShapeOverlays: false,
  showPaletteAnalyzer: false,
  comicSoundPopupsEnabled: true,
  floorContrastMode: 'adaptable',
  hierarchicalOutlineEnabled: true,
};

let activeLadaArtSettings: LadaArtSettings = { ...DEFAULT_LADA_ART_SETTINGS };

export function getLadaArtSettings(): LadaArtSettings {
  return activeLadaArtSettings;
}

export function setLadaArtSettings(settings: Partial<LadaArtSettings>): void {
  activeLadaArtSettings = {
    ...activeLadaArtSettings,
    ...settings,
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('bubakov_lada_art_settings', JSON.stringify(activeLadaArtSettings));
    }
  } catch {}
}

export function loadLadaArtSettings(): LadaArtSettings {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('bubakov_lada_art_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        activeLadaArtSettings = { ...DEFAULT_LADA_ART_SETTINGS, ...parsed };
      }
    }
  } catch {}
  return activeLadaArtSettings;
}

// Initial load on import
loadLadaArtSettings();

/**
 * Shape Language Classification helper:
 * Maps enemy ID or entity archetype to Lada shape category ('circle' | 'triangle' | 'square')
 */
export type LadaShapeCategory = 'circle' | 'triangle' | 'square';

export function getEntityLadaShape(entity: any): LadaShapeCategory {
  if (!entity) return 'circle';
  if (entity.isPlayer || entity.type === 'player' || entity.isCompanion) {
    return 'circle'; // Heroes & Allies are circles / pear shapes
  }

  const id = String(entity.id || entity.type || '').toLowerCase();

  // Fast & Dangerous Enemies -> Triangles & Spikes
  if (
    id.includes('cert') ||
    id.includes('jezibaba') ||
    id.includes('carodejnice') ||
    id.includes('kohout') ||
    id.includes('husa') ||
    id.includes('vrana') ||
    id.includes('chroust') ||
    id.includes('skritek') ||
    id.includes('smrtka') ||
    id.includes('satan')
  ) {
    return 'triangle';
  }

  // Heavy Tank Enemies -> Squares & Bulky Volumes
  if (
    id.includes('pandur') ||
    id.includes('sud') ||
    id.includes('hejkal') ||
    id.includes('snehulak') ||
    id.includes('kanec') ||
    id.includes('obr') ||
    id.includes('mlynar') ||
    id.includes('rytir') ||
    id.includes('balvan') ||
    id.includes('zernov')
  ) {
    return 'square';
  }

  // Default fallback based on speed/hp
  if (entity.speed && entity.speed > 3.0) return 'triangle';
  if (entity.maxHp && entity.maxHp > 300) return 'square';
  return 'circle';
}

/**
 * Render Shape Overlay debug indicators for Lada Art Director Inspector
 */
export function drawLadaShapeOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  shape: LadaShapeCategory,
  label?: string
): void {
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 3]);

  if (shape === 'circle') {
    // Circle / Pear Shape -> Emerald/Cyan
    ctx.strokeStyle = '#06B6D4';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'triangle') {
    // Triangle / Spike -> Bright Crimson Red
    ctx.strokeStyle = '#EF4444';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
    const r = radius + 8;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.866, y + r * 0.5);
    ctx.lineTo(x - r * 0.866, y + r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'square') {
    // Square / Heavy Volume -> Amber Gold
    ctx.strokeStyle = '#F59E0B';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    const side = (radius + 6) * 1.6;
    ctx.beginPath();
    ctx.rect(x - side / 2, y - side / 2, side, side);
    ctx.fill();
    ctx.stroke();
  }

  if (label) {
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(label, x, y - radius - 10);
    ctx.fillText(label, x, y - radius - 10);
  }

  ctx.restore();
}

/**
 * Lada Comic Sound Popups ("BÁC!", "PRÁSK!", "KŘUP!", "HOJ!")
 */
export const LADA_COMIC_POPUPS = [
  { text: 'BÁC!', color: '#DC2626', bg: '#FEF08A' },
  { text: 'PRÁSK!', color: '#B45309', bg: '#FFFFFF' },
  { text: 'KŘUP!', color: '#047857', bg: '#FEF3C7' },
  { text: 'HOJ!', color: '#1D4ED8', bg: '#FEE2E2' },
  { text: 'BUM!', color: '#991B1B', bg: '#FDE047' },
  { text: 'DUPE!', color: '#7C2D12', bg: '#E0F2FE' },
] as const;

export function getRandomLadaComicPopup(): typeof LADA_COMIC_POPUPS[number] {
  return LADA_COMIC_POPUPS[Math.floor(Math.random() * LADA_COMIC_POPUPS.length)];
}
