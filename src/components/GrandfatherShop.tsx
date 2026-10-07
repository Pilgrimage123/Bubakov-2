import React from 'react';
import { GRANDFATHER_ITEMS } from '../data/grandfatherItems';
import { getGrandfatherPrice, getWaitDiscount, type GrandfatherOffer } from '../game/grandfatherRuntime';

interface Props {
  gingerbread: number;
  luck: number;
  waitSeconds: number;
  offers: GrandfatherOffer[];
  purchasedIds: string[];
  purchasesThisEncounter: number;
  onPurchase: (itemId: string) => boolean;
  onClose: () => void;
}

export function GrandfatherShop({
  gingerbread,
  luck,
  waitSeconds,
  offers,
  purchasedIds,
  purchasesThisEncounter,
  onPurchase,
  onClose,
}: Props) {
  const discount = Math.round(getWaitDiscount(waitSeconds) * 100);

  return (
    <div className="overlay" style={{ background: 'rgba(25, 12, 5, 0.78)', backdropFilter: 'blur(3px)', zIndex: 100 }}>
      <div className="panel" style={{ maxWidth: 820, width: 'min(92vw, 820px)', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '5rem', lineHeight: 1 }}>🧓</div>
        <h2 style={{ margin: '4px 0', color: '#C53026', fontSize: '2.2rem' }}>DĚDEČEK A JEHO NŮŠE</h2>
        <p style={{ margin: '2px 0 10px', fontWeight: 800, color: '#78350F' }}>
          „Perníčky mám rád víc než zlato!“
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, padding: '10px 14px', marginBottom: 12,
          border: '2px solid var(--ink)', borderRadius: 12, background: '#FDECC8',
        }}>
          <strong style={{ fontSize: '1.2rem' }}>🍪 Nůše lovce: {gingerbread}</strong>
          <span style={{ fontWeight: 900 }}>Čekací sleva: −{discount}%</span>
          <span style={{ fontWeight: 900 }}>ŠTĚSTÍ: {luck}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          textAlign: 'left',
        }}>
          {offers.map((offer) => {
            const item = GRANDFATHER_ITEMS.find((candidate) => candidate.id === offer.itemId);
            if (!item) return null;
            const price = getGrandfatherPrice(item, purchasesThisEncounter, luck, waitSeconds);
            const owned = purchasedIds.filter((id) => id === item.id).length;
            const maxed = item.maxStacks !== undefined && owned >= item.maxStacks;
            const affordable = gingerbread >= price && !maxed;

            return (
              <div key={item.id} style={{
                border: '2px solid var(--ink)',
                borderRadius: 12,
                padding: 12,
                background: affordable ? '#FFF7DF' : '#E7D7B6',
                boxShadow: '3px 3px 0 rgba(0,0,0,.25)',
              }}>
                <div style={{ fontSize: '2.2rem' }}>{item.icon}</div>
                <h3 style={{ margin: '3px 0', color: '#5B2118' }}>{item.name}</h3>
                <p style={{ margin: '4px 0 10px', minHeight: 42, fontWeight: 700 }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong>🍪 {price}</strong>
                  <button
                    disabled={!affordable}
                    onClick={() => onPurchase(item.id)}
                    style={{
                      padding: '8px 12px',
                      fontWeight: 900,
                      border: '2px solid var(--ink)',
                      borderRadius: 8,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.55,
                    }}
                  >
                    {maxed ? 'VYČERPÁNO' : affordable ? 'KOUPIT' : 'NELZE KOUPIT'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          style={{ marginTop: 16, padding: '10px 22px', fontWeight: 900, border: '2px solid var(--ink)', borderRadius: 9 }}
        >
          ZAVŘÍT NŮŠI
        </button>
      </div>
    </div>
  );
}
