import React from 'react';
import { sound } from '../audio';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { GameIcon } from './GameIcon';

export interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({ isOpen, onClose, onConfirmReset }) => {
  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      style={{
        zIndex: 50,
        background: 'rgba(25, 12, 8, 0.88)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.coin();
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: '680px',
          width: '92%',
          maxHeight: '90vh',
          minHeight: 0,
          overflowY: 'auto',
          background: 'var(--wood-dark)',
          border: '5px solid #D1342B',
          boxShadow: '10px 10px 0px var(--ink), 0 0 35px rgba(209, 52, 43, 0.45)',
          padding: '24px 28px',
          textAlign: 'left',
          color: 'var(--parchment)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <GameIcon icon="warning" size={40} />
          <div>
            <h2
              style={{
                margin: 0,
                color: '#F87171',
                fontSize: '1.85rem',
                letterSpacing: '1px',
                textShadow: '2px 2px 0px var(--ink)',
              }}
            >
              VYMAZAT VEŠKERÝ POSTUP?
            </h2>
            <LadaBotanicalFlourish height={16} />
            <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: '0.96rem', color: '#FEF3C7' }}>
              Tato akce vrátí celou hru zpět do výchozího stavu jako při prvním spuštění.
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--parchment)',
            color: 'var(--ink)',
            border: '3px solid var(--ink)',
            borderRadius: '8px',
            padding: '16px 20px',
            margin: '16px 0',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '10px', color: '#7F1D1D' }}>
            Co všechno bude touto akcí uzamčeno a vynulováno:
          </div>
          <ul style={{ margin: 0, paddingLeft: '22px', fontSize: '0.94rem', fontWeight: 700, lineHeight: 1.55 }}>
            <li>
              <strong>Uzamčení hrdinů:</strong> Tulák, Pasáček, Bába kořenářka, Ponocný, Pobožný kostelník i Babička budou znovu uzamčeni (postup 0 %). Zůstane pouze výchozí Krajánek.
            </li>
            <li>
              <strong>Uzamčení úrovní 2 až 6:</strong> Les u rybníka, Zimní Hrusice, Čertův mlýn, Zřícenina hradu i Dračí sluj se uzamknou. Bude přístupná pouze 1. úroveň.
            </li>
            <li>
              <strong>Uzamčení zbraní:</strong> Uzamčené zbraně se vrátí do stavu před odemčením. Zůstanou přístupné pouze výchozí zbraně.
            </li>
            <li>
              <strong>Vynulování vesnice &amp; hospody:</strong> Všech 13 obecních budov (výheň, mlýn, strašák, hradby, pekárna, kaple atd.) se vrátí na úroveň 0.
            </li>
            <li>
              <strong>Vynulování pokladny:</strong> Krejcary, zachráněné dušičky i zachránění chasníci budou vynulováni na nulu.
            </li>
            <li>
              <strong>Bestiář a trofeje:</strong> Všechny záznamy o zahnadých příšerách a splněné trofeje se vymažou.
            </li>
          </ul>
        </div>

        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px dashed #EF4444',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#FCA5A5',
            fontWeight: 800,
            fontSize: '0.88rem',
            marginBottom: '20px',
          }}
        >
          <GameIcon icon="warning" size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          <strong>Upozornění:</strong> Tuto akci nelze vzít zpět! Všechny uložené herní milníky budou nenávratně ztraceny.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            className="lada-btn btn-small"
            style={{
              background: '#4B5563',
              color: '#FFFFFF',
              border: '3px solid var(--ink)',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            <GameIcon icon="cross" size={16} />
            Zrušit (Ponechat postup)
          </button>
          <button
            className="lada-btn btn-small"
            style={{
              background: '#DC2626',
              color: '#FFFFFF',
              border: '3px solid var(--ink)',
              margin: 0,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => {
              onConfirmReset();
            }}
          >
            <GameIcon icon="trash" size={16} />
            Ano, vymazat veškerý postup
          </button>
        </div>
      </div>
    </div>
  );
};
