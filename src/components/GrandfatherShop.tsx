import React from 'react';
import { GRANDFATHER_ITEMS } from '../data/grandfatherItems';
import { getGrandfatherPrice, getWaitDiscount, type GrandfatherOffer } from '../game/grandfatherRuntime';
import { GameIcon } from './GameIcon';
import { getGrandfatherItemTranslation, getWeaponTranslation, t } from '../i18n';

interface Props {
  gingerbread: number;
  luck: number;
  waitSeconds: number;
  offers: GrandfatherOffer[];
  purchasedIds: string[];
  playerWeapons?: any[];
  purchasesThisEncounter: number;
  rerollCost?: number;
  onPurchase: (itemId: string) => boolean;
  onRefreshOffers?: () => void;
  onClose: () => void;
  lang?: string;
}

export function GrandfatherShop({
  gingerbread,
  luck,
  waitSeconds,
  offers = [],
  purchasedIds = [],
  playerWeapons = [],
  purchasesThisEncounter,
  rerollCost = 4,
  onPurchase,
  onRefreshOffers,
  onClose,
  lang = 'cs',
}: Props) {
  const discount = Math.round(getWaitDiscount(waitSeconds) * 100);

  return (
    <div className="overlay" style={{ background: 'rgba(25, 12, 5, 0.78)', backdropFilter: 'blur(3px)', zIndex: 100 }}>
      <div className="panel" style={{ maxWidth: 860, width: 'min(95vw, 860px)', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>🧓</div>
        <h2 style={{ margin: '4px 0', color: '#C53026', fontSize: '2.2rem' }}>{t('grandfather_shop.title', lang)}</h2>
        <p style={{ margin: '2px 0 10px', fontWeight: 800, color: '#78350F' }}>
          {t('grandfather_shop.motto', lang)}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, padding: '10px 14px', marginBottom: 10,
          border: '2px solid var(--ink)', borderRadius: 12, background: '#FDECC8',
        }}>
          <strong style={{ fontSize: '1.2rem', color: '#5B2118' }}>{t('grandfather_shop.pouch', lang, { count: gingerbread })}</strong>
          <span style={{ fontWeight: 900, color: '#166534' }}>{t('grandfather_shop.wait_discount', lang, { discount })}</span>
          <span style={{ fontWeight: 900, color: '#1E3A8A' }}>{t('grandfather_shop.luck', lang, { luck })}</span>
        </div>

        <div style={{
          margin: '0 0 12px',
          padding: '8px 14px',
          borderRadius: 10,
          border: '2px dashed #92400E',
          background: purchasedIds.length >= 12 ? '#DCFCE7' : '#FEF3C7',
          color: purchasedIds.length >= 12 ? '#166534' : '#78350F',
          fontWeight: 800,
          fontSize: '0.95rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          <span>🌟 Nákupů v této výpravě: <strong>{purchasedIds.length}</strong> / 12</span>
          <span>{purchasedIds.length >= 12 ? '✅ Skvělé! Cíl alespoň 12 vylepšení za run splněn!' : `(zbývá ještě ${12 - purchasedIds.length} do cíle 12 nákupů)`}</span>
        </div>

        {(!offers || offers.length === 0) ? (
          <div style={{
            padding: '28px 16px',
            textAlign: 'center',
            background: '#FEF3C7',
            borderRadius: 12,
            border: '2px dashed #92400E',
            color: '#78350F',
            fontWeight: 800,
            fontSize: '1.05rem',
          }}>
            🧺 Všechno zboží z nůše bylo vykoupeno! Děkuji ti, poutníče!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 12,
            textAlign: 'left',
          }}>
            {offers.map((offer, idx) => {
              const item = GRANDFATHER_ITEMS.find((candidate) => candidate.id === offer.itemId);
              if (!item) return null;
              const price = getGrandfatherPrice(item, purchasesThisEncounter, luck, waitSeconds);

            let owned = 0;
            let maxStacks = item.maxStacks || 5;
            let isMaxed = false;
            let displayName = item.name;
            let displayDesc = item.description;
            let levelBadge = '';
            let buttonLabel = t('grandfather_shop.buy', lang);

            if (item.isWeapon && item.weaponId) {
              const pw = playerWeapons?.find((w: any) => w.id === item.weaponId);
              owned = pw ? pw.level : 0;
              maxStacks = item.maxStacks || 8;
              isMaxed = owned >= maxStacks;
              const wTrans = getWeaponTranslation(item.weaponId, lang);
              displayName = wTrans.name || item.name;
              displayDesc = wTrans.desc || item.description;

              if (owned === 0) {
                levelBadge = t('grandfather_shop.new_weapon', lang);
                buttonLabel = t('grandfather_shop.obtain', lang);
              } else if (isMaxed) {
                levelBadge = `⚔️ ${t('grandfather_shop.level_badge', lang, { current: owned, max: maxStacks })} (${t('grandfather_shop.maxed', lang)})`;
                buttonLabel = t('grandfather_shop.maxed', lang);
              } else {
                levelBadge = `⚔️ ${t('grandfather_shop.level_badge', lang, { current: owned, max: maxStacks })}`;
                const lvlNum = owned + 1;
                displayName = `${displayName} (${lang === 'cs' ? `Úroveň ${lvlNum}` : `Level ${lvlNum}`})`;
                displayDesc = lang === 'cs'
                  ? `Vylepšení zbraně na úroveň ${lvlNum} (+12 % zranění, +8 % kadence, +6 % dosah)`
                  : `Upgrade weapon to level ${lvlNum} (+12% damage, +8% attack speed, +6% area)`;
                buttonLabel = t('grandfather_shop.upgrade', lang);
              }
            } else {
              owned = purchasedIds.filter((id) => id === item.id).length;
              maxStacks = item.maxStacks || 5;
              isMaxed = item.maxStacks !== undefined && owned >= item.maxStacks;
              const gTrans = getGrandfatherItemTranslation(item.id, lang);
              displayName = gTrans.name || item.name;
              displayDesc = gTrans.desc || item.description;
              levelBadge = `${t('grandfather_shop.level_badge', lang, { current: owned, max: item.maxStacks || '∞' })}`;
              if (isMaxed) {
                buttonLabel = t('grandfather_shop.maxed', lang);
              }
            }

            const affordable = gingerbread >= price && !isMaxed;

            return (
              <div key={`${item.id}-${idx}`} style={{
                border: item.isWeapon ? '2.5px solid #9A3412' : '2px solid var(--ink)',
                borderRadius: 12,
                padding: 12,
                background: isMaxed ? '#E7D7B6' : affordable ? (item.isWeapon ? '#FFFBEB' : '#FFF7DF') : '#F5E6CA',
                boxShadow: item.isWeapon ? '3px 3px 0 rgba(154, 52, 18, 0.4)' : '3px 3px 0 rgba(0,0,0,.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GameIcon icon={item.icon} size={38} />
                    </div>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: isMaxed ? '#B45309' : item.isWeapon ? '#FEE2E2' : '#FEF3C7',
                      color: isMaxed ? '#FFF' : item.isWeapon ? '#991B1B' : '#78350F',
                      border: item.isWeapon ? '1px solid #DC2626' : '1px solid #78350F',
                    }}>
                      {levelBadge}
                    </span>
                  </div>
                  <h3 style={{ margin: '6px 0 2px', color: '#5B2118', fontSize: '1.05rem', lineHeight: 1.25 }}>
                    {displayName}
                  </h3>
                  <p style={{ margin: '2px 0 10px', minHeight: 38, fontWeight: 700, fontSize: '0.88rem', color: '#451A03', lineHeight: 1.35 }}>
                    {displayDesc}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <strong style={{ fontSize: '1.1rem', color: '#78350F' }}>🍪 {price}</strong>
                  <button
                    disabled={!affordable}
                    onClick={() => onPurchase(item.id)}
                    style={{
                      padding: '8px 12px',
                      fontWeight: 900,
                      border: '2px solid var(--ink)',
                      borderRadius: 8,
                      cursor: affordable ? 'pointer' : 'not-allowed',
                      opacity: affordable ? 1 : 0.6,
                      background: isMaxed ? '#D1D5DB' : affordable ? (item.isWeapon ? '#F59E0B' : '#FBBF24') : '#E5E7EB',
                      color: isMaxed ? '#4B5563' : '#2D1609',
                    }}
                  >
                    {isMaxed ? 'VYČERPÁNO' : affordable ? buttonLabel : 'MÁLO PERNÍKŮ'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
          {onRefreshOffers && (
            <button
              onClick={onRefreshOffers}
              disabled={gingerbread < rerollCost}
              style={{
                padding: '10px 18px',
                fontWeight: 900,
                border: '2px solid var(--ink)',
                borderRadius: 9,
                background: gingerbread >= rerollCost ? '#FEF3C7' : '#E5E7EB',
                color: gingerbread >= rerollCost ? '#78350F' : '#9CA3AF',
                cursor: gingerbread >= rerollCost ? 'pointer' : 'not-allowed',
                opacity: gingerbread >= rerollCost ? 1 : 0.65,
                boxShadow: gingerbread >= rerollCost ? '2px 2px 0 var(--ink)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              title={gingerbread >= rerollCost
                ? (lang === 'cs' ? `Vytáhne z nůše další zboží (stojí ${rerollCost} perníčků)` : `Pulls fresh goods from basket (costs ${rerollCost} gingerbread)`)
                : (lang === 'cs' ? `Nedostatek perníčků na zamíchání (stojí ${rerollCost} 🍪)` : `Not enough gingerbread to reroll (costs ${rerollCost} 🍪)`)}
            >
              <span>🧺 {lang === 'cs' ? 'ZAMÍCHAT NŮŠI' : 'REROLL BASKET'}</span>
              <span style={{
                background: gingerbread >= rerollCost ? '#FDE68A' : '#D1D5DB',
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid var(--ink)',
                fontSize: '0.9rem',
                color: gingerbread >= rerollCost ? '#78350F' : '#6B7280',
              }}>
                🍪 {rerollCost}
              </span>
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              fontWeight: 900,
              border: '2px solid var(--ink)',
              borderRadius: 9,
              background: '#DC2626',
              color: '#FFF',
              cursor: 'pointer',
            }}
          >
            ZAVŘÍT NŮŠI
          </button>
        </div>
      </div>
    </div>
  );
}
