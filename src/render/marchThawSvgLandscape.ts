/**
 * Stage 1 ("1. Předjaří v Hrusicích" / "BŘEZEN") Complete Panoramic SVG Landscape (+25% Scale)
 *
 * Inspired by the classic Czech storybook calendar illustration ("BŘEZEN"):
 * - Top ornamental BŘEZEN banner
 * - HORNÍ POLE (plowed fields with furrows, melting snow, two horse-drawn ploughs, sowers, haystack, crows)
 * - KOSTEL (hilltop church with stone cemetery wall, gravestones, southern gate, villagers planting a young tree)
 * - KAPLIČKA (wayside village chapel at the crossroads + radiant SVG apparition of Panna Maria s Ježíškem
 *   that scatters bubáci + villager carrying Morana)
 * - VESNICE, HOSPODA & ŠKOLA (cluster of timbered & whitewashed cottages, stork nest on pole with ladder,
 *   village green circle dance, tavern with outdoor tables, schoolhouse along the fenced road)
 * - RYBNÍK (weeping willows with catkins, reeds, marsh marigolds, swimming geese, floating ice floes,
 *   villagers with pitchforks by the lower-left woods)
 * - MLÝN A ŘEKA (winding river flowing all the way from the northern arena border, under the wooden bridge,
 *   past the watermill wheel, to the southern arena border, with shepherd, dog, and flock of sheep)
 * - LES (four large conifer forest zones with LES ribbons, wild boars in snow, roe deer, and storks)
 * - Outer decorative border at MARCH_ARENA_BOUNDS (-1920..1920 x -1675..1675) forming the physical arena edge.
 */

import {
  MARCH_ARENA_BOUNDS,
  MARCH_ICE_FLOE_SPECS,
  MARCH_POND_REGION,
  MARCH_STREAM_WAYPOINTS,
  MARCH_THAW_OBSTACLES,
  MARCH_THAW_POIS,
  getMarchIceFloeState,
} from '../data/marchThawArena';

export const MARCH_WORLD_BOUNDS = {
  minX: -2000,
  minY: -1750,
  maxX: 2000,
  maxY: 1750,
  width: 4000,
  height: 3500,
} as const;

function svgRibbon(x: number, y: number, text: string, width = 136, fontSize = 18): string {
  const hw = width / 2;
  return `
    <g transform="translate(${x}, ${y})">
      <path d="M ${-hw - 18} 6 L ${-hw - 4} -12 L ${-hw + 8} -2 L ${-hw - 6} 16 Z" fill="#D9B882" stroke="#23170F" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M ${hw + 18} 6 L ${hw + 4} -12 L ${hw - 8} -2 L ${hw + 6} 16 Z" fill="#D9B882" stroke="#23170F" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M ${-hw} -13 Q 0 -19 ${hw} -13 L ${hw - 4} 14 Q 0 8 ${-hw + 4} 14 Z" fill="#F8E3B4" stroke="#23170F" stroke-width="2.8" stroke-linejoin="round"/>
      <text x="0" y="5" text-anchor="middle" font-family="Eczar, Georgia, serif" font-weight="900" font-size="${fontSize}" fill="#23170F" letter-spacing="1.2">${text}</text>
    </g>
  `;
}

function svgStar8(x: number, y: number, rOuter = 22, rInner = 6, rot = 0): string {
  let pts = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 === 0 ? (i % 4 === 0 ? rOuter : rOuter * 0.62) : rInner;
    const px = (Math.cos(a) * r).toFixed(1);
    const py = (Math.sin(a) * r).toFixed(1);
    pts += `${px},${py} `;
  }
  return `
    <g transform="translate(${x}, ${y}) rotate(${rot})">
      <polygon points="${pts.trim()}" fill="#FACC15" stroke="#D97706" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="${(rInner * 0.75).toFixed(1)}" fill="#FEF9C3"/>
    </g>
  `;
}

function svgStar6Halo(x: number, y: number, rOuter = 8.5, rInner = 3.8): string {
  let pts = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts += `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)} `;
  }
  return `<polygon transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})" points="${pts.trim()}" fill="#FACC15" stroke="#23170F" stroke-width="1.5" stroke-linejoin="round"/>`;
}

function svgFolkDaisy(x: number, y: number, scale = 1, rot = 0): string {
  return `
    <g transform="translate(${x}, ${y}) rotate(${rot}) scale(${scale})">
      <!-- Green leafy stem & berries -->
      <path d="M 0 22 Q -4 10 0 0 M 0 14 Q -12 10 -14 4 M 0 12 Q 12 8 14 2" fill="none" stroke="#84CC16" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="-11" cy="7" rx="5.5" ry="2.6" transform="rotate(-28 -11 7)" fill="#84CC16" stroke="#23170F" stroke-width="1.1"/>
      <ellipse cx="11" cy="5" rx="5.5" ry="2.6" transform="rotate(28 11 5)" fill="#84CC16" stroke="#23170F" stroke-width="1.1"/>
      <circle cx="-8" cy="-14" r="3.8" fill="#EF4444" stroke="#23170F" stroke-width="1.2"/>
      <circle cx="7" cy="-15" r="3.5" fill="#F97316" stroke="#23170F" stroke-width="1.2"/>
      <!-- 5 White folk petals -->
      <ellipse cx="0" cy="-8" rx="4.2" ry="6.5" fill="#FFFFFF" stroke="#23170F" stroke-width="1.3"/>
      <ellipse cx="-7.5" cy="-2.5" rx="4.2" ry="6.5" transform="rotate(-72 -7.5 -2.5)" fill="#FFFFFF" stroke="#23170F" stroke-width="1.3"/>
      <ellipse cx="7.5" cy="-2.5" rx="4.2" ry="6.5" transform="rotate(72 7.5 -2.5)" fill="#FFFFFF" stroke="#23170F" stroke-width="1.3"/>
      <ellipse cx="-4.8" cy="6.2" rx="4.2" ry="6.5" transform="rotate(-144 -4.8 6.2)" fill="#FFFFFF" stroke="#23170F" stroke-width="1.3"/>
      <ellipse cx="4.8" cy="6.2" rx="4.2" ry="6.5" transform="rotate(144 4.8 6.2)" fill="#FFFFFF" stroke="#23170F" stroke-width="1.3"/>
      <circle cx="0" cy="0" r="4.2" fill="#EA580C" stroke="#23170F" stroke-width="1.3"/>
      <circle cx="-1" cy="-1" r="1.6" fill="#FDE047"/>
    </g>
  `;
}

/**
 * Inner SVG group for the folk-art apparition of Panna Maria s Ježíškem
 * based on `/public/assets/aistudio/image_d9d60fc7.png`.
 * Centered at (0, 0) within a (-220..220 x -275..275) coordinate space.
 */
export function svgMarianApparitionGroup(): string {
  // 1. Radiant Mandorla Sunburst (alternating golden rays & soft sky-blue gouache strokes)
  let raysSvg = '';
  const rayCount = 36;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2;
    const nextA = ((i + 0.5) / rayCount) * Math.PI * 2;
    const isMajor = i % 3 === 0;
    const rx = isMajor ? 192 : 162 + (i % 2) * 18;
    const ry = isMajor ? 246 : 210 + (i % 2) * 20;

    // Sky-blue brush stroke between golden beams
    const bx = Math.cos(nextA) * (rx * 0.82);
    const by = Math.sin(nextA) * (ry * 0.82);
    const bLeftX = Math.cos(nextA - 0.045) * 42;
    const bLeftY = Math.sin(nextA - 0.045) * 52;
    const bRightX = Math.cos(nextA + 0.045) * 42;
    const bRightY = Math.sin(nextA + 0.045) * 52;
    raysSvg += `<polygon points="${bLeftX.toFixed(1)},${bLeftY.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} ${bRightX.toFixed(1)},${bRightY.toFixed(1)}" fill="#93C5FD" opacity="0.52"/>`;

    // Sharp golden ray
    const tx = Math.cos(a) * rx;
    const ty = Math.sin(a) * ry;
    const lX = Math.cos(a - 0.055) * 34;
    const lY = Math.sin(a - 0.055) * 44;
    const rX = Math.cos(a + 0.055) * 34;
    const rY = Math.sin(a + 0.055) * 44;
    const rayFill = isMajor ? '#F59E0B' : i % 2 === 0 ? '#FACC15' : '#FDE047';
    raysSvg += `<polygon points="${lX.toFixed(1)},${lY.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${rX.toFixed(1)},${rY.toFixed(1)}" fill="${rayFill}" stroke="#F59E0B" stroke-width="0.8" opacity="0.92"/>`;
  }

  // 2. Scattered 8-pointed stars around the mandorla
  const starPositions = [
    [0, -242, 28, 7],
    [0, 236, 25, 6.5],
    [-182, -18, 25, 6.5],
    [182, -18, 25, 6.5],
    [-82, -196, 14, 4],
    [84, -194, 15, 4],
    [-132, -142, 16, 4.5],
    [134, -140, 16, 4.5],
    [-162, -78, 15, 4],
    [164, -76, 15, 4],
    [-144, 52, 13, 3.8],
    [146, 56, 14, 4],
    [-138, 128, 16, 4.5],
    [142, 130, 16, 4.5],
    [-86, 196, 13, 3.8],
    [88, 198, 13, 3.8],
    [-98, -82, 12, 3.5],
    [106, -42, 12, 3.5],
    [-96, 78, 14, 4],
    [98, 92, 13, 3.8],
  ] as const;
  let starsSvg = '';
  for (const [sx, sy, ro, ri] of starPositions) {
    starsSvg += svgStar8(sx, sy, ro, ri);
  }

  // 3. Mary's circle of 9 stars & Baby Jesus's circle of 7 stars
  let maryHaloStars = '';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * 1.12 + (i / 8) * (Math.PI * 1.24);
    maryHaloStars += svgStar6Halo(-12 + Math.cos(a) * 56, -124 + Math.sin(a) * 56, 8.5, 3.8);
  }
  let childHaloStars = '';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 1.05 + (i / 6) * (Math.PI * 1.25);
    childHaloStars += svgStar6Halo(54 + Math.cos(a) * 38, -74 + Math.sin(a) * 38, 7.2, 3.2);
  }

  return `
    <g id="marian-apparition">
      <!-- Soft celestial glow behind rays -->
      <ellipse cx="0" cy="-4" rx="168" ry="218" fill="#FEF9C3" opacity="0.55"/>
      ${raysSvg}
      <ellipse cx="0" cy="-10" rx="112" ry="152" fill="#FFFBEB" opacity="0.65"/>
      ${starsSvg}

      <!-- Halo rings & stars -->
      <circle cx="-12" cy="-124" r="56" fill="none" stroke="#23170F" stroke-width="2"/>
      ${maryHaloStars}
      <circle cx="54" cy="-74" r="38" fill="none" stroke="#23170F" stroke-width="1.8"/>
      ${childHaloStars}

      <!-- Flowing White Marian Veil (back layer) -->
      <path d="M -52 -136 C -66 -92 -82 -44 -108 -18 C -94 -2 -76 2 -66 -8 L 42 -62 C 34 -108 18 -148 -8 -154 C -32 -158 -44 -150 -52 -136 Z" fill="#FFFFFF" stroke="#23170F" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M -50 -132 C -64 -90 -78 -44 -102 -20" fill="none" stroke="#FACC15" stroke-width="3.5" stroke-linecap="round"/>

      <!-- Cream-White Pleated Inner Gown -->
      <path d="M -38 -64 L 26 -64 L 62 192 Q 36 212 12 198 Q -12 214 -42 198 Q -68 206 -82 186 Z" fill="#FAF6EE" stroke="#23170F" stroke-width="3" stroke-linejoin="round"/>
      <!-- Pleat lines & bottom golden hem -->
      <path d="M -22 -52 Q -26 55 -48 188 M -6 -52 Q -4 62 -16 192 M 10 -52 Q 18 60 14 190 M 22 -30 Q 34 68 38 186" fill="none" stroke="#D6CEBF" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M -80 184 Q -62 202 -42 194 Q -12 210 12 194 Q 36 208 60 188" fill="none" stroke="#FACC15" stroke-width="5" stroke-linecap="round"/>

      <!-- Golden Collar & Golden Waist Sash -->
      <path d="M -26 -68 Q -6 -56 16 -68" fill="none" stroke="#FACC15" stroke-width="5" stroke-linecap="round"/>
      <path d="M -26 -68 Q -6 -56 16 -68" fill="none" stroke="#23170F" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M -26 -26 Q -2 -32 22 -24 L 22 -16 Q -2 -24 -26 -18 Z" fill="#FACC15" stroke="#23170F" stroke-width="2.2" stroke-linejoin="round"/>

      <!-- Royal Blue Folk-Art Mantle (Left & Right Cascading Folds with Golden Trim) -->
      <!-- Left sweeping mantle cascade -->
      <path d="M -32 -68 C -68 -54 -92 -22 -96 8 C -82 18 -68 42 -78 68 C -62 88 -56 114 -68 142 C -82 162 -106 168 -102 186 C -88 198 -62 182 -42 172 C -12 158 14 132 16 104 C 18 68 -12 46 -18 12 C -24 -22 -20 -48 -32 -68 Z" fill="#0284C7" stroke="#23170F" stroke-width="3.2" stroke-linejoin="round"/>
      <!-- Inner darker blue fold shading -->
      <path d="M -68 -24 C -54 12 -46 58 -58 118 M -42 -12 C -28 32 -22 76 -34 144" fill="none" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
      <!-- Golden trim along the left mantle border -->
      <path d="M -32 -68 C -20 -48 -24 -22 -18 12 C -12 46 18 68 16 104 C 14 132 -12 158 -42 172 C -62 182 -88 198 -102 186" fill="none" stroke="#FACC15" stroke-width="6" stroke-linecap="round"/>
      <path d="M -32 -68 C -20 -48 -24 -22 -18 12 C -12 46 18 68 16 104 C 14 132 -12 158 -42 172 C -62 182 -88 198 -102 186" fill="none" stroke="#23170F" stroke-width="2" stroke-linecap="round"/>

      <!-- Right sweeping mantle cascade (under Baby Jesus) -->
      <path d="M 24 -64 C 58 -48 88 -12 96 36 C 104 78 96 124 72 162 C 56 182 38 196 48 152 C 56 112 52 54 44 4 Z" fill="#0284C7" stroke="#23170F" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M 44 4 C 52 54 56 112 48 152 C 38 196 56 182 72 162 C 96 124 104 78 96 36" fill="none" stroke="#FACC15" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M 44 4 C 52 54 56 112 48 152 C 38 196 56 182 72 162 C 96 124 104 78 96 36" fill="none" stroke="#23170F" stroke-width="1.8" stroke-linecap="round"/>

      <!-- Folk-Art Floral Embroidery on the Blue Mantle (Daisies, Rosehips & Green Leaves) -->
      ${svgFolkDaisy(-44, 16, 0.95, -8)}
      ${svgFolkDaisy(-8, 72, 0.92, 12)}
      ${svgFolkDaisy(-48, 128, 0.95, -14)}
      ${svgFolkDaisy(76, 64, 0.88, 10)}

      <!-- Mary's Welcoming Right Hand & Sleeve (Viewer's Left) -->
      <g transform="translate(-78, -6)">
        <ellipse cx="6" cy="0" rx="14" ry="18" fill="#FAF6EE" stroke="#23170F" stroke-width="2.6"/>
        <path d="M -10 -4 L -32 4 C -36 6 -36 11 -30 11 L -16 8 L -32 14 C -35 16 -33 20 -28 19 L -12 14 L -24 20 C -26 22 -24 25 -19 23 L -4 14 Z" fill="#FAD2B8" stroke="#23170F" stroke-width="2.2" stroke-linejoin="round"/>
      </g>

      <!-- Virgin Mary's Neck, Hair, Tilted Folk-Art Face & Royal Crown -->
      <g transform="translate(-12, -114) rotate(7)">
        <!-- Neck -->
        <rect x="-9" y="22" width="18" height="24" rx="6" fill="#FAD2B8" stroke="#23170F" stroke-width="2.2"/>
        <!-- Wavy chestnut-brown hair locks -->
        <path d="M -26 -14 C -34 8 -34 34 -24 54 C -18 46 -16 28 -18 12 Z" fill="#5C3016" stroke="#23170F" stroke-width="2.2"/>
        <path d="M 26 -14 C 34 8 32 34 22 52 C 16 44 16 28 18 12 Z" fill="#5C3016" stroke="#23170F" stroke-width="2.2"/>
        <!-- Face oval -->
        <ellipse cx="0" cy="0" rx="23" ry="28" fill="#FAD2B8" stroke="#23170F" stroke-width="2.8"/>
        <!-- Parted hair top -->
        <path d="M -23 -4 C -22 -24 -8 -30 0 -26 C 8 -30 22 -24 23 -4 C 14 -14 4 -18 0 -14 C -4 -18 -14 -14 -23 -4 Z" fill="#6B3A1E" stroke="#23170F" stroke-width="2.2"/>
        <!-- Rosy cheeks -->
        <circle cx="-12" cy="6" r="6.5" fill="#FB7185" opacity="0.45"/>
        <circle cx="12" cy="6" r="6.5" fill="#FB7185" opacity="0.45"/>
        <!-- Brows & kind eyes -->
        <path d="M -15 -8 Q -9 -13 -4 -8 M 4 -8 Q 9 -13 15 -8" fill="none" stroke="#23170F" stroke-width="2" stroke-linecap="round"/>
        <circle cx="-9" cy="-2" r="2.6" fill="#23170F"/>
        <circle cx="-9.8" cy="-2.8" r="0.9" fill="#FFFFFF"/>
        <circle cx="9" cy="-2" r="2.6" fill="#23170F"/>
        <circle cx="8.2" cy="-2.8" r="0.9" fill="#FFFFFF"/>
        <!-- Nose & gentle smile -->
        <path d="M 0 -2 L -1.5 6 L 2 7" fill="none" stroke="#23170F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M -6 13 Q 0 18 6 13" fill="none" stroke="#E11D48" stroke-width="2.4" stroke-linecap="round"/>

        <!-- White Veil Hood Frame -->
        <path d="M -26 -8 C -26 -32 26 -32 26 -8" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
        <path d="M -27 -8 C -27 -33 27 -33 27 -8" fill="none" stroke="#23170F" stroke-width="2.4" stroke-linecap="round"/>

        <!-- Ornate Golden Royal Crown with Red & Blue Jewels -->
        <g transform="translate(0, -32)">
          <path d="M -22 6 L -26 -12 L -13 -4 L 0 -18 L 13 -4 L 26 -12 L 22 6 Z" fill="#FACC15" stroke="#23170F" stroke-width="2.4" stroke-linejoin="round"/>
          <rect x="-22" y="3" width="44" height="7" rx="2" fill="#EAB308" stroke="#23170F" stroke-width="2"/>
          <circle cx="-12" cy="6.5" r="2.3" fill="#2563EB"/>
          <circle cx="0" cy="6.5" r="2.6" fill="#EF4444"/>
          <circle cx="12" cy="6.5" r="2.3" fill="#2563EB"/>
          <circle cx="0" cy="-20" r="2.5" fill="#FEF08A" stroke="#23170F" stroke-width="1.4"/>
        </g>
      </g>

      <!-- Baby Jesus (Ježíšek) in White Tunic with Royal Orb & Blessing Hand -->
      <g transform="translate(48, -32)">
        <!-- Flowing white child tunic with gold hem -->
        <path d="M -18 -18 L 18 -18 L 32 42 Q 8 52 -22 38 Z" fill="#FAF6EE" stroke="#23170F" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M -20 35 Q 6 48 30 39" fill="none" stroke="#FACC15" stroke-width="4.2" stroke-linecap="round"/>
        <path d="M -10 -18 Q 0 -10 10 -18" fill="none" stroke="#FACC15" stroke-width="3.2" stroke-linecap="round"/>

        <!-- Bare little feet peeking from tunic -->
        <ellipse cx="-14" cy="44" rx="6.5" ry="4" transform="rotate(-18 -14 44)" fill="#FAD2B8" stroke="#23170F" stroke-width="2"/>
        <ellipse cx="2" cy="48" rx="6.5" ry="4" transform="rotate(12 2 48)" fill="#FAD2B8" stroke="#23170F" stroke-width="2"/>

        <!-- Right hand raised in two-finger blessing -->
        <path d="M -16 -10 Q -28 -16 -24 -30" fill="none" stroke="#FAF6EE" stroke-width="10" stroke-linecap="round"/>
        <path d="M -16 -10 Q -28 -16 -24 -30" fill="none" stroke="#23170F" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="-24" cy="-34" r="5.5" fill="#FAD2B8" stroke="#23170F" stroke-width="2"/>
        <path d="M -26 -38 L -26 -46 M -22 -38 L -22 -45" stroke="#FAD2B8" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M -26 -38 L -26 -46 M -22 -38 L -22 -45" stroke="#23170F" stroke-width="1.4" stroke-linecap="round"/>

        <!-- Royal Blue & Gold Globus Cruciger (Královské jablko) in Left Hand -->
        <g transform="translate(32, -2)">
          <circle cx="0" cy="0" r="14" fill="#0284C7" stroke="#23170F" stroke-width="2.4"/>
          <path d="M -14 0 Q 0 5 14 0" fill="none" stroke="#FACC15" stroke-width="4.5"/>
          <path d="M 0 -14 Q 4 0 0 0" fill="none" stroke="#FACC15" stroke-width="3.5"/>
          <path d="M 0 -14 L 0 -27 M -6 -21 L 6 -21" stroke="#FACC15" stroke-width="4.2" stroke-linecap="round"/>
          <path d="M 0 -14 L 0 -27 M -6 -21 L 6 -21" stroke="#23170F" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Child's left hand holding the orb -->
          <ellipse cx="-2" cy="9" rx="6.5" ry="4.5" fill="#FAD2B8" stroke="#23170F" stroke-width="2"/>
        </g>

        <!-- Mary's left hand gently supporting Baby Jesus -->
        <path d="M 22 18 L 2 10 C -2 8 -4 12 0 15 L 14 22 Z" fill="#FAD2B8" stroke="#23170F" stroke-width="2" stroke-linejoin="round"/>

        <!-- Baby Jesus's Head, Golden Curls & Small Royal Crown -->
        <g transform="translate(4, -38) rotate(10)">
          <!-- Curly golden-brown hair -->
          <circle cx="-14" cy="-4" r="6.5" fill="#A16207" stroke="#23170F" stroke-width="2"/>
          <circle cx="14" cy="-4" r="6.5" fill="#A16207" stroke="#23170F" stroke-width="2"/>
          <circle cx="-10" cy="-14" r="6.5" fill="#A16207" stroke="#23170F" stroke-width="2"/>
          <circle cx="10" cy="-14" r="6.5" fill="#A16207" stroke="#23170F" stroke-width="2"/>
          <circle cx="0" cy="0" r="15.5" fill="#FAD2B8" stroke="#23170F" stroke-width="2.5"/>
          <circle cx="-8" cy="3" r="4.2" fill="#FB7185" opacity="0.45"/>
          <circle cx="8" cy="3" r="4.2" fill="#FB7185" opacity="0.45"/>
          <circle cx="-5.5" cy="-2" r="2" fill="#23170F"/>
          <circle cx="5.5" cy="-2" r="2" fill="#23170F"/>
          <path d="M -4 7 Q 0 10.5 4 7" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round"/>
          <!-- Small Crown -->
          <path d="M -14 -13 L -16 -24 L -7 -18 L 0 -27 L 7 -18 L 16 -24 L 14 -13 Z" fill="#FACC15" stroke="#23170F" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="0" cy="-16" r="1.8" fill="#EF4444"/>
        </g>
      </g>
    </g>
  `;
}

/**
 * Builds the standalone high-detail SVG document for the apparition of Panna Maria s Ježíškem.
 */
export function buildMarianApparitionSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-220 -275 440 550" width="440" height="550">
    ${svgMarianApparitionGroup()}
  </svg>`;
}

function svgSpruceTree(x: number, y: number, scale = 1, snow = false): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <ellipse cx="0" cy="12" rx="18" ry="6" fill="rgba(25,20,15,0.18)"/>
      <rect x="-4.5" y="-4" width="9" height="16" fill="#5C3A21" stroke="#23170F" stroke-width="2"/>
      <path d="M 0 -76 L -28 -18 L -14 -20 L -32 4 L 32 4 L 14 -20 L 28 -18 Z" fill="#2F5A36" stroke="#23170F" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M 0 -76 L -22 -36 L -10 -37 L -24 -14 L 24 -14 L 10 -37 L 22 -36 Z" fill="#3E6E44" stroke="#23170F" stroke-width="2" stroke-linejoin="round"/>
      ${
        snow
          ? `<path d="M 0 -74 L -12 -52 Q 0 -48 12 -52 Z M -18 -26 Q -8 -20 0 -24 Q 10 -20 18 -26 L 12 -34 L -12 -34 Z" fill="#F4F9FC" opacity="0.9"/>`
          : ''
      }
    </g>
  `;
}

function svgCottage(
  x: number,
  y: number,
  opts: {
    w?: number;
    h?: number;
    roofH?: number;
    wallColor?: string;
    roofColor?: string;
    timbered?: boolean;
    gableColor?: string;
    label?: string;
    storkOnChimney?: boolean;
    isNight?: boolean;
  } = {}
): string {
  const w = opts.w ?? 96;
  const h = opts.h ?? 54;
  const roofH = opts.roofH ?? 44;
  const wallColor = opts.wallColor ?? (opts.timbered ? '#8C5230' : '#F5EAD0');
  const roofColor = opts.roofColor ?? '#B84A32';
  const gableColor = opts.gableColor ?? '#D9A55B';
  const winFill = opts.isNight ? '#FDE047' : '#5B7C99';
  const hw = w / 2;
  const hh = h / 2;

  let logs = '';
  if (opts.timbered) {
    for (let ly = -hh + 9; ly < hh; ly += 9) {
      logs += `<line x1="${-hw + 3}" y1="${ly}" x2="${hw - 3}" y2="${ly}" stroke="#5A3118" stroke-width="1.8"/>`;
    }
  }

  const storkSvg = opts.storkOnChimney
    ? `
      <g transform="translate(${hw * 0.45}, ${-hh - roofH - 8})">
        <ellipse cx="0" cy="4" rx="16" ry="5" fill="#7C5836" stroke="#23170F" stroke-width="2"/>
        <path d="M -2 2 L -4 -8 M 3 2 L 5 -8" stroke="#D95338" stroke-width="2"/>
        <ellipse cx="0" cy="-12" rx="8" ry="5" fill="#FFFFFF" stroke="#23170F" stroke-width="1.8"/>
        <path d="M 5 -14 Q 9 -23 6 -26" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 5 -14 Q 9 -23 6 -26" fill="none" stroke="#23170F" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="7" cy="-26" r="3.2" fill="#FFFFFF" stroke="#23170F" stroke-width="1.5"/>
        <path d="M 10 -26 L 19 -24 L 10 -24 Z" fill="#D95338"/>
      </g>
    `
    : '';

  return `
    <g transform="translate(${x}, ${y})">
      <ellipse cx="4" cy="${hh + 4}" rx="${hw + 10}" ry="14" fill="rgba(28,19,12,0.2)"/>
      <rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="${wallColor}" stroke="#23170F" stroke-width="3"/>
      ${logs}
      <rect x="-9" y="${hh - 30}" width="18" height="30" rx="2" fill="#5C341B" stroke="#23170F" stroke-width="2.2"/>
      <circle cx="5" cy="${hh - 14}" r="1.8" fill="#F6D365"/>
      <rect x="${-hw + 12}" y="${-hh + 12}" width="18" height="16" rx="1.5" fill="${winFill}" stroke="#23170F" stroke-width="2.2"/>
      <line x1="${-hw + 21}" y1="${-hh + 12}" x2="${-hw + 21}" y2="${-hh + 28}" stroke="#23170F" stroke-width="1.6"/>
      <line x1="${-hw + 12}" y1="${-hh + 20}" x2="${-hw + 30}" y2="${-hh + 20}" stroke="#23170F" stroke-width="1.6"/>
      <rect x="${hw - 30}" y="${-hh + 12}" width="18" height="16" rx="1.5" fill="${winFill}" stroke="#23170F" stroke-width="2.2"/>
      <line x1="${hw - 21}" y1="${-hh + 12}" x2="${hw - 21}" y2="${-hh + 28}" stroke="#23170F" stroke-width="1.6"/>
      <line x1="${hw - 30}" y1="${-hh + 20}" x2="${hw - 12}" y2="${-hh + 20}" stroke="#23170F" stroke-width="1.6"/>
      <rect x="${hw * 0.35}" y="${-hh - roofH + 4}" width="14" height="24" fill="#E6D7B8" stroke="#23170F" stroke-width="2.2"/>
      <path d="M ${-hw - 10} ${-hh + 2} L ${-hw * 0.45} ${-hh - roofH} L ${hw * 0.55} ${-hh - roofH} L ${hw + 10} ${-hh + 2} Z" fill="${roofColor}" stroke="#23170F" stroke-width="3" stroke-linejoin="round"/>
      <path d="M ${-hw - 6} ${-hh + 2} L ${-hw * 0.45} ${-hh - roofH} L ${-hw * 0.02} ${-hh + 2} Z" fill="${gableColor}" stroke="#23170F" stroke-width="2.5" stroke-linejoin="round"/>
      ${storkSvg}
      ${opts.label ? svgRibbon(0, -hh - roofH - 24, opts.label, Math.max(96, opts.label.length * 14 + 28), 15) : ''}
    </g>
  `;
}

function svgVillager(
  x: number,
  y: number,
  coatColor = '#B44C32',
  pantsColor = '#3E5672',
  hatColor = '#3B281E',
  scale = 1
): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <ellipse cx="0" cy="14" rx="8" ry="3.5" fill="rgba(25,18,12,0.22)"/>
      <path d="M -4 5 L -5 14 M 4 5 L 5 14" stroke="${pantsColor}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M -8 6 L -5 -10 L 5 -10 L 8 6 Z" fill="${coatColor}" stroke="#23170F" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="0" cy="-15" r="5.2" fill="#F3C9A4" stroke="#23170F" stroke-width="1.8"/>
      <path d="M -6 -18 Q 0 -24 6 -18 Z" fill="${hatColor}" stroke="#23170F" stroke-width="1.6"/>
    </g>
  `;
}

function svgSheep(x: number, y: number, flip = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${flip}, 1)">
      <ellipse cx="0" cy="9" rx="13" ry="4" fill="rgba(28,20,12,0.18)"/>
      <path d="M -7 3 L -7 10 M -2 4 L -2 10 M 4 4 L 4 10 M 8 3 L 8 10" stroke="#23170F" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M -12 0 C -14 -7 -6 -12 0 -10 C 6 -12 14 -7 12 0 C 14 5 6 7 0 6 C -6 7 -14 5 -12 0 Z" fill="#F8F5EC" stroke="#23170F" stroke-width="2"/>
      <ellipse cx="12" cy="-3" rx="5.5" ry="4" fill="#E8E0CE" stroke="#23170F" stroke-width="1.8"/>
      <circle cx="13.5" cy="-4" r="1" fill="#23170F"/>
    </g>
  `;
}

function svgBoar(x: number, y: number, flip = 1, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${flip * scale}, ${scale})">
      <ellipse cx="0" cy="10" rx="18" ry="5" fill="rgba(25,18,12,0.22)"/>
      <path d="M -10 4 L -11 11 M -4 5 L -4 11 M 6 5 L 6 11 M 11 4 L 12 11" stroke="#2B1B12" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M -17 1 Q -12 -14 4 -11 Q 17 -8 21 1 Q 14 7 -15 6 Z" fill="#5A3E2B" stroke="#23170F" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M 19 -1 L 24 -4 L 22 1" fill="#F9F6EE" stroke="#23170F" stroke-width="1.2"/>
      <circle cx="14" cy="-4" r="1.4" fill="#23170F"/>
    </g>
  `;
}

function svgWillowTree(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})">
      <ellipse cx="0" cy="18" rx="22" ry="7" fill="rgba(28,20,12,0.2)"/>
      <path d="M -7 18 C -6 0 -9 -22 -4 -42 C 0 -46 6 -44 8 -40 C 10 -20 6 0 8 18 Z" fill="#6E472B" stroke="#23170F" stroke-width="2.6"/>
      <ellipse cx="1" cy="-42" rx="11" ry="6" fill="#54361F" stroke="#23170F" stroke-width="2"/>
      <path d="M -6 -42 Q -34 -32 -38 8 M -3 -44 Q -22 -28 -24 14 M 0 -45 Q -8 -24 -8 16 M 3 -45 Q 14 -26 14 15 M 6 -43 Q 26 -28 28 12 M 8 -41 Q 38 -26 40 6" fill="none" stroke="#88A844" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="-32" cy="-12" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
      <circle cx="-21" cy="-4" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
      <circle cx="-8" cy="-8" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
      <circle cx="12" cy="-6" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
      <circle cx="25" cy="-10" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
      <circle cx="34" cy="-4" r="2.6" fill="#F8F9FA" stroke="#23170F" stroke-width="1"/>
    </g>
  `;
}

function svgFenceSegment(x1: number, y1: number, x2: number, y2: number, posts = 7): string {
  let out = `<g stroke="#23170F" stroke-linecap="round">`;
  out += `<line x1="${x1}" y1="${y1 - 11}" x2="${x2}" y2="${y2 - 11}" stroke="#8C5A36" stroke-width="3.5"/>`;
  out += `<line x1="${x1}" y1="${y1 - 5}" x2="${x2}" y2="${y2 - 5}" stroke="#8C5A36" stroke-width="3.5"/>`;
  for (let i = 0; i <= posts; i++) {
    const t = i / posts;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    out += `<line x1="${px}" y1="${py + 2}" x2="${px}" y2="${py - 16}" stroke="#6E4427" stroke-width="4.2"/>`;
    out += `<line x1="${px}" y1="${py + 2}" x2="${px}" y2="${py - 16}" stroke="#23170F" stroke-width="1.4"/>`;
  }
  out += `</g>`;
  return out;
}

/**
 * Generates the complete Stage 1 ("BŘEZEN") SVG string, scaled +25% (4000x3500).
 * The river flows all the way from the northern arena border to the southern arena border,
 * and the decorative frame sits directly on MARCH_ARENA_BOUNDS.
 */
export function buildMarchThawLandscapeSvg(isNight = false): string {
  const groundFill = isNight ? '#4F5D4E' : '#B9C48A';
  const hillFill = isNight ? '#5B6958' : '#C9CE96';
  const warmMeadowFill = isNight ? '#636B54' : '#D5D198';
  const snowFill = isNight ? '#CBD5E1' : '#F6FAFC';
  const roadFill = isNight ? '#7C6D56' : '#D8C093';
  const waterFill = isNight ? '#3B6E8C' : '#7EC0D6';

  // Stream SVG path in 1.0x base space (which is inside <g transform="scale(1.25)">)
  // extending from y = -1400 (world -1750) to y = +1400 (world +1750)
  const streamPts = MARCH_STREAM_WAYPOINTS.map((p) => ({
    x: p.x / 1.25,
    y: p.y / 1.25,
  }));
  let streamPathD = `M ${streamPts[0].x} ${streamPts[0].y}`;
  for (let i = 1; i < streamPts.length; i++) {
    const prev = streamPts[i - 1];
    const cur = streamPts[i];
    const mx = (prev.x + cur.x) * 0.5;
    const my = (prev.y + cur.y) * 0.5;
    streamPathD += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
  }
  const lastStream = streamPts[streamPts.length - 1];
  streamPathD += ` L ${lastStream.x} ${lastStream.y}`;

  // Forest clusters in the 4 larger forests
  let forestSvg = '';
  const nwTrees = [
    [-1380, -1160, 1.15, true], [-1280, -1120, 1.25, true], [-1180, -1150, 1.1, true],
    [-1080, -1100, 1.2, true], [-980, -1140, 1.05, true], [-1350, -1010, 1.2, true],
    [-1230, -980, 1.3, true], [-1110, -1010, 1.15, true], [-990, -980, 1.1, false],
    [-1390, -860, 1.25, true], [-1270, -840, 1.15, false], [-1150, -870, 1.1, false],
    [-1380, -560, 1.2, true], [-1280, -520, 1.3, true], [-1180, -480, 1.15, true],
    [-1340, -390, 1.25, true], [-1220, -360, 1.1, false], [-1100, -390, 1.05, false],
  ] as const;
  for (const [tx, ty, ts, snow] of nwTrees) {
    forestSvg += svgSpruceTree(tx, ty, ts, snow);
  }

  const swTrees = [
    [-1390, 740, 1.2, false], [-1280, 780, 1.25, false], [-1170, 750, 1.1, false],
    [-1360, 890, 1.3, true], [-1240, 920, 1.2, true], [-1120, 880, 1.15, false],
    [-1320, 1040, 1.25, true], [-1190, 1060, 1.2, false], [-1060, 1020, 1.1, false],
  ] as const;
  for (const [tx, ty, ts, snow] of swTrees) {
    forestSvg += svgSpruceTree(tx, ty, ts, snow);
  }

  const neTrees = [
    [920, -1140, 1.15, true], [1040, -1120, 1.25, true], [1160, -1150, 1.2, true],
    [1280, -1100, 1.3, true], [980, -990, 1.2, true], [1100, -960, 1.3, true],
    [1220, -980, 1.15, true], [1340, -950, 1.25, true], [1060, -830, 1.1, false],
    [1180, -810, 1.2, true], [1310, -820, 1.15, false],
    [1080, -420, 1.15, false], [1190, -380, 1.25, true], [1310, -350, 1.2, true],
    [1140, -250, 1.1, false], [1260, -220, 1.2, false],
  ] as const;
  for (const [tx, ty, ts, snow] of neTrees) {
    forestSvg += svgSpruceTree(tx, ty, ts, snow);
  }

  // Plowed field furrows
  let furrowsSvg = '';
  for (let i = -6; i <= 6; i++) {
    const fy = -820 + i * 18;
    furrowsSvg += `<path d="M -140 ${fy - 16} Q 180 ${fy - 34} 510 ${fy + 10}" fill="none" stroke="#5A3D24" stroke-width="3.2" stroke-linecap="round"/>`;
  }
  for (let i = -4; i <= 4; i++) {
    const fy = -550 + i * 17;
    furrowsSvg += `<path d="M -90 ${fy - 8} Q 170 ${fy + 16} 430 ${fy - 10}" fill="none" stroke="#63442B" stroke-width="2.8" stroke-linecap="round"/>`;
  }

  const borderW = MARCH_ARENA_BOUNDS.maxX - MARCH_ARENA_BOUNDS.minX;
  const borderH = MARCH_ARENA_BOUNDS.maxY - MARCH_ARENA_BOUNDS.minY;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARCH_WORLD_BOUNDS.minX} ${MARCH_WORLD_BOUNDS.minY} ${MARCH_WORLD_BOUNDS.width} ${MARCH_WORLD_BOUNDS.height}" width="${MARCH_WORLD_BOUNDS.width}" height="${MARCH_WORLD_BOUNDS.height}">
    <!-- Outer frame margin beyond the playable arena border -->
    <rect x="${MARCH_WORLD_BOUNDS.minX}" y="${MARCH_WORLD_BOUNDS.minY}" width="${MARCH_WORLD_BOUNDS.width}" height="${MARCH_WORLD_BOUNDS.height}" fill="#2B1E14"/>

    <!-- +25% Scaled Landscape Content -->
    <g transform="scale(1.25)">
      <!-- 1. Base early-spring meadow & hill contours -->
      <rect x="-1540" y="-1340" width="3080" height="2680" fill="${groundFill}"/>
      <ellipse cx="0" cy="-120" rx="1460" ry="1180" fill="${hillFill}"/>
      <ellipse cx="120" cy="140" rx="1180" ry="860" fill="${warmMeadowFill}"/>

      <!-- 2. Thawing March snowbanks (sněhové jazyky) across northern hills & shaded slopes -->
      <path d="M -1450 -980 Q -920 -1160 -380 -1040 Q 180 -1180 860 -1020 Q 1240 -960 1440 -1080 L 1480 -1340 L -1480 -1340 Z" fill="${snowFill}" stroke="#23170F" stroke-width="2.5"/>
      <path d="M -1380 -620 Q -1080 -690 -820 -580 Q -620 -490 -440 -590 Q -680 -380 -1050 -340 Q -1290 -360 -1380 -620 Z" fill="${snowFill}" stroke="#23170F" stroke-width="2.2"/>
      <path d="M -880 -490 Q -650 -560 -450 -480 Q -510 -390 -720 -395 Q -850 -410 -880 -490 Z" fill="${snowFill}" opacity="0.85"/>
      <path d="M 640 -620 Q 890 -680 1180 -560 Q 1080 -430 820 -450 Q 670 -480 640 -620 Z" fill="${snowFill}" stroke="#23170F" stroke-width="2"/>
      <path d="M -420 -950 Q -180 -1020 90 -960 Q -40 -890 -310 -895 Z" fill="${snowFill}" opacity="0.9"/>

      <!-- 3. HORNÍ A DOLNÍ POLE (Plowed spring fields with furrows, haystack, sowers, and upper horse plough) -->
      <g id="march-fields">
        <path d="M -190 -920 Q 180 -985 560 -900 L 540 -680 Q 180 -640 -170 -710 Z" fill="#A98758" stroke="#23170F" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M -130 -635 Q 175 -665 470 -615 L 445 -455 Q 170 -425 -115 -475 Z" fill="#B59463" stroke="#23170F" stroke-width="3.2" stroke-linejoin="round"/>
        ${furrowsSvg}
        <!-- Golden Haystack (stoh slámy) -->
        <g transform="translate(-230, -860)">
          <ellipse cx="0" cy="24" rx="46" ry="14" fill="rgba(28,20,12,0.22)"/>
          <path d="M -42 22 C -44 -28 -18 -56 0 -58 C 18 -56 44 -28 42 22 Z" fill="#E4B854" stroke="#23170F" stroke-width="3"/>
          <path d="M -28 10 L -18 -30 M -6 14 L -2 -38 M 16 12 L 12 -32" stroke="#B5862C" stroke-width="2"/>
        </g>
        <!-- Upper static 2-horse plough team & ploughman -->
        <g transform="translate(80, -865)">
          <ellipse cx="-48" cy="4" rx="22" ry="11" fill="#7C4427" stroke="#23170F" stroke-width="2.2"/>
          <circle cx="-66" cy="-5" r="7" fill="#7C4427" stroke="#23170F" stroke-width="2"/>
          <ellipse cx="-18" cy="8" rx="22" ry="11" fill="#F3EFE4" stroke="#23170F" stroke-width="2.2"/>
          <circle cx="-36" cy="-1" r="7" fill="#F3EFE4" stroke="#23170F" stroke-width="2"/>
          <path d="M 4 8 L 46 16 L 64 4 M 34 14 L 54 22" fill="none" stroke="#23170F" stroke-width="2.8" stroke-linecap="round"/>
        </g>
        ${svgVillager(145, -860, '#4E6B48', '#3B4D5E', '#2D221B', 1.05)}
        ${svgVillager(-95, -545, '#C46D3B', '#4A5D73', '#3B281E', 1.05)}
        ${svgVillager(355, -515, '#527048', '#4A5D73', '#3B281E', 1.05)}
        ${svgRibbon(180, -975, 'POLE', 116, 18)}
      </g>

      <!-- 4. ŘEKA / POTOK A NÁHON (Flows all the way from northern arena border to southern arena border) -->
      <g id="march-stream">
        <path d="${streamPathD}" fill="none" stroke="#23170F" stroke-width="88" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${streamPathD}" fill="none" stroke="#8C7A5B" stroke-width="80" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${streamPathD}" fill="none" stroke="${waterFill}" stroke-width="68" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${streamPathD}" fill="none" stroke="#B6E3F0" stroke-width="24" stroke-dasharray="28 36" stroke-linecap="round"/>
      </g>

      <!-- 5. COUNTRY ROADS, CROSSROADS, WOODEN BRIDGE & FENCES -->
      <g id="march-roads">
        <path d="M -1520 60 Q -920 20 -540 -30 Q -240 -60 60 -90 Q 420 -60 744 96 Q 1060 150 1520 120" fill="none" stroke="#23170F" stroke-width="62" stroke-linecap="round"/>
        <path d="M -540 -30 Q -620 -260 -640 -430" fill="none" stroke="#23170F" stroke-width="46" stroke-linecap="round"/>
        <path d="M -540 -30 Q -360 210 -220 340 Q 40 390 360 540" fill="none" stroke="#23170F" stroke-width="50" stroke-linecap="round"/>
        <path d="M 60 -90 Q 80 140 95 365" fill="none" stroke="#23170F" stroke-width="48" stroke-linecap="round"/>

        <path d="M -1520 60 Q -920 20 -540 -30 Q -240 -60 60 -90 Q 420 -60 744 96 Q 1060 150 1520 120" fill="none" stroke="${roadFill}" stroke-width="54" stroke-linecap="round"/>
        <path d="M -540 -30 Q -620 -260 -640 -430" fill="none" stroke="${roadFill}" stroke-width="38" stroke-linecap="round"/>
        <path d="M -540 -30 Q -360 210 -220 340 Q 40 390 360 540" fill="none" stroke="${roadFill}" stroke-width="42" stroke-linecap="round"/>
        <path d="M 60 -90 Q 80 140 95 365" fill="none" stroke="${roadFill}" stroke-width="40" stroke-linecap="round"/>

        <!-- Wooden Bridge over the stream at base (744, 96) -> world (930, 120) -->
        <g transform="translate(744, 96) rotate(8)">
          <rect x="-58" y="-38" width="116" height="76" rx="4" fill="#9C6B3E" stroke="#23170F" stroke-width="3.2"/>
          <line x1="-42" y1="-36" x2="-42" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <line x1="-24" y1="-36" x2="-24" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <line x1="-6" y1="-36" x2="-6" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <line x1="12" y1="-36" x2="12" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <line x1="30" y1="-36" x2="30" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <line x1="46" y1="-36" x2="46" y2="36" stroke="#5A391E" stroke-width="2.2"/>
          <rect x="-60" y="-42" width="120" height="7" rx="2" fill="#6E4423" stroke="#23170F" stroke-width="2.2"/>
          <rect x="-60" y="35" width="120" height="7" rx="2" fill="#6E4423" stroke="#23170F" stroke-width="2.2"/>
        </g>

        ${svgFenceSegment(-340, 260, -80, 355, 8)}
        ${svgFenceSegment(15, 380, 290, 495, 8)}
        ${svgFenceSegment(830, 55, 1120, 85, 8)}
        ${svgFenceSegment(580, -340, 860, -290, 7)}
      </g>

      <!-- 6. RYBNÍK (Lower-left pond with weeping willows, reeds, marsh marigolds & villagers) -->
      <g id="march-pond" transform="translate(-580, 492)">
        <g transform="rotate(${(MARCH_POND_REGION.angle * 180) / Math.PI})">
          <ellipse cx="0" cy="0" rx="238" ry="144" fill="#A9996E" stroke="#23170F" stroke-width="3.5"/>
          <ellipse cx="0" cy="0" rx="224" ry="132" fill="${waterFill}" stroke="#23170F" stroke-width="3"/>
          <ellipse cx="-18" cy="-8" rx="192" ry="106" fill="none" stroke="#A6DCEB" stroke-width="2.2" stroke-dasharray="24 18"/>
        </g>
        ${svgWillowTree(-185, -78, 1.15)}
        ${svgWillowTree(-110, -112, 1.05)}
        ${svgWillowTree(155, -88, 1.1)}
        <g fill="#FACC15" stroke="#23170F" stroke-width="1.4">
          <circle cx="145" cy="92" r="5"/><circle cx="162" cy="86" r="4.5"/><circle cx="176" cy="96" r="5"/>
          <circle cx="-155" cy="98" r="5"/><circle cx="-138" cy="106" r="4.5"/>
        </g>
        <g transform="translate(-235, 35)">
          <path d="M -16 12 L -12 -8 L 12 -8 L 16 12 Z" fill="#7C5132" stroke="#23170F" stroke-width="2.2"/>
          <ellipse cx="0" cy="-8" rx="12" ry="5" fill="#D9B382" stroke="#23170F" stroke-width="2"/>
        </g>
        ${svgVillager(-165, 118, '#B84A32', '#3E5672', '#2D221B', 0.95)}
        ${svgVillager(-125, 126, '#4E7048', '#3E5672', '#8C3B2B', 0.85)}
        ${svgRibbon(0, -155, 'RYBNÍK', 132, 18)}
      </g>

      <!-- Villagers with pitchforks/rakes near the lower-left woods -->
      <g transform="translate(-940, 650)">
        ${svgVillager(-36, 0, '#8C4A32', '#3B4D5E', '#2D221B', 1.05)}
        ${svgVillager(0, 8, '#4E6B48', '#3B4D5E', '#2D221B', 1.05)}
        ${svgVillager(36, -2, '#B86B35', '#3B4D5E', '#2D221B', 1.0)}
        <line x1="-24" y1="12" x2="-14" y2="-36" stroke="#23170F" stroke-width="2.4"/>
        <line x1="12" y1="16" x2="22" y2="-32" stroke="#23170F" stroke-width="2.4"/>
      </g>

      <!-- 7. KOSTEL NA VRCHU (Walled hilltop church, cemetery crosses, and tree-planting villagers) -->
      <g id="march-church" transform="translate(-640, -520)">
        <ellipse cx="0" cy="8" rx="168" ry="102" fill="#C2C78E" stroke="#23170F" stroke-width="2.5"/>
        <path d="M -38 74 L -128 52 L -142 -36 L -78 -86 L 82 -86 L 142 -36 L 128 52 L 38 74" fill="#DFD5BC" stroke="#23170F" stroke-width="4" stroke-linejoin="round"/>
        <path d="M -38 66 L -118 46 L -130 -32 L -72 -76 L 76 -76 L 130 -32 L 118 46 L 38 66" fill="#B5BE89" stroke="#6E6252" stroke-width="2" stroke-linejoin="round"/>
        <rect x="-44" y="58" width="12" height="22" fill="#E8DEC6" stroke="#23170F" stroke-width="2.5"/>
        <rect x="32" y="58" width="12" height="22" fill="#E8DEC6" stroke="#23170F" stroke-width="2.5"/>
        <g stroke="#23170F" stroke-width="2.2" fill="#8C887B">
          <rect x="-88" y="4" width="14" height="22" rx="6"/>
          <rect x="-56" y="12" width="14" height="22" rx="6"/>
          <rect x="52" y="10" width="14" height="22" rx="6"/>
          <rect x="82" y="2" width="14" height="22" rx="6"/>
          <path d="M -81 -12 L -81 4 M -87 -6 L -75 -6 M 59 -6 L 59 10 M 53 0 L 65 0"/>
        </g>
        <rect x="-56" y="-78" width="96" height="68" fill="#F6EBD2" stroke="#23170F" stroke-width="3.2"/>
        <path d="M -66 -78 L -8 -122 L 50 -78 Z" fill="#C84B31" stroke="#23170F" stroke-width="3.2" stroke-linejoin="round"/>
        <rect x="-38" y="-56" width="14" height="26" rx="7" fill="${isNight ? '#FDE047' : '#52718C'}" stroke="#23170F" stroke-width="2.2"/>
        <rect x="-8" y="-56" width="14" height="26" rx="7" fill="${isNight ? '#FDE047' : '#52718C'}" stroke="#23170F" stroke-width="2.2"/>
        <rect x="32" y="-142" width="42" height="132" fill="#F9F1DC" stroke="#23170F" stroke-width="3.2"/>
        <circle cx="53" cy="-112" r="9" fill="#2B2623" stroke="#23170F" stroke-width="2"/>
        <path d="M 24 -142 L 53 -196 L 82 -142 Z" fill="#4A2E23" stroke="#23170F" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M 53 -196 L 53 -218 M 44 -208 L 62 -208" stroke="#D99B26" stroke-width="3.2" stroke-linecap="round"/>
        <g transform="translate(-85, 118)">
          <ellipse cx="0" cy="12" rx="18" ry="7" fill="#6E4B2E" stroke="#23170F" stroke-width="2"/>
          <line x1="0" y1="10" x2="0" y2="-32" stroke="#5C3A21" stroke-width="3"/>
          <path d="M 0 -18 L -12 -30 M 0 -24 L 12 -36 M 0 -32 L -6 -44" stroke="#5E8C3E" stroke-width="2.5" stroke-linecap="round"/>
          ${svgVillager(-28, 4, '#527048', '#3B4D5E', '#2D221B', 0.95)}
          ${svgVillager(28, 6, '#B84A32', '#3B4D5E', '#2D221B', 0.95)}
        </g>
        ${svgRibbon(0, -234, 'KOSTEL', 124, 18)}
      </g>

      <!-- 8. KAPLIČKA (Wayside village chapel at the crossroads; Panna Maria manifests dynamically only for a moment) -->
      <g id="march-shrine" transform="translate(-540, -30)">
        <!-- Ground shadow & stepped stone plinth -->
        <ellipse cx="0" cy="18" rx="38" ry="12" fill="rgba(28,20,12,0.24)"/>
        <rect x="-28" y="2" width="56" height="14" rx="3" fill="#C8BFA8" stroke="#23170F" stroke-width="2.8"/>
        <!-- Whitewashed Kaplička walls with ochre pilasters -->
        <path d="M -24 2 L -24 -58 Q 0 -76 24 -58 L 24 2 Z" fill="#FAF3E3" stroke="#23170F" stroke-width="3"/>
        <rect x="-24" y="-54" width="6" height="56" fill="#E6B86A" stroke="#23170F" stroke-width="1.8"/>
        <rect x="18" y="-54" width="6" height="56" fill="#E6B86A" stroke="#23170F" stroke-width="1.8"/>
        <!-- Arched Marian Niche with tiny altar candle & miniature gold frame -->
        <path d="M -13 2 L -13 -36 A 13 13 0 0 1 13 -36 L 13 2 Z" fill="#1E3A5F" stroke="#23170F" stroke-width="2.4"/>
        <path d="M -9 -2 L -9 -32 A 9 9 0 0 1 9 -32 L 9 -2 Z" fill="none" stroke="#FACC15" stroke-width="1.4"/>
        <rect x="-2.5" y="-12" width="5" height="10" rx="1" fill="#FFFBEB" stroke="#23170F" stroke-width="1.2"/>
        <circle cx="0" cy="-16" r="3" fill="#FDE047"/>
        <!-- Shingled Gable Roof & Bell Turret with Golden Cross -->
        <path d="M -32 -54 L 0 -86 L 32 -54 Z" fill="#C84B31" stroke="#23170F" stroke-width="3" stroke-linejoin="round"/>
        <rect x="-7" y="-102" width="14" height="18" rx="2" fill="#FAF3E3" stroke="#23170F" stroke-width="2.4"/>
        <path d="M -10 -102 L 0 -114 L 10 -102 Z" fill="#9E3D26" stroke="#23170F" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M 0 -114 L 0 -128 M -6 -122 L 6 -122" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
        <!-- Villager carrying Morana past the crossroads -->
        <g transform="translate(68, 36)">
          ${svgVillager(0, 0, '#784830', '#3B4D5E', '#2D221B', 1)}
          <line x1="10" y1="8" x2="18" y2="-38" stroke="#5C3A21" stroke-width="2.6"/>
          <circle cx="19" cy="-42" r="6" fill="#F3E5AB" stroke="#23170F" stroke-width="1.8"/>
          <path d="M 11 -34 L 27 -34 L 23 -18 L 15 -18 Z" fill="#D9534F" stroke="#23170F" stroke-width="1.8"/>
        </g>
        ${svgRibbon(0, -152, 'KAPLIČKA', 142, 16)}
      </g>

      <!-- 9. VESNICE, HOSPODA & ŠKOLA -->
      <g id="march-village">
        <!-- Stork nest on tall pole with two villagers & ladder -->
        <g transform="translate(-35, -210)">
          <ellipse cx="0" cy="18" rx="20" ry="7" fill="rgba(28,20,12,0.2)"/>
          <line x1="0" y1="18" x2="0" y2="-92" stroke="#6E4427" stroke-width="7" stroke-linecap="round"/>
          <line x1="0" y1="18" x2="0" y2="-92" stroke="#23170F" stroke-width="2"/>
          <ellipse cx="0" cy="-94" rx="24" ry="9" fill="#7C5836" stroke="#23170F" stroke-width="2.6"/>
          <line x1="-26" y1="20" x2="-6" y2="-82" stroke="#8C5A36" stroke-width="3"/>
          <line x1="-16" y1="22" x2="4" y2="-80" stroke="#8C5A36" stroke-width="3"/>
          <path d="M -24 6 L -14 8 M -21 -12 L -11 -10 M -17 -30 L -7 -28 M -14 -48 L -4 -46 M -10 -66 L 0 -64" stroke="#5C3A21" stroke-width="2.4"/>
          ${svgVillager(-11, -36, '#B84A32', '#3E5672', '#2D221B', 0.9)}
          ${svgVillager(-28, 22, '#4E6B48', '#3E5672', '#2D221B', 0.95)}
        </g>

        ${svgCottage(-135, -235, { w: 96, h: 52, timbered: true, roofColor: '#9E3D26', isNight })}
        ${svgCottage(75, -255, { w: 104, h: 56, timbered: false, roofColor: '#C84B31', storkOnChimney: true, isNight })}
        ${svgCottage(255, -230, { w: 98, h: 54, timbered: true, roofColor: '#7C4728', isNight })}
        ${svgCottage(-165, -75, { w: 92, h: 52, timbered: true, roofColor: '#8C3B2B', isNight })}
        ${svgCottage(-75, 75, { w: 96, h: 52, timbered: false, roofColor: '#B84A32', isNight })}
        ${svgCottage(215, 65, { w: 100, h: 54, timbered: true, roofColor: '#9E472A', isNight })}

        <!-- Main HOSPODA building -->
        ${svgCottage(285, -95, {
          w: 126,
          h: 64,
          roofH: 52,
          timbered: false,
          wallColor: '#F8EED8',
          roofColor: '#C84B31',
          gableColor: '#E2B464',
          label: 'HOSPODA',
          isNight,
        })}
        <g transform="translate(175, -65)">
          <rect x="-26" y="-8" width="52" height="16" rx="2" fill="#9C6B3E" stroke="#23170F" stroke-width="2.4"/>
          <ellipse cx="38" cy="2" rx="12" ry="15" fill="#7C4D2B" stroke="#23170F" stroke-width="2.4"/>
          ${svgVillager(-16, -16, '#B84A32', '#3B4D5E', '#2D221B', 0.9)}
          ${svgVillager(14, -16, '#4A6B82', '#3B4D5E', '#2D221B', 0.9)}
        </g>

        <!-- Village green (náves) circle of celebrating villagers & children -->
        <g transform="translate(55, -95)">
          ${svgVillager(-34, -12, '#C84B31', '#3E5672', '#2D221B', 0.9)}
          ${svgVillager(-12, -26, '#4E7048', '#3E5672', '#8C3B2B', 0.88)}
          ${svgVillager(16, -24, '#D98B26', '#3E5672', '#2D221B', 0.9)}
          ${svgVillager(36, -6, '#4A6B82', '#3E5672', '#2D221B', 0.88)}
          ${svgVillager(14, 18, '#B84A32', '#3E5672', '#2D221B', 0.85)}
          ${svgVillager(-18, 16, '#6E4B78', '#3E5672', '#2D221B', 0.85)}
        </g>
        ${svgRibbon(45, -155, 'VESNICE', 132, 18)}

        <!-- ŠKOLA (Schoolhouse south of the village green) -->
        ${svgCottage(110, 310, {
          w: 122,
          h: 62,
          roofH: 48,
          timbered: false,
          wallColor: '#F7EFE0',
          roofColor: '#B8432E',
          gableColor: '#DFB66C',
          label: 'ŠKOLA',
          isNight,
        })}
        ${svgVillager(28, 345, '#4A6B82', '#3B4D5E', '#8C3B2B', 0.82)}
        ${svgVillager(48, 352, '#C84B31', '#3B4D5E', '#2D221B', 0.8)}
      </g>

      <!-- 10. MLÝN A PASTVINA (Watermill by the river + shepherd, dog & flock of sheep) -->
      <g id="march-mill">
        ${svgCottage(425, 565, {
          w: 112,
          h: 62,
          roofH: 48,
          timbered: true,
          wallColor: '#8C5230',
          roofColor: '#7C3F23',
          gableColor: '#D9A55B',
          label: 'MLÝN',
          isNight,
        })}
        <g transform="translate(760, 650)">
          ${svgSheep(-75, -15, 1)}
          ${svgSheep(-35, 10, 1)}
          ${svgSheep(5, -20, -1)}
          ${svgSheep(35, 14, 1)}
          ${svgSheep(-55, 38, -1)}
          ${svgSheep(-5, 42, 1)}
          ${svgVillager(82, 12, '#6E4B2E', '#3B4D5E', '#23170F', 1.15)}
          <line x1="96" y1="26" x2="102" y2="-28" stroke="#4A2E1B" stroke-width="2.8" stroke-linecap="round"/>
          <g transform="translate(48, 52)">
            <ellipse cx="0" cy="0" rx="11" ry="6" fill="#23170F"/>
            <circle cx="-10" cy="-5" r="4.5" fill="#23170F"/>
          </g>
        </g>
      </g>

      <!-- 11. HUSTÝ LES & WILDLIFE (4 larger forest zones, LES ribbons, wild boars in snow, roe deer & storks) -->
      <g id="march-forests">
        ${forestSvg}
        ${svgBoar(-1020, -450, 1, 1.15)}
        ${svgBoar(-935, -420, 1, 0.95)}
        ${svgBoar(885, -475, -1, 1.05)}
        <g transform="translate(835, -535)">
          <ellipse cx="0" cy="10" rx="14" ry="4" fill="rgba(25,18,12,0.18)"/>
          <path d="M -8 2 L -9 11 M -3 3 L -3 11 M 5 3 L 5 11 M 9 2 L 10 11" stroke="#6E4427" stroke-width="2.2"/>
          <ellipse cx="0" cy="-1" rx="14" ry="7" fill="#B87A44" stroke="#23170F" stroke-width="2"/>
          <path d="M 10 -4 L 15 -16" stroke="#B87A44" stroke-width="4" stroke-linecap="round"/>
          <circle cx="16" cy="-17" r="4.5" fill="#B87A44" stroke="#23170F" stroke-width="1.8"/>
        </g>
        ${svgRibbon(-1180, -760, 'LES', 96, 18)}
        ${svgRibbon(1150, -740, 'LES', 96, 18)}
        ${svgRibbon(-1210, 680, 'LES', 96, 18)}
        ${svgRibbon(1180, -280, 'LES', 96, 18)}
      </g>
    </g>

    <!-- 12. ORNAMENTAL FOLK-ART BORDER AT MARCH_ARENA_BOUNDS & TOP "BŘEZEN" BANNER -->
    <g id="march-border">
      <rect x="${MARCH_ARENA_BOUNDS.minX}" y="${MARCH_ARENA_BOUNDS.minY}" width="${borderW}" height="${borderH}" rx="28" fill="none" stroke="#23170F" stroke-width="14"/>
      <rect x="${MARCH_ARENA_BOUNDS.minX + 18}" y="${MARCH_ARENA_BOUNDS.minY + 18}" width="${borderW - 36}" height="${borderH - 36}" rx="20" fill="none" stroke="#C84B31" stroke-width="5" stroke-dasharray="28 16"/>
      ${svgRibbon(0, -1550, 'BŘEZEN', 310, 44)}
    </g>
  </svg>`;
}

interface CachedMarchSvgSheet {
  canvas: any;
  ctx: any;
  isNight: boolean;
  svgLoaded: boolean;
}

interface CachedMarianSvgSheet {
  canvas: any;
  ctx: any;
  svgLoaded: boolean;
}

let cachedDaySheet: CachedMarchSvgSheet | null = null;
let cachedNightSheet: CachedMarchSvgSheet | null = null;
let cachedMarianSheet: CachedMarianSvgSheet | null = null;
let sheetRevision = 0;

export function getMarchSvgSheetRevision(): number {
  return sheetRevision;
}

/**
 * Synchronous Canvas2D fallback painter for the Marian Apparition sheet
 * before the async SVG Image decode completes.
 */
function paintSynchronousMarianFallback(ctx: CanvasRenderingContext2D): void {
  if (!ctx || typeof ctx.save !== 'function') return;
  ctx.save();
  ctx.translate(220, 275);

  // Golden mandorla glow
  if (typeof ctx.ellipse === 'function') {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 145, 195, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Royal blue mantle & cream gown
  ctx.fillStyle = '#0284C7';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (typeof ctx.moveTo === 'function') {
    ctx.moveTo(-36, -68);
    ctx.lineTo(-96, 178);
    ctx.lineTo(74, 172);
    ctx.lineTo(36, -64);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function getOrBuildMarianApparitionSheet(): CachedMarianSvgSheet {
  if (cachedMarianSheet) return cachedMarianSheet;

  const width = 440;
  const height = 550;
  let canvas: any;
  let ctx: any;

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
  } else {
    ctx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      clearRect: () => {},
      drawImage: () => {},
    };
    canvas = { width, height, getContext: () => ctx };
  }

  const sheet: CachedMarianSvgSheet = {
    canvas,
    ctx,
    svgLoaded: false,
  };
  cachedMarianSheet = sheet;

  paintSynchronousMarianFallback(ctx);

  if (typeof Image !== 'undefined') {
    try {
      const svgMarkup = buildMarianApparitionSvg();
      const img = new Image();
      img.onload = () => {
        if (sheet.ctx) {
          sheet.ctx.clearRect(0, 0, width, height);
          sheet.ctx.drawImage(img, 0, 0, width, height);
          sheet.svgLoaded = true;
          sheetRevision++;
        }
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    } catch {
      // Ignore in headless environments
    }
  }

  return sheet;
}

export const MARCH_MARIAN_APPARITION_DURATION = 4.2;

export interface MarianApparitionVisualState {
  visible: boolean;
  progress: number;
  scale: number;
  alpha: number;
  offsetY: number;
  auraRadius: number;
}

/**
 * Computes the temporary lifecycle of Panna Maria s Ježíškem above the Kaplička:
 * - Normally invisible (`visible: false`) when not manifesting.
 * - When triggered (`apparitionTimer > 0`), she first appears small (`scale ~ 0.15`)
 *   just above the Kaplička niche, gradually grows larger (`scale -> 0.92`) while
 *   rising above the roof, and then fades out and vanishes (`alpha -> 0`).
 */
export function getMarianApparitionVisualState(
  apparitionTimer: number,
  shrineCharge = 0,
  maxDuration = MARCH_MARIAN_APPARITION_DURATION
): MarianApparitionVisualState {
  if (apparitionTimer > 0) {
    const safeMax = Math.max(0.5, maxDuration);
    const elapsed = Math.max(0, Math.min(safeMax, safeMax - apparitionTimer));
    const progress = elapsed / safeMax; // 0.0 at start -> 1.0 at end
    const growEnd = 0.78;

    if (progress <= growEnd) {
      const growT = progress / growEnd; // 0 -> 1
      const easedGrow = 1 - Math.pow(1 - growT, 1.85);
      const scale = 0.15 + 0.77 * easedGrow;
      const alpha = progress < 0.12 ? 0.35 + (progress / 0.12) * 0.65 : 1.0;
      const offsetY = -58 - 104 * easedGrow;
      const auraRadius = 150 + 410 * easedGrow;
      return { visible: true, progress, scale, alpha, offsetY, auraRadius };
    }

    const vanishT = Math.min(1, (progress - growEnd) / (1 - growEnd)); // 0 -> 1
    const scale = 0.92 + 0.04 * vanishT;
    const alpha = Math.max(0, 1 - vanishT * vanishT);
    const offsetY = -162 - 14 * vanishT;
    const auraRadius = 560 * (1 - vanishT * 0.35);
    return {
      visible: alpha > 0.01,
      progress,
      scale,
      alpha,
      offsetY,
      auraRadius,
    };
  }

  if (shrineCharge > 0.15) {
    const chargeRatio = Math.min(1, shrineCharge / 1.6);
    const scale = 0.08 + chargeRatio * 0.07; // 0.08 -> 0.15 budding inside the niche
    const alpha = 0.22 + chargeRatio * 0.38;
    const offsetY = -42 - chargeRatio * 16;
    const auraRadius = 70 + chargeRatio * 80;
    return {
      visible: true,
      progress: chargeRatio * 0.08,
      scale,
      alpha,
      offsetY,
      auraRadius,
    };
  }

  return {
    visible: false,
    progress: 0,
    scale: 0,
    alpha: 0,
    offsetY: -42,
    auraRadius: 0,
  };
}

/**
 * Draws the SVG apparition of Panna Maria s Ježíškem with animated golden rays,
 * twinkling 8-pointed stars, and sacred bubák-scattering waves.
 */
export function drawMarianApparition(
  ctx: CanvasRenderingContext2D,
  time: number,
  stateOrIntensity: MarianApparitionVisualState | number = 1,
  isNight = false
): void {
  if (!ctx || typeof ctx.save !== 'function') return;

  const visual: MarianApparitionVisualState =
    typeof stateOrIntensity === 'number'
      ? {
          visible: stateOrIntensity > 0.02,
          progress: 0.5,
          scale: Math.max(0.12, Math.min(1.0, stateOrIntensity)),
          alpha: Math.max(0, Math.min(1, stateOrIntensity)),
          offsetY: -58 - Math.min(1, stateOrIntensity) * 95,
          auraRadius: 150 + Math.min(1, stateOrIntensity) * 350,
        }
      : stateOrIntensity;

  if (!visual.visible || visual.alpha <= 0.01 || visual.scale <= 0.02) return;

  const sheet = getOrBuildMarianApparitionSheet();
  const hoverY = Math.sin(time * 2.2) * (4 * visual.scale);
  const scale = visual.scale * (1 + Math.sin(time * 3.4) * 0.02);

  ctx.save();
  ctx.translate(0, visual.offsetY + hoverY);
  ctx.globalAlpha = visual.alpha;

  // 1. Sacred radiant aura that grows with the apparition
  if (typeof ctx.createRadialGradient === 'function') {
    const glowR = (isNight ? 210 : 180) * scale;
    const grad = ctx.createRadialGradient(0, 0, 10 * scale, 0, 0, glowR);
    grad.addColorStop(0, `rgba(255, 251, 235, ${Math.min(0.92, 0.72 * visual.alpha)})`);
    grad.addColorStop(0.55, `rgba(250, 204, 21, ${Math.min(0.65, 0.42 * visual.alpha)})`);
    grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Rotating golden sunburst beams & SVG figure of Panna Maria s Ježíškem
  ctx.save();
  ctx.rotate(Math.sin(time * 0.7) * 0.06);
  ctx.scale(scale, scale);
  if (sheet && sheet.canvas && typeof ctx.drawImage === 'function') {
    ctx.drawImage(sheet.canvas, -220, -275, 440, 550);
  }
  ctx.restore();

  // 3. Twinkling 8-pointed golden stars orbiting the growing apparition
  const starCount = scale > 0.45 ? 8 : 4;
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < starCount; i++) {
    const ang = (i / starCount) * Math.PI * 2 + time * 0.45;
    const rx = 88 * scale * 1.32;
    const ry = 116 * scale * 1.32;
    const sx = Math.cos(ang) * rx;
    const sy = Math.sin(ang) * ry;
    const pulse = 0.65 + 0.35 * Math.sin(time * 5 + i * 1.7);
    const sr = (6 + (i % 2) * 3) * pulse * Math.max(0.45, scale);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.beginPath();
    for (let p = 0; p < 8; p++) {
      const pa = (p * Math.PI) / 4;
      const pr = p % 2 === 0 ? sr : sr * 0.32;
      if (p === 0) ctx.moveTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
      else ctx.lineTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Synchronous Canvas2D fallback painter that draws the core Stage 1 landscape shapes
 * onto the offscreen sheet immediately before the async `Image` SVG decode finishes.
 */
function paintSynchronousFallbackSheet(ctx: CanvasRenderingContext2D, isNight: boolean): void {
  if (!ctx || typeof ctx.save !== 'function') return;
  ctx.save();
  ctx.translate(-MARCH_WORLD_BOUNDS.minX, -MARCH_WORLD_BOUNDS.minY);

  ctx.fillStyle = isNight ? '#4F5D4E' : '#B9C48A';
  ctx.fillRect(
    MARCH_ARENA_BOUNDS.minX,
    MARCH_ARENA_BOUNDS.minY,
    MARCH_ARENA_BOUNDS.maxX - MARCH_ARENA_BOUNDS.minX,
    MARCH_ARENA_BOUNDS.maxY - MARCH_ARENA_BOUNDS.minY
  );

  // River from top arena edge to bottom arena edge
  ctx.strokeStyle = isNight ? '#3B6E8C' : '#7EC0D6';
  ctx.lineWidth = 84;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < MARCH_STREAM_WAYPOINTS.length; i++) {
    const pt = MARCH_STREAM_WAYPOINTS[i];
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Pond
  ctx.fillStyle = isNight ? '#3B6E8C' : '#7EC0D6';
  ctx.strokeStyle = '#23170F';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (typeof ctx.ellipse === 'function') {
    ctx.ellipse(
      MARCH_POND_REGION.x,
      MARCH_POND_REGION.y,
      MARCH_POND_REGION.rx,
      MARCH_POND_REGION.ry,
      MARCH_POND_REGION.angle,
      0,
      Math.PI * 2
    );
  }
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < MARCH_THAW_OBSTACLES.length; i++) {
    const obs = MARCH_THAW_OBSTACLES[i];
    if (obs.shape === 'box') {
      const hw = obs.halfW ?? 45;
      const hh = obs.halfH ?? 30;
      ctx.fillStyle = obs.kind === 'chalupa' ? '#F5EAD0' : '#E8DEC6';
      ctx.strokeStyle = '#23170F';
      ctx.lineWidth = 3;
      ctx.fillRect(obs.x - hw, obs.y - hh, hw * 2, hh * 2);
      if (typeof ctx.strokeRect === 'function') {
        ctx.strokeRect(obs.x - hw, obs.y - hh, hw * 2, hh * 2);
      }
    }
  }

  ctx.restore();
}

export function getOrBuildMarchSvgSheet(isNight: boolean): CachedMarchSvgSheet {
  const existing = isNight ? cachedNightSheet : cachedDaySheet;
  if (existing) return existing;

  // Also kick off building the Marian Apparition SVG sheet
  getOrBuildMarianApparitionSheet();

  let canvas: any;
  let ctx: any;

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    canvas = document.createElement('canvas');
    canvas.width = MARCH_WORLD_BOUNDS.width;
    canvas.height = MARCH_WORLD_BOUNDS.height;
    ctx = canvas.getContext('2d');
  } else {
    ctx = {
      save: () => {},
      restore: () => {},
      translate: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
    };
    canvas = {
      width: MARCH_WORLD_BOUNDS.width,
      height: MARCH_WORLD_BOUNDS.height,
      getContext: () => ctx,
    };
  }

  const sheet: CachedMarchSvgSheet = {
    canvas,
    ctx,
    isNight,
    svgLoaded: false,
  };

  if (isNight) cachedNightSheet = sheet;
  else cachedDaySheet = sheet;

  paintSynchronousFallbackSheet(ctx, isNight);

  if (typeof Image !== 'undefined') {
    try {
      const svgMarkup = buildMarchThawLandscapeSvg(isNight);
      const img = new Image();
      img.onload = () => {
        if (sheet.ctx) {
          sheet.ctx.clearRect(0, 0, MARCH_WORLD_BOUNDS.width, MARCH_WORLD_BOUNDS.height);
          sheet.ctx.drawImage(img, 0, 0, MARCH_WORLD_BOUNDS.width, MARCH_WORLD_BOUNDS.height);
          sheet.svgLoaded = true;
          sheetRevision++;
        }
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    } catch {
      // Ignore in headless environments without Image data URI support
    }
  }

  return sheet;
}

/**
 * Draws the dynamic, animated elements of the Stage 1 landscape:
 * - Smart floating ice floes (`ledové kry`) strictly inside the pond and winding river
 * - Swimming white geese on the pond
 * - Rotating wooden watermill wheel & water splash
 * - Moving lower 2-horse plough team & circling crows on the fields
 * - Animated Marian apparition glow & stars above the Kaplička
 */
export function drawMarchThawDynamicLandmark(
  ctx: CanvasRenderingContext2D,
  type: string,
  time: number,
  isNight: boolean
): void {
  const ink = '#23170F';

  if (type === 'march_pond') {
    const pondX = MARCH_THAW_POIS.pond.x;
    const pondY = MARCH_THAW_POIS.pond.y;

    for (let i = 0; i < MARCH_ICE_FLOE_SPECS.length; i++) {
      if (MARCH_ICE_FLOE_SPECS[i].zone !== 'pond') continue;
      const floe = getMarchIceFloeState(i, time);
      ctx.save();
      ctx.translate(floe.x - pondX, floe.y - pondY);
      ctx.rotate(floe.angle);
      drawPolygonIceFloe(ctx, floe.rx, floe.ry, floe.id);
      ctx.restore();
    }

    // 5 white geese gliding on the pond
    for (let g = 0; g < 5; g++) {
      const ang = time * 0.28 + g * 1.25;
      const gx = Math.cos(ang) * (90 + (g % 2) * 42);
      const gy = Math.sin(ang * 1.2) * (42 + (g % 3) * 15);
      const dir = -Math.sin(ang) >= 0 ? 1 : -1;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(dir * 1.2, 1.2);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.moveTo(12, -6);
      ctx.lineTo(17, -5);
      ctx.lineTo(12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  if (type === 'march_mill') {
    const millX = MARCH_THAW_POIS.mill.x;
    const millY = MARCH_THAW_POIS.mill.y;

    // Draw the 10 stream ice floes drifting along the entire winding river
    for (let i = 0; i < MARCH_ICE_FLOE_SPECS.length; i++) {
      if (MARCH_ICE_FLOE_SPECS[i].zone !== 'stream') continue;
      const floe = getMarchIceFloeState(i, time);
      ctx.save();
      ctx.translate(floe.x - millX, floe.y - millY);
      ctx.rotate(floe.angle);
      drawPolygonIceFloe(ctx, floe.rx, floe.ry, floe.id);
      ctx.restore();
    }

    // Rotating wooden waterwheel next to the millhouse
    ctx.save();
    ctx.translate(-28, -5);
    ctx.rotate(time * 0.85);
    ctx.fillStyle = '#9C6234';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(8, -5, 34, 10);
      ctx.strokeRect(8, -5, 34, 10);
    }
    ctx.fillStyle = '#F0C57A';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (type === 'march_fields') {
    const dy = Math.sin(time * 0.62) * 68;
    const dx = Math.cos(time * 0.62) * 35;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(1.2, 1.2);
    for (const hx of [-42, -6]) {
      ctx.fillStyle = hx < -20 ? '#7C4427' : '#F1ECE1';
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(hx, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hx - 15, -8, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(14, 2);
    ctx.lineTo(56, 12);
    ctx.lineTo(74, 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = ink;
    for (let i = 0; i < 9; i++) {
      const cx = -135 + ((i * 46 + time * 38) % 300);
      const cy = -55 + Math.sin(time * 2.4 + i) * 18 + (i % 3) * 15;
      const wing = Math.sin(time * 7 + i * 1.3) * 5;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - wing);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + 8, cy - wing);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    return;
  }

  if (type === 'march_shrine') {
    // Only a tiny flickering votive candle inside the Kaplička's arched niche;
    // Panna Maria s Ježíškem appears ONLY temporarily when triggered.
    const flicker = 0.8 + Math.sin(time * 7.5) * 0.2;
    ctx.save();
    ctx.fillStyle = isNight ? `rgba(253, 224, 71, ${0.42 * flicker})` : `rgba(253, 224, 71, ${0.24 * flicker})`;
    ctx.beginPath();
    ctx.arc(0, -16, 7 * flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawPolygonIceFloe(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  seed = 0
): void {
  ctx.strokeStyle = 'rgba(224, 247, 255, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 2, rx + 5, ry + 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#9BD1E5';
  ctx.strokeStyle = '#23170F';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const pts = 7;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const wobble = 0.86 + (((seed * 17 + i * 31) % 10) / 10) * 0.24;
    const px = Math.cos(a) * rx * wobble;
    const py = Math.sin(a) * ry * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F4FBFE';
  ctx.beginPath();
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const wobble = 0.72 + (((seed * 17 + i * 31) % 10) / 10) * 0.18;
    const px = Math.cos(a) * rx * wobble;
    const py = Math.sin(a) * ry * wobble - 2.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
