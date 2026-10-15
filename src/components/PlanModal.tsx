import React from 'react';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { KronikaChanges } from './KronikaChanges';

type PlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'plan' | 'changelog';
};

export function PlanModal({ isOpen, onClose }: PlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="overlay" style={{ zIndex: 35 }}>
      <div
        className="panel"
        style={{
          maxWidth: '880px',
          width: '95%',
          maxHeight: '90vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>📜 Kronika Bubákova</h2>
        <LadaBotanicalFlourish height={18} />
        <p
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            marginTop: '-6px',
            marginBottom: '14px',
            color: 'var(--wood-dark)',
          }}
        >
          Historie skutečných změn Bubákova. Nejnovější zápis je vždy nahoře.
        </p>

        <KronikaChanges />

        <div style={{ marginTop: '16px' }}>
          <button className="lada-btn" onClick={onClose}>
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
