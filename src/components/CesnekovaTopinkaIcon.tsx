import React from 'react';
export const CesnekovaTopinkaIcon: React.FC<{size?: string|number; className?:string; style?:React.CSSProperties}> = ({size=48,className='',style={}}) => {
 const s=typeof size==='number'?size+'px':size;
 return <svg width={s} height={s} viewBox="0 0 64 64" className={className} style={style} role="img" aria-label="Česneková topinka">
  <path d="M12 40 Q8 27 20 20 Q37 12 52 24 Q57 31 50 43 Q32 53 12 40Z" fill="#B96D2C" stroke="#2A170A" strokeWidth="3"/>
  <path d="M17 35 Q30 28 48 34" fill="none" stroke="#E8B65A" strokeWidth="5" strokeLinecap="round"/>
  <g fill="#F5E6B8" stroke="#6B4E30" strokeWidth="1.5"><path d="M26 24 Q22 19 26 16 Q31 18 29 24Z"/><path d="M38 27 Q35 22 40 20 Q44 23 42 28Z"/><path d="M46 37 Q43 32 48 30 Q52 34 50 38Z"/></g>
  <g fill="none" stroke="#84A83B" strokeWidth="3" strokeLinecap="round"><path d="M13 15 C7 11 8 5 14 5"/><path d="M50 15 C57 11 58 6 53 4"/><path d="M55 24 C61 21 63 17 59 14"/></g>
 </svg>;
};
