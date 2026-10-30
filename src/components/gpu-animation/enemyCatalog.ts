import { ENEMIES } from '../../data/enemies';
import {
  type EnemyArchetype,
  type ArchetypeParams,
  ARCHETYPE_PRESETS,
  computeVolumePreservingStretch,
} from './types';
import { BAKED_SPRITES } from './sprites';
import { Lada, drawEnemyRenderer } from '../../render/ladaRenderer';

export interface EnemyGpuConfig {
  id: string;
  name: string;
  category: string;
  archetype: EnemyArchetype;
  params: ArchetypeParams;
  spriteUrl: string;
}

/**
 * Mapping of all 58 canonical enemies from Czech folklore to the 4 GPU walking archetypes,
 * with fine-tuned physical parameters based on character weight, attack cadence, and folklore lore.
 */
export const ENEMY_ARCHETYPE_MAP: Record<
  string,
  {
    archetype: EnemyArchetype;
    duration?: string;
    wobble?: string;
    squashX?: number;
    squashY?: number;
    baseScale?: number;
    accentColor: string;
  }
> = {
  // --- 1. HAVĚŤ A DROBNÍ SKŘÍTCI (Bug & agile scuttlers) ---
  rarach: { archetype: 'bug', duration: '0.19s', wobble: '7deg', squashX: 1.12, squashY: 0.89, baseScale: 0.85, accentColor: '#DC2626' },
  plivnik: { archetype: 'bug', duration: '0.18s', wobble: '6deg', squashX: 1.10, squashY: 0.91, baseScale: 0.80, accentColor: '#F97316' },
  sotek: { archetype: 'bug', duration: '0.22s', wobble: '8deg', squashX: 1.14, squashY: 0.88, baseScale: 0.85, accentColor: '#D97706' },
  mysak: { archetype: 'bug', duration: '0.20s', wobble: '6deg', squashX: 1.10, squashY: 0.91, baseScale: 0.70, accentColor: '#78716C' },
  skodnik: { archetype: 'bug', duration: '0.22s', wobble: '7deg', squashX: 1.12, squashY: 0.89, baseScale: 0.80, accentColor: '#B45309' },
  sazovy_rarach: { archetype: 'bug', duration: '0.19s', wobble: '8deg', squashX: 1.13, squashY: 0.88, baseScale: 0.85, accentColor: '#1C1917' },
  krvavy_rarach: { archetype: 'bug', duration: '0.18s', wobble: '7deg', squashX: 1.12, squashY: 0.89, baseScale: 0.85, accentColor: '#991B1B' },
  blatouch: { archetype: 'bug', duration: '0.24s', wobble: '9deg', squashX: 1.15, squashY: 0.87, baseScale: 0.80, accentColor: '#CA8A04' },
  jiskrivec: { archetype: 'bug', duration: '0.19s', wobble: '6deg', squashX: 1.10, squashY: 0.91, baseScale: 0.80, accentColor: '#FBBF24' },
  vrana: { archetype: 'bug', duration: '0.25s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 0.85, accentColor: '#1E293B' },
  mrazovy_skritek: { archetype: 'bug', duration: '0.23s', wobble: '8deg', squashX: 1.12, squashY: 0.89, baseScale: 0.85, accentColor: '#38BDF8' },
  zaba: { archetype: 'bug', duration: '0.28s', wobble: '5deg', squashX: 1.25, squashY: 0.80, baseScale: 0.75, accentColor: '#15803D' },
  zkazena_kraslice: { archetype: 'bug', duration: '0.24s', wobble: '8deg', squashX: 1.18, squashY: 0.84, baseScale: 0.85, accentColor: '#EAB308' },
  carodejnice_koste: { archetype: 'bug', duration: '0.22s', wobble: '7deg', squashX: 1.10, squashY: 0.91, baseScale: 0.90, accentColor: '#7C3AED' },
  chroust: { archetype: 'bug', duration: '0.20s', wobble: '8deg', squashX: 1.14, squashY: 0.88, baseScale: 0.85, accentColor: '#78350F' },
  pampeliska_chmyricko: { archetype: 'bug', duration: '0.18s', wobble: '6deg', squashX: 1.10, squashY: 0.90, baseScale: 0.60, accentColor: '#FEF08A' },

  // --- 2. VODNÍ A ŽELATINOVÁ HAVĚŤ (Slime archetype - high compression, minimal tilt) ---
  ropucha: { archetype: 'slime', duration: '0.70s', wobble: '3deg', squashX: 1.40, squashY: 0.64, baseScale: 1.05, accentColor: '#166534' },
  vodnicek: { archetype: 'slime', duration: '0.62s', wobble: '4deg', squashX: 1.30, squashY: 0.72, baseScale: 0.90, accentColor: '#0EA5E9' },
  topivec: { archetype: 'slime', duration: '0.75s', wobble: '3deg', squashX: 1.42, squashY: 0.62, baseScale: 1.10, accentColor: '#0369A1' },
  kalny_hastrman: { archetype: 'slime', duration: '0.74s', wobble: '4deg', squashX: 1.36, squashY: 0.68, baseScale: 1.15, accentColor: '#1E3A8A' },
  bludicka: { archetype: 'slime', duration: '0.68s', wobble: '2deg', squashX: 1.32, squashY: 0.70, baseScale: 0.95, accentColor: '#22D3EE' },
  vanicka: { archetype: 'slime', duration: '0.65s', wobble: '3deg', squashX: 1.30, squashY: 0.72, baseScale: 1.00, accentColor: '#93C5FD' },
  tajici_snehulak: { archetype: 'slime', duration: '0.80s', wobble: '3deg', squashX: 1.45, squashY: 0.60, baseScale: 1.25, accentColor: '#60A5FA' },
  zmrzlik: { archetype: 'slime', duration: '0.58s', wobble: '4deg', squashX: 1.28, squashY: 0.74, baseScale: 0.90, accentColor: '#38BDF8' },
  pampeliska_chmyri: { archetype: 'slime', duration: '0.65s', wobble: '2deg', squashX: 1.25, squashY: 0.75, baseScale: 0.90, accentColor: '#FEF08A' },

  // --- 3. TĚŽCÍ OBRNĚNCI, OBŘI A BOSSOVÉ (Golem archetype - slow, heavy footfall) ---
  mrazivy_obr: { archetype: 'golem', duration: '1.40s', wobble: '18deg', squashX: 1.26, squashY: 0.78, baseScale: 1.80, accentColor: '#0284C7' },
  obr: { archetype: 'golem', duration: '1.35s', wobble: '16deg', squashX: 1.25, squashY: 0.79, baseScale: 1.75, accentColor: '#57534E' },
  hromotluk: { archetype: 'golem', duration: '1.25s', wobble: '17deg', squashX: 1.24, squashY: 0.80, baseScale: 1.65, accentColor: '#78350F' },
  bezhlavy_rytir: { archetype: 'golem', duration: '1.15s', wobble: '15deg', squashX: 1.22, squashY: 0.81, baseScale: 1.60, accentColor: '#475569' },
  drak: { archetype: 'golem', duration: '1.45s', wobble: '14deg', squashX: 1.28, squashY: 0.76, baseScale: 1.90, accentColor: '#B91C1C' },
  morana: { archetype: 'golem', duration: '1.20s', wobble: '15deg', squashX: 1.22, squashY: 0.82, baseScale: 1.55, accentColor: '#334155' },
  obrneny_zbojnik: { archetype: 'golem', duration: '1.10s', wobble: '16deg', squashX: 1.23, squashY: 0.80, baseScale: 1.45, accentColor: '#9A3412' },
  snehulak: { archetype: 'golem', duration: '1.05s', wobble: '14deg', squashX: 1.26, squashY: 0.78, baseScale: 1.40, accentColor: '#E2E8F0' },
  drab: { archetype: 'golem', duration: '1.08s', wobble: '16deg', squashX: 1.22, squashY: 0.81, baseScale: 1.40, accentColor: '#7F1D1D' },
  beranek: { archetype: 'golem', duration: '0.85s', wobble: '12deg', squashX: 1.20, squashY: 0.83, baseScale: 1.35, accentColor: '#D97706' },
  carodejnice_stara: { archetype: 'golem', duration: '1.10s', wobble: '14deg', squashX: 1.22, squashY: 0.81, baseScale: 1.50, accentColor: '#15803D' },
  vrchni_carodejnice: { archetype: 'golem', duration: '1.25s', wobble: '16deg', squashX: 1.24, squashY: 0.80, baseScale: 1.70, accentColor: '#7C3AED' },
  ledovi_muzi: { archetype: 'golem', duration: '1.20s', wobble: '14deg', squashX: 1.25, squashY: 0.78, baseScale: 1.55, accentColor: '#38BDF8' },

  // --- 4. BĚŽNÍ PĚŠÁCI, BUBÁCI, KOSTLIVCI A VENKOVANÉ (Runner archetype - balanced wobble) ---
  carodejnice_zaspalka: { archetype: 'runner', duration: '0.45s', wobble: '11deg', squashX: 1.15, squashY: 0.87, baseScale: 1.20, accentColor: '#6D28D9' },
  bubak: { archetype: 'runner', duration: '0.52s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#78350F' },
  kostlivec: { archetype: 'runner', duration: '0.48s', wobble: '9deg', squashX: 1.14, squashY: 0.88, baseScale: 1.00, accentColor: '#F5F5F4' },
  kostlivec_kosa: { archetype: 'runner', duration: '0.50s', wobble: '10deg', squashX: 1.15, squashY: 0.87, baseScale: 1.05, accentColor: '#E7E5E4' },
  skeleton: { archetype: 'runner', duration: '0.48s', wobble: '9deg', squashX: 1.14, squashY: 0.88, baseScale: 1.00, accentColor: '#F5F5F4' },
  skeleton_scythe: { archetype: 'runner', duration: '0.50s', wobble: '10deg', squashX: 1.15, squashY: 0.87, baseScale: 1.05, accentColor: '#E7E5E4' },
  krvavy_kostlivec: { archetype: 'runner', duration: '0.46s', wobble: '11deg', squashX: 1.15, squashY: 0.87, baseScale: 1.05, accentColor: '#B91C1C' },
  hrobnik: { archetype: 'runner', duration: '0.56s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#44403C' },
  umrlec: { archetype: 'runner', duration: '0.54s', wobble: '10deg', squashX: 1.15, squashY: 0.87, baseScale: 1.05, accentColor: '#52525B' },
  pisar: { archetype: 'runner', duration: '0.48s', wobble: '9deg', squashX: 1.12, squashY: 0.89, baseScale: 0.95, accentColor: '#6B7280' },
  stodolnik: { archetype: 'runner', duration: '0.52s', wobble: '11deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#854D0E' },
  drevorubec: { archetype: 'runner', duration: '0.55s', wobble: '13deg', squashX: 1.18, squashY: 0.85, baseScale: 1.15, accentColor: '#713F12' },
  hastrman: { archetype: 'runner', duration: '0.54s', wobble: '11deg', squashX: 1.18, squashY: 0.85, baseScale: 1.05, accentColor: '#047857' },
  meluzina: { archetype: 'runner', duration: '0.45s', wobble: '8deg', squashX: 1.12, squashY: 0.89, baseScale: 1.00, accentColor: '#BAE6FD' },
  mrazik: { archetype: 'runner', duration: '0.46s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 0.95, accentColor: '#7DD3FC' },
  severak: { archetype: 'runner', duration: '0.50s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#0284C7' },
  polednice: { archetype: 'runner', duration: '0.52s', wobble: '13deg', squashX: 1.16, squashY: 0.86, baseScale: 1.15, accentColor: '#EAB308' },
  klekanice: { archetype: 'runner', duration: '0.54s', wobble: '12deg', squashX: 1.17, squashY: 0.85, baseScale: 1.15, accentColor: '#374151' },
  divozenka: { archetype: 'runner', duration: '0.46s', wobble: '11deg', squashX: 1.14, squashY: 0.88, baseScale: 1.05, accentColor: '#16A34A' },
  cert: { archetype: 'runner', duration: '0.50s', wobble: '14deg', squashX: 1.18, squashY: 0.85, baseScale: 1.15, accentColor: '#991B1B' },
  certik: { archetype: 'runner', duration: '0.44s', wobble: '12deg', squashX: 1.15, squashY: 0.87, baseScale: 0.95, accentColor: '#DC2626' },
  ohnivy_muz: { archetype: 'runner', duration: '0.48s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#EA580C' },
  hejkal: { archetype: 'runner', duration: '0.58s', wobble: '15deg', squashX: 1.20, squashY: 0.83, baseScale: 1.25, accentColor: '#3F6212' },
  zbojnik: { archetype: 'runner', duration: '0.50s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#92400E' },
  ohnivy_pes: { archetype: 'runner', duration: '0.38s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 1.00, accentColor: '#F97316' },
  cerny_pes: { archetype: 'runner', duration: '0.40s', wobble: '9deg', squashX: 1.12, squashY: 0.89, baseScale: 1.00, accentColor: '#18181B' },
  cerny_vlkodlak: { archetype: 'runner', duration: '0.42s', wobble: '11deg', squashX: 1.15, squashY: 0.87, baseScale: 1.15, accentColor: '#27272A' },
  mlynar: { archetype: 'runner', duration: '0.56s', wobble: '13deg', squashX: 1.17, squashY: 0.85, baseScale: 1.15, accentColor: '#854D0E' },
  bila_pani: { archetype: 'runner', duration: '0.58s', wobble: '8deg', squashX: 1.10, squashY: 0.91, baseScale: 1.10, accentColor: '#F8FAFC' },
  zbrojnos: { archetype: 'runner', duration: '0.54s', wobble: '12deg', squashX: 1.16, squashY: 0.86, baseScale: 1.10, accentColor: '#64748B' },
  nocni_mura: { archetype: 'runner', duration: '0.52s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 1.05, accentColor: '#581C87' },
  jezinka_mraziva: { archetype: 'runner', duration: '0.48s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 1.05, accentColor: '#0284C7' },
  rehtackar: { archetype: 'runner', duration: '0.44s', wobble: '10deg', squashX: 1.14, squashY: 0.88, baseScale: 1.00, accentColor: '#D97706' },
};

// In-memory cache for baked canvas data URIs so we bake each enemy at most once
const bakedDataUriCache = new Map<string, string>();

/**
 * Returns a high-resolution baked Data URI for any of the 58 folklore enemies.
 * Uses an offscreen 128x128 canvas rendering the canonical Josef Lada drawing,
 * converting it to a PNG Data URI so the browser bakes it into a GPU texture.
 */
export function getEnemySpriteDataUri(enemyId: string): string {
  if (bakedDataUriCache.has(enemyId)) {
    return bakedDataUriCache.get(enemyId)!;
  }

  // 2. Offscreen Canvas Baking via Lada Renderer
  if (typeof document !== 'undefined') {
    try {
      const def = ENEMIES[enemyId];
      const method = def?.method;
      const drawer = method ? (Lada as any)[method] : null;

      if (typeof drawer === 'function' || typeof drawEnemyRenderer === 'function') {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, 128, 128);

          // Draw the enemy in neutral idle pose, anchored near bottom center (cx=64, cy=86)
          if (typeof drawEnemyRenderer === 'function' && method) {
            drawEnemyRenderer(method, ctx, 64, 86, 0, 0, false, {
              radius: def?.radius || 24,
              attackCadence: def?.attackCadence || 'normal',
              isAttacking: false,
              windupTimer: 0,
              recoveryTimer: 0,
            });
          } else if (typeof drawer === 'function') {
            drawer(ctx, 64, 86, 0, 0, false);
          }

          const dataUrl = canvas.toDataURL('image/png');
          // If valid data URL with content
          if (dataUrl && dataUrl.length > 100) {
            bakedDataUriCache.set(enemyId, dataUrl);
            return dataUrl;
          }
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 3. Fallback: Archetype baked SVG Data URI with custom enemy initials and folklore color
  const conf = ENEMY_ARCHETYPE_MAP[enemyId];
  const arch = conf?.archetype || 'runner';
  const fallback = BAKED_SPRITES[arch] || BAKED_SPRITES.runner;
  bakedDataUriCache.set(enemyId, fallback);
  return fallback;
}

/**
 * Returns full configuration and walking kinematics for any enemy ID.
 */
export function getEnemyGpuConfig(enemyId: string): EnemyGpuConfig {
  const def = ENEMIES[enemyId] || {
    id: enemyId,
    name: enemyId,
    category: 'all',
  };
  const mapping = ENEMY_ARCHETYPE_MAP[enemyId] || {
    archetype: 'runner' as EnemyArchetype,
    accentColor: '#B45309',
  };
  const basePreset = ARCHETYPE_PRESETS[mapping.archetype] || ARCHETYPE_PRESETS.runner;

  const duration = mapping.duration ?? basePreset.animDuration;
  const wobble = mapping.wobble ?? basePreset.wobbleAngle;
  const squashX = mapping.squashX ?? basePreset.squashX;
  const squashY = mapping.squashY ?? basePreset.squashY;
  const derived = computeVolumePreservingStretch(squashX, squashY);
  const baseScale = mapping.baseScale ?? basePreset.baseScale;

  const spriteUrl = getEnemySpriteDataUri(enemyId);

  return {
    id: enemyId,
    name: def.name || enemyId,
    category: def.category || 'all',
    archetype: mapping.archetype,
    params: {
      animDuration: duration,
      wobbleAngle: wobble,
      squashX,
      squashY,
      stretchX: derived.stretchX,
      stretchY: derived.stretchY,
      baseScale,
      width: basePreset.width,
      height: basePreset.height,
      speed: basePreset.speed,
      name: def.name || basePreset.name,
      description: basePreset.description,
    },
    spriteUrl,
  };
}

/**
 * List of all 58 supported canonical enemy IDs.
 */
export const ALL_ENEMY_IDS = Object.keys(ENEMIES);
