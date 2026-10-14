import React from 'react';
import type { HunterDetail } from '../data/hunterDetails';
import { sound } from '../audio';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

interface HunterInfoModalProps {
  hunter: HunterDetail | null;
  onClose: () => void;
}

const detailSection: React.CSSProperties = {
  background: '#FFFBEB',
  color: '#1C1917',
  border: '2px solid #78350F',
  borderRadius: '8px',
  padding: '12px 14px',
  marginBottom: '10px',
};

export const HunterInfoModal: React.FC<HunterInfoModalProps> = ({ hunter, onClose }) => {
  if (!hunter) return null;

  return (
    <div className="overlay" style={{ zIndex: 55 }} onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: '760px', width: '95%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', textAlign: 'left' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <span style={{ display: 'inline-block', background: '#166534', color: '#FFFFFF', padding: '4px 9px', borderRadius: '5px', fontWeight: 900, fontSize: '0.8rem' }}>
              ✅ ODEMČENÝ LOVEC
            </span>
            <h2 style={{ margin: '7px 0 2px', fontSize: '1.8rem', color: '#FEF3C7' }}>{hunter.name}</h2>
            <div style={{ fontWeight: 800, color: '#FDE68A' }}>{hunter.title}</div>
          </div>
          <button className="tab-btn" aria-label="Zavřít informace o lovci" onClick={() => { sound.coin(); onClose(); }} style={{ minWidth: 'auto', padding: '5px 12px', fontSize: '1.2rem' }}>✕</button>
        </div>
        <LadaBotanicalFlourish height={18} />
        <div style={{ overflowY: 'auto', minHeight: 0, paddingRight: '5px' }}>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 8px', color: '#78350F' }}>📊 Základní statistiky</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
              <div style={{ background: '#FEF3C7', border: '1px solid #D6B98C', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.78rem' }}>Kuráž na začátku</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hunter.maxHp}</span>
              </div>
              <div style={{ background: '#FEF3C7', border: '1px solid #D6B98C', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.78rem' }}>Rychlost pohybu</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hunter.speed}</span>
              </div>
              <div style={{ background: '#FEF3C7', border: '1px solid #D6B98C', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.78rem' }}>Základní magnet</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hunter.pickupRadius} px</span>
              </div>
              <div style={{ background: '#FEF3C7', border: '1px solid #D6B98C', borderRadius: '6px', padding: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.78rem' }}>Štěstí</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hunter.luck}</span>
              </div>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', lineHeight: 1.35 }}>
              Jde o základní hodnoty před dalšími bonusy z hospody, předmětů a mobilního usnadnění. Dočasné bonusy mohou výsledné hodnoty změnit.
            </p>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F' }}>🗡️ Počáteční zbraň</h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.weapon}</p>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F' }}>🌿 Pasivní schopnost</h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.passive}</p>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F' }}>⚡ Zvláštní schopnost</h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.ability}</p>
            <div style={{ marginTop: '8px', fontWeight: 900, color: '#166534' }}>⏱️ Základní cooldown: {hunter.cooldownSeconds} s</div>
          </section>
          <section style={{ ...detailSection, marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F' }}>🧭 Doporučený styl hry</h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.playstyle}</p>
          </section>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button className="lada-btn" onClick={() => { sound.coin(); onClose(); }} style={{ padding: '10px 24px' }}>Rozumím</button>
        </div>
      </div>
    </div>
  );
};
