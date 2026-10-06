import React from 'react';
export const KyselaOkurkaIcon: React.FC<{size?: string|number; className?:string; style?:React.CSSProperties}> = ({size=48,className='',style={}}) => {
 const s=typeof size==='number'?size+'px':size;
 return <svg width={s} height={s} viewBox="0 0 64 64" className={className} style={style} role="img" aria-label="Kyselá okurka">
  <g transform="rotate(-25 32 32)"><path d="M18 11 Q32 6 46 13 L43 50 Q32 58 21 50Z" fill="#5E9F3B" stroke="#193B18" strokeWidth="3"/>
  <path d="M23 18 Q32 15 41 18 M23 28 Q32 25 41 28 M23 38 Q32 35 40 38" fill="none" stroke="#A8D96D" strokeWidth="2"/>
  <circle cx="27" cy="22" r="1.5" fill="#193B18"/><circle cx="36" cy="32" r="1.5" fill="#193B18"/><circle cx="29" cy="43" r="1.5" fill="#193B18"/></g>
  <path d="M50 11 Q57 14 55 20" fill="none" stroke="#7FBF4D" strokeWidth="3"/><circle cx="53" cy="27" r="2" fill="#A7F3D0"/>
 </svg>;
};
