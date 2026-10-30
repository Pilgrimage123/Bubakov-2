import React, { useState } from 'react';
import { sound } from '../audio';
import { KrejcarIcon } from './KrejcarIcon';
import { PernicekIcon } from './PernicekIcon';
import { HruskaIcon } from './HruskaIcon';
import { GameIcon } from './GameIcon';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';
import { LadaCardCorners } from './LadaCardCorners';
import { LadaFolkFlower } from './LadaHudBotanicalDecor';
import { LadaGrandfatherCanvasPreview } from './LadaGrandfatherCanvasPreview';
interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'controls',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  React.useEffect(() => {
    if (isOpen) {
      const validTabs = ['controls', 'objective', 'dedecek', 'weapons', 'village'];
      setActiveTab(validTabs.includes(defaultTab) ? defaultTab : 'controls');
    }
  }, [defaultTab, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.coin();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        className="panel"
        style={{
          maxWidth: '960px',
          width: '96%',
          maxHeight: '90vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LadaCardCorners variant="callout" showBottomCorners={true} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LadaFolkFlower variant="buttercup" size={20} spin />
              <GameIcon icon="game" size={28} /> JAK HRÁT, OVLÁDÁNÍ A CÍL HRY
              <LadaFolkFlower variant="poppy" size={20} spin="reverse" />
            </h2>
            <LadaBotanicalFlourish height={18} />
          </div>
          <button
            className="tab-btn"
            style={{
              padding: '6px 12px',
              fontSize: '1.2rem',
              minWidth: 'auto',
            }}
            onClick={() => {
              sound.coin();
              onClose();
            }}
            title="Zavřít okno"
          >
            <GameIcon icon="cancel" size={16} />
          </button>
        </div>

        {/* Modal navigation tabs */}
        <div
          className="modal-tabs"
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <button
            className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('controls');
              sound.coin();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="game" size={18} /> Jak hrát & Ovládání
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'objective' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('objective');
              sound.coin();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="target" size={18} /> Cíl hry, Kraje & Krajina
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'dedecek' ? 'active' : ''}`}
            style={{
              borderColor: activeTab === 'dedecek' ? '#B45309' : undefined,
              boxShadow: activeTab === 'dedecek' ? '0 0 10px rgba(245,158,11,0.5)' : undefined,
            }}
            onClick={() => {
              setActiveTab('dedecek');
              sound.grandfatherCall();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="grandpa" size={18} /> Čertův dědeček & Nůše
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('weapons');
              sound.coin();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="weapons" size={18} /> Zbraně & Arzenál (18)
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'village' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('village');
              sound.coin();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GameIcon icon="village" size={18} /> Vesnice & Hospoda (13)
            </span>
          </button>
        </div>

        {/* TAB 1: HOW TO PLAY, CONTROLS & MOVEMENT */}
        {activeTab === 'controls' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {/* JAK HRÁT: BULLET HEAVEN PO ČESKU */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '3px solid #B45309',
                borderRadius: '10px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '4px 4px 0 var(--ink)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#78350F', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="wheat" size={22} /> Co je to Bubákov a jak hrát? (Bullet Heaven po česku)
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="keycap keycap-accent">WASD / Šipky</span>
                  <span className="keycap keycap-accent">Mezerník</span>
                  <span className="keycap keycap-accent">E</span>
                </div>
              </div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.45, color: '#1F2937' }}>
                <strong>Bubákov</strong> je hra žánru, kterému se říká <strong>bullet heaven</strong> – relativně oddychová záležitost zasazená do pohodové, skoro ladovské atmosféry imaginárního českého venkova. Vaše zbraně <strong>automaticky kosí strašidla</strong> kolem vás a vy jen šikovně uhýbáte, sbíráte kořist a odemykáte vylepšení. Na konci výpravy pak máte čirou radost z toho, jak moc vám to na všechny strany střílí a kolik stovek potvor zvládnete naráz vykosit!
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: '8px',
                  marginTop: '6px',
                }}
              >
                <div style={{ background: '#FFFDF7', border: '2px solid #92400E', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35 }}>
                  <strong style={{ color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <GameIcon icon="lightning" size={16} /> 1. [Mezerník] Speciální zbraň:
                  </strong>
                  Každý lovec má silnou speciální schopnost. Jakmile se dole nabije, odpálíte ji <strong>Mezerníkem</strong> (nebo <strong>[RB / B]</strong> na gamepadu).
                </div>
                <div style={{ background: '#FFFDF7', border: '2px solid #92400E', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35 }}>
                  <strong style={{ color: '#B45309', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <PernicekIcon size={16} /> 2. [E] Perníčky a Čertův dědeček:
                  </strong>
                  Když nasbíráte perníčky z bubáků, přijde za vámi velký <strong>Čertův dědeček</strong>. Poblíž něj stiskněte <strong>E</strong> a vyměňte perníčky za nové zbraně a upgrady!
                </div>
                <div style={{ background: '#FFFDF7', border: '2px solid #92400E', borderRadius: '6px', padding: '8px 10px', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35 }}>
                  <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <GameIcon icon="compass" size={16} /> 3. [E] Interakce s krajinou:
                  </strong>
                  V krajině jde interagovat s řadou prvků – u <strong>kostela, hospody či kapličky</strong>, s <strong>malovanými truhlami</strong> nebo <strong>folklórními předměty</strong> (poblíž stiskněte <strong>E</strong>).
                </div>
              </div>
            </div>

            {/* LANDSCAPE INTERACTION CARD */}
            <div
              style={{
                background: '#F0FDF4',
                border: '3px solid #166534',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="map" size={20} /> Interakce s prvky krajiny a pamětihodnostmi v terénu
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="keycap keycap-accent">E</span>
                  <span style={{ fontWeight: 900, color: '#166534', fontSize: '0.9rem' }}>/</span>
                  <span className="keycap">X (Gamepad)</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.4 }}>
                Ladovský venkov kolem vás žije a reaguje na každý váš krok! Když se přiblížíte k aktivnímu prvku, objeví se u něj výzva pro stisk <strong>[E]</strong> (nebo <strong>[X]</strong> na ovladači):
                <br />• <strong>Pamětihodnosti na mapě [E]:</strong> Zazvoňte na <strong>zvonici u kostela</strong> (svatý otřes, léčení a +20 % zbroj), narazte <strong>pivní soudek u hospody</strong> (omráčí dav + 18 % útok) nebo se zastavte u <strong>kapličky na rozcestí</strong> (zjevení rozhání bubáky + 20 % kadence).
                <br />• <strong>Poklady, pomocníci a anomálie [E]:</strong> Otevírejte <strong>malované truhly</strong> s venkovským výherním automatem, aktivujte <strong>vzácné folklórní předměty</strong> (Švandovy dudy, Ponocného trouba, Hlt slivovice...), osvobozujte obklíčené <strong>chasníky</strong> a stáním v kruhu zapečeťujte <strong>Bubácké díry</strong>.
                <br />• <strong>Vliv terénu:</strong> Zorané brázdy na <strong>poli</strong> zrychlují krok (+15 %, pozor na pluh!), <strong>plovoucí ledové kry</strong> na řece zrychlují (+20 %) zatímco hluboká voda mrazí, u <strong>mlýna</strong> kolo drtí v náhonu a moučný prach oslepuje běsy, a <strong>čtyři husté lesy</strong> v rozích poskytují krytí stromů (+15 % obrana i útok).
              </p>
            </div>

            {/* GAMEPAD & FULLSCREEN */}
            <div
              style={{
                background: '#EFF6FF',
                border: '3px solid #1D4ED8',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#1E40AF', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="gamepad" size={20} /> Plná podpora Gamepadu & Celá obrazovka
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="keycap keycap-accent">Gamepad</span>
                  <span className="keycap">F (Fullscreen)</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.4 }}>
                Hra automaticky rozpozná připojený ovladač (Xbox, PlayStation, Switch Pro) a dynamicky přizpůsobí nápovědy tlačítek v rozhraní:
                <br />• <strong>Pohyb:</strong> Levá analogová páčka (s mrtvou zónou 0.15) nebo <strong>D-Pad</strong> (kombinovaný s <strong>WASD / šipkami</strong>).
                <br />• <strong>Speciální zbraň (schopnost lovce):</strong> Tlačítko <strong>[RB]</strong> nebo <strong>[B]</strong> na gamepadu / <strong>[Mezerník]</strong> na klávesnici.
                <br />• <strong>Interakce s okolím (Čertův dědeček, Truhla, Zvonice, Kaplička, Soudek):</strong> Tlačítko <strong>[X]</strong> na gamepadu / <strong>[E]</strong> na klávesnici.
                <br />• <strong>Výběr vylepšení v menu:</strong> <strong>D-Pad / Levá páčka / A-D / Šipky</strong> přepíná karty, <strong>[A]</strong> nebo <strong>[Enter / Mezerník]</strong> potvrdí výběr.
                <br />• <strong>Pauza a Celá obrazovka:</strong> <strong>[Start]</strong> / <strong>[Esc / P]</strong> přepíná pauzu, klávesa <strong>[F]</strong> přepíná režim celé obrazovky (Fullscreen).
              </p>
            </div>

            {/* PAUSE */}
            <div
              style={{
                background: '#FEF3C7',
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#92400E' }}>
                  ⏸️ Pauza a odpočinek u milníku kdykoliv během hry
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="keycap keycap-accent">P</span>
                  <span style={{ alignSelf: 'center', fontWeight: 900, color: '#78350F' }}>nebo</span>
                  <span className="keycap">Esc</span>
                  <span style={{ alignSelf: 'center', fontWeight: 900, color: '#78350F' }}>/</span>
                  <span className="keycap">Start</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Stisknutím klávesy <strong>P</strong>, <strong>Esc</strong> nebo tlačítka <strong>Start</strong> na gamepadu okamžitě <strong>pozastavíte celou hru</strong>.
                Při pauze si můžete v klidu prohlédnout svůj arzenál, úroveň zbraní, zbývající Kuráž a získané krejcary,
                upravit nastavení plynulosti či zvuku, nebo výpravu bezpečně ukončit a odnést kořist do hospody.
              </p>
            </div>

            {/* DĚDEČEK INTERACTION */}
            <div
              style={{
                background: '#FFFBEB',
                border: '3px solid #D97706',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="basket" size={20} /> Otevření nůše Čertova dědečka (Směna perníčků v terénu)
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="keycap keycap-accent">E</span>
                  <span style={{ fontWeight: 800, color: '#92400E', fontSize: '0.9rem' }}>nebo kliknutí myší</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Když nasbíráte perníčky, zjeví se velký potulný Čertův dědeček a zavolá <em>„Pssst! Perníčky!“</em>. Přistupte k němu a stiskněte klávesu <strong>E</strong>,
                nebo klepněte na tlačítko <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="basket" size={16} /> OTEVŘÍT DĚDEČKOVU NŮŠI</strong>. Hra se pozastaví a perníčky s ním vyměníte za nové zbraně, jejich vylepšení i pasivní dary!
                Přímo v nůši můžete bleskově nakupovat klávesami <strong>[1]</strong> až <strong>[4]</strong>, přebalit nabídku klávesou <strong>[R]</strong> a nůši opustit klávesou <strong>[Esc]</strong>.
              </p>
            </div>

            {/* MILESTONE KEYBOARD CONTROLS */}
            <div
              style={{
                background: '#F0FDF4',
                border: '3px solid #166534',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <GameIcon icon="sparkles" size={20} /> Blesková volba milníků zbraní v boji
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="keycap keycap-accent">1</span>
                  <span style={{ alignSelf: 'center', fontWeight: 900, color: '#166534' }}>a</span>
                  <span className="keycap keycap-accent">2</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Při dosažení <strong>3., 5. a 8. úrovně zbraně</strong> se otevře Křižovatka rozvoje zbraně s výběrem ze dvou unikátních folklórních větví (Plošná větev vs. Razantní větev).
                Nemusíte sundávat ruku z klávesnice – stiskněte <strong>[1]</strong> pro první větev nebo <strong>[2]</strong> pro druhou větev a okamžitě pokračujete v boji!
              </p>
            </div>

            {/* MOVEMENT */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="boots" size={20} /> Pohyb hrdiny po venkovské krajině
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="keycap">W</span>
                  <span className="keycap">A</span>
                  <span className="keycap">S</span>
                  <span className="keycap">D</span>
                  <span style={{ alignSelf: 'center', fontWeight: 900, color: '#333', margin: '0 4px' }}>nebo</span>
                  <span className="keycap">↑</span>
                  <span className="keycap">←</span>
                  <span className="keycap">↓</span>
                  <span className="keycap">→</span>
                </div>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Pohybujte se po ladovských loukách, zasněžených cestách i hřbitovech. Sledujte varovné nápřahy strašidel,
                manévrujte v širokých elipsách a sbírejte voňavé perníčky a zlaté krejcary, které po sobě zanechávají zklidnění bubáci.
              </p>
            </div>

            {/* ULTIMATE ABILITY */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
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
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GameIcon icon="lightning" size={20} /> Speciální zbraň a schopnost lovce (Ultimátum)
                </span>
                <span className="keycap keycap-wide">Mezerník (Space)</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Každý ze 7 venkovských lovců má jedinečnou speciální schopnost, která se postupně nabíjí (při plném nabití se rozzáří ukazatel dole na obrazovce):
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
                  <strong>Krajánek:</strong> <em>Jízda na žernovu</em> – naskočí na rotující žulový mlýnský kámen (žernov). Získá <strong>14 s nezranitelnosti</strong>, dvojnásobnou rychlost, na placku drtí běžné bubáky pod limitem Kuráže (400 HP, roste o +20 % za každý nákup u Dědečka), těžším cílům udílí 180 fyzického poškození každých 0,5 s a kolem sebe šíří jiskrovou auru Vůle (75 dmg / 0,5 s v okruhu 85 px, nabíjení 30 s). Výchozí zbraň: Osikový prut.
                </li>
                <li>
                  <strong>Tulák:</strong> <em>Pověstná sukovice</em> – otočka sukovitou holí zraní (185 fyzického poškození do 260 px, 55 do 600 px), silně odhodí okolní bubáky, vynuluje jejich postoj a vystraší je až na 4 s (rychlé nabíjení 21 s). Výchozí Kuráž 230, Štěstí 70, startovní zbraň Bylinková fajfka. Pasivně Tulácký instinkt: +35 % k poškození všech zbraní.
                </li>
                <li>
                  <strong>Pasáček:</strong> <em>Dusot stáda</em> – pastýřská píšťalka přivolá běžící stádo 22 beranů, které smete nepřátele masivním nárazem (140 fyzického poškození + 3,6 s dupání po 35 dmg, nabíjení 30 s). Vysoká rychlost (220), obří magnet (160) a startovní Povidlové buchty. Výchozí Kuráž 55, avšak disponuje 35% šancí na ÚHYB a 0,6 s nezranitelností po zásahu!
                </li>
                <li>
                  <strong>Bába kořenářka:</strong> <em>Očistné kadidlo</em> – vyvolá bylinné sanctuarium (+55 Kuráže, +30 štít, 1,8 s nezranitelnost), nasákne a zpomalí okolní nepřátele na 4,5 s (120 přírodního poškození + 4,8 s zóna, nabíjení 30 s). Pasivní Bylinný záblesk každých 9 s: obnoví 18 % max. Kuráže, na 3 s zvýší dosah i rychlost magnetu 5× a poskytne nezranitelnost. Začíná s Devaterem kvítí.
                </li>
                <li>
                  <strong>Ponocný:</strong> <em>Noční roh a poplach</em> – zatroubí na volský roh, čímž v okruhu 900 px vystraší nepřátele až na 5 s a udělí 110 fyzického poškození (nabíjení 30 s). Pasivně šíří stálou posvátnou Auru lucerny (16 svatého poškození/s v okruhu 85 px). Začíná s Kovanou halapartnou.
                </li>
                <li>
                  <strong>Pobožný kostelník:</strong> <em>Farní požehnání</em> – úder kostelního zvonu a sloup svatého světla očistí nemrtvé a démony v okruhu 650 px (běžné nečisté cíle okamžitě vymýtí, bossům ubere 25 % max. Kuráže, nabíjení 35 s). Začíná se Svěcenou kropenkou.
                </li>
                <li>
                  <strong>Babička a Barunka:</strong> <em>Chléb se solí a vlídné slovo</em> – zastaví čas pro scénku a zasáhne až do 1 100 px; působí buď jako <strong>Food</strong> (chléb nasytí) nebo <strong>Holy</strong> (vlídné slovo zažene démony) podle toho, proti čemu má daný bubák menší odolnost (nabíjení 45 s). Vysoké výchozí Štěstí (120) a startovní Kynutý koláč!
                </li>
              </ul>
            </div>

            {/* AUTO COMBAT */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="sword" size={20} /> Automatická střelba a radost z kosení hord (Bullet Heaven)
              </span>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Všech 18 venkovských zbraní (Osikový prut, Válečnice, Česneková topinka, Kyselá okurka, Povidlové buchty, Formanský bič, Splašený houser, Svěcená kropenka...)
                <strong> útočí na nepřátele zcela automaticky</strong>! Nemusíte mířit myší – vy jen kličkujete mezi strašidly,
                sbíráte perníčky, rozvíjíte zbraně u Čertova dědečka a užíváte si pohled na to, jak vaše výbava čistí celou louku.
              </p>
            </div>

            {/* TOUCH CONTROLS */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="compass" size={20} /> Dotykové ovládání a Mobilní usnadnění (Mobily a tablety)
              </span>
              <p style={{ margin: '6px 0 0 0', fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Na dotykových zařízeních se automaticky zobrazuje <strong>virtuální joystick</strong> v levém dolním rohu pro plynulý pohyb
                a akční tlačítko pro spuštění speciální schopnosti <GameIcon icon="lightning" size={14} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }} /> vpravo dole. V blízkosti Čertova dědečka či interaktivního prvku se objeví velké tlačítko pro okamžitou interakci.
                V menu pauzy si navíc můžete zapnout <strong>Mobilní usnadnění (1–10)</strong> i na počítači!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: OBJECTIVE, CAMPAIGN & LANDSCAPE */}
        {activeTab === 'objective' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {/* MAIN GOAL */}
            <div
              style={{
                background: '#FEF3C7',
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GameIcon icon="rooster" size={24} /> Hlavní cíl: Přežít výpravu a vyprášit kožich finálnímu bossovi!
              </h3>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.96rem', lineHeight: 1.4 }}>
                Kampaň Bubákova vás provede <strong>8 rozmanitými kraji</strong> – od prosluněného denního tání v Hrusicích přes třeskuté noční mrazy, rozkvetlý dubnový den a staré hamry až po tajemnou Dračí sluj pod Melechovem.
                Úvodní tři jarní výpravy v Hrusicích trvají <strong>5 minut (300 sekund)</strong>, navazujících 5 výprav pak <strong>6 minut (360 sekund)</strong>.
                Vydržíte-li naživu do konce a porazíte finálního bosse kraje, rozezní se <strong>večerní klekání zvonu</strong> (při denní výpravě) nebo třikrát hlasitě <strong>zakokrhá vesnický kohout</strong> (při noční výpravě) a úroveň je slavně vyhrána!
              </p>
            </div>

            {/* EXPEDITION PROGRESSION & PHASES */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    background: '#FFFDF5',
                    border: '2px solid var(--ink)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontWeight: 900, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="rooster" size={16} /> Úvod & Miniboss
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Začátek výpravy s drobnou polní a lesní havětí. Od <strong>0:25</strong> přichází s nůší Čertův dědeček a v první třetině výpravy (<strong>85 s</strong> v Předjaří / <strong>45 s</strong> v dalších krajích) nastupuje Miniboss kraje!
                  </div>
                </div>
                <div
                  style={{
                    background: '#FFFDF5',
                    border: '2px solid var(--ink)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontWeight: 900, color: '#7C2D12', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="lantern" size={16} /> Anomálie & Bubácká díra
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    Uprostřed výpravy (120–175 s) se v zemi otevírá trhlina <strong>Bubácké díry</strong> – postavte se do jejího kruhu a zapečeťte ji dřív, než z ní vyskočí zuřivý netvor! Objevují se též malované truhly a chasníci.
                  </div>
                </div>
                <div
                  style={{
                    background: '#FFFDF5',
                    border: '2px solid var(--ink)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontWeight: 900, color: '#312E81', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="skull" size={16} /> Zlom výpravy & Midboss
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: '2px' }}>
                    V polovině výpravy (<strong>185 s</strong> v Předjaří / <strong>95–105 s</strong> v dalších krajích) nastupuje silný Midboss (Jarní Vodníček, Mrazivý obr, Hastrman, Pekelný dráb...) s obří perníčkovou odměnou.
                  </div>
                </div>
                <div
                  style={{
                    background: '#FFFDF5',
                    border: '2px solid var(--ink)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{ fontWeight: 900, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="devil" size={16} /> Finální Boss & Vítězství
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
                  background: '#FFFDF5',
                  border: '1.5px solid var(--ink)',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: '#1E3A8A' }}>Osmidílná cesta Bubákovem:</strong> 1. Předjaří v Hrusicích – Denní tání ➔ 2. Předjaří v Hrusicích – Noční mrazy ➔ 3. Duben v Hrusicích – Dubnový den ➔ 4. Starý hřbitov a Hrusický hvozd ➔ 5. Ladovská zima na Melechově ➔ 6. Staré hamry a Čertův mlýn ➔ 7. Pustá Hláska a Zlenické podhradí ➔ 8. Dračí sluj pod Melechovskou skálou.
              </div>
            </div>

            {/* INTERACTIVE LANDMARKS IN THE COUNTRYSIDE */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ color: '#1E3A8A', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <GameIcon icon="bell" size={16} /> Kostel na vrchu [E]:
                  </div>
                  <div style={{ marginTop: 3 }}>
                    Stiskem <strong>[E]</strong> u zvonice vyšlete svatý otřes, vyléčíte si Kuráž a získáte +20 % ke zbroji.
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ color: '#92400E', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <GameIcon icon="beer" size={16} /> Hospoda & Soudek [E]:
                  </div>
                  <div style={{ marginTop: 3 }}>
                    Stiskem <strong>[E]</strong> u pivního soudku omráčíte okolní dav strašidel a načerpáte kuráž (+18 % k útoku).
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ color: '#B45309', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <GameIcon icon="sparkles" size={16} /> Kaplička na rozcestí [E]:
                  </div>
                  <div style={{ marginTop: 3 }}>
                    Vyvolá zjevení Panny Marie s Ježíškem, které rozptýlí bubáky a požehná lovci (+20 % rychlost nabíjení zbraní).
                  </div>
                </div>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ color: '#166534', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <GameIcon icon="wheat" size={16} /> Pole, Škola, Mlýn & Kry:
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
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#2A170A', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 900 }}>
                    <PernicekIcon size={18} />
                    <span>Voňavé perníčky (Pro Dědečka):</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Padají z poražených bubáků (malé 2, velké 6, obří 20 z bossů). Nesebrané kousky na louce se samy slévají do větších perníčků! Slouží k nákupu zbraní a upgradů u Čertova dědečka.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 900 }}>
                    <KrejcarIcon size="1.25em" />
                    <span>Krejcar a Velký měšec:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Trvalá měna ukládaná do hospody U Černého kocoura pro stálá obecní vylepšení. Při velkém roji se na bojišti objeví i <strong>Velký měšec krejcarů</strong>, který po cestě pohlcuje drobné mince!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 900 }}>
                    <HruskaIcon size="1.25em" />
                    <span>Šťavnaté hrušky & Lektvary:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Okamžitě zvednou náladu a doplní Kuráž lovce při zranění v boji. Pozor: nesebrané jídlo na zemi po čase vyprchá (před zmizením začne blikat)!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E3A8A', fontWeight: 900 }}>
                    <GameIcon icon="sparkles" size={18} />
                    <span>Folklórní předměty [E]:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Vzácné dary na bojišti (Kovářská podkova, Hliněný kohoutek, Vyřezávané kukačky, Švandovy dudy, Hlt slivovice, Ponocného trouba, Babiččina zástěra), které stiskem <strong>[E]</strong> rozpoutají mocný efekt!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6D28D9', fontWeight: 900 }}>
                    <GameIcon icon="amphora" size={18} />
                    <span>Hrnce s dušičkami:</span>
                  </div>
                  <div style={{ marginTop: '3px', fontSize: '0.84rem' }}>
                    Osvobozují zakleté dušičky zpod hrníčků vodníků, plní výzvy trofejí a s postavenou Kaplí svaté vlny vyvolají mocnou <strong>Posvěcenou rázovou vlnu</strong>!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 900 }}>
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
        {activeTab === 'dedecek' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {/* HERO CARD FOR DĚDEČEK */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '3px solid #B45309',
                borderRadius: '10px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '4px 4px 0 var(--ink)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ width: '105px', height: '105px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#FFFDF7', border: '2px solid #78350F', borderRadius: '10px' }} title="Čertův dědeček s otevřenou nůší">
                  <LadaGrandfatherCanvasPreview size={100} scale={0.7} isInteracting={true} />
                </div>
                <div style={{ flex: '1 1 240px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#78350F', fontWeight: 900 }}>
                    ČERTŮV DĚDEČEK A JEHO NŮŠE
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#92400E', fontSize: '0.98rem' }}>
                    „Perníčky mám rád víc než zlato! Ber, dokud nůše voní!“ – Hlavní systém získávání zbraní, milníků a pasivních upgradů v terénu.
                  </p>
                </div>
              </div>
            </div>

            {/* HOW HE TRIGGERS & SPAWNS */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="compass" size={20} /> Jak funguje a jak se spouští Čertův dědeček?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>1. Podmínka zjevení (Čas & Nasbírané perníčky):</strong>
                  <div>
                    Dědeček se v každé výpravě poprvé zjevuje <strong>od 25. sekundy hry</strong>. Podmínkou je, abyste měli nasbíraný dostatek
                    <strong> voňavých perníčků </strong><PernicekIcon size={16} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }} /> alespoň na nejlevnější položku z jeho nůše. Pokud jste bez perníčků, dědeček v boji nepřekáží.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>2. Zjevení v terénu & Následování hrdiny:</strong>
                  <div>
                    Jakmile jsou podmínky splněny, dědeček se objeví v příjemné blízkosti lovce (220–280 px) se šibalským zavoláním a hláškou <em>„Pssst! Perníčky!“</em>.
                    Dědeček vás trpělivě následuje, takže vám <strong>nikdy neuteče</strong>, i když zrovna kličkujete před hordou čertů!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>3. Otevření nůše poblíž dědečka [Klávesa E / X / Kliknutí]:</strong>
                  <div>
                    Přistupte k němu a stiskněte klávesu <strong>E</strong> (nebo <strong>[X]</strong> na gamepadu), klikněte myší přímo na dědečka nebo na tlačítko <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="basket" size={16} /> OTEVŘÍT DĚDEČKOVU NŮŠI</strong>.
                    Vstupem do obchodu se celá hra <strong>bezpečně pozastaví</strong>, takže máte klid na výběr.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '8px 12px' }}>
                  <strong style={{ color: '#92400E' }}>4. Pravidelné návraty (Po 25 sekundách):</strong>
                  <div>
                    Po uzavření obchodu se dědeček na chvíli rozloučí. Po <strong>25 sekundách odpočinku</strong> se při dostatku perníčků znovu vrátí s čerstvou nabídkou!
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT HE OFFERS */}
            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="knapsack" size={20} /> Co v dědečkově nůši najdete? (4 nabídky v každém setkání)
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                Dědečkova nůše nabízí v každém setkání 4 pečlivě vybrané položky:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFDF5', border: '2px solid #9A3412', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#9A3412', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="sword" size={18} />
                    <span>Garantované zbraně a jejich rozvoj (1–2 v nůši):</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                    V každé nabídce máte jistotu alespoň jedné až dvou zbraní. Můžete odemknout novou zbraň nebo <strong>vylepšit stávající zbraň až na 8. úroveň</strong>:
                    na úrovních <strong>2, 4, 6 a 7</strong> získává zbraň specializovaná vylepšení dle své třídy (sečné, aury, projektilové), a na úrovních <strong>3, 5 a 8</strong> volíte <strong>Milník zbraně</strong> ze 2 větví!
                  </p>
                </div>

                <div style={{ background: '#FFFDF5', border: '2px solid var(--ink)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#1E3A8A', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="knapsack" size={18} />
                    <span>Pasivní posílení, dary a svačiny:</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35 }}>
                    <strong>Sedmimílové krpce</strong> (+20 rychlost), <strong>Krvavé jelito</strong> (+15 % dmg),
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
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="spark" size={20} /> Klíčové finty a synergie dědečkova obchodu:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="clock" size={16} /> Čekací sleva (až −30 %):</strong> Čím déle dědeček čeká v terénu, tím levnější má své zboží! Za každou vteřinu jeho čekání klesá cena všech předmětů (až o celých 30 %).
                </li>
                <li>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="clover" size={16} /> Vliv ŠTĚSTÍ (Luck):</strong> Vyšší hodnota Štěstí lovce poskytuje další stálou slevu (až 20 %) a navíc přihrává do nůše vzácné dary (Arcivzácný ananas, Švandovy dudy, Kominický knoflík, Hlt slivovice...).
                </li>
                <li>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="dice" size={16} /> Přebalení nůše [Klávesa R]:</strong> Nehodí se vám nabízené zboží? Tlačítkem <em>Přebalit nůši</em> nebo klávesou <strong>[R]</strong> můžete zboží vyměnit (začíná na 4 perníčcích, poté 8, 16...).
                </li>
                <li>
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><GameIcon icon="beer" size={16} /> Svačiny a měšce nezdražují další nákupy:</strong> Každý trvalý upgrade zvýší cenu budoucích trvalých vylepšení (+50 %), avšak léčivé svačiny (Jitrnice, Pivo, Kořalka, Cikorka), Pekelné měšce krejcarů a vzácné okamžité předměty mají pevnou cenu a <strong>nikdy nezvyšují inflaci nůše</strong>!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: WEAPONS & ARSENAL (ALL 18 WEAPONS) */}
        {activeTab === 'weapons' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            <div
              style={{
                background: '#FEF3C7',
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="sword" size={20} /> Kompletní přehled všech 18 vesnických zbraní
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                Všechny zbraně útočí automaticky. Každou zbraň můžete v nůši Čertova dědečka vylepšit až na úroveň 8 (s volbou Milníku zbraně na úrovních 3, 5 a 8):
              </p>
            </div>

            {/* WEAPONS GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '10px',
              }}
            >
              {/* VÁLEČNICE */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #C2410C',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="valecnice" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#9A3412' }}>Válečnice</strong>
                  </div>
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <GameIcon icon="star" size={12} /> AURA / OMRÁČENÍ
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Rázná venkovská paní s bukovým válečkem. Obíhá lovce v kruhu (115 px), udílí 1,2 s omráčení, masivní odhození (520), ignoruje 20 % odolností a v okolí zpomaluje bubáky o 25 %.
                </p>
              </div>

              {/* ČESNEKOVÁ TOPINKA */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #C2410C',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="cesnekova_topinka" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#9A3412' }}>Česneková topinka</strong>
                  </div>
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <GameIcon icon="star" size={12} /> AURA / ODHOZ
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Štiplavá obranná aura z topinky s česnekem (110 px). Dotírající nepřátele v rychlém rytmu zraňuje, <strong>důrazně je odhazuje (síla 300)</strong> a zpomaluje o 15 %.
                </p>
              </div>

              {/* KYSELÁ OKURKA */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #C2410C',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="kysela_okurka" size={32} />
                    <strong style={{ fontSize: '1.05rem', color: '#9A3412' }}>Kyselá okurka</strong>
                  </div>
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <GameIcon icon="star" size={12} /> DEBUFF
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Vystřeluje nakládané okurky do nejbližších bubáků. Zasažený nepřítel zezelená a dostane oslabení:
                  <strong> utrží o +35 % až +50 % vyšší zranění ze všech vašich zbraní</strong>!
                </p>
              </div>

              {/* POVIDLOVÉ BUCHTY */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="czech_buchta" size={32} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Povidlové buchty</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Zlatavé kynuté buchty plněné povidly. Bubáci se na 1,8 s zastaví a mlsají („Ňam, ňam“), a po zásahu navíc vznikne <strong>fialový oblak povidlové vůně</strong> (140 px, 3,5 s) udílející poškození za sekundu!
                </p>
              </div>

              {/* OSIKOVÝ PRUT */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="osikovy_prut" size={32} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Osikový prut</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Rychlý široký sečný oblouk osikového proutí (dosah 115 px). Svižně švihá a odhání dotěrné skřítky a rarášky; při namočení ve vodě získáte <strong>Mokrý prut</strong>.
                </p>
              </div>

              {/* KOVÁŘSKÉ VIDLE */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="vidle" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Kovářské vidle</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Třízubé kované vidle bodající přímo vpřed. Prorážejí celé zástupy strašidel naráz a udělují vysoké přímé poškození.
                </p>
              </div>

              {/* KOVANÁ HALAPARTNA */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="kovana_halapartna" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Kovaná halapartna</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Těžká zbraň ponocných se širokým obloukovým záběrem (160 px). Skvělá pro kosení hustých hord nočních stínů a kostlivců.
                </p>
              </div>

              {/* DŘEVĚNÝ CEP */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="cep" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Dřevěný cep na obilí</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Těžký okovaný cep. Po 1,5 s v pevném postoji automaticky zaměří nejbližší hrozbu, získá +15 % šanci na kritický mlat (až 2,5× poškození a 2,2× odhoz) a vyvolá rázovou vlnu!
                </p>
              </div>

              {/* DEVATERO KVÍTÍ */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="devatery_kviti" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Devatero kvítí</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Voňavý ochranný věnec bylin natrhaných o svatojánské noci. Vystřeluje byliny v kruhu kolem lovce a zahání dotírající nečisté síly.
                </p>
              </div>

              {/* SNĚHOVÁ KOULE */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="snowflake" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Sněhová koule</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Salva tuhých koulí z ladovského sněhu. Mrazivý chlad zpomaluje nohy zasaženým strašidlům a dává lovci volný prostor.
                </p>
              </div>

              {/* KYNUTÝ KOLÁČ */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="kynuty_kolac" size={32} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Kynutý koláč</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Slavnostní tvarohový koláč s povidly a mandlemi. Odráživě přeskakuje mezi bubáky a přiměje je zastavit se a mlsat s hláškou „Ňam, ňam“.
                </p>
              </div>

              {/* HORKÝ BRAMBOR */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="potato" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Horký brambor</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Brambor vytažený přímo ze žhavého popela popálí bubáky a zanechá na zemi kouřící ohnisko zraňující každého, kdo jím projde.
                </p>
              </div>

              {/* VČELÍ ROJ */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="bees" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Včelí roj z úlu</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Naváděný roj bzučících včel ze špalkového úlu, který sám aktivně vyhledává nejbližší strašidla a neúnavně je bodá.
                </p>
              </div>

              {/* HROMNIČKA */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="candle" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Hromnička</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Posvěcená hromniční svíce pulzuje posvátným světlem, odtlačuje nepřátele a drtivě pálí nemrtvé i pekelníky.
                </p>
              </div>

              {/* SVĚCENÁ KROPENKA */}
              <div
                style={{
                  background: '#FFFDF5',
                  border: '2px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <GameIcon icon="star" size={30} />
                  <strong style={{ fontSize: '1.05rem', color: '#78350F' }}>Svěcená kropenka</strong>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Svěcená voda z kapličky sv. Jiří kropí široký vějíř posvátných kapek. Nemrtví a pekelníci proti ní utrží až 2× vyšší poškození!
                </p>
              </div>

              {/* BYLINKOVÁ FAJFKA */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #166534',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="bylinkova_fajfka" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#166534' }}>Bylinková fajfka</strong>
                  </div>
                  <span style={{ background: '#DCFCE7', border: '1.5px solid #166534', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#166534' }}>
                    DÝM & LÉČENÍ
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Dědečkova hliněná fajfka vypouští oblak bylinného dýmu (110 px), který zraňuje nepřátele, zpomaluje jejich pohyb i útok o 35 % a zároveň <strong>léčí Kuráž lovce</strong>!
                </p>
              </div>

              {/* FORMANSKÝ BIČ */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #9A3412',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="whip" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#9A3412' }}>Formanský bič</strong>
                  </div>
                  <span style={{ background: '#FEF08A', border: '1.5px solid #CA8A04', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E' }}>
                    PŘERUŠENÍ & KOŘIST
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Dlouhý kožený bič přednostně švihá po bubácích v nápřahu – <strong>přeruší jejich útok</strong>, ignoruje úhyb a v dráze švihu k vám přitáhne ležící perníčky i krejcary!
                </p>
              </div>

              {/* SPLAŠENÝ HOUSER */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2.5px solid #1E40AF',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  boxShadow: '2px 2px 0 var(--ink)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GameIcon icon="rooster" size={30} />
                    <strong style={{ fontSize: '1.05rem', color: '#1E40AF' }}>Splašený houser</strong>
                  </div>
                  <span style={{ background: '#DBEAFE', border: '1.5px solid #1E40AF', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', fontWeight: 900, color: '#1E40AF' }}>
                    ŠTÍPÁNÍ & KREJCARY
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.35, color: '#1F2937' }}>
                  Rozlícený bílý houser z hrusické návsi. S hlasitým syčením pronásleduje strašidla, odráží se mezi nimi, štípe je do lýtek, ruší jim nápřah a vytřásá z nich krejcary!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VILLAGE & TAVERN UPGRADES (ALL 13 BUILDINGS) */}
        {activeTab === 'village' && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            <div
              style={{
                background: '#FEF3C7',
                border: '3px solid #B45309',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GameIcon icon="cottage" size={24} /> Hospoda U Černého kocoura – 13 obecních vylepšení
              </h3>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.94rem', lineHeight: 1.35 }}>
                Žádný sesbíraný krejcar nepřijde nazmar! Po každé výpravě navštivte hospodu na návsi a investujte do rozvoje <strong>13 obecních budov</strong>.
                Každá úroveň budovy zvedne <strong>Obecní přirážku (+20 %)</strong>, ale <strong>všechny investované krejcary si můžete v hospodě kdykoliv 100% bezplatně vrátit</strong> a přerozdělit!
              </p>
            </div>

            <div
              style={{
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GameIcon icon="hammer" size={20} /> Přehled všech 13 obecních budov a jejich trvalých bonusů:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="cep" size={18} /> Pšeničné lano a polní mez
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Pozorná aura:</strong> +15 % k základnímu dosahu magnetu pro sběr krejcarů a perníčků za úroveň (až +150 %).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#1E3A8A', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="water" size={18} /> Vodní mlýn na náhonu
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Vodní proud:</strong> +3 % k základní rychlosti chůze lovce za každou úroveň (až +50 %).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#15803D', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="seedling" size={18} /> Hustý borový les
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Zvyk na mokřad:</strong> Výrazně zkracuje trvání promočení a zpomalení z bláta a louží (až o 85 %).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#78350F', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="wall" size={18} /> Kamenné hradby a bašta
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Kamenné zdi:</strong> +10 % k základní maximální Kuráži za úroveň a rostoucí odolnost proti poškození (až 40 %).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#B45309', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="hammer" size={18} /> Kovářská výheň
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Výheň:</strong> +2 přímé poškození (flat damage) ke každému jednotlivému zásahu jakékoliv zbraně za úroveň!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#C2410C', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="bread" size={18} /> Pekárna u rozpálené pece
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Perníková vůně:</strong> +10 % k hodnotě všech sebraných Perníčků na výpravě za každou úroveň pekárny.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#4B5563', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="skull" size={18} /> Hřbitovní brána
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Poklady starých časů:</strong> +10 % k hodnotě Krejcarů a +1 % šance na stříbrný tolar za úroveň (až 25 %).
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#4338CA', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="bell" size={18} /> Zvonice
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Hlahol zvonu:</strong> +8 % k rychlosti dobíjení speciální schopnosti lovce [Mezerník] za úroveň.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="herbs" size={18} /> Bylinková zahrádka
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Voňavé býlí:</strong> +4 Kuráže automaticky doplňováno každých 5 sekund za každou úroveň zahrádky.
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#991B1B', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="beer" size={18} /> Šenkýřova kuráž
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Zoufalá kuráž:</strong> Až +25 % k poškození všech zbraní za úroveň úměrně chybějící Kuráži lovce!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#0284C7', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="water" size={18} /> Návesní studánka
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Pramenitá voda:</strong> +20 % k účinku lektvarů za úroveň a okamžitá nezranitelnost (1,5 až 5 s) po vypití.
                  </div>
                </div>

                <div style={{ background: '#FEF3C7', border: '2px solid #D97706', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#B45309', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GameIcon icon="church" size={18} /> Kaple svaté vlny
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: '3px' }}>
                    <strong>Svatá vlna:</strong> +8 % svaté poškození za úroveň a při každém osvobození dušičky z hrníčku vyšle posvátnou rázovou vlnu (75 svatého dmg za úroveň v okruhu 350 px)!
                  </div>
                </div>

                <div style={{ background: '#FFFDF5', border: '1.5px solid var(--ink)', borderRadius: 6, padding: '9px 12px' }}>
                  <div style={{ fontWeight: 900, color: '#854D0E', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                background: 'var(--parchment)',
                border: '3px solid var(--ink)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#111111',
                boxShadow: '3px 3px 0 var(--ink)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

        {/* BOTTOM CLOSE BUTTON */}
        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <button
            className="lada-btn"
            style={{
              padding: '10px 32px',
              fontSize: '1.15rem',
              background: 'var(--blood-red)',
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
