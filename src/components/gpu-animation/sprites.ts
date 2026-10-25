/**
 * Baked SVG Data URIs for the 4 archetypes (runner, slime, bug, golem).
 * Using Data URI <img src="..."> ensures the browser compiles the vector graphic
 * into a single GPU texture on spawn, completely bypassing SVG DOM node recalculation.
 */

// 1. RUNNER: Swift Czech countryside sprite / mischievous imp with cap & satchel
const RUNNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <radialGradient id="rn-body" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#E28743" />
      <stop offset="100%" stop-color="#873E23" />
    </radialGradient>
  </defs>
  <!-- Shadow on floor -->
  <ellipse cx="50" cy="115" rx="30" ry="5" fill="rgba(28,22,16,0.35)" />
  <!-- Legs / Boots -->
  <path d="M35 88 L30 112 L44 112 Z" fill="#3D2314" stroke="#1C1610" stroke-width="3" stroke-linejoin="round"/>
  <path d="M65 88 L60 112 L74 112 Z" fill="#3D2314" stroke="#1C1610" stroke-width="3" stroke-linejoin="round"/>
  <!-- Torso & coat -->
  <path d="M26 55 Q20 90 28 92 L72 92 Q80 90 74 55 Z" fill="url(#rn-body)" stroke="#1C1610" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Belt & buckle -->
  <rect x="27" y="74" width="46" height="8" rx="2" fill="#24140A" stroke="#1C1610" stroke-width="2"/>
  <rect x="45" y="72" width="10" height="12" rx="2" fill="#D9A036" stroke="#1C1610" stroke-width="2"/>
  <!-- Scarf fluttering -->
  <path d="M38 52 Q22 45 12 50 Q18 62 38 58 Z" fill="#C53026" stroke="#1C1610" stroke-width="2.5"/>
  <!-- Head -->
  <circle cx="50" cy="40" r="22" fill="#E8B88A" stroke="#1C1610" stroke-width="3.5"/>
  <!-- Pointed cap -->
  <path d="M28 32 Q50 10 82 8 Q65 24 68 34 Z" fill="#2D5A27" stroke="#1C1610" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="83" cy="8" r="5" fill="#D9A036" stroke="#1C1610" stroke-width="2"/>
  <!-- Eyes -->
  <ellipse cx="43" cy="38" rx="4" ry="5.5" fill="#FAF5E8" stroke="#1C1610" stroke-width="2"/>
  <circle cx="45" cy="38" r="2.2" fill="#1C1610" />
  <ellipse cx="57" cy="38" rx="4" ry="5.5" fill="#FAF5E8" stroke="#1C1610" stroke-width="2"/>
  <circle cx="59" cy="38" r="2.2" fill="#1C1610" />
  <!-- Rosy cheeks & grin -->
  <ellipse cx="38" cy="45" rx="3.5" ry="2" fill="#DE6B48" opacity="0.6"/>
  <ellipse cx="62" cy="45" rx="3.5" ry="2" fill="#DE6B48" opacity="0.6"/>
  <path d="M44 46 Q50 52 56 46" stroke="#1C1610" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`;

// 2. SLIME: Wobbling gelatinous woodland slime with glossy shine and bobbing core
const SLIME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="sl-grad" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#86EFAC" />
      <stop offset="60%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#14532D" />
    </radialGradient>
    <radialGradient id="sl-core" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#BBF7D0" />
      <stop offset="100%" stop-color="#15803D" />
    </radialGradient>
  </defs>
  <!-- Floor puddle -->
  <ellipse cx="50" cy="94" rx="38" ry="6" fill="rgba(20,83,45,0.4)" />
  <!-- Main Slime Dome -->
  <path d="M12 85 C10 60 22 28 50 24 C78 28 90 60 88 85 C85 95 15 95 12 85 Z" fill="url(#sl-grad)" stroke="#0F381E" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Internal floating nucleus core -->
  <ellipse cx="48" cy="62" rx="14" ry="10" fill="url(#sl-core)" opacity="0.8" />
  <!-- Highlights / Gelatin sheen -->
  <path d="M30 38 Q42 30 52 32 Q40 44 30 38 Z" fill="#FFFFFF" opacity="0.75"/>
  <circle cx="26" cy="48" r="3" fill="#FFFFFF" opacity="0.65"/>
  <!-- Googly comic eyes -->
  <ellipse cx="38" cy="52" rx="7.5" ry="9" fill="#FAF5E8" stroke="#0F381E" stroke-width="2.5"/>
  <ellipse cx="40" cy="53" rx="3.5" ry="4" fill="#0F381E"/>
  <circle cx="38.5" cy="51" r="1.5" fill="#FFFFFF"/>
  <ellipse cx="62" cy="50" rx="6.5" ry="8" fill="#FAF5E8" stroke="#0F381E" stroke-width="2.5"/>
  <ellipse cx="63" cy="51" rx="3" ry="3.5" fill="#0F381E"/>
  <circle cx="62" cy="49.5" r="1.2" fill="#FFFFFF"/>
  <!-- Goo mouth -->
  <ellipse cx="50" cy="68" rx="4.5" ry="2.5" fill="#0F381E" />
</svg>`;

// 3. BUG: Swift forest beetle / cricket with carapace, twitching legs, and antennae
const BUG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bug-shell" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="60%" stop-color="#6B21A8" />
      <stop offset="100%" stop-color="#3B0764" />
    </radialGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="50" cy="94" rx="28" ry="4" fill="rgba(28,22,16,0.3)" />
  <!-- Scuttling legs (6 legs anchored at bottom) -->
  <path d="M30 65 L10 75 L12 94" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M28 55 L8 60 L6 80" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M32 75 L18 85 L22 96" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M70 65 L90 75 L88 94" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M72 55 L92 60 L94 80" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M68 75 L82 85 L78 96" stroke="#1C1610" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Antennae -->
  <path d="M42 28 Q30 8 16 12" stroke="#1C1610" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <circle cx="15" cy="12" r="3" fill="#D9A036" stroke="#1C1610" stroke-width="1.5"/>
  <path d="M58 28 Q70 8 84 12" stroke="#1C1610" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <circle cx="85" cy="12" r="3" fill="#D9A036" stroke="#1C1610" stroke-width="1.5"/>
  <!-- Abdomen / Carapace -->
  <ellipse cx="50" cy="62" rx="24" ry="28" fill="url(#bug-shell)" stroke="#1C1610" stroke-width="3.5"/>
  <!-- Elytra wing split line & gold spots -->
  <line x1="50" y1="36" x2="50" y2="88" stroke="#1C1610" stroke-width="2.5"/>
  <circle cx="40" cy="55" r="3" fill="#FACC15" stroke="#1C1610" stroke-width="1.5"/>
  <circle cx="60" cy="55" r="3" fill="#FACC15" stroke="#1C1610" stroke-width="1.5"/>
  <circle cx="42" cy="72" r="2.5" fill="#FACC15" stroke="#1C1610" stroke-width="1.5"/>
  <circle cx="58" cy="72" r="2.5" fill="#FACC15" stroke="#1C1610" stroke-width="1.5"/>
  <!-- Head & glowing mandibles -->
  <ellipse cx="50" cy="32" rx="14" ry="11" fill="#4C1D95" stroke="#1C1610" stroke-width="3"/>
  <circle cx="43" cy="30" r="3.5" fill="#EF4444" stroke="#1C1610" stroke-width="1.5"/>
  <circle cx="57" cy="30" r="3.5" fill="#EF4444" stroke="#1C1610" stroke-width="1.5"/>
</svg>`;

// 4. GOLEM: Massive stone & terracotta monolith with cracks, moss, and glowing rune
const GOLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130">
  <defs>
    <radialGradient id="glm-rock" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="50%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1E293B" />
    </radialGradient>
    <radialGradient id="glm-moss" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#65A30D" />
      <stop offset="100%" stop-color="#365314" />
    </radialGradient>
  </defs>
  <!-- Heavy floor crater shadow -->
  <ellipse cx="60" cy="122" rx="44" ry="7" fill="rgba(15,23,42,0.5)" />
  <!-- Massive Pillar Legs -->
  <rect x="32" y="88" width="22" height="32" rx="5" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <rect x="66" y="88" width="22" height="32" rx="5" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <!-- Torso Monolith -->
  <polygon points="22,46 98,46 88,96 32,96" fill="url(#glm-rock)" stroke="#0F172A" stroke-width="4.5" stroke-linejoin="round"/>
  <!-- Ancient Stone Cracks -->
  <path d="M42 55 L48 68 L44 80 M72 58 L68 74 L76 86" stroke="#0F172A" stroke-width="2.5" fill="none"/>
  <!-- Moss patches -->
  <ellipse cx="36" cy="54" rx="8" ry="4" fill="url(#glm-moss)" />
  <ellipse cx="80" cy="82" rx="6" ry="3.5" fill="url(#glm-moss)" />
  <!-- Shoulders & Heavy Arms -->
  <circle cx="18" cy="52" r="14" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <rect x="8" y="56" width="16" height="42" rx="6" fill="#475569" stroke="#0F172A" stroke-width="3.5"/>
  <circle cx="102" cy="52" r="14" fill="#334155" stroke="#0F172A" stroke-width="4"/>
  <rect x="96" y="56" width="16" height="42" rx="6" fill="#475569" stroke="#0F172A" stroke-width="3.5"/>
  <!-- Heavy Stone Head -->
  <polygon points="44,22 76,22 72,48 48,48" fill="#475569" stroke="#0F172A" stroke-width="4" stroke-linejoin="round"/>
  <!-- Glowing Emeth Rune on Forehead (אמת) -->
  <rect x="54" y="24" width="12" height="6" rx="2" fill="#F59E0B" stroke="#0F172A" stroke-width="1.5"/>
  <!-- Slit Eyes -->
  <rect x="48" y="36" width="7" height="3" fill="#FBBF24" />
  <rect x="65" y="36" width="7" height="3" fill="#FBBF24" />
</svg>`;

export const BAKED_SPRITES = {
  runner: `data:image/svg+xml;utf8,${encodeURIComponent(RUNNER_SVG)}`,
  slime: `data:image/svg+xml;utf8,${encodeURIComponent(SLIME_SVG)}`,
  bug: `data:image/svg+xml;utf8,${encodeURIComponent(BUG_SVG)}`,
  golem: `data:image/svg+xml;utf8,${encodeURIComponent(GOLEM_SVG)}`,
  // In-game assets references for fallback or comparison
  snowman: '/assets/aistudio/taj_c__sn_hul_k_6fc5b3e2.png',
  kostelnik: '/assets/aistudio/kosteln_k_348e0adb.png',
  pasacek: '/assets/aistudio/pas__ek_b67a8267.png',
};
