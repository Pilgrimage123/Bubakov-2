import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export type PekelnyPokladKind = 'pekeln_poklad_drobny' | 'pekeln_poklad_stribrny' | 'pekeln_poklad_zlaty';
interface Props { kind: PekelnyPokladKind; size?: string | number; className?: string; style?: React.CSSProperties; }

export const PekelnyPokladIcon: React.FC<Props> = ({ kind, size = 36, className = '', style = {} }) => {
  const px = typeof size === 'number' ? `${size}px` : size;
  if (kind === 'pekeln_poklad_drobny') {
    return (
      <LadaCanvasSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Pekelný měšec">
        <g className="lada-anim-rock">
          <path d="M22 8 Q30 15 42 8 L47 15 Q39 23 43 29 Q58 48 42 58 Q21 65 10 48 Q4 38 17 27 Q22 21 17 15 Z" fill="#9A5B2A" stroke="#3B1D12" strokeWidth="3"/>
          <path d="M19 16 Q31 21 44 15 M23 23 Q31 26 39 22" fill="none" stroke="#E6B86A" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="27" cy="36" rx="10" ry="8" fill="#D4A73B" stroke="#5B2118" strokeWidth="2"/>
          <ellipse cx="39" cy="42" rx="10" ry="8" fill="#F3D56D" stroke="#5B2118" strokeWidth="2"/>
          <path d="M27 30 v12 M22 36 h10 M39 36 v12 M34 42 h10" stroke="#8A5A16" strokeWidth="1.5"/>
          <path d="M11 21 l-5 -5 M49 28 l7 -6" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="43" cy="39" r="2" fill="#FEF08A" className="lada-anim-glint" />
        </g>
      </LadaCanvasSvg>
    );
  }
  if (kind === 'pekeln_poklad_stribrny') {
    return (
      <LadaCanvasSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Pekelný stříbrňák">
        <g className="lada-anim-rock">
          <path d="M18 8 L25 13 L32 7 L39 13 L47 8 L45 19 L53 24 L45 30 L47 40 L38 37 L32 45 L26 37 L17 40 L19 30 L11 24 L19 19 Z" fill="#CBD5E1" stroke="#334155" strokeWidth="2.5"/>
          <circle cx="32" cy="26" r="13" fill="#F1F5F9" stroke="#475569" strokeWidth="2"/>
          <path d="M24 23 Q24 16 30 17 L34 20 L38 17 Q43 19 40 24 L36 27 L40 31 Q35 37 31 31 L27 34 Q22 31 27 26 Z" fill="#64748B"/>
          <path d="M25 43 Q32 49 39 43" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="36" cy="22" r="2.2" fill="#FFFFFF" className="lada-anim-glint" />
        </g>
      </LadaCanvasSvg>
    );
  }
  return (
    <LadaCanvasSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Pekelný tolar z pekla">
      <g className="lada-anim-rock">
        <circle cx="32" cy="32" r="26" fill="#854D0E" stroke="#3B1D12" strokeWidth="3"/>
        <circle cx="32" cy="32" r="20" fill="#FACC15" stroke="#FEF3C7" strokeWidth="2"/>
        <path d="M19 22 L15 13 Q26 14 29 22 M45 22 L49 13 Q38 14 35 22" fill="#991B1B" stroke="#5B2118" strokeWidth="2.2" strokeLinejoin="round"/>
        <path d="M22 29 Q32 23 42 29 L39 41 Q32 47 25 41 Z" fill="#FDE68A" stroke="#92400E" strokeWidth="2"/>
        <path d="M27 32 l3 1 M35 32 l3 -1 M27 38 Q32 41 37 38" fill="none" stroke="#5B2118" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="38" cy="27" r="2.2" fill="#FFFFFF" className="lada-anim-glint" />
      </g>
    </LadaCanvasSvg>
  );
};
