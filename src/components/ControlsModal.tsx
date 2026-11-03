import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../audio';
import { KrejcarIcon } from './KrejcarIcon';
import { PernicekIcon } from './PernicekIcon';
import { HruskaIcon } from './HruskaIcon';
import { GameIcon } from './GameIcon';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';
import { LadaGrandfatherCanvasPreview } from './LadaGrandfatherCanvasPreview';
import {
  LadaDropCap,
  LadaLindenVineta,
} from './LadaStorybookSpread';
import { ladaPageFoley } from './ladaPageTurnAudio';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

type ControlsChapterId = 'controls' | 'objective' | 'dedecek' | 'weapons' | 'village';

const CONTROLS_CHAPTER_ORDER: ControlsChapterId[] = [
  'controls',
  'objective',
  'dedecek',
  'weapons',
  'village',
];

const CONTROLS_CHAPTER_META: Record<
  ControlsChapterId,
  {
    folio: string;
    pages: string;
    ribbonClass: string;
    shortLabel: string;
  }
> = {
  controls: {
    folio: 'Kapitola I · Jak hrát a ovládání',
    pages: 'Str. 1–2',
    ribbonClass: 'ribbon-poppy',
    shortLabel: 'Jak hrát a ovládání',
  },
  objective: {
    folio: 'Kapitola II · Cíl výpravy a kraje',
    pages: 'Str. 3–4',
    ribbonClass: 'ribbon-cobalt',
    shortLabel: 'Cíl výpravy a kraje',
  },
  dedecek: {
    folio: 'Kapitola III · Čertův dědeček a perníčky',
    pages: 'Str. 5–6',
    ribbonClass: 'ribbon-ochre',
    shortLabel: 'Čertův dědeček',
  },
  weapons: {
    folio: 'Kapitola IV · Venkovská zbrojnice a zbraně',
    pages: 'Str. 7–8',
    ribbonClass: 'ribbon-willow',
    shortLabel: 'Zbraně a výstroj',
  },
  village: {
    folio: 'Kapitola V · Hospoda a obecní vylepšení',
    pages: 'Str. 9–10',
    ribbonClass: 'ribbon-poppy',
    shortLabel: 'Hospoda a obec',
  },
};

export const ControlsModal: React.FC<ControlsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'controls',
}) => {
  const [activeTab, setActiveTab] = useState<ControlsChapterId>('controls');
  const [controlsInputMode, setControlsInputMode] = useState<'touch' | 'keyboard' | 'gamepad'>(() => {
    if (typeof window === 'undefined') return 'touch';
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 840;
    return isTouch ? 'touch' : 'keyboard';
  });

  const switchChapterWithPageTurn = useCallback(
    (targetTab: ControlsChapterId) => {
      if (targetTab === activeTab) return;
      setActiveTab(targetTab);
      sound.coin();
      if (sound.enabled) {
        ladaPageFoley.playCornerHover();
      }
    },
    [activeTab]
  );

  const handleStepChapter = useCallback(
    (delta: 1 | -1) => {
      const curIdx = CONTROLS_CHAPTER_ORDER.indexOf(activeTab);
      const nextIdx =
        (curIdx + delta + CONTROLS_CHAPTER_ORDER.length) % CONTROLS_CHAPTER_ORDER.length;
      switchChapterWithPageTurn(CONTROLS_CHAPTER_ORDER[nextIdx]);
    },
    [activeTab, switchChapterWithPageTurn]
  );

  useEffect(() => {
    if (isOpen) {
      const validTabs: ControlsChapterId[] = ['controls', 'objective', 'dedecek', 'weapons', 'village'];
      const next = validTabs.includes(defaultTab as ControlsChapterId)
        ? (defaultTab as ControlsChapterId)
        : 'controls';
      setActiveTab(next);
    }
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.coin();
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleStepChapter(1);
      } else if (e.key === 'ArrowLeft') {
        handleStepChapter(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleStepChapter]);

  if (!isOpen) return null;

  const chapterMeta = CONTROLS_CHAPTER_META[activeTab] || CONTROLS_CHAPTER_META.controls;
  const activeIdx = CONTROLS_CHAPTER_ORDER.indexOf(activeTab);

  const renderControlsChapterContent = (tabId: ControlsChapterId) => (
    <>
          {/* TAB 1: HOW TO PLAY, CONTROLS & MOVEMENT */}
          {tabId === 'controls' && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* INPUT MODE BAR (TOUCH / KEYBOARD / GAMEPAD) — Styled in Josef Lada Gouache Tones */}
              <div className="controls-mode-bar">
                <button
                  type="button"
                  className={`controls-mode-btn ${controlsInputMode === 'touch' ? 'active' : ''}`}
                  style={{
                    background: controlsInputMode === 'touch' ? '#C83E2B' : '#F6EBD8',
                    color: controlsInputMode === 'touch' ? '#F6EBD8' : '#221B17',
                    borderColor: '#1C1613',
                    boxShadow: controlsInputMode === 'touch' ? '3px 3px 0 #1C1613' : '1.5px 1.5px 0 #1C1613',
                  }}
                  onClick={() => {
                    sound.coin();
                    ladaPageFoley.playCornerHover();
                    setControlsInputMode('touch');
                  }}
                >
                  <GameIcon icon="compass" size={16} /> 📱 Dotyk (Mobil &amp; Tablet)
                </button>
                <button
                  type="button"
                  className={`controls-mode-btn ${controlsInputMode === 'keyboard' ? 'active' : ''}`}
                  style={{
                    background: controlsInputMode === 'keyboard' ? '#2B5B84' : '#F6EBD8',
                    color: controlsInputMode === 'keyboard' ? '#F6EBD8' : '#221B17',
                    borderColor: '#1C1613',
                    boxShadow: controlsInputMode === 'keyboard' ? '3px 3px 0 #1C1613' : '1.5px 1.5px 0 #1C1613',
                  }}
                  onClick={() => {
                    sound.coin();
                    ladaPageFoley.playCornerHover();
                    setControlsInputMode('keyboard');
                  }}
                >
                  <GameIcon icon="gamepad" size={16} /> ⌨️ Klávesnice &amp; Myš
                </button>
                <button
                  type="button"
                  className={`controls-mode-btn ${controlsInputMode === 'gamepad' ? 'active' : ''}`}
                  style={{
                    background: controlsInputMode === 'gamepad' ? '#4D784E' : '#F6EBD8',
                    color: controlsInputMode === 'gamepad' ? '#F6EBD8' : '#221B17',
                    borderColor: '#1C1613',
                    boxShadow: controlsInputMode === 'gamepad' ? '3px 3px 0 #1C1613' : '1.5px 1.5px 0 #1C1613',
                  }}
                  onClick={() => {
                    sound.coin();
                    ladaPageFoley.playCornerHover();
                    setControlsInputMode('gamepad');
                  }}
                >
                  <GameIcon icon="game" size={16} /> 🎮 Herní ovladač
                </button>
              </div>

              {/* JAK HRÁT: KOSENÍ STRAŠIDEL PO ČESKU (Bookplate Card with Illuminated Drop Cap) */}
              <div
                className="lada-ex-libris-slip"
                style={{
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, #F6EBD8 0%, #F2E5C6 100%)',
                  border: '3.5px solid #1C1613',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#221B17',
                  boxShadow: '4px 4px 0 #1C1613',
                  boxSizing: 'border-box',
                }}
              >
                <span className="lada-brass-pin" aria-hidden="true" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-signpost)',
                      fontSize: 'clamp(1.08rem, 3.5vw, 1.35rem)',
                      fontWeight: 900,
                      color: '#C83E2B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <GameIcon icon="wheat" size={22} />
                    <span>Co je to Bubákov a jak hrát?</span>
                  </span>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {controlsInputMode === 'touch' && (
                      <>
                        <span className="keycap keycap-accent" style={{ background: '#F6EBD8', borderColor: '#2B5B84', color: '#2B5B84', fontSize: '0.8rem', padding: '2px 8px' }}>🕹️ Kormidlo</span>
                        <span className="keycap keycap-accent" style={{ background: '#F6EBD8', borderColor: '#C83E2B', color: '#C83E2B', fontSize: '0.8rem', padding: '2px 8px' }}>⚡ Schopnost</span>
                        <span className="keycap keycap-accent" style={{ background: '#FEF3C7', borderColor: '#6E3B1E', color: '#6E3B1E', fontSize: '0.8rem', padding: '2px 8px' }}>🧺 Dotyk [E]</span>
                      </>
                    )}
                    {controlsInputMode === 'keyboard' && (
                      <>
                        <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>WASD / Šipky</span>
                        <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>Mezerník</span>
                        <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>E</span>
                      </>
                    )}
                    {controlsInputMode === 'gamepad' && (
                      <>
                        <span className="keycap keycap-accent" style={{ background: '#DCFCE7', borderColor: '#166534', color: '#14532D', fontSize: '0.82rem', padding: '2px 8px' }}>Páčka / Kříž</span>
                        <span className="keycap keycap-accent" style={{ background: '#DCFCE7', borderColor: '#166534', color: '#14532D', fontSize: '0.82rem', padding: '2px 8px' }}>RB / B</span>
                        <span className="keycap keycap-accent" style={{ background: '#DCFCE7', borderColor: '#166534', color: '#14532D', fontSize: '0.82rem', padding: '2px 8px' }}>X</span>
                      </>
                    )}
                  </div>
                </div>
                <p style={{ margin: '0 0 10px 0', fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.5, color: '#221B17', minHeight: '58px' }}>
                  <LadaDropCap letter="B" variant="poppy" />
                  <strong>ubákov</strong> je akční pohádková výprava o <strong>kosení celých houfů strašidel</strong> – oddychová záležitost zasazená do pohodové, ladovské atmosféry českého venkova. Vaše zbraně <strong>automaticky kosí strašidla</strong> kolem vás a vy jen šikovně kličkujete, sbíráte perníčky a odemykáte vylepšení. Na konci výpravy pak máte čirou radost z toho, jak moc vám to na všechny strany střílí a kolik stovek potvor zvládnete naráz vykosit!
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                    gap: '8px',
                    marginTop: '6px',
                    clear: 'both',
                  }}
                >
                  <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35, boxShadow: '2px 2px 0 #1C1613' }}>
                    <strong style={{ color: '#C83E2B', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <GameIcon icon="lightning" size={16} /> 1. {controlsInputMode === 'touch' ? 'Tlačítko ⚡ Speciální schopnost:' : controlsInputMode === 'gamepad' ? '[RB / B] Speciální schopnost:' : '[Mezerník] Speciální zbraň:'}
                    </strong>
                    {controlsInputMode === 'touch'
                      ? 'Každý lovec má silnou unikátní schopnost. Jakmile se v boji dole nabije (zlatá pulzující záře), odpálíte ji klepnutím na velké kruhové tlačítko s bleskem vpravo dole!'
                      : controlsInputMode === 'gamepad'
                      ? 'Každý lovec má silnou schopnost. Jakmile se dole nabije, odpálíte ji tlačítkem [RB] nebo [B] na ovladači.'
                      : 'Každý lovec má silnou speciální schopnost. Jakmile se dole nabije, odpálíte ji Mezerníkem.'}
                  </div>
                  <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35, boxShadow: '2px 2px 0 #1C1613' }}>
                    <strong style={{ color: '#8F5330', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <PernicekIcon size={16} /> 2. {controlsInputMode === 'touch' ? 'Dotyková Nůše a Perníčky:' : controlsInputMode === 'gamepad' ? '[X] Perníčky a Čertův dědeček:' : '[E] Perníčky a Čertův dědeček:'}
                    </strong>
                    {controlsInputMode === 'touch'
                      ? 'Když nasbíráte perníčky z bubáků, přiběhne Čertův dědeček. Poblíž něj klepněte na velké dotykové tlačítko [OTEVŘÍT NŮŠI] a vyměňte perníčky za zbraně a dary!'
                      : controlsInputMode === 'gamepad'
                      ? 'Když nasbíráte perníčky, přijde Čertův dědeček. Poblíž něj stiskněte [X] na ovladači a vyměňte perníčky za zbraně.'
                      : 'Když nasbíráte perníčky z bubáků, přijde za vámi velký Čertův dědeček. Poblíž něj stiskněte E a vyměňte perníčky za nové zbraně a vylepšení!'}
                  </div>
                  <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35, boxShadow: '2px 2px 0 #1C1613' }}>
                    <strong style={{ color: '#4D784E', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                      <GameIcon icon="compass" size={16} /> 3. {controlsInputMode === 'touch' ? 'Dotyk u prvků krajiny:' : controlsInputMode === 'gamepad' ? '[X] Interakce s krajinou:' : '[E] Interakce s krajinou:'}
                    </strong>
                    {controlsInputMode === 'touch'
                      ? 'V krajině jde interagovat s řadou prvků – u kostela, hospody či kapličky, s malovanými truhlami nebo bubáckými dírami (vyskočí velké dotykové tlačítko).'
                      : controlsInputMode === 'gamepad'
                      ? 'V krajině můžete interagovat u kostela, hospody, kapličky či s truhlami stisknutím tlačítka [X].'
                      : 'V krajině jde interagovat s řadou prvků – u kostela, hospody či kapličky, s malovanými truhlami nebo folklórními předměty (stiskněte E).'}
                  </div>
                </div>
              </div>

              <LadaLindenVineta />

              {/* DEDICATED TOUCHSCREEN GUIDE (WHEN TOUCH MODE IS ACTIVE) */}
              {controlsInputMode === 'touch' && (
                <>
                  {/* VISUAL TOUCH SCREEN DIAGRAM */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #25382C 0%, #18261D 100%)',
                      border: '3.5px solid #1C1613',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      color: '#F6EBD8',
                      boxShadow: '4px 4px 0 #1C1613',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#E2A83B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GameIcon icon="compass" size={22} />
                        <span>Ladovské rozložení dotykového displeje v boji</span>
                      </span>
                    </div>

                    {/* Stylized Screen Representation */}
                    <div
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(43, 91, 132, 0.52) 0%, rgba(28, 22, 19, 0.95) 100%)',
                        border: '2.5px solid #E2A83B',
                        borderRadius: '8px',
                        padding: '12px',
                        margin: '8px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        position: 'relative',
                      }}
                    >
                      {/* Top bar mockup */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(246, 235, 216, 0.35)', paddingBottom: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#F6EBD8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>❤️ Kuráž lovce</span> · <span>⏱️ Čas výpravy</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <span style={{ background: '#221B17', border: '1.5px solid #E2A83B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#E2A83B', fontWeight: 800 }}>⏸️ Pauza</span>
                          <span style={{ background: '#221B17', border: '1.5px solid #E2A83B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#E2A83B', fontWeight: 800 }}>🔊 Zvuk</span>
                        </div>
                      </div>

                      {/* Middle battle zone mockup */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '85px', position: 'relative' }}>
                        {/* Left: Virtual Joystick */}
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '2.5px solid #E2A83B',
                            background: 'rgba(43, 91, 132, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 12px rgba(226, 168, 59, 0.3)',
                            flexDirection: 'column',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2B5B84', border: '2px solid #F6EBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                            🕹️
                          </div>
                          <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#F6EBD8', marginTop: '2px' }}>KORMIDLO</span>
                        </div>

                        {/* Center: Context Action Button */}
                        <div
                          style={{
                            padding: '6px 10px',
                            background: 'linear-gradient(135deg, #E2A83B 0%, #8F5330 100%)',
                            border: '2px solid #F6EBD8',
                            borderRadius: '6px',
                            color: '#1C1613',
                            textAlign: 'center',
                            fontSize: '0.74rem',
                            fontWeight: 900,
                            boxShadow: '2px 2px 0 #1C1613',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <PernicekIcon size={14} /> <span>[E] OTEVŘÍT NŮŠI</span>
                          </div>
                          <div style={{ fontSize: '0.62rem', opacity: 0.92 }}>Objeví se u Dědečka a památek</div>
                        </div>

                        {/* Right: Ultimate Button */}
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            border: '2.5px solid #E2A83B',
                            background: 'radial-gradient(circle, #C83E2B 0%, #7F1D14 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 12px rgba(200, 62, 43, 0.5)',
                            flexDirection: 'column',
                            textAlign: 'center',
                          }}
                        >
                          <GameIcon icon="lightning" size={24} />
                          <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#F6EBD8' }}>SCHOPNOST</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#F2E5C6', fontStyle: 'italic', textAlign: 'center', borderTop: '1px dashed rgba(246, 235, 216, 0.3)', paddingTop: '4px' }}>
                        Kdekoliv v levé polovině obrazovky položíte palec, dotykové kormidlo se vystředí pod prst pro okamžitý 360° pohyb.
                      </div>
                    </div>

                    {/* Touch screen features cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '8px', marginTop: '10px' }}>
                      <div style={{ background: 'rgba(246, 235, 216, 0.1)', border: '1.5px solid rgba(226, 168, 59, 0.45)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.84rem' }}>
                        <strong style={{ color: '#E2A83B', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          🕹️ Plovoucí dotykové kormidlo:
                        </strong>
                        Položte palec do levé části displeje a táhněte v libovolném směru. Plynulý a citlivý pohyb pro bezpečné kličkování mezi bubáky.
                      </div>
                      <div style={{ background: 'rgba(246, 235, 216, 0.1)', border: '1.5px solid rgba(226, 168, 59, 0.45)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.84rem' }}>
                        <strong style={{ color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          ⚡ Akční tlačítko schopnosti:
                        </strong>
                        V pravém dolním rohu. Jakmile se schopnost lovce nabije, rozsvítí se a pulzuje zlatě. Klepnutím ji okamžitě odpálíte!
                      </div>
                      <div style={{ background: 'rgba(246, 235, 216, 0.1)', border: '1.5px solid rgba(226, 168, 59, 0.45)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.84rem' }}>
                        <strong style={{ color: '#FDE68A', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          🧺 Interakce u dědečka a památek:
                        </strong>
                        U Čertova dědečka, kostela, soudku či kapličky se na displeji objeví zřetelné tlačítko pro okamžitou interakci jedním dotykem.
                      </div>
                      <div style={{ background: 'rgba(246, 235, 216, 0.1)', border: '1.5px solid rgba(226, 168, 59, 0.45)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.84rem' }}>
                        <strong style={{ color: '#86EFAC', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          🃏 Přímý výběr karet prstem:
                        </strong>
                        V nůši Čertova dědečka i na Křižovatce rozvoje zbraní stačí klepnout přímo na vybranou kartu. Žádné klávesy ani mačkání čísel.
                      </div>
                    </div>
                  </div>

                  {/* MOBILE ACCESSIBILITY SLIDER CARD */}
                  <div
                    style={{
                      background: '#F6EBD8',
                      border: '3px solid #2B5B84',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#221B17',
                      boxShadow: '3px 3px 0 #1C1613',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2B5B84', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GameIcon icon="gear" size={20} /> Mobilní usnadnění (úroveň 1–10) v Pauze a Nastavení
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4, color: '#221B17' }}>
                      Na dotykových zařízeních je v menu pauzy i v Nastavení výpravy k dispozici posuvník <strong>Mobilní usnadnění (1–10)</strong>:
                      <br />• <strong>Silnější magnet na perníčky a krejcary:</strong> Kořist k vám sama létá z větší dálky, takže nemusíte kličkovat do nebezpečných skrumáží.
                      <br />• <strong>Asistence uhýbání:</strong> Zmenšuje zranitelný bod lovce před střelami bubáků a dává vám větší časovou rezervu na reakci.
                      <br />• <strong>Hraní jednou rukou:</strong> Nastavení úrovně 6–10 je ideální pro pohodlné hraní v MHD nebo při držení mobilu jednou rukou!
                    </p>
                  </div>
                </>
              )}

              {/* KEYBOARD CONTROLS (WHEN KEYBOARD MODE IS ACTIVE) */}
              {controlsInputMode === 'keyboard' && (
                <>
                  {/* MOVEMENT */}
                  <div
                    style={{
                      background: '#F6EBD8',
                      border: '3px solid #1C1613',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#221B17',
                      boxShadow: '3px 3px 0 #1C1613',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2B5B84', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GameIcon icon="boots" size={20} /> Pohyb hrdiny po venkovské krajině
                      </span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span className="keycap">W</span>
                        <span className="keycap">A</span>
                        <span className="keycap">S</span>
                        <span className="keycap">D</span>
                        <span style={{ alignSelf: 'center', fontWeight: 900, color: '#221B17', margin: '0 4px' }}>nebo</span>
                        <span className="keycap">↑</span>
                        <span className="keycap">←</span>
                        <span className="keycap">↓</span>
                        <span className="keycap">→</span>
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                      Pohybujte se po ladovských loukách, zasněžených cestách i hřbitovech. Sledujte varovné nápřahy strašidel, manévrujte v širokých elipsách a sbírejte voňavé perníčky a zlaté krejcary, které po sobě zanechávají zklidnění bubáci.
                    </p>
                  </div>

                  {/* DĚDEČEK INTERACTION */}
                  <div
                    style={{
                      background: '#FEF3C7',
                      border: '3px solid #1C1613',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#221B17',
                      boxShadow: '3px 3px 0 #1C1613',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#8F5330', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GameIcon icon="basket" size={20} /> Otevření nůše Čertova dědečka (Směna perníčků v terénu)
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="keycap keycap-accent">E</span>
                        <span style={{ fontWeight: 800, color: '#6E3B1E', fontSize: '0.9rem' }}>nebo kliknutí myší</span>
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                      Když nasbíráte perníčky, zjeví se velký potulný Čertův dědeček a zavolá <em>„Pssst! Perníčky!“</em>. Přistupte k němu a stiskněte klávesu <strong>E</strong>, nebo klepněte na tlačítko <strong>OTEVŘÍT DĚDEČKOVU NŮŠI</strong>. Hra se pozastaví a perníčky s ním vyměníte za nové zbraně a dary!
                      V nůši můžete bleskově nakupovat klávesami <strong>[1]</strong> až <strong>[4]</strong>, přebalit nabídku klávesou <strong>[R]</strong> a nůši opustit klávesou <strong>[Esc]</strong>.
                    </p>
                  </div>

                  {/* MILESTONE KEYBOARD CONTROLS */}
                  <div
                    style={{
                      background: '#F6EBD8',
                      border: '3px solid #4D784E',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#221B17',
                      boxShadow: '3px 3px 0 #1C1613',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4D784E', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <GameIcon icon="sparkles" size={20} /> Blesková volba milníků zbraní v boji
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="keycap keycap-accent">1</span>
                        <span style={{ alignSelf: 'center', fontWeight: 900, color: '#4D784E' }}>a</span>
                        <span className="keycap keycap-accent">2</span>
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                      Při dosažení <strong>3., 5. a 8. úrovně zbraně</strong> se otevře Křižovatka rozvoje zbraně s výběrem ze dvou unikátních folklórních větví. Nemusíte sundávat ruku z klávesnice – stiskněte <strong>[1]</strong> pro první větev nebo <strong>[2]</strong> pro druhou větev a okamžitě pokračujete v boji!
                    </p>
                  </div>
                </>
              )}

              {/* GAMEPAD CONTROLS (WHEN GAMEPAD MODE IS ACTIVE) */}
              {controlsInputMode === 'gamepad' && (
                <div
                  style={{
                    background: '#F6EBD8',
                    border: '3px solid #2B5B84',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#221B17',
                    boxShadow: '3px 3px 0 #1C1613',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2B5B84', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="gamepad" size={20} /> Plná podpora herního ovladače &amp; Celá obrazovka
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="keycap keycap-accent">Ovladač</span>
                      <span className="keycap">F (Celá obrazovka)</span>
                    </div>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.4 }}>
                    Hra automaticky rozpozná připojený herní ovladač a dynamicky přizpůsobí nápovědy tlačítek v rozhraní:
                    <br />• <strong>Pohyb:</strong> Levá analogová páčka nebo <strong>směrový kříž</strong>.
                    <br />• <strong>Speciální zbraň (schopnost lovce):</strong> Tlačítko <strong>[RB]</strong> nebo <strong>[B]</strong> na ovladači.
                    <br />• <strong>Interakce s okolím (Čertův dědeček, Truhla, Zvonice, Kaplička, Soudek):</strong> Tlačítko <strong>[X]</strong> na ovladači.
                    <br />• <strong>Výběr vylepšení v nabídce:</strong> <strong>Směrový kříž / Levá páčka</strong> přepíná karty, <strong>[A]</strong> potvrdí výběr.
                    <br />• <strong>Pauza a Celá obrazovka:</strong> <strong>[Start]</strong> přepíná pauzu, klávesa <strong>[F]</strong> přepíná celou obrazovku.
                  </p>
                </div>
              )}

              {/* LANDSCAPE INTERACTION CARD */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #4D784E',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#4D784E', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="map" size={20} /> Interakce s prvky krajiny a pamětihodnostmi v terénu
                  </span>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>Dotyk</span>
                    <span style={{ fontWeight: 900, color: '#4D784E', fontSize: '0.9rem' }}>/</span>
                    <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>E</span>
                    <span style={{ fontWeight: 900, color: '#4D784E', fontSize: '0.9rem' }}>/</span>
                    <span className="keycap" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>X (Ovladač)</span>
                  </div>
                </div>
                <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4 }}>
                  Ladovský venkov kolem vás žije a reaguje na každý váš krok! Když se přiblížíte k aktivnímu prvku, objeví se u něj dotykové tlačítko (nebo výzva pro <strong>[E] / [X]</strong>):
                  <br />• <strong>Pamětihodnosti na mapě:</strong> Zazvoňte na <strong>zvonici u kostela</strong> (svatý otřes, léčení a +20 % zbroj), narazte <strong>pivní soudek u hospody</strong> (omráčí dav + 18 % útok) nebo se zastavte u <strong>kapličky na rozcestí</strong> (zjevení rozhání bubáky + 20 % kadence).
                  <br />• <strong>Poklady, pomocníci a anomálie:</strong> Otevírejte <strong>malované truhly</strong> s venkovským kolem štěstí, aktivujte <strong>vzácné folklórní předměty</strong> (Švandovy dudy, Ponocného trouba, Hlt slivovice...), osvobozujte obklíčené <strong>chasníky</strong> a stáním v kruhu zapečeťujte <strong>Bubácké díry</strong>.
                  <br />• <strong>Vliv terénu:</strong> Zorané brázdy na <strong>poli</strong> zrychlují krok (+15 %, pozor na pluh!), <strong>plovoucí ledové kry</strong> na řece zrychlují (+20 %) zatímco hluboká voda mrazí, u <strong>mlýna</strong> kolo drtí v náhonu a moučný prach oslepuje běsy, a <strong>čtyři husté lesy</strong> v rozích poskytují krytí stromů (+15 % obrana i útok).
                </p>
              </div>

              {/* PAUSE */}
              <div
                style={{
                  background: '#FEF3C7',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#6E3B1E' }}>
                    ⏸️ Pauza a odpočinek u milníku kdykoliv během hry
                  </span>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>Tlačítko ⏸️</span>
                    <span style={{ alignSelf: 'center', fontWeight: 900, color: '#6E3B1E' }}>/</span>
                    <span className="keycap" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>P / Esc</span>
                    <span style={{ alignSelf: 'center', fontWeight: 900, color: '#6E3B1E' }}>/</span>
                    <span className="keycap" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>Start</span>
                  </div>
                </div>
                <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                  Klepnutím na tlačítko <strong>⏸️ v horní liště</strong> (nebo stisknutím klávesy <strong>P</strong>, <strong>Esc</strong> či <strong>Start</strong> na ovladači) okamžitě <strong>pozastavíte celou hru</strong>.
                  Při pauze si můžete v klidu prohlédnout svůj arzenál, úroveň zbraní, zbývající Kuráž a získané krejcary,
                  nastavit Mobilní usnadnění, zvuk či výkon, nebo výpravu bezpečně ukončit a odnést kořist do hospody.
                </p>
              </div>

              {/* ULTIMATE ABILITY & 7 HUNTERS */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#C83E2B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="lightning" size={20} /> Speciální zbraň a schopnost lovce (Mistrovský kousek)
                  </span>
                  <span className="keycap keycap-accent" style={{ fontSize: '0.82rem', padding: '2px 10px' }}>
                    {controlsInputMode === 'touch' ? 'Tlačítko ⚡ blesku' : controlsInputMode === 'gamepad' ? 'Tlačítko [RB / B]' : 'Mezerník'}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                  Každý ze 7 venkovských lovců má jedinečnou speciální schopnost, která se postupně nabíjí (při plném nabití se rozzáří ukazatel a tlačítko):
                </p>
                <ul
                  style={{
                    margin: '6px 0 0 16px',
                    padding: 0,
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                  }}
                >
                  <li>
                    <strong>Krajánek:</strong> <em>Jízda na žernovu</em> – naskočí na rotující žulový mlýnský kámen (žernov). Získá <strong>14 s nezranitelnosti</strong>, dvojnásobnou rychlost, na placku drtí běžné bubáky pod limitem Kuráže (400 Kuráže, roste o +20 % za každý nákup u Dědečka), těžším cílům udílí 180 fyzického poškození každých 0,5 s a kolem sebe šíří jiskrovou auru Vůle (75 poškození / 0,5 s v okruhu 85 px, nabíjení 30 s). Výchozí zbraň: Osikový prut.
                  </li>
                  <li>
                    <strong>Tulák:</strong> <em>Pověstná sukovice</em> – otočka sukovitou holí zraní (185 fyzického poškození do 260 px, 55 do 600 px), silně odhodí okolní bubáky, vynuluje jejich postoj a vystraší je až na 4 s (rychlé nabíjení 21 s). Výchozí Kuráž 230, Štěstí 70, startovní zbraň Bylinková fajfka. Pasivně Tulácký instinkt: +35 % k poškození všech zbraní.
                  </li>
                  <li>
                    <strong>Pasáček:</strong> <em>Dusot stáda</em> – pastýřská píšťalka přivolá běžící stádo 22 beranů, které smete nepřátele masivním nárazem (140 fyzického poškození + 3,6 s dupání po 35 poškození, nabíjení 30 s). Vysoká rychlost (220), obří magnet (160) a startovní Povidlové buchty. Výchozí Kuráž 55, avšak disponuje 35% šancí na ÚHYB a 0,6 s nezranitelností po zásahu!
                  </li>
                  <li>
                    <strong>Bába kořenářka:</strong> <em>Očistné kadidlo</em> – vyvolá bylinné útočiště (+55 Kuráže, +30 štít, 1,8 s nezranitelnost), nasákne a zpomalí okolní nepřátele na 4,5 s (120 přírodního poškození + 4,8 s zóna, nabíjení 30 s). Pasivní Bylinný záblesk každých 9 s: obnoví 18 % max. Kuráže, na 3 s zvýší dosah i rychlost magnetu 5× a poskytne nezranitelnost. Začíná s Devaterem kvítí.
                  </li>
                  <li>
                    <strong>Ponocný:</strong> <em>Noční roh a poplach</em> – zatroubí na volský roh, čímž v okruhu 900 px vystraší nepřátele až na 5 s a udělí 110 fyzického poškození (nabíjení 30 s). Pasivně šíří stálou posvátnou Auru lucerny (16 svatého poškození/s v okruhu 85 px). Začíná s Kovanou halapartnou.
                  </li>
                  <li>
                    <strong>Pobožný kostelník:</strong> <em>Farní požehnání</em> – úder kostelního zvonu a sloup svatého světla očistí nemrtvé a démony v okruhu 650 px (běžné nečisté cíle okamžitě vymýtí, bossům ubere 25 % max. Kuráže, nabíjení 35 s). Začíná se Svěcenou kropenkou.
                  </li>
                  <li>
                    <strong>Babička a Barunka:</strong> <em>Chléb se solí a vlídné slovo</em> – zastaví čas pro scénku a zasáhne až do 1 100 px; působí buď jako <strong>Jídlo</strong> (chléb nasytí) nebo <strong>Světlo</strong> (vlídné slovo zažene démony) podle toho, proti čemu má daný bubák menší odolnost (nabíjení 45 s). Vysoké výchozí Štěstí (120) a startovní Kynutý koláč!
                  </li>
                </ul>
              </div>

              {/* AUTO COMBAT */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#4D784E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="sword" size={20} /> Automatická střelba a radost z kosení hord (Radost z převahy)
                </span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                  Všech 18 venkovských zbraní (Osikový prut, Válečnice, Česneková topinka, Kyselá okurka, Povidlové buchty, Formanský bič, Splašený houser, Svěcená kropenka...)
                  <strong> útočí na nepřátele zcela automaticky</strong>! Nemusíte ručně mířit – vy jen kličkujete mezi strašidly,
                  sbíráte perníčky, rozvíjíte zbraně u Čertova dědečka a užíváte si pohled na to, jak vaše výbava čistí celou louku.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: OBJECTIVE, CAMPAIGN & LANDSCAPE */}
          {tabId === 'objective' && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* MAIN GOAL */}
              <div
                className="lada-ex-libris-slip"
                style={{
                  marginTop: '4px',
                  background: '#FEF3C7',
                  border: '3.5px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '4px 4px 0 #1C1613',
                }}
              >
                <span className="lada-brass-pin" aria-hidden="true" />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#C83E2B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="rooster" size={24} /> Hlavní cíl: Přežít výpravu a vyprášit kožich finálnímu bossovi!
                </h3>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.48, minHeight: '58px' }}>
                  <LadaDropCap letter="K" variant="cobalt" />
                  ampaň Bubákova vás provede <strong>8 rozmanitými kraji</strong> – od prosluněného denního tání v Hrusicích přes třeskuté noční mrazy, rozkvetlý dubnový den a staré hamry až po tajemnou Dračí sluj pod Melechovem.
                  Úvodní tři jarní výpravy v Hrusicích trvají <strong>5 minut (300 sekund)</strong>, navazujících 5 výprav pak <strong>6 minut (360 sekund)</strong>.
                  Vydržíte-li naživu do konce a porazíte finálního bosse kraje, rozezní se <strong>večerní klekání zvonu</strong> (při denní výpravě) nebo třikrát hlasitě <strong>zakokrhá vesnický kohout</strong> (při noční výpravě) a úroveň je slavně vyhrána!
                </p>
              </div>

              <LadaLindenVineta />

              {/* EXPEDITION PROGRESSION & PHASES */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#2B5B84', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="clock" size={20} /> Fázování výpravy a příchod bossů:
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      background: '#FAF5E8',
                      border: '2px solid #1C1613',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ fontWeight: 900, color: '#C83E2B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="rooster" size={16} /> Úvod &amp; Miniboss
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                      Začátek výpravy s drobnou polní a lesní havětí. Od <strong>0:25</strong> přichází s nůší Čertův dědeček a v první třetině výpravy (<strong>85 s</strong> v Předjaří / <strong>45 s</strong> v dalších krajích) nastupuje Miniboss kraje!
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#FAF5E8',
                      border: '2px solid #1C1613',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ fontWeight: 900, color: '#6E3B1E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="lantern" size={16} /> Anomálie &amp; Bubácká díra
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                      Uprostřed výpravy (120–175 s) se v zemi otevírá trhlina <strong>Bubácké díry</strong> – postavte se do jejího kruhu a zapečeťte ji dřív, než z ní vyskočí zuřivý netvor! Objevují se též malované truhly a chasníci.
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#FAF5E8',
                      border: '2px solid #1C1613',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ fontWeight: 900, color: '#2B5B84', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="skull" size={16} /> Zlom výpravy &amp; Midboss
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                      V polovině výpravy (<strong>185 s</strong> v Předjaří / <strong>95–105 s</strong> v dalších krajích) nastupuje silný Midboss (Jarní Vodníček, Mrazivý obr, Hastrman, Pekelný dráb...) s obří perníčkovou odměnou.
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#FAF5E8',
                      border: '2px solid #1C1613',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    <div style={{ fontWeight: 900, color: '#C83E2B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="devil" size={16} /> Finální Boss &amp; Vítězství
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                      Vyvrcholení výpravy! Přichází vládce kraje (Hejno mrazivých vran, Morana, Vrchní Filipojakubská Čarodějnice, Půlnoční Hejkal, Skalní obr, Prokletý Mlynář, Bezhlavý rytíř či Tříhlavý Drak). Jeho porážkou vítězíte!
                    </div>
                  </div>
                </div>

                {/* 8-LEVEL CAMPAIGN OVERVIEW */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#FAF5E8',
                    border: '2px solid #1C1613',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  <strong style={{ color: '#2B5B84' }}>Osmidílná cesta Bubákovem:</strong> 1. Předjaří: Denní tání ➔ 2. Předjaří: Noční mrazy ➔ 3. Duben: Dubnový den ➔ 4. Starý hřbitov a hvozd ➔ 5. Ladovská zima na Melechově ➔ 6. Staré hamry a Čertův mlýn ➔ 7. Pustá Hláska ➔ 8. Dračí sluj pod Melechovem.
                </div>
              </div>

              {/* INTERACTIVE LANDMARKS IN THE COUNTRYSIDE */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#4D784E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="compass" size={20} /> Prvky krajiny, se kterými můžete interagovat:
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
                    gap: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ color: '#2B5B84', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <GameIcon icon="bell" size={16} /> Kostel na vrchu [E]:
                    </div>
                    <div style={{ marginTop: 3 }}>
                      Stiskem <strong>[E]</strong> u zvonice vyšlete svatý otřes, vyléčíte si Kuráž a získáte +20 % ke zbroji.
                    </div>
                  </div>
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ color: '#6E3B1E', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <GameIcon icon="beer" size={16} /> Hospoda &amp; Soudek [E]:
                    </div>
                    <div style={{ marginTop: 3 }}>
                      Stiskem <strong>[E]</strong> u pivního soudku omráčíte okolní dav strašidel a načerpáte kuráž (+18 % k útoku).
                    </div>
                  </div>
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ color: '#C83E2B', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <GameIcon icon="sparkles" size={16} /> Kaplička na rozcestí [E]:
                    </div>
                    <div style={{ marginTop: 3 }}>
                      Vyvolá zjevení Panny Marie s Ježíškem, které rozptýlí bubáky a požehná lovci (+20 % rychlost nabíjení zbraní).
                    </div>
                  </div>
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ color: '#4D784E', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <GameIcon icon="wheat" size={16} /> Pole, Škola, Mlýn &amp; Kry:
                    </div>
                    <div style={{ marginTop: 3 }}>
                      Zorané brázdy na poli (+15 % rychlost), čáp na návsi (2× rychlejší ultimátka), rákoska u školy (+20 % útok), mlýnské kolo s moučným prachem a plovoucí ledové kry na vodě (+20 % rychlost).
                    </div>
                  </div>
                </div>
              </div>

              {/* DROPS & COLLECTIBLES */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#221B17', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="basket" size={20} /> Co sbírat na venkovských loukách a cestách:
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
                    gap: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8F5330', fontWeight: 900 }}>
                      <PernicekIcon size={18} />
                      <span>Voňavé perníčky (Pro Dědečka):</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Padají z poražených bubáků (malé 2, velké 6, obří 20 z bossů). Nesebrané kousky na louce se samy slévají do větších perníčků! Slouží k nákupu zbraní a upgradů u Čertova dědečka.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6E3B1E', fontWeight: 900 }}>
                      <KrejcarIcon size="1.25em" />
                      <span>Krejcar a Velký měšec:</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Trvalá měna ukládaná do hospody U Černého kocoura pro stálá obecní vylepšení. Při velkém roji se na bojišti objeví i <strong>Velký měšec krejcarů</strong>, který po cestě pohlcuje drobné mince!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4D784E', fontWeight: 900 }}>
                      <HruskaIcon size="1.25em" />
                      <span>Šťavnaté hrušky &amp; Lektvary:</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Okamžitě zvednou náladu a doplní Kuráž lovce při zranění v boji. Pozor: nesebrané jídlo na zemi po čase vyprchá (před zmizením začne blikat)!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2B5B84', fontWeight: 900 }}>
                      <GameIcon icon="sparkles" size={18} />
                      <span>Folklórní předměty [E]:</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Vzácné dary na bojišti (Kovářská podkova, Hliněný kohoutek, Vyřezávané kukačky, Švandovy dudy, Hlt slivovice, Ponocného trouba, Babiččina zástěra), které stiskem <strong>[E]</strong> rozpoutají mocný efekt!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2B5B84', fontWeight: 900 }}>
                      <GameIcon icon="amphora" size={18} />
                      <span>Hrnce s dušičkami:</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Osvobozují zakleté dušičky zpod hrníčků vodníků, plní výzvy trofejí a s postavenou Kaplí svaté vlny vyvolají mocnou <strong>Posvěcenou rázovou vlnu</strong>!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C83E2B', fontWeight: 900 }}>
                      <GameIcon icon="crate" size={18} />
                      <span>Malované truhly [E]:</span>
                    </div>
                    <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                      Interaktivní venkovský výherní automat! Při otevření klávesou <strong>[E]</strong> se roztočí 3 válce s ladovskými symboly (perníček, jitrnice, podkova, krejcar, truhlička) se štědrými výhrami.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ČERTŮV DĚDEČEK & HIS SACK */}
          {tabId === 'dedecek' && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* HERO CARD FOR DĚDEČEK */}
              <div
                className="lada-ex-libris-slip"
                style={{
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #F2E5C6 100%)',
                  border: '3.5px solid #1C1613',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '4px 4px 0 #1C1613',
                }}
              >
                <span className="lada-brass-pin" aria-hidden="true" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ width: '105px', height: '105px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#FAF5E8', border: '3px solid #1C1613', borderRadius: '10px', boxShadow: '2px 2px 0 #1C1613' }} title="Čertův dědeček s otevřenou nůší">
                    <LadaGrandfatherCanvasPreview size={100} scale={0.7} isInteracting={true} />
                  </div>
                  <div style={{ flex: '1 1 240px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#C83E2B', fontWeight: 900 }}>
                      ČERTŮV DĚDEČEK A JEHO NŮŠE
                    </h3>
                    <p style={{ margin: '6px 0 0 0', fontWeight: 800, color: '#221B17', fontSize: '0.96rem', lineHeight: 1.45, minHeight: '56px' }}>
                      <LadaDropCap letter="P" variant="poppy" />
                      „erníčky mám rád víc než zlato! Ber, dokud nůše voní!“ – Hlavní systém získávání zbraní, milníků a pasivních vylepšení přímo v terénu během výpravy.
                    </p>
                  </div>
                </div>
              </div>

              <LadaLindenVineta />

              {/* HOW HE TRIGGERS & SPAWNS */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#8F5330', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="compass" size={20} /> Jak funguje a jak se spouští Čertův dědeček?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: '#8F5330' }}>1. Podmínka zjevení (Čas &amp; Nasbírané perníčky):</strong>
                    <div>
                      Dědeček se v každé výpravě poprvé zjevuje <strong>od 25. sekundy hry</strong>. Podmínkou je, abyste měli nasbíraný dostatek
                      <strong> voňavých perníčků </strong><PernicekIcon size={16} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }} /> alespoň na nejlevnější položku z jeho nůše. Pokud jste bez perníčků, dědeček v boji nepřekáží.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: '#8F5330' }}>2. Zjevení v terénu &amp; Následování hrdiny:</strong>
                    <div>
                      Jakmile jsou podmínky splněny, dědeček se objeví v příjemné blízkosti lovce (220–280 px) se šibalským zavoláním a hláškou <em>„Pssst! Perníčky!“</em>.
                      Dědeček vás trpělivě následuje, takže vám <strong>nikdy neuteče</strong>, i když zrovna kličkujete před hordou čertů!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: '#8F5330' }}>3. Otevření nůše poblíž dědečka [Klávesa E / X / Kliknutí]:</strong>
                    <div>
                      Přistupte k němu a stiskněte klávesu <strong>E</strong> (nebo <strong>[X]</strong> na ovladači), klikněte myší přímo na dědečka nebo na tlačítko <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="basket" size={16} /> OTEVŘÍT DĚDEČKOVU NŮŠI</strong>.
                      Vstupem do obchodu se celá hra <strong>bezpečně pozastaví</strong>, takže máte klid na výběr.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '8px 12px' }}>
                    <strong style={{ color: '#8F5330' }}>4. Pravidelné návraty (Po 25 sekundách):</strong>
                    <div>
                      Po uzavření obchodu se dědeček na chvíli rozloučí. Po <strong>25 sekundách odpočinku</strong> se při dostatku perníčků znovu vrátí s čerstvou nabídkou!
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT HE OFFERS */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#4D784E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="knapsack" size={20} /> Co v dědečkově nůši najdete? (4 nabídky v každém setkání)
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                  Dědečkova nůše nabízí v každém setkání 4 pečlivě vybrané položky:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                  <div style={{ background: '#FAF5E8', border: '2.5px solid #C83E2B', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#C83E2B', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="sword" size={18} />
                      <span>Garantované zbraně a jejich rozvoj (1–2 v nůši):</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                      V každé nabídce máte jistotu alespoň jedné až dvou zbraní. Můžete odemknout novou zbraň nebo <strong>vylepšit stávající zbraň až na 8. úroveň</strong>:
                      na úrovních <strong>2, 4, 6 a 7</strong> získává zbraň specializovaná vylepšení dle své třídy (sečné, aury, projektilové), a na úrovních <strong>3, 5 a 8</strong> volíte <strong>Milník zbraně</strong> ze 2 větví!
                    </p>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2.5px solid #2B5B84', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#2B5B84', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="knapsack" size={18} />
                      <span>Pasivní posílení, dary a svačiny:</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                      <strong>Sedmimílové krpce</strong> (+20 rychlost), <strong>Krvavé jelito</strong> (+15 % poškození),
                      <strong>Pytlácká petrolejka</strong> (+30 magnet), <strong>Záplatovaný kabát</strong> (+25 max Kuráž), <strong>Opravdová káva</strong> (+15 % nabíjení),
                      <strong>Podkova pro štěstí</strong> (+10 Štěstí), <strong>Maska medvěda</strong> (přeléčení zraňuje), <strong>Tříkrálová křída</strong>, <strong>Perníkové srdce</strong>, <strong>Jetelový čtyřlístek</strong>, <strong>Arcivzácný ananas</strong> a zabijačkové svačiny!
                    </p>
                  </div>
                </div>
              </div>

              {/* KEY TRICKS: WAITING DISCOUNT, LUCK, REROLL, EXEMPTIONS */}
              <div
                style={{
                  background: '#FEF3C7',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#6E3B1E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="spark" size={20} /> Klíčové finty a synergie dědečkova obchodu:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="clock" size={16} /> Čekací sleva (až −30 %):</strong> Čím déle dědeček čeká v terénu, tím levnější má své zboží! Za každou vteřinu jeho čekání klesá cena všech předmětů (až o celých 30 %).
                  </li>
                  <li>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="clover" size={16} /> Vliv ŠTĚSTÍ (Přízeň osudu):</strong> Vyšší hodnota Štěstí lovce poskytuje další stálou slevu (až 20 %) a navíc přihrává do nůše vzácné dary (Arcivzácný ananas, Švandovy dudy, Kominický knoflík, Hlt slivovice...).
                  </li>
                  <li>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="dice" size={16} /> Přebalení nůše [Klávesa R]:</strong> Nehodí se vám nabízené zboží? Tlačítkem <em>Přebalit nůši</em> nebo klávesou <strong>[R]</strong> můžete zboží vyměnit (začíná na 4 perníčcích, poté 8, 16...).
                  </li>
                  <li>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="beer" size={16} /> Svačiny a měšce nezdražují další nákupy:</strong> Každé trvalé vylepšení zvýší cenu budoucích trvalých vylepšení (+50 %), avšak léčivé svačiny (Jitrnice, Pivo, Kořalka, Cikorka), Pekelné měšce krejcarů a vzácné okamžité předměty mají pevnou cenu a <strong>nikdy nezvyšují inflaci nůše</strong>!
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: WEAPONS & ARSENAL (ALL 18 WEAPONS) */}
          {tabId === 'weapons' && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div
                className="lada-ex-libris-slip"
                style={{
                  marginTop: '4px',
                  background: '#FEF3C7',
                  border: '3.5px solid #1C1613',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#221B17',
                  boxShadow: '4px 4px 0 #1C1613',
                }}
              >
                <span className="lada-brass-pin" aria-hidden="true" />
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#4D784E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="sword" size={20} /> Kompletní přehled všech 18 vesnických zbraní
                </h3>
                <p style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, lineHeight: 1.45, minHeight: '54px' }}>
                  <LadaDropCap letter="V" variant="willow" />
                  šechny venkovské zbraně útočí automaticky na nejbližší strašidla. Každou zbraň můžete v nůši Čertova dědečka postupně vylepšit až na <strong>úroveň 8</strong> (s volbou unikátního Milníku zbraně na úrovních 3, 5 a 8):
                </p>
              </div>

              <LadaLindenVineta />

              {/* WEAPONS GRID */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: '10px',
                }}
              >
                {/* VÁLEČNICE */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #C83E2B', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="valecnice" size={32} />
                      <strong style={{ fontSize: '1.05rem', color: '#C83E2B' }}>Válečnice</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#C83E2B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="star" size={13} /> Aura · Omráčení
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Rázná venkovská paní s bukovým válečkem. Obíhá lovce v kruhu (115 px), udílí 1,2 s omráčení, masivní odhození (520), ignoruje 20 % odolností a v okolí zpomaluje bubáky o 25 %.
                  </p>
                </div>

                {/* ČESNEKOVÁ TOPINKA */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #C83E2B', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="cesnekova_topinka" size={32} />
                      <strong style={{ fontSize: '1.05rem', color: '#C83E2B' }}>Česneková topinka</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#C83E2B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="star" size={13} /> Aura · Odhoz
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Štiplavá obranná aura z topinky s česnekem (110 px). Dotírající nepřátele v rychlém rytmu zraňuje, <strong>důrazně je odhazuje (síla 300)</strong> a zpomaluje o 15 %.
                  </p>
                </div>

                {/* KYSELÁ OKURKA */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #4D784E', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="kysela_okurka" size={32} />
                      <strong style={{ fontSize: '1.05rem', color: '#4D784E' }}>Kyselá okurka</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4D784E', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <GameIcon icon="star" size={13} /> Oslabení
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Vystřeluje nakládané okurky do nejbližších bubáků. Zasažený nepřítel zezelená a dostane oslabení:
                    <strong> utrží o +35 % až +50 % vyšší zranění ze všech vašich zbraní</strong>!
                  </p>
                </div>

                {/* POVIDLOVÉ BUCHTY */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="czech_buchta" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Povidlové buchty</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Zlatavé kynuté buchty plněné povidly. Bubáci se na 1,8 s zastaví a mlsají („Ňam, ňam“), a po zásahu navíc vznikne <strong>fialový oblak povidlové vůně</strong> (140 px, 3,5 s) udílející poškození za sekundu!
                  </p>
                </div>

                {/* OSIKOVÝ PRUT */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="osikovy_prut" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Osikový prut</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Rychlý široký sečný oblouk osikového proutí (dosah 115 px). Svižně švihá a odhání dotěrné skřítky a rarášky; při namočení ve vodě získáte <strong>Mokrý prut</strong>.
                  </p>
                </div>

                {/* KOVÁŘSKÉ VIDLE */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="vidle" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Kovářské vidle</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Třízubé kované vidle bodající přímo vpřed. Prorážejí celé zástupy strašidel naráz a udělují vysoké přímé poškození.
                  </p>
                </div>

                {/* KOVANÁ HALAPARTNA */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="kovana_halapartna" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Kovaná halapartna</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Těžká zbraň ponocných se širokým obloukovým záběrem (160 px). Skvělá pro kosení hustých hord nočních stínů a kostlivců.
                  </p>
                </div>

                {/* DŘEVĚNÝ CEP */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="cep" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Dřevěný cep na obilí</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Těžký okovaný cep. Po 1,5 s v pevném postoji automaticky zaměří nejbližší hrozbu, získá +15 % šanci na kritický mlat (až 2,5× poškození a 2,2× odhoz) a vyvolá rázovou vlnu!
                  </p>
                </div>

                {/* DEVATERO KVÍTÍ */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="devatery_kviti" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Devatero kvítí</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Voňavý ochranný věnec bylin natrhaných o svatojánské noci. Vystřeluje byliny v kruhu kolem lovce a zahání dotírající nečisté síly.
                  </p>
                </div>

                {/* SNĚHOVÁ KOULE */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="snowflake" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Sněhová koule</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Salva tuhých koulí z ladovského sněhu. Mrazivý chlad zpomaluje nohy zasaženým strašidlům a dává lovci volný prostor.
                  </p>
                </div>

                {/* KYNUTÝ KOLÁČ */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="kynuty_kolac" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Kynutý koláč</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Slavnostní tvarohový koláč s povidly a mandlemi. Odráživě přeskakuje mezi bubáky a přiměje je zastavit se a mlsat s hláškou „Ňam, ňam“.
                  </p>
                </div>

                {/* HORKÝ BRAMBOR */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="potato" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Horký brambor</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Brambor vytažený přímo ze žhavého popela popálí bubáky a zanechá na zemi kouřící ohnisko zraňující každého, kdo jím projde.
                  </p>
                </div>

                {/* VČELÍ ROJ */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="bees" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Včelí roj z úlu</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Naváděný roj bzučících včel ze špalkového úlu, který sám aktivně vyhledává nejbližší strašidla a neúnavně je bodá.
                  </p>
                </div>

                {/* HROMNIČKA */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="candle" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Hromnička</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Posvěcená hromniční svíce pulzuje posvátným světlem, odtlačuje nepřátele a drtivě pálí nemrtvé i pekelníky.
                  </p>
                </div>

                {/* SVĚCENÁ KROPENKA */}
                <div style={{ background: '#FAF5E8', border: '2.5px solid #1C1613', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <GameIcon icon="star" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#6E3B1E' }}>Svěcená kropenka</strong>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Svěcená voda z kapličky sv. Jiří kropí široký vějíř posvátných kapek. Nemrtví a pekelníci proti ní utrží až 2× vyšší poškození!
                  </p>
                </div>

                {/* BYLINKOVÁ FAJFKA */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #4D784E', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="bylinkova_fajfka" size={30} />
                      <strong style={{ fontSize: '1.05rem', color: '#4D784E' }}>Bylinková fajfka</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4D784E' }}>
                      Dým · Léčení
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Dědečkova hliněná fajfka vypouští oblak bylinného dýmu (110 px), který zraňuje nepřátele, zpomaluje jejich pohyb i útok o 35 % a zároveň <strong>léčí Kuráž lovce</strong>!
                  </p>
                </div>

                {/* FORMANSKÝ BIČ */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #8F5330', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="whip" size={30} />
                      <strong style={{ fontSize: '1.05rem', color: '#8F5330' }}>Formanský bič</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8F5330' }}>
                      Přerušení · Kořist
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Dlouhý kožený bič přednostně švihá po bubácích v nápřahu – <strong>přeruší jejich útok</strong>, ignoruje úhyb a v dráze švihu k vám přitáhne ležící perníčky i krejcary!
                  </p>
                </div>

                {/* SPLAŠENÝ HOUSER */}
                <div style={{ background: '#F6EBD8', border: '2.5px solid #2B5B84', borderRadius: '8px', padding: '10px 14px', boxShadow: '2.5px 2.5px 0 #1C1613' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GameIcon icon="rooster" size={30} />
                      <strong style={{ fontSize: '1.05rem', color: '#2B5B84' }}>Splašený houser</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2B5B84' }}>
                      Štípání · Krejcary
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#221B17' }}>
                    Rozlícený bílý houser z hrusické návsi. S hlasitým syčením pronásleduje strašidla, odráží se mezi nimi, štípe je do lýtek, ruší jim nápřah a vytřásá z nich krejcary!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VILLAGE & TAVERN UPGRADES (ALL 13 BUILDINGS) */}
          {tabId === 'village' && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingRight: '4px',
                boxSizing: 'border-box',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div
                className="lada-ex-libris-slip"
                style={{
                  marginTop: '4px',
                  background: '#FEF3C7',
                  border: '3.5px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '4px 4px 0 #1C1613',
                }}
              >
                <span className="lada-brass-pin" aria-hidden="true" />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#C83E2B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="cottage" size={24} /> Hospoda U Černého kocoura: Obecní vylepšení
                </h3>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.45, minHeight: '56px' }}>
                  <LadaDropCap letter="Ž" variant="poppy" />
                  ádný sesbíraný krejcar nepřijde nazmar! Po každé výpravě navštivte hospodu na návsi a investujte do rozvoje <strong>13 obecních budov</strong>.
                  Každá úroveň budovy zvedne <strong>Obecní přirážku (+20 %)</strong>, ale <strong>všechny investované krejcary si můžete v hospodě kdykoliv 100% bezplatně vrátit</strong> a přerozdělit!
                </p>
              </div>

              <LadaLindenVineta />

              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#2B5B84', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="hammer" size={20} /> Přehled všech 13 obecních budov a jejich trvalých bonusů:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '10px' }}>
                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#4D784E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="cep" size={18} /> Pšeničné lano a polní mez
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Pozorná aura:</strong> +15 % k základnímu dosahu magnetu pro sběr krejcarů a perníčků za úroveň (až +150 %).
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#2B5B84', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="water" size={18} /> Vodní mlýn na náhonu
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Vodní proud:</strong> +3 % k základní rychlosti chůze lovce za každou úroveň (až +50 %).
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#4D784E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="seedling" size={18} /> Hustý borový les
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Zvyk na mokřad:</strong> Výrazně zkracuje trvání promočení a zpomalení z bláta a louží (až o 85 %).
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#6E3B1E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="wall" size={18} /> Kamenné hradby a bašta
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Kamenné zdi:</strong> +10 % k základní maximální Kuráži za úroveň a rostoucí odolnost proti poškození (až 40 %).
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#8F5330', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="hammer" size={18} /> Kovářská výheň
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Výheň:</strong> +2 přímé poškození (přímý přírůstek) ke každému jednotlivému zásahu jakékoliv zbraně za úroveň!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#C83E2B', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="bread" size={18} /> Pekárna u rozpálené pece
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Perníková vůně:</strong> +10 % k hodnotě všech sebraných Perníčků na výpravě za každou úroveň pekárny.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#221B17', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="skull" size={18} /> Hřbitovní brána
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Poklady starých časů:</strong> +10 % k hodnotě Krejcarů a +1 % šance na stříbrný tolar za úroveň (až 25 %).
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#2B5B84', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="bell" size={18} /> Zvonice
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Hlahol zvonu:</strong> +8 % k rychlosti dobíjení speciální schopnosti lovce [Mezerník] za úroveň.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#4D784E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="herbs" size={18} /> Bylinková zahrádka
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Voňavé býlí:</strong> +4 Kuráže automaticky doplňováno každých 5 sekund za každou úroveň zahrádky.
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#C83E2B', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="beer" size={18} /> Šenkýřova kuráž
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Zoufalá kuráž:</strong> Až +25 % k poškození všech zbraní za úroveň úměrně chybějící Kuráži lovce!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#2B5B84', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="water" size={18} /> Návesní studánka
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Pramenitá voda:</strong> +20 % k účinku lektvarů za úroveň a okamžitá nezranitelnost (1,5 až 5 s) po vypití.
                    </div>
                  </div>

                  <div style={{ background: '#FEF3C7', border: '2.5px solid #C83E2B', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#C83E2B', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="church" size={18} /> Kaple svaté vlny
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Svatá vlna:</strong> +8 % svaté poškození za úroveň a při každém osvobození dušičky z hrníčku vyšle posvátnou rázovou vlnu (75 svatého poškození za úroveň v okruhu 350 px)!
                    </div>
                  </div>

                  <div style={{ background: '#FAF5E8', border: '2px solid #1C1613', borderRadius: 6, padding: '9px 12px' }}>
                    <div style={{ fontWeight: 900, color: '#6E3B1E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GameIcon icon="clover" size={18} /> Boží muka u polní cesty
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                      <strong>Přízeň osudu:</strong> +5 % k základnímu Štěstí lovce na výpravě za každou úroveň božích muk.
                    </div>
                  </div>
                </div>
              </div>

              {/* GOLDEN SURVIVAL TIPS */}
              <div
                style={{
                  background: '#F6EBD8',
                  border: '3px solid #1C1613',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  color: '#221B17',
                  boxShadow: '3px 3px 0 #1C1613',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#4D784E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="clover" size={20} /> Zlaté rady pro přežití na českém venkově:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ display: 'inline-flex', marginTop: 2 }}><GameIcon icon="mill" size={16} /></span>
                    <div><strong>Pohybujte se v elipsách a využívejte krajinu:</strong> Zbraně střílejí samy – vy se soustřeďte na plynulý pohyb, všímejte si nápřahů strašidel a berte si na pomoc zvonici u kostela, soudek u hospody či krytí v lesích!</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ display: 'inline-flex', marginTop: 2 }}><GameIcon icon="cesnekova_topinka" size={16} /></span>
                    <div><strong>Kombinujte zbraně na dálku i na blízko:</strong> Česneková topinka, Bylinková fajfka nebo Válečnice vytvoří ochranný kruh kolem lovce, zatímco Kyselá okurka nepřátele oslabí a buchty je donutí mlsat na dálku.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ display: 'inline-flex', marginTop: 2 }}><PernicekIcon size={16} /></span>
                    <div><strong>Směňujte perníčky u Čertova dědečka [E]:</strong> Jakmile nasbíráte perníčky a přijde dědeček, přistupte k němu a stiskněte <strong>E</strong>. Na konci výpravy budete s radostí sledovat, jak váš arzenál kosí celé hordy!</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ display: 'inline-flex', marginTop: 2 }}><GameIcon icon="impact" size={16} /></span>
                    <div><strong>Odveta lovce na blízko:</strong> Kdykoliv vás bubák zasáhne na blízko, automaticky ho odhodíte pryč a uštědříte mu zranění rovné 15 % vaší maximální Kuráže!</div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );

  return (
    <div
      className="overlay"
      style={{ zIndex: 45 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Jak hrát, ovládání a cíl hry"
    >
      <div
        className="panel controls-modal-panel lada-storybook-modal"
        style={{
          maxWidth: '1000px',
          width: '96%',
          maxHeight: 'min(92vh, calc(100dvh - 20px))',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LadaCardCorners variant="callout" showBottomCorners={true} showInnerBorder={false} />

        {/* Running Book Header (Záhlaví otevřené knihy) */}
        <div className="lada-page-running-header" style={{ marginBottom: '6px' }}>
          <span>📖 RADY STARÉHO HOSPODÁŘE</span>
          <span>
            {chapterMeta.folio} · <strong>{chapterMeta.pages}</strong>
          </span>
        </div>

        {/* Title Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2
              style={{
                margin: '0 0 2px 0',
                fontSize: 'clamp(1.15rem, 3.8vw, 1.8rem)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                lineHeight: 1.2,
                color: '#C83E2B',
                textShadow: '2px 2px 0 #1C1613',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <LadaFolkFlower variant="buttercup" size={20} spin />
                <GameIcon icon="game" size={26} />
              </span>
              <span>JAK HRÁT A OVLÁDÁNÍ</span>
              <LadaFolkFlower variant="poppy" size={20} spin="reverse" />
            </h2>
            <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <LadaBotanicalFlourish height={16} />
            </div>
          </div>
          <button
            className="tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '1.1rem',
              minWidth: 'auto',
              minHeight: '38px',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#C83E2B',
              color: '#F6EBD8',
              border: '3px solid #1C1613',
              boxShadow: '3px 3px 0 #1C1613',
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
            title="Zavřít okno"
            aria-label="Zavřít okno"
          >
            <GameIcon icon="cancel" size={16} />
          </button>
        </div>

        {/* Woven Cloth Bookmark Tabs (Látkové záložky kapitol) */}
        <div className="modal-tabs controls-modal-tabs lada-controls-bookmark-bar" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'controls'}
            className={`tab-btn lada-bookmark-ribbon ribbon-poppy ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              switchChapterWithPageTurn('controls');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="game" size={17} /> Jak hrát a ovládání
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'objective'}
            className={`tab-btn lada-bookmark-ribbon ribbon-cobalt ${activeTab === 'objective' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              switchChapterWithPageTurn('objective');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="target" size={17} /> Cíl výpravy a kraje
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'dedecek'}
            className={`tab-btn lada-bookmark-ribbon ribbon-ochre ${activeTab === 'dedecek' ? 'active' : ''}`}
            onClick={() => {
              sound.grandfatherCall();
              switchChapterWithPageTurn('dedecek');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="grandpa" size={17} /> Čertův dědeček
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'weapons'}
            className={`tab-btn lada-bookmark-ribbon ribbon-willow ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              switchChapterWithPageTurn('weapons');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="weapons" size={17} /> Zbraně a výstroj
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'village'}
            className={`tab-btn lada-bookmark-ribbon ribbon-poppy ${activeTab === 'village' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              switchChapterWithPageTurn('village');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="village" size={17} /> Hospoda a obec
            </span>
          </button>
        </div>

        {/* Single-Sheet Book Page Stage */}
        <div className="lada-controls-book-sheet">
          {renderControlsChapterContent(activeTab)}

          {/* Dedicated Sheet Footer Bar for Dog-Eared Corner Peeks (Oslí uši) */}
          <div className="lada-controls-sheet-footer">
            <button
              type="button"
              className="lada-dog-ear-bottom lada-dog-ear-prev"
              onClick={() => handleStepChapter(-1)}
              title="Předchozí kapitola příručky (←)"
              aria-label="Předchozí kapitola příručky"
            >
              <span className="lada-dog-ear-flap" />
              <span className="lada-dog-ear-label">
                ← {CONTROLS_CHAPTER_META[CONTROLS_CHAPTER_ORDER[(activeIdx - 1 + CONTROLS_CHAPTER_ORDER.length) % CONTROLS_CHAPTER_ORDER.length]].shortLabel}
              </span>
            </button>

            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6E3B1E', opacity: 0.85 }}>
              Kapitola {activeIdx + 1} z {CONTROLS_CHAPTER_ORDER.length} · Listujte šipkami ← / →
            </span>

            <button
              type="button"
              className="lada-dog-ear-bottom lada-dog-ear-next"
              onClick={() => handleStepChapter(1)}
              title="Další kapitola příručky (→)"
              aria-label="Další kapitola příručky"
            >
              <span className="lada-dog-ear-label">
                {CONTROLS_CHAPTER_META[CONTROLS_CHAPTER_ORDER[(activeIdx + 1) % CONTROLS_CHAPTER_ORDER.length]].shortLabel} →
              </span>
              <span className="lada-dog-ear-flap" />
            </button>
          </div>
        </div>

        {/* BOTTOM CLOSE BUTTON */}
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <button
            className="lada-btn"
            style={{
              padding: '9px 32px',
              fontSize: '1.12rem',
              background: '#C83E2B',
              color: '#F6EBD8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
          >
            Rozumím a vím, jak na to! <GameIcon icon="sword" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
