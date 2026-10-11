import React from 'react';

export type HunterConsumableKind = 'tepla_cikorka' | 'zejdlik_piva' | 'panak_koralky';
interface Props { kind: HunterConsumableKind; size?: string | number; className?: string; style?: React.CSSProperties; }

export const HunterConsumableIcon: React.FC<Props> = ({ kind, size = 36, className = '', style = {} }) => {
  const px = typeof size === 'number' ? `${size}px` : size;
  if (kind === 'tepla_cikorka') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Teplá cikorka">
    <path d="M21 10 C14 3 25 1 20 0 M33 10 C26 3 37 1 32 0" fill="none" stroke="#9A5B2A" strokeWidth="2.5" strokeLinecap="round"/><path d="M10 15 H47 L44 47 Q43 54 29 54 Q15 54 14 47 Z" fill="#F5E6C8" stroke="#5B2118" strokeWidth="3"/><ellipse cx="28.5" cy="17" rx="17" ry="4.5" fill="#6B351E" stroke="#5B2118" strokeWidth="2"/><path d="M47 22 Q61 18 58 33 Q56 41 45 39" fill="none" stroke="#5B2118" strokeWidth="4" strokeLinecap="round"/><path d="M18 32 Q29 26 40 32 M19 39 Q29 34 39 39" fill="none" stroke="#B45309" strokeWidth="2"/><path d="M25 47 l4 -4 l4 4 l-4 3 Z" fill="#B45309"/>
  </svg>;
  if (kind === 'zejdlik_piva') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Žejdlík piva">
    <path d="M12 15 H43 L40 53 Q39 57 27 57 Q15 57 14 53 Z" fill="#EAB308" stroke="#5B2118" strokeWidth="3"/><path d="M43 23 H49 Q59 23 56 36 Q54 46 42 43" fill="none" stroke="#5B2118" strokeWidth="4"/><path d="M10 15 Q5 7 13 7 Q17 -1 25 6 Q31 -1 37 7 Q45 4 47 15 Z" fill="#FFF7D6" stroke="#5B2118" strokeWidth="2.5"/><path d="M20 26 l0 18 M28 25 l0 21 M36 27 l0 18" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round"/><path d="M18 48 Q28 44 38 48" fill="none" stroke="#92400E" strokeWidth="2"/>
  </svg>;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={px} height={px} className={className} style={style} role="img" aria-label="Panák kořalky">
    <path d="M17 10 H47 L44 29 Q42 35 37 39 V51 Q37 56 32 56 Q27 56 27 51 V39 Q21 35 20 29 Z" fill="#F5E6C8" stroke="#5B2118" strokeWidth="3"/><path d="M20 21 H44 L42 29 Q41 33 32 36 Q23 33 22 29 Z" fill="#C77722"/><ellipse cx="32" cy="21" rx="12" ry="3" fill="#E8A03A" stroke="#92400E" strokeWidth="1.5"/><path d="M29 44 l3 3 l3 -3" fill="none" stroke="#92400E" strokeWidth="2"/><path d="M11 9 Q8 5 12 2 M51 9 Q55 5 52 2" fill="none" stroke="#9A5B2A" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
};
