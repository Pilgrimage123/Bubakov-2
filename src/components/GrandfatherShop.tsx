import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';
import { getGrandfatherPrice, getWaitDiscount, type GrandfatherOffer } from '../game/grandfatherRuntime';
import { GameIcon } from './GameIcon';
import { GrandfatherScene } from './GrandfatherScene';
import { sound } from '../audio';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { toCanonicalWeaponId } from '../game/migration';
import { getWeaponRankDef } from '../data/weaponMilestones';

interface Props {
  gingerbread: number;
  luck: number;
  waitSeconds: number;
  offers: GrandfatherOffer[];
  purchasedIds: string[];
  playerWeapons?: any[];
  purchasesThisEncounter: number;
  rerollCost?: number;
  churchLevel?: number;
  onPurchase: (itemId: string) => boolean;
  onRefreshOffers?: () => void;
  onClose: () => void;
}

// Folklore quotes for dialogue bubble
const WELCOME_QUOTES = [
  '„Perníčky mám rád víc než císařské tolary! Ber, dokud nůše voní!“',
  '„Vítám tě, poutníče! Nůše je otevřená, prohlédni si mé poklady!“',
  '„V temném lese číhá ledacos, ale s mým zbožím ti vlas na hlavě nezkřiví!“',
  '„Podívej, co všechno jsem vyhandloval po starých vesnicích!“',
];

const REROLL_QUOTES = [
  '„Počkej chvilku, zalovím až na samotném dně nůše!“',
  '„Zamícháme, zatřeseme... a je tu čerstvé zboží!“',
  '„Ještě tam mám pár schovaných lahviček a ostrých kousků!“',
  '„Na dně bývají ty největší zázraky, jen se podívej!“',
];

const PURCHASE_QUOTES = [
  '„Plácnuto! Tenhle kousek ti v lese zachrání kůži!“',
  '„Mňam, ještě vlahý perníček! S tebou je radost handlovat!“',
  '„Výborná volba! Strašidla budou koukat, co máš v ruce!“',
  '„Opatruj to dobře, takové zboží se dneska už těžko shání!“',
];

const MOUSE_QUOTES = [
  '„Pst! To je Rézinka, ta mi hlídá nůši a mlsá perníkové drobky!“',
  '„Rézinka tě zdraví! Když jí dáš perníček, možná ti přinese štěstí!“',
  '„Myšička vykukuje – cítí, že máš v kapse voňavé těsto!“',
];

function getItemQuote(item: GrandfatherItemDef): string {
  if (item.isWeapon) {
    if (item.id === 'wp_cane') return '„Osikový prut! Pružný a švihá jak blesk, skřítkové před ním prchají!“';
    if (item.id === 'wp_cesnekova-topinka') return '„Česneková topinka! Z té vůně se každému hastrmanovi protočí panenky!“';
    if (item.id === 'wp_valecnice') return '„Rázná hospodyně s válečkem! Té se bojí i čerti v samotném pekle!“';
    if (item.id === 'wp_buns') return '„Povidlové buchty! Zlatavé z pece, bubáci je začnou mlsat na místě!“';
    if (item.id === 'wp_pitchfork') return '„Kovářské vidle! Třízubé železo propíchne i dračí šupiny!“';
    if (item.id === 'wp_halberd') return '„Ponocného halapartna! Široký rázný švih zažene celou rotu strašidel!“';
    if (item.id === 'wp_herbs') return '„Devatery kvítí trhané o svatojánské noci! Nečisté síly před ním hasnou!“';
    return `„${item.name}! Poctivá zbraň, se kterou v lesích nezahyneš!“`;
  }
  if (item.id === 'sedmimile_krpce' || item.id === 'toulave_boty') {
    return '„Sedmimílové krpce! S těmi utečeš i polednici za pravého poledne!“';
  }
  if (item.id === 'certovske_pirko') {
    return '„Čertovské pírko! Vytržené přímo z pekelného kožichu, dodá pořádnou sílu úderu!“';
  }
  if (item.id === 'bylinkova_fajfka') {
    return '„Bylinková fajfka! Z mých tajných sušených bylin, hned se ti uleví a dech se vrátí!“';
  }
  if (item.id === 'krvave_jelito') {
    return '„Poctivé krvavé jelito ze zabijačky! Síla a zranění jak ze žuly!“';
  }
  if (item.id === 'opravdova_kava') {
    return '„Opravdová zrnková káva od zámořských kupců! Zbraně ti poletí jak namazané!“';
  }
  if (item.id === 'medvedi_mast') {
    return '„Hojivá medvědí mast! Zacelí každý šrám a kousnutí od nočních můr!“';
  }
  if (item.id === 'zabijackova_jitrnice') {
    return '„Špejlovaná jitrnička! Spolkneš a ztracená kuráž je hned zpátky v těle!“';
  }
  return `„${item.name}! Vzácná věc, z mé nůše putuje přímo k tobě!“`;
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
  churchLevel = 0,
  onPurchase,
  onRefreshOffers,
  onClose,
}: Props) {
  const discount = Math.round(getWaitDiscount(waitSeconds) * 100);

  // Shop animation states
  const [sceneState, setSceneState] = useState<'idle' | 'reaching' | 'pulling' | 'rerolling' | 'purchasing'>('idle');
  const [activeItem, setActiveItem] = useState<GrandfatherItemDef | null>(null);
  const [quote, setQuote] = useState<string>(() => WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)]);
  const [pullAnimationKey, setPullAnimationKey] = useState<number>(0);
  const [justPurchasedId, setJustPurchasedId] = useState<string | null>(null);

  // Detect mobile width for optimized view
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 820;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 820);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Play opening wicker creak and chime on mount
  useEffect(() => {
    try {
      sound.grandfatherOpen();
    } catch {
      // Audio fallback
    }
  }, []);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Reroll action
  const handleReroll = useCallback(() => {
    if (gingerbread < rerollCost || !onRefreshOffers) return;

    setSceneState('rerolling');
    setQuote(REROLL_QUOTES[Math.floor(Math.random() * REROLL_QUOTES.length)]);
    try {
      sound.grandfatherReroll();
    } catch {
      // Audio fallback
    }

    setTimeout(() => {
      onRefreshOffers();
      setPullAnimationKey((k) => k + 1);
    }, 450);

    setTimeout(() => {
      setSceneState('idle');
    }, 850);
  }, [gingerbread, rerollCost, onRefreshOffers]);

  // Handle Item Purchase action
  const handlePurchase = useCallback((itemId: string) => {
    const item = GRANDFATHER_ITEMS.find((it) => it.id === itemId);
    if (!item) return;

    const success = onPurchase(itemId);
    if (success) {
      setJustPurchasedId(itemId);
      setSceneState('purchasing');
      setQuote(PURCHASE_QUOTES[Math.floor(Math.random() * PURCHASE_QUOTES.length)]);

      setTimeout(() => {
        setJustPurchasedId(null);
        setSceneState('idle');
      }, 950);
    }
  }, [onPurchase]);

  // Handle Hover over item card ("Dědeček vytahuje věci z nůše / ukazuje na ně")
  const handleItemHover = useCallback((item: GrandfatherItemDef) => {
    setActiveItem(item);
    setSceneState('pulling');
    setQuote(getItemQuote(item));
  }, []);

  const handleItemLeave = useCallback(() => {
    setActiveItem(null);
    setSceneState('idle');
  }, []);

  // Handle petting the peeking mouse Rézinka
  const handleMousePet = useCallback(() => {
    setQuote(MOUSE_QUOTES[Math.floor(Math.random() * MOUSE_QUOTES.length)]);
    setSceneState('pulling');
    setTimeout(() => setSceneState('idle'), 1200);
  }, []);

  return (
    <div
      className="overlay"
      style={{
        background: 'rgba(20, 10, 4, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '8px' : '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: isMobile ? '100%' : '1100px',
          width: '100%',
          maxHeight: isMobile ? '96vh' : '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--parchment)',
          border: '4px solid var(--ink)',
          borderRadius: 16,
          boxShadow: '0 12px 36px rgba(0,0,0,0.65), inset 0 0 16px rgba(120, 53, 15, 0.1)',
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <LadaCardCorners variant="callout" />

        {/* --- Top Header Banner --- */}
        <div
          style={{
            background: 'linear-gradient(180deg, #78350F 0%, #5B2118 100%)',
            color: '#FEF3C7',
            padding: isMobile ? '10px 14px' : '14px 24px',
            borderBottom: '3px solid var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', lineHeight: 1 }}>🧺</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? '1.35rem' : '1.75rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  color: '#FEF3C7',
                  textShadow: '2px 2px 0 #2A170A',
                  lineHeight: 1.15,
                }}
              >
                DĚDEČKOVA OTEVŘENÁ NŮŠE
              </h2>
              <span style={{ fontSize: isMobile ? '0.78rem' : '0.88rem', color: '#FDE68A', fontWeight: 600 }}>
                Kramářské poklady, lektvary a vylepšení pro statečné lovce
              </span>
            </div>
          </div>

          {/* Quick close button on top right */}
          <button
            onClick={onClose}
            aria-label="Zavřít dědečkův obchod"
            style={{
              padding: isMobile ? '6px 12px' : '8px 16px',
              fontWeight: 900,
              fontSize: '0.9rem',
              borderRadius: 8,
              border: '2px solid #2A170A',
              background: '#DC2626',
              color: '#FFF',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 #2A170A',
              transition: 'transform 0.1s ease',
            }}
          >
            ✕ ZAVŘÍT
          </button>
        </div>

        {/* --- Main Content Split (Stage on Left / Shelves on Right) --- */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            overflowY: 'auto',
            padding: isMobile ? '10px' : '18px 22px',
            gap: isMobile ? 12 : 20,
          }}
        >
          {/* === LEFT COLUMN: Animated Grandfather & Basket Stage === */}
          <div
            style={{
              width: isMobile ? '100%' : '380px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* The Animated Canvas Stage */}
            <GrandfatherScene
              mode={isMobile ? 'mobile' : 'desktop'}
              state={sceneState}
              activeItemName={activeItem?.name}
              activeItemIcon={activeItem?.icon}
              onMousePet={handleMousePet}
            />

            {/* Dynamic Czech Folklore Speech Bubble */}
            <div
              style={{
                position: 'relative',
                background: '#FFFBEB',
                border: '2.5px solid #78350F',
                borderRadius: 12,
                padding: isMobile ? '8px 12px' : '12px 14px',
                boxShadow: '3px 3px 0 rgba(120, 53, 15, 0.25)',
                minHeight: isMobile ? '48px' : '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              {/* Little speech bubble arrow pointing upwards towards Grandfather */}
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: isMobile ? '35%' : '40%',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid #78350F',
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: isMobile ? '0.85rem' : '0.94rem',
                  color: '#451A03',
                  lineHeight: 1.35,
                  fontStyle: 'italic',
                }}
              >
                {quote}
              </p>
            </div>

            {/* Helpful Lore & Wait Discount Tip */}
            {!isMobile && (
              <div
                style={{
                  background: '#FDF3DB',
                  border: '1.5px dashed #92400E',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  color: '#78350F',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>💡</span>
                <div>
                  <strong>Čekací sleva:</strong> Čím déle dědeček čekal na rozcestí v lese, tím větší slevu na perníčky ti nabízí (nyní <strong>−{discount}%</strong>)!
                </div>
              </div>
            )}

            {/* Kaple svaté vlny Synergy */}
            {churchLevel > 0 && (
              <div
                style={{
                  background: 'rgba(254, 240, 138, 0.18)',
                  border: '1.5px solid #F59E0B',
                  borderRadius: 10,
                  padding: isMobile ? '8px 10px' : '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: '0.84rem',
                  color: '#451A03',
                  lineHeight: 1.35,
                  boxShadow: '2px 2px 0 rgba(120, 53, 15, 0.2)',
                }}
              >
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>⛪</span>
                <div>
                  <strong style={{ color: '#92400E' }}>Kaple svaté vlny (Úr. {churchLevel}):</strong>
                  <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: 2 }}>
                    Při každém nákupu v nůši vyšle posvěcenou rázovou vlnu ({churchLevel * 100} zranění v okruhu 400 px)!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === RIGHT COLUMN: Market Shelf & Wares === */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 0,
            }}
          >
            {/* Status & Currencies Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                gap: 8,
                padding: '8px 12px',
                background: '#FEF3C7',
                border: '2px solid var(--ink)',
                borderRadius: 12,
                boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>🍪</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 800 }}>PERNÍČKY LOVCE</div>
                  <strong style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#5B2118' }}>
                    {gingerbread}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.4rem' }}>🏷️</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800 }}>ČEKACÍ SLEVA</div>
                  <strong style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#166534' }}>
                    −{discount}%
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  gridColumn: isMobile ? 'span 2' : 'auto',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🍀</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#1E3A8A', fontWeight: 800 }}>ŠTĚSTÍ LOVCE</div>
                    <strong style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#1E3A8A' }}>
                      {luck}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#78350F', fontWeight: 800 }}>NÁKUPŮ V RUNU</div>
                    <strong style={{ fontSize: '0.95rem', color: purchasedIds.length >= 12 ? '#166534' : '#78350F' }}>
                      {purchasedIds.length} / 12
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Wares Grid (Pulled items from the basket) */}
            {(!offers || offers.length === 0) ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  background: '#FEF3C7',
                  borderRadius: 14,
                  border: '2px dashed #92400E',
                  color: '#78350F',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: '3rem' }}>🧺</span>
                <span>Všechno zboží z nůše bylo vykoupeno! Děkuji ti, poutníče!</span>
                {onRefreshOffers && (
                  <button
                    onClick={handleReroll}
                    disabled={gingerbread < rerollCost}
                    style={{
                      marginTop: 8,
                      padding: '10px 20px',
                      fontWeight: 900,
                      borderRadius: 10,
                      border: '2px solid var(--ink)',
                      background: gingerbread >= rerollCost ? '#F59E0B' : '#D1D5DB',
                      color: gingerbread >= rerollCost ? '#2A170A' : '#6B7280',
                      cursor: gingerbread >= rerollCost ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🧺 Zalovit v nůši znovu (🍪 {rerollCost})
                  </button>
                )}
              </div>
            ) : (
              <div
                key={`offers-grid-${pullAnimationKey}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: isMobile ? 10 : 12,
                  alignContent: 'start',
                }}
              >
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
                  let buttonLabel = 'KOUPIT';

                  if (item.isWeapon && item.weaponId) {
                    const canonicalId = toCanonicalWeaponId(item.weaponId);
                    const pw = playerWeapons?.find((w: any) => toCanonicalWeaponId(w.id) === canonicalId);
                    owned = pw ? pw.level : 0;
                    maxStacks = item.maxStacks || 8;
                    isMaxed = owned >= maxStacks;
                    const nextRank = owned + 1;
                    const rankDef = nextRank <= 8 ? getWeaponRankDef(canonicalId, nextRank) : undefined;
                    const isMilestoneRank = !!rankDef?.isMilestone;

                    if (owned === 0) {
                      levelBadge = '⚔️ Nová zbraň';
                      buttonLabel = 'ZÍSKAT';
                    } else if (isMaxed) {
                      levelBadge = `⚔️ Úroveň: ${owned} / ${maxStacks} (MAX)`;
                      buttonLabel = 'VYČERPÁNO';
                    } else {
                      levelBadge = isMilestoneRank
                        ? `🌟 Úroveň: ${owned} ➔ ${nextRank} (MILNÍK!)`
                        : `⚔️ Úroveň: ${owned} / ${maxStacks}`;
                      displayName = `${item.name} (Úroveň ${nextRank})`;
                      displayDesc = isMilestoneRank
                        ? `Výběr ze dvou unikátních schopností na 3., 5. a 8. stupni zbraně!`
                        : (rankDef?.passiveBonusDescription || `Vylepšení na úroveň ${nextRank} (+12 % zranění, +8 % kadence, +6 % dosah)`);
                      buttonLabel = isMilestoneRank ? 'VYLEPŠIT MILNÍK' : 'VYLEPŠIT';
                    }
                  } else {
                    owned = purchasedIds.filter((id) => id === item.id).length;
                    maxStacks = item.maxStacks || 5;
                    isMaxed = item.maxStacks !== undefined && owned >= item.maxStacks;
                    levelBadge = `Úroveň: ${owned} / ${item.maxStacks || '∞'}`;
                    if (isMaxed) {
                      buttonLabel = 'VYČERPÁNO';
                    }
                  }

                  const affordable = gingerbread >= price && !isMaxed;
                  const isHighlighted = activeItem?.id === item.id;
                  const isPurchasedNow = justPurchasedId === item.id;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="item-pulled-from-basket"
                      onMouseEnter={() => handleItemHover(item)}
                      onMouseLeave={handleItemLeave}
                      onTouchStart={() => handleItemHover(item)}
                      style={{
                        animationDelay: `${idx * 0.08}s`,
                        border: item.isWeapon
                          ? isHighlighted ? '3px solid #DC2626' : '2.5px solid #9A3412'
                          : isHighlighted ? '2.5px solid #D97706' : '2px solid var(--ink)',
                        borderRadius: 14,
                        padding: isMobile ? '10px 12px' : '12px 14px',
                        background: isPurchasedNow
                          ? '#FEF08A'
                          : isMaxed
                            ? '#E5E7EB'
                            : isHighlighted
                              ? '#FFFDF5'
                              : affordable
                                ? item.isWeapon ? '#FFFBEB' : '#FFF7DF'
                                : '#F5E6CA',
                        boxShadow: isHighlighted
                          ? '0 0 14px rgba(245, 158, 11, 0.45), 3px 3px 0 var(--ink)'
                          : item.isWeapon
                            ? '3px 3px 0 rgba(154, 52, 18, 0.4)'
                            : '3px 3px 0 rgba(0,0,0,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                        transform: isHighlighted ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      {/* Card Content Top */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: item.isWeapon ? '#FEF2F2' : '#FEF3C7',
                              borderRadius: 10,
                              border: '1.5px solid #78350F',
                              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.08)',
                            }}
                          >
                            <GameIcon icon={item.icon} size={36} />
                          </div>

                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 900,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: isMaxed ? '#9CA3AF' : item.isWeapon ? '#FEE2E2' : '#FEF3C7',
                              color: isMaxed ? '#374151' : item.isWeapon ? '#991B1B' : '#78350F',
                              border: item.isWeapon ? '1px solid #DC2626' : '1px solid #78350F',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {levelBadge}
                          </span>
                        </div>

                        <h3
                          style={{
                            margin: '8px 0 3px',
                            color: '#5B2118',
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            fontWeight: 900,
                            lineHeight: 1.25,
                          }}
                        >
                          {displayName}
                        </h3>

                        <p
                          style={{
                            margin: '2px 0 10px',
                            minHeight: isMobile ? 'auto' : 38,
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            color: '#451A03',
                            lineHeight: 1.35,
                          }}
                        >
                          {displayDesc}
                        </p>
                      </div>

                      {/* Card Action Bottom */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 6,
                          paddingTop: 8,
                          borderTop: '1px dashed rgba(120, 53, 15, 0.3)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🍪</span>
                          <strong
                            style={{
                              fontSize: '1.15rem',
                              color: affordable ? '#5B2118' : '#9CA3AF',
                              fontWeight: 900,
                            }}
                          >
                            {price}
                          </strong>
                        </div>

                        <button
                          disabled={!affordable}
                          onClick={() => handlePurchase(item.id)}
                          style={{
                            minHeight: 42,
                            padding: isMobile ? '8px 14px' : '9px 18px',
                            fontWeight: 900,
                            fontSize: isMobile ? '0.88rem' : '0.94rem',
                            border: '2px solid var(--ink)',
                            borderRadius: 9,
                            cursor: affordable ? 'pointer' : 'not-allowed',
                            opacity: affordable ? 1 : 0.65,
                            background: isMaxed
                              ? '#D1D5DB'
                              : affordable
                                ? item.isWeapon ? '#F59E0B' : '#FBBF24'
                                : '#E5E7EB',
                            color: isMaxed ? '#4B5563' : '#2D1609',
                            boxShadow: affordable ? '2px 2px 0 var(--ink)' : 'none',
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.1s ease',
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
          </div>
        </div>

        {/* --- Bottom Controls Bar --- */}
        <div
          style={{
            background: '#FDF3DB',
            borderTop: '3px solid var(--ink)',
            padding: isMobile ? '10px 14px' : '14px 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? 8 : 16,
            flexWrap: 'wrap',
          }}
        >
          {onRefreshOffers && (
            <button
              onClick={handleReroll}
              disabled={gingerbread < rerollCost}
              style={{
                flex: isMobile ? '1' : 'none',
                minHeight: 46,
                padding: isMobile ? '10px 12px' : '12px 22px',
                fontWeight: 900,
                fontSize: isMobile ? '0.88rem' : '1rem',
                border: '2.5px solid var(--ink)',
                borderRadius: 10,
                background: gingerbread >= rerollCost ? '#FEF3C7' : '#E5E7EB',
                color: gingerbread >= rerollCost ? '#78350F' : '#9CA3AF',
                cursor: gingerbread >= rerollCost ? 'pointer' : 'not-allowed',
                boxShadow: gingerbread >= rerollCost ? '3px 3px 0 var(--ink)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
              title={
                gingerbread >= rerollCost
                  ? `Vytáhne z nůše další zboží (stojí ${rerollCost} perníčků)`
                  : `Nedostatek perníčků na zamíchání (stojí ${rerollCost} 🍪)`
              }
            >
              <span>🧺 ZAMÍCHAT NŮŠI</span>
              <span
                style={{
                  background: gingerbread >= rerollCost ? '#FDE68A' : '#D1D5DB',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--ink)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: gingerbread >= rerollCost ? '#78350F' : '#6B7280',
                }}
              >
                🍪 {rerollCost}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: isMobile ? '1' : 'none',
              minHeight: 46,
              padding: isMobile ? '10px 18px' : '12px 28px',
              fontWeight: 900,
              fontSize: isMobile ? '0.88rem' : '1rem',
              border: '2.5px solid var(--ink)',
              borderRadius: 10,
              background: '#DC2626',
              color: '#FFF',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 var(--ink)',
              whiteSpace: 'nowrap',
            }}
          >
            🚪 ZAVŘÍT NŮŠI
          </button>
        </div>
      </div>
    </div>
  );
}
