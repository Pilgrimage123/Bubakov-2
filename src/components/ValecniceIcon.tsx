import React from 'react';
export const ValecniceIcon: React.FC<{size?: string|number; className?:string; style?:React.CSSProperties}> = ({size=48,className='',style={}}) => {
 const s=typeof size==='number'?size+'px':size;
 return <svg width={s} height={s} viewBox="0 0 64 64" className={className} style={style} role="img" aria-label="Válečnice">
  <circle cx="32" cy="32" r="29" fill="#F3E9D2" stroke="#2A170A" strokeWidth="3"/>
  <path d="M17 24 Q16 13 32 11 Q48 13 47 24 L44 39 Q40 51 32 53 Q24 51 20 39Z" fill="#E7B98B" stroke="#2A170A" strokeWidth="2.5"/>
  <path d="M19 23 Q32 17 45 23 L43 16 Q32 8 21 16Z" fill="#B91C1C" stroke="#2A170A" strokeWidth="2.5"/>
  <circle cx="25" cy="29" r="2.5" fill="#2A170A"/><circle cx="39" cy="29" r="2.5" fill="#2A170A"/>
  <path d="M24 38 Q32 44 40 38" fill="none" stroke="#2A170A" strokeWidth="3" strokeLinecap="round"/>
  <path d="M11 49 Q26 39 51 47" fill="none" stroke="#8B5A2B" strokeWidth="7" strokeLinecap="round"/>
  <path d="M8 47 L14 51 M50 45 L56 49" stroke="#D6A15A" strokeWidth="2"/>
 </svg>;
};
