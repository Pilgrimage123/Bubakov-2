import React, { useState, useEffect, useCallback } from 'react';
import { GRANDFATHER_ITEMS, type GrandfatherItemDef } from '../data/grandfatherItems';
import {
  getGrandfatherPrice,
  getWaitDiscount,
  isGrandfatherPriceExempt,
  getGrandfatherInflatingPurchaseCount,
  getWeaponUpgradeOffer,
  replaceCourageOffersIfNeeded,
  type GrandfatherOffer,
} from '../game/grandfatherRuntime';
import { GameIcon } from './GameIcon';
import { PernicekIcon } from './PernicekIcon';
import { GrandfatherScene } from './GrandfatherScene';
import { sound } from '../audio';
import { LadaCardCorners } from './LadaCardCorners';
import { toCanonicalWeaponId } from '../game/migration';
import {
  getWeaponRankDef,
  getWeaponNormalUpgrade,
  getWeaponCooldownReduction,
  getWeaponCooldownReductionHeadroom,
  isWeaponAtCooldownCap,
  isWeaponNearCooldownCap,
} from '../data/weaponMilestones';

interface Props {
  gingerbread: number;
  luck: number;
  waitSeconds: number;
  offers: GrandfatherOffer[];
  purchasedIds: string[];
  playerWeapons?: any[];
  purchasesThisEncounter: number;
  totalPurchases?: number;
  rerollCost?: number;
  churchLevel?: number;
  playerHp: number;
  playerMaxHp: number;
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
  if (item.id === 'sedmimile_krpce') {
    return '„Sedmimílové krpce! S těmi utečeš i polednici za pravého poledne!“';
  }
  if (item.id === 'pytlacka_lucerna') {
    return '„Pytlácká petrolejka! Posvítí do křoví a všechny perníčky i krejcary k tobě v mžiku vletí!“';
  }
  if (item.id === 'podkova_pro_stesti') {
    return '„Podkova a čtyřlístek pro štěstí! S tím ti osud i rány budou přát!“';
  }
  if (item.id === 'bylinkova_fajfka') {
    return '„Bylinková fajfka! Z mých tajných sušených bylin, zahalí tě léčivým dýmem a běsy zažene!“';
  }
  if (item.id === 'krvave_jelito') {
    return '„Poctivé krvavé jelito ze zabijačky! Síla a zranění jak ze žuly!“';
  }
  if (item.id === 'opravdova_kava') {
    return '„Opravdová zrnková káva od zámořských kupců! Zbraně ti budou nabíjet jedna báseň!“';
  }
  if (item.id === 'medvedi_mast') {
    return '„Hojivá medvědí mast! Zacelí každý šrám a kousnutí od nočních můr!“';
  }
  if (item.id === 'maska_medveda') {
    return '„Masopustní maska medvěda! Všechen přebytek tvé kuráže vyšlehne na bubáky jako hromová rána!“';
  }
  if (item.effect.type === 'heal') {
    if (item.id === 'tepla_cikorka') return '„Teplá cikorka, pocuchané nervy i Kuráž dá do pořádku!“';
    if (item.id === 'zejdlik_piva') return '„Žejdlík poctivého piva, a hned ti naroste kuráž!“';
    if (item.id === 'panak_koralky') return '„Panák kořalky na zahřátí — jen ať se ti nohy nerozklepou!“';
  }
  if (item.effect.type === 'coins') return `„${item.name}! Pekelný poklad, hned ti za něj sypu krejcary!“`;
  if (item.id === 'ponocny_horn') return '„Trouba obecního ponocného! Zmrazí každé strašidlo i střely a celá vesnice ztichne pod mrazem!“';
  if (item.id === 'masopust_rattle') return '„Masopustní řehtačka! Udělá takový randál, že se bubáci rozpadnou na slámu, konfety a škvarky!“';
  if (item.id === 'babicka_apron') return '„Babiččina kropenatá zástěra! Všechny perníčky, groše a poklady z celé louky ti v mžiku vletí do kapes!“';
  if (item.id === 'slivovice_splash') return '„Pořádný hlt domácí slivovice z modrého džbánku! Vyžene neduhy, omráčí potvory a střely se rozhoří modrým plamenem!“';
  if (item.id === 'svanda_bagpipes') return '„Dudácká čertovská skočná! Jakmile Švanda zadudá, čerti i bubáci se začnou mlátit mezi sebou a nechají tě být!“';
  if (item.id === 'kominik_button') return '„Kominický knoflík pro štěstí! Šáhni na něj a projdeš každým hejnem jako černý stín s jistými kritickými ranami!“';
  if (item.id === 'kovarska_podkova') return '„Poctivá podkova z panské kovárny! Všechny perníčky, krejcary a dušičky z celé louky se k tobě v mžiku sletí!“';
  if (item.id === 'hlineny_kohoutek') return '„Malovaný hliněný kohoutek! Jakmile zakokrhá na ranní rozbřesk, noční havěť se rozprchne a bossové dostanou pořádnou ránu!“';
  if (item.id === 'vyrezavane_kukacky') return '„Vyřezávané kukačky ze Šumavy! Když zakukají, čas se na čtyři vteřiny úplně zastaví!“';
  if (item.id === 'arcivzacny_ananas') return '„Vzácný ovocný klenot z dálného Žaponska si může dovolit jen pravý pan baron!“';
  if (item.id === 'wp_whip') return '„Formanský bič! Poctivá kožená práce s jasanovým bičištěm — práskni a žádný zbojník ani bubák se ti nenapřáhne!“';
  if (item.id === 'trikralova_krida') return '„Posvěcená tříkrálová křída od svatého Jiří! Napiš na zem K+M+B a žádný čert ani umrlec přes práh nepřejde!“';
  if (item.id === 'strouhany_kren') return '„Čerstvě strouhaný křen z mé zahrádky v ubrousku! Protáhne dutiny tak, že i kostlivci začnou slzet a mlsat!“';
  if (item.id === 'poutove_srdce') return '„Malované perníkové srdce z pouti! Babičce jsem ho kdysi koupil za mlada — mlsni si a hned máš víc elánu a sil!“';
  if (item.id === 'ulezely_syrecek') return '„Poctivě uzrálý tvarůžek zapomenutý v kapse u vesty! Voní tak důrazně, že i otrlý kostlivec raději přejde na druhý břeh rybníka!“';
  if (item.id === 'pivni_tacek') return '„Umaštěný tácek z hospody U Černého kocoura! Šenkýř tam připsal o pět čárek víc, než jsi vypil — a tenhle účet teď zaplatí bubáci!“';
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
  totalPurchases,
  rerollCost = 4,
  churchLevel = 0,
  playerHp,
  playerMaxHp,
  onPurchase,
  onRefreshOffers,
  onClose,
}: Props) {
  const discount = Math.round(getWaitDiscount(waitSeconds) * 100);
  const visibleOffers = replaceCourageOffersIfNeeded(
    offers,
    gingerbread,
    luck,
    purchasedIds,
    playerWeapons,
    { playerHp, playerMaxHp },
    4,
  );

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
    const weaponUpgrade = getWeaponUpgradeOffer(itemId);
    if (!item && !weaponUpgrade) return;

    const success = onPurchase(itemId);
    if (success) {
      if (item && (item.isRareInstant || item.effect.type === 'coins')) {
        // onPurchase applies the gameplay effect synchronously before closing the shop.
        onClose();
        return;
      }

      setJustPurchasedId(itemId);
      setSceneState('purchasing');
      setQuote(PURCHASE_QUOTES[Math.floor(Math.random() * PURCHASE_QUOTES.length)]);

      setTimeout(() => {
        setJustPurchasedId(null);
        setSceneState('idle');
      }, 950);
    }
  }, [onPurchase, onClose]);

  // Keyboard shortcuts (Escape to close, 1-4 to purchase, R to reroll)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const offer = visibleOffers[idx];
        if (offer && !purchasedIds.includes(offer.itemId)) {
          const item = GRANDFATHER_ITEMS.find((it) => it.id === offer.itemId);
          const weaponUpgrade = getWeaponUpgradeOffer(offer.itemId);
          const pricedItem = item ?? (weaponUpgrade ? {
            id: weaponUpgrade.id,
            name: weaponUpgrade.name,
            icon: weaponUpgrade.icon,
            description: weaponUpgrade.description,
            baseCost: weaponUpgrade.baseCost,
            effect: { type: 'luck', amount: 0 },
          } as GrandfatherItemDef : undefined);
          const purchaseCount = getGrandfatherInflatingPurchaseCount(purchasedIds);
          const price = pricedItem ? getGrandfatherPrice(pricedItem, purchaseCount, luck, waitSeconds) : 999;
          if (gingerbread >= price) {
            e.preventDefault();
            handlePurchase(offer.itemId);
          }
        }
        return;
      }
      if ((e.key === 'r' || e.key === 'R') && onRefreshOffers && gingerbread >= rerollCost) {
        e.preventDefault();
        handleReroll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, visibleOffers, purchasedIds, gingerbread, luck, waitSeconds, rerollCost, onRefreshOffers, handlePurchase, handleReroll]);

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
            <GameIcon icon="basket" size={isMobile ? 28 : 34} />
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <GameIcon icon="cancel" size={15} /> ZAVŘÍT
          </button>
        </div>

        {/* --- Main Content Split (Stage on Left / Shelves on Right) --- */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            overflowY: 'auto',
            minHeight: 0,
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
              order: isMobile ? 2 : 1,
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
                <GameIcon icon="idea" size={20} />
                <div>
                  <strong>Čekací sleva:</strong> Čím déle dědeček čekal na rozcestí v lese, tím větší slevu na perníčky ti nabízí (nyní <strong>−{discount}%</strong>)!
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
              order: isMobile ? 1 : 2,
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
                <PernicekIcon size={24} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 800 }}>PERNÍČKY LOVCE</div>
                  <strong style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#5B2118' }}>
                    {gingerbread}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GameIcon icon="scroll" size={22} />
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
                <GameIcon icon="luck" size={22} />
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
            {visibleOffers.length === 0 ? (
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
                <GameIcon icon="basket" size={48} />
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <GameIcon icon="basket" size={16} />
                      <span>Zalovit v nůši znovu (</span>
                      <PernicekIcon size={16} />
                      <span>{rerollCost})</span>
                    </span>
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
                {visibleOffers.map((offer, idx) => {
                  const weaponUpgrade = getWeaponUpgradeOffer(offer.itemId);
                  const item = GRANDFATHER_ITEMS.find((candidate) => candidate.id === offer.itemId);
                  if (!item && !weaponUpgrade) return null;

                  const purchaseCount = getGrandfatherInflatingPurchaseCount(purchasedIds);
                  const price = getGrandfatherPrice(
                    weaponUpgrade
                      ? { id: weaponUpgrade.id, name: weaponUpgrade.name, icon: weaponUpgrade.icon, description: weaponUpgrade.description, baseCost: weaponUpgrade.baseCost, effect: { type: 'luck', amount: 0 } } as GrandfatherItemDef
                      : item!,
                    purchaseCount, luck, waitSeconds
                  );
                  const priceExempt = item ? isGrandfatherPriceExempt(item) : false;

                  let owned = 0;
                  let maxStacks = item?.maxStacks || 5;
                  let isMaxed = false;
                  let displayName = weaponUpgrade?.name ?? item!.name;
                  let displayDesc = weaponUpgrade?.description ?? item!.description;
                  let levelBadge = '';
                  let buttonLabel = 'KOUPIT';

                  if (weaponUpgrade) {
                    levelBadge = 'Specializace projektilové zbraně';
                    buttonLabel = 'VYLEPŠIT';
                  } else if (item?.isWeapon && item.weaponId) {
                    const canonicalId = toCanonicalWeaponId(item.weaponId);
                    const pw = playerWeapons?.find((w: any) => toCanonicalWeaponId(w.id) === canonicalId);
                    owned = pw ? pw.level : 0;
                    maxStacks = item!.maxStacks || 8;
                    isMaxed = owned >= maxStacks;
                    const nextRank = owned + 1;
                    const rankDef = nextRank <= 8 ? getWeaponRankDef(canonicalId, nextRank) : undefined;
                    const isMilestoneRank = !!rankDef?.isMilestone;
                    const candidateUpgrade = offer.candidateUpgradeId
                      ? getWeaponNormalUpgrade(offer.candidateUpgradeId)
                      : (rankDef?.normalUpgradeId ? getWeaponNormalUpgrade(rankDef.normalUpgradeId) : undefined);
                    const headroom = getWeaponCooldownReductionHeadroom(pw);
                    const isNearCap = isWeaponNearCooldownCap(pw);
                    const isAtCap = isWeaponAtCooldownCap(pw);

                    if (owned === 0) {
                      levelBadge = 'Nová zbraň';
                      buttonLabel = 'ZÍSKAT';
                    } else if (isMaxed) {
                      levelBadge = `Úroveň: ${owned} / ${maxStacks} (MAX)`;
                      buttonLabel = 'VYČERPÁNO';
                    } else {
                      levelBadge = isMilestoneRank
                        ? `Úroveň: ${owned} → ${nextRank} (MILNÍK!)`
                        : `Úroveň: ${owned} / ${maxStacks}`;
                      displayName = `${item!.name} (Úroveň ${nextRank})`;
                      if (isMilestoneRank) {
                        displayDesc = `Výběr ze dvou unikátních schopností na 3., 5. a 8. stupni zbraně!`;
                      } else if (candidateUpgrade) {
                        displayDesc = `${candidateUpgrade.name}: ${candidateUpgrade.ui_text}`;
                        if (isAtCap) {
                          displayDesc += ` • Strop kadence (-75 %) dosažen`;
                        } else if (candidateUpgrade.stats.cooldown_reduction > 0 && isNearCap) {
                          displayDesc += ` • Zbývá ${Math.round(headroom * 100)} % do stropu kadence (-75 %)`;
                        }
                      } else {
                        displayDesc = rankDef?.passiveBonusDescription || `Vylepšení na úroveň ${nextRank}`;
                      }

                      buttonLabel = isMilestoneRank ? 'VYLEPŠIT MILNÍK' : 'VYLEPŠIT';
                    }
                  } else if (item?.isRareInstant) {
                    levelBadge = 'Okamžitý zásah';
                    buttonLabel = 'POUŽÍT';
                    displayDesc = `${item!.description} (Ihned zavře nůši a spustí se na louce!)`;
                  } else if (item?.isAnanas) {
                    owned = purchasedIds.filter((id) => id === item!.id).length;
                    maxStacks = item!.maxStacks || 2;
                    isMaxed = owned >= maxStacks;
                    levelBadge = isMaxed ? 'Arcivzácné (MAX)' : 'Arcivzácné (2,5×)';
                    buttonLabel = isMaxed ? 'VYČERPÁNO' : 'KOUPIT';
                  } else {
                    owned = purchasedIds.filter((id) => id === item!.id).length;
                    maxStacks = item!.maxStacks || 5;
                    isMaxed = item?.maxStacks !== undefined && owned >= item!.maxStacks;
                    levelBadge = `Úroveň: ${owned} / ${item?.maxStacks || '∞'}`;
                    if (isMaxed) {
                      buttonLabel = 'VYČERPÁNO';
                    }
                  }

                  const fullCourage = item?.effect.type === 'heal' && playerHp >= playerMaxHp;
                  const affordable = gingerbread >= price && !isMaxed && !fullCourage;
                  const isHighlighted = activeItem?.id === item?.id || (!!weaponUpgrade && activeItem === null);
                  const isPurchasedNow = justPurchasedId === offer.itemId;

                  return (
                    <div
                      key={`${offer.itemId}-${idx}`}
                      className="item-pulled-from-basket"
                      onMouseEnter={() => item && handleItemHover(item)}
                      onMouseLeave={handleItemLeave}
                      onTouchStart={() => item && handleItemHover(item)}
                      style={{
                        animationDelay: `${idx * 0.08}s`,
                        border: item?.isAnanas
                          ? isHighlighted ? '3px solid #EAB308' : '2.5px solid #CA8A04'
                          : item?.isRareInstant
                          ? isHighlighted ? '3px solid #38BDF8' : '2.5px solid #0284C7'
                          : item?.isWeapon
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
                                ? item?.isAnanas
                                  ? '#FEF9C3'
                                  : item?.isRareInstant
                                  ? '#F0F9FF'
                                  : item?.isWeapon ? '#FFFBEB' : '#FFF7DF'
                                : '#F5E6CA',
                        boxShadow: isHighlighted
                          ? item?.isRareInstant
                            ? '0 0 14px rgba(56, 189, 248, 0.45), 3px 3px 0 var(--ink)'
                            : item?.isAnanas
                            ? '0 0 14px rgba(234, 179, 8, 0.5), 3px 3px 0 var(--ink)'
                            : '0 0 14px rgba(245, 158, 11, 0.45), 3px 3px 0 var(--ink)'
                          : item?.isWeapon
                            ? '3px 3px 0 rgba(154, 52, 18, 0.4)'
                            : '3px 3px 0 rgba(0,0,0,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                        transform: isHighlighted ? 'translateY(-2px)' : 'none',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {/* Card Content Top */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: item?.isWeapon ? '#FEF2F2' : '#FEF3C7',
                              borderRadius: 10,
                              border: '1.5px solid #78350F',
                              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.08)',
                              flexShrink: 0,
                            }}
                          >
                            <GameIcon icon={weaponUpgrade?.icon ?? item?.icon ?? 'sparkles'} size={36} />
                          </div>

                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 900,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: isMaxed ? '#9CA3AF' : item?.isWeapon ? '#FEE2E2' : '#FEF3C7',
                              color: isMaxed ? '#374151' : item?.isWeapon ? '#991B1B' : '#78350F',
                              border: item?.isWeapon ? '1px solid #DC2626' : '1px solid #78350F',
                              maxWidth: '100%',
                              overflowWrap: 'break-word',
                              textAlign: 'right',
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
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
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
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
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
                          <PernicekIcon size={20} />
                          <strong
                            style={{
                              fontSize: '1.15rem',
                              color: affordable ? '#5B2118' : '#9CA3AF',
                              fontWeight: 900,
                            }}
                          >
                            {price}
                          </strong>
                          {priceExempt && item && <small style={{ color: '#78350F', fontWeight: 800 }}>{item!.effect.type === 'coins' ? 'perníčků • výplata v krejcarech' : 'perníčků • cena bez přirážky'}</small>}
                        </div>

                        <button
                          disabled={!affordable}
                          onClick={() => handlePurchase(offer.itemId)}
                          title={affordable ? `Koupit (Klávesa ${idx + 1})` : undefined}
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
                                ? item?.isWeapon ? '#F59E0B' : '#FBBF24'
                                : '#E5E7EB',
                            color: isMaxed ? '#4B5563' : '#2D1609',
                            boxShadow: affordable ? '2px 2px 0 var(--ink)' : 'none',
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.1s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          {isMaxed ? (
                            'VYČERPÁNO'
                          ) : fullCourage ? (
                            'PLNÁ KURÁŽ'
                          ) : affordable ? (
                            <>
                              <span
                                style={{
                                  background: 'rgba(0, 0, 0, 0.18)',
                                  border: '1px solid rgba(0, 0, 0, 0.25)',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  fontSize: '0.8rem',
                                  fontFamily: 'var(--font-ui)',
                                  lineHeight: 1,
                                }}
                              >
                                [{idx + 1}]
                              </span>
                              <span>{buttonLabel}</span>
                            </>
                          ) : (
                            'MÁLO PERNÍKŮ'
                          )}
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
                  ? `Vytáhne z nůše další zboží [Klávesa R] (stojí ${rerollCost} perníčků)`
                  : `Nedostatek perníčků na zamíchání (stojí ${rerollCost} perníčků)`
              }
            >
              <span
                style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-ui)',
                  lineHeight: 1,
                }}
              >
                [R]
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <GameIcon icon="basket" size={18} /> ZAMÍCHAT NŮŠI
              </span>
              <span
                style={{
                  background: gingerbread >= rerollCost ? '#FDE68A' : '#D1D5DB',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--ink)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: gingerbread >= rerollCost ? '#78350F' : '#6B7280',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <PernicekIcon size={14} /> {rerollCost}
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: isMobile ? '1' : 'none',
              minHeight: 46,
              padding: isMobile ? '10px 16px' : '12px 26px',
              fontWeight: 900,
              fontSize: isMobile ? '0.88rem' : '1rem',
              border: '2.5px solid var(--ink)',
              borderRadius: 10,
              background: 'var(--wood-dark)',
              color: 'var(--parchment)',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
            title="Zavřít obchod a pokračovat ve hře [Klávesa Escape]"
          >
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: '0.82rem',
                fontFamily: 'var(--font-ui)',
                lineHeight: 1,
              }}
            >
              [Esc]
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="cottage" size={18} /> ZAVŘÍT NŮŠI
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
