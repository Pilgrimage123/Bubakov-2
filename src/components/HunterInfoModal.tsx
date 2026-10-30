import React, { useState } from 'react';
import { HUNTER_DETAILS, type HunterDetail } from '../data/hunterDetails';
import { sound } from '../audio';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';
import { GameIcon } from './GameIcon';
import { WEAPONS } from '../data/weapons';
import { LadaHunterCanvasPreview } from './LadaHunterCanvasPreview';

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
  const starterWeapon = WEAPONS[hunter.weaponId];
  const hunterKey =
    (Object.entries(HUNTER_DETAILS).find(([, detail]) => detail.name === hunter.name)?.[0]) ||
    hunter.name.toLowerCase();

  return (
    <div className="overlay" style={{ zIndex: 55 }} onClick={onClose}>
      <div
        className="panel"
        style={{ maxWidth: '760px', width: '95%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', textAlign: 'left', position: 'relative' }}
        onClick={(event) => event.stopPropagation()}
      >
        <LadaCardCorners variant="callout" showBottomCorners={true} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#166534', color: '#FFFFFF', padding: '4px 9px', borderRadius: '5px', fontWeight: 900, fontSize: '0.8rem' }}>
              <GameIcon icon="checkmark" size={14} /> ODEMČENÝ LOVEC
            </span>
            <h2 style={{ margin: '7px 0 2px', fontSize: '1.8rem', color: '#2A170A', overflowWrap: 'break-word', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LadaFolkFlower variant="buttercup" size={20} spin />
              <span>{hunter.name}</span>
              <LadaFolkFlower variant="cornflower" size={20} spin />
            </h2>
            <div style={{ fontWeight: 800, color: '#78350F', overflowWrap: 'break-word' }}>{hunter.title}</div>
          </div>
          <button className="tab-btn" aria-label="Zavřít informace o lovci" onClick={() => { sound.coin(); onClose(); }} style={{ minWidth: 'auto', padding: '5px 12px', fontSize: '1.2rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <GameIcon icon="cross" size={16} />
          </button>
        </div>
        <LadaBotanicalFlourish height={18} />
        <div style={{ overflowY: 'auto', minHeight: 0, paddingRight: '5px' }}>
          <section style={{ ...detailSection, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', background: 'linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)' }}>
            <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LadaHunterCanvasPreview hunterId={hunterKey} size={150} />
              <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#78350F', marginTop: '6px' }}>
                🎨 Autentický Ladovský 2D sprite z arény
              </div>
            </div>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 8px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GameIcon icon="stats" size={18} /> Základní statistiky
            </h3>
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
            <h3 style={{ margin: '0 0 6px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px', overflowWrap: 'anywhere' }}>
              <GameIcon icon="sword" size={18} /> Počáteční výbava · {starterWeapon?.name || hunter.weaponId}
            </h3>
            {starterWeapon && (
              <>
                <div className="hunter-modal-weapon-stats">
                  <span>Základní poškození: <strong>{starterWeapon.baseDmg}</strong></span>
                  <span>Interval: <strong>{Number(starterWeapon.baseCd).toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s</strong></span>
                  {starterWeapon.speed ? <span>Rychlost střely: <strong>{starterWeapon.speed}</strong></span> : null}
                </div>
                <p style={{ margin: '7px 0 0', lineHeight: 1.45, overflowWrap: 'anywhere' }}>{starterWeapon.desc}</p>
              </>
            )}
            <p style={{ margin: '7px 0 0', fontSize: '0.8rem', lineHeight: 1.35 }}>Jde o základní hodnoty zbraně na 1. úrovni, před vylepšeními, bonusy lovce a odolnostmi nepřátel.</p>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GameIcon icon="clover" size={18} /> Pasivní schopnost
            </h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.passive}</p>
          </section>
          <section style={detailSection}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GameIcon icon="lightning" size={18} /> Zvláštní schopnost
            </h3>
            <p style={{ margin: 0, lineHeight: 1.45 }}>{hunter.ability}</p>
            <div style={{ marginTop: '8px', fontWeight: 900, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GameIcon icon="clock" size={16} /> Základní cooldown: {hunter.cooldownSeconds} s
            </div>
          </section>
          <section style={{ ...detailSection, marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 6px', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GameIcon icon="compass" size={18} /> Doporučený styl hry
            </h3>
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
