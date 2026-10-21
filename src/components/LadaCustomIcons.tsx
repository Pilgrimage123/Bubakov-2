import React from 'react';

export interface LadaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const baseSvgStyle = (size: string | number, style: React.CSSProperties = {}): React.CSSProperties => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'visible',
  flexShrink: 0,
  width: typeof size === 'number' ? `${size}px` : size,
  height: typeof size === 'number' ? `${size}px` : size,
  ...style,
});

/**
 * Wooden watermill cogwheel with iron hub (⚙️ / settings / mill)
 */
export const LadaSettingsCogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mlýnské soukolí" {...props}>
    <g className="lada-anim-cog">
      {/* 8 Carved wooden cogs */}
      <path
        d="M 15 3 L 21 3 L 20 7 C 22 7.7 23.8 8.7 25.4 10 L 29 8 L 32 13 L 29 15.6 C 29.5 17.5 29.5 19.5 29 21.4 L 32 24 L 29 29 L 25.4 27 C 23.8 28.3 22 29.3 20 30 L 21 34 L 15 34 L 16 30 C 14 29.3 12.2 28.3 10.6 27 L 7 29 L 4 24 L 7 21.4 C 6.5 19.5 6.5 17.5 7 15.6 L 4 13 L 7 8 L 10.6 10 C 12.2 8.7 14 7.7 16 7 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Wooden wheel rim */}
      <circle cx="18" cy="18" r="9" fill="#D9A036" stroke="#1A1612" strokeWidth="2.2" />
      {/* 4 Carved spokes */}
      <line x1="18" y1="9" x2="18" y2="27" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="9" y1="18" x2="27" y2="18" stroke="#1A1612" strokeWidth="2.4" />
      {/* Forged iron center hub */}
      <circle cx="18" cy="18" r="4.2" fill="#2A170A" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="18" r="1.6" fill="#F3E9D2" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rolled village chronicle parchment with red wax seal (💬 / combat text / scroll)
 */
export const LadaCombatTextIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pergamenový svitek" {...props}>
    <g className="lada-anim-float">
      {/* Rolled parchment roll */}
      <path
        d="M 8 7 C 6 7, 5 9, 6 12 C 7 15, 10 15, 11 12 C 12 9, 10 7, 8 7 Z M 8 7 L 27 7 C 29 7, 30 9, 31 12 L 11 12"
        fill="#E8DCC2"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Sheet unrolling downwards */}
      <path
        d="M 7 13 L 7 26 C 7 28, 9 29, 12 29 L 29 29 C 31 29, 32 27, 31 24 L 29 11 L 10 12"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Written text lines */}
      <line x1="12" y1="17" x2="25" y2="17" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <line x1="12" y1="21" x2="23" y2="21" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <line x1="12" y1="25" x2="19" y2="25" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      {/* Red wax seal with ribbon */}
      <g className="lada-anim-glint">
        <circle cx="26" cy="24" r="3.6" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
        <path d="M 26 27 L 24 33 L 26 31 L 28 33 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/**
 * Wrought-iron village padlock (🔒 / lock / locked)
 */
export const LadaPadlockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovaný zámek" {...props}>
    <g className="lada-anim-shiver">
      {/* Wrought-iron arched shackle */}
      <path
        d="M 12 16 L 12 11 C 12 6, 24 6, 24 11 L 24 16"
        fill="none"
        stroke="#1A1612"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 12 16 L 12 11 C 12 7, 24 7, 24 11 L 24 16"
        fill="none"
        stroke="#8C5A35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Solid iron body */}
      <rect
        x="8"
        y="15"
        width="20"
        height="17"
        rx="3.5"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Brass plate and keyhole */}
      <circle cx="18" cy="21.5" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 17 21.5 L 19 21.5 L 18.5 26 L 17.5 26 Z" fill="#1A1612" />
      {/* Corner rivets */}
      <circle cx="10.5" cy="17.5" r="1.1" fill="#D9A036" />
      <circle cx="25.5" cy="17.5" r="1.1" fill="#D9A036" />
      <circle cx="10.5" cy="29" r="1.1" fill="#D9A036" />
      <circle cx="25.5" cy="29" r="1.1" fill="#D9A036" />
    </g>
  </svg>
);

/**
 * Open wrought-iron padlock (🔓 / unlocked)
 */
export const LadaOpenPadlockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Odemčený zámek" {...props}>
    <g className="lada-anim-float">
      {/* Unlocked swung shackle */}
      <path
        d="M 11 15 L 11 9 C 11 4, 23 4, 23 9 L 23 11"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.8"
        strokeLinecap="round"
        transform="rotate(-20 18 10)"
      />
      <rect
        x="8"
        y="16"
        width="20"
        height="16"
        rx="3.5"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="22" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 17 22 L 19 22 L 18.5 27 L 17.5 27 Z" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Brass magnifying glass with turned wooden handle (🔎 / 🔍 / search / reveal)
 */
export const LadaMagnifierIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mosazná lupa" {...props}>
    <g className="lada-anim-rock">
      {/* Turned wooden handle */}
      <path
        d="M 23 23 L 31 31 C 32 32, 33 31, 32 30 L 25 22 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Brass lens bezel */}
      <circle cx="15" cy="15" r="10" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      {/* Glass with sky reflection */}
      <circle cx="15" cy="15" r="7.5" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.8" />
      {/* Star glint on glass */}
      <path
        d="M 12 11 L 14 13 L 12 15 L 10 13 Z"
        fill="#FFFFFF"
        className="lada-anim-glint"
      />
    </g>
  </svg>
);

/**
 * Golden-baked cracklings flatbread (🫓 / skvarkova_placka)
 */
export const LadaPlackaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Škvarková placka" {...props}>
    {/* Rising steam wisps */}
    <path d="M 14 8 C 13 5, 16 3, 15 1" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <path d="M 22 9 C 23 6, 20 4, 22 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-2" />
    <g className="lada-anim-float">
      {/* Shadow */}
      <ellipse cx="18" cy="28" rx="14" ry="4" fill="#2A170A" opacity="0.25" />
      {/* Placka flatbread body */}
      <ellipse cx="18" cy="22" rx="13.5" ry="9" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <ellipse cx="18" cy="21.5" rx="11" ry="6.8" fill="#F59E0B" opacity="0.6" />
      {/* Scored cross-hatching */}
      <line x1="9" y1="20" x2="27" y2="24" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="24" x2="26" y2="20" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
      {/* Diced roasted cracklings */}
      <rect x="13" y="19" width="3" height="2.5" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="20" y="19.5" width="3.2" height="2.2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="16" y="22.5" width="2.8" height="2.5" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="22" y="23" width="2.6" height="2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="11" y="22" width="2.5" height="2.2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Sturdy stitched wanderer's boots (👢 / 🥾 / toulave_boty)
 */
export const LadaBootsIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Toulavé škorně" {...props}>
    {/* Dust puff at the heel */}
    <circle cx="8" cy="30" r="2.2" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.2" className="lada-anim-dust" />
    <g className="lada-anim-step">
      {/* Boot shaft */}
      <path
        d="M 12 7 L 22 7 L 21 17 L 27 21 C 29 22.5, 30 25, 29 27 L 27 28 L 9 28 L 9 25 C 9 22, 11 20, 12 17 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Turned leather cuff */}
      <path d="M 10 7 C 10 5, 24 5, 24 7 L 22 10 L 11 10 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Sturdy sole and heel */}
      <path d="M 8 28 L 29 28 L 29 31 L 22 31 L 22 30 L 15 30 L 15 31 L 8 31 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Stitched seam & brass buckle */}
      <line x1="16" y1="10" x2="16" y2="23" stroke="#D9A036" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      <rect x="18" y="21" width="3.5" height="3" rx="0.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Tied linen coin pouch with gold ducat emblem (💰 / zlaty_dukat / money)
 */
export const LadaDucatPouchIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Měšec s dukátem" {...props}>
    <g className="lada-anim-rock">
      {/* Pouch ruffled top */}
      <path
        d="M 14 11 C 12 6, 15 4, 18 6 C 21 4, 24 6, 22 11 Z"
        fill="#E8DCC2"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Tied rope cord */}
      <ellipse cx="18" cy="11.5" rx="5" ry="1.8" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      {/* Linen pouch belly */}
      <path
        d="M 13 12 C 9 14, 5 20, 6 25 C 7 30, 11 32, 18 32 C 25 32, 29 30, 30 25 C 31 20, 27 14, 23 12 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Embossed gold Austrian/Czech ducat emblem */}
      <circle cx="18" cy="22" r="5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      <text x="18" y="24.5" fontSize="6.5" fontWeight="900" textAnchor="middle" fill="#2A170A" fontFamily="serif">K</text>
      {/* Star sparkle on gold coin */}
      <circle cx="21" cy="19" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Foaming earthenware tavern mug (🍺 / beer / korbel)
 */
export const LadaBeerMugIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Korbel piva" {...props}>
    <g className="lada-anim-float">
      {/* Stoneware handle */}
      <path
        d="M 23 14 C 29 14, 30 25, 23 27"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M 23 14 C 28 14, 29 25, 23 27"
        fill="none"
        stroke="#8C5A35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Stoneware ribbed mug body */}
      <path
        d="M 9 12 L 23 12 L 22 30 C 22 31, 21 32, 19 32 L 13 32 C 11 32, 10 31, 10 30 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Blue folk cobalt painted band */}
      <path d="M 9.5 19 L 22.5 19 L 22.3 23 L 9.7 23 Z" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.5" />
      {/* Foaming overflowing beer head */}
      <g className="lada-anim-foam">
        <path
          d="M 8 13 C 6 13, 6 9, 9 9 C 9 7, 12 6, 14 8 C 16 6, 20 6, 21 8 C 23 7, 26 9, 24 13 C 25 15, 23 17, 21 16 C 18 17, 14 17, 12 16 C 10 17, 7 16, 8 13 Z"
          fill="#FFFDF6"
          stroke="#1A1612"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Overflowing foam drop on mug */}
        <path d="M 11 14 C 11 18, 13 18, 13 14" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/**
 * Folk golden carnival or boss crown (👑 / crown)
 */
export const LadaCrownIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Královská koruna" {...props}>
    <g className="lada-anim-float">
      {/* Red velvet interior cap */}
      <path d="M 8 25 C 8 18, 28 18, 28 25 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="2" />
      {/* Golden crown spikes */}
      <path
        d="M 6 25 L 8 11 L 13 18 L 18 9 L 23 18 L 28 11 L 30 25 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Beaten gold base band */}
      <rect x="6" y="24" width="24" height="5" rx="1.5" fill="#B45309" stroke="#1A1612" strokeWidth="2.2" />
      {/* Pearl / folk gems */}
      <circle cx="8" cy="11" r="1.8" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="18" cy="9" r="2.2" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="28" cy="11" r="1.8" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="12" cy="26.5" r="1.2" fill="#38BDF8" />
      <circle cx="18" cy="26.5" r="1.5" fill="#4D7C0F" />
      <circle cx="24" cy="26.5" r="1.2" fill="#38BDF8" />
      {/* Gem glint */}
      <circle cx="18" cy="9" r="0.9" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Painted Czech folk ceramic trophy cup (🏆 / trophy)
 */
export const LadaTrophyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malovaný pohár" {...props}>
    <g className="lada-anim-float">
      {/* Ornate handles */}
      <path d="M 10 11 C 4 11, 4 20, 11 20" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 26 11 C 32 11, 32 20, 25 20" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      {/* Goblet chalice */}
      <path
        d="M 10 8 L 26 8 L 25 18 C 24 23, 20 25, 18 25 C 16 25, 12 23, 11 18 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Gold rim and folk flower */}
      <rect x="9" y="7" width="18" height="3" rx="1" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="16" r="2.5" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      {/* Stem and footed base */}
      <path d="M 16 25 L 16 29 L 20 29 L 20 25 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      <path d="M 12 29 L 24 29 L 25 32 L 11 32 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Trophy glint */}
      <circle cx="13" cy="11" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Festive rosemary sprig with fluttering red ribbon (🎉 / celebration)
 */
export const LadaCelebrationRibbonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Rozmarýn s pentlí" {...props}>
    {/* Confetti sparkle */}
    <circle cx="8" cy="9" r="1.2" fill="#D9A036" className="lada-anim-glint" />
    <circle cx="28" cy="8" r="1.2" fill="#C83E31" className="lada-anim-glint" />
    <g className="lada-anim-rock">
      {/* Green rosemary sprigs */}
      <line x1="18" y1="28" x2="18" y2="7" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 18 10 L 13 8 M 18 14 L 12 13 M 18 18 L 13 19" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 18 9 L 23 7 M 18 13 L 24 12 M 18 17 L 23 18" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tied red folk ribbon bow */}
      <circle cx="18" cy="20" r="2.5" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 18 20 C 13 18, 12 23, 17 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      <path d="M 18 20 C 23 18, 24 23, 19 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      {/* Fluttering ribbon tails */}
      <path d="M 17 22 C 14 26, 12 29, 13 32" fill="none" stroke="#C83E31" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 19 22 C 22 26, 24 29, 23 32" fill="none" stroke="#C83E31" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Birch twig broom (🧹 / broom)
 */
export const LadaBroomIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Březové koště" {...props}>
    {/* Dust sweep wisp */}
    <path d="M 6 31 C 10 32, 14 31, 16 30" fill="none" stroke="#E8DCC2" strokeWidth="2" strokeLinecap="round" className="lada-anim-dust" />
    <g className="lada-anim-rock">
      {/* Ashwood stick handle */}
      <line x1="28" y1="5" x2="16" y2="20" stroke="#1A1612" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="28" y1="5" x2="16" y2="20" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Tied birch twigs bundle */}
      <path
        d="M 16 20 L 20 23 L 13 32 C 10 33, 7 31, 8 28 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Willow tie band */}
      <line x1="15" y1="21" x2="19" y2="24" stroke="#5E3A21" strokeWidth="2.4" />
      {/* Individual twig bristles */}
      <line x1="16" y1="24" x2="11" y2="31" stroke="#8C5A35" strokeWidth="1.5" />
      <line x1="14" y1="22" x2="8" y2="29" stroke="#8C5A35" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Painted clay folk rooster (🐓 / rooster)
 */
export const LadaRoosterIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hliněný kohoutek" {...props}>
    <g className="lada-anim-pulse">
      {/* Plump clay body */}
      <path
        d="M 12 18 C 9 14, 13 9, 17 9 C 20 9, 23 11, 23 15 C 27 15, 30 18, 29 23 C 28 27, 23 29, 18 29 C 12 29, 9 24, 12 18 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Red folk comb and wattle */}
      <path d="M 15 9 C 14 6, 17 5, 17 7 C 18 5, 20 6, 19 9 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="14" cy="13" r="1.5" fill="#C83E31" />
      {/* Yellow beak & eye */}
      <path d="M 12 11 L 8 13 L 13 14 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="16" cy="11.5" r="1.1" fill="#1A1612" />
      {/* Arched painted folk tail feathers */}
      <path d="M 28 21 C 32 18, 33 13, 29 10 C 27 13, 27 17, 27 21" fill="#3A76A8" stroke="#1A1612" strokeWidth="2" />
      <path d="M 27 23 C 31 22, 33 17, 30 14" fill="none" stroke="#D9A036" strokeWidth="2" strokeLinecap="round" />
      {/* Clay pedestal base */}
      <path d="M 15 29 L 21 29 L 23 33 L 13 33 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * Forged iron horseshoe (🧲 / horseshoe / podkova)
 */
export const LadaHorseshoeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářská podkova" {...props}>
    <g className="lada-anim-rock">
      {/* Heavy forged iron U-shape */}
      <path
        d="M 9 10 C 9 6, 13 5, 15 7 L 15 15 C 15 19, 21 19, 21 15 L 21 7 C 23 5, 27 6, 27 10 C 27 22, 23 29, 18 29 C 13 29, 9 22, 9 10 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Forged square nail holes */}
      <rect x="10.5" y="11" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="11.5" y="17" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="14" y="23" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="23.7" y="11" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="22.7" y="17" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="20.2" y="23" width="1.8" height="1.8" fill="#F3E9D2" />
      {/* Glint on polished heel calk */}
      <circle cx="11" cy="7" r="1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Carved wooden cuckoo clock (⏰ / clock / cuckoo)
 */
export const LadaCuckooClockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vyřezávané kukačky" {...props}>
    {/* Swinging carved pendulum */}
    <g className="lada-anim-rock">
      <line x1="18" y1="26" x2="18" y2="33" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="33" r="2.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
    <g className="lada-anim-float">
      {/* Pointed chalet roof */}
      <path d="M 8 13 L 18 4 L 28 13 L 26 15 L 18 8 L 10 15 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Wooden clock box */}
      <rect x="10" y="13" width="16" height="14" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Cuckoo door */}
      <rect x="15" y="7" width="6" height="5" rx="2" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
      {/* Dial with clock hands */}
      <circle cx="18" cy="20" r="5" fill="#F3E9D2" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="18" y1="20" x2="18" y2="17" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="20" x2="21" y2="20" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Studded wooden round shield (🛡️ / 🛡 / shield)
 */
export const LadaShieldIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Okovaný štít" {...props}>
    <g className="lada-anim-float">
      {/* Shield body (oak planks) */}
      <path
        d="M 18 4 C 26 4, 30 7, 30 16 C 30 25, 23 30, 18 33 C 13 30, 6 25, 6 16 C 6 7, 10 4, 18 4 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Vertical iron reinforcement band */}
      <path d="M 15 5 L 21 5 L 21 31 L 15 31 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
      {/* Center iron boss (puklice) */}
      <circle cx="18" cy="17" r="4.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="17" r="2.2" fill="#2A170A" />
      {/* Iron rivets */}
      <circle cx="18" cy="8" r="1.1" fill="#D9A036" />
      <circle cx="18" cy="26" r="1.1" fill="#D9A036" />
      <circle cx="9" cy="14" r="1.1" fill="#D9A036" />
      <circle cx="27" cy="14" r="1.1" fill="#D9A036" />
      {/* Boss glint */}
      <circle cx="16.5" cy="15.5" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Forged hunter's sabre / crossed blades (🗡️ / ⚔️ / weapons)
 */
export const LadaSwordIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecká šavle" {...props}>
    <g className="lada-anim-rock">
      {/* Polished steel blade */}
      <path
        d="M 27 5 C 29 8, 28 14, 21 21 L 16 26 L 14 24 L 19 19 C 24 14, 25 7, 27 5 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Curved brass crossguard */}
      <path d="M 12 21 C 15 23, 19 27, 21 30 L 19 32 C 17 29, 13 25, 10 23 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      {/* Wooden hilt and brass pommel */}
      <line x1="14" y1="26" x2="8" y2="32" stroke="#5E3A21" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="7" cy="33" r="2.2" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      {/* Blade glint */}
      <circle cx="24" cy="9" r="1.2" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Village hearth ember fire (🔥 / fire)
 */
export const LadaHearthFireIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský ohýnek" {...props}>
    {/* Crossed hearth logs */}
    <line x1="7" y1="31" x2="29" y2="28" stroke="#1A1612" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="7" y1="31" x2="29" y2="28" stroke="#8C5A35" strokeWidth="3" strokeLinecap="round" />
    <line x1="9" y1="28" x2="27" y2="31" stroke="#1A1612" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="9" y1="28" x2="27" y2="31" stroke="#5E3A21" strokeWidth="3" strokeLinecap="round" />
    {/* Outer red flame */}
    <g className="lada-anim-flicker">
      <path
        d="M 18 4 C 18 4, 11 12, 11 20 C 11 27, 14 29, 18 29 C 22 29, 25 27, 25 20 C 25 12, 18 4, 18 4 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Inner bright yellow flame */}
      <path
        d="M 18 10 C 18 10, 14 16, 14 22 C 14 26, 16 28, 18 28 C 20 28, 22 26, 22 22 C 22 16, 18 10, 18 10 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Floating ember spark */}
      <circle cx="21" cy="6" r="1.2" fill="#FDE047" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Hand-drawn winter frost snowflake (❄️ / frost / ice)
 */
export const LadaSnowflakeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Sněhová vločka" {...props}>
    <g className="lada-anim-float">
      {/* 6 primary branches with ink outlines */}
      <g stroke="#1A1612" strokeWidth="3.2" strokeLinecap="round">
        <line x1="18" y1="5" x2="18" y2="31" />
        <line x1="7" y1="12" x2="29" y2="24" />
        <line x1="7" y1="24" x2="29" y2="12" />
      </g>
      <g stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round">
        <line x1="18" y1="5" x2="18" y2="31" />
        <line x1="7" y1="12" x2="29" y2="24" />
        <line x1="7" y1="24" x2="29" y2="12" />
      </g>
      {/* Crystal barbs */}
      <path d="M 14 9 L 18 12 L 22 9 M 14 27 L 18 24 L 22 27" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      {/* Center crystal core with glint */}
      <circle cx="18" cy="18" r="3.2" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="1.3" fill="#38BDF8" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rustic jagged golden lightning bolt (⚡ / lightning)
 */
export const LadaLightningIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Blesk" {...props}>
    <g className="lada-anim-shiver">
      <path
        d="M 21 3 L 10 18 L 17 18 L 13 33 L 26 15 L 19 15 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="14" r="1.5" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Swirling wind gust with blowing leaf (💨 / wind / dash)
 */
export const LadaWindGustIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Větrný vír" {...props}>
    <g className="lada-anim-float">
      {/* Wind swirl curves */}
      <path d="M 5 15 C 15 15, 23 13, 27 10 C 30 7, 28 5, 25 6 C 22 7, 22 10, 24 11" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 5 15 C 15 15, 23 13, 27 10 C 30 7, 28 5, 25 6 C 22 7, 22 10, 24 11" fill="none" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 7 21 C 17 21, 25 21, 28 18 C 30 16, 29 14, 27 15" fill="none" stroke="#1A1612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 7 21 C 17 21, 25 21, 28 18 C 30 16, 29 14, 27 15" fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" />
      {/* Flying autumn oak leaf */}
      <path d="M 12 25 C 10 28, 14 30, 17 28 C 19 25, 17 23, 14 24 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Comic starburst impact (💥 / impact / hit)
 */
export const LadaImpactBurstIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský prásk" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 18 4 L 22 11 L 30 8 L 27 16 L 34 20 L 26 24 L 28 32 L 20 28 L 16 34 L 14 27 L 6 29 L 9 21 L 2 17 L 9 13 L 7 5 L 15 9 Z"
        fill="#F59E0B"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="5" fill="#FEF08A" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * White birch log (🪵 / wood / log)
 */
export const LadaBirchLogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Březové poleno" {...props}>
    <g className="lada-anim-float">
      {/* Log body */}
      <path
        d="M 11 10 L 26 15 L 23 27 L 8 22 Z"
        fill="#FFFDF6"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* End grain ellipse */}
      <ellipse cx="9.5" cy="16" rx="4.5" ry="6.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2.2" />
      <ellipse cx="9.5" cy="16" rx="2.5" ry="4" fill="none" stroke="#8C5A35" strokeWidth="1.5" />
      {/* Characteristic black birch bark notches */}
      <path d="M 14 13 L 18 14" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 21 19 L 25 20" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 15 22 L 18 23" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Village chapel bronze bell (🔔 / bell / zvonice)
 */
export const LadaChapelBellIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zvonice" {...props}>
    <g className="lada-anim-rock">
      {/* Bell hanger loop */}
      <path d="M 15 8 C 15 5, 21 5, 21 8" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      {/* Clapper ball */}
      <circle cx="18" cy="29" r="3" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Bronze bell body */}
      <path
        d="M 14 8 C 14 8, 13 18, 8 23 C 7 24, 8 26, 11 26 L 25 26 C 28 26, 29 24, 28 23 C 23 18, 22 8, 22 8 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Folk engraving band */}
      <path d="M 10 22 C 14 21, 22 21, 26 22" fill="none" stroke="#8C5A35" strokeWidth="1.8" />
      <circle cx="15" cy="14" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rosemary sprig and healing green herb (🌿 / herb / rosemary)
 */
export const LadaRosemaryIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Snítka rozmarýnu" {...props}>
    <g className="lada-anim-rock">
      <path d="M 8 30 C 14 26, 22 18, 26 7" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 8 30 C 14 26, 22 18, 26 7" fill="none" stroke="#4D7C0F" strokeWidth="1.8" strokeLinecap="round" />
      {/* Leaflets */}
      <ellipse cx="23" cy="8" rx="2.5" ry="5" transform="rotate(35 23 8)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="20" cy="13" rx="2.2" ry="4.5" transform="rotate(-40 20 13)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="23" cy="16" rx="2.2" ry="4.5" transform="rotate(45 23 16)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="16" cy="20" rx="2.2" ry="4.5" transform="rotate(-40 16 20)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="18" cy="23" rx="2.2" ry="4.5" transform="rotate(50 18 23)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
    </g>
  </svg>
);

/**
 * Masopust folk painted skull (💀 / skull)
 */
export const LadaFolkSkullIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Morová lebka" {...props}>
    <g className="lada-anim-float">
      {/* Cranium */}
      <path
        d="M 9 17 C 9 9, 27 9, 27 17 C 27 21, 24 23, 23 25 L 23 29 L 13 29 L 13 25 C 12 23, 9 21, 9 17 Z"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Inked eyes & nasal bone */}
      <ellipse cx="14" cy="17" rx="3" ry="3.5" fill="#1A1612" />
      <ellipse cx="22" cy="17" rx="3" ry="3.5" fill="#1A1612" />
      <path d="M 18 21 L 16.5 24 L 19.5 24 Z" fill="#1A1612" />
      {/* Folk teeth lines */}
      <line x1="15" y1="26" x2="15" y2="29" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="18" y1="26" x2="18" y2="29" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="21" y1="26" x2="21" y2="29" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Folk painted crimson heart (❤️ / ❤ / heart / hp)
 */
export const LadaFolkHeartIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malované srdce" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 18 10 C 22 4, 31 5, 31 14 C 31 22, 23 26, 18 31 C 13 26, 5 22, 5 14 C 5 5, 14 4, 18 10 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* White folk painted ornament inside */}
      <path d="M 12 12 C 14 9, 17 11, 16 14 C 15 17, 12 16, 12 12" fill="none" stroke="#FFFDF6" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="12" r="1.3" fill="#FFFDF6" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Sourdough rye loaf (🍞 / 🥖 / bread)
 */
export const LadaRyeBreadIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Žitný chléb" {...props}>
    <path d="M 18 9 C 17 6, 20 4, 19 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      <ellipse cx="18" cy="23" rx="14" ry="8" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Sourdough crust cuts */}
      <line x1="12" y1="18" x2="16" y2="24" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="17" x2="20" y2="25" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="19" x2="25" y2="24" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      {/* Flour dusting */}
      <circle cx="15" cy="20" r="0.9" fill="#FFFDF6" />
      <circle cx="21" cy="21" r="0.9" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Golden village rohlík (🥐 / croissant / rohlik)
 */
export const LadaCroissantIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pekařský rohlík" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 6 25 C 8 13, 28 13, 30 25 C 28 26, 25 24, 23 21 C 20 18, 16 18, 13 21 C 11 24, 8 26, 6 25 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Poppy seed sprinkles */}
      <circle cx="15" cy="18" r="0.8" fill="#1A1612" />
      <circle cx="18" cy="17" r="0.8" fill="#1A1612" />
      <circle cx="21" cy="18" r="0.8" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Wheel of Olomouc curd cheese (🧀 / cheese)
 */
export const LadaCheeseWheelIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Tvarůžek" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 6 24 L 28 27 L 31 16 L 16 13 L 6 24 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <polygon points="6,24 16,13 31,16 22,23" fill="#F59E0B" opacity="0.6" stroke="#1A1612" strokeWidth="1.8" />
      {/* Cheese holes */}
      <circle cx="13" cy="20" r="1.5" fill="#D97706" />
      <circle cx="23" cy="22" r="2" fill="#D97706" />
      <circle cx="22" cy="16" r="1.3" fill="#D97706" />
    </g>
  </svg>
);

/**
 * Granite fieldstone (🪨 / stone)
 */
export const LadaGraniteStoneIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Polní kámen" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 8 26 C 6 20, 11 11, 19 11 C 27 11, 30 18, 29 25 C 27 30, 12 31, 8 26 Z"
        fill="#8A887D"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Green moss patch */}
      <path d="M 14 13 C 17 11, 22 12, 23 15 C 20 16, 16 15, 14 13 Z" fill="#4D7C0F" />
      {/* Granite texture speckles */}
      <circle cx="12" cy="22" r="1" fill="#1A1612" opacity="0.6" />
      <circle cx="20" cy="24" r="1.2" fill="#1A1612" opacity="0.6" />
      <circle cx="24" cy="20" r="0.9" fill="#1A1612" opacity="0.6" />
    </g>
  </svg>
);

/**
 * Woven wicker basket (🧺 / basket)
 */
export const LadaWickerBasketIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Proutěný košík" {...props}>
    <g className="lada-anim-rock">
      {/* Arched wicker handle */}
      <path d="M 11 17 C 11 8, 25 8, 25 17" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 11 17 C 11 8, 25 8, 25 17" fill="none" stroke="#D9A036" strokeWidth="1.8" strokeLinecap="round" />
      {/* Woven basket basketry */}
      <path
        d="M 7 17 L 29 17 L 26 30 C 26 31, 24 32, 22 32 L 14 32 C 12 32, 10 31, 10 30 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Weave pattern lines */}
      <line x1="8" y1="22" x2="28" y2="22" stroke="#5E3A21" strokeWidth="1.8" />
      <line x1="9" y1="27" x2="27" y2="27" stroke="#5E3A21" strokeWidth="1.8" />
      <line x1="14" y1="17" x2="14" y2="32" stroke="#D9A036" strokeWidth="1.5" />
      <line x1="22" y1="17" x2="22" y2="32" stroke="#D9A036" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Tallow candle in iron holder (🕯️ / 🕯 / candle / lantern)
 */
export const LadaCandleIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Svíčka" {...props}>
    {/* Flickering candle flame */}
    <g className="lada-anim-flicker">
      <path d="M 18 5 C 18 5, 14 9, 14 12 C 14 14, 16 16, 18 16 C 20 16, 22 14, 22 12 C 22 9, 18 5, 18 5 Z" fill="#FDE047" stroke="#1A1612" strokeWidth="1.5" />
      <ellipse cx="18" cy="13" rx="1.5" ry="2" fill="#F59E0B" />
    </g>
    {/* Black wick */}
    <line x1="18" y1="16" x2="18" y2="18" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
    {/* Wax candle shaft */}
    <rect x="15" y="18" width="6" height="10" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
    {/* Wax drips */}
    <path d="M 15 22 C 14 24, 15 25, 15 22" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.2" />
    {/* Wrought-iron saucer and handle */}
    <ellipse cx="18" cy="29" rx="10" ry="2.5" fill="#2A170A" stroke="#1A1612" strokeWidth="2.2" />
    <path d="M 26 27 C 30 27, 30 32, 26 32" fill="none" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Woodchopper's axe (🪓 / axe)
 */
export const LadaAxeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Tesařská sekyra" {...props}>
    <g className="lada-anim-rock">
      {/* Curved ash handle */}
      <path d="M 27 6 L 10 30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M 27 6 L 10 30" stroke="#8C5A35" strokeWidth="2.6" strokeLinecap="round" />
      {/* Forged iron axe head */}
      <path
        d="M 22 6 L 31 11 C 32 17, 28 22, 21 21 L 18 13 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Sharpened steel edge */}
      <path d="M 31 11 C 32 17, 28 22, 21 21" fill="none" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="14" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Ashwood hunting bow (🏹 / bow)
 */
export const LadaHuntingBowIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecký luk" {...props}>
    <g className="lada-anim-rock">
      {/* Curved wooden stave */}
      <path d="M 10 7 C 24 10, 24 26, 10 29" fill="none" stroke="#1A1612" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M 10 7 C 24 10, 24 26, 10 29" fill="none" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Taut bowstring */}
      <line x1="10" y1="7" x2="10" y2="29" stroke="#E8DCC2" strokeWidth="1.8" />
      {/* Notched arrow */}
      <line x1="7" y1="18" x2="28" y2="18" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="28,18 24,15 24,21" fill="#2A170A" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="8,18 5,16 6,18 5,20" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Painted carnival target (🎯 / target)
 */
export const LadaCarnivalTargetIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pouťový terč" {...props}>
    <g className="lada-anim-pulse">
      {/* Concentric rings */}
      <circle cx="18" cy="18" r="14" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.4" />
      <circle cx="18" cy="18" r="10.5" fill="#C83E31" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="18" r="7" fill="#F3E9D2" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="3.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.6" />
      {/* Arrow hitting bullseye */}
      <line x1="28" y1="8" x2="18" y2="18" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Nightwatchman's brass horn (🔊 / 🔇 / sound / mute)
 */
export const LadaHornIcon: React.FC<LadaIconProps & { muted?: boolean }> = ({ size = '1.2em', muted = false, className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label={muted ? "Ztišený roh" : "Ponocenský roh"} {...props}>
    <g className="lada-anim-rock">
      {/* Curved brass horn */}
      <path
        d="M 8 20 C 8 20, 12 16, 18 16 C 22 16, 25 12, 26 8 L 29 9 C 28 15, 23 20, 18 20 C 13 20, 10 24, 8 24 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Horn bell flare */}
      <ellipse cx="28" cy="8.5" rx="2.5" ry="4" transform="rotate(-30 28 8.5)" fill="#B45309" stroke="#1A1612" strokeWidth="1.8" />
      {/* Sound waves or mute cross */}
      {muted ? (
        <line x1="6" y1="6" x2="30" y2="30" stroke="#C83E31" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <g stroke="#1A1612" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 30 4 C 33 6, 33 11, 30 13" />
        </g>
      )}
    </g>
  </svg>
);

/**
 * Painted tavern violin / music note (🎵 / 🎶 / music)
 */
export const LadaFiddleMusicIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hospodská nota" {...props}>
    <g className="lada-anim-rock">
      {/* Eighth notes with wooden scroll */}
      <ellipse cx="11" cy="25" rx="4" ry="3" transform="rotate(-20 11 25)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      <ellipse cx="23" cy="21" rx="4" ry="3" transform="rotate(-20 23 21)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      <line x1="14" y1="24" x2="14" y2="10" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="26" y1="20" x2="26" y2="6" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="14,10 26,6 26,9 14,13" fill="#1A1612" />
      <circle cx="11" cy="25" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Traditional Czech marionette puppet cross (🎮 / 🕹️ / game)
 */
export const LadaPuppetToyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Loutkový vahadlo" {...props}>
    <g className="lada-anim-rock">
      {/* Crossed wooden bars */}
      <line x1="18" y1="6" x2="18" y2="28" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="18" y1="6" x2="18" y2="28" stroke="#8C5A35" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="14" x2="29" y2="14" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="7" y1="14" x2="29" y2="14" stroke="#D9A036" strokeWidth="2.5" strokeLinecap="round" />
      {/* Puppet strings */}
      <line x1="8" y1="16" x2="8" y2="30" stroke="#E8DCC2" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="28" y1="16" x2="28" y2="30" stroke="#E8DCC2" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Center iron rivet */}
      <circle cx="18" cy="14" r="2.2" fill="#2A170A" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Whitewashed Czech cottage (🏘️ / 🏘 / cottage)
 */
export const LadaCottageIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovská chaloupka" {...props}>
    {/* Chimney smoke */}
    <path d="M 23 8 C 22 5, 25 3, 24 1" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* Brick chimney */}
      <rect x="21" y="8" width="4" height="6" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      {/* Snow-covered gabled roof */}
      <polygon points="18,5 4,16 32,16" fill="#FFFDF6" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Whitewashed cottage wall */}
      <rect x="7" y="16" width="22" height="15" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Blue wooden window with warm yellow light */}
      <rect x="11" y="19" width="6" height="6" fill="#FDE047" stroke="#3A76A8" strokeWidth="1.8" />
      <line x1="14" y1="19" x2="14" y2="25" stroke="#3A76A8" strokeWidth="1.4" />
      <line x1="11" y1="22" x2="17" y2="22" stroke="#3A76A8" strokeWidth="1.4" />
      {/* Wooden cottage door */}
      <rect x="21" y="21" width="5" height="10" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Village church spire (⛪ / church)
 */
export const LadaChurchSpireIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Venkovský kostelíček" {...props}>
    <g className="lada-anim-float">
      {/* Spire cross */}
      <line x1="18" y1="3" x2="18" y2="9" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="5" x2="20" y2="5" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      {/* Shingled pyramid spire */}
      <polygon points="18,8 11,20 25,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Belfry tower */}
      <rect x="12" y="20" width="12" height="13" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Belfry arched louver window */}
      <path d="M 16 26 C 16 23, 20 23, 20 26 L 20 30 L 16 30 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 8-point gold folk starburst (✨ / 🌟 / ✦ / star / sparkle)
 */
export const LadaStarGlintIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lidová hvězdička" {...props}>
    <g className="lada-anim-glint">
      <path
        d="M 18 3 L 21 13 L 31 10 L 23 18 L 31 26 L 21 23 L 18 33 L 15 23 L 5 26 L 13 18 L 5 10 L 15 13 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="2.5" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * Four-leaf green clover (🍀 / clover / luck / stesti)
 */
export const LadaFourLeafCloverIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Čtyřlístek pro štěstí" {...props}>
    <g className="lada-anim-float">
      {/* Stem */}
      <path d="M 18 18 C 17 26, 12 31, 8 32" fill="none" stroke="#1A1612" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M 18 18 C 17 26, 12 31, 8 32" fill="none" stroke="#4D7C0F" strokeWidth="1.8" strokeLinecap="round" />
      {/* 4 heart-shaped leaves */}
      <g fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.8">
        <path d="M 18 18 C 14 13, 10 7, 14 5 C 18 5, 18 10, 18 18 C 18 10, 18 5, 22 5 C 26 7, 22 13, 18 18" />
        <path d="M 18 18 C 13 14, 7 10, 5 14 C 5 18, 10 18, 18 18 C 10 18, 5 18, 5 22 C 7 26, 13 22, 18 18" />
        <path d="M 18 18 C 23 14, 29 10, 31 14 C 31 18, 26 18, 18 18 C 26 18, 31 18, 31 22 C 29 26, 23 22, 18 18" />
        <path d="M 18 18 C 14 23, 10 29, 14 31 C 18 31, 18 26, 18 18 C 18 26, 18 31, 22 31 C 26 29, 22 23, 18 18" />
      </g>
      {/* Dewdrop sparkle */}
      <circle cx="21" cy="9" r="1.2" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Orient pineapple (🍍 / pineapple / ananas)
 */
export const LadaPineappleIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Orientální ananas" {...props}>
    <g className="lada-anim-rock">
      {/* Green spiky crown */}
      <path
        d="M 18 14 L 14 6 L 17 8 L 18 2 L 19 8 L 22 6 L 18 14"
        fill="#4D7C0F"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Pineapple body with diamond lattice */}
      <ellipse cx="18" cy="22" rx="9" ry="11" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="12" y1="16" x2="24" y2="28" stroke="#8C5A35" strokeWidth="1.8" />
      <line x1="24" y1="16" x2="12" y2="28" stroke="#8C5A35" strokeWidth="1.8" />
      <line x1="10" y1="22" x2="26" y2="22" stroke="#8C5A35" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Roasted hearth potato (🥔 / potato / horky_brambor)
 */
export const LadaRoastedPotatoIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pečený brambor" {...props}>
    <path d="M 14 10 C 13 6, 16 4, 15 2" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <path d="M 22 11 C 23 7, 20 5, 22 3" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-2" />
    <g className="lada-anim-float">
      <ellipse cx="18" cy="23" rx="13" ry="8.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Hearth ash marks and potato eyes */}
      <circle cx="13" cy="21" r="1.2" fill="#2A170A" />
      <circle cx="21" cy="24" r="1.2" fill="#2A170A" />
      <circle cx="24" cy="20" r="1" fill="#2A170A" />
      {/* Hot cracked yellow crumb */}
      <path d="M 14 23 C 17 21, 19 25, 22 23" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Village grandmother in polka-dot kerchief (👵 / granny)
 */
export const LadaGrannyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Babička v šátku" {...props}>
    <g className="lada-anim-float">
      {/* Red folk kerchief with tied knot */}
      <path
        d="M 9 20 C 7 11, 29 11, 27 20 C 27 28, 22 31, 18 31 C 14 31, 9 28, 9 20 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* White face oval */}
      <ellipse cx="18" cy="19" rx="6.5" ry="7" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Smiling eyes and kind smile */}
      <path d="M 14 17 C 15 15, 17 15, 17 17" fill="none" stroke="#1A1612" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 19 17 C 20 15, 22 15, 22 17" fill="none" stroke="#1A1612" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 16 22 C 17 24, 19 24, 20 22" fill="none" stroke="#C83E31" strokeWidth="1.6" strokeLinecap="round" />
      {/* Polka dots on kerchief */}
      <circle cx="10" cy="15" r="1" fill="#FFFDF6" />
      <circle cx="26" cy="15" r="1" fill="#FFFDF6" />
      <circle cx="18" cy="10" r="1.1" fill="#FFFDF6" />
      <circle cx="12" cy="27" r="1" fill="#FFFDF6" />
      <circle cx="24" cy="27" r="1" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Wise grandfather in sheepskin cap (🧓 / grandpa / dedecek)
 */
export const LadaGrandpaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dědeček v beranici" {...props}>
    {/* Pipe smoke wisp */}
    <path d="M 27 22 C 28 19, 26 16, 28 14" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* Sheepskin fur cap (beranice) */}
      <path
        d="M 9 16 C 9 9, 27 9, 27 16 L 28 19 L 8 19 Z"
        fill="#5E3A21"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Face */}
      <ellipse cx="18" cy="20" rx="6.5" ry="6.5" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="15" cy="18" r="1" fill="#1A1612" />
      <circle cx="21" cy="18" r="1" fill="#1A1612" />
      {/* Grey bushy beard */}
      <path
        d="M 12 21 C 12 28, 15 32, 18 32 C 21 32, 24 28, 24 21 Z"
        fill="#E8DCC2"
        stroke="#1A1612"
        strokeWidth="1.8"
      />
      {/* Wooden clay pipe */}
      <line x1="20" y1="23" x2="26" y2="24" stroke="#8C5A35" strokeWidth="2" strokeLinecap="round" />
      <rect x="25" y="21" width="3" height="4" rx="0.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Village Čert with horns (👹 / devil / cert)
 */
export const LadaDevilIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský čertík" {...props}>
    <g className="lada-anim-flicker">
      {/* Black furry head */}
      <circle cx="18" cy="20" r="10" fill="#2A170A" stroke="#1A1612" strokeWidth="2.4" />
      {/* Red horns */}
      <path d="M 12 14 C 11 8, 8 7, 7 8 C 8 12, 11 15, 12 14" fill="#C83E31" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 24 14 C 25 8, 28 7, 29 8 C 28 12, 25 15, 24 14" fill="#C83E31" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Glowing yellow devil eyes */}
      <circle cx="14" cy="18" r="2.2" fill="#FDE047" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="22" cy="18" r="2.2" fill="#FDE047" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="14" cy="18" r="1" fill="#1A1612" />
      <circle cx="22" cy="18" r="1" fill="#1A1612" />
      {/* Playful red tongue sticking out */}
      <path d="M 16 24 C 16 29, 20 29, 20 24 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Mill pond wave & ripple (🌊 / water / wave)
 */
export const LadaWaterWaveIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vodnická vlnka" {...props}>
    <g className="lada-anim-rock">
      {/* Primary crest */}
      <path
        d="M 5 26 C 9 26, 12 21, 16 21 C 21 21, 23 27, 28 27 C 32 27, 33 24, 33 24 C 33 24, 30 31, 23 31 C 18 31, 16 26, 12 26 C 8 26, 6 29, 5 29 Z"
        fill="#3A76A8"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Curling upper crest */}
      <path
        d="M 12 18 C 17 18, 20 12, 26 12 C 30 12, 32 15, 30 18 C 27 18, 25 15, 23 15 C 19 15, 17 21, 12 21 Z"
        fill="#38BDF8"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* White foam crest */}
      <circle cx="29" cy="14" r="2.2" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="26" cy="13" r="1.5" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Forest animal paw print in snow (🐾 / paw)
 */
export const LadaPawPrintIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Stopa ve sněhu" {...props}>
    <g className="lada-anim-pulse" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8">
      {/* Main pad */}
      <ellipse cx="18" cy="23" rx="6.5" ry="5.5" />
      {/* 4 toe pads */}
      <ellipse cx="10" cy="15" rx="2.2" ry="3.2" transform="rotate(-25 10 15)" />
      <ellipse cx="15" cy="11" rx="2.4" ry="3.5" transform="rotate(-10 15 11)" />
      <ellipse cx="21" cy="11" rx="2.4" ry="3.5" transform="rotate(10 21 11)" />
      <ellipse cx="26" cy="15" rx="2.2" ry="3.2" transform="rotate(25 26 15)" />
    </g>
  </svg>
);

/**
 * Village white goose (🪿 / goose)
 */
export const LadaVillageGooseIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Bílá husa" {...props}>
    <g className="lada-anim-step">
      {/* Plump goose body & long neck */}
      <path
        d="M 9 12 C 9 9, 12 7, 14 7 C 16 7, 18 9, 17 14 L 16 20 C 14 20, 10 22, 10 26 C 10 30, 16 31, 23 31 C 29 31, 31 27, 31 23 C 31 20, 27 19, 22 19 L 21 14 C 21 8, 17 5, 13 5 C 9 5, 6 9, 6 13 Z"
        fill="#FFFDF6"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Orange bill */}
      <polygon points="6,9 1,11 6,13" fill="#D97706" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="11" cy="8.5" r="1.1" fill="#1A1612" />
      {/* Webbed orange feet */}
      <line x1="16" y1="31" x2="16" y2="34" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="22" y1="31" x2="22" y2="34" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Snow-laden spruce pine tree (🌲 / pine)
 */
export const LadaSpruceTreeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zasněžený smrček" {...props}>
    <g className="lada-anim-rock">
      {/* Trunk */}
      <rect x="16" y="27" width="4" height="6" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" />
      {/* Tier 3 (bottom) */}
      <polygon points="18,17 7,28 29,28" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 9 27 C 13 25, 23 25, 27 27 L 29 28 L 7 28 Z" fill="#FFFDF6" />
      {/* Tier 2 (middle) */}
      <polygon points="18,10 9,20 27,20" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 11 19 C 14 18, 22 18, 25 19 L 27 20 L 9 20 Z" fill="#FFFDF6" />
      {/* Tier 1 (top) */}
      <polygon points="18,3 12,12 24,12" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 18,3 L 13,11 C 15,10, 21,10, 23,11 Z" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Woolly folk sheep (🐑 / sheep)
 */
export const LadaFolkSheepIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Beránek" {...props}>
    <g className="lada-anim-float">
      {/* Fluffy wool cloud body */}
      <path
        d="M 13 14 C 11 11, 15 8, 18 9 C 21 7, 26 9, 26 13 C 29 13, 31 16, 30 20 C 31 24, 28 27, 24 27 C 22 29, 17 29, 14 27 C 10 27, 8 23, 9 19 C 7 16, 10 13, 13 14 Z"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Dark head and ears */}
      <ellipse cx="10" cy="18" rx="4" ry="4.5" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="9" cy="17" r="0.9" fill="#FAF5E8" />
      {/* Wooden bell collar */}
      <circle cx="13" cy="22" r="1.8" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
      {/* Sturdy black legs */}
      <line x1="14" y1="27" x2="14" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="18" y1="27" x2="18" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="22" y1="27" x2="22" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="26" y1="27" x2="26" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Sturdy farm ox (🐂 / ox)
 */
export const LadaFarmOxIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vesnický vůl" {...props}>
    <g className="lada-anim-float">
      {/* Ox body */}
      <path
        d="M 11 16 L 27 16 C 30 16, 31 20, 31 25 L 30 27 L 11 27 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Massive head */}
      <path d="M 7 14 L 14 14 L 13 23 L 6 22 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Curved horns */}
      <path d="M 8 14 C 6 10, 6 6, 9 5 C 10 8, 9 12, 10 14" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 12 14 C 13 10, 14 6, 17 5 C 16 8, 14 12, 13 14" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Legs */}
      <line x1="10" y1="26" x2="10" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="26" x2="14" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="26" x2="26" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="26" x2="29" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Mill pond frog (🐸 / frog)
 */
export const LadaPondFrogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vodnická žabka" {...props}>
    <g className="lada-anim-pulse">
      {/* Plump green body */}
      <ellipse cx="18" cy="22" rx="10" ry="8" fill="#4D7C0F" stroke="#1A1612" strokeWidth="2.4" />
      {/* Big yellow eyes */}
      <circle cx="12" cy="13" r="4" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="24" cy="13" r="4" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="12" cy="13" r="1.8" fill="#1A1612" />
      <circle cx="24" cy="13" r="1.8" fill="#1A1612" />
      {/* Wide smiling frog mouth */}
      <path d="M 12 23 C 15 26, 21 26, 24 23" fill="none" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
      {/* Webbed feet */}
      <path d="M 8 28 L 4 31 M 28 28 L 32 31" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Fairground mirror (🪞 / mirror)
 */
export const LadaFairgroundMirrorIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pouťové zrcátko" {...props}>
    <g className="lada-anim-float">
      {/* Turned handle */}
      <line x1="18" y1="27" x2="18" y2="34" stroke="#1A1612" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="18" y1="27" x2="18" y2="34" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Ornate carved frame */}
      <circle cx="18" cy="15" r="11" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      {/* Shiny glass */}
      <circle cx="18" cy="15" r="8" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="15" cy="12" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Coiled hemp rope (🪢 / rope)
 */
export const LadaHempRopeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Konopný uzel" {...props}>
    <g className="lada-anim-rock">
      {/* Rope knot loops */}
      <circle cx="14" cy="16" r="6" fill="none" stroke="#1A1612" strokeWidth="4.2" />
      <circle cx="14" cy="16" r="6" fill="none" stroke="#D9A036" strokeWidth="2.6" />
      <circle cx="22" cy="16" r="6" fill="none" stroke="#1A1612" strokeWidth="4.2" />
      <circle cx="22" cy="16" r="6" fill="none" stroke="#D9A036" strokeWidth="2.6" />
      {/* Loose ends */}
      <line x1="9" y1="22" x2="7" y2="30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="7" y2="30" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="27" y1="22" x2="29" y2="30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="27" y1="22" x2="29" y2="30" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Granite & red brick fortress wall (🧱 / wall)
 */
export const LadaStoneWallIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kamenná zídka" {...props}>
    <g className="lada-anim-float">
      {/* Wall base */}
      <rect x="5" y="9" width="26" height="20" rx="1.5" fill="#C83E31" stroke="#1A1612" strokeWidth="2.4" />
      {/* Mortar joints */}
      <line x1="5" y1="15" x2="31" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="5" y1="22" x2="31" y2="22" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="14" y1="9" x2="14" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="23" y1="9" x2="23" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="18" y1="15" x2="18" y2="22" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="10" y1="22" x2="10" y2="29" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="22" y1="22" x2="22" y2="29" stroke="#FAF5E8" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Clay honey pot (🍯 / honey)
 */
export const LadaHoneyPotIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hrnec medu" {...props}>
    <g className="lada-anim-float">
      {/* Clay jar body */}
      <path
        d="M 11 14 C 7 17, 7 28, 12 30 C 14 31, 22 31, 24 30 C 29 28, 29 17, 25 14 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Rim collar */}
      <ellipse cx="18" cy="13" rx="7" ry="2.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      {/* Dripping golden honey */}
      <path
        d="M 14 13 C 14 17, 16 19, 17 21 C 18 22, 19 21, 19 18 C 21 20, 22 17, 22 13 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="1.6"
      />
      <circle cx="17.5" cy="19.5" r="0.9" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Knitted woolen sock (🧦 / sock)
 */
export const LadaWoolSockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pletená ponožka" {...props}>
    <g className="lada-anim-rock">
      {/* Sock contour */}
      <path
        d="M 13 6 L 23 6 L 23 18 C 23 20, 27 23, 29 26 C 29 29, 26 31, 22 30 L 14 26 C 11 24, 13 18, 13 18 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Cream wool cuff and stripes */}
      <rect x="13" y="6" width="10" height="3" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="13" y1="13" x2="23" y2="13" stroke="#FAF5E8" strokeWidth="2" />
      <line x1="13" y1="16" x2="23" y2="16" stroke="#FAF5E8" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * Carved bone dice (🎲 / dice)
 */
export const LadaBoneDiceIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hrací kostka" {...props}>
    <g className="lada-anim-rock">
      {/* Isometric cube faces */}
      <polygon points="18,5 29,11 18,17 7,11" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      <polygon points="7,11 18,17 18,31 7,24" fill="#E8DCC2" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      <polygon points="18,17 29,11 29,24 18,31" fill="#D4CBBA" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Carved dots */}
      <circle cx="18" cy="11" r="1.3" fill="#C83E31" />
      <circle cx="12" cy="21" r="1.2" fill="#1A1612" />
      <circle cx="15" cy="24" r="1.2" fill="#1A1612" />
      <circle cx="23" cy="21" r="1.2" fill="#1A1612" />
      <circle cx="25" cy="25" r="1.2" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Folk painted warning sign (⚠️ / ⚠ / 🚨 / warning)
 */
export const LadaWarningSignIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Výstražná tabulka" {...props}>
    <g className="lada-anim-shiver">
      {/* Triangular painted village sign */}
      <polygon
        points="18,4 32,29 4,29"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Red inner border */}
      <polygon points="18,8 28,26 8,26" fill="none" stroke="#C83E31" strokeWidth="2.8" strokeLinejoin="round" />
      {/* Bold exclamation mark */}
      <line x1="18" y1="13" x2="18" y2="20" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="24" r="1.5" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Embroidered folk checkmark (✅ / ✓ / check)
 */
export const LadaCheckmarkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Splněno" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 8 18 L 15 25 L 28 9"
        fill="none"
        stroke="#1A1612"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 8 18 L 15 25 L 28 9"
        fill="none"
        stroke="#4D7C0F"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

/**
 * Crossed birch sticks (❌ / ✕ / 🛑 / cancel)
 */
export const LadaCrossCancelIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zrušit" {...props}>
    <g className="lada-anim-rock">
      <line x1="8" y1="8" x2="28" y2="28" stroke="#1A1612" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="8" y1="8" x2="28" y2="28" stroke="#C83E31" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="28" y1="8" x2="8" y2="28" stroke="#1A1612" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="28" y1="8" x2="8" y2="28" stroke="#C83E31" strokeWidth="2.8" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Carved wooden direction pointer (➔ / → / arrow)
 */
export const LadaTavernArrowIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ukazatel cesty" {...props}>
    <g className="lada-anim-float">
      {/* Pointing tavern finger sign */}
      <path
        d="M 6 15 L 20 15 L 20 10 L 31 18 L 20 26 L 20 21 L 6 21 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18" r="1.3" fill="#2A170A" />
    </g>
  </svg>
);

/**
 * Hand-inked question mark on parchment (❓ / question)
 */
export const LadaQuestionMarkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Otazník" {...props}>
    <g className="lada-anim-float">
      <circle cx="18" cy="18" r="14" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" />
      <path
        d="M 13 13 C 13 9, 23 9, 23 15 C 23 19, 18 19, 18 23"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="27" r="1.8" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Glowing tallow lantern / inspiration spark (💡 / hint / idea)
 */
export const LadaLanternSparkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ponocenská lucerna" {...props}>
    <g className="lada-anim-flicker">
      {/* Hanging ring */}
      <circle cx="18" cy="6" r="3" fill="none" stroke="#1A1612" strokeWidth="2" />
      {/* Lantern cap */}
      <polygon points="18,8 10,13 26,13" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Glass case with glowing flame */}
      <rect x="11" y="13" width="14" height="15" fill="#FEF08A" stroke="#1A1612" strokeWidth="2.2" />
      <path d="M 18 16 C 18 16, 15 19, 15 22 C 15 24, 16 25, 18 25 C 20 25, 21 24, 21 22 C 21 19, 18 16, 18 16 Z" fill="#F59E0B" />
      {/* Base */}
      <rect x="9" y="28" width="18" height="3" fill="#2A170A" stroke="#1A1612" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * Folded realm parchment map (🗺️ / map)
 */
export const LadaFoldedMapIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovská mapa" {...props}>
    <g className="lada-anim-float">
      {/* 3 pleated accordion folds */}
      <polygon points="6,9 14,6 14,27 6,30" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="14,6 22,9 22,30 14,27" fill="#E8DCC2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="22,9 30,6 30,27 22,30" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* River line and mountain symbol */}
      <path d="M 8 20 C 12 18, 17 21, 28 17" fill="none" stroke="#3A76A8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 16 14 L 18 10 L 20 14" fill="none" stroke="#8C5A35" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Leather hunting knapsack (🎒 / 🧳 / bag)
 */
export const LadaKnapsackIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecká brašna" {...props}>
    <g className="lada-anim-rock">
      {/* Bag body */}
      <rect x="8" y="14" width="20" height="17" rx="3" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Flap cover */}
      <path d="M 7 14 C 7 14, 18 24, 29 14 L 28 11 L 8 11 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Buckle */}
      <rect x="16.5" y="19" width="3" height="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Wooden village crate (📦 / crate / box)
 */
export const LadaStorageCrateIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dřevěná bedýnka" {...props}>
    <g className="lada-anim-float">
      <rect x="6" y="10" width="24" height="20" rx="1.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="6" y1="10" x2="30" y2="30" stroke="#5E3A21" strokeWidth="2" />
      <line x1="30" y1="10" x2="6" y2="30" stroke="#5E3A21" strokeWidth="2" />
      <rect x="6" y="10" width="24" height="20" fill="none" stroke="#2A170A" strokeWidth="2.4" />
    </g>
  </svg>
);

/**
 * Glazed village ceramic jug (🏺 / jug / urn)
 */
export const LadaClayAmphoraIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Keramický džbán" {...props}>
    <g className="lada-anim-rock">
      {/* Loop handle */}
      <path d="M 23 13 C 29 13, 29 23, 22 25" fill="none" stroke="#1A1612" strokeWidth="2.6" strokeLinecap="round" />
      {/* Jug body */}
      <path
        d="M 13 8 L 23 8 L 21 14 C 26 17, 26 27, 21 30 L 15 30 C 10 27, 10 17, 15 14 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Painted floral band */}
      <line x1="12" y1="21" x2="24" y2="21" stroke="#3A76A8" strokeWidth="2.2" />
    </g>
  </svg>
);

/**
 * Brass pocket compass (🧭 / compass)
 */
export const LadaCompassIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mosazný kompas" {...props}>
    <g className="lada-anim-rock">
      {/* Case ring */}
      <circle cx="18" cy="18" r="13" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <circle cx="18" cy="18" r="10" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Blued & red compass needle */}
      <polygon points="18,10 15,18 18,16" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,10 21,18 18,16" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,26 15,18 18,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,26 21,18 18,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="1.5" fill="#2A170A" />
    </g>
  </svg>
);

/**
 * Turning watermill paddle wheel (🔄 / refresh)
 */
export const LadaWatermillTurnIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Otáčení" {...props}>
    <g className="lada-anim-cog">
      <circle cx="18" cy="18" r="11" fill="none" stroke="#8C5A35" strokeWidth="3" />
      <line x1="18" y1="7" x2="18" y2="29" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="7" y1="18" x2="29" y2="18" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="10" y1="10" x2="26" y2="26" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="10" y1="26" x2="26" y2="10" stroke="#1A1612" strokeWidth="2.2" />
      {/* 2 circular arrows */}
      <path d="M 28 14 C 29 18, 27 24, 22 28" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Iron ash bucket with broom (🗑️ / 🗑 / trash / delete)
 */
export const LadaAshBucketIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kbelík s popelem" {...props}>
    <g className="lada-anim-rock">
      {/* Broom sticking out */}
      <line x1="12" y1="6" x2="20" y2="20" stroke="#8C5A35" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bucket body */}
      <path
        d="M 10 15 L 26 15 L 24 30 C 24 31, 23 32, 21 32 L 15 32 C 13 32, 12 31, 12 30 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Iron handle arc */}
      <path d="M 8 15 C 8 8, 28 8, 28 15" fill="none" stroke="#1A1612" strokeWidth="2.2" />
    </g>
  </svg>
);

/**
 * Village blacksmith balance beam (⚖️ / scales)
 */
export const LadaBalanceScalesIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářské váhy" {...props}>
    <g className="lada-anim-rock">
      {/* Center column & base */}
      <line x1="18" y1="7" x2="18" y2="30" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 12 30 L 24 30 L 25 33 L 11 33 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Horizontal beam */}
      <line x1="6" y1="12" x2="30" y2="12" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      {/* Left pan */}
      <line x1="8" y1="12" x2="5" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <line x1="8" y1="12" x2="11" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 4 22 C 4 25, 12 25, 12 22 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      {/* Right pan */}
      <line x1="28" y1="12" x2="25" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <line x1="28" y1="12" x2="31" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 24 22 C 24 25, 32 25, 32 22 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Josef Lada painter's palette (🎨 / palette / art)
 */
export const LadaPainterPaletteIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malířská paleta" {...props}>
    <g className="lada-anim-float">
      {/* Kidney wooden palette */}
      <path
        d="M 18 5 C 27 5, 32 12, 30 20 C 29 25, 23 27, 24 30 C 24 33, 19 32, 16 32 C 8 32, 4 25, 4 18 C 4 10, 11 5, 18 5 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Thumb hole */}
      <ellipse cx="23" cy="24" rx="2.5" ry="3.5" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Gouache paint dollops */}
      <circle cx="11" cy="11" r="2.2" fill="#C83E31" />
      <circle cx="17" cy="9" r="2.2" fill="#D9A036" />
      <circle cx="23" cy="11" r="2.2" fill="#3A76A8" />
      <circle cx="10" cy="17" r="2.2" fill="#4D7C0F" />
      <circle cx="9" cy="23" r="2" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Flask of Moravian slivovitz (🧪 / flask / potion)
 */
export const LadaSlivovitzFlaskIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Slivovice" {...props}>
    <g className="lada-anim-float">
      {/* Cork stopper */}
      <rect x="15" y="4" width="6" height="4" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.8" />
      {/* Bottle neck and flask belly */}
      <path
        d="M 14 8 L 22 8 L 22 13 L 28 25 C 30 29, 27 32, 23 32 L 13 32 C 9 32, 6 29, 8 25 L 14 13 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Glowing amber slivovitz liquid */}
      <path d="M 11 20 L 25 20 L 27 27 C 27 30, 24 31, 22 31 L 14 31 C 12 31, 9 30, 9 27 Z" fill="#D9A036" />
      <circle cx="18" cy="24" r="1.5" fill="#FEF08A" className="lada-anim-foam" />
    </g>
  </svg>
);

/**
 * Folk puppet theatre booth (🎬 / theatre)
 */
export const LadaPuppetBoothIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Loutkové divadélko" {...props}>
    <g className="lada-anim-float">
      {/* Wooden arch frame */}
      <rect x="5" y="6" width="26" height="25" rx="2" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Inner stage opening */}
      <rect x="9" y="12" width="18" height="15" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Draped red velvet curtains */}
      <path d="M 9 12 C 14 12, 13 22, 9 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 27 12 C 22 12, 23 22, 27 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 9 12 C 14 16, 22 16, 27 12 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Carved shepherd's willow flute (🪈 / pastyrska_pistala)
 */
export const LadaShepherdsPipeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pastýřská píšťalka" {...props}>
    <g className="lada-anim-rock">
      {/* Willow whistle tube */}
      <line x1="6" y1="30" x2="28" y2="8" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="6" y1="30" x2="28" y2="8" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      {/* Tone holes */}
      <circle cx="13" cy="23" r="1.1" fill="#1A1612" />
      <circle cx="17" cy="19" r="1.1" fill="#1A1612" />
      <circle cx="21" cy="15" r="1.1" fill="#1A1612" />
      {/* Beveled labium mouth */}
      <rect x="25" y="7" width="2" height="3" fill="#8C5A35" />
    </g>
  </svg>
);

/**
 * Smoked Prague ham on the bone (🍖 / 🥩 / meat)
 */
export const LadaSmokedHamIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Uzená kýta" {...props}>
    <path d="M 18 10 C 17 6, 20 4, 19 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* White bone end */}
      <line x1="7" y1="29" x2="14" y2="22" stroke="#FAF5E8" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="6" cy="30" r="2" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.5" />
      {/* Big smoked ham joint */}
      <ellipse cx="22" cy="18" rx="8.5" ry="6.5" transform="rotate(-30 22 18)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Tender pink cut face */}
      <ellipse cx="25" cy="16" rx="5" ry="4" transform="rotate(-30 25 16)" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      <circle cx="25" cy="16" r="1.5" fill="#FAF5E8" />
    </g>
  </svg>
);

/**
 * Curious field mouse Rézinka (🐭 / mouse / rezinka)
 */
export const LadaMouseIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Myška Rézinka" {...props}>
    <g className="lada-anim-rock">
      {/* Curled pinkish tail */}
      <path d="M 6 25 C 4 23, 3 17, 7 14 C 9 12, 10 15, 8 18 C 7 20, 9 22, 12 23" fill="none" stroke="#DCA884" strokeWidth="2" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="19" cy="22" rx="9" ry="7" fill="#8C7355" stroke="#1A1612" strokeWidth="2.4" />
      {/* Pale belly patch */}
      <ellipse cx="21" cy="24" rx="5" ry="3.5" fill="#FAF5E8" />
      {/* Left back ear */}
      <circle cx="17" cy="11" r="4.2" fill="#8C7355" stroke="#1A1612" strokeWidth="2" />
      <circle cx="17" cy="11" r="2.2" fill="#E8A598" />
      {/* Head */}
      <ellipse cx="24" cy="17" rx="6.5" ry="5.5" transform="rotate(10 24 17)" fill="#9C8365" stroke="#1A1612" strokeWidth="2.4" />
      {/* Right front ear */}
      <circle cx="23" cy="10" r="4.5" fill="#9C8365" stroke="#1A1612" strokeWidth="2.2" />
      <circle cx="23" cy="10" r="2.4" fill="#E8A598" />
      {/* Tiny black bead eye with shine */}
      <circle cx="26" cy="15" r="1.6" fill="#1A1612" />
      <circle cx="26.5" cy="14.5" r="0.6" fill="#FAF5E8" />
      {/* Cute pink snout / nose */}
      <circle cx="29.5" cy="19" r="1.5" fill="#E8A598" stroke="#1A1612" strokeWidth="1.2" />
      {/* Whiskers */}
      <line x1="28" y1="18" x2="34" y2="16" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="19.5" x2="35" y2="20" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="21" x2="33" y2="23.5" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      {/* Little paws holding crumb */}
      <ellipse cx="24" cy="24" rx="2" ry="1.4" fill="#E8A598" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="26" cy="24.5" r="1.2" fill="#D9A036" stroke="#1A1612" strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * Heavy blacksmith forge hammer (🔨 / hammer / kladivo)
 */
export const LadaHammerIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářské kladivo" {...props}>
    <g className="lada-anim-rock">
      {/* Wooden ash handle */}
      <path
        d="M 10 28 L 22 14"
        stroke="#8C5A35"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M 10 28 L 22 14"
        stroke="#D9A036"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Forged iron hammer head */}
      <polygon
        points="17,10 26,4 31,10 22,17"
        fill="#374151"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Striking face */}
      <line x1="26" y1="4" x2="31" y2="10" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" />
      {/* Eye rivet / wedge */}
      <circle cx="22" cy="12" r="1.6" fill="#1A1612" />
      <circle cx="22" cy="12" r="0.7" fill="#F3E9D2" />
    </g>
  </svg>
);

/**
 * Three-tined forged blacksmith pitchfork (🔱 / pitchfork / vidle)
 */
export const LadaPitchforkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kované vidle" {...props}>
    <g className="lada-anim-rock">
      {/* Wooden handle */}
      <line x1="8" y1="30" x2="20" y2="18" stroke="#8C5A35" strokeWidth="3.6" strokeLinecap="round" />
      <line x1="8" y1="30" x2="20" y2="18" stroke="#D9A036" strokeWidth="2.0" strokeLinecap="round" />
      {/* Iron socket */}
      <ellipse cx="20" cy="18" rx="2.5" ry="3.5" transform="rotate(-45 20 18)" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Central prong */}
      <path d="M 20 18 L 29 9" stroke="#1A1612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 20 18 L 29 9" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
      {/* Left curved tine */}
      <path d="M 18 19 C 19 14, 22 9, 26 4" fill="none" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 18 19 C 19 14, 22 9, 26 4" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Right curved tine */}
      <path d="M 21 17 C 26 17, 31 19, 34 14" fill="none" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 21 17 C 26 17, 31 19, 34 14" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Threshing flail & golden wheat sheaf (🌾 / flail / cep / obili)
 */
export const LadaGrainFlailIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dřevěný cep a snop" {...props}>
    <g className="lada-anim-rock">
      {/* Golden wheat ear backdrop */}
      <path d="M 12 32 Q 20 22 28 8" fill="none" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
      {/* Wheat grains */}
      <ellipse cx="27" cy="9" rx="3" ry="1.5" transform="rotate(-30 27 9)" fill="#F59E0B" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="23" cy="12" rx="3" ry="1.5" transform="rotate(35 23 12)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="25" cy="15" rx="3" ry="1.5" transform="rotate(-25 25 15)" fill="#F59E0B" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="20" cy="18" rx="3" ry="1.5" transform="rotate(30 20 18)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="22" cy="22" rx="3" ry="1.5" transform="rotate(-20 22 22)" fill="#F59E0B" stroke="#1A1612" strokeWidth="1.2" />
      {/* Wooden flail staff */}
      <line x1="6" y1="28" x2="16" y2="14" stroke="#1A1612" strokeWidth="3.8" strokeLinecap="round" />
      <line x1="6" y1="28" x2="16" y2="14" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Swivel leather hinge */}
      <circle cx="16" cy="14" r="2.2" fill="#2A170A" stroke="#1A1612" strokeWidth="1.2" />
      {/* Swinging threshing beater rod */}
      <line x1="16" y1="14" x2="28" y2="19" stroke="#1A1612" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="16" y1="14" x2="28" y2="19" stroke="#D9A036" strokeWidth="2.8" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Busy bumblebee & honeybee swarm with straw skep (🐝 / bees / vcely / roj)
 */
export const LadaBeeSwarmIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Včelí roj" {...props}>
    {/* Straw beehive skep */}
    <path
      d="M 10 30 C 9 20, 13 14, 18 14 C 23 14, 27 20, 26 30 Z"
      fill="#D9A036"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path d="M 11 25 Q 18 27 25 25" fill="none" stroke="#8C5A35" strokeWidth="1.6" />
    <path d="M 12 20 Q 18 22 24 20" fill="none" stroke="#8C5A35" strokeWidth="1.6" />
    {/* Entrance flight hole */}
    <ellipse cx="18" cy="27" rx="2.5" ry="1.8" fill="#1A1612" />
    {/* Bee 1 (flying right) */}
    <g className="lada-anim-float">
      <ellipse cx="25" cy="10" rx="3.5" ry="2.2" transform="rotate(-15 25 10)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.4" />
      <line x1="24" y1="8.5" x2="24" y2="11.5" stroke="#1A1612" strokeWidth="1.2" />
      <line x1="26" y1="9" x2="26" y2="12" stroke="#1A1612" strokeWidth="1.2" />
      {/* Gossamer wings */}
      <ellipse cx="24" cy="6" rx="2" ry="3" transform="rotate(20 24 6)" fill="#E0F2FE" opacity="0.85" stroke="#1A1612" strokeWidth="1" />
    </g>
    {/* Bee 2 (flying left) */}
    <g className="lada-anim-rock">
      <ellipse cx="9" cy="12" rx="3" ry="2" transform="rotate(20 9 12)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.4" />
      <line x1="9" y1="10.5" x2="9" y2="13.5" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="10" cy="8.5" rx="1.8" ry="2.6" transform="rotate(-20 10 8.5)" fill="#E0F2FE" opacity="0.85" stroke="#1A1612" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Ceramic soup bowl of steaming village garlic broth (🥣 / soup / polevka / miska)
 */
export const LadaSoupBowlIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hliněná miska s polévkou" {...props}>
    {/* Steam wisps */}
    <path d="M 14 10 C 13 8, 15 6, 14 4" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-float" />
    <path d="M 18 11 C 17 8, 20 6, 19 3" fill="none" stroke="#E5E7EB" strokeWidth="2.0" strokeLinecap="round" className="lada-anim-float" />
    <path d="M 23 10 C 22 8, 24 6, 23 4" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-float" />
    {/* Clay bowl body */}
    <path
      d="M 6 15 C 6 27, 13 31, 18 31 C 23 31, 30 27, 30 15 Z"
      fill="#C27D38"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Bowl foot */}
    <rect x="13" y="30" width="10" height="2.5" rx="1" fill="#8C4A1F" stroke="#1A1612" strokeWidth="1.8" />
    {/* Rim ellipse */}
    <ellipse cx="18" cy="15" rx="12" ry="4.5" fill="#8C4A1F" stroke="#1A1612" strokeWidth="2.4" />
    {/* Steaming golden broth interior */}
    <ellipse cx="18" cy="15" rx="10.5" ry="3.5" fill="#EAB308" stroke="#1A1612" strokeWidth="1.2" />
    {/* Floating herbs & croutons */}
    <circle cx="15" cy="14" r="1.2" fill="#15803D" />
    <circle cx="21" cy="16" r="1" fill="#15803D" />
    <rect x="17" y="14" width="2" height="2" fill="#78350F" />
    {/* Folk painted glaze stripe */}
    <path d="M 8 20 C 12 24, 24 24, 28 20" fill="none" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Shepherd's warm patched woollen coat (🧥 / coat / kabat / hubertus)
 */
export const LadaPatchedCoatIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Záplatovaný kabát" {...props}>
    {/* Coat body */}
    <path
      d="M 12 8 L 6 15 L 10 18 L 10 32 L 26 32 L 26 18 L 30 15 L 24 8 Z"
      fill="#475569"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Collar / lapels */}
    <polygon points="12,8 18,17 14,8" fill="#1E293B" stroke="#1A1612" strokeWidth="1.6" />
    <polygon points="24,8 18,17 22,8" fill="#1E293B" stroke="#1A1612" strokeWidth="1.6" />
    {/* Front center seam */}
    <line x1="18" y1="17" x2="18" y2="32" stroke="#1A1612" strokeWidth="2" />
    {/* Bone horn buttons */}
    <circle cx="16.5" cy="20" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    <circle cx="16.5" cy="24" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    <circle cx="16.5" cy="28" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    {/* Folk contrast patches */}
    <rect x="11" y="24" width="4" height="4" rx="0.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.4" />
    <line x1="11" y1="23.5" x2="15" y2="23.5" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="1 1" />
    <line x1="11" y1="28.5" x2="15" y2="28.5" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="1 1" />
    <rect x="21" y="19" width="3.5" height="3.5" rx="0.5" fill="#166534" stroke="#1A1612" strokeWidth="1.4" />
  </svg>
);

/**
 * Consecrated chalk with folk blessings (🖍️ / chalk / krida / K+M+B)
 */
export const LadaHolyChalkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Posvěcená křída" {...props}>
    {/* Tříkrálové křížky */}
    <g stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round">
      <line x1="8" y1="8" x2="8" y2="14" />
      <line x1="5" y1="11" x2="11" y2="11" />
      <line x1="28" y1="8" x2="28" y2="14" />
      <line x1="25" y1="11" x2="31" y2="11" />
    </g>
    {/* Chalk stick at angle */}
    <g transform="rotate(-35 18 20)">
      <rect x="15" y="8" width="6" height="20" rx="1.5" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.4" />
      {/* Chalk tip chamfer */}
      <polygon points="15,8 18,4 21,8" fill="#FDE68A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Shading stripe */}
      <line x1="16.5" y1="9" x2="16.5" y2="26" stroke="#E2E8F0" strokeWidth="1.4" />
    </g>
    {/* Folk cross drawn on bottom */}
    <g stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="26" x2="18" y2="34" />
      <line x1="14" y1="30" x2="22" y2="30" />
    </g>
  </svg>
);

/**
 * Freshly dug horseradish root with green leaves (🫚 / horseradish / kren / koren)
 */
export const LadaHorseradishRootIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pikantní křen" {...props}>
    {/* Green leafy tuft */}
    <path d="M 12 10 Q 7 5 9 2 Q 13 4 14 9" fill="#15803D" stroke="#1A1612" strokeWidth="1.6" />
    <path d="M 15 10 Q 15 2 18 1 Q 19 4 17 9" fill="#22C55E" stroke="#1A1612" strokeWidth="1.6" />
    <path d="M 17 10 Q 23 5 21 2 Q 18 5 16 9" fill="#15803D" stroke="#1A1612" strokeWidth="1.6" />
    {/* Root body tapering down */}
    <path
      d="M 12 9 C 14 8, 18 8, 20 9 C 21 16, 20 25, 17 33 C 15 25, 12 16, 12 9 Z"
      fill="#F5EDE0"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Earthy rings and ridges */}
    <path d="M 13 14 Q 16 16 19 14" fill="none" stroke="#A16207" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 14 19 Q 16 21 18 19" fill="none" stroke="#A16207" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 15 24 Q 16 26 18 24" fill="none" stroke="#A16207" strokeWidth="1.4" strokeLinecap="round" />
    {/* Little side rootlet */}
    <path d="M 19 22 Q 24 24 23 27" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 13 18 Q 9 20 10 24" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Traditional wooden Easter ratchet rattle (🪇 / rattle / rehtacka / klapacka)
 */
export const LadaRehtackaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Velikonoční řehtačka" {...props}>
    {/* Wooden handle */}
    <line x1="8" y1="32" x2="16" y2="20" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
    <line x1="8" y1="32" x2="16" y2="20" stroke="#8C5A35" strokeWidth="2.4" strokeLinecap="round" />
    {/* Cogwheel axle */}
    <circle cx="16" cy="20" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
    {/* Toothed gear cogwheel */}
    <circle cx="16" cy="20" r="5" fill="none" stroke="#1A1612" strokeWidth="2.2" strokeDasharray="3 2" />
    {/* Wooden rattle frame box */}
    <polygon
      points="16,20 28,12 32,18 20,26"
      fill="#B45309"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Springy wooden reed / blade */}
    <line x1="16" y1="20" x2="28" y2="12" stroke="#FEF3C7" strokeWidth="2.6" strokeLinecap="round" />
    <line x1="16" y1="20" x2="28" y2="12" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
    {/* Sound click sparks */}
    <path d="M 29 8 L 32 6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M 33 13 L 36 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Carved horn or bone coat button (🔘 / button / knoflik)
 */
export const LadaBoneButtonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kostěný knoflík" {...props}>
    {/* Outer button disc */}
    <circle cx="18" cy="18" r="14" fill="#E2D9C8" stroke="#1A1612" strokeWidth="2.6" />
    {/* Recessed inner ring */}
    <circle cx="18" cy="18" r="9.5" fill="#C5B8A5" stroke="#1A1612" strokeWidth="1.8" />
    {/* Four button stitch holes */}
    <circle cx="14" cy="14" r="1.6" fill="#1A1612" />
    <circle cx="22" cy="14" r="1.6" fill="#1A1612" />
    <circle cx="14" cy="22" r="1.6" fill="#1A1612" />
    <circle cx="22" cy="22" r="1.6" fill="#1A1612" />
    {/* Crossed thread sewing */}
    <line x1="14" y1="14" x2="22" y2="22" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="22" y1="14" x2="14" y2="22" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Folk girl Barunka with braided pigtails and red ribbon (👧 / barunka / devcatko)
 */
export const LadaBarunkaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Barunka s copy" {...props}>
    <g className="lada-anim-float">
      {/* Left braid */}
      <path d="M 10 18 Q 6 23 8 28" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="8" cy="28" r="2" fill="#DC2626" />
      {/* Right braid */}
      <path d="M 26 18 Q 30 23 28 28" fill="none" stroke="#78350F" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="28" cy="28" r="2" fill="#DC2626" />
      {/* Face oval */}
      <ellipse cx="18" cy="19" rx="7.5" ry="8" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.2" />
      {/* Hair cap */}
      <path
        d="M 10 17 C 10 10, 26 10, 26 17 C 23 14, 13 14, 10 17 Z"
        fill="#78350F"
        stroke="#1A1612"
        strokeWidth="2"
      />
      {/* Rosy cheeks */}
      <circle cx="14" cy="21" r="1.5" fill="#F87171" opacity="0.7" />
      <circle cx="22" cy="21" r="1.5" fill="#F87171" opacity="0.7" />
      {/* Kind bead eyes */}
      <circle cx="15" cy="18" r="1.3" fill="#1A1612" />
      <circle cx="21" cy="18" r="1.3" fill="#1A1612" />
      {/* Smiling mouth */}
      <path d="M 16 23 Q 18 25 20 23" fill="none" stroke="#DC2626" strokeWidth="1.6" strokeLinecap="round" />
      {/* Red hair ribbon on top */}
      <polygon points="18,10 15,7 18,9 21,7" fill="#DC2626" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);




